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
