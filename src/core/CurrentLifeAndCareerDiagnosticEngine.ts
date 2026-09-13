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
  },
  dashaTiming?: { timelineKn?: string; timelineEn?: string; maha?: string; bhukti?: string },
  liveGochara?: {
    shaniHouseFromMoon?: number;
    guruHouseFromMoon?: number;
    rahuHouseFromMoon?: number;
    ketuHouseFromMoon?: number;
    isSadeSati?: boolean;
    isAshtamaShani?: boolean;
    isKantakaShani?: boolean;
  }
): CurrentLifeSituationDiagnosis {
  const age = context.devoteeAge ?? 30;
  const isFemale = context.gender === "Female";
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
  const lagnaLordPlanet = kundli.planets.find(p => p.name === signLord(lagnaIndex));

  const secondLord = signLord((lagnaIndex + 1) % 12);
  const secondLordPlanet = kundli.planets.find(p => p.name === secondLord);

  const thirdLord = signLord((lagnaIndex + 2) % 12);
  const thirdLordPlanet = kundli.planets.find(p => p.name === thirdLord);

  const fourthLord = signLord((lagnaIndex + 3) % 12);
  const fourthLordPlanet = kundli.planets.find(p => p.name === fourthLord);

  const fifthLord = signLord((lagnaIndex + 4) % 12);
  const fifthLordPlanet = kundli.planets.find(p => p.name === fifthLord);

  const seventhLord = signLord((lagnaIndex + 6) % 12);
  const seventhLordPlanet = kundli.planets.find(p => p.name === seventhLord);

  const tenthLord = signLord((lagnaIndex + 9) % 12);
  const tenthLordPlanet = kundli.planets.find(p => p.name === tenthLord);

  const eleventhLord = signLord((lagnaIndex + 10) % 12);
  const eleventhLordPlanet = kundli.planets.find(p => p.name === eleventhLord);

  const dashaTimeKn = dashaTiming?.timelineKn || "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ";
  const dashaTimeEn = dashaTiming?.timelineEn || "within the next 3 to 6 months";

  // Check Gochara transits
  const shaniMoon = liveGochara?.shaniHouseFromMoon ?? (saturn && moon ? houseDistance(moon.house, saturn.house) : 1);
  const isSadeSati = liveGochara?.isSadeSati ?? [12, 1, 2].includes(shaniMoon);
  const isAshtamaShani = liveGochara?.isAshtamaShani ?? (shaniMoon === 8);
  const isKantakaShani = liveGochara?.isKantakaShani ?? [4, 7, 10].includes(shaniMoon);

  // -------------------------------------------------------------
  // CRITERION 1: PROPERTY SHARE / FAMILY HOME DISPUTE (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಹಕ್ಕಿನ ಜಗಳ)
  // -------------------------------------------------------------
  let propertyDisputeScore = 0;
  if (mars && [4, 8].includes(mars.house)) propertyDisputeScore += 3.5;
  if (fourthLordPlanet && [6, 8, 12].includes(fourthLordPlanet.house)) propertyDisputeScore += 3.0;
  if (saturn && [4, 8, 10].includes(saturn.house)) propertyDisputeScore += 2.0;
  if (mars && saturn && [1, 4, 7, 8, 10].includes(houseDistance(saturn.house, mars.house))) propertyDisputeScore += 2.5;
  if (thirdLordPlanet && [6, 8, 12].includes(thirdLordPlanet.house)) propertyDisputeScore += 2.0;
  if (rahu && (rahu.house === 4 || rahu.house === 8)) propertyDisputeScore += 2.0;
  if (shaniMoon === 4 || isAshtamaShani) propertyDisputeScore += 2.0;

  // -------------------------------------------------------------
  // CRITERION 2: BUSINESS PARTNER DISTRUST / BETRAYAL (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ)
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

  // -------------------------------------------------------------
  // CRITERION 3: MARRIAGE DELAY / UNMARRIED PAST AGE (ವಿವಾಹ ವಿಳಂಬ)
  // -------------------------------------------------------------
  let marriageDelayScore = 0;
  const hasKujaDosha = Boolean(mars && [1, 2, 4, 7, 8, 12].includes(mars.house));
  if (saturn && saturn.house === 7) marriageDelayScore += 3.5;
  if (rahu && rahu.house === 7) marriageDelayScore += 3.0;
  if (ketu && ketu.house === 7) marriageDelayScore += 3.0;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house)) marriageDelayScore += 3.5;
  if (seventhLordPlanet?.isDebilitated) marriageDelayScore += 3.0;
  if (hasKujaDosha) marriageDelayScore += 2.0;
  if (venus && [6, 8, 12].includes(venus.house)) marriageDelayScore += 2.0;
  if (shaniMoon === 7) marriageDelayScore += 2.5;

  // -------------------------------------------------------------
  // CRITERION 4: MARITAL DISCORD / SEPARATION RISK (ದಾಂಪತ್ಯ ಬಿಕ್ಕಟ್ಟು)
  // -------------------------------------------------------------
  let maritalDiscordScore = 0;
  if (hasKujaDosha && (saturn?.house === 7 || saturn?.house === 8)) maritalDiscordScore += 4.5;
  if (seventhLordPlanet && [6, 8, 12].includes(seventhLordPlanet.house) && mars && [1, 7, 8].includes(mars.house)) maritalDiscordScore += 4.0;
  if (rahu && rahu.house === 7 && saturn && [3, 7, 10].includes(houseDistance(saturn.house, 7))) maritalDiscordScore += 3.5;

  // -------------------------------------------------------------
  // CRITERION 5: DELAYED CHILDBIRTH / PROGENY ANXIETY (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು)
  // -------------------------------------------------------------
  let childlessScore = 0;
  if (rahu && rahu.house === 5) childlessScore += 5.0;
  if (ketu && ketu.house === 5) childlessScore += 4.0;
  if (saturn && saturn.house === 5) childlessScore += 4.0;
  if (fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house)) childlessScore += 3.5;
  if (jupiter && [6, 8, 12].includes(jupiter.house)) childlessScore += 2.5;

  // -------------------------------------------------------------
  // CRITERION 6: WORKPLACE POLITICS, STAGNATION & LAYOFF RISK (ಉದ್ಯೋಗ ರಾಜಕೀಯ)
  // -------------------------------------------------------------
  let careerStagnationScore = 0;
  if (tenthLordPlanet && [6, 8, 12].includes(tenthLordPlanet.house)) careerStagnationScore += 3.5;
  if (saturn && saturn.house === 10) careerStagnationScore += 2.5;
  if (rahu && rahu.house === 10) careerStagnationScore += 2.5;
  if (sun && saturn && (sun.house === saturn.house || houseDistance(sun.house, saturn.house) === 7)) careerStagnationScore += 2.5;
  if (shaniMoon === 10 || isSadeSati) careerStagnationScore += 2.0;

  // -------------------------------------------------------------
  // CRITERION 7: DEBT & SPECULATION FINANCIAL SQUEEZE (ಸಾಲದ ಹೊರೆ & ಷೇರು ನಷ್ಟ)
  // -------------------------------------------------------------
  let debtScore = 0;
  const is5thRahuWithAfflicted5th = Boolean(rahu?.house === 5 && fifthLordPlanet && [6, 8, 12].includes(fifthLordPlanet.house));
  if (is5thRahuWithAfflicted5th) debtScore += 5.0;
  if (secondLordPlanet && [6, 8, 12].includes(secondLordPlanet.house)) debtScore += 3.0;
  if (eleventhLordPlanet && [6, 8, 12].includes(eleventhLordPlanet.house)) debtScore += 2.5;
  if (isAshtamaShani) debtScore += 2.5;

  // -------------------------------------------------------------
  // CRITERION 8: HEALTH & VITALITY EXHAUSTION (ಆರೋಗ್ಯ ಕ್ಲೇಶ)
  // -------------------------------------------------------------
  let healthScore = 0;
  if (lagnaLordPlanet && [6, 8, 12].includes(lagnaLordPlanet.house)) healthScore += 4.0;
  if (moon && [6, 8, 12].includes(moon.house)) healthScore += 3.0;
  if (sun && [6, 8, 12].includes(sun.house)) healthScore += 2.5;

  // -------------------------------------------------------------
  // ARBITRATION LOGIC GROUNDED IN AGE & LIFE REALITY
  // -------------------------------------------------------------

  // A. Child Stage (<14 years)
  if (age < 14) {
    return {
      category: "student_academic_stress",
      titleKn: "ಬಾಲ್ಯದ ಬೆಳವಣಿಗೆ, ವಿದ್ಯಾಭ್ಯಾಸದ ಒತ್ತಡ & ಏಕಾಗ್ರತೆಯ ಕೊರತೆ",
      titleEn: "Childhood Development, Schooling Pressure & Focus",
      headlineKn: "ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಏಕಾಗ್ರತೆಯ ಕೊರತೆ & ಬಾಲಗ್ರಹ ಪ್ರಭಾವ",
      headlineEn: "Academic Distraction, Screen Time & Formative Learning Pressure",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ${devoteeName} ಮಗುವಿಗೆ ${age} ವರ್ಷ ವಯಸ್ಸಾಗಿದ್ದು, ಶಾಲಾ ವಿದ್ಯಾಭ್ಯಾಸ, ಓದಿನಲ್ಲಿ ಗಮನ ಕೇಂದ್ರೀಕರಣ ಹಾಗೂ ಅತಿಯಾದ ಹಠ ಅಥವಾ ಡಿಜಿಟಲ್ ಪರದೆಯ ಗೀಳಿನಿಂದಾಗಿ ಪೋಷಕರಲ್ಲಿ ಸಣ್ಣ ಆತಂಕ ಮೂಡಿದೆ. ಮಗುವಿನ ಬುದ್ಧಿಕಾರಕ ಬುಧ ಹಾಗೂ 4ನೇ ಮನೆಯ ವಿದ್ಯಾ ಸ್ಥಾನದ ಮೇಲೆ ಗ್ರಹಗಳ ಚಂಚಲ ಸಂಚಾರವಿದ್ದು, ಓದಿನಲ್ಲಿ ಆಸಕ್ತಿ ಹೆಚ್ಚು ಮಾಡಲು ಪ್ರೀತಿಯ ಮಾರ್ಗದರ್ಶನ ಅಗತ್ಯವಾಗಿದೆ.`,
      detailedRealityEn: `At age ${age}, the child is navigating primary schooling, concentration hurdles, and academic expectations. The 4th house of learning and Mercury reflect mental restlessness requiring patient nurturing.`,
      planetaryCulpritKn: "4ನೇ ವಿದ್ಯಾ ಸ್ಥಾನದಲ್ಲಿ ಚಂಚಲ ಗ್ರಹಗಳ ಪ್ರಭಾವ ಹಾಗೂ ಬುಧನ ಸಾಧಾರಣ ಬಲ.",
      planetaryCulpritEn: "Restless planetary influence on the 4th house of learning and Mercury.",
      symptomsChecklistKn: [
        "ಓದಲು ಕುಳಿತಾಗ ಬೇಗನೆ ಗಮನ ಬೇರೆಡೆ ಹರಿಯುವುದು",
        "ತಿಂಡಿ-ಊಟದಲ್ಲಿ ಹಠ ಅಥವಾ ಸುಖನಿದ್ರೆಯ ವ್ಯತ್ಯಾಸ",
        "ಅತಿಯಾದ ಕೋಪ ಅಥವಾ ಹಠಮಾರಿ ನಡವಳಿಕೆ"
      ],
      symptomsChecklistEn: [
        "Wandering attention during study hours",
        "Picky eating habits or disturbed sleep cycles",
        "Occasional stubbornness under parental commands"
      ],
      severity: "moderate",
      reliefTimelineKn: `${dashaTimeKn} ಮಗುವಿನ ಗ್ರಹಣ ಶಕ್ತಿ ಮತ್ತು ಶಾಲಾ ಸಾಧನೆ ಗಮನಾರ್ಹವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, memory power and academic engagement will improve markedly.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ವಿದ್ಯಾ ಗಣಪತಿ ಪೂಜೆ ಮತ್ತು ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.",
      gokarnaRemedyEn: "Sponsor Vidya Ganapati and Medha Dakshinamurthy Pooja at Sri Kshetra Gokarna."
    };
  }

  // B. Youth Stage (14 to 23 years)
  if (age <= 23) {
    return {
      category: "student_academic_stress",
      titleKn: "ಉನ್ನತ ಶಿಕ್ಷಣ / ವಿದ್ಯಾಭ್ಯಾಸ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ಒತ್ತಡ & ಭವಿಷ್ಯದ ವೃತ್ತಿ ಗೊಂದಲ",
      titleEn: "Higher Education, Competitive Exams & Career Pathway Anxiety",
      headlineKn: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳ ಒತ್ತಡ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಪ್ರವೇಶ & ವೃತ್ತಿ ಗೊಂದಲ",
      headlineEn: "Competitive Exam Strains, College Admissions & Career Crossroads",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ${age} ವರ್ಷದ ಈ ಪ್ರಮುಖ ತಾರುಣ್ಯದ ಘಟ್ಟದಲ್ಲಿ ನೀವು ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ, ಕಾಲೇಜು ಪ್ರವೇಶ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಅಥವಾ ಭವಿಷ್ಯದ ಉದ್ಯೋಗ ಬುನಾದಿಯ ತೀವ್ರ ಆಲೋಚನೆಯಲ್ಲಿದ್ದೀರಿ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಅಂಕಗಳು ಬರುವುದೇ ಅಥವಾ ಇಷ್ಟಪಟ್ಟ ಕೋರ್ಸ್ ಸಿಗುವುದೇ ಎಂಬ ಅನಿಶ್ಚಿತತೆ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿದೆ. ಆದರೆ ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ಸರಿಯಾದ ದಿಕ್ಕು ತೋರಿಸಲಿದೆ.`,
      detailedRealityEn: `At age ${age}, you are navigating crucial career foundation decisions, competitive exams, and college admissions with deep performance pressure.`,
      planetaryCulpritKn: "5ನೇ ಬೌದ್ಧಿಕ ಭಾವ ಹಾಗೂ 10ನೇ ಕರ್ಮ ಸ್ಥಾನಕ್ಕೆ ಸಂಪರ್ಕ ಕಲ್ಪಿಸುವ ದಶಾ ಸಂಚಾರ.",
      planetaryCulpritEn: "Transits activating 5th house of intellect and 10th house of career launch.",
      symptomsChecklistKn: [
        "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಫಲಿತಾಂಶದ ಆತಂಕ",
        "ಯಾವ ವೃತ್ತಿ ರಂಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿಕೊಳ್ಳಬೇಕೆಂಬ ಆಂತರಿಕ ಗೊಂದಲ",
        "ಸ್ನೇಹಿತರೊಂದಿಗೆ ಹೋಲಿಸಿಕೊಂಡು ಉಂಟಾಗುವ ಮಾನಸಿಕ ಒತ್ತಡ"
      ],
      symptomsChecklistEn: [
        "Exam tension and anticipation of competitive rank results",
        "Crossroads regarding optimal career stream selection",
        "Peer performance comparisons generating transient anxiety"
      ],
      severity: "high",
      reliefTimelineKn: `${dashaTimeKn} ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು ಮತ್ತು ಸ್ಪಷ್ಟ ಪ್ರವೇಶಾವಕಾಶ ಸಿಗಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, clear educational breakthroughs and admissions will materialize.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸರಸ್ವತಿ ಆರಾಧನೆ ಹಾಗೂ ಮಹಾಗಣಪತಿ ಹೋಮ ಸಮರ್ಪಿಸಿ.",
      gokarnaRemedyEn: "Perform Saraswati Pooja and Mahaganapati Homa at Sri Kshetra Gokarna."
    };
  }

  // C. Property / Family Share Dispute (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಹಕ್ಕು ವಿವಾದ)
  if (age >= 28 && propertyDisputeScore >= 5.0) {
    return {
      category: "property_share_dispute",
      titleKn: "ಆಸ್ತಿ ಪಾಲು, ಮನೆಯ ಹಕ್ಕು ವಿವಾದ & ನ್ಯಾಯಯುತ ಪಾಲಿಗಾಗಿ ಕಠಿಣ ಹೋರಾಟ",
      titleEn: "Property Partition, Family Inheritance Dispute & Legal Share Struggle",
      headlineKn: "ಕುಟುಂಬದ ಆಸ್ತಿ ಪಾಲು, ಮನೆಯ ಹಕ್ಕು ವಿವಾದ & ನಂಬಿಕೆದ್ರೋಹದ ಸಂಕಷ್ಟ",
      headlineEn: "Ancestral Property Dispute, Delayed Family Partition & Rights Struggle",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ತೀವ್ರವಾಗಿ ಕಾಡುತ್ತಿರುವ ವಾಸ್ತವವೆಂದರೆ — ಕುಟುಂಬದ ಪೂರ್ವಜರ ಆಸ್ತಿ ಪಾಲು, ಮನೆಯ ಹಕ್ಕು ಅಥವಾ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಭೂಮಿಯ ವಿಭಾಗದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ವಿವಾದ. ನಿಮ್ಮ ನ್ಯಾಯಯುತವಾದ ಪಾಲನ್ನು ನೀಡದೆ ಸತಾಯಿಸುವುದು, ಸಹೋದರರು ಅಥವಾ ಹತ್ತಿರದ ಸಂಬಂಧಿಗಳಿಂದ ನಂಬಿಕೆದ್ರೋಹ, ದಾಖಲೆಪತ್ರಗಳ ಗೋಲ್‌ಮಾಲ್ ಅಥವಾ ಕೋರ್ಟು/ಪಂಚಾಯಿತಿ ವ್ಯಾಜ್ಯಗಳಂತಹ ಅಸಹನೀಯ ಸಂಕಷ್ಟವನ್ನು ನೀವು ಪ್ರಸ್ತುತ ಎದುರಿಸುತ್ತಿದ್ದೀರಿ. ನಿಮ್ಮ ಬೆವರು-ಶ್ರಮದ ಹಕ್ಕನ್ನು ಕಸಿದುಕೊಳ್ಳಲು ಕೆಲವರು ಸಂಚು ಮಾಡುತ್ತಿರುವ ನೋವು ನಿಮ್ಮನ್ನು ದಿನನಿತ್ಯ ಕಾಡುತ್ತಿದೆ.`,
      detailedRealityEn: `Currently, the most pressing battle in your daily life is an agonizing family property dispute or ancestral inheritance partition. Unfair withholding of your rightful share, betrayal by brothers/relatives, disputed paperwork, or settlement delays are inflicting intense stress.`,
      planetaryCulpritKn: "4ನೇ ಭೂಮಿ-ಗೃಹ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ-ಶನಿಗಳ ತೀವ್ರ ಕಂಟಕ ದೋಷ ಹಾಗೂ 8ನೇ ಅಧಿಪತಿಯ ಪ್ರಭಾವ.",
      planetaryCulpritEn: "Afflicted 4th house of property by Mars-Saturn opposition combined with 8th house lord tension.",
      symptomsChecklistKn: [
        "ನ್ಯಾಯಯುತವಾಗಿ ಸಿಗಬೇಕಾದ ಆಸ್ತಿ ಅಥವಾ ಮನೆಯ ಪಾಲನ್ನು ಹಂಚಲು ವಿಳಂಬ ಮತ್ತು ಕುಂಟು ನೆಪಗಳು",
        "ಕುಟುಂಬದ ಆಪ್ತರು ಅಥವಾ ಪಾಲುದಾರರಿಂದ ಮುಖವಾಡದ ನಡವಳಿಕೆ ಮತ್ತು ನಂಬಿಕೆದ್ರೋಹ",
        "ಆಸ್ತಿ ದಾಖಲೆಗಳು, ಸರ್ವೆ ಅಥವಾ ಖಾತಾ ಬದಲಾವಣೆಯಲ್ಲಿ ಎದುರಾಗುತ್ತಿರುವ ಕೃತಕ ತಡೆಗಳು"
      ],
      symptomsChecklistEn: [
        "Unwarranted delays and excuses in partitioning rightful ancestral/family property",
        "Erosion of trust and deceptive maneuvers by relatives or co-owners",
        "Paperwork, registry, or mutation hurdles engineered by opposing claimants"
      ],
      severity: "critical",
      reliefTimelineKn: `${dashaTimeKn} ಗೋಚಾರ ಗ್ರಹಗಳ ಬದಲಾವಣೆಯೊಂದಿಗೆ ಮಾತುಕತೆ ಅಥವಾ ಕಾನೂನಿನಲ್ಲಿ ನಿಮ್ಮ ಪರವಾದ ಮಹತ್ವದ ತಿರುವು ಸಿಗಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, transit shifts will trigger a breakthrough in partition negotiations.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕಾಲಭೈರವ ಶಾಂತಿ, ಭೂಮಿ ಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ನವಗ್ರಹ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಿ.",
      gokarnaRemedyEn: "Perform Kalabhairava Shanti and Bhoomi Sukta Archana at Sri Kshetra Gokarna Mahabaleshwara."
    };
  }

  // D. Business Partner Distrust / Betrayal (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ)
  if (age >= 25 && partnerBetrayalScore >= 5.0 && partnerBetrayalScore >= careerStagnationScore && partnerBetrayalScore > marriageDelayScore) {
    return {
      category: "partner_distrust_betrayal",
      titleKn: "ವ್ಯಾಪಾರ ಪಾಲುದಾರರ ವಂಚನೆ, ಲೆಕ್ಕಪತ್ರ ಗೋಲ್‌ಮಾಲ್ & ನಂಬಿಕೆದ್ರೋಹ",
      titleEn: "Business Partner Betrayal, Account Deception & Broken Trust",
      headlineKn: "ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ನಂಬಿಕೆದ್ರೋಹ, ಹಣಕಾಸಿನ ವಂಚನೆ & ಸಂಶಯದ ವಾತಾವರಣ",
      headlineEn: "Commercial Partner Friction, Fiduciary Concealment & Trust Deficit",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ವೃತ್ತಿಪರ ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಆಘಾತಕಾರಿಯಾಗಿ ಕಾಡುತ್ತಿರುವ ಸತ್ಯವೆಂದರೆ — ನಿಮ್ಮೊಂದಿಗೆ ಕೈಜೋಡಿಸಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವ ವ್ಯಾಪಾರ ಪಾಲುದಾರರು (Business Partner) ಅಥವಾ ಆಪ್ತ ವ್ಯವಹಾರಸ್ಥರಿಂದ ಎದುರಾಗಿರುವ ಅಪನಂಬಿಕೆ ಮತ್ತು ವಂಚನೆ. ಹಣಕಾಸಿನ ಲೆಕ್ಕಪತ್ರಗಳನ್ನು ಮುಚ್ಚಿಡುವುದು, ನಿಮ್ಮನ್ನು ವಿಶ್ವಾಸಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳದೆ ಏಕಪಕ್ಷೀಯ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವುದು ಅಥವಾ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ಸಿಗಬೇಕಾದ ಲಾಭದ ಪಾಲನ್ನು ಮುಕ್ಕಾಗಿಸುವ ಕುತಂತ್ರಗಳಿಂದ ನೀವು ತೀವ್ರ ಆಕ್ರೋಶ ಮತ್ತು ಅಸಹಾಯಕತೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ.`,
      detailedRealityEn: `Currently, you are facing serious business partnership betrayal or commercial distrust. A business associate or co-venturer is withholding financial records, acting without transparency, or shortchanging your rightful dividends.`,
      planetaryCulpritKn: "7ನೇ ಪಾಲುದಾರಿಕೆ ಭಾವದಲ್ಲಿ ರಾಹು ಅಥವಾ ಶನಿಯ ಕ್ರೂರ ಪ್ರಭಾವ ಹಾಗೂ ಬುಧನ ಅಶುಭ ಸ್ಥಿತಿ.",
      planetaryCulpritEn: "Rahu/Saturn occupying the 7th house of partnerships afflicting business transparency.",
      symptomsChecklistKn: [
        "ವ್ಯಾಪಾರ ಪಾಲುದಾರರಿಂದ ಹಣದ ಲೆಕ್ಕಪತ್ರಗಳಲ್ಲಿ ಅಪಾರದರ್ಶಕತೆ ಮತ್ತು ಮುಚ್ಚಿಡುವ ಪ್ರವೃತ್ತಿ",
        "ನಿಮ್ಮ ಅನುಮತಿಯಿಲ್ಲದೆ ಪ್ರಮುಖ ವಹಿವಾಟು ನಡೆಸಿ ನಿಮ್ಮನ್ನು ಮೂಲೆಗುಂಪು ಮಾಡುವ ಯತ್ನ",
        "ಪಾಲುದಾರಿಕೆಯಿಂದ ಹೊರಬರಬೇಕೋ ಅಥವಾ ಕಾನೂನು ಹೋರಾಟ ನಡೆಸಬೇಕೋ ಎಂಬ ಅನಿಶ್ಚಿತತೆ"
      ],
      symptomsChecklistEn: [
        "Opaque account keeping and reluctance by partners to disclose full transactions",
        "Attempts to sideline you from executive decision making despite your initial capital/effort",
        "Dilemma between amicable exit or taking formal legal steps to safeguard your share"
      ],
      severity: "critical",
      reliefTimelineKn: `${dashaTimeKn} ಸತ್ಯವು ಬಯಲಾಗಲಿದ್ದು, ನಿಮ್ಮ ಹಣ ಹಾಗೂ ಹಕ್ಕಿನ ರಕ್ಷಣೆಗೆ ದೃಢ ಮಾರ್ಗ ಗೋಚರಿಸಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, truth will emerge allowing you to reclaim your assets with legal clarity.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ರಾಹು ಶಾಂತಿ ಹಾಗೂ ಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶತ್ರು ಬಾಧಾ ನಿವಾರಣಾ ಸಂಕಲ್ಪ ಮಾಡಿ.",
      gokarnaRemedyEn: "Perform Rahu Shanti and Shatru Badha Nivarana Sankalpa at Sri Kshetra Gokarna."
    };
  }

  // E. Marriage Delay / Unmarried Past Prime (ವಿವಾಹ ವಿಳಂಬ)
  if (age >= 25 && age <= 42 && marriageDelayScore >= 5.0 && marriageDelayScore >= careerStagnationScore) {
    return {
      category: "marriage_delay",
      titleKn: "ವಿವಾಹ ವಿಳಂಬ, ಬಂದ ಸಂಬಂಧಗಳು ಕೈತಪ್ಪುವುದು & ಕಂಕಣ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ",
      titleEn: "Marriage Delay, Proposal Breakdowns & Matrimonial Longing",
      headlineKn: "ವಿವಾಹ ವಿಳಂಬ, ಕೊನೆಕ್ಷಣದಲ್ಲಿ ಸಂಬಂಧಗಳು ಮುರಿದುಬೀಳುವುದು & ಕಂಕಣ ಭಾಗ್ಯದ ಕೊರಗು",
      headlineEn: "Unexplained Marriage Delays, Broken Alliances & Matrimonial Longing",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಪ್ರಮುಖ ಚಿಂತೆಯೆಂದರೆ — ವಯಸ್ಸು ಮೀರುತ್ತಿದ್ದರೂ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರದಿರುವುದು. ನೋಡಿದ ಸಂಬಂಧಗಳು ಆರಂಭದಲ್ಲಿ ಮೆಚ್ಚುಗೆಯಾಗಿ ಮಾತುಕತೆ ಮುಂದುವರಿದರೂ, ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಕಾರಣಗಳಿಗೆ ಮುರಿದುಬೀಳುತ್ತಿವೆ. ಜಾತಕ ಹೊಂದಾಣಿಕೆ ಇಲ್ಲವೆಂದು ತಿರಸ್ಕರಿಸುವುದು ಅಥವಾ ಮಾತುಕತೆ ನಡೆದು ಅರ್ಧಕ್ಕೆ ನಿಲ್ಲುವುದರಿಂದ, ಕುಟುಂಬದ ಹಿರಿಯರಲ್ಲೂ ಮತ್ತು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲೂ ತೀವ್ರ ಖಿನ್ನತೆ ಮತ್ತು ಅವ್ಯಕ್ತ ನೋವು ಆವರಿಸಿದೆ.`,
      detailedRealityEn: `Currently, marriage delay is your most deeply felt life struggle. Despite good character and qualifications, promising alliances fall apart at the final stage due to unforeseen matching roadblocks, causing heavy emotional distress.`,
      planetaryCulpritKn: "7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಶನಿ/ರಾಹುಗಳ ವಿಳಂಬ ಯೋಗ ಹಾಗೂ ಕುಜ ದೋಷದ ಪ್ರಭಾವ.",
      planetaryCulpritEn: "Saturn/Rahu delaying aspects on the 7th house of marriage combined with Kuja Dosha.",
      symptomsChecklistKn: [
        "ಬಂದ ಒಳ್ಳೆಯ ಮದುವೆ ಸಂಬಂಧಗಳು ಕೊನೆಯ ಹಂತದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ತಪ್ಪಿಹೋಗುವುದು",
        "ಕುಟುಂಬದಲ್ಲಿ ಮದುವೆಯ ವಿಷಯವಾಗಿ ನಿರಂತರ ಆತಂಕ ಮತ್ತು ಸಮಾಜದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮುಜುಗರ",
        "ಮನಸ್ಸಿಗೆ ಒಪ್ಪುವ ಸೂಕ್ತ ಗುಣವಂತ ಬಾಳಸಂಗಾತಿಗಾಗಿ ಸುದೀರ್ಘ ಕಾಯುವಿಕೆ"
      ],
      symptomsChecklistEn: [
        "Promising matrimonial proposals falling through abruptly at the negotiation stage",
        "Persistent anxiety in the family and uncomfortable social inquiries regarding marriage",
        "A deep internal wait for an understanding, compatible life partner"
      ],
      severity: "high",
      reliefTimelineKn: `${dashaTimeKn} ಕಂಕಣ ಬಲ ಕೂಡಿಬರಲಿದ್ದು, ಯೋಗ್ಯ ಸಂಬಂಧದ ನಿಶ್ಚಿತಾರ್ಥ ನೆರವೇರಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, matrimonial obstacles will dissolve, inaugurating a promising alliance.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ ಸಮರ್ಪಿಸಿ.",
      gokarnaRemedyEn: "Sponsor Uma-Maheshwara Kalyana and Swayamvara Parvati Homa at Sri Kshetra Gokarna."
    };
  }

  // F. Delayed Childbirth / Progeny Anxiety (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು)
  if (age >= 25 && age <= 48 && childlessScore >= 4.0) {
    return {
      category: "childless_anxiety",
      titleKn: "ಸಂತಾನ ಭಾಗ್ಯ ವಿಳಂಬ, ವಂಶೋದ್ಧಾರದ ಕೊರಗು & ದೈವಿಕ ರಕ್ಷೆಯ ನಿರೀಕ್ಷೆ",
      titleEn: "Delayed Childbirth, Progeny Anxiety & Spiritual Longing for an Offspring",
      headlineKn: "ಸಂತಾನ ಪ್ರಾಪ್ತಿಯಲ್ಲಿ ವಿಳಂಬ, ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆ ನಡುವೆಯೂ ಫಲ ಸಿಗದಿರುವ ಕೊರಗು",
      headlineEn: "Delayed Childbirth Anxiety, Emotional Exhaustion & Longing for Progeny",
      detailedRealityKn: `ಮದುವೆಯಾಗಿ ವರ್ಷಗಳು ಕಳೆದರೂ ಮುದ್ದಾದ ಮಗುವಿನ ಮುಖ ನೋಡುವ ಸೌಭಾಗ್ಯ ವಿಳಂಬವಾಗುತ್ತಿರುವುದು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಟುಂಬದ ಅತ್ಯಂತ ನೋವಿನ ವಾಸ್ತವವಾಗಿದೆ. ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಸಾಮಾನ್ಯವೆಂದು ತೋರಿಸಿದರೂ ಗರ್ಭಧಾರಣೆಯಾಗದಿರುವುದು, ನಿರಂತರ ಪ್ರಯತ್ನಗಳ ನಡುವೆಯೂ ನಿರಾಶೆಯಾಗುತ್ತಿರುವುದು ನಿಮ್ಮ ದಾಂಪತ್ಯದಲ್ಲಿ ಗಾಢವಾದ ನೋವನ್ನು ಉಂಟುಮಾಡಿದೆ. ಜಾತಕದಲ್ಲಿರುವ ಸರ್ಪ/ರಾಹು ದೋಷ ಹಾಗೂ ಪಿತೃ ಕರ್ಮದ ಅಡಚಣೆಯೇ ಇದಕ್ಕೆ ಮುಖ್ಯ ಕಾರಣ.`,
      detailedRealityEn: `Currently, delayed conception is your most heartbreaking private struggle. Despite sincere prayers and medical efforts, the delay in blessing your home with a child weighs heavily on your spirit.`,
      planetaryCulpritKn: "5ನೇ ಸಂತಾನ ಸ್ಥಾನದಲ್ಲಿ ರಾಹು/ಕೇತುಗಳ ನಾಗದೋಷ ಹಾಗೂ ಗುರು ಬಲದ ಕೊರತೆ.",
      planetaryCulpritEn: "Naga Dosha from Rahu/Ketu afflicting the 5th house of progeny and Putrakaraka Jupiter.",
      symptomsChecklistKn: [
        "ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಗಳು ನಡೆದರೂ ಗರ್ಭಧಾರಣೆಯಲ್ಲಿ ಪುನರಾವರ್ತಿತ ಅಡೆತಡೆಗಳು",
        "ಮನೆಯಲ್ಲಿ ಮಗುವಿನ ನಗುವಿಗಾಗಿ ಹಂಬಲಿಸುತ್ತಿರುವ ದಂಪತಿಯ ಆಂತರಿಕ ಮಾನಸಿಕ ಸಂಕಟ",
        "ವಂಶವೃದ್ಧಿಯ ಬಗ್ಗೆ ಹಿರಿಯರ ಕಳವಳ ಹಾಗೂ ಶುಭ ಸಮಾರಂಭಗಳಲ್ಲಿ ಮುಜುಗರ"
      ],
      symptomsChecklistEn: [
        "Medical investigations revealing no decisive defect yet conception eludes attempts",
        "Deep emotional strain and yearning between the couple for their own child",
        "Family pressure and social discomfort surrounding childbirth questions"
      ],
      severity: "high",
      reliefTimelineKn: `${dashaTimeKn} ನಾಗದೋಷ ನಿವಾರಣೆಯಾದ ನಂತರ ಗರ್ಭಧಾರಣೆಯ ಶುಭ ಸುದ್ದಿ ಲಭಿಸಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, after Naga Shanti, auspicious tidings of conception will arrive.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ನಾಗ ಪ್ರತಿಷ್ಠಾಪನೆ, ಸಂತಾನ ಗೋಪಾಲ ಹೋಮ ಹಾಗೂ ಆಶ್ಲೇಷ ಬಲಿ ಸೇವೆ ನೆರವೇರಿಸಿ.",
      gokarnaRemedyEn: "Perform Naga Pratishthapane and Santana Gopala Homa at holy Gokarna Kotiteertha."
    };
  }

  // G. Marital Discord / Communication Breakdown (ದಾಂಪತ್ಯ ಬಿಕ್ಕಟ್ಟು)
  if (age >= 24 && maritalDiscordScore >= 4.5) {
    return {
      category: "marital_discord",
      titleKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು, ಹೊಂದಾಣಿಕೆಯಿಲ್ಲದ ಸಂಘರ್ಷ & ವಿರಹ",
      titleEn: "Acute Marital Friction, Estrangement & Relationship Crisis",
      headlineKn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಸಣ್ಣ ಮಾತಿಗೂ ಭುಗಿಲೇಳುವ ಜಗಳ, ತಪ್ಪು ತಿಳುವಳಿಕೆ & ದೂರವಾಗುವ ಭೀತಿ",
      headlineEn: "Volatile Marital Arguments, Emotional Estrangement & Cohabitation Stress",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಅಶಾಂತಿ ಮತ್ತು ಪರಸ್ಪರ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ಮಿತಿಮೀರಿವೆ. ಸಣ್ಣ ಮಾತೂ ಕೂಡ ದೊಡ್ಡ ಜಗಳವಾಗಿ ಪರಿವರ್ತನೆಗೊಳ್ಳುವುದು, ಸಂಗಾತಿಯ ಕಡೆಯಿಂದ ಕಟುವಾದ ಮಾತುಗಳು, ಪರಸ್ಪರ ಗೌರವವಿಲ್ಲದ ವರ್ತನೆ ಅಥವಾ ಮಾತುಕತೆಯೇ ಕಡಿದುಹೋಗಿ ಪ್ರತ್ಯೇಕವಾಗಿ ವಾಸಿಸುವಂತಹ ಗಂಭೀರ ಪರಿಸ್ಥಿತಿಯನ್ನು ನೀವು ಎದುರಿಸುತ್ತಿದ್ದೀರಿ. ಹೊರಗೆ ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ ಎಂದು ನಟಿಸಿದರೂ, ಮನೆಯೊಳಗೆ ನೆಮ್ಮದಿಯೇ ಇಲ್ಲದ ನರಕಯಾತನೆ ನಿಮ್ಮನ್ನು ದಹಿಸುತ್ತಿದೆ.`,
      detailedRealityEn: `Currently, you are enduring acute marital friction and emotional alienation. Small sparks erupt into bitter arguments, cold silence replaces affection, and threats of separation loom over the household.`,
      planetaryCulpritKn: "7ನೇ ಮನೆಯ ಮೇಲೆ ಕುಜ ಮತ್ತು ಶನಿಯ ಕ್ರೂರ ದೃಷ್ಟಿ ಹಾಗೂ ಲಗ್ನ-ಕಳತ್ರಾಧಿಪತಿಗಳ ಶಡಾಷ್ಟಕ ಸ್ಥಿತಿ.",
      planetaryCulpritEn: "Adverse Mars-Saturn mutual aspects on the 7th house and Shadashtaka lords disposition.",
      symptomsChecklistKn: [
        "ಪ್ರತಿನಿತ್ಯ ಕ್ಷುಲ್ಲಕ ಕಾರಣಗಳಿಗೂ ಮನೆಯಲ್ಲಿ ಕಿರಿಕಿರಿ ಮತ್ತು ವಾಗ್ವಾದ",
        "ಸಂಗಾತಿಯ ಕಠಿಣ ಅಹಂಕಾರ ಮತ್ತು ಹೊಂದಾಣಿಕೆ ಮಾಡಿಕೊಳ್ಳಲು ಸಂಪೂರ್ಣ ನಿರಾಕರಣೆ",
        "ಕುಟುಂಬದ ಮೂರನೇ ವ್ಯಕ್ತಿಗಳ ಹಸ್ತಕ್ಷೇಪದಿಂದಾಗಿ ದಾಂಪತ್ಯದ ಸಂಬಂಧ ಇನ್ನಷ್ಟು ಹಳಸುವುದು"
      ],
      symptomsChecklistEn: [
        "Daily arguments sparked by insignificant domestic disagreements",
        "Ego clashes and unwillingness to make mutual compromises",
        "Toxic interference from external third parties aggravating marital tension"
      ],
      severity: "critical",
      reliefTimelineKn: `${dashaTimeKn} ಗ್ರಹಗಳ ಶಾಂತಿಯ ನಂತರ ಸಂಗಾತಿಯ ಮನಸ್ಸು ಕರಗಿ ಮಾತುಕತೆ ಸುಧಾರಿಸಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, remedial propitiation will soften tensions and reopen dialogue.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಹಾಗೂ 2 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ.",
      gokarnaRemedyEn: "Perform Uma-Maheshwara Shanti at Sri Kshetra Gokarna and wear a 2-Mukhi Rudraksha."
    };
  }

  // H. Crushing Debt / Financial Squeeze (ಸಾಲದ ಹೊರೆ & ಷೇರು ನಷ್ಟ)
  if (age >= 25 && debtScore >= 4.5) {
    return {
      category: "debt_financial_crisis",
      titleKn: "ಸಾಲದ ಹೊರೆ, ಷೇರು ಮಾರುಕಟ್ಟೆ ನಷ್ಟ & ಆದಾಯ-ವೆಚ್ಚದ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು",
      titleEn: "Crushing Debt Pressure, Trading Capital Losses & Cash Flow Crisis",
      headlineKn: "ಆದಾಯಕ್ಕಿಂತ ಖರ್ಚು ಹೆಚ್ಚು, ಷೇರು/ವ್ಯಾಪಾರ ನಷ್ಟ ಹಾಗೂ ತೀರಿಸಲಾಗದ ಸಾಲದ ಸುಳಿ",
      headlineEn: "Severe Debt Liabilities, Trading Capital Erosion & Liquid Cash Freeze",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ಉಸಿರುಗಟ್ಟಿಸುತ್ತಿದೆ. ಷೇರು ಮಾರುಕಟ್ಟೆ (Trading/Speculation), ಅತಿಯಾದ ನಂಬಿಕೆಯಿಂದ ಮಾಡಿದ ಹೂಡಿಕೆ ಅಥವಾ ವ್ಯವಹಾರದಲ್ಲಿ ಕೈಸುಟ್ಟುಕೊಂಡು ಭಾರಿ ಬಂಡವಾಳ ನಷ್ಟ ಅನುಭವಿಸಿದ್ದೀರಿ. ತಿಂಗಳ ಇಎಂಐಗಳು, ಸಾಲದ ಬಡ್ಡಿ ಹಾಗೂ ಬಾಕಿ ಪಾವತಿಸಲು ಕೈಯಲ್ಲಿ ಹಣವಿಲ್ಲದೆ ಸಾಲ ತೀರಿಸಲು ಮತ್ತೊಂದು ಸಾಲ ಮಾಡುವ ಸುಳಿಗೆ ಸಿಲುಕಿದ್ದೀರಿ. ಗೌರವ ಉಳಿಸಿಕೊಳ್ಳಲು ಹಣ ಹೊಂದಿಸುವುದು ದಿನನಿತ್ಯದ ಅತಿ ದೊಡ್ಡ ಸವಾಲಾಗಿದೆ.`,
      detailedRealityEn: `Currently, financial obligations and speculative or business losses are suffocating your peace of mind. Mounting EMIs, unexpected cash drain, and debt recycling have created acute monetary stress.`,
      planetaryCulpritKn: "5ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು (ಸ್ಪೆಕ್ಯುಲೇಶನ್ ನಷ್ಟ) ಹಾಗೂ 2ನೇ ಧನ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿಯ ಅಷ್ಟಮ ಪ್ರಭಾವ.",
      planetaryCulpritEn: "Rahu in 5th driving speculative losses combined with 2nd lord dusthana affliction.",
      symptomsChecklistKn: [
        "ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳಲ್ಲಿ ದೊಡ್ಡ ಮೊತ್ತದ ಹಣ ಕಳೆದುಕೊಂಡಿರುವುದು",
        "ಬ್ಯಾಂಕ್ ಇಎಂಐ ಮತ್ತು ಸಾಲಿಗರ ಕರೆಗಳಿಗೆ ಉತ್ತರ ನೀಡಲು ದಿನನಿತ್ಯ ಮಾನಸಿಕ ಒತ್ತಡ",
        "ಬಂದ ಹಣ ಕೈಯಲ್ಲಿ ನಿಲ್ಲದೆ ನಿಮಿಷಗಳಲ್ಲಿ ಖರ್ಚಾಗಿ ಹೋಗುವ ಧನ ಸೋರಿಕೆಯ ಸ್ಥಿತಿ"
      ],
      symptomsChecklistEn: [
        "Heavy capital losses incurred in stock options, crypto, or unvetted speculation",
        "Anxiety over bank installment deadlines and mounting debt obligations",
        "Rapid financial leakage where incoming income vanishes instantly into dues"
      ],
      severity: "critical",
      reliefTimelineKn: `${dashaTimeKn} ಸಾಲದ ಮರುಹೊಂದಾಣಿಕೆ ಹಾಗೂ ಹೊಸ ಆದಾಯದ ಮೂಲ ತೆರೆದುಕೊಂಡು ಬಿಕ್ಕಟ್ಟು ತಗ್ಗಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, debt restructuring and alternate revenue streams will bring vital respite.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಗಣಪತಿ ಹೋಮ ಹಾಗೂ ಋಣವಿಮೋಚಕ ಕುಬೇರ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ.",
      gokarnaRemedyEn: "Perform Mahaganapati Homa and Runa Vimochana Kubera Sankalpa at Sri Kshetra Gokarna."
    };
  }

  // I. Workplace Politics, Stagnation & Layoff Fear (ಉದ್ಯೋಗ ರಾಜಕೀಯ)
  if (age >= 24 && age <= 58 && careerStagnationScore >= 3.5) {
    return {
      category: "career_politics_layoff",
      titleKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಆಂತರಿಕ ರಾಜಕೀಯ, ಮನ್ನಣೆಯ ಕೊರತೆ & ಅನಿಶ್ಚಿತತೆ",
      titleEn: "Workplace Politics, Professional Stagnation & Stalled Growth",
      headlineKn: "ಪರಿಶ್ರಮಕ್ಕೆ ಸಿಗದ ಮನ್ನಣೆ, ಕಚೇರಿ ರಾಜಕೀಯ, ಬಡ್ತಿ ವಿಳಂಬ & ಉದ್ಯೋಗ ಅಸ್ಥಿರತೆ",
      headlineEn: "Unrecognized Sincere Effort, Corporate Politics & Promotion Delays",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ವಾತಾವರಣವು ಅತ್ಯಂತ ಕಿರಿಕಿರಿಯಿಂದ ಕೂಡಿದೆ. ನೀವು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಕಷ್ಟಪಟ್ಟು ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದರೂ, ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ನಿರೀಕ್ಷಿತ ಮನ್ನಣೆ ಸಿಗುತ್ತಿಲ್ಲ; ಬದಲಾಗಿ ಇತರರು ನಿಮ್ಮ ಕೆಲಸದ ಕ್ರೆಡಿಟ್ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದಾರೆ. ಕಚೇರಿ ರಾಜಕೀಯ, ಬಡ್ತಿ ವಿಳಂಬ, ಅನಗತ್ಯ ಕೆಲಸದ ಒತ್ತಡ ಅಥವಾ ಸಂಸ್ಥೆಯ ಅನಿಶ್ಚಿತತೆಯಿಂದಾಗಿ ಉದ್ಯೋಗ ಬದಲಾಯಿಸಬೇಕೆಂಬ ಆಲೋಚನೆ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿದೆ.`,
      detailedRealityEn: `Currently, your workplace environment is rife with unfair politics and lack of recognition. Despite your sincere dedication, credit is misappropriated by others, promotions stall, and career uncertainty causes anxiety.`,
      planetaryCulpritKn: "10ನೇ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಶನಿ-ರಾಹುಗಳ ನೆರಳು ಹಾಗೂ ರವಿ ಗ್ರಹದ ಮೇಲಿನ ಪಾಪ ದೃಷ್ಟಿ.",
      planetaryCulpritEn: "Saturn-Rahu tension afflicting the 10th house of career and Sun's professional status.",
      symptomsChecklistKn: [
        "ರಾತ್ರಿ-ಹಗಲು ದುಡಿದರೂ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ ಅಥವಾ ಮೇಲಧಿಕಾರಿಗಳಿಂದ ನಿರೀಕ್ಷಿತ ಪ್ರಶಂಸೆ ಸಿಗದಿರುವುದು",
        "ಸಹೋದ್ಯೋಗಿಗಳ ಗುಂಪುಗಾರಿಕೆ ಹಾಗೂ ಕಚೇರಿ ರಾಜಕೀಯಕ್ಕೆ ಬಲಿಯಾಗುತ್ತಿರುವ ಭಾವನೆ",
        "ಪ್ರಸ್ತುತ ಕೆಲಸ ಬಿಟ್ಟು ಹೊಸ ಉತ್ತಮ ಉದ್ಯೋಗಕ್ಕೆ ಬದಲಾಗುವ ತೀವ್ರ ತುಡಿತ"
      ],
      symptomsChecklistEn: [
        "Unrecognized hard work while peers take undue credit for team outcomes",
        "Feeling targeted by workplace cliques or unsupportive managerial oversight",
        "Strong urge to transition into a new job offer with better dignity and pay"
      ],
      severity: "high",
      reliefTimelineKn: `${dashaTimeKn} ಉದ್ಯೋಗದಲ್ಲಿ ನೂತನ ಆಫರ್ ಅಥವಾ ನಿರೀಕ್ಷಿತ ಸ್ಥಾನಪಲ್ಲಟದಿಂದ ನೆಮ್ಮದಿ ಸಿಗಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, an improved job offer or favorable department shift will restore peace.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ.",
      gokarnaRemedyEn: "Sponsor Karma Siddhi Sankalpa Pooja at Sri Kshetra Gokarna and chant Aditya Hridaya."
    };
  }

  // J. Health & Vitality Strain (ಆರೋಗ್ಯ ಕ್ಲೇಶ)
  if (healthScore >= 4.0) {
    return {
      category: "health_vitality_strain",
      titleKn: "ದೈಹಿಕ ಬಳಲಿಕೆ, ನರಗಳ ಅಶಾಂತಿ, ನಿದ್ರಾಹೀನತೆ & ಆರೋಗ್ಯ ಕ್ಲೇಶ",
      titleEn: "Physical Exhaustion, Nervous Tension, Insomnia & Vitality Strain",
      headlineKn: "ದೀರ್ಘಕಾಲಿಕ ದೈಹಿಕ ಬಳಲಿಕೆ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಕುಸಿತ & ನಿದ್ರಾಹೀನತೆ",
      headlineEn: "Chronic Fatigue, Sleep Disruption & Low Vitality",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೇಹದಲ್ಲಿ ಚೈತನ್ಯದ ಕೊರತೆ ಎದ್ದು ಕಾಣುತ್ತಿದೆ. ರಾತ್ರಿ ಸರಿಯಾಗಿ ನಿದ್ರೆ ಬಾರದಿರುವುದು, ಸಣ್ಣ ಕೆಲಸಕ್ಕೂ ಅತಿಯಾದ ಸುಸ್ತು, ನರಗಳ ದೌರ್ಬಲ್ಯ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿವೆ. ವೈದ್ಯಕೀಯ ಔಷಧಿ ತೆಗೆದುಕೊಂಡರೂ ಸಂಪೂರ್ಣ ಚೇತರಿಕೆ ಕಾಣದೆ, ದಿನನಿತ್ಯದ ಕೆಲಸಗಳಲ್ಲಿ ಆಲಸ್ಯ ಮತ್ತು ನಿರುತ್ಸಾಹ ಆವರಿಸಿದೆ. ಜಾತಕದ ಲಗ್ನಾಧಿಪತಿಯ ಬಲಹೀನತೆಯೇ ಈ ಶಕ್ತಿಹೀನತೆಗೆ ಮೂಲ ಕಾರಣ.`,
      detailedRealityEn: `Currently, physical vitality and restorative sleep are compromised. Low stamina, nervous tension, and nagging ailments drain your productivity, requiring vital spiritual and Ayurvedic rejuvenation.`,
      planetaryCulpritKn: "ಲಗ್ನಾಧಿಪತಿ ದುಃಸ್ಥಾನದಲ್ಲಿರುವುದು ಹಾಗೂ ಚಂದ್ರನ ಮೇಲೆ ಶನಿಯ ದೃಷ್ಟಿ.",
      planetaryCulpritEn: "Lagna lord placed in a Dusthana house combined with Saturn's aspect on the Moon.",
      symptomsChecklistKn: [
        "ರಾತ್ರಿ ಹೊತ್ತು ಗಾಢ ನಿದ್ರೆ ಬಾರದೆ ಹೊರಳಾಡುವುದು ಅಥವಾ ಮಧ್ಯರಾತ್ರಿ ಎಚ್ಚರವಾಗುವುದು",
        "ಬೆಳಿಗ್ಗೆ ಎದ್ದ ತಕ್ಷಣವೂ ದೇಹದಲ್ಲಿ ಸುಸ್ತು ಮತ್ತು ಅತಿಯಾದ ತಲೆನೋವು/ಮೈಕೈ ನೋವು",
        "ಮಾನಸಿಕ ಆತಂಕದಿಂದಾಗಿ ಜೀರ್ಣಕ್ರಿಯೆ ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಏರುಪೇರು"
      ],
      symptomsChecklistEn: [
        "Fragmented sleep patterns and difficulty falling into deep restorative rest",
        "Waking up feeling drained with muscular tightness or lethargy",
        "Digestive irregularities driven by subconscious nervous anxiety"
      ],
      severity: "high",
      reliefTimelineKn: `${dashaTimeKn} ಔಷಧೋಪಚಾರ ಹಾಗೂ ಗ್ರಹ ಶಾಂತಿಯಿಂದ ಆರೋಗ್ಯದಲ್ಲಿ ನವಚೈತನ್ಯ ಮರಳಲಿದೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, vitality and immunity will rebound through medical and spiritual care.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆಯುಷ್ಯ ಶಾಂತಿ ನೆರವೇರಿಸಿ.",
      gokarnaRemedyEn: "Perform Mahamrityunjaya Homa and Ayushya Shanti at Gokarna Kotiteertha."
    };
  }

  // K. Senior Stage (59+ years)
  if (age >= 59) {
    return {
      category: "elderly_peace_legacy",
      titleKn: "ವಾನಪ್ರಸ್ಥ ಶಾಂತಿ, ಕುಟುಂಬದ ಭವಿಷ್ಯ, ಆಸ್ತಿ ವಿಲೇವಾರಿ & ಆಧ್ಯಾತ್ಮಿಕ ನೆಮ್ಮದಿ",
      titleEn: "Senior Tranquility, Family Legacy Settlement & Spiritual Peace",
      headlineKn: "ಮಕ್ಕಳ ಭವಿಷ್ಯದ ಚಿಂತೆ, ಆಸ್ತಿ ಪಾಲು ವಿಲೇವಾರಿ & ವಯೋಸಹಜ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
      headlineEn: "Family Estate Settlement, Offspring Well-being & Spiritual Consolidation",
      detailedRealityKn: `ಪ್ರಸ್ತುತ ${age} ವರ್ಷದ ಈ ಹಿರಿಯ ಜೀವಿತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ನಿಮ್ಮ ಲೌಕಿಕ ಜವಾಬ್ದಾರಿಗಳು ಬಹುತೇಕ ಮುಗಿದಿದ್ದು, ಮಕ್ಕಳ ನೆಲೆಗೊಳ್ಳುವಿಕೆ, ಕುಟುಂಬದ ಆಸ್ತಿ-ಪಾಸ್ತಿಗಳ ವಿಲೇವಾರಿ ಹಾಗೂ ವಯೋಸಹಜ ಆರೋಗ್ಯ ರಕ್ಷಣೆಯು ನಿಮ್ಮ ಮುಖ್ಯ ಕಾಳಜಿಯಾಗಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಎಲ್ಲರೂ ಒಗ್ಗಟ್ಟಾಗಿರಬೇಕೆಂಬ ನಿಮ್ಮ ಆಶಯ ಹಾಗೂ ಆಂತರಿಕ ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆಗಾಗಿ ನೀವು ದೇವರ ಧ್ಯಾನ ಮತ್ತು ಸತ್ಸಂಗವನ್ನು ಆಶ್ರಯಿಸುತ್ತಿದ್ದೀರಿ.`,
      detailedRealityEn: `At age ${age}, this senior chapter focuses on family legacy, harmonious asset distribution among children, holistic vitality, and spiritual tranquility.`,
      planetaryCulpritKn: "9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಮೋಕ್ಷ ತ್ರಿಕೋನದ ಸಕ್ರಿಯತೆ.",
      planetaryCulpritEn: "Activation of the 9th dharma and 12th moksha spiritual houses.",
      symptomsChecklistKn: [
        "ಮಕ್ಕಳು ಮತ್ತು ಮೊಮ್ಮಕ್ಕಳ ಸುಖ-ಕ್ಷೇಮದ ಬಗ್ಗೆ ನಿರಂತರ ಆಲೋಚನೆ",
        "ಸಂಪಾದಿಸಿದ ಆಸ್ತಿ ನ್ಯಾಯಯುತವಾಗಿ ಮಕ್ಕಳಿಗೆ ಹಂಚಿಕೆಯಾಗಬೇಕೆಂಬ ಹಂಬಲ",
        "ಆಧ್ಯಾತ್ಮಿಕ ತೀರ್ಥಕ್ಷೇತ್ರ ದರ್ಶನ ಮತ್ತು ಶಾಂತಿಯ ಜೀವನದ ತುಡಿತ"
      ],
      symptomsChecklistEn: [
        "Thoughtful care for the happiness and unity of children and grandchildren",
        "Desire for equitable and peaceful inheritance settlement",
        "Yearning for sacred pilgrimage, temple visits, and contemplative peace"
      ],
      severity: "peaceful",
      reliefTimelineKn: `${dashaTimeKn} ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ ನೆಲೆಸಿ, ನಿಮ್ಮ ಆಶಯದಂತೆ ಸಕಲ ಕಾರ್ಯಗಳು ಸಾಂಗವಾಗಿ ನೆರವೇರಲಿವೆ.`,
      reliefTimelineEn: `${dashaTimeEn}, peaceful family cohesion and graceful resolutions will prevail.`,
      gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಹಾಗೂ ನವಗ್ರಹ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.",
      gokarnaRemedyEn: "Perform Atma Linga Sparsha and Navagraha Gratitude Sankalpa at Sri Kshetra Gokarna."
    };
  }

  // L. Default: Career & Financial Growth Focus
  return {
    category: "career_financial_growth",
    titleKn: "ವೃತ್ತಿ ವಿಕಾಸ, ಆರ್ಥಿಕ ಉನ್ನತಿ & ನೂತನ ಯೋಜನೆಗಳ ಅಡಿಪಾಯ",
    titleEn: "Career Elevation, Financial Consolidation & Strategic Expansion",
    headlineKn: "ವೃತ್ತಿಪರ ಉನ್ನತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ & ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ನೂತನ ಹೆಜ್ಜೆಗಳು",
    headlineEn: "Professional Consolidation, Financial Growth & Strategic Strides",
    detailedRealityKn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವುದೇ ಗಂಭೀರ ಆಪತ್ತುಗಳಿಲ್ಲ; ಬದಲಾಗಿ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಗಮನವು ವೃತ್ತಿಪರ ಬೆಳವಣಿಗೆ, ಆರ್ಥಿಕ ಭದ್ರತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ನೂತನ ಯೋಜನೆಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕೃತವಾಗಿದೆ. ನಿಮ್ಮ ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಸಾಮರ್ಥ್ಯವನ್ನು ಮುಂದಿನ ಹಂತಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲು ಸರಿಯಾದ ಕಾಲಾವಕಾಶಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ದಶಾ ಸಂಚಾರವು ನಿಮಗೆ ಹೊಸ ಶಕ್ತಿ ತುಂಬಲಿದೆ.`,
    detailedRealityEn: `Currently, you are free from acute crises; your focus is geared toward strategic career progress, financial consolidation, and laying foundations for larger achievements.`,
    planetaryCulpritKn: "10ನೇ ಕರ್ಮ ಸ್ಥಾನ ಹಾಗೂ 2ನೇ/11ನೇ ಧನ ಸ್ಥಾನಗಳ ಸಮತೋಲನ ಸ್ಥಿತಿ.",
    planetaryCulpritEn: "Balanced alignment across 10th house of career and 2nd/11th houses of wealth.",
    symptomsChecklistKn: [
      "ಮುಂದಿನ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಹೊಸ ಹೂಡಿಕೆ ಅಥವಾ ವ್ಯವಹಾರ ವಿಸ್ತರಣೆಯ ಯೋಜನೆಗಳು",
      "ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಹೆಚ್ಚಿನ ಜವಾಬ್ದಾರಿ ಮತ್ತು ಗೌರವ ಪಡೆಯುವ ನಿರಂತರ ಶ್ರಮ",
      "ಕುಟುಂಬದ ಆರ್ಥಿಕ ಭದ್ರತೆಯನ್ನು ದೀರ್ಘಕಾಲೀನವಾಗಿ ಗಟ್ಟಿಗೊಳಿಸುವ ದೃಢ ಸಂಕಲ್ಪ"
    ],
    symptomsChecklistEn: [
      "Exploration of strategic investments or business expansion avenues",
      "Striving for higher executive responsibility and professional stature",
      "Steadfast dedication to fortifying family financial security"
    ],
    severity: "peaceful",
    reliefTimelineKn: `${dashaTimeKn} ನೂತನ ಆರ್ಥಿಕ ಅವಕಾಶಗಳು ಕೈಗೂಡಿ, ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ಯಶಸ್ಸು ಸಿಗಲಿದೆ.`,
    reliefTimelineEn: `${dashaTimeEn}, progressive milestones and fruitful opportunities will materialize.`,
    gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕರ್ಮ ಸಿದ್ಧಿ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ.",
    gokarnaRemedyEn: "Perform Karma Siddhi Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara."
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
  if (navTenthLord === PlanetName.Mercury || navTenthLord === PlanetName.Saturn) scores.it_software += 2.0;

  // 2. Banking, Finance, Accounts & CA
  if ([1, 5, 2, 8, 11].includes(tenthSignIndex)) scores.banking_finance += 3.0;
  if (planetsIn10thNames.includes(PlanetName.Mercury) && planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 4.5;
  if (planetsIn10thNames.includes(PlanetName.Mercury)) scores.banking_finance += 2.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.banking_finance += 2.5;
  if (amkName === PlanetName.Jupiter || amkName === PlanetName.Mercury) scores.banking_finance += 3.0;
  if ([PlanetName.Mercury, PlanetName.Jupiter].includes(tenthLord)) scores.banking_finance += 2.5;
  if (tenthLordPlanet && [2, 11].includes(tenthLordPlanet.house)) scores.banking_finance += 2.5;

  // 3. Teaching, Academics & College Professor
  if ([8, 11, 3, 2].includes(tenthSignIndex)) scores.teaching_academics += 3.5;
  if (tenthLord === PlanetName.Jupiter) scores.teaching_academics += 4.0;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.teaching_academics += 4.0;
  if (amkName === PlanetName.Jupiter) scores.teaching_academics += 3.5;
  if (tenthFromMoonLord === PlanetName.Jupiter) scores.teaching_academics += 2.5;
  if (navTenthLord === PlanetName.Jupiter) scores.teaching_academics += 2.0;
  if (planetsIn10thNames.includes(PlanetName.Ketu)) scores.teaching_academics -= 3.0;

  // 4. Medical, Healthcare, Surgery & Pharma
  if (planetsIn10thNames.includes(PlanetName.Sun) && planetsIn10thNames.includes(PlanetName.Mars)) scores.medical_healthcare += 5.0;
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

  // 6. Priest, Vedic Scholar, Temple Archaka & Astrologer
  if ([8, 11, 3, 7].includes(tenthSignIndex)) scores.priest_vedic_astrology += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter)) scores.priest_vedic_astrology += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Ketu)) scores.priest_vedic_astrology += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Jupiter) && planetsIn10thNames.includes(PlanetName.Ketu)) scores.priest_vedic_astrology += 5.0;
  const ninthLord = signLord((lagnaIndex + 8) % 12);
  if (ninthLord === tenthLord || (ninthLord && tenthLordPlanet && tenthLordPlanet.house === 9)) scores.priest_vedic_astrology += 3.5;
  if ([PlanetName.Sun, PlanetName.Jupiter, PlanetName.Ketu].includes(ninthLord) || (sun && sun.house === 9)) scores.priest_vedic_astrology += 3.0;
  if (amkName === PlanetName.Jupiter) scores.priest_vedic_astrology += 2.5;
  if (navTenthLord === PlanetName.Jupiter) scores.priest_vedic_astrology += 2.5;

  // 7. Government Officer, Civil Services (IAS/KAS), Police & Defense
  if ([4, 0].includes(tenthSignIndex)) scores.government_civil_police += 4.0;
  if (planetsIn10thNames.includes(PlanetName.Sun)) scores.government_civil_police += 4.0;
  if (tenthLord === PlanetName.Sun) scores.government_civil_police += 3.5;
  if (amkName === PlanetName.Sun) scores.government_civil_police += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Mars)) scores.government_civil_police += 2.5;

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

  // 10. Creative Arts, Media, Journalism & Design
  if ([1, 6, 2].includes(tenthSignIndex)) scores.creative_media += 3.5;
  if (planetsIn10thNames.includes(PlanetName.Venus)) scores.creative_media += 3.5;
  if (tenthLord === PlanetName.Venus) scores.creative_media += 3.0;
  if (amkName === PlanetName.Venus) scores.creative_media += 3.0;

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

  const confidenceScore = Math.min(96, Math.max(78, 80 + Math.round((scores[bestCode] - scores[secondCode]) * 3)));

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

    case "priest_vedic_astrology":
      return {
        code: "priest_vedic_astrology",
        titleKn: "ಪೌರೋಹಿತ್ಯ, ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು, ವೇದ ವಿದ್ವಾಂಸರು & ಜ್ಯೋತಿಷಿಗಳು (Priesthood & Jyotisha)",
        titleEn: "Vedic Priesthood, Temple Archaka, Vedic Scholar & Astrologer",
        specificRoleKn: "ದೇವಸ್ಥಾನದ ಪ್ರಧಾನ ಅರ್ಚಕರು, ಪೌರೋಹಿತ್ಯ / ವೈದಿಕ ಧರ್ಮಕರ್ತರು, ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞರು ಅಥವಾ ವೇದ ಪಂಡಿತರು",
        specificRoleEn: "Temple Head Archaka, Vedic Purohita, Astrologer (Daivajna) or Vedic Scholar",
        workEnvironmentKn: "ಪುಣ್ಯಕ್ಷೇತ್ರಗಳ ದೇವಸ್ಥಾನ, ಯಾಗಶಾಲೆ, ಧಾರ್ಮಿಕ ಸಂಪ್ರದಾಯ ಮಂದಿರ, ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ",
        workEnvironmentEn: "Temple sanctum sanctorum, Yajnashalas, Vedic pathashalas, or astrology consultations",
        astrologicalBasisKn: `9ನೇ ಧರ್ಮ ಸ್ಥಾನ ಮತ್ತು 10ನೇ ಕರ್ಮ ಸ್ಥಾನಗಳ (${tenthSignKn}) ನಡುವೆ ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗವಿದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಮತ್ತು ಮೋಕ್ಷ-ಪೂಜಾಕಾರಕ ಕೇತುವಿನ ಪವಿತ್ರ ಸಂಯೋಜನೆಯಿಂದಾಗಿ, ವೇದ ಮಂತ್ರ ಘೋಷ, ಹೋಮ-ಹವನ, ಸಂಸ್ಕಾರ ಪೂಜೆಗಳು ಹಾಗೂ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆಯು ನಿಮ್ಮ ಪರಮ ಪವಿತ್ರ ವೃತ್ತಿಯಾಗಿದೆ.`,
        astrologicalBasisEn: `Dharma-Karmadhipati Raja Yoga linking the 9th and 10th houses, fortified by Jupiter and Ketu, sanctifies your destiny as a Vedic scholar, temple archaka, or astrologer.`,
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
}
