import { KundliOutput, PlanetName } from "./AstroTypes";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { computeKundliInsights } from "./KundliInsightsEngine";

export type SevaDomain = "pitru_karya" | "deva_karya";

export interface YajnaHawanaItem {
  id: string;
  nameKn: string;
  nameEn: string;
  domain: SevaDomain; // "pitru_karya" (Apara/Ancestral) vs "deva_karya" (Shubha/Divine)
  category: 
    | "pitru_narayana_bali" 
    | "pitru_tripindi"
    | "pitru_tila_homa"
    | "shatru_raksha" 
    | "sudarshana_raksha" 
    | "navagraha" 
    | "rahu_ketu_sandhi" 
    | "dasha_sandhi" 
    | "mrityunjaya_ayushya" 
    | "gokarna_abhisheka";
  categoryLabelKn: string;
  icon: string;
  isUrgentPrimary: boolean;
  astrologicalRootCauseKn: string;
  astrologicalRootCauseEn: string;
  sacredProcedureKn: string;
  sacredProcedureEn: string;
  expectedShiftsAfterPoojaKn: string;
  expectedShiftsAfterPoojaEn: string;
  priestSecretNoteKn: string; // Formatted inside brackets [...]
  priestSecretNoteEn: string;
}

export interface CombinedSacredSchedule {
  scheduleType: "two_stage_multi_day" | "single_day_deva_samputa";
  titleKn: string;
  titleEn: string;
  stage1PitruKarya?: {
    dayLabelKn: string;
    placeKn: string;
    ritualsKn: string[];
    descriptionKn: string;
  };
  restPeriodShuddhi?: {
    dayLabelKn: string;
    descriptionKn: string;
    shastraRuleKn: string;
  };
  stage2DevaKarya: {
    dayLabelKn: string;
    placeKn: string;
    ritualsKn: string[];
    descriptionKn: string;
  };
  synergyExplanationKn: string;
  synergyExplanationEn: string;
  recommendedMuhurthaKn: string;
}

export interface PitruDoshaAssessment {
  hasPitruDosha: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  severityLabelKn: string;
  reasonsKn: string[];
  suggestedKaryaKn: string;
  detailedExplanationKn: string;
  gokarnaSignificanceKn: string;
  shastraSeparationRuleKn: string;
}

export interface YajnaHawanaEngineOutput {
  pitruKaryas: YajnaHawanaItem[];
  devaHomas: YajnaHawanaItem[];
  combinedSchedule: CombinedSacredSchedule;
  pitruDoshaAssessment: PitruDoshaAssessment;
  overallAstrologicalPrescriptionSummaryKn: string;
}

/**
 * 100% Dynamic Yajna, Hawana, Sandhi & Pitru Dosha Seva Calculation Engine.
 * Enforces strict Vedic separation between Pitru Karya (Apara) and Deva Karya (Shubha).
 */
export function generateYajnaHawanaPlan(
  kundli: KundliOutput,
  context?: {
    runningDashaMaha?: string;
    runningDashaBhukti?: string;
    primaryChallenge?: string;
    devoteeName?: string;
  }
): YajnaHawanaEngineOutput {
  const devotee = context?.devoteeName || "ಭಕ್ತರೇ";
  const maha = context?.runningDashaMaha || "ಗುರು";
  const bhukti = context?.runningDashaBhukti || "ಶನಿ";
  const lagnaRashiKn = toKannadaRashi(kundli.lagnaRashi.english);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const insights = computeKundliInsights(kundli);

  // 1. Planet Lookups
  const sun = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p) => p.name === PlanetName.Ketu);

  // 2. Pitru Dosha Assessment
  const pitruReasonsKn: string[] = [];
  let isSunRahu = false;
  let isSunSaturn = false;
  let isRahu9th = false;
  let isKetu9th = false;

  if (sun && rahu && sun.rashi.index === rahu.rashi.index) {
    pitruReasonsKn.push("ಆತ್ಮಕಾರಕ ರವಿ ಹಾಗೂ ರಾಹು ಒಂದೇ ರಾಶಿಯಲ್ಲಿ ಸಂಯೋಗ (ಗ್ರಹಣ ಯೋಗ / ಪಿತೃ ಶಾಪ ಛಾಯೆ)");
    isSunRahu = true;
  }
  if (sun && saturn && sun.rashi.index === saturn.rashi.index) {
    pitruReasonsKn.push("ರವಿ ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ಸಂಯೋಗ (ಪಿತೃ-ಪುತ್ರ ವೈಮನಸ್ಯ ಹಾಗೂ ಪೂರ್ವ ಕರ್ಮ ಋಣ)");
    isSunSaturn = true;
  }
  if (sun && [6, 8, 12].includes(sun.house)) {
    pitruReasonsKn.push(`ರವಿ ಗ್ರಹವು ${sun.house}ನೇ ದುಸ್ಥಾನದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು (ಪಿತೃ ಸ್ಥಾನದ ಬಲಹೀನತೆ)`);
  }
  if (rahu && rahu.house === 9) {
    pitruReasonsKn.push("9ನೇ ಭಾಗ್ಯ/ಪಿತೃ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು ಗ್ರಹದ ಸ್ಥಿತಿ (ಪೂರ್ವಜರ ತೃಪ್ತಿಯ ಕೊರತೆ)");
    isRahu9th = true;
  }
  if (ketu && ketu.house === 9) {
    pitruReasonsKn.push("9ನೇ ಭಾಗ್ಯ/ಪಿತೃ ಸ್ಥಾನದಲ್ಲಿ ಕೇತು ಗ್ರಹದ ಸ್ಥಿತಿ (ಕುಲದೇವರ ಪ್ರಾರ್ಥನೆಯ ಕೊರತೆ)");
    isKetu9th = true;
  }
  if (rahu && rahu.house === 5) {
    pitruReasonsKn.push("5ನೇ ಪೂರ್ವಪುಣ್ಯ/ಸಂತಾನ ಭಾವದಲ್ಲಿ ರಾಹು ಗ್ರಹದ ಸ್ಥಿತಿ (ಸರ್ಪ-ಪಿತೃ ದೋಷ)");
  }

  const hasPitruDosha = pitruReasonsKn.length > 0 || insights.pitru.level !== "none";
  let pitruSeverity: "none" | "mild" | "moderate" | "severe" = "none";
  let pitruSeverityLabelKn = "ದೋಷವಿಲ್ಲ (ಪೂರ್ವಜರ ಪೂರ್ಣ ಆಶೀರ್ವಾದವಿದೆ)";

  if (hasPitruDosha) {
    if (isSunRahu || pitruReasonsKn.length >= 3) {
      pitruSeverity = "severe";
      pitruSeverityLabelKn = "ತೀವ್ರ ಪಿತೃ ದೋಷ (ಉತ್ತಮ ಫಲಕ್ಕಾಗಿ ತಕ್ಷಣದ ನಾರಾಯಣ ಬಲಿ & ತ್ರಿಪಿಂಡಿ ಅಗತ್ಯ)";
    } else if (pitruReasonsKn.length === 2 || isSunSaturn || isRahu9th) {
      pitruSeverity = "moderate";
      pitruSeverityLabelKn = "ಮಧ್ಯಮ ಪಿತೃ ದೋಷ (ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ತಿಲ ಹವನ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ಶಿಫಾರಸು)";
    } else {
      pitruSeverity = "mild";
      pitruSeverityLabelKn = "ಸೂಕ್ಷ್ಮ ಪಿತೃ ಋಣ (ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಶಮನ)";
    }
  }

  const suggestedPitruKaryaKn = pitruSeverity === "severe"
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ಪ್ರೇತೋದ್ಧಾರಣ ಶ್ರಾದ್ಧ, ತಿಲ ಹವನ ಹಾಗೂ ಗೋ ಪ್ರದಾನ"
    : pitruSeverity === "moderate"
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ತಿಲ ಹವನ, ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ"
    : "ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಸಂಕಲ್ಪ";

  const pitruDoshaAssessment: PitruDoshaAssessment = {
    hasPitruDosha,
    severity: pitruSeverity,
    severityLabelKn: pitruSeverityLabelKn,
    reasonsKn: pitruReasonsKn.length > 0 ? pitruReasonsKn : ["ಜಾತಕದಲ್ಲಿ ಪ್ರಮುಖ ಪಿತೃ ದೋಷಗಳಿಲ್ಲ; ಶುಭ ಭಾಗ್ಯೋದಯವಿದೆ."],
    suggestedKaryaKn: suggestedPitruKaryaKn,
    detailedExplanationKn: sanitizeAstrologyKannadaText(
      hasPitruDosha
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ 9ನೇ ಪಿತೃ ಸ್ಥಾನ ಹಾಗೂ ಆತ್ಮಕಾರಕ ರವಿಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಹಿಂದಿನ ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಅಥವಾ ಅಪರ ಕರ್ಮಗಳ ವಿಧಿಯು ಸಾಂಗವಾಗಿ ನೆರವೇರದಿರುವ ಛಾಯೆ ಕಂಡುಬರುತ್ತಿದೆ. ಇದರಿಂದಾಗಿ ಎಷ್ಟೇ ಕಠಿಣ ಪರಿಶ್ರಮಪಟ್ಟರೂ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೆಲಸ ತಪ್ಪಿಹೋಗುವುದು, ಸಂತಾನ ವಿಳಂಬ ಅಥವಾ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪೂರ್ವಜರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದವಿದೆ. ಯಾವುದೇ ಗಂಭೀರ ಪಿತೃ ದೋಷವಿಲ್ಲ.`
    ),
    gokarnaSignificanceKn: sanitizeAstrologyKannadaText(
      `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣವು ದಕ್ಷಿಣ ಕಾಶಿ ಎಂದೇ ಪ್ರಸಿದ್ಧವಾಗಿದ್ದು, ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಹಾಗೂ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಮತ್ತು ತಿಲ ಹವನವು 21 ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ನೀಡಿ, ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಭಾಗ್ಯೋದಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ.`
    ),
    shastraSeparationRuleKn: sanitizeAstrologyKannadaText(
      `ಧರ್ಮಶಾಸ್ತ್ರದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮ: ಪಿತೃ ಕಾರ್ಯ (ಅಪರ ಕರ್ಮ) ಮತ್ತು ದೇವತಾ ಕಾರ್ಯ (ಶುಭ ಹವನ) ಎರಡನ್ನೂ ಎಂದಿಗೂ ಒಂದೇ ದಿನ ಅಥವಾ ಒಂದೇ ಮುಹೂರ್ತದಲ್ಲಿ ಜೊತೆಯಾಗಿ ಮಾಡಬಾರದು. ಮೊದಲು ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ಮುಕ್ತಿ ನೆರವೇರಿಸಿ, ೧ ದಿನದ ಶೌಚ-ಶುದ್ಧಿ & ವಿಶ್ರಾಂತಿ ಪಡೆದ ನಂತರವೇ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶುಭ ದೇವತಾ ಹವನಗಳನ್ನು ನೆರವೇರಿಸಬೇಕು.`
    )
  };

  // ==========================================
  // SECTION 1: PITRU KARYAS (ಅಪರ ಕರ್ಮ / ಮುಕ್ತಿ)
  // ==========================================
  const pitruKaryas: YajnaHawanaItem[] = [];

  if (hasPitruDosha) {
    // 1. Narayana Bali & Preta Uddharana
    pitruKaryas.push({
      id: "pitru_narayana_bali",
      nameKn: "ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ & ಪ್ರೇತೋದ್ಧಾರಣ ಮಹಾ ಸಂಕಲ್ಪ",
      nameEn: "Sri Narayana Bali & Preta Uddharana Maha Sankalpa",
      domain: "pitru_karya",
      category: "pitru_narayana_bali",
      categoryLabelKn: "ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆ & ಆತ್ಮ ಸದ್ಗತಿ",
      icon: "🌾",
      isUrgentPrimary: pitruSeverity === "severe",
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದ 9ನೇ ಪಿತೃ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು/ಕೇತು ಸ್ಥಿತಿ ಹಾಗೂ ರವಿ-ರಾಹುಗಳ ಗ್ರಹಣ ಯೋಗದಿಂದಾಗಿ ಅತೃಪ್ತ ಪೂರ್ವಜರ ಪ್ರೇತ ಛಾಯೆಯಿದೆ. ಇದು ಸಂತಾನ ವಿಳಂಬ, ಆರ್ಥಿಕ ಸ್ಥಗಿತತೆ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಯ ಅಡೆತಡೆಗೆ ಮೂಲ ಕಾರಣವಾಗಿದೆ.`
      ),
      astrologicalRootCauseEn: "9th house affliction and Sun-Rahu conjunction causing ancestral unrest and generational blockages.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತೀರದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ವಿಧಿ, ಬ್ರಹ್ಮ-ವಿಷ್ಣು-ರುದ್ರ-ಯಮ-ಪ್ರೇತ ಆವಾಹನೆ, 16 ಪಿಂಡ ಪ್ರದಾನ, ಪ್ರಾಯಶ್ಚಿತ್ತ ತಿಲ ಹವನ ಹಾಗೂ ಗೋ ಪ್ರದಾನ.`
      ),
      sacredProcedureEn: "Narayana Bali rituals at Gokarna Kotiteertha with Brahma-Vishnu-Rudra invocations, 16 Pinda Pradanam, and Tila Havan.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ದೊರೆತು ಅವರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ. ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ, ಸಂತಾನ ಭಾಗ್ಯ, ಕಂಕಣ ಭಾಗ್ಯ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಗಿತತೆಗಳು ತಕ್ಷಣವೇ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Liberation of ancestral souls, releasing profound blessings that clear generational obstacles in marriage, progeny, and wealth.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಪಿತೃ ದೋಷವಿದ್ದಾಗ ಇತರ ಯಾವುದೇ ದೇವತಾ ಪೂಜೆ ಫಲ ಕೊಡುವುದಿಲ್ಲ; ಮೊದಲು ನಾರಾಯಣ ಬಲಿ ಮೂಲಕ ಪಿತೃ ಮುಕ್ತಿ ಮಾಡಿಸುವುದು ಪ್ರಥಮ ಕರ್ತವ್ಯ]`,
      priestSecretNoteEn: "[Astrologer Note: When Pitru Dosha is present, Narayana Bali is the paramount prerequisite before other rituals bear fruit]."
    });

    // 2. Tripindi Shradha
    pitruKaryas.push({
      id: "pitru_tripindi",
      nameKn: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಪಿತೃ ತೃಪ್ತಿ ಮಹಾ ವಿಧಿ",
      nameEn: "Tripindi Shradha & Ancestral Pacification Ritual",
      domain: "pitru_karya",
      category: "pitru_tripindi",
      categoryLabelKn: "ಮೂರು ತಲೆಮಾರಿನ ಪಿತೃ ತೃಪ್ತಿ",
      icon: "🕊️",
      isUrgentPrimary: pitruSeverity === "moderate" || pitruSeverity === "severe",
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ತಂದೆ, ತಾತ, ಮುತ್ತಾತ ಮೂರು ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಶ್ರಾದ್ಧ ತರ್ಪಣಗಳು ಲೋಪವಾಗಿದ್ದಾಗ ಅಥವಾ ಅಕಾಲಿಕ ನಿಧನರಾದ ಆತ್ಮಗಳ ತೃಪ್ತಿಗಾಗಿ ಈ ಶಾಂತಿ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.`
      ),
      astrologicalRootCauseEn: "Pacification for three generational ancestral lines and unfulfilled death rites.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಬ್ರಹ್ಮ, ವಿಷ್ಣು ಮತ್ತು ರುದ್ರ ದೇವತೆಗಳಿಗೆ ೩ ಪಿಂಡಗಳ ಅರ್ಪಣೆ (ತಾಮ್ರ, ಬೆಳ್ಳಿ, ಬಂಗಾರ ಸಂಕಲ್ಪ), ಯವ-ತಿಲ ತರ್ಪಣ ಹಾಗೂ ಗೋಕರ್ಣ ಪುಣ್ಯ ಸ್ನಾನ.`
      ),
      sacredProcedureEn: "Three sacred Pinda offerings to Brahma, Vishnu, and Rudra with barley and sesame oblations at Gokarna.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಮನೆಗೆ ಅಂಟಿದ್ದ ಅಶಾಂತಿ, ಪದೇಪದೇ ಉಂಟಾಗುತ್ತಿದ್ದ ಅನಾರೋಗ್ಯ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ಧನ ನಷ್ಟಗಳು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Total cleansing of generational domestic unrest, chronic illnesses, and unexpected financial drains.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧವು ಸತ್ವ, ರಜಸ್, ತಮಸ್ ಮೂರು ಗುಣಗಳ ಪೂರ್ವಜರ ಅತೃಪ್ತಿಯನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Tripindi Shradha harmonizes Satva, Rajas, and Tamas ancestral unrest]."
    });

    // 3. Tila Hawana & Pitru Tharpanam
    pitruKaryas.push({
      id: "pitru_tila_homa",
      nameKn: "ಪಿತೃ ಮುಕ್ತಿ ತಿಲ ಹವನ & ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥ ತರ್ಪಣ",
      nameEn: "Pitru Mukti Tila Hawana & Kotiteertha Tharpanam",
      domain: "pitru_karya",
      category: "pitru_tila_homa",
      categoryLabelKn: "ತಿಲ ಹವನ & ಪವಿತ್ರ ತರ್ಪಣ",
      icon: "🕯️",
      isUrgentPrimary: false,
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದಲ್ಲಿ ರವಿ ದುಸ್ಥಾನದಲ್ಲಿದ್ದು, ಪಿತೃ ಋಣದ ಛಾಯೆ ಇರುವಾಗ ಪೂರ್ವಜರಿಗೆ ಶಾಂತಿ ಮತ್ತು ತೃಪ್ತಿ ನೀಡಲು ಕಪ್ಪು ಎಳ್ಳಿನ ಹವನ ಶ್ರೇಷ್ಠ.`
      ),
      astrologicalRootCauseEn: "Sun in Dusthana inducing ancestral debt, relieved through consecrated sesame oblation.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ದರ್ಭೆಗಳಿಂದ ಪಿತೃ ಗಾಯತ್ರಿ ಮಂತ್ರ ಸಮೇತ ಹವನ ಹಾಗೂ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪ್ರಾಣಾಯಾಮ ತರ್ಪಣ.`
      ),
      sacredProcedureEn: "Sacred black sesame, ghee, and Darbha grass offerings with Pitru Gayatri mantras at Kotiteertha.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಮನಸ್ಸಿನಲ್ಲಿರುವ ಅಪರಾಧ ಭಾವನೆಗಳು ದೂರವಾಗಿ, ಪೂರ್ವಜರ ನಿರಂತರ ರಕ್ಷಣೆ ಕುಟುಂಬಕ್ಕೆ ಸಿಗುತ್ತದೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Relief from ancestral remorse and securing ongoing protective blessings for the progeny.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ತಿಲ ಹವನವು ಪಿತೃಗಳ ಸೂಕ್ಷ್ಮ ಶರೀರಕ್ಕೆ ತೃಪ್ತಿ ನೀಡಿ ಪುಣ್ಯ ಫಲವನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Tila Hawana provides subtle body satisfaction to ancestors, amplifying merit]."
    });
  }

  // ==========================================
  // SECTION 2: DEVA KARYAS (ದೇವತಾ ಯಜ್ಞ & ಶುಭ ಹವನ)
  // ==========================================
  const devaHomas: YajnaHawanaItem[] = [];

  // HOMA 1: Chandi / Durga Hawana
  const is6thAfflicted = (mars && [6, 8, 12].includes(mars.house)) || (rahu && [6, 10].includes(rahu.house)) || context?.primaryChallenge === "Career / Workplace";
  devaHomas.push({
    id: "homa_chandi",
    nameKn: "ಶ್ರೀ ಚಂಡಿಕಾ ಮಹಾ ಹವನ & ದುರ್ಗಾ ಸಪ್ತಶತಿ ಯಾಗ",
    nameEn: "Sri Chandi Maha Hawana & Durga Saptashati Yajna",
    domain: "deva_karya",
    category: "shatru_raksha",
    categoryLabelKn: "ಶತ್ರು ಸಂಹಾರ & ಅಭೇದ್ಯ ರಕ್ಷಣೆ",
    icon: "🔥",
    isUrgentPrimary: Boolean(is6thAfflicted),
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ 6ನೇ ಮನೆಯ ಶತ್ರು/ಸ್ಪರ್ಧಾ ಸ್ಥಾನ ಹಾಗೂ ${lagnaRashiKn} ಲಗ್ನದ ಮೇಲೆ ಕುಜ-ರಾಹು ಗ್ರಹಗಳ ದೃಷ್ಟಿ ಪ್ರಭಾವವಿದೆ. ಇದರಿಂದಾಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅತಿಯಾದ ಪೈಪೋಟಿ, ಈರ್ಷೆ, ನೀವು ಮಾಡದ ತಪ್ಪಿಗೆ ಅಪವಾದ ಹಾಗೂ ಅದೃಶ್ಯ ಶತ್ರುಗಳ ಕುತಂತ್ರಗಳು ಎದುರಾಗುತ್ತಿವೆ.`
    ),
    astrologicalRootCauseEn: "Affliction to the 6th house of competition and Mars-Rahu aspects causing workplace rivalry, envy, and obstacle patterns.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿಯ 700 ಪವಿತ್ರ ಶ್ಲೋಕಗಳ ಆಹುತಿಗಳು, ಕುಂಕುಮಾರ್ಚನೆ, ಪಾಯಸ ಹವನ, ನವದುರ್ಗಾ ಆವಾಹನೆ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾ ಪೂರ್ಣಾಹುತಿ ಸಂಕಲ್ಪ.`
    ),
    sacredProcedureEn: "Recitation of 700 Durga Saptashati mantras, Kumkumarchana, sacred sweet payasa ahutis, and grand Purnahuti at Gokarna Kshetra.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ಸಮಸ್ತ ಶತ್ರು ಬಾಧೆಗಳು ಹಾಗೂ ನರ ದೃಷ್ಟಿ ದೋಷಗಳು ಭಸ್ಮವಾಗುತ್ತವೆ. ಉದ್ಯೋಗ-ವ್ಯಾಪಾರದಲ್ಲಿ ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಪ್ರಗತಿ ಪುನರಾರಂಭವಾಗಿ, ವಿರೋಧಿಗಳ ತಂತ್ರಗಳು ತಾವಾಗಿಯೇ ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ. ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸಕ್ಕೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಲಭಿಸುತ್ತದೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Utter destruction of competitor hostility and evil eye; career stagnation dissolves, securing continuous divine protection.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಜಾತಕನ 6ನೇ ಭಾವದಲ್ಲಿರುವ ಅಶುಭ ತರಂಗಗಳು ಚಂಡಿಕಾ ಹವನದ ಮೂಲಕ ಶಮನಗೊಂಡು ತ್ವರಿತ ಜಯ ತರುತ್ತವೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Chandi Hawana neutralizes 6th house afflictions, establishing unshakeable professional victory]."
  });

  // HOMA 2: Sudarshana Hawana
  const isSudarshanaNeeded = (ketu && [1, 8, 12].includes(ketu.house)) || (moon && [8, 12, 6].includes(moon.house));
  devaHomas.push({
    id: "homa_sudarshana",
    nameKn: "ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ ಹೋಮ & ನರಸಿಂಹ ಹವನ",
    nameEn: "Sri Maha Sudarshana Homa & Narasimha Hawana",
    domain: "deva_karya",
    category: "sudarshana_raksha",
    categoryLabelKn: "ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ & ಧನ ರಕ್ಷೆ",
    icon: "☸️",
    isUrgentPrimary: Boolean(isSudarshanaNeeded),
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ಜಾತಕದಲ್ಲಿ 8ನೇ ಮತ್ತು 12ನೇ ಭಾವಗಳ ಮೇಲಿನ ಛಾಯಾ ಗ್ರಹಗಳ ಪ್ರಭಾವ ಹಾಗೂ ಚಂದ್ರನ ಸೂಕ್ಷ್ಮ ಸಂಚಾರದಿಂದಾಗಿ ತೀವ್ರ ನರ ದೃಷ್ಟಿ, ದುಃಸ್ವಪ್ನ, ಹಣಕಾಸಿನ ಹಠಾತ್ ನಷ್ಟದ ಭೀತಿ ಹಾಗೂ ಆಂತರಿಕ ಆತಂಕ ಉಂಟಾಗುತ್ತಿದೆ.`
    ),
    astrologicalRootCauseEn: "Shadow node pressures on 8th/12th houses generating evil eye afflictions, sudden financial leakages, and anxiety.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `ಶ್ರೀ ಸುದರ್ಶನ ಮಹಾಮಂತ್ರ ಹಾಗೂ ಶ್ರೀ ನೃಸಿಂಹ ಕವಚ ಮಂತ್ರಗಳೊಂದಿಗೆ ಪವಿತ್ರ ತುಪ್ಪ, ಸಮಿಧೆ, ಕಪ್ಪು ಎಳ್ಳು ಹಾಗೂ ಸುದರ್ಶನ ಯಂತ್ರಕ್ಕೆ ಅರ್ಚನೆ.`
    ),
    sacredProcedureEn: "Invocation of Sudarshana Maha Mantra and Narasimha Kavacha with sacred ghee, samidhas, and consecrated Yantra archana.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ಸಕಲ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಛೇದನವಾಗಿ, ಮನಸ್ಸಿಗೆ ಅಚಲ ಧೈರ್ಯ ಮೂಡುತ್ತದೆ. ವ್ಯಾಪಾರ, ಹೊಸ ಆಸ್ತಿ ಖರೀದಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಹಣಕಾಸಿಗೆ ಸುದರ್ಶನ ಚಕ್ರದ ಅಭೇದ್ಯ ರಕ್ಷಣೆ ದೊರೆಯುತ್ತದೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Total dispelling of negative energetic vibrations, financial protection, and emergence of deep internal serenity.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಸುದರ್ಶನ ಚಕ್ರ ಹೋಮವು ಜಾತಕನ ಆರಾ ಮಂಡಲವನ್ನು (Aura) ಶುದ್ಧೀಕರಿಸಿ ದುಷ್ಟ ಶಕ್ತಿಗಳಿಂದ ಕಾಪಾಡುತ್ತದೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Sudarshana Homa purifies the native's energetic field and creates an impervious shield]."
  });

  // HOMA 3: Navagraha Maha Hawana
  devaHomas.push({
    id: "homa_navagraha",
    nameKn: "ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಯಜ್ಞ & ಗ್ರಹ ಪ್ರೀತಿ ಹವನ",
    nameEn: "Navagraha Shanti Maha Yajna & Planetary Alignment Hawana",
    domain: "deva_karya",
    category: "navagraha",
    categoryLabelKn: "ಸರ್ವ ಗ್ರಹ ಸಮತೋಲನ & ಭಾಗ್ಯೋದಯ",
    icon: "🪐",
    isUrgentPrimary: true,
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ನವಗ್ರಹಗಳ ಸ್ಥಾನಬಲದ ಏರುಪೇರು ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆಯಲ್ಲಿ ಗ್ರಹಗಳ ಪೂರ್ಣಾನುಗ್ರಹವನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ನವಗ್ರಹ ಪ್ರೀತಿ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.`
    ),
    astrologicalRootCauseEn: "Planetary imbalance across natal houses and running Dasha-Gochara transits requiring holistic Navagraha alignment.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `9 ಗ್ರಹಗಳ ಪ್ರತ್ಯೇಕ ಸಮಿಧೆಗಳು (ಅರ್ಕ, ಪಲಾಶ, ಖದಿರ, ಅಪಾಮಾರ್ಗ, ಅಶ್ವತ್ಥ, ಶಮಿ ಇತ್ಯಾದಿ), ನವಧಾನ್ಯಗಳು ಹಾಗೂ ನವಗ್ರಹ ಗಾಯತ್ರಿ ಮಂತ್ರಗಳ ಸಹಸ್ರ ಆಹುತಿ.`
    ),
    sacredProcedureEn: "Sacred ahutis using distinct herbal woods for all 9 planets, Navadhanya grains, and 1008 Navagraha Gayatri chants.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ದೈನಂದಿನ ಕೆಲಸಗಳಲ್ಲಿ ಪದೇಪದೇ ಬರುತ್ತಿದ್ದ ವಿಳಂಬ ಮತ್ತು ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ. 9 ಗ್ರಹಗಳ ಸಮನ್ವಯತೆಯಿಂದ ಆರೋಗ್ಯ, ಆಯಸ್ಸು, ವಿದ್ಯೆ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳು ವೃದ್ಧಿಯಾಗುತ್ತವೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Dissolution of day-to-day obstacles, harmony across all nine celestial forces, and revitalization of good fortune.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ನವಗ್ರಹ ಹವನವು ಸಕಲ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರಗಳಿಗೆ ತಳಹದಿಯಾಗಿದ್ದು, ಮುಂಬರುವ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಭ ಫಲ ನೀಡುತ್ತದೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Navagraha Hawana serves as the master foundation ensuring upcoming transits manifest beneficially]."
  });

  // HOMA 4: Rahu-Ketu / Guru-Chandal Sandhi Homa
  const isRahuKetuAfflicted = (rahu && [1, 5, 7, 8].includes(rahu.house)) || (insights.kaalsarp !== "none") || (jupiter && rahu && jupiter.rashi.index === rahu.rashi.index);
  if (isRahuKetuAfflicted) {
    devaHomas.push({
      id: "homa_rahu_ketu_sandhi",
      nameKn: "ರಾಹು-ಕೇತು ಸರ್ಪ ಶಾಂತಿ & ಗುರು-ಚಂಡಾಲ ದೋಷ ನಿವಾರಣಾ ಹವನ",
      nameEn: "Rahu-Ketu Sarpa Shanti & Guru-Chandal Dosha Nivaran Hawana",
      domain: "deva_karya",
      category: "rahu_ketu_sandhi",
      categoryLabelKn: "ಛಾಯಾ ಗ್ರಹ ದೋಷ & ನಾಗ ಶಾಂತಿ",
      icon: "🐍",
      isUrgentPrimary: true,
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದಲ್ಲಿ ರಾಹು/ಕೇತುಗಳ ಪ್ರಬಲ ಸ್ಥಿತಿ ಅಥವಾ ಗುರು-ರಾಹು ಸಂಯೋಗದಿಂದಾಗಿ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದ್ವಂದ್ವ, ಭ್ರಮೆಗಳು, ಅನಗತ್ಯ ಗೊಂದಲ ಹಾಗೂ ವಿವಾಹ/ವೃತ್ತಿಯಲ್ಲಿ ನಿರೀಕ್ಷಿತ ತಿರುವು ವಿಳಂಬವಾಗುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "Rahu-Ketu axis or Guru-Chandal conjunction causing mental confusion, decision paralysis, and delays.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗಪ್ರತಿಷ್ಠಾಪನೆ ಸಂಕಲ್ಪ, ರಾಹು-ಕೇತು ಜಪ, ಕಪ್ಪು-ಬಿಳಿ ಎಳ್ಳಿನ ಹವನ ಹಾಗೂ ನವನಾಗ ಮಂಡಲ ಪೂಜೆ.`
      ),
      sacredProcedureEn: "Naga Pratishthapana Sankalpa at Gokarna, Rahu-Ketu Japa, sesame offerings, and Navanaga Mandala Archana.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಮನಸ್ಸಿನಲ್ಲಿದ್ದ ಗೊಂದಲಗಳು ಪರಿಹಾರವಾಗಿ ದೃಢ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಬರುತ್ತದೆ. ವಿವಾಹ, ಸಂತಾನ ಹಾಗೂ ವಿದೇಶ ಯೋಗದ ದಾರಿಯಲ್ಲಿನ ಕಠಿಣ ತಡೆಗೋಡೆಗಳು ಕರಗುತ್ತವೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Immediate clarity of thought, dissolution of relationship friction, and removal of roadblocks in career expansion.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ರಾಹು-ಕೇತುಗಳ ನಾಗ ಶಾಂತಿಯು ಜಾತಕನ ಕರ್ಮ ಜಾಲವನ್ನು ಶುದ್ಧೀಕರಿಸಿ ಶುಭ ದಾರಿಯನ್ನು ತೆರೆಯುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Rahu-Ketu Shanti untangles deep karmic knots, restoring smooth progression]."
    });
  }

  // HOMA 5: Dasha-Bhukti Sandhi Pooja
  devaHomas.push({
    id: "homa_dasha_sandhi",
    nameKn: `ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಶಾಂತಿ ಹವನ (${maha} - ${bhukti} ಸಂಧಿ ಸಂಕಲ್ಪ)`,
    nameEn: `Dasha-Bhukti Sandhi Shanti Hawana (${maha} - ${bhukti} Transition)`,
    domain: "deva_karya",
    category: "dasha_sandhi",
    categoryLabelKn: "ದಶಾ ಪರಿವರ್ತನಾ ಶಾಂತಿ",
    icon: "⏳",
    isUrgentPrimary: false,
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆ ಹಾಗೂ ${bhukti} ಭುಕ್ತಿಯ ಅಂತ್ಯದ ಸಂಧಿಕಾಲದಲ್ಲಿ ಗ್ರಹಗಳ ಶಕ್ತಿಯು ಬದಲಾಗುತ್ತಿರುವುದರಿಂದ, ಹಠಾತ್ ಸ್ಥಾನಪಲ್ಲಟ, ಆರ್ಥಿಕ ಏರಿಳಿತ ಅಥವಾ ಒತ್ತಡಗಳು ಉಂಟಾಗದಂತೆ ರಕ್ಷಣೆ ಅಗತ್ಯವಿದೆ.`
    ),
    astrologicalRootCauseEn: `Transition between ${maha} Mahadasha and ${bhukti} Antardasha creating vulnerable planetary shifting phase.`,
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `ಪ್ರಸ್ತುತ ಮತ್ತು ಮುಂಬರುವ ದಶಾಧಿಪತಿ ಗ್ರಹಗಳ ಮಂತ್ರಾನುಷ್ಠಾನ, ಪ್ರಾಯಶ್ಚಿತ್ತ ಹವನ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಧಿಕಾಲ ರಕ್ಷಾ ಸಂಕಲ್ಪ.`
    ),
    sacredProcedureEn: "Mantra Japa for ruling and incoming Dasha lords, expiatory havan, and protective transitional sankalpa at Gokarna.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ದಶಾ ಬದಲಾವಣೆಯ ಆಘಾತಗಳಿಂದ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ ಲಭಿಸಿ, ಮುಂಬರುವ ಹೊಸ ದಶಾ ಕಾಲದಲ್ಲಿ ಆರಂಭದಿಂದಲೇ ಯಶಸ್ಸು, ಪದೋನ್ನತಿ ಹಾಗೂ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Shields against unexpected disruptions during Dasha shift, accelerating prosperity and recognition in the new planetary cycle.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ಶಾಂತಿ ಮಾಡಿಸುವುದರಿಂದ ಹಳೆಯ ದಶೆಯ ಕಷ್ಟಗಳು ಮುಕ್ತಾಯವಾಗಿ ಹೊಸ ದಶೆಯು ರಾಜಯೋಗದಂತೆ ಆರಂಭವಾಗುತ್ತದೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Dasha Sandhi Shanti ensures the outgoing cycle's strain ceases and the incoming cycle opens auspiciously]."
  });

  // HOMA 6: Mahamrityunjaya Homa & Ayushya Hawana
  const isMaandiLagnaOr8th = kundli.maandi && [1, 8].includes((((kundli.maandi.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1));
  devaHomas.push({
    id: "homa_mrityunjaya",
    nameKn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾ ಯಾಗ & ಆಯುಷ್ಯ-ಮಾಂದಿ ಶಾಂತಿ ಹವನ",
    nameEn: "Mahamrityunjaya Maha Yajna & Ayushya-Maandi Shanti Hawana",
    domain: "deva_karya",
    category: "mrityunjaya_ayushya",
    categoryLabelKn: "ಆರೋಗ್ಯ ಚೈತನ್ಯ & ಮಾಂದಿ ನಿವಾರಣೆ",
    icon: "🔱",
    isUrgentPrimary: Boolean(isMaandiLagnaOr8th),
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ಜಾತಕದ ಲಗ್ನ ಮತ್ತು 8ನೇ ಮನೆಯ ಮೇಲೆ ಮಾಂದಿ ಹಾಗೂ ಪಾಪಗ್ರಹಗಳ ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವದಿಂದಾಗಿ ದೈಹಿಕ ನಿಶ್ಯಕ್ತಿ, ಜೀರ್ಣಾಂಗ ಅಗ್ನಿಮಾಂದ್ಯತೆ, ರಾತ್ರಿ ನಿದ್ರಾಹೀನತೆ (2:00 ರಿಂದ 4:30) ಹಾಗೂ ಮಾನಸಿಕ ಆಯಾಸ ಉಂಟಾಗುತ್ತಿದೆ.`
    ),
    astrologicalRootCauseEn: "Subtle afflictions on Lagna/8th house from Maandi and malefic transits inducing fatigue and sleep disturbances.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರದ 1008 ಆಹುತಿಗಳು, ಅಮೃತಬಳ್ಳಿ (ಗುಡೂಚಿ), ದೂರ್ವಾ, ಗೋಘೃತ, ಜೇನುತುಪ್ಪ ಹಾಗೂ ಶ್ರೀ ರುದ್ರಾಧ್ಯಾಯ ಹೋಮ.`
    ),
    sacredProcedureEn: "1008 Mahamrityunjaya chants with sacred Guduchi herb, Durva grass, pure cow ghee, and Rudradhyaya havan.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ದೈಹಿಕ ಚೈತನ್ಯ ಪುನರುಜ್ಜೀವನಗೊಂಡು, ದೀರ್ಘಕಾಲದ ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಆತಂಕ ಶಮನವಾಗುತ್ತದೆ. ಆಯುಷ್ಯ ವೃದ್ಧಿ, ನವೋತ್ಸಾಹ ಹಾಗೂ ಅಪಮೃತ್ಯು ದೋಷಗಳಿಂದ ದೈವಿಕ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Restoration of physical vitality, deep sound sleep, rejuvenation of nervous energy, and longevity blessing.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಮೃತ್ಯುಂಜಯ ಹವನವು ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸಿ ಮಾಂದಿ ಗ್ರಹದ ನಕಾರಾತ್ಮಕ ತರಂಗಗಳನ್ನು ಶೂನ್ಯಗೊಳಿಸುತ್ತದೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Mahamrityunjaya Hawana revitalizes Prana Shakti, neutralizing Maandi's shadow debility]."
  });

  // HOMA 7: Gokarna Atmalinga Rudrabhisheka
  devaHomas.push({
    id: "homa_gokarna_abhisheka",
    nameKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ & ಪಂಚಾಮೃತ ಸೇವೆ",
    nameEn: "Sri Kshetra Gokarna Mahabaleshwara Atmalinga Mahabhisheka",
    domain: "deva_karya",
    category: "gokarna_abhisheka",
    categoryLabelKn: "ಭೂಕೈಲಾಸ ಸಾನ್ನಿಧ್ಯ ಮಹಾ ಸಂಕಲ್ಪ",
    icon: "🪔",
    isUrgentPrimary: true,
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನ ಮತ್ತು ${moonRashiKn} ರಾಶಿಯ ಸಮಗ್ರ ಕರ್ಮ ಶುದ್ಧೀಕರಣಕ್ಕಾಗಿ ಹಾಗೂ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ಅರಿಷ್ಟಗಳನ್ನು ಭಸ್ಮ ಮಾಡಲು ಸಾಕ್ಷಾತ್ ಪರಮಶಿವನ ಆತ್ಮಲಿಂಗ ಸಾನ್ನಿಧ್ಯದ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.`
    ),
    astrologicalRootCauseEn: "Comprehensive karmic purification for Lagna and Moon Sign at the sacred Bho-Kailasa Atmalinga shrine.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ, ಕ್ಷೀರಾಭಿಷೇಕ, ಪಂಚಾಮೃತ ಸ್ನಾನ, ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಸಂಕಲ್ಪ ಪೂರ್ವಕ ಮಹಾಮಂಗಳಾರತಿ.`
    ),
    sacredProcedureEn: "Sacred Rudrabhisheka, Panchamrita abhisheka, Bilvarchana, and special Sankalpa Archana at Gokarna Atmalinga.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ಮನಸ್ಸಿನಲ್ಲಿರುವ ಸಕಲ ನೋವು, ಭಯ ಮತ್ತು ಚಿಂತೆಗಳು ಕರಗಿ ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಲಭಿಸುತ್ತದೆ. ದೈವಾನುಗ್ರಹದಿಂದ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಜಯ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Immediate inner mental peace, dissolution of subconscious fears, and divine grace blessing all endeavors.",
    priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆಯು ಜಾತಕನ ಜನ್ಮ ಜನ್ಮಾಂತರದ ಪಾಪ-ಕರ್ಮಗಳನ್ನು ಕರಗಿಸುವ ಮಹಾ ಶಕ್ತಿ ಹೊಂದಿದೆ]`,
    priestSecretNoteEn: "[Astrologer Note: Gokarna Atmalinga Abhisheka dissolves deep-seated karmic residues, ensuring complete divine backing]."
  });

  // ==========================================
  // 3. COMBINED SACRED SCHEDULE (2-STAGE MULTI-DAY PLAN)
  // ==========================================
  const devaHomaNamesKn: string[] = ["ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಯಜ್ಞ"];
  if (is6thAfflicted) devaHomaNamesKn.push("ಶ್ರೀ ಚಂಡಿಕಾ ಮಹಾ ಹವನ");
  else devaHomaNamesKn.push("ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ ಹೋಮ");
  devaHomaNamesKn.push("ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ");

  let combinedSchedule: CombinedSacredSchedule;

  if (hasPitruDosha) {
    const pitruRitualsKn = ["ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ", "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", "ತಿಲ ಹವನ & ಪಿಂಡ ಪ್ರದಾನ"];
    combinedSchedule = {
      scheduleType: "two_stage_multi_day",
      titleKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ೨-ಹಂತದ ಪಿತೃ ಮುಕ್ತಿ & ದೇವತಾ ಸಂಪುಟ ಮಹಾ ಸೇವೆ",
      titleEn: "Gokarna 2-Stage Ancestral Liberation & Divine Samputa Yajna",
      stage1PitruKarya: {
        dayLabelKn: "ಹಂತ ೧ (ದಿನ ೧): ಪಿತೃ ಮುಕ್ತಿ ಅಪರ ಸಂಕಲ್ಪ",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥ ತೀರ",
        ritualsKn: pitruRitualsKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಪ್ರಥಮ ದಿನದಂದು ಕೋಟಿತೀರ್ಥದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪಿತೃ ಮುಕ್ತಿಗಾಗಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಹಾಗೂ ತಿಲ ಹವನಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನೆರವೇರಿಸಿ 21 ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಸದ್ಗತಿ ಕಲ್ಪಿಸಲಾಗುತ್ತದೆ."
        )
      },
      restPeriodShuddhi: {
        dayLabelKn: "ವಿಶ್ರಾಂತಿ & ಶುದ್ಧಿ (ದಿನ ೨): ೧ ದಿನದ ಆಶೌಚ ನಿವೃತ್ತಿ & ದೈವಿಕ ಶುದ್ಧಿ ಕಾಲ",
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಧರ್ಮಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಪಿತೃ ಕಾರ್ಯ ಮತ್ತು ದೇವತಾ ಕಾರ್ಯವನ್ನು ಒಂದೇ ದಿನ ಮಾಡಬಾರದು. ಪಿತೃ ಮುಕ್ತಿಯ ನಂತರ ೧ ದಿನದ ಪೂರ್ಣ ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸಾಗರ ಸ್ನಾನ / ಪುಣ್ಯ ತೀರ್ಥ ಸ್ನಾನದಿಂದ ದೇಹ-ಮನಸ್ಸಿನ ಶುದ್ಧಿ ಪಡೆಯಬೇಕು."
        ),
        shastraRuleKn: "ಶಾಸ್ತ್ರ ನಿಯಮ: ಪಿತೃ ಕರ್ಮದ ನಂತರ ೧ ದಿನದ ಶೌಚ-ಶುದ್ಧಿ ವಿಶ್ರಾಂತಿ ಕಡ್ಡಾಯ."
      },
      stage2DevaKarya: {
        dayLabelKn: "ಹಂತ ೨ (ದಿನ ೩): ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಜ್ಞ & ರುದ್ರಾಭಿಷೇಕ",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ",
        ritualsKn: devaHomaNamesKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಶುದ್ಧಿ ದಿನದ ನಂತರ, ಮೂರನೇ ದಿನ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನವಗ್ರಹ ಶಾಂತಿ, ಚಂಡಿಕಾ/ಸುದರ್ಶನ ಹವನ ಹಾಗೂ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕಗಳನ್ನು ಸಂಪುಟವಾಗಿ ನೆರವೇರಿಸಿ ಸಕಲ ಭಾಗ್ಯೋದಯ ಸಂಕಲ್ಪ ಮಾಡಲಾಗುತ್ತದೆ."
        )
      },
      synergyExplanationKn: sanitizeAstrologyKannadaText(
        "ಈ ೨-ಹಂತದ ಶಾಸ್ತ್ರೋಕ್ತ ಯೋಜನೆಯಿಂದ: ಮೊದಲಿಗೆ ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆಯಾಗಿ ಪೂರ್ವಜರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ; ನಂತರ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಮಾಡುವ ದೇವತಾ ಯಜ್ಞದಿಂದ ನವಗ್ರಹ ಶಾಂತಿ, ಶತ್ರು ನಾಶ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರನ ಶಾಶ್ವತ ರಕ್ಷಾ ಕವಚ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
      ),
      synergyExplanationEn: "Executing this authentic 2-stage timeline strictly respects Vedic apara-shubha separation: ancestral liberation on Day 1, followed by purifying rest on Day 2, and grand divine homa on Day 3.",
      recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
        "ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನ, ಶನಿವಾರ, ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಪೌರ್ಣಮಿಯ ಪ್ರಾತಃಕಾಲದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ."
      )
    };
  } else {
    combinedSchedule = {
      scheduleType: "single_day_deva_samputa",
      titleKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಚತುರ್ಮುಖ ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಾಗ",
      titleEn: "Gokarna Chaturmukha Divine Samputa Yajna",
      stage2DevaKarya: {
        dayLabelKn: "ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಾಗ (ದಿನ ೧)",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ",
        ritualsKn: devaHomaNamesKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷವಿಲ್ಲದಿರುವುದರಿಂದ, ನೇರವಾಗಿ ನವಗ್ರಹ ಶಾಂತಿ, ಚಂಡಿಕಾ/ಸುದರ್ಶನ ಹವನ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕಗಳನ್ನು ಒಂದೇ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ."
        )
      },
      synergyExplanationKn: sanitizeAstrologyKannadaText(
        "ಈ ೩ ಪ್ರಮುಖ ಹವನಗಳನ್ನು ಒಂದೇ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಸಂಪುಟ ರೂಪದಲ್ಲಿ ನೆರವೇರಿಸುವುದರಿಂದ ನವಗ್ರಹ ಶಾಂತಿ, ಶತ್ರು-ದೃಷ್ಟಿ ಬಾಧೆಗಳ ಭಸ್ಮ ಹಾಗೂ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗದಿಂದ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಶಾಶ್ವತವಾಗಿ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ."
      ),
      synergyExplanationEn: "Combining these synergistic homas in one unified auspicious muhurtha simultaneously harmonizes planetary transits, crushes rival opposition, and secures eternal divine grace.",
      recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
        "ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನ, ಶನಿವಾರ ಅಥವಾ ಪೌರ್ಣಮಿಯ ಪ್ರಾತಃಕಾಲದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ."
      )
    };
  }

  const overallAstrologicalPrescriptionSummaryKn = sanitizeAstrologyKannadaText(
    `ನಮಸ್ಕಾರ ${devotee}, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಸ್ತುತ ಗ್ರಹಗತಿಯ ಪ್ರಕಾರ, ಈ ನಿರ್ದಿಷ್ಟ ಯಜ್ಞ-ಹವನಗಳು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವನ್ನು ನಿರ್ಧರಿಸಲಿವೆ. ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಇವುಗಳನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಮುಂಬರುವ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ ನಿಮ್ಮ ಸಕಲ ಕಷ್ಟಗಳು ಕರಗಿ ಭಾಗ್ಯೋದಯವಾಗಲಿದೆ.`
  );

  return {
    pitruKaryas,
    devaHomas,
    combinedSchedule,
    pitruDoshaAssessment,
    overallAstrologicalPrescriptionSummaryKn
  };
}
