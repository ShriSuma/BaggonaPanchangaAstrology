import { firestore } from "../../services/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { notifyLowAiQuotaRemaining } from "../notifications/notificationService";

export interface DailyAiQuotaDoc {
  date: string; // YYYY-MM-DD
  totalCallsToday: number;
  dailyLimit: number;
  remainingCalls: number;
  featureBreakdown: {
    prashna: number;
    bhavishya: number;
    diksuchi: number;
    purvaJanma: number;
    ayurSanjeevini: number;
    facePalm: number;
    maranottara: number;
    other: number;
  };
  modelBreakdown: Record<string, number>;
  lastCalledAt: string;
  alert100Dispatched: boolean;
  updatedAt: string;
}

const AI_QUOTA_COL = "aiQuotaUsage";
export const DEFAULT_DAILY_AI_LIMIT = 1500;

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const localCacheKey = (dateStr: string) => `baggona_ai_quota_${dateStr}`;

function getInitialDailyQuota(dateStr: string, limit = DEFAULT_DAILY_AI_LIMIT): DailyAiQuotaDoc {
  return {
    date: dateStr,
    totalCallsToday: 0,
    dailyLimit: limit,
    remainingCalls: limit,
    featureBreakdown: {
      prashna: 0,
      bhavishya: 0,
      diksuchi: 0,
      purvaJanma: 0,
      ayurSanjeevini: 0,
      facePalm: 0,
      maranottara: 0,
      other: 0
    },
    modelBreakdown: {
      "gemini-3.5-flash-lite": 0
    },
    lastCalledAt: new Date().toISOString(),
    alert100Dispatched: false,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Fetch current day's AI quota usage from Firestore / Local Cache
 */
export async function getTodayAiQuotaUsage(): Promise<DailyAiQuotaDoc> {
  const dateStr = getTodayDateStr();

  // Try Firestore
  try {
    if (firestore) {
      const docRef = doc(firestore, AI_QUOTA_COL, dateStr);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as DailyAiQuotaDoc;
        if (typeof window !== "undefined") {
          localStorage.setItem(localCacheKey(dateStr), JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("[AITelemetry] Firestore fetch error, falling back to local:", err);
  }

  // Local fallback
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(localCacheKey(dateStr));
    if (cached) {
      try {
        return JSON.parse(cached) as DailyAiQuotaDoc;
      } catch {}
    }
  }

  return getInitialDailyQuota(dateStr);
}

/**
 * Record an AI call invocation across any module in the system
 */
export async function recordAiCallUsage(params: {
  feature?: "prashna" | "bhavishya" | "diksuchi" | "purvaJanma" | "ayurSanjeevini" | "facePalm" | "maranottara" | "other";
  model?: string;
  tokens?: number;
}): Promise<DailyAiQuotaDoc> {
  const dateStr = getTodayDateStr();
  const feature = params.feature || "other";
  const model = params.model || "gemini-3.5-flash-lite";

  let currentData = await getTodayAiQuotaUsage();
  if (currentData.date !== dateStr) {
    currentData = getInitialDailyQuota(dateStr, currentData.dailyLimit || DEFAULT_DAILY_AI_LIMIT);
  }

  const newTotal = (currentData.totalCallsToday || 0) + 1;
  const limit = currentData.dailyLimit || DEFAULT_DAILY_AI_LIMIT;
  const newRemaining = Math.max(0, limit - newTotal);

  const newFeatureBreakdown = {
    ...currentData.featureBreakdown,
    [feature]: ((currentData.featureBreakdown && currentData.featureBreakdown[feature]) || 0) + 1
  };

  const newModelBreakdown = {
    ...currentData.modelBreakdown,
    [model]: ((currentData.modelBreakdown && currentData.modelBreakdown[model]) || 0) + 1
  };

  let alertDispatched = currentData.alert100Dispatched || false;

  // Trigger Low Quota Alert Notification when remaining calls drop to <= 100
  if (newRemaining <= 100 && !alertDispatched) {
    alertDispatched = true;
    try {
      void notifyLowAiQuotaRemaining({
        remaining: newRemaining,
        totalToday: newTotal,
        dailyLimit: limit,
        featureBreakdown: newFeatureBreakdown
      });
      console.warn(`[AITelemetry] 🚨 Alert triggered: Last ${newRemaining} AI requests remaining for ${dateStr}!`);
    } catch (alertErr) {
      console.error("[AITelemetry] Failed to dispatch low quota notification:", alertErr);
    }
  }

  const updatedDoc: DailyAiQuotaDoc = {
    date: dateStr,
    totalCallsToday: newTotal,
    dailyLimit: limit,
    remainingCalls: newRemaining,
    featureBreakdown: newFeatureBreakdown,
    modelBreakdown: newModelBreakdown,
    lastCalledAt: new Date().toISOString(),
    alert100Dispatched: alertDispatched,
    updatedAt: new Date().toISOString()
  };

  // 1. Update client localStorage immediately
  if (typeof window !== "undefined") {
    localStorage.setItem(localCacheKey(dateStr), JSON.stringify(updatedDoc));
  }

  // 2. Persist to Firestore asynchronously
  try {
    if (firestore) {
      const docRef = doc(firestore, AI_QUOTA_COL, dateStr);
      await setDoc(docRef, updatedDoc, { merge: true });
    }
  } catch (err) {
    console.warn("[AITelemetry] Failed to persist AI quota in Firestore:", err);
  }

  return updatedDoc;
}

/**
 * Super Admin: Update the daily AI limit for today / system
 */
export async function updateDailyAiQuotaLimit(newLimit: number): Promise<boolean> {
  try {
    const dateStr = getTodayDateStr();
    const current = await getTodayAiQuotaUsage();
    const limit = Math.max(100, newLimit);
    const updated: DailyAiQuotaDoc = {
      ...current,
      dailyLimit: limit,
      remainingCalls: Math.max(0, limit - current.totalCallsToday),
      // reset alert flag if quota was increased above 100
      alert100Dispatched: limit - current.totalCallsToday > 100 ? false : current.alert100Dispatched,
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(localCacheKey(dateStr), JSON.stringify(updated));
    }

    if (firestore) {
      const docRef = doc(firestore, AI_QUOTA_COL, dateStr);
      await setDoc(docRef, updated, { merge: true });
    }
    return true;
  } catch (err) {
    console.error("[AITelemetry] Failed to update daily quota limit:", err);
    return false;
  }
}

/**
 * Real-time onSnapshot listener for Super Admin UI
 */
export function subscribeTodayAiQuota(callback: (quota: DailyAiQuotaDoc) => void): () => void {
  const dateStr = getTodayDateStr();

  // Instant local response
  void getTodayAiQuotaUsage().then(callback);

  if (!firestore) return () => {};

  try {
    const docRef = doc(firestore, AI_QUOTA_COL, dateStr);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DailyAiQuotaDoc;
        callback(data);
      }
    }, (err) => {
      console.warn("[AITelemetry] onSnapshot subscription warning:", err);
    });

    return unsubscribe;
  } catch {
    return () => {};
  }
}
