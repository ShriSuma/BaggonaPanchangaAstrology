import { KundliOutput, PlanetName } from "./AstroTypes";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { computeKundliInsights } from "./KundliInsightsEngine";

export interface YajnaHawanaItem {
  id: string;
  nameKn: string;
  nameEn: string;
  category: "shatru_raksha" | "sudarshana_raksha" | "navagraha" | "rahu_ketu_sandhi" | "dasha_sandhi" | "mrityunjaya_ayushya" | "pitru_narayana_bali" | "gokarna_abhisheka";
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

export interface CombinedSamputaSeva {
  titleKn: string;
  titleEn: string;
  includedHomasKn: string[];
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
}

export interface YajnaHawanaEngineOutput {
  recommendedHomas: YajnaHawanaItem[];
  combinedSamputaSeva: CombinedSamputaSeva;
  pitruDoshaAssessment: PitruDoshaAssessment;
  overallAstrologicalPrescriptionSummaryKn: string;
}

/**
 * 100% Dynamic Yajna, Hawana, Sandhi & Pitru Dosha Seva Calculation Engine.
 * Evaluates birth Kundli, planetary aspects, house afflictions, Dasha-Bhukti, and Maandi.
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
  let isSunDusthana = false;

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
    isSunDusthana = true;
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
  let pitruSeverityLabelKn = "ದೋಷವಿಲ್ಲ";

  if (hasPitruDosha) {
    if (isSunRahu || pitruReasonsKn.length >= 3) {
      pitruSeverity = "severe";
      pitruSeverityLabelKn = "ತೀವ್ರ ಪಿತೃ ದೋಷ (ಉತ್ತಮ ಫಲಕ್ಕಾಗಿ ತಕ್ಷಣದ ನಾರಾಯಣ ಬಲಿ ಅಗತ್ಯ)";
    } else if (pitruReasonsKn.length === 2 || isSunSaturn || isRahu9th) {
      pitruSeverity = "moderate";
      pitruSeverityLabelKn = "ಮಧ್ಯಮ ಪಿತೃ ದೋಷ (ತಿಲ ಹವನ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ ಶಿಫಾರಸು)";
    } else {
      pitruSeverity = "mild";
      pitruSeverityLabelKn = "ಸೂಕ್ಷ್ಮ ಪಿತೃ ಋಣ (ದೈವಿಕ ಸಂಕಲ್ಪದಿಂದ ಶಮನ)";
    }
  }

  const suggestedPitruKaryaKn = pitruSeverity === "severe"
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ಪ್ರೇತೋದ್ಧಾರಣ ಶ್ರಾದ್ಧ, ತಿಲ ಹವನ ಹಾಗೂ ಗೋ ಪ್ರದಾನ"
    : pitruSeverity === "moderate"
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತಿಲ ಹವನ, ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಪಿತೃ ತರ್ಪಣ"
    : "ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಸಂಕಲ್ಪ";

  const pitruDoshaAssessment: PitruDoshaAssessment = {
    hasPitruDosha,
    severity: pitruSeverity,
    severityLabelKn: pitruSeverityLabelKn,
    reasonsKn: pitruReasonsKn.length > 0 ? pitruReasonsKn : ["ಜಾತಕದಲ್ಲಿ ಪ್ರಮುಖ ಪಿತೃ ದೋಷಗಳಿಲ್ಲ; ಶುಭ ಭಾಗ್ಯೋದಯವಿದೆ."],
    suggestedKaryaKn: suggestedPitruKaryaKn,
    detailedExplanationKn: sanitizeAstrologyKannadaText(
      hasPitruDosha
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ 9ನೇ ಪಿತೃ ಸ್ಥಾನ ಹಾಗೂ ಆತ್ಮಕಾರಕ ರವಿಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಹಿಂದಿನ ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಅಥವಾ ಅಂತ್ಯಕ್ರಿಯೆಗಳ ವಿಧಿಯು ಸಾಂಗವಾಗಿ ನೆರವೇರದಿರುವ ಛಾಯೆ ಕಂಡುಬರುತ್ತಿದೆ. ಇದರಿಂದಾಗಿ ಎಷ್ಟೇ ಕಠಿಣ ಪರಿಶ್ರಮಪಟ್ಟರೂ ಕೈಗೆ ಬಂದ ಫಲ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ತಪ್ಪಿಹೋಗುವುದು, ಸಂತಾನ ವಿಳಂಬ ಅಥವಾ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪೂರ್ವಜರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದವಿದೆ. ಯಾವುದೇ ಗಂಭೀರ ಪಿತೃ ದೋಷವಿಲ್ಲ.`
    ),
    gokarnaSignificanceKn: sanitizeAstrologyKannadaText(
      `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣವು ದಕ್ಷಿಣ ಕಾಶಿ ಎಂದೇ ಪ್ರಸಿದ್ಧವಾಗಿದ್ದು, ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಹಾಗೂ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ನಾರಾಯಣ ಬಲಿ ಮತ್ತು ತಿಲ ಹವನವು 21 ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ನೀಡಿ, ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಭಾಗ್ಯೋದಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ.`
    )
  };

  // 3. Dynamic Homa Recommendations Pool
  const allHomas: YajnaHawanaItem[] = [];

  // HOMA 1: Chandi / Durga Hawana (ಶತ್ರು ಬಾಧೆ, 6ನೇ ಮನೆ, ಕುಜ-ರಾಹು ಸಂಯೋಗ)
  const is6thAfflicted = (mars && [6, 8, 12].includes(mars.house)) || (rahu && [6, 10].includes(rahu.house)) || context?.primaryChallenge === "Career / Workplace";
  allHomas.push({
    id: "homa_chandi",
    nameKn: "ಶ್ರೀ ಚಂಡಿಕಾ ಮಹಾ ಹವನ & ದುರ್ಗಾ ಸಪ್ತಶತಿ ಯಾಗ",
    nameEn: "Sri Chandi Maha Hawana & Durga Saptashati Yajna",
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

  // HOMA 2: Sudarshana Hawana (ನರ ದೃಷ್ಟಿ, ಆಸ್ತಿ ರಕ್ಷಣೆ, ಭಯ ನಿವಾರಣೆ)
  const isSudarshanaNeeded = (ketu && [1, 8, 12].includes(ketu.house)) || (moon && [8, 12, 6].includes(moon.house));
  allHomas.push({
    id: "homa_sudarshana",
    nameKn: "ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ ಹೋಮ & ನರಸಿಂಹ ಹವನ",
    nameEn: "Sri Maha Sudarshana Homa & Narasimha Hawana",
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

  // HOMA 3: Navagraha Maha Hawana (ನವಗ್ರಹ ಶಾಂತಿ)
  allHomas.push({
    id: "homa_navagraha",
    nameKn: "ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಯಜ್ಞ & ಗ್ರಹ ಪ್ರೀತಿ ಹವನ",
    nameEn: "Navagraha Shanti Maha Yajna & Planetary Alignment Hawana",
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
    allHomas.push({
      id: "homa_rahu_ketu_sandhi",
      nameKn: "ರಾಹು-ಕೇತು ಸರ್ಪ ಶಾಂತಿ & ಗುರು-ಚಂಡಾಲ ದೋಷ ನಿವಾರಣಾ ಹವನ",
      nameEn: "Rahu-Ketu Sarpa Shanti & Guru-Chandal Dosha Nivaran Hawana",
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
  allHomas.push({
    id: "homa_dasha_sandhi",
    nameKn: `ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಶಾಂತಿ ಹವನ (${maha} - ${bhukti} ಸಂಧಿ ಸಂಕಲ್ಪ)`,
    nameEn: `Dasha-Bhukti Sandhi Shanti Hawana (${maha} - ${bhukti} Transition)`,
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

  // HOMA 6: Mahamrityunjaya Homa & Ayushya Hawana (ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ಮಾಂದಿ ಶಾಂತಿ)
  const isMaandiLagnaOr8th = kundli.maandi && [1, 8].includes((((kundli.maandi.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1));
  allHomas.push({
    id: "homa_mrityunjaya",
    nameKn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾ ಯಾಗ & ಆಯುಷ್ಯ-ಮಾಂದಿ ಶಾಂತಿ ಹವನ",
    nameEn: "Mahamrityunjaya Maha Yajna & Ayushya-Maandi Shanti Hawana",
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

  // HOMA 7: Pitru Dosha & Narayana Bali (If Pitru dosha detected)
  if (hasPitruDosha) {
    allHomas.unshift({
      id: "homa_pitru_narayana_bali",
      nameKn: "ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ, ಪ್ರೇತೋದ್ಧಾರಣ & ಪಿತೃ ಮುಕ್ತಿ ತಿಲ ಹವನ",
      nameEn: "Sri Narayana Bali, Preta Uddharana & Pitru Mukti Tila Hawana",
      category: "pitru_narayana_bali",
      categoryLabelKn: "ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆ & ವಂಶೋದ್ಧಾರ",
      icon: "🌾",
      isUrgentPrimary: true,
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದ 9ನೇ ಪಿತೃ/ಭಾಗ್ಯ ಸ್ಥಾನ ಹಾಗೂ ರವಿ-ರಾಹುಗಳ ಸ್ಥಿತಿಯಿಂದಾಗಿ ಪೂರ್ವಜರ ಅತೃಪ್ತ ಆತ್ಮಗಳ ಪಿತೃ ದೋಷದ ಛಾಯೆಯಿದೆ. ಇದು ಕುಟುಂಬದಲ್ಲಿ ಸಂತಾನ ವಿಳಂಬ, ಅನಗತ್ಯ ಹಣದ ಸೋರಿಕೆ ಹಾಗೂ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದಿರಲು ಮುಖ್ಯ ಮೂಲ ಕಾರಣವಾಗಿದೆ.`
      ),
      astrologicalRootCauseEn: "Affliction to 9th Pitru/Bhagya house and Sun-Rahu connection manifesting ancestral Pitru Dosha.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥ ತೀರದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ವಿಧಾನ, ತಿಲ ಹವನ, ಪ್ರೇತೋದ್ಧಾರಣ ಶ್ರಾದ್ಧ, 16 ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಸಂತರ್ಪಣೆ.`
      ),
      sacredProcedureEn: "Narayana Bali rituals at sacred Gokarna Kotiteertha, Tila Havan, 16 Pinda Pradanam, and Brahmana Santarpana.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ದೊರೆತು ಅವರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ. ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ, ಸಂತಾನ ಭಾಗ್ಯ, ಕಂಕಣ ಭಾಗ್ಯ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಗಿತತೆಗಳು ತಕ್ಷಣವೇ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Liberation of ancestral souls, releasing profound blessings that clear generational obstacles in marriage, progeny, and wealth.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಪಿತೃ ದೋಷವಿದ್ದಾಗ ಇತರ ಯಾವುದೇ ಪೂಜೆ ಫಲ ಕೊಡುವುದಿಲ್ಲ; ಮೊದಲು ನಾರಾಯಣ ಬಲಿ ಮೂಲಕ ಪಿತೃ ಮುಕ್ತಿ ಮಾಡಿಸುವುದು ಪ್ರಥಮ ಕರ್ತವ್ಯ]`,
      priestSecretNoteEn: "[Astrologer Note: When Pitru Dosha is present, Narayana Bali is the paramount prerequisite before other rituals bear fruit]."
    });
  }

  // HOMA 8: Gokarna Atmalinga Rudrabhisheka
  allHomas.push({
    id: "homa_gokarna_abhisheka",
    nameKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ & ಪಂಚಾಮೃತ ಸೇವೆ",
    nameEn: "Sri Kshetra Gokarna Mahabaleshwara Atmalinga Mahabhisheka",
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

  // 4. Synergistic Combined Samputa Seva (3 to 4 Homas Combination)
  const primaryHomaNamesKn: string[] = [];
  if (hasPitruDosha) primaryHomaNamesKn.push("ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ & ತಿಲ ಹವನ");
  primaryHomaNamesKn.push("ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಯಜ್ಞ");
  if (is6thAfflicted) primaryHomaNamesKn.push("ಶ್ರೀ ಚಂಡಿಕಾ ಹವನ");
  else primaryHomaNamesKn.push("ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ ಹೋಮ");
  primaryHomaNamesKn.push("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ");

  const combinedSamputaSeva: CombinedSamputaSeva = {
    titleKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಚತುರ್ಮುಖ ಮಹಾ ಸಂಪುಟ ಸೇವೆ (${primaryHomaNamesKn.length} ಪ್ರಮುಖ ದೈವಿಕ ಹವನಗಳ ಸಂಯೋಜನೆ)`,
    titleEn: `Gokarna Chaturmukha Maha Samputa Seva (${primaryHomaNamesKn.length} Synergistic Homa Ensemble)`,
    includedHomasKn: primaryHomaNamesKn,
    synergyExplanationKn: sanitizeAstrologyKannadaText(
      `ಈ ೪ ಪ್ರಮುಖ ಹವನಗಳನ್ನು ಒಂದೇ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಸಂಪುಟ ರೂಪದಲ್ಲಿ ನೆರವೇರಿಸುವುದರಿಂದ: 1) ಪಿತೃ ಮುಕ್ತಿಯಿಂದ ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ, 2) ನವಗ್ರಹ ಶಾಂತಿಯಿಂದ ದಶಾ-ಗೋಚಾರ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ, 3) ಚಂಡಿಕಾ/ಸುದರ್ಶನ ಹವನದಿಂದ ಶತ್ರು-ದೃಷ್ಟಿ ಬಾಧೆಗಳು ಭಸ್ಮವಾಗುತ್ತವೆ, ಮತ್ತು 4) ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಅಭಿಷೇಕದಿಂದ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಶಾಶ್ವತವಾಗಿ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.`
    ),
    synergyExplanationEn: "Executing these synergistic homas in one unified auspicious muhurtha simultaneously cleanses ancestral debts, harmonizes planetary transits, crushes rival opposition, and secures eternal divine grace.",
    recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
      `ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನ, ಶನಿವಾರ, ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಪೌರ್ಣಮಿಯ ಪ್ರಾತಃಕಾಲದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ.`
    )
  };

  const overallAstrologicalPrescriptionSummaryKn = sanitizeAstrologyKannadaText(
    `ನಮಸ್ಕಾರ ${devotee}, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಸ್ತುತ ಗ್ರಹಗತಿಯ ಪ್ರಕಾರ, ಈ ನಿರ್ದಿಷ್ಟ ಯಜ್ಞ-ಹವನಗಳು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವನ್ನು ನಿರ್ಧರಿಸಲಿವೆ. ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಇವುಗಳನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ಮುಂಬರುವ 3 ರಿಂದ 5 ತಿಂಗಳುಗಳಲ್ಲಿ ನಿಮ್ಮ ಸಕಲ ಕಷ್ಟಗಳು ಕರಗಿ ಭಾಗ್ಯೋದಯವಾಗಲಿದೆ.`
  );

  return {
    recommendedHomas: allHomas,
    combinedSamputaSeva,
    pitruDoshaAssessment,
    overallAstrologicalPrescriptionSummaryKn
  };
}
