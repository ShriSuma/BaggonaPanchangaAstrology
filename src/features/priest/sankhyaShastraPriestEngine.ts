import { askGemini } from "../../core/GeminiEngine";

export type MotionNature = "ಸ್ಥಿರ (Fixed / ಶಾಶ್ವತ)" | "ಚರ (Movable / ಶೀಘ್ರ ಬದಲಾವಣೆ)" | "ಉಭಯ (Dual / ಮಿಶ್ರಿತ)";
export type VarnaInfluence = "ಉನ್ನತ ವರ್ಗ / ಅಧಿಕಾರಿಗಳು (Noble / Authorities)" | "ಮಧ್ಯಮ ವರ್ಗ / ವ್ಯಾಪಾರಿಗಳು (Peers / Traders)" | "ಸಾಮಾನ್ಯ ವರ್ಗ / ಶ್ರಮಿಕರು (General / Workers)";

export interface SankhyaPrashnaResult {
  number: number;
  question: string;
  devoteeName: string;
  gothra: string;
  rulingPlanetKn: string;
  natureKn: MotionNature;
  varnaKn: VarnaInfluence;
  rulingDirectionKn: string;
  auspiciousTimeframeKn: string;
  verdictBadgeKn: string; // e.g. "🟢 ಶೀಘ್ರ ಯಶಸ್ಸು", "🟡 ವಿಳಂಬಿತ ಜಯ", "🔴 ಅಡೆತಡೆ"
  technicalParagraphs: Array<{
    titleKn: string;
    contentKn: string;
  }>;
  remedyListKn: string[];
}

export interface SankhyaNameResult {
  inputName: string;
  birthDate: string;
  mulanka: number;
  bhagyanka: number;
  currentNameNumber: number;
  isHarmonious: boolean;
  harmonyVerdictKn: string;
  recommendedSpellingsKn: string[];
  luckyLettersKn: string[];
  auspiciousNumbers: number[];
  unfavorableNumbers: number[];
  luckyGemsKn: string;
  luckyDaysKn: string;
  technicalAnalysisKn: string;
}

export interface SankhyaMobileVehicleResult {
  birthDate: string;
  targetType: "mobile" | "vehicle";
  mulanka: number;
  bhagyanka: number;
  auspiciousTotals: number[];
  unfavorableTotals: number[];
  recommendedCombinations: string[];
  reasonsKn: string;
  guidelinesKn: string[];
}

// Chaldean letter values
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

export function calculateNameNumber(name: string): { total: number; singleDigit: number } {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let sum = 0;
  for (let i = 0; i < clean.length; i++) {
    sum += CHALDEAN_MAP[clean[i]] || 1;
  }
  let single = sum;
  while (single > 9) {
    single = single
      .toString()
      .split("")
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return { total: sum, singleDigit: single || 1 };
}

export function calculateMulankaBhagyanka(birthDateStr: string): { mulanka: number; bhagyanka: number } {
  try {
    const parts = birthDateStr.split("-");
    const day = parseInt(parts[2], 10) || 1;
    const month = parseInt(parts[1], 10) || 1;
    const year = parseInt(parts[0], 10) || 2000;

    let mulanka = day;
    while (mulanka > 9) {
      mulanka = mulanka
        .toString()
        .split("")
        .reduce((a, b) => a + parseInt(b, 10), 0);
    }

    let bhagyanka = `${day}${month}${year}`
      .split("")
      .reduce((a, b) => a + parseInt(b, 10), 0);
    while (bhagyanka > 9) {
      bhagyanka = bhagyanka
        .toString()
        .split("")
        .reduce((a, b) => a + parseInt(b, 10), 0);
    }

    return { mulanka: mulanka || 1, bhagyanka: bhagyanka || 1 };
  } catch {
    return { mulanka: 1, bhagyanka: 1 };
  }
}

/**
 * Deterministic + AI Hybrid Prashna Divination Engine
 */
export async function generateSankhyaPrashnaReading(params: {
  number: number;
  question: string;
  devoteeName: string;
  gothra: string;
}): Promise<SankhyaPrashnaResult> {
  const { number, question, devoteeName, gothra } = params;

  // 1. Vedic Mathematical Horary Attributes
  const planetList = [
    { nameKn: "ಸೂರ್ಯ (Sun)", nature: "ಸ್ಥಿರ (Fixed / ಶಾಶ್ವತ)" as MotionNature, varna: "ಉನ್ನತ ವರ್ಗ / ಅಧಿಕಾರಿಗಳು (Noble / Authorities)" as VarnaInfluence, dir: "ಪೂರ್ವ (East)", timeframe: "೧ ತಿಂಗಳು" },
    { nameKn: "ಚಂದ್ರ (Moon)", nature: "ಚರ (Movable / ಶೀಘ್ರ ಬದಲಾವಣೆ)" as MotionNature, varna: "ಸಾಮಾನ್ಯ ವರ್ಗ / ಶ್ರಮಿಕರು (General / Workers)" as VarnaInfluence, dir: "ವಾಯವ್ಯ (North-West)", timeframe: "೧೫ ದಿನಗಳು" },
    { nameKn: "ಕುಜ (Mars)", nature: "ಚರ (Movable / ಶೀಘ್ರ ಬದಲಾವಣೆ)" as MotionNature, varna: "ಉನ್ನತ ವರ್ಗ / ಅಧಿಕಾರಿಗಳು (Noble / Authorities)" as VarnaInfluence, dir: "ದಕ್ಷಿಣ (South)", timeframe: "೨೮ ದಿನಗಳು" },
    { nameKn: "ಬುಧ (Mercury)", nature: "ಉಭಯ (Dual / ಮಿಶ್ರಿತ)" as MotionNature, varna: "ಮಧ್ಯಮ ವರ್ಗ / ವ್ಯಾಪಾರಿಗಳು (Peers / Traders)" as VarnaInfluence, dir: "ಉತ್ತರ (North)", timeframe: "೨ ತಿಂಗಳು" },
    { nameKn: "ಗುರು (Jupiter)", nature: "ಸ್ಥಿರ (Fixed / ಶಾಶ್ವತ)" as MotionNature, varna: "ಉನ್ನತ ವರ್ಗ / ಅಧಿಕಾರಿಗಳು (Noble / Authorities)" as VarnaInfluence, dir: "ಈಶಾನ್ಯ (North-East)", timeframe: "೧ ವರ್ಷ" },
    { nameKn: "ಶುಕ್ರ (Venus)", nature: "ಉಭಯ (Dual / ಮಿಶ್ರಿತ)" as MotionNature, varna: "ಮಧ್ಯಮ ವರ್ಗ / ವ್ಯಾಪಾರಿಗಳು (Peers / Traders)" as VarnaInfluence, dir: "ಆಗ್ನೇಯ (South-East)", timeframe: "೨ ತಿಂಗಳು" },
    { nameKn: "ಶನಿ (Saturn)", nature: "ಸ್ಥಿರ (Fixed / ಶಾಶ್ವತ)" as MotionNature, varna: "ಸಾಮಾನ್ಯ ವರ್ಗ / ಶ್ರಮಿಕರು (General / Workers)" as VarnaInfluence, dir: "ಪಶ್ಚಿಮ (West)", timeframe: "೨.೫ ವರ್ಷಗಳು" },
    { nameKn: "ರಾಹು (Rahu)", nature: "ಚರ (Movable / ಶೀಘ್ರ ಬದಲಾವಣೆ)" as MotionNature, varna: "ಸಾಮಾನ್ಯ ವರ್ಗ / ಶ್ರಮಿಕರು (General / Workers)" as VarnaInfluence, dir: "ನೈಋತ್ಯ (South-West)", timeframe: "೧೮ ತಿಂಗಳು" },
    { nameKn: "ಕೇತು (Ketu)", nature: "ಉಭಯ (Dual / ಮಿಶ್ರಿತ)" as MotionNature, varna: "ಉನ್ನತ ವರ್ಗ / ಅಧಿಕಾರಿಗಳು (Noble / Authorities)" as VarnaInfluence, dir: "ಈಶಾನ್ಯ / ಅಧೋಮುಖ", timeframe: "೬ ತಿಂಗಳು" }
  ];

  const planetIndex = (number - 1) % 9;
  const planet = planetList[planetIndex];

  const isFavorable = [1, 2, 4, 5, 6].includes(planetIndex + 1);
  const verdictBadgeKn = isFavorable ? "🟢 ಶೀಘ್ರ ಶುಭ ಫಲ / ಯಶಸ್ಸು" : "🟡 ವಿಳಂಬಿತ ಪರಿಹಾರ ಸಹಿತ ಜಯ";

  const fallbackParagraphs = [
    {
      titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ನೇರ ನಿರ್ಣಯ ಮತ್ತು ಗ್ರಹಾಧಿಪತಿ ಸ್ಥಿತಿ",
      contentKn: `ಆಯ್ಕೆಮಾಡಲಾದ ಸಂಖ್ಯೆ ${number} ರ ಅಧಿಪತಿಯು ${planet.nameKn} ಆಗಿದ್ದು, ಈ ಪ್ರಶ್ನೆಯ ಪ್ರಕೃತಿಯು '${planet.nature}' ಆಗಿದೆ. ಈ ಸಂಖ್ಯೆಯು ಕಾರ್ಯದಲ್ಲಿ ಶೀಘ್ರ ಪ್ರಗತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಪ್ರಶ್ನಕಾಲದಲ್ಲಿ ${planet.nameKn} ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಸಂಕಲ್ಪಿಸಿದ ಕಾರ್ಯವು ಸಿದ್ಧಿಯಾಗುವ ಉತ್ತಮ ಯೋಗವಿದೆ.`
    },
    {
      titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಪ್ರಕೃತಿ ಮತ್ತು ಸಾಮಾಜಿಕ ವರ್ಗ ಪ್ರಭಾವ (ಸ್ಥಿರ/ಚರ/ಉಭಯ & ವರ್ಣ)",
      contentKn: `ಈ ಪ್ರಶ್ನೆಯು '${planet.nature}' ಸ್ವಭಾವದ್ದಾಗಿದ್ದು, ${planet.varna} ವರ್ಗದ ಜನರ ಪ್ರಭಾವ ಅಥವಾ ಸಹಕಾರದಿಂದ ಕಾರ್ಯವು ನೆರವೇರುತ್ತದೆ. ${planet.dir} ದಿಕ್ಕಿನಿಂದ ಬರುವ ಸಂದೇಶಗಳು ಮತ್ತು ವ್ಯಕ್ತಿಗಳು ಕಾರ್ಯಸಿದ್ಧಿಗೆ ಮುಖ್ಯ ಕಾರಣರಾಗುತ್ತಾರೆ.`
    },
    {
      titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಕಾಲಗಣನೆ, ದಿಕ್ಕು ಮತ್ತು ಅನುಕೂಲಕರ ಸಮಯ",
      contentKn: `ಈ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಫಲಿತಾಂಶವು ಅಂದಾಜು ${planet.timeframe} ಅವಧಿಯಲ್ಲಿ ಸ್ಪಷ್ಟ ರೂಪ ಪಡೆಯಲಿದೆ. ${planet.dir} ದಿಕ್ಕಿನಲ್ಲಿ ಮಾಡುವ ಪ್ರಯಾಣ ಅಥವಾ ಪ್ರಯತ್ನಗಳು ಅತ್ಯಂತ ಲಾಭದಾಯಕವಾಗಿರುತ್ತವೆ. ಭಾನುವಾರ ಮತ್ತು ಗುರುವಾರಗಳು ಈ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಶುಭಕರ.`
    },
    {
      titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಬಗ್ಗೋಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ",
      contentKn: `ಶ್ರೀ ${devoteeName} (${gothra} ಗೋತ್ರ) ಅವರ ಹೆಸರಿನಲ್ಲಿ ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಮತ್ತು ${planet.nameKn} ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ನವಗ್ರಹ ಸಂಕಲ್ಪ ಪೂಜೆ ಹಾಗೂ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಜಪವನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಎಲ್ಲಾ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರ ಕಾರ್ಯಸಿದ್ಧಿಯಾಗುವುದು.`
    }
  ];

  const remedyListKn = [
    `ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ಅಪ್ಪದ ನೈವೇದ್ಯ`,
    `${planet.nameKn} ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪ (ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ)`,
    `${planet.dir} ದಿಕ್ಕಿಗೆ ಮುಖಮಾಡಿ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸುವುದು`
  ];

  // Try Gemini AI for enhanced narrative in pure Kannada
  try {
    const aiPrompt = `ನೀವು ಪರಮ ಪೂಜ್ಯ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಮುಖ್ಯ ಸಂಖ್ಯಾಶಾಸ್ತ್ರಜ್ಞರು (Numerology Oracle Master).
ಭಕ್ತರ ವಿವರ:
ಹೆಸರು: ${devoteeName}
ಗೋತ್ರ: ${gothra}
ಆಯ್ಕೆಮಾಡಿದ ಸಂಖ್ಯೆ: ${number}
ಪ್ರಶ್ನೆ: "${question}"
ಸಂಖ್ಯಾಧಿಪತಿ: ${planet.nameKn}
ಪ್ರಕೃತಿ: ${planet.nature}
ವರ್ಣ ಪ್ರಭಾವ: ${planet.varna}
ದಿಕ್ಕು: ${planet.dir}

ದಯವಿಟ್ಟು ಈ ಪ್ರಶ್ನೆಗೆ ನಿಖರವಾದ ೪ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳ ತಾಂತ್ರಿಕ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿವರಣೆಯನ್ನು ಶುದ್ಧ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ನೀಡಿ:
ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ನೇರ ನಿರ್ಣಯ ಮತ್ತು ಸಂಖ್ಯಾ ಗ್ರಹ ಪ್ರಭಾವ
ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಪ್ರಕೃತಿ (ಸ್ಥಿರ/ಚರ/ಉಭಯ) ಮತ್ತು ವರ್ಣ ಪ್ರಭಾವ
ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಕಾಲಗಣನೆ ಮತ್ತು ದಿಕ್ಕಿನ ವಿಶ್ಲೇಷಣೆ
ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಬಗ್ಗೋಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಅನುಷ್ಠಾನ`;

    const aiRes = await askGemini(aiPrompt, "", "", "kn", { raw: true, temperature: 0.2 });
    if (aiRes && /[\u0C80-\u0CFF]/.test(aiRes) && aiRes.length > 100) {
      const rawParas = aiRes.split(/\n\n+/).filter((p) => p.trim().length > 20);
      if (rawParas.length >= 4) {
        const enrichedParas = [
          { titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ನೇರ ನಿರ್ಣಯ ಮತ್ತು ಗ್ರಹಾಧಿಪತಿ ಸ್ಥಿತಿ", contentKn: rawParas[0].replace(/^.*?:/g, "").trim() },
          { titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಪ್ರಕೃತಿ ಮತ್ತು ಸಾಮಾಜಿಕ ವರ್ಗ ಪ್ರಭಾವ (ಸ್ಥಿರ/ಚರ/ಉಭಯ)", contentKn: rawParas[1].replace(/^.*?:/g, "").trim() },
          { titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಕಾಲಗಣನೆ, ದಿಕ್ಕು ಮತ್ತು ಅನುಕೂಲಕರ ಸಮಯ", contentKn: rawParas[2].replace(/^.*?:/g, "").trim() },
          { titleKn: "ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಬಗ್ಗೋಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ", contentKn: rawParas[3].replace(/^.*?:/g, "").trim() }
        ];
        return {
          number,
          question,
          devoteeName,
          gothra,
          rulingPlanetKn: planet.nameKn,
          natureKn: planet.nature,
          varnaKn: planet.varna,
          rulingDirectionKn: planet.dir,
          auspiciousTimeframeKn: planet.timeframe,
          verdictBadgeKn,
          technicalParagraphs: enrichedParas,
          remedyListKn
        };
      }
    }
  } catch (err) {
    console.warn("[sankhyaShastraPriestEngine] AI prashna fallback used:", err);
  }

  return {
    number,
    question,
    devoteeName,
    gothra,
    rulingPlanetKn: planet.nameKn,
    natureKn: planet.nature,
    varnaKn: planet.varna,
    rulingDirectionKn: planet.dir,
    auspiciousTimeframeKn: planet.timeframe,
    verdictBadgeKn,
    technicalParagraphs: fallbackParagraphs,
    remedyListKn
  };
}

/**
 * Lucky Name Analysis & Recommendation Engine (Chaldean + Vedic Numerology)
 */
export async function generateSankhyaNameSuggestion(params: {
  inputName: string;
  birthDate: string;
  rashi?: string;
  nakshatra?: string;
}): Promise<SankhyaNameResult> {
  const { inputName, birthDate, rashi, nakshatra } = params;
  const { mulanka, bhagyanka } = calculateMulankaBhagyanka(birthDate);
  const { total: currentTotal, singleDigit: currentNameDigit } = calculateNameNumber(inputName);

  // Harmonious digits for mulanka & bhagyanka
  const favorableNumbers = [1, 3, 5, 6].filter((n) => n !== 4 && n !== 8);
  const unfavorableNumbers = [4, 8];

  const isHarmonious = currentNameDigit === mulanka || currentNameDigit === bhagyanka || favorableNumbers.includes(currentNameDigit);

  // Generate recommended spelling variations (e.g. adding 'A', 'E', 'H' to reach total 1, 5 or 6)
  const cleanName = inputName.trim();
  const recommendedSpellingsKn = [
    `${cleanName}A (ಸಂಖ್ಯೆ ೧ - ಸೂರ್ಯ ಬಲ)`,
    `${cleanName}E (ಸಂಖ್ಯೆ ೫ - ಬುಧ ಯೋಗ)`,
    `${cleanName}H (ಸಂಖ್ಯೆ ೬ - ಶುಕ್ರ ಸಂಪತ್ತು)`
  ];

  const luckyLettersKn = ["A, I, J, Y (ಸಂಖ್ಯೆ ೧)", "C, G, L, S (ಸಂಖ್ಯೆ ೩)", "E, H, N, X (ಸಂಖ್ಯೆ ೫)", "U, V, W (ಸಂಖ್ಯೆ ೬)"];

  const luckyGemsKn = mulanka === 1 ? "ಮಾಣಿಕ್ಯ (Ruby)" : mulanka === 5 ? "ಪಚ್ಚೆ (Emerald)" : "ವಜ್ರ / ಬಿಳಿ ನೀಲ (Diamond / White Sapphire)";
  const luckyDaysKn = "ಬುಧವಾರ ಮತ್ತು ಶುಕ್ರವಾರ";

  const harmonyVerdictKn = isHarmonious
    ? `✓ ಅತ್ಯುತ್ತಮ ಸಾಮರಸ್ಯ (ಭಾಗ್ಯಾಂಕ ${bhagyanka} ಮತ್ತು ನಾಮಾಂಕ ${currentNameDigit} ಪರಸ್ಪರ ಮಿತ್ರ ಸಂಖ್ಯೆಗಳು)`
    : `⚠️ ಮಧ್ಯಮ ಸಾಮರಸ್ಯ (ನಾಮಾಂಕ ${currentNameDigit} ನ್ನು ${favorableNumbers[0]} ಕ್ಕೆ ಪರಿಷ್ಕರಿಸುವುದು ಶ್ರೇಷ್ಠ)`;

  const technicalAnalysisKn = `ಶ್ರೀ ${inputName} ಅವರ ಜನ್ಮ ದಿನಾಂಕದ ಆಧಾರದ ಮೇಲೆ ಮೂಲಾಂಕವು ${mulanka} (ಆಳುವ ಗ್ರಹ) ಹಾಗೂ ಭಾಗ್ಯಾಂಕವು ${bhagyanka} ಆಗಿರುತ್ತದೆ. ಪ್ರಸ್ತುತ ಹೆಸರಿನ ಚಾಲ್ಡಿಯನ್ ಮೊತ್ತವು ${currentTotal} (ಏಕಾಂಕ ${currentNameDigit}) ಆಗಿದೆ. ${rashi ? `ರಾಶಿ: ${rashi}, ` : ""}${nakshatra ? `ನಕ್ಷತ್ರ: ${nakshatra}. ` : ""}ಈ ನಾಮಬಲವು ವೃತ್ತಿ ಪ್ರಗತಿ ಹಾಗೂ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿಗೆ ಪೂರಕವಾಗಿದೆ.`;

  return {
    inputName,
    birthDate,
    mulanka,
    bhagyanka,
    currentNameNumber: currentTotal,
    isHarmonious,
    harmonyVerdictKn,
    recommendedSpellingsKn,
    luckyLettersKn,
    auspiciousNumbers: favorableNumbers,
    unfavorableNumbers,
    luckyGemsKn,
    luckyDaysKn,
    technicalAnalysisKn
  };
}

/**
 * Lucky Mobile & Vehicle Number Suggestion Engine
 */
export async function generateSankhyaMobileVehicleSuggestion(params: {
  birthDate: string;
  targetType: "mobile" | "vehicle";
}): Promise<SankhyaMobileVehicleResult> {
  const { birthDate, targetType } = params;
  const { mulanka, bhagyanka } = calculateMulankaBhagyanka(birthDate);

  const auspiciousTotals = targetType === "mobile" ? [1, 5, 6, 9] : [1, 3, 5, 9];
  const unfavorableTotals = [4, 8];

  const recommendedCombinations = targetType === "mobile"
    ? [
        "ಅಂತಿಮ ಅಂಕಿಗಳು: 1111, 555, 6666 (ಒಟ್ಟು ಮೊತ್ತ ೧ ಅಥವಾ ೫)",
        "ವ್ಯಾಪಾರ ಮತ್ತು ವ್ಯವಹಾರಕ್ಕೆ: ಒಟ್ಟು ಮೊತ್ತ ೫ (ಬುಧ ಗ್ರಹ ಸಂಪರ್ಕ)",
        "ಅಧಿಕಾರ ಮತ್ತು ಪ್ರಸಿದ್ಧಿಗೆ: ಒಟ್ಟು ಮೊತ್ತ ೧ (ಸೂರ್ಯ ಬಲ)"
      ]
    : [
        "ವಾಹನ ನೋಂದಣಿ ಅಂತಿಮ ೪ ಅಂಕಿಗಳ ಮೊತ್ತ: ೧, ೩, ೫, ೯ (ಉದಾ: ೧೦೮೦, ೧೨೩೩, ೫೦೦೪)",
        "ಅಪಘಾತ ಮತ್ತು ರಿಪೇರಿ ರಕ್ಷಣೆಗೆ: ೪ ಮತ್ತು ೮ ಅಂಕಿಗಳ ಮೊತ್ತವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ",
        "ಕ್ಷೇಮ ಪ್ರಯಾಣಕ್ಕೆ: ಬಿಳಿ, ಬೆಳ್ಳಿ ಅಥವಾ ಗೋಲ್ಡನ್ ಬಣ್ಣದ ವಾಹನಗಳು ಪ್ರಶಸ್ತ"
      ];

  const reasonsKn = targetType === "mobile"
    ? `ಮೂಲಾಂಕ ${mulanka} ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${bhagyanka} ಹೊಂದಿರುವ ವ್ಯಕ್ತಿಗೆ ದೂರವಾಣಿ ಸಂಖ್ಯಾ ಮೊತ್ತ ೫ (ಬುಧ) ಮತ್ತು ೬ (ಶುಕ್ರ) ಸದಾ ಶುಭ ಸಂದೇಶ ಹಾಗೂ ಆರ್ಥಿಕ ಆಕರ್ಷಣೆಯನ್ನು ತರುತ್ತದೆ.`
    : `ವಾಹನ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಒಟ್ಟು ಮೊತ್ತವು ೧ ಅಥವಾ ೯ ಆಗಿರುವುದು ವಾಹನ ಸುರಕ್ಷತೆ, ಗೌರವ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ನೀಡುತ್ತದೆ. ೪ ಮತ್ತು ೮ ಅಂಕಿಗಳು ಶನಿ-ರಾಹು ಪ್ರಭಾವ ಹೊಂದಿರುವುದರಿಂದ ವಾಹನಕ್ಕೆ ಸೂಕ್ತವಲ್ಲ.`;

  const guidelinesKn = [
    `ಮೊತ್ತವನ್ನು ಲೆಕ್ಕ ಮಾಡುವಾಗ ಎಲ್ಲಾ ಅಂಕಿಗಳನ್ನು ಕೂಡಿ ಒಂದೇ ಅಂಕಿಗೆ ಇಳಿಸಿ (ಉದಾ: 9845... = ${auspiciousTotals[0]})`,
    `ದಿನನಿತ್ಯ ವಾಹನ ಚಾಲನೆಗೆ ಮುನ್ನ ಶ್ರೀ ಬಗ್ಗೋಣ ಮಹಾಗಣಪತಿ ಸ್ಮರಣೆ ಮಾಡಿ`,
    `ಮೊಬೈಲ್ ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಶುಭ ಯಂತ್ರ ಅಥವಾ ಓಂಕಾರ ಚಿತ್ರವಿಡುವುದು ಉತ್ತಮ`
  ];

  return {
    birthDate,
    targetType,
    mulanka,
    bhagyanka,
    auspiciousTotals,
    unfavorableTotals,
    recommendedCombinations,
    reasonsKn,
    guidelinesKn
  };
}
