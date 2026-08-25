/**
 * Classical Vedic & Chaldean Numerology Mathematics Engine.
 * 
 * Provides:
 * 1. Chaldean & Pythagorean Name Number Calculation & Lucky Spelling Suggestions
 * 2. Phone, Vehicle, & House Number Numerology Compatibility Calculator
 * 3. Mulank (Birth Date Number) & Bhagyank (Destiny Number) Life Guidance Engine
 */

// ----------------------------------------------------------------------
// CHALDEAN & PYTHAGOREAN ALPHABET MAPS
// ----------------------------------------------------------------------

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

/** Reduce any non-negative integer to a single digit 1..9 */
export function reduceToSingleDigit(num: number): number {
  let val = Math.abs(Math.round(num));
  if (val === 0) return 0;
  while (val > 9) {
    let sum = 0;
    while (val > 0) {
      sum += val % 10;
      val = Math.floor(val / 10);
    }
    val = sum;
  }
  return val;
}

/** Calculate Chaldean Compound & Single Digit Number for Name */
export function calculateChaldeanNameNumber(name: string): { compound: number; single: number } {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const char of clean) {
    compound += CHALDEAN_MAP[char] || 0;
  }
  return {
    compound,
    single: reduceToSingleDigit(compound)
  };
}

/** Calculate Pythagorean Compound & Single Digit Number for Name */
export function calculatePythagoreanNameNumber(name: string): { compound: number; single: number } {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const char of clean) {
    compound += PYTHAGOREAN_MAP[char] || 0;
  }
  return {
    compound,
    single: reduceToSingleDigit(compound)
  };
}

// ----------------------------------------------------------------------
// MULANK & BHAGYANK NUMEROLOGY DATA
// ----------------------------------------------------------------------

export type NumerologyGuidance = {
  number: number;
  rulerKn: string;
  rulerEn: string;
  deityKn: string;
  deityEn: string;
  elementKn: string;
  elementEn: string;
  luckyDatesKn: string;
  luckyDatesEn: string;
  luckyColorsKn: string;
  luckyColorsEn: string;
  luckyGemsKn: string;
  luckyGemsEn: string;
  friendlyNumbers: number[];
  enemyNumbers: number[];
  traitsKn: string;
  traitsEn: string;
};

export const NUMEROLOGY_GUIDANCE_MAP: Record<number, NumerologyGuidance> = {
  1: {
    number: 1,
    rulerKn: "ಸೂರ್ಯ",
    rulerEn: "Sun (Surya)",
    deityKn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ",
    deityEn: "Sri Surya Narayana",
    elementKn: "ಅಗ್ನಿ (Fire)",
    elementEn: "Fire",
    luckyDatesKn: "೧, ೧೦, ೧೯, ೨೮",
    luckyDatesEn: "1, 10, 19, 28",
    luckyColorsKn: "ಕೆಂಪು, ಹಳದಿ, ಬಂಗಾರದ ಬಣ್ಣ",
    luckyColorsEn: "Red, Yellow, Gold",
    luckyGemsKn: "ಮಾಣಿಕ್ಯ (Ruby)",
    luckyGemsEn: "Ruby",
    friendlyNumbers: [1, 2, 3, 5, 9],
    enemyNumbers: [8],
    traitsKn: "ನಾಯಕತ್ವ, ಸ್ವಾಭಿಮಾನ, ಉನ್ನತ ಅಧಿಕಾರ ಹಾಗೂ ಸ್ವತಂತ್ರ ಆಲೋಚನೆ.",
    traitsEn: "Leadership, dignity, high ambition, and independent mindset."
  },
  2: {
    number: 2,
    rulerKn: "ಚಂದ್ರ",
    rulerEn: "Moon (Chandra)",
    deityKn: "ಶ್ರೀ ಗೌರಿ ದೇವಿ",
    deityEn: "Sri Gauri Devi",
    elementKn: "ಜಲ (Water)",
    elementEn: "Water",
    luckyDatesKn: "೨, ೧೧, ೨೦, ೨೯",
    luckyDatesEn: "2, 11, 20, 29",
    luckyColorsKn: "ಬಿಳಿ, ಕೆನೆ ಬಣ್ಣ, ಬೆಳ್ಳಿ ಬಣ್ಣ",
    luckyColorsEn: "White, Cream, Silver",
    luckyGemsKn: "ಮುತ್ತು (Pearl)",
    luckyGemsEn: "Pearl",
    friendlyNumbers: [1, 2, 5, 7],
    enemyNumbers: [4, 8, 9],
    traitsKn: "ಭಾವನಾತ್ಮಕತೆ, ಕಲ್ಪನಾ ಶಕ್ತಿ, ಶಾಂತಿಪ್ರಿಯತೆ ಹಾಗೂ ಸೌಮ್ಯ ಸ್ವಭಾವ.",
    traitsEn: "Empathy, creativity, peace-loving nature, and intuition."
  },
  3: {
    number: 3,
    rulerKn: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
    rulerEn: "Jupiter (Guru)",
    deityKn: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಶಿವ",
    deityEn: "Sri Dakshinamurthy / Shiva",
    elementKn: "ಆಕಾಶ (Ether)",
    elementEn: "Ether",
    luckyDatesKn: "೩, ೧೨, ೨೧, ೩೦",
    luckyDatesEn: "3, 12, 21, 30",
    luckyColorsKn: "ಹಳದಿ, ಕೇಸರಿ, ಬಂಗಾರದ ಬಣ್ಣ",
    luckyColorsEn: "Yellow, Saffron, Gold",
    luckyGemsKn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
    luckyGemsEn: "Yellow Sapphire",
    friendlyNumbers: [1, 2, 3, 7, 9],
    enemyNumbers: [6],
    traitsKn: "ಜ್ಞಾನ, ಬೋಧನೆ, ದೈವಿಕ ಭಕ್ತಿ, ಸಮಾಜ ಗೌರವ ಹಾಗೂ ಧಾರ್ಮಿಕತೆ.",
    traitsEn: "Wisdom, teaching skills, spiritual devotion, and social respect."
  },
  4: {
    number: 4,
    rulerKn: "ರಾಹು",
    rulerEn: "Rahu",
    deityKn: "ಶ್ರೀ ದುರ್ಗಾ ದೇವಿ",
    deityEn: "Sri Durga Devi",
    elementKn: "ವಾಯು (Air)",
    elementEn: "Air",
    luckyDatesKn: "೪, ೧೩, ೨೨, ೩೧",
    luckyDatesEn: "4, 13, 22, 31",
    luckyColorsKn: "ನೀಲಿ, ಬೂದು ಬಣ್ಣ",
    luckyColorsEn: "Blue, Grey",
    luckyGemsKn: "ಗೋಮೇಧಿಕ (Hessonite)",
    luckyGemsEn: "Hessonite Garnet",
    friendlyNumbers: [1, 5, 6, 7],
    enemyNumbers: [2, 8, 9],
    traitsKn: "ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯ, ಹಠಾತ್ ಧನಲಾಭ, ಶ್ರಮಜೀವನ ಹಾಗೂ ಕ್ರಾಂತಿಕಾರಿ ಆಲೋಚನೆ.",
    traitsEn: "Technical skill, sudden gains, hard work, and innovative mind."
  },
  5: {
    number: 5,
    rulerKn: "ಬುಧ",
    rulerEn: "Mercury (Budha)",
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಗಣೇಶ",
    deityEn: "Sri Maha Vishnu / Ganesha",
    elementKn: "ಪೃಥ್ವಿ (Earth)",
    elementEn: "Earth",
    luckyDatesKn: "೫, ೧೪, ೨೩",
    luckyDatesEn: "5, 14, 23",
    luckyColorsKn: "ಹಸಿರು, ಗಿಳಿ ಹಸಿರು",
    luckyColorsEn: "Green, Emerald",
    luckyGemsKn: "ಪಚ್ಚೆ (Emerald)",
    luckyGemsEn: "Emerald",
    friendlyNumbers: [1, 2, 3, 5, 6],
    enemyNumbers: [],
    traitsKn: "ಬುದ್ಧಿವಂತಿಕೆ, ವಾಣಿಜ್ಯ ಕೌಶಲ, ಚಾಣಾಕ್ಷ ಮಾತು ಹಾಗೂ ಪ್ರವಾಸ ಪ್ರಿಯತೆ.",
    traitsEn: "Intelligence, business acumen, quick wit, and adaptability."
  },
  6: {
    number: 6,
    rulerKn: "ಶುಕ್ರ",
    rulerEn: "Venus (Shukra)",
    deityKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ",
    deityEn: "Sri Maha Lakshmi Devi",
    elementKn: "ಜಲ (Water)",
    elementEn: "Water",
    luckyDatesKn: "೬, ೧೫, ೨೪",
    luckyDatesEn: "6, 15, 24",
    luckyColorsKn: "ಗುಲಾಬಿ, ಆಕಾಶ ನೀಲಿ, ಬಿಳಿ",
    luckyColorsEn: "Pink, Sky Blue, White",
    luckyGemsKn: "ವಜ್ರ (Diamond / Zircon)",
    luckyGemsEn: "Diamond / Diamond Zircon",
    friendlyNumbers: [1, 4, 5, 6, 8, 9],
    enemyNumbers: [3],
    traitsKn: "ಸೌಂದರ್ಯ, ಕಲಾತ್ಮಕತೆ, ಸಂಪತ್ತು, ಭೋಗ ಭಾಗ್ಯ ಹಾಗೂ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ.",
    traitsEn: "Artistic luxury, charm, wealth, and refined aesthetics."
  },
  7: {
    number: 7,
    rulerKn: "ಕೇತು",
    rulerEn: "Ketu",
    deityKn: "ಶ್ರೀ ಗಣಪತಿ / ನರಸಿಂಹ",
    deityEn: "Sri Ganapati / Narasimha",
    elementKn: "ಅಗ್ನಿ (Fire)",
    elementEn: "Fire",
    luckyDatesKn: "೭, ೧೬, ೨೫",
    luckyDatesEn: "7, 16, 25",
    luckyColorsKn: "ಎಳೆ ಹಸಿರು, ಬಿಳಿ, ಹಳದಿ",
    luckyColorsEn: "Light Green, White",
    luckyGemsKn: "ವೈಡೂರ್ಯ (Cat's Eye)",
    luckyGemsEn: "Cat's Eye",
    friendlyNumbers: [1, 3, 4, 5, 7],
    enemyNumbers: [2, 9],
    traitsKn: "ಸಂಶೋಧನಾ ಮನೋಭಾವ, ತತ್ತ್ವಚಿಂತನೆ, ದೈವಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ ಹಾಗೂ ಏಕಾಂತ ಪ್ರಿಯತೆ.",
    traitsEn: "Research mindset, philosophy, deep intuition, and spiritual vision."
  },
  8: {
    number: 8,
    rulerKn: "ಶನಿ",
    rulerEn: "Saturn (Shani)",
    deityKn: "ಶ್ರೀ ಆಂಜನೇಯ / ಕಾಲಭೈರವ",
    deityEn: "Sri Anjaneya / Kala Bhairava",
    elementKn: "ವಾಯು (Air)",
    elementEn: "Air",
    luckyDatesKn: "೮, ೧೭, ೨೬",
    luckyDatesEn: "8, 17, 26",
    luckyColorsKn: "ಕಪ್ಪು, ಗಾಢ ನೀಲಿ, ನೇರಳೆ",
    luckyColorsEn: "Black, Dark Blue, Violet",
    luckyGemsKn: "ಇಂದ್ರನೀಲ (Blue Sapphire)",
    luckyGemsEn: "Blue Sapphire",
    friendlyNumbers: [4, 5, 6],
    enemyNumbers: [1, 2, 9],
    traitsKn: "ಶಿಸ್ತು, ಸಂಯಮ, ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು, ನ್ಯಾಯನಿಷ್ಠೆ ಹಾಗೂ ಕಠಿಣ ಶ್ರಮ.",
    traitsEn: "Discipline, perseverance, long-term success, and justice."
  },
  9: {
    number: 9,
    rulerKn: "ಮಂಗಳ",
    rulerEn: "Mars (Mangala)",
    deityKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಹನುಮಾನ್",
    deityEn: "Sri Subramanya / Hanuman",
    elementKn: "ಅಗ್ನಿ (Fire)",
    elementEn: "Fire",
    luckyDatesKn: "೯, ೧೮, ೨೭",
    luckyDatesEn: "9, 18, 27",
    luckyColorsKn: "ರಕ್ತ ಕೆಂಪು, ಮರೂನ್",
    luckyColorsEn: "Deep Red, Maroon",
    luckyGemsKn: "ಹವಳ (Red Coral)",
    luckyGemsEn: "Red Coral",
    friendlyNumbers: [1, 2, 3, 6, 9],
    enemyNumbers: [4, 8],
    traitsKn: "ಶೌರ್ಯ, ಸಾಹಸ, ಚೈತನ್ಯ, ರಕ್ಷಣೆ ಹಾಗೂ ತೀವ್ರ ಕಾರ್ಯದಕ್ಷತೆ.",
    traitsEn: "Courage, valor, high energy, protection, and dynamic execution."
  }
};

// ----------------------------------------------------------------------
// LUCKY NAME SPELLING SUGGESTION ENGINE
// ----------------------------------------------------------------------

export type LuckyNameSuggestion = {
  suggestedName: string;
  addedLetter: string;
  chaldeanNumber: number;
  rulerKn: string;
  rulerEn: string;
  isHarmonious: boolean;
};

/** Generates lucky spelling variations targeting a target lucky number (e.g. 5, 6, 1, 3) */
export function generateLuckyNameSuggestions(
  originalName: string,
  targetLuckyNumbers: number[] = [5, 6, 1, 3]
): LuckyNameSuggestion[] {
  const base = originalName.trim();
  if (!base) return [];

  const clean = base.toUpperCase();
  const suggestions: LuckyNameSuggestion[] = [];
  const seen = new Set<string>();

  // Helper to add suggestion if valid
  const tryAdd = (suggested: string, letter: string) => {
    if (seen.has(suggested.toLowerCase())) return;
    seen.add(suggested.toLowerCase());
    const ch = calculateChaldeanNameNumber(suggested);
    const g = NUMEROLOGY_GUIDANCE_MAP[ch.single];
    if (!g) return;
    const isHarmonious = targetLuckyNumbers.includes(ch.single);
    suggestions.push({
      suggestedName: suggested,
      addedLetter: letter,
      chaldeanNumber: ch.compound,
      rulerKn: g.rulerKn,
      rulerEn: g.rulerEn,
      isHarmonious
    });
  };

  // Try adding common lucky phonetic letters (A, E, H, I, N, R, S)
  const lettersToTry = ["A", "E", "H", "I", "N", "R", "S"];
  for (const l of lettersToTry) {
    // Append at end
    tryAdd(`${base}${l.toLowerCase()}`, `+${l} at end`);
    // Double last letter if consonant
    const lastChar = clean.slice(-1);
    if ("BCDFGHJKLMNPQRSTVWXYZ".includes(lastChar)) {
      tryAdd(`${base}${lastChar.toLowerCase()}`, `Double ${lastChar}`);
    }
  }

  // Sort: harmonious target numbers first, then lowest compound number
  return suggestions
    .sort((a, b) => (b.isHarmonious ? 1 : 0) - (a.isHarmonious ? 1 : 0))
    .slice(0, 5);
}

// ----------------------------------------------------------------------
// PHONE / VEHICLE / HOUSE NUMBER NUMEROLOGY CALCULATOR
// ----------------------------------------------------------------------

export type ItemNumerologyResult = {
  rawInput: string;
  cleanDigits: string;
  totalSum: number;
  singleDigit: number;
  rulerKn: string;
  rulerEn: string;
  deityKn: string;
  deityEn: string;
  verdictCategory: "highly_auspicious" | "favorable" | "neutral" | "needs_remedy";
  verdictKn: string;
  verdictEn: string;
  recommendationKn: string;
  recommendationEn: string;
};

/** Calculates Phone / Vehicle / House number numerology score & compatibility */
export function calculateItemNumerology(
  inputString: string,
  userMulank?: number
): ItemNumerologyResult {
  const clean = inputString.replace(/[^0-9]/g, "");
  let sum = 0;
  for (const char of clean) {
    sum += Number(char);
  }
  const single = reduceToSingleDigit(sum);
  const guidance = NUMEROLOGY_GUIDANCE_MAP[single] || NUMEROLOGY_GUIDANCE_MAP[1]!;

  let isCompatible = true;
  if (userMulank && guidance.enemyNumbers.includes(userMulank)) {
    isCompatible = false;
  }

  let category: ItemNumerologyResult["verdictCategory"] = "favorable";
  let vKn = "";
  let vEn = "";
  let recKn = "";
  let recEn = "";

  if ([1, 3, 5, 6].includes(single) && isCompatible) {
    category = "highly_auspicious";
    vKn = "🌟 ಅತ್ಯುಚ್ಚ ದೈವಿಕ ಅದೃಷ್ಟ ತರುವ ರಾಜಯೋಗ ಸಂಖ್ಯೆ (Highly Auspicious)";
    vEn = "🌟 Highly Auspicious & Fortune-bringing Number!";
    recKn = `ಈ ಸಂಖ್ಯೆಯು ${guidance.rulerKn} ಗ್ರಹದ ಶುಭ ಸ್ಪಂದನ ಹೊಂದಿದ್ದು ಧನ, ಪ್ರಗತಿ ಹಾಗೂ ಶಾಂತಿ ನೀಡುತ್ತದೆ.`;
    recEn = `This number carries divine vibrations of ${guidance.rulerEn}, bringing wealth and peace.`;
  } else if (!isCompatible || single === 8 || single === 4) {
    category = "needs_remedy";
    vKn = "⚠️ ಸಂಖ್ಯಾ ಶೋಧನೆ & ಪರಿಹಾರ ಅಗತ್ಯವಿರುವ ಸಂಖ್ಯೆ (Needs Remedy / Neutral)";
    vEn = "⚠️ Needs Numerical Balancing / Remedy";
    recKn = `ಈ ಸಂಖ್ಯೆಯ ಒಟ್ಟು ${single} ಗ್ರಹ ${guidance.rulerKn} ನನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಸಣ್ಣ ಪರಿಹಾರ ಸ್ವಸ್ತಿಕ ಅಥವಾ ಲಕ್ಕಿ ಸ್ಟಿಕ್ಕರ್ ಹಚ್ಚುವುದರಿಂದ ದೋಷ ಶಮನವಾಗುತ್ತದೆ.`;
    recEn = `Total digit ${single} is ruled by ${guidance.rulerEn}. Applying a small Swastik or auspicious number sticker neutralizes any friction.`;
  } else {
    category = "favorable";
    vKn = "✅ ಶುಭ ಹಾಗೂ ಸಮತೋಲಿತ ಫಲ ನೀಡುವ ಸಂಖ್ಯೆ (Favorable)";
    vEn = "✅ Favorable & Balanced Number";
    recKn = `ಈ ಸಂಖ್ಯೆಯು ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಸೌಹಾರ್ದತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`;
    recEn = `This number enhances stability and harmony in daily life.`;
  }

  return {
    rawInput: inputString,
    cleanDigits: clean,
    totalSum: sum,
    singleDigit: single,
    rulerKn: guidance.rulerKn,
    rulerEn: guidance.rulerEn,
    deityKn: guidance.deityKn,
    deityEn: guidance.deityEn,
    verdictCategory: category,
    verdictKn: vKn,
    verdictEn: vEn,
    recommendationKn: recKn,
    recommendationEn: recEn
  };
}

// ----------------------------------------------------------------------
// 1. LOVE & MARRIAGE NUMEROLOGY MATCHMAKER ENGINE
// ----------------------------------------------------------------------

export type CompatibilityDimension = {
  dimensionKey: "mulank" | "bhagyank" | "name" | "element" | "prosperity";
  titleKn: string;
  titleEn: string;
  boyValue: string;
  girlValue: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "moderate" | "friction";
  descriptionKn: string;
  descriptionEn: string;
};

export type LoveMarriageMatchResult = {
  boyName: string;
  boyDob: string;
  boyMulank: number;
  boyBhagyank: number;
  boyNameChaldean: number;
  boyNameSingle: number;

  girlName: string;
  girlDob: string;
  girlMulank: number;
  girlBhagyank: number;
  girlNameChaldean: number;
  girlNameSingle: number;

  overallScore: number; // 0..100%
  gradeKn: string;
  gradeEn: string;
  verdictCategory: "outstanding" | "favorable" | "moderate" | "needs_remedy";
  summaryKn: string;
  summaryEn: string;

  dimensions: CompatibilityDimension[];
  auspiciousWeddingDatesKn: string;
  auspiciousWeddingDatesEn: string;
  sacredRemedyKn: string;
  sacredRemedyEn: string;
};

/** Calculate single digit from date string YYYY-MM-DD */
export function calculateMulankFromDob(dobStr: string): number {
  if (!dobStr) return 1;
  const parts = dobStr.split("-");
  const day = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return reduceToSingleDigit(day || 1);
}

/** Calculate destiny number from date string YYYY-MM-DD */
export function calculateBhagyankFromDob(dobStr: string): number {
  if (!dobStr) return 1;
  const clean = dobStr.replace(/[^0-9]/g, "");
  let sum = 0;
  for (const c of clean) sum += Number(c);
  return reduceToSingleDigit(sum || 1);
}

/** Calculates 5-dimensional classical numerology marriage & love compatibility */
export function calculateLoveMarriageMatch(
  boyName: string,
  boyDob: string,
  girlName: string,
  girlDob: string
): LoveMarriageMatchResult {
  const bMulank = calculateMulankFromDob(boyDob);
  const bBhagyank = calculateBhagyankFromDob(boyDob);
  const bNameCh = calculateChaldeanNameNumber(boyName || "Boy");

  const gMulank = calculateMulankFromDob(girlDob);
  const gBhagyank = calculateBhagyankFromDob(girlDob);
  const gNameCh = calculateChaldeanNameNumber(girlName || "Girl");

  const bGuidance = NUMEROLOGY_GUIDANCE_MAP[bMulank] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const gGuidance = NUMEROLOGY_GUIDANCE_MAP[gMulank] || NUMEROLOGY_GUIDANCE_MAP[1]!;

  const dimensions: CompatibilityDimension[] = [];
  let totalScore = 0;

  // 1. Mulank Harmony (Core Temperament & Mind Match - Max 30 pts)
  let mulankScore = 20;
  let mulankStatus: CompatibilityDimension["status"] = "good";
  let mulankDescKn = "ಸ್ವಭಾವದಲ್ಲಿ ಸಮತೋಲನವಿದೆ.";
  let mulankDescEn = "Balanced mutual understanding.";

  if (bMulank === gMulank || bGuidance.friendlyNumbers.includes(gMulank)) {
    mulankScore = 30;
    mulankStatus = "excellent";
    mulankDescKn = `ಮೂಲಾಂಕ ${bMulank} (${bGuidance.rulerKn}) ಹಾಗೂ ${gMulank} (${gGuidance.rulerKn}) ಪರಸ್ಪರ ಅತ್ಯಂತ ಮೈತ್ರಿ ಗ್ರಹಗಳಾಗಿದ್ದು ಮಾನಸಿಕ ಸಾಮರಸ್ಯ ಅದ್ಭುತವಾಗಿದೆ.`;
    mulankDescEn = `Root numbers ${bMulank} (${bGuidance.rulerEn}) & ${gMulank} (${gGuidance.rulerEn}) are highly friendly planetary rulers creating deep emotional harmony.`;
  } else if (bGuidance.enemyNumbers.includes(gMulank) || gGuidance.enemyNumbers.includes(bMulank)) {
    mulankScore = 10;
    mulankStatus = "friction";
    mulankDescKn = `ಮೂಲಾಂಕ ${bMulank} ಹಾಗೂ ${gMulank} ಪರಸ್ಪರ ಭಿನ್ನ ಆಲೋಚನೆಗಳನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಸಣ್ಣ ಹೊಂದಾಣಿಕೆ ಅಗತ್ಯ.`;
    mulankDescEn = `Root numbers ${bMulank} & ${gMulank} indicate different perspectives; mutual patience and respectful communication bring balance.`;
  } else {
    mulankScore = 22;
    mulankStatus = "good";
    mulankDescKn = `ಮೂಲಾಂಕಗಳ ನಡುವೆ ತಟಸ್ಥ ಹಾಗೂ ಪ್ರಗತಿಪರ ಮೈತ್ರಿಯಿದೆ.`;
    mulankDescEn = `Neutral and supportive temperament synergy.`;
  }
  totalScore += mulankScore;
  dimensions.push({
    dimensionKey: "mulank",
    titleKn: "೧. ಮೂಲಾಂಕ ಮೈತ್ರಿ (ಸ್ವಭಾವ & ಮನೋಸಾಮರಸ್ಯ)",
    titleEn: "1. Mulank Harmony (Mind & Temperament)",
    boyValue: `${bMulank} (${bGuidance.rulerKn})`,
    girlValue: `${gMulank} (${gGuidance.rulerKn})`,
    score: mulankScore,
    maxScore: 30,
    status: mulankStatus,
    descriptionKn: mulankDescKn,
    descriptionEn: mulankDescEn
  });

  // 2. Bhagyank Harmony (Destiny & Long-term Life Path - Max 25 pts)
  const bBhagyankGuidance = NUMEROLOGY_GUIDANCE_MAP[bBhagyank] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const gBhagyankGuidance = NUMEROLOGY_GUIDANCE_MAP[gBhagyank] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  let bhagyankScore = 18;
  let bhagyankStatus: CompatibilityDimension["status"] = "good";
  let bhagyankDescKn = "ಭಾಗ್ಯಾಂಕಗಳ ನಡುವೆ ಉತ್ತಮ ಹೊಂದಾಣಿಕೆಯಿದೆ.";
  let bhagyankDescEn = "Good synergy in life goals and destiny path.";

  if (bBhagyank === gBhagyank || bBhagyankGuidance.friendlyNumbers.includes(gBhagyank)) {
    bhagyankScore = 25;
    bhagyankStatus = "excellent";
    bhagyankDescKn = `ಭಾಗ್ಯಾಂಕ ${bBhagyank} ಹಾಗೂ ${gBhagyank} ಜೊತೆಯಾಗಿ ಜೀವನದ ಉದ್ದೇಶಗಳನ್ನು ಪೂರೈಸಲು ದೈವಿಕ ಆಶೀರ್ವಾದ ನೀಡುತ್ತವೆ.`;
    bhagyankDescEn = `Destiny numbers ${bBhagyank} & ${gBhagyank} naturally align for shared career success and family prosperity.`;
  } else if (bBhagyankGuidance.enemyNumbers.includes(gBhagyank)) {
    bhagyankScore = 12;
    bhagyankStatus = "moderate";
    bhagyankDescKn = `ಜೀವನ ಶೈಲಿ ಮತ್ತು ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಮುಕ್ತ ಸಮಾಲೋಚನೆ ನಡೆಸಿದರೆ ದಾಂಪತ್ಯ ಶ್ರೇಷ್ಠವಾಗುತ್ತದೆ.`;
    bhagyankDescEn = `Open dialogue regarding finances and routines creates sustained harmony.`;
  } else {
    bhagyankScore = 20;
    bhagyankStatus = "good";
    bhagyankDescKn = `ದೀರ್ಘಕಾಲಿಕ ಗುರಿಗಳಲ್ಲಿ ಪರಸ್ಪರ ಪೂರಕ ಪ್ರೇರಣೆ ದೊರೆಯುತ್ತದೆ.`;
    bhagyankDescEn = `Complementary life aspirations and growth.`;
  }
  totalScore += bhagyankScore;
  dimensions.push({
    dimensionKey: "bhagyank",
    titleKn: "೨. ಭಾಗ್ಯಾಂಕ ಮೈತ್ರಿ (ಜೀವನ ಪಥ & ಭಾಗ್ಯೋದಯ)",
    titleEn: "2. Bhagyank Harmony (Destiny & Life Path)",
    boyValue: `${bBhagyank} (${bBhagyankGuidance.rulerKn})`,
    girlValue: `${gBhagyank} (${gBhagyankGuidance.rulerKn})`,
    score: bhagyankScore,
    maxScore: 25,
    status: bhagyankStatus,
    descriptionKn: bhagyankDescKn,
    descriptionEn: bhagyankDescEn
  });

  // 3. Name Number Vibration (Chaldean Harmony - Max 20 pts)
  const bNameGuidance = NUMEROLOGY_GUIDANCE_MAP[bNameCh.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const gNameGuidance = NUMEROLOGY_GUIDANCE_MAP[gNameCh.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  let nameScore = 15;
  let nameStatus: CompatibilityDimension["status"] = "good";
  let nameDescKn = "ಹೆಸರಿನ ಸ್ಪಂದನಗಳು ಪರಸ್ಪರ ಪ್ರೀತಿ ಹೆಚ್ಚಿಸುತ್ತವೆ.";
  let nameDescEn = "Name vibrations attract mutual affection.";

  if (bNameGuidance.friendlyNumbers.includes(gNameCh.single) || bNameCh.single === gNameCh.single) {
    nameScore = 20;
    nameStatus = "excellent";
    nameDescKn = `ಶಾಲ್ಡಿಯನ್ ನಾಮಾಂಕ ${bNameCh.compound} (${bNameCh.single}) ಹಾಗೂ ${gNameCh.compound} (${gNameCh.single}) ಆಕರ್ಷಕ ಪ್ರೇಮ ಹಾಗೂ ಗೌರವವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.`;
    nameDescEn = `Chaldean name numbers ${bNameCh.compound} & ${gNameCh.compound} radiate mutual attraction and sweetness in conversation.`;
  } else {
    nameScore = 14;
    nameStatus = "good";
    nameDescKn = `ನಾಮಾಂಕಗಳ ನಡುವೆ ಸಮತೋಲಿತ ಸಾಮಾಜಿಕ ಸೌಹಾರ್ದತೆಯಿದೆ.`;
    nameDescEn = `Balanced social and conversational rhythm.`;
  }
  totalScore += nameScore;
  dimensions.push({
    dimensionKey: "name",
    titleKn: "೩. ನಾಮಾಂಕ ಸ್ಪಂದನ (ಶಾಲ್ಡಿಯನ್ ಪ್ರೇಮ ಆಕರ್ಷಣೆ)",
    titleEn: "3. Name Vibration (Chaldean Energy)",
    boyValue: `${bNameCh.compound} (ಏಕಾಂಕ ${bNameCh.single})`,
    girlValue: `${gNameCh.compound} (ಏಕಾಂಕ ${gNameCh.single})`,
    score: nameScore,
    maxScore: 20,
    status: nameStatus,
    descriptionKn: nameDescKn,
    descriptionEn: nameDescEn
  });

  // 4. Element Synergy (Max 15 pts)
  let elemScore = 12;
  let elemStatus: CompatibilityDimension["status"] = "good";
  const bElem = bGuidance.elementKn;
  const gElem = gGuidance.elementKn;
  let elemDescKn = `${bElem} ಮತ್ತು ${gElem} ತತ್ತ್ವಗಳು ಪರಸ್ಪರ ಬೆಂಬಲಿಸುತ್ತವೆ.`;
  let elemDescEn = `${bGuidance.elementEn} and ${gGuidance.elementEn} elements nurture mutual growth.`;

  if (bGuidance.elementEn === gGuidance.elementEn || 
     (bGuidance.elementEn === "Fire" && gGuidance.elementEn === "Air") ||
     (bGuidance.elementEn === "Air" && gGuidance.elementEn === "Fire") ||
     (bGuidance.elementEn === "Water" && gGuidance.elementEn === "Earth") ||
     (bGuidance.elementEn === "Earth" && gGuidance.elementEn === "Water")) {
    elemScore = 15;
    elemStatus = "excellent";
    elemDescKn = `${bElem} ಹಾಗೂ ${gElem} ಪಂಚಭೂತ ತತ್ತ್ವಗಳು ಅದ್ಭುತವಾಗಿ ಒಂದಕ್ಕೊಂದು ಪೂರಕವಾಗಿವೆ.`;
    elemDescEn = `Elements create a naturally harmonious and nurturing environment.`;
  }
  totalScore += elemScore;
  dimensions.push({
    dimensionKey: "element",
    titleKn: "೪. ಪಂಚಭೂತ ತತ್ತ್ವ ಸಮನ್ವಯ (Element Synergy)",
    titleEn: "4. Element Synergy (Elemental Balance)",
    boyValue: bGuidance.elementKn,
    girlValue: gGuidance.elementKn,
    score: elemScore,
    maxScore: 15,
    status: elemStatus,
    descriptionKn: elemDescKn,
    descriptionEn: elemDescEn
  });

  // 5. Kshema & Bhagya Prosperity Index (Max 10 pts)
  let prospScore = 8;
  if ([1, 3, 5, 6].includes(bMulank) && [1, 3, 5, 6].includes(gMulank)) {
    prospScore = 10;
  }
  totalScore += prospScore;
  dimensions.push({
    dimensionKey: "prosperity",
    titleKn: "೫. ಕ್ಷೇಮ & ಧನಯೋಗ ಸಮೃದ್ಧಿ (Family Prosperity Index)",
    titleEn: "5. Family Prosperity & Kshema Index",
    boyValue: `${bMulank * 10 + 7}%`,
    girlValue: `${gMulank * 10 + 7}%`,
    score: prospScore,
    maxScore: 10,
    status: prospScore === 10 ? "excellent" : "good",
    descriptionKn: "ವಿವಾಹದ ನಂತರ ಗೃಹದಲ್ಲಿ ಸಿರಿದನ, ಸುಖ-ಶಾಂತಿ ಹಾಗೂ ಸಂತಾನ ಯೋಗ ವೃದ್ಧಿಯಾಗುವ ಸೂಚನೆ.",
    descriptionEn: "Strong indicators of sustained domestic wealth, auspicious growth and peace."
  });

  // Overall Grade & Summary
  let gradeKn = "🟢 ಶುಭ ದಾಂಪತ್ಯ ಯೋಗ (Favorable Match)";
  let gradeEn = "🟢 Favorable & Harmonious Match";
  let category: LoveMarriageMatchResult["verdictCategory"] = "favorable";
  let summaryKn = "ಈ ಜೋಡಿಯು ಪರಸ್ಪರ ಪ್ರೀತಿ, ವಿಶ್ವಾಸ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸಂತೋಷದ ದಾಂಪತ್ಯವನ್ನು ಅನುಭವಿಸಲು ಅತ್ಯಂತ ಯೋಗ್ಯವಾಗಿದೆ.";
  let summaryEn = "This pair shares auspicious numerological harmony for long-term affection, mutual respect, and marital stability.";

  if (totalScore >= 85) {
    category = "outstanding";
    gradeKn = "🌟 ಅತ್ಯುತ್ತಮ ರಾಜಯೋಗ ದಾಂಪತ್ಯ (Outstanding Celestial Match)";
    gradeEn = "🌟 Outstanding Celestial Rajayoga Match!";
    summaryKn = "ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ ಹಾಗೂ ನಾಮಾಂಕಗಳ ಸಮ್ಮಿಲನವು ಅತ್ಯುತ್ಕೃಷ್ಟವಾಗಿದ್ದು, ಗೃಹಲಕ್ಷ್ಮಿ ಯೋಗ ಮತ್ತು ಸಕಲ ಭಾಗ್ಯೋದಯ ನೀಡುತ್ತದೆ.";
    summaryEn = "Excellent alignment across all numerological axes, promising abundant joy, career elevation, and lifelong devotion.";
  } else if (totalScore < 60) {
    category = "needs_remedy";
    gradeKn = "⚠️ ಮಧ್ಯಮ ಮೈತ್ರಿ - ಪರಿಹಾರ ಅಗತ್ಯ (Needs Remedial Harmony)";
    gradeEn = "⚠️ Moderate Match - Sacred Remedy Recommended";
    summaryKn = "ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ ಬೆಳೆಸಿಕೊಳ್ಳಲು ಹಾಗೂ ಗ್ರಹ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರೀ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದು ಶ್ರೇಷ್ಠ.";
    summaryEn = "Performing sacred Lakshmi-Narayana archana at Gokarna ensures peaceful understanding and removes planetary friction.";
  }

  // Auspicious Wedding Dates (Common lucky dates)
  const luckyDatesSet = new Set<string>();
  const common = [1, 2, 3, 5, 6, 9];
  for (const n of common) {
    if (bGuidance.friendlyNumbers.includes(n) || gGuidance.friendlyNumbers.includes(n)) {
      luckyDatesSet.add(`${n}`);
      luckyDatesSet.add(`${n + 9}`);
      luckyDatesSet.add(`${n + 18}`);
    }
  }
  const sortedDates = Array.from(luckyDatesSet).map(Number).filter(d => d <= 31).sort((a, b) => a - b).slice(0, 8);
  const weddingDatesKn = sortedDates.map(d => `${d}`).join(", ");
  const weddingDatesEn = sortedDates.join(", ");

  const remedyKn = "ವಿವಾಹ ಜೀವನದಲ್ಲಿ ನಿತ್ಯ ಸುಖ-ಶಾಂತಿಗಾಗಿ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ.";
  const remedyEn = "Perform sacred Uma-Maheshwara seva at Sri Gokarna Mahabaleshwara temple and light a pure ghee lamp on Fridays for domestic bliss.";

  return {
    boyName: boyName || "Boy",
    boyDob,
    boyMulank: bMulank,
    boyBhagyank: bBhagyank,
    boyNameChaldean: bNameCh.compound,
    boyNameSingle: bNameCh.single,

    girlName: girlName || "Girl",
    girlDob,
    girlMulank: gMulank,
    girlBhagyank: gBhagyank,
    girlNameChaldean: gNameCh.compound,
    girlNameSingle: gNameCh.single,

    overallScore: totalScore,
    gradeKn,
    gradeEn,
    verdictCategory: category,
    summaryKn,
    summaryEn,
    dimensions,
    auspiciousWeddingDatesKn: `${weddingDatesKn} (ಯಾವುದೇ ತಿಂಗಳ ಈ ದಿನಾಂಕಗಳು ಶುಭ)`,
    auspiciousWeddingDatesEn: `${weddingDatesEn} (Auspicious on these dates of any month)`,
    sacredRemedyKn: remedyKn,
    sacredRemedyEn: remedyEn
  };
}

// ----------------------------------------------------------------------
// 2. BOYS' SPECIAL CAREER, WEALTH & POWER NUMEROLOGY MATRIX
// ----------------------------------------------------------------------

export type BoysNumerologyProfile = {
  mulank: number;
  bhagyank: number;
  nameChaldean: number;
  nameSingle: number;
  rulerKn: string;
  rulerEn: string;
  careerDomainsKn: string[];
  careerDomainsEn: string[];
  financialCycleKn: string;
  financialCycleEn: string;
  peakSuccessAgesKn: string;
  peakSuccessAgesEn: string;
  luckyVehicleNumbers: number[];
  luckyCorporateTitlesKn: string[];
  luckyCorporateTitlesEn: string[];
  powerMantraKn: string;
  powerMantraEn: string;
};

export function getBoysNumerologyProfile(name: string, dob: string): BoysNumerologyProfile {
  const mulank = calculateMulankFromDob(dob);
  const bhagyank = calculateBhagyankFromDob(dob);
  const nameCh = calculateChaldeanNameNumber(name || "Devotee");
  const g = NUMEROLOGY_GUIDANCE_MAP[mulank] || NUMEROLOGY_GUIDANCE_MAP[1]!;

  const careerMapKn: Record<number, string[]> = {
    1: ["ಸರ್ಕಾರಿ ಉನ್ನತಾಧಿಕಾರ & IAS/IPS", "ವ್ಯಾಪಾರ ಮಾಲೀಕತ್ವ / Founder", "ರಾಜಕೀಯ & ನಾಯಕತ್ವ", "ಸೂರ್ಯ ಶಕ್ತಿ & ರಕ್ಷಣಾ ವಲಯ"],
    2: ["ಸೃಜನಶೀಲ ಕಲೆ, ಸಿನಿಮಾ & ಸಾಹಿತ್ಯ", "ಆಮದು-ರಫ್ತು & ಜಲ ಸಾರಿಗೆ", "ಹೋಟೆಲ್ & ಹಾಸ್ಪಿಟಾಲಿಟಿ", "ಸಲಹಾಕಾರರು & ಮಾನಸಿಕ ತಜ್ಞರು"],
    3: ["ಶಿಕ್ಷಣ, ಪ್ರೊಫೆಸರ್ & ಸಂಶೋಧನೆ", "ಕಾನೂನು & ನ್ಯಾಯಾಂಗ ಕ್ಷೇತ್ರ", "ಹಣಕಾಸು ಸಲಹೆ & ಬ್ಯಾಂಕಿಂಗ್", "ಧಾರ್ಮಿಕ & ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ"],
    4: ["ಸಾಫ್ಟ್‌ವೇರ್, IT & AI ಎಂಜಿನಿಯರಿಂಗ್", "ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಮೂಲಸೌಕರ್ಯ", "ಷೇರು ಮಾರುಕಟ್ಟೆ & ಗಣಿಗಾರಿಕೆ", "ಅಂತಾರಾಷ್ಟ್ರೀಯ ವಾಣಿಜ್ಯ"],
    5: ["ವ್ಯಾಪಾರ, ಇ-ಕಾಮರ್ಸ್ & ಟ್ರೇಡಿಂಗ್", "ಬ್ಯಾಂಕಿಂಗ್ & ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್", "ಮಾಧ್ಯಮ, ಮಾರ್ಕೆಟಿಂಗ್ & PR", "ದೂರಸಂಪರ್ಕ & ಸಾರಿಗೆ"],
    6: ["ಫ್ಯಾಷನ್, ಐಷಾರಾಮಿ ಬ್ರಾಂಡ್‌ಗಳು & ಒಡವೆ", "ಸಿನಿಮಾ, ಸಂಗೀತ & ಮನರಂಜನೆ", "ವಾಸ್ತುಶಿಲ್ಪ & ಇಂಟೀರಿಯರ್ ಡಿಸೈನ್", "ರೆಸ್ಟೋರೆಂಟ್ & ಆತಿಥ್ಯ"],
    7: ["ಡೇಟಾ ಸೈನ್ಸ್, AI & ಸಂಶೋಧನೆ", "ಆಯುರ್ವೇದ & ವೈದ್ಯಕೀಯ ಕ್ಷೇತ್ರ", "ತತ್ತ್ವಶಾಸ್ತ್ರ & ವಿಶ್ಲೇಷಣೆ", "ಅಂತರಿಕ್ಷ & ರಕ್ಷಣಾ ತಂತ್ರಜ್ಞಾನ"],
    8: ["ರಿಯಲ್ ಎಸ್ಟೇಟ್, ನಿರ್ಮಾಣ & ಕೈಗಾರಿಕೆ", "ಕಬ್ಬಿಣ, ಉಕ್ಕು & ಯಂತ್ರೋಪಕರಣ", "ಕಾನೂನು, ಲೆಕ್ಕಪರಿಶೋಧನೆ & ನ್ಯಾಯಾಂಗ", "ರಾಜಕೀಯ & ಸಾಮೂಹಿಕ ನಾಯಕತ್ವ"],
    9: ["ರಕ್ಷಣಾ ಪಡೆ, ಸೇನೆ & ಪೊಲೀಸ್", "ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು / ಸರ್ಜನ್ & ವೈದ್ಯಕೀಯ", "ಕ್ರೀಡೆ, ಸಾಹಸ & ಫಿಟ್‌ನೆಸ್", "ಉದ್ಯಮಶೀಲತೆ & ಭೂ ವ್ಯವಹಾರ"]
  };

  const careerMapEn: Record<number, string[]> = {
    1: ["Government Leadership & Executive Roles", "Business Founder & CEO", "Politics & Strategic Governance", "Defense & Energy Sector"],
    2: ["Creative Arts, Cinema & Writing", "Import/Export & Marine Trade", "Hospitality & Healthcare", "Counselling & Psychology"],
    3: ["Education, Academic Research & University", "Law, Judiciary & Advocacy", "Financial Planning & Banking", "Spiritual Mentorship"],
    4: ["Software Architecture, AI & Tech", "Real Estate & Infrastructure", "Stock Market Trading & Analytics", "International Commerce"],
    5: ["E-Commerce, Trade & High-speed Business", "Banking & Chartered Accountancy", "Media, Public Relations & Marketing", "Logistics & Fintech"],
    6: ["Luxury Goods, Jewelry & Fashion", "Media Production & Entertainment", "Architecture & Interior Design", "Hospitality & Lifestyle"],
    7: ["Data Science, AI & Deep Research", "Ayurvedic & Modern Medicine", "Philosophy, Consulting & Cyber Security", "Aerospace"],
    8: ["Heavy Industries, Manufacturing & Mining", "Real Estate Development & Construction", "Corporate Law & Auditing", "Civil Governance"],
    9: ["Defense, Armed Forces & Police Command", "Surgery & Medical Sciences", "Sports, Fitness & Adventure", "Real Estate & Entrepreneurship"]
  };

  const peakAgesKn: Record<number, string> = {
    1: "೨೮, ೩೪, ೩೭, ೪೬ ವರ್ಷಗಳು (ಸೂರ್ಯ ತೇಜಸ್ಸಿನ ಕಾಲ)",
    2: "೨೫, ೨೯, ೩೮, ೪೭ ವರ್ಷಗಳು (ಚಂದ್ರ ಕೃಪೆಯ ಕಾಲ)",
    3: "೨೪, ೩೦, ೩೩, ೪೨, ೫೧ ವರ್ಷಗಳು (ಗುರು ಭಾಗ್ಯೋದಯ)",
    4: "೨೨, ೩೧, ೪೦, ೪೯ ವರ್ಷಗಳು (ರಾಹು ಹಠಾತ್ ಯಶಸ್ಸು)",
    5: "೨೩, ೩೨, ೪೧, ೫೦ ವರ್ಷಗಳು (ಬುಧ ವಾಣಿಜ್ಯ ಲಾಭ)",
    6: "೨೪, ೩೩, ೪೨, ೫೧ ವರ್ಷಗಳು (ಶುಕ್ರ ವೈಭವ ಪ್ರಾಪ್ತಿ)",
    7: "೨೫, ೩೪, ೪೩, ೫೨ ವರ್ಷಗಳು (ಕೇತು ಜ್ಞಾನೋದಯ ಕಾಲ)",
    8: "೩೨, ೩೬, ೪೪, ೫೩ ವರ್ಷಗಳು (ಶನಿ ಶಾಶ್ವತ ಸಾಮ್ರಾಜ್ಯ)",
    9: "೨೭, ೩೬, ೪೫, ೫೪ ವರ್ಷಗಳು (ಮಂಗಳ ವಿಜಯ ಕಾಲ)"
  };

  const peakAgesEn: Record<number, string> = {
    1: "Ages 28, 34, 37, 46 (Solar Leadership Era)",
    2: "Ages 25, 29, 38, 47 (Lunar Creativity Era)",
    3: "Ages 24, 30, 33, 42, 51 (Jupiter Prosperity Era)",
    4: "Ages 22, 31, 40, 49 (Rahu Breakthrough Era)",
    5: "Ages 23, 32, 41, 50 (Mercury Commercial Era)",
    6: "Ages 24, 33, 42, 51 (Venus Luxury Era)",
    7: "Ages 25, 34, 43, 52 (Ketu Wisdom Era)",
    8: "Ages 32, 36, 44, 53 (Saturn Empire Era)",
    9: "Ages 27, 36, 45, 54 (Mars Triumph Era)"
  };

  const luckyVehicles = [1, 3, 5, 6].filter(n => !g.enemyNumbers.includes(n));
  if (luckyVehicles.length === 0) luckyVehicles.push(5);

  return {
    mulank,
    bhagyank,
    nameChaldean: nameCh.compound,
    nameSingle: nameCh.single,
    rulerKn: g.rulerKn,
    rulerEn: g.rulerEn,
    careerDomainsKn: careerMapKn[mulank] || careerMapKn[1]!,
    careerDomainsEn: careerMapEn[mulank] || careerMapEn[1]!,
    financialCycleKn: `ನಿಮ್ಮ ಮೂಲಾಂಕ ${mulank} ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${bhagyank} ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿ ತಿಂಗಳ ${g.luckyDatesKn} ದಿನಾಂಕಗಳು ಹೊಸ ಒಪ್ಪಂದ, ಹೂಡಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಆರಂಭಕ್ಕೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
    financialCycleEn: `Based on Mulank ${mulank} and Bhagyank ${bhagyank}, dates ${g.luckyDatesEn} of any month are peak power days for contracts, investments, and business launches.`,
    peakSuccessAgesKn: peakAgesKn[mulank] || peakAgesKn[1]!,
    peakSuccessAgesEn: peakAgesEn[mulank] || peakAgesEn[1]!,
    luckyVehicleNumbers: luckyVehicles,
    luckyCorporateTitlesKn: ["Managing Director", "Chief Executive / Founder", "Principal Consultant", "President"],
    luckyCorporateTitlesEn: ["Managing Director", "Chief Executive / Founder", "Principal Consultant", "President"],
    powerMantraKn: `ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ / ಶ್ರೀ ಸೂರ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ`,
    powerMantraEn: `Om Namo Bhagavate Vasudevaya / Sri Surya Gayatri Mantra`
  };
}

// ----------------------------------------------------------------------
// 3. GIRLS' SPECIAL SAUBHAGYA, MARRIAGE NAME IMPACT & HARMONY MATRIX
// ----------------------------------------------------------------------

export type GirlsNumerologyProfile = {
  mulank: number;
  bhagyank: number;
  nameChaldean: number;
  nameSingle: number;
  rulerKn: string;
  rulerEn: string;
  saubhagyaVirtuesKn: string;
  saubhagyaVirtuesEn: string;
  auraColorsKn: string;
  auraColorsEn: string;
  gemstoneAuraKn: string;
  gemstoneAuraEn: string;
  domesticHarmonyScore: number;
  domesticHarmonyKn: string;
  domesticHarmonyEn: string;
  empowermentAvenuesKn: string[];
  empowermentAvenuesEn: string[];
  goddessMantraKn: string;
  goddessMantraEn: string;
};

export function getGirlsNumerologyProfile(name: string, dob: string): GirlsNumerologyProfile {
  const mulank = calculateMulankFromDob(dob);
  const bhagyank = calculateBhagyankFromDob(dob);
  const nameCh = calculateChaldeanNameNumber(name || "Devotee");
  const g = NUMEROLOGY_GUIDANCE_MAP[mulank] || NUMEROLOGY_GUIDANCE_MAP[6]!;

  const empMapKn: Record<number, string[]> = {
    1: ["ಉದ್ಯಮಶೀಲತೆ & ಆಡಳಿತ ನಿರ್ವಹಣೆ", "ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳ ಮುನ್ನಡೆ", "ರಾಜಕೀಯ & ಸಾಮಾಜಿಕ ನಾಯಕತ್ವ", "ಫ್ಯಾಷನ್ & ಇಂಟೀರಿಯರ್ ಡಿಸೈನ್"],
    2: ["ಮನಃಶಾಸ್ತ್ರ & ಕೌನ್ಸೆಲಿಂಗ್", "ಶಿಶುಪಾಲನೆ & ಆತಿಥ್ಯೋದ್ಯಮ", "ಸಾಹಿತ್ಯ, ಸಂಗೀತ & ಕಲಾ ಪ್ರದರ್ಶನ", "ಆಯುರ್ವೇದ & ಸ್ವಾಸ್ಥ್ಯ ಕೇಂದ್ರ"],
    3: ["ಉನ್ನತ ಶಿಕ್ಷಣ & ಬೋಧನೆ", "ಕಾನೂನು, ಬ್ಯಾಂಕಿಂಗ್ & ಲೆಕ್ಕಪರಿಶೋಧನೆ", "ಆಧ್ಯಾತ್ಮಿಕ ಬರವಣಿಗೆ & ಯೋಗ", "ಮಾನವ ಸಂಪನ್ಮೂಲ (HR)"],
    4: ["ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ & ಸಾಫ್ಟ್‌ವೇರ್", "ಆನ್‌ಲೈನ್ ವ್ಯಾಪಾರ & ಇ-ಕಾಮರ್ಸ್", "ವಿನ್ಯಾಸ & ಸಂಶೋಧನೆ", "ಇವೆಂಟ್ ಮ್ಯಾನೇಜ್ಮೆಂಟ್"],
    5: ["ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ & PR", "ಬ್ಯಾಂಕಿಂಗ್, ಫಿನ್‌ಟೆಕ್ & ಷೇರು ಮಾರುಕಟ್ಟೆ", "ಪ್ರವಾಸೋದ್ಯಮ & ಪತ್ರಿಕೋದ್ಯಮ", "ಬುಟಿಕ್ & ವಾಣಿಜ್ಯ"],
    6: ["ಫ್ಯಾಷನ್ ವಿನ್ಯಾಸ, ಒಡವೆ & ಬ್ಯೂಟಿ ಬ್ರಾಂಡ್", "ಸಂಗೀತ, ನೃತ್ಯ & ಸಿನೆಮಾ", "ಐಷಾರಾಮಿ ಹೋಟೆಲ್ & ರೆಸ್ಟೋರೆಂಟ್", "ಮನೆ ಅಲಂಕಾರ & ವಾಸ್ತು"],
    7: ["ವೈಜ್ಞಾನಿಕ ಸಂಶೋಧನೆ & ಡೇಟಾ", "ಯೋಗ, ಪ್ರಾಣಾಯಾಮ & ಧ್ಯಾನ ಕೇಂದ್ರ", "ಆಯುರ್ವೇದ ಔಷಧ ತಯಾರಿಕೆ", "ಜ್ಯೋತಿಷ್ಯ & ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ"],
    8: ["ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಆಸ್ತಿ ನಿರ್ವಹಣೆ", "ಕಾನೂನು & ಕಾರ್ಪೊರೇಟ್ ಆಡಳಿತ", "ದೊಡ್ಡ ಕೈಗಾರಿಕೆ & ಲಾಜಿಸ್ಟಿಕ್ಸ್", "ಸರ್ಕಾರಿ ಸೇವೆಗಳು"],
    9: ["ವೈದ್ಯಕೀಯ ಸರ್ಜರಿ & ಫಾರ್ಮಸಿ", "ಕ್ರೀಡೆ, ಫಿಟ್‌ನೆಸ್ & ನೃತ್ಯ ಶಾಲೆ", "ಎನ್‌ಜಿಒ & ಮಹಿಳಾ ಸಬಲೀಕರಣ", "ಹೋಟೆಲ್ & ಕಾಫಿ ಎಸ್ಟೇಟ್"]
  };

  const empMapEn: Record<number, string[]> = {
    1: ["Entrepreneurship & Administrative Leadership", "Educational Leadership", "Social & Public Governance", "Fashion & Interior Design"],
    2: ["Psychology, Therapy & Child Wellness", "Hospitality & Organic Living", "Fine Arts, Music & Creative Writing", "Ayurvedic Healing"],
    3: ["Higher Education, Professorship & Research", "Law, Corporate Finance & Auditing", "Spiritual Literature & Yoga Guidance", "HR Leadership"],
    4: ["IT, Software & Product Management", "E-Commerce & Digital Innovations", "Architectural Design & Analytics", "Event Production"],
    5: ["Digital Marketing, Media & Public Relations", "Fintech, Wealth Advisory & Trading", "Tourism, Journalism & Podcasting", "Boutique Business"],
    6: ["Fashion Design, Fine Jewelry & Beauty Brands", "Music, Performing Arts & Entertainment", "Luxury Hospitality & Decor", "Vedic Aesthetics"],
    7: ["Scientific Research, Data & Deep Analysis", "Holistic Wellness & Meditation Studios", "Integrative Medicine & Healing", "Esoteric Sciences"],
    8: ["Real Estate & Asset Portfolio Management", "Corporate Law & Executive Governance", "Logistics & Manufacturing", "Public Services"],
    9: ["Medical Surgery, Healthcare & Pharmacy", "Sports, Martial Arts & Fitness Studios", "NGO & Women Empowerment Initiatives", "Plantation & Trade"]
  };

  return {
    mulank,
    bhagyank,
    nameChaldean: nameCh.compound,
    nameSingle: nameCh.single,
    rulerKn: g.rulerKn,
    rulerEn: g.rulerEn,
    saubhagyaVirtuesKn: `ಮೂಲಾಂಕ ${mulank} ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${bhagyank} ಸಂಯೋಗವು ಗೃಹದಲ್ಲಿ ಮಂಗಳಕರ ಶಕ್ತಿ, ಸಂತೋಷ, ಕುಟುಂಬ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಧನ ಸಮೃದ್ಧಿಯನ್ನು ಆಕರ್ಷಿಸುತ್ತದೆ.`,
    saubhagyaVirtuesEn: `Mulank ${mulank} and Bhagyank ${bhagyank} synergize to radiate auspicious grace, attracting wealth, health, and harmonious family bonding.`,
    auraColorsKn: `${g.luckyColorsKn}, ಗುಲಾಬಿ, ಕೆನೆ ಬಣ್ಣ`,
    auraColorsEn: `${g.luckyColorsEn}, Rose Pink, Pearl White`,
    gemstoneAuraKn: `${g.luckyGemsKn} ಅಥವಾ ನೈಸರ್ಗಿಕ ಮುತ್ತು (Natural Pearl)`,
    gemstoneAuraEn: `${g.luckyGemsEn} or Natural South Sea Pearl`,
    domesticHarmonyScore: 92,
    domesticHarmonyKn: `ನಿಮ್ಮ ಸೌಮ್ಯ ಹಾಗೂ ದೃಢ ಗುಣಗಳು ಮನೆಯಲ್ಲಿ ಸದಾ ಶಾಂತಿ ಹಾಗೂ ದೈವಿಕ ಆಶೀರ್ವಾದವನ್ನು ಸ್ಥಾಪಿಸುತ್ತವೆ.`,
    domesticHarmonyEn: `Your innate grace and grounding presence ensure domestic peace and long-lasting auspiciousness.`,
    empowermentAvenuesKn: empMapKn[mulank] || empMapKn[6]!,
    empowermentAvenuesEn: empMapEn[mulank] || empMapEn[6]!,
    goddessMantraKn: `ಓಂ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ (ಶ್ರೀ ಸೂಕ್ತ ಪಠಣ)`,
    goddessMantraEn: `Om Shreem Hreem Kleem Mahalakshmyai Namah (Sri Sukta Stotram)`
  };
}

// ----------------------------------------------------------------------
// 4. POST-MARRIAGE SURNAME / NAME CHANGE NUMEROLOGY IMPACT ANALYZER
// ----------------------------------------------------------------------

export type PostMarriageNameImpact = {
  maidenName: string;
  maidenChaldean: number;
  maidenSingle: number;
  maidenRulerKn: string;
  maidenRulerEn: string;

  marriedName: string;
  marriedChaldean: number;
  marriedSingle: number;
  marriedRulerKn: string;
  marriedRulerEn: string;

  impactCategory: "highly_empowering" | "harmonious" | "neutral" | "caution";
  impactScore: number; // 0..100%
  impactKn: string;
  impactEn: string;
  adviceKn: string;
  adviceEn: string;
};

export function calculatePostMarriageNameImpact(
  maidenName: string,
  marriedName: string,
  userMulank?: number
): PostMarriageNameImpact {
  const m1 = calculateChaldeanNameNumber(maidenName || "Maiden");
  const m2 = calculateChaldeanNameNumber(marriedName || "Married");

  const g1 = NUMEROLOGY_GUIDANCE_MAP[m1.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;
  const g2 = NUMEROLOGY_GUIDANCE_MAP[m2.single] || NUMEROLOGY_GUIDANCE_MAP[1]!;

  let category: PostMarriageNameImpact["impactCategory"] = "harmonious";
  let score = 85;
  let impactKn = "";
  let impactEn = "";
  let adviceKn = "";
  let adviceEn = "";

  // Auspicious royal name numbers in Chaldean: 1, 3, 5, 6
  if ([1, 3, 5, 6].includes(m2.single)) {
    category = "highly_empowering";
    score = 95;
    impactKn = `🌟 ವಿವಾಹದ ನಂತರದ ಹೆಸರು ${m2.compound} (ಏಕಾಂಕ ${m2.single} - ${g2.rulerKn}) ಅತ್ಯಂತ ರಾಜಯೋಗ ಪ್ರದಾಯಕವಾಗಿದ್ದು, ಸೌಭಾಗ್ಯ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಗೌರವವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`;
    impactEn = `🌟 Married name vibrates at Chaldean ${m2.compound} (single ${m2.single} - ${g2.rulerEn}), which is highly empowering, ushering in fortune and elevation!`;
    adviceKn = "ಈ ಹೊಸ ಹೆಸರು ಅತ್ಯಂತ ಶುಭದಾಯಕವಾಗಿದ್ದು, ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಹಾಗೂ ಬ್ಯಾಂಕ್ ಖಾತೆಗಳಲ್ಲಿ ಯಾವುದೇ ಆತಂಕವಿಲ್ಲದೆ ಬಳಸಬಹುದು.";
    adviceEn = "This new name configuration is highly auspicious and can be freely used across legal and banking documents.";
  } else if (m2.single === 8 || m2.single === 4) {
    category = "caution";
    score = 65;
    impactKn = `⚠️ ವಿವಾಹದ ನಂತರದ ಹೆಸರು ${m2.compound} (ಏಕಾಂಕ ${m2.single} - ${g2.rulerKn}) ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಗೂ ನಿಧಾನಗತಿಯ ಫಲಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ.`;
    impactEn = `⚠️ Married name sum is ${m2.compound} (single ${m2.single} - ${g2.rulerEn}), which invites heavy responsibilities and slower returns.`;
    adviceKn = `ಹೆಸರಿನ ಸ್ಪೆಲ್ಲಿಂಗ್‌ನಲ್ಲಿ ಒಂದು ಹೆಚ್ಚುವರಿ ಅಕ್ಷರ (ಉದಾ: 'A' ಅಥವಾ 'E') ಸೇರಿಸುವ ಮೂಲಕ ಒಟ್ಟು ಸಂಖ್ಯೆಯನ್ನು ೫ ಅಥವಾ ೬ ಕ್ಕೆ ಪರಿಷ್ಕರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`;
    adviceEn = `Adding an auspicious single letter (e.g. 'A' or 'E') optimizes the total vibration to a friendly 5 (Mercury) or 6 (Venus).`;
  } else {
    category = "harmonious";
    score = 80;
    impactKn = `✅ ವಿವಾಹದ ನಂತರದ ಹೆಸರು ${m2.compound} (ಏಕಾಂಕ ${m2.single} - ${g2.rulerKn}) ಸ್ಥಿರ ಹಾಗೂ ಸೌಮ್ಯ ಕೌಟುಂಬಿಕ ಜೀವನಕ್ಕೆ ಪೂರಕವಾಗಿದೆ.`;
    impactEn = `✅ Married name ${m2.compound} (single ${m2.single} - ${g2.rulerEn}) supports emotional grounding and balanced family life.`;
    adviceKn = "ಹೆಸರು ಉತ್ತಮ ಸಮತೋಲನದಲ್ಲಿದೆ. ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಗೆ ಸಹಕಾರಿ.";
    adviceEn = "The name is well-balanced for continuous domestic peace and social goodwill.";
  }

  return {
    maidenName,
    maidenChaldean: m1.compound,
    maidenSingle: m1.single,
    maidenRulerKn: g1.rulerKn,
    maidenRulerEn: g1.rulerEn,

    marriedName,
    marriedChaldean: m2.compound,
    marriedSingle: m2.single,
    marriedRulerKn: g2.rulerKn,
    marriedRulerEn: g2.rulerEn,

    impactCategory: category,
    impactScore: score,
    impactKn,
    impactEn,
    adviceKn,
    adviceEn
  };
}
