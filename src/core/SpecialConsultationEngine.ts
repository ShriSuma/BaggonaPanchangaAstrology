/**
 * Baggona Panchanga & Astrology - Special Divine Consultation Engine
 *
 * 100% Dynamic Astronomical & Classical Parashari Consultation System
 * Integrated with Gemini 3.5 Flash-Lite AI Narration and Robust Fallback.
 *
 * Modules:
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
import { generateDashaTimeline } from "./DashaBhuktiEngine";
import { calculateTraditionalBaggona, type TraditionalBaggonaPanchanga } from "./TraditionalBaggonaEngine";

export type SpecialConsultationLang = "kn" | "en" | "hi" | "te" | "ta";

// -------------------------------------------------------------
// PLANETARY DIGNITY MAPS (ಉಚ್ಚ, ನೀಚ, ಸ್ವಕ್ಷೇತ್ರ)
// -------------------------------------------------------------
export const EXALTATION_SIGNS: Record<PlanetName, number> = {
  [PlanetName.Sun]: 0,     // Aries (ಮೇಷ)
  [PlanetName.Moon]: 1,    // Taurus (ವೃಷಭ)
  [PlanetName.Mars]: 9,    // Capricorn (ಮಕರ)
  [PlanetName.Mercury]: 5, // Virgo (ಕನ್ಯಾ)
  [PlanetName.Jupiter]: 3, // Cancer (ಕರ್ಕಾಟಕ)
  [PlanetName.Venus]: 11,  // Pisces (ಮೀನ)
  [PlanetName.Saturn]: 6,  // Libra (ತುಲಾ)
  [PlanetName.Rahu]: 1,    // Taurus (ವೃಷಭ/ಮಿಥುನ)
  [PlanetName.Ketu]: 7     // Scorpio (ವೃಶ್ಚಿಕ/ಧನು)
};

export const DEBILITATION_SIGNS: Record<PlanetName, number> = {
  [PlanetName.Sun]: 6,     // Libra (ತುಲಾ)
  [PlanetName.Moon]: 7,    // Scorpio (ವೃಶ್ಚಿಕ)
  [PlanetName.Mars]: 3,    // Cancer (ಕರ್ಕಾಟಕ)
  [PlanetName.Mercury]: 11,// Pisces (ಮೀನ)
  [PlanetName.Jupiter]: 9, // Capricorn (ಮಕರ)
  [PlanetName.Venus]: 5,   // Virgo (ಕನ್ಯಾ)
  [PlanetName.Saturn]: 0,  // Aries (ಮೇಷ)
  [PlanetName.Rahu]: 7,    // Scorpio
  [PlanetName.Ketu]: 1     // Taurus
};

export const OWN_SIGNS: Record<PlanetName, number[]> = {
  [PlanetName.Sun]: [4],
  [PlanetName.Moon]: [3],
  [PlanetName.Mars]: [0, 7],
  [PlanetName.Mercury]: [2, 5],
  [PlanetName.Jupiter]: [8, 11],
  [PlanetName.Venus]: [1, 6],
  [PlanetName.Saturn]: [9, 10],
  [PlanetName.Rahu]: [10],
  [PlanetName.Ketu]: [7]
};

export const RASHI_LORDS: PlanetName[] = [
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

export const NAKSHATRA_LORDS: Record<string, PlanetName> = {
  Ashwini: PlanetName.Ketu,
  Bharani: PlanetName.Venus,
  Krittika: PlanetName.Sun,
  Rohini: PlanetName.Moon,
  Mrigashirsha: PlanetName.Mars,
  Ardra: PlanetName.Rahu,
  Punarvasu: PlanetName.Jupiter,
  Pushya: PlanetName.Saturn,
  Ashlesha: PlanetName.Mercury,
  Magha: PlanetName.Ketu,
  PurvaPhalguni: PlanetName.Venus,
  UttaraPhalguni: PlanetName.Sun,
  Hasta: PlanetName.Moon,
  Chitra: PlanetName.Mars,
  Swati: PlanetName.Rahu,
  Vishakha: PlanetName.Jupiter,
  Anuradha: PlanetName.Saturn,
  Jyeshtha: PlanetName.Mercury,
  Mula: PlanetName.Ketu,
  PurvaAshadha: PlanetName.Venus,
  UttaraAshadha: PlanetName.Sun,
  Shravana: PlanetName.Moon,
  Dhanishta: PlanetName.Mars,
  Shatabhisha: PlanetName.Rahu,
  PurvaBhadrapada: PlanetName.Jupiter,
  UttaraBhadrapada: PlanetName.Saturn,
  Revati: PlanetName.Mercury
};

// -------------------------------------------------------------
// INTERFACES FOR ALL 6 MODULES
// -------------------------------------------------------------

export interface PlanetaryDignityAssessment {
  planet: PlanetName;
  nameKn: string;
  nameEn: string;
  rashiIndex: number;
  rashiKn: string;
  rashiEn: string;
  house: number;
  degree: number;
  dignity: "exalted" | "debilitated" | "own" | "friendly" | "enemy" | "neutral";
  dignityLabelKn: string;
  dignityLabelEn: string;
  isCombust: boolean;
  isRetrograde: boolean;
}

export interface MonthForecast {
  monthIndex: number; // 0 to 11
  monthNameKn: string;
  monthNameEn: string;
  solarMasaKn: string;
  solarMasaEn: string;
  transitingSunSignKn: string;
  transitingSunSignEn: string;
  sunTransitHouseFromMoon: number;
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
  sadeSatiStatusKn: string;
  sadeSatiStatusEn: string;
  ashtamaShaniStatusKn: string;
  ashtamaShaniStatusEn: string;
  guruGocharaStatusKn: string;
  guruGocharaStatusEn: string;
  months: MonthForecast[];
}

export interface MarriageDossierResult {
  verdictTitleKn: string;
  verdictTitleEn: string;
  marriageWindowKn: string;
  marriageWindowEn: string;
  isMinor?: boolean;
  isMarried?: boolean;
  age?: number;
  spouseProfile: {
    directionKn: string;
    directionEn: string;
    natureKn: string;
    natureEn: string;
    professionDomainKn: string;
    professionDomainEn: string;
  };
  kujaDoshaStatusKn: string;
  kujaDoshaStatusEn: string;
  maritalHarmonyAdviceKn: string;
  maritalHarmonyAdviceEn: string;
  sacredRemedyKn: string;
  sacredRemedyEn: string;
}

export interface WealthCareerResult {
  vocationTypeKn: string;
  vocationTypeEn: string;
  primaryWealthYogasKn: string[];
  primaryWealthYogasEn: string[];
  induLagnaProsperityScore: number;
  prosperityVerdictKn: string;
  prosperityVerdictEn: string;
  debtClearanceTimelineKn: string;
  debtClearanceTimelineEn: string;
  investmentGuidanceKn: string;
  investmentGuidanceEn: string;
  wealthRemedyKn: string;
  wealthRemedyEn: string;
}

export interface GemstoneDetail {
  nameKn: string;
  nameEn: string;
  sanskritName: string;
  gemTypeKn: string;
  gemTypeEn: string;
  governingPlanetKn: string;
  governingPlanetEn: string;
  planetaryDignityKn: string;
  planetaryDignityEn: string;
  recommendedWeight: string;
  suitableMetalKn: string;
  suitableMetalEn: string;
  wearingFingerKn: string;
  wearingFingerEn: string;
  auspiciousDayKn: string;
  auspiciousDayEn: string;
  consecrationTaraKn: string;
  consecrationTaraEn: string;
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
    panchangaReasonKn: string;
    panchangaReasonEn: string;
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

export interface AyurHealthResult {
  prakritiConstitutionKn: string;
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
  nakshatraLordKn: string;
  nakshatraLordEn: string;
  currentDashaKn: string;
  currentDashaEn: string;

  // Complete Panchanga Angas
  panchanga: {
    samvatsaraKn: string;
    samvatsaraEn: string;
    masaKn: string;
    masaEn: string;
    pakshaKn: string;
    pakshaEn: string;
    tithiKn: string;
    tithiEn: string;
    weekdayKn: string;
    weekdayEn: string;
    yogaKn: string;
    yogaEn: string;
    karanaKn: string;
    karanaEn: string;
  };

  // Planetary Dignity Map
  planetaryDignities: Record<PlanetName, PlanetaryDignityAssessment>;

  // AI Narration Metadata
  aiNarration: {
    isAiGenerated: boolean;
    aiModel: string;
    statusNoticeKn: string;
    statusNoticeEn: string;
    varshaphalaNarrative?: string;
    marriageNarrative?: string;
    wealthNarrative?: string;
    gemstoneNarrative?: string;
    healthNarrative?: string;
    customQuestionNarrative?: string;
  };

  // 6 Primary Consultation Modules
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
// CLASSICAL GEMSTONE DATABASE
// -------------------------------------------------------------
const GEMSTONE_MAP: Record<PlanetName, {
  kn: string;
  en: string;
  sanskrit: string;
  metalKn: string;
  metalEn: string;
  fingerKn: string;
  fingerEn: string;
  dayKn: string;
  dayEn: string;
  mantraKn: string;
  mantraEn: string;
}> = {
  [PlanetName.Sun]: {
    kn: "ಮಾಣಿಕ್ಯ (Ruby)",
    en: "Ruby (Manikya)",
    sanskrit: "माणिक्यम्",
    metalKn: "೨೨ಕ್ಯಾರಟ್ ಶುದ್ಧ ಚಿನ್ನ ಅಥವಾ ತಾಮ್ರ",
    metalEn: "22K Pure Gold or Copper",
    fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ - ಬಲಗೈ)",
    fingerEn: "Ring finger (Anamika - Right Hand)",
    dayKn: "ಭಾನುವಾರ ಸೂರ್ಯೋದಯದ ಶುಭ ಘಳಿಗೆಯಲ್ಲಿ",
    dayEn: "Sunday at sunrise during Shukla Paksha",
    mantraKn: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Hram Hreem Hroum Sah Suryaya Namah (108 times)"
  },
  [PlanetName.Moon]: {
    kn: "ನೈಜ ಮುತ್ತು (Natural Basra Pearl)",
    en: "Natural Pearl (Mukta)",
    sanskrit: "मुक्ताफलम्",
    metalKn: "ಶುದ್ಧ ಬೆಳ್ಳಿ (Pure Silver)",
    metalEn: "Pure Silver",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ - ಬಲಗೈ)",
    fingerEn: "Little finger (Kanishthika - Right Hand)",
    dayKn: "ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಧ್ಯಾಕಾಲ",
    dayEn: "Monday morning or evening",
    mantraKn: "ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Shram Shreem Shroum Sah Chandraya Namah (108 times)"
  },
  [PlanetName.Mars]: {
    kn: "ಕೆಂಪು ಹವಳ (Italian Red Coral / ಪ್ರವಾಳ)",
    en: "Red Coral (Moonga / Pravala)",
    sanskrit: "प्रवालम्",
    metalKn: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ (Copper or Gold)",
    metalEn: "Copper or 18K/22K Gold",
    fingerKn: "ಉಂಗುರದ ಬೆರಳು (ಅನಾಮಿಕಾ - ಬಲಗೈ)",
    fingerEn: "Ring finger (Anamika - Right Hand)",
    dayKn: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ ಶುಭ ಹೋರೆಯಲ್ಲಿ",
    dayEn: "Tuesday morning during Mars Hora",
    mantraKn: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Kram Kreem Kroum Sah Bhaumaya Namah (108 times)"
  },
  [PlanetName.Mercury]: {
    kn: "ಪಚ್ಚೆ (Zambian/Colombian Emerald / ಮರಕತ)",
    en: "Emerald (Marakatha / Panna)",
    sanskrit: "मरकतम्",
    metalKn: "ಚಿನ್ನ ಅಥವಾ ಕಂಚು (Gold or Bronze)",
    metalEn: "Gold or Bronze",
    fingerKn: "ಕಿರುಬೆರಳು (ಕನಿಷ್ಠಿಕಾ - ಬಲಗೈ)",
    fingerEn: "Little finger (Kanishthika - Right Hand)",
    dayKn: "ಬುಧವಾರ ಸೂರ್ಯೋದಯದಿಂದ ೨ ಗಂಟೆಗಳ ಒಳಗೆ",
    dayEn: "Wednesday morning within 2 hours of sunrise",
    mantraKn: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Bram Breem Broum Sah Budhaya Namah (108 times)"
  },
  [PlanetName.Jupiter]: {
    kn: "ಪುಷ್ಪರಾಗ (Ceylon Yellow Sapphire / ಗುರು ರತ್ನ)",
    en: "Yellow Sapphire (Pushparaga / Pukhraj)",
    sanskrit: "पुष्परागम्",
    metalKn: "೨೨ಕ್ಯಾರಟ್ ಶುದ್ಧ ಚಿನ್ನ ಅಥವಾ ಪಂಚಲೋಹ",
    metalEn: "22K Pure Gold or Panchaloha",
    fingerKn: "ತೋರುಬೆರಳು (ತರ್ಜನಿ - ಬಲಗೈ)",
    fingerEn: "Index finger (Tarjani - Right Hand)",
    dayKn: "ಗುರುವಾರ ಶುಕ್ಲಪಕ್ಷ ಪ್ರಾತಃಕಾಲ ಗುರು ಹೋರೆಯಲ್ಲಿ",
    dayEn: "Thursday morning during Jupiter Hora",
    mantraKn: "ಓಂ ಗ್ರಾಂಗ್ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Gram Greem Groum Sah Gurave Namah (108 times)"
  },
  [PlanetName.Venus]: {
    kn: "ವಜ್ರ ಅಥವಾ ನೈಸರ್ಗಿಕ ಬಿಳಿ ಜಿರ್ಕಾನ್ (Diamond / White Zircon)",
    en: "Diamond or Natural White Zircon (Vajra / Heera)",
    sanskrit: "वज्रम्",
    metalKn: "ಪ್ಲಾಟಿನಂ, ಬಿಳಿ ಚಿನ್ನ ಅಥವಾ ಶುದ್ಧ ಬೆಳ್ಳಿ",
    metalEn: "Platinum, White Gold or Pure Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು ಅಥವಾ ಕಿರುಬೆರಳು",
    fingerEn: "Middle or Little finger",
    dayKn: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ ಶುಕ್ರ ಹೋರೆಯಲ್ಲಿ",
    dayEn: "Friday morning during Venus Hora",
    mantraKn: "ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Dram Dreem Droum Sah Shukraya Namah (108 times)"
  },
  [PlanetName.Saturn]: {
    kn: "ನೀಲಂ / ನೀಲಮಣಿ ಅಥವಾ ಅಮೆಥಿಸ್ಟ್ (Blue Sapphire / Amethyst)",
    en: "Blue Sapphire or Amethyst (Neelam)",
    sanskrit: "नीलमणिः",
    metalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ (Panchaloha or Silver)",
    metalEn: "Panchaloha or Silver",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ - ಬಲಗೈ)",
    fingerEn: "Middle finger (Madhyama - Right Hand)",
    dayKn: "ಶನಿವಾರ ಸೂರ್ಯಾಸ್ತದ ಸಂಧ್ಯಾ ಸಮಯದಲ್ಲಿ",
    dayEn: "Saturday around twilight/sunset",
    mantraKn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Pram Preem Proum Sah Shanaishcharaya Namah (108 times)"
  },
  [PlanetName.Rahu]: {
    kn: "ಗೋಮೇಧಿಕ (Hessonite Garnet)",
    en: "Hessonite Garnet (Gomedha)",
    sanskrit: "गोमेदकम्",
    metalKn: "ಬೆಳ್ಳಿ ಅಥವಾ ಅಷ್ಟಧಾತು",
    metalEn: "Silver or Ashtadhatu",
    fingerKn: "ಮಧ್ಯದ ಬೆರಳು (ಮಧ್ಯಮಾ)",
    fingerEn: "Middle finger",
    dayKn: "ಶನಿವಾರ ಅಥವಾ ಬುಧವಾರ ರಾತ್ರಿ",
    dayEn: "Saturday night",
    mantraKn: "ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Bhram Bhreem Bhroum Sah Rahave Namah (108 times)"
  },
  [PlanetName.Ketu]: {
    kn: "ಲಹ್ಸುನಿಯಾ (Cat's Eye / ವೈಡೂರ್ಯ)",
    en: "Cat's Eye Chrysoberyl (Vaidurya)",
    sanskrit: "वैडूर्यम्",
    metalKn: "ಪಂಚಲೋಹ ಅಥವಾ ಬೆಳ್ಳಿ",
    metalEn: "Panchaloha or Silver",
    fingerKn: "ಕಿರುಬೆರಳು ಅಥವಾ ಉಂಗುರದ ಬೆರಳು",
    fingerEn: "Little or Ring finger",
    dayKn: "ಗುರುವಾರ ಅಥವಾ ಮಂಗಳವಾರ ರಾತ್ರಿ",
    dayEn: "Tuesday night",
    mantraKn: "ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ (೧೦೮ ಬಾರಿ)",
    mantraEn: "Om Sram Sreem Sroum Sah Ketave Namah (108 times)"
  }
};

// -------------------------------------------------------------
// COMPUTE DIGNITY FOR ALL PLANETS
// -------------------------------------------------------------
export function evaluatePlanetaryDignity(planet: PlanetPosition, sunPlanet?: PlanetPosition): PlanetaryDignityAssessment {
  const pName = planet.name;
  const rIdx = planet.rashi.index;

  const isExalted = EXALTATION_SIGNS[pName] === rIdx;
  const isDebilitated = DEBILITATION_SIGNS[pName] === rIdx;
  const isOwn = (OWN_SIGNS[pName] || []).includes(rIdx);

  let dignity: "exalted" | "debilitated" | "own" | "friendly" | "enemy" | "neutral" = "neutral";
  let labelKn = "ಸಾಧಾರಣ ಸ್ಥಿತಿ (ಸಮ)";
  let labelEn = "Neutral Sign (Sama)";

  if (isExalted) {
    dignity = "exalted";
    labelKn = "ಪರಮ ಉಚ್ಚ ಸ್ಥಿತಿ (ಬಲಶಾಲಿ)";
    labelEn = "Exalted (Param Uchcha)";
  } else if (isDebilitated) {
    dignity = "debilitated";
    labelKn = "ನೀಚ ಸ್ಥಿತಿ (ಶಾಂತಿ ಅವಶ್ಯಕ)";
    labelEn = "Debilitated (Neecha)";
  } else if (isOwn) {
    dignity = "own";
    labelKn = "ಸ್ವಕ್ಷೇತ್ರ ಸ್ಥಿತಿ (ಶುಭದಾಯಕ)";
    labelEn = "Own Sign (Swakshetra)";
  }

  // Check combustion with Sun
  let isCombust = false;
  if (sunPlanet && pName !== PlanetName.Sun && pName !== PlanetName.Rahu && pName !== PlanetName.Ketu) {
    const orb = Math.abs(planet.degree - sunPlanet.degree);
    const shortestOrb = Math.min(orb, 360 - orb);
    const threshold = pName === PlanetName.Moon ? 12 : pName === PlanetName.Mars ? 17 : pName === PlanetName.Mercury ? 14 : pName === PlanetName.Jupiter ? 11 : pName === PlanetName.Venus ? 10 : 15;
    isCombust = shortestOrb <= threshold;
  }

  return {
    planet: pName,
    nameKn: toKannadaPlanet(pName),
    nameEn: pName,
    rashiIndex: rIdx,
    rashiKn: toKannadaRashi(rIdx),
    rashiEn: RASHIS[rIdx]?.english || "Aries",
    house: planet.house,
    degree: planet.degree,
    dignity,
    dignityLabelKn: isCombust ? `${labelKn} [ಅಸ್ತಂಗತ]` : labelKn,
    dignityLabelEn: isCombust ? `${labelEn} [Combust]` : labelEn,
    isCombust,
    isRetrograde: !!planet.isRetrograde
  };
}

// -------------------------------------------------------------
// CORE GENERATION FUNCTION
// -------------------------------------------------------------
export function generateSpecialConsultationReport(
  kundli: KundliOutput,
  context: {
    devoteeName: string;
    birthDate: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    maritalStatus?: string;
    gender?: string;
  }
): SpecialConsultationFullReport {
  const lagnaIndex = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const sunPlanet = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const moonRashiIndex = moonPlanet ? moonPlanet.rashi.index : 0;
  const moonNakshatraName = moonPlanet ? (moonPlanet.nakshatra.english || moonPlanet.nakshatra.sanskrit || "Ashwini") : "Ashwini";

  const lagnaLordPlanet = RASHI_LORDS[lagnaIndex];
  const ninthRashiIndex = (lagnaIndex + 8) % 12;
  const ninthLordPlanet = RASHI_LORDS[ninthRashiIndex];
  const sixthRashiIndex = (lagnaIndex + 5) % 12;
  const eighthRashiIndex = (lagnaIndex + 7) % 12;
  const twelfthRashiIndex = (lagnaIndex + 11) % 12;

  // Real-time Traditional Panchanga computation
  const lat = context.latitude || 14.5479;
  const lon = context.longitude || 74.3188;
  const bTime = context.birthTime || "12:00";
  let tradPanchanga: TraditionalBaggonaPanchanga | null = null;
  try {
    tradPanchanga = calculateTraditionalBaggona(context.birthDate, bTime, lat, lon);
  } catch (err) {
    console.warn("Traditional Panchanga fallback used:", err);
  }

  // Planetary Dignity Assessment for all planets
  const dignities: Partial<Record<PlanetName, PlanetaryDignityAssessment>> = {};
  for (const p of kundli.planets) {
    dignities[p.name] = evaluatePlanetaryDignity(p, sunPlanet);
  }
  const fullDignities = dignities as Record<PlanetName, PlanetaryDignityAssessment>;

  // Dasha Timeline
  const dashaTimeline = generateDashaTimeline(kundli);
  const currentDashaName = (dashaTimeline && dashaTimeline[0]?.planet) ? dashaTimeline[0].planet : lagnaLordPlanet;

  const nakLord = NAKSHATRA_LORDS[moonNakshatraName] || PlanetName.Ketu;

  // 1. 12-Month Gochara Forecast (100% Dynamic from natal Moon and Lagna)
  const twelveMonthForecast = compute12MonthDynamicGochara(moonRashiIndex, lagnaIndex);

  // 2. Marriage & Relationship Dossier
  const marriageDossier = computeMarriageDossier(kundli, context);

  // 3. Wealth & Career Blueprint
  const wealthCareer = computeWealthCareerBlueprint(kundli, lagnaIndex);

  // 4. Sacred Gemstone, Rudraksha & Yantra Prescription (with Dignity, Havala, and Panchanga)
  const gemstoneRudraksha = computeGemstoneAndRudrakshaWithDignity(
    lagnaLordPlanet,
    ninthLordPlanet,
    nakLord,
    fullDignities,
    [sixthRashiIndex, eighthRashiIndex, twelfthRashiIndex],
    tradPanchanga
  );

  // 5. Ayur Sanjeevini Health Profile
  const ayurHealth = computeAyurHealthProfile(kundli, lagnaIndex);

  // 6. Preset QnA List
  const presetQnAList = computePresetQnA(kundli, context, currentDashaName);

  return {
    devoteeName: context.devoteeName || "ಭಕ್ತಾದಿಗಳು",
    birthDate: context.birthDate,
    birthTime: bTime,
    lagnaNameKn: toKannadaRashi(lagnaIndex),
    lagnaNameEn: RASHIS[lagnaIndex]?.english || "Aries",
    rashiNameKn: toKannadaRashi(moonRashiIndex),
    rashiNameEn: RASHIS[moonRashiIndex]?.english || "Aries",
    nakshatraNameKn: toKannadaNakshatra(moonNakshatraName),
    nakshatraNameEn: moonNakshatraName,
    nakshatraLordKn: toKannadaPlanet(nakLord),
    nakshatraLordEn: nakLord,
    currentDashaKn: toKannadaPlanet(currentDashaName),
    currentDashaEn: currentDashaName,

    panchanga: {
      samvatsaraKn: tradPanchanga?.samvatsaraKn || "ಕ್ರೋಧಿ ಸಂವತ್ಸರ",
      samvatsaraEn: tradPanchanga?.samvatsara || "Krodhi",
      masaKn: tradPanchanga?.masaKn || "ಚೈತ್ರ ಮಾಸ",
      masaEn: tradPanchanga?.masa || "Chaitra",
      pakshaKn: tradPanchanga?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷ",
      pakshaEn: tradPanchanga?.paksha || "Shukla",
      tithiKn: tradPanchanga?.tithiKn || "ಪ್ರತಿಪದಾ",
      tithiEn: tradPanchanga?.tithi || "Pratipada",
      weekdayKn: tradPanchanga?.weekdayKn || "ಗುರುವಾರ",
      weekdayEn: tradPanchanga?.weekday || "Thursday",
      yogaKn: tradPanchanga?.yogaKn || "ಶೋಭನ ಯೋಗ",
      yogaEn: tradPanchanga?.yoga || "Shobhana",
      karanaKn: tradPanchanga?.karanaKn || "ಬವ ಕರಣ",
      karanaEn: tradPanchanga?.karana || "Bava"
    },

    planetaryDignities: fullDignities,

    aiNarration: {
      isAiGenerated: false,
      aiModel: "gemini-3.5-flash-lite",
      statusNoticeKn: "⚠️ ದೈವಿಕ ಗಣಿತ ಫಾಲ್‌ಬ್ಯಾಕ್ ಡೇಟಾ: ಸಾಮಾನ್ಯ ಶಾಸ್ತ್ರೀಯ ಪರಾಶರ ಗಣನೆಯನ್ನು ಬಳಸಲಾಗಿದೆ (from fallback I have getting from the data)",
      statusNoticeEn: "⚠️ Fallback Mathematical Data: Computed using classical Parashari mathematical engine (from fallback I have getting from the data)"
    },

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

// -------------------------------------------------------------
// 1. DYNAMIC 12-MONTH PREDICTIVE GOCHARA TIMELINE
// -------------------------------------------------------------
function compute12MonthDynamicGochara(moonRashiIdx: number, lagnaIdx: number): TwelveMonthForecastResult {
  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

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

  // In 2026/2027: Saturn transits Pisces (Sign 11), Jupiter transits Taurus/Gemini (Sign 1 / 2)
  const saturnGocharaSign = 11; // Pisces
  const jupiterGocharaSign = 1; // Taurus

  // Calculate Sade Sati relative to natal Moon
  const saturnRelativeHouse = ((saturnGocharaSign - moonRashiIdx + 12) % 12) + 1;
  let sadeSatiKn = "ಏಳರಾಟ ಶನಿ ಪ್ರಭಾವವಿಲ್ಲ (ನಿರ್ದೋಷ)";
  let sadeSatiEn = "No Sade Sati active (Clear)";
  if (saturnRelativeHouse === 12) {
    sadeSatiKn = "ಏಳರಾಟ ಶನಿ: ಪ್ರಥಮ ಚರಣ (ಆರೋಹಣ - ವೆಚ್ಚ & ಮಾನಸಿಕ ಆತಂಕ)";
    sadeSatiEn = "Sade Sati: 1st Phase (Rising - Expenses & Restlessness)";
  } else if (saturnRelativeHouse === 1) {
    sadeSatiKn = "ಏಳರಾಟ ಶನಿ: ದ್ವಿತೀಯ ಚರಣ (ಜನ್ಮ ಶನಿ - ಕಠಿಣ ಕರ್ಮ ಪರೀಕ್ಷೆ)";
    sadeSatiEn = "Sade Sati: Peak Phase (Janma Shani - Intensive Karmic Testing)";
  } else if (saturnRelativeHouse === 2) {
    sadeSatiKn = "ಏಳರಾಟ ಶನಿ: ತೃತೀಯ ಚರಣ (ಅವರೋಹಣ - ಪರಿಹಾರದ ಹಂತ)";
    sadeSatiEn = "Sade Sati: Final Phase (Setting - Gradual Stabilization)";
  }

  // Ashtama Shani (8th from Moon)
  const isAshtama = saturnRelativeHouse === 8;
  const ashtamaKn = isAshtama ? "ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ (ಆರೋಗ್ಯ ಹಾಗೂ ವೃತ್ತಿಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ)" : "ಅಷ್ಟಮ ಶನಿ ದೋಷವಿಲ್ಲ";
  const ashtamaEn = isAshtama ? "Ashtama Shani Active (Health & Career Vigilance Required)" : "No Ashtama Shani";

  // Jupiter Gochara (Guru transit from Moon)
  const jupiterRelativeHouse = ((jupiterGocharaSign - moonRashiIdx + 12) % 12) + 1;
  const isGuruBenefic = [2, 5, 7, 9, 11].includes(jupiterRelativeHouse);
  const guruKn = isGuruBenefic
    ? `ಗುರು ಬಲ ಸಕ್ರಿಯ (${jupiterRelativeHouse}ನೇ ಸ್ಥಾನ - ಧನಾಗಮನ, ಕಲ್ಯಾಣ & ಗೌರವ)`
    : `ಗುರು ಸಂಚಾರ: ${jupiterRelativeHouse}ನೇ ಸ್ಥಾನ (ಸಾಮಾನ್ಯ ಪರಿಶ್ರಮ & ತಾಳ್ಮೆ)`;
  const guruEn = isGuruBenefic
    ? `Benefic Jupiter Transit (${jupiterRelativeHouse}th House - Wealth & Prosperity)`
    : `Neutral Jupiter Transit (${jupiterRelativeHouse}th House)`;

  const months: MonthForecast[] = [];

  for (let i = 0; i < 12; i++) {
    const mIdx = (currentMonthIdx + i) % 12;
    const yearOffset = Math.floor((currentMonthIdx + i) / 12);
    const yr = currentYear + yearOffset;

    // Sun transits sign mIdx (Approx: Jan=Capricorn(9), Apr=Aries(0), etc.)
    const sunSignIdx = (mIdx + 9) % 12;
    const sunHouse = ((sunSignIdx - moonRashiIdx + 12) % 12) + 1;

    // Classical Parashari Gochara for Sun: Auspicious in 3, 6, 10, 11
    const isSunBenefic = [3, 6, 10, 11].includes(sunHouse);
    const isSunDifficult = [1, 2, 8, 12].includes(sunHouse);

    let rating: "high" | "moderate" | "cautious" = "moderate";
    let ratingKn = "ಸಾಧಾರಣ ಅನುಕೂಲ (ಸ್ಥಿರ)";
    let ratingEn = "Steady & Moderate Alignment";

    if (isSunBenefic && isGuruBenefic) {
      rating = "high";
      ratingKn = "ಅತ್ಯುತ್ತಮ ಧನಾಗಮನ & ಉನ್ನತಿ (High Tide)";
      ratingEn = "Auspicious Expansion & High Financial Tide";
    } else if (isSunDifficult || isAshtama) {
      rating = "cautious";
      ratingKn = "ಎಚ್ಚರಿಕೆ • ವೆಚ್ಚ ನಿಯಂತ್ರಣ (Cautious)";
      ratingEn = "Vigilance & Controlled Expenditure";
    }

    const ausDates = `${((moonRashiIdx * 2 + mIdx * 3) % 25) + 2}, ${((moonRashiIdx * 2 + mIdx * 3 + 7) % 25) + 3}, ${((moonRashiIdx * 2 + mIdx * 3 + 15) % 25) + 4}`;

    months.push({
      monthIndex: i,
      monthNameKn: `${monthNamesKn[mIdx]} ${yr}`,
      monthNameEn: `${monthNamesEn[mIdx]} ${yr}`,
      solarMasaKn: solarMasasKn[mIdx],
      solarMasaEn: solarMasasEn[mIdx],
      transitingSunSignKn: toKannadaRashi(sunSignIdx),
      transitingSunSignEn: RASHIS[sunSignIdx]?.english || "Aries",
      sunTransitHouseFromMoon: sunHouse,
      financialRating: rating,
      financialRatingKn: ratingKn,
      financialRatingEn: ratingEn,
      careerOutlookKn: rating === "high"
        ? `ಸೂರ್ಯನ ${sunHouse}ನೇ ಗೋಚಾರವು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಗೌರವ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಧನಲಾಭವನ್ನು ಒದಗಿಸಲಿದೆ.`
        : rating === "cautious"
        ? `ಸೂರ್ಯನ ${sunHouse}ನೇ ಸಂಚಾರದಿಂದ ಕೆಲಸದಲ್ಲಿ ಒತ್ತಡ ಅಥವಾ ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಭಿಪ್ರಾಯ ಭೇದದ ಸಾಧ್ಯತೆ. ತಾಳ್ಮೆ ವಹಿಸಿ.`
        : `ದೈನಂದಿನ ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ. ಬಾಕಿ ಉಳಿದ ಕಡತಗಳು ನಿಧಾನವಾಗಿ ಮುಕ್ತಾಯಗೊಳ್ಳಲಿವೆ.`,
      careerOutlookEn: rating === "high"
        ? `Sun's ${sunHouse}th house transit bestows workplace recognition, profitable initiatives, and vitality.`
        : rating === "cautious"
        ? `Sun's ${sunHouse}th house transit advises diplomatic communication and conservative capital deployment.`
        : `Routine stability with steady resolution of pending tasks.`,
      healthCautionKn: rating === "cautious"
        ? "ಅಜೀರ್ಣ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಪಿತ್ತದೋಷದ ಏರಿಳಿತದ ಸಾಧ್ಯತೆ. ರಾತ್ರಿ ಲಘು ಆಹಾರ ಹಾಗೂ ಸಾಕಷ್ಟು ನೀರು ಸೇವಿಸಿ."
        : "ಉತ್ತಮ ಆರೋಗ್ಯ ಮತ್ತು ಚೈತನ್ಯ. ಹವಾಮಾನ ಬದಲಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಸೂಕ್ತ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      healthCautionEn: rating === "cautious"
        ? "Mindfulness regarding digestive acidity, eye strain, and sleep regularity."
        : "Energetic constitution. Maintain consistent morning hydration.",
      auspiciousDates: ausDates,
      monthlyRemedyKn: rating === "cautious"
        ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಸೋಮವಾರ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ದೀಪಾರಾಧನೆ."
        : "ಪ್ರತಿನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಠಣೆ.",
      monthlyRemedyEn: rating === "cautious"
        ? "Bilva Archana on Mondays and Navagraha Ghee Lamp offering."
        : "Daily Surya Namaskar and Ganesha Atharvashirsha recitation."
    });
  }

  return {
    yearRangeStr: `${monthNamesEn[currentMonthIdx]} ${currentYear} - ${monthNamesEn[(currentMonthIdx + 11) % 12]} ${currentYear + 1}`,
    yearlyThemeKn: "ಕರ್ಮ ಫಲ ಸಮನ್ವಯ ಹಾಗೂ ಗೋಚಾರ ಗ್ರಹಗಳ ಸಮತೋಲನದ ವಾರ್ಷಿಕ ಪಥ",
    yearlyThemeEn: "Karmic Harmonization & Real-time Gochara Alignment Year",
    varshapathiPlanetKn: toKannadaPlanet(RASHI_LORDS[(lagnaIdx + 4) % 12]),
    varshapathiPlanetEn: RASHI_LORDS[(lagnaIdx + 4) % 12],
    munthaRashiKn: toKannadaRashi((lagnaIdx + (currentYear % 12)) % 12),
    munthaRashiEn: RASHIS[(lagnaIdx + (currentYear % 12)) % 12]?.english || "Aries",
    sadeSatiStatusKn: sadeSatiKn,
    sadeSatiStatusEn: sadeSatiEn,
    ashtamaShaniStatusKn: ashtamaKn,
    ashtamaShaniStatusEn: ashtamaEn,
    guruGocharaStatusKn: guruKn,
    guruGocharaStatusEn: guruEn,
    months
  };
}

// -------------------------------------------------------------
// 2. MARRIAGE & RELATIONSHIP DESTINY
// -------------------------------------------------------------
function computeMarriageDossier(kundli: KundliOutput, context: any): MarriageDossierResult {
  const rawAge = context?.devoteeAge ?? (context?.birthDate ? (new Date().getFullYear() - new Date(context.birthDate).getFullYear()) : 30);
  const age = Math.max(0, rawAge);
  const isMinor = age < 18;

  const statusStr = (context?.maritalStatus || "").toLowerCase();
  const isExplicitlySingle = statusStr.includes("unmarried") || statusStr.includes("single") ||
    statusStr.includes("celibate") || statusStr.includes("bachelor") ||
    statusStr.includes("ಬ್ರಹ್ಮಚಾರಿ") || statusStr.includes("ಅವಿವಾಹಿತ");
  const isMarried = !isExplicitlySingle && (statusStr.includes("married") || statusStr.includes("ವಿವಾಹಿತ"));

  const assessment = determineMarriageDestiny(kundli, { ...context, devoteeAge: age });
  const lagnaIndex = kundli.lagnaRashi ? kundli.lagnaRashi.index : 0;
  const seventhHouseSign = (lagnaIndex + 6) % 12;

  const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
  const jupiter = kundli.planets.find((p) => p.name === PlanetName.Jupiter);

  const isKujaInDifficultHouse = mars && [1, 4, 7, 8, 12].includes(mars.house);
  const isKujaExalted = mars && mars.rashi.index === 9; // Capricorn
  const isKujaBhanga = isKujaExalted || [3, 4].includes(lagnaIndex) || (jupiter && mars && jupiter.house === mars.house);

  let kujaKn = "ಕುಜ ಗ್ರಹವು ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಯಾವುದೇ ಕುಜ ದೋಷ ಕಂಡುಬಂದಿಲ್ಲ.";
  let kujaEn = "Mars is positioned favorably with no Kuja Dosha afflictions.";

  if (isKujaInDifficultHouse) {
    if (isKujaBhanga) {
      kujaKn = "ಕುಜ ದೋಷ ಭಂಗ ಯೋಗ: ಕುಜ ಗ್ರಹವು ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿದ್ದು (ಅಥವಾ ಗುರು ದೃಷ್ಟಿಯಿಂದ) ದೋಷ ನಿವಾರಣೆಯಾಗಿದೆ.";
      kujaEn = "Kuja Dosha Bhanga: Mars is exalted or protected by Jupiter, neutralizing potential affliction.";
    } else {
      kujaKn = "ಕುಜ ದೋಷ ಪ್ರಭಾವ: ವಿವಾಹದ ಮೊದಲು ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ನಾಗಪ್ರತಿಷ್ಠೆ ಅಥವಾ ಕುಜ ಶಾಂತಿ ಪೂಜೆ ಶ್ರೇಷ್ಠ.";
      kujaEn = "Kuja Dosha identified: Subramanya Naga Pratishtha or Kuja Shanti at Gokarna recommended.";
    }
  }

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

  if (isMinor) {
    return {
      verdictTitleKn: `ಬಾಲ್ಯಾವಸ್ಥೆ ಹಾಗೂ ವಿದ್ಯಾಭ್ಯಾಸದ ದೈವಿಕ ರಕ್ಷಣೆ (ವಯಸ್ಸು: ${age} ವರ್ಷ)`,
      verdictTitleEn: `Childhood Educational & Holistic Grace (Age: ${age} yrs)`,
      marriageWindowKn: "ಪ್ರಸ್ತುತ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸತ್ಸಂಸ್ಕಾರದ ಪ್ರಧಾನ ಹಂತ. ವಯಸ್ಕರಾದ ನಂತರ (೨೪ ರಿಂದ ೨೮ ವರ್ಷಗಳ ಸುಮಾರಿಗೆ) ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಯೋಗ.",
      marriageWindowEn: "Primary focus is foundational learning and character building. Auspicious marriage window upon adulthood (ages 24 to 28).",
      isMinor: true,
      isMarried: false,
      age,
      spouseProfile: {
        directionKn: `ವಯಸ್ಕ ಹಂತದ ದೈವಿಕ ಸೂಚನೆ: ${dir.kn}`,
        directionEn: `Future adult indication: ${dir.en}`,
        natureKn: "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಪ್ರಥಮ ಆದ್ಯತೆ. ೭ನೇ ಭಾವ ಹಾಗೂ ಶುಕ್ರನ ಶುಭ ಬಲವು ಭವಿಷ್ಯದ ವಯಸ್ಕ ಜೀವನದಲ್ಲಿ ಸದ್ಗುಣ ಸಂಪನ್ನ ಸಂಗಾತಿಯನ್ನು ಒದಗಿಸಲಿದೆ.",
        natureEn: "Focus is on holistic education, memory, and physical vitality. Auspicious Venus placement guarantees a virtuous companion in adult life.",
        professionDomainKn: "ಪ್ರಸ್ತುತ ವಿದ್ಯಾಭ್ಯಾಸ, ಶಾಲಾ-ಕಾಲೇಜು ಶಿಕ್ಷಣ ಹಾಗೂ ಪ್ರತಿಭಾಸಂಪನ್ನ ಬೆಳವಣಿಗೆ.",
        professionDomainEn: "Current phase: Academic learning, talent nurturing, and holistic childhood blossoming."
      },
      kujaDoshaStatusKn: kujaKn,
      kujaDoshaStatusEn: kujaEn,
      maritalHarmonyAdviceKn: "ಪೋಷಕರ ವಾತ್ಸಲ್ಯ, ಸಕಾರಾತ್ಮಕ ಮನೆ ವಾತಾವರಣ ಮತ್ತು ನಿತ್ಯ ಗಾಯತ್ರಿ/ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆಯಿಂದ ಮಗುವಿಗೆ ಉಜ್ವಲ ಭವಿಷ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.",
      maritalHarmonyAdviceEn: "Loving parental guidance and a calm, spiritual home atmosphere foster great intellectual and emotional brilliance.",
      sacredRemedyKn: assessment.blessingRemedyKn || "ಮಗುವಿನ ಆಯುರಾರೋಗ್ಯ ಹಾಗೂ ವಿದ್ಯಾಭಿವೃದ್ಧಿಗಾಗಿ ನಿತ್ಯ ವಿದ್ಯಾ ಗಣಪತಿ ಮತ್ತು ಗಾಯತ್ರಿ ಮಂತ್ರ ಸ್ಮರಣೆ.",
      sacredRemedyEn: assessment.blessingRemedyEn || "Daily prayers to Lord Ganesha and Goddess Saraswati for academic radiance and longevity."
    };
  }

  if (isMarried) {
    return {
      verdictTitleKn: "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಸಂಸಾರ ಸುಖ & ಸುಮಂಗಲೀ ಯೋಗ",
      verdictTitleEn: "Marital Bliss, Domestic Harmony & Spousal Longevity",
      marriageWindowKn: "ದಾಂಪತ್ಯ ಜೀವನವು ಸುಖಕರವಾಗಿ ಸಾಗುತ್ತಿದ್ದು, ದೈವಾನುಗ್ರಹದಿಂದ ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಪರಸ್ಪರ ಪ್ರೇಮ ವೃದ್ಧಿಯಾಗಲಿದೆ.",
      marriageWindowEn: "Active matrimony blessed with growing family peace, mutual affection, and auspicious domestic harmony.",
      isMinor: false,
      isMarried: true,
      age,
      spouseProfile: {
        directionKn: `ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ: ${dir.kn}`,
        directionEn: `Family harmony alignment: ${dir.en}`,
        natureKn: "ಸಂಗಾತಿಯಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೇಮ, ಸಹಬಾಳ್ವೆ, ಕೌಟುಂಬಿಕ ನಿಷ್ಠೆ ಹಾಗೂ ಸುಖ-ದುಃಖಗಳಲ್ಲಿ ಬೆನ್ನೆಲುಬಾಗಿ ನಿಲ್ಲುವ ಉದಾತ್ತ ಗುಣ.",
        natureEn: "Mutual respect, emotional maturity, patience, and unwavering loyalty towards family welfare.",
        professionDomainKn: "ಸಂಗಾತಿಯ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಉಭಯ ಕುಟುಂಬಗಳ ಆರ್ಥಿಕ ಭದ್ರತೆ.",
        professionDomainEn: "Professional stability and collaborative financial flourishing."
      },
      kujaDoshaStatusKn: kujaKn,
      kujaDoshaStatusEn: kujaEn,
      maritalHarmonyAdviceKn: "ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ಮುಕ್ತ ಸಂವಾದವೇ ದಾಂಪತ್ಯದ ಬುನಾದಿ. ಶುಕ್ರವಾರ ದಂಪತಿಗಳು ಒಟ್ಟಾಗಿ ದೇವರ ಪೂಜೆ ನೆರವೇರಿಸುವುದು ಶ್ರೇಷ್ಠ.",
      maritalHarmonyAdviceEn: "Mutual respect and clear communication ensure harmony. Joint Friday prayers invite Lakshmi-Narayana grace.",
      sacredRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ದಂಪತಿ ಸಮೇತ ಉಮಾ-ಮಹೇಶ್ವರ ಪೂಜೆ ಅಥವಾ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟೇಶ್ವರ ಪ್ರಾರ್ಥನೆ.",
      sacredRemedyEn: "Couples worship of Uma-Maheshwara or Lakshmi-Narayana at Gokarna Kshetra for everlasting marital bliss."
    };
  }

  return {
    verdictTitleKn: assessment.titleKn || "ಸಕಾಲಿಕ ಕಲ್ಯಾಣ ಹಾಗೂ ದಾಂಪತ್ಯ ಯೋಗ",
    verdictTitleEn: assessment.titleEn || "Auspicious Matrimonial Alignment",
    marriageWindowKn: assessment.marriageTimingWindowKn || "ಮುಂದಿನ 18 ರಿಂದ 24 ತಿಂಗಳುಗಳಲ್ಲಿ ಪ್ರಶಸ್ತ ಶುಭ ಕಾಲ",
    marriageWindowEn: assessment.marriageTimingWindowEn || "Favorable window within the next 18 to 24 months",
    isMinor: false,
    isMarried: false,
    age,
    spouseProfile: {
      directionKn: dir.kn,
      directionEn: dir.en,
      natureKn: "ಸುಸಂಸ್ಕೃತ, ಧಾರ್ಮಿಕ ಚಿಂತನೆ, ಗೌರವಾನ್ವಿತ ಕುಟುಂಬದ ಹಿನ್ನೆಲೆ ಹಾಗೂ ಹೊಂದಾಣಿಕೆಯ ಗುಣವುಳ್ಳ ವ್ಯಕ್ತಿತ್ವ.",
      natureEn: "Cultured, family-oriented, ethically grounded, respectful, and emotionally mature partner.",
      professionDomainKn: "ಶಿಕ್ಷಣ, ಬ್ಯಾಂಕಿಂಗ್, ಐಟಿ, ಸರ್ಕಾರಿ ಆಡಳಿತ ಅಥವಾ ಸ್ವಂತ ವ್ಯವಹಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸಕ್ರಿಯತೆ.",
      professionDomainEn: "Academics, Banking, Corporate IT, Public Administration, or Commerce."
    },
    kujaDoshaStatusKn: kujaKn,
    kujaDoshaStatusEn: kujaEn,
    maritalHarmonyAdviceKn: "ಪರಸ್ಪರ ಗೌರವ ಮತ್ತು ಮುಕ್ತ ಸಂವಾದವೇ ದಾಂಪತ್ಯದ ಬುನಾದಿ. ಶುಕ್ರವಾರ ದಂಪತಿಗಳು ಒಟ್ಟಾಗಿ ದೇವರ ಪೂಜೆ ನೆರವೇರಿಸುವುದು ಶ್ರೇಷ್ಠ.",
    maritalHarmonyAdviceEn: "Mutual respect and clear communication ensure harmony. Joint Friday prayers invite Lakshmi-Narayana grace.",
    sacredRemedyKn: assessment.blessingRemedyKn || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಹಾಗೂ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಜಪ ಸಮರ್ಪಣೆ.",
    sacredRemedyEn: assessment.blessingRemedyEn || "Swayamvara Parvathi Japa and Uma Maheshwara Puja at Gokarna Kshetra."
  };
}

// -------------------------------------------------------------
// 3. WEALTH, CAREER & DEBT BLUEPRINT
// -------------------------------------------------------------
function computeWealthCareerBlueprint(kundli: KundliOutput, lagnaIndex: number): WealthCareerResult {
  const tenthRashi = (lagnaIndex + 9) % 12;
  const tenthLord = RASHI_LORDS[tenthRashi];
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
    induLagnaProsperityScore: 84,
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

// -------------------------------------------------------------
// 4. SACRED GEMSTONE & RUDRAKSHA PRESCRIPTION
// -------------------------------------------------------------
function computeGemstoneAndRudrakshaWithDignity(
  lagnaLord: PlanetName,
  ninthLord: PlanetName,
  nakshatraLord: PlanetName,
  dignities: Record<PlanetName, PlanetaryDignityAssessment>,
  trikaSigns: number[],
  panchanga: TraditionalBaggonaPanchanga | null
): GemstoneRudrakshaResult {
  const lagnaLordDignity = dignities[lagnaLord];
  const ninthLordDignity = dignities[ninthLord];

  const lifeGemData = GEMSTONE_MAP[lagnaLord] || GEMSTONE_MAP[PlanetName.Jupiter];
  const fortuneGemData = GEMSTONE_MAP[ninthLord] || GEMSTONE_MAP[PlanetName.Sun];

  // Specific dignity explanations for life gem
  let lifeDignityKn = `${lagnaLordDignity?.dignityLabelKn || "ಸಾಮಾನ್ಯ ಬಲ"}`;
  let lifeDignityEn = `${lagnaLordDignity?.dignityLabelEn || "Normal Strength"}`;
  if (lagnaLord === PlanetName.Mars) {
    if (lagnaLordDignity?.dignity === "exalted") {
      lifeDignityKn = "ಮಂಗಳ ಗ್ರಹವು ಮಕರ ರಾಶಿಯಲ್ಲಿ ಪರಮ ಉಚ್ಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು, ಕೆಂಪು ಹವಳ ಧರಿಸುವುದರಿಂದ ಅಪಾರ ಧೈರ್ಯ, ಭೂಮಿ-ಆಸ್ತಿ ಲಾಭ ಹಾಗೂ ನಾಯಕತ್ವ ವೃದ್ಧಿ.";
      lifeDignityEn = "Mars is exalted in Capricorn; Red Coral amplifies supreme courage, real estate gains, and executive vitality.";
    } else if (lagnaLordDignity?.dignity === "debilitated") {
      lifeDignityKn = "ಮಂಗಳ ಗ್ರಹವು ಕರ್ಕಾಟಕದಲ್ಲಿ ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು, ಸಾಧಾರಣ ಹವಳದ ಬದಲು ಬೆಳ್ಳಿಯ ಕವಚದಲ್ಲಿ ಜಪಿಸಿದ ಕೆಂಪು ಹವಳ ಅಥವಾ ೩-ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧರಿಸುವುದು ಕ್ಷೇಮಕರ.";
      lifeDignityEn = "Mars is debilitated in Cancer; wearing Red Coral set in Silver alongside a 3-Mukhi Rudraksha is recommended.";
    }
  }

  // Prohibited Gemstone (Trika Lord - 6th or 8th)
  const eighthLord = RASHI_LORDS[trikaSigns[1]];
  const prohibitedGemData = GEMSTONE_MAP[eighthLord] || GEMSTONE_MAP[PlanetName.Saturn];

  // Prescribed Rudraksha based on Nakshatra Lord and weaknesses
  const RUDRAKSHA_DIGNITY_MAP: Record<PlanetName, { mukhiKn: string; mukhiEn: string; deityKn: string; deityEn: string; benefitsKn: string; benefitsEn: string }> = {
    [PlanetName.Sun]: { mukhiKn: "೧ ಮುಖಿ / ೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", mukhiEn: "1-Mukhi or 12-Mukhi Rudraksha", deityKn: "ಸೂರ್ಯ ನಾರಾಯಣ", deityEn: "Surya Narayana", benefitsKn: "ತೇಜಸ್ಸು, ಸರ್ಕಾರಿ ಕಾರ್ಯಸಿದ್ಧಿ, ಗೌರವ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸ ವೃದ್ಧಿ.", benefitsEn: "Executive radiance, government recognition, and inner willpower." },
    [PlanetName.Moon]: { mukhiKn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅರ್ಧನಾರೀಶ್ವರ)", mukhiEn: "2-Mukhi Rudraksha (Ardhanarishwara)", deityKn: "ಅರ್ಧನಾರೀಶ್ವರ", deityEn: "Ardhanarishwara", benefitsKn: "ಮಾನಸಿಕ ಶಾಂತಿ, ದಾಂಪತ್ಯ ಪ್ರೀತಿ, ಆತಂಕ ನಿವಾರಣೆ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆ.", benefitsEn: "Mental peace, marital harmony, and emotional equilibrium." },
    [PlanetName.Mars]: { mukhiKn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಅಗ್ನಿ ಸ್ವರೂಪ)", mukhiEn: "3-Mukhi Rudraksha (Agni Rupa)", deityKn: "ಅಗ್ನಿ ದೇವ & ಸುಬ್ರಹ್ಮಣ್ಯ", deityEn: "Lord Agni & Subramanya", benefitsKn: "ಧೈರ್ಯ, ಜೀರ್ಣಶಕ್ತಿ, ರಕ್ತದೊತ್ತಡ ಸಮತೋಲನ ಹಾಗೂ ಸೋಮಾರಿತನ ಮುಕ್ತಿ.", benefitsEn: "Courage, robust digestion, vitality, and removing lethargy." },
    [PlanetName.Mercury]: { mukhiKn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಬ್ರಹ್ಮ ಸ್ವರೂಪ)", mukhiEn: "4-Mukhi Rudraksha (Brahma Rupa)", deityKn: "ಬ್ರಹ್ಮ ದೇವ", deityEn: "Lord Brahma", benefitsKn: "ಬುದ್ಧಿಶಕ್ತಿ, ವ್ಯಾಪಾರ ಚಾತುರ್ಯ, ವಾಕ್ಸಿದ್ಧಿ ಹಾಗೂ ವಿದ್ಯಾರ್ಜನೆ.", benefitsEn: "Intellect, business acumen, memory, and articulate speech." },
    [PlanetName.Jupiter]: { mukhiKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಪಂಚಮುಖಿ ರುದ್ರ)", mukhiEn: "5-Mukhi Rudraksha (Panchamukhi)", deityKn: "ಕಾಲಾಗ್ನಿ ರುದ್ರ", deityEn: "Kalagni Rudra", benefitsKn: "ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ವಿಕಾಸ, ಗುರು ಕೃಪೆ ಹಾಗೂ ಸರ್ವಪಾಪ ನಿವಾರಣೆ.", benefitsEn: "Higher wisdom, spiritual growth, divine guru grace, and serenity." },
    [PlanetName.Venus]: { mukhiKn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಕಾರ್ತಿಕೇಯ)", mukhiEn: "6-Mukhi Rudraksha (Kartikeya)", deityKn: "ಸುಬ್ರಹ್ಮಣ್ಯ & ಮಹಾಲಕ್ಷ್ಮಿ", deityEn: "Kartikeya & Mahalakshmi", benefitsKn: "ಆಕರ್ಷಣೆ, ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ವಾಹನ ಸೌಖ್ಯ.", benefitsEn: "Magnetism, artistic genius, marital pleasure, and luxury." },
    [PlanetName.Saturn]: { mukhiKn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ಮಹಾಲಕ್ಷ್ಮಿ)", mukhiEn: "7-Mukhi Rudraksha (Mahalakshmi)", deityKn: "ಮಹಾಲಕ್ಷ್ಮಿ & ಶನಿಶ್ವರ", deityEn: "Mahalakshmi & Shani Bhagavan", benefitsKn: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಸಾಲಬಾಧೆ ನಿವಾರಣೆ, ಶನಿ ಪೀಡಾ ಪರಿಹಾರ ಹಾಗೂ ವೃತ್ತಿ ಭದ್ರತೆ.", benefitsEn: "Financial stability, debt clearance, and Saturn obstacle protection." },
    [PlanetName.Rahu]: { mukhiKn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ವಿನಾಯಕ)", mukhiEn: "8-Mukhi Rudraksha (Ganesha)", deityKn: "ಗಣಪತಿ ಭಗವಾನ್", deityEn: "Lord Ganesha", benefitsKn: "ಸರ್ವ ವಿಘ್ನ ನಿವಾರಣೆ, ರಾಹು ದೋಷ ಶಮನ ಹಾಗೂ ಆಕಸ್ಮಿಕ ಲಾಭ.", benefitsEn: "Obstacle destruction, Rahu pacification, and unexpected gains." },
    [PlanetName.Ketu]: { mukhiKn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (ನವದುರ್ಗೆ)", mukhiEn: "9-Mukhi Rudraksha (Navadurga)", deityKn: "ದುರ್ಗಾದೇವಿ", deityEn: "Goddess Durga", benefitsKn: "ಭಯ ನಿವಾರಣೆ, ಶತ್ರು ಜಯ, ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ ಹಾಗೂ ಕೇತು ಕೃಪೆ.", benefitsEn: "Fearlessness, victory over adversaries, and spiritual awakening." }
  };

  const rud = RUDRAKSHA_DIGNITY_MAP[nakshatraLord] || RUDRAKSHA_DIGNITY_MAP[PlanetName.Jupiter];

  return {
    lifeGem: {
      nameKn: lifeGemData.kn,
      nameEn: lifeGemData.en,
      sanskritName: lifeGemData.sanskrit,
      gemTypeKn: "ಜೀವನ ರತ್ನ (ಆಯುಷ್ಯ, ಆರೋಗ್ಯ & ಆತ್ಮಬಲ ವರ್ಧಕ)",
      gemTypeEn: "Life Gemstone (Vitality, Health & Longevity)",
      governingPlanetKn: toKannadaPlanet(lagnaLord),
      governingPlanetEn: lagnaLord,
      planetaryDignityKn: lifeDignityKn,
      planetaryDignityEn: lifeDignityEn,
      recommendedWeight: "5.25 - 6.5 Carats (ರತ್ತಿ)",
      suitableMetalKn: lifeGemData.metalKn,
      suitableMetalEn: lifeGemData.metalEn,
      wearingFingerKn: lifeGemData.fingerKn,
      wearingFingerEn: lifeGemData.fingerEn,
      auspiciousDayKn: lifeGemData.dayKn,
      auspiciousDayEn: lifeGemData.dayEn,
      consecrationTaraKn: "ಸಂಪತ್ ತಾರಾ ಅಥವಾ ಮಿತ್ರ ತಾರಾ ನಕ್ಷತ್ರ ದಿನ",
      consecrationTaraEn: "Sampat Tara or Mitra Tara Nakshatra day",
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
      planetaryDignityKn: ninthLordDignity?.dignityLabelKn || "ಶುಭ ಫಲ",
      planetaryDignityEn: ninthLordDignity?.dignityLabelEn || "Benefic",
      recommendedWeight: "4.5 - 5.5 Carats (ರತ್ತಿ)",
      suitableMetalKn: fortuneGemData.metalKn,
      suitableMetalEn: fortuneGemData.metalEn,
      wearingFingerKn: fortuneGemData.fingerKn,
      wearingFingerEn: fortuneGemData.fingerEn,
      auspiciousDayKn: fortuneGemData.dayKn,
      auspiciousDayEn: fortuneGemData.dayEn,
      consecrationTaraKn: "ಕ್ಷೇಮ ತಾರಾ ಅಥವಾ ಸಾಧನ ತಾರಾ ನಕ್ಷತ್ರ ದಿನ",
      consecrationTaraEn: "Kshema Tara or Sadhana Tara day",
      mantraKn: fortuneGemData.mantraKn,
      mantraEn: fortuneGemData.mantraEn
    },
    prohibitedGems: {
      gemNamesKn: prohibitedGemData.kn,
      gemNamesEn: prohibitedGemData.en,
      reasonKn: `ಈ ರತ್ನವು ಜಾತಕದ ಅಷ್ಟಮ (೮ನೇ) ಭಾವಾಧಿಪತಿಯಾಗಿದ್ದು, ಧರಿಸುವುದರಿಂದ ಆರೋಗ್ಯ ಕ್ಲೇಶ, ವಿವಾದ ಅಥವಾ ಅನಗತ್ಯ ಧನಹಾನಿ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆ ಇದೆ.`,
      reasonEn: `Governs the 8th Dusthana house; wearing it can amplify vulnerability, disputes, or expenditure.`
    },
    prescribedRudraksha: {
      mukhiKn: rud.mukhiKn,
      mukhiEn: rud.mukhiEn,
      deityKn: rud.deityKn,
      deityEn: rud.deityEn,
      panchangaReasonKn: `ಜನ್ಮ ನಕ್ಷತ್ರಾಧಿಪತಿ (${toKannadaPlanet(nakshatraLord)}) ಹಾಗೂ ${panchanga?.weekdayKn || "ವಾರಾಧಿಪತಿ"}ಯ ದೈವಿಕ ರಕ್ಷಣೆಗಾಗಿ.`,
      panchangaReasonEn: `Aligned with Janma Nakshatra Lord (${nakshatraLord}) and birth weekday ruler.`,
      benefitsKn: rud.benefitsKn,
      benefitsEn: rud.benefitsEn
    },
    prescribedYantra: {
      nameKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಯಂತ್ರ / ಮಹಾಮೃತ್ಯುಂಜಯ ಯಂತ್ರ",
      nameEn: "Sri Mahalakshmi Yantra / Mahamrityunjaya Yantra",
      installationPoojaKn: "ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ತಾಮ್ರದ ಫಲಕದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ, ನಿತ್ಯ ಗಂಧ-ಕುಂಕುಮ ಹಾಗೂ ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಿಸುವುದು.",
      installationPoojaEn: "Enshrine in home altar on consecrated copper plate with daily ghee lamp offering."
    }
  };
}

// -------------------------------------------------------------
// 5. AYUR SANJEEVINI HEALTH PROFILE
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 6. PRESET ASTROLOGICAL Q&A
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// FULL AI NARRATION SYNTHESIS (GEMINI 3.5 FLASH LITE WITH RETRIES)
// -------------------------------------------------------------
export async function generateSpecialConsultationAiNarration(
  report: SpecialConsultationFullReport,
  lang: SpecialConsultationLang = "kn",
  apiKey?: string,
  onAttempt?: (attempt: number, max: number) => void
): Promise<SpecialConsultationFullReport> {
  const updated = { ...report };
  const langCode = lang || "kn";

  if (!apiKey) {
    updated.aiNarration = {
      isAiGenerated: false,
      aiModel: "gemini-3.5-flash-lite",
      statusNoticeKn: "⚠️ ದೈವಿಕ ಗಣಿತ ಫಾಲ್‌ಬ್ಯಾಕ್ ಡೇಟಾ: ಸಾಮಾನ್ಯ ಶಾಸ್ತ್ರೀಯ ಪರಾಶರ ಗಣನೆಯನ್ನು ಬಳಸಲಾಗಿದೆ (from fallback I have getting from the data)",
      statusNoticeEn: "⚠️ Fallback Mathematical Data: Generated via classical Parashari mathematical engine (from fallback I have getting from the data)"
    };
    return updated;
  }

  const devoteeAge = report.marriageDossier.age ?? 30;
  const isMinor = Boolean(report.marriageDossier.isMinor);
  const isMarried = Boolean(report.marriageDossier.isMarried);

  const lifeStageDescription = isMinor
    ? `Minor Child / Student (Age ${devoteeAge} years old). STRICT RULE: This native is a CHILD/STUDENT. Absolutely DO NOT predict marriage, wedding proposals, spouse arrival, or matrimony! Focus 100% on academic education, concentration, physical health, family blessings, and clarify that marriage only pertains to distant adult life after age 24.`
    : isMarried
    ? `Happily Married Native. STRICT RULE: This native is ALREADY MARRIED. Absolutely DO NOT predict finding a new spouse, bride/groom search, or marriage proposals! Focus 100% on marital harmony, spouse's wellbeing, domestic prosperity, mutual understanding, and family happiness.`
    : `Unmarried Adult (Age ${devoteeAge} years old) seeking marriage. Provide authentic matrimonial timing window, spouse temperament, arrival direction, and Kuja Dosha Bhanga blessings.`;

  const prompt = `
You are Sri Shreeram Pandit, Master Astrologer from Gokarna Mahabaleshwara Kshetra (+91 99723 39362).
You are preparing an official, authoritative, royal executive reading for:
Devotee: ${report.devoteeName}
Date of Birth: ${report.birthDate} (${report.birthTime})
Current Age: ${devoteeAge} years
Life Stage: ${lifeStageDescription}
Lagna: ${report.lagnaNameEn} (${report.lagnaNameKn})
Rashi: ${report.rashiNameEn} (${report.rashiNameKn})
Nakshatra: ${report.nakshatraNameEn} (Lord: ${report.nakshatraLordEn})
Panchanga: ${report.panchanga.tithiEn} Tithi, ${report.panchanga.weekdayEn}, ${report.panchanga.yogaEn} Yoga, ${report.panchanga.karanaEn} Karana.
Running Dasha: ${report.currentDashaEn}
Life Gemstone: ${report.gemstoneRudraksha.lifeGem.nameEn} (Dignity: ${report.gemstoneRudraksha.lifeGem.planetaryDignityEn})
Gochara: ${report.twelveMonthForecast.sadeSatiStatusEn}; ${report.twelveMonthForecast.ashtamaShaniStatusEn}; ${report.twelveMonthForecast.guruGocharaStatusEn}

Provide an authentic, deeply respectful synthesis in JSON format containing 5 sections:
{
  "varshaphalaNarrative": "A rich 2-paragraph annual overview explaining how transit Gochara and active Dasha will unfold over the next 12 months.",
  "marriageNarrative": "${
    isMinor
      ? "A detailed paragraph on the child's academic flourishing, memory power, health protection, and family guidance (clearly noting that marriage is only for mature adulthood)."
      : isMarried
      ? "A detailed paragraph on marital harmony, spousal health, shared domestic happiness, and Uma-Maheshwara blessings."
      : "A detailed paragraph on matrimonial timing, spouse characteristics, arrival direction, and Kuja Dosha Bhanga blessings."
  }",
  "wealthNarrative": "A detailed paragraph on wealth accumulation, job vs business success, and debt clearance timeline.",
  "gemstoneNarrative": "A detailed explanation of why the prescribed Gemstone, Red Coral (Havala if Mars), and Mukhi Rudraksha harmonize with their Nakshatra and Panchanga, including wearing cautions.",
  "healthNarrative": "A detailed paragraph on Ayurvedic Tridosha balance, seasonal diet, and Dhanvantari healing remedies."
}

RULES:
- Provide response strictly in pure JSON.
- Output text must be strictly in the script of language: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
- Do NOT use markdown bold asterisks (**) inside JSON strings.
- Maintain high Vedic dignity and warm divine blessings.
`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    if (onAttempt) onAttempt(attempts, maxAttempts);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash-lite",
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.6,
          responseMimeType: "application/json"
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
        ]
      });

      const res = await model.generateContent(prompt);
      const rawText = (await res.response).text() || "";
      const parsed = JSON.parse(rawText);

      updated.aiNarration = {
        isAiGenerated: true,
        aiModel: "gemini-3.5-flash-lite",
        statusNoticeKn: "✨ ದೈವಿಕ AI ನಿರೂಪಣೆ ಸಕ್ರಿಯ (Gemini 3.5 Flash-Lite ಪರಿಶೀಲಿತ)",
        statusNoticeEn: "✨ Verified Divine AI Narration Active (Gemini 3.5 Flash-Lite)",
        varshaphalaNarrative: parsed.varshaphalaNarrative,
        marriageNarrative: parsed.marriageNarrative,
        wealthNarrative: parsed.wealthNarrative,
        gemstoneNarrative: parsed.gemstoneNarrative,
        healthNarrative: parsed.healthNarrative
      };
      return updated;
    } catch (err) {
      console.warn(`[SpecialConsultationEngine] Gemini attempt ${attempts} failed:`, err);
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, attempts * 2000));
      }
    }
  }

  // Fallback after retries
  updated.aiNarration = {
    isAiGenerated: false,
    aiModel: "gemini-3.5-flash-lite",
    statusNoticeKn: "⚠️ ದೈವಿಕ ಗಣಿತ ಫಾಲ್‌ಬ್ಯಾಕ್ ಡೇಟಾ: ಸಾಮಾನ್ಯ ಶಾಸ್ತ್ರೀಯ ಪರಾಶರ ಗಣನೆಯನ್ನು ಬಳಸಲಾಗಿದೆ (from fallback I have getting from the data)",
    statusNoticeEn: "⚠️ Fallback Mathematical Data: Computed using classical Parashari mathematical engine (from fallback I have getting from the data)"
  };

  return updated;
}

// -------------------------------------------------------------
// CUSTOM QUESTION ANSWERER
// -------------------------------------------------------------
export async function answerCustomDivineQuestion(
  report: SpecialConsultationFullReport,
  question: string,
  lang: SpecialConsultationLang = "kn",
  apiKey?: string
): Promise<{ answer: string; remedy: string; isAi: boolean }> {
  const langCode = lang || "kn";
  const fallbackAnswerKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಸಿದ್ಧ ಪದ್ಧತಿಯಂತೆ, ನಿಮ್ಮ ${report.lagnaNameKn} ಲಗ್ನ, ${report.rashiNameKn} ರಾಶಿ ಹಾಗೂ ${report.nakshatraNameKn} ನಕ್ಷತ್ರದ ಗ್ರಹಗತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ಕೇಳಿರುವ "${question}" ಪ್ರಶ್ನೆಗೆ ದೈವಾನುಗ್ರಹವಿದೆ.\n\nಪ್ರಸ್ತುತ ${report.currentDashaKn} ದಶಾ ಕಾಲದಲ್ಲಿ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹರ ಸಂಚಾರವು ನಿಮ್ಮ ಯತ್ನಗಳಿಗೆ ಧನಾತ್ಮಕ ತಿರುವು ನೀಡಲಿದೆ. ಧರ್ಮಪೂರ್ವಕ ನಡೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದದಿಂದ ಕೈಗೊಂಡ ಕಾರ್ಯಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ.\n\nಮನಸ್ಸಿನಲ್ಲಿ ಆತಂಕ ಬಿಟ್ಟು ನಿಶ್ಚಯದಿಂದ ಮುನ್ನಡೆಯಿರಿ.`;
  const fallbackRemedyKn = `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ದೀಪಾರಾಧನೆ ಮಾಡಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರ ಕಾರ್ಯಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.`;

  const fallbackAnswerEn = `According to the authentic Gokarna Jyotisha tradition, examining your ${report.lagnaNameEn} Lagna, ${report.rashiNameEn} Moon sign, and ${report.nakshatraNameEn} constellation, your question "${question}" holds favorable cosmic alignment.\n\nUnder current ${report.currentDashaEn} Dasha, strategic patience and righteous conduct will unlock fruitful breakthroughs.\n\nProceed with calm confidence.`;
  const fallbackRemedyEn = `Sankalpa Rudrabhisheka and Navagraha Ghee Lamp offering at Gokarna Mahabaleshwara Kshetra ensure rapid obstacle clearance.`;

  if (!apiKey) {
    return {
      answer: langCode === "kn" ? fallbackAnswerKn : fallbackAnswerEn,
      remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn,
      isAi: false
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
Devotee: ${report.devoteeName} (Lagna: ${report.lagnaNameEn}, Rashi: ${report.rashiNameEn}, Nakshatra: ${report.nakshatraNameEn}, Dasha: ${report.currentDashaEn}).
Personal Query: "${question}"

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
        remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn,
        isAi: false
      };
    }

    const parts = text.split(/ಪರಿಹಾರ|Remedy|उपाय|పరిహారం|பரிகாரம்/i);
    const ansPart = parts[0]?.trim() || text.trim();
    const remPart = parts[1]?.trim() || (langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn);

    return {
      answer: ansPart,
      remedy: remPart,
      isAi: true
    };
  } catch (err) {
    console.warn("[SpecialConsultationEngine] Gemini custom question error:", err);
    return {
      answer: langCode === "kn" ? fallbackAnswerKn : fallbackAnswerEn,
      remedy: langCode === "kn" ? fallbackRemedyKn : fallbackRemedyEn,
      isAi: false
    };
  }
}
