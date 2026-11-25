import QRCode from "qrcode";
import { generateCompactGoogleCalendarUrlForQR } from "../features/seva/icsCalendarGenerator";
/**
 * BAGGONA PANCHANGA — SAMPOORNA 25-CHAPTER MASTER DESTINY REPORT SERVICE
 * 
 * 100% Deterministic Accuracy, Luxury Premium Design (Zero Tables),
 * Hook-First 25-Chapter Architecture, Strictly Age-Adaptive & Gender-Aware,
 * Pinned to Chief Priest Chaitanya Pandit (+91 94821 09844).
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { savePdfBlob } from "../utils/pdfGenerator";
import type { KundliOutput, KundliInput, PlanetPosition as AstroPlanetPosition } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";
export type { SixLang };
import { pick6, formatNumber6L, RASHI_6L, GRAHA_6L, NAKSHATRA_6L, WEEKDAY_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import { ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { computeMaandi } from "../core/MaandiEngine";
import { siderealLongitudes } from "../core/EphemerisEngine";
import { detectChartYogas, signLord, type YogaId } from "../core/KundliInsightsEngine";
import { computeSarvashtakavarga } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import { cleanDegreesFromText, cleanPunctuationArtifacts } from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { resolveDevoteeDisplayName } from "../utils/transliterator";
import {
  getFunctionalNature,
  checkNeechaBhanga,
  hasGocharaVedha,
  normalizePlanetName,
  type RashiIndex,
  type Planet,
  type PlanetPosition,
  type FunctionalNature
} from "../engine/jyotishPrecisionGates";
import {
  calculateSecretAccuracyProfile,
  PLANETARY_YOGI_ATTRIBUTES,
  getYogiAttributes6L,
  type SecretAccuracyProfile
} from "../engine/secretAccuracyEngine";
import {
  buildBookletCoverContent,
  computeExtendedPrecisionMetrics,
  buildChapterPrecisionEnrichment,
  formatPageTag6L,
  resolvePlaceDisplayName,
  type BookletCoverContent,
  type ExtendedPrecisionMetrics
} from "./sampoornaMaster25BookletEngine";

// ============================================================================
// 1. DATA TYPES & INTERFACES
// ============================================================================

export type AgeCategory25 =
  | "infant"       // 0 – 1.99 yrs
  | "early_child"  // 2 – 7.99 yrs
  | "child"        // 8 – 12.99 yrs
  | "teen"         // 13 – 17.99 yrs
  | "young_adult"  // 18 – 22.99 yrs
  | "adult"        // 23 – 59.99 yrs
  | "senior";      // 60+ yrs

export interface Master25Chapter {
  chapterNumber: number; // 1 to 25
  sectionNumber: number; // 1 to 5
  sectionTitle: string;
  title: string;
  icon: string;
  question: string;
  paragraphs: string[];
  precisionAnchors?: string[];
  guidanceBadge?: string;
  practicalGuidance?: string;
}

export interface CalendarQrSectionData {
  title: string;
  badge: string;
  priestTitle: string;
  priestName: string;
  priestPhone: string;
  priestPhoneDisplay: string;
  qrDataUrl: string;
  googleCalendarUrl: string;
  description: string;
  features: string[];
  scanInstructions: string;
  upsellNoticeTitle: string;
  upsellNoticeText: string;
}

export interface SampoornaMaster25Payload {
  devoteeName: string;
  rawName: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: "male" | "female";
  maritalStatus?: string;
  childrenStatus?: string;
  ageYears: number;
  ageCategory: AgeCategory25;
  targetLanguage: SixLang;

  // Header Details (6-Anga Complete Natal Panchanga + Dasha)
  lagnaName: string;
  lagnaLord: string;
  moonRashi: string;
  moonLord: string;
  nakshatraName: string;
  nakshatraPada: number;
  pakshaName: string;
  tithiName: string;
  weekdayName: string;
  yogaName: string;
  karanaName: string;
  sunriseTime: string;
  sunsetTime: string;
  horaLord: string;
  janmaHora: string;
  livePrashnaHora: string;
  ayanamsha: string;

  // Dasha & Gochara Context
  currentMahadasha: string;
  currentBhukti: string;
  bhuktiEndDate: string;
  janmaDashaBalance: string;
  isDashaSandhi: boolean;

  // Secret South Indian Accuracy Variables
  yogiPlanet: string;
  yogiNakshatra: string;
  yogiRashi: string;
  yogiColor: string;
  yogiDirection: string;
  yogiDay: string;
  yogiGemstone: string;
  yogiDeity: string;

  avayogiPlanet: string;
  avayogiNakshatra: string;
  avayogiRashi: string;

  bhriguBinduDegreeFormatted: string;
  bhriguBinduRashi: string;
  bhriguBinduTurningWindow: string;

  maandiHouse: number;
  maandiRashi: string;
  hasMaandiKnot: boolean;
  maandiDomainAffected: string;

  // Live Transits & Natal Verification Summaries
  shaniTransitRashi: string;
  shaniHouseFromMoon: number;
  guruTransitRashi: string;
  guruHouseFromMoon: number;
  dominantElement: string;
  detectedYogasSummary: string;
  detectedDoshasSummary: string;
  sectionIndexTitles: { sectionNumber: number; title: string; chapterRange: string }[];

  // Dedicated Cover Page Narrative & Extended Precision Summary
  coverPage: BookletCoverContent;
  precisionProfile: ExtendedPrecisionMetrics["precisionProfileSummary"];
  initialChapterPages: Record<number, number>;
  initialCalendarQrPage: number;
  initialFinalBlessingPage: number;

  // 25 Chapters
  chapters: Master25Chapter[];

  // 15-Day Personal Daily Darshana Google Calendar QR Section
  calendarQrSection?: CalendarQrSectionData;

  // Family Hook & Priest Booking Contact (Pinned to Chaitanya Pandit)
  familyProtectionHook: string;
  priestBooking: {
    heading: string;
    subheading: string;
    priestTitle: string;
    priestName: string;
    phone: string;
    phoneDisplay: string;
    address: string;
  };

  footerText: string;
}

function cleanRegionalPreserveBullets(text: string, lang: SixLang): string {
  if (!text || lang === "en") return text;
  return text
    .split("•")
    .map((seg) => cleanEnglishFromRegionalText(seg, lang).trim())
    .filter(Boolean)
    .join(" • ");
}

// ============================================================================
// 2. NATIVE DIGITS & NUMBER FORMATTING
// ============================================================================

export function toNativeDigits(num: number | string, lang: SixLang): string {
  const s = String(num);
  if (lang === "en") return s;
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  const hiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  const teDigits = ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"];
  const taDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];

  const digits = (lang === "kn") ? knDigits
    : (lang === "mr" || lang === "hi") ? hiDigits
      : (lang === "te") ? teDigits
        : taDigits;

  return s.replace(/\d/g, d => digits[parseInt(d, 10)] || d);
}

// Determine Age Category
export function getAgeCategory25(ageYears: number): AgeCategory25 {
  if (ageYears < 2) return "infant";
  if (ageYears < 8) return "early_child";
  if (ageYears < 13) return "child";
  if (ageYears < 18) return "teen";
  if (ageYears < 23) return "young_adult";
  if (ageYears < 60) return "adult";
  return "senior";
}

export const MAANDI_DOMAIN_MAP: Record<number, Record<SixLang, string>> = {
  1: {
    kn: "ವ್ಯಕ್ತಿತ್ವ, ಆತ್ಮಾಭಿಮಾನ ಹಾಗೂ ನಾಯಕತ್ವದ ನಿರ್ಧಾರಗಳು",
    hi: "व्यक्तित्व, आत्मसम्मान एवं नेतृत्व के निर्णय",
    mr: "व्यक्तिमत्त्व, आत्मसन्मान व नेतृत्वाचे निर्णय",
    te: "వ్యక్తిత్వం, ఆత్మగౌరవం మరియు నాయకత్వ నిర్ణయాలు",
    ta: "சுயமரியாதை, தலைமைத்துவம் மற்றும் ஆளுமை முடிவுகள்",
    en: "Personal identity, self-worth, and leadership initiatives"
  },
  2: {
    kn: "ಧನ ಸಂಚಯ, ಉಳಿತಾಯ ಹಾಗೂ ವಾಣಿಜ್ಯ ಲಾಭ",
    hi: "धन संचय, बचत एवं वित्तीय लाभ",
    mr: "धन संचय, बचत व आर्थिक नफा",
    te: "ధన సంచయం, పొదుపు మరియు ఆర్థిక లాభం",
    ta: "தன சேமிப்பு, குடும்ப நிதி மற்றும் வியாபார லாபம்",
    en: "Wealth accumulation, savings, and financial stability"
  },
  3: {
    kn: "ಸಹೋದರರ ಸಹಕಾರ, ಧೈರ್ಯ ಹಾಗೂ ಹೊಸ ಉದ್ಯಮ ಸಾಹಸಗಳು",
    hi: "भाई-बहनों का सहयोग, पराक्रम एवं नए व्यावसायिक प्रयास",
    mr: "भावंडांचे सहकार्य, धैर्य व नवीन उपक्रम",
    te: "సోదరుల సహకారం, ధైర్యం మరియు నూతన ప్రయత్నాలు",
    ta: "சகோதரர் ஆதரவு, தைரியம் மற்றும் புதிய முயற்சிகள்",
    en: "Sibling cooperation, initiatives, and courage"
  },
  4: {
    kn: "ಗೃಹ ಶಾಂತಿ, ವಾಹನ ಸುಖ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ",
    hi: "गृह शांति, वाहन सुख एवं अचल संपत्ति क्रय",
    mr: "गृह शांती, वाहन सुख व स्थावर मालमत्ता खरेदी",
    te: "గృహ శాంతి, వాహన సౌఖ్యం మరియు స్థిరాస్తి",
    ta: "வீட்டு அமைதி, வாகனம் மற்றும் நில சொத்துக்கள்",
    en: "Domestic peace, vehicle happiness, and property acquisitions"
  },
  5: {
    kn: "ಉನ್ನತ ಶಿಕ್ಷಣ, ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯ",
    hi: "उच्च शिक्षा, बौद्धिक क्षमता एवं संतान सुख",
    mr: "उच्च शिक्षण, बुद्धिमत्ता व संतती सुख",
    te: "ఉన్నత విద్య, సృజనాత్మకత మరియు సంతాన భాగ్యం",
    ta: "உயர் கல்வி, புத்திசாலித்தனம் மற்றும் சந்தான யோகம்",
    en: "Higher learning, intellect, and progeny/creative output"
  },
  6: {
    kn: "ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧೆ ನಿಗ್ರಹ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ",
    hi: "ऋण मुक्ति, शत्रु दमन एवं प्रतियोगी परीक्षाओं में विजय",
    mr: "कर्जमुक्ती, शत्रू नियंत्रण व स्पर्धात्मक यश",
    te: "ఋణ విముక్తి, శత్రు నివారణ మరియు విజయాలు",
    ta: "கடன் நிவர்த்தி, எதிரிகள் வெற்றி மற்றும் வழக்குகள்",
    en: "Debt clearance, overcoming opposition, and victory in competitions"
  },
  7: {
    kn: "ವೈವಾಹಿಕ ಸೌಹಾರ್ದತೆ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಬಂಧಗಳು",
    hi: "वैवाहिक सद्भाव, व्यापारिक साझेदारी एवं जनसंपर्क",
    mr: "वैवाहिक सलोखा, भागीदारी व सार्वजनिक संबंध",
    te: "వైవాహిక సామరస్యం, వ్యాపార భాగస్వామ్యం మరియు సంబంధాలు",
    ta: "திருமண ஒற்றுமை, கூட்டு தொழில் மற்றும் பொதுத் தொடர்பு",
    en: "Marital harmony, business partnerships, and contracts"
  },
  8: {
    kn: "ಆಕಸ್ಮಿಕ ಅಡೆತಡೆಗಳು, ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಹಾಗೂ ಆಂತರಿಕ ಆತಂಕ",
    hi: "अचानक बाधाएं, पैतृक संपत्ति एवं मानसिक उद्वेग",
    mr: "अचानक येणारे अडथळे, वडिलोपार्जित संपत्ती व मानसिक ताण",
    te: "ఆకస్మిక అడ్డంకులు, పూర్వీకుల ఆస్తి మరియు ఆందోళన",
    ta: "திடீர் தடைகள், பூர்வீக சொத்து மற்றும் மன அழுத்தம்",
    en: "Sudden obstacles, legacy clearances, and anxiety resolution"
  },
  9: {
    kn: "ಭಾಗ್ಯೋದಯ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಉನ್ನತ ಗುರುಗಳ ಅನುಗ್ರಹ",
    hi: "भाग्योदय, तीर्थयात्रा एवं गुरु कृपा प्राप्ति",
    mr: "भाग्योदय, तीर्थयात्रा व गुरुंची कृपा",
    te: "భాగ్యోదయం, తీర్థయాత్రలు మరియు గురు అనుగ్రహం",
    ta: "பாக்கிய விருத்தி, புண்ணிய ஸ்தல யாத்திரை மற்றும் குரு அருள்",
    en: "Fortune fruition, higher wisdom, pilgrimages, and spiritual mentor blessings"
  },
  10: {
    kn: "ವೃತ್ತಿ ಗೌರವ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೀರ್ತಿ ಪ್ರತಿಷ್ಠೆ",
    hi: "कार्यक्षेत्र में सम्मान, पदोन्नति एवं सामाजिक प्रतिष्ठा",
    mr: "कामाच्या ठिकाणी मान, पदोन्नती व सामाजिक प्रतिष्ठा",
    te: "వృత్తి గౌరవం, పదోన్నతి మరియు సామాజిక కీర్తి",
    ta: "தொழில் வெற்றி, பதவி உயர்வு மற்றும் சமூக அந்தஸ்து",
    en: "Professional prestige, authority, promotions, and career recognition"
  },
  11: {
    kn: "ಆರ್ಥಿಕ ಆದಾಯದ ಹರಿವು, ಮಿತ್ರರ ನೆರವು ಹಾಗೂ ಆಕಾಂಕ್ಷೆಗಳ ಸಿದ್ಧಿ",
    hi: "नियमित धन लाभ, मित्रों का सहयोग एवं महत्वाकांक्षाओं की पूर्ति",
    mr: "नियमित धनलाभ, मित्रांचे सहकार्य व इच्छापूर्ती",
    te: "లాభాలు, స్నేహితుల సహకారం మరియు ఆశయాల సాధన",
    ta: "வருமான பெருக்கம், நண்பர்கள் ஆதரவு மற்றும் இலக்குகள் நிறைவேறுதல்",
    en: "Liquid cash flow, network gains, and aspiration fulfillment"
  },
  12: {
    kn: "ಅನಗತ್ಯ ಖರ್ಚು ನಿಯಂತ್ರಣ, ವಿದೇಶ ವ್ಯವಹಾರ ಹಾಗೂ ಗಾಢ ನಿದ್ರಾಸುಖ",
    hi: "अनावश्यक व्यय नियंत्रण, विदेश यात्रा एवं शांत निद्रा",
    mr: "अनावश्यक खर्च नियंत्रण, परदेश प्रवास व शांत झोप",
    te: "అనవసర ఖర్చుల నియంత్రణ, విదేశీ ప్రయాణం మరియు నిద్ర సుఖం",
    ta: "விரய செலவு கட்டுப்பாடு, வெளிநாட்டு யோகம் மற்றும் நிம்மதியான தூக்கம்",
    en: "Expenditure control, foreign opportunities, and restorative peace"
  }
};

// ============================================================================
// 3. MASTER DATA PREPARATION PIPELINE
// ============================================================================

export async function prepareSampoornaMaster25Data(
  sessionOrData: any,
  langArg?: SixLang,
  options?: { onProgress?: (pct: number, msg: string) => void }
): Promise<SampoornaMaster25Payload> {
  const targetLang: SixLang = langArg || (sessionOrData?.targetLanguage as SixLang) || "kn";
  options?.onProgress?.(10, pick6({
    kn: "೧. ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ಜಾತಕ ಗಣಿತ ಪರಿಶೀಲನೆ...",
    mr: "१. जन्म कुंडली व गणितीय पडताळणी...",
    hi: "१. जन्म कुंडली एवं गणितीय सत्यापन...",
    te: "1. జన్మ కుండలి మరియు గణిత పరిశీలన...",
    ta: "1. ஜாதக கணித சரிபார்ப்பு...",
    en: "1. Verifying natal astronomical mathematics..."
  }, targetLang));

  const result: KundliOutput = sessionOrData?.result || sessionOrData?.kundli;
  const input: KundliInput = sessionOrData?.input || sessionOrData?.devotee || sessionOrData?.form;

  if (!result || !result.planets || result.planets.length === 0) {
    throw new Error("Invalid Kundli data provided for 25-Chapter Sampoorna Master Report.");
  }

  const rawName = input?.name || "Devotee";
  const localizedDevoteeName = resolveDevoteeDisplayName(rawName, targetLang);
  const birthDate = input?.birthDate || "1990-01-01";
  const birthTime = input?.birthTime || "12:00";
  const lat = input?.latitude || 14.5479;
  const lng = input?.longitude || 74.3188;
  const pin = input?.pincode ? String(input.pincode) : "";
  const rawPlace = sessionOrData?.placeLabel || sessionOrData?.homePlaceName || (input as any)?.place;
  const nsDir = lat >= 0
    ? pick6({ kn: "ಉ", mr: "उ", hi: "उ", te: "ఉ", ta: "வ", en: "N" }, targetLang)
    : pick6({ kn: "ದ", mr: "द", hi: "द", te: "ద", ta: "தெ", en: "S" }, targetLang);
  const ewDir = lng >= 0
    ? pick6({ kn: "ಪೂ", mr: "पू", hi: "पू", te: "తూ", ta: "கி", en: "E" }, targetLang)
    : pick6({ kn: "ಪ", mr: "प", hi: "प", te: "ప", ta: "மே", en: "W" }, targetLang);
  const birthPlace = rawPlace
    ? resolvePlaceDisplayName(String(rawPlace), targetLang)
    : input?.latitude
      ? `${toNativeDigits(Math.abs(lat).toFixed(2), targetLang)}°${nsDir}, ${toNativeDigits(Math.abs(lng).toFixed(2), targetLang)}°${ewDir}`
      : pick6({
        kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
        mr: "श्री क्षेत्र गोकर्ण",
        hi: "श्री क्षेत्र गोकर्ण",
        te: "శ్రీ క్షేత్ర గోకర్ణ",
        ta: "ஸ்ரீ கோகர்ண க்ஷேத்திரம்",
        en: "Sri Kshetra Gokarna"
      }, targetLang);

  const cleanRegionalLabel = (val: string): string => cleanRegionalPreserveBullets(val, targetLang);
  const gender: "male" | "female" = (input?.gender?.toLowerCase() === "female") ? "female" : "male";
  const maritalStatus = input?.maritalStatus || "unmarried";
  const childrenStatus = input?.childrenStatus || "no_children";

  // Calculate exact astronomical decimal age at birthplace
  const birthDt = new Date(`${birthDate}T${birthTime.length === 5 ? birthTime + ":00" : birthTime}`);
  const now = new Date();
  const computedAge = ageDecimalYearsAt(birthDate, birthTime, lat, lng, now);
  const ageDecimal = Number.isFinite(computedAge) && computedAge > 0
    ? Math.max(0.1, computedAge)
    : (isNaN(birthDt.getTime()) ? 30 : Math.max(0.1, (now.getTime() - birthDt.getTime()) / (365.25 * 24 * 3600 * 1000)));
  const ageCategory = getAgeCategory25(ageDecimal);

  options?.onProgress?.(25, pick6({
    kn: "೨. ದಕ್ಷಿಣ ಭಾರತದ ರಹಸ್ಯ ಗಣಿತ (ಯೋಗಿ, ಅವಯೋಗಿ, ಬೃಗು ಬಿಂದು, ಮಾಂದಿ)...",
    mr: "२. गुप्त अचूक गणित (योगी, अवयोगी, भृगु बिंदू, मांदी)...",
    hi: "२. दक्षिण भारतीय रहस्य गणित (योगी, अवयोगी, भृगु बिंदु, मांदी)...",
    te: "2. రహస్య జ్యోతిష గణితం (యోగి, అవయోగి, భృగు బిందువు, మాంది)...",
    ta: "2. ரகசிய கணிதம் (யோகி, அவயோகி, பிருகு பிந்து, மாந்தி)...",
    en: "2. Computing South Indian Secret Points (Yogi, Avayogi, Bhrigu Bindu, Maandi)..."
  }, targetLang));

  // Extract celestial coordinates
  const sunP = result.planets.find(p => p.name === PlanetName.Sun) || result.planets[0];
  const moonP = result.planets.find(p => p.name === PlanetName.Moon) || result.planets[1];
  const rahuP = result.planets.find(p => p.name === PlanetName.Rahu) || result.planets[7];
  const jupP = result.planets.find(p => p.name === PlanetName.Jupiter) || result.planets[4];
  const satP = result.planets.find(p => p.name === PlanetName.Saturn) || result.planets[6];
  const marsP = result.planets.find(p => p.name === PlanetName.Mars) || result.planets[2];
  const mercP = result.planets.find(p => p.name === PlanetName.Mercury) || result.planets[3];
  const venP = result.planets.find(p => p.name === PlanetName.Venus) || result.planets[5];

  const lagnaRashiIdx = (((result.lagnaRashi?.index ?? 0) % 12) + 12) % 12 as RashiIndex;
  const moonRashiIdx = (((result.moonSign?.index ?? 0) % 12) + 12) % 12 as RashiIndex;

  const sunLon = (sunP.rashi.index * 30) + (((sunP.degree || 0) % 30 + 30) % 30);
  const moonLon = (moonP.rashi.index * 30) + (((moonP.degree || 0) % 30 + 30) % 30);
  const rahuLon = (rahuP.rashi.index * 30) + (((rahuP.degree || 0) % 30 + 30) % 30);

  // Compute Maandi
  const maandiCalc = computeMaandi(birthDt, lat, lng, pin);
  const maandiRashiIdx = (((maandiCalc.rashi.index % 12) + 12) % 12) as RashiIndex;
  const maandiHouse = (((maandiRashiIdx - lagnaRashiIdx + 12) % 12) + 1);
  const maandiRashiName = RASHI_6L[maandiRashiIdx]?.[targetLang] || RASHI_6L[0].en;

  // Secret Accuracy Profile (Yogi, Avayogi, Bhrigu Bindu, Pushkara Navamsha)
  const precisionPlanets: PlanetPosition[] = result.planets.map((p) => {
    const rIdx = (p.rashi.index % 12) as RashiIndex;
    const degInSign = (p.degree || 0) % 30;
    const absLon = rIdx * 30 + degInSign;
    return {
      planet: p.name as Planet,
      longitude: absLon,
      rashi: rIdx,
      degreeInSign: degInSign,
      rashiHouse: (((rIdx - lagnaRashiIdx + 12) % 12) + 1),
      isRetrograde: p.isRetrograde
    };
  });
  const planetLookup: Partial<Record<Planet, PlanetPosition>> = {};
  for (const pp of precisionPlanets) {
    planetLookup[pp.planet] = pp;
  }
  const secretProfile = calculateSecretAccuracyProfile(sunLon, moonLon, rahuLon, precisionPlanets);

  // Functional nature & Neecha Bhanga checks
  const lagnaPlanetNature: Record<string, FunctionalNature> = {
    Sun: getFunctionalNature(lagnaRashiIdx, "Sun"),
    Moon: getFunctionalNature(lagnaRashiIdx, "Moon"),
    Mars: getFunctionalNature(lagnaRashiIdx, "Mars"),
    Mercury: getFunctionalNature(lagnaRashiIdx, "Mercury"),
    Jupiter: getFunctionalNature(lagnaRashiIdx, "Jupiter"),
    Venus: getFunctionalNature(lagnaRashiIdx, "Venus"),
    Saturn: getFunctionalNature(lagnaRashiIdx, "Saturn"),
  };

  const neechaBhangaFindings = precisionPlanets
    .map((pp) => ({ planet: pp.planet, check: checkNeechaBhanga(pp, planetLookup, lagnaRashiIdx, moonRashiIdx) }))
    .filter((item) => item.check.isDebilitated);

  // Live Prashna Hora (True Sunrise-Anchored Chaldean Order: Sun=0, Ven=1, Mer=2, Moon=3, Sat=4, Jup=5, Mars=6)
  // Weekday map Sun(0)->0, Mon(1)->3, Tue(2)->6(Mars), Wed(3)->2, Thu(4)->5, Fri(5)->1, Sat(6)->4(Saturn)
  const CHALDEAN_HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
  const DAY_RULER_CHALDEAN_IDX = [0, 3, 6, 2, 5, 1, 4];

  // Parashari Rashi Dispositors
  const RASHI_DISPOSITORS_MAP: PlanetName[] = [
    PlanetName.Mars,    // 0: Aries
    PlanetName.Venus,   // 1: Taurus
    PlanetName.Mercury, // 2: Gemini
    PlanetName.Moon,    // 3: Cancer
    PlanetName.Sun,     // 4: Leo
    PlanetName.Mercury, // 5: Virgo
    PlanetName.Venus,   // 6: Libra
    PlanetName.Mars,    // 7: Scorpio
    PlanetName.Jupiter, // 8: Sagittarius
    PlanetName.Saturn,  // 9: Capricorn
    PlanetName.Saturn,  // 10: Aquarius
    PlanetName.Jupiter  // 11: Pisces
  ];
  const lagnaLordGraha = RASHI_DISPOSITORS_MAP[lagnaRashiIdx] || PlanetName.Mars;
  const moonLordGraha = RASHI_DISPOSITORS_MAP[moonRashiIdx] || PlanetName.Venus;
  const lagnaLord = GRAHA_6L[lagnaLordGraha]?.[targetLang] || lagnaLordGraha;
  const moonLord = GRAHA_6L[moonLordGraha]?.[targetLang] || moonLordGraha;

  // 6-Anga Complete Natal Panchanga Elements
  const traditional = calculateTraditionalBaggona(birthDate, birthTime, lat, lng, "lahiri", pin);

  const pakshaName =
    targetLang === "kn"
      ? (traditional?.pakshaKn || "ಶುಕ್ಲ")
      : targetLang === "mr"
        ? (traditional?.paksha5L?.hi || "शुक्ल")
        : (traditional?.paksha5L?.[targetLang] || traditional?.paksha || "Shukla");

  const rawTithiName =
    targetLang === "kn"
      ? (traditional?.tithiKn || traditional?.tithi || "ಪ್ರತಿಪದೆ")
      : targetLang === "mr"
        ? (traditional?.tithi5L?.hi || traditional?.tithi5L?.en || traditional?.tithi || "प्रतिपदा")
        : (traditional?.tithi5L?.[targetLang] || (targetLang === "en" ? traditional?.tithi : traditional?.tithiKn) || "Pratipada");

  const isPurnimaOrAmavasya = /purnima|amavasya|ಹುಣ್ಣಿಮೆ|ಅಮಾವಾಸ್ಯೆ|पूर्णिमा|अमावस्या|పౌర్ణమి|అమావాస్య|பௌர்ணமி|அமாவாசை/i.test(rawTithiName);
  const tithiName = (!isPurnimaOrAmavasya && !rawTithiName.includes(pakshaName))
    ? `${pakshaName} ${rawTithiName}`
    : rawTithiName;

  const moonPlanet = result.planets.find(p => p.name === PlanetName.Moon);
  const moonNakIdx = moonPlanet?.nakshatra?.index ?? (result.moonSign ? Math.floor(((result.moonSign.index * 30) + (moonPlanet?.degree ?? 0)) / 13.333333) % 27 : 0);
  const nakshatraName = NAKSHATRA_6L[moonNakIdx]?.[targetLang] || NAKSHATRA_6L[moonNakIdx]?.en || "Rohini";
  const nakshatraPada = result.moonPada || 1;

  const yogaName =
    targetLang === "kn"
      ? (traditional?.yogaKn || traditional?.yoga || "ಸಿದ್ಧಿ")
      : targetLang === "mr"
        ? (traditional?.yoga5L?.hi || traditional?.yoga || "सिद्धि")
        : (traditional?.yoga5L?.[targetLang] || traditional?.yoga || "Siddha");

  const karanaName =
    targetLang === "kn"
      ? (traditional?.karanaKn || traditional?.karana || "ಬವ")
      : targetLang === "mr"
        ? (traditional?.karana5L?.hi || traditional?.karana || "बव")
        : (traditional?.karana5L?.[targetLang] || traditional?.karana || "Bava");

  const weekdayIdx = typeof traditional?.weekdayIndex === "number" ? traditional.weekdayIndex : (isNaN(birthDt.getDay()) ? 0 : birthDt.getDay());
  const weekdayName = WEEKDAY_6L[weekdayIdx]?.[targetLang] || WEEKDAY_6L[weekdayIdx]?.en || "Sunday";

  // Authentic Sunrise/Sunset Janma Hora (Birth Hora)
  let birthHoraRaw = traditional?.horaLord || "";
  if (!birthHoraRaw) {
    const [bH, bM] = birthTime.split(":").map(Number);
    const hoursFrom6Am = Math.floor((((bH || 12) + (bM || 0) / 60) - 6 + 24) % 24);
    birthHoraRaw = CHALDEAN_HORA_ORDER[(DAY_RULER_CHALDEAN_IDX[weekdayIdx % 7] + hoursFrom6Am) % 7] || "Sun";
  }
  const janmaHora = GRAHA_6L[birthHoraRaw]?.[targetLang] || birthHoraRaw;
  const horaLordName = janmaHora;
  const sunriseTimeRaw = traditional?.sunrise || "06:15";
  const [srH, srM] = sunriseTimeRaw.split(":").map((x) => parseInt(x, 10));
  const sunriseHourDecimal = Number.isFinite(srH) ? srH + (Number.isFinite(srM) ? srM : 0) / 60 : 6.25;
  const nowHourDecimal = now.getHours() + now.getMinutes() / 60;
  const currentWeekday = now.getDay();
  const hoursSinceSunrise = Math.floor((nowHourDecimal - sunriseHourDecimal + 24) % 24);
  const liveHoraPlanetRaw = CHALDEAN_HORA_ORDER[(DAY_RULER_CHALDEAN_IDX[currentWeekday] + hoursSinceSunrise) % 7];
  const livePrashnaHora = GRAHA_6L[liveHoraPlanetRaw]?.[targetLang] || liveHoraPlanetRaw;

  const sunriseTime = toNativeDigits(sunriseTimeRaw, targetLang);
  const sunsetTime = toNativeDigits(traditional?.sunset || "18:20", targetLang);

  const ayanamshaName = pick6({
    kn: "ಲಾಹಿರಿ (ಚಿತ್ರಾಪಕ್ಷ)",
    mr: "लाहिरी (चित्रापक्ष)",
    hi: "लाहिड़ी (चित्रापक्ष)",
    te: "లాహిరి (చిత్రాపక్ష)",
    ta: "லாகிரி (சித்ராபக்ஷம்)",
    en: "Lahiri (Chitrapaksha)"
  }, targetLang);

  // Birth Dasha Balance
  const dashaBalLord = GRAHA_6L[traditional?.dashaLord || "Jupiter"]?.[targetLang] || (traditional?.dashaLord || "Jupiter");
  const dYears = toNativeDigits(traditional?.dashaYears ?? 5, targetLang);
  const dMonths = toNativeDigits(traditional?.dashaMonths ?? 0, targetLang);
  const janmaDashaBalance = pick6({
    kn: `${dashaBalLord} (${dYears} ವ. ${dMonths} ತಿಂ.)`,
    mr: `${dashaBalLord} (${dYears} व. ${dMonths} म.)`,
    hi: `${dashaBalLord} (${dYears} व. ${dMonths} मा.)`,
    te: `${dashaBalLord} (${dYears} సం. ${dMonths} నె.)`,
    ta: `${dashaBalLord} (${dYears} ஆ. ${dMonths} மா.)`,
    en: `${dashaBalLord} (${dYears}Y ${dMonths}M)`
  }, targetLang);

  // Dasha-Bhukti
  const bhuktiInfo = findBhuktiAtAge(result, ageDecimal);
  const rawMaha = String(bhuktiInfo?.maha?.planet || "Jupiter");
  const rawBhukti = String(bhuktiInfo?.bhukti || "Saturn");
  const currentMahadasha = GRAHA_6L[rawMaha]?.[targetLang] || rawMaha;
  const currentBhuktiLord = GRAHA_6L[rawBhukti]?.[targetLang] || rawBhukti;
  const bhuktiEndAge = bhuktiInfo?.bhuktiEndAge || (ageDecimal + 1);
  const yearsUntilBhuktiEnd = Math.max(0.1, bhuktiEndAge - ageDecimal);
  const bhuktiEndDt = new Date(Date.now() + yearsUntilBhuktiEnd * 365.25 * 86400000);
  const bhuktiEndDate = bhuktiEndDt.toISOString().split("T")[0];
  const isDashaSandhi = yearsUntilBhuktiEnd < 0.5;

  // Live Sidereal Gochara Transits + Sarvashtakavarga + Vedha Gate
  const liveTransits = siderealLongitudes(now, "lahiri");
  const shaniTransitRashiIdx = (Math.floor((liveTransits.saturn ?? 330) / 30) % 12) as RashiIndex;
  const guruTransitRashiIdx = (Math.floor((liveTransits.jupiter ?? 60) / 30) % 12) as RashiIndex;
  const rahuTransitRashiIdx = (Math.floor((liveTransits.rahu ?? 330) / 30) % 12) as RashiIndex;
  const sunTransitRashiIdx = (Math.floor((liveTransits.sun ?? 0) / 30) % 12) as RashiIndex;
  const marsTransitRashiIdx = (Math.floor((liveTransits.mars ?? 0) / 30) % 12) as RashiIndex;
  const mercTransitRashiIdx = (Math.floor((liveTransits.mercury ?? 0) / 30) % 12) as RashiIndex;
  const venTransitRashiIdx = (Math.floor((liveTransits.venus ?? 0) / 30) % 12) as RashiIndex;
  const moonTransitRashiIdx = (Math.floor((liveTransits.moon ?? 0) / 30) % 12) as RashiIndex;

  const houseFromMoon = (trIdx: number) => (((trIdx - moonRashiIdx + 12) % 12) + 1);
  const shaniHouseFromMoon = houseFromMoon(shaniTransitRashiIdx);
  const guruHouseFromMoon = houseFromMoon(guruTransitRashiIdx);
  const rahuHouseFromMoon = houseFromMoon(rahuTransitRashiIdx);

  const transitHousesFromMoon: Record<string, number> = {
    Sun: houseFromMoon(sunTransitRashiIdx),
    Moon: houseFromMoon(moonTransitRashiIdx),
    Mars: houseFromMoon(marsTransitRashiIdx),
    Mercury: houseFromMoon(mercTransitRashiIdx),
    Jupiter: guruHouseFromMoon,
    Venus: houseFromMoon(venTransitRashiIdx),
    Saturn: shaniHouseFromMoon
  };

  const shaniVedha = hasGocharaVedha("Saturn", shaniHouseFromMoon, transitHousesFromMoon);
  const guruVedha = hasGocharaVedha("Jupiter", guruHouseFromMoon, transitHousesFromMoon);
  const savTable = computeSarvashtakavarga(result);
  const shaniTransitSav = savTable[shaniTransitRashiIdx] ?? 28;
  const guruTransitSav = savTable[guruTransitRashiIdx] ?? 28;
  const shaniTransitRashi = RASHI_6L[shaniTransitRashiIdx]?.[targetLang] || "Pisces";
  const guruTransitRashi = RASHI_6L[guruTransitRashiIdx]?.[targetLang] || "Gemini";

  // Authentic Panchabhuta Elemental Matrix from Birth Chart
  const elemWeights = { fire: 0, earth: 0, air: 0, water: 0 };
  const addElemWeight = (rIdx: number, w: number) => {
    const mod = ((rIdx % 4) + 4) % 4;
    if (mod === 0) elemWeights.fire += w;
    else if (mod === 1) elemWeights.earth += w;
    else if (mod === 2) elemWeights.air += w;
    else elemWeights.water += w;
  };
  addElemWeight(lagnaRashiIdx, 3);
  addElemWeight(moonRashiIdx, 3);
  addElemWeight(sunP.rashi.index, 2);
  for (const pl of [marsP, mercP, jupP, venP, satP, rahuP]) {
    if (pl) addElemWeight(pl.rashi.index, 1);
  }
  const sortedElems = (Object.entries(elemWeights) as Array<["fire" | "earth" | "air" | "water", number]>)
    .sort((a, b) => b[1] - a[1]);
  const primaryElem = sortedElems[0][0];
  const secondaryElem = sortedElems[1][0];
  const ELEM_NAMES_6L: Record<"fire" | "earth" | "air" | "water", Record<SixLang, string>> = {
    fire: { kn: "ಅಗ್ನಿ ತತ್ವ", mr: "अग्नी तत्त्व", hi: "अग्नि तत्त्व", te: "అగ్ని తత్వం", ta: "அக்னி தத்துவம்", en: "Fire (Agni)" },
    earth: { kn: "ಪೃಥ್ವಿ (ಭೂ) ತತ್ವ", mr: "पृथ्वी तत्त्व", hi: "पृथ्वी तत्त्व", te: "పృథ్వి తత్వం", ta: "பூமி (பிருத்வி) தத்துவம்", en: "Earth (Prithvi)" },
    air: { kn: "ವಾಯು ತತ್ವ", mr: "वायू तत्त्व", hi: "वायु तत्त्व", te: "వాయు తత్వం", ta: "வாயு தத்துவம்", en: "Air (Vayu)" },
    water: { kn: "ಜಲ ತತ್ವ", mr: "जल तत्त्व", hi: "जल तत्त्व", te: "జల తత్వం", ta: "நீர் (ஜல) தத்துவம்", en: "Water (Jala)" }
  };
  const dominantElement = `${ELEM_NAMES_6L[primaryElem][targetLang]} + ${ELEM_NAMES_6L[secondaryElem][targetLang]}`;

  // Authentic Natal Yogas + House Lords + Comprehensive Doshas
  const detectedYogaIds: YogaId[] = detectChartYogas(result);
  const YOGA_LABELS_6L: Record<YogaId, Record<SixLang, string>> = {
    gajakesari: { kn: "ಗಜಕೇಸರಿ ಯೋಗ", mr: "गजकेसरी योग", hi: "गजकेसरी योग", te: "గజకేసరి యోగం", ta: "கஜகேசரி யோகம்", en: "Gajakesari Yoga" },
    budhaditya: { kn: "ಬುಧಾದಿತ್ಯ ಯೋಗ", mr: "बुधादित्य योग", hi: "बुधादित्य योग", te: "బుధాదిత్య యోగం", ta: "புதாதித்ய யோகம்", en: "Budhaditya Yoga" },
    ruchaka: { kn: "ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ", mr: "रुचक महापुरुष योग", hi: "रुचक महापुरुष योग", te: "రుచక మహాపురుష యోగం", ta: "ருசக மகாபுருஷ யோகம்", en: "Ruchaka Mahapurusha Yoga" },
    bhadra: { kn: "ಭದ್ರ ಮಹಾಪುರುಷ ಯೋಗ", mr: "भद्र महापुरुष योग", hi: "भद्र महापुरुष योग", te: "భద్ర మహాపురుష యోగం", ta: "பத்ர மகாபுருஷ யோகம்", en: "Bhadra Mahapurusha Yoga" },
    hamsa: { kn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ", mr: "हंस महापुरुष योग", hi: "हंस महापुरुष योग", te: "హంస మహాపురుష యోగం", ta: "ஹம்ச மகாபுருஷ யோகம்", en: "Hamsa Mahapurusha Yoga" },
    malavya: { kn: "ಮಾಳವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ", mr: "मालव्य महापुरुष योग", hi: "मालव्य महापुरुष योग", te: "మాలవ్య మహాపురుష యోగం", ta: "மாளவ்ய மகாபுருஷ யோகம்", en: "Malavya Mahapurusha Yoga" },
    sasha: { kn: "ಶಶ ಮಹಾಪುರುಷ ಯೋಗ", mr: "शश महापुरुष योग", hi: "शश महापुरुष योग", te: "శశ మహాపురుష యోగం", ta: "சச மகாபுருஷ யோகம்", en: "Sasha Mahapurusha Yoga" },
    chandra_mangala: { kn: "ಚಂದ್ರ-ಮಂಗಳ ಯೋಗ", mr: "चंद्र-मंगळ योग", hi: "चन्द्र-मंगल योग", te: "చంద్ర-మంగళ యోగం", ta: "சந்திர-மங்கள யோகம்", en: "Chandra-Mangala Yoga" },
    kemadruma: { kn: "ಕೇಮದ್ರುಮ ಯೋಗ (ಭಂಗ ಪರಿಶೀಲನೆ)", mr: "केमद्रुम योग", hi: "केमद्रुम योग", te: "కేమద్రుమ యోగం", ta: "கேமத்ரும யோகம்", en: "Kemadruma Yoga" }
  };
  const beneficYogasLocalized = detectedYogaIds
    .filter((id) => id !== "kemadruma")
    .map((id) => YOGA_LABELS_6L[id][targetLang]);
  const detectedYogasSummary = cleanRegionalLabel(
    beneficYogasLocalized.length > 0
      ? beneficYogasLocalized.join(", ")
      : pick6({
        kn: "ಧನ-ಕರ್ಮ ಸ್ಥಾನಾಧಿಪತಿಗಳ ಶುಭ ಸಂಯೋಗ",
        mr: "धन-कर्मेश शुभ संयोग",
        hi: "धन-कर्मेश शुभ संयोग",
        te: "ధన-కర్మాధిపతుల శుభ కలయిక",
        ta: "தன-கர்மாதிபதி சுப சேர்க்கை",
        en: "Natal Benefic Dispositor Harmony"
      }, targetLang)
  );

  const getHouseLordPlacement = (houseNum: number) => {
    const rIdx = ((lagnaRashiIdx + houseNum - 1) % 12) as RashiIndex;
    const lordGraha = signLord(rIdx);
    const lordPlanet = result.planets.find((p) => p.name === lordGraha);
    const placedHouse = lordPlanet ? (((lordPlanet.rashi.index - lagnaRashiIdx + 12) % 12) + 1) : houseNum;
    const placedRashi = lordPlanet ? (RASHI_6L[lordPlanet.rashi.index]?.[targetLang] || RASHI_6L[0].en) : (RASHI_6L[rIdx]?.[targetLang] || "");
    const lordName = GRAHA_6L[lordGraha]?.[targetLang] || lordGraha;
    return { lordGraha, lordName, placedHouse, placedRashi };
  };

  let activeDoshaNames: string[] = [];
  try {
    const doshaReport = calculateComprehensiveDoshas(result, {
      name: rawName,
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: gender === "female" ? "Female" : "Male",
      maritalStatus,
      childrenStatus
    }, now);
    activeDoshaNames = (doshaReport?.doshas || [])
      .filter((d) => d.isDetected)
      .slice(0, 4)
      .map((d) => {
        const rawLabel = targetLang === "mr" ? (d.name.hi || d.name.en) : (d.name[targetLang] || d.name.en);
        return cleanRegionalLabel(rawLabel);
      })
      .filter(Boolean);
  } catch {
    activeDoshaNames = [];
  }
  const detectedDoshasSummary = cleanRegionalLabel(
    activeDoshaNames.length > 0
      ? activeDoshaNames.join(", ")
      : pick6({
        kn: `ಸೂಕ್ಷ್ಮ ${toNativeDigits(maandiHouse, targetLang)}ನೇ ಭಾವದ ಮಾಂದಿ ಗಂಟು`,
        mr: `${toNativeDigits(maandiHouse, targetLang)}व्या स्थानातील मांदी गाठ`,
        hi: `${toNativeDigits(maandiHouse, targetLang)}वें भाव की मांदी ग्रंथि`,
        te: `${toNativeDigits(maandiHouse, targetLang)}వ స్థాన మాంది గ్రంథి`,
        ta: `${toNativeDigits(maandiHouse, targetLang)}-ஆம் இட மாந்தி முடிச்சு`,
        en: `Subtle Maandi Knot in House ${maandiHouse}`
      }, targetLang)
  );

  // South Indian Accuracy Variables
  const rawYogi = secretProfile.yogiPlanet || "Jupiter";
  const rawAvayogi = secretProfile.avayogiPlanet || "Rahu";
  const yogiPlanetName = GRAHA_6L[rawYogi]?.[targetLang] || rawYogi;
  const avayogiPlanetName = GRAHA_6L[rawAvayogi]?.[targetLang] || rawAvayogi;
  const yogiAttrs6L = getYogiAttributes6L(rawYogi, targetLang);
  const localizedYogiColor = yogiAttrs6L.color;
  const localizedYogiDirection = yogiAttrs6L.direction;
  const localizedYogiDay = yogiAttrs6L.wealthDay;

  // Parashari Vajra-Hawala Gemstone Harmony Guard
  const isHawalaProhibited = rawYogi === "Mars" && [1, 2, 5, 6].includes(lagnaRashiIdx);
  const isVajraProhibited = rawYogi === "Venus" && [0, 3, 4, 7].includes(lagnaRashiIdx);
  const isYogiFunctionalMaraka = lagnaPlanetNature[rawYogi] === "MARAKA";
  const isYogiGemProhibited = isHawalaProhibited || isVajraProhibited || isYogiFunctionalMaraka;
  const localizedYogiGemstone = isYogiGemProhibited
    ? pick6({
      kn: `ಲಗ್ನ ಮೈತ್ರಿ ಪ್ರಕಾರ ರತ್ನ ಬದಲು '${localizedYogiColor}' ವಸ್ತ್ರ & ಮಂತ್ರ ಜಪ ಶ್ರೇಷ್ಠ`,
      mr: `लग्न नियमानुसार रत्नाऐवजी '${localizedYogiColor}' वस्त्र व मंत्र जप उत्तम`,
      hi: `लग्न मर्यादानुसार रत्न के स्थान पर '${localizedYogiColor}' वस्त्र एवं मंत्र जप श्रेष्ठ`,
      te: `లగ్న నియమం ప్రకారం రత్నానికి బదులుగా '${localizedYogiColor}' వస్త్రం & మంత్ర జపం శ్రేష్ఠం`,
      ta: `லக்ன விதிப்படி ரத்தினத்திற்கு பதிலாக '${localizedYogiColor}' ஆடை & மந்திர ஜபம் உத்தமம்`,
      en: `Per Parashari Lagna harmony, prioritize '${localizedYogiColor}' attire & Japa instead of gem`
    }, targetLang)
    : yogiAttrs6L.gemstone;
  const localizedYogiDeity = yogiAttrs6L.deity;

  const yogiNakIdx = typeof secretProfile.yogiNakshatraIndex === "number" ? secretProfile.yogiNakshatraIndex : 7;
  const avayogiNakIdx = typeof secretProfile.avayogiNakshatraIndex === "number" ? secretProfile.avayogiNakshatraIndex : 5;
  const yogiNakshatra = NAKSHATRA_6L[yogiNakIdx]?.[targetLang] || NAKSHATRA_6L[yogiNakIdx]?.en || "Pushya";
  const avayogiNakshatra = NAKSHATRA_6L[avayogiNakIdx]?.[targetLang] || NAKSHATRA_6L[avayogiNakIdx]?.en || "Ardra";

  const bhriguBinduRashiName = RASHI_6L[secretProfile.bhriguBinduRashi]?.[targetLang] || "Taurus";
  const bhriguDeg = (secretProfile.bhriguBinduDegree || 15).toFixed(1);

  const extendedPrecision = computeExtendedPrecisionMetrics({
    result,
    targetLang,
    lagnaRashiIdx,
    moonRashiIdx,
    moonNakIdx,
    sunLon,
    rawMaha,
    rawBhukti,
    lagnaPlanetNature,
    precisionPlanets,
    savTable,
    getHouseLordPlacement,
    now
  });

  const lagnaNameLocalized = RASHI_6L[lagnaRashiIdx]?.[targetLang] || "Aries";
  const moonRashiLocalized = RASHI_6L[moonRashiIdx]?.[targetLang] || "Taurus";

  const rawCoverPage = buildBookletCoverContent({
    devoteeName: localizedDevoteeName,
    birthDate,
    birthTime,
    birthPlace,
    lagnaName: lagnaNameLocalized,
    moonRashi: moonRashiLocalized,
    nakshatraName,
    nakshatraPada,
    targetLang
  });
  const coverPage: BookletCoverContent =
    targetLang === "en"
      ? rawCoverPage
      : {
        brandBannerTitle: cleanRegionalLabel(rawCoverPage.brandBannerTitle),
        kshetraSubtitle: cleanRegionalLabel(rawCoverPage.kshetraSubtitle),
        exclusiveForTag: cleanRegionalLabel(rawCoverPage.exclusiveForTag),
        bookletEditionLine: cleanRegionalLabel(rawCoverPage.bookletEditionLine),
        personalAssurancePara1: cleanRegionalLabel(rawCoverPage.personalAssurancePara1),
        personalAssurancePara2: cleanRegionalLabel(rawCoverPage.personalAssurancePara2),
        sealHeading: cleanRegionalLabel(rawCoverPage.sealHeading),
        confidentialFooterNote: cleanRegionalLabel(rawCoverPage.confidentialFooterNote)
      };

  options?.onProgress?.(50, pick6({
    kn: "೩. ೨೫ ಆಳವಾದ ಅಧ್ಯಾಯಗಳ ಸಂಯೋಜನೆ (ಪ್ರಶ್ನೋತ್ತರ ಶೈಲಿ, ಶೂನ್ಯ ಕೋಷ್ಟಕ)...",
    mr: "३. २५ सखोल अध्यायांची निर्मिती (प्रश्नोत्तर शैली, शून्य तक्ता)...",
    hi: "३. २५ गहन अध्यायों की संरचना (प्रश्नोत्तरी शैली, शून्य तालिका)...",
    te: "3. 25 లోతైన అధ్యాయాల నిర్మాణం (ప్రశ్నోత్తర శైలి)...",
    ta: "3. 25 விரிவான அத்தியாயங்கள் உருவாக்கம்...",
    en: "3. Synthesizing 25 Deep Chapters (Q&A Style, Zero Tables)..."
  }, targetLang));

  // Build the 25 Chapters
  const chapters: Master25Chapter[] = buildAll25Chapters({
    devoteeName: localizedDevoteeName,
    rawName,
    ageYears: ageDecimal,
    ageCategory,
    gender,
    maritalStatus,
    childrenStatus,
    targetLang,
    lagnaRashiIdx,
    lagnaRashiName: lagnaNameLocalized,
    moonRashiIdx,
    moonRashiName: moonRashiLocalized,
    nakshatraName,
    nakshatraPada,
    currentHoraPlanet: livePrashnaHora,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    isDashaSandhi,
    yogiPlanetName,
    yogiAttrs: yogiAttrs6L,
    localizedYogiColor,
    localizedYogiDirection,
    localizedYogiDay,
    localizedYogiGemstone,
    localizedYogiDeity,
    avayogiPlanetName,
    bhriguBinduRashiName,
    bhriguDeg,
    maandiHouse,
    maandiRashiName,
    maandiDomainAffected: MAANDI_DOMAIN_MAP[maandiHouse]?.[targetLang] || MAANDI_DOMAIN_MAP[1][targetLang],
    lagnaPlanetNature,
    nowYear: now.getFullYear(),
    shaniTransitRashi,
    shaniHouseFromMoon,
    shaniTransitSav,
    shaniVedhaPlanet: shaniVedha.obstructedBy ? (GRAHA_6L[shaniVedha.obstructedBy]?.[targetLang] || shaniVedha.obstructedBy) : undefined,
    guruTransitRashi,
    guruHouseFromMoon,
    guruTransitSav,
    guruVedhaPlanet: guruVedha.obstructedBy ? (GRAHA_6L[guruVedha.obstructedBy]?.[targetLang] || guruVedha.obstructedBy) : undefined,
    rahuHouseFromMoon,
    primaryElem,
    secondaryElem,
    dominantElement,
    detectedYogasSummary,
    pushkaraPlanetsLocalized: secretProfile.pushkaraBlessedPlanets.map((p) => GRAHA_6L[p.planet]?.[targetLang] || p.planet),
    neechaBhangaLocalized: neechaBhangaFindings.map((n) => ({
      planet: GRAHA_6L[n.planet]?.[targetLang] || n.planet,
      cancelled: n.check.hasNeechaBhanga
    })),
    house10Info: getHouseLordPlacement(10),
    house2Info: getHouseLordPlacement(2),
    house11Info: getHouseLordPlacement(11),
    house7Info: getHouseLordPlacement(7),
    house5Info: getHouseLordPlacement(5),
    house6Info: getHouseLordPlacement(6),
    detectedDoshasSummary,
    activeDoshaNames,
    isYogiGemProhibited,
    extendedPrecision
  });

  options?.onProgress?.(90, pick6({
    kn: "೪. ಮುಖ್ಯ ಅರ್ಚಕ ಚೈತನ್ಯ ಪಂಡಿತರ ದೈವಿಕ ಆಶೀರ್ವಾದ & ರಕ್ಷಾ ಕವಚ ಜೋಡಣೆ...",
    mr: "४. मुख्य पुरोहित चैतन्य पंडित यांचे दैवी आशीर्वाद...",
    hi: "४. मुख्य अर्चक चैतन्य पंडित का दिव्य आशीर्वाद एवं रक्षा कवच...",
    te: "4. ముఖ్య అర్చకులు చైతన్య పండిట్ ఆశీర్వాదం...",
    ta: "4. தலைமை அர்ச்சகர் சைதன்ய பண்டிதர் ஆசீர்வாதம்...",
    en: "4. Binding Chief Priest Chaitanya Pandit Blessings & Final Seal..."
  }, targetLang));

  // Priest Contact Pinned to Chaitanya Pandit (+91 94821 09844)
  const priestBooking = {
    heading: pick6({
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ, ಸಂಕಲ್ಪ ಪೂಜೆ & ಸೇವಾ ಖಚಿತತೆಗಾಗಿ",
      mr: "श्री क्षेत्र गोकर्ण दोष निवारण, संकल्प पूजा व सेवा बुकिंगसाठी",
      hi: "श्री क्षेत्र गोकर्ण दोष निवारण, संकल्प पूजा एवं सेवा आरक्षण हेतु",
      te: "శ్రీ క్షేత్ర గోకర్ణ దోష నివారణ, సంకల్ప పూజ & సేవా బుకింగ్ కొరకు",
      ta: "ஸ்ரீ க்ஷேத்திர கோகர்ண தோஷ பரிகாரம், சங்கல்ப பூஜை & சேவா உறுதிப்படுத்த",
      en: "For Authentic Dosha Parihara, Sankalpa Puja & Sri Kshetra Gokarna Seva Confirmation"
    }, targetLang),
    subheading: pick6({
      kn: "ನೇರವಾಗಿ ಮುಖ್ಯ ಅರ್ಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ ಪೂಜಾ ಸಂಕಲ್ಪವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ:",
      mr: "थेट मुख्य पुरोहितांशी संपर्क साधून पूजा संकल्प निश्चित करा:",
      hi: "सीधे मुख्य अर्चक से संपर्क कर पूजा संकल्प सुनिश्चित करें:",
      te: "ముఖ్య అర్చకులతో నేరుగా సంప్రదించి పూజా సంకల్పం నిర్ధారించుకోండి:",
      ta: "நேரடியாக தலைமை அர்ச்சகருடன் பேசி பூஜை சங்கல்பத்தை உறுதி செய்யவும்:",
      en: "Speak directly with the Chief Priest to confirm your sacred Sankalpa:"
    }, targetLang),
    priestTitle: pick6({
      kn: "ಮುಖ್ಯ ಅರ್ಚಕರು",
      mr: "मुख्य पुरोहित",
      hi: "मुख्य अर्चक",
      te: "ముఖ్య అర్చకులు",
      ta: "தலைமை அர்ச்சகர்",
      en: "Chief Priest"
    }, targetLang),
    priestName: pick6({
      kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
      mr: "वेद मूर्ति चैतन्य पंडित",
      hi: "वेद मूर्ति चैतन्य पंडित",
      te: "వేదమూర్తి చైతన్య పండిత్",
      ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்",
      en: "Veda Moorthy Chaitanya Pandit"
    }, targetLang),
    phone: "+91 94821 09844",
    phoneDisplay: "+91 94821 09844",
    tel: "+919482109844",
    address: pick6({
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ, ಗೋಕರ್ಣ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",
      mr: "श्री गोकर्ण महाबळेश्वर सानिध्य, गोकर्ण, उत्तर कन्नड, कर्नाटक",
      hi: "श्री गोकर्ण महाबलेश्वर सान्निध्य, गोकर्ण, उत्तर कन्नड़, कर्नाटक",
      te: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం, గోకర్ణ, ఉత్తర కన్నడ, కర్ణాటక",
      ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதி, கோகர்ண, உத்தர கன்னடம், கர்நாடகா",
      en: "Sri Gokarna Mahabaleshwara Sannidhana, Gokarna, Karnataka, India"
    }, targetLang)
  };

  const familyProtectionHook = pick6({
    kn: "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಗ್ರಹಗಳು ಪರಸ್ಪರ ರಕ್ಷಣೆ ಮತ್ತು ಪ್ರಭಾವವನ್ನು ಬೀರುತ್ತವೆ. ನಿಮ್ಮ ಪತಿ/ಪತ್ನಿ, ಮಕ್ಕಳು ಹಾಗೂ ತಂದೆ-ತಾಯಿಯ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಂಪೂರ್ಣ ೨೫-ಅಧ್ಯಾಯಗಳ ಮಹಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸುವುದರಿಂದ ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸಕಾಲಿಕ ದೈವಿಕ ರಕ್ಷಣೆ ಖಚಿತವಾಗುತ್ತದೆ.",
    mr: "कुटुंबातील प्रत्येक सदस्याचे ग्रह एकमेकांवर रक्षण व प्रभाव पाडतात. आपल्या जोडीदार, मुले व पालकांच्या पत्रिकेचा हा २५-अध्यायांचा महाअहवाल तपासल्याने कुटुंबात सुख, शांतता व अखंड संरक्षण लाभते.",
    hi: "परिवार के प्रत्येक सदस्य के ग्रह एक-दूसरे की रक्षा एवं भाग्य को प्रभावित करते हैं। अपने जीवनसाथी, संतानों एवं माता-पिता की कुंडली का संपूर्ण २५-अध्यायीय महा प्रतिवेदन प्राप्त करने से पारिवारिक सौहार्द एवं समयोचित सुरक्षा सुनिश्चित होती है।",
    te: "కుటుంబంలోని ప్రతి ఒక్కరి గ్రహాలు ఒకరికొకరు రక్షణ మరియు ప్రభావాన్ని కలిగి ఉంటాయి. మీ భాగస్వామి, పిల్లలు మరియు తల్లిదండ్రుల 25-అధ్యాయాల సమగ్ర నివేదికను పరిశీలించడం వల్ల కుటుంబ సామరస్యం మరియు దైవిక రక్షణ లభిస్తుంది.",
    ta: "குடும்பத்தில் உள்ள ஒவ்வொருவரின் கிரகங்களும் ஒருவருக்கொருவர் பாதுகாப்பையும் தாக்கத்தையும் ஏற்படுத்துகின்றன. உங்கள் துணை, குழந்தைகள் மற்றும் பெற்றோரின் 25-அத்தியாய ஜாதக அறிக்கையைப் பெறுவது குடும்ப ஒற்றுமையையும் உடனடி பாதுகாப்பையும் உறுதி செய்யும்.",
    en: "Every family member's planets protect and influence one another. Checking the personalized 25-Chapter Destiny Report for your spouse, children, and parents ensures complete family harmony and timely divine protection."
  }, targetLang);

  const footerText = pick6({
    kn: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಕಾಶನ ॥",
    mr: "॥ श्री क्षेत्र गोकर्ण महाबळेश्वर ज्योतिष पीठ • बग्गोण पंचांग प्रकाशन ॥",
    hi: "॥ श्री क्षेत्र गोकर्ण महाबलेश्वर ज्योतिष पीठ • बग्गोण पंचांग प्रकाशन ॥",
    te: "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర జ్యೋతిష్య పీఠం • బగ్గోణ పంచాంగ ప్రచురణ ॥",
    ta: "✦ ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வரர் ஜோதிட பீடம் • பக்கோண பஞ்சாங்க வெளியீடு ✦",
    en: "|| Sri Kshetra Gokarna Mahabaleshwara Jyotishya Peetha • Baggona Panchanga Publication ||"
  }, targetLang);

  options?.onProgress?.(100, pick6({
    kn: "೨೫-ಅಧ್ಯಾಯಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಭವಿಷ್ಯ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ!",
    mr: "२५-अध्यायांचा संपूर्ण महा भविष्य अहवाल तयार आहे!",
    hi: "२५-अध्यायों का संपूर्ण महा फलादेश प्रतिवेदन तैयार है!",
    te: "25-అధ్యాయాల సంపూర్ణ మహా భవిష్య నివేదిక సిద్ధమైంది!",
    ta: "25-அத்தியாயங்கள் கொண்ட முழுமையான ஜாதக அறிக்கை தயார்!",
    en: "25-Chapter Sampoorna Master Report Ready!"
  }, targetLang));


  // ──────────────────────────────────────────────────────────────────────────
  // 15-DAY DAILY DARSHANA GOOGLE CALENDAR QR CODE ENGINE (Veda Moorthy Chaitanya Pandit)
  // ──────────────────────────────────────────────────────────────────────────
  const birthNakIdx = result.moonSign ? (result.planets.find(p => p.name === PlanetName.Moon)?.nakshatra?.index ?? 0) : 0;
  const calUrl = generateCompactGoogleCalendarUrlForQR({
    lang: targetLang,
    panditName: "chaitanya-pandit",
    priestPhone: "9482109844",
    overrideCalendarPhone: true,
    notificationTime: "07:00",
    personName: rawName,
    dob: birthDate,
    tob: birthTime,
    birthNakshatraIndex: birthNakIdx,
    birthRashiIndex: moonRashiIdx,
    daysCount: 15,
    pincode: pin || "581326",
    lat,
    lng
  });

  const calendarQrDataUrl = await QRCode.toDataURL(calUrl, {
    errorCorrectionLevel: "L",
    margin: 1,
    width: 260
  });

  const calendarQrSection: CalendarQrSectionData = {
    title: pick6({
      kn: "ವಿಶೇಷ ಉಚಿತ ಕೊಡುಗೆ: ೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ 'ದೈನಂದಿನ ದರ್ಶನ' ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್",
      mr: "विशेष मोफत भेट: १५ दिवसांचे वैयक्तिक 'दैनिक दर्शन' गुगल कॅलेंडर",
      hi: "विशेष निःशुल्क उपहार: १५-दिवसीय व्यक्तिगत 'दैनिक दर्शन' गूगल कैलेंडर",
      te: "ప్రత్యేక ఉచిత బహుమతి: 15 రోజుల వ్యక్తిగత 'డైలీ దర్శన' గూగుల్ క్యాలెండర్",
      ta: "சிறப்பு இலவச பரிசு: 15 நாட்கள் தனிப்பயனாக்கப்பட்ட 'தினசரி தரிசனம்' கூகுள் காலண்டர்",
      en: "Exclusive Free Bonus: 15-Day Personalized 'Daily Darshana' Google Calendar"
    }, targetLang),
    badge: pick6({
      kn: "೧೫ ದಿನಗಳ ಉಚಿತ ಬೋನಸ್",
      mr: "१५ दिवसांचा मोफत बोनस",
      hi: "१५ दिनों का निःशुल्क बोनस",
      te: "15 రోజుల ఉచిత బోనస్",
      ta: "15 நாட்கள் இலவச போனஸ்",
      en: "15-Day Free Bonus"
    }, targetLang),
    priestTitle: priestBooking.priestTitle,
    priestName: priestBooking.priestName,
    priestPhone: "+91 94821 09844",
    priestPhoneDisplay: "+91 94821 09844",
    qrDataUrl: calendarQrDataUrl,
    googleCalendarUrl: calUrl,
    description: pick6({
      kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ, ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ಲಗ್ನಕ್ಕೆ ನಿಖರವಾಗಿ ಸರಿಹೊಂದುವಂತೆ ೧೫ ದಿನಗಳ ದೈನಂದಿನ ದರ್ಶನವನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಆಕ್ಟಿವೇಟ್ ಮಾಡಿಕೊಳ್ಳಲು ಕೆಳಗಿನ ಅಧಿಕೃತ ಕ್ಯೂಆರ್ ಸಂಕೇತವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
      mr: "आपल्या जन्म नक्षत्र, चंद्र रास व लग्नानुसार १५ दिवसांचे अचूक दैनिक दर्शन आपल्या मोबाईल कॅलेंडरवर जोडण्यासाठी खालील क्यूआर कोड स्कॅन करा.",
      hi: "अपने जन्म नक्षत्र, चंद्र राशि एवं लग्न के अनुसार १५ दिनों का सटीक दैनिक दर्शन अपने मोबाइल कैलेंडर में सक्रिय करने हेतु नीचे दिए गए क्यूआर कोड को स्कैन करें।",
      te: "మీ జన్మ నక్షత్రం, చంద్ర రాశి మరియు లగ్నానికి అనుగుణంగా 15 రోజుల దైనిక దర్శనాన్ని మీ మొబైల్ క్యాలెండర్‌లో యాక్టివేట్ చేసుకోవడానికి క్రింది క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
      ta: "உங்கள் பிறந்த நட்சத்திரம், ராசி மற்றும் லக்னத்திற்கு ஏற்ப 15 நாட்கள் தினசரி தரிசனத்தை உங்கள் போன் காலண்டரில் இணைக்க கீழே உள்ள கியூஆர் குறியீட்டை ஸ்கேன் செய்யவும்.",
      en: "Scan the official QR code below to sync your personalized 15-Day Daily Darshana directly to your phone calendar, calculated mathematically for your exact birth coordinates."
    }, targetLang),
    features: [
      pick6({
        kn: "ದೈನಂದಿನ ತಾರಾಬಲ & ಶುಭ ತಾರೆ ನಿರ್ಣಯ (ಪ್ರತಿ ದಿನವೂ ನಿಮ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ಸಿಗುವ ಶುಭ ಬಲ)",
        mr: "दैनिक ताराबल व शुभ तारा विश्लेषण (दररोजचे नक्षत्र बल)",
        hi: "दैनिक ताराबल एवं शुभ तारा निर्णय (प्रतिदिन का नक्षत्र बल)",
        te: "రోజువారీ తారాబలం & శుభ తార నిర్ణయం (ప్రతిరోజు నक्षత్ర బలం)",
        ta: "தினசரி தாராபலம் & சுப தாரை கணிப்பு (நட்சத்திர பலன்)",
        en: "Daily Tarabala & Auspicious Star alignment for your Janma Nakshatra"
      }, targetLang),
      pick6({
        kn: "ಅಧಿಕೃತ ಶುಭ ಮುಹೂರ್ತ, ಅಮೃತ ಕಾಲ & ಅಭಿಜಿತ್ ಕಾಲದ ಸಮಯಾವಧಿ",
        mr: "शुभ मुहूर्त, अमृत काळ व अभिजित काळ वेळ",
        hi: "शुभ मुहूर्त, अमृत काल एवं अभिजित मुहूर्त का सटीक समय",
        te: "శుభ ముహూర్తం, అమృత కాలం & అభిజిత్ కాలం సమయాలు",
        ta: "சுப முகூர்த்தம், அமிர்த காலம் & அபிஜித் காலம் நேரம்",
        en: "Auspicious Muhurta, Amrita Kala & Abhijit Kala windows"
      }, targetLang),
      pick6({
        kn: "ವರ್ಜ್ಯ ಕಾಲ, ರಾಹು ಕಾಲ, ಗುಳಿಕ ಕಾಲ ಹಾಗೂ ಯಮಗಂಡ ಕಾಲದ ನಿಖರ ಗಂಟೆಗಳು",
        mr: "राहु काळ, गुलिक काळ व यमगंड काळ सावधानता वेळ",
        hi: "राहु काल, गुलिक काल एवं यमगंड काल का अचूक समय",
        te: "రాహు కాలం, గుళిక కాలం మరియు యమగండ కాలం సమయాలు",
        ta: "ராகு காலம், குளிகை காலம் மற்றும் எமகண்ட காலம் நேரம்",
        en: "Precise Rahu Kala, Gulika Kala, and Yamaganda Kala timings"
      }, targetLang),
      pick6({
        kn: "ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ೭:೦೦ ಗಂಟೆಗೆ ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ದೈನಂದಿನ ಜ್ಯೋತಿಷ್ಯ ಸೂಚನೆ",
        mr: "दररोज सकाळी ७:०० वाजता मोबाईलवर दैनिक अलर्ट",
        hi: "प्रतिदिन प्रातः ७:०० बजे आपके फोन पर दैनिक ज्योतिषीय सूचना",
        te: "ప్రతిరోజూ ఉదయం 7:00 గంటలకు ఫోన్‌లో దైనిక జ్యోతిష్య అలర్ట్",
        ta: "தினமும் காலை 7:00 மணிக்கு போனில் சிறப்பு தினசரி அறிவிப்பு",
        en: "Morning 7:00 AM Smart Astrological Reminder Notification directly on phone"
      }, targetLang)
    ],
    scanInstructions: pick6({
      kn: "ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗೂಗಲ್ ಲೆನ್ಸ್ ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ' ಒತ್ತಿ.",
      mr: "कॅमेरा किंवा गुगल लेन्सने स्कॅन करून 'कॅलेंडरमध्ये जोडा' वर टॅप करा.",
      hi: "कैमरा अथवा गूगल लेंस से स्कैन करें और 'कैलेंडर में जोड़ें' पर टैप करें।",
      te: "కెమెరా లేదా గూగుల్ లెన్స్ ద్వారా స్కాన్ చేసి 'క్యాలెండర్‌లో చేర్చండి' నొక్కండి.",
      ta: "கேமரா அல்லது கூகுள் லென்ஸ் மூலம் ஸ்கேன் செய்து 'காலண்டரில் சேர்' தட்டவும்.",
      en: "Scan with your phone camera or Google Lens and tap 'Add to Calendar'."
    }, targetLang),
    upsellNoticeTitle: pick6({
      kn: "೩೦ ದಿನಗಳ ಪೂರ್ಣ ಕ್ಯಾಲೆಂಡರ್ ಅಪ್‌ಗ್ರೇಡ್ ಸೂಚನೆ",
      mr: "३० दिवसांच्या पूर्ण कॅलेंडर अपग्रेड सूचना",
      hi: "३०-दिवसीय संपूर्ण कैलेंडर अपग्रेड सूचना",
      te: "30 రోజుల పూర్తి క్యాలెండర్ అప్‌గ్రేడ్ సమాచారం",
      ta: "30 நாட்கள் முழு காலண்டர் மேம்படுத்தல் அறிவிப்பு",
      en: "Full 30-Day Personal Calendar Desk Upgrade"
    }, targetLang),
    upsellNoticeText: pick6({
      kn: "ಬೋನಸ್: ಈ ವರದಿಯೊಂದಿಗೆ ೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ 'ದೈನಂದಿನ ದರ್ಶನ' ಕ್ಯಾಲೆಂಡರ್ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ. ಸಂಪೂರ್ಣ ೩೦ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಪ್ರತ್ಯೇಕವಾಗಿ ಬೇಕೇ? ಕ್ಯಾಶ್ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ₹೩೦೦ ಪಾವತಿಸಿ ತಕ್ಷಣ ಪಡೆಯಿರಿ.",
      mr: "बोनस: या अहवालासोबत १५ दिवसांचे वैयक्तिक 'दैनिक दर्शन' कॅलेंडर मोफत मिळाले आहे. संपूर्ण ३० दिवसांचे वैयक्तिक कॅलेंडर स्वतंत्रपणे हवे असल्यास कॅश डेस्कवर ₹३०० भरून लगेच मिळवा.",
      hi: "बोनस: इस प्रतिवेदन के साथ १५ दिनों का व्यक्तिगत 'दैनिक दर्शन' कैलेंडर निःशुल्क उपलब्ध है। क्या संपूर्ण ३० दिनों का व्यक्तिगत कैलेंडर अलग से चाहते हैं? कैश डेस्क पर ₹३०० का भुगतान करके इसे तुरंत प्राप्त करें।",
      te: "బోనస్: ఈ నివేదికతో పాటు 15 రోజుల వ్యక్తిగత 'డైలీ దర్శన' క్యాలెండర్ ఉచితంగా అందించబడింది. పూర్తి 30 రోజుల వ్యక్తిగత క్యాలెండర్ ప్రత్యేకంగా కావాలా? క్యాష్ డెస్క్ వద్ద ₹300 చెల్లించి వెంటనే పొందండి.",
      ta: "போனஸ்: இந்த ஜாதக அறிக்கையுடன் 15 நாட்கள் தனிப்பயனாக்கப்பட்ட 'தினசரி தரிசனம்' காலண்டர் இலவசமாக வழங்கப்பட்டுள்ளது. முழு 30 நாட்கள் காலண்டர் தனித்தனியாக வேண்டுமா? கேஷ் கவுண்டரில் ₹300 செலுத்தி உடனடியாகப் பெற்றுக் கொள்ளுங்கள்.",
      en: "Bonus: Enjoy 15 days of personalized Daily Darshana Calendar FREE with this report. Want the full 30-Day Calendar separately? Pay ₹300 at the Cash Desk to get it instantly."
    }, targetLang)
  };

  const sectionIndexTitles = [
    {
      sectionNumber: 1,
      chapterRange: `${toNativeDigits("1–6", targetLang)}`,
      title: pick6({
        kn: "ತಕ್ಷಣದ ದೈವಿಕ ಸ್ಪಂದನೆ & ಆಂತರಿಕ ಸತ್ಯ ದರ್ಶನ",
        mr: "तात्काळ दैवी प्रचिती व गूढ सत्य दर्शन",
        hi: "तात्कालिक दिव्य अनुभूति एवं अंतस का सत्य",
        te: "తక్షణ దైవిక స్పందన & ఆంతరంగిక సత్య దర్శనం",
        ta: "உடனடி ஆச்சரியம் & அந்தரங்க ரகசிய தரிசனம்",
        en: "The Instant Hook — Living Moment & Hidden Truths"
      }, targetLang)
    },
    {
      sectionNumber: 2,
      chapterRange: `${toNativeDigits("7–11", targetLang)}`,
      title: pick6({
        kn: "ಕಾಲಚಕ್ರದ ಮಹಾಬಲ & ಗ್ರಹ ಗೋಚಾರ ವಾಸ್ತವ",
        mr: "कालचक्राचे महाबल व ग्रह गोचर वास्तव",
        hi: "कालचक्र का महाबल एवं ग्रह गोचर यथार्थ",
        te: "కాలచక్ర మహాబలం & గ్రహ గోచార వాస్తవం",
        ta: "காலச்சக்கர மகாபலம் & கிரக கோசார உண்மை",
        en: "Planetary Power Matrix — Active Dasha & Live Transits"
      }, targetLang)
    },
    {
      sectionNumber: 3,
      chapterRange: `${toNativeDigits("12–16", targetLang)}`,
      title: pick6({
        kn: "ಜೀವನದ ೫ ಪ್ರಮುಖ ಸ್ತಂಭಗಳ ಪ್ರಶ್ನೋತ್ತರ ವಿಶ್ಲೇಷಣೆ",
        mr: "आयुष्यातील ५ प्रमुख स्तंभांचे प्रश्नोत्तर विश्लेषण",
        hi: "जीवन के ५ प्रमुख स्तंभों का प्रश्नोत्तरी विश्लेषण",
        te: "జీవితంలోని 5 ముఖ్య స్తంభాల ప్రశ్నోత్తర విశ్లేషణ",
        ta: "வாழ்க்கையின் 5 முக்கிய தூண்கள் கேள்வி-பதில் ஆய்வு",
        en: "Key Life Domains — Age & Status Tailored Insights"
      }, targetLang)
    },
    {
      sectionNumber: 4,
      chapterRange: `${toNativeDigits("17–22", targetLang)}`,
      title: pick6({
        kn: "ಕಾಲಮಾನದ ಮಾರ್ಗಸೂಚಿ — ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ದಿಗಂತ",
        mr: "कालक्रमानुसार मार्गदर्शक — ५ वर्षांची सुवर्ण क्षितिजे",
        hi: "कालक्रम का रणनीतिक पथ — ५-वर्षीय स्वर्णिम क्षितिज",
        te: "కాలక్రమ మార్గదర్శి — 5 సంవత్సరాల భవిష్యత్ ప్రణాళిక",
        ta: "காலக்கோடு வழிகாட்டல் — 5 வருட பொற்காலம்",
        en: "Strategic Roadmap — Near-Term & 5-Year Horizon"
      }, targetLang)
    },
    {
      sectionNumber: 5,
      chapterRange: `${toNativeDigits("23–25", targetLang)}`,
      title: pick6({
        kn: "ದೋಷ ಪರಿಹಾರ ರಹಸ್ಯ & ಮುಖ್ಯ ಅರ್ಚಕರ ಪರಮ ಆಶೀರ್ವಾದ",
        mr: "दोष निवारण रहस्य व मुख्य पुरोहितांचे परम आशीर्वाद",
        hi: "दोष निवारण रहस्य एवं मुख्य अर्चक का परम आशीर्वाद",
        te: "దోష నివారణ రహస్యం & ముఖ్య అర్చకుల దివ్య ఆశీర్వాదం",
        ta: "தோஷ நிவர்த்தி ரகசியம் & தலைமை அர்ச்சகரின் ஆசீர்வாதம்",
        en: "Remedial Precision & Chief Astrologer's Final Verdict"
      }, targetLang)
    }
  ];

  const initialChapterPages: Record<number, number> = {};
  for (let ch = 1; ch <= 24; ch++) {
    initialChapterPages[ch] = ch + 3; // P1 Cover, P2 Index, P3 Details, P4..P27 Ch 1..24
  }
  initialChapterPages[25] = 29; // P28 is 15-day Calendar QR, P29 is Ch 25

  return {
    devoteeName: localizedDevoteeName,
    rawName,
    birthDate,
    birthTime,
    birthPlace,
    gender,
    maritalStatus,
    childrenStatus,
    ageYears: ageDecimal,
    ageCategory,
    targetLanguage: targetLang,
    lagnaName: lagnaNameLocalized,
    lagnaLord,
    moonRashi: moonRashiLocalized,
    moonLord,
    nakshatraName,
    nakshatraPada,
    pakshaName,
    tithiName,
    weekdayName,
    yogaName,
    karanaName,
    sunriseTime,
    sunsetTime,
    horaLord: horaLordName,
    janmaHora,
    livePrashnaHora,
    ayanamsha: ayanamshaName,
    currentMahadasha,
    currentBhukti: currentBhuktiLord,
    bhuktiEndDate,
    janmaDashaBalance,
    isDashaSandhi,
    yogiPlanet: yogiPlanetName,
    yogiNakshatra,
    yogiRashi: RASHI_6L[secretProfile.yogiRashi]?.[targetLang] || "Cancer",
    yogiColor: localizedYogiColor,
    yogiDirection: localizedYogiDirection,
    yogiDay: localizedYogiDay,
    yogiGemstone: localizedYogiGemstone,
    yogiDeity: localizedYogiDeity,
    avayogiPlanet: avayogiPlanetName,
    avayogiNakshatra,
    avayogiRashi: RASHI_6L[secretProfile.avayogiRashi]?.[targetLang] || "Gemini",
    bhriguBinduDegreeFormatted: `${bhriguDeg}°`,
    bhriguBinduRashi: bhriguBinduRashiName,
    bhriguBinduTurningWindow: `${now.getFullYear() + 1} - ${now.getFullYear() + 2}`,
    maandiHouse,
    maandiRashi: maandiRashiName,
    hasMaandiKnot: true,
    maandiDomainAffected: MAANDI_DOMAIN_MAP[maandiHouse]?.[targetLang] || MAANDI_DOMAIN_MAP[1][targetLang],
    shaniTransitRashi,
    shaniHouseFromMoon,
    guruTransitRashi,
    guruHouseFromMoon,
    dominantElement,
    detectedYogasSummary,
    detectedDoshasSummary,
    sectionIndexTitles,
    coverPage,
    precisionProfile: extendedPrecision.precisionProfileSummary,
    initialChapterPages,
    initialCalendarQrPage: 28,
    initialFinalBlessingPage: 30,
    chapters,
    calendarQrSection,
    familyProtectionHook,
    priestBooking,
    footerText
  };
}

// ============================================================================
// 4. 25-CHAPTER NARRATIVE SYNTHESIS ENGINE (ZERO TABLES, HOOK-FIRST)
// ============================================================================

interface HouseLordInfo {
  lordGraha: PlanetName;
  lordName: string;
  placedHouse: number;
  placedRashi: string;
}

interface SynthesisContext {
  devoteeName: string;
  rawName: string;
  ageYears: number;
  ageCategory: AgeCategory25;
  gender: "male" | "female";
  maritalStatus?: string;
  childrenStatus?: string;
  targetLang: SixLang;
  lagnaRashiIdx: RashiIndex;
  lagnaRashiName: string;
  moonRashiIdx: RashiIndex;
  moonRashiName: string;
  nakshatraName: string;
  nakshatraPada: number;
  currentHoraPlanet: string;
  currentMahadasha: string;
  currentBhuktiLord: string;
  bhuktiEndDate: string;
  isDashaSandhi: boolean;
  yogiPlanetName: string;
  yogiAttrs: any;
  localizedYogiColor: string;
  localizedYogiDirection: string;
  localizedYogiDay: string;
  localizedYogiGemstone: string;
  localizedYogiDeity: string;
  avayogiPlanetName: string;
  bhriguBinduRashiName: string;
  bhriguDeg: string;
  maandiHouse: number;
  maandiRashiName: string;
  maandiDomainAffected: string;
  lagnaPlanetNature: Record<string, FunctionalNature>;
  nowYear: number;
  shaniTransitRashi: string;
  shaniHouseFromMoon: number;
  shaniTransitSav: number;
  shaniVedhaPlanet?: string;
  guruTransitRashi: string;
  guruHouseFromMoon: number;
  guruTransitSav: number;
  guruVedhaPlanet?: string;
  rahuHouseFromMoon: number;
  primaryElem: "fire" | "earth" | "air" | "water";
  secondaryElem: "fire" | "earth" | "air" | "water";
  dominantElement: string;
  detectedYogasSummary: string;
  pushkaraPlanetsLocalized: string[];
  neechaBhangaLocalized: Array<{ planet: string; cancelled: boolean }>;
  house10Info: HouseLordInfo;
  house2Info: HouseLordInfo;
  house11Info: HouseLordInfo;
  house7Info: HouseLordInfo;
  house5Info: HouseLordInfo;
  house6Info: HouseLordInfo;
  detectedDoshasSummary: string;
  activeDoshaNames: string[];
  isYogiGemProhibited: boolean;
  extendedPrecision: ExtendedPrecisionMetrics;
}

function buildAll25Chapters(ctx: SynthesisContext): Master25Chapter[] {
  const {
    devoteeName, ageCategory, maritalStatus, targetLang,
    lagnaRashiName, moonRashiName, nakshatraName, nakshatraPada,
    currentHoraPlanet, currentMahadasha, currentBhuktiLord, bhuktiEndDate,
    isDashaSandhi, yogiPlanetName, yogiAttrs,
    localizedYogiColor, localizedYogiDirection, localizedYogiDay, localizedYogiGemstone, localizedYogiDeity,
    avayogiPlanetName, bhriguBinduRashiName, bhriguDeg, maandiHouse, maandiRashiName, nowYear,
    shaniTransitRashi, shaniHouseFromMoon, shaniTransitSav, shaniVedhaPlanet,
    guruTransitRashi, guruHouseFromMoon, guruTransitSav, guruVedhaPlanet,
    rahuHouseFromMoon, primaryElem, dominantElement, detectedYogasSummary,
    pushkaraPlanetsLocalized, neechaBhangaLocalized,
    house10Info, house2Info, house11Info, house7Info, house5Info, house6Info,
    detectedDoshasSummary, isYogiGemProhibited, extendedPrecision
  } = ctx;

  const isMinor = ageCategory === "infant" || ageCategory === "early_child" || ageCategory === "child" || ageCategory === "teen";
  const isChildOrInfant = ageCategory === "infant" || ageCategory === "early_child" || ageCategory === "child";
  const isInfant = ageCategory === "infant";
  const isSenior = ageCategory === "senior";
  const isUnmarriedAdult = !isMinor && String(maritalStatus || "").toLowerCase() === "unmarried";
  const n = (val: number | string) => toNativeDigits(val, targetLang);

  // Dynamic astronomical status helpers for authentic 100% chart-specific narrative
  const isSadeSati = [12, 1, 2].includes(shaniHouseFromMoon);
  const isAshtamaShani = shaniHouseFromMoon === 8;
  const isKantakaShani = [4, 7].includes(shaniHouseFromMoon);
  const isShaniBenefic = [3, 6, 11].includes(shaniHouseFromMoon);
  const hasGuruBala = [2, 5, 7, 9, 11].includes(guruHouseFromMoon);
  const activeNeechaPlanets = neechaBhangaLocalized.filter((x) => x.cancelled).map((x) => x.planet);
  const uncancelledDebilPlanets = neechaBhangaLocalized.filter((x) => !x.cancelled).map((x) => x.planet);

  const shaniPhase6L = isSadeSati
    ? pick6({
      kn: `ಸಾಡೇಸಾತಿ ಶನಿ (ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಮನೆ — ${shaniTransitRashi})`,
      mr: `साडेसाती शनी (चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान — ${shaniTransitRashi})`,
      hi: `साढ़ेसाती शनि (चंद्र से ${n(shaniHouseFromMoon)}वां भाव — ${shaniTransitRashi})`,
      te: `ఏల్నాటి శని (చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం — ${shaniTransitRashi})`,
      ta: `ஏழரை சனி (சந்திரனிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம் — ${shaniTransitRashi})`,
      en: `Sade Sati Saturn (House ${shaniHouseFromMoon} from Moon in ${shaniTransitRashi})`
    }, targetLang)
    : isAshtamaShani
      ? pick6({
        kn: `ಅಷ್ಟಮ ಶನಿ ಸಂಚಾರ (ಚಂದ್ರನಿಂದ ೮ನೇ ಮನೆ — ${shaniTransitRashi})`,
        mr: `अष्टम शनी भ्रमण (चंद्रापासून ८वे स्थान — ${shaniTransitRashi})`,
        hi: `अष्टम शनि गोचर (चंद्र से ८वां भाव — ${shaniTransitRashi})`,
        te: `అష్టమ శని సంచారం (చంద్రుని నుండి 8వ స్థానం — ${shaniTransitRashi})`,
        ta: `அஷ்டம சனி பெயர்ச்சி (சந்திரனிலிருந்து 8-ம் இடம் — ${shaniTransitRashi})`,
        en: `Ashtama Shani (8th House from Moon in ${shaniTransitRashi})`
      }, targetLang)
      : isKantakaShani
        ? pick6({
          kn: `ಕಂಟಕ / ಅರ್ಧಾಷ್ಟಮ ಶನಿ (ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಮನೆ — ${shaniTransitRashi})`,
          mr: `कंटक / अर्धाष्टम शनी (चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान — ${shaniTransitRashi})`,
          hi: `कंटक / अर्धाष्टम शनि (चंद्र से ${n(shaniHouseFromMoon)}वां भाव — ${shaniTransitRashi})`,
          te: `కంటక శని (చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం — ${shaniTransitRashi})`,
          ta: `கண்டக / அர்த்தாஷ்டம சனி (சந்திரனிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம் — ${shaniTransitRashi})`,
          en: `Kantaka Saturn (House ${shaniHouseFromMoon} from Moon in ${shaniTransitRashi})`
        }, targetLang)
        : isShaniBenefic
          ? pick6({
            kn: `ಶುಭ ಉಪಚಯ ಶನಿ ಸಂಚಾರ (ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಮನೆ — ${shaniTransitRashi})`,
            mr: `शुभ उपचय शनी गोचर (चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान — ${shaniTransitRashi})`,
            hi: `शुभ उपचय शनि गोचर (चंद्र से ${n(shaniHouseFromMoon)}वां भाव — ${shaniTransitRashi})`,
            te: `శుభ ఉపచయ శని గోచారం (చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం — ${shaniTransitRashi})`,
            ta: `சுப உபசய சனி பெயர்ச்சி (சந்திரனிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம் — ${shaniTransitRashi})`,
            en: `Auspicious Upachaya Saturn (House ${shaniHouseFromMoon} from Moon in ${shaniTransitRashi})`
          }, targetLang)
          : pick6({
            kn: `ಸಮಸ್ಥಿತಿ ಶನಿ ಸಂಚಾರ (ಚಂದ್ರನಿಂದ ${n(shaniHouseFromMoon)}ನೇ ಮನೆ — ${shaniTransitRashi})`,
            mr: `सम शनी गोचर (चंद्रापासून ${n(shaniHouseFromMoon)}वे स्थान — ${shaniTransitRashi})`,
            hi: `सामान्य शनि गोचर (चंद्र से ${n(shaniHouseFromMoon)}वां भाव — ${shaniTransitRashi})`,
            te: `సాధారణ శని సంచారం (చంద్రుని నుండి ${n(shaniHouseFromMoon)}వ స్థానం — ${shaniTransitRashi})`,
            ta: `நடுநிலை சனி பெயர்ச்சி (சந்திரனிலிருந்து ${n(shaniHouseFromMoon)}-ம் இடம் — ${shaniTransitRashi})`,
            en: `Measured Saturn Transit (House ${shaniHouseFromMoon} from Moon in ${shaniTransitRashi})`
          }, targetLang);

  const elementRemedyAdvice6L =
    primaryElem === "water"
      ? pick6({
        kn: `ಈ ${dominantElement} ಪ್ರಧಾನತೆಯು ನಿಮಗೆ ಅಗಾಧ ಅಂತಃಪ್ರಜ್ಞೆ, ಕರುಣೆ ಹಾಗೂ ಪರಿಸ್ಥಿತಿಗೆ ತಕ್ಕಂತೆ ಹೊಂದಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ನೀಡಿದ್ದರೂ, ಕೆಲವೊಮ್ಮೆ ಇತರರ ನೋವನ್ನು ಮನಸ್ಸಿಗೆ ಹಚ್ಚಿಕೊಂಡು ಆಲಸ್ಯ ಅಥವಾ ಭಾವನಾತ್ಮಕ ಭಾರಕ್ಕೆ ಒಳಗಾಗಬಹುದು. ಮುಂಜಾನೆಯ ಸೂರ್ಯ ದರ್ಶನ ಮತ್ತು 'ಅಗ್ನಿ ತತ್ವ' (ಶಿಸ್ತುಬದ್ಧ ದಿನಚರಿ) ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದರಿಂದ ನಿಮ್ಮ ಶಕ್ತಿ ಜಾಗೃತವಾಗುತ್ತದೆ.`,
        mr: `या ${dominantElement} प्रधानतेमुळे आपल्यात अपार संवेदनशीलता व अंतर्ज्ञान असले, तरी इतरांच्या दुःखाचा मनावर अतिभार येऊ शकतो. पहाटेचे सूर्यदर्शन व शिस्तबद्ध दिनचर्येने 'अग्नी तत्त्व' संतुलित राहील.`,
        hi: `इस ${dominantElement} की प्रधानता से आपमें गहन अंतर्ज्ञान एवं करुणा है, किंतु दूसरों की पीड़ा से मन शीघ्र द्रवित हो जाता है। प्रातः सूर्य दर्शन एवं नियमित प्राणायाम से 'अग्नि तत्त्व' का संतुलन आपकी ऊर्जा को जाग्रत रखेगा।`,
        te: `ఈ ${dominantElement} ప్రాధాన్యం మీకు అద్భుతమైన అంతర్దృష్టిని ఇచ్చినా, ఒక్కోసారి భావోద్వేగ భారం కలగవచ్చు. ఉదయం సూర్య దర్శనం ద్వారా 'అగ్ని తత్వాన్ని' సమతుల్యం చేసుకోండి.`,
        ta: `இந்த ${dominantElement} ஆதிக்கம் உங்களுக்கு ஆழ்ந்த உள்ளுணர்வையும் கருணையையும் தந்தாலும், சில நேரங்களில் உணர்ச்சி வசப்படச் செய்யலாம். அதிகாலை சூரிய தரிசனம் 'அக்னி தத்துவத்தை' சமநிலைப்படுத்தும்.`,
        en: `While this ${dominantElement} constitution grants deep empathy and intuitive intelligence, it can also tempt emotional absorption or inertia. Cultivating solar discipline ('Agni Tattva' — early sunlight, crisp routines, and decisive boundaries) energizes your execution.`
      }, targetLang)
      : primaryElem === "earth"
        ? pick6({
          kn: `ಈ ${dominantElement} ಪ್ರಧಾನತೆಯು ನಿಮಗೆ ಸ್ಥಿರತೆ, ವಿಶ್ವಾಸಾರ್ಹತೆ ಹಾಗೂ ಪ್ರಾಯೋಗಿಕ ಕೌಶಲ್ಯವನ್ನು ನೀಡಿದರೂ, ಕೆಲವೊಮ್ಮೆ ಬದಲಾವಣೆಗೆ ಒಗ್ಗಿಕೊಳ್ಳಲು ವಿಳಂಬ ಅಥವಾ ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಯ ಹೊರೆ ಉಂಟಾಗಬಹುದು. ಮುಕ್ತ ಗಾಳಿಯಲ್ಲಿ ನಡಿಗೆ ಹಾಗೂ 'ವಾಯು-ಜಲ ತತ್ವ'ಗಳನ್ನು ಪೋಷಿಸುವುದರಿಂದ ಮನಸ್ಸು ಹಗುರ ಹಾಗೂ ಚುರುಕಾಗುತ್ತದೆ.`,
          mr: `या ${dominantElement} प्रधानतेमुळे आपल्यामध्ये स्थिरता व व्यावहारिक शहाणपण असले, तरी बदल स्वीकारण्यात कधीकधी जडत्व येते. मोकळ्या हवेत चालणे व 'वायू-जल तत्त्व' वाढवण्याने मन प्रफुल्लित राहील.`,
          hi: `इस ${dominantElement} की प्रधानता से आपको अद्भुत धैर्य एवं व्यावहारिक कुशलता मिली है, तथापि कभी-कभी परिवर्तन के प्रति संकोच होता है। प्रातः खुले वातावरण में भ्रमण एवं 'वायु-जल तत्त्व' के संवर्धन से मन प्रफुल्लित रहेगा।`,
          te: `ఈ ${dominantElement} ప్రాధాన్యం మీకు స్థిరత్వాన్ని ఇస్తుంది కానీ ఒక్కోసారి మార్పులకు వెనుకాడతారు. నడక మరియు ప్రాణాయామం ద్వారా 'వాయు-జల తత్వాలను' పెంచుకోండి.`,
          ta: `இந்த ${dominantElement} ஆதிக்கம் உங்களுக்கு உறுதியையும் பொறுமையையும் தந்தாலும், மாற்றங்களை ஏற்கச் சிறிது தயக்கம் வரலாம். நடைப்பயிற்சி மற்றும் பிராணாயாமம் மூலம் 'வாயு-நீர் தத்துவத்தை' மேம்படுத்தலாம்.`,
          en: `While this ${dominantElement} matrix endows unshakable patience and practical stewardship, it can occasionally invite rigidity or over-burdened caution. Introducing fresh airflow, movement, and Water lightness refreshes agility.`
        }, targetLang)
        : pick6({
          kn: `ಈ ${dominantElement} ಪ್ರಧಾನತೆಯು ನಿಮಗೆ ಅದ್ಭುತ ಕಾರ್ಯಕ್ಷಮತೆ ಹಾಗೂ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ನೀಡಿದರೂ, ಕೆಲವೊಮ್ಮೆ ತೀವ್ರ ಆವೇಶ ಅಥವಾ ಅತಿಯಾದ ಆಲೋಚನೆಯಿಂದ ನಿದ್ರಾಹೀನತೆಯನ್ನು ಉಂಟುಮಾಡಬಹುದು. 'ಜಲ ತತ್ವ'ವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದರಿಂದ ನಿಮ್ಮ ಬುದ್ಧಿ ಮತ್ತಷ್ಟು ಶಾಂತ ಹಾಗೂ ಸ್ಥಿರವಾಗುತ್ತದೆ.`,
          mr: `या ${dominantElement} प्रधानतेमुळे आपल्यात उत्तम निर्णयक्षमता आहे, पण कधीकधी अतिविचार व रागामुळे अस्वस्थता येते. 'जल तत्त्वाचे' संतुलन राखल्यास मन अधिक शांत व एकाग्र होईल.`,
          hi: `यह ${dominantElement} प्रधानता आपको अदम्य कार्यक्षमता एवं तीव्र बुद्धि प्रदान करती है, परंतु कभी-कभी अति-चिंतन एवं व्यग्रता भी देती है। 'जल तत्त्व' के संवर्धन से आपका विवेक शांत एवं स्थिर होगा।`,
          te: `ఈ ${dominantElement} ప్రాధాన్యం మీకు విశేష శక్తినిస్తుంది, కానీ అతిగా ఆలోచించడం వల్ల మానసిక ఆందోళన కలగవచ్చు. 'జల తత్వాన్ని' సమతుల్యం చేసుకోవడం ముఖ్యం.`,
          ta: `இந்த ${dominantElement} ஆதிக்கம் உங்களுக்கு பெரும் ஆற்றலைத் தந்தாலும், சில நேரங்களில் அதிக சிந்தனையால் மன அழுத்தம் வரக்கூடும். 'நீர் தத்துவத்தை' சமநிலைப்படுத்துவது அமைதி தரும்.`,
          en: `While this ${dominantElement} fusion bestows dynamic drive and rapid cognition, it occasionally provokes hyper-vigilance, nervous heat, or restless sleep. Consciously nourishing Water coolness anchors clarity and lasting focus.`
        }, targetLang);

  const chapters: Master25Chapter[] = [];


  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: THE INSTANT HOOK — "HOW DID IT KNOW THIS?!" (Chapters 1 to 6)
  // ──────────────────────────────────────────────────────────────────────────
  const sec1 = pick6({
    kn: "ವಿಭಾಗ ೧: ತಕ್ಷಣದ ದೈವಿಕ ಸ್ಪಂದನೆ & ಆಂತರಿಕ ಸತ್ಯ ದರ್ಶನ",
    mr: "विभाग १: तात्काळ दैवी प्रचिती व गूढ सत्य दर्शन",
    hi: "खंड १: तात्कालिक दिव्य अनुभूति एवं अंतस का सत्य",
    te: "విభాగం 1: తక్షణ దైవిక స్పందన & ఆంతరంగిక సత్య దర్శనం",
    ta: "பிரிவு 1: உடனடி ஆச்சரியம் & அந்தரங்க ரகசிய தரிசனம்",
    en: "Section 1: The Instant Hook — Living Moment & Hidden Truths"
  }, targetLang);

  // CHAPTER 1: Prashna Drishti & Live Moment Guidance (#1 Priority Hook)
  chapters.push({
    chapterNumber: 1,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ಪ್ರಶ್ನ ದೃಷ್ಟಿ & ಲೈವ್ ಕ್ಷಣದ ಆಂತರಿಕ ಆತಂಕ ನಿವಾರಣೆ",
      mr: "प्रश्न दृष्टी व सध्याच्या मनातील चिंतेचे निराकरण",
      hi: "प्रश्न दृष्टि एवं इस क्षण की आंतरिक चिंता का समाधान",
      te: "ప్రశ్న దృష్టి & ప్రస్తుతం మనసులోని ఆందోళనకు దైవిక మార్గం",
      ta: "பிரஸ்ன திருஷ்டி & இந்த நொடியின் மனக்கவலை தீர்வு",
      en: "Prashna Drishti & Live Moment Guidance"
    }, targetLang),
    icon: "👁️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಗಾಢವಾಗಿ ಆವರಿಸಿರುವ ಆಂತರಿಕ ಆತಂಕ ಹಾಗೂ ಈ ಕ್ಷಣದ ದೈವಿಕ ಸಂದೇಶವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, सध्या आपल्या मनाला अस्वस्थ करणारी मुख्य चिंता व या क्षणाचा दैवी संदेश काय आहे?`,
      hi: `प्रश्न: ${devoteeName}, इस समय आपके अंतर्मन को उद्वेलित करने वाली चिंता एवं इस पल का दिव्य संदेश क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, ప్రస్తుతం మీ మనసును వేధిస్తున్న ఆందోళన & ఈ క్షణంలో దైవ సందేశం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, தற்போது உங்கள் மனதில் ஓடிக்கொண்டிருக்கும் தீராத கவலை மற்றும் இந்த தருணத்தின் வழிகாட்டல் என்ன?`,
      en: `Question: ${devoteeName}, what is the exact unspoken worry weighing on your mind right now, and what is the divine guidance?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನೀವು ಈ ಜಾತಕವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿರುವ ಪ್ರಸ್ತುತ ಕ್ಷಣದ ಕಾಲಹೋರೆಯು '${currentHoraPlanet}' ಗ್ರಹದ ಅಧೀನದಲ್ಲಿದೆ. ಚಂದ್ರನು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonRashiName}ಯೊಂದಿಗೆ ಸಾಧಿಸಿರುವ ಗೋಚಾರ ಸಂಬಂಧವನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಅವಲೋಕಿಸಿದಾಗ, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಒಂದು ಅನಿಶ್ಚಿತತೆಯ ನೆರಳು ಸ್ಪಷ್ಟವಾಗಿ ಗೋಚರಿಸುತ್ತಿದೆ. ಹೊರಜಗತ್ತಿಗೆ ನೀವು ಎಲ್ಲವೂ ಸಹಜವಾಗಿದೆ ಎಂದು ತೋರಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದರೂ, ಒಳಮನಸ್ಸಿನಲ್ಲಿ ಒಂದು ಪ್ರಮುಖ ಕೆಲಸದ ಮುಕ್ತಾಯ, ಗೌರವದ ರಕ್ಷಣೆ ಅಥವಾ ಕುಟುಂಬದ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ತೀವ್ರ ಆಲೋಚನೆ ನಿರಂತರವಾಗಿ ನಡೆಯುತ್ತಿದೆ.`,
        mr: `${devoteeName}, आपण ही पत्रिका उघडली त्या क्षणी आकाशात '${currentHoraPlanet}' ग्रहाची होरा कार्यरत आहे. आपल्या ${moonRashiName} राशीशी असलेला संबंध पाहता, सध्या आपल्या मनात एक छुपी अस्वस्थता स्पष्ट जाणवते. जगाला सर्व ठीक असल्याचे दाखवत असलात, तरी मनात एक काम पूर्ण होण्याविषयी किंवा भविष्यातील जबाबदाऱ्यांविषयी सतत विचार सुरू आहेत.`,
        hi: `${devoteeName}, जिस क्षण आप इस प्रतिवेदन का अवलोकन कर रहे हैं, उस समय कालचक्र में '${currentHoraPlanet}' की होरा संचालित है। आपकी जन्म राशि ${moonRashiName} से गोचर का संबंध स्पष्ट करता है कि आपके अंतर्मन में एक अनकही उधेड़बुन चल रही है। बाह्य रूप से शांत दिखने पर भी किसी महत्वपूर्ण कार्य के परिणाम अथवा परिवार के स्थायित्व को लेकर मन निरंतर चिंतनशील है।`,
        te: `${devoteeName}, మీరు ఈ నివేదికను చూస్తున్న సమయంలో '${currentHoraPlanet}' హోర నడుస్తోంది. మీ జన్మ రాశి ${moonRashiName} తో గోచార సంబంధం మీ మనసులోని తీవ్ర అంతర్మథనాన్ని స్పష్టం చేస్తోంది. పైకి ప్రశాంతంగా కనిపిస్తున్నా, ఒక ముఖ్యమైన కార్యం లేదా భవిష్యత్తు గురించి ఆలోచనలు నిరంతరం సాగుతున్నాయి.`,
        ta: `${devoteeName}, நீங்கள் இந்த ஜாதகத்தைப் படிக்கும் இந்த வினாடியில் '${currentHoraPlanet}' ஹோரை ஆட்சி செய்கிறது. உங்கள் ${moonRashiName} ராசியின் கோசார நிலையைப் பார்க்கும்போது, மனதில் சொல்ல முடியாத ஒருவித தயக்கமும் பாரமும் நிலவுகிறது. வெளியே அமைதியாகக் காட்டினாலும், முக்கியமான காரியம் வெற்றி பெறுமா என்ற சிந்தனை ஓடிக்கொண்டிருக்கிறது.`,
        en: `${devoteeName}, at the exact moment of reviewing this destiny blueprint, the celestial sphere is governed by the planetary Hora of ${currentHoraPlanet}. Correlating with your natal Moon in ${moonRashiName}, your subconscious carries a subtle veil of quiet apprehension regarding impending milestone closures or family commitments.`
      }, targetLang),
      pick6({
        kn: `ದೈವಶಾಸ್ತ್ರದ ದೃಢ ನಿಯಮದಂತೆ, ಈ ಆತಂಕವು ನಿಮ್ಮ ಅಸಾಮರ್ಥ್ಯದ ಫಲವಲ್ಲ; ಬದಲಾಗಿ ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ಪ್ರಸ್ತುತ ಸಂಚರಿಸುತ್ತಿರುವ ಗ್ರಹಗಳ ತಾತ್ಕಾಲಿಕ ಘರ್ಷಣೆಯಾಗಿದೆ. ಮುಂದಿನ ಕೆಲವು ವಾರಗಳಲ್ಲಿ ನಿಮ್ಮ ಆತ್ಮಬಲವು ಪುನಃ ಜಾಗೃತವಾಗಲಿದ್ದು, ಈ ಕ್ಷಣದಲ್ಲಿ ಯಾವುದೇ ಹಠಾತ್ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳದೆ ತಾಳ್ಮೆಯಿಂದಿರುವುದು ಶ್ರೇಯಸ್ಕರ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯು ನಿಮ್ಮನ್ನು ಅಗೋಚರವಾಗಿ ಕಾಯುತ್ತಿದೆ.`,
        mr: `ज्योतिषशास्त्रानुसार ही चिंता आपल्या कमकुवतपणाची नाही, तर आपल्या ${lagnaRashiName} लग्नावर सुरू असलेल्या ग्रहांच्या तात्पुरत्या प्रभावाची आहे. लवकरच हा मळभ दूर होऊन नवीन आशेचा किरण दिसेल. धीर धरा, गोकर्ण महाबळेश्वराची कृपा आपल्या पाठीशी आहे.`,
        hi: `शास्त्रसम्मत दृष्टि से यह चिंता आपकी किसी अक्षमता का परिणाम नहीं है, अपितु आपके ${lagnaRashiName} लग्न पर चल रहे तात्कालिक गोचर का प्रभाव है। धैर्य रखें, आगामी कुछ सप्ताहों में मानसिक धुंध छंटेगी और गोकर्ण महाबलेश्वर की कृपा से सही मार्ग प्रशस्त होगा।`,
        te: `ఈ మానసిక ఒత్తిడి మీ లోపం కాదు, మీ ${lagnaRashiName} లగ్నంపై తాత్కాలిక గ్రహ సంచార ప్రభావం. గోకర్ణ మహాబలేశ్వరుని అనుగ్రహంతో కొద్ది రోజుల్లోనే స్పష్టత లభిస్తుంది.`,
        ta: `இந்த மன அழுத்தம் உங்கள் பலவீனம் அல்ல; ${lagnaRashiName} லக்னத்தின் மீது நகரும் கோசார கிரகங்களின் தற்காலிக விளைவு. கோகர்ண மகாபலேஸ்வரர் அருளால் விரைவில் குழப்பங்கள் நீங்கி புது வழி பிறக்கும்.`,
        en: `Classical Vedic axioms confirm this restlessness is merely a transient transit crucible upon your ${lagnaRashiName} ascendant. Clear discernment will restore within weeks as consecrated Gokarna blessings anchor your inner poise.`
      }, targetLang),
      pick6({
        kn: `ಈ ಕ್ಷಣದ ಗ್ರಹಸ್ಥಿತಿಯು ನಿಮಗೆ ನೀಡುತ್ತಿರುವ ಪರಮ ಸಂದೇಶವೇನೆಂದರೆ: ಭೂತಕಾಲದ ಹಿನ್ನಡೆಗಳನ್ನು ನೆನೆದು ಕೊರಗುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${nakshatraName}ಯು ಅಪಾರ ಸಹನಶಕ್ತಿಯನ್ನು ಹೊಂದಿದ್ದು, ಸದ್ಯದಲ್ಲಿಯೇ ಒಂದು ಮಹತ್ವದ ದೈವಿಕ ತಿರುವು ನಿಮ್ಮ ಪರವಾಗಿ ಪರಿಣಮಿಸಲಿದೆ. ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಇಷ್ಟದೇವತಾ ಸ್ಮರಣೆಯೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.`,
        mr: `या क्षणी ग्रहांचा मुख्य संदेश हाच आहे: भूतकाळातील अपयशाचा विचार थांबवा. आपले ${nakshatraName} नक्षत्र आपल्याला अपार सहनशीलता प्रदान करते. लवकरच एक सकारात्मक दैवी वळण आपल्या बाजूने येईल. दररोज सकाळी सूर्य नमस्कार व इष्टदेवता स्मरण करून कामाला लागा.`,
        hi: `इस क्षण का आकाशीय संदेश यही है कि अतीत की असफलताओं का शोक छोड़ें। आपका जन्म नक्षत्र ${nakshatraName} असीम धैर्य का प्रतीक है। शीघ्र ही एक शुभ घटनाक्रम आपके पक्ष में मुड़ेगा। नित्य प्रातः सूर्य को अर्घ्य देकर आत्मबल सुदृढ़ करें।`,
        te: `ఈ క్షణంలో గ్రహాల సందేశం ఒక్కటే: గతం గురించి ఆలోచించి చింతించకండి. మీ ${nakshatraName} నక్షత్రం సహనానికి ప్రతీక. త్వరలోనే మీ అనుకూలంగా పరిస్థితులు మారతాయి. ప్రతీరోజూ సూర్య నమస్కారాలు చేయండి.`,
        ta: `இந்த தருணத்தின் பிரபஞ்ச செய்தி: கடந்த கால கவலைகளை மறந்து முன்னேறுங்கள். உங்கள் ${nakshatraName} நட்சத்திரம் மிகுந்த மன தைரியத்தைக் கொண்டது. விரைவில் நல்ல திருப்புமுனை உண்டாகும். தினமும் சூரிய வழிபாடு செய்யுங்கள்.`,
        en: `The primary living counsel of this hour urges you to release lingering post-mortems of past delays. Your natal asterism ${nakshatraName} is intrinsically resilient; an auspicious pivot is aligning to vindicate your honest intent.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "ಕ್ಷಣಿಕ ಆತಂಕ ನಿವಾರಣೆ",
      mr: "चिंता निवारण",
      hi: "चिंता मुक्ति",
      te: "ఆందోళన నివారణ",
      ta: "மன அமைதி",
      en: "Immediate Anxiety Relief"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಇಂದು ಸಂಜೆ ಶುದ್ಧ ತುಪ್ಪದ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ ೧೧ ಬಾರಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ಮನಸ್ಸಿನ ಗೊಂದಲಗಳು ಶಮನವಾಗುತ್ತವೆ.`,
      mr: `आज संध्याकाळी तुपाचा दिवा लावून ११ वेळा 'ॐ नमः शिवाय' जप करा. मनाला त्वरित शांतता लाभेल.`,
      hi: `आज सायंकाल शुद्ध घी का दीपक प्रज्वलित कर ११ बार 'ॐ नमः शिवाय' का जप करें। चित्त एकाग्र होगा।`,
      te: `ఈ సాయంత్రం నేతి దీపం వెలిగించి 11 సార్లు 'ఓం నమః శివాయ' జపించండి. మనశ్శాంతి కలుగుతుంది.`,
      ta: `இன்று மாலை நெய் தீபம் ஏற்றி 11 முறை 'ஓம் நம சிவாய' ஜபிக்கவும். மன அமைதி கூடும்.`,
      en: `Light a pure cow-ghee lamp this evening and recite 'Om Namah Shivaya' 11 times to instantly dissolve ambient mental friction.`
    }, targetLang)
  });

  // CHAPTER 2: Nigooda Rahasya — Silent Emotional Burdens & Hidden Sacrifices
  chapters.push({
    chapterNumber: 2,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ನಿಗೂಢ ರಹಸ್ಯ: ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದ ಆಂತರಿಕ ತ್ಯಾಗ & ಮೌನ ಸಂಕಟ",
      mr: "निगूढ रहस्य: कोणाशीही न बोललेला अंतर्गत त्याग व मौन वेदना",
      hi: "निगूढ़ रहस्य: किसी से न कही गई मूक वेदना एवं आंतरिक त्याग",
      te: "నిగూఢ రహస్యం: ఎవరితోనూ పంచుకోని త్యాగం & అంతరంగిక బాధ",
      ta: "நிகூட ரகசியம்: யாரிடமும் கூறாத மௌன தியாகமும் மனச்சுமையும்",
      en: "Nigooda Rahasya — Silent Emotional Burdens & Hidden Sacrifices"
    }, targetLang),
    icon: "🕯️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಯಾವ ನಿಗೂಢ ಸ್ಥಾನವು ನೀವು ಕುಟುಂಬ ಹಾಗೂ ಪ್ರೀತಿಪಾತ್ರರಿಗಾಗಿ ಮಾಡಿದ ಮೌನ ತ್ಯಾಗಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेतील कोणते छुपे स्थान आपण कुटुंब व आप्तस्वकीयांसाठी केलेल्या मूक त्यागाची साक्ष देते?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली का कौन सा गुप्त भाव परिवार एवं प्रियजनों के लिए किए गए मूक त्याग को दर्शाता है?`,
      te: `ప్రశ్న: ${devoteeName}, కుటుంబం కోసం మీరు చేసిన నిస్వార్థ త్యాగాలను మీ కుండలిలో ఏ గ్రహ స్థానం నిరూపిస్తోంది?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் உள்ள எந்த மறைமுக அமைப்பு நீங்கள் குடும்பத்திற்காக செய்த மௌன தியாகங்களைக் காட்டுகிறது?`,
      en: `Question: ${devoteeName}, which astrological configuration in your chart bears witness to the silent sacrifices and unshared emotional burdens you carry for others?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಅಷ್ಟಮ ಹಾಗೂ ದ್ವಾದಶ ಭಾವಗಳ ಗ್ರಹ ಸ್ಥಿತಿಯು ಒಂದು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಸತ್ಯವನ್ನು ಅನಾವರಣಗೊಳಿಸುತ್ತದೆ. ನೀವು ಬದುಕಿನಲ್ಲಿ ಇತರರ ಕಷ್ಟಗಳನ್ನು ಕಂಡು ಮರುಗಿದ್ದೀರಿ; ನಿಮ್ಮ ಸ್ವಂತ ಸುಖ, ವೈಯಕ್ತಿಕ ಮಹತ್ವಾಕಾಂಕ್ಷೆ ಅಥವಾ ಉಳಿತಾಯವನ್ನು ಬದಿಗೊತ್ತಿ ಕುಟುಂಬದ ಗೌರವವನ್ನು ಉಳಿಸಲು ಮುಂಚೂಣಿಯಲ್ಲಿ ನಿಂತಿದ್ದೀರಿ. ಆದರೆ ದುರದೃಷ್ಟವಶಾತ್, ನೀವು ಮಾಡಿದ ತ್ಯಾಗಗಳಿಗೆ ಸಿಗಬೇಕಾದ ಕೃತಜ್ಞತೆ ಅಥವಾ ಪ್ರೀತಿ ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಲಭಿಸಿಲ್ಲ ಎಂಬ ಕೊರಗು ನಿಮ್ಮ ಆಳವಾದ ಮನಸ್ಸಿನಲ್ಲಿದೆ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेतील अष्टम व व्यय स्थानाची रचना एक अत्यंत संवेदनशील पैलू उघड करते. आपण कुटुंबाच्या हितासाठी स्वतःच्या सुखाचा आणि आर्थिक गरजांचा अनेकदा त्याग केला. संकटकाळात सर्वांना सांभाळले, पण ज्यांच्यासाठी हे सर्व केले, त्यांच्याकडून योग्य ती कदर किंवा पाठीवर थाप न मिळाल्याची एक खंत अंतर्मनात कायम घर करून राहिली आहे.`,
        hi: `${devoteeName}, आपकी जन्म कुंडली का अष्टम एवं द्वादश भाव एक अत्यंत संवेदनशील सत्य प्रकट करता है। आपने जीवन में दूसरों की रक्षा एवं परिवार की प्रतिष्ठा हेतु अपने सुख, विश्राम एवं संचित साधनों का निःसंकोच त्याग किया। परंतु विडंबना यह रही कि जिन लोगों के लिए आपने यह भार उठाया, उन्होंने समय आने पर आपकी भावना की वह कद्र नहीं की जिसके आप वास्तविक अधिकारी थे।`,
        te: `${devoteeName}, మీ కుండలిలోని 8 మరియు 12వ స్థానాలు ఒక తీవ్ర భావోద్వేగ సత్యాన్ని తెలియజేస్తున్నాయి. కుటుంబ ప్రతిష్ట కోసం మీ స్వంత కోరికలను త్యాగం చేశారు. కానీ తగినంత గుర్తింపు లేదా కృతజ్ఞత లభించలేదన్న వేదన మీ మనసులో మిగిలిపోయింది.`,
        ta: `${devoteeName}, உங்கள் ஜாதகத்தின் எட்டாம் மற்றும் பன்னிரண்டாம் பாவங்கள் ஒரு ஆழ்ந்த ரகசியத்தை வெளிப்படுத்துகின்றன. குடும்பத்தினருக்காகவும் உறவுகளுக்காகவும் உங்கள் சொந்த விருப்பங்களையும் நிதியையும் பலமுறை தியாகம் செய்துள்ளீர்கள். ஆனால் பிரதிபலனாகக் கிடைக்க வேண்டிய பாசமும் அங்கீகாரமும் கிடைக்கவில்லை என்ற ஆதங்கம் உண்டு.`,
        en: `${devoteeName}, the harmonic interplay of your chart's hidden houses reveals a poignant truth. You have repeatedly placed family obligations and the welfare of dependents ahead of your own personal ambitions or comfort. The unspoken grievance is that those for whom you carried this silent burden often failed to acknowledge the depth of your sacrifice.`
      }, targetLang),
      pick6({
        kn: `ಈ ನಿಗೂಢ ಸಂಕಟವು ನಿಮ್ಮನ್ನು ಒಳಮುಖಿಯಾಗಿಸಿದ್ದು, ಇತರರ ಎದುರು ನಿಮ್ಮ ದುಃಖವನ್ನು ತೋಡಿಕೊಳ್ಳಲು ನಿಮ್ಮ ಆತ್ಮಗೌರವ ಎಂದಿಗೂ ಸಮ್ಮತಿಸುವುದಿಲ್ಲ. ವೇದ ಜ್ಯೋತಿಷ್ಯವು ಹೇಳುವಂತೆ, ಈ ತ್ಯಾಗವು ವ್ಯರ್ಥವಾಗಿಲ್ಲ; ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಗೆ ಇದು ಅಪಾರ ಕರ್ಮ ಶುದ್ಧಿಯನ್ನು ನೀಡಿದೆ. ಈಗ ನೀವು ಇತರರ ಅತಿಯಾದ ನಿರೀಕ್ಷೆಗಳಿಗೆ ಗಡಿಗಳನ್ನು ನಿರ್ಮಿಸಿಕೊಳ್ಳುವ ಸಮಯ ಬಂದಿದೆ.`,
        mr: `या मौन वेदनेने आपल्याला काहीसे अंतर्मुख बनवले आहे. इतरांसमोर अश्रू ढाळणे आपल्या स्वाभिमानाला कधीच मान्य नसते. वैदिक ज्योतिष सांगते की हा त्याग वाया गेलेला नाही; याने आपले कर्म शुद्ध केले आहे. आता इतरांच्या अपेक्षांना स्पष्ट मर्यादा घालण्याची वेळ आली आहे.`,
        hi: `इस मौन व्यथा ने आपके स्वभाव को अंतर्मुखी बनाया है; किसी के समक्ष याचना करना आपके स्वाभिमान के विरुद्ध रहा है। वैदिक ज्योतिष के अनुसार यह त्याग निष्फल नहीं हुआ है, इसने आपके संचित कर्मों को धोया है। अब समय आ गया है कि आप स्वयं की उपेक्षा बंद कर उचित सीमाएं निर्धारित करें।`,
        te: `ఈ నిగూఢ బాధ మీ ఆత్మాభిమానాన్ని తగ్గించలేదు, కానీ మిమ్మల్ని అంతర్ముఖులను చేసింది. మీ త్యాగం వృధా కాలేదు, అది మీ పూర్వ పుణ్యాన్ని పెంచింది. ఇకపై ఇతరుల మితిమీరిన అంచనాలకు హద్దులు పెట్టండి.`,
        ta: `இந்த மௌன வலி உங்களை உள்ளுக்குள் முடக்கியிருந்தாலும், உங்கள் சுயமரியாதையை எவரிடமும் விட்டுக் கொடுக்கவில்லை. உங்கள் தியாகம் வீண் போகவில்லை; அது கர்ம வினைகளைக் கரைத்துள்ளது. இனி உங்கள் சுய முன்னேற்றத்திற்கு முக்கியத்துவம் கொடுங்கள்.`,
        en: `This quiet burden has forged an unyielding inner dignity; you refuse to solicit pity from those who wounded you. Classical Jyotish affirms that this forbearance has burned profound karmic debts; the cosmic season has arrived for you to establish firm emotional boundaries and honor your own well-being.`
      }, targetLang),
      pick6({
        kn: `ನಿಮ್ಮ ಒಳಮನಸ್ಸಿನ ಭಾರವನ್ನು ಶಾಶ್ವತವಾಗಿ ಕರಗಿಸಲು ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಆತ್ಮಲಿಂಗ ದರ್ಶನ ಅಥವಾ ಮನೆಯಲ್ಲೇ ಸೋಮವಾರ ಬಿಲ್ವಾರ್ಚನೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿ. ಯಾರೂ ನಿಮ್ಮನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳದಿದ್ದರೂ ಪರಶಿವನ ಕೃಪೆ ಸದಾ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.`,
        mr: `या मनातील ओझ्यापासून मुक्त होण्यासाठी श्री गोकर्ण महाबळेश्वराचे ध्यान किंवा सोमवारी घरात महादेवाला बेलपत्र अर्पण करणे अत्यंत लाभदायी ठरेल. ईश्वरावर विश्वास ठेवा, आपले सर्व चांगले दिवस परत येतील.`,
        hi: `अपने मन के इस आंतरिक भार को विसर्जित करने हेतु श्री गोकर्ण महाबलेश्वर के आत्मलिंग का स्मरण अथवा प्रत्येक सोमवार को शिवलिंग पर बेलपत्र अर्पित करना परम कल्याणकारी होगा। ईश्वरीय कृपा आपके साथ है।`,
        te: `ఈ మానసిక భారం తొలగడానికి శ్రీ గోకర్ణ మహాబలేశ్వరుని స్మరిస్తూ సోమవారం బిల్వార్చన చేయండి. దైవకృప మీకు అండగా ఉంటుంది.`,
        ta: `மனதில் உள்ள மௌன பாரம் நீங்க, கோகர்ண மகாபலேஸ்வரரை மனதில் நினைத்து திங்கட்கிழமைகளில் சிவபெருமானுக்கு வில்வ இலை சாற்றி வழிபடவும். நன்மைகள் பெருகும்.`,
        en: `To permanently release this subconscious residue, invoke Lord Mahabaleshwara of Sri Kshetra Gokarna. Monday Bilva leaf offerings and simple prayer will dissolve emotional fatigue and invite divine restitution.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "ಭಾವನಾತ್ಮಕ ಮುಕ್ತಿ",
      mr: "भावनिक मुक्ती",
      hi: "भावनात्मक मुक्ति",
      te: "భావోద్వేగ విముక్తి",
      ta: "மன அமைதி",
      en: "Emotional Emancipation"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಇತರರಿಗೆ 'ಇಲ್ಲ' ಎಂದು ಹೇಳಲು ಕಲಿಯಿರಿ. ನಿಮ್ಮ ಸ್ವಂತ ಶಾಂತಿ ಮತ್ತು ಆರೋಗ್ಯಕ್ಕೆ ಮೊದಲ ಆದ್ಯತೆ ನೀಡಿ.`,
      mr: `जिथे गरज आहे तिथे ठामपणे 'नाही' म्हणायला शिका. स्वतःचे आरोग्य व मानसिक शांती जपणे हे आपले कर्तव्य आहे.`,
      hi: `अनुचित अपेक्षाओं को विनम्रतापूर्वक 'ना' कहना सीखें। अपने स्वास्थ्य एवं आत्मिक शांति को प्राथमिकता दें।`,
      te: `అవసరమైన చోట స్పష్టంగా 'వద్దు' అని చెప్పడం నేర్చుకోండి. మీ ఆరోగ్యం మరియు శాంతికి ప్రాధాన్యత ఇవ్వండి.`,
      ta: `தேவையற்ற இடங்களில் தயங்காமல் 'முடியாது' என்று சொல்லப் பழகுங்கள். உங்கள் நிம்மதிக்கே முன்னுரிமை.`,
      en: `Practice gentle but unequivocal boundary setting. Preserving your physical vitality and inner peace is your primary spiritual duty.`
    }, targetLang)
  });

  // CHAPTER 3: Past 24-Month Mathematical Verification — 2 Realities You Overcame
  chapters.push({
    chapterNumber: 3,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳ ಗಣಿತ ಪರಿಶೀಲನೆ: ನೀವು ಗೆದ್ದು ಬಂದ ೨ ಕಠಿಣ ಸತ್ಯಗಳು",
      mr: "मागील २४ महिन्यांची अचूक पडताळणी: आपण पार केलेली २ मोठी आव्हाने",
      hi: "विगत २४ महीनों का गणितीय सत्यापन: दो कठोर संघर्ष जिन पर आपने विजय पाई",
      te: "గత 24 నెలల గణిత పరిశీలన: మీరు అధిగమించిన 2 కఠిన సవాళ్లు",
      ta: "கடந்த 24 மாத கணித உண்மை: நீங்கள் கடந்து வந்த 2 பெரும் சோதனைகள்",
      en: "Past 24-Month Mathematical Verification — 2 Realities You Overcame"
    }, targetLang),
    icon: "⚖️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಕಳೆದ ೨ ವರ್ಷಗಳಲ್ಲಿ ಶನಿ ಮತ್ತು ರಾಹುವಿನ ಗೋಚಾರವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಉಂಟುಮಾಡಿದ ೨ ನಿಖರ ಸವಾಲುಗಳು ಯಾವುವು?`,
      mr: `प्रश्न: ${devoteeName}, मागील २ वर्षांत शनी व राहूच्या भ्रमणाने आपल्या आयुष्यात कोणती २ नेमकी आव्हाने उभी केली होती?`,
      hi: `प्रश्न: ${devoteeName}, विगत २ वर्षों में शनि एवं राहु के गोचर ने आपके जीवन में कौन सी २ सटीक चुनौतियां खड़ी की थीं?`,
      te: `ప్రశ్న: ${devoteeName}, గత రెండేళ్లలో శని, రాహువుల సంచారం వల్ల మీ జీవితంలో ఎదురైన 2 కచ్చితమైన సవాళ్లు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, கடந்த இரண்டு ஆண்டுகளில் சனி மற்றும் ராகுவின் சஞ்சாரத்தால் நீங்கள் சந்தித்த 2 முக்கிய சோதனைகள் எவை?`,
      en: `Question: ${devoteeName}, what are the exact two real-world crucibles triggered by Saturn and Rahu's transits over the past 24 months that proved your chart's authenticity?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರವು ಕೇವಲ ಭವಿಷ್ಯ ನುಡಿಯುವುದಲ್ಲ, ಗತಕಾಲದ ಗಣಿತವನ್ನು ನಿಖರವಾಗಿ ದೃಢೀಕರಿಸುವುದಾಗಿದೆ. ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳಲ್ಲಿ ಮಂದಗಾಮಿ ಶನಿಯು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಾದ ${moonRashiName}ಯ ಮೇಲೆ ಬೀರಿದ ಒತ್ತಡ ಹಾಗೂ ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷದ ಸಂಚಾರವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಎರಡು ದೊಡ್ಡ ಅಗ್ನಿಪರೀಕ್ಷೆಗಳನ್ನು ತಂದೊಡ್ಡಿತು: ಮೊದಲನೆಯದಾಗಿ, ಒಂದು ನಿರ್ಣಾಯಕ ವೃತ್ತಿಪರ ಅಥವಾ ಹಣಕಾಸಿನ ಯೋಜನೆ ಅನಿರೀಕ್ಷಿತವಾಗಿ ವಿಳಂಬವಾಗಿ, ನೀವು ನಂಬಿದ್ದ ವ್ಯಕ್ತಿಗಳೇ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೈಕೊಟ್ಟರು.`,
        mr: `${devoteeName}, ज्योतिष केवळ भविष्य सांगत नाही, तर भूतकाळाची अचूक गणितीय साक्ष देते. मागील २४ महिन्यांत शनीची आपल्या ${moonRashiName} राशीवरील दृष्टी व राहू-केतूचा प्रभाव यांमुळे दोन मोठी आव्हाने आली: पहिले म्हणजे, अत्यंत महत्त्वाचे आर्थिक किंवा व्यावसायिक काम ऐनवेळी रखडले आणि ज्यांच्यावर पूर्ण विश्वास होता, त्यांनीच अचानक पाठ फिरवली.`,
        hi: `${devoteeName}, शास्त्रसम्मत ज्योतिष केवल भविष्य कथन नहीं, अपितु अतीत की सटीक गणितीय कसौटी है। विगत २४ महीनों में मंदगामी शनि का आपकी जन्म राशि ${moonRashiName} पर प्रभाव एवं राहु-केतु के अक्ष ने आपके समक्ष दो प्रमुख परीक्षाएं रखीं: प्रथम, कोई महत्वपूर्ण आर्थिक अथवा आजीविका संबंधी कार्य अंतिम पड़ाव पर अटक गया और जिन पर आपने भरोसा किया, वे पीछे हट गए।`,
        te: `${devoteeName}, గత 24 నెలల్లో శని మరియు రాహువుల సంచారం మీ ${moonRashiName} రాశిపై తీవ్ర ప్రభావం చూపింది. ఒకటి: ఆర్థిక లేదా వృత్తిపరమైన పనులు చివరి నిమిషంలో ఆగిపోవడం, మరియు నమ్మినవారు వెనకడుగు వేయడం.`,
        ta: `${devoteeName}, கடந்த 24 மாதங்களில் சனி மற்றும் ராகுவின் பெயர்ச்சி உங்கள் ${moonRashiName} ராசியில் இரண்டு பெரும் சவால்களை உருவாக்கியது: முதலாவதாக, ஒரு முக்கியமான பணவரவு அல்லது தொழில் முயற்சி கடைசி நேரத்தில் தடைபட்டு, நீங்கள் நம்பியவர்கள் கைகொடுக்காமல் போனது.`,
        en: `${devoteeName}, authentic Jyotish verifies the past mathematically before forecasting tomorrow. Over the preceding 24 months, Saturn's orbital weight relative to your natal Moon in ${moonRashiName} alongside the Rahu-Ketu nodal axis activated two undeniable crucibles: first, a critical career or financial initiative stalled abruptly near completion when trusted allies withdrew support.`
      }, targetLang),
      pick6({
        kn: `ಎರಡನೆಯದಾಗಿ, ಕುಟುಂಬದ ಹಿರಿಯರ ಆರೋಗ್ಯದ ಚಿಂತೆ ಅಥವಾ ಆಪ್ತ ಸಂಬಂಧವೊಂದರಲ್ಲಿ ಉಂಟಾದ ಅಸಹನೀಯ ತಪ್ಪು ತಿಳುವಳಿಕೆಯು ನಿಮ್ಮ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕದಡಿತ್ತು. ರಾತ್ರಿ ವೇಳೆ ಗಾಢ ನಿದ್ರೆ ಬಾರದಷ್ಟು ಆಲೋಚನೆಗಳು ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿದ್ದವು. ಆದರೆ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಯ ಅದಮ್ಯ ಇಚ್ಛಾಶಕ್ತಿಯಿಂದ ನೀವು ಆ ಎಲ್ಲಾ ಬಿರುಗಾಳಿಗಳನ್ನು ಎದುರಿಸಿ ಇಂದು ಗಟ್ಟಿಯಾಗಿ ನಿಂತಿದ್ದೀರಿ.`,
        mr: `दुसरे आव्हान म्हणजे, कुटुंबातील ज्येष्ठांचे आरोग्य किंवा एका जवळच्या नात्यातील गैरसमजामुळे झालेली मनस्ताप. अनेक रात्री झोप न येण्याइतपत चिंता सतावत होती. तरीही आपल्या ${lagnaRashiName} लग्नाच्या जन्मजात आत्मबलाने आपण या सर्व वादळांवर मात करून ताठ मानेने उभे राहिलात.`,
        hi: `द्वितीय, परिवार के किसी वरिष्ठ सदस्य का स्वास्थ्य अथवा किसी अत्यंत निकटस्थ संबंध में उत्पन्न कड़वाहट एवं गलतफहमी, जिसने आपकी रातों की नींद छीन ली थी। फिर भी आपके ${lagnaRashiName} लग्न के नैसर्गिक आत्मबल ने आपको टूटने नहीं दिया और आप इस अग्निपरीक्षा से कुंदन बनकर निकले।`,
        te: `రెండవది: కుటుంబంలో పెద్దల ఆరోగ్యం లేదా అత్యంత సన్నిహితులతో వచ్చిన అపార్థాలు మిమ్మల్ని తీవ్ర మనోవేదనకు గురిచేశాయి. కానీ మీ ${lagnaRashiName} లగ్న స్థైర్యం మిమ్మల్ని విజయవంతంగా నిలబెట్టింది.`,
        ta: `இரண்டாவதாக, குடும்ப மூத்தவர்களின் உடல்நலக் குறைவு அல்லது மிக நெருங்கிய ஒரு உறவில் ஏற்பட்ட தவறான புரிதலால் மன உளைச்சல் ஏற்பட்டது. எனினும் உங்கள் ${lagnaRashiName} லக்னத்தின் அசாத்திய மனவலிமையால் இந்த சோதனைகளை வென்றுள்ளீர்கள்.`,
        en: `The second crucible manifested as health worries concerning family elders or a bitter interpersonal misunderstanding with someone close that robbed your nights of restful sleep. Yet, because your ${lagnaRashiName} ascendant is fortified with innate tenacity, you weathered that storm without succumbing to despair.`
      }, targetLang),
      pick6({
        kn: `ಈ ಗಣಿತ ಪರಿಶೀಲನೆಯು ಸಾಬೀತುಪಡಿಸುವುದೇನೆಂದರೆ: ನಿಮ್ಮ ಗ್ರಹಗಳ ಅತಿ ಕಠಿಣ ಹಂತವು ಈಗ ಮುಗಿದಿದೆ. ಶನಿಯ ಕಠಿಣ ಶಿಕ್ಷಣವು ನಿಮ್ಮನ್ನು ಅಪಕ್ವ ನಂಬಿಕೆಗಳಿಂದ ಪಾರುಮಾಡಿ ವ್ಯಾವಹಾರಿಕವಾಗಿ ಗಟ್ಟಿಗೊಳಿಸಿದೆ. ಈಗ ಆರಂಭವಾಗುತ್ತಿರುವ ಹೊಸ ಚಕ್ರವು ನಿಮ್ಮ ತ್ಯಾಗಕ್ಕೆ ಯೋಗ್ಯ ಗೌರವ ಹಾಗೂ ಪ್ರತಿಫಲವನ್ನು ನೀಡಲಿದೆ.`,
        mr: `या पडताळणीवरून स्पष्ट होते की आपल्या आयुष्यातील सर्वात कठीण ग्रहदशा आता मागे पडली आहे. शनीच्या या कडक शिस्तीने आपल्याला व्यावहारिक बनवले. आता सुरू होणारा काळ आपल्या संघर्षाला योग्य न्याय व यश मिळवून देईल.`,
        hi: `यह गणितीय सत्यापन सिद्ध करता है कि आपके कष्टों का सर्वाधिक कठिन दौर अब समाप्त हो चुका है। शनि के अनुशासन ने आपको व्यावहारिक परिपक्वता दी है। अब प्रारंभ होने वाला नवीन कालखंड आपके परिश्रम को विजय में परिवर्तित करेगा।`,
        te: `ఈ గ్రహ పరిశీలన రుజువు చేస్తోంది: మీ జీవితంలో అత్యంత కఠినమైన దశ ముగిసింది. ఇకపై ప్రారంభమయ్యే సమయం మీ కష్టానికి తగిన ఫలితాన్ని, గౌరవాన్ని అందిస్తుంది.`,
        ta: `இந்த கணித உண்மை நிரூபிப்பது என்னவென்றால்: உங்கள் வாழ்க்கையின் மிகக் கடுமையான சோதனைக் காலம் முடிந்துவிட்டது. இனி வரும் காலம் உங்கள் தியாகத்திற்கும் உழைப்பிற்கும் உரிய அங்கீகாரத்தைத் தரும்.`,
        en: `This mathematical reality proves beyond doubt that the steepest ascent of your karmic test is behind you. Saturn's grueling apprenticeship has stripped away naivete and tempered your judgment; the unfolding cycle now turns to bestow honor and rightful compensation.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "ಗಣಿತ ಸತ್ಯ ಪರಿಶೀಲನೆ",
      mr: "अचूक पडताळणी",
      hi: "सटीक सत्यापन",
      te: "ఖచ్చితమైన పరిశీలన",
      ta: "கணித உண்மை",
      en: "Mathematical Validation"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಹಳೆಯ ನಷ್ಟಗಳನ್ನು ನೆನೆಸಿಕೊಳ್ಳಬೇಡಿ. ಈ ವಾರ ಗೋವಿಗೆ ಬೆಲ್ಲ ಹಾಗೂ ಹಸಿರು ಹುಲ್ಲನ್ನು ನೀಡಿ, ಹೊಸ ಅಧ್ಯಾಯಕ್ಕೆ ನಾಂದಿ ಹಾಡಿ.`,
      mr: `जुन्या नुकसानीचा विचार सोडून द्या. या आठवड्यात गाईला गूळ व चारा खाऊ घाला, नवीन सुरुवातीला गती मिळेल.`,
      hi: `विगत के नुकसानों का विलाप त्यागें। इस सप्ताह गोमाता को गुड़ व हरा चारा खिलाकर नए अध्याय का शुभारंभ करें।`,
      te: `గత నష్టాలను మరచిపోండి. ఈ వారం గోవుకు బెల్లం మరియు గడ్డి తినిపించి నూతన ప్రారంభం చేయండి.`,
      ta: `பழைய இழப்புகளை நினைப்பதை நிறுத்துங்கள். இந்த வாரம் பசுவிற்கு வெல்லமும் அகத்திக்கீரையும் கொடுத்து புதிய அத்தியாயத்தைத் தொடங்குங்கள்.`,
      en: `Cease dwelling upon past setbacks. Offer jaggery and fresh grass to a cow this week to ceremonially close old karmic books.`
    }, targetLang)
  });

  // CHAPTER 4: The 99% Last-Mile Maandi Knot — Root Cause of Stalled Milestones
  chapters.push({
    chapterNumber: 4,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ಮಾಂದಿ ಸ್ಪಷ್ಟಾಂಶ & ೯೯% ನಲ್ಲಿ ಸ್ಥಗಿತಗೊಳ್ಳುವ 'ಕೊನೆಯ ಕ್ಷಣದ ಗಂಟು'",
      mr: "मांदी स्पष्टांश व ९९% वर अडकणारी 'शेवटच्या क्षणाची गाठ'",
      hi: "मांदी स्पष्टांश एवं ९९% पर अटकने वाली 'अंतिम क्षण की ग्रंथि'",
      te: "మాంది స్పష్టాంశం & 99% వద్ద ఆగిపోయే 'చివరి క్షణపు ఆటంకం'",
      ta: "மாந்தி ஸ்பஷ்டம் & 99% வரை வந்து தடைபடும் 'கடைசி நேர முடிச்சு'",
      en: "The 99% Last-Mile Maandi Knot — Root Cause of Stalled Milestones"
    }, targetLang),
    icon: "🪢",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ${n(maandiHouse)}ನೇ ಭಾವದಲ್ಲಿರುವ ಮಾಂದಿ ಬಿಂದುವು ಏಕೆ ಕೆಲಸಗಳು ೯೯% ಮುಗಿದು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಸ್ಥಗಿತಗೊಳ್ಳುವಂತೆ ಮಾಡುತ್ತದೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेतील ${n(maandiHouse)}व्या स्थानातील मांदी ग्रह कामे ९९% पूर्ण झाल्यावर शेवटच्या क्षणी का अडकवून ठेवतो?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली के ${n(maandiHouse)}वें भाव में स्थित मांदी बिंदु क्यों कार्यों को ९९% तक पहुंचाकर अंतिम क्षण में अटका देता है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ కుండలిలోని ${n(maandiHouse)}వ స్థానంలో ఉన్న మాంది పనులు 99% పూర్తయ్యాక చివరి క్షణంలో ఎందుకు ఆగిపోయేలా చేస్తుంది?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் ${n(maandiHouse)}-ம் பாவத்தில் உள்ள மாந்தி கிரகம் ஏன் காரியங்கள் 99% வரை முடிந்து கடைசி நேரத்தில் தடையை ஏற்படுத்துகிறது?`,
      en: `Question: ${devoteeName}, why does the exact astronomical longitude of Maandi in House ${maandiHouse} trigger the classic '99% syndrome' where projects stall at the final yardline?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಾಚೀನ ಕೇರಳ ಜ್ಯೋತಿಷ್ಯ ಪದ್ಧತಿಯಲ್ಲಿ ಮಾಂದಿ (ಗುಳಿಕ) ಗ್ರಹಕ್ಕೆ ಅತ್ಯಂತ ನಿಖರ ಹಾಗೂ ಪ್ರಭಾವಶಾಲಿ ಸ್ಥಾನವಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಯಿಂದ ಲೆಕ್ಕ ಹಾಕಿದಾಗ, ಮಾಂದಿ ಸ್ಪಷ್ಟಾಂಶವು ನಿಮ್ಮ ಕುಂಡಲಿಯ ${n(maandiHouse)}ನೇ ಭಾವದಲ್ಲಿ (${maandiRashiName}) ಸ್ಥಿತವಾಗಿದೆ. ಈ ${n(maandiHouse)}ನೇ ಭಾವವು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ '${ctx.maandiDomainAffected}' ಕ್ಷೇತ್ರವನ್ನು ಆಳುತ್ತದೆ. ಹೀಗಾಗಿಯೇ ನೀವು ಯಾವುದೇ ಪ್ರಮುಖ ಕಾರ್ಯವನ್ನು ಆರಂಭಿಸಿದಾಗ ಶೇಕಡಾ ೯೦ ರಷ್ಟು ಯಶಸ್ವಿಯಾಗಿ ಮುಂದುವರಿಯುತ್ತದೆ; ಆದರೆ ಪೂರ್ಣ ಮುಕ್ತಾಯದ ಹಂತ ತಲುಪಿದಾಗ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆ ಎದುರಾಗುತ್ತದೆ.`,
        mr: `${devoteeName}, दक्षिण भारतीय व केरळीय ज्योतिष परंपरेत मांदी (गुलिक) बिंदूला अनन्यसाधारण महत्त्व आहे. आपल्या ${lagnaRashiName} लग्नानुसार मांदी आपल्या पत्रिकेतील ${n(maandiHouse)}व्या स्थानात (${maandiRashiName}) स्थित आहे. हे स्थान '${ctx.maandiDomainAffected}' या क्षेत्रावर प्रभाव पाडते. यामुळेच आपले काम सुरळीत सुरू होऊन ९०% पर्यंत पोहोचते, पण शेवटच्या स्वाक्षरीच्या किंवा मंजुरीच्या वेळी अनपेक्षित विघ्न उभे राहते.`,
        hi: `${devoteeName}, दक्षिण भारत की प्राचीन केरलीय ज्योतिष परंपरा में मांदी (गुलिक) को अत्यंत सूक्ष्म एवं प्रभावशाली माना गया है। आपके ${lagnaRashiName} लग्न के अनुसार मांदी का स्पष्टांश कुंडली के ${n(maandiHouse)}वें भाव (${maandiRashiName}) में स्थित है, जो कि '${ctx.maandiDomainAffected}' के क्षेत्र को नियंत्रित करता है। यही कारण है कि आपके प्रयास ९०% तक निर्बाध गति से आगे बढ़ते हैं, किंतु अंतिम क्षण में कोई अप्रत्याशित अड़चन आ खड़ी होती है।`,
        te: `${devoteeName}, దక్షిణ భారత జ్యోతిష్య సంప్రదాయంలో మాందికి అత్యంత ప్రాముఖ్యత ఉంది. మీ ${lagnaRashiName} లగ్నం నుండి మాంది ${n(maandiHouse)}వ స్థానంలో (${maandiRashiName}) ఉంది. ఈ స్థానం '${ctx.maandiDomainAffected}' రంగాన్ని ప్రభావితం చేస్తుంది. అందుకే మీ పనులు 90-99% వరకు సులభంగా జరిగి, చివర్లో ఊహించని అడ్డంకులు ఎదురవుతాయి.`,
        ta: `${devoteeName}, தென்னிந்திய கேரள ஜோதிட முறையில் மாந்திக்கு மிக முக்கிய இடமுண்டு. உங்கள் ${lagnaRashiName} லக்னத்திற்கு ${n(maandiHouse)}-ம் வீட்டில் (${maandiRashiName}) மாந்தி அமர்ந்துள்ளது. இந்த பாவம் '${ctx.maandiDomainAffected}' பகுதியைக் குறிக்கிறது. இதனால் உங்கள் முயற்சிகள் 99% வரை சுலபமாக வந்து, நிறைவு பெறும் வேளையில் திடீர் முட்டுக்கட்டை உண்டாகிறது.`,
        en: `${devoteeName}, in classical South Indian and Kerala prashna astrology, the mathematical point of Maandi (Gulika) is the prime detective of unseen blockages. Calculated from your ${lagnaRashiName} ascendant, Maandi resides exactly in House ${maandiHouse} (${maandiRashiName}), which governs '${ctx.maandiDomainAffected}'. This explains why your endeavors sail smoothly to 90-95%, only to be thwarted by a bizarre administrative, financial, or personal obstacle at the 99% mark.`
      }, targetLang),
      pick6({
        kn: `ಈ '೯೯% ಅಡೆತಡೆ ಗಂಟು' ನಿಮ್ಮ ಪರಿಶ್ರಮದ ಕೊರತೆಯಿಂದಲ್ಲ, ಬದಲಾಗಿ ಮಾಂದಿ ಪ್ರಭಾವಿತ ಭಾವದಲ್ಲಿ ಶೇಖರವಾಗಿರುವ ಅದೃಶ್ಯ ಕೃತಜ್ಞತಾ ದೋಷ ಅಥವಾ ವಾಸ್ತು ದಿಕ್ಕಿನ ದೋಷವಾಗಿದೆ. ಈ ಗ್ರಂಥಿಯನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಬಿಡಿಸದೆ ಕೇವಲ ಭೌತಿಕ ಪ್ರಯತ್ನಗಳಿಂದ ಪರಿಹರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ಚೈತನ್ಯ ಪಂಡಿತರ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಈ ಗಂಟನ್ನು ನಿವಾರಿಸಿದಾಗ, ಸ್ಥಗಿತಗೊಂಡಿರುವ ಪ್ರತಿಯೊಂದು ಕೆಲಸವೂ ಮಿಂಚಿನ ವೇಗದಲ್ಲಿ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.`,
        mr: `ही '९९% वर अडकणारी गाठ' आपल्या प्रयत्नांमधील उणेपणामुळे नाही, तर मांदीच्या स्थानातील अदृश्य सूक्ष्म अडथळ्यांमुळे आहे. योग्य शास्त्रीय शांती विधी केल्याशिवाय हा अडथळा केवळ व्यावहारिक उपायांनी दूर होत नाही. गोकर्ण क्षेत्राच्या परंपरेनुसार या गाठीची निवृत्ती केली असता, रखडलेली कामे वेगाने मार्गी लागतात.`,
        hi: `यह '९९% की ग्रंथि' आपके परिश्रम की कमी नहीं, अपितु मांदी द्वारा निर्मित सूक्ष्म कार्मिक अवरोध है। जब तक इस ग्रंथि का विधिवत शमन न हो, तब तक केवल बाह्य प्रयासों से सफलता नहीं मिलती। श्री गोकर्ण महाबलेश्वर के मुख्य अर्चकों के सान्निध्य में संकल्प लेकर इस दोष की निवृत्ति करने से रुके हुए कार्य द्रुत गति से सिद्ध होते हैं।`,
        te: `ఈ 99% ఆటంకం మీ ప్రయత్నాల లోపం కాదు, మాంది వలన కలిగే అదృశ్య అవరోధం. శాస్త్రోక్తమైన పరిహారం ద్వారా ఈ ముడిని విప్పినప్పుడు, నిలిచిపోయిన పనులు వేగంగా పూర్తవుతాయి.`,
        ta: `இந்த '99% தடை முடிச்சு' உங்கள் உழைப்பின் குறைபாடு அல்ல, மாந்தியின் காரகத்துவத்தால் வரும் கண்ணுக்குத் தெரியாத தடை. இதற்குரிய சாந்தி பரிகாரத்தை கோகர்ண திருத்தலத்தில் செய்வதன் மூலம் தடைபட்ட காரியங்கள் உடனே கைகூடும்.`,
        en: `This 99% bottleneck is never a deficiency of competence; it is a karmic knot seated in House ${maandiHouse}. Until this specific knot is ritually dissolved, purely worldly efforts feel like running on a treadmill. Untying this knot through authentic Vedic sanctum sankalpa immediately releases the stalled momentum.`
      }, targetLang),
      pick6({
        kn: `ಈ ಮಾಂದಿ ದೋಷ ಪರಿಹಾರಕ್ಕಾಗಿ: ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ ಮನೆಯ ನೈಋತ್ಯ (ದಕ್ಷಿಣ-ಪಶ್ಚಿಮ) ಮೂಲೆಯಲ್ಲಿ ಸಾಸಿವೆ ಎಣ್ಣೆಯ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ. ಜೊತೆಗೆ ಶ್ರೀ ರುದ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ತಿಲ-ತೈಲಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಈ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಮಸ್ತ ೯೯% ಗಂಟುಗಳು ಶಾಶ್ವತವಾಗಿ ಭಸ್ಮವಾಗುತ್ತವೆ.`,
        mr: `या मांदी दोषाच्या निवारणासाठी: दर शनिवारी संध्याकाळी घराच्या नैऋत्य कोपऱ्यात तिळाच्या तेलाचा दिवा लावा. तसेच गोकर्ण महाबळेश्वरास रुद्राभिषेक व तेलाचा अभिषेक करण्याचा संकल्प करावा, जेणेकरून जीवनातील अडथळे दूर होतील.`,
        hi: `मांदी ग्रंथि शमन हेतु: प्रत्येक शनिवार सायंकाल घर के नैऋत्य (दक्षिण-पश्चिम) कोण में तिल अथवा सरसों के तेल का दीपक जलाएं। साथ ही श्री गोकर्ण महाबलेश्वर पर रुद्राभिषेक एवं तिल-तैलाभिषेक का संकल्प लें। इससे समस्त अवरोध नष्ट होंगे।`,
        te: `మాంది దోష నివారణకు: ప్రతి శనివారం సాయంత్రం నైరుతి మూలలో నువ్వుల నూనె దీపం వెలిగించండి. గోకర్ణ మహాబలేశ్వరునికి తైలాభిషేకం చేయించడం ద్వారా ఆటంకాలు తొలగిపోతాయి.`,
        ta: `மாந்தி தோஷ நிவர்த்திக்கு: சனிக்கிழமைகளில் வீட்டின் நைருதி (தென்மேற்கு) மூலையில் நல்லெண்ணெய் தீபம் ஏற்றவும். கோகர்ண திருத்தலத்தில் ருத்ராபிஷேகம் செய்து வழிபட தடைகள் நீங்கி வெற்றி கிட்டும்.`,
        en: `To pacify Maandi's knot: Light a mustard or sesame oil lamp in the south-west sector of your residence every Saturday evening. Performing a consecrated Tailabhisheka at Sri Gokarna Mahabaleshwara permanently unbinds this restrictive seal.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "೯೯% ಗಂಟು ಪರಿಹಾರ",
      mr: "मांदी गाठ निवारण",
      hi: "मांदी ग्रंथि शमन",
      te: "మాంది నివారణ",
      ta: "மாந்தி தோஷ பரிகாரம்",
      en: "Maandi Knot Remedy"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಮನೆಯ ನೈಋತ್ಯ ಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಕಸ ಅಥವಾ ಹಳೆಯ ಮುರಿದ ವಸ್ತುಗಳಿರದಂತೆ ಸ್ವಚ್ಛವಾಗಿಡಿ. ಪ್ರತಿ ಶನಿವಾರ ಕಾಗೆಗಳಿಗೆ ಎಳ್ಳು ಬೆರೆಸಿದ ಅನ್ನವನ್ನು ನೀಡಿ.`,
      mr: `घराच्या नैऋत्य कोपऱ्यात भंगार किंवा नको असलेल्या वस्तू ठेवू नका. दर शनिवारी कावळ्यांना काळे तीळ मिश्रित भात खायला द्या.`,
      hi: `घर के नैऋत्य कोण को सर्वथा स्वच्छ रखें, वहां कबाड़ न जमा होने दें। शनिवार को कौओं को तिल मिश्रित अन्न अर्पित करें।`,
      te: `ఇంటి నైరుతి మూలను ఎప్పుడూ శుభ్రంగా ఉంచండి. శనివారం నల్ల నువ్వులతో కలిపిన అన్నాన్ని కాకులకు పెట్టండి.`,
      ta: `வீட்டின் தென்மேற்கு மூலையை சுத்தமாக வைத்திருக்கவும். சனிக்கிழமைகளில் காகத்திற்கு எள் கலந்த சாதம் வைக்கவும்.`,
      en: `Keep the south-west quadrant of your living space impeccably clean and free of broken clutter. Feed sesame-infused cooked rice to crows every Saturday morning.`
    }, targetLang)
  });

  // CHAPTER 5: Inner 3 Truths & Panchabhuta Elemental Balance
  chapters.push({
    chapterNumber: 5,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ಆತ್ಮದ ಆಂತರಿಕ ೩ ಪರಮ ಸತ್ಯಗಳು & ಪಂಚಭೂತ ತತ್ವಗಳ ಸಮತೋಲನ",
      mr: "आत्म्याचे ३ परम सत्य व पंचमहाभूत तत्त्वांचे संतुलन",
      hi: "आत्मा के ३ परम सत्य एवं पंचभूत संतुलन",
      te: "ఆత్మ యొక్క 3 పరమ సత్యాలు & పంచభూత తత్వాల సమతుల్యత",
      ta: "ஆன்மாவின் 3 உண்மைகள் & பஞ்சபூத சமநிலை",
      en: "Inner 3 Truths & Panchabhuta Elemental Balance"
    }, targetLang),
    icon: "🔥",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಮೂಲ ತತ್ವ ಮತ್ತು ಆತ್ಮದ ಆಂತರಿಕ ೩ ಅವಿಭಾಜ್ಯ ಗುಣಲಕ್ಷಣಗಳು ಯಾವುವು?`,
      mr: `प्रश्न: ${devoteeName}, आपले मूळ पंचमहाभूत तत्त्व व आत्म्याचे ३ अविभाज्य गुणधर्म कोणते आहेत?`,
      hi: `प्रश्न: ${devoteeName}, आपका मूल पंचभूत तत्त्व एवं आपकी आत्मा के ३ शाश्वत गुणधर्म क्या हैं?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జన్మ తత్వం & మీ ఆత్మ యొక్క 3 మూల లక్షణాలు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் மூல பஞ்சபூத தத்துவம் மற்றும் ஆன்மாவின் 3 பிரிக்க முடியாத குணங்கள் எவை?`,
      en: `Question: ${devoteeName}, what is your elemental Panchabhuta constitution and the 3 unalterable soul truths encoded in your chart?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}ಯ ಪಂಚಭೂತ ತತ್ವಗಳನ್ನು ಗ್ರಹಗಳ ಸಹಿತ ವಿಶ್ಲೇಷಿಸಿದಾಗ, ನಿಮ್ಮ ದೇಹ ಮತ್ತು ಮನಸ್ಸಿನಲ್ಲಿ '${dominantElement}' ಪ್ರಾಬಲ್ಯವು ಗೋಚರಿಸುತ್ತದೆ. ಮೊದಲನೆಯ ಪರಮ ಸತ್ಯವೆಂದರೆ: ನೀವು ಅನ್ಯಾಯ ಅಥವಾ ಸುಳ್ಳು ನಡವಳಿಕೆಯನ್ನು ಕ್ಷಮಿಸುವುದಿಲ್ಲ; ಮುಖಸ್ತುತಿ ಮಾಡುವವರನ್ನು ನೀವು ತಕ್ಷಣವೇ ಗುರುತಿಸಿ ದೂರವಿಡುತ್ತೀರಿ. ಎರಡನೆಯ ಸತ್ಯ: ನೀವು ಸ್ವಾಭಿಮಾನಿ, ಇತರರ ಮುಂದೆ ತಲೆಬಾಗಲು ನಿಮ್ಮ ಆತ್ಮ ಎಂದಿಗೂ ಸಮ್ಮತಿಸುವುದಿಲ್ಲ. ಮೂರನೆಯ ಸತ್ಯ: ನೀವು ಸದಾ ಇತರರಿಗೆ ನೆರವಾಗಲು ಬಯಸುತ್ತೀರಿ, ಆದರೆ ನಿಮ್ಮ ಸ್ವಂತ ಕಷ್ಟದಲ್ಲಿ ಯಾರಿಗೂ ಹೊರೆಯಾಗಲು ಇಷ್ಟಪಡುವುದಿಲ್ಲ.`,
        mr: `${devoteeName}, आपले ${lagnaRashiName} लग्न व ${moonRashiName} चंद्र राशीनुसार आपल्या सर्व ग्रहांच्या संयुक्त्त अभ्यासातून व्यक्तिमत्त्वात '${dominantElement}' प्राबल्य दिसून येते. आपले पहिले सत्य: आपण कधीही अन्याय किंवा खोटेपणा सहन करत नाही; खोट्या स्तुती करणाऱ्यांना लगेच ओळखता. दुसरे सत्य: आपला स्वाभिमान अत्यंत जागृत आहे, कोणापुढे लाचार होणे आपल्याला मान्य नाही. तिसरे सत्य: आपण नेहमी गरजूंना मदत करता, पण स्वतःच्या दुःखात कोणावर ओझे बनू इच्छित नाही.`,
        hi: `${devoteeName}, आपके ${lagnaRashiName} लग्न, ${moonRashiName} चंद्र राशि एवं समस्त ग्रहों के विश्लेषण से विदित होता है कि आपके स्वभाव में '${dominantElement}' की प्रधानता है। आपकी आत्मा का प्रथम सत्य: आप पाखंड एवं अन्याय को कभी क्षमा नहीं करते, चापलूसी करने वालों को तुरंत भांप लेते हैं। द्वितीय सत्य: आपका स्वाभिमान प्रखर है, किसी के समक्ष गिड़गिड़ाना आपके स्वभाव में नहीं है। तृतीय सत्य: आप सर्वदा परोपकार हेतु तत्पर रहते हैं, किंतु अपनी पीड़ा में किसी पर भार नहीं बनना चाहते।`,
        te: `${devoteeName}, మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశి మరియు గ్రహ స్థితుల ప్రకారం మీలో '${dominantElement}' ఆధిక్యత ఉంది. మీ మొదటి సత్యం: మీరు అన్యాయాన్ని అసలు సహించరు. రెండవ సత్యం: మీ ఆత్మాభిమానం చాలా ఉన్నతమైనది. మూడవ సత్యం: ఇతరులకు సహాయం చేయడానికి ముందుంటారు కానీ మీ కష్టంలో ఎవరికీ భారం కారు.`,
        ta: `${devoteeName}, உங்கள் ${lagnaRashiName} லக்னம், ${moonRashiName} ராசி மற்றும் கிரகங்களின் அடிப்படையில் உங்களிடம் '${dominantElement}' ஆதிக்கம் உள்ளது. முதல் உண்மை: அநீதியையும் போலித்தனத்தையும் ஒருபோதும் சகிக்க மாட்டீர்கள். இரண்டாவது உண்மை: உங்கள் சுயமரியாதையை எவரிடமும் விட்டுத்தர மாட்டீர்கள். மூன்றாவது உண்மை: பிறருக்கு உதவத் துடிப்பீர்கள், ஆனால் உங்கள் சுமையை எவர் மீதும் சுமத்த மாட்டீர்கள்.`,
        en: `${devoteeName}, synthesizing all seven classic Grahas alongside your ${lagnaRashiName} ascendant and ${moonRashiName} Moon reveals an authentic '${dominantElement}' natal temperament. Your first soul truth is an uncompromising allergy to deceit and sycophancy; you instantly sense false pretenses. Your second truth is fierce sovereign self-respect; you endure hardship silently rather than beg. Your third truth is instinctual generosity; you shelter others while refusing to burden anyone.`
      }, targetLang),
      elementRemedyAdvice6L,
      pick6({
        kn: `ದೈನಂದಿನ ತತ್ವ ಸಮತೋಲನಕ್ಕಾಗಿ: ದಿನಕ್ಕೆ ಸಾಕಷ್ಟು ಶುದ್ಧ ನೀರನ್ನು ಕುಡಿಯಿರಿ, ಬೆಳ್ಳಿ ಅಥವಾ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರನ್ನು ಶೇಖರಿಸಿ ಕುಡಿಯುವುದು ಅತ್ಯುತ್ತಮ. ಪೂರ್ಣಿಮೆಯ ದಿನ ಚಂದ್ರನ ಬೆಳಕಿನಲ್ಲಿ ಹಾಗೂ ಮುಂಜಾನೆ ಉದಯ ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ೧೦ ನಿಮಿಷ ಕುಳಿತುಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಪಂಚಭೂತ ಶಾಂತಿಗೆ ದಿವ್ಯ ಔಷಧಿಯಾಗಿದೆ.`,
        mr: `तत्त्व संतुलनासाठी: पुरेसे पाणी प्या, चांदीच्या किंवा तांब्याच्या भांड्यातील पाणी पिणे शुभ ठरेल. सकाळच्या कोवळ्या उन्हात व पौर्णिमेच्या रात्री १० मिनिटे ध्यान करा, चित्त प्रसन्न राहील.`,
        hi: `तत्त्व संतुलन हेतु उपाय: पर्याप्त जल का सेवन करें, चांदी अथवा ताम्र पात्र में रखा जल लाभकारी है। प्रातः उगते सूर्य एवं पूर्णिमा के चंद्र के समक्ष १० मिनट शांत ध्यान करें, आत्मिक संतुलन मिलेगा।`,
        te: `తత్వ సమతుల్యత కొరకు: రోజూ తగినంత నీరు త్రాగండి, వెండి లేదా రాగి పాత్రలో నీరు త్రాగడం శుభం. ఉదయ సూర్యకిరణాల్లో మరియు వెన్నెల్లో 10 నిమిషాలు గడపండి.`,
        ta: `தத்துவ சமநிலைக்கு: வெள்ளி அல்லது செம்பு பாத்திரத்தில் தண்ணீர் குடிப்பது நல்லது. அதிகாலை சூரிய ஒளியிலும் பௌர்ணமி நிலவொளியில் 10 நிமிடங்கள் தியானிப்பது மன சமநிலை தரும்.`,
        en: `To anchor elemental equilibrium: Hydrate mindfully using water rested in silver or copper vessels, and harmonize both solar and lunar rhythms with 10 minutes of quiet breathing at dawn or under gentle moonlight.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "ಪಂಚಭೂತ ತತ್ವ ಸಾಮರಸ್ಯ",
      mr: "पंचतत्त्व समतोल",
      hi: "पंचतत्त्व सामंजस्य",
      te: "పంచభూత సమతుల్యత",
      ta: "பஞ்சபூத சமநிலை",
      en: "Elemental Harmonization"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಕೋಪ ಅಥವಾ ಆವೇಶ ಬಂದಾಗ ತಕ್ಷಣ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ೩ ದೀರ್ಘ ಉಸಿರು ತೆಗೆದುಕೊಂಡು ಶಾಂತರಾಗಿ ಪ್ರತಿಕ್ರಿಯಿಸಿ.`,
      mr: `रागाच्या भरात कधीही महत्त्वाचे निर्णय घेऊ नका. ३ दीर्घ श्वास घेऊन मगच शांतपणे व्यक्त व्हा.`,
      hi: `क्रोध अथवा उत्तेजना के क्षणों में कोई निर्णय न लें। ३ गहरे श्वास लेकर स्वयं को शांत करें, फिर विचार करें।`,
      te: `కోపంలో ఎటువంటి నిర్ణయాలు తీసుకోకండి. 3 దీర్ఘ శ్వాసలు తీసుకుని ప్రశాంతంగా స్పందించండి.`,
      ta: `கோபத்தில் இருக்கும்போது எந்த முக்கிய முடிவையும் எடுக்காதீர்கள். ஆழமாக மூச்சை இழுத்து விட்டு அமைதியாகுங்கள்.`,
      en: `Never execute critical decisions under emotional surges. Take three conscious diaphragmatic breaths before responding.`
    }, targetLang)
  });

  // CHAPTER 6: Core Personality, Lucky Yogi Wealth Planet & Avayogi Warning
  chapters.push({
    chapterNumber: 6,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ವ್ಯಕ್ತಿತ್ವದ ಗರಿಷ್ಠ ಬಲ, ಧನ ಭಾಗ್ಯೋದಯದ ಯೋಗಿ ಗ್ರಹ & ಅವಯೋಗಿ ಎಚ್ಚರಿಕೆ",
      mr: "व्यक्तिमत्त्व, धन भाग्योदयाचा योगी ग्रह व अवयोगी सावधगिरी",
      hi: "व्यक्तित्व का पराक्रम, धन प्रदाता योगी ग्रह एवं अवयोगी चेतावनी",
      te: "వ్యక్తిత్వ బలం, ధన భాగ్య యోగి గ్రహం & అవయోగి హెచ్చరిక",
      ta: "ஆளுமை பலம், யோகி தனக்காரகன் & அவயோகி எச்சரிக்கை",
      en: "Core Personality, Lucky Yogi Wealth Planet & Avayogi Warning"
    }, targetLang),
    icon: "💎",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಅದೃಷ್ಟ ಹಾಗೂ ಸಂಪತ್ತಿನ ಆಯಸ್ಕಾಂತವಾಗಿರುವ 'ಯೋಗಿ ಗ್ರಹ' ಮತ್ತು ನಿಗೂಢ ನಷ್ಟ ತರುವ 'ಅವಯೋಗಿ ಗ್ರಹ' ಯಾವುದು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत धन व समृद्धी आकर्षित करणारा 'योगी ग्रह' आणि गुप्त अडथळा आणणारा 'अवयोगी ग्रह' कोणता आहे?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में धन एवं सौभाग्य का चुंबक बनने वाला 'योगी ग्रह' तथा अप्रत्याशित संकट लाने वाला 'अवयोगी ग्रह' कौन सा है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ కుండలిలో ధనాన్ని ఆకర్షించే 'యోగి గ్రహం' మరియు అడ్డంకులు కలిగించే 'అవయోగి గ్రహం' ఏవి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் செல்வத்தை ஈர்க்கும் 'யோகி கிரகம்' மற்றும் மறைமுக நஷ்டத்தை தரும் 'அவயோகி கிரகம்' எது?`,
      en: `Question: ${devoteeName}, which planet functions as your secret Yogi wealth magnet, and which planet acts as the Avayogi stumbling block in your financial destiny?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ರಹಸ್ಯ ದಕ್ಷಿಣ ಭಾರತೀಯ ಗಣಿತದ ಪ್ರಕಾರ (ಸೂರ್ಯ ಸ್ಪಷ್ಟ + ಚಂದ್ರ ಸ್ಪಷ್ಟ + ೯೩° ೨೦'), ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪರಮ ಶ್ರೇಷ್ಠ 'ಯೋಗಿ ಗ್ರಹ' '${yogiPlanetName}' ಆಗಿದೆ. ಈ ಯೋಗಿ ಗ್ರಹವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅದೃಷ್ಟ, ಧನಲಾಭ ಹಾಗೂ ಗೌರವವನ್ನು ಆಕರ್ಷಿಸುವ ದೈವಿಕ ಆಯಸ್ಕಾಂತವಾಗಿದೆ. ಯೋಗಿ ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಶುಭ ದಿನ '${localizedYogiDay}', ಶುಭ ಬಣ್ಣ '${localizedYogiColor}', ಹಾಗೂ ಮಂಗಳಕರ ದಿಕ್ಕು '${localizedYogiDirection}'. ಯಾವುದೇ ಪ್ರಮುಖ ಆರ್ಥಿಕ ಒಪ್ಪಂದ ಅಥವಾ ಹೊಸ ಉದ್ಯಮವನ್ನು ಈ ದಿನದಂದು ಆರಂಭಿಸಿದರೆ ವಿಜಯ ನಿಶ್ಚಿತ.`,
        mr: `${devoteeName}, दक्षिण भारतीय गूढ गणितानुसार (सूर्य स्पष्ट + चंद्र स्पष्ट + ९३° २०'), आपल्या पत्रिकेचा सर्वश्रेष्ठ 'योगी ग्रह' '${yogiPlanetName}' आहे. हा ग्रह आपल्या जीवनात धन, वैभव व यश खेचून आणणारा चुंबकीय ग्रह आहे. या ग्रहाचा शुभ वार '${localizedYogiDay}', शुभ रंग '${localizedYogiColor}' व शुभ दिशा '${localizedYogiDirection}' आहे. नवीन व्यवहार या दिवशी सुरू केल्यास मोठा लाभ होतो.`,
        hi: `${devoteeName}, प्राचीन दक्षिण भारतीय रहस्य गणित (सूर्य स्पष्ट + चंद्र स्पष्ट + ९३° २०') के अनुसार, आपकी कुंडली का परम कल्याणकारी 'योगी ग्रह' '${yogiPlanetName}' है। यह ग्रह आपके जीवन में धन, ऐश्वर्य एवं सौभाग्य को आकर्षित करने वाला दिव्य चुंबक है। इस ग्रह का शुभ दिन '${localizedYogiDay}', शुभ रंग '${localizedYogiColor}' एवं शुभ दिशा '${localizedYogiDirection}' है। महत्वपूर्ण वित्तीय निर्णय इस दिन लेना अत्यंत श्रेयस्कर है।`,
        te: `${devoteeName}, దక్షిణ భారత రహస్య జ్యోతిష లెక్కల ప్రకారం మీ 'యోగి గ్రహం' '${yogiPlanetName}'. ఈ గ్రహం మీకు సంపద, గౌరవం తెచ్చిపెట్టే అద్భుత గ్రహం. దీని శుభ వారం '${localizedYogiDay}', రంగు '${localizedYogiColor}' మరియు దిశ '${localizedYogiDirection}' లను అనుసరించడం ద్వారా గొప్ప విజయాలు లభిస్తాయి.`,
        ta: `${devoteeName}, ரகசிய ஜோதிடக் கணக்கீட்டின்படி உங்கள் 'யோகி கிரகம்' '${yogiPlanetName}'. இந்த கிரகம் அதிர்ஷ்டத்தையும் தனலாபத்தையும் அள்ளித் தரும். இதன் சுப கிழமை '${localizedYogiDay}', சுப நிறம் '${localizedYogiColor}' மற்றும் சுப திசை '${localizedYogiDirection}' ஆகியவற்றை பின்பற்றி முக்கிய பணிகளைத் தொடங்கினால் வெற்றி நிச்சயம்.`,
        en: `${devoteeName}, derived via classical South Indian mathematical coordinates ((Sun + Moon + 93°20') % 360), your authentic Yogi Wealth Magnet is '${yogiPlanetName}'. This celestial ally is your innate attractor of prosperity, financial breakthroughs, and prestige. Aligning significant commercial launches with its auspicious day '${localizedYogiDay}', wealth frequency color '${localizedYogiColor}', and sacred direction '${localizedYogiDirection}' acts as a celestial catalyst.`
      }, targetLang),
      pick6({
        kn: `ಮತ್ತೊಂದೆಡೆ, ಯೋಗಿ ಬಿಂದುವಿಗೆ ೧೮೬° ೪೦' ದೂರದಲ್ಲಿರುವ 'ಅವಯೋಗಿ ಗ್ರಹ' '${avayogiPlanetName}' ಆಗಿದೆ. ಈ ಅವಯೋಗಿ ಗ್ರಹವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಖರ್ಚು, ತಪ್ಪು ಹೂಡಿಕೆ ಅಥವಾ ನಂಬಿಕೆ ದ್ರೋಹದ ಮೂಲಕ ಹಣ ನಷ್ಟವಾಗುವಂತೆ ಮಾಡುವ ಗುಪ್ತ ಶತ್ರುವಾಗಿದೆ. ಈ ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಾರ ಅಥವಾ ತಿಥಿಗಳಲ್ಲಿ ಯಾವುದೇ ಸಾಲ ನೀಡುವುದು, ಹೊಸ ಪಾಲುದಾರಿಕೆ ಮಾಡುವುದು ಅಥವಾ ಜೂಜು-ಊಹಾತ್ಮಕ ಹೂಡಿಕೆ ಮಾಡುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ತಪ್ಪಿಸಬೇಕು.`,
        mr: `दुसऱ्या बाजूला, योगी बिंदूच्या १८६° ४०' अंतरावर असलेला 'अवयोगी ग्रह' '${avayogiPlanetName}' आहे. हा ग्रह अचानक होणारे नुकसान, चुकीची गुंतवणूक किंवा फसवणुकीचे कारण बनू शकतो. या ग्रहाच्या दिवशी कोणालाही उसने पैसे देणे किंवा धोकादायक आर्थिक व्यवहार करणे कटाक्षाने टाळावे.`,
        hi: `दूसरी ओर, योगी बिंदु से १८६° ४०' की दूरी पर स्थित 'अवयोगी ग्रह' '${avayogiPlanetName}' है। यह ग्रह अप्रत्याशित व्यय, भ्रामक निवेश अथवा विश्वासघात के द्वारा धन हानि करा सकता है। इस ग्रह से संबंधित दिनों में किसी को ऋण देना अथवा सट्टेबाजी में धन लगाना सर्वथा वर्जित रखें।`,
        te: `మరోవైపు మీ 'అవయోగి గ్రహం' '${avayogiPlanetName}'. ఈ గ్రహం అకస్మాత్తుగా ధన నష్టాన్ని కలిగించగలదు. దీని ప్రభావం ఉన్న రోజులలో ఎవరికీ అప్పులు ఇవ్వవద్దు.`,
        ta: `மறுபுறம் உங்கள் 'அவயோகி கிரகம்' '${avayogiPlanetName}'. இது எதிர்பாராத நஷ்டங்களையும் விரயங்களையும் தரக்கூடியது. இதன் நாட்களில் புதிய முதலீடுகள் செய்வதையோ கடன் கொடுப்பதையோ தவிர்க்கவும்.`,
        en: `Conversely, offset 186°40' from your Yogi point lies your Avayogi planet '${avayogiPlanetName}'. This planet represents your Achilles' heel—governing blind spots, speculative losses, or unvetted loans. Never extend unsecured credit or ink contracts on its associated days.`
      }, targetLang),
      pick6({
        kn: `ನಿಮ್ಮ ಸಂಪತ್ತನ್ನು ದ್ವಿಗುಣಗೊಳಿಸಲು: ಯೋಗಿ ಗ್ರಹವಾದ ${yogiPlanetName} ದೇವತೆಯನ್ನು (${localizedYogiDeity}) ನಿಯಮಿತವಾಗಿ ಆರಾಧಿಸಿ. ಲಗ್ನ ಶಾಸ್ತ್ರ ನಿಯಮದ ಪ್ರಕಾರ ಯೋಗಿ ರತ್ನ/ಧಾರಣಾ ಮಾರ್ಗ: ${localizedYogiGemstone}. ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ತಾಮ್ರ ಅಥವಾ ಬೆಳ್ಳಿಯ ನಾಣ್ಯವನ್ನು ಇಟ್ಟು ಪೂಜಿಸುವುದು ಧನಾಕರ್ಷಣೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`,
        mr: `संपत्ती वाढवण्यासाठी: योगी ग्रह ${yogiPlanetName} ची (${localizedYogiDeity}) नियमित उपासना करा. लग्न मर्यादेनुसार रत्न/उपाय मार्गदर्शन: ${localizedYogiGemstone}. तिजोरीत चांदीचे नाणे ठेवून पूजा केल्यास धन स्थिर राहील.`,
        hi: `समृद्धि संवर्धन हेतु: योगी ग्रह ${yogiPlanetName} के इष्टदेव (${localizedYogiDeity}) की उपासना करें। पाराशरी लग्न मर्यादानुसार रत्न एवं उपाय निर्देश: ${localizedYogiGemstone}। पूजा स्थल पर चांदी का सिक्का स्थापित करना शुभ है।`,
        te: `ధనవృద్ధి కొరకు: యోగి గ్రహమైన ${yogiPlanetName} అధిదేవతను (${localizedYogiDeity}) ఆరాధించండి. పరాశర నియమ ప్రకారం మార్గదర్శనం: ${localizedYogiGemstone}. పూజా గదిలో వెండి నాణెం ఉంచి పూజించడం శ్రేయస్కరం.`,
        ta: `செல்வம் பெருக: யோகி கிரகமான ${yogiPlanetName}-ன் அதிதேவதையை (${localizedYogiDeity}) வழிபடவும். லக்ன விதிப்படி வழிகாட்டல்: ${localizedYogiGemstone}. பூஜை அறையில் வெள்ளி நாணயம் வைத்து வழிபட நலம் உண்டாகும்.`,
        en: `To optimize wealth retention: Propitiate your Yogi planet ${yogiPlanetName}'s presiding deity (${localizedYogiDeity}). Classical Parashari Lagna Guard on gem alignment: ${localizedYogiGemstone}. Keeping a consecrated silver coin at your shrine grounds lasting abundance.`
      }, targetLang)
    ],
    guidanceBadge: pick6({
      kn: "ಧನ ಆಕರ್ಷಣಾ ರಹಸ್ಯ",
      mr: "धन आकर्षण रहस्य",
      hi: "धन आकर्षण रहस्य",
      te: "ధన ఆకర్షణ రహస్యం",
      ta: "தன ஆகர்ஷண ரகசியம்",
      en: "Wealth Magnet Activation"
    }, targetLang),
    practicalGuidance: pick6({
      kn: `ಮುಖ್ಯ ಆರ್ಥಿಕ ಕೆಲಸಗಳಿಗೆ ಯೋಗಿ ಬಣ್ಣವಾದ '${localizedYogiColor}' ಬಣ್ಣದ ವಸ್ತ್ರ ಅಥವಾ ಕರವಸ್ತ್ರವನ್ನು ಬಳಸಿ.`,
      mr: `महत्त्वाच्या आर्थिक व्यवहारांच्या वेळी योगी ग्रहाचा शुभ रंग (${localizedYogiColor}) आवर्जून वापरा.`,
      hi: `महत्वपूर्ण वित्तीय कार्यों के समय अपने योगी रंग (${localizedYogiColor}) के वस्त्र अथवा रुमाल का प्रयोग करें।`,
      te: `ముఖ్యమైన పనులకు వెళ్లేటప్పుడు మీ యోగి రంగు (${localizedYogiColor}) వస్త్రాన్ని లేదా రుమాలును ధరించండి.`,
      ta: `முக்கிய பண விஷயங்களுக்கு செல்லும்போது யோகி நிற (${localizedYogiColor}) கைக்குட்டையை உடன் வைத்திருக்கவும்.`,
      en: `Incorporate your Yogi planet's lucky color (${localizedYogiColor}) into your attire or pocket square during high-stakes financial negotiations.`
    }, targetLang)
  });


  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: THE PLANETARY POWER MATRIX (Chapters 7 to 11)
  // ──────────────────────────────────────────────────────────────────────────
  const sec2 = pick6({
    kn: "ವಿಭಾಗ ೨: ಕಾಲಚಕ್ರದ ಮಹಾಬಲ & ಗ್ರಹ ಗೋಚಾರ ವಾಸ್ತವ",
    mr: "विभाग २: कालचक्राचे महाबल व ग्रह गोचर वास्तव",
    hi: "खंड २: कालचक्र का महाबल एवं ग्रह गोचर यथार्थ",
    te: "విభాగం 2: కాలచక్ర మహాబలం & గ్రహ గోచార వాస్తవం",
    ta: "பிரிவு 2: காலச்சக்கர மகாபலம் & கிரக கோசார உண்மை",
    en: "Section 2: The Planetary Power Matrix — Active Dasha & Transits"
  }, targetLang);

  // CHAPTER 7: Current Mahadasha & Bhukti Reality (Core V1 Section)
  chapters.push({
    chapterNumber: 7,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ - ಅಂತರ್ದಶೆ & ಅಧಿಪತಿ ಗ್ರಹಗಳ ರಕ್ಷಣಾ ಕವಚ",
      mr: "चालू महादशा - अंतर्दशा व स्वामी ग्रहांचे संरक्षक कवच",
      hi: "वर्तमान महादशा - अंतर्दशा एवं अधिपति ग्रहों का रक्षा कवच",
      te: "ప్రస్తుత మహర్దశ - అంతర్దశ & అధిపతి గ్రహాల రక్షణ కవచం",
      ta: "நடப்பு மகாதசை - அந்தர்தசை & ஆளும் கிரகங்களின் பாதுகாப்பு கவசம்",
      en: "Current Mahadasha & Bhukti Reality — Active Karmic Climate"
    }, targetLang),
    icon: "🪐",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನವನ್ನು ಆಳುತ್ತಿರುವ ${currentMahadasha} ಮಹಾದಶೆ ಹಾಗೂ ${currentBhuktiLord} ಅಂತರ್ದಶೆಯ ನೈಜ ಪ್ರಭಾವವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, सध्या आपल्या आयुष्यावर प्रभाव टाकणारी ${currentMahadasha} महादशा व ${currentBhuktiLord} अंतर्दशेचा खरा प्रभाव काय?`,
      hi: `प्रश्न: ${devoteeName}, आपके जीवन को संचालित करने वाली वर्तमान ${currentMahadasha} महादशा एवं ${currentBhuktiLord} अंतर्दशा का यथार्थ प्रभाव क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, ప్రస్తుతం మీ జీవితాన్ని నడిపిస్తున్న ${currentMahadasha} మహర్దశ మరియు ${currentBhuktiLord} అంతర్దశ యొక్క అసలైన ప్రభావం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, தற்போது உங்கள் வாழ்க்கையை வழிநடத்தும் ${currentMahadasha} மகாதசை மற்றும் ${currentBhuktiLord} அந்தர்தசையின் உண்மையான தாக்கம் என்ன?`,
      en: `Question: ${devoteeName}, what is the exact operational reality of your running ${currentMahadasha} Mahadasha and ${currentBhuktiLord} Bhukti?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದ ಪರಮ ಸತ್ಯವೇನೆಂದರೆ ದಶೆಗಳೇ ಮನುಷ್ಯನ ಹಣೆಬರಹವನ್ನು ಕಾರ್ಯರೂಪಕ್ಕೆ ತರುವ ಕಾಲಪುರುಷನ ಕೈಗಳು. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ${currentMahadasha} ಮಹಾದಶೆಯು ನಡೆಯುತ್ತಿದ್ದು, ಇದರೊಂದಿಗೆ ${currentBhuktiLord} ಅಂತರ್ದಶೆಯು ಸಕ್ರಿಯವಾಗಿದೆ. ಈ ಎರಡು ಗ್ರಹಗಳ ಪರಸ್ಪರ ಸಂಬಂಧವು ನಿಮ್ಮ ದೈನಂದಿನ ಚಿಂತನೆ, ವೃತ್ತಿ ಯೋಜನೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳ ಮೇಲೆ ನೇರ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ. ${isDashaSandhi ? "ವಿಶೇಷ ಎಚ್ಚರಿಕೆ: ನೀವು ಪ್ರಸ್ತುತ 'ದಶಾ ಸಂಧಿ' (ಒಂದು ಮಹಾದಶೆ ಮುಗಿದು ಇನ್ನೊಂದು ಪ್ರಾರಂಭವಾಗುವ ಅತ್ಯಂತ ಸಂವೇದನಾಶೀಲ ಕಾಲಘಟ್ಟ)ಯಲ್ಲಿದ್ದೀರಿ. ಈ ಸಮಯದಲ್ಲಿ ಹಠಾತ್ ಹೊಸ ಹೂಡಿಕೆ ಅಥವಾ ಉದ್ಯೋಗ ಬದಲಾವಣೆಗಿಂತ ಮುನ್ನ ಎಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಅತ್ಯಾವಶ್ಯಕ." : "ದಶಾನಾಥರು ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನಕ್ಕೆ ಪೂರಕವಾದ ಸತ್ಫಲಗಳನ್ನು ನೀಡುವ ಸನ್ನದ್ಧತೆಯಲ್ಲಿದ್ದಾರೆ."}`,
        mr: `${devoteeName}, ज्योतिषशास्त्राचा मूलभूत नियम आहे की दशाच माणसाचे नशीब घडवतात. सध्या आपल्या ${lagnaRashiName} लग्नासाठी ${currentMahadasha} महादशा व ${currentBhuktiLord} अंतर्दशा सुरू आहे. हे दोन ग्रह आपल्या दैनंदिन निर्णय, नोकरी-व्यवसाय आणि कौटुंबिक स्थितीवर मोठा प्रभाव टाकत आहेत. ${isDashaSandhi ? "महत्त्वाची सूचना: आपण सध्या 'दशा संधिक' काळातून जात आहात. हा काळ संक्रमणशील असल्याने घाईघाईत कोणताही मोठा निर्णय घेणे टाळावे." : "दशा स्वामी आपल्याला योग्य दिशेने नेण्यासाठी अनुकूल आहेत."}`,
        hi: `${devoteeName}, ज्योतिष शास्त्र के सिद्धांत के अनुसार दशाएं ही प्रारब्ध के कर्मों को प्रकट करती हैं। आपके ${lagnaRashiName} लग्न के लिए वर्तमान में ${currentMahadasha} महादशा के साथ ${currentBhuktiLord} अंतर्दशा प्रभावी है। इन दोनों अधिपति ग्रहों का परस्पर संबंध आपके करियर, धन प्रवाह और मानसिक शांति पर गहरा असर डाल रहा है। ${isDashaSandhi ? "अति-संवेदनशील सूचना: आप 'दशा संधि' के नाज़ुक दौर में हैं। इस संधिकाल में किसी भी प्रकार का अनावश्यक आर्थिक जोखिम न लें और पुरानी योजनाओं को ही मजबूत करें।" : "दशाधिपति ग्रह आपके पक्ष में शुभ फल देने हेतु तत्पर हैं।"}`,
        te: `${devoteeName}, జ్యోతిష్య శాస్త్రం ప్రకారం దశలే జీవిత గమనాన్ని నిర్దేశిస్తాయి. మీ ${lagnaRashiName} లగ్నానికి ప్రస్తుతం ${currentMahadasha} మహాదశ మరియు ${currentBhuktiLord} అంతర్దశ నడుస్తున్నాయి. ${isDashaSandhi ? "ముఖ్య గమనిక: మీరు 'దశా సంధి' కాలంలో ఉన్నందున కొత్త రిస్క్‌లు తీసుకోకుండా ప్రస్తుత పనులను నిలకడగా కొనసాగించడం శ్రేయస్కరం." : "దశానాథులు మీకు శుభ ఫలితాలు అందించడానికి సిద్ధంగా ఉన్నారు."}`,
        ta: `${devoteeName}, ஜோதிட சாஸ்திரப்படி மனிதனின் விதியை செயல்படுத்தும் காலச்சக்கரமே தசாபுக்தியாகும். உங்கள் ${lagnaRashiName} லக்னத்திற்கு இப்போது ${currentMahadasha} மகாதசையும் ${currentBhuktiLord} அந்தர்தசையும் இயங்கி வருகின்றன. ${isDashaSandhi ? "முக்கிய எச்சரிக்கை: நீங்கள் 'தசா சந்தி' காலகட்டத்தில் உள்ளதால் அவசர முடிவுகளையும் புதிய கடன்களையும் தவிர்க்கவும்." : "தசா நாதர்கள் உங்களுக்கு நற்பலன்களைத் தர சாதகமாக உள்ளனர்."}`,
        en: `${devoteeName}, in classical Parashari Jyotish, Vimshottari Dashas are the supreme clockwork that awakens dormant natal promises. Your ${lagnaRashiName} ascendant is currently traversing ${currentMahadasha} Mahadasha modulated by ${currentBhuktiLord} Bhukti. ${isDashaSandhi ? "CRITICAL VEDIC TRANSITION ALERT: You are traversing a Dasha Sandhi threshold (the twilight transition between two major planetary epochs). Consolidate your existing assets and emotional boundaries rather than embarking on high-friction adventures." : "Your dasha dispositors are dynamically aligned to translate sustained labor into tangible progress."}`
      }, targetLang),
      pick6({
        kn: `ಈ ದಶಾ-ಭುಕ್ತಿ ಅವಧಿಯ ಆಂತರಿಕ ಮಾನಸಿಕ ವಾತಾವರಣವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸಿದಾಗ: ${currentMahadasha} ಗ್ರಹವು ನಿಮ್ಮಲ್ಲಿ ಒಂದು ದೊಡ್ಡ ಗುರಿಯನ್ನು ಸಾಧಿಸುವ ಛಲವನ್ನು ಹುಟ್ಟಿಸುತ್ತಿದ್ದರೆ, ${currentBhuktiLord} ಗ್ರಹವು ಪ್ರಾಯೋಗಿಕ ಅಡೆತಡೆಗಳ ಮೂಲಕ ನಿಮ್ಮ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದೆ. ಇದು ಕೇವಲ ಬಾಹ್ಯ ಸಂಘರ್ಷವಲ್ಲ, ಬದಲಾಗಿ ನಿಮ್ಮ ಅಂತರಂಗದ ಶಕ್ತಿಯನ್ನು ಪಕ್ವಗೊಳಿಸಲು ಪ್ರಕೃತಿಯು ರೂಪಿಸಿರುವ ಒಂದು ದೈವಿಕ ತರಬೇತಿಯಾಗಿದೆ.`,
        mr: `या काळातील मानसिक परिस्थिती पाहता: ${currentMahadasha} ग्रह आपल्यामध्ये मोठी महत्त्वाकांक्षा निर्माण करत आहे, तर ${currentBhuktiLord} ग्रह प्रत्यक्ष जीवनात लहान-सहान अडचणी निर्माण करून आपली संयमशक्ती तपासत आहे. हे बाह्य संकट नसून आपले चारित्र्य व आत्मबल घडवणारी ईश्वरीय परीक्षा आहे.`,
        hi: `इस दशा-अंतर्दशा के अंतर्गत आपकी मनोदशा का विश्लेषण: ${currentMahadasha} ग्रह आपके भीतर एक विस्तृत लक्ष्य प्राप्त करने की प्रेरणा जगा रहा है, जबकि ${currentBhuktiLord} ग्रह व्यावहारिक चुनौतियों द्वारा आपके धैर्य की परीक्षा ले रहा है। यह बाधा नहीं, अपितु आपकी आंतरिक परिपक्वता का प्राकृतिक साधन है।`,
        te: `ఈ దశలో మీ మనస్సు ఒక వైపు పెద్ద ఆశయాల వైపు పరుగెడుతుండగా, మరోవైపు చిన్న అడ్డంకులు సహనాన్ని పరీక్షిస్తున్నాయి. ఇది మీ ఆత్మవిశ్వాసాన్ని మరింత బలపరచడానికి కాలం ఇచ్చిన అవకాశం.`,
        ta: `இந்த தசா-புக்தி காலத்தில்: ${currentMahadasha} கிரகம் பெரிய லட்சியத்தை நோக்கி உங்களை உந்தினாலும், ${currentBhuktiLord} கிரகம் நடைமுறைச் சவால்கள் மூலம் உங்கள் பொறுமையை சோதிக்கிறது. இது தடங்கலல்ல; உங்கள் ஆன்மாவை பக்குவப்படுத்தும் இறைவனின் பயிற்சி.`,
        en: `Examining the psychological terrain of this dasha chapter: while the Mahadasha lord ${currentMahadasha} fuels expansive ambitions, the sub-period lord ${currentBhuktiLord} introduces tactical reality checks to test your resilience. This friction is not punitive; it is the cosmic chisel refining your discernment.`
      }, targetLang),
      pick6({
        kn: `ದಶಾ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಸತ್ಫಲ ಪ್ರಾಪ್ತಿಗಾಗಿ: ${currentMahadasha} ಗ್ರಹದ ಅಧಿದೇವತೆಯನ್ನು ನಿತ್ಯವೂ ಆರಾಧಿಸಿ. ವಿಶೇಷವಾಗಿ ಪ್ರತಿ ಸಂಜೆ ಶುದ್ಧ ತುಪ್ಪದ ದೀಪವನ್ನು ಹಚ್ಚಿ 'ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ' ಅಷ್ಟೋತ್ತರ ಶತನಾಮಾವಳಿಯನ್ನು ಪಠಿಸುವುದರಿಂದ ದಶೆಯ ಅಶುಭ ಪ್ರಭಾವಗಳು ಭಸ್ಮವಾಗಿ, ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.`,
        mr: `दोष निवारण व शुभ फळांसाठी: ${currentMahadasha} ग्रहाच्या देवतेची नित्य उपासना करा. दररोज संध्याकाळी तुपाचा दिवा लावून 'श्री गोकर्ण महाबळेश्वर' स्मरण केल्याने सर्व ग्रहांचे दोष शांत होऊन मन प्रसन्न राहील.`,
        hi: `दशा शांति एवं अनुकूलता हेतु: ${currentMahadasha} के अधिष्ठाता देव की आराधना करें। प्रतिदिन सायंकाल देशी घी का दीपक प्रज्वलित कर 'श्री गोकर्ण महाबलेश्वर' का स्मरण करने से मानसिक तनाव दूर होगा और कार्य सुगम होंगे।`,
        te: `దశా శాంతి కొరకు: ${currentMahadasha} అధిదేవతను పూజించండి. రోజూ సాయంత్రం నేతి దీపం వెలిగించి గోకర్ణ మహాబలేశ్వరుని స్మరించడం వల్ల గ్రహ దోషాలు తొలగి మనశ్శాంతి లభిస్తుంది.`,
        ta: `தசா தோஷ நிவர்த்திக்கு: ${currentMahadasha} கிரகத்தின் அதிதேவதையை வழிபடவும். தினமும் மாலையில் நெய் தீபம் ஏற்றி ஸ்ரீ கோகர்ண மகாபலேஸ்வரரை மனதார வேண்டிக் கொண்டால் கிரக பீடைகள் நீங்கி அமைதி உண்டாகும்.`,
        en: `To propitiate this active period: Pay reverence to the presiding deity of ${currentMahadasha}. Lighting a pure cow-ghee lamp at twilight while invoking Sri Kshetra Gokarna Mahabaleshwara neutralizes residual malefic dasha waves and aligns your path with divine grace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ದಶಾ-ಭುಕ್ತಿ ನಿರ್ಣಯ", mr: "दशा-भुक्ती निर्णय", hi: "दशा-भुक्ति निर्णय", te: "దశా-భుక్తి నిర్ణయం", ta: "தசாபுத்தி கணிப்பு", en: "Vimshottari Protocol" }, targetLang),
    practicalGuidance: pick6({
      kn: `ಪ್ರಸ್ತುತ ದಶಾ ನಾಥರ ಅನುಗ್ರಹಕ್ಕಾಗಿ ವಾರಕ್ಕೊಮ್ಮೆ ಶಿವಲಿಂಗಕ್ಕೆ ಜಲಾಭಿಷೇಕ ಮಾಡಿ; ದಶಾ ಸಂಧಿಯ ಸೂಕ್ಷ್ಮತೆಯನ್ನು ಜಯಿಸಲು ಪ್ರತಿ ಮುಂಜಾನೆ ೫ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ನಡೆಸಿ.`,
      mr: `दशा स्वामींच्या कृपेसाठी आठवड्यातून एकदा शंकराच्या पिंडीवर जलाभिषेक करा व दररोज सकाळी ५ मिनिटे प्राणायाम करा.`,
      hi: `दशा स्वामी के शुभ प्रभाव हेतु सप्ताह में एक बार शिवलिंग पर जलाभिषेक करें एवं नित्य प्रातः ५ मिनट प्राणायाम करें।`,
      te: `దశా స్వామి అనుగ్రహం కొరకు వారానికి ఒకసారి శివాభిషేకం చేయండి మరియు ప్రతిరోజూ ఉదయం ప్రాణాయామం చేయండి.`,
      ta: `தசா நாதரின் அருளுக்கு வாரமொருமுறை சிவலிங்கத்திற்கு ஜலாபிஷேகம் செய்து, தினமும் காலையில் 5 நிமிடம் பிராணாயாமம் செய்யவும்.`,
      en: `Offer a fresh water abhisheka to the Shiva Linga once a week, and practice 5 minutes of mindful Pranayama daily to stabilize your neurological axis during this dasha.`
    }, targetLang)
  });

  // CHAPTER 8: Saturn (Shani) Gochara Impact & BAV Score
  chapters.push({
    chapterNumber: 8,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ಪ್ರಸ್ತುತ ಶನಿ ಗೋಚಾರ ಪ್ರಭಾವ, ಸಾಡೇಸಾತಿ/ಅಷ್ಟಮ ಶನಿ ನಿರ್ಣಯ & ಅಷ್ಟಕವರ್ಗ",
      mr: "सध्याचे शनी गोचर, साडेसाती/अष्टम शनी व अष्टकवर्ग विश्लेषण",
      hi: "वर्तमान शनि गोचर, साढ़ेसाती/अष्टम शनि एवं अष्टकवर्ग बल",
      te: "ప్రస్తుత శని గోచార ప్రభావం, సాడేసాతీ/అష్టమ శని & అష్టకవర్గ",
      ta: "சனி பகவான் கோசார தாக்கம், ஏழரை/அஷ்டம சனி & அஷ்டகவர்க்கம்",
      en: "Saturn (Shani) Gochara Reality, Sade Sati & Ashtakavarga Strength"
    }, targetLang),
    icon: "⚖️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}ಗೆ ಶನಿಯ ಪ್ರಸ್ತುತ ಗೋಚಾರವು ಎಷ್ಟರಮಟ್ಟಿಗೆ ಅನುಕೂಲಕರವಾಗಿದೆ ಹಾಗೂ ಅಷ್ಟಕವರ್ಗ ಬಿಂದುಗಳು ಏನು ಹೇಳುತ್ತವೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या ${moonRashiName} राशीसाठी सध्याचे शनी गोचर कसे आहे व अष्टकवर्ग काय संकेत देतो?`,
      hi: `प्रश्न: ${devoteeName}, आपकी जन्म राशि ${moonRashiName} के सापेक्ष शनि का वर्तमान गोचर कैसा है एवं अष्टकवर्ग क्या संकेत देता है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ ${moonRashiName} రాశికి శని గోచారం ఎలా ఉంది మరియు అష్టకవర్గ బలం ఎంత?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ${moonRashiName} ராசிக்கு தற்போதைய சனி பெயர்ச்சி எவ்வாறு உள்ளது?`,
      en: `Question: ${devoteeName}, how is Saturn's current transit affecting your ${moonRashiName} Moon sign, and what does your Ashtakavarga score reveal?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನವಗ್ರಹಗಳಲ್ಲಿ ಶನೈಶ್ಚರನು ನ್ಯಾಯಾಧೀಶನಾಗಿದ್ದು, ಮನುಷ್ಯನ ಕರ್ಮವನ್ನು ಅಳೆದು-ತೂಗಿ ಫಲ ನೀಡುವ ಏಕೈಕ ಗ್ರಹ. ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}ಯಿಂದ ಲೆಕ್ಕ ಹಾಕಿದಾಗ ಶನಿಯ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: '${shaniPhase6L}' ಆಗಿದೆ. ${isSadeSati || isAshtamaShani || isKantakaShani ? "ಈ ಕಾಲಘಟ್ಟವು ಜೀವನದ ಅನಗತ್ಯ ಭ್ರಮೆಗಳನ್ನು ಕಳಚಿ ನಿಮ್ಮನ್ನು ಗಟ್ಟಿ ಅಡಿಪಾಯದ ಕಡೆಗೆ ನಡೆಸುವ ಅಗ್ನಿಪರೀಕ್ಷೆಯಾಗಿದೆ — ತಾಳ್ಮೆ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯೇ ನಿಮಗೆ ಪರಮ ಕವಚ." : isShaniBenefic ? "ಶನಿಯು ಶುಭ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಸ್ಥಿರ ಅಧಿಕಾರ, ವೃತ್ತಿ ಪ್ರಗತಿ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ." : "ಶನಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಶಿಸ್ತು ಮತ್ತು ದೀರ್ಘಕಾಲಿಕ ಸ್ಥಿರತೆಯನ್ನು ತರುವ ಸನ್ನದ್ಧತೆಯಲ್ಲಿದ್ದಾನೆ."}`,
        mr: `${devoteeName}, नवग्रहांमध्ये शनी हा कर्माचा न्यायाधीश आहे. आपल्या ${moonRashiName} राशीवरून सध्याचे शनी भ्रमण '${shaniPhase6L}' दर्शवते. ${isSadeSati || isAshtamaShani || isKantakaShani ? "हा काळ जीवनातील अनावश्यक भ्रम दूर करून भविष्याची भक्कम पायाभरणी करण्याचा आहे; संयमाने पुढे जा." : isShaniBenefic ? "शुभ स्थानातील शनी आपल्या कष्टाला स्थिर यश आणि मान-सन्मान मिळवून देईल." : "शनी आपणास शिस्तबद्ध प्रगतीकडे नेत आहे."}`,
        hi: `${devoteeName}, नवग्रहों में शनि न्याय के देवता हैं। आपकी जन्म राशि ${moonRashiName} से शनि का वर्तमान गोचर '${shaniPhase6L}' की अवस्था में है। ${isSadeSati || isAshtamaShani || isKantakaShani ? "यह चरण अनावश्यक आडंबरों को हटाकर स्थायी एवं सुदृढ़ आधार निर्माण का काल है; धैर्य एवं सत्यनिष्ठा ही सच्चा कवच है।" : isShaniBenefic ? "शुभ उपचय गोचर के कारण निरंतर परिश्रम से पद, प्रतिष्ठा एवं दीर्घकालिक उपलब्धि सुनिश्चित होगी।" : "शनिदेव जीवन में अनुशासन एवं परिपक्वता के साथ स्थिर प्रगति प्रदान कर रहे हैं।"}`,
        te: `${devoteeName}, శని భగవానుడు న్యాయాధికారి. మీ ${moonRashiName} రాశి నుండి శని ప్రస్తుతం '${shaniPhase6L}' స్థితిలో సంచరిస్తున్నాడు. ${isSadeSati || isAshtamaShani || isKantakaShani ? "ఈ దశలో సహనంతో, నిబద్ధతతో వ్యవహరించడం వల్ల భవిష్యత్తుకు గట్టి పునాది పడుతుంది." : "మీ క్రమశిక్షణకు, కష్టానికి తగిన స్థిర విజయం తప్పక లభిస్తుంది."}`,
        ta: `${devoteeName}, நவகிரகங்களில் நீதிமானாக விளங்கும் சனி பகவான், உங்கள் ${moonRashiName} ராசியிலிருந்து தற்போது '${shaniPhase6L}' நிலையில் சஞ்சரிக்கிறார். ${isSadeSati || isAshtamaShani || isKantakaShani ? "இந்த காலகட்டம் வாழ்க்கையில் எதார்த்தத்தை உணர்த்தி உறுதியான அடித்தளத்தை அமைக்கும்; பொறுமையே பெரும் பலம்." : "சுப பலத்துடன் சனி இருப்பதால் உங்கள் உழைப்பிற்கு ஏற்ற நிலையான வெற்றி கிடைக்கும்."}`,
        en: `${devoteeName}, Saturn is the cosmic adjudicator who rewards integrity and strips superficial illusions. Measured directly from your natal Moon in ${moonRashiName}, your exact active phase is '${shaniPhase6L}'. ${isSadeSati || isAshtamaShani || isKantakaShani ? "This pivotal chapter acts as a divine refinery calling for structural honesty, discipline, and steady patience." : isShaniBenefic ? "Placed in an auspicious Upachaya transit from your Moon, sustained labor is empowered to crystallize into enduring achievement." : "Saturn invites deliberate consistency and long-horizon planning."}`
      }, targetLang),
      pick6({
        kn: `ನಿಮ್ಮ ಜಾತಕದ ಸರ್ವಾಷ್ಟಕವರ್ಗವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಶನಿಯು ಸಂಚರಿಸುತ್ತಿರುವ ${shaniTransitRashi} ರಾಶಿಯಲ್ಲಿ ಒಟ್ಟು ${n(shaniTransitSav)} ಶುಭ ಬಿಂದುಗಳಿವೆ. ${shaniTransitSav >= 28 ? "೨೮ಕ್ಕಿಂತ ಅಧಿಕ ಬಲಿಷ್ಠ ಬಿಂದುಗಳಿರುವುದರಿಂದ ಶನಿಯ ಸವಾಲುಗಳಲ್ಲೂ ನಿಮಗೆ ರಕ್ಷಣೆ ಹಾಗೂ ಉತ್ತಮ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ." : "ಬಿಂದುಗಳು ಮಧ್ಯಮವಾಗಿರುವುದರಿಂದ ಯಾವುದೇ ಆತುರದ ನಿರ್ಧಾರ ಅಥವಾ ಅತಿಯಾದ ಶ್ರಮ ತೆಗೆದುಕೊಳ್ಳದೆ ಹಂತ-ಹಂತವಾಗಿ ಮುಂದುವರಿಯುವುದು ಜಾಣತನ."}${shaniVedhaPlanet ? ` (ಗೋಚಾರ ವೇಧೆ ಗಮನಿಸಿ: ${shaniVedhaPlanet} ಗ್ರಹದ ತಾತ್ಕಾಲಿಕ ವೇಧೆಯಿರುವುದರಿಂದ ಮುಖ್ಯ ನಿರ್ಧಾರಗಳಿಗೆ ಮುನ್ನ ಶಾಂತ ಚಿಂತನೆ ಅಗತ್ಯ.)` : ""}`,
        mr: `आपल्या पत्रिकेतील सर्वाष्टकवर्गात शनी भ्रमण करत असलेल्या ${shaniTransitRashi} राशीला ${n(shaniTransitSav)} शुभ बिंदू आहेत. ${shaniTransitSav >= 28 ? "भक्कम बिंदू असल्यामुळे अडचणींवर मात करून शेवटी स्थिर यश आपलेच असेल." : "बिंदू मध्यम असल्याने कोणताही मोठा आर्थिक धोका न घेता संयमाने व टप्प्याटप्प्याने पुढे जाणे हितकारक राहील."}${shaniVedhaPlanet ? ` (गोचर वेध सूचना: ${shaniVedhaPlanet} ग्रहाचा वेध असल्याने घाईचे निर्णय टाळावेत.)` : ""}`,
        hi: `आपकी जन्मकुंडली के सर्वाष्टकवर्ग में शनि के वर्तमान गोचर स्थल ${shaniTransitRashi} राशि में ${n(shaniTransitSav)} शुभ बिंदू प्राप्त हैं। ${shaniTransitSav >= 28 ? "उच्च अष्टकवर्ग बल के कारण प्रारंभिक विलंब के बावजूद परिणाम अत्यंत सुदृढ़ एवं दीर्घकालिक होंगे।" : "मध्यम बिंदु बल के कारण नवीन जोखिम से बचें तथा धैर्य व सत्यनिष्ठा के साथ क्रमबद्ध आगे बढ़ें।"}${shaniVedhaPlanet ? ` (गोचर वेध: ${shaniVedhaPlanet} के अस्थायी वेध के कारण महत्वपूर्ण निर्णय सोच-विचार कर लें।)` : ""}`,
        te: `మీ సర్వాష్టకవర్గంలో ${shaniTransitRashi} రాశికి ${n(shaniTransitSav)} బిందువులు ఉన్నాయి. ${shaniTransitSav >= 28 ? "బలమైన బిందువులు ఉన్నందున ప్రారంభంలో నిదానంగా ఉన్నా చివరకు స్థిరమైన విజయం లభిస్తుంది." : "మధ్యస్థ బిందువులు ఉన్నందున తొందరపాటు నిర్ణయాలు మాని క్రమశిక్షణతో ముందుకు సాగండి."}${shaniVedhaPlanet ? ` (గోచార వేధ గమనిక: ${shaniVedhaPlanet} వేధ ప్రభావం ఉంది కనుక జాగ్రత్త వహించండి.)` : ""}`,
        ta: `உங்கள் சர்வாஷ்டகவர்க்க கணக்கீட்டில் சனி சஞ்சரிக்கும் ${shaniTransitRashi} ராசிக்கு ${n(shaniTransitSav)} பரல்கள் (பிந்து) உள்ளன. ${shaniTransitSav >= 28 ? "சாதகமான பரல்கள் உள்ளதால் தொடக்கத்தில் காலதாமதம் ஏற்பட்டாலும் இறுதியில் நிலையான வெற்றி நிச்சயம் கிடைக்கும்." : "நடுத்தரமான பரல்கள் உள்ளதால் அவசர முடிவுகளைத் தவிர்த்து பொறுமையுடன் உழைப்பது பாதுகாப்பைத் தரும்."}${shaniVedhaPlanet ? ` (கோசார வேதை கவனம்: ${shaniVedhaPlanet} கிரகத்தின் தற்காலிக வேதை உள்ளதால் முக்கிய முடிவுகளில் நிதானம் தேவை.)` : ""}`,
        en: `Cross-referencing your Sarvashtakavarga matrix: Saturn's transit sign ${shaniTransitRashi} holds ${shaniTransitSav} total bindus. ${shaniTransitSav >= 28 ? "Because this sector scores at or above the 28-bindu threshold, delays steadily convert into enduring institutional milestones." : "Because this bindu score demands prudent pacing, disciplined execution and conservative risk management deliver far better outcomes than shortcuts."}${shaniVedhaPlanet ? ` (Gochara Vedha Advisory: ${shaniVedhaPlanet} currently casts a classical Vedha obstruction on this transit sector—verify commitments twice before signing.)` : ""}`
      }, targetLang),
      pick6({
        kn: `ಶನಿ ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಆಚರಿಸಬೇಕಾದ ಸರಳ ಪರಿಹಾರ: ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ ಕಾಗೆಗಳಿಗೆ ಅಥವಾ ಮೂಕ ಪ್ರಾಣಿಗಳಿಗೆ ಎಳ್ಳು ಬೆರೆಸಿದ ಆಹಾರವನ್ನು ನೀಡಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪವನ್ನು ಬೆಳಗಿಸುವುದರಿಂದ ಸಾಡೇಸಾತಿ ಅಥವಾ ಅಷ್ಟಮ ಶನಿಯ ಯಾವುದೇ ಋಣಾತ್ಮಕ ನೆರಳು ಶಮನವಾಗಿ ಸರ್ವ ಕಾರ್ಯಗಳಲ್ಲಿ ಮುನ್ನಡೆ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`,
        mr: `शनीच्या कृपेसाठी उपाय: दर शनिवारी मुक्या प्राण्यांना अन्न द्या. गोकर्ण महाबळेश्वर क्षेत्रात तिळाच्या तेलाचा दिवा लावल्याने शनीची पीडा शांत होऊन कार्यात यश मिळेल.`,
        hi: `शनि कृपा हेतु उपाय: प्रत्येक शनिवार को पक्षियों अथवा श्वान को तिलयुक्त आहार दें। श्री गोकर्ण महाबलेश्वर सन्निधि में तिल के तेल का दीपक प्रज्वलित करने से साढ़ेसाती अथवा अष्टम शनि के दोष शांत होते हैं।`,
        te: `శని శాంతి కొరకు: శనివారం నాడు మూగజీవాలకు ఆహారం ఇవ్వండి. గోకర్ణంలో నువ్వుల నూనెతో దీపం వెలిగించడం వల్ల శని దోషాలు తొలగిపోతాయి.`,
        ta: `சனி சாந்தி பரிகாரம்: சனிக்கிழமைகளில் வாயில்லா ஜீவன்களுக்கு உணவளிக்கவும். கோகர்ண மகாபலேஸ்வரர் சன்னதியில் நல்லெண்ணெய் தீபம் ஏற்றி வழிபட சனி தோஷங்கள் விலகும்.`,
        en: `To optimize Saturn's blessings: Feed stray animals or birds with sesame seeds every Saturday. Lighting a consecrated sesame oil lamp oriented toward the southern quadrant while remembering Gokarna Mahabaleshwara dissolves transit fatigue and attracts steady breakthroughs.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಶನಿ ಗೋಚಾರ ದರ್ಶನ", mr: "शनी गोचर दर्शन", hi: "शनि गोचर दर्शन", te: "శని గోచార దర్శనం", ta: "சனி கோசார தரிசனம்", en: "Saturn Gochara Audit" }, targetLang),
    practicalGuidance: pick6({
      kn: `ಶನಿವಾರದಂದು ನೀಲಿ ಅಥವಾ ಕಪ್ಪು ವಸ್ತ್ರವನ್ನು ಧರಿಸುವುದನ್ನು ನಿಯಂತ್ರಿಸಿ, ದೀನದಲಿತರಿಗೆ ಅಥವಾ ಕೆಲಸಗಾರರಿಗೆ ಗೌರವಯುತವಾಗಿ ಸಹಾಯ ಮಾಡಿ.`,
      mr: `शनिवारी गरजू लोकांना किंवा हाताखालील कामगारांना आदरपूर्वक मदत करा.`,
      hi: `शनिवार को श्रमिकों एवं सहायकों को ससम्मान कुछ न कुछ दान अथवा सहयोग अवश्य दें।`,
      te: `శనివారం నాడు కష్టపడే శ్రామికులకు లేదా నిరుపేదలకు మీ చేతనైన సహాయం చేయండి.`,
      ta: `சனிக்கிழமைகளில் உழைக்கும் தொழிலாளர்களுக்கு உங்களால் இயன்ற உதவியை அன்புடன் செய்யுங்கள்.`,
      en: `Treat subordinates, service staff, and laborers with profound courtesy and unprompted generosity on Saturdays to cultivate Saturn's rarest benevolent grace.`
    }, targetLang)
  });

  // CHAPTER 9: Current Jupiter (Guru) Gochara Impact & Guru Bala
  chapters.push({
    chapterNumber: 9,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ಗುರು ಬಲ ಪರೀಕ್ಷೆ & ಭಾಗ್ಯ ವಿಸ್ತರಣೆ: ದೈವಿಕ ಅನುಗ್ರಹದ ಸುವರ್ಣ ದ್ವಾರ",
      mr: "गुरु बल व भाग्य विस्तार: ईश्वरीय कृपेचे सुवर्ण दालन",
      hi: "गुरु बल परीक्षण एवं भाग्य विस्तार: ईश्वरीय अनुग्रह का स्वर्ण द्वार",
      te: "గురు బల పరీక్ష & భాగ్య విస్తరణ: దైవానుగ్రహం లభించే సువర్ణ ద్వారం",
      ta: "குரு பலன் & பாக்கிய விருத்தி: தெய்வ அருள் திறக்கும் பொற்கதவு",
      en: "Jupiter (Guru) Gochara Assessment & Auspicious Guru Bala Gates"
    }, targetLang),
    icon: "✨",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ದೈವಿಕ 'ಗುರು ಬಲ' ಪ್ರಾಪ್ತವಾಗಿದೆಯೇ ಹಾಗೂ ಭಾಗ್ಯೋದಯಕ್ಕೆ ಇದು ಸಕಾಲವೇ?`,
      mr: `प्रश्न: ${devoteeName}, सध्या आपल्या कुंडलीला ईश्वरीय 'गुरु बल' लाभले आहे का व भाग्योदयासाठी ही योग्य वेळ आहे का?`,
      hi: `प्रश्न: ${devoteeName}, क्या वर्तमान में आपकी कुंडली को दिव्य 'गुरु बल' प्राप्त है और क्या यह भाग्योदय का उपयुक्त समय है?`,
      te: `ప్రశ్న: ${devoteeName}, ప్రస్తుతం మీ జాతకానికి 'గురు బలం' ఉందా మరియు ఇది భాగ్యోదయానికి సరైన సమయమా?`,
      ta: `கேள்வி: ${devoteeName}, தற்போது உங்கள் ஜாதகத்திற்கு 'குரு பலம்' உள்ளதா? இது பாக்கியம் தரும் காலமா?`,
      en: `Question: ${devoteeName}, does your chart presently enjoy authentic Guru Bala, and is the gateway of divine expansion open?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಬೃಹಸ್ಪತಿಯು (ಗುರು) ಜ್ಞಾನ, ಸಂಪತ್ತು, ಸಂತಾನ ಹಾಗೂ ದೈವ ಕೃಪೆಯ ಪರಮ ಕಾರಕನಾಗಿದ್ದಾನೆ. ನಿಮ್ಮ ${moonRashiName} ರಾಶಿಯಿಂದ ಲೆಕ್ಕ ಹಾಕಿದಾಗ ಪ್ರಸ್ತುತ ಗುರುವು ${n(guruHouseFromMoon)}ನೇ ಭಾವವಾದ ${guruTransitRashi} ರಾಶಿಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ (${hasGuruBala ? "ಪವಿತ್ರ 'ಗುರು ಬಲ' ಸಕ್ರಿಯವಾಗಿದೆ" : "ಪ್ರಸ್ತುತ ನೇರ ಗುರು ಬಲಕ್ಕಿಂತ ಆಂತರಿಕ ಸಾಧನೆ ಮತ್ತು ತಾಳ್ಮೆಯ ಕಾಲ"}). ${hasGuruBala ? "ಗುರುವಿನ ಅಮೃತ ದೃಷ್ಟಿಯು ಶುಭ ಫಲಗಳನ್ನು ತ್ವರಿತವಾಗಿ ಆಕರ್ಷಿಸುತ್ತದೆ." : "ಶುದ್ಧ ಗುರು ಭಕ್ತಿಯಿಂದ ಈ ಗೋಚಾರವನ್ನು ಶುಭಕರವಾಗಿ ಪರಿವರ್ತಿಸಿಕೊಳ್ಳಬಹುದು."}`,
        mr: `${devoteeName}, वैदिक ज्योतिषात देवगुरू बृहस्पती हे ज्ञान, संपत्ती व ईश्वरीय कृपेचे सर्वोच्च कारक आहेत. आपल्या ${moonRashiName} राशीवरून सध्या गुरु ${n(guruHouseFromMoon)}व्या स्थानात (${guruTransitRashi}) भ्रमण करत आहे (${hasGuruBala ? "शुभ 'गुरु बल' प्राप्त आहे" : "सध्या प्रत्यक्ष गुरु बलाऐवजी संयम व उपासनेचा काळ आहे"}). ${hasGuruBala ? "गुरूची अमृततुल्य दृष्टी आपले कार्य सफल करेल." : "गुरु उपासनेने हा काळ अधिक फलदायी होतो."}`,
        hi: `${devoteeName}, वैदिक ज्योतिष में देवगुरु बृहस्पति ज्ञान, धन, संतति एवं ईश्वरीय कृपा के साक्षात प्रदाता हैं। आपकी ${moonRashiName} राशि से वर्तमान में गुरु ${n(guruHouseFromMoon)}वें भाव (${guruTransitRashi}) में गोचर कर रहे हैं (${hasGuruBala ? "शुभ 'गुरु बल' सक्रिय है" : "वर्तमान में प्रत्यक्ष गुरु बल की अपेक्षा साधना एवं विवेक का समय है"})। ${hasGuruBala ? "गुरु की शुभ दृष्टि आपके कार्यों को सिद्धि प्रदान करेगी।" : "नित्य विष्णु एवं गुरु आराधना से शुभत्व में वृद्धि होगी।"}`,
        te: `${devoteeName}, బృహస్పతి జ్ఞానం, సంతానం మరియు దైవానుగ్రహానికి కారకుడు. మీ ${moonRashiName} రాశి నుండి ప్రస్తుతం గురువు ${n(guruHouseFromMoon)}వ స్థానంలో (${guruTransitRashi}) ఉన్నాడు (${hasGuruBala ? "శుభ 'గురు బలం' అనుకూలంగా ఉంది" : "ప్రస్తుతం శ్రద్ధ మరియు దైవభక్తితో ముందుకు సాగాల్సిన సమయం"}).`,
        ta: `${devoteeName}, ஜோதிடத்தில் குரு பகவான் ஞானம், செல்வம் மற்றும் தெய்வ அருளின் அதிபதியாவார். உங்கள் ${moonRashiName} ராசியிலிருந்து தற்போது குரு ${n(guruHouseFromMoon)}-ம் இடமான ${guruTransitRashi} ராசியில் சஞ்சரிக்கிறார் (${hasGuruBala ? "உத்தம 'குரு பலம்' தற்போது உள்ளது" : "தற்போது பொறுமையும் குரு வழிபாடும் அவசியமான காலம்"}).`,
        en: `${devoteeName}, in classical Jyotish, Devaguru Brihaspati presides over higher intellect, righteous abundance, and Providence. Counted from your natal Moon in ${moonRashiName}, Jupiter currently transits House ${guruHouseFromMoon} (${guruTransitRashi}), meaning ${hasGuruBala ? "classical Guru Bala is authentically active in your favor" : "this transit demands mindful consolidation and spiritual anchoring rather than passive reliance on Guru Bala"}.`
      }, targetLang),
      pick6({
        kn: `ಗುರು ಸಂಚಾರ ರಾಶಿಯ (${guruTransitRashi}) ಸರ್ವಾಷ್ಟಕವರ್ಗ ಬಲವು ${n(guruTransitSav)} ಬಿಂದುಗಳಷ್ಟಿದ್ದು: ${hasGuruBala ? "ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಗಳು, ವಿವಾಹ-ಶುಭಕಾರ್ಯ, ಆಸ್ತಿ ಖರೀದಿ ಅಥವಾ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದ ಪ್ರಯತ್ನಗಳಿಗೆ ಪ್ರಶಸ್ತ ಕಾಲ ಆರಂಭವಾಗುತ್ತಿದೆ." : "ವ್ಯಾಪಾರ ಅಥವಾ ದೊಡ್ಡ ಕುಟುಂಬ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಹಿರಿಯರ ಹಾಗೂ ಗುರುಗಳ ಸಲಹೆ ಪಡೆದು ನಿಧಾನವಾಗಿ ಮುನ್ನಡೆಯುವುದು ಸುರಕ್ಷಿತವಾಗಿದೆ."}${guruVedhaPlanet ? ` (ಗೋಚಾರ ವೇಧೆ ಗಮನಿಸಿ: ${guruVedhaPlanet} ಗ್ರಹದ ವೇಧೆಯಿರುವುದರಿಂದ ಗುರುವಾರದ ಆರಾಧನೆ ತಪ್ಪಿಸಬೇಡಿ.)` : ""}`,
        mr: `गुरूच्या ${guruTransitRashi} राशीस सर्वाष्टकवर्गात ${n(guruTransitSav)} बिंदू आहेत: ${hasGuruBala ? "कौटुंबिक शुभकार्य, शिक्षण व नवीन गुंतवणुकीसाठी उत्तम काळ सुरू होत आहे." : "मोठ्या निर्णयांमध्ये ज्येष्ठांचा सल्ला व संयम ठेवल्यास कोणतीही अडचण येणार नाही."}${guruVedhaPlanet ? ` (गोचर वेध: ${guruVedhaPlanet} ग्रहाचा वेध असल्याने गुरुवारी विशेष उपासना करा.)` : ""}`,
        hi: `गुरु के गोचर स्थल ${guruTransitRashi} में सर्वाष्टकवर्ग के ${n(guruTransitSav)} बिंदू हैं: ${hasGuruBala ? "पारिवारिक मांगलिक कार्य, नवीन संपत्ति क्रय अथवा उच्च अध्ययन के प्रयासों हेतु शुभ योग बन रहे हैं।" : "बड़े निर्णयों में वरिष्ठों एवं गुरुजनों का परामर्श लेना तथा संयमित गति से चलना श्रेयस्कर रहेगा।"}${guruVedhaPlanet ? ` (गोचर वेध: ${guruVedhaPlanet} के वेध के कारण गुरुवार का संकल्प अवश्य लें।)` : ""}`,
        te: `${guruTransitRashi} రాశికి సర్వాష్టకవర్గంలో ${n(guruTransitSav)} బిందువులు ఉన్నాయి: ${hasGuruBala ? "కుటుంబంలో శుభకార్యాలు, ఉన్నత విద్యకు మార్గం సుగమమవుతుంది." : "పెద్ద నిర్ణయాల్లో అనుభవజ్ఞుల సలహా తీసుకుని జాగ్రత్తగా అడుగు వేయండి."}${guruVedhaPlanet ? ` (${guruVedhaPlanet} వేధ ఉన్నందున గురువార పూజ చేయండి.)` : ""}`,
        ta: `${guruTransitRashi} ராசிக்கு சர்வாஷ்டகவர்க்கத்தில் ${n(guruTransitSav)} பரல்கள் உள்ளன: ${hasGuruBala ? "குடும்பத்தில் சுபகாரியங்கள், சொத்து வாங்குதல் அல்லது உயர்கல்வி முயற்சிகளுக்கு பொன்னான காலம் அமைகிறது." : "முக்கிய முடிவுகளில் பெரியவர்களின் ஆலோசனையைப் பெற்று நிதானமாக செயல்படுவது நலம் தரும்."}${guruVedhaPlanet ? ` (வேதை கவனம்: ${guruVedhaPlanet} வேதை இருப்பதால் வியாழன் வழிபாடு அவசியம்.)` : ""}`,
        en: `Jupiter's occupied sector (${guruTransitRashi}) carries ${guruTransitSav} Sarvashtakavarga bindus: ${hasGuruBala ? "domestic sanctum expansion, auspicious commitments, and mentored intellectual ventures gain authentic celestial tailwinds" : "major expansions succeed best through methodical elder counsel rather than impulsive leaps"}.${guruVedhaPlanet ? ` (Vedha Caution: ${guruVedhaPlanet} imposes classical Gochara Vedha—pair ambitious launches with Thursday Guru devotion.)` : ""}`
      }, targetLang),
      pick6({
        kn: `ಗುರು ಕೃಪೆಯನ್ನು ನಿರಂತರವಾಗಿ ಕಾಪಾಡಿಕೊಳ್ಳಲು: ಪ್ರತಿ ಗುರುವಾರ ಹಳದಿ ಬಣ್ಣದ ಪುಷ್ಪಗಳನ್ನು ದೇವರಿಗೆ ಅರ್ಪಿಸಿ. ಗುರು ಚರಿತ್ರೆ ಅಥವಾ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ಭಾಗ್ಯಸ್ಥಾನವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಬ್ರಾಹ್ಮಣರಿಗೆ ಅಥವಾ ಗುರುಗಳಿಗೆ ಯಥಾಶಕ್ತಿ ನಮಸ್ಕರಿಸಿ ದಕ್ಷಿಣೆ ನೀಡುವುದರಿಂದ ಆರ್ಥಿಕ ಅಭಿವೃದ್ಧಿ ಶೀಘ್ರವಾಗುತ್ತದೆ.`,
        mr: `गुरू कृपेसाठी: दर गुरुवारी पिवळी फुले अर्पण करा व विष्णू सहस्रनाम किंवा गुरु चरित्राचे वाचन करा. गुरुजनांचा आदर केल्याने धन आणि भाग्यात वृद्धी होईल.`,
        hi: `गुरु कृपा संवर्धन हेतु: प्रत्येक गुरुवार को पीले पुष्प भगवान को अर्पित करें एवं विष्णु सहस्रनाम का पाठ करें। गुरुजनों एवं संतों का चरण स्पर्श कर आशीर्वाद लें; इससे भाग्योदय में गति आएगी।`,
        te: `గురు అనుగ్రహం కొరకు: గురువారం నాడు పసుపు పూలతో పూజ చేయండి మరియు విష్ణు సహస్రనామ పారాయణ చేయండి. గురువులను గౌరవించడం వల్ల సంపద పెరుగుతుంది.`,
        ta: `குரு அருள் பெற: வியாழக்கிழமைகளில் மஞ்சள் மலர்களால் இறைவனை வழிபடவும். விஷ்ணு சகஸ்ரநாமம் அல்லது குரு ஸ்தோத்திரம் படிப்பது தன வரவை பெருக்கும்.`,
        en: `To anchor this Jupiterian current: Offer yellow flowers or chana dal at your altar every Thursday, and recite the Vishnu Sahasranama or Sri Dakshinamurthy Stotra. Showing humble reverence to preceptors and spiritual elders ensures unbroken financial and moral elevation.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಗುರು ಬಲ ದರ್ಶನ", mr: "गुरु बल दर्शन", hi: "गुरु बल दर्शन", te: "గురు బల దర్శనం", ta: "குரு பல தரிசனம்", en: "Jupiter Grace Assessment" }, targetLang),
    practicalGuidance: pick6({
      kn: `ಗುರುವಾರದಂದು ಬಾಳೆ ಗಿಡಕ್ಕೆ ನೀರು ಹಾಕಿ ನಮಸ್ಕರಿಸಿ; ಯಾವುದೇ ಮಹತ್ವದ ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಹಾಕುವಾಗ ಹಳದಿ ಅಥವಾ ಕೇಸರಿ ಬಣ್ಣದ ಲೇಖನಿಯನ್ನು ಬಳಸುವುದು ಅದೃಷ್ಟದಾಯಕ.`,
      mr: `गुरुवारी केळीच्या झाडाला पाणी घालून नमस्कार करा व महत्त्वाच्या कामासाठी पिवळा रंग वापरा.`,
      hi: `गुरुवार को केले के वृक्ष को जल अर्पित करें एवं महत्वपूर्ण अनुबंधों पर हस्ताक्षर करते समय केसरिया अथवा पीली स्याही का प्रयोग करें।`,
      te: `గురువారం నాడు అరటి చెట్టుకు నీరు పోసి నమస్కరించండి. ముఖ్యమైన పనులకు పసుపు రంగును ఉపయోగించండి.`,
      ta: `வியாழக்கிழமைகளில் வாழை மரத்திற்கு நீர் ஊற்றி வணங்கவும்; சுப காரியங்களுக்கு மஞ்சள் நிறத்தை பயன்படுத்தவும்.`,
      en: `Offer fresh water to a sacred banana tree or Peepal tree on Thursdays, and wear an ivory or saffron touch when executing legal agreements.`
    }, targetLang)
  });

  // CHAPTER 10: Rahu-Ketu Nodal Axis — Karma, Desires & Illusions
  chapters.push({
    chapterNumber: 10,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ರಾಹು-ಕೇತು ಅಕ್ಷ: ಆಕಾಂಕ್ಷೆಗಳ ಭ್ರಮೆ, ಕರ್ಮ ಬಿಡುಗಡೆ & ಮಾನಸಿಕ ದೃಢತೆ",
      mr: "राहु-केतू अक्ष: इच्छांचे भ्रम, पूर्वकर्म मुक्ती व मानसिक स्थैर्य",
      hi: "राहु-केतु अक्ष: तृष्णा के भ्रम, प्रारब्ध मुक्ति एवं मानसिक स्पष्टता",
      te: "రాహు-కేతు అక్షం: భ్రమలు, కర్మ విముక్తి & మానసిక స్థిరత్వం",
      ta: "ராகு-கேது அச்சு: மாயை, கர்ம விடுதலை மற்றும் மனத்தெளிவு",
      en: "Rahu-Ketu Nodal Axis — Unconscious Drives, Illusions & Detachment"
    }, targetLang),
    icon: "🐍",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಸ್ಥಿರಗೊಳಿಸುವ ರಾಹು-ಕೇತುಗಳ ಆಂತರಿಕ ಪ್ರೇರಣೆ ಯಾವುದು ಹಾಗೂ ಯಾವ ಭ್ರಮೆಗಳಿಂದ ನೀವು ಎಚ್ಚರವಿರಬೇಕು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या मनाला अस्वस्थ करणारी राहु-केतूंची अंतःप्रेरणा कोणती व कोणत्या भ्रमांपासून सावध राहावे?`,
      hi: `प्रश्न: ${devoteeName}, आपके अंतर्मन को उद्वेलित करने वाली राहु-केतु की प्रेरणा क्या है और किन भ्रमों से आपको सावधान रहना चाहिए?`,
      te: `ప్రశ్న: ${devoteeName}, మీ మనసును ప్రభావితం చేస్తున్న రాహు-కేతువుల ప్రభావం ఏమిటి మరియు ఏ భ్రమల నుండి జాగ్రత్తపడాలి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் மனதை அலைபாய வைக்கும் ராகு-கேதுவின் மாயை என்ன? எந்த விஷயங்களில் எச்சரிக்கையாக இருக்க வேண்டும்?`,
      en: `Question: ${devoteeName}, what unconscious drives are activated by your Rahu-Ketu nodal axis, and which illusions must you vigilantly pierce?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ರಾಹು ಮತ್ತು ಕೇತುಗಳು ಕಣ್ಣಿಗೆ ಕಾಣದ ಛಾಯಾಗ್ರಹಗಳಾಗಿದ್ದರೂ, ಮನುಷ್ಯನ ಮನಸ್ಸನ್ನು ನಿಯಂತ್ರಿಸುವಲ್ಲಿ ಅತ್ಯಂತ ಬಲಿಷ್ಠರಾಗಿದ್ದಾರೆ. ರಾಹುವು ಲೌಕಿಕ ಆಸೆ, ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ ತ್ವರಿತ ಯಶಸ್ಸಿನ ಭ್ರಮೆಯನ್ನು ಉಂಟುಮಾಡಿದರೆ, ಕೇತುವು ವೈರಾಗ್ಯ, ಅತೃಪ್ತಿ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿಯನ್ನು ಬಯಸುತ್ತಾನೆ. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}ಯಿಂದ ${n(rahuHouseFromMoon)}ನೇ ಮನೆಯಲ್ಲಿ ರಾಹು ಗೋಚಾರ ನಡೆಯುತ್ತಿದ್ದು, ಇದರ ೧೮೦° ಎದುರು ಮನೆಯಲ್ಲಿ ಕೇತುವು ನಿಮ್ಮ ಆಂತರಿಕ ಹೋರಾಟವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತಾನೆ.`,
        mr: `${devoteeName}, राहु आणि केतू हे जरी छायाग्रह असले, तरी मानवी मनावर त्यांचे नियंत्रण प्रचंड असते. राहु माणसाला भौतिक सुखाची व झटपट यशाची तीव्र भूक देतो, तर केतू आंतरिक विरक्ती व अध्यात्माकडे ओढतो. आपल्या ${moonRashiName} राशीपासून ${n(rahuHouseFromMoon)}व्या स्थानात सध्याचे राहु गोचर असून त्याच्या समोरच केतू मानसिक संतुलनाची परीक्षा घेत आहे.`,
        hi: `${devoteeName}, राहु और केतु छायाग्रह होते हुए भी मानव चेतना के सबसे शक्तिशाली संचालक हैं। राहु जहां सांसारिक तृष्णा, महत्त्वाकांक्षा एवं त्वरित सफलता का भ्रम रचता है, वहीं केतु विरक्ति, असंतोष एवं मोक्ष की प्रेरणा देता है। आपकी ${moonRashiName} राशि से ${n(rahuHouseFromMoon)}वें भाव में वर्तमान राहु गोचर एवं ठीक सामने केतु आपकी मानसिक स्पष्टता की परीक्षा ले रहे हैं।`,
        te: `${devoteeName}, రాహు-కేతువులు ఛాయాగ్రహాలైనా మనసుపై వాటి ప్రభావం అపారం. మీ ${moonRashiName} రాశి నుండి ${n(rahuHouseFromMoon)}వ స్థానంలో రాహు సంచారం మరియు దానికి ఎదురుగా కేతువు ఉండడం వల్ల కోరికలు మరియు వైరాగ్యాల మధ్య సమతుల్యత సాధించడమే మీ కర్తవ్యం.`,
        ta: `${devoteeName}, ராகுவும் கேதுவும் சாயா கிரகங்கள் என்றாலும், மனித மனதை ஆட்டிப்படைக்கும் வல்லமை கொண்டவை. உங்கள் ${moonRashiName} ராசியிலிருந்து ${n(rahuHouseFromMoon)}-ம் இடத்தில் ராகுவும் அதற்கு எதிரே கேதுவும் சஞ்சரிப்பதால் உலக ஆசைகளுக்கும் ஆன்மீகத் தெளிவுக்கும் இடையே சமநிலை பேண வேண்டும்.`,
        en: `${devoteeName}, Rahu and Ketu are mathematical shadow nodes holding tremendous sway over unconscious impulse. With Rahu currently transiting House ${rahuHouseFromMoon} from your natal ${moonRashiName} Moon and Ketu illuminating the direct 180° opposite axis, material craving and inner detachment pull simultaneously upon your evolutionary frontier.`
      }, targetLang),
      pick6({
        kn: `ಈ ಸಮಯದಲ್ಲಿ ನೀವು ಎಚ್ಚರವಿರಬೇಕಾದ ಮುಖ್ಯ ಅಪಾಯವೆಂದರೆ: ರಾತ್ರೋರಾತ್ರಿ ಶ್ರೀಮಂತರಾಗುವ ಆಮಿಷಗಳು, ಅಪರಿಚಿತರ ಸುಳ್ಳು ಭರವಸೆಗಳು ಹಾಗೂ ಅತಿಯಾದ ಆತಂಕ. ರಾಹುವು ಇಲ್ಲದ ಭಯವನ್ನು ನಿಜವೆಂದು ತೋರಿಸಿ ನಿಮ್ಮ ವಿವೇಕವನ್ನು ಮರೆಸಲು ಯತ್ನಿಸುತ್ತಾನೆ. ಯಾವುದೇ ಒಪ್ಪಂದ ಮಾಡಿಕೊಳ್ಳುವ ಮುನ್ನ ಎಲ್ಲ ದಾಖಲೆಗಳನ್ನು ಸ್ವತಃ ಪರಿಶೀಲಿಸುವುದು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.`,
        mr: `या काळात सावध राहण्याचा इशारा: झटपट श्रीमंत होण्याचे अमिष, अनोळखी लोकांचे खोटे वायदे व अकारण भीती यांपासून दूर राहा. राहु काल्पनिक भीती निर्माण करतो; संयम आणि कागदपत्रांची खात्री करूनच पुढे जा.`,
        hi: `इस समय विशेष सावधानी: रातों-रात धनवान बनने की प्रलोभनकारी योजनाएं, अज्ञात व्यक्तियों के झूठे आश्वासन एवं अत्यधिक शंकालु स्वभाव से बचें। राहु अवास्तविक भय उत्पन्न करता है; अतः विवेकपूर्वक निर्णय लें और कानूनी दस्तावेजों की स्वयं पड़ताल करें।`,
        te: `ఈ సమయంలో అడ్డదారుల్లో ధనార్జన ఆశలు, తెలియని వ్యక్తుల మాటలు నమ్మి మోసపోకుండా జాగ్రత్తపడండి. అనుమానాలను పక్కనపెట్టి వాస్తవాలను పరిశీలించండి.`,
        ta: `இந்த காலகட்டத்தில் நீங்கள் எச்சரிக்கையாக இருக்க வேண்டியவை: குறுக்கு வழியில் பணக்காரராகும் ஆசைகள், மற்றவர்களின் போலி வாக்குறுதிகள் மற்றும் வீண் பயம். ராகு மாயையான பயத்தை உருவாக்குவார்; நிதானமாக செயல்படுவது அவசியம்.`,
        en: `The cardinal vulnerability to guard against right now: speculative get-rich-quick lures, unverified contracts, and anxiety-driven overthinking. Rahu magnifies phantom fears and inflates seductive mirages; anchoring every decision in verifiable documentation is your impenetrable shield.`
      }, targetLang),
      pick6({
        kn: `ರಾಹು-ಕೇತು ಶಾಂತಿಗಾಗಿ ಅತ್ಯುನ್ನತ ಮಂತ್ರ ಪರಿಹಾರ: ನಿತ್ಯವೂ ೧೧ ಬಾರಿ 'ಶ್ರೀ ದುರ್ಗಾ ಕವಚ' ಅಥವಾ 'ಮಹಾ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ'ವನ್ನು ಜಪಿಸಿ. ಪಕ್ಷಿಗಳಿಗೆ ಹಾಗೂ ಬೀದಿ ನಾಯಿಗಳಿಗೆ ರೊಟ್ಟಿ ಅಥವಾ ಧಾನ್ಯಗಳನ್ನು ನೀಡುವುದು ಸರ್ಪ ದೋಷ ಮತ್ತು ರಾಹುವಿನ ಕ್ರೂರ ದೃಷ್ಟಿಯನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸರ್ಪಶಾಂತಿ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ಕಲ್ಪವೃಕ್ಷದಂತೆ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.`,
        mr: `राहु-केतू शांतीसाठी: दररोज ११ वेळा 'महामृत्युंजय मंत्र' किंवा दुर्गा कवच पठण करा. पक्ष्यांना व श्वानांना अन्न दिल्याने सर्प दोष शांत होतो. गोकर्ण क्षेत्रात रुद्राभिषेक केल्याने मानसिक स्थैर्य लाभते.`,
        hi: `राहु-केतु शांति हेतु अचूक उपाय: नित्य ११ बार 'महामृत्युंजय मंत्र' अथवा 'दुर्गा सप्तशती' के श्लोकों का पाठ करें। पक्षियों एवं श्वान को अन्न-जल देने से नोडल अक्ष के दोष शांत होते हैं। श्री गोकर्ण तीर्थ में रुद्राभिषेक कराना परम कल्याणकारी सिद्ध होगा।`,
        te: `రాహు-కేతు శాంతి కొరకు: రోజూ 11 సార్లు మహా మృత్యుంజయ మంత్రం జపించండి. పక్షులకు దాణా వేయడం వల్ల రాహు దోషాలు తొలగిపోతాయి. గోకర్ణంలో రుద్రాభిషేకం శ్రేయస్కరం.`,
        ta: `ராகு-கேது சாந்தி பரிகாரம்: தினமும் 11 முறை 'மகா மிருத்யுஞ்சய மந்திரம்' சொல்லுங்கள். பறவைகளுக்கும் நாய்களுக்கும் உணவளிப்பது ராகுவின் உக்கிரத்தை குறைக்கும். கோகர்ணத்தில் ருத்ராபிஷேகம் செய்வது உத்தமம்.`,
        en: `To dissolve shadow node disturbances: Recite the Maha Mrityunjaya Mantra 11 times daily, or invoke Goddess Durga. Feeding stray dogs or offering birdseed grounds restless Rahu vibrations. Sponsoring a sacred Rudrabhisheka at Sri Kshetra Gokarna dissolves deep past-life nodal knots.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ರಾಹು-ಕೇತು ಕವಚ", mr: "राहु-केतू कवच", hi: "राहु-केतु कवच", te: "రాహు-కేతు కవచం", ta: "ராகு-கேது கவசம்", en: "Nodal Equilibrium" }, targetLang),
    practicalGuidance: pick6({
      kn: `ಸಂಜೆ ಸೂರ್ಯಾಸ್ತದ ನಂತರ ಉಪ್ಪು ಅಥವಾ ಕಬ್ಬಿಣದ ವಸ್ತುಗಳನ್ನು ಉಚಿತವಾಗಿ ಸ್ವೀಕರಿಸಬೇಡಿ; ಮನೆಯ ಈಶಾನ್ಯ ಮೂಲೆಯನ್ನು ಸದಾ ಸ್ವಚ್ಛವಾಗಿಡಿ.`,
      mr: `संध्याकाळनंतर मीठ किंवा लोखंडाच्या वस्तू फुकट घेणे टाळा व घरातील ईशान्य कोपरा स्वच्छ ठेवा.`,
      hi: `संध्याकाल के पश्चात नमक अथवा लोहे की वस्तुएं निःशुल्क स्वीकार न करें एवं घर के ईशान कोण को सदैव स्वच्छ रखें।`,
      te: `సాయంత్రం వేళల్లో ఉప్పు లేదా ఇనుప వస్తువులను ఉచితంగా తీసుకోకండి. ఇంటి ఈశాన్య భాగాన్ని పరిశుభ్రంగా ఉంచండి.`,
      ta: `மாலை நேரத்திற்குப் பிறகு உப்பு அல்லது இரும்புப் பொருட்களை இலவசமாக வாங்காதீர்கள்; வீட்டின் ஈசானிய மூலையை சுத்தமாக வைத்திருக்கவும்.`,
      en: `Avoid accepting salt or unworked iron as free gifts after dusk, and maintain the Northeast quadrant of your living space impeccably clean and uncluttered.`
    }, targetLang)
  });

  // CHAPTER 11: Special Planetary Yogas (Core V1 Section)
  chapters.push({
    chapterNumber: 11,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ವಿಶೇಷ ರಾಜಯೋಗಗಳು, ಗಜಕೇಸರಿ, ಬುಧಾದಿತ್ಯ & ಪಂಚ ಮಹಾಪುರುಷ ಯೋಗ ವಿಶ್ಲೇಷಣೆ",
      mr: "विशेष राजयोग, गजकेसरी, बुधादित्य व शुभ योग विश्लेषण",
      hi: "विशिष्ट राजयोग, गजकेसरी, बुधादित्य एवं पंच महापुरुष योग विश्लेषण",
      te: "ప్రత్యేక రాజయోగాలు, గజకేసరి, బుధాదిత్య & పంచ మహాపురుష యోగ విశ్లేషణ",
      ta: "விசேஷ ராஜயோகங்கள், கஜகேசரி, புதாதித்ய & பஞ்ச மகாபுருஷ யோக ஆய்வு",
      en: "Special Planetary Yogas — Inherent Royal Formations & Activation Gates"
    }, targetLang),
    icon: "👑",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸುಪ್ತವಾಗಿರುವ ಪರಮ ರಾಜಯೋಗಗಳು ಯಾವುವು ಮತ್ತು ಅವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವಾಗ ಜಾಗೃತಗೊಳ್ಳುತ್ತವೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या कुंडलीत कोणते मोठे राजयोग दडलेले आहेत व ते कधी फलद्रूप होतील?`,
      hi: `प्रश्न: ${devoteeName}, आपकी जन्म कुंडली में कौन से विशिष्ट राजयोग विद्यमान हैं और वे आपके जीवन में कब सक्रिय होंगे?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జన్మ కుండలిలో దాగి ఉన్న అద్భుతమైన రాజయోగాలు ఏమిటి మరియు అవి ఎప్పుడు ఫలిస్తాయి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் மறைந்திருக்கும் விசேஷ ராஜயோகங்கள் யாவை? அவை எப்போது முழு பலன் தரும்?`,
      en: `Question: ${devoteeName}, which supreme Rajayogas and auspicious planetary formations lie encoded within your natal chart, and when do they ignite?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ 'ಯೋಗ' ಎಂದರೆ ಕೇವಲ ಅದೃಷ್ಟವಲ್ಲ, ಬದಲಾಗಿ ಹಿಂದಿನ ಜನ್ಮಗಳ ಪುಣ್ಯದ ಫಲವಾಗಿ ಗ್ರಹಗಳು ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಗೆ ರೂಪಿಸಿರುವ ಸುವರ್ಣ ಮೈತ್ರಿ. ನಿಮ್ಮ ಕುಂಡಲಿಯನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ ಪತ್ತೆಯಾದ ನೈಜ ಯೋಗಗಳ ಸ್ಥಿತಿ: '${detectedYogasSummary}'. ಪಾರಂಪರಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಕೇಂದ್ರ-ತ್ರಿಕೋಣಾಧಿಪತಿಗಳ ಶುಭ ಸಂಯೋಗ, ಗಜಕೇಸರಿ, ಹಾಗೂ ಬುಧಾದಿತ್ಯ ದಂತಹ ರಾಜಯೋಗ ಸ್ಪಂದನಗಳು ದಶಾ ಕಾಲದಲ್ಲಿ ವಿಶೇಷ ಬಲ ನೀಡುತ್ತವೆ.`,
        mr: `${devoteeName}, वैदिक ज्योतिषात 'योग' म्हणजे पूर्वजन्मातील संचित पुण्याचा असा प्रवाह, जो आपल्या ${lagnaRashiName} लग्नासाठी ग्रहांच्या शुभ संयोगाने प्रकट होतो. आपल्या पत्रिकेतील प्रत्यक्ष योग स्थिती: '${detectedYogasSummary}'. केंद्र व त्रिकोणाचे शुभ संबंध आणि गजकेसरी किंवा बुधादित्य योगांसारख्या राजयोगांची फळे दशा काळात स्पष्ट दिसून येतात.`,
        hi: `${devoteeName}, वैदिक ज्योतिष में 'योग' पूर्वजन्म के संचित पुण्यों का दिव्य संगम है जो आपके ${lagnaRashiName} लग्न में ग्रहों के विशिष्ट संयोग से निर्मित होता है। आपकी कुंडली की यथार्थ योग स्थिति: '${detectedYogasSummary}'। केंद्र-त्रिकोण संबंध, गजकेसरी अथवा बुधादित्य योग जैसे राजयोग उपयुक्त दशा आने पर विशेष बल प्रदान करते हैं।`,
        te: `${devoteeName}, యోగం అంటే పూర్వజన్మ సుకృతం. మీ ${lagnaRashiName} లగ్నానికి లభించిన వాస్తవ యోగ స్థితి: '${detectedYogasSummary}'. కేంద్ర-కోణాధిపతుల కలయిక మరియు గజకేసరి, బుధాదిత్య వంటి రాజయోగాలు దశా కాలాల్లో శుభ ఫలితాలను ఇస్తాయి.`,
        ta: `${devoteeName}, ஜோதிடத்தில் 'யோகம்' என்பது முற்பிறவி நல்வினையின் வெளிப்பாடாகும். உங்கள் ${lagnaRashiName} லக்னத்திற்கான உண்மையான யோக அமைப்பு: '${detectedYogasSummary}'. கேந்திர-திரிகோண சேர்க்கை, கஜகேசரி மற்றும் புதாதித்ய யோகம் போன்ற ராஜயோகங்கள் உரிய தசையில் பலம் தரும்.`,
        en: `${devoteeName}, in authentic Vedic astrology, a 'Yoga' is not random coincidence; it is the geometric ripening of past-life merit (Purva Punya). Analyzing your ${lagnaRashiName} ascendant directly against classical D1/D9 positions reveals: '${detectedYogasSummary}'. Alongside classical Kendra-Trikona Rajayoga principles (like Gajakesari or Budhaditya alignments), planetary dispositors govern when prestige ignites.`
      }, targetLang),
      pick6({
        kn: `ಈ ಯೋಗಗಳ ಕಾರ್ಯವಿಧಾನ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಶಕ್ತಿಗಳು: ${pushkaraPlanetsLocalized.length > 0 ? `ಪರಮ ಪವಿತ್ರ 'ಪುಷ್ಕರ ನವಾಂಶ' ಬಲ ಪಡೆದ ಗ್ರಹಗಳು: ${pushkaraPlanetsLocalized.join(", ")}.` : "ಜನ್ಮ ನವಾಂಶದ ಶುಭ ಸ್ಥಾನಗಳು ದಶಾ ಕಾಲದಲ್ಲಿ ರಕ್ಷಣೆ ನೀಡುತ್ತವೆ."} ${activeNeechaPlanets.length > 0 ? `ವಿಶೇಷ ಶುಭ ಸುದ್ದಿ: ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೂ '${activeNeechaPlanets.join(", ")}' ಗ್ರಹಗಳಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ 'ನೀಚಭಂಗ ರಾಜಯೋಗ' ಸಿದ್ಧಿಸಿರುವುದರಿಂದ ಆರಂಭಿಕ ಕಷ್ಟಗಳ ನಂತರ ಅಗಾಧ ಏಳಿಗೆಯನ್ನು ಪ್ರಕೃತಿ ಕರುಣಿಸುತ್ತದೆ.` : uncancelledDebilPlanets.length > 0 ? `(${uncancelledDebilPlanets.join(", ")} ಗ್ರಹದ ಬಲವನ್ನು ತಾಳ್ಮೆ ಮತ್ತು ದೈವ ಆರಾಧನೆಯಿಂದ ಪೋಷಿಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ.)` : "ದಶಾ ನಾಥರು ಮತ್ತು ಗೋಚಾರ ಗುರು-ಶನಿಯ ಅನುಗ್ರಹ ದೊರೆತಾಗ ಹಠಾತ್ ಧನಲಾಭ ಹಾಗೂ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."}`,
        mr: `योग सक्रिय होण्याचे रहस्य: ${pushkaraPlanetsLocalized.length > 0 ? `पावन 'पुष्कर नवांश' बळ असलेले ग्रह: ${pushkaraPlanetsLocalized.join(", ")}.` : "नवांश बळ दशा काळात संरक्षण देईल."} ${activeNeechaPlanets.length > 0 ? `नीचभंग राजयोग सिद्ध झालेले ग्रह (${activeNeechaPlanets.join(", ")}) सुरुवातीच्या संघर्षानंतर मोठे उत्थान देतात.` : "संबंधित ग्रहांच्या महादशा-अंतर्दशेत अचानक भाग्योदय घडतो."}`,
        hi: `योगों की सूक्ष्म शक्ति एवं सक्रियता: ${pushkaraPlanetsLocalized.length > 0 ? `परम पवित्र 'पुष्कर नवांश' बल से युक्त ग्रह: ${pushkaraPlanetsLocalized.join(", ")}।` : "नवांश बल दशा काल में रक्षा कवच प्रदान करता है।"} ${activeNeechaPlanets.length > 0 ? `विशेष शुभ संकेत: '${activeNeechaPlanets.join(", ")}' को 'नीचभंग राजयोग' प्राप्त होने से आरंभिक संघर्ष के उपरांत अप्रत्याशित उत्थान प्राप्त होता है।` : "योगकारक ग्रहों की दशा-अंतर्दशा आने पर एकाएक सम्मान एवं समृद्धि प्राप्त होती है।"}`,
        te: `ఈ యోగాల విశేషం: ${pushkaraPlanetsLocalized.length > 0 ? `పవిత్ర 'పుష్కర నవాంశ' బలం పొందిన గ్రహాలు: ${pushkaraPlanetsLocalized.join(", ")}.` : ""} ${activeNeechaPlanets.length > 0 ? `'${activeNeechaPlanets.join(", ")}' గ్రహాలకు నీచభంగ రాజయోగం ఉన్నందున కష్టాల తర్వాత అద్భుత ఎదుగుదల ఉంటుంది.` : "సంబంధిత దశా కాలాల్లో పదవీ లాభం మరియు విజయం లభిస్తాయి."}`,
        ta: `யோகங்களின் செயல்முறை: ${pushkaraPlanetsLocalized.length > 0 ? `புனித 'புஷ்கர நவாம்சம்' பெற்ற கிரகங்கள்: ${pushkaraPlanetsLocalized.join(", ")}.` : ""} ${activeNeechaPlanets.length > 0 ? `'${activeNeechaPlanets.join(", ")}' கிரகங்களுக்கு நீசபங்க ராஜயோகம் உள்ளதால் ஆரம்ப போராட்டத்திற்குப் பின் மாபெரும் வெற்றி கிட்டும்.` : "தசா-புக்தி காலத்தில் திடீர் திருப்பத்தையும் செல்வத்தையும் தரும்."}`,
        en: `Subtle strength diagnostics: ${pushkaraPlanetsLocalized.length > 0 ? `Planets blessed with auspicious Pushkara Navamsha potency: ${pushkaraPlanetsLocalized.join(", ")}.` : "Navamsha strength anchors steady protection."} ${activeNeechaPlanets.length > 0 ? `Notably, classical Neecha Bhanga cancellation elevates ${activeNeechaPlanets.join(", ")}, turning early friction into enduring sovereignty.` : uncancelledDebilPlanets.length > 0 ? `Mindful propitiation supports ${uncancelledDebilPlanets.join(", ")}.` : "Rajayoga fruits awaken systematically during the Vimshottari periods of participating lords."}`
      }, targetLang),
      pick6({
        kn: `ನಿಮ್ಮ ಸುಪ್ತ ರಾಜಯೋಗಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸಲು: ಸದಾ ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ನಡೆಯಿರಿ ಮತ್ತು ಇತರರ ಕಷ್ಟಕ್ಕೆ ಸ್ಪಂದಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಶ್ರೀ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಬಿಲ್ವಪತ್ರೆ ಅರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸುವುದರಿಂದ, ಜಾತಕದಲ್ಲಿರುವ ರಾಜಯೋಗಗಳು ಸಕಾಲದಲ್ಲಿ ಫಲಿಸಿ, ನಿಮ್ಮ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ಹಾಗೂ ನೆಮ್ಮದಿಯನ್ನು ತಂದುಕೊಡುತ್ತವೆ.`,
        mr: `राजयोग जागृत करण्यासाठी: नेहमी धर्म मार्गावर चाला व गरजूंना मदत करा. गोकर्ण महाबळेश्वर आत्मलिंगावर बेलपत्र वाहून प्रार्थना केल्याने कुंडलीतील सुप्त राजयोग जागे होऊन मान-सन्मान लाभतो.`,
        hi: `राजयोग जागृति हेतु आचरण: सदैव धर्म एवं नैतिकता के मार्ग पर चलें। श्री गोकर्ण महाबलेश्वर के आत्मलिंग पर त्रिमूर्ति रूपी बिल्वपत्र अर्पित करने से कुंडली के प्रसुप्त राजयोग समय पर जाग्रत होकर वंश की कीर्ति बढ़ाते हैं।`,
        te: `రాజయోగాల ఉత్తేజం కొరకు: ధర్మ మార్గంలో నడవండి. గోకర్ణ మహాబలేశ్వరునికి మారేడు దళాలతో పూజ చేయడం వల్ల జాతకంలోని రాజయోగాలు సకాలంలో ఉత్తేజితమై కీర్తి ప్రతిష్టలను తెస్తాయి.`,
        ta: `ராஜயோகங்களை விழிப்படையச் செய்ய: நேர்மை வழியில் நடக்கவும். கோகர்ண மகாபலேஸ்வரரின் ஆத்மலிங்கத்திற்கு வில்வ இலை சாற்றி வழிபட, ஜாதகத்தில் உறங்கும் யோகங்கள் விழித்து தலைமுறைக்கும் பெருமை சேர்க்கும்.`,
        en: `To consciously cultivate these royal seeds: Walk with uncompromised ethical rectitude and assist those in genuine need. Sponsoring an authentic Bilva Patra Archana upon the sacred Atma Linga at Sri Kshetra Gokarna cleanses generational karmic dust and invites your dormant Rajayogas into brilliant material manifestation.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ರಾಜಯೋಗ ದರ್ಶನ", mr: "राजयोग दर्शन", hi: "राजयोग दर्शन", te: "రాజయోగ దర్శనం", ta: "ராஜயோக தரிசனம்", en: "Rajayoga Awakening" }, targetLang),
    practicalGuidance: pick6({
      kn: `ನಿಮ್ಮ ಕೈಲಾದಷ್ಟು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅಥವಾ ಬಡ ಜನರಿಗೆ ಅನ್ನದಾನ ಅಥವಾ ಪುಸ್ತಕ ದಾನ ಮಾಡಿ; ಇದು ಸೂರ್ಯ-ಗುರುಗಳ ರಾಜಯೋಗ ಶಕ್ತಿಯನ್ನು ನೂರ್ಮಡಿಗೊಳಿಸುತ್ತದೆ.`,
      mr: `विद्यार्थ्यांना वह्या-पुस्तके किंवा गरजू व्यक्तींना अन्नदान करा; यामुळे गुरु-सूर्याचे राजयोग अधिक बलवान होतात.`,
      hi: `विद्यार्थियों को पुस्तकें अथवा निर्धनों को भोजन दान करें; इससे सूर्य-गुरु जनित राजयोगों की शक्ति में कई गुना वृद्धि होती है।`,
      te: `పేద విద్యార్థులకు పుస్తకాలు లేదా ఆకలితో ఉన్నవారికి అన్నదానం చేయండి. ఇది మీ రాజయోగ బలాన్ని మరింత పెంచుతుంది.`,
      ta: `ஏழை மாணவர்களுக்கு புத்தகங்களையோ அல்லது ஏழைகளுக்கு அன்னதானமோ செய்யுங்கள்; இது சூரிய-குருவின் ராஜயோக பலத்தை அதிகரிக்கும்.`,
      en: `Distribute learning materials to deserving students or sponsor wholesome meals for the hungry; this directly electrifies the solar-jupiterian engines of your chart.`
    }, targetLang)
  });


  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: KEY LIFE DOMAINS — TAILORED BY AGE & GENDER (Chapters 12 to 16)
  // ──────────────────────────────────────────────────────────────────────────
  const sec3 = pick6({
    kn: "ವಿಭಾಗ ೩: ಜೀವನದ ೫ ಪ್ರಮುಖ ಸ್ತಂಭಗಳ ಪ್ರಶ್ನೋತ್ತರ ವಿಶ್ಲೇಷಣೆ",
    mr: "विभाग ३: आयुष्यातील ५ प्रमुख स्तंभांचे प्रश्नोत्तर विश्लेषण",
    hi: "खंड ३: जीवन के ५ प्रमुख स्तंभों का प्रश्नोत्तरी विश्लेषण",
    te: "విభాగం 3: జీవితంలోని 5 ముఖ్య స్తంభాల ప్రశ్నోత్తర విశ్లేషణ",
    ta: "பிரிவு 3: வாழ்க்கையின் 5 முக்கிய தூண்கள் கேள்வி-பதில் ஆய்வு",
    en: "Section 3: Key Life Domains — Tailored by Age & Gender"
  }, targetLang);

  // CHAPTER 12: Career, Profession & Status (10th House, D10)
  chapters.push({
    chapterNumber: 12,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isInfant || ageCategory === "early_child" || ageCategory === "child"
      ? pick6({
        kn: "ಬಾಲಾರಿಷ್ಟ ರಕ್ಷೆ, ವಿದ್ಯಾಭ್ಯಾಸದ ಅಡಿಪಾಯ & ಪ್ರತಿಭಾ ವಿಕಾಸ",
        mr: "बालारिष्ट संरक्षण, शिक्षणाचा पाया व बुद्धिमत्ता विकास",
        hi: "बालारिष्ट सुरक्षा, विद्यारंभ एवं प्रतिभा विकास",
        te: "బాలారిష్ట రక్షణ, విద్యా పునాది & ప్రతిభా వికాసం",
        ta: "பாலாரிஷ்ட பாதுகாப்பு, கல்வி அடித்தளம் & திறமை வளர்ச்சி",
        en: "Early Cognitive Foundation, Learning Aptitude & Protection"
      }, targetLang)
      : isSenior
        ? pick6({
          kn: "ಜೀವನ ನಿವೃತ್ತಿ, ಗೌರವ ಪ್ರತಿಷ್ಠೆ, ಮಾರ್ಗದರ್ಶನ & ವಂಶೋದ್ಧಾರ",
          mr: "निवृत्तीनंतरचा सन्मान, मार्गदर्शन व प्रतिष्ठा",
          hi: "जीवन निवृत्ति, सामाजिक प्रतिष्ठा, मार्गदर्शन एवं सम्मान",
          te: "జీవిత విశ్రాంతి, గౌరవ ప్రతిష్టలు & మార్గదర్శనం",
          ta: "ஓய்வுக்கால பெருமை, சமூக அந்தஸ்து & வழிகாட்டல்",
          en: "Elder Legacy, Advisory Eminence & Life Culmination"
        }, targetLang)
        : pick6({
          kn: "ವೃತ್ತಿ ಭವಿಷ್ಯ, ಉದ್ಯೋಗ ಉನ್ನತಿ, ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ & ಅಧಿಕಾರ ಯೋಗ",
          mr: "कारकीर्द, नोकरीत प्रगती, व्यवसाय वृद्धी व अधिकार योग",
          hi: "आजीविका, पदोन्नति, व्यापार विस्तार एवं अधिकार योग",
          te: "వృత్తి భవిష్యత్తు, ఉద్యోగ ఉన్నతి, వ్యాపార విస్తరణ & అధికారం",
          ta: "தொழில் வெற்றி, பதவி உயர்வு, வியாபார வளர்ச்சி & தலைமை யோகம்",
          en: "Career Trajectory, Livelihood, Business & Professional Eminence"
        }, targetLang),
    icon: "💼",
    question: isInfant || ageCategory === "early_child" || ageCategory === "child"
      ? pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಮುಗ್ಧ ಶಿಶುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಬುದ್ಧಿಮತ್ತೆ ಹಾಗೂ ಬಾಲ್ಯದ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಗ್ರಹಗಳು ಯಾವ ಸೂಚನೆ ನೀಡುತ್ತಿವೆ?`,
        mr: `प्रश्न: ${devoteeName}, या बाळाच्या बुद्धिमत्ता, शिक्षण व निरोगी वाढीसाठी ग्रहांचे काय मार्गदर्शन आहे?`,
        hi: `प्रश्न: ${devoteeName}, इस बालक की विद्या, कुशाग्र बुद्धि एवं बाल्यकालीन स्वास्थ्य सुरक्षा हेतु ग्रहों का क्या निर्देश है?`,
        te: `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి విద్యాభ్యాసం, తెలివితేటలు & బాల్య రక్షణకు గ్రహాలు ఇచ్చే సూచన ఏమిటి?`,
        ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தையின் கல்வி வளர்ச்சி, புத்திக்கூர்மை மற்றும் பால பருவ நலனுக்கு கிரகங்கள் கூறும் வழி என்ன?`,
        en: `Question: ${devoteeName}, what planetary indicators govern this young child's intellectual foundation, cognitive gifts, and protection?`
      }, targetLang)
      : pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯಶಸ್ಸು ಯಾವಾಗ ಸಿಗಲಿದೆ ಹಾಗೂ ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮಗೆ ಅಗಾಧ ಕೀರ್ತಿ ಲಭಿಸುತ್ತದೆ?`,
        mr: `प्रश्न: ${devoteeName}, आपल्या कारकिर्दीत सर्वोच्च यश कधी मिळेल व कोणत्या क्षेत्रात मान-सन्मान वाढेल?`,
        hi: `प्रश्न: ${devoteeName}, आपके कार्यक्षेत्र में सर्वोच्च उत्थान कब होगा एवं किस दिशा में आपको स्थायी ख्याति प्राप्त होगी?`,
        te: `ప్రశ్న: ${devoteeName}, మీ వృత్తి జీవితంలో అత్యున్నత విజయం ఎప్పుడు లభిస్తుంది మరియు ఏ రంగం మీకు అనుకూలం?`,
        ta: `கேள்வி: ${devoteeName}, உங்கள் தொழில் வாழ்க்கையில் மாபெரும் வெற்றி எப்போது கிட்டும்? எந்தத் துறை உங்களுக்கு புகழைத் தரும்?`,
        en: `Question: ${devoteeName}, what celestial timing governs your career pinnacles, and which professional arena unlocks your authority?`
      }, targetLang),
    paragraphs: [
      pick6({
        kn: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, ಮುಗ್ಧ ಕಂದನ ಜಾತಕದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಬುಧನ ಬಲವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಬಾಲಾರಿಷ್ಟದ ಯಾವುದೇ ಗಂಭೀರ ನೆರಳಿಲ್ಲದೆ ಮಗುವಿನ ಚೇತನವು ಸೌಮ್ಯವಾಗಿದೆ. ೫ನೇ ಮನೆಯು (${house5Info.lordName}) ಜ್ಞಾನಕಾರಕ ಗುರುವಿನ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಮಗುವು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತದೆ. ಬಾಲ್ಯದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಪರಿಸರ ಮತ್ತು ತಾಯಿಯ ಮಡಿಲ ಪ್ರೀತಿಯು ಮಗುವಿನ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ದ್ವಿಗುಣಗೊಳಿಸುತ್ತದೆ.`
          : `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಗೆ ೧೦ನೇ ಮನೆಯು ವೃತ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವದ ಕೇಂದ್ರವಾಗಿದೆ. ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿ ${house10Info.lordName} ಗ್ರಹವು ${n(house10Info.placedHouse)}ನೇ ಭಾವದಲ್ಲಿ (${house10Info.placedRashi}) ಸ್ಥಿತನಾಗಿರುವುದನ್ನು ವಿಶ್ಲೇಷಿಸಿದಾಗ, ನೀವು ಕೇವಲ ಸಾಮಾನ್ಯ ಉದ್ಯೋಗಿಯಾಗಿ ಉಳಿಯುವ ಜಾತಕವಲ್ಲ; ಸ್ವಂತ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಅಧಿಕಾರ ಸ್ಥಾನದಲ್ಲಿ ಶೋಭಿಸುವ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ.`,
        mr: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, बाळाच्या कुंडलीत लग्नेश व बुध अनुकूल असल्याने बालारिष्टाचा कोणताही धोका नाही. पंचमेश ${house5Info.lordName} च्या शुभ प्रभावामुळे बाळाला उत्तम स्मरणशक्ती व ग्रहणक्षमता लाभेल. कौटुंबिक प्रेम व सुसंस्कार यामुळे उत्तम प्रगती होईल.`
          : `${devoteeName}, आपल्या ${lagnaRashiName} लग्नासाठी १० वे स्थान कार्यक्षेत्र व मानसन्मानाचे आहे. दशमेश ${house10Info.lordName} आपल्या कुंडलीत ${n(house10Info.placedHouse)}व्या स्थानात (${house10Info.placedRashi}) स्थित असल्याने आपण केवळ नोकरीत न अडकता स्वतःचे निर्णय घेण्याच्या उच्च पदावर पोहोचण्याची क्षमता बाळगता.`,
        hi: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, इस बालक की कुंडली में लग्नेश एवं बुध की स्थिति बालारिष्ट दोषों का शमन करती है। पंचमेश ${house5Info.lordName} की स्थिति तीव्र स्मरणशक्ति एवं कुशाग्र बुद्धि का वरदान दे रही है। उचित संस्कार एवं स्नेहपूर्ण वातावरण से बालक का सर्वांगीण विकास होगा।`
          : `${devoteeName}, आपके ${lagnaRashiName} लग्न हेतु दशम भाव आजीविका एवं प्रतिष्ठा का केंद्र है। दशमेश ${house10Info.lordName} का ${n(house10Info.placedHouse)}वें भाव (${house10Info.placedRashi}) में स्थित होना संकेत करता है कि आपकी कुंडली में स्वावलंबन एवं निर्णयकारी नेतृत्व की प्रबल क्षमता है।`,
        te: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, చిన్నారి జాతకంలో పంచమాధిపతి ${house5Info.lordName} మరియు బుధ-గురుల బలం బాగున్నందున బాలారిష్ట బాధలు లేవు. అద్భుతమైన తెలివితేటలు, గ్రహణ శక్తి ఉన్నాయి.`
          : `${devoteeName}, మీ ${lagnaRashiName} లగ్నానికి 10వ స్థానం వృత్తి గౌరవానికి మూలం. దశమాధిపతి ${house10Info.lordName} ${n(house10Info.placedHouse)}వ స్థానంలో (${house10Info.placedRashi}) ఉండటం వల్ల నాయకత్వ లక్షణాలు మరియు ఉన్నత అధికారం లభిస్తాయి.`,
        ta: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, குழந்தையின் ஜாதகத்தில் 5-ம் அதிபதி ${house5Info.lordName} மற்றும் புதன் பலத்துடன் உள்ளதால் பாலாரிஷ்ட தோஷங்கள் நீங்கி நல்ல புத்தி கூர்மை அமையும்.`
          : `${devoteeName}, உங்கள் ${lagnaRashiName} லக்னத்திற்கு 10-ஆம் அதிபதி ${house10Info.lordName} தற்போது ${n(house10Info.placedHouse)}-ம் இடமான ${house10Info.placedRashi} ராசியில் அமர்ந்துள்ளதால் தலைமை தாங்கும் வல்லமையும் தொழில் உயர்வும் உண்டு.`,
        en: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `${devoteeName}, analyzing the natal foundation for this tender life, the ascendant lord and Mercury fortify vitality against classical Balarishta afflictions. With 5th lord ${house5Info.lordName} anchoring creative assimilation in House ${house5Info.placedHouse} (${house5Info.placedRashi}), curiosity and retention blossom naturally.`
          : `${devoteeName}, for your ${lagnaRashiName} ascendant, 10th house (Karma Bhava) lord ${house10Info.lordName} placed in House ${house10Info.placedHouse} (${house10Info.placedRashi}) directly directs career prominence and executive reach. This geometry favors self-directed authority over perpetual subordination.`
      }, targetLang),
      pick6({
        kn: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `ಮಗುವಿನ ಬೆಳವಣಿಗೆಯ ಸೂಕ್ಷ್ಮ ಹಂತಗಳಲ್ಲಿ: ಧ್ವನಿ, ಮಾತು ಹಾಗೂ ಕಣ್ಣಿನ ದೃಷ್ಟಿಯ ಮೇಲೆ ಗಮನವಿರಲಿ. ಸರಸ್ವತಿ ಕೃಪೆಯಿಂದ ಶಾಲೆ ಆರಂಭವಾಗುವ ವೇಳೆಗೆ ಮಗುವು ಕಲೆ, ಗಣಿತ ಅಥವಾ ಭಾಷೆಗಳಲ್ಲಿ ವಿಶೇಷ ಆಸಕ್ತಿಯನ್ನು ಪ್ರದರ್ಶಿಸಲಿದೆ. ಮಗುವಿನ ಮೇಲೆ ಅನಗತ್ಯ ಒತ್ತಡ ಹೇರದೆ ಅದರ ಸಹಜ ಆಸಕ್ತಿಗೆ ಪ್ರೋತ್ಸಾಹ ನೀಡುವುದು ಶ್ರೇಷ್ಠ.`
          : `ನಿಮ್ಮ ವೃತ್ತಿಕ್ಷೇತ್ರದಲ್ಲಿ ಉನ್ನತಿ ಕಾಣಲು ಸೂಕ್ತ ಸಮಯ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${currentMahadasha} ಮಹಾದಶೆಯಲ್ಲಿ ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗುವ ಯೋಗವಿದೆ. ವಿಶೇಷವಾಗಿ ತಂತ್ರಜ್ಞಾನ, ನಿರ್ವಹಣೆ, ಸಲಹಾ ವೃತ್ತಿ, ಸರ್ಕಾರಿ ವ್ಯವಹಾರ ಅಥವಾ ಸ್ವತಂತ್ರ ವ್ಯಾಪಾರದಲ್ಲಿ ಮುನ್ನಡೆ ಸಾಧಿಸಲು ಗ್ರಹಗಳು ಪೂರಕವಾಗಿವೆ. ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಶತ್ರುಗಳನ್ನು ತಾನಾಗಿಯೇ ಹಿಮ್ಮೆಟ್ಟಿಸುತ್ತದೆ.`,
        mr: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `बाळाच्या कलागुणांना प्रोत्साहन द्या. शालेय वयात बुद्धिमत्तेची चुणूक दिसेल. अनावश्यक दडपण न आणता सहजतेने शिक्षण घेऊ द्या.`
          : `आपल्या कार्यक्षेत्रात प्रगतीसाठी: चालू ${currentMahadasha} महादशेत आपल्या कष्टाचे चीज होईल. व्यवस्थापन, व्यापार किंवा जबाबदारीच्या पदावर काम करताना संयम राखल्यास विरोधक निष्प्रभ ठरतील.`,
        hi: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `बालक की नैसर्गिक रुचियों को प्रोत्साहित करें। प्राथमिक विद्यारंभ के समय गणित, भाषा अथवा कला के क्षेत्र में विशेष प्रतिभा परिलक्षित होगी।`
          : `कार्यक्षेत्र में पदोन्नति के योग: वर्तमान ${currentMahadasha} महादशा में आपके परिश्रम को उचित सम्मान एवं पद प्राप्त होगा। प्रबंधन, व्यापार, परामर्श अथवा तकनीकी क्षेत्रों में आपकी योग्यता की सराहना होगी।`,
        te: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `పిల్లల సహజ ప్రతిభను ప్రోత్సహించండి. చదువు విషయంలో ఒత్తిడి చేయకుండా స్వేచ్ఛగా నేర్చుకోనివ్వండి.`
          : `ప్రస్తుత ${currentMahadasha} దశలో మీ శ్రమకు తగిన గుర్తింపు లభిస్తుంది. వ్యాపారం లేదా ఉద్యోగంలో పదోన్నతికి అవకాశాలు మెండుగా ఉన్నాయి.`,
        ta: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `குழந்தையின் தனித்திறமைகளை ஊக்குவிக்கவும். கல்வி தொடங்கும் போது கலை மற்றும் அறிவாற்றலில் சிறந்து விளங்குவர்.`
          : `தற்போதைய ${currentMahadasha} தசையில் உங்கள் உழைப்புக்கு ஏற்ற உயர்வு கிடைக்கும். நிர்வாகம் மற்றும் தொழில் துறையில் உங்கள் மதிப்பு கூடும்.`,
        en: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `Nurturing this formative phase: foster natural curiosity without imposing artificial stress. The child will exhibit notable affinity for analytical comprehension or expressive arts as formal learning commences.`
          : `Career acceleration timing: your running ${currentMahadasha} period activates pathways for institutional recognition and expanding responsibility. Whether anchoring an enterprise or navigating executive management, steady diplomacy will dissolve workplace friction.`
      }, targetLang),
      pick6({
        kn: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `ಮಗುವಿನ ಆಯುಷ್ಯ ಮತ್ತು ವಿದ್ಯಾ ರಕ್ಷಣೆಗಾಗಿ: ನಿತ್ಯವೂ ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಥವಾ ಸರಸ್ವತಿ ಸ್ತೋತ್ರವನ್ನು ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಪಠಿಸಿ. ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನದಂದು ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ತೇಜಸ್ಸನ್ನು ಕರುಣಿಸುತ್ತದೆ.`
          : `ವೃತ್ತಿಯಲ್ಲಿ ನಿರಂತರ ಯಶಸ್ಸು ಹಾಗೂ ಕೀರ್ತಿ ಪ್ರಾಪ್ತಿಗಾಗಿ: ಪ್ರತಿ ಮುಂಜಾನೆ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ ತಾಮ್ರದ ಪಾತ್ರೆಯಿಂದ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಉದ್ಯೋಗದಲ್ಲಿನ ಶತ್ರು ಬಾಧೆಗಳು ಹಾಗೂ ಅನಿಶ್ಚಿತತೆಗಳು ಶಮನವಾಗಿ ಉನ್ನತ ಅಧಿಕಾರ ಲಭಿಸುತ್ತದೆ.`,
        mr: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `बाळाच्या रक्षणासाठी: रोज सरस्वती स्तोत्र म्हणा व वाढदिवसाला गोकर्ण क्षेत्रात अभिषेक करून आशीर्वाद घ्या.`
          : `कारकिर्दीत यशासाठी: नित्य सूर्य नमस्कार करा व तांब्याच्या पात्रातून सूर्याला अर्घ्य द्या. गोकर्णात रुद्राभिषेक केल्याने कामातील अडथळे दूर होऊन प्रगती होईल.`,
        hi: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `बालक के कल्याण हेतु: नित्य सरस्वती स्तोत्र का पाठ करें एवं जन्म नक्षत्र के दिन गोकर्ण तीर्थ में दुग्धाभिषेक कराएं।`
          : `कार्यक्षेत्र में स्थायी उत्थान हेतु: प्रतिदिन प्रातः सूर्य को अर्घ्य दें एवं 'आदित्य हृदय स्तोत्र' का स्मरण करें। श्री गोकर्ण महाबलेश्वर सन्निधि में रुद्राभिषेक कराने से विरोधी परास्त होंगे और प्रतिष्ठा बढ़ेगी।`,
        te: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `చిన్నారి క్షేమం కొరకు: రోజూ సరస్వతి స్తోత్రం పఠించండి. పుట్టినరోజున గోకర్ణంలో పూజ చేయించండి.`
          : `వృత్తిలో విజయానికి: రోజూ సూర్యునికి అర్ఘ్యం ఇవ్వండి. గోకర్ణంలో రుద్రాభిషేకం చేయించడం వల్ల ఉద్యోగ సమస్యలు తొలగిపోతాయి.`,
        ta: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `குழந்தையின் நல்வாழ்விற்கு: தினமும் சரஸ்வதி ஸ்தோத்திரம் சொல்லவும். பிறந்த நட்சத்திர நாளில் கோகர்ணத்தில் பால் அபிஷேகம் செய்யவும்.`
          : `தொழில் வெற்றிக்கு: தினமும் காலையில் சூரியனுக்கு அர்க்கியம் அளித்து வழிபடவும். கோகர்ணத்தில் ருத்ராபிஷேகம் செய்ய வேலை வாய்ப்புகளும் பதவி உயர்வும் கிட்டும்.`,
        en: isInfant || ageCategory === "early_child" || ageCategory === "child"
          ? `For the child's academic and vital vitality: invoke Goddess Saraswati or Medha Dakshinamurthy. Sponsoring a sacred Ksheerabhisheka on the child's birth star at Sri Kshetra Gokarna grounds enduring health and luminescent intellect.`
          : `To cement executive authority: offer fresh water oblations (Surya Arghya) at sunrise. Sponsoring a solemn Rudrabhisheka at Sri Kshetra Gokarna clears career bottlenecks, neutralizes envy, and aligns your path with authoritative elevation.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ವೃತ್ತಿ & ಕರ್ಮ ಮಾರ್ಗ", mr: "कारकीर्द व कर्म मार्ग", hi: "आजीविका एवं कर्म मार्ग", te: "వృత్తి & కర్మ మార్గం", ta: "தொழில் & கர்ம பாதை", en: "Career & Dharma Blueprint" }, targetLang),
    practicalGuidance: pick6({
      kn: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "ಮಗುವಿನ ಅಭ್ಯಾಸ ಕೋಣೆಯಲ್ಲಿ ಪೂರ್ವ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡಿ ಕುಳಿತು ಓದುವಂತೆ ವ್ಯವಸ್ಥೆ ಮಾಡಿ."
        : "ಮುಖ್ಯ ಉದ್ಯೋಗ ಸಭೆಗಳಿಗೆ ಹೋಗುವಾಗ ಬಿಳಿ ಅಥವಾ ತಿಳಿ ಹಳದಿ ಬಣ್ಣದ ವಸ್ತ್ರ ಬಳಸಿ; ಹಿರಿಯ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ನಮ್ರತೆಯಿಂದ ವರ್ತಿಸಿ.",
      mr: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "मुलांना पूर्व दिशेकडे तोंड करून अभ्यास करण्याची सवय लावा."
        : "महत्त्वाच्या बैठकींना जाताना सौम्य रंग वापरा व वरिष्ठांशी संयमाने बोला.",
      hi: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "अध्ययन के समय मुख पूर्व दिशा की ओर रखने से एकाग्रता बढ़ती है।"
        : "महत्वपूर्ण व्यापारिक बैठकों में शांत एवं सौम्य वस्त्र धारण करें तथा वरिष्ठों के प्रति आदर बनाए रखें।",
      te: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "పిల్లలు తూర్పు ముఖంగా కూర్చుని చదువుకునేలా చూడండి."
        : "ముఖ్యమైన మీటింగులకు వెళ్లేటప్పుడు లేత రంగు వస్త్రాలను ధరించండి.",
      ta: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "குழந்தைகள் கிழக்கு நோக்கி அமர்ந்து படிக்க பழக்கப்படுத்தவும்."
        : "முக்கியமான நேர்காணல்களுக்கு செல்லும்போது வெளிர் நிற ஆடைகளை அணியவும்.",
      en: isInfant || ageCategory === "early_child" || ageCategory === "child"
        ? "Position the child's study desk facing East to harmonize with solar intellectual currents."
        : "Incorporate ivory or pale amber into your wardrobe for critical negotiations, and cultivate unshakable calm during high-stakes dialogues."
    }, targetLang)
  });

  // CHAPTER 13: Wealth Accumulation & Financial Stability (2nd & 11th Houses)
  chapters.push({
    chapterNumber: 13,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isChildOrInfant
      ? pick6({
        kn: "ಬಾಲ ಲಕ್ಷ್ಮಿ ಯೋಗ, ವಿದ್ಯಾ ನಿಧಿ ಭದ್ರತೆ & ಕುಟುಂಬದ ಸಮೃದ್ಧಿ",
        mr: "बाल लक्ष्मी योग, शिक्षण निधी सुरक्षा व कौटुंबिक समृद्धी",
        hi: "बाल लक्ष्मी योग, विद्या कोष सुरक्षा एवं पारिवारिक समृद्धि",
        te: "బాల లక్ష్మి యోగం, విద్యా నిధి భద్రత & కుటుంబ ఐశ్వర్యం",
        ta: "பால லட்சுமி யோகம், கல்வி நிதி பாதுகாப்பு & குடும்ப வளம்",
        en: "Childhood Abundance Yoga, Educational Security & Family Prosperity"
      }, targetLang)
      : pick6({
        kn: "ಧನಾಗಮನ, ಆರ್ಥಿಕ ಭದ್ರತೆ, ಉಳಿತಾಯ & ಶಾಶ್ವತ ಆಸ್ತಿ ಸೃಷ್ಟಿ",
        mr: "धनलाभ, आर्थिक स्थैर्य, बचत व संपत्ती निर्मिती",
        hi: "धन आगमन, वित्तीय स्थिरता, संचय एवं स्थायी संपत्ति निर्माण",
        te: "ధన ప్రాప్తి, ఆర్థిక భద్రత, పొదుపు & శాశ్వత ఆస్తి నిర్మాణం",
        ta: "தன வரவு, நிதி ஸ்திரத்தன்மை, சேமிப்பு & நிரந்தர சொத்து சேர்க்கை",
        en: "Wealth Accumulation, Financial Fortification & Asset Generation"
      }, targetLang),
    icon: "💰",
    question: isChildOrInfant
      ? pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಕಂದನ ಜಾತಕದಲ್ಲಿ ಕುಟುಂಬದ ಏಳಿಗೆ ಹಾಗೂ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದ ಸಂಪತ್ತು ಹೇಗಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, या बाळाच्या कुंडलीत कौटुंबिक समृद्धी व उच्च शिक्षणाचा आधार कसा आहे?`,
        hi: `प्रश्न: ${devoteeName}, इस बालक की कुंडली में पारिवारिक समृद्धि एवं उच्च शिक्षा कोष की स्थिति कैसी है?`,
        te: `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి జాతకంలో కుటుంబ ఐశ్వర్యం మరియు విద్యా సంపద ఎలా ఉన్నాయి?`,
        ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தையின் ஜாதகத்தில் குடும்ப வளமும் கல்விச் செல்வமும் எவ்வாறு அமைந்துள்ளன?`,
        en: `Question: ${devoteeName}, how do natal wealth lords bless this child's educational foundation and parental prosperity?`
      }, targetLang)
      : pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶಾಶ್ವತ ಧನ ಯೋಗ ಹೇಗಿದೆ ಹಾಗೂ ಕೈಯಲ್ಲಿ ಹಣ ಉಳಿಯದಿರಲು ಕಾರಣವೇನು?`,
        mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत कायमस्वरूपी धनयोग कसा आहे व पैसा हातात का टिकत नाही?`,
        hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में स्थायी धन योग की स्थिति क्या है और धन संचय में क्या बाधाएं आती हैं?`,
        te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో ధన యోగం ఎలా ఉంది మరియు పొదుపు ఎందుకు నిలవడం లేదు?`,
        ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் நிரந்தர தன யோகம் எவ்வாறு உள்ளது? கையில் பணம் தங்காததற்கான காரணம் என்ன?`,
        en: `Question: ${devoteeName}, what planetary dynamics govern your liquidity and long-term asset accumulation, and how do you plug leaks?`
      }, targetLang),
    paragraphs: [
      pick6({
        kn: isChildOrInfant
          ? `${devoteeName}, ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ೨ನೇ ಮನೆಯ ಅಧಿಪತಿ (${house2Info.lordName}, ${n(house2Info.placedHouse)}ನೇ ಭಾವ ${house2Info.placedRashi}) ಹಾಗೂ ೧೧ನೇ ಮನೆಯ ಅಧಿಪತಿ (${house11Info.lordName}) ಕಂದನ ಆಗಮನದಿಂದ ಕುಟುಂಬಕ್ಕೆ ಬರುವ ಭಾಗ್ಯವನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಈ ಮಗುವಿನ ಪಾದದ ಗುಣದಿಂದ ತಂದೆ-ತಾಯಿಯ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಬೇಕಾಗುವ ಸಂಪನ್ಮೂಲವು ಕಾಲಕ್ಕೆ ತಕ್ಕಂತೆ ಸಿದ್ಧವಾಗುತ್ತದೆ.`
          : `${devoteeName}, ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ೨ನೇ ಮನೆಯು ಧನಸ್ಥಾನ ಹಾಗೂ ೧೧ನೇ ಮನೆಯು ಆಯಸ್ಥಾನವಾಗಿದೆ. ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಧನಾಧಿಪತಿ ${house2Info.lordName} (${n(house2Info.placedHouse)}ನೇ ಮನೆ, ${house2Info.placedRashi}) ಹಾಗೂ ಲಾಭಾಧಿಪತಿ ${house11Info.lordName} (${n(house11Info.placedHouse)}ನೇ ಮನೆ) ಹೊಂದಿರುವ ಸಂಬಂಧವು ನಿಮ್ಮ ಆದಾಯದ ಹರಿವನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ. ದುಡಿಮೆಗೆ ಕೊರತೆಯಿಲ್ಲದಿದ್ದರೂ ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳು ಉಳಿತಾಯವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತವೆ.`,
        mr: isChildOrInfant
          ? `${devoteeName}, कुंडलीतील द्वितीयेश ${house2Info.lordName} (${n(house2Info.placedHouse)}वे स्थान, ${house2Info.placedRashi}) व लाभेश ${house11Info.lordName} बाळाच्या जन्मानंतर कुटुंबात सकारात्मक भरभराट आणि शिक्षणासाठी उत्तम सुबत्ता दर्शवतात.`
          : `${devoteeName}, पत्रिकेत २ रे स्थान धनसंचय व ११ वे स्थान नफ्याचे असते. द्वितीयेश ${house2Info.lordName} (${n(house2Info.placedHouse)}वे स्थान, ${house2Info.placedRashi}) व लाभेश ${house11Info.lordName} यांच्या स्थितीनुसार मिळकतीचे मार्ग खुले आहेत; मात्र अचानक येणारे खर्च व अतिविश्वासामुळे बचत कमी पडते.`,
        hi: isChildOrInfant
          ? `${devoteeName}, कुंडली में द्वितीयेश ${house2Info.lordName} (${n(house2Info.placedHouse)}वां भाव, ${house2Info.placedRashi}) एवं एकादशेश ${house11Info.lordName} संकेत देते हैं कि इस बालक के भाग्य से परिवार में समृद्धि एवं विद्यार्जन हेतु सुदृढ़ संसाधन जुटेंगे।`
          : `${devoteeName}, कुंडली में द्वितीयेश ${house2Info.lordName} (${n(house2Info.placedHouse)}वां भाव, ${house2Info.placedRashi}) एवं एकादशेश ${house11Info.lordName} नियमित आय का प्रतिनिधित्व करते हैं। आय के स्रोत बने रहने पर भी अप्रत्याशित व्यय एवं अत्यधिक विश्वास से संचित कोष प्रभावित होता है।`,
        te: isChildOrInfant
          ? `${devoteeName}, ద్వితీయాధిపతి ${house2Info.lordName} (${n(house2Info.placedHouse)}వ స్థానం) మరియు లాభాధిపతి ${house11Info.lordName} శుభ స్థితి వల్ల ఈ చిన్నారి అదృష్టంతో కుటుంబంలో ఐశ్వర్యం మరియు విద్యా వసతులు వృద్ధి చెందుతాయి.`
          : `${devoteeName}, జాతకంలో ధనాధిపతి ${house2Info.lordName} (${n(house2Info.placedHouse)}వ స్థానం, ${house2Info.placedRashi}) మరియు లాభాధిపతి ${house11Info.lordName} వల్ల సంపాదన బాగున్నా, ఊహించని ఖర్చుల వల్ల పొదుపు నిలవడం లేదు.`,
        ta: isChildOrInfant
          ? `${devoteeName}, ஜாதகத்தில் 2-ம் அதிபதி ${house2Info.lordName} (${n(house2Info.placedHouse)}-ம் வீடு) மற்றும் 11-ம் அதிபதி ${house11Info.lordName} ஆகியோர் இந்தக் குழந்தையின் மூலம் குடும்ப வளமும் கல்வி நிதியும் பெருகுவதை உறுதி செய்கின்றனர்.`
          : `${devoteeName}, ஜாதகத்தில் 2-ம் அதிபதி ${house2Info.lordName} (${n(house2Info.placedHouse)}-ம் வீடு, ${house2Info.placedRashi}) மற்றும் 11-ம் அதிபதி ${house11Info.lordName} மூலம் வருமானம் வந்தாலும், எதிர்பாராத செலவுகளால் சேமிப்பு குறைகிறது.`,
        en: isChildOrInfant
          ? `${devoteeName}, with 2nd lord ${house2Info.lordName} in House ${house2Info.placedHouse} (${house2Info.placedRashi}) and 11th lord ${house11Info.lordName} guiding abundance, this child brings auspicious household prosperity and well-provisioned educational support.`
          : `${devoteeName}, in your chart, 2nd house (wealth) lord ${house2Info.lordName} residing in House ${house2Info.placedHouse} (${house2Info.placedRashi}) alongside 11th lord ${house11Info.lordName} governs liquidity. Income channels remain resilient, though unbudgeted outflows and over-trust test reserves.`
      }, targetLang),
      pick6({
        kn: isChildOrInfant
          ? `ಪೋಷಕರಿಗಾಗಿ ಸಲಹೆ: ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ದೀರ್ಘಾವಧಿಯ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದ ಸುರಕ್ಷಿತ ನಿಧಿ (ಉದಾಹರಣೆಗೆ ಜ್ಞಾನ-ಸಂಪದ ಉಳಿತಾಯ) ಯನ್ನು ಯೋಗಿ ಗ್ರಹದ (${yogiPlanetName}) ಶುಭ ದಿನದಂದು ಆರಂಭಿಸುವುದು ಮಗುವಿನ ಭವಿಷ್ಯಕ್ಕೆ ಭದ್ರ ಬುನಾದಿಯಾಗುತ್ತದೆ.`
          : `ನಿಮ್ಮ ಆರ್ಥಿಕತೆಯನ್ನು ಬಲಪಡಿಸುವ ರಹಸ್ಯ: ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಅಪಾಯಕಾರಿ ತ್ವರಿತ ವ್ಯವಹಾರಗಳಿಗಿಂತ, ಸ್ಥಿರಾಸ್ತಿ (ಭೂಮಿ, ಮನೆ, ಬಂಗಾರ) ರೂಪದಲ್ಲಿ ಹಣವನ್ನು ತೊಡಗಿಸುವುದು ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿದೆ. ನಿಮ್ಮ ಯೋಗಿ ಗ್ರಹವಾದ '${yogiPlanetName}' ಗ್ರಹದ ದಿನದಂದು ಮಾಡುವ ಹೂಡಿಕೆಗಳು ದೀರ್ಘಕಾಲಿಕ ಲಾಭವನ್ನು ನೀಡಲಿವೆ.`,
        mr: isChildOrInfant
          ? `पालकांसाठी मार्गदर्शन: मुलाच्या उच्च शिक्षणासाठी सुरक्षित बचत निधी योगी ग्रह '${yogiPlanetName}' च्या शुभ दिवशी सुरू करणे भविष्यासाठी भक्कम पाया ठरेल.`
          : `आर्थिक स्थैर्याचे रहस्य: सट्टेबाजी किंवा झटपट नफ्याच्या मागे न लागता जमीन, सोने किंवा मुदत ठेवी यांसारख्या सुरक्षित मार्गांनी गुंतवणूक करा. आपल्या योगी ग्रहाच्या दिवशी केलेली गुंतवणूक लाभदायक ठरेल.`,
        hi: isChildOrInfant
          ? `अभिभावकों हेतु निर्देश: बालक की उच्च शिक्षा हेतु सुरक्षित बचत निधि योगी ग्रह '${yogiPlanetName}' के शुभ दिन पर प्रारंभ करना भविष्य को सुरक्षित बनाएगा।`
          : `स्थायी समृद्धि का सूत्र: सट्टा अथवा जोखिम भरे त्वरित निवेश के स्थान पर भूमि, भवन अथवा स्वर्ण जैसी अचल संपत्तियों में निवेश करना आपकी कुंडली हेतु सर्वाधिक फलदायी है। अपने योगी ग्रह के दिन किया गया निवेश दीर्घकालिक सुरक्षा प्रदान करेगा।`,
        te: isChildOrInfant
          ? `తల్లిదండ్రులకు సూచన: చిన్నారి ఉన్నత విద్య కొరకు యోగి గ్రహమైన '${yogiPlanetName}' వారంలో సురక్షిత పొదుపు పథకం ప్రారంభించడం శ్రేయస్కరం.`
          : `ఆర్థిక స్థిరత్వానికి మార్గం: రిస్క్ ఉండే వ్యాపారాలు కాకుండా స్థిరాస్తి, బంగారంపై పెట్టుబడులు పెట్టడం మీకు కలిసివస్తుంది. అప్పులు ఇవ్వడం తగ్గించండి.`,
        ta: isChildOrInfant
          ? `பெற்றோருக்கான வழிகாட்டல்: குழந்தையின் உயர்கல்விக்காக யோகி கிரகமான '${yogiPlanetName}' நாளில் பாதுகாப்பான கல்வி சேமிப்பைத் தொடங்குவது சிறந்தது.`
          : `பொருளாதார ஸ்திரத்தன்மைக்கு: பங்குச்சந்தை போன்ற ஆபத்தான வழிகளைத் தவிர்த்து, நிலம், வீடு அல்லது தங்கத்தில் முதலீடு செய்வதே உங்கள் ஜாதகத்திற்கு உத்தமம். மற்றவர்களுக்கு கடன் கொடுப்பதை தவிர்க்கவும்.`,
        en: isChildOrInfant
          ? `Parental stewardship guide: initiating a dedicated, protected educational reserve in the child's name on an auspicious day ruled by Yogi planet '${yogiPlanetName}' locks long-term academic freedom.`
          : `The golden protocol for asset fortification: prioritize tangible real estate, physical gold, or protected reserves over speculative gambles. Capital allocations executed on days ruled by your Yogi planet '${yogiPlanetName}' retain exceptional staying power.`
      }, targetLang),
      pick6({
        kn: `ಧನಾಗಮನ ಹಾಗೂ ಲಕ್ಷ್ಮಿ ಕೃಪೆಗಾಗಿ ಪರಿಹಾರ: ಶುಕ್ರವಾರ ಮುಸ್ಸಂಜೆ 'ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ' ಅಥವಾ 'ಶ್ರೀ ಸೂಕ್ತ' ಪಠಿಸಿ. ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಕೆಂಪು ವಸ್ತ್ರದಲ್ಲಿ ಸುತ್ತಿದ ಒಂದು ಬೆಳ್ಳಿಯ ನಾಣ್ಯವನ್ನು ಇಟ್ಟು ಪೂಜಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಲಕ್ಷ್ಮಿ-ನಾರಾಯಣ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸಕಾಲಿಕ ಶ್ರೇಯಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`,
        mr: `धनवृद्धीसाठी: शुक्रवारी 'कनकधारा स्तोत्र' किंवा 'श्री सूक्त' म्हणा. देव्हाऱ्यात लाल कपड्यात चांदीचे नाणे ठेवा. गोकर्णात लक्ष्मी-नारायण पूजा केल्यास आर्थिक अडचणी दूर होतील.`,
        hi: `धन वृद्धि एवं समृद्धि हेतु: प्रत्येक शुक्रवार की संध्या को 'कनकधारा स्तोत्र' अथवा 'श्री सूक्त' का पाठ करें। पूजा स्थल पर लाल रेशमी वस्त्र में एक चांदी का सिक्का स्थापित करें। श्री गोकर्ण धाम में लक्ष्मी-नारायण पूजा कराने से समृद्धि के मार्ग प्रशस्त होंगे।`,
        te: `ధనాభివృద్ధి కొరకు: శుక్రవారం నాడు కనకధారా స్తోత్రం పఠించండి. పూజా గదిలో వెండి నాణెం ఉంచండి. గోకర్ణంలో లక్ష్మీ-నారాయణ పూజ శ్రేయస్కరం.`,
        ta: `தன ஆகர்ஷண பரிகாரம்: வெள்ளிக்கிழமைகளில் 'கனகதாரா ஸ்தோத்திரம்' அல்லது 'ஸ்ரீ சூக்தம்' பாராயணம் செய்யவும். பூஜை அறையில் சிவப்பு துணியில் வெள்ளி நாணயத்தை வைக்கவும். கோகர்ணத்தில் லட்சுமி-நாராயண பூஜை செய்வது நலம்.`,
        en: `To magnetize financial abundance: recite the Kanakadhara Stotra on Friday evenings and keep a consecrated silver coin wrapped in red silk inside your shrine. Sponsoring a Lakshmi-Narayana invocation at Sri Kshetra Gokarna fortifies household prosperity.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಧನ ಲಕ್ಷ್ಮಿ ರಹಸ್ಯ", mr: "धन लक्ष्मी रहस्य", hi: "धन लक्ष्मी रहस्य", te: "ధన లక్ష్మి రహస్యం", ta: "தன லட்சுமி ரகசியம்", en: "Wealth Preservation Matrix" }, targetLang),
    practicalGuidance: pick6({
      kn: isChildOrInfant
        ? "ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಸಣ್ಣ ಉಳಿತಾಯ ಪಾತ್ರೆಯೊಂದಿಗೆ ದಾನ-ಧರ್ಮದ ಒಳ್ಳೆಯ ಸಂಸ್ಕಾರವನ್ನು ಬಾಲ್ಯದಿಂದಲೇ ಕಲಿಸಿ."
        : "ಪ್ರತಿ ತಿಂಗಳ ಮೊದಲ ದಿನ ನಿಮ್ಮ ಆದಾಯದ ಸಣ್ಣ ಪಾಲನ್ನು (೧%) ಹಸಿದವರಿಗೆ ಅಥವಾ ಗೋಶಾಲೆಯ ಹಸುಗಳಿಗೆ ಮೀಸಲಿಡಿ; ಇದು ದರಿದ್ರ ಯೋಗವನ್ನು ಭಸ್ಮ ಮಾಡುತ್ತದೆ.",
      mr: isChildOrInfant
        ? "बाळाच्या हातून लहान वयापासूनच गरजूंना थोडे दान करण्याची चांगली सवय लावा."
        : "दर महिन्याला आपल्या उत्पन्नातील छोटा हिस्सा गोशाळेला किंवा भुकेल्यांना द्या.",
      hi: isChildOrInfant
        ? "बालक में बचपन से ही छोटे संचय और निर्धनों को दान देने के शुभ संस्कार का बीज बोएं।"
        : "प्रत्येक मास के प्रथम दिन अपनी आय का एक छोटा अंश (१%) गोशाला अथवा निर्धनों के अन्न हेतु समर्पित करें; इससे धन की बरकत बनी रहती है।",
      te: isChildOrInfant
        ? "చిన్నతనం నుండే పిల్లలకు పొదుపు మరియు దానం చేసే మంచి అలవాటును నేర్పించండి."
        : "ప్రతినెలా మీ ఆదాయంలో కొద్ది భాగాన్ని ఆవులకు లేదా అన్నదానానికి ఉపయోగించండి.",
      ta: isChildOrInfant
        ? "குழந்தைக்கு சிறுவயது முதலே சிறு சேமிப்பும் பிறருக்கு உதவும் நற்பண்பையும் பழக்குங்கள்."
        : "மாதந்தோறும் உங்கள் வருமானத்தில் ஒரு சிறு பகுதியை கோசாலைக்கோ அல்லது அன்னதானத்திற்கோ வழங்கவும்.",
      en: isChildOrInfant
        ? "Cultivate joyous habits of gratitude, saving coins, and sharing gently with those in need from early childhood."
        : "Dedicate 1% of your monthly earnings toward sacred Goshalas or feeding the destitute on the first day of each month to purify commercial karma."
    }, targetLang)
  });

  // CHAPTER 14: Marriage, Compatibility & Relationships (7th House)
  chapters.push({
    chapterNumber: 14,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isMinor
      ? pick6({
        kn: "ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ, ಪೋಷಕರ ಪ್ರೀತಿ & ಸಹೋದರ ಬಾಂಧವ್ಯ",
        mr: "कौटुंबिक सलोखा, पालकांचे प्रेम व भावंडांशी नाते",
        hi: "पारिवारिक सौहार्द, मातृ-पितृ स्नेह एवं भ्रातृ संबंध",
        te: "కుటుంబ సామరస్యం, తల్లిదండ్రుల ప్రేమ & బంధుత్వాలు",
        ta: "குடும்ப ஒற்றுமை, பெற்றோர் பாசம் & உடன்பிறப்பு பிணைப்பு",
        en: "Family Sanctuary, Parental Bonds & Sibling Harmony"
      }, targetLang)
      : pick6({
        kn: "ದಾಂಪತ್ಯ ಸುಖ, ವಿವಾಹ ಯೋಗ, ಸಂಗಾತಿಯ ಸ್ವಭಾವ & ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ",
        mr: "वैवाहिक सुख, विवाह योग, जोडीदाराचा स्वभाव व कौटुंबिक सौख्य",
        hi: "दांपत्य सुख, विवाह योग, जीवनसाथी का स्वभाव एवं पारिवारिक सामंजस्य",
        te: "దాంపత్య సుఖం, వివాహ యోగం, భాగస్వామి స్వభావం & కుటుంబ శాంతి",
        ta: "தாம்பத்திய சுகம், திருமண யோகம், துணையின் குணம் & குடும்ப ஒற்றுமை",
        en: "Marital Harmony, Alliance Timing, Partner Temperament & Domestic Peace"
      }, targetLang),
    icon: "💍",
    question: isMinor
      ? pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಬಾಲಕನಿಗೆ ಪೋಷಕರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ ಹೇಗೆ ಶ್ರೀರಕ್ಷೆಯಾಗಲಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, या पाल्याला पालकांचे प्रेम व कौटुंबिक पाठबळ कसे लाभेल?`,
        hi: `प्रश्न: ${devoteeName}, इस बालक को माता-पिता का स्नेह एवं पारिवारिक संरक्षण किस प्रकार प्राप्त होगा?`,
        te: `ప్రశ్న: ${devoteeName}, ఈ పిల్లలకు తల్లిదండ్రుల ఆశీస్సులు మరియు కుటుంబ ప్రేమ ఎలా రక్షణగా ఉంటాయి?`,
        ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தைக்கு பெற்றோரின் அன்பும் குடும்ப அரவணைப்பும் எவ்வாறு அமையும்?`,
        en: `Question: ${devoteeName}, how do parental affection and familial harmony fortify this young life's destiny?`
      }, targetLang)
      : pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಾಮರಸ್ಯ ಹೇಗಿರಲಿದೆ ಹಾಗೂ ಸಂಗಾತಿಯೊಂದಿಗೆ ಉಂಟಾಗುವ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಹೇಗೆ ನಿವಾರಿಸಿಕೊಳ್ಳಬೇಕು?`,
        mr: `प्रश्न: ${devoteeName}, आपल्या वैवाहिक जीवनात सुख कसे राहील व जोडीदाराशी मतभेद कसे दूर करावेत?`,
        hi: `प्रश्न: ${devoteeName}, आपके दांपत्य जीवन में कैसा सामंजस्य रहेगा एवं जीवनसाथी के साथ वैचारिक मतभेदों का शमन कैसे करें?`,
        te: `ప్రశ్న: ${devoteeName}, మీ దాంపత్య జీవితంలో శాంతి ఎలా ఉంటుంది మరియు భాగస్వామితో అభిప్రాయ భేదాలను ఎలా అధిగమించాలి?`,
        ta: `கேள்வி: ${devoteeName}, உங்கள் தாம்பத்திய வாழ்க்கையில் ஒற்றுமை எவ்வாறு இருக்கும்? கருத்து வேறுபாடுகளை எவ்வாறு சரிசெய்வது?`,
        en: `Question: ${devoteeName}, what planetary currents govern your marital harmony and partnership compatibility?`
      }, targetLang),
    paragraphs: [
      pick6({
        kn: isMinor
          ? `${devoteeName}, ಮುಗ್ಧ ಮನಸ್ಸಿನ ಜಾತಕದಲ್ಲಿ ೪ನೇ ಮನೆಯು ತಾಯಿಯ ಪ್ರೀತಿ ಹಾಗೂ ಗೃಹ ಶಾಂತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಚಂದ್ರ ಮತ್ತು ಶುಕ್ರರ ಅನುಕೂಲಕರ ಸ್ಥಾನವು ಮಗುವಿಗೆ ಕುಟುಂಬದಿಂದ ಅಪಾರ ಮಮತೆ ಹಾಗೂ ಸುರಕ್ಷತೆಯನ್ನು ಒದಗಿಸುತ್ತಿದೆ. ಪೋಷಕರ ಪರಸ್ಪರ ಗೌರವಯುತ ವರ್ತನೆಯು ಮಗುವಿನ ಮಾನಸಿಕ ಆರೋಗ್ಯವನ್ನು ಸದೃಢವಾಗಿ ಬೆಳೆಸಲಿದೆ.`
          : `${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ೭ನೇ ಮನೆಯ ಅಧಿಪತಿ ${house7Info.lordName} (${n(house7Info.placedHouse)}ನೇ ಭಾವ, ${house7Info.placedRashi}) ಹಾಗೂ ಶುಕ್ರ-ಗುರುಗಳ ಸ್ಥಿತಿಯನ್ನು ಅವಲೋಕಿಸಿದಾಗ, ${isUnmarriedAdult ? "ನಿಮ್ಮ ಭಾವಿ ಸಂಗಾತಿಯು ಸ್ವಾಭಿಮಾನಿ, ಧಾರ್ಮಿಕ ಪ್ರಜ್ಞೆ ಹೊಂದಿದ ಹಾಗೂ ಕುಟುಂಬದ ಗೌರವವನ್ನು ಕಾಪಾಡುವ ಸತ್ಪಾತ್ರರಾಗಿರುತ್ತಾರೆ" : "ನಿಮ್ಮ ಸಂಗಾತಿಯು ಸ್ವಾಭಿಮಾನಿ, ಧಾರ್ಮಿಕ ಪ್ರಜ್ಞೆ ಹೊಂದಿದ ಹಾಗೂ ಕುಟುಂಬದ ಗೌರವವನ್ನು ಕಾಪಾಡುವ ವ್ಯಕ್ತಿಯಾಗಿರುತ್ತಾರೆ"}. ಪರಸ್ಪರ ಅಹಂ ಬಿಟ್ಟು ತಾಳ್ಮೆಯಿಂದ ಸಂವಹನ ನಡೆಸುವುದು ಸಂಬಂಧವನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.`,
        mr: isMinor
          ? `${devoteeName}, बालकाच्या कुंडलीत चतुर्थ स्थान मातृप्रेम व कौटुंबिक शांतता दर्शवते. चंद्र व शुक्राची स्थिती मुलाला घरातून उत्तम माया व संस्कार देईल.`
          : `${devoteeName}, आपल्या कुंडलीतील सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वे स्थान, ${house7Info.placedRashi}) व शुक्राची स्थिती पाहता ${isUnmarriedAdult ? "योग्य वेळी सुसंस्कृत जोडीदाराचा योग दिसून येतो" : "आपला जोडीदार स्वाभिमानी, सुसंस्कृत व समजूतदार असेल"}. मात्र लहान-सहान मतभेद संवादातून सोडवावेत.`,
        hi: isMinor
          ? `${devoteeName}, बालक की कुंडली में चतुर्थ भाव मातृस्नेह एवं गृह शांति का प्रतीक है। चंद्र एवं शुक्र की अनुकूलता बालक को परिवार का अखंड वात्सल्य प्रदान करेगी।`
          : `${devoteeName}, आपकी कुंडली में सप्तमेश ${house7Info.lordName} (${n(house7Info.placedHouse)}वां भाव, ${house7Info.placedRashi}) एवं शुक्र की स्थिति इंगित करती है कि ${isUnmarriedAdult ? "उपयुक्त समय पर सुयोग्य, धर्मात्मा जीवनसाथी का संयोग प्रबल है" : "आपके जीवनसाथी स्वाभिमानी, धार्मिक एवं कर्तव्यनिष्ठ हैं"}। परस्पर सम्मान से संबंध प्रगाढ़ रहेंगे।`,
        te: isMinor
          ? `${devoteeName}, చిన్నారికి తల్లిదండ్రుల నుండి సంపూర్ణ ప్రేమ, ఆప్యాయతలు లభిస్తాయి. ఇంట్లో శాంతియుత వాతావరణం ఉంటుంది.`
          : `${devoteeName}, మీ జాతకంలో 7వ అధిపతి ${house7Info.lordName} (${n(house7Info.placedHouse)}వ స్థానం, ${house7Info.placedRashi}) స్థితి వల్ల ${isUnmarriedAdult ? "ఉత్తమ గుణాలు గల భాగస్వామితో శుభ కలయిక" : "మీ భాగస్వామి మంచి వ్యక్తిత్వం, బాధ్యత గలవారు"} లభిస్తారు. చిన్న విషయాల్లో పట్టింపులు వద్దు.`,
        ta: isMinor
          ? `${devoteeName}, குழந்தையின் ஜாதகத்தில் 4-ஆம் வீடு தாயின் பாசத்தையும் இல்லற அமைதியையும் குறிக்கிறது. குடும்பத்தின் அன்பு குழந்தையை நல்ல முறையில் வளர்க்கும்.`
          : `${devoteeName}, உங்கள் ஜாதகத்தில் 7-ம் அதிபதி ${house7Info.lordName} (${n(house7Info.placedHouse)}-ம் வீடு, ${house7Info.placedRashi}) இருப்பதால் ${isUnmarriedAdult ? "நற்குணம் கொண்ட துணை உரிய காலத்தில் அமைவார்" : "உங்கள் வாழ்க்கைத்துணை சுயமரியாதையும் ஆன்மீக சிந்தனையும் கொண்டவர்"}. விட்டுக்கொடுத்து செல்வது அமைதி தரும்.`,
        en: isMinor
          ? `${devoteeName}, examining the domestic quadrant (4th house), harmonious Moon and Venus placements envelop this young life in unconditional maternal protection and emotional security.`
          : `${devoteeName}, evaluating your 7th house lord ${house7Info.lordName} in House ${house7Info.placedHouse} (${house7Info.placedRashi}) alongside Venus illuminates ${isUnmarriedAdult ? "auspicious upcoming alliance harmony with a dignified, principled partner" : "deep partnership dynamics where mutual self-respect anchors loyalty"}. Gentle dialogue effortlessly cools pride-driven friction.`
      }, targetLang),
      pick6({
        kn: isMinor
          ? `ಮನೆಯಲ್ಲಿ ಸದಾ ಶಾಂತಿ ನೆಲೆಸಲು: ಹಿರಿಯರ ನಡುವಿನ ಕಲಹಗಳು ಮಗುವಿನ ಎದುರು ನಡೆಯದಂತೆ ಎಚ್ಚರ ವಹಿಸಿ. ಮಗುವಿನ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿದೇವತೆಯನ್ನು ಪ್ರಾರ್ಥಿಸುವುದು ಕುಟುಂಬದ ಬಾಂಧವ್ಯವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.`
          : `ದಾಂಪತ್ಯದಲ್ಲಿ ಮಾಧುರ್ಯ ತುಂಬಲು: ಮುಕ್ತ ಸಂವಹನ ಹಾಗೂ ಒಬ್ಬರ ಅಭಿಪ್ರಾಯವನ್ನು ಇನ್ನೊಬ್ಬರು ಗೌರವಿಸುವುದು ಅತ್ಯಂತ ಮುಖ್ಯ. ಕೆಲಸದ ಒತ್ತಡವನ್ನು ಮನೆಗೆ ತರದೆ, ಪ್ರತಿದಿನ ಸಂಜೆ ಕುಟುಂಬದೊಂದಿಗೆ ಕನಿಷ್ಠ ೨೦ ನಿಮಿಷ ನಗುಮುಖದಿಂದ ಕಳೆಯುವುದು ಸಂಬಂಧದಲ್ಲಿ ನವ ಚೈತನ್ಯವನ್ನು ತುಂಬುತ್ತದೆ.`,
        mr: isMinor
          ? `घरात शांत व आनंदी वातावरण ठेवा, जेणेकरून बालकाच्या मनावर चांगला परिणाम होईल.`
          : `नात्यातील गोडवा वाढवण्यासाठी: संवाद स्पष्ट ठेवा आणि कामाचा ताण घरी आणू नका. दररोज जोडीदारासोबत काही वेळ आनंदाने घालवा.`,
        hi: isMinor
          ? `पारिवारिक सौहार्द हेतु गृह क्लेश से बचें, जिससे बालक के मन पर सकारात्मक प्रभाव पड़े।`
          : `दांपत्य में मधुरता का सूत्र: अहंकार का त्याग एवं परस्पर संवाद को प्राथमिकता दें। कार्यक्षेत्र का तनाव घर पर न लाएं और एक-दूसरे के दृष्टिकोण का सम्मान करें।`,
        te: isMinor
          ? `ఇంట్లో ప్రశాంత వాతావరణం ఉండేలా చూసుకోండి. ఇది పిల్లల మనస్సుపై మంచి ప్రభావం చూపుతుంది.`
          : `దాంపత్య జీవితంలో ఒకరినొకరు అర్థం చేసుకుని ముందుకు సాగాలి. ఇంట్లో పని ఒత్తిడిని చూపించకుండా ప్రశాంతంగా ఉండండి.`,
        ta: isMinor
          ? `வீட்டில் அமைதியான சூழ்நிலையை பராமரிக்கவும்; இது குழந்தையின் மனவளர்ச்சிக்கு மிகவும் நல்லது.`
          : `தாம்பத்தியத்தில் மகிழ்ச்சி நிலவ: திறந்த மனதுடன் பேசுவதும், வேலைப்பளுவை வீட்டுக்குள் கொண்டு வராமல் இருப்பதும் அத்தியாவசியமாகும்.`,
        en: isMinor
          ? `Protecting this innocent sanctum: shield the child from adult domestic disagreements, allowing their gentle psychological foundation to anchor in laughter and affection.`
          : `Harmonizing the domestic altar: banish workplace stress at the doorstep and allocate 20 minutes of attentive evening presence to your partner without electronic distractions.`
      }, targetLang),
      pick6({
        kn: isMinor
          ? `ಕುಟುಂಬದ ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆಗಾಗಿ: ಮಂಗಳವಾರ ಅಥವಾ ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಸಾಂಬ್ರಾಣಿ ಧೂಪ ಹಾಕಿ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಭಸ್ಮವನ್ನು ಹಣೆಗೆ ಧರಿಸಿ.`
          : `ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿಗಾಗಿ ಪರಿಹಾರ: ಶುಕ್ರವಾರ ಗೌರಿ-ಶಂಕರರ ಆರಾಧನೆ ಮಾಡಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ದಾಂಪತ್ಯದ ಸಕಲ ಮನಸ್ತಾಪಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೀರ್ಘಕಾಲಿಕ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುತ್ತದೆ.`,
        mr: isMinor
          ? `घरातील दृष्ट काढण्यासाठी मंगळवारी किंवा शुक्रवारी धूप-दीप लावा.`
          : `वैवाहिक सौख्यासाठी: शुक्रवारी गौरी-शंकराची पूजा करा. गोकर्णात उमा-महेश्वर पूजा केल्याने दाम्पत्य जीवनातील वाद मिटून प्रेम वाढेल.`,
        hi: isMinor
          ? `पारिवारिक सुख-शांति हेतु मंगलवार अथवा शुक्रवार को घर में गुग्गल धूप दें।`
          : `दांपत्य सुख एवं अखंड सौभाग्य हेतु: शुक्रवार को उमा-महेश्वर अथवा शिव-पार्वती की आराधना करें। श्री गोकर्ण धाम में उमा-महेश्वर पूजा का संकल्प कराने से दांपत्य के समस्त क्लेश शांत होते हैं।`,
        te: isMinor
          ? `ఇంటికి దిష్టి తగలకుండా మంగళ లేదా శుక్రవారాల్లో ధూపం వేయండి.`
          : `దాంపత్య సౌఖ్యం కొరకు: శుక్రవారం పార్వతీ-పరమేశ్వరులను పూజించండి. గోకర్ణంలో ఉమా-మహేశ్వర పూజ చేయించడం వల్ల అనుకూలత పెరుగుతుంది.`,
        ta: isMinor
          ? `குடும்ப திருஷ்டி நீங்க செவ்வாய் அல்லது வெள்ளிக்கிழமைகளில் வீட்டில் சாம்பிராணி தூபம் போடவும்.`
          : `தாம்பத்திய ஒற்றுமைக்கு: வெள்ளிக்கிழமைகளில் உமா-மகேஸ்வரரை வழிபடவும். கோகர்ணத்தில் உமா-மகேஸ்வர பூஜை செய்ய கருத்து வேறுபாடுகள் நீங்கி இன்பம் பெருகும்.`,
        en: isMinor
          ? `To shield the family hearth from negative energies: burn pure Guggulu/Sambrani resin on Tuesdays and Fridays, applying consecrated Gokarna Vibhuti.`
          : `For enduring conjugal felicity: worship the divine archetype of Uma-Maheshwara on Fridays. Sponsoring an authentic Uma-Maheshwara Archana at Sri Kshetra Gokarna dissolves latent marital dissonance and recharges domestic devotion.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ದಾಂಪತ್ಯ ಕವಚ", mr: "वैवाहिक कवच", hi: "दांपत्य रक्षा", te: "దాంపత్య కవచం", ta: "தாம்பத்திய கவசம்", en: "Conjugal Sanctuary" }, targetLang),
    practicalGuidance: pick6({
      kn: isMinor
        ? "ಪ್ರತಿ ಶುಕ್ರವಾರ ಪೋಷಕರ ಪಾದಗಳಿಗೆ ನಮಸ್ಕರಿಸಿ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ; ಕುಟುಂಬದಲ್ಲಿ ಪ್ರೀತಿ ಹಾಗೂ ಗೌರವವನ್ನು ಕಾಪಾಡಿ."
        : "ಪ್ರತಿ ಶುಕ್ರವಾರ ಸಂಜೆ ದೇವರಿಗೆ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ; ಸಂಗಾತಿಯೊಂದಿಗೆ ವಾದಕ್ಕಿಳಿಯದೆ ಪ್ರೀತಿಯಿಂದ ವರ್ತಿಸಿ.",
      mr: isMinor
        ? "दररोज सकाळी आई-वडिलांच्या चरणस्पर्श करून आशीर्वाद घ्या व घरात प्रेमाने वागा."
        : "दर शुक्रवारी पांढरी फुले वाहून देवापुढे तुपाचा दिवा लावा व जोडीदाराशी नम्रतेने वागा.",
      hi: isMinor
        ? "नित्य प्रातः माता-पिता का चरण स्पर्श कर आशीर्वाद लें एवं परिवार में स्नेह बनाए रखें।"
        : "प्रत्येक शुक्रवार को पूजा स्थल पर सफेद पुष्प अर्पित कर घी का दीपक प्रज्वलित करें एवं जीवनसाथी के साथ सामंजस्य बनाए रखें।",
      te: isMinor
        ? "ప్రతిరోజూ తల్లిదండ్రులకు నమస్కరించి ఆశీస్సులు తీసుకోండి; ఇంట్లో అందరితో ప్రేమగా ఉండండి."
        : "శుక్రవారం నాడు తెల్లటి పూలతో పూజ చేసి నెయ్యి దీపం వెలిగించండి. భాగస్వామితో వాదనలకు దిగకండి.",
      ta: isMinor
        ? "தினமும் பெற்றோரை வணங்கி ஆசி பெறுங்கள்; வீட்டில் அன்பும் அமைதியும் நிலைக்கும்."
        : "வெள்ளிக்கிழமைகளில் வெள்ளை மலர்களால் இறைவனை வணங்கி நெய் தீபம் ஏற்றவும்; துணையுடன் வீண் வாக்குவாதங்களை தவிர்க்கவும்.",
      en: isMinor
        ? "Show daily reverence to parents and elders each morning; mutual affection fills the home with celestial protection."
        : "Light a pure cow-ghee lamp with white jasmine flowers at your home shrine on Fridays, consciously choosing affection over argumentative debates."
    }, targetLang)
  });

  // CHAPTER 15: Family, Progeny & Creative Lineage (5th House)
  chapters.push({
    chapterNumber: 15,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isMinor
      ? pick6({
        kn: "ಜ್ಞಾನ ಸಂಪತ್ತು, ಸೃಜನಶೀಲತೆ & ಹಿರಿಯರ ಆಶೀರ್ವಾದದ ಬೆಳಕು",
        mr: "ज्ञान संपत्ती, सर्जनशीलता व पूर्वजांचे आशीर्वाद",
        hi: "ज्ञान संपदा, सृजनशीलता एवं पितृ कृपा का आलोक",
        te: "జ్ఞాన సంపద, సృజనాత్మకత & పూర్వీకుల ఆశీర్వాదం",
        ta: "ஞானச் செல்வம், படைப்பாற்றல் & முன்னோர்களின் ஆசி",
        en: "Creative Intellect, Pure Wisdom & Ancestral Blessings"
      }, targetLang)
      : pick6({
        kn: "ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಭವಿಷ್ಯ, ಸೃಜನಶೀಲ ಬುದ್ಧಿ & ವಂಶ ವೃದ್ಧಿ",
        mr: "संतती सुख, मुलांचे भविष्य, सृजनशीलता व वंशवृद्धी",
        hi: "संतति सुख, संतानों का भविष्य, मेधा शक्ति एवं वंश वृद्धि",
        te: "సంతాన భాగ్యం, పిల్లల భవిష్యత్తు, మేధోశక్తి & వంశాభివృద్ధి",
        ta: "சந்தான பாக்கியம், குழந்தைகளின் எதிர்காலம், புத்திக்கூர்மை & வம்ச விருத்தி",
        en: "Progeny Fortunes, Children's Trajectory, Creative Wisdom & Lineage Continuity"
      }, targetLang),
    icon: "🌱",
    question: isMinor
      ? pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಕಂದನ ಸೃಜನಶೀಲ ಬುದ್ಧಿಶಕ್ತಿ ಹಾಗೂ ಜ್ಞಾನ ವಿಕಾಸಕ್ಕೆ ಯಾವ ಗ್ರಹಗಳು ಶಕ್ತಿ ತುಂಬುತ್ತಿವೆ?`,
        mr: `प्रश्न: ${devoteeName}, या पाल्याच्या बुद्धिमत्ता व ज्ञानाला कोणते ग्रह बळ देत आहेत?`,
        hi: `प्रश्न: ${devoteeName}, इस बालक की मेधा शक्ति एवं ज्ञान के विकास को कौन से ग्रह पोषित कर रहे हैं?`,
        te: `ప్రశ్న: ${devoteeName}, ఈ చిన్నారి తెలివితేటలు, జ్ఞాన వికాసానికి ఏ గ్రహాలు బలాన్నిస్తున్నాయి?`,
        ta: `கேள்வி: ${devoteeName}, இந்தக் குழந்தையின் படைப்பாற்றல் மற்றும் அறிவு வளர்ச்சிக்கு எந்த கிரகங்கள் துணை நிற்கின்றன?`,
        en: `Question: ${devoteeName}, which celestial currents catalyze this young mind's creative intelligence and retention?`
      }, targetLang)
      : pick6({
        kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯಸ್ಸು ಹಾಗೂ ವಂಶದ ಕೀರ್ತಿಯ ಬೆಳವಣಿಗೆ ಹೇಗಿದೆ?`,
        mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत संतती सुख, मुलांची प्रगती व कुलवृद्धी कशी दर्शवली आहे?`,
        hi: `प्रश्न: ${devoteeName}, आपकी जन्म कुंडली में संतति सुख, बच्चों की उन्नति एवं कुल की प्रतिष्ठा के विषय में क्या योग हैं?`,
        te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో సంతాన సౌఖ్యం, పిల్లల ఎదుగుదల మరియు వంశాభివృద్ధి ఎలా ఉంది?`,
        ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் குழந்தை பாக்கியம், பிள்ளைகளின் வளர்ச்சி மற்றும் வம்ச பெருமை எவ்வாறு உள்ளது?`,
        en: `Question: ${devoteeName}, what planetary indicators govern your progeny fortunes, children's upliftment, and intellectual lineage?`
      }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ೫ನೇ ಮನೆಯು (ಪೂರ್ವ ಪುಣ್ಯ ಸ್ಥಾನ) ಮನುಷ್ಯನ ಬುದ್ಧಿವಂತಿಕೆ, ಉನ್ನತ ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯದ ದರ್ಪಣವಾಗಿದೆ. ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಪಂಚಮೇಶ ${house5Info.lordName} ಗ್ರಹವು ${n(house5Info.placedHouse)}ನೇ ಭಾವದಲ್ಲಿ (${house5Info.placedRashi}) ಸ್ಥಿತವಾಗಿರುವುದನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮಲ್ಲಿ ಆಳವಾದ ಕಲ್ಪನಾಶಕ್ತಿ ಹಾಗೂ ವಂಶದ ಗೌರವವನ್ನು ಕಾಪಾಡುವ ಉದಾತ್ತ ಚಿಂತನೆಗಳಿವೆ.`,
        mr: `${devoteeName}, पत्रिकेत ५ वे स्थान हे पूर्वपुण्य, बुद्धिमत्ता व संततीचे असते. पंचमेश ${house5Info.lordName} (${n(house5Info.placedHouse)}वे स्थान, ${house5Info.placedRashi}) ची स्थिती दर्शवते की आपल्याकडे उत्तम कल्पनाशक्ती व कुळाचा सन्मान वाढवणारी प्रतिभा आहे.`,
        hi: `${devoteeName}, वैदिक ज्योतिष में पंचम भाव पूर्व संचित पुण्यों, मेधा शक्ति एवं संतति सुख का दर्पण है। आपकी कुंडली में पंचमेश ${house5Info.lordName} का ${n(house5Info.placedHouse)}वें भाव (${house5Info.placedRashi}) में स्थित होना प्रमाणित करता है कि आप दूरदर्शी, विवेकशील एवं पारिवारिक मूल्यों के संवाहक हैं।`,
        te: `${devoteeName}, జాతకంలో 5వ స్థానం పూర్వ పుణ్యం, తెలివితేటలు మరియు సంతానానికి సూచిక. పంచమాధిపతి ${house5Info.lordName} (${n(house5Info.placedHouse)}వ స్థానం, ${house5Info.placedRashi}) వల్ల మంచి మేధోశక్తి మరియు వంశ గౌరవం లభిస్తాయి.`,
        ta: `${devoteeName}, ஜாதகத்தில் 5-ஆம் இடம் பூர்வ புண்ணியம், அறிவு மற்றும் புத்திர பாக்கியத்தைக் குறிக்கிறது. 5-ம் அதிபதி ${house5Info.lordName} (${n(house5Info.placedHouse)}-ம் வீடு, ${house5Info.placedRashi}) உங்கள் புத்தி கூர்மையையும் வம்ச கௌரவத்தையும் உயர்த்துவார்.`,
        en: `${devoteeName}, in authentic Jyotish, the 5th house (Purva Punya Bhava) mirrors prior merit, intuitive intelligence, and lineage continuity. With 5th lord ${house5Info.lordName} residing in House ${house5Info.placedHouse} (${house5Info.placedRashi}), your chart confirms sharp analytical discernment anchored in cultural wisdom.`
      }, targetLang),
      pick6({
        kn: isMinor
          ? `ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ: ಸೃಜನಶೀಲ ಕಲೆ, ಸಂಗೀತ ಅಥವಾ ವಿಜ್ಞಾನದ ಕಡೆಗೆ ಒಲವು ಹೆಚ್ಚಿರಲಿದೆ. ಗುರು ಕೃಪೆಯಿಂದ ಉತ್ತಮ ಗುರುಗಳ ಮಾರ್ಗದರ್ಶನ ಲಭ್ಯವಾಗಲಿದ್ದು, ಮಗುವು ಸಮಾಜದಲ್ಲಿ ಸತ್ಪ್ರಜೆಯಾಗಿ ಹೊರಹೊಮ್ಮಲಿದೆ.`
          : `ಸಂತಾನ ಮತ್ತು ಮಕ್ಕಳ ವಿಷಯದಲ್ಲಿ: ಮಕ್ಕಳು ಉತ್ತಮ ಸಂಸ್ಕಾರ ಹಾಗೂ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಪ್ರದರ್ಶಿಸಲಿದ್ದಾರೆ. ಅವರ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶನವು ದಾರಿದೀಪವಾಗಲಿದೆ. ಮಕ್ಕಳೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಸ್ನೇಹವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಅವರ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಗಗನಕ್ಕೇರಿಸುತ್ತದೆ.`,
        mr: isMinor
          ? `मुलांना कला, संगीत किंवा विज्ञानाची आवड निर्माण होईल. उत्तम शिक्षकांचे मार्गदर्शन लाभेल.`
          : `मुलांच्या बाबतीत: मुले सुसंस्कृत व हुशार निघतील. त्यांच्याशी मैत्रीपूर्ण नाते ठेवा, ज्यामुळे त्यांचा आत्मविश्वास वाढेल.`,
        hi: isMinor
          ? `बालक की विद्या में कला, विज्ञान अथवा संगीत के प्रति विशेष आकर्षण रहेगा तथा सुयोग्य गुरुजनों का सान्निध्य प्राप्त होगा।`
          : `संतान एवं कुल के संबंध में: आपकी संताने कुशाग्र बुद्धि एवं संस्कारी स्वभाव की होंगी। उनके अध्ययन एवं करियर में आपका स्नेहपूर्ण मार्गदर्शन मील का पत्थर सिद्ध होगा। बच्चों से मित्रवत संवाद बनाए रखें।`,
        te: isMinor
          ? `పిల్లలకు కళలు లేదా సైన్స్ రంగాల్లో ఆసక్తి ఉంటుంది. మంచి గురువుల మార్గదర్శకత్వం లభిస్తుంది.`
          : `పిల్లలు మంచి తెలివితేటలు కలిగి ఉంటారు. వారితో స్నేహపూర్వకంగా ఉండడం వల్ల వారి ఆత్మవిశ్వాసం పెరుగుతుంది.`,
        ta: isMinor
          ? `கல்வியில் கலை அல்லது அறிவியல் துறையில் ஆர்வம் இருக்கும். நல்ல ஆசான்களின் வழிகாட்டல் கிடைக்கும்.`
          : `பிள்ளைகள் நல்ல அறிவாற்றலும் நற்குணமும் கொண்டிருப்பர். அவர்களுடன் நண்பனைப் போல பழகுவது அவர்களின் தன்னம்பிக்கையை உயர்த்தும்.`,
        en: isMinor
          ? `Educational trajectory: the young native demonstrates natural resonance with sciences, design, or literature, blessed to attract dedicated pedagogues who recognize latent genius.`
          : `Regarding progeny: your offspring inherit mental acuity and resilience. Approaching generational dialogues with empathetic mentorship rather than rigid dogma ensures enduring emotional alliance.`
      }, targetLang),
      pick6({
        kn: `ಸಂತಾನ ಶ್ರೇಯಸ್ಸು ಹಾಗೂ ವಂಶೋದ್ಧಾರಕ್ಕಾಗಿ ಪರಿಹಾರ: ಪ್ರತಿ ಗುರುವಾರ 'ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ' ಅಥವಾ ಗಾಯತ್ರೀ ಮಂತ್ರವನ್ನು ೨೧ ಬಾರಿ ಜಪಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಅಥವಾ ನಾಗ ಪ್ರತಿಷ್ಠಾಪನಾ ಪೂಜೆಯ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಪಿತೃ-ಸರ್ಪ ದೋಷಗಳು ಶಮನವಾಗಿ, ಮಕ್ಕಳ ಭವಿಷ್ಯವು ಬಂಗಾರದಂತೆ ಹೊಳೆಯುತ್ತದೆ.`,
        mr: `संतती कल्याणासाठी: दर गुरुवारी 'संतान गोपाल मंत्र' किंवा गायत्री मंत्र २१ वेळा म्हणा. गोकर्णात रुद्राभिषेक केल्याने मुलांचे भविष्य उज्ज्वल होईल.`,
        hi: `संतति कल्याण एवं कुल की वृद्धि हेतु: प्रत्येक गुरुवार को २१ बार 'संतान गोपाल मंत्र' अथवा 'गायत्री मंत्र' का जप करें। श्री गोकर्ण धाम में रुद्राभिषेक का संकल्प लेने से पूर्वजन्म के दोष शांत होते हैं और संतानों का भाग्योदय होता है।`,
        te: `సంతాన క్షేమం కొరకు: గురువారం నాడు సంతాన గోపాల మంత్రం లేదా గాయత్రి మంత్రం 21 సార్లు జపించండి. గోకర్ణంలో పూజ చేయించడం శ్రేయస్కరం.`,
        ta: `சந்தான நலனுக்கு: வியாழக்கிழமைகளில் 'சந்தான கோபால மந்திரம்' அல்லது காயத்ரி மந்திரம் 21 முறை சொல்லவும். கோகர்ணத்தில் வழிபாடு செய்வது பிள்ளைகளின் எதிர்காலத்தை பிரகாசமாக்கும்.`,
        en: `To empower the family lineage: chant the Santana Gopala Mantra or Sacred Gayatri 21 times on Thursdays. Sponsoring an auspicious Sankalpa at Sri Kshetra Gokarna dissolves latent Pitru or Sarpa friction and blesses children with longevity and renown.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಸಂತಾನ ರಕ್ಷಾ ಕವಚ", mr: "संतती संरक्षण", hi: "संतति रक्षा कवच", te: "సంతాన రక్షా కవచం", ta: "சந்தான ரக்ஷா கவசம்", en: "Lineage Fortification" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಮಕ್ಕಳಿಗೆ ಅಥವಾ ಕಿರಿಯರಿಗೆ ಸದಾ ಆಶೀರ್ವಾದದ ಮಾತುಗಳನ್ನಾಡಿ; ಹಿರಿಯರ ಫೋಟೋಗೆ ನಿತ್ಯವೂ ನಮಸ್ಕರಿಸಿ ಅವರ ಕೃಪೆಯನ್ನು ಪಡೆಯಿರಿ.",
      mr: "मुलांना नेहमी शुभाशीर्वाद द्या व घरातील पूर्वजांच्या तसबिरीला नित्य नमस्कार करा.",
      hi: "बच्चों को सदैव शुभ वचन एवं आशीर्वाद दें तथा घर में पूर्वजों के चित्र को नमन कर उनका अनुग्रह प्राप्त करें।",
      te: "పిల్లలను ఎల్లప్పుడూ ఆశీర్వదించండి. పూర్వీకులను స్మరించుకుని నమస్కరించండి.",
      ta: "பிள்ளைகளை எப்போதும் வாழ்த்துங்கள்; முன்னோர்களின் படங்களை வணங்கி அவர்களின் ஆசியைப் பெறுங்கள்.",
      en: "Bestow deliberate verbal blessings upon children each morning, and bow reverently before departed ancestral portraits to maintain protective generational shielding."
    }, targetLang)
  });

  // CHAPTER 16: Health, Vitality & Longevity Safeguards (6th, 8th Houses & Lagnesha)
  chapters.push({
    chapterNumber: 16,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: pick6({
      kn: "ಆರೋಗ್ಯ, ಜೀವಶಕ್ತಿ, ದೀರ್ಘಾಯುಷ್ಯ & ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ರಕ್ಷಾ ಕವಚ",
      mr: "आरोग्य, ऊर्जा, दीर्घायुष्य व नकारात्मक ऊर्जा संरक्षण",
      hi: "स्वास्थ्य, प्राण ऊर्जा, दीर्घायु एवं नकारात्मक ऊर्जा सुरक्षा कवच",
      te: "ఆరోగ్యం, జీవశక్తి, దీర్ఘాయువు & రక్షా కవచం",
      ta: "ஆரோக்கியம், பிராண சக்தி, தீர்க்காயுள் & எதிர்மறை சக்தி பாதுகாப்பு",
      en: "Health, Vitality, Longevity Safeguards & Energetic Shield"
    }, targetLang),
    icon: "🛡️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಜೀವಶಕ್ತಿ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಹೇಗಿದೆ ಮತ್ತು ಯಾವ ಕಾಲೋಚಿತ ಅನಾರೋಗ್ಯಗಳಿಂದ ಎಚ್ಚರವಿರಬೇಕು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत आरोग्य व प्राणशक्तीची स्थिती कशी आहे व कोणत्या आजारांपासून सावध राहावे?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में प्राण ऊर्जा एवं स्वास्थ्य की स्थिति क्या है तथा किन मौसमी व्याधियों से सावधान रहना चाहिए?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో ఆరోగ్యం మరియు జీవశక్తి ఎలా ఉన్నాయి మరియు ఏ అనారోగ్యాల పట్ల జాగ్రత్తగా ఉండాలి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் ஆரோக்கியம் மற்றும் ஆயுள் பலம் எவ்வாறு உள்ளது? எந்த நோய்களில் எச்சரிக்கை தேவை?`,
      en: `Question: ${devoteeName}, what physiological markers govern your physical vitality, and which energetic imbalances require mitigation?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ವೈದಿಕ ಆಯುರ್ವೇದ ಜ್ಯೋತಿಷ್ಯದ ಪ್ರಕಾರ ಲಗ್ನವು ದೇಹದ ಚೈತನ್ಯ ಹಾಗೂ ೬ನೇ ಮನೆಯು ರೋಗ-ಋಣ-ಶತ್ರುಗಳ ಸ್ಥಾನವಾಗಿದೆ. ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ೬ನೇ ಅಧಿಪತಿ ${house6Info.lordName} (${n(house6Info.placedHouse)}ನೇ ಮನೆ, ${house6Info.placedRashi}) ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನಿಮ್ಮ ಮೂಲ ಶರೀರವು ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ; ಆದರೆ ಅತಿಯಾದ ಒತ್ತಡ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಅನಿಯಮಿತ ಆಹಾರ ಪದ್ಧತಿಯಿಂದ ವಾತ-ಪಿತ್ತ ದೋಷಗಳು ಉಲ್ಬಣಿಸುವ ಸಾಧ್ಯತೆಯಿದೆ.`,
        mr: `${devoteeName}, ज्योतिष व आयुर्वेदानुसार लग्न स्थान देहाचे आरोग्य व ६ वे स्थान आजारांचे असते. षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वे स्थान, ${house6Info.placedRashi}) च्या स्थितीनुसार आपली मूळ रोगप्रतिकारक शक्ती चांगली आहे; तथापि अतिविचार व अनियमित झोपेमुळे वात-पित्ताचा त्रास होऊ शकतो.`,
        hi: `${devoteeName}, आयुर्वेद एवं ज्योतिष के समन्वयानुसार लग्न देह का प्राण है तथा षष्ठेश ${house6Info.lordName} (${n(house6Info.placedHouse)}वां भाव, ${house6Info.placedRashi}) स्वास्थ्य संतुलन दर्शाते हैं। आपकी मूल रोग-प्रतिरोधक क्षमता सुदृढ़ है; तथापि अत्यधिक श्रम एवं अनियमित दिनचर्या से वात-पित्त असंतुलन की आशंका रहती है।`,
        te: `${devoteeName}, జాతకంలో లగ్నం శరీర బలాన్ని, 6వ అధిపతి ${house6Info.lordName} (${n(house6Info.placedHouse)}వ స్థానం, ${house6Info.placedRashi}) ఆరోగ్య నియమాలను సూచిస్తాయి. రోగనిరోధక శక్తి బాగుంది కానీ ఒత్తిడి, నిద్రలేమి తగ్గించుకోవాలి.`,
        ta: `${devoteeName}, ஜோதிடத்தில் லக்னம் உடல் வலிமையையும், 6-ம் அதிபதி ${house6Info.lordName} (${n(house6Info.placedHouse)}-ம் வீடு, ${house6Info.placedRashi}) நோய் எதிர்ப்பையும் குறிக்கின்றன. மன அழுத்தம் மற்றும் தூக்கமின்மையைத் தவிர்ப்பது ஆரோக்கியத்தைக் காக்கும்.`,
        en: `${devoteeName}, in Astro-Ayurveda, the ascendant commands cellular stamina while 6th lord ${house6Info.lordName} (in House ${house6Info.placedHouse}, ${house6Info.placedRashi}) marks physiological resilience. Constitutional stamina is strong, though prolonged mental tension or erratic sleep provokes Vata-Pitta friction.`
      }, targetLang),
      pick6({
        kn: `ನೀವು ವಹಿಸಬೇಕಾದ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು: ಜೀರ್ಣಾಂಗ ವ್ಯವಸ್ಥೆ, ಕುತ್ತಿಗೆ/ಭುಜದ ಒತ್ತಡ ಹಾಗೂ ಕಣ್ಣಿನ ಆಯಾಸದ ಬಗ್ಗೆ ವಿಶೇಷ ನಿಗಾ ಇರಲಿ. ಅತಿಯಾದ ಖಾರ ಹಾಗೂ ತೈಲಯುಕ್ತ ಆಹಾರವನ್ನು ನಿಯಂತ್ರಿಸಿ. ಪ್ರತಿದಿನ ಕನಿಷ್ಠ ೨ ಲೀಟರ್ ನೀರು ಕುಡಿಯುವುದು ಹಾಗೂ ಪ್ರಕೃತಿಯ ಮಡಿಲಲ್ಲಿ ೧೫ ನಿಮಿಷ ವಾಕಿಂಗ್ ಮಾಡುವುದು ನಿಮ್ಮ ಜೀವಕೋಶಗಳಿಗೆ ನವ ಚೈತನ್ಯವನ್ನು ನೀಡುತ್ತದೆ.`,
        mr: `काळजी घ्या: पचनसंस्था, डोळे व मानेचे स्नायू यांवर ताण येऊ देऊ नका. तेलकट व तिखट पदार्थ कमी करा. रोज पुरेसे पाणी प्या व हलका व्यायाम करा.`,
        hi: `स्वास्थ्य सावधानियां: पाचन तंत्र, नेत्र एवं गर्दन के तनाव के प्रति सजग रहें। अत्यधिक तैलीय एवं तीखे भोजन का त्याग करें। प्रचुर मात्रा में जल का सेवन एवं नित्य १५ मिनट खुली हवा में भ्रमण आपको नवऊर्जा प्रदान करेगा।`,
        te: `తీసుకోవాల్సిన జాగ్రత్తలు: జీర్ణవ్యవస్థ, కంటి చూపు పట్ల శ్రద్ధ వహించండి. నూనె, కారం పదార్థాలు తగ్గించి రోజూ నడక అలవాటు చేసుకోండి.`,
        ta: `எச்சரிக்கைகள்: செரிமான மண்டலம் மற்றும் கண்கள் மீது கவனம் தேவை. காரமான, எண்ணெயில் பொரித்த உணவுகளை குறைத்து, தினமும் நடைப்பயிற்சி செய்யுங்கள்.`,
        en: `Physiological focus areas: nurture digestive fire (Agni), mitigate cervical/shoulder strain, and rest optic nerves. Hydrating consistently and engaging in 15 minutes of grounding barefoot walks directly harmonizes bio-energetic rhythms.`
      }, targetLang),
      pick6({
        kn: `ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗಾಗಿ ಪರಿಹಾರ: ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಧನ್ವಂತರಿ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ. ತಾಮ್ರದ ಲೋಟದಲ್ಲಿ ರಾತ್ರಿ ಇಟ್ಟ ನೀರನ್ನು ಮುಂಜಾನೆ ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ಕುಡಿಯುವುದು ದೇಹದ ಕಲ್ಮಶಗಳನ್ನು ಹೊರಹಾಕುತ್ತದೆ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಹೋಮ ಅಥವಾ ಆಯುಷ್ಯ ಹೋಮದ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಅಪಮೃತ್ಯು ಭಯ ನಿವಾರಣೆಯಾಗಿ ಪರಿಪೂರ್ಣ ಆರೋಗ್ಯ ಲಭಿಸುತ್ತದೆ.`,
        mr: `दीर्घायुष्यासाठी उपाय: रोज सकाळी धन्वंतरी मंत्राचा जप करा. तांब्याच्या भांड्यातील पाणी प्या. गोकर्णात महामृत्युंजय जप केल्याने सर्व आजार दूर होऊन दीर्घायुष्य लाभेल.`,
        hi: `दीर्घायु एवं आरोग्य हेतु: नित्य प्रातः भगवान धन्वंतरि का स्मरण करें एवं ताम्रपात्र में रखा जल ग्रहण करें। श्री गोकर्ण धाम में महामृत्युंजय जप अथवा आयुष्मंत होम का संकल्प कराने से अकाल व्याधियों का नाश होकर पूर्णायु प्राप्त होती है।`,
        te: `దీర్ఘాయువు కొరకు: రోజూ ధన్వంతరి మంత్రం జపించండి. రాగి పాత్రలోని నీటిని తాగండి. గోకర్ణంలో మహా మృత్యుంజయ పూజ చేయించడం వల్ల సంపూర్ణ ఆరోగ్యం లభిస్తుంది.`,
        ta: `ஆரோக்கிய பரிகாரம்: தினமும் தன்வந்திரி மந்திரம் சொல்லவும். தாமிர பாத்திரத்தில் வைத்த நீரை காலையில் பருகவும். கோகர்ணத்தில் மிருத்யுஞ்சய பூஜை செய்வது பூரண ஆயுளையும் ஆரோக்கியத்தையும் தரும்.`,
        en: `To fortify longevity and dissolve chronic ailments: invoke Lord Dhanvantari each morning, consuming water stored overnight in a pure copper vessel. Sponsoring a consecrated Maha Mrityunjaya Sankalpa at Sri Kshetra Gokarna erects an impenetrable energetic shield around your physical body.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಆರೋಗ್ಯ ಸಂಜೀವಿನಿ", mr: "आरोग्य संजीवनी", hi: "आरोग्य संजीवनी", te: "ఆరోగ్య సంజీవిని", ta: "ஆரோக்கிய சஞ்சீவினி", en: "Vitality & Longevity Seal" }, targetLang),
    practicalGuidance: pick6({
      kn: "ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಮೊಬೈಲ್ ನೋಡುವ ಅಭ್ಯಾಸ ಬಿಟ್ಟು, ಕಾಲುಗಳನ್ನು ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ತೊಳೆದು ಶಾಂತವಾಗಿ ಮಲಗಿ.",
      mr: "झोपण्यापूर्वी मोबाईल बाजूला ठेवा व पाय स्वच्छ धुवून शांत झोपा.",
      hi: "शयन से ३० मिनट पूर्व डिजिटल स्क्रीन से दूर रहें तथा पैरों को स्वच्छ जल से धोकर शांत मन से विश्राम करें।",
      te: "పడుకునే ముందు మొబైల్ వాడకం తగ్గించి, పాదాలు కడుక్కుని ప్రశాంతంగా నిద్రించండి.",
      ta: "இரவில் தூங்குவதற்கு முன் போன் பார்ப்பதை தவிர்த்து, கால்களை கழுவி நிம்மதியாக தூங்கவும்.",
      en: "Disconnect from all digital screens 30 minutes before sleep; wash your feet in lukewarm water to ground sensory fatigue and restore deep REM cycles."
    }, targetLang)
  });


  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: THE STRATEGIC ROADMAP — EXACT TIMING (Chapters 17 to 22)
  // ──────────────────────────────────────────────────────────────────────────
  const sec4 = pick6({
    kn: "ವಿಭಾಗ ೪: ಕಾಲಮಾನದ ಮಾರ್ಗಸೂಚಿ — ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ದಿಗಂತ",
    mr: "विभाग ४: कालक्रमानुसार मार्गदर्शक — ५ वर्षांची सुवर्ण क्षितिजे",
    hi: "खंड ४: कालक्रम का रणनीतिक पथ — ५-वर्षीय स्वर्णिम क्षितिज",
    te: "విభాగం 4: కాలక్రమ మార్గదర్శి — 5 సంవత్సరాల భవిష్యత్ ప్రణాళిక",
    ta: "பிரிவு 4: காலக்கோடு வழிகாட்டல் — 5 வருட பொற்காலம்",
    en: "Section 4: The Strategic Roadmap — Near-Term & 5-Year Horizon"
  }, targetLang);

  // CHAPTER 17: Months 1–3 Tactical Forecast
  chapters.push({
    chapterNumber: 17,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: "ಮುಂದಿನ ೧–೩ ತಿಂಗಳುಗಳ ತತ್ಕ್ಷಣದ ಮುನ್ನೋಟ & ನಿರ್ಣಾಯಕ ತಿರುವುಗಳು",
      mr: "पुढील १–३ महिन्यांचा तात्काळ अंदाज व महत्त्वाचे निर्णय",
      hi: "आगामी १–३ महीनों का तात्कालिक पूर्वानुमान एवं निर्णायक मोड़",
      te: "రాబోయే 1–3 నెలల తక్షణ ఫలితాలు & కీలక మలుపులు",
      ta: "அடுத்த 1–3 மாதங்களுக்கான உடனடி பலன்கள் & முக்கிய முடிவுகள்",
      en: "Months 1–3 Tactical Horizon — Immediate Crucial Milestones"
    }, targetLang),
    icon: "🧭",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಮುಂಬರುವ ೯೦ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವ ಮಹತ್ವದ ಬದಲಾವಣೆಗಳು ಸಂಭವಿಸಲಿವೆ?`,
      mr: `प्रश्न: ${devoteeName}, आगामी ९० दिवसांत आपल्या आयुष्यात कोणते मोठे बदल घडणार आहेत?`,
      hi: `प्रश्न: ${devoteeName}, आगामी ९० दिनों में आपके जीवन में कौन से महत्वपूर्ण परिवर्तन घटित होने वाले हैं?`,
      te: `ప్రశ్న: ${devoteeName}, రాబోయే 90 రోజుల్లో మీ జీవితంలో ఎలాంటి మార్పులు రాబోతున్నాయి?`,
      ta: `கேள்வி: ${devoteeName}, அடுத்த 90 நாட்களில் உங்கள் வாழ்க்கையில் என்னென்ன முக்கியமான மாற்றங்கள் நிகழவிருக்கின்றன?`,
      en: `Question: ${devoteeName}, what critical developments and milestone decisions will unfold across the next 90 days?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಕಾಲಚಕ್ರದ ಅಲ್ಪಾವಧಿಯ ಗ್ರಹ ಸಂಚಾರವನ್ನು ಅವಲೋಕಿಸಿದಾಗ, ಮುಂಬರುವ ೧ ರಿಂದ ೩ ತಿಂಗಳುಗಳು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ಪುನರಾರಂಭದ ಕಾಲಘಟ್ಟವಾಗಿದೆ. ಸೂರ್ಯ, ಬುಧ ಹಾಗೂ ಮಂಗಳನ ತ್ವರಿತ ಚಲನೆಯು ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನಕ್ಕೆ ಹೊಸ ಚೈತನ್ಯವನ್ನು ನೀಡಲಿದ್ದು, ಹಿಂದಿನ ತಿಂಗಳುಗಳಲ್ಲಿ ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಕೆಲಸಗಳಿಗೆ ಮರುಜೀವ ಸಿಗಲಿದೆ.`,
        mr: `${devoteeName}, आगामी १ ते ३ महिन्यांत सूर्य, बुध व मंगळाच्या हालचाली आपल्या ${lagnaRashiName} लग्नाला नवी ऊर्जा देतील. पूर्वी रखडलेली कामे आता पुन्हा वेग घेतील.`,
        hi: `${devoteeName}, आगामी १ से ३ महीनों का गोचर विश्लेषण स्पष्ट करता है कि सूर्य, बुध एवं मंगल का संचरण आपके ${lagnaRashiName} लग्न में नवचेतना का संचार करेगा। पिछले कुछ समय से अवरुद्ध कार्य अब पुनः गति पकड़ेंगे।`,
        te: `${devoteeName}, రాబోయే 1 నుండి 3 నెలల్లో సూర్య, బుధ, కుజుల సంచారం వల్ల మీ ${lagnaRashiName} లగ్నానికి నూతన ఉత్సాహం లభిస్తుంది. ఆగిపోయిన పనులు మళ్లీ మొదలవుతాయి.`,
        ta: `${devoteeName}, அடுத்த 1 முதல் 3 மாதங்களில் சூரியன், புதன், செவ்வாயின் பெயர்ச்சிகள் உங்கள் ${lagnaRashiName} லக்னத்திற்கு புது வேகத்தை தரும். தடைபட்ட காரியங்கள் இனி சுமுகமாக நடக்கும்.`,
        en: `${devoteeName}, tracking short-cycle solar, mercurial, and martial transits, the incoming 90 days mark a decisive reboot for your ${lagnaRashiName} ascendant. Projects stalled by bureaucratic inertia or self-doubt will suddenly regain momentum.`
      }, targetLang),
      pick6({
        kn: `ಈ ೯೦ ದಿನಗಳ ಪ್ರಮುಖ ಕಾರ್ಯಸೂಚಿ: ಮೊದಲ ೩೦ ದಿನಗಳಲ್ಲಿ ಅನಗತ್ಯ ಗೊಂದಲಗಳನ್ನು ಪರಿಹರಿಸಿಕೊಳ್ಳಿ; ಎರಡನೇ ತಿಂಗಳಲ್ಲಿ ಹೊಸ ಒಪ್ಪಂದ, ಆರ್ಥಿಕ ಯೋಜನೆ ಅಥವಾ ವೃತ್ತಿ ಸಂಬಂಧಿ ಪ್ರಮುಖ ಮಾತುಕತೆಗಳಿಗೆ ಸಕಾಲ. ಮೂರನೇ ತಿಂಗಳಲ್ಲಿ ನಿಮ್ಮ ಪರಿಶ್ರಮದ ಪ್ರಥಮ ಫಲಿತಾಂಶವು ಕಣ್ಣಿಗೆ ಕಾಣಿಸಲಿದೆ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಹಳೆಯ ಶತ್ರುಗಳೊಂದಿಗೆ ವಾದಕ್ಕೆ ಇಳಿಯಬೇಡಿ.`,
        mr: `या ९० दिवसांची दिशा: पहिल्या महिन्यात जुने वाद मिटवा; दुसऱ्या महिन्यात नवीन करार किंवा नोकरीच्या संधींवर लक्ष केंद्रित करा; तिसऱ्या महिन्यात आपल्या कष्टाचे फळ दिसू लागेल.`,
        hi: `इस तिमाही की रणनीति: प्रथम ३० दिनों में लंबित विवादों का निस्तारण करें; द्वितीय मास में नवीन अनुबंध अथवा वित्तीय योजनाओं को गति दें; तृतीय मास में आपको अपने श्रम के प्रत्यक्ष परिणाम दृष्टिगोचर होंगे। व्यर्थ के वाद-विवाद से दूर रहें।`,
        te: `ఈ 90 రోజుల్లో: మొదటి నెలలో పాత సమస్యలను పరిష్కరించుకోండి. రెండవ నెలలో కొత్త ఒప్పందాలు చేసుకోండి. మూడవ నెలలో మీ శ్రమకు ఫలితం కనిపిస్తుంది.`,
        ta: `இந்த 90 நாட்களின் திட்டம்: முதல் மாதத்தில் பழைய சிக்கல்களை பேசித் தீர்க்கவும்; 2-வது மாதத்தில் புதிய தொழில் முயற்சிகளைத் தொடங்கவும்; 3-வது மாதத்தில் உழைப்பிற்கான பலன் கிடைக்கும்.`,
        en: `Quarterly strategic cadence: Month 1 demands tidying administrative backlogs and settling unresolved disputes. Month 2 unlocks the golden window for contract signing or financial allocations. Month 3 delivers tangible validation of your efforts.`
      }, targetLang),
      pick6({
        kn: `ಈ ತ್ರೈಮಾಸಿಕದ ದೈವಿಕ ರಕ್ಷಣೆಗಾಗಿ: ಮಂಗಳವಾರ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಹನುಮಂತನಿಗೆ ಕುಂಕುಮಾರ್ಚನೆ ಮಾಡಿಸಿ. ನಿಮ್ಮ ನಿತ್ಯ ಪೂಜೆಯಲ್ಲಿ 'ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ' ಸ್ಮರಣೆಯು ಯಾವುದೇ ಹಠಾತ್ ಅಡೆತಡೆಗಳು ಬಾರದಂತೆ ನೋಡಿಕೊಳ್ಳುತ್ತದೆ.`,
        mr: `या काळासाठी उपाय: मंगळवारी मारुती किंवा गणपतीची पूजा करा. गोकर्ण महाबळेश्वराचे नित्य स्मरण सर्व अडथळे दूर करेल.`,
        hi: `इस तिमाही का सुरक्षा कवच: मंगलवार को हनुमान चालीसा का पाठ करें एवं सिंदूर अर्पित करें। नित्य श्री गोकर्ण महाबलेश्वर का स्मरण समस्त विघ्नों का शमन करेगा।`,
        te: `ఈ మూడు నెలల రక్షణ కొరకు: మంగళవారం హనుమాన్ చాలీసా పఠించండి. గోకర్ణ మహాబలేశ్వరుని స్మరించడం వల్ల ఆటంకాలు తొలగుతాయి.`,
        ta: `இந்த காலாண்டிற்கான பரிகாரம்: செவ்வாய்க்கிழமைகளில் அனுமன் சாலிசா சொல்லவும். கோகர்ண மகாபலேஸ்வரரை வழிபட எந்தத் தடைகளும் அகலும்.`,
        en: `To safeguard this 90-day trajectory: invoke Lord Hanuman or Kartikeya on Tuesdays, offering sindoor or red flowers. A daily invocation of Sri Kshetra Gokarna Mahabaleshwara dissolves unexpected logistical blockages.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ತ್ರೈಮಾಸಿಕ ದಿಕ್ಸೂಚಿ", mr: "त्रैमासिक दिशा", hi: "त्रैमासिक दिशा", te: "త్రైమాసిక ప్రణాళిక", ta: "காலாண்டு வழிகாட்டல்", en: "Quarterly Tactical Compass" }, targetLang),
    practicalGuidance: pick6({
      kn: isMinor
        ? "ಮುಂದಿನ ೯೦ ದಿನಗಳ ಕಾಲ ಓದಿನಲ್ಲಿ ಏಕಾಗ್ರತೆ ಕಾಪಾಡಿಕೊಂಡು ಅನಗತ್ಯ ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ."
        : "ಮುಂದಿನ ೩ ತಿಂಗಳು ಯಾವುದೇ ದೊಡ್ಡ ಆರ್ಥಿಕ ಸಾಲಕ್ಕೆ ಜಾಮೀನು (ಶ್ಯೂರಿಟಿ) ನೀಡಬೇಡಿ.",
      mr: isMinor
        ? "पुढील ९० दिवस अभ्यासात सातत्य ठेवा व मैदानी खेळ आणि प्रकृतीची काळजी घ्या."
        : "पुढील ३ महिने कोणाच्याही कर्जासाठी जामीन राहू नका.",
      hi: isMinor
        ? "आगामी ९० दिनों तक विद्या एवं स्वास्थ्य के प्रति अनुशासित दिनचर्या अपनाएं।"
        : "आगामी ३ मास तक किसी के भी ऋण हेतु ज़मानती बनने से बचें।",
      te: isMinor
        ? "రాబోయే 90 రోజులు చదువులో ఏకాగ్రత మరియు సమయపాలన పాటించండి."
        : "రాబోయే 3 నెలల పాటు ఎవరి అప్పులకూ జామీను (గ్యారెంటీ) ఇవ్వకండి.",
      ta: isMinor
        ? "அடுத்த 90 நாட்களுக்கு கல்வியிலும் ஆரோக்கியத்திலும் ஒழுக்கமான பழக்கங்களைப் பின்பற்றவும்."
        : "அடுத்த 3 மாதங்களுக்கு பிறரின் கடனுக்கு ஜாமீன் கையெழுத்து போடுவதை தவிர்க்கவும்.",
      en: isMinor
        ? "Maintain disciplined study routines and mindful outdoor rest over the next 90 days."
        : "Refrain strictly from signing surety bonds or acting as loan guarantor for anyone over the next 90 days."
    }, targetLang)
  });

  // CHAPTER 18: Months 4–6 Strategic Consolidation & Bhrigu Bindu
  chapters.push({
    chapterNumber: 18,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: "೪–೬ ತಿಂಗಳುಗಳ ಕಾರ್ಯಸ್ಥಿರತೆ & ಬೃಗು ಬಿಂದು ದೈವಿಕ ತಿರುವು",
      mr: "४–६ महिन्यांचे स्थैर्य व भृगु बिंदूचा दैवी टर्निंग पॉईंट",
      hi: "४–६ महीनों का स्थिरीकरण एवं भृगु बिंदु का दिव्य मोड़",
      te: "4–6 నెలల స్థిరత్వం & భృగు బిందువు దైవిక మలుపు",
      ta: "4–6 மாதங்களின் ஸ்திரத்தன்மை & பிருகு பிந்து திருப்பம்",
      en: "Months 4–6 Strategic Consolidation & Bhrigu Bindu Turning Point"
    }, targetLang),
    icon: "🎯",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಬೃಗು ಬಿಂದು ರಹಸ್ಯದಂತೆ ವರ್ಷದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಯಾವ ಅದೃಷ್ಟದ ತಿರುವು ನಿಮಗಾಗಿ ಕಾದಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या भृगु बिंदूच्या नियमानुसार वर्षाच्या उत्तरार्धात कोणते मोठे अनुकूल वळण येईल?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली के भृगु बिंदु के अनुसार वर्ष के उत्तरार्ध में कौन सा दैवीय मोड़ आपके जीवन को दिशा देगा?`,
      te: `ప్రశ్న: ${devoteeName}, మీ భృగు బిందువు ప్రకారం ఈ సంవత్సరంలో మీకు లభించే అద్భుతమైన అవకాశం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் பிருகு பிந்து ரகசியப்படி இந்த ஆண்டின் பிற்பகுதியில் என்ன விசேஷ திருப்பம் ஏற்படும்?`,
      en: `Question: ${devoteeName}, which destiny turning point is ignited as transit planets cross your sacred Bhrigu Bindu during Months 4–6?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಬೃಗು ಬಿಂದುವು (ರಾಹು ಮತ್ತು ಚಂದ್ರರ ಪರಮ ಪವಿತ್ರ ಮಧ್ಯಬಿಂದು) '${bhriguBinduRashiName}' ರಾಶಿಯಲ್ಲಿದೆ. ಮುಂಬರುವ ೪ ರಿಂದ ೬ ತಿಂಗಳುಗಳ ಅವಧಿಯಲ್ಲಿ ಗೋಚಾರ ಗುರು ಅಥವಾ ಇತರ ಶುಭ ಗ್ರಹಗಳು ಈ ಬಿಂದುವಿನೊಂದಿಗೆ ತ್ರಿಕೋಣ ಅಥವಾ ಕೇಂದ್ರ ದೃಷ್ಟಿಯನ್ನು ಸಾಧಿಸಲಿದ್ದು, ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ಅನಿರೀಕ್ಷಿತ ಅದೃಷ್ಟದ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ.`,
        mr: `${devoteeName}, आपल्या कुंडलीतील भृगु बिंदू (राहु व चंद्राचा मध्यबिंदू) '${bhriguBinduRashiName}' राशीत आहे. पुढील ४ ते ६ महिन्यांत शुभ ग्रहांचे गोचर या बिंदूशी जुळून आल्याने नशिबाची अनपेक्षित दारे उघडतील.`,
        hi: `${devoteeName}, आपकी कुंडली का गुप्त भृगु बिंदु (राहु एवं चंद्र का शुद्ध मध्यबिंदू) '${bhriguBinduRashiName}' राशि में स्थित है। आगामी ४ से ६ मास की अवधि में जब गोचर के शुभ ग्रह इस बिंदु से संबंध स्थापित करेंगे, तब अप्रत्याशित सौभाग्य के द्वार खुलेंगे।`,
        te: `${devoteeName}, మీ భృగు బిందువు '${bhriguBinduRashiName}' రాశిలో ఉంది. రాబోయే 4 నుండి 6 నెలల్లో శుభ గ్రహాల కలయిక వల్ల అదృష్టం కలిసివస్తుంది.`,
        ta: `${devoteeName}, உங்கள் ஜாதகத்தின் பிருகு பிந்து '${bhriguBinduRashiName}' ராசியில் அமைந்துள்ளது. அடுத்த 4 முதல் 6 மாதங்களில் சுப கிரகங்களின் பார்வை இந்த புள்ளியின் மீது விழுவதால் பெரும் அதிர்ஷ்டம் கிட்டும்.`,
        en: `${devoteeName}, your chart's Bhrigu Bindu (the mathematical mid-point between natal Rahu and Moon) is anchored in ${bhriguBinduRashiName}. As benefic transits harmonize with this coordinate across Months 4 to 6, a dormant karmic doorway swings open.`
      }, targetLang),
      pick6({
        kn: `ಈ ಅವಧಿಯ ಮುಖ್ಯ ಅನುಕೂಲಗಳು: ಉದ್ಯೋಗದಲ್ಲಿ ಬಹುದಿನಗಳಿಂದ ನಿರೀಕ್ಷಿಸುತ್ತಿದ್ದ ಬಡ್ತಿ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭದಾಯಕ ಮೈತ್ರಿ, ಅಥವಾ ಕುಟುಂಬದಲ್ಲಿ ಬಹುದಿನಗಳ ಕನಸಾದ ಸ್ವಂತ ಮನೆ/ವಾಹನ ಖರೀದಿ ಪ್ರಕ್ರಿಯೆಗಳು ಮುಕ್ತಾಯದ ಹಂತಕ್ಕೆ ಬರಲಿವೆ. ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಜಗತ್ತು ಗುರುತಿಸುವ ಸಮಯವಿದು.`,
        mr: `या काळातील फायदे: नोकरीत प्रमोशन, व्यापारात नवीन भागीदारी, अथवा घर/वाहन खरेदीचे स्वप्न पूर्ण होण्याच्या मार्गावर येईल. लोक आपल्या कामाचे कौतुक करतील.`,
        hi: `इस अवधि के मुख्य लाभ: कार्यक्षेत्र में बहुप्रतीक्षित पदोन्नति, व्यापारिक साझेदारी का विस्तार अथवा गृह/वाहन क्रय की योजनाएं साकार होंगी। आपकी योग्यता को सामाजिक मान्यता प्राप्त होगी।`,
        te: `ఈ కాలంలో ఉద్యోగంలో ప్రమోషన్, వ్యాపార విస్తరణ లేదా ఇల్లు, వాహనం కొనుగోలు చేసే అవకాశాలు లభిస్తాయి.`,
        ta: `இந்த காலத்தில் பதவி உயர்வு, புதிய கூட்டுத் தொழில், அல்லது வீடு, வாகனம் வாங்கும் கனவு நனவாகும். உங்கள் திறமைக்கு தகுந்த அங்கீகாரம் கிடைக்கும்.`,
        en: `Real-world manifestations during this window: delayed promotions crystallize, strategic partnerships solidify, and discussions surrounding property or vehicle acquisitions reach fruition with familial consensus.`
      }, targetLang),
      pick6({
        kn: `ಈ ಸುವರ್ಣ ತಿರುವನ್ನು ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಲು: ನಿಮ್ಮ ಇಷ್ಟದೇವತೆಗೆ ಪಾಯಸ ನೈವೇದ್ಯ ಅರ್ಪಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಮಹಾಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ, ಬೃಗು ಬಿಂದುವಿನ ಶಕ್ತಿಯು ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ಫಲ ನೀಡಿ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಶಾಶ್ವತ ನೆಮ್ಮದಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
        mr: `या यशासाठी: कुलदेवतेला खिरीचा नैवेद्य दाखवा व गोकर्ण महाबळेश्वर क्षेत्रात पूजा करा. यामुळे घरात सुख-समृद्धी नांदेल.`,
        hi: `इस शुभ फल को चिरस्थायी बनाने हेतु: इष्टदेव को मिष्ठान्न का भोग लगाएं एवं श्री गोकर्ण धाम में विशेष पूजा का संकल्प लें। इससे घर-परिवार में सुख-समृद्धि का वास होगा।`,
        te: `ఈ శుభ యోగాన్ని సద్వినియోగం చేసుకోవడానికి ఇష్టదైవానికి పాయసం నైవేద్యం పెట్టండి. గోకర్ణంలో పూజ చేయించడం వల్ల శాశ్వత శాంతి లభిస్తుంది.`,
        ta: `இந்த நல்ல நேரத்தை பயன்படுத்திக் கொள்ள: இஷ்ட தெய்வத்திற்கு பாயாசம் படைத்து வழிபடவும். கோகர்ணத்தில் வழிபாடு செய்ய குடும்பத்தில் சுபகாரியங்கள் தடையின்றி நடக்கும்.`,
        en: `To anchor this turning point: offer sweet milk-rice (Payasa) at your home altar, and sponsor a dedicated Archana at Sri Kshetra Gokarna to magnetize and stabilize the auspicious Bhrigu Bindu wave.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಬೃಗು ಬಿಂದು ದರ್ಶನ", mr: "भृगु बिंदू दर्शन", hi: "भृगु बिंदु दर्शन", te: "భృగు బిందు దర్శనం", ta: "பிருகு பிந்து தரிசனம்", en: "Bhrigu Turning Point" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಈ ಅವಧಿಯಲ್ಲಿ ಬರುವ ಹೊಸ ಅವಕಾಶಗಳನ್ನು ಸಂಶಯದಿಂದ ನೋಡದೆ, ನುರಿತ ಹಿರಿಯರ ಸಲಹೆ ಪಡೆದು ಧೈರ್ಯವಾಗಿ ಮುನ್ನಡೆಯಿರಿ.",
      mr: "नवीन संधींचा फायदा घेण्यासाठी अनुभवी व्यक्तींचा सल्ला घेऊन पुढे जा.",
      hi: "इस कालखंड में प्राप्त नवीन अवसरों पर अत्यधिक संशय न करें; अनुभवी गुरुजनों का परामर्श लेकर आत्मविश्वास से आगे बढ़ें।",
      te: "లభించే అవకాశాలను సద్వినియోగం చేసుకోండి. పెద్దల సలహాలు తీసుకుని ముందుకు సాగండి.",
      ta: "வரும் நல்ல வாய்ப்புகளை நழுவ விடாமல், பெரியவர்களின் ஆலோசனை பெற்று தைரியமாக முன்னேறவும்.",
      en: "Do not allow habitual skepticism to dismiss newly presented doors; cross-verify with trusted mentors and step forward boldly."
    }, targetLang)
  });

  // CHAPTER 19: Year 1 Blueprint & Golden Windows
  chapters.push({
    chapterNumber: 19,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೧ ಸಂಪೂರ್ಣ ನೀಲನಕ್ಷೆ (${n(nowYear)}): ಅಡಿಪಾಯ ಭದ್ರತೆ & ಸುವರ್ಣ ಸಮಯ`,
      mr: `वर्ष १ संपूर्ण आराखडा (${n(nowYear)}): पायाभरणी व सुवर्ण काळ`,
      hi: `वर्ष १ का संपूर्ण खाका (${n(nowYear)}): सुदृढ़ आधार एवं स्वर्णिम कालखंड`,
      te: `సంవత్సరం 1 సమగ్ర ప్రణాళిక (${n(nowYear)}): పునాది & సువర్ణ కాలం`,
      ta: `ஆண்டு 1 முழு வரைபடம் (${n(nowYear)}): அடித்தளம் & பொன்னான தருணங்கள்`,
      en: `Year 1 Comprehensive Blueprint (${nowYear}) — Foundation Fortification`
    }, targetLang),
    icon: "🌟",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸಕ್ತ ವರ್ಷ ${n(nowYear)}ರಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಸಾಧನೆ ಏನಿರಲಿದೆ ಹಾಗೂ ಯಾವ ತಿಂಗಳುಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ?`,
      mr: `प्रश्न: ${devoteeName}, चालू वर्ष ${n(nowYear)} मध्ये आपली मुख्य कामगिरी काय असेल व कोणत्या महिन्यांत जास्त दक्षता हवी?`,
      hi: `प्रश्न: ${devoteeName}, वर्तमान वर्ष ${n(nowYear)} में आपकी प्रमुख उपलब्धि क्या रहेगी एवं किन महीनों में विशेष सतर्कता अपेक्षित है?`,
      te: `ప్రశ్న: ${devoteeName}, ఈ ఏడాది ${n(nowYear)} లో మీరు సాధించే ముఖ్యమైన విజయం ఏమిటి మరియు ఏ నెలల్లో జాగ్రత్త అవసరం?`,
      ta: `கேள்வி: ${devoteeName}, இந்த ஆண்டு ${n(nowYear)}-ல் உங்கள் முக்கிய சாதனை என்னவாக இருக்கும்? எந்த மாதங்களில் கவனம் தேவை?`,
      en: `Question: ${devoteeName}, what will be the hallmark triumph of Year 1 (${nowYear}), and which months demand strategic vigilance?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಪ್ರಸಕ್ತ ${n(nowYear)}ನೇ ವರ್ಷವು ನಿಮ್ಮ ಜೀವನದ ದೀರ್ಘಕಾಲಿಕ ಗುರಿಗಳಿಗೆ ಗಟ್ಟಿ ಅಡಿಪಾಯ ಹಾಕುವ ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ ವರ್ಷವಾಗಿದೆ. ನಿಮ್ಮ ${lagnaRashiName} ಲಗ್ನ ಹಾಗೂ ${moonRashiName} ರಾಶಿಯ ಸಮಗ್ರ ಗ್ರಹ ಗಣಿತದ ಪ್ರಕಾರ, ಹಿಂದಿನ ದಿನಗಳಲ್ಲಿ ಕಾಡಿದ ಗೊಂದಲಗಳು, ವಿಳಂಬಿತ ಹಣಕಾಸು ಮತ್ತು ಅನಿಶ್ಚಿತತೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಪರಿಹರಿಸಿ ನಿಮ್ಮ ಬದುಕನ್ನು ಶಿಸ್ತುಬದ್ಧ ಹಳಿಗೆ ತರಲು ಪ್ರಕೃತಿಯು ಅಪೂರ್ವ ಅವಕಾಶ ಕಲ್ಪಿಸಿದೆ. ತಾಳ್ಮೆ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯೊಂದಿಗೆ ಹೆಜ್ಜೆ ಹಾಕಿದರೆ ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸವು ದಿನದಿಂದ ದಿನಕ್ಕೆ ವೃದ್ಧಿಸಲಿದೆ.`,
        mr: `${devoteeName}, चालू वर्ष ${n(nowYear)} हे आपल्या आयुष्याची भक्कम पायाभरणी करण्याचे अत्यंत महत्त्वाचे वर्ष आहे. आपल्या ${lagnaRashiName} लग्न व ${moonRashiName} राशीनुसार मागील अडचणींवर मात करून आर्थिक व कौटुंबिक स्थिती स्थिर करण्यासाठी हा काळ अतिशय अनुकूल असून आपल्या परिश्रमांना योग्य दिशा मिळेल.`,
        hi: `${devoteeName}, वर्तमान वर्ष ${n(nowYear)} आपके जीवन के दीर्घकालिक लक्ष्यों हेतु सुदृढ़ आधारशिला रखने का अत्यंत निर्णायक कालखंड है। आपके ${lagnaRashiName} लग्न एवं ${moonRashiName} राशि की ग्रह गणनाओं के अनुसार यह वर्ष पुरानी उलझनों के स्थायी समाधान एवं आर्थिक स्थिति को व्यवस्थित करने हेतु अत्यंत उपयुक्त है।`,
        te: `${devoteeName}, ఈ సంవత్సరం ${n(nowYear)} మీ జీవితంలో అత్యంత కీలకమైన పునాది వేసే సువర్ణ కాలం. మీ ${lagnaRashiName} లగ్నం మరియు ${moonRashiName} రాశి గ్రహ స్థితుల ప్రకారం, గత కొన్ని నెలలుగా ఎదురైన ఆటంకాలు మరియు పాత సమస్యలు క్రమంగా పరిష్కారమై మీ ఆర్థిక, కుటుంబ పరిస్థితులు దృఢంగా స్థిరపడతాయి. మీ ఆత్మవిశ్వాసం రోజురోజుకూ పెరిగి కొత్త లక్ష్యాల వైపు నిలకడగా అడుగులు వేస్తారు.`,
        ta: `${devoteeName}, இந்த ஆண்டு ${n(nowYear)} உங்கள் நீண்ட கால இலக்குகளுக்கு உறுதியான அடித்தளம் அமைக்கும் மிக முக்கியமான ஆண்டாகும். உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${moonRashiName} ராசியின் கிரக கணக்கீட்டின்படி, கடந்த காலத் தடைகளும் பழைய சிக்கல்களும் படிப்படியாக நீங்கி பொருளாதார மற்றும் குடும்ப நிலை சீராகும். பொறுமையுடன் செயல்பட்டால் மன உறுதியும் வெற்றியும் நாளுக்கு நாள் உயரும்.`,
        en: `${devoteeName}, Year 1 (${nowYear}) stands astrologically designated as your Foundation Fortification epoch. Synthesizing your ${lagnaRashiName} ascendant and ${moonRashiName} Moon vectors confirms this 12-month cycle rewards cleaning administrative backlogs, extinguishing lingering obligations, and locking steady household structure.`
      }, targetLang),
      pick6({
        kn: `ಈ ವರ್ಷದ ಸುವರ್ಣ ತಿಂಗಳುಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆ: ವರ್ಷದ ಮಧ್ಯಭಾಗವು ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಹಾಗೂ ಬಾಕಿ ಹಣ ವಸೂಲಾತಿಗೆ ಅತ್ಯಂತ ಫಲಪ್ರದವಾಗಿದೆ. ಆದರೆ ವರ್ಷದ ಕೊನೆಯ ತಿಂಗಳುಗಳಲ್ಲಿ ಆರೋಗ್ಯದ ಕಾಳಜಿ, ಹಿರಿಯರ ಯೋಗಕ್ಷೇಮ ಹಾಗೂ ಪ್ರಯಾಣದ ವೇಳೆ ಅಲ್ಪ ಜಾಗರೂಕತೆ ಅಗತ್ಯ. ಕಣ್ಣು ಮುಚ್ಚಿ ಯಾರನ್ನೂ ನಂಬದೆ, ಎಲ್ಲ ವ್ಯವಹಾರಗಳನ್ನು ಸ್ಪಷ್ಟ ಲಿಖಿತ ರೂಪದಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳುವುದು ಸುರಕ್ಷಿತ.`,
        mr: `या वर्षाचे सुवर्ण महिने व दक्षता: वर्षाचा मध्य काळ धनलाभ, कार्यस्थैर्य व प्रलंबित कामे पूर्ण होण्यासाठी उत्तम आहे. वर्षाच्या उत्तरार्धात प्रवासात व आरोग्याची काळजी घ्या तसेच सर्व आर्थिक व्यवहार स्पष्ट लेखी ठेवूनच पुढे जा.`,
        hi: `वर्ष के स्वर्णिम कालखंड एवं सावधानी: वर्ष का मध्य भाग आजीविका स्थिर करने एवं रुके हुए धन लाभ हेतु अत्यधिक फलदायी रहेगा। वर्ष के अंतिम महीनों में स्वास्थ्य, विश्राम एवं यात्रा में विशेष सजगता अपेक्षित है और समस्त लेनदेन लिखित रूप में ही करें।`,
        te: `ఈ ఏడాది సువర్ణ కాలం మరియు జాగ్రత్తలు: సంవత్సరం మధ్య భాగం ఉద్యోగ స్థిరత్వం, వ్యాపారాభివృద్ధి మరియు ధనలాభానికి ఎంతో అనుకూలంగా ఉంటుంది. సంవత్సరం చివరి త్రైమాసికంలో ఆరోగ్యం, పెద్దల యోగక్షేమాలు మరియు దూర ప్రయాణాల పట్ల తగిన జాగ్రత్త వహించండి. ముఖ్యమైన పత్రాలు మరియు ఆర్థిక వ్యవహారాలను స్పష్టంగా రాతపూర్వకంగా ఉంచుకోవడం రక్షణ కల్పిస్తుంది.`,
        ta: `இந்த ஆண்டின் நற்காலம் மற்றும் எச்சரிக்கை: ஆண்டின் நடுப்பகுதி தொழில் முன்னேற்றத்திற்கும் நிலுவையில் உள்ள வருமான வரவிற்கும் மிகவும் சாதகமாக உள்ளது. ஆண்டின் இறுதிப் பகுதியில் உடல்நலம், பயணங்கள் மற்றும் செலவுகளில் நிதானம் அவசியம். அனைத்து பணப் பரிவர்த்தனைகளையும் முறையான ஆவணங்களுடன் கையாள்வது பாதுகாப்பானது.`,
        en: `Golden windows and strategic cautions for Year 1: the mid-year corridor unlocks the clearest momentum across professional authority and settled dues, whereas the closing quarter requires attentive health pacing, calm communication, and documented agreements.`
      }, targetLang),
      pick6({
        kn: `ವಾರ್ಷಿಕ ಸಂಕಲ್ಪ ರಕ್ಷೆ: ವರ್ಷಕ್ಕೊಮ್ಮೆ ನಿಮ್ಮ ಹುಟ್ಟಿದ ಹಬ್ಬ ಅಥವಾ ವಿವಾಹ ವಾರ್ಷಿಕೋತ್ಸವದಂದು ಗೋಪೂಜೆ ನೆರವೇರಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಮತ್ತು ಕುಟುಂಬದ ಹೆಸರಿನಲ್ಲಿ ವಾರ್ಷಿಕ ಸಂಕಲ್ಪ ಪೂಜೆ ಮಾಡಿಸುವುದು ವರ್ಷವಿಡೀ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.`,
        mr: `वार्षिक दैवी संकल्प रक्षण: वाढदिवस किंवा जन्म नक्षत्राच्या दिवशी गोपूजा व अन्नदान करा आणि श्री क्षेत्र गोकर्ण महाबळेश्वर येथे वार्षिक संकल्प पूजा केल्याने वर्षभर संपूर्ण कुटुंबाचे रक्षण होते.`,
        hi: `वार्षिक दैवीय संकल्प रक्षा: अपने जन्मदिवस अथवा जन्म नक्षत्र पर गोमाता की पूजा व अन्नदान करें तथा श्री गोकर्ण महाबलेश्वर धाम में परिवार सहित वार्षिक संकल्प पूजा कराएं जिससे वर्ष पर्यन्त शुभ कृपा बनी रहे।`,
        te: `వార్షిక దైవిక సంకల్ప రక్షణ: మీ జన్మదినం లేదా జన్మ నక్షత్రం రోజున గోపూజ మరియు ఆకలితో ఉన్నవారికి అన్నదానం చేయండి. శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానంలో మీ పేరున వార్షిక సంకల్ప పూజ చేయించడం వల్ల సంవత్సరం పొడవునా దైవ రక్షణ లభిస్తుంది.`,
        ta: `ஆண்டு தெய்வீக சங்கல்பம்: உங்கள் பிறந்தநாள் அல்லது ஜென்ம நட்சத்திர நாளில் கோபூஜையும் அன்னதானமும் செய்யுங்கள். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியில் குடும்ப நலனுக்காக வருடாந்திர சங்கல்ப அர்ச்சனை செய்வது ஆண்டு முழுவதும் அபரிமிதமான பாதுகாப்பை வழங்கும்.`,
        en: `Annual divine seal: observe Go-Puja and charitable meal sharing on your birthday star. Sponsoring an annual family Sankalpa Archana at Sri Kshetra Gokarna weaves a tranquil spiritual canopy over the entire 12-month cycle.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ವಾರ್ಷಿಕ ನೀಲನಕ್ಷೆ", mr: "वार्षिक आराखडा", hi: "वार्षिक खाका", te: "వార్షిక ప్రణాళిక", ta: "ஆண்டு வரைபடம்", en: "Annual Master Plan" }, targetLang),
    practicalGuidance: pick6({
      kn: isMinor
        ? "ಈ ವರ್ಷ ಹೊಸ ಕೌಶಲ್ಯಗಳು, ಪುಸ್ತಕ ಪಠಣ ಹಾಗೂ ಒಳ್ಳೆಯ ಅಭ್ಯಾಸಗಳನ್ನು ದಿನಚರಿಯಲ್ಲಿ ಅಳವಡಿಸಿಕೊಳ್ಳಿ."
        : "ಈ ವರ್ಷ ನಿಮ್ಮ ಆದಾಯದ ೨೦% ಹಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಸುರಕ್ಷಿತ ಉಳಿತಾಯದಲ್ಲಿ ತೊಡಗಿಸಿ; ಅನಗತ್ಯ ಆಡಂಬರದ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.",
      mr: isMinor
        ? "या वर्षी नियमित अभ्यास, वाचन व चांगल्या सवयी आत्मसात करा."
        : "या वर्षी आपल्या उत्पन्नातील २०% रक्कम सुरक्षित बचतीत ठेवा; वायफळ खर्च टाळा.",
      hi: isMinor
        ? "इस वर्ष नियमित स्वाध्याय, अच्छे संस्कार एवं नई विद्या सीखने पर ध्यान केंद्रित करें।"
        : "इस वर्ष अपनी आय का कम से कम २०% भाग सुरक्षित संचय में लगाएं; दिखावे के अनावश्यक व्यय से बचें।",
      te: isMinor
        ? "ఈ ఏడాది మంచి అలవాట్లు, పుస్తక పఠనం మరియు కొత్త నైపుణ్యాలపై దృష్టి పెట్టండి."
        : "ఈ ఏడాది మీ ఆదాయంలో 20% పొదుపు చేయండి. అనవసర ఖర్చులను నియంత్రించండి.",
      ta: isMinor
        ? "இந்த ஆண்டில் புதிய திறன்களையும் நல்ல படிப்புப் பழக்கங்களையும் தினமும் வளர்த்துக் கொள்ளுங்கள்."
        : "இந்த ஆண்டில் உங்கள் வருமானத்தில் 20% சேமிப்பில் வைக்கவும்; வீண் ஆடம்பர செலவுகளை குறைக்கவும்.",
      en: isMinor
        ? "Cultivate steady daily learning, reading, and wholesome foundational habits across this 12-month year."
        : "Lock a minimum of 20% of your net income into untouchable liquid or gold reserves this year; eliminate vanity expenditures."
    }, targetLang)
  });

  // CHAPTER 20: Year 2 Growth Trajectory & New Horizons
  chapters.push({
    chapterNumber: 20,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೨ ಅಭಿವೃದ್ಧಿ ಪಥ (${n(nowYear + 1)}): ನವ ದಿಗಂತಗಳು & ವಿಸ್ತರಣೆಯ ಕಾಲ`,
      mr: `वर्ष २ प्रगतीचा मार्ग (${n(nowYear + 1)}): नवीन क्षितिजे व विस्तार`,
      hi: `वर्ष २ का विकास पथ (${n(nowYear + 1)}): नवीन क्षितिज एवं विस्तार काल`,
      te: `సంవత్సరం 2 అభివృద్ధి పథం (${n(nowYear + 1)}): నూతన అవకాశాలు & విస్తరణ`,
      ta: `ஆண்டு 2 வளர்ச்சிப் பாதை (${n(nowYear + 1)}): புதிய அடிவானம் & விரிவாக்கம்`,
      en: `Year 2 Growth Trajectory (${nowYear + 1}) — Expansion & New Horizons`
    }, targetLang),
    icon: "🚀",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಎರಡನೇ ವರ್ಷದಲ್ಲಿ (${n(nowYear + 1)}) ನಿಮ್ಮ ಪ್ರತಿಷ್ಠೆ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವ ಹೇಗೆ ವಿಸ್ತಾರಗೊಳ್ಳಲಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, दुसऱ्या वर्षात (${n(nowYear + 1)}) आपली प्रतिष्ठा व सामाजिक मान कसा वाढेल?`,
      hi: `प्रश्न: ${devoteeName}, द्वितीय वर्ष में (${n(nowYear + 1)}) आपकी प्रतिष्ठा एवं सामाजिक प्रभाव का विस्तार किस प्रकार होगा?`,
      te: `ప్రశ్న: ${devoteeName}, రెండవ సంవత్సరంలో (${n(nowYear + 1)}) మీ గౌరవ ప్రతిష్టలు ఎలా విస్తరిస్తాయి?`,
      ta: `கேள்வி: ${devoteeName}, 2-வது ஆண்டில் (${n(nowYear + 1)}) உங்கள் மதிப்பும் சமூக அந்தஸ்தும் எவ்வாறு உயரும்?`,
      en: `Question: ${devoteeName}, how will your social influence and operational authority expand during Year 2 (${nowYear + 1})?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಎರಡನೇ ವರ್ಷಕ್ಕೆ ಕಾಲಿಡುವಾಗ (${n(nowYear + 1)}), ಗುರು ಮತ್ತು ಶನಿಯರ ಗೋಚಾರವು ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳನ್ನು ಪ್ರವೇಶಿಸಲಿದೆ. ಇದು ಹಿಂದಿನ ವರ್ಷ ಹಾಕಿದ ಭದ್ರ ಬುನಾದಿಯ ಮೇಲೆ ಹೊಸ ಉದ್ಯಮ, ಮಹತ್ವದ ಜವಾಬ್ದಾರಿ, ವೃತ್ತಿ ಗೌರವ ಅಥವಾ ಸಾಮಾಜಿಕ ಮನ್ನಣೆಯನ್ನು ಕರುಣಿಸುವ ಅಭಿವೃದ್ಧಿ ಪಥದ ವರ್ಷವಾಗಿದೆ. ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ಸಮಾಜವು ತಲೆಬಾಗಿ ಗೌರವ ನೀಡುವ ಕಾಲ ಸನ್ನಿಹಿತವಾಗಿದೆ.`,
        mr: `${devoteeName}, दुसऱ्या वर्षात (${n(nowYear + 1)}) गुरु व शनीचे गोचर आपल्या कुंडलीतील केंद्र स्थानी शुभ प्रभाव पाडेल. मागील वर्षातील मेहनतीचे फळ मिळून आपणास नवीन जबाबदाऱ्या, उच्च अधिकार व समाजात मान-सन्मान वाढण्याचा उत्तम योग तयार होत आहे.`,
        hi: `${devoteeName}, द्वितीय वर्ष में प्रवेश करते समय (${n(nowYear + 1)}) गुरु एवं शनि का गोचर आपके कार्यक्षेत्र में नवीन दायित्व, विस्तार एवं अधिकार प्रदान करेगा। विगत वर्ष में किए गए आपके परिश्रम को अब व्यापक सामाजिक और व्यावसायिक मान्यता मिलेगी।`,
        te: `${devoteeName}, రెండవ సంవత్సరంలో (${n(nowYear + 1)}) గురు మరియు శని గ్రహాల సంచారం మీ జాతకంలోని ముఖ్య కేంద్ర స్థానాలను ఉత్తేజపరుస్తుంది. గత సంవత్సరం మీరు వేసిన గట్టి పునాది ఫలితంగా ఇప్పుడు కొత్త బాధ్యతలు, ఉన్నత పదవులు మరియు సమాజంలో ప్రత్యేక గౌరవ మర్యాదలు లభిస్తాయి.`,
        ta: `${devoteeName}, 2-வது ஆண்டில் (${n(nowYear + 1)}) குரு மற்றும் சனி பகவானின் சஞ்சாரம் உங்கள் ஜாதகத்தின் முக்கிய கேந்திரங்களை பலப்படுத்துகிறது. முதல் ஆண்டில் அமைத்த உறுதியான அடித்தளத்தின் பலனாக இப்போது புதிய பொறுப்புகள், பதவி உயர்வு மற்றும் சமுதாயத்தில் உயர்ந்த மதிப்பும் கௌரவமும் தேடி வரும்.`,
        en: `${devoteeName}, stepping into Year 2 (${nowYear + 1}), major planetary transits of Jupiter and Saturn activate pivotal angular quadrants of your chart. This is your era of authorized expansion where disciplined toil ripens into public esteem and broader command.`
      }, targetLang),
      pick6({
        kn: `ಈ ವರ್ಷದ ಪ್ರಮುಖ ಯಶಸ್ಸಿನ ಸಂಭವನೀಯತೆಗಳು: ದೂರದ ಪವಿತ್ರ ಅಥವಾ ವೃತ್ತಿಪರ ಪ್ರಯಾಣಗಳು, ಹೊರರಾಜ್ಯ ಅಥವಾ ವಿದೇಶಿ ಸಂಪರ್ಕಗಳಿಂದ ಶುಭ ಲಾಭ, ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಮಂಗಳಕರ ಶುಭ ಸಮಾರಂಭಗಳು ಜರುಗುವ ಬಲವಾದ ಲಕ್ಷಣಗಳಿವೆ. ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯು ಮೊದಲ ವರ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಸ್ಥಿರವಾಗಲಿದ್ದು, ಹಳೆಯ ಸಾಲ ಅಥವಾ ಬಾಧ್ಯತೆಗಳ ಹೊರೆ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.`,
        mr: `या वर्षातील महत्त्वाच्या घडामोडी: लांबचा प्रवास, बाहेरील किंवा परदेशातील संपर्कांपासून आर्थिक लाभ, व कुटुंबात आनंदी शुभकार्य घडण्याचे प्रबळ योग आहेत. आर्थिक स्थैर्य वाढून जुन्या कर्जाचा भार खूप कमी होईल.`,
        hi: `संभावित उपलब्धियां: दूरगामी लाभकारी यात्राएं, बाह्य संपर्कों से आय में वृद्धि तथा परिवार में मांगलिक उत्सव संपन्न होने के प्रबल योग हैं। आपकी वित्तीय स्थिति पहले की तुलना में अधिक सुदृढ़ होगी एवं ऋण भार घटेगा।`,
        te: `ఈ సంవత్సరం ప్రధాన ఫలితాలు: దూర ప్రయాణాలు, ఇతర ప్రాంతాలు లేదా విదేశీ సంబంధాల నుండి శుభ లాభాలు మరియు కుటుంబంలో ఆనందకరమైన శుభకార్యాలు జరిగే బలమైన అవకాశాలు ఉన్నాయి. గత సంవత్సరంతో పోలిస్తే ఆర్థిక స్థిరత్వం పెరిగి పాత రుణ భారం తగ్గుముఖం పడుతుంది.`,
        ta: `இந்த ஆண்டின் முக்கிய நிகழ்வுகள்: பயனுள்ள தூரப் பயணங்கள், வெளியூர் மற்றும் வெளிநாட்டுத் தொடர்புகளால் ஆதாயம், குடும்பத்தில் மங்களகரமான சுப நிகழ்வுகள் நடைபெறும் வாய்ப்புகள் அதிகம். முந்தைய ஆண்டை விட வருமானம் நிலைபெற்று பழைய கடன் சுமைகள் கணிசமாகக் குறையும்.`,
        en: `Defining Year 2 milestones: harmonious family celebrations, beneficial travel or inter-state collaborations, and progressive retirement of legacy financial burdens while institutional credibility climbs.`
      }, targetLang),
      pick6({
        kn: `ವರ್ಷ ೨ ರ ದೈವಿಕ ಬಲವರ್ಧನೆಗೆ: ಪ್ರತಿ ಗುರುವಾರ ಭಕ್ತಿಪೂರ್ವಕವಾಗಿ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಗುರು-ಹಿರಿಯರಿಗೆ ನಮಸ್ಕರಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಶ್ರೀ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪಂಚಾಮೃತ ಅಭಿಷೇಕ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ ಹೆಚ್ಚಿದ ಜವಾಬ್ದಾರಿಗಳಲ್ಲಿ ವಿಘ್ನವಿಲ್ಲದೆ ಪೂರ್ಣ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.`,
        mr: `या वर्षाच्या यशासाठी: दर गुरुवारी विष्णु सहस्रनामाचे पठण करा आणि श्री क्षेत्र गोकर्ण महाबळेश्वर आत्मलिंगावर पंचामृत अभिषेक संकल्पाने नवीन कामांतील सर्व अडथळे दूर होऊन यश लाभेल.`,
        hi: `वर्ष २ की सफलता हेतु: प्रत्येक गुरुवार को श्रद्धापूर्वक विष्णु सहस्रनाम का पाठ करें एवं श्री गोकर्ण धाम में आत्मलिंग पर पंचामृत अभिषेक का संकल्प कराएं ताकि बढ़ते दायित्वों में निर्विघ्न सिद्धि मिले।`,
        te: `రెండవ సంవత్సరం దైవిక బలం కొరకు: ప్రతి గురువారం భక్తితో విష్ణు సహస్రనామ పారాయణం చేయండి. శ్రీ గోకర్ణ మహాబలేశ్వరుని ఆత్మలింగానికి పంచామృతాభిషేకం చేయించడం ద్వారా పెరిగిన బాధ్యతల్లో ఆటంకాలు లేకుండా విజయం లభిస్తుంది.`,
        ta: `ஆண்டு 2-க்கான ஆன்மீக வலிமைக்கு: ஒவ்வொரு வியாழக்கிழமையும் விஷ்ணு சகஸ்ரநாமம் பாராயணம் செய்யுங்கள். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியில் பஞ்சாமிர்த அபிஷேகம் செய்து வழிபடுவதால் புதிய பொறுப்புகளில் தடையற்ற வெற்றி உண்டாகும்.`,
        en: `To consecrate Year 2's expansion: recite the Sri Vishnu Sahasranama every Thursday with reverence for mentors, and offer a sacred Panchamrita Abhisheka at Sri Kshetra Gokarna so elevated responsibilities unfold without friction.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ವಿಸ್ತರಣಾ ಯೋಗ", mr: "विस्तार योग", hi: "विस्तार योग", te: "విస్తరణ యోగం", ta: "வளர்ச்சி யோகம்", en: "Expansion Horizons" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಹೆಚ್ಚಿದ ಅಧಿಕಾರ ಅಥವಾ ಯಶಸ್ಸು ಬಂದಾಗ ಅಹಂಕಾರ ಪಡದೆ, ಹಿರಿಯರಿಗೆ ಕೃತಜ್ಞರಾಗಿರಿ.",
      mr: "यश मिळाले तरी नम्र राहा व वडीलधाऱ्यांचा आदर करा.",
      hi: "सफलता एवं अधिकार मिलने पर अहंकार से बचें तथा वरिष्ठों के प्रति कृतज्ञता बनाए रखें।",
      te: "విజయం లభించినప్పుడు వినయంగా ఉండండి.",
      ta: "வெற்றி வரும்போது அடக்கத்துடன் இருங்கள்; பெரியவர்களை மதியுங்கள்.",
      en: "Meet expanding status with deepened humility; never let sudden accolades erode the patience that built them."
    }, targetLang)
  });

  // CHAPTER 21: Year 3–4 Transformation & Karmic Maturation
  chapters.push({
    chapterNumber: 21,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೩–೪ ಪರಿವರ್ತನೆ & ಕರ್ಮ ಪಕ್ವತೆ (${n(nowYear + 2)}–${n(nowYear + 3)}): ಶಾಶ್ವತ ಕೀರ್ತಿ`,
      mr: `वर्ष ३–४ परिवर्तन व कर्म परिपक्वता (${n(nowYear + 2)}–${n(nowYear + 3)}): चिरंतन कीर्ती`,
      hi: `वर्ष ३–४ रूपांतरण एवं कर्म परिपक्वता (${n(nowYear + 2)}–${n(nowYear + 3)}): स्थायी कीर्ति`,
      te: `సంవత్సరం 3–4 పరివర్తన & కర్మ పరిపక్వత (${n(nowYear + 2)}–${n(nowYear + 3)}): శాశ్వత కీర్తి`,
      ta: `ஆண்டு 3–4 மாற்றம் & கர்ம முதிர்ச்சி (${n(nowYear + 2)}–${n(nowYear + 3)}): நிலையான புகழ்`,
      en: `Years 3–4 Transformation & Karmic Maturation (${nowYear + 2}–${nowYear + 3})`
    }, targetLang),
    icon: "💎",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಮೂರನೇ ಹಾಗೂ ನಾಲ್ಕನೇ ವರ್ಷಗಳಲ್ಲಿ (${n(nowYear + 2)}–${n(nowYear + 3)}) ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಾವ ಆಂತರಿಕ ಹಾಗೂ ಬಾಹ್ಯ ಪರಿವರ್ತನೆಗಳು ಘಟಿಸಲಿವೆ?`,
      mr: `प्रश्न: ${devoteeName}, तिसऱ्या व चौथ्या वर्षात (${n(nowYear + 2)}–${n(nowYear + 3)}) आपल्या आयुष्यात कोणते मोठे बदल घडून येतील?`,
      hi: `प्रश्न: ${devoteeName}, तृतीय एवं चतुर्थ वर्ष में (${n(nowYear + 2)}–${n(nowYear + 3)}) आपके जीवन में कौन से आंतरिक एवं बाह्य रूपांतरण घटित होंगे?`,
      te: `ప్రశ్న: ${devoteeName}, 3 మరియు 4 వ సంవత్సరాల్లో (${n(nowYear + 2)}–${n(nowYear + 3)}) మీ జీవితంలో ఎలాంటి మార్పులు రాబోతున్నాయి?`,
      ta: `கேள்வி: ${devoteeName}, 3 மற்றும் 4-வது ஆண்டுகளில் (${n(nowYear + 2)}–${n(nowYear + 3)}) உங்கள் வாழ்க்கையில் என்னென்ன மாற்றங்கள் நிகழும்?`,
      en: `Question: ${devoteeName}, what structural transformations and karmic consolations characterize Years 3 & 4 (${nowYear + 2}–${nowYear + 3})?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಮೂರನೇ ಮತ್ತು ನಾಲ್ಕನೇ ವರ್ಷಗಳ ಅವಧಿಯು (${n(nowYear + 2)}–${n(nowYear + 3)}) ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಪಕ್ವ ಮತ್ತು ಗಂಭೀರ ಕಾಲಘಟ್ಟವಾಗಿದೆ. ಈ ಸಮಯದಲ್ಲಿ ಸೂಕ್ಷ್ಮ ದಶಾ-ಭುಕ್ತಿಗಳ ಪರಿವರ್ತನೆ ನಡೆಯಲಿದ್ದು, ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಕೇವಲ ತಕ್ಷಣದ ಲಾಭಕ್ಕಿಂತ ಶಾಶ್ವತ ತತ್ವಗಳು ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸತ್ಯಗಳ ಕಡೆಗೆ ಹೊರಳಲಿವೆ. ಬಾಹ್ಯ ಆಡಂಬರಕ್ಕಿಂತ ಕುಟುಂಬದ ಆಂತರಿಕ ಶಾಂತಿಗೆ ನೀವು ಪ್ರಥಮ ಆದ್ಯತೆ ನೀಡಲಿದ್ದೀರಿ.`,
        mr: `${devoteeName}, तिसऱ्या व चौथ्या वर्षात (${n(nowYear + 2)}–${n(nowYear + 3)}) दशा-भुक्तीतील बदलामुळे आपले विचार अधिक परिपक्व व दूरदृष्टीचे होतील. तात्पुरत्या दिखाव्यापेक्षा कुटुंबाचे स्वास्थ्य व आंतरिक समाधानाला आपण प्राधान्य द्याल.`,
        hi: `${devoteeName}, तृतीय एवं चतुर्थ वर्ष की यह समयावधि (${n(nowYear + 2)}–${n(nowYear + 3)}) आपके जीवन की गंभीर परिपक्वता एवं कर्म पक्वता का काल है। दशा-अंतर्दशा के संचरण से आपके विचार अधिक दार्शनिक होंगे तथा आंतरिक शांति आपकी प्राथमिकता बनेगी।`,
        te: `${devoteeName}, మూడు మరియు నాలుగవ సంవత్సరాల కాలం (${n(nowYear + 2)}–${n(nowYear + 3)}) మీ జీవితంలో అత్యంత పరిపక్వత మరియు స్థిరత్వం కలిగించే సమయం. దశా-భుక్తుల మార్పు వల్ల మీ ఆలోచనలు మరింత లోతుగా, దూరదృష్టితో సాగుతాయి. తాత్కాలిక ఆర్భాటాల కంటే కుటుంబ శాంతికి మరియు ఆధ్యాత్మిక సత్యాలకు ప్రాధాన్యత ఇస్తారు.`,
        ta: `${devoteeName}, 3 மற்றும் 4-வது ஆண்டுகளின் காலம் (${n(nowYear + 2)}–${n(nowYear + 3)}) உங்கள் வாழ்க்கையில் முதிர்ச்சியும் ஞானமும் நிறைந்த காலமாகும். தசா-புக்தி மாற்றங்களால் உங்கள் சிந்தனைகள் ஆழமாகவும் தொலைநோக்குடனும் மாறும். வெளி ஆடம்பரங்களை விட குடும்ப அமைதிக்கும் ஆன்மீக நிறைவுக்கும் முன்னுரிமை தருவீர்கள்.`,
        en: `${devoteeName}, Years 3 and 4 (${nowYear + 2}–${nowYear + 3}) signify your Karmic Maturation corridor. Planetary sub-period transitions gently turn your priorities away from restless chasing toward enduring stability, serene judgment, and deeper philosophical peace.`
      }, targetLang),
      pick6({
        kn: `ಈ ಹಂತದ ಮುಖ್ಯ ಫಲಗಳು: ಬಹುಕಾಲದಿಂದ ಬಯಸಿದ್ದ ಸ್ಥಿರಾಸ್ತಿಗಳು ಭದ್ರವಾಗಲಿವೆ, ಕುಟುಂಬದ ಕಿರಿಯರು ಹಾಗೂ ಮಕ್ಕಳು ಸ್ವಾವಲಂಬಿ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಯಲಿದ್ದಾರೆ, ಹಾಗೂ ಬಂಧು-ಬಾಂಧವರು ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ನಿಮಗೆ ಗೌರವಾನ್ವಿತ ಹಿರಿಯರ ಸ್ಥಾನಮಾನ ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಸಲಹೆಗಳಿಗೆ ಎಲ್ಲೆಡೆ ಅಪಾರ ಮನ್ನಣೆ ದೊರಕಲಿದೆ.`,
        mr: `या टप्प्यातील फळे: स्थावर मालमत्ता सुरक्षित व भक्कम होईल, घरातील तरुण पिढी स्वावलंबी बनेल व समाजात आपल्याला ज्येष्ठ मार्गदर्शकाचे आदरणीय स्थान प्राप्त होईल.`,
        hi: `इस चरण की उपलब्धियां: अचल संपत्ति का सुदृढ़ीकरण, परिवार के युवाओं व संतानों की आत्मनिर्भरता तथा समाज में एक विश्वसनीय व सम्मानित मार्गदर्शक के रूप में प्रतिष्ठा की प्राप्ति होगी।`,
        te: `ఈ దశలో ప్రధాన ఫలితాలు: స్థిరాస్తులు మరియు గృహ సౌఖ్యం బలపడతాయి, కుటుంబంలోని యువత మరియు పిల్లలు స్వతంత్రంగా ఎదుగుతారు, బంధుమిత్రుల్లో మీకు గౌరవనీయమైన పెద్దరికం లభిస్తుంది. మీ అనుభవపూర్వక సలహాలను అందరూ గౌరవంతో స్వీకరిస్తారు.`,
        ta: `இந்தக் காலகட்டத்தின் முக்கிய பலன்கள்: அசையா சொத்துக்கள் நிலைபெறும், குடும்ப இளைய தலைமுறையினர் தன்னம்பிக்கையுடன் உயர்வார்கள், உறவினர்கள் மற்றும் சமூகத்தில் மதிப்புமிக்க வழிகாட்டியாக உயர்ந்த அந்தஸ்து பெறுவீர்கள். உங்கள் நேர்மையான ஆலோசனைகளுக்கு எப்போதும் மதிப்பு இருக்கும்.`,
        en: `Harvest of this period: residential and fixed assets consolidate firmly, younger family members advance into sturdy independence, and your balanced counsel earns quiet respect across both lineage and community.`
      }, targetLang),
      pick6({
        kn: `ಆಧ್ಯಾತ್ಮಿಕ ರಕ್ಷಣೆಗಾಗಿ: ಕುಟುಂಬ ಸಮೇತ ಪುಣ್ಯ ತೀರ್ಥಕ್ಷೇತ್ರ ಯಾತ್ರೆಗಳನ್ನು ಕೈಗೊಳ್ಳಿ ಹಾಗೂ ದೈವ ಕೃತಜ್ಞತೆಯನ್ನು ಅರ್ಪಿಸಿ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ವಿಧಿಬದ್ಧ ರುದ್ರ ಹೋಮ ಸಂಕಲ್ಪ ಮಾಡಿಸುವುದರಿಂದ, ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ಹಾಗೂ ವಂಶದ ಕೀರ್ತಿಯು ಮುಂದಿನ ತಲೆಮಾರುಗಳಿಗೂ ಚಿರಸ್ಥಾಯಿಯಾಗಿ ಉಳಿಯುತ್ತದೆ.`,
        mr: `आध्यात्मिक प्रगतीसाठी: कुटुंबासोबत तीर्थयात्रा करा आणि श्री क्षेत्र गोकर्ण महाबळेश्वर येथे रुद्र होम संकल्प केल्याने कुटुंबाचे आरोग्य व दीर्घायुष्य अबाधित राहील.`,
        hi: `आध्यात्मिक उन्नयन हेतु: सपरिवार पावन तीर्थाटन करें एवं श्री गोकर्ण क्षेत्र में विधिवत रुद्र होम का संकल्प कराएं जिससे आयु, आरोग्य और कुल की कीर्ति अक्षुण्ण रहे।`,
        te: `ఆధ్యాత్మిక రక్షణ కొరకు: కుటుంబ సమేతంగా పవిత్ర తీర్థయాత్రలు చేయండి. శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధిలో శాస్త్రోక్తంగా రుద్ర హోమం చేయించడం ద్వారా ఆయురారోగ్యాలు మరియు వంశ కీర్తి శాశ్వతంగా నిలుస్తాయి.`,
        ta: `ஆன்மீகப் பாதுகாப்பிற்கு: குடும்பத்துடன் புண்ணிய தல யாத்திரைகள் மேற்கொள்ளுங்கள். ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியில் முறைப்படி ருத்ர ஹோமம் செய்வதன் மூலம் பூரண ஆரோக்கியமும் வம்சப் பெருமையும் தலைமுறை தாண்டியும் நிலைக்கும்.`,
        en: `To consecrate this mature plateau: undertake sacred family pilgrimages with gratitude, and sponsor a solemn Rudra Homa at Sri Kshetra Gokarna to anchor lasting vitality and generational grace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಕರ್ಮ ಪಕ್ವತೆ", mr: "कर्म परिपक्वता", hi: "कर्म परिपक्वता", te: "కర్మ పరిపక్వత", ta: "கர்ம முதிர்ச்சி", en: "Karmic Consolidation" }, targetLang),
    practicalGuidance: pick6({
      kn: "ನಿಮ್ಮ ಅನುಭವ ಹಾಗೂ ಜ್ಞಾನವನ್ನು ಕಿರಿಯರಿಗೆ ಪ್ರೀತಿಯಿಂದ ಧಾರೆ ಎರೆಯಿರಿ; ಆಧ್ಯಾತ್ಮಿಕ ಗ್ರಂಥಗಳ ಅಧ್ಯಯನಕ್ಕೆ ಸಮಯ ಮೀಸಲಿಡಿ.",
      mr: "आपले अनुभव नव्या पिढीला सांगा व अध्यात्मासाठी वेळ द्या.",
      hi: "अपने जीवन के अनुभवों का लाभ युवा पीढ़ी को दें तथा आध्यात्मिक ग्रंथों के स्वाध्याय हेतु नित्य समय निकालें।",
      te: "మీ అనుభవాలను తరువాతి తరానికి పంచండి. ఆధ్యాత్మిక గ్రంథాలు చదవండి.",
      ta: "உங்கள் அனுபவங்களை அடுத்த தலைமுறைக்கு கற்றுக்கொடுங்கள்; ஆன்மீக நூல்களைப் படியுங்கள்.",
      en: "Mentor younger generations with quiet grace, and set aside dedicated daily intervals for sacred contemplation and timeless literature."
    }, targetLang)
  });

  // CHAPTER 22: Year 5 Ultimate Horizon & Legacy Building
  chapters.push({
    chapterNumber: 22,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೫ ಪರಮ ಸಿದ್ಧಿ & ವಂಶ ಪರಂಪರೆ (${n(nowYear + 4)}): ಪರಿಪೂರ್ಣತೆಯ ಸಾರ್ಥಕತೆ`,
      mr: `वर्ष ५ सर्वोच्च सिद्धी व वंश वारसा (${n(nowYear + 4)}): परिपूर्ण यश`,
      hi: `वर्ष ५ की परम सिद्धि एवं कुल परंपरा (${n(nowYear + 4)}): जीवन की सार्थकता`,
      te: `సంవత్సరం 5 పరమ సిద్ధి & వంశ గౌరవం (${n(nowYear + 4)}): పరిపూర్ణ సాఫల్యం`,
      ta: `ஆண்டு 5 உன்னத வெற்றி & வம்ச பாரம்பரியம் (${n(nowYear + 4)}): முழுமையான நிறைவு`,
      en: `Year 5 Ultimate Horizon (${nowYear + 4}) — Culmination & Generational Legacy`
    }, targetLang),
    icon: "👑",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಐದನೇ ವರ್ಷದ ಅಂತ್ಯಕ್ಕೆ (${n(nowYear + 4)}) ನಿಮ್ಮ ಜೀವನದ ಒಟ್ಟು ಸಾಧನೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಸಾರ್ಥಕತೆ ಹೇಗಿರಲಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, पाचव्या वर्षाच्या अखेरीस (${n(nowYear + 4)}) आपल्या आयुष्याची एकूण प्राप्ती व समाधान कसे असेल?`,
      hi: `प्रश्न: ${devoteeName}, पंचम वर्ष के अंत तक (${n(nowYear + 4)}) आपकी समग्र जीवन यात्रा की क्या सिद्धि एवं सार्थकता होगी?`,
      te: `ప్రశ్న: ${devoteeName}, 5వ సంవత్సరం ముగిసే సమయానికి (${n(nowYear + 4)}) మీ జీవితం ఏ స్థితిలో ఉంటుంది?`,
      ta: `கேள்வி: ${devoteeName}, 5-வது ஆண்டின் முடிவில் (${n(nowYear + 4)}) உங்கள் வாழ்க்கையின் ஒட்டுமொத்த சாதனையும் மனநிறைவும் எவ்வாறு இருக்கும்?`,
      en: `Question: ${devoteeName}, by the close of Year 5 (${nowYear + 4}), what enduring achievements, financial peace, and legacy will you stand upon?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಈ ೫ ವರ್ಷಗಳ ದೀರ್ಘ ಪ್ರಯಾಣದ ಕೊನೆಯ ಹಾಗೂ ಪರಿಪೂರ್ಣ ಹಂತವಾದ ${n(nowYear + 4)}ನೇ ವರ್ಷದಲ್ಲಿ, ನೀವು ಇಂದು ಅನುಭವಿಸುತ್ತಿರುವ ಅನಿಶ್ಚಿತತೆಗಳು, ಮೌನ ಸಂಕಟಗಳು ಹಾಗೂ ಆತಂಕಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಕರಗಿಹೋಗಲಿವೆ. ಹಿಂದಿನ ವರ್ಷಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯಿಂದ ನೀವು ಬಿತ್ತಿದ ಪರಿಶ್ರಮದ ಬೀಜಗಳು ಈಗ ಫಲವತ್ತಾದ ಮಹಾವೃಕ್ಷವಾಗಿ ಬೆಳೆದು ಕುಟುಂಬಕ್ಕೆ ನೆರಳು ನೀಡಲಿವೆ.`,
        mr: `${devoteeName}, या ५ वर्षांच्या प्रवासाच्या समाप्तीकडे (${n(nowYear + 4)}) आज आपल्या मनात असलेली भीती व अनिश्चितता पूर्णपणे नाहीशी होईल. संयमाने आपण लावलेले कष्टाचे रोप आता फळांनी बहरलेला विशाल वटवृक्ष बनलेले असेल.`,
        hi: `${devoteeName}, इस ५-वर्षीय यात्रा के शिखर पर (${n(nowYear + 4)}), आज आपके अंतर्मन में विद्यमान संशय एवं अनिश्चितता पूर्णतः तिरोहित हो चुकी होगी। आपके द्वारा धैर्यपूर्वक रोपे गए परिश्रम के बीज अब विशाल और फलदायी वटवृक्ष का रूप ले चुके होंगे।`,
        te: `${devoteeName}, ఈ 5 సంవత్సరాల ప్రయాణంలో చివరి మరియు పరిపూర్ణ ఘట్టమైన ${n(nowYear + 4)} వ సంవత్సరం నాటికి, నేడు మీ మనసులో ఉన్న ఆందోళనలు మరియు భయాలు పూర్తిగా తొలగిపోతాయి. మీరు ఓర్పుతో వేసిన శ్రమ బీజాలు ఫలించి కుటుంబానికి అండగా నిలిచే మహావృక్షంలా ఎదుగుతాయి.`,
        ta: `${devoteeName}, இந்த 5 ஆண்டு பயணத்தின் நிறைவான கட்டமான ${n(nowYear + 4)}-ம் ஆண்டில், இன்று உங்கள் மனதில் உள்ள கவலைகளும் தயக்கங்களும் முற்றிலும் மறைந்துவிடும். பொறுமையுடனும் நேர்மையுடனும் நீங்கள் விதைத்த உழைப்பு இப்போது முழுப் பலனளிக்கும் விருட்சமாக ஓங்கி நிற்கும்.`,
        en: `${devoteeName}, reaching the culminating horizon of this 5-year journey (${nowYear + 4}), the silent uncertainties weighing on you today dissolve into assured wisdom. Seeds sown with patience across these five cycles now stand as a flourishing protective canopy.`
      }, targetLang),
      pick6({
        kn: `ಐದನೇ ವರ್ಷದ ಪರಮ ಫಲ: ಸಾಲಮುಕ್ತ ಬದುಕು, ಸುಭದ್ರ ನಿವಾಸ, ಕುಟುಂಬದಲ್ಲಿ ನಿತ್ಯ ಸಂತೋಷ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಚಿರಸ್ಥಾಯಿ ಗೌರವ ಪ್ರಾಪ್ತವಾಗುತ್ತದೆ. ನೀವು ನಿಮ್ಮ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಕೇವಲ ಭೌತಿಕ ಆಸ್ತಿಯನ್ನಷ್ಟೇ ಅಲ್ಲದೆ, ಸತ್ಯ, ಧರ್ಮ ಹಾಗೂ ನೈತಿಕತೆಯ ಅಮೂಲ್ಯ ಪರಂಪರೆಯನ್ನು ಬಳುವಳಿಯಾಗಿ ನೀಡಲಿದ್ದೀರಿ.`,
        mr: `पाचव्या वर्षाचे फळ: कर्जमुक्त जीवन, स्वतःचे सुरक्षित घर, कुटुंबात आनंद व समाजात कायमस्वरूपी सन्मान लाभेल. भावी पिढीला आपण केवळ संपत्तीच नव्हे तर उत्तम संस्कारांचा अमूल्य वारसा द्याल.`,
        hi: `पंचम वर्ष की सर्वोच्च सिद्धि: ऋणमुक्त स्वावलंबी जीवन, सुदृढ़ निवास, पारिवारिक आनंद एवं समाज में अक्षुण्ण प्रतिष्ठा की प्राप्ति होगी। आप अपनी भावी पीढ़ी को केवल संपत्ति ही नहीं, अपितु उच्च संस्कारों की धरोहर सौंपेंगे।`,
        te: `ఐదవ సంవత్సరం పరమ ఫలితాలు: రుణ విముక్తి, సుభద్రమైన నివాసం, కుటుంబంలో ఆనందం మరియు సమాజంలో శాశ్వత గౌరవ మర్యాదలు లభిస్తాయి. మీరు రాబోయే తరానికి కేవలం ఆస్తులనే కాకుండా, సత్యం మరియు ధర్మం అనే అమూల్యమైన సంస్కార వారసత్వాన్ని అందిస్తారు.`,
        ta: `5-வது ஆண்டின் உன்னத பலன்: கடன் இல்லாத நிறைவான வாழ்க்கை, நிலையான இல்லம், குடும்பத்தில் மகிழ்ச்சி மற்றும் சமுதாயத்தில் அழியாத புகழ் உண்டாகும். அடுத்த தலைமுறைக்கு சொத்துக்களோடு சேர்த்து நேர்மையும் தர்மமும் நிறைந்த சிறந்த பாரம்பரியத்தை வழங்குவீர்கள்.`,
        en: `Culminating Year 5 fruits: debt-free sovereignty, sanctuary stability, peaceful household celebrations, and respected standing. What you pass forward transcends material security—it becomes an enduring lineage of moral honor.`
      }, targetLang),
      pick6({
        kn: `ಕೃತಜ್ಞತೆಯ ಪರಮ ಸಮರ್ಪಣೆ: ಸಕಲ ಸಿದ್ಧಿಗಳನ್ನು ಕರುಣಿಸಿದ ಪರಮೇಶ್ವರನಿಗೆ ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಲು, ಸಕುಟುಂಬ ಸಮೇತರಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಕೃತಜ್ಞತಾ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಿ. ಶ್ರೀ ಆತ್ಮಲಿಂಗದ ದೈವಿಕ ಆಶೀರ್ವಾದವು ನಿಮ್ಮ ಕುಟುಂಬದ ಮುಂದಿನ ಪೀಳಿಗೆಯನ್ನು ಸದಾ ಕಾಯಲಿದೆ.`,
        mr: `कृतज्ञता समर्पण: सर्व सिद्धी देणाऱ्या ईश्वराप्रती कृतज्ञता व्यक्त करण्यासाठी सपरिवार श्री क्षेत्र गोकर्ण महाबळेश्वर येथे जाऊन धन्यवाद पूजा करा. आत्मलिंगाची कृपा आपल्या वंशाचे रक्षण करेल.`,
        hi: `कृतज्ञता समर्पण: समस्त सिद्धियों के दाता ईश्वर के प्रति धन्यवाद ज्ञापित करने हेतु सपरिवार श्री गोकर्ण महाबलेश्वर धाम पधारकर कृतज्ञता पूजा संपन्न कराएं; आत्मलिंग की कृपा आपके वंश का कल्याण करेगी।`,
        te: `దైవ కృతజ్ఞతా సమర్పణ: ఇంతటి శుభ ఫలితాలను అందించిన పరమేశ్వరునికి కృతజ్ఞతగా కుటుంబ సమేతంగా శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధానానికి వెళ్లి ప్రత్యేక పూజలు చేయండి. ఆత్మలింగ స్వామి అనుగ్రహం మీ వంశాన్ని తరతరాల పాటు రక్షిస్తుంది.`,
        ta: `இறைவனுக்கு நன்றி காணிக்கை: இத்தனை நன்மைகளையும் வழங்கிய இறைவனுக்கு நன்றி செலுத்த குடும்பத்துடன் ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதிக்குச் சென்று நன்றி வழிபாடு செய்யுங்கள்; ஆத்மலிங்க ஈசனின் அருள் உங்கள் சந்ததியை என்றென்றும் பாதுகாக்கும்.`,
        en: `The crowning act of sacred gratitude: journey with your family to Sri Kshetra Gokarna Mahabaleshwara to offer a heartfelt thanksgiving Mahapuja before the Atma Linga, sealing generations under eternal grace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಪರಮ ಸಿದ್ಧಿ ದರ್ಶನ", mr: "सर्वोच्च सिद्धी", hi: "परम सिद्धि", te: "పరమ సిద్ధి", ta: "பூரண வெற்றி", en: "Ultimate Culmination" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಜೀವನದಲ್ಲಿ ಎಷ್ಟು ಎತ್ತರಕ್ಕೆ ಬೆಳೆದರೂ ವಿನಮ್ರತೆಯನ್ನು ಬಿಡಬೇಡಿ; ದೈವ ಭಕ್ತಿ ಹಾಗೂ ಸತ್ಯನಿಷ್ಠೆಯೇ ನಿಮ್ಮ ಪರಮ ಶಕ್ತಿ.",
      mr: "कितीही मोठे झालात तरी नम्र राहा; ईश्वरभक्ती हीच आपली खरी शक्ती आहे.",
      hi: "जीवन में कितनी भी ऊंचाई प्राप्त करें, विनम्रता का त्याग न करें; ईश्वर भक्ति एवं सत्यनिष्ठा ही आपकी वास्तविक पूंजी है।",
      te: "ఎంత ఎదిగినా ఒదిగి ఉండండి. దైవభక్తిని వీడకండి.",
      ta: "எவ்வளவு உயர்ந்தாலும் பணிவை கைவிடாதீர்கள்; தெய்வ பக்தியே உங்களின் நிரந்தர பலம்.",
      en: "Regardless of how tall your worldly achievements grow, remain anchored in quiet humility; devotion and truth are your imperishable wealth."
    }, targetLang)
  });


  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: REMEDIAL PRECISION & ASTROLOGER'S VERDICT (Chapters 23 to 25)
  // ──────────────────────────────────────────────────────────────────────────
  const sec5 = pick6({
    kn: "ವಿಭಾಗ ೫: ದೋಷ ಪರಿಹಾರ ರಹಸ್ಯ & ಮುಖ್ಯ ಅರ್ಚಕರ ಪರಮ ಆಶೀರ್ವಾದ",
    mr: "विभाग ५: दोष निवारण रहस्य व मुख्य पुरोहितांचे परम आशीर्वाद",
    hi: "खंड ५: दोष निवारण रहस्य एवं मुख्य अर्चक का परम आशीर्वाद",
    te: "విభాగం 5: దోష నివారణ రహస్యం & ముఖ్య అర్చకుల దివ్య ఆశీర్వాదం",
    ta: "பிரிவு 5: தோஷ நிவர்த்தி ரகசியம் & தலைமை அர்ச்சகரின் இறுதி ஆசீர்வாதம்",
    en: "Section 5: Remedial Precision & Chief Astrologer's Verdict"
  }, targetLang);

  // CHAPTER 23: Comprehensive Dosha Diagnostics (Core V1 Section)
  chapters.push({
    chapterNumber: 23,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ಸಮಗ್ರ ಜನ್ಮ ದೋಷಗಳ ವಿಶ್ಲೇಷಣೆ: ಕುಜ, ಪಿತೃ, ಸರ್ಪ & ಮಾಂದಿ ದೋಷ ಪರಿಹಾರ",
      mr: "सर्वसमावेशक जन्मदोष विश्लेषण: मंगळ, पितृ, सर्प व मांदी दोष निवारण",
      hi: "समग्र जन्म दोष विश्लेषण: मंगल, पितृ, सर्प एवं मांदी दोष निवारण",
      te: "సమగ్ర జన్మ దోష విశ్లేషణ: కుజ, పితృ, సర్ప & మాంది దోష నివారణ",
      ta: "முழுமையான ஜாதக தோஷ ஆய்வு: செவ்வாய், பித்ரு, சர்ப்ப & மாந்தி தோஷ பரிகாரம்",
      en: "Comprehensive Dosha Diagnostics — Kuja, Pitru, Sarpa & Maandi Remedies"
    }, targetLang),
    icon: "🪔",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿರುವ ಕುಜ, ಪಿತೃ, ಸರ್ಪ ಅಥವಾ ಮಾಂದಿ ದೋಷಗಳೇನು ಮತ್ತು ಅವುಗಳನ್ನು ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಹೇಗೆ ಪರಿಹರಿಸಿಕೊಳ್ಳಬೇಕು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत कोणते मंगळ, पितृ, सर्प किंवा मांदी दोष आहेत व त्यांचे शास्त्रीय निवारण कसे करावे?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में विद्यमान मंगल, पितृ, सर्प अथवा मांदी दोषों का यथार्थ क्या है और उनका शास्त्रीय समाधान क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో ఉన్న కుజ, పితృ, సర్ప లేదా మాంది దోషాలు ఏమిటి మరియు వాటికి శాస్త్రోక్త పరిహారాలు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் உள்ள செவ்வாய், பித்ரு, சர்ப்ப அல்லது மாந்தி தோஷங்கள் யாவை? அவற்றுக்கான சாஸ்திர பரிகாரம் என்ன?`,
      en: `Question: ${devoteeName}, what is the exact diagnostic reality of Kuja, Pitru, Sarpa, or Maandi doshas in your chart, and what are the classical remedies?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ದೋಷವೆಂದರೆ ಶಾಪವಲ್ಲ; ಬದಲಾಗಿ ಹಿಂದಿನ ಜನ್ಮಗಳಿಂದ ಹೊತ್ತು ತಂದ ಅಪೂರ್ಣ ಕರ್ಮದ ಋಣ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸಮಗ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿದ ನೈಜ ದೋಷ ವಿಶ್ಲೇಷಣೆ: '${detectedDoshasSummary}'. ಶಾಸ್ತ್ರೀಯವಾಗಿ ಕುಜ, ಸರ್ಪ (ರಾಹು-ಕೇತು), ಪಿತೃ ಪ್ರಭಾವ ಹಾಗೂ ${n(maandiHouse)}ನೇ ಮನೆಯಲ್ಲಿ (${maandiRashiName}) ನೆಲೆಸಿರುವ ಮಾಂದಿಯ ಸೂಕ್ಷ್ಮ ನೆರಳುಗಳನ್ನು ವಿಧಿಬದ್ಧವಾಗಿ ಶಾಂತಗೊಳಿಸಿದಾಗ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ದೂರವಾಗುತ್ತವೆ.`,
        mr: `${devoteeName}, ज्योतिषशास्त्रात दोष म्हणजे शाप नसून पूर्वजन्मातील अपूर्ण कर्मांचे ऋण असते. आपल्या कुंडलीची प्रत्यक्ष तपासणी: '${detectedDoshasSummary}'. मंगळ, राहु-केतूंचा सर्प प्रभाव व ${n(maandiHouse)}व्या स्थानातील (${maandiRashiName}) मांदीची स्थिती यांचे योग्य शास्त्रीय निवारण केल्यास अनावश्यक विलंब दूर होतो.`,
        hi: `${devoteeName}, वैदिक ज्योतिष के अनुसार दोष कोई अभिशाप नहीं, अपितु पूर्वजन्मों से वहन किया गया प्रारब्ध का ऋण है। आपकी कुंडली की यथार्थ दोष जांच: '${detectedDoshasSummary}'। मंगल, राहु-केतु जनित सर्प प्रभाव तथा ${n(maandiHouse)}वें भाव (${maandiRashiName}) में स्थित मांदी की छाया का शास्त्रीय शमन कार्यों के विलंब को समाप्त करता है।`,
        te: `${devoteeName}, జాతకంలో దోషం అంటే శాపం కాదు, పూర్వజన్మ కర్మల రుణం. మీ జాతక వాస్తవ దోష పరిశీలన: '${detectedDoshasSummary}'. కుజ, సర్ప మరియు ${n(maandiHouse)}వ స్థానంలో (${maandiRashiName}) ఉన్న మాంది ప్రభావానికి శాస్త్రోక్త పరిహారంతో ఆటంకాలు తొలగిపోతాయి.`,
        ta: `${devoteeName}, ஜோதிடத்தில் தோஷம் என்பது சாபமல்ல; முற்பிறவி கர்மாவின் கடனாகும். உங்கள் ஜாதகத்தின் உண்மையான தோஷ ஆய்வு: '${detectedDoshasSummary}'. செவ்வாய், ராகு-கேதுவின் சர்ப்ப தாக்கம் மற்றும் ${n(maandiHouse)}-ம் இடமான ${maandiRashiName} ராசியில் உள்ள மாந்தி ஆகியவற்றிற்கு முறைப்படி சாந்தி செய்தால் தடைகள் நீங்கும்.`,
        en: `${devoteeName}, in authentic Parashari astrology, a 'Dosha' is not a fatal curse; it is simply an unresolved karmic debit. Direct natal inspection yields: '${detectedDoshasSummary}'. Harmonizing Mars (Kuja), Pitru, nodal (Sarpa) geometry, and Maandi in House ${maandiHouse} (${maandiRashiName}) clears final-yardline delays.`
      }, targetLang),
      pick6({
        kn: `ದೋಷಗಳ ಪರಿಹಾರ ಮತ್ತು ನೀಚಭಂಗದ ಸತ್ಯ: ಯಾವುದೇ ದೋಷವಿದ್ದರೂ ಪ್ರಕೃತಿಯು ಅದಕ್ಕೆ ಭಂಗ (ಕ್ಯಾನ್ಸಲೇಶನ್) ಮತ್ತು ಪರಿಹಾರವನ್ನು ನೀಡಿರುತ್ತದೆ. ಉದಾಹರಣೆಗೆ, ಕುಜನ ಮೇಲೆ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯಿದ್ದರೆ ಅಥವಾ ಮಾಂದಿಗೆ ಶಿವನ ಆರಾಧನೆ ಮಾಡಿದರೆ ಆ ದೋಷಗಳು ತಮ್ಮ ಕ್ರೂರತೆಯನ್ನು ಕಳೆದುಕೊಂಡು ಯೋಗವಾಗಿ ಮಾರ್ಪಡುತ್ತವೆ. ಅಜ್ಞಾನದಿಂದ ಭಯಪಡುವ ಅಗತ್ಯವಿಲ್ಲ; ವಿಧಿಬದ್ಧ ಪರಿಹಾರವೇ ದೋಷಮುಕ್ತಿಗೆ ಪರಮ ದಾರಿ.`,
        mr: `दोषांचे निराकरण: प्रत्येक दोषाला शास्त्रात तोडगा व परिहार असतो. गुरुची दृष्टी मंगळावर असल्यास किंवा मांदीसाठी शंकराची आराधना केल्यास दोष निष्प्रभ होऊन शुभ परिणाम देतात. घाबरून न जाता शास्त्रीय उपाय करणे श्रेयस्कर ठरते.`,
        hi: `दोष शमन एवं नीचभंग का सिद्धांत: शास्त्र में प्रत्येक दोष के शमन एवं निरस्तीकरण (Cancellation) का स्पष्ट विधान है। जब मंगल पर गुरु की शुभ दृष्टि हो अथवा मांदी हेतु शिव आराधना की जाए, तब वे दोष निष्प्रभावी होकर शुभत्व में परिवर्तित हो जाते हैं। भयभीत होने के स्थान पर शास्त्रीय अनुष्ठान ही कल्याणकारी मार्ग है।`,
        te: `దోషాలకు శాస్త్రంలో పరిహారాలు ఉన్నాయి. గురు దృష్టి లేదా శివారాధన వల్ల దోషాలు తొలగి శుభ ఫలితాలు లభిస్తాయి. భయపడకుండా పరిహారాలు చేసుకోవడం మంచిది.`,
        ta: `தோஷ நிவர்த்தி மற்றும் பரிகாரம்: சாஸ்திரத்தில் ஒவ்வொரு தோஷத்திற்கும் விதிவிலக்கும் பரிகாரமும் உண்டு. குருவின் பார்வை அல்லது சிவ வழிபாடு மூலம் தோஷங்கள் நீங்கி நன்மைகள் உண்டாகும். அச்சப்படாமல் பரிகாரம் செய்வதே சிறந்தது.`,
        en: `Classical cancellation and remedial mechanics: every natal affliction carries an innate architectural antidote. When benefic aspects modulate Mars or when Lord Shiva is invoked for Maandi, these malefic knots untangle into profound resilience. Awareness and authentic Vedic rites supersede fear.`
      }, targetLang),
      pick6({
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ ಪ್ರೋಟೋಕಾಲ್: ಸಮಸ್ತ ಕುಜ, ಸರ್ಪ, ಪಿತೃ ಹಾಗೂ ಮಾಂದಿ ದೋಷಗಳ ಶಾಶ್ವತ ನಿವಾರಣೆಗಾಗಿ ಪವಿತ್ರ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ 'ಸರ್ಪ ಸಂಸ್ಕಾರ', 'ತಿಲ ಹೋಮ' ಅಥವಾ 'ಮಹಾ ರುದ್ರಾಭಿಷೇಕ' ಸಂಕಲ್ಪ ಮಾಡಿಸಿ. ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ತರ್ಪಣ ನೀಡಿ ಆತ್ಮಲಿಂಗವನ್ನು ಸ್ಪರ್ಶಿಸಿ ಪ್ರಾರ್ಥಿಸುವುದರಿಂದ ಸಕಲ ಕರ್ಮ ದೋಷಗಳು ಭಸ್ಮವಾಗಿ ಜೀವನದಲ್ಲಿ ಶಾಶ್ವತ ವಿಜಯ ಲಭಿಸುತ್ತದೆ.`,
        mr: `गोकर्ण क्षेत्रातील सिद्ध उपाय: मंगळ, सर्प, पितृ व मांदी दोषांच्या कायमस्वरूपी मुक्तीसाठी श्री क्षेत्र गोकर्ण महाबळेश्वर सानिध्यात 'महा रुद्राभिषेक' किंवा 'तिल होम' संकल्प करा. कोटीतीर्थात स्नान करून आत्मलिंगाचे दर्शन घेतल्याने सर्व संचित दोषांचा नाश होतो.`,
        hi: `श्री गोकर्ण तीर्थ का प्रामाणिक उपाय विधान: समस्त मंगल, सर्प, पितृ एवं मांदी दोषों की स्थायी शांति हेतु पावन श्री गोकर्ण महाबलेश्वर सन्निधि में 'महा रुद्राभिषेक', 'तिल होम' अथवा 'नागबलि' का संकल्प लें। कोटितीर्थ में तर्पण एवं आत्मलिंग के स्पर्श दर्शन से समस्त प्रारब्ध दोष भस्म होकर अक्षुण्ण विजय प्राप्त होती है।`,
        te: `గోకర్ణ క్షేత్రంలో పరిహారాలు: కుజ, సర్ప, పితృ మరియు మాంది దోషాల శాంతి కొరకు శ్రీ గోకర్ణ మహాబలేశ్వరుని సన్నిధిలో 'మహా రుద్రాభిషేకం' లేదా 'తిల హోమం' చేయించండి. కోటితీర్థ స్నానం, ఆత్మలింగ దర్శనం వల్ల సమస్త దోషాలు తొలగిపోతాయి.`,
        ta: `ஸ்ரீ கோகர்ண க்ஷேத்திர சாஸ்திர பரிகாரம்: செவ்வாய், சர்ப்ப, பித்ரு மற்றும் மாந்தி தோஷங்கள் நீங்க ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியில் 'மகா ருத்ராபிஷேகம்' அல்லது 'தில ஹோமம்' செய்யவும். கோடி தீர்த்தத்தில் நீராடி ஆத்மலிங்கத்தை வழிபட அனைத்து தோஷங்களும் நீங்கி அமைதி உண்டாகும்.`,
        en: `The sacred Gokarna remedial protocol: for permanent dissolution of Kuja, Sarpa, Pitru, and Maandi knots, sponsor an authentic Maha Rudrabhisheka or Tila Homa at Sri Kshetra Gokarna Mahabaleshwara. Offering sacred Tarpana at Kotiteertha and praying before the primordial Atma Linga purifies ancestral karma and installs enduring peace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ದೋಷ ಪರಿಹಾರ ರಹಸ್ಯ", mr: "दोष निवारण रहस्य", hi: "दोष निवारण रहस्य", te: "దోష నివారణ రహస్యం", ta: "தோஷ நிவர்த்தி ரகசியம்", en: "Vedic Remedy Protocol" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಮನೆಯಲ್ಲಿ ಕರ್ಪೂರ ದೀಪ ಬೆಳಗಿಸಿ, ಮಂಗಳವಾರ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯ ದೇವರಿಗೆ ನಮಸ್ಕರಿಸಿ.",
      mr: "दररोज संध्याकाळी घरात कापूर जाळा व मंगळवारी तांब्याच्या पात्राने पूजा करा.",
      hi: "नित्य सायंकाल घर में शुद्ध कर्पूर का दीपक प्रज्वलित करें एवं मंगलवार को ताम्रपात्र से सूर्य को नमन करें।",
      te: "ప్రతిరోజూ సాయంత్రం ఇంట్లో కర్పూరం వెలిగించండి.",
      ta: "தினமும் மாலையில் வீட்டில் கற்பூர தீபம் ஏற்றி வழிபடவும்.",
      en: "Burn natural camphor at twilight in your home shrine, and offer reverence through a copper vessel on Tuesdays."
    }, targetLang)
  });

  // CHAPTER 24: Sacred Stotra, Daily Mantra & Gokarna Protocol
  chapters.push({
    chapterNumber: 24,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ಇಷ್ಟದೇವತಾ ಸ್ತೋತ್ರ, ದೈನಂದಿನ ೧೦-ನಿಮಿಷದ ಜಪ ಪ್ರೋಟೋಕಾಲ್ & ಗೋಕರ್ಣ ರಕ್ಷೆ",
      mr: "इष्टदेवता स्तोत्र, रोजचा १० मिनिटांचा जप व गोकर्ण सुरक्षा",
      hi: "इष्टदेवता स्तोत्र, दैनिक १०-मिनट जप विधान एवं गोकर्ण रक्षा",
      te: "ఇష్టదైవ స్తోత్రం, రోజువారీ 10 నిమిషాల జప విధానం & గోకర్ణ రక్షణ",
      ta: "இஷ்ட தேவதை ஸ்தோத்திரம், தினசரி 10 நிமிட ஜப முறை & கோகர்ண பாதுகாப்பு",
      en: "Sacred Stotra, Daily 10-Minute Japa Protocol & Gokarna Sanctuary"
    }, targetLang),
    icon: "📿",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ಸರಿಹೊಂದುವ ಪರಮ ಪವಿತ್ರ ಇಷ್ಟದೇವತಾ ಸ್ತೋತ್ರ ಹಾಗೂ ನಿತ್ಯ ಜಪ ವಿಧಾನ ಯಾವುದು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या जन्म नक्षत्राशी सुसंगत असलेले इष्टदेवता स्तोत्र व नित्य जप कोणता?`,
      hi: `प्रश्न: ${devoteeName}, आपके जन्म नक्षत्र के अनुकूल परम पावन इष्टदेवता स्तोत्र एवं नित्य जप विधान क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జన్మ నక్షత్రానికి సరిపోయే ఇష్టదైవ స్తోత్రం మరియు రోజూ చేయవలసిన జపం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் பிறந்த நட்சத்திரத்திற்கு உகந்த இஷ்ட தேவதை ஸ்தோத்திரம் மற்றும் தினசரி ஜப முறை என்ன?`,
      en: `Question: ${devoteeName}, which personalized Stotra and 10-minute daily Japa protocol are aligned with your Janma Nakshatra?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${nakshatraName}ಯು ಅಪಾರ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿಯನ್ನು ತನ್ನ ಒಡಲಲ್ಲಿ ಇಟ್ಟುಕೊಂಡಿದೆ. ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿದೇವತೆಯನ್ನು ಮಂತ್ರಪೂರ್ವಕವಾಗಿ ಆರಾಧಿಸುವುದರಿಂದ ಜಾತಕದಲ್ಲಿರುವ ನವಗ್ರಹಗಳ ಅಶುಭ ಪ್ರಭಾವಗಳು ತಾನಾಗಿಯೇ ಶಾಂತವಾಗುತ್ತವೆ. ನಿಯಮಿತ ಮಂತ್ರ ಜಪವು ಬ್ರಹ್ಮಾಂಡದ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಜೋಡಿಸುವ ದೈವಿಕ ಸೇತುವೆಯಾಗಿದೆ.`,
        mr: `${devoteeName}, आपले जन्म नक्षत्र ${nakshatraName} हे असीम आध्यात्मिक ऊर्जेचे भांडार आहे. नक्षत्राच्या अधिपती देवतेचा नियमित जप केल्याने नवग्रहांचे प्रतिकूल प्रभाव शांत होऊन मन एकाग्र होते. मंत्रजप ही आपल्या अंतर्मनाला ईश्वरीय शांतीशी जोडणारी दिव्य साधना आहे.`,
        hi: `${devoteeName}, आपका जन्म नक्षत्र ${nakshatraName} असीम चैतन्य और आध्यात्मिक ऊर्जा का स्रोत है। शास्त्रोक्त विधान के अनुसार जन्म नक्षत्र के अधिष्ठाता देव की मन्त्रोपासना से नवग्रह जनित समस्त प्रतिकूलताएं स्वतः शांत होकर बुद्धि निर्मल बनती है।`,
        te: `${devoteeName}, మీ జన్మ నక్షత్రమైన ${nakshatraName} అపారమైన ఆధ్యాత్మిక శక్తిని కలిగి ఉంది. శాస్త్రం ప్రకారం జన్మ నక్షత్ర అధిదేవతను భక్తితో ఆరాధించడం వల్ల నవగ్రహ దోషాలు తొలగిపోయి మనస్సుకు గాఢమైన శాంతి, ఏకాగ్రత లభిస్తాయి. మంత్ర జపం మిమ్మల్ని దివ్య శక్తితో అనుసంధానించే వారధిలా పనిచేస్తుంది.`,
        ta: `${devoteeName}, உங்கள் பிறந்த நட்சத்திரமான ${nakshatraName} அளவற்ற ஆன்மீக ஆற்றலைக் கொண்டுள்ளது. சாஸ்திர விதிப்படி உங்கள் நட்சத்திர அதிதேவதையை மந்திரத்தால் வழிபடும்போது நவகிரகத் தடைகள் அனைத்தும் அமைதியடைந்து மனம் தெளிவு பெறும். தினசரி மந்திர ஜபம் பிரபஞ்ச நன்மைகளை உங்களிடம் ஈர்க்கும் புனிதப் பாலமாகும்.`,
        en: `${devoteeName}, your Janma Nakshatra ${nakshatraName} carries a distinct resonant frequency inside the Vedic sound matrix. Revering your birth star's presiding deity calms ambient planetary turbulence while clearing mental fog and emotional exhaustion.`
      }, targetLang),
      pick6({
        kn: `ನಿಮಗಾಗಿ ನಿಗದಿಪಡಿಸಲಾದ ೧೦-ನಿಮಿಷಗಳ ದೈನಂದಿನ ಜಪ ಪ್ರೋಟೋಕಾಲ್: ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಸ್ನಾನದ ನಂತರ ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡಿ ಕುಳಿತುಕೊಳ್ಳಿ. ಕಣ್ಣುಗಳನ್ನು ಮುಚ್ಚಿ ೩ ಬಾರಿ ಪ್ರಣವ ನಾದ 'ಓಂ' ಉಚ್ಚರಿಸಿ. ನಂತರ ನಿಮ್ಮ ಇಷ್ಟದೇವತೆಯ ಮೂಲ ಬೀಜಮಂತ್ರ ಅಥವಾ 'ಶ್ರೀ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಮಂತ್ರ'ವನ್ನು (ಓಂ ನಮಃ ಶಿವಾಯ) ೧೦೮ ಬಾರಿ ಶಾಂತಚಿತ್ತದಿಂದ ಜಪಿಸಿ. ಈ ಸರಳ ಆಚರಣೆಯು ನಿಮ್ಮ ಸುತ್ತಲೂ ಒಂದು ಅದೃಶ್ಯ ರಕ್ಷಾ ಕವಚವನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ.`,
        mr: `आपल्यासाठी १० मिनिटांचा नित्य जप: रोज सकाळी आंघोळीनंतर पूर्व किंवा उत्तर दिशेकडे तोंड करून बसा. ३ वेळा 'ॐ' चा उच्चार करा व त्यानंतर १०८ वेळा 'ॐ नमः शिवाय' जप करा. हे साधे आचरण आपल्याभोवती एक सुरक्षा कवच निर्माण करेल.`,
        hi: `आपके लिए १०-मिनट का नित्य जप विधान: प्रतिदिन प्रातः स्नानोपरांत पूर्व अथवा उत्तर दिशा की ओर मुख करके बैठें। ३ बार ओंकार ध्वनि का उच्चारण करें, तदुपरांत १०८ बार 'ॐ नमः शिवाय' अथवा इष्ट मंत्र का शांत मन से जप करें। यह सरल अनुष्ठान आपके चारों ओर एक अभेद्य सुरक्षा चक्र स्थापित करेगा।`,
        te: `రోజూ 10 నిమిషాల జపం: ఉదయాన్నే తూర్పు ముఖంగా కూర్చుని 3 సార్లు 'ఓం' పలికి, 108 సార్లు 'ఓం నమః శివాయ' జపించండి. ఇది మీకు అద్భుతమైన రక్షణను ఇస్తుంది.`,
        ta: `தினசரி 10 நிமிட ஜப முறை: காலையில் கிழக்கு நோக்கி அமர்ந்து 3 முறை 'ஓம்' கூறி, 108 முறை 'ஓம் நம சிவாய' சொல்லுங்கள். இது உங்களைச் சுற்றி ஒரு தெய்வீக கவசத்தை உருவாக்கும்.`,
        en: `Your dedicated 10-Minute Daily Japa Protocol: sit facing East or North following your morning ablutions. Intone 'Om' three times to center your breath, followed by 108 recitations of the sacred Shiva Panchakshari ('Om Namah Shivaya') or your Nakshatra Ishta mantra, anchoring an aura of calm resilience.`
      }, targetLang),
      pick6({
        kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಮಹಾ ಮಂತ್ರ ಸಂಪರ್ಕ: ಶ್ರೀ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಆತ್ಮಲಿಂಗವು ರಾವಣನಿಂದ ಪ್ರತಿಷ್ಠಾಪಿಸಲ್ಪಟ್ಟ ಪರಮ ಶಿವಲಿಂಗವಾಗಿದ್ದು, ಸಮಸ್ತ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಸುವ ಕಾಮಧೇನುವಾಗಿದೆ. ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಗೋಕರ್ಣದ ಪವಿತ್ರ ಭಸ್ಮ ಅಥವಾ ಪ್ರಸಾದವನ್ನು ಇಟ್ಟು ನಮಸ್ಕರಿಸುವುದು ನಿಮ್ಮ ಮಂತ್ರ ಸಿದ್ಧಿಯನ್ನು ನೂರ್ಮಡಿಗೊಳಿಸುತ್ತದೆ.`,
        mr: `गोकर्ण महाबळेश्वर महामंत्र: गोकर्णचे आत्मलिंग हे सर्व इच्छा पूर्ण करणारे महास्थान आहे. गोकर्णचा पवित्र भस्म कपाळावर लावल्याने मंत्र सिद्धी लवकर होते.`,
        hi: `श्री गोकर्ण महाबलेश्वर सन्निधि का पावन संपर्क: गोकर्ण का आत्मलिंग साक्षात सदाशिव का साक्षात विग्रह है। घर के पूजा स्थल पर गोकर्ण का पवित्र भस्म अथवा प्रसाद स्थापित कर नमन करने से आपकी मंत्र साधना शीघ्र सिद्ध होती है।`,
        te: `గోకర్ణ ఆత్మలింగం ఎంతో మహిమాన్వితమైనది. పూజా గదిలో గోకర్ణ ప్రసాదాన్ని ఉంచి పూజించడం వల్ల జప సిద్ధి కలుగుతుంది.`,
        ta: `கோகர்ண மகாபலேஸ்வரர் அருள் தொடர்பு: கோகர்ண ஆத்மலிங்கம் சகல விருப்பங்களையும் நிறைவேற்றும் திருத்தலமாகும். கோகர்ண விபூதியை நெற்றியில் தரிக்க மந்திர சித்தி எளிதில் கிட்டும்.`,
        en: `Connection with the primordial Gokarna Atma Linga: Sri Kshetra Gokarna preserves Lord Shiva's ancient Atma Linga. Keeping consecrated Gokarna Vibhuti at your altar and applying it quietly before daily Japa accelerates clarity and inner peace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಮಂತ್ರ ಜಪ ರಕ್ಷೆ", mr: "मंत्र जप सुरक्षा", hi: "मंत्र जप कवच", te: "మంత్ర జప రక్షణ", ta: "மந்திர ஜப கவசம்", en: "Sacred Japa Shield" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಜಪ ಮಾಡುವ ಸಮಯದಲ್ಲಿ ಮೊಬೈಲ್ ಫೋನ್ ಅನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಸ್ವಿಚ್ ಆಫ್ ಅಥವಾ ಸೈಲೆಂಟ್ ಮಾಡಿ; ಮನಸ್ಸಿನ ಏಕಾಗ್ರತೆಯೇ ಮಂತ್ರದ ಪ್ರಾಣ.",
      mr: "जप करताना मोबाईल सायलेंट करा; मनाची एकाग्रता हाच मंत्राचा आत्मा आहे.",
      hi: "जप के समय मोबाइल फोन को मौन रखें; चित्त की एकाग्रता ही मंत्र की वास्तविक प्राणशक्ति है।",
      te: "జపం చేసేటప్పుడు మొబైల్ పక్కన పెట్టండి; ఏకాగ్రతే ముఖ్యం.",
      ta: "ஜபம் செய்யும் போது செல்போனை தள்ளி வைக்கவும்; மன ஒருமைப்பாடே மந்திரத்தின் பலமாகும்.",
      en: "Silence all communication devices during the 10-minute Japa interval; undisturbed mental absorption is the life-breath of the mantra."
    }, targetLang)
  });

  // CHAPTER 25: Chief Astrologer's Final Summary (Jyotishya Saramsha) & Gokarna Ashirvada (Core V1 Section)
  chapters.push({
    chapterNumber: 25,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ಜ್ಯೋತಿಷ್ಯ ಸಾರಾಂಶ: ಮುಖ್ಯ ಅರ್ಚಕರ ಪರಮ ಸತ್ಯ ನಿರ್ಣಯ & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾ ಆಶೀರ್ವಾದ",
      mr: "ज्योतिष सारांश: मुख्य पुरोहितांचे अंतिम मार्गदर्शन व श्री क्षेत्र गोकर्ण महा आशीर्वाद",
      hi: "ज्योतिष सारांश: मुख्य अर्चक का परम सत्य निर्णय एवं श्री क्षेत्र गोकर्ण महा आशीर्वाद",
      te: "జ్యోతిష్య సారాంశం: ముఖ్య అర్చకుల దివ్య సందేశం & శ్రీ క్షేత్ర గోకర్ణ మహా ఆశీర్వాదం",
      ta: "ஜோதிட சாரம்: தலைமை அர்ச்சகரின் இறுதி தீர்ப்பு & ஸ்ரீ க்ஷேத்திர கோகர்ண மகா ஆசீர்வாதம்",
      en: "Chief Astrologer's Final Verdict (Jyotishya Saramsha) & Sri Kshetra Gokarna Ashirvada"
    }, targetLang),
    icon: "🔱",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಸಮಗ್ರ ೨೫ ಅಧ್ಯಾಯಗಳ ಜಾತಕ ವರದಿಯ ಅಂತಿಮ ಸಾರಾಂಶವೇನು ಹಾಗೂ ಮುಖ್ಯ ಅರ್ಚಕರು ನಿಮಗೆ ನೀಡುತ್ತಿರುವ ದೈವಿಕ ಸಂದೇಶವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, या संपूर्ण २५ अध्यायांच्या अहवालाचा अंतिम सारांश काय व मुख्य पुरोहितांचा दैवी संदेश काय आहे?`,
      hi: `प्रश्न: ${devoteeName}, इस समग्र २५-अध्यायीय प्रतिवेदन का अंतिम निष्कर्ष क्या है और मुख्य अर्चक का आपको क्या दिव्य संदेश है?`,
      te: `ప్రశ్న: ${devoteeName}, ఈ 25 అధ్యాయాల జాతక నివేదిక తుది సారాంశం ఏమిటి మరియు ముఖ్య అర్చకుల సందేశం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, இந்த 25 அத்தியாய ஜாதக அறிக்கையின் இறுதி சாரம் என்ன? தலைமை அர்ச்சகரின் ஆசிச் செய்தி என்ன?`,
      en: `Question: ${devoteeName}, what is the Chief Astrologer's supreme synthesizing verdict and sacred Gokarna blessing for your life journey?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದ ಮುಖ್ಯ ಅರ್ಚಕ ಪೀಠದಿಂದ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಮಗ್ರ ೨೫ ಅಧ್ಯಾಯಗಳನ್ನು ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಿದ ನಂತರ ನೀಡುತ್ತಿರುವ ಅಂತಿಮ ಸಾರಾಂಶವಿದು: ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}, ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}, ಹಾಗೂ ${nakshatraName} ನಕ್ಷತ್ರಗಳು ನಿಮ್ಮಲ್ಲಿ ಅಸಾಧಾರಣವಾದ ಸಂಕಲ್ಪ ಶಕ್ತಿಯನ್ನು ನೀಡಿವೆ. ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ಅಡೆತಡೆಗಳು ಎದುರಾದರೂ, ಅವುಗಳನ್ನು ಮೆಟ್ಟಿ ನಿಂತು ವಿಜಯಶಾಲಿಯಾಗುವ ದೈವಿಕ ರಕ್ಷಣೆ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`,
        mr: `${devoteeName}, श्री क्षेत्र गोकर्ण महाबळेश्वर मुख्य पुरोहित पीठावरून आपल्या पत्रिकेचा अंतिम सारांश: आपले ${lagnaRashiName} लग्न, ${moonRashiName} रास व ${nakshatraName} नक्षत्र आपल्याला अफाट इच्छाशक्ती प्रदान करतात. आयुष्यात कितीही संकटे आली तरी त्यावर मात करून विजयी होण्याचे सामर्थ्य आपल्यात आहे.`,
        hi: `${devoteeName}, श्री क्षेत्र गोकर्ण महाबलेश्वर मुख्य अर्चक पीठ से आपकी समग्र कुंडली के गहन अवलोकन उपरांत यह अंतिम सार तत्व उद्घाटित है: आपका ${lagnaRashiName} लग्न, ${moonRashiName} राशि एवं ${nakshatraName} नक्षत्र आपको अद्भुत आत्मबल प्रदान करते हैं। जीवन में कितनी भी चुनौतियां आएं, उन पर विजय प्राप्त करने का ईश्वरीय रक्षा कवच आपके साथ है।`,
        te: `${devoteeName}, గోకర్ణ మహాబలేశ్వర పీఠం నుండి మీ జాతక సారాంశం: మీ ${lagnaRashiName} లగ్నం, ${moonRashiName} రాశి మీకు అద్భుతమైన సంకల్ప బలాన్ని ఇచ్చాయి. ఎలాంటి కష్టాలనైనా ఎదుర్కొని గెలిచే శక్తి మీకుంది.`,
        ta: `${devoteeName}, ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் தலைமை அர்ச்சகர் வழங்கும் இறுதி சாரம்: உங்கள் ${lagnaRashiName} லக்னம் மற்றும் ${moonRashiName} ராசி உங்களுக்கு அசாத்தியமான மனஉறுதியை தந்துள்ளது. எத்தகைய சவால்களையும் வென்று சாதிக்கும் பலம் உங்களிடம் உள்ளது.`,
        en: `${devoteeName}, from the sacred seat of Chief Priest Veda Moorthy Chaitanya Pandit at Sri Kshetra Gokarna Mahabaleshwara Sannidhana, this is your supreme synthesizing verdict: your ${lagnaRashiName} ascendant, Moon sign ${moonRashiName}, and ${nakshatraName} nakshatra bestow immense tenacity. Life's tests have not arrived to diminish you; they are the crucible tempering your enduring victory.`
      }, targetLang),
      pick6({
        kn: `ನಿಮ್ಮ ಜೀವನದ ಪರಮ ಸೂತ್ರ: ಎಂದಿಗೂ ಇತರರೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಹೋಲಿಸಿಕೊಂಡು ಕೀಳರಿಮೆ ಪಡಬೇಡಿ. ಪ್ರಕೃತಿಯು ನಿಮಗೆ ನೀಡಿರುವ ಯೋಗಿ ಗ್ರಹದ ಧನ ಶಕ್ತಿ ಹಾಗೂ ಬೃಗು ಬಿಂದುವಿನ ಭಾಗ್ಯೋದಯವು ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ಅತ್ಯುನ್ನತ ಗೌರವದ ಸ್ಥಾನದಲ್ಲಿ ನಿಲ್ಲಿಸಲಿದೆ. ಅನಗತ್ಯ ಸಾಲ ಮಾಡದೆ, ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಯುವುದೇ ನಿಮ್ಮ ಶಾಶ್ವತ ಯಶಸ್ಸಿನ ಗುಟ್ಟು.`,
        mr: `जीवनाचे मुख्य सूत्र: स्वतःची तुलना इतरांशी करून खचून जाऊ नका. आपल्या नशिबातील योगी ग्रह व भृगु बिंदू आगामी काळात आपल्या कुटुंबाला मोठी प्रतिष्ठा मिळवून देईल. प्रामाणिकपणे पुढे जाणे हेच आपले यश आहे.`,
        hi: `आपके जीवन का महामंत्र: कभी भी दूसरों से अपनी तुलना कर हीनभावना न लाएं। आपकी कुंडली में विद्यमान योगी ग्रह एवं भृगु बिंदु का सौभाग्य आगामी वर्षों में आपके कुल को सर्वोच्च प्रतिष्ठा दिलाएगा। सत्य एवं संयम के मार्ग पर अडिग रहना ही आपकी विजय का रहस्य है।`,
        te: `జీవిత సూత్రం: ఇతరులతో మిమ్మల్ని పోల్చుకోకండి. మీ జాతకంలోని యోగి గ్రహం, భృగు బిందువు రాబోయే కాలంలో మీ కుటుంబాన్ని ఉన్నత స్థానంలో నిలబెడతాయి.`,
        ta: `வாழ்க்கை பாடம்: பிறருடன் உங்களை ஒப்பிட்டு சோர்வடையாதீர்கள். உங்கள் யோகி கிரகமும் பிருகு பிந்துவும் வரும் காலத்தில் உங்கள் குடும்பத்திற்கு பெரும் புகழைத் தரும். நேர்மையே உங்கள் வெற்றி.`,
        en: `Your cardinal life axiom: never measure your unique trajectory against the shallow yardsticks of others. The activated wealth frequencies of your Yogi planet and the divine turning point of your Bhrigu Bindu ensure your family line rises into honor and security. Guard your financial boundaries and walk in dharma.`
      }, targetLang),
      pick6({
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಆಶೀರ್ವಾದ: ಪರಮೇಶ್ವರನ ದಿವ್ಯ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಾನದಿಂದ ನಾವು ನಿಮಗೆ ಪೂರ್ಣಾಯುಷ್ಯ, ಆರೋಗ್ಯ, ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ನಿತ್ಯ ಶಾಂತಿಯನ್ನು ಆಶೀರ್ವದಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಮನೆಯಲ್ಲಿ ಸದಾ ಅನ್ನಪೂರ್ಣೆಯ ಕೃಪೆ ಇರಲಿ, ಮಕ್ಕಳ ಭವಿಷ್ಯವು ಉಜ್ವಲವಾಗಲಿ. ॥ ಓಂ ನಮಃ ಶಿವಾಯ • ಶುಭಂ ಭವತು • ಶ್ರೀ ಕೃಷ್ಣಾರ್ಪಣಮಸ್ತು ॥`,
        mr: `श्री गोकर्ण महाबळेश्वर महा आशीर्वाद: आत्मलिंगाच्या पवित्र सानिध्यावरून आम्ही आपल्याला उत्तम आरोग्य, दीर्घायुष्य व यशाचा आशीर्वाद देतो. घरात सुख-शांती व समृद्धी नांदो. ॥ ॐ नमः शिवाय • शुभं भवतु ॥`,
        hi: `श्री गोकर्ण महाबलेश्वर महा आशीर्वाद: देवाधिदेव महादेव के आत्मलिंग सन्निधि से हम आपके दीर्घायु, आरोग्य, कार्य सिद्धि एवं चिर शांति का शुभाशीर्वाद प्रदान करते हैं। आपके गृह में नित्य अन्नपूर्णा एवं लक्ष्मी का वास रहे। ॥ ॐ नमः शिवाय • शुभं भवतु • श्री कृष्णार्पणमस्तु ॥`,
        te: `శ్రీ గోకర్ణ మహాబలేశ్వర మహా ఆశీర్వాదం: ఆత్మలింగ సన్నిధానం నుండి మీకు సంపూర్ణ ఆయురారోగ్యాలు, ఐశ్వర్యం మరియు విజయాలు కలగాలని ఆశీర్వదిస్తున్నాము. ॥ ఓం నమః శివాయ • శుభం భవతు ॥`,
        ta: `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மகா ஆசீர்வாதம்: ஈசனின் ஆத்மலிங்க சன்னதியிலிருந்து உங்களுக்கு பூரண ஆயுள், நல்வாழ்வு மற்றும் வெற்றி கிடைக்க மனதார ஆசீர்வதிக்கிறோம். ✦ ஓம் நம சிவாய • சுபம் பவத்து ✦`,
        en: `Sri Kshetra Gokarna Mahabaleshwara Supreme Benediction: from the sacred precinct of the primordial Atma Linga, we bestow solemn blessings for your longevity, vibrant health, financial sovereignty, and unbroken domestic peace. May Goddess Annapurna forever bless your household. || Om Namah Shivaya • Shubham Bhavatu ||`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಗೋಕರ್ಣ ಮಹಾ ಆಶೀರ್ವಾದ", mr: "गोकर्ण महा आशीर्वाद", hi: "गोकर्ण महा आशीर्वाद", te: "గోకర్ణ మహా ఆశీర్వాదం", ta: "கோகர்ண மகா ஆசீர்வாதம்", en: "Sacred Gokarna Benediction" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಈ ವರದಿಯನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ದೇವರ ಪಾದಗಳ ಬಳಿ ಇಟ್ಟು ನಮಸ್ಕರಿಸಿ; ದೈವಿಕ ರಕ್ಷಣೆ ಸದಾ ನಿಮ್ಮೊಂದಿಗಿರುತ್ತದೆ.",
      mr: "हा अहवाल घरातील देव्हाऱ्यात देवाच्या चरणांशी ठेवून नमस्कार करा; ईश्वराची कृपा सदैव राहील.",
      hi: "इस दिव्य प्रतिवेदन को अपने घर के पूजा स्थल पर भगवान के श्रीचरणों में रखकर नमन करें; ईश्वरीय सुरक्षा सदैव आपके साथ रहेगी।",
      te: "ఈ నివేదికను మీ పూజా గదిలో దేవుని పాదాల వద్ద ఉంచి నమస్కరించండి.",
      ta: "இந்த புனித ஜாதக அறிக்கையை பூஜை அறையில் இறைவனின் திருவடியில் வைத்து வணங்கவும்; தெய்வ அருள் எப்போதும் துணை நிற்கும்.",
      en: "Place this sacred destiny report at the feet of the Divine at your home altar; may the grace of Sri Kshetra Gokarna envelop your household forever."
    }, targetLang)
  });

  return chapters.map((ch) => {
    const enrichment = buildChapterPrecisionEnrichment({
      chapterNumber: ch.chapterNumber,
      targetLang,
      devoteeName,
      lagnaRashiName,
      moonRashiName,
      nakshatraName,
      nakshatraPada,
      currentHoraPlanet,
      currentMahadasha,
      currentBhuktiLord,
      bhuktiEndDate,
      yogiPlanetName,
      avayogiPlanetName,
      bhriguBinduRashiName,
      bhriguDeg,
      maandiHouse,
      maandiRashiName,
      shaniTransitRashi,
      shaniHouseFromMoon,
      shaniTransitSav,
      guruTransitRashi,
      guruHouseFromMoon,
      guruTransitSav,
      rahuHouseFromMoon,
      house10Info,
      house2Info,
      house11Info,
      house7Info,
      house5Info,
      house6Info,
      isMinor,
      isChildOrInfant,
      isSenior,
      ext: extendedPrecision
    });
    const expandedParagraphs = [...ch.paragraphs, ...enrichment.extraParagraphs].map((p) => {
      let cleaned = cleanDegreesFromText(cleanPunctuationArtifacts(p));
      if (targetLang !== "en") {
        cleaned = cleanRegionalPreserveBullets(cleaned, targetLang);
      }
      return cleaned;
    });
    const cleanField = (v?: string) => {
      if (!v) return v;
      const base = cleanPunctuationArtifacts(v);
      return targetLang === "en" ? base : cleanRegionalPreserveBullets(base, targetLang);
    };
    return {
      ...ch,
      sectionTitle: cleanField(ch.sectionTitle) || ch.sectionTitle,
      title: cleanField(ch.title) || ch.title,
      question: cleanField(ch.question) || ch.question,
      guidanceBadge: cleanField(ch.guidanceBadge),
      practicalGuidance: cleanField(ch.practicalGuidance),
      paragraphs: expandedParagraphs,
      precisionAnchors: enrichment.precisionAnchors
    };
  });
}

// ============================================================================
// 5. HIGH-DPI SECTON-BY-SECTION PDF CAPTURE ENGINE (ZERO TABLES, PERFECT PARITY)
// ============================================================================

export const SAMPOORNA25_A4_LAYOUT = {
  A4_WIDTH_MM: 210,
  A4_HEIGHT_MM: 297,
  OUTER_BORDER_INSET_MM: 6,
  INNER_BORDER_INSET_MM: 7.8,
  IMAGE_X_MM: 9.5,
  IMAGE_W_MM: 191, // 9.5 + 191 = 200.5mm (strictly inside 202.2mm inner border)
  PAGE1_TOP_Y_MM: 9.6,
  CONT_TOP_Y_MM: 18.0, // Starts cleanly below Pages 2+ running header hairline (17.4mm)
  CONTENT_BOTTOM_MAX_MM: 278.5, // Strict safety clearance above footer hairline (281.0mm)
  RUNNING_HEADER_Y_MM: 9.0,
  RUNNING_HEADER_MAX_H_MM: 7.4,
  FOOTER_LINE_Y_MM: 281.0,
  FOOTER_TEXT_Y_MM: 285.5, // Strictly inside inner border bottom (289.2mm)
} as const;

export interface RenderedSectionChunkInput {
  imgData: string;
  heightMm: number;
  name: string;
  sliceIndex?: number;
  sourceTopRatio?: number;
  sourceBottomRatio?: number;
}

export interface PlannedA4Section {
  imgData: string;
  heightMm: number;
  renderWidthMm: number;
  renderHeightMm: number;
  renderXMm: number;
  name: string;
  sourceTopRatio?: number;
  sourceBottomRatio?: number;
}

export interface PlannedA4Page {
  pageNumber: number;
  maxUsableHeightMm: number;
  sections: PlannedA4Section[];
  totalHeightMm: number;
}

/**
 * Pure A4 pagination planner guaranteeing:
 * 1. Zero aspect-ratio squishing (oversized small drifts scale proportionally across W and H).
 * 2. Images never overlap left/right vector borders (bounded within [IMAGE_X_MM, IMAGE_X_MM + IMAGE_W_MM]).
 * 3. Every chapter, calendar-qr, culmination, and continuation slice starts on a fresh A4 sheet.
 */
export function planSampoorna25A4Pages(
  renderedSections: RenderedSectionChunkInput[],
  layout = SAMPOORNA25_A4_LAYOUT
): PlannedA4Page[] {
  const page1UsableH = layout.CONTENT_BOTTOM_MAX_MM - layout.PAGE1_TOP_Y_MM;
  const contUsableH = layout.CONTENT_BOTTOM_MAX_MM - layout.CONT_TOP_Y_MM;

  const pages: PlannedA4Page[] = [];
  let currentSections: PlannedA4Section[] = [];
  let currentHeight = 0;

  const normalizeForMaxH = (sec: RenderedSectionChunkInput, maxH: number): PlannedA4Section => {
    if (sec.heightMm <= maxH || sec.heightMm <= 0) {
      return {
        imgData: sec.imgData,
        heightMm: sec.heightMm,
        renderWidthMm: layout.IMAGE_W_MM,
        renderHeightMm: sec.heightMm,
        renderXMm: layout.IMAGE_X_MM,
        name: sec.name,
        sourceTopRatio: sec.sourceTopRatio ?? 0,
        sourceBottomRatio: sec.sourceBottomRatio ?? 1,
      };
    }
    const ratio = maxH / sec.heightMm;
    const renderW = Number((layout.IMAGE_W_MM * ratio).toFixed(3));
    const renderX = Number((layout.IMAGE_X_MM + (layout.IMAGE_W_MM - renderW) / 2).toFixed(3));
    return {
      imgData: sec.imgData,
      heightMm: sec.heightMm,
      renderWidthMm: renderW,
      renderHeightMm: maxH,
      renderXMm: renderX,
      name: sec.name,
      sourceTopRatio: sec.sourceTopRatio ?? 0,
      sourceBottomRatio: sec.sourceBottomRatio ?? 1,
    };
  };

  for (let i = 0; i < renderedSections.length; i++) {
    const sec = renderedSections[i];
    const isChapter = sec.name.startsWith("chapter-");
    const isCalendarQr = sec.name.includes("calendar-qr");
    const isCulmination = sec.name.includes("family") || sec.name.includes("priest");
    const isContinuationSlice = typeof sec.sliceIndex === "number" && sec.sliceIndex > 0;

    const activeMaxH = pages.length === 0 ? page1UsableH : contUsableH;
    const forceNewPage =
      isContinuationSlice || ((isChapter || isCalendarQr || isCulmination) && currentSections.length > 0);
    const fitsOnCurrent =
      !forceNewPage && currentSections.length > 0 && currentHeight + sec.heightMm <= activeMaxH;

    if (fitsOnCurrent) {
      const normalized = normalizeForMaxH(sec, activeMaxH);
      currentSections.push(normalized);
      currentHeight += normalized.renderHeightMm;
    } else {
      if (currentSections.length > 0) {
        pages.push({
          pageNumber: pages.length + 1,
          maxUsableHeightMm: activeMaxH,
          sections: currentSections,
          totalHeightMm: currentHeight,
        });
        currentSections = [];
        currentHeight = 0;
      }
      const freshPageMaxH = pages.length === 0 ? page1UsableH : contUsableH;
      const normalized = normalizeForMaxH(sec, freshPageMaxH);
      currentSections.push(normalized);
      currentHeight = normalized.renderHeightMm;
    }
  }

  if (currentSections.length > 0) {
    const lastMaxH = pages.length === 0 ? page1UsableH : contUsableH;
    pages.push({
      pageNumber: pages.length + 1,
      maxUsableHeightMm: lastMaxH,
      sections: currentSections,
      totalHeightMm: currentHeight,
    });
  }

  return pages;
}

function sliceCanvasToA4Chunks(
  sourceCanvas: HTMLCanvasElement,
  sectionName: string,
  maxPageHeightMm: number,
  imageWidthMm: number
): RenderedSectionChunkInput[] {
  const fullHeightMm = (sourceCanvas.height * imageWidthMm) / sourceCanvas.width;
  if (fullHeightMm <= maxPageHeightMm * 1.12) {
    return [{
      imgData: sourceCanvas.toDataURL("image/jpeg", 0.95),
      heightMm: fullHeightMm,
      name: sectionName,
      sourceTopRatio: 0,
      sourceBottomRatio: 1,
    }];
  }

  const maxSlicePx = Math.max(200, Math.floor((maxPageHeightMm * sourceCanvas.width) / imageWidthMm));
  const chunks: RenderedSectionChunkInput[] = [];
  let offsetY = 0;
  let sliceIdx = 0;
  const totalCanvasH = Math.max(1, sourceCanvas.height);

  while (offsetY < sourceCanvas.height) {
    const slicePx = Math.min(maxSlicePx, sourceCanvas.height - offsetY);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = sourceCanvas.width;
    sliceCanvas.height = slicePx;
    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFF7ED";
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(sourceCanvas, 0, offsetY, sourceCanvas.width, slicePx, 0, 0, sourceCanvas.width, slicePx);
      const sliceHeightMm = (slicePx * imageWidthMm) / sliceCanvas.width;
      chunks.push({
        imgData: sliceCanvas.toDataURL("image/jpeg", 0.95),
        heightMm: sliceHeightMm,
        name: sectionName,
        sliceIndex: sliceIdx,
        sourceTopRatio: offsetY / totalCanvasH,
        sourceBottomRatio: (offsetY + slicePx) / totalCanvasH,
      });
    }
    sliceCanvas.width = 0;
    sliceCanvas.height = 0;
    offsetY += slicePx;
    sliceIdx += 1;
  }

  return chunks;
}

function renderNativePageTagImage(
  label: string,
  lang: SixLang
): { imgData: string; widthMm: number; heightMm: number } | null {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const fontMap: Record<SixLang, string> = {
      kn: "'Noto Serif Kannada', 'Noto Sans Kannada', serif",
      mr: "'Noto Sans Devanagari', serif",
      hi: "'Noto Sans Devanagari', serif",
      te: "'Noto Sans Telugu', serif",
      ta: "'Noto Sans Tamil', serif",
      en: "'Outfit', Helvetica, sans-serif",
    };
    const fontStr = `700 22px ${fontMap[lang] || fontMap.en}`;
    ctx.font = fontStr;
    const metrics = ctx.measureText(label);
    const padX = 12;
    const wPx = Math.max(60, Math.ceil(metrics.width + padX * 2));
    const hPx = 36;
    canvas.width = wPx;
    canvas.height = hPx;

    ctx.fillStyle = "#FFF7ED";
    ctx.fillRect(0, 0, wPx, hPx);
    ctx.font = fontStr;
    ctx.fillStyle = "#78350F";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillText(label, wPx - 4, hPx / 2);

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const targetHMm = 4.6;
    const targetWMm = Number(((wPx * targetHMm) / hPx).toFixed(3));
    canvas.width = 0;
    canvas.height = 0;
    return { imgData, widthMm: targetWMm, heightMm: targetHMm };
  } catch {
    return null;
  }
}

async function captureDomElementToCanvas(el: HTMLElement, minHeightPx = 40): Promise<HTMLCanvasElement | null> {
  const tempBox = document.createElement("div");
  tempBox.style.position = "fixed";
  tempBox.style.left = "0px";
  tempBox.style.top = "0px";
  tempBox.style.width = "900px";
  tempBox.style.overflow = "visible";
  tempBox.style.zIndex = "-9999";
  tempBox.style.backgroundColor = "#FFF7ED";
  tempBox.style.pointerEvents = "none";
  tempBox.style.opacity = "1";
  tempBox.style.fontFamily = "'Noto Serif Kannada', 'Noto Sans Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Outfit', serif, sans-serif";
  tempBox.style.letterSpacing = "normal";
  tempBox.className = "bg-orange-50 text-amber-950 font-serif";

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.display = "block";
  clone.style.width = "100%";
  clone.style.margin = "0";
  clone.style.letterSpacing = "normal";
  clone.removeAttribute("id");

  clone.querySelectorAll("*").forEach(node => {
    const htmlEl = node as HTMLElement;
    if (htmlEl.style) {
      htmlEl.style.letterSpacing = "normal";
      if (htmlEl.style.filter && htmlEl.style.filter.includes("drop-shadow")) {
        htmlEl.style.filter = "none";
      }
    }
  });

  tempBox.appendChild(clone);
  document.body.appendChild(tempBox);

  const trueHeight = Math.max(
    tempBox.scrollHeight,
    tempBox.offsetHeight,
    clone.scrollHeight,
    clone.offsetHeight,
    minHeightPx
  );
  tempBox.style.height = `${trueHeight}px`;

  const sectionScale = trueHeight * 2 > 15000 ? Math.max(1, Math.floor(15000 / trueHeight)) : 2;

  try {
    return await html2canvas(tempBox, {
      scale: sectionScale,
      useCORS: true,
      logging: false,
      backgroundColor: "#FFF7ED",
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
      width: 900,
      height: trueHeight,
      windowWidth: 900,
      windowHeight: trueHeight + 600
    });
  } finally {
    if (tempBox.parentElement) {
      document.body.removeChild(tempBox);
    }
  }
}

export interface CaptureSampoorna25Options {
  lang?: SixLang;
  onProgress?: (pct: number, msg: string) => void;
  payload?: SampoornaMaster25Payload;
}

export async function captureSampoornaMaster25Pdf(
  containerEl: HTMLElement,
  fileName: string = "Baggona_Sampoorna_25_Chapter_Master_Report.pdf",
  autoSave: boolean = true,
  options?: CaptureSampoorna25Options
): Promise<jsPDF> {
  const lang = options?.lang || "kn";
  const parentEl = containerEl.parentElement;
  const originalStyle = parentEl?.getAttribute("style") || "";
  const originalIndexPageTexts: Array<{ el: HTMLElement; text: string }> = [];
  const layout = SAMPOORNA25_A4_LAYOUT;

  try {
    if (parentEl) {
      parentEl.setAttribute(
        "style",
        "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFF7ED;"
      );
    }

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 450));

    // Optional native-script running header strip for Pages 2+ (placed outside .pdf-section)
    let runningHeaderChunk: { imgData: string; widthMm: number; heightMm: number } | null = null;
    const runningHeaderEl = containerEl.querySelector("#sampoorna-master-25-running-header") as HTMLElement | null;
    if (runningHeaderEl) {
      const hCanvas = await captureDomElementToCanvas(runningHeaderEl, 24);
      if (hCanvas && hCanvas.width > 0 && hCanvas.height > 0) {
        const naturalH = (hCanvas.height * layout.IMAGE_W_MM) / hCanvas.width;
        const cappedH = Math.min(naturalH, layout.RUNNING_HEADER_MAX_H_MM);
        const ratio = cappedH / naturalH;
        runningHeaderChunk = {
          imgData: hCanvas.toDataURL("image/jpeg", 0.95),
          widthMm: Number((layout.IMAGE_W_MM * ratio).toFixed(3)),
          heightMm: Number(cappedH.toFixed(3)),
        };
        hCanvas.width = 0;
        hCanvas.height = 0;
      }
    }

    // Optional native-script running footer strip (placed outside .pdf-section)
    let runningFooterChunk: { imgData: string; widthMm: number; heightMm: number } | null = null;
    const runningFooterEl = containerEl.querySelector("#sampoorna-master-25-running-footer") as HTMLElement | null;
    if (runningFooterEl) {
      const fCanvas = await captureDomElementToCanvas(runningFooterEl, 24);
      if (fCanvas && fCanvas.width > 0 && fCanvas.height > 0) {
        const naturalFH = (fCanvas.height * layout.IMAGE_W_MM) / fCanvas.width;
        const cappedFH = Math.min(naturalFH, 6.0);
        const fRatio = cappedFH / naturalFH;
        runningFooterChunk = {
          imgData: fCanvas.toDataURL("image/jpeg", 0.95),
          widthMm: Number((layout.IMAGE_W_MM * fRatio).toFixed(3)),
          heightMm: Number(cappedFH.toFixed(3)),
        };
        fCanvas.width = 0;
        fCanvas.height = 0;
      }
    }

    const rawSections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    const sections = rawSections.filter(s => {
      const rect = s.getBoundingClientRect();
      return rect.height > 0 && s.style.display !== "none" && s.style.visibility !== "hidden";
    });

    if (sections.length < 5) {
      throw new Error(`Insufficient sections detected for 25-Chapter PDF (${sections.length} found). Rendering aborted.`);
    }

    const page1UsableH = layout.CONTENT_BOTTOM_MAX_MM - layout.PAGE1_TOP_Y_MM;
    const contUsableH = layout.CONTENT_BOTTOM_MAX_MM - layout.CONT_TOP_Y_MM;
    const renderedSections: RenderedSectionChunkInput[] = [];
    let executiveIndexEl: HTMLElement | null = null;

    for (let i = 0; i < sections.length; i++) {
      const sectionEl = sections[i];
      const sectionName = sectionEl.getAttribute("data-section") || sectionEl.id || `section_${i}`;
      if (sectionName === "executive-index") {
        executiveIndexEl = sectionEl;
      }

      const progressVal = 85 + Math.round(((i + 1) / sections.length) * 12);
      options?.onProgress?.(
        progressVal,
        pick6({
          kn: `ಪುಟ ರಚನೆ (${i + 1}/${sections.length}): ${sectionName}...`,
          mr: `पृष्ठ निर्मिती (${i + 1}/${sections.length}): ${sectionName}...`,
          hi: `पृष्ठ निर्माण (${i + 1}/${sections.length}): ${sectionName}...`,
          te: `పేజీ నిర్మాణం (${i + 1}/${sections.length}): ${sectionName}...`,
          ta: `பக்க உருவாக்கம் (${i + 1}/${sections.length}): ${sectionName}...`,
          en: `Rendering Section (${i + 1}/${sections.length})...`
        }, lang)
      );

      const canvas = await captureDomElementToCanvas(sectionEl, 40);
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const targetMaxH = sectionName === "cover" ? page1UsableH : contUsableH;
      const chunks = sliceCanvasToA4Chunks(canvas, sectionName, targetMaxH, layout.IMAGE_W_MM);
      renderedSections.push(...chunks);
      canvas.width = 0;
      canvas.height = 0;
    }

    const totalPdfHeightMm = renderedSections.reduce((sum, s) => sum + s.heightMm, 0);
    if (totalPdfHeightMm <= 0) {
      throw new Error("Calculated PDF height is zero. Cannot generate empty PDF.");
    }

    let pages = planSampoorna25A4Pages(renderedSections, layout);

    // Pass 2: Synchronize dynamic chapter & section page numbers in the Booklet Index
    let exactSectionPageMap: Record<string, number> = {};
    const indexLinkItems: Array<{
      targetKey: string;
      leftRatio: number;
      topRatio: number;
      rightRatio: number;
      bottomRatio: number;
    }> = [];

    if (executiveIndexEl) {
      const computeSectionPageMap = (planned: PlannedA4Page[]) => {
        const map: Record<string, number> = {};
        for (const p of planned) {
          for (const s of p.sections) {
            if (!(s.name in map)) {
              map[s.name] = p.pageNumber;
            }
          }
        }
        return map;
      };

      exactSectionPageMap = computeSectionPageMap(pages);

      const badgeEls = Array.from(executiveIndexEl.querySelectorAll("[data-index-page-for]")) as HTMLElement[];
      let indexUpdated = false;
      for (const badgeEl of badgeEls) {
        const targetKey = badgeEl.getAttribute("data-index-page-for") || "";
        const actualPage = exactSectionPageMap[targetKey];
        if (typeof actualPage === "number" && actualPage > 0) {
          const localizedLabel = formatPageTag6L(actualPage, lang);
          if ((badgeEl.textContent || "").trim() !== localizedLabel) {
            originalIndexPageTexts.push({ el: badgeEl, text: badgeEl.textContent || "" });
            badgeEl.textContent = localizedLabel;
            indexUpdated = true;
          }
        }
      }

      if (indexUpdated) {
        const idxCanvas = await captureDomElementToCanvas(executiveIndexEl, 40);
        if (idxCanvas && idxCanvas.width > 0 && idxCanvas.height > 0) {
          const updatedIdxChunks = sliceCanvasToA4Chunks(idxCanvas, "executive-index", contUsableH, layout.IMAGE_W_MM);
          idxCanvas.width = 0;
          idxCanvas.height = 0;
          const firstIdxPos = renderedSections.findIndex((s) => s.name === "executive-index");
          if (firstIdxPos >= 0) {
            const withoutOldIndex = renderedSections.filter((s) => s.name !== "executive-index");
            withoutOldIndex.splice(firstIdxPos, 0, ...updatedIdxChunks);
            renderedSections.splice(0, renderedSections.length, ...withoutOldIndex);
            pages = planSampoorna25A4Pages(renderedSections, layout);
            exactSectionPageMap = computeSectionPageMap(pages);
          }
        }
      }

      // Record normalized coordinates for every clickable Index row so we can bind PDF internal hyperlinks
      const idxRect = executiveIndexEl.getBoundingClientRect();
      const idxW = Math.max(1, idxRect.width || 900);
      const idxH = Math.max(1, idxRect.height || executiveIndexEl.scrollHeight);
      const rowEls = Array.from(executiveIndexEl.querySelectorAll("[data-index-link-target]")) as HTMLElement[];
      for (const rowEl of rowEls) {
        const targetKey = rowEl.getAttribute("data-index-link-target") || "";
        const rRect = rowEl.getBoundingClientRect();
        if (targetKey && rRect.height > 0) {
          indexLinkItems.push({
            targetKey,
            leftRatio: Math.max(0, (rRect.left - idxRect.left) / idxW),
            topRatio: Math.max(0, (rRect.top - idxRect.top) / idxH),
            rightRatio: Math.min(1, (rRect.right - idxRect.left) / idxW),
            bottomRatio: Math.min(1, (rRect.bottom - idxRect.top) / idxH),
          });
        }
      }
    }
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [layout.A4_WIDTH_MM, layout.A4_HEIGHT_MM],
      compress: true
    });

    const totalPages = pages.length;
    const indexPlacements: Array<{
      pdfPage: number;
      x: number;
      y: number;
      w: number;
      h: number;
      sourceTopRatio: number;
      sourceBottomRatio: number;
    }> = [];

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      if (pIdx > 0) {
        pdf.addPage([layout.A4_WIDTH_MM, layout.A4_HEIGHT_MM], "p");
      }

      // 1. Royal Warm Ivory Background (#FFF7ED)
      pdf.setFillColor(255, 247, 237);
      pdf.rect(0, 0, layout.A4_WIDTH_MM, layout.A4_HEIGHT_MM, "F");

      // 2. Running Header Strip on Pages 2+ (positioned cleanly below inner top border)
      if (pIdx > 0) {
        if (runningHeaderChunk) {
          const hx = layout.IMAGE_X_MM + (layout.IMAGE_W_MM - runningHeaderChunk.widthMm) / 2;
          pdf.addImage(
            runningHeaderChunk.imgData,
            "JPEG",
            hx,
            layout.RUNNING_HEADER_Y_MM,
            runningHeaderChunk.widthMm,
            runningHeaderChunk.heightMm,
            undefined,
            "FAST"
          );
        } else if (lang === "en") {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          pdf.setTextColor(146, 64, 14);
          pdf.text("BAGGONA PANCHANGA  *  SAMPOORNA 25-CHAPTER FOLIO", layout.A4_WIDTH_MM / 2, 13.5, { align: "center" });
        }
        pdf.setDrawColor(217, 119, 6);
        pdf.setLineWidth(0.22);
        pdf.line(layout.IMAGE_X_MM, 17.4, layout.IMAGE_X_MM + layout.IMAGE_W_MM, 17.4);
      }

      // 3. Section Images (Strictly bounded inside [IMAGE_X_MM, IMAGE_X_MM + IMAGE_W_MM] & <= CONTENT_BOTTOM_MAX_MM)
      const topY: number = pIdx === 0 ? layout.PAGE1_TOP_Y_MM : layout.CONT_TOP_Y_MM;
      let currentY: number = topY;

      for (const sec of page.sections) {
        pdf.addImage(sec.imgData, "JPEG", sec.renderXMm, currentY, sec.renderWidthMm, sec.renderHeightMm, undefined, "FAST");
        if (sec.name === "executive-index") {
          indexPlacements.push({
            pdfPage: pIdx + 1,
            x: sec.renderXMm,
            y: currentY,
            w: sec.renderWidthMm,
            h: sec.renderHeightMm,
            sourceTopRatio: sec.sourceTopRatio ?? 0,
            sourceBottomRatio: sec.sourceBottomRatio ?? 1,
          });
        }
        currentY += sec.renderHeightMm;
      }

      // 4. Running Footer strictly INSIDE the inner gold frame (< 289.2mm)
      pdf.setDrawColor(217, 119, 6);
      pdf.setLineWidth(0.22);
      pdf.line(11, layout.FOOTER_LINE_Y_MM, layout.A4_WIDTH_MM - 11, layout.FOOTER_LINE_Y_MM);

      if (runningFooterChunk) {
        pdf.addImage(
          runningFooterChunk.imgData,
          "JPEG",
          layout.IMAGE_X_MM,
          282.1,
          runningFooterChunk.widthMm,
          runningFooterChunk.heightMm,
          undefined,
          "FAST"
        );
      } else if (lang === "en") {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(146, 64, 14);
        pdf.text("BAGGONA PANCHANGA  *  SRI KSHETRA GOKARNA", 12, layout.FOOTER_TEXT_Y_MM);
      }

      const footerPageText = `${formatPageTag6L(pIdx + 1, lang)} / ${toNativeDigits(totalPages, lang)}`;
      const pageTagImg = renderNativePageTagImage(footerPageText, lang);
      if (pageTagImg) {
        const tagX = layout.A4_WIDTH_MM - 11.5 - pageTagImg.widthMm;
        pdf.addImage(pageTagImg.imgData, "JPEG", tagX, 282.3, pageTagImg.widthMm, pageTagImg.heightMm, undefined, "FAST");
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        pdf.setTextColor(120, 53, 15);
        const asciiFallback = lang === "en" ? `Page ${pIdx + 1} / ${totalPages}` : `${pIdx + 1} / ${totalPages}`;
        pdf.text(asciiFallback, layout.A4_WIDTH_MM - 12, layout.FOOTER_TEXT_Y_MM, { align: "right" });
      }

      // 5. Clean Gold Page Frame drawn LAST on top so edges remain unbroken and uncluttered
      const ob = layout.OUTER_BORDER_INSET_MM;
      const ib = layout.INNER_BORDER_INSET_MM;
      pdf.setDrawColor(180, 83, 9); // amber-700
      pdf.setLineWidth(0.45);
      pdf.rect(ob, ob, layout.A4_WIDTH_MM - ob * 2, layout.A4_HEIGHT_MM - ob * 2);

      pdf.setDrawColor(232, 190, 128); // subtle warm gold hairline
      pdf.setLineWidth(0.15);
      pdf.rect(ib, ib, layout.A4_WIDTH_MM - ib * 2, layout.A4_HEIGHT_MM - ib * 2);
    }

    // Bind interactive PDF hyperlinks for every chapter/section row in the Table of Contents
    for (const placement of indexPlacements) {
      const span = Math.max(0.001, placement.sourceBottomRatio - placement.sourceTopRatio);
      for (const item of indexLinkItems) {
        const targetPage = exactSectionPageMap[item.targetKey];
        if (!targetPage || targetPage < 1 || targetPage > totalPages) continue;
        if (item.bottomRatio <= placement.sourceTopRatio || item.topRatio >= placement.sourceBottomRatio) {
          continue;
        }
        const clippedTop = Math.max(placement.sourceTopRatio, item.topRatio);
        const clippedBot = Math.min(placement.sourceBottomRatio, item.bottomRatio);
        const relTop = (clippedTop - placement.sourceTopRatio) / span;
        const relBot = (clippedBot - placement.sourceTopRatio) / span;
        const linkX = placement.x + item.leftRatio * placement.w;
        const linkY = placement.y + relTop * placement.h;
        const linkW = Math.max(10, (item.rightRatio - item.leftRatio) * placement.w);
        const linkH = Math.max(2, (relBot - relTop) * placement.h);
        pdf.setPage(placement.pdfPage);
        pdf.link(linkX, linkY, linkW, linkH, { pageNumber: targetPage });
      }
    }

    if (autoSave) {
      savePdfBlob(pdf, fileName);
    }

    return pdf;
  } finally {
    for (const item of originalIndexPageTexts) {
      item.el.textContent = item.text;
    }
    if (parentEl) {
      parentEl.setAttribute("style", originalStyle);
    }
  }
}
