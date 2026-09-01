/**
 * Sarvam AI Voice Quota & Telemetry Sentinel Service
 * 
 * Tracks:
 * - Real-time character consumption & TTS API requests in Cloud Firestore (`system_telemetry/sarvam_ai_usage`)
 * - Quota calculation: Total Quota, Consumed Characters, Remaining Characters & Remaining Percentage (%)
 * - Automatic Critical Alert Dispatch: When remaining quota falls below 10%, triggers an immediate
 *   critical email notification to spshreepandit@gmail.com.
 * - Test environment guard: Prevents mock runs / Vitest from polluting production metrics.
 */

import { firestore } from "../../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendSarvamCriticalQuotaAlertEmail } from "../notifications/notificationService";
import { isTestEnvironment } from "../../utils/testEnvGuard";

export interface SarvamQuotaTelemetry {
  totalQuota: number; // e.g., 500,000 characters
  consumed: number; // cumulative characters synthesized
  remaining: number; // totalQuota - consumed
  remainingPercentage: number; // (remaining / totalQuota) * 100
  totalCalls: number; // count of TTS requests
  status: "healthy" | "warning" | "critical";
  lastSynthesizedAt?: string;
  lastCriticalAlertSentAt?: string;
  updatedAt?: string;
}

export const DEFAULT_SARVAM_TOTAL_QUOTA = 500000; // 500k characters standard Indic TTS subscription
const SARVAM_TELEMETRY_STORAGE_KEY = "baggona_sarvam_quota_telemetry";
const TELEMETRY_COL = "system_telemetry";
const TELEMETRY_DOC_ID = "sarvam_ai_usage";

/**
 * Reads the latest Sarvam AI quota telemetry from local storage / Cloud Firestore.
 */
export async function getSarvamQuotaTelemetry(): Promise<SarvamQuotaTelemetry> {
  const defaultTelemetry: SarvamQuotaTelemetry = {
    totalQuota: DEFAULT_SARVAM_TOTAL_QUOTA,
    consumed: 0,
    remaining: DEFAULT_SARVAM_TOTAL_QUOTA,
    remainingPercentage: 100,
    totalCalls: 0,
    status: "healthy"
  };

  // 1. Read from LocalStorage Cache first
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(SARVAM_TELEMETRY_STORAGE_KEY);
      if (raw) {
        Object.assign(defaultTelemetry, JSON.parse(raw));
      }
    } catch {}
  }

  // 2. Read from Cloud Firestore
  if (!isTestEnvironment() && firestore) {
    try {
      const docRef = doc(firestore, TELEMETRY_COL, TELEMETRY_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data();
        const totalQuota = Number(cloudData.totalQuota) || defaultTelemetry.totalQuota;
        const consumed = Number(cloudData.consumed) || 0;
        const remaining = Math.max(0, totalQuota - consumed);
        const remainingPercentage = totalQuota > 0 ? (remaining / totalQuota) * 100 : 0;

        let status: SarvamQuotaTelemetry["status"] = "healthy";
        if (remainingPercentage <= 10) status = "critical";
        else if (remainingPercentage <= 25) status = "warning";

        const merged: SarvamQuotaTelemetry = {
          totalQuota,
          consumed,
          remaining,
          remainingPercentage,
          totalCalls: Number(cloudData.totalCalls) || 0,
          status,
          lastSynthesizedAt: cloudData.lastSynthesizedAt,
          lastCriticalAlertSentAt: cloudData.lastCriticalAlertSentAt,
          updatedAt: cloudData.updatedAt
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(SARVAM_TELEMETRY_STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
        return merged;
      }
    } catch (err) {
      console.warn("[SarvamQuotaService] Firestore telemetry read warning:", err);
    }
  }

  return defaultTelemetry;
}

/**
 * Records a completed Sarvam AI TTS generation, updates telemetry, and checks for critical 10% threshold.
 */
export async function recordSarvamAudioUsage(
  characterCount: number,
  textSnippet?: string
): Promise<SarvamQuotaTelemetry> {
  const current = await getSarvamQuotaTelemetry();
  const charsToAdd = Math.max(1, characterCount);

  const newConsumed = current.consumed + charsToAdd;
  const newTotalCalls = current.totalCalls + 1;
  const newRemaining = Math.max(0, current.totalQuota - newConsumed);
  const newRemainingPercentage = current.totalQuota > 0 ? (newRemaining / current.totalQuota) * 100 : 0;

  let status: SarvamQuotaTelemetry["status"] = "healthy";
  if (newRemainingPercentage <= 10) status = "critical";
  else if (newRemainingPercentage <= 25) status = "warning";

  const nowIso = new Date().toISOString();
  let lastCriticalAlertSentAt = current.lastCriticalAlertSentAt;

  // ── Critical Threshold Alert Trigger (< 10% Remaining) ──
  if (newRemainingPercentage <= 10) {
    const lastAlertMs = lastCriticalAlertSentAt ? new Date(lastCriticalAlertSentAt).getTime() : 0;
    const cooldownMs = 12 * 60 * 60 * 1000; // 12 hours cooldown to avoid duplicate email bombardment
    const nowMs = Date.now();

    if (!lastAlertMs || nowMs - lastAlertMs > cooldownMs) {
      console.warn(`[SarvamQuotaService] 🚨 CRITICAL: Remaining Sarvam AI quota is ${newRemainingPercentage.toFixed(1)}%! Sending critical alert email...`);
      lastCriticalAlertSentAt = nowIso;

      if (!isTestEnvironment()) {
        void sendSarvamCriticalQuotaAlertEmail({
          totalQuota: current.totalQuota,
          consumed: newConsumed,
          remaining: newRemaining,
          remainingPercentage: newRemainingPercentage,
          totalCalls: newTotalCalls,
          lastSnippet: textSnippet
        }).catch((err) => {
          console.error("[SarvamQuotaService] Failed to send critical quota email alert:", err);
        });
      }
    }
  }

  const updated: SarvamQuotaTelemetry = {
    totalQuota: current.totalQuota,
    consumed: newConsumed,
    remaining: newRemaining,
    remainingPercentage: newRemainingPercentage,
    totalCalls: newTotalCalls,
    status,
    lastSynthesizedAt: nowIso,
    lastCriticalAlertSentAt,
    updatedAt: nowIso
  };

  // 1. Cache locally
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SARVAM_TELEMETRY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  // 2. Cloud Firestore Sync (Non-blocking)
  if (!isTestEnvironment() && firestore) {
    try {
      const docRef = doc(firestore, TELEMETRY_COL, TELEMETRY_DOC_ID);
      void setDoc(docRef, {
        ...updated,
        serverTimestamp: serverTimestamp()
      }, { merge: true }).catch(() => {});
    } catch (err) {
      console.warn("[SarvamQuotaService] Firestore telemetry write error:", err);
    }
  }

  return updated;
}

/**
 * Updates the total quota limit (e.g. after purchasing more character credits on dashboard.sarvam.ai).
 */
export async function updateSarvamTotalQuota(newTotalQuota: number): Promise<SarvamQuotaTelemetry> {
  const current = await getSarvamQuotaTelemetry();
  const safeTotal = Math.max(1000, newTotalQuota);
  const remaining = Math.max(0, safeTotal - current.consumed);
  const remainingPercentage = (remaining / safeTotal) * 100;

  let status: SarvamQuotaTelemetry["status"] = "healthy";
  if (remainingPercentage <= 10) status = "critical";
  else if (remainingPercentage <= 25) status = "warning";

  const updated: SarvamQuotaTelemetry = {
    ...current,
    totalQuota: safeTotal,
    remaining,
    remainingPercentage,
    status,
    updatedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SARVAM_TELEMETRY_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  if (!isTestEnvironment() && firestore) {
    try {
      const docRef = doc(firestore, TELEMETRY_COL, TELEMETRY_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.warn("[SarvamQuotaService] Firestore total quota update error:", err);
    }
  }

  return updated;
}
