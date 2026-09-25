import { getAllKundliRecords, type KundliRecord } from "../db/indexedDb";
import { getAllKundlisFromFirestore, type KundliHistoryDoc } from "../db/firestoreDb";
import { detectScript, transliterateIndicToLatin, transliterateName } from "../utils/transliterator";

export interface DevoteeProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  latitude: number;
  longitude: number;
  placeName: string;
  pincode?: string;
  gothra?: string;
  gender?: "Male" | "Female" | "Other" | string;
  maritalStatus?: "married" | "unmarried" | "separated" | string;
  rashi?: string;
  rashiSanskrit?: string;
  nakshatra?: string;
  nakshatraSanskrit?: string;
  pada?: number;
  lagnaRashi?: string;
  source: "cloud" | "local";
  createdAt: string;
}

/**
 * Normalizes text by trimming and collapsing multiple spaces.
 */
function clean(str: string): string {
  return (str || "").replace(/\s+/g, " ").trim();
}

/**
 * Creates a unique fingerprint to deduplicate local and cloud devotee entries.
 */
function makeFingerprint(name: string, birthDate: string, birthTime: string): string {
  return `${clean(name).toLowerCase()}_${clean(birthDate)}_${clean(birthTime)}`;
}

/**
 * Fetches all saved devotee Kundlis from local IndexedDB and cloud Firestore,
 * merges duplicates seamlessly, and returns them sorted by creation date (newest first).
 */
export async function fetchDevoteeDatabase(): Promise<DevoteeProfile[]> {
  const profileMap = new Map<string, DevoteeProfile>();

  // 1. Fetch from Local IndexedDB
  try {
    const localRecords = await getAllKundliRecords();
    for (const rec of localRecords) {
      if (!rec.name || !rec.birthDate) continue;
      const fp = makeFingerprint(rec.name, rec.birthDate, rec.birthTime);
      const moonPlanet = rec.kundliData?.planets?.find((p) => p.name === "Moon");
      
      const profile: DevoteeProfile = {
        id: rec.id || `local_${rec.createdAt}_${rec.name}`,
        name: clean(rec.name),
        birthDate: clean(rec.birthDate),
        birthTime: clean(rec.birthTime),
        latitude: rec.latitude,
        longitude: rec.longitude,
        placeName: clean(rec.placeName || (rec.pincode ? `PIN: ${rec.pincode}` : "Unknown Place")),
        pincode: rec.pincode,
        gothra: rec.gothra,
        gender: (rec.gender as any) || (rec.name?.includes("ಶ್ರೀಮತಿ") || rec.name?.includes("ಕುಮಾರಿ") || rec.name?.toLowerCase().includes("chaitra") || rec.name?.includes("ಚೈತ್ರಾ") ? "Female" : "Male"),
        maritalStatus: (rec.maritalStatus as any) || undefined,
        rashi: rec.kundliData?.moonSign?.english,
        rashiSanskrit: rec.kundliData?.moonSign?.sanskrit,
        nakshatra: moonPlanet?.nakshatra?.english,
        nakshatraSanskrit: moonPlanet?.nakshatra?.sanskrit,
        pada: rec.kundliData?.moonPada,
        lagnaRashi: rec.kundliData?.lagnaRashi?.english,
        source: "local",
        createdAt: rec.createdAt || new Date().toISOString()
      };
      profileMap.set(fp, profile);
    }
  } catch (err) {
    console.warn("[devoteeSearchService] Error reading local IndexedDB:", err);
  }

  // 2. Fetch from Cloud Firestore
  try {
    const cloudRecords = await getAllKundlisFromFirestore();
    for (const rec of cloudRecords) {
      if (!rec.name || !rec.birthDate) continue;
      const fp = makeFingerprint(rec.name, rec.birthDate, rec.birthTime);
      const existing = profileMap.get(fp);

      const profile: DevoteeProfile = {
        id: rec.id || existing?.id || `cloud_${rec.createdAt}_${rec.name}`,
        name: clean(rec.name),
        birthDate: clean(rec.birthDate),
        birthTime: clean(rec.birthTime),
        latitude: rec.latitude ?? existing?.latitude ?? 14.5479,
        longitude: rec.longitude ?? existing?.longitude ?? 74.3188,
        placeName: clean(rec.placeName || existing?.placeName || (rec.pincode ? `PIN: ${rec.pincode}` : "Unknown Place")),
        pincode: rec.pincode || existing?.pincode,
        gothra: rec.gothra || existing?.gothra,
        gender: (rec as any).gender || existing?.gender || (rec.name?.includes("ಶ್ರೀಮತಿ") || rec.name?.includes("ಕುಮಾರಿ") || rec.name?.toLowerCase().includes("chaitra") || rec.name?.includes("ಚೈತ್ರಾ") ? "Female" : "Male"),
        maritalStatus: (rec as any).maritalStatus || existing?.maritalStatus || undefined,
        rashi: rec.rashi || existing?.rashi,
        rashiSanskrit: rec.rashiSanskrit || existing?.rashiSanskrit,
        nakshatra: rec.nakshatra || existing?.nakshatra,
        nakshatraSanskrit: rec.nakshatraSanskrit || existing?.nakshatraSanskrit,
        pada: rec.pada ?? existing?.pada,
        lagnaRashi: rec.lagnaRashi || existing?.lagnaRashi,
        source: "cloud",
        createdAt: rec.createdAt || existing?.createdAt || new Date().toISOString()
      };

      profileMap.set(fp, profile);
    }
  } catch (err) {
    console.warn("[devoteeSearchService] Error reading Cloud Firestore:", err);
  }

  // Convert map to array and sort by createdAt descending
  return Array.from(profileMap.values()).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Bi-directional cross-language matching:
 * - Kannada query (e.g. "ರಮೇಶ", "ರ") matches English records ("Ramesh") and vice-versa.
 * - English query (e.g. "Pramod", "pra") matches Kannada records ("ಪ್ರಮೋದ್").
 * - Character-by-character prefix matching prioritized over substrings.
 */
export function filterDevoteesCrossLanguage(
  devotees: DevoteeProfile[],
  rawQuery: string
): DevoteeProfile[] {
  const query = clean(rawQuery);
  if (!query) {
    return devotees.slice(0, 100);
  }

  const queryScript = detectScript(query);
  const queryLower = query.toLowerCase();

  // Multi-script query variants
  let queryInLatin = queryLower;
  let queryInKn = query;
  let queryInHi = query;

  if (queryScript !== "en") {
    // Input is Indic (Kannada, Devanagari, etc.)
    queryInLatin = clean(transliterateIndicToLatin(query)).toLowerCase();
    const latinFromTranslit = clean(transliterateName(query, "en")).toLowerCase();
    if (latinFromTranslit && latinFromTranslit !== queryInLatin) {
      queryInLatin = latinFromTranslit;
    }
  } else {
    // Input is Latin/English
    queryInKn = clean(transliterateName(query, "kn"));
    queryInHi = clean(transliterateName(query, "hi"));
  }

  const queryTokens = [
    queryLower,
    queryInLatin,
    queryInKn,
    queryInHi,
    queryLower.replace(/[^a-z0-9]/g, "")
  ].filter((t): t is string => Boolean(t && t.length > 0));

  // Remove duplicates
  const uniqueQueryTokens = Array.from(new Set(queryTokens));

  const scored: Array<{ devotee: DevoteeProfile; score: number }> = [];

  for (const devotee of devotees) {
    const origName = clean(devotee.name);
    const origNameLower = origName.toLowerCase();
    const latinName = clean(transliterateName(origName, "en")).toLowerCase();
    const knName = clean(transliterateName(origName, "kn"));
    const hiName = clean(transliterateName(origName, "hi"));
    const placeLower = clean(devotee.placeName).toLowerCase();
    const gothraLower = clean(devotee.gothra || "").toLowerCase();
    const pincode = clean(devotee.pincode || "");

    const nameCandidates = [origNameLower, latinName, knName, hiName];

    let maxScore = 0;

    for (const token of uniqueQueryTokens) {
      const tokenLower = token.toLowerCase();

      // 1. Exact match on any name variant
      for (const cand of nameCandidates) {
        if (cand.toLowerCase() === tokenLower) {
          maxScore = Math.max(maxScore, 1000);
        }
      }

      // 2. Prefix match on full name (starts with)
      for (const cand of nameCandidates) {
        if (cand.toLowerCase().startsWith(tokenLower)) {
          maxScore = Math.max(maxScore, 600 + (100 - Math.min(cand.length, 100)));
        }
      }

      // 3. Word boundary prefix match (e.g. "Pandit" in "Shreeram Pandit")
      for (const cand of nameCandidates) {
        const words = cand.toLowerCase().split(/[\s,.-]+/);
        for (const w of words) {
          if (w.startsWith(tokenLower)) {
            maxScore = Math.max(maxScore, 400 + (50 - Math.min(w.length, 50)));
          }
        }
      }

      // 4. Substring match in name
      for (const cand of nameCandidates) {
        if (cand.toLowerCase().includes(tokenLower)) {
          maxScore = Math.max(maxScore, 200);
        }
      }

      // 5. Match in place, pincode, or gothra
      if (placeLower.startsWith(tokenLower) || pincode.startsWith(tokenLower)) {
        maxScore = Math.max(maxScore, 120);
      } else if (placeLower.includes(tokenLower)) {
        maxScore = Math.max(maxScore, 80);
      }
      if (gothraLower.startsWith(tokenLower)) {
        maxScore = Math.max(maxScore, 100);
      } else if (gothraLower.includes(tokenLower)) {
        maxScore = Math.max(maxScore, 60);
      }
    }

    if (maxScore > 0) {
      scored.push({ devotee, score: maxScore });
    }
  }

  // Sort primarily by relevance score, secondarily by recency
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.devotee.createdAt).getTime() - new Date(a.devotee.createdAt).getTime();
  });

  return scored.map((s) => s.devotee);
}
