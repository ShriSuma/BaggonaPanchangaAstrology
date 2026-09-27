/**
 * Baggona Custom & Combination Pooja Registry
 *
 * Provides persistent database and local caching for custom and combination poojas
 * entered by priests/users (e.g., "ಮುಕ್ತಿಮಂಟಪ ನಾರಾಯಣಬಲಿ & ತ್ರಿಪಿಂಡಿ", "ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಣಪತಿ ಹೋಮ").
 * Stores in Firestore `customPoojas` collection and syncs with LocalStorage.
 */

import { doc, getDocs, collection, setDoc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { canWriteToLiveFirestore } from "../../db/firestoreDb";
import { SEVA_CATALOG, type SevaId, type SevaEntry } from "../../data/gokarnaSevas";
import { formatPoojaName } from "./formatPoojaName";
import type { L5 } from "./sevaLocale";

export interface CustomPoojaItem {
  id: string; // e.g., "custom_pooja_1727..."
  name: {
    kn: string;
    en: string;
    hi: string;
    te: string;
    ta: string;
  };
  displayName: string;
  icon: string;
  purpose?: L5;
  benefit?: L5;
  isCustom: true;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_POOJAS_KEY = "baggona_custom_poojas_v2";
const CUSTOM_POOJAS_COLLECTION = "customPoojas";

// In-memory cache for ultra-fast synchronous lookup
export const memoryCustomPoojas = new Map<string, CustomPoojaItem>();

function sanitizeData<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Normalizes text for robust deduplication & matching
 */
export function normalizePoojaText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Reads all custom poojas from LocalStorage + In-memory cache
 */
export function getCustomPoojas(): CustomPoojaItem[] {
  if (memoryCustomPoojas.size > 0) {
    return Array.from(memoryCustomPoojas.values());
  }

  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_POOJAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomPoojaItem[];
    for (const item of parsed) {
      if (item && item.id) {
        memoryCustomPoojas.set(item.id, item);
      }
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse stored custom poojas:", err);
    return [];
  }
}

/**
 * Checks if a pooja already exists in SEVA_CATALOG or in custom poojas
 */
export function findMatchingPooja(nameInput: string): { id: string; name: string; isStandard: boolean } | null {
  const norm = normalizePoojaText(nameInput);
  if (!norm || norm === "custom" || norm === "custom pooja" || norm === "add custom") {
    return null;
  }

  // 1. Check Standard Catalog
  for (const [id, entry] of Object.entries(SEVA_CATALOG)) {
    if (id === "custom_pooja") continue;
    if (normalizePoojaText(id) === norm) {
      return { id, name: entry.name.kn || entry.name.en, isStandard: true };
    }
    for (const val of Object.values(entry.name)) {
      if (val && normalizePoojaText(val) === norm) {
        return { id, name: entry.name.kn || entry.name.en, isStandard: true };
      }
    }
  }

  // 2. Check Custom Poojas
  const customList = getCustomPoojas();
  for (const item of customList) {
    if (normalizePoojaText(item.id) === norm) {
      return { id: item.id, name: item.displayName || item.name.kn, isStandard: false };
    }
    for (const val of Object.values(item.name)) {
      if (val && normalizePoojaText(val) === norm) {
        return { id: item.id, name: item.displayName || item.name.kn, isStandard: false };
      }
    }
  }

  return null;
}

/**
 * Saves or updates a custom / combination pooja in the database and LocalStorage.
 * If already exists, returns existing without duplicate insertion.
 */
export async function saveOrUpdateCustomPooja(
  nameInput: string,
  lang: string = "kn"
): Promise<CustomPoojaItem | null> {
  const clean = nameInput.trim();
  if (!clean || clean.toLowerCase() === "custom_pooja" || clean.toLowerCase() === "add_custom") {
    return null;
  }

  // Check if matches standard catalog
  const match = findMatchingPooja(clean);
  if (match && match.isStandard) {
    return null; // Already a standard catalog seva, no need to insert as custom
  }

  if (match && !match.isStandard) {
    const existing = memoryCustomPoojas.get(match.id);
    if (existing) return existing;
    const fromList = getCustomPoojas().find(cp => cp.id === match.id);
    if (fromList) return fromList;
  }

  const now = new Date().toISOString();
  const idSlug = clean
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const id = `custom_pooja_${idSlug || "item"}_${Date.now()}`;

  const knName = formatPoojaName(clean, "kn");
  const enName = formatPoojaName(clean, "en");
  const hiName = formatPoojaName(clean, "hi");
  const teName = formatPoojaName(clean, "te");
  const taName = formatPoojaName(clean, "ta");

  const newPooja: CustomPoojaItem = {
    id,
    name: {
      kn: knName,
      en: enName,
      hi: hiName,
      te: teName,
      ta: taName
    },
    displayName: clean,
    icon: "🪔",
    purpose: {
      kn: "ಭಕ್ತರ ಸಂಕಲ್ಪಾನುಸಾರ ನೆರವೇರಿಸಲಾದ ದೈವಿಕ ಆರಾಧನೆ ಹಾಗೂ ಪರಿಹಾರ ಸೇವೆ.",
      en: "Sacred remedial pooja performed according to the devotee's sankalpa.",
      hi: "भक्त के संकल्प के अनुसार संपन्न पावन वैदिक पूजा सेवा।",
      te: "భక్తుల సంకల్పం ప్రకారం నిర్వహించిన దివ్య పరిహార సేవ.",
      ta: "பக்தரின் சங்கல்பத்தின்படி செய்யப்பட்ட புனித பரிகார பூஜை."
    },
    benefit: {
      kn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ, ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ.",
      en: "Fulfillment of desires, divine protection, and family peace.",
      hi: "सर्व मनोकामना पूर्ति, दैवीय सुरक्षा एवं पारिवारिक शांति।",
      te: "సకల కోరికల ఈడేరిక, దివ్య రక్షణ మరియు కుటుంబ శాంతి.",
      ta: "சகல காரிய சித்தி, தெய்வீக பாதுகாப்பு மற்றும் குடும்ப அமைதி."
    },
    isCustom: true,
    createdAt: now,
    updatedAt: now
  };

  // Cache in memory
  memoryCustomPoojas.set(id, newPooja);

  // Cache in LocalStorage
  if (typeof window !== "undefined") {
    try {
      const all = Array.from(memoryCustomPoojas.values());
      localStorage.setItem(LOCAL_STORAGE_POOJAS_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn("Failed to persist custom pooja to localStorage:", e);
    }
  }

  // Persist to Firestore if allowed
  if (canWriteToLiveFirestore(id) && firestore) {
    try {
      const ref = doc(firestore, CUSTOM_POOJAS_COLLECTION, id);
      await setDoc(ref, sanitizeData(newPooja), { merge: true });
    } catch (err) {
      console.warn("[Firestore] Failed to write custom pooja:", err);
    }
  }

  return newPooja;
}

/**
 * Synchronously loads custom poojas from Firestore (for background sync)
 */
export async function loadCustomPoojasFromFirestore(): Promise<CustomPoojaItem[]> {
  if (!firestore) return getCustomPoojas();

  try {
    const colRef = collection(firestore, CUSTOM_POOJAS_COLLECTION);
    const snap = await getDocs(colRef);
    const list: CustomPoojaItem[] = [];
    snap.forEach((d) => {
      const data = d.data() as CustomPoojaItem;
      if (data && data.id) {
        memoryCustomPoojas.set(data.id, data);
        list.push(data);
      }
    });

    if (typeof window !== "undefined" && list.length > 0) {
      try {
        const all = Array.from(memoryCustomPoojas.values());
        localStorage.setItem(LOCAL_STORAGE_POOJAS_KEY, JSON.stringify(all));
      } catch (_) {}
    }

    return list;
  } catch (err) {
    console.warn("[Firestore] loadCustomPoojasFromFirestore warning:", err);
    return getCustomPoojas();
  }
}
