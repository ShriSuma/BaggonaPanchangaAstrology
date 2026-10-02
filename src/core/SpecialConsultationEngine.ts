/**
 * Baggona Panchanga & Astrology - Special Divine Consultation Engine
 *
 * Powers the 6 high-value printable consultation modules:
 * 1. 12-Month Predictive Varshaphala Timeline (ಮಾಸಿಕ ಭವಿಷ್ಯ)
 * 2. Marriage & Relationship Destiny Dossier (ವಿವಾಹ ಯೋಗ ಮತ್ತು ದಾಂಪತ್ಯ ರಹಸ್ಯ)
 * 3. Wealth, Career & Debt Clearance Blueprint (ಧನ-ವೃತ್ತಿ & ಋಣಮುಕ್ತಿ)
 * 4. Sacred Gemstone, Rudraksha & Yantra Prescription (ರತ್ನ-ರುದ್ರಾಕ್ಷಿ-ಯಂತ್ರ ನಿರ್ದೇಶನ)
 * 5. Ayur Sanjeevini Health & Lifestyle Profile (ಆಯುರ್ ಸಂಜೀವಿನಿ)
 * 6. Special Astrological Q&A (ವಿಶೇಷ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ)
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { KundliOutput, PlanetPosition } from "./AstroTypes";
import { PlanetName, RASHIS } from "./AstroTypes";
import { toKannadaRashi, toKannadaNakshatra, toKannadaPlanet } from "../utils/kannadaAstrologyTerms";
import { determineMarriageDestiny } from "./CurrentLifeAndCareerDiagnosticEngine";
import { detectNativeDietAndAddiction } from "./PanchangaAngaSynthesisEngine";
import { generateDashaTimeline } from "./DashaBhuktiEngine";

export type SpecialConsultationLang = "kn" | "en" | "hi" | "te" | "ta";

// -------------------------------------------------------------
// MODULE 1: 12-MONTH PREDICTIVE VARSHAPHALA TIMELINE
// -------------------------------------------------------------
export interface MonthForecast {
  monthIndex: number; // 0 to 11
  monthNameKn: string;
  monthNameEn: string;
  solarMasaKn: string;
  solarMasaEn: string;
  financialRating: "high" | "moderate" | "cautious";
  financialRatingKn: string;
  financialRatingEn: string;
  careerOutlookKn: string;
  careerOutlookEn: string;
  healthCautionKn: string;
  healthCautionEn: string;
  auspiciousDates: string;
  monthlyRemedyKn: string;
  monthlyRemedyEn: string;
}

export interface TwelveMonthForecastResult {
  yearRangeStr: string;
  yearlyThemeKn: string;
  yearlyThemeEn: string;
  varshapathiPlanetKn: string;
  varshapathiPlanetEn: string;
  munthaRashiKn: string;
  munthaRashiEn: string;
  months: MonthForecast[];
}

// -------------------------------------------------------------
// MODULE 2: MARRIAGE & RELATIONSHIP DESTINY
// -------------------------------------------------------------
export interface MarriageDossierResult {
  verdictTitleKn: string;
  verdictTitleEn: string;
  marriageWindowKn: string;
  marriageWindowEn: string;
  spouseProfile: {
    directionKn: string;
    directionEn: string;
    natureKn: string;
    natureEn: string;
    professionDomainKn: string;
    professionDomainEn: string;
  };
  kujaDoshaAnalysisKn: string;
  kujaDoshaAnalysisEn: string;
  maritalHarmonyAdviceKn: string;
  maritalHarmonyAdviceEn: string;
  sacredRemedyKn: string;
  sacredRemedyEn: string;
}

// -------------------------------------------------------------
// MODULE 3: WEALTH, CAREER & DEBT CLEARANCE BLUEPRINT
// -------------------------------------------------------------
export interface WealthCareerResult {
  vocationTypeKn: string; // Job vs Business
  vocationTypeEn: string;
  primaryWealthYogasKn: string[];
  primaryWealthYogasEn: string[];
  induLagnaProsperityScore: number; // Out of 100
  prosperityVerdictKn: string;
  prosperityVerdictEn: string;
  debtClearanceTimelineKn: string;
  debtClearanceTimelineEn: string;
  investmentGuidanceKn: string;
  investmentGuidanceEn: string;
  wealthRemedyKn: string;
  wealthRemedyEn: string;
}

// -------------------------------------------------------------
// MODULE 4: SACRED GEMSTONE, RUDRAKSHA & YANTRA
// -------------------------------------------------------------
export interface GemstoneDetail {
  nameKn: string;
  nameEn: string;
  sanskritName: string;
  gemTypeKn: string; // "ಜೀವನ ರತ್ನ (Lagna)" or "ಭಾಗ್ಯ ರತ್ನ (9th House)"
  gemTypeEn: string;
  governingPlanetKn: string;
  governingPlanetEn: string;
  recommendedWeight: string; // e.g. "5.25 - 6.5 Carats (ರತ್ತಿ)"
  suitableMetalKn: string; // "ಚಿನ್ನ / ಪಂಚಲೋಹ"
  suitableMetalEn: string;
  wearingFingerKn: string; // "ಉಂಗುರದ ಬೆರಳು"
  wearingFingerEn: string;
  auspiciousDayKn: string;
  auspiciousDayEn: string;
  mantraKn: string;
  mantraEn: string;
}

export interface GemstoneRudrakshaResult {
  lifeGem: GemstoneDetail;
  fortuneGem: GemstoneDetail;
  prohibitedGems: {
    gemNamesKn: string;
    gemNamesEn: string;
    reasonKn: string;
    reasonEn: string;
  };
  prescribedRudraksha: {
    mukhiKn: string;
    mukhiEn: string;
    deityKn: string;
    deityEn: string;
    benefitsKn: string;
    benefitsEn: string;
  };
  prescribedYantra: {
    nameKn: string;
    nameEn: string;
    installationPoojaKn: string;
    installationPoojaEn: string;
  };
}

// -------------------------------------------------------------
// MODULE 5: AYUR SANJEEVINI HEALTH PROFILE
// -------------------------------------------------------------
export interface AyurHealthResult {
  prakritiConstitutionKn: string; // Vata-Pitta, Pitta-Kapha, etc.
  prakritiConstitutionEn: string;
  vulnerableOrgansKn: string[];
  vulnerableOrgansEn: string[];
  seasonalDietAdviceKn: string;
  seasonalDietAdviceEn: string;
  dailyLifestyleHabitKn: string;
  dailyLifestyleHabitEn: string;
  healingMantraKn: string;
  healingMantraEn: string;
  ayurvedicRasayanaKn: string;
  ayurvedicRasayanaEn: string;
}

// -------------------------------------------------------------
// MODULE 6: SPECIAL ASTROLOGICAL Q&A
// -------------------------------------------------------------
export interface QnAPair {
  id: string;
  questionKn: string;
  questionEn: string;
  answerKn: string;
  answerEn: string;
  remedyKn: string;
  remedyEn: string;
}

export interface SpecialConsultationFullReport {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  lagnaNameKn: string;
  lagnaNameEn: string;
  rashiNameKn: string;
  rashiNameEn: string;
  nakshatraNameKn: string;
  nakshatraNameEn: string;
  currentDashaKn: string;
  currentDashaEn: string;
  
  // The 6 Modules
  twelveMonthForecast: TwelveMonthForecastResult;
  marriageDossier: MarriageDossierResult;
  wealthCareer: WealthCareerResult;
  gemstoneRudraksha: GemstoneRudrakshaResult;
  ayurHealth: AyurHealthResult;
  presetQnAList: QnAPair[];
  customQnA?: {
    question: string;
    answer: string;
  };
  generatedAt: string;
}

// -------------------------------------------------------------
// COMPUTATION IMPLEMENTATION
// -------------------------------------------------------------

const RASHI_LORDS: PlanetName[] = [
  PlanetName.Mars,    // Aries
  PlanetName.Venus,   // Taurus
  PlanetName.Mercury, // Gemini
  PlanetName.Moon,    // Cancer
  PlanetName.Sun,     // Leo
  PlanetName.Mercury, // Virgo
  PlanetName.Venus,   // Libra
  PlanetName.Mars,    // Scorpio
  PlanetName.Jupiter, // Sagittarius
  PlanetName.Saturn,  // Capricorn
  PlanetName.Saturn,  // Aquarius
  PlanetName.Jupiter  // Pisces
];

const GEMSTONE_MAP: Record<string, { kn: string; en: string; sanskrit: string; metalKn: string; metalEn: string; fingerKn: string; fingerEn: string; dayKn: string; dayEn: string; mantraKn: string; mantraEn: string }> = {
  Sun: {
    kn: "ಮಾಣಿಕ್ಯ (Ruby)",
    en: "Ruby (Manikya)",
    sanskrit: "माणिक्यम्",
    metalKn: "ಚಿನ್ನ (Gold) ಅಥವಾ ತಾಮ್ರ",
    metalEn: "Gold or Copper",
    fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    fingerEn: "Ring finger (Right hand)",
    dayKn: "ಭಾನುವಾರ ಸೂರ್ಯೋದಯ ಕಾಲ",
    dayEn: "Sunday at sunrise",
    mantraKn: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
    mantraEn: "Om Hram Hreem Hroum Sah Suryaya Namah"
  },
  Moon: {
    kn: "ಮುತ್ತು (Natural Pearl)",
    en: "Natural Pearl (Mukta)",
    sanskrit: "मुक्ताफलम्",
    metalKn: "ಬೆಳ್ಳಿ (Silver)",
    metalEn: "Silver",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    fingerEn: "Little finger (Right hand)",
    dayKn: "ಸೋಮವಾರ ಸಂಜೆ ಅಥವಾ ಪ್ರಾತಃಕಾಲ",
    dayEn: "Monday morning or evening",
    mantraKn: "ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಾಯ ನಮಃ",
    mantraEn: "Om Shram Shreem Shroum Sah Chandraya Namah"
  },
  Mars: {
    kn: "ಕೆಂಪು ಹವಳ (Red Coral)",
    en: "Red Coral (Moonga / Pravala)",
    sanskrit: "प्रवालम्",
    metalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ",
    metalEn: "Copper or Gold",
    fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ)",
    fingerEn: "Ring finger (Right hand)",
    dayKn: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ",
    dayEn: "Tuesday morning",
    mantraKn: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ",
    mantraEn: "Om Kram Kreem Kroum Sah Bhaumaya Namah"
  },
  Mercury: {
    kn: "ಪಚ್ಚೆ (Emerald)",
    en: "Emerald (Marakatha / Panna)",
    sanskrit: "मरकतम्",
    metalKn: "ಚಿನ್ನ ಅಥವಾ ಕಂಚು",
    metalEn: "Gold or Bronze",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ)",
    fingerEn: "Little finger (Right hand)",
    dayKn: "ಬುಧವಾರ ಬೆಳಿಗ್ಗೆ 2 ಗಂಟೆಗಳ ಒಳಗೆ",
    dayEn: "Wednesday morning within 2 hours of sunrise",
    mantraKn: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
    mantraEn: "Om Bram Breem Broum Sah Budhaya Namah"
  },
  Jupiter: {
    kn: "ಪುಷ್ಪರಾಗ (Yellow Sapphire)",
    en: "Yellow Sapphire (Pushparaga / Pukhraj)",
    sanskrit: "पुष्परागम्",
    metalKn: "ಶುದ್ಧ ಚಿನ್ನ (22K Gold) ಅಥವಾ ಪಂಚಲೋಹ",
    metalEn: "22K Pure Gold or Panchaloha",
    fingerKn: "ತೋರುಬೆರಳು (ತರ್ಜನಿ)",
    fingerEn: "Index finger (Right hand)",
    dayKn: "ಗುರುವಾರ ಶುಕ್ಲಪಕ್ಷ ಪ್ರಾತಃಕಾಲ",
    dayEn: "Thursday morning during Shukla Paksha",
    mantraKn: "ಓಂ ಗ್ರಾಂಗ್ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
    mantraEn: "Om Gram Greem Groum Sah Gurave Namah"
  },
  Venus: {
    kn: "ವಜ್ರ / ಬಿಳಿ ಜಿರ್ಕಾನ್ (Diamond / White Zircon)",
    en: "Diamond or Natural White Zircon (Heera / Vajra)",
    sanskrit: "वज्रम्",
    metalKn: "ಪ್ಲಾಟಿನಂ ಅಥವಾ ಬೆಳ್ಳಿ",
    metalEn: "Platinum or Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು",
    fingerEn: "Middle or Little finger",
    dayKn: "ಶುಕ್ರವಾರ ಸೂರ್ಯೋದಯದ ನಂತರ",
    dayEn: "Friday morning after sunrise",
    mantraKn: "ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ",
    mantraEn: "Om Dram Dreem Droum Sah Shukraya Namah"
  },
  Saturn: {
    kn: "ನೀಲಂ / ಅಮೆಥಿಸ್ಟ್ (Blue Sapphire / Amethyst)",
    en: "Blue Sapphire or Amethyst (Neelam)",
    sanskrit: "नीलमणिः",
    metalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    metalEn: "Panchaloha or Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    fingerEn: "Middle finger (Right hand)",
    dayKn: "ಶನಿವಾರ ಸೂರ್ಯಾಸ್ತದ ಸಮಯ",
    dayEn: "Saturday around sunset",
    mantraKn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ",
    mantraEn: "Om Pram Preem Proum Sah Shanaishcharaya Namah"
  }
};

const RUDRAKSHA_MAP: Record<string, { mukhiKn: string; mukhiEn: string; deityKn: string; deityEn: string; benefitsKn: string; benefitsEn: string }> = {
  Sun: {
    mukhiKn: "೧ ಮುಖಿ / ೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "1-Mukhi or 12-Mukhi Rudraksha",
    deityKn: "ಸೂರ್ಯ ನಾರಾಯಣ",
    deityEn: "Surya Narayana",
    benefitsKn: "ತೇಜಸ್ಸು, ನಾಯಕತ್ವ, ಸರ್ಕಾರಿ ಕಾರ್ಯಸಿದ್ಧಿ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸ ವೃದ್ಧಿ.",
    benefitsEn: "Radiance, executive authority, government favor, and inner willpower."
  },
  Moon: {
    mukhiKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "2-Mukhi Rudraksha",
    deityKn: "ಅರ್ಧನಾರೀಶ್ವರ",
    deityEn: "Ardhanarishwara",
    benefitsKn: "ಮಾನಸಿಕ ಶಾಂತಿ, ದಾಂಪತ್ಯ ಸೌಹಾರ್ದತೆ, ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆ ನಿವಾರಣೆ.",
    benefitsEn: "Mental peace, marital harmony, emotional tranquility, and anxiety relief."
  },
  Mars: {
    mukhiKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "3-Mukhi Rudraksha",
    deityKn: "ಅಗ್ನಿ ದೇವ",
    deityEn: "Agni Deva",
    benefitsKn: "ಧೈರ್ಯ, ಜೀರ್ಣಶಕ್ತಿ, ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ ಹಾಗೂ ಸೋಮಾರಿತನ ನಿರ್ಮೂಲನೆ.",
    benefitsEn: "Courage, robust digestion, vitality, and overcoming lethargy or fear."
  },
  Mercury: {
    mukhiKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "4-Mukhi Rudraksha",
    deityKn: "ಬ್ರಹ್ಮ ದೇವ",
    deityEn: "Lord Brahma",
    benefitsKn: "ಬುದ್ಧಿಶಕ್ತಿ, ವಾಕ್ಚಾತುರ್ಯ, ವ್ಯಾಪಾರ ಚತುರತೆ, ಸ್ಮರಣಶಕ್ತಿ ಹಾಗೂ ವಿದ್ಯಾರ್ಜನೆ.",
    benefitsEn: "Intellect, eloquence, analytical trade acumen, and academic memory."
  },
  Jupiter: {
    mukhiKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "5-Mukhi Rudraksha (ಪಂಚಮುಖಿ)",
    deityKn: "ಕಾಲಾಗ್ನಿ ರುದ್ರ",
    deityEn: "Kalagni Rudra",
    benefitsKn: "ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ವಿಕಾಸ, ಸರ್ವಪಾಪ ನಿವಾರಣೆ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಶಾಂತಿ.",
    benefitsEn: "Higher wisdom, spiritual evolution, divine guru grace, and serenity."
  },
  Venus: {
    mukhiKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "6-Mukhi Rudraksha",
    deityKn: "ಕಾರ್ತಿಕೇಯ (ಸುಬ್ರಹ್ಮಣ್ಯ)",
    deityEn: "Lord Kartikeya (Subramanya)",
    benefitsKn: "ಆಕರ್ಷಣೆ, ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ, ದಾಂಪತ್ಯ ಸುಖ, ಸೌಂದರ್ಯ ಹಾಗೂ ವಾಹನ ಸೌಖ್ಯ.",
    benefitsEn: "Magnetism, artistic genius, marital pleasure, luxury, and vehicle comfort."
  },
  Saturn: {
    mukhiKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ",
    mukhiEn: "7-Mukhi Rudraksha",
    deityKn: "ಮಹಾಲಕ್ಷ್ಮಿ & ಶನಿಶ್ವರ",
    deityEn: "Mahalakshmi & Shani Bhagavan",
    benefitsKn: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಸಾಲಬಾಧೆ ನಿವಾರಣೆ, ಶನಿ ಪೀಡಾ ಪರಿಹಾರ ಹಾಗೂ ವೃತ್ತಿ ಭದ್ರತೆ.",
    benefitsEn: "Financial stability, debt clearance, Saturn obstacle protection, and career security."
  }
};

/**
 * Executes full calculation for all 6 Special Divine Consultation modules.
 */
export function generateSpecialConsultationReport(
  kundli: KundliOutput,
  context: {
    devoteeName: string;
    birthDate: string;
    birthTime?: string;
    maritalStatus?: string;
    gender?: string;
  }
): SpecialConsultationFullReport {
  const lagnaIndex = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashiIndex = moonPlanet ? moonPlanet.rashi.index : 0;
  const moonNakshatraName = moonPlanet ? (moonPlanet.nakshatra.english || moonPlanet.nakshatra.sanskrit || "Ashwini") : "Ashwini";

  const lagnaLordPlanet = RASHI_LORDS[lagnaIndex];
  const ninthRashiIndex = (lagnaIndex + 8) % 12;
  const ninthLordPlanet = RASHI_LORDS[ninthRashiIndex];
  const sixthRashiIndex = (lagnaIndex + 5) % 12;
  const eighthRashiIndex = (lagnaIndex + 7) % 12;
  const twelfthRashiIndex = (lagnaIndex + 11) % 12;

  const dashaTimeline = generateDashaTimeline(kundli);
  const currentDashaName = (dashaTimeline && dashaTimeline[0]?.planet) ? dashaTimeline[0].planet : lagnaLordPlanet;

  // 1. 12-Month Forecast
  const twelveMonthForecast = compute12MonthForecast(moonRashiIndex, lagnaIndex);

  // 2. Marriage & Relationship Dossier
  const marriageDossier = computeMarriageDossier(kundli, context);

  // 3. Wealth & Career Blueprint
  const wealthCareer = computeWealthCareerBlueprint(kundli, lagnaIndex);

  // 4. Sacred Gemstones, Rudraksha & Yantra
  const gemstoneRudraksha = computeGemstoneAndRudraksha(lagnaLordPlanet, ninthLordPlanet, [sixthRashiIndex, eighthRashiIndex, twelfthRashiIndex]);

  // 5. Ayur Sanjeevini Health Profile
  const ayurHealth = computeAyurHealthProfile(kundli, lagnaIndex);

  // 6. Preset QnA List
  const presetQnAList = computePresetQnA(kundli, context, currentDashaName);

  return {
    devoteeName: context.devoteeName || "ಭಕ್ತಾದಿಗಳು",
    birthDate: context.birthDate,
    birthTime: context.birthTime || "12:00",
    lagnaNameKn: toKannadaRashi(lagnaIndex),
    lagnaNameEn: RASHIS[lagnaIndex]?.english || "Aries",
    rashiNameKn: toKannadaRashi(moonRashiIndex),
    rashiNameEn: RASHIS[moonRashiIndex]?.english || "Aries",
    nakshatraNameKn: toKannadaNakshatra(moonNakshatraName),
    nakshatraNameEn: moonNakshatraName,
    currentDashaKn: toKannadaPlanet(currentDashaName),
    currentDashaEn: currentDashaName,

    twelveMonthForecast,
    marriageDossier,
    wealthCareer,
    gemstoneRudraksha,
    ayurHealth,
    presetQnAList,
    generatedAt: new Date().toLocaleDateString("kn-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  };
}

/** 1. Compute 12-Month Predictive Timeline */
function compute12MonthForecast(moonRashiIdx: number, lagnaIdx: number): TwelveMonthForecastResult {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth(); // 0 to 11

  const monthNamesKn = [
    "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
    "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const solarMasasKn = [
    "ಪುಷ್ಯ / ಮಾಘ ಮಾಸ", "ಮಾಘ / ಫಾಲ್ಗುಣ ಮಾಸ", "ಫಾಲ್ಗುಣ / ಚೈತ್ರ ಮಾಸ",
    "ಚೈತ್ರ / ವೈಶಾಖ ಮಾಸ", "ವೈಶಾಖ / ಜ್ಯೇಷ್ಠ ಮಾಸ", "ಜ್ಯೇಷ್ಠ / ಆಷಾಢ ಮಾಸ",
    "ಆಷಾಢ / ಶ್ರಾವಣ ಮಾಸ", "ಶ್ರಾವಣ / ಭಾದ್ರಪದ ಮಾಸ", "ಭಾದ್ರಪದ / ಆಶ್ವಯುಜ ಮಾಸ",
    "ಆಶ್ವಯುಜ / ಕಾರ್ತಿಕ ಮಾಸ", "ಕಾರ್ತಿಕ / ಮಾರ್ಗಶಿರ ಮಾಸ", "ಮಾರ್ಗಶಿರ / ಪುಷ್ಯ ಮಾಸ"
  ];
  const solarMasasEn = [
    "Pushya / Magha", "Magha / Phalguna", "Phalguna / Chaitra",
    "Chaitra / Vaishakha", "Vaishakha / Jyeshtha", "Jyeshtha / Ashadha",
    "Ashadha / Shravana", "Shravana / Bhadrapada", "Bhadrapada / Ashwayuja",
    "Ashwayuja / Kartika", "Kartika / Margashira", "Margashira / Pushya"
  ];

  const months: MonthForecast[] = [];

  for (let i = 0; i < 12; i++) {
    const mIdx = (currentMonthIdx + i) % 12;
    const yearOffset = Math.floor((currentMonthIdx + i) / 12);
    const yr = currentYear + yearOffset;

    // Deterministic cyclic score based on rashi transit harmony
    const transitSeed = (moonRashiIdx * 7 + mIdx * 5 + lagnaIdx * 3) % 10;
    let rating: "high" | "moderate" | "cautious" = "moderate";
    let ratingKn = "ಸಾಧಾರಣ ಅನುಕೂಲ (ಸ್ಥಿರ)";
    let ratingEn = "Steady & Moderate Alignment";

    if (transitSeed >= 6) {
      rating = "high";
      ratingKn = "ಅತ್ಯುತ್ತಮ ಧನಾಗಮನ & ಉನ್ನತಿ (High Tide)";
      ratingEn = "Auspicious Expansion & Prosperity";
    } else if (transitSeed <= 2) {
      rating = "cautious";
      ratingKn = "ಎಚ್ಚರಿಕೆ • ವೆಚ್ಚ ನಿಯಂತ್ರಣ (Cautious)";
      ratingEn = "Vigilance & Controlled Expenditure";
    }

    const ausDates = `${(mIdx * 3 + 2) % 25 + 1}, ${(mIdx * 3 + 8) % 25 + 3}, ${(mIdx * 3 + 17) % 25 + 4}`;

    months.push({
      monthIndex: i,
      monthNameKn: `${monthNamesKn[mIdx]} ${yr}`,
      monthNameEn: `${monthNamesEn[mIdx]} ${yr}`,
      solarMasaKn: solarMasasKn[mIdx],
      solarMasaEn: solarMasasEn[mIdx],
      financialRating: rating,
      financialRatingKn: ratingKn,
      financialRatingEn: ratingEn,
      careerOutlookKn: rating === "high"
        ? "ಉದ್ಯೋಗದಲ್ಲಿ ಹೊಸ ಜವಾಬ್ದಾರಿ, ಬಡ್ತಿ ಅಥವಾ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ. ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭದಾಯಕ ಹೂಡಿಕೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ."
        : rating === "cautious"
        ? "ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ. ದೊಡ್ಡ ಬಂಡವಾಳ ಹೂಡಿಕೆಗೆ ತಾಳ್ಮೆ ಅಗತ್ಯ."
        : "ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಸ್ಥಿರ ಪ್ರಗತಿ. ಬಾಕಿ ಉಳಿದ ಕೆಲಸಗಳು ನಿಧಾನವಾಗಿ ಪೂರ್ಣಗೊಳ್ಳಲಿವೆ.",
      careerOutlookEn: rating === "high"
        ? "Career promotions, leadership authority, and profitable opportunities in commerce."
        : rating === "cautious"
        ? "Avoid workplace conflicts. Exercise patience before major financial capital deployment."
        : "Steady everyday progress with gradual completion of pending assignments.",
      healthCautionKn: rating === "cautious"
        ? "ಅಜೀರ್ಣ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ವಾತ-ಪಿತ್ತ ದೋಷದ ಏರಿಳಿತದ ಸಾಧ್ಯತೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ನಿದ್ರೆ ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರ ಪಾಲಿಸಿ."
        : "ಉತ್ತಮ ಆರೋಗ್ಯ ಮತ್ತು ಚೈತನ್ಯ. ಹವಾಮಾನ ಬದಲಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಸೂಕ್ತ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      healthCautionEn: rating === "cautious"
        ? "Mild digestive strain, insomnia, or stress fatigue. Maintain disciplined rest and light diet."
        : "Vibrant energy and robust health. Practice regular morning hydration and exercise.",
      auspiciousDates: ausDates,
      monthlyRemedyKn: rating === "cautious"
        ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಸೋಮವಾರ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ದೀಪಾರಾಧನೆ."
        : "ಪ್ರತಿನಿತ್ಯ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಥವಾ ಗಣಪತಿ ಸ್ತೋತ್ರ ಪಠಣೆ.",
      monthlyRemedyEn: rating === "cautious"
        ? "Bilva Archana to Lord Shiva on Mondays and Navagraha ghee lamp offering."
        : "Daily recitation of Sri Mahalakshmi Stotram or Ganesha Kavacha."
    });
  }

  return {
    yearRangeStr: `${monthNamesEn[currentMonthIdx]} ${currentYear} - ${monthNamesEn[(currentMonthIdx + 11) % 12]} ${currentYear + 1}`,
    yearlyThemeKn: "ಕರ್ಮ ಫಲ ಸಮನ್ವಯ ಹಾಗೂ ಧರ್ಮ-ಅರ್ಥ ವೃದ್ಧಿಯ ವಾರ್ಷಿಕ ಪಥ",
    yearlyThemeEn: "Karmic Harmonization & Strategic Growth Year",
    varshapathiPlanetKn: toKannadaPlanet(RASHI_LORDS[(lagnaIdx + 4) % 12]),
    varshapathiPlanetEn: RASHI_LORDS[(lagnaIdx + 4) % 12],
    munthaRashiKn: toKannadaRashi((lagnaIdx + (currentYear % 12)) % 12),
    munthaRashiEn: RASHIS[(lagnaIdx + (currentYear % 12)) % 12]?.english || "Aries",
    months
  };
}

/** 2. Compute Marriage & Relationship Dossier */
function computeMarriageDossier(kundli: KundliOutput, context: any): MarriageDossierResult {
  const assessment = determineMarriageDestiny(kundli, context);
  const lagnaIndex = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const seventhHouseSign = (lagnaIndex + 6) % 12;

  const directions = [
    { kn: "ಪೂರ್ವ ದಿಕ್ಕು (East)", en: "East" },
    { kn: "ದಕ್ಷಿಣ-ಪೂರ್ವ (South-East)", en: "South-East" },
    { kn: "ದಕ್ಷಿಣ ದಿಕ್ಕು (South)", en: "South" },
    { kn: "ನೈಋತ್ಯ ದಿಕ್ಕು (South-West)", en: "South-West" },
    { kn: "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West)", en: "West" },
    { kn: "ವಾಯವ್ಯ ದಿಕ್ಕು (North-West)", en: "North-West" },
    { kn: "ಉತ್ತರ ದಿಕ್ಕು (North)", en: "North" },
    { kn: "ಈಶಾನ ದಿಕ್ಕು (North-East)", en: "North-East" }
  ];
  const dir = directions[seventhHouseSign % directions.length];

  return {
    verdictTitleKn: assessment.titleKn || "ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಹಾಗೂ ದಾಂಪತ್ಯ ಯೋಗ",
    verdictTitleEn: assessment.titleEn || "Auspicious Matrimonial Alignment",
    marriageWindowKn: assessment.marriageTimingWindowKn || "ಮುಂದಿನ 18 ರಿಂದ 24 ತಿಂಗಳುಗಳಲ್ಲಿ ಪ್ರಶಸ್ತ ಶುಭ ಕಾಲ",
    marriageWindowEn: assessment.marriageTimingWindowEn || "Favorable window within the next 18 to 24 months",
    spouseProfile: {
      directionKn: dir.kn,
      directionEn: dir.en,
      natureKn: "ಸುಸಂಸ್ಕೃತ, ಧಾರ್ಮಿಕ ಚಿಂತನೆ, ಗೌರವಾನ್ವಿತ ಕುಟುಂಬದ ಹಿನ್ನೆಲೆ ಹಾಗೂ ಹೊಂದಾಣಿಕೆಯ ಗುಣವುಳ್ಳ ವ್ಯಕ್ತಿತ್ವ.",
      natureEn: "Cultured, family-oriented, ethically grounded, respectful, and emotionally mature partner.",
      professionDomainKn: "ಶಿಕ್ಷಣ, ಬ್ಯಾಂಕಿಂಗ್, ಐಟಿ, ಸರ್ಕಾರಿ ಆಡಳಿತ ಅಥವಾ ಸ್ವಂತ ವ್ಯವಹಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಕ್ರಿಯತೆ.",
      professionDomainEn: "Academics, Banking, Corporate IT, Public Administration, or Commerce."
    },
    kujaDoshaAnalysisKn: "ಕುಜ ಗ್ರಹದ ಸ್ಥಿತಿಯು ದಾಂಪತ್ಯಕ್ಕೆ ಯಾವುದೇ ಗಂಭೀರ ಹಾನಿ ಮಾಡದಂತೆ ಗುರು ಹಾಗೂ ಶುಕ್ರರ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ದೋಷ ಭಂಗವಾಗಿದೆ.",
    kujaDoshaAnalysisEn: "Mars placement is benign and neutralized through Jupiter's benefic aspect (Kuja Dosha Bhanga).",
    maritalHarmonyAdviceKn: "ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ಮುಕ್ತ ಸಂವಾದವೇ ದಾಂಪತ್ಯದ ಬುನಾದಿ. ಶುಕ್ರವಾರ ದಂಪತಿಗಳು ಒಟ್ಟಾಗಿ ದೇವರ ಪೂಜೆ ನೆರವೇರಿಸುವುದು ಶ್ರೇಷ್ಠ.",
    maritalHarmonyAdviceEn: "Mutual respect and clear communication ensure harmony. Joint Friday prayers invite Lakshmi-Narayana grace.",
    sacredRemedyKn: assessment.blessingRemedyKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಹಾಗೂ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಜಪ ಸಮರ್ಪಣೆ.",
    sacredRemedyEn: assessment.blessingRemedyEn || "Swayamvara Parvathi Japa and Uma Maheshwara Puja at Gokarna Kshetra."
  };
}

/** 3. Compute Wealth, Career & Debt Clearance Blueprint */
function computeWealthCareerBlueprint(kundli: KundliOutput, lagnaIndex: number): WealthCareerResult {
  const tenthRashi = (lagnaIndex + 9) % 12;
  const tenthLord = RASHI_LORDS[tenthRashi];
  const sixthLord = RASHI_LORDS[(lagnaIndex + 5) % 12];
  const seventhLord = RASHI_LORDS[(lagnaIndex + 6) % 12];

  const prefersBusiness = [PlanetName.Mercury, PlanetName.Venus, PlanetName.Saturn].includes(tenthLord);
  const vocationKn = prefersBusiness
    ? "ಸ್ವಂತ ಉದ್ಯಮ / ವ್ಯಾಪಾರ & ಸ್ವತಂತ್ರ ವೃತ್ತಿ (Business & Independent Enterprise)"
    : "ಉನ್ನತ ಹುದ್ದೆಯ ಉದ್ಯೋಗ & ಆಡಳಿತಾತ್ಮಕ ಸೇವೆ (Corporate / Government Employment)";
  const vocationEn = prefersBusiness
    ? "Business, Commerce & Independent Enterprise"
    : "Corporate Executive Leadership or Public Service";

  return {
    vocationTypeKn: vocationKn,
    vocationTypeEn: vocationEn,
    primaryWealthYogasKn: [
      "ಧನ-ಯೋಗ: ೨ನೇ ಮತ್ತು ೧೧ನೇ ಭಾವಾಧಿಪತಿಗಳ ಬಲದಿಂದ ನಿರಂತರ ಸಂಪಾದನೆ.",
      "ವಸುಮತಿ ಯೋಗ: ಕೇಂದ್ರ-ತ್ರಿಕೋನಗಳಲ್ಲಿ ಶುಭಗ್ರಹರ ಪ್ರಭಾವದಿಂದ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ.",
      "ಅರ್ಥ ಸಿದ್ಧಿ: ಮಧ್ಯವಯಸ್ಸಿನ ನಂತರ ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ಭೂಮಿ-ವಾಹನ ಲಾಭ."
    ],
    primaryWealthYogasEn: [
      "Dhana Yoga: Continual financial inflow via 2nd and 11th house lords.",
      "Vasumathi Yoga: Benefic configuration in Kendras ensuring durable wealth.",
      "Property Gain: Real estate and vehicle acquisition in mature adulthood."
    ],
    induLagnaProsperityScore: 82,
    prosperityVerdictKn: "ಉತ್ತಮ ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ. ಅನಾವಶ್ಯಕ ಊಹಾತ್ಮಕ ಹೂಡಿಕೆ (ಸ್ಪೆಕ್ಯುಲೇಶನ್) ಬಿಟ್ಟು ಶಾಶ್ವತ ಆಸ್ತಿ ನಿರ್ಮಾಣದಲ್ಲಿ ಹಣ ತೊಡಗಿಸಿ.",
    prosperityVerdictEn: "Strong financial resilience. Focus on tangible assets rather than speculative ventures.",
    debtClearanceTimelineKn: "ಮುಂದಿನ 12 ರಿಂದ 18 ತಿಂಗಳುಗಳಲ್ಲಿ ಸಾಲದ ಪ್ರಮುಖ ಭಾಗ ತೀರುವ ಸುಯೋಗ. ೬ನೇ ಭಾವಾಧಿಪತಿಯ ಶಾಂತಿಯಿಂದ ಋಣಮುಕ್ತಿ.",
    debtClearanceTimelineEn: "Major debt clearance window within 12 to 18 months through strategic financial restructuring.",
    investmentGuidanceKn: "ಚಿನ್ನ, ಕೃಷಿ ಭೂಮಿ, ವಸತಿ ನಿವೇಶನ ಹಾಗೂ ಸ್ಥಿರ ಠೇವಣಿಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಕ್ಷೇಮಕರ.",
    investmentGuidanceEn: "Gold, residential property, agriculture, and blue-chip long-term deposits are ideal.",
    wealthRemedyKn: "ಪ್ರತಿ ಮಂಗಳವಾರ ಋಣವಿಮೋಚಕ ಮಂಗಳ ಸ್ತೋತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಕರ್ಣದಲ್ಲಿ ಶ್ರೀ ಲಕ್ಷ್ಮಿ ನರಸಿಂಹ ಹೋಮ.",
    wealthRemedyEn: "Recitation of Runavimochana Mangala Stotram and Lakshmi Narasimha Homa at Gokarna."
  };
}

/** 4. Compute Sacred Gemstone, Rudraksha & Yantra */
function computeGemstoneAndRudraksha(
  lagnaLord: PlanetName,
  ninthLord: PlanetName,
  trikaSigns: number[]
): GemstoneRudrakshaResult {
  const lifeGemData = GEMSTONE_MAP[lagnaLord] || GEMSTONE_MAP.Jupiter;
  const fortuneGemData = GEMSTONE_MAP[ninthLord] || GEMSTONE_MAP.Sun;

  // Prohibited: planets ruling 6th or 8th
  const prohibitedPlanet = RASHI_LORDS[trikaSigns[1]]; // 8th house lord
  const prohibitedGemData = GEMSTONE_MAP[prohibitedPlanet] || GEMSTONE_MAP.Saturn;

  const rudraksha = RUDRAKSHA_MAP[lagnaLord] || RUDRAKSHA_MAP.Jupiter;

  return {
    lifeGem: {
      nameKn: lifeGemData.kn,
      nameEn: lifeGemData.en,
      sanskritName: lifeGemData.sanskrit,
      gemTypeKn: "ಜೀವನ ರತ್ನ (ಆಯುಷ್ಯ, ಆರೋಗ್ಯ & ಆತ್ಮಬಲ ವರ್ಧಕ)",
      gemTypeEn: "Life Gemstone (Vitality, Health & Longevity)",
      governingPlanetKn: toKannadaPlanet(lagnaLord),
      governingPlanetEn: lagnaLord,
      recommendedWeight: "5.25 - 6.5 Carats (ರತ್ತಿ)",
      suitableMetalKn: lifeGemData.metalKn,
      suitableMetalEn: lifeGemData.metalEn,
      wearingFingerKn: lifeGemData.fingerKn,
      wearingFingerEn: lifeGemData.fingerEn,
      auspiciousDayKn: lifeGemData.dayKn,
      auspiciousDayEn: lifeGemData.dayEn,
      mantraKn: lifeGemData.mantraKn,
      mantraEn: lifeGemData.mantraEn
    },
    fortuneGem: {
      nameKn: fortuneGemData.kn,
      nameEn: fortuneGemData.en,
      sanskritName: fortuneGemData.sanskrit,
      gemTypeKn: "ಭಾಗ್ಯ ರತ್ನ (ಅದೃಷ್ಟ, ಭಾಗ್ಯೋದಯ & ದೈವಾನುಗ್ರಹ)",
      gemTypeEn: "Fortune Gemstone (Luck, Prosperity & Grace)",
      governingPlanetKn: toKannadaPlanet(ninthLord),
      governingPlanetEn: ninthLord,
      recommendedWeight: "4.5 - 5.5 Carats (ರತ್ತಿ)",
      suitableMetalKn: fortuneGemData.metalKn,
      suitableMetalEn: fortuneGemData.metalEn,
      wearingFingerKn: fortuneGemData.fingerKn,
      wearingFingerEn: fortuneGemData.fingerEn,
      auspiciousDayKn: fortuneGemData.dayKn,
      auspiciousDayEn: fortuneGemData.dayEn,
      mantraKn: fortuneGemData.mantraKn,
      mantraEn: fortuneGemData.mantraEn
    },
    prohibitedGems: {
      gemNamesKn: prohibitedGemData.kn,
      gemNamesEn: prohibitedGemData.en,
      reasonKn: "ಈ ರತ್ನವು ಜಾತಕದ ಅನಿಷ್ಟ ಭಾವಾಧಿಪತಿಯಾಗಿದ್ದು, ಧರಿಸುವುದರಿಂದ ಆರೋಗ್ಯ ಕ್ಲೇಶ, ವಿವಾದ ಅಥವಾ ಅನಗತ್ಯ ಧನಹಾನಿ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ.",
      reasonEn: "Governs an adverse Dusthana lord; wearing it can amplify vulnerability, disputes, or expenditure."
    },
    prescribedRudraksha: {
      mukhiKn: rudraksha.mukhiKn,
      mukhiEn: rudraksha.mukhiEn,
      deityKn: rudraksha.deityKn,
      deityEn: rudraksha.deityEn,
      benefitsKn: rudraksha.benefitsKn,
      benefitsEn: rudraksha.benefitsEn
    },
    prescribedYantra: {
      nameKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಯಂತ್ರ / ಮಹಾಮೃತ್ಯುಂಜಯ ಯಂತ್ರ",
      nameEn: "Sri Mahalakshmi Yantra / Mahamrityunjaya Yantra",
      installationPoojaKn: "ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ತಾಮ್ರದ ಫಲಕದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ, ನಿತ್ಯ ಗಂಧ-ಕುಂಕುಮ ಹಾಗೂ ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಿಸುವುದು.",
      installationPoojaEn: "Enshrine in home altar on consecrated copper plate with daily ghee lamp offering."
    }
  };
}

/** 5. Compute Ayur Sanjeevini Health Profile */
function computeAyurHealthProfile(kundli: KundliOutput, lagnaIndex: number): AyurHealthResult {
  const constitutions = [
    { kn: "ಪಿತ್ತ-ವಾತ ಪ್ರಕೃತಿ (Pitta-Vata)", en: "Pitta-Vata Constitution" },
    { kn: "ವಾತ-ಕಫ ಪ್ರಕೃತಿ (Vata-Kapha)", en: "Vata-Kapha Constitution" },
    { kn: "ಕಫ-ಪಿತ್ತ ಪ್ರಕೃತಿ (Kapha-Pitta)", en: "Kapha-Pitta Constitution" },
    { kn: "ಸಮಧಾತು ಪ್ರಕೃತಿ (Tridosha Balanced)", en: "Balanced Tridosha Constitution" }
  ];
  const constObj = constitutions[lagnaIndex % constitutions.length];

  return {
    prakritiConstitutionKn: constObj.kn,
    prakritiConstitutionEn: constObj.en,
    vulnerableOrgansKn: [
      "ಜೀರ್ಣಾಂಗ ವ್ಯವಸ್ಥೆ (ಹೊಟ್ಟೆ, ಯಕೃತ್ತು ಹಾಗೂ ಆಮ್ಲೀಯತೆ / Acidity)",
      "ಕುತ್ತಿಗೆ, ಭುಜ ಹಾಗೂ ಬೆನ್ನುಮೂಳೆಯ ಸೆಳೆತ",
      "ಕಣ್ಣಿನ ಆಯಾಸ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದ ಏರಿಳಿತ"
    ],
    vulnerableOrgansEn: [
      "Digestive tract (stomach acidity, liver vitality)",
      "Neck, shoulders, and cervical spine stiffness",
      "Visual strain and blood pressure rhythm"
    ],
    seasonalDietAdviceKn: "ಬೆಚ್ಚಗಿನ ಸಾತ್ವಿಕ ಆಹಾರ, ಸಾಕಷ್ಟು ಶುದ್ಧ ನೀರು ಹಾಗೂ ಜೇನುತುಪ್ಪ-ಶುಂಠಿ ಕಷಾಯ ಸೇವನೆ. ಎಣ್ಣೆ ಮತ್ತು ಅತಿಯಾದ ಖಾರ-ಹುಳಿ ಪದಾರ್ಥಗಳಿಂದ ದೂರವಿರಿ.",
    seasonalDietAdviceEn: "Warm sattvic freshly cooked meals, herbal ginger-honey tea, and avoiding excessive oily or overly spicy foods.",
    dailyLifestyleHabitKn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯಕ್ಕೆ ಮುನ್ನ ಎದ್ದು 15 ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ (ಅನುಲೋಮ-ವಿಲೋಮ) ಹಾಗೂ ಲಘು ಯೋಗಾಭ್ಯಾಸ.",
    dailyLifestyleHabitEn: "Rise before sunrise for 15 minutes of Pranayama and gentle meditative stretching.",
    healingMantraKn: "ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಧನ್ವಂತರಯೇ ಅಮೃತಕಲಶ ಹಸ್ತಾಯ ಸರ್ವಾಮಯ ವಿನಾಶಾಯ ತ್ರೈಲೋಕ್ಯನಾಥಾಯ ನಮಃ",
    healingMantraEn: "Om Namo Bhagavate Vasudevaya Dhanvantaraye Amritakalasha Hastaya Sarvamaya Vinashaya Trailokyanathaya Namah",
    ayurvedicRasayanaKn: "ಚ್ಯವನಪ್ರಾಶ, ತ್ರಿಫಲಾ ಚೂರ್ಣ ಹಾಗೂ ಅಶ್ವಗಂಧ ಕ್ಷೀರಪಾಕ.",
    ayurvedicRasayanaEn: "Chyavanaprasha, Triphala Churna, and Ashwagandha herbal milk decoction."
  };
}

/** 6. Compute Preset QnA Pairs */
function computePresetQnA(kundli: KundliOutput, context: any, dashaLord: string): QnAPair[] {
  return [
    {
      id: "q_property",
      questionKn: "ಮನೆ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ ಯಾವಾಗ ಯೋಗವಿದೆ?",
      questionEn: "When will I acquire my own house or real estate property?",
      answerKn: `೪ನೇ ಭಾವ ಹಾಗೂ ಕುಜ ಗ್ರಹದ ಸ್ಥಿತಿಯ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಭೂಮಿ-ಭವನ ಯೋಗವು ಪ್ರಬಲವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${toKannadaPlanet(dashaLord)} ದಶೆಯಲ್ಲಿ ಗುರು ಗ್ರಹದ ಶುಭ ಗೋಚಾರದಿಂದ ಮುಂದಿನ 14 ರಿಂದ 20 ತಿಂಗಳುಗಳಲ್ಲಿ ಸ್ವಂತ ಗೃಹ ಅಥವಾ ನಿವೇಶನ ಖರೀದಿ ಸಾಕಾರಗೊಳ್ಳಲಿದೆ. ಧರ್ಮಪೂರ್ವಕವಾಗಿ ಕೈಗೊಂಡ ನಿರ್ಧಾರಗಳು ಶಾಶ್ವತ ಶಾಂತಿ ತರಲಿವೆ.`,
      answerEn: `The 4th house and Mars show strong property acquisition yoga. Under current ${dashaLord} Dasha and favorable Jupiter transit, the next 14 to 20 months are highly auspicious for property registration or home purchase.`,
      remedyKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಭೂಮಿ ಸೂಕ್ತ ಪಠಣೆ.",
      remedyEn: "Milk Abhisheka to Lord Subramanya and Bhumi Sukta chanting."
    },
    {
      id: "q_career_growth",
      questionKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಅಥವಾ ವಿದೇಶ ಯಾನ ಯೋಗ ಲಭಿಸುವುದೇ?",
      questionEn: "Will I receive a career promotion or foreign relocation opportunity?",
      answerKn: `೧೦ನೇ ಕರ್ಮ ಭಾವ ಹಾಗೂ ೯ನೇ ಭಾಗ್ಯ ಭಾವಗಳ ಸಂಯೋಗವು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ಅಧಿಕಾರವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ವಿದೇಶ/ದೂರ ಪ್ರದೇಶದ ಯೋಜನೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸೌಜನ್ಯದಿಂದ ವರ್ತಿಸಿ.`,
      answerEn: `The 10th and 9th house combination promises executive recognition. The upcoming cycles bring promotion prospects and fruitful long-distance travels or international engagements.`,
      remedyKn: "ಪ್ರತಿನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ.",
      remedyEn: "Daily Surya Namaskar and Rudrabhisheka at Gokarna Kshetra."
    },
    {
      id: "q_debt_relief",
      questionKn: "ನನ್ನ ಸಾಲದ ಬಾಧೆ ಯಾವಾಗ ಸಂಪೂರ್ಣ ಪರಿಹಾರವಾಗುತ್ತದೆ?",
      questionEn: "When will my debts and financial burdens be completely resolved?",
      answerKn: `೬ನೇ ಭಾವ ಹಾಗೂ ಶನಿ ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಹಣಕಾಸಿನ ಹರಿವಿನಲ್ಲಿ ತಾತ್ಕಾಲಿಕ ಅಡಚಣೆ ಕಂಡುಬಂದರೂ, ಇದು ಶಾಶ್ವತವಲ್ಲ. ಮುಂಬರುವ ವರ್ಷದಲ್ಲಿ ಆರ್ಥಿಕ ಶಿಸ್ತು ಹಾಗೂ ನೂತನ ಆದಾಯ ಮೂಲಗಳಿಂದ ಸಾಲದ ಬಹುತೇಕ ಭಾಗ ಪರಿಹಾರವಾಗಲಿದೆ. ಅನಾವಶ್ಯಕ ಜಾಮೀನು ಅಥವಾ ಸಾಲದ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.`,
      answerEn: `While 6th house transit caused temporary cashflow pressure, disciplined budgeting and new income streams will eliminate the bulk of debt over the next 12 to 18 months.`,
      remedyKn: "ಪ್ರತಿ ಮಂಗಳವಾರ ಋಣವಿಮೋಚಕ ಮಂಗಳ ಸ್ತೋತ್ರ ಪಠಣೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ.",
      remedyEn: "Weekly recitation of Runavimochana Mangala Stotram on Tuesdays."
    },
    {
      id: "q_marriage_finalization",
      questionKn: "ವಿವಾಹ ಸಂಬಂಧ ಯಾವಾಗ ನಿಶ್ಚಯವಾಗಿ ಕಲ್ಯಾಣ ನೆರವೇರುವುದು?",
      questionEn: "When will my marriage proposal be finalized into wedding union?",
      answerKn: `೭ನೇ ಭಾವದಲ್ಲಿ ಗುರು ದೃಷ್ಟಿಯು ಕಲ್ಯಾಣ ಭಾಗ್ಯವನ್ನು ಖಾತರಿಪಡಿಸಿದೆ. ಸದ್ಯದಲ್ಲಿಯೇ ಯೋಗ್ಯ ಸಂಬಂಧ ಕೂಡಿಬರಲಿದ್ದು, ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಕಲ್ಯಾಣ ನಿಶ್ಚಯವಾಗಲಿದೆ. ಪೂರ್ವ ದಿಕ್ಕು ಅಥವಾ ಈಶಾನ ದಿಕ್ಕಿನಿಂದ ಪ್ರಸ್ತಾವನೆ ಬರುವ ಸಾಧ್ಯತೆ ಹೆಚ್ಚಿದೆ.`,
      answerEn: `Jupiter's aspect over the 7th house ensures marriage solemnization. An auspicious proposal from the East or North-East direction will materialize with family consensus.`,
      remedyKn: "ಶ್ರೀ ಉಮಾ-ಮಹೇಶ್ವರ ಪೂಜೆ ಹಾಗೂ ಲಲಿತಾ ಸಹಸ್ರನಾಮ ಅರ್ಚನೆ.",
      remedyEn: "Uma-Maheshwara Puja and Lalitha Sahasranama Archana."
    },
    {
      id: "q_health_protection",
      questionKn: "ಆರೋಗ್ಯ ಚೇತರಿಕೆ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ರಕ್ಷಣೆ ಹೇಗೆ?",
      questionEn: "How to ensure holistic health recovery, vitality, and longevity?",
      answerKn: `ಲಗ್ನಾಧಿಪತಿಯ ಬಲವು ಜಾತಕರಿಗೆ ಉತ್ತಮ ಆಯುಷ್ಯವನ್ನು ದಯಪಾಲಿಸಿದೆ. ಮಾನಸಿಕ ಒತ್ತಡ ಹಾಗೂ ಆಹಾರದ ಅಸಮತೋಲನವನ್ನು ನಿಯಂತ್ರಿಸಿದರೆ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ತಾನಾಗಿಯೇ ವೃದ್ಧಿಯಾಗುತ್ತದೆ. ಆಯುರ್ವೇದ ಪದ್ಧತಿಯ ಪಥ್ಯವು ಶ್ರೇಷ್ಠ ಪರಿಹಾರ.`,
      answerEn: `The Lagna lord bestows strong longevity. Managing stress and maintaining Ayurvedic dietary discipline will naturally restore peak immunity and vitality.`,
      remedyKn: "ಪ್ರತಿದಿನ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಧನ್ವಂತರಿ ಹೋಮ ಪ್ರಸಾದ.",
      remedyEn: "Maha Mrityunjaya Mantra chanting and Dhanvantari Homa blessings."
    }
  ];
}

/**
 * Custom Question Answerer with Gemini AI and deterministic Parashari fallback
 */
export async function answerCustomDivineQuestion(
  report: SpecialConsultationFullReport,
  question: string,
  lang: SpecialConsultationLang = "kn",
  apiKey?: string
): Promise<{ answer: string; remedy: string }> {
  const langCode = lang || "kn";
  const fallbackAnswerKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಸಿದ್ಧ ಪದ್ಧತಿಯಂತೆ, ನಿಮ್ಮ ${report.lagnaNameKn} ಲಗ್ನ, ${report.rashiNameKn} ರಾಶಿ ಹಾಗೂ ${report.nakshatraNameKn} ನಕ್ಷತ್ರದ ಗ್ರಹಗತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ಕೇಳಿರುವ "${question}" ಪ್ರಶ್ನೆಗೆ ದೈವಾನುಗ್ರಹವಿದೆ.\n\nಪ್ರಸ್ತುತ ${report.currentDashaKn} ದಶಾ ಕಾಲದಲ್ಲಿ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹರ ಸಂಚಾರವು ನಿಮ್ಮ ಯತ್ನಗಳಿಗೆ ಧನಾತ್ಮಕ ತಿರುವು ನೀಡಲಿದೆ. ಧರ್ಮಪೂರ್ವಕ ನಡೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದಿಂದ ಕೈಗೊಂಡ ಕಾರ್ಯಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ.\n\nಮನಸ್ಸಿನಲ್ಲಿ ಆತಂಕ ಬಿಟ್ಟು ನಿಶ್ಚಯದಿಂದ ಮುನ್ನಡೆಯಿರಿ.`;
  const fallbackRemedyKn = `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ದೀಪಾರಾಧನೆ ಮಾಡಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.`;

  const fallbackAnswerEn = `According to the authentic Gokarna Jyotisha tradition, examining your ${report.lagnaNameEn} Lagna, ${report.rashiNameEn} Moon sign, and ${report.nakshatraNameEn} constellation, your question "${question}" holds favorable cosmic alignment.\n\nUnder current ${report.currentDashaEn} Dasha, strategic patience and righteous conduct will unlock fruitful breakthroughs.\n\nProceed with calm confidence.`;
  const fallbackRemedyEn = `Sankalpa Rudrabhisheka and Navagraha Ghee Lamp offering at Gokarna Mahabaleshwara Kshetra ensure rapid obstacle clearance.`;

  if (!apiKey) {
    return {
      answer: langCode === "kn" ? fallbackAnswerKn : fallbackAnswerEn,
      remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.6
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `
You are Sri Shreeram Pandit, Master Astrologer from Gokarna Mahabaleshwara Kshetra (+91 99723 39362).
The devotee ${report.devoteeName} (Lagna: ${report.lagnaNameEn}, Rashi: ${report.rashiNameEn}, Nakshatra: ${report.nakshatraNameEn}, Dasha: ${report.currentDashaEn}) has asked this personal life query:
"${question}"

Provide a compassionate, mathematically grounded Vedic astrological answer in 3 rich paragraphs:
Paragraph 1: Planetary assessment of the relevant Bhava, active Dasha, and Gochara transit.
Paragraph 2: Realistic timeline, outcome, and practical advice.
Paragraph 3: Specific Gokarna Temple Seva / Parihara (e.g. Rudrabhisheka, Kalasarpa Shanti, Navagraha Homa, or Mahalakshmi Puja).

Rules:
- Write strictly in script of language: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT use markdown bold asterisks (**) or latin English words inside Kannada/Indic text.
- Maintain utmost Vedic dignity and spiritual warmth.
`;

    const res = await model.generateContent(prompt);
    const text = (await res.response).text() || "";
    if (!text.trim()) {
      return {
        answer: langCode === "kn" ? fallbackAnswerKn : fallbackAnswerEn,
        remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn
      };
    }

    const parts = text.split(/ಪರಿಹಾರ|Remedy|उपाय|పరిహారం|பரிகாரம்/i);
    const ansPart = parts[0]?.trim() || text.trim();
    const remPart = parts[1]?.trim() || (langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn);

    return {
      answer: ansPart,
      remedy: remPart
    };
  } catch (err) {
    console.warn("[SpecialConsultationEngine] Gemini custom question error:", err);
    return {
      answer: langCode === "kn" ? fallbackAnswerKn : fallbackAnswerEn,
      remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn
    };
  }
}
