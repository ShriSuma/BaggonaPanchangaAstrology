import { PlanetName } from "../core/AstroTypes";

/**
 * Maps planet names to standard traditional Kannada Vedic astrology terms.
 * User Rules:
 * - Mars -> ಕುಜ (Kuja - NOT ಮಂಗಳ / Mangala, NOT Mars)
 * - Sun -> ರವಿ (Ravi - NOT ಸೂರ್ಯ / Surya, NOT Sun)
 */
export const toKannadaPlanet = (planet: PlanetName | string | undefined | null): string => {
  if (!planet) return "ಗ್ರಹ";
  const p = String(planet).trim().toLowerCase();

  switch (p) {
    case "sun":
    case "surya":
    case "ravi":
      return "ರವಿ";
    case "moon":
    case "chandra":
    case "soma":
      return "ಚಂದ್ರ";
    case "mars":
    case "kuja":
    case "mangala":
    case "mangal":
    case "angaraka":
      return "ಕುಜ";
    case "mercury":
    case "budha":
    case "budh":
      return "ಬುಧ";
    case "jupiter":
    case "guru":
    case "brihaspati":
      return "ಗುರು";
    case "venus":
    case "shukra":
      return "ಶುಕ್ರ";
    case "saturn":
    case "shani":
    case "sani":
      return "ಶನಿ";
    case "rahu":
      return "ರಾಹು";
    case "ketu":
      return "ಕೇತು";
    case "maandi":
    case "mandi":
      return "ಮಾಂದಿ";
    case "gulika":
      return "ಗುಳಿಕ";
    default:
      return String(planet);
  }
};

/**
 * 12 Rashis in pristine Kannada Vedic nomenclature.
 */
export const KANNADA_RASHIS: string[] = [
  "ಮೇಷ",
  "ವೃಷಭ",
  "ಮಿಥುನ",
  "ಕರ್ಕಾಟಕ",
  "ಸಿಂಹ",
  "ಕನ್ಯಾ",
  "ತುಲಾ",
  "ವೃಶ್ಚಿಕ",
  "ಧನುಸ್ಸು",
  "ಮಕರ",
  "ಕುಂಭ",
  "ಮೀನ"
];

export const toKannadaRashi = (rashi: string | number | undefined | null): string => {
  if (rashi === undefined || rashi === null) return "ಮೇಷ";
  if (typeof rashi === "number") {
    return KANNADA_RASHIS[((rashi % 12) + 12) % 12] ?? "ಮೇಷ";
  }

  const r = String(rashi).trim().toLowerCase();
  if (r.includes("aries") || r.includes("mesha") || r.includes("ಮೇಷ")) return "ಮೇಷ";
  if (r.includes("taurus") || r.includes("vrishabha") || r.includes("ವೃಷಭ")) return "ವೃಷಭ";
  if (r.includes("gemini") || r.includes("mithuna") || r.includes("ಮಿಥುನ")) return "ಮಿಥುನ";
  if (r.includes("cancer") || r.includes("karka") || r.includes("ಕರ್ಕಾಟಕ") || r.includes("ಕರ್ಕ")) return "ಕರ್ಕಾಟಕ";
  if (r.includes("leo") || r.includes("simha") || r.includes("ಸಿಂಹ")) return "ಸಿಂಹ";
  if (r.includes("virgo") || r.includes("kanya") || r.includes("ಕನ್ಯಾ")) return "ಕನ್ಯಾ";
  if (r.includes("libra") || r.includes("tula") || r.includes("ತುಲಾ")) return "ತುಲಾ";
  if (r.includes("scorpio") || r.includes("vrischika") || r.includes("ವೃಶ್ಚಿಕ")) return "ವೃಶ್ಚಿಕ";
  if (r.includes("sagittarius") || r.includes("dhanus") || r.includes("ಧನುಸ್ಸು") || r.includes("ಧನು")) return "ಧನುಸ್ಸು";
  if (r.includes("capricorn") || r.includes("makara") || r.includes("ಮಕರ")) return "ಮಕರ";
  if (r.includes("aquarius") || r.includes("kumbha") || r.includes("ಕುಂಭ")) return "ಕುಂಭ";
  if (r.includes("pisces") || r.includes("meena") || r.includes("ಮೀನ")) return "ಮೀನ";

  return String(rashi);
};

/**
 * 27 Nakshatras in pristine Kannada Vedic nomenclature with flawless Vathakshara.
 */
export const KANNADA_NAKSHATRAS: string[] = [
  "ಅಶ್ವಿನಿ",
  "ಭರಣಿ",
  "ಕೃತ್ತಿಕಾ",
  "ರೋಹಿಣಿ",
  "ಮೃಗಶಿರಾ",
  "ಆರಿದ್ರಾ",
  "ಪುನರ್ವಸು",
  "ಪುಷ್ಯ",
  "ಆಶ್ಲೇಷ",
  "ಮಖಾ",
  "ಪುಬ್ಬಾ",
  "ಉತ್ತರಾ",
  "ಹಸ್ತಾ",
  "ಚಿತ್ತಾ",
  "ಸ್ವಾತಿ",
  "ವಿಶಾಖಾ",
  "ಅನೂರಾಧಾ",
  "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲಾ",
  "ಪೂರ್ವಾಷಾಢಾ",
  "ಉತ್ತರಾಷಾಢಾ",
  "ಶ್ರವಣ",
  "ಧನಿಷ್ಠಾ",
  "ಶತಭಿಷಾ",
  "ಪೂರ್ವಾಭಾದ್ರಾ",
  "ಉತ್ತರಾಭಾದ್ರಾ",
  "ರೇವತಿ"
];

export const toKannadaNakshatra = (nak: string | number | undefined | null): string => {
  if (nak === undefined || nak === null) return "ಅಶ್ವಿನಿ";
  if (typeof nak === "number") {
    return KANNADA_NAKSHATRAS[((nak % 27) + 27) % 27] ?? "ಅಶ್ವಿನಿ";
  }

  const n = String(nak).trim().toLowerCase();
  const map: Record<string, string> = {
    ashwini: "ಅಶ್ವಿನಿ",
    aswini: "ಅಶ್ವಿನಿ",
    bharani: "ಭರಣಿ",
    krittika: "ಕೃತ್ತಿಕಾ",
    krithika: "ಕೃತ್ತಿಕಾ",
    rohini: "ರೋಹಿಣಿ",
    mrigashira: "ಮೃಗಶಿರಾ",
    mrigasira: "ಮೃಗಶಿರಾ",
    ardra: "ಆರಿದ್ರಾ",
    arudra: "ಆರಿದ್ರಾ",
    punarvasu: "ಪುನರ್ವಸು",
    pushya: "ಪುಷ್ಯ",
    pushyami: "ಪುಷ್ಯ",
    ashlesha: "ಆಶ್ಲೇಷ",
    aslesha: "ಆಶ್ಲೇಷ",
    magha: "ಮಖಾ",
    makha: "ಮಖಾ",
    purvaphalguni: "ಪುಬ್ಬಾ",
    "purva phalguni": "ಪುಬ್ಬಾ",
    pubba: "ಪುಬ್ಬಾ",
    uttaraphalguni: "ಉತ್ತರಾ",
    "uttara phalguni": "ಉತ್ತರಾ",
    uttara: "ಉತ್ತರಾ",
    hasta: "ಹಸ್ತಾ",
    chitra: "ಚಿತ್ತಾ",
    swati: "ಸ್ವಾತಿ",
    swathi: "ಸ್ವಾತಿ",
    vishakha: "ವಿಶಾಖಾ",
    visakha: "ವಿಶಾಖಾ",
    anuradha: "ಅನೂರಾಧಾ",
    jyeshtha: "ಜ್ಯೇಷ್ಠಾ",
    jyeshta: "ಜ್ಯೇಷ್ಠಾ",
    mula: "ಮೂಲಾ",
    moola: "ಮೂಲಾ",
    purvashadha: "ಪೂರ್ವಾಷಾಢಾ",
    "purva ashadha": "ಪೂರ್ವಾಷಾಢಾ",
    uttarashadha: "ಉತ್ತರಾಷಾಢಾ",
    "uttara ashadha": "ಉತ್ತರಾಷಾಢಾ",
    shravana: "ಶ್ರವಣ",
    sravana: "ಶ್ರವಣ",
    dhanishta: "ಧನಿಷ್ಠಾ",
    dhanishta1: "ಧನಿಷ್ಠಾ",
    shatabhisha: "ಶತಭಿಷಾ",
    satabhisha: "ಶತಭಿಷಾ",
    shatataraka: "ಶತಭಿಷಾ",
    purvabhadra: "ಪೂರ್ವಾಭಾದ್ರಾ",
    "purva bhadrapada": "ಪೂರ್ವಾಭಾದ್ರಾ",
    uttarabhadra: "ಉತ್ತರಾಭಾದ್ರಾ",
    "uttara bhadrapada": "ಉತ್ತರಾಭಾದ್ರಾ",
    revati: "ರೇವತಿ",
    revathi: "ರೇವತಿ"
  };

  for (const [k, val] of Object.entries(map)) {
    if (n.includes(k)) return val;
  }

  return String(nak);
};

export const toKannadaDeity = (deity: string | undefined | null): string => {
  if (!deity) return "ಶ್ರೀ ಪರಮಶಿವ";
  const d = String(deity).toLowerCase();
  if (d.includes("shiva") || d.includes("rudra")) return "ಶ್ರೀ ಪರಮಶಿವ";
  if (d.includes("vishnu") || d.includes("narayana")) return "ಶ್ರೀ ಮಹಾವಿಷ್ಣು";
  if (d.includes("ganesha") || d.includes("ganapathi")) return "ಶ್ರೀ ಮಹಾಗಣಪತಿ";
  if (d.includes("kartikeya") || d.includes("subrahmanya") || d.includes("skanda")) return "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ";
  if (d.includes("lakshmi")) return "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ";
  if (d.includes("durga") || d.includes("parvati") || d.includes("devi")) return "ಶ್ರೀ ದುರ್ಗಾದೇವಿ";
  if (d.includes("hanuman") || d.includes("anjaneya")) return "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ";
  if (d.includes("surya") || d.includes("sun") || d.includes("aditya")) return "ಶ್ರೀ ರವಿ ನಾರಾಯಣ";
  if (d.includes("brahma")) return "ಶ್ರೀ ಬ್ರಹ್ಮದೇವ";
  return deity;
};

export const toKannadaColor = (color: string | undefined | null): string => {
  if (!color) return "";
  const c = String(color).trim().toLowerCase();
  const map: Record<string, string> = {
    white: "ಬಿಳಿ",
    silver: "ಬೆಳ್ಳಿ / ಶುಭ್ರ ಬಿಳಿ",
    red: "ಕೆಂಪು",
    crimson: "ಗಾಢ ಕೆಂಪು",
    yellow: "ಹಳದಿ / ಬಂಗಾರದ ಬಣ್ಣ",
    gold: "ಬಂಗಾರದ ಹಳದಿ",
    golden: "ಚಿನ್ನದ ಬಣ್ಣ",
    blue: "ನೀಲಿ",
    "royal blue": "ರಾಯಲ್ ನೀಲಿ",
    "navy blue": "ಗಾಢ ನೀಲಿ",
    green: "ಹಸಿರು",
    emerald: "ಮರಕತ ಹಸಿರು",
    black: "ಕಪ್ಪು",
    orange: "ಕೇಸರಿ / ಕಿತ್ತಳೆ",
    saffron: "ಕೇಸರಿ",
    cream: "ಕೆನೆ ಬಿಳಿ",
    brown: "ಕಂದು",
    grey: "ಬೂದು",
    gray: "ಬೂದು",
    maroon: "ಮೆರೂನ್"
  };
  return map[c] || color;
};

export const toKannadaDirection = (dir: string | undefined | null): string => {
  if (!dir) return "";
  const d = String(dir).trim().toLowerCase();
  const map: Record<string, string> = {
    east: "ಪೂರ್ವ",
    west: "ಪಶ್ಚಿಮ",
    north: "ಉತ್ತರ",
    south: "ದಕ್ಷಿಣ",
    northeast: "ಈಶಾನ್ಯ",
    "north-east": "ಈಶಾನ್ಯ",
    southeast: "ಆಗ್ನೇಯ",
    "south-east": "ಆಗ್ನೇಯ",
    southwest: "ನೈಋತ್ಯ",
    "south-west": "ನೈಋತ್ಯ",
    northwest: "ವಾಯುವ್ಯ",
    "north-west": "ವಾಯುವ್ಯ"
  };
  return map[d] || dir;
};

export const toKannadaChallengeArea = (area: string | undefined | null): string => {
  if (!area) return "ಜೀವನ ಸವಾಲು";
  const a = String(area).trim();
  if (a.includes("Career") || a.includes("Workplace")) return "ಉದ್ಯೋಗ / ಕಾರ್ಯಕ್ಷೇತ್ರ";
  if (a.includes("Personal") || a.includes("Marriage")) return "ವೈಯಕ್ತಿಕ / ವೈವಾಹಿಕ";
  if (a.includes("Financial") || a.includes("Debts")) return "ಆರ್ಥಿಕತೆ / ಸಾಲ ಪರಿಹಾರ";
  if (a.includes("Progeny") || a.includes("Children")) return "ಸಂತಾನ / ಮಕ್ಕಳ ಅಭಿವೃದ್ಧಿ";
  if (a.includes("Health") || a.includes("Vitality")) return "ಆರೋಗ್ಯ / ಆಯುಷ್ಯ";
  return "ಜೀವನ ಪರಿವರ್ತನೆ";
};

/**
 * Sanitizes any text string to ensure:
 * 1. Replaces English planet names with pure Kannada names (Sun -> ರವಿ, Mars -> ಕುಜ, etc.).
 * 2. Replaces Mangala with Kuja, and Surya with Ravi where applicable.
 * 3. Strips markdown asterisks, hashes, backticks.
 * 4. Normalizes Kannada numerals to English digits (0-9).
 * 5. Cleans up English Zodiac words from Kannada sentences.
 * 6. Strips CJK (Japanese/Chinese) or foreign corrupted multi-byte unicode artifacts.
 */
export function sanitizeAstrologyKannadaText(text: string): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/`/g, "")
    .replace(/_{1,2}/g, "")
    // Strip Japanese / Chinese / Korean characters if any rogue multi-byte artifacts appeared
    .replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g, "")
    .trim();

  // Convert Kannada digits to English digits
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  knDigits.forEach((kd, idx) => {
    cleaned = cleaned.replaceAll(kd, idx.toString());
  });

  // Replace English & Non-standard planet names in Kannada text
  const replacements: [RegExp, string][] = [
    [/\bMars\b/gi, "ಕುಜ"],
    [/\bSun\b/gi, "ರವಿ"],
    [/\bJupiter\b/gi, "ಗುರು"],
    [/\bVenus\b/gi, "ಶುಕ್ರ"],
    [/\bSaturn\b/gi, "ಶನಿ"],
    [/\bMercury\b/gi, "ಬುಧ"],
    [/\bMoon\b/gi, "ಚಂದ್ರ"],
    [/\bRahu\b/gi, "ರಾಹು"],
    [/\bKetu\b/gi, "ಕೇತು"],
    [/\bMaandi\b/gi, "ಮಾಂದಿ"],
    [/\bGulika\b/gi, "ಗುಳಿಕ"],
    // Replace Surya -> Ravi and Mangala -> Kuja as instructed by user
    [/ಸೂರ್ಯನ/g, "ರವಿ ಗ್ರಹದ"],
    [/ಸೂರ್ಯನು/g, "ರವಿ ಗ್ರಹವು"],
    [/ಸೂರ್ಯ/g, "ರವಿ"],
    [/ಮಂಗಳನ/g, "ಕುಜ ಗ್ರಹದ"],
    [/ಮಂಗಳನು/g, "ಕುಜ ಗ್ರಹವು"],
    [/ಮಂಗಳ/g, "ಕುಜ"],
    // English Rashis
    [/\bAries\b/gi, "ಮೇಷ"],
    [/\bTaurus\b/gi, "ವೃಷಭ"],
    [/\bGemini\b/gi, "ಮಿಥುನ"],
    [/\bCancer\b/gi, "ಕರ್ಕಾಟಕ"],
    [/\bLeo\b/gi, "ಸಿಂಹ"],
    [/\bVirgo\b/gi, "ಕನ್ಯಾ"],
    [/\bLibra\b/gi, "ತುಲಾ"],
    [/\bScorpio\b/gi, "ವೃಶ್ಚಿಕ"],
    [/\bSagittarius\b/gi, "ಧನುಸ್ಸು"],
    [/\bCapricorn\b/gi, "ಮಕರ"],
    [/\bAquarius\b/gi, "ಕುಂಭ"],
    [/\bPisces\b/gi, "ಮೀನ"],
    // English Nakshatras
    [/\bAshwini\b/gi, "ಅಶ್ವಿನಿ"],
    [/\bBharani\b/gi, "ಭರಣಿ"],
    [/\bKrittika\b/gi, "ಕೃತ್ತಿಕಾ"],
    [/\bRohini\b/gi, "ರೋಹಿಣಿ"],
    [/\bMrigashira\b/gi, "ಮೃಗಶಿರಾ"],
    [/\bArdra\b/gi, "ಆರಿದ್ರಾ"],
    [/\bPunarvasu\b/gi, "ಪುನರ್ವಸು"],
    [/\bPushya\b/gi, "ಪುಷ್ಯ"],
    [/\bAshlesha\b/gi, "ಆಶ್ಲೇಷ"],
    [/\bMagha\b/gi, "ಮಖಾ"],
    [/\bPubba\b/gi, "ಪುಬ್ಬಾ"],
    [/\bUttara\b/gi, "ಉತ್ತರಾ"],
    [/\bHasta\b/gi, "ಹಸ್ತಾ"],
    [/\bChitra\b/gi, "ಚಿತ್ತಾ"],
    [/\bSwati\b/gi, "ಸ್ವಾತಿ"],
    [/\bVishakha\b/gi, "ವಿಶಾಖಾ"],
    [/\bAnuradha\b/gi, "ಅನೂರಾಧಾ"],
    [/\bJyeshtha\b/gi, "ಜ್ಯೇಷ್ಠಾ"],
    [/\bMoola\b/gi, "ಮೂಲಾ"],
    [/\bMula\b/gi, "ಮೂಲಾ"],
    [/\bPurvashadha\b/gi, "ಪೂರ್ವಾಷಾಢಾ"],
    [/\bUttarashadha\b/gi, "ಉತ್ತರಾಷಾಢಾ"],
    [/\bShravana\b/gi, "ಶ್ರವಣ"],
    [/\bDhanishta\b/gi, "ಧನಿಷ್ಠಾ"],
    [/\bShatabhisha\b/gi, "ಶತಭಿಷಾ"],
    [/\bPurvabhadra\b/gi, "ಪೂರ್ವಾಭಾದ್ರಾ"],
    [/\bUttarabhadra\b/gi, "ಉತ್ತರಾಭಾದ್ರಾ"],
    [/\bRevati\b/gi, "ರೇವತಿ"],
    // Common English Phrases
    [/Next (\d+) to (\d+) Months/gi, "ಮುಂದಿನ $1 ರಿಂದ $2 ತಿಂಗಳುಗಳಲ್ಲಿ"],
    [/Next (\d+) Months/gi, "ಮುಂದಿನ $1 ತಿಂಗಳುಗಳಲ್ಲಿ"],
    [/Carat/gi, "ಕ್ಯಾರಟ್"],
    [/House (\d+)/gi, "$1ನೇ ಭಾವ"],
    [/(\d+)th house/gi, "$1ನೇ ಮನೆ"],
    [/(\d+)st house/gi, "$1ನೇ ಮನೆ"],
    [/(\d+)nd house/gi, "$1ನೇ ಮನೆ"],
    [/(\d+)rd house/gi, "$1ನೇ ಮನೆ"]
  ];

  for (const [pattern, replacement] of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}
