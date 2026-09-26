/**
 * Comprehensive Multi-Language Pooja Name Resolver
 *
 * Guarantees that whatever Pooja or Seva is chosen (from SEVA_CATALOG,
 * custom input, recommendation object, or plain string), it is returned
 * in the exact script of the requested language (kn, hi, te, ta, en)
 * with zero script leakage (e.g. no Kannada characters leaking into English or vice-versa).
 */

import { SEVA_CATALOG, type SevaId } from "../../data/gokarnaSevas";
import { pick, type SevaLang, type L5 } from "./sevaLocale";
import { transliterateName, convertTextIfLanguageDiffers } from "../../utils/transliterator";

export interface SevaLike {
  id?: string;
  name?: L5 | string | Record<string, string>;
  label?: string;
  title?: string;
  purpose?: L5 | string | Record<string, string>;
  benefit?: L5 | string | Record<string, string>;
}

export interface SevaRecommendationLike {
  seva?: SevaLike;
  id?: string;
  name?: L5 | string | Record<string, string>;
  label?: string;
  score?: number;
  reasons?: string[];
}

export const FALLBACK_POOJA_L5: L5 = {
  kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಪೂಜೆ",
  hi: "श्री गोकर्ण महापूजा",
  te: "శ్రీ గోకర్ణ మహాపూజ",
  ta: "ஸ்ரீ கோகர்ண மகாபூஜை",
  en: "Shri Gokarna Maha Seva"
};

/**
 * Format any pooja representation into the target language script.
 * Fully backward-compatible: accepts objects, string IDs, custom names, or undefined.
 */
export function formatPoojaName(sevaOrName: any, lang: string = "en"): string {
  const base = (lang || "en").split("-")[0].toLowerCase() as SevaLang;

  if (!sevaOrName) {
    return pick(FALLBACK_POOJA_L5, base);
  }

  // 1. Unwrap recommendation if wrapped: { seva: ... }
  const sevaObj: SevaLike = (sevaOrName?.seva || sevaOrName) as SevaLike;
  const rawId: string = typeof sevaOrName === "string" ? sevaOrName.trim() : (sevaObj?.id || "").trim();

  // 2. Direct catalog lookup by ID (if not custom placeholder)
  if (rawId && rawId !== "custom" && rawId !== "custom_pooja" && SEVA_CATALOG[rawId as SevaId]) {
    return pick(SEVA_CATALOG[rawId as SevaId].name, base);
  }

  let resolved = "";

  // 3. If name is an object (e.g. { kn: "...", en: "...", ... }), prioritize explicit custom or item name
  if (sevaObj?.name && typeof sevaObj.name === "object") {
    const nameMap = sevaObj.name as Record<string, string>;
    const targetCandidate = nameMap[base];

    if (targetCandidate && typeof targetCandidate === "string" && targetCandidate.trim()) {
      resolved = targetCandidate.trim();
    } else {
      const anyAvailable = nameMap.en || nameMap.kn || nameMap.hi || nameMap.te || nameMap.ta || Object.values(nameMap)[0];
      if (anyAvailable && typeof anyAvailable === "string" && anyAvailable.trim()) {
        resolved = anyAvailable.trim();
      }
    }
  }

  // 4. Plain string or label/title fallback
  if (!resolved) {
    const rawStr = typeof sevaOrName === "string"
      ? sevaOrName.trim()
      : (typeof sevaObj?.name === "string" ? sevaObj.name.trim() : (sevaObj?.label || sevaObj?.title || "").trim());

    if (!rawStr) {
      return pick(FALLBACK_POOJA_L5, base);
    }

    const rawLower = rawStr.toLowerCase();
    for (const item of Object.values(SEVA_CATALOG)) {
      if (item.id !== "custom_pooja") {
        if (item.id.toLowerCase() === rawLower) {
          return pick(item.name, base);
        }
        for (const val of Object.values(item.name)) {
          if (val && val.toLowerCase() === rawLower) {
            return pick(item.name, base);
          }
        }
      }
    }
    resolved = rawStr;
  }

  // 5. Transliterate into base script (checking script first to avoid redundant modifications)
  resolved = convertTextIfLanguageDiffers(resolved, base);

  // 6. Strict Purity Guard: If target is not Kannada, ensure NO Kannada characters leak
  if (base !== "kn" && /[\u0C80-\u0CFF]/.test(resolved)) {
    resolved = transliterateName(resolved, base);
  }

  return resolved;
}
