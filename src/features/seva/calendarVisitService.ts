/**
 * Baggona Calendar Visit & 90-Day Engagement Analytics Service
 * 
 * Tracks:
 * - Real-time calendar click & visit events into Firestore collection `calendarVisits`
 * - Devotee 90-day engagement aggregates in collection `calendarDevoteeEngagement` (unique days visited, total hits)
 * - 90-day Seva Pass expiration lifecycle & enforcement
 * - Devotee Janma Kundali cloud synchronization with automatic deduplication
 */

import { firestore } from "../../services/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
  type QuerySnapshot,
  type DocumentData
} from "firebase/firestore";
import { saveKundliToFirestore, type KundliHistoryDoc } from "../../db/firestoreDb";
import type { KundliOutput } from "../../core/AstroTypes";
import { isTestEnvironment, isMockDevotee } from "../../utils/testEnvGuard";

export interface CalendarVisitRecord {
  id?: string;
  devoteeName: string;
  tokenIdentifier: string;
  dateClicked: string; // The date clicked in calendar (e.g. 2026-09-16)
  actualDate: string; // The actual visit date (e.g. 2026-08-31)
  lang: string;
  tabVisited: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  priestName?: string;
  userAgent?: string;
  timestamp?: string;
  dob?: string;
  tob?: string;
  gotra?: string;
  rashi?: string;
  nakshatra?: string;
  lagnaRashi?: string;
  sunSign?: string;
  placeName?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  durationDays?: number;
  startDate?: string;
  source?: string;
}

export interface DevoteeCalendarSubscriptionDoc {
  id: string; // Devotee ID or token hash
  tokenKey: string;
  devoteeName: string;
  phone: string; // 10-digit mobile number
  email: string; // Devotee email address
  dob?: string;
  tob?: string;
  gotra?: string;
  rashi?: string;
  rashiIndex?: number;
  nakshatra?: string;
  nakshatraIndex?: number;
  lagnaRashi?: string;
  sunSign?: string;
  placeName?: string;
  pincode?: string;
  // Timing & Subscription Metrics
  durationDays: number; // 30, 90, 180, 365 (defaults to 90)
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  daysConsumed: number; // Distinct days visited count
  daysRemaining: number; // Remaining days until expiry
  totalVisitsCount: number; // Total hit count
  totalHits: number; // Alias for backward compatibility
  uniqueDaysVisitedCount: number; // Alias for backward compatibility
  visitedDates: string[]; // List of unique YYYY-MM-DD dates visited
  isExpired: boolean;
  marketingStatus: "active" | "near_expiry" | "expired" | "renewed"; // near_expiry if daysRemaining <= 7
  renewalAlertSent?: boolean;
  priestName?: string;
  source?: string;
  firstVisitAt: string;
  lastVisitAt: string;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatible alias
export type DevoteeCalendarEngagementDoc = DevoteeCalendarSubscriptionDoc;

export interface PassExpirationResult {
  isExpired: boolean;
  daysElapsed: number;
  daysRemaining: number;
  startDate: string;
  expiryDate: string;
  totalDays: number;
}

/**
 * Calculates whether a 30/90/180/365-day calendar link has expired.
 */
export function checkPassExpiration(
  startDateStr?: string,
  totalDays = 90
): PassExpirationResult {
  const fallbackStart = new Date().toISOString().split("T")[0];
  const startYmd = startDateStr && startDateStr.trim().length === 10 ? startDateStr.trim() : fallbackStart;
  
  const start = new Date(startYmd);
  const now = new Date();
  const todayYmd = now.toISOString().split("T")[0];
  const today = new Date(todayYmd);

  if (isNaN(start.getTime())) {
    return {
      isExpired: false,
      daysElapsed: 0,
      daysRemaining: totalDays,
      startDate: todayYmd,
      expiryDate: todayYmd,
      totalDays
    };
  }

  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24));

  const daysElapsed = Math.max(0, diffDays);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const isExpired = daysElapsed >= totalDays;

  const expDateObj = new Date(startUtc + totalDays * 24 * 60 * 60 * 1000);
  const expiryDate = expDateObj.toISOString().split("T")[0];

  return {
    isExpired,
    daysElapsed,
    daysRemaining,
    startDate: startYmd,
    expiryDate,
    totalDays
  };
}

/**
 * Record a calendar click/visit event into Firestore & update comprehensive devotee engagement/subscription metrics.
 * Features strict deduplication, test-environment protection, and marketing metadata enrichment.
 */
export async function recordCalendarVisit(params: CalendarVisitRecord): Promise<void> {
  try {
    // 0. Protection against test suite execution polluting live database
    if (isTestEnvironment() || isMockDevotee(params.tokenIdentifier) || isMockDevotee(params.devoteeName)) {
      return;
    }

    if (!firestore) return;

    const tokenKey = (params.tokenIdentifier || "guest").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    const visitDate = params.actualDate || new Date().toISOString().split("T")[0];
    const clickDate = params.dateClicked || visitDate;
    const visitId = `visit_${tokenKey}_${visitDate}_${clickDate}`;
    const nowIso = new Date().toISOString();
    const durationDays = Number(params.durationDays) > 0 ? Number(params.durationDays) : 90;

    // 1. Log or update canonical visit record (deduplicated per devotee per date)
    const visitDocRef = doc(firestore, "calendarVisits", visitId);
    const visitSnap = await getDoc(visitDocRef);

    if (visitSnap.exists()) {
      const prevData = visitSnap.data();
      await updateDoc(visitDocRef, {
        hitCount: (Number(prevData.hitCount) || 1) + 1,
        lastVisitAt: nowIso,
        tabVisited: params.tabVisited || prevData.tabVisited,
        lang: params.lang || prevData.lang,
        updatedAt: nowIso
      });
    } else {
      const cleanRecord = {
        ...params,
        id: visitId,
        hitCount: 1,
        durationDays,
        firstVisitAt: nowIso,
        lastVisitAt: nowIso,
        timestamp: nowIso
      };
      await setDoc(visitDocRef, cleanRecord);
    }

    // 2. Update aggregate engagement & subscription document for this devotee
    const engDocRef = doc(firestore, "calendarDevoteeEngagement", tokenKey);
    const engSnap = await getDoc(engDocRef);

    if (engSnap.exists()) {
      const existing = engSnap.data() as DevoteeCalendarSubscriptionDoc;
      const rawVisited = Array.isArray(existing.visitedDates) ? existing.visitedDates : [];
      const visitedDates = Array.from(new Set([...rawVisited, clickDate]));

      const activeDuration = existing.durationDays || durationDays;
      const activeStartDate = (existing.startDate && existing.startDate.length === 10) ? existing.startDate : (params.startDate || clickDate || visitDate);
      const passStatus = checkPassExpiration(activeStartDate, activeDuration);

      const daysConsumed = visitedDates.length;
      const daysRemaining = passStatus.daysRemaining;
      const isExpired = passStatus.isExpired;
      const marketingStatus: DevoteeCalendarSubscriptionDoc["marketingStatus"] = isExpired
        ? "expired"
        : daysRemaining <= 7
        ? "near_expiry"
        : "active";

      const updates: Partial<DevoteeCalendarSubscriptionDoc> = {
        totalHits: (existing.totalHits || existing.totalVisitsCount || 0) + 1,
        totalVisitsCount: (existing.totalVisitsCount || existing.totalHits || 0) + 1,
        visitedDates,
        uniqueDaysVisitedCount: daysConsumed,
        daysConsumed,
        daysRemaining,
        durationDays: activeDuration,
        startDate: activeStartDate,
        expiryDate: passStatus.expiryDate,
        isExpired,
        marketingStatus,
        lastVisitAt: nowIso,
        updatedAt: nowIso
      };

      // Enrich with missing contact or Kundli details if available in current visit
      if (params.phone && !existing.phone) updates.phone = params.phone.trim();
      if (params.email && !existing.email) updates.email = params.email.trim().toLowerCase();
      if (params.dob && !existing.dob) updates.dob = params.dob;
      if (params.tob && !existing.tob) updates.tob = params.tob;
      if (params.gotra && !existing.gotra) updates.gotra = params.gotra;
      if (params.rashi && !existing.rashi) updates.rashi = params.rashi;
      if (params.rashiIndex !== undefined && existing.rashiIndex === undefined) updates.rashiIndex = params.rashiIndex;
      if (params.nakshatra && !existing.nakshatra) updates.nakshatra = params.nakshatra;
      if (params.nakshatraIndex !== undefined && existing.nakshatraIndex === undefined) updates.nakshatraIndex = params.nakshatraIndex;
      if (params.lagnaRashi && !existing.lagnaRashi) updates.lagnaRashi = params.lagnaRashi;
      if (params.sunSign && !existing.sunSign) updates.sunSign = params.sunSign;
      if (params.placeName && !existing.placeName) updates.placeName = params.placeName;
      if (params.pincode && !existing.pincode) updates.pincode = params.pincode;
      if (params.priestName && !existing.priestName) updates.priestName = params.priestName;

      await updateDoc(engDocRef, updates as Record<string, any>);
    } else {
      const startDate = (params.startDate && params.startDate.length === 10) ? params.startDate : (clickDate || visitDate);
      const passStatus = checkPassExpiration(startDate, durationDays);
      const daysRemaining = passStatus.daysRemaining;
      const isExpired = passStatus.isExpired;
      const marketingStatus: DevoteeCalendarSubscriptionDoc["marketingStatus"] = isExpired
        ? "expired"
        : daysRemaining <= 7
        ? "near_expiry"
        : "active";

      const newSubscriptionDoc: DevoteeCalendarSubscriptionDoc = {
        id: tokenKey,
        tokenKey,
        devoteeName: params.devoteeName || "Devotee",
        phone: params.phone ? params.phone.trim() : "",
        email: params.email ? params.email.trim().toLowerCase() : "",
        dob: params.dob || "",
        tob: params.tob || "",
        gotra: params.gotra || "ಕಾಶ್ಯಪ",
        rashi: params.rashi || "",
        rashiIndex: params.rashiIndex ?? -1,
        nakshatra: params.nakshatra || "",
        nakshatraIndex: params.nakshatraIndex ?? -1,
        lagnaRashi: params.lagnaRashi || "",
        sunSign: params.sunSign || "",
        placeName: params.placeName || "Gokarna",
        pincode: params.pincode || "581326",
        durationDays,
        startDate,
        expiryDate: passStatus.expiryDate,
        daysConsumed: 1,
        daysRemaining,
        totalVisitsCount: 1,
        totalHits: 1,
        uniqueDaysVisitedCount: 1,
        visitedDates: [clickDate],
        isExpired,
        marketingStatus,
        priestName: params.priestName || "Shreeram Pandit",
        source: params.source || "calendar_redirect",
        firstVisitAt: nowIso,
        lastVisitAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await setDoc(engDocRef, newSubscriptionDoc);
    }
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to record visit analytics:", err);
  }
}

/**
 * Automatically sync devotee's Janma Kundali into Firestore `kundlis` collection on visit
 * with automatic deduplication so that existing Kundlis are updated and not duplicated.
 */
export async function syncDevoteeKundliOnVisit(params: {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  placeName?: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  kundliOutput: KundliOutput;
  rashiIndex?: number;
  nakshatraIndex?: number;
  gotra?: string;
  priestName?: string;
}): Promise<void> {
  try {
    const {
      devoteeName,
      birthDate,
      birthTime,
      placeName = "Gokarna",
      latitude = 14.5479,
      longitude = 74.3187,
      pincode = "581326",
      kundliOutput,
      rashiIndex = 8,
      nakshatraIndex = 18,
      gotra = "",
      priestName = "Shreeram Pandit"
    } = params;

    if (!devoteeName || !birthDate || !birthTime) return;
    if (isTestEnvironment() || isMockDevotee(devoteeName)) return;

    const cleanName = devoteeName.trim();
    const cleanDob = birthDate.trim();
    const cleanTob = birthTime.trim();

    const moonPlanet = kundliOutput.planets.find(p => p.name === "Moon") || kundliOutput.planets[1];
    const lagnaRashiName = kundliOutput.lagnaRashi?.english || "Dhanu";
    const rashiStr = kundliOutput.moonSign?.english || moonPlanet?.rashi?.english || "Dhanu";
    const nakshatraStr = moonPlanet?.nakshatra?.english || "Mula";
    const padaNum = 1;

    const planetsSummary = kundliOutput.planets.map(p => ({
      name: p.name,
      degree: p.degree,
      rashi: p.rashi?.english || "Aries",
      house: p.house,
      isRetrograde: p.isRetrograde
    }));

    const recordId = `kundli_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${cleanDob}_${cleanTob.replace(":", "")}`;

    const kundliDoc: KundliHistoryDoc = {
      id: recordId,
      userId: "devotee_visit_sync",
      priestName,
      name: cleanName,
      birthDate: cleanDob,
      birthTime: cleanTob,
      placeName,
      latitude,
      longitude,
      pincode,
      gothra: gotra,
      rashi: rashiStr,
      nakshatra: nakshatraStr,
      pada: padaNum,
      lagnaRashi: lagnaRashiName,
      sunSign: kundliOutput.sunSign?.english || kundliOutput.planets.find(p => p.name === "Sun")?.rashi?.english || "Mesha",
      planetsSummary,
      kundliData: kundliOutput,
      createdAt: new Date().toISOString()
    };

    // saveKundliToFirestore automatically executes deduplication check
    await saveKundliToFirestore(kundliDoc);
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to sync Kundli on visit:", err);
  }
}

export interface PoojaStreakInfo {
  currentStreak: number;
  highestStreak: number;
  lastSankalpaDate: string;
  isCompletedToday: boolean;
  totalSankalpas: number;
  milestoneUnlocked?: {
    level: number;
    titleKn: string;
    titleEn: string;
    icon: string;
    descriptionKn: string;
    descriptionEn: string;
  } | null;
}

const POOJA_STREAK_STORAGE_KEY = "baggona_devotee_pooja_streak";

/**
 * Retrieves the devotee's current daily Pooja Sankalpa streak.
 */
export function getPoojaStreak(devoteeKey = "devotee_default"): PoojaStreakInfo {
  if (typeof window === "undefined") {
    return {
      currentStreak: 1,
      highestStreak: 1,
      lastSankalpaDate: "",
      isCompletedToday: false,
      totalSankalpas: 0
    };
  }

  try {
    const raw = localStorage.getItem(`${POOJA_STREAK_STORAGE_KEY}_${devoteeKey}`);
    if (!raw) {
      return {
        currentStreak: 0,
        highestStreak: 0,
        lastSankalpaDate: "",
        isCompletedToday: false,
        totalSankalpas: 0
      };
    }

    const data = JSON.parse(raw);
    const today = new Date().toISOString().split("T")[0];
    const isCompletedToday = data.lastSankalpaDate === today;

    // Check if streak is still active (yesterday or today)
    let currentStreak = data.currentStreak || 0;
    if (data.lastSankalpaDate) {
      const lastDate = new Date(data.lastSankalpaDate);
      const todayDate = new Date(today);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1 && !isCompletedToday) {
        currentStreak = 0; // streak broke
      }
    }

    return {
      currentStreak,
      highestStreak: Math.max(data.highestStreak || 0, currentStreak),
      lastSankalpaDate: data.lastSankalpaDate || "",
      isCompletedToday,
      totalSankalpas: data.totalSankalpas || 0
    };
  } catch {
    return {
      currentStreak: 0,
      highestStreak: 0,
      lastSankalpaDate: "",
      isCompletedToday: false,
      totalSankalpas: 0
    };
  }
}

/**
 * Records a completed daily Pooja Sankalpa, increments the streak, and checks for milestone unlocks.
 */
export async function recordPoojaSankalpaCompleted(
  devoteeKey = "devotee_default",
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ",
  priestName = "Shreeram Pandit"
): Promise<PoojaStreakInfo> {
  const today = new Date().toISOString().split("T")[0];
  const current = getPoojaStreak(devoteeKey);

  if (current.isCompletedToday) {
    return current;
  }

  let newStreak = current.currentStreak + 1;
  let newTotal = current.totalSankalpas + 1;
  let highestStreak = Math.max(current.highestStreak, newStreak);

  // Check milestones: 7 Days (Saptaha), 21 Days (Ekavimshati), 48 Days (Mandalotsava)
  let milestoneUnlocked: PoojaStreakInfo["milestoneUnlocked"] = null;
  if (newStreak === 7) {
    milestoneUnlocked = {
      level: 7,
      icon: "🌟",
      titleKn: "ಸಪ್ತಾಹ ಸಂಕಲ್ಪ ದೀಕ್ಷಾ ಸಿದ್ಧಿ",
      titleEn: "7-Day Saptaha Sankalpa Milestone",
      descriptionKn: "ಸತತ ೭ ದಿನಗಳ ಭಕ್ತಿಪೂರ್ವಕ ಪೂಜಾ ಸಂಕಲ್ಪ ಪೂರ್ಣಗೊಂಡಿದೆ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ!",
      descriptionEn: "Completed 7 continuous days of auspicious morning sankalpa. May Lord Mahabaleshwara bless your endeavors!"
    };
  } else if (newStreak === 21) {
    milestoneUnlocked = {
      level: 21,
      icon: "🔱",
      titleKn: "ಏಕವಿಂಶತಿ ಮಹಾ ಸಂಕಲ್ಪ ದೀಕ್ಷೆ",
      titleEn: "21-Day Ekavimshati Sacred Vow",
      descriptionKn: "೨೧ ದಿನಗಳ ನಿಷ್ಠಾವಂತ ತಪೋ ಸಂಕಲ್ಪ ಸಂಪನ್ನ! ನಿಮ್ಮ ಮನಸ್ಸಿನ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ವಿಶೇಷ ಆಶೀರ್ವಾದ.",
      descriptionEn: "21 days of steadfast devotion completed! Supreme blessings from Gokarna Sanctum for inner peace and prosperity."
    };
  } else if (newStreak === 48) {
    milestoneUnlocked = {
      level: 48,
      icon: "👑",
      titleKn: "ಮಂಡಲೋತ್ಸವ ಪರಮ ಭಕ್ತಿ ಪುರಸ್ಕಾರ",
      titleEn: "48-Day Mandala Pooja Supreme Blessing",
      descriptionKn: "ಸಂಪೂರ್ಣ ೪೮ ದಿನಗಳ ಮಂಡಲ ಪೂಜಾ ದೀಕ್ಷೆ ಸಿದ್ಧಿಸಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ದೋಷ ನಿವಾರಣೆಯಾಗಿ ದಿವ್ಯ ಭಾಗ್ಯೋದಯ!",
      descriptionEn: "Complete 48-day Mandala Sankalpa achieved. Graha doshas alleviated with divine grace!"
    };
  }

  const updated: PoojaStreakInfo = {
    currentStreak: newStreak,
    highestStreak,
    lastSankalpaDate: today,
    isCompletedToday: true,
    totalSankalpas: newTotal,
    milestoneUnlocked
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${POOJA_STREAK_STORAGE_KEY}_${devoteeKey}`, JSON.stringify(updated));
    } catch {}
  }

  // Cloud Firestore Sync (Non-blocking across users, devoteeStreaks, and devoteePoojaSankalpas)
  try {
    if (!isTestEnvironment() && !isMockDevotee(devoteeKey) && !isMockDevotee(devoteeName) && firestore) {
      // 1. Log daily discrete sankalpa record
      const sankalpaRef = doc(firestore, "devoteePoojaSankalpas", `sankalpa_${devoteeKey}_${today}`);
      void setDoc(sankalpaRef, {
        devoteeKey,
        devoteeName,
        gotra,
        date: today,
        streakCount: newStreak,
        totalSankalpas: newTotal,
        priestName,
        createdAt: serverTimestamp()
      }).catch(() => {});

      // 2. Update devotee user record in users collection
      const userRef = doc(firestore, "users", devoteeKey);
      void setDoc(userRef, {
        id: devoteeKey,
        name: devoteeName,
        gotra,
        currentStreak: newStreak,
        highestStreak,
        lastSankalpaDate: today,
        totalSankalpas: newTotal,
        lastVisitAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});

      // 3. Update devoteeStreaks collection
      const streakRef = doc(firestore, "devoteeStreaks", `streak_${devoteeKey}`);
      void setDoc(streakRef, {
        devoteeKey,
        devoteeName,
        gotra,
        currentStreak: newStreak,
        highestStreak,
        totalPoojas: newTotal,
        lastPoojaDate: today,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to log pooja sankalpa to cloud:", err);
  }

  return updated;
}

/**
 * Fetches devotee's Pooja streak from Cloud Firestore and syncs with LocalStorage.
 * Guarantees cross-device streak continuity (mobile, desktop, tablet).
 */
export async function fetchPoojaStreakFromCloud(devoteeKey = "devotee_default"): Promise<PoojaStreakInfo> {
  const local = getPoojaStreak(devoteeKey);

  if (!firestore) return local;

  try {
    const userRef = doc(firestore, "users", devoteeKey);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const cloudStreak = Number(data.currentStreak) || 0;
      const cloudHighest = Number(data.highestStreak) || 0;
      const cloudLastDate = String(data.lastSankalpaDate || "");
      const cloudTotal = Number(data.totalSankalpas) || 0;

      const today = new Date().toISOString().split("T")[0];
      const isCompletedToday = cloudLastDate === today;

      let validStreak = cloudStreak;
      if (cloudLastDate) {
        const lastDate = new Date(cloudLastDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1 && !isCompletedToday) {
          validStreak = 0;
        }
      }

      const merged: PoojaStreakInfo = {
        currentStreak: Math.max(local.currentStreak, validStreak),
        highestStreak: Math.max(local.highestStreak, cloudHighest, validStreak),
        lastSankalpaDate: isCompletedToday ? today : (cloudLastDate || local.lastSankalpaDate),
        isCompletedToday: isCompletedToday || local.isCompletedToday,
        totalSankalpas: Math.max(local.totalSankalpas, cloudTotal)
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${POOJA_STREAK_STORAGE_KEY}_${devoteeKey}`, JSON.stringify(merged));
        } catch {}
      }

      return merged;
    }
  } catch (err) {
    console.warn("[CalendarVisitService] Cloud streak fetch error:", err);
  }

  return local;
}

export interface PriestCalendarActionRecord {
  priestName: string;
  action: "download_ics" | "web_visit" | "qr_scan";
  date: string;
  spanDays?: number;
  pincode?: string;
  locationName?: string;
  userAgent?: string;
}

/**
 * Tracks Priest Calendar downloads and Web Sanctum visits to Cloud Firestore and local storage.
 */
export async function recordPriestCalendarAction(record: PriestCalendarActionRecord): Promise<void> {
  const timestamp = new Date().toISOString();
  const id = `priest_action_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (typeof window !== "undefined") {
    try {
      const existingStr = localStorage.getItem("baggona_priest_calendar_actions") || "[]";
      const list = JSON.parse(existingStr);
      list.unshift({ ...record, id, timestamp });
      localStorage.setItem("baggona_priest_calendar_actions", JSON.stringify(list.slice(0, 100)));
    } catch {}
  }

  try {
    const actRef = doc(firestore, "priestCalendarVisits", id);
    await setDoc(actRef, {
      ...record,
      timestamp,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to log priest action to cloud:", err);
  }
}

/**
 * Super Admin: Real-time subscription to all Devotee Calendar Subscriptions in Firestore
 */
export function subscribeCalendarDevoteeSubscriptions(
  onUpdate: (subscriptions: DevoteeCalendarSubscriptionDoc[]) => void
): Unsubscribe {
  if (!firestore) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(firestore, "calendarDevoteeEngagement"),
    orderBy("lastVisitAt", "desc"),
    limit(200)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DevoteeCalendarSubscriptionDoc[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DevoteeCalendarSubscriptionDoc;
        const activeDuration = data.durationDays || 90;
        const passStatus = checkPassExpiration(data.startDate, activeDuration);
        const daysRemaining = passStatus.daysRemaining;
        const isExpired = passStatus.isExpired;
        const marketingStatus = isExpired ? "expired" : daysRemaining <= 7 ? "near_expiry" : "active";

        list.push({
          ...data,
          id: docSnap.id,
          durationDays: activeDuration,
          daysRemaining,
          isExpired,
          marketingStatus
        });
      });
      onUpdate(list);
    },
    (err) => {
      console.warn("[CalendarVisitService] Devotee subscriptions listener error:", err);
    }
  );
}

/**
 * Super Admin: Purge All Old Test / Sample Calendar Subscriptions and Visits to Start Fresh.
 */
export async function purgeAllCalendarSubscriptionsAndVisits(): Promise<{ removedCount: number }> {
  try {
    if (!firestore) return { removedCount: 0 };
    let removedCount = 0;

    // 1. Purge calendarDevoteeEngagement collection
    const engSnap = await getDocs(query(collection(firestore, "calendarDevoteeEngagement"), limit(500)));
    for (const d of engSnap.docs) {
      await deleteDoc(d.ref);
      removedCount++;
    }

    // 2. Purge calendarVisits collection
    const visitsSnap = await getDocs(query(collection(firestore, "calendarVisits"), limit(500)));
    for (const d of visitsSnap.docs) {
      await deleteDoc(d.ref);
      removedCount++;
    }

    // 3. Purge ashirvada_passes collection
    const passSnap = await getDocs(query(collection(firestore, "ashirvada_passes"), limit(500)));
    for (const d of passSnap.docs) {
      await deleteDoc(d.ref);
      removedCount++;
    }

    return { removedCount };
  } catch (err) {
    console.error("[CalendarVisitService] Failed to purge test calendar data:", err);
    return { removedCount: 0 };
  }
}

/**
 * Super Admin: Extend or Reset validity of a Devotee Calendar Subscription
 */
export async function extendSubscriptionValidity(
  devoteeId: string,
  additionalDays: number = 90
): Promise<boolean> {
  try {
    if (!firestore) return false;
    const cleanId = devoteeId.trim();
    const engRef = doc(firestore, "calendarDevoteeEngagement", cleanId);
    const snap = await getDoc(engRef);

    const now = new Date();
    const todayYmd = now.toISOString().split("T")[0];
    const newExpiryObj = new Date(now.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    const newExpiryYmd = newExpiryObj.toISOString().split("T")[0];

    if (snap.exists()) {
      await updateDoc(engRef, {
        durationDays: additionalDays,
        startDate: todayYmd,
        expiryDate: newExpiryYmd,
        daysRemaining: additionalDays,
        isExpired: false,
        marketingStatus: "active",
        updatedAt: now.toISOString()
      });
    }

    return true;
  } catch (err) {
    console.error("[CalendarVisitService] Extend subscription error:", err);
    return false;
  }
}

/**
 * Super Admin: Delete an individual Devotee Calendar Subscription
 */
export async function deleteDevoteeSubscription(devoteeId: string): Promise<boolean> {
  try {
    if (!firestore) return false;
    const cleanId = devoteeId.trim();
    const engRef = doc(firestore, "calendarDevoteeEngagement", cleanId);
    await deleteDoc(engRef);
    return true;
  } catch (err) {
    console.error("[CalendarVisitService] Delete devotee subscription error:", err);
    return false;
  }
}

