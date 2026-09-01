/**
 * Baggona Panchanga - Punya Butte & Karma Butte Ledger & Satkarma Timer Engine
 * (ಪುಣ್ಯ ಬುಟ್ಟಿ & ಕರ್ಮ ಬುಟ್ಟಿ ದೈವಿಕ ಲೆಕ್ಕಪತ್ರ ಹಾಗೂ ಸತ್ಕರ್ಮ ನಿರ್ವಹಣಾ ಎಂಜಿನ್)
 * 
 * Manages:
 * 1. Punya Butte (+1 point on Satkarma Done) & Karma Butte (+1 point on Satkarma Missed)
 * 2. 3-Hour Active Countdown Timer for "Still Not Yet (Maybe Later)"
 * 3. Daily Single-Completion dismissal (hidden for the rest of the day once completed/skipped)
 * 4. Resilient persistence via Dexie IndexedDB + LocalStorage fallback
 */

import { db, type PunyaKarmaLedgerRecord, type PunyaKarmaSummaryRecord } from "../../db/indexedDb";

export type SatkarmaActionType = "done" | "maybe_later" | "no";

export interface PunyaKarmaState {
  totalPunya: number;
  totalKarma: number;
  statusToday: SatkarmaActionType | null;
  remindAfterTimestamp: number | null;
  isDismissedToday: boolean;
  canShowNow: boolean;
}

const STORAGE_PREFIX = "baggona_punya_karma";
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

/**
 * Generates today's YMD string (YYYY-MM-DD)
 */
export function getTodayYmdString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Checks if the Daily Satkarma card should currently be displayed to the user.
 * - Returns FALSE if user marked 'done' today (dismissed for entire day).
 * - Returns FALSE if user marked 'no' today (dismissed for entire day).
 * - Returns FALSE if user marked 'maybe_later' AND 3 hours have NOT yet passed.
 * - Returns TRUE if user marked 'maybe_later' AND 3 hours HAVE passed (clock expired, remind again).
 * - Returns TRUE if user has not interacted with today's deed yet.
 */
export async function shouldShowDailySatkarmaCard(
  dateYmd: string = getTodayYmdString(),
  userId: string = "guest_devotee"
): Promise<boolean> {
  try {
    // 1. Check local storage cache first for instant synchronous/hybrid feedback
    const localKey = `${STORAGE_PREFIX}_${userId}_${dateYmd}`;
    const localRaw = typeof window !== "undefined" ? localStorage.getItem(localKey) : null;
    
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as {
        action: SatkarmaActionType;
        remindAfter?: number;
      };

      if (parsed.action === "done" || parsed.action === "no") {
        return false; // Dismissed for whole day
      }

      if (parsed.action === "maybe_later" && parsed.remindAfter) {
        if (Date.now() < parsed.remindAfter) {
          return false; // Still within 3-hour snooze window
        }
        // 3 hours elapsed! Remind user again
        return true;
      }
    }

    // 2. Query IndexedDB
    if (db && db.isOpen()) {
      const record = await db.punyaKarmaLedger
        .where("dateYmd")
        .equals(dateYmd)
        .and((r) => r.userId === userId)
        .first();

      if (record) {
        if (record.action === "done" || record.action === "no") {
          return false;
        }
        if (record.action === "maybe_later" && record.remindAfterTimestamp) {
          if (Date.now() < record.remindAfterTimestamp) {
            return false;
          }
          return true;
        }
      }
    }
  } catch (err) {
    console.warn("[PunyaKarmaService] shouldShowDailySatkarmaCard lookup error:", err);
  }

  return true;
}

/**
 * Records an interactive action on today's Satkarma deed and updates Punya / Karma tallies in DB.
 * 
 * Rules:
 * - "done": +1 Punya Butte point, dismissed for entire day
 * - "maybe_later": 0 points, snoozes popup for 3 hours (clock ticking in DB)
 * - "no": +1 Karma Butte point, dismissed for entire day
 */
export async function recordSatkarmaAction(
  action: SatkarmaActionType,
  deedTitle: string,
  dateYmd: string = getTodayYmdString(),
  userId: string = "guest_devotee",
  devoteeToken?: string
): Promise<{ success: boolean; punyaTotal: number; karmaTotal: number }> {
  const now = Date.now();
  const punyaDelta = action === "done" ? 1 : 0;
  const karmaDelta = action === "no" ? 1 : 0;
  const remindAfterTimestamp = action === "maybe_later" ? now + THREE_HOURS_MS : undefined;

  const ledgerEntry: PunyaKarmaLedgerRecord = {
    id: `ledger_${dateYmd}_${userId}_${now}`,
    userId,
    devoteeToken,
    dateYmd,
    deedTitle,
    action,
    punyaDelta,
    karmaDelta,
    remindAfterTimestamp,
    timestamp: now
  };

  // 1. Update LocalStorage fallback
  try {
    if (typeof window !== "undefined") {
      const localKey = `${STORAGE_PREFIX}_${userId}_${dateYmd}`;
      localStorage.setItem(localKey, JSON.stringify({
        action,
        remindAfter: remindAfterTimestamp,
        timestamp: now,
        deedTitle
      }));

      // Update local cumulative totals
      const summaryKey = `${STORAGE_PREFIX}_summary_${userId}`;
      const existingSummary = localStorage.getItem(summaryKey);
      let currentPunya = 0;
      let currentKarma = 0;
      if (existingSummary) {
        const parsed = JSON.parse(existingSummary);
        currentPunya = Number(parsed.totalPunya) || 0;
        currentKarma = Number(parsed.totalKarma) || 0;
      }
      currentPunya += punyaDelta;
      currentKarma += karmaDelta;

      localStorage.setItem(summaryKey, JSON.stringify({
        totalPunya: currentPunya,
        totalKarma: currentKarma,
        lastActionYmd: dateYmd,
        updatedAt: now
      }));
    }
  } catch (e) {
    console.warn("[PunyaKarmaService] LocalStorage save error:", e);
  }

  // 2. Update IndexedDB tables
  let punyaTotal = 0;
  let karmaTotal = 0;

  try {
    if (db) {
      // Put ledger transaction
      await db.punyaKarmaLedger.put(ledgerEntry);

      // Update Summary table
      const summaryId = `summary_${userId}`;
      const existing = await db.punyaKarmaSummary.get(summaryId);
      
      punyaTotal = (existing?.totalPunya || 0) + punyaDelta;
      karmaTotal = (existing?.totalKarma || 0) + karmaDelta;
      const completedDays = (existing?.completedDaysCount || 0) + (action === "done" ? 1 : 0);
      const missedDays = (existing?.missedDaysCount || 0) + (action === "no" ? 1 : 0);

      const updatedSummary: PunyaKarmaSummaryRecord = {
        id: summaryId,
        totalPunya: punyaTotal,
        totalKarma: karmaTotal,
        completedDaysCount: completedDays,
        missedDaysCount: missedDays,
        lastActionYmd: dateYmd,
        lastActionTimestamp: now,
        updatedAt: now
      };

      await db.punyaKarmaSummary.put(updatedSummary);
    }
  } catch (err) {
    console.warn("[PunyaKarmaService] IndexedDB update error (using local storage):", err);
  }

  return {
    success: true,
    punyaTotal,
    karmaTotal
  };
}

/**
 * Retrieves the current devotee's Punya / Karma tallies from DB.
 */
export async function getPunyaKarmaSummary(
  userId: string = "guest_devotee"
): Promise<{ totalPunya: number; totalKarma: number }> {
  try {
    if (db && db.isOpen()) {
      const summaryId = `summary_${userId}`;
      const summary = await db.punyaKarmaSummary.get(summaryId);
      if (summary) {
        return {
          totalPunya: summary.totalPunya || 0,
          totalKarma: summary.totalKarma || 0
        };
      }
    }

    // Fallback to LocalStorage
    if (typeof window !== "undefined") {
      const summaryKey = `${STORAGE_PREFIX}_summary_${userId}`;
      const raw = localStorage.getItem(summaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          totalPunya: Number(parsed.totalPunya) || 0,
          totalKarma: Number(parsed.totalKarma) || 0
        };
      }
    }
  } catch {}

  return { totalPunya: 0, totalKarma: 0 };
}
