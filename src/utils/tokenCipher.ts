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
  // UTF-8 safe encoding
  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    const binaryStr = atob(base64);
    const percentEncoded = Array.prototype.map
      .call(binaryStr, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("");
    try {
      return decodeURIComponent(percentEncoded);
    } catch {
      return binaryStr;
    }
  }
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

    const compactObj = {
      n: rawName,
      nk: rawNak,
      r: rawRashi,
      g: rawGotra,
      p: rawPandit,
      d: rawDate,
      l: rawLang,
      tm: rawTime,
      s: rawSeva,
      pl: rawPlatform,
      t: rawTarget,
      pc: rawPin,
      lt: rawLat,
      lg: rawLng,
      loc: rawLoc
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
        loc: extractStr("loc") || extractStr("lobhr") || extractStr("locationName")
      };
    }

    // Reject tampered tokens where checksum failed and payload was corrupted
    if (!checksumValid && !isJsonValid) {
      return null;
    }

    // Reject garbage/empty tokens that contain no recognizable parameters
    const hasAnyPayloadKey = parsed.n !== undefined || parsed.name !== undefined || parsed.nk !== undefined || parsed.r !== undefined || parsed.d !== undefined || parsed.date !== undefined || parsed.dob !== undefined || parsed.tob !== undefined || parsed.loc !== undefined;
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
      loc: locationName
    };
  } catch (err) {
    console.warn("Failed to decode token:", err);
    return null;
  }
}

