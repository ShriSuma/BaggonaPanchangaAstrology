/**
 * Devotee User Registration, Profile & Cloud Synchronization Service
 * 
 * Handles:
 * 1. Automatic verification & registration of devotees into Cloud Firestore `users` collection
 *    upon calendar redirection / URL clicks.
 * 2. Devotee contact details verification (checking if Phone or Email is stored in database).
 * 3. Secure contact details update (saving Phone & Email to Firestore and dismissing pop-ups permanently).
 * 4. Cloud-synchronized Pooja streak management tied uniquely to each devotee across devices.
 */

import { firestore } from "../../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import type { UserProfileDoc } from "../../db/firestoreDb";
import { isTestEnvironment, isMockDevotee } from "../../utils/testEnvGuard";

export interface DevoteeRegistrationParams {
  name: string;
  dob?: string;
  tob?: string;
  gotra?: string;
  rashi?: string;
  rashiIndex?: number;
  nakshatra?: string;
  nakshatraIndex?: number;
  pincode?: string;
  phone?: string;
  email?: string;
  token?: string;
  source?: string;
}

export interface DevoteeUserRecord extends UserProfileDoc {
  dob?: string;
  tob?: string;
  gotra?: string;
  rashi?: string;
  rashiIndex?: number;
  nakshatra?: string;
  nakshatraIndex?: number;
  pincode?: string;
  currentStreak?: number;
  highestStreak?: number;
  lastSankalpaDate?: string;
  totalSankalpas?: number;
  lastVisitAt?: string;
}

/**
 * Computes a deterministic, clean Devotee Key / User ID.
 */
export function getDevoteeUserId(params: { name: string; dob?: string; tob?: string; token?: string }): string {
  const cleanName = (params.name || "devotee").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
  const cleanDob = (params.dob || "").trim().replace(/[^0-9]/g, "");
  const cleanTob = (params.tob || "").trim().replace(/[^0-9]/g, "");

  if (cleanDob) {
    return `devotee_${cleanName}_${cleanDob}${cleanTob ? `_${cleanTob}` : ""}`;
  }

  if (params.token) {
    const tokenHash = params.token.slice(0, 32).replace(/[^a-zA-Z0-9_-]/g, "");
    return `devotee_${cleanName}_${tokenHash}`;
  }

  return `devotee_${cleanName}`;
}

/**
 * Checks if the user profile already contains a valid phone number OR email address.
 */
export function hasDevoteeContactDetails(user: DevoteeUserRecord | null | undefined): boolean {
  if (!user) return false;
  const hasPhone = Boolean(user.phone && user.phone.trim().replace(/[^\d]/g, "").length >= 10);
  const hasEmail = Boolean(user.email && user.email.trim().length >= 5 && user.email.includes("@") && user.email.includes("."));
  return hasPhone || hasEmail;
}

function cleanFirestoreObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      cleaned[k] = v;
    }
  }
  return cleaned as Partial<T>;
}

/**
 * Checks if the devotee exists in Firestore `users` collection.
 * If not present, adds the devotee to Firestore immediately.
 * If present, updates `lastVisitAt` and returns the existing profile with contact details and streak info.
 */
export async function checkAndRegisterDevoteeUser(params: DevoteeRegistrationParams): Promise<DevoteeUserRecord> {
  const devoteeId = getDevoteeUserId(params);
  const nowIso = new Date().toISOString();

  const fallbackRecord: DevoteeUserRecord = {
    id: devoteeId,
    username: devoteeId,
    name: params.name || "Devotee",
    role: "devotee",
    dob: params.dob || "",
    tob: params.tob || "",
    gotra: params.gotra || "ಕಾಶ್ಯಪ",
    rashi: params.rashi || "",
    rashiIndex: params.rashiIndex ?? -1,
    nakshatra: params.nakshatra || "",
    nakshatraIndex: params.nakshatraIndex ?? -1,
    pincode: params.pincode || "",
    phone: params.phone || "",
    email: params.email || "",
    currentStreak: 1,
    highestStreak: 1,
    lastSankalpaDate: "",
    totalSankalpas: 0,
    createdAt: nowIso,
    lastVisitAt: nowIso
  };

  // 1. Read local cache first for instant UI response
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(`baggona_devotee_user_${devoteeId}`);
      if (cached) {
        Object.assign(fallbackRecord, JSON.parse(cached));
      }
    } catch {}
  }

  if (!firestore || isTestEnvironment() || isMockDevotee(devoteeId) || isMockDevotee(params.name)) {
    return fallbackRecord;
  }

  try {
    const userDocRef = doc(firestore, "users", devoteeId);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const existingData = snap.data() as DevoteeUserRecord;

      // If users doc doesn't have phone or email, check calendarDevoteeEngagement
      if (!existingData.phone && !existingData.email) {
        try {
          const engDocRef = doc(firestore, "calendarDevoteeEngagement", devoteeId);
          const engSnap = await getDoc(engDocRef);
          if (engSnap.exists()) {
            const engData = engSnap.data();
            if (engData.phone && !existingData.phone) existingData.phone = engData.phone;
            if (engData.email && !existingData.email) existingData.email = engData.email;
          }
        } catch {}
      }

      // If params have phone/email from token/URL and existingData is missing them, enrich
      if (params.phone && !existingData.phone) existingData.phone = params.phone;
      if (params.email && !existingData.email) existingData.email = params.email;

      const merged: DevoteeUserRecord = {
        ...fallbackRecord,
        ...existingData,
        // Update visit timestamp
        lastVisitAt: nowIso
      };

      // Background update of lastVisitAt and merged contact details
      const updates: Record<string, any> = { lastVisitAt: nowIso };
      if (merged.phone && !existingData.phone) updates.phone = merged.phone;
      if (merged.email && !existingData.email) updates.email = merged.email;

      void updateDoc(userDocRef, updates).catch(() => {});

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`baggona_devotee_user_${devoteeId}`, JSON.stringify(merged));
          if (hasDevoteeContactDetails(merged)) {
            localStorage.setItem(`baggona_contact_collected_${devoteeId}`, "true");
          }
        } catch {}
      }

      return merged;
    } else {
      // Check if calendarDevoteeEngagement has existing contact details before creating fresh
      try {
        const engDocRef = doc(firestore, "calendarDevoteeEngagement", devoteeId);
        const engSnap = await getDoc(engDocRef);
        if (engSnap.exists()) {
          const engData = engSnap.data();
          if (engData.phone && !fallbackRecord.phone) fallbackRecord.phone = engData.phone;
          if (engData.email && !fallbackRecord.email) fallbackRecord.email = engData.email;
        }
      } catch {}

      // Create new user in Firestore with sanitized data
      const cleanData = cleanFirestoreObject({
        ...fallbackRecord,
        createdAt: nowIso,
        lastVisitAt: nowIso,
        serverTimestamp: serverTimestamp()
      });
      await setDoc(userDocRef, cleanData);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`baggona_devotee_user_${devoteeId}`, JSON.stringify(fallbackRecord));
          if (hasDevoteeContactDetails(fallbackRecord)) {
            localStorage.setItem(`baggona_contact_collected_${devoteeId}`, "true");
          }
        } catch {}
      }

      return fallbackRecord;
    }
  } catch (err) {
    console.warn("[DevoteeUserService] Firestore check/register error:", err);
    return fallbackRecord;
  }
}

/**
 * Updates the devotee's phone number and/or email address in Firestore and local storage.
 */
export async function updateDevoteeContact(
  devoteeId: string,
  contact: { phone?: string; email?: string }
): Promise<{ success: boolean; updatedUser?: DevoteeUserRecord }> {
  const cleanPhone = (contact.phone || "").trim();
  const cleanEmail = (contact.email || "").trim().toLowerCase();
  const nowIso = new Date().toISOString();

  let cachedUser: DevoteeUserRecord | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`baggona_devotee_user_${devoteeId}`);
      if (raw) cachedUser = JSON.parse(raw);
    } catch {}
  }

  const updated: DevoteeUserRecord = {
    ...(cachedUser || {
      id: devoteeId,
      username: devoteeId,
      name: "Devotee",
      role: "devotee",
      createdAt: nowIso
    }),
    phone: cleanPhone || cachedUser?.phone || "",
    email: cleanEmail || cachedUser?.email || "",
    lastVisitAt: nowIso
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`baggona_devotee_user_${devoteeId}`, JSON.stringify(updated));
      localStorage.setItem(`baggona_contact_collected_${devoteeId}`, "true");
    } catch {}
  }

  if (!firestore || isTestEnvironment() || isMockDevotee(devoteeId)) {
    return { success: true, updatedUser: updated };
  }

  try {
    const userDocRef = doc(firestore, "users", devoteeId);
    const cleanUpdate = cleanFirestoreObject({
      ...updated,
      phone: updated.phone,
      email: updated.email,
      updatedAt: nowIso,
      serverTimestamp: serverTimestamp()
    });
    await setDoc(userDocRef, cleanUpdate, { merge: true });

    // Also synchronize calendarDevoteeEngagement document if present
    try {
      const engDocRef = doc(firestore, "calendarDevoteeEngagement", devoteeId);
      const engSnap = await getDoc(engDocRef);
      if (engSnap.exists()) {
        const engUpdates: Record<string, any> = { updatedAt: nowIso };
        if (cleanPhone) engUpdates.phone = cleanPhone;
        if (cleanEmail) engUpdates.email = cleanEmail;
        await updateDoc(engDocRef, engUpdates);
      }
    } catch (engErr) {
      console.warn("[DevoteeUserService] Engagement contact sync notice:", engErr);
    }

    return { success: true, updatedUser: updated };
  } catch (err) {
    console.error("[DevoteeUserService] Failed to update contact details in Firestore:", err);
    return { success: false };
  }
}
