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
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { saveKundliToFirestore, type KundliHistoryDoc } from "../../db/firestoreDb";
import type { KundliOutput } from "../../core/AstroTypes";

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
}

export interface DevoteeCalendarEngagementDoc {
  id: string; // devotee token hash
  devoteeName: string;
  totalHits: number;
  uniqueDaysVisitedCount: number;
  visitedDates: string[]; // List of unique dates visited
  startDate: string; // Start date of 90-day calendar
  expiryDate: string; // startDate + 90 days
  isExpired: boolean;
  firstVisitAt: string;
  lastVisitAt: string;
  updatedAt: string;
}

export interface PassExpirationResult {
  isExpired: boolean;
  daysElapsed: number;
  daysRemaining: number;
  startDate: string;
  expiryDate: string;
  totalDays: number;
}

/**
 * Calculates whether a 90-day calendar link has expired.
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
 * Record a calendar click/visit event into Firestore & update 90-day engagement metrics.
 */
export async function recordCalendarVisit(params: CalendarVisitRecord): Promise<void> {
  try {
    if (!firestore) return;

    const tokenKey = (params.tokenIdentifier || "guest").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    const visitId = `visit_${tokenKey}_${params.dateClicked}_${Date.now()}`;
    const cleanRecord = {
      ...params,
      id: visitId,
      timestamp: new Date().toISOString()
    };

    // 1. Log discrete visit record
    const visitDocRef = doc(firestore, "calendarVisits", visitId);
    await setDoc(visitDocRef, cleanRecord);

    // 2. Update aggregate engagement document for this devotee
    const engDocRef = doc(firestore, "calendarDevoteeEngagement", tokenKey);
    const engSnap = await getDoc(engDocRef);

    const nowIso = new Date().toISOString();
    if (engSnap.exists()) {
      const existing = engSnap.data() as DevoteeCalendarEngagementDoc;
      const visitedDates = Array.isArray(existing.visitedDates) ? [...existing.visitedDates] : [];
      if (!visitedDates.includes(params.dateClicked)) {
        visitedDates.push(params.dateClicked);
      }

      const passStatus = checkPassExpiration(existing.startDate, 90);

      await updateDoc(engDocRef, {
        totalHits: (existing.totalHits || 0) + 1,
        visitedDates,
        uniqueDaysVisitedCount: visitedDates.length,
        isExpired: passStatus.isExpired,
        lastVisitAt: nowIso,
        updatedAt: nowIso
      });
    } else {
      const startDate = params.dateClicked || new Date().toISOString().split("T")[0];
      const passStatus = checkPassExpiration(startDate, 90);

      const newEngDoc: DevoteeCalendarEngagementDoc = {
        id: tokenKey,
        devoteeName: params.devoteeName || "Devotee",
        totalHits: 1,
        uniqueDaysVisitedCount: 1,
        visitedDates: [params.dateClicked],
        startDate,
        expiryDate: passStatus.expiryDate,
        isExpired: passStatus.isExpired,
        firstVisitAt: nowIso,
        lastVisitAt: nowIso,
        updatedAt: nowIso
      };

      await setDoc(engDocRef, newEngDoc);
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

  // Cloud Firestore Sync (Non-blocking)
  try {
    const sankalpaRef = doc(firestore, "devoteePoojaSankalpas", `sankalpa_${devoteeKey}_${today}`);
    await setDoc(sankalpaRef, {
      devoteeKey,
      devoteeName,
      gotra,
      date: today,
      streakCount: newStreak,
      totalSankalpas: newTotal,
      priestName,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to log pooja sankalpa to cloud:", err);
  }

  return updated;
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

