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
  | "career_financial_growth";

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
  | "creative_media";

export interface CareerSuitabilityField {
  fieldCode: AccurateProfessionCode;
  fieldNameKn: string;
  fieldNameEn: string;
  suitabilityPercentage: number;
  coreStrengthsKn: string;
  coreStrengthsEn: string;
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

export interface AccurateProfessionProfile {
  code: AccurateProfessionCode;
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
    maritalStatus?: "married" | "unmarried" | string;
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
  }
): CurrentLifeSituationDiagnosis {
  const age = context.devoteeAge ?? 30;
  const isFemale = context.gender === "Female";
  const isMale = context.gender === "Male" || (!isFemale && context.gender !== "Other");
  const devoteeName = context.devoteeName || (isFemale ? "ಭಕ್ತೆಯವರೇ" : "ಭಕ್ತರೇ");

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

  const dashaTimeKn = dashaTiming?.timelineKn || "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ";
  const dashaTimeEn = dashaTiming?.timelineEn || "within the next 3 to 6 months";

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
  if (saturn && saturn.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Shani
  if (rahu && rahu.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Rahu
  if (ketu && ketu.house === 7) distinctMarriageAfflictionCount += 1; // Saptama Ketu
  if (seventhLordPlanet?.isDebilitated) distinctMarriageAfflictionCount += 1;
  if (seventhLordPlanet?.isRetrograde) distinctMarriageAfflictionCount += 1;
  if (isMale && venus?.isRetrograde) distinctMarriageAfflictionCount += 1;
  if (isFemale && (jupiter?.isRetrograde || venus?.isRetrograde)) distinctMarriageAfflictionCount += 1;

  const hasDirect7thHouseAffliction = Boolean(
    (mars && mars.house === 7) ||
    (saturn && saturn.house === 7) ||
    (rahu && rahu.house === 7) ||
    (ketu && ketu.house === 7) ||
    seventhLordPlanet?.isRetrograde ||
    seventhLordPlanet?.isDebilitated
  );

  if (context.maritalStatus === "married") {
    marriageDelayScore = 0;
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

  if (hasStrongSeventhLord && hasSevereDiscordAfflictions && context.maritalStatus !== "unmarried") {
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

  if (context.maritalStatus === "married") {
    maritalDiscordScore += 3.0;
  } else if (context.maritalStatus === "unmarried") {
    maritalDiscordScore = 0;
  } else {
    // When marital status is unspecified, only consider marital discord if there is a CONFIRMED extreme affliction
    // (e.g. Ketu in 7th with Mars in 8th and Rahu in 1st). Otherwise do not assume fighting!
    if (maritalDiscordScore < 8.5) {
      maritalDiscordScore = 0;
    }
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

  // If explicitly unmarried, childlessness is 0
  const isExplicitlyCouple = Boolean(context.maritalStatus === "married" || context.devoteeName?.includes("ದಂಪತಿ"));
  if (context.maritalStatus === "unmarried") {
    childlessScore = 0;
  } else if (!isExplicitlyCouple) {
    if (age < 26 || childlessScore < 7.5) {
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
  const h10OccupantsKn = getHouseOccupantsKn(10);

  const candidates: DiagnosticCandidate[] = [];

  // A. Child Stage (<14 years)
  if (age < 14) {
    candidates.push({
      category: "student_academic_stress",
      score: 10.0,
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

  // B. Youth Stage (14 to 23 years)
  if (age >= 14 && age <= 23) {
    candidates.push({
      category: "student_academic_stress",
      score: 7.5,
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
  if (age >= 24 && age < 59 && context.maritalStatus !== "unmarried" && maritalDiscordScore >= 4.0) {
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
        detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ ಮತ್ತು ${spouseKn} ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಗಂಭೀರ ಮನಸ್ತಾಪಗಳು ಕಾಡುತ್ತಿವೆ. ${lagnaKn} ಲಗ್ನದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನವು ${h7SignKn} ರಾಶಿಯಾಗಿದ್ದು, ಅಧಿಪತಿ ${h7LordKn} ${h7LordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. 8ನೇ ಮಾಂಗಲ್ಯ ಸ್ಥಾನವು ${h8SignKn} ಆಗಿದ್ದು (ಅಧಿಪತಿ ${h8LordKn}), ${mars ? `ಕುಜನು ${mars.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}${saturn ? `ಶನಿಯು ${saturn.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ` : ""}ಸಣ್ಣ ಮಾತೂ ದೊಡ್ಡ ಜಗಳವಾಗಿ ಪರಿವರ್ತನೆಗೊಳ್ಳುವುದು, ಸಂಗಾತಿಯ ಕಡೆಯಿಂದ ಕಟುವಾದ ಮಾತುಗಳು, ಪರಸ್ಪರ ಅಂತರ ಹಾಗೂ ಮನೆಯೊಳಗೆ ನೆಮ್ಮದಿಯಿಲ್ಲದ ವಾತಾವರಣ ಉಂಟಾಗಿದೆ. ಪ್ರಸ್ತುತ ${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ${shaniGocharaTextKn} ಸಂಸಾರಿಕ ಸುಖದಲ್ಲಿ ಏರುಪೇರು ಉಂಟುಮಾಡಿದೆ.`,
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
  if (context.maritalStatus !== "married" && age >= 24 && age <= 48 && marriageDelayScore >= 4.5) {
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
    candidates.push({
      category: "health_vitality_strain",
      score: healthScore,
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

  // K. Senior Stage (59+ years)
  if (age >= 59) {
    candidates.push({
      category: "elderly_peace_legacy",
      score: 8.5,
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
  const tenthSignIdx = (lagnaIndex + 9) % 12;
  const tenthSignNameKn = RASHI_KN[tenthSignIdx] || "ದಶಮ";
  const tenthLordNameKn = PLANET_KN[tenthLord] || "ದಶಮಾಧಿಪತಿ";
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
    creative_media: 0
  };

  // 1. IT & Software Engineering
  if ([2, 5, 10].includes(tenthSignIndex)) scores.it_software += 3.5;
  if ([PlanetName.Mercury, PlanetName.Rahu].includes(tenthLord)) scores.it_software += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury)) scores.it_software += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Rahu)) scores.it_software += 3.5;
  if (amkName === PlanetName.Mercury || amkName === PlanetName.Rahu) scores.it_software += 3.0;
  if ([PlanetName.Mercury, PlanetName.Rahu].includes(tenthFromMoonLord)) scores.it_software += 2.0;
  if (navTenthLord === PlanetName.Mercury || (navTenthLord === PlanetName.Saturn && [PlanetName.Mercury, PlanetName.Rahu].includes(tenthLord))) scores.it_software += 2.0;

  // 2. Banking, Finance, Accounts & CA
  if ([1, 5, 2, 8, 11].includes(tenthSignIndex)) scores.banking_finance += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury) && planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Mercury)) scores.banking_finance += 2.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 2.5;
  if (amkName === PlanetName.Jupiter || amkName === PlanetName.Mercury) scores.banking_finance += 3.0;
  if ([PlanetName.Mercury, PlanetName.Jupiter].includes(tenthLord)) scores.banking_finance += 2.5;
  if (tenthLordPlanet && [2, 11].includes(tenthLordPlanet.house)) scores.banking_finance += 2.5;
  if (jupiter && venus && jupiter.house === 11 && venus.house === 11) scores.banking_finance += 4.5;

  // 3. Teaching, Academics & College Professor
  if ([8, 11, 3, 2].includes(tenthSignIndex)) scores.teaching_academics += 3.5;
  if (tenthLord === PlanetName.Jupiter) scores.teaching_academics += 4.0;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.teaching_academics += 4.0;
  if (amkName === PlanetName.Jupiter) scores.teaching_academics += 3.5;
  if (tenthFromMoonLord === PlanetName.Jupiter) scores.teaching_academics += 2.5;
  if (navTenthLord === PlanetName.Jupiter) scores.teaching_academics += 2.0;
  if (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, 9))) scores.teaching_academics += 3.5;
  if (sun && mercury && sun.house === 1 && mercury.house === 1) scores.teaching_academics += 3.0;

  // 4. Medical, Healthcare, Surgery & Pharma
  if (planetsIn10thNames.includes(PlanetName.Sun) && planetsIn10thNames.includes(PlanetName.Mars)) scores.medical_healthcare += 8.0;
  if (tenthLordPlanet && tenthLordPlanet.house === 6) scores.medical_healthcare += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Sun)) scores.medical_healthcare += 2.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.medical_healthcare += 2.5;
  if ([PlanetName.Sun, PlanetName.Mars].includes(tenthLord)) scores.medical_healthcare += 2.5;
  if (amkName === PlanetName.Sun || amkName === PlanetName.Mars) scores.medical_healthcare += 2.5;

  // 5. Legal & Judiciary / Lawyer / Judge
  if ([6, 8, 10].includes(tenthSignIndex)) scores.legal_judiciary += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter) && planetsIn10thNames.includes(PlanetName.Saturn)) scores.legal_judiciary += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Saturn)) scores.legal_judiciary += 2.5;
  if ([PlanetName.Jupiter, PlanetName.Saturn].includes(tenthLord)) scores.legal_judiciary += 2.5;
  if (amkName === PlanetName.Saturn || amkName === PlanetName.Jupiter) scores.legal_judiciary += 3.0;

  // 6. Priest, Vedic Scholar, Temple Archaka, Homa-Havana & Astrologer
  const ninthLord = signLord((lagnaIndex + 8) % 12);
  const ninthLordPlanet = kundli.planets.find(p => p.name === ninthLord);

  // Classical Vedic signatures for Temple Archaka, Purohita & Homa-Havana:
  // Signature A: Sun (Devata/Agni/Gayatri) conjunct Ketu (Yajna, Temple, Moksha) -> Classical Agnihotri / Temple Archaka yoga
  const hasSunKetuYajna = Boolean(sun && ketu && sun.house === ketu.house);
  if (hasSunKetuYajna) scores.priest_vedic_astrology += 6.0;

  // Signature B: Ketu in 10th or 9th house with Jupiter aspect or in Jupiter's signs (Sagittarius/Pisces)
  if (ketu && [9, 10].includes(ketu.house)) {
    if ([8, 11].includes(ketu.rashi.index) || (jupiter && [1, 5, 7, 9].includes(houseDistance(jupiter.house, ketu.house)))) {
      scores.priest_vedic_astrology += 5.5;
    }
    // Guru-Ketu Brahma-Jnana Yoga: Jupiter conjunct Ketu in 10th or 9th house (Supreme Vedic Scholarship & Temple Priesthood)
    if (jupiter && jupiter.house === ketu.house) {
      scores.priest_vedic_astrology += 12.0;
    }
    if (sun && [9, 10].includes(sun.house)) {
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
  if (tenthLord === PlanetName.Mars && (hasSunKetuYajna || hasKetuIn10thStar || (ketu && [9, 10].includes(ketu.house)))) {
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
        scores.priest_vedic_astrology += 14.0;
        scores.government_civil_police -= 6.0;
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

  // 8. Business, Real Estate, Merchant & Contractor
  if ([1, 6, 7, 9].includes(tenthSignIndex)) scores.business_realestate += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury) || planetsIn10thNames.includes(PlanetName.Mars)) scores.business_realestate += 2.5;
  if (tenthLordPlanet && [7, 11, 3].includes(tenthLordPlanet.house)) scores.business_realestate += 3.5;
  if (amkName === PlanetName.Mercury || amkName === PlanetName.Mars) scores.business_realestate += 2.5;

  // 9. Core Engineering (Mechanical, Civil, Electrical)
  if ([0, 7, 9].includes(tenthSignIndex)) scores.engineering_core += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Mars) && planetsIn10thNames.includes(PlanetName.Saturn)) scores.engineering_core += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.engineering_core += 2.5;
  if (tenthLord === PlanetName.Mars) scores.engineering_core += 3.0;
  if (amkName === PlanetName.Mars) scores.engineering_core += 2.5;

  // Classical Guard: Debilitated Mars (Neecha Kuja in Cancer) lacks mechanical/craftsman stamina for heavy engineering
  const isMarsDebilitated = Boolean(mars?.isDebilitated || (mars && mars.rashi.index === 3));
  if (isMarsDebilitated) {
    scores.engineering_core -= 7.0;
  }
  if (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) {
    scores.engineering_core -= 3.5;
  }

  // 10. Creative Arts, Media, Journalism & Design
  if ([1, 6, 2].includes(tenthSignIndex)) scores.creative_media += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Venus)) scores.creative_media += 3.5;
  if (tenthLord === PlanetName.Venus) scores.creative_media += 3.0;
  if (amkName === PlanetName.Venus) scores.creative_media += 3.5;
  if (venus && [1, 6, 11].includes(venus.rashi.index) && [1, 4, 5, 9, 10, 11].includes(venus.house)) scores.creative_media += 3.5;

  // Gender & Religious Guard: Female charts are disqualified from male temple priesthood / homa-havana
  if (context.gender === "Female") {
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
    }
  > = {
    it_software: {
      nameKn: "ಸಾಫ್ಟ್‌ವೇರ್, ಐಟಿ & ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ",
      nameEn: "Software, IT & Technology",
      strengthsKn: "ಕೋಡಿಂಗ್, ಡೇಟಾ ಅನಾಲಿಸಿಸ್, ತಾರ್ಕಿಕ ಸಮಸ್ಯೆ ಪರಿಹಾರ & ಸಾಫ್ಟ್‌ವೇರ್ ಆರ್ಕಿಟೆಕ್ಚರ್",
      strengthsEn: "Coding, Data Analytics, Algorithmic Logic & Software Architecture"
    },
    banking_finance: {
      nameKn: "ಬ್ಯಾಂಕಿಂಗ್, ಹಣಕಾಸು, ಲೆಕ್ಕಪರಿಶೋಧನೆ (CA) & ಷೇರು ಮಾರುಕಟ್ಟೆ",
      nameEn: "Banking, Finance, Accounts & CA",
      strengthsKn: "ಲೆಕ್ಕಪತ್ರ ನಿಖರತೆ, ಆಡಿಟಿಂಗ್, ಬಂಡವಾಳ ನಿರ್ವಹಣೆ & ಬ್ಯಾಂಕ್ ಆಡಳಿತ",
      strengthsEn: "Accounting Precision, Auditing, Capital Management & Banking"
    },
    government_civil_police: {
      nameKn: "ರಾಜಕೀಯ, ಸರ್ಕಾರಿ ಆಡಳಿತ, ನಾಗರಿಕ ಸೇವೆಗಳು (IAS/KAS) & ಪೊಲೀಸ್",
      nameEn: "Governance, Civil Administration (IAS/KAS) & Leadership",
      strengthsKn: "ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ, ಜನನಾಯಕತ್ವ, ನೀತಿ ನಿಯಂತ್ರಣ & ಸಾರ್ವಜನಿಕ ಸೇವೆ",
      strengthsEn: "Executive Governance, Public Leadership, Policy Making & State Authority"
    },
    business_realestate: {
      nameKn: "ಸ್ವಂತ ವ್ಯಾಪಾರ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಉದ್ಯಮ & ಗುತ್ತಿಗೆದಾರಿಕೆ",
      nameEn: "Private Enterprise, Real Estate & Business",
      strengthsKn: "ಮಾರುಕಟ್ಟೆ ಜಾಣ್ಮೆ, ಹೂಡಿಕೆ ವಿಸ್ತರಣೆ, ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ & ಉದ್ಯಮಶೀಲತೆ",
      strengthsEn: "Market Acumen, Investment Expansion, Negotiation & Enterprise"
    },
    teaching_academics: {
      nameKn: "ಶಿಕ್ಷಣ ಕ್ಷೇತ್ರ, ಕಾಲೇಜು ಉಪನ್ಯಾಸ, ಪ್ರೊಫೆಸರ್ & ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ",
      nameEn: "Teaching, University Academics & Research",
      strengthsKn: "ಜ್ಞಾನ ದಾನ, ಆಳವಾದ ಅಧ್ಯಯನ, ವಿದ್ಯಾರ್ಥಿ ಮಾರ್ಗದರ್ಶನ & ಬೌದ್ಧಿಕ ಸಂಶೋಧನೆ",
      strengthsEn: "Pedagogy, Deep Study, Academic Mentoring & Intellectual Research"
    },
    engineering_core: {
      nameKn: "ಕೋರ್ ಇಂಜಿನಿಯರಿಂಗ್ (ಮೆಕ್ಯಾನಿಕಲ್/ಸಿವಿಲ್/ಎಲೆಕ್ಟ್ರಿಕಲ್) & ಕೈಗಾರಿಕೆ",
      nameEn: "Core Engineering (Mechanical/Civil/Electrical) & Heavy Industry",
      strengthsKn: "ಯಂತ್ರೋಪಕರಣ ವಿನ್ಯಾಸ, ತಾಂತ್ರಿಕ ನಿರ್ಮಾಣ & ಪ್ರಾಯೋಗಿಕ ಸಮಸ್ಯೆ ಪರಿಹಾರ",
      strengthsEn: "Machinery Design, Technical Construction & Practical Engineering"
    },
    medical_healthcare: {
      nameKn: "ವೈದ್ಯಕೀಯ ರಂಗ, ಆರೋಗ್ಯ ಸೇವೆ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ & ಫಾರ್ಮಸಿ",
      nameEn: "Medical Practice, Surgery, Healthcare & Pharmacy",
      strengthsKn: "ರೋಗ ನಿವಾರಣೆ, ರೋಗಿ ಸಾಂತ್ವನ, ಔಷಧಿ ಜ್ಞಾನ & ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಏಕಾಗ್ರತೆ",
      strengthsEn: "Diagnostics, Patient Healing, Pharmacology & Clinical Focus"
    },
    legal_judiciary: {
      nameKn: "ಕಾನೂನು, ವಕೀಲ ವೃತ್ತಿ, ಸಲಹೆಗಾರರು & ನ್ಯಾಯಾಂಗ ಸೇವೆ",
      nameEn: "Law, Legal Practice, Advisory & Judiciary",
      strengthsKn: "ಕಾನೂನು ವಾದ-ವಿವಾದ, ಸಾಕ್ಷ್ಯಾಧಾರ ವಿಶ್ಲೇಷಣೆ & ನ್ಯಾಯಪರ ತೀರ್ಪು",
      strengthsEn: "Legal Advocacy, Evidence Analysis, Arbitration & Jurisprudence"
    },
    creative_media: {
      nameKn: "ಕಲಾ ಮಾಧ್ಯಮ, ಪತ್ರಿಕೋದ್ಯಮ, ಸೃಜನಶೀಲತೆ & ಗ್ರಾಫಿಕ್ ಡಿಸೈನ್",
      nameEn: "Creative Arts, Media, Journalism & Design",
      strengthsKn: "ಸೃಜನಶೀಲ ಬರವಣಿಗೆ, ಕಲಾತ್ಮಕ ಕಲ್ಪನೆ, ಮಾಧ್ಯಮ ಪ್ರಸಾರ & ವಿನ್ಯಾಸ",
      strengthsEn: "Creative Writing, Artistic Imagination, Media Broadcast & Visual Design"
    },
    priest_vedic_astrology: {
      nameKn: "ವೇದ ಅಧ್ಯಯನ, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ, ಇತಿಹಾಸ & ಪೌರೋಹಿತ್ಯ",
      nameEn: "Vedic Studies, Astrology, Philosophy & Priesthood",
      strengthsKn: "ಸಂಸ್ಕೃತ-ವೇದ ಪಾಂಡಿತ್ಯ, ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ, ಧಾರ್ಮಿಕ ಪೂಜಾ ವಿಧಿ & ಪುರಾತನ ಇತಿಹಾಸ",
      strengthsEn: "Vedic Scholarship, Astrological Guidance, Rituals & Ancient History"
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
        verdictKn,
        verdictEn
      };
    });

  // -------------------------------------------------------------
  // SUBJECT & ACADEMIC APTITUDES (6 CORE DISCIPLINES)
  // Maths, Science/Tech, Rajakiya/Admin, Commerce, Arts, History/Law
  // -------------------------------------------------------------
  const fifthSignIndex = (lagnaIndex + 4) % 12;
  const fifthLord = signLord(fifthSignIndex);
  const fifthLordPlanet = kundli.planets.find(p => p.name === fifthLord);

  // 1. Maths & Analytical Logic (Mercury, Mars, Ketu, 5th)
  let mathsScore = 62;
  if (mercury && [1, 2, 4, 5, 7, 9, 10, 11].includes(mercury.house)) mathsScore += 12;
  if (mercury && [2, 5].includes(mercury.rashi.index)) mathsScore += 10;
  if (mars && [1, 4, 7, 10].includes(houseDistance(mars.house, mercury?.house ?? 1))) mathsScore += 6;
  if (fifthLordPlanet && [PlanetName.Mercury, PlanetName.Mars, PlanetName.Ketu].includes(fifthLord)) mathsScore += 8;
  mathsScore = Math.min(96, Math.max(58, mathsScore));

  // 2. Science & Technology (Mars, Rahu, Sun, Saturn)
  let scienceScore = 60;
  if (mars && [1, 4, 5, 7, 9, 10, 11].includes(mars.house)) scienceScore += 12;
  if (rahu && [3, 6, 10, 11].includes(rahu.house)) scienceScore += 10;
  if (sun && [1, 10].includes(sun.house)) scienceScore += 8;
  if (saturn && [6, 7].includes(saturn.rashi.index)) scienceScore += 6;
  scienceScore = Math.min(96, Math.max(58, scienceScore));

  // 3. Rajakiya, Governance & Administration (Sun, Mars, 10th Kendra)
  let rajakiyaScore = 58;
  if (sun && sun.house === 10) rajakiyaScore += 18;
  else if (sun && [1, 5, 9].includes(sun.house)) rajakiyaScore += 12;
  if (sun && [0, 4].includes(sun.rashi.index)) rajakiyaScore += 10;
  if (mars && [1, 10].includes(mars.house)) rajakiyaScore += 8;
  if ([0, 4, 8].includes(tenthSignIndex)) rajakiyaScore += 6;
  rajakiyaScore = Math.min(96, Math.max(52, rajakiyaScore));

  // 4. Commerce, Banking & Trade (Mercury, Jupiter, 2nd & 11th)
  let commerceScore = 60;
  if (mercury && [1, 5].includes(mercury.rashi.index)) commerceScore += 10;
  if (jupiter && [1, 2, 4, 5, 9, 10, 11].includes(jupiter.house)) commerceScore += 12;
  if (jupiter && [3, 8, 11].includes(jupiter.rashi.index)) commerceScore += 8;
  if (planetsIn10thNames.includes(PlanetName.Mercury) || planetsIn10thNames.includes(PlanetName.Jupiter)) commerceScore += 6;
  commerceScore = Math.min(96, Math.max(55, commerceScore));

  // 5. Arts, Creative Expression & Media (Venus, Moon, Mercury)
  let artsScore = 58;
  if (venus && [1, 6, 11].includes(venus.rashi.index)) artsScore += 14;
  if (venus && [1, 4, 5, 9, 10, 11].includes(venus.house)) artsScore += 10;
  if (moon && [1, 3, 11].includes(moon.rashi.index)) artsScore += 8;
  if (planetsIn10thNames.includes(PlanetName.Venus)) artsScore += 6;
  artsScore = Math.min(96, Math.max(52, artsScore));

  // 6. History, Law, Philosophy & Vedic/Dharma (Jupiter, Saturn, Ketu)
  let historyLawScore = 58;
  if (jupiter && [8, 11, 3].includes(jupiter.rashi.index)) historyLawScore += 12;
  if (saturn && [8, 9, 10].includes(saturn.house)) historyLawScore += 10;
  if (ketu && [9, 10, 12].includes(ketu.house)) historyLawScore += 10;
  if (ninthLordPlanet && [1, 5, 9, 10].includes(ninthLordPlanet.house)) historyLawScore += 6;
  historyLawScore = Math.min(96, Math.max(52, historyLawScore));

  const getRatingKn = (score: number): "ಅತ್ಯುನ್ನತ (Excellent)" | "ಉತ್ತಮ (Good)" | "ಸಾಧಾರಣ (Average)" =>
    score >= 85 ? "ಅತ್ಯುನ್ನತ (Excellent)" : score >= 72 ? "ಉತ್ತಮ (Good)" : "ಸಾಧಾರಣ (Average)";
  const getRatingEn = (score: number): "Excellent" | "Good" | "Average" =>
    score >= 85 ? "Excellent" : score >= 72 ? "Good" : "Average";

  const subjectAptitudes: SubjectAptitude[] = [
    {
      code: "maths_analytics" as SubjectCode,
      nameKn: "ಗಣಿತ & ವಿಶ್ಲೇಷಣೆ (Maths & Analytics)",
      nameEn: "Mathematics & Analytical Logic",
      scorePercentage: mathsScore,
      ratingKn: getRatingKn(mathsScore),
      ratingEn: getRatingEn(mathsScore),
      planetaryIndicatorKn: `ಬುಧ (${PLANET_KN[PlanetName.Mercury]}) ಹಾಗೂ ಕುಜ (${PLANET_KN[PlanetName.Mars]}) ಪ್ರಭಾವ`,
      planetaryIndicatorEn: "Mercury & Mars analytical alignment"
    },
    {
      code: "science_technology" as SubjectCode,
      nameKn: "ವಿಜ್ಞಾನ & ತಂತ್ರಜ್ಞಾನ (Science & Technology)",
      nameEn: "Science, Technology & Engineering",
      scorePercentage: scienceScore,
      ratingKn: getRatingKn(scienceScore),
      ratingEn: getRatingEn(scienceScore),
      planetaryIndicatorKn: `ಕುಜ (${PLANET_KN[PlanetName.Mars]}) ಹಾಗೂ ರಾಹು (${PLANET_KN[PlanetName.Rahu]}) ಪ್ರಭಾವ`,
      planetaryIndicatorEn: "Mars & Rahu technological drive"
    },
    {
      code: "rajakiya_governance" as SubjectCode,
      nameKn: "ರಾಜಕೀಯ, ಆಡಳಿತ & ನಾಯಕತ್ವ (Politics & Administration)",
      nameEn: "Politics, Governance & Leadership",
      scorePercentage: rajakiyaScore,
      ratingKn: getRatingKn(rajakiyaScore),
      ratingEn: getRatingEn(rajakiyaScore),
      planetaryIndicatorKn: `ರವಿ (${PLANET_KN[PlanetName.Sun]} ರಾಜಕಾರಕ) ಹಾಗೂ 10ನೇ ಸ್ಥಾನ`,
      planetaryIndicatorEn: "Sun (Raja-karaka) & 10th house authority"
    },
    {
      code: "commerce_banking" as SubjectCode,
      nameKn: "ವಾಣಿಜ್ಯ & ಬ್ಯಾಂಕಿಂಗ್ (Commerce & Finance)",
      nameEn: "Commerce, Banking & Economics",
      scorePercentage: commerceScore,
      ratingKn: getRatingKn(commerceScore),
      ratingEn: getRatingEn(commerceScore),
      planetaryIndicatorKn: `ಗುರು (${PLANET_KN[PlanetName.Jupiter]}) ಹಾಗೂ ಬುಧ (${PLANET_KN[PlanetName.Mercury]}) ಯೋಗ`,
      planetaryIndicatorEn: "Jupiter & Mercury commercial conjunction"
    },
    {
      code: "arts_creativity" as SubjectCode,
      nameKn: "ಕಲೆ, ಸಾಹಿತ್ಯ & ಮಾಧ್ಯಮ (Arts & Creativity)",
      nameEn: "Arts, Literature & Creative Media",
      scorePercentage: artsScore,
      ratingKn: getRatingKn(artsScore),
      ratingEn: getRatingEn(artsScore),
      planetaryIndicatorKn: `ಶುಕ್ರ (${PLANET_KN[PlanetName.Venus]} ಕಲಾಕಾರಕ) ಹಾಗೂ ಚಂದ್ರ`,
      planetaryIndicatorEn: "Venus (Kala-karaka) & Moon aesthetics"
    },
    {
      code: "history_law_dharma" as SubjectCode,
      nameKn: "ಇತಿಹಾಸ, ಕಾನೂನು & ತತ್ವಶಾಸ್ತ್ರ (History, Law & Dharma)",
      nameEn: "History, Law, Philosophy & Vedic Dharma",
      scorePercentage: historyLawScore,
      ratingKn: getRatingKn(historyLawScore),
      ratingEn: getRatingEn(historyLawScore),
      planetaryIndicatorKn: `ಗುರು (${PLANET_KN[PlanetName.Jupiter]} ಧರ್ಮಕಾರಕ) ಹಾಗೂ ಶನಿ-ಕೇತು`,
      planetaryIndicatorEn: "Jupiter (Dharma) & Saturn-Ketu heritage"
    }
  ].sort((a, b) => b.scorePercentage - a.scorePercentage);

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

  return {
    ...baseProfile,
    topSuitableFields,
    subjectAptitudes,
    bestFieldsSummaryKn,
    bestFieldsSummaryEn
  };
}
