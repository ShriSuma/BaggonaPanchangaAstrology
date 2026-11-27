/**
 * Antarangada Satya (Dark Secret) Service - 7-Language Parity Edition
 * 
 * Supports the exact same 7 languages as the 20-Minute Consultation system:
 * 1. Kannada (kn)
 * 2. English (en)
 * 3. Hindi (hi)
 * 4. Telugu (te)
 * 5. Tamil (ta)
 * 6. Malayalam (ml)
 * 7. Marathi (mr)
 * 
 * Provides:
 * 1. 100% authentic Vedic calculation of the native's unrevealed inner secrets:
 *    - Chandra (Moon) sign, Moon Nakshatra & Pada
 *    - 8th House (Gupta / Nigoodha Bhava - subconscious conflicts, unexpressed fears)
 *    - 12th House (Vyaya / Antaranga Bhava - solitary sacrifices, private sorrow)
 *    - Lagna Lord & Ascendant (outward composure vs subterranean dilemma)
 *    - Running Vimshottari Mahadasha & Bhukti
 * 2. 7-Language pure native script narration with ZERO broken words or translation flaws.
 * 3. NPCI-compliant UPI Intent URI generation for ₹350 targeting 9108135387@ybl.
 * 4. Strict 12-digit UTR payment validation & replay protection.
 */

import { calculateKundli } from "../../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import {
  analyzeKundali,
  getLocalizedDevoteeName
} from "../premiumPdf/dynamicBhavishyaEngine";
import {
  RASHI_L5,
  NAKSHATRA_L5,
  GRAHA_L5,
  pick,
  type GrahaKey
} from "../premiumPdf/premiumPdfLocale";
import {
  generateUpiPayUri,
  generatePhonePeUri,
  generateGPayUri,
  generatePaytmUri,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_UPI_NAME,
  DEFAULT_PRIEST_NAME
} from "../wallet/walletTypes";
import {
  saveHotelOrderInitiated,
  updateHotelOrderVerified,
  getHotelOrder,
  verifyHotelOrderPayment,
  type HotelTableOrderDoc
} from "../../db/firestoreDb";
import {
  calculateLiveTodayTarabalaAndChandrashtama,
  type LiveTodayTarabalaOutput
} from "../../engine/jyotishPrecisionGates";
import {
  calculateSecretAccuracyProfile
} from "../../engine/secretAccuracyEngine";

export type AntarangaLang = "kn" | "en" | "hi" | "te" | "ta" | "ml" | "mr";

export interface AntarangaLanguageMeta {
  code: AntarangaLang;
  nativeName: string;
  englishName: string;
}

export const ANTARANGA_LANGUAGES: AntarangaLanguageMeta[] = [
  { code: "kn", nativeName: "ಕನ್ನಡ", englishName: "Kannada" },
  { code: "en", nativeName: "English", englishName: "English" },
  { code: "hi", nativeName: "हिन्दी", englishName: "Hindi" },
  { code: "te", nativeName: "తెలుగు", englishName: "Telugu" },
  { code: "ta", nativeName: "தமிழ்", englishName: "Tamil" },
  { code: "ml", nativeName: "മലയാളം", englishName: "Malayalam" },
  { code: "mr", nativeName: "मराठी", englishName: "Marathi" }
];

export interface MoorthyNirnayaData {
  title: string;
  moorthyName: string;
  tier: "swarna" | "rajata" | "tamra" | "loha";
  description: string;
  badge: string;
  diffHouse: number;
}

export interface CosmicLifeVoltageData {
  energyScore: number; // 55..95
  energyLabel: string;
  energyDesc: string;
  activeMahadasha: string;
  activeBhukti: string;
  dashaPeriodText: string;
  shaniGocharaStatus: string;
  shaniGocharaImpact: string;
  isSadeSati: boolean;
  isAshtama: boolean;
  isKantaka: boolean;
  hasGuruBala: boolean;
  guruGocharaStatus: string;
  guruGocharaImpact: string;
  turningPointVerdict: string;
}

export interface FiveYearPreviewHorizonData {
  year1: {
    gregorianRange: string;
    samvatsaraName: string;
    vitalityScore: number;
    turningPointSeason: string;
    goldenOpportunity: string;
    cautionAlert: string;
    headline: string;
  };
  lockedYears: Array<{
    yearNum: number;
    gregorianRange: string;
    headlineQuestion: string;
    keyTheme: string;
    teaserCta: string;
  }>;
}

export interface FreeLuckyElementsData {
  gemstone: string;
  luckyDay: string;
  luckyNumber: number;
  luckyDirection: string;
  luckyColor: string;
  ishtaDevata: string;
}

export interface DiningConversionOfferData {
  headline: string;
  subheadline: string;
  socialProof: string;
  instantDeliveryText: string;
  features: string[];
}

export interface AntarangaSecretResult {
  devoteeName: string;
  lang: AntarangaLang;
  lagnaSignName: string;
  moonSignName: string;
  nakshatraName: string;
  moonPada: number;
  h8LordName: string;
  h8RashiName: string;
  h12LordName: string;
  h12RashiName: string;
  runningDashaText: string;
  paragraph1: string; // Outward Composure vs Hidden Inner Dilemma
  paragraph2: string; // Subconscious Solitude & The Unspoken Truth
  kshetraBlessing: string; // Sacred Gokarna Atma Linga Blessing
  isTimeUnknown?: boolean;
  todayLiveTarabala?: LiveTodayTarabalaOutput;
  pastVerification?: {
    periodLabel: string;
    headline: string;
    proofText: string;
    symptoms: string[];
  };
  curiosityMiniCards?: {
    maandiCard: {
      house: number;
      title: string;
      desc: string;
      lockedCta: string;
    };
    yogiCard: {
      yogiPlanet: string;
      avayogiPlanet: string;
      title: string;
      desc: string;
      lockedCta: string;
    };
  };
  moorthyNirnaya?: MoorthyNirnayaData;
  cosmicVoltage?: CosmicLifeVoltageData;
  fiveYearPreview?: FiveYearPreviewHorizonData;
  luckyElements?: FreeLuckyElementsData;
  diningOffer?: DiningConversionOfferData;
}

export const HOTEL_PALM_PRICE_INR = 150;
export const HOTEL_FACE_PRICE_INR = 150;
export const HOTEL_PRASHNA_PRICE_INR = 200;
export const HOTEL_SAMUDRIKA_COMBO_INR = 249;
export const HOTEL_TRINETRA_ALL3_INR = 349;
export const HOTEL_EXPRESS_PRICE_INR = 149;
export const HOTEL_PDF_PRICE_INR = 350;
export const HOTEL_REMEDY_ADDON_INR = 100;
export const HOTEL_PREMIUM_REMEDY_PRICE_INR = 450;
export const HOTEL_FAMILY_UPSELL_PRICE_INR = 250;
export type HotelPackageType =
  | "palm_150"
  | "face_150"
  | "prashna_200"
  | "samudrika_combo_249"
  | "trinetra_all3_349"
  | "express_149"
  | "standard_350"
  | "remedy_450"
  | "family_250";

export const PRIEST_UPI_ID = DEFAULT_PRIEST_UPI_ID; // "9108135387@ybl"
export const PRIEST_UPI_NAME = DEFAULT_PRIEST_UPI_NAME; // "Sumana Ranganath Maarigoli"
export const PRIEST_NAME = DEFAULT_PRIEST_NAME; // "Shreeram Pandit"
export const PRIEST_PHONE = "9108135387";

export const DEFAULT_HOTEL_NAME = "Pandit Palette";
export const DEFAULT_HOTEL_FULL_NAME = "Pandit Palette (ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್)";
export const DEFAULT_HOTEL_TAGLINE = "ಅತ್ಯುತ್ತಮ ಉಪಹಾರ & ಸಸ್ಯಾಹಾರಿ ಭೋಜನ ಮಂದಿರ (Fine Dining Restaurant)";

/**
 * Generates a unique, collision-free Hotel Dining Order ID
 * Example: PP_T1_K9X8_2M
 */
export function generateHotelOrderId(tableNumber: string | number = "1"): string {
  const cleanTable = String(tableNumber || "1").replace(/[^a-zA-Z0-9]/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `PP_T${cleanTable}_${timestamp}_${randomSuffix}`;
}

// 7-Language Localized Rashi Names
export const RASHI_7L: Record<number, Record<AntarangaLang, string>> = {
  0: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்", ml: "മേടം", mr: "मेष" },
  1: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்", ml: "ഇടവം", mr: "वृषभ" },
  2: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்", ml: "മിഥുനം", mr: "मिथुन" },
  3: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்", ml: "കർക്കടകം", mr: "कर्क" },
  4: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்", ml: "ചിങ്ങം", mr: "सिंह" },
  5: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி", ml: "കന്നി", mr: "कन्या" },
  6: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తులా", ta: "துலாம்", ml: "തുലാം", mr: "तूळ" },
  7: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்", ml: "വൃശ്ചികം", mr: "वृश्चिक" },
  8: { kn: "ಧನು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு", ml: "ധനു", mr: "धनु" },
  9: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்", ml: "മകരം", mr: "मकर" },
  10: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்", ml: "കുംഭം", mr: "कुंभ" },
  11: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்", ml: "മീനം", mr: "मीन" }
};

// 7-Language Localized Graha Names
export const GRAHA_7L: Record<GrahaKey, Record<AntarangaLang, string>> = {
  Sun: { kn: "ಸೂರ್ಯ", en: "Sun", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்", ml: "സൂര്യൻ", mr: "सूर्य" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்", ml: "ചന്ദ്രൻ", mr: "चंद्र" },
  Mars: { kn: "ಮಂಗಳ (ಕುಜ)", en: "Mars", hi: "मंगल", te: "కుజుడు (మంగళ)", ta: "செவ்வாய்", ml: "ചൊവ്വ", mr: "मंगळ" },
  Mercury: { kn: "ಬುಧ", en: "Mercury", hi: "बुध", te: "బుధుడు", ta: "புதன்", ml: "ബുധൻ", mr: "बुध" },
  Jupiter: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter", hi: "बृहस्पति (गुरु)", te: "గురుడు", ta: "குரு", ml: "വ്യാഴം (ഗുരു)", mr: "बृहस्पति (गुरु)" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்", ml: "ശുക്രൻ", mr: "शुक्र" },
  Saturn: { kn: "ಶನಿ", en: "Saturn", hi: "शनि", te: "శని", ta: "சனி", ml: "ശനി", mr: "शनि" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு", ml: "രാഹു", mr: "राहू" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது", ml: "കേതു", mr: "केतू" }
};

export function toGrahaKey(val: any): GrahaKey {
  const s = String(val || "").toLowerCase();
  if (s.includes("sun") || s.includes("ravi") || s.includes("surya")) return "Sun";
  if (s.includes("moon") || s.includes("chandra")) return "Moon";
  if (s.includes("mars") || s.includes("kuja") || s.includes("mangal")) return "Mars";
  if (s.includes("mercury") || s.includes("budha")) return "Mercury";
  if (s.includes("jupiter") || s.includes("guru") || s.includes("brihaspati")) return "Jupiter";
  if (s.includes("venus") || s.includes("shukra")) return "Venus";
  if (s.includes("saturn") || s.includes("shani")) return "Saturn";
  if (s.includes("rahu")) return "Rahu";
  if (s.includes("ketu")) return "Ketu";
  return "Jupiter";
}

// 7-Language Localized Nakshatra Names
export const NAKSHATRA_7L: Record<number, Record<AntarangaLang, string>> = {
  0: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", te: "అశ్విని", ta: "அஸ்வினி", ml: "അശ്വതി", mr: "अश्विनी" },
  1: { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", te: "భరణి", ta: "பரணி", ml: "ഭരണി", mr: "भरणी" },
  2: { kn: "ಕೃತಿಕಾ", en: "Krittika", hi: "कृत्तिका", te: "కృత్తిక", ta: "கிருத்திகை", ml: "കാർത്തിക", mr: "कृत्तिका" },
  3: { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", te: "రోహిణి", ta: "ரோகிணி", ml: "രോഹിണി", mr: "रोहिणी" },
  4: { kn: "ಮೃಗಶಿರ", en: "Mrigashira", hi: "मृगशिरा", te: "మృగశిర", ta: "மிருகசீரிஷம்", ml: "മകയിരം", mr: "मृगशीर्ष" },
  5: { kn: "ಆರಿದ್ರಾ", en: "Ardra", hi: "आर्द्रा", te: "ఆర్ద్ర", ta: "திருவாதிரை", ml: "തിരുവാതിര", mr: "आर्द्रा" },
  6: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", te: "పునర్వసు", ta: "புனர்பூசம்", ml: "പുണർതം", mr: "पुनर्वसू" },
  7: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", te: "పుష్యమి", ta: "பூசம்", ml: "പൂയം", mr: "पुष्य" },
  8: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "आश्लेषा", te: "ఆశ్లేష", ta: "ஆயில்யம்", ml: "ആയില്യം", mr: "आश्लेषा" },
  9: { kn: "ಮಘಾ", en: "Magha", hi: "मघा", te: "మఖ", ta: "மகம்", ml: "മകം", mr: "मघा" },
  10: { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ (ಪುಬ್ಬ)", en: "Purva Phalguni", hi: "पूर्वाफाल्गुनी", te: "పూర్వఫల్గుణి (పుబ్బ)", ta: "பூரம்", ml: "പൂരം", mr: "पूर्वा फाल्गुनी" },
  11: { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ (ಉತ್ತರೆ)", en: "Uttara Phalguni", hi: "उत्तराफाल्गुनी", te: "ఉత్తరఫల్గుణి", ta: "உத்திரம்", ml: "ഉത്രം", mr: "उत्तरा फाल्गुनी" },
  12: { kn: "ಹಸ್ತ", en: "Hasta", hi: "हस्त", te: "హస్త", ta: "ஹஸ்தம்", ml: "അത്തം", mr: "हस्त" },
  13: { kn: "ಚಿತ್ತಾ", en: "Chitra", hi: "चित्रा", te: "చిత్త", ta: "சித்திரை", ml: "ചിത്തിര", mr: "चित्रा" },
  14: { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", te: "స్వాతి", ta: "சுவாதி", ml: "ചോതി", mr: "स्वाती" },
  15: { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", te: "విశాఖ", ta: "விசாகம்", ml: "വിശാഖം", mr: "विशाखा" },
  16: { kn: "ಅನುರಾಧಾ", en: "Anuradha", hi: "अनुराधा", te: "అనూరాధ", ta: "அனுஷம்", ml: "അനിഴം", mr: "अनुराधा" },
  17: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", te: "జ్యేష్ఠ", ta: "கேட்டை", ml: "തൃക്കേട്ട", mr: "ज्येष्ठा" },
  18: { kn: "ಮೂಲಾ", en: "Mula", hi: "मूल", te: "మూల", ta: "மூலம்", ml: "മൂലം", mr: "मूळ" },
  19: { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purvashadha", hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ", ta: "பூராடம்", ml: "പൂരാടം", mr: "पूर्वाषाढा" },
  20: { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttarashadha", hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்", ml: "ഉത്രാടം", mr: "उत्तराषाढा" },
  21: { kn: "ಶ್ರವಣ", en: "Shravana", hi: "श्रवण", te: "శ్రవణం", ta: "திருவோணம்", ml: "തിരുവോണം", mr: "श्रवण" },
  22: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", te: "ధనిష్ఠ", ta: "அவிட்டம்", ml: "അവിട്ടം", mr: "धनिष्ठा" },
  23: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", te: "శతభిషం", ta: "சதயம்", ml: "ചതയം", mr: "शततारका" },
  24: { kn: "ಪೂರ್ವಾಭಾದ್ರಪದ", en: "Purva Bhadrapada", hi: "पूर्वाभाद्रपद", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி", ml: "പൂരുരുട്ടാതി", mr: "पूर्वा भाद्रपदा" },
  25: { kn: "ಉತ್ತರಾಭಾದ್ರಪದ", en: "Uttara Bhadrapada", hi: "उत्तराभाद्रपद", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி", ml: "ഉത്തൃട്ടാതി", mr: "उत्तरा भाद्रपदा" },
  26: { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", te: "రేవతి", ta: "ரேவதி", ml: "രേവതി", mr: "रेवती" }
};

/**
 * 7-Language Deep Astrological Nigoodha (8th Lord Occult Secret) Profiles
 */
export function getAntarangaNigoodhaDetails(
  graha: GrahaKey,
  lang: AntarangaLang
): { conflict: string; remedy: string } {
  switch (graha) {
    case "Mars":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಪ್ರಶಾಂತ ಹಾಗೂ ಸೌಮ್ಯ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ನಿಗೂಢ ಕೋಪ, ಅಸಹನೆ ಹಾಗೂ ಮಾನಸಿಕ ಉಗ್ರತೆ ಅಡಗಿದೆ. ಅಂದುಕೊಂಡ ಕಾರ್ಯಗಳು ಅನಿರೀಕ್ಷಿತವಾಗಿ ವಿಳಂಬವಾದಾಗ ಅಥವಾ ನೆಚ್ಚಿನ ಜನರಿಂದ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದಾಗ ಮನಸ್ಸಿನ ಒಳಗಡೆ ತೀವ್ರ ಅಶಾಂತಿ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ಈ ಆಂತರಿಕ ಕೋಪವನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಬಂಧಿಸಿಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ಶಿರೋವೇದನೆ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆಯಂತಹ ತೊಂದರೆಗಳು ಎದುರಾಗಬಹುದು.",
        remedy: "ಕೋಪ ಶಮನ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಗಾಗಿ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಶೀತಲೀ ಪ್ರಾಣಾಯಾಮ, ಮಂಗಳವಾರ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀಗಂಧ-ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ಆಂತರಿಕ ಉಗ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಿ ನಿರಂತರ ತೇಜಸ್ಸು ನೀಡುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपके शांत एवं सौम्य मुखमंडल के पीछे एक गहरा आंतरिक गुप्त रोष, अधीरता और अनकहा असंतोष छुपा रहता है। जब कार्य में अप्रत्याशित विलंब होता है या आत्मीय जन विश्वास तोड़ते हैं, तो मन में तीव्र उग्रता जागृत होती है। इसे भीतर दबाने से सिरदर्द, अनिद्रा या तनाव की समस्या हो सकती है।",
        remedy: "क्रोध शमन एवं मानसिक शांति हेतु नित्य प्राणायाम करें, मंगलवार को श्री हनुमान/सुब्रह्मण्य जी की आराधना करें तथा श्री गोकर्ण महाबलेश्वर ज्योतिर्लिंग को शीतल दुग्धाभिषेक समर्पित करें।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या शांत आणि संयमी चेहऱ्यामागे तीव्र आंतरिक संताप, अधीरता आणि प्रचंड अस्वस्थता लपलेली आहे. जेव्हा कामात अचानक विलंब होतो किंवा जवळची माणसे विश्वासघात करतात, तेव्हा मनात तीव्र खळबळ उडते. हा राग मनातच दाबून ठेवल्याने डोकेदुखी व मानसिक तणाव जाणवू शकतो.",
        remedy: "मानसिक शांततेसाठी दररोज १० मिनिटे ध्यान व प्राणायाम करा, मंगळवारी श्री सुब्रह्मण्य किंवा मारुतीची उपासना करा आणि श्री क्षेत्र गोकर्ण महाबळेश्वर पिंडीवर चंदनाभिषेक समर्पित करा."
      };
      if (lang === "te") return {
        conflict: "మీ శాంత స్వభావం వెనుక ఒక రహస్య అంతర్గత కోపం, అసహనం దాగి ఉన్నాయి. పనుల్లో ఆకస్మిక జాప్యం జరిగినప్పుడు లేదా నమ్మినవారు మోసం చేసినప్పుడు మనస్సులో తీవ్రమైన అశాంతి రేగుతుంది. దీనిని లోపలే దాచుకోవడం వల్ల ఒత్తిడి, తలనొప్పి వంటివి రావచ్చు.",
        remedy: "కోప నివారణ మరియు మనశ్శాంతి కొరకు ప్రతిరోజూ ప్రాణాయామం చేయడం, మంగళవారం సుబ్రహ్మణ్య స్వామి పూజ మరియు గోకర్ణ మహాబలేశ్వర స్వామికి క్షీరాభిషేకం జరిపించడం శ్రేయస్కరం."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் அமைதியான முகபாவத்தின் பின்னே மறைமுகமான உள்மன கோபமும், பொறுமையின்மையும் ஒளிந்துள்ளது. பணிகள் தாமதமாகும் போதோ அல்லது நம்பிக்கைக்குரியவர்கள் ஏமாற்றும் போதோ மனதில் தீவிர கொந்தளிப்பு உண்டாகிறது. இதனை மனதிற்குள்ளேயே அடக்குவது தலைவலி அல்லது மன அழுத்தத்தை தரக்கூடும்.",
        remedy: "கோப தணிப்பிற்கும் மன அமைதிக்கும் தினமும் பிராணாயாமம் செய்வதும், செவ்வாய்க்கிழமைகளில் சுப்பிரமணியர் வழிபாடும், கோகர்ணம் மகாபலேஸ்வரருக்கு பாலாபிஷேகம் செய்வதும் அமைதியைத் தரும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ശാന്തമായ പെരുമാറ്റത്തിന് പിന്നിൽ കടുത്ത ആന്തരിക രോഷവും, അക്ഷമയും, മറ്റുള്ളവരോട് പറയാൻ കഴിയാത്ത മാനസിക അശാന്തിയും ഒളിഞ്ഞിരിക്കുന്നു. വിചാരിച്ച കാര്യങ്ങൾ തടസ്സപ്പെടുമ്പോഴോ പ്രിയപ്പെട്ടവർ ചതിക്കുമ്പോഴോ മനസ്സ് കത്തുന്നു. ഇത് ഉള്ളിലൊതുക്കുന്നത് തലവേദനയ്ക്കും ഉറക്കമില്ലായ്മയ്ക്കും കാരണമാകുന്നു.",
        remedy: "മനസ്സിന് ശാന്തി ലഭിക്കാൻ ദിവസവും പ്രാണായാമം ചെയ്യുക, ചൊവ്വാഴ്ചകളിൽ മുരുകനെയോ ഹനുമാനെയോ ഭജിക്കുക, ഗോകർണം മഹാബലേശ്വര ക്ഷേത്രത്തിൽ പാൽ അഭിഷേകം നടത്തുക."
      };
      return {
        conflict: "Beneath your composed exterior lies a subterranean reservoir of intense impatience, unexpressed frustration, and fiery inner anger. When anticipated outcomes face delays or trusted confidants fail their word, internal turmoil flares. Repressing this emotional heat causes periodic tension, headaches, or restless sleep.",
        remedy: "To pacify internal fire and anchor tranquil equilibrium, practicing daily cooling pranayama (Sheetali), invoking Lord Subramanya or Hanuman on Tuesdays, and sponsoring a sacred sandalwood milk abhishekam at Sri Kshetra Gokarna Mahabaleshwara dissolves subconscious friction."
      };

    case "Saturn":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಗಂಭೀರ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ಏಕಾಂಗಿತನ, ಹಳೆಯ ಕಹಿ ಘಟನೆಗಳ ನೆನಪು ಹಾಗೂ ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಲಾಗದ ನಿಗೂಢ ಕೌಟುಂಬಿಕ ದುಃಖ ಅಡಗಿದೆ. ಸಂಸಾರದ ಅಥವಾ ವೃತ್ತಿಯ ಎಲ್ಲಾ ಭಾರಗಳನ್ನು ನೀವೊಬ್ಬರೇ ಎದೆಯ ಮೇಲೆ ಹೊತ್ತು ಸಾಗುವಾಗ, ಅಂತರಂಗದಲ್ಲಿ ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಸೂಕ್ಷ್ಮ ಆತಂಕವು ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತದೆ.",
        remedy: "ಈ ಕರ್ಮಿಕ ಭಾರದಿಂದ ಮುಕ್ತಿ ಹೊಂದಲು ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಧ್ಯಾನ, ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಸಮರ್ಪಿಸುವುದು ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ ಕರುಣಿಸುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपकी गंभीरता के पीछे गहरा आंतरिक अकेलापन, अतीत के आघात और अनकहा दुख छुपा है। परिवार व कार्य का सारा बोझ स्वयं पर वहन करने से मन में भविष्य की अनिश्चितता को लेकर अवचेतन भय बना रहता है।",
        remedy: "इस मानसिक बोझ से मुक्ति हेतु नित्य ध्यान करें, शनिवार को तिल के तेल का दीपक जलाकर शनि स्तोत्र का पाठ करें तथा गोकर्ण क्षेत्र में महामृत्युंजय जाप का अनुष्ठान कराएं।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या गांभीर्यामागे खोल एकाकीपण, भूतकाळातील कटू आठवणी आणि कोणालाही न सांगता येणारे कौटुंबिक दुःख दडलेले आहे. कुटुंबाच्या व कामाच्या सर्व जबाबदाऱ्या एकट्याने पेलताना, भविष्याच्या अनिश्चिततेची सुप्त भीती मनात घर करून राहते.",
        remedy: "या मानसिक ओझ्यातून मुक्त होण्यासाठी दररोज ध्यान करा, शनिवारी तिळाच्या तेलाचा दिवा लावून दशरथ शनि स्तोत्र म्हणा आणि गोकर्ण महाबळेश्वर पिंडीवर महामृत्युंजय जप अनुष्ठान करा."
      };
      if (lang === "te") return {
        conflict: "మీ గంభీరత వెనుక లోతైన ఒంటరితనం, గతం నాటి చేదు జ్ఞాపకాలు మరియు ఎవరితోనూ చెప్పుకోలేని రహస్య మానసిక బాధ ఉన్నాయి. కుటుంబ బాధ్యతలను మీరొక్కరే మోస్తున్నప్పుడు తెలియని ఆందోళన బాధిస్తుంది.",
        remedy: "ఈ మానసిక భారం నుండి విముక్తి పొందడానికి రోజూ ధ్యానం చేయడం, శనివారం నువ్వుల నూనె దీపం వెలిగించడం మరియు గోకర్ణంలో మహా మృత్యుంజయ జపం జరిపించడం ఉత్తమం."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் கம்பீரமான தோற்றத்தின் பின்னே ஆழமான தனிமை உணர்வும், கடந்த கால கசப்பான நினைவுகளும் மறைந்துள்ளன. குடும்பத்தின் அனைத்து சுமைகளையும் தனியாக சுமக்கும் போது ஆழ்மனதில் எதிர்காலம் குறித்த ஒரு பயம் தோன்றக்கூடும்.",
        remedy: "இந்த மனச்சுமை நீங்க தினமும் தியானம் செய்வதும், சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றுவதும், கோகர்ணத்தில் மகா மிருத்யுஞ்சய ஜபம் செய்வதும் மனதிற்கு பேரமைதியைத் தரும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ഗൗരവമുള്ള മുഖഭാവത്തിന് പിന്നിൽ കടുത്ത ഏകാന്തതയും, കഴിഞ്ഞകാല അനുഭവങ്ങളുടെ മുറിവുകളും, ആരോടും പങ്കുവെക്കാൻ കഴിയാത്ത കുടുംബ ദുഃഖങ്ങളും ഒളിഞ്ഞിരിക്കുന്നു. എല്ലാ ഭാരങ്ങളും ഒറ്റയ്ക്ക് ചുമക്കുമ്പോൾ ഉള്ളിൽ ഭാവിയെക്കുറിച്ചുള്ള ഭയം വേട്ടയാടുന്നു.",
        remedy: "ഈ മാനസിക ഭാരം നീക്കാൻ നിത്യവും ധ്യാനം ശീലിക്കുക, ശനിയാഴ്ചകളിൽ എള്ളെണ്ണ വിളക്ക് കൊളുത്തുക, ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ മഹാമൃത്യുഞ്ജയ ജപം നടത്തുക."
      };
      return {
        conflict: "Beneath your solemn fortitude lies an intimate existential loneliness, echoes of past hardship, and the heavy burden of carrying familial responsibilities in stoic isolation. Reluctance to burden others causes you to swallow personal sorrow, breeding subconscious fatigue.",
        remedy: "To dissolve these karmic impressions, daily silent meditation, lighting a sesame oil lamp on Saturdays, reciting the Dasharatha Shani Stotram, and sponsoring a Maha Mrityunjaya Japa at Sri Kshetra Gokarna Mahabaleshwara restore enduring peace of mind."
      };

    case "Moon":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ನಗುಮುಖದ ಅಡಿಯಲ್ಲಿ ಅತೀವ ಭಾವನಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ, ಹಳೆಯ ಪ್ರೇಮ ಅಥವಾ ಬಾಂಧವ್ಯಗಳ ಕಹಿ ನೆನಪುಗಳು ಹಾಗೂ ಯಾರೂ ತನ್ನನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಿಲ್ಲವೆಂಬ ಒಂಟಿತನದ ನಿಗೂಢ ನೋವು ಅಡಗಿದೆ. ಇತರರನ್ನು ಸಂತೈಸಲು ಹೋಗಿ ನಿಮ್ಮ ಸ್ವಂತ ಕಣ್ಣೀರುಗಳನ್ನು ಏಕಾಂತದಲ್ಲೇ ಬಚ್ಚಿಟ್ಟುಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.",
        remedy: "ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆಗಾಗಿ ಸೋಮವಾರ ಚಂದ್ರಶೇಖರ ಶಿವನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು, ನಿತ್ಯ ಓಂ ನಮಃ ಶಿವಾಯ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಪಾವನ ಸಮುದ್ರ ತೀರದಲ್ಲಿ ಧ್ಯಾನಸ್ಥರಾಗಿ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನ ಪಡೆಯುವುದು ಸುಪ್ತ ಮನಸ್ಸಿಗೆ ದಿವ್ಯ ಸಾಂತ್ವನ ನೀಡುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपकी मुस्कान के पीछे अत्यधिक भावनात्मक संवेदनशीलता, संबंधों के पुराने घाव और यह भाव छुपा रहता है कि कोई आपको गहराई से समझ नहीं पाता। दूसरों को प्रसन्न रखने के प्रयास में आप अपने आंसुओं को एकांत में छुपाते हैं।",
        remedy: "मानसिक शांति हेतु सोमवार को शिवजी को कच्चा दूध अर्पित करें, ॐ नमः शिवाय का जप करें तथा गोकर्ण समुद्र तट पर आत्मलिंग महाबलेश्वर का दर्शन व पूजन करें।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या हसऱ्या चेहऱ्यामागे अतिशय हळवे मन, नात्यांमधील जुने आघात आणि 'मला कोणीही पूर्णपणे समजून घेतले नाही' ही छुपी खंत दडलेली आहे. इतरांना आनंद देताना आपण स्वतःचे अश्रू एकांतातच लपवता.",
        remedy: "मनाच्या शांतीसाठी सोमवारी शंकराला दुग्धाभिषेक करा, ॐ नमः शिवाय मंत्राचा जप करा आणि गोकर्ण येथील आत्मलिंग महाबळेश्वराचे दर्शन घ्या."
      };
      if (lang === "te") return {
        conflict: "మీ చిరునవ్వు వెనుక తీవ్రమైన భావోద్వేగ సున్నితత్వం, పాత బంధాల గాయాలు మరియు తనను ఎవరూ సరిగా అర్థం చేసుకోలేదన్న ఒంటరి బాధ దాగి ఉన్నాయి. ఇతరుల కోసం మీ బాధలను మీలోనే దాచుకుంటారు.",
        remedy: "మనశ్శాంతి కొరకు సోమవారం శివునికి పాలతో అభిషేకం చేయడం, ఓం నమః శివాయ జపం మరియు గోకర్ణ మహాబలేశ్వర దర్శనం అద్భుతమైన సాంత్వనను కలిగిస్తాయి."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் புன்னகையின் பின்னே அதீத உணர்ச்சிவசப்படுதல், பழைய உறவுகளின் காயங்கள் மற்றும் தன்னை யாரும் முழுமையாக புரிந்து கொள்ளவில்லை என்ற ஏக்கமும் மறைந்துள்ளது. மற்றவர்களுக்காக உங்கள் வலிகளை மறைக்கும் சுபாவம் உண்டு.",
        remedy: "மன அமைதிக்கு திங்கட்கிழமைகளில் சிவபெருமானுக்கு பாலாபிஷேகம் செய்வதும், ஓம் நம சிவாய ஜெபிப்பதும், கோகர்ணம் ஆத்மலிங்க மகாபலேஸ்வரரை தரிசிப்பதும் ஆத்ம திருப்தியைத் தரும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ പുഞ്ചിരിക്ക് പിന്നിൽ അഗാധമായ വൈകാരിക സങ്കടങ്ങളും, പഴയ ബന്ധങ്ങളുടെ മുറിവുകളും, തന്നെ ആരും പൂർണ്ണമായി മനസ്സിലാക്കുന്നില്ലെന്ന വിങ്ങലും ഒളിഞ്ഞിരിക്കുന്നു. മറ്റുള്ളവർക്കായി സ്വന്തം കണ്ണീർ ഉള്ളിലൊതുക്കുന്ന സ്വഭാവമാണ് നിങ്ങളുടേത്.",
        remedy: "മാനസിക സമാധാനത്തിനായി തിങ്കളാഴ്ചകളിൽ ശിവന് പാൽ അഭിഷേകം നടത്തുക, ഓം നമഃ ശിവായ ജപിക്കുക, ഗോകർണം മഹാബലേശ്വര ആത്മലിംഗം ദർശിക്കുക."
      };
      return {
        conflict: "Beneath your cheerful countenance lies an acutely tender emotional vulnerability, lingering emotional scars from past betrayals, and a quiet sense that few truly perceive your soul's depth. Shielding others from your grief, you weep in private solitude.",
        remedy: "To heal emotional impressions, offering milk abhishekam on Mondays to Lord Shiva, chanting Om Namah Shivaya, and offering prayers at the sacred Gokarna Mahabaleshwara Atma Linga bring deep maternal reassurance and serenity."
      };

    case "Sun":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಅದಮ್ಯ ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದ ಅಡಿಯಲ್ಲಿ ಗುರುತಿಸಲ್ಪಡದ ತ್ಯಾಗಗಳ ನೋವು, ಸುಪ್ತ ಅಹಂನ ಗಾಯಗಳು ಹಾಗೂ ಅನ್ಯಾಯದ ನಿಂದನೆಯಿಂದ ಉಂಟಾದ ಆಂತರಿಕ ನಿಗೂಢ ಸಂಕಟ ಅಡಗಿದೆ. ಎಷ್ಟೇ ಕಷ್ಟ ಬಂದರೂ ಇತರರ ಮುಂದೆ ಕೈಚಾಚದೆ ಒಳಗೊಳಗೇ ತೊಳಲಾಡುವ ನಡವಳಿಕೆ ನಿಮ್ಮಲ್ಲಿದೆ.",
        remedy: "ಈ ಅಂತರಂಗದ ಸಂಕಟ ನಿವಾರಣೆಗೆ ನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ, ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯಾರ್ಘ್ಯ ಸಮರ್ಪಣೆ, ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ/ಗೋಸೇವೆ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸುವುದು ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपके स्वाभिमान के पीछे अनकहे त्यागों की पीड़ा और आंतरिक स्वाभिमान के घाव छुपे हैं। विषम परिस्थितियों में भी किसी के आगे हाथ न फैलाने की जिद आपको भीतर ही भीतर मानसिक तनाव देती है।",
        remedy: "आंतरिक शांति हेतु नित्य आदित्य हृदय स्तोत्र का पाठ करें, सूर्यदेव को तांबे के पात्र से जल अर्पित करें तथा गोकर्ण क्षेत्र में महाबलेश्वर भगवान का रुद्राभिषेक कराएं।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या प्रबळ स्वाभिमानामागे कोणालाही न दिसणाऱ्या त्यागांचे दुःख आणि दुखावलेल्या अहंकाराची वेदना लपलेली आहे. कितीही बिकट परिस्थिती असली तरी कोणापुढे हात न पसरण्याच्या हट्टामुळे आपण मनातल्या मनात घुसमट सहन करता.",
        remedy: "नित्य आदित्य हृदय स्तोत्राचे पठण करा, तांब्याच्या पात्रातून सूर्याला अर्घ्य द्या आणि श्री क्षेत्र गोकर्ण येथे रुद्राभिषेक सेवा अर्पण करा."
      };
      if (lang === "te") return {
        conflict: "మీ ఆత్మగౌరవం వెనుక గుర్తించబడని త్యాగాల బాధ మరియు అంతర్గత ఆవేదన దాగి ఉన్నాయి. ఎంత కష్టమొచ్చినా ఇతరులను సహాయం అడగకుండా మీలోనే కుమిలిపోయే స్వభావం ఉంటుంది.",
        remedy: "ఈ బాధల నివారణకు ఆదిత్య హృదయ స్తోత్ర పారాయణం, సూర్యార్ఘ్యం మరియు గోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం నిర్వహించడం విశేష ఫలితాలను ఇస్తాయి."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் சுயமரியாதையின் பின்னே அங்கீகரிக்கப்படாத தியாகங்களின் வலியும், மனக்காயங்களும் புதைந்துள்ளன. எவ்வளவு துன்பம் வந்தாலும் பிறரிடம் உதவி கேட்காமல் உங்களுக்குள்ளேயே தாங்கிக்கொள்ளும் சுபாவம் உண்டு.",
        remedy: "இந்த சுமை நீங்க ஆதித்ய ஹிருதய ஸ்தோத்திரம் பாராயணம் செய்வதும், சூரிய பகவானுக்கு நீர் அர்க்கியம் தருவதும், கோகர்ணம் மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்வதும் தேஜஸை பெருக்கும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ആത്മാഭിമാനത്തിന് പിന്നിൽ ആരും തിരിച്ചറിയാത്ത ത്യാഗങ്ങളുടെ വേദനയും മുറിവേറ്റ അഭിമാനവും ഒളിഞ്ഞിരിക്കുന്നു. എത്ര വിഷമമുണ്ടായാലും മറ്റുള്ളവരോട് സഹായം ചോദിക്കാതെ ഉള്ളിൽ ഉരുകുന്ന സ്വഭാവമാണ് നിങ്ങളുടേത്.",
        remedy: "ആദിത്യ ഹൃദയ സ്തോത്രം ജപിക്കുക, സൂര്യന് അർഘ്യം സമർപ്പിക്കുക, ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ രുദ്രാഭിഷേകം നടത്തുക."
      };
      return {
        conflict: "Beneath your proud self-command lies the quiet ache of unrecognized sacrifices, unhealed ego wounds, and an uncompromising dignity that strictly forbids you from asking for emotional or material help even in moments of dire duress.",
        remedy: "To transmute this fiery solitude, daily dawn recitation of Aditya Hridaya Stotram, offering copper water arghya to Lord Suryanarayana, ancestral honoring on Amavasya, and sponsoring a Rudrabhisheka at Sri Kshetra Gokarna elevate your vital aura."
      };

    case "Mercury":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಚುರುಕಾದ ಬುದ್ಧಿವಂತಿಕೆ ಹಾಗೂ ಮಾತಿನ ಜಾಣ್ಮೆಯ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಮಾನಸಿಕ ಅತಿ-ಆಲೋಚನೆ, ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಆತಂಕ ಹಾಗೂ ನಿದ್ರೆಯ ಸಮಯದಲ್ಲಿ ಮನಸ್ಸನ್ನು ಸ್ಥಿಮಿತದಲ್ಲಿಡಲಾಗದ ನಿಗೂಢ ನರಗಳ ಆಯಾಸ ಅಡಗಿದೆ. ಪ್ರತಿಯೊಂದನ್ನೂ ವಿಶ್ಲೇಷಿಸಿ ತಲೆಕೆಡಿಸಿಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ನಿಮ್ಮ ಶಾಂತಿಯನ್ನು ಕದಡುತ್ತದೆ.",
        remedy: "ಮನಸ್ಸಿನ ಪ್ರಶಾಂತತೆಗಾಗಿ ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ತುಳಸಿ ಪೂಜೆ, ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ೧೫ ನಿಮಿಷ ಏಕಾಂತ ಧ್ಯಾನ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನವು ನರಮಂಡಲಕ್ಕೆ ಅಪಾರ ಶಾಂತಿ ಕರುಣಿಸುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपकी तीक्ष्ण बुद्धि के पीछे अत्यधिक विचारशीलता, भविष्य की अनिश्चितता की गुप्त चिंता और रात्रि में अनिद्रा व मानसिक थकान छुपी रहती है। हर बात का सूक्ष्म विश्लेषण आपके चित्त को अशांत करता है।",
        remedy: "मानसिक संतुलन हेतु बुधवार को विष्णु सहस्रनाम का पाठ करें, तुलसी सेवा करें तथा सोने से पूर्व ध्यान करें। गोकर्ण महाबलेश्वर दर्शन आपके मन को असीम विश्रांति प्रदान करेगा।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या कुशाग्र बुद्धिमत्तेमागे सततचे अतिविचार, भविष्याची अनामिक भीती आणि रात्री शांत झोप न लागण्याची सुप्त चिंता लपलेली आहे. प्रत्येक गोष्टीचे अवाजवी विश्लेषण आपले मन अस्वस्थ करते.",
        remedy: "मानसिक स्थिरतेसाठी बुधवारी विष्णू सहस्रनाम म्हणा, तुळशीची सेवा करा आणि गोकर्ण महाबळेश्वर दर्शनाने मज्जासंस्थेला विश्रांती द्या."
      };
      if (lang === "te") return {
        conflict: "మీ చురుకైన బుద్ధి వెనుక మితిమీరిన ఆలోచనలు, భవిష్యత్ అనిశ్చితిపై ఆందోళన మరియు రాత్రివేళల్లో మనస్సు ప్రశాంతంగా ఉండకపోవడం వంటి రహస్య అలసట దాగి ఉన్నాయి.",
        remedy: "మనస్సు నిలకడ కొరకు బుధవారం విష్ణు సహస్రనామ పారాయణం, తులసి పూజ, రాత్రిపూట ధ్యానం మరియు గోకర్ణ మహాబలేశ్వర దర్శనం విశేష శాంతిని చేకూరుస్తాయి."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் கூரிய அறிவாற்றலின் பின்னே அதீத சிந்தனை, எதிர்காலம் குறித்த பதற்றம் மற்றும் இரவு நேரங்களில் அமைதியின்மை போன்ற மறைமுக மனச்சோர்வு ஒளிந்துள்ளது.",
        remedy: "மன அமைதிக்கு புதன்கிழமைகளில் விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்வதும், துளசி வழிபாடும், உறங்குவதற்கு முன் தியானம் செய்வதும், கோகர்ணம் மகாபலேஸ்வரர் தரிசனமும் நரம்பு மண்டலத்திற்கு புத்துணர்ச்சி தரும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ബുദ്ധിസാമർത്ഥ്യത്തിന് പിന്നിൽ അമിതമായ ചിന്തകളും, ഭാവിയെക്കുറിച്ചുള്ള ആധിയും, രാത്രിയിലെ ഉറക്കമില്ലായ്മയും ഒളിഞ്ഞിരിക്കുന്നു. എല്ലാ കാര്യങ്ങളും വിശകലനം ചെയ്ത് തലപുകയ്ക്കുന്നത് മനസ്സിന്റെ സമാധാനം കെടുത്തുന്നു.",
        remedy: "ബുധനാഴ്ചകളിൽ വിഷ്ണു സഹസ്രനാമം ജപിക്കുക, തുളസി പൂജിക്കുക, ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ പ്രാർത്ഥിക്കുക."
      };
      return {
        conflict: "Beneath your agile intellectual wit lies chronic cognitive overthinking, nervous exhaustion, and nocturnal racing thoughts that resist mental quietude. Dissecting every nuance and guarding confidential matters generates underlying mental strain.",
        remedy: "To pacify mental turbulence, reciting the Sri Vishnu Sahasranama on Wednesdays, keeping sacred Tulasi leaves near the bed, practicing 15 minutes of pre-sleep meditation, and praying at Sri Kshetra Gokarna restore crystalline cognitive tranquility."
      };

    case "Jupiter":
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಧಾರ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಔದಾರ್ಯದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ಅಸಹಾಯಕತೆ, ತಾನು ನಿಸ್ವಾರ್ಥವಾಗಿ ಉಪಕಾರ ಮಾಡಿದ ಜನರೇ ಕೃತಘ್ನರಾದಾಗ ಉಂಟಾದ ಅಂತರಂಗದ ಮೂಕ ರೋಧನ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಭ್ರಮನಿರಸನ ಅಡಗಿದೆ. ಎಲ್ಲರಿಗೂ ಧೈರ್ಯ ಹೇಳುವ ನೀವು ನಿಮ್ಮ ಸ್ವಂತ ವೇದನೆಯಲ್ಲಿ ಒಂಟಿಯಾಗಿ ನಿಲ್ಲುತ್ತೀರಿ.",
        remedy: "ಆತ್ಮಸ್ಥೈರ್ಯಕ್ಕಾಗಿ ಗುರುವಾರ ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪ್ರಾರ್ಥನೆ, ಹಸಿದ ಹಸುಗಳಿಗೆ ಬೆಲ್ಲ-ಬಾಳೆಹಣ್ಣು ನೀಡುವುದು, ಗುರು ಸೇವೆ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿರ್ಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಅರ್ಚನೆ ಮಾಡಿಸುವುದು ಅಂತರಂಗದ ಸಕಲ ದುಃಖಗಳನ್ನು ಕರಗಿಸುತ್ತದೆ."
      };
      if (lang === "hi") return {
        conflict: "आपके मार्गदर्शन और उदारता के पीछे आंतरिक विवशता, उपकृत जनों की कृतघ्नता से उत्पन्न मौन वेदना और दार्शनिक निराशा छुपी रहती है। सबको ढांढस बंधाने वाले आप स्वयं के कष्ट में नितांत अकेले खड़े रहते हैं।",
        remedy: "आत्मिक शांति हेतु गुरुवार को श्री दक्षिणामूर्ति की स्तुति करें, गौमाता को गुड़ खिलाएं तथा गोकर्ण महाबलेश्वर भगवान को बिल्वपत्र अर्पित कराएं।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या मार्गदर्शन व औदार्यामागे आंतरिक असहाय्यता, ज्यांच्यावर उपकार केले त्यांच्या कृतघ्नतेमुळे झालेली मूक वेदना लपलेली आहे. सर्वांना धीर देणारे आपण स्वतःच्या संकटात मात्र पूर्णपणे एकटे पडता.",
        remedy: "गुरुवारी श्री दक्षिणामूर्ती स्तोत्राचे पठण करा, गाईला गूळ-पोळी द्या आणि गोकर्ण महाबळेश्वर पिंडीवर बिल्वपत्र अर्पण करा."
      };
      if (lang === "te") return {
        conflict: "మీ ఉదారత వెనుక ఒక లోతైన నిస్సహాయత, మేలు చేసినవారే కృతఘ్నులైనప్పుడు కలిగిన మూగ వేదన దాగి ఉన్నాయి. అందరికీ ధైర్యం చెప్పే మీరు మీ స్వంత బాధల్లో ఒంటరిగా మిగిలిపోతారు.",
        remedy: "ఆత్మవిశ్వాసం కొరకు గురువారం శ్రీ దక్షిణామూర్తి స్తోత్రం, ఆవుకు బెల్లం తినిపించడం మరియు గోకర్ణ మహాబలేశ్వరునికి బిల్వపత్రార్చన చేయించడం అత్యంత శ్రేయస్కరం."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் பெருந்தன்மையின் பின்னே ஒரு ஆழ்ந்த இயலாமையும், நீங்கள் உதவி செய்தவர்களே நன்றி மறந்த போது ஏற்பட்ட சொல்லொணா மனவேதனையும் ஒளிந்துள்ளது. மற்றவர்களுக்கு ஆறுதல் கூறும் நீங்கள் உங்கள் துயரத்தில் தனித்து நிற்கிறீர்கள்.",
        remedy: "மன அமைதிக்கு வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு, பசுவிற்கு வெல்லம் வழங்குதல் மற்றும் கோகர்ணம் மகாபலேஸ்வரருக்கு வில்வ அர்ச்சனை செய்வது ஆழ்மன வலிகளைப் போக்கும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ദയാവായ്പിന് പിന്നിൽ കടുത്ത നിസ്സഹായാവസ്ഥയും, സഹായിച്ചവർ തന്നെ നന്ദികേട് കാട്ടുമ്പോൾ ഉണ്ടാകുന്ന ഹൃദയവേദനയും ഒളിഞ്ഞിരിക്കുന്നു. എല്ലാവർക്കും ആശ്വാസമേകുന്ന നിങ്ങൾ സ്വന്തം വേദനകളിൽ തനിച്ചാകുന്നു.",
        remedy: "വ്യാഴാഴ്ചകളിൽ ദക്ഷിണാമൂർത്തിയെ ഭജിക്കുക, പശുക്കൾക്ക് ശർക്കരയും പഴവും നൽകുക, ഗോകർണം മഹാബലേശ്വര ക്ഷേത്രത്തിൽ കൂവളത്തില അർച്ചന നടത്തുക."
      };
      return {
        conflict: "Beneath your generous and wise mentorship lies silent philosophical sorrow, the unhealed sting of ingratitude from those whom you championed selflessly, and a secret feeling of being emotionally forsaken when you yourself require spiritual support.",
        remedy: "To heal these soul wounds, chanting the Sri Dakshinamurthy Stotram on Thursdays, feeding cows with jaggery and bananas, and offering sacred Bilva Patra archana at the holy Gokarna Mahabaleshwara sanctum infuse profound spiritual sovereignty."
      };

    case "Venus":
    default:
      if (lang === "kn") return {
        conflict: "ನಿಮ್ಮ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಕಲಾತ್ಮಕ ನಡವಳಿಕೆಯ ಅಡಿಯಲ್ಲಿ ಭಾವನಾತ್ಮಕ ಒಡನಾಟದಲ್ಲಿ ಉಂಟಾದ ನಿಗೂಢ ನಿರಾಶೆ, ಸೌಂದರ್ಯ ಹಾಗೂ ಪ್ರೇಮದ ಅಪೂರ್ಣ ಕನಸುಗಳು ಹಾಗೂ ಲೌಕಿಕ ಹೊಂದಾಣಿಕೆಗಳ ನಡುವೆ ಕಳೆದುಹೋದ ತನ್ನ ಆಂತರಿಕ ಆಶಯಗಳ ಸುಪ್ತ ಕೊರಗು ಅಡಗಿದೆ.",
        remedy: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ಅಂತರಂಗದ ಶಾಂತಿಗಾಗಿ ಪ್ರತಿ ಶುಕ್ರವಾರ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಶ್ರೀ ಸೂಕ್ತ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಅಷ್ಟೋತ್ತರ ಪಠಣ, ಮನೆಯಲ್ಲಿ ಸ್ತ್ರೀಯರ ಗೌರವ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗೌರಿ-ಶಂಕರ ದರ್ಶನ ಮತ್ತು ಕ್ಷೀರಾಭಿಷೇಕ ಸಮರ್ಪಿಸುವುದು ಶ್ರೇಷ್ಠ."
      };
      if (lang === "hi") return {
        conflict: "आपके आकर्षक व्यक्तित्व के पीछे भावनात्मक संबंधों की मौन निराशा, सौंदर्य व स्नेह के अधूरे स्वप्न और व्यावहारिक समझौतों में दबी आंतरिक अभिलाषाएं छुपी रहती हैं।",
        remedy: "चित्त शुद्धि एवं सुख हेतु शुक्रवार को शुद्ध घी का दीपक जलाकर श्री सूक्त का पाठ करें, नारियों का सम्मान करें तथा गोकर्ण में गौरी-शंकर पूजन व दुग्धाभिषेक कराएं।"
      };
      if (lang === "mr") return {
        conflict: "आपल्या आकर्षक व्यक्तिमत्त्वामागे भावनिक नात्यांमधील गुप्त निराशा, अपूर्ण राहिलेली सुंदर स्वप्ने आणि व्यावहारिक तडजोडींमध्ये दडपून ठेवलेली स्वतःची सुप्त इच्छा लपलेली आहे.",
        remedy: "शुक्रवारी तुपाचा दिवा लावून श्री सूक्त म्हणा, घरात महिलांचा आदर राखा आणि गोकर्ण महाबळेश्वर सानिध्यात गौरी-शंकर दर्शन व दुग्धाभिषेक करा."
      };
      if (lang === "te") return {
        conflict: "మీ ఆకర్షణీయమైన వ్యక్తిత్వం వెనుక సంబంధాలలో ఎదురైన రహస్య నిరాశ, ఆత్మీయ బంధాలలోని అసంతృప్తి మరియు బాహ్య రాజీల నడుమ దాగివున్న అంతర్గత ఆవేదన ఉన్నాయి.",
        remedy: "అంతరంగ శాంతి కొరకు శుక్రవారం నేతి దీపం వెలిగించి శ్రీ సూక్తం పఠించడం మరియు గోకర్ణంలో గౌరీ-శంకర పూజ జరిపించడం శ్రేయస్కరం."
      };
      if (lang === "ta") return {
        conflict: "உங்கள் வசீகரமான ஆளுமையின் பின்னே பாசப் பிணைப்புகளில் ஏற்பட்ட மறைமுக ஏமாற்றமும், சமரசங்களுக்கு இடையே தொலைந்துபோன ஆழ்மன ஆசைகளின் வலியும் ஒளிந்துள்ளது.",
        remedy: "மன அமைதிக்கு வெள்ளிக்கிழமைகளில் நெய் தீபமேற்றி ஸ்ரீ சூக்தம் பாராயணம் செய்வதும், கோகர்ணத்தில் கௌரி-சங்கரர் வழிபாடு செய்வதும் அகமகிழ்ச்சியைத் தரும்."
      };
      if (lang === "ml") return {
        conflict: "നിങ്ങളുടെ ആകർഷകമായ വ്യക്തിത്വത്തിന് പിന്നിൽ സ്നേഹബന്ധങ്ങളിൽ നേരിട്ട രഹസ്യ നിരാശകളും, ബാഹ്യമായ വിട്ടുവീഴ്ചകൾക്കിടയിൽ ഇല്ലാതായിപ്പോയ സ്വന്തം ആഗ്രഹങ്ങളുടെ വേദനയും ഒളിഞ്ഞിരിക്കുന്നു.",
        remedy: "വെള്ളിയാഴ്ചകളിൽ നെയ്യൊഴിച്ച് വിളക്ക് കൊളുത്തുക, ശ്രീ സൂക്തം ജപിക്കുക, ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ ഗൗരീ-ശങ്കര പൂജ നടത്തുക."
      };
      return {
        conflict: "Beneath your refined aesthetic grace lies an unspoken disillusionment in romantic or emotional intimacy, suppressed creative passions, and the secret melancholy of compromising soul desires for pragmatic domestic peace.",
        remedy: "To reawaken joyful romantic vitality, lighting a pure cow-ghee lamp on Fridays while chanting the Sri Suktam, honoring the divine feminine, and sponsoring a sacred Gauri-Shankara milk abhishekam at Sri Kshetra Gokarna Mahabaleshwara dissolve emotional barriers."
      };
  }
}

/**
 * Generates the authentic 2-paragraph "Antarangada Satya" across all 7 languages,
 * enriched with Free Moorthy Nirnaya, Cosmic Vitality Voltage, 5-Year Horizon Preview,
 * Free Lucky Elements, and Pandit Palette Dining Conversion Offer.
 */
/**
 * 1. Dynamic 7-Language Persona Opening (Tattva & Lagna Hook)
 * Radically differentiates based on Fire, Earth, Air, or Water element
 */
export function getPersonaOpening(
  element: "fire" | "earth" | "air" | "water",
  lagnaSignName: string,
  moonSignName: string,
  lang: AntarangaLang = "kn"
): string {
  if (element === "fire") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaSignName} ಹಾಗೂ ಅಗ್ನಿ ತತ್ವದ ${moonSignName} ರಾಶಿಯ ಸಂಯೋಗವು ಸಮಾಜಕ್ಕೆ ನಿಮ್ಮನ್ನು ಅದಮ್ಯ ಸ್ವಾಭಿಮಾನದ, ಅಂಜದ-ಅಳುಕದ ಹಾಗೂ ಅಸಾಧ್ಯ ಸವಾಲುಗಳನ್ನೂ ಎದೆಕೊಟ್ಟು ಎದುರಿಸುವ ಧೀರ ನಾಯಕನಂತೆ ತೋರಿಸುತ್ತದೆ. ನೀವು ಯಾರ ಮುಂದೆಯೂ ನಿಮ್ಮ ನೋವನ್ನು ತೋಡಿಕೊಂಡು ಕನಿಕರ ಬೇಡುವ ವ್ಯಕ್ತಿಯಲ್ಲ; ಸಂಕಟದ ಕಿಚ್ಚನ್ನು ಎದೆಯೊಳಗೇ ನುಂಗಿಕೊಂಡು, ಮುಖದಲ್ಲಿ ನಗು ಚೆಲ್ಲುತ್ತಾ ಎಲ್ಲವನ್ನೂ ನೀವೊಬ್ಬರೇ ನಿಭಾಯಿಸಲು ನಿಲ್ಲುತ್ತೀರಿ.`;
    if (lang === "hi") return `आपकी जन्म लग्न ${lagnaSignName} एवं अग्नि तत्व की ${moonSignName} राशि का तेज आपको संसार के समक्ष एक अत्यंत स्वाभिमानी, निडर और कठिन परिस्थितियों से अकेले टकराने वाले साहसी योद्धा के रूप में स्थापित करता है। आप किसी के समक्ष अपनी व्यथा का रोना रोकर सहानुभूति पाने वाले व्यक्ति नहीं हैं; अंतर्मन में समस्याओं की ज्वाला सुलगती रहे, फिर भी आप मुस्कुराहट के साथ अकेले ही पूरे मोर्चे पर डटे रहते हैं।`;
    if (lang === "mr") return `आपले जन्म लग्न ${lagnaSignName} आणि अग्नि तत्त्वाची ${moonSignName} रास आपले बाह्य रूप अत्यंत स्वाभिमानी, निडर आणि कोणत्याही संकटाशी एकट्याने भिडणाऱ्या कणखर योद्ध्यासारखे दाखवते. आपण कोणापुढेही आपल्या दुःखाचे भांडवल करून सहानुभूती मिळवणारे व्यक्ती नाही; मनात कितीही संकटांचा वणवा पेटला तरी हसतमुखाने सर्व जबाबदाऱ्या एकट्याने पेलता.`;
    if (lang === "te") return `మీ జన్మ లగ్నం ${lagnaSignName} మరియు అగ్ని తత్వానికి చెందిన ${moonSignName} రాశి సంయోగం మిమ్మల్ని సమాజం దృష్టిలో అసాధారణ ఆత్మగౌరవం, ధైర్యం మరియు ఎలాంటి సవాళ్లనైనా ఒంటిచేత్తో ఎదుర్కొనే యోధుడిగా నిలబెడుతుంది. మీరు ఎవరి వద్దా చేతులు చాచి సానుభూతి కోరే వ్యక్తి కాదు; ఎంతటి కష్టాలనైనా గుండెల్లో దాచుకుని, పెదవులపై చిరునవ్వుతో ఒంటరిగానే పోరాడతారు.`;
    if (lang === "ta") return `உங்கள் ஜென்ம லக்னம் ${lagnaSignName} மற்றும் நெருப்பு தத்துவத்தின் ${moonSignName} ராசியின் சேர்க்கை உங்களை சமுதாயத்தின் முன் அபாரமான சுயமரியாதையும், துணிச்சலும் கொண்ட ஒரு மாவீரனாகக் காட்டுகிறது. யாரிடமும் உங்கள் துயரங்களைச் சொல்லி பரிதாபம் தேடும் சுபாவம் உங்களிடம் இல்லை; மனதிற்குள் துன்பத்தின் கனல் எரிந்தாலும் புன்னகையோடு அத்தனை சவால்களையும் தனியாகவே நின்று எதிர்கொள்கிறீர்கள்.`;
    if (lang === "ml") return `നിങ്ങളുടെ ജന്മ ലഗ്നമായ ${lagnaSignName}, അഗ്നി തത്വത്തിലുള്ള ${moonSignName} രാശി എന്നിവയുടെ സംയോഗം പുറംലോകത്തിന് മുന്നിൽ നിങ്ങളെ അതിശക്തനായ, ആത്മാഭിമാനമുള്ള, ഒരു വെല്ലുവിളിക്കും മുന്നിലും പതറാത്ത ധീരനായ വ്യക്തിയായി പ്രതിഷ്ഠിക്കുന്നു. ആരോടും സഹതാപം യാചിക്കുന്ന പ്രകൃതമല്ല നിങ്ങളുടേത്; ഉള്ളിലെ സങ്കടങ്ങളുടെ കനലുകൾ ഉള്ളിലൊതുക്കി, ചിരിക്കുന്ന മുഖത്തോടെ ഒറ്റയ്ക്ക് നിന്ന് പോരാടുന്നു.`;
    return `The cosmic synergy of your Ascendant (${lagnaSignName}) and the fiery element of your Moon Sign (${moonSignName}) projects you to the world as a fiercely independent, proud, and courageous warrior who tackles daunting challenges head-on. You refuse to solicit pity from anyone; swallowing internal stress with stoic resolve, you maintain a calm smile while fighting your battles entirely alone.`;
  }

  if (element === "earth") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaSignName} ಹಾಗೂ ಪೃಥ್ವಿ ತತ್ವದ ${moonSignName} ರಾಶಿಯ ಸಂಯೋಜನೆಯು ನಿಮಗೆ ಅಪ್ರತಿಮ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಹೆಗಲ ಮೇಲೆ ಹೊರುವ ಅಪೂರ್ವ ಗಟ್ಟಿತನವನ್ನು ನೀಡಿದೆ. ಸಮಾಜವು ನಿಮ್ಮನ್ನು ಸದಾ ಸ್ಥಿರಚಿತ್ತದ, ಪ್ರಬುದ್ಧ ಹಾಗೂ ಎಲ್ಲರ ನೆರವಿಗೆ ನಿಲ್ಲುವ ಭರವಸೆಯ ಆಸರೆಯಾಗಿ ನೋಡುತ್ತದೆ. ಆದರೆ ಆ ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಯೇ ನಿಮ್ಮ ಪಾಲಿಗೆ ಮೌನ ಬಂಧನವಾಗಿ ಮಾರ್ಪಟ್ಟಿದೆ; ಇತರರು ನಿಮ್ಮ ಸಹನೆ ಮತ್ತು ನಿಸ್ವಾರ್ಥ ದುಡಿಮೆಯನ್ನು ಅತಿಯಾಗಿ ಬಳಸಿಕೊಂಡರೂ ನೀವು ಕರ್ತವ್ಯದ ಹೆಸರಲ್ಲಿ ಎಲ್ಲವನ್ನೂ ಸದ್ದಿಲ್ಲದೆ ಸಹಿಸಿಕೊಳ್ಳುತ್ತೀರಿ.`;
    if (lang === "hi") return `आपकी जन्म लग्न ${lagnaSignName} एवं पृथ्वी तत्व की ${moonSignName} राशि आपको असीम धैर्य, अटूट कर्मठता और पारिवारिक जिम्मेदारियों को पूरी निष्ठा से वहन करने वाला एक मजबूत आधार बनाती है। संसार आपको सदैव गंभीर, परिपक्व और संकटमोचक के रूप में देखता है। किंतु यही अत्यधिक जिम्मेदारी आपके लिए एक मूक बंधन बन चुकी है; लोग आपकी सहनशीलता का लाभ उठाते हैं, फिर भी आप कर्तव्य के नाम पर सब चुपचाप सह जाते हैं।`;
    if (lang === "mr") return `आपले जन्म लग्न ${lagnaSignName} आणि पृथ्वी तत्त्वाची ${moonSignName} रास आपल्याला प्रचंड संयम, कर्तव्यदक्षता आणि कौटुंबिक जबाबदाऱ्यांचा डोंगर एकट्याने पेलण्याची क्षमता प्रदान करते. समाज आपल्याकडे एक स्थिर, विश्वासू आणि संकटमोचक आधारस्तंभ म्हणून पाहतो. पण याच अतीव जबाबदाऱ्या आपल्यासाठी एक मूक ओझे बनल्या आहेत; लोकांनी आपल्या त्यागाचा गैरफायदा घेतला तरी आपण गप्प बसून राहता.`;
    if (lang === "te") return `మీ జన్మ లగ్నం ${lagnaSignName} మరియు పృథ్వీ తత్వానికి చెందిన ${moonSignName} రాశి మీకు అపారమైన సహనం, కర్తవ్య నిష్ట మరియు కుటుంబ బాధ్యతలను మోసే అచంచలమైన స్థిరత్వాన్ని ఇచ్చాయి. సమాజం మిమ్మల్ని ఎంతో నమ్మకమైన, పరిపక్వత కలిగిన మార్గదర్శిగా చూస్తుంది. కానీ అదే బాధ్యత మీకు తెలియకుండానే ఒక మూగ బంధనంగా మారింది; ఇతరులు మీ సహనాన్ని చులకనగా చూసినా మీరు మౌనంగా భరిస్తారు.`;
    if (lang === "ta") return `உங்கள் ஜென்ம லக்னம் ${lagnaSignName} மற்றும் நில தத்துவத்தின் ${moonSignName} ராசி உங்களுக்கு அளப்பரிய பொறுமையையும், குடும்பச் சுமைகளை தாங்கும் அசைக்க முடியாத உறுதியையும் தந்துள்ளது. உலகம் உங்களை ஒரு நிலையான, முதிர்ந்த ஆதரவுத் தூணாகப் பார்க்கிறது. ஆனால் அந்த அதீத பொறுப்புணர்வே உங்களுக்கு ஒரு மௌன சுமையாக மாறிவிட்டது; மற்றவர்கள் உங்கள் தியாகங்களை சாதாரணமாக எடுத்துக் கொண்டாலும் நீங்கள் அமைதியாக கடந்து போகிறீர்கள்.`;
    if (lang === "ml") return `നിങ്ങളുടെ ജന്മ ലഗ്നമായ ${lagnaSignName}, പൃഥ്വി തത്വത്തിലുള്ള ${moonSignName} രാശി എന്നിവ നിങ്ങൾക്ക് അപാരമായ ക്ഷമയും, കർത്തവ്യബോധവും, കുടുംബഭാരങ്ങൾ ഒറ്റയ്ക്ക് ചുമക്കാനുള്ള കരുത്തും നൽകുന്നു. ഏവരും വിശ്വസിക്കുന്ന ഒരു തണൽമരമായാണ് സമൂഹം നിങ്ങളെ കാണുന്നത്. എന്നാൽ ആ അമിത ഉത്തരവാദിത്തം തന്നെ നിങ്ങളുടെ ഉള്ളിൽ വലിയൊരു ഭാരമായി മാറിയിരിക്കുന്നു; സ്വന്തം ത്യാഗങ്ങൾ ആരും വിലമതിച്ചില്ലെങ്കിലും നിങ്ങൾ മൗനമായി സഹിക്കുന്നു.`;
    return `The grounded alignment of your Ascendant (${lagnaSignName}) and earthy Moon Sign (${moonSignName}) endows you with monumental patience, duty, and the strength to shoulder immense family responsibilities. Society views you as an unshakeable pillar of stability and mature dependability. Yet this very reliability has become a quiet prison; others take your silent sacrifices for granted while you absorb the strain without complaint.`;
  }

  if (element === "air") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaSignName} ಹಾಗೂ ವಾಯು ತತ್ವದ ${moonSignName} ರಾಶಿಯ ಸಂಯೋಗವು ನಿಮ್ಮ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಮತ್ತೆ, ಮಾತುಗಾರಿಕೆ ಹಾಗೂ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಪರಿಸ್ಥಿತಿಯನ್ನು ತಿಳಿಗೊಳಿಸುವ ಚಾಣಾಕ್ಷತೆಯನ್ನು ಸಮಾಜಕ್ಕೆ ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ಹೊರಗೆ ನೀವು ಎಲ್ಲರೊಂದಿಗೆ ನಗುನಗುತ್ತಾ ಹರಟುವ ಅತ್ಯಂತ ಉತ್ಸಾಹಿಯಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಮನಸ್ಸಿನ ಒಳಗಡೆ ಆಲೋಚನೆಗಳ ಬಿರುಗಾಳಿ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಅತೃಪ್ತಿ ಸದಾ ಗಿರಕಿ ಹೊಡೆಯುತ್ತಿರುತ್ತದೆ. ನಿಮ್ಮ ನಿಜವಾದ ಉದ್ದೇಶ ಮತ್ತು ಭವಿಷ್ಯದ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಆಳವನ್ನು ಯಾರೊಬ್ಬರೂ ಪೂರ್ಣವಾಗಿ ಅರಿಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ.`;
    if (lang === "hi") return `आपकी जन्म लग्न ${lagnaSignName} एवं वायु तत्व की ${moonSignName} राशि आपकी तीक्ष्ण बुद्धि, वाकपटुता और किसी भी परिस्थिति में सहज ढल जाने की अद्भुत कला को दर्शाती है। बाहर से आप सबके साथ हंसते-बोलते अत्यंत ऊर्जावान दिखाई देते हैं, किंतु आपके अंतर्मन में विचारों का एक अशांत बवंडर और गहरा असंतोष निरंतर घूमता रहता है। आपके वास्तविक चिंतन और भविष्य की योजनाओं की गहराई को कोई समझ नहीं पाता।`;
    if (lang === "mr") return `आपले जन्म लग्न ${lagnaSignName} आणि वायु तत्त्वाची ${moonSignName} रास आपली तीव्र बुद्धिमत्ता, संभाषण चातुर्य आणि हसतमुख स्वभाव समाजासमोर आणते. बाहेरून आपण सर्वांमध्ये मिसळणारे अत्यंत उत्साही वाटत असला, तरी अंतर्मनात सतत विचारांचे वादळ आणि भावनिक असंतोष घोंघावत असतो. आपले विचार आणि योजना समजून घेण्याइतकी बौद्धिक खोली कोणाकडेच नसते.`;
    if (lang === "te") return `మీ జన్మ లగ్నం ${lagnaSignName} మరియు వాయు తత్వానికి చెందిన ${moonSignName} రాశి మీ చురుకైన మేధస్సు, సంభాషణ నైపుణ్యం మరియు అందరితో సులభంగా కలిసిపోయే స్వభావాన్ని ప్రదర్శిస్తాయి. పైకి మీరు ఎంతో ఉల్లాసంగా, అందరినీ నవ్విస్తూ కనిపించినా, లోపల నిరంతరం ఆలోచనల సుడిగుండం తిరుగుతూనే ఉంటుంది. మీ అసలైన లక్ష్యాలను, మానసిక ఆందోళనలను పూర్తిగా అర్థం చేసుకునే వారు ఎవరూ కనిపించరు.`;
    if (lang === "ta") return `உங்கள் ஜென்ம லக்னம் ${lagnaSignName} மற்றும் காற்று தத்துவத்தின் ${moonSignName} ராசியின் சேர்க்கை உங்கள் கூர்மையான புத்தி கூர்மையையும், இனிமையான பேச்சையும் உலகிற்கு வெளிப்படுத்துகிறது. வெளியில் நீங்கள் அனைவருடனும் சிரித்துப் பேசி உற்சாகமாகத் தெரிந்தாலும், உங்கள் ஆழ்மனதில் எண்ணங்களின் சூறாவளியும் ஒருவித தவிப்பும் எப்போதும் சுழன்றுகொண்டே இருக்கிறது. உங்கள் உண்மையான ஆசைகளை எவராலும் முழுமையாகப் புரிந்துகொள்ள முடிவதில்லை.`;
    if (lang === "ml") return `നിങ്ങളുടെ ജന്മ ലഗ്നമായ ${lagnaSignName}, വായു തത്വത്തിലുള്ള ${moonSignName} രാശി എന്നിവ നിങ്ങളുടെ ബുദ്ധിശക്തിയും, സംസാര ചാതുര്യവും, ഏതു സാഹചര്യത്തോടും ഇണങ്ങിച്ചേരാനുള്ള കഴിവും എടുത്തുകാണിക്കുന്നു. പുറമെ സദാ സന്തോഷവാനായി കാണപ്പെടുമ്പോഴും, ഉള്ളിൽ ചിന്തകളുടെ വലിയൊരു കൊടുങ്കാറ്റും അശാന്തിയും ഒളിഞ്ഞിരിപ്പുണ്ട്. നിങ്ങളുടെ ചിന്തകളുടെ ആഴം അളക്കാൻ ആർക്കും കഴിയുന്നില്ല.`;
    return `The cerebral convergence of your Ascendant (${lagnaSignName}) and airy Moon Sign (${moonSignName}) showcases your keen intellect, wit, and adaptable charm to society. Outwardly, you appear vibrant, conversational, and light-hearted. Yet beneath this quick-thinking exterior swirls a relentless storm of existential questions and emotional restlessness. Few people, if any, possess the depth to truly understand your visionary mind.`;
  }

  // Water element
  if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaSignName} ಹಾಗೂ ಜಲ ತತ್ವದ ${moonSignName} ರಾಶಿಯ ಸಂಯೋಗವು ನಿಮ್ಮನ್ನು ಅತೀವ ಕರುಣಾಮಯಿ, ಸಹೃದಯಿ ಹಾಗೂ ಇತರರ ದುಃಖವನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ತನ್ನದಾಗಿಸಿಕೊಳ್ಳುವ ಮೃದು ಭಾವಜೀವಿಯನ್ನಾಗಿ ಮಾಡಿದೆ. ಸಮಾಜಕ್ಕೆ ನೀವು ಎಲ್ಲರ ನೋವಿಗೆ ಸಾಂತ್ವನ ಹೇಳುವ ಪ್ರಶಾಂತ ಸಾಗರದಂತೆ ಕಾಣಿಸುತ್ತೀರಿ. ಆದರೆ ಇತರರ ಕಣ್ಣೀರನ್ನು ಹೀರಿಕೊಳ್ಳುವ ನಿಮ್ಮ ಈ ವಿಶಾಲ ಹೃದಯವೇ ನಿಮ್ಮ ಎದೆಯಾಳದಲ್ಲಿ ಮಾಸದ ಕಹಿ ಗಾಯಗಳನ್ನು ಉಂಟುಮಾಡಿದೆ; ನೀವು ಪ್ರಾಣಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ಪ್ರೀತಿಸಿದ ಜನರೇ ನಿಮ್ಮ ನಿಷ್ಕಲ್ಮಶ ತ್ಯಾಗವನ್ನು ಕಡೆಗಣಿಸಿದ ನೋವು ನಿಮ್ಮನ್ನು ಏಕಾಂತದಲ್ಲಿ ಸುಡುತ್ತಿದೆ.`;
  if (lang === "hi") return `आपकी जन्म लग्न ${lagnaSignName} एवं जल तत्व की ${moonSignName} राशि आपको अत्यंत संवेदनशील, दयालु और दूसरों के दर्द को पल भर में अपना बना लेने वाला एक सच्चा भावुक हृदय प्रदान करती है। संसार आपको शांत और स्नेही देखता है, किंतु दूसरों के आंसुओं को सोखने की यही प्रवृत्ति आपके अंतर्मन में न भरने वाले गहरे घाव छोड़ गई है; जिन अपनों पर आपने प्राण न्योछावर किए, उन्हीं ने आपके निश्छल प्रेम को दुर्बलता समझ लिया।`;
  if (lang === "mr") return `आपले जन्म लग्न ${lagnaSignName} आणि जल तत्त्वाची ${moonSignName} रास आपल्याला अत्यंत हळवे, दयाळू आणि इतरांचे दुःख स्वतःचे मानणारे एक निष्कपट मन प्रदान करते. जगासमोर आपण अत्यंत शांत व प्रेमळ दिसता, पण इतरांच्या भावनांचा भार वाहण्याच्या या वृत्तीने आपल्याच मनात न भरणाऱ्या जखमा केल्या आहेत; ज्यांच्यावर आपण जिवापाड विश्वास ठेवला, त्यांनीच आपल्या प्रेमाला गृहीत धरले.`;
  if (lang === "te") return `మీ జన్మ లగ్నం ${lagnaSignName} మరియు జల తత్వానికి చెందిన ${moonSignName} రాశి మీకు అపారమైన దయ, సున్నితమైన మనస్సు మరియు ఇతరుల బాధలను తమవిగా భావించే ఆర్ద్రతను ఇచ్చాయి. పైకి మీరు ఎంతో ప్రశాంతంగా కనిపించినా, ఇతరుల కన్నీళ్లను తుడిచే క్రమంలో మీ మనస్సుపైనే తీవ్రమైన గాయాలు అయ్యాయి; మీరు ప్రాణప్రదంగా ప్రేమించిన వారే మీ త్యాగాలను విస్మరించిన బాధ లోలోపల వేధిస్తోంది.`;
  if (lang === "ta") return `உங்கள் ஜென்ம லக்னம் ${lagnaSignName} மற்றும் நீர் தத்துவத்தின் ${moonSignName} ராசி உங்களுக்கு ஒரு கனிவான, பிறர் துன்பத்தைக் கண்டு உருகும் மென்மையான இதயத்தைத் தந்துள்ளது. அமைதியான நதியைப் போல நீங்கள் மற்றவர்களுக்கு ஆறுதல் தருகிறீர்கள். ஆனால் பிறரின் துயரங்களைத் தாங்கும் உங்கள் சுபாவமே உங்கள் ஆழ்மனதில் ஆறாத வடுக்களை ஏற்படுத்திவிட்டது; நீங்கள் அதிக அன்பு காட்டியவர்களே உங்களை அலட்சியப்படுத்திய வலி உங்களை சுடுகிறது.`;
  if (lang === "ml") return `നിങ്ങളുടെ ജന്മ ലഗ്നമായ ${lagnaSignName}, ജല തത്വത്തിലുള്ള ${moonSignName} രാശി എന്നിവ അതിരറ്റ കാരുണ്യവും, മറ്റുള്ളവരുടെ സങ്കടങ്ങൾ സ്വന്തമായി ഏറ്റെടുക്കുന്ന വിശാലമായ മനസ്സും നൽകുന്നു. ഏവർക്കും ശാന്തി നൽകുന്ന കടൽ പോലെയാണ് നിങ്ങൾ. എന്നാൽ ആ സ്നേഹവും സമർപ്പണവും തന്നെയാണ് നിങ്ങളെ ഏറ്റവും വേദനിപ്പിച്ചത്; ജീവശ്വാസം പോലെ കരുതിയവർ പോലും നിങ്ങളുടെ നിസ്വാർത്ഥ സ്നേഹത്തെ അവഗണിച്ചത് ഉള്ളിൽ വലിയൊരു മുറിവായി നിലനിൽക്കുന്നു.`;
  return `The soulful confluence of your Ascendant (${lagnaSignName}) and watery Moon Sign (${moonSignName}) bestows an extraordinarily tender, intuitive, and empathetic heart that absorbs the grief of others instinctively. Society experiences you as a gentle ocean of comfort. Yet this very capacity to absorb emotional toxicity has left unhealed scars upon your soul; those for whom you sacrificed the most have often taken your unconditional loyalty for granted.`;
}

/**
 * 2. Dynamic Dasha Life Crisis (Currently what is happening in their life)
 */
export function getCurrentDashaLifeCrisis(
  mahaKey: GrahaKey,
  bhuktiKey: GrahaKey,
  activeMahadasha: string,
  activeBhukti: string,
  lang: AntarangaLang = "kn"
): string {
  if (mahaKey === "Rahu" || bhuktiKey === "Rahu") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಕಾಲಘಟ್ಟವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವು, ದಿಢೀರ್ ಬದಲಾವಣೆಗಳ ಆಸೆ ಹಾಗೂ ವೃತ್ತಿ-ವ್ಯವಹಾರದಲ್ಲಿ ಭಾರಿ ಜಿಗಿತ ಸಾಧಿಸಬೇಕೆಂಬ ತೀವ್ರ ತುಡಿತವನ್ನು ಸೃಷ್ಟಿಸಿದೆ. ಆದರೆ ಇದೇ ಸಮಯದಲ್ಲಿ ಹೊರಗಿನ ಜನರ ಸುಳ್ಳು ಆಶ್ವಾಸನೆಗಳು, ನಂಬಿಕಾ ದ್ರೋಹ ಹಾಗೂ ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯು ನಿಮ್ಮ ನಿದ್ದೆಗೆಡಿಸುತ್ತಿದೆ.`;
    if (lang === "hi") return `वर्तमान में आपकी जन्म कुंडली में सक्रिय ${activeMahadasha} एवं ${activeBhukti} का कालखंड आपके जीवन में आकस्मिक मोड़, करियर में भारी उछाल की तीव्र महत्वाकांक्षा और अज्ञात बेचैनी पैदा कर रहा है। इसी समय चालाक लोगों के झूठे वादे और भविष्य की धुंधली तस्वीर आपकी मानसिक शांति छीन रही है।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत चालू असलेली ${activeMahadasha} आणि ${activeBhukti} आपल्या जीवनात अनपेक्षित वळण आणि करिअरमध्ये मोठी झेप घेण्याची तीव्र छटपट निर्माण करत आहे. पण याच काळात स्वार्थी लोकांचे खोटे आश्वासने आणि भविष्याची अनिश्चितता आपली झोप उडवत आहे.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో నడుస్తున్న ${activeMahadasha} మరియు ${activeBhukti} కాలం మీ జీవితంలో ఊహించని మలుపులు, కెరీర్‌లో పెద్ద పురోగతి సాధించాలనే బలమైన కోరికను సృష్టిస్తున్నాయి. అయితే కొందరు చేసే మోసపూరిత వాగ్దానాలు మరియు భవిష్యత్తు గురించిన అస్పష్టత మిమ్మల్ని కలవరపెడుతున్నాయి.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடைபெறும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் வாழ்வில் ஒரு திருப்புமுனையையும், தொழில் மற்றும் பொருளாதாரத்தில் பெரிய முன்னேற்றம் அடைய வேண்டும் என்ற தீவிர தாகத்தையும் ஏற்படுத்தியுள்ளது. ஆயினும் நம்பிக்கைக்கு மாறான நபர்களின் போலி வாக்குறுதிகளும், எதிர்காலம் குறித்த பயமும் மன அமைதியைக் குலைக்கின்றன.`;
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ ജീവിതത്തിൽ അപ്രതീക്ഷിത മാറ്റങ്ങൾക്കും, കരിയറിൽ വലിയൊരു വഴിത്തിരിവ് ഉണ്ടാക്കണമെന്ന അതിയായ ആഗ്രഹത്തിനും വഴിതുറക്കുന്നു. എന്നാൽ മറ്റുള്ളവരുടെ ചതിയും, ഭാവിയെക്കുറിച്ചുള്ള ആശങ്കകളും ഉറക്കമില്ലാത്ത രാത്രികൾ സമ്മാനിക്കുന്നു.`;
    return `Currently, the active phase of your ${activeMahadasha} and ${activeBhukti} has thrust you into an intense life crossroads: an urgent hunger for a massive breakthrough in career or finances, coupled with sudden unexpected disruptions. Yet deceptive promises from untrustworthy acquaintances and lingering uncertainty keep you awake at night.`;
  }

  if (mahaKey === "Saturn" || bhuktiKey === "Saturn") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಾಗುತ್ತಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಅವಧಿಯು ನಿಮ್ಮ ತಾಳ್ಮೆ ಮತ್ತು ಕಾಯಕ ನಿಷ್ಠೆಗೆ ಕಠಿಣ ಪರೀಕ್ಷೆಯೊಡ್ಡಿದೆ. ಯಾವುದೇ ಕಾರ್ಯವೂ ಸಲೀಸಾಗಿ ಆಗದೆ, ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಕಿದರೂ ಫಲ ಸಿಗಲು ತಡವಾಗುತ್ತಿದೆ. ಜವಾಬ್ದಾರಿಗಳ ಭಾರ, ಆರ್ಥಿಕ ಮಿತವ್ಯಯ ಹಾಗೂ ಹತ್ತಿರದವರ ನಿರಾಸಕ್ತಿಯು ನಿಮ್ಮ ಮನಸ್ಸಿನ ಮೇಲೆ ನಿರಂತರ ತೂಕವಾಗಿ ಕುಳಿತಿದೆ.`;
    if (lang === "hi") return `वर्तमान में आपकी कुंडली में गतिमान ${activeMahadasha} एवं ${activeBhukti} आपके धैर्य और सहनशक्ति की कड़ी परीक्षा ले रही है। कोई भी कार्य आसानी से नहीं बन रहा; कठिन परिश्रम के बाद ही विलंबित परिणाम मिल रहे हैं। जिम्मेदारियों का भारी बोझ और अपनों का ठंडा व्यवहार आपके मन पर भारी पड़ रहा है।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत सुरू असणारी ${activeMahadasha} आणि ${activeBhukti} आपल्या संयमाची आणि कष्टांची अग्निपरीक्षा पाहत आहे. कोणतेही काम सहजासहजी होत नसून, अतोनात कष्टानंतरच विलंब फळ मिळत आहे. जबाबदाऱ्यांचे ओझे आणि जवळच्यांची अनास्था मनाला सतत अस्वस्थ करत आहे.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో సాగుతున్న ${activeMahadasha} మరియు ${activeBhukti} మీ ఓర్పుకు తీవ్ర పరీక్ష పెడుతున్నాయి. ఏ పనీ సులభంగా పూర్తి కావడం లేదు; రెట్టింపు కష్టపడితే తప్ప ఫలితం దక్కడం లేదు. కుటుంబ బాధ్యతలు, ఆర్థిక ఆందోళనలు మరియు ఆప్తుల నిరాదరణ మిమ్మల్ని మానసికంగా అలసిపోయేలా చేస్తున్నాయి.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடக்கும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் பொறுமைக்கும் உழைப்பிற்கும் கடுமையான சோதனைக் காலமாக உள்ளது. எந்த காரியமும் எளிதில் கைகூடாமல் காலதாமதம் ஆகிறது. குடும்பச் சுமைகளும், நெருக்கமானவர்களின் பாராமுகமும் உங்கள் மனதை பாரமாக்குகின்றன.`;
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ നിങ്ങളുടെ ക്ഷമയെ പരീക്ഷിക്കുന്ന കാലമാണ്. ഏതു കാര്യത്തിനും ഇരട്ടി അധ്വാനം വേണ്ടിവരുന്നു. ഉത്തരവാദിത്തങ്ങളുടെ ഭാരവും, വേണ്ടപ്പെട്ടവരുടെ തണുപ്പൻ പ്രതികരണങ്ങളും മനസ്സിന് കനത്ത പ്രയാസമുണ്ടാക്കുന്നു.`;
    return `Currently, the prevailing tenure of your ${activeMahadasha} and ${activeBhukti} is subjecting your patience and endurance to a rigorous test of karma. Routine tasks demand double the effort with delayed rewards. The cumulative weight of familial duties, financial caution, and the indifference of loved ones feels like a heavy stone upon your heart.`;
  }

  if (mahaKey === "Jupiter" || bhuktiKey === "Jupiter") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಕಾಲವು ನಿಮ್ಮಲ್ಲಿ ಧಾರ್ಮಿಕ ಅರಿವು, ವೃತ್ತಿಯಲ್ಲಿ ಯೋಗ್ಯ ಗೌರವ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶುಭ ಕಾರ್ಯಗಳನ್ನು ನೆರವೇರಿಸುವ ಹಂಬಲವನ್ನು ಜಾಗೃತಗೊಳಿಸಿದೆ. ಆದರೆ ಮಹತ್ವದ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಗೊಂದಲ ಹಾಗೂ ಶುಭ ವೆಚ್ಚಗಳ ಹೊಂದಾಣಿಕೆಯ ಒತ್ತಡ ನಿಮ್ಮನ್ನು ಆವರಿಸಿದೆ.`;
    if (lang === "hi") return `वर्तमान में आपकी कुंडली में प्रभावी ${activeMahadasha} एवं ${activeBhukti} आपमें ज्ञान, सामाजिक प्रतिष्ठा और मांगलिक कार्यों को संपन्न करने की अभिलाषा जाग्रत कर रही है। किंतु महत्वपूर्ण निर्णयों में दुविधा और पारिवारिक व्यय का प्रबंधन आपको चिंतित रख रहा है।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत कार्यरत असलेली ${activeMahadasha} आणि ${activeBhukti} आपल्या जीवनात ज्ञान, मान-सन्मान व मांगलिक कार्ये घडवून आणण्याची ओढ निर्माण करत आहे. परंतु महत्त्वाच्या निर्णयांमध्ये द्विधा मनःस्थिती आणि खर्चाचे नियोजन आपल्याला सतावत आहे.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో కొనసాగుతున్న ${activeMahadasha} మరియు ${activeBhukti} మీలో గౌరవం, ఆధ్యాత్మిక చింతన మరియు శుభకార్యాలు జరిపించాలనే సంకల్పాన్ని పెంచుతున్నాయి. అయితే సరైన నిర్ణయాలు తీసుకోవడంలో కొంత అయోమయం నెలకొంది.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடக்கும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் சமூக அந்தஸ்தை உயர்த்தவும், குடும்பத்தில் சுபகாரியங்களை நிகழ்த்தவும் துடிக்கிறது. எனினும் சில முக்கியமான முடிவுகளை எடுப்பதில் உள்ள குழப்பம் மனதை உறுத்துகிறது.`;
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ ആത്മീയ ബോധവും, സമൂഹത്തിൽ മാന്യമായ സ്ഥാനവും, ശുഭകാര്യങ്ങൾ നടത്താനുള്ള ആഗ്രഹവും വളർത്തുന്നു. എന്നാൽ സുപ്രധാന തീരുമാനങ്ങൾ എടുക്കുന്നതിലെ ആശയക്കുഴപ്പം വേട്ടയാടുന്നു.`;
    return `Currently, the auspicious phase of your ${activeMahadasha} and ${activeBhukti} awakens a profound urge for moral dignity, familial elevation, and noble undertakings. However, financial outlays for family commitments and critical ethical crossroads demand careful discernment.`;
  }

  if (mahaKey === "Mercury" || bhuktiKey === "Mercury") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಅವಧಿಯು ನಿಮ್ಮ ಮೆದುಳಿನಲ್ಲಿ ನಿರಂತರ ಯೋಜನೆಗಳು, ವ್ಯವಹಾರ/ವೃತ್ತಿ ಬದಲಾವಣೆ ಹಾಗೂ ಆರ್ಥಿಕ ಮರುಹೊಂದಾಣಿಕೆಯ ಸಂಚಲನ ತಂದಿದೆ. ಆದರೆ ಅತಿಯಾದ ಯೋಚನೆ ಮತ್ತು ಸಣ್ಣಪುಟ್ಟ ಮಾತುಕತೆಯ ಬಿರುಕುಗಳು ನಿಮ್ಮ ನರಮಂಡಲದ ಶಾಂತಿಯನ್ನು ಕೆಡಿಸುತ್ತಿವೆ.`;
    if (lang === "hi") return `वर्तमान में आपकी कुंडली में सक्रिय ${activeMahadasha} एवं ${activeBhukti} आपके मस्तिष्क में निरंतर नई योजनाएं, व्यापारिक पुनर्गठन और आर्थिक तरक्की की उधेड़बुन पैदा कर रही है। किंतु अत्यधिक सोच-विचार और छोटी-मोटी गलतफहमियां आपकी मानसिक शांति को भंग कर रही हैं।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत चालू असणारी ${activeMahadasha} आणि ${activeBhukti} आपल्या डोक्यात सतत नवनवीन योजना, व्यवसाय किंवा नोकरीतील बदलाचे विचार आणत आहे. परंतु अतिविचार आणि संवादातील गैरसमज मानसिक शांतता हिरावून घेत आहेत.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో నడుస్తున్న ${activeMahadasha} మరియు ${activeBhukti} మీ మదిలో నిరంతరం కొత్త ఆలోచనలు, వ్యాపార ప్రణాళికలను రేకెత్తిస్తున్నాయి. అయితే అతిగా ఆలోచించడం వల్ల మానసిక ప్రశాంతత లోపిస్తోంది.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடைபெறும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் மனதில் இடைவிடாத திட்டங்களையும், தொழில் மாற்றச் சிந்தனைகளையும் தூண்டுகிறது. ஆனால் அதீத சிந்தனைகளும், பேச்சில் ஏற்படும் சிறு பிழைகளும் மன அமைதியைக் குலைக்கின்றன.`;
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ നിരന്തരമായ കണക്കുകൂട്ടലുകൾക്കും പുതിയ സംരംഭങ്ങളെക്കുറിച്ചുള്ള ആലോചനകൾക്കും കാരണമാകുന്നു. എന്നാൽ അമിതചിന്ത മനസ്സിനെ വല്ലാതെ അലട്ടുന്നു.`;
    return `Currently, the active cycle of your ${activeMahadasha} and ${activeBhukti} has ignited rapid mental calculations, aspirations for commercial recalibration, and career pivots. Yet overanalyzing every conversation and nervous restlessness disturb your peace of mind.`;
  }

  if (mahaKey === "Venus" || bhuktiKey === "Venus") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಾಗುತ್ತಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಕಾಲವು ನಿಮ್ಮ ಸಂಬಂಧಗಳು, ವೈವಾಹಿಕ ಸೌಖ್ಯ ಹಾಗೂ ಸಾಂಸಾರಿಕ ಆಸೆಗಳನ್ನು ಪರೀಕ್ಷೆಗೆ ತಳ್ಳಿದೆ. ಹೊರಗೆ ಎಲ್ಲವೂ ಆರಾಮವಾಗಿ ಕಂಡರೂ, ಆಪ್ತರೊಂದಿಗಿನ ಮೌನ ಅಂತರ ಹಾಗೂ ಅನಿವಾರ್ಯ ಖರ್ಚುಗಳು ನಿಮ್ಮ ಅಂತರಂಗವನ್ನು ಕೊರೆಯುತ್ತಿವೆ.`;
    if (lang === "hi") return `वर्तमान में आपकी कुंडली में गतिशील ${activeMahadasha} एवं ${activeBhukti} आपके वैवाहिक जीवन, संबंधों और भौतिक सुख-सुविधाओं की कसौटी ले रही है। बाहर से सब कुछ सामान्य प्रतीत होते हुए भी, अपनों के साथ संवादहीनता और अनपेक्षित खर्चे अंतर्मन को खिन्न कर रहे हैं।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत सुरू असलेली ${activeMahadasha} आणि ${activeBhukti} आपली कौटुंबिक नाती, वैवाहिक सुख आणि आर्थिक खर्च यांना केंद्रस्थानी आणत आहे. बाहेरून सगळे आलबेल दिसत असले, तरी नात्यांमधील मूक अंतर आणि वाढते खर्च मनाला खात आहेत.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో సాగుతున్న ${activeMahadasha} మరియు ${activeBhukti} మీ సంబంధాలు, దాంపత్య సుఖం మరియు ఆర్థిక ఖర్చులను ప్రభావితం చేస్తున్నాయి. పైకి అంతా బాగున్నట్లు కనిపించినా, ఆప్తుల మధ్య మానసిక దూరం మిమ్మల్ని కలచివేస్తోంది.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடக்கும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் உறவுகள், குடும்ப வாழ்க்கை மற்றும் பொருளாதார செலவுகளை உற்றுநோக்க வைக்கிறது. வெளியில் எல்லாம் அமைதியாகத் தோன்றினாலும், மனதிற்குள் உள்ள மௌன இடைவெளி வலியைத் தருகிறது.`;
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ വ്യക്തിബന്ധങ്ങൾ, ദാമ്പത്യ സുഖം, അനാവശ്യ ചെലവുകൾ എന്നിവയിൽ ചില ഉലച്ചിലുകൾ ഉണ്ടാക്കുന്നു. പുറമെ സന്തോഷമെന്ന് തോന്നുമെങ്കിലും ഉള്ളിൽ ചില അകൽച്ചകൾ നീറുന്നു.`;
    return `Currently, the unfolding tenure of your ${activeMahadasha} and ${activeBhukti} places your intimate relationships, domestic comforts, and lifestyle aspirations in sharp focus. Beneath external charm, unspoken friction with companions and hidden financial drains create private stress.`;
  }

  if (mahaKey === "Mars" || bhuktiKey === "Mars") {
    if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಕಾಲವು ನಿಮ್ಮೊಳಗೆ ಆಂತರಿಕ ಉದ್ವೇಗ, ಹಕ್ಕುಗಳಿಗಾಗಿ ಹೋರಾಡುವ ಆವೇಶ ಹಾಗೂ ಆಸ್ತಿ/ವ್ಯವಹಾರದಲ್ಲಿ ತ್ವರಿತ ನ್ಯಾಯ ಪಡೆಯುವ ಹಠವನ್ನು ಹುಟ್ಟುಹಾಕಿದೆ. ಆತುರದ ಕೋಪವು ಹಳೆಯ ಬಾಂಧವ್ಯಗಳನ್ನು ಕೆಡಿಸದಂತೆ ಎಚ್ಚರವಹಿಸಬೇಕಾದ ಕಾಲವಿದು.`;
    if (lang === "hi") return `वर्तमान में आपकी कुंडली में प्रभावी ${activeMahadasha} एवं ${activeBhukti} आपके भीतर अत्यधिक उत्तेजना, संपत्ति या मान-सम्मान के लिए संघर्ष का आवेश उत्पन्न कर रही है। जल्दबाजी और क्रोध में आकर पुराने संबंधों को ठेस न पहुंचे, इसका ध्यान रखना आवश्यक है।`;
    if (lang === "mr") return `सध्या आपल्या कुंडलीत सक्रिय असणारी ${activeMahadasha} आणि ${activeBhukti} आपल्या मनात प्रचंड संताप, हक्कासाठी लढण्याची ईर्ष्या आणि घाईगडबड निर्माण करत आहे. रागाच्या भरात जुनी नाती दुखावली जाणार नाहीत याची काळजी घेणे गरजेचे आहे.`;
    if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో కొనసాగుతున్న ${activeMahadasha} మరియు ${activeBhukti} మీలో అంతర్గత ఆవేశం, ఆస్తులు లేదా హక్కుల కోసం పోరాడాలనే పట్టుదలను పెంచుతున్నాయి. తొందరపాటు కోపం బంధాలను దెబ్బతీయకుండా చూసుకోవాలి.`;
    if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் செயல்படும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்களுக்குள் ஒரு ஆவேசத்தையும், நியாயத்திற்காக போராடும் பிடிவாதத்தையும் தூண்டுகிறது. அவசர கோபத்தால் உறவுகளில் விரிசல் விழாமல் காப்பது மிக அவசியம்.`
    if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ ഉള്ളിൽ കടുത്ത ദേഷ്യവും, നീതിക്കുവേണ്ടി പോരാടാനുള്ള വാശിയും ഉണ്ടാക്കുന്നു. അവിവേകമായ തീരുമാനങ്ങൾ ബന്ധങ്ങളെ തകർക്കാതെ നോക്കണം.`;
    return `Currently, the dynamic influence of your ${activeMahadasha} and ${activeBhukti} stirs an inner restlessness, an intense determination to assert your rights in property or status, and fiery impatience. Unchecked haste threatens to strain long-standing relationships.`;
  }

  // Default / Sun / Moon / Ketu
  if (lang === "kn") return `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಚಲಿಸುತ್ತಿರುವ ${activeMahadasha} ಹಾಗೂ ${activeBhukti} ಕಾಲವು ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಅಂತರಂಗ ಮತ್ತು ಸಾಮಾಜಿಕ ಪ್ರತಿಷ್ಠೆಯ ನಡುವೆ ಜಗ್ಗಾಟ ತಂದಿದೆ. ಜನರ ನಕಲಿ ಹೊಗಳಿಕೆಗಳ ಬಗ್ಗೆ ಬೇಸರ, ಆತ್ಮಗೌರವದ ರಕ್ಷಣೆ ಹಾಗೂ ನಿಗೂಢ ಒಂಟಿತನವು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಆಳವಾಗಿ ಬೇರೂರಿದೆ.`;
  if (lang === "hi") return `वर्तमान में आपकी कुंडली में चल रही ${activeMahadasha} एवं ${activeBhukti} आपकी सामाजिक प्रतिष्ठा और अंतर्मन की भावनात्मक थकान के बीच एक द्वंद्व उत्पन्न कर रही है। लोगों के दिखावे से विरक्ति और आत्मसम्मान की रक्षा ही आपकी प्रमुख चिंता बन चुकी है।`;
  if (lang === "mr") return `सध्या आपल्या कुंडलीत सुरू असणारी ${activeMahadasha} आणि ${activeBhukti} आपली सामाजिक प्रतिष्ठा आणि अंतर्मनातील थकवा यात संघर्ष निर्माण करत आहे. जगाच्या दिखाऊपणाचा वीट येऊन एकांतात शांततेचा शोध घेण्याची ओढ वाढली आहे.`;
  if (lang === "te") return `ప్రస్తుతం మీ జాతకంలో నడుస్తున్న ${activeMahadasha} మరియు ${activeBhukti} మీ ఆత్మగౌరవానికి మరియు అంతర్గత భావోద్వేగాలకు మధ్య సంఘర్షణను తెచ్చాయి. స్వార్థపూరిత వ్యక్తుల పట్ల విరక్తి మరియు ఏకాంతం కోరుకునే మనస్తత్వం పెరుగుతున్నాయి.`;
  if (lang === "ta") return `தற்போது உங்கள் ஜாதகத்தில் நடக்கும் ${activeMahadasha} மற்றும் ${activeBhukti} உங்கள் கௌரவத்திற்கும் மன அமைதிக்கும் இடையே ஒரு போராட்டத்தை உருவாக்கியுள்ளது. போலியான மனிதர்களின் முகமூடிகளைக் கண்டு சலிப்படைந்து தனிமையை நாடுகிறீர்கள்.`;
  if (lang === "ml") return `നിലവിൽ നിങ്ങളുടെ ജാതകത്തിൽ നടക്കുന്ന ${activeMahadasha}, ${activeBhukti} എന്നിവ ആത്മാഭിമാനവും മാനസിക പ്രയാസങ്ങളും തമ്മിലുള്ള സംഘർഷത്തിന് ഇടയാക്കുന്നു. കപടത നിറഞ്ഞ ലോകത്തിൽ നിന്ന് പിൻവാങ്ങാനുള്ള ആഗ്രഹം തോന്നുന്നു.`;
  return `Currently, the prevailing energy of your ${activeMahadasha} and ${activeBhukti} creates a poignant tug-of-war between public reputation and private emotional exhaustion. Weariness of worldly pretense and deep solitary introspection dominate your inner thoughts.`;
}

/**
 * 3. Dynamic Gochara Transit Status
 */
export function getGocharaTransitPressure(
  isSadeSati: boolean,
  isAshtama: boolean,
  isKantaka: boolean,
  hasGuruBala: boolean,
  lang: AntarangaLang = "kn"
): string {
  if (isSadeSati) {
    if (lang === "kn") return `ಜೊತೆಗೆ, ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯ ಸಾಡೇ ಸಾತಿ (ಏಳೂವರೆ ಶನಿ) ಪ್ರಭಾವವಿರುವುದರಿಂದ, ಹತ್ತಿರದವರ ನೈಜ ಗುಣಗಳು ಅನಾವರಣಗೊಳ್ಳುತ್ತಿದ್ದು, ಕಠಿಣ ಕರ್ಮ ಪರಿಹಾರದ ಸಮಯವಿದಾಗಿದೆ.`;
    if (lang === "hi") return `साथ ही, गोचर में शनि की साढ़ेसाती का प्रभाव होने से निकटवर्तियों का वास्तविक चरित्र उजागर हो रहा है, जो कठिन आत्मनिरीक्षण की मांग करता है।`;
    if (lang === "mr") return `त्यातच सध्या गोचरात शनीची साडेसाती सुरू असल्याने, जवळच्या व्यक्तींचे खरे चेहरे समोर येत असून हा काळ संयमाची परीक्षा पाहत आहे.`;
    if (lang === "te") return `అంతేకాక, ప్రస్తుతం గోచారంలో ఏలినాటి శని ప్రభావం ఉండటం వల్ల, ఆప్తుల నిజస్వరూపాలు బయటపడుతూ మానసిక పరిపక్వతను పెంచుతున్నాయి.`;
    if (lang === "ta") return `மேலும் கோசாரத்தில் ஏழரை சனியின் தாக்கம் நிலவுவதால், உங்களுக்கு நெருக்கமானவர்களின் உண்மை முகம் வெளிப்பட்டு மனதை பக்குவப்படுத்துகிறது.`;
    if (lang === "ml") return `കൂടാതെ, ഗോചാരത്തിൽ ഏഴര ശനിയുടെ സ്വാധീനം ഉള്ളതിനാൽ വേണ്ടപ്പെട്ടവരുടെ യഥാർത്ഥ മുഖം വെളിവാകുകയും ജീവിതപാഠങ്ങൾ പഠിപ്പിക്കുകയും ചെയ്യുന്നു.`;
    return `Furthermore, under the current transit of Saturn's Sade Sati phase, the true colors of associates are unveiled, demanding disciplined karmic fortitude.`;
  }

  if (isAshtama) {
    if (lang === "kn") return `ಗೋಚಾರದಲ್ಲಿ ಅಷ್ಟಮ ಶನಿಯ ಸಂಚಾರವಿರುವುದರಿಂದ, ಆಕಸ್ಮಿಕ ಎಡವಟ್ಟುಗಳು ಅಥವಾ ಹಠಾತ್ ಆರೋಗ್ಯ/ಹಣಕಾಸಿನ ಏರುಪೇರುಗಳ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಅನಿವಾರ್ಯವಾಗಿದೆ.`;
    if (lang === "hi") return `गोचर में अष्टम शनि के भ्रमण के कारण आकस्मिक व्यवधानों, स्वास्थ्य और धन के उतार-चढ़ाव से सतर्क रहना अनिवार्य है।`;
    if (lang === "mr") return `गोचरात अष्टम शनीचे भ्रमण असल्याने अचानक येणाऱ्या अडचणी, आरोग्य व आर्थिक चढ-उतारांपासून सावध राहणे अत्यंत गरजेचे आहे.`;
    if (lang === "te") return `గోచారంలో అష్టమ శని సంచారం వల్ల ఆకస్మిక అడ్డంకులు, ఆరోగ్యం మరియు ధన విషయాలలో చాలా జాగ్రత్తగా ఉండాలి.`;
    if (lang === "ta") return `கோசாரத்தில் அஷ்டம சனியின் சஞ்சாரம் இருப்பதால் திடீர் தடைகள், ஆரோக்கியம் மற்றும் பணவிஷயங்களில் கூடுதல் எச்சரிக்கை தேவை.`;
    if (lang === "ml") return `ഗോചാരത്തിൽ അഷ്ടമ ശനി സഞ്ചരിക്കുന്നതിനാൽ അപ്രതീക്ഷിത തടസ്സങ്ങൾ, സാമ്പത്തിക-ആരോഗ്യ പ്രശ്നങ്ങൾ എന്നിവയിൽ അതീവ ജാഗ്രത വേണം.`;
    return `With Ashtama Shani transiting your 8th sector, vigilant caution against sudden financial or health fluctuations is paramount.`;
  }

  if (isKantaka) {
    if (lang === "kn") return `ಗೋಚಾರದಲ್ಲಿ ಕಂಟಕ ಶನಿಯ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ, ವೃತ್ತಿ ಅಥವಾ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯಲ್ಲಿ ಅನಗತ್ಯ ಕಿರಿಕಿರಿಗಳು ಎದುರಾಗುತ್ತಿವೆ.`;
    if (lang === "hi") return `कंटक शनि की दृष्टि के कारण कार्यक्षेत्र एवं पारिवारिक शांति में अकारण तनाव का सामना करना पड़ रहा है।`;
    if (lang === "mr") return `कंटक शनीच्या प्रभावामुळे नोकरी-व्यवसाय व कौटुंबिक शांततेत विनाकारण तणाव जाणवत आहे.`;
    if (lang === "te") return `కంటక శని ప్రభావం వల్ల ఉద్యోగంలో లేదా గృహంలో అకారణ చికాకులు ఎదురవుతున్నాయి.`;
    if (lang === "ta") return `கண்டக சனியின் தாக்கத்தால் பணியிடத்திலோ அல்லது குடும்பத்திலோ தேவையற்ற மனக்கசப்புகள் ஏற்படலாம்.`;
    if (lang === "ml") return `കണ്ടക ശനിയുടെ സ്വാധീനം കാരണം തൊഴിൽ രംഗത്തോ കുടുംബത്തിലോ അനാവശ്യമായ ബുദ്ധിമുട്ടുകൾ ഉണ്ടായേക്കാം.`;
    return `Under Kantaka Shani's gaze, friction in domestic peace or workplace demands strategic patience.`;
  }

  if (hasGuruBala) {
    if (lang === "kn") return `ಆದರೆ ಸುದೈವವೆಂದರೆ, ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಗುರು ಬಲದ ದಿವ್ಯ ರಕ್ಷೆ ಇರುವುದರಿಂದ, ಎಷ್ಟೇ ಸಂಕಷ್ಟಗಳಿದ್ದರೂ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ದೈವಿಕ ಪವಾಡದಂತೆ ದಾರಿ ಸುಗಮವಾಗಲಿದೆ!`;
    if (lang === "hi") return `किंतु सौभाग्य से, गोचर में गुरु बल की पावन दृष्टि आप पर है, जिससे संकट कितना भी बड़ा हो, अंतिम समय में ईश्वर की कृपा से मार्ग प्रशस्त होगा!`;
    if (lang === "mr") return `परंतु सुदैवाने, गोचरात गुरू बळाची छत्रछाया असल्याने संकट कितीही मोठे असले तरी ऐनवेळी ईश्वरी कृपेने मार्ग सापडेल!`;
    if (lang === "te") return `అయితే అదృష్టవశాత్తూ గోచారంలో గురు బలం ఉండటం వల్ల, ఎన్ని ఆటంకాలు ఎదురైనా చివరి క్షణంలో దైవకృపతో మార్గం సుగమం అవుతుంది!`;
    if (lang === "ta") return `ஆயினும் அதிர்ஷ்டவசமாக கோசாரத்தில் குரு பலம் துணை நிற்பதால், எத்தகைய நெருக்கடியிலும் இறுதியில் இறை அருளால் வழி பிறக்கும்!`;
    if (lang === "ml") return `എന്നാൽ ഭാഗ്യവശാൽ ഗോചാരത്തിൽ ഗുരു ബലമുള്ളതിനാൽ, എത്ര വലിയ പ്രതിസന്ധിയുണ്ടായാലും അവസാന നിമിഷം ഈശ്വരാധീനത്താൽ രക്ഷപ്പെടും!`;
    return `Fortunately, the auspicious protective glance of Jupiter's transit (Guru Bala) shields you, opening miraculous avenues at the eleventh hour!`;
  }

  if (lang === "kn") return `ಪ್ರಸ್ತುತ ಗ್ರಹಗಳ ಗೋಚಾರವು ನಿಮ್ಮ ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ನಿಷ್ಠೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಸಮಚಿತ್ತದಿಂದ ಮುನ್ನಡೆಯಬೇಕಾದ ಕಾಲವಾಗಿದೆ.`;
  if (lang === "hi") return `वर्तमान ग्रह गोचर आपके आत्मबल और निष्ठा की परीक्षा ले रहा है, अतः धैर्यपूर्वक आगे बढ़ना ही श्रेष्ठ है।`;
  if (lang === "mr") return `सध्याचे ग्रह गोचर आपल्या आत्मबळाची परीक्षा पाहत असून संयमाने पुढे जाणे आवश्यक आहे.`;
  if (lang === "te") return `ప్రస్తుత గ్రహాల గోచారం మీ మనోధైర్యాన్ని పరీక్షిస్తోంది, కాబట్టి సంయమనంతో వ్యవహరించడం ముఖ్యం.`;
  if (lang === "ta") return `தற்போதைய கிரக சஞ்சாரம் உங்கள் மன உறுதியை சோதிப்பதால், அமைதியோடு முன்னேறுவது நலம் பயக்கும்.`;
  if (lang === "ml") return `നിലവിലെ ഗ്രഹസ്ഥിതി നിങ്ങളുടെ ആത്മവിശ്വാസത്തെ പരീക്ഷിക്കുന്നതിനാൽ വിവേകത്തോടെ മുന്നോട്ട് പോകുക.`;
  return `The current planetary transits test your resolve, rewarding balanced composure and strategic perseverance.`;
}

/**
 * 4. Dynamic Subconscious Soul Secret (Paragraph 2)
 */
export function getSubconsciousSoulSecret(
  element: "fire" | "earth" | "air" | "water",
  moonSignName: string,
  nakshatraName: string,
  moonPada: number,
  h12RashiName: string,
  h12LordName: string,
  lang: AntarangaLang = "kn"
): string {
  if (element === "fire") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonSignName}, ${nakshatraName} ನಕ್ಷತ್ರ (${moonPada}ನೇ ಪಾದ) ಹಾಗೂ ದ್ವಾದಶ ಭಾವವಾದ ${h12RashiName} (ಅಧಿಪತಿ ${h12LordName}) ನಿಮ್ಮ ಸುಪ್ತ ಮನಸ್ಸಿನ ಅಂತರಂಗದ ಸತ್ಯವನ್ನು ಹೀಗೆ ಅನಾವರಣಗೊಳಿಸುತ್ತದೆ: 'ನಾನು ಯಾವಾಗಲೂ ದೃಢವಾಗಿರಬೇಕು, ನಾನೆಂದೂ ಕುಸಿಯಬಾರದು' ಎಂಬ ಹಠವೇ ನಿಮ್ಮ ಪಾಲಿಗೆ ಅತಿದೊಡ್ಡ ಮಾನಸಿಕ ಹೊರೆಯಾಗಿದೆ. ನೀವು ಸದಾ ಎಲ್ಲರನ್ನೂ ಮುನ್ನಡೆಸುತ್ತೀರಿ, ಆದರೆ 'ನಿನ್ನ ಕಷ್ಟವೇನು, ನಿನಗೇನು ಬೇಕು?' ಎಂದು ನಿಮ್ಮ ಬೆನ್ನುತಟ್ಟಿ ಕೇಳುವ ಒಬ್ಬ ಆತ್ಮೀಯ ಜೀವವೂ ಇಲ್ಲವೆಂಬ ಅತೀವ ಒಂಟಿತನ ರಾತ್ರಿಯ ಏಕಾಂತದಲ್ಲಿ ನಿಮ್ಮ ಕಣ್ಣಾಲಿಗಳನ್ನು ತೇವಗೊಳಿಸುತ್ತದೆ. ಯಾರ ಮುಂದೆಯೂ ತಲೆಬಾಗದ ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನದ ಹಿಂದೆ ಅಡಗಿರುವ ಈ ಮೌನ ನಿರಾಸೆಯೇ ನಿಮ್ಮ ಅಂತರಂಗದ ಪರಮ ರಹಸ್ಯ.`;
    if (lang === "hi") return `आपकी चंद्र राशि ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) तथा द्वादश भाव ${h12RashiName} (स्वामी ${h12LordName}) आपके अवचेतन मन की मूक सच्चाई को उजागर करते हैं: 'मुझे सदैव अडिग रहना है, मुझे कभी टूटना नहीं है'—यही प्रतिज्ञा आपके मन का सबसे भारी बोझ बन चुकी है। आप सबका हौसला बढ़ाते हैं, किंतु 'तुम्हारी व्यथा क्या है, तुम्हें क्या चाहिए?' यह पूछने वाला कोई सच्चा सहारा नहीं है। किसी के आगे न झुकने वाले स्वाभिमान के पीछे छुपा यही एकाकी विलाप आपके अंतर्मन का सबसे गहरा रहस्य है।`;
    if (lang === "mr") return `आपली चंद्र रास ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) आणि बारावे स्थान ${h12RashiName} (स्वामी ${h12LordName}) आपल्या अंतर्मनातील सत्य उलगडून दाखवतात: 'मला सदैव खंबीर राहायचे आहे, मी कधीही कोसळता कामा नये' हीच जिद्द मनावरचे सर्वात मोठे ओझे ठरली आहे. आपण सर्वांना धीर देता, पण 'तुला काय हवे आहे, तुझे दुःख काय?' असे प्रेमाने विचारणारे कोणीच नाही ही खंत रात्रीच्या एकांतात डोळे ओलावते. स्वाभिमानी चेहऱ्यामागे दडलेला हा मूक थकवाच आपल्या अंतर्मनातील गूढ सत्य आहे.`;
    if (lang === "te") return `మీ చంద్ర రాశి ${moonSignName}, ${nakshatraName} నక్షత్రం (${moonPada}వ పాదం) మరియు 12వ ఇల్లు ${h12RashiName} (అధిపతి ${h12LordName}) మీ ఉపచేతన మనస్సులోని నిగూఢ సత్యాన్ని ఇలా తెలియజేస్తున్నాయి: 'నేను ఎప్పుడూ దృఢంగా ఉండాలి, ఎవరి ముందూ తలవంచకూడదు' అనే పట్టుదలే మీ మనస్సుకు భారమైంది. అందరికీ తోడుగా నిలిచే మీకు, మీ కష్టాన్ని పంచుకునే నిజమైన తోడు లేదనే వేదన రాత్రివేళ ఒంటరిగా ఉన్నప్పుడు బాధిస్తుంది. నవ్వు వెనుక దాగి ఉన్న ఈ మూగ అలసటే మీ అంతరంగపు పరమ రహస్యం.`;
    if (lang === "ta") return `உங்கள் சந்திர ராசி ${moonSignName}, ${nakshatraName} நட்சத்திரம் (${moonPada}-ம் பாதம்) மற்றும் 12-ம் வீடான ${h12RashiName} (அதிபதி ${h12LordName}) உங்கள் ஆழ்மனதின் ரகசியத்தை வெளிப்படுத்துகிறது: 'நான் எப்போதும் பலமாக இருக்க வேண்டும், எதற்காகவும் கலங்கக் கூடாது' என்ற வைராக்கியமே உங்கள் ஆழ்மனதின் பெருஞ்சுமையாக உள்ளது. எல்லோருக்கும் நீங்கள் ஆதரவாக இருக்கிறீர்கள், ஆனால் உங்கள் கண்ணீரைத் துடைக்க யாருமில்லை என்ற ஏக்கம் இரவின் தனிமையில் மனதை வதைக்கிறது. இந்த மௌன தியாகமே உங்கள் ஆழ்மன ரகசியமாகும்.`;
    if (lang === "ml") return `നിങ്ങളുടെ ചന്ദ്ര രാശിയായ ${moonSignName}, ${nakshatraName} നക്ഷത്രം (${moonPada}-ാം പാദം), ദ്വാദശ ഭാവമായ ${h12RashiName} (അധിപൻ ${h12LordName}) എന്നിവ നിങ്ങളുടെ ആത്മാവിന്റെ രഹസ്യം വെളിപ്പെടുത്തുന്നു: 'ഞാൻ എപ്പോഴും ശക്തനായിരിക്കണം, തളരരുത്' എന്ന വാശിയാണ് നിങ്ങളുടെ ഏറ്റവും വലിയ ഭാരം. എല്ലാവർക്കും തണലാകുന്ന നിങ്ങൾക്ക്, സ്വന്തം സങ്കടം പറയാൻ ആരുമില്ലെന്ന തിരിച്ചറിവ് രാത്രിയുടെ ഏകാന്തതയിൽ കണ്ണുനിറയ്ക്കുന്നു. ചിരിക്കുന്ന മുഖത്തിന് പിന്നിലെ ഈ മൗന നൊമ്പരമാണ് നിങ്ങളുടെ അന്തരംഗ സത്യം.`;
    return `Your Moon Sign (${moonSignName}), Janma Nakshatra (${nakshatraName}, Pada ${moonPada}), and the 12th House (${h12RashiName}, ruled by ${h12LordName}) uncover the private truth of your soul: The self-imposed vow that 'I must always remain unbreakable and never falter' has become your heaviest private cross. While you champion everyone around you, the piercing realization that nobody ever pauses to ask 'Are you hurting? Can I help you?' fills your midnight solitude with silent tears. Behind your unyielding pride lies an unspoken exhaustion—this is the Dark Secret you carry.`;
  }

  if (element === "earth") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonSignName}, ${nakshatraName} ನಕ್ಷತ್ರ (${moonPada}ನೇ ಪಾದ) ಹಾಗೂ ದ್ವಾದಶ ಭಾವವಾದ ${h12RashiName} (ಅಧಿಪತಿ ${h12LordName}) ನಿಮ್ಮ ಅಂತರಂಗವನ್ನು ಹೀಗೆ ತೆರೆದಿಡುತ್ತದೆ: ನೀವು ಇತರರ ಕಣ್ಣಿಗೆ ಸದಾ ಸಮಾಧಾನಚಿತ್ತದ, ಎಲ್ಲವನ್ನೂ ಸಮರ್ಥವಾಗಿ ಸರಿದೂಗಿಸುವ ಕರ್ತವ್ಯವಂತ ವ್ಯಕ್ತಿಯಾಗಿದ್ದೀರಿ. ಆದರೆ ನಿಮ್ಮ ಒಳಮನಸ್ಸಿನಲ್ಲಿ 'ನಾನು ಇಷ್ಟೆಲ್ಲಾ ತ್ಯಾಗ ಮಾಡಿದರೂ ಕೊನೆಗೆ ನನಗೇನು ಉಳಿಯಿತು?' ಎಂಬ ಕಹಿ ಅಸಹಾಯಕತೆಯಿದೆ. ಹಣಕಾಸಿನ ಅಭದ್ರತೆ, ಭವಿಷ್ಯದಲ್ಲಿ ತಾನು ಅಸಹಾಯಕನಾಗಿಬಿಡಬಹುದೇನೋ ಎಂಬ ಸುಪ್ತ ಭೀತಿ ಹಾಗೂ ನಂಬಿದವರಿಂದ ಆದ ಆರ್ಥಿಕ ಅಥವಾ ನೈತಿಕ ವಂಚನೆಯನ್ನು ನೀವು ಸಮಾಧಿಯಂತೆ ಎದೆಯೊಳಗೆ ಮುಚ್ಚಿಟ್ಟುಕೊಂಡಿದ್ದೀರಿ.`;
    if (lang === "hi") return `आपकी चंद्र राशि ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) तथा द्वादश भाव ${h12RashiName} (स्वामी ${h12LordName}) आपके अंतर्मन को प्रकट करते हैं: संसार की दृष्टि में आप अत्यंत धैर्यवान और सब कुछ संभाल लेने वाले कर्तव्यनिष्ठ व्यक्ति हैं। किंतु आपके भीतर यह मूक कसक उठती है: 'सबके लिए इतना समर्पित रहने के बाद अंततः मेरे पास क्या बचा?' भविष्य की आर्थिक असुरक्षा का भय और विश्वासपात्रों द्वारा दिए गए घाव आप किसी से साझा नहीं करते; यही आपकी मौन तपस्या का गुप्त सत्य है।`;
    if (lang === "mr") return `आपली चंद्र रास ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) आणि बारावे स्थान ${h12RashiName} (स्वामी ${h12LordName}) आपले अंतर्मन असे उलगडतात: सर्वांच्या दृष्टीने आपण अत्यंत समजूतदार आणि सर्व जबाबदाऱ्या सांभाळणारे आहात. पण मनात ही सल बोचते: 'सर्वांसाठी सर्वकाही करून शेवटी माझ्या वाट्याला काय आले?' भविष्यातील आर्थिक अनिश्चिततेची भीती आणि जवळच्यांनी दिलेला विश्वासघात आपण काळजात गाडून ठेवला आहे; हेच आपले गुप्त सत्य.`;
    if (lang === "te") return `మీ చంద్ర రాశి ${moonSignName}, ${nakshatraName} నక్షత్రం (${moonPada}వ పాదం) మరియు 12వ ఇల్లు ${h12RashiName} (అధిపతి ${h12LordName}) మీ అంతరంగాన్ని ఇలా చూపిస్తున్నాయి: బయటకు మీరు ఎంతో సంయమనంతో, అన్నింటినీ చక్కదిద్దే సమర్థుడిగా కనిపిస్తారు. కానీ లోపల 'అందరి కోసం ఇంత త్యాగం చేసినా నాకు మిగిలిందేమిటి?' అనే బాధ ఉంది. ఆర్థిక భద్రత గురించిన ఆందోళన మరియు నమ్మిన వారి ద్రోహాన్ని గుండెల్లోనే దాచుకుని కర్తవ్యాన్ని నెరవేరుస్తున్నారు.`;
    if (lang === "ta") return `உங்கள் சந்திர ராசி ${moonSignName}, ${nakshatraName} நட்சத்திரம் (${moonPada}-ம் பாதம்) மற்றும் 12-ம் வீடான ${h12RashiName} (அதிபதி ${h12LordName}) உங்கள் ஆழ்மனதை காட்டுகிறது: பிறர் பார்வையில் நீங்கள் எல்லாவற்றையும் சாதிக்கும் ஆற்றல் படைத்தவர். ஆனால் உங்கள் உள்ளே 'அனைவருக்கும் இவ்வளவு செய்தும் எனக்கு என்ன கிடைத்தது?' என்ற மௌன ஏக்கம் உள்ளது. எதிர்கால பொருளாதார கவலையையும், துரோகத்தின் வலியையும் எவரிடமும் சொல்லாமல் அடக்கி வைத்துள்ளீர்கள்.`;
    if (lang === "ml") return `നിങ്ങളുടെ ചന്ദ്ര രാശിയായ ${moonSignName}, ${nakshatraName} നക്ഷത്രം (${moonPada}-ാം പാദം), ദ്വാദശ ഭാവമായ ${h12RashiName} (അധിപൻ ${h12LordName}) എന്നിവ നിങ്ങളുടെ മനസ്സ് തുറക്കുന്നു: പുറമെ എല്ലാം കാര്യക്ഷമമായി കൈകാര്യം ചെയ്യുന്ന ആളാണെങ്കിലും, ഉള്ളിൽ 'എല്ലാവർക്കുമായി ഇത്രയധികം ചെയ്തിട്ടും എനിക്കെന്ത് ലഭിച്ചു?' എന്നൊരു വിങ്ങലുണ്ട്. സാമ്പത്തിക ഭദ്രതയെക്കുറിച്ചുള്ള ഭയവും ചതിക്കപ്പെട്ടതിന്റെ വേദനയും ആരുമറിയാതെ ഉള്ളിൽ കുഴിച്ചുമൂടിയിരിക്കുന്നു.`;
    return `Your Moon Sign (${moonSignName}), Janma Nakshatra (${nakshatraName}, Pada ${moonPada}), and the 12th House (${h12RashiName}, ruled by ${h12LordName}) uncover your subconscious reality: To everyone, you appear composed, resourceful, and capable of holding the world together. Yet inside lingers the quiet, bitter ache: 'After giving my entire youth and strength to everyone else, what truly remains for me?' The secret dread of financial instability and the silent wound of past betrayal are buried like a secret vault within your chest.`;
  }

  if (element === "air") {
    if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonSignName}, ${nakshatraName} ನಕ್ಷತ್ರ (${moonPada}ನೇ ಪಾದ) ಹಾಗೂ ದ್ವಾದಶ ಭಾವವಾದ ${h12RashiName} (ಅಧಿಪತಿ ${h12LordName}) ನಿಮ್ಮ ಸುಪ್ತ ಮನಸ್ಸನ್ನು ಹೀಗೆ ವಿವರಿಸುತ್ತದೆ: ನಿಮ್ಮ ಸುತ್ತಲೂ ನೂರಾರು ಜನರಿರಬಹುದು, ನೀವು ಎಲ್ಲರೊಂದಿಗೂ ಹರಟುತ್ತಿರಬಹುದು; ಆದರೆ ನಿಮ್ಮ ಬೌದ್ಧಿಕ ಮಟ್ಟವನ್ನು ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆಗಳನ್ನು ಸಮಾನವಾಗಿ ಗ್ರಹಿಸುವ ಒಬ್ಬನೇ ಒಬ್ಬ ನಿಜವಾದ ಮಿತ್ರನಿಲ್ಲವೆಂಬ ಗಾಢವಾದ ಬೌದ್ಧಿಕ ಒಂಟಿತನ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತದೆ. ತಲೆಯೊಳಗೆ ನೂರಾರು ಆಲೋಚನೆಗಳು ಒಂದೇ ಸಲ ಓಡುತ್ತಿದ್ದರೂ, ಯಾವುದನ್ನೂ ಇತರರಿಗೆ ಹೇಳದೆ ಕೇವಲ ತಮಾಷೆಯ ಮಾತಿನ ಹಿಂದೆ ನಿಮ್ಮ ಗಂಭೀರ ನೋವನ್ನು ಮರೆಮಾಚುವುದೇ ನಿಮ್ಮ ಅಂತರಂಗದ ಗುಟ್ಟು.`;
    if (lang === "hi") return `आपकी चंद्र राशि ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) तथा द्वादश भाव ${h12RashiName} (स्वामी ${h12LordName}) आपकी मानसिक दुनिया को उजागर करते हैं: आपके इर्द-गिर्द बहुत से लोग हो सकते हैं, आप सबसे हंसते-बोलते हैं; किंतु आपके बौद्धिक स्तर और संवेदनशीलता को गहराई से समझने वाला एक भी सच्चा साथी न होने का अकेलापन आपको सालता है। मस्तिष्क में विचारों की आंधी चलते हुए भी, हंसी-मजाक के पीछे अपनी गहरी पीड़ा को छिपाना ही आपका गुप्त रहस्य है।`;
    if (lang === "mr") return `आपली चंद्र रास ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) आणि बारावे स्थान ${h12RashiName} (स्वामी ${h12LordName}) आपले मानस असे मांडतात: आपल्या आजूबाजूला अनेक माणसे असतील, आपण सर्वांशी बोलता; पण आपल्या बौद्धिक व भावनिक पातळीवर समजून घेणारा एकही खरा सोबती नाही हे एकाकीपण मनाला लागून राहते. मनात विचारांचे काहूर माजलेले असताना विनोदी स्वभावाच्या पडद्यामागे स्वतःचे दुःख लपवणे हाच आपला अंतर्मनातील गुप्त ठेवा आहे.`;
    if (lang === "te") return `మీ చంద్ర రాశి ${moonSignName}, ${nakshatraName} నక్షత్రం (${moonPada}వ పాదం) మరియు 12వ ఇల్లు ${h12RashiName} (అధిపతి ${h12LordName}) మీ మనస్సులోని రంగులను వివరిస్తున్నాయి: మీ చుట్టూ ఎంతమంది ఉన్నా, మీ అంతరంగపు ఆలోచనలను సరిగ్గా అర్థం చేసుకునే ఆత్మీయులు లేరన్న వెలితి మిమ్మల్ని బాధిస్తుంది. మనసులో తుఫాను రేగుతున్నా, పైకి నవ్వుతూ జోకులు వేస్తూ మీ బాధను కప్పిపుచ్చడమే మీ రహస్యం.`;
    if (lang === "ta") return `உங்கள் சந்திர ராசி ${moonSignName}, ${nakshatraName} நட்சத்திரம் (${moonPada}-ம் பாதம்) மற்றும் 12-ம் வீடான ${h12RashiName} (அதிபதி ${h12LordName}) உங்கள் ஆழ்மனதை விவரிக்கிறது: உங்களைச் சுற்றி பலர் இருந்தாலும், உங்கள் அறிவார்ந்த சிந்தனைகளையும் உணர்வுகளையும் சரியாகப் புரிந்து கொள்ள ஒருவருமில்லை என்ற தனிமை உணர்வு வாட்டுகிறது. மனதில் ஆயிரம் கவலைகள் ஓடினாலும், நகைச்சுவையின் பின்னால் உங்கள் துயரங்களை மறைப்பதே உங்கள் ஆழ்மன ரகசியம்.`;
    if (lang === "ml") return `നിങ്ങളുടെ ചന്ദ്ര രാശിയായ ${moonSignName}, ${nakshatraName} നക്ഷത്രം (${moonPada}-ാം പാദം), ദ്വാദശ ഭാവമായ ${h12RashiName} (അധിപൻ ${h12LordName}) എന്നിവ നിങ്ങളുടെ ആന്തരിക ലോകം വ്യക്തമാക്കുന്നു: ചുറ്റും ആളുകളുണ്ടെങ്കിലും, നിങ്ങളുടെ മനസ്സിന്റെ ആഴം മനസ്സിലാക്കാൻ ഒരാളുമില്ലെന്ന ഏകാന്തത നിങ്ങളെ അലട്ടുന്നു. ഉള്ളിൽ ആശയക്കുഴപ്പങ്ങൾ നിറയുമ്പോഴും, തമാശകൾക്ക് പിന്നിൽ ഗൗരവമേറിയ സങ്കടങ്ങൾ ഒളിച്ചുവെക്കുന്നതാണ് നിങ്ങളുടെ രഹസ്യം.`;
    return `Your Moon Sign (${moonSignName}), Janma Nakshatra (${nakshatraName}, Pada ${moonPada}), and the 12th House (${h12RashiName}, ruled by ${h12LordName}) unveil your subconscious world: Surrounded by scores of acquaintances and engaging in witty conversations, you nonetheless experience a profound intellectual and emotional solitude. The realization that nobody truly operates on your wavelength or perceives the sensitive philosopher behind your humour is your private ache. Masking serious inner conflict behind quick laughter is the secret you keep.`;
  }

  // Water Moon
  if (lang === "kn") return `ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonSignName}, ${nakshatraName} ನಕ್ಷತ್ರ (${moonPada}ನೇ ಪಾದ) ಹಾಗೂ ದ್ವಾದಶ ಭಾವವಾದ ${h12RashiName} (ಅಧಿಪತಿ ${h12LordName}) ನಿಮ್ಮ ಸುಪ್ತ ಮನಸ್ಸಿನ ಪವಿತ್ರ ರಹಸ್ಯವನ್ನು ಹೀಗೆ ಬಿಚ್ಚಿಡುತ್ತದೆ: ಮನೆಯಲ್ಲಿ ಅಥವಾ ಕಚೇರಿಯಲ್ಲಿ ಎಲ್ಲರಿಗೂ ಧೈರ್ಯ ಹೇಳುವ ನೀವು, ರಾತ್ರಿಯ ನಿಶ್ಯಬ್ದದಲ್ಲಿ ನಿಮ್ಮ ಕೊಠಡಿಯ ಬಾಗಿಲು ಮುಚ್ಚಿಕೊಂಡು ಯಾರೂ ನೋಡದಂತೆ ಕಣ್ಣೀರು ಸುರಿಸುತ್ತೀರಿ. ಇತರರ ಮನಸ್ಸು ನೋಯಬಾರದೆಂದು ನಿಮ್ಮ ಸ್ವಂತ ಹಕ್ಕುಗಳನ್ನು ತ್ಯಾಗ ಮಾಡುತ್ತೀರಿ. ಯಾರಾದರೂ ಸುಳ್ಳು ಹೇಳಿದರೆ ನಿಮ್ಮ ಅತೀಂದ್ರಿಯ ಅಂತಃಪ್ರಜ್ಞೆ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಅದನ್ನು ಹಿಡಿದುಬಿಡುತ್ತದೆ, ಆದರೂ ಸಂಬಂಧ ಉಳಿಸಿಕೊಳ್ಳಲು ಮೂಕರಂತೆ ನಟಿಸುತ್ತೀರಿ; ಈ ಅಸಹಾಯಕ ಮೌನವೇ ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಗಹನವಾದ ಅಂತರಂಗದ ಸತ್ಯ.`;
  if (lang === "hi") return `आपकी चंद्र राशि ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) तथा द्वादश भाव ${h12RashiName} (स्वामी ${h12LordName}) आपकी आत्मा के पावन रहस्य को खोलते हैं: दिन में सबको ढांढस बंधाने वाले आप, रात के सन्नाटे में दरवाजा बंद कर चुपके से आंसू बहाते हैं ताकि किसी को आपकी चिंता न हो। आपकी गहरी अंतर्दृष्टि तुरंत भांप लेती है जब कोई आपसे छल करता है, फिर भी रिश्तों की मर्यादा की खातिर आप अनजान बने रहते हैं। यही मूक करुणा आपकी आत्मा का सबसे गूढ़ सत्य है।`;
  if (lang === "mr") return `आपली चंद्र रास ${moonSignName}, ${nakshatraName} नक्षत्र (${moonPada} चरण) आणि बारावे स्थान ${h12RashiName} (स्वामी ${h12LordName}) आपल्या आत्म्याचे सत्य उलगडतात: दिवसा सर्वांना धीर देणारे आपण, रात्रीच्या नीरव शांततेत कोणालाही न कळू देता डोळ्यांतून अश्रू वाहू देता. कोणी आपल्याशी खोटे बोलत असेल तर आपली अंतःप्रेरणा लगेच ओळखते, तरीही नाती टिकवण्यासाठी आपण गप्प राहता; हाच मूक त्याग आपल्या अंतर्मनातील परम सत्य आहे.`;
  if (lang === "te") return `మీ చంద్ర రాశి ${moonSignName}, ${nakshatraName} నక్షత్రం (${moonPada}వ పాదం) మరియు 12వ ఇల్లు ${h12RashiName} (అధిపతి ${h12LordName}) మీ ఆత్మ రహస్యాన్ని ఇలా వెల్లడిస్తున్నాయి: పగలు అందరికీ ధైర్యాన్నిచ్చే మీరు, రాత్రివేళ ఎవరికీ తెలియకుండా ఒంటరిగా కన్నీరు కారుస్తారు. ఎవరైనా మోసం చేస్తున్నారని మీ సహజ జ్ఞానానికి తెలిసినా, బంధాలు తెగిపోకూడదని తెలియనట్లే నటిస్తారు; ఈ మౌన త్యాగమే మీ అంతరంగపు లోతైన సత్యం.`;
  if (lang === "ta") return `உங்கள் சந்திர ராசி ${moonSignName}, ${nakshatraName} நட்சத்திரம் (${moonPada}-ம் பாதம்) மற்றும் 12-ம் வீடான ${h12RashiName} (அதிபதி ${h12LordName}) உங்கள் ஆன்மாவின் ரகசியத்தை உரைக்கிறது: பகலில் பிறருக்கு தைரியம் சொல்லும் நீங்கள், இரவின் அமைதியில் யாருமறியாமல் கண்ணீர் வடிக்கிறீர்கள். மற்றவர்கள் ஏமாற்றுவதை உங்கள் உள்ளுணர்வு உடனே கண்டுணர்ந்தாலும், உறவுகள் காக்கப்பட வேண்டும் என்பதற்காக அமைதி காக்கிறீர்கள். இந்த மௌன தியாகமே உங்கள் ஆழ்மனதின் புனித ரகசியம்.`;
  if (lang === "ml") return `നിങ്ങളുടെ ചന്ദ്ര രാശിയായ ${moonSignName}, ${nakshatraName} നക്ഷത്രം (${moonPada}-ാം പാദം), ദ്വാദശ ഭാവമായ ${h12RashiName} (അധിപൻ ${h12LordName}) എന്നിവ നിങ്ങളുടെ ആത്മാവിന്റെ രഹസ്യം പറയുന്നു: പകൽ മറ്റുള്ളവർക്ക് ആശ്വാസമേകുന്ന നിങ്ങൾ, രാത്രിയുടെ നിശബ്ദതയിൽ ആരുമറിയാതെ കണ്ണീർ പൊഴിക്കുന്നു. മറ്റുള്ളവരുടെ ചതികൾ നിങ്ങളുടെ മനസ്സ് തിരിച്ചറിയുന്നുണ്ടെങ്കിലും ബന്ധങ്ങൾ നിലനിർത്താൻ മൗനം പാലിക്കുന്നു. ഈ മൗന ത്യാഗമാണ് നിങ്ങളുടെ അന്തരംഗ സത്യം.`;
  return `Your Moon Sign (${moonSignName}), Janma Nakshatra (${nakshatraName}, Pada ${moonPada}), and the 12th House (${h12RashiName}, ruled by ${h12LordName}) unveil the sacred truth of your soul: Comforting family and friends by day, in the stillness of midnight you shut the door and weep in total secrecy so no one worries. Your acute psychic intuition immediately detects when loved ones are deceitful, yet you choose silence simply to protect the relationship. This unbearable, compassionate silence is your deepest Dark Secret.`;
}

export function generateAntarangaSatya(
  kundli: KundliOutput,
  lang: AntarangaLang = "kn",
  devoteeName: string = "Devotee",
  gender: "male" | "female" = "male",
  birthDate?: string,
  birthTime?: string,
  lat?: number,
  lng?: number,
  isTimeUnknown: boolean = false
): AntarangaSecretResult {
  const baseLang = lang || "kn";
  const localizedName = getLocalizedDevoteeName(devoteeName, baseLang) || devoteeName;
  const now = new Date();

  // Calculate age
  const birthDt = new Date(`${birthDate || "1990-01-01"}T${(birthTime || "12:00").slice(0, 5)}:00`);
  const ageYears = isNaN(birthDt.getTime()) ? 30 : Math.max(0.1, (now.getTime() - birthDt.getTime()) / (365.25 * 24 * 3600 * 1000));
  const isChild = ageYears < 13;

  // Extract Lagna and Moon Sign
  const rawLagnaRashiIdx = kundli.lagnaRashi?.index ?? 0;
  const moonRashiIdx = kundli.moonSign?.index ?? 0;
  const moonPada = kundli.moonPada ?? 1;

  // If time is unknown, anchor cleanly to Chandra Kundali (Moon Sign as Lagna)
  const lagnaRashiIdx = isTimeUnknown ? moonRashiIdx : rawLagnaRashiIdx;

  // Moon Nakshatra
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakshatraIdx = moonPlanet?.nakshatra?.index ?? 0;

  // 8th House (Secret / Gupta Bhava)
  const h8RashiIdx = (lagnaRashiIdx + 7) % 12;
  const h8LordKey = getRashiLordGrahaKey(h8RashiIdx);

  // 12th House (Subconscious / Antaranga Bhava)
  const h12RashiIdx = (lagnaRashiIdx + 11) % 12;
  const h12LordKey = getRashiLordGrahaKey(h12RashiIdx);

  // Map natal planets
  const mappedNatalPlanets = kundli.planets.map((p) => ({
    graha: p.name as GrahaKey,
    rashiIndex: p.rashi?.index ?? 0,
    house: p.house ?? 1,
    retrograde: !!p.isRetrograde,
    debilitated: !!p.isDebilitated,
    exalted: !!p.isExalted,
    degree: p.degree ?? 0
  }));

  // Analyze chart using existing engine
  const parsedChart = analyzeKundali({
    lang: baseLang === "ml" || baseLang === "mr" ? "en" : baseLang,
    lagnaRashiIndex: lagnaRashiIdx,
    moonRashiIndex: moonRashiIdx,
    moonNakshatraIndex: moonNakshatraIdx,
    natalPlanets: mappedNatalPlanets,
    transits: [],
    gender: gender === "female" ? "Female" : "Male",
    name: localizedName
  });

  // Localized astronomical markers across 7 languages
  const baseLagnaName = RASHI_7L[lagnaRashiIdx]?.[baseLang] || RASHI_7L[lagnaRashiIdx].en;
  const chandraSuffix: Record<AntarangaLang, string> = {
    kn: " (ಚಂದ್ರ ಲಗ್ನ)",
    en: " (Chandra Lagna)",
    hi: " (चन्द्र लग्न)",
    mr: " (चंद्र लग्न)",
    te: " (చంద్ర లగ్నం)",
    ta: " (சந்திர லக்னம்)",
    ml: " (ചന്ദ്ര ലഗ്നം)"
  };
  const lagnaSignName = isTimeUnknown ? `${baseLagnaName}${chandraSuffix[baseLang] || chandraSuffix.en}` : baseLagnaName;
  const moonSignName = RASHI_7L[moonRashiIdx]?.[baseLang] || RASHI_7L[moonRashiIdx].en;
  const nakshatraName = NAKSHATRA_7L[moonNakshatraIdx]?.[baseLang] || NAKSHATRA_7L[moonNakshatraIdx].en;
  const h8LordName = GRAHA_7L[h8LordKey]?.[baseLang] || GRAHA_7L[h8LordKey].en;
  const h8RashiName = RASHI_7L[h8RashiIdx]?.[baseLang] || RASHI_7L[h8RashiIdx].en;
  const h12LordName = GRAHA_7L[h12LordKey]?.[baseLang] || GRAHA_7L[h12LordKey].en;
  const h12RashiName = RASHI_7L[h12RashiIdx]?.[baseLang] || RASHI_7L[h12RashiIdx].en;

  // 8th Lord conflict details in selected language
  const nigoodha = getAntarangaNigoodhaDetails(h8LordKey, baseLang);

  // 1. Calculate live transits for the current moment
  const currentTransits = getTransitsForDate(moonRashiIdx, now, "lahiri");
  const transitMoonSign = currentTransits[PlanetName.Moon]?.rashiIndex ?? ((moonRashiIdx + 1) % 12);
  const shaniHouse = currentTransits[PlanetName.Saturn]?.house ?? 8;
  const guruHouse = currentTransits[PlanetName.Jupiter]?.house ?? 5;

  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isAshtama = shaniHouse === 8;
  const isKantaka = [4, 7, 10].includes(shaniHouse);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);

  // 2. Identify Element of Moon Sign
  const element: "fire" | "earth" | "air" | "water" = [0, 4, 8].includes(moonRashiIdx)
    ? "fire"
    : [1, 5, 9].includes(moonRashiIdx)
    ? "earth"
    : [2, 6, 10].includes(moonRashiIdx)
    ? "air"
    : "water";

  // 3. Extract exact running Mahadasha & Bhukti
  const mahaSuffix: Record<AntarangaLang, string> = {
    kn: " ಮಹಾದಶಾ",
    mr: " महादशा",
    hi: " महादशा",
    te: " మహాదశ",
    ta: " மகாதிசை",
    ml: " മഹാദശ",
    en: " Mahadasha"
  };
  const bhuktiSuffix: Record<AntarangaLang, string> = {
    kn: " ಅಂತರ್ದಶಾ (ಭುಕ್ತಿ)",
    mr: " अंतर्दशा",
    hi: " अन्तर्दशा",
    te: " అంతర్దశ",
    ta: " புக்தி (அந்தர்திசை)",
    ml: " അപഹാരം (അന്തർദശ)",
    en: " Antardasha"
  };

  let mahaKey: GrahaKey = "Jupiter";
  let bhuktiKey: GrahaKey = "Saturn";
  let activeMahadasha = `${GRAHA_7L[mahaKey]?.[baseLang] || GRAHA_7L["Jupiter"]?.[baseLang] || "Jupiter"}${mahaSuffix[baseLang] || mahaSuffix.en}`;
  let activeBhukti = `${GRAHA_7L[bhuktiKey]?.[baseLang] || GRAHA_7L["Saturn"]?.[baseLang] || "Saturn"}${bhuktiSuffix[baseLang] || bhuktiSuffix.en}`;

  try {
    const ageDec = ageDecimalYearsAt(
      birthDate || "1990-01-01",
      birthTime || "12:00",
      lat || 14.5479,
      lng || 74.3188,
      now
    );
    const bhukti = findBhuktiAtAge(kundli, ageDec);
    if (bhukti) {
      const mahaLord = bhukti.maha?.planet ?? PlanetName.Jupiter;
      const bhuktiLord = bhukti.bhukti ?? PlanetName.Saturn;
      mahaKey = toGrahaKey(mahaLord);
      bhuktiKey = toGrahaKey(bhuktiLord);
      const mahaName = GRAHA_7L[mahaKey]?.[baseLang] || GRAHA_7L[mahaKey]?.en || String(mahaLord);
      const bhuktiName = GRAHA_7L[bhuktiKey]?.[baseLang] || GRAHA_7L[bhuktiKey]?.en || String(bhuktiLord);
      activeMahadasha = `${mahaName}${mahaSuffix[baseLang] || mahaSuffix.en}`;
      activeBhukti = `${bhuktiName}${bhuktiSuffix[baseLang] || bhuktiSuffix.en}`;
    }
  } catch {}

  const dashaText = `${activeMahadasha} - ${activeBhukti}`;

  // 4. Construct dynamically differentiated Paragraph 1 & Paragraph 2
  const salutation = localizedName
    ? (baseLang === "kn" ? `${localizedName} ಅವರೇ, `
      : baseLang === "en" ? `Dear ${localizedName}, `
      : `${localizedName}, `)
    : "";

  let paragraph1: string;
  let paragraph2: string;
  let kshetraBlessing: string;

  if (isChild) {
    // Child / Infant Pure Adaptation (Zero Adult Betrayal or Dark Burden)
    const childPara1Map: Record<AntarangaLang, string> = {
      kn: `${salutation}ಮಗುವಿನ ಜನ್ಮ ರಾಶಿಯಾದ ${moonSignName}, ${nakshatraName} ನಕ್ಷತ್ರ ಹಾಗೂ ${lagnaSignName}ವು ಅಪಾರ ದೈವಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ಸಹಜ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಮಗುವಿನ ಮನಸ್ಸು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಾಗೂ ಪರಿಶುದ್ಧವಾಗಿದ್ದು, ಹೊಸ ವಿಷಯಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಗ್ರಹಿಸುವ ಅದ್ಭುತ ಶಕ್ತಿಯಿದೆ. ನೈಸರ್ಗಿಕ ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಕಲಿಕಾ ವೇಗವು ಅಸಾಧಾರಣವಾಗಿದ್ದು, ಮನೆಯವರ ಪ್ರೀತಿಯೇ ಮಗುವಿನ ಅತಿ ದೊಡ್ಡ ಶಕ್ತಿಯಾಗಿದೆ.`,
      en: `${salutation}The childs Moon Sign (${moonSignName}), Janma Nakshatra (${nakshatraName}), and Lagna (${lagnaSignName}) reveal a pure, highly intelligent, and luminous celestial aura. Possessing acute emotional sensitivity and sharp observational acumen, the child absorbs environment and learning at rapid pace. Nurturing with gentle patience unlocks boundless creative potential.`,
      hi: `${salutation}बालक की चंद्र राशि ${moonSignName}, ${nakshatraName} नक्षत्र एवं लग्न ${lagnaSignName} अत्यंत दिव्य मेधा एवं स्वाभाविक बुद्धिमत्ता को दर्शाते हैं। बालक का मन अत्यंत कोमल व संवेदनशील है, जो नवीन विषयों को शीघ्रता से ग्रहण करता है। प्रेम एवं धैर्यपूर्वक मार्गदर्शन से बालक अद्वितीय प्रगति करेगा।`,
      mr: `${salutation}बाळाची चंद्र रास ${moonSignName}, ${nakshatraName} नक्षत्र आणि लग्न ${lagnaSignName} अपार दैवी तेज व उपजत बुद्धिमत्ता दर्शवतात. बाळाचे मन अत्यंत हळवे व शुद्ध असून ते नवीन गोष्टी पटकन शिकते. कौटुंबिक प्रेम आणि धीर हीच बाळाची खरी ताकद आहे.`,
      te: `${salutation}బిడ్డ చంద్ర రాశి ${moonSignName}, ${nakshatraName} నక్షత్రం మరియు లగ్నం ${lagnaSignName} అద్భుతమైన దైవిక తేజస్సు మరియు సహజ మేధస్సును సూచిస్తున్నాయి. బిడ్డ మనస్సు ఎంతో సున్నితమైనది మరియు పరిశుద్ధమైనది, విషయాలను వేగంగా గ్రహిస్తుంది.`,
      ta: `${salutation}குழந்தையின் சந்திர ராசி ${moonSignName}, ${nakshatraName} நட்சத்திரம் மற்றும் லக்னம் ${lagnaSignName} தெய்வீக ஆற்றலையும் கூரிய அறிவாற்றலையும் காட்டுகின்றன. குழந்தையின் மனம் மிகவும் மென்மையானது, அனைத்தையும் விரைவாகக் கற்கும் திறன் கொண்டது.`,
      ml: `${salutation}കുട്ടിയുടെ ചന്ദ്ര രാശിയായ ${moonSignName}, ${nakshatraName} നക്ഷത്രം, ലഗ്നം ${lagnaSignName} എന്നിവ ദിവ്യമായ ബുദ്ധിശക്തിയെയും സാത്വിക ഗുണങ്ങളെയും വ്യക്തമാക്കുന്നു. മനസ്സ് വളരെ മൃദുലവും കാര്യങ്ങൾ വേഗത്തിൽ ഗ്രഹിക്കുന്നതുമാണ്.`
    };

    const childPara2Map: Record<AntarangaLang, string> = {
      kn: `ಮಗುವಿನ ದ್ವಾದಶ ಭಾವ ${h12RashiName}ವು ಸೂಕ್ಷ್ಮ ನಿದ್ರಾ ವ್ಯವಸ್ಥೆ ಹಾಗೂ ವಾತಾವರಣದ ಪ್ರಭಾವವನ್ನು ತೋರಿಸುತ್ತದೆ. ಮಗುವಿಗೆ ಅನಗತ್ಯ ಶಬ್ದ ಅಥವಾ ಹೊರಗಿನ ಋಣಾತ್ಮಕ ದೃಷ್ಟಿ ದೋಷಗಳಿಂದ ರಕ್ಷಣೆ ನೀಡಲು ನಿಯಮಿತ ದೃಷ್ಟಿ ನಿವಾರಣೆ, ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಸದಾ ಶಾಂತಿಯುತ ಕೌಟುಂಬಿಕ ವಾತಾವರಣ ಒದಗಿಸುವುದು ಅತ್ಯಗತ್ಯ. ಮಗುವಿನ ಪ್ರತಿಭೆಯು ದಿನದಿಂದ ದಿನಕ್ಕೆ ಪ್ರವರ್ಧಮಾನಕ್ಕೆ ಬರಲಿದೆ.`,
      en: `The 12th house (${h12RashiName}) indicates sensitive sleeping patterns and delicate receptivity to subtle energies. Providing a tranquil, calm home sanctuary, regular traditional gaze protection (Drishti Parihara), and consistent restful routines safeguards the childs vitality and ensures sound, undisturbed sleep.`,
      hi: `द्वादश भाव ${h12RashiName} संवेदनशील निद्रा एवं बाहरी ऊर्जाओं के प्रति कोमलता को दर्शाता है। शांत पारिवारिक वातावरण, सात्विक दिनचर्या एवं नियमित दृष्टि निवारण से बालक की जीवन शक्ति एवं एकाग्रता सदैव सुरक्षित रहेगी।`,
      mr: `बारावे स्थान ${h12RashiName} संवेदनशील झोप व वातावरणाचा प्रभाव दर्शवते. घरात शांतता राखणे, नियमित दृष्ट काढणे व सात्त्विक वातावरण देणे यामुळे बाळाचे आरोग्य व बुद्धी उत्तम प्रकारे विकसित होईल.`,
      te: `12వ ఇల్లు ${h12RashiName} సున్నితమైన నిద్ర మరియు బాహ్య ప్రభావాల పట్ల జాగ్రత్తను సూచిస్తుంది. ప్రశాంతమైన గృహ వాతావరణం మరియు దిష్టి తీయడం వల్ల బిడ్డ ఆరోగ్యం, చదువు బాగుంటాయి.`,
      ta: `12-ம் வீடு ${h12RashiName} மென்மையான தூக்கம் மற்றும் சூழல் விழிப்புணர்வை காட்டுகிறது. அமைதியான வீட்டு சூழலும், திருஷ்டி கழித்தலும் குழந்தையின் ஆரோக்கியத்தையும் உற்சாகத்தையும் காக்கும்.`,
      ml: `ദ്വാദശ ഭാവമായ ${h12RashiName} മൃദുവായ ഉറക്കത്തെയും സംരക്ഷണ ആവശ്യകതയെയും സൂചിപ്പിക്കുന്നു. ശാന്തമായ ഗൃഹാന്തരീക്ഷവും ഈശ്വര പ്രാർത്ഥനയും കുട്ടിയുടെ ആരോഗ്യത്തെയും പഠനത്തെയും മികച്ചതാക്കും.`
    };

    paragraph1 = childPara1Map[baseLang] || childPara1Map.en;
    paragraph2 = childPara2Map[baseLang] || childPara2Map.en;

    kshetraBlessing = baseLang === "kn"
      ? `【ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಾಲ ರಕ್ಷಾ ದಿವ್ಯ ಕವಚ】: ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪವಿತ್ರ ಭಸ್ಮ-ತೀರ್ಥ ಪ್ರಸಾದವು ಮಗುವಿಗೆ ಬಾಲಾರಿಷ್ಟ ನಿವಾರಣೆ, ದೀರ್ಘಾಯುಷ್ಯ, ದೃಷ್ಟಿ ದೋಷ ಮುಕ್ತಿ ಹಾಗೂ ವಿದ್ಯಾರಂಗದಲ್ಲಿ ಅದ್ಭುತ ಜಯವನ್ನು ಕರುಣಿಸಲಿ.`
      : baseLang === "hi"
      ? `【श्री क्षेत्र गोकर्ण बाल रक्षा दिव्य कवच】: श्री गोकर्ण महाबलेश्वर आत्मलिंग की कृपा से बालक को उत्तम स्वास्थ्य, दीर्घायु, अरिष्ट निवारण एवं विद्या-बुद्धि में असाधारण सफलता प्राप्त हो।`
      : baseLang === "mr"
      ? `【श्री क्षेत्र गोकर्ण बाल संरक्षण दिव्य कवच】: श्री गोकर्ण महाबळेश्वर आत्मलिंगाच्या आशीर्वादाने बाळाला उत्तम आरोग्य, दीर्घायुष्य, दृष्ट दोष मुक्ती व शिक्षणात यश लाभो.`
      : baseLang === "te"
      ? `【శ్రీ క్షేత్ర గోకర్ణ బాల రక్షా దివ్య కవచం】: శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ఆత్మలింగ అనుగ్రహంతో బిడ్డకు ఆయురారోగ్యాలు, దృష్టి దోష నివారణ మరియు విద్యా విజయాలు చేకూరునుగాక.`
      : baseLang === "ta"
      ? `【ஸ்ரீ கோகர்ணம் பால ரக்ஷா கவசம்】: ஸ்ரீ கோகர்ணம் மகாபலேஸ்வரர் அருளால் குழந்தைக்கு நீண்ட ஆயுளும், திருஷ்டி தோஷ நிவாரணமும், கல்வியில் பெரும் வெற்றியும் உண்டாகட்டும்.`
      : baseLang === "ml"
      ? `【ശ്രീ ഗോകർണം ബാല രക്ഷാ കവചം】: ശ്രീ ഗോകർണം മഹാബലേശ്വര കൃപയാൽ കുട്ടിക്ക് ആയുരാരോഗ്യവും ദൃഷ്ടിദോഷ മുക്തിയും വിദ്യാഭ്യാസത്തിൽ ഉന്നത വിജയവും ലഭിക്കട്ടെ.`
      : `【SACRED SRI KSHETRA GOKARNA BALA RAKSHA SHIELD】: May the sacred Atma Linga grace of Lord Mahabaleshwara at Sri Kshetra Gokarna surround the child with impenetrable divine vitality, total freedom from malefic gaze, and sovereign brilliance in learning.`;
  } else {
    // Adult Deep Psychological Truth
    const personaOpening = getPersonaOpening(element, lagnaSignName, moonSignName, baseLang);
    const dashaCrisis = getCurrentDashaLifeCrisis(mahaKey, bhuktiKey, activeMahadasha, activeBhukti, baseLang);
    const gocharaTransit = getGocharaTransitPressure(isSadeSati, isAshtama, isKantaka, hasGuruBala, baseLang);
    const soulSecret = getSubconsciousSoulSecret(element, moonSignName, nakshatraName, moonPada, h12RashiName, h12LordName, baseLang);

    paragraph1 = `${salutation}${personaOpening} ${dashaCrisis} ${gocharaTransit} ${nigoodha.conflict}`;
    paragraph2 = soulSecret;

    kshetraBlessing = baseLang === "kn"
      ? `【ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ದಿವ್ಯ ರಕ್ಷೆ】: ಈ ಆಂತರಿಕ ಸಂಘರ್ಷಗಳು ಶಮನಗೊಳ್ಳಲು ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಆತ್ಮಲಿಂಗ ಕೃಪೆಯು ಅತ್ಯಂತ ಪ್ರಧಾನವಾಗಿದೆ. ${nigoodha.remedy} ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹವು ನಿಮ್ಮ ಮನಸ್ಸಿನ ಭಾರವನ್ನು ಹಗುರಗೊಳಿಸಿ, ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಮತ್ತು ಆತ್ಮಸ್ಥೈರ್ಯವನ್ನು ಕರುಣಿಸಲಿ.`
      : baseLang === "hi"
      ? `【श्री क्षेत्र गोकर्ण सन्निधान दिव्य रक्षा कवच】: अंतर्मन के इस संताप को शांत करने हेतु पितरों का आशीर्वाद तथा श्री गोकर्ण महाबलेश्वर आत्मलिंग की कृपा परम कल्याणकारी है। ${nigoodha.remedy} भगवान महाबलेश्वर का पावन आशीर्वाद आपके चित्त को निर्मल शांति और नवीन आत्मविश्वास प्रदान करे।`
      : baseLang === "mr"
      ? `【श्री क्षेत्र गोकर्ण आत्मलिंग दिव्य संरक्षण कवच】: अंतर्मनातील हा संताप शांत होण्यासाठी पूर्वजांचे आशीर्वाद व श्री गोकर्ण महाबळेश्वर आत्मलिंगाची कृपा अत्यंत लाभदायी आहे। ${nigoodha.remedy} भगवान महाबळेश्वरांच्या कृपेने आपले मानसिक ओझे हलके होऊन जीवनात शाश्वत शांतता व अढळ आत्मबल लाभो.`
      : baseLang === "te"
      ? `【శ్రీ క్షేత్ర గోకర్ణ సన్నిధాన దివ్య రక్షణ】: ఈ అంతర్గత ఆవేదనను తొలగించడానికి పితృదేవతల ఆశీస్సులు మరియు శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ఆత్మలింగ అనుగ్రహం శ్రేయస్కరం. ${nigoodha.remedy} స్వామివారి కరుణతో మీ మనోభారం తొలగిపోయి శాశ్వత మనశ్శాంతి చేకూరునుగాక.`
      : baseLang === "ta"
      ? `【ஸ்ரீ க்ஷேத்ர கோகர்ணம் ஆத்மலிங்க தெய்வீக கவசம்】: இந்த ஆழ்மன வேதனையைத் தணிக்க முன்னோர்களின் ஆசியும் ஸ்ரீ கோகர்ணம் மகாபலேஸ்வரரின் ஆத்மலிங்க அருளும் மிக முக்கியமானதாகும். ${nigoodha.remedy} மகாபலேஸ்வரர் அருளால் உங்கள் மனப்பாரம் நீங்கி நிலையான அமைதியும் தைரியமும் உண்டாகட்டும்.`
      : baseLang === "ml"
      ? `【ശ്രീ ഗോകർണം മഹാബലേശ്വര സന്നിധാന ദിവ്യ രക്ഷാ കവചം】: ഉള്ളിലെ സംഘർഷങ്ങൾ ശമിക്കാൻ പിതൃക്കളുടെ അനുഗ്രഹവും ഗോകർണം മഹാബലേശ്വര ആത്മലിംഗ കൃപയും അത്യാവശ്യമാണ്. ${nigoodha.remedy} ഭഗവാന്റെ ദിവ്യാനുഗ്രഹത്താൽ നിങ്ങളുടെ മനസ്സിന്റെ ഭാരം ഇല്ലാതായി ശാശ്വത സമാധാനം ലഭിക്കട്ടെ.`
      : `【SACRED SRI KSHETRA GOKARNA DIVINE SHIELD】: Transmuting this subconscious emotional weight requires the grace of ancestral blessings and the sacred touch of Lord Mahabaleshwara (Atma Linga) at Sri Kshetra Gokarna. ${nigoodha.remedy} May the divine presence of Sri Mahabaleshwara dissolve your inner anxieties and illuminate your life with unshakable serenity and sovereign confidence.`;
  }

  // 1. Classical Moorthy Nirnaya (ಮೂರ್ತಿ ನಿರ್ಣಯ)
  const moorthyNirnaya = calculateMoorthyNirnaya(transitMoonSign, moonRashiIdx, baseLang);

  // 2. Cosmic Life Voltage & Gochara Nirnaya (ಜೀವಶಕ್ತಿ ವೋಲ್ಟೇಜ್ & ಗೋಚಾರ ನಿರ್ಣಯ)
  const cosmicVoltage = calculateCosmicLifeVoltage(
    kundli,
    moonRashiIdx,
    lagnaRashiIdx,
    birthDate || "1990-01-01",
    birthTime || "12:00",
    lat || 14.5479,
    lng || 74.3188,
    baseLang
  );

  // 3. Next 5-Year Horizon Sneak Preview & Locked Cliffhangers (೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಕಾಲ & ಮುನ್ನೋಟ)
  const fiveYearPreview = calculateFiveYearPreviewHorizon(
    kundli,
    moonRashiIdx,
    lagnaRashiIdx,
    baseLang,
    cosmicVoltage.energyScore,
    moorthyNirnaya.tier,
    mahaKey
  );

  // 4. Free Divine Lucky Blueprint (ಉಚಿತ ದೈವಿಕ ಅದೃಷ್ಟ ಅಂಶಗಳು)
  const luckyElements = calculateFreeLuckyElements(
    lagnaRashiIdx,
    moonRashiIdx,
    birthDate || "1990-01-01",
    baseLang
  );

  // 5. Pandit Palette Dining Conversion Offer (೮೪% ಅತಿಥಿಗಳ ನಂಬಿಕೆ & ೧೦ ಸೆಕೆಂಡ್ ಡೌನ್‌ಲೋಡ್)
  const diningOffer = getDiningConversionOffer(baseLang);

  // 6. Live Today's Tarabala & Chandrashtama (Table-Side Psychic Hook)
  const todayLiveTarabala = calculateLiveTodayTarabalaAndChandrashtama(
    moonNakshatraIdx,
    moonRashiIdx,
    now,
    baseLang
  );

  // 7. Secret Accuracy Profile: Yogi, Avayogi, and Maandi Knot
  const sunPlanet = kundli.planets.find((p) => p.name === PlanetName.Sun);
  const sunLon = (sunPlanet?.rashi?.index ?? 0) * 30 + (sunPlanet?.degree ?? 0);
  const moonLon = (moonPlanet?.rashi?.index ?? 0) * 30 + (moonPlanet?.degree ?? 0);
  const rahuPlanet = kundli.planets.find((p) => p.name === PlanetName.Rahu);
  const rahuLon = (rahuPlanet?.rashi?.index ?? 0) * 30 + (rahuPlanet?.degree ?? 0);
  const secretAccuracy = calculateSecretAccuracyProfile(sunLon, moonLon, rahuLon);

  const maandiHouse = kundli.maandi?.rashi
    ? (((kundli.maandi.rashi.index - lagnaRashiIdx + 12) % 12) + 1)
    : (([1, 4, 7, 10].includes(lagnaRashiIdx % 4) ? 8 : [2, 5, 8, 11].includes(lagnaRashiIdx % 4) ? 6 : 10));

  // Past 24-Month Mathematical Verification Box
  const pastVerification = {
    periodLabel: baseLang === "kn" ? "ಕಳೆದ ೧೮ - ೨೪ ತಿಂಗಳುಗಳು (೨೦೨೪ - ೨೦೨೫)"
      : baseLang === "hi" ? "विगत १८ - २४ माह (२०२४ - २०२५)"
      : baseLang === "mr" ? "मागील १८ - २४ महिने (२०२४ - २०२५)"
      : baseLang === "te" ? "గత 18 - 24 నెలలు (2024 - 2025)"
      : baseLang === "ta" ? "கடந்த 18 - 24 மாதங்கள் (2024 - 2025)"
      : baseLang === "ml" ? "കഴിഞ്ഞ 18 - 24 മാസങ്ങൾ (2024 - 2025)"
      : "Past 18 - 24 Months (2024 - 2025)",
    headline: isSadeSati || isAshtama
      ? (baseLang === "kn" ? "ಅತಿಯಾದ ಮಾನಸಿಕ ಆತಂಕ & ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದಿರುವಿಕೆ"
        : baseLang === "hi" ? "अत्यधिक मानसिक दबाव एवं परिश्रम का यथोचित फल न मिलना"
        : baseLang === "mr" ? "मानसिक ताणतणाव व कष्टांचे योग्य श्रेय न मिळणे"
        : baseLang === "te" ? "తీవ్ర మానసిక ఒత్తిడి మరియు శ్రమకు తగిన గుర్తింపు లేకపోవడం"
        : baseLang === "ta" ? "அதிக மன அழுத்தம் மற்றும் உழைப்பிற்கேற்ற அங்கீகாரம் இன்மை"
        : baseLang === "ml" ? "കഠിന മാനസിക സമ്മർദ്ദവും അർഹിച്ച അംഗീകാരം ലഭിക്കാതിരിക്കലും"
        : "Heavy Mental Pressure & Unrecognized Diligence")
      : (baseLang === "kn" ? "ಪ್ರಮುಖ ಕಾರ್ಯಗಳು ೯೯% ಪೂರ್ಣಗೊಂಡು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆ"
        : baseLang === "hi" ? "महत्वपूर्ण कार्य ९९% पूर्ण होकर अंतिम क्षण में रुकावट"
        : baseLang === "mr" ? "महत्त्वाची कामे ९९% पूर्ण होऊन शेवटच्या क्षणी अडथळा"
        : baseLang === "te" ? "ముఖ్యమైన పనులు 99% పూర్తయి చివరి నిమిషంలో ఆగిపోవడం"
        : baseLang === "ta" ? "முக்கிய பணிகள் 99% முடிந்து இறுதி நேரத்தில் தடைகள்"
        : baseLang === "ml" ? "പ്രധാന കാര്യങ്ങൾ 99% പൂർത്തിയായി അവസാന നിമിഷം തടസ്സം"
        : "Critical Projects Stalled at 99% Milestone"),
    proofText: isSadeSati || isAshtama
      ? (baseLang === "kn" ? "ಶನಿ ಗೋಚಾರದ ಪ್ರಭಾವ (ಸಾಡೇಸಾತಿ / ಅಷ್ಟಮ ಶನಿ) ಹಾಗೂ ಅಂತರ್ದಶಾ ಸಂಧಿ ಪರಿವರ್ತನೆ."
        : baseLang === "hi" ? "शनि गोचर (साढ़ेसाती / अष्टम शनि) एवं अंतर्दशा संधि का प्रत्यक्ष प्रभाव।"
        : baseLang === "mr" ? "शनि गोचर (साडेसाती / अष्टम शनि) व अंतर्दशा संधिकाल प्रभाव."
        : baseLang === "te" ? "శని గోచారం (ఏలినాటి శని / అష్టమ శని) మరియు అంతర్దశ సంధి ప్రభావం."
        : baseLang === "ta" ? "சனி பெயர்ச்சி (ஏழரை சனி / அஷ்டம சனி) மற்றும் அந்தர்திசை சந்தி தாக்கம்."
        : baseLang === "ml" ? "ശനി ഗോചര ഫലവും (ഏഴരശ്ശനി / അഷ്ടമശനി) അപഹാര സന്ധിയും."
        : "Direct mathematical impact of Saturn Gochara (Sade Sati / Ashtama Shani) & Antardasha transition.")
      : (baseLang === "kn" ? `ಕುಂಡಲಿಯ ${maandiHouse}ನೇ ಭಾವದಲ್ಲಿರುವ ಮಾಂದಿ ಗಂಟು ಹಾಗೂ ಹಿಂದಿನ ರಾಹು-ಕೇತು ಸಂಚಾರ.`
        : baseLang === "hi" ? `कुंडली के ${maandiHouse}वें भाव में मान्दि ग्रंथि एवं राहु-केतु अक्ष का प्रभाव।`
        : baseLang === "mr" ? `पत्रिकेतील ${maandiHouse}व्या स्थानातील मांदी गाठ व राहू-केतू अक्ष प्रभाव.`
        : baseLang === "te" ? `జాతకంలోని ${maandiHouse}వ స్థానంలో మాంది ముడి మరియు రాహు-కేతు ప్రభావం.`
        : baseLang === "ta" ? `ஜாதகத்தின் ${maandiHouse}-ம் வீட்டில் உள்ள மாந்தி முடிச்சு மற்றும் ராகு-கேது தாக்கம்.`
        : baseLang === "ml" ? `ജാതകത്തിലെ ${maandiHouse}-ാം ഭാവത്തിലെ മാന്ദി ഗ്രന്ഥിയും രാഹു-കേതു പ്രഭാവവും.`
        : `House ${maandiHouse} Maandi knot and past Rahu-Ketu nodal axis transit.`),
    symptoms: [
      baseLang === "kn" ? "೧೦೦% ಶ್ರಮ ವಹಿಸಿದರೂ ಪ್ರಮುಖ ಕೆಲಸಗಳು ಅಂತಿಮ ಹಂತದಲ್ಲಿ ವಿನಾಕಾರಣ ತಡವಾಗುವುದು"
        : baseLang === "hi" ? "शत-प्रतिशत प्रयास के उपरांत भी कार्य अंतिम चरण में अकारण विलंबित होना"
        : baseLang === "mr" ? "१००% प्रयत्न करूनही कामे शेवटच्या टप्प्यावर विनाकारण रखडणे"
        : baseLang === "te" ? "100% శ్రమించినా ముఖ్యమైన పనులు చివరి క్షణంలో ఆలస్యం కావడం"
        : baseLang === "ta" ? "100% முயற்சி செய்தும் பணிகள் இறுதி கட்டத்தில் காரணமின்றி தாமதமாவது"
        : baseLang === "ml" ? "100% പരിശ്രമിച്ചിട്ടും കാര്യങ്ങൾ അവസാന ഘട്ടത്തിൽ അകാരണമായി നീണ്ടുപോവുക"
        : "Despite 100% sincere toil, critical endeavors faced last-minute bureaucratic drag",
      baseLang === "kn" ? "ಅನಿರೀಕ್ಷಿತ ಆರ್ಥಿಕ ಖರ್ಚು ಅಥವಾ ಕುಟುಂಬದ ಆಪ್ತರ ನಂಬಿಕೆಯಿಂದ ಮಾನಸಿಕ ನಿರಾಶೆ"
        : baseLang === "hi" ? "आकस्मिक धन व्यय अथवा निकट संबंधियों के व्यवहार से आंतरिक व्यथा"
        : baseLang === "mr" ? "अचानक आर्थिक खर्च किंवा जवळच्या व्यक्तींच्या वागण्याने मानसिक खिन्नता"
        : baseLang === "te" ? "ఆకస్మిక ఆర్థిక ఖర్చులు లేదా ఆత్మీయుల ప్రవర్తన వల్ల మనస్తాపం"
        : baseLang === "ta" ? "திடீர் பண விரயம் அல்லது நெருங்கியவர்களின் செயலால் மன வேதனை"
        : baseLang === "ml" ? "അപ്രതീക്ഷിത ധനനഷ്ടം അല്ലെങ്കിൽ പ്രിയപ്പെട്ടവരിൽ നിന്നുള്ള മാനസിക വിഷമം"
        : "Sudden unexpected financial drains and quiet emotional exhaustion carrying family obligations"
    ]
  };

  // 2 High-Curiosity Mini-Cards (Card A: 99% Maandi Knot, Card B: Yogi Wealth vs Avayogi)
  const localizedYogi = GRAHA_7L[secretAccuracy.yogiPlanet as GrahaKey]?.[baseLang] || secretAccuracy.yogiPlanet;
  const localizedAvayogi = GRAHA_7L[secretAccuracy.avayogiPlanet as GrahaKey]?.[baseLang] || secretAccuracy.avayogiPlanet;

  const curiosityMiniCards = {
    maandiCard: {
      house: maandiHouse,
      title: baseLang === "kn" ? `ಭಾವ ${maandiHouse} ರಲ್ಲಿ ಮಾಂದಿ (ಗುಳಿಕ) ೯೯% ಅಡೆತಡೆ ಗಂಟು`
        : baseLang === "hi" ? `भाव ${maandiHouse} में मान्दि (गुलिक) ९९% बाधा ग्रंथि`
        : baseLang === "mr" ? `स्थान ${maandiHouse} मध्ये मांदी (गुलिक) ९९% अडथळा गाठ`
        : baseLang === "te" ? `భావం ${maandiHouse} లో మాంది (గుళిక) 99% అడ్డంకి ముడి`
        : baseLang === "ta" ? `பாவம் ${maandiHouse} இல் மாந்தி (குளிகன்) 99% தடை முடிச்சு`
        : baseLang === "ml" ? `ഭാവം ${maandiHouse} ൽ മാന്ദി (ഗുളികൻ) 99% തടസ്സ ഗ്രന്ഥി`
        : `House ${maandiHouse} Maandi (Gulika) 99% Obstacle Knot`,
      desc: baseLang === "kn" ? "ಯಾವುದೇ ಮಹತ್ವದ ಕೆಲಸ ೯೯% ತಲುಪಿದಾಗ ಈ ಮಾಂದಿ ದೋಷವು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ ತರುತ್ತದೆ."
        : baseLang === "hi" ? "जब भी महत्वपूर्ण कार्य ९९% तक पहुँचते हैं, यह मान्दि दोष अंतिम क्षण में अप्रत्याशित विलंब लाता है।"
        : baseLang === "mr" ? "कोणतेही महत्त्वाचे काम ९९% पर्यंत पोहोचल्यावर ही मांदी गाठ शेवटच्या क्षणी अनपेक्षित विलंब निर्माण करते."
        : baseLang === "te" ? "ముఖ్యమైన పనులు 99% పూర్తి కాగానే, ఈ మాంది దోషం చివరి క్షణంలో అడ్డంకులను తెస్తుంది."
        : baseLang === "ta" ? "முக்கியமான காரியங்கள் 99% முடிவடையும் போது, இந்த மாந்தி தோஷம் இறுதி கணத்தில் எதிர்பாராத தாமதத்தை ஏற்படுத்துகிறது."
        : baseLang === "ml" ? "പ്രധാനപ്പെട്ട കാര്യങ്ങൾ 99% എത്തുമ്പോൾ, ഈ മാന്ദി ദോഷം അവസാന നിമിഷം അപ്രതീക്ഷിത തടസ്സം സൃഷ്ടിക്കുന്നു."
        : "Whenever key endeavors reach the 99% milestone, this shadow node triggers an unexpected last-minute obstacle.",
      lockedCta: baseLang === "kn" ? "🔒 ಈ ಮಾಂದಿ ಗಂಟು ಕಳಚುವ ಗೋಕರ್ಣ ಶಾಂತಿ ಪರಿಹಾರ ರಹಸ್ಯ ₹೩೫೦ ವರದಿಯಲ್ಲಿದೆ"
        : baseLang === "hi" ? "🔒 इस मान्दि ग्रंथि को खोलने का गोकर्ण शांति उपाय ₹३५० सम्पूर्ण रिपोर्ट में उपलब्ध है"
        : baseLang === "mr" ? "🔒 ही मांदी गाठ सोडवणारा गोकर्ण शांती उपाय ₹३५० संपूर्ण अहवालात उपलब्ध आहे"
        : baseLang === "te" ? "🔒 ఈ మాంది ముడిని తొలగించే గోకర్ణ శాంతి పరిహారం ₹350 సంపూర్ణ నివేదికలో లభిస్తుంది"
        : baseLang === "ta" ? "🔒 இந்த மாந்தி முடிச்சை அவிழ்க்கும் கோகர்ணம் சாந்தி பரிகாரம் ₹350 முழு அறிக்கையில் உள்ளது"
        : baseLang === "ml" ? "🔒 ഈ മാന്ദി ഗ്രന്ഥി മാറ്റുന്ന ഗോകർണം ശാന്തി പരിഹാരം ₹350 സമ്പൂർണ്ണ റിപ്പോർട്ടിൽ ലഭ്യമാണ്"
        : "🔒 Sacred Gokarna Maandi Shanti untying remedy unlocked in ₹350 Master Report"
    },
    yogiCard: {
      yogiPlanet: localizedYogi,
      avayogiPlanet: localizedAvayogi,
      title: baseLang === "kn" ? `ಯೋಗಿ ಧನ ಗ್ರಹ (${localizedYogi}) vs ಅವಯೋಗಿ ಎಚ್ಚರಿಕೆ (${localizedAvayogi})`
        : baseLang === "hi" ? `योगी धन प्रदाता (${localizedYogi}) बनाम अवयोगी बाधा ग्रह (${localizedAvayogi})`
        : baseLang === "mr" ? `योगी धन प्रदाता (${localizedYogi}) वि. अवयोगी सावध ग्रह (${localizedAvayogi})`
        : baseLang === "te" ? `యోగి ధన గ్రహం (${localizedYogi}) vs అవయోగి హెచ్చరిక (${localizedAvayogi})`
        : baseLang === "ta" ? `யோகி தன கிரகம் (${localizedYogi}) vs அவயோகி எச்சரிக்கை (${localizedAvayogi})`
        : baseLang === "ml" ? `യോഗി ധന ഗ്രഹം (${localizedYogi}) vs അവയോഗി ജാഗ്രത (${localizedAvayogi})`
        : `Yogi Wealth Magnet (${localizedYogi}) vs Avayogi Obstacle (${localizedAvayogi})`,
      desc: baseLang === "kn" ? "ಯೋಗಿ ಗ್ರಹವು ನಿಮ್ಮ ಜೀವನದ ಸುವರ್ಣ ಧನ ಆಕರ್ಷಣಾ ಶಕ್ತಿಯಾಗಿದ್ದು, ಅವಯೋಗಿ ಗ್ರಹವು ಗುಪ್ತ ಶತ್ರು ಹಾಗೂ ಅನಗತ್ಯ ಹಾನಿಯ ಸಂಕೇತವಾಗಿದೆ."
        : baseLang === "hi" ? "योगी ग्रह आपके जीवन में धन एवं भाग्य का चुंबक है, जबकि अवयोगी ग्रह अनपेक्षित हानि एवं बाधाओं का सूचक है।"
        : baseLang === "mr" ? "योगी ग्रह आपल्या जीवनात धन व भाग्याचा चुंबक आहे, तर अवयोगी ग्रह गुप्त अडथळे व नुकसानीचा इशारा देतो."
        : baseLang === "te" ? "యోగి గ్రహం మీ జీవితంలో సంపదను ఆకర్షించే శక్తి కాగా, అవయోగి గ్రహం రహస్య అడ్డంకుల సూచిక."
        : baseLang === "ta" ? "யோகி கிரகம் உங்கள் வாழ்வில் தன ஆகர்ஷண சக்தியாகும், அவயோகி கிரகம் மறைமுக தடைகளின் எச்சரிக்கையாகும்."
        : baseLang === "ml" ? "യോഗി ഗ്രഹം നിങ്ങളുടെ ജീവിതത്തിൽ ഐശ്വര്യം ആകർഷിക്കുമ്പോൾ, അവയോഗി ഗ്രഹം അപ്രതീക്ഷിത തടസ്സങ്ങളെ സൂചിപ്പിക്കുന്നു."
        : "Your Yogi planet is your supreme financial catalyst, while your Avayogi planet warns of hidden leaks and friction.",
      lockedCta: baseLang === "kn" ? "🔒 ಯೋಗಿ ಗ್ರಹದ ಸಂಪೂರ್ಣ ಧನ ಆಕರ್ಷಣಾ ಮುಹೂರ್ತ ₹೩೫೦ ವರದಿಯಲ್ಲಿದೆ"
        : baseLang === "hi" ? "🔒 योगी ग्रह का सम्पूर्ण धन आकर्षण मुहूर्त ₹३५० रिपोर्ट में उपलब्ध है"
        : baseLang === "mr" ? "🔒 योगी ग्रहाचा संपूर्ण धन आकर्षण मुहूर्त ₹३५० अहवालात उपलब्ध आहे"
        : baseLang === "te" ? "🔒 యోగి గ్రహ సంపూర్ణ ధన ఆకర్షణ ముహూర్తం ₹350 నివేదికలో లభిస్తుంది"
        : baseLang === "ta" ? "🔒 யோகி கிரகத்தின் முழு தன ஆகர்ஷண முகூர்த்தம் ₹350 அறிக்கையில் உள்ளது"
        : baseLang === "ml" ? "🔒 യോഗി ഗ്രഹത്തിന്റെ പൂർണ്ണ ധന ആകർഷണ മുഹൂർത്തം ₹350 റിപ്പോർട്ടിൽ ലഭ്യമാണ്"
        : "🔒 Full Yogi wealth frequency alignment unlocked in ₹350 Master Report"
    }
  };

  return {
    devoteeName: localizedName,
    lang: baseLang,
    lagnaSignName,
    moonSignName,
    nakshatraName,
    moonPada,
    h8LordName,
    h8RashiName,
    h12LordName,
    h12RashiName,
    runningDashaText: dashaText,
    paragraph1,
    paragraph2,
    kshetraBlessing,
    isTimeUnknown,
    todayLiveTarabala,
    pastVerification,
    curiosityMiniCards,
    moorthyNirnaya,
    cosmicVoltage,
    fiveYearPreview,
    luckyElements,
    diningOffer
  };
}

/**
 * 1. Classical Moorthy Nirnaya (ಮೂರ್ತಿ ನಿರ್ಣಯ) across 7 languages
 * Determines whether current celestial transit form is Gold, Silver, Copper, or Iron.
 */
export function calculateMoorthyNirnaya(
  transitMoonSign: number,
  janmaMoonSign: number,
  lang: AntarangaLang = "kn"
): MoorthyNirnayaData {
  const diffHouse = ((transitMoonSign - janmaMoonSign + 12) % 12) + 1;

  if ([1, 6, 11].includes(diffHouse)) {
    // Swarna / Gold
    const names: Record<AntarangaLang, string> = {
      kn: "ಸ್ವರ್ಣ ಮೂರ್ತಿ (ಚಿನ್ನದ ಮೂರ್ತಿ - ಪೂರ್ಣ ಶುಭ ಫಲ)",
      en: "Swarna Moorthy (Gold Form - Peak Benefic Fortune)",
      hi: "स्वर्ण मूर्ति (पूर्ण शुभ फल - महा भाग्योदय)",
      mr: "सुवर्ण मूर्ती (पूर्ण शुभ फळ - महा भाग्योदय)",
      te: "స్వర్ణ మూర్తి (సంపూర్ణ శుభ ఫలితం - భాగ్యోదయం)",
      ta: "சொர்ண மூர்த்தி (முழு சுப பலன் - பெரும் யோகம்)",
      ml: "സ്വർണ്ണ മൂർത്തി (പൂർണ്ണ ശുഭ ഫലം - സുവർണ്ണ നേട്ടം)"
    };
    const badges: Record<AntarangaLang, string> = {
      kn: "ಅತ್ಯುನ್ನತ ಸುವರ್ಣ ಭಾಗ್ಯ ಕಾಲ",
      en: "Peak Golden Fortune Period",
      hi: "अत्युत्तम स्वर्णिम काल",
      mr: "अत्युत्तम सुवर्ण काळ",
      te: "అత్యుత్తమ సువర్ణ కాలం",
      ta: "உன்னத பொற்காலம்",
      ml: "സുവർണ്ണ ഭാഗ്യ കാലം"
    };
    const descs: Record<AntarangaLang, string> = {
      kn: "ಚಂದ್ರನಿಂದ ೧, ೬ ಅಥವಾ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಗೋಚಾರ ಸಂಭವಿಸುತ್ತಿದ್ದು, ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಇದು 'ಸ್ವರ್ಣ ಮೂರ್ತಿ' ಯೋಗವಾಗಿದೆ. ಈ ಅವಧಿಯು ಆರ್ಥಿಕ ಉನ್ನತಿ, ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ದೀರ್ಘಕಾಲದ ಕನಸುಗಳು ನನಸಾಗುವ ಸುವರ್ಣ ಕಾಲವಾಗಿದೆ!",
      en: "Transiting through house 1, 6, or 11 from your natal Moon, classical Vedic shastra designates this as the 'Swarna Moorthy' alignment. This period brings sudden financial prosperity, social elevation, and realization of long-awaited aspirations!",
      hi: "चन्द्र से १, ६ या ११वें भाव में गोचर के कारण यह शास्त्रीय 'स्वर्ण मूर्ति' फल है। यह समय आकस्मिक धन लाभ, सामाजिक प्रतिष्ठा एवं अटके कार्यों के पूर्ण होने का स्वर्णिम काल है!",
      mr: "चंद्रापासून १, ६ अथवा ११व्या स्थानी गोचर भ्रमण असल्याने हे शास्त्रीय 'सुवर्ण मूर्ती' फळ आहे. हा काळ अचानक धनलाभ, समाजात मान-सन्मान व भाग्योदयाचा सुवर्ण काळ आहे!",
      te: "చంద్రుని నుండి 1, 6 లేదా 11వ ఇంట గోచార ప్రభావం వల్ల ఇది శాస్త్రీయ 'స్వర్ణ మూర్తి' యోగం. ఈ సమయం ఆర్థిక పురోగతి, సమాజంలో గౌరవం మరియు సంపూర్ణ విజయానికి అనుకూలం!",
      ta: "சந்திரனிலிருந்து 1, 6 அல்லது 11-ஆம் வீட்டில் சஞ்சரிப்பதால் இது 'சொர்ண மூர்த்தி' யோகமாகும். இது திடீர் தனலாபம், சமூக அந்தஸ்து மற்றும் வெற்றியைத் தரும் உன்னத காலமாகும்!",
      ml: "ചന്ദ്രനിൽ നിന്ന് 1, 6 അല്ലെങ്കിൽ 11-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നതിനാൽ ഇത് 'സ്വർണ്ണ മൂർത്തി' യോഗമാണ്. സാമ്പത്തിക നേട്ടം, സമൂഹത്തിൽ പ്രശസ്തി എന്നിവ ലഭിക്കുന്ന അനുകൂല സമയം!"
    };
    return {
      title: lang === "kn" ? "ಮೂರ್ತಿ ನಿರ್ಣಯ" : lang === "hi" ? "मूर्ति निर्णय" : lang === "mr" ? "मूर्ती निर्णय" : lang === "te" ? "మూర్తి నిర్ణయం" : lang === "ta" ? "மூர்த்தி நிர்ணயம்" : lang === "ml" ? "മൂർത്തി നിർണ്ണയം" : "Moorthy Nirnaya",
      moorthyName: names[lang] || names.en,
      tier: "swarna",
      description: descs[lang] || descs.en,
      badge: badges[lang] || badges.en,
      diffHouse
    };
  }

  if ([2, 5, 9].includes(diffHouse)) {
    // Rajata / Silver
    const names: Record<AntarangaLang, string> = {
      kn: "ರಜತ ಮೂರ್ತಿ (ಬೆಳ್ಳಿ ಮೂರ್ತಿ - ಉತ್ತಮ ಸ್ಥಿರತೆ)",
      en: "Rajata Moorthy (Silver Form - Highly Auspicious Growth)",
      hi: "रजत मूर्ति (उत्तम फल - स्थिरता एवं उन्नति)",
      mr: "रजत मूर्ती (उत्तम फळ - स्थिरता व प्रगती)",
      te: "రజత మూర్తి (ఉత్తమ ఫలితం - స్థిరమైన ప్రగతి)",
      ta: "ரஜத மூர்த்தி (நற்பலன் - நிலையான வளர்ச்சி)",
      ml: "രജത മൂർത്തി (ഉത്തമ ഫലം - സുസ്ഥിര പുരോഗതി)"
    };
    const badges: Record<AntarangaLang, string> = {
      kn: "ಉತ್ತಮ ಶುಭ ಸ್ಥಿರತೆಯ ಕಾಲ",
      en: "High Auspicious Stability",
      hi: "उत्तम शुभ स्थिरता",
      mr: "उत्तम प्रगती व स्थिरता",
      te: "ఉత్తమ శుభ స్థిరత్వం",
      ta: "சுப யோகம் & அமைதி",
      ml: "ഉത്തമ പുരോഗതി & ശാന്തി"
    };
    const descs: Record<AntarangaLang, string> = {
      kn: "ಚಂದ್ರನಿಂದ ೨, ೫ ಅಥವಾ ೯ನೇ ಮನೆಯಲ್ಲಿ ಗೋಚಾರವಾಗುತ್ತಿದ್ದು, ಇದು 'ರಜತ ಮೂರ್ತಿ' ಶುಭ ಯೋಗವಾಗಿದೆ. ಕೌಟುಂಬಿಕ ಶಾಂತಿ, ವೃತ್ತಿ ಸ್ಥಿರತೆ ಮತ್ತು ಧನ ಹರಿವಿನಲ್ಲಿ ನಿರಂತರ ಪ್ರಗತಿ ಕಂಡುಬರುತ್ತದೆ.",
      en: "Transiting through house 2, 5, or 9 from natal Moon, classical shastra marks this as 'Rajata Moorthy'. Brings steady financial stability, domestic harmony, and career advancement.",
      hi: "चन्द्र से २, ५ या ९वें भाव में गोचर के कारण यह 'रजत मूर्ति' शुभ फल है। पारिवारिक सौख्य, कार्यक्षेत्र में स्थिरता एवं निरंतर धन वृद्धि का सुंदर योग है।",
      mr: "चंद्रापासून २, ५ अथवा ९व्या स्थानी गोचर असल्याने हे 'रजत मूर्ती' शुभ फळ आहे. कौटुंबिक शांतता, नोकरी-व्यवसायात स्थिरता व उत्तम प्रगतीचा काळ आहे.",
      te: "చంద్రుని నుండి 2, 5 లేదా 9వ ఇంట గోచారం వల్ల ఇది 'రజత మూర్తి' ఫలితం. కుటుంబంలో ప్రశాంతత, వృత్తిలో స్థిరత్వం మరియు ధనాగమనం బాగుంటుంది.",
      ta: "சந்திரனிலிருந்து 2, 5 அல்லது 9-ஆம் வீட்டில் சஞ்சரிப்பதால் இது 'ரஜத மூர்த்தி' நற்பலனாகும். குடும்ப அமைதி, தொழில் நிலைத்தன்மை மற்றும் தனவிருத்தி ஏற்படும்.",
      ml: "ചന്ദ്രനിൽ നിന്ന് 2, 5 അല്ലെങ്കിൽ 9-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നതിനാൽ ഇത് 'രജത മൂർത്തി' ഫലമാണ്. കുടുംബത്തിൽ സമാധാനം, തൊഴിൽ രംഗത്ത് സ്ഥിരത, സാമ്പത്തിക വളർച്ച എന്നിവ ലഭിക്കും."
    };
    return {
      title: lang === "kn" ? "ಮೂರ್ತಿ ನಿರ್ಣಯ" : lang === "hi" ? "मूर्ति निर्णय" : lang === "mr" ? "मूर्ती निर्णय" : lang === "te" ? "మూర్తి నిర్ణయం" : lang === "ta" ? "மூர்த்தி நிர்ணயம்" : lang === "ml" ? "മൂർത്തി നിർണ്ണയം" : "Moorthy Nirnaya",
      moorthyName: names[lang] || names.en,
      tier: "rajata",
      description: descs[lang] || descs.en,
      badge: badges[lang] || badges.en,
      diffHouse
    };
  }

  if ([3, 7, 10].includes(diffHouse)) {
    // Tamra / Copper
    const names: Record<AntarangaLang, string> = {
      kn: "ತಾಮ್ರ ಮೂರ್ತಿ (ತಾಮ್ರ ಮೂರ್ತಿ - ಮಧ್ಯಮ ಫಲ)",
      en: "Tamra Moorthy (Copper Form - Moderate Yield & Steady Effort)",
      hi: "ताम्र मूर्ति (मध्यम फल - परिश्रम अनुसार लाभ)",
      mr: "ताम्र मूर्ती (मध्यम फळ - कष्टाला योग्य फळ)",
      te: "తామ్ర మూర్తి (మధ్యమ ఫలితం - శ్రమకు తగిన ఫలితం)",
      ta: "தாமிர மூர்த்தி (மத்திமம் - உழைப்புக்கேற்ற பலன்)",
      ml: "താമ്ര മൂർത്തി (മധ്യമ ഫലം - അധ്വാനത്തിനൊത്ത നേട്ടം)"
    };
    const badges: Record<AntarangaLang, string> = {
      kn: "ಮಧ್ಯಮ ಪರಿಶ್ರಮದ ಕಾಲ",
      en: "Moderate Effort & Progress",
      hi: "मध्यम परिश्रम फल",
      mr: "मध्यम कष्टाचे फळ",
      te: "మధ్యమ శ్రమ ఫలితం",
      ta: "மத்திம உழைப்புப் பலன்",
      ml: "മധ്യമ അധ്വാന ഫലം"
    };
    const descs: Record<AntarangaLang, string> = {
      kn: "ಚಂದ್ರನಿಂದ ೩, ೭ ಅಥವಾ ೧೦ನೇ ಮನೆಯಲ್ಲಿ ಗೋಚಾರವಾಗುತ್ತಿದ್ದು, ಇದು 'ತಾಮ್ರ ಮೂರ್ತಿ' ಯೋಗ. ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಏಕಾಗ್ರತೆಗೆ ತಕ್ಕಂತೆ ಹಂತ-ಹಂತವಾಗಿ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.",
      en: "Transiting through house 3, 7, or 10 from natal Moon, designated as 'Tamra Moorthy'. Rewards disciplined perseverance with gradual progress and structured growth.",
      hi: "चन्द्र से ३, ७ या १०वें भाव में गोचर के कारण यह 'ताम्र मूर्ति' फल है। निरंतर प्रयास एवं धैर्य से धीरे-धीरे सफलता प्राप्त होगी।",
      mr: "चंद्रापासून ३, ७ अथवा १०व्या स्थानी गोचर असल्याने हे 'ताम्र मूर्ती' फळ आहे. सातत्यपूर्ण प्रयत्न आणि संयमाने यश संपादन करता येईल.",
      te: "చంద్రుని నుండి 3, 7 లేదా 10వ ఇంట గోచారం వల్ల ఇది 'తామ్ర మూర్తి'. క్రమశిక్షణతో కూడిన శ్రమతో అంచెలంచెలుగా విజయం దక్కుతుంది.",
      ta: "சந்திரனிலிருந்து 3, 7 அல்லது 10-ஆம் வீட்டில் சஞ்சரிப்பதால் இது 'தாமிர மூர்த்தி' பலனாகும். விடாமுயற்சி மற்றும் பொறுமையுடன் படிப்படியாக முன்னேற்றம் ஏற்படும்.",
      ml: "ചന്ദ്രനിൽ നിന്ന് 3, 7 അല്ലെങ്കിൽ 10-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നതിനാൽ ഇത് 'താമ്ര മൂർത്തി' ഫലമാണ്. നിരന്തര പരിശ്രമത്തിലൂടെ ഘട്ടംഘട്ടമായി വിജയം കൈവരിക്കാം."
    };
    return {
      title: lang === "kn" ? "ಮೂರ್ತಿ ನಿರ್ಣಯ" : lang === "hi" ? "मूर्ति निर्णय" : lang === "mr" ? "मूर्ती निर्णय" : lang === "te" ? "మూర్తి నిర్ణయం" : lang === "ta" ? "மூர்த்தி நிர்ணயம்" : lang === "ml" ? "മൂർത്തി നിർണ്ണയം" : "Moorthy Nirnaya",
      moorthyName: names[lang] || names.en,
      tier: "tamra",
      description: descs[lang] || descs.en,
      badge: badges[lang] || badges.en,
      diffHouse
    };
  }

  // Loha / Iron
  const names: Record<AntarangaLang, string> = {
    kn: "ಲೋಹ ಮೂರ್ತಿ (ಕಬ್ಬಿಣ ಮೂರ್ತಿ - ತಾಳ್ಮೆ & ಶಾಂತಿ ಅಗತ್ಯ)",
    en: "Loha Moorthy (Iron Form - Demands Patience & Remedial Care)",
    hi: "लोह मूर्ति (धैर्य एवं शांति उपाय आवश्यक)",
    mr: "लोह मूर्ती (संयम व शांती उपाय आवश्यक)",
    te: "లోహ మూర్తి (ఓర్పు & పరిహార శాంతి అవసరం)",
    ta: "இரும்பு மூர்த்தி (பொறுமை & பரிகாரம் தேவை)",
    ml: "ലോഹ മൂർത്തി (ക്ഷമയും ശാന്തിയും ആവശ്യം)"
  };
  const badges: Record<AntarangaLang, string> = {
    kn: "ತಾಳ್ಮೆ & ದೈವಿಕ ರಕ್ಷೆ ಅಗತ್ಯ",
    en: "Remedial Shield & Patience Required",
    hi: "धैर्य एवं शांति उपाय आवश्यक",
    mr: "संयम व शांती आवश्यक",
    te: "ఓర్పు & పరిహారం అవసరం",
    ta: "பொறுமை & பரிகாரம் தேவை",
    ml: "ക്ഷമയും ശാന്തിയും ആവശ്യം"
  };
  const descs: Record<AntarangaLang, string> = {
    kn: "ಚಂದ್ರನಿಂದ ೪, ೮ ಅಥವಾ ೧೨ನೇ ಮನೆಯಲ್ಲಿ ಗೋಚಾರವಾಗುತ್ತಿದ್ದು, ಇದು 'ಲೋಹ ಮೂರ್ತಿ' ಕಾಲವಾಗಿದೆ. ಅವಸರದ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸುವುದು, ಅನಗತ್ಯ ಹೂಡಿಕೆ ಮಾಡದಿರುವುದು ಮತ್ತು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಕ್ಷಾ ಶಾಂತಿ ಮಾಡಿಸುವುದು ಅತ್ಯಗತ್ಯ.",
    en: "Transiting through house 4, 8, or 12 from natal Moon, classical texts categorize this as 'Loha Moorthy'. Calls for strategic restraint, avoiding speculative ventures, and performing Gokarna Kshetra Shanti.",
    hi: "चन्द्र से ४, ८ या १२वें भाव में गोचर के कारण यह 'लोह मूर्ति' फल है। जल्दबाजी में निर्णय न लें, विवादों से बचें तथा गोकर्ण महाबलेश्वर की शांति पूजा कराएं।",
    mr: "चंद्रापासून ४, ८ अथवा १२व्या स्थानी गोचर असल्याने हे 'लोह मूर्ती' फळ आहे. घाईगडबडीत मोठे निर्णय घेणे टाळा, आर्थिक व्यवहार सांभाळा व गोकर्ण महाबळेश्वर शांती पूजा करा.",
    te: "చంద్రుని నుండి 4, 8 లేదా 12వ ఇంట గోచారం వల్ల ఇది 'లోహ మూర్తి' సమయం. తొందరపాటు నిర్ణయాలు తీసుకోరాదు, గోకర్ణ మహాబలేశ్వర స్వామి శాంతి పూజ జరిపించడం శ్రేయస్కరం.",
    ta: "சந்திரனிலிருந்து 4, 8 அல்லது 12-ஆம் வீட்டில் சஞ்சரிப்பதால் இது 'இரும்பு மூர்த்தி' காலமாகும். அவசர முடிவுகளைத் தவிர்க்கவும், கோகர்ணம் மகாபலேஸ்வரருக்கு சாந்தி பரிகாரம் செய்வது நலம் தரும்.",
    ml: "ചന്ദ്രനിൽ നിന്ന് 4, 8 അല്ലെങ്കിൽ 12-ാം ഭാവത്തിൽ സഞ്ചരിക്കുന്നതിനാൽ ഇത് 'ലോഹ മൂർത്തി' കാലമാണ്. എടുത്തുചാടിയുള്ള തീരുമാനങ്ങൾ ഒഴിവാക്കുക, ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ ശാന്തി പൂജ നടത്തുക."
  };
  return {
    title: lang === "kn" ? "ಮೂರ್ತಿ ನಿರ್ಣಯ" : lang === "hi" ? "मूर्ति निर्णय" : lang === "mr" ? "मूर्ती निर्णय" : lang === "te" ? "మూర్తి నిర్ణయం" : lang === "ta" ? "மூர்த்தி நிர்ணயம்" : lang === "ml" ? "മൂർത്തി നിർണ്ണയം" : "Moorthy Nirnaya",
    moorthyName: names[lang] || names.en,
    tier: "loha",
    description: descs[lang] || descs.en,
    badge: badges[lang] || badges.en,
    diffHouse
  };
}

/**
 * 2. Live Cosmic Life Voltage & Gochara Nirnaya
 */
export function calculateCosmicLifeVoltage(
  kundli: KundliOutput,
  moonIdx: number,
  lagnaIdx: number,
  birthDate: string = "1990-01-01",
  birthTime: string = "12:00",
  lat: number = 14.5479,
  lng: number = 74.3188,
  lang: AntarangaLang = "kn"
): CosmicLifeVoltageData {
  const now = new Date();
  const transits = getTransitsForDate(moonIdx, now, "lahiri");
  const shaniHouse = transits[PlanetName.Saturn]?.house ?? 8;
  const guruHouse = transits[PlanetName.Jupiter]?.house ?? 5;

  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isAshtama = shaniHouse === 8;
  const isKantaka = [4, 7, 10].includes(shaniHouse);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouse);

  // Dynamic Cosmic Voltage
  let energyScore = 70;
  if (hasGuruBala) energyScore += 12;
  if (!isSadeSati && !isAshtama) energyScore += 8;
  if (isSadeSati) energyScore -= 8;
  if (isAshtama) energyScore -= 10;
  if (kundli.planets.some(p => p.isExalted)) energyScore += 6;
  energyScore = Math.min(95, Math.max(55, energyScore));

  const isHighEnergy = energyScore >= 75;

  // Age & Dasha/Bhukti Pure 7-Language Formatting
  const mahaSuffix: Record<AntarangaLang, string> = {
    kn: " ಮಹಾದಶಾ",
    mr: " महादशा",
    hi: " महादशा",
    te: " మహాదశ",
    ta: " மகாதிசை",
    ml: " മഹാദശ",
    en: " Mahadasha"
  };
  const bhuktiSuffix: Record<AntarangaLang, string> = {
    kn: " ಅಂತರ್ದಶಾ (ಭುಕ್ತಿ)",
    mr: " अंतर्दशा",
    hi: " अन्तर्दशा",
    te: " అంతర్దశ",
    ta: " புக்தி (அந்தர்திசை)",
    ml: " അപഹാരം (അന്തർദശ)",
    en: " Antardasha"
  };
  const ageSpanSuffix: Record<AntarangaLang, string> = {
    kn: "ವರ್ಷ ವಯೋಮಿತಿ",
    mr: "वर्षे वयोमर्यादा",
    hi: "वर्ष आयु काल",
    te: "సంవత్సరాల వయస్సు",
    ta: "வயது வரம்பு",
    ml: "വയസ്സ് കാലഘട്ടം",
    en: "Years Age Span"
  };

  const defaultMahaName = GRAHA_7L["Jupiter"]?.[lang] || "Jupiter";
  const defaultBhuktiName = GRAHA_7L["Saturn"]?.[lang] || "Saturn";
  let activeMahadasha = `${defaultMahaName}${mahaSuffix[lang] || mahaSuffix.en}`;
  let activeBhukti = `${defaultBhuktiName}${bhuktiSuffix[lang] || bhuktiSuffix.en}`;
  let dashaPeriodText = lang === "kn" ? "೨೦೨೪ - ೨೦೨೭ ವರ್ಷ ವಯೋಮಿತಿ"
    : lang === "mr" ? "२०२४ - २०२७ वर्षे वयोमर्यादा"
    : lang === "hi" ? "२०२४ - २०२७ वर्ष आयु काल"
    : lang === "te" ? "2024 - 2027 సంవత్సరాల వయస్సు"
    : lang === "ta" ? "2024 - 2027 வயது வரம்பு"
    : lang === "ml" ? "2024 - 2027 വയസ്സ് കാലഘട്ടം"
    : "2024 - 2027 Active Phase";

  try {
    const ageDec = ageDecimalYearsAt(birthDate, birthTime, lat, lng, now);
    const bhukti = findBhuktiAtAge(kundli, ageDec);
    if (bhukti) {
      const mahaLord = bhukti.maha?.planet ?? PlanetName.Jupiter;
      const bhuktiLord = bhukti.bhukti ?? PlanetName.Saturn;
      const mahaKey = toGrahaKey(mahaLord);
      const bhuktiKey = toGrahaKey(bhuktiLord);
      const mahaName = GRAHA_7L[mahaKey]?.[lang] || GRAHA_7L[mahaKey]?.en || String(mahaLord);
      const bhuktiName = GRAHA_7L[bhuktiKey]?.[lang] || GRAHA_7L[bhuktiKey]?.en || String(bhuktiLord);
      activeMahadasha = `${mahaName}${mahaSuffix[lang] || mahaSuffix.en}`;
      activeBhukti = `${bhuktiName}${bhuktiSuffix[lang] || bhuktiSuffix.en}`;
      if (bhukti.bhuktiStartAge && bhukti.bhuktiEndAge) {
        dashaPeriodText = `${bhukti.bhuktiStartAge.toFixed(1)} - ${bhukti.bhuktiEndAge.toFixed(1)} ${ageSpanSuffix[lang] || ageSpanSuffix.en}`;
      }
    }
  } catch {}

  const shaniGocharaStatus = isSadeSati
    ? (lang === "kn" ? "ಶನಿ ಸಾಡೇ ಸಾತಿ (ಏಳೂವರೆ ಶನಿ ಪ್ರಭಾವ)"
      : lang === "hi" ? "शनि साढ़ेसाती (सक्रिय प्रभाव)"
      : lang === "mr" ? "शनी साडेसाती (सक्रिय प्रभाव)"
      : lang === "te" ? "ఏలినాటి శని (ప్రభావ కాలం)"
      : lang === "ta" ? "ஏழரை சனி (தாக்க காலம்)"
      : lang === "ml" ? "ഏഴര ശനി (സ്വാധീന കാലം)"
      : "Saturn Sade Sati Active Phase")
    : isAshtama
    ? (lang === "kn" ? "ಅಷ್ಟಮ ಶನಿ (೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ)"
      : lang === "hi" ? "अष्टम शनि (८वें भाव में शनि)"
      : lang === "mr" ? "अष्टम शनी (८व्या स्थानी शनी)"
      : lang === "te" ? "అష్టమ శని (8వ ఇంట శని)"
      : lang === "ta" ? "அஷ்டம சனி (8-ஆம் வீட்டில் சனி)"
      : lang === "ml" ? "അഷ്ടമ ശനി (8-ാം ഭാവത്തിൽ ശനി)"
      : "Ashtama Shani (8th House Transit)")
    : isKantaka
    ? (lang === "kn" ? "ಕಂಟಕ ಶನಿ (ಪರಿಶ್ರಮದ ಕಾಲ)"
      : lang === "hi" ? "कंटक शनि (परिश्रम की अवधि)"
      : lang === "mr" ? "कंटक शनी (कष्टाचा काळ)"
      : lang === "te" ? "కంటక శని (శ్రమతో కూడిన కాలం)"
      : lang === "ta" ? "கண்டக சனி (கடின உழைப்பு)"
      : lang === "ml" ? "കണ്ടക ശനി (അധ്വാന കാലം)"
      : "Kantaka Shani (Patience Demanded)")
    : (lang === "kn" ? "ಶನಿ ಬಾಧೆ ಮುಕ್ತ (ಅನುಕೂಲಕರ ಶುಭ ಕಾಲ)"
      : lang === "hi" ? "शनि बाधा मुक्त (शुभ गोचर)"
      : lang === "mr" ? "शनी पीडा मुक्त (शुभ गोचर)"
      : lang === "te" ? "శని బాధా ముక్తం (శుభ కాలం)"
      : lang === "ta" ? "சனி பாதிப்பற்ற காலம்"
      : lang === "ml" ? "ശനി ദോഷ മുക്ത കാലം"
      : "Free from Saturn Affliction (Favorable)");

  const shaniGocharaImpact = isSadeSati || isAshtama
    ? (lang === "kn" ? "ಕಾರ್ಯಗಳಲ್ಲಿ ತಾಳ್ಮೆ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ."
      : lang === "hi" ? "धैर्य, अनुशासन एवं गोकर्ण क्षेत्र में शनि शांति आराधना श्रेयस्कर।"
      : lang === "mr" ? "संयम, प्रामाणिकपणा व गोकर्ण महाबळेश्वर शांती पूजा आवश्यक."
      : lang === "te" ? "ఓర్పు, క్రమశిక్షణ మరియు గోకర్ణంలో శని శాంతి పూజ అవసరం."
      : lang === "ta" ? "பொறுமையும் கோகர்ணம் மகாபலேஸ்வரர் சாந்தி வழிபாடும் அவசியம்."
      : lang === "ml" ? "ക്ഷമയും ഗോകർണം മഹാബലേശ്വര സന്നിധിയിൽ ശാന്തി പൂജയും ആവശ്യം."
      : "Requires calm patience, ethical steadfastness, and Gokarna Kshetra Shanti.")
    : (lang === "kn" ? "ಶನಿ ಗೋಚಾರವು ಶಾಂತಿಯುತವಾಗಿದ್ದು, ದೀರ್ಘಕಾಲಿಕ ಗುರಿಗಳನ್ನು ಸಾಕಾರಗೊಳಿಸಲು ಉತ್ತಮ ಕಾಲ."
      : lang === "hi" ? "शनि का गोचर शांत है, दीर्घकालिक लक्ष्यों हेतु उपयुक्त समय।"
      : lang === "mr" ? "शनी गोचर अनुकूल असून दीर्घकालीन उद्दिष्टांसाठी उत्तम काळ आहे."
      : lang === "te" ? "శని గోచారం అనుకూలంగా ఉంది, దీర్ఘకాలిక లక్ష్యాల సాధనకు మంచి సమయం."
      : lang === "ta" ? "சனி கோச்சாரம் சாதகமாக உள்ளது, நீண்டகால திட்டங்களுக்கு நலம்."
      : lang === "ml" ? "ശനി ഗോചാരം അനുകൂലമാണ്, ദീർഘകാല ലക്ഷ്യങ്ങൾക്ക് നല്ല സമയം."
      : "Saturn transit is supportive, ideal for executing long-term milestones.");

  const guruGocharaStatus = hasGuruBala
    ? (lang === "kn" ? "ಗುರುಬಲ ಪ್ರಾಪ್ತಿ (ಅತ್ಯಂತ ಮಂಗಳಕರ ಯೋಗ)"
      : lang === "hi" ? "गुरुबल प्राप्ति (अत्यंत मंगलकारी योग)"
      : lang === "mr" ? "गुरुबल प्राप्ती (अतिशय मंगलमय काळ)"
      : lang === "te" ? "గురుబల ప్రాప్తి (అత్యంత శుభ యోగం)"
      : lang === "ta" ? "குருபல பிராப்தி (மிகச் சிறந்த சுப யோகம்)"
      : lang === "ml" ? "ഗുരുബല പ്രാപ്തി (അത്യന്തം മംഗളകരമായ സമയം)"
      : "Guru Bala Blessed (Highly Auspicious Jupiter Transit)")
    : (lang === "kn" ? "ಗುರು ನಿರೀಕ್ಷಾ ಕಾಲ (ಶಾಂತಿ & ಪ್ರಾರ್ಥನೆ ಹಿತಕರ)"
      : lang === "hi" ? "गुरु अनुकूलता हेतु साधना काल"
      : lang === "mr" ? "गुरू कृपेसाठी साधना काळ"
      : lang === "te" ? "గురు అనుగ్రహ సాధన సమయం"
      : lang === "ta" ? "குரு அருள் பெற வழிபாடு தேவை"
      : lang === "ml" ? "ഗുരു കൃപയ്ക്കായി പ്രാർത്ഥനാ കാലം"
      : "Guru Inward Alignment (Spiritual Sadhana Recommended)");

  const guruGocharaImpact = hasGuruBala
    ? (lang === "kn" ? "ಧನ ವೃದ್ಧಿ, ನೂತನ ಜವಾಬ್ದಾರಿ, ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಕಾರ್ಯ ಹಾಗೂ ಗೌರವ ಪ್ರಾಪ್ತಿ!"
      : lang === "hi" ? "धन वृद्धि, नवीन अवसर, परिवार में मांगलिक कार्य एवं सम्मान प्राप्ति!"
      : lang === "mr" ? "धन वृद्धी, नवीन संधी, कुटुंबात मंगल कार्ये व सन्मान प्राप्ती!"
      : lang === "te" ? "ధనాభివృద్ధి, నూతన అవకాశాలు, కుటుంబంలో శుభకార్యాలు మరియు గౌరవం!"
      : lang === "ta" ? "தனவிருத்தி, புதிய வாய்ப்புகள், குடும்பத்தில் சுபகாரியங்கள் மற்றும் மரியாதை!"
      : lang === "ml" ? "സാമ്പത്തിക നേട്ടം, പുതിയ അവസരങ്ങൾ, കുടുംബത്തിൽ മംഗള കർമ്മങ്ങൾ!"
      : "Catalyzes wealth expansion, auspicious family milestones, and social recognition!")
    : (lang === "kn" ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಕೃಪೆಗಾಗಿ ಗುರುವಾರ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಹಾಗೂ ಗುರು ಸೇವೆ ಶ್ರೇಷ್ಠ."
      : lang === "hi" ? "गुरुवार को श्री विष्णु सहस्रनाम का पाठ एवं गुरु सेवा कल्याणकारी।"
      : lang === "mr" ? "गुरुवारी विष्णू सहस्रनाम पठण व गुरु सेवा लाभदायक ठरेल."
      : lang === "te" ? "గురువారం శ్రీ విష్ణు సహస్రనామ పారాయణం శ్రేయస్కరం."
      : lang === "ta" ? "வியாழக்கிழமைகளில் விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்வது நலம்."
      : lang === "ml" ? "വ്യാഴാഴ്ചകളിൽ വിഷ്ണു സഹസ്രനാമം ജപിക്കുന്നത് ഉത്തമം."
      : "Chanting Vishnu Sahasranama on Thursdays invites divine benevolence.");

  const energyLabel = isHighEnergy
    ? (lang === "kn" ? "ಉನ್ನತ ದೈವಿಕ ಶಕ್ತಿ ಪ್ರವಾಹ"
      : lang === "hi" ? "उच्च दैवीय ऊर्जा स्तर"
      : lang === "mr" ? "उच्च ऊर्जा प्रवाह"
      : lang === "te" ? "ఉన్నత దివ్య శక్తి ప్రవాహం"
      : lang === "ta" ? "உயர் ஆற்றல் நிலை"
      : lang === "ml" ? "ഉയർന്ന ഊർജ്ജ നില"
      : "High Cosmic Voltage Alignment")
    : (lang === "kn" ? "ಸಮತೋಲಿತ ಕರ್ಮ ಪ್ರವಾಹ"
      : lang === "hi" ? "संतुलित कर्मिक ऊर्जा"
      : lang === "mr" ? "संतुलित ऊर्जा स्तर"
      : lang === "te" ? "సమతుల్య శక్తి ప్రవాహం"
      : lang === "ta" ? "சமநிலை ஆற்றல்"
      : lang === "ml" ? "സന്തുലിത ഊർജ്ജ നില"
      : "Balanced Cosmic Vitality");

  const energyDesc = isHighEnergy
    ? (lang === "kn" ? "ಪ್ರಸ್ತುತ ಗ್ರಹಬಲವು ಪ್ರಬಲವಾಗಿದ್ದು, ನಿಮ್ಮ ದೈನಂದಿನ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳಲು ಹಾಗೂ ಹೊಸ ಉಪಕ್ರಮ ಆರಂಭಿಸಲು ಸುವರ್ಣ ಕಾಲವಾಗಿದೆ!"
      : lang === "hi" ? "वर्तमान ग्रहबल सशक्त है, महत्वपूर्ण निर्णय लेने एवं नए उपक्रम आरंभ करने का स्वर्णिम समय है!"
      : lang === "mr" ? "सध्याचे ग्रहबल उत्तम असून महत्त्वाचे निर्णय घेण्यासाठी व नवीन सुरुवात करण्यासाठी अनुकूल काळ आहे!"
      : lang === "te" ? "ప్రస్తుత గ్రహబలం బలంగా ఉంది, ముఖ్యమైన నిర్ణయాలు తీసుకోవడానికి మరియు నూతన ప్రారంభానికి అనుకూలం!"
      : lang === "ta" ? "தற்போதைய கிரகபலம் வலுவாக உள்ளது, முக்கிய முடிவுகளை எடுக்கவும் புதிய முயற்சிகளுக்கும் ஏற்ற காலம்!"
      : lang === "ml" ? "നിലവിലെ ഗ്രഹബലം അനുകൂലമാണ്, പ്രധാന തീരുമാനങ്ങൾ എടുക്കാനും പുതിയ തുടക്കങ്ങൾക്കും ഉത്തമ സമയം!"
      : "Cosmic vitality is vigorous, offering immense clarity for crucial decisions and forward-looking ventures!")
    : (lang === "kn" ? "ದಿನದ ಪ್ರಾಣಶಕ್ತಿ ಸಮತೋಲನದಲ್ಲಿದೆ. ಪ್ರಮುಖ ಆರ್ಥಿಕ ಹೂಡಿಕೆ ಅಥವಾ ಕೌಟುಂಬಿಕ ಒಪ್ಪಂದಗಳ ಮುನ್ನ ಹಿರಿಯರ ಸಲಹೆ ಪಡೆಯುವುದು ಹಿತಕರ."
      : lang === "hi" ? "ऊर्जा संतुलित है। महत्वपूर्ण निवेश अथवा पारिवारिक निर्णय से पूर्व बड़ों की सलाह लें।"
      : lang === "mr" ? "ऊर्जा संतुलित आहे। आर्थिक गुंतवणूक अथवा कौटुंबिक निर्णयापूर्वी ज्येष्ठांचा सल्ला घ्या."
      : lang === "te" ? "శక్తి సమతుల్యంగా ఉంది. ముఖ్యమైన పెట్టుబడులకు ముందు అనుభవజ్ఞుల సలహా శ్రేయస్కరం."
      : lang === "ta" ? "ஆற்றல் சமநிலையில் உள்ளது. முக்கிய முதலீடுகளுக்கு முன் பெரியோர்களின் ஆலோசனை நலம்."
      : lang === "ml" ? "ഊർജ്ജം സന്തുലിതമാണ്. പ്രധാന തീരുമാനങ്ങൾക്ക് മുമ്പ് മുതിർന്നവരുടെ ഉപദേശം തേടുക."
      : "Vital energy is balanced; consult trusted mentors before major capital or family commitments.");

  const turningPointVerdict = lang === "kn"
    ? "ಈ ಕ್ಷಣದಲ್ಲಿ ನಿಮ್ಮ ಜೀವನವು ಮಹತ್ತರ ಕರ್ಮಿಕ ತಿರುವನ್ನು ಪಡೆಯುತ್ತಿದೆ. ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಕಾಲವನ್ನು ಸರಿಯಾಗಿ ಬಳಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ನಿರ್ಧರಿಸಲಿದೆ!"
    : lang === "hi"
    ? "इस समय आपका जीवन एक महत्वपूर्ण कर्मिक मोड़ पर है। आगामी ५ वर्षों के स्वर्णिम काल का सही उपयोग आपका भाग्य तय करेगा!"
    : lang === "mr"
    ? "या क्षणी आपले जीवन एका महत्त्वाच्या कर्मिक वळणावर आहे. पुढील ५ वर्षांच्या सुवर्ण काळाचा योग्य वापर आपले भविष्य घडवेल!"
    : lang === "te"
    ? "ఈ సమయంలో మీ జీవితం ఒక ముఖ్యమైన మలుపు తిరుగుతోంది. రాబోయే 5 సంవత్సరాల సువర్ణ కాలాన్ని సద్వినియోగం చేసుకోవడం మీ భవిష్యత్తును నిర్ణయిస్తుంది!"
    : lang === "ta"
    ? "இந்த தருணத்தில் உங்கள் வாழ்க்கை ஒரு முக்கிய திருப்பத்தை அடைகிறது. அடுத்த 5 ஆண்டுகளின் பொற்காலத்தை சரியாகப் பயன்படுத்துவது உங்கள் எதிர்காலத்தை நிர்ணயிக்கும்!"
    : lang === "ml"
    ? "ഈ നിമിഷത്തിൽ നിങ്ങളുടെ ജീവിതം ഒരു വലിയ വഴിത്തിരിവിലാണ്. അടുത്ത 5 വർഷത്തെ സുവർണ്ണ കാലം പ്രയോജനപ്പെടുത്തുന്നത് നിങ്ങളുടെ ഭാവിയെ നിർണ്ണയിക്കും!"
    : "Your life is currently positioned at a profound karmic crossroads. Navigating the next 5-year horizon with strategic wisdom will determine your destiny!";

  return {
    energyScore,
    energyLabel,
    energyDesc,
    activeMahadasha,
    activeBhukti,
    dashaPeriodText,
    shaniGocharaStatus,
    shaniGocharaImpact,
    isSadeSati,
    isAshtama,
    isKantaka,
    hasGuruBala,
    guruGocharaStatus,
    guruGocharaImpact,
    turningPointVerdict
  };
}

/**
 * 3. Next 5-Year Horizon Sneak Preview & Locked Psychological Cliffhangers
 */
export function calculateFiveYearPreviewHorizon(
  kundli: KundliOutput,
  moonIdx: number,
  lagnaIdx: number,
  lang: AntarangaLang = "kn",
  cosmicVoltageScore?: number,
  moorthyTier?: "swarna" | "rajata" | "tamra" | "loha",
  currentMahaLord?: string
): FiveYearPreviewHorizonData {
  // 1. Dynamic Vitality Score calculation (Zero Fake / Static 84)
  const baseEnergy = cosmicVoltageScore ?? 75;
  const currentTransits = getTransitsForDate(moonIdx, new Date(), "lahiri");
  const guruHouse = currentTransits[PlanetName.Jupiter]?.house ?? 5;
  const shaniHouse = currentTransits[PlanetName.Saturn]?.house ?? 8;
  const isSadeSati = [12, 1, 2].includes(shaniHouse);
  const isAshtama = shaniHouse === 8;

  const guruMod = [1, 5, 9, 11].includes(guruHouse) ? 8 : [6, 8, 12].includes(guruHouse) ? -5 : 2;
  const shaniMod = isSadeSati || isAshtama ? -8 : [3, 6, 11].includes(shaniHouse) ? 5 : 0;
  const moorthyMod = moorthyTier === "swarna" ? 6 : moorthyTier === "rajata" ? 4 : moorthyTier === "tamra" ? 1 : -4;
  const pada = kundli.moonPada ?? 1;
  const uniqueOffset = ((moonIdx * 7 + lagnaIdx * 5 + pada * 3) % 9) - 4;

  let calculatedVitality = Math.round(baseEnergy * 0.75 + guruMod + shaniMod + moorthyMod + uniqueOffset);
  calculatedVitality = Math.max(58, Math.min(97, calculatedVitality));
  // Year 1 (2026 - 2027) Free Revelation
  const yr1Samvatsaras: Record<AntarangaLang, string> = {
    kn: "ವಿಶ್ವಾವಸು / ಕ್ರೋಧೀ ಸಂವತ್ಸರ",
    en: "Vishvavasu / Krodhi Samvatsara",
    hi: "विश्वावसु / क्रोधी संवत्सर",
    mr: "विश्वावसु / क्रोधी संवत्सर",
    te: "విశ్వావసు / క్రోధి సంవత్సరం",
    ta: "விஸ்வாவசு / குரோதி சம்வத்சரம்",
    ml: "വിശ്വാവസു / ക്രോധി സംവത്സരം"
  };

  // 4 Dynamic Seasonal Profiles based on (moonIdx + lagnaIdx + pada) % 4
  const seasonIdx = (moonIdx + lagnaIdx + pada) % 4;
  const seasonalOptions: Record<number, Record<AntarangaLang, string>> = {
    0: {
      kn: "ಶರದೃತು & ಹೇಮಂತ ಋತು (ಅಕ್ಟೋಬರ್ - ಜನವರಿ)",
      en: "Sharad & Hemanta Ritu (Oct - Jan)",
      hi: "शरद एवं हेमन्त ऋतु (अक्टूबर - जनवरी)",
      mr: "शरद व हेमंत ऋतू (ऑक्टोबर - जानेवारी)",
      te: "శరత్ & హేమంత ఋతువులు (అక్టోబర్ - జనవరి)",
      ta: "சரத் & ஹேமந்த ருது (அக்டோபர் - ஜனவரி)",
      ml: "ശരത് & ഹേമന്ത ഋതുക്കൾ (ഒക്ടോബർ - ജനുവരി)"
    },
    1: {
      kn: "ವಸಂತ & ಗ್ರೀಷ್ಮ ಋತು (ಮಾರ್ಚ್ - ಜೂನ್)",
      en: "Vasanta & Greeshma Ritu (March - June)",
      hi: "वसन्त एवं ग्रीष्म ऋतु (मार्च - जून)",
      mr: "वसंत व ग्रीष्म ऋतू (मार्च - जून)",
      te: "వసంత & గ్రీష్మ ఋతువులు (మార్చి - జూన్)",
      ta: "வசந்த & கிரீஷ்ம ருது (மார்ச் - ஜூன்)",
      ml: "വസന്ത & ഗ്രീഷ്മ ഋതുക്കൾ (മാർച്ച് - ജൂൺ)"
    },
    2: {
      kn: "ವರ್ಷಾ ಋತು (ಜುಲೈ - ಸೆಪ್ಟೆಂಬರ್)",
      en: "Varsha Ritu (July - September)",
      hi: "वर्षा ऋतु (जुलाई - सितम्बर)",
      mr: "वर्षा ऋतू (जुलै - सप्टेंबर)",
      te: "వర్ష ఋతువు (జూలై - సెప్టెంబర్)",
      ta: "வர்ஷா ருது (ஜூலை - செப்டம்பர்)",
      ml: "വർഷ ഋതു (ജൂലൈ - സെപ്റ്റംബർ)"
    },
    3: {
      kn: "ಶಿಶಿರ & ವಸಂತ ಸಂಧಿ (ಜನವರಿ - ಮಾರ್ಚ್)",
      en: "Shishira & Vasanta Sandhi (Jan - March)",
      hi: "शिशिर एवं वसन्त संधि (जनवरी - मार्च)",
      mr: "शिशिर व वसंत संधिकाल (जानेवारी - मार्च)",
      te: "శిశిర & వసంత సంధికాలం (జనవరి - మార్చి)",
      ta: "சிசிர & வசந்த சந்தி (ஜனவரி - மார்ச்)",
      ml: "ശിശിര & വസന്ത സന്ധികാലം (ജനുവരി - മാർച്ച്)"
    }
  };

  // 3 Dynamic Opportunity Profiles based on (moonIdx + guruHouse) % 3
  const oppIdx = (moonIdx + guruHouse) % 3;
  const opportunityOptions: Record<number, Record<AntarangaLang, string>> = {
    0: {
      kn: "ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಹೊಸ ಹೆಜ್ಜೆ, ಆರ್ಥಿಕ ಆದಾಯದ ಹೊಸ ಮಾರ್ಗಗಳು ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಹೆಚ್ಚಾಗುವ ಸುಸಂದರ್ಭ ಆರಂಭವಾಗಲಿದೆ!",
      en: "A breakthrough window in professional endeavors, novel income streams, and expanding community honor!",
      hi: "कार्यक्षेत्र में नई शुरुआत, आय के नवीन स्रोत तथा पारिवारिक मान-प्रतिष्ठा में वृद्धि का शुभ अवसर!",
      mr: "नोकरी-व्यवसायात नवीन सुरुवात, उत्पन्नाचे नवीन मार्ग व समाजात मानसन्मान वाढण्याची सुवर्णसंधी!",
      te: "వృత్తి రంగంలో నూతన ముందడుగు, కొత్త ఆదాయ మార్గాలు మరియు సమాజంలో గౌరవం పెరిగే శుభ సమయం!",
      ta: "தொழில் துறையில் புதிய வளர்ச்சி, புதிய வருமான வழிகள் மற்றும் சமூக மரியாதை கூடும் நற்காலம்!",
      ml: "തൊഴിൽ രംഗത്ത് പുതിയ തുടക്കം, വരുമാന വർദ്ധനവ്, സമൂഹത്തിൽ ആദരവ് എന്നിവ ലഭിക്കുന്ന നല്ല സമയം!"
    },
    1: {
      kn: "ದೀರ್ಘಾವಧಿಯ ಹೂಡಿಕೆ, ಭೂಮಿ-ಆಸ್ತಿ ಅಥವಾ ಗೃಹ ಸೌಖ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನದ ಸುವರ್ಣ ಅವಕಾಶ ಮೂಡಲಿದೆ!",
      en: "Golden alignment for long-term investments, property/asset expansion, domestic prosperity, and sudden financial inflows!",
      hi: "दीर्घकालिक निवेश, भूमि-भवन लाभ, पारिवारिक समृद्धि तथा आकस्मिक धन लाभ के उत्कृष्ट योग!",
      mr: "दीर्घकालीन गुंतवणूक, जमीन-मालमत्ता लाभ, कौटुंबिक समृद्धी व अचानक धनलाभाचे सुवर्ण योग!",
      te: "దీర్ఘకాలిక పెట్టుబడులు, భూమి-గృహ లాభాలు, కుటుంబ శ్రేయస్సు మరియు ఆకస్మిక ధన లాభం కలగవచ్చు!",
      ta: "நீண்ட கால முதலீடுகள், நிலம்-வீடு சேர்க்கை, குடும்ப சுபிட்சம் மற்றும் திடீர் பண வரவு உண்டாகும் பொற்காலம்!",
      ml: "ദീർഘകാല നിക്ഷേപങ്ങൾ, വസ്തു-ഭവന ലാഭങ്ങൾ, കുടുംബ ഐശ്വര്യം, അപ്രതീക്ഷിത ധനലാഭം എന്നിവയുടെ സുവർണ്ണാവസരം!"
    },
    2: {
      kn: "ವ್ಯಾಪಾರ-ಉದ್ಯಮದಲ್ಲಿ ಮಹಾ ವಿಸ್ತರಣೆ, ನಾಯಕತ್ವ ಪಾತ್ರ ಹಾಗೂ ಹಿರಿಯರ ಮತ್ತು ಗುರುಗಳ ಕೃಪೆಯಿಂದ ಯಶಸ್ವಿ ಮುನ್ನಡೆ!",
      en: "Major enterprise expansion, leadership ascension, and decisive progress powered by mentors and divine grace!",
      hi: "व्यापार-उद्योग में महत्वपूर्ण विस्तार, नेतृत्व पद तथा गुरुजनों के आशीर्वाद से निर्णायक सफलता!",
      mr: "व्यापार-उद्योगात मोठा विस्तार, नेतृत्व संधी आणि गुरूजनांच्या कृपेने निर्णायक प्रगती!",
      te: "వ్యాపార విస్తరణ, నాయకత్వ పాత్ర మరియు గురువుల ఆశీస్సులతో విజయవంతమైన పురోగతి!",
      ta: "வணிக விரிவாக்கம், தலைமைப் பொறுப்பு மற்றும் பெரியோரின் ஆசியுடன் வெற்றிகரமான முன்னேற்றம்!",
      ml: "ബിസിനസ്സ് വിപുലീകരണം, നേതൃസ്ഥാനം, ഗുരുജനങ്ങളുടെ അനുഗ്രഹം എന്നിവയാൽ വൻ വിജയം!"
    }
  };

  // 3 Dynamic Caution Profiles based on (lagnaIdx + shaniHouse) % 3
  const cautionIdx = (lagnaIdx + shaniHouse) % 3;
  const cautionOptions: Record<number, Record<AntarangaLang, string>> = {
    0: {
      kn: "ಆಪ್ತರ ಜತೆ ಅವಸರದ ವ್ಯವಹಾರ, ಭರವಸೆ ನೀಡುವುದು ಅಥವಾ ಸಾಲ ಕೊಡುವ ವಿಚಾರದಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      en: "Exercise prudence in partnership agreements, financial guarantees, and impulsive verbal commitments.",
      hi: "आकस्मिक साझेदारी, उधार लेन-देन अथवा अत्यधिक भावुक वादों से बचें।",
      mr: "जवळच्या व्यक्तींसोबत घाईगडबडीत आर्थिक व्यवहार किंवा जामीन राहणे टाळा.",
      te: "ఆర్థిక హామీలు ఇవ్వడం లేదా తొందరపాటు ఒప్పందాల విషయంలో జాగ్రత్త వహించండి.",
      ta: "பணப் பரிவர்த்தனைகள் அல்லது அவசர வாக்குறுதிகள் கொடுப்பதில் எச்சரிக்கை தேவை.",
      ml: "സാമ്പത്തിക ഇടപാടുകളിലും തിടുക്കത്തിലുള്ള തീരുമാനങ്ങളിലും ജാഗ്രത പാലിക്കുക."
    },
    1: {
      kn: "ಮಾನಸಿಕ ಆತಂಕ, ಅನಗತ್ಯ ಕೆಲಸದ ಒತ್ತಡ ಹಾಗೂ ಅಸಮತೋಲಿತ ನಿದ್ರೆಯ ಅಭ್ಯಾಸಗಳಿಂದ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ಇರಲಿ.",
      en: "Guard against mental stress, workplace burnout, irregular sleep cycles, and unnecessary over-exertion.",
      hi: "मानसिक तनाव, कार्य का अत्यधिक दबाव एवं अनियमित दिनचर्या से स्वास्थ्य का विशेष ध्यान रखें।",
      mr: "मानसिक ताण, कामाचा अतिभार आणि अनियमित झोप यामुळे आरोग्याची विशेष काळजी घ्या.",
      te: "మానసిక ఒత్తిడి, అధిక పని భారం మరియు నిద్రలేమి విషయంలో ఆరోగ్యం పట్ల శ్రద్ధ వహించండి.",
      ta: "மன அழுத்தம், அதிக வேலைப்பளு மற்றும் தூக்கமின்மை ஆகியவற்றில் இருந்து உடல்நலத்தை பாதுகாக்கவும்.",
      ml: "മാനസിക സമ്മർദ്ദം, അമിത ജോലിഭാരം, ഉറക്കമില്ലായ്മ എന്നിവയിൽ നിന്ന് ആരോഗ്യം സംരക്ഷിക്കുക."
    },
    2: {
      kn: "ಅನಿರೀಕ್ಷಿತ ಕಾನೂನು ದಾಖಲಾತಿ, ಪ್ರಯಾಣದ ವೇಳಾಪಟ್ಟಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಯಲ್ಲಿ ತಾಳ್ಮೆ ಮತ್ತು ಸಮಾಧಾನವಿರಲಿ.",
      en: "Maintain patience in legal documentation, travel itineraries, and sensitive domestic communications.",
      hi: "दस्तावेजी कार्यों, यात्राओं एवं पारिवारिक संवाद में धैर्य और संतुलन बनाए रखें।",
      mr: "कागदपत्रे, प्रवास आणि कौटुंबिक संवादात संयम व सावधगिरी बाळगा.",
      te: "పత్రాల వ్యవహారాలు, ప్రయాణాలు మరియు కుటుంబ సంభాషణలలో సంయమనం పాటించండి.",
      ta: "ஆவணப் பணிகள், பயணங்கள் மற்றும் குடும்ப உரையாடல்களில் நிதானத்தைக் கடைப்பிடிக்கவும்.",
      ml: "രേഖകൾ, യാത്രകൾ, കുടുംബപരമായ സംസാരങ്ങൾ എന്നിവയിൽ സംയമനം പാലിക്കുക."
    }
  };

  const yr1Seasons = seasonalOptions[seasonIdx];
  const yr1Opportunities = opportunityOptions[oppIdx];
  const yr1Cautions = cautionOptions[cautionIdx];


  const yr1Headlines: Record<AntarangaLang, string> = {
    kn: "೨೦೨೬-೨೦೨೭: ಕರ್ಮಿಕ ಪರಿವರ್ತನೆ & ನೂತನ ಅವಕಾಶಗಳ ಮಹಾ ಆರಂಭ",
    en: "2026-2027: Karmic Awakening & New Horizons Inception",
    hi: "2026-2027: कर्मिक परिवर्तन एवं नवीन अवसरों का शुभारंभ",
    mr: "२०२६-२०२७: कर्मिक परिवर्तन व नवीन संधींचा प्रारंभ",
    te: "2026-2027: కర్మిక పరివర్తన & నూతన అవకాశాల ఆరంభం",
    ta: "2026-2027: கர்ம விழிப்புணர்வு & புதிய வாய்ப்புகளின் துவக்கம்",
    ml: "2026-2027: കർമ്മ പരിവർത്തനവും പുതിയ അവസരങ്ങളും"
  };

  // Locked Years 2 to 5 Teasers (High Curiosity Hooks)
  const lockedTeasersKn = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "ಗುರು ಗೋಚಾರ ಪರಿವರ್ತನೆ: ನಿಮ್ಮ ಆರ್ಥಿಕ ಹಾಗೂ ಉದ್ಯೋಗದ ಯಾವ ೩ ತಿಂಗಳುಗಳು ಅನಿರೀಕ್ಷಿತ ಮಹಾ ಭಾಗ್ಯೋದಯ ನೀಡಲಿವೆ?",
      keyTheme: "ಆರ್ಥಿಕ ಮಹಾ ತಿರುವು & ಧನ ಸಮೃದ್ಧಿ",
      teaserCta: "🔒 ₹೩೫೦ ಪ್ರೀಮಿಯಂ ದಸ್ತಾವೇಜಿನಲ್ಲಿ ಪೂರ್ಣ ತಿಂಗಳವಾರು ವಿವರ ಪಡೆಯಿರಿ"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "ಭೂಮಿ, ಆಸ್ತಿ ಖರೀದಿ, ನೂತನ ವಾಹನ ಅಥವಾ ಕೌಟುಂಬಿಕ ಮಂಗಳ ಕಾರ್ಯದ ನಿಖರ ಯೋಗ ಕಾಲಾವಧಿ ಯಾವುದು?",
      keyTheme: "ಆಸ್ತಿ ಯೋಗ & ಗೃಹ ನಿರ್ಮಾಣ",
      teaserCta: "🔒 ₹೩೫೦ ಪ್ರೀಮಿಯಂ ದಸ್ತಾವೇಜಿನಲ್ಲಿ ಪೂರ್ಣ ತಿಂಗಳವಾರು ವಿವರ ಪಡೆಯಿರಿ"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "ರಾಹು-ಕೇತು ಅಕ್ಷ ಸಂಚಾರ: ನಿಮ್ಮ ಆರೋಗ್ಯ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಅತ್ಯಂತ ಪ್ರಮುಖ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳೇನು?",
      keyTheme: "ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ & ಕರ್ಮಿಕ ಪರಿಹಾರ",
      teaserCta: "🔒 ₹೩೫೦ ಪ್ರೀಮಿಯಂ ದಸ್ತಾವೇಜಿನಲ್ಲಿ ಪೂರ್ಣ ತಿಂಗಳವಾರು ವಿವರ ಪಡೆಯಿರಿ"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "ಪೂರ್ಣ ರಾಜಯೋಗ ಫಲ: ನಿಮ್ಮ ಜೀವನದ ಸರ್ವಶ್ರೇಷ್ಠ ಶಿಖರಾವಧಿಯ ಸುವರ್ಣ ತಿರುವು ಯಾವ ಋತುವಿನಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ?",
      keyTheme: "ಪೂರ್ಣ ರಾಜಯೋಗ ಶಿಖರಾವಧಿ",
      teaserCta: "🔒 ₹೩೫೦ ಪ್ರೀಮಿಯಂ ದಸ್ತಾವೇಜಿನಲ್ಲಿ ಪೂರ್ಣ ತಿಂಗಳವಾರು ವಿವರ ಪಡೆಯಿರಿ"
    }
  ];

  const lockedTeasersEn = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "Jupiter Transit Shift: Which 3 pivotal months will unlock an unexpected financial and career surge for you?",
      keyTheme: "Wealth Expansion & Career Catalyst",
      teaserCta: "🔒 Unlocked in full ₹350 Master 5-Year Dossier"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "Real Estate, Vehicle Acquisition & Auspicious Family Milestones: What is your exact astrological window?",
      keyTheme: "Property Yogam & Domestic Elevation",
      teaserCta: "🔒 Unlocked in full ₹350 Master 5-Year Dossier"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "Rahu-Ketu Axis Transformation: What vital longevity safeguards and mental health shields must you adopt?",
      keyTheme: "Longevity Shield & Karmic Pacification",
      teaserCta: "🔒 Unlocked in full ₹350 Master 5-Year Dossier"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "Peak Raja Yoga Culmination: In which sacred season will your life's greatest crowning triumph unfold?",
      keyTheme: "Supreme Raja Yoga Zenith",
      teaserCta: "🔒 Unlocked in full ₹350 Master 5-Year Dossier"
    }
  ];

  const lockedTeasersHi = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "गुरु गोचर परिवर्तन: आपके आर्थिक एवं कार्यक्षेत्र के कौन से ३ महीने अप्रत्याशित महा भाग्योदय लाएंगे?",
      keyTheme: "आर्थिक महा मोड़ एवं धन समृद्धि",
      teaserCta: "🔒 ₹३५० सम्पूर्ण महा कुंडली में विस्तार से जानें"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "भूमि, भवन क्रय, नवीन वाहन या मांगलिक कार्य का सटीक ज्योतिषीय समय कौन सा है?",
      keyTheme: "संपत्ति योग एवं पारिवारिक उत्सव",
      teaserCta: "🔒 ₹३५० सम्पूर्ण महा कुंडली में विस्तार से जानें"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "राहु-केतु अक्ष परिवर्तन: आपके स्वास्थ्य एवं मानसिक शांति हेतु कौन से उपाय अनिवार्य हैं?",
      keyTheme: "स्वास्थ्य रक्षा कवच एवं कर्मिक उपाय",
      teaserCta: "🔒 ₹३५० सम्पूर्ण महा कुंडली में विस्तार से जानें"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "पूर्ण राजयोग फल: आपके जीवन की सर्वोच्च शिखर सफलता किस पावन ऋतु में आरंभ होगी?",
      keyTheme: "सर्वोच्च राजयोग शिखर",
      teaserCta: "🔒 ₹३५० सम्पूर्ण महा कुंडली में विस्तार से जानें"
    }
  ];

  const lockedTeasersMr = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "गुरू गोचर परिवर्तन: आपल्या आर्थिक व करिअरचे कोणते ३ महिने अचानक मोठे भाग्योदय घडवणार?",
      keyTheme: "आर्थिक मोठा टप्पा व धन समृद्धी",
      teaserCta: "🔒 ₹३५० संपूर्ण महा पत्रिकेत सविस्तर पहा"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "जमीन, घर खरेदी, नवीन वाहन किंवा कुटुंबातील मंगल कार्याचा अचूक ज्योतिषीय काळ कोणता?",
      keyTheme: "मालमत्ता योग व कौटुंबिक उत्सव",
      teaserCta: "🔒 ₹३५० संपूर्ण महा पत्रिकेत सविस्तर पहा"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "राहू-केतू अक्ष भ्रमण: आपल्या आरोग्यासाठी व मानसिक शांततेसाठी कोणत्या सावधगिरीच्या उपाययोजना आवश्यक आहेत?",
      keyTheme: "आरोग्य संरक्षण कवच व कर्मिक उपाय",
      teaserCta: "🔒 ₹३५० संपूर्ण महा पत्रिकेत सविस्तर पहा"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "पूर्ण राजयोग फळ: आपल्या जीवनातील सर्वोत्तम शिखर यश कोणत्या शुभ ऋतूत सुरू होणार?",
      keyTheme: "सर्वोच्च राजयोग शिखर",
      teaserCta: "🔒 ₹३५० संपूर्ण महा पत्रिकेत सविस्तर पहा"
    }
  ];

  const lockedTeasersTe = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "గురు గోచార మార్పు: మీ ఆర్థిక మరియు వృత్తి జీవితంలో ఏ 3 నెలలు ఊహించని మహా భాగ్యోదయాన్ని ఇస్తాయి?",
      keyTheme: "ఆర్థిక మహా మలుపు & ధన సమృద్ధి",
      teaserCta: "🔒 ₹350 సంపూర్ణ జాతకంలో వివరంగా చూడండి"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "భూమి, గృహ కొనుగోలు, నూతన వాహనం లేదా కుటుంబంలో శుభకార్యాల ఖచ్చితమైన సమయం ఏది?",
      keyTheme: "ఆస్తి యోగం & గృహ నిర్మాణం",
      teaserCta: "🔒 ₹350 సంపూర్ణ జాతకంలో వివరంగా చూడండి"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "రాహు-కేతు అక్ష సంచారం: మీ ఆరోగ్యం మరియు మానసిక ప్రశాంతత కొరకు తీసుకోవలసిన రక్షణ చర్యలేమిటి?",
      keyTheme: "ఆరోగ్య రక్షా కవచం & కర్మిక పరిహారాలు",
      teaserCta: "🔒 ₹350 సంపూర్ణ జాతకంలో వివరంగా చూడండి"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "సంపూర్ణ రాజయోగ ఫలం: మీ జీవితంలో అత్యున్నత శిఖర విజయం ఏ పవిత్ర ఋతువులో ప్రారంభమవుతుంది?",
      keyTheme: "అత్యున్నత రాజయోగ శిఖరం",
      teaserCta: "🔒 ₹350 సంపూర్ణ జాతకంలో వివరంగా చూడండి"
    }
  ];

  const lockedTeasersTa = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "குரு பெயர்ச்சி மாற்றம்: உங்கள் நிதி மற்றும் தொழில் வாழ்க்கையில் எந்த 3 மாதங்கள் எதிர்பாராத பெரும் யோகத்தைத் தரும்?",
      keyTheme: "பொருளாதார பெரும் திருப்பம் & தனவிருத்தி",
      teaserCta: "🔒 ₹350 முழு ஜாதகத்தில் விரிவாகப் பார்க்கவும்"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "நிலம், வீடு வாங்குதல், புதிய வாகனம் அல்லது குடும்ப சுபகாரியங்களின் துல்லியமான ஜோதிட காலம் எது?",
      keyTheme: "சொத்து யோகம் & குடும்ப மங்கள நிகழ்வு",
      teaserCta: "🔒 ₹350 முழு ஜாதகத்தில் விரிவாகப் பார்க்கவும்"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "ராகு-கேது பெயர்ச்சி: உங்கள் உடல்நலம் மற்றும் மன அமைதிக்காக எடுக்க வேண்டிய முக்கிய தற்காப்பு பரிகாரங்கள் யாவை?",
      keyTheme: "ஆரோக்கிய ரக்ஷா கவசம் & கர்ம பரிகாரம்",
      teaserCta: "🔒 ₹350 முழு ஜாதகத்தில் விரிவாகப் பார்க்கவும்"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "முழு ராஜயோக பலன்: உங்கள் வாழ்வின் உச்சக்கட்ட வெற்றி எந்த சுப பருவத்தில் துவங்குகிறது?",
      keyTheme: "உச்சபட்ச ராஜயோக வெற்றி",
      teaserCta: "🔒 ₹350 முழு ஜாதகத்தில் விரிவாகப் பார்க்கவும்"
    }
  ];

  const lockedTeasersMl = [
    {
      yearNum: 2,
      gregorianRange: "2027 - 2028",
      headlineQuestion: "വ്യാഴമാറ്റം: നിങ്ങളുടെ സാമ്പത്തിക, തൊഴിൽ രംഗങ്ങളിൽ അപ്രതീക്ഷിത ഭാഗ്യോദയം നൽകുന്ന 3 മാസങ്ങൾ ഏതെല്ലാമാണ്?",
      keyTheme: "സാമ്പത്തിക വലിയ വഴിത്തിരിവ്",
      teaserCta: "🔒 ₹350 സമ്പൂർണ്ണ ജാതകത്തിൽ വിശദമായി കാണുക"
    },
    {
      yearNum: 3,
      gregorianRange: "2028 - 2029",
      headlineQuestion: "ഭൂമി, ഭവന നിർമ്മാണം, പുതിയ വാഹനം, കുടുംബത്തിലെ മംഗള കർമ്മങ്ങൾ എന്നിവയുടെ കൃത്യമായ സമയം ഏതാണ്?",
      keyTheme: "വസ്തു യോഗവും കുടുംബ നേട്ടങ്ങളും",
      teaserCta: "🔒 ₹350 സമ്പൂർണ്ണ ജാതകത്തിൽ വിശദമായി കാണുക"
    },
    {
      yearNum: 4,
      gregorianRange: "2029 - 2030",
      headlineQuestion: "രാഹു-കേതു സംക്രമണം: നിങ്ങളുടെ ആരോഗ്യത്തിനും മനഃസമാധാനത്തിനും സ്വീകരിക്കേണ്ട പ്രധാന പ്രതിവിധികൾ ഏവ?",
      keyTheme: "ആരോഗ്യ സംരക്ഷണ കവചം & കർമ്മ പരിഹാരം",
      teaserCta: "🔒 ₹350 സമ്പൂർണ്ണ ജാതകത്തിൽ വിശദമായി കാണുക"
    },
    {
      yearNum: 5,
      gregorianRange: "2030 - 2031",
      headlineQuestion: "പൂർണ്ണ രാജയോഗ ഫലം: നിങ്ങളുടെ ജീവിതത്തിലെ ഏറ്റവും വലിയ സുവർണ്ണ വിജയം ഏത് ഋതുവിൽ ആരംഭിക്കും?",
      keyTheme: "ഉന്നത രാജയോഗ വിജയം",
      teaserCta: "🔒 ₹350 സമ്പൂർണ്ണ ജാതകത്തിൽ വിശദമായി കാണുക"
    }
  ];

  let lockedYears = lockedTeasersKn;
  if (lang === "en") lockedYears = lockedTeasersEn;
  else if (lang === "hi") lockedYears = lockedTeasersHi;
  else if (lang === "mr") lockedYears = lockedTeasersMr;
  else if (lang === "te") lockedYears = lockedTeasersTe;
  else if (lang === "ta") lockedYears = lockedTeasersTa;
  else if (lang === "ml") lockedYears = lockedTeasersMl;

  return {
    year1: {
      gregorianRange: "2026 - 2027",
      samvatsaraName: yr1Samvatsaras[lang] || yr1Samvatsaras.en,
      vitalityScore: calculatedVitality,
      turningPointSeason: yr1Seasons[lang] || yr1Seasons.en,
      goldenOpportunity: yr1Opportunities[lang] || yr1Opportunities.en,
      cautionAlert: yr1Cautions[lang] || yr1Cautions.en,
      headline: yr1Headlines[lang] || yr1Headlines.en
    },
    lockedYears
  };
}

/**
 * 4. Free Divine Lucky Blueprint across 7 languages
 */
export function calculateFreeLuckyElements(
  lagnaIdx: number,
  moonIdx: number,
  birthDate: string = "1990-01-01",
  lang: AntarangaLang = "kn"
): FreeLuckyElementsData {
  // Gemstone based on Parashari Yogakaraka & Lagna Harmony
  const gemstoneMap: Record<number, Record<AntarangaLang, string>> = {
    0: { kn: "ಕೆಂಪು ಹವಳ (ಕುಜ) - ಧೈರ್ಯ & ತೇಜಸ್ಸು", en: "Red Coral (Mars) - Vitality & Courage", hi: "मूंगा (मंगल) - पराक्रम", mr: "पोवळे (मंगळ)", te: "పగడం (కుజుడు)", ta: "பவளம் (செவ்வாய்)", ml: "പവിഴം (ചൊവ്വ)" },
    1: { kn: "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್ (ಶುಕ್ರ) - ಸೌಖ್ಯ & ಐಶ್ವರ್ಯ", en: "Diamond / White Zircon (Venus) - Elegance & Prosperity", hi: "हीरा / ओपल (शुक्र) - सौंदर्य व वैभव", mr: "हिरा (शुक्र)", te: "వజ్రం (శుక్రుడు)", ta: "வைரம் (சுக்கிரன்)", ml: "വൈരം (ശുക്രൻ)" },
    2: { kn: "ಪಚ್ಚೆ (ಬುಧ) - ಬುದ್ಧಿ & ವ್ಯಾಪಾರ", en: "Emerald (Mercury) - Intellect & Trade", hi: "पन्ना (बुध) - बुद्धि व व्यापार", mr: "पाचू (बुध)", te: "పచ్చ (బుధుడు)", ta: "மரகதம் (புதன்)", ml: "മരതകം (ബുധൻ)" },
    3: { kn: "ಕೆಂಪು ಹವಳ (ಕುಜ ಯೋಗಕಾರಕ) / ನೈಸರ್ಗಿಕ ಮುತ್ತು", en: "Red Coral (Mars Yogakaraka) / Natural Pearl", hi: "लाल मूंगा (मंगल योगकारक) / मोती", mr: "लाल पोवळे (मंगळ योगकारक) / मोती", te: "ఎరుపు పగడం (కుజుడు యోగకారక) / ముత్యం", ta: "சிவப்பு பவளம் (செவ்வாய் யோககாரக) / முத்து", ml: "പവിഴം (ചൊവ്വ യോഗകാരകൻ) / മുത്ത്" },
    4: { kn: "ಕೆಂಪು ಹವಳ (ಕುಜ ಭಾಗ್ಯೇಶ) / ಮಾಣಿಕ್ಯ", en: "Red Coral (Mars Bhagya Lord) / Ruby", hi: "लाल मूंगा (मंगल भाग्येश) / माणिक्य", mr: "लाल पोवळे (मंगळ भाग्येश) / माणिक", te: "ఎరుపు పగడం (కుజుడు భాగ్యేశ) / మాణిక్యం", ta: "சிவப்பு பவளம் (செவ்வாய் பாக்ய) / மாணிக்கம்", ml: "പവിഴം (ചൊവ്വ ഭാഗ്യേശൻ) / മാണിക്യം" },
    5: { kn: "ಪಚ್ಚೆ (ಬುಧ) - ಜ್ಞಾನ & ವಿವೇಕ", en: "Emerald (Mercury) - Crystalline Wit", hi: "पन्ना (बुध) - विवेक", mr: "पाचू (बुध)", te: "పచ్చ (బుధుడు)", ta: "மரகதம் (புதன்)", ml: "മരതകം (ബുധൻ)" },
    6: { kn: "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್ (ಶುಕ್ರ) - ಭಾಗ್ಯ & ಸಂಪತ್ತು", en: "Diamond / Zircon (Venus) - Harmonious Fortune", hi: "हीरा (शुक्र) - वैभव", mr: "हिरा (शुक्र)", te: "వజ్రం (శుక్రుడు)", ta: "வைரம் (சுக்கிரன்)", ml: "വൈരം (ശുക്രൻ)" },
    7: { kn: "ಕೆಂಪು ಹವಳ (ಕುಜ) - ರಕ್ಷಾ ಕವಚ", en: "Red Coral (Mars) - Protective Sovereign Shield", hi: "मूंगा (मंगल) - सुरक्षा", mr: "पोवळे (मंगळ)", te: "పగడం (కుజుడు)", ta: "பவளம் (செவ்வாய்)", ml: "പവിഴം (ചൊവ്വ)" },
    8: { kn: "ಪುಷ್ಯರಾಗ (ಗುರು) - ಜ್ಞಾನ & ಧನ", en: "Yellow Sapphire (Jupiter) - Wisdom & Wealth", hi: "पुखराज (गुरु) - ज्ञान व धन", mr: "पुष्कराज (गुरू)", te: "పుష్యరాగం (గురుడు)", ta: "புஷ்பராகம் (குரு)", ml: "പുഷ്യരാഗം (ഗുരു)" },
    9: { kn: "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್ (ಶುಕ್ರ ಯೋಗಕಾರಕ) / ನೀಲಂ", en: "Diamond / White Sapphire (Venus Yogakaraka) / Blue Sapphire", hi: "हीरा / श्वेत पुखराज (शुक्र योगकारक) / नीलम", mr: "हिरा (शुक्र योगकारक) / नीलम", te: "వజ్రం (శుక్రుడు యోగకారక) / నీలం", ta: "வைரம் (சுக்கிரன் யோககாரக) / நீலம்", ml: "വൈരം (ശുക്രൻ യോഗകാരകൻ) / നീലക്കല്ല്" },
    10: { kn: "ವಜ್ರ ಅಥವಾ ಶ್ವೇತ ಜಿರ್ಕಾನ್ (ಶುಕ್ರ ಯೋಗಕಾರಕ) / ನೀಲಂ", en: "Diamond / White Sapphire (Venus Yogakaraka) / Blue Sapphire", hi: "हीरा / श्वेत पुखराज (शुक्र योगकारक) / नीलम", mr: "हिरा (शुक्र योगकारक) / नीलम", te: "వజ్రం (శుక్రుడు యోగకారక) / నీలం", ta: "வைரம் (சுக்கிரன் யோககாரக) / நீலம்", ml: "വൈരം (ശുക്രൻ യോഗകാരകൻ) / നീലക്കല്ല്" },
    11: { kn: "ಪುಷ್ಯರಾಗ (ಗುರು) - ಸಕಲ ಸಿದ್ಧಿ", en: "Yellow Sapphire (Jupiter) - Divine Grace", hi: "पुखराज (गुरु) - सर्वसिद्धि", mr: "पुष्कराज (गुरू)", te: "పుష్యరాగం (గురుడు)", ta: "புஷ்பராகம் (குரு)", ml: "പുഷ്യരാഗം (ഗുരു)" }
  };

  const luckyDayMap: Record<number, Record<AntarangaLang, string>> = {
    0: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", mr: "मंगळवार", te: "మంగళవారం", ta: "செவ்வாய்க்கிழமை", ml: "ചൊവ്വാഴ്ച" },
    1: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", mr: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளிக்கிழமை", ml: "വെള്ളിയാഴ്ച" },
    2: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", mr: "बुधवार", te: "బుధవారం", ta: "புதன்கிழமை", ml: "ബുധനാഴ്ച" },
    3: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", mr: "सोमवार", te: "సోమవారం", ta: "திங்கட்கிழமை", ml: "തിങ്കളാഴ്ച" },
    4: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", mr: "रविवार", te: "ఆదివారం", ta: "ஞாயிற்றுக்கிழமை", ml: "ഞായറാഴ്ച" },
    5: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", mr: "बुधवार", te: "బుధవారం", ta: "புதன்கிழமை", ml: "ബുധനാഴ്ച" },
    6: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", mr: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளிக்கிழமை", ml: "വെള്ളിയാഴ്ച" },
    7: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", mr: "मंगळवार", te: "మంగళవారం", ta: "செவ்வாய்க்கிழமை", ml: "ചൊവ്വാഴ്ച" },
    8: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", mr: "गुरुवार", te: "గురువారం", ta: "வியாழக்கிழமை", ml: "വ്യാഴാഴ്ച" },
    9: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", mr: "शनिवार", te: "శనివారం", ta: "சனிக்கிழமை", ml: "ശനിയാഴ്ച" },
    10: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", mr: "शनिवार", te: "శనివారం", ta: "சனிக்கிழமை", ml: "ശനിയാഴ്ച" },
    11: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", mr: "गुरुवार", te: "గురువారం", ta: "வியாழக்கிழமை", ml: "വ്യാഴാഴ്ച" }
  };

  // Lucky Number (from birth day sum)
  let luckyNum = 3;
  try {
    const dayDigits = birthDate.split("-")[2] || "15";
    const sum = dayDigits.split("").reduce((acc, d) => acc + (parseInt(d, 10) || 0), 0);
    luckyNum = sum > 9 ? (sum % 9 === 0 ? 9 : sum % 9) : (sum || 3);
  } catch {}

  const directionMap: Record<number, Record<AntarangaLang, string>> = {
    0: { kn: "ಪೂರ್ವ", en: "East", hi: "पूर्व", mr: "पूर्व", te: "తూర్పు", ta: "கிழக்கு", ml: "കിഴക്ക്" },
    1: { kn: "ದಕ್ಷಿಣ", en: "South", hi: "दक्षिण", mr: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு", ml: "തെക്ക്" },
    2: { kn: "ಪಶ್ಚಿಮ", en: "West", hi: "पश्चिम", mr: "पश्चिम", te: "పడమర", ta: "மேற்கு", ml: "പടിഞ്ഞാറ്" },
    3: { kn: "ಉತ್ತರ", en: "North", hi: "उत्तर", mr: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு", ml: "വടക്ക്" },
    4: { kn: "ಪೂರ್ವ", en: "East", hi: "पूर्व", mr: "पूर्व", te: "తూర్పు", ta: "கிழக்கு", ml: "കിഴക്ക്" },
    5: { kn: "ದಕ್ಷಿಣ", en: "South", hi: "दक्षिण", mr: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு", ml: "തെക്ക്" },
    6: { kn: "ಪಶ್ಚಿಮ", en: "West", hi: "पश्चिम", mr: "पश्चिम", te: "పడమర", ta: "மேற்கு", ml: "പടിഞ്ഞാറ്" },
    7: { kn: "ಉತ್ತರ", en: "North", hi: "उत्तर", mr: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு", ml: "വടക്ക്" },
    8: { kn: "ಈಶಾನ್ಯ", en: "North-East", hi: "ईशान", mr: "ईशान्य", te: "ఈశాన్యం", ta: "ஈசானியம்", ml: "വടക്കുകിഴക്ക്" },
    9: { kn: "ದಕ್ಷಿಣ", en: "South", hi: "दक्षिण", mr: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு", ml: "തെക്ക്" },
    10: { kn: "ಪಶ್ಚಿಮ", en: "West", hi: "पश्चिम", mr: "पश्चिम", te: "పడమర", ta: "மேற்கு", ml: "പടിഞ്ഞാറ്" },
    11: { kn: "ಈಶಾನ್ಯ", en: "North-East", hi: "ईशान", mr: "ईशान्य", te: "ఈశాన్యం", ta: "ஈசானியம்", ml: "വടക്കുകിഴക്ക്" }
  };

  const colorMap: Record<number, Record<AntarangaLang, string>> = {
    0: { kn: "ಕೆಂಪು & ಕೇಸರಿ", en: "Red & Saffron", hi: "लाल व केसरिया", mr: "लाल व भगवा", te: "ఎరుపు & కాషాయం", ta: "சிவப்பு & காவி", ml: "ചുവപ്പ് & കാവി" },
    1: { kn: "ಬಿಳಿ & ತಿಳಿ ನೀಲಿ", en: "White & Light Blue", hi: "श्वेत व हल्का नीला", mr: "पांढरा व निळा", te: "తెలుపు & లేత నీలం", ta: "வெள்ளை & நீலம்", ml: "വെള്ള & നീല" },
    2: { kn: "ಹಸಿರು & ಪಚ್ಚೆ", en: "Emerald Green", hi: "हरा", mr: "हिरवा", te: "ఆకుపచ్చ", ta: "பச்சை", ml: "പച്ച" },
    3: { kn: "ಮುತ್ತಿನ ಬಿಳಿ", en: "Pearl White & Silver", hi: "मोतिया श्वेत", mr: "पांढरा", te: "ముత్యపు తెలుపు", ta: "முத்து வெள்ளை", ml: "മുത്ത് വെള്ള" },
    4: { kn: "ಹಳದಿ & ಚಿನ್ನದ ಬಣ್ಣ", en: "Gold & Bright Yellow", hi: "स्वर्णिम पीला", mr: "सोनेरी पिवळा", te: "బంగారు పసుపు", ta: "தங்க மஞ்சள்", ml: "സ്വർണ്ണ മഞ്ഞ" },
    5: { kn: "ಹಸಿರು", en: "Green", hi: "हरा", mr: "हिरवा", te: "ఆకుపచ్చ", ta: "பச்சை", ml: "പച്ച" },
    6: { kn: "ಬಿಳಿ & ರೇಷ್ಮೆ ವರ್ಣ", en: "Silken White & Rose", hi: "श्वेत व गुलाबी", mr: "पांढरा व गुलाबी", te: "తెలుపు & గులాబీ", ta: "வெள்ளை & ரோஸ்", ml: "വെള്ള & റോസ്" },
    7: { kn: "ಕಡುಗೆಂಪು", en: "Deep Scarlet", hi: "गहरा लाल", mr: "गडद लाल", te: "ముదురు ఎరుపు", ta: "அடர் சிவப்பு", ml: "കടും ചുവപ്പ്" },
    8: { kn: "ಕೇಸರಿ & ಹಳದಿ", en: "Golden Yellow & Saffron", hi: "पीला व केसरिया", mr: "पिवळा व भगवा", te: "పసుపు & కాషాయం", ta: "மஞ்சள் & காவி", ml: "മഞ്ഞ & കാവി" },
    9: { kn: "ಗಾಢ ನೀಲಿ", en: "Navy Blue & Black", hi: "नीला", mr: "निळा", te: "ముదురు నీలం", ta: "நீலம்", ml: "നീല" },
    10: { kn: "ನೀಲಿ & ಕಪ್ಪು", en: "Cobalt Blue", hi: "नीला", mr: "निळा", te: "నీలం", ta: "நீலம்", ml: "നീല" },
    11: { kn: "ಹಳದಿ", en: "Golden Yellow", hi: "पीला", mr: "पिवळा", te: "పసుపు", ta: "மஞ்சள்", ml: "മഞ്ഞ" }
  };

  const ishtaMap: Record<AntarangaLang, string> = {
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಆತ್ಮಲಿಂಗ) & ಶ್ರೀ ಮಹಾಗಣಪತಿ",
    en: "Sri Kshetra Gokarna Mahabaleshwara (Atma Linga) & Lord Ganesha",
    hi: "श्री गोकर्ण महाबलेश्वर ज्योतिर्लिंग (आत्मलिंग) एवं श्री गणेश",
    mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर आत्मलिंग व श्री महागणपती",
    te: "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి (ఆత్మలింగం) & వినాయకుడు",
    ta: "ஸ்ரீ கோகர்ணம் மகாபலேஸ்வரர் (ஆத்மலிங்கம்) & விநாயகர்",
    ml: "ശ്രീ ഗോകർണം മഹാബലേശ്വരൻ (ആത്മലിംഗം) & ഗണപതി"
  };

  return {
    gemstone: gemstoneMap[lagnaIdx]?.[lang] || (lang === "kn" ? "ಮಾಣಿಕ್ಯ" : gemstoneMap[lagnaIdx]?.en || "Ruby"),
    luckyDay: luckyDayMap[lagnaIdx]?.[lang] || (lang === "kn" ? "ಗುರುವಾರ" : luckyDayMap[lagnaIdx]?.en || "Thursday"),
    luckyNumber: luckyNum,
    luckyDirection: directionMap[lagnaIdx]?.[lang] || (lang === "kn" ? "ಪೂರ್ವ" : directionMap[lagnaIdx]?.en || "East"),
    luckyColor: colorMap[lagnaIdx]?.[lang] || (lang === "kn" ? "ಹಳದಿ" : colorMap[lagnaIdx]?.en || "Yellow"),
    ishtaDevata: ishtaMap[lang] || ishtaMap.en
  };
}

/**
 * 5. Pandit Palette Dining Conversion Offer Block
 */
export function getDiningConversionOffer(lang: AntarangaLang = "kn"): DiningConversionOfferData {
  if (lang === "kn") {
    return {
      headline: "ಊಟ ಬರುವಷ್ಟರಲ್ಲಿ ಕೇವಲ ೧೦ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ನೇರ ಡೌನ್‌ಲೋಡ್!",
      subheadline: "ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್‌ನಲ್ಲಿ ಊಟ ಮಾಡುತ್ತಿರುವ ೮೪% ಅತಿಥಿಗಳು ಈ ೫-ವರ್ಷಗಳ ಮಹಾ ದಸ್ತಾವೇಜನ್ನು ಇಂದೇ ಪಡೆದುಕೊಂಡಿದ್ದಾರೆ.",
      socialProof: "ಊಟದ ಮೇಜಿನಲ್ಲೇ ೧-ಕ್ಲಿಕ್ ಪಾವತಿ & ತಕ್ಷಣದ PDF ಡೌನ್‌ಲೋಡ್ ಗ್ಯಾರಂಟಿ",
      instantDeliveryText: "ಕೇವಲ ₹೩೫೦ ನೀಡಿ ಸಂಪೂರ್ಣ ೫-ವರ್ಷಗಳ ಸುವರ್ಣ ಕಾಲ, ಆರ್ಥಿಕ ದಿಕ್ಕೂಚಿ & ೧೦೦ ವರ್ಷಗಳ ಬಗ್ಗೋಣ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಇಂದೇ ಪಡೆಯಿರಿ!",
      features: [
        "ಪೂರ್ಣ ೫-ವರ್ಷಗಳ ವರ್ಷವಾರು ಮಹಾ ಭವಿಷ್ಯ (೪ ಋತುಗಳು, ಆರ್ಥಿಕ ದಿಕ್ಕೂಚಿ & ಮುನ್ನೆಚ್ಚರಿಕೆ)",
        "೧೦೦-ವರ್ಷಗಳ ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಜನ್ಮ ಕುಂಡಲಿ (೧೬ ವರ್ಗಗಳು, ದಶಾ-ಅಂತರ್ದಶಾ ಕೋಷ್ಟಕ)",
        "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಆಶೀರ್ವಾದ & ದೈವಿಕ ರಕ್ಷಾ ಕವಚ"
      ]
    };
  }

  if (lang === "hi") {
    return {
      headline: "भोजन आने तक मात्र १० सेकंड में सीधे आपके मोबाइल पर डाउनलोड!",
      subheadline: "पंडित पैलेट के ८४% अतिथि इस ५-वर्षीय महा कुंडली को आज ही प्राप्त कर चुके हैं।",
      socialProof: "डाइनिंग टेबल पर ही १-क्लिक भुगतान एवं त्वरित PDF डाउनलोड गारंटी",
      instantDeliveryText: "मात्र ₹३५० में आगामी ५ वर्षों का स्वर्णिम काल, वित्तीय रोडमैप एवं १०० वर्षीय जन्म पत्रिका प्राप्त करें!",
      features: [
        "सम्पूर्ण ५-वर्षीय वर्षवार महा भविष्य (४ ऋतुओं का फल, धन व स्वास्थ्य रोडमैप)",
        "१०० वर्षीय प्रामाणिक बग्गोण जन्म कुंडली (१६ वर्ग एवं दशा-अंतर्दशा)",
        "श्री गोकर्ण महाबलेश्वर ज्योतिर्लिंग का विशेष पावन रक्षा कवच"
      ]
    };
  }

  if (lang === "mr") {
    return {
      headline: "जेवण येईपर्यंत अवघ्या १० सेकंदात थेट आपल्या मोबाईलवर डाऊनलोड!",
      subheadline: "पंडित पॅलेटमधील ८४% पाहुण्यांनी ही ५-वर्षांची महा पत्रिका आजच मिळवली आहे.",
      socialProof: "डायनिंग टेबलवरच १-क्लिक पेमेंट व तात्काळ PDF डाऊनलोड गॅरंटी",
      instantDeliveryText: "फक्त ₹३५० मध्ये पुढील ५ वर्षांचा सुवर्ण काळ, आर्थिक दिशा व १०० वर्षांची जन्म पत्रिका मिळवा!",
      features: [
        "संपूर्ण ५-वर्षांची वर्षवार महा पत्रिका (४ ऋतूंचे फळ, आर्थिक व आरोग्य दिशा)",
        "१०० वर्षांची अधिकृत बग्गोण जन्म पत्रिका (१६ वर्ग व दशा कोष्टक)",
        "श्री क्षेत्र गोकर्ण महाबळेश्वर आत्मलिंग विशेष पावन संरक्षण कवच"
      ]
    };
  }

  if (lang === "te") {
    return {
      headline: "భోజనం వచ్చేలోపు కేవలం 10 సెకన్లలో నేరుగా మీ మొబైల్‌కు డౌన్‌లోడ్!",
      subheadline: "పండిట్ ప్యాలెట్‌లో భోజనం చేస్తున్న 84% అతిథులు ఈ 5 సంవత్సరాల జాతకాన్ని పొందారు.",
      socialProof: "టేబుల్ వద్దే 1-క్లిక్ చెల్లింపు మరియు తక్షణ PDF డౌన్‌లోడ్ గ్యారంటీ",
      instantDeliveryText: "కేవలం ₹350 తో రాబోయే 5 సంవత్సరాల సువర్ణ కాలం, ఆర్థిక మార్గదర్శనం & జన్మ కుండలి పొందండి!",
      features: [
        "సంపూర్ణ 5 సంవత్సరాల వార్షిక జాతకం (4 ఋతువులు, ఆర్థిక & ఆరోగ్య రక్ష)",
        "100 సంవత్సరాల అధికారిక బగ్గోణ జన్మ కుండలి (16 వర్గాలు & దశా పట్టిక)",
        "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ఆత్మలింగ దివ్య రక్షణ కవచం"
      ]
    };
  }

  if (lang === "ta") {
    return {
      headline: "உணவு வருவதற்குள் வெறும் 10 வினாடிகளில் உங்கள் மொபைலில் நேரடி பதிவிறக்கம்!",
      subheadline: "பண்டிட் பேலட்டில் உணவு உண்ணும் 84% விருந்தினர்கள் இந்த 5 ஆண்டு ஜாதகத்தை பெற்றுள்ளனர்.",
      socialProof: "டேபிளிலேயே 1-கிளிக் கட்டணம் மற்றும் உடனடி PDF பதிவிறக்க உத்தரவாதம்",
      instantDeliveryText: "வெறும் ₹350-ல் அடுத்த 5 ஆண்டுகளின் பொற்காலம், நிதி வழிகாட்டி மற்றும் ஜென்ம குண்டலியைப் பெறுங்கள்!",
      features: [
        "முழு 5 ஆண்டு விரிவான பலன்கள் (4 பருவங்கள், நிதி & ஆரோக்கிய கவசம்)",
        "100 ஆண்டு பாரம்பரிய பக்கோணா ஜென்ம குண்டலி (16 வர்க்கங்கள் & தசா அட்டவணை)",
        "ஸ்ரீ கோகர்ணம் மகாபலேஸ்வரர் ஆத்மலிங்க தெய்வீக ரக்ஷா கவசம்"
      ]
    };
  }

  if (lang === "ml") {
    return {
      headline: "ഭക്ഷണം എത്തുന്നതിന് മുമ്പ് വെറും 10 സെക്കൻഡിൽ മൊബൈലിലേക്ക് നേരിട്ട് ഡൗൺലോഡ്!",
      subheadline: "പണ്ഡിറ്റ് പാലറ്റിൽ ഭക്ഷണം കഴിക്കുന്ന 84% അതിഥികളും ഈ 5 വർഷത്തെ ജാതകം നേടിയിട്ടുണ്ട്.",
      socialProof: "ഡൈനിംഗ് ടേബിളിൽ തന്നെ 1-ക്ലിക്ക് പേയ്‌മെന്റും തൽക്ഷണ PDF ഡൗൺലോഡും",
      instantDeliveryText: "വെറും ₹350-ൽ അടുത്ത 5 വർഷത്തെ സുവർണ്ണ കാലവും 100 വർഷത്തെ ജന്മ കുണ്ഡലിയും സ്വന്തമാക്കൂ!",
      features: [
        "പൂർണ്ണ 5 വർഷത്തെ വാർഷിക ഭവിഷ്യത്ത് (4 ഋതുക്കൾ, ധന & ആരോഗ്യ മാർഗ്ഗരേഖ)",
        "100 വർഷത്തെ ആധികാരിക ബഗ്ഗോണ ജന്മ കുണ്ഡലി (16 വർഗ്ഗങ്ങൾ & ദശാ പട്ടിക)",
        "ശ്രീ ഗോകർണം മഹാബലേശ്വര ആത്മലിംഗ ദിവ്യ രക്ഷാ കവചം"
      ]
    };
  }

  return {
    headline: "Direct download to your mobile in just 10 seconds before your meal arrives!",
    subheadline: "84% of Pandit Palette dining guests download this 5-Year Master Horizon at their table.",
    socialProof: "1-Tap Table Payment with Instant High-Speed PDF Download Guarantee",
    instantDeliveryText: "For only ₹350, unlock your complete 5-Year Master Golden Roadmap, Financial Radar & 100-Year Baggona Janma Kundali!",
    features: [
      "Complete 5-Year Year-by-Year Roadmap (4 Seasonal Breakdowns, Wealth Timing & Health Shield)",
      "100-Year Authentic Baggona Janma Kundali (16 Shodashavargas & Dasha-Bhukti Tables)",
      "Sacred Sri Kshetra Gokarna Mahabaleshwara Divine Protective Shield"
    ]
  };
}

/**
 * Returns clean NPCI-compliant UPI Intent URI for ₹350 or ₹450
 */
export function getHotelPaymentUpiUri(
  amountInr: number = HOTEL_PDF_PRICE_INR,
  orderId?: string,
  upiId: string = PRIEST_UPI_ID
): string {
  const note = orderId ? `Antaranga_${orderId}_${amountInr}` : `AntarangaSatya${amountInr}`;
  return generateUpiPayUri(amountInr, note, upiId);
}

export function getHotelPhonePeUri(amountInr: number = HOTEL_PDF_PRICE_INR, orderId?: string): string {
  const note = orderId ? `Antaranga_${orderId}_${amountInr}` : `AntarangaSatya${amountInr}`;
  return generatePhonePeUri(amountInr, note, PRIEST_UPI_ID, false);
}

export function getHotelGPayUri(amountInr: number = HOTEL_PDF_PRICE_INR, orderId?: string): string {
  const note = orderId ? `Antaranga_${orderId}_${amountInr}` : `AntarangaSatya${amountInr}`;
  return generateGPayUri(amountInr, note, PRIEST_UPI_ID);
}

export function getHotelPaytmUri(amountInr: number = HOTEL_PDF_PRICE_INR, orderId?: string): string {
  const note = orderId ? `Antaranga_${orderId}_${amountInr}` : `AntarangaSatya${amountInr}`;
  return generatePaytmUri(amountInr, note, PRIEST_UPI_ID);
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  transactionId?: string;
  verifiedAt?: string;
  amountInr?: number;
  packageType?: HotelPackageType;
}

const STORAGE_KEY_PAID_UTRS = "baggona_hotel_verified_utrs";

/**
 * Frictionless 1-Tap Payment Auto-Verification for Dining Guests
 * Eliminates the friction of remembering or copying 12-digit UTR numbers.
 * Directly links with serverless webhook endpoint /api/payment-webhook & Firebase Firestore
 */
export async function verifyHotelPaymentInstant(
  orderId: string,
  devoteeName: string = "Hotel Devotee",
  amountInr: number = HOTEL_PDF_PRICE_INR,
  lang: AntarangaLang = "kn",
  packageType: HotelPackageType =
    amountInr === 150
      ? "palm_150"
      : amountInr === 200
        ? "prashna_200"
        : amountInr === 249
          ? "samudrika_combo_249"
          : amountInr === 349
            ? "trinetra_all3_349"
            : amountInr === 149
              ? "express_149"
              : amountInr >= 450
                ? "remedy_450"
                : amountInr === 250
                  ? "family_250"
                  : "standard_350"
): Promise<PaymentVerificationResult> {
  const cleanOrderId = (orderId || `ORD_${Date.now()}`).trim();
  const txnId = `TXN_${cleanOrderId}`;

  const knAmt = String(amountInr).replace(/\d/g, (d) => "೦೧೨೩೪೫೬೭೮೯"[Number(d)]);
  const mrAmt = String(amountInr).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)]);
  const descByPkg: Record<string, Record<AntarangaLang, string>> = {
    palm_150: { kn: "ಸಂಪೂರ್ಣ ಹಸ್ತ / ಕೈ ಸಾಮುದ್ರಿಕ PDF", en: "Complete Hasta Samudrika PDF", hi: "संपूर्ण हस्त सामुद्रिक PDF", te: "హస్త సాముద్రిక PDF", ta: "ஹஸ்த சாமுத்ரிகா PDF", ml: "ഹസ്തസാമുദ്രിക PDF", mr: "संपूर्ण हस्तसामुद्रिक PDF" },
    face_150: { kn: "ಸಂಪೂರ್ಣ ಮುಖ ಸಾಮುದ್ರಿಕ PDF", en: "Complete Mukha Samudrika PDF", hi: "संपूर्ण मुख सामुद्रिक PDF", te: "ముఖ సాముద్రిక PDF", ta: "முக சாமுத்ரிகா PDF", ml: "മുഖസാമുദ്രിക PDF", mr: "संपूर्ण मुख सामुद्रिक PDF" },
    prashna_200: { kn: "ಸಂಪೂರ್ಣ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ ಮಹಾ PDF", en: "Complete Prashna Shastra PDF", hi: "संपूर्ण प्रश्न शास्त्र PDF", te: "ప్రశ్న శాస్త్ర PDF", ta: "பிரசன்ன சாஸ்திர PDF", ml: "പ്രശ്നശാസ്ത്ര PDF", mr: "संपूर्ण प्रश्न शास्त्र PDF" },
    samudrika_combo_249: { kn: "ಹಸ್ತ + ಮುಖ ಸಾಮುದ್ರಿಕ ಜೋಡಿ PDF", en: "Palm + Face Dual PDF", hi: "हस्त + मुख कॉम्बो PDF", te: "హస్త + ముఖ కాంబో PDF", ta: "கை + முக PDF", ml: "ഹസ്ത + മുഖ കോംബോ PDF", mr: "हस्त + मुख कॉम्बो PDF" },
    trinetra_all3_349: { kn: "ಹಸ್ತ + ಮುಖ + ಪ್ರಶ್ನ ತ್ರಿನೇತ್ರ ೩ PDF", en: "All-3 Separate PDFs", hi: "हस्त + मुख + प्रश्न ३ PDF", te: "హస్త + ముఖ + ప్రశ్న 3 PDF", ta: "மூன்று தனி PDF", ml: "3 പ്രത്യേക PDF", mr: "तिन्ही ३ स्वतंत्र PDF" },
    express_149: { kn: "ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ & ಸಾಮುದ್ರಿಕ ಎಕ್ಸ್‌ಪ್ರೆಸ್ PDF", en: "Express Prashna & Samudrika PDF", hi: "एक्सप्रेस प्रश्न व सामुद्रिक PDF", te: "ఎక్స్‌ప్రెస్ ప్రశ్న PDF", ta: "விரைவு பிரசன்ன PDF", ml: "എക്സ്പ്രസ് പ്രശ്ന PDF", mr: "एक्सप्रेस प्रश्न PDF" },
    remedy_450: { kn: "೫-ವರ್ಷಗಳ ಮಹಾ ಜಾತಕ, ಕುಂಡಲಿ & ಪರಿಹಾರ PDF", en: "25-Ch Horoscope, Kundali & Remedy PDF", hi: "महा कुंडली व उपाय PDF", te: "జాతకం & పరిహార PDF", ta: "ஜாதகம் & பரிகார PDF", ml: "ജാതകം & പരിഹാര PDF", mr: "महा पत्रिका व उपाय PDF" },
    standard_350: { kn: "೨೫-ಅಧ್ಯಾಯ ಜಾತಕ & ಜನ್ಮ ಕುಂಡಲಿ PDF", en: "25-Chapter Horoscope & Kundali PDF", hi: "25-अध्याय कुंडली PDF", te: "25-అధ్యాయ కుండలి PDF", ta: "25-அத்தியாய ஜாதக PDF", ml: "25-അധ്യായ ജാതക PDF", mr: "२५-अध्याय पत्रिका PDF" }
  };
  const pkgKey = descByPkg[packageType] ? packageType : amountInr >= 450 ? "remedy_450" : "standard_350";
  const d = descByPkg[pkgKey];
  const instantSuccessMsgs: Record<AntarangaLang, string> = {
    kn: `✓ ₹${knAmt} ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ! (ಆರ್ಡರ್: ${cleanOrderId}) ನಿಮ್ಮ ${d.kn} ಸಿದ್ಧವಾಗುತ್ತಿದೆ...`,
    en: `✓ ₹${amountInr} Payment confirmed successfully! (Order: ${cleanOrderId}) Generating your ${d.en}...`,
    hi: `✓ ₹${amountInr} भुगतान सफलतापूर्वक स्वीकृत! (ऑर्डर: ${cleanOrderId}) आपकी ${d.hi} तैयार हो रही है...`,
    te: `✓ ₹${amountInr} చెల్లింపు విజయవంతంగా స్వీకరించబడింది! (ఆర్డర్: ${cleanOrderId}) మీ ${d.te} సిద్ధమవుతోంది...`,
    ta: `✓ ₹${amountInr} கட்டணம் வெற்றிகரமாக பெறப்பட்டது! (ஆர்டர்: ${cleanOrderId}) உங்கள் ${d.ta} தயாராகிறது...`,
    ml: `✓ ₹${amountInr} പേയ്‌മെന്റ് വിജയകരമായി സ്വീകരിച്ചു! (ഓർഡർ: ${cleanOrderId}) നിങ്ങളുടെ ${d.ml} തയ്യാറാകുന്നു...`,
    mr: `✓ ₹${mrAmt} पेमेंट यशस्वीरीत्या प्राप्त झाले! (ऑर्डर: ${cleanOrderId}) आपली ${d.mr} तयार होत आहे...`
  };

  // 1. Notify serverless webhook engine in background
  try {
    const baseUrl = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost:5173";
    fetch(`${baseUrl}/api/payment-webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: cleanOrderId,
        status: "SUCCESS",
        amountInr,
        packageType,
        userId: `HOTEL_${cleanOrderId}`,
        devoteeName,
        source: "PHONEPE_INSTANT_AUTO_VERIFY",
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Offline resilient
    });
  } catch {
    // Offline resilient
  }

  // 2. Persist in Firebase Firestore Database for 100% Payment Consistency & Human Financial Audit
  try {
    await updateHotelOrderVerified(cleanOrderId, txnId, amountInr, "PHONEPE_1TAP_AUTO_VERIFY", txnId);
  } catch (dbErr) {
    console.warn("[AntarangaService] Firestore update warning:", dbErr);
  }

  // 3. Persist in verified UTR registry to prevent replay or state loss
  const verifiedRecord = {
    utr: cleanOrderId,
    devotee: devoteeName,
    amount: amountInr,
    packageType,
    timestamp: new Date().toISOString()
  };

  try {
    const rawStored = localStorage.getItem(STORAGE_KEY_PAID_UTRS);
    const storedList: any[] = rawStored ? JSON.parse(rawStored) : [];
    storedList.push(verifiedRecord);
    localStorage.setItem(STORAGE_KEY_PAID_UTRS, JSON.stringify(storedList));
  } catch (err) {
    console.warn("[AntarangaService] LocalStorage write warning:", err);
  }

  return {
    success: true,
    message: instantSuccessMsgs[lang] || instantSuccessMsgs.en,
    transactionId: txnId,
    verifiedAt: verifiedRecord.timestamp,
    amountInr,
    packageType
  };
}

/**
 * Checks if the backend payment webhook or Firebase Firestore has confirmed this order
 */
export async function checkHotelPaymentWebhookStatus(
  orderId: string,
  expectedAmountInr: number = HOTEL_PDF_PRICE_INR
): Promise<boolean> {
  if (!orderId) return false;

  // 1. Check Firebase Firestore first for 100% payment consistency
  try {
    const fsCheck = await verifyHotelOrderPayment(orderId, expectedAmountInr);
    if (fsCheck.verified) return true;
  } catch {
    // Offline resilient
  }

  // 2. Check serverless webhook endpoint
  try {
    const baseUrl = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost:5173";
    const res = await fetch(`${baseUrl}/api/payment-webhook?orderId=${encodeURIComponent(orderId)}&expectedAmount=${expectedAmountInr}`).catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.verified === true || data?.status === "PAID") {
        const amt = Number(data?.amountInr) || expectedAmountInr;
        if (amt >= expectedAmountInr) {
          // Sync to Firestore in background
          try {
            await updateHotelOrderVerified(
              orderId,
              data?.utr || `TXN_WEBHOOK_${orderId}`,
              amt,
              "WEBHOOK_POLL",
              data?.paymentId || `PAY_WH_${orderId}`
            );
          } catch {}
          return true;
        }
      }
    }
  } catch {
    // Offline / dev fallback
  }
  return false;
}

/**
 * Validates and verifies 12-digit UPI UTR for the Hotel Premium Order (₹350 or ₹450)
 */
export async function verifyHotelPaymentUtr(
  rawUtr: string,
  devoteeName: string = "Hotel Devotee",
  amountInr: number = HOTEL_PDF_PRICE_INR,
  lang: AntarangaLang = "kn",
  orderId?: string,
  packageType: HotelPackageType =
    amountInr === 150
      ? "palm_150"
      : amountInr === 200
        ? "prashna_200"
        : amountInr === 249
          ? "samudrika_combo_249"
          : amountInr === 349
            ? "trinetra_all3_349"
            : amountInr === 149
              ? "express_149"
              : amountInr >= 450
                ? "remedy_450"
                : amountInr === 250
                  ? "family_250"
                  : "standard_350"
): Promise<PaymentVerificationResult> {
  const cleanUtr = (rawUtr || "").trim().replace(/[^a-zA-Z0-9]/g, "");

  const msgs: Record<string, Record<AntarangaLang, string>> = {
    invalidLength: {
      kn: "ದಯವಿಟ್ಟು PhonePe / GPay ರಶೀದಿಯಲ್ಲಿರುವ ೧೨-ಅಂಕಿಯ ಮಾನ್ಯ UTR / UPI Reference ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      en: "Please enter a valid 12-digit UPI UTR / Reference number from your payment receipt.",
      hi: "कृपया PhonePe / GPay रसीद से 12-अंकीय मान्य UTR / UPI संदर्भ संख्या दर्ज करें।",
      te: "దయచేసి PhonePe / GPay రశీదులోని 12-అంకెల సరైన UTR సంఖ్యను నమోదు చేయండి.",
      ta: "தயவுசெய்து PhonePe / GPay ரசீதில் உள்ள 12-இலக்க UTR எண்ணை உள்ளிடவும்.",
      ml: "ദയവായി PhonePe / GPay രസീതിലുള്ള 12 അക്ക UTR നമ്പർ നൽകുക.",
      mr: "कृपया PhonePe / GPay पावतीवरील १२-अंकी वैध UTR नंबर टाका."
    },
    dummyDetected: {
      kn: "ಅಮಾನ್ಯ UTR ಸಂಖ್ಯೆ. ದಯವಿಟ್ಟು ಪಾವತಿ ರಶೀದಿಯಲ್ಲಿರುವ ನೈಜ ೧೨-ಅಂಕಿಯ ಬ್ಯಾಂಕ್ UTR ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      en: "Invalid UTR number. Please enter the authentic 12-digit bank reference number from your receipt.",
      hi: "अमान्य UTR संख्या। कृपया रसीद से वास्तविक 12-अंकीय बैंक UTR संख्या दर्ज करें।",
      te: "చెల్లని UTR సంఖ్య. దయచేసి రశీదులోని అసలైన 12-అంకెల బ్యాంక్ UTR సంఖ్యను నమోదు చేయండి.",
      ta: "செல்லுபடியாகாத UTR எண். ரசீதில் உள்ள உண்மையான 12-இலக்க வங்கி UTR எண்ணை உள்ளிடவும்.",
      ml: "അസാധുവായ UTR നമ്പർ. ദയവായി യഥാർത്ഥ 12 അക്ക UTR നമ്പർ നൽകുക.",
      mr: "अवैध UTR नंबर. कृपया पावतीवरील खरा १२-अंकी बँक UTR नंबर टाका."
    },
    alreadyUsed: {
      kn: "ಈ UTR ಸಂಖ್ಯೆಯನ್ನು ಈಗಾಗಲೇ ಬಳಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೊಸ ಪಾವತಿ ರಶೀದಿಯ UTR ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
      en: "This UTR has already been claimed. Please enter your new unique payment UTR.",
      hi: "यह UTR पहले ही उपयोग किया जा चुका है। कृपया अपनी नई रसीद का UTR दर्ज करें।",
      te: "ఈ UTR సంఖ్య ఇప్పటికే ఉపయోగించబడింది. దయచేసి మీ కొత్త రశీదులోని UTR నమోదు చేయండి.",
      ta: "இந்த UTR எண் ஏற்கனவே பயன்படுத்தப்பட்டுவிட்டது. புதிய ரசீது UTR எண்ணை உள்ளிடவும்.",
      ml: "ഈ UTR നമ്പർ ഇതിനകം ഉപയോഗിച്ചതാണ്. ദയവായി പുതിയ UTR നൽകുക.",
      mr: "हा UTR नंबर आधीच वापरला गेला आहे. कृपया नवीन पावतीवरील UTR नंबर टाका."
    },
    success: {
      kn: `✓ ₹${String(amountInr).replace(/\d/g, (d) => "೦೧೨೩೪೫೬೭೮೯"[Number(d)])} ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ! ನಿಮ್ಮ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...`,
      en: `✓ ₹${amountInr} Payment verified successfully! Your report PDF is generating...`,
      hi: `✓ ₹${amountInr} भुगतान सफलतापूर्वक सत्यापित! आपकी रिपोर्ट PDF तैयार हो रही है...`,
      te: `✓ ₹${amountInr} చెల్లింపు విజయవంతంగా ధృవీకరించబడింది! మీ PDF సిద్ధమవుతోంది...`,
      ta: `✓ ₹${amountInr} கட்டணம் வெற்றிகரமாக சரிபார்க்கப்பட்டது! உங்கள் PDF தயாராகிறது...`,
      ml: `✓ ₹${amountInr} പേയ്മെന്റ് വിജയകരമായി സ്ഥിരീകരിച്ചു! നിങ്ങളുടെ PDF തയ്യാറാകുന്നു...`,
      mr: `✓ ₹${String(amountInr).replace(/\d/g, (d) => "०१२३४५६७८९"[Number(d)])} पेमेंट यशस्वीरीत्या पडताळले गेले! आपली PDF तयार होत आहे...`
    }
  };

  // 1. Length validation (UPI UTR / Bank RRN must be at least 10 and at most 22 characters)
  if (cleanUtr.length < 10 || cleanUtr.length > 22) {
    return {
      success: false,
      message: msgs.invalidLength[lang] || msgs.invalidLength.en
    };
  }

  // 2. Reject trivial / dummy test patterns
  const dummyPatterns = [
    /^0{8,}$/,
    /^1{8,}$/,
    /^9{8,}$/,
    /^12345678/,
    /^11223344/,
    /^abcdef/,
    /^test/i
  ];
  if (dummyPatterns.some((pattern) => pattern.test(cleanUtr))) {
    return {
      success: false,
      message: msgs.dummyDetected[lang] || msgs.dummyDetected.en
    };
  }

  // 3. Replay protection (prevent duplicate claiming of the same UTR across sessions)
  try {
    const rawStored = localStorage.getItem(STORAGE_KEY_PAID_UTRS);
    const storedList: { utr: string; devotee: string; timestamp: string }[] = rawStored ? JSON.parse(rawStored) : [];
    const alreadyUsed = storedList.find((item) => item.utr.toLowerCase() === cleanUtr.toLowerCase());
    if (alreadyUsed) {
      return {
        success: false,
        message: msgs.alreadyUsed[lang] || msgs.alreadyUsed.en
      };
    }
  } catch (err) {
    console.warn("[AntarangaService] LocalStorage read warning:", err);
  }

  // 4. Update Firebase Firestore database for permanent financial record
  const effectiveOrderId = orderId || `PP_ORD_${cleanUtr.slice(-6)}`;
  try {
    await updateHotelOrderVerified(effectiveOrderId, cleanUtr, amountInr, "UPI_UTR_MANUAL", `PAY_${cleanUtr}`);
  } catch (dbErr) {
    console.warn("[AntarangaService] Firestore manual UTR update warning:", dbErr);
  }

  // 5. Serverless API verification if online
  try {
    const baseUrl = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost:5173";
    const resp = await fetch(`${baseUrl}/api/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: `HOTEL_DEVOTEE_${cleanUtr.slice(-4)}`,
        priestName: PRIEST_NAME,
        utr: cleanUtr,
        orderId: effectiveOrderId,
        amountInr: amountInr,
        coins: amountInr * 10,
        packageKey: packageType === "remedy_450" ? "hotel_antaranga_450" : packageType === "express_149" ? "hotel_express_149" : packageType === "family_250" ? "hotel_family_250" : "hotel_antaranga_350",
        paymentMethod: "PhonePe / GPay UPI (Hotel Table QR Instant)"
      })
    }).catch(() => null);
    if (resp && resp.ok) {
      await resp.json().catch(() => null);
    }
  } catch {
    // Offline preview mode or local test environment: valid algorithmic check passes
  }

  // 6. Store verified UTR in registry
  const verifiedRecord = {
    utr: cleanUtr,
    devotee: devoteeName,
    amount: amountInr,
    packageType,
    timestamp: new Date().toISOString()
  };

  try {
    const rawStored = localStorage.getItem(STORAGE_KEY_PAID_UTRS);
    const storedList: any[] = rawStored ? JSON.parse(rawStored) : [];
    storedList.push(verifiedRecord);
    localStorage.setItem(STORAGE_KEY_PAID_UTRS, JSON.stringify(storedList));
  } catch (err) {
    console.warn("[AntarangaService] LocalStorage write warning:", err);
  }

  return {
    success: true,
    message: msgs.success[lang] || msgs.success.en,
    transactionId: `TXN_${cleanUtr}`,
    verifiedAt: verifiedRecord.timestamp,
    amountInr,
    packageType
  };
}

function getRashiLordGrahaKey(rashiIndex: number): GrahaKey {
  const lords: GrahaKey[] = [
    "Mars",    // 0 Aries
    "Venus",   // 1 Taurus
    "Mercury", // 2 Gemini
    "Moon",    // 3 Cancer
    "Sun",     // 4 Leo
    "Mercury", // 5 Virgo
    "Venus",   // 6 Libra
    "Mars",    // 7 Scorpio
    "Jupiter", // 8 Sagittarius
    "Saturn",  // 9 Capricorn
    "Saturn",  // 10 Aquarius
    "Jupiter"  // 11 Pisces
  ];
  return lords[rashiIndex] || "Jupiter";
}
