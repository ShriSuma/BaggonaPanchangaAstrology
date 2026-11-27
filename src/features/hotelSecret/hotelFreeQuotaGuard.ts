/**
 * Hotel Table QR Free-Answer IP Address & Device Fingerprint Guard
 * =================================================================
 * Purpose:
 *   Prevents repeated free preview answers from the same guest IP address or device
 *   after their first free preview on the Hotel Table QR flow.
 *   NEVER blocks paid PDF generation, re-downloads, or language switches after payment.
 */

import {
  getHotelFreeUsageRecord,
  saveHotelFreeUsageRecord,
  type HotelFreeUsageDoc
} from "../../db/firestoreDb";
import { pick7, type SevenLang } from "../../services/sampoornaMaster25Locale7L";

const LS_DEVICE_FP_KEY = "baggona_hotel_device_fp_v1";
const LS_FREE_CLAIMED_KEY = "baggona_hotel_qr_free_claimed_v1";
const memoryLocalFallback = new Map<string, HotelFreeUsageDoc>();

let cachedPublicIp: string | null = null;

function sanitizeKey(raw: string): string {
  return String(raw || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
}

function buildBrowserFingerprint(): string {
  if (typeof window === "undefined") return "ssr_device";
  try {
    const existing = window.localStorage.getItem(LS_DEVICE_FP_KEY);
    if (existing) return existing;
  } catch {}

  const rawSignals = [
    typeof navigator !== "undefined" ? navigator.userAgent : "ua",
    typeof screen !== "undefined" ? `${screen.width}x${screen.height}x${screen.colorDepth}` : "scr",
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "tz",
    typeof navigator !== "undefined" ? String(navigator.language || "en") : "lang"
  ].join("|");

  let hash = 2166136261;
  for (let i = 0; i < rawSignals.length; i++) {
    hash ^= rawSignals.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const fp = `dev_${hash.toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  try {
    window.localStorage.setItem(LS_DEVICE_FP_KEY, fp);
  } catch {}
  return fp;
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    const res = await fetch(url, {
      method: "GET",
      signal: controller?.signal,
      cache: "no-store"
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      const ip = String(data?.ip || "").trim();
      return ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1" ? ip : null;
    }
    const text = (await res.text()).trim();
    return text && text.length <= 64 && !text.includes("<") && text !== "::1" && text !== "127.0.0.1"
      ? text
      : null;
  } catch {
    return null;
  }
}

export async function resolveClientNetworkAndDeviceIdentity(options?: {
  overrideIp?: string;
  overrideDeviceId?: string;
}): Promise<{ ip: string; deviceId: string; ipDocId: string; deviceDocId: string }> {
  const deviceId = options?.overrideDeviceId || buildBrowserFingerprint();
  const isTestMode =
    typeof process !== "undefined" &&
    (process.env?.NODE_ENV === "test" || process.env?.VITEST === "true");

  let ip = (options?.overrideIp || "").trim();
  if (!ip && cachedPublicIp) {
    ip = cachedPublicIp;
  }
  if (!ip && !isTestMode && typeof window !== "undefined") {
    const apiIp = await fetchJsonWithTimeout("/api/client-ip", 900);
    if (apiIp) {
      ip = apiIp;
    } else {
      const ipifyIp = await fetchJsonWithTimeout("https://api.ipify.org?format=json", 1400);
      if (ipifyIp) {
        ip = ipifyIp;
      } else {
        const ipapiIp = await fetchJsonWithTimeout("https://ipapi.co/ip/", 1200);
        if (ipapiIp) ip = ipapiIp;
      }
    }
    if (ip) cachedPublicIp = ip;
  }

  const finalIp = ip || "local-device";
  const ipDocId = finalIp !== "local-device" ? `ip_${sanitizeKey(finalIp)}` : "";
  const deviceDocId = `dev_${sanitizeKey(deviceId)}`;
  return { ip: finalIp, deviceId, ipDocId, deviceDocId };
}

export async function checkHotelFreePreviewQuota(params: {
  isPaymentVerified: boolean;
  isPaidFamilyUpsell?: boolean;
  overrideIp?: string;
  overrideDeviceId?: string;
}): Promise<{
  allowed: boolean;
  alreadyUsed: boolean;
  ip: string;
  deviceId: string;
  priorRecord?: HotelFreeUsageDoc | null;
}> {
  const identity = await resolveClientNetworkAndDeviceIdentity({
    overrideIp: params.overrideIp,
    overrideDeviceId: params.overrideDeviceId
  });

  // Never block paid users or PDF generation / re-downloads
  if (params.isPaymentVerified || params.isPaidFamilyUpsell) {
    return {
      allowed: true,
      alreadyUsed: false,
      ip: identity.ip,
      deviceId: identity.deviceId
    };
  }

  // 1. Check in-memory & localStorage mirror
  if (identity.ipDocId && memoryLocalFallback.has(identity.ipDocId)) {
    return {
      allowed: false,
      alreadyUsed: true,
      ip: identity.ip,
      deviceId: identity.deviceId,
      priorRecord: memoryLocalFallback.get(identity.ipDocId)!
    };
  }
  if (memoryLocalFallback.has(identity.deviceDocId)) {
    return {
      allowed: false,
      alreadyUsed: true,
      ip: identity.ip,
      deviceId: identity.deviceId,
      priorRecord: memoryLocalFallback.get(identity.deviceDocId)!
    };
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(LS_FREE_CLAIMED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HotelFreeUsageDoc;
        if (parsed?.firstUsedAt) {
          return {
            allowed: false,
            alreadyUsed: true,
            ip: identity.ip,
            deviceId: identity.deviceId,
            priorRecord: parsed
          };
        }
      }
    } catch {}
  }

  // 2. Check cross-session IP + Device ledger in Firestore
  const remoteRecord = await getHotelFreeUsageRecord(identity.ipDocId, identity.deviceDocId);
  if (remoteRecord && remoteRecord.firstUsedAt) {
    if (identity.ipDocId) memoryLocalFallback.set(identity.ipDocId, remoteRecord);
    memoryLocalFallback.set(identity.deviceDocId, remoteRecord);
    return {
      allowed: false,
      alreadyUsed: true,
      ip: identity.ip,
      deviceId: identity.deviceId,
      priorRecord: remoteRecord
    };
  }

  return {
    allowed: true,
    alreadyUsed: false,
    ip: identity.ip,
    deviceId: identity.deviceId
  };
}

export async function markHotelFreePreviewConsumed(params: {
  ip?: string;
  deviceId?: string;
  serviceUsed: string;
  hotelName: string;
  tableNumber: string;
  guestName: string;
}): Promise<HotelFreeUsageDoc> {
  const identity = await resolveClientNetworkAndDeviceIdentity({
    overrideIp: params.ip,
    overrideDeviceId: params.deviceId
  });
  const docIds = [identity.ipDocId, identity.deviceDocId].filter(Boolean);
  const record: HotelFreeUsageDoc = {
    key: docIds[0] || identity.deviceDocId,
    ip: identity.ip,
    deviceId: identity.deviceId,
    serviceUsed: params.serviceUsed,
    hotelName: params.hotelName || "Pandit Palette",
    tableNumber: params.tableNumber || "1",
    guestName: params.guestName || "Guest",
    firstUsedAt: new Date().toISOString()
  };

  for (const id of docIds) {
    memoryLocalFallback.set(id, record);
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LS_FREE_CLAIMED_KEY, JSON.stringify(record));
    } catch {}
  }
  await saveHotelFreeUsageRecord(docIds, record);
  return record;
}

export function clearTestHotelQuotaMemory(): void {
  memoryLocalFallback.clear();
  cachedPublicIp = null;
}

export function getFreeQuotaExhaustedMessage(lang: SevenLang, ip: string): string {
  const shownIp = ip && ip !== "local-device" ? ` (${ip})` : "";
  return pick7(
    {
      kn: `🔒 ನಿಮ್ಮ ಸಾಧನ/IP ವಿಳಾಸದಿಂದ${shownIp} ಇಂದಿನ ೧ ಉಚಿತ ಟೇಬಲ್ ಪರೀಕ್ಷೆ ಈಗಾಗಲೇ ಬಳಕೆಯಾಗಿದೆ. ಮುಂದಿನ ಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ PDF ಡೌನ್‌ಲೋಡ್‌ಗಾಗಿ ದಯವಿಟ್ಟು ಕೆಳಗೆ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ.`,
      en: `🔒 Your 1 Free Table Preview has already been claimed from this IP/device${shownIp}. To ask more or download your complete report PDF, please complete the payment unlock below.`,
      hi: `🔒 आपके इस IP/डिवाइस${shownIp} से १ निःशुल्क टेबल झलक पहले ही उपयोग की जा चुकी है। आगे के विस्तृत उत्तर और PDF डाउनलोड के लिए कृपया नीचे भुगतान पूरा करें।`,
      mr: `🔒 तुमच्या या IP/डिव्हाइसवरून${shownIp} १ मोफत टेबल तपासणी आधीच वापरली गेली आहे. पुढील सखोल अहवाल व PDF डाउनलोडसाठी कृपया खाली पेमेंट पूर्ण करा.`,
      te: `🔒 మీ ఈ IP/డివైస్ నుండి${shownIp} 1 ఉచిత టేబుల్ పరిశీలన ఇప్పటికే ఉపయోగించబడింది. తదుపరి పూర్తి వివరాలు & PDF డౌన్‌లోడ్ కోసం దయచేసి క్రింద చెల్లింపు పూర్తి చేయండి.`,
      ta: `🔒 உங்கள் இந்த IP/சாதனத்திலிருந்து${shownIp} 1 இலவச முன்னோட்டம் ஏற்கனவே பயன்படுத்தப்பட்டுவிட்டது. மேலும் முழுமையான பலன் & PDF பதிவிறக்கத்திற்குக் கீழே கட்டணம் செலுத்தவும்.`,
      ml: `🔒 നിങ്ങളുടെ ഈ IP/ഉപകരണത്തിൽ നിന്ന്${shownIp} 1 സൗജന്യ പരിശോധന ഇതിനകം ഉപയോഗിച്ചിട്ടുണ്ട്. കൂടുതൽ വിവരങ്ങൾക്കും പൂർണ്ണ PDF ഡൗൺലോഡിനും ദയവായി താഴെ പണമടയ്ക്കുക.`
    },
    lang
  );
}
