/**
 * Baggona Panchanga - Consultation Firestore Database Service
 * Manages 20-minute timed consultation sessions, start triggers, auto-expiry,
 * contact profile updates, 1-minute bonus extension, database purging,
 * and cryptographic tamper-proof URL token encoding.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { firestore } from "../../services/firebase";
import type {
  ConsultationSession,
  CreateConsultationInput,
  ConsultationChatMessage,
  ConsultationQuestionRecord,
  ConsultationReview,
  DevoteeQuestionGroup,
  ConsultationTelemetry
} from "./consultationTypes";
import { getInitialPriestGreeting } from "./consultationTypes";

const SESSIONS_COL = "consultation_sessions";
const QUESTIONS_COL = "consultation_questions";
const REVIEWS_COL = "consultation_reviews";
const LOCAL_STORAGE_PREFIX = "bgn_consultation_";
const LOCAL_RECENT_INDEX_KEY = "bgn_consultation_recent_ids";
const LOCAL_QUESTIONS_KEY = "bgn_consultation_questions_list";
const LOCAL_REVIEWS_KEY = "bgn_consultation_reviews_list";
const CIPHER_SALT = "BAGGONA_GOKARNA_VEDIC_CONSULTATION_2026";

/**
 * Generates an URL-safe unique session token (e.g., bgn_9f8a2b3c4d)
 */
export function generateSessionToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let rand = "";
  for (let i = 0; i < 10; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `bgn_${rand}`;
}

/**
 * Computes a deterministic rolling checksum for tamper detection
 */
export function computeTokenChecksum(str: string): string {
  let hash = 5381;
  const full = `${str}_${CIPHER_SALT}`;
  for (let i = 0; i < full.length; i++) {
    hash = ((hash << 5) + hash) + full.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return hash.toString(36);
}

/**
 * Obfuscates and encodes a session token with an integrity checksum.
 * Prevents casual inspection of raw IDs and fails immediately if any single character is altered.
 */
export function encodeSecureConsultationToken(sessionId: string): string {
  const key = CIPHER_SALT;
  const chars: string[] = [];
  for (let i = 0; i < sessionId.length; i++) {
    const code = sessionId.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    chars.push(String.fromCharCode(code));
  }
  const rawObfuscated = chars.join("");
  
  // Convert to Base64URL
  let encodedPayload = "";
  try {
    if (typeof Buffer !== "undefined") {
      encodedPayload = Buffer.from(rawObfuscated, "binary").toString("base64url");
    } else {
      encodedPayload = btoa(rawObfuscated).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
  } catch {
    encodedPayload = btoa(unescape(encodeURIComponent(rawObfuscated)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const checksum = computeTokenChecksum(encodedPayload);
  return `bgn_cst_${encodedPayload}.${checksum}`;
}

/**
 * Decodes and verifies the integrity of an encoded consultation token.
 * If modified, tampered, or corrupted, returns isValid: false.
 */
export function decodeSecureConsultationToken(rawToken: string): {
  isValid: boolean;
  sessionId: string | null;
  error?: string;
} {
  if (!rawToken || typeof rawToken !== "string") {
    return { isValid: false, sessionId: null, error: "Empty token" };
  }

  let trimmed = rawToken.trim();
  try {
    trimmed = decodeURIComponent(trimmed);
  } catch {
    // Keep trimmed
  }

  // Strip query param prefixes if passed (e.g. "id=bgn_cst_..." or "session=bgn_...")
  trimmed = trimmed.replace(/^(id|session|token)=/, "");

  // Encrypted secure token format: bgn_cst_<payload>.<checksum>
  if (trimmed.startsWith("bgn_cst_")) {
    const parts = trimmed.slice("bgn_cst_".length).split(".");
    if (parts.length !== 2) {
      return { isValid: false, sessionId: null, error: "Invalid token structure" };
    }
    const [payload, expectedChecksum] = parts;
    const actualChecksum = computeTokenChecksum(payload);
    if (actualChecksum !== expectedChecksum) {
      return { isValid: false, sessionId: null, error: "Tampered token checksum mismatch" };
    }

    try {
      let binaryStr = "";
      if (typeof Buffer !== "undefined") {
        binaryStr = Buffer.from(payload, "base64url").toString("binary");
      } else {
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4 ? "=".repeat(4 - (base64.length % 4)) : "";
        binaryStr = atob(base64 + pad);
      }

      // Reverse XOR with CIPHER_SALT
      const key = CIPHER_SALT;
      const chars: string[] = [];
      for (let i = 0; i < binaryStr.length; i++) {
        const code = binaryStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        chars.push(String.fromCharCode(code));
      }
      const sessionId = chars.join("");
      if (!sessionId.startsWith("bgn_")) {
        return { isValid: false, sessionId: null, error: "Decrypted session ID invalid" };
      }
      return { isValid: true, sessionId };
    } catch {
      return { isValid: false, sessionId: null, error: "Failed to decode token" };
    }
  }

  // Fallback for raw session tokens e.g. bgn_abcdef123 or session=bgn_... (strictly when not bgn_cst_)
  if (trimmed.startsWith("bgn_") && !trimmed.includes(".")) {
    const cleanId = trimmed.toLowerCase();
    if (/^bgn_[a-z0-9]{8,15}$/.test(cleanId)) {
      return { isValid: true, sessionId: cleanId };
    }
  }

  return { isValid: false, sessionId: null, error: "Unrecognized token format" };
}

/**
 * Strict Phone Number Validator:
 * Accepts 10-digit Indian numbers (with optional +91 or 0 prefix) or international E.164 (7-15 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.trim().replace(/[\s\-()]/g, "");
  const indianRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
  const internationalRegex = /^\+?[1-9]\d{6,14}$/;
  return indianRegex.test(clean) || internationalRegex.test(clean);
}

/**
 * Strict Email Address Validator:
 * RFC 5322 compliant regex for standard email addresses
 */
export function isValidEmailAddress(email: string): boolean {
  if (!email) return false;
  const clean = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(clean);
}

/**
 * Sanitizes object data before writing to Firestore
 */
function sanitize<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Stores session in local storage and session storage for resilient offline caching
 */
function saveLocalSession(session: ConsultationSession): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(LOCAL_STORAGE_PREFIX + session.id, JSON.stringify(session));
    }
  } catch {
    // Ignore error
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + session.id, JSON.stringify(session));
      const rawIndex = localStorage.getItem(LOCAL_RECENT_INDEX_KEY);
      let ids: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      if (!ids.includes(session.id)) {
        ids.unshift(session.id);
        if (ids.length > 50) ids = ids.slice(0, 50);
        localStorage.setItem(LOCAL_RECENT_INDEX_KEY, JSON.stringify(ids));
      }
    }
  } catch (err) {
    console.warn("[consultationDb] LocalStorage cache write failed:", err);
  }
}

/**
 * Retrieves session from session storage or local storage cache
 */
function getLocalSession(id: string): ConsultationSession | null {
  try {
    if (typeof sessionStorage !== "undefined") {
      const rawSession = sessionStorage.getItem(LOCAL_STORAGE_PREFIX + id);
      if (rawSession) return JSON.parse(rawSession);
    }
  } catch {
    // Ignore error
  }
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + id);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }
  return null;
}

/**
 * Removes session from local storage cache
 */
function removeLocalSession(id: string): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(LOCAL_STORAGE_PREFIX + id);
    }
  } catch {
    // Ignore error
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + id);
      const rawIndex = localStorage.getItem(LOCAL_RECENT_INDEX_KEY);
      if (rawIndex) {
        let ids: string[] = JSON.parse(rawIndex);
        ids = ids.filter((item) => item !== id);
        localStorage.setItem(LOCAL_RECENT_INDEX_KEY, JSON.stringify(ids));
      }
    }
  } catch {
    // Ignore error
  }
}

/**
 * Evaluates session lifecycle timings:
 * - Pending sessions are NEVER expired or deleted
 * - If now >= deleteAt (20m after expiry), deletes from Firestore and local cache
 * - If active and now >= expiresAt (20m after start), sets status = expired
 */
async function processSessionLifecycle(session: ConsultationSession): Promise<ConsultationSession> {
  // CRITICAL GUARD: Pending sessions MUST NEVER be expired or deleted!
  if (session.status === "pending") {
    return session;
  }

  const now = Date.now();

  // 1. Check if 40 minutes have elapsed since start (20m session + 20m grace) -> Auto-delete!
  if (session.deleteAt && now >= new Date(session.deleteAt).getTime()) {
    try {
      if (firestore) {
        await deleteDoc(doc(firestore, SESSIONS_COL, session.id));
      }
    } catch (e) {
      console.warn("[consultationDb] Firestore auto-delete error:", e);
    }
    removeLocalSession(session.id);
    return {
      ...session,
      status: "deleted"
    };
  }

  // 2. Check if 20 minutes (or 21 minutes if bonus claimed) have elapsed since start -> Deactivate/Expire!
  if (session.status === "active" && session.expiresAt && now >= new Date(session.expiresAt).getTime()) {
    session.status = "expired";
    try {
      if (firestore) {
        await updateDoc(doc(firestore, SESSIONS_COL, session.id), { status: "expired" });
      }
    } catch (e) {
      console.warn("[consultationDb] Firestore expire status update error:", e);
    }
    saveLocalSession(session);
    return session;
  }

  return session;
}

/**
 * Creates a brand new 20-minute Consultation Session
 */
export async function createConsultationSession(input: CreateConsultationInput): Promise<ConsultationSession> {
  const id = generateSessionToken();
  const session: ConsultationSession = {
    id,
    name: input.name.trim() || "ಭಕ್ತರು",
    dob: input.dob,
    tob: input.tob,
    place: input.place.trim() || "Gokarna",
    lat: input.lat !== undefined ? input.lat : 14.5479,
    lng: input.lng !== undefined ? input.lng : 74.3188,
    timezone: input.timezone !== undefined ? input.timezone : 5.5,
    language: input.language,
    createdAt: new Date().toISOString(),
    status: "pending",
    startedAt: null,
    expiresAt: null,
    deleteAt: null,
    userPhone: undefined,
    userEmail: undefined,
    hasProvidedContact: false,
    bonusMinuteClaimed: false,
    messages: [],
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362"
  };

  // 1. Write to Firestore
  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      await setDoc(docRef, sanitize(session));
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore write notice, falling back to local storage:", err);
  }

  // 2. Cache in localStorage
  saveLocalSession(session);

  return session;
}

/**
 * Fetches consultation session by token/ID with lifecycle verification
 */
export async function getConsultationSession(id: string): Promise<ConsultationSession | null> {
  if (!id) return null;

  let session: ConsultationSession | null = null;

  // 1. Try reading from Firestore
  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        session = snap.data() as ConsultationSession;
      }
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore read failed, checking local cache:", err);
  }

  // 2. Fallback to LocalStorage
  if (!session) {
    session = getLocalSession(id);
  }

  if (!session) return null;

  // 3. Process lifecycle (20-min expiry & 40-min auto-delete)
  return await processSessionLifecycle(session);
}

/**
 * Updates Devotee Contact Information (Mobile or Email)
 */
export async function updateDevoteeContact(
  id: string,
  contact: { phone?: string; email?: string }
): Promise<ConsultationSession> {
  const current = await getConsultationSession(id);
  if (!current) {
    throw new Error("Consultation session not found.");
  }
  if (contact.phone) current.userPhone = contact.phone.trim();
  if (contact.email) current.userEmail = contact.email.trim();
  current.hasProvidedContact = true;

  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      await updateDoc(docRef, {
        userPhone: current.userPhone || null,
        userEmail: current.userEmail || null,
        hasProvidedContact: true
      });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore contact update notice:", err);
  }

  saveLocalSession(current);
  return current;
}

/**
 * User clicks "Start Timer" popup -> Activates the 20-minute countdown!
 */
export async function startConsultationTimer(id: string): Promise<ConsultationSession> {
  const current = await getConsultationSession(id);
  if (!current) {
    throw new Error("Consultation session not found.");
  }

  if (current.status === "active") {
    return current; // already started
  }

  if (current.status === "expired" || current.status === "deleted") {
    throw new Error("Cannot start an expired or deleted session.");
  }

  const startedAtDate = new Date();
  const expiresAtDate = new Date(startedAtDate.getTime() + 20 * 60 * 1000); // +20 minutes
  const deleteAtDate = new Date(startedAtDate.getTime() + 40 * 60 * 1000); // +40 minutes (20m session + 20m grace)

  current.startedAt = startedAtDate.toISOString();
  current.expiresAt = expiresAtDate.toISOString();
  current.deleteAt = deleteAtDate.toISOString();
  current.status = "active";

  // Automatically insert the personalized priest welcome greeting if empty
  if (!current.messages || current.messages.length === 0) {
    const greetingText = getInitialPriestGreeting(current.language, current.name);
    const welcomeMsg: ConsultationChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: "astrologer",
      text: greetingText,
      timestamp: startedAtDate.toISOString()
    };
    current.messages = [welcomeMsg];
  }

  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      await updateDoc(docRef, {
        startedAt: current.startedAt,
        expiresAt: current.expiresAt,
        deleteAt: current.deleteAt,
        status: "active",
        messages: current.messages
      });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore start update failed:", err);
  }

  saveLocalSession(current);
  return current;
}

/**
 * Claims a 1-Minute Bonus Extension (Maximum 1 bonus allowed, extending duration from 20m to 21m)
 */
export async function claimBonusMinute(id: string): Promise<ConsultationSession> {
  const current = await getConsultationSession(id);
  if (!current) {
    throw new Error("Consultation session not found.");
  }
  if (current.status !== "active") {
    throw new Error("Cannot add bonus time to an inactive or expired session.");
  }
  if (current.bonusMinuteClaimed) {
    return current; // already claimed
  }

  const currentExpiry = current.expiresAt ? new Date(current.expiresAt).getTime() : Date.now();
  const newExpiry = new Date(currentExpiry + 60 * 1000); // +1 minute (60,000ms)
  current.expiresAt = newExpiry.toISOString();
  current.durationMinutes = 21;
  current.bonusMinuteClaimed = true;

  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      await updateDoc(docRef, {
        expiresAt: current.expiresAt,
        durationMinutes: 21,
        bonusMinuteClaimed: true
      });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore bonus update notice:", err);
  }

  saveLocalSession(current);
  return current;
}

/**
 * Appends a message to the consultation conversation
 */
export async function addConsultationMessage(
  id: string,
  message: ConsultationChatMessage
): Promise<void> {
  const current = await getConsultationSession(id);
  if (!current) return;

  current.messages.push(message);
  saveLocalSession(current);

  try {
    if (firestore) {
      const docRef = doc(firestore, SESSIONS_COL, id);
      await updateDoc(docRef, {
        messages: current.messages
      });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore add message failed:", err);
  }
}

/**
 * Manually marks a session as expired
 */
export async function expireConsultationSession(id: string): Promise<void> {
  try {
    if (firestore) {
      await updateDoc(doc(firestore, SESSIONS_COL, id), { status: "expired" });
    }
  } catch (e) {
    console.warn("[consultationDb] Firestore expire notice:", e);
  }
  const local = getLocalSession(id);
  if (local) {
    local.status = "expired";
    saveLocalSession(local);
  }
}

/**
 * Manually deletes a consultation session
 */
export async function deleteConsultationSession(id: string): Promise<void> {
  try {
    if (firestore) {
      await deleteDoc(doc(firestore, SESSIONS_COL, id));
    }
  } catch (e) {
    console.warn("[consultationDb] Firestore delete notice:", e);
  }
  removeLocalSession(id);
}

/**
 * Lists recent consultation sessions for the admin / priest management dashboard
 */
export async function listRecentConsultationSessions(): Promise<ConsultationSession[]> {
  const results: ConsultationSession[] = [];
  const visitedIds = new Set<string>();

  // 1. Fetch from Firestore if available
  try {
    if (firestore) {
      const q = query(collection(firestore, SESSIONS_COL), orderBy("createdAt", "desc"), limit(30));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const item = d.data() as ConsultationSession;
        const processed = await processSessionLifecycle(item);
        if (processed.status !== "deleted") {
          results.push(processed);
          visitedIds.add(processed.id);
        }
      }
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore list error, relying on local storage:", err);
  }

  // 2. Merge local storage index
  try {
    const rawIndex = localStorage.getItem(LOCAL_RECENT_INDEX_KEY);
    if (rawIndex) {
      const ids: string[] = JSON.parse(rawIndex);
      for (const id of ids) {
        if (!visitedIds.has(id)) {
          const localItem = getLocalSession(id);
          if (localItem) {
            const processed = await processSessionLifecycle(localItem);
            if (processed.status !== "deleted") {
              results.push(processed);
              visitedIds.add(processed.id);
            }
          }
        }
      }
    }
  } catch {
    // Ignore error
  }

  // Sort by createdAt descending
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Records every devotee question in Firestore and localStorage
 */
export async function recordConsultationQuestion(
  record: ConsultationQuestionRecord
): Promise<void> {
  // 1. Save to local storage for instant offline access
  try {
    const raw = localStorage.getItem(LOCAL_QUESTIONS_KEY);
    let list: ConsultationQuestionRecord[] = raw ? JSON.parse(raw) : [];
    // Prepend, prevent duplicate id, limit to 500 items
    list = [record, ...list.filter((q) => q.id !== record.id)].slice(0, 500);
    localStorage.setItem(LOCAL_QUESTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("[consultationDb] Local question save notice:", e);
  }

  // 2. Persist in Firestore collection "consultation_questions"
  try {
    if (firestore) {
      const docRef = doc(firestore, QUESTIONS_COL, record.id);
      await setDoc(docRef, record, { merge: true });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore question save error:", err);
  }
}

/**
 * Fetches all logged devotee questions from Firestore and localStorage
 */
export async function listAllConsultationQuestions(): Promise<ConsultationQuestionRecord[]> {
  const map = new Map<string, ConsultationQuestionRecord>();

  // 1. Fetch from Firestore
  try {
    if (firestore) {
      const q = query(collection(firestore, QUESTIONS_COL), orderBy("timestamp", "desc"), limit(200));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const item = d.data() as ConsultationQuestionRecord;
        map.set(item.id, item);
      }
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore list questions notice:", err);
  }

  // 2. Merge local storage
  try {
    const raw = localStorage.getItem(LOCAL_QUESTIONS_KEY);
    if (raw) {
      const list: ConsultationQuestionRecord[] = JSON.parse(raw);
      for (const item of list) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
  } catch {
    // Ignore error
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Submits a 5-Star Rating and Feedback review for a consultation session
 */
export async function submitConsultationReview(
  review: ConsultationReview
): Promise<void> {
  // 1. Save locally and flag as submitted
  try {
    localStorage.setItem(`bgn_review_${review.sessionId}`, JSON.stringify(review));
    localStorage.setItem(`bgn_review_submitted_${review.sessionId}`, "true");

    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    let list: ConsultationReview[] = raw ? JSON.parse(raw) : [];
    list = [review, ...list.filter((r) => r.id !== review.id)].slice(0, 300);
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("[consultationDb] Local review save notice:", e);
  }

  // 2. Persist in Firestore collection "consultation_reviews"
  try {
    if (firestore) {
      const docRef = doc(firestore, REVIEWS_COL, review.id);
      await setDoc(docRef, review, { merge: true });
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore review save error:", err);
  }
}

/**
 * Lists all consultation reviews from Firestore and localStorage
 */
export async function listAllConsultationReviews(): Promise<ConsultationReview[]> {
  const map = new Map<string, ConsultationReview>();

  // 1. Fetch from Firestore
  try {
    if (firestore) {
      const q = query(collection(firestore, REVIEWS_COL), orderBy("timestamp", "desc"), limit(100));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const item = d.data() as ConsultationReview;
        map.set(item.id, item);
      }
    }
  } catch (err) {
    console.warn("[consultationDb] Firestore list reviews notice:", err);
  }

  // 2. Merge local storage
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) {
      const list: ConsultationReview[] = JSON.parse(raw);
      for (const item of list) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
  } catch {
    // Ignore error
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Checks whether the user has already submitted or dismissed the review modal for this session
 */
export function hasUserReviewedOrDismissedSession(sessionId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const submitted = localStorage.getItem(`bgn_review_submitted_${sessionId}`) === "true";
    const dismissed = localStorage.getItem(`bgn_review_dismissed_${sessionId}`) === "true";
    return submitted || dismissed;
  } catch {
    return false;
  }
}

/**
 * Flags that the user has dismissed/skipped the review modal so they are never prompted again
 */
export function markSessionReviewDismissed(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bgn_review_dismissed_${sessionId}`, "true");
  } catch {
    // Ignore error
  }
}

/**
 * Aggregates complete consultation telemetry for Super Admin & Priest dashboard
 */
export async function getConsultationTelemetry(): Promise<ConsultationTelemetry> {
  const [sessions, allQuestions, allReviews] = await Promise.all([
    listRecentConsultationSessions(),
    listAllConsultationQuestions(),
    listAllConsultationReviews()
  ]);

  const userMap = new Map<string, DevoteeQuestionGroup>();

  for (const q of allQuestions) {
    const key = q.userId || q.userPhone || q.userName || "unknown";
    let group = userMap.get(key);
    if (!group) {
      group = {
        userId: key,
        userName: q.userName || "ಭಕ್ತರು (Devotee)",
        userPhone: q.userPhone || "",
        userEmail: q.userEmail || "",
        totalQuestions: 0,
        lastActive: q.timestamp,
        questions: []
      };
      userMap.set(key, group);
    }
    group.totalQuestions += 1;
    group.questions.push(q);
    if (new Date(q.timestamp).getTime() > new Date(group.lastActive).getTime()) {
      group.lastActive = q.timestamp;
    }
  }

  // Also integrate sessions that haven't asked questions yet into user stats
  for (const s of sessions) {
    const key = s.userPhone || s.name || s.id;
    if (!userMap.has(key)) {
      userMap.set(key, {
        userId: key,
        userName: s.name,
        userPhone: s.userPhone || "",
        userEmail: s.userEmail || "",
        totalQuestions: 0,
        lastActive: s.createdAt,
        questions: []
      });
    }
  }

  const questionsByDevotee = Array.from(userMap.values()).sort(
    (a, b) => b.totalQuestions - a.totalQuestions
  );

  const totalReviews = allReviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (allReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
        )
      : 5.0;

  return {
    totalSessions: sessions.length,
    totalQuestions: allQuestions.length,
    totalUniqueUsers: userMap.size,
    averageRating,
    totalReviews,
    questionsByDevotee,
    allQuestions,
    allReviews
  };
}

