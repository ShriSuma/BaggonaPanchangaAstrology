import { askGeminiBatch } from "../../core/GeminiEngine";
import { getDailyKaalaTimings } from "./icsCalendarGenerator";
import { nakshatraName } from "./sevaPresentation";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { normalizeDegree } from "../../core/AstroMath";
import {
  PAKSHA_L5,
  TITHI_L5,
  AMAVASYA_L5,
  PURNIMA_L5,
  pick
} from "./sevaLocale";

export interface DayPanchangaAiItem {
  date: string; // YYYY-MM-DD
  paksha: string; // e.g. "ಶುಕ್ಲ ಪಕ್ಷ" / "Shukla Paksha"
  tithi: string; // e.g. "ಸಪ್ತಮಿ" / "Saptami"
  nakshatra: string; // e.g. "ಉತ್ತರಾಷಾಢ" / "Uttara Ashadha"
  suryodaya: string; // e.g. "06:14 AM"
  suryasta: string; // e.g. "06:42 PM"
  rahuKaala: string; // e.g. "04:45 PM – 06:17 PM"
  gulikaKaala: string; // e.g. "03:13 PM – 04:45 PM"
  yamagandaKaala: string; // e.g. "12:10 PM – 01:42 PM"
}

export type Panchanga90Map = Record<string, DayPanchangaAiItem>;

const inMemoryCache = new Map<string, Panchanga90Map>();

const LANG_NAMES: Record<string, string> = {
  kn: "Kannada",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  en: "English"
};

/** Get cache key for a pincode, language, and start date */
function getCacheKey(pincode: string, lang: string, startDateYmd: string): string {
  const pin = (pincode || "581326").trim();
  const l = (lang || "kn").slice(0, 2);
  return `panchanga90_ai_${pin}_${l}_${startDateYmd}`;
}

/** Synchronous getter from cache if already loaded */
export function getCached90DayPanchanga(
  pincode: string,
  lang: string,
  startDateYmd: string
): Panchanga90Map | null {
  const key = getCacheKey(pincode, lang, startDateYmd);
  if (inMemoryCache.has(key)) {
    return inMemoryCache.get(key)!;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        inMemoryCache.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    /* ignore localStorage parse error */
  }

  return null;
}

/** Save to cache */
function saveCached90DayPanchanga(
  pincode: string,
  lang: string,
  startDateYmd: string,
  map: Panchanga90Map
): void {
  const key = getCacheKey(pincode, lang, startDateYmd);
  inMemoryCache.set(key, map);
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* ignore storage quota full error */
  }
}

/**
 * Local mathematical fallback for 90-day location Panchanga.
 * Used when Gemini API key is unavailable, offline, or request fails.
 */
export function computeLocalFallback90DayPanchanga(
  pincode: string,
  locationName: string,
  startDateYmd: string,
  lang: string,
  lat = 14.54,
  lng = 74.31
): Panchanga90Map {
  const map: Panchanga90Map = {};
  const startDate = new Date(startDateYmd);
  const validStart = isNaN(startDate.getTime()) ? new Date() : startDate;

  for (let i = 0; i < 90; i++) {
    const d = new Date(validStart);
    d.setDate(d.getDate() + i);
    const ymd = d.toISOString().slice(0, 10);

    const year = d.getFullYear();
    const month = d.getMonth();
    const dayOfMonth = d.getDate();
    const weekday = d.getDay();

    // 1. Calculate Ephemeris Moon/Sun longitudes for noon UTC
    const noonUtc = new Date(Date.UTC(year, month, dayOfMonth, 12, 0, 0));
    const coords = siderealLongitudes(noonUtc);
    const moonLon = coords.moon;
    const sunLon = coords.sun;

    const moonNakIdx = Math.floor(moonLon / (360 / 27)) % 27;
    const diff = normalizeDegree(moonLon - sunLon);
    const tithiVal = Math.floor(diff / 12);
    const isShukla = tithiVal < 15;
    const tithiInPaksha = (tithiVal % 15) + 1;

    const pakshaPhrase = PAKSHA_L5[isShukla ? "shukla" : "krishna"];
    const pText = pick(pakshaPhrase, lang);

    let tText = "";
    if (tithiVal === 14) tText = pick(PURNIMA_L5, lang);
    else if (tithiVal === 29) tText = pick(AMAVASYA_L5, lang);
    else {
      const tithiIdx = Math.max(0, tithiInPaksha - 1);
      tText = pick(TITHI_L5[tithiIdx] ?? TITHI_L5[0], lang);
    }

    const nText = nakshatraName(moonNakIdx, lang);

    // 2. Kaala timings using pincode lat/lng
    const dayLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
    const dayLord = dayLords[weekday] || "Sun";

    const kaala = getDailyKaalaTimings(dayLord, lang, ymd, lat, lng, pincode);

    // Strip out parens text in timings for clean values
    const cleanTiming = (str: string) => str.replace(/\s*\([^)]*\)/g, "").trim();

    map[ymd] = {
      date: ymd,
      paksha: pText,
      tithi: tText,
      nakshatra: nText,
      suryodaya: kaala.sunrise,
      suryasta: kaala.sunset,
      rahuKaala: cleanTiming(kaala.rahu),
      gulikaKaala: cleanTiming(kaala.gulika),
      yamagandaKaala: cleanTiming(kaala.yamaganda)
    };
  }

  return map;
}

/**
 * Primary 90-Day Gemini AI Panchanga Generator & Synchronizer.
 * Queries Gemini (gemini-3.5-flash-lite) for location-accurate 90-day Panchanga & Kaala timings,
 * formatted cleanly with separate keys and native script values.
 */
export async function fetch90DayAiPanchanga(
  pincode: string,
  locationName: string,
  startDateYmd: string,
  lang: string,
  lat = 14.54,
  lng = 74.31,
  apiKey = ""
): Promise<Panchanga90Map> {
  const cached = getCached90DayPanchanga(pincode, lang, startDateYmd);
  if (cached) {
    return cached;
  }

  const activeKey = (apiKey || import.meta.env?.VITE_GEMINI_API_KEY || "").trim();
  if (!activeKey) {
    // If no API key is active, immediately return mathematical ephemeris fallback without delay
    const fallback = computeLocalFallback90DayPanchanga(pincode, locationName, startDateYmd, lang, lat, lng);
    saveCached90DayPanchanga(pincode, lang, startDateYmd, fallback);
    return fallback;
  }

  const targetLang = (lang || "kn").slice(0, 2);
  const targetLangName = LANG_NAMES[targetLang] || "Kannada";

  const prompt = `
You are an authoritative Vedic Astrological Ephemeris Calculator for Baggona Panchanga.
For PIN Code / Location: "${pincode || "581326 Gokarna"}" (Location: "${locationName || "Gokarna"}", Lat: ${lat.toFixed(2)}, Lng: ${lng.toFixed(2)}), generate the location-accurate daily Panchanga and Kaala timings for 90 consecutive days starting from ${startDateYmd}.

OUTPUT FORMAT REQUIREMENT:
Return a valid JSON array containing objects for dates starting from ${startDateYmd}. Do not include markdown explanation or text outside the JSON structure.

Each object MUST contain these key-value pairs:
- "date": "YYYY-MM-DD"
- "paksha": Paksha name in ${targetLangName} native script (e.g. in Kannada: "ಶುಕ್ಲ ಪಕ್ಷ" or "ಕೃಷ್ಣ ಪಕ್ಷ")
- "tithi": Tithi name in ${targetLangName} native script (e.g. in Kannada: "ಪ್ರಥಮಿ", "ದ್ವಿತೀಯಾ", "ತೃತೀಯಾ", "ಚತುರ್ಥಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಪೂರ್ಣಿಮೆ", "ಅಮಾವಾಸ್ಯೆ")
- "nakshatra": Nakshatra name in ${targetLangName} native script (e.g. in Kannada: "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರಾ", etc.)
- "suryodaya": Sunrise time in 12-hour clock (e.g. "06:14 AM")
- "suryasta": Sunset time in 12-hour clock (e.g. "06:42 PM")
- "rahuKaala": Rahu Kaala window (e.g. "04:45 PM – 06:17 PM")
- "gulikaKaala": Gulika Kaala window (e.g. "03:13 PM – 04:45 PM")
- "yamagandaKaala": Yamaganda Kaala window (e.g. "12:10 PM – 01:42 PM")

Strict Rules:
1. Text values for "paksha", "tithi", and "nakshatra" MUST be in ${targetLangName} native script.
2. Timings ("suryodaya", "suryasta", "rahuKaala", "gulikaKaala", "yamagandaKaala") MUST use standard English digits with AM/PM.
`;

  try {
    const aiResponse = await askGeminiBatch(prompt, activeKey, []);
    let itemsArray: DayPanchangaAiItem[] = [];

    if (Array.isArray(aiResponse)) {
      itemsArray = aiResponse;
    } else if (aiResponse && typeof aiResponse === "object") {
      if (Array.isArray(aiResponse.days)) itemsArray = aiResponse.days;
      else if (Array.isArray(aiResponse.panchanga)) itemsArray = aiResponse.panchanga;
      else if (Array.isArray(aiResponse.items)) itemsArray = aiResponse.items;
      else if (Array.isArray(aiResponse.data)) itemsArray = aiResponse.data;
    }

    if (itemsArray.length > 0) {
      const map: Panchanga90Map = {};
      for (const item of itemsArray) {
        if (item && item.date) {
          map[item.date] = {
            date: item.date,
            paksha: item.paksha || "",
            tithi: item.tithi || "",
            nakshatra: item.nakshatra || "",
            suryodaya: item.suryodaya || "06:00 AM",
            suryasta: item.suryasta || "06:30 PM",
            rahuKaala: item.rahuKaala || "",
            gulikaKaala: item.gulikaKaala || "",
            yamagandaKaala: item.yamagandaKaala || ""
          };
        }
      }

      // Fill any missing dates with local fallback
      const fallbackMap = computeLocalFallback90DayPanchanga(pincode, locationName, startDateYmd, lang, lat, lng);
      const mergedMap: Panchanga90Map = { ...fallbackMap, ...map };
      saveCached90DayPanchanga(pincode, lang, startDateYmd, mergedMap);
      return mergedMap;
    }
  } catch (err) {
    console.warn("Gemini 90-day Panchanga API call failed or rate limited, falling back to local ephemeris:", err);
  }

  // Fallback to local mathematical ephemeris
  const fallback = computeLocalFallback90DayPanchanga(pincode, locationName, startDateYmd, lang, lat, lng);
  saveCached90DayPanchanga(pincode, lang, startDateYmd, fallback);
  return fallback;
}
