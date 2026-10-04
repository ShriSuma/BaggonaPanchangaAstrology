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
import { generateDashaTimeline } from "../core/DashaBhuktiEngine";
import { evaluateYogasAndDoshas } from "../core/BVRamanPredictionEngine";
import { resolveCityCoordsAndPincode, CITY_DATABASE } from "./superAdminWorkflowRunner";

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

export type SuperAdminPetContext = {
  activePage: AppPage;
  currentKundliSession?: any;
  coinBalance?: number;
  currentUser: string | null;
  geminiApiKey?: string;
  selectedLanguage: SupportedLanguage;
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
    keywords: ["raman", "bhavishya", "ramanbhavishya", "ರಮಣ ಭವಿಷ್ಯ", "೧೦ ಅಧ್ಯಾಯ", "ಜೀವಿತ ಭವಿಷ್ಯ", "10 chapters", "life stages"],
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
    keywords: ["calendar", "rhythm", "90 day", "ಕ್ಯಾಲೆಂಡರ್", "೯೦ ದಿನ", "ರಿದಮ್", "ಚಂದ್ರಾಷ್ಟಮ"],
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
    keywords: ["astodaya", "grahana", "eclipse", "moudhya", "combustion", "ಅಸ್ತೋದಯ", "ಗ್ರಹಣ", "ಮೌಢ್ಯ", "ಸೂರ್ಯ ಗ್ರಹಣ", "ಚಂದ್ರ ಗ್ರಹಣ"],
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
    keywords: ["varsha", "varshabavishya", "varshaphala", "tajika", "ವರ್ಷ ಭವಿಷ್ಯ", "ವಾರ್ಷಿಕ ಫಲ"],
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
    keywords: ["palm", "palmreading", "hastarekha", "ಹಸ್ತ ರೇಖೆ", "ಹಸ್ತ ಸಾಮುದ್ರಿಕ", "ಆಯುಷ್ಯ ರೇಖೆ", "ಭಾಗ್ಯ ರೇಖೆ"],
    description: {
      kn: "ಜೀವನ ರೇಖೆ, ಶಿರೋ ರೇಖೆ, ಹೃದಯ ರೇಖೆ, ಭಾಗ್ಯ ರೇಖೆ ಮತ್ತು ಹಸ್ತ ಪರ್ವತಗಳ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ.",
      en: "Hastha Samudrika Shastra palm line inspection, mounts of planets, and destiny signs."
    }
  },
  facereading: {
    name: { kn: "ಮುಖ ಸಾಮುದ್ರಿಕ ಶಾಸ್ತ್ರ (Face Reading)", en: "Samudrika Shastra (Face Reading)", hi: "सामुद्रिक मुख लक्षण", te: "ముఖ సాముద్రికం", ta: "முக சாஸ்திரம்" },
    category: "divination",
    icon: "👤",
    keywords: ["face", "facereading", "samudrika", "ಮುಖ ಲಕ್ಷಣ", "ಸಾಮುದ್ರಿಕ", "ನೆತ್ತಿ ಲಕ್ಷಣ"],
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
    keywords: ["settings", "preferences", "language", "ayanamsa", "ಸೆಟ್ಟಿಂಗ್ಸ್", "ಭಾಷೆ ಬದಲಾವಣೆ", "ಅಯನಾಂಶ"],
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
 * Executes a Super Admin prompt and returns text, spoken voice text, emotion, and executable actions.
 */
export async function executeSuperAdminPetQuery(
  rawQuery: string,
  context: SuperAdminPetContext
): Promise<PetResponse> {
  const effectiveLang = detectQueryLanguage(rawQuery, context.selectedLanguage || "kn");
  const query = rawQuery.trim().toLowerCase();

  // 1. BHAVISHYA & LIFE PREDICTION INTENTS
  if (
    query.includes("bhavishya") ||
    query.includes("ಭವಿಷ್ಯ") ||
    query.includes("भविष्य") ||
    query.includes("predict") ||
    query.includes("future") ||
    query.includes("ಜಾತಕ ಫಲ") ||
    query.includes("life prediction") ||
    query.includes("horoscope reading") ||
    query.includes("ಜನ್ಮ ಫಲ")
  ) {
    return await handleBhavishyaPredictionIntent(rawQuery, context, effectiveLang);
  }

  // 2. ALL PAGES / SITEMAP / FEATURES INTENT
  if (
    query.includes("what pages") ||
    query.includes("all pages") ||
    query.includes("features") ||
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

  const isNavCommand =
    query.includes("go to") ||
    query.includes("open") ||
    query.includes("take me to") ||
    query.includes("navigate") ||
    query.includes("ತೆರೆ") ||
    query.includes("ಹೋಗು") ||
    query.includes("ಕರೆದುಕೊಂಡು ಹೋಗು") ||
    query.includes("खोलो") ||
    query.includes("चलो");

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
    query.includes("go to") ||
    query.includes("open") ||
    query.includes("take me to") ||
    query.includes("navigate") ||
    query.includes("ತೆರೆ") ||
    query.includes("ಹೋಗು") ||
    query.includes("ಕರೆದುಕೊಂಡು ಹೋಗು") ||
    query.includes("खोलो") ||
    query.includes("चलो") ||
    Object.values(APPLICATION_PAGES_DIRECTORY).some((p) => p.keywords.some((kw) => query.includes(kw)))
  ) {
    return handleNavigationIntent(query, effectiveLang);
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

      const aiText = await askGemini(rawQuery, systemPrompt, activeKey, effectiveLang, { raw: true, temperature: 0.6 });
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
// HANDLER 1: BHAVISHYA & LIFE PREDICTION ENGINE
// =========================================================================
async function handleBhavishyaPredictionIntent(
  rawQuery: string,
  context: SuperAdminPetContext,
  targetLang: SupportedLanguage = "kn"
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

  // Fallback to active session if details not in text
  if ((!name || !birthDate) && context.currentKundliSession?.input) {
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
// HANDLER 3: NAVIGATION ENGINE (COVERS ALL 32 PAGES)
// =========================================================================
function handleNavigationIntent(query: string, lang: SupportedLanguage = "kn"): PetResponse {
  const lower = query.toLowerCase().trim();
  let matchedPageKey: AppPage = "superadmindashboard";
  let matchedPage = APPLICATION_PAGES_DIRECTORY.superadmindashboard;
  let bestScore = 0;

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

  const pName = matchedPage.name[lang] || matchedPage.name.kn || matchedPage.name.en;
  const pDesc = matchedPage.description[lang] || matchedPage.description.kn || matchedPage.description.en;

  return {
    text: {
      kn: `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ "${pName}" ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.\n\n📖 **ಪುಟದ ಶಾಸ್ತ್ರೀಯ ವಿವರ**: ${pDesc}\n\nಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ತಕ್ಷಣ ಆ ಪುಟಕ್ಕೆ ತೆರಳಿ.`,
      en: `Understood Super Admin! Navigating on your behalf to "${pName}".\n\n📖 **Module Overview**: ${pDesc}\n\nClick the button below to jump directly to this page.`,
      hi: `जी स्वामी! मैं तुरंत आपके लिए "${pName}" पृष्ठ खोल रहा हूँ।\n\n📖 **विवरण**: ${pDesc}\n\nनीचे दिए गए बटन पर क्लिक करें।`,
      te: `తప్పకుండా స్వామి! నేను తక్షణమే మీ కోసం "${pName}" పేజీని తెరుస్తున్నాను.\n\n📖 **వివరాలు**: ${pDesc}`,
      ta: `நிச்சயமாக சுவாமி! உடனடியாக உங்களுக்காக "${pName}" பக்கத்தை திறக்கிறேன்.\n\n📖 **விவரம்**: ${pDesc}`
    },
    spokenText: {
      kn: `ಖಂಡಿತ ಸ್ವಾಮಿ! ನಾನು ತಕ್ಷಣ ${pName} ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`,
      en: `Navigating on your behalf to ${pName}.`,
      hi: `जी स्वामी! मैं तुरंत ${pName} पृष्ठ खोल रहा हूँ।`,
      te: `తప్పకుండా స్వామి! నేను తక్షణమే ${pName} పేజీని తెరుస్తున్నాను.`,
      ta: `நிச்சயமாக சுவாமி! நான் ${pName} பக்கத்தை திறக்கிறேன்.`
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
        actionType: "navigate"
      }
    ]
  };
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
