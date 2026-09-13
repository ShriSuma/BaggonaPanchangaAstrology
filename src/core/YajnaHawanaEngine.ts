import { KundliOutput, PlanetName } from "./AstroTypes";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra, sanitizeAstrologyKannadaText } from "../utils/kannadaAstrologyTerms";
import { computeKundliInsights, signLord } from "./KundliInsightsEngine";

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
    | "gokarna_abhisheka"
    | "swayamvara_parvathi"
    | "santana_gopala"
    | "dhana_kubera"
    | "shani_shanti";
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

export interface YajnaHawanaContext {
  runningDashaMaha?: string;
  runningDashaBhukti?: string;
  primaryChallenge?: string;
  devoteeName?: string;
  dynamicTimelineKn?: string;
  devoteeAge?: number;
}

/**
 * 100% Dynamic Yajna, Hawana, Sandhi & Pitru Dosha Seva Calculation Engine.
 * Enforces strict Vedic separation between Pitru Karya (Apara) and Deva Karya (Shubha).
 * Features authentic child (<14) vs adult (>=14) ritual branching, chart-driven homa selection,
 * and astronomical planetary-hour / Lagna-lord muhurtha determination.
 */
export function generateYajnaHawanaPlan(
  kundli: KundliOutput,
  context?: YajnaHawanaContext
): YajnaHawanaEngineOutput {
  const devotee = context?.devoteeName || "ಭಕ್ತರೇ";
  const maha = context?.runningDashaMaha || "ಗುರು";
  const bhukti = context?.runningDashaBhukti || "ಶನಿ";
  const lagnaRashiKn = toKannadaRashi(kundli.lagnaRashi.english);
  const moonRashiKn = toKannadaRashi(kundli.moonSign.english);
  const moonNakKn = toKannadaNakshatra(kundli.planets.find(p => p.name === PlanetName.Moon)?.nakshatra.english);
  const insights = computeKundliInsights(kundli);

  // Age determination for child vs adult shastric separation
  const devoteeAge = context?.devoteeAge !== undefined ? context.devoteeAge : 30;
  const isChild = devoteeAge < 14;

  // Lagna Lord & Auspicious Weekday Determination
  const lagnaLord = signLord(kundli.lagnaRashi.index);
  const lagnaLordKn = toKannadaPlanet(lagnaLord);
  const dayLordMap: Record<PlanetName, string> = {
    [PlanetName.Sun]: "ಭಾನುವಾರ",
    [PlanetName.Moon]: "ಸೋಮವಾರ",
    [PlanetName.Mars]: "ಮಂಗಳವಾರ",
    [PlanetName.Mercury]: "ಬುಧವಾರ",
    [PlanetName.Jupiter]: "ಗುರುವಾರ",
    [PlanetName.Venus]: "ಶುಕ್ರವಾರ",
    [PlanetName.Saturn]: "ಶನಿವಾರ",
    [PlanetName.Rahu]: "ಶನಿವಾರ",
    [PlanetName.Ketu]: "ಮಂಗಳವಾರ"
  };
  const lagnaDayKn = dayLordMap[lagnaLord] || "ಗುರುವಾರ";

  // 1. Planet Lookups
  const sun = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);
  const saturn = kundli.planets.find((p) => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p) => p.name === PlanetName.Ketu);

  // =========================================================================
  // CHILD BRANCH: Devotee is a minor (<14 years)
  // Shastric Rule: Minor children do NOT perform Apara Karma (Pitru Shradha).
  // They receive pure Balagraha Shanti, Ayushya Dhanvantari, Medha Saraswati,
  // and Gokarna Mahabaleshwara Atmalinga Ksheerabhisheka.
  // =========================================================================
  if (isChild) {
    const childPitruAssessment: PitruDoshaAssessment = {
      hasPitruDosha: false,
      severity: "none",
      severityLabelKn: "ಮಕ್ಕಳಿಗೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ (ಪೂರ್ವಜರ ಶ್ರೀ ರಕ್ಷೆಯಿದೆ)",
      reasonsKn: [
        "ಧರ್ಮಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಅಪ್ರಾಪ್ತ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗೆ ಅಪರ ಕರ್ಮಗಳು (ಪಿತೃ ಕಾರ್ಯ) ಅನ್ವಯಿಸುವುದಿಲ್ಲ.",
        "ಮಗುವಿನ ಜಾತಕದಲ್ಲಿ ಪೂರ್ವಜರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದ ಹಾಗೂ ಶ್ರೀ ರಕ್ಷೆ ನೆಲೆಸಿದೆ."
      ],
      suggestedKaryaKn: "ಮಗುವಿನ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದ ಏಕಾಗ್ರತೆಗಾಗಿ ದೇವತಾ ಯಜ್ಞ ಮತ್ತು ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ ಮಾತ್ರ ಸಾಕು.",
      detailedExplanationKn: sanitizeAstrologyKannadaText(
        `ಧರ್ಮಶಾಸ್ತ್ರದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮದ ಪ್ರಕಾರ 14 ವರ್ಷದೊಳಗಿನ ಅಪ್ರಾಪ್ತ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗೆ ಅಪರ ಕರ್ಮಗಳು (ಪಿತೃ ಶ್ರಾದ್ಧ, ನಾರಾಯಣ ಬಲಿ) ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಮಗುವಿನ ಮೇಲೆ ಪೂರ್ವಜರ ದೈವಿಕ ರಕ್ಷಣೆಯಿದೆ. ಮಗುವಿಗೆ ನೇರವಾಗಿ ಬಾಲಾರಿಷ್ಟ ಶಾಂತಿ, ಆಯುಷ್ಯ ಧನ್ವಂತರಿ ಹವನ ಹಾಗೂ ಮೇಧಾ ಸರಸ್ವತಿ ಯಜ್ಞಗಳನ್ನು ಮಾಡಿಸುವುದರಿಂದ ಸಕಲ ಅರಿಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`
      ),
      gokarnaSignificanceKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಗಣಪತಿ ಪೂಜೆಯು ಮಗುವಿಗೆ ಜೀವಮಾನವಿಡೀ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.`
      ),
      shastraSeparationRuleKn: sanitizeAstrologyKannadaText(
        `ಧರ್ಮಶಾಸ್ತ್ರದ ನಿಯಮ: ಅಪ್ರಾಪ್ತ ವಯಸ್ಸಿನ ಮಕ್ಕಳಿಗೆ ಪಿತೃ ಅಪರ ಕರ್ಮಗಳು ವರ್ಜ್ಯ. ಕೇವಲ ಮಂಗಳಕರ ದೇವತಾ ಹವನಗಳು ಹಾಗೂ ನವಗ್ರಹ ಬಾಲ ರಕ್ಷೆಗಳನ್ನು ಮಾತ್ರ ನೆರವೇರಿಸಬೇಕು.`
      )
    };

    const childDevaHomas: YajnaHawanaItem[] = [
      {
        id: "child_balagraha_shanti",
        nameKn: "ಶ್ರೀ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಹವನ & ನವಗ್ರಹ ಬಾಲ ರಕ್ಷಾ ಸಂಕಲ್ಪ",
        nameEn: "Sri Balagraha Shanti Maha Hawana & Child Protective Shield",
        domain: "deva_karya",
        category: "shatru_raksha",
        categoryLabelKn: "ಬಾಲಾರಿಷ್ಟ ನಿವಾರಣೆ & ದೃಷ್ಟಿ ರಕ್ಷೆ",
        icon: "👶",
        isUrgentPrimary: true,
        astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ ${lagnaRashiKn} ಲಗ್ನ ಮತ್ತು ${moonRashiKn} ರಾಶಿಯ ಮೇಲೆ ಬಾಲಗ್ರಹಗಳ ಸೂಕ್ಷ್ಮ ತರಂಗಗಳಿರುವುದರಿಂದ, ಪದೇಪದೇ ದೃಷ್ಟಿ ದೋಷ, ನಿದ್ದೆಯಲ್ಲಿ ಬೆದರುವುದು, ಅಳುವುದು ಅಥವಾ ಕಿರಿಕಿರಿ ಉಂಟಾಗದಂತೆ ರಕ್ಷಣೆ ನೀಡಲು ಈ ಹವನ ಅತ್ಯಗತ್ಯ.`
        ),
        astrologicalRootCauseEn: "Subtle infant nodal aspects requiring Balagraha Shanti to prevent night startles, crying, and evil eye vulnerability.",
        sacredProcedureKn: sanitizeAstrologyKannadaText(
          `ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಾಲಗ್ರಹ ಸೂಕ್ತ ಜಪ, 9 ಬಾಲಗ್ರಹ ಸಮಿಧೆಗಳ ಹವನ, ದೃಷ್ಟಿ ದೋಷ ಪರಿಹಾರ ಹಾಗೂ ಮಂತ್ರ ಸಿದ್ಧ ರಕ್ಷಾ ದಾರ ಸಂಕಲ್ಪ.`
        ),
        sacredProcedureEn: "Balagraha Sukta recitation, 9 herbal offerings, evil eye dispelling, and consecrated protective thread sankalpa at Gokarna.",
        expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ ಅಳುವು, ಹಠ ಹಾಗೂ ನಿದ್ದೆಯ ಕಿರಿಕಿರಿ ಶಾಂತವಾಗುತ್ತದೆ. ಮಗುವಿಗೆ ಗಾಢವಾದ ನೆಮ್ಮದಿಯ ನಿದ್ದೆ, ಮುಗ್ಧ ನಗು ಹಾಗೂ ನಿರಂತರ ದೈವಿಕ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.`
        ),
        expectedShiftsAfterPoojaEn: "Restores deep peaceful sleep, dissolves restlessness and crying fits, securing serene joyful composure.",
        priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಬಾಲಗ್ರಹ ಶಾಂತಿಯು ಮಗುವಿನ ಸೂಕ್ಷ್ಮ ಆರಾ ಮಂಡಲವನ್ನು ಬಲಪಡಿಸಿ ಬಾಹ್ಯ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳಿಂದ ಕಾಪಾಡುತ್ತದೆ]`,
        priestSecretNoteEn: "[Astrologer Note: Balagraha Shanti strengthens the child's delicate aura against psychic disturbances]."
      },
      {
        id: "child_ayushya_dhanvantari",
        nameKn: "ಶ್ರೀ ಆಯುಷ್ಯ ಸೂಕ್ತ ಹವನ & ಧನ್ವಂತರಿ ಆರೋಗ್ಯ ಯಾಗ",
        nameEn: "Sri Ayushya Sukta Hawana & Dhanvantari Vitality Yajna",
        domain: "deva_karya",
        category: "mrityunjaya_ayushya",
        categoryLabelKn: "ಆರೋಗ್ಯ ಚೈತನ್ಯ & ರೋಗನಿರೋಧಕ ಶಕ್ತಿ",
        icon: "🩺",
        isUrgentPrimary: true,
        astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ ದೈಹಿಕ ಬೆಳವಣಿಗೆ, ಜೀರ್ಣಾಂಗ ಶಕ್ತಿ ಹಾಗೂ ರೋಗನಿರೋಧಕ ಸಾಮರ್ಥ್ಯವನ್ನು ನೂರ್ಮಡಿಗೊಳಿಸಲು ಹಾಗೂ ಬಾಲ್ಯದ ಅನಾರೋಗ್ಯಗಳಿಂದ ರಕ್ಷಿಸಲು ಆಯುಷ್ಯ ಸೂಕ್ತ ಯಾಗ ಶ್ರೇಷ್ಠ.`
        ),
        astrologicalRootCauseEn: "Invoking solar and Dhanvantari grace for physical vitality, robust digestive fire, and natural immunity.",
        sacredProcedureKn: sanitizeAstrologyKannadaText(
          `ಆಯುಷ್ಯ ಸೂಕ್ತದ ಪವಿತ್ರ ಋಕ್ಕುಗಳ ಆಹುತಿಗಳು, ಅಮೃತಬಳ್ಳಿ (ಗುಡೂಚಿ), ಶುದ್ಧ ತುಪ್ಪದ ಹವನ ಹಾಗೂ ಧನ್ವಂತರಿ ಆರೋಗ್ಯ ಮಂತ್ರಾರ್ಚನೆ.`
        ),
        sacredProcedureEn: "Ayushya Sukta chants with pure ghee and sacred Guduchi oblations at Gokarna Kshetra.",
        expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ ಜೀರ್ಣಶಕ್ತಿ ಉತ್ತಮಗೊಂಡು ಊಟ ಸುಲಭವಾಗಿ ಸೇರುತ್ತದೆ; ಸಣ್ಣಪುಟ್ಟ ಶೀತ, ಜ್ವರ ಅಥವಾ ಹೊಟ್ಟೆನೋವಿನ ಬಾಧೆಗಳಿಂದ ಮುಕ್ತಿ ದೊರೆತು ದೈಹಿಕ ತೇಜಸ್ಸು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.`
        ),
        expectedShiftsAfterPoojaEn: "Strengthens digestion and appetite, shielding the child from recurring seasonal ailments.",
        priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಆಯುಷ್ಯ ಹವನವು ಮಗುವಿನ ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸಿ ಆಯಸ್ಸು ಮತ್ತು ಬಲವನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ]`,
        priestSecretNoteEn: "[Astrologer Note: Ayushya Homa directly nourishes the child's Prana Shakti, expanding vital lifespan]."
      },
      {
        id: "child_medha_saraswati",
        nameKn: "ಶ್ರೀ ಮೇಧಾ ಸರಸ್ವತಿ ಹವನ & ಹಯಗ್ರೀವ ವಿದ್ಯಾ ಯಾಗ",
        nameEn: "Sri Medha Saraswati Hawana & Hayagriva Intellect Yajna",
        domain: "deva_karya",
        category: "navagraha",
        categoryLabelKn: "ಬುದ್ಧಿಶಕ್ತಿ, ಏಕಾಗ್ರತೆ & ವಾಕ್ ಸಿದ್ಧಿ",
        icon: "📚",
        isUrgentPrimary: true,
        astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ 5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ಮತ್ತು ಬುಧ-ಗುರು ಗ್ರಹಗಳ ಅನುಗ್ರಹದಿಂದ ಜ್ಞಾಪಕ ಶಕ್ತಿ, ಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಶಾಂತವಾದ ಸಂವಹನ ಕಲಿಯಲು ಈ ವಿದ್ಯಾ ಯಾಗ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`
        ),
        astrologicalRootCauseEn: "Activating 5th house intellect and Mercury-Jupiter harmonics for razor-sharp memory, focus, and verbal articulation.",
        sacredProcedureKn: sanitizeAstrologyKannadaText(
          `ಶ್ರೀ ಮೇಧಾ ಸೂಕ್ತ ಜಪ, ಸರಸ್ವತಿ ಮೂಲ ಮಂತ್ರ ಸಹಿತ ಹಸುವಿನ ತುಪ್ಪ ಮತ್ತು ಜೇನುತುಪ್ಪದ ಹವನ ಹಾಗೂ ಸರಸ್ವತಿ ಯಂತ್ರ/ಲೇಖನಿ ಪೂಜೆ.`
        ),
        sacredProcedureEn: "Medha Sukta invocations with sacred honey-ghee ahutis and consecration of writing instruments at Gokarna.",
        expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
          `ಓದುವುದರಲ್ಲಿ ಆಸಕ್ತಿ, ಉತ್ತಮ ಗ್ರಹಣ ಶಕ್ತಿ, ಚುರುಕಾದ ಬುದ್ಧಿ ಹಾಗೂ ಶಾಂತ ನಡವಳಿಕೆ ಮಗುವಿನಲ್ಲಿ ಬೆಳೆಯುತ್ತದೆ.`
        ),
        expectedShiftsAfterPoojaEn: "Sparks enthusiasm for learning, enhanced retention power, and peaceful articulate communication.",
        priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಸರಸ್ವತಿ ಹವನವು ಮಗುವಿನ ಜ್ಞಾನ ನರಮಂಡಲವನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಪ್ರಥಮ ಸ್ಥಾನ ತರುತ್ತದೆ]`,
        priestSecretNoteEn: "[Astrologer Note: Saraswati Hawana attunes neural memory pathways for effortless intellectual mastery]."
      },
      {
        id: "child_gokarna_abhisheka",
        nameKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ಗಣಪತಿ ಪೂಜೆ",
        nameEn: "Sri Kshetra Gokarna Atmalinga Ksheerabhisheka & Ganapati Pooja",
        domain: "deva_karya",
        category: "gokarna_abhisheka",
        categoryLabelKn: "ಭೂಕೈಲಾಸ ಸಾನ್ನಿಧ್ಯ ಬಾಲ ರಕ್ಷೆ",
        icon: "🪔",
        isUrgentPrimary: true,
        astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿನ ಸಮಗ್ರ ಆಯುರ್-ಆರೋಗ್ಯ, ಧೈರ್ಯ ಹಾಗೂ ಕುಲದೇವರ ಪೂರ್ಣಾನುಗ್ರಹಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ಸಾಕ್ಷಾತ್ ಆತ್ಮಲಿಂಗ ಪ್ರಾರ್ಥನೆ.`
        ),
        astrologicalRootCauseEn: "Comprehensive divine protection and family Kuladevata grace at the Bho-Kailasa Atmalinga shrine.",
        sacredProcedureKn: sanitizeAstrologyKannadaText(
          `ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಹಸುವಿನ ಹಾಲಿನ ಕ್ಷೀರಾಭಿಷೇಕ, ಬಿಲ್ವಾರ್ಚನೆ, ದ್ವಿಭುಜ ಗಣಪತಿಗೆ ಮೋದಕ ನೈವೇದ್ಯ ಹಾಗೂ ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆ.`
        ),
        sacredProcedureEn: "Sacred cow milk Ksheerabhisheka, Bilva archana at Atmalinga, and Ganapati Modaka archana in the child's name.",
        expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
          `ಮಗುವಿಗೆ ಸದಾ ದೈವಿಕ ರಕ್ಷಾ ಕವಚವಿದ್ದು, ಯಾವುದೇ ಆಕಸ್ಮಿಕ ಭಯ, ದುಃಸ್ವಪ್ನ ಅಥವಾ ಕಷ್ಟಗಳು ತಟ್ಟದಂತೆ ಮಹಾಬಲೇಶ್ವರನು ಸದಾ ಕಾಪಾಡುತ್ತಾನೆ.`
        ),
        expectedShiftsAfterPoojaEn: "Imbues the child with an impervious spiritual shield, dispelling all night terrors and insecurities.",
        priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕವು ಮಗುವಿನ ಜೀವಿತಾವಧಿಗೆ ಅತ್ಯುನ್ನತ ಪುಣ್ಯ ಫಲವನ್ನು ಕರುಣಿಸುತ್ತದೆ]`,
        priestSecretNoteEn: "[Astrologer Note: Gokarna Ksheerabhisheka establishes lifelong divine auspices for the child]."
      }
    ];

    const childSchedule: CombinedSacredSchedule = {
      scheduleType: "single_day_deva_samputa",
      titleKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಾಲ ಸಂರಕ್ಷಣಾ & ಮೇಧಾ ದೇವತಾ ಸಂಪುಟ ಮಹಾ ಸೇವೆ",
      titleEn: "Gokarna Child Protection & Divine Intellect Samputa Yajna",
      stage2DevaKarya: {
        dayLabelKn: "ಬಾಲ ಸಂರಕ್ಷಣಾ ದೇವತಾ ಯಾಗ (ದಿನ 1)",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ",
        ritualsKn: [
          "ಶ್ರೀ ಬಾಲಗ್ರಹ ಶಾಂತಿ ಹವನ",
          "ಆಯುಷ್ಯ ಧನ್ವಂತರಿ ಯಾಗ",
          "ಮೇಧಾ ಸರಸ್ವತಿ ಹೋಮ",
          "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ"
        ],
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಧರ್ಮಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಅಪ್ರಾಪ್ತ ವಯಸ್ಸಿನ ಮಗುವಿಗೆ ಪಿತೃ ಕಾರ್ಯ ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಆದ್ದರಿಂದ ನೇರವಾಗಿ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಾಲಗ್ರಹ ಶಾಂತಿ, ಧನ್ವಂತರಿ ಯಾಗ, ಸರಸ್ವತಿ ಹೋಮ ಹಾಗೂ ಕ್ಷೀರಾಭಿಷೇಕಗಳನ್ನು ಒಂದೇ ಶುಭ ದಿನದಂದು ಸಂಪುಟವಾಗಿ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ."
        )
      },
      synergyExplanationKn: sanitizeAstrologyKannadaText(
        "ಈ ಪವಿತ್ರ ಬಾಲ ಸಂಪುಟ ಯಾಗದಿಂದ ಮಗುವಿನ ಅಳುವು, ಹಠ, ದೃಷ್ಟಿ ದೋಷ ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಉತ್ತಮ ಆರೋಗ್ಯ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಏಕಾಗ್ರತೆ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
      ),
      synergyExplanationEn: "This child-specific single-day samputa dissolves infant restlessness and evil eye, bestowing longevity, immunity, and sharp academic intellect.",
      recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
        `ಮಗುವಿನ ${lagnaRashiKn} ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದಿನವಾದ ${lagnaDayKn}ದಂದು, ${moonNakKn} ನಕ್ಷತ್ರಕ್ಕೆ ತಾರಾಬಲ ಕೂಡಿಬರುವ ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಪಂಚಮಿ, ಸಪ್ತಮಿ, ದಶಮಿ ಅಥವಾ ಪೌರ್ಣಮಿಯ ಪ್ರಾತಃಕಾಲ 06:30 ರಿಂದ 09:00 ರ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ.`
      )
    };

    return {
      pitruKaryas: [],
      devaHomas: childDevaHomas,
      combinedSchedule: childSchedule,
      pitruDoshaAssessment: childPitruAssessment,
      overallAstrologicalPrescriptionSummaryKn: sanitizeAstrologyKannadaText(
        `ನಮಸ್ಕಾರ ${devotee}, ನಿಮ್ಮ ಮಗುವಿನ ಜಾತಕದ ಪ್ರಕಾರ, ಮಗುವಿನ ಮೇಲೆ ಪೂರ್ವಜರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದವಿದೆ. ಮಗುವಿಗೆ ಯಾವುದೇ ಪಿತೃ ಕಾರ್ಯದ ಅಗತ್ಯವಿಲ್ಲ. ಈ 4 ಬಾಲ ರಕ್ಷಾ ದೇವತಾ ಹವನಗಳನ್ನು ಗೋಕರ್ಣದಲ್ಲಿ ಮಾಡಿಸುವುದರಿಂದ ಮಗು ಸದಾ ನಗುಮುಖದಿಂದ, ಆರೋಗ್ಯವಂತವಾಗಿ ಹಾಗೂ ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಬೆಳೆಯಲಿದೆ.`
      )
    };
  }

  // =========================================================================
  // ADULT BRANCH: Devotee is an adult (>=14 years)
  // Dynamic Pitru Assessment + Dynamic Homa Selection + Dynamic Muhurtha
  // =========================================================================

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
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ 9ನೇ ಪಿತೃ ಸ್ಥಾನ, ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ರವಿಯ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ: ${pitruReasonsKn.join("; ")} ಕಾರಣಗಳಿಂದಾಗಿ ಹಿಂದಿನ ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಅಥವಾ ಅಪರ ಕರ್ಮಗಳ ವಿಧಿಯು ಸಾಂಗವಾಗಿ ನೆರವೇರದಿರುವ ಛಾಯೆ ಕಂಡುಬರುತ್ತಿದೆ. ಇದರಿಂದಾಗಿ ಎಷ್ಟೇ ಕಠಿಣ ಪರಿಶ್ರಮಪಟ್ಟರೂ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೆಲಸ ತಪ್ಪಿಹೋಗುವುದು, ಸಂತಾನ ವಿಳಂಬ ಅಥವಾ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಉಂಟಾಗುತ್ತದೆ.`
        : `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪೂರ್ವಜರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದವಿದೆ. ಯಾವುದೇ ಗಂಭೀರ ಪಿತೃ ದೋಷವಿಲ್ಲ.`
    ),
    gokarnaSignificanceKn: sanitizeAstrologyKannadaText(
      `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣವು ದಕ್ಷಿಣ ಕಾಶಿ ಎಂದೇ ಪ್ರಸಿದ್ಧವಾಗಿದ್ದು, ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಹಾಗೂ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಮತ್ತು ತಿಲ ಹವನವು 21 ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ನೀಡಿ, ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಭಾಗ್ಯೋದಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ.`
    ),
    shastraSeparationRuleKn: sanitizeAstrologyKannadaText(
      `ಧರ್ಮಶಾಸ್ತ್ರದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮ: ಪಿತೃ ಕಾರ್ಯ (ಅಪರ ಕರ್ಮ) ಮತ್ತು ದೇವತಾ ಕಾರ್ಯ (ಶುಭ ಹವನ) ಎರಡನ್ನೂ ಎಂದಿಗೂ ಒಂದೇ ದಿನ ಅಥವಾ ಒಂದೇ ಮುಹೂರ್ತದಲ್ಲಿ ಜೊತೆಯಾಗಿ ಮಾಡಬಾರದು. ಮೊದಲು ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ಮುಕ್ತಿ ನೆರವೇರಿಸಿ, 1 ದಿನದ ಶೌಚ-ಶುದ್ಧಿ & ವಿಶ್ರಾಂತಿ ಪಡೆದ ನಂತರವೇ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶುಭ ದೇವತಾ ಹವನಗಳನ್ನು ನೆರವೇರಿಸಬೇಕು.`
    )
  };

  // ==========================================
  // SECTION 1: PITRU KARYAS (ಅಪರ ಕರ್ಮ / ಮುಕ್ತಿ)
  // ==========================================
  const pitruKaryas: YajnaHawanaItem[] = [];

  if (hasPitruDosha) {
    // Dynamic Root Cause composed from detected reasons
    const dynamicPitruCauseKn = pitruReasonsKn.length > 0
      ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${pitruReasonsKn.join(" ಮತ್ತು ")} ಕಂಡುಬರುತ್ತಿದೆ. ಇದರಿಂದಾಗಿ ಹಿಂದಿನ ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮ ತೃಪ್ತಿಯ ಕೊರತೆ ಹಾಗೂ ಕರ್ಮ ಋಣದ ಛಾಯೆ ಉಂಟಾಗಿ, ${context?.primaryChallenge ? `ಪ್ರಮುಖವಾಗಿ ${context.primaryChallenge} ವಿಷಯದಲ್ಲಿ` : "ಪ್ರಮುಖ ಕಾರ್ಯಗಳಲ್ಲಿ"} ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ ಹಾಗೂ ಸ್ಥಗಿತತೆಗಳು ಎದುರಾಗುತ್ತಿವೆ.`
      : `ನಿಮ್ಮ ಜಾತಕದ 9ನೇ ಪಿತೃ ಸ್ಥಾನ ಮತ್ತು ರವಿಯ ಸೂಕ್ಷ್ಮ ಸ್ಥಿತಿಯ ಪ್ರಕಾರ ಪೂರ್ವಜರ ತರ್ಪಣ ಕರ್ಮಗಳ ಶಾಂತಿ ಅಗತ್ಯವಿದೆ.`;

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
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(dynamicPitruCauseKn),
      astrologicalRootCauseEn: "9th house affliction and nodal pressures causing ancestral unrest and generational blockages.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ ತೀರದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ವಿಧಿ, ಬ್ರಹ್ಮ-ವಿಷ್ಣು-ರುದ್ರ-ಯಮ-ಪ್ರೇತ ಆವಾಹನೆ, 16 ಪಿಂಡ ಪ್ರದಾನ, ಪ್ರಾಯಶ್ಚಿತ್ತ ತಿಲ ಹವನ ಹಾಗೂ ಗೋ ಪ್ರದಾನ.`
      ),
      sacredProcedureEn: "Narayana Bali rituals at Gokarna Kotiteertha with Brahma-Vishnu-Rudra invocations, 16 Pinda Pradanam, and Tila Havan.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಶಾಶ್ವತ ಮುಕ್ತಿ ದೊರೆತು ಅವರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ. ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ, ಸಂತಾನ ಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಒಗ್ಗಟ್ಟು ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಗಿತತೆಗಳು ತಕ್ಷಣವೇ ನಿವಾರಣೆಯಾಗುತ್ತವೆ.`
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
        `ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನದ 9ನೇ ಪಿತೃ ಸ್ಥಾನ ಮತ್ತು ರವಿಯ ಸ್ಥಿತಿಯ ಪ್ರಕಾರ, ತಂದೆ, ತಾತ, ಮುತ್ತಾತ ಮೂರು ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಶ್ರಾದ್ಧ ತರ್ಪಣಗಳು ಲೋಪವಾಗಿದ್ದಾಗ ಅಥವಾ ಅಕಾಲಿಕ ನಿಧನರಾದ ಆತ್ಮಗಳ ತೃಪ್ತಿಗಾಗಿ ಈ ಶಾಂತಿ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.`
      ),
      astrologicalRootCauseEn: "Pacification for three generational ancestral lines and unfulfilled death rites.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಬ್ರಹ್ಮ, ವಿಷ್ಣು ಮತ್ತು ರುದ್ರ ದೇವತೆಗಳಿಗೆ 3 ಪಿಂಡಗಳ ಅರ್ಪಣೆ (ತಾಮ್ರ, ಬೆಳ್ಳಿ, ಬಂಗಾರ ಸಂಕಲ್ಪ), ಯವ-ತಿಲ ತರ್ಪಣ ಹಾಗೂ ಗೋಕರ್ಣ ಪುಣ್ಯ ಸ್ನಾನ.`
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

  // =========================================================================
  // SECTION 2: DEVA KARYAS (ದೇವತಾ ಯಜ್ಞ & ಶುಭ ಹವನಗಳು - 100% Dynamic Selection)
  // =========================================================================
  const devaHomasPool: YajnaHawanaItem[] = [];

  // HOMA A: Marriage & Relationship Affliction (Swayamvara Parvathi & Uma-Maheshwara)
  const isKujaDosha = mars && [1, 2, 4, 7, 8, 12].includes(mars.house);
  const isMarriageChallenge = context?.primaryChallenge === "Personal / Marriage" || Boolean(isKujaDosha);
  if (isMarriageChallenge) {
    devaHomasPool.push({
      id: "homa_swayamvara_parvathi",
      nameKn: "ಶ್ರೀ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಮಹಾ ಹವನ & ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಯಾಗ",
      nameEn: "Sri Swayamvara Parvathi Maha Hawana & Uma-Maheshwara Yajna",
      domain: "deva_karya",
      category: "swayamvara_parvathi",
      categoryLabelKn: "ವಿವಾಹ ಸಿದ್ಧಿ & ದಾಂಪತ್ಯ ಸೌಖ್ಯ",
      icon: "💍",
      isUrgentPrimary: context?.primaryChallenge === "Personal / Marriage",
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಕುಜ ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಂಕಣ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬ, ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ ಅಥವಾ ಅನಿಶ್ಚಿತತೆ ಉಂಟಾಗುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "7th house marriage axis and Venus-Mars afflictions causing delays in match finalization and marital friction.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಮಹಾ ಮಂತ್ರದ 1008 ಆಹುತಿಗಳು, ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ, ಕುಂಕುಮಾರ್ಚನೆ ಹಾಗೂ ಮಲ್ಲಿಗೆ-ಪದ್ಮ ಪುಷ್ಪಗಳ ಹವನ.`
      ),
      sacredProcedureEn: "1008 Swayamvara Parvathi chants, Uma-Maheshwara sacred union sankalpa, Kumkumarchana, and floral oblations at Gokarna.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ವಿವಾಹದ ದಾರಿಯಲ್ಲಿನ ಕಠಿಣ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ, ಯೋಗ್ಯ ಬಾಳಸಂಗಾತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತಾರೆ. ದಾಂಪತ್ಯದಲ್ಲಿ ಪ್ರೀತಿ, ವಿಶ್ವಾಸ ಹಾಗೂ ಸೌಹಾರ್ದತೆ ನೆಲೆಸುತ್ತದೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Dissolves wedding obstacles, attracting an ideal life partner and deepening mutual marital trust.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹವನವು ಕುಜ ದೋಷ ಹಾಗೂ 7ನೇ ಮನೆಯ ನಕಾರಾತ್ಮಕ ತರಂಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಶಮನಗೊಳಿಸುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Swayamvara Parvathi Hawana neutralizes Kuja Dosha and restores harmonious marital union]."
    });
  }

  // HOMA B: Progeny / Intellect / 5th House Affliction (Santana Gopala & Subrahmanya)
  const is5thAfflicted = (rahu && rahu.house === 5) || (saturn && saturn.house === 5) || (jupiter && [6, 8, 12].includes(jupiter.house)) || context?.primaryChallenge === "Children";
  if (is5thAfflicted) {
    devaHomasPool.push({
      id: "homa_santana_gopala",
      nameKn: "ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾ ಯಾಗ & ಸುಬ್ರಹ್ಮಣ್ಯ ಹವನ",
      nameEn: "Sri Santana Gopala Maha Yajna & Subrahmanya Hawana",
      domain: "deva_karya",
      category: "santana_gopala",
      categoryLabelKn: "ಸಂತಾನ ಭಾಗ್ಯ & ವಂಶಾಭಿವೃದ್ಧಿ",
      icon: "👶",
      isUrgentPrimary: context?.primaryChallenge === "Children",
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದ 5ನೇ ಪೂರ್ವಪುಣ್ಯ/ಸಂತಾನ ಸ್ಥಾನದಲ್ಲಿ ಪಾಪಗ್ರಹಗಳ ಸ್ಥಿತಿ ಅಥವಾ ಗುರು ಗ್ರಹದ ಬಲಹೀನತೆಯಿಂದಾಗಿ ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ವಿಳಂಬ ಅಥವಾ ಸಂತಾನ ಚಿಂತೆ ಕಾಡುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "5th house progeny axis affliction and Jupiter debility requiring Santana Gopala invocation.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಜಪ, ಗೋಕ್ಷೀರ ಪಾಯಸ ಹವನ, ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ ಪಠಣ ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ನವಗ್ರಹ ಫಲ ಪ್ರದಾನ.`
      ),
      sacredProcedureEn: "Santana Gopala mantra recitation with consecrated cow milk payasa oblations and Subrahmanya archana at Gokarna.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ದಾರಿಯಲ್ಲಿನ ದೈಹಿಕ ಮತ್ತು ಕರ್ಮಿಕ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ಸದ್ಗುಣ ಸಂಪನ್ನ ವಂಶೋದ್ಧಾರಕ ಸಂತಾನ ಭಾಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Clears generational and energetic blockages to parenthood, blessing the family with healthy progeny.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಸಂತಾನ ಗೋಪಾಲ ಯಾಗವು 5ನೇ ಭಾವದ ಪೂರ್ವ ಕರ್ಮಗಳನ್ನು ಶುದ್ಧೀಕರಿಸಿ ವಂಶಾಭಿವೃದ್ಧಿ ತರುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Santana Gopala Hawana purifies 5th house karmic blockages, blessing generational continuity]."
    });
  }

  // HOMA C: Financial / Wealth / Debt Crisis (Sri Sukta & Kanakadhara Kubera)
  const isWealthAfflicted = context?.primaryChallenge === "Financial / Debts" || (saturn && [2, 8, 11].includes(saturn.house)) || (mars && [2, 8].includes(mars.house)) || (rahu && [2, 8, 11].includes(rahu.house));
  if (isWealthAfflicted) {
    devaHomasPool.push({
      id: "homa_sri_sukta_kubera",
      nameKn: "ಶ್ರೀ ಸೂಕ್ತ ಮಹಾ ಹವನ & ಕನಕಧಾರಾ ಕುಬೇರ ಯಾಗ",
      nameEn: "Sri Sukta Maha Hawana & Kanakadhara Kubera Yajna",
      domain: "deva_karya",
      category: "dhana_kubera",
      categoryLabelKn: "ಧನ ಪ್ರಾಪ್ತಿ & ಸಾಲ ಮುಕ್ತಿ",
      icon: "💰",
      isUrgentPrimary: context?.primaryChallenge === "Financial / Debts",
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ನಿಮ್ಮ ಜಾತಕದ 2ನೇ ಧನಭಾವ, 8ನೇ ರಂಧ್ರಭಾವ ಹಾಗೂ 11ನೇ ಲಾಭಸ್ಥಾನದ ಮೇಲಿನ ಗ್ರಹ ಸಂಘರ್ಷದಿಂದಾಗಿ ಹಠಾತ್ ಧನವ್ಯಯ, ಸಾಲದ ಹೊರೆ ಹಾಗೂ ಆದಾಯದ ಹರಿವಿನಲ್ಲಿ ಅಡೆತಡೆಗಳು ಎದುರಾಗುತ್ತಿವೆ.`
      ),
      astrologicalRootCauseEn: "2nd/8th/11th house axis conflicts causing unexpected financial leakages, debt liabilities, and cash flow strain.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶ್ರೀ ಸೂಕ್ತದ 16 ಋಕ್ಕುಗಳ ಸಹಸ್ರ ಆಹುತಿಗಳು, ಕಮಲದ ಹೂವು, ಬಿಲ್ವಫಲ, ಜೇನುತುಪ್ಪದ ಹವನ ಹಾಗೂ ಕನಕಧಾರಾ ಕುಬೇರ ಯಂತ್ರ ಆರಾಧನೆ.`
      ),
      sacredProcedureEn: "Recitation of 16 Sri Sukta hymns with lotus flowers, Bilva fruit, pure honey oblations, and Kubera Yantra archana.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಹಣಕಾಸಿನ ಹರಿವು ಸ್ಥಿರಗೊಂಡು, ಬಾಕಿ ಬರಬೇಕಿದ್ದ ಹಣ ವಾಪಸ್ ಬರುತ್ತದೆ. ಸಾಲದ ಸುಳಿಯಿಂದ ಮುಕ್ತಿ ದೊರೆತು ನೂತನ ಆದಾಯದ ಮೂಲಗಳು ತೆರೆದುಕೊಳ್ಳುತ್ತವೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Restores positive cash liquidity, resolves lingering debt liabilities, and opens stable new wealth channels.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಶ್ರೀ ಸೂಕ್ತ ಹವನವು ಧನ ಸ್ಥಾನದ ದಾರಿದ್ರ್ಯ ಯೋಗಗಳನ್ನು ಭಸ್ಮ ಮಾಡಿ ಲಕ್ಷ್ಮೀ ಕೃಪೆಯನ್ನು ಶಾಶ್ವತಗೊಳಿಸುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Sri Sukta Hawana burns poverty debilities, activating perennial financial stability]."
    });
  }

  // HOMA D: Career, Competition & Rivalry (Chandi / Durga Saptashati)
  const is6thAfflicted = (mars && [6, 8, 12].includes(mars.house)) || (rahu && [6, 10].includes(rahu.house)) || context?.primaryChallenge === "Career / Workplace";
  if (is6thAfflicted) {
    devaHomasPool.push({
      id: "homa_chandi",
      nameKn: "ಶ್ರೀ ಚಂಡಿಕಾ ಮಹಾ ಹವನ & ದುರ್ಗಾ ಸಪ್ತಶತಿ ಯಾಗ",
      nameEn: "Sri Chandi Maha Hawana & Durga Saptashati Yajna",
      domain: "deva_karya",
      category: "shatru_raksha",
      categoryLabelKn: "ಶತ್ರು ಸಂಹಾರ & ಅಭೇದ್ಯ ರಕ್ಷಣೆ",
      icon: "🔥",
      isUrgentPrimary: context?.primaryChallenge === "Career / Workplace",
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
  }

  // HOMA E: Evil Eye, Sudden Loss & Fear (Sudarshana & Narasimha)
  const isSudarshanaNeeded = (ketu && [1, 8, 12].includes(ketu.house)) || (moon && [8, 12, 6].includes(moon.house)) || (rahu && [8, 12].includes(rahu.house));
  if (isSudarshanaNeeded) {
    devaHomasPool.push({
      id: "homa_sudarshana",
      nameKn: "ಶ್ರೀ ಮಹಾ ಸುದರ್ಶನ ಹೋಮ & ನರಸಿಂಹ ಹವನ",
      nameEn: "Sri Maha Sudarshana Homa & Narasimha Hawana",
      domain: "deva_karya",
      category: "sudarshana_raksha",
      categoryLabelKn: "ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ & ಧನ ರಕ್ಷೆ",
      icon: "☸️",
      isUrgentPrimary: false,
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
  }

  // HOMA F: Rahu-Ketu Axis / Kaalsarp / Guru-Chandal
  const isRahuKetuAfflicted = (rahu && [1, 5, 7, 8].includes(rahu.house)) || (insights.kaalsarp !== "none") || (jupiter && rahu && jupiter.rashi.index === rahu.rashi.index);
  if (isRahuKetuAfflicted) {
    devaHomasPool.push({
      id: "homa_rahu_ketu_sandhi",
      nameKn: "ರಾಹು-ಕೇತು ಸರ್ಪ ಶಾಂತಿ & ನಾಗ ಪ್ರತಿಷ್ಠಾಪನಾ ಹವನ",
      nameEn: "Rahu-Ketu Sarpa Shanti & Naga Pratishthapana Hawana",
      domain: "deva_karya",
      category: "rahu_ketu_sandhi",
      categoryLabelKn: "ಛಾಯಾ ಗ್ರಹ ದೋಷ & ನಾಗ ಶಾಂತಿ",
      icon: "🐍",
      isUrgentPrimary: true,
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದಲ್ಲಿ ರಾಹು/ಕೇತುಗಳ ಪ್ರಬಲ ಸ್ಥಿತಿ ಅಥವಾ ಸರ್ಪ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದ್ವಂದ್ವ, ಭ್ರಮೆಗಳು, ಅನಗತ್ಯ ಗೊಂದಲ ಹಾಗೂ ವಿವಾಹ/ವೃತ್ತಿಯಲ್ಲಿ ನಿರೀಕ್ಷಿತ ತಿರುವು ವಿಳಂಬವಾಗುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "Rahu-Ketu axis or Sarpa Dosha causing mental confusion, decision paralysis, and delays.",
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

  // HOMA G: Saturn Affliction / Sade Sati / Ashtama Shani
  const isSaturnNearMoon = saturn && [12, 1, 2].includes(((saturn.rashi.index - kundli.moonSign.index + 12) % 12) + 1);
  const isSaturnAfflicted = (saturn && [1, 8, 10].includes(saturn.house)) || Boolean(isSaturnNearMoon);
  if (isSaturnAfflicted) {
    devaHomasPool.push({
      id: "homa_shani_shanti",
      nameKn: "ಶ್ರೀ ಶನಿ ಶಾಂತಿ & ಮಹಾ ಕಾಲಭೈರವ ಹವನ",
      nameEn: "Sri Shani Shanti & Maha Kalabhairava Hawana",
      domain: "deva_karya",
      category: "shani_shanti",
      categoryLabelKn: "ಕರ್ಮ ದೋಷ ನಿವಾರಣೆ & ಶನಿ ಪ್ರೀತಿ",
      icon: "🪐",
      isUrgentPrimary: Boolean(isSaturnNearMoon),
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${isSaturnNearMoon ? "ಸಾಡೇಸಾತಿ ಶನಿಯ ಸಂಚಾರ" : `ಶನಿ ಗ್ರಹವು ${saturn?.house}ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು`} ಹಾಗೂ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲಿನ ಪ್ರಭಾವದಿಂದ ನಿಧಾನ ಪ್ರಗತಿ, ಅತಿಯಾದ ಮಾನಸಿಕ ಆಯಾಸ ಹಾಗೂ ಕೆಲಸಗಳಲ್ಲಿ ವಿಳಂಬ ಉಂಟಾಗುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "Saturnian transit or placement inducing delays, heavy responsibilities, and karmic tests requiring Shani pacification.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಶನಿ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪ, ಶಮಿ ಸಮಿಧೆ, ಕಪ್ಪು ಎಳ್ಳು, ಸಾಸಿವೆ ಎಣ್ಣೆಯ ಹವನ, ಕಾಲಭೈರವ ಅಷ್ಟಕ ಪಠಣ ಹಾಗೂ ತೈಲಾಭಿಷೇಕ ಸೇವೆ.`
      ),
      sacredProcedureEn: "Shani Gayatri recitation, black sesame and mustard oil oblations, and Kalabhairava archana at Gokarna Kshetra.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ಶನಿ ದೇವನ ವಕ್ರ ದೃಷ್ಟಿ ಶಾಂತವಾಗಿ, ಕಠಿಣ ಕರ್ಮಗಳು ಸಡಿಲಗೊಳ್ಳುತ್ತವೆ. ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಕೆಲಸಗಳಲ್ಲಿ ಗತಿ ದೊರೆತು ಆಯಸ್ಸು, ಆರೋಗ್ಯ ಮತ್ತು ಗೌರವ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Pacifies Saturnian pressure, easing chronic delays and infusing steady purposeful momentum into career and health.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಶನಿ ಶಾಂತಿಯು ಶನಿಯ ಶಿಕ್ಷಾ ರೂಪವನ್ನು ರಕ್ಷಾ ರೂಪಕ್ಕೆ ಪರಿವರ್ತಿಸಿ ಯಶಸ್ಸು ತರುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Shani Shanti transforms punitive Saturnian pressure into protective wisdom and success]."
    });
  }

  // HOMA H: Vitality, Health, Maandi & Mrityunjaya
  const isMaandiLagnaOr8th = kundli.maandi && [1, 8].includes((((kundli.maandi.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1));
  const isHealthChallenge = context?.primaryChallenge === "Health / Vitality" || Boolean(isMaandiLagnaOr8th);
  if (isHealthChallenge) {
    devaHomasPool.push({
      id: "homa_mrityunjaya",
      nameKn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾ ಯಾಗ & ಆಯುಷ್ಯ-ಮಾಂದಿ ಶಾಂತಿ ಹವನ",
      nameEn: "Mahamrityunjaya Maha Yajna & Ayushya-Maandi Shanti Hawana",
      domain: "deva_karya",
      category: "mrityunjaya_ayushya",
      categoryLabelKn: "ಆರೋಗ್ಯ ಚೈತನ್ಯ & ಮಾಂದಿ ನಿವಾರಣೆ",
      icon: "🔱",
      isUrgentPrimary: Boolean(isMaandiLagnaOr8th),
      astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
        `ಜಾತಕದ ಲಗ್ನ ಮತ್ತು 8ನೇ ಮನೆಯ ಮೇಲೆ ಮಾಂದಿ ಹಾಗೂ ಪಾಪಗ್ರಹಗಳ ಸೂಕ್ಷ್ಮ ಪ್ರಭಾವದಿಂದಾಗಿ ದೈಹಿಕ ನಿಶ್ಯಕ್ತಿ, ಜೀರ್ಣಾಂಗ ಅಗ್ನಿಮಾಂದ್ಯತೆ, ನರಮಂಡಲದ ಆಯಾಸ ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡ ಉಂಟಾಗುತ್ತಿದೆ.`
      ),
      astrologicalRootCauseEn: "Subtle afflictions on Lagna/8th house from Maandi and malefic transits inducing fatigue and energetic depletion.",
      sacredProcedureKn: sanitizeAstrologyKannadaText(
        `ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರದ 1008 ಆಹುತಿಗಳು, ಅಮೃತಬಳ್ಳಿ (ಗುಡೂಚಿ), ದೂರ್ವಾ, ಗೋಘೃತ, ಜೇನುತುಪ್ಪ ಹಾಗೂ ಶ್ರೀ ರುದ್ರಾಧ್ಯಾಯ ಹೋಮ.`
      ),
      sacredProcedureEn: "1008 Mahamrityunjaya chants with sacred Guduchi herb, Durva grass, pure cow ghee, and Rudradhyaya havan.",
      expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
        `ದೈಹಿಕ ಚೈತನ್ಯ ಪುನರುಜ್ಜೀವನಗೊಂಡು, ಆಂತರಿಕ ಆತಂಕ ಶಮನವಾಗುತ್ತದೆ. ಆಯುಷ್ಯ ವೃದ್ಧಿ, ನವೋತ್ಸಾಹ ಹಾಗೂ ಸಕಲ ಅರಿಷ್ಟಗಳಿಂದ ದೈವಿಕ ರಕ್ಷಣೆ ಲಭಿಸುತ್ತದೆ.`
      ),
      expectedShiftsAfterPoojaEn: "Restoration of physical vitality, deep serene rest, rejuvenation of nervous energy, and longevity blessing.",
      priestSecretNoteKn: `[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ಮೃತ್ಯುಂಜಯ ಹವನವು ಪ್ರಾಣಶಕ್ತಿಯನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸಿ ಮಾಂದಿ ಗ್ರಹದ ನಕಾರಾತ್ಮಕ ತರಂಗಗಳನ್ನು ಶೂನ್ಯಗೊಳಿಸುತ್ತದೆ]`,
      priestSecretNoteEn: "[Astrologer Note: Mahamrityunjaya Hawana revitalizes Prana Shakti, neutralizing Maandi's shadow debility]."
    });
  }

  // HOMA I: Navagraha Maha Hawana (ALWAYS FOUNDATIONAL)
  const navagrahaHoma: YajnaHawanaItem = {
    id: "homa_navagraha",
    nameKn: "ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾ ಯಜ್ಞ & ಗ್ರಹ ಪ್ರೀತಿ ಹವನ",
    nameEn: "Navagraha Shanti Maha Yajna & Planetary Alignment Hawana",
    domain: "deva_karya",
    category: "navagraha",
    categoryLabelKn: "ಸರ್ವ ಗ್ರಹ ಸಮತೋಲನ & ಭಾಗ್ಯೋದಯ",
    icon: "🪐",
    isUrgentPrimary: true,
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನ ಹಾಗೂ ${moonRashiKn} ರಾಶಿಯ ಕುಂಡಲಿಯಲ್ಲಿ ನವಗ್ರಹಗಳ ಸ್ಥಾನಬಲದ ಏರುಪೇರು ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆಯಲ್ಲಿ ಗ್ರಹಗಳ ಪೂರ್ಣಾನುಗ್ರಹವನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ನವಗ್ರಹ ಪ್ರೀತಿ ಅತ್ಯಗತ್ಯವಾಗಿದೆ.`
    ),
    astrologicalRootCauseEn: "Planetary imbalance across natal houses and running Dasha-Gochara transits requiring holistic Navagraha alignment.",
    sacredProcedureKn: sanitizeAstrologyKannadaText(
      `9 ಗ್ರಹಗಳ ಪ್ರತ್ಯೇಕ ಸಮಿಧೆಗಳು (ಅರ್ಕ, ಪಲಾಶ, ಖದಿರ, ಅಪಾಮಾರ್ಗ, ಅಶ್ವತ್ಥ, ಶಮಿ ಇತ್ಯಾದಿ), ನವಧಾನ್ಯಗಳು ಹಾಗೂ ನವಗ್ರಹ ಗಾಯತ್ರಿ ಮಂತ್ರಗಳ ಸಹಸ್ರ ಆಹುತಿ.`
    ),
    sacredProcedureEn: "Sacred ahutis using distinct herbal woods for all 9 planets, Navadhanya grains, and 1008 Navagraha Gayatri chants.",
    expectedShiftsAfterPoojaKn: sanitizeAstrologyKannadaText(
      `ದೈನಂದಿನ ಕೆಲಸಗಳಲ್ಲಿ ಪದೇಪದೇ ಬರುತ್ತಿದ್ದ ವಿಳಂಬ ಮತ್ತು ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗುತ್ತವೆ. 9 ಗ್ರಹಗಳ ಸಮನ್ವಯತೆಯಿಂದ ಆರೋಗ್ಯ, ಆಯಸ್ಸು, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳು ವೃದ್ಧಿಯಾಗುತ್ತವೆ.`
    ),
    expectedShiftsAfterPoojaEn: "Dissolution of day-to-day obstacles, harmony across all nine celestial forces, and revitalization of good fortune.",
    priestSecretNoteKn: sanitizeAstrologyKannadaText(`[ದೈವಜ್ಞರ ಆಂತರಿಕ ಟಿಪ್ಪಣಿ: ನವಗ್ರಹ ಹವನವು ಸಕಲ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರಗಳಿಗೆ ತಳಹದಿಯಾಗಿದ್ದು, ${context?.dynamicTimelineKn || "ಮುಂಬರುವ ಶುಭ ಸಂಧಿಕಾಲದಲ್ಲಿ"} ಪರಿಪೂರ್ಣ ಶುಭ ಫಲ ನೀಡುತ್ತದೆ]`),
    priestSecretNoteEn: "[Astrologer Note: Navagraha Hawana serves as the master foundation ensuring upcoming transits manifest beneficially]."
  };

  // HOMA J: Gokarna Mahabaleshwara Atmalinga Rudrabhisheka (ALWAYS CROWN JEWEL)
  const gokarnaAbhishekaHoma: YajnaHawanaItem = {
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
  };

  // HOMA K: Dasha-Bhukti Sandhi Pooja
  const dashaSandhiHoma: YajnaHawanaItem = {
    id: "homa_dasha_sandhi",
    nameKn: `ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಶಾಂತಿ ಹವನ (${maha} - ${bhukti} ಸಂಧಿ ಸಂಕಲ್ಪ)`,
    nameEn: `Dasha-Bhukti Sandhi Shanti Hawana (${maha} - ${bhukti} Transition)`,
    domain: "deva_karya",
    category: "dasha_sandhi",
    categoryLabelKn: "ದಶಾ ಪರಿವರ್ತನಾ ಶಾಂತಿ",
    icon: "⏳",
    isUrgentPrimary: false,
    astrologicalRootCauseKn: sanitizeAstrologyKannadaText(
      `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${maha} ಮಹಾದಶೆ ಹಾಗೂ ${bhukti} ಭುಕ್ತಿಯ ಸಂಧಿಕಾಲದಲ್ಲಿ ಗ್ರಹಗಳ ಶಕ್ತಿಯು ಬದಲಾಗುತ್ತಿರುವುದರಿಂದ, ಹಠಾತ್ ಸ್ಥಾನಪಲ್ಲಟ, ಆರ್ಥಿಕ ಏರಿಳಿತ ಅಥವಾ ಒತ್ತಡಗಳು ಉಂಟಾಗದಂತೆ ರಕ್ಷಣೆ ಅಗತ್ಯವಿದೆ.`
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
  };

  // Assemble and curate the final Deva Homas list (guarantee 4 to 6 items)
  const finalDevaHomas: YajnaHawanaItem[] = [];

  // 1. Add afflicted / primary challenge specific homas first
  devaHomasPool.forEach(h => {
    if (finalDevaHomas.length < 4 && !finalDevaHomas.some(x => x.id === h.id)) {
      finalDevaHomas.push(h);
    }
  });

  // 2. Add Navagraha Shanti (Foundational)
  if (!finalDevaHomas.some(x => x.id === navagrahaHoma.id)) {
    finalDevaHomas.push(navagrahaHoma);
  }

  // 3. Add Gokarna Atmalinga Rudrabhisheka (Crown Jewel)
  if (!finalDevaHomas.some(x => x.id === gokarnaAbhishekaHoma.id)) {
    finalDevaHomas.push(gokarnaAbhishekaHoma);
  }

  // 4. If still under 4, add Dasha Sandhi
  if (finalDevaHomas.length < 4 && !finalDevaHomas.some(x => x.id === dashaSandhiHoma.id)) {
    finalDevaHomas.push(dashaSandhiHoma);
  }

  // =========================================================================
  // 3. COMBINED SACRED SCHEDULE (2-STAGE MULTI-DAY OR 1-DAY DEVA SAMPUTA)
  // =========================================================================
  const devaHomaNamesKn: string[] = finalDevaHomas.slice(0, 3).map(h => h.nameKn.split("&")[0].trim());
  let combinedSchedule: CombinedSacredSchedule;

  if (hasPitruDosha) {
    const pitruRitualsKn = ["ಶ್ರೀ ನಾರಾಯಣ ಬಲಿ", "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", "ತಿಲ ಹವನ & ಪಿಂಡ ಪ್ರದಾನ"];
    combinedSchedule = {
      scheduleType: "two_stage_multi_day",
      titleKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ 2-ಹಂತದ ಪಿತೃ ಮುಕ್ತಿ & ದೇವತಾ ಸಂಪುಟ ಮಹಾ ಸೇವೆ",
      titleEn: "Gokarna 2-Stage Ancestral Liberation & Divine Samputa Yajna",
      stage1PitruKarya: {
        dayLabelKn: "ಹಂತ 1 (ದಿನ 1): ಪಿತೃ ಮುಕ್ತಿ ಅಪರ ಸಂಕಲ್ಪ",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥ ತೀರ",
        ritualsKn: pitruRitualsKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಪ್ರಥಮ ದಿನದಂದು ಕೋಟಿತೀರ್ಥದ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪಿತೃ ಮುಕ್ತಿಗಾಗಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಹಾಗೂ ತಿಲ ಹವನಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನೆರವೇರಿಸಿ 21 ತಲೆಮಾರಿನ ಪೂರ್ವಜರ ಆತ್ಮಗಳಿಗೆ ಸದ್ಗತಿ ಕಲ್ಪಿಸಲಾಗುತ್ತದೆ."
        )
      },
      restPeriodShuddhi: {
        dayLabelKn: "ವಿಶ್ರಾಂತಿ & ಶುದ್ಧಿ (ದಿನ 2): 1 ದಿನದ ಆಶೌಚ ನಿವೃತ್ತಿ & ದೈವಿಕ ಶುದ್ಧಿ ಕಾಲ",
        descriptionKn: sanitizeAstrologyKannadaText(
          "ಧರ್ಮಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಪಿತೃ ಕಾರ್ಯ ಮತ್ತು ದೇವತಾ ಕಾರ್ಯವನ್ನು ಒಂದೇ ದಿನ ಮಾಡಬಾರದು. ಪಿತೃ ಮುಕ್ತಿಯ ನಂತರ 1 ದಿನದ ಪೂರ್ಣ ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸಾಗರ ಸ್ನಾನ / ಪುಣ್ಯ ತೀರ್ಥ ಸ್ನಾನದಿಂದ ದೇಹ-ಮನಸ್ಸಿನ ಶುದ್ಧಿ ಪಡೆಯಬೇಕು."
        ),
        shastraRuleKn: "ಶಾಸ್ತ್ರ ನಿಯಮ: ಪಿತೃ ಕರ್ಮದ ನಂತರ 1 ದಿನದ ಶೌಚ-ಶುದ್ಧಿ ವಿಶ್ರಾಂತಿ ಕಡ್ಡಾಯ."
      },
      stage2DevaKarya: {
        dayLabelKn: "ಹಂತ 2 (ದಿನ 3): ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಜ್ಞ & ರುದ್ರಾಭಿಷೇಕ",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ",
        ritualsKn: devaHomaNamesKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          `ಶುದ್ಧಿ ದಿನದ ನಂತರ, ಮೂರನೇ ದಿನ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${devaHomaNamesKn.join(", ")}ಗಳನ್ನು ಸಂಪುಟವಾಗಿ ನೆರವೇರಿಸಿ ಸಕಲ ಭಾಗ್ಯೋದಯ ಸಂಕಲ್ಪ ಮಾಡಲಾಗುತ್ತದೆ.`
        )
      },
      synergyExplanationKn: sanitizeAstrologyKannadaText(
        "ಈ 2-ಹಂತದ ಶಾಸ್ತ್ರೋಕ್ತ ಯೋಜನೆಯಿಂದ: ಮೊದಲಿಗೆ ಪಿತೃ ಶಾಪ ವಿಮೋಚನೆಯಾಗಿ ಪೂರ್ವಜರ ಪೂರ್ಣ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ; ನಂತರ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಮಾಡುವ ದೇವತಾ ಯಜ್ಞದಿಂದ ನವಗ್ರಹ ಶಾಂತಿ, ಶತ್ರು ನಾಶ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರನ ಶಾಶ್ವತ ರಕ್ಷಾ ಕವಚ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."
      ),
      synergyExplanationEn: "Executing this authentic 2-stage timeline strictly respects Vedic apara-shubha separation: ancestral liberation on Day 1, followed by purifying rest on Day 2, and grand divine homa on Day 3.",
      recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
        `ಹಂತ 1 (ಪಿತೃ ಮುಕ್ತಿ): ಮುಂಬರುವ ಕೃಷ್ಣ ಪಕ್ಷದ ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ${lagnaDayKn}/ಸೋಮವಾರದಂದು ಪ್ರಾತಃಕಾಲ 06:30 ರಿಂದ 09:30 ರೊಳಗೆ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ. ಹಂತ 2 (ದೇವತಾ ಯಾಗ): 1 ದಿನದ ಶುದ್ಧಿ ವಿಶ್ರಾಂತಿಯ ನಂತರ, ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದಿನವಾದ ${lagnaDayKn}ದಂದು ಶುಕ್ಲ ಪಕ್ಷದ ಪ್ರಾತಃಕಾಲ 07:00 ರಿಂದ 09:30 ರೊಳಗೆ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ.`
      )
    };
  } else {
    combinedSchedule = {
      scheduleType: "single_day_deva_samputa",
      titleKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಚತುರ್ಮುಖ ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಾಗ",
      titleEn: "Gokarna Chaturmukha Divine Samputa Yajna",
      stage2DevaKarya: {
        dayLabelKn: "ದೇವತಾ ಮಹಾ ಸಂಪುಟ ಯಾಗ (ದಿನ 1)",
        placeKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ",
        ritualsKn: devaHomaNamesKn,
        descriptionKn: sanitizeAstrologyKannadaText(
          `ಜಾತಕದಲ್ಲಿ ಪಿತೃ ದೋಷವಿಲ್ಲದಿರುವುದರಿಂದ, ನೇರವಾಗಿ ${devaHomaNamesKn.join(", ")} ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗ ಮಹಾ ರುದ್ರಾಭಿಷೇಕಗಳನ್ನು ಒಂದೇ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.`
        )
      },
      synergyExplanationKn: sanitizeAstrologyKannadaText(
        "ಈ ಪ್ರಮುಖ ಹವನಗಳನ್ನು ಒಂದೇ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಸಂಪುಟ ರೂಪದಲ್ಲಿ ನೆರವೇರಿಸುವುದರಿಂದ ನವಗ್ರಹ ಶಾಂತಿ, ಗ್ರಹ ಸಂಘರ್ಷಗಳ ಭಸ್ಮ ಹಾಗೂ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗದಿಂದ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ ಶಾಶ್ವತವಾಗಿ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ."
      ),
      synergyExplanationEn: "Combining these synergistic homas in one unified auspicious muhurtha simultaneously harmonizes planetary transits, crushes rival opposition, and secures eternal divine grace.",
      recommendedMuhurthaKn: sanitizeAstrologyKannadaText(
        `ನಿಮ್ಮ ${lagnaRashiKn} ಲಗ್ನಾಧಿಪತಿಯ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ ದಿನವಾದ ${lagnaDayKn}ದಂದು, ${moonNakKn} ನಕ್ಷತ್ರಕ್ಕೆ ತಾರಾಬಲ ಕೂಡಿಬರುವ ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಪಂಚಮಿ, ಸಪ್ತಮಿ, ದಶಮಿ ಅಥವಾ ಪೌರ್ಣಮಿಯ ಪ್ರಾತಃಕಾಲ 06:30 ರಿಂದ 09:00 ರ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ.`
      )
    };
  }

  const overallAstrologicalPrescriptionSummaryKn = sanitizeAstrologyKannadaText(
    `ನಮಸ್ಕಾರ ${devotee}, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಸ್ತುತ ಗ್ರಹಗತಿಯ ಪ್ರಕಾರ, ಈ ನಿರ್ದಿಷ್ಟ ಯಜ್ಞ-ಹವನಗಳು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವನ್ನು ನಿರ್ಧರಿಸಲಿವೆ. ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಇವುಗಳನ್ನು ನೆರವೇರಿಸುವುದರಿಂದ ${context?.dynamicTimelineKn || "ಮುಂಬರುವ ಶುಭ ಸಂಧಿಕಾಲದಲ್ಲಿ"} ನಿಮ್ಮ ಸಕಲ ಕಷ್ಟಗಳು ಕರಗಿ ಭಾಗ್ಯೋದಯವಾಗಲಿದೆ.`
  );

  return {
    pitruKaryas,
    devaHomas: finalDevaHomas,
    combinedSchedule,
    pitruDoshaAssessment,
    overallAstrologicalPrescriptionSummaryKn
  };
}
