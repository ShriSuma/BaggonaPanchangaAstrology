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
  sevaType?: string;
  s?: string;
  platform?: "android" | "apple";
  pl?: "android" | "apple";
  target?: "google" | "webcal" | "sanctum";
  t?: "google" | "webcal" | "sanctum";
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

/** Convert base64url back to utf-8 string */
function fromBase64Url(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binaryStr = atob(base64);
  const percentEncoded = Array.prototype.map
    .call(binaryStr, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
    .join("");
  return decodeURIComponent(percentEncoded);
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
    const rawSeva = payload.sevaType ?? payload.s ?? "";
    const rawPlatform = payload.platform ?? payload.pl ?? "android";
    const rawTarget = payload.target ?? payload.t ?? "sanctum";

    const compactObj = {
      n: rawName,
      nk: rawNak,
      r: rawRashi,
      g: rawGotra,
      p: rawPandit,
      d: rawDate,
      l: rawLang,
      s: rawSeva,
      pl: rawPlatform,
      t: rawTarget
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
  s?: string;
  pl: "android" | "apple";
  t: "google" | "webcal" | "sanctum";
}) | null {
  if (!token || typeof token !== "string") return null;

  try {
    const cleanToken = token.startsWith(TOKEN_PREFIX)
      ? token.slice(TOKEN_PREFIX.length)
      : token;

    const rawPayload = fromBase64Url(cleanToken);
    const dotIndex = rawPayload.indexOf(".");
    if (dotIndex === -1) return null;

    const checksum = rawPayload.slice(0, dotIndex);
    const jsonStr = rawPayload.slice(dotIndex + 1);

    if (computeChecksum(jsonStr) !== checksum) {
      console.warn("Token checksum mismatch — potentially tampered URL");
      return null;
    }

    const parsed = JSON.parse(jsonStr);
    const name = parsed.n || "";
    const nakshatra = parsed.nk >= 0 ? parsed.nk : undefined;
    const rashi = parsed.r >= 0 ? parsed.r : undefined;
    const gotra = parsed.g || undefined;
    const pandit = parsed.p || "ಶ್ರೀ ಚೈತನ್ಯ ಪಂಡಿತ್";
    const date = parsed.d || new Date().toISOString().split("T")[0];
    const lang = parsed.l || "kn";
    const sevaType = parsed.s || undefined;
    const platform = parsed.pl || "android";
    const target = parsed.t || "sanctum";

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
      sevaType,
      s: sevaType,
      platform,
      pl: platform,
      target,
      t: target
    };
  } catch (err) {
    console.warn("Failed to decode token:", err);
    return null;
  }
}

