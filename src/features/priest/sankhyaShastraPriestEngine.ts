import { askGemini } from "../../core/GeminiEngine";
import {
  buildCompleteVedicNumerologyProfile,
  type CompleteVedicNumerologyProfile
} from "../sankhyashastra/vedicNumerologyEngine";
import { extractDetailedQuestionContext } from "../sankhyashastra/sankhyaShastraEngine";

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

  const ctx = extractDetailedQuestionContext(question);
  const amountStrKn = ctx.extractedAmount ? ctx.extractedAmount.kn : "";
  const personKn = ctx.targetPerson?.kn || "ಸಂಬಂಧಪಟ್ಟ ವ್ಯಕ್ತಿ";

  let sec1Content = "";
  let sec2Content = "";
  let sec3Content = "";
  let sec4Content = "";

  if (ctx.subIntent === "money_lent_recovery") {
    if (isFavorable) {
      sec1Content = `ಹೌದು, ನೀವು ನೀಡಿದ ${amountStrKn || "ಹಣ"}ವು ನಿಶ್ಚಿತವಾಗಿ ವಾಪಸ್ ಸಿಗಲಿದೆ. ಆ ${personKn} ಹಣವನ್ನು ಹಿಂದಿರುಗಿಸಲು ಸಕಾರಾತ್ಮಕ ಪ್ರಯತ್ನ ಮಾಡುತ್ತಿದ್ದು, ಸಣ್ಣ ಕಾಲಾವಕಾಶದ ನಂತರ ಪೂರ್ಣ ಹಣ ನಿಮ್ಮ ಕೈಸೇರಲಿದೆ.`;
    } else {
      sec1Content = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ನೀವು ನೀಡಿದ ${amountStrKn || "ಹಣ"}ವು ತಕ್ಷಣ ವಾಪಸ್ ಸಿಗುವುದಿಲ್ಲ. ಆ ${personKn} ನಿಮ್ಮ ಹಣವನ್ನು ಬೇರೊಂದು ಕಡೆ (ಮತ್ತೊಂದು ಹೂಡಿಕೆ ಅಥವಾ ವ್ಯವಹಾರದಲ್ಲಿ) ತೊಡಗಿಸಿದ್ದು, ಪ್ರಸ್ತುತ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಅಥವಾ ನಗದು ಮುಗ್ಗಟ್ಟನ್ನು ಎದುರಿಸುತ್ತಿದ್ದಾರೆ. ಹಣ ಖಂಡಿತವಾಗಿ ವಾಪಸ್ ಸಿಗಲಿದೆ, ಆದರೆ ನಿರೀಕ್ಷಿತ ಸಮಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲಾವಕಾಶ ತೆಗೆದುಕೊಳ್ಳಲಿದೆ.`;
    }
    sec2Content = `ಇದಕ್ಕೆ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ: ಪ್ರಸ್ತುತ ಪ್ರಶ್ನಾ ಲಗ್ನದಲ್ಲಿ ಸಾಲ ಮತ್ತು ನಿರ್ಬಂಧಿತ ದ್ರವ್ಯವನ್ನು ಸೂಚಿಸುವ ೬ನೇ ಮತ್ತು ೮ನೇ ಸ್ಥಾನಗಳ ಪ್ರಭಾವವಿದೆ. ವಾಸ್ತವಿಕವಾಗಿ ಆ ${personKn} ಹಣವನ್ನು ದುರುದ್ದೇಶದಿಂದ ಮುಚ್ಚಿಡುತ್ತಿಲ್ಲ; ಅವರ ಇತರ ಹಣಕಾಸು ವ್ಯವಹಾರಗಳು ಸ್ಥಗಿತಗೊಂಡಿರುವುದರಿಂದ ತಕ್ಷಣ ನೀಡಲು ನಗದು ಲಭ್ಯವಿಲ್ಲ. ಆದರೆ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ಶುಭ ಗ್ರಹಗಳ ರಕ್ಷಣೆಯಿಂದ ಅಸಲು ಮೊತ್ತವು ಸುರಕ್ಷಿತವಾಗಿದೆ.`;
    sec3Content = `ಈ ಹಣಕಾಸಿನ ಸ್ಥಿತಿ ಸುಧಾರಿಸಲು ಅಂದಾಜು ${planet.timeframe} ಕಾಲಾವಕಾಶ ಬೇಕಾಗಬಹುದು. ಗೋಚಾರ ಗ್ರಹಗಳು ಬದಲಾದಾಗ, ಅವರ ವ್ಯಾಪಾರ ಅಥವಾ ಹೂಡಿಕೆಯಿಂದ ಹಣ ಹರಿದುಬರಲು ಆರಂಭವಾಗಲಿದ್ದು, ಹಂತ-ಹಂತವಾಗಿ ಕಂತುಗಳಲ್ಲಿ (tranches) ಹಣ ವಾಪಸ್ ಪಡೆಯಲು ಕಾಲ ಕೂಡಿಬರಲಿದೆ.`;
    sec4Content = `ದೈವಿಕ ಪರಿಹಾರ: ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಅಷ್ಟೋತ್ತರ ಶತ (೧೦೮) ಗರಿಕಾರ್ಚನೆ ಸಲ್ಲಿಸಿ ಹಾಗೂ 'ಋಣವಿಮೋಚಕ ನೃಸಿಂಹ ಸ್ತೋತ್ರ' ಪಠಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಅವರ ಮೇಲೆ ಸಿಟ್ಟಾಗದೆ ಅಥವಾ ಆಕ್ರಮಣಕಾರಿ ಸಂಘರ್ಷಕ್ಕೆ ಇಳಿಯದೆ, ಸೌಮ್ಯವಾಗಿ ಮುಖಾಮುಖಿ ಭೇಟಿಯಾಗಿ ಅವರ ಸದ್ಯದ ವ್ಯವಹಾರಿಕ ಸ್ಥಿತಿಯನ್ನು ನೇರವಾಗಿ ತಿಳಿದುಕೊಳ್ಳಿ. ಹಣವನ್ನು ಒಟ್ಟಿಗೆ ನೀಡಲು ಒತ್ತಾಯಿಸುವ ಬದಲು, ಹಂತ-ಹಂತದ ಕಂತುಗಳಲ್ಲಿ ಮರುಪಾವತಿಸಲು ಕಾಲಾವಧಿ ನಿಗದಿಪಡಿಸಿ ಲಿಖಿತ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳಿ.`;
  } else if (ctx.subIntent === "job_promotion" || ctx.subIntent === "job_interview_new") {
    if (isFavorable) {
      sec1Content = `ಹೌದು, ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಪ್ರಗತಿ ಹಾಗೂ ಅಧಿಕಾರ ವಿಸ್ತರಣೆಯ ಯೋಗ ದೃಢವಾಗಿದೆ. ಆಡಳಿತ ಮಂಡಳಿಯಲ್ಲಿ ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ಮನ್ನಣೆ ಸಿಗಲಿದೆ.`;
    } else {
      sec1Content = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಬಡ್ತಿಯು ತಕ್ಷಣ ಕೈಗೂಡುವುದಿಲ್ಲ. ಸಂಸ್ಥೆಯ ಆಂತರಿಕ ಆಡಳಿತ ಪ್ರಕ್ರಿಯೆ ಹಾಗೂ ಇಲಾಖಾ ಮರುಹೊಂದಾಣಿಕೆಯ ವಿಳಂಬದಿಂದಾಗಿ ನಿರೀಕ್ಷೆಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ಹಿಡಿಯಲಿದೆ.`;
    }
    sec2Content = `ಇದಕ್ಕೆ ಕಾರಣ: ೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಗ್ರಹಗಳ ಮಂದಗತಿಯ ಸಂಚಾರವಿದ್ದು, ಆಡಳಿತಾತ್ಮಕ ಅನುಮೋದನೆಗಳು ನಿಧಾನಗತಿಯಲ್ಲಿ ಸಾಗುತ್ತಿವೆ. ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಯಲ್ಲಿ ಕೊರತೆಯಿಲ್ಲದಿದ್ದರೂ, ಮೇಲಧಿಕಾರಿಗಳ ಹಂತದಲ್ಲಿ ಆಂತರಿಕ ವಿಮರ್ಶೆ ನಡೆಯುತ್ತಿದೆ.`;
    sec3Content = `ಈ ಉದ್ಯೋಗ ಫಲ ಸಿದ್ಧಿಯು ಅಂದಾಜು ${planet.timeframe} ಅವಧಿಯಲ್ಲಿ ಸ್ಪಷ್ಟ ರೂಪ ಪಡೆಯಲಿದೆ.`;
    sec4Content = `ದೈವಿಕ ಪರಿಹಾರ: ಆದಿತ್ಯ ಹ್ರದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಶಾಂತರಾಗಿ ಮುಖಾಮುಖಿ ವೃತ್ತಿಪರ ಸಮಾಲೋಚನೆ (1-on-1 meeting) ನಡೆಸಿ, ನಿಮ್ಮ ಸಾಧನೆಗಳ ದಾಖಲೆಯನ್ನು ಸೌಮ್ಯವಾಗಿ ಮುಂದಿಟ್ಟು ಅಧಿಕೃತ ಮೌಲ್ಯಮಾಪನ ಕೋರಿ.`;
  } else if (ctx.subIntent === "lost_item_theft") {
    if (isFavorable) {
      sec1Content = `ಹೌದು, ನಿಮ್ಮ ${amountStrKn || "ಕಳೆದುಹೋದ ವಸ್ತು"}ವು ನಿಶ್ಚಿತವಾಗಿ ಪತ್ತೆಯಾಗಲಿದೆ. ವಸ್ತುವು ನಾಶವಾಗಿಲ್ಲ; ಸುರಕ್ಷಿತವಾಗಿದೆ.`;
    } else {
      sec1Content = `ಸದ್ಯಕ್ಕೆ ${amountStrKn || "ವಸ್ತು"}ವು ಸುಲಭವಾಗಿ ಕಣ್ಣಿಗೆ ಬೀಳುತ್ತಿಲ್ಲ. ಇದು ಕಳುವಾಗಿರುವ ಬದಲು ಮರೆತು ಇರಿಸಲ್ಪಟ್ಟ ಅಥವಾ ಮುಚ್ಚಿಹೋದ ಸಾಧ್ಯತೆಯೇ ಅಧಿಕವಾಗಿದೆ.`;
    }
    sec2Content = `ಸ್ಥಳ ಮತ್ತು ದಿಕ್ಕು: ${planet.lostArticleHint} ${planet.dir} ದಿಕ್ಕಿನಲ್ಲಿ ವಿಷಯವು ಸ್ಪಷ್ಟವಾಗಿದೆ.`;
    sec3Content = `ವಸ್ತು ಲಭ್ಯತೆಯ ಕಾಲಾವಧಿ: ಅಂದಾಜು ${planet.timeframe}.`;
    sec4Content = `ದೈವಿಕ ಪರಿಹಾರ: ಶ್ರೀ ಸಂಕಷ್ಟಹರ ಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಸಲ್ಲಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಆತಂಕಪಡದೆ ಸೂಚಿತ ${planet.dir} ದಿಕ್ಕಿನಲ್ಲಿರುವ ಕಪಾಟು, ಬ್ಯಾಗ್, ವಾಹನ ಅಥವಾ ಪೀಠೋಪಕರಣಗಳ ಕೆಳಭಾಗವನ್ನು ಸಮಾಧಾನಚಿತ್ತದಿಂದ ಶೋಧಿಸಿ.`;
  } else {
    // General
    if (isFavorable) {
      sec1Content = `ಹೌದು, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ (${question}) ಶಾಸ್ತ್ರೀಯವಾಗಿ ಸಕಾರಾತ್ಮಕ ಉತ್ತರ ಲಭಿಸಿದ್ದು, ಈ ಕಾರ್ಯವು ನಿಶ್ಚಿತವಾಗಿ ಸಿದ್ಧಿಯಾಗಲಿದೆ.`;
    } else {
      sec1Content = `ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಈ ಕಾರ್ಯವು ತಕ್ಷಣ ಸಿದ್ಧಿಯಾಗುವುದಿಲ್ಲ; ಕಾಲಾವಕಾಶ ಹಾಗೂ ತಾಳ್ಮೆಯ ಅಗತ್ಯವಿದ್ದು, ಸದ್ಯದ ಅಡೆತಡೆಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿವೆ.`;
    }
    sec2Content = `ಇದಕ್ಕೆ ಕಾರಣ: ಸಂಖ್ಯಾ ಕುಂಡಲಿಯಲ್ಲಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಹಂತ-ಹಂತದ ಬೆಳವಣಿಗೆಯನ್ನು ಸೂಚಿಸುತ್ತಿದ್ದು, ಆತುರದ ಹೆಜ್ಜೆಯು ಹಿನ್ನಡೆ ತರಬಹುದು.`;
    sec3Content = `ಕಾರ್ಯ ಸಿದ್ಧಿಯ ಕಾಲಾವಧಿ: ಅಂದಾಜು ${planet.timeframe}.`;
    sec4Content = `ದೈವಿಕ ಪರಿಹಾರ: ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಗರಿಕಾರ್ಚನೆ ಸಲ್ಲಿಸಿ ಹಾಗೂ ${planet.nameKn} ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.
ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮ: ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಅಪ್ರಮಾಣಿಕ ಮಾತುಗಳಿಗೆ ಕಿವಿಗೊಡದೆ, ಸಂಬಂಧಪಟ್ಟವರೊಂದಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ ನಡೆಸಿ ಮುನ್ನಡೆಯಿರಿ.`;
  }

  const fallbackParagraphs = [
    {
      titleKn: "೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ",
      contentKn: sec1Content
    },
    {
      titleKn: "೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ",
      contentKn: sec2Content
    },
    {
      titleKn: "೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ",
      contentKn: sec3Content
    },
    {
      titleKn: "೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು",
      contentKn: sec4Content
    }
  ];

  const remedyListKn = [
    `ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಅಷ್ಟೋತ್ತರ ಶತ (೧೦೮) ಗರಿಕಾರ್ಚನೆ ಹಾಗೂ ಸಂಕಲ್ಪ ಪೂಜೆ`,
    `${planet.nameKn} ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪ (ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ ಭಕ್ತಿಯಿಂದ)`,
    `${planet.dir} ದಿಕ್ಕಿಗೆ ಮುಖಮಾಡಿ ಶಾಂತಚಿತ್ತ ಧ್ಯಾನ ಹಾಗೂ ದೀಪಾರಾಧನೆ`,
    `ಕುಟುಂಬ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸ್ಮರಣೆ`
  ];

  // Try Gemini AI for enhanced narrative in pure Kannada
  try {
    const aiPrompt = `ನೀವು ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ವಿದ್ವತ್ಪೂರ್ಣ ಪ್ರಧಾನ ಅರ್ಚಕರು (ಶ್ರೀರಾಮ್ ಪಂಡಿತ್).
ಭಕ್ತರ ವಿವರ:
ಹೆಸರು: ಶ್ರೀ/ಶ್ರೀಮತಿ ${devoteeName} | ಗೋತ್ರ: ${gothra} | ಆಯ್ದ ಸಂಖ್ಯೆ: ${number}
ಪ್ರಶ್ನೆ: "${question}"
ಸಂಖ್ಯಾಧಿಪತಿ: ${planet.nameKn} (${planet.nature}, ${planet.varna}, ${planet.varnaDesc}, ದಿಕ್ಕು: ${planet.dir})
ವಸ್ತು/ವ್ಯಕ್ತಿ ನಿರ್ಣಯ ಸೂತ್ರ: ${planet.lostArticleHint}
ಕಾಲಾವಧಿ: ${planet.timeframe}

ಅತ್ಯಂತ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮಗಳು:
೧. ಯಾವುದೇ ಮೇಲ್ನೋಟದ ನಮಸ್ಕಾರ, ಪೀಠಿಕೆ, ಸ್ವ-ಪರಿಚಯ ಅಥವಾ ಶುಭಾಶಯಗಳನ್ನು (ಉದಾ: 'ನಮಸ್ಕಾರ', 'ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಡಿತ್', 'ನಾನು ಜ್ಯೋತಿಷಿ', 'ನೋಡಿ ಭಕ್ತರೇ ಕುಂಡಲಿ ನೋಡುತ್ತಿದ್ದೇನೆ') ಪ್ರಾರಂಭದಲ್ಲಿ ಬರೆಯಬೇಡಿ!
೨. ನೇರವಾಗಿ ವಿಷಯಕ್ಕೆ ಬನ್ನಿ: ಮೊದಲ ವಾಕ್ಯದಲ್ಲೇ ಪ್ರಶ್ನೆಗೆ ("${question}") ನೇರ ಉತ್ತರ / ನಿರ್ಣಯವನ್ನು (ಹೌದು/ಇಲ್ಲ/ವಿಳಂಬ) ನೀಡಿ. ಉದಾಹರಣೆಗೆ, ಸ್ನೇಹಿತನಿಗೆ ಹಣ ನೀಡಿದ್ದರ ಬಗ್ಗೆ ಕೇಳಿದ್ದರೆ: "ಇಲ್ಲ, ಸದ್ಯಕ್ಕೆ ಹಣ ತಕ್ಷಣ ವಾಪಸ್ ಬರುವುದಿಲ್ಲ. ಆ ಸ್ನೇಹಿತನು ನಿಮ್ಮ ಹಣವನ್ನು ಬೇರೊಂದು ಕಡೆ ತೊಡಗಿಸಿದ್ದು..." ಎಂದು ನೇರ ಉತ್ತರದಿಂದಲೇ ಆರಂಭಿಸಿ.
೩. ಉತ್ತರವನ್ನು ನಿಖರವಾಗಿ ೪ (ನಾಲ್ಕು) ವಿಭಾಗಗಳಲ್ಲಿ ನೀಡಿ:
   - ೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ (ಪ್ರಶ್ನೆಗೆ ನೇರ ತೀರ್ಪು ಮತ್ತು ಎದುರಿನ ವ್ಯಕ್ತಿ/ವಿಷಯದ ನೈಜ ಸ್ಥಿತಿ)
   - ೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ (ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಮತ್ತು ವಾಸ್ತವಿಕ ಕಾರಣಗಳು)
   - ೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ (${planet.timeframe} ಕಾಲಾವಧಿ ಮತ್ತು ಬದಲಾವಣೆ)
   - ೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು (ಮಂತ್ರ/ಪೂಜೆ ಜತೆಗೆ, "ಅವರೊಂದಿಗೆ ಶಾಂತರಾಗಿ ಮುಖಾಮುಖಿ ಭೇಟಿಯಾಗಿ ವಿವರ ಪಡೆದುಕೊಳ್ಳಿ, ಜಗಳವಾಡದೆ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳಿ" ಎಂಬಂತಹ ಪ್ರಾಯೋಗಿಕ ಕ್ರಮಗಳು)
೪. ಶುದ್ಧ ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿ ಮಾತ್ರ ಬರೆಯಿರಿ.`;

    const aiRes = await askGemini(question, aiPrompt, "", "kn", { raw: true, temperature: 0.2 });
    if (aiRes && /[\u0C80-\u0CFF]/.test(aiRes) && aiRes.length > 100) {
      const rawParas = aiRes.split(/\n\n+/).map((p) => p.replace(/^.*?:/g, "").trim()).filter((p) => p.length > 20);
      if (rawParas.length >= 4) {
        const enrichedParas = [
          { titleKn: "೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ", contentKn: rawParas[0] },
          { titleKn: "೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ", contentKn: rawParas[1] },
          { titleKn: "೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ", contentKn: rawParas[2] },
          { titleKn: "೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು", contentKn: rawParas.slice(3).join("\n\n") }
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
      } else if (rawParas.length >= 2) {
        const enrichedParas = [
          { titleKn: "೧. ನೇರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ & ಸದ್ಯದ ವಾಸ್ತವಿಕ ಸ್ಥಿತಿ", contentKn: rawParas[0] },
          { titleKn: "೨. ಇದಕ್ಕೆ ಕಾರಣವೇನು? ಗ್ರಹಸ್ಥಿತಿ & ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ", contentKn: rawParas[1] },
          { titleKn: "೩. ನಿಖರ ಕಾಲಾವಧಿ & ಫಲ ಬದಲಾವಣೆಯ ಸಮಯ", contentKn: sec3Content },
          { titleKn: "೪. ದೈವಿಕ ಪರಿಹಾರ & ಪ್ರಾಯೋಗಿಕ ಮುಂದಿನ ಕ್ರಮಗಳು", contentKn: sec4Content }
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
