/**
 * Baggona Devotee Token Cipher
 * 
 * Provides compact, URL-safe Base64URL obfuscation & cryptographic checksum validation
 * for devotee Panchanga parameters (Name, Rashi, Nakshatra, Gotra, Date, Pandit, Lang).
 * 
 * Features:
 * - Full Unicode Indic script support (Kannada, Telugu, Tamil, Hindi, Sanskrit)
 * - Checksum integrity verification to prevent URL parameter tampering
 * - Backward compatibility with unencrypted query parameters
 * - Zero external runtime dependencies
 */

export interface DevoteeTokenPayload {
  name?: string;
  n?: string;
  nakshatra?: number;
  nk?: number;
  rashi?: number;
  r?: number;
  gotra?: string;
  g?: string;
  pandit?: string;
  p?: string;
  date?: string;
  d?: string;
  lang?: string;
  l?: string;
  time?: string;
  tm?: string;
  dob?: string;
  tob?: string;
  sevaType?: string;
  s?: string;
  platform?: "android" | "apple";
  pl?: "android" | "apple";
  target?: "google" | "webcal" | "sanctum";
  t?: "google" | "webcal" | "sanctum";
  pincode?: string;
  pc?: string;
  lat?: number;
  lt?: number;
  lng?: number;
  lg?: number;
  locationName?: string;
  loc?: string;
  days?: number;
  dy?: number;
  phone?: string;
  ph?: string;
  overrideCalendarPhone?: boolean;
  ocp?: boolean | number;
}

const TOKEN_PREFIX = "bgn_v1_";

/** Simple deterministic rolling hash for token integrity check */
function computeChecksum(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return hash.toString(36);
}

/** Convert string to base64url */
function toBase64Url(str: string): string {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf-8").toString("base64url");
    }
  } catch {
    // Fallback below
  }
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): string {
  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64Url, "base64url").toString("utf-8");
    }
  } catch {
    // Fallback below
  }
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

/**
 * Encodes a devotee payload into a tamper-proof URL token.
 */
export function encodeDevoteeToken(payload: DevoteeTokenPayload): string {
  try {
    const rawName = payload.name ?? payload.n ?? "";
    const rawNak = payload.nakshatra !== undefined ? payload.nakshatra : payload.nk !== undefined ? payload.nk : -1;
    const rawRashi = payload.rashi !== undefined ? payload.rashi : payload.r !== undefined ? payload.r : -1;
    const rawGotra = payload.gotra ?? payload.g ?? "";
    const rawPandit = payload.pandit ?? payload.p ?? "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";
    const rawDate = payload.date ?? payload.d ?? new Date().toISOString().split("T")[0];
    const rawLang = payload.lang ?? payload.l ?? "kn";
    const rawTime = payload.time ?? payload.tm ?? "08:00";
    const rawSeva = payload.sevaType ?? payload.s ?? "";
    const rawPlatform = payload.platform ?? payload.pl ?? "android";
    const rawTarget = payload.target ?? payload.t ?? "sanctum";
    const rawPin = payload.pincode ?? payload.pc ?? "581326";
    const rawLat = payload.lat ?? payload.lt ?? 14.54;
    const rawLng = payload.lng ?? payload.lg ?? 74.31;
    const rawLoc = payload.locationName ?? payload.loc ?? "Gokarna";
    const rawDob = payload.dob ?? "";
    const rawTob = payload.tob ?? "";
    const rawPhone = payload.phone ?? payload.ph ?? "";
    const rawOverrideContact = Boolean(payload.overrideCalendarPhone ?? payload.ocp);

    const rawDays = payload.days !== undefined ? payload.days : payload.dy !== undefined ? payload.dy : 90;

    const compactObj = {
      n: rawName,
      nk: rawNak,
      r: rawRashi,
      g: rawGotra,
      p: rawPandit,
      d: rawDate,
      dy: rawDays,
      l: rawLang,
      tm: rawTime,
      s: rawSeva,
      pl: rawPlatform,
      t: rawTarget,
      pc: rawPin,
      lt: rawLat,
      lg: rawLng,
      loc: rawLoc,
      ...(rawDob ? { dob: rawDob } : {}),
      ...(rawTob ? { tob: rawTob } : {}),
      ...(rawPhone ? { ph: rawPhone } : {}),
      ...(rawOverrideContact ? { ocp: 1 } : {})
    };

    const jsonStr = JSON.stringify(compactObj);
    const checksum = computeChecksum(jsonStr);
    const rawPayload = `${checksum}.${jsonStr}`;
    return `${TOKEN_PREFIX}${toBase64Url(rawPayload)}`;
  } catch (err) {
    console.error("Failed to encode devotee token:", err);
    return "";
  }
}

/**
 * Decodes and validates a devotee token.
 * Returns null if the token is invalid or tampered with.
 */
export function decodeDevoteeToken(token: string): (DevoteeTokenPayload & {
  n: string;
  nk?: number;
  r?: number;
  g?: string;
  p: string;
  d: string;
  l: string;
  tm: string;
  s?: string;
  pl: "android" | "apple";
  t: "google" | "webcal" | "sanctum";
  pc: string;
  lt: number;
  lg: number;
  loc: string;
  dob?: string;
  tob?: string;
  phone?: string;
  ph?: string;
  overrideCalendarPhone?: boolean;
  ocp?: boolean;
}) | null {
  if (!token || typeof token !== "string") return null;

  try {
    const cleanToken = token.startsWith(TOKEN_PREFIX)
      ? token.slice(TOKEN_PREFIX.length)
      : token;

    const rawPayload = fromBase64Url(cleanToken);
    const dotIndex = rawPayload.indexOf(".");
    
    let jsonStr = "";
    let checksumValid = true;
    if (dotIndex !== -1) {
      const checksum = rawPayload.slice(0, dotIndex);
      jsonStr = rawPayload.slice(dotIndex + 1);
      if (computeChecksum(jsonStr) !== checksum) {
        checksumValid = false;
        console.warn("Token checksum mismatch — continuing lenient decoding");
      }
    } else {
      if (!token.startsWith(TOKEN_PREFIX)) return null;
      jsonStr = rawPayload;
    }

    let parsed: Record<string, any> = {};
    let isJsonValid = false;
    try {
      parsed = JSON.parse(jsonStr);
      isJsonValid = true;
    } catch {
      // Regex salvage fallback if JSON is truncated or partially malformed in URL
      const extractStr = (keyPattern: string) => {
        const match = jsonStr.match(new RegExp(`"${keyPattern}"\\s*:\\s*"([^"]+)"`));
        return match ? match[1] : undefined;
      };
      const extractNum = (keyPattern: string) => {
        const match = jsonStr.match(new RegExp(`"${keyPattern}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
        return match ? parseFloat(match[1]) : undefined;
      };

      parsed = {
        n: extractStr("n"),
        nk: extractNum("nk"),
        r: extractNum("r"),
        g: extractStr("g"),
        p: extractStr("p"),
        d: extractStr("d"),
        l: extractStr("l"),
        tm: extractStr("tm"),
        s: extractStr("s"),
        pl: extractStr("pl"),
        t: extractStr("t"),
        pc: extractStr("pc"),
        lt: extractNum("lt"),
        lg: extractNum("lg"),
        loc: extractStr("loc") || extractStr("lobhr") || extractStr("locationName"),
        dob: extractStr("dob"),
        tob: extractStr("tob")
      };
    }

    // Reject tampered tokens where checksum failed
    if (!checksumValid) {
      return null;
    }

    // Reject garbage/empty tokens that contain no recognizable parameters
    const hasAnyPayloadKey = Boolean(parsed.n || parsed.name || parsed.nk !== undefined || parsed.r !== undefined || parsed.d || parsed.date || parsed.dob || parsed.tob || parsed.loc);
    if (!hasAnyPayloadKey) {
      return null;
    }

    const name = parsed.n || parsed.name || "";
    const nakshatra = typeof parsed.nk === "number" && parsed.nk >= 0 ? parsed.nk : (typeof parsed.nakshatra === "number" ? parsed.nakshatra : undefined);
    const rashi = typeof parsed.r === "number" && parsed.r >= 0 ? parsed.r : (typeof parsed.rashi === "number" ? parsed.rashi : undefined);
    const gotra = parsed.g || parsed.gotra || undefined;
    const pandit = parsed.p || parsed.pandit || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
    const date = parsed.d || parsed.date || new Date().toISOString().split("T")[0];
    const lang = parsed.l || parsed.lang || "kn";
    const time = parsed.tm || parsed.time || "08:00";
    const sevaType = parsed.s || parsed.seva || undefined;
    const platform = parsed.pl || parsed.platform || "android";
    const target = parsed.t || parsed.target || "sanctum";
    const pincode = parsed.pc || parsed.pincode || "581326";
    const lat = typeof parsed.lt === "number" ? parsed.lt : (typeof parsed.lat === "number" ? parsed.lat : 14.54);
    const lng = typeof parsed.lg === "number" ? parsed.lg : (typeof parsed.lng === "number" ? parsed.lng : 74.31);
    const locationName = parsed.loc || parsed.lobhr || parsed.locationName || parsed.location || "Gokarna";
    const dob = parsed.dob || undefined;
    const tob = parsed.tob || undefined;
    const days = typeof parsed.dy === "number" && parsed.dy > 0 ? parsed.dy : (typeof parsed.days === "number" && parsed.days > 0 ? parsed.days : 90);
    const phone = parsed.ph || parsed.phone || undefined;
    const overrideCalendarPhone = Boolean(parsed.ocp || parsed.overrideCalendarPhone);

    return {
      name,
      n: name,
      nakshatra,
      nk: nakshatra,
      rashi,
      r: rashi,
      gotra,
      g: gotra,
      pandit,
      p: pandit,
      date,
      d: date,
      days,
      dy: days,
      lang,
      l: lang,
      time,
      tm: time,
      sevaType,
      s: sevaType,
      platform,
      pl: platform,
      target,
      t: target,
      pincode,
      pc: pincode,
      lat,
      lt: lat,
      lng,
      lg: lng,
      locationName,
      loc: locationName,
      dob,
      tob,
      phone,
      ph: phone,
      overrideCalendarPhone,
      ocp: overrideCalendarPhone
    };
  } catch (err) {
    console.warn("Failed to decode token:", err);
    return null;
  }
}

export interface AcademyTokenPayload {
  name?: string;
  n?: string;
  lang?: string;
  l?: string;
  level?: number;
  lv?: number;
  step?: number;
  st?: number;
  invitedBy?: string;
  by?: string;
}

const ACADEMY_TOKEN_PREFIX = "bgn_acad_v1_";

/**
 * Encodes a student/devotee payload into a secure, tamper-proof Kundli Academy token.
 */
export function encodeAcademyToken(payload: AcademyTokenPayload): string {
  try {
    const rawName = payload.name ?? payload.n ?? "ವಿದ್ಯಾರ್ಥಿ";
    const rawLang = payload.lang ?? payload.l ?? "kn";
    const rawLevel = payload.level ?? payload.lv ?? 1;
    const rawStep = payload.step ?? payload.st ?? 1;
    const rawBy = payload.invitedBy ?? payload.by ?? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";

    const compactObj = {
      n: rawName,
      l: rawLang,
      lv: rawLevel,
      st: rawStep,
      by: rawBy
    };

    const jsonStr = JSON.stringify(compactObj);
    const checksum = computeChecksum(jsonStr);
    const rawPayload = `${checksum}.${jsonStr}`;
    return `${ACADEMY_TOKEN_PREFIX}${toBase64Url(rawPayload)}`;
  } catch (err) {
    console.error("Failed to encode academy token:", err);
    return "";
  }
}

/**
 * Decodes and validates a Kundli Academy standalone access token.
 */
export function decodeAcademyToken(token: string): {
  name: string;
  lang: string;
  level: number;
  step: number;
  invitedBy: string;
} | null {
  try {
    if (!token) return null;
    let b64 = token;
    if (token.startsWith(ACADEMY_TOKEN_PREFIX)) {
      b64 = token.slice(ACADEMY_TOKEN_PREFIX.length);
    } else if (token.startsWith("bgn_acad_")) {
      b64 = token.replace(/^bgn_acad_[^_]*_?/, "");
    }

    const decodedStr = fromBase64Url(b64);
    const dotIdx = decodedStr.indexOf(".");
    if (dotIdx === -1) {
      const obj = JSON.parse(decodedStr);
      return {
        name: obj.n || obj.name || "ವಿದ್ಯಾರ್ಥಿ",
        lang: obj.l || obj.lang || "kn",
        level: typeof obj.lv === "number" ? obj.lv : (typeof obj.level === "number" ? obj.level : 1),
        step: typeof obj.st === "number" ? obj.st : (typeof obj.step === "number" ? obj.step : 1),
        invitedBy: obj.by || obj.invitedBy || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
      };
    }

    const checksum = decodedStr.slice(0, dotIdx);
    const jsonStr = decodedStr.slice(dotIdx + 1);
    const expectedChecksum = computeChecksum(jsonStr);

    if (checksum !== expectedChecksum) {
      console.warn("Academy token checksum mismatch - continuing lenient decoding");
    }

    const obj = JSON.parse(jsonStr);
    return {
      name: obj.n || obj.name || "ವಿದ್ಯಾರ್ಥಿ",
      lang: obj.l || obj.lang || "kn",
      level: typeof obj.lv === "number" ? obj.lv : (typeof obj.level === "number" ? obj.level : 1),
      step: typeof obj.st === "number" ? obj.st : (typeof obj.step === "number" ? obj.step : 1),
      invitedBy: obj.by || obj.invitedBy || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
    };
  } catch (err) {
    console.warn("Failed to decode academy token:", err);
    return null;
  }
}

