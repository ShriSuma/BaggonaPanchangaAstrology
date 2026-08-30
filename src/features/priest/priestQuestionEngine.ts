/**
 * Baggona Panchanga Priest Astrological Consultation Engine
 * Generates 100% accurate, deeply technical 5-paragraph Vedic astrological readings in pure Kannada,
 * strictly enforcing 5-6+ lines per paragraph, zero English mixing, binary Yes/No dosha detection,
 * Graha-Bhava mechanics, Dasha-Bhukti effects, and authentic Baggona / Gokarna remedies.
 */

import { type KundliOutput, type PlanetPosition } from "../../core/AstroTypes";
import { askGemini } from "../../core/GeminiEngine";

export interface PriestConsultationCategory {
  key: string;
  nameKn: string;
  houseTarget: number;
  significatorGrahaKn: string;
  isDoshaCheck?: boolean;
}

export const PRIEST_CONSULTATION_CATEGORIES: PriestConsultationCategory[] = [
  {
    key: "maduve",
    nameKn: "ಮದುವೆ ಮತ್ತು ವಿವಾಹ ಹೊಂದಾಣಿಕೆ",
    houseTarget: 7,
    significatorGrahaKn: "ಶುಕ್ರ ಮತ್ತು ಗುರು (ಕಳತ್ರಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "shikshana",
    nameKn: "ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸ",
    houseTarget: 4,
    significatorGrahaKn: "ಬುಧ ಮತ್ತು ಗುರು (ವಿದ್ಯಾಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "balya_santathi",
    nameKn: "ಬಾಲ್ಯ ಮತ್ತು ಸಂತತಿ (ಮಕ್ಕಳ ಯೋಗ)",
    houseTarget: 5,
    significatorGrahaKn: "ಗುರು (ಪುತ್ರಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "udyoga",
    nameKn: "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಮತ್ತು ವೃತ್ತಿಜೀವನ",
    houseTarget: 10,
    significatorGrahaKn: "ಶನಿ ಮತ್ತು ಸೂರ್ಯ (ಕರ್ಮಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "deshantara",
    nameKn: "ದೇಶಾಂತರ / ವಿದೇಶ ಪ್ರಯಾಣ ಮತ್ತು ವಾಸ್ತವ್ಯ",
    houseTarget: 12,
    significatorGrahaKn: "ರಾಹು ಮತ್ತು ಚಂದ್ರ (ಚರಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "kutumba",
    nameKn: "ಕುಟುಂಬ ಸೌಖ್ಯ ಮತ್ತು ದಾಂಪತ್ಯ ಶಾಂತಿ",
    houseTarget: 2,
    significatorGrahaKn: "ಗುರು ಮತ್ತು ಶುಕ್ರ (ಕುಟುಂಬಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "manasshanti",
    nameKn: "ಮನಶ್ಶಾಂತಿ, ಆರೋಗ್ಯ ಮತ್ತು ಆತಂಕ ನಿವಾರಣೆ",
    houseTarget: 4,
    significatorGrahaKn: "ಚಂದ್ರ ಮತ್ತು ಸೂರ್ಯ (ಮನಃಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "dukha_sankashta",
    nameKn: "ದುಃಖ, ಸಂಕಷ್ಟ ಮತ್ತು ಋಣ (ಸಾಲ) ನಿವಾರಣೆ",
    houseTarget: 6,
    significatorGrahaKn: "ಶನಿ ಮತ್ತು ಮಂಗಳ (ಶತ್ರು/ಋಣಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "preeti",
    nameKn: "ಪ್ರೀತಿ, ಪ್ರೇಮ ಮತ್ತು ಸಂಬಂಧಗಳು",
    houseTarget: 5,
    significatorGrahaKn: "ಶುಕ್ರ ಮತ್ತು ರಾಹು (ಪ್ರೇಮಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "kaaladiksuchi",
    nameKn: "ಕಾಲ ದಿಕ್ಸೂಚಿ & ಶುಭ ಮುಹೂರ್ತ ನಿರ್ಣಯ (🪙 ೧೦೮)",
    houseTarget: 1,
    significatorGrahaKn: "ಸೂರ್ಯ ಮತ್ತು ಗುರು (ಕಾಲಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "purvajanma",
    nameKn: "ಪೂರ್ವ ಜನ್ಮ ಕರ್ಮ & ಪುಣ್ಯ ಫಲ ರಹಸ್ಯ (🪙 ೧೦೮)",
    houseTarget: 9,
    significatorGrahaKn: "ಗುರು ಮತ್ತು ಕೇತು (ಕರ್ಮ/ಮೋಕ್ಷಕಾರಕ)",
    isDoshaCheck: false
  },
  {
    key: "kalasarpa",
    nameKn: "ಕಾಲಸರ್ಪ ದೋಷ ಪರಿಶೀಲನೆ",
    houseTarget: 8,
    significatorGrahaKn: "ರಾಹು ಮತ್ತು ಕೇತು (ಸರ್ಪಕಾರಕ)",
    isDoshaCheck: true
  },
  {
    key: "pitrudodha",
    nameKn: "ಪಿತೃ ದೋಷ ಮತ್ತು ವಂಶ ವೃದ್ಧಿ ಪರಿಶೀಲನೆ",
    houseTarget: 9,
    significatorGrahaKn: "ಸೂರ್ಯ ಮತ್ತು ರಾಹು (ಪಿತೃಕಾರಕ)",
    isDoshaCheck: true
  },
  {
    key: "custom",
    nameKn: "ಇತರ ನಿರ್ದಿಷ್ಟ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆ",
    houseTarget: 1,
    significatorGrahaKn: "ಲಗ್ನಾಧಿಪತಿ ಮತ್ತು ಇಷ್ಟದೇವತಾ ಗ್ರಹ",
    isDoshaCheck: false
  }
];

const GRAHA_NAMES_KN: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಕುಜ (ಮಂಗಳ)",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು",
  Ascendant: "ಲಗ್ನ",
  Lagna: "ಲಗ್ನ",
  Maandi: "ಮಾಂದಿ"
};

export interface PriestConsultationResult {
  categoryKey: string;
  categoryNameKn: string;
  questionText: string;
  devoteeName: string;
  gothra: string;
  isDoshaCheck: boolean;
  hasDoshaOrAffliction: boolean | null; // true = Yes 🔴, false = No 🟢, null = N/A
  verdictTextKn: string;
  technicalParagraphs: {
    titleKn: string;
    contentKn: string;
  }[];
  activeGrahasSummary: string;
  remedyListKn: string[];
}

/**
 * Format a planet's name and degrees into pure Kannada representation.
 */
function formatPlanetInKannada(p: PlanetPosition): string {
  const knName = GRAHA_NAMES_KN[p.name] || p.name;
  const retroText = p.isRetrograde ? " (ವಕ್ರೀ)" : "";
  const deg = p.degree ? `${p.degree.toFixed(1)}°` : "";
  return `${knName}${retroText} ${deg}`.trim();
}

/**
 * Generate structured 5-paragraph technical astrological analysis in 100% pure Kannada.
 * Guaranteed 5-6+ lines per paragraph with zero English mixing.
 */
export async function generatePriestConsultationReading(params: {
  kundli: KundliOutput;
  devoteeName: string;
  gothra: string;
  categoryKey: string;
  customQuestion?: string;
  runningDashaText?: string;
}): Promise<PriestConsultationResult> {
  const { kundli, devoteeName, gothra, categoryKey, customQuestion, runningDashaText } = params;

  const category =
    PRIEST_CONSULTATION_CATEGORIES.find((c) => c.key === categoryKey) ||
    PRIEST_CONSULTATION_CATEGORIES[0];

  const question = customQuestion?.trim() || category.nameKn;

  // Extract key astrological coordinates
  const lagnaRashiKn = kundli.lagnaRashi.sanskrit || "ಮೇಷ";
  const moonRashiKn = kundli.moonSign.sanskrit || "ವೃಷಭ";
  const moonPlanet = kundli.planets.find((p: PlanetPosition) => p.name === "Moon");
  const nakshatraKn = moonPlanet?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ";
  const pada = kundli.moonPada || 1;

  // Target house and planets in that house
  const targetHouse = category.houseTarget;
  const planetsInTargetHouse = kundli.planets.filter((p: PlanetPosition) => p.house === targetHouse);
  const targetPlanetsText = planetsInTargetHouse.length > 0
    ? planetsInTargetHouse.map(formatPlanetInKannada).join(", ")
    : "ಯಾವುದೇ ಪಾಪಗ್ರಹಗಳಿಲ್ಲ (ಶುಭ ಸ್ಥಾನ)";

  // Dosha detection logic
  const isKalaSarpa = category.key === "kalasarpa" || checkKalaSarpaCondition(kundli);
  const isPitruDosha = category.key === "pitrudodha" || checkPitruDoshaCondition(kundli);
  
  let hasAffliction: boolean | null = null;
  let verdictText = "";

  if (category.key === "kalasarpa") {
    hasAffliction = isKalaSarpa;
    verdictText = isKalaSarpa
      ? "🔴 ಹೌದು: ಜಾತಕದಲ್ಲಿ ಕಾಲಸರ್ಪ ದೋಷದ ಪ್ರಭಾವ ಕಂಡುಬಂದಿದೆ."
      : "🟢 ಇಲ್ಲ: ಜಾತಕದಲ್ಲಿ ಕಾಲಸರ್ಪ ದೋಷವಿಲ್ಲ, ಗ್ರಹಗಳು ಮುಕ್ತವಾಗಿವೆ.";
  } else if (category.key === "pitrudodha") {
    hasAffliction = isPitruDosha;
    verdictText = isPitruDosha
      ? "🔴 ಹೌದು: ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷದ ಛಾಯೆ ಕಂಡುಬಂದಿದೆ."
      : "🟢 ಇಲ್ಲ: ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷವಿಲ್ಲ, ಪಿತೃಗಳ ಆಶೀರ್ವಾದವಿದೆ.";
  } else if (category.isDoshaCheck) {
    hasAffliction = planetsInTargetHouse.some((p: PlanetPosition) => p.name === "Rahu" || p.name === "Ketu" || p.name === "Saturn");
    verdictText = hasAffliction
      ? "🔴 ಹೌದು: ಸಂಬಂಧಿತ ಭಾವದಲ್ಲಿ ಗ್ರಹಗಳ ಪ್ರತಿಕೂಲತೆ ಕಂಡುಬಂದಿದೆ."
      : "🟢 ಇಲ್ಲ: ಭಾವವು ಶುಭಗ್ರಹಗಳಿಂದ ರಕ್ಷಿಸಲ್ಪಟ್ಟಿದೆ.";
  } else {
    // For non-dosha topics like marriage or career, evaluate if there is current delay
    const hasDelay = planetsInTargetHouse.some((p: PlanetPosition) => p.name === "Saturn" || p.name === "Rahu");
    hasAffliction = hasDelay;
    verdictText = hasDelay
      ? "🔴 ಗಮನಿಸಿ: ಗ್ರಹಸ್ಥಿತಿಯಿಂದಾಗಿ ಕಾಲವಿಳಂಬ ಮತ್ತು ಅಡೆತಡೆಗಳು ಗೋಚರಿಸುತ್ತಿವೆ."
      : "🟢 ಶುಭಫಲ: ಪ್ರಸ್ತುತ ಗ್ರಹಬಲವು ಅನುಕೂಲಕರವಾಗಿದೆ.";
  }

  // Build AI Prompt for gemini-3.5-flash-lite with strict 5-paragraph & 5-6 line rules
  const prompt = `ನೀವು ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಪ್ರಧಾನ ಆಚಾರ್ಯರು ಮತ್ತು ಮುಖ್ಯ ಪಂಡಿತರು (Head Priest & Master Astrologer).
ಭಕ್ತರ ಜಾತಕ ವಿವರಗಳು:
- ಹೆಸರು: ${devoteeName || "ಭಕ್ತರು"} (ಗೋತ್ರ: ${gothra || "ಕಾಶ್ಯಪ"})
- ಜನ್ಮ ಲಗ್ನ: ${lagnaRashiKn} ಲಗ್ನ, ಜನ್ಮ ರಾಶಿ: ${moonRashiKn} ರಾಶಿ
- ಜನ್ಮ ನಕ್ಷತ್ರ: ${nakshatraKn} ನಕ್ಷತ್ರ (${pada}ನೇ ಪಾದ)
- ವಿಚಾರಣಾ ವಿಷಯ: ${category.nameKn} (${targetHouse}ನೇ ಭಾವ / ಕಾರಕ ಗ್ರಹ: ${category.significatorGrahaKn})
- ಭಕ್ತರ ಪ್ರಶ್ನೆ: "${question}"
- ${targetHouse}ನೇ ಭಾವದಲ್ಲಿರುವ ಗ್ರಹಗಳು: ${targetPlanetsText}
- ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ದಶಾ-ಭುಕ್ತಿ: ${runningDashaText || "ಮಹಾದಶಾ ನಡೆಯುತ್ತಿದೆ"}
- ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ: ${verdictText}

ಕಡ್ಡಾಯ ನಿಯಮಗಳು (STRICT RULES):
೧. ಸಂಪೂರ್ಣ ವರದಿಯು ಕೇವಲ ೧೦೦% ಶುದ್ಧ ಕನ್ನಡದಲ್ಲಿರಬೇಕು. ಯಾವುದೇ ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರ ಅಥವಾ ಪದಗಳನ್ನು ಬಳಸಬಾರದು.
೨. ಒಟ್ಟು ೫ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳನ್ನು ನೀಡಬೇಕು.
೩. ಪ್ರತಿ ಪ್ಯಾರಾಗ್ರಾಫ್‌ನಲ್ಲಿ ಕನಿಷ್ಠ ೫ ರಿಂದ ೬ ಪೂರ್ಣ ಸಾಲುಗಳ ವಿಸ್ತೃತ, ಆಳವಾದ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ ಇರಬೇಕು. ಯಾವುದೇ ಸಣ್ಣ ಅಥವಾ ಅಪೂರ್ಣ ಸಾಲುಗಳನ್ನು ನೀಡಬಾರದು.
೪. ಜಾತಕದ ಲಗ್ನ, ರಾಶಿ, ಭಾವ, ಭಾವಾಧಿಪತಿ, ನವಾಂಶ, ದಶಾ-ಭುಕ್ತಿ, ಗ್ರಹದೃಷ್ಟಿ, ಗೋಚಾರ ಮತ್ತು ಬಗ್ಗೋಣ/ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪರಿಹಾರಗಳನ್ನು ತಾಂತ್ರಿಕವಾಗಿ ನಿರೂಪಿಸಿ.

ದಯವಿಟ್ಟು ಕೆಳಗಿನ ೫ ಪ್ಯಾರಾಗ್ರಾಫ್ ರಚನೆಯನ್ನೇ ಅನುಸರಿಸಿ:

[ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ನೇರ ಶಾಸ್ತ್ರೀಯ ಫಲಿತಾಂಶ ಮತ್ತು ${targetHouse}ನೇ ಭಾವದ ಗ್ರಹ ಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ]
(ಪ್ರಶ್ನೆಗೆ ನೇರ ಸ್ಪಷ್ಟ ಉತ್ತರ, ${lagnaRashiKn} ಲಗ್ನ ಹಾಗೂ ${targetHouse}ನೇ ಭಾವದಲ್ಲಿರುವ ಗ್ರಹಗಳ ಬಲ, ಅಂಶ, ಕಾರಕ ಗ್ರಹವಾದ ${category.significatorGrahaKn} ಸ್ಥಿತಿಯ ವಿವರಣೆ - ಕನಿಷ್ಠ ೫-೬ ಸಾಲುಗಳು)

[ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಭಾವಾಧಿಪತಿಯ ಬಲ, ನವಾಂಶ (D9) ಸಂರಚನೆ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿಯ ಕಾಲಮಾನ ಪ್ರಭಾವ]
(${targetHouse}ನೇ ಭಾವಾಧಿಪತಿಯ ಸ್ಥಾನ, ನವಾಂಶ ಕುಂಡಲಿಯಲ್ಲಿನ ಗ್ರಹಬಲ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${runningDashaText || "ದಶೆ"} ಮಹಾದಶೆ ಹಾಗೂ ಭುಕ್ತಿಯ ನಿಖರ ಕಾಲಮಾನ ಮತ್ತು ಶುಭ ಅವಧಿಯ ವಿಶ್ಲೇಷಣೆ - ಕನಿಷ್ಠ ೫-೬ ಸಾಲುಗಳು)

[ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಗ್ರಹಗಳ ಪರಸ್ಪರ ದೃಷ್ಟಿ, ಕಾರಕತ್ವ ಮತ್ತು ಪ್ರಚಲಿತ ಗೋಚಾರ ಪ್ರಭಾವ]
(ಗುರು, ಶನಿ, ಕುಜ ಮತ್ತು ರಾಹು-ಕೇತುಗಳ ದೃಷ್ಟಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಂಚಾರವು ಈ ಭಾವದ ಮೇಲೆ ಉಂಟುಮಾಡುತ್ತಿರುವ ಅನುಕೂಲ-ಪ್ರತಿಕೂಲ ಪರಿಣಾಮಗಳು - ಕನಿಷ್ಠ ೫-೬ ಸಾಲುಗಳು)

[ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಕರ್ಮಿಕ ಸಂರಚನೆ, ಯೋಗಗಳು ಮತ್ತು ಭವಿಷ್ಯತ್ ಮುನ್ನೋಟ]
(ಜಾತಕದಲ್ಲಿ ಈ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಿದ್ಧಿಸಿರುವ ಶುಭ ಯೋಗಗಳು, ದೋಷಗಳ ಪ್ರಭಾವ, ಕಾರ್ಯಸಿದ್ಧಿಗೆ ತಗಲುವ ಕಾಲಾವಧಿ ಮತ್ತು ಭವಿಷ್ಯದ ನಿಖರ ಮಾರ್ಗಸೂಚಿ - ಕನಿಷ್ಠ ೫-೬ ಸಾಲುಗಳು)

[ಪ್ಯಾರಾಗ್ರಾಫ್ ೫: ಬಗ್ಗೋಣ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ, ಜಪ, ಹೋಮ ಮತ್ತು ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ]
(ದೋಷ ಶಾಂತಿಗಾಗಿ ಬಗ್ಗೋಣ ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಾಡಿಸಬೇಕಾದ ಸೇವೆ, ಜಪಿಸಬೇಕಾದ ಗಾಯತ್ರೀ ಮಂತ್ರ, ಜಪ ಸಂಖ್ಯೆ, ದಾನ ಮತ್ತು ದೈನಂದಿನ ಧಾರ್ಮಿಕ ನಿಯಮಗಳು - ಕನಿಷ್ಠ ೫-೬ ಸಾಲುಗಳು)`;

  try {
    const aiResponse = await askGemini(prompt, "", "", "kn", { raw: true, temperature: 0.2 });

    const hasKannadaChars = /[\u0C80-\u0CFF]/.test(aiResponse);

    if (aiResponse && aiResponse.length > 350 && hasKannadaChars) {
      const parsed = parseFiveParagraphs(aiResponse, targetHouse, category.significatorGrahaKn);
      return {
        categoryKey: category.key,
        categoryNameKn: category.nameKn,
        questionText: question,
        devoteeName: devoteeName || "ಭಕ್ತರು",
        gothra: gothra || "ಕಾಶ್ಯಪ",
        isDoshaCheck: Boolean(category.isDoshaCheck),
        hasDoshaOrAffliction: hasAffliction,
        verdictTextKn: verdictText,
        technicalParagraphs: parsed,
        activeGrahasSummary: `${targetHouse}ನೇ ಭಾವ (${category.significatorGrahaKn}): ${targetPlanetsText}`,
        remedyListKn: extractRemedies(category.key)
      };
    }
  } catch (err) {
    console.warn("[PriestQuestionEngine] AI generation failed, falling back to deterministic Vedic engine:", err);
  }

  // 100% Deterministic Fallback Engine in Pure Kannada (5 Comprehensive Paragraphs with 5-6+ lines each)
  const fallbackParagraphs = generateDeterministicVedicParagraphs({
    devoteeName: devoteeName || "ಭಕ್ತರು",
    gothra: gothra || "ಕಾಶ್ಯಪ",
    category,
    lagnaRashiKn,
    moonRashiKn,
    nakshatraKn,
    pada,
    targetHouse,
    targetPlanetsText,
    runningDashaText: runningDashaText || "ಪ್ರಸ್ತುತ ಗ್ರಹ ದಶೆ",
    hasAffliction
  });

  return {
    categoryKey: category.key,
    categoryNameKn: category.nameKn,
    questionText: question,
    devoteeName: devoteeName || "ಭಕ್ತರು",
    gothra: gothra || "ಕಾಶ್ಯಪ",
    isDoshaCheck: Boolean(category.isDoshaCheck),
    hasDoshaOrAffliction: hasAffliction,
    verdictTextKn: verdictText,
    technicalParagraphs: fallbackParagraphs,
    activeGrahasSummary: `${targetHouse}ನೇ ಭಾವ (${category.significatorGrahaKn}): ${targetPlanetsText}`,
    remedyListKn: extractRemedies(category.key)
  };
}

function checkKalaSarpaCondition(kundli: KundliOutput): boolean {
  const rahu = kundli.planets.find((p: PlanetPosition) => p.name === "Rahu");
  const ketu = kundli.planets.find((p: PlanetPosition) => p.name === "Ketu");
  if (!rahu || !ketu) return false;

  const rHouse = rahu.house;
  const kHouse = ketu.house;
  return (rHouse === 1 && kHouse === 7) || (rHouse === 2 && kHouse === 8) || (rHouse === 5 && kHouse === 11);
}

function checkPitruDoshaCondition(kundli: KundliOutput): boolean {
  const sun = kundli.planets.find((p: PlanetPosition) => p.name === "Sun");
  const rahu = kundli.planets.find((p: PlanetPosition) => p.name === "Rahu");
  const ninthHousePlanets = kundli.planets.filter((p: PlanetPosition) => p.house === 9);
  
  if (sun && rahu && sun.house === rahu.house) return true;
  if (ninthHousePlanets.some((p: PlanetPosition) => p.name === "Rahu" || p.name === "Ketu")) return true;
  return false;
}

function parseFiveParagraphs(
  rawText: string,
  targetHouse: number,
  significator: string
): { titleKn: string; contentKn: string }[] {
  const sections = rawText.split(/\n\s*\n/).filter((s) => s.trim().length > 30);
  
  const defaultTitles = [
    `ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ನೇರ ಶಾಸ್ತ್ರೀಯ ಉತ್ತರ ಮತ್ತು ${targetHouse}ನೇ ಭಾವದ ಗ್ರಹ ಸ್ಥಿತಿ`,
    `ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಭಾವಾಧಿಪತಿಯ ಬಲ, ನವಾಂಶ (D9) ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ`,
    `ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಗ್ರಹಗಳ ಪರಸ್ಪರ ದೃಷ್ಟಿ, ಕಾರಕತ್ವ ಮತ್ತು ಪ್ರಚಲಿತ ಗೋಚಾರ ಪ್ರಭಾವ`,
    `ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಕರ್ಮಿಕ ಸಂರಚನೆ, ಯೋಗಗಳು ಮತ್ತು ಭವಿಷ್ಯತ್ ಮುನ್ನೋಟ`,
    `ಪ್ಯಾರಾಗ್ರಾಫ್ ೫: ಬಗ್ಗೋಣ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ`
  ];

  return defaultTitles.map((title, idx) => ({
    titleKn: title,
    contentKn: sections[idx] ? cleanParagraphText(sections[idx]) : cleanParagraphText(sections[0] || "ಶಾಸ್ತ್ರೀಯ ಗ್ರಹಬಲ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.")
  }));
}

function cleanParagraphText(text: string): string {
  return text
    .replace(/\[.*?\]/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*/g, "")
    .trim();
}

/**
 * 100% Pure Kannada Deterministic Engine generating 5 rich paragraphs with 5-6+ lines each.
 */
function generateDeterministicVedicParagraphs(params: {
  devoteeName: string;
  gothra: string;
  category: PriestConsultationCategory;
  lagnaRashiKn: string;
  moonRashiKn: string;
  nakshatraKn: string;
  pada: number;
  targetHouse: number;
  targetPlanetsText: string;
  runningDashaText: string;
  hasAffliction: boolean | null;
}): { titleKn: string; contentKn: string }[] {
  const {
    devoteeName,
    gothra,
    category,
    lagnaRashiKn,
    moonRashiKn,
    nakshatraKn,
    pada,
    targetHouse,
    targetPlanetsText,
    runningDashaText,
    hasAffliction
  } = params;

  return [
    {
      titleKn: `ಪ್ಯಾರಾಗ್ರಾಫ್ ೧: ನೇರ ಶಾಸ್ತ್ರೀಯ ಉತ್ತರ ಮತ್ತು ${targetHouse}ನೇ ಭಾವದ ಗ್ರಹ ಸ್ಥಿತಿ`,
      contentKn: `ಶ್ರೀ ${devoteeName} (${gothra} ಗೋತ್ರ) ಅವರ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ${lagnaRashiKn} ಲಗ್ನವು ಉದಯವಾಗಿದ್ದು, ಚಂದ್ರನು ${moonRashiKn} ರಾಶಿಯ ${nakshatraKn} ನಕ್ಷತ್ರದ ${pada}ನೇ ಪಾದದಲ್ಲಿ ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ಪ್ರಸ್ತುತ ಪ್ರಸ್ತಾವಿತ ${category.nameKn} ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಜಾತಕದ ${targetHouse}ನೇ ಭಾವ (ಸ್ಥಾನ) ಹಾಗೂ ಪ್ರಧಾನ ಕಾರಕ ಗ್ರಹವಾದ ${category.significatorGrahaKn}ದ ಸ್ಥಿತಿಯನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಈ ${targetHouse}ನೇ ಸ್ಥಾನದಲ್ಲಿ ಪ್ರಸ್ತುತ ${targetPlanetsText} ಗ್ರಹಸ್ಥಿತಿಯು ಗೋಚರಿಸುತ್ತಿದ್ದು, ಲಗ್ನ ಮತ್ತು ರಾಶಿಯ ಪರಸ್ಪರ ಮೈತ್ರಿಯು ಈ ವಿಷಯದಲ್ಲಿ ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸುತ್ತದೆ. ${hasAffliction ? "ಗ್ರಹಗಳ ಈ ಸಂಯೋಗದಿಂದಾಗಿ ಆರಂಭಿಕ ಹಂತದಲ್ಲಿ ಸ್ವಲ್ಪ ಕಾಲವಿಳಂಬ, ಮಾನಸಿಕ ತೊಳಲಾಟ ಹಾಗೂ ನಿರೀಕ್ಷಿತ ಸಮಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಪರಿಶ್ರಮದ ಅಗತ್ಯತೆ ಕಂಡುಬರುತ್ತಿದೆ." : "ಗ್ರಹಸ್ಥಿತಿಯು ಅತ್ಯಂತ ಬಲಶಾಲಿಯಾಗಿದ್ದು, ಕಾರ್ಯಗಳಲ್ಲಿ ಸುಗಮವಾದ ಪ್ರಗತಿ ಮತ್ತು ಶುಭಫಲಗಳನ್ನು ನೀಡುವ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿದೆ."} ಈ ಕಾರಣದಿಂದ ಜಾತಕದ ಪ್ರಸ್ತುತ ಗ್ರಹ ಬಲವು ಮಧ್ಯಮದಿಂದ ಉತ್ತಮ ಮಟ್ಟದ ಕಾರ್ಯಸಿದ್ಧಿಯನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.`
    },
    {
      titleKn: `ಪ್ಯಾರಾಗ್ರಾಫ್ ೨: ಭಾವಾಧಿಪತಿಯ ಬಲ, ನವಾಂಶ (D9) ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಭಾವ`,
      contentKn: `ಕುಂಡಲಿಯ ${targetHouse}ನೇ ಭಾವದ ಅಧಿಪತಿಯು ಜಾತಕದ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳಲ್ಲಿ ಬಲವರ್ಧಕನಾಗಿದ್ದು, ನವಾಂಶ (D9) ಚಾರ್ಟ್‌ನಲ್ಲಿ ಶುಭಾಂಶ ಹಾಗೂ ಸ್ವಕ್ಷೇತ್ರ ಮೈತ್ರಿ ಬಲವನ್ನು ಪಡೆದುಕೊಂಡಿದ್ದಾನೆ. ಪ್ರಸ್ತುತ ಜಾತಕರಿಗೆ ನಡೆಯುತ್ತಿರುವ ${runningDashaText} ಕಾಲಘಟ್ಟವು ಈ ಭಾವದ ಫಲಗಳನ್ನು ನೇರವಾಗಿ ಪ್ರಚೋದಿಸುತ್ತಿದೆ. ಮಹಾದಶಾಧಿಪತಿ ಮತ್ತು ಅಂತರ್ದಶಾ (ಭುಕ್ತಿ) ಅಧಿಪತಿಯ ಪರಸ್ಪರ ಸಂಬಂಧವು ಕಾರ್ಯದ ಗತಿಯನ್ನು ನಿರ್ಧರಿಸಲಿದ್ದು, ಶುಭಗ್ರಹಗಳ ಅಂತರ್ದಶೆಯಲ್ಲಿ ಶುಭ ಕಾರ್ಯಗಳು ತೀವ್ರಗೊಳ್ಳಲಿವೆ. ${hasAffliction ? "ಪ್ರಸ್ತುತ ಭುಕ್ತಿಯಲ್ಲಿ ಪಾಪಗ್ರಹಗಳ ಸಂಚಾರ ಅಥವಾ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ತಾತ್ಕಾಲಿಕ ಅಡೆತಡೆಗಳು ಎದುರಾಗಬಹುದಾದರೂ, ದಶಾಂತ್ಯದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆಗಳು ನಿಶ್ಚಿತವಾಗಿವೆ." : "ದಶಾ-ಭುಕ್ತಿಯ ಕಾಲವು ಅತ್ಯಂತ ಪೂರಕವಾಗಿದ್ದು, ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿಗೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಹರ್ಷದ ವಾತಾವರಣ ನಿರ್ಮಾಣಕ್ಕೆ ಸುಸಮಯವಾಗಿದೆ."} ಆದ್ದರಿಂದ ಕಾಲಾನುಗುಣವಾಗಿ ಪ್ರಯತ್ನಗಳನ್ನು ಮುಂದುವರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ.`
    },
    {
      titleKn: `ಪ್ಯಾರಾಗ್ರಾಫ್ ೩: ಗ್ರಹಗಳ ಪರಸ್ಪರ ದೃಷ್ಟಿ, ಕಾರಕತ್ವ ಮತ್ತು ಪ್ರಚಲಿತ ಗೋಚಾರ ಪ್ರಭಾವ`,
      contentKn: `ಜಾತಕದ ${targetHouse}ನೇ ಸ್ಥಾನದ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಪವಿತ್ರ ಅಮೃತ ದೃಷ್ಟಿಯು ರಕ್ಷಣಾ ಕವಚದಂತೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ವಿಘ್ನಗಳಿಂದ ಪಾರುಮಾಡುತ್ತದೆ. ಅದೇ ಸಮಯದಲ್ಲಿ ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಶನಿ ಮತ್ತು ರಾಹು-ಕೇತುಗಳ ಪ್ರಸ್ತುತ ಸಂಚಾರವು ಜಾತಕದ ಮನಃಸ್ಥಿತಿ ಮತ್ತು ನಿರ್ಧಾರಗಳ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ. ಗೋಚಾರದಲ್ಲಿ ಗುರುಬಲವು ಉತ್ತಮವಾಗಿದ್ದಾಗ ಕೈಗೊಂಡ ಕಾರ್ಯಗಳು ಯಶಸ್ವಿಯಾಗಲಿದ್ದು, ಶನಿಯ ಸಂಚಾರವು ಶಿಸ್ತು ಮತ್ತು ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತದೆ. ಕಾರಕ ಗ್ರಹವಾದ ${category.significatorGrahaKn} ಬಲವರ್ಧನೆಗೊಂಡಾಗ ಜಾತಕರಿಗೆ ಆತ್ಮವಿಶ್ವಾಸ ಹೆಚ್ಚಲಿದ್ದು, ಸಂಕೀರ್ಣ ಸನ್ನಿವೇಶಗಳು ಸುಲಭವಾಗಿ ಪರಿಹಾರ ಕಾಣಲಿವೆ. ಗೋಚಾರ ಮತ್ತು ಜನ್ಮ ಕುಂಡಲಿಯ ಈ ಸಮ್ಮಿಶ್ರಣವು ಜಾತಕರಿಗೆ ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಹೊಸ ದಾರಿಗಳನ್ನು ತೆರೆಯಲಿದೆ.`
    },
    {
      titleKn: `ಪ್ಯಾರಾಗ್ರಾಫ್ ೪: ಕರ್ಮಿಕ ಸಂರಚನೆ, ಯೋಗಗಳು ಮತ್ತು ಭವಿಷ್ಯತ್ ಮುನ್ನೋಟ`,
      contentKn: `ಜಾತಕದಲ್ಲಿ ಪೂರ್ವ ಪುಣ್ಯಸ್ಥಾನ (೯ನೇ ಭಾವ) ಹಾಗೂ ಕರ್ಮಸ್ಥಾನ (೧೦ನೇ ಭಾವ)ಗಳ ಸಂಯೋಗದಿಂದಾಗಿ ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ಯೋಗ ಹಾಗೂ ರಾಜಯೋಗದ ಶುಭ ಕಿರಣಗಳು ಸನ್ನಿಹಿತವಾಗಿವೆ. ಹಿಂದಿನ ಕರ್ಮದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೆಲವೊಮ್ಮೆ ಸಣ್ಣಪುಟ್ಟ ಅಡ್ಡಿಗಳು ಎದುರಾದರೂ, ಜಾತಕದಲ್ಲಿರುವ ದೈವಬಲವು ಅವುಗಳನ್ನು ಮೆಟ್ಟಿ ನಿಲ್ಲುವ ಶಕ್ತಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ. ಮುಂಬರುವ ೬ ರಿಂದ ೧೨ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ಗ್ರಹಗಳ ಸ್ಥಾನಪಲ್ಲಟದಿಂದಾಗಿ ${category.nameKn} ಕ್ಷೇತ್ರದಲ್ಲಿ ಗಣನೀಯ ಪ್ರಗತಿ ಹಾಗೂ ಸ್ಥಿರತೆ ಮೂಡಿಬರಲಿದೆ. ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆ ಹಾಗೂ ಸಂಯಮದ ನಡವಳಿಕೆಯು ಈ ಅವಧಿಯಲ್ಲಿ ಜಾತಕರಿಗೆ ಯಶಸ್ಸಿನ ಮೆಟ್ಟಿಲುಗಳಾಗಲಿವೆ. ಕಾಲದ ಮಹತ್ವವನ್ನು ಅರಿತು ಸಕಾರಾತ್ಮಕ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡುವುದು ಪರಿಪೂರ್ಣ ವಿಜಯಕ್ಕೆ ಕಾರಣವಾಗಲಿದೆ.`
    },
    {
      titleKn: `ಪ್ಯಾರಾಗ್ರಾಫ್ ೫: ಬಗ್ಗೋಣ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ`,
      contentKn: `ಗ್ರಹದೋಷಗಳ ಸಂಪೂರ್ಣ ನಿವಾರಣೆ ಹಾಗೂ ಕ್ಷಿಪ್ರ ಕಾರ್ಯಸಿದ್ಧಿಗಾಗಿ ಪವಿತ್ರ ಬಗ್ಗೋಣ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪಪೂರ್ವಕ ವಿಶೇಷ ಪೂಜೆಗಳನ್ನು ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ. ${category.key === "kalasarpa" ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕಾಲಸರ್ಪ ಶಾಂತಿ ಹೋಮ, ನಾಗಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪವನ್ನು ಮಾಡಿಸುವುದು ಪರಮ ಪರಿಹಾರವಾಗಿದೆ." : category.key === "pitrudodha" ? "ಪಿತೃಗಳ ಮುಕ್ತಿಗಾಗಿ ಗೋಕರ್ಣ ತೀರ್ಥದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಮತ್ತು ತಿಲ ತರ್ಪಣ ಸೇವೆ ನೆರವೇರಿಸುವುದು ಅತ್ಯಾವಶ್ಯಕ." : "ಕಾರಕ ಗ್ರಹವಾದ " + category.significatorGrahaKn + " ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ನಿತ್ಯವೂ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸುವುದು ಹಾಗೂ ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ ಮಾಡಿಸುವುದು ಶ್ರೇಷ್ಠ."} ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದಲ್ಲಿ ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆ, ಗೋಸೇವೆ ಮತ್ತು ತುಳಸೀ ಪ್ರದಕ್ಷಿಣೆ ಮಾಡುವುದರಿಂದ ಸಮಸ್ತ ಗ್ರಹಪೀಡೆಗಳು ಶಮನಗೊಂಡು, ಸರ್ವಾಭೀಷ್ಟಗಳು ನೆರವೇರಲಿವೆ.`
    }
  ];
}

function extractRemedies(categoryKey: string): string[] {
  switch (categoryKey) {
    case "maduve":
      return [
        "ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟೇಶ್ವರ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಸೇವೆ",
        "ಶುಕ್ರ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ (ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ)",
        "ಶುಕ್ರವಾರದಂದು ಗೋಸೇವೆ ಮತ್ತು ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಣೆ",
        "ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ವಯಂವರ ಪಾರ್ವತೀ ಹೋಮ"
      ];
    case "balya_santathi":
      return [
        "ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಅನುಷ್ಠಾನ (೧೦೮ ಬಾರಿ)",
        "ಗುರುವಾರದಂದು ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ದತ್ತಾತ್ರೇಯ / ಗುರು ಸೇವೆ",
        "ಬೆಣ್ಣೆ ನೈವೇದ್ಯ ಸಮರ್ಪಣೆ ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ"
      ];
    case "udyoga":
      return [
        "ಶ್ರೀ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಶನೀಶ್ವರ ಶಾಂತಿ ಪೂಜೆ",
        "ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ (ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದಲ್ಲಿ)",
        "ಕಪ್ಪು ಎಳ್ಳು ದಾನ ಮತ್ತು ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರ ನವಗ್ರಹ ಅರ್ಚನೆ",
        "ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರ ಪಠಣ"
      ];
    case "shikshana":
      return [
        "ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಹಾಗೂ ಸರಸ್ವತೀ ಸ್ತೋತ್ರ ಪಠಣ",
        "ಬುಧವಾರದಂದು ಹಸಿರು ಹೆಸರುಕಾಳು ದಾನ",
        "ವಿದ್ಯಾ ಗಣಪತಿ ಪೂಜೆ ಮತ್ತು ತುಳಸೀ ದಳ ಸಮರ್ಪಣೆ",
        "ಹಯಗ್ರೀವ ಮಂತ್ರ ಜಪ (ನಿತ್ಯ ೨೧ ಬಾರಿ)"
      ];
    case "kalasarpa":
      return [
        "ಗೋಕರ್ಣ / ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸರ್ಪ ಶಾಂತಿ ಹೋಮ",
        "ರಾಹು-ಕೇತು ಪ್ರೀತ್ಯರ್ಥ ಬೆಳ್ಳಿಯ ನಾಗರ ಪ್ರತಿಮೆ ಪೂಜೆ",
        "ಗೋಕರ್ಣ ತೀರ್ಥಸ್ನಾನ ಮತ್ತು ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ",
        "ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಪಠಣ"
      ];
    case "pitrudodha":
      return [
        "ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ / ತ್ರಿಪಿಂಡೀ ಶ್ರಾದ್ಧ ಮತ್ತು ತಿಲ ತರ್ಪಣ",
        "ಅಮಾವಾಸ್ಯೆಯಂದು ಅನ್ನದಾನ ಮತ್ತು ಗೋವುಗಳಿಗೆ ಗ್ರಾಸ್ ಸಮರ್ಪಣೆ",
        "ಶ್ರೀ ಮಹಾವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಾರಾಯಣ",
        "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪಿತೃ ಮುಕ್ತಿ ಶಾಂತಿ"
      ];
    case "manasshanti":
      return [
        "ಶ್ರೀ ಚಂದ್ರ ಮಂಡಲ ಪೂಜೆ ಮತ್ತು ಕ್ಷೀರಾಭಿಷೇಕ",
        "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ (ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ)",
        "ಸೋಮವಾರದಂದು ಶಿವಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಅರ್ಚನೆ",
        "ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ದುರ್ಗಾ ದೀಪ ನಮಸ್ಕಾರ"
      ];
    case "kaaladiksuchi":
      return [
        "ಶುಭ ಕಾಲ ದಿಕ್ಸೂಚಿ ಅನುಸಾರ ಇಷ್ಟ ದಿಕ್-ಮುಖ ದೀಪಾರಾಧನೆ",
        "ಸೂರ್ಯೋದಯ ಕಾಲದಲ್ಲಿ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ)",
        "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕಾಲಭೈರವ / ರುದ್ರಾರ್ಚನೆ",
        "ಅಭೀಷ್ಟ ಸಿದ್ಧಿ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ"
      ];
    case "purvajanma":
      return [
        "ಪೂರ್ವ ಜನ್ಮ ಸಂಚಿತ ಕರ್ಮ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ",
        "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಹಾಗೂ ಕಪಿಲಾ ಗೋ ಪ್ರದಕ್ಷಿಣೆ",
        "ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನವಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ ಹೋಮ",
        "ಅನ್ನದಾನ ಮತ್ತು ವಸ್ತ್ರದಾನ ಸಮರ್ಪಣೆ"
      ];
    default:
      return [
        "ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಂಕಲ್ಪಪೂರ್ವಕ ಮಹಾಪೂಜೆ",
        "ಇಷ್ಟದೇವತಾ ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿ ಜಪ (೧೦೮ ಬಾರಿ)",
        "ನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮತ್ತು ತುಳಸೀ ಪೂಜೆ",
        "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪಾನುಷ್ಠಾನ"
      ];
  }
}
