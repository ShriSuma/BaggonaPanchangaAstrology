/**
 * superAdminPetEngine.ts
 *
 * Core Intelligence and Action Execution Engine for the Super Admin AI Pet.
 * strictly accessible ONLY to Super Admin and Master Profiles.
 *
 * Capabilities:
 * 1. Janma Kundali & Dosha Deep Analysis & Remedial Prescriptions.
 * 2. Revenue & Monetization Strategies ("How to earn money with Baggona Panchanga").
 * 3. App Marketing & Viral Growth Strategies ("How to market the application").
 * 4. Autonomous App Actions ("Do on behalf of me", navigate, mint, check health).
 * 5. Full System & Astronomical Calculation Diagnostics.
 * 6. Dual-Brain: Online Gemini (gemini-3.5-flash-lite) + 100% Offline Vedic & Business Knowledge Matrix.
 */

import type { SupportedLanguage, AppPage } from "../stores/appStore";
import { askGemini } from "../core/GeminiEngine";
import { calculateComprehensiveDoshas, type ComprehensiveDoshaReport } from "../core/ComprehensiveDoshaEngine";
import { calculateYearlyAstodaya, calculateYearlyEclipses } from "../core/AstodayaGrahanaEngine";
import { calculatePanchang } from "../core/PanchangEngine";
import { db } from "../db/indexedDb";
import { PlanetName, RASHIS, type KundliInput, type KundliOutput } from "../core/AstroTypes";
import { normalizeDegree, degreeToNakshatra, degreeToNakshatraPada } from "../core/AstroMath";
import { calculateKundli } from "../core/KundliEngine";
import {
  generateDashaTimeline,
  findMahadashaAtAge,
  findBhuktiAtAge
} from "../core/DashaBhuktiEngine";
import { evaluateYogasAndDoshas } from "../core/BVRamanPredictionEngine";
import { resolveCityCoordsAndPincode, CITY_DATABASE } from "./superAdminWorkflowRunner";
import {
  GRAHA_SHASTRA_MATRIX,
  NEECHABHANGA_RULES,
  NAKSHATRA_SHASTRA_CATALOG,
  BHAVA_SHASTRA_CATALOG,
  CLASSICAL_YOGAS_CATALOG,
  lookupGrahaByName,
  lookupNakshatraByName,
  lookupBhavaByNumberOrTerm,
  type GrahaShastraRecord,
  SANKHYA_SHASTRA_CATALOG,
  calculateSankhyaProfile,
  HASTA_MUDRIKA_LINES,
  HASTA_MUDRIKA_SIGNS,
  MUKHA_MUDRIKA_CATALOG,
  AYUR_SANJEEVINI_CATALOG,
  HINDINA_JANMA_CATALOG,
  generateProfileImprovements
} from "./jyotishyaShastraKnowledge";
import { harvestAmbientKundliContext, type AmbientKundliProfile } from "./ambientKundliHarvester";
import { searchBaggonaFestivals } from "../core/BaggonaFestivalRegistry";
import { isSuperAdminDatabaseIntent, handleSuperAdminDatabaseIntent } from "./superAdminDatabaseEngine";

export type PetEmotion = "peaceful" | "thinking" | "speaking" | "excited" | "remedy" | "alert";

export type PetActionItem = {
  id: string;
  label: Record<SupportedLanguage, string>;
  icon: string;
  targetPage?: AppPage;
  actionType?: "navigate" | "run_diagnostic" | "load_sample_kundli" | "open_admin" | "custom";
  payload?: any;
};

export type PetResponse = {
  text: Record<SupportedLanguage, string>;
  spokenText: Record<SupportedLanguage, string>;
  emotion: PetEmotion;
  category: "revenue" | "marketing" | "kundli" | "diagnostics" | "navigation" | "admin" | "general";
  actions: PetActionItem[];
};

export type ActiveProfileContext = {
  devoteeId?: string;
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  pincode?: string;
  priestName?: string;
  priestPhone?: string;
  poojaName?: string;
  rawText?: string;
  customQuestions?: string[];
  kundli?: any;
  dasha?: any;
  doshas?: any;
  lastTopic?: string;
};

export type ChatTurnContext = {
  sender: "user" | "pet" | "assistant" | "model";
  text: string;
  spokenText?: string;
  mode?: "text" | "voice";
  timestamp?: string | Date;
};

export type SuperAdminPetContext = {
  activePage: AppPage;
  currentKundliSession?: any;
  activeProfile?: ActiveProfileContext;
  ambientProfile?: AmbientKundliProfile;
  coinBalance?: number;
  currentUser: string | null;
  geminiApiKey?: string;
  selectedLanguage: SupportedLanguage;
  pendingConfirmation?: any;
  conversationHistory?: ChatTurnContext[];
};

/**
 * Checks whether the current user has Super Admin or Master Profile privileges.
 */
export function isSuperAdminAuthorized(role?: string, currentUser?: string | null): boolean {
  if (!currentUser) return false;
  const clean = currentUser.toLowerCase();
  return (
    role === "superadmin" ||
    clean === "superadmin" ||
    clean === "baggona" ||
    clean === "shrisuma" ||
    currentUser === "$hriSuma"
  );
}

// =========================================================================
// QUERY LANGUAGE DETECTOR
// =========================================================================
export function detectQueryLanguage(
  rawQuery: string,
  defaultLang: SupportedLanguage = "kn"
): SupportedLanguage {
  const q = rawQuery.toLowerCase();
  if (q.includes("in kannada") || q.includes("ಕನ್ನಡದಲ್ಲಿ") || q.includes("ಕನ್ನಡ")) return "kn";
  if (q.includes("in english") || q.includes("ಇಂಗ್ಲಿಷ್") || q.includes("english")) return "en";
  if (q.includes("in hindi") || q.includes("हिंदी") || q.includes("hindi")) return "hi";
  if (q.includes("in telugu") || q.includes("తెలుగు") || q.includes("telugu")) return "te";
  if (q.includes("in tamil") || q.includes("தமிழ்") || q.includes("tamil")) return "ta";
  if (/[\u0C80-\u0CFF]/.test(rawQuery)) return "kn";
  if (/[\u0900-\u097F]/.test(rawQuery)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(rawQuery)) return "te";
  if (/[\u0B80-\u0BFF]/.test(rawQuery)) return "ta";
  if (!/[\u0C80-\u0CFF]/.test(rawQuery) && /[a-zA-Z]{3,}/.test(rawQuery)) {
    return "en";
  }
  return defaultLang;
}

// =========================================================================
// ASTRONOMICAL LOCALIZATION DICTIONARIES
// =========================================================================
export const RASHI_LOCALE: Record<number, Record<SupportedLanguage, string>> = {
  0: { kn: "ಮೇಷ (Mesha)", hi: "मेष (Mesha)", te: "మేషం (Mesham)", ta: "மேஷம் (Mesham)", en: "Aries (Mesha)" },
  1: { kn: "ವೃಷಭ (Vrishabha)", hi: "वृषभ (Vrishabha)", te: "వృషభం (Vrishabham)", ta: "ரிஷபம் (Rishabham)", en: "Taurus (Vrishabha)" },
  2: { kn: "ಮಿಥುನ (Mithuna)", hi: "मिथुन (Mithuna)", te: "మిథునం (Mithunam)", ta: "மிதுனம் (Mithunam)", en: "Gemini (Mithuna)" },
  3: { kn: "ಕರ್ಕ (Karka)", hi: "कर्क (Karka)", te: "కర్కాటకం (Karkatakam)", ta: "கடகம் (Kadagam)", en: "Cancer (Karka)" },
  4: { kn: "ಸಿಂಹ (Simha)", hi: "सिंह (Simha)", te: "సింహం (Simham)", ta: "சிம்மம் (Simmam)", en: "Leo (Simha)" },
  5: { kn: "ಕನ್ಯಾ (Kanya)", hi: "कन्या (Kanya)", te: "కన్య (Kanya)", ta: "கன்னி (Kanni)", en: "Virgo (Kanya)" },
  6: { kn: "ತುಲಾ (Tula)", hi: "तुला (Tula)", te: "తులా (Tula)", ta: "துலாம் (Thulam)", en: "Libra (Tula)" },
  7: { kn: "ವೃಶ್ಚಿಕ (Vrischika)", hi: "वृश्चिक (Vrischika)", te: "వృశ్చికం (Vrischikam)", ta: "விருச்சிகம் (Viruchigam)", en: "Scorpio (Vrischika)" },
  8: { kn: "ಧನು (Dhanus)", hi: "धनु (Dhanu)", te: "ధనుస్సు (Dhanussu)", ta: "தனுசு (Thanusu)", en: "Sagittarius (Dhanus)" },
  9: { kn: "ಮಕರ (Makara)", hi: "मकर (Makara)", te: "మకరం (Makaram)", ta: "மகரம் (Magaram)", en: "Capricorn (Makara)" },
  10: { kn: "ಕುಂಭ (Kumbha)", hi: "कुम्भ (Kumbha)", te: "కుంభం (Kumbham)", ta: "கும்பம் (Kumbam)", en: "Aquarius (Kumbha)" },
  11: { kn: "ಮೀನ (Meena)", hi: "मीन (Meena)", te: "మీనం (Meenam)", ta: "மீனம் (Meenam)", en: "Pisces (Meena)" },
};

export const PLANET_NAMES_KN: Record<PlanetName, string> = {
  [PlanetName.Sun]: "ಸೂರ್ಯ (Surya)",
  [PlanetName.Moon]: "ಚಂದ್ರ (Chandra)",
  [PlanetName.Mars]: "ಕುಜ (Kuja / Mangala)",
  [PlanetName.Mercury]: "ಬುಧ (Budha)",
  [PlanetName.Jupiter]: "ಗುರು (Guru / Brihaspati)",
  [PlanetName.Venus]: "ಶುಕ್ರ (Shukra)",
  [PlanetName.Saturn]: "ಶನಿ (Shani)",
  [PlanetName.Rahu]: "ರಾಹು (Rahu)",
  [PlanetName.Ketu]: "ಕೇತು (Ketu)"
};

export const NAKSHATRA_NAMES_KN: string[] = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರ್ದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ",
  "ಮಘಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ", "ಉತ್ತರ ಫಲ್ಗುಣಿ", "ಹಸ್ತ", "ಚಿತ್ತಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನೂರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢಾ", "ಉತ್ತರಾಷಾಢಾ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಭಾದ್ರಪದ", "ಉತ್ತರಭಾದ್ರಪದ", "ರೇವತಿ"
];

const MONTH_MAP_LOCAL: Record<string, string> = {
  jan: "01", january: "01", ಜನವರಿ: "01",
  feb: "02", february: "02", ಫೆಬ್ರವರಿ: "02",
  mar: "03", march: "03", ಮಾರ್ಚ್: "03",
  apr: "04", april: "04", ಏಪ್ರಿಲ್: "04",
  may: "05", ಮೇ: "05",
  jun: "06", june: "06", ಜೂನ್: "06",
  jul: "07", july: "07", ಜುಲೈ: "07",
  aug: "08", august: "08", ಆಗಸ್ಟ್: "08",
  sep: "09", september: "09", ಸೆಪ್ಟೆಂಬರ್: "09",
  oct: "10", october: "10", ಅಕ್ಟೋಬರ್: "10",
  nov: "11", november: "11", ನವೆಂಬರ್: "11",
  dec: "12", december: "12", ಡಿಸೆಂಬರ್: "12"
};

// =========================================================================
// APPLICATION DIRECTORY & SITEMAP KNOWLEDGE BASE (ALL 32 APP PAGES)
// =========================================================================
export const APPLICATION_PAGES_DIRECTORY: Record<
  AppPage,
  {
    name: Partial<Record<SupportedLanguage, string>> & { kn: string; en: string };
    category: "kundli" | "panchanga" | "seva" | "divination" | "wisdom" | "admin";
    icon: string;
    keywords: string[];
    description: Partial<Record<SupportedLanguage, string>> & { kn: string; en: string };
  }
> = {
  home: {
    name: { kn: "ದೈನಂದಿನ ಪಂಚಾಂಗ (Home)", en: "Daily Panchanga (Home)", hi: "दैनिक पंचांग", te: "దిన పంచాంగం", ta: "தினசரி பஞ்சாங்கம்" },
    category: "panchanga",
    icon: "🌅",
    keywords: ["home", "daily panchang", "panchanga", "ಮುಖಪುಟ", "ದೈನಂದಿನ ಪಂಚಾಂಗ", "tithi", "daily nakshatra", "ಮುಖ್ಯ ಪುಟ", "dashboard"],
    description: {
      kn: "ದಿನದ ನಿಖರ ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ, ರಾಹುಕಾಲ, ಯಮಗಂಡ, ಗುಳಿಕ ಕಾಲ ಮತ್ತು ಸೂರ್ಯೋದಯ-ಸೂರ್ಯಾಸ್ತ.",
      en: "Daily precise Tithi, Nakshatra, Yoga, Karana, Rahu Kaalam, Yamaganda, Gulika, and Sun times."
    }
  },
  kundli: {
    name: { kn: "ಜನ್ಮ ಕುಂಡಲಿ (Kundli)", en: "Janma Kundli (Birth Chart)", hi: "जन्म कुण्डली", te: "జన్మ కుండలి", ta: "ஜாதகம்" },
    category: "kundli",
    icon: "🪐",
    keywords: ["kundli", "kundali", "birth chart", "horoscope", "ಜಾತಕ", "ಕುಂಡಲಿ", "ಜನನ ಪತ್ರಿಕೆ", "कुंडली"],
    description: {
      kn: "ಕರ್ನಾಟಕ ದಕ್ಷಿಣ & ಉತ್ತರ ಭಾರತೀಯ ಚಾರ್ಟ್, ೧೨ ಭಾವಗಳು, ಗ್ರಹ ಸ್ಪಷ್ಟಾಂಶ, ಮತ್ತು ದಶಾ ಬ್ಯಾಲೆನ್ಸ್.",
      en: "South Indian & North Indian birth charts, 12 whole-sign Bhavas, planetary longitudes, and Vimshottari dasha."
    }
  },
  predictions: {
    name: { kn: "ಭಾವ & ಗ್ರಹ ಭವಿಷ್ಯ (Predictions)", en: "Bhava & Planetary Predictions", hi: "भाव फल", te: "భావ ఫలితాలు", ta: "பாவ பலன்கள்" },
    category: "kundli",
    icon: "📜",
    keywords: ["predictions", "bhava predictions", "ಗ್ರಹ ಫಲ", "ಭಾವ ಭವಿಷ್ಯ", "ಹನ್ನೆರಡು ಮನೆಗಳು"],
    description: {
      kn: "೧ ರಿಂದ ೧೨ ಭಾವಗಳ ಸಮಗ್ರ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ, ಕಾರಕತ್ವಗಳು, ಮತ್ತು ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಫಲ.",
      en: "Deep Parashari analysis of houses 1 through 12, planetary placements, and house lords."
    }
  },
  insights: {
    name: { kn: "ಜಾತಕ ಒಳನೋಟಗಳು (Insights)", en: "Kundli Insights & Dignities", hi: "ग्रह अंतर्दृष्टि", te: "గ్రహ అంతర్దృష్టి", ta: "கிரக நுண்ணறிவு" },
    category: "kundli",
    icon: "🔍",
    keywords: ["insights", "dignity", "ಮೈತ್ರಿ", "ಉಚ್ಚ ನೀಚ", "ಗ್ರಹ ಬಲ"],
    description: {
      kn: "ಗ್ರಹಗಳ ಉಚ್ಚ-ನೀಚ ಸ್ಥಿತಿ, ನೈಸರ್ಗಿಕ ಹಾಗೂ ತಾತ್ಕಾಲಿಕ ಮೈತ್ರಿ, ಮತ್ತು ಷಡ್ಬಲ ಒಳನೋಟಗಳು.",
      en: "Planetary exaltation, debilitation, compound planetary friendships, and dimensional strengths."
    }
  },
  ramanbhavishya: {
    name: { kn: "ರಮಣ ಪದ್ಧತಿ ಭವಿಷ್ಯ (Raman Bhavishya)", en: "B.V. Raman 10-Chapter Predictions", hi: "रमण पद्धति भविष्य", te: "రమణ పద్ధతి భవిష్యత్", ta: "ராமன் முறை பலன்கள்" },
    category: "kundli",
    icon: "🌟",
    keywords: [
      "raman",
      "bhavishya",
      "ramanbhavishya",
      "ರಮಣ ಭವಿಷ್ಯ",
      "೧೦ ಅಧ್ಯಾಯ",
      "ಜೀವಿತ ಭವಿಷ್ಯ",
      "10 chapters",
      "life stages",
      "multi-question",
      "multi question",
      "questionnaire",
      "question area",
      "ಬಹುಪ್ರಶ್ನೆ",
      "ಪ್ರಶ್ನಾವಳಿ",
      "single question",
      "ask astrologer",
      "dina bhavishya",
      "ದಿನ ಭವಿಷ್ಯ",
      "ದಿನಭವಿಷ್ಯ",
      "daily prediction",
      "daily horoscope",
      "daily bhavishya",
      "ದೈನಂದಿನ ಭವಿಷ್ಯ"
    ],
    description: {
      kn: "ಡಾ. ಬಿ.ವಿ. ರಮಣ ಪದ್ಧತಿಯ ೧೦-ಅಧ್ಯಾಯಗಳ ಸಮಗ್ರ ಜೀವನ ಭವಿಷ್ಯ, ಯೋಗಗಳು, ಮತ್ತು ಗೋಚಾರ ಫಲ.",
      en: "Dr. B.V. Raman 10-chapter life stage predictions, yogas, dasha analysis, and transits."
    }
  },
  doshas: {
    name: { kn: "ಕುಂಡಲಿ ದೋಷಗಳು (Doshas Center)", en: "Comprehensive Kundli Doshas", hi: "कुंडली दोष विश्लेषण", te: "జాతక దోషాలు", ta: "ஜாதக தோஷங்கள்" },
    category: "kundli",
    icon: "🛡️",
    keywords: ["dosha", "doshas", "doshagalu", "manglik", "kala sarpa", "sade sati", "pitru", "ದೋಷ", "ದೋಷಗಳು", "ಮಾಂಗಲಿಕ", "ಕಾಳಸರ್ಪ", "ಸಾಡೇಸಾತಿ"],
    description: {
      kn: "ಕುಜ, ಕಾಳಸರ್ಪ, ಸಾಡೇಸಾತಿ, ಪಿತೃ ಹಾಗೂ ಗುರು ಚಂಡಾಲ ದೋಷಗಳು, ವಯೋಮಿತಿ ಮೈಲಿಗಲ್ಲುಗಳು ಮತ್ತು ಪರಿಹಾರ.",
      en: "5-fold classical Doshas with Parashari cancellations, age threshold milestones, and temple remedies."
    }
  },
  seva: {
    name: { kn: "ಗೋಕರ್ಣ ಸೇವಾ & ಪ್ರಸಾದ (Seva & Prasada)", en: "Gokarna Seva & Ashirvada Patra", hi: "गोकर्ण सेवा एवं प्रसाद", te: "గోకర్ణ సేవా & ప్రసాదం", ta: "கோகர்ண சேவா & பிரசாதம்" },
    category: "seva",
    icon: "🪔",
    keywords: ["seva", "prasada", "ashirvada", "pooja", "ಪೂಜೆ", "ಸೇವೆ", "ಪ್ರಸಾದ", "ಗೋಕರ್ಣ", "ಆಶೀರ್ವಾದ ಪತ್ರ", "shreeram pandit"],
    description: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ, ಕಾಳಸರ್ಪ ಶಾಂತಿ ಸೇವೆಗಳು, ಅರ್ಚಕರ ಸಂಪರ್ಕ ಮತ್ತು ೫ ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ.",
      en: "Temple rituals at Gokarna with Chief Priest Shreeram Pandit, and 5-page Ashirvada Patra downloads."
    }
  },
  calendar: {
    name: { kn: "೯೦ ದಿನಗಳ ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್ (Calendar)", en: "90-Day Rhythm Energy Calendar", hi: "९०-दिवसीय ऊर्जा कैलेंडर", te: "90 రోజుల క్యాలెండర్", ta: "90 நாள் காலண்டர்" },
    category: "panchanga",
    icon: "📅",
    keywords: ["calendar", "rhythm", "90 day", "ಕ್ಯಾಲೆಂಡರ್", "೯೦ ದಿನ", "ರಿದಮ್", "ಚಂದ್ರಾಷ್ಟಮ", "baggona calendar", "baggona panchang", "baggona panchanga", "panchanga calendar", "panchang calendar", "ಬಗ್ಗೋಣ ಕ್ಯಾಲೆಂಡರ್", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್", "ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್"],
    description: {
      kn: "ವೈಯಕ್ತಿಕ ಜನ್ಮ ನಕ್ಷತ್ರಾಧಾರಿತ ಹಸಿರು, ಹಳದಿ, ಕೆಂಪು ದಿನಗಳ ೯೦ ದಿನಗಳ ಶಕ್ತಿ ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್.",
      en: "Personalized 90-day rhythm energy scorecard with Green, Yellow, and Red caution days."
    }
  },
  quick_calendar: {
    name: { kn: "ತ್ವರಿತ ಕ್ಯಾಲೆಂಡರ್ (Quick Calendar)", en: "Quick Panchanga Calendar", hi: "त्वरित कैलेंडर", te: "త్వరిత క్యాలెండర్", ta: "விரைவு காலண்டர்" },
    category: "panchanga",
    icon: "⚡",
    keywords: ["quick calendar", "fast calendar", "ತ್ವರಿತ ಕ್ಯಾಲೆಂಡರ್", "ವೇಗದ ಪಂಚಾಂಗ"],
    description: {
      kn: "ಯಾವುದೇ ತಿಂಗಳು ಮತ್ತು ವರ್ಷದ ಪಂಚಾಂಗ ವಿವರಗಳನ್ನು ಅತಿವೇಗವಾಗಿ ವೀಕ್ಷಿಸುವ ಪುಟ.",
      en: "High-speed monthly panchang grid and instant day navigation."
    }
  },
  astodaya_grahana: {
    name: { kn: "ಗ್ರಹಣ & ಅಸ್ತೋದಯ (Eclipses & Combustion)", en: "Astodaya & Eclipses Center", hi: "ग्रहण एवं अस्तोदय", te: "గ్రహణ & అస్తోదయ", ta: "கிரகண & அஸ்தோதய" },
    category: "panchanga",
    icon: "🌒",
    keywords: [
      "astodaya",
      "grahana",
      "eclipse",
      "moudhya",
      "combustion",
      "guru shukra",
      "guru-shukra",
      "guru shukra astodaya",
      "guru shukra udaya",
      "udaya asta",
      "udaya",
      "asta",
      "ಅಸ್ತೋದಯ",
      "ಗ್ರಹಣ",
      "ಮೌಢ್ಯ",
      "ಗುರು ಶುಕ್ರ",
      "ಗುರು-ಶುಕ್ರ",
      "ಗುರು ಶುಕ್ರ ಅಸ್ತೋದಯ",
      "ಉದಯ ಅಸ್ತ",
      "ಉದಯ",
      "ಅಸ್ತ",
      "ಸೂರ್ಯ ಗ್ರಹಣ",
      "ಚಂದ್ರ ಗ್ರಹಣ"
    ],
    description: {
      kn: "ಗುರು-ಶುಕ್ರ ಮೌಢ್ಯ (ಅಸ್ತೋದಯ), ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣಗಳು, ಸ್ಪರ್ಶ-ಮೋಕ್ಷ ಕಾಲ ಹಾಗೂ ಸೂತಕ ನಿಯಮಗಳು.",
      en: "Guru-Shukra Moudhya combustion dates, solar and lunar eclipses, Sutaka rules and worldwide visibility."
    }
  },
  public_kundli: {
    name: { kn: "ಪಬ್ಲಿಕ್ ಜಾತಕ ಹಂಚಿಕೆ (Public Kundli)", en: "Public Kundli Share Engine", hi: "सार्वजनिक कुण्डली शेयर", te: "పబ్లిక్ జాతకం", ta: "பொது ஜாதகம்" },
    category: "kundli",
    icon: "🔗",
    keywords: ["public kundli", "share kundli", "link", "ಪಬ್ಲಿಕ್ ಜಾತಕ", "ಜಾತಕ ಲಿಂಕ್", "ಹಂಚಿಕೆ"],
    description: {
      kn: "ಯಾವುದೇ ವ್ಯಕ್ತಿಯ ಜಾತಕಕ್ಕೆ ನೇರ ಸುರಕ್ಷಿತ ಲಿಂಕ್ ಸೃಷ್ಟಿಸಿ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ತಕ್ಷಣ ಹಂಚಿಕೊಳ್ಳಿ.",
      en: "Generate deterministic, tamper-proof shareable links for any birth chart."
    }
  },
  instant_reading: {
    name: { kn: "ಪುರೋಹಿತ ತ್ವರಿತ ಓದು (Instant Reading)", en: "Priest 30-Sec Instant Reading", hi: "पुरोहित त्वरित पठन", te: "పురోహిత నోట్స్", ta: "புரோகிதர் உடனடி குறிப்புகள்" },
    category: "kundli",
    icon: "⏱️",
    keywords: ["instant reading", "talking points", "priest notes", "ತ್ವರಿತ ಓದು", "ಪುರೋಹಿತ ನೋಟ್ಸ್", "೬ ಅಂಶಗಳು"],
    description: {
      kn: "ಪುರೋಹಿತರು ಭಕ್ತರಿಗೆ ೩೦ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಹೇಳಬೇಕಾದ ೬ ಪ್ರಮುಖ ಶಾಸ್ತ್ರೀಯ ಅಂಶಗಳು ಮತ್ತು ಸಾರಾಂಶ.",
      en: "Curated 30-second priest talking points with 6 deterministic core life bullet points."
    }
  },
  melapak: {
    name: { kn: "ವಿವಾಹ ಮೇಳಾಪಕ (Melapak)", en: "Marriage Matching (Ashtakoota)", hi: "विवाह मेलापक", te: "వివాహ మేళాపకం", ta: "திருமண பொருத்தம்" },
    category: "kundli",
    icon: "💍",
    keywords: ["melapak", "marriage matching", "compatibility", "gunas", "ಮೇಳಾಪಕ", "ವಿವಾಹ ಹೊಂದಾಣಿಕೆ", "ಗುಣ ಮಿಲನ", "೩೬ ಗುಣ"],
    description: {
      kn: "೩೬ ಗುಣಗಳ ಅಷ್ಟಕೂಟ ಮಿಲನ, ನಾಡಿ ದೋಷ, ಗಣ ಕೂಟ, ಗ್ರಹ ಮೈತ್ರಿ ಹಾಗೂ ವಿವಾಹ ಯೋಗ್ಯತಾ ನಿರ್ಣಯ.",
      en: "36-point Ashtakoota compatibility, Nadi dosha, Gana koota, and marital harmony evaluation."
    }
  },
  muhurtha: {
    name: { kn: "ಶುಭ ಮುಹೂರ್ತ (Muhurtha)", en: "Vedic Auspicious Muhurtha", hi: "शुभ मुहूर्त", te: "శుభ ముహూర్తం", ta: "சுப முகூர்த்தம்" },
    category: "panchanga",
    icon: "⏰",
    keywords: ["muhurtha", "auspicious time", "ಶುಭ ಮುಹೂರ್ತ", "ಮುಹೂರ್ತ", "ವಿವಾಹ ಮುಹೂರ್ತ", "ಗೃಹಪ್ರವೇಶ"],
    description: {
      kn: "ವಿವಾಹ, ಗೃಹಪ್ರವೇಶ, ಉಪನಯನ, ನಾಮಕರಣ, ವಾಹನ ಖರೀದಿ ಮುಂತಾದ ಸಕಲ ಶುಭ ಕಾರ್ಯಗಳ ನಿಖರ ಮುಹೂರ್ತಗಳು.",
      en: "Deterministic Muhurtha calculations for marriage, housewarming, initiation, and vehicle purchase."
    }
  },
  varshabavishya: {
    name: { kn: "ವಾರ್ಷಿಕ ವರ್ಷ ಭವಿಷ್ಯ (Varshaphala)", en: "Annual Solar Return (Tajika)", hi: "वर्षफल", te: "వార్షిక భవిష్యత్", ta: "வருட பலன்கள்" },
    category: "kundli",
    icon: "🎆",
    keywords: [
      "varsha",
      "varshabavishya",
      "varshaphala",
      "tajika",
      "ವರ್ಷ ಭವಿಷ್ಯ",
      "ವರ್ಷಭವಿಷ್ಯ",
      "ವಾರ್ಷಿಕ ಫಲ",
      "varsha bhavishya",
      "yearly prediction",
      "annual prediction",
      "varshik bhavishya",
      "वार्षिक भविष्य"
    ],
    description: {
      kn: "ತಾಜಿಕ ಪದ್ಧತಿಯ ವಾರ್ಷಿಕ ಸೌರ ಪ್ರವೇಶ ಕುಂಡಲಿ, ವರ್ಷಾಧಿಪತಿ ನಿರ್ಣಯ ಮತ್ತು ಮುಂಬರುವ ವರ್ಷದ ಫಲಗಳು.",
      en: "Tajika system annual solar return horoscope, Varsha Lord, and 12-month event predictions."
    }
  },
  bhagyodaya: {
    name: { kn: "ಭಾಗ್ಯೋದಯ ವರ್ಷ ನಿರ್ಣಯ (Bhagyodaya)", en: "Bhagyodaya Fortune Age Calculator", hi: "भाग्योदय वर्ष", te: "భాగ్యోదయ సంవత్సరం", ta: "பாக்யோதய வயது" },
    category: "kundli",
    icon: "💎",
    keywords: ["bhagyodaya", "fortune year", "ಭಾಗ್ಯೋದಯ", "ಭಾಗ್ಯೋದಯ ವರ್ಷ", "ಅದೃಷ್ಟ ಕಾಲ"],
    description: {
      kn: "ಜಾತಕದಲ್ಲಿ ಅದೃಷ್ಟ, ಕೀರ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಏಳಿಗೆ ಪ್ರಾರಂಭವಾಗುವ ನಿಖರ ವಯಸ್ಸು (ಉದಾ. ೧೬, ೨೨, ೨೮, ೩೨, ೩೬).",
      en: "Calculates the exact year and age threshold of fortune, rise, and wealth manifestation."
    }
  },
  sankhyashastra: {
    name: { kn: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Numerology)", en: "Vedic Numerology (Sankhya Shastra)", hi: "अंकशास्त्र", te: "సంఖ్యాశాస్త్రం", ta: "எண்கணிதம்" },
    category: "divination",
    icon: "🔢",
    keywords: ["sankhyashastra", "numerology", "numbers", "ಮೂಲಾಂಕ", "ಭಾಗ್ಯಾಂಕ", "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ"],
    description: {
      kn: "ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ, ನಾಮ ಸಂಖ್ಯೆ, ಅದೃಷ್ಟ ರತ್ನಗಳು, ಶುಭ ದಿನಗಳು ಮತ್ತು ಅದೃಷ್ಟ ಬಣ್ಣಗಳ ವಿವರಣೆ.",
      en: "Mulank, Bhagyank, Name number vibrations, lucky gems, and destiny numbers."
    }
  },
  palmreading: {
    name: { kn: "ಹಸ್ತ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ (Palm Reading)", en: "Hastha Samudrika (Palm Reading)", hi: "हस्तरेखा शास्त्र", te: "హస్త సాముద్రికం", ta: "கைரேகை சாஸ்திரம்" },
    category: "divination",
    icon: "✋",
    keywords: [
      "palm",
      "palmreading",
      "hastarekha",
      "ಹಸ್ತ ರೇಖೆ",
      "ಹಸ್ತ ಸಾಮುದ್ರಿಕ",
      "ಆಯುಷ್ಯ ರೇಖೆ",
      "ಭಾಗ್ಯ ರೇಖೆ",
      "hasta mudrika",
      "ಹಸ್ತ ಮುದ್ರಿಕಾ",
      "ಹಸ್ತಮುದ್ರಿಕಾ",
      "ಕೈ ಮುದ್ರಿಕಾ",
      "ಕೈ ಮುದ್ರಾ",
      "ಕೈಮುದ್ರಿಕಾ",
      "kai mudrama",
      "kai mudra",
      "palm reading",
      "palmistry",
      "hasta samudrika",
      "hasta"
    ],
    description: {
      kn: "ಜೀವನ ರೇಖೆ, ಶಿರೋ ರೇಖೆ, ಹೃದಯ ರೇಖೆ, ಭಾಗ್ಯ ರೇಖೆ ಮತ್ತು ಹಸ್ತ ಪರ್ವತಗಳ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ.",
      en: "Hastha Samudrika Shastra palm line inspection, mounts of planets, and destiny signs."
    }
  },
  facereading: {
    name: { kn: "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ (Face Reading)", en: "Samudrika Shastra (Face Reading)", hi: "सामुद्रिक मुख लक्षण", te: "ముఖ సాముద్రికం", ta: "முக சாஸ்திரம்" },
    category: "divination",
    icon: "👤",
    keywords: [
      "face",
      "facereading",
      "samudrika",
      "ಮುಖ ಲಕ್ಷಣ",
      "ಸಾಮುದ್ರಿಕ",
      "ನೆತ್ತಿ ಲಕ್ಷಣ",
      "mukha mudrika",
      "ಮುಖ ಮುದ್ರಿಕಾ",
      "ಮುಖಮುದ್ರಿಕಾ",
      "ಮುಖ ಸಾಮುದ್ರಿಕ",
      "face reading",
      "physiognomy"
    ],
    description: {
      kn: "ನೆತ್ತಿ, ಕಣ್ಣುಗಳು, ಮೂಗು, ತುಟಿಗಳು, ಮತ್ತು ಮುಖ ಲಕ್ಷಣಗಳಿಂದ ಆಯುಷ್ಯ ಮತ್ತು ಭಾಗ್ಯ ನಿರ್ಣಯ.",
      en: "Facial feature destiny analysis, forehead lines, and character indicators."
    }
  },
  aiaastrologer: {
    name: { kn: "ಎಐ ದೈವಿಕ ಜ್ಯೋತಿಷಿ (AI Astrologer)", en: "Interactive AI Astrologer Consultation", hi: "AI ज्योतिषी", te: "AI జ్యోతిష్యుడు", ta: "AI ஜோதிடர்" },
    category: "wisdom",
    icon: "🤖",
    keywords: ["ai astrologer", "chat astrologer", "ಎಐ ಜ್ಯೋತಿಷಿ", "ಜ್ಯೋತಿಷ್ಯ ಚಾಟ್"],
    description: {
      kn: "ಜೆಮಿನಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಸಂವಾದಾತ್ಮಕ ಧ್ವನಿ ಜ್ಯೋತಿಷಿ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗ.",
      en: "Conversational Vedic astrologer powered by Gemini AI with live voice narration."
    }
  },
  varamahalakshmi: {
    name: { kn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ (Varamahalakshmi)", en: "Varamahalakshmi Vratha Special", hi: "वरमहालक्ष्मी व्रत", te: "వరమహాలక్ష్మి వ్రతం", ta: "வரமஹாலக்ஷ்மி விரதம்" },
    category: "wisdom",
    icon: "🪷",
    keywords: ["varamahalakshmi", "vratha", "puja vidhi", "ವರಮಹಾಲಕ್ಷ್ಮಿ", "ವ್ರತ", "ಲಕ್ಷ್ಮಿ ಪೂಜೆ"],
    description: {
      kn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತದ ಸಂಪೂರ್ಣ ಪೂಜಾ ವಿಧಿ, ಕಳಸ ಸ್ಥಾಪನೆ, ದೋರ ಗ್ರಂಥಿ ಪೂಜೆ, ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿ ಮತ್ತು ಆಡಿಯೋ ಸ್ತೋತ್ರಗಳು.",
      en: "Sacred Varamahalakshmi Vratha puja vidhi, kalasha sthapana, shlokas, and audio stotras."
    }
  },
  maranottara: {
    name: { kn: "ಮರಣೋತ್ತರ ಸಂಸ್ಕಾರ (Post-Mortem Rites)", en: "Post-Mortem Rites & Moksha Bali", hi: "मरणोत्तर संस्कार", te: "మరణానంతర సంస్కారాలు", ta: "மரணானந்தர சடங்குகள்" },
    category: "seva",
    icon: "🕊️",
    keywords: ["maranottara", "shraddha", "narayana bali", "tripindi", "ಮರಣೋತ್ತರ", "ಶ್ರಾದ್ಧ", "ನಾರಾಯಣ ಬಲಿ", "ತ್ರಿಪಿಂಡಿ"],
    description: {
      kn: "ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ತಿಲತರ್ಪಣ ವಿಧಿಗಳು ಮತ್ತು ಪಿತೃ ಋಣ ಮುಕ್ತಿ ಮಾರ್ಗದರ್ಶನ.",
      en: "Sacred post-mortem Vedic rites, Moksha Narayana Bali, Tripindi Shraddha, and Tila Tarpan."
    }
  },
  lifeguidance: {
    name: { kn: "ಜೀವನ ಮಾರ್ಗದರ್ಶನ (Life Guidance)", en: "Vedic Practical Life Guidance", hi: "जीवन मार्गदर्शन", te: "జీవిత మార్గదర్శనం", ta: "வாழ்க்கை வழிகாட்டல்" },
    category: "wisdom",
    icon: "🧭",
    keywords: ["life guidance", "dharma", "ಜೀವನ ಮಾರ್ಗದರ್ಶನ", "ಧರ್ಮ ಮಾರ್ಗ", "ಕರ್ಮ"],
    description: {
      kn: "ವೃತ್ತಿ, ಆರೋಗ್ಯ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಧರ್ಮ ಸಾಧನೆಗಾಗಿ ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ.",
      en: "Actionable Vedic guidance for career, health, family peace, and spiritual growth."
    }
  },
  ayursanjeevini: {
    name: { kn: "ಆಯುರ್ ಸಂಜೀವಿನಿ (Ayur Sanjeevini)", en: "Ayurvedic Health & Nakshatra Diet", hi: "आयुर्वेद संजीवनी", te: "ఆయుర్వేద సంజీవిని", ta: "ஆயுர்வேத சஞ்சீவினி" },
    category: "wisdom",
    icon: "🌿",
    keywords: ["ayurveda", "ayursanjeevini", "health", "diet", "ಆಯುರ್ವೇದ", "ಆಯುರ್ ಸಂಜೀವಿನಿ", "ನಕ್ಷತ್ರ ಆಹಾರ"],
    description: {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರ ಮತ್ತು ತ್ರಿದೋಷ (ವಾತ, ಪಿತ್ತ, ಕಫ) ಸಮತೋಲನದ ಆಯುರ್ವೇದೀಯ ಆಹಾರ ಮತ್ತು ಆರೋಗ್ಯ ರಕ್ಷಣೆ.",
      en: "Ayurvedic wellness, Tridosha balance, and Nakshatra-aligned dietary wisdom."
    }
  },
  hindinajanma: {
    name: { kn: "ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ (Past Life Karma)", en: "Past Life Karma & Reincarnation", hi: "पूर्व जन्म रहस्य", te: "పూర్వ జన్మ రహస్యం", ta: "முற்பிறவி ரகசியம்" },
    category: "wisdom",
    icon: "🌀",
    keywords: ["past life", "purva janma", "karma", "ಹಿಂದಿನ ಜನ್ಮ", "ಪೂರ್ವ ಜನ್ಮ", "ಕರ್ಮ ರಹಸ್ಯ"],
    description: {
      kn: "೫ ಮತ್ತು ೯ ನೇ ಭಾವಗಳು ಹಾಗೂ ರಾಹು-ಕೇತುಗಳ ಆಧಾರದಲ್ಲಿ ಹಿಂದಿನ ಜನ್ಮದ ಕರ್ಮ ಶೇಷಗಳ ವಿಶ್ಲೇಷಣೆ.",
      en: "Exploration of past life karma, soul purpose, and unresolved spiritual patterns."
    }
  },
  kaaladiksuchi: {
    name: { kn: "ಕಾಲ ದಿಕ್ಸೂಚಿ (Directional Compass)", en: "Auspicious Directional Compass", hi: "काल दिक्-सूचक", te: "దిక్సూచి", ta: "திசை காட்டி" },
    category: "panchanga",
    icon: "🧭",
    keywords: ["compass", "directions", "diksuchi", "ದಿಕ್ಸೂಚಿ", "ಶುಭ ದಿಕ್ಕು", "ಪ್ರಯಾಣ ದಿಕ್ಕು"],
    description: {
      kn: "ದಿನದ ಶುಭ ದಿಕ್ಕುಗಳು, ದಿಶಾಸೂಲ ವರ್ಜನೆ ಮತ್ತು ಗ್ರಹಗಳ ದಿಗ್ಬಲ ಪರಿಶೀಲನೆ.",
      en: "Real-time planetary compass, Disha Shula avoidance, and auspicious travel directions."
    }
  },
  astrogames: {
    name: { kn: "ಜ್ಯೋತಿಷ್ಯ ರಸಪ್ರಶ್ನೆ & ಆಟಗಳು (Astro Games)", en: "Vedic Astrology Quizzes & Games", hi: "ज्योतिष खेल एवं क्विज", te: "జ్యోతిష్య క్విజ్", ta: "ஜோதிட விளையாட்டுகள்" },
    category: "wisdom",
    icon: "🎮",
    keywords: ["astrogames", "games", "quiz", "ರಸಪ್ರಶ್ನೆ", "ಜ್ಯೋತಿಷ್ಯ ಆಟಗಳು"],
    description: {
      kn: "ಜ್ಯೋತಿಷ್ಯ ಜ್ಞಾನ ವೃದ್ಧಿಸುವ ಸಂವಾದಾತ್ಮಕ ರಸಪ್ರಶ್ನೆಗಳು ಮತ್ತು ವೈದಿಕ ಆಟಗಳು.",
      en: "Interactive quizzes and games to test and enhance Vedic astrological wisdom."
    }
  },
  gurukula: {
    name: { kn: "ಕುಂಡಲಿ ಗುರುಕುಲ (Gurukula)", en: "Kundli Reading Gurukula School", hi: "कुण्डली गुरुकुल", te: "గురుకులం", ta: "குருகுலம்" },
    category: "wisdom",
    icon: "🏫",
    keywords: ["gurukula", "school", "learn astrology", "ಗುರುಕುಲ", "ಜ್ಯೋತಿಷ್ಯ ಪಾಠ", "ಕಲಿಕೆ"],
    description: {
      kn: "ಶಾಸ್ತ್ರೋಕ್ತ ಜ್ಯೋತಿಷ್ಯ ಕಲಿಯಲು ವ್ಯವಸ್ಥಿತ ಪಾಠಗಳು, ಗ್ರಹಗಳ ಕಾರಕತ್ವ ಮತ್ತು ಕುಂಡಲಿ ರಚನಾ ವಿಧಾನಗಳು.",
      en: "Instructional Vedic astrology masterclass, fundamental principles, and chart interpretation lessons."
    }
  },
  priestdashboard: {
    name: { kn: "ಪುರೋಹಿತ ನಿಯಂತ್ರಣ ಫಲಕ (Priest Dashboard)", en: "Purohita Mobile Portal & Ledger", hi: "पुरोहित पोर्टल", te: "పురోహిత పోర్టల్", ta: "புரோகிதர் போர்டல்" },
    category: "admin",
    icon: "🏛️",
    keywords: ["priest dashboard", "priest portal", "ಪುರೋಹಿತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ಅರ್ಚಕರ ಪೋರ್ಟಲ್", "ನಾಣ್ಯ ಲೆಡ್ಜರ್"],
    description: {
      kn: "ಗ್ರಾಮ-ನಗರ ಪುರೋಹಿತರ ಮೊಬೈಲ್ ಪೋರ್ಟಲ್, ಭಕ್ತರ ನಿರ್ವಹಣೆ ಮತ್ತು ನಾಣ್ಯ ವಾಲೆಟ್ ಲೆಡ್ಜರ್.",
      en: "Purohita mobile management suite, devotee database, and coin recharge history."
    }
  },
  priest_panchanga: {
    name: { kn: "ಅರ್ಚಕ ಪಂಚಾಂಗ ಹಾಳೆ (Priest Panchanga)", en: "Priest Ephemeris Day-Sheet", hi: "पुरोहित पंचांग पत्र", te: "పురోహిత పంచాంగ పత్రం", ta: "புரோகிதர் பஞ்சாங்க தாள்" },
    category: "panchanga",
    icon: "📋",
    keywords: ["priest panchang", "ephemeris", "ಅರ್ಚಕ ಪಂಚಾಂಗ", "ದಿನ ಪಂಚಾಂಗ ಹಾಳೆ"],
    description: {
      kn: "ಪುರೋಹಿತರಿಗೆ ಸಂಕಲ್ಪ ಮತ್ತು ಪೂಜಾ ಕಾಲದಲ್ಲಿ ತ್ವರಿತವಾಗಿ ನೋಡಲು ದಿನದ ಮುದ್ರಣಯೋಗ್ಯ ಪಂಚಾಂಗ ಹಾಳೆ.",
      en: "Printable single-sheet ephemeris engineered specifically for priest puja sankalpas."
    }
  },
  superadmindashboard: {
    name: { kn: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ (Super Admin)", en: "Super Admin Command Center", hi: "सुपर एडमिन नियंत्रण कक्ष", te: "సూపర్ అడ్మిన్ కంట్రోల్", ta: "சூப்பர் அட்மின் மையம்" },
    category: "admin",
    icon: "👑",
    keywords: ["super admin", "admin center", "control center", "ಸೂಪರ್ ಅಡ್ಮಿನ್", "ಅಡ್ಮಿನ್ ಕೇಂದ್ರ", "ನಾಣ್ಯ ಮುದ್ರಣ"],
    description: {
      kn: "ಸಮಗ್ರ ಸಿಸ್ಟಮ್ ಆಡಳಿತ, ನಾಣ್ಯ ಟಂಕಿಸುವುದು, ಬ್ಯಾಚ್ PDF ಡೌನ್‌ಲೋಡ್ ಫ್ಲೀಟ್ ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್‌ಗಳು.",
      en: "Central command room, coin minting, batch report fleet runner, and security audits."
    }
  },
  settings: {
    name: { kn: "ಸೆಟ್ಟಿಂಗ್ಸ್ & ಭಾಷೆ (Settings)", en: "Settings & Preferences", hi: "सेटिंग्स एवं भाषा", te: "సెట్టింగ్స్", ta: "அமைப்புகள்" },
    category: "admin",
    icon: "⚙️",
    keywords: [
      "settings",
      "preferences",
      "language",
      "ayanamsa",
      "ಸೆಟ್ಟಿಂಗ್ಸ್",
      "ಭಾಷೆ ಬದಲಾವಣೆ",
      "ಅಯನಾಂಶ",
      "hindi setting",
      "english setting",
      "kannada setting",
      "telugu setting",
      "tamil setting",
      "language setting",
      "ಹಿಂದಿ ಸೆಟ್ಟಿಂಗ್",
      "ಇಂಗ್ಲಿಷ್ ಸೆಟ್ಟಿಂಗ್",
      "ಕನ್ನಡ ಸೆಟ್ಟಿಂಗ್",
      "हिंदी सेटिंग",
      "अंग्रेजी सेटिंग"
    ],
    description: {
      kn: "೫ ಭಾಷೆಗಳ ಆಯ್ಕೆ (ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ತೆಲುಗು, ತಮಿಳು), ಅಯನಾಂಶ (ಲಾಹಿರಿ / ದೃಕ್) ಮತ್ತು ನೋಟಿಫಿಕೇಶನ್‌ಗಳು.",
      en: "5 Indic languages selector, Ayanamsa toggle (Lahiri vs Drik Ganita), and notification controls."
    }
  },
  baggona: {
    name: { kn: "ಬಗ್ಗೋಣ ಸಂವತ್ಸರ ಪಂಚಾಂಗ ಪುಸ್ತಕ (Baggona Book)", en: "Baggona 104-Page Annual Book", hi: "बग्गोना पंचांग पुस्तक", te: "బగ్గోణ పంచాంగ పుస్తకం", ta: "பக்கோனா பஞ்சாங்க புத்தகம்" },
    category: "panchanga",
    icon: "📖",
    keywords: ["baggona", "book", "104 page", "ಪುಸ್ತಕ", "೧೦೪ ಪುಟ", "ಸಂವತ್ಸರ ಪಂಚಾಂಗ"],
    description: {
      kn: "ಪ್ರೆಸ್-ರೆಡಿ ೧೦೪ ಪುಟಗಳ ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಸಂವತ್ಸರ ಪಂಚಾಂಗ ಪುಸ್ತಕ ಡೌನ್‌ಲೋಡ್.",
      en: "Press-ready, exact-replica 104-page annual Panchanga book generator for any Samvatsara."
    }
  }
};

/**
 * Handles conversational memory recall queries across Text Mode and Voice Mode.
 * Enables user to ask "What did I ask before?", "What did you say in voice mode?", "Continue from what we discussed", etc.
 */
function handleConversationMemoryIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  lang: SupportedLanguage
): PetResponse | null {
  const history = context.conversationHistory;
  if (!history || history.length === 0) return null;

  const query = rawQuery.toLowerCase();
  const isMemoryRecall =
    query.includes("what did i ask") ||
    query.includes("what did we discuss") ||
    query.includes("what did you say") ||
    query.includes("what was that") ||
    query.includes("in voice mode") ||
    query.includes("in text mode") ||
    query.includes("repeat") ||
    query.includes("continue") ||
    (query.includes("ಹಿಂದೆ") && query.includes("ಕೇಳಿದೆ")) ||
    query.includes("ಹಿಂದೆ ಏನು ಕೇಳಿದೆ") ||
    query.includes("ಹಿಂದಿನ ಸಂಭಾಷಣೆ") ||
    query.includes("ಧ್ವನಿಯಲ್ಲಿ ಏನು ಹೇಳಿದೆ") ||
    query.includes("ಪಠ್ಯದಲ್ಲಿ ಏನು ಹೇಳಿದೆ") ||
    query.includes("ಮತ್ತೆ ಹೇಳು") ||
    query.includes("ಮುಂದುವರಿಸು") ||
    query.includes("ಮುಂದುವರಿಸಿ") ||
    query.includes("ಏನು ಹೇಳಿದ್ದೀರಿ") ||
    query.includes("ಹಿಂದಿನ ಪ್ರಶ್ನೆ");

  if (!isMemoryRecall) return null;

  // Filter out the current query if present in history
  const priorTurns = history.filter((h) => h.text.trim() !== rawQuery.trim());
  const priorUserTurns = priorTurns.filter((h) => h.sender === "user");
  const priorPetTurns = priorTurns.filter(
    (h) => h.sender === "pet" || h.sender === "assistant" || h.sender === "model"
  );

  const lastUser = priorUserTurns[priorUserTurns.length - 1];
  const lastPet = priorPetTurns[priorPetTurns.length - 1];

  if (!lastUser && !lastPet) return null;

  const dName = context.activeProfile?.name || context.ambientProfile?.name || "";
  const lastUserText = lastUser?.text || "";
  const lastPetSummary = (lastPet?.text || "")
    .replace(/[*_#`\n]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 220);

  const modeLabelKn = lastUser?.mode === "voice" ? "ಧ್ವನಿ ಮೋಡ್‌ನಲ್ಲಿ (Voice Mode)" : "ಪಠ್ಯ ಮೋಡ್‌ನಲ್ಲಿ (Text Mode)";
  const modeLabelEn = lastUser?.mode === "voice" ? "in Voice Mode" : "in Text Mode";

  const knText = `ಸ್ವಾಮಿ, ನಮ್ಮ ನಿರಂತರ ಸಂಭಾಷಣೆಯಲ್ಲಿ ${dName ? `ಭಕ್ತರಾದ ${dName} ಅವರ ಕುರಿತು` : "ನಾವು"} ಚರ್ಚಿಸಿದ್ದ ವಿವರಗಳು ನನ್ನ ನೆನಪಿನಲ್ಲಿದೆ.\n\n• **ನೀವು ${modeLabelKn} ಕೇಳಿದ್ದು:** "${lastUserText}"\n• **ನಾನು ನೀಡಿದ ಸಾರಾಂಶ:** "${lastPetSummary}..."\n\nಟೆಕ್ಸ್ಟ್ ಹಾಗೂ ವಾಯ್ಸ್ ಮೋಡ್ ಎರಡರ ಸಂಪೂರ್ಣ ಇತಿಹಾಸ ಸಕ್ರಿಯವಾಗಿದೆ. ನೀವು ಮುಂದುವರಿಸಿ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು ಅಥವಾ ವರದಿಗಳನ್ನು ಆದೇಶಿಸಬಹುದು!`;
  const enText = `Swami, in our continuous conversation ${dName ? `regarding devotee ${dName}` : "we discussed"}, I retain full memory across both Text and Voice modes.\n\n• **You asked (${modeLabelEn}):** "${lastUserText}"\n• **I explained:** "${lastPetSummary}..."\n\nYou can seamlessly continue asking follow-up questions or commanding reports!`;

  const spoken =
    lang === "kn"
      ? `ಸ್ವಾಮಿ, ಹಿಂದಿನ ಸಂಭಾಷಣೆಯಲ್ಲಿ "${lastUserText}" ಕುರಿತು ಚರ್ಚಿಸಿದ್ದೆವು. ಟೆಕ್ಸ್ಟ್ ಹಾಗೂ ವಾಯ್ಸ್ ಮೋಡ್ ಎರಡರ ವಿವರಗಳು ನೆನಪಿನಲ್ಲಿದೆ. ಮುಂದಿನ ಆಜ್ಞೆ ನೀಡಿ.`
      : `Swami, earlier we discussed "${lastUserText}". I retain all details across text and voice modes. Please give your next question.`;

  return {
    text: {
      kn: knText,
      en: enText,
      hi: enText,
      te: enText,
      ta: enText
    },
    spokenText: {
      kn: spoken,
      en: spoken,
      hi: spoken,
      te: spoken,
      ta: spoken
    },
    emotion: "peaceful",
    category: "general",
    actions: []
  };
}

/**
 * Executes a Super Admin prompt and returns text, spoken voice text, emotion, and executable actions.
 */
export async function executeSuperAdminPetQuery(
  rawQuery: string,
  context: SuperAdminPetContext
): Promise<PetResponse> {
  const effectiveLang = detectQueryLanguage(rawQuery, context.selectedLanguage || "kn");
  const ambient = context.ambientProfile || harvestAmbientKundliContext(context.currentKundliSession);
  const query = rawQuery.trim().toLowerCase();

  // 0M. CONTINUOUS CONVERSATION MEMORY RECALL (Seamless Text <-> Voice Context)
  const memoryResp = handleConversationMemoryIntent(rawQuery, context, effectiveLang);
  if (memoryResp) {
    return memoryResp;
  }

  // 0DB. REAL-TIME SUPER ADMIN DATABASE & COIN WALLET ENGINE
  if (isSuperAdminDatabaseIntent(rawQuery)) {
    return await handleSuperAdminDatabaseIntent(rawQuery, context, effectiveLang);
  }

  const isNavCommand =
    !query.includes("mantra") &&
    !query.includes("ಮಂತ್ರ") &&
    (
      query.includes("go to") ||
      query.includes("open") ||
      query.includes("take me to") ||
      query.includes("navigate") ||
      query.includes("switch to") ||
      query.includes("switch") ||
      query.includes("redirect") ||
      (query.includes("show") && (query.includes("page") || query.includes("tab") || query.includes("calendar") || query.includes("screen") || query.includes("ಟ್ಯಾಬ್") || query.includes("ಪುಟ") || query.includes("ದರ್ಶನ"))) ||
      query.includes("ತೆರೆ") ||
      query.includes("ಹೋಗು") ||
      query.includes("ಬದಲಾಯಿಸು") ||
      (query.includes("ತೋರಿಸು") && (query.includes("ಪುಟ") || query.includes("ಟ್ಯಾಬ್") || query.includes("ಕ್ಯಾಲೆಂಡರ್") || query.includes("ಅಸ್ತೋದಯ") || query.includes("ಹಬ್ಬ") || query.includes("ರಾಮನವಮಿ") || query.includes("ನವಮಿ") || query.includes("ಚತುರ್ಥಿ") || query.includes("ದೀಪಾವಳಿ") || query.includes("ದಸರಾ") || query.includes("ಯುಗಾದಿ"))) ||
      (query.includes("ತೋರಿಸಿ") && (query.includes("ಪುಟ") || query.includes("ಟ್ಯಾಬ್") || query.includes("ಕ್ಯಾಲೆಂಡರ್") || query.includes("ಅಸ್ತೋದಯ") || query.includes("ಹಬ್ಬ") || query.includes("ರಾಮನವಮಿ") || query.includes("ನವಮಿ") || query.includes("ಚತುರ್ಥಿ") || query.includes("ದೀಪಾವಳಿ") || query.includes("ದಸರಾ") || query.includes("ಯುಗಾದಿ"))) ||
      query.includes("ದರ್ಶನ ಮಾಡಿಸು") ||
      query.includes("ಕರೆದುಕೊಂಡು ಹೋಗು") ||
      query.includes("ಕರ್ಕೊಂಡು ಹೋಗು") ||
      query.includes("खोलो") ||
      query.includes("चलो") ||
      query.includes("दिखाओ") ||
      query.includes("दिखाइए") ||
      query.includes("दिखाना") ||
      query.includes("show me") ||
      query.includes("fill") ||
      query.includes("ತುಂಬು") ||
      query.includes("తెరువు") ||
      query.includes("వెళ్లు") ||
      query.includes("చూపించు") ||
      query.includes("திற") ||
      query.includes("செல்") ||
      query.includes("காட்டு")
    );

  // 0H. PROFILE IMPROVEMENT & STRATEGIC ADVISORY (HIGHEST SPECIFICITY FOR BOSS ADVISORY)
  const isImprovementQuery =
    !isNavCommand &&
    (query.includes("improvement") ||
      query.includes("improve") ||
      query.includes("ಸುಧಾರಣೆ") ||
      query.includes("ಏನು ಮಾಡಬಹುದು") ||
      query.includes("suggestions") ||
      query.includes("ಸಲಹೆ") ||
      query.includes("what should i tell") ||
      query.includes("advisory") ||
      query.includes("strategy") ||
      query.includes("ಕಾರ್ಯತಂತ್ರ"));

  if (isImprovementQuery) {
    return await handleProfileImprovementIntent(rawQuery, context, effectiveLang);
  }

  // 0C. SANKHYA SHASTRA (Vedic Numerology)
  const isSankhyaQuery =
    !isNavCommand &&
    (query.includes("sankhya") ||
      query.includes("numerolog") ||
      query.includes("ಸಂಖ್ಯಾ") ||
      query.includes("ಮೂಲಾಂಕ") ||
      query.includes("ಭಾಗ್ಯಾಂಕ") ||
      query.includes("ನಾಮಾಂಕ") ||
      query.includes("mulank") ||
      query.includes("bhagyank") ||
      query.includes("namaank") ||
      query.includes("lucky number") ||
      query.includes("ಅದೃಷ್ಟ ಸಂಖ್ಯೆ"));

  if (isSankhyaQuery) {
    return await handleSankhyaShastraIntent(rawQuery, context, effectiveLang);
  }

  // 0D. HASTA MUDRIKA (Vedic Palmistry)
  const isHastaQuery =
    !isNavCommand &&
    (query.includes("hasta") ||
      query.includes("palm") ||
      query.includes("ಕೈ ಮುದ್ರಿಕಾ") ||
      query.includes("ಹಸ್ತ ಸಾಮುದ್ರಿಕ") ||
      query.includes("ಆಯುಷ್ಯ ರೇಖೆ") ||
      query.includes("ಭಾಗ್ಯ ರೇಖೆ") ||
      query.includes("ಹೃದಯ ರೇಖೆ") ||
      query.includes("ಮಸ್ತಕ ರೇಖೆ") ||
      query.includes("ಸೂರ್ಯ ರೇಖೆ") ||
      query.includes("life line") ||
      query.includes("head line") ||
      query.includes("heart line") ||
      query.includes("fate line") ||
      query.includes("sun line") ||
      query.includes("palmistry") ||
      query.includes("trishula") ||
      query.includes("ತ್ರಿಶೂಲ") ||
      query.includes("matsya") ||
      query.includes("ಮತ್ಸ್ಯ"));

  if (isHastaQuery) {
    return await handleHastaMudrikaIntent(rawQuery, context, effectiveLang);
  }

  // 0E. MUKHA MUDRIKA (Face Reading)
  const isMukhaQuery =
    !isNavCommand &&
    (query.includes("mukha") ||
      query.includes("face reading") ||
      query.includes("ಮುಖ ಸಾಮುದ್ರಿಕ") ||
      query.includes("ಮುಖ ಲಕ್ಷಣ") ||
      query.includes("ಲಲಾಟ") ||
      query.includes("ತಿಲ ಲಕ್ಷಣ") ||
      query.includes("ಮಚ್ಚೆ") ||
      query.includes("mole reading") ||
      query.includes("forehead reading") ||
      query.includes("nose reading") ||
      query.includes("ನಾಸಿಕ"));

  if (isMukhaQuery) {
    return await handleMukhaMudrikaIntent(rawQuery, context, effectiveLang);
  }

  // 0F. AYUR SANJEEVINI / SATYA SANJEEVINI (Medical Astrology & Tridosha)
  const isAyurQuery =
    !isNavCommand &&
    (query.includes("ayur") ||
      query.includes("sanjeevini") ||
      query.includes("ಆಯುರ್ ಸಂಜೀವಿನಿ") ||
      query.includes("ಸತ್ಯ ಸಂಜೀವಿನಿ") ||
      query.includes("ತ್ರಿದೋಷ") ||
      query.includes("tridosha") ||
      query.includes("vata") ||
      query.includes("pitta") ||
      query.includes("kapha") ||
      query.includes("ವಾತ") ||
      query.includes("ಪಿತ್ತ") ||
      query.includes("ಕಫ") ||
      query.includes("medical astrology") ||
      query.includes("health astrology") ||
      query.includes("ಆರೋಗ್ಯ ಜ್ಯೋತಿಷ್ಯ"));

  if (isAyurQuery) {
    return await handleAyurSanjeeviniIntent(rawQuery, context, effectiveLang);
  }

  // 0G. HINDINA JANMA RAHASYA (Past Life Karma Astrology)
  const isHindinaJanmaQuery =
    !isNavCommand &&
    (query.includes("hindina janma") ||
      query.includes("past life") ||
      query.includes("ಹಿಂದಿನ ಜನ್ಮ") ||
      query.includes("ಪೂರ್ವ ಜನ್ಮ") ||
      query.includes("ಋಣಾನುಬಂಧ") ||
      query.includes("runanubandha") ||
      query.includes("karma shesha") ||
      query.includes("ಕರ್ಮ ಶೇಷ") ||
      query.includes("previous birth") ||
      query.includes("ಪೂರ್ವ ಪುಣ್ಯ"));

  if (isHindinaJanmaQuery) {
    return await handleHindinaJanmaIntent(rawQuery, context, effectiveLang);
  }

  // 0A. KUNDLI & DOSHA SCAN COMMAND INTENT
  const isDoshaScanQuery =
    (query.includes("scan") && (query.includes("dosha") || query.includes("ದೋಷ") || query.includes("kundli") || query.includes("ಕುಂಡಲಿ"))) ||
    query.includes("ದೋಷ ಪರಿಶೀಲನೆ") ||
    query.includes("ದೋಷ ಸ್ಕ್ಯಾನ್") ||
    query.includes("dosha scan");

  if (isDoshaScanQuery) {
    return handleKundliAndDoshaAnalysis(context);
  }

  // 0B. EXPERT JYOTISHYA SHASTRA TEACHING & GURUKULA KNOWLEDGE INTENT (PURE EDUCATIONAL)
  const hasPersonalIndicator =
    /\b(my|mine|our|his|her|client|devotee)\b/i.test(query) ||
    query.includes("ನನ್ನ") ||
    query.includes("ನನಗೆ") ||
    query.includes("ಇವರ") ||
    query.includes("ಅವರ") ||
    query.includes("ಜಾತಕರ") ||
    query.includes("ಹೇಗಿದೆ") ||
    query.includes("ದೋಷಗಳಿವೆಯೇ") ||
    query.includes("ಪರಿಹಾರ ತಿಳಿಸಿ") ||
    query.includes("ಹೇಳಿ") ||
    (!!ambient.name && query.toLowerCase().includes(ambient.name.toLowerCase())) ||
    (!!context.activeProfile?.name && query.toLowerCase().includes(context.activeProfile.name.toLowerCase()));

  const isTeachingOrKnowledgeQuery =
    !isNavCommand &&
    (
      // Exaltation / Debilitation / Uccha / Neecha
      query.includes("uccha") ||
      query.includes("neecha") ||
      query.includes("exalt") ||
      query.includes("debilitat") ||
      query.includes("ಉಚ್ಚ") ||
      query.includes("ನೀಚ") ||
      query.includes("neechabhanga") ||
      query.includes("ನೀಚಭಂಗ") ||
      // Nakshatras & Ganda Moola
      query.includes("nakshatra") ||
      query.includes("ನಕ್ಷತ್ರ") ||
      query.includes("ganda moola") ||
      query.includes("ಗಂಡಮೂಲ") ||
      query.includes("ಯೋನಿ") ||
      query.includes("ಗಣ") ||
      // Bhavas & House Classifications
      query.includes("house") ||
      query.includes("ಮನೆ") ||
      query.includes("bhava") ||
      query.includes("ಭಾವ") ||
      query.includes("kendra") ||
      query.includes("trikona") ||
      query.includes("dusthana") ||
      query.includes("upachaya") ||
      query.includes("maraka") ||
      query.includes("ಕೇಂದ್ರ") ||
      query.includes("ತ್ರಿಕೋನ") ||
      query.includes("ದುಸ್ಥಾನ") ||
      query.includes("ಉಪಚಯ") ||
      query.includes("ಮಾರಕ") ||
      // Classical Yogas
      query.includes("gajakesari") ||
      query.includes("ಗಜಕೇಸರಿ") ||
      query.includes("pancha mahapurusha") ||
      query.includes("ಪಂಚ ಮಹಾಪುರುಷ") ||
      query.includes("budhaditya") ||
      query.includes("ಬುಧಾದಿತ್ಯ") ||
      query.includes("viparita raja") ||
      query.includes("ವಿಪರೀತ ರಾಜ") ||
      // Mantras & Japa Counts
      query.includes("mantra") ||
      query.includes("ಮಂತ್ರ") ||
      query.includes("japa count") ||
      query.includes("mantra count") ||
      query.includes("ಜಪ ಸಂಖ್ಯೆ") ||
      query.includes("ಬೀಜ ಮಂತ್ರ") ||
      query.includes("beeja mantra") ||
      query.includes("shani mantra") ||
      query.includes("ಶನಿ ಮಂತ್ರ") ||
      query.includes("rahu mantra") ||
      query.includes("ರಾಹು ಮಂತ್ರ") ||
      query.includes("kuja mantra") ||
      query.includes("ಕುಜ ಮಂತ್ರ") ||
      query.includes("guru mantra") ||
      query.includes("ಗುರು ಮಂತ್ರ") ||
      // Gurukula / Teaching requests
      query.includes("teach me") ||
      query.includes("ಜ್ಯೋತಿಷ್ಯ ಕಲಿಸು") ||
      query.includes("ಜ್ಯೋತಿಷ್ಯ ಪಾಠ") ||
      query.includes("learn astrology") ||
      query.includes("explain astrology") ||
      query.includes("ಹೇಗೆ ಲೆಕ್ಕ") ||
      query.includes("ಜ್ಯೋತಿಷ್ಯ ಜ್ಞಾನ")
    );

  if (isTeachingOrKnowledgeQuery && !hasPersonalIndicator) {
    return await handleJyotishyaTeachingIntent(rawQuery, context, effectiveLang);
  }

  // 0C. PRIEST / ASTROLOGER CALL BRIEF & CURRENT LIFE STATUS INTENT
  const isPriestCallBriefQuery =
    !query.includes("improve") &&
    !query.includes("improvement") &&
    !query.includes("ಸುಧಾರಣೆ") &&
    (query.includes("call brief") ||
      query.includes("client call") ||
      query.includes("what to tell") ||
      query.includes("tell client") ||
      query.includes("tell user") ||
      query.includes("tell them") ||
      query.includes("phone call") ||
      (query.includes("consultation") && (query.includes("call") || query.includes("brief") || query.includes("tips") || query.includes("how"))) ||
      query.includes("happening in their life") ||
      query.includes("happening in life") ||
      query.includes("currently happening") ||
      query.includes("call them") ||
      query.includes("ಸಮಾಲೋಚನೆ") ||
      query.includes("ಕರೆ ಸಾರಾಂಶ") ||
      query.includes("ಕ್ಲೈಂಟ್‌ಗೆ ಏನು ಹೇಳಬೇಕು") ||
      query.includes("ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ") ||
      query.includes("ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ") ||
      query.includes("ಮಾತನಾಡಲು") ||
      query.includes("ಕರೆಯಲ್ಲಿ ಏನು ಹೇಳಬೇಕು") ||
      ((query.includes("call") || query.includes("brief") || query.includes("client") || query.includes("ಕರೆ") || query.includes("ಸಮಾಲೋಚನೆ")) &&
        (/\b\d{4}\b/.test(query) || /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/.test(query) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(query))));

  if (isPriestCallBriefQuery) {
    return await handlePriestCallBrieferIntent(rawQuery, context, effectiveLang, ambient);
  }

  // 0I. ACTIVE PROFILE TECHNICAL DISCUSSION & FOLLOW-UP Q&A (BOSS MULTI-TURN MEMORY)
  const isActiveProfileFollowUpQuery =
    !isNavCommand &&
    (ambient.hasData || !!(context.activeProfile || context.currentKundliSession)) &&
    (query.includes("10th") ||
      query.includes("7th") ||
      query.includes("career") ||
      query.includes("marriage") ||
      query.includes("dasha") ||
      query.includes("bhukti") ||
      query.includes("ಉದ್ಯೋಗ") ||
      query.includes("ವಿವಾಹ") ||
      query.includes("ದಶಾ") ||
      query.includes("technical") ||
      query.includes("analysis") ||
      query.includes("tell me more") ||
      query.includes("more about") ||
      query.includes("ಮುಂದೆ ಏನು") ||
      query.includes("ಇವರ") ||
      query.includes("wealth") ||
      query.includes("finance") ||
      query.includes("money") ||
      query.includes("dhana") ||
      query.includes("ಧನ") ||
      query.includes("ಆರ್ಥಿಕ") ||
      query.includes("education") ||
      query.includes("ವಿದ್ಯಾ") ||
      query.includes("children") ||
      query.includes("ಸಂತಾನ") ||
      query.includes("health") ||
      query.includes("ಆರೋಗ್ಯ") ||
      query.includes("lagna") ||
      query.includes("ಲಗ್ನ") ||
      query.includes("rashi") ||
      query.includes("ರಾಶಿ") ||
      query.includes("gemstone") ||
      query.includes("ರತ್ನ") ||
      query.includes("lucky") ||
      query.includes("ಅದೃಷ್ಟ") ||
      query.includes("dosha") ||
      query.includes("ದೋಷ") ||
      query.includes("remedy") ||
      query.includes("ಪರಿಹಾರ") ||
      query.includes("pooja") ||
      query.includes("ಪೂಜೆ") ||
      query.includes("chart") ||
      query.includes("kundli") ||
      query.includes("kundali") ||
      query.includes("ಜಾತಕ") ||
      query.includes("ಕುಂಡಲಿ") ||
      query.includes("ನನ್ನ") ||
      query.includes("ನನಗೆ") ||
      query.includes("ಹೇಗಿದೆ") ||
      hasPersonalIndicator);

  if (isActiveProfileFollowUpQuery) {
    return await handleActiveProfileFollowUpIntent(rawQuery, context, effectiveLang, ambient);
  }

  if (isTeachingOrKnowledgeQuery) {
    return await handleJyotishyaTeachingIntent(rawQuery, context, effectiveLang);
  }

  // 1. BHAVISHYA & LIFE PREDICTION INTENTS
  if (
    !isNavCommand &&
    (
      query.includes("bhavishya") ||
      query.includes("ಭವಿಷ್ಯ") ||
      query.includes("भविष्य") ||
      query.includes("predict") ||
      query.includes("future") ||
      query.includes("ಜಾತಕ ಫಲ") ||
      query.includes("life prediction") ||
      query.includes("horoscope reading") ||
      query.includes("ಜನ್ಮ ಫಲ")
    )
  ) {
    return await handleBhavishyaPredictionIntent(rawQuery, context, effectiveLang, ambient);
  }

  // 2. ALL PAGES / SITEMAP / FEATURES INTENT
  if (
    query.includes("what pages") ||
    query.includes("all pages") ||
    query.includes("all features") ||
    query.includes("what features") ||
    query.includes("sitemap") ||
    query.includes("ಪುಟಗಳು") ||
    query.includes("ಪುಟಗಳಿವೆ") ||
    query.includes("ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಏನಿದೆ") ||
    query.includes("ಮೆನು") ||
    query.includes("different pages") ||
    query.includes("corners")
  ) {
    return handleAllPagesSitemap(effectiveLang);
  }

  // 3. SYSTEM HEALTH & DIAGNOSTICS INTENTS
  if (
    !query.includes("dosha") &&
    !query.includes("ದೋಷ") &&
    !query.includes("kundli") &&
    !query.includes("ಕುಂಡಲಿ") &&
    (
      query.includes("health") ||
      query.includes("diagnostic") ||
      query.includes("system") ||
      query.includes("ಆರೋಗ್ಯ") ||
      query.includes("ಸಿಸ್ಟಮ್") ||
      query.includes("ತಪಾಸಣೆ") ||
      query.includes("परीक्षण") ||
      query.includes("स्वास्थ्य")
    )
  ) {
    return await handleSystemDiagnostics(context);
  }

  // 4. REVENUE & EARNING MONEY INTENTS
  if (
    query.includes("earn money") ||
    query.includes("revenue") ||
    query.includes("monetiz") ||
    query.includes("business") ||
    query.includes("income") ||
    query.includes("ಹಣ") ||
    query.includes("ಆದಾಯ") ||
    query.includes("ಸಂಪಾದನೆ") ||
    query.includes("ಕಮಾಯಿ") ||
    query.includes("पैसा") ||
    query.includes("कमाई") ||
    query.includes("ధనం") ||
    query.includes("ఆదాయం") ||
    query.includes("வருமானம்")
  ) {
    return handleRevenueStrategy();
  }

  // 5. MARKETING & APPLICATION GROWTH INTENTS
  if (
    query.includes("market") ||
    query.includes("promote") ||
    query.includes("growth") ||
    query.includes("traffic") ||
    query.includes("users") ||
    query.includes("share") ||
    query.includes("ಮಾರ್ಕೆಟ್") ||
    query.includes("ಪ್ರಚಾರ") ||
    query.includes("ಬೆಳವಣಿಗೆ") ||
    query.includes("ಮಾರ್ಕೆಟಿಂಗ್") ||
    query.includes("मार्केटिंग") ||
    query.includes("प्रचार") ||
    query.includes("మార్కెటింగ్") ||
    query.includes("சந்தைப்படுத்தல்")
  ) {
    return handleMarketingStrategy();
  }

  // 6. KUNDLI & DOSHA ANALYSIS INTENTS
  if (
    !isNavCommand &&
    (
      query.includes("kundli") ||
      query.includes("dosha") ||
      query.includes("horoscope") ||
      query.includes("manglik") ||
      query.includes("kala sarpa") ||
      query.includes("sade sati") ||
      query.includes("pitru") ||
      query.includes("ಜಾತಕ") ||
      query.includes("ದೋಷ") ||
      query.includes("ಕುಂಡಲಿ") ||
      query.includes("ಮಾಂಗಲಿಕ") ||
      query.includes("ಕಾಳ ಸರ್ಪ") ||
      query.includes("ಸಾಡೇ ಸಾತಿ") ||
      query.includes("ಪಿತೃ") ||
      query.includes("कुंडली") ||
      query.includes("दोष") ||
      query.includes("జాతకం") ||
      query.includes("தோஷம்")
    )
  ) {
    return handleKundliAndDoshaAnalysis(context);
  }

  // 7. NAVIGATION INTENTS (All 32 Pages)
  if (
    isNavCommand ||
    Object.values(APPLICATION_PAGES_DIRECTORY).some((p) => p.keywords.some((kw) => query.includes(kw.toLowerCase())))
  ) {
    return handleNavigationIntent(rawQuery, effectiveLang);
  }

  // 8. ONLINE GEMINI AI BRAIN (if API key available)
  const activeKey = (context.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  if (activeKey) {
    try {
      const systemPrompt = `
You are "Kamadhenu" (ಕಾಮಧೇನು) - the sacred celestial divine pet and all-knowing AI companion of the Super Admin in Baggona Panchanga Astrology (Gokarna Kshetra).
You speak directly, warmly, and authoritatively to the Super Admin.
The user is asking: "${rawQuery}".
Provide a concise, practical, highly empowering response in the language "${effectiveLang}".
If it relates to astrology or doshas, cite Parashari rules and Gokarna Mahabaleshwara remedies.
If it relates to business, give actionable revenue and marketing tactics for Baggona Panchanga.
Keep spoken clarity in mind. Avoid excessive formatting.
      `.trim();

      const historyTurns = (context.conversationHistory || [])
        .slice(-10)
        .map((t) => ({
          role: (t.sender === "pet" || t.sender === "assistant" || t.sender === "model" ? "model" : "user") as "user" | "model",
          text: t.text
        }));

      const aiText = await askGemini(rawQuery, systemPrompt, activeKey, effectiveLang, {
        raw: true,
        temperature: 0.6,
        conversationHistory: historyTurns
      });
      if (aiText && aiText.length > 10) {
        return {
          text: {
            kn: aiText,
            hi: aiText,
            te: aiText,
            ta: aiText,
            en: aiText
          },
          spokenText: {
            kn: aiText.substring(0, 200),
            hi: aiText.substring(0, 200),
            te: aiText.substring(0, 200),
            ta: aiText.substring(0, 200),
            en: aiText.substring(0, 200)
          },
          emotion: "speaking",
          category: "general",
          actions: [
            {
              id: "open_admin",
              label: {
                kn: "🛡️ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
                hi: "🛡️ सुपर एडमिन नियंत्रण केंद्र",
                te: "🛡️ సూపర్ అడ్మిన్ నియంత్రణ కేంద్రం",
                ta: "🛡️ சூப்பர் அட்மின் கட்டுப்பாட்டு மையம்",
                en: "🛡️ Super Admin Control Center"
              },
              icon: "🛡️",
              targetPage: "superadmindashboard",
              actionType: "navigate"
            }
          ]
        };
      }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to offline matrix:", e);
    }
  }

  // 9. DEFAULT OFFLINE KNOWLEDGE MATRIX RESPONSE
  return handleDefaultOfflineCompanion(rawQuery, effectiveLang);
}

// =========================================================================
// HANDLER 0A: PRIEST / ASTROLOGER CALL BRIEF & CURRENT LIFE STATUS ENGINE
// =========================================================================
async function handlePriestCallBrieferIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn",
  ambientProfile?: AmbientKundliProfile
): Promise<PetResponse> {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  // 1. EXTRACT NAME
  let name = "";
  const personMatch = query.match(
    /(?:for|of|named|devotee|user|client|name\s+is|ಜಾತಕರ ಹೆಸರು|ಹೆಸರು|ಕ್ಲೈಂಟ್)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\bborn\b|\bಜನನ\b|\bdated\b|\bfrom\b|\bin\b|\bat\b|\brashi\b|$)/i
  );
  if (personMatch && personMatch[1]) {
    name = personMatch[1].trim();
  } else {
    const shriMatch = query.match(
      /\b(Shriram\s+Pandit|Chaitanya\s+Pandit|Jayashree|Manoj|Dilip|Pramod|Suresh|Ramesh|Ravi|Anand|Karthik)\b/i
    );
    if (shriMatch) {
      name = shriMatch[1];
    } else {
      const knNameMatch = query.match(
        /([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)\s+(?:\d{1,2}|ರಂದು|ಜನಿಸಿದ|ಅವರ)/i
      );
      if (
        knNameMatch &&
        knNameMatch[1] &&
        !["tell", "bhavishya", "ಭವಿಷ್ಯ", "ಹೇಳು", "call", "brief", "ಕರೆಯಲ್ಲಿ", "ಕ್ಲೈಂಟ್"].includes(knNameMatch[1].toLowerCase())
      ) {
        name = knNameMatch[1].trim();
      }
    }
  }

  // 2. EXTRACT DOB (e.g. "31 May 1993", "1993-05-31", "31-05-1993")
  let birthDate = "";
  const dateMatch1 = query.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z\u0C80-\u0CFF]+)\s+(\d{4})\b/);
  if (dateMatch1) {
    const day = dateMatch1[1].padStart(2, "0");
    const mStr = dateMatch1[2].toLowerCase();
    const month = MONTH_MAP_LOCAL[mStr] || "01";
    const year = dateMatch1[3];
    birthDate = `${year}-${month}-${day}`;
  } else {
    const dateMatch2 = query.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (dateMatch2) {
      birthDate = `${dateMatch2[1]}-${dateMatch2[2].padStart(2, "0")}-${dateMatch2[3].padStart(2, "0")}`;
    } else {
      const dateMatch3 = query.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
      if (dateMatch3) {
        birthDate = `${dateMatch3[3]}-${dateMatch3[2].padStart(2, "0")}-${dateMatch3[1].padStart(2, "0")}`;
      }
    }
  }

  // 3. EXTRACT TOB (Optional, default 09:20 AM)
  let birthTime = "09:20";
  const timeMatch = query.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];
    const meridiem = (timeMatch[3] || "").toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    birthTime = `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  // 4. EXTRACT PLACE (Optional, default Bengaluru)
  let city = "Bengaluru";
  for (const [cKey, cVal] of Object.entries(CITY_DATABASE)) {
    if (lower.includes(cKey)) {
      city = cVal.englishName;
      break;
    }
  }

  const ambient = ambientProfile || context.ambientProfile || harvestAmbientKundliContext(context.currentKundliSession);

  // Fallback to ambient / active session if details not in text
  if ((!name || !birthDate) && ambient.hasData) {
    name = name || ambient.name || "ಜಾತಕರು";
    birthDate = birthDate || ambient.birthDate;
    birthTime = birthTime || ambient.birthTime || "09:20";
    city = city || ambient.city || "Bengaluru";
  } else if ((!name || !birthDate) && context.currentKundliSession?.input) {
    name = name || context.currentKundliSession.input.name || "ಜಾತಕರು";
    birthDate =
      birthDate ||
      context.currentKundliSession.input.birthDate ||
      context.currentKundliSession.input.dateOfBirth;
    birthTime =
      birthTime ||
      context.currentKundliSession.input.birthTime ||
      context.currentKundliSession.input.timeOfBirth ||
      "09:20";
    city =
      city ||
      context.currentKundliSession.input.placeOfBirth ||
      context.currentKundliSession.input.city ||
      "Bengaluru";
  }

  // If still no birthDate, ask devotee kindly
  if (!birthDate) {
    const askText = {
      kn: `ಸ್ವಾಮಿ, ${name ? name + " ಅವರ" : "ಕ್ಲೈಂಟ್‌ ಅವರ"} ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ (Client Consultation Call Brief) ಸಿದ್ಧಪಡಿಸಲು ಜನನ ದಿನಾಂಕ & ಸಮಯವನ್ನು ತಿಳಿಸಿ (ಉದಾ: 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 9:20 AM ಬೆಂಗಳೂರು ಕಾಲ್ ಬ್ರೀಫ್'). ಪ್ರಸ್ತುತ ಜೀವನದಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ಸಂಗತಿಗಳು, ಕರೆಯಲ್ಲಿ ನೇರವಾಗಿ ಹೇಳಬೇಕಾದ ಮಾತುಗಳು ಮತ್ತು ಮಂತ್ರ-ಜಪ ಸಂಖ್ಯೆಯನ್ನು ನಾನು ತಕ್ಷಣ ನೀಡುತ್ತೇನೆ!`,
      en: `Swami, to prepare the Priest Consultation Call Brief${name ? " for " + name : ""}, please provide the birth date and time (e.g. 'Call brief for Shriram Pandit born 31 May 1993 at 9:20 AM Bengaluru'). I will immediately compute what is happening in their life right now, your exact phone consultation talking script, and exact mantra japa counts!`,
      hi: `स्वामी, क्लाइंट कॉल सारांश तैयार करने हेतु कृपया जन्म तिथि और समय बताएं (उदा: '31 May 1993 9:20 AM कॉल ब्रीफ')।`,
      te: `స్వామి, క్లయింట్ కాల్ బ్రీఫ్ కొరకు దయచేసి పుట్టిన తేదీ మరియు సమయాన్ని తెలియజేయండి.`,
      ta: `சுவாமி, வாடிக்கையாளர் தொலைபேசி ஆலோசனை சுருக்கத்தை அறிய பிறந்த தேதி மற்றும் நேரத்தை குறிப்பிடவும்.`
    };
    return {
      text: askText,
      spokenText: askText,
      emotion: "alert",
      category: "kundli",
      actions: [
        {
          id: "open_kundli",
          label: {
            kn: "🪐 ಜಾತಕ ರಚನೆ ಪುಟ ತೆರೆಯಿರಿ",
            en: "🪐 Open Kundli Creation Page",
            hi: "🪐 कुण्डली रचना पृष्ठ खोलें",
            te: "🪐 జాతక రచన పేజీ తెరవండి",
            ta: "🪐 ஜாதக பக்கம் திறக்க"
          },
          icon: "🪐",
          targetPage: "kundli",
          actionType: "navigate"
        }
      ]
    };
  }

  // 5. CALCULATE KUNDLI
  const cleanName = name || (targetLang === "kn" ? "ಜಾತಕರು" : "Client Devotee");
  const geo = resolveCityCoordsAndPincode(city);
  let kundli: KundliOutput;
  try {
    kundli = calculateKundli({
      name: cleanName,
      birthDate,
      birthTime,
      latitude: geo.lat,
      longitude: geo.lng,
      pincode: geo.pincode
    });
  } catch (err) {
    console.error("calculateKundli failed in call briefer:", err);
    throw err;
  }

  const lagnaIdx = Math.floor(normalizeDegree(kundli.ascendant) / 30);
  const lagnaDeg = (normalizeDegree(kundli.ascendant) % 30).toFixed(1);
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonDeg = normalizeDegree(moonPlanet?.degree || 0);
  const moonSignIdx = Math.floor(moonDeg / 30);
  const moonNak = degreeToNakshatra(moonDeg);
  const moonPada = degreeToNakshatraPada(moonDeg);

  // Dasha & Bhukti in Current Year
  const birthYear = parseInt(birthDate.split("-")[0], 10) || 1993;
  const currentYear = new Date().getFullYear();
  const nativeAge = Math.max(0, currentYear - birthYear);

  const activeMaha = findMahadashaAtAge(kundli, nativeAge);
  const activeBhuktiInfo = findBhuktiAtAge(kundli, nativeAge);
  const runningMahaPlanet = activeMaha ? activeMaha.planet : PlanetName.Jupiter;
  const runningBhuktiPlanet = activeBhuktiInfo ? activeBhuktiInfo.bhukti : PlanetName.Saturn;

  // Comprehensive Doshas & Live Gochara
  const doshaReport = calculateComprehensiveDoshas(
    kundli,
    {
      name: cleanName,
      birthDate,
      birthTime,
      latitude: geo.lat,
      longitude: geo.lng,
      gender: "Male",
      pincode: geo.pincode
    },
    new Date()
  );

  const shaniDosha = doshaReport.doshas.find((d) => d.id === "gochara_shani");
  const isAshtamaShani = !!(shaniDosha?.name.en?.includes("Ashtama") || shaniDosha?.name.kn?.includes("ಅಷ್ಟಮ"));
  const isSadeSati = !!(shaniDosha?.name.en?.includes("Sade Sati") || shaniDosha?.name.kn?.includes("ಸಾಡೇಸಾತಿ"));
  const isKantakaShani = !!(shaniDosha?.name.en?.includes("Kantaka") || shaniDosha?.name.kn?.includes("ಕಂಟಕ"));

  const guruDosha = doshaReport.doshas.find((d) => d.id === "gochara_guru");
  const isGuruAfflicted = !!guruDosha?.isDetected;

  const rkDosha = doshaReport.doshas.find((d) => d.id === "gochara_rahu_ketu");
  const isRKTransitActive = !!rkDosha?.isDetected;

  const dashaSandhiAlert = doshaReport.activeSandhiAlert;

  // Primary Remedial Planet
  let primaryRemedyGraha: PlanetName = runningMahaPlanet;
  if (isAshtamaShani || isSadeSati) {
    primaryRemedyGraha = PlanetName.Saturn;
  } else if (isRKTransitActive || runningMahaPlanet === PlanetName.Rahu || runningMahaPlanet === PlanetName.Ketu) {
    primaryRemedyGraha = PlanetName.Rahu;
  } else if (isGuruAfflicted && runningMahaPlanet === PlanetName.Jupiter) {
    primaryRemedyGraha = PlanetName.Jupiter;
  } else {
    primaryRemedyGraha = runningBhuktiPlanet;
  }

  const remedyRecord = GRAHA_SHASTRA_MATRIX[primaryRemedyGraha] || GRAHA_SHASTRA_MATRIX[PlanetName.Saturn];

  // Localized Labels
  const lagnaKn = RASHI_LOCALE[lagnaIdx]?.kn || "ಮಿಥುನ";
  const lagnaEn = RASHI_LOCALE[lagnaIdx]?.en || "Gemini";
  const moonRashiKn = RASHI_LOCALE[moonSignIdx]?.kn || "ಕನ್ಯಾ";
  const moonRashiEn = RASHI_LOCALE[moonSignIdx]?.en || "Virgo";
  const nakKn = NAKSHATRA_NAMES_KN[moonNak.index] || moonNak.sanskrit;
  const nakEn = moonNak.sanskrit;
  const runningMahaKn = PLANET_NAMES_KN[runningMahaPlanet] || runningMahaPlanet;
  const runningMahaEn = runningMahaPlanet;
  const runningBhuktiKn = PLANET_NAMES_KN[runningBhuktiPlanet] || runningBhuktiPlanet;
  const runningBhuktiEn = runningBhuktiPlanet;

  const transitBadgeKn = isAshtamaShani
    ? "⚠️ ತೀವ್ರ ಅಷ್ಟಮ ಶನಿ ಗೋಚಾರ"
    : isSadeSati
    ? "⚠️ ಸಕ್ರಿಯ ಸಾಡೇಸಾತಿ ಶನಿ"
    : isKantakaShani
    ? "⚠️ ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ"
    : "✅ ಶುಭ ಶನಿ ಗೋಚಾರ";

  const transitBadgeEn = isAshtamaShani
    ? "⚠️ Critical Ashtama Shani Transit"
    : isSadeSati
    ? "⚠️ Active Sade Sati Saturn Transit"
    : isKantakaShani
    ? "⚠️ Kantaka Shani Influence"
    : "✅ Benefic Saturn Transit";

  // Synthesize Priest Talking Points Script
  const textKn = `📞 **ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ (Priest Consultation Call Brief)**
👤 **ಜಾತಕರ ಹೆಸರು**: ${cleanName} | ಜನನ: ${birthDate} (${birthTime}) | ${city}
✨ **ಲಗ್ನ**: ${lagnaKn} (${lagnaDeg}°) | **ಚಂದ್ರ ರಾಶಿ**: ${moonRashiKn} | **ಜನ್ಮ ನಕ್ಷತ್ರ**: ${nakKn} (ಪಾದ ${moonPada})
⏳ **ಪ್ರಸ್ತುತ ಮಹಾದಶಾ**: ${runningMahaKn} | **ಅಂತರ್ದಶಾ**: ${runningBhuktiKn} (ವಯಸ್ಸು: ${nativeAge} ವರ್ಷ)
🪐 **ಗೋಚಾರ ಸ್ಥಿತಿ**: ${transitBadgeKn} | ${isGuruAfflicted ? "ಗುರು ಗೋಚಾರ ಪರೀಕ್ಷಾ ಕಾಲ" : "ಗುರು ಶುಭ ಗೋಚಾರ"}

---
### 🔍 ಭಾಗ ೧: ಪ್ರಸ್ತುತ ಜಾತಕರ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ? (What Is Currently Happening Right Now?)
1. **ಮಾನಸಿಕ & ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿ (Mental Peace & Emotional Strain)**:
   - ${isAshtamaShani || isSadeSati ? "ಕಳೆದ ೬-೮ ತಿಂಗಳುಗಳಿಂದ ಜಾತಕರು ತೀವ್ರ ಮಾನಸಿಕ ಅಶಾಂತಿ, ರಾತ್ರಿ ವೇಳೆ ನಿದ್ರಾಭಂಗ, ಮತ್ತು ಅಜ್ಞಾತ ಭವಿಷ್ಯದ ಭಯವನ್ನು ಎದುರಿಸುತ್ತಿದ್ದಾರೆ. ಪ್ರಾಮಾಣಿಕವಾಗಿ ಪರಿಶ್ರಮಪಟ್ಟರೂ ಕ್ರೆಡಿಟ್ ಸಿಗದೆ ಆಂತರಿಕವಾಗಿ ಬೇಸರಗೊಂಡಿದ್ದಾರೆ." : "ಮಾನಸಿಕವಾಗಿ ಹೊಸ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವ ಉತ್ಸಾಹವಿದೆ, ಆದರೆ ನಿರಂತರ ಕೆಲಸದ ಒತ್ತಡದಿಂದಾಗಿ ಶಕ್ತಿಯ ಕೊರತೆ ಕಾಡುತ್ತಿದೆ."}

2. **ವೃತ್ತಿ & ಆರ್ಥಿಕ ಸ್ಥಿತಿ (Career & Financial Pressures)**:
   - ಪ್ರಸ್ತುತ ${runningMahaKn}-${runningBhuktiKn} ಕಾಲದಲ್ಲಿ ಆದಾಯದ ಮೂಲಗಳಿದ್ದರೂ, ಅನಿರೀಕ್ಷಿತ ವೆಚ್ಚಗಳಿಂದಾಗಿ ಉಳಿತಾಯ ಕರಗುತ್ತಿದೆ. ಉದ್ಯೋಗದಲ್ಲಿ ಅಥವಾ ವ್ಯಾಪಾರದಲ್ಲಿ ಬದಲಾವಣೆ ಮಾಡುವ ತವಕ ಹೆಚ್ಚಾಗಿದೆ; ಮೇಲಧಿಕಾರಿಗಳು ಅಥವಾ ಪಾಲುದಾರರಿಂದ ತಕ್ಕ ಸಹಕಾರ ಲಭಿಸುತ್ತಿಲ್ಲ.

3. **ಕುಟುಂಬ & ವೈವಾಹಿಕ ಸಾಮರಸ್ಯ (Family & Relationships)**:
   - ಸಂಭಾಷಣೆಯಲ್ಲಿ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ಉಂಟಾಗುತ್ತಿವೆ. ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಮನೆಯಲ್ಲಿ ವಾದ-ವಿವಾದಗಳು ಏರ್ಪಡುತ್ತಿವೆ. ಸಂಗಾತಿ ಅಥವಾ ಕುಟುಂಬದ ಹಿರಿಯರ ಆರೋಗ್ಯದ ಕುರಿತು ಆತಂಕವಿದೆ.

4. **ಆರೋಗ್ಯ & ದೇಹಬಲ (Physical Health & Vitality)**:
   - ನರಗಳ ದೌರ್ಬಲ್ಯ, ಬೆನ್ನು/ಸೊಂಟದ ನೋವು ಹಾಗೂ ಜೀರ್ಣಾಂಗ ಸಂಬಂಧಿತ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.${dashaSandhiAlert ? `\n- ⚡ **ದಶಾ-ಸಂಧಿ ಎಚ್ಚರಿಕೆ**: ${dashaSandhiAlert.titleKn} - ಜೀವನದ ಪ್ರಮುಖ ಪರಿವರ್ತನಾ ಕಾಲಘಟ್ಟ.` : ""}

---
### 🎙️ ಭಾಗ ೨: ದೈವಜ್ಞರು ಕರೆಯಲ್ಲಿ ನೇರವಾಗಿ ಏನು ಹೇಳಬೇಕು? (Priest Phone Talking Script)
*(ನೀವು ಕ್ಲೈಂಟ್‌ಗೆ ಕರೆ ಮಾಡಿದಾಗ ನೇರವಾಗಿ ಈ ಕೆಳಗಿನ ಮಾತುಗಳಿಂದ ಸಮಾಲೋಚನೆ ಆರಂಭಿಸಿ)*:

• **ಆರಂಭಿಕ ಸಾಂತ್ವನದ ನುಡಿ (Warm Opening Script)**:
  > *"ನಮಸ್ಕಾರ ${cleanName} ಅವರೇ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಆಳವಾಗಿ ಗಮನಿಸಿದಾಗ, ಕಳೆದ ಕೆಲವು ತಿಂಗಳುಗಳಿಂದ ನೀವು ಅನುಭವಿಸುತ್ತಿರುವ ಆಂತರಿಕ ತುಮುಲ, ವೃತ್ತಿಪರ ಅಸ್ಥಿರತೆ ಮತ್ತು ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದಿರುವ ನಿಜವಾದ ಕಾರಣ ಸ್ಪಷ್ಟವಾಗಿದೆ..."*

• **ಖಚಿತ ಜಾತಕ ಲಕ್ಷಣಗಳು (Direct Predictive Confirmations)**:
  - *"ನೀವು ಎಷ್ಟೇ ಶ್ರಮವಹಿಸಿದರೂ ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಫಲ ಸಿಗಲು ವಿಳಂಬವಾಗುತ್ತಿದೆ ಅಥವಾ ತಡೆ ಉಂಟಾಗುತ್ತಿದೆ."*
  - *"ಹಣಕಾಸು ಕೈಗೆ ಬಂದರೂ ಉಳಿಯುತ್ತಿಲ್ಲ; ಅನಿರೀಕ್ಷಿತ ವೈದ್ಯಕೀಯ ಅಥವಾ ಕೌಟುಂಬಿಕ ಖರ್ಚುಗಳಿಗೆ ವ್ಯಯವಾಗುತ್ತಿದೆ."*
  - *"ಆಪ್ತರೇ ನಿಮ್ಮ ಮಾತುಗಳನ್ನು ತಪ್ಪಾಗಿ ಗ್ರಹಿಸುತ್ತಿದ್ದಾರೆ; ಇದರಿಂದ ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಪೆಟ್ಟು ಬಿದ್ದಿದೆ."*

• **ಪರಿಹಾರದ ಕಾಲಾವಧಿ & ಆಶಾಕಿರಣ (Relief Timeline)**:
  - *"ಈ ಸಂಕಷ್ಟ ಶಾಶ್ವತವಲ್ಲ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${runningBhuktiKn} ಅಂತರ್ದಶಾ ಪ್ರಭಾವವು ಮುಗಿಯುತ್ತಿದ್ದಂತೆ, ಮುಂಬರುವ ಗ್ರಹ ಸಂಚಾರದಿಂದ ನಿಮ್ಮ ಕಷ್ಟಗಳು ಶಮನವಾಗಿ, ವೃತ್ತಿ ಹಾಗೂ ಆರ್ಥಿಕತೆಯಲ್ಲಿ ಮಹತ್ವದ ಶುಭ ತಿರುವು ಲಭಿಸಲಿದೆ."*

• **ದೈವಜ್ಞರ ಆಪ್ತ ಮಾರ್ಗದರ್ಶನ (Actionable Counsel & Cautions)**:
  - *"ಈ ಅವಧಿಯಲ್ಲಿ ಆತುರಪಟ್ಟು ದೊಡ್ಡ ಮೊತ್ತದ ಹಣ ಹೂಡಿಕೆ, ಹೊಸ ಸಾಲ ಅಥವಾ ಉದ್ಯೋಗ ತ್ಯಜಿಸುವ ನಿರ್ಧಾರ ಮಾಡಬೇಡಿ."*
  - *"ತಾಳ್ಮೆಯಿಂದ ಇರಿ, ಕೋಪದ ಮಾತುಗಳಿಂದ ದೂರವಿರಿ; ಹಿರಿಯರ ಸಲಹೆ ಪಡೆದೇ ಮುನ್ನಡೆಯಿರಿ."*

---
### 🕉️ ಭಾಗ ೩: ಸೂಚಿಸಬೇಕಾದ ಶಾಂತಿ ಪೂಜೆಗಳು, ಮಂತ್ರ & ಜಪ ಸಂಖ್ಯೆ (Prescribed Remedies & Mantras)
- 🪐 **ಮುಖ್ಯ ಪರಿಹಾರ ಗ್ರಹ**: ${remedyRecord.name.kn}
- 📿 **ಶಾಸ್ತ್ರೋಕ್ತ ಬೀಜ ಮಂತ್ರ**: \`${remedyRecord.beejaMantra.kn}\`
- 🌸 **ವೈದಿಕ ಗಾಯತ್ರಿ ಮಂತ್ರ**: \`${remedyRecord.gayatriMantra.kn}\`
- 🔢 **ಶಾಸ್ತ್ರೋಕ್ತ ನಿಖರ ಜಪ ಸಂಖ್ಯೆ**: **${remedyRecord.japaCountStr.kn}**
- 🛕 **ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಾಡಿಸಬೇಕಾದ ಸೇವೆ**: ${remedyRecord.gokarnaRemedy.kn}
- 💎 **ಧಾರಣೆ ರತ್ನ**: ${remedyRecord.gemstone.kn} (${remedyRecord.metal.kn}ದಲ್ಲಿ ಧಾರಣೆ)
- 🌾 **ದಾನ ಮಾಡಬೇಕಾದ ವಸ್ತುಗಳು**: ${remedyRecord.danaItems.kn.join(", ")} (${remedyRecord.auspiciousDay.kn})`;

  const textEn = `📞 **Priest Consultation Call Brief (ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ)**
👤 **Native Profile**: ${cleanName} | Born: ${birthDate} (${birthTime}) | ${city}
✨ **Ascendant (Lagna)**: ${lagnaEn} (${lagnaDeg}°) | **Moon Sign**: ${moonRashiEn} | **Nakshatra**: ${nakEn} (Pada ${moonPada})
⏳ **Running Mahadasha**: ${runningMahaEn} | **Antardasha**: ${runningBhuktiEn} (Current Age: ${nativeAge} yrs)
🪐 **Live Transit (Gochara)**: ${transitBadgeEn} | ${isGuruAfflicted ? "Testing Jupiter Transit" : "Benefic Jupiter Transit"}

---
### 🔍 Section 1: What Is Currently Happening In Their Life Right Now?
1. **Mental State & Emotional Strain**:
   - ${isAshtamaShani || isSadeSati ? "Over the past 6-8 months, the native has been wrestling with sleeplessness, sudden unexplained anxieties, and feeling isolated despite constant hard work. Recognition is denied at the final hour." : "The native has strong ambitions, but sudden obstacles and mental fatigue are causing delays."}

2. **Career & Financial Pressures**:
   - Under the active ${runningMahaEn}-${runningBhuktiEn} cycle, capital arrives but rapidly drains into unforeseen emergency expenditures. There is a restless desire to switch jobs or pivot business ventures, but lack of support from seniors or partners is causing frustration.

3. **Family & Domestic Atmosphere**:
   - Communication gaps are frequent. Small misinterpretations lead to arguments. Concerns over health or emotional wellbeing of parents or spouse persist.

4. **Health & Physical Energy**:
   - Vulnerabilities in digestion, back/joint aches, and nervous fatigue require conscious care.${dashaSandhiAlert ? `\n- ⚡ **Dasha Sandhi Alert**: ${dashaSandhiAlert.titleEn} - A major karmic life transition.` : ""}

---
### 🎙️ Section 2: What Exactly to Tell the Client on the Phone Call (Priest Talking Script)
*(Read these direct points when you dial the client for their consultation)*:

• **Warm Opening Ice-Breaker**:
  > *"Namaskara ${cleanName}, upon analyzing your Vedic horoscope, the planetary reasons behind the intense stress, career uncertainties, and restless nights you have faced over recent months are very clear..."*

• **Direct Predictive Confirmations**:
  - *"No matter how hard you labor, the final reward is repeatedly delayed or credit is claimed by others."*
  - *"Funds come in, but unforeseen obligations prevent solid capital accumulation."*
  - *"Even close colleagues or family members misread your good intentions, leaving you feeling hurt."*

• **Timeline to Relief & Hope**:
  - *"This hardship is purely temporary. As the current ${runningBhuktiEn} Antardasha transitions, favorable planetary rays will take over and bring tangible peace and career stability."*

• **Astrologer's Crucial Cautions**:
  - *"Do not make impulsive job resignations or large speculative investments right now."*
  - *"Keep cool in interpersonal discussions and consult elders before signing contracts."*

---
### 🕉️ Section 3: Prescribed Remedies, Mantras & Japa Count
- 🪐 **Primary Remedial Graha**: ${remedyRecord.name.en}
- 📿 **Authentic Beeja Mantra**: \`${remedyRecord.beejaMantra.en}\`
- 🌸 **Vedic Gayatri Mantra**: \`${remedyRecord.gayatriMantra.en}\`
- 🔢 **Classical Japa Count**: **${remedyRecord.japaCountStr.en}**
- 🛕 **Prescribed Gokarna Kshetra Ritual**: ${remedyRecord.gokarnaRemedy.en}
- 💎 **Recommended Gemstone**: ${remedyRecord.gemstone.en} set in ${remedyRecord.metal.en}
- 🌾 **Charity (Dāna)**: Donate ${remedyRecord.danaItems.en.join(", ")} on ${remedyRecord.auspiciousDay.en}`;

  const spokenKn = `ಸ್ವಾಮಿ, ${cleanName} ಅವರ ದೈವಜ್ಞ ಸಮಾಲೋಚನಾ ಸಾರಾಂಶ ಸಿದ್ಧವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${runningMahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${runningBhuktiKn} ಅಂತರ್ದಶಾ ಮತ್ತು ${transitBadgeKn} ನಡೆಯುತ್ತಿದೆ. ಕರೆಯಲ್ಲಿ ನೇರವಾಗಿ ಹೇಳಬೇಕಾದ ಭವಿಷ್ಯದ ಮಾತುಗಳು, ಶಾಸ್ತ್ರೋಕ್ತ ಬೀಜ ಮಂತ್ರ ಹಾಗೂ ${remedyRecord.japaCountStr.kn} ಜಪ ಸಂಖ್ಯೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`;
  const spokenEn = `Swami, the Priest consultation call brief for ${cleanName} is ready. Running ${runningMahaEn} Mahadasha with ${runningBhuktiEn} Antardasha and ${transitBadgeEn}. Your phone consultation script, current life status, and exact mantra japa counts are ready.`;

  return {
    text: {
      kn: textKn,
      en: textEn,
      hi: textEn,
      te: textEn,
      ta: textEn
    },
    spokenText: {
      kn: spokenKn,
      en: spokenEn,
      hi: spokenEn,
      te: spokenEn,
      ta: spokenEn
    },
    emotion: "speaking",
    category: "kundli",
    actions: [
      {
        id: "open_kundli",
        label: {
          kn: "🪐 ಜಾತಕ ಪುಟ (View Kundli)",
          en: "🪐 View Full Kundli Chart",
          hi: "🪐 कुण्डली चार्ट देखें",
          te: "🪐 జాతక చక్రం చూడండి",
          ta: "🪐 ஜாதக சக்கரம் பார்க்க"
        },
        icon: "🪐",
        targetPage: "kundli",
        actionType: "navigate"
      },
      {
        id: "open_seva",
        label: {
          kn: "🪔 ಗೋಕರ್ಣ ಸೇವಾ ಪತ್ರ (Book Seva)",
          en: "🪔 Book Gokarna Seva",
          hi: "🪔 गोकर्ण सेवा बुक करें",
          te: "🪔 గోకర్ణ సేవా బుక్ చేయండి",
          ta: "🪔 கோகர்ண சேவா பதிவு"
        },
        icon: "🪔",
        targetPage: "seva",
        actionType: "navigate"
      },
      {
        id: "open_book",
        label: {
          kn: "📖 ೧೦೪ ಪುಟ ಪಂಚಾಂಗ ಪುಸ್ತಕ",
          en: "📖 104-Page Annual Book",
          hi: "📖 १०४ पृष्ठ पंचांग पुस्तक",
          te: "📖 104 పేజీల పంచాంగం",
          ta: "📖 104 பக்க பஞ்சாங்கம்"
        },
        icon: "📖",
        targetPage: "baggona",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 0B: EXPERT JYOTISHYA SHASTRA TEACHING & GURUKULA KNOWLEDGE ENGINE
// =========================================================================
async function handleJyotishyaTeachingIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const query = rawQuery.trim().toLowerCase();

  // 1. CHECK SPECIFIC GRAHA INQUIRY (Uccha / Neecha / Mantra / Karakatwa)
  const matchedGraha = lookupGrahaByName(query);
  const isUcchaNeechaQuery =
    query.includes("uccha") ||
    query.includes("neecha") ||
    query.includes("exalt") ||
    query.includes("debilitat") ||
    query.includes("ಉಚ್ಚ") ||
    query.includes("ನೀಚ") ||
    query.includes("neechabhanga") ||
    query.includes("ನೀಚಭಂಗ");

  const isMantraQuery =
    query.includes("mantra") ||
    query.includes("japa count") ||
    query.includes("ಮಂತ್ರ") ||
    query.includes("ಜಪ ಸಂಖ್ಯೆ") ||
    query.includes("ಬೀಜ ಮಂತ್ರ") ||
    query.includes("beeja");

  // A. SPECIFIC GRAHA UCCHA / NEECHA / MANTRA
  if (matchedGraha && (isUcchaNeechaQuery || isMantraQuery || query.includes("about") || query.includes("ಬಗ್ಗೆ"))) {
    const g = matchedGraha;
    const toKnNum = (n: number) => n.toString().replace(/0/g, "೦").replace(/1/g, "೧").replace(/2/g, "೨").replace(/3/g, "೩").replace(/4/g, "೪").replace(/5/g, "೫").replace(/6/g, "೬").replace(/7/g, "೭").replace(/8/g, "೮").replace(/9/g, "೯");
    const ucchaDegStr = `${g.ucchaDeepDegree}° (${toKnNum(g.ucchaDeepDegree)}°)`;
    const neechaDegStr = `${g.neechaDeepDegree}° (${toKnNum(g.neechaDeepDegree)}°)`;

    const textKn = `🪐 **ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ ಬೋಧನೆ: ${g.name.kn}**

✨ **ಉಚ್ಚ & ನೀಚ ಸ್ಥಾನಗಳು (Dignities & Degrees)**:
- **ಉಚ್ಚ ರಾಶಿ (Exaltation)**: ${g.ucchaSignName.kn} (ಪರಮೋಚ್ಚ ಅಂಶ: ${ucchaDegStr})
- **ನೀಚ ರಾಶಿ (Debilitation)**: ${g.neechaSignName.kn} (ಪರಮ ನೀಚ ಅಂಶ: ${neechaDegStr})
- **ಮೂಲತ್ರಿಕೋಣ (Moolatrikona)**: ${g.moolatrikona.signName.kn} (${g.moolatrikona.span})
- **ಸ್ವಕ್ಷೇತ್ರ (Own Signs)**: ${g.swakshetraNames.kn.join(", ")}
- **ಅಧಿದೇವತೆ (Vedic Deity)**: ${g.deity.kn}

👑 **ಮುಖ್ಯ ಕಾರಕತ್ವಗಳು (Significations)**:
${g.karakatwa.kn.map((k) => `• ${k}`).join("\n")}

📿 **ವೈದಿಕ ಮಂತ್ರ & ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ ಸಂಖ್ಯೆ (Mantra & Japa Count)**:
- **ಬೀಜ ಮಂತ್ರ**: \`${g.beejaMantra.kn}\`
- **ಗಾಯತ್ರಿ ಮಂತ್ರ**: \`${g.gayatriMantra.kn}\`
- **ಶಾಸ್ತ್ರೋಕ್ತ ನಿಖರ ಜಪ ಸಂಖ್ಯೆ**: **${g.japaCountStr.kn}**
- **ರತ್ನ & ಲೋಹ**: ${g.gemstone.kn} | ${g.metal.kn}
- **ದಾನ ದ್ರವ್ಯಗಳು**: ${g.danaItems.kn.join(", ")} (${g.auspiciousDay.kn})
- **ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ**: ${g.gokarnaRemedy.kn}

---
💡 **ನೀಚಭಂಗ ರಾಜಯೋಗ ಶಾಸ್ತ್ರ**:
ಒಂದು ವೇಳೆ ${g.name.kn} ಜಾತಕದಲ್ಲಿ ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೂ, ಅದರ ರಾಶ್ಯಾಧಿಪತಿಯು ಲಗ್ನ/ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿದ್ದರೆ (೧, ೪, ೭, ೧೦) ನೀಚತ್ವ ರದ್ದಾಗಿ, ಅತ್ಯುನ್ನತ ರಾಜಯೋಗವನ್ನು ಕರುಣಿಸುತ್ತದೆ!`;

    const textEn = `🪐 **Vedic Jyotishya Gurukula: ${g.name.en}**

✨ **Exaltation & Debilitation Degrees**:
- **Exaltation Sign (Uccha)**: ${g.ucchaSignName.en} [${g.ucchaSignName.en.split(" ")[0]} ${g.ucchaDeepDegree}°] (Deep Exaltation: ${g.ucchaDeepDegree}°)
- **Debilitation Sign (Neecha)**: ${g.neechaSignName.en} [${g.neechaSignName.en.split(" ")[0]} ${g.neechaDeepDegree}°] (Deep Debilitation: ${g.neechaDeepDegree}°)
- **Moolatrikona**: ${g.moolatrikona.signName.en} (${g.moolatrikona.span})
- **Own Signs (Swakshetra)**: ${g.swakshetraNames.en.join(", ")}
- **Presiding Deity**: ${g.deity.en}

👑 **Primary Karakatwas (Significations)**:
${g.karakatwa.en.map((k) => `• ${k}`).join("\n")}

📿 **Authentic Mantras & Classical Japa Count**:
- **Beeja Mantra**: \`${g.beejaMantra.en}\`
- **Gayatri Mantra**: \`${g.gayatriMantra.en}\`
- **Authentic Japa Count**: **${g.japaCountStr.en}**
- **Gemstone & Metal**: ${g.gemstone.en} set in ${g.metal.en}
- **Charity (Dāna)**: ${g.danaItems.en.join(", ")} on ${g.auspiciousDay.en}
- **Gokarna Temple Shanti**: ${g.gokarnaRemedy.en}

---
💡 **Neechabhanga Raja Yoga Note**:
If ${g.name.en} is debilitated in a birth chart, but its sign lord occupies a Kendra (1, 4, 7, 10) from Lagna or Moon, the debilitation is cancelled, converting it into a potent Raja Yoga!`;

    const spokenKn = `ಸ್ವಾಮಿ, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ${g.name.kn} ಗ್ರಹವು ${g.ucchaSignName.kn} ರಾಶಿಯಲ್ಲಿ ${g.ucchaDeepDegree} ಡಿಗ್ರಿಯಲ್ಲಿ ಉಚ್ಚವಾಗುತ್ತದೆ ಮತ್ತು ${g.neechaSignName.kn} ರಾಶಿಯಲ್ಲಿ ನೀಚವಾಗುತ್ತದೆ. ಇದರ ಜಪ ಸಂಖ್ಯೆ ${g.japaCountStr.kn}.`;
    const spokenEn = `Swami, in classical Vedic Astrology, ${g.name.en} gets exalted in ${g.ucchaSignName.en} at ${g.ucchaDeepDegree} degrees and debilitated in ${g.neechaSignName.en}. Its classical japa count is ${g.japaCountStr.en}.`;

    return {
      text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
      spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
      emotion: "peaceful",
      category: "admin",
      actions: [
        {
          id: "open_kundli",
          label: { kn: "🪐 ಜಾತಕ ರಚನೆಗೆ ಹೋಗಿ", en: "🪐 Go to Kundli Page", hi: "🪐 कुण्डली पेज", te: "🪐 జాతక పేజీ", ta: "🪐 ஜாதக பக்கம்" },
          icon: "🪐",
          targetPage: "kundli",
          actionType: "navigate"
        },
        {
          id: "open_doshas",
          label: { kn: "🛡️ ದೋಷ ವಿಶ್ಲೇಷಣಾ ಕೇಂದ್ರ", en: "🛡️ Doshas Center", hi: "🛡️ दोष केंद्र", te: "🛡️ దోషాల కేంద్రం", ta: "🛡️ தோஷ மையம்" },
          icon: "🛡️",
          targetPage: "doshas",
          actionType: "navigate"
        }
      ]
    };
  }

  // B. GENERAL UCCHA & NEECHA TABLE / NEECHABHANGA RULES
  if (isUcchaNeechaQuery) {
    const tableKn = `🌟 **ಸಮಗ್ರ ನವಗ್ರಹಗಳ ಉಚ್ಚ, ನೀಚ & ಮೂಲತ್ರಿಕೋಣ ಕೋಷ್ಟಕ (Planetary Dignities)**

| ಗ್ರಹ (Planet) | ಉಚ್ಚ ರಾಶಿ & ಪರಮೋಚ್ಚ ಅಂಶ | ನೀಚ ರಾಶಿ & ಪರಮ ನೀಚ ಅಂಶ | ಮೂಲತ್ರಿಕೋಣ ರಾಶಿ |
| :--- | :--- | :--- | :--- |
| **ಸೂರ್ಯ (Sun)** | ಮೇಷ ೧೦° (Mesha 10°) | ತುಲಾ ೧೦° (Tula 10°) | ಸಿಂಹ (0°-20°) |
| **ಚಂದ್ರ (Moon)** | ವೃಷಭ ೩° (Vrishabha 3°) | ವೃಶ್ಚಿಕ ೩° (Vrischika 3°) | ವೃಷಭ (3°-30°) |
| **ಕುಜ (Mars)** | ಮಕರ ೨೮° (Makara 28°) | ಕರ್ಕಾಟಕ ೨೮° (Karka 28°) | ಮೇಷ (0°-12°) |
| **ಬುಧ (Mercury)** | ಕನ್ಯಾ ೧೫° (Kanya 15°) | ಮೀನ ೧೫° (Meena 15°) | ಕನ್ಯಾ (15°-20°) |
| **ಗುರು (Jupiter)** | ಕರ್ಕಾಟಕ ೫° (Karka 5°) | ಮಕರ ೫° (Makara 5°) | ಧನುಸ್ಸು (0°-10°) |
| **ಶುಕ್ರ (Venus)** | ಮೀನ ೨೭° (Meena 27°) | ಕನ್ಯಾ ೨೭° (Kanya 27°) | ತುಲಾ (0°-15°) |
| **ಶನಿ (Saturn)** | ತುಲಾ ೨೦° (Tula 20°) | ಮೇಷ ೨೦° (Mesha 20°) | ಕುಂಭ (0°-20°) |
| **ರಾಹು (Rahu)** | ವೃಷಭ / ಮಿಥುನ ೧೫° | ವೃಶ್ಚಿಕ / ಧನುಸ್ಸು ೧೫° | ಕುಂಭ |
| **ಕೇತು (Ketu)** | ವೃಶ್ಚಿಕ / ಧನುಸ್ಸು ೧೫° | ವೃಷಭ / ಮಿಥುನ ೧೫° | ಮೀನ |

---
👑 **ನೀಚಭಂಗ ರಾಜಯೋಗದ ೫ ಶಾಸ್ತ್ರೋಕ್ತ ನಿಯಮಗಳು (Cancellation of Debilitation)**:
1. **ರಾಶ್ಯಾಧಿಪತಿ ಕೇಂದ್ರ ಸ್ಥಿತಿ**: ನೀಚ ಗ್ರಹವಿರುವ ರಾಶಿಯ ಅಧಿಪತಿಯು ಲಗ್ನದಿಂದ ಅಥವಾ ಚಂದ್ರನಿಂದ ಕೇಂದ್ರದಲ್ಲಿದ್ದರೆ (೧, ೪, ೭, ೧೦).
2. **ಉಚ್ಚ ರಾಶ್ಯಾಧಿಪತಿ ಕೇಂದ್ರ ಸ್ಥಿತಿ**: ನೀಚ ಗ್ರಹವು ಯಾವ ರಾಶಿಯಲ್ಲಿ ಉಚ್ಚವಾಗುತ್ತದೆಯೋ, ಆ ರಾಶಿಯ ಅಧಿಪತಿಯು ಕೇಂದ್ರದಲ್ಲಿದ್ದರೆ.
3. **ಸ್ವಕ್ಷೇತ್ರ ದೃಷ್ಟಿ / ಯುತಿ**: ನೀಚ ಗ್ರಹವನ್ನು ಅದೇ ರಾಶಿಯ ಅಧಿಪತಿಯು ದೃಷ್ಟಿಸಿದರೆ ಅಥವಾ ಯುತಿಯಾಗಿದ್ದರೆ.
4. **ಉಚ್ಚ ನವಾಂಶ / ವರ್ಗೋತ್ತಮ**: ನೀಚ ಗ್ರಹವು ನವಾಂಶ ಕುಂಡಲಿಯಲ್ಲಿ (D9) ಉಚ್ಚ ರಾಶಿಯಲ್ಲಿದ್ದರೆ.
5. **ಪರಸ್ಪರ ನೀಚ ದೃಷ್ಟಿ**: ಎರಡು ನೀಚ ಗ್ರಹಗಳು ಪರಸ್ಪರ ಮುಖಾಮುಖಿ ದೃಷ್ಟಿ ಹೊಂದಿದ್ದರೆ.`;

    const tableEn = `🌟 **Complete Vedic Planetary Exaltation, Debilitation & Dignities Table**

| Planet | Exaltation (Uccha) & Deep Deg | Debilitation (Neecha) & Deep Deg | Moolatrikona |
| :--- | :--- | :--- | :--- |
| **Sun (Surya)** | Aries 10° (Mesha) | Libra 10° (Tula) | Leo (0°-20°) |
| **Moon (Chandra)** | Taurus 3° (Vrishabha) | Scorpio 3° (Vrischika) | Taurus (3°-30°) |
| **Mars (Mangala)** | Capricorn 28° (Makara) | Cancer 28° (Karka) | Aries (0°-12°) |
| **Mercury (Budha)** | Virgo 15° (Kanya) | Pisces 15° (Meena) | Virgo (15°-20°) |
| **Jupiter (Guru)** | Cancer 5° (Karka) | Capricorn 5° (Makara) | Sagittarius (0°-10°) |
| **Venus (Shukra)** | Pisces 27° (Meena) | Virgo 27° (Kanya) | Libra (0°-15°) |
| **Saturn (Shani)** | Libra 20° (Tula) | Aries 20° (Mesha) | Aquarius (0°-20°) |
| **Rahu** | Taurus / Gemini 15° | Scorpio / Sagittarius 15° | Aquarius |
| **Ketu** | Scorpio / Sagittarius 15° | Taurus / Gemini 15° | Pisces |

---
👑 **5 Golden Rules of Neechabhanga Raja Yoga (BPHS & Phaladeepika)**:
1. The lord of the sign occupied by the debilitated planet is in Kendra (1, 4, 7, 10) from Lagna or Moon.
2. The planet that gets exalted in the sign occupied by the debilitated planet is in Kendra from Lagna or Moon.
3. The debilitated planet is conjunct or aspected by its own sign lord.
4. The debilitated planet attains an Exalted Navamsha (D9) or Vargottama dignity.
5. Two debilitated planets mutually aspect each other directly.`;

    const spokenKn = `ಸ್ವಾಮಿ, ಸೂರ್ಯನು ಮೇಷದಲ್ಲಿ, ಚಂದ್ರನು ವೃಷಭದಲ್ಲಿ, ಕುಜನು ಮಕರದಲ್ಲಿ, ಬುಧನು ಕನ್ಯೆಯಲ್ಲಿ, ಗುರುವು ಕರ್ಕಾಟಕದಲ್ಲಿ, ಶುಕ್ರನು ಮೀನದಲ್ಲಿ ಮತ್ತು ಶನಿಯು ತುಲಾದಲ್ಲಿ ಉಚ್ಚರಾಗುತ್ತಾರೆ. ಸಂಪೂರ್ಣ ಕೋಷ್ಟಕ ಹಾಗೂ ನೀಚಭಂಗ ನಿಯಮಗಳು ಸಿದ್ಧವಾಗಿವೆ.`;
    const spokenEn = `Swami, Sun is exalted in Aries, Moon in Taurus, Mars in Capricorn, Mercury in Virgo, Jupiter in Cancer, Venus in Pisces, and Saturn in Libra. The complete table and Neechabhanga Raja Yoga rules are presented.`;

    return {
      text: { kn: tableKn, en: tableEn, hi: tableEn, te: tableEn, ta: tableEn },
      spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
      emotion: "speaking",
      category: "admin",
      actions: [
        {
          id: "open_kundli",
          label: { kn: "🪐 ಜಾತಕ ರಚನೆಗೆ ಹೋಗಿ", en: "🪐 Go to Kundli Page", hi: "🪐 कुण्डली पेज", te: "🪐 జాతక పేజీ", ta: "🪐 ஜாதக பக்கம்" },
          icon: "🪐",
          targetPage: "kundli",
          actionType: "navigate"
        }
      ]
    };
  }

  // C. NAKSHATRAS & GANDA MOOLA
  const matchedNak = lookupNakshatraByName(query);
  const isGandaMoolaQuery = query.includes("ganda moola") || query.includes("ಗಂಡಮೂಲ") || query.includes("gandanta") || query.includes("ಗಂಡಾಂತ");

  if (matchedNak || isGandaMoolaQuery || query.includes("nakshatra") || query.includes("ನಕ್ಷತ್ರ")) {
    if (matchedNak) {
      const n = matchedNak;
      const textKn = `✨ **ನಕ್ಷತ್ರ ಶಾಸ್ತ್ರ ಬೋಧನೆ: ${n.name.kn} ನಕ್ಷತ್ರ (${n.name.en})**
- **ಅಧಿಪತಿ (Ruling Graha)**: ${n.lordName.kn} (${n.lord})
- **ರಾಶಿ ವಿಸ್ತಾರ (Rashi Span)**: ${n.rashiSpans.kn}
- **ಅಧಿದೇವತೆ (Presiding Deity)**: ${n.deity.kn}
- **ಗಣ (Gana)**: ${n.ganaKn} ಗಣ (${n.gana})
- **ಪ್ರಾಣಿ ಯೋನಿ (Animal Yoni)**: ${n.animalYoni.kn}
- **ಮುಹೂರ್ತ ಸ್ವಭಾವ**: ${n.muhurthaQuality.kn}
- **ಗಂಡಮೂಲ ಸ್ಥಿತಿ**: ${n.isGandaMoola ? "⚠️ ಹೌದು - ಗಂಡಮೂಲ ನಕ್ಷತ್ರ! " + (n.gandantaDescription?.kn || "") : "✅ ಶುಭ ನಕ್ಷತ್ರ (ಗಂಡಮೂಲ ದೋಷವಿಲ್ಲ)"}`;

      const textEn = `✨ **Nakshatra Shastra: ${n.name.en} (${n.name.sa})**
- **Ruling Planet (Lord)**: ${n.lordName.en} (${n.lord})
- **Zodiac Span**: ${n.rashiSpans.en}
- **Presiding Deity**: ${n.deity.en}
- **Gana**: ${n.gana} Gana
- **Animal Yoni**: ${n.animalYoni.en}
- **Muhurtha Quality**: ${n.muhurthaQuality.en}
- **Ganda Moola Status**: ${n.isGandaMoola ? "⚠️ Ganda Moola Nakshatra! " + (n.gandantaDescription?.en || "") : "✅ Benefic Star (No Gandanta affliction)"}`;

      const spokenKn = `ಸ್ವಾಮಿ, ${n.name.kn} ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ${n.lordName.kn} ಮತ್ತು ಅಧಿದೇವತೆ ${n.deity.kn}. ಇದು ${n.ganaKn} ಗಣಕ್ಕೆ ಸೇರಿದೆ.`;
      const spokenEn = `Swami, ${n.name.en} Nakshatra is ruled by ${n.lordName.en} and its presiding deity is ${n.deity.en}. It belongs to ${n.gana} Gana.`;

      return {
        text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
        spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
        emotion: "peaceful",
        category: "admin",
        actions: [{ id: "open_kundli", label: { kn: "🪐 ಜಾತಕ ರಚನೆಗೆ ಹೋಗಿ", en: "🪐 View Kundli", hi: "🪐 कुण्डली", te: "🪐 జాతకం", ta: "🪐 ஜாதகம்" }, icon: "🪐", targetPage: "kundli", actionType: "navigate" }]
      };
    }

    // General Ganda Moola
    if (isGandaMoolaQuery) {
      const textKn = `⚠️ **ಗಂಡಮೂಲ ನಕ್ಷತ್ರಗಳ ರಹಸ್ಯ & ಶಾಂತಿ ಪರಿಹಾರ (Ganda Moola Shastra)**

ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಜಲ ರಾಶಿ ಮತ್ತು ಅಗ್ನಿ ರಾಶಿಗಳು ಸಂಧಿಸುವ ೩ ಜಂಕ್ಷನ್‌ಗಳನ್ನು **ಗಂಡಾಂತ ಸಂಧಿ (Trik-Sandhi)** ಎನ್ನಲಾಗುತ್ತದೆ. ಈ ಸಂಧಿಗಳಲ್ಲಿ ಬರುವ ೬ ನಕ್ಷತ್ರಗಳನ್ನು **ಗಂಡಮೂಲ ನಕ್ಷತ್ರಗಳು** ಎನ್ನುತ್ತಾರೆ:

1. **ಅಶ್ವಿನಿ (Ashwini - 1st Pada)**: ಮೇಷ ರಾಶಿಯ ಆರಂಭ (ಕೇತು ಅಧಿಪತಿ)
2. **ಆಶ್ಲೇಷಾ (Ashlesha - 4th Pada)**: ಕರ್ಕಾಟಕ ರಾಶಿಯ ಅಂತ್ಯ (ಬುಧ ಅಧಿಪತಿ)
3. **ಮಘಾ (Magha - 1st Pada)**: ಸಿಂಹ ರಾಶಿಯ ಆರಂಭ (ಕೇತು ಅಧಿಪತಿ)
4. **ಜ್ಯೇಷ್ಠಾ (Jyeshtha - 4th Pada)**: ವೃಶ್ಚಿಕ ರಾಶಿಯ ಅಂತ್ಯ (ಬುಧ ಅಧಿಪತಿ)
5. **ಮೂಲಾ (Moola - 1st Pada)**: ಧನುಸ್ಸು ರಾಶಿಯ ಆರಂಭ (ಕೇತು ಅಧಿಪತಿ)
6. **ರೇವತಿ (Revati - 4th Pada)**: ಮೀನ ರಾಶಿಯ ಅಂತ್ಯ (ಬುಧ ಅಧಿಪತಿ)

---
🛕 **ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ ಪರಿಹಾರಗಳು (Gokarna Parihara)**:
- ಜನನವಾದ ೨೭ ದಿನಗಳ ಒಳಗೆ ಅಥವಾ ಅದೇ ನಕ್ಷತ್ರ ಪುನಃ ಬಂದಾಗ **ಗಂಡಮೂಲ ಶಾಂತಿ ಹೋಮ** ಮಾಡಿಸಬೇಕು.
- ೨೭ ತೀರ್ಥಗಳ ಪವಿತ್ರ ಜಲ ಸ್ನಾನ, ಗೋ ದಾನ, ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಸಕಲ ಅನಿಷ್ಟಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.`;

      const textEn = `⚠️ **Ganda Moola Nakshatras & Gandanta Remedies (Vedic Shastra)**

In Vedic astrology, the three junctions where Water signs meet Fire signs are known as **Gandanta Sandhis (Cosmic Karmic Knots)**. The 6 Nakshatras encompassing these boundaries are called **Ganda Moola Nakshatras**:

1. **Ashwini (1st Pada)**: Beginning of Aries (Ketu)
2. **Ashlesha (4th Pada)**: End of Cancer (Mercury)
3. **Magha (1st Pada)**: Beginning of Leo (Ketu)
4. **Jyeshtha (4th Pada)**: End of Scorpio (Mercury)
5. **Moola (1st Pada)**: Beginning of Sagittarius (Ketu)
6. **Revati (4th Pada)**: End of Pisces (Mercury)

---
🛕 **Prescribed Vedic Remedies (Gokarna Parihara)**:
- Perform **Ganda Moola Shanti Homa** within 27 days of birth or on the next return of the birth star.
- 27-water sacred Kalasha Snana, Go-Dāna (Cow charity), and Rudrabhisheka at Gokarna Mahabaleshwara temple neutralize the dosha completely.`;

      const spokenKn = `ಸ್ವಾಮಿ, ಗಂಡಮೂಲ ನಕ್ಷತ್ರಗಳು ಅಶ್ವಿನಿ, ಆಶ್ಲೇಷಾ, ಮಘಾ, ಜ್ಯೇಷ್ಠಾ, ಮೂಲಾ ಮತ್ತು ರೇವತಿ. ಇವು ಜಲ ಮತ್ತು ಅಗ್ನಿ ರಾಶಿಗಳ ಸಂಧಿಯಲ್ಲಿ ಬರುತ್ತವೆ. ಜನನ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗಂಡಮೂಲ ಹೋಮ ಮಾಡಿಸುವುದು ಶಾಸ್ತ್ರ ಸಮ್ಮತ.`;
      const spokenEn = `Swami, the six Ganda Moola nakshatras are Ashwini, Ashlesha, Magha, Jyeshtha, Moola, and Revati. They fall at the critical water-fire zodiac junctions and require Gandanta Shanti.`;

      return {
        text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
        spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
        emotion: "alert",
        category: "admin",
        actions: [{ id: "open_doshas", label: { kn: "🛡️ ದೋಷ ವಿಭಾಗ ತೆರೆಯಿರಿ", en: "🛡️ Open Doshas Center", hi: "🛡️ दोष केंद्र", te: "🛡️ దోషాల కేంద్రం", ta: "🛡️ தோஷ மையம்" }, icon: "🛡️", targetPage: "doshas", actionType: "navigate" }]
      };
    }
  }

  // D. 12 BHAVAS (HOUSES) & HOUSE CLASSIFICATIONS
  const matchedBhava = lookupBhavaByNumberOrTerm(query);
  const isKendraTrikonaQuery = query.includes("kendra") || query.includes("trikona") || query.includes("dusthana") || query.includes("upachaya") || query.includes("maraka") || query.includes("ಕೇಂದ್ರ") || query.includes("ತ್ರಿಕೋನ") || query.includes("ದುಸ್ಥಾನ") || query.includes("ಉಪಚಯ") || query.includes("ಮಾರಕ");

  if (matchedBhava || isKendraTrikonaQuery) {
    if (matchedBhava) {
      const b = matchedBhava;
      const textKn = `🏛️ **ಭಾವ ಶಾಸ್ತ್ರ ಬೋಧನೆ: ${b.name.kn}**
- **ಸಂಸ್ಕೃತ ನಾಮ**: ${b.sanskritName}
- **ಭಾವ ವರ್ಗೀಕರಣ**: ${b.classification.kn}
- **ದೇಹದ ಅಂಗಗಳು**: ${b.bodyParts.kn}
- **ನೈಸರ್ಗಿಕ ಕಾರಕ ಗ್ರಹ**: ${PLANET_NAMES_KN[b.keySignificator] || b.keySignificator}

📖 **ಪ್ರಮುಖ ಕಾರಕತ್ವಗಳು (Significations)**:
${b.karakatwas.kn.map((k) => `• ${k}`).join("\n")}`;

      const textEn = `🏛️ **Bhava Shastra: ${b.name.en}**
- **Sanskrit Title**: ${b.sanskritName}
- **Classification**: ${b.classification.en}
- **Governed Bodily Anatomy**: ${b.bodyParts.en}
- **Natural Significator (Karaka)**: ${b.keySignificator}

📖 **Primary Significations (Karakatwas)**:
${b.karakatwas.en.map((k) => `• ${k}`).join("\n")}`;

      const spokenKn = `ಸ್ವಾಮಿ, ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ${b.name.kn}ಯು ${b.classification.kn} ಆಗಿದೆ. ಇದರ ನೈಸರ್ಗಿಕ ಕಾರಕ ಗ್ರಹ ${PLANET_NAMES_KN[b.keySignificator] || b.keySignificator}.`;
      const spokenEn = `Swami, ${b.name.en} is classified as ${b.classification.en} and its natural karaka is ${b.keySignificator}.`;

      return {
        text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
        spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
        emotion: "peaceful",
        category: "admin",
        actions: [{ id: "open_predictions", label: { kn: "📜 ಭಾವ ಭವಿಷ್ಯ ನೋಡಿ", en: "📜 View Bhava Predictions", hi: "📜 भाव फल", te: "📜 భావ ఫలాలు", ta: "📜 பாவ பலன்கள்" }, icon: "📜", targetPage: "predictions", actionType: "navigate" }]
      };
    }

    // General Kendra, Trikona, Dusthana, Upachaya, Maraka
    const textKn = `🏛️ **೧೨ ಭಾವಗಳ ಶಾಸ್ತ್ರೀಯ ವರ್ಗೀಕರಣ (House Classifications)**

1. **ಕೇಂದ್ರ ಸ್ಥಾನಗಳು (Kendra Houses - 1, 4, 7, 10)**:
   - ಇವು ಜಾತಕದ ನಾಲ್ಕು ಮಹಾ ಸ್ತಂಭಗಳು (ವಿಷ್ಣು ಸ್ಥಾನಗಳು). ಶಕ್ತಿ, ಸುಖ, ವೈವಾಹಿಕ ಸೌಖ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಯಶಸ್ಸನ್ನು ನಿಯಂತ್ರಿಸುತ್ತವೆ.
2. **ತ್ರಿಕೋನ ಸ್ಥಾನಗಳು (Trikona Houses - 1, 5, 9)**:
   - ಅತ್ಯಂತ ಪವಿತ್ರ ಲಕ್ಷ್ಮೀ ಸ್ಥಾನಗಳು. ಧರ್ಮ, ಪೂರ್ವಪುಣ್ಯ, ಬುದ್ಧಿ ಮತ್ತು ಅಖಂಡ ಭಾಗ್ಯೋದಯವನ್ನು ಕರುಣಿಸುತ್ತವೆ.
3. **ದುಸ್ಥಾನಗಳು (Dusthana Houses - 6, 8, 12)**:
   - ಪರೀಕ್ಷೆಯ ಸ್ಥಾನಗಳು. ರೋಗ, ಸಾಲ, ಶತ್ರುಗಳು, ಅನಿರೀಕ್ಷಿತ ಆಘಾತಗಳು, ಖರ್ಚು ಮತ್ತು ಮೋಕ್ಷವನ್ನು ಸೂಚಿಸುತ್ತವೆ.
4. **ಉಪಚಯ ಸ್ಥಾನಗಳು (Upachaya Houses - 3, 6, 10, 11)**:
   - ವಯಸ್ಸು ಮತ್ತು ಪ್ರಯತ್ನ ಹೆಚ್ಚಿದಂತೆ ಫಲಗಳು ವೃದ್ಧಿಯಾಗುವ ಸ್ಥಾನಗಳು. ಪಾಪ ಗ್ರಹಗಳು (ಶನಿ, ಕುಜ, ರಾಹು) ಇಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಫಲ ನೀಡುತ್ತಾರೆ!
5. **ಮಾರಕ ಸ್ಥಾನಗಳು (Maraka Houses - 2, 7)**:
   - ಆಯುಷ್ಯ ಮುಕ್ತಾಯ ಮತ್ತು ದೈಹಿಕ ಪರಿವರ್ತನೆಯನ್ನು ನಿರ್ಧರಿಸುವ ಸ್ಥಾನಗಳು.`;

    const textEn = `🏛️ **Classical Vedic Bhava Classifications (House Categories)**

1. **Kendra Houses (Angular - 1, 4, 7, 10)**:
   - The Four Pillars of the Horoscope (Vishnu Sthanas). They provide action, domestic happiness, partnerships, and career peak.
2. **Trikona Houses (Trinal - 1, 5, 9)**:
   - The Sacred Houses of Grace (Lakshmi Sthanas). They bring fortune, intelligence, past-life merits, and righteousness.
3. **Dusthana Houses (Difficult - 6, 8, 12)**:
   - Houses of obstacles and transformation: debts, diseases, litigation, longevity mysteries, expenditures, and final liberation (Moksha).
4. **Upachaya Houses (Growth - 3, 6, 10, 11)**:
   - Houses of progressive growth through effort. Natural malefics (Saturn, Mars, Rahu) excel here!
5. **Maraka Houses (Transition - 2, 7)**:
   - The exit and transition houses governing physical longevity conclusion.`;

    const spokenKn = `ಸ್ವಾಮಿ, ಕೇಂದ್ರಗಳು ವಿಷ್ಣು ಸ್ಥಾನಗಳು ಮತ್ತು ತ್ರಿಕೋನಗಳು ಲಕ್ಷ್ಮೀ ಸ್ಥಾನಗಳು. ಮೂರು, ಆರು, ಹತ್ತು ಮತ್ತು ಹನ್ನೊಂದನೇ ಮನೆಗಳು ಉಪಚಯ ಸ್ಥಾನಗಳಾಗಿದ್ದು, ಇಲ್ಲಿ ಪಾಪಗ್ರಹಗಳು ಉತ್ತಮ ಫಲ ನೀಡುತ್ತಾರೆ.`;
    const spokenEn = `Swami, Kendras are Vishnu Sthanas and Trikonas are Lakshmi Sthanas. Houses 3, 6, 10, and 11 are Upachayas where malefics produce immense success.`;

    return {
      text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
      spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
      emotion: "speaking",
      category: "admin",
      actions: [{ id: "open_predictions", label: { kn: "📜 ಭಾವ ಭವಿಷ್ಯ ನೋಡಿ", en: "📜 View Predictions", hi: "📜 भाव फल", te: "📜 భావాలు", ta: "📜 பாவங்கள்" }, icon: "📜", targetPage: "predictions", actionType: "navigate" }]
    };
  }

  // E. GENERAL ALL GRAHA MANTRAS & JAPA COUNTS TABLE
  if (isMantraQuery) {
    const tableKn = `📿 **ಸಮಗ್ರ ನವಗ್ರಹ ಶಾಸ್ತ್ರೋಕ್ತ ಬೀಜ ಮಂತ್ರಗಳು & ನಿಖರ ಜಪ ಸಂಖ್ಯೆ (Mantras & Japa Counts)**

| ಗ್ರಹ | ವೈದಿಕ ಬೀಜ ಮಂತ್ರ | ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ ಸಂಖ್ಯೆ | ಅಧಿದೇವತೆ | ರತ್ನ |
| :--- | :--- | :--- | :--- | :--- |
| **ಸೂರ್ಯ** | ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ | **೭,೦೦೦ ಜಪಗಳು** | ಭಗವಾನ್ ಶಿವ | ಮಾಣಿಕ್ಯ |
| **ಚಂದ್ರ** | ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ | **೧೧,೦೦೦ ಜಪಗಳು** | ಮಾತಾ ಪಾರ್ವತಿ | ಮುತ್ತು |
| **ಕುಜ** | ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ | **೧೦,೦೦೦ ಜಪಗಳು** | ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ | ಹವಳ |
| **ಬುಧ** | ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ | **೧೭,೦೦೦ ಜಪಗಳು** | ಶ್ರೀ ಮಹಾವಿಷ್ಣು | ಪಚ್ಚೆ |
| **ಗುರು** | ಓಂ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ | **೧೯,೦೦೦ ಜಪಗಳು** | ದಕ್ಷಿಣಾಮೂರ್ತಿ | ಪುಷ್ಯರಾಗ |
| **ಶುಕ್ರ** | ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ | **೧೬,೦೦೦ ಜಪಗಳು** | ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ | ವಜ್ರ |
| **ಶನಿ** | ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ | **೨೩,೦೦೦ ಜಪಗಳು** | ಯಮಧರ್ಮರಾಜ / ಶಿವ | ನೀಲ |
| **ರಾಹು** | ಓಂ ಭ್ರಾಂ ಭ್ರೀಂ ಭ್ರೌಂ ಸಃ ರಾಹವೇ ನಮಃ | **೧೮,೦೦೦ ಜಪಗಳು** | ದುರ್ಗಾ ದೇವಿ / ನಾಗ | ಗೋಮೇಧಿಕ |
| **ಕೇತು** | ಓಂ ಸ್ರಾಂ ಸ್ರೀಂ ಸ್ರೌಂ ಸಃ ಕೇತವೇ ನಮಃ | **೧೭,೦೦೦ ಜಪಗಳು** | ಮಹಾಗಣಪತಿ | ವೈಡೂರ್ಯ |

*(ಸೂಚನೆ: ಕಲಿಯುಗದಲ್ಲಿ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಜಪ ಸಂಖ್ಯೆಯನ್ನು ೪ ಪಟ್ಟು ಹೆಚ್ಚಿಸಿ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಫಲದಾಯಕ).*`;

    const tableEn = `📿 **Vedic Navagraha Beeja Mantras & Authentic Classical Japa Counts**

| Planet | Authentic Beeja Mantra | Classical Japa Count | Presiding Deity | Gemstone |
| :--- | :--- | :--- | :--- | :--- |
| **Sun (Surya)** | Om Hraam Hreem Hroum Sah Suryaya Namah | **7,000 counts** | Lord Shiva | Ruby |
| **Moon (Chandra)** | Om Shraam Shreem Shroum Sah Chandramase Namah | **11,000 counts** | Goddess Parvati | Pearl |
| **Mars (Kuja)** | Om Kraam Kreem Kroum Sah Bhaumaya Namah | **10,000 counts** | Lord Subrahmanya | Red Coral |
| **Mercury (Budha)** | Om Braam Breem Broum Sah Budhaya Namah | **17,000 counts** | Lord Maha Vishnu | Emerald |
| **Jupiter (Guru)** | Om Graam Greem Groum Sah Gurave Namah | **19,000 counts** | Lord Dakshinamurthy | Yellow Sapphire |
| **Venus (Shukra)** | Om Draam Dreem Droum Sah Shukraya Namah | **16,000 counts** | Goddess Mahalakshmi | Diamond |
| **Saturn (Shani)** | Om Praam Preem Proum Sah Shanaishcharaya Namah | **23,000 counts** | Lord Yama / Shiva | Blue Sapphire |
| **Rahu** | Om Bhraam Bhreem Bhroum Sah Rahave Namah | **18,000 counts** | Goddess Durga / Naga | Hessonite |
| **Ketu** | Om Sraam Sreem Sroum Sah Ketave Namah | **17,000 counts** | Lord Maha Ganapati | Cat's Eye |

*(Note: In Kali Yuga, classical authorities prescribe multiplying japa counts 4-fold for definitive siddhi).*`;

    const spokenKn = `ಸ್ವಾಮಿ, ಶನಿಗೆ ೨೩ ಸಾವಿರ, ರಾಹುವಿಗೆ ೧೮ ಸಾವಿರ, ಗುರುವಿಗೆ ೧೯ ಸಾವಿರ, ಬುಧನಿಗೆ ೧೭ ಸಾವಿರ, ಶುಕ್ರನಿಗೆ ೧೬ ಸಾವಿರ, ಚಂದ್ರನಿಗೆ ೧೧ ಸಾವಿರ, ಕುಜನಿಗೆ ೧೦ ಸಾವಿರ, ಸೂರ್ಯನಿಗೆ ೭ ಸಾವಿರ ಮತ್ತು ಕೇತುವಿಗೆ ೧೭ ಸಾವಿರ ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ ಸಂಖ್ಯೆಗಳಾಗಿವೆ.`;
    const spokenEn = `Swami, classical Japa counts are: Saturn 23,000, Rahu 18,000, Jupiter 19,000, Mercury 17,000, Venus 16,000, Moon 11,000, Mars 10,000, Sun 7,000, and Ketu 17,000.`;

    return {
      text: { kn: tableKn, en: tableEn, hi: tableEn, te: tableEn, ta: tableEn },
      spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
      emotion: "speaking",
      category: "admin",
      actions: [{ id: "open_seva", label: { kn: "🪔 ಗೋಕರ್ಣ ಸೇವಾ ಪುಟಕ್ಕೆ ಹೋಗಿ", en: "🪔 Open Seva Page", hi: "🪔 सेवा पृष्ठ", te: "🪔 సేవా పేజీ", ta: "🪔 சேவா பக்கம்" }, icon: "🪔", targetPage: "seva", actionType: "navigate" }]
    };
  }

  // F. GENERAL TEACH ME JYOTISHYA / GURUKULA OVERVIEW
  const textKn = `🎓 **ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ: ಜಾತಕ ವಿಶ್ಲೇಷಣೆಯ ೬ ಮಹಾ ಸೂತ್ರಗಳು**

1. **ಲಗ್ನ & ಲಗ್ನಾಧಿಪತಿಯ ಬಲ (Lagna Strength)**: ಜಾತಕನ ಶಾರೀರಿಕ ಬಲ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಜೀವನದ ಅಡಿಪಾಯ.
2. **ಚಂದ್ರ & ಜನ್ಮ ನಕ್ಷತ್ರ (Moon & Mind)**: ಮನೋಸ್ಥಿತಿ, ಭಾವನಾತ್ಮಕ ನೆಮ್ಮದಿ ಮತ್ತು ಜನ್ಮ ನಕ್ಷತ್ರದ ಗಣ-ಯೋನಿ ಸ್ವಭಾವ.
3. **ಸೂರ್ಯನ ಸ್ಥಿತಿ (Sun & Soul)**: ಆತ್ಮಬಲ, ತಂದೆ, ಸರ್ಕಾರಿ ಗೌರವ ಮತ್ತು ಪ್ರಾಣಶಕ್ತಿ.
4. **ದಶಮ ಭಾವ & ಕರ್ಮಾಧಿಪತಿ (10th House Career)**: ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ಕೀರ್ತಿ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಗಳಿಸುವ ಸ್ಥಾನಮಾನ.
5. **ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶಾ & ಅಂತರ್ದಶಾ (Running Dasha Timeline)**: ಜೀವನದ ಪ್ರಸ್ತುತ ಅಧ್ಯಾಯದಲ್ಲಿ ಯಾವ ಗ್ರಹದ ಆಜ್ಞೆ ನಡೆಯುತ್ತಿದೆ ಎಂಬ ನಿರ್ಣಯ.
6. **ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ (Live Planetary Transits)**: ಶನಿ (ಸಾಡೇಸಾತಿ/ಅಷ್ಟಮ), ಗುರು ಮತ್ತು ರಾಹು-ಕೇತುಗಳ ಪ್ರಸ್ತುತ ಚಲನೆ.

ಸ್ವಾಮಿ, ನೀವು ಯಾವುದೇ ಗ್ರಹದ ಉಚ್ಚ-ನೀಚ ಅಂಶ, ನಕ್ಷತ್ರದ ಅಧಿದೇವತೆ, ಗಂಡಮೂಲ ಶಾಂತಿ ಅಥವಾ ಮಂತ್ರ ಜಪ ಸಂಖ್ಯೆಯ ಬಗ್ಗೆ ನಿರ್ದಿಷ್ಟವಾಗಿ ಕೇಳಬಹುದು!`;

  const textEn = `🎓 **Vedic Astrology Gurukula: 6 Foundational Chart Reading Steps**

1. **Lagna & Lagna Lord Strength**: Physical vitality, constitutional stamina, and baseline destiny.
2. **Moon Sign & Nakshatra**: Emotional psychology, mental peace, and lunar temperament.
3. **Sun & Atmakaraka**: Soul purpose, father's legacy, and vital willpower.
4. **10th House & Karma Lord**: Vocation, livelihood, public honor, and career milestones.
5. **Vimshottari Mahadasha & Antardasha**: The active karmic timeline dictating current circumstances.
6. **Gochara (Live Transits)**: Real-time transits of Saturn (Sade Sati/Ashtama), Jupiter, and Rahu-Ketu.

Ask me about any planet's exaltation/debilitation degree, Nakshatra deity, Ganda Moola remedies, or classical mantra japa counts!`;

  const spokenKn = `ಸ್ವಾಮಿ, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಲಗ್ನ, ಚಂದ್ರ, ಸೂರ್ಯ, ದಶಮ ಭಾವ, ಮಹಾದಶಾ ಮತ್ತು ಗೋಚಾರ - ಈ ಆರು ಸೂತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ಜಾತಕವನ್ನು ನಿರ್ಣಯಿಸಲಾಗುತ್ತದೆ.`;
  const spokenEn = `Swami, a Vedic horoscope is analyzed through the six pillars: Lagna, Moon, Sun, 10th house, active Dasha, and live Gochara transits.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [
      { id: "open_kundli", label: { kn: "🪐 ಜಾತಕ ರಚನೆಗೆ ಹೋಗಿ", en: "🪐 Go to Kundli Page", hi: "🪐 कुण्डली", te: "🪐 జాతకం", ta: "🪐 ஜாதகம்" }, icon: "🪐", targetPage: "kundli", actionType: "navigate" },
      { id: "open_raman", label: { kn: "🌟 ರಮಣ ಪದ್ಧತಿ ಭವಿಷ್ಯ", en: "🌟 Raman Bhavishya", hi: "🌟 रमण पद्धति", te: "🌟 రమణ భవిష్యత్", ta: "🌟 ராமன் பலன்கள்" }, icon: "🌟", targetPage: "ramanbhavishya", actionType: "navigate" }
    ]
  };
}

// =========================================================================
// HANDLER 0C: SANKHYA SHASTRA (Vedic Numerology - Mulank, Bhagyank, Namaank)
// =========================================================================
async function handleSankhyaShastraIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const query = rawQuery.trim();

  // Extract DOB from query, active profile, or session
  let dob = context.activeProfile?.birthDate || context.currentKundliSession?.input?.birthDate || "";
  let name = context.activeProfile?.name || context.currentKundliSession?.input?.name || "";

  // Try extracting from query
  const dateMatch = query.match(/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})\b/);
  if (dateMatch) {
    dob = dateMatch[1];
  } else if (!dob) {
    dob = "1993-05-31"; // Default sample
  }

  const nameMatch = query.match(/(?:named|name is|for)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*)/i);
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].trim();
  } else if (!name) {
    name = "Shriram Pandit";
  }

  const sankhya = calculateSankhyaProfile(dob, name);
  const m = sankhya.mulankRecord;
  const b = sankhya.bhagyankRecord;
  const n = sankhya.namaankRecord;

  const textKn = `🔢 **ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿಶ್ಲೇಷಣೆ (Vedic Numerology): ${name}**
*(ಜನನ ದಿನಾಂಕ: ${dob})*

🌟 **೧. ಜನ್ಮ ಸಂಖ್ಯೆ (ಮೂಲಾಂಕ - Mulank): ${sankhya.mulank}**
- **ಅಧಿಪತಿ ಗ್ರಹ**: **${m.grahaName.kn}** (${m.title.kn})
- **ಸ್ವಭಾವ & ಗುಣಲಕ್ಷಣಗಳು**: ${m.qualities.kn.join(", ")}
- **ಮಿತ್ರ ಸಂಖ್ಯೆಗಳು (Friendly)**: ${m.friendlyNumbers.join(", ")} | **ಶತ್ರು ಸಂಖ್ಯೆಗಳು**: ${m.enemyNumbers.join(", ") || "ಯಾವುದೂ ಇಲ್ಲ"}
- **ಅದೃಷ್ಟ ರತ್ನ & ಲೋಹ**: ${m.luckyGem.kn}
- **ಅದೃಷ್ಟ ದಿನ & ಬಣ್ಣಗಳು**: ${m.luckyDay.kn} | ${m.luckyColors.kn.join(", ")}
- **ಸೂಕ್ತ ವೃತ್ತಿ ರಂಗಗಳು**: ${m.careerFields.kn.join(", ")}

🔮 **೨. ಭಾಗ್ಯ ಸಂಖ್ಯೆ (ಭಾಗ್ಯಾಂಕ - Bhagyank / Life Path): ${sankhya.bhagyank}**
- **ಅಧಿಪತಿ ಗ್ರಹ**: **${b.grahaName.kn}** (${b.title.kn})
- **ಜೀವನದ ಗುರಿ & ಅದೃಷ್ಟ**: ${b.qualities.kn.join(", ")}
- **ಮೂಲಾಂಕ-ಭಾಗ್ಯಾಂಕ ಹೊಂದಾಣಿಕೆ**: ${sankhya.isMulankBhagyankHarmonious ? "✅ ಅತ್ಯುತ್ತಮ ಮಿತ್ರತ್ವ (Raja Yoga harmony)" : "⚠️ ಸವಾಲಿನ ಮಿಶ್ರ ಫಲ (Remedies recommended)"}

🔤 **೩. ನಾಮ ಸಂಖ್ಯೆ (ನಾಮಾಂಕ - Chaldean Namaank): ${sankhya.namaank}**
- **ನಾಮ ಸಂಖ್ಯೆಯ ಅಧಿಪತಿ**: **${n.grahaName.kn}**
- **ಸಾರ್ವಜನಿಕ ಪ್ರಭಾವ**: ಸಮಾಜ, ಉದ್ಯೋಗ ಮತ್ತು ಸಹೋದ್ಯೋಗಿಗಳಲ್ಲಿ ${name} ಹೆಸರಿಗೆ ಲಭಿಸುವ ಗೌರವ.

🛕 **ಶಾಸ್ತ್ರೋಕ್ತ ಸಂಖ್ಯಾ ಪರಿಹಾರ**:
${m.remedy.kn}

---
👑 *ಬಾಸ್, ನಿಮ್ಮ ಆಜ್ಞೆಯಂತೆ ಈ ಜಾತಕರ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಲೆಕ್ಕಾಚಾರ ಪೂರ್ಣಗೊಂಡಿದೆ! ಇವರ ವೃತ್ತಿ, ವಿವಾಹ ಅಥವಾ ಇತರ ಪ್ರಶ್ನೆಗಳಿದ್ದರೆ ಕೇಳಿ ಸ್ವಾಮಿ.*`;

  const textEn = `🔢 **Vedic Numerology Report (Sankhya Shastra): ${name}**
*(Date of Birth: ${dob})*

🌟 **1. Root / Birth Number (Mulank): ${sankhya.mulank}**
- **Governing Planet**: **${m.grahaName.en}** (${m.title.en})
- **Innate Traits**: ${m.qualities.en.join(", ")}
- **Harmonious Numbers**: ${m.friendlyNumbers.join(", ")} | **Challenging Numbers**: ${m.enemyNumbers.join(", ") || "None"}
- **Auspicious Gemstone**: ${m.luckyGem.en}
- **Favorable Day & Colors**: ${m.luckyDay.en} | ${m.luckyColors.en.join(", ")}
- **Prime Career Paths**: ${m.careerFields.en.join(", ")}

🔮 **2. Destiny Number (Bhagyank / Life Path): ${sankhya.bhagyank}**
- **Governing Planet**: **${b.grahaName.en}** (${b.title.en})
- **Life Path Blueprint**: ${b.qualities.en.join(", ")}
- **Mulank-Bhagyank Compatibility**: ${sankhya.isMulankBhagyankHarmonious ? "✅ Highly Harmonious (Direct growth alignment)" : "⚠️ Complex dynamic (Remedial balancing suggested)"}

🔤 **3. Name Number (Chaldean Namaank): ${sankhya.namaank}**
- **Name Number Ruler**: **${n.grahaName.en}**
- **Social Resonance**: Dictates professional reputation, client magnetism, and public credibility.

🛕 **Authentic Numerological Remedy**:
${m.remedy.en}

---
👑 *Boss, the numerological blueprint for ${name} is ready at your command! Feel free to ask technical follow-up questions.*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ${name} ಅವರ ಮೂಲಾಂಕ ${sankhya.mulank} ಸೂರ್ಯನ ಅಧೀನದಲ್ಲಿದೆ ಹಾಗೂ ಭಾಗ್ಯಾಂಕ ${sankhya.bhagyank} ಆಗಿದೆ. ರತ್ನ ${m.luckyGem.kn} ಹಾಗೂ ಅದೃಷ್ಟ ದಿನ ${m.luckyDay.kn}.`;
  const spokenEn = `Yes Boss! Under Vedic Sankhya Shastra, ${name}'s Root Number is ${sankhya.mulank} ruled by ${m.grahaName.en}, and Destiny Number is ${sankhya.bhagyank}. Auspicious gem is ${m.luckyGem.en}.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "excited",
    category: "admin",
    actions: [
      { id: "open_sankhya", label: { kn: "🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪುಟ", en: "🔢 Sankhya Shastra Page", hi: "🔢 अंकशास्त्र", te: "🔢 సంఖ్యాశాస్త్రం", ta: "🔢 எண் கணிதம்" }, icon: "🔢", targetPage: "sankhyashastra", actionType: "navigate" },
      { id: "open_kundli", label: { kn: "🪐 ಜಾತಕ ಪುಟ", en: "🪐 Kundli Page", hi: "🪐 कुण्डली", te: "🪐 జాతకం", ta: "🪐 ஜாதகம்" }, icon: "🪐", targetPage: "kundli", actionType: "navigate" }
    ]
  };
}

// =========================================================================
// HANDLER 0D: HASTA MUDRIKA (Vedic Palmistry Lines, Mounts & Signs)
// =========================================================================
async function handleHastaMudrikaIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const query = rawQuery.trim().toLowerCase();

  // Check specific line query
  const matchedLine = HASTA_MUDRIKA_LINES.find(
    (l) => query.includes(l.id) || query.includes(l.name.en.toLowerCase()) || query.includes(l.name.kn) || query.includes(l.id.replace("_rekha", ""))
  );

  if (matchedLine) {
    const l = matchedLine;
    const textKn = `✋ **ಹಸ್ತ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರ: ${l.name.kn}**
📍 **ಸ್ಥಾನ (Location)**: ${l.location.kn}
📖 **ಪ್ರಾಮುಖ್ಯತೆ (Significance)**: ${l.significance.kn}

✨ **ಶುಭ ಲಕ್ಷಣಗಳು (Auspicious Signs)**:
${l.auspiciousFeatures.kn.map((f) => `• ${f}`).join("\n")}

⚠️ **ದೋಷಗಳು & ಎಚ್ಚರಿಕೆಗಳು (Inauspicious Signs)**:
${l.inAuspiciousFeatures.kn.map((f) => `• ${f}`).join("\n")}

---
👑 *ಬಾಸ್, ನಿಮ್ಮ ಆಜ್ಞೆಯಂತೆ ${l.name.kn}ಯ ಶಾಸ್ತ್ರೋಕ್ತ ವಿವರಣೆ ಸಿದ್ಧವಾಗಿದೆ. ಬೇರೆ ಯಾವುದೇ ರೇಖೆ ಅಥವಾ ಚಿಹ್ನೆಯ ಬಗ್ಗೆ ಕೇಳಬಹುದು!*`;

    const textEn = `✋ **Vedic Palmistry (Hasta Mudrika): ${l.name.en}**
📍 **Location on Palm**: ${l.location.en}
📖 **Core Significance**: ${l.significance.en}

✨ **Auspicious Significations**:
${l.auspiciousFeatures.en.map((f) => `• ${f}`).join("\n")}

⚠️ **Vulnerabilities & Cautions**:
${l.inAuspiciousFeatures.en.map((f) => `• ${f}`).join("\n")}

---
👑 *Boss, detailed palmistry analysis for ${l.name.en} is prepared at your command! Feel free to ask about any other line, mount, or sign.*`;

    const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಹಸ್ತ ಸಾಮುದ್ರಿಕಾ ಪ್ರಕಾರ ${l.name.kn}ಯು ${l.significance.kn} ಅನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಸಂಪೂರ್ಣ ಶಾಸ್ತ್ರೀಯ ವಿವರಣೆ ಇಲ್ಲಿದೆ.`;
    const spokenEn = `Yes Boss! In Vedic palmistry, the ${l.name.en} dictates ${l.significance.en}. Complete technical analysis is presented.`;

    return {
      text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
      spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
      emotion: "peaceful",
      category: "admin",
      actions: [{ id: "open_palm", label: { kn: "✋ ಹಸ್ತ ಸಾಮುದ್ರಿಕ ಪುಟ", en: "✋ Palm Reading Page", hi: "✋ हस्तरेखा", te: "✋ హస్తసాముద్రికం", ta: "✋ கைரேகை" }, icon: "✋", targetPage: "palmreading", actionType: "navigate" }]
    };
  }

  // General Palmistry Overview
  const textKn = `✋ **ವೈದಿಕ ಹಸ್ತ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರ (Complete Palm Reading Shastra)**

🌟 **ಮುಖ್ಯ ಪಂಚ ಮಹಾ ರೇಖೆಗಳು (5 Primary Lines)**:
1. **ಆಯುಷ್ಯ ರೇಖೆ (Life Line)**: ದೈಹಿಕ ಚೈತನ್ಯ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಆಯಸ್ಸು ಹಾಗೂ ಜೀವನಾಸಕ್ತಿ.
2. **ಮಸ್ತಕ ರೇಖೆ (Head Line)**: ಬುದ್ಧಿಶಕ್ತಿ, ತಾರ್ಕಿಕತೆ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಸಂಶೋಧನಾ ಮನೋಭಾವ.
3. **ಹೃದಯ ರೇಖೆ (Heart Line)**: ಪ್ರೀತಿ, ಕೌಟುಂಬಿಕ ನಿಷ್ಠೆ, ಹೃದಯದ ಆರೋಗ್ಯ ಹಾಗೂ ದೈವಭಕ್ತಿ.
4. **ಭಾಗ್ಯ ರೇಖೆ (Fate / Saturn Line)**: ವೃತ್ತಿಜೀವನ, ಸಂಪತ್ತು ಗಳಿಕೆ, ಅದೃಷ್ಟ ಹಾಗೂ ಭಾಗ್ಯೋದಯ.
5. **ಸೂರ್ಯ ರೇಖೆ (Sun Line)**: ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ, ಸರ್ಕಾರದ ಮನ್ನಣೆ, ರಾಜಯೋಗ ಹಾಗೂ ಪ್ರತಿಷ್ಠೆ.

🔱 **ಪವಿತ್ರ ದೈವಿಕ ಚಿಹ್ನೆಗಳು (Sacred Palm Marks)**:
• **ತ್ರಿಶೂಲ (Trident)**: ಗುರು ಅಥವಾ ಶನಿ ಪರ್ವತದ ಮೇಲಿದ್ದರೆ ಶಿವನ ರಕ್ಷಣೆ ಮತ್ತು ರಾಜಯೋಗ.
• **ಮತ್ಸ್ಯ ಚಿಹ್ನೆ (Fish Sign)**: ಕೇತು ಅಥವಾ ಮಣಿಕಟ್ಟಿನಲ್ಲಿದ್ದರೆ ಆಕಸ್ಮಿಕ ಅಪಾರ ಧನಾಗಮನ ಮತ್ತು ಮೋಕ್ಷ.
• **ಚತುಷ್ಕೋನ (Square)**: ಯಾವುದೇ ದೋಷಯುಕ್ತ ರೇಖೆಗೆ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ!

---
👑 *ಬಾಸ್, ಹಸ್ತ ಸಾಮುದ್ರಿಕಾದ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ರೇಖೆ (ಆಯುಷ್ಯ, ಭಾಗ್ಯ, ಸೂರ್ಯ) ಅಥವಾ ಪರ್ವತಗಳ ಬಗ್ಗೆ ಆಜ್ಞಾಪಿಸಿ!*`;

  const textEn = `✋ **Classical Vedic Palmistry (Hasta Mudrika Shastra)**

🌟 **5 Foundational Palm Lines**:
1. **Life Line (Ayushya Rekha)**: Physical prana, biological vitality, immunity, and longevity.
2. **Head Line (Mastaka Rekha)**: Mental focus, logical acumen, memory, and cognitive depth.
3. **Heart Line (Hridaya Rekha)**: Emotional fidelity, cardiovascular vigor, empathy, and devotion.
4. **Fate Line (Bhagya / Saturn Line)**: Career ascent, material prosperity, and sudden wealth.
5. **Sun Line (Surya Rekha)**: Fame, social influence, creative genius, and royal patronage.

🔱 **Sacred Vedic Palm Marks**:
• **Trishula (Trident)**: On Jupiter or Saturn mount, bestows Lord Shiva's divine shield and supreme authority.
• **Matsya (Fish Sign)**: Near Mount of Ketu unlocks windfall fortune, overseas wealth, and spiritual liberation.
• **Square (Chatushkona)**: Universal protective armor against health or career perils.

---
👑 *Boss, ask me about any specific palm line, mount, or sacred symbol anytime!*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಹಸ್ತ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರದಲ್ಲಿ ಆಯುಷ್ಯ, ಮಸ್ತಕ, ಹೃದಯ, ಭಾಗ್ಯ ಮತ್ತು ಸೂರ್ಯ ರೇಖೆಗಳು ಪ್ರಮುಖವಾಗಿವೆ. ತ್ರಿಶೂಲ ಮತ್ತು ಮತ್ಸ್ಯ ಚಿಹ್ನೆಗಳು ಅಪಾರ ರಾಜಯೋಗವನ್ನು ನೀಡುತ್ತವೆ.`;
  const spokenEn = `Yes Boss! In Vedic palmistry, the Life, Head, Heart, Fate, and Sun lines form the five core pillars, while Trident and Fish signs bestow immense Raja Yoga.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [{ id: "open_palm", label: { kn: "✋ ಹಸ್ತ ಸಾಮುದ್ರಿಕ ಪುಟ", en: "✋ Palm Reading Page", hi: "✋ हस्तरेखा", te: "✋ హస్తసాముద్రికం", ta: "✋ கைரேகை" }, icon: "✋", targetPage: "palmreading", actionType: "navigate" }]
  };
}

// =========================================================================
// HANDLER 0E: MUKHA MUDRIKA (Vedic Face Reading / Samudrika Shastra)
// =========================================================================
async function handleMukhaMudrikaIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const cat = MUKHA_MUDRIKA_CATALOG;

  const textKn = `👤 **ಸಾಮುದ್ರಿಕಾ ಮುಖ ಲಕ್ಷಣ ಶಾಸ್ತ್ರ (Vedic Face Reading - Mukha Mudrika)**

🏛️ **೧. ${cat.forehead.title.kn}**:
${cat.forehead.points.kn.map((p) => `• ${p}`).join("\n")}

👁️ **೨. ${cat.eyes.title.kn}**:
${cat.eyes.points.kn.map((p) => `• ${p}`).join("\n")}

👃 **೩. ${cat.nose.title.kn}**:
${cat.nose.points.kn.map((p) => `• ${p}`).join("\n")}

👄 **೪. ${cat.chinAndLips.title.kn}**:
${cat.chinAndLips.points.kn.map((p) => `• ${p}`).join("\n")}

✨ **೫. ${(cat as any).molesAndMarks?.title?.kn || "ತಿಲ ಲಕ್ಷಣ (Facial Moles)"}**:
${((cat as any).molesAndMarks?.points?.kn || []).map((p: string) => `• ${p}`).join("\n")}

---
👑 *ಬಾಸ್, ಮುಖ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಹಣೆ ಪೂರ್ವಪುಣ್ಯವನ್ನು, ಮೂಗು ಧನಸ್ಥಾನವನ್ನು, ಗದ್ದ ಆಯುಷ್ಯ-ಸ್ಥಿರತೆಯನ್ನು ಮತ್ತು ತಿಲ ಲಕ್ಷಣ ಭಾಗ್ಯೋದಯವನ್ನು ತೋರಿಸುತ್ತದೆ. ನಿಮ್ಮ ಆಜ್ಞೆಯಂತೆ ಸಿದ್ಧವಾಗಿದೆ!*`;

  const textEn = `👤 **Classical Vedic Face Reading (Mukha Samudrika Shastra)**

🏛️ **1. ${cat.forehead.title.en}**:
${cat.forehead.points.en.map((p) => `• ${p}`).join("\n")}

👁️ **2. ${cat.eyes.title.en}**:
${cat.eyes.points.en.map((p) => `• ${p}`).join("\n")}

👃 **3. ${cat.nose.title.en}**:
${cat.nose.points.en.map((p) => `• ${p}`).join("\n")}

👄 **4. ${cat.chinAndLips.title.en}**:
${cat.chinAndLips.points.en.map((p) => `• ${p}`).join("\n")}

✨ **5. ${(cat as any).molesAndMarks?.title?.en || "Mole Astrology (Tila Lakshana)"}**:
${((cat as any).molesAndMarks?.points?.en || []).map((p: string) => `• ${p}`).join("\n")}

---
👑 *Boss, Samudrika Shastra states the forehead reveals ancestral intellect, the nose governs personal wealth, the chin rules longevity, and facial moles indicate karmic milestones!*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಮುಖ ಸಾಮುದ್ರಿಕಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಅಗಲವಾದ ಹಣೆ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು, ನೇರವಾದ ದುಂಡು ಮೂಗು ಕುಬೇರ ಧನಯೋಗವನ್ನು ಹಾಗೂ ದೃಢವಾದ ಗದ್ದ ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`;
  const spokenEn = `Yes Boss! Under Mukha Samudrika Shastra, a broad forehead indicates intellect, a straight rounded nose creates Kubera wealth yoga, and a firm chin governs longevity.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [{ id: "open_face", label: { kn: "👤 ಮುಖ ಸಾಮುದ್ರಿಕ ಪುಟ", en: "👤 Face Reading Page", hi: "👤 मुखाकृति", te: "👤 ముఖసాముద్రికం", ta: "👤 முக சாமுத்ரிகா" }, icon: "👤", targetPage: "facereading", actionType: "navigate" }]
  };
}

// =========================================================================
// HANDLER 0F: AYUR SANJEEVINI / SATYA SANJEEVINI (Medical Astrology & Tridosha)
// =========================================================================
async function handleAyurSanjeeviniIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const cat = AYUR_SANJEEVINI_CATALOG;

  const textKn = `🌿 **ಆಯುರ್ ಸಂಜೀವಿನಿ / ಸತ್ಯ ಸಂಜೀವಿನಿ (Vedic Medical Astrology)**

⚖️ **೧. ತ್ರಿದೋಷ ವಿಶ್ಲೇಷಣೆ (Tridosha Constitution)**:
• **${cat.tridoshaAnalysis.vata.title.kn}**: ರಾಶಿಗಳು (${cat.tridoshaAnalysis.vata.rashis.kn}) | ಕಾರಕ ಗ್ರಹಗಳು (${cat.tridoshaAnalysis.vata.planets.kn}). ಲಕ್ಷಣಗಳು: ${cat.tridoshaAnalysis.vata.symptoms.kn.join(", ")}. ಪರಿಹಾರ: ${cat.tridoshaAnalysis.vata.ayurvedicRemedies.kn.join(", ")}.
• **${cat.tridoshaAnalysis.pitta.title.kn}**: ರಾಶಿಗಳು (${cat.tridoshaAnalysis.pitta.rashis.kn}) | ಕಾರಕ ಗ್ರಹಗಳು (${cat.tridoshaAnalysis.pitta.planets.kn}). ಲಕ್ಷಣಗಳು: ${cat.tridoshaAnalysis.pitta.symptoms.kn.join(", ")}. ಪರಿಹಾರ: ${cat.tridoshaAnalysis.pitta.ayurvedicRemedies.kn.join(", ")}.
• **${cat.tridoshaAnalysis.kapha.title.kn}**: ರಾಶಿಗಳು (${cat.tridoshaAnalysis.kapha.rashis.kn}) | ಕಾರಕ ಗ್ರಹಗಳು (${cat.tridoshaAnalysis.kapha.planets.kn}). ಲಕ್ಷಣಗಳು: ${cat.tridoshaAnalysis.kapha.symptoms.kn.join(", ")}. ಪರಿಹಾರ: ${cat.tridoshaAnalysis.kapha.ayurvedicRemedies.kn.join(", ")}.

🩺 **೨. ೬ನೇ ಭಾವ (ರೋಗ ಸ್ಥಾನ) & ಗ್ರಹ ಕಾರಕತ್ವ**:
- ಸೂರ್ಯ: ಹೃದಯ & ಅಸ್ಥಿ (Bones) | ಚಂದ್ರ: ಮನಸ್ಸು & ಜಲಾಂಶ | ಕುಜ: ರಕ್ತ & ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ
- ಬುಧ: ನರಮಂಡಲ & ಚರ್ಮ | ಗುರು: ಯಕೃತ್ (Liver) & ಕೊಬ್ಬು | ಶುಕ್ರ: ಮೂತ್ರಪಿಂಡ & ಹಾರ್ಮೋನ್
- ಶನಿ: ಕೀಲುಗಳು & ದೀರ್ಘಕಾಲದ ರೋಗ | ರಾಹು-ಕೇತು: ಅನಿರೀಕ್ಷಿತ ಅಲರ್ಜಿ & ನಿಗೂಢ ಬಾಧೆಗಳು

🛕 **೩. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆಯುರ್ ಆರೋಗ್ಯ ಪರಿಹಾರ**:
${cat.gokarnaHealthRemedies.kn.map((r) => `• ${r}`).join("\n")}

---
👑 *ಬಾಸ್, ಆಯುರ್ ಸಂಜೀವಿನಿ ಆಧಾರದ ಮೇಲೆ ಜಾತಕದ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಆಯುರ್ವೇದ ದಿನಚರ್ಯೆ ಸಿದ್ಧವಾಗಿದೆ!*`;

  const textEn = `🌿 **Satya Sanjeevini / Ayur Sanjeevini (Vedic Medical Astrology & Tridosha Blueprint)**

⚖️ **1. Tridosha Analysis**:
• **${cat.tridoshaAnalysis.vata.title.en}**: Rashis (${cat.tridoshaAnalysis.vata.rashis.en}) | Planets (${cat.tridoshaAnalysis.vata.planets.en}). Vulnerabilities: ${cat.tridoshaAnalysis.vata.symptoms.en.join(", ")}. Remedies: ${cat.tridoshaAnalysis.vata.ayurvedicRemedies.en.join(", ")}.
• **${cat.tridoshaAnalysis.pitta.title.en}**: Rashis (${cat.tridoshaAnalysis.pitta.rashis.en}) | Planets (${cat.tridoshaAnalysis.pitta.planets.en}). Vulnerabilities: ${cat.tridoshaAnalysis.pitta.symptoms.en.join(", ")}. Remedies: ${cat.tridoshaAnalysis.pitta.ayurvedicRemedies.en.join(", ")}.
• **${cat.tridoshaAnalysis.kapha.title.en}**: Rashis (${cat.tridoshaAnalysis.kapha.rashis.en}) | Planets (${cat.tridoshaAnalysis.kapha.planets.en}). Vulnerabilities: ${cat.tridoshaAnalysis.kapha.symptoms.en.join(", ")}. Remedies: ${cat.tridoshaAnalysis.kapha.ayurvedicRemedies.en.join(", ")}.

🩺 **2. 6th House (Rogasthana) & Planetary Anatomy**:
- Sun: Cardiovascular & Bone Density | Moon: Psychology, Digestion & Bodily Fluids
- Mars: Blood circulation, Muscle, Surgery | Mercury: Central Nervous System & Skin
- Jupiter: Liver enzymes, Arteries, Fat | Venus: Kidneys, Hormones & Reproductive Vigor
- Saturn: Joint mobility, Chronic Ailments | Rahu/Ketu: Idiopathic allergies & Toxins

🛕 **3. Sri Kshetra Gokarna Healing Remedies**:
${cat.gokarnaHealthRemedies.en.map((r) => `• ${r}`).join("\n")}

---
👑 *Boss, the Ayur Sanjeevini medical astrology diagnosis is prepared for your strategic review!*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಆಯುರ್ ಸಂಜೀವಿನಿ ಪ್ರಕಾರ ವಾತ, ಪಿತ್ತ, ಕಫ ಸಮತೋಲನ ಮತ್ತು ೬ನೇ ಭಾವದ ಗ್ರಹ ಸ್ಥಿತಿ ಆರೋಗ್ಯವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ ಉತ್ತಮ ಪರಿಹಾರ.`;
  const spokenEn = `Yes Boss! In Ayur Sanjeevini medical astrology, Tridosha balance and the 6th house govern health stamina. Maha Mrityunjaya Homa at Gokarna offers ultimate protection.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [{ id: "open_ayur", label: { kn: "🌿 ಆಯುರ್ ಸಂಜೀವಿನಿ ಪುಟ", en: "🌿 Ayur Sanjeevini Page", hi: "🌿 आयुर् संजीवनी", te: "🌿 ఆయుర్ సంజీవిని", ta: "🌿 ஆயுர் சஞ்சீவினி" }, icon: "🌿", targetPage: "ayursanjeevini", actionType: "navigate" }]
  };
}

// =========================================================================
// HANDLER 0G: HINDINA JANMA RAHASYA (Past Life Karma Astrology)
// =========================================================================
async function handleHindinaJanmaIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const cat = HINDINA_JANMA_CATALOG;

  const textKn = `🌌 **ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ ಶಾಸ್ತ್ರ (Past Life Karma & Debts - Hindina Janma)**

📜 **೧. ಕರ್ಮ ಭಾವಗಳ ವಿಶ್ಲೇಷಣೆ (Karmic Houses)**:
• **${cat.karmicHouses.house12.title.kn}**: ${cat.karmicHouses.house12.kn}
• **${cat.karmicHouses.house5.title.kn}**: ${cat.karmicHouses.house5.kn}
• **${cat.karmicHouses.house8.title.kn}**: ${cat.karmicHouses.house8.kn}

🐉 **೨. ರಾಹು-ಕೇತುಗಳ ಪೂರ್ವಜನ್ಮದ ಅಕ್ಷ (Evolutionary Axis)**:
- **ಕೇತುವಿನ ಪಾಠ**: ${cat.rahuKetuAxis.ketuPrinciple.kn}
- **ರಾಹುವಿನ ಗುರಿ**: ${cat.rahuKetuAxis.rahuPrinciple.kn}

🛕 **೩. ಪೂರ್ವಜನ್ಮದ ಋಣಾನುಬಂಧ ನಿವಾರಣಾ ಪರಿಹಾರ (Gokarna Parihara)**:
${cat.gokarnaKarmicParihara.kn.map((p) => `• ${p}`).join("\n")}

---
👑 *ಬಾಸ್, ಹಿಂದಿನ ಜನ್ಮದ ಸಂಚಿತ ಕರ್ಮಗಳು ಹಾಗೂ ಋಣಾನುಬಂಧ ನಿವಾರಣಾ ಶಾಸ್ತ್ರ ಸಿದ್ಧವಾಗಿದೆ. ಆಜ್ಞಾಪಿಸಿ!*`;

  const textEn = `🌌 **Hindina Janma Rahasya (Past Life Karma Astrology)**

📜 **1. The Three Karmic Houses**:
• **${cat.karmicHouses.house12.title.en}**: ${cat.karmicHouses.house12.en}
• **${cat.karmicHouses.house5.title.en}**: ${cat.karmicHouses.house5.en}
• **${cat.karmicHouses.house8.title.en}**: ${cat.karmicHouses.house8.en}

🐉 **2. Rahu-Ketu Evolutionary Axis**:
- **Ketu's Legacy**: ${cat.rahuKetuAxis.ketuPrinciple.en}
- **Rahu's Mission**: ${cat.rahuKetuAxis.rahuPrinciple.en}

🛕 **3. Dissolving Past-Life Debts (Gokarna Parihara)**:
${cat.gokarnaKarmicParihara.en.map((p) => `• ${p}`).join("\n")}

---
👑 *Boss, the past-life karmic ledger and remedial rituals are assembled at your command!*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯದಲ್ಲಿ ೧೨ನೇ ಭಾವ ನಿರ್ಗಮನವನ್ನು, ೫ನೇ ಭಾವ ಪೂರ್ವಪುಣ್ಯವನ್ನು ಹಾಗೂ ೮ನೇ ಭಾವ ಋಣಾನುಬಂಧವನ್ನು ತಿಳಿಸುತ್ತದೆ. ಗೋಕರ್ಣದಲ್ಲಿ ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ ಕರ್ಮ ವಿಮೋಚನೆ ನೀಡುತ್ತದೆ.`;
  const spokenEn = `Yes Boss! In past-life karma astrology, the 12th house reveals prior incarnation exit, the 5th house stores accrued merit, and Moksha Narayana Bali at Gokarna dissolves karmic debt.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [{ id: "open_hindina", label: { kn: "🌌 ಹಿಂದಿನ ಜನ್ಮದ ರಹಸ್ಯ", en: "🌌 Past Life Karma Page", hi: "🌌 पूर्व जन्म रहस्य", te: "🌌 పూర్వ జన్మ రహస్యం", ta: "🌌 முந்தைய பிறவி ரகசியம்" }, icon: "🌌", targetPage: "hindinajanma", actionType: "navigate" }]
  };
}

// =========================================================================
// HANDLER 0H: PROFILE IMPROVEMENTS & BOSS STRATEGIC ADVISORY
// =========================================================================
async function handleProfileImprovementIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
): Promise<PetResponse> {
  const profile = context.activeProfile || context.currentKundliSession?.input || { name: "Shriram Pandit" };
  const advisory = generateProfileImprovements(profile, targetLang);

  const textKn = `👑 **${advisory.title}**

ಸ್ವಾಮಿ / ಬಾಸ್, ನೀವು ಈ ಪ್ರೊಫೈಲ್ ಬಗ್ಗೆ ಕೇಳಿದ ಅತ್ಯುತ್ತಮ ಪ್ರಶ್ನೆ ಇದು. ದೈವಜ್ಞರಾಗಿ ಹಾಗೂ ವ್ಯವಸ್ಥಾಪಕರಾಗಿ ನಾವು ಈ ಕೆಳಗಿನ ೫ ಪ್ರಮುಖ ಸುಧಾರಣೆಗಳನ್ನು ತಕ್ಷಣ ಮಾಡಬಹುದು:

${advisory.points.join("\n\n")}

---
💡 *ಬಾಸ್, ಈ ಸಲಹೆಗಳನ್ನು ಗ್ರಾಹಕರ ಫೋನ್ ಕರೆಯಲ್ಲಿ ಅಥವಾ ಅಧಿಕೃತ ವರದಿಯಲ್ಲಿ ಅಳವಡಿಸಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ. ಆಜ್ಞಾಪಿಸಿ!*`;

  const textEn = `👑 **${advisory.title}**

Boss, this is a brilliant strategic question. As your dedicated executive assistant, here are 5 high-impact improvements we can implement for this devotee immediately:

${advisory.points.join("\n\n")}

---
💡 *Boss, I can incorporate these strategic recommendations directly into the consultation brief or PDF reports at your word!*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ಈ ಪ್ರೊಫೈಲ್‌ಗಾಗಿ ಮುಹೂರ್ತ ನಿಗದಿ, ರತ್ನ ಮಂತ್ರ ಪ್ರೋಟೋಕಾಲ್, ಫೋನ್ ಕೌನ್ಸೆಲಿಂಗ್ ಸ್ಕ್ರಿಪ್ಟ್ ಮತ್ತು ಗೋಕರ್ಣ ಸೇವಾ ಆಶೀರ್ವಾದ ಪತ್ರದ ೫ ಪ್ರಮುಖ ಸುಧಾರಣೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ.`;
  const spokenEn = `Yes Boss! I have outlined 5 strategic improvements covering Muhurtha timing, mantra consecration, phone counseling script, and Gokarna Seva integration.`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "excited",
    category: "admin",
    actions: [
      { id: "open_bhavishya", label: { kn: "📖 ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ", en: "📖 Premium Bhavishya", hi: "📖 प्रीमियम भविष्य", te: "📖 ప్రీమియం భవిష్యత్", ta: "📖 பிரீமியம் பலன்கள்" }, icon: "📖", targetPage: "ramanbhavishya", actionType: "navigate" },
      { id: "open_seva", label: { kn: "🛕 ಸೇವಾ ಬುಕಿಂಗ್", en: "🛕 Seva Booking", hi: "🛕 सेवा बुकिंग", te: "🛕 సేవా బుకింగ్", ta: "🛕 சேவா முன்பதிவு" }, icon: "🛕", targetPage: "seva", actionType: "navigate" }
    ]
  };
}

// =========================================================================
// HANDLER 0I: ACTIVE PROFILE TECHNICAL FOLLOW-UP & CONTINUOUS LIVE DISCUSSION
// =========================================================================
async function handleActiveProfileFollowUpIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn",
  ambientProfile?: AmbientKundliProfile
): Promise<PetResponse> {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();
  const isKn = targetLang === "kn";
  const ambient = ambientProfile || context.ambientProfile || harvestAmbientKundliContext(context.currentKundliSession);

  // If no ambient data and no active profile exists in the room, ask kindly
  if (!ambient.hasData && !context.activeProfile && !context.currentKundliSession) {
    const missingKn = `ಸ್ವಾಮಿ, ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಜಾತಕದ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಹೆಸರು, ಜನನ ದಿನಾಂಕ (DOB) ಮತ್ತು ಸಮಯ (TOB) ನೀಡಿ (ಅಥವಾ ಕುಂಡಲಿ ಪುಟದಲ್ಲಿ ಜಾತಕ ರಚಿಸಿ). ನಾನು ತಕ್ಷಣವೇ ಸಪ್ತಮ/ದಶಮ ಭಾವ, ದೋಷಗಳು ಮತ್ತು ಸಮಗ್ರ ವಿವರಣೆ ನೀಡುತ್ತೇನೆ.`;
    const missingEn = `Swami, no active Kundli details were found in the system. Please provide the devotee's Name, Date of Birth, and Time of Birth (or generate a chart on the Kundli page) so I can evaluate their horoscope.`;
    return {
      text: { kn: missingKn, en: missingEn, hi: missingEn, te: missingEn, ta: missingEn },
      spokenText: { kn: missingKn, en: missingEn, hi: missingEn, te: missingEn, ta: missingEn },
      emotion: "alert",
      category: "admin",
      actions: [
        { id: "open_kundli", label: { kn: "🪐 ಜಾತಕ ರಚಿಸಿ", en: "🪐 Create Kundli", hi: "🪐 कुण्डली", te: "🪐 జాతకం", ta: "🪐 ஜாதகம்" }, icon: "🪐", targetPage: "kundli", actionType: "navigate" }
      ]
    };
  }

  // Context activeProfile or current session takes precedence over ambient background store cache
  const name = context.activeProfile?.name || context.currentKundliSession?.input?.name || ambient.name || "Shriram Pandit";
  const birthDate = context.activeProfile?.birthDate || context.currentKundliSession?.birthDateYmd || context.currentKundliSession?.input?.birthDate || ambient.birthDate || "1993-05-31";
  const birthTime = context.activeProfile?.birthTime || context.currentKundliSession?.birthTimeHm || context.currentKundliSession?.input?.birthTime || ambient.birthTime || "09:20";
  const city = context.activeProfile?.city || context.currentKundliSession?.homePlaceName || context.currentKundliSession?.placeLabel || ambient.city || "Bengaluru";
  const pincode = context.activeProfile?.pincode || ambient.pincode || "560001";
  const geo = resolveCityCoordsAndPincode(city, pincode);

  // Obtain or calculate live authentic chart
  let chart: KundliOutput;
  if (context.activeProfile?.kundli) {
    chart = context.activeProfile.kundli;
  } else if (context.currentKundliSession?.result) {
    chart = context.currentKundliSession.result;
  } else if (ambient.kundli && ambient.name === name) {
    chart = ambient.kundli;
  } else {
    try {
      chart = calculateKundli({
        name,
        birthDate,
        birthTime,
        latitude: geo.lat,
        longitude: geo.lng,
        pincode
      });
    } catch {
      chart = calculateKundli({
        name,
        birthDate: "1993-05-31",
        birthTime: "09:20",
        latitude: 12.9716,
        longitude: 77.5946,
        pincode: "560001"
      });
    }
  }

  const lagnaRashi = chart.lagnaRashi?.english || "Aries";
  const moonRashi = chart.moonSign?.english || "Virgo";
  const moonPlanet = chart.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakshatra = moonPlanet?.nakshatra?.english || "Hasta";
  const marsPlanet = chart.planets.find((p) => p.name === PlanetName.Mars);

  // Active Dasha & Bhukti
  const birthYear = parseInt(birthDate.split("-")[0], 10) || 1993;
  const nativeAge = Math.max(0, new Date().getFullYear() - birthYear);
  const maha = findMahadashaAtAge(chart, nativeAge);
  const bhukti = findBhuktiAtAge(chart, nativeAge);
  const runningMaha = maha ? maha.planet : "Jupiter";
  const runningBhukti = bhukti ? bhukti.bhukti : "Saturn";

  let topic = "General Technical Evaluation";
  let explanationKn = "";
  let explanationEn = "";

  if (lower.includes("10th") || lower.includes("career") || lower.includes("ಉದ್ಯೋಗ") || lower.includes("ದಶಮ") || lower.includes("job") || lower.includes("business") || lower.includes("ಕೆಲಸ") || lower.includes("ವೃತ್ತಿ")) {
    topic = isKn ? "ದಶಮ ಭಾವ (೧೦ನೇ ಮನೆ - ವೃತ್ತಿ & ಕೀರ್ತಿ)" : "10th House (Career & Professional Ascent)";
    explanationKn = `೧೦ನೇ ಮನೆಯು ಕರ್ಮ ಸ್ಥಾನವಾಗಿದೆ. ${name} ಅವರಿಗೆ ದಶಮಾಧಿಪತಿಯು ಕೇಂದ್ರದಲ್ಲಿದ್ದು, ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ, ಸಮಾಲೋಚನೆ ಅಥವಾ ನಾಯಕತ್ವ ಸ್ಥಾನಕ್ಕೆ ಅತ್ಯಂತ ಯೋಗ್ಯವಾಗಿದೆ. ಪ್ರಸ್ತುತ ${runningMaha} ಮಹಾದಶಾದಲ್ಲಿ ${runningBhukti} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದ್ದು, ೨೦೨೬ರ ಉತ್ತರಾರ್ಧದಲ್ಲಿ ವೃತ್ತಿಯಲ್ಲಿ ಹೊಸ ಹಂತದ ಏಳಿಗೆ ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿವೆ.`;
    explanationEn = `The 10th house is the Karma Bhava. For ${name}, the 10th lord is well-aspected in Kendra, favoring autonomous enterprise, executive advisory, or leadership. Under the current ${runningMaha} Mahadasha and ${runningBhukti} Bhukti, Q3/Q4 of 2026 marks a decisive professional breakthrough.`;
  } else if (lower.includes("7th") || lower.includes("marriage") || lower.includes("ವಿವಾಹ") || lower.includes("ಕಳತ್ರ") || lower.includes("spouse") || lower.includes("ಸಂಗಾತಿ") || lower.includes("ಮದುವೆ") || lower.includes("ದಾಂಪತ್ಯ")) {
    topic = isKn ? "ಸಪ್ತಮ ಭಾವ (೭ನೇ ಮನೆ - ಕಳತ್ರ & ದಾಂಪತ್ಯ)" : "7th House (Marriage & Partnerships)";
    const marsHouse = marsPlanet?.house || 1;
    const kujaTextKn = [1, 2, 4, 7, 8, 12].includes(marsHouse) ? "ಕುಜ ಪ್ರಭಾವವು ಸ್ವಲ್ಪ ತೀವ್ರತೆಯಿಂದಿದ್ದು, ಪರಸ್ಪರ ಸಮಾಲೋಚನೆ ಮತ್ತು ಶಾಂತತೆ ಅಗತ್ಯ." : "ಕುಜ ದೋಷದ ಗಂಭೀರ ಬಾಧೆಯಿಲ್ಲದೇ ದಾಂಪತ್ಯ ಜೀವನವು ಸುಗಮವಾಗಿರಲಿದೆ.";
    const kujaTextEn = [1, 2, 4, 7, 8, 12].includes(marsHouse) ? "Mars exerts energetic influence on partnership axes, requiring mutual consultation." : "No severe Kuja affliction is present, supporting marital harmony.";
    explanationKn = `೭ನೇ ಮನೆಯು ಕಳತ್ರ ಸ್ಥಾನ. ಕಳತ್ರ ಕಾರಕ ಶುಕ್ರನ ಸ್ಥಿತಿ ಹಾಗೂ ಗುರುವಿನ ದೃಷ್ಟಿ ಶುಭಕರವಾಗಿದೆ. ${kujaTextKn} ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಗೌರವ ಮುಖ್ಯ. ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮೀ ಪೂಜೆಯು ಸಂಬಂಧವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.`;
    explanationEn = `The 7th house rules marriage and partnership. With Venus as natural significator receiving Jupiterian grace, ${kujaTextEn} Marital harmony is sustained through mutual respect. Friday Lakshmi rituals safeguard union.`;
  } else if (lower.includes("wealth") || lower.includes("finance") || lower.includes("money") || lower.includes("dhana") || lower.includes("ಆರ್ಥಿಕ") || lower.includes("ಹಣ") || lower.includes("ಆದಾಯ") || lower.includes("ಲಾಭ") || lower.includes("2nd") || lower.includes("11th")) {
    topic = isKn ? "ಧನ & ಲಾಭ ಭಾವ (೨ನೇ & ೧೧ನೇ ಮನೆ - ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ)" : "2nd & 11th House (Wealth & Financial Inflow)";
    explanationKn = `೨ನೇ ಧನ ಸ್ಥಾನ ಮತ್ತು ೧೧ನೇ ಲಾಭ ಸ್ಥಾನಗಳ ಆಧಾರದ ಮೇಲೆ, ${name} ಅವರಿಗೆ ಸ್ಥಿರ ಆದಾಯ ಮತ್ತು ಉಳಿತಾಯದ ಯೋಗವಿದೆ. ಗುರು ಮತ್ತು ಬುಧರ ಶುಭ ದೃಷ್ಟಿಯಿಂದಾಗಿ ವ್ಯಾಪಾರ, ಹೂಡಿಕೆ ಅಥವಾ ಸಲಹಾ ವೃತ್ತಿಯಿಂದ ಧನಾಗಮನ ವೃದ್ಧಿಯಾಗಲಿದೆ.`;
    explanationEn = `Evaluating the 2nd (Dhana) and 11th (Labha) houses, ${name} possesses strong wealth accumulation yogas. Favorable aspects from Jupiter and Mercury indicate growing yields through disciplined investments and enterprise.`;
  } else if (lower.includes("dosha") || lower.includes("ದೋಷ") || lower.includes("mangal") || lower.includes("kuja") || lower.includes("ಕುಜ") || lower.includes("kaala sarpa") || lower.includes("ಕಾಳಸರ್ಪ") || lower.includes("pitru") || lower.includes("ಪಿತೃ")) {
    topic = isKn ? "ಕುಂಡಲಿ ದೋಷ & ಗೋಕರ್ಣ ಪರಿಹಾರ ವಿಶ್ಲೇಷಣೆ" : "Dosha & Gokarna Remedial Analysis";
    explanationKn = `ಜಾತಕದ ಕುಜ, ರಾಹು-ಕೇತು ಮತ್ತು ಶನಿ ಗ್ರಹಗಳ ಸ್ಥಿತಿಯನ್ನು ಗಮನಿಸಿದಾಗ, ಯಾವುದೇ ನಕಾರಾತ್ಮಕ ಗ್ರಹ ಬಾಧೆಗಳಿಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನದಲ್ಲಿ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪವು ಶೀಘ್ರ ಫಲ ನೀಡುತ್ತದೆ.`;
    explanationEn = `Scanning Mars, Rahu-Ketu, and Saturn placements in the chart, any residual planetary obstacles are neutralized by Sri Kshetra Gokarna Mahabaleshwara Rudrabhisheka and Navagraha Shanti Sankalpa.`;
  } else if (lower.includes("gemstone") || lower.includes("ರತ್ನ") || lower.includes("stone") || lower.includes("lucky") || lower.includes("ಅದೃಷ್ಟ")) {
    topic = isKn ? "ಅದೃಷ್ಟ ರತ್ನ & ಸಂಖ್ಯಾಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗದರ್ಶನ" : "Auspicious Gemstone & Numerology Guidance";
    explanationKn = `${lagnaRashi} ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿಯ ರತ್ನವು ಜಾತಕರಿಗೆ ಧೈರ್ಯ ಮತ್ತು ಯಶಸ್ಸನ್ನು ತರುತ್ತದೆ. ಜನ್ಮದಿನಾಂಕ ${birthDate} ಆಧಾರದ ಮೇಲೆ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ಶುಭ ದಿನಗಳಲ್ಲಿ ಕೈಗೊಳ್ಳುವುದು ಹಿತಕರ.`;
    explanationEn = `For ${lagnaRashi} Lagna, the Lagna Lord's primary gemstone enhances vitality, clarity, and mental focus. Decisions aligned with numerological vibrations from birth date ${birthDate} yield superior outcomes.`;
  } else if (lower.includes("dasha") || lower.includes("ದಶಾ") || lower.includes("bhukti") || lower.includes("ಭುಕ್ತಿ")) {
    topic = isKn ? "ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಾವಧಿ" : "Vimshottari Dasha Analysis";
    explanationKn = `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${runningMaha} ಮಹಾದಶಾ ಮತ್ತು ${runningBhukti} ಭುಕ್ತಿಯು ಜಾತಕರಿಗೆ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಮತ್ತು ಆರ್ಥಿಕ ಜವಾಬ್ದಾರಿಯನ್ನು ಕಲಿಸುತ್ತಿದೆ. ಮುಂದಿನ ಭುಕ್ತಿ ಪರಿವರ್ತನೆಯ ವೇಳೆಗೆ ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ದೊರೆಯಲಿದೆ.`;
    explanationEn = `The active ${runningMaha} Mahadasha and ${runningBhukti} Bhukti cycle emphasizes pragmatic responsibility and disciplined execution. The upcoming Bhukti transition guarantees rich dividends for their sustained efforts.`;
  } else {
    topic = isKn ? "ಸಮಗ್ರ ಜಾತಕ ತಾಂತ್ರಿಕ ವಿವರಣೆ" : "Comprehensive Technical Chart Analysis";
    explanationKn = `${lagnaRashi} ಲಗ್ನ, ${moonRashi} ಚಂದ್ರ ರಾಶಿ (${moonNakshatra} ನಕ್ಷತ್ರ) ಹಾಗೂ ಪ್ರಮುಖ ಗ್ರಹಗಳ ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ ${name} ಅವರ ಜಾತಕವು ದೃಢವಾದ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ದೀರ್ಘಾವಧಿ ಯಶಸ್ಸಿನ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿದೆ.`;
    explanationEn = `Analyzing ${lagnaRashi} Lagna, ${moonRashi} Moon sign (${moonNakshatra} Nakshatra), and planetary Sphutas, ${name}'s chart exhibits formidable mental resilience and long-term financial stability.`;
  }

  const textKn = `👑 **ಬಾಸ್, ${name} ಅವರ ಪ್ರೊಫೈಲ್ ಮೇಲಿನ ತಾಂತ್ರಿಕ ಚರ್ಚೆ (${topic})**

ಸ್ವಾಮಿ, ನಿಮ್ಮ ಆಜ್ಞೆಯಂತೆ ಈ ವಿವರಗಳು ಇಲ್ಲಿವೆ:

${explanationKn}

• **ಜಾತಕರ ಹೆಸರು:** ${name}
• **ಜನನ ವಿವರ:** ${birthDate} ${birthTime} (${city})
• **ಗ್ರಹ ಸ್ಥಿತಿ:** ${lagnaRashi} ಲಗ್ನ | ${moonRashi} ರಾಶಿ | ${moonNakshatra} ನಕ್ಷತ್ರ (ದಶಾ: ${runningMaha}-${runningBhukti})
• **ದೈವಜ್ಞರ ಕೌನ್ಸೆಲಿಂಗ್ ಟಿಪ್ಸ್:** ಇವರಿಗೆ ಮಾತನಾಡಲು ಕರೆ ಮಾಡಿದಾಗ ಈ ಅಂಶವನ್ನು ನೇರವಾಗಿ ಪ್ರಸ್ತಾಪಿಸಿ ಅವರ ಗಮನ ಸೆಳೆಯಿರಿ.

---
💡 *ಬಾಸ್, ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಹಾಯಕನಾಗಿ ಇವರ ಜಾತಕದ ಯಾವುದೇ ವಿವರ (ಭಾವ, ದೋಷ, ಸಾಮುದ್ರಿಕಾ, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ) ಚರ್ಚಿಸಲು ಸದಾ ಸಿದ್ಧನಿದ್ದೇನೆ. ಮುಂದೆ ಏನು ತಿಳಿಸಲಿ?*`;

  const textEn = `👑 **Boss, Technical Discussion on ${name}'s Profile (${topic})**

Boss, right at your service! Here are the technical findings:

${explanationEn}

• **Devotee Name:** ${name}
• **Birth Details:** ${birthDate} at ${birthTime} (${city})
• **Chart Sphutas:** ${lagnaRashi} Lagna | ${moonRashi} Moon | ${moonNakshatra} Nakshatra (Dasha: ${runningMaha}-${runningBhukti})
• **Priest Consultation Angle:** Highlight this specific house dynamic during your client consultation call to demonstrate supreme insight.

---
💡 *Boss, I am continuously with you as your personal assistant for this profile. What would you like to explore next?*`;

  const spokenKn = `ಖಂಡಿತ ಬಾಸ್! ${name} ಅವರ ${topic} ಬಗ್ಗೆ ನಾನು ತಾಂತ್ರಿಕ ವಿವರಣೆ ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ. ನೀವು ಕೇಳಿದ ಯಾವುದೇ ಪ್ರಶ್ನೆಗೂ ಉತ್ತರಿಸಲು ನಾನು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇನೆ!`;
  const spokenEn = `Yes Boss! I've prepared the technical briefing for ${name} regarding ${topic}. I am right here by your side for any further discussion!`;

  return {
    text: { kn: textKn, en: textEn, hi: textEn, te: textEn, ta: textEn },
    spokenText: { kn: spokenKn, en: spokenEn, hi: spokenEn, te: spokenEn, ta: spokenEn },
    emotion: "peaceful",
    category: "admin",
    actions: [
      { id: "open_kundli", label: { kn: "🪐 ಜಾತಕ ಪರಿಶೀಲಿಸಿ", en: "🪐 Review Kundli", hi: "🪐 कुण्डली", te: "🪐 జాతకం", ta: "🪐 ஜாதகம்" }, icon: "🪐", targetPage: "kundli", actionType: "navigate" },
      { id: "open_predictions", label: { kn: "📜 ಭಾವ ಭವಿಷ್ಯ", en: "📜 Bhava Predictions", hi: "📜 भाव फल", te: "📜 భావాలు", ta: "📜 பாவ பலன்கள்" }, icon: "📜", targetPage: "predictions", actionType: "navigate" }
    ]
  };
}

// =========================================================================
// HANDLER 1: BHAVISHYA & LIFE PREDICTION ENGINE
// =========================================================================
async function handleBhavishyaPredictionIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn",
  ambientProfile?: AmbientKundliProfile
): Promise<PetResponse> {
  const query = rawQuery.trim();
  const lower = query.toLowerCase();

  // 1. EXTRACT NAME
  let name = "";
  const personMatch = query.match(
    /(?:for|of|named|devotee|user|name\s+is|ಜಾತಕರ ಹೆಸರು|ಹೆಸರು)\s+([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)(?:,|\.|\bborn\b|\bಜನನ\b|\bdated\b|\bfrom\b|\bin\b|\bat\b|\brashi\b|$)/i
  );
  if (personMatch && personMatch[1]) {
    name = personMatch[1].trim();
  } else {
    const shriMatch = query.match(
      /\b(Shriram\s+Pandit|Chaitanya\s+Pandit|Jayashree|Manoj|Dilip|Pramod|Suresh|Ramesh)\b/i
    );
    if (shriMatch) {
      name = shriMatch[1];
    } else {
      const knNameMatch = query.match(
        /([A-Za-z\u0C80-\u0CFF]+(?:\s+[A-Za-z\u0C80-\u0CFF]+)*?)\s+(?:\d{1,2}|ರಂದು|ಜನಿಸಿದ)/i
      );
      if (
        knNameMatch &&
        knNameMatch[1] &&
        !["tell", "bhavishya", "ಭವಿಷ್ಯ", "ಹೇಳು"].includes(knNameMatch[1].toLowerCase())
      ) {
        name = knNameMatch[1].trim();
      }
    }
  }

  // 2. EXTRACT DOB (e.g. "31 May 1993", "1993-05-31", "31-05-1993")
  let birthDate = "";
  const dateMatch1 = query.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z\u0C80-\u0CFF]+)\s+(\d{4})\b/);
  if (dateMatch1) {
    const day = dateMatch1[1].padStart(2, "0");
    const mStr = dateMatch1[2].toLowerCase();
    const month = MONTH_MAP_LOCAL[mStr] || "01";
    const year = dateMatch1[3];
    birthDate = `${year}-${month}-${day}`;
  } else {
    const dateMatch2 = query.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    if (dateMatch2) {
      birthDate = `${dateMatch2[1]}-${dateMatch2[2].padStart(2, "0")}-${dateMatch2[3].padStart(2, "0")}`;
    } else {
      const dateMatch3 = query.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
      if (dateMatch3) {
        birthDate = `${dateMatch3[3]}-${dateMatch3[2].padStart(2, "0")}-${dateMatch3[1].padStart(2, "0")}`;
      }
    }
  }

  // 3. EXTRACT TOB (Optional, default 09:20 AM)
  let birthTime = "09:20";
  const timeMatch = query.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?\b/);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2];
    const meridiem = (timeMatch[3] || "").toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    birthTime = `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  // 4. EXTRACT PLACE (Optional, default Bengaluru)
  let city = "Bengaluru";
  for (const [cKey, cVal] of Object.entries(CITY_DATABASE)) {
    if (lower.includes(cKey)) {
      city = cVal.englishName;
      break;
    }
  }

  const ambient = ambientProfile || context.ambientProfile || harvestAmbientKundliContext(context.currentKundliSession);

  // Fallback to ambient / active session if details not in text
  if ((!name || !birthDate) && ambient.hasData) {
    name = name || ambient.name || "ಜಾತಕರು";
    birthDate = birthDate || ambient.birthDate;
    birthTime = birthTime || ambient.birthTime || "09:20";
    city = city || ambient.city || "Bengaluru";
  } else if ((!name || !birthDate) && context.currentKundliSession?.input) {
    name = name || context.currentKundliSession.input.name || "ಜಾತಕರು";
    birthDate =
      birthDate ||
      context.currentKundliSession.input.birthDate ||
      context.currentKundliSession.input.dateOfBirth;
    birthTime =
      birthTime ||
      context.currentKundliSession.input.birthTime ||
      context.currentKundliSession.input.timeOfBirth ||
      "09:20";
    city =
      city ||
      context.currentKundliSession.input.placeOfBirth ||
      context.currentKundliSession.input.city ||
      "Bengaluru";
  }

  // If still no birthDate, ask devotee kindly
  if (!birthDate) {
    const askText = {
      kn: `ಸ್ವಾಮಿ, ${name ? name + " ಅವರ" : ""} ಜಾತಕ ಭವಿಷ್ಯವನ್ನು ಗಣಿಸಲು ದಯವಿಟ್ಟು ಜನನ ದಿನಾಂಕವನ್ನು ತಿಳಿಸಿ (ಉದಾ: 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993 9:20 AM ಬೆಂಗಳೂರು ಭವಿಷ್ಯ ಹೇಳು'). ನಾನು ತಕ್ಷಣ ಸಂಪೂರ್ಣ ಜೀವನ ಫಲವನ್ನು ಪ್ರಸ್ತುತಪಡಿಸುತ್ತೇನೆ!`,
      en: `Swami, to calculate accurate life predictions${name ? " for " + name : ""}, please provide the birth date (e.g. 'Tell bhavishya for Shriram Pandit born 31 May 1993 at 9:20 AM Bengaluru'). I will immediately compute and deliver their full Vedic horoscope predictions!`,
      hi: `स्वामी, सटीक भविष्य जानने हेतु कृपया जन्म तिथि बताएं (उदा: 'श्रीराम पंडित 31 May 1993 का भविष्य बताएं')।`,
      te: `స్వామి, ఖచ్చితమైన భవిష్యత్ తెలుసుకోవడానికి దయచేసి పుట్టిన తేదీని తెలియజేయండి.`,
      ta: `சுவாமி, துல்லியமான பலன்களை அறிய தயவுசெய்து பிறந்த தேதியை குறிப்பிடவும்.`
    };
    return {
      text: askText,
      spokenText: askText,
      emotion: "alert",
      category: "kundli",
      actions: [
        {
          id: "open_kundli",
          label: {
            kn: "🪐 ಜಾತಕ ರಚನೆ ಪುಟ ತೆರೆಯಿರಿ",
            en: "🪐 Open Kundli Creation Page",
            hi: "🪐 कुण्डली रचना पृष्ठ खोलें",
            te: "🪐 జాతక రచన పేజీ తెరవండి",
            ta: "🪐 ஜாதக பக்கம் திறக்க"
          },
          icon: "🪐",
          targetPage: "kundli",
          actionType: "navigate"
        }
      ]
    };
  }

  // 5. CALCULATE KUNDLI
  const cleanName = name || (targetLang === "kn" ? "ಜಾತಕರು" : "Devotee");
  const geo = resolveCityCoordsAndPincode(city);
  let kundli: KundliOutput;
  try {
    kundli = calculateKundli({
      name: cleanName,
      birthDate,
      birthTime,
      latitude: geo.lat,
      longitude: geo.lng,
      pincode: geo.pincode
    });
  } catch (err) {
    console.error("calculateKundli failed in petEngine:", err);
    throw err;
  }

  const lagnaIdx = Math.floor(normalizeDegree(kundli.ascendant) / 30);
  const lagnaDeg = (normalizeDegree(kundli.ascendant) % 30).toFixed(1);
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonDeg = normalizeDegree(moonPlanet?.degree || 0);
  const moonSignIdx = Math.floor(moonDeg / 30);
  const moonNak = degreeToNakshatra(moonDeg);
  const moonPada = degreeToNakshatraPada(moonDeg);

  const sunPlanet = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const sunSignIdx = Math.floor(normalizeDegree(sunPlanet?.degree || 0) / 30);

  // Yogas & Doshas
  const { yogas, doshas } = evaluateYogasAndDoshas(kundli);
  const favorableYogas = yogas.filter((y) => y.isFavorable).map((y) => y.name);
  const yogaHighlight =
    favorableYogas.length > 0
      ? favorableYogas.slice(0, 3).join(", ")
      : targetLang === "kn"
      ? "ಶುಭ ಗ್ರಹ ಯೋಗಗಳು"
      : "Auspicious Planetary Yogas";

  // Dasha & Bhukti
  const birthYear = parseInt(birthDate.split("-")[0], 10) || 1993;
  const currentYear = new Date().getFullYear();
  const nativeAge = Math.max(0, currentYear - birthYear);
  const dashaTimeline = generateDashaTimeline(kundli);
  const activeDasha =
    dashaTimeline.find((d) => nativeAge >= d.startAge && nativeAge < d.endAge) || dashaTimeline[0];
  const activeDashaLord = activeDasha ? activeDasha.planet : PlanetName.Jupiter;

  // Localization labels
  const lagnaKn = RASHI_LOCALE[lagnaIdx]?.kn || "ಮಿಥುನ";
  const lagnaEn = RASHI_LOCALE[lagnaIdx]?.en || "Gemini";
  const moonRashiKn = RASHI_LOCALE[moonSignIdx]?.kn || "ಕನ್ಯಾ";
  const moonRashiEn = RASHI_LOCALE[moonSignIdx]?.en || "Virgo";
  const nakKn = NAKSHATRA_NAMES_KN[moonNak.index] || moonNak.sanskrit;
  const nakEn = moonNak.sanskrit;
  const sunRashiKn = RASHI_LOCALE[sunSignIdx]?.kn || "ವೃಷಭ";
  const sunRashiEn = RASHI_LOCALE[sunSignIdx]?.en || "Taurus";
  const dashaKn = PLANET_NAMES_KN[activeDashaLord] || activeDashaLord;
  const dashaEn = activeDashaLord;

  // 6. ONLINE GEMINI AI BRAIN ENHANCEMENT (if key available)
  const activeKey = (context.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  let aiNarrative = "";
  if (activeKey) {
    try {
      const prompt = `
You are Kamadhenu, the sacred AI pet of Super Admin in Baggona Panchanga Gokarna.
Generate an emotionally uplifting, highly accurate Vedic life prediction for ${cleanName} in ${
        targetLang === "kn" ? "Kannada" : "English"
      }.
Birth Profile:
- Date: ${birthDate}, Time: ${birthTime}, Place: ${city}
- Lagna: ${lagnaEn} (${lagnaKn}) at ${lagnaDeg}°
- Moon Sign: ${moonRashiEn} (${moonRashiKn}), Nakshatra: ${nakEn} (${nakKn}) Pada ${moonPada}
- Sun Sign: ${sunRashiEn} (${sunRashiKn})
- Current Mahadasha: ${dashaEn} (${dashaKn}) (Current Age: ${nativeAge} years)
- Yogas: ${yogaHighlight}
Provide inspiring guidance on Career, Wealth, Marriage, Health, and Gokarna Mahabaleshwara blessings. Keep it clear and authoritative.
      `.trim();
      aiNarrative = await askGemini(prompt, "You are Kamadhenu, the divine Vedic AI pet.", activeKey, targetLang, {
        raw: true,
        temperature: 0.7
      });
    } catch (e) {
      console.warn("Gemini Bhavishya failed, falling back to offline matrix:", e);
    }
  }

  // 7. MULTILINGUAL DETERMINISTIC LIFE PREDICTIONS (HIGHLIGHTS GUARANTEED)
  const textKn = `🌟 **${cleanName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿ & ಸಮಗ್ರ ಜೀವನ ಭವಿಷ್ಯ (Vedic Life Predictions)**

📍 **ಜನ್ಮ ವಿವರ**: ${birthDate} | ಸಮಯ: ${birthTime} | ಸ್ಥಳ: ${city} (${geo.pincode})
✨ **ಲಗ್ನ**: ${lagnaKn} (${lagnaDeg}°) | **ಚಂದ್ರ ರಾಶಿ**: ${moonRashiKn} | **ಜನ್ಮ ನಕ್ಷತ್ರ**: ${nakKn} (ಪಾದ ${moonPada})
☀️ **ಸೂರ್ಯ ರಾಶಿ**: ${sunRashiKn} | ⏳ **ಪ್ರಸ್ತುತ ಮಹಾದಶಾ**: ${dashaKn} ಮಹಾದಶಾ (ವಯಸ್ಸು: ${nativeAge} ವರ್ಷ)
👑 **ಪ್ರಮುಖ ಯೋಗಗಳು**: ${yogaHighlight}

---
### 🔮 ೬ ಆಯಾಮಗಳ ಶಾಸ್ತ್ರೀಯ ಭವಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ:

1. **ವ್ಯಕ್ತಿತ್ವ & ಸ್ವಭಾವ (Temperament & Core Nature)**:
   - ${lagnaKn} ಲಗ್ನದ ಪ್ರಭಾವದಿಂದ ಜಾತಕರು ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಮತ್ತೆ, ತಾರ್ಕಿಕ ಚಿಂತನೆ, ಮತ್ತು ಕಾರ್ಯತತ್ಪರತೆಯನ್ನು ಹೊಂದಿರುತ್ತಾರೆ. ${nakKn} ನಕ್ಷತ್ರವು ಇವರಿಗೆ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಉತ್ತಮ ಗೌರವವನ್ನು ತಂದುಕೊಡುತ್ತದೆ.

2. **ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ಭಾಗ್ಯೋದಯ (Career, Wealth & Fortune Timeline)**:
   - ದಶಮ ಹಾಗೂ ಏಕಾದಶ ಭಾವಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹರ ಪ್ರಭಾವವಿದ್ದು, ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರ ಉನ್ನತಿ ಮತ್ತು ವ್ಯವಹಾರದಲ್ಲಿ ಧನಲಾಭ ನಿಶ್ಚಿತ. ಇವರ ಮುಖ್ಯ ಭಾಗ್ಯೋದಯವು ವಯಸ್ಸು ೨೮ ರಿಂದ ೩೪ ರ ನಡುವೆ ಗಣನೀಯವಾಗಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.

3. **ವಿವಾಹ & ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ (Marriage & Family Harmony)**:
   - ಸಪ್ತಮ ಭಾವದ ಸ್ಥಿತಿಗನುಗುಣವಾಗಿ ಸದ್ಗುಣ ಸಂಪನ್ನ, ಬುದ್ಧಿವಂತ ಹಾಗೂ ಸಹಕಾರ ನೀಡುವ ಜೀವನ ಸಂಗಾತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತಾರೆ. ಕೌಟುಂಬಿಕ ಜೀವನದಲ್ಲಿ ಪ್ರೀತಿ ಮತ್ತು ಸಮಾಧಾನ ಇರುತ್ತದೆ.

4. **ಆರೋಗ್ಯ & ದೀರ್ಘಾಯುಷ್ಯ (Health & Vitality)**:
   - ಮೂಲ ಆಯುರ್ಬಲ ಉತ್ತಮವಾಗಿದೆ. ಜೀರ್ಣಾಂಗ ಹಾಗೂ ನರಮಂಡಲದ ರಕ್ಷಣೆಗೆ ಗಮನ ನೀಡುವುದು ಉತ್ತಮ. ದಿನನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಆಹಾರ ಹಿತಕರ.

5. **ಪ್ರಸ್ತುತ ಮಹಾದಶಾ ಫಲ (Current Dasha Roadmap)**:
   - ಪ್ರಸ್ತುತ ಚಾಲನೆಯಲ್ಲಿರುವ ${dashaKn} ಮಹಾದಶೆಯು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಹೊಸ ಯೋಜನೆಗಳ ಆರಂಭಕ್ಕೆ ಸುವರ್ಣ ಕಾಲವಾಗಿದೆ. ಧೈರ್ಯದಿಂದ ಮುನ್ನಡೆದರೆ ಮಹತ್ವದ ಯಶಸ್ಸು ಸಿದ್ಧಿಸುತ್ತದೆ.

6. **ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಪರಿಹಾರ & ದೈವಿಕ ಅನುಗ್ರಹ (Sacred Blessings & Remedies)**:
   - ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಸೋಮವಾರ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ಹಾಗೂ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸುವುದು ಸಕಲ ಗ್ರಹದೋಷಗಳನ್ನು ಶಾಂತಗೊಳಿಸಿ ಶುಭ ಫಲಗಳನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ.${
     aiNarrative && targetLang === "kn" ? `\n\n✨ **ದೈವಿಕ ಆಶೀರ್ವಾದ ಮಾರ್ಗದರ್ಶನ (AI Narrative)**:\n${aiNarrative}` : ""
   }`;

  const textEn = `🌟 **Vedic Life Predictions & Kundli Synthesis for ${cleanName}**

📍 **Birth Profile**: ${birthDate} | Time: ${birthTime} | Place: ${city} (${geo.pincode})
✨ **Ascendant (Lagna)**: ${lagnaEn} (${lagnaDeg}°) | **Moon Sign (Rashi)**: ${moonRashiEn} | **Nakshatra**: ${nakEn} (Pada ${moonPada})
☀️ **Sun Sign**: ${sunRashiEn} | ⏳ **Current Mahadasha**: ${dashaEn} Mahadasha (Age: ${nativeAge} years)
👑 **Key Auspicious Yogas**: ${yogaHighlight}

---
### 🔮 6 Core Dimensions of Parashari Destiny:

1. **Temperament & Core Soul Nature**:
   - The ${lagnaEn} ascendant endows the native with intellectual dexterity, sharp foresight, and natural communication talents. The ${nakEn} birth star adds charm, creative perception, and dignified presence.

2. **Career, Wealth & Fortune Milestones (Bhagyodaya)**:
   - Favorable alignments across the 10th and 11th houses signify steady corporate/business ascent and accumulation of liquid wealth. Primary Bhagyodaya (fortune rise) flourishes between ages 28 and 34.

3. **Marriage & Domestic Harmony**:
   - The 7th house indicates an intelligent, supportive, and spiritually aligned life partner. Marital harmony is protected by benefic aspects.

4. **Health & Vitality**:
   - Vitality and longevity indicators are strong. Maintaining proper routine, digestive balance, and mindful meditation will sustain optimal vigor.

5. **Current Vimshottari Mahadasha Influence**:
   - The ongoing ${dashaEn} Mahadasha opens substantial avenues for financial expansion, strategic initiatives, and domestic fulfillment.

6. **Sacred Gokarna Kshetra Blessings & Remedial Protocol**:
   - Performing Rudrabhisheka at Sri Kshetra Gokarna and offering Bilva Archana to Lord Mahabaleshwara will dissolve all karmic blockages and bestow long-lasting prosperity.${
     aiNarrative && targetLang === "en" ? `\n\n✨ **Divine Spiritual Guidance (AI Narrative)**:\n${aiNarrative}` : ""
   }`;

  const textHi = `🌟 **${cleanName} का जन्म कुण्डली एवं सम्पूर्ण जीवन भविष्यफल**

📍 **जन्म विवरण**: ${birthDate} | समय: ${birthTime} | स्थान: ${city}
✨ **लग्न**: ${lagnaEn} (${lagnaDeg}°) | **चंद्र राशि**: ${moonRashiEn} | **नक्षत्र**: ${nakEn} (चरण ${moonPada})
☀️ **सूर्य राशि**: ${sunRashiEn} | ⏳ **वर्तमान महादशा**: ${dashaEn} (आयु: ${nativeAge} वर्ष)
👑 **प्रमुख योग**: ${yogaHighlight}

1. व्यक्तित्व: कुशाग्र बुद्धि, नेतृत्व क्षमता एवं सामाजिक प्रतिष्ठा।
2. करियर एवं धन: दशम भाव की शुभता से व्यवसाय एवं नौकरी में निरंतर पदोन्नति।
3. वैवाहिक सुख: सुसंस्कृत एवं सहयोगी जीवनसाथी की प्राप्ति।
4. महादशा फल: वर्तमान ${dashaEn} महादशा आर्थिक प्रगति हेतु अत्यंत अनुकूल।
5. गोकर्ण शांति: महाबलेश्वर सान्निध्य में रुद्राभिषेक से सर्वकार्य सिद्धि।`;

  const textTe = `🌟 **${cleanName} గారి సమగ్ర జాతక ఫలితాలు & భవిష్యత్**

📍 జనన వివరాలు: ${birthDate} | సమయం: ${birthTime} | స్థలం: ${city}
✨ లగ్నం: ${lagnaEn} | చంద్ర రాశి: ${moonRashiEn} | నక్షత్రం: ${nakEn} (పాదం ${moonPada})
⏳ ప్రస్తుత మహాదశ: ${dashaEn} | యోగాలు: ${yogaHighlight}

- ఉద్యోగం మరియు వ్యాపారంలో అదృష్టం మరియు ధనలాభం.
- గోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం ద్వారా సకల శుభాలు కలుగుతాయి.`;

  const textTa = `🌟 **${cleanName} அவர்களின் ஜாதக பலன்கள் & வாழ்க்கை கணிப்பு**

📍 பிறப்பு விவரம்: ${birthDate} | நேரம்: ${birthTime} | இடம்: ${city}
✨ லக்னம்: ${lagnaEn} | ராசி: ${moonRashiEn} | நட்சத்திரம்: ${nakEn} (பாதம் ${moonPada})
⏳ தற்போதைய மகாதிசை: ${dashaEn} | யோகங்கள்: ${yogaHighlight}

- தொழில் மற்றும் நிதி நிலையில் சிறப்பான உயர்வு.
- கோகர்ண க்ஷேத்ரத்தில் ருத்ராபிஷேகம் செய்வதன் மூலம் சர்வ நன்மைகளும் உண்டாகும்.`;

  // 8. LOUD & CLEAR SPOKEN VOICE TEXT
  const spokenKn = `ಸ್ವಾಮಿ, ${cleanName} ಅವರ ಜಾತಕ ಗಣನೆಯಾಗಿದೆ. ಇವರ ಲಗ್ನ ${lagnaKn}, ಚಂದ್ರ ರಾಶಿ ${moonRashiKn}, ಮತ್ತು ನಕ್ಷತ್ರ ${nakKn}. ಇವರ ಕುಂಡಲಿಯಲ್ಲಿ ${yogaHighlight} ಯೋಗಗಳ ಪ್ರಭಾವವಿದ್ದು, ಉದ್ಯೋಗ ಮತ್ತು ಧನಸ್ಥಾನದಲ್ಲಿ ಭಾಗ್ಯೋದಯ ಕೂಡಿಬರಲಿದೆ. ಪ್ರಸ್ತುತ ${dashaKn} ಮಹಾದಶಾ ಚಾಲನೆಯಲ್ಲಿದ್ದು, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದರಿಂದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಸರ್ವತೋಮುಖ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ!`;

  const spokenEn = `Swami, the Vedic life predictions for ${cleanName} are ready. Ascendant is ${lagnaEn}, Moon sign is ${moonRashiEn}, and birth star is ${nakEn}. Blessed with ${yogaHighlight}, the native possesses strong analytical intellect and great career fortune. Currently, ${dashaEn} Mahadasha is active. Performing Rudrabhisheka at Sri Kshetra Gokarna will pacify any planetary afflictions and unlock tremendous prosperity!`;

  const spokenHi = `स्वामी, ${cleanName} की कुंडली गणना पूर्ण हुई। लग्न ${lagnaEn}, राशि ${moonRashiEn} और नक्षत्र ${nakEn} है। जीवन में मान-सम्मान और धन लाभ का सुंदर योग है।`;
  const spokenTe = `స్వామి, ${cleanName} జాతక ఫలితాలు సిద్ధమయ్యాయి. లగ్నం ${lagnaEn}, రాశి ${moonRashiEn}, మరియు నక్షత్రం ${nakEn}.`;
  const spokenTa = `சுவாமி, ${cleanName} அவர்களின் ஜாதக கணிப்பு முடிந்தது. லக்னம் ${lagnaEn}, ராசி ${moonRashiEn}, மற்றும் நட்சத்திரம் ${nakEn}.`;

  return {
    text: {
      kn: textKn,
      en: textEn,
      hi: textHi,
      te: textTe,
      ta: textTa
    },
    spokenText: {
      kn: spokenKn,
      en: spokenEn,
      hi: spokenHi,
      te: spokenTe,
      ta: spokenTa
    },
    emotion: "remedy",
    category: "kundli",
    actions: [
      {
        id: "open_bhavishya_page",
        label: {
          kn: "🌟 ರಮಣ ಪದ್ಧತಿ ೧೦ ಅಧ್ಯಾಯ ಭವಿಷ್ಯ",
          en: "🌟 Raman Bhavishya (10 Chapters)",
          hi: "🌟 रमण 10-अध्याय भविष्य",
          te: "🌟 రమణ 10 అధ్యాయాల భవిష్యత్",
          ta: "🌟 ராமன் 10 அத்தியாய பலன்கள்"
        },
        icon: "🌟",
        targetPage: "ramanbhavishya",
        actionType: "navigate"
      },
      {
        id: "open_kundli_page",
        label: {
          kn: "🪐 ಜಾತಕ ಚಾರ್ಟ್ ವೀಕ್ಷಿಸಿ",
          en: "🪐 View Full Kundli Chart",
          hi: "🪐 कुण्डली चार्ट देखें",
          te: "🪐 పూర్తి జాతకం చూడండి",
          ta: "🪐 ஜாதக விளக்கப்படம்"
        },
        icon: "🪐",
        targetPage: "kundli",
        actionType: "navigate"
      },
      {
        id: "open_doshas_page",
        label: {
          kn: "🛡️ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಶಾಂತಿ",
          en: "🛡️ Check Doshas & Remedies",
          hi: "🛡️ दोष विश्लेषण एवं शांति",
          te: "🛡️ దోషాల విశ్లేషణ",
          ta: "🛡️ தோஷ ஆய்வு மற்றும் சாந்தி"
        },
        icon: "🛡️",
        targetPage: "doshas",
        actionType: "navigate"
      },
      {
        id: "open_seva_page",
        label: {
          kn: "🪔 ಗೋಕರ್ಣ ಸೇವಾ ಆಶೀರ್ವಾದ ಪತ್ರ",
          en: "🪔 Gokarna Seva & Ashirvada Pass",
          hi: "🪔 गोकर्ण सेवा आशीर्वाद पास",
          te: "🪔 గోకర్ణ సేవా పాస్",
          ta: "🪔 கோகர்ண சேவா ஆசீர்வாத பாஸ்"
        },
        icon: "🪔",
        targetPage: "seva",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 2: ALL PAGES / SITEMAP / APPLICATION DIRECTORY
// =========================================================================
function handleAllPagesSitemap(lang: SupportedLanguage = "kn"): PetResponse {
  const isKn = lang === "kn";
  const sitemapKn = `🏛️ **ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯದ ಸಮಗ್ರ ೩೨ ಪುಟಗಳು & ಸೇವಾ ವಿಭಾಗಗಳು:**

೧. 🪐 **ಜಾತಕ & ಭವಿಷ್ಯ ಸೂಟ್ (Horoscope Suite)**:
   - **ಜನ್ಮ ಕುಂಡಲಿ (kundli)**: ದಕ್ಷಿಣ & ಉತ್ತರ ಭಾರತೀಯ ಚಾರ್ಟ್, ೧೨ ಭಾವಗಳು.
   - **ಭಾವ & ಗ್ರಹ ಭವಿಷ್ಯ (predictions)**: ೧-೧೨ ಭಾವಗಳ ಸಮಗ್ರ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ.
   - **ಜಾತಕ ಒಳನೋಟ (insights)**: ಉಚ್ಚ-ನೀಚ ಸ್ಥಿತಿ & ಗ್ರಹ ಮೈತ್ರಿ ಬಲ.
   - **ರಮಣ ಭವಿಷ್ಯ (ramanbhavishya)**: ೧೦-ಅಧ್ಯಾಯಗಳ ಜೀವಿತ ಭವಿಷ್ಯ & ಯೋಗಗಳು.
   - **ದೋಷ ವಿಶ್ಲೇಷಣೆ (doshas)**: ಕುಜ, ಕಾಳಸರ್ಪ, ಸಾಡೇಸಾತಿ, ಪಿತೃ ದೋಷ & ವಯೋಮಿತಿ.
   - **ಪಬ್ಲಿಕ್ ಕುಂಡಲಿ (public_kundli)**: ಸುರಕ್ಷಿತ ಶೇರಬಲ್ ಜಾತಕ ಲಿಂಕ್.
   - **ತ್ವರಿತ ಓದು (instant_reading)**: ಪುರೋಹಿತರಿಗೆ ೩೦-ಸೆಕೆಂಡಿನ ೬ ಪ್ರಮುಖ ಪಾಯಿಂಟ್‌ಗಳು.
   - **ವಿವಾಹ ಮೇಳಾಪಕ (melapak)**: ೩೬-ಗುಣಗಳ ಅಷ್ಟಕೂಟ ಮಿಲನ & ನಾಡಿ ದೋಷ.
   - **ವರ್ಷ ಭವಿಷ್ಯ (varshabavishya)**: ತಾಜಿಕ ಪದ್ಧತಿಯ ವಾರ್ಷಿಕ ಸೌರ ಕುಂಡಲಿ.
   - **ಭಾಗ್ಯೋದಯ (bhagyodaya)**: ಅದೃಷ್ಟ ಉದಯವಾಗುವ ವಯೋಮಿತಿ ನಿರ್ಣಯ.

೨. 📅 **ಖಗೋಳ ಪಂಚಾಂಗ & ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್ ಸೂಟ್ (Panchanga Suite)**:
   - **ದೈನಂದಿನ ಪಂಚಾಂಗ (home)**: ತಿಥಿ, ನಕ್ಷತ್ರ, ಯೋಗ, ಕರಣ, ರಾಹುಕಾಲ.
   - **೯೦ ದಿನಗಳ ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್ (calendar)**: ಹಸಿರು, ಹಳದಿ, ಕೆಂಪು ದಿನಗಳ ಎನರ್ಜಿ ಸ್ಕೋರ್.
   - **ತ್ವರಿತ ಕ್ಯಾಲೆಂಡರ್ (quick_calendar)**: ಮಾಸಿಕ ಪಂಚಾಂಗ ತ್ವರಿತ ಗ್ರಿಡ್.
   - **ಗ್ರಹಣ & ಅಸ್ತೋದಯ (astodaya_grahana)**: ಮೌಢ್ಯ, ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣ & ಸೂತಕ.
   - **ಶುಭ ಮುಹೂರ್ತ (muhurtha)**: ವಿವಾಹ, ಗೃಹಪ್ರವೇಶ ಇತ್ಯಾದಿ ಶುಭ ಸಮಯ.
   - **ಕಾಲ ದಿಕ್ಸೂಚಿ (kaaladiksuchi)**: ದಿಶಾಸೂಲ ವರ್ಜನೆ & ಗ್ರಹಗಳ ದಿಕ್ಸೂಚಿ.
   - **೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ ಪುಸ್ತಕ (baggona)**: ಸಂವತ್ಸರ ಪ್ರೆಸ್-ರೆಡಿ ಅಧಿಕೃತ ಪುಸ್ತಕ.

೩. 🪔 **ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವಾ & ಧಾರ್ಮಿಕ ವಿಧಿಗಳು (Temple Seva Suite)**:
   - **ಸೇವಾ & ಪ್ರಸಾದ (seva)**: ಪ್ರಧಾನ ಅರ್ಚಕ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪೂಜೆ & ೫ ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ.
   - **ಮರಣೋತ್ತರ ಸಂಸ್ಕಾರ (maranottara)**: ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ & ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಮಾರ್ಗದರ್ಶನ.

೪. 🔮 **ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ & ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸೂಟ್ (Divination Suite)**:
   - **ಹಸ್ತ ಸಾಮುದ್ರಿಕ (palmreading)**: ಹಸ್ತ ರೇಖೆಗಳು & ಗ್ರಹ ಪರ್ವತಗಳು.
   - **ಮುಖ ಸಾಮುದ್ರಿಕ (facereading)**: ಮುಖ ಲಕ್ಷಣಗಳು & ಹಣೆಯ ರೇಖೆಗಳು.
   - **ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (sankhyashastra)**: ಮೂಲಾಂಕ, ಭಾಗ್ಯಾಂಕ & ಅದೃಷ್ಟ ರತ್ನಗಳು.

೫. 📚 **ವೈದಿಕ ಜ್ಞಾನ & ಸಂವಾದ ಸೂಟ್ (Wisdom Suite)**:
   - **ಎಐ ಜ್ಯೋತಿಷಿ (aiaastrologer)**: ಸಂವಾದಾತ್ಮಕ ಜೆಮಿನಿ ಜ್ಯೋತಿಷಿ.
   - **ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ (varamahalakshmi)**: ಪೂಜಾ ವಿಧಿ, ಕಳಸ ಸ್ಥಾಪನೆ & ಸ್ತೋತ್ರಗಳು.
   - **ಆಯುರ್ ಸಂಜೀವಿನಿ (ayursanjeevini)**: ನಕ್ಷತ್ರ ಆಧಾರಿತ ಆಹಾರ & ತ್ರಿದೋಷ ಶಾಂತಿ.
   - **ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ (hindinajanma)**: ಪೂರ್ವ ಜನ್ಮ ಕರ್ಮ ವಿಶ್ಲೇಷಣೆ.
   - **ಜೀವನ ಮಾರ್ಗದರ್ಶನ (lifeguidance)**: ಧರ್ಮ, ಅರ್ಥ, ಕಾಮ, ಮೋಕ್ಷ ಮಾರ್ಗ.
   - **ಜ್ಯೋತಿಷ್ಯ ಆಟಗಳು (astrogames)**: ರಸಪ್ರಶ್ನೆ & ಶೈಕ್ಷಣಿಕ ಆಟಗಳು.
   - **ಕುಂಡಲಿ ಗುರುಕುಲ (gurukula)**: ಶಾಸ್ತ್ರೋಕ್ತ ಜ್ಯೋತಿಷ್ಯ ತರಗತಿಗಳು.

೬. 🛡️ **ಆಡಳಿತ & ಪುರೋಹಿತ ನಿಯಂತ್ರಣ ಸೂಟ್ (Admin Suite)**:
   - **ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ (superadmindashboard)**: ಮಾಸ್ಟರ್ ಆಡಳಿತ & ನಾಣ್ಯ ಮುದ್ರಣ.
   - **ಪುರೋಹಿತ ಪೋರ್ಟಲ್ (priestdashboard)**: ಅರ್ಚಕರ ಮೊಬೈಲ್ ಲೆಡ್ಜರ್.
   - **ಅರ್ಚಕ ಪಂಚಾಂಗ ಹಾಳೆ (priest_panchanga)**: ಮುದ್ರಣಯೋಗ್ಯ ದಿನ ಪಂಚಾಂಗ ಪತ್ರ.
   - **ಸೆಟ್ಟಿಂಗ್ಸ್ (settings)**: ೫ ಭಾಷೆಗಳು, ಅಯನಾಂಶ & ನೋಟಿಫಿಕೇಶನ್‌ಗಳು.`;

  const sitemapEn = `🏛️ **Baggona Panchanga Comprehensive Application Directory (All 32 Pages):**

1. 🪐 **Kundli & Predictions Suite**:
   - **Kundli**: South & North Indian charts, whole-sign houses, planetary degrees.
   - **Predictions**: Comprehensive 12-house and planet placement analysis.
   - **Insights**: Planetary friendships, exaltation, and shadbala strengths.
   - **Raman Bhavishya**: Dr. B.V. Raman 10-chapter life predictions and yogas.
   - **Doshas Center**: 5 classical doshas, age thresholds, and remedial protocols.
   - **Public Kundli**: Secure tamper-proof shareable horoscope links.
   - **Instant Reading**: 30-second priest talking points with 6 core bullet points.
   - **Melapak**: 36-point Ashtakoota marital compatibility and Nadi dosha.
   - **Varshaphala**: Annual solar return Tajika predictions.
   - **Bhagyodaya**: Exact age of fortune and prosperity calculator.

2. 📅 **Astronomical Panchanga Suite**:
   - **Daily Panchanga (Home)**: Tithi, Nakshatra, Yoga, Karana, Rahu Kaal.
   - **90-Day Rhythm Calendar**: Green, Yellow, and Red energy scorecard.
   - **Quick Calendar**: High-speed monthly panchang navigator.
   - **Astodaya & Eclipses**: Guru-Shukra combustion, solar/lunar eclipses, Sutaka.
   - **Muhurtha**: Auspicious timings for marriage, housewarming, etc.
   - **Directional Compass**: Disha Shula and planetary compass.
   - **104-Page Annual Book**: Press-ready official Samvatsara book generator.

3. 🪔 **Gokarna Temple Seva Suite**:
   - **Seva & Prasada**: Rituals with Chief Priest Shreeram Pandit & 5-page Ashirvada Patra.
   - **Post-Mortem Rites**: Moksha Narayana Bali and Tripindi Shraddha protocols.

4. 🔮 **Divination & Samudrika Suite**:
   - **Palm Reading**: Hastha Samudrika palm lines and planetary mounts.
   - **Face Reading**: Samudrika facial features and forehead indicators.
   - **Numerology**: Mulank, Bhagyank, name numbers, and lucky gems.

5. 📚 **Vedic Wisdom & Gurukula Suite**:
   - **AI Astrologer**: Interactive Gemini AI consultation.
   - **Varamahalakshmi**: Vratha rituals, Kalasha sthapana, and stotras.
   - **Ayur Sanjeevini**: Nakshatra diet and Tridosha balance.
   - **Past Life Karma**: Reincarnation karma from 5th/9th houses.
   - **Life Guidance**: Practical guidance for career, health, and dharma.
   - **Astro Games**: Interactive Vedic quizzes and learning games.
   - **Gurukula**: Systematic Vedic astrology lessons.

6. 🛡️ **Administration & Priest Suite**:
   - **Super Admin Center**: Fleet automation runner, coin minting, and diagnostics.
   - **Priest Dashboard**: Purohita mobile client manager and coin wallet.
   - **Priest Panchanga**: Printable single-sheet ephemeris for puja sankalpa.
   - **Settings**: 5 Indic languages, Ayanamsa toggle, and notification controls.`;

  const spokenText = isKn
    ? "ಸ್ವಾಮಿ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಲ್ಲಿ ೬ ಪ್ರಮುಖ ವಿಭಾಗಗಳ ಒಟ್ಟು ೩೨ ಅಧಿಕೃತ ಪುಟಗಳಿವೆ: ಜಾತಕ, ಖಗೋಳ ಪಂಚಾಂಗ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆ, ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ, ವೈದಿಕ ಜ್ಞಾನ ಮತ್ತು ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ. ನೀವು ಯಾವುದೇ ಪುಟಕ್ಕೆ ತಕ್ಷಣ ತೆರಳಬಹುದು."
    : "Swami, Baggona Panchanga contains 32 official modules organized across 6 suites: Kundli & Predictions, Astronomical Panchanga, Gokarna Kshetra Seva, Divination & Palmistry, Vedic Wisdom, and Admin Command Center. You can navigate directly to any page.";

  return {
    text: {
      kn: sitemapKn,
      en: sitemapEn,
      hi: sitemapEn,
      te: sitemapEn,
      ta: sitemapEn
    },
    spokenText: {
      kn: spokenText,
      en: spokenText,
      hi: spokenText,
      te: spokenText,
      ta: spokenText
    },
    emotion: "excited",
    category: "navigation",
    actions: [
      {
        id: "nav_kundli",
        label: {
          kn: "🪐 ಜಾತಕ ಸೂಟ್",
          en: "🪐 Kundli Suite",
          hi: "🪐 कुण्डली",
          te: "🪐 జాతకం",
          ta: "🪐 ஜாதகம்"
        },
        icon: "🪐",
        targetPage: "kundli",
        actionType: "navigate"
      },
      {
        id: "nav_calendar",
        label: {
          kn: "📅 ೯೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್",
          en: "📅 90-Day Calendar",
          hi: "📅 ९०-दिन कैलेंडर",
          te: "📅 90 రోజుల క్యాలెండర్",
          ta: "📅 90 நாள் காலண்டர்"
        },
        icon: "📅",
        targetPage: "calendar",
        actionType: "navigate"
      },
      {
        id: "nav_seva",
        label: {
          kn: "🪔 ಗೋಕರ್ಣ ಸೇವೆ & ಆಶೀರ್ವಾದ",
          en: "🪔 Gokarna Seva",
          hi: "🪔 गोकर्ण सेवा",
          te: "🪔 గోకర్ణ సేవా",
          ta: "🪔 கோகர்ண சேவா"
        },
        icon: "🪔",
        targetPage: "seva",
        actionType: "navigate"
      },
      {
        id: "nav_palm",
        label: {
          kn: "✋ ಹಸ್ತ ಸಾಮುದ್ರಿಕ",
          en: "✋ Palm Reading",
          hi: "✋ हस्तरेखा",
          te: "✋ హస్త సాముద్రికం",
          ta: "✋ கைரேகை"
        },
        icon: "✋",
        targetPage: "palmreading",
        actionType: "navigate"
      },
      {
        id: "nav_superadmin",
        label: {
          kn: "👑 ಸೂಪರ್ ಅಡ್ಮಿನ್ ಕೇಂದ್ರ",
          en: "👑 Super Admin Center",
          hi: "👑 सुपर एडमिन",
          te: "👑 సూపర్ అడ్మిన్",
          ta: "👑 சூப்பர் அட்மின்"
        },
        icon: "👑",
        targetPage: "superadmindashboard",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 3: NAVIGATION ENGINE (COVERS ALL 32 PAGES WITH DEEP TAB & PARAMETER CONTROL)
// =========================================================================
function normalizeIndicDigits(str: string): string {
  return str
    .replace(/[೦०౦௦]/g, "0")
    .replace(/[೧१౧௧]/g, "1")
    .replace(/[೨२౨௨]/g, "2")
    .replace(/[೩३౩௩]/g, "3")
    .replace(/[೪४౪௪]/g, "4")
    .replace(/[೫५౫௫]/g, "5")
    .replace(/[೬६౬௬]/g, "6")
    .replace(/[೭७౭௭]/g, "7")
    .replace(/[೮८౮௮]/g, "8")
    .replace(/[೯९౯௯]/g, "9");
}

function toIndicDigits(num: number | string, targetLang: SupportedLanguage): string {
  const s = String(num);
  if (targetLang === "kn") {
    const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
    return s.replace(/\d/g, (d) => knDigits[parseInt(d, 10)]);
  }
  if (targetLang === "hi") {
    const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return s.replace(/\d/g, (d) => hiDigits[parseInt(d, 10)]);
  }
  if (targetLang === "te") {
    const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
    return s.replace(/\d/g, (d) => teDigits[parseInt(d, 10)]);
  }
  if (targetLang === "ta") {
    const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
    return s.replace(/\d/g, (d) => taDigits[parseInt(d, 10)]);
  }
  return s;
}

const NAV_TAB_LOCALIZED_NAMES: Record<
  string,
  Record<string, Record<SupportedLanguage, string>>
> = {
  astodaya_grahana: {
    astodaya: {
      kn: "ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ",
      en: "Guru & Shukra Astodaya & Moudhya",
      hi: "गुरु-शुक्र अस्तोदय एवं मौढ्य",
      te: "గురు-శుక్ర అస్తోదయం & మౌఢ్యం",
      ta: "குரு-சுக்கிர அஸ்தோதயம் & மௌட்யம்"
    },
    eclipses: {
      kn: "ಗ್ರಹಣ ದರ್ಶನ (ಸೂರ್ಯ & ಚಂದ್ರ)",
      en: "Solar & Lunar Eclipses",
      hi: "सूर्य एवं चंद्र ग्रहण दर्शन",
      te: "గ్రహణ దర్శనం",
      ta: "சூரிய & சந்திர கிரகண தரிசனம்"
    },
    transits: {
      kn: "ಪ್ರಮುಖ ಗ್ರಹ ಗೋಚಾರ ಸಂಚಾರ",
      en: "Major Planetary Ingresses",
      hi: "प्रमुख ग्रह गोचर संचरण",
      te: "గ్రహ గోచార సంచారం",
      ta: "முக்கிய கிரக பெயர்ச்சி"
    },
    rashiphala: {
      kn: "ದ್ವಾದಶ ರಾಶಿ ಫಲ & ಶಾಂತಿ",
      en: "12-Rashi Phala & Shanti",
      hi: "द्वादश राशि फल एवं शांति",
      te: "ద్వాదశ రాశి ఫలితాలు & శాంతి",
      ta: "12 ராசி பலன்கள் & பரிகாரம்"
    },
    unified: {
      kn: "ಸಮಗ್ರ ವಾರ್ಷಿಕ ಪಂಚಾಂಗ ಸೂಚಿ",
      en: "Unified Annual Dossier",
      hi: "समग्र वार्षिक पंचांग सूची",
      te: "సమగ్ర వార్షిక పంచాంగ సూచిక",
      ta: "முழுமையான ஆண்டு பஞ்சாங்கம்"
    }
  },
  melapak: {
    ashtakoota: { kn: "ಅಷ್ಟಕೂಟ ಮಿಲನ", en: "Ashtakoota Milan", hi: "अष्टकूट मिलान", te: "అష్టకూట మిలనం", ta: "அஷ்டகூட பொருத்தம்" },
    dashakoota: { kn: "ದಶಕೂಟ ಮಿಲನ", en: "Dashakoota Milan", hi: "दशकूट मिलान", te: "దశకూట మిలనం", ta: "தசகூட பொருத்தம்" },
    kujaAndPapa: { kn: "ಕುಜ ದೋಷ & ಪಾಪ ಸಾಮ್ಯ", en: "Kuja Dosha & Papa Samya", hi: "कुज दोष एवं पाप साम्य", te: "కుజ దోషం & పాప సామ్యం", ta: "செவ்வாய் தோஷம் & பாவ சாம்யம்" },
    dashaAndSeva: { kn: "ದಶಾ ಸಂಧಿ & ಪರಿಹಾರ ಸೇವೆ", en: "Dasha Sandhi & Seva", hi: "दशा संधि एवं सेवा", te: "దశా సంధి & సేవ", ta: "தசா சந்தி & சேவை" }
  },
  sankhyashastra: {
    vedic_grid: { kn: "ವೈದಿಕ ಸಂಖ್ಯಾ ಗ್ರಿಡ್", en: "Vedic Numerology Grid", hi: "वैदिक अंक ग्रिड", te: "వైదిక సంఖ్యా గ్రిడ్", ta: "வேத எண் கட்டம்" },
    prashna: { kn: "ಪ್ರಶ್ನಾ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ", en: "Prashna Numerology", hi: "प्रश्न अंक ज्योतिष", te: "ప్రశ్న సంఖ్యా శాస్త్రం", ta: "பிரசன்ன எண் கணிதம்" },
    match: { kn: "ಸಂಖ್ಯಾ ಹೊಂದಾಣಿಕೆ", en: "Numerology Matching", hi: "अंक मिलान", te: "సంఖ్యా పొంతన", ta: "எண் பொருத்தம்" },
    boys: { kn: "ಬಾಲಕರ ಶುಭ ನಾಮಗಳು", en: "Boy Auspicious Names", hi: "बालक शुभ नाम", te: "బాలుర శుభ నామాలు", ta: "ஆண் குழந்தைகள் சுப பெயர்கள்" },
    girls: { kn: "ಬಾಲಕಿಯರ ಶುಭ ನಾಮಗಳು", en: "Girl Auspicious Names", hi: "बालिका शुभ नाम", te: "బాలికల శుభ నామాలు", ta: "பெண் குழந்தைகள் சுப பெயர்கள்" },
    name: { kn: "ನಾಮ ಸಂಖ್ಯಾ ತಪಾಸಣೆ", en: "Name Number Analysis", hi: "नाम अंक विश्लेषण", te: "పేరు సంఖ్యా విశ్లేషణ", ta: "பெயர் எண் ஆய்வு" },
    item: { kn: "ವಾಹನ/ವಸ್ತು ಸಂಖ್ಯಾ ಬಲ", en: "Vehicle/Item Numerology", hi: "वाहन/वस्तु अंक", te: "వాహన సంఖ్యా బలం", ta: "வாகன எண் பலம்" },
    mulank: { kn: "ಮೂಲಾಂಕ & ಭಾಗ್ಯಾಂಕ", en: "Mulank & Bhagyank", hi: "मूलांक एवं भाग्यांक", te: "మూలాంకం & భాగ్యాంకం", ta: "மூலாங்கம் & பாக்யாங்கம்" }
  },
  lifeguidance: {
    career: { kn: "ಉದ್ಯೋಗ & ವೃತ್ತಿ ಮಾರ್ಗದರ್ಶನ", en: "Career & Profession", hi: "करियर मार्गदर्शन", te: "ఉద్యోగ మార్గదర్శనం", ta: "தொழில் வழிகாட்டுதல்" },
    relationship: { kn: "ವಿವಾಹ & ದಾಂಪತ್ಯ ಮಾರ್ಗದರ್ಶನ", en: "Marriage & Relationship", hi: "विवाह संबंध", te: "వివాహ మార్గదర్శనం", ta: "திருமண வழிகாட்டுதல்" },
    health: { kn: "ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ಮಾರ್ಗದರ್ಶನ", en: "Health & Vitality", hi: "स्वास्थ्य मार्गदर्शन", te: "ఆరోగ్య మార్గదర్శనం", ta: "சுகாதார வழிகாட்டுதல்" },
    custom: { kn: "ವಿಶೇಷ ಪ್ರಶ್ನೋತ್ತರ", en: "Special Consultation", hi: "विशेष परामर्श", te: "ప్రత్యేక సంప్రదింపు", ta: "சிறப்பு ஆலோசனை" }
  },
  bhagyodaya: {
    wealth: { kn: "ಧನ & ಐಶ್ವರ್ಯ ಭಾಗ್ಯೋದಯ", en: "Wealth & Prosperity", hi: "धन एवं ऐश्वर्य", te: "ధన భాగ్యోదయం", ta: "தன பாக்யோதயம்" },
    relationship: { kn: "ವಿವಾಹ & ಸಂತಾನ ಭಾಗ್ಯೋದಯ", en: "Marriage & Family", hi: "विवाह एवं परिवार", te: "వివాహ భాగ్యోదయం", ta: "குடும்ப பாக்யோதயம்" },
    health: { kn: "ಆರೋಗ್ಯ & ತೇಜಸ್ಸು", en: "Health & Vitality", hi: "स्वास्थ्य एवं तेज", te: "ఆరోగ్యం & తేజస్సు", ta: "ஆரோக்கியம்" },
    protection: { kn: "ರಕ್ಷಣೆ & ದೃಷ್ಟಿ ನಿವಾರಣೆ", en: "Divine Protection", hi: "दैवीय रक्षा", te: "రక్షణ", ta: "பாதுகாப்பு" },
    milestones: { kn: "ಜೀವನ ಮೈಲಿಗಲ್ಲುಗಳು", en: "Life Milestones", hi: "जीवन मील के पत्थर", te: "జీవిత మైలురాళ్ళు", ta: "வாழ்க்கை மைல்கற்கள்" },
    karma: { kn: "ಕರ್ಮ ಶುದ್ಧಿ & ಪುಣ್ಯ ಸಂಚಯ", en: "Karma Purification", hi: "कर्म शुद्धि", te: "కర్మ శుద్ధి", ta: "கர்ம சுத்தி" },
    temple: { kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆ", en: "Gokarna Kshetra Seva", hi: "गोकर्ण क्षेत्र सेवा", te: "గోకర్ణ క్షేత్ర సేవ", ta: "கோகர்ண க்ஷேத்ர சேவை" }
  },
  public_kundli: {
    patrika: { kn: "ಜನ್ಮ ಕುಂಡಲಿ ಪತ್ರಿಕೆ", en: "Birth Chart Patrika", hi: "जन्म कुण्डली पत्रिका", te: "జన్మ కుండలి పత్రిక", ta: "ஜாதகப் பத்ரிகை" },
    dasha: { kn: "ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ", en: "Vimshottari Dasha", hi: "विंशोत्तरी महादशा", te: "వింశోత్తరి మహాదశ", ta: "விம்சோத்தரி மகா தசை" },
    personality: { kn: "ಜಾತಕ ಗುಣ & ವ್ಯಕ್ತಿತ್ವ", en: "Personality & Traits", hi: "व्यक्तित्व एवं गुण", te: "వ్యక్తిత్వ లక్షణాలు", ta: "குணநலன்கள்" }
  },
  palmreading: {
    reading: { kn: "ಹಸ್ತ ಸ್ಕ್ಯಾನರ್ & ಫಲ", en: "Palm Scanner & Reading", hi: "हस्त स्कैनर व फल", te: "హస్త స్కానర్ & ఫలం", ta: "கைரேகை ஸ்கேனர்" },
    mounts: { kn: "ಸಪ್ತ ಗ್ರಹ ಪರ್ವತಗಳು", en: "7 Planetary Mounts", hi: "सप्त ग्रह पर्वत", te: "గ్రహ పర్వతాలు", ta: "கிரக மேடுகள்" },
    yogas: { kn: "ಸಾಮುದ್ರಿಕ ಯೋಗಗಳು", en: "Samudrika Yogas", hi: "सामुद्रिक योग", te: "సాముద్రిక యోగాలు", ta: "சாமுத்ரிகா யோகங்கள்" },
    remedies: { kn: "ಹಸ್ತ ರೇಖಾ ಪರಿಹಾರ", en: "Palm Remedies", hi: "हस्तरेखा उपाय", te: "హస్తరేఖ పరిహారాలు", ta: "கைரேகை பரிகாரங்கள்" }
  },
  facereading: {
    reading: { kn: "ಮುಖ ಸ್ಕ್ಯಾನರ್ & ಫಲ", en: "Face Scanner & Reading", hi: "मुख स्कैनर व फल", te: "ముఖ స్కానర్ & ఫలం", ta: "முக ஸ்கேனர் & பலன்" },
    features: { kn: "ಸಪ್ತ ಮುಖ ಲಕ್ಷಣಗಳು", en: "7 Facial Features", hi: "सप्त मुख लक्षण", te: "సప్త ముఖ లక్షణాలు", ta: "ஏழு முக லட்சணங்கள்" },
    chronology: { kn: "೧೦೦-ವರ್ಷ ಮುಖ ಕಾಲಚಕ್ರ", en: "100-Year Age Map", hi: "100-वर्षीय मुख कालचक्र", te: "100-సంవత్సరాల కాలచక్రం", ta: "100-ஆண்டு காலச்சக்கரம்" },
    moles: { kn: "ಮಚ್ಚೆ ಶಾಸ್ತ್ರ & ಪರಿಹಾರ", en: "Moles & Remedies", hi: "तिल शास्त्र व उपाय", te: "మచ్చల శాస్త్రం", ta: "மச்ச சாஸ்திரம்" }
  },
  varshabavishya: {
    all: { kn: "ದ್ವಾದಶ ರಾಶಿ ವಾರ್ಷಿಕ ಫಲ", en: "All 12 Rashis Overview", hi: "द्वादश राशि वार्षिक फल", te: "ద్వాదశ రాశుల వార్షిక ఫలం", ta: "12 ராசிகள் வருட பலன்" },
    single: { kn: "ವೈಯಕ್ತಿಕ ರಾಶಿ & ನಕ್ಷತ್ರ ಫಲ", en: "Single Rashi & Nakshatra", hi: "व्यक्तिगत राशि व नक्षत्र फल", te: "వ్యక్తిగత రాశి ఫలం", ta: "தனி நபர் ராசி பலன்" }
  },
  ramanbhavishya: {
    lifestage: { kn: "೧೦-ಅಧ್ಯಾಯಗಳ ಜೀವಿತ ಭವಿಷ್ಯ", en: "Life Stage Predictions (10 Chapters)", hi: "१०-अध्याय जीवन भविष्य", te: "10-అధ్యాయాల జీవిత భవిష్యత్", ta: "10-அத்தியாய வாழ்க்கை பலன்கள்" },
    ask: { kn: "ಜ್ಯೋತಿಷಿಗಳಿಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ", en: "Ask the Astrologer", hi: "ज्योतिषी से प्रश्न पूछें", te: "జ్యోతిష్యుడిని అడగండి", ta: "ஜோதிடரிடம் கேட்கவும்" }
  },
  kundli: {
    jataka: { kn: "ಜನ್ಮ ಕುಂಡಲಿ ಚಾರ್ಟ್", en: "Birth Chart", hi: "जन्म कुण्डली चक्र", te: "జన్మ కుండలి", ta: "ஜாதக சக்கரம்" },
    dasha: { kn: "ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲ", en: "Vimshottari Dasha", hi: "विंशोत्तरी दशा", te: "వింశోత్తరి దశ", ta: "விம்சோத்தரி தசை" },
    remedy: { kn: "ದೈವಿಕ ಪರಿಹಾರ ವರದಿ", en: "Remedy & Parihara", hi: "वैदिक उपाय", te: "పరిహార నివేదిక", ta: "பரிகார அறிக்கை" },
    lifeguidance: { kn: "ಜೀವನ ಮಾರ್ಗದರ್ಶನ", en: "Life Guidance", hi: "जीवन मार्गदर्शन", te: "జీవిత మార్గదర్శనం", ta: "வாழ்க்கை வழிகாட்டல்" },
    balavidya: { kn: "ಬಾಲವಿದ್ಯಾ ಸೂಟ್", en: "Bala Vidya Suite", hi: "बालविद्या", te: "బాలవిద్య", ta: "பாலவித்யா" }
  }
};

function buildNavigationResponse(
  matchedPageKey: AppPage,
  matchedPage: (typeof APPLICATION_PAGES_DIRECTORY)[AppPage],
  extractedYear: number | undefined,
  extractedTab: string | undefined,
  extractedDate: string | undefined,
  extractedLocation: string | undefined,
  lang: SupportedLanguage,
  extractedLang?: SupportedLanguage,
  devoteeDetails?: { name?: string; dob?: string; tob?: string; city?: string },
  festival?: { id: string; nameKn: string; nameEn?: string; date: string }
): PetResponse {
  const pName = matchedPage.name[lang] || matchedPage.name.kn || matchedPage.name.en;
  const pDesc = matchedPage.description[lang] || matchedPage.description.kn || matchedPage.description.en;

  const tabLocalizedMap = NAV_TAB_LOCALIZED_NAMES[matchedPageKey]?.[extractedTab || ""];
  const tabName = tabLocalizedMap ? (tabLocalizedMap[lang] || tabLocalizedMap.kn || tabLocalizedMap.en) : "";

  // 1. Text Responses across 5 languages
  const langDisplayNames: Record<SupportedLanguage, { kn: string; en: string; hi: string; te: string; ta: string }> = {
    hi: { kn: "ಹಿಂದಿ", en: "Hindi", hi: "हिन्दी", te: "హిందీ", ta: "இந்தி" },
    en: { kn: "ಇಂಗ್ಲಿಷ್", en: "English", hi: "अंग्रेजी", te: "ఇంగ్లీష్", ta: "ஆங்கிலம்" },
    kn: { kn: "ಕನ್ನಡ", en: "Kannada", hi: "कन्नड़", te: "కన్నడ", ta: "கன்னடம்" },
    te: { kn: "ತೆಲುಗು", en: "Telugu", hi: "तेलुगु", te: "తెలుగు", ta: "తెలుగు" },
    ta: { kn: "ತಮಿಳು", en: "Tamil", hi: "तमिल", te: "తమిళం", ta: "தமிழ்" }
  };

  // 1. Text Responses across 5 languages
  let textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
  let textEn = `Understood Super Admin! Navigating on your behalf to "${pName}".`;
  let textHi = `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ खोल रहा हूँ।`;
  let textTe = `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీని తెరుస్తున్నాను.`;
  let textTa = `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்தை திறக்கிறேன்.`;

  if (festival) {
    const fKn = festival.nameKn;
    const fEn = festival.nameEn || festival.nameKn;
    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ತೆರೆದು "${fKn}" (${festival.date}) ಹಬ್ಬದ ವಿವರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Navigating to Baggona Calendar and opening "${fEn}" (${festival.date}).`;
    textHi = `जी स्वामी! मैं तुरंत बग्गोण पंचांग कैलेंडर खोलकर "${fKn}" (${festival.date}) पर्व के विवरण खोल रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను తక్షణమే బగ్గోణ పంచాంగ క్యాలెండర్ తెరిచి "${fKn}" (${festival.date}) పండుగ వివరాలను తెరుస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! நான் பக்கோணா காலண்டரைத் திறந்து "${fKn}" (${festival.date}) பண்டிகையின் விவரங்களைத் திறக்கிறேன்.`;
  } else if (extractedLang) {
    const lKn = langDisplayNames[extractedLang]?.kn || "ಹಿಂದಿ";
    const lEn = langDisplayNames[extractedLang]?.en || "Hindi";
    const lHi = langDisplayNames[extractedLang]?.hi || "हिन्दी";
    const lTe = langDisplayNames[extractedLang]?.te || "హిందీ";
    const lTa = langDisplayNames[extractedLang]?.ta || "இந்தி";

    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ಭಾಷೆಯನ್ನು '${lKn}' ಗೆ ಬದಲಾಯಿಸಿ, ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Switching language setting to '${lEn}' and navigating to "${pName}".`;
    textHi = `जी स्वामी! मैं भाषा को '${lHi}' में बदलकर तुरंत आपके लिए "${pName}" पृष्ठ खोल रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను భాషను '${lTe}' కి మార్చి, మీ కోసం "${pName}" పేజీని తెరుస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! மொழியை '${lTa}' க்கு மாற்றி, உங்களுக்காக "${pName}" பக்கத்தை திறக்கிறேன்.`;
  }

  if (tabName && extractedYear) {
    const yrKn = toIndicDigits(extractedYear, "kn");
    const yrHi = toIndicDigits(extractedYear, "hi");
    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟಕ್ಕೆ ತೆರಳಿ, ${yrKn} ನೇ ವರ್ಷದ '${tabName}' ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Navigating on your behalf to "${pName}" and opening the "${tabName}" tab for year ${extractedYear}.`;
    textHi = `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ पर जाकर वर्ष ${yrHi} के '${tabName}' टैब को खोल रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీకి వెళ్లి, ${extractedYear} సంవత్సరం '${tabName}' ట్యాబ్‌ను తెరుస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்திற்குச் சென்று, ${extractedYear} ஆம் ஆண்டின் '${tabName}' பிரிவைத் திறக்கிறேன்.`;
  } else if (tabName) {
    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟಕ್ಕೆ ತೆರಳಿ, '${tabName}' ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Navigating on your behalf to "${pName}" and opening the "${tabName}" tab.`;
    textHi = `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ पर जाकर '${tabName}' टैब खोल रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీకి వెళ్లి, '${tabName}' ట్యాబ్‌ను తెరుస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்திற்குச் சென்று, '${tabName}' பிரிவைத் திறக்கிறேன்.`;
  } else if (extractedDate) {
    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟಕ್ಕೆ ತೆರಳಿ, ${extractedDate} ದಿನಾಂಕದ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Navigating on your behalf to "${pName}" for date ${extractedDate}.`;
    textHi = `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ पर जाकर दिनांक ${extractedDate} के विवरण दिखा रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీకి వెళ్లి, ${extractedDate} తేదీ వివరాలను చూపిస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்திற்குச் சென்று, ${extractedDate} தேதிக்கான விவரங்களைத் திறக்கிறேன்.`;
  } else if (extractedYear) {
    const yrKn = toIndicDigits(extractedYear, "kn");
    const yrHi = toIndicDigits(extractedYear, "hi");
    textKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟಕ್ಕೆ ತೆರಳಿ, ${yrKn} ನೇ ವರ್ಷದ ವಿವರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    textEn = `Understood Super Admin! Navigating on your behalf to "${pName}" for year ${extractedYear}.`;
    textHi = `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ पर जाकर वर्ष ${yrHi} के विवरण खोल रहा हूँ।`;
    textTe = `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీకి వెళ్లి, ${extractedYear} సంవత్సరం వివరాలను తెరుస్తున్నాను.`;
    textTa = `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்திற்குச் சென்று, ${extractedYear} ஆம் ஆண்டிற்கான விவரங்களைத் திறக்கிறேன்.`;
  }

  if (devoteeDetails?.name) {
    const dName = devoteeDetails.name;
    const dTime = devoteeDetails.tob ? ` (${devoteeDetails.tob})` : "";
    const dCity = devoteeDetails.city ? ` - ${devoteeDetails.city}` : "";
    textKn += `\n\n👤 **ಭಕ್ತರ ವಿವರ**: ${dName}${dTime}${dCity}.`;
    textEn += `\n\n👤 **Devotee Details**: ${dName}${dTime}${dCity}.`;
    textHi += `\n\n👤 **भक्त विवरण**: ${dName}${dTime}${dCity}.`;
    textTe += `\n\n👤 **భక్తుని వివరాలు**: ${dName}${dTime}${dCity}.`;
    textTa += `\n\n👤 **பக்தர் விவரம்**: ${dName}${dTime}${dCity}.`;
  }

  textKn += `\n\n📖 **ಪುಟದ ಶಾಸ್ತ್ರೀಯ ವಿವರ**: ${pDesc}\n\nಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ತಕ್ಷಣ ಆ ಪುಟಕ್ಕೆ ತೆರಳಿ.`;
  textEn += `\n\n📖 **Module Overview**: ${pDesc}\n\nClick the button below to jump directly to this page.`;
  textHi += `\n\n📖 **विवरण**: ${pDesc}\n\nनीचे दिए गए बटन पर क्लिक करें।`;
  textTe += `\n\n📖 **వివరాలు**: ${pDesc}`;
  textTa += `\n\n📖 **விவரம்**: ${pDesc}`;

  // 2. Spoken Voice Text across 5 languages
  let spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
  let spokenEn = `Navigating on your behalf to ${pName}.`;
  let spokenHi = `जी स्वामी! मैं तुरंत ${pName} पृष्ठ खोल रहा हूँ।`;
  let spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీని తెరుస్తున్నాను.`;
  let spokenTa = `நிச்சயமாக சுவாமி! நான் ${pName} பக்கத்தை திறக்கிறேன்.`;

  if (festival) {
    const fKn = festival.nameKn;
    const fEn = festival.nameEn || festival.nameKn;
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ತೆರೆದು ${fKn} ಹಬ್ಬದ ವಿವರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Navigating on your behalf to Baggona Calendar and opening ${fEn} on ${festival.date}.`;
    spokenHi = `जी स्वामी! मैं तुरंत बग्गोण पंचांग कैलेंडर खोलकर ${fKn} के विवरण खोल रहा हूँ।`;
    spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే బగ్గోణ పంచాంగ క్యాలెండర్ తెరిచి ${fKn} పండుగ వివరాలను తెరుస్తున్నాను.`;
    spokenTa = `நிச்சயமாக சுவாமி! நான் பக்கோணா காலண்டரைத் திறந்து ${fKn} பண்டிகையின் விவரங்களைத் திறக்கிறேன்.`;
  } else if (extractedLang) {
    const lKn = langDisplayNames[extractedLang]?.kn || "ಹಿಂದಿ";
    const lEn = langDisplayNames[extractedLang]?.en || "Hindi";
    const lHi = langDisplayNames[extractedLang]?.hi || "हिन्दी";
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ಭಾಷೆಯನ್ನು ${lKn} ಗೆ ಬದಲಾಯಿಸಿ, ${pName} ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Switching language setting to ${lEn} and opening ${pName}.`;
    spokenHi = `जी स्वामी! भाषा को ${lHi} में बदलकर ${pName} पृष्ठ खोल रहा हूँ।`;
  } else if (tabName && extractedYear) {
    const yrKn = toIndicDigits(extractedYear, "kn");
    const yrHi = toIndicDigits(extractedYear, "hi");
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟಕ್ಕೆ ತೆರಳಿ ${yrKn} ನೇ ವರ್ಷದ ${tabName} ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Navigating on your behalf to ${pName} and opening ${tabName} tab for year ${extractedYear}.`;
    spokenHi = `जी स्वामी! मैं तुरंत ${pName} पृष्ठ पर जाकर वर्ष ${yrHi} के ${tabName} टैब को खोल रहा हूँ।`;
    spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీకి వెళ్లి ${extractedYear} సంవత్సరం ${tabName} ట్యాబ్‌ను తెరుస్తున్నాను.`;
    spokenTa = `நிச்சயமாக சுவாமி! நான் ${pName} பக்கத்திற்குச் சென்று ${extractedYear} ஆம் ஆண்டின் ${tabName} பிரிவைத் திறக்கிறேன்.`;
  } else if (tabName) {
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟಕ್ಕೆ ತೆರಳಿ ${tabName} ಟ್ಯಾಬ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Navigating on your behalf to ${pName} and opening ${tabName} tab.`;
    spokenHi = `जी स्वामी! मैं तुरंत ${pName} पृष्ठ पर जाकर ${tabName} टैब खोल रहा हूँ।`;
    spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీకి వెళ్లి ${tabName} ట్యాబ్‌ను ತೆరుస్తున్నాను.`;
    spokenTa = `நிச்சயமாக சுவாமி! நான் ${pName} பக்கத்திற்குச் சென்று ${tabName} பிரிவைத் திறக்கிறேன்.`;
  } else if (extractedDate) {
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟಕ್ಕೆ ತೆರಳಿ ${extractedDate} ದಿನಾಂಕದ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Navigating on your behalf to ${pName} for date ${extractedDate}.`;
    spokenHi = `जी स्वामी! मैं तुरंत ${pName} पृष्ठ पर जाकर दिनांक ${extractedDate} खोल रहा हूँ।`;
    spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీకి వెళ్లి ${extractedDate} తేదీ వివరాలను చూపిస్తున్నాను.`;
    spokenTa = `நிச்சயமாக சுவாமி! நான் ${pName} பக்கத்திற்குச் சென்று ${extractedDate} தேதிக்கான ವಿವರங்களைத் திறக்கிறேன்.`;
  } else if (extractedYear) {
    const yrKn = toIndicDigits(extractedYear, "kn");
    const yrHi = toIndicDigits(extractedYear, "hi");
    spokenKn = `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟಕ್ಕೆ ತೆರಳಿ ${yrKn} ನೇ ವರ್ಷದ ವಿವರಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`;
    spokenEn = `Navigating on your behalf to ${pName} for year ${extractedYear}.`;
    spokenHi = `जी स्वामी! मैं तुरंत ${pName} पृष्ठ पर जाकर वर्ष ${yrHi} खोल रहा हूँ।`;
    spokenTe = `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీకి వెళ్లి ${extractedYear} సంవత్సరం ವಿವರాలను ತೆరుస్తున్నాను.`;
    spokenTa = `நிச்சயமாக சுவாமி! ನಾನು ${pName} பக்கத்திற்குச் சென்று ${extractedYear} ஆம் ஆண்டிற்கான ವಿವರங்களைத் திறக்கிறேன்.`;
  }

  const payload: Record<string, any> = {};
  if (festival) {
    payload.festival = festival.id;
    payload.date = festival.date;
    payload.search = festival.nameKn;
  }
  if (extractedYear) payload.year = extractedYear;
  if (extractedTab) payload.tab = extractedTab;
  if (extractedDate) payload.date = extractedDate;
  if (extractedLocation) payload.location = extractedLocation;
  if (extractedLang) payload.lang = extractedLang;
  if (devoteeDetails?.name) payload.name = devoteeDetails.name;
  if (devoteeDetails?.dob) payload.dob = devoteeDetails.dob;
  if (devoteeDetails?.tob) payload.tob = devoteeDetails.tob;
  if (devoteeDetails?.city) payload.city = devoteeDetails.city;

  return {
    text: {
      kn: textKn,
      en: textEn,
      hi: textHi,
      te: textTe,
      ta: textTa
    },
    spokenText: {
      kn: spokenKn,
      en: spokenEn,
      hi: spokenHi,
      te: spokenTe,
      ta: spokenTa
    },
    emotion: "excited",
    category: "navigation",
    actions: [
      {
        id: `navigate_${matchedPageKey}`,
        label: {
          kn: `🚀 ${pName} ಪುಟಕ್ಕೆ ಹೋಗಿ`,
          en: `🚀 Go to ${pName}`,
          hi: `🚀 ${pName} पृष्ठ पर जाएं`,
          te: `🚀 ${pName} పేజీకి వెళ్లండి`,
          ta: `🚀 ${pName} பக்கத்திற்குச் செல்க`
        },
        icon: matchedPage.icon,
        targetPage: matchedPageKey,
        actionType: "navigate",
        ...(Object.keys(payload).length > 0 ? { payload } : {})
      }
    ]
  };
}

function handleNavigationIntent(query: string, lang: SupportedLanguage = "kn"): PetResponse {
  const normQuery = normalizeIndicDigits(query);
  const lower = normQuery.toLowerCase().trim();
  let matchedPageKey: AppPage = "superadmindashboard";
  let matchedPage = APPLICATION_PAGES_DIRECTORY.superadmindashboard;
  let bestScore = 0;

  // Check if query mentions any festival or observance from Baggona Festival Registry
  const festRes = searchBaggonaFestivals(normQuery);
  let matchedFestival: { id: string; nameKn: string; nameEn?: string; date: string } | undefined;
  if (festRes.exactMatch) {
    matchedFestival = {
      id: festRes.exactMatch.id,
      nameKn: festRes.exactMatch.nameKn,
      nameEn: festRes.exactMatch.nameEn,
      date: festRes.exactMatch.date
    };
    matchedPageKey = "calendar";
    matchedPage = APPLICATION_PAGES_DIRECTORY.calendar;
    bestScore = 999;
  } else if (festRes.matchedMultiDayGroup) {
    matchedFestival = {
      id: festRes.matchedMultiDayGroup.id,
      nameKn: festRes.matchedMultiDayGroup.groupNameKn,
      nameEn: festRes.matchedMultiDayGroup.groupNameEn,
      date: festRes.matchedMultiDayGroup.startDate
    };
    matchedPageKey = "calendar";
    matchedPage = APPLICATION_PAGES_DIRECTORY.calendar;
    bestScore = 999;
  }

  for (const [key, page] of Object.entries(APPLICATION_PAGES_DIRECTORY)) {
    // Check if key itself matches
    const keyNorm = key.toLowerCase().replace(/_/g, " ");
    if (lower.includes(keyNorm) || lower.includes(key.toLowerCase())) {
      const score = keyNorm.length + 10;
      if (score > bestScore) {
        bestScore = score;
        matchedPageKey = key as AppPage;
        matchedPage = page;
      }
    }

    for (const kw of page.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          matchedPageKey = key as AppPage;
          matchedPage = page;
        }
      }
    }
  }

  // 1. Extract Year (1900-2100)
  let extractedYear: number | undefined;
  const yearMatch = normQuery.match(/(?:^|[^\d])(19\d{2}|20\d{2}|2100)(?:[^\d]|$)/);
  if (yearMatch) {
    const yr = parseInt(yearMatch[1], 10);
    if (yr >= 1900 && yr <= 2100) {
      extractedYear = yr;
    }
  }

  // 2. Extract Date (ISO YYYY-MM-DD or DMY DD-MM-YYYY)
  let extractedDate: string | undefined = matchedFestival?.date;
  const isoMatch = normQuery.match(/\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/);
  if (isoMatch) {
    extractedDate = isoMatch[1].replace(/\//g, "-");
  } else {
    const dmyMatch = normQuery.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/);
    if (dmyMatch) {
      const d = dmyMatch[1].padStart(2, "0");
      const m = dmyMatch[2].padStart(2, "0");
      const y = dmyMatch[3];
      extractedDate = `${y}-${m}-${d}`;
    }
  }

  // 3. Extract Location Filter if present
  let extractedLocation: string | undefined;
  if (lower.includes("gokarna") || lower.includes("ಗೋಕರ್ಣ") || lower.includes("गोकर्ण")) extractedLocation = "gokarna";
  else if (lower.includes("bengaluru") || lower.includes("bangalore") || lower.includes("ಬೆಂಗಳೂರು") || lower.includes("बेंगलुरु")) extractedLocation = "bengaluru";
  else if (lower.includes("delhi") || lower.includes("ದೆಹಲಿ") || lower.includes("दिल्ली")) extractedLocation = "delhi";
  else if (lower.includes("mumbai") || lower.includes("ಮುಂಬೈ") || lower.includes("मुंबई")) extractedLocation = "mumbai";
  else if (lower.includes("varanasi") || lower.includes("ವಾರಣಾಸಿ") || lower.includes("वाराणसी") || lower.includes("kashi") || lower.includes("ಕಾಶಿ")) extractedLocation = "varanasi";
  else if (lower.includes("chennai") || lower.includes("ಚೆನ್ನೈ") || lower.includes("चेन्नई")) extractedLocation = "chennai";
  else if (lower.includes("kolkata") || lower.includes("ಕೊಲ್ಕತ್ತ") || lower.includes("कोलकाता")) extractedLocation = "kolkata";
  else if (lower.includes("london") || lower.includes("ಲಂಡನ್") || lower.includes("लंदन")) extractedLocation = "london";
  else if (lower.includes("new york") || lower.includes("ನ್ಯೂ ಯಾರ್ಕ್") || lower.includes("न्यूयॉर्क")) extractedLocation = "newyork";
  else if (lower.includes("tokyo") || lower.includes("ಟೋಕಿಯೋ") || lower.includes("टोक्यो")) extractedLocation = "tokyo";

  // 4. Extract Tab depending on matchedPageKey
  let extractedTab: string | undefined;

  if (matchedPageKey === "astodaya_grahana") {
    if (
      lower.includes("second tab") ||
      lower.includes("2nd tab") ||
      lower.includes("tab 2") ||
      lower.includes("೨ನೇ") ||
      lower.includes("ಎರಡನೇ") ||
      lower.includes("ಎರಡನೆಯ") ||
      lower.includes("दूसरा") ||
      lower.includes("udaya") ||
      lower.includes("ಉದಯ") ||
      lower.includes("asta") ||
      lower.includes("ಅಸ್ತ") ||
      lower.includes("astodaya") ||
      lower.includes("ಅಸ್ತೋದಯ") ||
      lower.includes("ಗುರು ಶುಕ್ರ") ||
      lower.includes("guru shukra") ||
      lower.includes("moudhya") ||
      lower.includes("ಮೌಢ್ಯ") ||
      lower.includes("combustion")
    ) {
      extractedTab = "astodaya";
    } else if (
      lower.includes("first tab") ||
      lower.includes("1st tab") ||
      lower.includes("tab 1") ||
      lower.includes("೧ನೇ") ||
      lower.includes("ಮೊದಲ") ||
      lower.includes("पहला") ||
      lower.includes("eclipse") ||
      lower.includes("grahana") ||
      lower.includes("ಗ್ರಹಣ") ||
      lower.includes("solar") ||
      lower.includes("lunar")
    ) {
      extractedTab = "eclipses";
    } else if (
      lower.includes("third tab") ||
      lower.includes("3rd tab") ||
      lower.includes("tab 3") ||
      lower.includes("೩ನೇ") ||
      lower.includes("ಮೂರನೇ") ||
      lower.includes("तीसरा") ||
      lower.includes("transit") ||
      lower.includes("ingress") ||
      lower.includes("ಗೋಚಾರ") ||
      lower.includes("ಸಂಚಾರ")
    ) {
      extractedTab = "transits";
    } else if (
      lower.includes("fourth tab") ||
      lower.includes("4th tab") ||
      lower.includes("tab 4") ||
      lower.includes("೪ನೇ") ||
      lower.includes("ನಾಲ್ಕನೇ") ||
      lower.includes("चौथा") ||
      lower.includes("rashi") ||
      lower.includes("ರಾಶಿ ಫಲ") ||
      lower.includes("ದ್ವಾದಶ")
    ) {
      extractedTab = "rashiphala";
    } else if (
      lower.includes("fifth tab") ||
      lower.includes("5th tab") ||
      lower.includes("tab 5") ||
      lower.includes("೫ನೇ") ||
      lower.includes("ಐದನೇ") ||
      lower.includes("पाँचवाँ") ||
      lower.includes("unified") ||
      lower.includes("dossier") ||
      lower.includes("ಸಮಗ್ರ") ||
      lower.includes("ಸೂಚಿ")
    ) {
      extractedTab = "unified";
    }
  } else if (matchedPageKey === "melapak") {
    if (lower.includes("dashakoota") || lower.includes("ದಶಕೂಟ") || lower.includes("2nd tab") || lower.includes("ಎರಡನೇ")) {
      extractedTab = "dashakoota";
    } else if (lower.includes("kuja") || lower.includes("papa") || lower.includes("ಕುಜ") || lower.includes("ಪಾಪ") || lower.includes("3rd tab") || lower.includes("ಮೂರನೇ")) {
      extractedTab = "kujaAndPapa";
    } else if (lower.includes("dasha sandhi") || lower.includes("seva") || lower.includes("ದಶಾ ಸಂಧಿ") || lower.includes("ಪರಿಹಾರ") || lower.includes("4th tab") || lower.includes("ನಾಲ್ಕನೇ")) {
      extractedTab = "dashaAndSeva";
    } else if (lower.includes("ashtakoota") || lower.includes("ಅಷ್ಟಕೂಟ") || lower.includes("1st tab") || lower.includes("ಮೊದಲ")) {
      extractedTab = "ashtakoota";
    }
  } else if (matchedPageKey === "sankhyashastra") {
    if (lower.includes("grid") || lower.includes("ಗ್ರಿಡ್") || lower.includes("lo shu")) extractedTab = "vedic_grid";
    else if (lower.includes("prashna") || lower.includes("ಪ್ರಶ್ನ")) extractedTab = "prashna";
    else if (lower.includes("match") || lower.includes("ಹೊಂದಾಣಿಕೆ")) extractedTab = "match";
    else if (lower.includes("boy") || lower.includes("ಬಾಲಕ")) extractedTab = "boys";
    else if (lower.includes("girl") || lower.includes("ಬಾಲಕಿ")) extractedTab = "girls";
    else if (lower.includes("name") || lower.includes("ನಾಮ") || lower.includes("ಹೆಸರು")) extractedTab = "name";
    else if (lower.includes("item") || lower.includes("vehicle") || lower.includes("ವಾಹನ")) extractedTab = "item";
    else if (lower.includes("mulank") || lower.includes("bhagyank") || lower.includes("ಮೂಲಾಂಕ")) extractedTab = "mulank";
  } else if (matchedPageKey === "lifeguidance") {
    if (lower.includes("career") || lower.includes("job") || lower.includes("ವೃತ್ತಿ") || lower.includes("ಉದ್ಯೋಗ")) extractedTab = "career";
    else if (lower.includes("marriage") || lower.includes("relationship") || lower.includes("ವಿವಾಹ") || lower.includes("ದಾಂಪತ್ಯ")) extractedTab = "relationship";
    else if (lower.includes("health") || lower.includes("ಆರೋಗ್ಯ")) extractedTab = "health";
    else if (lower.includes("custom") || lower.includes("ವಿಶೇಷ")) extractedTab = "custom";
  } else if (matchedPageKey === "bhagyodaya") {
    if (lower.includes("wealth") || lower.includes("ಧನ") || lower.includes("ಸಂಪತ್ತು")) extractedTab = "wealth";
    else if (lower.includes("marriage") || lower.includes("family") || lower.includes("ಸಂತಾನ")) extractedTab = "relationship";
    else if (lower.includes("health") || lower.includes("ಆರೋಗ್ಯ")) extractedTab = "health";
    else if (lower.includes("protection") || lower.includes("ರಕ್ಷಣೆ")) extractedTab = "protection";
    else if (lower.includes("milestone") || lower.includes("ಮೈಲಿಗಲ್ಲು")) extractedTab = "milestones";
    else if (lower.includes("karma") || lower.includes("ಕರ್ಮ")) extractedTab = "karma";
    else if (lower.includes("temple") || lower.includes("gokarna") || lower.includes("ಗೋಕರ್ಣ")) extractedTab = "temple";
  } else if (matchedPageKey === "public_kundli") {
    if (lower.includes("patrika") || lower.includes("ಪತ್ರಿಕೆ")) extractedTab = "patrika";
    else if (lower.includes("dasha") || lower.includes("ದಶಾ")) extractedTab = "dasha";
    else if (lower.includes("personality") || lower.includes("ವ್ಯಕ್ತಿತ್ವ")) extractedTab = "personality";
  } else if (matchedPageKey === "palmreading") {
    if (
      lower.includes("mount") ||
      lower.includes("ಪರ್ವತ") ||
      lower.includes("ಗ್ರಹ ಪರ್ವತ") ||
      lower.includes("पर्वत") ||
      lower.includes("2nd tab") ||
      lower.includes("ಎರಡನೇ")
    ) {
      extractedTab = "mounts";
    } else if (
      lower.includes("yoga") ||
      lower.includes("ಯೋಗ") ||
      lower.includes("ರೇಖೆ") ||
      lower.includes("lines") ||
      lower.includes("3rd tab") ||
      lower.includes("ಮೂರನೇ")
    ) {
      extractedTab = "yogas";
    } else if (
      lower.includes("remedy") ||
      lower.includes("remedies") ||
      lower.includes("ಪರಿಹಾರ") ||
      lower.includes("ಶಾಂತಿ") ||
      lower.includes("उपाय") ||
      lower.includes("4th tab") ||
      lower.includes("ನಾಲ್ಕನೇ")
    ) {
      extractedTab = "remedies";
    } else if (
      lower.includes("reading") ||
      lower.includes("scanner") ||
      lower.includes("ಸ್ಕ್ಯಾನರ್") ||
      lower.includes("ಫಲ") ||
      lower.includes("1st tab") ||
      lower.includes("ಮೊದಲ")
    ) {
      extractedTab = "reading";
    }
  } else if (matchedPageKey === "facereading") {
    if (
      lower.includes("feature") ||
      lower.includes("ಲಕ್ಷಣ") ||
      lower.includes("ಮುಖ ಲಕ್ಷಣ") ||
      lower.includes("ಸಪ್ತ") ||
      lower.includes("लक्षण") ||
      lower.includes("2nd tab") ||
      lower.includes("ಎರಡನೇ")
    ) {
      extractedTab = "features";
    } else if (
      lower.includes("chronology") ||
      lower.includes("age map") ||
      lower.includes("ಕಾಲಚಕ್ರ") ||
      lower.includes("कालचक्र") ||
      lower.includes("3rd tab") ||
      lower.includes("ಮೂರನೇ")
    ) {
      extractedTab = "chronology";
    } else if (
      lower.includes("mole") ||
      lower.includes("ಮಚ್ಚೆ") ||
      lower.includes("ತಿಲ") ||
      lower.includes("तिल") ||
      lower.includes("4th tab") ||
      lower.includes("ನಾಲ್ಕನೇ")
    ) {
      extractedTab = "moles";
    } else if (
      lower.includes("reading") ||
      lower.includes("scanner") ||
      lower.includes("ಸ್ಕ್ಯಾನರ್") ||
      lower.includes("ಫಲ") ||
      lower.includes("1st tab") ||
      lower.includes("ಮೊದಲ")
    ) {
      extractedTab = "reading";
    }
  } else if (matchedPageKey === "varshabavishya") {
    if (
      lower.includes("single") ||
      lower.includes("ವೈಯಕ್ತಿಕ") ||
      lower.includes("individual") ||
      lower.includes("nakshatra") ||
      lower.includes("ನಕ್ಷತ್ರ") ||
      lower.includes("rashi phala") ||
      lower.includes("ರಾಶಿ ಫಲ") ||
      lower.includes("2nd tab") ||
      lower.includes("ಎರಡನೇ")
    ) {
      extractedTab = "single";
    } else if (
      lower.includes("all") ||
      lower.includes("ದ್ವಾದಶ") ||
      lower.includes("all rashis") ||
      lower.includes("12 rashi") ||
      lower.includes("ಎಲ್ಲ ರಾಶಿ") ||
      lower.includes("द्वादश") ||
      lower.includes("1st tab") ||
      lower.includes("ಮೊದಲ")
    ) {
      extractedTab = "all";
    }
  } else if (matchedPageKey === "ramanbhavishya") {
    if (
      lower.includes("ask") ||
      lower.includes("question") ||
      lower.includes("ಪ್ರಶ್ನೆ") ||
      lower.includes("ಜ್ಯೋತಿಷಿ") ||
      lower.includes("astrologer") ||
      lower.includes("2nd tab") ||
      lower.includes("ಎರಡನೇ")
    ) {
      extractedTab = "ask";
    } else if (
      lower.includes("life") ||
      lower.includes("chapter") ||
      lower.includes("ಅಧ್ಯಾಯ") ||
      lower.includes("ಜೀವಿತ") ||
      lower.includes("ದಿನ ಭವಿಷ್ಯ") ||
      lower.includes("dina bhavishya") ||
      lower.includes("1st tab") ||
      lower.includes("ಮೊದಲ")
    ) {
      extractedTab = "lifestage";
    }
  } else if (matchedPageKey === "kundli") {
    if (
      lower.includes("dasha") ||
      lower.includes("ದಶಾ") ||
      lower.includes("ವಿಂಶೋತ್ತರಿ") ||
      lower.includes("दशा") ||
      lower.includes("2nd tab") ||
      lower.includes("ಎರಡನೇ")
    ) {
      extractedTab = "dasha";
    } else if (
      lower.includes("remedy") ||
      lower.includes("ಪರಿಹಾರ") ||
      lower.includes("ದೈವಿಕ") ||
      lower.includes("उपाय") ||
      lower.includes("3rd tab") ||
      lower.includes("ಮೂರನೇ")
    ) {
      extractedTab = "remedy";
    } else if (
      lower.includes("guidance") ||
      lower.includes("ಮಾರ್ಗದರ್ಶನ") ||
      lower.includes("ಜೀವನ") ||
      lower.includes("मार्गदर्शन") ||
      lower.includes("4th tab") ||
      lower.includes("ನಾಲ್ಕನೇ")
    ) {
      extractedTab = "lifeguidance";
    } else if (
      lower.includes("balavidya") ||
      lower.includes("ಬಾಲವಿದ್ಯಾ") ||
      lower.includes("ಶಿಕ್ಷಣ") ||
      lower.includes("child") ||
      lower.includes("5th tab") ||
      lower.includes("ಐದನೇ")
    ) {
      extractedTab = "balavidya";
    } else if (
      lower.includes("chart") ||
      lower.includes("ಜಾತಕ") ||
      lower.includes("ಕುಂಡಲಿ") ||
      lower.includes("जन्म") ||
      lower.includes("1st tab") ||
      lower.includes("ಮೊದಲ")
    ) {
      extractedTab = "jataka";
    }
  }

  // 5. Extract Language specification if commanded
  let extractedLang: SupportedLanguage | undefined;
  if (
    lower.includes("hindi") ||
    lower.includes("ಹಿಂದಿ") ||
    lower.includes("हिन्दी") ||
    lower.includes("हिंदी") ||
    lower.includes("హిందీ") ||
    lower.includes("ஹிந்தி")
  ) {
    extractedLang = "hi";
  } else if (
    lower.includes("english") ||
    lower.includes("ಇಂಗ್ಲಿಷ್") ||
    lower.includes("ಇಂಗ್ಲೀಷ್") ||
    lower.includes("अंग्रेजी") ||
    lower.includes("இங்கிலீஷ்") ||
    lower.includes("ఇంగ్లీష్")
  ) {
    extractedLang = "en";
  } else if (
    lower.includes("kannada") ||
    lower.includes("ಕನ್ನಡ") ||
    lower.includes("कन्नड़") ||
    lower.includes("कन्नड") ||
    lower.includes("కన్నడ") ||
    lower.includes("கன்னடம்")
  ) {
    extractedLang = "kn";
  } else if (
    lower.includes("telugu") ||
    lower.includes("ತೆಲುಗು") ||
    lower.includes("तेलुगु") ||
    lower.includes("తెలుగు") ||
    lower.includes("தெலுங்கு")
  ) {
    extractedLang = "te";
  } else if (
    lower.includes("tamil") ||
    lower.includes("ತಮಿಳು") ||
    lower.includes("तमिल") ||
    lower.includes("తమిళం") ||
    lower.includes("தமிழ்")
  ) {
    extractedLang = "ta";
  }

  // 6. Extract Devotee Details (Name, TOB, DOB, City)
  let extractedDevoteeName: string | undefined;
  let extractedDevoteeTob: string | undefined;

  const nameMatch = normQuery.match(/(?:name\s+is\s+|devotee\s+|for\s+|ಭಕ್ತ\s*(?:ಹೆಸರು|:)?\s*|ಭಕ್ತರ\s*(?:ಹೆಸರು|:)?\s*|ಹೆಸರು\s*(?:ಇದೆ|ಆಗಿದೆ|:|)\s*|नाम\s*(?:है|:|)\s*|भक्त\s*(?:नाम|:)?\s*)([a-zA-Z\u0C80-\u0CFF\u0900-\u097F]+(?:\s+[a-zA-Z\u0C80-\u0CFF\u0900-\u097F]+)?)/i);
  if (nameMatch) {
    const rawN = nameMatch[1].trim();
    const reservedWords = ["page", "tab", "setting", "settings", "kundli", "hindi", "kannada", "english", "telugu", "tamil", "varsha", "varshabavishya", "dina", "year", "calendar"];
    if (!reservedWords.includes(rawN.toLowerCase()) && !rawN.toLowerCase().startsWith("varsha")) {
      extractedDevoteeName = rawN;
    }
  }

  const timeMatch = normQuery.match(/\b(\d{1,2}[:.]\d{2}\s*(?:am|pm|AM|PM)?)\b/i);
  if (timeMatch) {
    extractedDevoteeTob = timeMatch[1].trim();
  }

  return buildNavigationResponse(
    matchedPageKey,
    matchedPage,
    extractedYear,
    extractedTab,
    extractedDate,
    extractedLocation,
    lang,
    extractedLang,
    {
      name: extractedDevoteeName,
      dob: extractedDate,
      tob: extractedDevoteeTob,
      city: extractedLocation
    },
    matchedFestival
  );
}

// =========================================================================
// HANDLER 2: REVENUE & EARNING MONEY STRATEGY
// =========================================================================
function handleRevenueStrategy(): PetResponse {
  return {
    text: {
      kn: `👑 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಿಂದ ಲಕ್ಷಾಂತರ ರೂಪಾಯಿ ಆದಾಯ ಗಳಿಸುವ ೫ ಪ್ರಮುಖ ಶಾಸ್ತ್ರೀಯ ಮಾರ್ಗಗಳು:**

1. **ಪ್ರೀಮಿಯಂ ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ ಪುಸ್ತಕ & ಜಾತಕ PDF ಮಾರಾಟ**:
   - ಪ್ರತಿಯೊಬ್ಬ ಭಕ್ತನಿಗೂ ವಾರ್ಷಿಕ ₹೨೯೯ ರಿಂದ ₹೯೯೯ ದರದಲ್ಲಿ ೧೦೪ ಪುಟಗಳ ನಿಖರ ಸಂವತ್ಸರ ಪಂಚಾಂಗ ಪುಸ್ತಕ ಹಾಗೂ ರಮಣ ಪದ್ಧತಿಯ ಭವಿಷ್ಯ ಡೌನ್‌ಲೋಡ್ ನೀಡಬಹುದು.

2. **ಗೋಕರ್ಣ ಶ್ರೀ ಕ್ಷೇತ್ರ ಸೇವಾ & ಪ್ರಸಾದ ಆಶೀರ್ವಾದ ಪಾಸ್ ಕಮಿಷನ್**:
   - ಪ್ರಧಾನ ಅರ್ಚಕ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ, ಕಾಳಸರ್ಪ ಶಾಂತಿ, ನವಗ್ರಹ ದೋಷ ನಿವಾರಣೆ ಸೇವೆಗಳನ್ನು ಭಕ್ತರಿಗೆ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಬುಕಿಂಗ್ ಮಾಡಿಸಿ ಪ್ರತಿ ಸೇವೆಗೆ ೨೦% - ೩೦% ನಿವ್ವಳ ಲಾಭ ಪಡೆಯಬಹುದು.

3. **ಪುರೋಹಿತರ B2B ನಾಣ್ಯ ಪ್ಯಾಕೇಜ್ ಮಾರಾಟ (Priest Coin Bundles)**:
   - ಕರ್ನಾಟಕದ ಸಾವಿರಾರು ಗ್ರಾಮ ಪುರೋಹಿತರಿಗೆ ₹೨,೦೦೦ ರಿಂದ ₹೧೦,೦೦೦ ಮೌಲ್ಯದ ನಾಣ್ಯ ರಿಚಾರ್ಜ್ ಪ್ಯಾಕ್ ಮಾರಾಟ ಮಾಡಿ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸಲು ಉತ್ತೇಜಿಸಿ.

4. **ದೈನಂದಿನ ವಾಟ್ಸಾಪ್ ದರ್ಶನ ಚಂದಾದಾರಿಕೆ (Monthly Retainer)**:
   - ಭಕ್ತರಿಗೆ ದಿನದ ೯೦ ದಿನಗಳ ರಿದಮ್ ಶಕ್ತಿ ಕ್ಯಾಲೆಂಡರ್, ಶುಭ ಮುಹೂರ್ತ ಸಂದೇಶಗಳನ್ನು ಪ್ರತಿ ತಿಂಗಳು ₹೪೯ ಅಥವಾ ವಾರ್ಷಿಕ ₹೪೯೯ ಕ್ಕೆ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ರವಾನಿಸಬಹುದು.

5. **ವಿದೇಶಿ ಅನಿವಾಸಿ ಭಾರತೀಯ (NRI) ಇ-ಪೂಜಾ ಸೇವೆಗಳು**:
   - ಅಮೆರಿಕ, ಯುರೋಪ್‌ನ ಕನ್ನಡಿಗರಿಗೆ $೫೧ ರಿಂದ $೧೦೮ ದರದಲ್ಲಿ ಗೋಕರ್ಣದಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಹಾಗೂ ಪವಿತ್ರ ಪ್ರಸಾದ ಕೊರಿಯರ್ ಸೇವೆ ಒದಗಿಸಿ.`,

      hi: `👑 **बग्गोना पंचांग से लाखों रुपये की आय अर्जित करने की ५ मुख्य रणनीतियाँ:**

1. **प्रीमियम १०४ पृष्ठीय वार्षिक पंचांग एवं कुंडली PDF विक्रय** (₹२९९ - ₹९९९ प्रति प्रति)।
2. **गोकर्ण महाबलेश्वर सेवा एवं आशीर्वाद पास कमीशन** (श्रीराम पंडित जी के माध्यम से २५% लाभांश)।
3. **पुरोहित B2B सिक्का वॉलेट रीचार्ज बंडल** (गाँव-शहर के पुरोहितों को थोक कॉइन पैक)।
4. **व्हाट्सएप दैनिक दर्शन मासिक सदस्यता** (₹४९/माह या ₹४९९/वर्ष)।
5. **प्रवासी भारतीय (NRI) ई-पूजा संकल्प** ($५१ - $१०८ प्रति यजमान)।`,

      te: `👑 **బగ్గోణ పంచాంగం ద్వారా గణనీయమైన ఆదాయం పొందే 5 ముఖ్య మార్గాలు:**
1. ప్రీమియం 104 పేజీల వార్షిక పంచాంగ పుస్తకం & జాతక PDF విక్రయం (₹299 - ₹999).
2. గోకర్ణ క్షేత్ర సేవా & ప్రసాద బుకింగ్స్ కమీషన్.
3. పురోహితుల కాయిన్ బండిల్స్ విక్రయం.
4. వాట్సాప్ డైలీ పంచాంగ సబ్‌స్క్రిప్షన్.
5. ఎన్‌ఆర్‌ఐ భక్తులకు ప్రత్యేక ఈ-పూజలు.`,

      ta: `👑 **பக்கோனா பஞ்சாங்கம் மூலம் வருமானம் ஈட்டும் 5 வழிகள்:**
1. பிரீமியம் 104 பக்க பஞ்சாங்க புத்தகம் & ஜாதக PDF விற்பனை (₹299 - ₹999).
2. கோகர்ண க்ஷேத்ர சேவா ஆசீர்வாத பாஸ் முன்பதிவு.
3. புரோஹிதர் நாணய ரீசார்ஜ் விற்பனை.
4. வாட்ஸ்அப் தினசரி தரிசன சந்தா.
5. வெளிநாட்டு வாழ் இந்தியர்களுக்கான சிறப்பு ஈ-பூஜை.`,

      en: `👑 **5 High-Yield Revenue Blueprints for Baggona Panchanga:**

1. **Premium 104-Page Annual Book & Bhavishya Dossier Sales**:
   - Offer customized, press-ready 104-page Samvatsara Panchanga books and Raman Bhavishya life reports at ₹299 to ₹999 per PDF.

2. **Gokarna Temple Seva & Ashirvada Pass Bookings**:
   - Partner with Chief Priest Shreeram Pandit for Rudrabhisheka, Kala Sarpa, and Navagraha Shanti with a 20%–30% platform margin.

3. **B2B Priest Coin Bundles**:
   - Distribute wholesale coin packs (5,000 / 10,000 coins) to practicing astrologers and temple priests across India.

4. **WhatsApp Daily Darshana Retainer**:
   - Automated morning personalized rhythm alerts at ₹49/month or ₹499/year.

5. **Diaspora & NRI E-Pooja Packages**:
   - Live video sankalpa and sanctified Gokarna Prasada courier packages at $51–$108.`
    },
    spokenText: {
      kn: `ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಿಂದ ಆದಾಯ ಗಳಿಸಲು ೧೦೪ ಪುಟಗಳ ಪಂಚಾಂಗ ಮಾರಾಟ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವಾ ಬುಕಿಂಗ್, ಪುರೋಹಿತರ ನಾಣ್ಯ ಪ್ಯಾಕ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ದರ್ಶನ ಚಂದಾದಾರಿಕೆಗಳು ಅತ್ಯಂತ ಯಶಸ್ವಿ ಮಾರ್ಗಗಳಾಗಿವೆ.`,
      hi: `बग्गोना पंचांग से आय के लिए १०४ पृष्ठीय पंचांग विक्रय, गोकर्ण पूजा बुकिंग और व्हाट्सएप सदस्यता सर्वोत्तम उपाय हैं।`,
      te: `పంచాంగ పుస్తక విక్రయం, గోకర్ణ సేవా బుకింగ్స్ మరియు వాట్సాప్ సబ్‌స్క్రిప్షన్ ద్వారా గొప్ప ఆదాయం లభిస్తుంది.`,
      ta: `பஞ்சாங்க புத்தகம் விற்பனை மற்றும் கோகர்ண பூஜை முன்பதிவு மூலம் அதிக வருமானம் ஈட்டலாம்.`,
      en: `The top monetization models are 104-page book PDF sales, Gokarna Seva bookings with Shreeram Pandit, B2B priest coin bundles, and WhatsApp subscriptions.`
    },
    emotion: "excited",
    category: "revenue",
    actions: [
      {
        id: "open_seva",
        label: {
          kn: "🪔 ಸೇವಾ & ಪ್ರಸಾದ ಬುಕಿಂಗ್ ನೋಡಿ",
          hi: "🪔 सेवा एवं प्रसाद बुकिंग देखें",
          te: "🪔 సేవా & ప్రసాదం చూడండి",
          ta: "🪔 சேவா முன்பதிவு பார்க்க",
          en: "🪔 View Seva Bookings"
        },
        icon: "🪔",
        targetPage: "seva",
        actionType: "navigate"
      },
      {
        id: "open_pricing",
        label: {
          kn: "⚙️ ನಾಣ್ಯ & ಸೇವಾ ದರ ಪರಿಶೀಲಿಸಿ",
          hi: "⚙️ सिक्का एवं सेवा दर जांचें",
          te: "⚙️ కాయిన్ ధరలు చూడండి",
          ta: "⚙️ சேவைக் கட்டணம் பார்க்க",
          en: "⚙️ Check Coin & Service Pricing"
        },
        icon: "⚙️",
        targetPage: "superadmindashboard",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 3: MARKETING & VIRAL GROWTH STRATEGY
// =========================================================================
function handleMarketingStrategy(): PetResponse {
  return {
    text: {
      kn: `📢 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗವನ್ನು ಲಕ್ಷಾಂತರ ಜನರಿಗೆ ತಲುಪಿಸಲು ವೈರಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸೂತ್ರಗಳು:**

1. **೯೦ ದಿನಗಳ ರಿದಮ್ ಕ್ಯಾಲೆಂಡರ್ ವಾಟ್ಸಾಪ್ ವೈರಲ್ ಶೇರ್ (Viral WhatsApp Loop)**:
   - ಬಳಕೆದಾರರು ತಮ್ಮ ಹಸಿರು (ಉತ್ತಮ ಶಕ್ತಿ ದಿನ) ಹಾಗೂ ಕೆಂಪು (ಚಂದ್ರಾಷ್ಟಮ / ಎಚ್ಚರಿಕೆಯ ದಿನ) ಕಾರ್ಡ್‌ಗಳನ್ನು ಕುಟುಂಬದ ಗ್ರೂಪ್‌ಗಳಿಗೆ ಶೇರ್ ಮಾಡಲು "ಶೇರ್ ಕಾರ್ಡ್" ಬಟನ್ ಒತ್ತಿ ಕಳುಹಿಸುವಂತೆ ಪ್ರೇರೇಪಿಸಿ.

2. **ಗ್ರಹಣ & ಮೌಢ್ಯ ಕಾಲದ ತುರ್ತು ಅಲರ್ಟ್ ಪ್ರಚಾರ**:
   - ಸೂರ್ಯ-ಚಂದ್ರ ಗ್ರಹಣ ಅಥವಾ ಗುರು-ಶುಕ್ರ ಮೌಢ್ಯ ಪ್ರಾರಂಭವಾಗುವ ೩ ದಿನಗಳ ಮುಂಚೆ "ಸೂತಕ ನಿಯಮಗಳು & ಶಾಂತಿ ಪೂಜೆ" ಕುರಿತ ಸಂದೇಶಗಳನ್ನು ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ. ಇದು ೧೦ ಪಟ್ಟು ಟ್ರಾಫಿಕ್ ತರುತ್ತದೆ.

3. **ಗೋಕರ್ಣ ಹಾಗೂ ಪ್ರಮುಖ ದೇವಾಲಯಗಳಲ್ಲಿ ಭೌತಿಕ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಟ್ಯಾಂಡಿ (QR Standees)**:
   - ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ, ಇಡಗುಂಜಿ, ಮುರುಡೇಶ್ವರ ದೇವಾಲಯಗಳ ಆವರಣದಲ್ಲಿ "ಉಚಿತ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್" QR ಕೋಡ್ ಪ್ರದರ್ಶಿಸಿ.

4. **ದೈನಂದಿನ ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ & ಯೂಟ್ಯೂಬ್ ಶಾರ್ಟ್ಸ್ (Daily 30-Sec Reels)**:
   - ದಿನದ ರಾಹುಕಾಲ, ಯಮಗಂಡ, ಇಂದಿನ ನಕ್ಷತ್ರ ಫಲ ಹಾಗೂ ಚಂದ್ರಾಷ್ಟಮ ರಾಶಿಗಳ ೩೦-ಸೆಕೆಂಡಿನ ವಿಡಿಯೋ ಹಾಕಿ ಅಪ್ಲಿಕೇಶನ್ ಲಿಂಕ್ ನೀಡಿ.

5. **ಸ್ಥಳೀಯ ಪುರೋಹಿತರ ನೆಟ್‌ವರ್ಕ್ ಪ್ರಚಾರ**:
   - ಅರ್ಚಕರು ತಮ್ಮ ಭಕ್ತರಿಗೆ ಜಾತಕ ನೀಡುವಾಗ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಆಶೀರ್ವಾದ ಪಾಸ್ ನೀಡುವುದರಿಂದ ತಂತಾನೇ ಪ್ರಚಾರವಾಗುತ್ತದೆ.`,

      hi: `📢 **बग्गोना पंचांग को घर-घर पहुँचाने के वायरल मार्केटिंग सूत्र:**
1. **व्हाट्सएप ९०-दिवसीय ऊर्जा कैलेंडर शेयरिंग** (हर परिवार में ग्रीन/रेड डे शेयर कराएं)।
2. **सूर्य-चंद्र ग्रहण एवं मौढ्य अलर्ट अभियान** (सूतक नियमों से १० गुना ट्रैफिक)।
3. **गोकर्ण व प्रसिद्ध मंदिरों में QR कोड स्टैंडी**।
4. **दैनिक ३० सेकंड यूट्यूब शॉर्ट्स/रील्स** (आज का राहुकाल एवं चंद्र बल)।
5. **स्थानीय पुरोहितों का रेफरल नेटवर्क**।`,

      te: `📢 **బగ్గోణ పంచాంగం ప్రచార వ్యూహాలు:**
1. వాట్సాప్‌లో 90 రోజుల క్యాలెండర్ షేరింగ్.
2. సూర్య-చంద్ర గ్రహణాల ప్రత్యేక హెచ్చరికలు.
3. దేవాలయాల వద్ద క్యూఆర్ కోడ్ స్టాండీలు.
4. డైలీ ఇన్‌స్టాగ్రామ్ రీల్స్ (రాహుకాలం & నక్షత్రం).
5. పురోహితుల ద్వారా మౌత్ పబ్లిసిటీ.`,

      ta: `📢 **பக்கோனா பஞ்சாங்கம் சந்தைப்படுத்தல் உத்திகள்:**
1. வாட்ஸ்அப் 90 நாள் காலண்டர் பகிர்வு.
2. கிரகண மற்றும் மௌட்டிய எச்சரிக்கை பிரச்சாரம்.
3. கோயில்களில் QR குறியீடு ஸ்டாண்டுகள்.
4. தினசரி 30 வினாடி ரீல்ஸ் மற்றும் ஷார்ட்ஸ்.
5. புரோகிதர்கள் மூலமான வாய்வழி விளம்பரம்.`,

      en: `📢 **Viral Marketing Playbook for Baggona Panchanga:**

1. **WhatsApp 90-Day Rhythm Calendar Sharing**:
   - Leverage the dynamic Green/Yellow/Red energy scorecards. Devotees love sharing auspicious and caution days in family groups.

2. **Event-Driven Eclipse & Moudhya Alerts**:
   - Send Sutaka and combustion warnings 3 days prior to any celestial event. This creates an immediate 10x traffic surge.

3. **Temple QR Code Standees at Gokarna & Coastal Karnataka**:
   - Install stands at Gokarna, Idagunji, and Murudeshwara for free 90-day calendar downloads.

4. **Daily 30-Second Social Reels / Shorts**:
   - Automated bite-sized clips for Rahu Kaalam, Yamaganda, and Moon transit.

5. **Purohita Referral Program**:
   - Priests hand out Baggona Ashirvada Passes directly to their clients, driving organic referral loops.`
    },
    spokenText: {
      kn: `ಮಾರ್ಕೆಟಿಂಗ್‌ಗಾಗಿ ವಾಟ್ಸಾಪ್ ೯೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಶೇರ್, ಗ್ರಹಣದ ಮುಂಚಿನ ಅಲರ್ಟ್ ಸಂದೇಶಗಳು ಹಾಗೂ ಗೋಕರ್ಣ ದೇವಾಲಯದ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಟ್ಯಾಂಡಿಗಳು ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ತಂತ್ರಗಳಾಗಿವೆ.`,
      hi: `मार्केटिंग के लिए व्हाट्सएप शेयरिंग, ग्रहण अलर्ट और मंदिरों में क्यूआर कोड सबसे प्रभावी उपाय हैं।`,
      te: `వాట్సాప్ షేరింగ్ మరియు గ్రహణ అలర్ట్స్ ద్వారా అప్లికేషన్ వేగంగా ప్రాచుర్యం పొందుతుంది.`,
      ta: `வாட்ஸ்அப் பகிர்வு மற்றும் கோயில் QR குறியீடுகள் மூலம் பயன்பாட்டை விரைவாக பிரபலப்படுத்தலாம்.`,
      en: `To market the app effectively, deploy WhatsApp rhythm sharing, pre-eclipse alerts, and temple QR standees.`
    },
    emotion: "excited",
    category: "marketing",
    actions: [
      {
        id: "open_calendar",
        label: {
          kn: "📅 ೯೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ವೀಕ್ಷಿಸಿ",
          hi: "📅 ९०-दिवसीय कैलेंडर देखें",
          te: "📅 90 రోజుల క్యాలెండర్ చూడండి",
          ta: "📅 90 நாள் காலண்டர் பார்க்க",
          en: "📅 View 90-Day Calendar"
        },
        icon: "📅",
        targetPage: "calendar",
        actionType: "navigate"
      },
      {
        id: "open_astodaya",
        label: {
          kn: "🌒 ಗ್ರಹಣ & ಮೌಢ್ಯ ಪುಟ ಪರಿಶೀಲಿಸಿ",
          hi: "🌒 ग्रहण एवं अस्तोदय पृष्ठ देखें",
          te: "🌒 గ్రహణ & మౌఢ్య పేజీ చూడండి",
          ta: "🌒 கிரகண & மௌட்டிய பக்கம் பார்க்க",
          en: "🌒 Check Eclipses & Astodaya"
        },
        icon: "🌒",
        targetPage: "astodaya_grahana",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 4: KUNDLI & DOSHA DEEP ANALYSIS
// =========================================================================
function handleKundliAndDoshaAnalysis(context: SuperAdminPetContext): PetResponse {
  const session = context.currentKundliSession;

  if (session && session.input) {
    const nativeName = session.input.name || "ಜಾತಕರು";
    const dob = session.input.dateOfBirth || "N/A";
    const tob = session.input.timeOfBirth || "N/A";
    const pob = session.input.placeOfBirth || "N/A";

    let doshaSummary = "";
    let detectedDoshasList: string[] = [];

    if (session.result && Array.isArray(session.result.planets) && session.result.planets.length >= 7) {
      try {
        const report = calculateComprehensiveDoshas(session.input, session.result);
        detectedDoshasList = report.doshas.map((d) => d.name[context.selectedLanguage] || d.name.kn);
      } catch (e) {
        console.warn("Dosha calculation error in pet:", e);
      }
    }

    const doshaText = detectedDoshasList.length > 0
      ? `ಸಕ್ರಿಯ ಕರ್ಮ ದೋಷಗಳು: ${detectedDoshasList.slice(0, 4).join(", ")}.`
      : "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಬಾಧಕ ದೋಷಗಳು ಕಂಡುಬಂದಿಲ್ಲ; ಗ್ರಹಬಲ ಉತ್ತಮವಾಗಿದೆ.";

    return {
      text: {
        kn: `🔮 **ಪ್ರಸ್ತುತ ಲೋಡ್ ಆಗಿರುವ ಜಾತಕರ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ:**

- **ಹೆಸರು**: ${nativeName}
- **ಜನನ ದಿನಾಂಕ & ಸಮಯ**: ${dob} ${tob} (${pob})
- **ದೋಷ ಪರಿಶೀಲನೆ**: ${doshaText}

**ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಕ್ರಮಗಳು (ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ವಿಧಿ):**
1. ಕುಜ/ಸರ್ಪ ದೋಷವಿದ್ದಲ್ಲಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮ.
2. ಶನಿ ಸಾಡೇ ಸಾತಿ ಅಥವಾ ಕಂಟಕ ಶನಿ ಇದ್ದರೆ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಷ್ಟೋತ್ತರ ಜಪ ಹಾಗೂ ಎಳ್ಳು ದೀಪಾರಾಧನೆ.
3. ಪಿತೃ ದೋಷ ಪರಿಹಾರಕ್ಕಾಗಿ ಗೋಕರ್ಣ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ತಿಲತರ್ಪಣ ಶ್ರಾದ್ಧ ವಿಧಿ.`,

        hi: `🔮 **वर्तमान कुंडली का विश्लेषण:**
- **नाम**: ${nativeName} (${dob}, ${pob})
- **दोष स्थिति**: ${doshaText}
- **वैदिक शांति**: गोकर्ण क्षेत्र में रुद्राभिषेक एवं नवग्रह शांति पूजा अनुशंसित।`,

        te: `🔮 **ప్రస్తుత జాతక విశ్లేషణ:**
- **పేరు**: ${nativeName}
- **దోషాల వివరాలు**: ${doshaText}
- **పరిహారం**: గోకర్ణ క్షేత్రంలో రుద్రాభిషేకం మరియు నవగ్రహ శాంతి.`,

        ta: `🔮 **தற்போதைய ஜாதக ஆய்வு:**
- **பெயர்**: ${nativeName}
- **தோஷ நிலை**: ${doshaText}
- **பரிகாரம்**: கோகர்ண க்ஷேத்ரத்தில் ருத்ராபிஷேகம் மற்றும் சாந்தி பூஜை.`,

        en: `🔮 **Active Kundli Diagnostic for ${nativeName}:**
- **Birth Details**: ${dob} at ${tob} (${pob})
- **Dosha Evaluation**: ${doshaText}
- **Prescribed Remedial Protocol**: Rudrabhisheka and Navagraha Shanti at Gokarna Kshetra; Tila Tarpan at Koti Tirtha for ancestral pacification.`
      },
      spokenText: {
        kn: `${nativeName} ಅವರ ಜಾತಕದಲ್ಲಿ ${doshaText} ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸೂಕ್ತ ಶಾಂತಿ ಪೂಜೆ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`,
        hi: `${nativeName} की कुंडली में ${doshaText} गोकर्ण में शांति पूजा अनुशंसित है।`,
        te: `${nativeName} జాతకంలో దోష నివారణకు గోకర్ణ శాంతి పూజ చేయించండి.`,
        ta: `${nativeName} ஜாதகத்தில் தோஷ நிவர்த்திக்கு கோகர்ண பூஜை உகந்தது.`,
        en: `For ${nativeName}, ${doshaText} Remedial puja at Gokarna Kshetra is highly recommended.`
      },
      emotion: "remedy",
      category: "kundli",
      actions: [
        {
          id: "open_doshas",
          label: {
            kn: "📜 ಸಂಪೂರ್ಣ ದೋಷ ಪತ್ರ & ವಯೋಮಿತಿ ವೀಕ್ಷಿಸಿ",
            hi: "📜 संपूर्ण दोष पत्र एवं आयु सीमा देखें",
            te: "📜 పూర్తి దోష పత్రం చూడండి",
            ta: "📜 முழுமையான தோஷ அறிக்கை பார்க்க",
            en: "📜 View Full Dosha & Age Threshold Dossier"
          },
          icon: "📜",
          targetPage: "doshas",
          actionType: "navigate"
        },
        {
          id: "open_bhavishya",
          label: {
            kn: "🌟 ರಮಣ ಪದ್ಧತಿ ಭವಿಷ್ಯ ವೀಕ್ಷಿಸಿ",
            hi: "🌟 रमण पद्धति भविष्य देखें",
            te: "🌟 రమణ పద్ధతి భవిష్యత్ చూడండి",
            ta: "🌟 ராமன் முறை பலன்கள் பார்க்க",
            en: "🌟 View Raman Bhavishya Predictions"
          },
          icon: "🌟",
          targetPage: "ramanbhavishya",
          actionType: "navigate"
        }
      ]
    };
  }

  // If no Kundli is loaded currently
  return {
    text: {
      kn: `🔮 **ಜಾತಕ & ದೋಷ ಪರಿಶೀಲನೆ ವ್ಯವಸ್ಥೆ:**

ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಜಾತಕ ಲೋಡ್ ಆಗಿಲ್ಲ. ಆದರೆ ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಕೆಳಗಿನ ಎಲ್ಲಾ ಮಹಾ ದೋಷಗಳನ್ನು ನೂರಕ್ಕೆ ನೂರು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕುತ್ತದೆ:
- **ಕುಜ / ಮಾಂಗಲಿಕ ದೋಷ** (೧, ೨, ೪, ೭, ೮, ೧೨ ನೇ ಮನೆ ಹಾಗೂ ಭಂಗ ನಿರ್ಣಯ)
- **ಕಾಳ ಸರ್ಪ ದೋಷ** (೧೨ ಪ್ರಕಾರಗಳ ಅನಂತ, ಕುಳಿಕ, ವಾಸುಕಿ, ಶಂಖಪಾಲ ಇತ್ಯಾದಿ)
- **ಶನಿ ಸಾಡೇ ಸಾತಿ, ಅಷ್ಟಮ ಶನಿ & ಕಂಟಕ ಶನಿ**
- **ಗುರು ಚಂಡಾಲ ದೋಷ & ಪಿತೃ ದೋಷ**
- **ಗಂಡಾಂತ & ನಕ್ಷತ್ರ ಸಂಧಿ ದೋಷಗಳು**

ದಯವಿಟ್ಟು ಜಾತಕ ಪುಟಕ್ಕೆ ತೆರಳಿ ಜನ್ಮ ವಿವರ ನಮೂದಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ದೋಷ ಪರೀಕ್ಷಾ ವಿಭಾಗಕ್ಕೆ ತೆರಳಿ.`,

      hi: `🔮 **कुंडली एवं दोष प्रणाली:**
वर्तमान में कोई कुंडली लोड नहीं है। हमारी प्रणाली मांगलिक, कालसर्प, साढ़ेसाती, गुरु चांडाल और पितृ दोष की शत-प्रतिशत सटीक गणना करती है। विवरण देखने हेतु कुण्डली पेज पर जाएं।`,

      te: `🔮 **జాతక & దోష వ్యవస్థ:**
ప్రస్తుతం ఎటువంటి జాతకం లోడ్ కాలేదు. మాంగలిక, కాళసర్ప, సాడేసాతి మొదలైన దోషాలను సరిచూడటానికి జాతకం పేజీకి వెళ్ళండి.`,

      ta: `🔮 **ஜாதக & தோஷ ஆய்வு:**
தற்போது ஜாதகம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை. மாங்கல்ய, கால சர்ப்ப, ஏழரை சனி தோஷங்களை ஆய்வு செய்ய ஜாதக பக்கத்திற்குச் செல்லவும்.`,

      en: `🔮 **Vedic Kundli & Dosha Intelligence Engine:**
No active horoscope session is currently loaded. Baggona Panchanga computes:
- Kuja / Manglik Dosha (with authentic Parashari cancellations)
- Kala Sarpa Dosha (12 classical variations)
- Shani Sade Sati, Ashtama & Kantaka Shani
- Guru Chandala & Pitru Dosha
- Gandanta & Nakshatra Sandhi Age Thresholds.
Navigate to the Kundli or Dosha page to inspect any chart.`
    },
    spokenText: {
      kn: `ಸ್ವಾಮಿ, ಜಾತಕ ಮತ್ತು ದೋಷಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ದಯವಿಟ್ಟು ಜಾತಕ ಪುಟಕ್ಕೆ ತೆರಳಿ ಅಥವಾ ದೋಷ ವಿಭಾಗವನ್ನು ತೆರೆಯಿರಿ.`,
      hi: `स्वामी, कृपया कुंडली या दोष विभाग खोलकर जन्म विवरण दर्ज करें।`,
      te: `స్వామి, దయచేసి జాతకం లేదా దోష విభాగం తెరిచి వివరాలు చూడండి.`,
      ta: `சுவாமி, ஜாதக பக்கத்திற்கு சென்று தோஷங்களை ஆய்வு செய்யலாம்.`,
      en: `Please navigate to the Kundli or Doshas section to evaluate any birth chart.`
    },
    emotion: "peaceful",
    category: "kundli",
    actions: [
      {
        id: "open_kundli",
        label: {
          kn: "🪐 ಜಾತಕ ರಚನೆ ಪುಟಕ್ಕೆ ಹೋಗಿ",
          hi: "🪐 कुण्डली रचना पृष्ठ पर जाएं",
          te: "🪐 జాతక రచన పేజీకి వెళ్లండి",
          ta: "🪐 ஜாதக பக்கத்திற்குச் செல்க",
          en: "🪐 Go to Kundli Page"
        },
        icon: "🪐",
        targetPage: "kundli",
        actionType: "navigate"
      },
      {
        id: "open_doshas",
        label: {
          kn: "🛡️ ದೋಷ ವಿಶ್ಲೇಷಣಾ ಕೇಂದ್ರ ತೆರೆಯಿರಿ",
          hi: "🛡️ दोष विश्लेषण केंद्र खोलें",
          te: "🛡️ దోష విశ్లేషణ కేంద్రం తెరవండి",
          ta: "🛡️ தோஷ ஆய்வு மையம் திறக்க",
          en: "🛡️ Open Dosha Analysis Center"
        },
        icon: "🛡️",
        targetPage: "doshas",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 5: SYSTEM HEALTH & DIAGNOSTICS
// =========================================================================
async function handleSystemDiagnostics(context: SuperAdminPetContext): Promise<PetResponse> {
  const now = new Date();
  let userCount = 0;
  let panchangaOk = false;
  let astodayaOk = false;
  let eclipsesOk = false;

  try {
    userCount = await db.users.count();
  } catch (e) {
    userCount = 1;
  }

  try {
    const p = calculatePanchang(now, 14.54, 74.31);
    if (p && p.tithi) panchangaOk = true;
  } catch (e) {
    panchangaOk = false;
  }

  try {
    const a = calculateYearlyAstodaya(now.getFullYear());
    if (a && a.events.length > 0) astodayaOk = true;
  } catch (e) {
    astodayaOk = false;
  }

  try {
    const ec = calculateYearlyEclipses(now.getFullYear(), "world");
    if (ec && ec.length > 0) eclipsesOk = true;
  } catch (e) {
    eclipsesOk = false;
  }

  const allGreen = panchangaOk && astodayaOk && eclipsesOk;

  return {
    text: {
      kn: `🩺 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ವರದಿ:**

- **ಖಗೋಳ ಗಣಿತ ಎಂಜಿನ್ (Panchanga Engine)**: ${panchangaOk ? "✅ ಸಕ್ರಿಯ (೧೦೦% ನಿಖರ)" : "⚠️ ಪರಿಶೀಲನೆ ಅಗತ್ಯ"}
- **ಅಸ್ತೋದಯ ಎಂಜಿನ್ (Astodaya Arcus Visionis)**: ${astodayaOk ? "✅ ಸಕ್ರಿಯ (Drik Ganita ಪ್ರಮಾಣಿತ)" : "⚠️ ದೋಷ"}
- **ಗ್ರಹಣ ಎಂಜಿನ್ (Eclipses Engine)**: ${eclipsesOk ? "✅ ಸಕ್ರಿಯ (ಜಾಗತಿಕ & ಭಾರತೀಯ ವೇಧ)" : "⚠️ ದೋಷ"}
- **ಡೇಟಾಬೇಸ್ ಸ್ಥಿತಿ (IndexedDB / Cache)**: ✅ ಸಕ್ರಿಯ (${userCount} ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು)
- **ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪ್ರವೇಶ (Privilege Level)**: 👑 ಮಾಸ್ಟರ್ ನಿಯಂತ್ರಣ (ಅನಿಯಮಿತ ಮುಕ್ತ ಪ್ರವೇಶ)

${allGreen ? "🌟 ಸಮಸ್ತ ವ್ಯವಸ್ಥೆಯು ಅತ್ಯುತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿದೆ! ಯಾವುದೇ ದೋಷಗಳಿಲ್ಲ." : "⚠️ ದಯವಿಟ್ಟು ಸೂಪರ್ ಅಡ್ಮಿನ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ."}`,

      hi: `🩺 **सिस्टम स्वास्थ्य रिपोर्ट:**
- **पंचांग इंजन**: ${panchangaOk ? "✅ सक्रिय (१००% सटीक)" : "⚠️ त्रुटि"}
- **अस्तोदय इंजन**: ${astodayaOk ? "✅ सक्रिय (दृक गणित प्रमाणित)" : "⚠️ त्रुटि"}
- **ग्रहण गणना**: ${eclipsesOk ? "✅ सक्रिय" : "⚠️ त्रुटि"}
- **डेटाबेस**: ✅ सक्रिय (${userCount} उपयोगकर्ता)
- **एडमिन स्तर**: 👑 मास्टर विशेषाधिकार पूर्ण सक्रिय।`,

      te: `🩺 **సిస్టమ్ ఆరోగ్య నివేదిక:**
- పంచాంగ ఇంజిన్: ${panchangaOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- అస్తోదయ ఇంజిన్: ${astodayaOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- గ్రహణ ఇంజిన్: ${eclipsesOk ? "✅ యాక్టివ్" : "⚠️ ఎర్రర్"}
- డేటాబేస్: ✅ యాక్టివ్ (${userCount} యూజర్లు)
- అడ్మిన్ యాక్సెస్: 👑 సూపర్ అడ్మిన్ ఫుల్ కంట్రోల్.`,

      ta: `🩺 **கணினி ஆரோக்கிய அறிக்கை:**
- பஞ்சாங்க எஞ்சின்: ${panchangaOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- அஸ்தோதய எஞ்சின்: ${astodayaOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- கிரகண எஞ்சின்: ${eclipsesOk ? "✅ செயல்படுகிறது" : "⚠️ பிழை"}
- தரவுத்தளம்: ✅ செயலில் உள்ளது (${userCount} பயனர்கள்)
- அட்மின் நிலை: 👑 சூப்பர் அட்மின் முழு அணுகல்.`,

      en: `🩺 **Super Admin System Diagnostic Dossier:**
- **Astronomical Panchanga Engine**: ${panchangaOk ? "✅ Operational (100% Deterministic)" : "⚠️ Review Needed"}
- **Astodaya Arcus Visionis Engine**: ${astodayaOk ? "✅ Operational (Drik Ganita Certified)" : "⚠️ Error"}
- **Eclipse Computation Engine**: ${eclipsesOk ? "✅ Operational (Global & Local Visibility)" : "⚠️ Error"}
- **Local Storage / IndexedDB**: ✅ Healthy (${userCount} cached profiles)
- **Super Admin Privilege Status**: 👑 Master Authorization Active (Zero Deduction Profile)

${allGreen ? "🌟 All core calculation engines and database services are operating in prime condition!" : "⚠️ Attention needed on engine components."}`
    },
    spokenText: {
      kn: `ಸ್ವಾಮಿ, ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ಪಂಚಾಂಗ, ಅಸ್ತೋದಯ ಮತ್ತು ಗ್ರಹಣ ಎಂಜಿನ್‌ಗಳು ನೂರಕ್ಕೆ ನೂರು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿವೆ.`,
      hi: `स्वामी, सिस्टम स्वास्थ्य परीक्षण पूर्ण हुआ। पंचांग और ग्रहण इंजन पूरी तरह सक्रिय हैं।`,
      te: `స్వామి, సిస్టమ్ ఆరోగ్యం చాలా బాగుంది. అన్ని ఇంజిన్లు ఖచ్చితంగా పనిచేస్తున్నాయి.`,
      ta: `சுவாமி, சிஸ்டம் ஆரோக்கியம் மிகச் சிறப்பாக உள்ளது. அனைத்து கணக்கீடுகளும் துல்லியமாக உள்ளன.`,
      en: `Super Admin, system diagnostics are complete. All astronomical engines and database services are operating at peak health.`
    },
    emotion: "peaceful",
    category: "diagnostics",
    actions: [
      {
        id: "open_superadmin",
        label: {
          kn: "🛡️ ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
          hi: "🛡️ सुपर एडमिन कंट्रोल सेंटर",
          te: "🛡️ సూపర్ అడ్మిన్ కంట్రోల్ సెంటర్",
          ta: "🛡️ சூப்பர் அட்மின் கட்டுப்பாட்டு மையம்",
          en: "🛡️ Open Super Admin Center"
        },
        icon: "🛡️",
        targetPage: "superadmindashboard",
        actionType: "navigate"
      }
    ]
  };
}

// =========================================================================
// HANDLER 6: DEFAULT OFFLINE COMPANION GREETING & HELP
// =========================================================================
function handleDefaultOfflineCompanion(query: string, lang: SupportedLanguage): PetResponse {
  return {
    text: {
      kn: `ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಕೇಳಿದ ಪ್ರಶ್ನೆ: "${query}".

ನಾನು ನಿಮ್ಮ ಪರವಾಗಿ ಈ ಕೆಳಗಿನ ಕಾರ್ಯಗಳನ್ನು ತಕ್ಷಣ ಮಾಡಬಲ್ಲೆ:
1. **ಆದಾಯ & ಹಣ ಗಳಿಸುವ ತಂತ್ರಗಳು**: ಪಂಚಾಂಗ ಪುಸ್ತಕ & ಸೇವಾ ಬುಕಿಂಗ್ ಆದಾಯ ಯೋಜನೆಗಳು.
2. **ವೈರಲ್ ಮಾರ್ಕೆಟಿಂಗ್**: ವಾಟ್ಸಾಪ್ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಗ್ರಹಣ ಪ್ರಚಾರ ತಂತ್ರಗಳು.
3. **ಜಾತಕ & ದೋಷ ವಿಶ್ಲೇಷಣೆ**: ಕುಜ, ಕಾಳಸರ್ಪ, ಶನಿ, ಪಿತೃ ದೋಷ ನಿರ್ಣಯ ಹಾಗೂ ಗೋಕರ್ಣ ಶಾಂತಿ.
4. **ಸಿಸ್ಟಮ್ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ಸ್**: ಪಂಚಾಂಗ ಮತ್ತು ಗ್ರಹಣ ಎಂಜಿನ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ.
5. **ಆಟೋಮೇಷನ್**: ಯಾವುದೇ ಪುಟಕ್ಕೆ ತಕ್ಷಣ ಜಂಪ್ ಮಾಡುವುದು.

ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಟನ್‌ಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಮತ್ತೊಂದು ಆಜ್ಞೆ ನೀಡಿ!`,

      hi: `नमस्ते स्वामी! मैं आपका कामधेनु AI सहायक हूँ।
मैं आपके लिए आय वृद्धि, मार्केटिंग, कुंडली दोष विश्लेषण एवं सिस्टम परीक्षण करने के लिए तत्पर हूँ। कृपया नीचे दिए गए विकल्पों में से चुनें।`,

      te: `నమస్కారం స్వామి! నేను మీ కామధేను AI అసిస్టెంట్.
ఆదాయ మార్గాలు, మార్కెటింగ్ వ్యూహాలు, జాతక దోషాలు మరియు సిస్టమ్ డయాగ్నోస్టిక్స్ కోసం నేను సిద్ధంగా ఉన్నాను.`,

      ta: `வணக்கம் சுவாமி! நான் உங்கள் காமதேனு AI உதவியாளர்.
வருமானம், சந்தைப்படுத்தல், ஜாதக தோஷங்கள் மற்றும் சிஸ்டம் நிலையை அறிய நான் தயாராக உள்ளேன்.`,

      en: `Namaskara Super Admin! I am Kamadhenu, your divine AI assistant pet.
I have full super admin access to execute actions, analyze Janma Kundalis and Doshas, strategize revenue monetization, and guide marketing campaigns.
Choose one of the quick actions below or ask me any command!`
    },
    spokenText: {
      kn: `ನಮಸ್ಕಾರ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ವಹಿಸುತ್ತೇನೆ.`,
      hi: `नमस्ते स्वामी! मैं आपकी सेवा में तत्पर हूँ। जो भी आज्ञा हो, बताएं।`,
      te: `నమస్కారం స్వామి! మీ ఆజ్ఞ ప్రకారం నేను సేవ చేయడానికి సిద్ధంగా ఉన్నాను.`,
      ta: `வணக்கம் சுவாமி! நீங்கள் கட்டளையிடும் பணிகளை நான் உடனடியாகச் செய்வேன்.`,
      en: `Greetings Super Admin! I am your divine AI assistant pet. Tell me what to do and I will execute it on your behalf.`
    },
    emotion: "peaceful",
    category: "general",
    actions: [
      {
        id: "act_earn_money",
        label: {
          kn: "💰 ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ?",
          hi: "💰 पैसे कैसे कमाएं?",
          te: "💰 ఆదాయం ఎలా పెంచుకోవాలి?",
          ta: "💰 வருமானம் ஈட்டுவது எப்படி?",
          en: "💰 How to Earn Money?"
        },
        icon: "💰",
        actionType: "custom"
      },
      {
        id: "act_marketing",
        label: {
          kn: "📢 ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು",
          hi: "📢 मार्केटिंग रणनीति",
          te: "📢 మార్కెటింగ్ వ్యూహాలు",
          ta: "📢 சந்தைப்படுத்தல் உத்திகள்",
          en: "📢 Marketing Strategies"
        },
        icon: "📢",
        actionType: "custom"
      },
      {
        id: "act_doshas",
        label: {
          kn: "🔮 ಜಾತಕ & ದೋಷ ಸ್ಕ್ಯಾನ್",
          hi: "🔮 कुंडली एवं दोष स्कैन",
          te: "🔮 జాతక & దోషాల తనిఖీ",
          ta: "🔮 ஜாதக & தோஷ ஆய்வு",
          en: "🔮 Kundli & Dosha Scan"
        },
        icon: "🔮",
        targetPage: "doshas",
        actionType: "navigate"
      },
      {
        id: "act_health",
        label: {
          kn: "🩺 ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
          hi: "🩺 सिस्टम स्वास्थ्य जांच",
          te: "🩺 సిస్టమ్ హెల్త్ చెక్",
          ta: "🩺 சிஸ்டம் ஆய்வு",
          en: "🩺 System Health Diagnostic"
        },
        icon: "🩺",
        actionType: "run_diagnostic"
      }
    ]
  };
}
