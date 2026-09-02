import SunCalc from "suncalc";
import { askGemini } from "../../core/GeminiEngine";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { calculateUnifiedBaggona } from "../../core/PanchangaCalculationDispatcher";
import { wallClockBirthToUtc } from "../../core/birthTime";
import { resolveSunTimesForJyotish } from "../../core/hinduSunTimes";
import type { MaranottaraLang } from "./maranottaraLocale";

export type MasikaDurationYears = 1 | 2 | 3 | 4 | 5;

export type MaranottaraInput = {
  personName: string;
  demiseDate: string; // YYYY-MM-DD (IST local date)
  demiseTime?: string; // HH:mm (IST local time)
  location?: string;
  yearsCount: MasikaDurationYears;
  lang?: MaranottaraLang;
  lat?: number;
  lng?: number;
};

export type MasikaScheduleItem = {
  monthIndex: number;
  masikaName: Record<string, string>;
  tithiName: Record<string, string>;
  gregorianDate: string; // YYYY-MM-DD (IST calendar date)
  formattedDateStr: Record<string, string>; // e.g. "24 Sep 2026"
  dayOfWeek: Record<string, string>;
  paksha: Record<string, string>;
  isVarshikaShraddha: boolean;
  isSpecialMilestone: boolean;
  ritualNotes: Record<string, string>;
  aparahnaWindow?: string; // e.g. "01:25 PM - 03:45 PM IST"
  panchangaSummary?: Record<string, string>;
};

export type AntyestiDailyRoadmapItem = {
  dayNumber: number;
  dayTitle: Record<string, string>;
  dateStr: string;
  rituals: Record<string, string>;
  significance: Record<string, string>;
  keyOfferings: Record<string, string>;
};

export type PoojaRemedyItem = {
  title: Record<string, string>;
  description: Record<string, string>;
  danaItems: Record<string, string>;
};

export type DoshaAnalysisResult = {
  hasPanchakaDosha: boolean;
  panchakaType?: Record<string, string>;
  hasNakshatraDosha: boolean;
  nakshatraDoshaType?: Record<string, string>;
  hasSandhyaRatriDosha: boolean;
  hasTimeSpecificAnalysis: boolean;
  doshaSummary: Record<string, string>;
  putthaliVidhanaRequired: boolean;
  putthaliCount?: number;
  recommendedPoojas: PoojaRemedyItem[];
};

export type AsthiVisarjanaGuide = {
  optimalTiming: Record<string, string>;
  sacredTirthas: Array<{
    name: Record<string, string>;
    location: Record<string, string>;
    spiritualSignificance: Record<string, string>;
  }>;
  procedureSteps: Record<string, string[]>;
  mantra: string;
};

export type GarudaPuranaWisdom = {
  soulJourneySummary: Record<string, string>;
  pindaDanaMeaning: Record<string, string>;
  vaitaraniGodanaImportance: Record<string, string>;
  mokshaPhilosophy: Record<string, string>;
};

export type MahalayaTarpanaRules = {
  mahalayaOverview: Record<string, string>;
  amavasyaTarpanaProcedure: Record<string, string>;
  essentialDanaItems: Record<string, string[]>;
};

export type GokarnaMokshaSevaInfo = {
  priestName: string;
  priestPhone: string;
  narayanabaliOverview: Record<string, string>;
  tripindiShraddhaOverview: Record<string, string>;
  kshetraImportance: Record<string, string>;
};

export type MaranottaraResult = {
  personName: string;
  demiseDate: string;
  demiseTime?: string;
  location: string;
  yearsCount: MasikaDurationYears;
  demiseTithi: Record<string, string>;
  demiseNakshatra: Record<string, string>;
  demisePaksha: Record<string, string>;
  demiseMasa?: Record<string, string>;
  demiseSamvatsara?: Record<string, string>;
  masikaSchedule: MasikaScheduleItem[];
  antyestiRoadmap: AntyestiDailyRoadmapItem[];
  doshaAnalysis: DoshaAnalysisResult;
  asthiGuide: AsthiVisarjanaGuide;
  garudaWisdom: GarudaPuranaWisdom;
  mahalayaRules: MahalayaTarpanaRules;
  gokarnaSevas: GokarnaMokshaSevaInfo;
  aiConsolationText?: string;
  generatedAt: string;
};

// IST Offset (+05:30 = 330 minutes)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export const WEEKDAYS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
  1: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
  2: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்" },
  3: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
  4: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
  5: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
  6: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" }
};

export const PAKSHAS_5LANG: Record<string, Record<string, string>> = {
  shukla: {
    kn: "ಶುಕ್ಲ ಪಕ್ಷ",
    en: "Shukla Paksha",
    hi: "शुक्ल पक्ष",
    te: "శుక్ల పక్షం",
    ta: "சுக்ல பக்ஷம்"
  },
  krishna: {
    kn: "ಕೃಷ್ಣ ಪಕ್ಷ",
    en: "Krishna Paksha",
    hi: "कृष्ण पक्ष",
    te: "కృష్ణ పక్షం",
    ta: "கிருஷ்ண பக்ஷம்"
  }
};

export const TITHIS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಶುಕ್ಲ ಪಾಡ್ಯ (ಪ್ರಥಮಾ)", en: "Shukla Pratipada", hi: "शुक्ल प्रतिपदा", te: "శుక్ల పాడ్యమి", ta: "சுக்ல பிரதமை" },
  1: { kn: "ಶುಕ್ಲ ಬಿದಿಗೆ (ದ್ವಿತೀಯಾ)", en: "Shukla Dvitiya", hi: "शुक्ल द्वितीया", te: "శుక్ల విదియ", ta: "சுக்ல துவிதியை" },
  2: { kn: "ಶುಕ್ಲ ತದಿಗೆ (ತೃತೀಯಾ)", en: "Shukla Tritiya", hi: "शुक्ल तृतीया", te: "శుక్ల తదియ", ta: "சுக்ல திருதியை" },
  3: { kn: "ಶುಕ್ಲ ಚೌತಿ (ಚತುರ್ಥೀ)", en: "Shukla Chaturthi", hi: "शुक्ल चतुर्थी", te: "శుక్ల చవితి", ta: "சுக்ல சதுர்த்தி" },
  4: { kn: "ಶುಕ್ಲ ಪಂಚಮೀ", en: "Shukla Panchami", hi: "शुक्ल पंचमी", te: "శుక్ల పంచమి", ta: "சுக்ல பஞ்சமி" },
  5: { kn: "ಶುಕ್ಲ ಷಷ್ಠೀ", en: "Shukla Shashthi", hi: "शुक्ल षष्ठी", te: "శుక్ల షష్ఠి", ta: "சுக்ல சஷ்டி" },
  6: { kn: "ಶುಕ್ಲ ಸಪ್ತಮೀ", en: "Shukla Saptami", hi: "शुक्ल सप्तमी", te: "శుక్ల సప్తమి", ta: "சுக்ல சப்தமி" },
  7: { kn: "ಶುಕ್ಲ ಅಷ್ಟಮೀ", en: "Shukla Ashtami", hi: "शुक्ल अष्टमी", te: "శుక్ల అష్టమి", ta: "சுக்ல அஷ்டமி" },
  8: { kn: "ಶುಕ್ಲ ನವಮೀ", en: "Shukla Navami", hi: "शुक्ल नवमी", te: "శుక్ల నవమి", ta: "சுக்ல நவமி" },
  9: { kn: "ಶುಕ್ಲ ದಶಮೀ", en: "Shukla Dashami", hi: "शुक्ल दशमी", te: "శుక్ల దశమి", ta: "சுக்ல தசமி" },
  10: { kn: "ಶುಕ್ಲ ಏಕಾದಶೀ", en: "Shukla Ekadashi", hi: "शुक्ल एकादशी", te: "శుక్ల ఏకాదశి", ta: "சுக்ல ஏகாதசி" },
  11: { kn: "ಶುಕ್ಲ ದ್ವಾದಶೀ", en: "Shukla Dvadashi", hi: "शुक्ल द्वादशी", te: "శుక్ల ద్వాదశి", ta: "சுக்ல துவாதசி" },
  12: { kn: "ಶುಕ್ಲ ತ್ರಯೋದಶೀ", en: "Shukla Trayodashi", hi: "शुक्ल त्रयोदशी", te: "శుక్ల త్రయోదశి", ta: "சுக்ல திரயோதசி" },
  13: { kn: "ಶುಕ್ಲ ಚತುರ್ದಶೀ", en: "Shukla Chaturdashi", hi: "शुक्ल चतुर्दशी", te: "శుక్ల చతుర్దశి", ta: "சுக்ல சதுர்த்தசி" },
  14: { kn: "ಹುಣ್ಣಿಮೆ (ಪೂರ್ಣಿಮಾ)", en: "Purnima", hi: "पूर्णिमा", te: "పూర్ణిమ", ta: "பௌர்ணமி" },
  15: { kn: "ಕೃಷ್ಣ ಪಾಡ್ಯ (ಪ್ರಥಮಾ)", en: "Krishna Pratipada", hi: "कृष्ण प्रतिपदा", te: "కృష్ణ పాడ్యమి", ta: "கிருஷ்ண பிரதமை" },
  16: { kn: "ಕೃಷ್ಣ ಬಿದಿಗೆ (ದ್ವಿತೀಯಾ)", en: "Krishna Dvitiya", hi: "कृष्ण द्वितीया", te: "కృష్ణ విదియ", ta: "கிருஷ்ண துவிதியை" },
  17: { kn: "ಕೃಷ್ಣ ತದಿಗೆ (ತೃತೀಯಾ)", en: "Krishna Tritiya", hi: "कृष्ण तृतीया", te: "కృష్ణ తదియ", ta: "கிருஷ்ண திருதியை" },
  18: { kn: "ಕೃಷ್ಣ ಚೌತಿ (ಚತುರ್ಥೀ)", en: "Krishna Chaturthi", hi: "कृष्ण चतुर्थी", te: "కృష్ణ చవితి", ta: "கிருஷ்ண சதுர்த்தி" },
  19: { kn: "ಕೃಷ್ಣ ಪಂಚಮೀ", en: "Krishna Panchami", hi: "कृष्ण पंचमी", te: "కృష్ణ పంచమి", ta: "கிருஷ்ண பஞ்சமி" },
  20: { kn: "ಕೃಷ್ಣ ಷಷ್ಠೀ", en: "Krishna Shashthi", hi: "कृष्ण षष्ठी", te: "కృష్ణ షష్ఠి", ta: "கிருஷ்ண சஷ்டி" },
  21: { kn: "ಕೃಷ್ಣ ಸಪ್ತಮೀ", en: "Krishna Saptami", hi: "कृष्ण सप्तमी", te: "కృష్ణ సప్తమి", ta: "கிருஷ்ண சப்தமி" },
  22: { kn: "ಕೃಷ್ಣ ಅಷ್ಟಮೀ", en: "Krishna Ashtami", hi: "कृष्ण अष्टमी", te: "కృష్ణ అష్టమి", ta: "கிருஷ்ண அஷ்டமி" },
  23: { kn: "ಕೃಷ್ಣ ನವಮೀ", en: "Krishna Navami", hi: "कृष्ण नवमी", te: "కృష్ణ నవమి", ta: "கிருஷ்ண நவமி" },
  24: { kn: "ಕೃಷ್ಣ ದಶಮೀ", en: "Krishna Dashami", hi: "कृष्ण दशमी", te: "కృష్ణ దశమి", ta: "கிருஷ்ண தசமி" },
  25: { kn: "ಕೃಷ್ಣ ಏಕಾದಶೀ", en: "Krishna Ekadashi", hi: "कृष्ण एकादशी", te: "కృష్ణ ఏకాదశి", ta: "கிருஷ்ண ஏகாதசி" },
  26: { kn: "ಕೃಷ್ಣ ದ್ವಾದಶೀ", en: "Krishna Dvadashi", hi: "कृष्ण द्वादशी", te: "కృష్ణ ద్వాదశి", ta: "கிருஷ்ண துவாதசி" },
  27: { kn: "ಕೃಷ್ಣ ತ್ರಯೋದಶೀ", en: "Krishna Trayodashi", hi: "कृष्ण त्रयोदशी", te: "కృష్ణ త్రయోదశి", ta: "கிருஷ்ண திரயோதசி" },
  28: { kn: "ಕೃಷ್ಣ ಚತುರ್ದಶೀ", en: "Krishna Chaturdashi", hi: "कृष्ण चतुर्दशी", te: "కృష్ణ చతుర్దశి", ta: "கிருஷ்ண சதுர்த்தசி" },
  29: { kn: "ಅಮಾವಾಸ್ಯೆ", en: "Amavasya", hi: "अमावस्या", te: "అమావాస్య", ta: "அமாவாசை" }
};

export const NAKSHATRAS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", te: "అశ్విని", ta: "அஸ்வினி" },
  1: { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", te: "భరణి", ta: "பரணி" },
  2: { kn: "ಕೃತ್ತಿಕಾ", en: "Krittika", hi: "कृत्तिका", te: "కృత్తిక", ta: "கார்த்திகை" },
  3: { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", te: "రోహిణి", ta: "ரோகிணி" },
  4: { kn: "ಮೃಗಶಿರಾ", en: "Mrigashira", hi: "मृगशिरा", te: "మృగశిర", ta: "மிருகசீரிஷம்" },
  5: { kn: "ಆರ್ದ್ರಾ", en: "Ardra", hi: "आर्द्रा", te: "ఆర్ద్ర", ta: "திருவாதிரை" },
  6: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", te: "పునర్వసు", ta: "புனர்பூசம்" },
  7: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", te: "పుష్యమి", ta: "பூசம்" },
  8: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "आश्लेषा", te: "ఆశ్లేష", ta: "ஆயில்யம்" },
  9: { kn: "ಮಘಾ", en: "Magha", hi: "मघा", te: "మఖ", ta: "மகம்" },
  10: { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ (ಪುಬ್ಬಾ)", en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", te: "పూర్వ ఫల్గుణి", ta: "பூரம்" },
  11: { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ (ಉತ್ತರಾ)", en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்" },
  12: { kn: "ಹಸ್ತಾ", en: "Hasta", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்" },
  13: { kn: "ಚಿತ್ರಾ", en: "Chitra", hi: "चित्रा", te: "చిత్త", ta: "சித்திரை" },
  14: { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", te: "స్వాతి", ta: "சுவாதி" },
  15: { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", te: "విశాఖ", ta: "விசாகம்" },
  16: { kn: "ಅನುರಾಧಾ", en: "Anuradha", hi: "अनुराधा", te: "అనూరాధ", ta: "அனுஷம்" },
  17: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", te: "జ్యేష్ఠ", ta: "கேட்டை" },
  18: { kn: "ಮೂಲಾ", en: "Mula", hi: "मूल", te: "మూల", ta: "மூலம்" },
  19: { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ", ta: "பூராடம்" },
  20: { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்" },
  21: { kn: "ಶ್ರವಣ", en: "Shravana", hi: "श्रवण", te: "శ్రవణం", ta: "திருவோணம்" },
  22: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", te: "ధనిష్ఠ", ta: "அவிட்டம்" },
  23: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", te: "శతభిషం", ta: "சதயம்" },
  24: { kn: "ಪೂರ್ವಭಾದ್ರಪದಾ", en: "Purva Bhadrapada", hi: "पूर्व भाद्रपद", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி" },
  25: { kn: "ಉತ್ತರಭಾದ್ರಪದಾ", en: "Uttara Bhadrapada", hi: "उत्तर भाद्रपद", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி" },
  26: { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", te: "రేవతి", ta: "ரேவதி" }
};

export const MASAS_5LANG: Record<number, Record<string, string>> = {
  0: { kn: "ಚೈತ್ರ", en: "Chaitra", hi: "चैत्र", te: "చైత్రం", ta: "சித்திரை" },
  1: { kn: "ವೈಶಾಖ", en: "Vaishakha", hi: "वैशाख", te: "వైశాఖం", ta: "வைகாசி" },
  2: { kn: "ಜ್ಯೇಷ್ಠ", en: "Jyeshtha", hi: "ज्येष्ठ", te: "జ్యేష్ఠం", ta: "ஆனி" },
  3: { kn: "ಆಷಾಢ", en: "Ashadha", hi: "आषाढ़", te: "ఆషాఢం", ta: "ஆடி" },
  4: { kn: "ಶ್ರಾವಣ", en: "Shravana", hi: "श्रावण", te: "శ్రావణం", ta: "ஆவணி" },
  5: { kn: "ಭಾದ್ರಪದ", en: "Bhadrapada", hi: "भाद्रपद", te: "భాద్రపదం", ta: "புரட்டாசி" },
  6: { kn: "ಆಶ್ವಯುಜ", en: "Ashvina", hi: "आश्विन", te: "ఆశ్వయుజం", ta: "ஐப்பசி" },
  7: { kn: "ಕಾರ್ತೀಕ", en: "Kartika", hi: "कार्तिक", te: "కార్తీకం", ta: "கார்த்திகை" },
  8: { kn: "ಮಾರ್ಗಶಿರ", en: "Margashira", hi: "मार्गशीर्ष", te: "మార్గాశిరం", ta: "மார்கழி" },
  9: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पौष", te: "పుష్యం", ta: "தை" },
  10: { kn: "ಮಾಘ", en: "Magha", hi: "माघ", te: "మాఘం", ta: "மாசி" },
  11: { kn: "ಫಾಲ್ಗುಣ", en: "Phalguna", hi: "फाल्गुन", te: "ఫాల్గుణం", ta: "பங்குனி" }
};

/** Convert a Date object to formatted display string in Indian Standard Time (IST) */
export function formatIstDateDisplay(d: Date, lang: string = "kn"): string {
  const istMs = d.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istMs);
  const day = istDate.getUTCDate();
  const monthIdx = istDate.getUTCMonth();
  const year = istDate.getUTCFullYear();

  const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsHi = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  const monthsTe = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"];
  const monthsTa = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];

  if (lang === "kn") return `${day} ${monthsKn[monthIdx]} ${year}`;
  if (lang === "hi") return `${day} ${monthsHi[monthIdx]} ${year}`;
  if (lang === "te") return `${day} ${monthsTe[monthIdx]} ${year}`;
  if (lang === "ta") return `${day} ${monthsTa[monthIdx]} ${year}`;
  return `${day} ${monthsEn[monthIdx]} ${year}`;
}

/** Convert a Date object to YYYY-MM-DD string in Indian Standard Time (IST) */
export function toIstYmdString(d: Date): string {
  const istMs = d.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istMs);
  const y = istDate.getUTCFullYear();
  const m = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Compute IST Day of Week index (0 = Sunday .. 6 = Saturday) */
export function getIstWeekday(d: Date): number {
  const istMs = d.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istMs);
  return istDate.getUTCDay();
}

/** Calculate astronomical Tithi index (0..29) and metadata for any given UTC timestamp */
export function getTithiFromUtc(utcDate: Date): {
  tithiIndex: number; // 0..29
  tithiNumber: number; // 1..15
  isShukla: boolean;
  tithi5Lang: Record<string, string>;
  paksha5Lang: Record<string, string>;
} {
  const longs = siderealLongitudes(utcDate, "lahiri");
  const diff = (longs.moon - longs.sun + 360) % 360;
  const tithiIndex = Math.floor(diff / 12) % 30; // 0 to 29
  const isShukla = tithiIndex < 15;
  const tithiNumber = (tithiIndex % 15) + 1; // 1 to 15

  const tithi5Lang = TITHIS_5LANG[tithiIndex] || TITHIS_5LANG[0];
  const paksha5Lang = isShukla ? PAKSHAS_5LANG.shukla : PAKSHAS_5LANG.krishna;

  return {
    tithiIndex,
    tithiNumber,
    isShukla,
    tithi5Lang,
    paksha5Lang
  };
}

/** Compute local Aparahna Kaala window (3/5 to 4/5 of daytime) for a given calendar day in IST */
export function computeDayAparahnaWindow(
  dateStr: string,
  lat: number = 14.5479,
  lng: number = 74.3188
): {
  aparahnaStartUtc: Date;
  aparahnaEndUtc: Date;
  aparahnaMidUtc: Date;
  windowLabel: string;
} {
  const [y, m, d] = dateStr.split("-").map(Number);
  const localDate = new Date(Date.UTC(y, m - 1, d, 6, 0, 0)); // approximate day
  const scTimes = SunCalc.getTimes(localDate, lat, lng);
  const sunTimes = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, lat, lng);

  const sunriseMs = sunTimes.sunrise.getTime();
  const sunsetMs = sunTimes.sunset.getTime();
  const daySpanMs = Math.max(10 * 3600 * 1000, sunsetMs - sunriseMs);

  const startMs = sunriseMs + (3 / 5) * daySpanMs;
  const endMs = sunriseMs + (4 / 5) * daySpanMs;
  const midMs = (startMs + endMs) / 2;

  const toIstHm = (utcMs: number) => {
    const ist = new Date(utcMs + IST_OFFSET_MS);
    const h = ist.getUTCHours();
    const min = ist.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
  };

  return {
    aparahnaStartUtc: new Date(startMs),
    aparahnaEndUtc: new Date(endMs),
    aparahnaMidUtc: new Date(midMs),
    windowLabel: `${toIstHm(startMs)} - ${toIstHm(endMs)} IST`
  };
}

/**
 * Authentic Baggona Panchanga Shraddha Tithi determination:
 * Finds the exact Gregorian date carrying the demise Tithi during Aparahna Kaala (ಅಪರಾಹ್ನ ಕಾಲ).
 */
export function findBaggonaMasikaShraddhaDate(
  demiseTithiIndex: number,
  monthOffset: number,
  demiseUtc: Date,
  lat: number = 14.5479,
  lng: number = 74.3188
): {
  matchedUtc: Date;
  aparahnaWindow: string;
  panchangaDay?: any;
} {
  // Center of the target lunar cycle
  const approxSynodicMs = 29.530588 * 24 * 60 * 60 * 1000;
  const centerMs = demiseUtc.getTime() + monthOffset * approxSynodicMs;

  let bestDate = new Date(centerMs);
  let bestWindow = "01:30 PM - 03:45 PM IST";
  let minDiff = 999;
  let bestPanchanga: any = null;

  // Search a ±4 day window around center
  for (let offsetDays = -4; offsetDays <= 4; offsetDays++) {
    const candidateMs = centerMs + offsetDays * 24 * 60 * 60 * 1000;
    const testDate = new Date(candidateMs);
    const dateStr = toIstYmdString(testDate);

    const { aparahnaMidUtc, windowLabel } = computeDayAparahnaWindow(dateStr, lat, lng);
    const tithiInfo = getTithiFromUtc(aparahnaMidUtc);

    let tithiDiff = Math.abs(tithiInfo.tithiIndex - demiseTithiIndex);
    if (tithiDiff > 15) {
      tithiDiff = 30 - tithiDiff;
    }

    if (tithiDiff === 0) {
      // Exact Aparahna match
      try {
        const pDay = calculateUnifiedBaggona(dateStr, "14:00", lat, lng, "lahiri");
        return {
          matchedUtc: aparahnaMidUtc,
          aparahnaWindow: windowLabel,
          panchangaDay: pDay
        };
      } catch (_) {
        return {
          matchedUtc: aparahnaMidUtc,
          aparahnaWindow: windowLabel
        };
      }
    }

    if (tithiDiff < minDiff) {
      minDiff = tithiDiff;
      bestDate = aparahnaMidUtc;
      bestWindow = windowLabel;
      try {
        bestPanchanga = calculateUnifiedBaggona(dateStr, "14:00", lat, lng, "lahiri");
      } catch (_) {}
    }
  }

  return {
    matchedUtc: bestDate,
    aparahnaWindow: bestWindow,
    panchangaDay: bestPanchanga
  };
}

/** 13-Day Antyesti & Asoucha Roadmap anchored to IST with 5-language descriptions */
export function compute12DaysRoadmap(demiseDateStr: string, demiseTime?: string): AntyestiDailyRoadmapItem[] {
  const [y, m, d] = demiseDateStr.split("-").map(Number);
  const timeParts = (demiseTime || "12:00").split(":").map(Number);
  const hh = timeParts[0] || 12;
  const mm = timeParts[1] || 0;

  // Base UTC date corresponding to IST wall-clock time
  const baseUtcMs = Date.UTC(y, m - 1, d, hh, mm) - IST_OFFSET_MS;
  const roadmap: AntyestiDailyRoadmapItem[] = [];

  const dayConfigs = [
    {
      day: 1,
      title: {
        kn: "೧ನೇ ದಿನ: ದಹನ ಸಂಸ್ಕಾರ, ಅಸ್ಥಿ ಸಂಚಯನ & ದೀಪ ಸ್ಥಾಪನೆ",
        en: "Day 1: Cremation (Dahana Samskara), Asthi Sanchayana & Akhanda Deepa",
        hi: "प्रथम दिन: दाह संस्कार, अस्थि संचयन एवं अखंड दीप",
        te: "1వ రోజు: దహన సంస్కారం, అస్థి సంచయనం & అఖండ దీపం",
        ta: "1ம் நாள்: தகன சம்ஸ்காரம், அஸ்தி சஞ்சயனம் & தீப ஸ்தாபனம்"
      },
      rituals: {
        kn: "ಶಾಸ್ತ್ರೋಕ್ತ ಚಿತಾ ಸಂಸ್ಕಾರ, ೧ನೇ ಪಿಂಡ ಪ್ರದಾನ (ಶಿರ ನಿರ್ಮಾಣ), ಅಸ್ಥಿ ಸಂಚಯನ, ಗೃಹದಲ್ಲಿ ನಿರಂತರ ತಿಲ ತೈಲ ದೀಪ (ಅಖಂಡ ದೀಪ) ಸ್ಥಾಪನೆ.",
        en: "Vedic cremation, 1st Pinda Dana (Head formation), Asthi collection, and continuous sesame-oil lamp lighting.",
        hi: "शास्त्रोक्त दाह संस्कार, प्रथम पिंड दान (शिर निर्माण), अस्थि संचयन एवं अखंड दीप प्रज्वलन।",
        te: "శాస్త్రోక్త దహన సంస్కారం, 1వ పిండ ప్రదానం, అస్థి సంచయనం మరియు అఖండ దీప స్థాపన.",
        ta: "தகன சம்ஸ்காரம், 1ம் பிண்ட தானம், அஸ்தி எடுத்தல், அகண்ட தீப ஸ்தாபனம்."
      },
      significance: {
        kn: "ಜೀವವು ಭೌತಿಕ ಶರೀರವನ್ನು ತ್ಯಜಿಸಿ ಸೂಕ್ಷ್ಮ ಯಾತನಾ ದೇಹ ಧಾರಣೆಗೆ ಮೊದಲ ಹೆಜ್ಜೆಯಿಡುತ್ತದೆ. ೧ನೇ ಪಿಂಡದಿಂದ ಶಿರ ಭಾಗವು ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.",
        en: "Soul departs physical vessel; 1st Pinda constructs the subtle head of the Yatana body.",
        hi: "आत्मा स्थूल देह त्यागकर सूक्ष्म देह धारण करती है। प्रथम पिंड से सिर का निर्माण होता है।",
        te: "స్థూల శరీరాన్ని వదిలి సూక్ష్మ శరీర ధారణ ప్రారంభమవుతుంది. 1వ పిండంతో శిరస్సు నిర్మాణం.",
        ta: "சூட்சும உடல் உருவாக்கம் தொடங்குகிறது. 1ம் பிண்டத்தால் தலைப் பகுதி உருவாகிறது."
      },
      keyOfferings: {
        kn: "ದರ್ಭೆ, ಕಪ್ಪು ಎಳ್ಳು, ಮಣ್ಣಿನ ಪಾತ್ರೆ, ಜಲ, ಹತ್ತಿ ಬತ್ತಿ.",
        en: "Darbha, Black sesame, Earthen pot, Water, Lamp.",
        hi: "दर्भ, काले तिल, मिट्टी का पात्र, जल।",
        te: "దర్భ, నల్ల నువ్వులు, మట్టి పాత్ర, జలం.",
        ta: "தர்ப்பை, கருப்பு எள், மண்பாண்டம், நீர்."
      }
    },
    {
      day: 2,
      title: {
        kn: "೨ನೇ ದಿನ: ಪ್ರಥಮ ತಿಲಾಂಜಲಿ & ವಾಸೋದಕ ಸಮರ್ಪಣೆ",
        en: "Day 2: First Tilanjali & Vasodaka Libations",
        hi: "द्वितीय दिन: प्रथम तिलांजलि एवं वासोदक समर्पण",
        te: "2వ రోజు: ప్రథమ తిలాంజలి & వాసోదక సమర్పణ",
        ta: "2ம் நாள்: திலாஞ்சலி & வாசோதகம்"
      },
      rituals: {
        kn: "ನದಿ/ತೀರ್ಥ ತೀರದಲ್ಲಿ ದರ್ಭೆಯ ಮುಖಾಂತರ ೧ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ, ವಸ್ತ್ರ ಹಿಂಡಿ ನೀರು ಕೊಡುವ 'ವಾಸೋದಕ' ವಿಧಿ.",
        en: "1 handful of Tilanjali (sesame water) libation and Vasodaka oblation.",
        hi: "तट पर दर्भ द्वारा 1 अंजलि तिलांजलि एवं वासोदक अर्पण।",
        te: "1 దోసిలి తిలాంజలి మరియు వాసోదక సమర్పణ.",
        ta: "1 அஞ்சலி திலாஞ்சலி மற்றும் வாசோதக சமர்ப்பணம்."
      },
      significance: {
        kn: "ಪ್ರೇತಾವಸ್ಥೆಯಲ್ಲಿರುವ ಆತ್ಮದ ತೀವ್ರ ದಾಹ ಹಾಗೂ ಶ್ರಮ ಶಮನಕ್ಕೆ ಜಲ-ತಿಲಾಂಜಲಿ ಅತ್ಯಂತ ತೃಪ್ತಿದಾಯಕ.",
        en: "Quenches intense post-transition thirst and comforts the soul.",
        hi: "आत्मा की तृषा एवं ताप का शमन होता है।",
        te: "ఆత్మ దాహాన్ని తీర్చి శాంతిని కలిగిస్తుంది.",
        ta: "ஆன்மாவின் தாகத்தைத் தணித்து அமைதி அளிக்கிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು, ತೀರ್ಥ, ಹಾಲು.",
        en: "Rice Pinda, Black sesame, Milk, Holy water.",
        hi: "अन्न पिंड, काले तिल, दूध, जल।",
        te: "అన్న పిండం, నల్ల నువ్వులు, పాలు.",
        ta: "அன்ன பிண்டம், கருப்பு எள், தீர்த்தம், பால்."
      }
    },
    {
      day: 3,
      title: {
        kn: "೩ನೇ ದಿನ: ದ್ವಿತೀಯ ಪಿಂಡ ಪ್ರದಾನ (ಕಣ್ಣು, ಕಿವಿ & ಮೂಗು ನಿರ್ಮಾಣ)",
        en: "Day 3: 2nd Pinda Dana (Eyes, Ears & Nose)",
        hi: "तृतीय दिन: द्वितीय पिंड दान (नेत्र, कर्ण एवं नासिका)",
        te: "3వ రోజు: 2వ పిండ ప్రదానం (కళ్లు, చెవులు & ముక్కు)",
        ta: "3ம் நாள்: 2ம் பிண்ட தானம் (கண், காது, மூக்கு)"
      },
      rituals: {
        kn: "೨ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೨ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ, ಹಾಲು ಹಾಗೂ ನೀರು ಸಮರ್ಪಣೆ.",
        en: "Offering 2nd Pinda, 2 handfuls of Tilanjali, milk and water oblations.",
        hi: "द्वितीय पिंड अर्पण, 2 अंजलि तिलांजलि, दुग्ध एवं जल दान।",
        te: "2వ పిండ సమర్పణ, 2 దోసిళ్ల తిలాంజలి, పాలు మరియు నీటి సమర్పణ.",
        ta: "2ம் பிண்ட சமர்ப்பணம், 2 அஞ்சலி திலாஞ்சலி, பால் & தீர்த்தம்."
      },
      significance: {
        kn: "೨ನೇ ಪಿಂಡದಿಂದ ಕಣ್ಣು, ಕಿವಿ ಮತ್ತು ನಾಸಿಕ ಸೂಕ್ಷ್ಮ ಅಂಗಗಳು ರೂಪುಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 2nd Pinda constructs the subtle organs of perception (eyes, ears, nose).",
        hi: "द्वितीय पिंड से सूक्ष्म नेत्र, कर्ण तथा नासिका निर्मित होते हैं।",
        te: "2వ పిండంతో కళ్లు, చెవులు మరియు నాసిక రూపొందుతాయి.",
        ta: "இரண்டாம் பிண்டத்தால் கண், காது, மூக்கு உருவாகிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ದರ್ಭೆ, ಕಪ್ಪು ಎಳ್ಳು.",
        en: "Rice Pinda, Darbha, Black sesame.",
        hi: "अन्न पिंड, दर्भ, काले तिल।",
        te: "అన్న పిండం, దర్భ, నల్ల నువ్వులు.",
        ta: "அன்ன பிண்டம், தர்ப்பை, எள்."
      }
    },
    {
      day: 4,
      title: {
        kn: "೪ನೇ ದಿನ: ತೃತೀಯ ಪಿಂಡ ಪ್ರದಾನ (ಕಂಠ, ಭುಜ & ಎದೆ ನಿರ್ಮಾಣ)",
        en: "Day 4: 3rd Pinda Dana (Throat, Shoulders & Chest)",
        hi: "चतुर्थ दिन: तृतीय पिंड दान (कंठ, कंधे एवं वक्ष)",
        te: "4వ రోజు: 3వ పిండ ప్రదానం (కంఠం, భుజాలు & ఛాతీ)",
        ta: "4ம் நாள்: 3ம் பிண்ட தானம் (கழுத்து, மார்பு)"
      },
      rituals: {
        kn: "೩ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೩ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಮತ್ತು ಪಿತೃ ಮಂತ್ರ ಪಠಣ.",
        en: "Offering 3rd Pinda, 3 libations of Tilanjali, and sacred Vedic ancestral chants.",
        hi: "तृतीय पिंड अर्पण, 3 अंजलि तिलांजलि एवं पितृ मंत्र पाठ।",
        te: "3వ పిండ సమర్పణ, 3 దోసిళ్ల తిలాంజలి మరియు పితృ మంత్ర పఠనం.",
        ta: "3ம் பிண்ட சமர்ப்பணம், 3 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೩ನೇ ಪಿಂಡದಿಂದ ಕಂಠ, ಭುಜ ಹಾಗೂ ಎದೆಯ ಸೂಕ್ಷ್ಮ ಭಾಗವು ರೂಪುಗೊಳ್ಳುತ್ತದೆ.",
        en: "The 3rd Pinda forms the throat, arms, and subtle heart-chest region.",
        hi: "तृतीय पिंड से कंठ, बाहु एवं वक्षस्थल का निर्माण होता है।",
        te: "3వ పిండంతో కంఠం, భుజాలు మరియు ఛాతీ భాగం రూపొందుతుంది.",
        ta: "கழுத்து மற்றும் மார்புப் பகுதி உருவாகிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು, ಮಂತ್ರಜಲ.",
        en: "Rice Pinda, Black sesame, Sanctified water.",
        hi: "अन्न पिंड, काले तिल, मंत्र जल।",
        te: "అన్న పిండం, నల్ల నువ్వులు, మంత్ర జలం.",
        ta: "அன்ன பிண்டம், எள், மந்திர தீர்த்தம்."
      }
    },
    {
      day: 5,
      title: {
        kn: "೫ನೇ ದಿನ: ಚತುರ್ಥ ಪಿಂಡ ಪ್ರದಾನ (ನಾಭಿ & ಉದರ ನಿರ್ಮಾಣ)",
        en: "Day 5: 4th Pinda Dana (Navel & Abdomen)",
        hi: "पंचम दिन: चतुर्थ पिंड दान (नाभि एवं उदर)",
        te: "5వ రోజు: 4వ పిండ ప్రదానం (నాభి & ఉదరం)",
        ta: "5ம் நாள்: 4ம் பிண்ட தானம் (தொப்புள், வயிறு)"
      },
      rituals: {
        kn: "೪ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೪ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಹಾಗೂ ನಿರಂತರ ದೀಪ ತೈಲ ಪೂರಣ.",
        en: "Offering 4th Pinda, 4 libations of Tilanjali, and refilling the continuous Akhanda Deepa.",
        hi: "चतुर्थ पिंड अर्पण, 4 अंजलि तिलांजलि तथा अखंड दीप में तैल पूरण।",
        te: "4వ పిండ సమర్పణ, 4 దోసిళ్ల తిలాంజలి మరియు అఖండ దీప నిర్వహణ.",
        ta: "4ம் பிண்ட சமர்ப்பணம், 4 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೪ನೇ ಪಿಂಡದಿಂದ ನಾಭಿ ಮತ್ತು ಉದರ ಕೋಶಗಳು ಸೂಕ್ಷ್ಮವಾಗಿ ಸಿದ್ಧಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 4th Pinda builds the navel, digestive fire, and abdominal subtle core.",
        hi: "चतुर्थ पिंड से नाभि एवं उदर का सूक्ष्म गठन होता है।",
        te: "4వ పిండంతో నాభి మరియు ఉదర కోశాలు రూపుదిద్దుకుంటాయి.",
        ta: "தொப்புள் மற்றும் வயிறுப் பகுதி உருவாகிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ತಾಮ್ರ ಪಾತ್ರೆ ಜಲ.",
        en: "Rice Pinda, Copper vessel water.",
        hi: "अन्न पिंड, ताम्र पात्र जल।",
        te: "అన్న పిండం, రాగి పాత్ర జలం.",
        ta: "அன்ன பிண்டம், தாமிர பாத்திர தீர்த்தம்."
      }
    },
    {
      day: 6,
      title: {
        kn: "೬ನೇ ದಿನ: ಪಂಚಮ ಪಿಂಡ ಪ್ರದಾನ (ಕಟಿ & ತೊಡೆಗಳ ನಿರ್ಮಾಣ)",
        en: "Day 6: 5th Pinda Dana (Waist & Thighs)",
        hi: "षष्ठ दिन: पंचम पिंड दान (कटि एवं जंघा)",
        te: "6వ రోజు: 5వ పిండ ప్రదానం (నడుము & తొడలు)",
        ta: "6ம் நாள்: 5ம் பிண்ட தானம் (இடுப்பு, தொடைகள்)"
      },
      rituals: {
        kn: "೫ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ ಮತ್ತು ೫ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ.",
        en: "Offering 5th Pinda and 5 oblations of sesame-infused water.",
        hi: "पंचम पिंड अर्पण तथा 5 अंजलि तिलांजलि।",
        te: "5వ పిండ సమర్పణ మరియు 5 దోసిళ్ల తిలాంజలి.",
        ta: "5ம் பிண்ட சமர்ப்பணம், 5 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೫ನೇ ಪಿಂಡದಿಂದ ಕಟಿ, ತೊಡೆ ಮತ್ತು ಜನನಾಂಗಗಳ ಸೂಕ್ಷ್ಮ ರೂಪ ನಿರ್ಮಾಣ.",
        en: "The 5th Pinda forms the subtle waist, hips, and thighs.",
        hi: "पंचम पिंड से कटि तथा जंघाओं का सूक्ष्म निर्माण होता है।",
        te: "5వ పిండంతో నడుము మరియు తొడలు రూపొందుతాయి.",
        ta: "இடுப்பு மற்றும் தொடைகள் உருவாகின்றன."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ದರ್ಭೆ, ಜಲ.",
        en: "Rice Pinda, Darbha, Water.",
        hi: "अन्न पिंड, दर्भ, जल।",
        te: "అన్న పిండం, దర్భ, జలం.",
        ta: "அன்ன பிண்டம், தர்ப்பை."
      }
    },
    {
      day: 7,
      title: {
        kn: "೭ನೇ ದಿನ: ಷಷ್ಠ ಪಿಂಡ ಪ್ರದಾನ (ಮರ್ಮಸ್ಥಾನ & ನರಮಂಡಲ)",
        en: "Day 7: 6th Pinda Dana (Vital Energy Points & Nerves)",
        hi: "सप्तम दिन: षष्ठ पिंड दान (मर्म स्थान एवं नाड़ी मंडल)",
        te: "7వ రోజు: 6వ పిండ ప్రదానం (మర్మ స్థానాలు & నాడులు)",
        ta: "7ம் நாள்: 6ம் பிண்ட தானம் (மர்ம ஸ்தானங்கள்)"
      },
      rituals: {
        kn: "೬ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೬ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಮತ್ತು ಪವಿತ್ರ ಧ್ಯಾಪನ.",
        en: "Offering 6th Pinda, 6 libations of Tilanjali, and sacred ancestral dhyanam.",
        hi: "षष्ठ पिंड अर्पण, 6 अंजलि तिलांजलि एवं पितृ ध्यान।",
        te: "6వ పిండ సమర్పణ, 6 దోసిళ్ల తిలాంజలి.",
        ta: "6ம் பிண்ட சமர்ப்பணம், 6 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೬ನೇ ಪಿಂಡದಿಂದ ಪ್ರಾಣನಾಡಿಗಳು ಮತ್ತು ಮರ್ಮಸ್ಥಾನಗಳು ಸೂಕ್ಷ್ಮವಾಗಿ ಸಂಯೋಜನೆಗೊಳ್ಳುತ್ತವೆ.",
        en: "The 6th Pinda knits the subtle energetic nadis and vital marma points.",
        hi: "षष्ठ पिंड से समस्त प्राण नाड़ियों एवं मर्म स्थानों का समन्वय होता है।",
        te: "6వ పిండంతో ప్రాణ నాడులు మరియు మర్మ స్థానాలు అనుసంధానమవుతాయి.",
        ta: "சூட்சும நாடிகள் மற்றும் நரம்பு மண்டலம் இணைகிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ಕಪ್ಪು ಎಳ್ಳು.",
        en: "Rice Pinda, Black sesame.",
        hi: "अन्न पिंड, काले तिल।",
        te: "అన్న పిండం, నల్ల నువ్వులు.",
        ta: "அன்ன பிண்டம், எள்."
      }
    },
    {
      day: 8,
      title: {
        kn: "೮ನೇ ದಿನ: ಸಪ್ತಮ ಪಿಂಡ ಪ್ರದಾನ (ಅಸ್ಥಿ, ಮಜ್ಜೆ & ಚರ್ಮ)",
        en: "Day 8: 7th Pinda Dana (Bones, Marrow & Subtle Skin)",
        hi: "अष्टम दिन: सप्तम पिंड दान (अस्थि, मज्जा एवं त्वचा)",
        te: "8వ రోజు: 7వ పిండ ప్రదానం (ఎముకలు & చర్మం)",
        ta: "8ம் நாள்: 7ம் பிண்ட தானம் (எலும்பு, தோல்)"
      },
      rituals: {
        kn: "೭ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ ಮತ್ತು ೭ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ.",
        en: "Offering 7th Pinda with 7 libations of sesame water.",
        hi: "सप्तम पिंड अर्पण तथा 7 अंजलि तिलांजलि।",
        te: "7వ పిండ సమర్పణ, 7 దోసిళ్ల తిలాంజలి.",
        ta: "7ம் பிண்ட சமர்ப்பணம், 7 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೭ನೇ ಪಿಂಡದಿಂದ ಅಸ್ಥಿ, ಮಜ್ಜೆ, ಧಾತು ಮತ್ತು ಚರ್ಮದ ಸೂಕ್ಷ್ಮ ಕವಚ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.",
        en: "The 7th Pinda completes the subtle skeletal frame, marrow, and sheath.",
        hi: "सप्तम पिंड से अस्थि, मज्जा तथा सूक्ष्म त्वचा का आवरण पूर्ण होता है।",
        te: "7వ పిండంతో ఎముకలు మరియు సూక్ష్మ చర్మ కవచం పూర్తవుతుంది.",
        ta: "எலும்பு, மஜ்ஜை மற்றும் சூட்சும தோல் படலம் நிறைகிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ಹಾಲು, ಜಲ.",
        en: "Rice Pinda, Milk, Water.",
        hi: "अन्न पिंड, दूध, जल।",
        te: "అన్న పిండం, పాలు, జలం.",
        ta: "அன்ன பிண்டம், பால், நீர்."
      }
    },
    {
      day: 9,
      title: {
        kn: "೯ನೇ ದಿನ: ಅಷ್ಟಮ ಪಿಂಡ ಪ್ರದಾನ (ಕ್ಷುಧೆ & ತೃಷಾ ಶಮನ ಶಕ್ತಿ)",
        en: "Day 9: 8th Pinda Dana (Capacity for Hunger & Thirst)",
        hi: "नवम दिन: अष्टम पिंड दान (क्षुधा एवं तृषा शमन शक्ति)",
        te: "9వ రోజు: 8వ పిండ ప్రదానం (ఆకలి & దప్పిక ఉపశమనం)",
        ta: "9ம் நாள்: 8ம் பிண்ட தானம் (தாகம், பசி தீர்த்தல்)"
      },
      rituals: {
        kn: "೮ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ೮ ಬೊಗಸೆ ತಿಲಾಂಜಲಿ ಹಾಗೂ ೧೦ನೇ ದಿನದ ಸಿದ್ಧತೆ.",
        en: "Offering 8th Pinda, 8 libations of Tilanjali, and preparing for 10th-day rites.",
        hi: "अष्टम पिंड अर्पण, 8 अंजलि तिलांजलि तथा 10वें दिन की तैयारी।",
        te: "8వ పిండ సమర్పణ, 8 దోసిళ్ల తిలాంజలి మరియు 10వ రోజు ఏర్పాట్లు.",
        ta: "8ம் பிண்ட சமர்ப்பணம், 8 அஞ்சலி திலாஞ்சலி."
      },
      significance: {
        kn: "೮ನೇ ಪಿಂಡದಿಂದ ದೇಹಕ್ಕೆ ಹಸಿವು-ಬಾಯಾರಿಕೆಗಳನ್ನು ತೃಪ್ತಿಪಡಿಸಿಕೊಳ್ಳುವ ಶಕ್ತಿ ಪ್ರಾಪ್ತವಾಗುತ್ತದೆ.",
        en: "The 8th Pinda grants the Yatana body the faculty to assimilate food/water offerings.",
        hi: "अष्टम पिंड से आत्मा को क्षुधा-पिपासा तृप्त करने की शक्ति प्राप्त होती है।",
        te: "8వ పిండంతో ఆకలి దప్పులను తీర్చుకునే శక్తి లభిస్తుంది.",
        ta: "ஆன்மாவுக்கு பசி, தாகத்தை உணரும் ஆற்றல் கிடைக்கிறது."
      },
      keyOfferings: {
        kn: "ಅನ್ನ ಪಿಂಡ, ಎಳ್ಳು, ಮಧು (ಜೇನುತುಪ್ಪ).",
        en: "Rice Pinda, Sesame, Honey.",
        hi: "अन्न पिंड, तिल, मधु (शहद)।",
        te: "అన్న పిండం, నువ్వులు, తేనె.",
        ta: "அன்ன பிண்டம், எள், தேன்."
      }
    },
    {
      day: 10,
      title: {
        kn: "೧೦ನೇ ದಿನ: ದಶಮ ಪಿಂಡ ಪ್ರದಾನ, ಕ್ಷೌರ ಕರ್ಮ & ಆಶೌಚ ನಿವೃತ್ತಿ",
        en: "Day 10: 10th Pinda Dana, Tonsure (Kshoura) & Asoucha End",
        hi: "दशम दिन: दशम पिंड दान, क्षौर कर्म एवं अशौच शुद्धि",
        te: "10వ రోజు: 10వ పిండ ప్రదానం, క్షౌర కర్మ & ఆశౌచ నివృత్తి",
        ta: "10ம் நாள்: 10ம் பிண்ட தானம், க்ஷௌரம் & தீட்டு கழித்தல்"
      },
      rituals: {
        kn: "೯ನೇ ಮತ್ತು ೧೦ನೇ ಪಿಂಡ ಸಮರ್ಪಣೆ, ಪಿಂಡ ವಿಸರ್ಜನೆ, ದಾಯಾದಿಗಳಿಗೆ ಕ್ಷೌರ ಕರ್ಮ (ಮುಂಡನ), ಸಚಿಲ ಸ್ನಾನ, ಆಶೌಚ ಶಮನ.",
        en: "9th and 10th Pindas, Pinda Visarjana into river, family tonsure (Kshoura), sacred purification bath.",
        hi: "9वें एवं 10वें पिंड का अर्पण, पिंड विसर्जन, मुंडन (क्षौर), सचैल स्नान एवं अशौच शुद्धि।",
        te: "9, 10వ పిండాల సమర్పణ, పిండ విసర్జన, క్షౌర కర్మ, సచైల స్నానం మరియు ఆశౌచ నివృత్తి.",
        ta: "9 & 10ம் பிண்டம், பிண்ட விசர்ஜனம், க்ஷௌரம், தீர்த்த ஸ்நானம்."
      },
      significance: {
        kn: "೧೦ ಪಿಂಡಗಳಿಂದ ಪೂರ್ಣ ಸೂಕ್ಷ್ಮ ದೇಹ ನಿರ್ಮಾಣವಾಗಿ ಪ್ರೇತತ್ವ ಮುಗಿದು ಪಿತೃಲೋಕದ ಪಯಣಕ್ಕೆ ಅರ್ಹತೆ ದೊರೆಯುತ್ತದೆ.",
        en: "The subtle body is completely formed, ending initial Preta state and preparing for Pitru elevation.",
        hi: "10 पिंडों से संपूर्ण सूक्ष्म देह निर्मित होकर प्रेत योनि से मुक्ति का मार्ग प्रशस्त होता है।",
        te: "10 పిండాలతో సంపూర్ణ సూక్ష్మ శరీరం పూర్తయి పితృలోక అర్హత లభిస్తుంది.",
        ta: "10 பிண்டங்களால் சூட்சும உடல் நிறைவுபெற்று பித்ரு லோக தகுதி பெறுகிறது."
      },
      keyOfferings: {
        kn: "ದಶಮ ಪಿಂಡ, ಮಜ್ಜಿಗೆ, ಕಪ್ಪು ಎಳ್ಳು, ವಸ್ತ್ರದಾನ, ಗೋಧಿ.",
        en: "10th Pinda, Buttermilk, Sesame, Cloth charity, Wheat.",
        hi: "दशम पिंड, छाछ, काले तिल, वस्त्र दान, गेहूँ।",
        te: "10వ పిండం, మజ్జిగ, నల్ల నువ్వులు, వస్త్ర దానం.",
        ta: "10ம் பிண்டம், மோர், எள், வஸ்திர தானம்."
      }
    },
    {
      day: 11,
      title: {
        kn: "೧೧ನೇ ದಿನ: ಏಕಾದಶಾಹ ಶ್ರಾದ್ಧ, ವೃಷೋತ್ಸರ್ಗ & ೧೬ ಮಾಸಿಕ ಏಕೋದ್ದಿಷ್ಟ",
        en: "Day 11: Ekadashaha Shraddha, Vrishotsarga & 16 Ekodishta Rites",
        hi: "एकादश दिन: एकादशाह श्राद्ध, वृषोत्सर्ग एवं 16 मासिक श्राद्ध",
        te: "11వ రోజు: ఏకాదశాహ శ్రాద్ధం, వృషోత్సర్గం & 16 ఏకోద్దిష్ట శ్రాద్ధాలు",
        ta: "11ம் நாள்: ஏகாதச சிரார்த்தம், விருஷோத்ஸர்கம்"
      },
      rituals: {
        kn: "ಏಕಾದಶಾಹ ಶ್ರಾದ್ಧ, ವೃಷೋತ್ಸರ್ಗ (ಕಾಳಹಸ್ತಿ/ಗೋಕರ್ಣ ಪದ್ಧತಿ), ಆಧ್ಯ ಶ್ರಾದ್ಧ, ಶಯ್ಯಾದಾನ ಹಾಗೂ ಗೋದಾನ (ವೈತರಣಿ ಗೋದಾನ).",
        en: "Ekadashaha Shraddha, Vrishotsarga bull dedication, Adhya Shraddha, Shayyadana (bed offering), and Vaitarani Godana.",
        hi: "एकादशाह श्राद्ध, वृषोत्सर्ग, आद्य श्राद्ध, शय्यादान तथा वैतरणी गोदान।",
        te: "ఏకాదశాహ శ్రాద్ధం, వృషోత్సర్గం, ఆద్య శ్రాద్ధం, శయ్యాదానం మరియు వైతరణి గోదానం.",
        ta: "ஏகாதச சிரார்த்தம், விருஷோத்ஸர்கம், சய்யாதானம், வைதரணி கோதானம்."
      },
      significance: {
        kn: "ವೈತರಣಿ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟಲು ಗೋದಾನ ಮತ್ತು ಶಯ್ಯಾದಾನ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವೆಂದು ಗರುಡ ಪುರಾಣ ಸಾರುತ್ತದೆ.",
        en: "Vaitarani Godana grants safe passage across the dreadful river Vaitarani to ancestral realm.",
        hi: "गरुड़ पुराणानुसार वैतरणी नदी को सुगमता से पार करने हेतु गोदान एवं शय्यादान सर्वोत्कृष्ट है।",
        te: "వైతరణి నదిని దాటడానికి గోదానం మరియు శయ్యాదానం అత్యుత్తమమని గరుడ పురాణం చెబుతోంది.",
        ta: "வைதரணி நதியைக் கடக்க கோதானம் மற்றும் சய்யாதானம் மிக முக்கியமானது."
      },
      keyOfferings: {
        kn: "ವೈತರಣಿ ಗೋದಾನ, ಶಯ್ಯಾದಾನ, ಕಂಚಿನ ಪಾತ್ರೆ, ಪಂಚಪಾತ್ರೆ, ಛತ್ರ, ಪಾದುಕಾ, ದೀಪದಾನ.",
        en: "Vaitarani Cow donation, Bed/Bedding, Bronze vessels, Umbrella, Footwear, Lamp.",
        hi: "वैतरणी गोदान, शय्यादान, कांस्य पात्र, छत्र, पादुका, दीपदान।",
        te: "వైతరణి గోదానం, శయ్యాదానం, కంచు పాత్ర, ఛత్రం, పాదుకలు, దీపదానం.",
        ta: "கோதானம், சய்யாதானம், வெண்கல பாத்திரம், குடை, பாதுகை, தீபம்."
      }
    },
    {
      day: 12,
      title: {
        kn: "೧೨ನೇ ದಿನ: ದ್ವಾದಶಾಹ ಸಪಿಂಡೀಕರಣ ಮಹಾ ಶ್ರಾದ್ಧ (ಪಿತೃಲೋಕ ಪ್ರವೇಶ)",
        en: "Day 12: Sapindikarana Maha Shraddha (Pitru Loka Ascension)",
        hi: "द्वादश दिन: सपिंडीकरण महा श्राद्ध (पितृलोक प्रवेश)",
        te: "12వ రోజు: సపిండీకరణ మహా శ్రాద్ధం (పితృలోక ప్రవేశం)",
        ta: "12ம் நாள்: சபிண்டீகரண மகா சிரார்த்தம் (பித்ரு லோக பிரவேசம்)"
      },
      rituals: {
        kn: "ಸಪಿಂಡೀಕರಣ ಶ್ರಾದ್ಧ (ಮೃತರ ಪಿಂಡವನ್ನು ೩ ತಲೆಮಾರಿನ ಪಿತೃ ಪಿಂಡಗಳೊಂದಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ವಿಲೀನಗೊಳಿಸುವುದು).",
        en: "Sapindikarana ritual: Uniting the deceased soul's Pinda with the Pindas of the 3 ancestral generations.",
        hi: "सपिंडीकरण श्राद्ध: दिवंगत आत्मा के पिंड को 3 पीढ़ियों के पितृ पिंडों में विधिवत मिलाना।",
        te: "సపిండీకరణ శ్రాద్ధం: దివంగత ఆత్మ పిండాన్ని 3 తరాల పితృ పిండాలతో శాస్త్రోక్తంగా విలీనం చేయడం.",
        ta: "சபிண்டீகரணம்: ஆன்மாவின் பிண்டத்தை 3 தலைமுறை பித்ரு பிண்டங்களுடன் இணைத்தல்."
      },
      significance: {
        kn: "ಪ್ರೇತತ್ವವು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಣೆಯಾಗಿ ಮೃತ ವ್ಯಕ್ತಿಯು 'ಪಿತೃ ದೇವತೆ'ಯಾಗಿ ಪಿತೃಲೋಕವನ್ನು ಸೇರುತ್ತಾರೆ.",
        en: "Preta state dissolves completely, elevating the departed soul into a revered Pitru Devata.",
        hi: "प्रेतत्व सदा के लिए समाप्त होकर दिवंगत आत्मा पितृ पद प्राप्त कर पितृलोक में प्रतिष्ठित होती है।",
        te: "ప్రేతత్వం తొలగిపోయి దివంగతులు 'పితృ దేవత'గా పితృలోకంలో చేరతారు.",
        ta: "பிரேத நிலை நீங்கி, ஆன்மா பித்ரு தேவதையாக பித்ரு லோகத்தை அடைகிறது."
      },
      keyOfferings: {
        kn: "೪ ಮಹಾ ಪಿಂಡಗಳು, ಸುವರ್ಣ ದಾನ, ರಜತ ದಾನ, ೧೬ ಬ್ರಾಹ್ಮಣ ಪೂಜೆ & ದಕ್ಷಿಣೆ.",
        en: "4 Sacred Maha Pindas, Gold/Silver offerings, Worship of 16 Brahmanas & Dakshina.",
        hi: "4 महा पिंड, स्वर्ण-रजत दान, 16 ब्राह्मण पूजन एवं दक्षिणा।",
        te: "4 మహా పిండాలు, స్వర్ణ-రజత దానం, 16 మంది బ్రాహ్మణుల పూజ & దక్షిణ.",
        ta: "4 மகா பிண்டங்கள், தங்கம்/வெள்ளி தானம், 16 அந்தணர் பூஜை & தக்ஷிணை."
      }
    },
    {
      day: 13,
      title: {
        kn: "೧೩ನೇ ದಿನ: ತ್ರಯೋದಶಾಹ ಶುಭ ಸ್ವೀಕಾರ, ಆನಂದ ಹೋಮ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        en: "Day 13: Trayodashaha Shubha Sweekara, Ananda Homa & Feast",
        hi: "त्रयोदश दिन: त्रयोदशाह शुभ स्वीकार, आनंद होम एवं ब्राह्मण भोजन",
        te: "13వ రోజు: త్రయోదశాహ శుభ స్వీకారం, ఆనంద హోమం & భోజనం",
        ta: "13ம் நாள்: சுப ஸ்வீகாரம், ஆனந்த ஹோமம் & போஜனம்"
      },
      rituals: {
        kn: "ಆನಂದ ಹೋಮ, ಗೃಹ ಶುದ್ಧಿ, ಪುಣ್ಯಾಹ ವಾಚನ, ಶುಭ ಸ್ವೀಕಾರ, ದೇವತಾರ್ಚನೆ ಹಾಗೂ ಮಹಾ ಅನ್ನ ಸಂತರ್ಪಣೆ.",
        en: "Ananda Homa, Griha Shuddhi, Punyahavachana, Shubha Sweekara, temple worship, and community feast.",
        hi: "आनंद होम, गृह शुद्धि, पुण्याह वाचन, शुभ स्वीकार, देवतार्चन तथा महा अन्न संतर्पण।",
        te: "ఆనంద హోమం, గృహ శుద్ధి, పుణ్యాహవాచనం, శుభ స్వీకారం మరియు మహా అన్నదానం.",
        ta: "ஆனந்த ஹோமம், கிரக சுத்தி, புண்யாகவாசனம், சுப ஸ்வீகாரம், அன்னதானம்."
      },
      significance: {
        kn: "ಕುಟುಂಬದ ಆಶೌಚವು ಸಂಪೂರ್ಣ ಮುಗಿದು ದೈನಂದಿನ ಧಾರ್ಮಿಕ ಹಾಗೂ ಲೌಕಿಕ ಕಾರ್ಯಗಳಿಗೆ ಮರುಪ್ರವೇಶ.",
        en: "Family completely exits mourning; auspicious resumption of normal spiritual and worldly duties.",
        hi: "परिवार की संपूर्ण अशौच निवृत्ति एवं पुनः मंगलमय नित्य धार्मिक-लौकिक जीवन में प्रवेश।",
        te: "కుటుంబంలో ఆశౌచం పూర్తయి సాధారణ ధార్మిక జీవనంలోకి ప్రవేశం.",
        ta: "தீட்டு முழுமையாக கழிந்து குடும்பத்தினர் சுப காரியங்களை தொடங்கலாம்."
      },
      keyOfferings: {
        kn: "ಮಹಾ ಅನ್ನದಾನ, ದಕ್ಷಿಣೆ, ಗೃಹ ಶುದ್ಧಿ ಕಲಶ ಜಲ, ಸಿಹಿ ಪ್ರಸಾದ.",
        en: "Maha Anna-dana (Feast), Dakshina, Sanctified Kalasha water, Sweet Prasada.",
        hi: "महा अन्नदान, दक्षिणा, गृह शुद्धि कलश जल, मिष्ठान्न।",
        te: "మహా అన్నదానం, దక్షిణ, పుణ్యాహ కలశ జలం, ప్రసాదం.",
        ta: "அன்னதானம், தக்ஷிணை, கலச தீர்த்தம், பிரசாதம்."
      }
    }
  ];

  for (const cfg of dayConfigs) {
    const dOffset = cfg.day - 1;
    const targetUtc = new Date(baseUtcMs + dOffset * 24 * 60 * 60 * 1000);
    roadmap.push({
      dayNumber: cfg.day,
      dayTitle: cfg.title,
      dateStr: formatIstDateDisplay(targetUtc, "kn"),
      rituals: cfg.rituals,
      significance: cfg.significance,
      keyOfferings: cfg.keyOfferings
    });
  }

  return roadmap;
}

export function computeAsthiVisarjanaGuide(): AsthiVisarjanaGuide {
  return {
    optimalTiming: {
      kn: "ಮರಣ ಹೊಂದಿದ ೩ನೇ, ೭ನೇ, ೯ನೇ ಅಥವಾ ೧೦ನೇ ದಿನದೊಳಗೆ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡುವುದು ಶ್ರೇಷ್ಠ. ಸಾಧ್ಯವಾಗದಿದ್ದಲ್ಲಿ ೧ ವರ್ಷದೊಳಗೆ ಪವಿತ್ರ ಗಂಗಾ, ಗೋಕರ್ಣ ಅಥವಾ ಕಾವೇರಿ ಸಂಗಮದಲ್ಲಿ ವಿಸರ್ಜಿಸಬೇಕು.",
      en: "Best performed on the 3rd, 7th, 9th or within the 10th day of demise. Alternatively within 1 year at sacred waters like Gokarna Samudra, Ganga, or Kaveri.",
      hi: "मृत्यु के 3रे, 7वें, 9वें या 10वें दिन के भीतर अस्थि विसर्जन सर्वोत्तम है। अन्यथा 1 वर्ष के भीतर गंगा, गोकर्ण या त्रिवेणी में विसर्जित करें।",
      te: "మరణించిన 3, 7, 9 లేదా 10వ రోజులోపు అస్థి విసర్జన చేయడం శ్రేష్ఠం. వీలుకానిచో 1 సంవత్సరంలోపు గోకర్ణ లేదా గంగా నదిలో విసర్జించాలి.",
      ta: "மரணமடைந்த 3, 7, 9 அல்லது 10ம் நாளுக்குள் அஸ்தி விசர்ஜனம் செய்வது உத்தமம். இயலாவிடில் 1 வருடத்திற்குள் கோகர்ண அல்லது கங்கை சங்கமத்தில் கரைக்கலாம்."
    },
    sacredTirthas: [
      {
        name: {
          kn: "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥ & ಸಮುದ್ರ ಸಂಗಮ",
          en: "Gokarna Kotitirtha & Ocean Sangama",
          hi: "गोकर्ण कोटितीर्थ एवं समुद्र संगम",
          te: "గోకర్ణ కోటితీర్థం & సముద్ర సంగమం",
          ta: "கோகர்ண கோடிதீர்த்தம் & கடல் சங்கமம்"
        },
        location: {
          kn: "ಗೋಕರ್ಣ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",
          en: "Gokarna, Uttara Kannada, Karnataka",
          hi: "गोकर्ण, उत्तर कन्नड़, कर्नाटक",
          te: "గోకర్ణ, ఉత్తర కన్నడ, కర్ణాటక",
          ta: "கோகர்ணம், உத்தர கன்னட, கர்நாடகா"
        },
        spiritualSignificance: {
          kn: "ರುದ್ರಪಾದ ಸನ್ನಿಧಿ — ಇಲ್ಲಿ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡಿದರೆ ಆತ್ಮವು ಸಕಲ ಪಾಪಗಳಿಂದ ಮುಕ್ತವಾಗಿ ಶಿವ ಸಾಯುಜ್ಯ ಪಡೆಯುತ್ತದೆ.",
          en: "Sacred Rudrapada — Dissolves all sins and grants immediate liberation (Shiva Sayujya) to the departed soul.",
          hi: "रुद्रपाद सन्निधि — समस्त पापों का क्षय होकर आत्मा को शिव सायुज्य की प्राप्ति होती है।",
          te: "రుద్రపాద సన్నిధి — సమస్త పాపాలు నశించి ఆత్మకు శివ సాయుజ్యం మరియు శాశ్వత మోక్షం లభిస్తుంది.",
          ta: "ருத்ரபாத சன்னதி — சகல பாவங்களும் நீங்கி ஆன்மா சிவ சாயுஜ்ய முக்தி அடைகிறது."
        }
      },
      {
        name: {
          kn: "ವಾರಣಾಸಿ (ಕಾಶೀ ಗಂಗಾ ತೀರ)",
          en: "Varanasi (Kashi Ganga Manikarnika)",
          hi: "वाराणसी (काशी गंगा मणिकर्णिका)",
          te: "వారణాసి (కాశీ గంగ)",
          ta: "வாரணாசி (காசி கங்கை)"
        },
        location: {
          kn: "ವಾರಣಾಸಿ, ಉತ್ತರ ಪ್ರದೇಶ",
          en: "Varanasi, Uttar Pradesh",
          hi: "वाराणसी, उत्तर प्रदेश",
          te: "వారణాసి, ఉత్తరప్రదేశ్",
          ta: "வாரணாசி, உ.பி."
        },
        spiritualSignificance: {
          kn: "ಕಾಶೀ ಮರಣಾನ್ಮುಕ್ತಿಃ — ಗಂಗಾ ಜಲದಲ್ಲಿ ಅಸ್ಥಿ ಲೀನವಾದರೆ ಪುನರ್ಜನ್ಮ ರಹಿತ ಶಾಶ್ವತ ಮೋಕ್ಷ.",
          en: "Ganga water immersion grants liberation from cycle of rebirths (Kashi Moksha).",
          hi: "गंगा जल में अस्थि विसर्जन से पुनर्जन्म रहित शाश्वत मोक्ष की प्राप्ति।",
          te: "గంగా జలంలో అస్థి విసర్జనతో పునర్జన్మ రహిత శాశ్వత మోక్షం.",
          ta: "கங்கையில் அஸ்தி கரைப்பதால் மறுபிறப்பற்ற மோக்ஷம்."
        }
      },
      {
        name: {
          kn: "ಪ್ರಯಾಗರಾಜ್ (ತ್ರಿವೇಣಿ ಸಂಗಮ)",
          en: "Prayagraj (Triveni Sangam)",
          hi: "प्रयागराज (त्रिवेणी संगम)",
          te: "ప్రయాగ్‌రాజ్ (త్రివేణి సంగమం)",
          ta: "பிரயாக்ராஜ் (திரிவேணி சங்கமம்)"
        },
        location: {
          kn: "ಪ್ರಯಾಗರಾಜ್, ಉತ್ತರ ಪ್ರದೇಶ",
          en: "Prayagraj, Uttar Pradesh",
          hi: "प्रयागराज, उत्तर प्रदेश",
          te: "ప్రయాగ్‌రాజ్, ఉత్తరప్రదేశ్",
          ta: "பிரயாக்ராஜ், உ.பி."
        },
        spiritualSignificance: {
          kn: "ಗಂಗಾ, ಯಮುನಾ, ಸರಸ್ವತೀ ಸಂಗಮದಲ್ಲಿ ಅಸ್ಥಿ ಸಮರ್ಪಣೆ ಸರ್ವ ಪಿತೃಗಳಿಗೆ ತೃಪ್ತಿದಾಯಕ.",
          en: "Confluence of 3 sacred rivers pacifies all ancestral debts across 21 generations.",
          hi: "त्रिवेणी संगम में अस्थि समर्पण से 21 पीढ़ियों के पितरों की तृप्ति होती है।",
          te: "త్రివేణి సంగమంలో అస్థి సమర్పణతో 21 తరాల పితృ తృప్తి.",
          ta: "திரிவேணி சங்கமத்தில் அஸ்தி கரைப்பது 21 தலைமுறை பித்ருக்களுக்கு திருப்தி அளிக்கும்."
        }
      },
      {
        name: {
          kn: "ಶ್ರೀರಂಗಪಟ್ಟಣ (ಪಶ್ಚಿಮ ವಾಹಿನಿ ಕಾವೇರಿ)",
          en: "Srirangapatna (Paschima Vahini Kaveri)",
          hi: "श्रीरंगपट्टण (पश्चिम वाहिनी कावेरी)",
          te: "శ్రీరంగపట్నం (పశ్చిమ వాహిని కావేరి)",
          ta: "ஸ்ரீரங்கப்பட்டினம் (காவேரி சங்கமம்)"
        },
        location: {
          kn: "ಮಂಡ್ಯ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ",
          en: "Mandya Dist, Karnataka",
          hi: "मांड्या, कर्नाटक",
          te: "మండ్య, కర్ణాటక",
          ta: "மண்டியா, கர்நாடகா"
        },
        spiritualSignificance: {
          kn: "ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಸಿದ್ಧ ಪವಿತ್ರ ಪಶ್ಚಿಮ ವಾಹಿನಿ ಕಾವೇರಿ ತೀರ್ಥ.",
          en: "Renowned sacred southern tirtha where Kaveri flows westward.",
          hi: "दक्षिण भारत का परम पावन पश्चिम वाहिनी कावेरी तीर्थ।",
          te: "దక్షిణ భారత ప్రసిద్ధ పశ్చిమ వాహిని కావేరి తీర్థం.",
          ta: "தென்னிந்தியாவின் பிரசித்தி பெற்ற காவேரி சங்கம தீர்த்தம்."
        }
      }
    ],
    procedureSteps: {
      kn: [
        "ಅಸ್ಥಿ ಪಾತ್ರೆಯನ್ನು ಪವಿತ್ರ ವಸ್ತ್ರದಿಂದ ಸುತ್ತಿ, ಸ್ನಾನ ಮಾಡಿ ಶೌಚವಾಗಿರಬೇಕು.",
        "ತೀರ್ಥ ಕ್ಷೇತ್ರದ ಪುರೋಹಿತರೊಂದಿಗೆ 'ಪಿತೃ ಸಂಕಲ್ಪ' ಮಾಡಿ ಕ್ಷೀರ (ಹಾಲು), ತುಪ್ಪ, ಎಳ್ಳು ಹಾಗೂ ಪುಷ್ಪಗಳಿಂದ ಅಸ್ಥಿ ಪೂಜೆ ನೆರವೇರಿಸಿ.",
        "ಆಳವಾದ ಪವಿತ್ರ ಜಲದಲ್ಲಿ ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣಾಭಿಮುಖವಾಗಿ ನಿಂತು 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಎಂದು ಜಪಿಸುತ್ತಾ ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಮಾಡಿ.",
        "ತಕ್ಷಣವೇ ಸಚಿಲ ಸ್ನಾನ ಮಾಡಿ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ, ಬ್ರಾಹ್ಮಣರಿಗೆ ಎಳ್ಳು-ವಸ್ತ್ರ-ದಕ್ಷಿಣೆ ದಾನ ನೀಡಿ."
      ],
      en: [
        "Keep the Asthi urn wrapped in sacred cloth and maintain complete ritual purity.",
        "Perform Pitru Sankalpa with priest, offering milk, ghee, black sesame, and flowers to the Asthi.",
        "Facing East or South in sacred deep waters, immerse the ashes chanting 'Om Namo Narayanaya'.",
        "Take a complete holy dip, offer Surya Arghya, and donate sesame, clothes, and Dakshina."
      ],
      hi: [
        "अस्थि कलश को पवित्र वस्त्र में लपेटकर पूर्ण शुद्धि का पालन करें।",
        "तीर्थ पुरोहित के साथ 'पितृ संकल्प' कर दुग्ध, घृत, तिल एवं पुष्पों से अस्थि पूजन करें।",
        "पवित्र जल में पूर्व या दक्षिण की ओर मुख कर 'ॐ नमो नारायणाय' जपते हुए अस्थि विसर्जन करें।",
        "तत्काल सचैल स्नान कर सूर्यदेव को अर्घ्य दें एवं ब्राह्मण को तिल, वस्त्र व दक्षिणा दान करें।"
      ],
      te: [
        "అస్థి కలశాన్ని పవిత్ర వస్త్రంతో చుట్టి శుచిగా ఉంచండి.",
        "పురోహితులతో 'పితృ సంకల్పం' చేసి పాలు, నెయ్యి, నువ్వులు, పుష్పాలతో అస్థి పూజ చేయండి.",
        "లోతైన పవిత్ర జలంలో తూర్పు లేదా దక్షిణాభిముఖంగా నిలబడి 'ఓం నమో నారాయణాయ' జపిస్తూ అస్థి నిమజ్జనం చేయండి.",
        "వెంటనే స్నానం చేసి సూర్యునికి అర్ఘ్యం సమర్పించి, బ్రాహ్మణులకు నువ్వులు, వస్త్రాలు, దక్షిణ దానం చేయండి."
      ],
      ta: [
        "அஸ்தி கலசத்தை தூய வஸ்திரத்தில் சுற்றி புனிதமாக வைத்திருக்கவும்.",
        "புரோகிதருடன் 'பித்ரு சங்கல்பம்' செய்து பால், நெய், எள் மற்றும் மலர்களால் அஸ்தி பூஜை செய்யவும்.",
        "புனித நீரில் கிழக்கு அல்லது தெற்கு நோக்கி நின்று 'ஓம் நமோ நாராயணாய' என ஜெபித்து அஸ்தி விசர்ஜனம் செய்யவும்.",
        "உடனடியாக ஸ்நானம் செய்து சூரிய தேவருக்கு அர்க்கியம் அளித்து, எள், வஸ்திரம், தக்ஷிணை தானம் செய்யவும்."
      ]
    },
    mantra: "॥ ಓಂ ಅಸ್ಥಿ ಸಂಚಯನ ಪುಣ್ಯೇ ತೀರ್ಥೇ ವಿಸರ್ಜಯಾಮಿ, ದಿವ್ಯ ಲೋಕಂ ಗಚ್ಛತು ಸದ್ಗತಿಃ ಭವತು ॥"
  };
}

export function computeGarudaPuranaWisdom(): GarudaPuranaWisdom {
  return {
    soulJourneySummary: {
      kn: "ಗರುಡ ಪುರಾಣದ ಪ್ರಕಾರ, ಮರಣದ ನಂತರ ಜೀವವು ೧೨ ದಿನಗಳ ಕಾಲ ಗೃಹ ಹಾಗೂ ಚಿತಾಭೂಮಿಯ ಬಳಿಯೇ ಸೂಕ್ಷ್ಮವಾಗಿ ಇರುತ್ತದೆ. ನಾವು ನೀಡುವ ದಿನನಿತ್ಯದ ಪಿಂಡ & ತರ್ಪಣಗಳಿಂದ ಸೂಕ್ಷ್ಮ ಯಾತನಾ ದೇಹ ನಿರ್ಮಾಣವಾಗಿ ೧ ವರ್ಷದ ಕಾಲ ಯಮಮಾರ್ಗದಲ್ಲಿ ಪಯಣಿಸಿ ಪಿತೃಲೋಕವನ್ನು ಸೇರುತ್ತದೆ.",
      en: "According to Garuda Purana, the soul lingers near home and pyre for 12 days. Daily Pinda and Tila offerings build its subtle vessel, sustaining its 1-year journey along the cosmic path to Pitru Loka.",
      hi: "गरुड़ पुराण के अनुसार मृत्यु के पश्चात आत्मा 12 दिनों तक सूक्ष्म रूप से निवास करती है। नित्य दिए जाने वाले पिंड व तिलांजलि से सूक्ष्म देह बनकर 1 वर्ष की यात्रा पूर्ण कर पितृलोक में प्रवेश करती है।",
      te: "గరుడ పురాణం ప్రకారం మరణం తర్వాత ఆత్మ 12 రోజుల పాటు సూక్ష్మంగా ఉంటుంది. మనం సమర్పించే పిండాలు, తిలాంజలి ద్వారా సూక్ష్మ శరీరం రూపుదిద్దుకుని 1 సంవత్సరం ప్రయాణించి పితృలోకం చేరుతుంది.",
      ta: "கருட புராணத்தின்படி மரணத்திற்குப் பின் ஆன்மா 12 நாட்கள் சூட்சுமமாக இருக்கும். நாம் செய்யும் தினசரி பிண்ட தானம் மூலம் சூட்சும உடல் பெற்று 1 ஆண்டு பயணம் செய்து பித்ரு லோகத்தை அடைகிறது."
    },
    pindaDanaMeaning: {
      kn: "ಪ್ರತಿಯೊಂದು ದಿನದ ಪಿಂಡವು ಜೀವದ ಅಂಗಾಂಗಗಳನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ರೂಪಿಸುತ್ತದೆ (೧ನೇ ದಿನ ಶಿರ, ೨ನೇ ದಿನ ಕಣ್ಣು-ಕಿವಿ, ೧೦ನೇ ದಿನ ಸಂಪೂರ್ಣ ದೇಹ). ೧೦ನೇ ದಿನದ ನಂತರ ಪ್ರೇತತ್ವ ಮುಗಿಯುತ್ತದೆ.",
      en: "Each day's Pinda forms specific organs of the subtle body (Day 1 head, Day 2 perception, Day 10 completion), transmuting the ghost (Preta) state into an elevated Pitru spirit.",
      hi: "प्रत्येक दिन का पिंड सूक्ष्म अंगों का निर्माण करता है (प्रथम दिन सिर, 10वें दिन पूर्ण देह)। 10वें दिन के उपरांत प्रेतत्व समाप्त होता है।",
      te: "ప్రతి రోజు ఇచ్చే పిండం సూక్ష్మ అంగాలను నిర్మిస్తుంది (1వ రోజు శిరస్సు, 10వ రోజు సంపూర్ణ శరీరం). 10వ రోజు తర్వాత ప్రేతత్వం తొలగుతుంది.",
      ta: "ஒவ்வொரு நாள் பிண்டமும் சூட்சும உறுப்புகளை உருவாக்குகிறது (1ம் நாள் தலை, 10ம் நாள் முழு உடல்). 10ம் நாளுக்குப் பின் பிரேத நிலை நீங்குகிறது."
    },
    vaitaraniGodanaImportance: {
      kn: "ಯಮಲೋಕದ ಮಾರ್ಗದಲ್ಲಿ ಅತ್ಯಂತ ಭಯಂಕರವಾದ 'ವೈತರಣಿ' ನದಿ ಹರಿಯುತ್ತದೆ. ೧೧ನೇ ದಿನ ಗೋವಿನ ಬಾಲ ಹಿಡಿದು ಸಂಕಲ್ಪ ಮಾಡುವ 'ವೈತರಣಿ ಗೋದಾನ'ದಿಂದ ಜೀವವು ಆ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟುತ್ತದೆ.",
      en: "The arduous journey involves crossing the stormy river Vaitarani. The 11th-day Vaitarani Cow donation ensures effortless passage across this spiritual threshold.",
      hi: "यमलोक के मार्ग में भयानक वैतरणी नदी बहती है। 11वें दिन गोदान करने से जीवात्मा सुगमतापूर्वक उस नदी को पार कर जाती है।",
      te: "యమలోక మార్గంలో భయంకరమైన వైతరణి నది ఉంటుంది. 11వ రోజు గోదానం చేయడం ద్వారా ఆత్మ సులభంగా ఆ నదిని దాటగలదు.",
      ta: "எமலோக வழியில் கொடிய வைதரணி நதி பாய்கிறது. 11ம் நாள் செய்யப்படும் கோதானம் ஆன்மாவை அந்நதியை எளிதாகக் கடக்கச் செய்கிறது."
    },
    mokshaPhilosophy: {
      kn: "ಆತ್ಮವು ಅಮರ, ದೇಹ ಮಾತ್ರ ನಶ್ವರ. ಶ್ರದ್ಧೆಯಿಂದ ನೆರವೇರಿಸುವ ಶ್ರಾದ್ಧ ಕರ್ಮಗಳು ಪಿತೃಗಳಿಗೆ ತೃಪ್ತಿ ನೀಡಿ, ಅವರ ಆಶೀರ್ವಾದದಿಂದ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ ಹಾಗೂ ಸಂತಾನ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
      en: "The soul is immortal and transcendent. Diligent Shraddha rituals satisfy ancestors, showering the family with longevity, health, and multi-generational prosperity.",
      hi: "आत्मा अमर है, केवल देह नश्वर है। श्रद्धापूर्वक किए गए श्राद्ध कर्मों से पितृ तृप्त होकर कुल को दीर्घायु, स्वास्थ्य एवं वंश वृद्धि का वरदान देते हैं।",
      te: "ఆత్మ అమరం, శరీరం మాత్రమే నశ్వరం. శ్రద్ధతో చేసే శ్రాద్ధ కర్మలు పితృదేవతలను తృప్తిపరచి వంశానికి ఆయురారోగ్యాలు, సంతానవృద్ధిని ప్రసాదిస్తాయి.",
      ta: "ஆன்மா அழிவற்றது, உடலே அழியக்கூடியது. சிரத்தையுடன் செய்யப்படும் சிரார்த்த காரியங்கள் பித்ருக்களுக்கு திருப்தி அளித்து வம்சத்திற்கு நீண்ட ஆயுளையும் சுபிட்சத்தையும் தரும்."
    }
  };
}

export function computeMahalayaTarpanaRules(): MahalayaTarpanaRules {
  return {
    mahalayaOverview: {
      kn: "ಪ್ರತಿ ವರ್ಷ ಭಾದ್ರಪದ ಮಾಸದ ಶುಕ್ಲ ಪೂರ್ಣಿಮೆಯಿಂದ ಅಮಾವಾಸ್ಯೆಯವರೆಗಿನ ೧೬ ದಿನಗಳ ಕಾಲ 'ಮಹಾಲಯ ಪಕ್ಷ' ಅಥವಾ 'ಪಿತೃ ಪಕ್ಷ'. ಈ ಸಮಯದಲ್ಲಿ ಸಕಲ ಪಿತೃ ದೇವತೆಗಳು ಭೂಮಿಗೆ ಆಗಮಿಸುತ್ತಾರೆ.",
      en: "Mahalaya Paksha (Pitru Paksha) spans the 16 lunar days from Bhadrapada Purnima to Amavasya. Ancestors descend to the earth realm to receive offerings from descendants.",
      hi: "प्रतिवर्ष भाद्रपद शुक्ल पूर्णिमा से सर्वपितृ अमावस्या तक के 16 दिन 'महालय पक्ष' या 'पितृ पक्ष' कहलाते हैं। इस काल में समस्त पितृगण पृथ्वी पर पधारते हैं।",
      te: "ప్రతి సంవత్సరం భాద్రపద పూర్ణిమ నుండి అమావాస్య వరకు గల 16 రోజులను 'మహాలయ పక్షం' అంటారు. ఈ సమయంలో పితృదేవతలు భూమిపైకి విచ్చేస్తారు.",
      ta: "ஒவ்வொரு ஆண்டும் புரட்டாசி பௌர்ணமி முதல் அமாவாசை வரையிலான 16 நாட்கள் 'மஹாளய பக்ஷம்' எனப்படும். இக்காலத்தில் பித்ருக்கள் பூமிக்கு வருகை தருகின்றனர்."
    },
    amavasyaTarpanaProcedure: {
      kn: "ಪ್ರತಿ ತಿಂಗಳ ಅಮಾವಾಸ್ಯೆ, ಸಂಕ್ರಾಂತಿ ಹಾಗೂ ಮಹಾಲಯದಂದು ಮಧ್ಯಾಹ್ನ ಅಪರಾಹ್ನ ಕಾಲದಲ್ಲಿ ದರ್ಭೆ, ಕಪ್ಪು ಎಳ್ಳು, ತುಳಸಿ ಹಾಗೂ ಗಂಗಾಜಲದಿಂದ ಪಿತೃ ತರ್ಪಣ ನೀಡುವುದು ಅತ್ಯಂತ ಪುಣ್ಯಪ್ರದ.",
      en: "Offering Pitru Tarpana during Aparahna (afternoon) on every Amavasya, Sankranti, and Mahalaya using Darbha, Black Sesame, Tulasi, and holy water brings immense peace.",
      hi: "प्रत्येक अमावस्या, संक्रांति एवं महालय के दिन अपराह्न काल में दर्भ, काले तिल, तुलसी एवं गंगाजल से पितृ तर्पण करना अत्यंत पुण्यदायी है।",
      te: "ప్రతి అమావాస్య, సంక్రాంతి మరియు మహాలయ దినాలలో అపరాహ్న కాలంలో దర్భ, నల్ల నువ్వులు, తులసి, గంగాజలంతో పితృ తర్పణం సమర్పించడం పుణ్యప్రదం.",
      ta: "ஒவ்வொரு அமாவாசை, சங்கராந்தி மற்றும் மஹாளய நாட்களில் அபராஹ்ண காலத்தில் தர்ப்பை, எள், துளசி, தீர்த்தம் கொண்டு பித்ரு தர்பணம் செய்வது மகா புண்ணியம்."
    },
    essentialDanaItems: {
      kn: [
        "ಕಪ್ಪು ಎಳ್ಳು (ತಿಲ) & ದರ್ಭೆ (ದರ್ಭಾ)",
        "ಅನ್ನದಾನ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        "ವಸ್ತ್ರದಾನ (ಧೋತಿ / ಶಾಲು)",
        "ರಜತ (ಬೆಳ್ಳಿ) ಅಥವಾ ತಾಮ್ರ ಪಾತ್ರೆ ದಾನ",
        "ಗೋಸೇವೆ & ಬೆಲ್ಲ-ಹುಲ್ಲು ಸಮರ್ಪಣೆ"
      ],
      en: [
        "Black Sesame (Tila) & Sacred Darbha Grass",
        "Anna-Dana (Food feast) & Brahmana Bhojana",
        "Vastra-Dana (Cloth / Shawl / Dhoti)",
        "Silver / Copper Water Vessels",
        "Go-Seva (Feeding sacred cows with grass & jaggery)"
      ],
      hi: [
        "काले तिल एवं पवित्र दर्भ",
        "अन्नदान एवं ब्राह्मण भोजन",
        "वस्त्रदान (धोती / शॉल)",
        "रजत अथवा ताम्र पात्र दान",
        "गोसेवा एवं गुड़-घास समर्पण"
      ],
      te: [
        "నల్ల నువ్వులు మరియు పవిత్ర దర్భ",
        "అన్నదానం మరియు బ్రాహ్మణ భోజనం",
        "వస్త్రదానం (ధోవతి / శాలువా)",
        "వెండి లేదా రాగి పాత్ర దానం",
        "గోసేవ మరియు బెల్లం-గడ్డి సమర్పణ"
      ],
      ta: [
        "கருப்பு எள் மற்றும் புனித தர்ப்பை",
        "அன்னதானம் மற்றும் அந்தணர் போஜனம்",
        "வஸ்திர தானம் (வேஷ்டி / சால்வை)",
        "வெள்ளி அல்லது தாமிர பாத்திர தானம்",
        "கோ சேவை மற்றும் வெல்லம்-புல் அளித்தல்"
      ]
    }
  };
}

export function computeGokarnaMokshaSevas(): GokarnaMokshaSevaInfo {
  return {
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Sri Shreeram Pandit)",
    priestPhone: "+91 99723 39362",
    narayanabaliOverview: {
      kn: "ನಾರಾಯಣಬಲಿ ಮಹಾ ಪೂಜೆ: ಅಕಾಲ ಮರಣ, ಅಪಘಾತ ಅಥವಾ ಸರ್ಪದೋಷದಿಂದ ಉಂಟಾದ ಪಿತೃ ಬಾಧೆ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನೆರವೇರಿಸುವ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪ್ರಾಯಶ್ಚಿತ್ತ ವಿಧಿ.",
      en: "Narayanabali Maha Pooja: Supreme Vedic rite performed at Gokarna Mahabaleshwara to liberate souls from untimely demise, accidental deaths, or intense Pitru doshas.",
      hi: "नारायणबलि महा पूजा: अकाल मृत्यु, दुर्घटना अथवा सर्प दोष जनित पितृ बाधा निवारण हेतु गोकर्ण महाबलेश्वर सन्निधि में संपन्न होने वाला सर्वश्रेष्ठ प्रायश्चित्त विधान।",
      te: "నారాయణబలి మహా పూజ: అకాల మరణం, ప్రమాదాలు లేదా పితృ దోషాల నివారణకు గోకర్ణ మహాబలేశ్వర సన్నిధిలో నిర్వహించే పరమోత్కృష్ట శాంతి విధి.",
      ta: "நாராயணபலி மகா பூஜை: துர்மரணம், விபத்து அல்லது பித்ரு தோஷ நிவர்த்திக்காக கோகர்ண மகாபலேஸ்வரர் சன்னதியில் செய்யப்படும் மிக உயர்ந்த சாந்தி பரிகாரம்."
    },
    tripindiShraddhaOverview: {
      kn: "ಮೂರು ತಲೆಮಾರುಗಳ (ಪಿತೃ, ಪಿತಾಮಹ, ಪ್ರಪಿತಾಮಹ) ಅತೃಪ್ತ ಆತ್ಮಗಳ ಮುಕ್ತಿಗಾಗಿ ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ರುದ್ರ ರೂಪದ ೩ ಪಿಂಡಗಳಿಂದ ನೆರವೇರಿಸುವ ಮಹಾ ಶ್ರಾದ್ಧ.",
      en: "Grand Shraddha offering 3 cosmic Pindas to Brahma, Vishnu, and Rudra to satisfy restless spirits across 3 generations.",
      hi: "तीन पीढ़ियों (पितृ, पितामह, प्रपितामह) की अतृप्त आत्माओं की मुक्ति हेतु ब्रह्मा, विष्णु, रुद्र रूप 3 पिंडों से संपन्न होने वाला महा श्राद्ध।",
      te: "మూడు తరాల (పితృ, పితామహ, ప్రపితామహ) తృప్తి కోసం బ్రహ్మ, విష్ణు, రుద్ర రూపాలలో 3 పిండాలతో నిర్వహించే మహా శ్రాద్ధం.",
      ta: "மூன்று தலைமுறை பித்ருக்களின் ஆத்ம சாந்திக்காக பிரம்மா, விஷ்ணு, ருத்ர ரூபத்தில் 3 பிண்டங்கள் வைத்து செய்யப்படும் மகா சிரார்த்தம்."
    },
    kshetraImportance: {
      kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ಪರಮಶಿವನ ಆತ್ಮಲಿಂಗವಿರುವ ಪರಮ ಪವಿತ್ರ ಮುಕ್ತಿ ಕ್ಷೇತ್ರ. ಇಲ್ಲಿ ಮಾಡುವ ಪಿಂಡ ಪ್ರದಾನವು ಕಾಶೀ-ಗಯಾ ಕ್ಷೇತ್ರಗಳಿಗೆ ಸಮಾನವಾದ ಫಲ ನೀಡುತ್ತದೆ.",
      en: "Gokarna is the sacred abode of Lord Shiva's Atmalinga. Pinda Dana here bestows merit equivalent to Kashi and Gaya.",
      hi: "गोकर्ण क्षेत्र भगवान शिव के आत्मलिंग से सुशोभित परम पावन मुक्ति क्षेत्र है। यहाँ किया गया पिंडदान काशी-गया के समान फलदायी है।",
      te: "గోకర్ణ క్షేత్రం పరమశివుని ఆత్మలింగం వెలసిన పరమ పవిత్ర ముక్తి క్షేత్రం. ఇక్కడ చేసే పిండ ప్రదానం కాశీ, గయలతో సమానమైన ఫలాన్నిస్తుంది.",
      ta: "கோகர்ணம் சிவபெருமானின் ஆத்மலிங்கம் அமைந்துள்ள புண்ணிய முக்தி ஸ்தலம். இங்கு செய்யப்படும் பிண்ட தானம் காசி மற்றும் கயைக்கு இணையான பலனைத் தரும்."
    }
  };
}

/** Execute complete Maranottara, Masika, Antyesti, Dosha & Pilgrimage Calculations */
export function executeMaranottaraCalculation(input: MaranottaraInput): MaranottaraResult {
  const {
    personName,
    demiseDate,
    demiseTime,
    location = "Gokarna, Karnataka",
    yearsCount = 1,
    lat = 14.5479,
    lng = 74.3188
  } = input;
  const timeStr = demiseTime || "12:00";

  // Calculate precise UTC moment using wallClockBirthToUtc
  const demiseUtc = wallClockBirthToUtc(demiseDate, timeStr, lat, lng, "581326");

  const baggonaResult = calculateTraditionalBaggona(
    demiseDate,
    timeStr,
    lat,
    lng,
    "lahiri"
  );

  const tithiInfo = getTithiFromUtc(demiseUtc);
  const demiseTithiNum = tithiInfo.tithiNumber;

  // Derive Masa & Samvatsara
  const demiseMasaObj: Record<string, string> = {
    kn: baggonaResult.masaKn || "ಶ್ರಾವಣ",
    en: baggonaResult.masa || "Shravana",
    hi: baggonaResult.masa || "श्रावण",
    te: baggonaResult.masaKn || "శ్రావణం",
    ta: baggonaResult.masa || "ஆவணி"
  };

  const demiseSamvatsaraObj: Record<string, string> = {
    kn: baggonaResult.samvatsaraKn || "ಪರಾಭವ",
    en: baggonaResult.samvatsara || "Parabhava",
    hi: baggonaResult.samvatsara || "पराभव",
    te: baggonaResult.samvatsaraKn || "పరాభవ",
    ta: baggonaResult.samvatsara || "பராபவ"
  };

  // 5-Language Demise Metadata Objects
  const demiseTithiObj = tithiInfo.tithi5Lang;
  const demisePakshaObj = tithiInfo.paksha5Lang;

  const nakshatraLongs = siderealLongitudes(demiseUtc, "lahiri");
  const nakIdx = Math.floor((nakshatraLongs.moon % 360) / (360 / 27)) % 27;
  const demiseNakshatraObj = NAKSHATRAS_5LANG[nakIdx] || NAKSHATRAS_5LANG[0];

  // Generate Monthly Masika Dates for chosen duration (12, 24, 36, 48, 60 months) with Aparahna Kaala matching
  const totalMonths = yearsCount * 12;
  const masikaSchedule: MasikaScheduleItem[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const { matchedUtc, aparahnaWindow, panchangaDay } = findBaggonaMasikaShraddhaDate(
      tithiInfo.tithiIndex,
      m,
      demiseUtc,
      lat,
      lng
    );

    const dayOfWeekIdx = getIstWeekday(matchedUtc);
    const dayOfWeekObj = WEEKDAYS_5LANG[dayOfWeekIdx] || WEEKDAYS_5LANG[0];

    const isVarshika = m % 12 === 0;
    const yearNumber = Math.ceil(m / 12);
    const monthInYear = m % 12 === 0 ? 12 : m % 12;
    const isSpecial = isVarshika || monthInYear === 1 || monthInYear === 3 || monthInYear === 6;

    let masikaTitleKn = `${m}ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ`;
    let masikaTitleEn = `Month ${m} Masika Shraddha`;
    let masikaTitleHi = `${m}वां मासिक श्राद्ध`;
    let masikaTitleTe = `${m}వ మాసిక శ్రాద్ధం`;
    let masikaTitleTa = `${m}ம் மாசிக சிரார்த்தம்`;

    if (monthInYear === 1) {
      masikaTitleKn = `೧ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಪ್ರಥಮ ಮಾಸಿಕ)`;
      masikaTitleEn = `1st Month Masika (Prathama Masika)`;
      masikaTitleHi = `प्रथम मासिक श्राद्ध (मास १)`;
      masikaTitleTe = `1వ మాసిక శ్రాద్ధం (ప్రథమ మాసికం)`;
      masikaTitleTa = `1ம் மாசிக சிரார்த்தம் (முதலாம் மாதம்)`;
    } else if (monthInYear === 3) {
      masikaTitleKn = `೩ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ತ್ರೈಮಾಸಿಕ)`;
      masikaTitleEn = `3rd Month Masika (Traimasika)`;
      masikaTitleHi = `तृतीय मासिक श्राद्ध (त्रैमासिक)`;
      masikaTitleTe = `3వ మాసిక శ్రాద్ధం (త్రైమాసికం)`;
      masikaTitleTa = `3ம் மாசிக சிரார்த்தம் (த்ரைமாசிகம்)`;
    } else if (monthInYear === 6) {
      masikaTitleKn = `೬ನೇ ಮಾಸಿಕ ಶ್ರಾದ್ಧ (ಷಣ್ಮಾಸಿಕ)`;
      masikaTitleEn = `6th Month Masika (Shanmasika)`;
      masikaTitleHi = `षष्ठ मासिक श्राद्ध (षण्मासिक)`;
      masikaTitleTe = `6వ మాసిక శ్రాద్ధం (షణ్మాసికం)`;
      masikaTitleTa = `6ம் மாசிக சிரார்த்தம் (ஷண்மாசிகம்)`;
    } else if (isVarshika) {
      const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
      const yKn = String(yearNumber).split("").map((d) => knDigits[Number(d)] || d).join("");
      masikaTitleKn = `🌟 ${yKn}ನೇ ವರ್ಷದ ವಾರ್ಷಿಕ ಮಹಾ ಶ್ರಾದ್ಧ (Varshika Shraddha)`;
      masikaTitleEn = `🌟 Year ${yearNumber} Annual Varshika Shraddha`;
      masikaTitleHi = `🌟 ${yearNumber}वें वर्ष का वार्षिक महा श्राद्ध`;
      masikaTitleTe = `🌟 ${yearNumber}వ సంవత్సర వార్షిక మహా శ్రాద్ధం`;
      masikaTitleTa = `🌟 ${yearNumber}ம் ஆண்டு வருடாந்திர மகா சிரார்த்தம்`;
    }

    const ritualNotesObj: Record<string, string> = {
      kn: isVarshika
        ? `ಮೃತರ ಪುಣ್ಯತಿಥಿ · ವಾರ್ಷಿಕ ಮಹಾ ಶ್ರಾದ್ಧ, ಸಪಿಂಡೀಕರಣ, ಪಿಂಡ ಪ್ರದಾನ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ.`
        : monthInYear === 1
        ? `ಪ್ರಥಮ ಮಾಸಿಕ ತರ್ಪಣ, ಎಳ್ಳು-ನೀರು ಸಮರ್ಪಣೆ & ವಸ್ತ್ರದಾನ.`
        : monthInYear === 6
        ? `ಷಣ್ಮಾಸಿಕ ಮಹಾ ಶ್ರಾದ್ಧ & ಪಿತೃ ತರ್ಪಣ.`
        : `ಮಾಸಿಕ ಪಿತೃ ತರ್ಪಣ, ಎಳ್ಳು-ನೀರು ಸಮರ್ಪಣೆ & ದಾನ ಧರ್ಮ ಕರ್ಮ.`,
      en: isVarshika
        ? `Annual Sacred Varshika Shraddha, Pinda Pradana & Brahmana Bhojana.`
        : monthInYear === 1
        ? `First Month Masika Tarpana, Sesame water oblations & Charity.`
        : monthInYear === 6
        ? `Six-Month (Shanmasika) Shraddha & Ancestral libation.`
        : `Monthly Pitru Tarpana, Sesame oblations & Sacred Charity.`,
      hi: isVarshika
        ? `दिवंगत की पुण्यतिथि · वार्षिक महा श्राद्ध, पिंडदान एवं ब्राह्मण भोजन।`
        : monthInYear === 1
        ? `प्रथम मासिक तर्पण, तिल-जल समर्पण एवं वस्त्रदान।`
        : monthInYear === 6
        ? `षण्मासिक महा श्राद्ध एवं पितृ तर्पण।`
        : `मासिक पितृ तर्पण एवं दान-धर्म कर्म।`,
      te: isVarshika
        ? `దివంగతుల పుణ్యతిథి · వార్షిక మహా శ్రాద్ధం, పిండ ప్రదానం మరియు బ్రాహ్మణ భోజనం.`
        : monthInYear === 1
        ? `ప్రథమ మాసిక తర్పణం, నువ్వులు-నీళ్ల సమర్పణ మరియు దానం.`
        : monthInYear === 6
        ? `షణ్మాసిక మహా శ్రాద్ధం మరియు పితృ తర్పణం.`
        : `మాసిక పితృ తర్పణం మరియు దానధర్మాలు.`,
      ta: isVarshika
        ? `வருடாந்திர மகா சிரார்த்தம், பிண்ட தானம் மற்றும் அந்தணர் போஜனம்.`
        : monthInYear === 1
        ? `முதலாம் மாத மாசிக தர்பணம், எள்-நீர் சமர்ப்பணம்.`
        : monthInYear === 6
        ? `ஷண்மாசிக மகா சிரார்த்தம் & பித்ரு தர்பணம்.`
        : `மாதாந்திர பித்ரு தர்பணம் மற்றும் தான தர்மங்கள்.`
    };

    masikaSchedule.push({
      monthIndex: m,
      masikaName: {
        kn: masikaTitleKn,
        en: masikaTitleEn,
        hi: masikaTitleHi,
        te: masikaTitleTe,
        ta: masikaTitleTa
      },
      tithiName: demiseTithiObj,
      gregorianDate: toIstYmdString(matchedUtc),
      formattedDateStr: {
        kn: formatIstDateDisplay(matchedUtc, "kn"),
        en: formatIstDateDisplay(matchedUtc, "en"),
        hi: formatIstDateDisplay(matchedUtc, "hi"),
        te: formatIstDateDisplay(matchedUtc, "te"),
        ta: formatIstDateDisplay(matchedUtc, "ta")
      },
      dayOfWeek: dayOfWeekObj,
      paksha: demisePakshaObj,
      isVarshikaShraddha: isVarshika,
      isSpecialMilestone: isSpecial,
      ritualNotes: ritualNotesObj,
      aparahnaWindow,
      panchangaSummary: panchangaDay
        ? {
            kn: `${panchangaDay.masaKn || ""} ${panchangaDay.pakshaKn || ""} ${panchangaDay.tithiKn || ""}`,
            en: `${panchangaDay.masa || ""} ${panchangaDay.paksha || ""} ${panchangaDay.tithi || ""}`
          }
        : undefined
    });
  }

  // Calculate Demise Time Dosha & Recommended Gokarna Shanti Poojas
  const demiseDayOfWeek = getIstWeekday(demiseUtc);
  const hour = demiseTime ? parseInt(demiseTime.split(":")[0], 10) : 12;
  const isNight = hour < 6 || hour >= 18;
  const hasSpecificTime = !!demiseTime;

  // Authentic Panchaka Nakshatra Check
  const nakshatraNameLower = (demiseNakshatraObj.en || "").toLowerCase();
  const nakshatraNameKn = demiseNakshatraObj.kn || "";

  const isTripadaNakshatra =
    nakshatraNameLower.includes("dhanishta") ||
    nakshatraNameLower.includes("shatabhisha") ||
    nakshatraNameLower.includes("bhadra") ||
    nakshatraNameLower.includes("revati") ||
    nakshatraNameLower.includes("krittika") ||
    nakshatraNameLower.includes("punarvasu") ||
    nakshatraNameLower.includes("uttarashadha") ||
    nakshatraNameKn.includes("ಧನಿಷ್ಠಾ") ||
    nakshatraNameKn.includes("ಶತಭಿಷಾ") ||
    nakshatraNameKn.includes("ರೇವತಿ") ||
    nakshatraNameKn.includes("ಕೃತ್ತಿಕಾ") ||
    nakshatraNameKn.includes("ಪುನರ್ವಸು") ||
    nakshatraNameKn.includes("ಉತ್ತರಾಷಾಢ");

  const hasPanchaka = isTripadaNakshatra || demiseTithiNum === 4 || demiseTithiNum === 9 || demiseTithiNum === 14;

  // Determine Panchaka Type & Putthali Count
  let panchakaTypeObj: Record<string, string> = {
    kn: "ಸಾಮಾನ್ಯ",
    en: "Normal",
    hi: "सामान्य",
    te: "సాధారణం",
    ta: "சாதாரண"
  };
  let putthaliCount = 0;

  if (hasPanchaka) {
    if (demiseDayOfWeek === 0) {
      panchakaTypeObj = {
        kn: "ಮೃತ್ಯು ಪಂಚಕ (Mrityu Panchaka — ರವಿವಾರ)",
        en: "Mrityu Panchaka (Sunday Demise)",
        hi: "मृत्यु पंचक (रविवार)",
        te: "మృత్యు పంచకం (ఆదివారం)",
        ta: "மிருத்யு பஞ்சகம் (ஞாயிறு)"
      };
      putthaliCount = 5;
    } else if (demiseDayOfWeek === 2) {
      panchakaTypeObj = {
        kn: "ಅಗ್ನಿ ಪಂಚಕ (Agni Panchaka — ಮಂಗಳವಾರ)",
        en: "Agni Panchaka (Tuesday Demise)",
        hi: "अग्नि पंचक (मंगलवार)",
        te: "అగ్ని పంచకం (మంగళవారం)",
        ta: "அக்னி பஞ்சகம் (செவ்வாய்)"
      };
      putthaliCount = 5;
    } else if (demiseDayOfWeek === 5) {
      panchakaTypeObj = {
        kn: "ರಾಜ ಪಂಚಕ (Raja Panchaka — ಶುಕ್ರವಾರ)",
        en: "Raja Panchaka (Friday Demise)",
        hi: "राज पंचक (शुक्रवार)",
        te: "రాజ పంచకం (శుక్రవారం)",
        ta: "ராஜ பஞ்சகம் (வெள்ளி)"
      };
      putthaliCount = 4;
    } else if (demiseDayOfWeek === 6) {
      panchakaTypeObj = {
        kn: "ಚೋರ ಪಂಚಕ (Chora Panchaka — ಶನಿವಾರ)",
        en: "Chora Panchaka (Saturday Demise)",
        hi: "चोर पंचक (शनिवार)",
        te: "చోర పంచకం (శనివారం)",
        ta: "சோர பஞ்சகம் (சனி)"
      };
      putthaliCount = 5;
    } else {
      panchakaTypeObj = {
        kn: "ರೋಗ ಪಂಚಕ (Roga Panchaka — ಸೋಮ/ಬುಧ/ಗುರುವಾರ)",
        en: "Roga Panchaka (Mon/Wed/Thu Demise)",
        hi: "रोग पंचक (सोम/बुध/गुरुवार)",
        te: "రోగ పంచకం (సోమ/బుధ/గురువారం)",
        ta: "ரோக பஞ்சகம் (திங்கள்/புதன்/வியாழன்)"
      };
      putthaliCount = 3;
    }
  }

  const pTypeStr = panchakaTypeObj.kn;

  const doshaSummaryObj: Record<string, string> = {
    kn: hasPanchaka
      ? `ಮರಣ ಹೊಂದಿದ ನಕ್ಷತ್ರ/ವಾರದ ಅನುಸಾರ '${pTypeStr}' ಸೂಚಿತವಾಗಿದೆ. ಕುಲರಕ್ಷಣೆಗಾಗಿ ದರ್ಭೆಯ ${putthaliCount} ಪುತ್ತಳಿಗಳ ದಹನ (ಪುತ್ತಳಿ ವಿಧಾನ) ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪಂಚಕ ಶಾಂತಿ & ಸರ್ಪಾಹುತಿ ಹೋಮ ಅತ್ಯಾವಶ್ಯಕ.`
      : hasSpecificTime && isNight
      ? `ರಾತ್ರಿ ಕಾಲದ ಮರಣ ಸನ್ನಿವೇಶದಿಂದ ಲಘು ಸಂಧ್ಯಾ ದೋಷ ಸೂಚಿತವಾಗಿದೆ. ಪ್ರಥಮ ವರ್ಷ ತಿಲ ತರ್ಪಣ ಹಾಗೂ ಗೋದಾನದಿಂದ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.`
      : `ಮರಣ ಸಮಯವು ಸಾಮಾನ್ಯ ಸನ್ಮಂಗಲಕರವಾಗಿದೆ. ನಿಯಮಿತ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ಹಾಗೂ ಪಿಂಡ ಪ್ರದಾನ ಕರ್ಮಗಳನ್ನು ನೆರವೇರಿಸಿ.`,
    en: hasPanchaka
      ? `${panchakaTypeObj.en} detected. Vedic Putthali Vidhana (${putthaliCount} Darbha effigies) and Gokarna Panchaka Shanti Homa strongly recommended for family protection.`
      : hasSpecificTime && isNight
      ? `Nocturnal transition indicated. Regular monthly Tarpana and Go-Dana recommended.`
      : `No severe demise doshas. Perform regular monthly Masika & Pitru Tarpana rituals diligently.`,
    hi: hasPanchaka
      ? `${panchakaTypeObj.hi} सूचित है। कुल रक्षा हेतु दर्भ की ${putthaliCount} पुतलियों का दाह (पुत्तली विधान) एवं गोकर्ण महाबलेश्वर में पंचक शांति होम अत्यंत आवश्यक है।`
      : hasSpecificTime && isNight
      ? `रात्रि कालीन मृत्यु से लघु संध्या दोष है। प्रथम वर्ष तिल तर्पण एवं गोदान से शांति प्राप्त होगी।`
      : `मृत्यु समय सामान्य शुभ है। नियमित मासिक श्राद्ध एवं पिंडदान करें।`,
    te: hasPanchaka
      ? `${panchakaTypeObj.te} సూచించబడింది. కుటుంబ రక్షణ కోసం ${putthaliCount} దర్భ పుత్తళ్ల దహనం మరియు గోకర్ణంలో పంచక శాంతి హోమం అవసరం.`
      : hasSpecificTime && isNight
      ? `రాత్రి వేళ మరణం వల్ల సంధ్యా దోషం ఉంది. మొదటి సంవత్సరం తిల తర్పణం, గోదానం శ్రేయస్కరం.`
      : `మరణ సమయం సాధారణంగా ఉంది. నియమిత మాసిక శ్రాద్ధాలు నెరవేర్చండి.`,
    ta: hasPanchaka
      ? `${panchakaTypeObj.ta} ஏற்பட்டுள்ளது. குடும்ப நன்மைக்காக ${putthaliCount} தர்ப்பை பொம்மைகள் தகனம் மற்றும் கோகர்ணத்தில் பஞ்சக சாந்தி ஹோமம் அவசியம்.`
      : hasSpecificTime && isNight
      ? `இரவு நேர மரணத்தால் சந்தி தோஷம் உள்ளது. தில தர்பணம் மற்றும் கோதானம் நன்மை தரும்.`
      : `மரண நேரம் இயல்பானது. வழக்கமான மாசிக சிரார்த்தங்களைச் செய்யவும்.`
  };

  const poojas: PoojaRemedyItem[] = [
    {
      title: {
        kn: `🪔 ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪಂಚಕ ಶಾಂತಿ & ${putthaliCount || 3} ಪುತ್ತಳಿ ವಿಧಾನ`,
        en: `Gokarna Panchaka Shanti & ${putthaliCount || 3} Putthali Vidhana`,
        hi: `गोकर्ण पंचक शांति एवं ${putthaliCount || 3} पुत्तली विधान`,
        te: `గోకర్ణ పంచక శాంతి & ${putthaliCount || 3} పుత్తళి విధానం`,
        ta: `கோகர்ண பஞ்சக சாந்தி & ${putthaliCount || 3} பொம்மை சாந்தி`
      },
      description: {
        kn: `ಮರಣ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ತ್ರಿಪಾದ/ಪಂಚಕ ಶಾಂತಿ ಹೋಮ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ದರ್ಭೆಯ ${putthaliCount || 3} ಪುತ್ತಳಿ ದಹನ ವಿಧಾನ.`,
        en: `Panchaka Shanti Homa, Rudrabhishekam and Darbha Putthali Vidhana at Gokarna Mahabaleshwara for soul liberation.`,
        hi: `मृत्यु दोष निवारण हेतु गोकर्ण महाबलेश्वर में पंचक शांति होम, रुद्राभिषेक एवं दर्भ पुत्तली दाह विधान।`,
        te: `మరణ దోష నివారణకు గోకర్ణంలో పంచక శాంతి హోమం, రుద్రాభిషేకం మరియు దర్భ పుత్తళి దహన విధి.`,
        ta: `மரண தோஷ நிவர்த்திக்காக கோகர்ணத்தில் பஞ்சக சாந்தி ஹோமம், ருத்ராபிஷேகம் மற்றும் தர்ப்பை பொம்மை தகன விதி.`
      },
      danaItems: {
        kn: "ತಿಲ ದಾನ, ವಸ್ತ್ರ ದಾನ, ತಾಮ್ರ ಪಾತ್ರೆ & ದಕ್ಷಿಣೆ",
        en: "Sesame (Tila), Cloth, Copper Vessel & Dakshina",
        hi: "तिल दान, वस्त्र दान, ताम्र पात्र एवं दक्षिणा",
        te: "నువ్వుల దానం, వస్త్ర దానం, రాగి పాత్ర & దక్షిణ",
        ta: "எள் தானம், வஸ்திர தானம், தாமிர பாத்திரம் & தக்ஷிணை"
      }
    },
    {
      title: {
        kn: "🥛 ಪ್ರಥಮ ವರ್ಷ ತಿಲ ತರ್ಪಣ & ಬ್ರಾಹ್ಮಣ ಭೋಜನ",
        en: "First Year Tila Tarpana & Brahmana Bhojana",
        hi: "प्रथम वर्ष तिल तर्पण एवं ब्राह्मण भोजन",
        te: "మొదటి సంవత్సరం తిల తర్పణం & బ్రాహ్మణ భోజనం",
        ta: "முதலாம் ஆண்டு தில தர்பணம் & அந்தணர் போஜனம்"
      },
      description: {
        kn: "ಪ್ರತಿಯೊಂದು ಮಾಸಿಕ ತಿಥಿಯಂದು ಅಪರಾಹ್ನ ಕಾಲದಲ್ಲಿ ಪಿತೃಗಳಿಗೆ ಎಳ್ಳು-ನೀರಿನ ತರ್ಪಣ ನೀಡಬೇಕು.",
        en: "Offer Tila (Sesame) water tarpana to ancestors on every monthly Masika date during Aparahna Kaala.",
        hi: "प्रत्येक मासिक तिथि के दिन अपराह्न काल में पितरों को तिल-जल का तर्पण अर्पित करें।",
        te: "ప్రతి మాసిక తిథి నాడు అపరాహ్న సమయంలో పితృదేవతలకు తిలాంజలి సమర్పించాలి.",
        ta: "ஒவ்வொரு மாசிக திதியிலும் அபராஹ்ண காலத்தில் பித்ருக்களுக்கு எள்-நீர் தர்பணம் செய்ய வேண்டும்."
      },
      danaItems: {
        kn: "ಅನ್ನದಾನ, ಜಲಪಾತ್ರೆ ದಾನ",
        en: "Food donation & Sacred Water Vessel",
        hi: "अन्नदान एवं जलपात्र दान",
        te: "అన్నదానం & జలపాత్ర దానం",
        ta: "அன்னதானம் & தீர்த்த பாத்திர தானம்"
      }
    },
    {
      title: {
        kn: "🐄 ವೈತರಣಿ ಗೋದಾನ & ಶಯ್ಯಾದಾನ",
        en: "Vaitarani Godana & Shayyadana",
        hi: "वैतरणी गोदान एवं शय्यादान",
        te: "వైతరణి గోదానం & శయ్యాదానం",
        ta: "வைதரணி கோதானம் & சய்யாதானம்"
      },
      description: {
        kn: "ಆತ್ಮವು ಪರಲೋಕ ಪಯಣದಲ್ಲಿ ವೈತರಣಿ ನದಿಯನ್ನು ಸುಲಭವಾಗಿ ದಾಟಲು ಗೋಕರ್ಣ ಅಥವಾ ತೀರ್ಥ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೋದಾನ ಸಮರ್ಪಣೆ.",
        en: "Vaitarani Cow donation ensuring peaceful transit across spiritual realms.",
        hi: "परलोक यात्रा में वैतरणी नदी को सुगमता से पार करने हेतु गोकर्ण तीर्थ में गोदान समर्पण।",
        te: "పరలోక ప్రయాణంలో వైతరణి నదిని దాటడానికి గోకర్ణ క్షేత్రంలో గోదాన సమర్పణ.",
        ta: "பரலோக பயணத்தில் வைதரணி நதியைக் கடக்க கோகர்ணத்தில் கோதானம் செய்தல்."
      },
      danaItems: {
        kn: "ಗೋಸೇವೆ, ಬೆಳ್ಳಿ/ತಾಮ್ರ ಪಾತ್ರೆ, ವಸ್ತ್ರ, ಶಯ್ಯಾ ಉಪಕರಣಗಳು",
        en: "Cow worship, Silver vessel, Clothes, Bedding items",
        hi: "गोसेवा, रजत/ताम्र पात्र, वस्त्र, शय्या सामग्री",
        te: "గోసేవ, వెండి/రాగి పాత్ర, వస్త్రాలు, శయ్యా సామాగ్రి",
        ta: "பசு சேவை, வெள்ளி/தாமிர பாத்திரம், வஸ்திரம், படுக்கை பொருட்கள்"
      }
    }
  ];

  const doshaAnalysis: DoshaAnalysisResult = {
    hasPanchakaDosha: hasPanchaka,
    panchakaType: panchakaTypeObj,
    hasNakshatraDosha: isTripadaNakshatra,
    nakshatraDoshaType: {
      kn: isTripadaNakshatra ? `${demiseNakshatraObj.kn} (ತ್ರಿಪಾದ/ಪಂಚಕ ನಕ್ಷತ್ರ)` : "ಸಾಮಾನ್ಯ",
      en: isTripadaNakshatra ? `${demiseNakshatraObj.en} (Tripada/Panchaka)` : "Normal",
      hi: isTripadaNakshatra ? `${demiseNakshatraObj.hi} (त्रिपाद/पंचक नक्षत्र)` : "सामान्य",
      te: isTripadaNakshatra ? `${demiseNakshatraObj.te} (త్రిపాద/పంచక నక్షత్రం)` : "సాధారణం",
      ta: isTripadaNakshatra ? `${demiseNakshatraObj.ta} (பஞ்சக நட்சத்திரம்)` : "சாதாரண"
    },
    hasSandhyaRatriDosha: isNight,
    hasTimeSpecificAnalysis: hasSpecificTime,
    doshaSummary: doshaSummaryObj,
    putthaliVidhanaRequired: hasPanchaka,
    putthaliCount,
    recommendedPoojas: poojas
  };

  const antyestiRoadmap = compute12DaysRoadmap(demiseDate, demiseTime);
  const asthiGuide = computeAsthiVisarjanaGuide();
  const garudaWisdom = computeGarudaPuranaWisdom();
  const mahalayaRules = computeMahalayaTarpanaRules();
  const gokarnaSevas = computeGokarnaMokshaSevas();

  return {
    personName,
    demiseDate,
    demiseTime,
    location,
    yearsCount,
    demiseTithi: demiseTithiObj,
    demiseNakshatra: demiseNakshatraObj,
    demisePaksha: demisePakshaObj,
    demiseMasa: demiseMasaObj,
    demiseSamvatsara: demiseSamvatsaraObj,
    masikaSchedule,
    antyestiRoadmap,
    doshaAnalysis,
    asthiGuide,
    garudaWisdom,
    mahalayaRules,
    gokarnaSevas,
    generatedAt: new Date().toLocaleString()
  };
}

/** Generate AI Spiritual Consolation & Vedic Guidance using Gemini 3.5 Flash Lite */
export async function generateMaranottaraAIConsolation(
  result: MaranottaraResult,
  lang: string = "kn",
  apiKey?: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2) as MaranottaraLang;

  const fallbackText: Record<string, string> = {
    kn: `॥ ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ॥\n\nಓಂ ಶಾಂತಿಃ. ದಿವಂಗತ ${result.personName} ಅವರ ದಿವ್ಯಾತ್ಮಕ್ಕೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಿಂದ ಚಿರಶಾಂತಿ ಹಾಗೂ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.\n\nಗರುಡ ಪುರಾಣ ಹಾಗೂ ಧರ್ಮಶಾಸ್ತ್ರಗಳ ಸಾರಾಂಶದಂತೆ, ಆತ್ಮವು ದೇಹವನ್ನು ತ್ಯಜಿಸಿದ ನಂತರ ${result.yearsCount} ವರ್ಷಗಳ ಕಾಲ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸೂಚಿಸಲಾದ ಮಾಸಿಕ ಶ್ರಾದ್ಧ, ಷಣ್ಮಾಸಿಕ, ಹಾಗೂ ವಾರ್ಷಿಕ ಪುಣ್ಯತಿಥಿ ದಿನಗಳಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಎಳ್ಳು-ನೀರು ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃ ದೇವತೆಗಳು ಸಂಪೂರ್ಣ ತೃಪ್ತರಾಗುತ್ತಾರೆ.\n\nಪಿತೃಗಳ ಪ್ರಸನ್ನತೆಯಿಂದ ಅವರ ವಂಶಸ್ಥರಿಗೆ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ಸನ್ಮಂಗಳ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯ ಸದಾ ರಕ್ಷಣಾ ಕವಚವಾಗಿ ಉಳಿಯುತ್ತದೆ.`,
    en: `॥ Om Namo Bhagavate Vasudevaya ॥\n\nOm Shanti. May the departed soul of ${result.personName} attain eternal peace, liberation (Sadgati), and shelter at the lotus feet of Sri Gokarna Mahabaleshwara.\n\nAccording to the Garuda Purana, performing the calculated ${result.yearsCount}-year monthly Masika Shraddha, Shanmasika, and annual Varshika Shraddha rituals with devout Tila Tarpana and food charity brings immense satisfaction to the ancestral spirits (Pitrus).\n\nAncestral blessings serve as a perpetual divine shield, bestowing longevity, prosperity, and spiritual harmony upon the entire lineage.`,
    hi: `॥ ॐ नमो भगवते वासुदेवाय ॥\n\nॐ शांति। गोकर्ण महाबलेश्वर स्वामी के पावन चरणों में दिवंगत ${result.personName} की आत्मा की शांति एवं मोक्ष प्राप्ति हेतु प्रार्थना।\n\nगरुड़ पुराणानुसार ${result.yearsCount} वर्षों के निर्धारित मासिक श्राद्ध, त्रैमासिक, षण्मासिक एवं वार्षिक श्राद्ध के पावन दिनों में तिलांजलि एवं ब्राह्मण भोजन कराने से पितृ तृप्त होकर कुल को दीर्घायु एवं सुख-समृद्धि का आशीर्वाद प्रदान करते हैं।`,
    te: `॥ ఓం నమో భగవతే వాసుదేవాయ ॥\n\nఓం శాంతి. శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి సన్నిధిలో ${result.personName} దివ్యాత్మకు సద్గతి మరియు శాశ్వత మోక్షం కలుగుగాక.\n\nగరుడ పురాణానుసారం ${result.yearsCount} సంవత్సరాల మాసిక శ్రాద్ధాలు, షణ్మాసిక మరియు వార్షిక శ్రాద్ధ దినాలలో భక్తితో తిలాంజలి మరియు బ్రాహ్మణ భోజనం సమర్పించడం ద్వారా పితృదేవతలు తృప్తి చెంది వంశానికి ఆయురారోగ్యాలు ప్రసాదిస్తారు.`,
    ta: `॥ ஓம் நமோ பகவதே வாசுதேவாய ॥\n\nஓம் சாந்தி. ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் பாதங்களில் ${result.personName} அவர்களின் ஆத்மா சாந்தி மற்றும் முக்தி அடையட்டும்.\n\nகருட புராணத்தின்படி ${result.yearsCount} ஆண்டுகளுக்கான மாசிக சிரார்த்தங்கள் மற்றும் வருடாந்திர புண்ணிய திதிகளில் எள்-தீர்த்த தர்பணம் செய்வதன் மூலம் பித்ருக்கள் திருப்தியடைந்து குடும்பத்திற்கு சகல சௌபாக்கியங்களையும் அருளுவார்கள்.`
  };

  const activeKey = apiKey || (typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env.VITE_GEMINI_API_KEY as string) : "");

  if (!activeKey) {
    return fallbackText[langCode] || fallbackText.en;
  }

  try {
    const prompt = `You are Sri Shreeram Pandit (+91 99723 39362), Chief Priest of Sri Kshetra Gokarna Mahabaleshwara.
Provide a sacred, comforting, authentic Vedic spiritual consolation and guidance message for the family of the deceased person:
- Deceased Name: ${result.personName}
- Demise Date: ${result.demiseDate} (Tithi: ${result.demiseTithi[langCode] || result.demiseTithi.kn})
- Demise Nakshatra: ${result.demiseNakshatra[langCode] || result.demiseNakshatra.kn}
- Scheduled Masika Duration: ${result.yearsCount} Year(s) (${result.masikaSchedule.length} Monthly Masikas)
- Dosha Indications: ${result.doshaAnalysis.hasPanchakaDosha ? result.doshaAnalysis.panchakaType?.[langCode] || "Panchaka Dosha" : "Normal Vedic transition"}

Guidelines:
1. Write with profound compassion, spiritual comfort, and authentic Garuda Purana & Dharma Shastra wisdom.
2. Explain the spiritual importance of performing monthly Masika Shraddha, Pinda Pradana, and Tila Tarpana for ancestral liberation (Pitru Rina).
3. Mention the sanctity of Sri Kshetra Gokarna Atmalinga for Narayanabali, Tripindi Shradha, and Asthi Visarjana.
4. Write 3-4 structured paragraphs EXCLUSIVELY in the requested language: ${langCode} (${langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English"}).
5. Never mix English/Latin script words into Indian scripts.`;

    const aiRes = await askGemini(prompt, "", activeKey, langCode, { raw: true });
    return aiRes || fallbackText[langCode] || fallbackText.en;
  } catch (err) {
    console.error("Gemini Maranottara AI error:", err);
    return fallbackText[langCode] || fallbackText.en;
  }
}
