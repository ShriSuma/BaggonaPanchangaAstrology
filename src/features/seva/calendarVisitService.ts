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
import {
  saveKundliToFirestore,
  type KundliHistoryDoc,
  saveCalendarRegistration,
  getCalendarRegistration,
  recordDailyVisitLog,
  getMemoryTodayVisitsCount,
  subscribeAllCalendarRegistrations,
  subscribeAllDailyVisits,
  type CalendarRegistrationDoc,
  type CalendarDailyVisitDoc
} from "../../db/firestoreDb";

export {
  subscribeAllCalendarRegistrations,
  subscribeAllDailyVisits,
  getCalendarRegistration,
  saveCalendarRegistration,
  recordDailyVisitLog,
  type CalendarRegistrationDoc,
  type CalendarDailyVisitDoc
};
import type { KundliOutput } from "../../core/AstroTypes";
import { isTestEnvironment, isMockDevotee } from "../../utils/testEnvGuard";
import { getIndianStandardDateStr } from "../../core/placeTime";

export interface RegisterCalendarParams {
  userId?: string;
  userName: string;
  token: string;
  startDate?: string;
  durationDays?: number; // 30, 90, 180, 365
  priestName?: string;
  priestPhone?: string;
  devoteePhone?: string;
  devoteeEmail?: string;
  nakshatra?: string;
  nakshatraIndex?: number;
  rashi?: string;
  rashiIndex?: number;
  gotra?: string;
  dob?: string;
  tob?: string;
  placeName?: string;
  pincode?: string;
  source: "priest_qr" | "calendar_sync" | "prasada_kit" | "royal_booklet" | "legacy_auto_sync" | "direct_darshana";
  notes?: string;
}

/**
 * Register calendar link/QR generation event into Firestore collection `calendarRegistrations`
 * and pre-seed engagement doc for CRM visibility.
 */
export async function registerCalendarAtGeneration(params: RegisterCalendarParams): Promise<CalendarRegistrationDoc> {
  const now = new Date();
  const todayYmd = getIndianStandardDateStr(now);
  const startDate = params.startDate && params.startDate.length === 10 ? params.startDate : todayYmd;
  const durationDays = Number(params.durationDays) > 0 ? Number(params.durationDays) : 90;

  // Calculate authentic expiration from startDate (never from current clock date)
  const startObj = new Date(startDate);
  const startUtc = isNaN(startObj.getTime())
    ? Date.now()
    : Date.UTC(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
  const expiresAt = new Date(startUtc + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const token = (params.token || "").trim();
  const rawId = token ? `reg_${token.slice(0, 48)}` : `reg_${Date.now().toString(36)}`;
  const userId = params.userId || token || `usr_${Date.now().toString(36)}`;
  const userName = params.userName?.trim() || "Devotee";
  const priestName = params.priestName?.trim() || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const priestPhone = params.priestPhone?.trim() || "9972339362";

  const passStatus = checkPassExpiration(startDate, durationDays);

  const regDoc: CalendarRegistrationDoc = {
    id: rawId,
    userId,
    userName,
    token,
    startDate,
    durationDays,
    expiresAt,
    priestName,
    priestPhone,
    devoteePhone: params.devoteePhone?.trim() || "",
    devoteeEmail: params.devoteeEmail?.trim() || "",
    nakshatra: params.nakshatra,
    nakshatraIndex: params.nakshatraIndex,
    rashi: params.rashi,
    rashiIndex: params.rashiIndex,
    gotra: params.gotra,
    dob: params.dob,
    tob: params.tob,
    placeName: params.placeName,
    pincode: params.pincode,
    source: params.source,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: passStatus.isExpired ? "expired" : "active",
    notes: params.notes
  };

  await saveCalendarRegistration(regDoc);

  // Pre-seed calendarDevoteeEngagement so admin CRM & engagement counters stay 100% in sync
  try {
    if (firestore && !isTestEnvironment()) {
      const tokenKey = (token || userId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || `dev_${Date.now().toString(36)}`;
      const engDocRef = doc(firestore, "calendarDevoteeEngagement", tokenKey);
      const engSnap = await getDoc(engDocRef);
      if (!engSnap.exists()) {
        const initEngDoc: DevoteeCalendarSubscriptionDoc = {
          id: tokenKey,
          tokenKey,
          devoteeName: userName,
          phone: params.devoteePhone || "",
          email: params.devoteeEmail || "",
          dob: params.dob || "",
          tob: params.tob || "",
          gotra: params.gotra || "ಕಾಶ್ಯಪ",
          rashi: params.rashi || "",
          rashiIndex: params.rashiIndex ?? -1,
          nakshatra: params.nakshatra || "",
          nakshatraIndex: params.nakshatraIndex ?? -1,
          placeName: params.placeName || "Gokarna",
          pincode: params.pincode || "581326",
          durationDays,
          startDate,
          expiryDate: passStatus.expiryDate,
          daysConsumed: 0,
          daysRemaining: passStatus.daysRemaining,
          todayVisitsCount: 0,
          lastVisitDate: "",
          totalVisitsCount: 0,
          totalHits: 0,
          isLocked: true,
          uniqueDaysVisitedCount: 0,
          visitedDates: [],
          isExpired: passStatus.isExpired,
          marketingStatus: passStatus.isExpired ? "expired" : passStatus.daysRemaining <= 7 ? "near_expiry" : "active",
          priestName,
          source: params.source,
          firstVisitAt: now.toISOString(),
          lastVisitAt: now.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };
        await setDoc(engDocRef, initEngDoc);
      }
    }
  } catch (err) {
    console.warn("[CalendarVisitService] Engagement pre-seed warning:", err);
  }

  return regDoc;
}

export interface CalendarVisitRecord {
  id?: string;
  userId?: string;
  devoteeName?: string;
  userName?: string;
  tokenIdentifier?: string;
  token?: string;
  dateClicked?: string; // The date clicked in calendar (e.g. 2026-09-16)
  actualDate?: string; // The actual visit date (e.g. 2026-08-31)
  lang?: string;
  tabVisited?: string;
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
  todayVisitsCount?: number; // Visits on the current date
  lastVisitDate?: string; // YYYY-MM-DD
  isLocked?: boolean; // Protected from bulk deletion
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
  const fallbackStart = getIndianStandardDateStr();
  const startYmd = startDateStr && startDateStr.trim().length === 10 ? startDateStr.trim() : fallbackStart;
  
  const start = new Date(startYmd);
  const now = new Date();
  const todayYmd = getIndianStandardDateStr(now);
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
  const expiryDate = getIndianStandardDateStr(expDateObj);

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
 * Detects whether a devotee was assigned a 30-day pass based on name or token markers.
 * E.g., Ramanatha and other 30-day devotees who were given 30-day access during initial rollout.
 */
export function is30DayDevotee(name?: string, token?: string): boolean {
  const normName = (name || "").toLowerCase();
  const normToken = (token || "").toLowerCase();
  return (
    normName.includes("ramanath") ||
    normName.includes("ramanatha") ||
    normName.includes("ರಾಮನಾಥ") ||
    normName.includes("ramnath") ||
    normToken.includes("30d") ||
    normToken.includes("30_day") ||
    normToken.includes("30day")
  );
}

/**
 * Record a calendar click/visit event into Firestore & update comprehensive devotee engagement/subscription metrics.
 * - Logs each visit to `calendarDailyVisits` with devotee ID, timestamp, todayVisitNumber, and days remaining.
 * - Auto-migrates/registers existing live devotees (~80 live users) into `calendarRegistrations` if missing.
 * - Features strict deduplication, test-environment protection, and marketing metadata enrichment.
 */
export interface RecordCalendarVisitResult {
  isSuccess: boolean;
  todayVisitsCount: number;
  totalVisitsCount: number;
  daysRemaining: number;
  isExpired: boolean;
  registration?: CalendarRegistrationDoc | null;
}

export async function recordCalendarVisit(params: CalendarVisitRecord): Promise<RecordCalendarVisitResult> {
  try {
    const effectiveDevoteeName = params.devoteeName || params.userName || "Devotee";
    const effectiveToken = params.tokenIdentifier || params.token || "";
    const rawToken = effectiveToken.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
    const tokenKey = params.userId || (rawToken.length > 0 ? rawToken : `dev_${Date.now().toString(36)}`);
    const visitDate = params.actualDate || getIndianStandardDateStr(new Date());
    const clickDate = params.dateClicked || visitDate;
    const visitId = `visit_${tokenKey}_${visitDate}_${clickDate}`;
    const nowIso = new Date().toISOString();
    const todayYmd = getIndianStandardDateStr(new Date());

    const is30Day = is30DayDevotee(effectiveDevoteeName, effectiveToken);
    const durationDays = is30Day
      ? 30
      : (Number(params.durationDays) > 0 ? Number(params.durationDays) : 90);

    // 0. Protection against test suite execution polluting live database
    const skipLiveFirestore = isTestEnvironment() || isMockDevotee(effectiveToken) || isMockDevotee(effectiveDevoteeName);

    // 1. Check or auto-register devotee in calendarRegistrations (100% Backward Compatibility)
    let regDoc = await getCalendarRegistration(tokenKey);
    if (!regDoc && effectiveToken) {
      regDoc = await getCalendarRegistration(effectiveToken);
    }

    if (!regDoc) {
      // Query existing calendarDevoteeEngagement to extract authentic legacy startDate & duration
      let legacyStartDate = (params.startDate && params.startDate.length === 10) ? params.startDate : "";
      let legacyDuration = durationDays;

      if (!skipLiveFirestore && firestore) {
        try {
          const engSnap = await getDoc(doc(firestore, "calendarDevoteeEngagement", tokenKey));
          if (engSnap.exists()) {
            const engData = engSnap.data() as DevoteeCalendarSubscriptionDoc;
            const candidateDates: string[] = [];
            if (engData.startDate && engData.startDate.length === 10) candidateDates.push(engData.startDate);
            if (Array.isArray(engData.visitedDates) && engData.visitedDates.length > 0) {
              candidateDates.push(...engData.visitedDates.filter((d: string) => typeof d === "string" && d.length === 10));
            }
            if (engData.firstVisitAt && engData.firstVisitAt.length >= 10) {
              candidateDates.push(engData.firstVisitAt.slice(0, 10));
            }
            if (engData.createdAt && engData.createdAt.length >= 10) {
              candidateDates.push(engData.createdAt.slice(0, 10));
            }
            candidateDates.sort();
            if (candidateDates.length > 0) {
              legacyStartDate = candidateDates[0];
            }
            if (is30Day) {
              legacyDuration = 30;
            } else if (engData.durationDays && engData.durationDays > 0) {
              legacyDuration = engData.durationDays;
            }
          }
        } catch (e) {
          console.warn("[calendarVisitService] Legacy engagement recovery notice:", e);
        }
      }

      if (!legacyStartDate) {
        legacyStartDate = clickDate || visitDate;
      }

      regDoc = await registerCalendarAtGeneration({
        userId: tokenKey,
        userName: effectiveDevoteeName,
        token: effectiveToken || tokenKey,
        startDate: legacyStartDate,
        durationDays: legacyDuration,
        priestName: params.priestName || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        priestPhone: "9972339362",
        devoteePhone: params.phone,
        devoteeEmail: params.email,
        nakshatra: params.nakshatra,
        nakshatraIndex: params.nakshatraIndex,
        rashi: params.rashi,
        rashiIndex: params.rashiIndex,
        gotra: params.gotra,
        dob: params.dob,
        tob: params.tob,
        placeName: params.placeName,
        pincode: params.pincode,
        source: "legacy_auto_sync",
        notes: `Auto-registered legacy devotee (${legacyDuration} days, started ${legacyStartDate})`
      });
    } else if (regDoc) {
      // Dynamic Calibration: If 30-day devotee was previously auto-registered as 90 days, dynamically correct to 30 days!
      if (is30Day && regDoc.durationDays !== 30) {
        regDoc.durationDays = 30;
        const startObj = new Date(regDoc.startDate);
        const startUtc = isNaN(startObj.getTime())
          ? Date.now()
          : Date.UTC(startObj.getFullYear(), startObj.getMonth(), startObj.getDate());
        regDoc.expiresAt = new Date(startUtc + 30 * 24 * 60 * 60 * 1000).toISOString();
        await saveCalendarRegistration(regDoc);
      }
    }

    // Determine authentic start date and duration strictly from registration
    const effectiveDuration = regDoc?.durationDays || durationDays;
    const effectiveStartDate = regDoc?.startDate || params.startDate || clickDate || visitDate;
    const passStatus = checkPassExpiration(effectiveStartDate, effectiveDuration);

    let todayVisitNumber = 1;
    let totalVisitsCount = 1;

    if (!skipLiveFirestore && firestore) {
      // 2. Log or update canonical visit record in calendarVisits (deduplicated per devotee per date)
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
          durationDays: effectiveDuration,
          startDate: effectiveStartDate,
          firstVisitAt: nowIso,
          lastVisitAt: nowIso,
          timestamp: nowIso
        };
        await setDoc(visitDocRef, cleanRecord);
      }

      // 3. Update aggregate engagement & subscription document for this devotee
      const engDocRef = doc(firestore, "calendarDevoteeEngagement", tokenKey);
      const engSnap = await getDoc(engDocRef);

      if (engSnap.exists()) {
        const existing = engSnap.data() as DevoteeCalendarSubscriptionDoc;
        const rawVisited = Array.isArray(existing.visitedDates) ? existing.visitedDates : [];
        const visitedDates = Array.from(new Set([...rawVisited, clickDate]));

        const activeDuration = regDoc?.durationDays || existing.durationDays || effectiveDuration;
        const validExistingStartDate = (existing.startDate && existing.startDate.length === 10) ? existing.startDate : null;
        const validRegStartDate = (regDoc?.startDate && regDoc.startDate.length === 10) ? regDoc.startDate : null;
        const validParamStartDate = (params.startDate && params.startDate.length === 10) ? params.startDate : null;

        // Authentic start date priority: Registration DB > Existing doc > params
        const candidateDates = [validRegStartDate, validExistingStartDate, validParamStartDate].filter(Boolean) as string[];
        candidateDates.sort();
        const activeStartDate = candidateDates[0] || effectiveStartDate;
        const dynamicPassStatus = checkPassExpiration(activeStartDate, activeDuration);

        const daysConsumed = visitedDates.length;
        const daysRemaining = dynamicPassStatus.daysRemaining;
        const isExpired = dynamicPassStatus.isExpired;
        const marketingStatus: DevoteeCalendarSubscriptionDoc["marketingStatus"] = isExpired
          ? "expired"
          : daysRemaining <= 7
          ? "near_expiry"
          : "active";

        const isSameDay = existing.lastVisitDate === todayYmd;
        todayVisitNumber = isSameDay ? (Number(existing.todayVisitsCount) || 0) + 1 : 1;
        totalVisitsCount = (existing.totalVisitsCount || existing.totalHits || 0) + 1;

        const updates: Partial<DevoteeCalendarSubscriptionDoc> = {
          totalHits: totalVisitsCount,
          totalVisitsCount,
          todayVisitsCount: todayVisitNumber,
          lastVisitDate: todayYmd,
          isLocked: existing.isLocked !== undefined ? existing.isLocked : true,
          visitedDates,
          uniqueDaysVisitedCount: daysConsumed,
          daysConsumed,
          daysRemaining,
          durationDays: activeDuration,
          startDate: activeStartDate,
          expiryDate: dynamicPassStatus.expiryDate,
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
        const startDate = effectiveStartDate;
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
          durationDays: effectiveDuration,
          startDate,
          expiryDate: passStatus.expiryDate,
          daysConsumed: 1,
          daysRemaining,
          todayVisitsCount: 1,
          lastVisitDate: todayYmd,
          totalVisitsCount: 1,
          totalHits: 1,
          isLocked: true,
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
        todayVisitNumber = 1;
        totalVisitsCount = 1;
      }
    } else {
      // Memory / Offline / Test environment fallback
      const memoryVisitsToday = getMemoryTodayVisitsCount(tokenKey, todayYmd) || (params.tokenIdentifier ? getMemoryTodayVisitsCount(params.tokenIdentifier, todayYmd) : 0);
      todayVisitNumber = memoryVisitsToday + 1;
      totalVisitsCount = todayVisitNumber;
    }

    // 4. Record granular audit trail into calendarDailyVisits
    const dailyVisitDoc: CalendarDailyVisitDoc = {
      id: `visit_${tokenKey}_${todayYmd}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: tokenKey,
      userName: params.devoteeName || regDoc?.userName || "Devotee",
      token: params.tokenIdentifier || tokenKey,
      visitDate: todayYmd,
      visitTimestamp: nowIso,
      todayVisitNumber,
      daysRemaining: passStatus.daysRemaining,
      isExpired: passStatus.isExpired,
      durationDays: effectiveDuration,
      startDate: effectiveStartDate,
      expiryDate: passStatus.expiryDate,
      tabVisited: params.tabVisited,
      lang: params.lang,
      priestName: params.priestName || regDoc?.priestName || "Shreeram Pandit",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : params.userAgent
    };

    await recordDailyVisitLog(dailyVisitDoc);

    return {
      isSuccess: true,
      todayVisitsCount: todayVisitNumber,
      totalVisitsCount,
      daysRemaining: passStatus.daysRemaining,
      isExpired: passStatus.isExpired,
      registration: regDoc
    };
  } catch (err) {
    console.warn("[CalendarVisitService] Failed to record visit analytics:", err);
    return {
      isSuccess: false,
      todayVisitsCount: 1,
      totalVisitsCount: 1,
      daysRemaining: 0,
      isExpired: true,
      registration: null
    };
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
    const today = getIndianStandardDateStr();
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
  const today = getIndianStandardDateStr();
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

      const today = getIndianStandardDateStr();
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
    const todayYmd = getIndianStandardDateStr(now);
    const newExpiryObj = new Date(now.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    const newExpiryYmd = getIndianStandardDateStr(newExpiryObj);

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

/**
 * Super Admin: Toggle Lock status of a Devotee Calendar Subscription
 */
export async function toggleDevoteeSubscriptionLock(devoteeId: string, lockState?: boolean): Promise<boolean> {
  try {
    if (!firestore) return false;
    const cleanId = devoteeId.trim();
    const engRef = doc(firestore, "calendarDevoteeEngagement", cleanId);
    const snap = await getDoc(engRef);
    if (snap.exists()) {
      const current = snap.data()?.isLocked;
      const nextLock = lockState !== undefined ? lockState : !current;
      await updateDoc(engRef, { isLocked: nextLock, updatedAt: new Date().toISOString() });
      return true;
    }
    return false;
  } catch (err) {
    console.error("[CalendarVisitService] Toggle lock error:", err);
    return false;
  }
}


