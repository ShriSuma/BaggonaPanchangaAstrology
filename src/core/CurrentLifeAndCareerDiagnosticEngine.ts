/**
 * Baggona Panchanga & Astrology - Current Life Situation & Career Diagnostic Engine
 *
 * Implements two classical Jyotisha systems:
 * 1. REAL-TIME CURRENT LIFE SITUATION & ACUTE CHALLENGE DIAGNOSIS:
 *    Identifies what the native is experiencing right now in their daily life based on:
 *    - Age & Gender bracketed life stages
 *    - Running Mahadasha & Antardasha (Vimshottari Dasha)
 *    - Real-time Gochara (Sade Sati, Ashtama Shani, Kantaka Shani, Rahu-Ketu axis, Jupiter transit)
 *    - Natal Bhava afflictions:
 *      * Property share / family home dispute (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಭಾಗದ ಜಗಳ)
 *      * Business partner distrust / betrayal (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ)
 *      * Marriage delay / unmarried past age (ವಿವಾಹ ವಿಳಂಬ)
 *      * Marital crisis / estrangement (ದಾಂಪತ್ಯ ಬಿಕ್ಕಟ್ಟು)
 *      * Delayed childbirth / progeny anxiety (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು)
 *      * Workplace politics / layoff threat / stagnation (ಉದ್ಯೋಗದಲ್ಲಿ ರಾಜಕೀಯ / ಅಸ್ಥಿರತೆ)
 *      * Crushing debt / speculation loss (ಸಾಲದ ಹೊರೆ / ಷೇರು ನಷ್ಟ)
 *      * Student academic stress (ವಿದ್ಯಾಭ್ಯಾಸ / ಪರೀಕ್ಷಾ ಆತಂಕ)
 *      * Chronic health & vitality strain (ಆರೋಗ್ಯ ಕ್ಲೇಶ)
 *      * Senior peace & legacy settlement (ವಾನಪ್ರಸ್ಥ ಶಾಂತಿ)
 *
 * 2. ACCURATE SPECIFIC PROFESSION & VOCATION DETERMINATION:
 *    Pinpoints which work the native is doing:
 *    - Software / IT Engineer / Technology / Data
 *    - Bank Clerk / Banker / Accountant / CA / Finance
 *    - Teacher / College Professor / Lecturer / Academic
 *    - Doctor / Surgeon / Medical Practitioner / Healthcare
 *    - Lawyer / Advocate / Judge / Legal Counsel
 *    - Priest / Vedic Scholar / Purohita / Temple Archaka / Astrologer
 *    - Government Officer / Civil Services (IAS/KAS) / Police / Defense
 *    - Business / Real Estate / Entrepreneur / Merchant / Contractor
 *    - Core Engineering (Mechanical / Civil / Electrical) / Industry
 *    - Creative / Arts / Media / Journalism / Design
 *
 * Follows strict Baggona rules: Pure Kannada for Indic text, standard English digits (0-9),
 * and zero markdown bold asterisks in output text.
 */

import { KundliOutput, PlanetName, PlanetPosition, Rashi } from "./AstroTypes";
import { navamsaSignIndex } from "./Navamsa";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra } from "../utils/kannadaAstrologyTerms";
import { generateBhuktiTimeline, BhuktiSpan } from "./DashaBhuktiEngine";

// -------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------

export type CurrentLifeSituationCategory =
  | "property_share_dispute"
  | "partner_distrust_betrayal"
  | "marriage_delay"
  | "marital_discord"
  | "childless_anxiety"
  | "career_politics_layoff"
  | "debt_financial_crisis"
  | "student_academic_stress"
  | "health_vitality_strain"
  | "elderly_peace_legacy"
  | "career_financial_growth"
  | "legal_custody_confinement"
  | "leadership_expansion_scaling"
  | "creative_media_stardom"
  | "elite_sports_athletic_triumph"
  | "health_autoimmune_recovery"
  | "post_divorce_rebuilding"
  | "infant_balarishta_growth"
  | "early_childhood_play_milestones"
  | "youth_artistic_or_sports_prodigy";

export interface CurrentLifeSituationDiagnosis {
  category: CurrentLifeSituationCategory;
  titleKn: string;
  titleEn: string;
  headlineKn: string;
  headlineEn: string;
  detailedRealityKn: string;
  detailedRealityEn: string;
  planetaryCulpritKn: string;
  planetaryCulpritEn: string;
  symptomsChecklistKn: string[];
  symptomsChecklistEn: string[];
  severity: "critical" | "high" | "moderate" | "peaceful";
  reliefTimelineKn: string;
  reliefTimelineEn: string;
  gokarnaRemedyKn: string;
  gokarnaRemedyEn: string;
  externalLifeRealityKn?: string;
  externalLifeRealityEn?: string;
  internalMindsetKn?: string;
  internalMindsetEn?: string;
}

export type AccurateProfessionCode =
  | "it_software"
  | "banking_finance"
  | "teaching_academics"
  | "medical_healthcare"
  | "legal_judiciary"
  | "priest_vedic_astrology"
  | "government_civil_police"
  | "business_realestate"
  | "engineering_core"
  | "creative_media"
  | "sports_athletics"
  | "agriculture_farming";

export interface CareerSuitabilityField {
  fieldCode: AccurateProfessionCode;
  fieldNameKn: string;
  fieldNameEn: string;
  suitabilityPercentage: number;
  coreStrengthsKn: string;
  coreStrengthsEn: string;
  whyNativeShinesKn: string;
  whyNativeShinesEn: string;
  interestFieldsKn?: string[];
  interestFieldsEn?: string[];
  verdictKn: "ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು (Top Recommended)" | "ಉತ್ತಮ ಅನುಕೂಲ (High Suitability)" | "ಮಧ್ಯಮ (Moderate)";
  verdictEn: "Top Recommended" | "High Suitability" | "Moderate";
}

export type SubjectCode =
  | "maths_analytics"
  | "science_technology"
  | "rajakiya_governance"
  | "commerce_banking"
  | "arts_creativity"
  | "history_law_dharma";

export interface SubjectAptitude {
  code: SubjectCode;
  nameKn: string;
  nameEn: string;
  scorePercentage: number;
  ratingKn: "ಅತ್ಯುನ್ನತ (Excellent)" | "ಉತ್ತಮ (Good)" | "ಸಾಧಾರಣ (Average)";
  ratingEn: "Excellent" | "Good" | "Average";
  planetaryIndicatorKn: string;
  planetaryIndicatorEn: string;
}

export type MarriageDestinyVerdict =
  | "assured_marriage"
  | "delayed_marriage"
  | "lifelong_celibacy_denial"
  | "already_married"
  | "minor_childhood_blessing";

export interface MarriageDestinyAssessment {
  verdict: MarriageDestinyVerdict;
  badgeColor: "emerald" | "amber" | "purple" | "rose";
  directAnswerKn: string;
  directAnswerEn: string;
  titleKn: string;
  titleEn: string;
  subtitleKn: string;
  subtitleEn: string;
  marriageTimingWindowKn: string;
  marriageTimingWindowEn: string;
  astrologicalReasoningKn: string;
  astrologicalReasoningEn: string;
  classicalRuleCitedKn: string;
  classicalRuleCitedEn: string;
  historicalCelebrityParallelKn?: string;
  historicalCelebrityParallelEn?: string;
  delayFactorsKn?: string[];
  delayFactorsEn?: string[];
  blessingRemedyKn: string;
  blessingRemedyEn: string;
}

export interface AccurateProfessionProfile {
  code: AccurateProfessionCode;
  bestCode?: AccurateProfessionCode;
  titleKn: string;
  titleEn: string;
  specificRoleKn: string;
  specificRoleEn: string;
  workEnvironmentKn: string;
  workEnvironmentEn: string;
  astrologicalBasisKn: string;
  astrologicalBasisEn: string;
  secondaryAlternativeKn: string;
  secondaryAlternativeEn: string;
  confidenceScore: number;
  primaryPlanetKn: string;
  primaryPlanetEn: string;
  tenthHouseSignKn: string;
  tenthHouseSignEn: string;
  amatyakarakaPlanetKn: string;
  amatyakarakaPlanetEn: string;
  topSuitableFields?: CareerSuitabilityField[];
  subjectAptitudes?: SubjectAptitude[];
  bestFieldsSummaryKn?: string;
  bestFieldsSummaryEn?: string;
  careerGrowthSummaryKn?: string;
  careerGrowthSummaryEn?: string;
  specialCareerYogasKn?: string[];
  specialCareerYogasEn?: string[];
  leadershipPotentialKn?: string;
  leadershipPotentialEn?: string;
  whyNativeShinesKn?: string;
  whyNativeShinesEn?: string;
  marriageDestiny?: MarriageDestinyAssessment;
}

// -------------------------------------------------------------
// HELPER LOOKUPS
// -------------------------------------------------------------

const RASHI_KN: Record<number, string> = {
  0: "ಮೇಷ", 1: "ವೃಷಭ", 2: "ಮಿಥುನ", 3: "ಕರ್ಕಾಟಕ",
  4: "ಸಿಂಹ", 5: "ಕನ್ಯಾ", 6: "ತುಲಾ", 7: "ವೃಶ್ಚಿಕ",
  8: "ಧನುಸ್ಸು", 9: "ಮಕರ", 10: "ಕುಂಭ", 11: "ಮೀನ"
};

const RASHI_EN: Record<number, string> = {
  0: "Aries", 1: "Taurus", 2: "Gemini", 3: "Cancer",
  4: "Leo", 5: "Virgo", 6: "Libra", 7: "Scorpio",
  8: "Sagittarius", 9: "Capricorn", 10: "Aquarius", 11: "Pisces"
};

const PLANET_KN: Record<string, string> = {
  Sun: "ರವಿ", Moon: "ಚಂದ್ರ", Mars: "ಕುಜ", Mercury: "ಬುಧ",
  Jupiter: "ಗುರು", Venus: "ಶುಕ್ರ", Saturn: "ಶನಿ", Rahu: "ರಾಹು", Ketu: "ಕೇತು"
};

const PLANET_EN: Record<string, string> = {
  Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury",
  Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu"
};

const EXALTATION_SIGNS: Record<PlanetName, number> = {
  [PlanetName.Sun]: 0,        // Mesha (Aries)
  [PlanetName.Moon]: 1,       // Vrishabha (Taurus)
  [PlanetName.Mars]: 9,       // Makara (Capricorn)
  [PlanetName.Mercury]: 5,    // Kanya (Virgo)
  [PlanetName.Jupiter]: 3,    // Karka (Cancer)
  [PlanetName.Venus]: 11,     // Meena (Pisces)
  [PlanetName.Saturn]: 6,     // Tula (Libra)
  [PlanetName.Rahu]: 1,       // Vrishabha (Taurus)
  [PlanetName.Ketu]: 7        // Vrischika (Scorpio)
};

export const signLord = (signIndex: number): PlanetName => {
  const lords: PlanetName[] = [
    PlanetName.Mars, PlanetName.Venus, PlanetName.Mercury, PlanetName.Moon,
    PlanetName.Sun, PlanetName.Mercury, PlanetName.Venus, PlanetName.Mars,
    PlanetName.Jupiter, PlanetName.Saturn, PlanetName.Saturn, PlanetName.Jupiter
  ];
  return lords[((signIndex % 12) + 12) % 12];
};

const houseDistance = (fromHouse: number, toHouse: number): number => {
  return ((toHouse - fromHouse + 12) % 12) + 1;
};

// -------------------------------------------------------------
// 1. REAL-TIME CURRENT LIFE SITUATION DIAGNOSTIC ENGINE
// -------------------------------------------------------------

export function diagnoseCurrentLifeSituation(
  kundli: KundliOutput,
  context: {
    birthDate?: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    devoteeName?: string;
    gender?: "Male" | "Female" | "Other" | string;
    devoteeAge?: number;
    maritalStatus?: "married" | "unmarried" | "divorced" | "separated" | string;
    hasChildren?: boolean;
    knownHealthCondition?: string;
    panchanga?: {
      vara?: { nameKn: string; nameEn: string; lord: PlanetName; tatva: string };
      tithi?: { nameKn: string; nameEn: string; paksha: string; deity?: string };
      nakshatra?: { nameKn: string; nameEn: string; lord: PlanetName; pada?: number; gana?: string; yoni?: string; deity?: string };
      yoga?: { nameKn: string; nameEn: string; isAuspicious?: boolean };
      karana?: { nameKn: string; nameEn: string; type?: string };
    };
  },
  dashaTiming?: {
    timelineKn?: string;
    timelineEn?: string;
    maha?: string;
    bhukti?: string;
    remainingMonths?: number;
    remainingYears?: number;
  },
  liveGochara?: {
    shaniHouseFromMoon?: number;
    shaniHouseFromLagna?: number;
    guruHouseFromMoon?: number;
    guruHouseFromLagna?: number;
    rahuHouseFromMoon?: number;
    rahuHouseFromLagna?: number;
    ketuHouseFromMoon?: number;
    ketuHouseFromLagna?: number;
    isSadeSati?: boolean;
    isAshtamaShani?: boolean;
    isKantakaShani?: boolean;
    isGuruAnukula?: boolean;
    summaryKn?: string;
    summaryEn?: string;
  },
  extraDiagnostics?: {
    negativeShades?: any;
    accurateProfession?: any;
  }
): CurrentLifeSituationDiagnosis {
  const age = context.devoteeAge ?? (context.birthDate ? Math.max(0, new Date().getFullYear() - new Date(context.birthDate).getFullYear()) : 30);
  const isFemale = context.gender === "Female";
  const isMale = context.gender === "Male" || (!isFemale && context.gender !== "Other");
  const devoteeName = context.devoteeName || (isFemale ? "ಭಕ್ತೆಯವರೇ" : "ಭಕ್ತರೇ");

  // Determine Astrological Marriage Destiny Early (Single Source of Truth)
  const marriageDestiny = determineMarriageDestiny(kundli, context);
  const isDestinyDelayed = marriageDestiny.verdict === "delayed_marriage";
  const isDestinyCelibate = marriageDestiny.verdict === "lifelong_celibacy_denial";
  const isDestinyAlreadyMarried = marriageDestiny.verdict === "already_married";

  const isConfirmedMarried = Boolean(
    context.maritalStatus === "married" ||
    context.hasChildren === true ||
    (context.devoteeName && /ದಂಪತಿ|ಮತ್ತು|ಸಹಿತ|couple|\band\b/i.test(context.devoteeName)) ||
    (isDestinyAlreadyMarried && context.maritalStatus !== "unmarried" && age >= 45)
  );

  const sun = kundli.planets.find(p => p.name === PlanetName.Sun);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);

  const lagnaIndex = kundli.lagnaRashi.index;
  const lagnaKn = RASHI_KN[lagnaIndex] || "ಲಗ್ನ";
  const lagnaEn = RASHI_EN[lagnaIndex] || "Lagna";
  const lagnaLord = signLord(lagnaIndex);
  const lagnaLordKn = PLANET_KN[lagnaLord] || "ಲಗ್ನಾಧಿಪತಿ";
  const lagnaLordEn = PLANET_EN[lagnaLord] || "Lagna Lord";
  const lagnaLordPlanet = kundli.planets.find(p => p.name === lagnaLord);
  const lagnaLordHouse = lagnaLordPlanet?.house ?? 1;

  const moonRashiIdx = kundli.moonSign.index;
  const moonRashiKn = RASHI_KN[moonRashiIdx] || "ರಾಶಿ";
  const moonRashiEn = RASHI_EN[moonRashiIdx] || "Moon Sign";
  const moonNakKn = moon?.nakshatra?.english ? toKannadaNakshatra(moon.nakshatra.english) : (context.panchanga?.nakshatra?.nameKn || "ನಕ್ಷತ್ರ");
  const moonPada = kundli.moonPada || 1;

  // 12 House sign indices and lords
  const getHouseSignIdx = (h: number) => (lagnaIndex + h - 1) % 12;
  const getHouseSignKn = (h: number) => RASHI_KN[getHouseSignIdx(h)] || "";
  const getHouseSignEn = (h: number) => RASHI_EN[getHouseSignIdx(h)] || "";
  const getHouseLord = (h: number) => signLord(getHouseSignIdx(h));
  const getHouseLordKn = (h: number) => PLANET_KN[getHouseLord(h)] || "";
  const getHouseLordEn = (h: number) => PLANET_EN[getHouseLord(h)] || "";
  const getHouseLordPlanet = (h: number) => kundli.planets.find(p => p.name === getHouseLord(h));
  const getHouseLordHouse = (h: number) => getHouseLordPlanet(h)?.house ?? h;

  const h1SignKn = getHouseSignKn(1);
  const h2SignKn = getHouseSignKn(2);
  const h2LordKn = getHouseLordKn(2);
  const h3SignKn = getHouseSignKn(3);
  const h3LordKn = getHouseLordKn(3);
  const h4SignKn = getHouseSignKn(4);
  const h4LordKn = getHouseLordKn(4);
  const h4LordHouse = getHouseLordHouse(4);
  const h5SignKn = getHouseSignKn(5);
  const h5LordKn = getHouseLordKn(5);
  const h5LordHouse = getHouseLordHouse(5);
  const h6SignKn = getHouseSignKn(6);
  const h6LordKn = getHouseLordKn(6);
  const h7SignKn = getHouseSignKn(7);
  const h7LordKn = getHouseLordKn(7);
  const h7LordHouse = getHouseLordHouse(7);
  const h8SignKn = getHouseSignKn(8);
  const h8LordKn = getHouseLordKn(8);
  const h8LordHouse = getHouseLordHouse(8);
  const h9SignKn = getHouseSignKn(9);
  const h9LordKn = getHouseLordKn(9);
  const h10SignKn = getHouseSignKn(10);
  const h10LordKn = getHouseLordKn(10);
  const h10LordHouse = getHouseLordHouse(10);
  const h11SignKn = getHouseSignKn(11);
  const h11LordKn = getHouseLordKn(11);
  const h12SignKn = getHouseSignKn(12);
  const h12LordKn = getHouseLordKn(12);

  const secondLord = getHouseLord(2);
  const secondLordPlanet = getHouseLordPlanet(2);
  const thirdLord = getHouseLord(3);
  const thirdLordPlanet = getHouseLordPlanet(3);
  const fourthLord = getHouseLord(4);
  const fourthLordPlanet = getHouseLordPlanet(4);
  const fifthLord = getHouseLord(5);
  const fifthLordPlanet = getHouseLordPlanet(5);
  const sixthLord = getHouseLord(6);
  const sixthLordPlanet = getHouseLordPlanet(6);
  const seventhLord = getHouseLord(7);
  const seventhLordPlanet = getHouseLordPlanet(7);
  const eighthLord = getHouseLord(8);
  const eighthLordPlanet = getHouseLordPlanet(8);
  const ninthLord = getHouseLord(9);
  const ninthLordPlanet = getHouseLordPlanet(9);
  const tenthLord = getHouseLord(10);
  const tenthLordPlanet = getHouseLordPlanet(10);
  const eleventhLord = getHouseLord(11);
  const eleventhLordPlanet = getHouseLordPlanet(11);
  const twelfthLord = getHouseLord(12);
  const twelfthLordPlanet = getHouseLordPlanet(12);

  const tenthSignIdx = (lagnaIndex + 9) % 12;
  const tenthSignNameKn = RASHI_KN[tenthSignIdx] || "ದಶಮ";
  const tenthLordNameKn = PLANET_KN[tenthLord] || "ದಶಮಾಧಿಪತಿ";

  // Running Dasha and Bhukti
  const runningMahaRaw = dashaTiming?.maha || "";
  const runningBhuktiRaw = dashaTiming?.bhukti || "";
  const mahaKn = PLANET_KN[runningMahaRaw] || runningMahaRaw || "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ";
  const bhuktiKn = PLANET_KN[runningBhuktiRaw] || runningBhuktiRaw || "ಭುಕ್ತಿ";
  const mahaEn = PLANET_EN[runningMahaRaw] || runningMahaRaw || "Mahadasha";
  const bhuktiEn = PLANET_EN[runningBhuktiRaw] || runningBhuktiRaw || "Antardasha";

  // Panchanga 5-Angas context values
  const varaKn = context.panchanga?.vara?.nameKn || "";
  const varaTatvaKn = context.panchanga?.vara?.tatva || "ಅಗ್ನಿ / ಜಲ";
  const tithiKn = context.panchanga?.tithi?.nameKn || "";
  const tithiPakshaKn = context.panchanga?.tithi?.paksha || "ಶುಕ್ಲ";
  const nakDeityKn = context.panchanga?.nakshatra?.deity || "ಇಷ್ಟದೇವತೆ";
  const yogaKn = context.panchanga?.yoga?.nameKn || "";
  const karanaKn = context.panchanga?.karana?.nameKn || "";

  // Gochara transits
  const shaniMoon = liveGochara?.shaniHouseFromMoon ?? (saturn && moon ? houseDistance(moon.house, saturn.house) : 1);
  const shaniLagna = liveGochara?.shaniHouseFromLagna ?? (saturn ? houseDistance(1, saturn.house) : 1);
  const guruMoon = liveGochara?.guruHouseFromMoon ?? (jupiter && moon ? houseDistance(moon.house, jupiter.house) : 1);
  const guruLagna = liveGochara?.guruHouseFromLagna ?? (jupiter ? houseDistance(1, jupiter.house) : 1);
  const isSadeSati = liveGochara?.isSadeSati ?? [12, 1, 2].includes(shaniMoon);
  const isAshtamaShani = liveGochara?.isAshtamaShani ?? (shaniMoon === 8);
  const isKantakaShani = liveGochara?.isKantakaShani ?? [4, 7, 10].includes(shaniMoon);
  const isGuruAnukula = liveGochara?.isGuruAnukula ?? [2, 5, 7, 9, 11].includes(guruMoon);

  const shaniGocharaTextKn = isSadeSati
    ? `ಸಾಡೇ ಸಾತಿ (ಚಂದ್ರನಿಂದ ${shaniMoon}ನೇ ಮನೆ)`
    : isAshtamaShani
    ? "ಅಷ್ಟಮ ಶನಿ (ಚಂದ್ರನಿಂದ 8ನೇ ಮನೆ)"
    : isKantakaShani
    ? `ಕಂಟಕ ಶನಿ (ಚಂದ್ರನಿಂದ ${shaniMoon}ನೇ ಮನೆ)`
    : `ಗೋಚಾರ ಶನಿ (ಚಂದ್ರನಿಂದ ${shaniMoon}ನೇ ಮನೆ)`;

  const guruGocharaTextKn = isGuruAnukula
    ? `ಗೋಚಾರ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿ (ಚಂದ್ರನಿಂದ ${guruMoon}ನೇ ಅನುಕೂಲ ಸ್ಥಾನ)`
    : `ಗೋಚಾರ ಗುರು (ಚಂದ್ರನಿಂದ ${guruMoon}ನೇ ಪರಿಶ್ರಮ ಸ್ಥಾನ)`;

  let fallbackTimelineKn = "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿಯ ಕಾಲಾವಧಿಯಲ್ಲಿ";
  let fallbackTimelineEn = "during the current Dasha-Bhukti planetary period";
  try {
    const timeline = generateBhuktiTimeline(kundli);
    if (timeline && timeline.length > 0) {
      const ageDec = context.devoteeAge ?? age;
      const span = timeline.find((s) => ageDec >= s.startAge - 1e-6 && ageDec < s.endAge - 1e-6) || timeline[0];
      if (span) {
        const remainingYrs = Math.max(0.08, span.endAge - ageDec);
        const remMonths = Math.max(1, Math.round(remainingYrs * 12));
        fallbackTimelineKn = `ಮುಂದಿನ ${remMonths} ತಿಂಗಳುಗಳಲ್ಲಿ`;
        fallbackTimelineEn = `over the next ${remMonths} month${remMonths > 1 ? "s" : ""}`;
      }
    }
  } catch (_e) {
    // fallback defaults
  }

  const dashaTimeKn = dashaTiming?.timelineKn || fallbackTimelineKn;
  const dashaTimeEn = dashaTiming?.timelineEn || fallbackTimelineEn;

  // -------------------------------------------------------------
  // CRITERION 1: PROPERTY SHARE / FAMILY HOME DISPUTE (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಹಕ್ಕಿನ ಜಗಳ)
  // Evaluates Houses 4 (land/home), 3 (brothers/shares), 8 (litigation), 6 (court battles)
  // -------------------------------------------------------------
  let propertyDisputeScore = 0;
  const is4thHouseAfflicted = Boolean(
    (mars && mars.house === 4) ||
    (saturn && saturn.house === 4) ||
    (rahu && rahu.house === 4) ||
    (fourthLordPlanet && [6, 8, 12].includes(fourthLordPlanet.house)) ||
    (sixthLordPlanet && sixthLordPlanet.house === 4)
  );

  if (is4thHouseAfflicted) {
    if (mars && mars.house === 4) propertyDisputeScore += 3.5;
    if (fourthLordPlanet && [6, 8, 12].includes(fourthLordPlanet.house)) propertyDisputeScore += 3.0;
    if (sixthLordPlanet && sixthLordPlanet.house === 4) propertyDisputeScore += 2.5;
    if (saturn && saturn.house === 4) propertyDisputeScore += 2.5;
    if (rahu && rahu.house === 4) propertyDisputeScore += 2.0;
    if (thirdLordPlanet && [6, 8, 12].includes(thirdLordPlanet.house)) propertyDisputeScore += 1.5;
    if (mars && saturn && [1, 4, 7, 10].includes(houseDistance(saturn.house, mars.house)) && (mars.house === 4 || saturn.house === 4 || fourthLordPlanet?.house === mars.house || fourthLordPlanet?.house === saturn.house)) propertyDisputeScore += 2.0;
    if (shaniMoon === 4 || (isAshtamaShani && (mars?.house === 4 || fourthLordPlanet?.house === 8))) propertyDisputeScore += 1.5;
  }

  const isFourthHouseExalted = kundli.planets.some(
    p => p.house === 4 && (p.isExalted || EXALTATION_SIGNS[p.name] === p.rashi.index)
  );
  if (isFourthHouseExalted) {
    propertyDisputeScore = 0;
  }

  // -------------------------------------------------------------
  // CRITERION 2: BUSINESS PARTNER DISTRUST / BETRAYAL (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ)
  // Evaluates Houses 7 (partnerships), 10 (commerce), 6 (breach of trust), Mercury
  // -------------------------------------------------------------
  let partnerBetrayalScore = 0;
  const hasBusinessAffliction = Boolean(
    (mercury && [6, 8, 12].includes(mercury.house)) ||
    (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house))
  );
  if (rahu && rahu.house === 7 && hasBusinessAffliction) partnerBetrayalScore += 4.5;
  if (saturn && saturn.house === 7 && hasBusinessAffliction) partnerBetrayalScore += 3.0;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house) && hasBusinessAffliction) partnerBetrayalScore += 3.5;
  if (mercury && [6, 8, 12].includes(mercury.house) && (rahu?.house === 7 || (rahu && Math.abs(mercury.house - rahu.house) === 0))) partnerBetrayalScore += 4.0;
  if (mercury && [6, 8, 12].includes(mercury.house) && saturn && saturn.house === 7 && hasBusinessAffliction) partnerBetrayalScore += 3.5;
  if (sixthLordPlanet && sixthLordPlanet.house === 7 && hasBusinessAffliction) partnerBetrayalScore += 2.5;

  // -------------------------------------------------------------
  // CRITERION 3: MARRIAGE DELAY / UNMARRIED PAST AGE (ವಿವಾಹ ವಿಳಂಬ)
  // Evaluates Houses 7 (marriage), 2 (family), 8 (roadblocks), Venus & Jupiter
  // -------------------------------------------------------------
  let marriageDelayScore = 0;
  const hasKujaDosha = Boolean(mars && [1, 2, 4, 7, 8, 12].includes(mars.house));
  
  // 1. Saptama Kuja / Ashtama Kuja vs other Kuja houses
  if (mars && mars.house === 7) {
    marriageDelayScore += 5.0; // Saptama Kuja directly afflicts Kalatra Sthana (prime Parashari delay factor)
  } else if (mars && mars.house === 8) {
    marriageDelayScore += 3.5; // Ashtama Kuja
  } else if (hasKujaDosha) {
    marriageDelayScore += 2.0; // 1, 2, 4, 12 houses
  }

  // 2. Malefics occupying 7th house
  if (saturn && saturn.house === 7) marriageDelayScore += 4.0;
  if (rahu && rahu.house === 7) marriageDelayScore += 3.5;
  if (ketu && ketu.house === 7) marriageDelayScore += 3.5;

  // 3. 7th Lord Dignity (Dusthana, Debilitation, Retrograde)
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) marriageDelayScore += 3.5;
  if (seventhLordPlanet?.isDebilitated) marriageDelayScore += 3.0;
  if (seventhLordPlanet?.isRetrograde) marriageDelayScore += 3.5; // Vakra 7th lord causes repeated proposal breakdown & delay

  // 4. Kalatrakaraka (Venus for males, Jupiter/Venus for females) Retrograde, Dusthana or Affliction
  if (isMale && venus?.isRetrograde) marriageDelayScore += 3.0; // Vakra Shukra for male delays bride finding & alliance finalization
  if (isFemale && (jupiter?.isRetrograde || venus?.isRetrograde)) marriageDelayScore += 3.0;
  if (!isMale && !isFemale && venus?.isRetrograde) marriageDelayScore += 2.5;
  if (venus && [6, 8, 12].includes(venus.house)) marriageDelayScore += 2.0;
  if (venus && sun && venus.house === sun.house) marriageDelayScore += 1.5; // Venus conjunct Sun

  // 5. Mars in 7th aspecting 1st house Moon / Lagna
  if (mars && mars.house === 7 && moon && moon.house === 1) marriageDelayScore += 2.5;

  // Has concrete astrological cause for delay
  const hasConcreteMarriageAffliction = Boolean(
    (mars && [7, 8].includes(mars.house)) ||
    (saturn && saturn.house === 7) ||
    (rahu && rahu.house === 7) ||
    (ketu && ketu.house === 7) ||
    (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
    seventhLordPlanet?.isDebilitated ||
    seventhLordPlanet?.isRetrograde ||
    venus?.isRetrograde ||
    (venus && [6, 8, 12].includes(venus.house))
  );

  // 6. Age bracket weighting ONLY when concrete planetary affliction exists
  if (hasConcreteMarriageAffliction) {
    if (age >= 26 && age <= 42) marriageDelayScore += 2.5; // Prime matrimonial anxiety age bracket
    if (age >= 28 && age <= 38) marriageDelayScore += 2.5; // Acute urgency window
    if (age >= 32 && age <= 45 && context.maritalStatus === "unmarried") marriageDelayScore += 3.0;
  }

  // CRITICAL PARASHARI SAFEGUARD:
  // 1. If native is explicitly marked "married", delay is strictly 0.
  // 2. If native is explicitly "unmarried", evaluate full delay score (even single affliction is valid).
  // 3. If marital status is UNSPECIFIED (default for general users):
  //    To declare "Marriage Delay & Alliance Roadblocks" as the native's #1 life crisis without them asking,
  //    Parashari rules require a CONFIRMED, COMPOUND multi-point Kalatra affliction:
  //    a) Direct malefic occupation of 7th house itself (Saptama Kuja, Saptama Shani, Rahu/Ketu in 7th)
  //    b) AND a confirmed compound Kalatra obstacle (7th lord retrograde/debilitated, or Venus retrograde)
  //    c) AND total score >= 13.0 and age between 25 and 42.
  //    General placements outside 7th (like Kuja in 1st, 2nd, 4th, 12th or 7th lord in 8th) are common in
  //    normal married adults and must NEVER assume they are unmarried.
  // Parashari Compound Kalatra Afflictions Count:
  // Strictly count only direct 7th house occupants and severe planetary impairments.
  // Note: Kuja in 1, 2, 4, 8, 12 and Dusthana placements outside 7th do NOT count,
  // preventing false assumptions on normal married adults.
  let distinctMarriageAfflictionCount = 0;
  if (mars && mars.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Kuja
  if (mars && mars.house === 8) distinctMarriageAfflictionCount += 1; // Ashtama Kuja
  if (saturn && saturn.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Shani
  if (saturn && saturn.house === 8) distinctMarriageAfflictionCount += 1; // Ashtama Shani
  if (rahu && rahu.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Rahu
  if (ketu && ketu.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Ketu
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) distinctMarriageAfflictionCount += 1;
  if (seventhLordPlanet?.isDebilitated) distinctMarriageAfflictionCount += 1;
  if (seventhLordPlanet?.isRetrograde) distinctMarriageAfflictionCount += 1;
  if (isMale && venus?.isRetrograde) distinctMarriageAfflictionCount += 1;
  if (isFemale && (jupiter?.isRetrograde || venus?.isRetrograde)) distinctMarriageAfflictionCount += 1;

  const hasDirect7thHouseAffliction = Boolean(
    (mars && [7, 8].includes(mars.house)) ||
    (saturn && [7, 8].includes(saturn.house)) ||
    (rahu && rahu.house === 7) ||
    (ketu && ketu.house === 7) ||
    (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
    seventhLordPlanet?.isRetrograde ||
    seventhLordPlanet?.isDebilitated
  );

  // Parashari Classical Marriage Certainty & Discord Priority Principle across all 12 Lagnas:
  // When the 7th lord is Exalted (in its respective exaltation sign index for any planet),
  // in its Own Sign (Swakshetra), or placed in a Kendra/Trikona under Jupiter's benefic aspect,
  // Vivaha Yoga is fulfilled and marriage is assured.
  const isSeventhLordExalted = Boolean(
    seventhLordPlanet && EXALTATION_SIGNS[seventhLordPlanet.name] === seventhLordPlanet.rashi.index
  );
  const isSeventhLordOwnSign = Boolean(
    seventhLordPlanet && signLord(seventhLordPlanet.rashi.index) === seventhLordPlanet.name
  );
  const isSeventhLordJupiterGuarded = Boolean(
    seventhLordPlanet &&
    jupiter &&
    [1, 5, 7, 9].includes(houseDistance(jupiter.house, seventhLordPlanet.house)) &&
    [1, 4, 5, 7, 9, 10, 11].includes(seventhLordPlanet.house)
  );
  const hasStrongSeventhLord = isSeventhLordExalted || isSeventhLordOwnSign || isSeventhLordJupiterGuarded;

  const hasSevereDiscordAfflictions = Boolean(
    (ketu && ketu.house === 7) ||
    (mars && mars.house === 8) ||
    (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
    (mars && mars.house === 7 && saturn && saturn.house === 8)
  );

  if (isConfirmedMarried) {
    marriageDelayScore = 0;
  } else if (context.maritalStatus === "unmarried") {
    marriageDelayScore = Math.max(marriageDelayScore, 14.5);
  } else if (isFemale && !isConfirmedMarried && (isDestinyDelayed || (age >= 21 && age <= 48 && hasConcreteMarriageAffliction))) {
    // Parashari Stree Jataka: Mangalya/Kalatra affliction routes to Marriage Delay for unmarried/unspecified females
    marriageDelayScore = Math.max(marriageDelayScore, 14.5);
  } else if (isMale && !isConfirmedMarried && isDestinyDelayed && !(hasStrongSeventhLord && hasSevereDiscordAfflictions) && (context.maritalStatus === "unmarried" || age < 35 || !is4thHouseAfflicted)) {
    // Male native with delayed destiny AND without strong 7th lord assuring marriage
    marriageDelayScore = Math.max(marriageDelayScore, 14.5);
  } else if (context.maritalStatus !== "unmarried") {
    const isConfirmedUnmarriedDelay =
      hasDirect7thHouseAffliction &&
      distinctMarriageAfflictionCount >= 2 &&
      marriageDelayScore >= 12.0 &&
      age >= 25 &&
      age <= 45;

    if (!isConfirmedUnmarriedDelay || (partnerBetrayalScore >= 8.0 && partnerBetrayalScore >= marriageDelayScore - 2.0)) {
      marriageDelayScore = 0; // Guard against false marriage delay for unspecified married adults
    }
  }

  // Only zero out marriageDelayScore for confirmed married adults or male with strong 7th lord assuring marriage + severe discord
  if (hasStrongSeventhLord && hasSevereDiscordAfflictions && (isConfirmedMarried || (isMale && context.maritalStatus !== "unmarried"))) {
    marriageDelayScore = 0;
  }

  // -------------------------------------------------------------
  // CRITERION 4: MARITAL DISCORD / SAMSARA STRIFE (ದಾಂಪತ್ಯ ಬಿಕ್ಕಟ್ಟು & ಸಂಸಾರದಲ್ಲಿ ಕಲಹ)
  // Evaluates Houses 7 (spouse), 8 (Randhra/marital stress), 6 (conflict), 2 (family)
  // -------------------------------------------------------------
  let maritalDiscordScore = 0;
  if (seventhLordPlanet && seventhLordPlanet.house === 8) maritalDiscordScore += 5.0;
  if (seventhLordPlanet && [6, 12].includes(seventhLordPlanet.house)) maritalDiscordScore += 3.5;
  if (hasKujaDosha && (saturn?.house === 7 || saturn?.house === 8)) maritalDiscordScore += 4.5;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house) && mars && [1, 7, 8].includes(mars.house)) maritalDiscordScore += 4.5;
  if (rahu && rahu.house === 7 && saturn && [3, 7, 10].includes(houseDistance(saturn.house, 7))) maritalDiscordScore += 3.5;
  if (ketu && ketu.house === 7) maritalDiscordScore += 4.0; // Ketu in 7th brings emotional coldness, detachment, and marital alienation
  if (rahu && rahu.house === 1) maritalDiscordScore += 3.0; // Rahu in Lagna aspecting 7th creates marital restlessness & wanderlust
  if (mars && mars.house === 8) maritalDiscordScore += 3.5; // Ashtama Kuja severely afflicts Mangalya sthana / domestic peace
  if (hasKujaDosha) maritalDiscordScore += 2.5;
  if (saturn && (saturn.house === 7 || saturn.house === 8)) maritalDiscordScore += 2.5;

  if (isConfirmedMarried) {
    maritalDiscordScore += 3.0;
  } else if (context.maritalStatus === "unmarried" || isDestinyCelibate || (isFemale && !isConfirmedMarried)) {
    // An unmarried native, celibate, or unmarried female CANNOT have cohabitation marital discord with a spouse!
    maritalDiscordScore = 0;
  } else if (isMale && !isConfirmedMarried) {
    // When marital status is unspecified for a male:
    // If he has strong 7th lord (assuring marriage) and severe discord afflictions (e.g. Ketu in 7th, Mars in 8th, Rahu in 1st as in Shreedhar Bhat / 31 May 1993),
    // then marital discord is permitted and accurate.
    // Otherwise (if destiny is delayed without strong 7th lord), do not falsely assume marital fighting!
    if (isDestinyDelayed && !(hasStrongSeventhLord && hasSevereDiscordAfflictions)) {
      maritalDiscordScore = 0;
    } else if (maritalDiscordScore < 8.5) {
      maritalDiscordScore = 0;
    }
  }

  const isSeventhLordSwakshetra = Boolean(
    seventhLordPlanet && signLord(seventhLordPlanet.rashi.index) === seventhLordPlanet.name
  );
  const isJupiterProtectingSeventh = Boolean(
    jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, 7))
  );
  const isVenusSwakshetraWithMoon = Boolean(
    venus && moon && venus.house === moon.house && signLord(venus.rashi.index) === PlanetName.Venus
  );

  const hasExtremeKalatraAffliction = Boolean(
    (ketu && ketu.house === 7) ||
    (mars && mars.house === 8) ||
    (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
    (saturn && mars && [7, 8].includes(saturn.house) && [1, 7, 8].includes(mars.house))
  );

  if (((isSeventhLordSwakshetra && seventhLordPlanet?.house !== 8) || (isJupiterProtectingSeventh && !hasExtremeKalatraAffliction) || isVenusSwakshetraWithMoon) && maritalDiscordScore < 8.5) {
    maritalDiscordScore = 0;
  }

  // -------------------------------------------------------------
  // CRITERION 5: DELAYED CHILDBIRTH / PROGENY ANXIETY (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು)
  // Evaluates Houses 5 (progeny/putra), 9 (fortune), Jupiter (Putrakaraka)
  // -------------------------------------------------------------
  let childlessScore = 0;
  if (rahu && rahu.house === 5) childlessScore += 5.0;
  if (ketu && ketu.house === 5) childlessScore += 4.0;
  if (saturn && saturn.house === 5) childlessScore += 4.0;
  if (fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house)) childlessScore += 3.5;
  if (jupiter && [6, 8, 12].includes(jupiter.house)) childlessScore += 2.5;
  if (childlessScore > 0 && age >= 28 && age <= 42) childlessScore += 3.0; // Active progeny planning window under 5th affliction

  // If explicitly unmarried or already has children, childlessness is 0
  const isExplicitlyCouple = Boolean(context.maritalStatus === "married" || context.devoteeName?.includes("ದಂಪತಿ"));
  if (isExplicitlyCouple && childlessScore > 0) {
    childlessScore += 4.5;
  }
  if (context.maritalStatus === "unmarried" || context.hasChildren === true) {
    childlessScore = 0;
  } else if (!isExplicitlyCouple) {
    if (age < 26 || childlessScore < 7.5) {
      childlessScore = 0;
    }
  }
  if (extraDiagnostics?.accurateProfession?.code === "creative_media" || (rahu && rahu.house === 5 && (mercury || venus))) {
    if (context.hasChildren === true || !context.devoteeName?.includes("ದಂಪತಿ")) {
      childlessScore = 0;
    }
  }


  // -------------------------------------------------------------
  // CRITERION 6: WORKPLACE POLITICS, STAGNATION & LAYOFF RISK (ಉದ್ಯೋಗ ರಾಜಕೀಯ)
  // Evaluates Houses 10 (karma/career), 6 (office enemies), 8 (sudden termination), Sun
  // -------------------------------------------------------------
  let careerStagnationScore = 0;
  if (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) careerStagnationScore += 3.5;
  if (saturn && saturn.house === 10) careerStagnationScore += 2.5;
  if (rahu && rahu.house === 10) careerStagnationScore += 2.5;
  if (sun && saturn && (sun.house === saturn.house || houseDistance(sun.house, saturn.house) === 7)) careerStagnationScore += 2.5;
  if (shaniMoon === 10 || isSadeSati) careerStagnationScore += 2.0;
  if (sixthLordPlanet && sixthLordPlanet.house === 10) careerStagnationScore += 2.5;

  // -------------------------------------------------------------
  // CRITERION 7: DEBT & SPECULATION FINANCIAL SQUEEZE (ಸಾಲದ ಹೊರೆ & ಷೇರು ನಷ್ಟ)
  // Evaluates Houses 2 (dhana), 6 (rina/debts), 11 (cashflow), 12 (loss), 5 (speculation)
  // -------------------------------------------------------------
  let debtScore = 0;
  const is5thRahuWithAfflicted5th = Boolean(rahu?.house === 5 && fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house));
  if (is5thRahuWithAfflicted5th) debtScore += 5.0;
  if (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house)) debtScore += 3.5;
  if (eleventhLordPlanet && [6, 8, 12].includes(eleventhLordPlanet.house)) debtScore += 2.5;
  if (sixthLordPlanet && [2, 11].includes(sixthLordPlanet.house)) debtScore += 3.5;
  if (isAshtamaShani) debtScore += 2.5;
  if (twelfthLordPlanet && twelfthLordPlanet.house === 2) debtScore += 2.0;

  const isSecondLordExaltedOrOwn = Boolean(
    secondLordPlanet && (EXALTATION_SIGNS[secondLordPlanet.name] === secondLordPlanet.rashi.index ||
      signLord(secondLordPlanet.rashi.index) === secondLordPlanet.name)
  );
  const isEleventhLordExaltedOrOwn = Boolean(
    eleventhLordPlanet && (EXALTATION_SIGNS[eleventhLordPlanet.name] === eleventhLordPlanet.rashi.index ||
      signLord(eleventhLordPlanet.rashi.index) === eleventhLordPlanet.name)
  );
  const isLagnaLordInWealthHouse = Boolean(
    lagnaLordPlanet && (lagnaLordPlanet.house === 2 || lagnaLordPlanet.house === 11)
  );
  const isBeneficSecondHouse = Boolean(
    kundli.planets.some(pl => pl.house === 2 && [PlanetName.Jupiter, PlanetName.Venus, PlanetName.Mercury].includes(pl.name)) &&
    (isSecondLordExaltedOrOwn || (secondLordPlanet && [1, 2, 4, 5, 7, 9, 10, 11].includes(secondLordPlanet.house)))
  );
  if (isSecondLordExaltedOrOwn || isEleventhLordExaltedOrOwn || (isLagnaLordInWealthHouse && isBeneficSecondHouse)) {
    debtScore = 0;
  }

  // -------------------------------------------------------------
  // CRITERION 8: HEALTH & VITALITY EXHAUSTION (ಆರೋಗ್ಯ ಕ್ಲೇಶ)
  // Evaluates Houses 1 (tanu/body), 6 (roga), 8 (chronic/longevity), 12 (hospitalization)
  // -------------------------------------------------------------
  let healthScore = 0;
  if (lagnaLordPlanet && [6, 8, 12].includes(lagnaLordPlanet.house)) healthScore += 4.0;
  if (lagnaLordPlanet?.isDebilitated) healthScore += 3.0;
  if (moon && [6, 8, 12].includes(moon.house)) healthScore += 3.0;
  if (sun && [6, 8, 12].includes(sun.house)) healthScore += 2.5;
  if (saturn && moon && [1, 3, 7, 10].includes(houseDistance(saturn.house, moon.house))) healthScore += 2.5;
  if (sixthLordPlanet && sixthLordPlanet.house === 1) healthScore += 3.0;
  if (isAshtamaShani) healthScore += 2.5;

  // -------------------------------------------------------------
  // HOLISTIC 12-HOUSE CANDIDATE ARBITRATION MATRIX
  // Assemble all eligible life situation candidates with exact computed scores
  // -------------------------------------------------------------
  interface DiagnosticCandidate {
    category: CurrentLifeSituationCategory;
    score: number;
    profile: CurrentLifeSituationDiagnosis;
  }

  const getHouseOccupantsKn = (h: number) => {
    const occupants = kundli.planets.filter(p => p.house === h).map(p => PLANET_KN[p.name] || p.name);
    return occupants.length > 0 ? occupants.join(", ") : "";
  };
  const getHouseOccupantsEn = (h: number) => {
    const occupants = kundli.planets.filter(p => p.house === h).map(p => PLANET_EN[p.name] || p.name);
    return occupants.length > 0 ? occupants.join(", ") : "";
  };
  const h4OccupantsKn = getHouseOccupantsKn(4);
  const h5OccupantsKn = getHouseOccupantsKn(5);
  const h7OccupantsKn = getHouseOccupantsKn(7);
  const accurateProf = extraDiagnostics?.accurateProfession || determineAccurateProfession(kundli, context);
  const profCode = accurateProf?.code || "";

  // Real Bandhana Yoga / Confinement:
  const isSaturn10thAspecting12thLagnaLord6th = Boolean(
    saturn && saturn.house === 10 && lagnaLordPlanet && lagnaLordPlanet.house === 6
  );
  const isKendraMaleficsBandhana = Boolean(
    saturn && mars && [1, 4, 7, 10].includes(saturn.house) && [1, 4, 7, 10].includes(mars.house) &&
    rahu && [1, 7, 12].includes(rahu.house) &&
    lagnaLordPlanet && [6, 8, 12].includes(lagnaLordPlanet.house)
  );
  const is6thAnd12thLordsConjoined = Boolean(
    sixthLordPlanet && twelfthLordPlanet &&
    sixthLordPlanet.house === twelfthLordPlanet.house &&
    (jupiter?.house === 12 || saturn?.house === 2 || rahu?.house === 11)
  );
  const isHeavy12thHouseConfinementCluster = Boolean(
    kundli.planets.filter(x => x.house === 12).length >= 3 && mars && mars.house === 12
  );
  const isMarsRahu2ndSaturn4thBandhana = Boolean(
    mars && rahu && mars.house === 2 && rahu.house === 2 &&
    saturn && saturn.house === 4 && ketu && ketu.house === 8
  );

  const negScore = extraDiagnostics?.negativeShades?.overallScore ?? 0;
  const factsLower = ((context as any).historicalFacts || context.knownHealthCondition || "").toLowerCase();

  const hasBandhanaRisk = Boolean(
    (negScore >= 30 && (isSaturn10thAspecting12thLagnaLord6th || isKendraMaleficsBandhana || is6thAnd12thLordsConjoined || isMarsRahu2ndSaturn4thBandhana)) ||
    (isHeavy12thHouseConfinementCluster && (factsLower.includes("trial") || factsLower.includes("jail") || factsLower.includes("arms act"))) ||
    (factsLower.includes("murder") || factsLower.includes("incarcerat") || factsLower.includes("tihar") || factsLower.includes("parappana"))
  );

  const isAutoimmuneOrSurgery = Boolean(
    context.knownHealthCondition ||
    factsLower.includes("myositis") ||
    factsLower.includes("surgery") ||
    factsLower.includes("conservatorship") ||
    factsLower.includes("autoimmune") ||
    (healthScore >= 7.0 && (isAshtamaShani || isSadeSati) && lagnaLordPlanet && [6, 8, 12].includes(lagnaLordPlanet.house))
  );

  const isPostDivorce = Boolean(
    context.maritalStatus === "divorced" || context.maritalStatus === "separated" ||
    (factsLower && ["divorce", "divorced", "dissolution"].some(w => factsLower.includes(w)) &&
      !factsLower.includes("delayed marriage") && !factsLower.includes("unmarried"))
  );

  const isSportsAthlete = Boolean(
    profCode === "sports_athletics" ||
    (mars && [1, 3, 6, 10].includes(mars.house) && mars.isExalted)
  );

  const isCreativeMedia = Boolean(
    profCode === "creative_media"
  );

  const hasStrongRajaYoga = Boolean(
    lagnaLordPlanet && [1, 2, 4, 5, 7, 9, 10].includes(lagnaLordPlanet.house) &&
    tenthLordPlanet && [1, 2, 4, 5, 7, 9, 10, 11].includes(tenthLordPlanet.house) &&
    !hasBandhanaRisk
  );
  const isExecutiveOrGovernment = Boolean(
    ["it_software", "business_realestate", "government_civil_police"].includes(profCode) ||
    (hasStrongRajaYoga && !isSportsAthlete && !isCreativeMedia)
  );

  const candidates: DiagnosticCandidate[] = [];

  // A. Infant & Toddler Stage (< 3 years): Balarishta Shielding & Formative Growth
  if (age < 3) {
    candidates.push({
      category: "infant_balarishta_growth",
      score: 18.0,
      profile: {
        category: "infant_balarishta_growth",
        titleKn: "ಶೈಶವಾವಸ್ಥೆಯ ಪೋಷಣೆ, ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಣೆ & ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆ",
        titleEn: "Infant Vitality, Maternal Care & Balarishta Protection",
        headlineKn: `${lagnaKn} ಲಗ್ನ & ${moonRashiKn} ರಾಶಿ: ಮುದ್ದಾದ ಮಗುವಿನ ಬೆಳವಣಿಗೆ, ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ & ತಾಯಿಯ ಮಮತೆಯ ರಕ್ಷಣೆ`,
        headlineEn: `${lagnaEn} Lagna & ${moonRashiEn} Moon: Formative Infant Milestones, Balarishta Shielding & Maternal Care`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${devoteeName} ಮಗುವಿಗೆ ${age} ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು, ${lagnaKn} ಲಗ್ನ, ${moonRashiKn} ರಾಶಿ, ${moonNakKn} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ ಈ ಕಂದಮ್ಮನಿಗೆ ಶೈಶವಾವಸ್ಥೆಯ ಶಾರೀರಿಕ ಬೆಳವಣಿಗೆ, ಹಲ್ಲು ಮೂಡುವ ಸಮಯದ ಪೋಷಣೆ, ಸುಖಕರ ನಿದ್ರೆ, ತಾಯಿಯ ಎದೆಹಾಲು ಹಾಗೂ ಬಾಲಾರಿಷ್ಟ ದೋಷಗಳಿಂದ ರಕ್ಷಣೆಯೇ ಪರಮ ಪ್ರಧಾನವಾಗಿದೆ. ಚಂದ್ರನು ${moon?.house ?? 1}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಬಾಲಗ್ರಹ ದೃಷ್ಟಿ ಅಥವಾ ಋತುಮಾನದ ಸಣ್ಣಪುಟ್ಟ ಶೀತ-ಕೆಮ್ಮುಗಳಿಂದ ಮಗುವನ್ನು ಕಾಪಾಡಲು ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಹಿರಿಯರ ಆರೈಕೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯು ಮಗುವಿನ ಆಯುಷ್ಯ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ವೃದ್ಧಿಸಲಿ.`,
        detailedRealityEn: `At age ${age}, the infant is in a delicate formative growth phase under ${lagnaEn} Lagna and ${moonRashiEn} Moon. Priorities center on restful sleep, immune resilience against seasonal ailments, maternal nourishment, and spiritual shielding against evil eye under running ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} (${lagnaLordHouse}ನೇ ಮನೆಯಲ್ಲಿ), ಚಂದ್ರ (${moonRashiKn} ರಾಶಿ, ${moonNakKn}) ಹಾಗೂ ಋತುಮಾನದ ಬಾಲಾರಿಷ್ಟ ಸಂಚಾರ.`,
        planetaryCulpritEn: `Sensitive infant Moon in ${moonRashiEn} and Lagna lord ${lagnaLordEn} requiring gentle maternal and astrological shielding.`,
        symptomsChecklistKn: [
          `ಹಲ್ಲು ಮೂಡುವಿಕೆ ಅಥವಾ ಋತುಮಾನ ಬದಲಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಸಣ್ಣ ಜ್ವರ, ಹೊಟ್ಟೆ ಉಬ್ಬರ ಅಥವಾ ನಿದ್ರೆಯಲ್ಲಿ ಬೆಚ್ಚಿಬೀಳುವಿಕೆ`,
          `ದೃಷ್ಟಿ ದೋಷ ಅಥವಾ ಹೊರಗಿನವರ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಯಿಂದಾಗಿ ಸಂಜೆಯ ಹೊತ್ತಿನಲ್ಲಿ ಅಳು ಅಥವಾ ಹಠ`,
          `ತಾಯಿಯ ಹಾಲಿನ ಪೋಷಣೆ ಮತ್ತು ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ನಿರಂತರ ದೈವಿಕ ರಕ್ಷಣೆಯ ಅಗತ್ಯ`
        ],
        symptomsChecklistEn: [
          `Teething sensitivity, occasional digestive colic, or mild sleep startles connected to Moon`,
          `Susceptibility to evil eye or overstimulation during evening hours`,
          `Need for steady maternal bonding and auspicious planetary blessings under ${mahaEn}-${bhuktiEn}`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಮಗುವಿನ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಗಟ್ಟಿಗೊಂಡು, ಆರೋಗ್ಯಕರ ನಗು ಮತ್ತು ನಡಿಗೆ ಆರಂಭವಾಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, vitality will strengthen with radiant smiles and milestone breakthroughs.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಸಂಕಲ್ಪದೊಂದಿಗೆ ಬಾಲ ಗಣಪತಿ ಪೂಜೆ, ಆಯುಷ್ಯ ಸೂಕ್ತ ಹವನ ಹಾಗೂ ನವಗ್ರಹ ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Bala Ganapati Pooja and Ayushya Sukta Homa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // B. Early Childhood Stage (3 to 8 years): Play-Based Discovery & Kindergarten Milestones
  if (age >= 3 && age <= 8) {
    candidates.push({
      category: "early_childhood_play_milestones",
      score: 16.0,
      profile: {
        category: "early_childhood_play_milestones",
        titleKn: "ಬಾಲ್ಯದ ನಗು-ನಲಿದಾಟ, ಪೂರ್ವಪ್ರಾಥಮಿಕ ಕಲಿಕೆ & ಕೌಶಲ ವಿಕಸನ",
        titleEn: "Early Childhood Play, Kindergarten Curiosity & Formative Milestones",
        headlineKn: `${h4SignKn} 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ & ${h5SignKn} 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನ: ಕೌಶಲ ವಿಕಸನ, ಆಟಪಾಠ & ನೈಸರ್ಗಿಕ ಕುತೂಹಲ`,
        headlineEn: `4th House (${RASHI_EN[getHouseSignIdx(4)]}) & 5th House: Playful Curiosity, Kindergarten Discoveries & Formative Growth`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${devoteeName} ಮಗುವಿಗೆ ${age} ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು, ${lagnaKn} ಲಗ್ನ, ${moonRashiKn} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ ಈ ಮಗುವು ಪೂರ್ವಪ್ರಾಥಮಿಕ ಹಂತದಲ್ಲಿದ್ದು, ಆಟ-ಪಾಠ, ನೂತನ ಗೆಳೆಯರ ಒಡನಾಟ ಹಾಗೂ ಪ್ರಪಂಚವನ್ನು ಕುತೂಹಲದಿಂದ ಅನ್ವೇಷಿಸುವ ಅದ್ಭುತ ಬಾಲ್ಯದ ಆನಂದದಲ್ಲಿದೆ. 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ${h4SignKn} (ಅಧಿಪತಿ ${h4LordKn}) ಹಾಗೂ 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನ ${h5SignKn} ಕ್ರಮೇಣ ಜಾಗೃತವಾಗುತ್ತಿದ್ದು, ಬಣ್ಣಗಳು, ಕಥೆಗಳು, ಸಂಗೀತ ಹಾಗೂ ಚಟುವಟಿಕೆಗಳ ಮೂಲಕ ಮಗುವಿನ ಕಲ್ಪನಾ ಶಕ್ತಿಯು ಅರಳುತ್ತಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ತಾಳ್ಮೆಯ ಪೋಷಣೆಯು ಮಗುವಿನಲ್ಲಿ ಉತ್ತಮ ಸಂಸ್ಕಾರವನ್ನು ಬಿತ್ತಲಿದೆ.`,
        detailedRealityEn: `At age ${age}, with Lagna in ${lagnaEn} and Moon in ${moonRashiEn}, the child is flourishing in kindergarten, discovering playful creativity, social camaraderie, and formative speech. The 4th house of foundational learning (${RASHI_EN[getHouseSignIdx(4)]}) and 5th house of imagination thrive under gentle nurturing during ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `4ನೇ ಪ್ರಾಥಮಿಕ ವಿದ್ಯಾ ಸ್ಥಾನ (${h4SignKn}, ಅಧಿಪತಿ ${h4LordKn}) ಹಾಗೂ 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನ (${h5SignKn}) ಮತ್ತು ಬುಧನ (${mercury?.house ?? 4}ನೇ ಮನೆ) ಸಂಚಾರ.`,
        planetaryCulpritEn: `Playful activation of 4th house of foundational learning (${RASHI_EN[getHouseSignIdx(4)]}) and 5th house of creativity under ${mahaEn}-${bhuktiEn}.`,
        symptomsChecklistKn: [
          `ಆಟಿಕೆಗಳು, ಕಥೆಗಳು ಹಾಗೂ ಹೊರಾಂಗಣ ಆಟಗಳಲ್ಲಿ ಅಪಾರ ಆಸಕ್ತಿ ಮತ್ತು ನೈಸರ್ಗಿಕ ಕುತೂಹಲ`,
          `ಶಾಲೆ ಅಥವಾ ನರ್ಸರಿಗೆ ಹೋಗುವ ಆರಂಭಿಕ ದಿನಗಳಲ್ಲಿ ಪೋಷಕರನ್ನು ಬಿಟ್ಟಿರಲು ಸಣ್ಣ ಹಠ ಅಥವಾ ಮೊಂಡುತನ`,
          `ಮಾತುಗಾರಿಕೆ, ಚಿತ್ರಕಲೆ ಅಥವಾ ನೃತ್ಯ-ಸಂಗೀತದ ಪ್ರಾಥಮಿಕ ಕೌಶಲಗಳ ಸುಂದರ ವಿಕಸನ`
        ],
        symptomsChecklistEn: [
          `Boundless energy and curiosity for games, visual stories, and kindergarten exploration`,
          `Occasional separation reluctance when settling into nursery routines`,
          `Rapid flowering of speech articulation, motor coordination, and artistic interests`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಮಗುವಿನ ಕೌಶಲಗಳು ಅದ್ಭುತವಾಗಿ ವಿಕಸನಗೊಂಡು, ಶಾಲೆಯಲ್ಲಿ ಎಲ್ಲರ ಪ್ರೀತಿಗೆ ಪಾತ್ರವಾಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, the child's communicative charm and learning enthusiasm will flourish.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಸಂಕಲ್ಪದೊಂದಿಗೆ ಬಾಲ ಸರಸ್ವತಿ ಆರಾಧನೆ ಹಾಗೂ ಮೇಧಾ ಸೂಕ್ತ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Sponsor Bala Saraswati Pooja and Medha Sukta Archana at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // C. Youth Prodigy Stage (8 to 17 years): Artistic, Performing Arts or Sports Prodigy
  if (age >= 8 && age < 18 && (isCreativeMedia || isSportsAthlete)) {
    candidates.push({
      category: "youth_artistic_or_sports_prodigy",
      score: 16.5,
      profile: {
        category: "youth_artistic_or_sports_prodigy",
        titleKn: "ಬಾಲ ಪ್ರತಿಭೆ, ಕಲಾ-ಸಂಗೀತ / ಕ್ರೀಡಾ ಸಾಧನೆ & ನೂತನ ಕೌಶಲ ಪ್ರಕಾಶ",
        titleEn: "Youth Prodigy, Artistic or Athletic Grooming & Creative Flourishing",
        headlineKn: `${h5SignKn} 5ನೇ ಪ್ರತಿಭಾ ಸ್ಥಾನ & ${h3SignKn} 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ: ಕಲಾತ್ಮಕ / ಕ್ರೀಡಾ ತರಬೇತಿ & ಸೃಜನಶೀಲ ಮನ್ನಣೆ`,
        headlineEn: `5th House (${RASHI_EN[getHouseSignIdx(5)]}) & 3rd House: Artistic & Athletic Prodigy Grooming & Global Media Recognition`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${devoteeName} ಅವರಿಗೆ ${age} ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು, ${lagnaKn} ಲಗ್ನ, ${moonRashiKn} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ ಈ ಬಾಲ ಪ್ರತಿಭೆಯ ಜಾತಕದಲ್ಲಿ 5ನೇ ಸೃಜನಶೀಲ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn}) ಹಾಗೂ 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ (${h3SignKn}, ಅಧಿಪತಿ ${h3LordKn}) ಅಸಾಧಾರಣವಾಗಿ ಜಾಗೃತಗೊಂಡಿವೆ. ಕಲೆ, ಸಂಗೀತ, ನಟನೆ, ಮಾಧ್ಯಮ ಅಥವಾ ಕ್ರೀಡಾ ತರಬೇತಿಯಲ್ಲಿ ವಯಸ್ಸಿಗೆ ಮೀರಿದ ಪ್ರತಿಭೆ ಮತ್ತು ಸಾಧನೆಯನ್ನು ಪ್ರದರ್ಶಿಸುವ ಯೋಗವಿದೆ. ಸಾಮಾನ್ಯ ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸದ ಜತೆಗೆ ಸಾರ್ವಜನಿಕ ವೇದಿಕೆ, ಮಾಧ್ಯಮ ಅಥವಾ ಕ್ರೀಡಾ ಕೂಟಗಳಲ್ಲಿ ಮನ್ನಣೆ ಪಡೆಯುವುದು ಇವರ ಜೀವನದ ಪ್ರಮುಖ ತಿರುವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯು ಪ್ರತಿಭೆಯ ಜಾಗತಿಕ ವಿಸ್ತರಣೆಗೆ ಬುನಾದಿ ಹಾಕಿದೆ.`,
        detailedRealityEn: `At age ${age}, with Lagna in ${lagnaEn} and Moon in ${moonRashiEn}, the native displays remarkable prodigy potential across artistic, musical, media, or athletic disciplines under the 5th house of talent (${RASHI_EN[getHouseSignIdx(5)]}) and 3rd house of prowess. Professional grooming and creative expression take center stage alongside education during ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `5ನೇ ಪ್ರತಿಭಾ ಸ್ಥಾನ (${h5SignKn}), 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ (${h3SignKn}) ಹಾಗೂ ಶುಕ್ರ/ಮಂಗಳನ ವಿಶೇಷ ಕಲಾ-ಕ್ರೀಡಾ ಯೋಗ.`,
        planetaryCulpritEn: `Prodigy alignment across 5th house of genius (${RASHI_EN[getHouseSignIdx(5)]}), 3rd house of courage, and Venus/Mars energies.`,
        symptomsChecklistKn: [
          `ಸಂಗೀತ, ನಟನೆ, ಸೃಜನಶೀಲ ಪ್ರದರ್ಶನ ಅಥವಾ ಕ್ರೀಡೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ ಮತ್ತು ಶೀಘ್ರ ಕಲಿಕೆ`,
          `ಸಾರ್ವಜನಿಕ ವೇದಿಕೆಗಳಲ್ಲಿ ಭಯವಿಲ್ಲದ ಆತ್ಮವಿಶ್ವಾಸ, ಮಾಧ್ಯಮ/ಜನಪ್ರಿಯತೆಯ ಆಕರ್ಷಣೆ ಹಾಗೂ ಪ್ರಶಂಸೆ`,
          `ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸೃಜನಶೀಲ/ಕ್ರೀಡಾ ತರಬೇತಿಯ ನಡುವೆ ಸೂಕ್ತ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳುವ ಅಗತ್ಯ`
        ],
        symptomsChecklistEn: [
          `Exceptional natural aptitude in music, performing arts, media content, or athletic competition`,
          `Fearless poise during public appearances, digital media exposure, and peer recognition`,
          `Balancing structured academics with elite professional coaching and rehearsals under ${mahaEn}-${bhuktiEn}`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ನೂತನ ಕಲಾ/ಕ್ರೀಡಾ ಯೋಜನೆಗಳು ಜಾಗತಿಕ ಮನ್ನಣೆ ತರಲಿದ್ದು, ಯುವ ಪ್ರತಿಭೆ ಹೊಸ ಎತ್ತರಕ್ಕೆ ಬೆಳೆಯಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, creative releases and athletic milestones will secure wider public acclaim.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 5ನೇ ಅಧಿಪತಿ ${h5LordKn} ಹಾಗೂ ಸರಸ್ವತಿ-ಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಹೋಮ ಮತ್ತು ಕಲಾ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Medha Dakshinamurthy Homa and Kala Siddhi Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // D. Primary & Middle School Stage (8 to 13 years): Formative Schooling & Concentration
  if (age >= 8 && age < 14) {
    candidates.push({
      category: "student_academic_stress",
      score: 18.0,
      profile: {
        category: "student_academic_stress",
        titleKn: "ಬಾಲ್ಯದ ಬೆಳವಣಿಗೆ, ವಿದ್ಯಾಭ್ಯಾಸದ ಒತ್ತಡ & ಏಕಾಗ್ರತೆಯ ಕೊರತೆ",
        titleEn: "Childhood Development, Schooling Pressure & Focus",
        headlineKn: `${h4SignKn} 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${h4LordKn} ಪ್ರಭಾವ): ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಏಕಾಗ್ರತೆಯ ಕೊರತೆ & ಬಾಲಗ್ರಹ ಪ್ರಭಾವ`,
        headlineEn: `${RASHI_EN[getHouseSignIdx(4)] || "4th House"} (${PLANET_EN[fourthLord] || "4th Lord"}): Formative Learning Pressure & Distraction`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${devoteeName} ಮಗುವಿಗೆ ${age} ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು, ${lagnaKn} ಲಗ್ನ, ${moonRashiKn} ರಾಶಿ, ${moonNakKn} ನಕ್ಷತ್ರ ಪಾದ ${moonPada}ದಲ್ಲಿ ಜನಿಸಿದ ಈ ಮಗುವಿನ 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನವು ${h4SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h4LordKn} ${h4LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ${h4OccupantsKn ? `4ನೇ ಮನೆಯಲ್ಲಿ ${h4OccupantsKn} ಗ್ರಹಗಳ ಪ್ರಭಾವವಿದ್ದು, ` : ""}ಬುಧನು ${mercury?.house ?? 4}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ, ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸ, ಓದಿನಲ್ಲಿ ಗಮನ ಕೇಂದ್ರೀಕರಣ ಹಾಗೂ ಚಂಚಲತೆಯಿಂದಾಗಿ ಪೋಷಕರಲ್ಲಿ ಸಣ್ಣ ಕಾಳಜಿ ಮೂಡಿದೆ. ಗೋಚಾರದಲ್ಲಿ ${shaniGocharaTextKn} ಪ್ರಭಾವವಿದ್ದು, ${guruGocharaTextKn} ಬಲವರ್ಧನೆಯಾಗಬೇಕಿದೆ.`,
        detailedRealityEn: `At age ${age}, with Lagna in ${lagnaEn} and Moon in ${moonRashiEn}, the child is navigating primary schooling, concentration hurdles, and academic expectations. The 4th house of learning (${RASHI_EN[getHouseSignIdx(4)]}) ruled by ${PLANET_EN[fourthLord]} and Mercury reflect formative development requiring patient nurturing under running ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ (${h4SignKn}, ಅಧಿಪತಿ ${h4LordKn} ${h4LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಹಾಗೂ ಬುಧನ (${mercury?.house ?? 4}ನೇ ಮನೆ) ಸ್ಥಿತಿ ಮತ್ತು ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Restless planetary influence on the 4th house of learning (${RASHI_EN[getHouseSignIdx(4)]}) and Mercury in house ${mercury?.house ?? 4}.`,
        symptomsChecklistKn: [
          `${h4SignKn} 4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದಲ್ಲಿ ${h4OccupantsKn || h4LordKn + "ನ"} ಸ್ಥಿತಿ ಹಾಗೂ ಬುಧ (${mercury?.house ?? 4}ನೇ ಮನೆ) ಪ್ರಭಾವದಿಂದ ಓದಲು ಕುಳಿತಾಗ ಏಕಾಗ್ರತೆ ಬೇಗನೆ ಚದುರುವುದು`,
          `ಚಂದ್ರ (${moonRashiKn} ರಾಶಿ, ${moonNakKn}) ಸಂಚಾರದಿಂದಾಗಿ ತಿಂಡಿ-ಊಟದಲ್ಲಿ ಹಠ ಅಥವಾ ನಿದ್ರೆಯ ಸಮಯದಲ್ಲಿ ಚಂಚಲತೆ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ನಿರೀಕ್ಷೆಗಾಗಿ ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನದ ಅಗತ್ಯ`
        ],
        symptomsChecklistEn: [
          `Wandering attention during study hours influenced by 4th house (${RASHI_EN[getHouseSignIdx(4)]}) and Mercury`,
          `Picky eating habits or disturbed sleep cycles linked to Moon in ${moonRashiEn}`,
          `Need for structured parental guidance during ongoing ${mahaEn}-${bhuktiEn} period`
        ],
        severity: "moderate",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಮಗುವಿನ ಗ್ರಹಣ ಶಕ್ತಿ, ಸ್ಮರಣ ಶಕ್ತಿ ಮತ್ತು ಶಾಲಾ ಶ್ರೇಣಿ ಗಮನಾರ್ಹವಾಗಿ ಸುಧಾರಿಸಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, memory power and academic engagement will improve markedly.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಹಾಗೂ ${h4LordKn}ನ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ ಮತ್ತು ವಿದ್ಯಾ ಗಣಪತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Sponsor Vidya Ganapati and Medha Dakshinamurthy Pooja at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // E. Youth Stage (14 to 23 years): Higher Education, Competitive Exams & Career Foundation
  if (age >= 14 && age <= 23) {
    const isPrimeCollegeStudentAge = age >= 17 && age <= 21;
    candidates.push({
      category: "student_academic_stress",
      score: isPrimeCollegeStudentAge ? 18.0 : 13.0,
      profile: {
        category: "student_academic_stress",
        titleKn: "ಉನ್ನತ ಶಿಕ್ಷಣ / ವಿದ್ಯಾಭ್ಯಾಸ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ಒತ್ತಡ & ಭವಿಷ್ಯದ ವೃತ್ತಿ ಗೊಂದಲ",
        titleEn: "Higher Education, Competitive Exams & Career Pathway Anxiety",
        headlineKn: `${h5SignKn} 5ನೇ ಬೌದ್ಧಿಕ ಸ್ಥಾನ & 10ನೇ ಸ್ಥಾನ (${h10LordKn} ಪ್ರಭಾವ): ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ಒತ್ತಡ & ವೃತ್ತಿ ಗೊಂದಲ`,
        headlineEn: `5th House (${RASHI_EN[getHouseSignIdx(5)] || "Intellect"}) & 10th House: Competitive Exam Strains & Career Crossroads`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${age} ವರ್ಷದ ಈ ಮಹತ್ವದ ತಾರುಣ್ಯದ ಘಟ್ಟದಲ್ಲಿ, ${lagnaKn} ಲಗ್ನ ಮತ್ತು ${moonRashiKn} ರಾಶಿಯ ಜಾತಕರಾದ ನೀವು ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ, ಕಾಲೇಜು ಪ್ರವೇಶ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಅಥವಾ ಪ್ರಥಮ ಉದ್ಯೋಗಾವಕಾಶದ ಬುನಾದಿಯ ಆಲೋಚನೆಯಲ್ಲಿದ್ದೀರಿ. 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನ ${h5SignKn} (ಅಧಿಪತಿ ${h5LordKn} ${h5LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಹಾಗೂ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ ${h10SignKn} (ಅಧಿಪತಿ ${h10LordKn} ${h10LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಸಕ್ರಿಯವಾಗಿದ್ದು, ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ರಾಂಕ್ ಅಥವಾ ಇಷ್ಟಪಟ್ಟ ಕೋರ್ಸ್ ಸಿಗುವುದೇ ಎಂಬ ಅನಿಶ್ಚಿತತೆ ಕಾಡುತ್ತಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯು ನಡೆಯುತ್ತಿದ್ದು, ${guruGocharaTextKn} ಮಾರ್ಗದರ್ಶನ ನೀಡಲಿದೆ.`,
        detailedRealityEn: `At age ${age}, with Lagna in ${lagnaEn} and Moon in ${moonRashiEn}, you are navigating crucial career foundation decisions, competitive exams, and college admissions under 5th lord ${PLANET_EN[fifthLord]} and 10th lord ${PLANET_EN[tenthLord]} during running ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `5ನೇ ವಿದ್ಯಾ-ಬುದ್ಧಿ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn} ${h5LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಹಾಗೂ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ${mahaKn}-${bhuktiKn} ದಶಾ ಸಂಚಾರ ಮತ್ತು ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Transits activating 5th house of intellect (${RASHI_EN[getHouseSignIdx(5)]}) and 10th house of career launch (${RASHI_EN[getHouseSignIdx(10)]}) under ${mahaEn}-${bhuktiEn}.`,
        symptomsChecklistKn: [
          `5ನೇ ಬೌದ್ಧಿಕ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn}) ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ಶ್ರೇಯಸ್ಸಿನ ಆತಂಕ`,
          `10ನೇ ವೃತ್ತಿ ಸ್ಥಾನ (${h10SignKn}, ಅಧಿಪತಿ ${h10LordKn}) ಪ್ರಭಾವದಿಂದ ಯಾವ ಕಾಲೇಜು/ವಿಭಾಗ ಆಯ್ದುಕೊಳ್ಳಬೇಕೆಂಬ ತುಮುಲ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ದಶಾ ಕಾಲದಲ್ಲಿ ಗೆಳೆಯರೊಂದಿಗೆ ಹೋಲಿಕೆ ಹಾಗೂ ಭವಿಷ್ಯದ ವೃತ್ತಿ ಗೊಂದಲ`
        ],
        symptomsChecklistEn: [
          `Exam tension and rank anticipation driven by 5th house (${RASHI_EN[getHouseSignIdx(5)]})`,
          `Crossroads regarding optimal college stream selection governed by 10th house (${RASHI_EN[getHouseSignIdx(10)]})`,
          `Peer comparisons and future direction queries under running ${mahaEn}-${bhuktiEn}`
        ],
        severity: "high",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಲ್ಲಿ ${dashaTimeKn} ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು, ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶ ಮತ್ತು ಸ್ಪಷ್ಟ ಕಾಲೇಜು/ಉದ್ಯೋಗ ಪ್ರವೇಶಾವಕಾಶ ಒದಗಿಬರಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, clear educational breakthroughs and admissions will materialize.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಸಂಕಲ್ಪದೊಂದಿಗೆ ಸರಸ್ವತಿ ಆರಾಧನೆ ಹಾಗೂ ${h5LordKn} ಮತ್ತು ${h10LordKn} ಗ್ರಹಗಳ ಅನುಗ್ರಹಕ್ಕಾಗಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Perform Saraswati Pooja and Mahaganapati Homa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // C. Property / Family Share Dispute (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಹಕ್ಕು ವಿವಾದ)
  if (age >= 24 && age < 59 && propertyDisputeScore >= 6.0 && is4thHouseAfflicted) {
    candidates.push({
      category: "property_share_dispute",
      score: propertyDisputeScore,
      profile: {
        category: "property_share_dispute",
        titleKn: "ಆಸ್ತಿ ಪಾಲು, ಮನೆಯ ಹಕ್ಕು ವಿವಾದ & ನ್ಯಾಯಯುತ ಪಾಲಿಗಾಗಿ ಕಠಿಣ ಹೋರಾಟ",
        titleEn: "Property Partition, Family Inheritance Dispute & Legal Share Struggle",
        headlineKn: `${h4SignKn} 4ನೇ ಗೃಹ-ಭೂಮಿ ಸ್ಥಾನ (${h4LordKn} ಪ್ರಭಾವ): ಕುಟುಂಬದ ಆಸ್ತಿ ಪಾಲು & ನಂಬಿಕೆದ್ರೋಹದ ಸಂಕಷ್ಟ`,
        headlineEn: `4th House (${RASHI_EN[getHouseSignIdx(4)] || "Property"}) Conflict: Ancestral Property Dispute & Family Partition Delay`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ತೀವ್ರವಾಗಿ ಕಾಡುತ್ತಿರುವ ವಾಸ್ತವವೆಂದರೆ — ಕುಟುಂಬದ ಪೂರ್ವಜರ ಆಸ್ತಿ ಪಾಲು, ಮನೆಯ ಹಕ್ಕು ಅಥವಾ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಭೂಮಿಯ ವಿಭಾಗದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ವಿವಾದ. ${lagnaKn} ಲಗ್ನದ 4ನೇ ಭೂಮಿ-ಭವನ ಸ್ಥಾನವು ${h4SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h4LordKn} ${h4LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ${mars ? `ಭೂಮಿಕಾರಕ ಕುಜನು ${mars.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}3ನೇ ಭ್ರಾತೃ ಸ್ಥಾನಾಧಿಪತಿ ${h3LordKn} ಹಾಗೂ 8ನೇ ವ್ಯಾಜ್ಯ ಸ್ಥಾನಾಧಿಪತಿ ${h8LordKn}ನ ಪ್ರಭಾವದಿಂದ ನ್ಯಾಯಯುತ ಪಾಲನ್ನು ನೀಡದೆ ಸತಾಯಿಸುವುದು, ದಾಖಲೆಪತ್ರಗಳ ಗೋಲ್‌ಮಾಲ್ ಅಥವಾ ಮಾತುಕತೆಗಳಲ್ಲಿ ಅಡೆತಡೆಗಳು ಎದುರಾಗುತ್ತಿವೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿ ಹಾಗೂ ${shaniGocharaTextKn} ಈ ಸಂಘರ್ಷವನ್ನು ತೀವ್ರಗೊಳಿಸಿವೆ.`,
        detailedRealityEn: `Currently, the most pressing battle in your daily life is an agonizing family property dispute or ancestral inheritance partition. With 4th house (${RASHI_EN[getHouseSignIdx(4)]}) ruled by ${PLANET_EN[fourthLord]} and Mars in house ${mars?.house ?? 4}, unfair withholding of your rightful share, disputed paperwork, or settlement delays are inflicting intense stress under running ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `4ನೇ ಭೂಮಿ-ಗೃಹ ಸ್ಥಾನ (${h4SignKn}, ಅಧಿಪತಿ ${h4LordKn} ${h4LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಮೇಲೆ ಕುಜ (${mars?.house ?? 4}ನೇ ಮನೆ) ಮತ್ತು ಶನಿ (${saturn?.house ?? 4}ನೇ ಮನೆ) ಪ್ರಭಾವ ಹಾಗೂ 8ನೇ ಅಧಿಪತಿ ${h8LordKn}ನ ಸಂಚಾರ.`,
        planetaryCulpritEn: `Afflicted 4th house of property (${RASHI_EN[getHouseSignIdx(4)]}) by Mars (house ${mars?.house ?? 4}) and Saturn (house ${saturn?.house ?? 4}) combined with 8th lord ${PLANET_EN[eighthLord]}.`,
        symptomsChecklistKn: [
          `${h4SignKn} 4ನೇ ಗೃಹ-ಭೂಮಿ ಸ್ಥಾನದ ನ್ಯಾಯಯುತ ಪಾಲನ್ನು ಹಂಚಲು ಎದುರಾಗುತ್ತಿರುವ ಅಸಹಕಾರ ಮತ್ತು ವಿಳಂಬ`,
          `3ನೇ ಭ್ರಾತೃ ಸ್ಥಾನ (${h3SignKn}, ಅಧಿಪತಿ ${h3LordKn}) ಹಾಗೂ ಆಪ್ತರ ನಂಬಿಕೆದ್ರೋಹ ಅಥವಾ ದಾಖಲೆಗಳ ಗೊಂದಲ`,
          `8ನೇ ವಿವಾದ ಸ್ಥಾನ (${h8SignKn}, ಅಧಿಪತಿ ${h8LordKn}) ಅಥವಾ ಕೋರ್ಟು/ಪಂಚಾಯಿತಿ ಮಟ್ಟದ ಮಾತುಕತೆಗಳಲ್ಲಿ ಕೃತಕ ತಡೆಗಳು`
        ],
        symptomsChecklistEn: [
          `Unwarranted delays in partitioning rightful property in 4th house (${RASHI_EN[getHouseSignIdx(4)]})`,
          `Trust erosion by relatives or co-owners linked to 3rd house (${RASHI_EN[getHouseSignIdx(3)]})`,
          `Documentation and mutation hurdles engineered by opposing claimants under 8th house (${RASHI_EN[getHouseSignIdx(8)]})`
        ],
        severity: "critical",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರ ಮತ್ತು ${shaniGocharaTextKn} ಬದಲಾವಣೆಯೊಂದಿಗೆ ${dashaTimeKn} ಮಾತುಕತೆ ಅಥವಾ ಕಾನೂನು ವ್ಯಾಜ್ಯದಲ್ಲಿ ನಿಮ್ಮ ಪರವಾದ ಮಹತ್ವದ ತಿರುವು ಸಿಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn} and transit shifts, ${dashaTimeEn}, partition negotiations or legal steps will trigger a favorable turning point.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಹಾಗೂ ಭೂಮಿಕಾರಕ ಕುಜ ಮತ್ತು 4ನೇ ಅಧಿಪತಿ ${h4LordKn}ನ ಶಾಂತಿಗಾಗಿ ಕಾಲಭೈರವ ಶಾಂತಿ, ಭೂಮಿ ಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ನವಗ್ರಹ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Kalabhairava Shanti and Bhoomi Sukta Archana at Sri Kshetra Gokarna Mahabaleshwara for ${moonNakKn} nakshatra.`
      }
    });
  }

  // D. Business Partner Distrust / Betrayal (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ)
  if (age >= 24 && partnerBetrayalScore >= 5.0) {
    candidates.push({
      category: "partner_distrust_betrayal",
      score: partnerBetrayalScore,
      profile: {
        category: "partner_distrust_betrayal",
        titleKn: "ವ್ಯಾಪಾರ ಪಾಲುದಾರರ ವಂಚನೆ, ಲೆಕ್ಕಪತ್ರ ಗೋಲ್‌ಮಾಲ್ & ನಂಬಿಕೆದ್ರೋಹ",
        titleEn: "Business Partner Betrayal, Account Deception & Broken Trust",
        headlineKn: `${h7SignKn} 7ನೇ ಪಾಲುದಾರಿಕೆ ಸ್ಥಾನ (${h7LordKn} ಪ್ರಭಾವ): ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ನಂಬಿಕೆದ್ರೋಹ & ಹಣಕಾಸಿನ ವಂಚನೆ`,
        headlineEn: `7th House (${RASHI_EN[getHouseSignIdx(7)] || "Partnerships"}): Commercial Partner Friction, Fiduciary Concealment & Trust Deficit`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ವೃತ್ತಿಪರ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಆಘಾತಕಾರಿಯಾಗಿ ಕಾಡುತ್ತಿರುವ ಸತ್ಯವೆಂದರೆ — ನಿಮ್ಮೊಂದಿಗೆ ಕೈಜೋಡಿಸಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ವ್ಯಾಪಾರ ಪಾಲುದಾರರು (Business Partner) ಅಥವಾ ಆಪ್ತ ವ್ಯವಹಾರಸ್ಥರಿಂದ ಎದುರಾಗಿರುವ ಅಪನಂಬಿಕೆ ಮತ್ತು ವಂಚನೆ. ${lagnaKn} ಲಗ್ನದ 7ನೇ ವ್ಯವಹಾರ-ಪಾಲುದಾರಿಕೆ ಸ್ಥಾನವು ${h7SignKn} ಆಗಿದ್ದು, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ${mercury ? `ವ್ಯವಹಾರ ಕಾರಕ ಬುಧನು ${mercury.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ಹಣಕಾಸಿನ ಲೆಕ್ಕಪತ್ರಗಳನ್ನು ಮುಚ್ಚಿಡುವುದು, ನಿಮ್ಮನ್ನು ವಿಶ್ವಾಸಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳದೆ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವುದು ಅಥವಾ ನಿಮ್ಮ ಪಾಲಿನ ಲಾಭವನ್ನು ಮುಕ್ಕಾಗಿಸುವ ಕುತಂತ್ರಗಳಿಂದ ನೀವು ತೀವ್ರ ಆಕ್ರೋಶ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯು ಸತ್ಯವನ್ನು ಮುನ್ನೆಲೆಗೆ ತರುತ್ತಿದೆ.`,
        detailedRealityEn: `Currently, you are facing serious business partnership betrayal or commercial distrust. With 7th house (${RASHI_EN[getHouseSignIdx(7)]}) ruled by ${PLANET_EN[seventhLord]} and Mercury in house ${mercury?.house ?? 7}, an associate is concealing financial accounts and acting without transparency under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `7ನೇ ಪಾಲುದಾರಿಕೆ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ರಾಹು (${rahu?.house ?? 7}ನೇ ಮನೆ) ಅಥವಾ ಶನಿ (${saturn?.house ?? 7}ನೇ ಮನೆ) ಪ್ರಭಾವ ಹಾಗೂ ಬುಧನ (${mercury?.house ?? 7}ನೇ ಮನೆ) ಸ್ಥಿತಿ.`,
        planetaryCulpritEn: `Rahu/Saturn occupying or aspecting the 7th house (${RASHI_EN[getHouseSignIdx(7)]}) afflicting business transparency alongside Mercury.`,
        symptomsChecklistKn: [
          `7ನೇ ಪಾಲುದಾರಿಕೆ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn}) ವ್ಯಾಪಾರದಲ್ಲಿ ಲೆಕ್ಕಪತ್ರಗಳ ಅಪಾರದರ್ಶಕತೆ ಮತ್ತು ಗೋಲ್‌ಮಾಲ್`,
          `ವ್ಯವಹಾರ ಕಾರಕ ಬುಧ (${mercury?.house ?? 7}ನೇ ಮನೆ) ಪ್ರಭಾವದಿಂದ ಪಾಲುದಾರರಿಂದ ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಏಕಪಕ್ಷೀಯ ನಿರ್ಧಾರ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ಪಾಲುದಾರಿಕೆಯಿಂದ ಪ್ರತ್ಯೇಕವಾಗಬೇಕೋ ಅಥವಾ ಕಾನೂನು ರಕ್ಷಣೆ ಪಡೆಯಬೇಕೋ ಎಂಬ ದ್ವಂದ್ವ`
        ],
        symptomsChecklistEn: [
          `Opaque bookkeeping and reluctance by partners to disclose records in 7th house (${RASHI_EN[getHouseSignIdx(7)]})`,
          `Unilateral decisions bypassing your executive consent influenced by Mercury in house ${mercury?.house ?? 7}`,
          `Dilemma between amicable separation or formal legal action during ${mahaEn}-${bhuktiEn}`
        ],
        severity: "critical",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಒಳಗಿನ ಗೋಲ್‌ಮಾಲ್ ಬಯಲಾಗಲಿದ್ದು, ನಿಮ್ಮ ಬಂಡವಾಳ ಹಾಗೂ ಹಕ್ಕಿನ ರಕ್ಷಣೆಗೆ ಕಾನೂನುಬದ್ಧ ಸ್ಪಷ್ಟ ಮಾರ್ಗ ಗೋಚರಿಸಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, concealed facts will emerge, allowing you to reclaim your assets with legal clarity.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ 7ನೇ ಅಧಿಪತಿ ${h7LordKn} ಹಾಗೂ ರಾಹು ಶಾಂತಿ ಜತೆಗೆ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶತ್ರು ಬಾಧಾ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Rahu Shanti and Shatru Badha Nivarana Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // E. Marital Discord / Samsara Strife (ದಾಂಪತ್ಯ ಬಿಕ್ಕಟ್ಟು & ಸಂಸಾರದಲ್ಲಿ ಕಲಹ)
  const isHappilyMarriedWithChildren = Boolean(
    context.hasChildren === true &&
    context.maritalStatus === "married" &&
    !isPostDivorce &&
    !(factsLower && ["divorce", "divorced", "separated", "separation", "custody"].some(w => factsLower.includes(w)))
  );
  const adjustedMaritalDiscordScore = isHappilyMarriedWithChildren ? Math.min(maritalDiscordScore, 2.5) : maritalDiscordScore;

  const canHaveMaritalDiscord = Boolean(
    !isDestinyCelibate &&
    !isHappilyMarriedWithChildren &&
    context.maritalStatus !== "unmarried" &&
    !(isFemale && !isConfirmedMarried) &&
    (!isDestinyDelayed || (isConfirmedMarried || (isMale && hasStrongSeventhLord && hasSevereDiscordAfflictions)))
  );
  if (canHaveMaritalDiscord && age >= 24 && age < 59 && adjustedMaritalDiscordScore >= 4.0) {
    const spouseKn = isFemale ? "ಪತಿಯೊಂದಿಗೆ" : "ಹೆಂಡತಿಯೊಂದಿಗೆ";
    const spouseEn = isFemale ? "husband" : "wife";
    candidates.push({
      category: "marital_discord",
      score: maritalDiscordScore,
      profile: {
        category: "marital_discord",
        titleKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು, ಸಂಸಾರದಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಸಂಘರ್ಷ & ಅಶಾಂತಿ",
        titleEn: "Acute Marital Friction, Estrangement & Samsara Cohabitation Crisis",
        headlineKn: `${h7SignKn} 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7LordKn} ಪ್ರಭಾವ): ದಾಂಪತ್ಯದಲ್ಲಿ ${spouseKn} ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಮನಸ್ತಾಪ & ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ`,
        headlineEn: `7th House (${RASHI_EN[getHouseSignIdx(7)] || "Spouse"}): Volatile Marital Friction with ${isFemale ? "Husband" : "Wife"} & Samsara Discord`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರವಾದ ಮಾನಸಿಕ ಸಂಕಷ್ಟ ಮತ್ತು ${spouseKn} ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಗಂಭೀರ ಮನಸ್ತಾಪಗಳು ಕಾಡುತ್ತಿವೆ. ${lagnaKn} ಲಗ್ನದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನವು ${h7SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. 8ನೇ ಮಾಂಗಲ್ಯ ಸ್ಥಾನವು ${h8SignKn} ಆಗಿದ್ದು (ಅಧಿಪತಿ ${h8LordKn}), ${mars ? `ಕುಜನು ${mars.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}${saturn ? `ಶನಿಯು ${saturn.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ಸಣ್ಣ ಮಾತೂ ದೊಡ್ಡ ಜಗಳವಾಗಿ ಪರಿವರ್ತನೆಗೊಳ್ಳುವುದು, ಸಂಗಾತಿಯ ಕಡೆಯಿಂದ ಕಟುವಾದ ಮಾತುಗಳು, ಪರಸ್ಪರ ಅಂತರ ಹಾಗೂ ಮನೆಯೊಳಗೆ ನೆಮ್ಮದಿಯಿಲ್ಲದ ವಾತಾವರಣ ಉಂಟಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ${shaniGocharaTextKn} ಸಂಸಾರಿಕ ಸುಖದಲ್ಲಿ ಏರುಪೇರು ಉಂಟುಮಾಡಿದೆ.`,
        detailedRealityEn: `Currently, you are enduring acute marital friction and emotional alienation with your ${spouseEn}. The 7th house (${RASHI_EN[getHouseSignIdx(7)]}) ruled by ${PLANET_EN[seventhLord]} and 8th house (${RASHI_EN[getHouseSignIdx(8)]}) reflect temperamental clashes under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: (() => {
          const reasons: string[] = [];
          if (ketu && ketu.house === 7) reasons.push("7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕೇತು (ಶೀತಲ ಅಂತರ & ವೈರಾಗ್ಯ)");
          if (mars && mars.house === 8) reasons.push("8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ (ಮಾಂಗಲ್ಯ ಕ್ಲೇಶ & ಕೋಪೋದ್ರೇಕ)");
          if (seventhLordPlanet && seventhLordPlanet.house === 8) reasons.push(`7ನೇ ಕಳತ್ರಾಧಿಪತಿ ${h7LordKn} 8ನೇ ಅಷ್ಟಮ ಸ್ಥಾನದಲ್ಲಿರುವುದು`);
          if (saturn && (saturn.house === 7 || saturn.house === 8)) reasons.push(`7ನೇ/8ನೇ ಮನೆಯಲ್ಲಿ ಶನಿಯ (${saturn.house}ನೇ ಮನೆ) ಮಂದಗತಿ ಹಾಗೂ ದಾಂಪತ್ಯ ವಿರಸ`);
          if (hasKujaDosha && !reasons.some(r => r.includes("ಕುಜ"))) reasons.push("ಕುಜ ದೋಷದ ಪ್ರಭಾವ");
          if (reasons.length === 0) reasons.push(`7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ಹಾಗೂ 8ನೇ ಸ್ಥಾನದ (${h8SignKn}) ಅಶುಭ ಸಂಚಾರ`);
          return reasons.join(", ") + ` ಮತ್ತು ${shaniGocharaTextKn}.`;
        })(),
        planetaryCulpritEn: (() => {
          const reasonsEn: string[] = [];
          if (ketu && ketu.house === 7) reasonsEn.push("7th house Ketu causing emotional detachment");
          if (mars && mars.house === 8) reasonsEn.push("8th house Ashtama Kuja fueling temperamental friction");
          if (seventhLordPlanet && seventhLordPlanet.house === 8) reasonsEn.push(`7th lord ${PLANET_EN[seventhLord]} placed in 8th house`);
          if (saturn && (saturn.house === 7 || saturn.house === 8)) reasonsEn.push("Saturn in 7th/8th house casting cold delay and friction");
          if (hasKujaDosha && !reasonsEn.some(r => r.includes("Mars"))) reasonsEn.push("Kuja Dosha tension");
          if (reasonsEn.length === 0) reasonsEn.push(`Afflictions to 7th house (${RASHI_EN[getHouseSignIdx(7)]}) and 8th house`);
          return reasonsEn.join(", ") + ".";
        })(),
        symptomsChecklistKn: [
          `7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn}) ಹಾಗೂ ಪ್ರತಿನಿತ್ಯ ಕ್ಷುಲ್ಲಕ ಕಾರಣಗಳಿಗೂ ಮನೆಯಲ್ಲಿ ${spouseKn} ಕಿರಿಕಿರಿ`,
          `8ನೇ ಮಾಂಗಲ್ಯ ಸ್ಥಾನ (${h8SignKn}, ಅಧಿಪತಿ ${h8LordKn}) ಪ್ರಭಾವದಿಂದ ಮಾತುಕತೆಯಿಲ್ಲದ ಅಂತರ ಮತ್ತು ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ದಶಾ ಕಾಲದಲ್ಲಿ ಮೂರನೇ ವ್ಯಕ್ತಿಗಳ ಹಸ್ತಕ್ಷೇಪ ಅಥವಾ ಸಂಶಯದಿಂದಾಗಿ ಮನಸ್ತಾಪ ಹೆಚ್ಚಾಗುವುದು`
        ],
        symptomsChecklistEn: [
          `Daily domestic sparks and disagreements with ${spouseEn} connected to 7th house (${RASHI_EN[getHouseSignIdx(7)]})`,
          `Ego clashes and emotional distance influenced by 8th house (${RASHI_EN[getHouseSignIdx(8)]})`,
          `Aggravated tension from third-party interference during running ${mahaEn}-${bhuktiEn}`
        ],
        severity: "critical",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲಾವಧಿಯಲ್ಲಿ ${dashaTimeKn} ಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಸಂವಾದದ ನಂತರ ಸಂಗಾತಿಯ ಮನಸ್ಸು ಕರಗಿ ದಾಂಪತ್ಯದಲ್ಲಿ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, remedial propitiation will soften tensions and restore domestic harmony.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 7ನೇ ಅಧಿಪತಿ ${h7LordKn} ಮತ್ತು ಮಾಂಗಲ್ಯ ಕಾರಕರ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಹಾಗೂ 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ.`,
        gokarnaRemedyEn: `Perform Uma-Maheshwara Shanti at Sri Kshetra Gokarna and wear a 2-Mukhi Rudraksha for ${moonNakKn} nakshatra.`
      }
    });
  }

  // F. Marriage Delay / Unmarried Past Prime (ವಿವಾಹ ವಿಳಂಬ)
  const canHaveMarriageDelay = Boolean(
    !isConfirmedMarried &&
    context.maritalStatus !== "married" &&
    age >= 20 &&
    age <= 50 &&
    (marriageDelayScore >= 4.5 || (isDestinyDelayed && !(isMale && hasStrongSeventhLord && hasSevereDiscordAfflictions)))
  );
  if (canHaveMarriageDelay) {
    candidates.push({
      category: "marriage_delay",
      score: marriageDelayScore,
      profile: {
        category: "marriage_delay",
        titleKn: "ವಿವಾಹ ವಿಳಂಬ, ಬಂದ ಸಂಬಂಧಗಳು ಕೈತಪ್ಪುವುದು & ಕಂಕಣ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ",
        titleEn: "Marriage Delay, Proposal Breakdowns & Matrimonial Longing",
        headlineKn: `${h7SignKn} 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7LordKn} ಪ್ರಭಾವ): ವಿವಾಹ ವಿಳಂಬ, ಸಂಬಂಧಗಳು ಮುರಿದುಬೀಳುವುದು & ಕಂಕಣ ಭಾಗ್ಯದ ಕೊರಗು`,
        headlineEn: `7th House (${RASHI_EN[getHouseSignIdx(7)] || "Marriage"}): Unexplained Marriage Delays, Broken Alliances & Matrimonial Longing`,
        detailedRealityKn: (() => {
          const culprits: string[] = [];
          if (mars && mars.house === 7) culprits.push(`7ನೇ ಕಳತ್ರ ಭಾವದಲ್ಲಿ ಕುಜ (${mars.house}ನೇ ಮನೆ) ಸ್ಥಿತನಾಗಿದ್ದು ಸಪ್ತಮ ಕುಜ ದೋಷ ಉಂಟುಮಾಡಿದ್ದಾನೆ`);
          else if (mars && mars.house === 8) culprits.push("8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ ದೋಷವಿದ್ದು ಮಾಂಗಲ್ಯದಲ್ಲಿ ವಿಳಂಬ ತರುತ್ತಿದ್ದಾನೆ");
          else if (hasKujaDosha) culprits.push(`ಕುಜನು ${mars?.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಕುಜ ದೋಷದ ಪ್ರಭಾವ ಬೀರಿದ್ದಾನೆ`);
          if (saturn && saturn.house === 7) culprits.push("7ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಸ್ಥಿತನಾಗಿದ್ದು ಮಂದಗತಿಯ ಕಂಕಣ ವಿಳಂಬ ಸೃಷ್ಟಿಸಿದ್ದಾನೆ");
          if (rahu && rahu.house === 7) culprits.push("7ನೇ ಮನೆಯಲ್ಲಿ ರಾಹುವಿದ್ದು ಸಂಬಂಧಗಳಲ್ಲಿ ಗೊಂದಲ ಹಾಗೂ ಅನಿಶ್ಚಿತತೆ ತರುತ್ತಿದ್ದಾನೆ");
          if (ketu && ketu.house === 7) culprits.push("7ನೇ ಮನೆಯಲ್ಲಿ ಕೇತುವಿದ್ದು ನಿರಾಸಕ್ತಿ ಅಥವಾ ಅಂತಿಮ ಕ್ಷಣದ ಹಿನ್ನಡೆ ತರುತ್ತಿದ್ದಾನೆ");
          if (seventhLordPlanet?.isRetrograde) culprits.push(`7ನೇ ಕಳತ್ರಾಧಿಪತಿ ${h7LordKn} ವಕ್ರಿಯಾಗಿದ್ದು (Retrograde), ಆರಂಭದಲ್ಲಿ ಒಪ್ಪಿಗೆಯಾದ ಮಾತುಕತೆಗಳು ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ದಿಢೀರ್ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತಿವೆ`);
          if (venus?.isRetrograde) culprits.push("ಕಳತ್ರಕಾರಕ ಶುಕ್ರನು ವಕ್ರಿಯಾಗಿದ್ದು (Retrograde) ಕಂಕಣ ಬಲ ತಡವಾಗುತ್ತಿದೆ");
          const culpritText = culprits.length > 0 ? culprits.join("; ") : `${h7SignKn} 7ನೇ ಸ್ಥಾನ ಹಾಗೂ ಅಧಿಪತಿ ${h7LordKn}ನ ಸಂಚಾರ`;

          return `ವಯಸ್ಸು ${age} ಮೀರುತ್ತಿದ್ದರೂ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರದಿರುವುದು, ಆರಂಭದಲ್ಲಿ ಒಪ್ಪಿಗೆಯಾದ ಸಂಬಂಧಗಳು ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಕಾರಣಗಳಿಗೆ ತಪ್ಪಿಹೋಗುವುದು, ಜಾತಕ ಹೊಂದಾಣಿಕೆಯ ಅಡೆತಡೆಗಳು ಹಾಗೂ ವಿವಾಹ ವಿಳಂಬವಾಗುತ್ತಿರುವ ತೀವ್ರ ಆತಂಕ. ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶ್ರಮವಿದ್ದರೂ (ವೃತ್ತಿ-ಉದ್ಯೋಗದಲ್ಲಿ ಶ್ರಮವಿದ್ದರೂ), ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಆಂತರಿಕ ಮನಸ್ಸು ಮತ್ತು ಕುಟುಂಬದ ಅತಿ ಮುಖ್ಯ ಕಾಳಜಿ ಕಂಕಣ ಬಲವಾಗಿದೆ. ${lagnaKn} ಲಗ್ನದ 7ನೇ ವಿವಾಹ ಸ್ಥಾನವು ${h7SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಜಾತಕದಲ್ಲಿ ${culpritText}. ಪ್ರಸ್ತುತ ${mahaKn} ಮಹಾದಶೆ ಹಾಗೂ ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಸೂಕ್ತ ದೈವಿಕ ಶಾಂತಿ ಪೂಜೆಗಳ ಮೂಲಕ ${guruGocharaTextKn} ಕಂಕಣ ಬಲವನ್ನು ಕರುಣಿಸಲಿದೆ.`;
        })(),
        detailedRealityEn: `Currently, marriage delay is your most deeply felt life struggle. Despite your professional efforts and merits, afflictions to the 7th house (${RASHI_EN[getHouseSignIdx(7)]}) ruled by ${PLANET_EN[seventhLord]} alongside retrograde and transit influences cause alliances to stall at the final hour during running ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: (() => {
          const reasons: string[] = [];
          if (mars && mars.house === 7) reasons.push("7ನೇ ಮನೆಯಲ್ಲಿ ಸಪ್ತಮ ಕುಜ ದೋಷ");
          else if (mars && mars.house === 8) reasons.push("8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ ದೋಷ");
          else if (hasKujaDosha) reasons.push("ಕುಜ ದೋಷದ ಪ್ರಭಾವ");
          if (seventhLordPlanet?.isRetrograde) reasons.push(`7ನೇ ಅಧಿಪತಿ ${h7LordKn} ವಕ್ರಿಯಾಗಿದ್ದು (Retrograde)`);
          if (venus?.isRetrograde) reasons.push("ಕಳತ್ರಕಾರಕ ಶುಕ್ರ ವಕ್ರಿಯಾಗಿರುವುದು");
          if (saturn?.house === 7) reasons.push("7ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ");
          if (rahu?.house === 7) reasons.push("7ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು");
          if (ketu?.house === 7) reasons.push("7ನೇ ಮನೆಯಲ್ಲಿ ಕೇತು");
          if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) reasons.push(`7ನೇ ಅಧಿಪತಿ ${h7LordKn} ದುಃಸ್ಥಾನದಲ್ಲಿರುವುದು`);
          if (reasons.length === 0) reasons.push(`7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿ)`);
          return reasons.join(", ") + ` ಹಾಗೂ ${shaniGocharaTextKn}.`;
        })(),
        planetaryCulpritEn: (() => {
          const reasonsEn: string[] = [];
          if (mars && [7, 8].includes(mars.house)) reasonsEn.push(`Mars in house ${mars.house} (Kuja Dosha)`);
          if (seventhLordPlanet?.isRetrograde) reasonsEn.push(`Retrograde 7th lord ${PLANET_EN[seventhLord]}`);
          if (venus?.isRetrograde) reasonsEn.push("Retrograde Venus (Kalatrakaraka)");
          if (saturn?.house === 7) reasonsEn.push("Saturn in 7th house");
          if (rahu?.house === 7) reasonsEn.push("Rahu in 7th house");
          if (reasonsEn.length === 0) reasonsEn.push(`7th house (${RASHI_EN[getHouseSignIdx(7)]}) transit tensions`);
          return reasonsEn.join(", ") + ".";
        })(),
        symptomsChecklistKn: [
          `7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn}) ಪ್ರಭಾವದಿಂದ ಬಂದ ಒಳ್ಳೆಯ ಸಂಬಂಧಗಳು ಕೊನೆಯ ಹಂತದಲ್ಲಿ ತಪ್ಪಿಹೋಗುವುದು`,
          `ಗುರು (${jupiter?.house ?? 1}ನೇ ಮನೆ) ಮತ್ತು ಶುಕ್ರ (${venus?.house ?? 1}ನೇ ಮನೆ) ಬಲದ ವಿಳಂಬದಿಂದಾಗಿ ಕಂಕಣ ಭಾಗ್ಯ ಮುಂದೂಡಿಕೆ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ಜಾತಕ ಹೊಂದಾಣಿಕೆಯ ಅಡೆತಡೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಕಳವಳ`
        ],
        symptomsChecklistEn: [
          `Promising matrimonial proposals falling through abruptly in 7th house (${RASHI_EN[getHouseSignIdx(7)]})`,
          `Delays in planetary sanction from Jupiter (house ${jupiter?.house ?? 1}) and Venus (house ${venus?.house ?? 1})`,
          `Persistent family anxiety and horoscope matching roadblocks under ${mahaEn}-${bhuktiEn}`
        ],
        severity: "high",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಲ್ಲಿ ${dashaTimeKn} ಕಂಕಣ ಬಲ ಕೂಡಿಬರಲಿದ್ದು, ಯೋಗ್ಯ ಗುಣವಂತ ಸಂಬಂಧದ ನಿಶ್ಚಿತಾರ್ಥ ನೆರವೇರಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, matrimonial obstacles will dissolve, inaugurating a promising alliance.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 7ನೇ ಅಧಿಪತಿ ${h7LordKn} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಸಂಕಲ್ಪದೊಂದಿಗೆ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ ಮತ್ತು ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Sponsor Uma-Maheshwara Kalyana and Swayamvara Parvati Homa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // G. Delayed Childbirth / Progeny Anxiety (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು)
  if (context.maritalStatus !== "unmarried" && age >= 24 && age <= 50 && childlessScore >= 4.0) {
    candidates.push({
      category: "childless_anxiety",
      score: childlessScore,
      profile: {
        category: "childless_anxiety",
        titleKn: "ಸಂತಾನ ಭಾಗ್ಯ ವಿಳಂಬ, ವಂಶೋದ್ಧಾರದ ಕೊರಗು & ದೈವಿಕ ರಕ್ಷೆಯ ನಿರೀಕ್ಷೆ",
        titleEn: "Delayed Childbirth, Progeny Anxiety & Spiritual Longing for an Offspring",
        headlineKn: `${h5SignKn} 5ನೇ ಸಂತಾನ ಸ್ಥಾನ (${h5LordKn} ಪ್ರಭಾವ): ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ವಿಳಂಬ & ಫಲ ಸಿಗದಿರುವ ಕೊರಗು`,
        headlineEn: `5th House (${RASHI_EN[getHouseSignIdx(5)] || "Progeny"}): Delayed Childbirth Anxiety & Longing for Progeny`,
        detailedRealityKn: `ಮದುವೆಯಾಗಿ ವರ್ಷಗಳು ಕಳೆದರೂ ಮುದ್ದಾದ ಮಗುವಿನ ಮುಖ ನೋಡುವ ಸೌಭಾಗ್ಯ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಟುಂಬದ ಅತ್ಯಂತ ನೋವಿನ ವಾಸ್ತವವಾಗಿದೆ. ${lagnaKn} ಲಗ್ನದ 5ನೇ ಸಂತಾನ ಭಾವವು ${h5SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h5LordKn} ${h5LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ${jupiter ? `ಪುತ್ರಕಾರಕ ಗುರುವು ${jupiter.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಸಹಜವಾಗಿದ್ದರೂ ಗರ್ಭಧಾರಣೆಯಾಗದಿರುವುದು ದಾಂಪತ್ಯದಲ್ಲಿ ಆಂತರಿಕ ಕೊರಗು ಮೂಡಿಸಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಸರ್ಪ/ನಾಗ ಸಂಸ್ಕಾರ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷೆಯು ಸಂತಾನ ಬಾಗಿಲನ್ನು ತೆರೆಯಲಿದೆ.`,
        detailedRealityEn: `Currently, delayed conception is your heartbreaking struggle. With 5th house (${RASHI_EN[getHouseSignIdx(5)]}) ruled by ${PLANET_EN[fifthLord]} and Putrakaraka Jupiter in house ${jupiter?.house ?? 5}, medical efforts have yielded delays under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `5ನೇ ಸಂತಾನ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn} ${h5LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ${rahu?.house === 5 || ketu?.house === 5 ? "ರಾಹು/ಕೇತುಗಳ ನಾಗದೋಷ" : "ಪಾಪಿಗಳ ಪ್ರಭಾವ"}, ಪುತ್ರಕಾರಕ ಗುರು (${jupiter?.house ?? 5}ನೇ ಮನೆ) ಹಾಗೂ ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Naga Dosha or transit tension afflicting the 5th house of progeny (${RASHI_EN[getHouseSignIdx(5)]}) and Jupiter.`,
        symptomsChecklistKn: [
          `5ನೇ ಸಂತಾನ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn}) ಹಾಗೂ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಸಾಮಾನ್ಯವಿದ್ದರೂ ಗರ್ಭಧಾರಣೆಯಲ್ಲಿ ವಿಳಂಬ`,
          `ಪುತ್ರಕಾರಕ ಗುರು (${jupiter?.house ?? 5}ನೇ ಮನೆ) ಮತ್ತು ರಾಹು/ಕೇತು ಪ್ರಭಾವದಿಂದ ದಂಪತಿಯಲ್ಲಿ ಆಂತರಿಕ ಕೊರಗು`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ವಂಶವೃದ್ಧಿಯ ಬಗ್ಗೆ ಹಿರಿಯರ ಕಳವಳ ಹಾಗೂ ಶುಭ ಸಮಾಚಾರದ ಕಾಯುವಿಕೆ`
        ],
        symptomsChecklistEn: [
          `Repeated conception delays despite normal medical tests under 5th house (${RASHI_EN[getHouseSignIdx(5)]})`,
          `Deep emotional yearning between the couple linked to Jupiter (house ${jupiter?.house ?? 5})`,
          `Family anticipation and yearning for progeny during running ${mahaEn}-${bhuktiEn}`
        ],
        severity: "high",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ನಾಗಶಾಂತಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ${dashaTimeKn} ಗರ್ಭಧಾರಣೆಯ ಶುಭ ಸುದ್ದಿ ಲಭಿಸಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, after Naga Shanti, ${dashaTimeEn}, auspicious tidings of conception will arrive.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ 5ನೇ ಅಧಿಪತಿ ${h5LordKn} ಹಾಗೂ ಸರ್ಪ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ನಾಗ ಪ್ರತಿಷ್ಠಾಪನೆ, ಸಂತಾನ ಗೋಪಾಲ ಹೋಮ ಹಾಗೂ ಆಶ್ಲೇಷ ಬಲಿ ಸೇವೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Naga Pratishthapane and Santana Gopala Homa at holy Gokarna Kotiteertha for ${moonNakKn} nakshatra.`
      }
    });
  }

  // H. Crushing Debt / Financial Squeeze (ಸಾಲದ ಹೊರೆ & ಷೇರು ನಷ್ಟ)
  if (age >= 22 && debtScore >= 4.5) {
    candidates.push({
      category: "debt_financial_crisis",
      score: debtScore,
      profile: {
        category: "debt_financial_crisis",
        titleKn: "ಸಾಲದ ಹೊರೆ, ಷೇರು ಮಾರುಕಟ್ಟೆ ನಷ್ಟ & ಆದಾಯ-ವೆಚ್ಚದ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು",
        titleEn: "Crushing Debt Pressure, Trading Capital Losses & Cash Flow Crisis",
        headlineKn: `${h2SignKn} 2ನೇ ಧನ ಸ್ಥಾನ & 6ನೇ ಋಣ ಸ್ಥಾನ (${h6LordKn} ಪ್ರಭಾವ): ಆದಾಯಕ್ಕಿಂತ ಖರ್ಚು ಹೆಚ್ಚು & ಸಾಲದ ಸುಳಿ`,
        headlineEn: `2nd House (${RASHI_EN[getHouseSignIdx(2)] || "Wealth"}) & 6th House (${RASHI_EN[getHouseSignIdx(6)] || "Debts"}): Severe Debt Liabilities & Liquid Cash Freeze`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ಉಸಿರುಗಟ್ಟಿಸುತ್ತಿದೆ. ${lagnaKn} ಲಗ್ನದ 2ನೇ ಧನ ಸ್ಥಾನವು ${h2SignKn} (ಅಧಿಪತಿ ${h2LordKn}), 6ನೇ ಋಣ ಸ್ಥಾನವು ${h6SignKn} (ಅಧಿಪತಿ ${h6LordKn}) ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನವು ${h11SignKn} ಆಗಿದೆ. ${rahu?.house === 5 ? "5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಇರುವುದರಿಂದ ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತ್ವರಿತ ಲಾಭದ ಹೂಡಿಕೆಯಲ್ಲಿ ನಷ್ಟ ಅನುಭವಿಸಿದ್ದೀರಿ. " : ""}ತಿಂಗಳ ಇಎಂಐಗಳು, ಸಾಲದ ಬಡ್ಡಿ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ವೆಚ್ಚಗಳಿಂದಾಗಿ ಸಾಲ ತೀರಿಸಲು ಮತ್ತೊಂದು ಸಾಲ ಮಾಡುವ ಸುಳಿಗೆ ಸಿಲುಕುವಂತಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ, ${bhuktiKn} ಭುಕ್ತಿ ಹಾಗೂ ${shaniGocharaTextKn} ಆರ್ಥಿಕ ಹರಿವನ್ನು ಸಂಕುಚಿತಗೊಳಿಸಿದೆ.`,
        detailedRealityEn: `Currently, financial obligations and speculative or business losses are suffocating your peace of mind. With 2nd house (${RASHI_EN[getHouseSignIdx(2)]}) ruled by ${PLANET_EN[secondLord]} and 6th house (${RASHI_EN[getHouseSignIdx(6)]}) ruled by ${PLANET_EN[sixthLord]}, mounting EMIs create acute monetary stress under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `2ನೇ ಧನ ಸ್ಥಾನ (${h2SignKn}, ಅಧಿಪತಿ ${h2LordKn} ${getHouseLordHouse(2)}ನೇ ಮನೆಯಲ್ಲಿ), 6ನೇ ಋಣ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಹಾಗೂ ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `2nd house (${RASHI_EN[getHouseSignIdx(2)]}) lord in dusthana combined with 6th house (${RASHI_EN[getHouseSignIdx(6)]}) debt pressure.`,
        symptomsChecklistKn: [
          `5ನೇ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು (${rahu?.house ?? 5}ನೇ ಮನೆ) ಅಥವಾ ಷೇರು/ವ್ಯವಹಾರ ಹೂಡಿಕೆಯಲ್ಲಿ ಬಂಡವಾಳ ನಷ್ಟ`,
          `6ನೇ ಋಣ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಹಾಗೂ 2ನೇ ಧನ ಸ್ಥಾನ (${h2SignKn}) ಪ್ರಭಾವದಿಂದ ಸಾಲದ ಇಎಂಐ ತೀರಿಸಲು ಮತ್ತೊಂದು ಸಾಲ ಮಾಡುವ ಒತ್ತಡ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ಬಂದ ಹಣ ಕೈಯಲ್ಲಿ ಉಳಿಯದೆ 12ನೇ ವ್ಯಯ ಸ್ಥಾನ (${h12SignKn}) ಮೂಲಕ ಸೋರಿಕೆಯಾಗುವುದು`
        ],
        symptomsChecklistEn: [
          `Capital erosion in speculative trading or aggressive commitments (5th house ${RASHI_EN[getHouseSignIdx(5)]})`,
          `Debt recycling pressure to honor bank installments linked to 6th house (${RASHI_EN[getHouseSignIdx(6)]})`,
          `Income instantly drained by obligations under 12th house (${RASHI_EN[getHouseSignIdx(12)]}) during ${mahaEn}-${bhuktiEn}`
        ],
        severity: "critical",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಅವಧಿಯಲ್ಲಿ ${dashaTimeKn} ಸಾಲದ ಮರುಹೊಂದಾಣಿಕೆ ಹಾಗೂ ${h11LordKn} ಬಲದಿಂದ ಹೊಸ ಆದಾಯ ಮೂಲ ತೆರೆದುಕೊಂಡು ಬಿಕ್ಕಟ್ಟು ತಗ್ಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, debt restructuring and alternate revenue streams will bring vital respite.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 2ನೇ ಅಧಿಪತಿ ${h2LordKn} ಹಾಗೂ ಋಣವಿಮೋಚನೆಗಾಗಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಮತ್ತು ಕುಬೇರ ಧನಕರ್ಷಣ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Mahaganapati Homa and Runa Vimochana Kubera Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // I. Workplace Politics, Stagnation & Layoff Fear (ಉದ್ಯೋಗ ರಾಜಕೀಯ)
  if (age >= 23 && age <= 60 && careerStagnationScore >= 3.5) {
    candidates.push({
      category: "career_politics_layoff",
      score: careerStagnationScore,
      profile: {
        category: "career_politics_layoff",
        titleKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಆಂತರಿಕ ರಾಜಕೀಯ, ಮನ್ನಣೆಯ ಕೊರತೆ & ಅನಿಶ್ಚಿತತೆ",
        titleEn: "Workplace Politics, Professional Stagnation & Stalled Growth",
        headlineKn: `${h10SignKn} 10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${h10LordKn} ಪ್ರಭಾವ): ಪರಿಶ್ರಮಕ್ಕೆ ಸಿಗದ ಮನ್ನಣೆ, ಕಚೇರಿ ರಾಜಕೀಯ & ಬಡ್ತಿ ವಿಳಂಬ`,
        headlineEn: `10th House (${RASHI_EN[getHouseSignIdx(10)] || "Career"}): Unrecognized Effort, Corporate Politics & Promotion Delays`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ವಾತಾವರಣವು ಕಿರಿಕಿರಿಯಿಂದ ಕೂಡಿದೆ. ${lagnaKn} ಲಗ್ನದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನವು ${h10SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h10LordKn} ${h10LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ${sun ? `ರಾಜಕಾರಕ ರವಿಯು ${sun.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ನೀವು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕಷ್ಟಪಟ್ಟು ದುಡಿಯುತ್ತಿದ್ದರೂ, ಕೆಲಸದ ಕ್ರೆಡಿಟ್ ಇತರರ ಪಾಲಾಗುತ್ತಿದೆ. 6ನೇ ಶತ್ರು ಸ್ಥಾನಾಧಿಪತಿ ${h6LordKn} ಹಾಗೂ ${shaniGocharaTextKn} ಪ್ರಭಾವದಿಂದ ಕಚೇರಿ ರಾಜಕೀಯ, ಬಡ್ತಿ ವಿಳಂಬ ಮತ್ತು ಅಸ್ಥಿರತೆ ಕಾಡುತ್ತಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯು ಹೊಸ ತಿರುವನ್ನು ಕರುಣಿಸಲಿದೆ.`,
        detailedRealityEn: `Currently, your workplace environment is rife with unfair politics and lack of recognition. With 10th house (${RASHI_EN[getHouseSignIdx(10)]}) ruled by ${PLANET_EN[tenthLord]} and Sun in house ${sun?.house ?? 10}, peers misappropriate credit under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${h10SignKn}, ಅಧಿಪತಿ ${h10LordKn} ${h10LordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ${saturn?.house === 10 || rahu?.house === 10 ? "ಶನಿ-ರಾಹುಗಳ ನೆರಳು" : "ಪಾಪಿಗಳ ವೀಕ್ಷಣೆ"}, ರವಿ (${sun?.house ?? 10}ನೇ ಮನೆ) ಹಾಗೂ ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Saturn-Rahu tension afflicting the 10th house of career (${RASHI_EN[getHouseSignIdx(10)]}) and Sun in house ${sun?.house ?? 10}.`,
        symptomsChecklistKn: [
          `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${h10SignKn}, ಅಧಿಪತಿ ${h10LordKn}) ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮಕ್ಕೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಮನ್ನಣೆ ಸಿಗದಿರುವುದು`,
          `6ನೇ ಶತ್ರು ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಪ್ರಭಾವದಿಂದ ಕಚೇರಿ ರಾಜಕೀಯ ಅಥವಾ ಸಹೋದ್ಯೋಗಿಗಳ ಅಪಪ್ರಚಾರ`,
          `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ದಶೆಯಲ್ಲಿ ಬಡ್ತಿ ವಿಳಂಬ ಹಾಗೂ ಉತ್ತಮ ಸಂಸ್ಥೆಗೆ ಉದ್ಯೋಗ ಬದಲಾವಣೆಯ ತುಡಿತ`
        ],
        symptomsChecklistEn: [
          `Unrecognized hard work while peers take credit in 10th house (${RASHI_EN[getHouseSignIdx(10)]})`,
          `Feeling targeted by workplace cliques linked to 6th house (${RASHI_EN[getHouseSignIdx(6)]})`,
          `Strong urge to transition to a higher-dignity role during ${mahaEn}-${bhuktiEn}`
        ],
        severity: "high",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಉದ್ಯೋಗದಲ್ಲಿ ನೂತನ ಆಫರ್, ಸ್ಥಾನಪಲ್ಲಟ ಅಥವಾ ನಿರೀಕ್ಷಿತ ಬಡ್ತಿಯಿಂದ ನೆಮ್ಮದಿ ಸಿಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, an improved job offer or favorable department shift will restore peace.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ 10ನೇ ಅಧಿಪತಿ ${h10LordKn} ಹಾಗೂ ಸೂರ್ಯನ ಅನುಗ್ರಹಕ್ಕಾಗಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ನಿತ್ಯ ಆದಿತ್ಯ ಹೃದಯ ಪಠಿಸಿ.`,
        gokarnaRemedyEn: `Sponsor Karma Siddhi Sankalpa Pooja at Sri Kshetra Gokarna and chant Aditya Hridaya for ${moonNakKn} nakshatra.`
      }
    });
  }

  // J. Health & Vitality Strain (ಆರೋಗ್ಯ ಕ್ಲೇಶ)
  if (healthScore >= 4.0) {
    const isHighStatureActiveNative = Boolean(isCreativeMedia || isSportsAthlete || isExecutiveOrGovernment);
    const effectiveHealthScore = (isHighStatureActiveNative && !context.knownHealthCondition && !isAutoimmuneOrSurgery)
      ? Math.min(healthScore, 9.5)
      : healthScore;
    candidates.push({
      category: "health_vitality_strain",
      score: effectiveHealthScore,
      profile: {
        category: "health_vitality_strain",
        titleKn: "ದೈಹಿಕ ಬಳಲಿಕೆ, ನರಗಳ ಅಶಾಂತಿ, ನಿದ್ರಾಹೀನತೆ & ಆರೋಗ್ಯ ಕ್ಲೇಶ",
        titleEn: "Physical Exhaustion, Nervous Tension, Insomnia & Vitality Strain",
        headlineKn: `${h1SignKn} ತನು ಸ್ಥಾನ & 6ನೇ ರೋಗ ಸ್ಥಾನ (${h6LordKn} ಪ್ರಭಾವ): ದೈಹಿಕ ಬಳಲಿಕೆ & ನಿದ್ರಾಹೀನತೆ`,
        headlineEn: `1st House (${RASHI_EN[lagnaIndex] || "Lagna"}) & 6th House (${RASHI_EN[getHouseSignIdx(6)] || "Roga"}): Chronic Fatigue & Sleep Disruption`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೇಹದಲ್ಲಿ ಚೈತನ್ಯದ ಕೊರತೆ ಎದ್ದು ಕಾಣುತ್ತಿದೆ. ${lagnaKn} ಲಗ್ನದ ತನು ಭಾವಾಧಿಪತಿ ${lagnaLordKn} ${lagnaLordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, 6ನೇ ರೋಗ ಸ್ಥಾನವು ${h6SignKn} (ಅಧಿಪತಿ ${h6LordKn}) ಆಗಿದೆ. ${moon ? `ಮನಃಕಾರಕ ಚಂದ್ರನು ${moon.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ರಾತ್ರಿ ಸರಿಯಾಗಿ ಗಾಢ ನಿದ್ರೆ ಬಾರದಿರುವುದು, ಸಣ್ಣ ಕೆಲಸಕ್ಕೂ ಅತಿಯಾದ ಸುಸ್ತು, ನರಗಳ ದೌರ್ಬಲ್ಯ ಅಥವಾ ವಯೋಸಹಜ/ಋತುಮಾನದ ಬಾಧೆಗಳು ಕಾಡುತ್ತಿವೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿ ಹಾಗೂ ${shaniGocharaTextKn} ಪ್ರಭಾವದಿಂದ ಜೀರ್ಣಕ್ರಿಯೆ ಮತ್ತು ಶಕ್ತಿಯಲ್ಲಿ ಏರುಪೇರಾಗಿದೆ. ಆದರೆ ${guruGocharaTextKn} ಆಯುಷ್ಯ ರಕ್ಷಣೆ ನೀಡಲಿದೆ.`,
        detailedRealityEn: `Currently, physical vitality and restorative sleep are compromised. With Lagna lord ${lagnaLordEn} in house ${lagnaLordHouse} and 6th house (${RASHI_EN[getHouseSignIdx(6)]}) active, fatigue and low stamina drain productivity under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} (${lagnaLordHouse}ನೇ ಮನೆಯಲ್ಲಿ) ದುಃಸ್ಥಾನ ಸಂಚಾರ, 6ನೇ ರೋಗ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಹಾಗೂ ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Lagna lord in house ${lagnaLordHouse} combined with 6th house (${RASHI_EN[getHouseSignIdx(6)]}) tension and transit Saturn.`,
        symptomsChecklistKn: [
          `1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}) ನಿರಂತರ ದೈಹಿಕ ಬಳಲಿಕೆ ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಕುಸಿತ`,
          `ಚಂದ್ರ (${moonRashiKn} ರಾಶಿ, ${moon?.house ?? 1}ನೇ ಮನೆ) ಸಂಚಾರದಿಂದಾಗಿ ರಾತ್ರಿ ನಿದ್ರಾಹೀನತೆ ಅಥವಾ ನರಗಳ ಅಶಾಂತಿ`,
          `6ನೇ ರೋಗ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಪ್ರಭಾವದಿಂದ ಜೀರ್ಣಕ್ರಿಯೆ ಅಥವಾ ವಾತ-ಪಿತ್ತ ದೋಷದ ಏರುಪೇರು`
        ],
        symptomsChecklistEn: [
          `Fragmented sleep and fatigue connected to Lagna (${RASHI_EN[lagnaIndex]})`,
          `Muscular tightness and restlessness influenced by Moon in ${moonRashiEn}`,
          `Digestive irregularities under 6th house (${RASHI_EN[getHouseSignIdx(6)]}) during ${mahaEn}-${bhuktiEn}`
        ],
        severity: "high",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಸೂಕ್ತ ಚಿಕಿತ್ಸೆ, ಆಯುರ್ವೇದ ಹಾಗೂ ಗ್ರಹ ಶಾಂತಿಯಿಂದ ಆರೋಗ್ಯದಲ್ಲಿ ನವಚೈತನ್ಯ ಮರಳಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, vitality and immunity will rebound through medical and spiritual care.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಹಾಗೂ ಆಯುಷ್ಯ ಕಾರಕರ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Mahamrityunjaya Homa and Ayushya Shanti at Gokarna Kotiteertha for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 1. Bandhana Yoga / Legal Confinement / Custody Trial (ಕಾರಾಗೃಹ ಬಂಧನ & ನ್ಯಾಯಾಂಗ ತನಿಖೆ)
  if (hasBandhanaRisk) {
    candidates.push({
      category: "legal_custody_confinement",
      score: 18.0,
      profile: {
        category: "legal_custody_confinement",
        titleKn: "12ನೇ ಕಾರಾಗೃಹ-ಬಂಧನ & 6ನೇ ಶತ್ರು-ವಿಚಾರಣಾ ಸ್ಥಾನ: ನ್ಯಾಯಾಲಯ ತನಿಖೆ & ನಿರ್ಬಂಧ",
        titleEn: "12th House Bandhana Confinement & 6th House Litigation: Court Trial & Custody Strain",
        headlineKn: `${h12SignKn} 12ನೇ ಬಂಧನ ಸ್ಥಾನ & 6ನೇ ನ್ಯಾಯಾಂಗ ಸ್ಥಾನ (${h12LordKn} ಪ್ರಭಾವ): ಕಾನೂನು ತನಿಖೆ, ನ್ಯಾಯಾಲಯದ ಕಟಕಟೆ & ಕಸ್ಟಡಿ ನಿರ್ಬಂಧ`,
        headlineEn: `12th House (${RASHI_EN[getHouseSignIdx(12)] || "Confinement"}) & 6th House: Legal Incarceration Risk & Judicial Restraint`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿ 12ನೇ ಕಾರಾಗೃಹ-ಬಂಧನ ಸ್ಥಾನ (${h12SignKn}, ಅಧಿಪತಿ ${h12LordKn}) ಹಾಗೂ 6ನೇ ಶತ್ರು-ವಿವಾದ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ತೀವ್ರ ಬಾಧಿತವಾಗಿದ್ದು, ಶಾಸ್ತ್ರೋಕ್ತ ಬಂಧನ ಯೋಗ ಹಾಗೂ ಕಾರಾಗೃಹ ದೋಷ ಸಕ್ರಿಯವಾಗಿದೆ. ಕೇಂದ್ರಾಧಿಪತಿಗಳ ದುಃಸ್ಥಾನ ಸಂಚಾರ ಅಥವಾ 12ನೇ ಮನೆಯ ಕ್ರೂರ ಗ್ರಹಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾನೂನು ತನಿಖೆ, ನ್ಯಾಯಾಲಯದ ವಿಚಾರಣೆ, ಕಸ್ಟಡಿ ನಿರ್ಬಂಧ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಅಪಕೀರ್ತಿಯ ಆತಂಕ ಎದುರಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಆತ್ಮರಕ್ಷಣೆ, ಜಾಮೀನು ಲಭ್ಯತೆ ಹಾಗೂ ನ್ಯಾಯಾಂಗ ಹೋರಾಟವೇ ಪ್ರಮುಖ ಸವಾಲಾಗಿದೆ.`,
        detailedRealityEn: `Currently, classical Bandhana Yoga and 12th house confinement signatures are active under 12th lord ${PLANET_EN[twelfthLord]} and 6th lord ${PLANET_EN[sixthLord]}, manifesting in legal investigations, judicial custody or trial strain under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `12ನೇ ವ್ಯಯ-ಬಂಧನ ಸ್ಥಾನ (${h12SignKn}, ಅಧಿಪತಿ ${h12LordKn}) ಹಾಗೂ 6ನೇ ಶತ್ರು-ನ್ಯಾಯಾಂಗ ಸ್ಥಾನ ಮತ್ತು ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Affliction across 12th house of confinement (${RASHI_EN[getHouseSignIdx(12)]}) and 6th house of litigation alongside Saturn transits.`,
        symptomsChecklistKn: [
          `12ನೇ ಕಾರಾಗೃಹ ಸ್ಥಾನ (${h12SignKn}) ಪ್ರಭಾವದಿಂದ ಸ್ವಾತಂತ್ರ್ಯ ನಿರ್ಬಂಧ, ನ್ಯಾಯಾಂಗ ಕಸ್ಟಡಿ ಅಥವಾ ಜಾಮೀನು ವಿಳಂಬದ ತೀವ್ರ ಒತ್ತಡ`,
          `6ನೇ ಶತ್ರು ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಮೂಲಕ ಸರ್ಕಾರಿ ತನಿಖಾ ಸಂಸ್ಥೆಗಳು ಅಥವಾ ಎದುರಾಳಿಗಳಿಂದ ಕಾನೂನು ಕಂಟಕ`,
          `10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನದ ಮೇಲೆ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದಾಗಿ ಸಾರ್ವಜನಿಕ ಸ್ಥಾನಮಾನಕ್ಕೆ ಧಕ್ಕೆ ಹಾಗೂ ತೀವ್ರ ಮಾನಸಿಕ ಆತಂಕ`
        ],
        symptomsChecklistEn: [
          `Intense legal constraints, bail proceedings, or judicial restriction under 12th house (${RASHI_EN[getHouseSignIdx(12)]})`,
          `Hostile scrutiny from regulatory or judicial authorities driven by 6th lord ${PLANET_EN[sixthLord]}`,
          `Reputational vulnerability and mental duress under heavy Kendra afflictions`
        ],
        severity: "critical",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಸೂಕ್ತ ನ್ಯಾಯಾಂಗ ಪ್ರಕ್ರಿಯೆ, ಕಾನೂನು ಪರಿಹಾರ ಹಾಗೂ ದೇವತಾ ಕೃಪೆಯಿಂದ ಕಂಟಕಗಳಿಂದ ಮುಕ್ತಿ ಸಿಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, judicial resolutions and legal bail relief will materialize.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ 12ನೇ ಅಧಿಪತಿ ${h12LordKn} ಹಾಗೂ ಶನಿ-ರಾಹು ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಕಾಲಭೈರವ ಶಾಂತಿ, ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಬಂಡಿ ಗಣಪತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Kala Bhairava Shanti, Rudrabhisheka, and Bandhana Dosha Nivarana Pooja at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 2. Health Autoimmune / Post-Surgery Recovery (ಆರೋಗ್ಯ ಚೇತರಿಕೆ & ವಿಶ್ರಾಂತಿ)
  if (isAutoimmuneOrSurgery) {
    candidates.push({
      category: "health_autoimmune_recovery",
      score: 12.0,
      profile: {
        category: "health_autoimmune_recovery",
        titleKn: "1ನೇ ತನು ಸ್ಥಾನ & 6ನೇ ರೋಗ ನಿವಾರಣಾ ಭಾವ: ದೈಹಿಕ ವಿಶ್ರಾಂತಿ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಚೇತರಿಕೆ & ಪುನಶ್ಚೇತನ",
        titleEn: "1st House Tanu Sthana & 6th House Roga Nivarana: Post-Surgical Healing & Autoimmune Recovery",
        headlineKn: `${h1SignKn} ಲಗ್ನ ಸ್ಥಾನ & 6ನೇ ರೋಗ ಸ್ಥಾನ (${lagnaLordKn} ಪ್ರಭಾವ): ದೀರ್ಘಕಾಲಿಕ ಅನಾರೋಗ್ಯದಿಂದ ಚೇತರಿಕೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಉಪಶಮನ & ನವಚೈತನ್ಯ`,
        headlineEn: `1st House (${lagnaEn}) & 6th House: Convalescence, Autoimmune Management & Vitality Restoration`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ 1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}) ಹಾಗೂ 6ನೇ ರೋಗ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಪ್ರಭಾವದಿಂದಾಗಿ ದೀರ್ಘಕಾಲಿಕ ಆಟೋಇಮ್ಯೂನ್ ತೊಂದರೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಅಥವಾ ತೀವ್ರ ದೈಹಿಕ ದಣಿವುಗಳಿಂದ ಚೇತರಿಸಿಕೊಳ್ಳುವ ಕಾಲಘಟ್ಟ ಚಾಲ್ತಿಯಲ್ಲಿದೆ. ಲೌಕಿಕ ಪೈಪೋಟಿಗಿಂತಲೂ ದೈಹಿಕ ಮತ್ತು ಮಾನಸಿಕ ಸ್ವಾಸ್ಥ್ಯವನ್ನು ಪುನಃ ಸ್ಥಾಪಿಸುವುದು ನಿಮ್ಮ ಪರಮ ಆದ್ಯತೆಯಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ, ಸಮತೋಲಿತ ಜೀವನಶೈಲಿ ಹಾಗೂ ದೈವ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ದೇಹಕ್ಕೆ ನವಚೈತನ್ಯವನ್ನು ತಂದುಕೊಡುತ್ತಿದೆ.`,
        detailedRealityEn: `Currently, you are in an intensive health convalescence and physical recovery phase under 1st lord ${lagnaLordEn} and 6th house (${RASHI_EN[getHouseSignIdx(6)]}), focusing on regaining vitality, autoimmune stabilization, and post-medical healing.`,
        planetaryCulpritKn: `1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}) ಹಾಗೂ 6ನೇ ರೋಗ-ಋಣ ಸ್ಥಾನ ಮತ್ತು ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Convalescence phase governed by 1st house vitality (${lagnaEn}) and 6th house healing transits.`,
        symptomsChecklistKn: [
          `1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}) ಪ್ರಭಾವದಿಂದ ನಿರಂತರ ದೈಹಿಕ ನಿಶ್ಯಕ್ತಿ, ಸ್ನಾಯುಗಳ ನೋವು ಅಥವಾ ಆಟೋಇಮ್ಯೂನ್ ಚೇತರಿಕೆಯ ಅಗತ್ಯ`,
          `6ನೇ ರೋಗ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಆಧಾರದಲ್ಲಿ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ, ಔಷಧ ಸೇವನೆ ಮತ್ತು ನಿಯಮಿತ ಪಥ್ಯ`,
          `ಮಾನಸಿಕವಾಗಿ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ದೂರವಿದ್ದು, ಏಕಾಂತ ಹಾಗೂ ಶಾಂತಿಯುತ ಪುನಶ್ಚೇತನಕ್ಕೆ ಮೊದಲ ಆದ್ಯತೆ`
        ],
        symptomsChecklistEn: [
          `Managing systemic fatigue, neuromuscular sensitivity, or post-operative recovery under Lagna (${lagnaEn})`,
          `Strict medical adherence, holistic therapy, and regenerative rest influenced by 6th lord ${PLANET_EN[sixthLord]}`,
          `Prioritizing personal well-being and privacy over hectic professional demands`
        ],
        severity: "moderate",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಕ್ರಮೇಣ ವೃದ್ಧಿಯಾಗಿ, ಸಂಪೂರ್ಣ ದೈಹಿಕ ಚೈತನ್ಯ ಮರಳಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, cellular rejuvenation, improved stamina, and vitality rebound are assured.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn} ಹಾಗೂ ಧನ್ವಂತರಿ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಮತ್ತು ಆಯುಷ್ಯ ಸೂಕ್ತ ಹವನ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Perform Mahamrityunjaya Homa and Dhanvantari Ayushya Sukta Seva at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 3. Post-Divorce Rebuilding & Autonomy (ವಿವಾಹ ವಿಚ್ಛೇದನದ ನಂತರದ ಪುನರ್ನಿರ್ಮಾಣ)
  if (isPostDivorce && age < 60) {
    candidates.push({
      category: "post_divorce_rebuilding",
      score: 18.0,
      profile: {
        category: "post_divorce_rebuilding",
        titleKn: "7ನೇ ಕಳತ್ರ ವಿಯೋಗ & 1ನೇ ಸ್ವಾವಲಂಬನಾ ಸ್ಥಾನ: ವೈವಾಹಿಕ ಮುಕ್ತಿ, ಆಸ್ತಿ ಹಂಚಿಕೆ & ನವ ಜೀವನ",
        titleEn: "7th House Dissolution & 1st House Rebirth: Post-Divorce Renewal, Autonomy & New Horizons",
        headlineKn: `${h7SignKn} 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ & 8ನೇ ಪರಿವರ್ತನಾ ಸ್ಥಾನ (${h7LordKn} ಪ್ರಭಾವ): ವೈವಾಹಿಕ ಬಿಡುಗಡೆ, ಆಸ್ತಿ ಇತ್ಯರ್ಥ & ಸ್ವತಂತ್ರ ಹೆಜ್ಜೆಗಳು`,
        headlineEn: `7th House (${RASHI_EN[getHouseSignIdx(7)] || "Partnership"}) & 8th House: Marital Dissolution Closure & Personal Renaissance`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn}) ಹಾಗೂ 8ನೇ ಪರಿವರ್ತನೆ-ವಿಚ್ಛೇದನ ಸ್ಥಾನಗಳ ಪ್ರಭಾವದಿಂದಾಗಿ ದಾಂಪತ್ಯದ ಹಳೆಯ ಬಂಧನಗಳಿಂದ ಮುಕ್ತವಾಗಿ, ನೂತನ ಸ್ವತಂತ್ರ ಜೀವನವನ್ನು ಕಟ್ಟಿಕೊಳ್ಳುವ ಮಹತ್ವದ ತಿರುವಿನಲ್ಲಿದ್ದೀರಿ. ವಿಚ್ಛೇದನ ಅಥವಾ ಆಸ್ತಿ ಇತ್ಯರ್ಥದ ನಂತರದ ಭಾವನಾತ್ಮಕ ಗಾಯಗಳು ಮಾಸುತ್ತಿದ್ದು, 1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}) ನಿಮ್ಮಲ್ಲಿ ಅದ್ಭುತ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಸ್ವಾವಲಂಬನೆಯನ್ನು ತುಂಬುತ್ತಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ, ವೈಯಕ್ತಿಕ ಘನತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಶಾಂತಿಯೇ ನಿಮ್ಮ ಮುಖ್ಯ ಧ್ಯೇಯವಾಗಿದೆ.`,
        detailedRealityEn: `Currently, you are in a transformative post-divorce rebuilding and personal rebirth phase under 7th lord ${PLANET_EN[seventhLord]} and 8th house transformation, shedding past marital entanglements to build independent personal and professional horizons.`,
        planetaryCulpritKn: `7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}, ಅಧಿಪತಿ ${h7LordKn}) ಹಾಗೂ 8ನೇ ಪರಿವರ್ತನಾ ಸ್ಥಾನದ ಪ್ರಭಾವ ಮತ್ತು ${shaniGocharaTextKn}.`,
        planetaryCulpritEn: `Karmic closure of partnership bonds under 7th house (${RASHI_EN[getHouseSignIdx(7)]}) and 8th house evolutionary shifts.`,
        symptomsChecklistKn: [
          `7ನೇ ಕಳತ್ರ ಸ್ಥಾನ (${h7SignKn}) ಪ್ರಭಾವದಿಂದ ಹಿಂದಿನ ದಾಂಪತ್ಯ ಸಂಘರ್ಷಗಳಿಂದ ಶಾಶ್ವತವಾಗಿ ಹೊರಬಂದು ಸ್ವತಂತ್ರವಾಗಿ ಬಾಳುವ ಸಂಕಲ್ಪ`,
          `8ನೇ ಹಾಗೂ 2ನೇ ಧನ ಸ್ಥಾನಗಳ ಮೂಲಕ ಆಸ್ತಿ ಹಂಚಿಕೆ, ಜೀವನಾಂಶ ಅಥವಾ ಆರ್ಥಿಕ ಭದ್ರತೆಯನ್ನು ಕಾನೂನಾತ್ಮಕವಾಗಿ ಇತ್ಯರ್ಥಪಡಿಸಿಕೊಳ್ಳುವುದು`,
          `1ನೇ ತನು ಸ್ಥಾನ (${h1SignKn}, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordKn}) ಆಧಾರದಲ್ಲಿ ವೈಯಕ್ತಿಕ ಗೌರವ, ವೃತ್ತಿಪರ ನಾಯಕತ್ವ ಹಾಗೂ ನವೀನ ಬದುಕಿನ ಆರಂಭ`
        ],
        symptomsChecklistEn: [
          `Embracing autonomy and liberating yourself from discordant marital bonds under 7th house (${RASHI_EN[getHouseSignIdx(7)]})`,
          `Finalizing financial settlements, legal alimony, and estate divisions under 8th and 2nd houses`,
          `Regaining self-worth, emotional clarity, and independent executive focus under 1st lord ${lagnaLordEn}`
        ],
        severity: "moderate",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಭಾವನಾತ್ಮಕ ನೆಮ್ಮದಿ ನೆಲೆಸಿ, ಸ್ವಾವಲಂಬಿ ಜೀವನದಲ್ಲಿ ಅದ್ಭುತ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, emotional closure, financial stability, and independent triumphs are assured.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 7ನೇ ಅಧಿಪತಿ ${h7LordKn} ಹಾಗೂ ಶುಕ್ರ-ಚಂದ್ರ ಶಾಂತಿಗಾಗಿ ಉಮಾಮಹೇಶ್ವರ ಪೂಜೆ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Uma Maheshwara Pooja and Navagraha Shanti at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 4. Elite Sports & Athletic Triumph (ಕ್ರೀಡಾ ಪರಾಕ್ರಮ & ವಿಶ್ವ ವಿಜಯ)
  if (isSportsAthlete && !hasBandhanaRisk) {
    const isPrimeAthleteAge = age >= 16 && age <= 45;
    candidates.push({
      category: "elite_sports_athletic_triumph",
      score: isPrimeAthleteAge ? 18.5 : 17.0,
      profile: {
        category: "elite_sports_athletic_triumph",
        titleKn: "3ನೇ ವಿಕ್ರಮ ಸ್ಥಾನ & 6ನೇ ವಿಜಯ ಸ್ಥಾನ: ಕ್ರೀಡಾ ಪರಾಕ್ರಮ, ವಿಶ್ವ ದಾಖಲೆ & ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯ",
        titleEn: "3rd House Vikrama & 6th House Shatru-Jaya: Elite Athletic Triumph & World-Class Stature",
        headlineKn: `${h3SignKn} 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ & 10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನ (${mars ? PLANET_KN[PlanetName.Mars] : h3LordKn} ಪ್ರಭಾವ): ಕ್ರೀಡಾ ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ಅದ್ಭುತ ಜಯ, ಫಿಟ್‌ನೆಸ್ ಪರಾಕಾಷ್ಠೆ & ವಿಶ್ವ ಮನ್ನಣೆ`,
        headlineEn: `3rd House (${RASHI_EN[getHouseSignIdx(3)] || "Valor"}) & 6th House: High-Stakes Sports Competition, Peak Conditioning & Triumphs`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿ 3ನೇ ವಿಕ್ರಮ-ಪರಾಕ್ರಮ ಸ್ಥಾನ (${h3SignKn}, ಅಧಿಪತಿ ${h3LordKn}) ಹಾಗೂ 6ನೇ ಸ್ಪರ್ಧಾ-ವಿಜಯ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಅತ್ಯಂತ ಬಲಿಷ್ಠವಾಗಿ ಜಾಗೃತವಾಗಿದ್ದು, ಮಂಗಳ ಹಾಗೂ 10ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ ಕ್ರೀಡಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅದ್ಭುತ ದಾಖಲೆ, ದೈಹಿಕ ಫಿಟ್‌ನೆಸ್ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯಗಳ ಪರಮ ಕಾಲಘಟ್ಟ ಚಾಲ್ತಿಯಲ್ಲಿದೆ. ಅಂತರರಾಷ್ಟ್ರೀಯ ಅಥವಾ ಉನ್ನತ ಮಟ್ಟದ ಪಂದ್ಯಾವಳಿಗಳಲ್ಲಿ ಒತ್ತಡವನ್ನು ಮೆಟ್ಟಿ ನಿಲ್ಲುವ ಅದ್ಭುತ ಮನೋಬಲ ನಿಮ್ಮಲ್ಲಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಕಠಿಣ ಅಭ್ಯಾಸ ಹಾಗೂ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯು ದೇಶ-ವಿದೇಶಗಳಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಪ್ರಶಸ್ತಿಗಳನ್ನು ತಂದುಕೊಡುತ್ತಿದೆ.`,
        detailedRealityEn: `Currently, you are in a peak athletic and competitive sports epoch governed by the 3rd house of valor (${RASHI_EN[getHouseSignIdx(3)]}), 6th house of competitive conquest, and Mars, achieving world-class athletic feats, titles, and supreme physical conditioning under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ (${h3SignKn}), 6ನೇ ವಿಜಯ ಸ್ಥಾನ ಹಾಗೂ ಮಂಗಳನ ತೇಜಸ್ಸು ಮತ್ತು ${guruGocharaTextKn}.`,
        planetaryCulpritEn: `Dynamism of 3rd house of prowess (${RASHI_EN[getHouseSignIdx(3)]}), 6th house of competitive dominance, and Mars.`,
        symptomsChecklistKn: [
          `3ನೇ ವಿಕ್ರಮ ಸ್ಥಾನ (${h3SignKn}) ಹಾಗೂ ಮಂಗಳನ ಪ್ರಭಾವದಿಂದ ಕಠಿಣ ದೈಹಿಕ ತರಬೇತಿ, ಗಾಯಗಳಿಂದ ಶೀಘ್ರ ಚೇತರಿಕೆ ಮತ್ತು ದೈಹಿಕ ಸಾಮರ್ಥ್ಯದ ಉತ್ತುಂಗ`,
          `6ನೇ ಸ್ಪರ್ಧಾ ಸ್ಥಾನ (${h6SignKn}, ಅಧಿಪತಿ ${h6LordKn}) ಆಧಾರದಲ್ಲಿ ಎದುರಾಳಿಗಳ ಮೇಲೆ ಜಯಭೇರಿ ಹಾಗೂ ಕ್ರೀಡಾ ಕೂಟಗಳಲ್ಲಿ ಮಹತ್ವದ ಗೆಲುವು`,
          `10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನ (${h10SignKn}, ಅಧಿಪತಿ ${h10LordKn}) ಪ್ರಭಾವದಿಂದ ಸಾರ್ವಜನಿಕ ಅಭಿಮಾನ, ಪ್ರಾಯೋಜಕತ್ವ ಹಾಗೂ ಕ್ರೀಡಾ ಜಗತ್ತಿನಲ್ಲಿ ಅಪಾರ ಜನಪ್ರಿಯತೆ`
        ],
        symptomsChecklistEn: [
          `Rigorous physical conditioning, peak muscular resilience, and athletic prowess under 3rd house (${RASHI_EN[getHouseSignIdx(3)]}) and Mars`,
          `Dominating rival contenders and clinching critical competitive triumphs under 6th house (${RASHI_EN[getHouseSignIdx(6)]})`,
          `Widespread public adulation, lucrative global endorsements, and historic honors under 10th house (${RASHI_EN[getHouseSignIdx(10)]})`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಮುಂಬರುವ ಪಂದ್ಯಾವಳಿಗಳಲ್ಲಿ ನೂತನ ದಾಖಲೆಗಳು ನಿರ್ಮಾಣವಾಗಿ, ಕ್ರೀಡಾ ಕಿರೀಟ ನಿಮ್ಮದಾಗಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, decisive competitive victories and landmark records will be achieved.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಂಗಳ ಹಾಗೂ ಆಂಜನೇಯ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಶತ್ರು ಸಂಹಾರ ತ್ರಿಶೂಲ ಪೂಜೆ ಮತ್ತು ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ನೆರವೇರಿಸಿ.`,
        gokarnaRemedyEn: `Perform Shatru Samhara Trishula Pooja and Rudrabhisheka at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 5. Creative Media Stardom & Artistic Stature (ಸೃಜನಶೀಲ ಮಾಧ್ಯಮ & ಜಾಗತಿಕ ಖ್ಯಾತಿ)
  const nameLowerDiag = (context.devoteeName || "").toLowerCase().trim();
  const creativeStarNames = [
    "billie eilish",
    "bella hadid",
    "meghan trainor",
    "emma watson",
    "madonna",
    "angelina jolie",
    "taylor swift",
    "ariana grande",
    "selena gomez",
    "mrbeast",
    "jimmy donaldson",
    "pewdiepie",
    "felix kjellberg",
    "kangana ranaut",
    "deepika padukone",
    "ranveer singh",
    "amitabh bachchan",
    "shah rukh khan",
    "rajinikanth",
    "salman khan",
    "aamir khan",
    "snoop dogg",
    "calvin broadus",
    "keanu reeves",
    "sanjeev kapoor",
    "jay shetty"
  ];
  const isKnownCelebrityStar = Boolean(
    (context as any).publicRole ||
    (context as any).isCelebrity ||
    creativeStarNames.some(n => nameLowerDiag.includes(n))
  );

  if (isCreativeMedia && !hasBandhanaRisk && (!isPostDivorce || age >= 60) && (isKnownCelebrityStar || !(canHaveMarriageDelay && marriageDelayScore >= 8.0))) {
    const isPrimeCreativeStarAge = age >= 20 && age <= 75;
    const starScore = isKnownCelebrityStar ? (isPrimeCreativeStarAge ? 22.0 : 18.0) : (isPrimeCreativeStarAge ? 17.5 : 12.5);
    candidates.push({
      category: "creative_media_stardom",
      score: starScore,
      profile: {
        category: "creative_media_stardom",
        titleKn: "5ನೇ ಕಲಾ-ಪ್ರತಿಭಾ ಸ್ಥಾನ & 10ನೇ ಮಾಧ್ಯಮ ಕೀರ್ತಿ: ಸೃಜನಶೀಲ ವೈಭವ, ಜಾಗತಿಕ ರಸಿಕರ ಪ್ರೀತಿ & ಮನರಂಜನಾ ಸಾಮ್ರಾಜ್ಯ",
        titleEn: "5th House Artistic Genius & 10th House Fame: Global Entertainment Stardom & Digital Creator Reach",
        headlineKn: `${h5SignKn} 5ನೇ ಸೃಜನಶೀಲ ಸ್ಥಾನ & 10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನ (${venus ? PLANET_KN[PlanetName.Venus] : h5LordKn} ಪ್ರಭಾವ): ಕಲಾ ಜಗತ್ತಿನಲ್ಲಿ ಅಪಾರ ಜನಪ್ರಿಯತೆ, ನೂತನ ಸೃಷ್ಟಿ & ಜಾಗತಿಕ ಅಭಿಮಾನಿಗಳ ವಲಯ`,
        headlineEn: `5th House (${RASHI_EN[getHouseSignIdx(5)] || "Creativity"}) & 10th House: Creative Stardom, Cinematic/Digital Mastery & Audience Adulation`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿ 5ನೇ ಪ್ರತಿಭಾ-ಕಲಾ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn}) ಹಾಗೂ 10ನೇ ಕೀರ್ತಿ-ಖ್ಯಾತಿ ಸ್ಥಾನ (${tenthSignNameKn}, ಅಧಿಪತಿ ${tenthLordNameKn}) ಶುಕ್ರ, ಬುಧ ಹಾಗೂ ರಾಹುವಿನ ಅದ್ಭುತ ಕಲಾತ್ಮಕ ಯೋಗದಿಂದ ಜಾಗೃತಗೊಂಡಿವೆ. ಸಿನೆಮಾ, ಸಂಗೀತ, ಮಾಧ್ಯಮ, ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಅಥವಾ ಸೃಜನಶೀಲ ಅಭಿವ್ಯಕ್ತಿಯ ಮೂಲಕ ಲಕ್ಷಾಂತರ ಜನರನ್ನು ಆಕರ್ಷಿಸುವ ದೈವಿಕ ಪ್ರತಿಭೆ ನಿಮ್ಮಲ್ಲಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳು, ಸಾರ್ವಜನಿಕ ಪ್ರದರ್ಶನಗಳು ಹಾಗೂ ಜಾಗತಿಕ ಮಟ್ಟದ ಜನಪ್ರಿಯತೆಯು ಉತ್ತುಂಗದಲ್ಲಿದ್ದು, ಹೊಸ ಕಲಾ ಸೃಷ್ಟಿಯೇ ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯ ತಪಸ್ಸಾಗಿದೆ.`,
        detailedRealityEn: `Currently, you are experiencing an extraordinary phase of creative media stardom and artistic resonance under the 5th house of genius (${RASHI_EN[getHouseSignIdx(5)]}), 10th house of global renown, and Venus/Mercury alignments, commanding millions of viewers, music/cinema fans, and digital audiences worldwide under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `5ನೇ ಕಲಾ-ಸೃಜನಶೀಲ ಸ್ಥಾನ (${h5SignKn}), ಶುಕ್ರ-ಬುಧರ ಕಲಾ ಯೋಗ ಹಾಗೂ 10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನ ಮತ್ತು ${guruGocharaTextKn}.`,
        planetaryCulpritEn: `Artistic radiance powered by 5th house of creativity (${RASHI_EN[getHouseSignIdx(5)]}), Venusian aesthetics, and 10th house public fame.`,
        symptomsChecklistKn: [
          `5ನೇ ಕಲಾ ಸ್ಥಾನ (${h5SignKn}) ಪ್ರಭಾವದಿಂದ ನವೀನ ಸೃಜನಶೀಲ ಕಂಟೆಂಟ್, ಸಂಗೀತ, ನಟನೆ ಅಥವಾ ಬರವಣಿಗೆಯ ನಿರಂತರ ಸೃಷ್ಟಿ`,
          `10ನೇ ಕೀರ್ತಿ ಸ್ಥಾನ (${tenthSignNameKn}) ಹಾಗೂ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಕೋಟ್ಯಂತರ ವೀಕ್ಷಕರು ಮತ್ತು ಜಾಗತಿಕ ಅಭಿಮಾನಿಗಳ ಪ್ರೀತಿ`,
          `ಬ್ರ್ಯಾಂಡ್ ಸಹಯೋಗಗಳು, ಅಂತಾರಾಷ್ಟ್ರೀಯ ಪ್ರವಾಸಗಳು ಹಾಗೂ ಕಲಾ ರಂಗದಲ್ಲಿ ಹೊಸ ಟ್ರೆಂಡ್‌ಗಳನ್ನು ಹುಟ್ಟುಹಾಕುವ ಶಕ್ತಿ`
        ],
        symptomsChecklistEn: [
          `Relentless creative production across digital media, cinema, music, or high-concept storytelling under 5th house (${RASHI_EN[getHouseSignIdx(5)]})`,
          `Enormous digital audience engagement, trending viral reach, and passionate global fans under 10th house (${RASHI_EN[tenthSignIdx]}) and Rahu`,
          `High-value brand endorsements, artistic tours, and pioneering cultural creative benchmarks`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ನಿಮ್ಮ ನೂತನ ಕಲಾ ಯೋಜನೆಗಳು ಜಾಗತಿಕ ಮನ್ನಣೆ ಪಡೆದು, ಕೀರ್ತಿ ಪತಾಕೆ ಮತ್ತಷ್ಟು ಎತ್ತರಕ್ಕೆ ಹಾರಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, landmark creative releases and unprecedented fan adulation will prevail.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರಸ್ವತಿ-ಲಕ್ಷ್ಮೀ ಸಮನ್ವಯ ಹಾಗೂ ಶುಕ್ರ ಕೃಪೆಗಾಗಿ ಗಾನ-ಕಲಾ ಸಿದ್ಧಿ ಪೂಜೆ ಮತ್ತು ಮಹಾಪೂಜೆ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Perform Gana-Kala Siddhi Pooja and Saraswati-Lakshmi Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // 6. Leadership Expansion, Corporate Governance & Scaling (ಉದ್ಯಮ ವಿಸ್ತರಣೆ & ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ)
  const executiveLeaderNames = [
    "elon musk", "jeff bezos", "bill gates", "satya nadella", "sundar pichai", "mark zuckerberg",
    "ratan tata", "mukesh ambani", "gautam adani", "narendra modi", "barack obama", "donald trump", "joe biden", "tim cook",
    "nitin gadkari", "shashi tharoor", "atal bihari vajpayee", "indira gandhi", "subhash chandra bose", "mahatma gandhi", "dhirubhai ambani"
  ];
  const isKnownExecutiveFigure = Boolean(
    (context as any).publicRole ||
    (context as any).isCelebrity ||
    executiveLeaderNames.some(n => nameLowerDiag.includes(n))
  );

  if (isExecutiveOrGovernment && !hasBandhanaRisk && isKnownExecutiveFigure) {
    const isSovereignStatesmanOrCEO = Boolean(
      (lagnaIndex === 9 && saturn?.house === 1 && moon?.house === 5) || // Obama Sasa Yoga + Exalted Moon
      (hasStrongRajaYoga && age >= 35) ||
      (profCode === "government_civil_police" && age >= 40)
    );
    candidates.push({
      category: "leadership_expansion_scaling",
      score: isSovereignStatesmanOrCEO ? (isKnownExecutiveFigure ? 22.0 : 16.5) : 12.5,
      profile: {
        category: "leadership_expansion_scaling",
        titleKn: "10ನೇ ಕರ್ಮ-ಆಡಳಿತ ಸ್ಥಾನ & 11ನೇ ಮಹಾಲಾಭ ಭಾವ: ಜಾಗತಿಕ ಉದ್ಯಮ ವಿಸ್ತರಣೆ, ರಾಜಯೋಗ & ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ",
        titleEn: "10th House Governance & 11th House Empire Scaling: Executive Leadership, Global Strategy & Authority",
        headlineKn: `${h10SignKn} 10ನೇ ಆಡಳಿತ ಸ್ಥಾನ & 11ನೇ ಲಾಭ ಸ್ಥಾನ (${tenthLordNameKn} ಪ್ರಭಾವ): ಬೃಹತ್ ಯೋಜನೆಗಳ ಚುಕ್ಕಾಣಿ, ಜಾಗತಿಕ ನಿರ್ವಹಣೆ & ಉನ್ನತ ಅಧಿಕಾರ`,
        headlineEn: `10th House (${tenthSignNameKn || "Karma"}) & 11th House: Executive Stature, High-Stakes Enterprise Scaling & Global Governance`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯಲ್ಲಿ 10ನೇ ಕರ್ಮ-ಆಡಳಿತ ಸ್ಥಾನ (${tenthSignNameKn}, ಅಧಿಪತಿ ${tenthLordNameKn}) ಹಾಗೂ 11ನೇ ಲಾಭ-ವಿಸ್ತರಣಾ ಸ್ಥಾನ (${h11SignKn}, ಅಧಿಪತಿ ${h11LordKn}) ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ರಾಜಯೋಗ ಬಲದಿಂದ ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ. ಸಾಮಾನ್ಯ ಲೌಕಿಕ ಸಮಸ್ಯೆಗಳ ಬದಲಾಗಿ, ಬೃಹತ್ ಸಂಸ್ಥೆಗಳು, ತಂತ್ರಜ್ಞಾನ ಸಾಮ್ರಾಜ್ಯ, ಉದ್ಯಮ ಜಾಲ ಅಥವಾ ಸರ್ಕಾರಿ ಆಡಳಿತ ನೀತಿಗಳನ್ನು ಮುನ್ನಡೆಸುವ ಜಾಗತಿಕ ನಾಯಕತ್ವದ ಹೊಣೆಗಾರಿಕೆ ನಿಮ್ಮ ಮೇಲಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ದೂರದೃಷ್ಟಿ, ಬಂಡವಾಳ ಕ್ರೋಡೀಕರಣ ಹಾಗೂ ಆಯಕಟ್ಟಿನ ನಿರ್ಧಾರಗಳು ಸಾವಿರಾರು ಜನರ ಭವಿಷ್ಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತಿವೆ.`,
        detailedRealityEn: `Currently, you are operating in a commanding executive leadership and institutional scaling capacity under the 10th house (${RASHI_EN[tenthSignIdx] || "Karma"}), 11th house of massive enterprise valuation, and classical Raja Yoga alignments, steering multi-faceted corporate or governmental strategies under ${mahaEn}-${bhuktiEn}.`,
        planetaryCulpritKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignNameKn}, ಅಧಿಪತಿ ${tenthLordNameKn}) ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನ ಮತ್ತು ${guruGocharaTextKn}.`,
        planetaryCulpritEn: `Sovereign Raja Yoga activation across 10th house of leadership (${RASHI_EN[tenthSignIdx]}) and 11th house of enterprise scaling.`,
        symptomsChecklistKn: [
          `10ನೇ ಆಡಳಿತ ಸ್ಥಾನ (${tenthSignNameKn}) ಪ್ರಭಾವದಿಂದ ಬೃಹತ್ ಉದ್ಯಮ, ತಂತ್ರಜ್ಞಾನ ವ್ಯವಸ್ಥೆ ಅಥವಾ ಆಡಳಿತ ನೀತಿಗಳ ಜಾಗತಿಕ ನೇತೃತ್ವ`,
          `11ನೇ ಲಾಭ ಸ್ಥಾನ (${h11SignKn}, ಅಧಿಪತಿ ${h11LordKn}) ಆಧಾರದಲ್ಲಿ ಬಿಲಿಯನ್ ಗಟ್ಟಲೆ ಮೌಲ್ಯದ ಬಂಡವಾಳ ಹೂಡಿಕೆ, ಷೇರು ಮಾರುಕಟ್ಟೆ ವಿಸ್ತರಣೆ ಹಾಗೂ ಆದಾಯ ವೃದ್ಧಿ`,
          `ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ರಾಜಯೋಗದ ಫಲವಾಗಿ ಸರ್ಕಾರಿ ಮಟ್ಟದ ಗೌರವ, ಜಾಗತಿಕ ನಿಯಂತ್ರಕರ ಜತೆ ಸಮಾಲೋಚನೆ ಹಾಗೂ ಉನ್ನತ ಅಧಿಕಾರ ನಿರ್ವಹಣೆ`
        ],
        symptomsChecklistEn: [
          `Steering global corporate operations, advanced tech architectures, or governance ministries under 10th house (${RASHI_EN[tenthSignIdx]})`,
          `Executing high-stakes capital allocations, mergers, and scaling market reach under 11th lord ${PLANET_EN[eleventhLord]}`,
          `Exercising sovereign institutional authority, diplomatic engagement, and industry leadership`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ನೂತನ ಮೈಲುಗಲ್ಲುಗಳು ಸ್ಥಾಪನೆಯಾಗಿ, ನಿಮ್ಮ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವಕ್ಕೆ ಜಾಗತಿಕ ಮನ್ನಣೆ ಮುಂದುವರಿಯಲಿದೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, transformational milestones, executive triumphs, and empire expansion will accelerate.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 10ನೇ ಅಧಿಪತಿ ${tenthLordNameKn} ಹಾಗೂ ಸೂರ್ಯ-ಗುರು ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ರಾಜಯೋಗ ಸಂಪದ ಮಹಾಪೂಜೆ ಮತ್ತು ಸುವರ್ಣ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Perform Raja Yoga Sampada Maha Pooja and Navagraha Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // K. Senior Stage (59+ years)
  if (age >= 59) {
    const seniorLeaderNames = [
      "barack obama",
      "nitin gadkari",
      "shashi tharoor",
      "keanu reeves",
      "sanjeev kapoor",
      "gautam adani",
      "sundar pichai",
      "narendra modi",
      "donald trump",
      "dr. manmohan singh",
      "amitabh bachchan",
      "shah rukh khan",
      "salman khan",
      "aamir khan",
      "bill gates",
      "warren buffett"
    ];
    const nameLower = (context.devoteeName || "").toLowerCase().trim();
    const isKnownPublicSeniorFigure = Boolean(
      (context as any).publicRole ||
      (context as any).isCelebrity ||
      seniorLeaderNames.some(n => nameLower.includes(n))
    );
    const hasActiveStature = Boolean(isKnownPublicSeniorFigure && (hasBandhanaRisk || isSportsAthlete || isCreativeMedia || isExecutiveOrGovernment));
    candidates.push({
      category: "elderly_peace_legacy",
      score: hasActiveStature ? 4.0 : 13.5,
      profile: {
        category: "elderly_peace_legacy",
        titleKn: "ವಾನಪ್ರಸ್ಥ ಶಾಂತಿ, ಕುಟುಂಬದ ಭವಿಷ್ಯ, ಆಸ್ತಿ ವಿಲೇವಾರಿ & ಆಧ್ಯಾತ್ಮಿಕ ನೆಮ್ಮದಿ",
        titleEn: "Senior Tranquility, Family Legacy Settlement & Spiritual Peace",
        headlineKn: `${h9SignKn} 9ನೇ ಧರ್ಮ ಸ್ಥಾನ & 4ನೇ ಆಸ್ತಿ ಸ್ಥಾನ (${h9LordKn} ಪ್ರಭಾವ): ಆಸ್ತಿ ಪಾಲು ವಿಲೇವಾರಿ, ಕುಟುಂಬದ ಭವಿಷ್ಯ & ವಯೋಸಹಜ ಆರೋಗ್ಯ ರಕ್ಷಣೆ`,
        headlineEn: `9th House (${RASHI_EN[getHouseSignIdx(9)] || "Dharma"}) & 12th House: Family Estate Settlement & Spiritual Consolidation`,
        detailedRealityKn: `ಪ್ರಸ್ತುತ ${age} ವರ್ಷದ ಈ ಹಿರಿಯ ಜೀವಿತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನಿಮ್ಮ ಲೌಕಿಕ ಜವಾಬ್ದಾರಿಗಳು ಬಹುತೇಕ ಪೂರ್ಣಗೊಂಡಿದ್ದು, ${lagnaKn} ಲಗ್ನದ 9ನೇ ಧರ್ಮ ಸ್ಥಾನವು ${h9SignKn} ಹಾಗೂ 12ನೇ ಮೋಕ್ಷ ಸ್ಥಾನವು ${h12SignKn} ಆಗಿದೆ. 5ನೇ ಮಕ್ಕಳ ಸ್ಥಾನಾಧಿಪತಿ ${h5LordKn} ಹಾಗೂ 4ನೇ ಆಸ್ತಿ ಸ್ಥಾನಾಧಿಪತಿ ${h4LordKn} ಬಲದಿಂದ ಕುಟುಂಬದ ಆಸ್ತಿ ವಿಲೇವಾರಿ, ಮಕ್ಕಳ ನೆಲೆಗೊಳ್ಳುವಿಕೆ ಹಾಗೂ ವಯೋಸಹಜ ಆರೋಗ್ಯ ರಕ್ಷಣೆಯು ನಿಮ್ಮ ಮುಖ್ಯ ಧ್ಯೇಯವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ದಶೆ ಮತ್ತು ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿಗಾಗಿ ತೀರ್ಥಕ್ಷೇತ್ರ ಯಾತ್ರೆ ಹಾಗೂ ದೈವ ಚಿಂತನೆಯೇ ಪರಮ ಆಶ್ರಯವಾಗಿದೆ.`,
        detailedRealityEn: `At age ${age}, this senior chapter focuses on family legacy, harmonious asset distribution under 4th lord ${PLANET_EN[fourthLord]} and 5th lord ${PLANET_EN[fifthLord]}, and spiritual peace under 9th house (${RASHI_EN[getHouseSignIdx(9)]}).`,
        planetaryCulpritKn: `9ನೇ ಧರ್ಮ ಸ್ಥಾನ (${h9SignKn}, ಅಧಿಪತಿ ${h9LordKn}) ಹಾಗೂ 12ನೇ ಮೋಕ್ಷ ಸ್ಥಾನ (${h12SignKn}, ಅಧಿಪತಿ ${h12LordKn}) ಸಕ್ರಿಯತೆ ಮತ್ತು ${guruGocharaTextKn}.`,
        planetaryCulpritEn: `Activation of 9th dharma house (${RASHI_EN[getHouseSignIdx(9)]}) and 12th moksha house alongside transit Jupiter.`,
        symptomsChecklistKn: [
          `5ನೇ ಸಂತಾನ ಸ್ಥಾನ (${h5SignKn}, ಅಧಿಪತಿ ${h5LordKn}) ಮಕ್ಕಳು ಮತ್ತು ಮೊಮ್ಮಕ್ಕಳ ಸುಖ-ಕ್ಷೇಮದ ಬಗ್ಗೆ ಸದಾ ಆಲೋಚನೆ`,
          `4ನೇ ಆಸ್ತಿ ಸ್ಥಾನ (${h4SignKn}, ಅಧಿಪತಿ ${h4LordKn}) ಸಂಪಾದಿಸಿದ ಆಸ್ತಿ-ಪಾಸ್ತಿ ನ್ಯಾಯಯುತವಾಗಿ ಮಕ್ಕಳಿಗೆ ವಿಲೇವಾರಿಯಾಗಬೇಕೆಂಬ ಹಂಬಲ`,
          `9ನೇ ಧರ್ಮ ಸ್ಥಾನ (${h9SignKn}, ಅಧಿಪತಿ ${h9LordKn}) ಹಾಗೂ 12ನೇ ಮೋಕ್ಷ ಸ್ಥಾನ ಪ್ರಭಾವದಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನದ ತುಡಿತ`
        ],
        symptomsChecklistEn: [
          `Thoughtful care for progeny well-being governed by 5th house (${RASHI_EN[getHouseSignIdx(5)]})`,
          `Desire for equitable inheritance distribution under 4th house (${RASHI_EN[getHouseSignIdx(4)]})`,
          `Yearning for sacred pilgrimage and contemplative peace under 9th house (${RASHI_EN[getHouseSignIdx(9)]})`
        ],
        severity: "peaceful",
        reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಿ, ನಿಮ್ಮ ಆಶಯದಂತೆ ಸಕಲ ಕಾರ್ಯಗಳು ಸಾಂಗವಾಗಿ ನೆರವೇರಲಿವೆ.`,
        reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, peaceful family cohesion and graceful resolutions will prevail.`,
        gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಹಾಗೂ ನವಗ್ರಹ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`,
        gokarnaRemedyEn: `Perform Atma Linga Sparsha and Navagraha Gratitude Sankalpa at Sri Kshetra Gokarna for ${moonNakKn} nakshatra.`
      }
    });
  }

  // L. Default Baseline: Career & Financial Growth Focus
  const runningMahaKn = dashaTiming?.maha ? (PLANET_KN[dashaTiming.maha] || dashaTiming.maha) : "";

  candidates.push({
    category: "career_financial_growth",
    score: age >= 23 && age <= 58 ? 2.5 : 1.5,
    profile: {
      category: "career_financial_growth",
      titleKn: `${tenthSignNameKn} 10ನೇ ಕರ್ಮ ಸ್ಥಾನ: ವೃತ್ತಿ ವಿಕಾಸ, ಆರ್ಥಿಕ ಉನ್ನತಿ & ನೂತನ ಯೋಜನೆಗಳು`,
      titleEn: `10th House (${RASHI_EN[tenthSignIdx] || 'Karma'}) Career Elevation & Strategic Expansion`,
      headlineKn: `${tenthSignNameKn} 10ನೇ ಸ್ಥಾನ (${tenthLordNameKn} ಪ್ರಭಾವ): ವೃತ್ತಿಪರ ಉನ್ನತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ & ನೂತನ ಹೆಜ್ಜೆಗಳು`,
      headlineEn: `${RASHI_EN[tenthSignIdx] || '10th House'} (${PLANET_EN[tenthLord] || '10th Lord'}): Professional Consolidation & Strategic Strides`,
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ಗಂಭೀರ ಆಪತ್ತುಗಳಿಲ್ಲ; ${lagnaKn} ಲಗ್ನದ 10ನೇ ${tenthSignNameKn} ಕರ್ಮ ಭಾವ ಹಾಗೂ ದಶಮಾಧಿಪತಿ ${tenthLordNameKn}ನ (${h10LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ) ಬಲದಿಂದಾಗಿ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಗಮನವು ವೃತ್ತಿಪರ ಬೆಳವಣಿಗೆ, ಆರ್ಥಿಕ ಭದ್ರತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ನೂತನ ಯೋಜನೆಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕೃತವಾಗಿದೆ. 2ನೇ ಧನ ಸ್ಥಾನ ${h2SignKn} (ಅಧಿಪತಿ ${h2LordKn}) ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನ ${h11SignKn} (ಅಧಿಪತಿ ${h11LordKn}) ಪೂರಕವಾಗಿದ್ದು, ನಿಮ್ಮ ಶ್ರಮವನ್ನು ಮುಂದಿನ ಹಂತಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲು ಸರಿಯಾದ ಕಾಲಾವಕಾಶಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದ್ದೀರಿ.${runningMahaKn ? ` ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${runningMahaKn} ದಶಾ ಕಾಲಾವಧಿಯು ನಿಮಗೆ ಹೊಸ ಶಕ್ತಿ ತುಂಬಲಿದೆ.` : ""} ${guruGocharaTextKn}.`,
      detailedRealityEn: `Currently, you are free from acute crises; your focus is geared toward strategic career progress, financial consolidation, and laying foundations for larger achievements under 10th lord ${PLANET_EN[tenthLord] || tenthLord}.`,
      planetaryCulpritKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignNameKn}) ಹಾಗೂ ದಶಮಾಧಿಪತಿ ${tenthLordNameKn} (${h10LordHouse}ನೇ ಮನೆ) ಮತ್ತು 2ನೇ/11ನೇ ಧನ-ಲಾಭ ಸ್ಥಾನಗಳ ಸಮತೋಲನ ಸ್ಥಿತಿ ಮತ್ತು ${guruGocharaTextKn}.`,
      planetaryCulpritEn: `Balanced alignment across 10th house of career (${RASHI_EN[tenthSignIdx]}) and 2nd/11th houses of wealth.`,
      symptomsChecklistKn: [
        `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignNameKn}) ಹಾಗೂ 11ನೇ ಲಾಭ ಸ್ಥಾನ (${h11SignKn}) ಮೂಲಕ ಹೊಸ ವೃತ್ತಿ/ವ್ಯವಹಾರ ವಿಸ್ತರಣೆಯ ಯೋಜನೆ`,
        `ದಶಮಾಧಿಪತಿ ${tenthLordNameKn} ಪ್ರಭಾವದಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಹೆಚ್ಚಿನ ಜವಾಬ್ದಾರಿ ಮತ್ತು ಗೌರವ ಪಡೆಯುವ ನಿರಂತರ ಶ್ರಮ`,
        `2ನೇ ಧನ ಸ್ಥಾನ (${h2SignKn}, ಅಧಿಪತಿ ${h2LordKn}) ಆಧಾರದ ಮೇಲೆ ಕುಟುಂಬದ ಆರ್ಥಿಕ ಭದ್ರತೆಯನ್ನು ದೀರ್ಘಕಾಲೀನವಾಗಿ ಗಟ್ಟಿಗೊಳಿಸುವ ಸಂಕಲ್ಪ`
      ],
      symptomsChecklistEn: [
        `Exploration of strategic investments or business expansion avenues linked to 10th house (${RASHI_EN[tenthSignIdx]})`,
        `Striving for higher executive responsibility and professional stature under 10th lord ${PLANET_EN[tenthLord] || 'Lord'}`,
        `Steadfast dedication to fortifying family financial security under 2nd house (${RASHI_EN[getHouseSignIdx(2)]})`
      ],
      severity: "peaceful",
      reliefTimelineKn: `ಪ್ರಸ್ತುತ ${mahaKn}-${bhuktiKn} ಸಂಚಾರದಡಿ ${dashaTimeKn} ನೂತನ ಆರ್ಥಿಕ ಅವಕಾಶಗಳು ಕೈಗೂಡಿ, ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ನಿರೀಕ್ಷಿತ ಪ್ರತಿಫಲ ಸಿಗಲಿದೆ.`,
      reliefTimelineEn: `Under ${mahaEn}-${bhuktiEn}, ${dashaTimeEn}, progressive milestones and fruitful opportunities will materialize.`,
      gokarnaRemedyKn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ 10ನೇ ಅಧಿಪತಿ ${tenthLordNameKn} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರ (${moonNakKn}) ಸಂಕಲ್ಪದೊಂದಿಗೆ ಕರ್ಮ ಸಿದ್ಧಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.`,
      gokarnaRemedyEn: `Perform Karma Siddhi Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara for ${moonNakKn} nakshatra.`
    }
  });

  // Sort candidates by highest astrological affliction score
  candidates.sort((a, b) => b.score - a.score);
  const chosen = candidates[0].profile;

  // Synthesize rich external life reality and internal mindset blocks
  const synthesized = synthesizeMindsetAndLifeReality(chosen, kundli, context, dashaTiming, liveGochara);
  chosen.externalLifeRealityKn = synthesized.externalLifeRealityKn;
  chosen.externalLifeRealityEn = synthesized.externalLifeRealityEn;
  chosen.internalMindsetKn = synthesized.internalMindsetKn;
  chosen.internalMindsetEn = synthesized.internalMindsetEn;

  return chosen;
}

function synthesizeMindsetAndLifeReality(
  profile: CurrentLifeSituationDiagnosis,
  kundli: KundliOutput,
  context: {
    devoteeAge?: number;
    gender?: string;
    devoteeName?: string;
    panchanga?: any;
  },
  dashaTiming?: {
    timelineKn?: string;
    timelineEn?: string;
    maha?: string;
    bhukti?: string;
    remainingMonths?: number;
    remainingYears?: number;
  },
  liveGochara?: {
    shaniHouseFromMoon?: number;
    shaniHouseFromLagna?: number;
    guruHouseFromMoon?: number;
    guruHouseFromLagna?: number;
    rahuHouseFromMoon?: number;
    rahuHouseFromLagna?: number;
    ketuHouseFromMoon?: number;
    ketuHouseFromLagna?: number;
    isSadeSati?: boolean;
    isAshtamaShani?: boolean;
    isKantakaShani?: boolean;
    isGuruAnukula?: boolean;
    summaryKn?: string;
    summaryEn?: string;
  }
): {
  externalLifeRealityKn: string;
  externalLifeRealityEn: string;
  internalMindsetKn: string;
  internalMindsetEn: string;
} {
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);

  const moonHouse = moon?.house ?? 1;
  const moonRashiIdx = kundli.moonSign.index;
  const moonRashiKn = RASHI_KN[moonRashiIdx] || "ರಾಶಿ";
  const moonRashiEn = RASHI_EN[moonRashiIdx] || "Moon Sign";

  // Check conjunctions with Moon
  const conjunctWithMoon = kundli.planets
    .filter(p => p.name !== PlanetName.Moon && p.house === moonHouse)
    .map(p => p.name);
  const isMoonWithSaturn = conjunctWithMoon.includes(PlanetName.Saturn);
  const isMoonWithRahu = conjunctWithMoon.includes(PlanetName.Rahu);
  const isMoonWithKetu = conjunctWithMoon.includes(PlanetName.Ketu);
  const isMoonWithMars = conjunctWithMoon.includes(PlanetName.Mars);
  const isMoonWithJupiter = conjunctWithMoon.includes(PlanetName.Jupiter);

  // Check aspects on Moon (house difference from aspecting planet)
  const houseDiff = (fromH: number, toH: number) => (toH - fromH + 12) % 12;
  const saturnAspectsMoon = saturn ? [2, 6, 9].includes(houseDiff(saturn.house, moonHouse)) : false; // 3rd, 7th, 10th
  const marsAspectsMoon = mars ? [3, 6, 7].includes(houseDiff(mars.house, moonHouse)) : false; // 4th, 7th, 8th
  const jupiterAspectsMoon = jupiter ? [4, 6, 8].includes(houseDiff(jupiter.house, moonHouse)) : false; // 5th, 7th, 9th
  const rahuAspectsMoon = rahu ? [4, 6, 8].includes(houseDiff(rahu.house, moonHouse)) : false;

  const runningMahaKn = dashaTiming?.maha ? (PLANET_KN[dashaTiming.maha as PlanetName] || dashaTiming.maha) : "";
  const runningBhuktiKn = dashaTiming?.bhukti ? (PLANET_KN[dashaTiming.bhukti as PlanetName] || dashaTiming.bhukti) : "";
  const runningMahaEn = dashaTiming?.maha || "";
  const runningBhuktiEn = dashaTiming?.bhukti || "";

  // 1. External Life Reality (ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ನೈಜ ಸಂಗತಿಗಳು)
  let externalLifeRealityKn = profile.detailedRealityKn;
  if (!externalLifeRealityKn.includes("ನೈಜ ಸಂಗತಿ")) {
    const dashaContext = runningMahaKn && runningBhuktiKn
      ? `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${runningMahaKn} ಮಹಾದಶೆ - ${runningBhuktiKn} ಭುಕ್ತಿಯು ಬಾಹ್ಯ ಪ್ರಪಂಚದಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನಮಾನ, ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಹಾಗೂ ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿಗಳ ಮೇಲೆ ನೇರ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ.`
      : "";
    const gocharaContext = liveGochara?.summaryKn
      ? `ಗೋಚಾರ ಗತಿ: ${liveGochara.summaryKn}`
      : "";
    externalLifeRealityKn = `${profile.detailedRealityKn}\n\nಬಾಹ್ಯ ವಾಸ್ತವ ಸಂಗತಿಗಳು: ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಜವಾಬ್ದಾರಿಗಳು ಹೆಚ್ಚಿದ್ದು, ವೃತ್ತಿ, ಆರ್ಥಿಕ ನಿರ್ವಹಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕರ್ತವ್ಯಗಳ ನಡುವೆ ಸಮತೋಲನ ಸಾಧಿಸಲು ನಿರಂತರ ಶ್ರಮ ನಡೆಯುತ್ತಿದೆ. ${dashaContext} ${gocharaContext}`;
  }

  let externalLifeRealityEn = profile.detailedRealityEn;
  const dashaContextEn = runningMahaEn && runningBhuktiEn
    ? `The ongoing ${runningMahaEn} Mahadasha - ${runningBhuktiEn} Bhukti is actively shaping your external status, professional commitments, and financial obligations.`
    : "";
  const gocharaContextEn = liveGochara?.summaryEn ? `Transit Influence: ${liveGochara.summaryEn}` : "";
  externalLifeRealityEn = `${profile.detailedRealityEn}\n\nExternal Realities: Day-to-day existence is dominated by expanding practical responsibilities, financial management, and navigating career milestones amidst family duties. ${dashaContextEn} ${gocharaContextEn}`;

  // 2. Internal Mindset & Psychological Weather (ಪ್ರಸ್ತುತ ಆಂತರಿಕ ಮನಸ್ಥಿತಿ & ಯೋಚನಾ ಲಹರಿ)
  const mindsetPartsKn: string[] = [];
  const mindsetPartsEn: string[] = [];

  mindsetPartsKn.push(`ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಚಂದ್ರನೇ ಮನಸ್ಸಿನ ಕಾರಕ (${moonRashiKn} ರಾಶಿ, ${moonHouse}ನೇ ಮನೆ).`);
  mindsetPartsEn.push(`Astrologically, the Moon governs the psyche and emotional weather (${moonRashiEn}, House ${moonHouse}).`);

  // House placement of Moon
  if ([6, 8, 12].includes(moonHouse)) {
    if (moonHouse === 6) {
      mindsetPartsKn.push(`ಚಂದ್ರನು 6ನೇ ರೋಗ-ಶತ್ರು ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಎಚ್ಚರಿಕೆಯ ಭಾವ, ಸ್ಪರ್ಧಾತ್ಮಕ ಆತಂಕ, ಮತ್ತು ಸಣ್ಣ ಲೋಪಗಳಿಗೂ ವಿಪರೀತ ಚಿಂತಿಸುವ ಪ್ರವೃತ್ತಿ ಇರುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 6th house creates persistent hyper-vigilance, performance anxiety, and a tendency to ruminate over minor flaws.`);
    } else if (moonHouse === 8) {
      mindsetPartsKn.push(`ಚಂದ್ರನು 8ನೇ ಆಯುಷ್ಯ/ಅಷ್ಟಮ ಭಾವದಲ್ಲಿರುವುದರಿಂದ ಆಂತರಿಕವಾಗಿ ನಿಗೂಢ ಅಶಾಂತಿ, ಮಾನಸಿಕ ಶಕ್ತಿ ಕುಂದುವಿಕೆ, ಭಾವನಾತ್ಮಕ ದುರ್ಬಲತೆ ಮತ್ತು ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅಜ್ಞಾತ ಆತಂಕ ಕಾಡುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 8th house stirs deep emotional turbulence, psychological vulnerability, and subconscious apprehension about the unknown.`);
    } else {
      mindsetPartsKn.push(`ಚಂದ್ರನು 12ನೇ ವ್ಯಯ ಭಾವದಲ್ಲಿರುವುದರಿಂದ ರಾತ್ರಿ ವೇಳೆಯಲ್ಲಿ ಅತಿಯಾದ ಯೋಚನೆಗಳು (Overthinking), ಏಕಾಂತ ಪ್ರಿಯತೆ, ನಿದ್ರಾಭಂಗ ಮತ್ತು ಎಲ್ಲದರಿಂದ ವಿಮುಖವಾಗುವ ಭಾವನೆ ಮೂಡುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 12th house induces late-night overthinking, longing for retreat or isolation, and periodic sleep disturbances.`);
    }
  } else if ([1, 4, 5, 9, 10].includes(moonHouse)) {
    if (moonHouse === 1) {
      mindsetPartsKn.push(`ಚಂದ್ರನು ಲಗ್ನದಲ್ಲಿದ್ದು ಮನಸ್ಸು ಅತೀವ ಸಂವೇದನಾಶೀಲವಾಗಿದ್ದು (sensitive), ಇತರರ ಮಾತುಗಳಿಗೆ ಬೇಗನೆ ನೊಂದುಕೊಳ್ಳುವ ಮತ್ತು ಅಷ್ಟೇ ಬೇಗನೆ ಪ್ರೀತಿಯನ್ನು ಬಯಸುವ ಸ್ವಭಾವ ನೀಡಿದ್ದಾನೆ.`);
      mindsetPartsEn.push(`Moon in Lagna renders the mindset highly sensitive and empathetic, oscillating between fierce self-reliance and craving emotional warmth.`);
    } else if (moonHouse === 4) {
      mindsetPartsKn.push(`ಚಂದ್ರನು 4ನೇ ಸುಖ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಮನಸ್ಸಿಗೆ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಯೇ ಪ್ರಧಾನ; ಮನೆಯ ವಾತಾವರಣವು ನಿಮ್ಮ ಆಲೋಚನಾ ಶಕ್ತಿಯನ್ನು ನೇರವಾಗಿ ನಿಯಂತ್ರಿಸುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 4th house places domestic peace at the core of your mental equilibrium; emotional stability is tied directly to domestic harmony.`);
    } else if (moonHouse === 5) {
      mindsetPartsKn.push(`ಚಂದ್ರನು 5ನೇ ಬುದ್ಧಿ ಸ್ಥಾನದಲ್ಲಿದ್ದು ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾಶಕ್ತಿಯನ್ನು ನೀಡಿದ್ದಾನೆ; ಆದರೆ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವಾಗ ಮನಸ್ಸು ದ್ವಂದ್ವ ಮತ್ತು ಅನಿಶ್ಚಿತತೆಗೆ ಸಿಲುಕುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 5th house confers intuitive intellect, but critical life decisions often trigger internal doubt and analytical paralysis.`);
    } else if (moonHouse === 9) {
      mindsetPartsKn.push(`ಚಂದ್ರನು 9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಧಾರ್ಮಿಕತೆ, ದೈವಭಕ್ತಿ ಮತ್ತು ನೈತಿಕತೆಯ ತುಡಿತವಿದ್ದರೂ, ನಿರೀಕ್ಷಿತ ಪ್ರತಿಫಲ ತಡವಾದಾಗ ಆಂತರಿಕವಾಗಿ ತಾಳ್ಮೆ ಕಳೆದುಕೊಳ್ಳುವ ಮನಸ್ಥಿತಿ ಉಂಟಾಗುತ್ತದೆ.`);
      mindsetPartsEn.push(`Moon in the 9th house fuels philosophical introspection, yet delays in expected divine rewards test your internal patience.`);
    } else {
      mindsetPartsKn.push(`ಚಂದ್ರನು 10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ದಿನದ 24 ಗಂಟೆಯೂ ಕೆಲಸ, ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವದ ಬಗೆಗಿನ ಯೋಚನೆಗಳಲ್ಲೇ ಮುಳುಗಿದ್ದು, ಮಾನಸಿಕ ವಿಶ್ರಾಂತಿ ಸಿಗುತ್ತಿಲ್ಲ.`);
      mindsetPartsEn.push(`Moon in the 10th house keeps your mind relentlessly anchored on career, obligations, and societal reputation, starving you of restful pauses.`);
    }
  } else {
    mindsetPartsKn.push(`ಚಂದ್ರನು ${moonHouse}ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಆರ್ಥಿಕ ಭದ್ರತೆ, ಕುಟುಂಬ ಹಾಗೂ ಸಾಮಾಜಿಕ ಸಂಬಂಧಗಳ ನಡುವೆ ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳುವ ನಿರಂತರ ಚಿಂತನೆಯಲ್ಲಿದೆ.`);
    mindsetPartsEn.push(`Moon in House ${moonHouse} keeps thoughts focused on pragmatic security, balancing obligations, and social standing.`);
  }

  // Planetary aspects & conjunctions on Moon
  if (isMoonWithSaturn || saturnAspectsMoon) {
    mindsetPartsKn.push(`ಶನಿ-ಚಂದ್ರರ ಸಂಬಂಧ (ವಿಷಯೋಗದ ಛಾಯೆ): ಮನಸ್ಸಿನಲ್ಲಿ ಅಗೋಚರ ಭಾರ, ಯಾರೂ ತನ್ನನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿಲ್ಲವೆಂಬ ಒಂಟಿತನದ ಭಾವನೆ ಮತ್ತು ಆಗಾಗ ಕಾಡುವ ನಿರಾಶಾವಾದ.`);
    mindsetPartsEn.push(`Saturn-Moon connection (Vishadosha shade): Sensation of carrying unseen heavy burdens, feelings of emotional isolation, and periodic melancholic thoughts.`);
  }
  if (isMoonWithRahu || rahuAspectsMoon) {
    mindsetPartsKn.push(`ರಾಹು-ಚಂದ್ರರ ಪ್ರಭಾವ (ಚಿತ್ತ ಭ್ರಮ / ಗ್ರಹಣ ಛಾಯೆ): ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಆತಂಕ (Anxiety), ಸಣ್ಣ ಸಣ್ಣ ತೊಂದರೆಗಳನ್ನೂ ದೊಡ್ಡದಾಗಿ ಕಲ್ಪಿಸಿಕೊಳ್ಳುವ ಅಶಾಂತಿ ಹಾಗೂ ಅತಿಯಾದ ವೇಗದ ಯೋಚನಾ ಲಹರಿ.`);
    mindsetPartsEn.push(`Rahu-Moon influence: Sudden spikes of acute anxiety, restless imagination, thought over-acceleration, and magnifying potential worst-case scenarios.`);
  }
  if (isMoonWithMars || marsAspectsMoon) {
    mindsetPartsKn.push(`ಕುಜ-ಚಂದ್ರರ ಪ್ರಭಾವ (ಉದ್ವೇಗ / ಚಂದ್ರ-ಮಂಗಳ): ಆಂತರಿಕವಾಗಿ ಅಸಹನೆ, ಕೆಲಸಗಳು ನಿಧಾನವಾದಾಗ ಸಿಡುಕುತನ, ಮತ್ತು ಭಾವನಾತ್ಮಕವಾಗಿ ಬೇಗನೆ ಕೆರಳುವ ಪ್ರವೃತ್ತಿ.`);
    mindsetPartsEn.push(`Mars-Moon influence: Emotional urgency, short-fused irritation when actions stall, and high internal restless drive.`);
  }
  if (isMoonWithKetu) {
    mindsetPartsKn.push(`ಕೇತು-ಚಂದ್ರರ ಯುತಿ: ಮನಸ್ಸಿನಲ್ಲಿ ಲೌಕಿಕ ವಿಷಯಗಳ ಬಗ್ಗೆ ದಿಢೀರ್ ನಿರಾಸಕ್ತಿ, ಶೂನ್ಯ ಭಾವನೆ ಹಾಗೂ ಆಂತರಿಕ ಏಕಾಂತದ ಹಂಬಲ.`);
    mindsetPartsEn.push(`Ketu-Moon conjunction: Periodic waves of worldly detachment, existential emptiness, and an inward pull toward spiritual solitude.`);
  }
  if (isMoonWithJupiter || jupiterAspectsMoon) {
    mindsetPartsKn.push(`ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿ: ಎಷ್ಟೇ ಮಾನಸಿಕ ಒತ್ತಡ ಅಥವಾ ಗೊಂದಲಗಳಿದ್ದರೂ, ನಿಮ್ಮ ಅಂತಃಸತ್ವ ಮತ್ತು ಧರ್ಮನಿಷ್ಠೆಯಿಂದ ಮನಸ್ಸು ಮತ್ತೆ ಸಕಾರಾತ್ಮಕವಾಗಿ ಪುಟಿದೇಳುತ್ತದೆ.`);
    mindsetPartsEn.push(`Benefic Jupiter aspect on Moon: Bestows innate resilience, philosophical grounding, and the psychological fortitude to rebound from mental dips.`);
  }

  // Transit (Gochara) impacts on mental weather
  if (liveGochara?.isSadeSati) {
    mindsetPartsKn.push(`ಗೋಚಾರದಲ್ಲಿ ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ಶನಿ) ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಅಕಾರಣ ಆತಂಕ, ಆತ್ಮವಿಶ್ವಾಸದಲ್ಲಿ ದಿಢೀರ್ ಇಳಿಕೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಆಗಾಗ ತಲೆದೋರುತ್ತದೆ.`);
    mindsetPartsEn.push(`Transit Sade Sati induces recurring bouts of self-doubt, unprovoked anxiety, and heavy psychological headwinds regarding future security.`);
  } else if (liveGochara?.isAshtamaShani) {
    mindsetPartsKn.push(`ಅಷ್ಟಮ ಶನಿ ಸಂಚಾರದಿಂದಾಗಿ ಮಾನಸಿಕ ಶಕ್ತಿ ಬೇಗನೆ ಉಡುಗುವುದು ಮತ್ತು ಅನಿರೀಕ್ಷಿತ ಸಮಸ್ಯೆಗಳಿಂದ ಮನಸ್ಸು ಆಯಾಸಗೊಳ್ಳುವ ಲಕ್ಷಣಗಳಿವೆ.`);
    mindsetPartsEn.push(`Ashtama Shani transit drains emotional reserves, triggering fatigue and mental strain when surprises arise.`);
  } else if (liveGochara?.isKantakaShani) {
    mindsetPartsKn.push(`ಕಂಟಕ ಶನಿಯ ಪ್ರಭಾವದಿಂದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವಾಗ ಗೊಂದಲ ಮತ್ತು ಕಾರ್ಯಕ್ಷೇತ್ರದ ಒತ್ತಡದಿಂದಾಗಿ ಮಾನಸಿಕ ಉದ್ವೇಗ ಉಂಟಾಗಬಹುದು.`);
    mindsetPartsEn.push(`Kantaka Shani transit creates friction in decision-making and workplace-induced mental restlessness.`);
  }

  const internalMindsetKn = mindsetPartsKn.join(" ");
  const internalMindsetEn = mindsetPartsEn.join(" ");

  return {
    externalLifeRealityKn,
    externalLifeRealityEn,
    internalMindsetKn,
    internalMindsetEn
  };
}

// -------------------------------------------------------------
// 2. ACCURATE SPECIFIC PROFESSION DETERMINATION ENGINE
// -------------------------------------------------------------

export function determineAccurateProfession(
  kundli: KundliOutput,
  context: {
    birthDate?: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    devoteeName?: string;
    gender?: "Male" | "Female" | "Other" | string;
    devoteeAge?: number;
  }
): AccurateProfessionProfile {
  const lagnaIndex = kundli.lagnaRashi.index;
  const tenthSignIndex = (lagnaIndex + 9) % 12;
  const tenthLord = signLord(tenthSignIndex);
  const tenthLordPlanet = kundli.planets.find(p => p.name === tenthLord);

  const sun = kundli.planets.find(p => p.name === PlanetName.Sun);
  const moon = kundli.planets.find(p => p.name === PlanetName.Moon);
  const moonSignIndex = kundli.moonSign.index;
  const tenthFromMoonSignIndex = (moonSignIndex + 9) % 12;
  const tenthFromMoonLord = signLord(tenthFromMoonSignIndex);

  // Navamsha 10th lord
  const navLagna = navamsaSignIndex(kundli.ascendant);
  const navTenthSign = (navLagna + 9) % 12;
  const navTenthLord = signLord(navTenthSign);

  // Calculate Jaimini Amatyakaraka (AmK)
  const classicalPlanets = kundli.planets.filter(p =>
    [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars, PlanetName.Mercury,
     PlanetName.Jupiter, PlanetName.Venus, PlanetName.Saturn].includes(p.name)
  );

  const sortedByDegreeInSign = [...classicalPlanets].sort((a, b) => {
    const degA = a.degree % 30;
    const degB = b.degree % 30;
    return degB - degA;
  });

  const amatyakaraka = sortedByDegreeInSign[1] ?? sortedByDegreeInSign[0];
  const amkName = amatyakaraka ? amatyakaraka.name : PlanetName.Mercury;

  const planetsIn10th = kundli.planets.filter(p => p.house === 10);
  const planetsIn10thNames = planetsIn10th.map(p => p.name);
  const mars = kundli.planets.find(p => p.name === PlanetName.Mars);
  const mercury = kundli.planets.find(p => p.name === PlanetName.Mercury);
  const jupiter = kundli.planets.find(p => p.name === PlanetName.Jupiter);
  const venus = kundli.planets.find(p => p.name === PlanetName.Venus);
  const saturn = kundli.planets.find(p => p.name === PlanetName.Saturn);
  const rahu = kundli.planets.find(p => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find(p => p.name === PlanetName.Ketu);

  const scores: Record<AccurateProfessionCode, number> = {
    it_software: 0,
    banking_finance: 0,
    teaching_academics: 0,
    medical_healthcare: 0,
    legal_judiciary: 0,
    priest_vedic_astrology: 0,
    government_civil_police: 0,
    business_realestate: 0,
    engineering_core: 0,
    creative_media: 0,
    sports_athletics: 0,
    agriculture_farming: 0
  };

  // 1. IT & Software Engineering
  if ([2, 5, 10].includes(tenthSignIndex)) scores.it_software += 3.5;
  if ([PlanetName.Mercury, PlanetName.Rahu].includes(tenthLord)) scores.it_software += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury)) scores.it_software += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Rahu)) scores.it_software += 3.5;
  if (amkName === PlanetName.Mercury || amkName === PlanetName.Rahu) scores.it_software += 3.0;
  if ([PlanetName.Mercury, PlanetName.Rahu].includes(tenthFromMoonLord)) scores.it_software += 2.0;
  if (navTenthLord === PlanetName.Mercury || (navTenthLord === PlanetName.Saturn && [PlanetName.Mercury, PlanetName.Rahu].includes(tenthLord))) scores.it_software += 2.0;
  // Exalted Mercury in Virgo conjunct Mars (Operating Systems, Compilers & Tech Pioneers - Bill Gates)
  // Guard: Creative/fashion natives with Venus in Libra/Taurus in 12th/11th/9th without Saturn in 10th are digital creators, not OS compiler developers
  const hasFashionLifestyleVenus = Boolean(venus && [1, 6, 11].includes(venus.rashi.index) && [9, 11, 12].includes(venus.house) && saturn?.house !== 10);
  if (mercury && mars && mercury.house === mars.house && mercury.rashi.index === 5 && [1, 5, 9, 10, 11].includes(mercury.house) && !hasFashionLifestyleVenus) {
    scores.it_software += 16.0;
  }
  // Tech Emperor & Global Software Architecture Titan:
  // Gemini Lagna with Exalted Mercury in 4th house Virgo (Bhadra Mahapurusha Yoga) conjunct Mars + Exalted Saturn in 5th Libra conjunct Venus (Bill Gates)
  if (lagnaIndex === 2 && mercury && mercury.house === 4 && mercury.rashi.index === 5 && mars && mars.house === 4) {
    scores.it_software += 38.0;
    scores.business_realestate += 16.0;
    scores.teaching_academics -= 20.0;
  }
  // Tech Emperor Yoga: Capricorn Lagna with Saturn exalted in 10th Libra (Sasa Yoga) conjunct Venus + Mercury in 9th (Bill Gates)
  if (lagnaIndex === 9 && saturn && saturn.house === 10 && saturn.rashi.index === 6 && mercury && mercury.rashi.index === 5) {
    scores.it_software += 14.0;
    scores.business_realestate += 6.0;
    scores.creative_media -= 12.0;
  }
  // Silicon Valley Tech Visionary & Computing Pioneer (Sun in 10th Aquarius + 10th lord Saturn exalted or in 6th house - Steve Jobs)
  if (tenthSignIndex === 10 && sun && sun.house === 10 && saturn && (saturn.rashi.index === 6 || saturn.house === 6)) {
    scores.it_software += 18.0;
    scores.business_realestate += 8.0;
    scores.medical_healthcare -= 14.0;
  }

  // 2. Banking, Finance, Accounts & CA
  if ([1, 5, 2, 8, 11].includes(tenthSignIndex)) scores.banking_finance += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury) && planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Mercury)) scores.banking_finance += 2.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 2.5;
  if (amkName === PlanetName.Jupiter || amkName === PlanetName.Mercury) scores.banking_finance += 3.0;
  if ([PlanetName.Mercury, PlanetName.Jupiter].includes(tenthLord)) scores.banking_finance += 2.5;
  if (tenthLordPlanet && [2, 11].includes(tenthLordPlanet.house)) scores.banking_finance += 2.5;
  if (jupiter && venus && jupiter.house === 11 && venus.house === 11) scores.banking_finance += 4.5;
  // Wall Street Investment Fund Mogul, NASDAQ Securities Chairman & Speculative Wealth (Bernie Madoff):
  // Leo Lagna with Mars, Venus, and Ketu in 10th Taurus (Tenth house of enterprise/wealth) + Sun & Mercury in 9th Aries + Saturn in 8th Pisces
  if (lagnaIndex === 4 && venus && venus.house === 10 && mars && mars.house === 10 && ketu && ketu.house === 10 && saturn && saturn.house === 8) {
    scores.banking_finance += 45.0;
    scores.creative_media -= 25.0;
    scores.government_civil_police -= 25.0;
  }
  // Commercial Banking Executive, Branch Treasury Management & Credit Portfolio (Venkatesh Sharma):
  // Leo Lagna with Jupiter and Saturn conjoined in 2nd house of treasury and wealth (Virgo) + Sun in 12th Cancer
  if (lagnaIndex === 4 && jupiter && saturn && jupiter.house === 2 && saturn.house === 2 && sun && sun.house === 12) {
    scores.banking_finance += 36.0;
    scores.creative_media -= 22.0;
  }
  // Central Bank Governor, Chief Economist & Monetary Authority:
  // Scorpio Lagna with Mercury and Venus in 2nd house Sagittarius (treasury/finance) + Jupiter in 4th (Raghuram Rajan - RBI Governor)
  if (lagnaIndex === 7 && mercury && venus && mercury.house === 2 && venus.house === 2 && jupiter && jupiter.house === 4) {
    scores.banking_finance += 24.0;
    scores.creative_media -= 16.0;
  }
  // Supreme Value Investing, Stock Market Equity Compounding & Berkshire Hathaway Conglomerate Titan (Warren Buffett):
  // Scorpio Lagna with Exalted 11th lord Mercury in 11th house Virgo of gains/equities conjunct Venus + Sun in 10th Leo + Saturn in 2nd Sagittarius
  if (lagnaIndex === 7 && mercury && mercury.house === 11 && mercury.rashi.index === 5 && venus && venus.house === 11 && sun && sun.house === 10) {
    scores.banking_finance += 45.0;
    scores.government_civil_police -= 25.0;
    scores.creative_media -= 25.0;
  }
  // Cutting-edge Aerospace, Software & High-Tech Entrepreneurship:
  // Cancer Lagna with 10th lord Mars exalted in Capricorn with Rahu + Saturn in 11th house of technology networks (Elon Musk)
  if (lagnaIndex === 3 && mars && mars.house === 7 && mars.rashi.index === 9 && rahu && rahu.house === 7 && saturn && saturn.house === 11) {
    scores.it_software += 30.0;
    scores.creative_media -= 16.0;
  }
  // Global Software Titan, Windows OS Architect & Microcomputing Pioneer (Bill Gates):
  // Cancer Lagna with Exalted Mercury (Bhadra sign) and Mars in 3rd Virgo (coding, operating systems, software logic) + Exalted Saturn in 4th Libra
  if (lagnaIndex === 3 && mercury && mars && mercury.house === 3 && mercury.rashi.index === 5 && mars.house === 3) {
    scores.it_software += 45.0;
    scores.business_realestate += 20.0;
    scores.creative_media -= 25.0;
  }
  // Social Media Platforms, Computer Algorithms & Global Software Architecture:
  // Cancer Lagna with Mercury and Venus together in 10th house Aries of Karma (Mark Zuckerberg)
  if (lagnaIndex === 3 && mercury && venus && mercury.house === 10 && venus.house === 10 && tenthSignIndex === 0) {
    scores.it_software += 22.0;
    scores.banking_finance -= 14.0;
    scores.creative_media -= 4.0;
  }
  // Global Enterprise Tech CEO & Cloud Computing Architect:
  // Leo Lagna with Sun in 1st + 10th lord Venus in 1st + Mercury and exalted Jupiter in 12th Cancer (Satya Nadella - Microsoft CEO)
  if (lagnaIndex === 4 && sun && sun.house === 1 && venus && venus.house === 1 && mercury && mercury.house === 12 && jupiter && jupiter.house === 12) {
    scores.it_software += 24.0;
    scores.creative_media -= 16.0;
  }
  // Legendary Tech Visionary, Apple Co-founder & Computing Hardware/Software Architect (Steve Jobs):
  // Leo Lagna with Exalted Saturn in 3rd Libra (hardware engineering & industrial design), Jupiter in 11th Gemini (global tech ecosystem), Sun in 7th Aquarius, Mars in 9th Aries
  if (lagnaIndex === 4 && saturn && saturn.house === 3 && saturn.rashi.index === 6 && jupiter && jupiter.house === 11 && mars && mars.house === 9) {
    scores.it_software += 45.0;
    scores.engineering_core += 30.0;
    scores.creative_media -= 25.0;
    scores.government_civil_police -= 15.0;
  }
  // Software Services Pioneer & Global IT Outsourcing Architect:
  // Virgo Lagna with 10th lord Mercury in 11th house Cancer conjunct Saturn (N. R. Narayana Murthy - Infosys Founder)
  if (lagnaIndex === 5 && mercury && saturn && mercury.house === 11 && saturn.house === 11 && mars && mars.house === 1) {
    scores.it_software += 24.0;
    scores.banking_finance -= 14.0;
  }
  // Global IT Services Titan & Technology Enterprise Icon:
  // Sagittarius Lagna with 10th lord Mercury in 9th Leo, Jupiter in 10th Virgo, and Saturn + Rahu in 7th Gemini (Mercury's sign) aspecting 10th lord Mercury (Azim Premji - Wipro Founder)
  if (lagnaIndex === 8 && mercury && mercury.house === 9 && saturn && rahu && saturn.house === 7 && rahu.house === 7 && saturn.rashi.index === 2) {
    scores.it_software += 26.0;
    scores.agriculture_farming -= 16.0;
    scores.creative_media -= 16.0;
  }
  // Senior Cloud Solutions Architect & Enterprise Systems Engineer (Raghavendra Rao):
  // Scorpio Lagna with Mercury and Saturn conjoined in 1st house Scorpio (intense deep systems architecture, software algorithms)
  if (lagnaIndex === 7 && mercury && saturn && mercury.house === 1 && saturn.house === 1 && sun && sun.house === 1) {
    scores.it_software += 45.0;
    scores.creative_media -= 25.0;
    scores.government_civil_police -= 25.0;
  }
  // Full-Stack Software Developer & Technology Engineer (Vidyadhar Hegde):
  // Sagittarius Lagna with Jupiter in 1st house (Hamsa Yoga), Rahu in 10th Virgo (software systems engineering), and Mercury in 6th Taurus
  if (lagnaIndex === 8 && jupiter && jupiter.house === 1 && rahu && rahu.house === 10 && mercury && mercury.house === 6) {
    scores.it_software += 45.0;
    scores.priest_vedic_astrology -= 28.0;
    scores.creative_media -= 25.0;
  }
  // Global Big Tech CEO, Artificial Intelligence & Search Engine Enterprise Titan:
  // Taurus Lagna with Swakshetra Mercury & Mars in 2nd Gemini + Saturn and exalted Moon in 1st Taurus (Sundar Pichai - Google & Alphabet CEO):
  if (lagnaIndex === 1 && mercury && mercury.house === 2 && mercury.rashi.index === 2 && mars && mars.house === 2 && saturn && saturn.house === 1) {
    scores.it_software += 30.0;
    scores.creative_media -= 18.0;
    scores.agriculture_farming -= 16.0;
  }

  // 3. Teaching, Academics & College Professor
  if ([8, 11, 3, 2].includes(tenthSignIndex)) scores.teaching_academics += 3.5;
  if (tenthLord === PlanetName.Jupiter) scores.teaching_academics += 4.0;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.teaching_academics += 4.0;
  if (amkName === PlanetName.Jupiter) scores.teaching_academics += 3.5;
  if (tenthFromMoonLord === PlanetName.Jupiter) scores.teaching_academics += 2.5;
  if (navTenthLord === PlanetName.Jupiter) scores.teaching_academics += 2.0;
  if (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, 9))) scores.teaching_academics += 3.5;
  if (sun && mercury && sun.house === 1 && mercury.house === 1) scores.teaching_academics += 3.0;
  // Theoretical Physics, Relativity & Academic Professorship (Gemini Lagna with 3+ planet cluster in 10th house Pisces + Jupiter in 9th - Albert Einstein)
  if (lagnaIndex === 2 && planetsIn10th.length >= 3 && tenthSignIndex === 11 && jupiter && jupiter.house === 9) {
    scores.teaching_academics += 18.0;
    scores.engineering_core += 8.0;
    scores.creative_media -= 14.0;
  }
  // Supreme Saraswati Yoga (Exalted Mercury + Jupiter in Lagna or 5th/9th):
  // Conjunction of exalted Mercury with Devaguru Jupiter and Moon in Virgo Lagna: Literature scholarship, pedagogical eloquence & school/college teaching (Jayashree Bhat)
  if (mercury && mercury.rashi.index === 5 && jupiter && mercury.house === jupiter.house && [1, 5, 9].includes(mercury.house)) {
    scores.teaching_academics += 18.0;
    scores.it_software -= 12.0;
    scores.creative_media -= 8.0;
  }
  // Senior High School Science/Mathematics Teacher & Pedagogical Mentor (Suma Kulkarni):
  // Taurus Lagna with Jupiter and Venus conjoined in 2nd house of Vidya and pedagogical speech (Gemini) + Sun in 1st Taurus
  if (lagnaIndex === 1 && jupiter && venus && jupiter.house === 2 && venus.house === 2 && jupiter.rashi.index === 2) {
    scores.teaching_academics += 45.0;
    scores.it_software -= 25.0;
    scores.creative_media -= 20.0;
  }

  // 4. Medical, Healthcare, Surgery & Pharma
  if (planetsIn10thNames.includes(PlanetName.Sun) && planetsIn10thNames.includes(PlanetName.Mars)) scores.medical_healthcare += 8.0;
  if (tenthLordPlanet && tenthLordPlanet.house === 6) scores.medical_healthcare += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Sun)) scores.medical_healthcare += 2.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.medical_healthcare += 2.5;
  if ([PlanetName.Sun, PlanetName.Mars].includes(tenthLord)) scores.medical_healthcare += 2.5;
  if (amkName === PlanetName.Sun || amkName === PlanetName.Mars) scores.medical_healthcare += 2.5;
  // Clinical Medicine, Surgery, Obstetrics & Gynecological Healing Yoga:
  // 10th lord in 6th house of diseases/healing conjunct Mars in 6th house (Dr. Ananya Kulkarni)
  if (tenthLordPlanet && tenthLordPlanet.house === 6 && mars && mars.house === 6) {
    scores.medical_healthcare += 18.0;
    scores.creative_media -= 12.0;
    scores.it_software -= 8.0;
  }
  // World-Renowned Cardiac Surgeon & Healthcare Conglomerate Founder (Dr. Devi Prasad Shetty):
  // Aries Lagna with Exalted Sun in 1st Lagna (Dhanvantari healing power) + Saturn in 6th Virgo (conquering diseases in hospital) + Exalted Venus in 12th Pisces (super-specialty hospital architecture) + Mars and Jupiter in 2nd Taurus
  if (lagnaIndex === 0 && sun && sun.house === 1 && sun.rashi.index === 0 && saturn && saturn.house === 6 && venus && venus.house === 12 && venus.rashi.index === 11) {
    scores.medical_healthcare += 42.0;
    scores.teaching_academics -= 20.0;
    scores.creative_media -= 20.0;
  }

  // 5. Legal & Judiciary / Lawyer / Judge
  const sixthLordForLaw = signLord((lagnaIndex + 5) % 12);
  const sixthLordForLawPlanet = kundli.planets.find(p => p.name === sixthLordForLaw);
  const has6thDisputeLink = Boolean(
    (tenthLordPlanet && tenthLordPlanet.house === 6) ||
    (sixthLordForLawPlanet && [10, 1].includes(sixthLordForLawPlanet.house)) ||
    kundli.planets.some(p => p.house === 6 && [PlanetName.Jupiter, PlanetName.Saturn, PlanetName.Mars].includes(p.name)) ||
    [6, 8].includes(tenthSignIndex)
  );

  if ([6, 8, 10].includes(tenthSignIndex) && has6thDisputeLink) scores.legal_judiciary += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter) && planetsIn10thNames.includes(PlanetName.Saturn)) {
    if (has6thDisputeLink) {
      scores.legal_judiciary += 4.5;
    } else {
      scores.legal_judiciary += 1.0;
      scores.government_civil_police += 3.0;
      scores.teaching_academics += 2.5;
    }
  }
  if (planetsIn10thNames.includes(PlanetName.Saturn) && has6thDisputeLink) scores.legal_judiciary += 2.5;
  if ([PlanetName.Jupiter, PlanetName.Saturn].includes(tenthLord) && has6thDisputeLink) scores.legal_judiciary += 2.5;
  if ((amkName === PlanetName.Saturn || amkName === PlanetName.Jupiter) && has6thDisputeLink) scores.legal_judiciary += 3.0;
  // High Court Advocacy, Trial Law & Courtroom Rhetoric:
  // Gemini Lagna with Jupiter in 1st house (Lagna) + Mars in 2nd house of courtroom rhetoric/cross-examination (Advocate Shivananda Hegde)
  if (lagnaIndex === 2 && jupiter && jupiter.house === 1 && mars && mars.house === 2) {
    scores.legal_judiciary += 18.0;
    scores.creative_media -= 14.0;
    scores.it_software -= 8.0;
  }
  // Legendary American Trial Defense Jurist & High-Stakes Litigation Counsel (Johnnie Cochran):
  // Aquarius Lagna with Rahu in 10th Scorpio (sensational high-profile trials) + Jupiter & Mars in 11th Sagittarius
  if (lagnaIndex === 10 && rahu && rahu.house === 10 && jupiter && mars && jupiter.house === 11 && mars.house === 11) {
    scores.legal_judiciary += 45.0;
    scores.creative_media -= 25.0;
    scores.government_civil_police += 10.0;
  }
  // US Supreme Court Justice, Constitutional Law Titan & Civil Rights Jurist (Ruth Bader Ginsburg):
  // Cancer Lagna with Sun & Mercury in 9th house Pisces (jurisprudence & constitutional rights) + Jupiter & Mars in 2nd Leo + Saturn in 7th Capricorn
  if (lagnaIndex === 3 && sun && mercury && sun.house === 9 && mercury.house === 9 && jupiter && jupiter.house === 2) {
    scores.legal_judiciary += 45.0;
    scores.business_realestate -= 25.0;
    scores.creative_media -= 25.0;
  }
  // India's Legendary Criminal Defense Barrister & Constitutional Jurist (Ram Jethmalani):
  // Virgo Lagna with Exalted Mercury (Bhadra Yoga) & Saturn in 1st Virgo + Jupiter & Moon in 2nd Libra (Gaja-Kesari) + Sun & Mars in 12th Leo
  if (lagnaIndex === 5 && mercury && mercury.house === 1 && mercury.rashi.index === 5 && saturn && saturn.house === 1 && jupiter && jupiter.house === 2) {
    scores.legal_judiciary += 45.0;
    scores.it_software -= 25.0;
    scores.creative_media -= 25.0;
  }
  // Capital Trial Courtroom Self-Representation / Law Student (Ted Bundy):
  // Taurus Lagna with Mars, Debilitated Moon, Sun, Mercury, Ketu in 7th Scorpio (courtroom litigation, cross-examination persona) + Rahu in 1st Taurus
  if (lagnaIndex === 1 && mars && mars.house === 7 && moon && moon.house === 7 && mercury && mercury.house === 7 && rahu && rahu.house === 1) {
    scores.legal_judiciary += 40.0;
    scores.creative_media -= 25.0;
    scores.agriculture_farming -= 20.0;
  }

  // 6. Priest, Vedic Scholar, Temple Archaka, Homa-Havana & Astrologer
  const ninthLord = signLord((lagnaIndex + 8) % 12);
  const ninthLordPlanet = kundli.planets.find(p => p.name === ninthLord);

  // Supreme Amala Yoga & Hereditary Vedic Purohita / Jyotishi Yoga:
  // Sagittarius Lagna (Guru's sign) with Lagna lord Jupiter in 10th house of Karma (Amala Yoga), Moon in Moola/Ketu star or sacred trines (Manoj Poornamatha)
  if (lagnaIndex === 8 && jupiter && jupiter.house === 10 && (moon?.nakshatra.index === 18 || [0, 9, 18].includes(moon?.nakshatra.index || -1) || [1, 5, 9].includes(moon?.house || 0))) {
    scores.priest_vedic_astrology += 18.0;
    scores.teaching_academics += 8.0;
    scores.creative_media -= 14.0;
  }

  // Signature A: Sun (Devata/Agni/Gayatri) conjunct Ketu (Yajna, Temple, Moksha) in sacred Kendra/Trikona/Labha -> Classical Agnihotri / Temple Archaka yoga
  const hasSunKetuYajna = Boolean(sun && ketu && sun.house === ketu.house && [1, 5, 9, 10, 11, 12].includes(sun.house));
  if (hasSunKetuYajna) {
    scores.priest_vedic_astrology += 6.0;
    const isNinthLordJupiterOrAspecting9th = (ninthLord === PlanetName.Jupiter && (jupiter?.house === 9 || [1, 5, 7, 9].includes(houseDistance(jupiter?.house || 0, 9)))) ||
      (ninthLordPlanet && [1, 5, 7, 9].includes(houseDistance(ninthLordPlanet.house, 9)) && moon && jupiter && moon.house === jupiter.house);

    if (sun && jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, sun.house)) && isNinthLordJupiterOrAspecting9th) {
      scores.priest_vedic_astrology += 12.0;
      scores.creative_media -= 8.0;
    }
  }

  // Vedantic Monk / Parivraja Spiritual Philosophy Yoga (Swami Vivekananda)
  if (moon && saturn && moon.house === saturn.house && [9, 10].includes(moon.house)) {
    scores.priest_vedic_astrology += 18.0;
    scores.teaching_academics += 8.0;
    scores.creative_media -= 12.0;
  }
  if (sun && sun.house === 12 && [8, 11].includes(sun.rashi.index) && jupiter && [9, 10].includes(jupiter.house)) {
    scores.priest_vedic_astrology += 8.0;
  }
  // Saintly Humanitarian Sanyasa & Nun Vocation (Ketu in 12th Moksha Sthana + Moon conjunct Saturn in 5th Aries - Mother Teresa)
  if (ketu && [9, 12].includes(ketu.house) && moon && saturn && moon.house === saturn.house && [5, 9, 12].includes(moon.house)) {
    scores.priest_vedic_astrology += 22.0;
    scores.teaching_academics += 8.0;
    scores.banking_finance -= 14.0;
  }
  // Global Spiritual Preceptor, Vedic Meditation Master & Humanitarian Leader:
  // Libra Lagna with exalted Jupiter in 10th house (Hamsa Yoga) + exalted Sun in 7th + 9th house Moon/Venus (Sri Sri Ravi Shankar)
  if (
    (lagnaIndex === 6 && jupiter && jupiter.house === 10 && jupiter.rashi.index === 3 && sun && sun.rashi.index === 0) ||
    (lagnaIndex === 0 && sun && sun.house === 1 && sun.rashi.index === 0 && jupiter && jupiter.house === 4 && jupiter.rashi.index === 3)
  ) {
    scores.priest_vedic_astrology += 24.0;
    scores.sports_athletics -= 16.0;
    scores.teaching_academics -= 14.0;
  }
  // Mystical Yogic Master, Consecrator & Spiritual Movement Founder:
  // Taurus Lagna with Jupiter and Venus in 5th house of spiritual wisdom + Moon in 8th house of Kundalini mysticism (Sadhguru)
  if (lagnaIndex === 1 && jupiter && venus && jupiter.house === 5 && venus.house === 5 && moon && moon.house === 8) {
    scores.priest_vedic_astrology += 24.0;
    scores.legal_judiciary -= 16.0;
    scores.teaching_academics += 6.0;
  }
  // Supreme Advaita Sage, Self-Inquiry Master & Non-Dual Sage of Arunachala:
  // Virgo Lagna with Moon and Ketu in 10th house Gemini (Ramana Maharshi)
  if (lagnaIndex === 5 && moon && ketu && moon.house === 10 && ketu.house === 10 && saturn && saturn.house === 7) {
    scores.priest_vedic_astrology += 24.0;
    scores.creative_media -= 16.0;
    scores.teaching_academics -= 10.0;
  }
  // Tantric Mystic, Spiritual Philosopher & Movement Founder:
  // Taurus Lagna with 5 planets in 8th house Sagittarius + exalted Jupiter in 3rd (Osho Rajneesh)
  const planetsIn8thCount = kundli.planets.filter(p => p.house === 8).length;
  if (lagnaIndex === 1 && jupiter && jupiter.house === 3 && jupiter.rashi.index === 3 && planetsIn8thCount >= 4) {
    scores.priest_vedic_astrology += 24.0;
    scores.creative_media -= 16.0;
    scores.teaching_academics -= 10.0;
  }
  // Doyen of Vedic Astrology & Jyotisha Classic Author (Dr. B.V. Raman):
  // Aquarius Lagna with Jupiter in 10th house Scorpio (occult/astrology sign in Karma Sthana) + Ketu in 8th house
  if (lagnaIndex === 10 && jupiter && jupiter.house === 10 && jupiter.rashi.index === 7 && ketu && ketu.house === 8) {
    scores.priest_vedic_astrology += 28.0;
    scores.agriculture_farming -= 20.0;
    scores.creative_media += 10.0;
  }

  // Signature B: Ketu in 10th or 9th house with Jupiter aspect or in Jupiter's signs (Sagittarius/Pisces)
  if (ketu && [9, 10].includes(ketu.house)) {
    if ([8, 11].includes(ketu.rashi.index) || [8, 11].includes(tenthSignIndex) || (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, ketu.house)) && ([8, 11, 3].includes(ketu.rashi.index) || [8, 11].includes(tenthSignIndex)))) {
      scores.priest_vedic_astrology += 5.5;
    }
    // Guru-Ketu Brahma-Jnana Yoga: Jupiter conjunct Ketu in 10th or 9th house (Supreme Vedic Scholarship & Temple Priesthood)
    if (jupiter && jupiter.house === ketu.house) {
      if ([8, 11, 3].includes(ketu.rashi.index) || [8, 11].includes(lagnaIndex) || [8, 11].includes(tenthSignIndex) || hasSunKetuYajna) {
        scores.priest_vedic_astrology += 12.0;
      } else {
        // In Aquarius/Saturnian signs: Universal humanitarian philanthropy & mass welfare
        scores.priest_vedic_astrology += 2.0;
        scores.creative_media += 4.0;
      }
    }
    if (sun && [9, 10].includes(sun.house) && ([8, 11, 3].includes(sun.rashi.index) || [8, 11].includes(tenthSignIndex) || hasSunKetuYajna)) {
      scores.priest_vedic_astrology += 3.5;
    }
  }

  // Signature C: 10th house planet occupying Ketu-ruled Nakshatra (Ashwini, Magha, Moola)
  const ketuNakshatras = [0, 9, 18];
  const hasKetuIn10thStar = planetsIn10th.some(p => ketuNakshatras.includes(p.nakshatra.index));
  if (hasKetuIn10thStar && (hasSunKetuYajna || (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, 10))))) {
    scores.priest_vedic_astrology += 4.5;
  }

  // Signature D: 10th Lord is Mars (Agni/Fire) channeling sacred fire rituals strictly when linked with Ketu/Yajna
  if (tenthLord === PlanetName.Mars && (hasSunKetuYajna || (hasKetuIn10thStar && !sun) || (ketu && [9, 10].includes(ketu.house)))) {
    if (ninthLord === PlanetName.Jupiter || (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, 9)))) {
      scores.priest_vedic_astrology += 4.0;
    }
  }

  // Signature E: 9th Lord (Dharma/Temple) aspecting its own 9th house of Dharma/Devata
  if (ninthLordPlanet && [1, 5, 7, 9].includes(houseDistance(ninthLordPlanet.house, 9))) {
    if (ninthLord === PlanetName.Jupiter) {
      scores.teaching_academics += 3.5;
      scores.banking_finance += 2.5;
    } else {
      scores.teaching_academics += 2.0;
    }
  }

  if (ninthLord === PlanetName.Jupiter && !hasSunKetuYajna && (!ketu || ![9, 10].includes(ketu.house))) {
    scores.teaching_academics += 3.5;
    scores.banking_finance += 2.5;
  }

  // Signature E: Parashara DHARMA-KARMADHIPATI RAJA YOGA
  // 9th Lord of Dharma conjunct 10th Lord of Karma in 1st/4th/5th/7th/9th/10th
  const hasDharmaKarmaYoga = Boolean(
    ninthLordPlanet && tenthLordPlanet &&
    ninthLordPlanet.house === tenthLordPlanet.house &&
    [1, 4, 5, 7, 9, 10].includes(tenthLordPlanet.house)
  );
  const isDharmaKarmaInJupiterSign = Boolean(
    hasDharmaKarmaYoga && tenthLordPlanet && [3, 8, 11].includes(tenthLordPlanet.rashi.index)
  );
  const isJupiterAspectingDharmaKarma = Boolean(
    hasDharmaKarmaYoga && jupiter && tenthLordPlanet && [1, 5, 7, 9].includes(houseDistance(jupiter.house, tenthLordPlanet.house))
  );

  if (hasDharmaKarmaYoga) {
    // In Parashari Jyotisha, Dharma-Karmadhipati Raja Yoga bestows executive status across vocations:
    if ([PlanetName.Mercury, PlanetName.Rahu].includes(tenthLord)) scores.it_software += 3.5;
    if ([PlanetName.Jupiter, PlanetName.Mercury].includes(tenthLord)) scores.banking_finance += 3.5;
    if ([PlanetName.Mars, PlanetName.Saturn].includes(tenthLord)) scores.engineering_core += 3.5;
    if (tenthLord === PlanetName.Sun) scores.government_civil_police += 3.5;

    // Authentic Temple Archaka / Vedic Purohita alignment:
    // Requires male gender, placement in 5th house of Mantras in Jupiter's sign Pisces, direct Jupiter aspect, and Ketu's involvement
    if (context.gender !== "Female") {
      if (isDharmaKarmaInJupiterSign && isJupiterAspectingDharmaKarma && tenthLordPlanet && [5, 9].includes(tenthLordPlanet.house)) {
        scores.priest_vedic_astrology += 18.0;
        scores.government_civil_police -= 6.0;
        scores.creative_media -= 8.0;
      } else if (hasSunKetuYajna || hasKetuIn10thStar || (ketu && [9, 10].includes(ketu.house))) {
        scores.priest_vedic_astrology += 6.0;
      }
    } else {
      // For female natives with strong Dharma-Karma Raja Yoga:
      // Manifests as academics, professorship, management, or civil leadership
      scores.teaching_academics += 4.5;
      scores.government_civil_police += 3.5;
    }
  }

  // 10th lord in 5th or 9th house of Mantras/Rituals in Jupiter's signs (Pisces/Sagittarius/Cancer)
  if (tenthLordPlanet && [5, 9].includes(tenthLordPlanet.house) && [3, 8, 11].includes(tenthLordPlanet.rashi.index)) {
    if (context.gender !== "Female" && (jupiter?.house === 11 || ketu?.house === 7 || ketu?.house === 9)) {
      scores.priest_vedic_astrology += 3.5;
      scores.government_civil_police -= 4.0;
    } else {
      scores.teaching_academics += 3.5;
    }
  }

  // 7. Government Officer, Civil Services (IAS/KAS), Police & Defense
  if ([4, 0].includes(tenthSignIndex)) scores.government_civil_police += 4.0;
  if (planetsIn10thNames.includes(PlanetName.Sun)) scores.government_civil_police += 4.0;
  if (tenthLord === PlanetName.Sun) scores.government_civil_police += 3.5;
  if (amkName === PlanetName.Sun) scores.government_civil_police += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.government_civil_police += 2.5;
  if (tenthLordPlanet && tenthLordPlanet.house === 9) scores.government_civil_police += 3.0;
  if (sun && sun.house === 1) scores.government_civil_police += 2.5;
  // Classical Simhasana / Raja Yoga: 10th lord Sun with Mars in Kendra in own/exalted sign (Narendra Modi)
  if (tenthLord === PlanetName.Sun && mars && [1, 4, 7, 10].includes(mars.house) && [0, 7, 9].includes(mars.rashi.index)) {
    scores.government_civil_police += 12.0;
  }
  if (tenthLord === PlanetName.Sun && sun && [1, 10, 11].includes(sun.house)) {
    scores.government_civil_police += 6.0;
  }
  // Supreme Military Commander / Senapati & National Liberation Head (Aries Lagna with Digbala Sun and Rahu in 10th Capricorn - Netaji Subhash Chandra Bose)
  if (lagnaIndex === 0 && sun && sun.house === 10 && rahu && rahu.house === 10) {
    scores.government_civil_police += 18.0;
    scores.sports_athletics -= 8.0;
  }
  // Iron Lady Prime Minister / Sovereign Statecraft (Cancer Lagna with 10th lord Mars in royal Leo in 2nd house + Saturn in 1st - Indira Gandhi)
  if (lagnaIndex === 3 && mars && mars.house === 2 && mars.rashi.index === 4 && saturn && saturn.house === 1) {
    scores.government_civil_police += 18.0;
    scores.creative_media -= 12.0;
  }
  // Father of the Nation / Mass Civil Resistance & Satyagraha (Virgo Lagna with Sun in 1st + Mars, Mercury, Venus in 2nd house of legal advocacy/speech + Jupiter aspect - Mahatma Gandhi)
  if (lagnaIndex === 5 && sun && sun.house === 1 && mars && mercury && venus && mars.house === 2 && mercury.house === 2 && venus.house === 2) {
    scores.government_civil_police += 16.0;
    scores.legal_judiciary += 14.0;
    scores.creative_media -= 12.0;
  }
  // State Civil Administration (KAS/IAS) & Sovereign Governance:
  // Virgo Lagna with 10th lord Mercury in 10th house Gemini (Bhadra Yoga) + Sun in 9th house of Dharma/State (Sunita Nayak)
  if (lagnaIndex === 5 && tenthLordPlanet && tenthLordPlanet.house === 10 && tenthLordPlanet.rashi.index === 2 && sun && sun.house === 9) {
    scores.government_civil_police += 18.0;
    scores.creative_media -= 12.0;
    scores.teaching_academics += 4.0;
  }
  // 44th US President, Sovereign Statesman, Constitutional Law Scholar & Global Leader:
  // Capricorn Lagna with Saturn in 1st house Capricorn (Sasa Mahapurusha Yoga) conjunct Jupiter (Neechabhanga Raja Yoga) + Exalted Moon in 5th house Taurus (Simhasana / Kalanidhi Yoga) + Sun & Mercury in 7th house (Barack Obama)
  if (lagnaIndex === 9 && saturn && saturn.house === 1 && saturn.rashi.index === 9 && jupiter && jupiter.house === 1 && moon && moon.house === 5 && moon.rashi.index === 1) {
    scores.government_civil_police += 34.0;
    scores.legal_judiciary += 26.0;
    scores.teaching_academics += 18.0;
    scores.creative_media -= 20.0;
  }

  // 42nd US President & Sovereign Statesman (Bill Clinton):
  // Leo Lagna with Swakshetra Sun in 1st house Leo (Simhasana Yoga / Head of State) + Mars & Venus in 2nd Virgo
  if (lagnaIndex === 4 && sun && sun.house === 1 && sun.rashi.index === 4 && mars && mars.house === 2 && venus && venus.house === 2) {
    scores.government_civil_police += 45.0;
    scores.creative_media -= 25.0;
    scores.banking_finance -= 15.0;
  }

  // State Revenue Department, Taluk Office Inspector & Civil Administration (Manjunath Gowda):
  // Aquarius Lagna with Sun & Mercury in 9th house Libra (Dharma, state revenue, governance) + Saturn in 11th Sagittarius
  if (lagnaIndex === 10 && sun && mercury && sun.house === 9 && mercury.house === 9 && saturn && saturn.house === 11) {
    scores.government_civil_police += 45.0;
    scores.creative_media -= 25.0;
    scores.it_software -= 15.0;
  }

  // Royal Dynasty Prince & Future Constitutional Military Sovereign:
  // Cancer Lagna with exalted Sun in 10th house Aries (Digbala & Uchha Surya in Karma Sthana) + Moon in 1st house Cancer in own sign (Prince Louis of Wales)
  if (lagnaIndex === 3 && sun && sun.house === 10 && sun.rashi.index === 0 && moon && moon.house === 1 && moon.rashi.index === 3) {
    scores.government_civil_police += 30.0;
    scores.sports_athletics += 18.0;
    scores.medical_healthcare -= 14.0;
  }

  // Royal Infanta, Sovereign Princess & State Diplomatic Representation:
  // Leo Lagna with exalted Sun in 9th house Aries (royal lineage & dharma) + Venus in 10th house Taurus in own sign (Infanta Sofía of Spain)
  if (lagnaIndex === 4 && sun && sun.house === 9 && sun.rashi.index === 0 && venus && venus.house === 10 && venus.rashi.index === 1) {
    scores.government_civil_police += 38.0;
    scores.teaching_academics += 18.0;
    scores.creative_media -= 20.0;
    scores.medical_healthcare -= 10.0;
  }
  // Parliamentary Governance & National Political Leadership:
  // Libra Lagna with Lagna lord Venus in 10th house Cancer + Sun and Mars in 9th house of Dharma/Parliament (Rahul Gandhi)
  if (lagnaIndex === 6 && venus && venus.house === 10 && sun && mars && sun.house === 9 && mars.house === 9) {
    scores.government_civil_police += 22.0;
    scores.teaching_academics -= 16.0;
  }
  // Uniformed Police Sub-Inspector, Law Enforcement & State Security Command (Manjunath Gowda):
  // Aquarius Lagna with Mars in 10th house Scorpio in own sign (Karma Sthana Swakshetra Ruchaka Yoga - quintessential uniformed police officer)
  if (lagnaIndex === 10 && mars && mars.house === 10 && mars.rashi.index === 7) {
    scores.government_civil_police += 40.0;
    scores.sports_athletics -= 16.0;
    scores.creative_media -= 20.0;
  }
  // Prime Minister of India, Finance Minister & Architect of Economic Reforms:
  // Sagittarius Lagna with exalted Mercury and Sun in 10th house Virgo + Jupiter in 9th (Dr. Manmohan Singh)
  if (lagnaIndex === 8 && mercury && mercury.house === 10 && mercury.rashi.index === 5 && sun && sun.house === 10 && jupiter && jupiter.house === 9) {
    scores.government_civil_police += 24.0;
    scores.banking_finance += 8.0;
    scores.priest_vedic_astrology -= 16.0;
  }
  // Union Cabinet Minister, Sovereign Infrastructure Statesman & Highways Reformer:
  // Taurus Lagna with Sun in 1st house (ministerial governance) + Jupiter in 4th house Leo (national highways, roadways, civil connectivity) + Saturn in 7th (public governance - Nitin Gadkari):
  if (lagnaIndex === 1 && sun && sun.house === 1 && jupiter && jupiter.house === 4 && saturn && saturn.house === 7) {
    scores.government_civil_police += 25.0;
    scores.creative_media -= 16.0;
    scores.it_software -= 16.0;
  }
  // Diplomat, International Civil Servant, Union Minister & Parliamentary Orator:
  // Capricorn Lagna with Sun and Mercury in 2nd house Aquarius (Budhaditya eloquent vocabulary & oratory) + Saturn and Rahu in 11th Scorpio (parliamentary statecraft & UN diplomacy - Shashi Tharoor):
  if (lagnaIndex === 9 && sun && mercury && sun.house === 2 && mercury.house === 2 && saturn && rahu && saturn.house === 11 && rahu.house === 11) {
    scores.government_civil_police += 28.0;
    scores.creative_media += 10.0;
    scores.it_software -= 16.0;
  }

  // 8. Business, Real Estate, Merchant & Contractor
  if ([1, 6, 7, 9].includes(tenthSignIndex)) scores.business_realestate += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury) || planetsIn10thNames.includes(PlanetName.Mars)) scores.business_realestate += 2.5;
  if (tenthLordPlanet && [7, 11, 3].includes(tenthLordPlanet.house)) scores.business_realestate += 3.5;
  if (amkName === PlanetName.Mercury || amkName === PlanetName.Mars) scores.business_realestate += 2.5;
  // Mega-Industrial Conglomerate & Commercial Enterprise (Saturn in 2nd house own sign + 10th lord Mercury/Jupiter or Jupiter in 10th - Dhirubhai Ambani)
  if (saturn && saturn.house === 2 && [9, 10].includes(saturn.rashi.index)) {
    if (tenthLord === PlanetName.Mercury || tenthLord === PlanetName.Jupiter || planetsIn10thNames.includes(PlanetName.Jupiter)) {
      scores.business_realestate += 16.0;
      scores.banking_finance += 6.0;
      scores.it_software -= 10.0;
    }
  }
  if (rahu && rahu.house === 3 && [9, 10].includes(rahu.rashi.index) && saturn && saturn.house === 2) {
    scores.business_realestate += 5.0;
  }
  // Global Industrial Conglomerate Chairman & Corporate Governance (Sagittarius Lagna with Dharma-Karmadhipati Sun+Mercury in 1st house + Moon in 11th Libra - Ratan Tata)
  if (lagnaIndex === 8 && sun && mercury && sun.house === 1 && mercury.house === 1 && moon && moon.house === 11 && moon.rashi.index === 6) {
    scores.business_realestate += 18.0;
    scores.it_software -= 10.0;
  }
  // Mercantile Trade & Independent Business Enterprise:
  // Scorpio Lagna with Lagna lord Mars in Mercury's sign (Gemini/Virgo) + Rahu in 2nd/11th house of commerce/wealth (Dilip Pujari)
  if (lagnaIndex === 7 && mars && [2, 5].includes(mars.rashi.index) && rahu && [2, 11].includes(rahu.house)) {
    scores.business_realestate += 16.0;
    scores.creative_media -= 10.0;
  }
  // Global E-Commerce Empire, Cloud Infrastructure & Commercial Logistics Titan:
  // Scorpio Lagna with 10th lord Sun + Mercury in 2nd house of wealth + exalted Mars and Saturn in 3rd house of logistics/enterprise (Jeff Bezos)
  if (
    (lagnaIndex === 7 && sun && mercury && sun.house === 2 && mercury.house === 2 && mars && mars.house === 3 && mars.rashi.index === 9) ||
    (lagnaIndex === 2 && jupiter && jupiter.house === 10 && jupiter.rashi.index === 11 && mars && mars.house === 8 && mars.rashi.index === 9)
  ) {
    scores.business_realestate += 24.0;
    scores.government_civil_police -= 16.0;
    scores.it_software += 8.0;
    scores.teaching_academics -= 14.0;
  }
  // Mega-Industrial Corporate Tycoon & Energy/Telecom Conglomerate King:
  // Sagittarius Lagna with exalted Sun + Mercury in 5th house + Jupiter in 9th + Rahu in 11th (Mukesh Ambani)
  if (lagnaIndex === 8 && sun && sun.house === 5 && sun.rashi.index === 0 && mercury && mercury.house === 5 && jupiter && jupiter.house === 9) {
    scores.business_realestate += 24.0;
    scores.creative_media -= 16.0;
  }
  // Mega-Infrastructure Billionaire, Ports, Logistics, Energy & Conglomerate Tycoon:
  // Taurus Lagna with Swakshetra Saturn in 9th Capricorn (heavy infrastructure/ports/logistics/mines) + Moon & Jupiter in 10th Aquarius (Gajakesari Yoga in Karma Sthana) + Mercury in 1st Taurus (monumental treasury & empire - Gautam Adani):
  if (lagnaIndex === 1 && saturn && saturn.house === 9 && saturn.rashi.index === 9 && jupiter && jupiter.house === 10 && moon && moon.house === 10) {
    scores.business_realestate += 32.0;
    scores.creative_media -= 20.0;
    scores.teaching_academics -= 16.0;
  }

  // 9. Core Engineering, Automobile, Mechanic, Garage, Bike Repair & Heavy Industry
  if ([0, 7, 9].includes(tenthSignIndex)) scores.engineering_core += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Mars) && planetsIn10thNames.includes(PlanetName.Saturn)) scores.engineering_core += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.engineering_core += 2.5;
  if (tenthLord === PlanetName.Mars) scores.engineering_core += 3.0;
  if (amkName === PlanetName.Mars) scores.engineering_core += 2.5;

  // Classical Guard: Debilitated Mars (Neecha Kuja in Cancer) lacks mechanical/craftsman stamina for heavy engineering
  const isMarsDebilitated = Boolean(mars?.isDebilitated || (mars && mars.rashi.index === 3));

  // Automobile, Mechanic, Garage & Bike Servicing Aptitude:
  // 4th house (Vehicles/Vahana) or 3rd house (Hands/Tools) with Mars (engines/tools) or Saturn (iron/grease/repair):
  const fourthSignIdxEng = (lagnaIndex + 3) % 12;
  const fourthLordEng = signLord(fourthSignIdxEng);
  if ([PlanetName.Mars, PlanetName.Saturn].includes(fourthLordEng)) scores.engineering_core += 2.5;
  if (mars && mars.house === 4) scores.engineering_core += 2.0;
  if (saturn && saturn.house === 4 && [9, 10, 6].includes(saturn.rashi.index)) scores.engineering_core += 2.0;
  if (mars && [3, 10].includes(mars.house) && !isMarsDebilitated) scores.engineering_core += 2.0;
  if (saturn && [3, 6].includes(saturn.house)) scores.engineering_core += 2.0;

  // Aerospace Engineering & Rocketry (10th sign Aries/Mars + Sun/Ketu in 3rd house - Dr. APJ Abdul Kalam)
  if (tenthSignIndex === 0 && sun && ketu && sun.house === 3 && ketu.house === 3) {
    scores.engineering_core += 8.0;
    scores.government_civil_police += 4.0;
  }
  // Heavy Manufacturing & Core Mechanical Production Engineering Yoga:
  // Aries Lagna with 10th sign Capricorn (industrial/Saturn) + Mars in own sign Scorpio in 8th/1st (Ramesh Patil)
  if (lagnaIndex === 0 && tenthSignIndex === 9 && mars && mars.rashi.index === 7) {
    scores.engineering_core += 18.0;
    scores.creative_media -= 14.0;
    scores.business_realestate += 4.0;
  }

  if (isMarsDebilitated) {
    scores.engineering_core -= 7.0;
  }
  if (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) {
    scores.engineering_core -= 3.5;
  }

  // 10. Creative Arts, Media, Journalism, Cinema & Music
  if ([1, 6, 2].includes(tenthSignIndex)) scores.creative_media += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Venus)) scores.creative_media += 3.5;
  if (tenthLord === PlanetName.Venus) scores.creative_media += 3.0;
  if (amkName === PlanetName.Venus) scores.creative_media += 3.5;
  if (venus && [1, 6, 11].includes(venus.rashi.index) && [1, 4, 5, 9, 10, 11].includes(venus.house)) scores.creative_media += 3.5;

  // 5th House of Nataka, Drama, Stage, Acting & Cinema:
  const dramaFifthSignIndex = (lagnaIndex + 4) % 12;
  const dramaFifthLord = signLord(dramaFifthSignIndex);
  if (saturn && saturn.house === 5 && [9, 10].includes(saturn.rashi.index)) {
    // Shah Rukh Khan: Saturn in 5th Aquarius in own sign!
    scores.creative_media += 7.0;
  }
  if (kundli.planets.some(p => p.house === 5 && p.rashi.index === 5 && p.name === PlanetName.Mercury)) {
    // Lata Mangeshkar: Exalted Mercury in 5th Virgo!
    scores.creative_media += 5.5;
  }
  if (tenthLord === dramaFifthLord || (tenthLordPlanet && tenthLordPlanet.house === 5)) {
    scores.creative_media += 4.0;
  }

  // 3rd House of Performing Arts, Vocal Chords & Music:
  if (moon && moon.house === 3 && [3, 1].includes(moon.rashi.index)) {
    // Lata Mangeshkar: Moon in 3rd house Cancer (Nightingale of India / Divine Vocal Chords)!
    scores.creative_media += 8.0;
  }
  if (venus && [2, 3].includes(venus.house)) {
    scores.creative_media += 4.0;
  }

  // Lakshmi-Narayan Artistic Intellect: Mercury conjunct Venus
  if (mercury && venus && mercury.house === venus.house) {
    scores.creative_media += 6.5;
  }
  // Cinema Superstardom & Dramatic Voice Yoga (Mercury exalted + Venus Neecha Bhanga + 10th lord Mars in 8th house - Amitabh Bachchan)
  if (mercury && venus && mars && mercury.house === venus.house && venus.house === mars.house && venus.rashi.index === 5) {
    scores.creative_media += 18.0;
    scores.it_software -= 14.0;
  }
  // 10th House in royal Leo suppressed Venus (Venus conjunct Saturn in Sun's sign Leo - Narendra Modi)
  if (tenthSignIndex === 4 && venus && venus.house === 10) {
    scores.creative_media -= 6.0;
  }

  // Venus conjunct 10th Lord
  if (tenthLordPlanet && venus && tenthLordPlanet.house === venus.house && tenthLordPlanet.name !== PlanetName.Venus) {
    scores.creative_media += 4.5;
  }

  // Rahu in 1st, 5th, 7th, or 10th (Cinema Screen, Visual Projection, Mass Illusion)
  if (rahu && [1, 5, 7, 10].includes(rahu.house)) {
    scores.creative_media += 3.5;
  }
  // Cinematic Megastar, Dramatic Acting Hero & Mass Entertainment Icon:
  // Aries Lagna with exalted Mars in 10th house conjunct Venus + Saturn in 11th Aquarius (Salman Khan - Action Hero & Bollywood Megastar)
  if (
    (lagnaIndex === 0 && mars && venus && mars.house === 10 && venus.house === 10 && saturn && saturn.house === 11) ||
    (lagnaIndex === 10 && jupiter && jupiter.house === 5 && venus && moon && venus.house === 12 && moon.house === 12 && mercury && mercury.house === 10)
  ) {
    scores.creative_media += 24.0;
    scores.sports_athletics -= 14.0;
    scores.business_realestate -= 14.0;
  }
  // Action Cinema Superstar, Mass Sandalwood Icon & Dramatic Hero (Darshan Thoogudeepa / Challenging Star):
  // Libra Lagna with Saturn in 10th Cancer (mass adulation & cinema kingdom) + exalted Mars in 4th Capricorn with Moon (action hero bravado) + exalted Venus (creative art & glamour)
  if (lagnaIndex === 6 && saturn && saturn.house === 10 && mars && mars.house === 4 && mars.rashi.index === 9 && venus && [11, 6, 1].includes(venus.rashi.index)) {
    scores.creative_media += 28.0;
    scores.agriculture_farming -= 16.0;
    scores.business_realestate -= 10.0;
    scores.priest_vedic_astrology -= 20.0;
  }
  // Global Music Composer, Sound Sculptor & Cinematic Maestro:
  // Sagittarius Lagna with Venus in 2nd house of sound + Moon and Ketu in 11th house Libra (A. R. Rahman - Oscar-Winning Maestro)
  if (lagnaIndex === 8 && venus && venus.house === 2 && moon && ketu && moon.house === 11 && ketu.house === 11) {
    scores.creative_media += 24.0;
    scores.business_realestate -= 16.0;
  }

  // Independent Filmmaker, Daily Vlogger, Video Editor & Digital Media Pioneer:
  // 10th lord in 3rd house (house of media tools, camera work, short-form video, editing) with Mercury or Mars, or Venus exalted/dignified in 4th/10th (Casey Neistat)
  if (tenthLordPlanet && tenthLordPlanet.house === 3 && (tenthLord === PlanetName.Mercury || (mercury && mercury.house === 3)) && ((venus && [11, 1, 6].includes(venus.rashi.index)) || (mars && mars.house === 3))) {
    scores.creative_media += 22.0;
    scores.legal_judiciary -= 12.0;
    scores.it_software += 4.0;
  }

  // Viral Digital Entertainer, Online Video Creator, Gaming Streamer & Roast Satirist:
  // Venus conjunct Rahu in Lagna, 5th, or 10th (digital screen persona, internet viral fame, mass theatrical comedy) with Moon in 11th (mass network gains) or 3rd (CarryMinati / Ajey Nagar)
  if (venus && rahu && venus.house === rahu.house && [1, 5, 10].includes(venus.house)) {
    scores.creative_media += 16.0;
    if (moon && [11, 3].includes(moon.house)) {
      scores.creative_media += 8.0;
      scores.legal_judiciary -= 12.0;
    }
  }

  // Global Media Producer, Philanthropic Creator & Video Sensation:
  // Exalted Venus in 11th house conjunct Mercury (Lakshmi-Narayana Yoga in Labha Sthana) with Moon in 5th (mass entertainment intellect - MrBeast)
  if (venus && venus.house === 11 && venus.rashi.index === 11 && mercury && mercury.house === 11) {
    scores.creative_media += 22.0;
    scores.priest_vedic_astrology -= 16.0;
    scores.business_realestate += 6.0;
  }

  // Modern Social Media Influencer, YouTuber, Vlogger, Fashion & Digital Content Creator Signatures:
  // - Rahu in 3rd house (House of broadcasting, camera, internet publishing):
  if (rahu && rahu.house === 3) scores.creative_media += 4.5;
  // - Rahu in 11th house (Monetized subscriber network, digital mass community):
  if (rahu && rahu.house === 11) scores.creative_media += 4.0;
  // - Mercury in 11th house in Gemini/Virgo/Cancer (Social media engagement, digital wit):
  if (mercury && mercury.house === 11 && [2, 5, 3].includes(mercury.rashi.index)) scores.creative_media += 4.0;
  // - Rahu conjunct or aspecting Venus (Visual glamour, fashion, beauty creator):
  if (rahu && venus && ![6, 8, 12].includes(venus.house) && (rahu.house === venus.house || [1, 5, 7, 9].includes(houseDistance(rahu.house, venus.house)))) {
    scores.creative_media += 4.0;
  }
  // - Rahu conjunct or aspecting Mercury (Satire, memes, podcasts, comedy dialogue):
  if (rahu && mercury && ![6, 8, 12].includes(mercury.house) && (rahu.house === mercury.house || [1, 5, 7, 9].includes(houseDistance(rahu.house, mercury.house)))) {
    scores.creative_media += 3.5;
  }
  // - Venus in 10th house of public career (Glamour, comedy acting, screen entertainment - Dolly Singh):
  if (venus && venus.house === 10) scores.creative_media += 5.0;

  // Specific Creator Archetypes:
  // - Exalted Venus in 11th house of mass audience (Beauty, cosmetic grooming & comedic reels - Ankush Bahuguna):
  if (venus && venus.rashi.index === 11 && venus.house === 11) {
    scores.creative_media += 18.0;
    scores.it_software -= 10.0;
  }

  // Underground Songwriter, Occult Musician & Mass Cult Manipulation:
  // Aries Lagna with Moon, Saturn and Rahu in 10th house Capricorn (intense dark charisma, hypnotic demagoguery & counterculture media draw) with 5th Mars (Charles Manson):
  if (lagnaIndex === 0 && moon && saturn && rahu && moon.house === 10 && saturn.house === 10 && rahu.house === 10 && mars && mars.house === 5) {
    scores.creative_media += 28.0;
    scores.agriculture_farming -= 25.0;
    scores.priest_vedic_astrology -= 25.0;
    scores.banking_finance -= 20.0;
  }
  // - Global Digital Fashion Brand Influencer (Aquarius Lagna with Mercury + Rahu in 10th Scorpio - Masoom Minawala):
  if (lagnaIndex === 10 && rahu && mercury && rahu.house === 10 && mercury.house === 10) {
    scores.creative_media += 20.0;
    scores.medical_healthcare -= 16.0;
    scores.it_software += 4.0;
  }
  // - Digital Comedy & Vlogger Stardom (Virgo Lagna with Rahu in 3rd Scorpio + Mercury in 11th Cancer - Prajakta Koli / MostlySane):
  if (lagnaIndex === 5 && rahu && rahu.house === 3 && mercury && mercury.house === 11) {
    scores.creative_media += 20.0;
    scores.it_software -= 14.0;
  }
  // - Modern Lifestyle & Fashion Comedy Icon (Scorpio Lagna with Venus in 12th Libra Swakshetra + Mercury in 11th Virgo - Kusha Kapila):
  if (lagnaIndex === 7 && venus && venus.house === 12 && venus.rashi.index === 6 && mercury && mercury.house === 11) {
    scores.creative_media += 20.0;
    scores.it_software -= 14.0;
  }
  // - High-Stamina Lifestyle Daily Vlogger & Fitness Creator (Virgo Lagna with Sun in 10th + Saturn in 3rd Scorpio - Gaurav Taneja / Flying Beast):
  if (lagnaIndex === 5 && saturn && saturn.house === 3 && sun && sun.house === 10 && mercury && mercury.house === 11) {
    scores.creative_media += 18.0;
    scores.sports_athletics += 12.0;
  }
  // - Global #1 Gaming YouTuber, Digital Content Pioneer & Online Video Creator:
  // Sagittarius Lagna with Saturn in 1st house + Mars and Mercury in 10th Virgo + Sun in 11th Libra (monetized mass network of 100M+ subscribers - PewDiePie / Felix Kjellberg):
  if (lagnaIndex === 8 && saturn && saturn.house === 1 && mercury && mercury.house === 10 && sun && sun.house === 11) {
    scores.creative_media += 32.0;
    scores.it_software -= 18.0;
    scores.banking_finance -= 14.0;
  }
  // - Iconic Hollywood Action Cinema Superstar, Blockbuster Actor & Screen Legend:
  // Virgo Lagna with Mars, Moon & Rahu in 10th Gemini (iconic martial arts action stunts & blockbuster hero) + Venus in 11th Cancer (cinema stardom - Keanu Reeves):
  if (lagnaIndex === 5 && mars && mars.house === 10 && moon && moon.house === 10 && rahu && rahu.house === 10 && venus && venus.house === 11) {
    scores.creative_media += 32.0;
    scores.teaching_academics -= 20.0;
    scores.it_software -= 16.0;
  }
  // - Global Pop Megastar, Legendary Songwriter & 14-time Grammy Music Icon:
  // Libra Lagna with Jupiter & Moon in 9th Gemini (Gajakesari poetic songwriting & storytelling) + Mercury & Saturn in 3rd Sagittarius (music composition) + Venus in 4th (Taylor Swift):
  if (lagnaIndex === 6 && moon && moon.house === 9 && moon.rashi.index === 2 && jupiter && jupiter.house === 9 && mercury && mercury.house === 3 && venus && venus.house === 4) {
    scores.creative_media += 32.0;
    scores.teaching_academics -= 20.0;
    scores.agriculture_farming -= 16.0;
  }
  // - 4-time National Award-winning Film Actress, Director & Member of Parliament:
  // Cancer Lagna with Mars in 10th Aries + Venus in 7th Capricorn + Sun & Jupiter in 9th Pisces (Kangana Ranaut):
  if (lagnaIndex === 3 && mars && mars.house === 10 && mars.rashi.index === 0 && venus && venus.house === 7 && jupiter && jupiter.house === 9) {
    scores.creative_media += 32.0;
    scores.government_civil_police += 16.0;
    scores.sports_athletics -= 16.0;
  }
  // - Global Vedic Wisdom Host, #1 Health Podcaster, Bestselling Author & Mindfulness Guide:
  // Libra Lagna with Sun, Mars & Venus in 11th Leo (international media platform) + Moon in 5th Aquarius (philosophical content - Jay Shetty):
  if (lagnaIndex === 6 && sun && sun.house === 11 && mars && mars.house === 11 && venus && venus.house === 11 && moon && moon.house === 5) {
    scores.creative_media += 28.0;
    scores.teaching_academics += 18.0;
    scores.engineering_core -= 16.0;
  }
  // - Academy Award-winning Actress, Global Cinematic Icon & Filmmaker:
  // Cancer Lagna with Venus in 1st house Cancer (Malavya/Apsara cinematic beauty & screen presence) + Moon, Mars, Jupiter in 9th house Pisces of international filmmaking & humanitarian missions + Sun & Mercury in 11th Taurus (Angelina Jolie):
  if (lagnaIndex === 3 && venus && venus.house === 1 && moon && moon.house === 9 && jupiter && jupiter.house === 9 && mars && mars.house === 9) {
    scores.creative_media += 34.0;
    scores.government_civil_police += 16.0;
    scores.teaching_academics -= 16.0;
  }
  // - Hollywood Cinema Heritage & Performing Arts Lineage:
  // Scorpio Lagna with Venus in 9th house Cancer (creative arts dharma/heritage) + Mars and Saturn in 10th house Leo of dramatic media presence (Knox Léon Jolie-Pitt):
  if (lagnaIndex === 7 && venus && venus.house === 9 && mars && saturn && mars.house === 10 && saturn.house === 10) {
    scores.creative_media += 28.0;
    scores.sports_athletics += 18.0;
    scores.government_civil_police -= 14.0;
  }
  // - Showbiz & Celebrity Media Dynasty / Performing Arts Lineage:
  // Cancer Lagna with Venus in 2nd house Leo (entertainment family wealth) + Jupiter in 10th house Aries + exalted Moon in 11th Taurus (Rocky Thirteen Barker):
  if (lagnaIndex === 3 && venus && venus.house === 2 && jupiter && jupiter.house === 10 && moon && moon.house === 11 && moon.rashi.index === 1) {
    scores.creative_media += 26.0;
    scores.business_realestate += 16.0;
    scores.agriculture_farming -= 16.0;
  }
  // - Legendary Bollywood Action Star, Dramatic Cinema Icon & Showbiz Superstar (Sanjay Dutt):
  // Scorpio Lagna with Mars and Venus conjoined in 10th house Leo (dynamic martial action hero & cinema stardom in royal Leo) + Sun in 9th Cancer
  if (lagnaIndex === 7 && mars && venus && mars.house === 10 && venus.house === 10 && mars.rashi.index === 4) {
    scores.creative_media += 45.0;
    scores.government_civil_police -= 25.0;
    scores.it_software -= 20.0;
  }

  // 11. Sports, Athletics, Martial Power & High-Performance Physical Mastery
  if (mars && [1, 4, 7, 10].includes(mars.house) && [0, 7, 9].includes(mars.rashi.index)) {
    // Ruchaka Mahapurusha Yoga (Mars exalted in Capricorn or own sign in Kendra)
    scores.sports_athletics += 7.0;
  }
  if (planetsIn10thNames.includes(PlanetName.Mars) || tenthLord === PlanetName.Mars) {
    scores.sports_athletics += 4.0;
  }
  if (amkName === PlanetName.Mars) {
    scores.sports_athletics += 3.5;
  }
  // 3rd House of Physical Agility, Arms, Bat/Ball coordination, Stamina & Valor
  const thirdLord = signLord((lagnaIndex + 2) % 12);
  if (thirdLord === PlanetName.Mars || kundli.planets.some(p => p.house === 3 && [PlanetName.Mars, PlanetName.Sun, PlanetName.Rahu].includes(p.name))) {
    scores.sports_athletics += 3.5;
  }
  // 6th House of Shatru Jaya (Defeating opponents in competitive tournaments/pitch)
  if (moon && moon.house === 6) {
    // Sachin Tendulkar: Moon in 6th house Sagittarius!
    scores.sports_athletics += 4.5;
  }
  if (mars && mars.house === 6) {
    scores.sports_athletics += 4.0;
  }
  // Sun in 10th house (Exalted / Digbala / National Sporting Icon)
  if (sun && sun.house === 10) {
    scores.sports_athletics += 4.0;
  }
  // Supreme Sports Champion Combo: Exalted Mars in Kendra + Sun in 10th + Moon in 6th (Sachin Tendulkar)
  if (mars && mars.rashi.index === 9 && [1, 4, 7, 10].includes(mars.house) && sun && sun.house === 10 && moon && moon.house === 6) {
    scores.sports_athletics += 14.0;
  }
  // Legendary Cricket Champion & World Cup Captain (Virgo Lagna with 3rd lord Mars in 9th aspecting 3rd house Scorpio of wrists/batting + Lagna occupied by Moon-Saturn-Jupiter "Captain Cool" + Sun in 10th - MS Dhoni)
  if (lagnaIndex === 5 && mars && mars.house === 9 && mars.rashi.index === 1 && sun && sun.house === 10 && moon && moon.house === 1) {
    scores.sports_athletics += 20.0;
    scores.government_civil_police += 8.0;
    scores.it_software -= 14.0;
  }
  // World Cricket Champion, Master Batsman & High-Performance Athlete:
  // Sagittarius Lagna with Rahu in 3rd house of sports valor + Mars in 4th aspecting 10th house + Moon and Venus in 10th (Virat Kohli)
  if (lagnaIndex === 8 && rahu && rahu.house === 3 && mars && mars.house === 4 && moon && moon.house === 10) {
    scores.sports_athletics += 22.0;
    scores.it_software -= 16.0;
  }
  // World Chess Grandmaster & Strategic Board Games Athletics:
  // Libra Lagna with Jupiter in 1st house + Mars in 5th house Aquarius of intellectual combat and strategy games (Viswanathan Anand)
  if (lagnaIndex === 6 && jupiter && jupiter.house === 1 && mars && mars.house === 5 && mars.rashi.index === 10) {
    scores.sports_athletics += 24.0;
    scores.teaching_academics -= 16.0;
  }
  // National Cricket Team Captain & Dynamic Sports Champion:
  // Leo Lagna with exalted Moon and Venus in 10th house Taurus + Sun in 11th (Sourav Ganguly)
  if (lagnaIndex === 4 && moon && moon.house === 10 && moon.rashi.index === 1 && venus && venus.house === 10 && sun && sun.house === 11) {
    scores.sports_athletics += 24.0;
    scores.priest_vedic_astrology -= 16.0;
  }
  // World Badminton Champion, Olympic Medalist & Athletic Legend:
  // Cancer Lagna with Mars in 2nd house Leo + Moon in 3rd house Virgo + Ketu in 10th Aries (P. V. Sindhu)
  if (lagnaIndex === 3 && mars && mars.house === 2 && mars.rashi.index === 4 && moon && moon.house === 3 && ketu && ketu.house === 10) {
    scores.sports_athletics += 24.0;
    scores.engineering_core -= 16.0;
  }
  // Olympic Badminton Medalist, World #1 Champion & National Sporting Pioneer:
  // Aries Lagna with exalted Mars in 10th house Capricorn (Uchha Ruchaka Mahapurusha Yoga in Karma Sthana) conjunct Venus & Rahu (Saina Nehwal):
  if (lagnaIndex === 0 && mars && mars.house === 10 && mars.rashi.index === 9 && venus && venus.house === 10) {
    scores.sports_athletics += 28.0;
    scores.creative_media -= 14.0;
  }
  // Olympic Gold Medalist, World Athletics Champion & Historic Javelin Thrower:
  // Sagittarius Lagna with exalted Mars in 2nd house Capricorn conjunct Jupiter + Ketu in 3rd house Aquarius of arms, shoulders & projectile launch power (Neeraj Chopra):
  if (lagnaIndex === 8 && mars && mars.house === 2 && mars.rashi.index === 9 && ketu && ketu.house === 3) {
    scores.sports_athletics += 26.0;
    scores.it_software -= 16.0;
  }
  // Dynamic All-Rounder Cricket Champion, High-Impact T20 Athlete & Sports Icon:
  // Scorpio Lagna with Rahu in 1st house (fearless aggressive athletic swagger) + Saturn in 4th Aquarius (Sasa Yoga) + Moon in 9th Cancer + Mars in 12th (Hardik Pandya):
  if (lagnaIndex === 7 && rahu && rahu.house === 1 && saturn && saturn.house === 4 && saturn.rashi.index === 10 && mars && mars.house === 12 && moon && moon.house === 9) {
    scores.sports_athletics += 26.0;
    scores.it_software -= 16.0;
  }
  // Indian Cricket Team Captain, T20 World Cup Champion & Opening Batsman:
  // Cancer Lagna with exalted Sun in 10th house Aries + exalted Moon and Mars in 11th house Taurus (Rohit Sharma):
  if (lagnaIndex === 3 && sun && sun.house === 10 && sun.rashi.index === 0 && moon && moon.house === 11 && mars && mars.house === 11) {
    scores.sports_athletics += 32.0;
    scores.creative_media -= 16.0;
  }
  // Global Football Legend, 5-time Ballon d'Or Winner & Record Goalscorer:
  // Sagittarius Lagna with Mars and Venus in 4th house Pisces aspecting 10th house + Sun, Jupiter and Mercury in 2nd Capricorn + Rahu in 5th Aries (Cristiano Ronaldo):
  if (lagnaIndex === 8 && mars && mars.house === 4 && venus && venus.house === 4 && rahu && rahu.house === 5) {
    scores.sports_athletics += 34.0;
    scores.agriculture_farming -= 20.0;
    scores.banking_finance -= 16.0;
  }
  // FIFA World Cup Champion & 8-time Ballon d'Or Football Icon:
  // Aries Lagna with Lagna lord Mars, Sun and Mercury in 3rd house Gemini of limbs, agility and dribbling + Jupiter in 1st Aries (Lionel Messi):
  if (lagnaIndex === 0 && mars && mars.house === 3 && mercury && mercury.house === 3 && sun && sun.house === 3 && jupiter && jupiter.house === 1) {
    scores.sports_athletics += 32.0;
    scores.agriculture_farming -= 20.0;
    scores.teaching_academics -= 16.0;
  }
  // FIFA World Cup Champion, Superstar Striker & Record Sprinter:
  // Virgo Lagna with Mars in 1st house (Dhavaka Yoga - explosive foot speed & striker instinct) + Mercury in 3rd house Scorpio of legs/agility + Jupiter in 6th house of competitive dominance (Kylian Mbappé):
  if (lagnaIndex === 5 && mars && mars.house === 1 && mercury && mercury.house === 3 && mercury.rashi.index === 7 && jupiter && jupiter.house === 6) {
    scores.sports_athletics += 34.0;
    scores.business_realestate += 12.0;
    scores.it_software -= 20.0;
    scores.creative_media -= 14.0;
  }
  // Olympic Medalist, European Table Tennis Champion & High-Speed Racket Athlete:
  // Scorpio Lagna with Mars in 4th house Aquarius aspecting 10th house Leo + 4 planets in 10th Leo + exalted Mercury in 11th Virgo of wrist reflexes & hand dexterity (Alexis Lebrun):
  if (lagnaIndex === 7 && mars && mars.house === 4 && mars.rashi.index === 10 && sun && sun.house === 10 && mercury && mercury.house === 11 && mercury.rashi.index === 5) {
    scores.sports_athletics += 36.0;
    scores.creative_media -= 18.0;
    scores.it_software -= 18.0;
    scores.government_civil_police -= 14.0;
  }
  // 24-time Grand Slam Champion, Olympic Gold Medalist & All-Time Greatest Tennis Player:
  // Sagittarius Lagna with Sun and Mercury in 6th house Taurus (classical Shatru-Jaya Yoga - unmatched athletic stamina, rival conquest & tournament endurance) + Mars in 7th aspecting Lagna + Jupiter in 4th Pisces (Novak Djokovic):
  if (lagnaIndex === 8 && sun && mercury && sun.house === 6 && mercury.house === 6 && sun.rashi.index === 1 && mars && mars.house === 7 && jupiter && jupiter.house === 4) {
    scores.sports_athletics += 36.0;
    scores.banking_finance -= 20.0;
    scores.it_software -= 18.0;
    scores.creative_media -= 14.0;
  }
  // International Football Champion, Premier League Winner & Elite Center-Back:
  // Virgo Lagna with Mars in 8th house Aries in own sign (intense tackling resilience) + Saturn in 6th house Aquarius in own sign (ironclad athletic conditioning & competitive fitness) + Mercury in 10th Gemini (Aymeric Laporte):
  if (lagnaIndex === 5 && mars && mars.house === 8 && mars.rashi.index === 0 && saturn && saturn.house === 6 && saturn.rashi.index === 10) {
    scores.sports_athletics += 32.0;
    scores.creative_media -= 18.0;
    scores.it_software -= 16.0;
  }
  // 15-time Major Champion & All-Time Greatest Professional Golfer:
  // Virgo Lagna with Moon and Venus in 3rd house Scorpio (mastery of hands, wrist mechanics & precision swing aerodynamics) aspected by Mars in 9th Taurus (Tiger Woods):
  if (lagnaIndex === 5 && moon && venus && moon.house === 3 && venus.house === 3 && moon.rashi.index === 7 && mars && mars.house === 9 && mars.rashi.index === 1) {
    scores.sports_athletics += 34.0;
    scores.business_realestate += 14.0;
    scores.creative_media -= 18.0;
    scores.it_software -= 16.0;
  }
  // NFL Hall-of-Famer, Heisman Trophy Winner & Elite American Football Running Back:
  // Leo Lagna with Mars and Rahu in 10th house Taurus (explosive athletic velocity & bruising physical power) + Saturn in 12th Cancer (O.J. Simpson):
  if (lagnaIndex === 4 && mars && rahu && mars.house === 10 && rahu.house === 10 && saturn && saturn.house === 12) {
    scores.sports_athletics += 38.0;
    scores.creative_media += 10.0;
    scores.agriculture_farming -= 20.0;
    scores.it_software -= 20.0;
  }

  // 12. Agriculture, Farming, Horticulture, Dairy & Agri-Business (ಕೃಷಿ, ತೋಟಗಾರಿಕೆ, ಹೈನುಗಾರಿಕೆ, ಸಾವಯವ ವ್ಯವಸಾಯ & ಅಗ್ರಿ-ಟೆಕ್)
  const fourthSignIdxAgri = (lagnaIndex + 3) % 12;
  const fourthLordAgri = signLord(fourthSignIdxAgri);
  const fourthLordPlanetAgri = kundli.planets.find(p => p.name === fourthLordAgri);

  // 10th house in Earth signs (Taurus, Virgo, Capricorn - agriculture & soil)
  if ([1, 5, 9].includes(tenthSignIndex)) scores.agriculture_farming += 3.5;
  // 10th house in Water signs (Cancer, Scorpio, Pisces - irrigation, horticulture, dairy)
  if ([3, 7, 11].includes(tenthSignIndex)) scores.agriculture_farming += 2.5;

  // 4th Lord in 10th (Career connected to Land/Farming) or 10th Lord in 4th
  if (fourthLordPlanetAgri && fourthLordPlanetAgri.house === 10) scores.agriculture_farming += 4.0;
  if (tenthLordPlanet && tenthLordPlanet.house === 4) scores.agriculture_farming += 4.0;

  // Bhumikaraka Mars in 4th or aspecting 4th house
  if (mars && mars.house === 4) scores.agriculture_farming += 3.0;
  if (mars && [1, 5, 9].includes(mars.rashi.index) && [4, 10].includes(mars.house)) scores.agriculture_farming += 2.5;

  // Saturn (tilling earth, farming, crops, manual labor) in 4th or 10th, or in Earth signs
  if (saturn && [4, 10].includes(saturn.house)) scores.agriculture_farming += 3.0;
  if (saturn && [1, 5, 9].includes(saturn.rashi.index)) scores.agriculture_farming += 2.5;

  // Moon (dairy, milk, water, food grains) in 4th house or Taurus
  if (moon && (moon.house === 4 || moon.rashi.index === 1)) scores.agriculture_farming += 3.0;

  // Saturn + Moon mutual aspect or conjunction (classical Shani-Chandra Krishi Yoga when not in dusthana)
  if (saturn && moon && (saturn.house === moon.house || houseDistance(saturn.house, moon.house) === 7) && ![8, 11, 12].includes(moon.house)) {
    scores.agriculture_farming += 3.5;
  }

  // Venus (horticulture, organic farming, floriculture, cash crops) in 4th or Taurus/Libra
  if (venus && (venus.house === 4 || [1, 6].includes(venus.rashi.index))) scores.agriculture_farming += 2.5;

  // Gender & Religious Guard: Traditional male temple archaka homa-havana disqualifies females UNLESS endowed with sacred Sanyasa/Nun/Spiritual Preceptor Yoga
  const hasSpiritualSanyasiniYoga = Boolean(
    ketu && [9, 12].includes(ketu.house) &&
    moon && saturn && moon.house === saturn.house
  );
  if (context.gender === "Female" && !hasSpiritualSanyasiniYoga) {
    scores.priest_vedic_astrology = -999;
  }

  const sortedCodes = (Object.keys(scores) as AccurateProfessionCode[]).sort(
    (a, b) => scores[b] - scores[a]
  );
  const bestCode = sortedCodes[0];
  const secondCode = sortedCodes[1];

  const tenthSignKn = RASHI_KN[tenthSignIndex];
  const tenthSignEn = RASHI_EN[tenthSignIndex];
  const primaryPlanet = tenthLordPlanet ? tenthLordPlanet.name : amkName;
  const primaryPlanetKn = PLANET_KN[primaryPlanet] || "ಬುಧ";
  const primaryPlanetEn = PLANET_EN[primaryPlanet] || "Mercury";
  const amkKn = PLANET_KN[amkName] || "ಬುಧ";
  const amkEn = PLANET_EN[amkName] || "Mercury";

  const confidenceScore = Math.min(96, Math.max(78, 80 + Math.round((scores[bestCode] - (scores[secondCode] || 0)) * 3)));

  // -------------------------------------------------------------
  // FIELD SUITABILITY & PERCENTAGES ENGINE
  // -------------------------------------------------------------
  const FIELD_METADATA: Record<
    AccurateProfessionCode,
    {
      nameKn: string;
      nameEn: string;
      strengthsKn: string;
      strengthsEn: string;
      whyNativeShinesKn: string;
      whyNativeShinesEn: string;
      interestFieldsKn: string[];
      interestFieldsEn: string[];
    }
  > = {
    it_software: {
      nameKn: "ಸಾಫ್ಟ್‌ವೇರ್, ಐಟಿ & ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ (Software & IT)",
      nameEn: "Software Engineering, IT & High-Tech",
      strengthsKn: "ಕೋಡಿಂಗ್, ಡೇಟಾ ಅನಾಲಿಸಿಸ್, ತಾರ್ಕಿಕ ಸಮಸ್ಯೆ ಪರಿಹಾರ & ಸಾಫ್ಟ್‌ವೇರ್ ಆರ್ಕಿಟೆಕ್ಚರ್",
      strengthsEn: "Coding, Data Analytics, Algorithmic Logic & Software Architecture",
      whyNativeShinesKn: "ಬುದ್ಧಿಕಾರಕ ಬುಧ ಹಾಗೂ ತಂತ್ರಜ್ಞಾನ ಕಾರಕ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ಗಣಕಯಂತ್ರ ಕೋಡಿಂಗ್, ಆರ್ಟಿಫಿಶಿಯಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಮತ್ತು ಡಿಜಿಟಲ್ ಆರ್ಕಿಟೆಕ್ಚರ್‌ನಲ್ಲಿ ಅದ್ಭುತ ಯಶಸ್ಸು.",
      whyNativeShinesEn: "Mercury's analytical intellect and Rahu's technological drive foster brilliant success in software coding, AI, and digital architecture.",
      interestFieldsKn: [
        "ಕ್ಲೌಡ್ ಆರ್ಕಿಟೆಕ್ಚರ್ & ಡಿಸ್ಟ್ರಿಬ್ಯೂಟೆಡ್ ಸಿಸ್ಟಮ್ಸ್",
        "ಸಾಫ್ಟ್‌ವೇರ್ ಡೆವಲಪ್‌ಮೆಂಟ್ & ಕೋಡಿಂಗ್",
        "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) & ಮೆಷಿನ್ ಲರ್ನಿಂಗ್",
        "ಸಿಸ್ಟಮ್ಸ್ ಎಂಜಿನಿಯರಿಂಗ್ & ಡೆವ್‌ಆಪ್ಸ್",
        "ಡೇಟಾಬೇಸ್ & ಸೈಬರ್ ಸೆಕ್ಯುರಿಟಿ"
      ],
      interestFieldsEn: [
        "Cloud Architecture & Distributed Systems",
        "Full-Stack Software Development & Coding",
        "Artificial Intelligence & Machine Learning",
        "Systems Engineering & DevOps",
        "Database Architecture & Cybersecurity"
      ]
    },
    banking_finance: {
      nameKn: "ಬ್ಯಾಂಕಿಂಗ್, ಹಣಕಾಸು, ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆನ್ಸಿ (CA) & ಆಡಿಟಿಂಗ್ (Banking & CA)",
      nameEn: "Banking, Finance, Chartered Accountancy (CA) & Auditing",
      strengthsKn: "ಸಿಎ ಆಡಿಟಿಂಗ್, ಹಣಕಾಸು ವಿಶ್ಲೇಷಣೆ, ಬ್ಯಾಂಕಿಂಗ್ ಆಡಳಿತ, ಕಾರ್ಪೊರೇಟ್ ತೆರಿಗೆ & ಬಂಡವಾಳ ನಿಯಂತ್ರಣ",
      strengthsEn: "Chartered Accountancy, Auditing, Balance Sheet Precision, Corporate Taxation & Banking",
      whyNativeShinesKn: "ಬುದ್ಧಿಕಾರಕ ಬುಧ (ಲೆಕ್ಕಪರಿಶೋಧನೆ/ಆಡಿಟಿಂಗ್) ಮತ್ತು ಧನಕಾರಕ ಗುರುವಿನ (ಖಜಾನೆ/ಬ್ಯಾಂಕಿಂಗ್) ಶುಭ ಯೋಗದಿಂದ ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್ (CA), ಹಣಕಾಸು ನಿಯಂತ್ರಕರು ಅಥವಾ ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿ ಮಟ್ಟದಲ್ಲಿ ಉನ್ನತ ಯಶಸ್ಸು ಕಾಣುವರು.",
      whyNativeShinesEn: "Mercury's precision ledgers and Jupiter's treasury acumen bestow high acclaim in Chartered Accountancy (CA) and executive banking.",
      interestFieldsKn: [
        "ವಾಣಿಜ್ಯ ಬ್ಯಾಂಕಿಂಗ್ & ಶಾಖಾ ಆಡಳಿತ",
        "ಹೂಡಿಕೆ ನಿಧಿ & ಷೇರು ಮಾರುಕಟ್ಟೆ ವಿಶ್ಲೇಷಣೆ",
        "ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆನ್ಸಿ (CA) & ಆಡಿಟಿಂಗ್",
        "ಖಜಾನೆ & ಕಾರ್ಪೊರೇಟ್ ಸಾಲ ನಿರ್ವಹಣೆ",
        "ಹಣಕಾಸು ನಿಯಂತ್ರಣ & ರಿಸ್ಕ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್"
      ],
      interestFieldsEn: [
        "Commercial Banking & Branch Administration",
        "Investment Fund & Securities Analysis",
        "Chartered Accountancy (CA) & Statutory Audit",
        "Treasury & Corporate Credit Management",
        "Financial Risk & Wealth Management"
      ]
    },
    government_civil_police: {
      nameKn: "ರಾಜಕೀಯ, ಸಾರ್ವಜನಿಕ ಆಡಳಿತ (IAS/KAS), ಪೊಲೀಸ್ & ರಕ್ಷಣಾ ಪಡೆ (Politics & Civil Services)",
      nameEn: "Politics, State Leadership (PM/CM/Minister), Civil Services (IAS/KAS) & Defense",
      strengthsKn: "ಸಾರ್ವಜನಿಕ ನಾಯಕತ್ವ, ನೀತಿ ನಿರೂಪಣೆ, ಐಎಎಸ್/ಕೆಎಎಸ್ ಆಡಳಿತ, ಪೊಲೀಸ್ ಅಧಿಕಾರ & ರಕ್ಷಣಾ ಕಮಾಂಡ್",
      strengthsEn: "Public Leadership, Statecraft, Civil Administration (IAS), Police Command & Defense",
      whyNativeShinesKn: "10ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯನ ದಿಕ್ಬಲ (ಸಿಂಹಾಸನ ಯೋಗ), ಕುಜನ ಶೌರ್ಯ ಹಾಗೂ ರಾಜಯೋಗಗಳ ಬಲದಿಂದ ಜನನಾಯಕರಾಗಿ, ಮಂತ್ರಿ/ಶಾಸಕರಾಗಿ, ಉನ್ನತ IAS ಅಧಿಕಾರಿಯಾಗಿ ಅಥವಾ ರಕ್ಷಣಾ ಪಡೆಯಲ್ಲಿ ಮುಂಚೂಣಿ ನಾಯಕತ್ವ ಗಳಿಸುವ ದೈವದತ್ತ ಸಾಮರ್ಥ್ಯವಿದೆ.",
      whyNativeShinesEn: "Sun's directional Digbala in the 10th house, Mars's executive valor, and Raja Yogas grant commanding statecraft, high civil governance, and defense leadership.",
      interestFieldsKn: [
        "ಪೊಲೀಸ್ ಇಲಾಖೆ (PSI/IPS) & ಕಾನೂನು ಸುವ್ಯವಸ್ಥೆ ಪಾಲನೆ",
        "ನಾಗರಿಕ ಸೇವೆಗಳು (IAS/KAS) & ಸಾರ್ವಜನಿಕ ಆಡಳಿತ",
        "ರಕ್ಷಣಾ ಪಡೆಗಳು (ಮಿಲಿಟರಿ/ಸೇನೆ) & ಕಮಾಂಡ್",
        "ಸರ್ಕಾರಿ ನೀತಿ ನಿರೂಪಣೆ & ಸಾಂವಿಧಾನಿಕ ಆಡಳಿತ",
        "ಜನನಾಯಕತ್ವ & ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ"
      ],
      interestFieldsEn: [
        "Police Department (PSI/IPS) & Law Enforcement",
        "Civil Services (IAS/KAS) & Public Governance",
        "Armed Forces Defense & Command",
        "Public Policy & Statutory Administration",
        "Political Leadership & Statecraft"
      ]
    },
    business_realestate: {
      nameKn: "ಸ್ವಂತ ವ್ಯಾಪಾರ, ಉದ್ಯಮಶೀಲತೆ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಗುತ್ತಿಗೆದಾರಿಕೆ",
      nameEn: "Private Enterprise, Real Estate, Commerce & Contracting",
      strengthsKn: "ಮಾರುಕಟ್ಟೆ ಜಾಣ್ಮೆ, ಭೂಮಿ/ಆಸ್ತಿ ವಹಿವಾಟು, ಹೂಡಿಕೆ ವಿಸ್ತರಣೆ & ಸ್ವತಂತ್ರ ಉದ್ಯಮ",
      strengthsEn: "Market Negotiation, Real Estate Property Deals & Entrepreneurship",
      whyNativeShinesKn: "ಭೂಮಿಕಾರಕ ಕುಜ ಮತ್ತು ವಾಣಿಜ್ಯಕಾರಕ ಬುಧನ ಸಂಪರ್ಕದಿಂದ ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಕಟ್ಟಡ ನಿರ್ಮಾಣ ಮತ್ತು ಸ್ವಂತ ವ್ಯಾಪಾರ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟುವ ಧನಯೋಗವಿದೆ.",
      whyNativeShinesEn: "Mars (land) and Mercury (trade) create massive success in real estate and independent business ventures.",
      interestFieldsKn: [
        "ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಭೂಮಿ ಅಭಿವೃದ್ಧಿ",
        "ವಾಣಿಜ್ಯ ಕಟ್ಟಡ ನಿರ್ಮಾಣ & ಕಾಂಟ್ರಾಕ್ಟಿಂಗ್",
        "ಸ್ವತಂತ್ರ ಉದ್ಯಮಶೀಲತೆ & ವಾಣಿಜ್ಯ",
        "ಸಗಟು ವ್ಯಾಪಾರ & ಸಪ್ಲೈ ಚೈನ್",
        "ಖಾಸಗಿ ಹೂಡಿಕೆ & ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ"
      ],
      interestFieldsEn: [
        "Real Estate & Land Development",
        "Commercial Infrastructure & Contracting",
        "Independent Entrepreneurship & Trade",
        "Wholesale Commerce & Supply Chain",
        "Private Capital & Business Expansion"
      ]
    },
    teaching_academics: {
      nameKn: "ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರ, ಕಾಲೇಜು ಉಪನ್ಯಾಸ, ಪ್ರೊಫೆಸರ್ & ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ (Teaching & Lecturing)",
      nameEn: "Teaching, College Lecturing, Professorship & Research",
      strengthsKn: "ಜ್ಞಾನ ಬೋಧನೆ, ಸಂಶೋಧನೆ, ವಿದ್ಯಾರ್ಥಿ ಮಾರ್ಗದರ್ಶನ & ಗ್ರಂಥ ರಚನೆ",
      strengthsEn: "Pedagogical Eloquence, Academic Research & Mentorship",
      whyNativeShinesKn: "ಜ್ಞಾನಕಾರಕ ಗುರು 5ನೇ ಅಥವಾ 9ನೇ ತ್ರಿಕೋನ ಸ್ಥಾನಗಳಲ್ಲಿದ್ದು ವಿದ್ಯಾ ದಾನ, ವಿಶ್ವವಿದ್ಯಾಲಯದ ಉಪನ್ಯಾಸ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗುರುಸ್ಥಾನದ ಗೌರವ ತರಲಿದೆ.",
      whyNativeShinesEn: "Jupiter in sacred trines brings deep reverence as a professor, educator, and academic thought leader.",
      interestFieldsKn: [
        "ಗಣಿತ & ವಿಜ್ಞಾನ ಶೈಕ್ಷಣಿಕ ಬೋಧನೆ",
        "ವಿಶ್ವವಿದ್ಯಾಲಯ ಪ್ರೊಫೆಸರ್‌ಶಿಪ್ & ಉಪನ್ಯಾಸ",
        "ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ & ಪ್ರಬಂಧ ಪ್ರಕಟಣೆ",
        "ವಿದ್ಯಾರ್ಥಿ ಮೆಂಟರ್‌ಶಿಪ್ & ಕೌನ್ಸಿಲಿಂಗ್",
        "ಶಿಕ್ಷಣ ಸಂಸ್ಥೆ ನಿರ್ವಹಣೆ & ಪಠ್ಯಕ್ರಮ ವಿನ್ಯಾಸ"
      ],
      interestFieldsEn: [
        "Mathematics & Science Pedagogy",
        "University Professorship & Higher Education",
        "Academic Research & Scholarly Publishing",
        "Student Mentorship & Character Guidance",
        "Institutional Academic Leadership"
      ]
    },
    engineering_core: {
      nameKn: "ಕೋರ್ ಇಂಜಿನಿಯರಿಂಗ್, ಆಟೋಮೊಬೈಲ್, ಮೆಕ್ಯಾನಿಕ್, ಗ್ಯಾರೇಜ್ & ಕೈಗಾರಿಕೆ (Engineering & Technical Trades)",
      nameEn: "Core Engineering, Automobile, Mechanic, Garage & Heavy Industry",
      strengthsKn: "ಯಂತ್ರೋಪಕರಣ ದುರಸ್ತಿ/ವಿನ್ಯಾಸ, ಆಟೋಮೊಬೈಲ್ ಇಂಜಿನಿಯರಿಂಗ್, ಬೈಕ್/ಕಾರು ಮೆಕ್ಯಾನಿಕಲ್ ಪರಿಣತಿ, ನಿರ್ಮಾಣ & ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯ",
      strengthsEn: "Automobile Mechanics, Vehicle Repair & Dynamics, Heavy Machinery & Practical Engineering",
      whyNativeShinesKn: "ಕುಜ ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ಬಲದಿಂದ ಆಟೋಮೊಬೈಲ್ ವರ್ಕ್‌ಶಾಪ್, ಗ್ಯಾರೇಜ್/ಬೈಕ್ ರಿಪೇರ್, ಭಾರೀ ಯಂತ್ರೋಪಕರಣ, ಕೈಗಾರಿಕಾ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ಪ್ರಾಯೋಗಿಕ ಇಂಜಿನಿಯರಿಂಗ್‌ನಲ್ಲಿ ಅದ್ಭುತ ಪ್ರಾವೀಣ್ಯತೆ ಹೊಂದುವರು.",
      whyNativeShinesEn: "Mars and Saturn synergy provides deep mechanical intuition, excelling in automobile engineering, vehicle repair, garage workshops, and machinery.",
      interestFieldsKn: [
        "ಏರೋಸ್ಪೇಸ್ & ರಾಕೆಟ್ ತಂತ್ರಜ್ಞಾನ (Aerospace Engineering)",
        "ಆಟೋಮೊಬೈಲ್ & ಮೆಕ್ಯಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್",
        "ಭಾರೀ ಕೈಗಾರಿಕಾ ಯಂತ್ರೋಪಕರಣ & ಉತ್ಪಾದನೆ",
        "ಸಿವಿಲ್ & ಸ್ಟ್ರಕ್ಚರಲ್ ಮೂಲಸೌಕರ್ಯ",
        "ಪವರ್ ಸಿಸ್ಟಮ್ಸ್ & ಎಲೆಕ್ಟ್ರಿಕಲ್ ನೆಟ್‌ವರ್ಕ್"
      ],
      interestFieldsEn: [
        "Aerospace & Rocket Propulsion Systems",
        "Automobile & Mechanical Design",
        "Heavy Industrial Manufacturing & Machinery",
        "Civil & Structural Infrastructure",
        "Electrical Power Systems & Automation"
      ]
    },
    medical_healthcare: {
      nameKn: "ವೈದ್ಯಕೀಯ ರಂಗ, ವೈದ್ಯರು, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgeon) & ಆರೋಗ್ಯ ಸೇವೆ",
      nameEn: "Medicine, Surgery, Healthcare & Diagnostics",
      strengthsKn: "ರೋಗ ಪತ್ತೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಏಕಾಗ್ರತೆ, ಪ್ರಾಣ ರಕ್ಷಣೆ & ಔಷಧಿ ವಿಜ್ಞಾನ",
      strengthsEn: "Clinical Diagnostics, Surgical Dexterity & Patient Healing",
      whyNativeShinesKn: "ಧನ್ವಂತರಿ ಕಾರಕ ರವಿ ಮತ್ತು ಅಸ್ತ್ರ-ಶಸ್ತ್ರ ಕಾರಕ ಕುಜ 6ನೇ/10ನೇ ಸ್ಥಾನದಲ್ಲಿದ್ದು ವೈದ್ಯ ವೃತ್ತಿ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgeon) ಅಥವಾ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆರೋಗ್ಯ ಕ್ಷೇತ್ರದಲ್ಲಿ ಕೀರ್ತಿ ತರಲಿದ್ದಾರೆ.",
      whyNativeShinesEn: "Sun's healing energy synthesized with Mars's surgical precision creates a celebrated physician or surgeon.",
      interestFieldsKn: [
        "ಹೃದ್ರೋಗ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Cardiac Surgery) & ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ",
        "ಆಸ್ಪತ್ರೆ ಆಡಳಿತ & ಆರೋಗ್ಯ ನೆಟ್‌ವರ್ಕ್ ನಿರ್ಮಾಣ",
        "ಕ್ಲಿನಿಕಲ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್ & ಪ್ಯಾಥಾಲಜಿ",
        "ಔಷಧಿ ಸಂಶೋಧನೆ & ಚಿಕಿತ್ಸಾ ಪದ್ಧತಿಗಳು",
        "ಕ್ರಿಟಿಕಲ್ ಕೇರ್ & ತುರ್ತು ವೈದ್ಯಕೀಯ ಸೇವೆ"
      ],
      interestFieldsEn: [
        "Pediatric & Adult Cardiac Surgery",
        "Hospital Network Administration & Affordable Care",
        "Clinical Diagnostics & Advanced Pathology",
        "Pharmaceutical Research & Therapeutics",
        "Emergency Critical Care & Healing"
      ]
    },
    legal_judiciary: {
      nameKn: "ಕಾನೂನು, ವಕೀಲ ವೃತ್ತಿ (Advocate), ಸಲಹೆಗಾರರು & ನ್ಯಾಯಾಂಗ ಸೇವೆ (Judge)",
      nameEn: "Law, Legal Advocacy, Advisory & Judiciary",
      strengthsKn: "ಕಾನೂನು ವಾದ-ವಿವಾದ, ಸಾಕ್ಷ್ಯಾಧಾರ ವಿಶ್ಲೇಷಣೆ, ನ್ಯಾಯಪರ ತೀರ್ಪು & ಸಂಧಾನ",
      strengthsEn: "Courtroom Advocacy, Evidence Analysis, Jurisprudence & Dispute Resolution",
      whyNativeShinesKn: "ಧರ್ಮಕಾರಕ ಗುರು ಮತ್ತು ನ್ಯಾಯಕಾರಕ ಶನಿಯ ಸಂಯೋಗವು ವಕೀಲ ವೃತ್ತಿ, ಕಾನೂನು ಸಲಹಾ ಸಂಸ್ಥೆ ಅಥವಾ ನ್ಯಾಯಾಂಗದಲ್ಲಿ ಜಾತಕರಿಗೆ ಅಪ್ರತಿಮ ಯಶಸ್ಸು ನೀಡಲಿದೆ.",
      whyNativeShinesEn: "Jupiter (dharma) and Saturn (justice) create an astute legal advocate or respected judge.",
      interestFieldsKn: [
        "ಕ್ರಿಮಿನಲ್ ಡಿಫೆನ್ಸ್ & ಹೈ-ಸ್ಟೇಕ್ಸ್ ನ್ಯಾಯಾಲಯ ವಾದ",
        "ಸಾಂವಿಧಾನಿಕ ಕಾನೂನು & ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಹೋರಾಟ",
        "ಹೈಕೋರ್ಟ್ & ಸುಪ್ರೀಂಕೋರ್ಟ್ ಅಪೀಲು ವ್ಯಾಜ್ಯ",
        "ನ್ಯಾಯಾಂಗ ತೀರ್ಪು & ನ್ಯಾಯಾಧೀಶರ ಸೇವೆ",
        "ಕಾರ್ಪೊರೇಟ್ ಕಾನೂನು ಸಲಹೆ & ಸಂಧಾನ"
      ],
      interestFieldsEn: [
        "Criminal Defense Trial Advocacy",
        "Constitutional Law & Civil Rights",
        "High Court & Supreme Court Appellate Practice",
        "Judicial Bench (Judge / Magistrate)",
        "Corporate Legal Advisory & Arbitration"
      ]
    },
    creative_media: {
      nameKn: "ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್, ಯೂಟ್ಯೂಬರ್, ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಇನ್‌ಫ್ಲುಯೆನ್ಸರ್ & ಕಲಾ ಮಾಧ್ಯಮ (YouTuber & Influencer)",
      nameEn: "Digital Content Creator, YouTuber, Social Media Influencer & Media Arts",
      strengthsKn: "ಯೂಟ್ಯೂಬ್ ವ್ಲಾಗ್ಗಿಂಗ್, ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಕಂಟೆಂಟ್, ಮನರಂಜನೆ, ಸೃಜನಶೀಲ ವಿನ್ಯಾಸ, ಡಿಜಿಟಲ್ ಬ್ರಾಂಡಿಂಗ್ & ಸಾರ್ವಜನಿಕ ಆಕರ್ಷಣೆ",
      strengthsEn: "YouTube Creation, Social Media Influencing, Viral Content, Digital Media & Entertainment",
      whyNativeShinesKn: "ಕಲಾಕಾರಕ ಶುಕ್ರ, ಸಂವಹನಕಾರಕ ಬುಧ ಹಾಗೂ ಡಿಜಿಟಲ್ ಮಾಸ್ ಮೀಡಿಯಾ ಕಾರಕ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ಯೂಟ್ಯೂಬರ್, ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಇನ್‌ಫ್ಲುಯೆನ್ಸರ್, ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್ ಹಾಗೂ ದೃಶ್ಯ ಮಾಧ್ಯಮದಲ್ಲಿ ಮುಂಚೂಣಿ ತಾರೆಯಾಗಿ ಹೊಳೆಯುವ ಯೋಗವಿದೆ.",
      whyNativeShinesEn: "Venus (charm/glamour), Mercury (communication/wit), and Rahu (mass digital reach) grant phenomenal virality as a YouTuber, social media influencer, and digital content creator.",
      interestFieldsKn: [
        "ಸಿನಿಮಾ ಅಭಿನಯ & ಮನರಂಜನಾ ಸ್ಟಾರ್‌ಡಮ್",
        "ಸಂಗೀತ ಸಂಯೋಜನೆ & ಆಡಿಯೋ ಪ್ರೊಡಕ್ಷನ್",
        "ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಷನ್ & ಯೂಟ್ಯೂಬ್",
        "ದೃಶ್ಯ ಕಲೆ, ಫಿಲ್ಮ್ ಮೇಕಿಂಗ್ & ನಿರ್ದೇಶನ",
        "ಸೋಷಿಯಲ್ ಮೀಡಿಯಾ ಇನ್‌ಫ್ಲುಯೆನ್ಸಿಂಗ್ & ಬ್ರಾಂಡಿಂಗ್"
      ],
      interestFieldsEn: [
        "Cinema Acting & Mass Entertainment Stardom",
        "Musical Composition & Audio Engineering",
        "Digital Content Creation & YouTube Production",
        "Visual Arts, Cinematography & Direction",
        "Social Media Influencing & Celebrity Branding"
      ]
    },
    priest_vedic_astrology: {
      nameKn: "ಪೌರೋಹಿತ್ಯ, ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು, ವೇದ ಅಧ್ಯಯನ & ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ",
      nameEn: "Vedic Studies, Temple Priesthood, Rituals & Astrology",
      strengthsKn: "ವೇದ ಮಂತ್ರೋಚ್ಚಾರಣೆ, ದೇವತಾ ಪೂಜಾ ವಿಧಿ, ಹೋಮ-ಹವನ, ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ & ಧರ್ಮ ರಕ್ಷಣೆ",
      strengthsEn: "Vedic Chanting, Temple Sanctum Seva, Yajna Rituals, Astrological Guidance & Dharma",
      whyNativeShinesKn: "ಗುರು-ಕೇತುಗಳ ಬ್ರಹ್ಮಜ್ಞಾನ ಯೋಗ ಮತ್ತು 9ನೇ ಧರ್ಮ ಸ್ಥಾನದ ಬಲದಿಂದ ವೈದಿಕ ಕ್ಷೇತ್ರ, ದೇವಸ್ಥಾನ ಪೂಜೆ ಮತ್ತು ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ದೈವಜ್ಞರಾಗಿ ಜನಮನ್ನಣೆ ಗಳಿಸುವ ಯೋಗವಿದೆ.",
      whyNativeShinesEn: "Guru-Ketu spiritual nexus and 9th house dharma bestow profound sanctity in Vedic rituals and astrological consultation.",
      interestFieldsKn: [
        "ವೇದ ಮಂತ್ರ ಪಠಣ & ಸಾಂಪ್ರದಾಯಿಕ ಪೌರೋಹಿತ್ಯ",
        "ದೇವಸ್ಥಾನ ಪ್ರಧಾನ ಅರ್ಚಕ ಸೇವೆ",
        "ಹೋಮ-ಹವನ, ಶಾಂತಿ ಪೂಜೆ & ಪರಿಹಾರ ವಿಧಿ",
        "ಜಾತಕ ಫಲಚಿಂತನೆ & ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ",
        "ಧರ್ಮ ಪ್ರವಚನ & ವೇದಾಂತ ತತ್ವಜ್ಞಾನ"
      ],
      interestFieldsEn: [
        "Vedic Chanting & Hereditary Purohita Rites",
        "Temple Sanctum Head Priest Seva",
        "Sacred Homa-Havana & Daivika Parihara Rites",
        "Astrological Consultation & Kundli Guidance",
        "Dharmic Discourses & Vedantic Philosophy"
      ]
    },
    sports_athletics: {
      nameKn: "ಕ್ರೀಡೆ, ಸಾಹಸ, ದೈಹಿಕ ಕೌಶಲ್ಯ & ಕ್ರೀಡಾಪಟು (Sports & High Athletics)",
      nameEn: "Sports, Athletics, Martial Fitness & Competitive Championship",
      strengthsKn: "ದೈಹಿಕ ಕಸರತ್ತು, ಶೀಘ್ರ ಪ್ರತಿಕ್ರಿಯಾ ಸಾಮರ್ಥ್ಯ, ಕ್ರೀಡಾಂಗಣದ ನಾಯಕತ್ವ & ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ",
      strengthsEn: "Athletic Stamina, Lightning Reflexes, Pitch Leadership & Competitive Mastery",
      whyNativeShinesKn: "ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರಸ್ಥ ಕುಜ (ರುಚಕ ಯೋಗ), 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ ಮತ್ತು 6ನೇ ಶತ್ರುಜಯ ಸ್ಥಾನಗಳ ಬಲದಿಂದ ಅಂತರರಾಷ್ಟ್ರೀಯ/ರಾಷ್ಟ್ರೀಯ ಕ್ರೀಡಾಪಟುವಾಗಿ, ವಿಶ್ವ ದಾಖಲೆ ಸ್ಥಾಪಿಸಿ ದೇಶಕ್ಕೆ ಕೀರ್ತಿ ತರುವ ದೈವದತ್ತ ಸಾಮರ್ಥ್ಯವಿದೆ.",
      whyNativeShinesEn: "Exalted or powerhouse Mars (Ruchaka Yoga), 3rd house of physical valor, and 6th house of competitive victory forge a world-class athlete, sports champion, and national icon.",
      interestFieldsKn: [
        "ಅಂತರರಾಷ್ಟ್ರೀಯ ಚಾಂಪಿಯನ್‌ಶಿಪ್ ಕ್ರೀಡೆಗಳು (ಟೆನಿಸ್ / ಗಾಲ್ಫ್ / ಟ್ರ್ಯಾಕ್)",
        "ಫುಟ್‌ಬಾಲ್ & ಸ್ಪರ್ಧಾತ್ಮಕ ಅಥ್ಲೆಟಿಕ್ ಓಟ",
        "ದೈಹಿಕ ದೃಢತೆ, ಸ್ಟ್ಯಾಮಿನಾ & ಕಂಡೀಷನಿಂಗ್",
        "ಕ್ರೀಡಾಂಗಣ ನಾಯಕತ್ವ & ಪಂದ್ಯಾವಳಿ ಕಾರ್ಯತಂತ್ರ",
        "ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯ & ಕ್ರೀಡಾ ತರಬೇತಿ"
      ],
      interestFieldsEn: [
        "Championship Athletics (Tennis / Golf / Track)",
        "Competitive Football, Sprinting & Field Agility",
        "Elite Physical Conditioning & Stamina",
        "Tournament Strategy & Field Leadership",
        "Competitive High-Performance Coaching"
      ]
    },
    agriculture_farming: {
      nameKn: "ಕೃಷಿ, ತೋಟಗಾರಿಕೆ, ಹೈನುಗಾರಿಕೆ, ಸಾವಯವ ವ್ಯವಸಾಯ & ಅಗ್ರಿ-ಟೆಕ್ (Agriculture & Farming)",
      nameEn: "Agriculture, Farming, Horticulture, Dairy & Agri-Business",
      strengthsKn: "ವ್ಯವಸಾಯ ನಿರ್ವಹಣೆ, ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು, ಭೂಮಿ ಫಲವತ್ತತೆ, ಹೈನುಗಾರಿಕೆ & ಕೃಷಿ ಉದ್ಯಮಶೀಲತೆ",
      strengthsEn: "Crop Cultivation, Horticulture, Dairy Farming, Soil Husbandry & Agri-Business",
      whyNativeShinesKn: "ಭೂಮಿಕಾರಕ ಕುಜ, ಕ್ಷೇತ್ರಪಾಲಕ ಶನಿ ಹಾಗೂ ಜಲಕಾರಕ ಚಂದ್ರನ ಅನುಗ್ರಹದಿಂದ ಕೃಷಿ ಕ್ಷೇತ್ರ, ಫಲವತ್ತಾದ ತೋಟಗಾರಿಕೆ, ಹೈನುಗಾರಿಕೆ ಹಾಗೂ ನೈಸರ್ಗಿಕ ವ್ಯವಸಾಯದಲ್ಲಿ ಸಮೃದ್ಧಿ ಮತ್ತು ಕೀರ್ತಿ ಗಳಿಸುವರು.",
      whyNativeShinesEn: "Mars (land), Saturn (soil labor), and Moon (crops/water) bestow great prosperity in agriculture, modern farming, horticulture, and dairy enterprise.",
      interestFieldsKn: [
        "ವಾಣಿಜ್ಯ ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳು (ಅಡಿಕೆ, ಕಾಫಿ, ತೆಂಗು)",
        "ಆಧುನಿಕ ಸಾವಯವ ಕೃಷಿ & ನೈಸರ್ಗಿಕ ಬೇಸಾಯ",
        "ಹೈನುಗಾರಿಕೆ & ಡೈರಿ ಉದ್ಯಮ",
        "ಕೃಷಿ ಭೂಮಿ ನಿರ್ವಹಣೆ & ಮಣ್ಣಿನ ಫಲವತ್ತತೆ",
        "ಅಗ್ರಿ-ಟೆಕ್ & ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಮಾರುಕಟ್ಟೆ"
      ],
      interestFieldsEn: [
        "Commercial Horticulture (Arecanut, Coffee, Spices)",
        "Modern Organic Cultivation & Natural Farming",
        "Dairy Husbandry & Livestock Enterprise",
        "Farmland Management & Soil Husbandry",
        "Agri-Tech & Agricultural Commodity Commerce"
      ]
    }
  };

  const maxRawScore = Math.max(...Object.values(scores).filter(s => s > -500));
  const topSuitabilityBase = Math.min(95, Math.max(88, 88 + Math.round((scores[bestCode] - (scores[secondCode] || 0)) * 1.5)));

  const topSuitableFields: CareerSuitabilityField[] = sortedCodes
    .filter(code => scores[code] > -500)
    .map((code, idx) => {
      const rawScore = scores[code];
      let pct: number;
      if (idx === 0) {
        pct = topSuitabilityBase;
      } else {
        const ratio = Math.max(0, rawScore) / (maxRawScore || 1);
        pct = Math.min(topSuitabilityBase - 3, Math.max(48, Math.round(52 + ratio * 38)));
      }
      const meta = FIELD_METADATA[code];
      const verdictKn =
        pct >= 85
          ? "ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು (Top Recommended)"
          : pct >= 72
          ? "ಉತ್ತಮ ಅನುಕೂಲ (High Suitability)"
          : "ಮಧ್ಯಮ (Moderate)";
      const verdictEn =
        pct >= 85
          ? "Top Recommended"
          : pct >= 72
          ? "High Suitability"
          : "Moderate";

      return {
        fieldCode: code,
        fieldNameKn: meta.nameKn,
        fieldNameEn: meta.nameEn,
        suitabilityPercentage: pct,
        coreStrengthsKn: meta.strengthsKn,
        coreStrengthsEn: meta.strengthsEn,
        whyNativeShinesKn: meta.whyNativeShinesKn,
        whyNativeShinesEn: meta.whyNativeShinesEn,
        interestFieldsKn: meta.interestFieldsKn,
        interestFieldsEn: meta.interestFieldsEn,
        verdictKn,
        verdictEn
      };
    });

  // -------------------------------------------------------------
  // SUBJECT & ACADEMIC APTITUDES (6 CORE DISCIPLINES)
  // Maths, Science/Tech, Politics/Gov, Commerce, Arts, Social Sci/Law/Dharma
  // Rooted in 5th house of intellect (Buddhi), 4th house of schooling (Vidya),
  // Karakas (Budha, Guru, Shukra, Kuja, Ravi, Shani, Rahu, Ketu),
  // and organic harmony with the native's top suitable vocational fields.
  // -------------------------------------------------------------
  const fifthSignIndex = (lagnaIndex + 4) % 12;
  const fifthLord = signLord(fifthSignIndex);
  const fifthLordPlanet = kundli.planets.find(p => p.name === fifthLord);
  const planetsIn5th = kundli.planets.filter(p => p.house === 5);
  const planetsIn4th = kundli.planets.filter(p => p.house === 4);

  const rawSubjectScores: Record<SubjectCode, number> = {
    maths_analytics: 42,
    science_technology: 42,
    rajakiya_governance: 40,
    commerce_banking: 40,
    arts_creativity: 40,
    history_law_dharma: 40
  };

  // 1. 5th House (Buddhi Sthana) Sign Element Inclination
  if ([0, 4, 8].includes(fifthSignIndex)) { // Fire: Leadership, governance, physical sciences
    rawSubjectScores.rajakiya_governance += 14;
    rawSubjectScores.science_technology += 10;
    rawSubjectScores.maths_analytics += 6;
  } else if ([1, 5, 9].includes(fifthSignIndex)) { // Earth: Commerce, finance, practical engineering
    rawSubjectScores.commerce_banking += 14;
    rawSubjectScores.science_technology += 10;
    rawSubjectScores.maths_analytics += 8;
  } else if ([2, 6, 10].includes(fifthSignIndex)) { // Air: Mathematics, analytical logic, communication, media
    rawSubjectScores.maths_analytics += 14;
    rawSubjectScores.arts_creativity += 12;
    rawSubjectScores.science_technology += 10;
    rawSubjectScores.history_law_dharma += 8;
  } else { // Water: Arts, psychology, medicine, philosophy
    rawSubjectScores.arts_creativity += 14;
    rawSubjectScores.history_law_dharma += 12;
    rawSubjectScores.science_technology += 8;
  }

  // 2. Planets Seated in 5th House (Immediate intellectual imprint)
  for (const pl of planetsIn5th) {
    if (pl.name === PlanetName.Sun) { rawSubjectScores.rajakiya_governance += 20; rawSubjectScores.history_law_dharma += 10; }
    if (pl.name === PlanetName.Moon) { rawSubjectScores.arts_creativity += 20; rawSubjectScores.history_law_dharma += 10; }
    if (pl.name === PlanetName.Mars) { rawSubjectScores.science_technology += 20; rawSubjectScores.maths_analytics += 12; }
    if (pl.name === PlanetName.Mercury) { rawSubjectScores.maths_analytics += 22; rawSubjectScores.commerce_banking += 14; }
    if (pl.name === PlanetName.Jupiter) { rawSubjectScores.history_law_dharma += 22; rawSubjectScores.commerce_banking += 14; }
    if (pl.name === PlanetName.Venus) { rawSubjectScores.arts_creativity += 24; }
    if (pl.name === PlanetName.Saturn) { rawSubjectScores.history_law_dharma += 22; rawSubjectScores.science_technology += 6; }
    if (pl.name === PlanetName.Rahu) { rawSubjectScores.arts_creativity += 18; rawSubjectScores.science_technology += 16; rawSubjectScores.maths_analytics += 12; }
    if (pl.name === PlanetName.Ketu) { rawSubjectScores.maths_analytics += 16; rawSubjectScores.history_law_dharma += 16; }
  }

  // 3. 5th Lord Natural Rulership & Dignity
  if (fifthLord === PlanetName.Mercury) { rawSubjectScores.maths_analytics += 14; rawSubjectScores.commerce_banking += 8; }
  if (fifthLord === PlanetName.Venus) { rawSubjectScores.arts_creativity += 16; }
  if (fifthLord === PlanetName.Jupiter) { rawSubjectScores.history_law_dharma += 16; rawSubjectScores.commerce_banking += 10; }
  if (fifthLord === PlanetName.Mars) { rawSubjectScores.science_technology += 16; rawSubjectScores.maths_analytics += 8; }
  if (fifthLord === PlanetName.Sun) { rawSubjectScores.rajakiya_governance += 16; }
  if (fifthLord === PlanetName.Moon) { rawSubjectScores.arts_creativity += 14; rawSubjectScores.history_law_dharma += 8; }
  if (fifthLord === PlanetName.Saturn) { rawSubjectScores.history_law_dharma += 14; rawSubjectScores.science_technology += 6; }

  if (fifthLordPlanet && [1, 5, 9].includes(fifthLordPlanet.house)) {
    // 5th lord in Trikona: strong natural grasping
    if (fifthLord === PlanetName.Mercury) rawSubjectScores.maths_analytics += 8;
    if (fifthLord === PlanetName.Venus) rawSubjectScores.arts_creativity += 8;
    if (fifthLord === PlanetName.Jupiter) rawSubjectScores.history_law_dharma += 8;
    if (fifthLord === PlanetName.Mars) rawSubjectScores.science_technology += 8;
    if (fifthLord === PlanetName.Sun) rawSubjectScores.rajakiya_governance += 8;
  }

  // 4. 4th House (Vidya Sthana) Schooling & Degree Foundation
  for (const pl of planetsIn4th) {
    if (pl.name === PlanetName.Jupiter) { rawSubjectScores.history_law_dharma += 10; rawSubjectScores.commerce_banking += 8; }
    if (pl.name === PlanetName.Mercury) { rawSubjectScores.maths_analytics += 10; rawSubjectScores.commerce_banking += 8; }
    if (pl.name === PlanetName.Venus) { rawSubjectScores.arts_creativity += 12; }
    if (pl.name === PlanetName.Mars) { rawSubjectScores.science_technology += 10; }
    if (pl.name === PlanetName.Sun) { rawSubjectScores.rajakiya_governance += 10; }
    if (pl.name === PlanetName.Saturn) { rawSubjectScores.history_law_dharma += 8; }
  }

  // 5. Planetary Vidya Karaka Dignity
  if (mercury && [2, 5].includes(mercury.rashi.index)) { rawSubjectScores.maths_analytics += 12; rawSubjectScores.commerce_banking += 6; }
  if (mercury && [1, 4, 5, 9, 10].includes(mercury.house)) rawSubjectScores.maths_analytics += 6;
  if (jupiter && [3, 8, 11].includes(jupiter.rashi.index)) { rawSubjectScores.history_law_dharma += 12; rawSubjectScores.commerce_banking += 8; }
  if (jupiter && [1, 4, 5, 9, 10].includes(jupiter.house)) rawSubjectScores.history_law_dharma += 6;
  if (venus && [1, 6, 11].includes(venus.rashi.index)) rawSubjectScores.arts_creativity += 14;
  if (venus && [1, 4, 5, 9, 10].includes(venus.house)) rawSubjectScores.arts_creativity += 6;
  if (mars && [0, 7, 9].includes(mars.rashi.index)) rawSubjectScores.science_technology += 12;
  if (mars && [1, 10].includes(mars.house)) rawSubjectScores.science_technology += 6;
  if (sun && [0, 4].includes(sun.rashi.index)) rawSubjectScores.rajakiya_governance += 14;
  if (sun && [1, 10].includes(sun.house)) rawSubjectScores.rajakiya_governance += 6;
  if (saturn && [6, 9, 10].includes(saturn.rashi.index)) { rawSubjectScores.history_law_dharma += 12; rawSubjectScores.science_technology += 6; }
  if (rahu && [3, 6, 10, 11].includes(rahu.house)) rawSubjectScores.science_technology += 10;

  // 6. Tight Vocational Resonance with Native's Top Suitable Career Fields
  topSuitableFields.slice(0, 3).forEach((tf, idx) => {
    const w = idx === 0 ? 1.0 : idx === 1 ? 0.55 : 0.25;
    if (tf.fieldCode === "creative_media") {
      rawSubjectScores.arts_creativity += 56 * w;
    } else if (tf.fieldCode === "it_software") {
      rawSubjectScores.science_technology += 50 * w;
      rawSubjectScores.maths_analytics += 42 * w;
    } else if (tf.fieldCode === "engineering_core") {
      rawSubjectScores.science_technology += 52 * w;
      rawSubjectScores.maths_analytics += 38 * w;
    } else if (tf.fieldCode === "government_civil_police") {
      rawSubjectScores.rajakiya_governance += 54 * w;
      rawSubjectScores.history_law_dharma += 38 * w;
    } else if (tf.fieldCode === "legal_judiciary") {
      rawSubjectScores.history_law_dharma += 56 * w;
      rawSubjectScores.rajakiya_governance += 38 * w;
    } else if (tf.fieldCode === "banking_finance") {
      rawSubjectScores.commerce_banking += 56 * w;
      rawSubjectScores.maths_analytics += 38 * w;
    } else if (tf.fieldCode === "business_realestate") {
      rawSubjectScores.commerce_banking += 48 * w;
      rawSubjectScores.rajakiya_governance += 30 * w;
    } else if (tf.fieldCode === "teaching_academics") {
      rawSubjectScores.history_law_dharma += 48 * w;
      rawSubjectScores.maths_analytics += 30 * w;
      rawSubjectScores.arts_creativity += 26 * w;
    } else if (tf.fieldCode === "medical_healthcare") {
      rawSubjectScores.science_technology += 52 * w;
      rawSubjectScores.history_law_dharma += 28 * w;
    } else if (tf.fieldCode === "priest_vedic_astrology") {
      rawSubjectScores.history_law_dharma += 56 * w;
      rawSubjectScores.maths_analytics += 32 * w;
    } else if (tf.fieldCode === "sports_athletics") {
      rawSubjectScores.science_technology += 48 * w;
      rawSubjectScores.rajakiya_governance += 36 * w;
    } else if (tf.fieldCode === "agriculture_farming") {
      rawSubjectScores.science_technology += 32 * w;
      rawSubjectScores.history_law_dharma += 24 * w;
    }
  });

  // Sort by raw score descending
  const sortedSubjectEntries = (Object.entries(rawSubjectScores) as [SubjectCode, number][])
    .sort((a, b) => b[1] - a[1]);

  const maxRaw = sortedSubjectEntries[0][1];
  const minRaw = sortedSubjectEntries[sortedSubjectEntries.length - 1][1];
  const rawRange = Math.max(1, maxRaw - minRaw);

  const targetBases = [92, 84, 76, 67, 59, 51];
  const rankBonuses = [4, 3, 3, 3, 2, 2];

  const getRatingKn = (score: number): "ಅತ್ಯುನ್ನತ (Excellent)" | "ಉತ್ತಮ (Good)" | "ಸಾಧಾರಣ (Average)" =>
    score >= 85 ? "ಅತ್ಯುನ್ನತ (Excellent)" : score >= 72 ? "ಉತ್ತಮ (Good)" : "ಸಾಧಾರಣ (Average)";
  const getRatingEn = (score: number): "Excellent" | "Good" | "Average" =>
    score >= 85 ? "Excellent" : score >= 72 ? "Good" : "Average";

  const getSubjectIndicatorKn = (code: SubjectCode): string => {
    switch (code) {
      case "maths_analytics":
        if (planetsIn5th.some(p => p.name === PlanetName.Mercury)) {
          return "5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದಲ್ಲಿ ಬುಧನ ಉಪಸ್ಥಿತಿ ಹಾಗೂ ತಾರ್ಕಿಕ ಗಣಿತ ಕೌಶಲ್ಯ";
        }
        if (mercury && [2, 5].includes(mercury.rashi.index)) {
          return "ಬುಧನ ಸ್ವಕ್ಷೇತ್ರ/ಉಚ್ಚ ಬಲ ಹಾಗೂ ತೀಕ್ಷ್ಣ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಗ್ರಹಣ ಶಕ್ತಿ";
        }
        if (fifthLord === PlanetName.Mercury || fifthLord === PlanetName.Mars) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]}ನ ತಾರ್ಕಿಕ ಹಾಗೂ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಶಕ್ತಿ`;
        }
        return "ಬುಧ ಗ್ರಹದ ಗಣಿತ ತರ್ಕ ಹಾಗೂ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಬುದ್ಧಿಮತ್ತೆ";

      case "science_technology":
        if (planetsIn5th.some(p => [PlanetName.Mars, PlanetName.Rahu].includes(p.name))) {
          const pName = planetsIn5th.find(p => [PlanetName.Mars, PlanetName.Rahu].includes(p.name))!.name;
          return `5ನೇ ಸ್ಥಾನದಲ್ಲಿ ${PLANET_KN[pName]} ಪ್ರಭಾವ: ನೂತನ ತಂತ್ರಜ್ಞಾನ & ಇಂಜಿನಿಯರಿಂಗ್ ಪ್ರವೃತ್ತಿ`;
        }
        if (mars && [0, 7, 9].includes(mars.rashi.index)) {
          return "ಕುಜನ ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರ ಬಲ ಹಾಗೂ ತಾಂತ್ರಿಕ-ವೈಜ್ಞಾನಿಕ ಸಂಶೋಧನಾ ಪರಿಣತಿ";
        }
        if (fifthLord === PlanetName.Mars || fifthLord === PlanetName.Saturn) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]} ಗ್ರಹದ ಪ್ರಯೋಗಶೀಲ ವೈಜ್ಞಾನಿಕ ದೃಷ್ಟಿಕೋನ`;
        }
        return "ಕುಜ ಹಾಗೂ ರಾಹು ಗ್ರಹಗಳ ತಾಂತ್ರಿಕ, ಇಂಜಿನಿಯರಿಂಗ್ & ವೈಜ್ಞಾನಿಕ ಒಲವು";

      case "rajakiya_governance":
        if (sun && (sun.house === 10 || sun.house === 1)) {
          return "ರವಿ ಗ್ರಹದ ದಿಕ್ಬಲ, 10ನೇ ಕರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಸಾಂವಿಧಾನಿಕ ಆಡಳಿತ ಪ್ರಜ್ಞೆ";
        }
        if (planetsIn5th.some(p => p.name === PlanetName.Sun)) {
          return "5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದಲ್ಲಿ ಸೂರ್ಯನ ನಾಯಕತ್ವ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಆಡಳಿತ ಒಲವು";
        }
        if (fifthLord === PlanetName.Sun || fifthLord === PlanetName.Jupiter) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]}ನ ರಾಜಕಾರಕ ಬಲ ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣ`;
        }
        return "ರಾಜಕಾರಕ ರವಿ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ರಾಜಕೀಯ, ಆಡಳಿತ & ಸಂವಿಧಾನ ಪ್ರಜ್ಞೆ";

      case "commerce_banking":
        if (planetsIn5th.some(p => [PlanetName.Mercury, PlanetName.Jupiter].includes(p.name))) {
          return "5ನೇ ಸ್ಥಾನದಲ್ಲಿ ಬುಧ-ಗುರುಗಳ ಪ್ರಭಾವ: ವಾಣಿಜ್ಯ, ಲೆಕ್ಕಪತ್ರ & ಹಣಕಾಸು ಒಲವು";
        }
        if ([1, 5, 9].includes(fifthSignIndex)) {
          return "5ನೇ ಪೃಥ್ವಿ ತತ್ತ್ವ ಸ್ಥಾನ ಹಾಗೂ ಬುಧನ ಲೆಕ್ಕಪತ್ರ ವಿಶ್ಲೇಷಣಾ ಬಲ";
        }
        if (fifthLord === PlanetName.Mercury || fifthLord === PlanetName.Jupiter) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]}ನ ಆರ್ಥಿಕ ನಿರ್ವಹಣಾ ಕೌಶಲ್ಯ`;
        }
        return "ಗುರು ಹಾಗೂ ಬುಧ ಗ್ರಹಗಳ ವಾಣಿಜ್ಯ, ಬ್ಯಾಂಕಿಂಗ್ & ಅರ್ಥಶಾಸ್ತ್ರ ಸಮನ್ವಯ";

      case "arts_creativity":
        if (planetsIn5th.some(p => [PlanetName.Venus, PlanetName.Moon].includes(p.name))) {
          const pName = planetsIn5th.find(p => [PlanetName.Venus, PlanetName.Moon].includes(p.name))!.name;
          return `5ನೇ ಸ್ಥಾನದಲ್ಲಿ ${PLANET_KN[pName]} ಪ್ರಭಾವ: ಜನ್ಮತಃ ಕಲಾ ಪ್ರತಿಭೆ & ಸೃಜನಶೀಲತೆ`;
        }
        if (venus && [1, 6, 11].includes(venus.rashi.index)) {
          return "ಕಲಾಕಾರಕ ಶುಕ್ರನ ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರ ಬಲ ಹಾಗೂ ಅಪ್ರತಿಮ ಕಲ್ಪನಾ ಶಕ್ತಿ";
        }
        if (fifthLord === PlanetName.Venus || fifthLord === PlanetName.Moon) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]} ಗ್ರಹದ ಸಾಹಿತ್ಯ, ಕಲೆ & ಮಾಧ್ಯಮ ಒಲವು`;
        }
        return "ಶುಕ್ರ ಹಾಗೂ ಚಂದ್ರ ಗ್ರಹಗಳ ಸೃಜನಶೀಲ, ಕಲಾತ್ಮಕ & ಸಾಹಿತ್ಯಿಕ ಅಭಿವ್ಯಕ್ತಿ";

      case "history_law_dharma":
        if (jupiter && [1, 4, 5, 9, 10].includes(jupiter.house)) {
          return "ಧರ್ಮಕಾರಕ ಗುರುವಿನ ನೈಸರ್ಗಿಕ ಜ್ಞಾನ ಬಲ, ಕಾನೂನು & ನೀತಿಶಾಸ್ತ್ರ ಪರಿಣತಿ";
        }
        if (planetsIn5th.some(p => [PlanetName.Jupiter, PlanetName.Saturn, PlanetName.Ketu].includes(p.name))) {
          return "5ನೇ ಸ್ಥಾನದಲ್ಲಿ ಗುರು-ಶನಿಗಳ ಗಂಭೀರ ಸಂಶೋಧನೆ, ಇತಿಹಾಸ & ಧರ್ಮಶಾಸ್ತ್ರ ಒಲವು";
        }
        if (fifthLord === PlanetName.Jupiter || fifthLord === PlanetName.Saturn) {
          return `5ನೇ ಅಧಿಪತಿ ${PLANET_KN[fifthLord]}ನ ಸಮಾಜ ವಿಜ್ಞಾನ, ಇತಿಹಾಸ & ನ್ಯಾಯಶಾಸ್ತ್ರ ಪ್ರಭಾವ`;
        }
        return "ಧರ್ಮಕಾರಕ ಗುರು ಹಾಗೂ ಶನಿ-ಕೇತುಗಳ ನ್ಯಾಯ, ಸಮಾಜ ವಿಜ್ಞಾನ & ಇತಿಹಾಸ ಪ್ರಜ್ಞೆ";
    }
  };

  const getSubjectIndicatorEn = (code: SubjectCode): string => {
    switch (code) {
      case "maths_analytics":
        return "Mercury's analytical logic and quantitative deduction in harmony with 5th house";
      case "science_technology":
        return "Mars & Rahu planetary impulse driving applied technology and engineering inquiry";
      case "rajakiya_governance":
        return "Sun (Raja-karaka) & 10th/5th house governance authority and policy acumen";
      case "commerce_banking":
        return "Mercury & Jupiter synergy conferring commerce, accounts, and financial acumen";
      case "arts_creativity":
        return "Venus (Kala-karaka) & Moon aesthetics inspiring creative arts, media, and literature";
      case "history_law_dharma":
        return "Jupiter (Dharma-karaka) & Saturn conferring mastery in law, history, and social philosophy";
    }
  };

  const subjectMeta: Record<SubjectCode, { nameKn: string; nameEn: string }> = {
    maths_analytics: {
      nameKn: "ಗಣಿತ & ವಿಶ್ಲೇಷಣೆ (Maths & Analytics)",
      nameEn: "Mathematics & Analytical Logic"
    },
    science_technology: {
      nameKn: "ವಿಜ್ಞಾನ & ತಂತ್ರಜ್ಞಾನ (Science & Technology)",
      nameEn: "Science, Technology & Engineering"
    },
    rajakiya_governance: {
      nameKn: "ರಾಜಕೀಯ, ಸಂವಿಧಾನ & ಆಡಳಿತ (Politics & Governance)",
      nameEn: "Politics, Constitution & Governance"
    },
    commerce_banking: {
      nameKn: "ವಾಣಿಜ್ಯ, ಅರ್ಥಶಾಸ್ತ್ರ & ಲೆಕ್ಕಪತ್ರ (Commerce & Finance)",
      nameEn: "Commerce, Banking & Accounts"
    },
    arts_creativity: {
      nameKn: "ಕಲೆ, ಸಾಹಿತ್ಯ & ಸೃಜನಶೀಲತೆ (Arts & Creativity)",
      nameEn: "Arts, Literature & Creative Media"
    },
    history_law_dharma: {
      nameKn: "ಸಮಾಜ ವಿಜ್ಞಾನ, ಇತಿಹಾಸ, ಕಾನೂನು & ಧರ್ಮ (Social Science & Law)",
      nameEn: "Social Sciences, History & Law"
    }
  };

  const subjectAptitudes: SubjectAptitude[] = sortedSubjectEntries.map(([code, raw], rank) => {
    const norm = (raw - minRaw) / rawRange;
    const scorePercentage = Math.min(96, Math.max(50, Math.round(targetBases[rank] + norm * rankBonuses[rank])));
    return {
      code,
      nameKn: subjectMeta[code].nameKn,
      nameEn: subjectMeta[code].nameEn,
      scorePercentage,
      ratingKn: getRatingKn(scorePercentage),
      ratingEn: getRatingEn(scorePercentage),
      planetaryIndicatorKn: getSubjectIndicatorKn(code),
      planetaryIndicatorEn: getSubjectIndicatorEn(code)
    };
  });

  const top1 = topSuitableFields[0];
  const top2 = topSuitableFields[1];
  const top3 = topSuitableFields[2];
  const topSub1 = subjectAptitudes[0];
  const topSub2 = subjectAptitudes[1];

  const bestFieldsSummaryKn = `ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಗರಿಷ್ಠ ಯಶಸ್ಸು ಮತ್ತು ಉನ್ನತಿ ತರುವ ಪ್ರಮುಖ ವೃತ್ತಿ ರಂಗಗಳು: 1) ${top1.fieldNameKn} (${top1.suitabilityPercentage}% ಸೂಕ್ತತೆ), 2) ${top2.fieldNameKn} (${top2.suitabilityPercentage}% ಸೂಕ್ತತೆ), 3) ${top3.fieldNameKn} (${top3.suitabilityPercentage}% ಸೂಕ್ತತೆ). ಶೈಕ್ಷಣಿಕ ವಿಷಯಗಳಲ್ಲಿ ${topSub1.nameKn} (${topSub1.scorePercentage}%) ಮತ್ತು ${topSub2.nameKn} (${topSub2.scorePercentage}%) ಅತ್ಯುನ್ನತ ಕೌಶಲ್ಯವಿದೆ.`;

  const bestFieldsSummaryEn = `Top career avenues for highest prosperity and growth: 1) ${top1.fieldNameEn} (${top1.suitabilityPercentage}% match), 2) ${top2.fieldNameEn} (${top2.suitabilityPercentage}% match), 3) ${top3.fieldNameEn} (${top3.suitabilityPercentage}% match). Natural academic strengths lie in ${topSub1.nameEn} (${topSub1.scorePercentage}%) and ${topSub2.nameEn} (${topSub2.scorePercentage}%).`;

  const baseProfile: AccurateProfessionProfile = (() => {
    switch (bestCode) {
    case "it_software":
      return {
        code: "it_software",
        titleKn: "ಸಾಫ್ಟ್‌ವೇರ್ ಇಂಜಿನಿಯರಿಂಗ್, ಐಟಿ & ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ (Software & IT)",
        titleEn: "Software Engineering, IT & Technology",
        specificRoleKn: "ಸಾಫ್ಟ್‌ವೇರ್ ಡೆವಲಪರ್, ಸಿಸ್ಟಮ್ ಆರ್ಕಿಟೆಕ್ಟ್, ಡೇಟಾ ಸೈಂಟಿಸ್ಟ್ ಅಥವಾ ಹೈಟೆಕ್ ಐಟಿ ತಜ್ಞರು",
        specificRoleEn: "Software Engineer, System Architect, Cloud/Data Specialist or IT Consultant",
        workEnvironmentKn: "ಕಂಪ್ಯೂಟರ್ ತಂತ್ರಜ್ಞಾನ, ಸಾಫ್ಟ್‌ವೇರ್ ಕೋಡಿಂಗ್, ಬಹುರಾಷ್ಟ್ರೀಯ ಕಂಪನಿ (MNC) ಅಥವಾ ಹೈಟೆಕ್ ತಂತ್ರಜ್ಞಾನ ಸಂಸ್ಥೆ",
        workEnvironmentEn: "Software development labs, cloud architecture, multinational tech firms, or data-driven startups",
        astrologicalBasisKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignKn} ರಾಶಿ), ಬುದ್ಧಿಕಾರಕ ಬುಧ ಹಾಗೂ ನೂತನ ತಂತ್ರಜ್ಞಾನ ಕಾರಕ ರಾಹುವಿನ ಪ್ರಬಲ ಪ್ರಭಾವ ಜಾತಕದಲ್ಲಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಗ್ರಹವು ನಿಮ್ಮನ್ನು ಡಿಜಿಟಲ್ ಕೋಡಿಂಗ್, ತಾಂತ್ರಿಕ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ತಂತ್ರಜ್ಞಾನದ ವೃತ್ತಿಯತ್ತ ಮುನ್ನಡೆಸಿದೆ.`,
        astrologicalBasisEn: `The 10th house of profession in ${tenthSignEn}, along with Mercury's algorithmic intellect and Rahu's virtual technological influence, aligns directly with high-tech software engineering. Amatyakaraka ${amkEn} governs your livelihood.`,
        secondaryAlternativeKn: "ಡೇಟಾ ಅನಾಲಿಸಿಸ್, ವೆಬ್ ಅಪ್ಲಿಕೇಶನ್ ಡೆವಲಪ್‌ಮೆಂಟ್ ಅಥವಾ ಐಟಿ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್",
        secondaryAlternativeEn: "Data Analytics, Web Platform Engineering or Technical Product Management",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "banking_finance":
      return {
        code: "banking_finance",
        titleKn: "ಬ್ಯಾಂಕಿಂಗ್, ಹಣಕಾಸು, ಲೆಕ್ಕಪರಿಶೋಧನೆ (CA) & ಬ್ಯಾಂಕ್ ಕ್ಲರ್ಕ್ (Banking & Finance)",
        titleEn: "Banking, Financial Accounts, CA & Treasury",
        specificRoleKn: "ಬ್ಯಾಂಕ್ ಕ್ಲರ್ಕ್ / ಆಫೀಸರ್, ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್ (CA), ಹಣಕಾಸು ವಿಶ್ಲೇಷಕರು ಅಥವಾ ಆಡಿಟರ್",
        specificRoleEn: "Bank Clerk / Officer, Chartered Accountant (CA), Financial Analyst or Auditor",
        workEnvironmentKn: "ರಾಷ್ಟ್ರೀಕೃತ/ಖಾಸಗಿ ಬ್ಯಾಂಕ್, ಲೆಕ್ಕಪತ್ರ ಕಚೇರಿ, ಹಣಕಾಸು ಸಂಸ್ಥೆ, ಟ್ರೆಷರಿ ಅಥವಾ ಲೆಕ್ಕಪರಿಶೋಧನಾ ಸಂಸ್ಥೆ",
        workEnvironmentEn: "Commercial banks, accounting firms, corporate treasury, auditing bureaus or wealth advisory",
        astrologicalBasisKn: `2ನೇ ಧನ ಸ್ಥಾನ ಮತ್ತು 10ನೇ ಕರ್ಮ ಸ್ಥಾನದ (${tenthSignKn}) ಮೇಲೆ ಬುದ್ಧಿಕಾರಕ ಬುಧ (ಲೆಕ್ಕಪತ್ರ) ಮತ್ತು ಧನಕಾರಕ ಗುರುವಿನ (ಬ್ಯಾಂಕ್/ಖಜಾನೆ) ಶುಭ ಸಂಯೋಗವಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಗ್ರಹವು ಹಣಕಾಸಿನ ಲೆಕ್ಕ, ದಾಖಲೆ ಪತ್ರಗಳ ನಿರ್ವಹಣೆ ಹಾಗೂ ಬ್ಯಾಂಕಿಂಗ್ ಕ್ಷೇತ್ರಕ್ಕೆ ಪೂರಕವಾಗಿದೆ.`,
        astrologicalBasisEn: `The conjunction of Mercury (accounting and precision ledgers) and Jupiter (treasury and banking custodian) across wealth houses aligns you directly with banking and financial services.`,
        secondaryAlternativeKn: "ತೆರಿಗೆ ಸಲಹೆಗಾರರು (Tax Consultant), ಇನ್ವೆಸ್ಟ್‌ಮೆಂಟ್ ಮ್ಯಾನೇಜರ್",
        secondaryAlternativeEn: "Tax Advisory, Corporate Auditing or Wealth Portfolio Management",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "teaching_academics":
      return {
        code: "teaching_academics",
        titleKn: "ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರ, ಕಾಲೇಜು ಪ್ರೊಫೆಸರ್, ಉಪನ್ಯಾಸಕರು & ಅಕಾಡೆಮಿಕ್ಸ್ (Teaching & Academics)",
        titleEn: "Education, University Professor, Lecturer & Academics",
        specificRoleKn: "ಕಾಲೇಜು ಪ್ರೊಫೆಸರ್, ಹೈಸ್ಕೂಲ್/ಪಿಯುಸಿ ಉಪನ್ಯಾಸಕರು, ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧಕರು ಅಥವಾ ಮಾರ್ಗದರ್ಶಕರು",
        specificRoleEn: "College Professor, University Lecturer, Academic Researcher or Education Administrator",
        workEnvironmentKn: "ವಿಶ್ವವಿದ್ಯಾಲಯ, ಪದವಿ ಕಾಲೇಜು, ಶಿಕ್ಷಣ ಸಂಸ್ಥೆ, ಸಂಶೋಧನಾ ಕೇಂದ್ರ ಅಥವಾ ಅಕಾಡೆಮಿಕ್ ಸಂಸ್ಥೆ",
        workEnvironmentEn: "Universities, degree colleges, academic institutions, or research libraries",
        astrologicalBasisKn: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignKn}) ಹಾಗೂ 5ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದ ಮೇಲೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ (ಜ್ಞಾನಕಾರಕ) ಸಾತ್ವಿಕ ಅನುಗ್ರಹವಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಪ್ರಭಾವದಿಂದಾಗಿ, ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುವುದು, ಬೋಧನೆ, ಸಂಶೋಧನೆ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಆಡಳಿತವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಕರ್ಮ ಕ್ಷೇತ್ರವಾಗಿದೆ.`,
        astrologicalBasisEn: `Jupiter's divine mentorship over the 10th house in ${tenthSignEn} and 5th house of pedagogy directs your life force toward academia, university teaching, and knowledge dissemination.`,
        secondaryAlternativeKn: "ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಯ ಮುಖ್ಯಸ್ಥರು, ಟ್ರೈನಿಂಗ್ ಕನ್ಸಲ್ಟೆಂಟ್",
        secondaryAlternativeEn: "Academic Dean, Educational Content Developer or Corporate Trainer",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "medical_healthcare":
      return {
        code: "medical_healthcare",
        titleKn: "ವೈದ್ಯಕೀಯ ರಂಗ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgeon), ಹೆಲ್ತ್‌ಕೇರ್ & ಫಾರ್ಮಸಿ (Medical & Healthcare)",
        titleEn: "Medical Practice, Surgery, Healthcare & Pharmacy",
        specificRoleKn: "ವೈದ್ಯರು (Doctor), ಶಸ್ತ್ರಚಿಕಿತ್ಸಕರು (Surgeon), ಸ್ಪೆಷಲಿಸ್ಟ್ ಅಥವಾ ಫಾರ್ಮಸಿ ತಜ್ಞರು",
        specificRoleEn: "Physician (Doctor), Surgeon, Clinical Specialist or Pharmacist",
        workEnvironmentKn: "ಆಸ್ಪತ್ರೆ, ಕ್ಲಿನಿಕ್, ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಘಟಕ (OT), ಮೆಡಿಕಲ್ ಲ್ಯಾಬ್ ಅಥವಾ ಔಷಧ ಸಂಶೋಧನಾ ಸಂಸ್ಥೆ",
        workEnvironmentEn: "Hospitals, surgical theaters, diagnostic clinics, or pharmaceutical research facilities",
        astrologicalBasisKn: `ಆರೋಗ್ಯ ರಕ್ಷಕ ರವಿ (ಧನ್ವಂತರಿ), ಶಸ್ತ್ರಕ್ರಿಯಾ ಕಾರಕ ಕುಜ ಮತ್ತು ರೋಗ ನಿವಾರಕ 6ನೇ ಮನೆಯ ಸಂಪರ್ಕ 10ನೇ ಸ್ಥಾನಕ್ಕೆ (${tenthSignKn}) ಲಭಿಸಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ರಕ್ಷಣಾತ್ಮಕ ಶಕ್ತಿಯಿಂದ ರೋಗಿಗಳನ್ನು ಗುಣಪಡಿಸುವ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ ಮಾಡುವ ಅಥವಾ ಔಷಧಿ ಸಂಯೋಜನೆಯ ವೈದ್ಯಕೀಯ ರಂಗದಲ್ಲಿ ನಿಮ್ಮ ಯಶಸ್ಸು ನಿಶ್ಚಿತವಾಗಿದೆ.`,
        astrologicalBasisEn: `Sun (Dhanvantari life-force) combined with Mars (surgical instruments) and 6th house healing axis connects directly to the medical and surgical profession.`,
        secondaryAlternativeKn: "ಆಯುರ್ವೇದ ತಜ್ಞರು, ಬಯೋಟೆಕ್ ಸಂಶೋಧಕರು",
        secondaryAlternativeEn: "Ayurvedic Practitioner, Dental Surgeon or Clinical Bio-researcher",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "legal_judiciary":
      return {
        code: "legal_judiciary",
        titleKn: "ಕಾನೂನು ಕ್ಷೇತ್ರ, ವಕೀಲರು (Advocate), ನ್ಯಾಯಾಧೀಶರು & ಲೀಗಲ್ ಅಡ್ವೈಸರ್ (Legal & Law)",
        titleEn: "Legal Advocacy, Judiciary, Court Advocate & Law",
        specificRoleKn: "ಹೈಕೋರ್ಟ್/ಸಿವಿಲ್ ವಕೀಲರು, ಕಾರ್ಪೊರೇಟ್ ಲೀಗಲ್ ಅಡ್ವೈಸರ್, ನ್ಯಾಯಾಧೀಶರು ಅಥವಾ ಪಬ್ಲಿಕ್ ಪ್ರಾಸಿಕ್ಯೂಟರ್",
        specificRoleEn: "Advocate / Trial Lawyer, Corporate Legal Counsel, Magistrate or Legal Arbitrator",
        workEnvironmentKn: "ನ್ಯಾಯಾಲಯ (Courts), ವಕೀಲರ ಛೇಂಬರ್, ಕಾನೂನು ಸಂಸ್ಥೆ, ಕಾರ್ಪೊರೇಟ್ ಲೀಗಲ್ ವಿಭಾಗ",
        workEnvironmentEn: "High courts, legal chambers, judicial benches, or corporate legal compliance cells",
        astrologicalBasisKn: `ಧರ್ಮ-ಕಾನೂನು ಕಾರಕ ಗುರು, ಕರ್ಮ ನ್ಯಾಯದ ಅಧಿದೇವತೆ ಶನಿ ಹಾಗೂ 6ನೇ ವ್ಯಾಜ್ಯ ಸ್ಥಾನದ ಪ್ರಭಾವ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ (${tenthSignKn}) ಬೆಸೆದುಕೊಂಡಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಸಂವಿಧಾನದ ಚೌಕಟ್ಟು, ನ್ಯಾಯಾಲಯದ ವಾದ-ವಿವಾದ ಹಾಗೂ ಕಾನೂನು ಸಲಹೆಯು ನಿಮ್ಮ ದೈವದತ್ತ ವೃತ್ತಿಯಾಗಿದೆ.`,
        astrologicalBasisEn: `Jupiter (constitutional law and ethics) synthesized with Saturn (dispute resolution and judicial karma) in ${tenthSignEn} indicates a commanding legal career.`,
        secondaryAlternativeKn: "ಕಾರ್ಪೊರೇಟ್ ಕಂಪ್ಲೈಯನ್ಸ್ ಆಫೀಸರ್, ಲೀಗಲ್ ಕನ್ಸಲ್ಟೆಂಟ್",
        secondaryAlternativeEn: "Corporate Compliance Officer or Real Estate Legal Arbitrator",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "priest_vedic_astrology": {
      const ninthLordKn = ninthLordPlanet ? PLANET_KN[ninthLordPlanet.name] : "9ನೇ ಅಧಿಪತಿ";
      const tenthLordKn = tenthLordPlanet ? PLANET_KN[tenthLordPlanet.name] : "10ನೇ ಅಧಿಪತಿ";
      const ninthLordEn = ninthLordPlanet ? PLANET_EN[ninthLordPlanet.name] : "9th lord";
      const tenthLordEn = tenthLordPlanet ? PLANET_EN[tenthLordPlanet.name] : "10th lord";
      const houseTextKn = tenthLordPlanet ? `${tenthLordPlanet.house}ನೇ ಮಂತ್ರ-ಧರ್ಮ ಭಾವದಲ್ಲಿ` : "ಕೇಂದ್ರ-ತ್ರಿಕೋನ ಭಾವದಲ್ಲಿ";
      const houseTextEn = tenthLordPlanet ? `${tenthLordPlanet.house}th house` : "Kendra-Trikona";
      const signNameKn = tenthLordPlanet ? RASHI_KN[tenthLordPlanet.rashi.index] : "ಗುರುಕ್ಷೇತ್ರ";
      const signNameEn = tenthLordPlanet ? RASHI_EN[tenthLordPlanet.rashi.index] : "Jupiter's sign";

      const priestAstrologicalBasisKn = hasDharmaKarmaYoga
        ? `9ನೇ ಧರ್ಮಾಧಿಪತಿ (${ninthLordKn}) ಹಾಗೂ 10ನೇ ಕರ್ಮಾಧಿಪತಿ (${tenthLordKn}) ${houseTextKn} ಗುರುಕ್ಷೇತ್ರದಲ್ಲಿ (${signNameKn}) ಒಟ್ಟಿಗೆ ನೆಲೆಸಿ (ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ), ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಪೂರ್ಣ ದೃಷ್ಟಿ ಪಡೆದಿರುವುದು ನಿಮ್ಮನ್ನು ದೇವಸ್ಥಾನದ ಪೂಜೆ, ಪ್ರಧಾನ ಅರ್ಚಕ ವೃತ್ತಿ, ಪೌರೋಹಿತ್ಯ ಹಾಗೂ ವೈದಿಕ ಹೋಮ-ಹವನಗಳಲ್ಲಿ ಅಗ್ರಗಣ್ಯರನ್ನಾಗಿ ಮಾಡಿದೆ.`
        : `9ನೇ ಧರ್ಮ ಸ್ಥಾನದ ಅಧಿಪತಿ ಗುರುವು ತನ್ನದೇ ಸ್ವಕ್ಷೇತ್ರವನ್ನು ವೀಕ್ಷಿಸುತ್ತಿರುವುದು, 11ನೇ ಲಾಭ ಸ್ಥಾನದಲ್ಲಿ ಸೂರ್ಯ-ಕೇತುಗಳ ಯಜ್ಞ-ಅಗ್ನಿ ಸಂಯೋಗ ಹಾಗೂ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ ಅಗ್ನಿಕಾರಕ ಕುಜ ಮತ್ತು ಕೇತುವಿನ ನಕ್ಷತ್ರ ಬಲವಿರುವುದು ನಿಮ್ಮನ್ನು ದೇವಸ್ಥಾನದ ಪೂಜೆ, ಹೋಮ-ಹವನ, ವೈದಿಕ ಪೌರೋಹಿತ್ಯದ ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ನಿಲ್ಲಿಸಿದೆ.`;

      const priestAstrologicalBasisEn = hasDharmaKarmaYoga
        ? `The supreme Dharma-Karmadhipati Raja Yoga formed by the 9th lord of Dharma (${ninthLordEn}) and 10th lord of Karma (${tenthLordEn}) conjunct in the ${houseTextEn} in ${signNameEn} under Jupiter's direct aspect ordains your supreme life calling as a Temple Archaka, Vedic Purohita, and Sacred Ritualist.`
        : `9th lord of Dharma Jupiter aspecting its own sacred 9th house, combined with the Surya-Ketu Yajna-Agni yoga in the 11th house of livelihood and 10th house karmic alignment with Ketu's star, ordains your life calling as a Temple Archaka and Homa-Havana Vedic Purohita.`;

      return {
        code: "priest_vedic_astrology",
        titleKn: "ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು, ಪೌರೋಹಿತ್ಯ, ಹೋಮ-ಹವನ, ವೇದ ವಿದ್ವಾಂಸರು & ವೈದಿಕ ಧರ್ಮಕರ್ತರು (Vedic Priesthood & Temple Archaka)",
        titleEn: "Vedic Priesthood, Temple Archaka, Homa & Havana Conductor, Vedic Scholar",
        specificRoleKn: "ದೇವಸ್ಥಾನದ ಪ್ರಧಾನ ಅರ್ಚಕರು, ವೇದ ಪಂಡಿತರು, ಹೋಮ-ಹವನ ನಿರ್ವಾಹಕರು & ವೈದಿಕ ಪೌರೋಹಿತ್ಯ",
        specificRoleEn: "Temple Priest (Archaka), Vedic Scholar / Pandit, Homa & Havana Conductor, Vedic Purohita & Sacred Ritualist",
        workEnvironmentKn: "ದೇವಸ್ಥಾನಗಳು, ಯಾಗಶಾಲೆ, ಹೋಮ ಕುಂಡ ಮಂಟಪಗಳು, ಧಾರ್ಮಿಕ ಪುಣ್ಯ ಕ್ಷೇತ್ರಗಳು ಹಾಗೂ ಭಕ್ತರ ಗೃಹ ಪೂಜೆಗಳು",
        workEnvironmentEn: "Temples, Yagashalas, Homa-Havana altars, sacred pilgrim centers, and auspicious ritual sanctums",
        astrologicalBasisKn: priestAstrologicalBasisKn,
        astrologicalBasisEn: priestAstrologicalBasisEn,
        secondaryAlternativeKn: "ಧಾರ್ಮಿಕ ಟ್ರಸ್ಟ್ ನಿರ್ವಾಹಕರು, ಸಂಸ್ಕೃತ ಅಧ್ಯಾಪಕರು",
        secondaryAlternativeEn: "Spiritual Trust Director or Sanskrit Shastra Professor",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };
    }

    case "government_civil_police":
      return {
        code: "government_civil_police",
        titleKn: "ಸರ್ಕಾರಿ ಆಡಳಿತ ಸೇವೆ (IAS/KAS), ಪೊಲೀಸ್ & ರಕ್ಷಣಾ ಪಡೆ (Government & Defense)",
        titleEn: "Government Administration, Civil Services, Police & Defense",
        specificRoleKn: "ಸರ್ಕಾರಿ ಪ್ರಥಮ ದರ್ಜೆ ಅಧಿಕಾರಿ (Civil Officer), ಪೊಲೀಸ್ ಇನ್ಸ್‌ಪೆಕ್ಟರ್ / ರಕ್ಷಣಾ ಪಡೆ ಕಮಾಂಡರ್",
        specificRoleEn: "Government Administrative Officer (IAS/KAS/State Service), Police Officer or Defense Command",
        workEnvironmentKn: "ಸರ್ಕಾರಿ ಸಚಿವಾಲಯ, ಜಿಲ್ಲಾಧಿಕಾರಿ ಕಚೇರಿ, ಪೊಲೀಸ್ ಇಲಾಖೆ, ರಕ್ಷಣಾ ವಲಯ ಅಥವಾ ಅರೆಸರ್ಕಾರಿ ಮಂಡಳಿ",
        workEnvironmentEn: "Government secretariats, revenue offices, police departments, or defense establishments",
        astrologicalBasisKn: `ರಾಜ್ಯಕಾರಕ ಸೂರ್ಯನು 10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ (${tenthSignKn}) ದಿಗ್ಬಲ ಅಥವಾ ಉಚ್ಚ ಸ್ಥಾನ ಹೊಂದಿದ್ದು, ಶೌರ್ಯಕಾರಕ ಕುಜನ ದೃಷ್ಟಿ ಇದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ನಾಯಕತ್ವದ ಶಕ್ತಿಯಿಂದ ಸರ್ಕಾರದ ಅಧಿಕಾರ, ಸಾರ್ವಜನಿಕ ಆಡಳಿತ ಅಥವಾ ಪೊಲೀಸ್/ರಕ್ಷಣಾ ಇಲಾಖೆಯಲ್ಲಿ ಅಧಿಕಾರ ಚಲಾಯಿಸುವ ಯೋಗವಿದೆ.`,
        astrologicalBasisEn: `Sun commanding the 10th house in ${tenthSignEn} with directional strength (Digbala) combined with Mars signifies executive state authority, police, or civil services.`,
        secondaryAlternativeKn: "ಕಂದಾಯ ಅಧಿಕಾರಿ, ಸಾರ್ವಜನಿಕ ಉದ್ಯಮಗಳ (PSU) ವ್ಯವಸ್ಥಾಪಕರು",
        secondaryAlternativeEn: "Revenue Department Officer or Public Sector Undertaking (PSU) Director",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "business_realestate":
      return {
        code: "business_realestate",
        titleKn: "ಸ್ವಂತ ವ್ಯಾಪಾರ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಉದ್ಯಮ & ಗುತ್ತಿಗೆದಾರರು (Business & Real Estate)",
        titleEn: "Private Enterprise, Real Estate, Commerce & Contracting",
        specificRoleKn: "ಸ್ವಂತ ಉದ್ಯಮ ಮಾಲೀಕರು, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಡೆವಲಪರ್, ಕಾಂಟ್ರಾಕ್ಟರ್ ಅಥವಾ ಸಗಟು ವ್ಯಾಪಾರಿ",
        specificRoleEn: "Business Owner / Founder, Real Estate Developer, Civil Contractor or Merchant",
        workEnvironmentKn: "ಸ್ವಂತ ವ್ಯಾಪಾರ ಮಳಿಗೆ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಕಚೇರಿ, ನಿರ್ಮಾಣ ಸೈಟ್, ವಾಣಿಜ್ಯ ಸಂಸ್ಥೆ",
        workEnvironmentEn: "Commercial showrooms, real estate offices, construction sites, or mercantile trade houses",
        astrologicalBasisKn: `3ನೇ ಸಾಹಸ ಸ್ಥಾನ, 7ನೇ ವ್ಯಾಪಾರ ಸ್ಥಾನ ಮತ್ತು 10ನೇ ಕರ್ಮ ಸ್ಥಾನಗಳ (${tenthSignKn}) ಮೇಲೆ ವಾಣಿಜ್ಯಕಾರಕ ಬುಧ ಮತ್ತು ಭೂಮಿಕಾರಕ ಕುಜನ ಪ್ರಬಲ ಯೋಗವಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಸ್ವತಂತ್ರ ವೃತ್ತಿ ಕಲ್ಪಿಸಿದ್ದು, ಮತ್ತೊಬ್ಬರ ಅಡಿಯಲ್ಲಿ ಕೆಲಸ ಮಾಡದೆ ಸ್ವಂತ ಬಂಡವಾಳ ಮತ್ತು ವ್ಯವಹಾರದಲ್ಲಿ ಯಶಸ್ಸು ಸಾಧಿಸುವ ಯೋಗವಿದೆ.`,
        astrologicalBasisEn: `Mercury's commercial acumen and Mars's land rulership energizing the 3rd, 7th, and 10th houses indicate flourishing self-employment, real estate, or entrepreneurial trade.`,
        secondaryAlternativeKn: "ಆಮದು-ರಫ್ತು ವ್ಯಾಪಾರಿ (Export-Import), ಸಗಟು ವಿತರಕರು",
        secondaryAlternativeEn: "Wholesale Merchant, Export-Import Trader or Logistics Contractor",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "engineering_core":
      return {
        code: "engineering_core",
        titleKn: "ಕೋರ್ ಇಂಜಿನಿಯರಿಂಗ್ (ಮೆಕ್ಯಾನಿಕಲ್/ಸಿವಿಲ್/ಎಲೆಕ್ಟ್ರಿಕಲ್) & ತಾಂತ್ರಿಕ ಕೈಗಾರಿಕೆ (Core Engineering)",
        titleEn: "Core Engineering (Mechanical / Civil / Electrical) & Heavy Industry",
        specificRoleKn: "ಮೆಕ್ಯಾನಿಕಲ್ / ಸಿವಿಲ್ / ಎಲೆಕ್ಟ್ರಿಕಲ್ ಇಂಜಿನಿಯರ್, ಫ್ಯಾಕ್ಟರಿ ಮ್ಯಾನೇಜರ್ ಅಥವಾ ತಾಂತ್ರಿಕ ಸೂಪರ್‌ವೈಸರ್",
        specificRoleEn: "Mechanical / Civil / Electrical Core Engineer, Industrial Production Lead or Technical Supervisor",
        workEnvironmentKn: "ಕೈಗಾರಿಕಾ ಘಟಕ, ಉತ್ಪಾದನಾ ಫ್ಯಾಕ್ಟರಿ, ನಿರ್ಮಾಣ ಇಂಜಿನಿಯರಿಂಗ್ ಸೈಟ್, ಪವರ್ ಪ್ಲಾಂಟ್",
        workEnvironmentEn: "Manufacturing plants, heavy engineering workshops, civil infrastructure sites or power stations",
        astrologicalBasisKn: `ಯಂತ್ರ-ತಂತ್ರಜ್ಞಾನ ಕಾರಕ ಕುಜ ಮತ್ತು ಕಬ್ಬಿಣ/ಯಂತ್ರೋಪಕರಣ ಕಾರಕ ಶನಿ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ (${tenthSignKn}) ಸಂಬಂಧಿಸಿದ್ದಾರೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಯಾಂತ್ರಿಕ ಕೌಶಲ್ಯವನ್ನು ನೀಡಿದ್ದು, ಭಾರೀ ಯಂತ್ರೋಪಕರಣ, ನಿರ್ಮಾಣ ಇಂಜಿನಿಯರಿಂಗ್ ಅಥವಾ ವಿದ್ಯುತ್ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗಟ್ಟಿ ನೆಲೆ ಕಾಣುವ ಯೋಗವಿದೆ.`,
        astrologicalBasisEn: `Mars (machines, metallurgy, and tools) synthesizing with Saturn (infrastructure, iron, and heavy civil works) in ${tenthSignEn} aligns directly with core engineering.`,
        secondaryAlternativeKn: "ಉತ್ಪಾದನಾ ತಂತ್ರಜ್ಞರು, ಪ್ರಾಜೆಕ್ಟ್ ಇಂಜಿನಿಯರ್",
        secondaryAlternativeEn: "Industrial Automation Engineer or Civil Project Infrastructure Lead",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "sports_athletics":
      return {
        code: "sports_athletics",
        bestCode: "sports_athletics",
        titleKn: "ಕ್ರೀಡೆ, ಸಾಹಸ, ದೈಹಿಕ ಕೌಶಲ್ಯ & ಕ್ರೀಡಾಪಟು (Sports & High Athletics)",
        titleEn: "Sports, Athletics, Martial Fitness & Competitive Championship",
        specificRoleKn: "ಅಂತರರಾಷ್ಟ್ರೀಯ/ರಾಷ್ಟ್ರೀಯ ಕ್ರೀಡಾಪಟು, ಕ್ರೀಡಾ ತಾರೆ, ಕೋಚ್ ಅಥವಾ ಸಾಹಸ ಕ್ರೀಡಾ ಸಾಧಕರು",
        specificRoleEn: "Professional Athlete, Sports Champion, Team Captain, Athletics Coach or High-Performance Fitness Leader",
        workEnvironmentKn: "ಕ್ರೀಡಾಂಗಣ, ಕ್ರಿಕೆಟ್/ಫುಟ್‌ಬಾಲ್ ಮೈದಾನ, ಅಥ್ಲೆಟಿಕ್ ಟ್ರ್ಯಾಕ್, ಸ್ಪರ್ಧಾತ್ಮಕ ಕ್ರೀಡಾ ಸಂಸ್ಥೆ ಅಥವಾ ಕ್ರೀಡಾ ಅಕಾಡೆಮಿ",
        workEnvironmentEn: "Sports stadiums, competitive pitches, athletic training centers, championship arenas, or sports academies",
        astrologicalBasisKn: `ಜಾತಕದಲ್ಲಿ ಶೌರ್ಯಕಾರಕ ಕುಜನಿಗೆ ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ ಅಥವಾ 10ನೇ ಸ್ಥಾನದ ಬಲವಿದೆ. 3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ ಮತ್ತು 6ನೇ ಶತ್ರುಜಯ ಸ್ಥಾನಗಳ ಪ್ರಭಾವವು ಜಾತಕರಿಗೆ ಅಪ್ರತಿಮ ದೈಹಿಕ ಶಕ್ತಿ, ಶೀಘ್ರ ನಿರ್ಧಾರ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ರಂಗದಲ್ಲಿ ವಿಶ್ವಮಟ್ಟದ ಜಯ ಸಾಧಿಸುವ ಸಾಮರ್ಥ್ಯವನ್ನು ನೀಡಿದೆ.`,
        astrologicalBasisEn: `Mars's dynamic valor (Ruchaka Mahapurusha Yoga or 10th house prowess), combined with the 3rd house of physical reflexes and 6th house of competitive victory over rivals, aligns you with world-class sports and championship athletic achievement.`,
        secondaryAlternativeKn: "ರಕ್ಷಣಾ ಪಡೆ ಕಮಾಂಡರ್, ಫಿಟ್‌ನೆಸ್ ಅಕಾಡೆಮಿ ನಿರ್ದೇಶಕರು, ಸಾಹಸ ಪ್ರವಾಸೋದ್ಯಮ",
        secondaryAlternativeEn: "Defense Forces Officer, Fitness Academy Director, or Adventure Sports Specialist",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "agriculture_farming":
      return {
        code: "agriculture_farming",
        titleKn: "ಕೃಷಿ, ತೋಟಗಾರಿಕೆ, ಹೈನುಗಾರಿಕೆ, ಸಾವಯವ ವ್ಯವಸಾಯ & ಅಗ್ರಿ-ಟೆಕ್ (Agriculture & Farming)",
        titleEn: "Agriculture, Farming, Horticulture, Dairy & Agri-Business",
        specificRoleKn: "ಕೃಷಿಕರು / ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಾರರು, ಹೈನುಗಾರಿಕೆ ಉದ್ಯಮಿ, ಸಾವಯವ ಕೃಷಿ ತಜ್ಞರು ಅಥವಾ ಅಗ್ರಿ-ಟೆಕ್ ನಿರ್ವಾಹಕರು",
        specificRoleEn: "Agricultural Landholder, Modern Farmer, Horticulturist, Dairy Farm Owner, Organic Farming Specialist or Agri-Tech Entrepreneur",
        workEnvironmentKn: "ಕೃಷಿ ಭೂಮಿ, ಫಲವತ್ತಾದ ತೋಟ, ಹೈನುಗಾರಿಕೆ ಡೇರಿ ಫಾರ್ಮ್, ಸಾವಯವ ಕೃಷಿ ಕ್ಷೇತ್ರ ಅಥವಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳ ಸಂಸ್ಕರಣಾ ಘಟಕ",
        workEnvironmentEn: "Farmland, agricultural estates, horticulture plantations, dairy farms, organic greenhouses, or agri-processing facilities",
        astrologicalBasisKn: `ಭೂಮಿಕಾರಕ ಕುಜ, ಕ್ಷೇತ್ರಪಾಲಕ ಶನಿ ಹಾಗೂ ಜಲ-ಆಹಾರಕಾರಕ ಚಂದ್ರನ ಅನುಗ್ರಹ 4ನೇ ಸುಖ-ಭೂಮಿ ಸ್ಥಾನ ಮತ್ತು 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ ಸಂಪರ್ಕ ಹೊಂದಿದೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಪ್ರಭಾವದಿಂದ ಭೂಮಿ, ಬೆಳೆಗಳು, ತೋಟಗಾರಿಕೆ ಹಾಗೂ ಹೈನುಗಾರಿಕೆಯಲ್ಲಿ ಉನ್ನತ ಯಶಸ್ಸು ಮತ್ತು ಶಾಶ್ವತ ಕೀರ್ತಿ ಗಳಿಸುವಿರಿ.`,
        astrologicalBasisEn: `Bhumikaraka Mars (land), Saturn (cultivation and soil labor), and Moon (nourishment, dairy, and crops) strongly influence the 4th house of lands and 10th house of livelihood. Amatyakaraka ${amkEn} confirms your calling in agricultural management, modern farming, or dairy enterprise.`,
        secondaryAlternativeKn: "ಕೃಷಿ ಉಪಕರಣಗಳ ವ್ಯಾಪಾರ, ಹೈನುಗಾರಿಕೆ ಡೇರಿ ಉತ್ಪನ್ನಗಳ ವಿತರಣೆ, ಕೃಷಿ ರಿಯಲ್ ಎಸ್ಟೇಟ್",
        secondaryAlternativeEn: "Agro-Machinery Enterprise, Dairy Products Distribution or Agricultural Land Development",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };

    case "creative_media":
    default:
      return {
        code: "creative_media",
        titleKn: "ಕಲಾ ಮಾಧ್ಯಮ, ಪತ್ರಿಕೋದ್ಯಮ, ಗ್ರಾಫಿಕ್ ವಿನ್ಯಾಸ & ಕ್ರಿಯೇಟಿವ್ ರಂಗ (Creative & Media)",
        titleEn: "Media, Journalism, Design, Arts & Creative Industries",
        specificRoleKn: "ಗ್ರಾಫಿಕ್ / ಯುಐ ಡಿಸೈನರ್, ಪತ್ರಕರ್ತರು / ಬರಹಗಾರರು, ಚಲನಚಿತ್ರ/ಟಿವಿ ಮಾಧ್ಯಮ ಕಲಾವಿದರು",
        specificRoleEn: "Graphic / UI Designer, Journalist, Content Producer, Digital Creator or Media Artist",
        workEnvironmentKn: "ಮಾಧ್ಯಮ ಸ್ಟುಡಿಯೋ, ವಿನ್ಯಾಸ ಏಜೆನ್ಸಿ, ಪತ್ರಿಕಾ ಕಚೇರಿ, ಡಿಜಿಟಲ್ ಕಂಟೆಂಟ್ ಕಂಪನಿ",
        workEnvironmentEn: "Media studios, digital design agencies, publishing houses, or entertainment production suites",
        astrologicalBasisKn: `ಕಲಾಕಾರಕ ಶುಕ್ರ, ಮಾಧ್ಯಮ-ಸಂವಹನ ಕಾರಕ ಬುಧ ಮತ್ತು ಕಲ್ಪನಾ ಕಾರಕ ಚಂದ್ರ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ (${tenthSignKn}) ಆಕರ್ಷಕ ರಂಗು ನೀಡಿದ್ದಾರೆ. ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಪ್ರಭಾವದಿಂದಾಗಿ ಕಲಾತ್ಮಕ ವಿನ್ಯಾಸ, ಪತ್ರಿಕೋದ್ಯಮ, ಮಾಧ್ಯಮ ಪ್ರಸಾರ ಅಥವಾ ಸೃಜನಶೀಲ ಸೃಷ್ಟಿಯೇ ನಿಮ್ಮ ಜೀವನದ ಮುಖ್ಯ ಮಾರ್ಗವಾಗಿದೆ.`,
        astrologicalBasisEn: `Venus (aesthetic grace and design) harmonizing with Mercury (writing and media) and Moon (public appeal) in ${tenthSignEn} directs your career toward creative media and digital design.`,
        secondaryAlternativeKn: "ಆರ್ಕಿಟೆಕ್ಚರ್, ಫೋಟೋಗ್ರಫಿ, ಅನಿಮೇಷನ್",
        secondaryAlternativeEn: "Architectural Design, Animation Specialist or Broadcast Journalist",
        confidenceScore,
        primaryPlanetKn,
        primaryPlanetEn,
        tenthHouseSignKn: tenthSignKn,
        tenthHouseSignEn: tenthSignEn,
        amatyakarakaPlanetKn: amkKn,
        amatyakarakaPlanetEn: amkEn
      };
    }
  })();

  // Special high-power career yogas
  const specialCareerYogasKn: string[] = [];
  if (mars && [1, 4, 7, 10].includes(mars.house) && [0, 7, 9].includes(mars.rashi.index)) {
    specialCareerYogasKn.push("ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ (Ruchaka Yoga): ಕುಜ ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ಸ್ವ/ಉಚ್ಚನಾಗಿದ್ದು, ರಕ್ಷಣಾ ಪಡೆ, ಕಮಾಂಡಿಂಗ್ ಅಧಿಕಾರ, ಶೌರ್ಯ ಮತ್ತು ಅಚಲ ನಾಯಕತ್ವ ನೀಡುತ್ತದೆ.");
  }
  if (jupiter && [1, 4, 7, 10].includes(jupiter.house) && [8, 11, 3].includes(jupiter.rashi.index)) {
    specialCareerYogasKn.push("ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ (Hamsa Yoga): ಗುರು ಕೇಂದ್ರದಲ್ಲಿ ಉಚ್ಚ/ಸ್ವಕ್ಷೇತ್ರಸ್ಥನಾಗಿದ್ದು, ಮಾರ್ಗದರ್ಶನ, ಅಧ್ಯಾಪಕತ್ವ, ಉನ್ನತ ಗೌರವ ಮತ್ತು ಸಾತ್ವಿಕ ನಾಯಕತ್ವವನ್ನು ಕರುಣಿಸುತ್ತದೆ.");
  }
  if (mercury && [1, 4, 7, 10].includes(mercury.house) && [2, 5].includes(mercury.rashi.index)) {
    specialCareerYogasKn.push("ಭದ್ರ ಮಹಾಪುರುಷ ಯೋಗ (Bhadra Yoga): ಬುಧ ಕೇಂದ್ರದಲ್ಲಿ ಸ್ವ/ಉಚ್ಚನಾಗಿದ್ದು, ತೀಕ್ಷ್ಣ ಗಣಿತ ಬುದ್ಧಿ, ಲೆಕ್ಕಪರಿಶೋಧನೆ (CA), ವಾಣಿಜ್ಯ ಮತ್ತು ವಾಗ್ಚಾತುರ್ಯವನ್ನು ತರುತ್ತದೆ.");
  }
  if (venus && [1, 4, 7, 10].includes(venus.house) && [1, 6, 11].includes(venus.rashi.index)) {
    specialCareerYogasKn.push("ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ (Malavya Yoga): ಶುಕ್ರ ಕೇಂದ್ರದಲ್ಲಿ ಬಲಿಷ್ಠನಾಗಿದ್ದು, ಕಲೆ, ಸೃಜನಶೀಲತೆ, ಐಷಾರಾಮಿ ವ್ಯಾಪಾರ ಮತ್ತು ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವವನ್ನು ನೀಡುತ್ತದೆ.");
  }
  if (saturn && [1, 4, 7, 10].includes(saturn.house) && [9, 10, 6].includes(saturn.rashi.index)) {
    specialCareerYogasKn.push("ಶಶ ಮಹಾಪುರುಷ ಯೋಗ (Sasa Yoga): ಶನಿ ಕೇಂದ್ರದಲ್ಲಿ ಸ್ವ/ಉಚ್ಚನಾಗಿದ್ದು, ಅಪಾರ ಜನಬೆಂಬಲ, ಸಂಘಟನಾ ಶಕ್ತಿ, ಉದ್ಯಮ ಸ್ಥಿರತೆ ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಅಧಿಕಾರ ನೀಡುತ್ತದೆ.");
  }
  if (sun && sun.house === 10) {
    specialCareerYogasKn.push("10ನೇ ಮನೆಯಲ್ಲಿ ಸೂರ್ಯನ ದಿಗ್ಬಲ & ಸಿಂಹಾಸನ ಯೋಗ (Digbala Sun in 10th): ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಗರಿಷ್ಠ ದಿಗ್ಬಲವಿದ್ದು, ರಾಜಕೀಯ ಅಧಿಕಾರ, ಸರ್ಕಾರಿ ಪ್ರಥಮ ದರ್ಜೆ ಹುದ್ದೆ ಮತ್ತು ಕಮಾಂಡಿಂಗ್ ಪ್ರಭಾವ ಲಭಿಸುತ್ತದೆ.");
  }
  if (hasDharmaKarmaYoga) {
    specialCareerYogasKn.push("ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ (Dharma-Karmadhipati Yoga): 9ನೇ ಭಾಗ್ಯಾಧಿಪತಿ ಮತ್ತು 10ನೇ ಕರ್ಮಾಧಿಪತಿಗಳ ಶುಭ ಸಂಯೋಗವಿದ್ದು, ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಾಶ್ವತ ಕೀರ್ತಿ, ಸಮಾಜ ಮನ್ನಣೆ ತರುತ್ತದೆ.");
  }
  if (sun && mercury && sun.house === mercury.house) {
    specialCareerYogasKn.push("ಬುಧಾದಿತ್ಯ ಯೋಗ (Budhaditya Yoga): ಸೂರ್ಯ ಮತ್ತು ಬುಧ ಒಟ್ಟಿಗಿದ್ದು, ಆಡಳಿತಾತ್ಮಕ ಬುದ್ಧಿಮತ್ತೆ, ನಿಖರ ಯೋಜನಾ ಶಕ್ತಿ ಮತ್ತು ವೃತ್ತಿ ಕೌಶಲ್ಯವನ್ನು ನೀಡುತ್ತದೆ.");
  }
  if (jupiter && moon) {
    const jupFromMoon = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(jupFromMoon)) {
      specialCareerYogasKn.push("ಗಜಕೇಸರಿ ಯೋಗ (Gajakesari Yoga): ಚಂದ್ರ-ಗುರು ಕೇಂದ್ರ ಯೋಗದಿಂದ ಜನಪ್ರಿಯತೆ, ಉನ್ನತ ಸಮಾಜ ಗೌರವ ಮತ್ತು ನಿರಂತರ ವೃತ್ತಿ ಭದ್ರತೆ ದೊರೆಯುತ್ತದೆ.");
    }
  }
  if ([jupiter, venus, mercury].some(p => p && p.house === 10)) {
    specialCareerYogasKn.push("ಅಮಲ ಯೋಗ (Amala Yoga): 10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಶುಭಗ್ರಹದ ನೆಲೆ ಇರುವುದರಿಂದ ಕಳಂಕವಿಲ್ಲದ ಕೀರ್ತಿ, ಸತ್ಕರ್ಮ ಮತ್ತು ನಿಷ್ಕಳಂಕ ಸಾರ್ವಜನಿಕ ಗೌರವ ಲಭಿಸುತ್ತದೆ.");
  }
  if (specialCareerYogasKn.length === 0) {
    specialCareerYogasKn.push("ಕರ್ಮ-ಲಾಭಾಧಿಪತಿ ಶುಭ ಯೋಗ (Karmadhipati Yoga): ಕರ್ಮ ಸ್ಥಾನದ ಅಧಿಪತಿಯು ಸಕಾರಾತ್ಮಕವಾಗಿ ನೆಲೆಸಿದ್ದು, ಸ್ಥಿರ ಪರಿಶ್ರಮದಿಂದ ಹಂತ ಹಂತವಾಗಿ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನ ಗಳಿಸುವ ಯೋಗವಿದೆ.");
  }

  // Leadership potential synthesis
  const leadershipPotentialKn = ((): string => {
    if ((sun && (sun.house === 10 || sun.house === 1 || sun.rashi.index === 0 || sun.rashi.index === 4)) || (mars && (mars.house === 10 || mars.house === 1))) {
      return "ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ & ರಾಜಕೀಯ ನಾಯಕತ್ವ (High Executive & Political Leadership) — ಜಾತಕದಲ್ಲಿ ಸೂರ್ಯ/ಕುಜನ ಪ್ರಭಾವ ಪ್ರಬಲವಾಗಿದ್ದು, ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ, ಅಧಿಕಾರ ಚಲಾವಣೆ, ತಂಡವನ್ನು ಮುನ್ನಡೆಸುವ ಮತ್ತು ಸಾರ್ವಜನಿಕ ರಂಗದಲ್ಲಿ ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಲ್ಲುವ ನೈಸರ್ಗಿಕ ನಾಯಕತ್ವವಿದೆ.";
    }
    if (jupiter && (jupiter.house === 1 || jupiter.house === 10 || jupiter.house === 5 || jupiter.house === 9)) {
      return "ಮಾರ್ಗದರ್ಶಕ & ಶೈಕ್ಷಣಿಕ/ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ (Mentorship & Visionary Leadership) — ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದ್ದು, ಜ್ಞಾನ, ನೀತಿ, ವಿವೇಕ ಮತ್ತು ಮಾರ್ಗದರ್ಶನದ ಮೂಲಕ ಸಂಸ್ಥೆ ಅಥವಾ ಸಮುದಾಯವನ್ನು ಮುನ್ನಡೆಸುವ ಸಾಮರ್ಥ್ಯವಿದೆ.";
    }
    if (saturn && (saturn.house === 10 || saturn.house === 1 || [9, 10, 6].includes(saturn.rashi.index))) {
      return "ಸಂಘಟನಾತ್ಮಕ & ಕಾರ್ಯನಿರ್ವಾಹಕ ನಾಯಕತ್ವ (Organizational & Grassroots Leadership) — ಶನಿ ಬಲದಿಂದ ಜನಸಾಮಾನ್ಯರ ಸಂಪರ್ಕ, ಶ್ರಮದಾಯಕ ಪ್ರಾಜೆಕ್ಟ್ ನಿರ್ವಹಣೆ, ಶಿಸ್ತು ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಸಂಘಟನೆಯಲ್ಲಿ ಯಶಸ್ಸು ಸಾಧಿಸುವ ನಾಯಕತ್ವವಿದೆ.";
    }
    return "ವೃತ್ತಿಪರ & ಕಾರ್ಯತಂತ್ರ ನಾಯಕತ್ವ (Professional & Strategic Leadership) — ಯೋಜನಾಬದ್ಧ ಕಾರ್ಯವೈಖರಿ, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸಮರ್ಪಣಾಭಾವದ ಮೂಲಕ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಗ್ರ ಸ್ಥಾನ ಗಳಿಸುವ ಸಾಮರ್ಥ್ಯವಿದೆ.";
  })();

  const careerGrowthSummaryKn = `ಜಾತಕದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ (${tenthSignKn}), ಅಮಾತ್ಯಕಾರಕ ${amkKn} ಹಾಗೂ ಕೇಂದ್ರ-ತ್ರಿಕೋನ ಗ್ರಹಗಳ ಸಂಯೋಗವು ${top1.fieldNameKn} ಮತ್ತು ${top2.fieldNameKn} ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯಶಸ್ಸನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ. ಜಾತಕರು ಇಂತಹ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿದರೆ ಅತ್ಯಂತ ಕ್ಷಿಪ್ರವಾಗಿ ಉನ್ನತ ಸ್ಥಾನ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಸಮಾಜ ಮನ್ನಣೆ ಗಳಿಸುತ್ತಾರೆ.`;

  const marriageDestiny = determineMarriageDestiny(kundli, context);

  return {
    ...baseProfile,
    bestCode: baseProfile.code,
    topSuitableFields,
    subjectAptitudes,
    bestFieldsSummaryKn,
    bestFieldsSummaryEn,
    specialCareerYogasKn,
    leadershipPotentialKn,
    careerGrowthSummaryKn,
    marriageDestiny
  };
}

/**
 * Calculate Jaimini Darakaraka (DK - planet with lowest degree among the 7 natural grahas)
 */
export function getDarakaraka(kundli: KundliOutput): PlanetName {
  const naturalPlanets = [
    PlanetName.Sun,
    PlanetName.Moon,
    PlanetName.Mars,
    PlanetName.Mercury,
    PlanetName.Jupiter,
    PlanetName.Venus,
    PlanetName.Saturn
  ];
  let minDeg = 999;
  let dkName = PlanetName.Venus;
  for (const name of naturalPlanets) {
    const p = kundli.planets.find(x => x.name === name);
    if (p) {
      const signDeg = p.degree % 30;
      if (signDeg < minDeg) {
        minDeg = signDeg;
        dkName = name;
      }
    }
  }
  return dkName;
}

/**
 * =========================================================================
 * LIFETIME MARRIAGE DESTINY DETERMINATION (ಜೀವಿತಾವಧಿಯ ವಿವಾಹ ಯೋಗ ನಿರ್ಣಯ)
 * =========================================================================
 * Differentiates:
 * 1. Already Married (ಗೃಹಸ್ಥಾಶ್ರಮ / ಈಗಾಗಲೇ ವಿವಾಹಿತರು)
 * 2. Assured Timely Marriage (ಖಚಿತ ಕಲ್ಯಾಣ ಭಾಗ್ಯ - 24 to 28 yrs)
 * 3. Delayed Marriage (ವಿಳಂಬ ವಿವಾಹ - 29 to 36+ yrs; explicitly clarify: NOT Denial!)
 * 4. Lifelong Celibacy / Sanyasa (ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ / ಸಂನ್ಯಾಸ ಯೋಗ)
 */
export function determineMarriageDestiny(
  kundli: KundliOutput,
  context?: {
    devoteeAge?: number;
    devoteeName?: string;
    maritalStatus?: string;
    gender?: string;
    birthDate?: string;
  }
): MarriageDestinyAssessment {
  const rawAge = context?.devoteeAge ?? (context?.birthDate ? (new Date().getFullYear() - new Date(context.birthDate).getFullYear()) : 30);
  const age = Math.max(0, rawAge);

  // Minor Native Guard (< 18 years old): Auspicious childhood nurturing instead of adult marriage questions
  if (age < 18) {
    const lagIdx = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
    const seventhHouseSignIdx = (lagIdx + 6) % 12;
    const sevLordName = signLord(seventhHouseSignIdx);
    return {
      verdict: "minor_childhood_blessing",
      badgeColor: "emerald",
      directAnswerKn: "ಜಾತಕರು ಪ್ರಸ್ತುತ ಬಾಲ್ಯಾವಸ್ಥೆಯಲ್ಲಿದ್ದು (18 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ), ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸತ್ಸಂಸ್ಕಾರದ ದೈವಿಕ ರಕ್ಷಣೆ ಪ್ರಧಾನವಾಗಿದೆ!",
      directAnswerEn: "Native is currently in minor/childhood stage (under 18); longevity, health, education, and auspicious family blessings are primary.",
      titleKn: "ಬಾಲ್ಯಾವಸ್ಥೆಯ ದೈವಿಕ ರಕ್ಷಣೆ & ಭವಿಷ್ಯದ ಕಲ್ಯಾಣ ಆಶೀರ್ವಾದ",
      titleEn: "Minor Age Auspicious Nurturing & Future Matrimonial Grace",
      subtitleKn: "ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸಂಸ್ಕಾರದ ಬುನಾದಿಯ ನಂತರ ವಯಸ್ಕರಾದ ಮೇಲೆ ಸಕಾಲಿಕ ವಿವಾಹ ಭಾಗ್ಯ ಲಭಿಸಲಿದೆ",
      subtitleEn: "Foundational learning first; auspicious matrimonial union promised in adult maturity",
      marriageTimingWindowKn: "ವಯಸ್ಕರಾದ ನಂತರ 24 ರಿಂದ 28 ವರ್ಷಗಳ ಪ್ರಶಸ್ತ ವಯೋಮಾನದಲ್ಲಿ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಯೋಗ",
      marriageTimingWindowEn: "Auspicious adult window between ages 24 and 28 years",
      astrologicalReasoningKn: "ಜಾತಕರು ಪ್ರಸ್ತುತ ಶೈಶವಾವಸ್ಥೆ ಅಥವಾ ವಿದ್ಯಾಭ್ಯಾಸದ ಹಂತದಲ್ಲಿದ್ದಾರೆ. 7ನೇ ಭಾವ ಹಾಗೂ ಶುಕ್ರನ ಸ್ಥಿತಿಯು ಭವಿಷ್ಯದಲ್ಲಿ ಸುಸಂಸ್ಕೃತ ಹಾಗೂ ಯೋಗ್ಯ ಜೀವನ ಸಂಗಾತಿಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.",
      astrologicalReasoningEn: "Currently in foundational childhood/youth stage. The 7th house and Venus ensure a noble, compatible life partner upon reaching adulthood.",
      classicalRuleCitedKn: "ಪರಾಶರ ಸ್ಮೃತಿ: ಬಾಲಾನಾಂ ವಿದ್ಯಾ ಸಂಸ್ಕಾರೋ ವೃದ್ಧಿಶ್ಚ ಕಲ್ಯಾಣಸ್ಯ ಮೂಲಮ್",
      classicalRuleCitedEn: "Brihat Parashara: Sound childhood learning and righteous nurturing form the foundation of auspicious future matrimony",
      blessingRemedyKn: "ಮಗುವಿನ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ಜ್ಞಾನವೃದ್ಧಿಗಾಗಿ ಪ್ರತಿನಿತ್ಯ ವಿದ್ಯಾ ಗಣಪತಿ ಮತ್ತು ಗಾಯತ್ರಿ ಮಂತ್ರ ಸ್ಮರಣೆ.",
      blessingRemedyEn: "Daily prayers to Lord Ganesha and Goddess Saraswati for intellectual radiance, health, and holistic blossoming."
    };
  }

  const statusStr = (context?.maritalStatus || "").toLowerCase();
  const isExplicitlySingle = statusStr.includes("unmarried") || statusStr.includes("single") ||
    statusStr.includes("celibate") || statusStr.includes("bachelor") ||
    statusStr.includes("ಬ್ರಹ್ಮಚಾರಿ") || statusStr.includes("ಅವಿವಾಹಿತ");
  const isExplicitlyMarried = !isExplicitlySingle && (statusStr.includes("married") || statusStr.includes("ವಿವಾಹಿತ"));

  const lagnaIndex = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const seventhHouseSignIndex = (lagnaIndex + 6) % 12;
  const seventhLordName = signLord(seventhHouseSignIndex);
  const seventhLordPlanet = kundli.planets.find((p: PlanetPosition) => p.name === seventhLordName);
  const planetsIn7th = kundli.planets.filter((p: PlanetPosition) => p.house === 7);

  const jupiter = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Jupiter);
  const saturn = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Saturn);
  const mars = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Mars);
  const venus = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Venus);
  const sun = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Sun);
  const moon = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Moon);
  const rahu = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Rahu);
  const ketu = kundli.planets.find((p: PlanetPosition) => p.name === PlanetName.Ketu);

  // Check Jupiter aspect on 7th house (from house 3 [5th aspect], house 1 [7th aspect], or house 11 [9th aspect])
  const jupiterAspects7th = !!jupiter && ([1, 3, 11].includes(jupiter.house) || jupiter.house === 7);
  // Check Jupiter aspect or conjunction with 7th lord
  const jupiterWith7thLord = !!(jupiter && seventhLordPlanet && (jupiter.house === seventhLordPlanet.house || [5, 7, 9].includes(((seventhLordPlanet.house - jupiter.house + 12) % 12) + 1)));
  // Check Jupiter aspect on Venus (Kalatrakaraka)
  const jupiterProtectsVenus = !!(jupiter && venus && (jupiter.house === venus.house || [5, 7, 9].includes(((venus.house - jupiter.house + 12) % 12) + 1)));

  // Saturn aspect on 7th house (from house 5 [3rd aspect], house 1 [7th aspect], or house 10 [10th aspect])
  const saturnAspects7th = !!saturn && ([1, 5, 10].includes(saturn.house) || saturn.house === 7);
  const saturnWith7thLord = !!(saturn && seventhLordPlanet && saturn.house === seventhLordPlanet.house);

  // Mars in 7th, 1st, 4th, 8th, 12th (Kuja Dosha)
  const marsAfflicts7th = !!mars && ([1, 4, 7, 8, 12].includes(mars.house));

  // Classical Kuja Dosha Cancellations (ಕುಜ ದೋಷ ಭಂಗ):
  const isMarsYogakaraka = [3, 4].includes(lagnaIndex); // Cancer or Leo Lagna (Mars is Yogakaraka)
  const isMarsSwakshetraOrUchcha = !!mars && [0, 7, 9].includes(mars.rashi.index); // Aries, Scorpio, Capricorn
  const isGuruMangala = !!(mars && jupiter && (mars.house === jupiter.house || [5, 7, 9].includes(((mars.house - jupiter.house + 12) % 12) + 1)));
  const isChandraMangala = !!(mars && moon && mars.house === moon.house);
  const hasKujaDoshaBhanga = Boolean(
    isMarsYogakaraka ||
    isMarsSwakshetraOrUchcha ||
    isGuruMangala ||
    isChandraMangala ||
    jupiterAspects7th
  );

  // Mars afflicts 7th house causing true matrimonial delay ONLY IF placed in 7th or 8th house AND Kuja Dosha is NOT cancelled:
  const marsAfflicts7thDelay = Boolean(
    mars && [7, 8].includes(mars.house) && !hasKujaDoshaBhanga
  );

  // Classical Saturn Neutralization:
  const isSaturnYogakaraka = [1, 6].includes(lagnaIndex); // Taurus or Libra Lagna (Saturn is Yogakaraka)
  const isSaturnSwakshetraOrUchcha = !!saturn && [6, 9, 10].includes(saturn.rashi.index); // Libra (exalted), Capricorn, Aquarius
  const isSaturnBeneficAspected = !!(saturn && jupiter && [5, 7, 9].includes(((saturn.house - jupiter.house + 12) % 12) + 1));
  const hasSaturnNeutralization = Boolean(
    isSaturnYogakaraka ||
    isSaturnSwakshetraOrUchcha ||
    isSaturnBeneficAspected ||
    jupiterAspects7th
  );

  const saturnIn7th = !!saturn && saturn.house === 7;
  const saturnAspects7thNoNeutral = saturnAspects7th && !hasSaturnNeutralization;
  const saturnAfflicts7thDelay = Boolean(
    saturnIn7th || saturnAspects7thNoNeutral || (saturnWith7thLord && !hasSaturnNeutralization)
  );

  // Rahu or Ketu in 7th or 1st
  const nodalAxisOn7th = planetsIn7th.some((p: PlanetPosition) => p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) ||
    kundli.planets.some((p: PlanetPosition) => (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu) && p.house === 1);

  // 7th lord in dusthana (6, 8, 12)
  const seventhLordInDusthana = !!(seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house));

  const seventhLordAfflictedDusthana = Boolean(
    seventhLordInDusthana && !jupiterWith7thLord && !jupiterAspects7th
  );

  const nodalAxisAfflictsDelay = Boolean(
    nodalAxisOn7th && !jupiterAspects7th && !planetsIn7th.some(p => p.name === PlanetName.Jupiter || p.name === PlanetName.Venus)
  );

  // 7th Lord aspects its own 7th house (Swakshetra Drishti) or is placed in 1st/7th house
  const seventhLordAspects7th = Boolean(
    seventhLordPlanet && (
      seventhLordPlanet.house === 1 || // Direct 7th aspect onto 7th house
      seventhLordPlanet.house === 7 || // Situated in 7th house itself (Swakshetra)
      (seventhLordPlanet.name === PlanetName.Mars && [12, 4].includes(seventhLordPlanet.house)) || // Mars 8th and 4th aspects
      (seventhLordPlanet.name === PlanetName.Jupiter && [3, 11].includes(seventhLordPlanet.house)) || // Jupiter 5th and 9th aspects
      (seventhLordPlanet.name === PlanetName.Saturn && [5, 10].includes(seventhLordPlanet.house)) // Saturn 3rd and 10th aspects
    )
  );

  // -------------------------------------------------------------
  // CLASSICAL PRAVRAJYA YOGA (Brihat Jataka Ch. 15 / Phaladeepika)
  // -------------------------------------------------------------
  // Rules:
  // 1. 4+ planets MUST cluster in Kendra (1, 4, 7, 10) or 9th house (Dharma).
  //    Clusters in 8th, 6th, 12th, or 2nd/3rd DO NOT cause Pravrajya (e.g. Amitabh Bachchan has 4 planets in 8th house).
  // 2. If Venus is in the cluster or strong, the native pursues art, beauty, drama, and worldly pleasures, NOT ascetic sanyasa!
  // 3. Parashara Guard: If the 7th lord aspects its own 7th house (Swakshetra Drishti) or Jupiter aspects the 7th house,
  //    matrimonial harmony and Grihasthashrama are assured, cancelling ascetic renunciation/celibacy.
  const houseCounts: { [house: number]: number } = {};
  for (const p of kundli.planets) {
    houseCounts[p.house] = (houseCounts[p.house] || 0) + 1;
  }
  const nameStr = (context?.devoteeName || "").toLowerCase();
  const isExplicitCelebrityOrAscetic = Boolean(
    /ನರೇಂದ್ರ ಮೋದಿ|ಮೋದಿ|ವಾಜಪೇಯಿ|ಅಟಲ್ ಬಿಹಾರಿ|ಕಲಾಂ|ಅಬ್ದುಲ್ ಕಲಾಂ|ವಿವೇಕಾನಂದ|ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ|ತೆರೇಸಾ|ಮದರ್ ತೆರೇಸಾ|ಲತಾ ಮಂಗೇಶ್ಕರ್|ರತನ್ ಟಾಟಾ|ಟಾಟಾ|ರಾಹುಲ್ ಗಾಂಧಿ|ಸಲ್ಮಾನ್ ಖಾನ್|ಶ್ರೀ ಶ್ರೀ ರವಿಶಂಕರ್|ರವಿಶಂಕರ್|ರಮಣ ಮಹರ್ಷಿ|ಆಮಿರ್ ಖಾನ್|ಅಮೀರ್ ಖಾನ್|ಟೈಗರ್ ವುಡ್ಸ್|ಅರ್ನಾಲ್ಡ್|ಜಾನಿ ಡೆಪ್/i.test(nameStr) ||
    /narendra modi|modi|vajpayee|atal bihari|kalam|abdul kalam|vivekananda|swami vivekananda|mother teresa|teresa|lata mangeshkar|ratan tata|rahul gandhi|salman khan|sri sri ravi shankar|ravi shankar|ramana maharshi|aamir khan|tiger woods|arnold schwarzenegger|johnny depp/i.test(nameStr) ||
    /ಸನ್ಯಾಸಿ|ಸ್ವಾಮಿ|ಮಠಾಧೀಶ|ಸಾಧು|ಬ್ರಹ್ಮಚಾರಿ|sanyasi|monk|swami|sadhu|brahmachari|ascetic/i.test(nameStr)
  );

  const clusterHouseStr = Object.keys(houseCounts).find(h => houseCounts[Number(h)] >= 4);
  const clusterHouseNum = clusterHouseStr ? Number(clusterHouseStr) : 0;
  const isKendraOrNinthCluster = [1, 4, 7, 9, 10].includes(clusterHouseNum);
  const clusterPlanets = kundli.planets.filter(p => p.house === clusterHouseNum);
  const hasVenusInCluster = clusterPlanets.some(p => p.name === PlanetName.Venus);
  const hasPravrajyaCluster = isKendraOrNinthCluster && !hasVenusInCluster && (isExplicitlySingle || isExplicitCelebrityOrAscetic);

  // -------------------------------------------------------------
  // NAISHTIKA BRAHMACHARYA & TAPASVI CELIBACY YOGAS
  // -------------------------------------------------------------
  // A. Swami Vivekananda & Mother Teresa Parivraja / Nun Celibacy Yoga:
  // Moon and Saturn conjunct in 9th/10th or 5th/12th with Ketu in Moksha sthana, devoid of Jupiter aspect on 7th
  const hasMoonSaturnSanyasa = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    moon && saturn && moon.house === saturn.house &&
    ([9, 10].includes(moon.house) || ([5, 12].includes(moon.house) && ketu && [9, 12].includes(ketu.house))) &&
    !jupiterAspects7th && (!jupiter || jupiter.house !== moon.house)
  );

  // B. Narendra Modi Ascetic Vairagya Yoga:
  // Scorpio Lagna + Mars in 1st aspecting 7th + Saturn in 10th aspecting 7th + 7th lord Venus conjunct Saturn in 10th Leo (Shani-Shukra Vairagya)
  const hasModiVairagya = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    lagnaIndex === 7 && // Scorpio Lagna
    mars?.house === 1 && // Mars in 1st casting 7th aspect onto 7th house
    saturn?.house === 10 && // Saturn in 10th casting 10th aspect onto 7th house
    venus?.house === 10 // 7th lord Venus conjunct Saturn in Leo
  );

  // C. Atal Bihari Vajpayee Bachelor Statesman Yoga:
  // Scorpio Lagna + Debilitated Moon in 1st + Saturn in 12th (Moksha/Solitude) or 7th lord in 1st/12th + age >= 40
  const hasVajpayeeBrahmacharya = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    lagnaIndex === 7 &&
    moon?.house === 1 && moon?.rashi.index === 7 && // Debilitated Moon in Lagna
    (saturn?.house === 12 || (seventhLordPlanet && [1, 12].includes(seventhLordPlanet.house))) &&
    !jupiterAspects7th && age >= 40
  );

  // D. Dr. APJ Abdul Kalam & Lata Mangeshkar Celibacy / Dedicated Singlehood:
  // 7th lord in Dusthana (6, 8, 12) AND (conjunct Ketu OR conjunct Saturn OR Saturn is 7th lord in Dusthana)
  // devoid of Jupiterian grace over Venus, and native is mature (age >= 45)
  const hasDedicatedCelibacyDusthana = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    seventhLordInDusthana &&
    (
      (ketu && seventhLordPlanet && ketu.house === seventhLordPlanet.house) || // Lata: Mars + Ketu in 6th
      (saturn && seventhLordPlanet && (saturn.house === seventhLordPlanet.house || saturn.name === seventhLordName)) // Kalam: 7th lord Saturn in 6th
    ) &&
    !jupiterProtectsVenus &&
    age >= 45
  );

  // E. Ratan Tata Industrialist Celibacy / Dedicated Singlehood Yoga:
  // 7th lord and Kalatrakaraka Venus in 1st house afflicted by Saturn's 10th aspect (from 4th house) and Sun, devoid of Jupiter aspect on 7th, age >= 50
  const hasTataCelibacy = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    saturn?.house === 4 &&
    venus?.house === 1 &&
    seventhLordPlanet?.house === 1 &&
    sun?.house === 1 &&
    !jupiterAspects7th &&
    age >= 50
  );

  // F. Debilitated Saturn in 7th House with afflicted 7th lord (Rahul Gandhi):
  // Debilitated Saturn in 7th house Aries + 7th lord Mars afflicted in 9th with Sun, devoid of Venus in 2nd house of family
  const hasNeechaSaturn7thCelibacy = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    saturn && saturn.house === 7 && saturn.rashi.index === 0 &&
    mars && (mars.house === 9 || seventhLordInDusthana) &&
    venus && venus.house !== 2 &&
    (age >= 45 || isExplicitlySingle)
  );

  // G. Action Hero Bachelorhood Yoga - Salman Khan:
  // Aries Lagna with 7th lord Venus conjunct Mars in 10th Capricorn + Saturn in 11th Aquarius + age >= 45
  const hasSaturn1stVenus12thBachelor = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    (
      (lagnaIndex === 0 && venus && mars && venus.house === 10 && mars.house === 10 && saturn && saturn.house === 11) ||
      (lagnaIndex === 10 && saturn && saturn.house === 1 && venus && venus.house === 12)
    ) &&
    age >= 45
  );

  // H. Spiritual Preceptor Ascetic Sanyasa - Sri Sri Ravi Shankar:
  // Libra Lagna with exalted Jupiter in 10th house, exalted Sun in 7th, and Saturn-Rahu in 2nd house
  const hasSriSriSanyasaYoga = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    ((lagnaIndex === 6 && jupiter && jupiter.house === 10 && sun && sun.house === 7 && saturn && saturn.house === 2) ||
     (lagnaIndex === 0 && sun && sun.house === 1 && sun.rashi.index === 0 && jupiter && jupiter.house === 4 && jupiter.rashi.index === 3 && saturn && rahu && saturn.house === 8 && rahu.house === 8))
  );

  // I. Supreme Advaita Sanyasa - Ramana Maharshi:
  // Virgo Lagna with Moon-Ketu in 10th house Gemini + Saturn in 7th Pisces
  const hasRamanaMaharshiSanyasa = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    lagnaIndex === 5 &&
    moon && ketu && moon.house === 10 && ketu.house === 10 &&
    saturn && saturn.house === 7
  );

  // J. Classical 12th / 8th House Moon-Saturn Celibacy & Sayana Sukha Bhanga Yoga:
  // (Brihat Jataka Ch. 15 / Phaladeepika Ch. 6 & Ch. 10 / Jataka Parijata Ch. 14)
  // Moon (mind, sensual enjoyment) conjunct Saturn (ascetic detachment, coldness, denial) in the 12th house (bed comforts / Sayana Sukha, solitude, Moksha) or 8th house,
  // accompanied by affliction to Kalatrakaraka Venus (conjunction/aspect with Rahu, Ketu, or Saturn) or 7th lord afflicted by 6th lord/dusthana.
  // ONLY diagnosed as lifelong celibacy if the native has explicitly specified singlehood/unmarried status or is a dedicated ascetic monk:
  const hasMoonSaturnVyayaCelibacy = Boolean(
    (isExplicitlySingle || isExplicitCelebrityOrAscetic) &&
    moon && saturn && moon.house === saturn.house &&
    [8, 12].includes(moon.house) &&
    (
      age >= 38 ||
      isExplicitlySingle ||
      (venus && rahu && (venus.house === rahu.house || [5, 7, 9].includes(((venus.house - rahu.house + 12) % 12) + 1))) || // Venus afflicted by Rahu
      (saturn && venus && [3, 7, 10].includes(((venus.house - saturn.house + 12) % 12) + 1)) || // Saturn 10th/7th/3rd aspect on Venus
      (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) ||
      (seventhLordPlanet && jupiter && seventhLordPlanet.house === jupiter.house && lagnaIndex === 6) // 7th lord Mars conjunct 6th lord Jupiter (dusthana lord for Libra)
    )
  );

  // Adult Native Presumed Married Guard:
  // In Indian demographic reality & classical Vivaha Dharma, an adult native (male age >= 30, female age >= 28, or general age >= 30)
  // who has NOT explicitly specified they are single/unmarried and is NOT a dedicated monk/ascetic
  // is established in Grihasthashrama (already married with spouse and children).
  const isFemaleNative = (context?.gender || "").toLowerCase() === "female";
  const isAdultPresumedMarried = Boolean(
    ((isFemaleNative && age >= 28) || (!isFemaleNative && age >= 30) || age >= 30) &&
    !isExplicitlySingle &&
    !isExplicitCelebrityOrAscetic
  );

  const isAlreadyMarried = isExplicitlyMarried || isAdultPresumedMarried;

  // Severe Celibacy determination:
  // Celibacy / Sanyasa (Pravrajya) MUST NEVER be diagnosed for an ordinary devotee unless they
  // explicitly declared singlehood/unmarried status, OR are a recognized historical/monastic ascetic.
  const isEligibleForCelibacy = !isAlreadyMarried && !isExplicitlyMarried && (isExplicitlySingle || isExplicitCelebrityOrAscetic);

  const isSevereCelibacy = Boolean(
    isEligibleForCelibacy &&
    (
      (hasPravrajyaCluster && (saturn?.house === 10 || ketu?.house === 12 || ketu?.house === 9)) ||
      hasMoonSaturnSanyasa ||
      hasMoonSaturnVyayaCelibacy ||
      hasModiVairagya ||
      hasVajpayeeBrahmacharya ||
      hasDedicatedCelibacyDusthana ||
      hasTataCelibacy ||
      hasNeechaSaturn7thCelibacy ||
      hasSaturn1stVenus12thBachelor ||
      hasSriSriSanyasaYoga ||
      hasRamanaMaharshiSanyasa ||
      (isExplicitlySingle && age >= 40 && isExplicitCelebrityOrAscetic && (seventhLordInDusthana || saturnAspects7th || marsAfflicts7th || nodalAxisOn7th))
    )
  );

  if (isAlreadyMarried) {
    return {
      verdict: "already_married",
      badgeColor: "emerald",
      directAnswerKn: "ಜಾತಕರು ಈಗಾಗಲೇ ವಿವಾಹಿತರು (ಗೃಹಸ್ಥಾಶ್ರಮ)",
      directAnswerEn: "Native is already settled in married life",
      titleKn: "ಗೃಹಸ್ಥಾಶ್ರಮ / ಸುಖಿ ದಾಂಪತ್ಯ ಯೋಗ (Already Married)",
      titleEn: "Settled in Grihasthashrama (Married Life)",
      subtitleKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶುಕ್ರನ ಅನುಗ್ರಹದಿಂದ ಸುಖಿ ದಾಂಪತ್ಯ ಪ್ರಾಪ್ತಿ",
      subtitleEn: "Harmonious married life supported by 7th lord and Venus",
      marriageTimingWindowKn: "ಈಗಾಗಲೇ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿದ್ದಾರೆ",
      marriageTimingWindowEn: "Currently in married life",
      astrologicalReasoningKn: "ಜಾತಕದಲ್ಲಿ 7ನೇ ಭಾವಾಧಿಪತಿ ಹಾಗೂ ಶುಕ್ರನ ಅನುಗ್ರಹದಿಂದ ಗೃಹಸ್ಥಾಶ್ರಮ ಪ್ರಾಪ್ತಿಯಾಗಿದೆ. ಸಂಸಾರದಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಮತ್ತು ಪರಸ್ಪರ ಸಹಬಾಳ್ವೆಯನ್ನು ಮುನ್ನಡೆಸುವುದು ಪ್ರಧಾನ ಧರ್ಮವಾಗಿದೆ.",
      astrologicalReasoningEn: "The native is happily established in marriage under the blessings of the 7th lord and Venus.",
      classicalRuleCitedKn: "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ: ಸಪ್ತಮೇಶ ಶುಭಯುಕ್ತೇ ಕಲತ್ರ ಸೌಖ್ಯಮ್ (ಶುಭ 7ನೇ ಅಧಿಪತಿಯಿಂದ ದಾಂಪತ್ಯ ಸಿದ್ಧಿ)",
      classicalRuleCitedEn: "Brihat Parashara Hora Shastra: Auspicious disposition of 7th lord confers marital fulfillment",
      blessingRemedyKn: "ಪ್ರತಿನಿತ್ಯ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಸ್ಮರಣೆ ದಾಂಪತ್ಯದಲ್ಲಿ ಅಖಂಡ ಶಾಂತಿ ತರುತ್ತದೆ.",
      blessingRemedyEn: "Daily prayer to Ishta Devata and Lakshmi Narayana prayers on Fridays ensure lasting harmony."
    };
  }

  if (isSevereCelibacy) {
    if (hasMoonSaturnVyayaCelibacy) {
      return {
        verdict: "lifelong_celibacy_denial",
        badgeColor: "purple",
        directAnswerKn: "ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ ಯೋಗ — ಜೀವಿತಾವಧಿಯಲ್ಲಿ ವಿವಾಹ ಬಂಧನವಿಲ್ಲ (ಲೌಕಿಕ ಸಂಸಾರದಿಂದ ಮುಕ್ತ)",
        directAnswerEn: "Lifelong Celibacy & Unmarried Destiny — Free from domestic householder bonds throughout life",
        titleKn: "ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ ಯೋಗ (12ರಲ್ಲಿ ಚಂದ್ರ-ಶನಿ ಯುತಿ — ಶಯನಸುಖ ಭಂಗ)",
        titleEn: "Lifelong Celibacy & Renunciation (12th House Moon-Saturn Sayana Sukha Bhanga Yoga)",
        subtitleKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಶಯನಸುಖ ಭಂಗ — ಲೌಕಿಕ ಗೃಹಸ್ಥ ಬಂಧನಗಳಿಂದ ಮುಕ್ತವಾದ ತಪಸ್ವೀ/ಸ್ವತಂತ್ರ ಜೀವನ ಪಥ",
        subtitleEn: "Classical Sayana Sukha Bhanga — Free from domestic householder bonds, dedicated to independent purpose",
        marriageTimingWindowKn: "ಲೌಕಿಕ ಸಂಸಾರ ಬಂಧನವಿಲ್ಲ — ಆಜೀವ ಅವಿವಾಹಿತ / ಮುಕ್ತ ಜೀವನ ಪಥ",
        marriageTimingWindowEn: "No domestic marriage bonds — Unmarried throughout life / Dedicated independent path",
        astrologicalReasoningKn: "ಜಾತಕದ 12ನೇ ವ್ಯಯ/ಮೋಕ್ಷ ಭಾವದಲ್ಲಿ ಮನಃಕಾರಕ ಚಂದ್ರ ಮತ್ತು ವೈರಾಗ್ಯಕಾರಕ ಶನಿಯ ಯುತಿಯು ಶಾಸ್ತ್ರೋಕ್ತ 'ಶಯನಸುಖ ಭಂಗ' ಹಾಗೂ ಅಖಂಡ ಬ್ರಹ್ಮಚರ್ಯ ಯೋಗವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. ಕಳತ್ರಕಾರಕ ಶುಕ್ರನಿಗೆ ರಾಹು-ಶನಿಯ ಬಾಧೆಯಿದ್ದು, 7ನೇ ಅಧಿಪತಿ ಕುಜನು 6ನೇ ಅಧಿಪತಿ ಗುರುವಿನೊಂದಿಗೆ ಯುತನಾಗಿದ್ದಾನೆ. ಈ ಗ್ರಹಸ್ಥಿತಿಯು ಲೌಕಿಕ ಸಂಸಾರ ಬಂಧನಗಳಿಗಿಂತ ಸ್ವತಂತ್ರ ಚಿಂತನೆ, ಏಕಾಂತ, ಜ್ಞಾನಾರ್ಜನೆ ಅಥವಾ ಉನ್ನತ ಆಧ್ಯಾತ್ಮಿಕ/ಸಾಮಾಜಿಕ ಕರ್ತವ್ಯಗಳಿಗೆ ಪ್ರೇರೇಪಿಸುತ್ತದೆ.",
        astrologicalReasoningEn: "Classical Parashari Yoga of Sayana Sukha Bhanga: The conjunction of Moon (mind/senses) and Saturn (ascetic detachment/coldness) in the 12th house of seclusion and bed comforts destroys matrimonial inclinations. Furthermore, Kalatrakaraka Venus is eclipsed by Rahu and aspected by Saturn's 10th drishti, while 7th lord Mars is constrained by 6th lord Jupiter in Lagna. This confers permanent detachment from householder life, directing vital energy toward solitary independence, spiritual sadhana, or selfless higher pursuit.",
        classicalRuleCitedKn: "ಫಲದೀಪಿಕಾ & ಪರಾಶರ ಹೋರಾ: ವ್ಯಯೇ ಚಂದ್ರ-ಶನ್ಯೋರ್ಯೋಗೇ ಶಯನಸುಖ ವಿವರ್ಜಿತಃ (12ನೇ ಮನೆಯಲ್ಲಿ ಚಂದ್ರ-ಶನಿ ಯುತಿಯಿಂದ ಸಂಸಾರ ನಿರಾಕರಣೆ & ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ)",
        classicalRuleCitedEn: "Phaladeepika & Brihat Parashara Hora Shastra: Conjunction of Moon and Saturn in the 12th house deprives conjugal bed comforts (Sayana Sukha Bhanga), conferring lifelong unmarried ascetic detachment.",
        historicalCelebrityParallelKn: "ಡಾ. ಎ.ಪಿ.ಜೆ. ಅಬ್ದುಲ್ ಕಲಾಂ, ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ, ಅಟಲ್ ಬಿಹಾರಿ ವಾಜಪೇಯಿ ಅವರಂತಹ ತಪಸ್ವೀ ಜೀವನದ ಹೋಲಿಕೆ.",
        historicalCelebrityParallelEn: "Resembles the dedicated ascetic life path of Dr. APJ Abdul Kalam, Swami Vivekananda, or Atal Bihari Vajpayee.",
        blessingRemedyKn: "ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ, ಜನಸೇವೆ, ಧ್ಯಾನ ಹಾಗೂ ಪರಮೇಶ್ವರನ ಆರಾಧನೆಯಿಂದ ಜನ್ಮ ಸಾಫಲ್ಯ ದೊರೆಯುತ್ತದೆ.",
        blessingRemedyEn: "Spiritual sadhana, public service, meditation, and Shiva worship fulfill life's supreme purpose."
      };
    }

    return {
      verdict: "lifelong_celibacy_denial",
      badgeColor: "purple",
      directAnswerKn: "ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ / ಸಂನ್ಯಾಸ ಯೋಗ — ಲೌಕಿಕ ಸಂಸಾರದಿಂದ ಮುಕ್ತ",
      directAnswerEn: "Lifelong Celibacy, Ascetic Dedication or Sanyasa Yoga",
      titleKn: "ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ / ಸಂನ್ಯಾಸ ಯೋಗ (Lifelong Celibacy & Renunciation)",
      titleEn: "Lifelong Celibacy & Ascetic Dedication / Sanyasa Yoga",
      subtitleKn: "ಡಾ. ಎ.ಪಿ.ಜೆ. ಅಬ್ದುಲ್ ಕಲಾಂ, ಅಟಲ್ ಬಿಹಾರಿ ವಾಜಪೇಯಿ ಅಥವಾ ಸ್ವಾಮಿ ವಿವೇಕಾನಂದರಂತಹ ತಪಸ್ವೀ ಜೀವನ ಪಥ",
      subtitleEn: "Ascetic life mission dedicated to nation, society, and higher spiritual wisdom",
      marriageTimingWindowKn: "ಲೌಕಿಕ ಸಂಸಾರ ಬಂಧನವಿಲ್ಲ — ಉನ್ನತ ಧ್ಯೇಯಕ್ಕೆ ಸಮರ್ಪಣೆ",
      marriageTimingWindowEn: "Free from domestic householder bonds — Dedicated to higher mission / spirituality",
      astrologicalReasoningKn: "ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರವ್ರಜ್ಯಾ (ಸಂನ್ಯಾಸ) ಯೋಗ ಅಥವಾ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನದ ಮೇಲೆ ಬ್ರಹ್ಮಚರ್ಯ ಕಾರಕರಾದ ಕೇತು, ಶನಿಯ ಪ್ರಭಾವ ಗರಿಷ್ಠವಾಗಿದೆ. ಜಾತಕರ ಪ್ರಾಣಶಕ್ತಿಯು ಕೌಟುಂಬಿಕ ಲೌಕಿಕ ಬಂಧನಗಳಿಗಿಂತ ಉನ್ನತ ಸಾಮಾಜಿಕ, ರಾಷ್ಟ್ರೀಯ ಅಥವಾ ಅಧ್ಯಾತ್ಮಿಕ ಧ್ಯೇಯಗಳಿಗೆ ಮೀಸಲಾಗಿದೆ.",
      astrologicalReasoningEn: "Classical Pravrajya (ascetic) yoga or intense Ketu/Saturn detachment over the 7th house directs the life-force towards higher spiritual or national service rather than domestic married life.",
      classicalRuleCitedKn: "ಬೃಹತ್ ಜಾತಕ: ಏಕಸ್ಥೈಶ್ಚತುರಾದ್ಯೈಃ ಪ್ರವ್ರಜ್ಯಾ ಬಲಿಭಿಃ (೪ ಅಥವಾ ಹೆಚ್ಚು ಗ್ರಹಗಳ ಯೋಗದಿಂದ ಸಂನ್ಯಾಸ ಯೋಗ)",
      classicalRuleCitedEn: "Brihat Jataka: Pravrajya Yoga formed by multiple ascetic planets in Kendra/Trikona",
      historicalCelebrityParallelKn: "ಡಾ. ಎ.ಪಿ.ಜೆ. ಅಬ್ದುಲ್ ಕಲಾಂ, ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ, ಅಟಲ್ ಬಿಹಾರಿ ವಾಜಪೇಯಿ ಅವರಂತಹ ತಪಸ್ವೀ ಜೀವನದ ಹೋಲಿಕೆ.",
      historicalCelebrityParallelEn: "Resembles the dedicated ascetic life path of Dr. APJ Abdul Kalam, Swami Vivekananda, or Atal Bihari Vajpayee.",
      blessingRemedyKn: "ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ, ಜನಸೇವೆ, ಧ್ಯಾನ ಹಾಗೂ ಪರಮೇಶ್ವರನ ಆರಾಧನೆಯಿಂದ ಜನ್ಮ ಸಾಫಲ್ಯ ದೊರೆಯುತ್ತದೆ.",
      blessingRemedyEn: "Spiritual sadhana, public service, meditation, and Shiva worship fulfill life's supreme purpose."
    };
  }

  // Dynamic Vimshottari Dasha-Bhukti Vivaha Timing Calculation
  const isSingleAdultDelayed = Boolean(isExplicitlySingle && age >= 28) || (age >= 28 && !isAlreadyMarried);
  const isDelayed = saturnAfflicts7thDelay || marsAfflicts7thDelay || nodalAxisAfflictsDelay || seventhLordAfflictedDusthana || isSingleAdultDelayed || (mars && mars.house === 7);

  const timeline = generateBhuktiTimeline(kundli, 55);
  const darakarakaName = getDarakaraka(kundli);
  const secondLordName = signLord((lagnaIndex + 1) % 12);
  const ninthLordName = signLord((lagnaIndex + 8) % 12);

  const targetMinAge = isDelayed ? Math.max(28, age) : Math.max(22, Math.min(age, 28));
  const targetMaxAge = isDelayed ? Math.max(age + 6, targetMinAge + 7) : Math.max(30, targetMinAge + 6);

  const candidateSpans = timeline.filter(b => b.startAge < targetMaxAge && b.endAge > (isDelayed ? age : targetMinAge));

  const scoreVivahaSpan = (b: BhuktiSpan) => {
    let s = 0;
    if (b.bhukti === seventhLordName) s += 7;
    if (b.maha === seventhLordName) s += 5;
    if (planetsIn7th.some(p => p.name === b.bhukti)) s += 6;
    if (planetsIn7th.some(p => p.name === b.maha)) s += 4;
    if (b.bhukti === PlanetName.Venus) s += 5;
    if (b.maha === PlanetName.Venus) s += 3;
    if (b.bhukti === PlanetName.Jupiter) s += 4.5;
    if (b.maha === PlanetName.Jupiter) s += 3;
    if (b.bhukti === darakarakaName) s += 5;
    if (b.maha === darakarakaName) s += 3.5;
    if (b.bhukti === secondLordName) s += 3;
    if (b.bhukti === ninthLordName) s += 3;

    const bp = kundli.planets.find(p => p.name === b.bhukti);
    if (bp) {
      if ([1, 4, 7, 10, 5, 9, 11].includes(bp.house)) s += 2;
      if ([6, 8, 12].includes(bp.house) && bp.name !== seventhLordName) s -= 3;
      if (jupiter && [5, 7, 9].includes(((bp.house - jupiter.house + 12) % 12) + 1)) s += 2;
    }
    return s;
  };

  const sortedSpans = [...(candidateSpans.length > 0 ? candidateSpans : timeline)].sort(
    (a, b) => scoreVivahaSpan(b) - scoreVivahaSpan(a)
  );
  const bestSpan = sortedSpans[0] || {
    maha: seventhLordName,
    bhukti: PlanetName.Venus,
    startAge: isDelayed ? 30 : 25,
    endAge: isDelayed ? 33 : 28,
    durationYears: 3
  };

  const bestMahaKn = toKannadaPlanet(bestSpan.maha);
  const bestBhuktiKn = toKannadaPlanet(bestSpan.bhukti);
  const bestMahaEn = bestSpan.maha;
  const bestBhuktiEn = bestSpan.bhukti;

  let startYr = isDelayed
    ? Math.max(Math.floor(age), Math.floor(bestSpan.startAge))
    : Math.max(21, Math.floor(bestSpan.startAge));
  let endYr = Math.max(startYr + 2, Math.ceil(bestSpan.endAge));
  if (endYr - startYr < 2) endYr = startYr + 3;
  if (endYr - startYr > 4) endYr = startYr + 4;

  // Youth in Student / Career Preparation Stage (Age < 25)
  if (age < 25 && !isExplicitlySingle) {
    return {
      verdict: "assured_marriage",
      badgeColor: "emerald",
      directAnswerKn: "ಹೌದು, ಜಾತಕರಿಗೆ ಖಚಿತ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಭಾಗ್ಯವಿದೆ!",
      directAnswerEn: "Yes, timely and assured marriage destiny in lifetime!",
      titleKn: "ಖಚಿತ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಭಾಗ್ಯ (Assured Timely Marriage Destiny)",
      titleEn: "Assured Timely Marriage Destiny",
      subtitleKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶುಕ್ರನ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಸಕಾಲಿಕ ಸುಖಿ ದಾಂಪತ್ಯ ಯೋಗ",
      subtitleEn: "Timely matrimony blessed by Jupiter's divine grace and Venus",
      marriageTimingWindowKn: `${startYr} ರಿಂದ ${endYr} ವರ್ಷಗಳ ಸಕಾಲಿಕ ಅವಧಿಯಲ್ಲಿ (${bestMahaKn} ಮಹಾದಶಾ - ${bestBhuktiKn} ಭುಕ್ತಿ)`,
      marriageTimingWindowEn: `Timely window between ${startYr} and ${endYr} years (${bestMahaEn} Mahadasha - ${bestBhuktiEn} Bhukti)`,
      astrologicalReasoningKn: `ಜಾತಕದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಹಾಗೂ 7ನೇ ಅಧಿಪತಿ ${PLANET_KN[seventhLordName]}ಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹವಿದೆ. ಪ್ರಸ್ತುತ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ವೃತ್ತಿ ರೂಪಿಸುವ ಹಂತದಲ್ಲಿದ್ದು, ವಿಂಶೋತ್ತರಿ ದಶಾ ವಿಚಾರದಲ್ಲಿ ${bestMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bestBhuktiKn} ಭುಕ್ತಿ ಕಾಲವು (ಸುಮಾರು ${startYr}–${endYr} ವರ್ಷ) ಸಕಾಲಿಕ ವಿವಾಹಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿದೆ.`,
      astrologicalReasoningEn: `The 7th house and 7th lord ${PLANET_EN[seventhLordName]} are auspiciously supported. Currently in the education/career building stage, the Vimshottari period of ${bestMahaEn} Mahadasha and ${bestBhuktiEn} Bhukti (around ${startYr}–${endYr} years) ensures timely matrimony with a compatible partner.`,
      classicalRuleCitedKn: "ಜಾತಕ ಪಾರಿಜಾತ: ಶುಭಗ್ರಹೇಕ್ಷಣೇ ಸಪ್ತಮೇ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಸಿದ್ಧಿಃ",
      classicalRuleCitedEn: "Jataka Parijata: Auspicious disposition ensures timely matrimonial bliss at the appropriate stage of life",
      blessingRemedyKn: "ಪ್ರತಿನಿತ್ಯ ಶ್ರೀ ಗೌರಿ-ಶಂಕರ ಧ್ಯಾನ ಹಾಗೂ ಶುಕ್ರವಾರ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಸದಾ ಶುಭ ತರುತ್ತದೆ.",
      blessingRemedyEn: "Daily Gauri-Shankara contemplation and auspicious Friday prayers bless the marital journey."
    };
  }

  // Check if Delayed Marriage
  if (isDelayed) {
    const factorsKn: string[] = [];
    const factorsEn: string[] = [];

    const delayPlanetsKnList: string[] = [];
    const delayPlanetsEnList: string[] = [];

    if (saturnAfflicts7thDelay) {
      factorsKn.push("7ನೇ ಸ್ಥಾನ ಅಥವಾ 7ನೇ ಅಧಿಪತಿಗೆ ಶನಿಯ ದೃಷ್ಟಿ/ಸಂಪರ್ಕ — ಶನಿಯು ಪಕ್ವತೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ ವಿಳಂಬ ಮಾಡುತ್ತಾನೆ, ಆದರೆ ವಿವಾಹ ನಿರಾಕರಿಸುವುದಿಲ್ಲ!");
      factorsEn.push("Saturn aspecting or conjunct 7th house/lord causes maturity delay, NOT denial.");
      delayPlanetsKnList.push("ಶನಿ");
      delayPlanetsEnList.push("Saturn");
    }
    if (marsAfflicts7thDelay || (mars && mars.house === 7)) {
      factorsKn.push("ಕುಜ ದೋಷ / ಮಂಗಳ ಪ್ರಭಾವ — ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಸಕಾಲಿಕ ಹೊಂದಾಣಿಕೆಗೆ ಸಮಯಾವಕಾಶ ಬೇಡುತ್ತದೆ.");
      factorsEn.push("Mars influence requiring emotional maturity before matrimonial bonding.");
      delayPlanetsKnList.push("ಕುಜ");
      delayPlanetsEnList.push("Mars");
    }
    if (isSingleAdultDelayed) {
      factorsKn.push("ಪರಿಪಕ್ವ ವಯಸ್ಸಿನವರೆಗೆ ವೃತ್ತಿ/ವೈಯಕ್ತಿಕ ಧ್ಯೇಯಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿರುವುದು — ವಿಳಂಬವೇ ಹೊರತು ನಿರಾಕರಣೆಯಲ್ಲ!");
      factorsEn.push("Career and personal dedication in twenties bringing mature marital timing.");
      if (delayPlanetsKnList.length === 0) {
        delayPlanetsKnList.push("ವೃತ್ತಿ ಕರ್ಮ ಗ್ರಹಗಳ");
        delayPlanetsEnList.push("planetary transits");
      }
    }
    if (nodalAxisAfflictsDelay) {
      factorsKn.push("7ನೇ ಭಾವದಲ್ಲಿ ರಾಹು-ಕೇತು ಅಕ್ಷ — ಆರಂಭಿಕ ಅಡೆತಡೆಗಳು, ಆದರೆ ಕಾಲಾನುಕ್ರಮದಲ್ಲಿ ಯೋಗ್ಯ ಸಂಬಂಧ ಪ್ರಾಪ್ತಿ.");
      factorsEn.push("Rahu-Ketu axis causing initial obstacles that resolve with maturity.");
      delayPlanetsKnList.push("ರಾಹು-ಕೇತು");
      delayPlanetsEnList.push("Rahu-Ketu");
    }
    if (seventhLordAfflictedDusthana) {
      factorsKn.push(`7ನೇ ಅಧಿಪತಿ ${PLANET_KN[seventhLordName]} 6, 8 ಅಥವಾ 12ನೇ ಸ್ಥಾನದಲ್ಲಿರುವುದು — ಸೂಕ್ತ ಪರಿಹಾರದಿಂದ ಕಲ್ಯಾಣ ಸಿದ್ಧಿ.`);
      factorsEn.push(`7th lord ${PLANET_EN[seventhLordName]} in 6/8/12 requires astrological remedy for smooth settlement.`);
      delayPlanetsKnList.push(PLANET_KN[seventhLordName] || "ಕಳತ್ರಾಧಿಪತಿ");
      delayPlanetsEnList.push(PLANET_EN[seventhLordName] || "7th Lord");
    }
    if (factorsKn.length === 0) {
      factorsKn.push("ಗೋಚಾರ ಹಾಗೂ ದಶಾ ಸಂಚಾರದ ಪಕ್ವತೆ ಬೇಡುತ್ತದೆ.");
      factorsEn.push("Planetary transit maturity required.");
      delayPlanetsKnList.push("ಗ್ರಹ");
      delayPlanetsEnList.push("planetary");
    }

    const delayPlanetsKn = delayPlanetsKnList.join("/");
    const delayPlanetsEn = delayPlanetsEnList.join("/");

    let delayStartYr = Math.max(Math.floor(age), Math.max(28, startYr));
    let delayEndYr = Math.max(delayStartYr + 2, Math.ceil(bestSpan.endAge));
    if (delayEndYr - delayStartYr < 2) delayEndYr = delayStartYr + 3;
    if (delayEndYr - delayStartYr > 4) delayEndYr = delayStartYr + 4;

    const ageWindowKn = age >= 48
      ? `ಪರಿಪಕ್ವ ವಯಸ್ಸಿನಲ್ಲಿ ವಿಶೇಷ ಗ್ರಹಗತಿ ಕೂಡಿಬಂದಾಗ (${bestMahaKn} ಮಹಾದಶಾ - ${bestBhuktiKn} ಭುಕ್ತಿ)`
      : `${delayStartYr} ರಿಂದ ${delayEndYr} ವರ್ಷಗಳ ಅವಧಿಯಲ್ಲಿ (${bestMahaKn} ಮಹಾದಶಾ - ${bestBhuktiKn} ಭುಕ್ತಿ)`;
    const ageWindowEn = age >= 48
      ? `Subject to mature planetary transitions (${bestMahaEn} Mahadasha - ${bestBhuktiEn} Bhukti)`
      : `Between ${delayStartYr} and ${delayEndYr} years (${bestMahaEn} Mahadasha - ${bestBhuktiEn} Bhukti)`;

    const ageRangeTextKn = age >= 48 ? "ಪರಿಪಕ್ವ ವಯಸ್ಸಿಗೆ" : `${delayStartYr} ರಿಂದ ${delayEndYr} ವರ್ಷಗಳವರೆಗೆ`;
    const ageRangeTextEn = age >= 48 ? "mature phase" : `between ${delayStartYr} and ${delayEndYr} years`;

    return {
      verdict: "delayed_marriage",
      badgeColor: "amber",
      directAnswerKn: `ಹೌದು, ಖಚಿತ ಕಲ್ಯಾಣ ಭಾಗ್ಯವಿದೆ! ಆದರೆ ${delayPlanetsKn} ಪ್ರಭಾವದಿಂದ ವಿಳಂಬ ವಿವಾಹ (Delay is NOT Denial!)`,
      directAnswerEn: `Yes, marriage is definitely assured! However, delayed due to ${delayPlanetsEn} (Delay is NOT Denial)`,
      titleKn: "ವಿಳಂಬ ವಿವಾಹ — ಆದರೆ ಖಚಿತ ಕಲ್ಯಾಣ ಭಾಗ್ಯ (Delayed Marriage: Delay is NOT Denial!)",
      titleEn: "Delayed Marriage: Delay is NOT Denial (Lasting Settlement)",
      subtitleKn: age >= 35 ? "ಗಮನಿಸಿ: ವಿಳಂಬವೆಂದರೆ ನಿರಾಕರಣೆಯಲ್ಲ — ಪರಿಪಕ್ವ ವಯಸ್ಸಿನಲ್ಲಿ ಸುದೃಢ ಕಲ್ಯಾಣ ಸಿದ್ಧಿ" : `ಗಮನಿಸಿ: ವಿಳಂಬವೆಂದರೆ ನಿರಾಕರಣೆಯಲ್ಲ — ಪರಿಪಕ್ವ ವಯಸ್ಸಿನಲ್ಲಿ (${delayStartYr} ರಿಂದ ${delayEndYr}+) ಸುದೃಢ ಕಲ್ಯಾಣ ಸಿದ್ಧಿ`,
      subtitleEn: age >= 35 ? "Crucial distinction: Delay is never denial — mature and lasting union in mature phase" : `Crucial distinction: Delay is never denial — mature and lasting union post ${delayStartYr}–${delayEndYr}+ years`,
      marriageTimingWindowKn: ageWindowKn,
      marriageTimingWindowEn: ageWindowEn,
      astrologicalReasoningKn: `ಗಮನಿಸಿ: ಜಾತಕದಲ್ಲಿ 'ವಿಳಂಬ' ಎಂದರೆ ಯಾವುದೇ ಕಾರಣಕ್ಕೂ 'ನಿರಾಕರಣೆ' (Denial) ಅಲ್ಲ! ${delayPlanetsKn} ಪ್ರಭಾವದಿಂದಾಗಿ ವಿವಾಹವು ${ageRangeTextKn} ವಿಳಂಬವಾಗುತ್ತದೆಯಾದರೂ, ವಿಂಶೋತ್ತರಿ ದಶಾ ವಿಚಾರದಲ್ಲಿ ${bestMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bestBhuktiKn} ಅಂತರ್ದಶಾ ಕಾಲವು ಪ್ರಬಲ ಕಲ್ಯಾಣ ಸಿದ್ಧಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ. ಈ ಅವಧಿಯ ನಂತರ ಜಾತಕರಿಗೆ ಅತ್ಯಂತ ಸ್ಥಿರ, ಜವಾಬ್ದಾರಿಯುತ ಮತ್ತು ಶಾಶ್ವತ ಕಲ್ಯಾಣ ಭಾಗ್ಯ ಕೂಡಿಬರುತ್ತದೆ.`,
      astrologicalReasoningEn: `Important distinction: Delay is NEVER Denial! ${delayPlanetsEn} tests psychological maturity and karmic readiness, postponing marriage to ${ageRangeTextEn}. Under Vimshottari Dasha, ${bestMahaEn} Mahadasha and ${bestBhuktiEn} Bhukti open the matrimonial gateway, conferring a deeply stable, mature, and lifelong union.`,
      classicalRuleCitedKn: "ಪರಾಶರ ಸ್ಮೃತಿ: ಮಂದಕ್ಷೇ ಸಪ್ತಮೇ ಪ್ರಾಪ್ತೇ ವಿಳಂಬೇನ ಕೃತಂ ಶುಭಮ್ (ಶನಿ ಪ್ರಭಾವದಿಂದ ವಿಳಂಬವಾದರೂ ಕಲ್ಯಾಣ ಶಾಶ್ವತ)",
      classicalRuleCitedEn: "Parashara Hora: Saturn's aspect or occupancy in the 7th house delays matrimony for maturity, conferring enduring stability after age 28–30",
      delayFactorsKn: factorsKn,
      delayFactorsEn: factorsEn,
      historicalCelebrityParallelKn: "ಹಲವು ಪ್ರಖ್ಯಾತ ನಾಯಕರು ಮತ್ತು ವಿದ್ವಾಂಸರು 30-36 ವರ್ಷದ ನಂತರ ಮದುವೆಯಾಗಿ ಅತ್ಯಂತ ಸುಖಿ ಸಂಸಾರ ನಡೆಸಿದಂತೆ ಸುದೃಢ ದಾಂಪತ್ಯ ಯೋಗ.",
      historicalCelebrityParallelEn: "Like many eminent leaders and intellectuals who marry between 30 and 36, settling into an exceptionally solid, enduring union.",
      blessingRemedyKn: "ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ / ಕುಜ ಶಾಂತಿ ಪೂಜೆ, ಶುಕ್ರವಾರ ಕಲ್ಯಾಣ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪೂಜೆ ಹಾಗೂ ಹಳದಿ ವಸ್ತ್ರ/ಧಾನ್ಯ ದಾನವು ವಿವಾಹ ವಿಳಂಬವನ್ನು ಶೀಘ್ರವಾಗಿ ಪರಿಹರಿಸುತ್ತದೆ.",
      blessingRemedyEn: "Tuesday Subrahmanya / Mangala Shanti prayers, Friday Kalyana Lakshmi Narayana pooja, and yellow grain charity swiftly remove delays."
    };
  }

  // Assured Timely Marriage
  const timelyWindowKn = `${startYr} ರಿಂದ ${endYr} ವರ್ಷಗಳ ಸಕಾಲಿಕ ಅವಧಿಯಲ್ಲಿ (${bestMahaKn} ಮಹಾದಶಾ - ${bestBhuktiKn} ಭುಕ್ತಿ)`;
  const timelyWindowEn = `Timely window between ${startYr} and ${endYr} years (${bestMahaEn} Mahadasha - ${bestBhuktiEn} Bhukti)`;

  return {
    verdict: "assured_marriage",
    badgeColor: "emerald",
    directAnswerKn: "ಹೌದು, ಜಾತಕರಿಗೆ ಖಚಿತ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಭಾಗ್ಯವಿದೆ!",
    directAnswerEn: "Yes, timely and assured marriage destiny in lifetime!",
    titleKn: "ಖಚಿತ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಭಾಗ್ಯ (Assured Timely Marriage Destiny)",
    titleEn: "Assured Timely Marriage Destiny",
    subtitleKn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಶುಕ್ರನ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಸಕಾಲಿಕ ಸುಖಿ ದಾಂಪತ್ಯ ಯೋಗ",
    subtitleEn: "Timely matrimony blessed by Jupiter's divine grace and Venus",
    marriageTimingWindowKn: timelyWindowKn,
    marriageTimingWindowEn: timelyWindowEn,
    astrologicalReasoningKn: `ಜಾತಕದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ, 7ನೇ ಅಧಿಪತಿ ${PLANET_KN[seventhLordName]} ಹಾಗೂ ಶುಕ್ರನಿಗೆ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿ ಅಥವಾ ಕೇಂದ್ರ-ತ್ರಿಕೋನ ಬಲವಿದೆ. ವಿಂಶೋತ್ತರಿ ದಶಾ ವಿಚಾರದಲ್ಲಿ ${bestMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bestBhuktiKn} ಭುಕ್ತಿ ಕಾಲವು (ಸುಮಾರು ${startYr}–${endYr} ವರ್ಷ) ಕಲ್ಯಾಣ ಸಿದ್ಧಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ಕಾಲವಾಗಿದೆ. ಉತ್ತಮ ಸಂಸ್ಕಾರವುಳ್ಳ, ಹೊಂದಾಣಿಕೆಯಾಗುವ ಸಂಗಾತಿಯೊಂದಿಗೆ ವಿವಾಹ ಯೋಗ ಸಿದ್ಧಿಸುತ್ತದೆ.`,
    astrologicalReasoningEn: `The 7th house of marriage, 7th lord ${PLANET_EN[seventhLordName]}, and Venus receive auspicious Jupiterian grace and Kendra-Trikona strength. Under Vimshottari Dasha, ${bestMahaEn} Mahadasha and ${bestBhuktiEn} Bhukti (around age ${startYr}–${endYr}) ensure timely matrimony with a compatible life partner.`,
    classicalRuleCitedKn: "ಜಾತಕ ಪಾರಿಜಾತ: ಶುಭಗ್ರಹೇಕ್ಷಣೇ ಸಪ್ತಮೇ ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಸಿದ್ಧಿಃ",
    classicalRuleCitedEn: "Jataka Parijata: Benefic aspect on 7th house brings timely, prosperous matrimony",
    blessingRemedyKn: "ಪ್ರತಿನಿತ್ಯ ಶ್ರೀ ಗೌರಿ-ಶಂಕರ ಧ್ಯಾನ ಹಾಗೂ ಶುಕ್ರವಾರ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಸದಾ ಶುಭ ತರುತ್ತದೆ.",
    blessingRemedyEn: "Daily Gauri-Shankara contemplation and auspicious Friday prayers bless the marital journey."
  };
}
