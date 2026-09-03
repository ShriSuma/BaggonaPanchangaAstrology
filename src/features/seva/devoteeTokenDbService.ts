/**
 * Baggona Panchanga Devotee Token Database Service
 * 
 * Provides:
 * 1. Short, ultra-compact database-backed Devotee Tokens for instant QR scannability (< 50 chars).
 * 2. 90-Day Access Tracking & Analytics (last accessed, view count, days remaining).
 * 3. 100% Backward Compatibility with legacy Base64URL tokens via auto-migrating Token Mapping Table.
 * 4. Automatic 90-day expiration cleanup maintenance.
 */

import {
  type DevoteeTokenDoc,
  type TokenMappingDoc,
  saveDevoteeTokenToDb,
  getDevoteeTokenFromDb,
  recordDevoteeTokenAccess,
  saveTokenMappingToDb,
  getTokenMappingFromDb,
  deleteExpiredTokensAndMappings
} from "../../db/firestoreDb";
import {
  type DevoteeTokenPayload,
  decodeDevoteeToken,
  encodeDevoteeToken
} from "../../utils/tokenCipher";
import { getSafeProductionOrigin } from "./icsCalendarGenerator";

const BASE62_CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Generates an 8-character base62 short code (e.g. "K9X2M4P7")
 */
export function generateShortCode(length = 8): string {
  let result = "";
  const randomBytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[randomBytes[i] % BASE62_CHARS.length];
  }
  return result;
}

/**
 * Creates a deterministic hash key for legacy Base64 tokens
 */
export function hashLegacyToken(token: string): string {
  let hash = 5381;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) + hash) + token.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return `map_${hash.toString(36)}_${token.slice(-6).replace(/[^a-zA-Z0-9]/g, "")}`;
}

export interface CreateDatabaseTokenResult {
  tokenId: string;
  shortCode: string;
  tokenDoc: DevoteeTokenDoc;
  sanctumUrl: string;
  shortSanctumUrl: string;
}

export interface ResolveTokenResult {
  payload: DevoteeTokenPayload;
  isLegacy: boolean;
  tokenId: string;
  shortCode?: string;
  daysRemaining: number;
  isExpired: boolean;
  accessCount: number;
  createdAt: string;
  expiresAt: string;
}

/**
 * Creates and stores a new 90-day Devotee Token in the database.
 */
export async function createDatabaseDevoteeToken(
  payload: DevoteeTokenPayload,
  totalDays: number = 90,
  origin: string = getSafeProductionOrigin()
): Promise<CreateDatabaseTokenResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const shortCode = generateShortCode(8);
  const tokenId = `bgn_tk_${shortCode.toLowerCase()}_${Date.now().toString(36)}`;

  const devoteeName = payload.name ?? payload.n ?? "Devotee";
  const priestName = payload.pandit ?? payload.p ?? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const startDate = payload.startDate ?? payload.sd ?? payload.date ?? payload.d ?? now.toISOString().split("T")[0];
  const lang = payload.lang ?? payload.l ?? "kn";
  const time = payload.time ?? payload.tm ?? "08:00";

  // Create legacy token representation for fallback
  const legacyToken = encodeDevoteeToken(payload);

  const tokenDoc: DevoteeTokenDoc = {
    id: tokenId,
    shortCode,
    devoteeName,
    nakshatra: payload.nakshatra ?? payload.nk,
    rashi: payload.rashi ?? payload.r,
    gotra: payload.gotra ?? payload.g,
    priestName,
    startDate,
    totalDays,
    lang,
    notificationTime: time,
    dob: payload.dob,
    tob: payload.tob,
    pincode: payload.pincode ?? payload.pc,
    lat: payload.lat ?? payload.lt,
    lng: payload.lng ?? payload.lg,
    locationName: payload.locationName ?? payload.loc,
    sevaType: payload.sevaType ?? payload.s,
    platform: payload.platform ?? payload.pl ?? "android",
    target: payload.target ?? payload.t ?? "sanctum",
    phone: payload.phone ?? payload.ph,
    email: payload.email ?? payload.em,
    overrideCalendarPhone: Boolean(payload.overrideCalendarPhone ?? payload.ocp),
    voiceId: payload.voiceId ?? payload.vid,
    includePriestCalendar: Boolean(payload.includePriestCalendar ?? payload.ipc),
    fullPayload: { ...payload },
    legacyToken,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    accessCount: 0,
    status: "active",
    updatedAt: now.toISOString()
  };

  // Save to database
  await saveDevoteeTokenToDb(tokenDoc);

  // Also create a mapping entry for reverse lookup
  const mappingDoc: TokenMappingDoc = {
    id: hashLegacyToken(legacyToken),
    legacyToken,
    newTokenId: tokenId,
    shortCode,
    devoteeName,
    priestName,
    migratedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    accessCount: 0
  };
  await saveTokenMappingToDb(mappingDoc);

  const cleanOrigin = origin.replace(/\/+$/, "");
  const sanctumUrl = `${cleanOrigin}/daily?token=${tokenId}`;
  const shortSanctumUrl = `${cleanOrigin}/daily?token=${shortCode}`;

  return {
    tokenId,
    shortCode,
    tokenDoc,
    sanctumUrl,
    shortSanctumUrl
  };
}

/**
 * Resolves any token string (New DB Token ID, 8-char Short Code, or Legacy Base64URL Token).
 * If a legacy token is encountered for the first time, it automatically migrates it into the database mapping table.
 */
export async function resolveDevoteeToken(
  rawTokenString: string
): Promise<ResolveTokenResult | null> {
  const token = (rawTokenString || "").trim();
  if (!token) return null;

  const now = new Date();

  // 1. Check if token is a Short Token ID (bgn_tk_...) or 8-char shortCode
  const isDirectDbToken = token.startsWith("bgn_tk_") || (token.length <= 12 && !token.includes(".") && !token.startsWith("bgn_v1_"));
  if (isDirectDbToken) {
    const doc = await getDevoteeTokenFromDb(token);
    if (doc) {
      const expTime = new Date(doc.expiresAt).getTime();
      const isExpired = now.getTime() > expTime || doc.status === "expired";
      const daysRemaining = Math.max(0, Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Record access asynchronously
      void recordDevoteeTokenAccess(doc.id);

      return {
        payload: {
          n: doc.devoteeName,
          name: doc.devoteeName,
          nk: doc.nakshatra,
          r: doc.rashi,
          g: doc.gotra,
          p: doc.priestName,
          pandit: doc.priestName,
          d: doc.startDate,
          l: doc.lang,
          lang: doc.lang,
          tm: doc.notificationTime,
          time: doc.notificationTime,
          dob: doc.dob,
          tob: doc.tob,
          pc: doc.pincode,
          lt: doc.lat,
          lg: doc.lng,
          loc: doc.locationName,
          s: doc.sevaType,
          pl: doc.platform,
          t: doc.target,
          ph: doc.phone,
          em: doc.email,
          ocp: doc.overrideCalendarPhone,
          vid: doc.voiceId,
          ipc: doc.includePriestCalendar,
          dy: doc.totalDays,
          ...(doc.fullPayload || {})
        },
        isLegacy: false,
        tokenId: doc.id,
        shortCode: doc.shortCode,
        daysRemaining,
        isExpired,
        accessCount: doc.accessCount,
        createdAt: doc.createdAt,
        expiresAt: doc.expiresAt
      };
    }
  }

  // 2. Token is a Legacy Base64URL Token (bgn_v1_...) or raw self-contained token
  const decoded = decodeDevoteeToken(token);
  if (!decoded) {
    // If decoding failed and it's not a DB token, return null
    return null;
  }

  // Check if this legacy token has already been mapped
  const mapping = await getTokenMappingFromDb(token);
  if (mapping) {
    // Existing mapping found
    const expTime = new Date(mapping.expiresAt).getTime();
    const isExpired = now.getTime() > expTime;
    const daysRemaining = Math.max(0, Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24)));

    mapping.accessCount = (mapping.accessCount || 0) + 1;
    mapping.lastAccessedAt = now.toISOString();
    void saveTokenMappingToDb(mapping);
    void recordDevoteeTokenAccess(mapping.newTokenId);

    return {
      payload: decoded,
      isLegacy: true,
      tokenId: mapping.newTokenId,
      shortCode: mapping.shortCode,
      daysRemaining,
      isExpired,
      accessCount: mapping.accessCount,
      createdAt: mapping.migratedAt,
      expiresAt: mapping.expiresAt
    };
  }

  // 3. First time encountering this legacy token: Auto-Migrate to Database Table!
  const totalDays = decoded.days || decoded.dy || 90;
  const expiresAt = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const shortCode = generateShortCode(8);
  const newTokenId = `bgn_tk_mig_${shortCode.toLowerCase()}_${Date.now().toString(36)}`;

  const newDoc: DevoteeTokenDoc = {
    id: newTokenId,
    shortCode,
    devoteeName: decoded.name || decoded.n || "Devotee",
    nakshatra: decoded.nakshatra ?? decoded.nk,
    rashi: decoded.rashi ?? decoded.r,
    gotra: decoded.gotra ?? decoded.g,
    priestName: decoded.pandit || decoded.p || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    startDate: decoded.startDate || decoded.sd || decoded.date || decoded.d || now.toISOString().split("T")[0],
    totalDays,
    lang: decoded.lang || decoded.l || "kn",
    notificationTime: decoded.time || decoded.tm || "08:00",
    dob: decoded.dob,
    tob: decoded.tob,
    pincode: decoded.pincode || decoded.pc,
    lat: decoded.lat ?? decoded.lt,
    lng: decoded.lng ?? decoded.lg,
    locationName: decoded.locationName || decoded.loc,
    sevaType: decoded.sevaType || decoded.s,
    platform: decoded.platform || decoded.pl || "android",
    target: decoded.target || decoded.t || "sanctum",
    phone: decoded.phone || decoded.ph,
    email: decoded.email || decoded.em,
    overrideCalendarPhone: Boolean(decoded.overrideCalendarPhone ?? decoded.ocp),
    voiceId: decoded.voiceId ?? decoded.vid,
    includePriestCalendar: Boolean(decoded.includePriestCalendar ?? decoded.ipc),
    fullPayload: { ...decoded },
    legacyToken: token,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    accessCount: 1,
    lastAccessedAt: now.toISOString(),
    status: "active",
    updatedAt: now.toISOString()
  };

  const newMapping: TokenMappingDoc = {
    id: hashLegacyToken(token),
    legacyToken: token,
    newTokenId,
    shortCode,
    devoteeName: newDoc.devoteeName,
    priestName: newDoc.priestName,
    migratedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    accessCount: 1,
    lastAccessedAt: now.toISOString()
  };

  // Save to database asynchronously (non-blocking for UI)
  void saveDevoteeTokenToDb(newDoc);
  void saveTokenMappingToDb(newMapping);

  return {
    payload: decoded,
    isLegacy: true,
    tokenId: newTokenId,
    shortCode,
    daysRemaining: totalDays,
    isExpired: false,
    accessCount: 1,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Scheduled cleanup: deletes tokens and mappings after 90-day lifecycle expires
 */
export async function cleanupExpiredTokensAfter90Days(): Promise<{
  tokensRemoved: number;
  mappingsRemoved: number;
}> {
  const result = await deleteExpiredTokensAndMappings();
  return {
    tokensRemoved: result.deletedTokens,
    mappingsRemoved: result.deletedMappings
  };
}
