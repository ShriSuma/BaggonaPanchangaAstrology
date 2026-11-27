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
const LS_FREE_CLAIMED_SIGS_KEY = "baggona_hotel_qr_free_sigs_v1";
const memoryLocalFallback = new Map<string, HotelFreeUsageDoc>();

export interface HotelPersonSignatureInput {
  serviceMode: string;
  guestName: string;
  birthDate?: string;
  birthTime?: string;
  timePrecision?: string;
  placeName?: string;
  gender?: string;
  handSide?: string;
  prashnaDomain?: string;
  horarySeedNumber?: number;
  photoDigest?: string;
}

let cachedPublicIp: string | null = null;

function sanitizeKey(raw: string): string {
  return String(raw || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_");
}

function fnv1aBase36(raw: string): string {
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36);
}

export function buildPhotoDigestForQuota(dataUrl?: string | null): string {
  if (!dataUrl) return "";
  const len = dataUrl.length;
  const sample = `${len}|${dataUrl.slice(0, 48)}|${dataUrl.slice(-48)}`;
  return fnv1aBase36(sample);
}

export function buildPersonDetailsDocIds(sig?: HotelPersonSignatureInput): string[] {
  if (!sig) return [];
  const normName = String(sig.guestName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!normName) return [];

  const mode = String(sig.serviceMode || "kundli").trim().toLowerCase();
  const dob = String(sig.birthDate || "").trim();
  const tob = String(sig.birthTime || "").trim();
  const prec = String(sig.timePrecision || "").trim();
  const place = String(sig.placeName || "").trim().toLowerCase();
  const gender = String(sig.gender || "").trim().toLowerCase();
  const hand = String(sig.handSide || "").trim().toLowerCase();
  const dom = String(sig.prashnaDomain || "").trim().toLowerCase();
  const seed = sig.horarySeedNumber ? String(sig.horarySeedNumber) : "";
  const photo = String(sig.photoDigest || "").trim();

  const exactDetailCanonical = [
    mode,
    normName,
    dob,
    tob,
    prec,
    place,
    gender,
    hand,
    dom,
    seed,
    photo
  ].join("|");

  // Same person + same service (+ birth date for Kundli) lock prevents tweaking minor fields to re-generate free
  const personServiceCanonical = [
    mode,
    normName,
    mode === "kundli" ? dob : "",
    gender
  ].join("|");

  return [
    `sig_${fnv1aBase36(exactDetailCanonical)}`,
    `psig_${fnv1aBase36(personServiceCanonical)}`
  ];
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
  personSignature?: HotelPersonSignatureInput;
}): Promise<{
  allowed: boolean;
  alreadyUsed: boolean;
  reason?: "ip_or_device" | "same_person_or_details";
  ip: string;
  deviceId: string;
  priorRecord?: HotelFreeUsageDoc | null;
}> {
  const identity = await resolveClientNetworkAndDeviceIdentity({
    overrideIp: params.overrideIp,
    overrideDeviceId: params.overrideDeviceId
  });
  const sigDocIds = buildPersonDetailsDocIds(params.personSignature);

  // Never block paid users or PDF generation / re-downloads
  if (params.isPaymentVerified || params.isPaidFamilyUpsell) {
    return {
      allowed: true,
      alreadyUsed: false,
      ip: identity.ip,
      deviceId: identity.deviceId
    };
  }

  // 1. Check same-person / same-details signature ledger first (in-memory & localStorage)
  for (const sigId of sigDocIds) {
    if (memoryLocalFallback.has(sigId)) {
      return {
        allowed: false,
        alreadyUsed: true,
        reason: "same_person_or_details",
        ip: identity.ip,
        deviceId: identity.deviceId,
        priorRecord: memoryLocalFallback.get(sigId)!
      };
    }
  }
  if (typeof window !== "undefined" && sigDocIds.length > 0) {
    try {
      const rawSigs = window.localStorage.getItem(LS_FREE_CLAIMED_SIGS_KEY);
      if (rawSigs) {
        const sigMap = JSON.parse(rawSigs) as Record<string, HotelFreeUsageDoc>;
        for (const sigId of sigDocIds) {
          if (sigMap?.[sigId]?.firstUsedAt) {
            return {
              allowed: false,
              alreadyUsed: true,
              reason: "same_person_or_details",
              ip: identity.ip,
              deviceId: identity.deviceId,
              priorRecord: sigMap[sigId]
            };
          }
        }
      }
    } catch {}
  }

  // 2. Check IP & device in-memory & localStorage mirror
  if (identity.ipDocId && memoryLocalFallback.has(identity.ipDocId)) {
    return {
      allowed: false,
      alreadyUsed: true,
      reason: "ip_or_device",
      ip: identity.ip,
      deviceId: identity.deviceId,
      priorRecord: memoryLocalFallback.get(identity.ipDocId)!
    };
  }
  if (memoryLocalFallback.has(identity.deviceDocId)) {
    return {
      allowed: false,
      alreadyUsed: true,
      reason: "ip_or_device",
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
            reason: "ip_or_device",
            ip: identity.ip,
            deviceId: identity.deviceId,
            priorRecord: parsed
          };
        }
      }
    } catch {}
  }

  // 3. Check cross-session IP + Device + Person-Signature ledger in Firestore
  const remoteRecord = await getHotelFreeUsageRecord(
    identity.ipDocId,
    identity.deviceDocId,
    sigDocIds
  );
  if (remoteRecord && remoteRecord.firstUsedAt) {
    if (identity.ipDocId) memoryLocalFallback.set(identity.ipDocId, remoteRecord);
    memoryLocalFallback.set(identity.deviceDocId, remoteRecord);
    for (const sigId of sigDocIds) {
      memoryLocalFallback.set(sigId, remoteRecord);
    }
    const matchedSig = sigDocIds.includes(remoteRecord.key);
    return {
      allowed: false,
      alreadyUsed: true,
      reason: matchedSig ? "same_person_or_details" : "ip_or_device",
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
  personSignature?: HotelPersonSignatureInput;
}): Promise<HotelFreeUsageDoc> {
  const identity = await resolveClientNetworkAndDeviceIdentity({
    overrideIp: params.ip,
    overrideDeviceId: params.deviceId
  });
  const sigDocIds = buildPersonDetailsDocIds(params.personSignature);
  const docIds = [identity.ipDocId, identity.deviceDocId, ...sigDocIds].filter(Boolean);
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
      if (sigDocIds.length > 0) {
        const prevRaw = window.localStorage.getItem(LS_FREE_CLAIMED_SIGS_KEY);
        const prevMap = prevRaw ? (JSON.parse(prevRaw) as Record<string, HotelFreeUsageDoc>) : {};
        for (const sigId of sigDocIds) {
          prevMap[sigId] = { ...record, key: sigId };
        }
        window.localStorage.setItem(LS_FREE_CLAIMED_SIGS_KEY, JSON.stringify(prevMap));
      }
    } catch {}
  }
  await saveHotelFreeUsageRecord(docIds, record);
  return record;
}

export function clearTestHotelQuotaMemory(): void {
  memoryLocalFallback.clear();
  cachedPublicIp = null;
}

export function getFreeQuotaExhaustedMessage(
  lang: SevenLang,
  ip: string,
  reason: "ip_or_device" | "same_person_or_details" = "ip_or_device"
): string {
  const shownIp = ip && ip !== "local-device" ? ` (${ip})` : "";
  if (reason === "same_person_or_details") {
    return pick7(
      {
        kn: `🔒 ಇದೇ ವ್ಯಕ್ತಿ ಮತ್ತು ವಿವರಗಳಿಗೆ ಉಚಿತ ಪೂರ್ವವೀಕ್ಷಣೆ ಈಗಾಗಲೇ ಸಿದ್ಧವಾಗಿದೆ. ಪುನಃ ಉಚಿತವಾಗಿ ರಚಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ — ಸಂಪೂರ್ಣ ವಿವರ ಮತ್ತು PDF ಡೌನ್‌ಲೋಡ್‌ಗಾಗಿ ದಯವಿಟ್ಟು ಕೆಳಗೆ ಪಾವತಿ ಪೂರ್ಣಗೊಳಿಸಿ.`,
        en: `🔒 Free insights for this same person and details have already been generated once. Repeat free generation is disabled — please unlock & download the complete report PDF below.`,
        hi: `🔒 इसी व्यक्ति और विवरण के लिए निःशुल्क झलक पहले ही तैयार की जा चुकी है। दोबारा निःशुल्क जनरेट नहीं होगा — संपूर्ण विवरण व PDF डाउनलोड के लिए कृपया नीचे भुगतान पूरा करें।`,
        mr: `🔒 या व्यक्तीच्या याच तपशिलांसाठी मोफत झलक आधीच तयार झाली आहे. पुन्हा मोफत तपासणी उपलब्ध नाही — संपूर्ण अहवाल व PDF डाउनलोडसाठी खाली पेमेंट पूर्ण करा.`,
        te: `🔒 ఇదే వ్యక్తి మరియు వివరాల కోసం ఉచిత పరిశీలన ఇప్పటికే పూర్తయింది. మరలా ఉచితంగా పొందలేరు — పూర్తి వివరాలు & PDF డౌన్‌లోడ్ కోసం క్రింద చెల్లింపు పూర్తి చేయండి.`,
        ta: `🔒 இதே நபர் மற்றும் விவரங்களுக்கு இலவச முன்னோட்டம் ஏற்கனவே உருவாக்கப்பட்டுவிட்டது. மீண்டும் இலவசமாகப் பெற இயலாது — முழு விவரம் & PDF பதிவிறக்கத்திற்கு கீழே கட்டணம் செலுத்தவும்.`,
        ml: `🔒 ഇതേ വ്യക്തിക്കും വിവരങ്ങൾക്കുമായുള്ള സൗജന്യ പരിശോധന ഇതിനകം പൂർത്തിയായി. വീണ്ടും സൗജന്യമായി ലഭ്യമല്ല — പൂർണ്ണ വിവരങ്ങൾക്കും PDF ഡൗൺലോഡിനും താഴെ പണമടയ്ക്കുക.`
      },
      lang
    );
  }
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
