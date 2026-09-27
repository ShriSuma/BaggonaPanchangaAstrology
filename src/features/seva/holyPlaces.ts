/**
 * Holy places presets in Gokarna Kshetra for Seva & Prasada and Calendar generation.
 * Provides accurate 5-language native typography (Kannada, Telugu, Tamil, Hindi, English).
 * Supports dynamic addition & Firestore database persistence of custom holy places
 * (e.g., "Mukti Mantapa Koti Teertha Gokarna", "Moksha Dhama near Samudra Gokarna").
 */

import { doc, getDocs, collection, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { canWriteToLiveFirestore } from "../../db/firestoreDb";
import { transliterateName } from "../../utils/transliterator";

export interface HolyPlacePreset {
  id: string;
  name: {
    kn: string;
    te: string;
    ta: string;
    hi: string;
    en: string;
  };
  pincode: string;
  lat: number;
  lng: number;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type HolyPlaceItem = HolyPlacePreset;

export const GOKARNA_HOLY_PLACES: HolyPlacePreset[] = [
  {
    id: "kotiteertha",
    name: {
      kn: "ಕೋಟಿತೀರ್ಥ, ಗೋಕರ್ಣ",
      te: "కోటితీర్థం, గోకర్ణ",
      ta: "கோடிதீர்த்தம், கோகர்ணம்",
      hi: "कोटितीर्थ, गोकर्ण",
      en: "Kotiteertha, Gokarna"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "devasthana",
    name: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ, ಗೋಕರ್ಣ",
      te: "శ్రీ మహాబలేశ్వర దేవస్థానం, గోకర్ణ",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் தேவஸ்தானம், கோகர்ணம்",
      hi: "श्री महाबलेश्वर देवस्थान, गोकर्ण",
      en: "Shri Mahabaleshwara Temple, Gokarna"
    },
    pincode: "581326",
    lat: 14.5426,
    lng: 74.3168
  },
  {
    id: "muktimantapa",
    name: {
      kn: "ಮುಕ್ತಿಮಂಟಪ, ಗೋಕರ್ಣ",
      te: "ముక్తిమంటపం, గోకర్ణ",
      ta: "முக்திமண்டபம், கோகர்ணம்",
      hi: "मुक्तिमंडप, गोकर्ण",
      en: "Muktimantapa, Gokarna"
    },
    pincode: "581326",
    lat: 14.5450,
    lng: 74.3175
  },
  {
    id: "gokarna_kshetra",
    name: {
      kn: "ಪವಿತ್ರ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      te: "పవిత్ర గోకర్ణ క్షేత్రం",
      ta: "புனித கோகர்ண க்ஷேத்திரம்",
      hi: "पवित्र गोकर्ण क्षेत्र",
      en: "Holy Gokarna Kshetra"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "gokarna_kotiteertha_sannidhi",
    name: {
      kn: "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ಸನ್ನಿಧಿ",
      te: "గోకర్ణ కోటితీర్థ సన్నిధి",
      ta: "கோகர்ண கோடிதீர்த்த சந்நிதி",
      hi: "गोकर्ण कोटितीर्थ सन्निधि",
      en: "Gokarna Kotiteertha Sannidhi"
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  },
  {
    id: "custom",
    name: {
      kn: "ಇತರ ಸ್ಥಳ (ಕಸ್ಟಮ್)...",
      te: "ఇతర స్థలం (కస్టమ్)...",
      ta: "மற்ற இடம் (விருப்பப்படி)...",
      hi: "अन्य स्थान (कस्टम)...",
      en: "Other Location (Custom)..."
    },
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187
  }
];

const LOCAL_STORAGE_PLACES_KEY = "baggona_custom_holy_places_v2";
const CUSTOM_HOLY_PLACES_COLLECTION = "customHolyPlaces";

export const memoryCustomHolyPlaces = new Map<string, HolyPlacePreset>();

function sanitizeData<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Normalizes text for holy place deduplication & matching
 */
export function normalizePlaceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Reads all custom holy places from LocalStorage + In-memory cache
 */
export function getCustomHolyPlaces(): HolyPlacePreset[] {
  if (memoryCustomHolyPlaces.size > 0) {
    return Array.from(memoryCustomHolyPlaces.values());
  }

  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PLACES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HolyPlacePreset[];
    for (const item of parsed) {
      if (item && item.id) {
        memoryCustomHolyPlaces.set(item.id, item);
      }
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse stored custom holy places:", err);
    return [];
  }
}

/**
 * Returns all holy places (predefined + custom saved + custom selector option)
 */
export function getAllHolyPlaces(): HolyPlacePreset[] {
  const predefined = GOKARNA_HOLY_PLACES.filter((p) => p.id !== "custom");
  const custom = getCustomHolyPlaces();
  const customOption = GOKARNA_HOLY_PLACES.find((p) => p.id === "custom")!;
  return [...predefined, ...custom, customOption];
}

export const getHolyPlaceById = (id: string): HolyPlacePreset | undefined => {
  if (memoryCustomHolyPlaces.has(id)) {
    return memoryCustomHolyPlaces.get(id);
  }
  const custom = getCustomHolyPlaces().find((p) => p.id === id);
  if (custom) return custom;
  return GOKARNA_HOLY_PLACES.find((p) => p.id === id);
};

export const getHolyPlaceName = (id: string, lang: string): string => {
  const p = getHolyPlaceById(id);
  if (!p) return "";
  const code = (lang || "kn").split("-")[0] as keyof HolyPlacePreset["name"];
  return p.name[code] || p.name.en || p.name.kn;
};

export const findMatchingHolyPlace = (text: string): HolyPlacePreset | undefined => {
  const clean = normalizePlaceText(text);
  if (!clean || clean === "custom" || clean === "other location") return undefined;

  const allPlaces = getAllHolyPlaces().filter(p => p.id !== "custom");

  // Phase 1: EXACT MATCH (highest priority across both predefined and custom)
  for (const preset of allPlaces) {
    if (normalizePlaceText(preset.id) === clean) return preset;
    for (const n of Object.values(preset.name)) {
      if (n && normalizePlaceText(n) === clean) return preset;
    }
  }

  // Phase 2: Geographic Shorthand / Stop-Word Alias Match
  // E.g. user typed "Kotiteertha", and preset is "Kotiteertha Gokarna"
  const cleanWords = clean.split(/\s+/).filter(w => w.length > 1);
  const geoStopWords = new Set(["gokarna", "ಗೋಕರ್ಣ", "kshetra", "ಕ್ಷೇತ್ರ", "karnataka", "ಕರ್ನಾಟಕ", "temple", "ದೇವಸ್ಥಾನ", "sanctum", "ಸನ್ನಿಧಿ"]);

  for (const preset of allPlaces) {
    for (const n of Object.values(preset.name)) {
      if (!n) continue;
      const normN = normalizePlaceText(n);
      const normWords = normN.split(/\s+/).filter(w => w.length > 1);

      // Clean words must not contain distinct venue words absent from normWords
      const extraInClean = cleanWords.filter(cw => !normWords.some(nw => nw === cw || nw.includes(cw) || cw.includes(nw)));
      if (extraInClean.length > 0) continue;

      // Norm words that are not in cleanWords must ONLY be common geographic stop-words
      const extraInNorm = normWords.filter(nw => !cleanWords.some(cw => cw === nw || cw.includes(nw) || nw.includes(cw)));
      const extraAreOnlyGeo = extraInNorm.length === 0 || extraInNorm.every(nw => geoStopWords.has(nw));

      if (extraAreOnlyGeo && cleanWords.length > 0) {
        return preset;
      }
    }
  }

  return undefined;
};

export const findHolyPlacePresetByText = (text: string): HolyPlacePreset | undefined => {
  return findMatchingHolyPlace(text);
};

/**
 * Saves a custom holy place into database & LocalStorage if not already present
 */
export async function saveOrUpdateCustomHolyPlace(
  placeName: string,
  optionsOrPincode: string | { pincode?: string; lat?: number; lng?: number; lang?: string } = "581326",
  latOrLang: number | string = 14.5479,
  lng: number = 74.3187,
  lang: string = "kn"
): Promise<HolyPlacePreset | null> {
  const clean = placeName.trim();
  if (!clean || clean.toLowerCase() === "custom" || clean.toLowerCase() === "other location") {
    return null;
  }

  // Parse polymorphic arguments
  let pincode = "581326";
  let finalLat = 14.5479;
  let finalLng = 74.3187;
  let finalLang = "kn";

  if (typeof optionsOrPincode === "object" && optionsOrPincode !== null) {
    pincode = optionsOrPincode.pincode || "581326";
    if (optionsOrPincode.lat !== undefined) finalLat = optionsOrPincode.lat;
    if (optionsOrPincode.lng !== undefined) finalLng = optionsOrPincode.lng;
    if (optionsOrPincode.lang) finalLang = optionsOrPincode.lang;
  } else if (typeof optionsOrPincode === "string") {
    pincode = optionsOrPincode;
    if (typeof latOrLang === "number") {
      finalLat = latOrLang;
      finalLng = lng || 74.3187;
      finalLang = lang || "kn";
    } else if (typeof latOrLang === "string") {
      finalLang = latOrLang;
    }
  }

  // Check if already exists
  const existing = findMatchingHolyPlace(clean);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const idSlug = clean
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const id = `place_${idSlug || "custom"}_${Date.now()}`;

  const knName = transliterateName(clean, "kn");
  const enName = transliterateName(clean, "en");
  const hiName = transliterateName(clean, "hi");
  const teName = transliterateName(clean, "te");
  const taName = transliterateName(clean, "ta");

  const newPlace: HolyPlacePreset = {
    id,
    name: {
      kn: knName,
      en: enName,
      hi: hiName,
      te: teName,
      ta: taName
    },
    pincode: pincode || "581326",
    lat: finalLat || 14.5479,
    lng: finalLng || 74.3187,
    isCustom: true,
    createdAt: now,
    updatedAt: now
  };

  memoryCustomHolyPlaces.set(id, newPlace);

  if (typeof window !== "undefined") {
    try {
      const all = Array.from(memoryCustomHolyPlaces.values());
      localStorage.setItem(LOCAL_STORAGE_PLACES_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn("Failed to persist custom place to localStorage:", e);
    }
  }

  if (canWriteToLiveFirestore(id) && firestore) {
    try {
      const ref = doc(firestore, CUSTOM_HOLY_PLACES_COLLECTION, id);
      await setDoc(ref, sanitizeData(newPlace), { merge: true });
    } catch (err) {
      console.warn("[Firestore] Failed to write custom place:", err);
    }
  }

  return newPlace;
}

/**
 * Loads custom holy places from Firestore
 */
export async function loadCustomHolyPlacesFromFirestore(): Promise<HolyPlacePreset[]> {
  if (!firestore) return getCustomHolyPlaces();

  try {
    const colRef = collection(firestore, CUSTOM_HOLY_PLACES_COLLECTION);
    const snap = await getDocs(colRef);
    const list: HolyPlacePreset[] = [];
    snap.forEach((d) => {
      const data = d.data() as HolyPlacePreset;
      if (data && data.id) {
        memoryCustomHolyPlaces.set(data.id, data);
        list.push(data);
      }
    });

    if (typeof window !== "undefined" && list.length > 0) {
      try {
        const all = Array.from(memoryCustomHolyPlaces.values());
        localStorage.setItem(LOCAL_STORAGE_PLACES_KEY, JSON.stringify(all));
      } catch (_) {}
    }

    return list;
  } catch (err) {
    console.warn("[Firestore] loadCustomHolyPlacesFromFirestore warning:", err);
    return getCustomHolyPlaces();
  }
}
