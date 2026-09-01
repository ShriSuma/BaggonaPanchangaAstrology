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
  "ಪುಬ್ಬಾ (ಪೂರ್ವಫಲ್ಗುಣಿ)",
  "ಉತ್ತರಾ (ಉತ್ತರಫಲ್ಗುಣಿ)",
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

/**
 * Sanitizes any text string to ensure:
 * 1. Replaces English planet names with pure Kannada names (Sun -> ರವಿ, Mars -> ಕುಜ, etc.).
 * 2. Replaces Mangala with Kuja, and Surya with Ravi where applicable.
 * 3. Strips markdown asterisks, hashes, backticks.
 * 4. Normalizes Kannada numerals to English digits (0-9).
 * 5. Cleans up English Zodiac words from Kannada sentences.
 */
export function sanitizeAstrologyKannadaText(text: string): string {
  if (!text) return "";
  let cleaned = text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/`/g, "")
    .replace(/_{1,2}/g, "")
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
    // Common English Phrases to clean Kannada
    [/Next (\d+) to (\d+) Months/gi, "ಮುಂದಿನ $1 ರಿಂದ $2 ತಿಂಗಳುಗಳಲ್ಲಿ"],
    [/Next (\d+) Months/gi, "ಮುಂದಿನ $1 ತಿಂಗಳುಗಳಲ್ಲಿ"],
    [/Carat/gi, "ಕ್ಯಾರಟ್"]
  ];

  for (const [pattern, replacement] of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}
