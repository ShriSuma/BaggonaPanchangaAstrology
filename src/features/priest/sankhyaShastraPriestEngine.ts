import { askGemini } from "../../core/GeminiEngine";
import {
  buildCompleteVedicNumerologyProfile,
  type CompleteVedicNumerologyProfile
} from "../sankhyashastra/vedicNumerologyEngine";

export type MotionNature = "ಸ್ಥಿರ (ಶಾಶ್ವತ ನಿರ್ಧಾರ / ಧೃಢ)" | "ಚರ (ಶೀಘ್ರ ಗತಿ / ತಕ್ಷಣದ ಬದಲಾವಣೆ)" | "ಉಭಯ (ಮಿಶ್ರಿತ ಫಲ / ದ್ವಂದ್ವ)";

export type VargaVarna = 
  | "ಬ್ರಾಹ್ಮಣ ವರ್ಗ"
  | "ಕ್ಷತ್ರಿಯ ವರ್ಗ"
  | "ವೈಶ್ಯ ವರ್ಗ"
  | "ಶೂದ್ರ ವರ್ಗ";

export type VarnaInfluence = VargaVarna;

export interface SankhyaJanmaResult {
  profile: CompleteVedicNumerologyProfile;
  devoteeName: string;
  gothra: string;
  birthDateStr: string;
  targetDateStr: string;
  question: string;
  priestSummaryKn: string;
  priestVerdictBadgeKn: string;
  aiDeepReadingKn?: string;
}

export interface SankhyaPrashnaResult {
  number: number;
  question: string;
  devoteeName: string;
  gothra: string;
  rulingPlanetKn: string;
  natureKn: MotionNature;
  varnaKn: VargaVarna;
  varnaDescriptionKn: string;
  lostArticleOrPersonKn: string;
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

  // 1. Classical Vedic Astrological Planetary Varna / Varga (ಬ್ರಾಹ್ಮಣ, ಕ್ಷತ್ರಿಯ, ವೈಶ್ಯ, ಶೂದ್ರ)
  const planetList = [
    {
      nameKn: "ಸೂರ್ಯ",
      nature: "ಸ್ಥಿರ (ಶಾಶ್ವತ ನಿರ್ಧಾರ / ಧೃಢ)" as MotionNature,
      varna: "ಕ್ಷತ್ರಿಯ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಕ್ಷತ್ರಿಯ ವರ್ಗ (ಆಡಳಿತ, ರಕ್ಷಣಾ, ಸರಕಾರಿ & ಪ್ರಭಾವಿ ಅಧಿಕಾರಸ್ಥರು)",
      dir: "ಪೂರ್ವ",
      timeframe: "೧ ತಿಂಗಳು",
      lostArticleHint: "ವಸ್ತುವು ಪೂರ್ವ ದಿಕ್ಕಿನಲ್ಲಿ, ಎತ್ತರದ ಜಾಗ, ಸರಕಾರಿ/ಅಧಿಕಾರ ಕಚೇರಿ ಅಥವಾ ಪ್ರಭಾವಿ ಅಧಿಕಾರಸ್ಥ ವ್ಯಕ್ತಿಯ (ಕ್ಷತ್ರಿಯ ವರ್ಗ) ಸಂಪರ್ಕದಲ್ಲಿದೆ. ನೇರ ಪ್ರಭಾವ ಅಥವಾ ಅಧಿಕಾರ ಬಳಕೆಯಿಂದ ಪತ್ತೆಯಾಗುತ್ತದೆ."
    },
    {
      nameKn: "ಚಂದ್ರ",
      nature: "ಚರ (ಶೀಘ್ರ ಗತಿ / ತಕ್ಷಣದ ಬದಲಾವಣೆ)" as MotionNature,
      varna: "ವೈಶ್ಯ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ವೈಶ್ಯ ವರ್ಗ (ವ್ಯಾಪಾರಿಗಳು, ಸಂವಹನಕಾರರು, ಸ್ತ್ರೀಯರು & ಆಪ್ತರು)",
      dir: "ವಾಯವ್ಯ",
      timeframe: "೧೫ ದಿನಗಳು",
      lostArticleHint: "ವಸ್ತುವು ವಾಯವ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ, ಜಲಸ್ಥಳ, ಅಡುಗೆ ಕೋಣೆ ಅಥವಾ ಮಹಿಳೆಯರು/ಆಪ್ತರ (ವೈಶ್ಯ ವರ್ಗ) ಬಳಿ ಚಲನಶೀಲವಾಗಿದೆ. ಶೀಘ್ರವಾಗಿ ವಿಚಾರಿಸಿದರೆ ದೊರೆಯುತ್ತದೆ."
    },
    {
      nameKn: "ಕುಜ",
      nature: "ಚರ (ಶೀಘ್ರ ಗತಿ / ತಕ್ಷಣದ ಬದಲಾವಣೆ)" as MotionNature,
      varna: "ಕ್ಷತ್ರಿಯ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಕ್ಷತ್ರಿಯ ವರ್ಗ (ಸೈನಿಕರು, ಯೋಧರು, ರಕ್ಷಕರು & ತೀಕ್ಷ್ಣ ಸ್ವಭಾವದವರು)",
      dir: "ದಕ್ಷಿಣ",
      timeframe: "೨೮ ದಿನಗಳು",
      lostArticleHint: "ವಸ್ತುವು ದಕ್ಷಿಣ ದಿಕ್ಕಿನಲ್ಲಿ, ಅಗ್ನಿ/ವಿದ್ಯುತ್ ಉಪಕರಣಗಳ ಬಳಿ ಅಥವಾ ಯುವಕರು/ಧೈರ್ಯಶಾಲಿ ವ್ಯಕ್ತಿಯ (ಕ್ಷತ್ರಿಯ ವರ್ಗ) ವಶದಲ್ಲಿದೆ. ಕಳವು ಶಂಕೆ ಇದ್ದಲ್ಲಿ ಸೂಕ್ತ ವಿಚಾರಣೆ ಅಗತ್ಯ."
    },
    {
      nameKn: "ಬುಧ",
      nature: "ಉಭಯ (ಮಿಶ್ರಿತ ಫಲ / ದ್ವಂದ್ವ)" as MotionNature,
      varna: "ವೈಶ್ಯ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ವೈಶ್ಯ ವರ್ಗ (ವ್ಯಾಪಾರಿಗಳು, ಲೆಕ್ಕಿಗರು, ವಿದ್ಯಾರ್ಥಿಗಳು & ಸ್ನೇಹಿತರು)",
      dir: "ಉತ್ತರ",
      timeframe: "೨ ತಿಂಗಳು",
      lostArticleHint: "ವಸ್ತುವು ಉತ್ತರ ದಿಕ್ಕಿನಲ್ಲಿ, ಪುಸ್ತಕಗಳು, ಕಾಗದಪತ್ರಗಳು, ಹಣಕಾಸು ಜಾಗ ಅಥವಾ ಆಪ್ತ ಸ್ನೇಹಿತರು/ವ್ಯವಹಾರಸ್ಥರ (ವೈಶ್ಯ ವರ್ಗ) ಸಂಪರ್ಕದಲ್ಲಿದೆ. ವಿಚಾರಣೆಯಿಂದ ಸುಲಭವಾಗಿ ಲಭ್ಯವಾಗುತ್ತದೆ."
    },
    {
      nameKn: "ಗುರು",
      nature: "ಸ್ಥಿರ (ಶಾಶ್ವತ ನಿರ್ಧಾರ / ಧೃಢ)" as MotionNature,
      varna: "ಬ್ರಾಹ್ಮಣ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಬ್ರಾಹ್ಮಣ ವರ್ಗ (ಜ್ಞಾನಿಗಳು, ಪಂಡಿತರು, ಧಾರ್ಮಿಕರು & ಹಿರಿಯರು)",
      dir: "ಈಶಾನ್ಯ",
      timeframe: "೧ ವರ್ಷ",
      lostArticleHint: "ವಸ್ತುವು ಈಶಾನ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ, ದೇವರ ಕೋಣೆ, ಪೂಜಾ ಸ್ಥಳ ಅಥವಾ ಹಿರಿಯರು/ವಿದ್ವಾಂಸರ (ಬ್ರಾಹ್ಮಣ ವರ್ಗ) ಪಾಲನೆಯಲ್ಲಿ ಅತ್ಯಂತ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಯಾವುದೇ ಹಾನಿಯಾಗಿಲ್ಲ."
    },
    {
      nameKn: "ಶುಕ್ರ",
      nature: "ಉಭಯ (ಮಿಶ್ರಿತ ಫಲ / ದ್ವಂದ್ವ)" as MotionNature,
      varna: "ಬ್ರಾಹ್ಮಣ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಬ್ರಾಹ್ಮಣ ವರ್ಗ (ಕಲಾಕಾರರು, ಪೂಜ್ಯರು, ಸಜ್ಜನರು & ಸ್ತ್ರೀ ಶಕ್ತಿ)",
      dir: "ಆಗ್ನೇಯ",
      timeframe: "೨ ತಿಂಗಳು",
      lostArticleHint: "ವಸ್ತುವು ಆಗ್ನೇಯ ದಿಕ್ಕಿನಲ್ಲಿ, ಶಯನಗೃಹ, ಬಟ್ಟೆ-ಆಭರಣಗಳ ಪೆಟ್ಟಿಗೆ ಅಥವಾ ಸ್ತ್ರೀ ವ್ಯಕ್ತಿಯ (ಬ್ರಾಹ್ಮಣ/ಸಾತ್ವಿಕ ವರ್ಗ) ಸುಪರ್ದಿಯಲ್ಲಿದೆ. ರಹಸ್ಯವಾಗಿ ಸುರಕ್ಷಿತವಾಗಿದೆ."
    },
    {
      nameKn: "ಶನಿ",
      nature: "ಸ್ಥಿರ (ಶಾಶ್ವತ ನಿರ್ಧಾರ / ಧೃಢ)" as MotionNature,
      varna: "ಶೂದ್ರ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಶೂದ್ರ ವರ್ಗ (ಶ್ರಮಿಕರು, ಕಾಯಕಜೀವಿಗಳು, ಸೇವಕರು & ಕಾರ್ಮಿಕರು)",
      dir: "ಪಶ್ಚಿಮ",
      timeframe: "೨.೫ ವರ್ಷಗಳು",
      lostArticleHint: "ವಸ್ತುವು ಪಶ್ಚಿಮ ದಿಕ್ಕಿನಲ್ಲಿ, ಕತ್ತಲೆಯ ಮೂಲೆ, ಹಳೆಯ ಸಾಮಗ್ರಿಗಳ ನಡುವೆ ಅಥವಾ ಮನೆಯ ಸೇವಕರು/ಕಾಯಕವರ್ಗದವರ (ಶೂದ್ರ ವರ್ಗ) ಗಮನದಲ್ಲಿದೆ. ವಿಳಂಬವಾಗಿ ಪತ್ತೆಯಾಗಬಹುದು."
    },
    {
      nameKn: "ರಾಹು",
      nature: "ಚರ (ಶೀಘ್ರ ಗತಿ / ತಕ್ಷಣದ ಬದಲಾವಣೆ)" as MotionNature,
      varna: "ಶೂದ್ರ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಶೂದ್ರ ವರ್ಗ (ಅಪರಿಚಿತರು, ಹೊರಗಿನ ವ್ಯಕ್ತಿಗಳು & ಪರದೇಶದವರು)",
      dir: "ನೈಋತ್ಯ",
      timeframe: "೧೮ ತಿಂಗಳು",
      lostArticleHint: "ವಸ್ತುವು ನೈಋತ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ, ಮಣ್ಣಿನ/ಅಪರಿಚಿತ ಸ್ಥಳದಲ್ಲಿದೆ ಅಥವಾ ಹೊರಗಿನ ಅಪರಿಚಿತ ವ್ಯಕ್ತಿಯ (ಶೂದ್ರ/ಅಂತ್ಯಜ ವರ್ಗ) ಕೈವಶವಾಗಿರಬಹುದು. ಸೂಕ್ಷ್ಮ ಹುಡುಕಾಟ ಅಗತ್ಯ."
    },
    {
      nameKn: "ಕೇತು",
      nature: "ಉಭಯ (ಮಿಶ್ರಿತ ಫಲ / ದ್ವಂದ್ವ)" as MotionNature,
      varna: "ಶೂದ್ರ ವರ್ಗ" as VargaVarna,
      varnaDesc: "ಶೂದ್ರ ವರ್ಗ (ಗುಪ್ತ ವ್ಯಕ್ತಿಗಳು, ತಪಸ್ವಿಗಳು & ರಹಸ್ಯ ಶೋಧಕರು)",
      dir: "ಈಶಾನ್ಯ / ಅಧೋಮುಖ",
      timeframe: "೬ ತಿಂಗಳು",
      lostArticleHint: "ವಸ್ತುವು ಅಧೋಮುಖ ರಹಸ್ಯ ಜಾಗದಲ್ಲಿ ಅಥವಾ ಕಣ್ಣಿಗೆ ಕಾಣಿಸದ ಮೂಲೆಯಲ್ಲಿದೆ. ಅನಿರೀಕ್ಷಿತವಾಗಿ ಅಥವಾ ಆಕಸ್ಮಿಕವಾಗಿ ಪತ್ತೆಯಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ."
    }
  ];

  const planetIndex = (number - 1) % 9;
  const planet = planetList[planetIndex];

  const isFavorable = [1, 2, 4, 5, 6].includes(planetIndex + 1);
  const verdictBadgeKn = isFavorable ? "🟢 ಶೀಘ್ರ ಶುಭ ಫಲ / ಯಶಸ್ಸು" : "🟡 ವಿಳಂಬಿತ ಪರಿಹಾರ ಸಹಿತ ಜಯ";

  const fallbackParagraphs = [
    {
      titleKn: "೧. ನೇರ ವಾಸ್ತವಿಕ ನಿರ್ಣಯ & ಪರಿಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ",
      contentKn: `ನೀವು ಕೇಳಿರುವ ಪ್ರಶ್ನೆಗೆ ("${question}"), ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ನಿಮ್ಮ ಆಂತರಿಕ ಭಾವನೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ಸನ್ನಿವೇಶವು ನೇರ ಕಾರಣವಾಗಿದೆ. ಸಂಬಂಧಗಳಲ್ಲಿ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅಥವಾ ವಸ್ತು ಹುಡುಕಾಟದಲ್ಲಿ ಎದುರಾಗುತ್ತಿರುವ ಗೊಂದಲವು ಪರಸ್ಪರ ತಪ್ಪು ತಿಳುವಳಿಕೆ ಅಥವಾ ಗಮನದ ಕೊರತೆಯಿಂದ ಉಂಟಾಗಿರಬಹುದು. ಯಾರೂ ನಿಮ್ಮ ವಿರುದ್ಧ ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ತೊಂದರೆ ಕೊಡುತ್ತಿಲ್ಲವಾದರೂ ಸಂವಹನದ ಕೊರತೆಯಿಂದ ಈ ಸಮಸ್ಯೆ ದೊಡ್ಡದಾಗಿ ಕಾಣಿಸುತ್ತಿದೆ. ಆದುದರಿಂದ ಭಯಪಡದೆ ಶಾಂತಚಿತ್ತದಿಂದ ಪರಿಸ್ಥಿತಿಯನ್ನು ಅವಲೋಕಿಸುವುದು ಉತ್ತಮ.`
    },
    {
      titleKn: "೨. ಸಂಖ್ಯಾ ಗ್ರಹ ತರಂಗ & ಜನರ ಮನಸ್ಥಿತಿ / ವರ್ಗ ನಿರ್ಣಯ",
      contentKn: `ಆಯ್ಕೆಮಾಡಲಾದ ಸಂಖ್ಯೆ ${number} ರ ಅಧಿಪತಿಯಾದ ${planet.nameKn} ಪ್ರಭಾವದಿಂದಾಗಿ ಈ ಪ್ರಶ್ನೆಯು '${planet.nature}' ಸ್ವಭಾವವನ್ನು ಹೊಂದಿದೆ. ಇದು '${planet.varna}' (${planet.varnaDesc}) ಜನರೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿದ್ದು, ಅವರ ಮನಸ್ಥಿತಿ ಹಾಗೂ ವರ್ತನೆಗಳು ಈ ಫಲಿತಾಂಶಕ್ಕೆ ಕಾರಣವಾಗಿವೆ. ವಸ್ತು ಕಳೆದುಹೋಗಿರುವುದು, ಯಾರಾದರೂ ತೆಗೆದುಕೊಂಡಿರುವುದು ಅಥವಾ ಹುಡುಕಾಟದ ಪ್ರಶ್ನೆಯಾಗಿದ್ದರೆ: ${planet.lostArticleHint}`
    },
    {
      titleKn: "೩. ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರ & ಸಂವಹನ ಮಾರ್ಗ",
      contentKn: `ಈ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಲು ನೇರ ಹಾಗೂ ಮುಕ್ತವಾದ ಮಾತುಕತೆ ಅತ್ಯಗತ್ಯ. ಸಂಬಂಧಪಟ್ಟವರ ಎದುರಿಗೆ ಸಮಾಧಾನವಾಗಿ ಕೂತು ನಿಮ್ಮ ಮನಸ್ಸಿನ ವಿಚಾರವನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುವುದರಿಂದ ತಪ್ಪುಕಲ್ಪನೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ. ${planet.dir} ದಿಕ್ಕಿನಲ್ಲಿ ಅಥವಾ ಶಾಂತ ವಾತಾವರಣದಲ್ಲಿ ಸಂವಾದ ನಡೆಸುವುದು ಸೂಕ್ತ. ಯಾವುದೇ ವಾಗ್ವಾದಗಳಿಗೆ ಅವಕಾಶ ನೀಡದೆ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸಿ.`
    },
    {
      titleKn: "೪. ಬಗ್ಗೋಣ ದೈವಿಕ ಪರಿಹಾರ & ಶುಭ ಕಾಲಾವಧಿ",
      contentKn: `ಈ ಕಾರ್ಯ ಅಥವಾ ಹುಡುಕಾಟದ ಶುಭ ಫಲಿತಾಂಶವು ಅಂದಾಜು ${planet.timeframe} ಅವಧಿಯಲ್ಲಿ ಸ್ಪಷ್ಟಗೊಳ್ಳಲಿದೆ. ಎಲ್ಲಾ ವಿಘ್ನಗಳ ನಿವಾರಣೆಗಾಗಿ ಶ್ರೀ ${devoteeName} (${gothra} ಗೋತ್ರ) ಅವರ ಹೆಸರಿನಲ್ಲಿ ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಸಲ್ಲಿಸಿ ಹಾಗೂ ${planet.nameKn} ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.`
    }
  ];

  const remedyListKn = [
    `ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ನಮಸ್ಕಾರ`,
    `${planet.nameKn} ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪ (ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ)`,
    `${planet.dir} ದಿಕ್ಕಿಗೆ ಮುಖಮಾಡಿ ಶಾಂತಚಿತ್ತ ಪ್ರಾರ್ಥನೆ`
  ];

  // Try Gemini AI for enhanced narrative in pure Kannada
  try {
    const aiPrompt = `ನೀವು ವೈದಿಕ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ತಜ್ಞರು.
ಭಕ್ತರ ವಿವರ:
ಹೆಸರು: ${devoteeName} | ಗೋತ್ರ: ${gothra} | ಸಂಖ್ಯೆ: ${number}
ಪ್ರಶ್ನೆ: "${question}"
ಸಂಖ್ಯಾಧಿಪತಿ: ${planet.nameKn} (${planet.nature}, ${planet.varna}, ${planet.varnaDesc}, ${planet.dir})
ವಸ್ತು/ವ್ಯಕ್ತಿ ನಿರ್ಣಯ ಸೂತ್ರ: ${planet.lostArticleHint}

ಅತ್ಯಂತ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮಗಳು:
೧. ಯಾವುದೇ ರೀತಿಯ ನಮಸ್ಕಾರ, ಪೀಠಿಕೆ, ಸ್ವ-ಪರಿಚಯ ಅಥವಾ ಶುಭಾಶಯಗಳನ್ನು (ಉದಾ: 'ನಮಸ್ಕಾರ', 'ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಡಿತ್', 'ನಾನು ಜ್ಯೋತಿಷಿ') ಬರೆಯಬೇಡಿ!
೨. ನೇರವಾಗಿ ಭಕ್ತರ ಪ್ರಶ್ನೆಗೆ ("${question}") ಸಂಬಂಧಿಸಿದ ನೈಜ ಕಾರಣ ಹಾಗೂ ಸತ್ಯಾಂಶವನ್ನು ಮೊದಲ ವಾಕ್ಯದಲ್ಲೇ ಹೇಳಿ.
   - ಪ್ರಶ್ನೆಯು ಸಂಬಂಧಗಳ ಬಗ್ಗೆ ಇದ್ದರೆ (ಅಕ್ಕ/ಭಾವ/ಗಂಡ/ಹೆಂಡತಿ ಇತ್ಯಾದಿ): ಅವರ ವರ್ತನೆಯ ನೈಜ ಕಾರಣ ಹಾಗೂ ಮನಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ.
   - ಪ್ರಶ್ನೆಯು ವಸ್ತು ಕಳೆದುಹೋಗಿರುವುದು, ಕಳವು, ಯಾರಾದರೂ ತೆಗೆದುಕೊಂಡಿರುವುದು ಅಥವಾ ಹುಡುಕಾಟದ ಬಗ್ಗೆ ಇದ್ದರೆ (Lost / Found / Stolen Article): ನಿರ್ದಿಷ್ಟವಾಗಿ ವರ್ಗ (${planet.varna}), ಯಾರು ಇಟ್ಟುಕೊಂಡಿದ್ದಾರೆ/ತೆಗೆದುಕೊಂಡಿದ್ದಾರೆ, ಯಾವ ದಿಕ್ಕು (${planet.dir}) ಮತ್ತು ಯಾವ ಸ್ಥಳದಲ್ಲಿದೆ ಎಂಬುದನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಬರೆಯಿರಿ (${planet.lostArticleHint}).
೩. ಉತ್ತರವನ್ನು ನಿಖರವಾಗಿ ೪ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳಲ್ಲಿ ಮಾತ್ರ ನೀಡಿ. ಪ್ರತಿ ಪ್ಯಾರಾಗ್ರಾಫ್ ೫-೬ ಸಾಲುಗಳನ್ನು ಹೊಂದಿರಲಿ ಮತ್ತು ಸಂಪೂರ್ಣ ವಿಷಯಾಧಾರಿತವಾಗಿರಲಿ:
   - ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ನೇರ ಉತ್ತರ & ಸಮಸ್ಯೆ/ಪರಿಸ್ಥಿತಿಯ ನೈಜ ಕಾರಣ (ಭಕ್ತರ ಪ್ರಶ್ನೆಗೆ ತಕ್ಷಣದ ಸ್ಪಷ್ಟ ಉತ್ತರ)
   - ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಸಂಖ್ಯಾ ಗ್ರಹ ತರಂಗ ಹಾಗೂ ವರ್ಗ ನಿರ್ಣಯ (${planet.varna} - ${planet.varnaDesc}) ಮತ್ತು ಜನರ ಮನಸ್ಥಿತಿ / ವಸ್ತು ಇರುವ ಸ್ಥಳ
   - ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಪ್ರಾಯೋಗಿಕ ಸಂವಹನ ಅಥವಾ ಹುಡುಕಾಟದ ಪರಿಹಾರ (ಮುಕ್ತ ಸಂವಾದ, ಹುಡುಕುವ ವಿಧಾನ)
   - ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಬಗ್ಗೋಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ, ಜಪ ಹಾಗೂ ಅನುಕೂಲಕರ ಕಾಲಾವಧಿ (${planet.timeframe})

ಶುದ್ಧ ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಮಾತ್ರ ಬರೆಯಿರಿ.`;

    const aiRes = await askGemini(question, aiPrompt, "", "kn", { raw: true, temperature: 0.2 });
    if (aiRes && /[\u0C80-\u0CFF]/.test(aiRes) && aiRes.length > 100) {
      const rawParas = aiRes.split(/\n\n+/).filter((p) => p.trim().length > 20);
      if (rawParas.length >= 4) {
        const enrichedParas = [
          { titleKn: "೧. ನೇರ ವಾಸ್ತವಿಕ ನಿರ್ಣಯ & ಪರಿಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ", contentKn: rawParas[0].replace(/^.*?:/g, "").trim() },
          { titleKn: "೨. ಸಂಖ್ಯಾ ಗ್ರಹ ತರಂಗ & ಜನರ ಮನಸ್ಥಿತಿ / ವರ್ಗ ನಿರ್ಣಯ", contentKn: rawParas[1].replace(/^.*?:/g, "").trim() },
          { titleKn: "೩. ಪ್ರಾಯೋಗಿಕ ಪರಿಹಾರ & ಸಂವಹನ ಮಾರ್ಗ", contentKn: rawParas[2].replace(/^.*?:/g, "").trim() },
          { titleKn: "೪. ಬಗ್ಗೋಣ ದೈವಿಕ ಪರಿಹಾರ & ಶುಭ ಕಾಲಾವಧಿ", contentKn: rawParas[3].replace(/^.*?:/g, "").trim() }
        ];
        return {
          number,
          question,
          devoteeName,
          gothra,
          rulingPlanetKn: planet.nameKn,
          natureKn: planet.nature,
          varnaKn: planet.varna,
          varnaDescriptionKn: planet.varnaDesc,
          lostArticleOrPersonKn: planet.lostArticleHint,
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
    varnaDescriptionKn: planet.varnaDesc,
    lostArticleOrPersonKn: planet.lostArticleHint,
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

  const luckyGemsKn = mulanka === 1 ? "ಮಾಣಿಕ್ಯ ರತ್ನ" : mulanka === 5 ? "ಪಚ್ಚೆ ರತ್ನ" : "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ನೀಲ ರತ್ನ";
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

/**
 * Full Birth Date & Name Vedic Grid & Dasha Reading Engine for Priest Portal (500 Coins / ₹50)
 */
export async function generateSankhyaJanmaReading(params: {
  devoteeName: string;
  gothra?: string;
  birthDateStr: string; // YYYY-MM-DD
  targetDateStr?: string; // YYYY-MM-DD
  question?: string;
  apiKey?: string;
}): Promise<SankhyaJanmaResult> {
  const { devoteeName, gothra = "ಶ್ರೀ ವತ್ಸ", birthDateStr, targetDateStr, question = "", apiKey = "" } = params;

  const parts = (birthDateStr || "1994-08-14").split("-");
  const year = parseInt(parts[0], 10) || 1994;
  const month = parseInt(parts[1], 10) || 8;
  const day = parseInt(parts[2], 10) || 14;

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

  // Compute 100% Deterministic Vedic Profile
  const profile = buildCompleteVedicNumerologyProfile(devoteeName, day, month, year, targetDate);

  const priestVerdictBadgeKn = profile.nestedDasha.multiplicityStatus.isOverload
    ? "⚠️ ದಶಾ ಸಾಂದ್ರತೆಯ ಎಚ್ಚರಿಕೆ (ಪರಿಹಾರ ಅಗತ್ಯ)"
    : profile.nestedDasha.multiplicityStatus.isSmoothPhase
    ? "🟢 ಶುಭ ಸುಲಭ ಕಾಲ (ಅತ್ಯುನ್ನತ ಅಭಿವೃದ್ಧಿ)"
    : "🟡 ಸಾಧಾರಣ ಸಮತೋಲನ ಕಾಲ";

  const priestSummaryKn = `ಶ್ರೀ ${devoteeName} ಅವರ ಮೂಲಾಂಕ ${profile.moolankInfo.moolank} (${profile.moolankInfo.rulingGraha.name.kn}), ಭಾಗ್ಯಾಂಕ ${profile.bhagyankInfo.bhagyank} (${profile.bhagyankInfo.rulingGraha.name.kn}) ಹಾಗೂ ಚಾಲ್ಡಿಯನ್ ನಾಮಾಂಕ ${profile.nameInfo.namank} (${profile.nameInfo.rulingGraha.name.kn}) ಆಗಿದೆ. ವೇದಿಕ ಗ್ರಿಡ್‌ನಲ್ಲಿ ${profile.yogasResult.activeYogas.length} ಯೋಗಗಳು ಸಕ್ರಿಯವಾಗಿವೆ. ಪ್ರಸ್ತುತ ${profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} ಮಹಾದಶೆ (${profile.nestedDasha.activeMahadasha.grahaNumber}) ಹಾಗೂ ${profile.nestedDasha.activeAntardasha.grahaMeta.name.kn} ಅಂತರ್ದಶೆ (${profile.nestedDasha.activeAntardasha.grahaNumber}) ನಡೆಯುತ್ತಿದ್ದು, ${profile.nestedDasha.multiplicityStatus.explanationKn}`;

  let aiDeepReadingKn = "";
  const activeKey = (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  if (activeKey) {
    try {
      const prompt = `ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗುರುವಾಗಿ ಸಂಕ್ಷಿಪ್ತ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ ನೀಡಿ:
ಭಕ್ತರು: ${devoteeName} (${gothra} ಗೋತ್ರ)
ಜನ್ಮ ದಿನಾಂಕ: ${day}-${month}-${year}
ಮೂಲಾಂಕ: ${profile.moolankInfo.moolank}, ಭಾಗ್ಯಾಂಕ: ${profile.bhagyankInfo.bhagyank}, ನಾಮಾಂಕ: ${profile.nameInfo.namank}
ಸಕ್ರಿಯ ಯೋಗಗಳು: ${profile.yogasResult.activeYogas.map((y) => y.name.kn).join(", ")}
ದಶೆ: ${profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} ಮಹಾದಶೆ, ${profile.nestedDasha.activeAntardasha.grahaMeta.name.kn} ಅಂತರ್ದಶೆ.
ಪ್ರಶ್ನೆ: ${question || "ವೃತ್ತಿ, ಆರ್ಥಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಪ್ರಗತಿ"}

೪ ಪ್ಯಾರಾಗಳಲ್ಲಿ ನಿಖರ ಶಾಸ್ತ್ರ ಫಲ ನೀಡಿ:
೧. ಗ್ರಹ ಸಂಖ್ಯಾ ಬಲ
೨. ವೇದಿಕ ಯೋಗಗಳ ಫಲ
೩. ದಶಾ ಫಲ
೪. ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಪರಿಹಾರ ಮತ್ತು ಆಶೀರ್ವಾದ`;

      aiDeepReadingKn = await askGemini(
        `Priest Vedic Numerology for ${devoteeName}`,
        prompt,
        activeKey,
        "kn",
        { raw: true, temperature: 0.2 }
      );
    } catch {
      aiDeepReadingKn = priestSummaryKn;
    }
  }

  return {
    profile,
    devoteeName,
    gothra,
    birthDateStr,
    targetDateStr: targetDate.toISOString().split("T")[0],
    question,
    priestSummaryKn,
    priestVerdictBadgeKn,
    aiDeepReadingKn: aiDeepReadingKn || priestSummaryKn
  };
}
