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
import {
  type SevenLang,
  normalizeSevenLang,
  pick7,
  toNativeDigits7L,
  RASHI_7L,
  GRAHA_7L,
  NAKSHATRA_7L,
  WEEKDAY_7L,
  ELEMENT_NAMES_7L,
  YOGA_LABELS_7L,
  YOGI_ATTRIBUTES_ML,
  resolveMlPanchangaTerms,
  resolveMrTithiName,
  resolveDoshaName7L,
  getIndicFontFamily7L,
} from "./sampoornaMaster25Locale7L";
export type { SevenLang };
export { normalizeSevenLang };
import {
  generateSampoorna25AiNarratives,
  type SampoornaAiGenerationResult,
} from "./sampoornaMaster25AiEngine";
import { isTestEnvironment } from "../utils/testEnvGuard";
import { useAppStore } from "../stores/appStore";
import { ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { calculateComprehensiveDoshas, type DetectedDosha } from "../core/ComprehensiveDoshaEngine";
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
  computeExtendedPrecisionMetrics,
  formatPageTag6L,
  extractShortPlaceDisplayName,
  resolvePlaceDisplayName,
  type BookletCoverContent,
  type ExtendedPrecisionMetrics
} from "./sampoornaMaster25BookletEngine";
import {
  buildDynamicBookletCover,
  buildConsolidatedDoshaProfiles,
  computeChartVisualMetrics,
  buildDynamicStoryChapters,
  type ChapterVisualType,
  type ChapterVisualSummary,
  type ActiveDoshaProfile,
  type ChartVisualMetrics,
  type StoryEngineInput
} from "./sampoornaMaster25StoryEngine";

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
  promptEyebrow?: string;
  promptLabel?: string;
  storyHook?: string;
  paragraphs: string[];
  precisionAnchors?: string[];
  guidanceBadge?: string;
  practicalGuidance?: string;
  visualType?: ChapterVisualType;
  visualSummary?: ChapterVisualSummary;
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
  targetLanguage: SevenLang;

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
  activeDoshaProfiles?: ActiveDoshaProfile[];
  chartVisualMetrics?: ChartVisualMetrics;
  lagnaRashiIdx?: number;
  moonRashiIdx?: number;
  rawMahadashaPlanet?: string;
  rawBhuktiPlanet?: string;
  heroSummary?: {
    heroPlanetName: string;
    heroPlanetHouse: number;
    heroPlanetRashi: string;
    nearestColleagueName: string;
    nearestColleagueHouse: number;
    nearestColleagueRashi: string;
  };
  initialChapterPages: Record<number, number>;
  initialCalendarQrPage: number;
  initialFinalBlessingPage: number;

  // 25 Chapters
  chapters: Master25Chapter[];
  narrativeVariant?: number;
  isAiGenerated?: boolean;
  aiRunId?: string;
  aiChaptersCount?: number;
  timePrecision?: "exact" | "approx_window" | "date_only_chandra" | "no_dob_instant";
  precisionBadgeText?: string;
  sankhyaSummary?: string;
  laterTimeUpdateUrl?: string;

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

function cleanRegionalPreserveBullets(text: string, lang: SevenLang): string {
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

export function toNativeDigits(num: number | string, lang: SevenLang): string {
  return toNativeDigits7L(num, lang);
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

export const MAANDI_DOMAIN_MAP: Record<number, Record<SevenLang, string>> = {
  1: {
    kn: "ವ್ಯಕ್ತಿತ್ವ, ಆತ್ಮಾಭಿಮಾನ ಹಾಗೂ ನಾಯಕತ್ವದ ನಿರ್ಧಾರಗಳು",
    hi: "व्यक्तित्व, आत्मसम्मान एवं नेतृत्व के निर्णय",
    mr: "व्यक्तिमत्त्व, आत्मसन्मान व नेतृत्वाचे निर्णय",
    te: "వ్యక్తిత్వం, ఆత్మగౌరవం మరియు నాయకత్వ నిర్ణయాలు",
    ta: "சுயமரியாதை, தலைமைத்துவம் மற்றும் ஆளுமை முடிவுகள்",
    ml: "വ്യക്തിത്വം, ആത്മാഭിമാനം, നേതൃത്വ തീരുമാനങ്ങൾ",
    en: "Personal identity, self-worth, and leadership initiatives"
  },
  2: {
    kn: "ಧನ ಸಂಚಯ, ಉಳಿತಾಯ ಹಾಗೂ ವಾಣಿಜ್ಯ ಲಾಭ",
    hi: "धन संचय, बचत एवं वित्तीय लाभ",
    mr: "धन संचय, बचत व आर्थिक नफा",
    te: "ధన సంచయం, పొదుపు మరియు ఆర్థిక లాభం",
    ta: "தன சேமிப்பு, குடும்ப நிதி மற்றும் வியாபார லாபம்",
    ml: "ധനസമ്പാദനം, സമ്പാദ്യം, കുടുംബ സാമ്പത്തിക സ്ഥിരത",
    en: "Wealth accumulation, savings, and financial stability"
  },
  3: {
    kn: "ಸಹೋದರರ ಸಹಕಾರ, ಧೈರ್ಯ ಹಾಗೂ ಹೊಸ ಉದ್ಯಮ ಸಾಹಸಗಳು",
    hi: "भाई-बहनों का सहयोग, पराक्रम एवं नए व्यावसायिक प्रयास",
    mr: "भावंडांचे सहकार्य, धैर्य व नवीन उपक्रम",
    te: "సోదరుల సహకారం, ధైర్యం మరియు నూతన ప్రయత్నాలు",
    ta: "சகோதரர் ஆதரவு, தைரியம் மற்றும் புதிய முயற்சிகள்",
    ml: "സഹോദര സഹകരണം, ധൈര്യം, പുതിയ പരിശ്രമങ്ങൾ",
    en: "Sibling cooperation, initiatives, and courage"
  },
  4: {
    kn: "ಗೃಹ ಶಾಂತಿ, ವಾಹನ ಸುಖ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ",
    hi: "गृह शांति, वाहन सुख एवं अचल संपत्ति क्रय",
    mr: "गृह शांती, वाहन सुख व स्थावर मालमत्ता खरेदी",
    te: "గృహ శాంతి, వాహన సౌఖ్యం మరియు స్థిరాస్తి",
    ta: "வீட்டு அமைதி, வாகனம் மற்றும் நில சொத்துக்கள்",
    ml: "ഗൃഹസമാധാനം, വാഹന സൗഖ്യം, ഭൂമി-വസ്തു നേട്ടങ്ങൾ",
    en: "Domestic peace, vehicle happiness, and property acquisitions"
  },
  5: {
    kn: "ಉನ್ನತ ಶಿಕ್ಷಣ, ಸೃಜನಶೀಲತೆ ಹಾಗೂ ಸಂತಾನ ಭಾಗ್ಯ",
    hi: "उच्च शिक्षा, बौद्धिक क्षमता एवं संतान सुख",
    mr: "उच्च शिक्षण, बुद्धिमत्ता व संतती सुख",
    te: "ఉన్నత విద్య, సృజనాత్మకత మరియు సంతాన భాగ్యం",
    ta: "உயர் கல்வி, புத்திசாலித்தனம் மற்றும் சந்தான யோகம்",
    ml: "ഉന്നത വിദ്യാഭ്യാസം, ബുദ്ധിശക്തി, സന്താന സൗഭാഗ്യം",
    en: "Higher learning, intellect, and progeny/creative output"
  },
  6: {
    kn: "ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧೆ ನಿಗ್ರಹ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ",
    hi: "ऋण मुक्ति, शत्रु दमन एवं प्रतियोगी परीक्षाओं में विजय",
    mr: "कर्जमुक्ती, शत्रू नियंत्रण व स्पर्धात्मक यश",
    te: "ఋణ విముక్తి, శత్రు నివారణ మరియు విజయాలు",
    ta: "கடன் நிவர்த்தி, எதிரிகள் வெற்றி மற்றும் வழக்குகள்",
    ml: "കടബാധ്യതാ നിവാരണം, പ്രതിബന്ധ വിജയം, ആരോഗ്യ രക്ഷ",
    en: "Debt clearance, overcoming opposition, and victory in competitions"
  },
  7: {
    kn: "ವೈವಾಹಿಕ ಸೌಹಾರ್ದತೆ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಬಂಧಗಳು",
    hi: "वैवाहिक सद्भाव, व्यापारिक साझेदारी एवं जनसंपर्क",
    mr: "वैवाहिक सलोखा, भागीदारी व सार्वजनिक संबंध",
    te: "వైవాహిక సామరస్యం, వ్యాపార భాగస్వామ్యం మరియు సంబంధాలు",
    ta: "திருமண ஒற்றுமை, கூட்டு தொழில் மற்றும் பொதுத் தொடர்பு",
    ml: "ദാമ്പത്യ ഐക്യം, വ്യാപാര പങ്കാളിത്തം, സാമൂഹിക ബന്ധങ്ങൾ",
    en: "Marital harmony, business partnerships, and contracts"
  },
  8: {
    kn: "ಆಕಸ್ಮಿಕ ಅಡೆತಡೆಗಳು, ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಹಾಗೂ ಆಂತರಿಕ ಆತಂಕ",
    hi: "अचानक बाधाएं, पैतृक संपत्ति एवं मानसिक उद्वेग",
    mr: "अचानक येणारे अडथळे, वडिलोपार्जित संपत्ती व मानसिक ताण",
    te: "ఆకస్మిక అడ్డంకులు, పూర్వీకుల ఆస్తి మరియు ఆందోళన",
    ta: "திடீர் தடைகள், பூர்வீக சொத்து மற்றும் மன அழுத்தம்",
    ml: "അപ്രതീക്ഷിത തടസ്സങ്ങൾ, പൂർവ്വിക സ്വത്ത്, മാനസിക ജാഗ്രത",
    en: "Sudden obstacles, legacy clearances, and anxiety resolution"
  },
  9: {
    kn: "ಭಾಗ್ಯೋದಯ, ತೀರ್ಥಯಾತ್ರೆ ಹಾಗೂ ಉನ್ನತ ಗುರುಗಳ ಅನುಗ್ರಹ",
    hi: "भाग्योदय, तीर्थयात्रा एवं गुरु कृपा प्राप्ति",
    mr: "भाग्योदय, तीर्थयात्रा व गुरुंची कृपा",
    te: "భాగ్యోదయం, తీర్థయాత్రలు మరియు గురు అనుగ్రహం",
    ta: "பாக்கிய விருத்தி, புண்ணிய ஸ்தல யாத்திரை மற்றும் குரு அருள்",
    ml: "ഭാഗ്യോദയം, തീർത്ഥയാത്ര, ആത്മീയ ഗുരുകൃപ",
    en: "Fortune fruition, higher wisdom, pilgrimages, and spiritual mentor blessings"
  },
  10: {
    kn: "ವೃತ್ತಿ ಗೌರವ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೀರ್ತಿ ಪ್ರತಿಷ್ಠೆ",
    hi: "कार्यक्षेत्र में सम्मान, पदोन्नति एवं सामाजिक प्रतिष्ठा",
    mr: "कामाच्या ठिकाणी मान, पदोन्नती व सामाजिक प्रतिष्ठा",
    te: "వృత్తి గౌరవం, పదోన్నతి మరియు సామాజిక కీర్తి",
    ta: "தொழில் வெற்றி, பதவி உயர்வு மற்றும் சமூக அந்தஸ்து",
    ml: "തൊഴിൽ അംഗീകാരം, ഉത്തരവാദിത്ത ഉയർച്ച, സാമൂഹിക മാന്യത",
    en: "Professional prestige, authority, promotions, and career recognition"
  },
  11: {
    kn: "ಆರ್ಥಿಕ ಆದಾಯದ ಹರಿವು, ಮಿತ್ರರ ನೆರವು ಹಾಗೂ ಆಕಾಂಕ್ಷೆಗಳ ಸಿದ್ಧಿ",
    hi: "नियमित धन लाभ, मित्रों का सहयोग एवं महत्वाकांक्षाओं की पूर्ति",
    mr: "नियमित धनलाभ, मित्रांचे सहकार्य व इच्छापूर्ती",
    te: "లాభాలు, స్నేహితుల సహకారం మరియు ఆశయాల సాధన",
    ta: "வருமான பெருக்கம், நண்பர்கள் ஆதரவு மற்றும் இலக்குகள் நிறைவேறுதல்",
    ml: "സ്ഥിരമായ വരുമാന പ്രവാഹം, സുഹൃദ് സഹായം, അഭീഷ്ടസിദ്ധി",
    en: "Liquid cash flow, network gains, and aspiration fulfillment"
  },
  12: {
    kn: "ಅನಗತ್ಯ ಖರ್ಚು ನಿಯಂತ್ರಣ, ವಿದೇಶ ವ್ಯವಹಾರ ಹಾಗೂ ಗಾಢ ನಿದ್ರಾಸುಖ",
    hi: "अनावश्यक व्यय नियंत्रण, विदेश यात्रा एवं शांत निद्रा",
    mr: "अनावश्यक खर्च नियंत्रण, परदेश प्रवास व शांत झोप",
    te: "అనవసర ఖర్చుల నియంత్రణ, విదేశీ ప్రయాణం మరియు నిద్ర సుఖం",
    ta: "விரய செலவு கட்டுப்பாடு, வெளிநாட்டு யோகம் மற்றும் நிம்மதியான தூக்கம்",
    ml: "ചെലവ് നിയന്ത്രണം, വിദേശ അവസരങ്ങൾ, ശാന്തമായ നിദ്രാസുഖം",
    en: "Expenditure control, foreign opportunities, and restorative peace"
  }
};

// ============================================================================
// 3. MASTER DATA PREPARATION PIPELINE
// ============================================================================

const NARRATIVE_EDITION_MEMORY = new Map<string, number>();

function resolveNextNarrativeEdition(personKey: string, explicitVariant?: number): number {
  if (typeof explicitVariant === "number" && Number.isFinite(explicitVariant)) {
    return Math.max(0, Math.floor(explicitVariant));
  }
  let current = NARRATIVE_EDITION_MEMORY.get(personKey) ?? -1;
  if (current < 0) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = window.localStorage.getItem(`bp_m25_ed_${personKey}`);
        if (stored !== null && /^\d+$/.test(stored)) {
          current = parseInt(stored, 10);
        }
      }
    } catch {
      // Storage blocked in headless/sandbox environments
    }
  }
  const next = current >= 0 ? (current + 1) % 4 : 0;
  NARRATIVE_EDITION_MEMORY.set(personKey, next);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`bp_m25_ed_${personKey}`, String(next));
    }
  } catch {
    // Ignore persistence write failures
  }
  return next;
}

export async function prepareSampoornaMaster25Data(
  sessionOrData: any,
  langArg?: SevenLang | string,
  options?: {
    onProgress?: (pct: number, msg: string) => void;
    narrativeVariant?: number;
    enableAi?: boolean;
    geminiApiKey?: string;
    timePrecision?: "exact" | "approx_window" | "date_only_chandra" | "no_dob_instant";
    resolvedBtrSummary?: string;
    sankhyaSummary?: string;
    laterTimeUpdateUrl?: string;
  }
): Promise<SampoornaMaster25Payload> {
  const timePrecision = options?.timePrecision || "exact";
  const isChandraBasisOnly = timePrecision === "date_only_chandra" || timePrecision === "no_dob_instant";
  const targetLang: SevenLang = normalizeSevenLang(langArg || (sessionOrData?.targetLanguage as string) || "kn");
  options?.onProgress?.(10, pick7({
    kn: "೧. ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ಜಾತಕ ಗಣಿತ ಪರಿಶೀಲನೆ...",
    mr: "१. जन्म कुंडली व गणितीय पडताळणी...",
    hi: "१. जन्म कुंडली एवं गणितीय सत्यापन...",
    te: "1. జన్మ కుండలి మరియు గణిత పరిశీలన...",
    ta: "1. ஜாதக கணித சரிபார்ப்பு...",
    ml: "1. ജന്മകുണ്ഡലിയും ജ്യോതിഷ ഗണിതവും പരിശോധിക്കുന്നു...",
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
    ? pick7({ kn: "ಉ", mr: "उ", hi: "उ", te: "ఉ", ta: "வ", ml: "വ", en: "N" }, targetLang)
    : pick7({ kn: "ದ", mr: "द", hi: "द", te: "ద", ta: "தெ", ml: "തെ", en: "S" }, targetLang);
  const ewDir = lng >= 0
    ? pick7({ kn: "ಪೂ", mr: "पू", hi: "पू", te: "తూ", ta: "கி", ml: "കി", en: "E" }, targetLang)
    : pick7({ kn: "ಪ", mr: "प", hi: "प", te: "ప", ta: "மே", ml: "പ", en: "W" }, targetLang);
  const birthPlace = rawPlace
    ? resolvePlaceDisplayName(String(rawPlace), targetLang)
    : input?.latitude
      ? `${toNativeDigits(Math.abs(lat).toFixed(2), targetLang)}°${nsDir}, ${toNativeDigits(Math.abs(lng).toFixed(2), targetLang)}°${ewDir}`
      : pick7({
        kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
        mr: "श्री क्षेत्र गोकर्ण",
        hi: "श्री क्षेत्र गोकर्ण",
        te: "శ్రీ క్షేత్ర గోకర్ణ",
        ta: "ஸ்ரீ கோகர்ண க்ஷேத்திரம்",
        ml: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
        en: "Sri Kshetra Gokarna"
      }, targetLang);
  const birthPlaceShort = rawPlace ? (extractShortPlaceDisplayName(String(rawPlace), targetLang) || birthPlace) : birthPlace;

  const cleanRegionalLabel = (val: string): string => cleanRegionalPreserveBullets(val, targetLang);
  const gender: "male" | "female" = (input?.gender?.toLowerCase() === "female") ? "female" : "male";
  const hasExplicitMarital = Boolean(input?.maritalStatus && String(input.maritalStatus).trim() !== "");
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
  const maritalContext: "married" | "unmarried" | "unspecified" = hasExplicitMarital
    ? (String(maritalStatus).toLowerCase() === "married" ? "married" : "unmarried")
    : ageDecimal < 24
      ? "unmarried"
      : "unspecified";
  const normNameKey = String(rawName || "devotee").trim().toLowerCase().replace(/\s+/g, "_").slice(0, 28);
  const personEditionKey = `${birthDate}|${birthTime}|${lat.toFixed(2)}|${lng.toFixed(2)}|${normNameKey}|${targetLang}`;
  const narrativeVariant = resolveNextNarrativeEdition(personEditionKey, options?.narrativeVariant);

  options?.onProgress?.(25, pick7({
    kn: "೨. ದಕ್ಷಿಣ ಭಾರತದ ರಹಸ್ಯ ಗಣಿತ (ಯೋಗಿ, ಅವಯೋಗಿ, ಬೃಗು ಬಿಂದು, ಮಾಂದಿ)...",
    mr: "२. गुप्त अचूक गणित (योगी, अवयोगी, भृगु बिंदू, मांदी)...",
    hi: "२. दक्षिण भारतीय रहस्य गणित (योगी, अवयोगी, भृगु बिंदु, मांदी)...",
    te: "2. రహస్య జ్యోతిష గణితం (యోగి, అవయోగి, భృగు బిందువు, మాంది)...",
    ta: "2. ரகசிய கணிதம் (யோகி, அவயோகி, பிருகு பிந்து, மாந்தி)...",
    ml: "2. രഹസ്യ ജ്യോതിഷ ഗണിതം (യോഗി, അവയോഗി, ഭൃഗു ബിന്ദു, മാന്ദി)...",
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

  const moonRashiIdx = (((result.moonSign?.index ?? 0) % 12) + 12) % 12 as RashiIndex;
  const rawLagnaRashiIdx = (((result.lagnaRashi?.index ?? 0) % 12) + 12) % 12 as RashiIndex;
  // When time is unknown (date_only_chandra), mathematically anchor Bhavas to Chandra Lagna rather than fake noon Lagna
  const lagnaRashiIdx = (isChandraBasisOnly ? moonRashiIdx : rawLagnaRashiIdx) as RashiIndex;

  const sunLon = (sunP.rashi.index * 30) + (((sunP.degree || 0) % 30 + 30) % 30);
  const moonLon = (moonP.rashi.index * 30) + (((moonP.degree || 0) % 30 + 30) % 30);
  const rahuLon = (rahuP.rashi.index * 30) + (((rahuP.degree || 0) % 30 + 30) % 30);

  // Compute Maandi
  const maandiCalc = computeMaandi(birthDt, lat, lng, pin);
  const maandiRashiIdx = (((maandiCalc.rashi.index % 12) + 12) % 12) as RashiIndex;
  const maandiHouse = (((maandiRashiIdx - lagnaRashiIdx + 12) % 12) + 1);
  const maandiRashiName = RASHI_7L[maandiRashiIdx]?.[targetLang] || RASHI_7L[0].en;

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
  const lagnaLord = GRAHA_7L[lagnaLordGraha]?.[targetLang] || lagnaLordGraha;
  const moonLord = GRAHA_7L[moonLordGraha]?.[targetLang] || moonLordGraha;

  // 6-Anga Complete Natal Panchanga Elements
  const traditional = calculateTraditionalBaggona(birthDate, birthTime, lat, lng, "lahiri", pin);
  const mlPanchanga = targetLang === "ml"
    ? resolveMlPanchangaTerms(traditional)
    : null;

  const pakshaName =
    targetLang === "kn"
      ? (traditional?.pakshaKn || "ಶುಕ್ಲ")
      : targetLang === "ml"
        ? mlPanchanga!.pakshaMl
        : targetLang === "mr"
          ? (traditional?.paksha5L?.hi || "शुक्ल")
          : (traditional?.paksha5L?.[targetLang] || traditional?.paksha || "Shukla");

  const rawTithiName =
    targetLang === "kn"
      ? (traditional?.tithiKn || traditional?.tithi || "ಪ್ರತಿಪದೆ")
      : targetLang === "ml"
        ? mlPanchanga!.tithiMl
        : targetLang === "mr"
          ? resolveMrTithiName(traditional)
          : (traditional?.tithi5L?.[targetLang] || (targetLang === "en" ? traditional?.tithi : traditional?.tithiKn) || "Pratipada");

  const isPurnimaOrAmavasya = /purnima|amavasya|ಹುಣ್ಣಿಮೆ|ಅಮಾವಾಸ್ಯೆ|पूर्णिमा|अमावस्या|పౌర్ణమి|అమావాస్య|பௌர்ணமி|அமாவாசை|പൗർണ്ണമി|അമാവാസി/i.test(rawTithiName);
  const cleanedRawTithi = rawTithiName.replace(new RegExp(`^(?:${pakshaName}\\s+)+`, "u"), "").trim() || rawTithiName.trim();
  const tithiName = (!isPurnimaOrAmavasya && !cleanedRawTithi.includes(pakshaName))
    ? `${pakshaName} ${cleanedRawTithi}`
    : cleanedRawTithi;

  const moonPlanet = result.planets.find(p => p.name === PlanetName.Moon);
  const moonNakIdx = moonPlanet?.nakshatra?.index ?? (result.moonSign ? Math.floor(((result.moonSign.index * 30) + (moonPlanet?.degree ?? 0)) / 13.333333) % 27 : 0);
  const nakshatraName = NAKSHATRA_7L[moonNakIdx]?.[targetLang] || NAKSHATRA_7L[moonNakIdx]?.en || "Rohini";
  const nakshatraPada = result.moonPada || 1;

  const yogaName =
    targetLang === "kn"
      ? (traditional?.yogaKn || traditional?.yoga || "ಸಿದ್ಧಿ")
      : targetLang === "ml"
        ? mlPanchanga!.yogaMl
        : targetLang === "mr"
          ? (traditional?.yoga5L?.hi || traditional?.yoga || "सिद्धि")
          : (traditional?.yoga5L?.[targetLang] || traditional?.yoga || "Siddha");

  const karanaName =
    targetLang === "kn"
      ? (traditional?.karanaKn || traditional?.karana || "ಬವ")
      : targetLang === "ml"
        ? mlPanchanga!.karanaMl
        : targetLang === "mr"
          ? (traditional?.karana5L?.hi || traditional?.karana || "बव")
          : (traditional?.karana5L?.[targetLang] || traditional?.karana || "Bava");

  const weekdayIdx = typeof traditional?.weekdayIndex === "number" ? traditional.weekdayIndex : (isNaN(birthDt.getDay()) ? 0 : birthDt.getDay());
  const weekdayName = WEEKDAY_7L[weekdayIdx]?.[targetLang] || WEEKDAY_7L[weekdayIdx]?.en || "Sunday";

  // Authentic Sunrise/Sunset Janma Hora (Birth Hora)
  let birthHoraRaw = traditional?.horaLord || "";
  if (!birthHoraRaw) {
    const [bH, bM] = birthTime.split(":").map(Number);
    const hoursFrom6Am = Math.floor((((bH || 12) + (bM || 0) / 60) - 6 + 24) % 24);
    birthHoraRaw = CHALDEAN_HORA_ORDER[(DAY_RULER_CHALDEAN_IDX[weekdayIdx % 7] + hoursFrom6Am) % 7] || "Sun";
  }
  const janmaHora = GRAHA_7L[birthHoraRaw]?.[targetLang] || birthHoraRaw;
  const horaLordName = janmaHora;
  const sunriseTimeRaw = traditional?.sunrise || "06:15";
  const [srH, srM] = sunriseTimeRaw.split(":").map((x) => parseInt(x, 10));
  const sunriseHourDecimal = Number.isFinite(srH) ? srH + (Number.isFinite(srM) ? srM : 0) / 60 : 6.25;
  const nowHourDecimal = now.getHours() + now.getMinutes() / 60;
  const currentWeekday = now.getDay();
  const hoursSinceSunrise = Math.floor((nowHourDecimal - sunriseHourDecimal + 24) % 24);
  const liveHoraPlanetRaw = CHALDEAN_HORA_ORDER[(DAY_RULER_CHALDEAN_IDX[currentWeekday] + hoursSinceSunrise) % 7];
  const livePrashnaHora = GRAHA_7L[liveHoraPlanetRaw]?.[targetLang] || liveHoraPlanetRaw;

  const sunriseTime = toNativeDigits(sunriseTimeRaw, targetLang);
  const sunsetTime = toNativeDigits(traditional?.sunset || "18:20", targetLang);

  const ayanamshaName = pick7({
    kn: "ಲಾಹಿರಿ (ಚಿತ್ರಾಪಕ್ಷ)",
    mr: "लाहिरी (चित्रापक्ष)",
    hi: "लाहिड़ी (चित्रापक्ष)",
    te: "లాహిరి (చిత్రాపక్ష)",
    ta: "லாகிரி (சித்ராபக்ஷம்)",
    ml: "ലാഹിരി (ചിത്രപക്ഷം)",
    en: "Lahiri (Chitrapaksha)"
  }, targetLang);

  // Birth Dasha Balance
  const dashaBalLord = GRAHA_7L[traditional?.dashaLord || "Jupiter"]?.[targetLang] || (traditional?.dashaLord || "Jupiter");
  const dYears = toNativeDigits(traditional?.dashaYears ?? 5, targetLang);
  const dMonths = toNativeDigits(traditional?.dashaMonths ?? 0, targetLang);
  const janmaDashaBalance = pick7({
    kn: `${dashaBalLord} (${dYears} ವರ್ಷ ${dMonths} ತಿಂಗಳು)`,
    mr: `${dashaBalLord} (${dYears} वर्षे ${dMonths} महिने)`,
    hi: `${dashaBalLord} (${dYears} वर्ष ${dMonths} माह)`,
    te: `${dashaBalLord} (${dYears} సం॥ ${dMonths} నె॥)`,
    ta: `${dashaBalLord} (${dYears} ஆண். ${dMonths} மா.)`,
    ml: `${dashaBalLord} (${dYears} വർഷം ${dMonths} മാസം)`,
    en: `${dashaBalLord} (${dYears} Yrs ${dMonths} Mos)`
  }, targetLang);

  // Dasha-Bhukti
  const bhuktiInfo = findBhuktiAtAge(result, ageDecimal);
  const rawMaha = String(bhuktiInfo?.maha?.planet || "Jupiter");
  const rawBhukti = String(bhuktiInfo?.bhukti || "Saturn");
  const currentMahadasha = GRAHA_7L[rawMaha]?.[targetLang] || rawMaha;
  const currentBhuktiLord = GRAHA_7L[rawBhukti]?.[targetLang] || rawBhukti;
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
  const shaniTransitRashi = RASHI_7L[shaniTransitRashiIdx]?.[targetLang] || "Pisces";
  const guruTransitRashi = RASHI_7L[guruTransitRashiIdx]?.[targetLang] || "Gemini";

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
  const dominantElement = `${ELEMENT_NAMES_7L[primaryElem][targetLang]} + ${ELEMENT_NAMES_7L[secondaryElem][targetLang]}`;

  // Authentic Natal Yogas + House Lords + Comprehensive Doshas
  const detectedYogaIds: YogaId[] = detectChartYogas(result);
  const beneficYogasLocalized = detectedYogaIds
    .filter((id) => id !== "kemadruma")
    .map((id) => YOGA_LABELS_7L[id][targetLang]);
  const detectedYogasSummary = cleanRegionalLabel(
    beneficYogasLocalized.length > 0
      ? beneficYogasLocalized.join(", ")
      : pick7({
        kn: "ಧನ-ಕರ್ಮ ಸ್ಥಾನಾಧಿಪತಿಗಳ ಶುಭ ಸಂಯೋಗ",
        mr: "धन-कर्मेश शुभ संयोग",
        hi: "धन-कर्मेश शुभ संयोग",
        te: "ధన-కర్మాధిపతుల శుభ కలయిక",
        ta: "தன-கர்மாதிபதி சுப சேர்க்கை",
        ml: "ധന-കർമ്മാധിപതികളുടെ ശുഭ സംയോഗം",
        en: "Natal Benefic Dispositor Harmony"
      }, targetLang)
  );

  const getHouseLordPlacement = (houseNum: number) => {
    const rIdx = ((lagnaRashiIdx + houseNum - 1) % 12) as RashiIndex;
    const lordGraha = signLord(rIdx);
    const lordPlanet = result.planets.find((p) => p.name === lordGraha);
    const placedHouse = lordPlanet ? (((lordPlanet.rashi.index - lagnaRashiIdx + 12) % 12) + 1) : houseNum;
    const placedRashi = lordPlanet ? (RASHI_7L[lordPlanet.rashi.index]?.[targetLang] || RASHI_7L[0].en) : (RASHI_7L[rIdx]?.[targetLang] || "");
    const lordName = GRAHA_7L[lordGraha]?.[targetLang] || lordGraha;
    return { lordGraha, lordName, placedHouse, placedRashi };
  };

  let activeRawDoshas: DetectedDosha[] = [];
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
    activeRawDoshas = (doshaReport?.doshas || [])
      .filter((d) => d.isDetected)
      .slice(0, 4);
    activeDoshaNames = activeRawDoshas
      .map((d) => cleanRegionalLabel(resolveDoshaName7L(d.name, targetLang)))
      .filter(Boolean);
  } catch {
    activeRawDoshas = [];
    activeDoshaNames = [];
  }
  const detectedDoshasSummary = cleanRegionalLabel(
    activeDoshaNames.length > 0
      ? activeDoshaNames.join(", ")
      : pick7({
        kn: `ಸೂಕ್ಷ್ಮ ${toNativeDigits(maandiHouse, targetLang)}ನೇ ಭಾವದ ಮಾಂದಿ ಗಂಟು`,
        mr: `${toNativeDigits(maandiHouse, targetLang)}व्या स्थानातील मांदी गाठ`,
        hi: `${toNativeDigits(maandiHouse, targetLang)}वें भाव की मांदी ग्रंथि`,
        te: `${toNativeDigits(maandiHouse, targetLang)}వ స్థాన మాంది గ్రంథి`,
        ta: `${toNativeDigits(maandiHouse, targetLang)}-ஆம் இட மாந்தி முடிச்சு`,
        ml: `${toNativeDigits(maandiHouse, targetLang)}-ാം ഭാവത്തിലെ സൂക്ഷ്മ മാന്ദി ബന്ധം`,
        en: `Subtle Maandi Knot in House ${maandiHouse}`
      }, targetLang)
  );

  // South Indian Accuracy Variables
  const rawYogi = secretProfile.yogiPlanet || "Jupiter";
  const rawAvayogi = secretProfile.avayogiPlanet || "Rahu";
  const yogiPlanetName = GRAHA_7L[rawYogi]?.[targetLang] || rawYogi;
  const avayogiPlanetName = GRAHA_7L[rawAvayogi]?.[targetLang] || rawAvayogi;
  const yogiAttrs = targetLang === "ml"
    ? (YOGI_ATTRIBUTES_ML[rawYogi] || YOGI_ATTRIBUTES_ML.Jupiter)
    : getYogiAttributes6L(rawYogi, targetLang);
  const localizedYogiColor = yogiAttrs.color;
  const localizedYogiDirection = yogiAttrs.direction;
  const localizedYogiDay = yogiAttrs.wealthDay;

  // Parashari Vajra-Hawala Gemstone Harmony Guard
  const isHawalaProhibited = rawYogi === "Mars" && [1, 2, 5, 6].includes(lagnaRashiIdx);
  const isVajraProhibited = rawYogi === "Venus" && [0, 3, 4, 7].includes(lagnaRashiIdx);
  const isYogiFunctionalMaraka = lagnaPlanetNature[rawYogi] === "MARAKA";
  const isYogiGemProhibited = isHawalaProhibited || isVajraProhibited || isYogiFunctionalMaraka;
  const localizedYogiGemstone = isYogiGemProhibited
    ? pick7({
      kn: `ಲಗ್ನ ಮೈತ್ರಿ ಪ್ರಕಾರ ರತ್ನ ಬದಲು '${localizedYogiColor}' ವಸ್ತ್ರ & ಮಂತ್ರ ಜಪ ಶ್ರೇಷ್ಠ`,
      mr: `लग्न नियमानुसार रत्नाऐवजी '${localizedYogiColor}' वस्त्र व मंत्र जप उत्तम`,
      hi: `लग्न मर्यादानुसार रत्न के स्थान पर '${localizedYogiColor}' वस्त्र एवं मंत्र जप श्रेष्ठ`,
      te: `లగ్న నియమం ప్రకారం రత్నానికి బదులుగా '${localizedYogiColor}' వస్త్రం & మంత్ర జపం శ్రేష్ఠం`,
      ta: `லக்ன விதிப்படி ரத்தினத்திற்கு பதிலாக '${localizedYogiColor}' ஆடை & மந்திர ஜபம் உத்தமம்`,
      ml: `പരാശര ലഗ്നമൈത്രി പ്രകാരം രത്നത്തിന് പകരം '${localizedYogiColor}' വസ്ത്രവും മന്ത്രജപവും ഉത്തമം`,
      en: `Per Parashari Lagna harmony, prioritize '${localizedYogiColor}' attire & Japa instead of gem`
    }, targetLang)
    : yogiAttrs.gemstone;
  const localizedYogiDeity = yogiAttrs.deity;

  const yogiNakIdx = typeof secretProfile.yogiNakshatraIndex === "number" ? secretProfile.yogiNakshatraIndex : 7;
  const avayogiNakIdx = typeof secretProfile.avayogiNakshatraIndex === "number" ? secretProfile.avayogiNakshatraIndex : 5;
  const yogiNakshatra = NAKSHATRA_7L[yogiNakIdx]?.[targetLang] || NAKSHATRA_7L[yogiNakIdx]?.en || "Pushya";
  const avayogiNakshatra = NAKSHATRA_7L[avayogiNakIdx]?.[targetLang] || NAKSHATRA_7L[avayogiNakIdx]?.en || "Ardra";

  const bhriguBinduRashiName = RASHI_7L[secretProfile.bhriguBinduRashi]?.[targetLang] || "Taurus";
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

  const rawLagnaLocalized = RASHI_7L[lagnaRashiIdx]?.[targetLang] || "Aries";
  const chandraTagLocalized = pick7({
    kn: "ಚಂದ್ರ ಲಗ್ನ ಆಧಾರಿತ",
    en: "Chandra Lagna Basis",
    hi: "चन्द्र लग्न आधारित",
    mr: "चंद्र लग्न आधारित",
    te: "చంద్ర లగ్న ఆధారితం",
    ta: "சந்திர லக்ன அடிப்படை",
    ml: "ചന്ദ്രലഗ്ന അടിസ്ഥാനം"
  }, targetLang);
  const lagnaNameLocalized = isChandraBasisOnly ? `${rawLagnaLocalized} (${chandraTagLocalized})` : rawLagnaLocalized;
  const moonRashiLocalized = RASHI_7L[moonRashiIdx]?.[targetLang] || "Taurus";

  // Compute Authentic Strongest Hero Planet & Physically Closest Colleague inside THIS Birth Chart
  const EXALTED_RASHIS: Record<string, number> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
  const OWN_RASHIS: Record<string, number[]> = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
  const heroScored = precisionPlanets
    .filter((pp) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(pp.planet))
    .map((pp) => {
      let score = 1;
      if (EXALTED_RASHIS[pp.planet] === pp.rashi) score += 10;
      else if (OWN_RASHIS[pp.planet]?.includes(pp.rashi)) score += 7;
      if (lagnaPlanetNature[pp.planet] === "YOGAKARAKA") score += 6;
      else if (lagnaPlanetNature[pp.planet] === "BENEFIC") score += 3;
      if (pp.planet === lagnaLordGraha) score += 4;
      if (pp.planet === rawYogi) score += 3;
      if ([1, 4, 5, 7, 9, 10, 11].includes(pp.rashiHouse)) score += 2;
      return { pp, score };
    })
    .sort((a, b) => b.score - a.score);

  const heroEntry = heroScored[0]?.pp || precisionPlanets[0];
  const heroRawName = String(heroEntry?.planet || rawYogi || "Jupiter");
  const heroPlanetHouse = heroEntry?.rashiHouse || 1;
  const heroPlanetRashiIdx = heroEntry?.rashi ?? lagnaRashiIdx;
  const heroPlanetName = GRAHA_7L[heroRawName]?.[targetLang] || heroRawName;
  const heroPlanetRashi = RASHI_7L[heroPlanetRashiIdx]?.[targetLang] || lagnaNameLocalized;

  const colleagueSorted = precisionPlanets
    .filter((pp) => pp.planet !== heroRawName)
    .map((pp) => {
      const diff = Math.abs((heroEntry?.longitude ?? 0) - pp.longitude) % 360;
      return { pp, dist: Math.min(diff, 360 - diff) };
    })
    .sort((a, b) => a.dist - b.dist);

  const nearestEntry = colleagueSorted[0]?.pp || precisionPlanets[1] || heroEntry;
  const nearestRawName = String(nearestEntry?.planet || "Rahu");
  const nearestColleagueName = GRAHA_7L[nearestRawName]?.[targetLang] || nearestRawName;
  const nearestColleagueHouse = nearestEntry?.rashiHouse || heroPlanetHouse;
  const nearestColleagueRashi = RASHI_7L[nearestEntry?.rashi ?? moonRashiIdx]?.[targetLang] || moonRashiLocalized;

  const storyCtx: StoryEngineInput = {
    targetLang,
    devoteeName: localizedDevoteeName,
    birthDate,
    birthTime,
    birthPlace: birthPlaceShort,
    ageYears: ageDecimal,
    ageCategory,
    gender,
    maritalStatus,
    childrenStatus,
    weekdayIdx,
    weekdayName,
    isShuklaPaksha: (traditional?.paksha || "Shukla") !== "Krishna",
    pakshaName,
    tithiName,
    yogaName,
    karanaName,
    nakshatraIdx: moonNakIdx,
    nakshatraName,
    nakshatraPada,
    janmaHora,
    livePrashnaHora,
    lagnaRashiIdx,
    lagnaRashiName: lagnaNameLocalized,
    moonRashiIdx,
    moonRashiName: moonRashiLocalized,
    sunRashiIdx: (((sunP.rashi.index % 12) + 12) % 12),
    yogiRashiIdx: (((secretProfile.yogiRashi % 12) + 12) % 12),
    maandiRashiIdx,
    saturnRashiIdx: (((satP.rashi.index % 12) + 12) % 12),
    jupiterRashiIdx: (((jupP.rashi.index % 12) + 12) % 12),
    shaniTransitRashiIdx,
    guruTransitRashiIdx,
    currentMahadasha,
    currentBhuktiLord,
    bhuktiEndDate,
    isDashaSandhi,
    rawYogi,
    yogiPlanetName,
    avayogiPlanetName,
    localizedYogiColor,
    localizedYogiDirection,
    localizedYogiDay,
    localizedYogiDeity,
    bhriguBinduRashiName,
    bhriguDeg,
    maandiHouse,
    maandiRashiName,
    maandiDomainAffected: MAANDI_DOMAIN_MAP[maandiHouse]?.[targetLang] || MAANDI_DOMAIN_MAP[1][targetLang],
    primaryElem,
    secondaryElem,
    dominantElement,
    elemWeights,
    savTable,
    shaniTransitRashi,
    shaniHouseFromMoon,
    shaniTransitSav,
    guruTransitRashi,
    guruHouseFromMoon,
    guruTransitSav,
    rahuHouseFromMoon,
    detectedYogasSummary,
    detectedDoshasSummary,
    activeRawDoshas,
    house10Info: getHouseLordPlacement(10),
    house2Info: getHouseLordPlacement(2),
    house11Info: getHouseLordPlacement(11),
    house7Info: getHouseLordPlacement(7),
    house5Info: getHouseLordPlacement(5),
    house6Info: getHouseLordPlacement(6),
    heroPlanetName,
    heroPlanetHouse,
    heroPlanetRashi,
    nearestColleagueName,
    nearestColleagueHouse,
    nearestColleagueRashi,
    lagnaLordName: lagnaLord,
    extendedPrecision,
    nowYear: now.getFullYear(),
    narrativeVariant,
    maritalContext,
    janmaDashaBalance,
    rawMaha,
    rawBhukti,
    rawAvayogi,
    shaniVedhaObstructed: Boolean(shaniVedha?.isObstructed),
    guruVedhaObstructed: Boolean(guruVedha?.isObstructed),
    yogiRashiName: RASHI_7L[secretProfile.yogiRashi]?.[targetLang] || "Aries",
    avayogiRashiName: RASHI_7L[secretProfile.avayogiRashi]?.[targetLang] || "Gemini",
    bhriguBinduHouseFromMoon: houseFromMoon(secretProfile.bhriguBinduRashi),
  };

  const coverPage: BookletCoverContent = buildDynamicBookletCover(storyCtx);
  if (isChandraBasisOnly) {
    coverPage.personalAssurancePara1 = pick7({
      kn: `ಪ್ರೀತಿಯ ${localizedDevoteeName}, ಈ ಸಂಪೂರ್ಣ ೨೫ ಅಧ್ಯಾಯಗಳ ಮಹಾ ಜಾತಕ ಗ್ರಂಥವನ್ನು ${toNativeDigits(birthDate, targetLang)} ರಂದು ${birthPlace} ಪುಣ್ಯಭೂಮಿಯ ಖಗೋಳ ಗ್ರಹಸ್ಥಿತಿ ಮತ್ತು ನಿಖರ ಚಂದ್ರ ಲಗ್ನ (${moonRashiLocalized}) ಹಾಗೂ ${nakshatraName} ನಕ್ಷತ್ರದ ಆಧಾರದ ಮೇಲೆ ಕೇವಲ ನಿಮಗಾಗಿ ಮಾತ್ರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`,
      mr: `प्रिय ${localizedDevoteeName}, ही २५ अध्यायांची महा-पत्रिका दिनांक ${toNativeDigits(birthDate, targetLang)} रोजी ${birthPlace} येथील अचूक ग्रहस्थिती, चंद्र लग्न (${moonRashiLocalized}) आणि ${nakshatraName} नक्षत्राच्या आधारे केवळ आपल्यासाठी तयार केली आहे.`,
      hi: `प्रिय ${localizedDevoteeName}, यह संपूर्ण २५-अध्यायीय महा-कुंडली पुस्तिका दिनांक ${toNativeDigits(birthDate, targetLang)} को ${birthPlace} की शुद्ध खगोलीय ग्रहस्थिति, सटीक चंद्र लग्न (${moonRashiLocalized}) एवं ${nakshatraName} नक्षत्र के आधार पर केवल आपके लिए निर्मित की गई है।`,
      te: `ప్రియమైన ${localizedDevoteeName}, ఈ 25 అధ్యాయాల సంపూర్ణ జాతక పుస్తకం ${toNativeDigits(birthDate, targetLang)} నాడు ${birthPlace} వద్ద ఉన్న ఖచ్చితమైన గ్రహ స్థితి, చంద్ర లగ్నం (${moonRashiLocalized}) మరియు ${nakshatraName} ఆధారంగా కేవలం మీ కోసం రూపొందించబడింది.`,
      ta: `அன்புள்ள ${localizedDevoteeName}, இந்த 25 அத்தியாய மகா ஜாதக நூல் ${toNativeDigits(birthDate, targetLang)} அன்று ${birthPlace} வானியல் கிரக நிலை, துல்லிய சந்திர லக்னம் (${moonRashiLocalized}) மற்றும் ${nakshatraName} அடிப்படையில் உங்களுக்காக மட்டுமே உருவாக்கப்பட்டது.`,
      ml: `പ്രിയ ${localizedDevoteeName}, ${toNativeDigits(birthDate, targetLang)} തീയതി ${birthPlace}-ലെ കൃത്യമായ ഗ്രഹനിലയും ചന്ദ്രലഗ്നവും (${moonRashiLocalized}) ${nakshatraName} നക്ഷത്രവും അടിസ്ഥാനമാക്കി നിങ്ങൾക്കായി മാത്രം ഒരുക്കിയ 25 അധ്യായ ഗ്രന്ഥമാണിത്.`,
      en: `Dear ${localizedDevoteeName}, this 25-Chapter Sampoorna Destiny Booklet is crafted solely for you from the true planetary sky over ${birthPlace} on ${birthDate}, mathematically anchored via your authentic Chandra Lagna (${moonRashiLocalized}) and ${nakshatraName}.`
    }, targetLang);
  }
  const activeDoshaProfiles: ActiveDoshaProfile[] = buildConsolidatedDoshaProfiles(storyCtx);
  const chartVisualMetrics: ChartVisualMetrics = computeChartVisualMetrics(storyCtx);

  options?.onProgress?.(50, pick7({
    kn: "೩. ೨೫ ಆಳವಾದ ಅಧ್ಯಾಯಗಳ ಸಂಯೋಜನೆ (ಪ್ರಶ್ನೋತ್ತರ ಶೈಲಿ, ಶೂನ್ಯ ಕೋಷ್ಟಕ)...",
    mr: "३. २५ सखोल अध्यायांची निर्मिती (प्रश्नोत्तर शैली, शून्य तक्ता)...",
    hi: "३. २५ गहन अध्यायों की संरचना (प्रश्नोत्तरी शैली, शून्य तालिका)...",
    te: "3. 25 లోతైన అధ్యాయాల నిర్మాణం (ప్రశ్నోత్తర శైలి)...",
    ta: "3. 25 விரிவான அத்தியாயங்கள் உருவாக்கம்...",
    ml: "3. 25 ആഴമേറിയ അധ്യായങ്ങളുടെ കഥനരൂപരേഖ ഒരുക്കുന്നു...",
    en: "3. Synthesizing 25 Deep Chapters (Story Style, Zero Tables)..."
  }, targetLang));

  // Build deterministic 25-chapter astronomical chassis & fallback foundation
  const chapters: Master25Chapter[] = buildDynamicStoryChapters(storyCtx, activeDoshaProfiles);

  // ──────────────────────────────────────────────────────────────────────────
  // GEMINI AI DYNAMIC NARRATION & UNIQUE EXAMPLES ENGINE (gemini-3.5-flash-lite)
  // Generates personalized cover paragraphs, unique real-life stories/examples
  // per chapter, and dynamic dosha insights so neither family members nor
  // repeat downloads ever see hardcoded or duplicated examples.
  // ──────────────────────────────────────────────────────────────────────────
  const resolvedApiKey = (
    options?.geminiApiKey ||
    useAppStore.getState?.()?.geminiApiKey ||
    (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY : "") ||
    ""
  ).trim();

  const shouldRunAi =
    typeof options?.enableAi === "boolean"
      ? options.enableAi && Boolean(resolvedApiKey)
      : !isTestEnvironment() && Boolean(resolvedApiKey);

  let aiResult: SampoornaAiGenerationResult | null = null;
  if (shouldRunAi) {
    const houseSummaryStr = [
      `H2 Lord=${storyCtx.house2Info.lordName}(H${storyCtx.house2Info.placedHouse} ${storyCtx.house2Info.placedRashi})`,
      `H5 Lord=${storyCtx.house5Info.lordName}(H${storyCtx.house5Info.placedHouse} ${storyCtx.house5Info.placedRashi})`,
      `H6 Lord=${storyCtx.house6Info.lordName}(H${storyCtx.house6Info.placedHouse} ${storyCtx.house6Info.placedRashi})`,
      `H7 Lord=${storyCtx.house7Info.lordName}(H${storyCtx.house7Info.placedHouse} ${storyCtx.house7Info.placedRashi})`,
      `H9 Lord=${extendedPrecision.house9Info.lordName}(H${extendedPrecision.house9Info.placedHouse} ${extendedPrecision.house9Info.placedRashi})`,
      `H10 Lord=${storyCtx.house10Info.lordName}(H${storyCtx.house10Info.placedHouse} ${storyCtx.house10Info.placedRashi})`,
      `H11 Lord=${storyCtx.house11Info.lordName}(H${storyCtx.house11Info.placedHouse} ${storyCtx.house11Info.placedRashi})`,
    ].join("; ");

    aiResult = await generateSampoorna25AiNarratives(
      {
        targetLang,
        devoteeName: localizedDevoteeName,
        ageYears: ageDecimal,
        ageCategory,
        isMinor: ageDecimal < 18,
        isInfant: ageDecimal < 2,
        isChild: ageDecimal >= 2 && ageDecimal < 13,
        isTeen: ageDecimal >= 13 && ageDecimal < 18,
        isSenior: ageDecimal >= 60,
        gender,
        maritalStatus,
        childrenStatus,
        birthDate,
        birthTime,
        birthPlace,
        lagnaName: lagnaNameLocalized,
        lagnaLord,
        lagnaRashiIdx,
        moonRashi: moonRashiLocalized,
        moonLord,
        moonRashiIdx,
        nakshatraName,
        pakshaName,
        tithiName,
        weekdayName,
        yogaName,
        karanaName,
        janmaHora,
        janmaDashaBalance,
        currentMahadasha,
        currentBhukti: currentBhuktiLord,
        bhuktiEndDate,
        yogiPlanet: yogiPlanetName,
        yogiColor: localizedYogiColor,
        yogiDirection: localizedYogiDirection,
        yogiDay: localizedYogiDay,
        avayogiPlanet: avayogiPlanetName,
        bhriguBinduRashi: bhriguBinduRashiName,
        bhriguBinduHouse: storyCtx.bhriguBinduHouseFromMoon || 1,
        maandiRashi: maandiRashiName,
        maandiHouse,
        maandiDomainTheme: MAANDI_DOMAIN_MAP[maandiHouse]?.[targetLang] || MAANDI_DOMAIN_MAP[1][targetLang],
        shaniTransitRashi,
        shaniHouseFromMoon,
        guruTransitRashi,
        guruHouseFromMoon,
        dominantElement,
        detectedYogasSummary,
        detectedDoshasSummary,
        heroPlanetName,
        heroPlanetHouse,
        heroPlanetRashi,
        nearestColleagueName,
        nearestColleagueHouse,
        nearestColleagueRashi,
        liveTarabalaHeadline: extendedPrecision.precisionProfileSummary.liveTarabalaHeadline,
        tarabalaReportDateStr: extendedPrecision.reportDateDisplay,
        savByHouse: savTable,
        badhakaHouse: extendedPrecision.badhakaHouse,
        badhakaLord: extendedPrecision.badhakaInfo.lordName,
        neechaBhangaSummary: extendedPrecision.precisionProfileSummary.dignifiedSummary || "None",
        vedhaSummary: `ShaniVedha=${Boolean(shaniVedha?.isObstructed)}, GuruVedha=${Boolean(guruVedha?.isObstructed)}`,
        activeDoshaProfiles,
        chartVisualMetrics,
        narrativeVariant,
        houseSummaryLines: houseSummaryStr,
        timePrecision,
        btrSummary: options?.resolvedBtrSummary,
        sankhyaSummary: options?.sankhyaSummary,
      },
      resolvedApiKey,
      (aiPct, aiMsg) => {
        const mappedPct = Math.min(89, 50 + Math.round((aiPct / 100) * 38));
        options?.onProgress?.(mappedPct, aiMsg);
      }
    );

    // Overlay AI output with strict Mathematical & Language Purity Post-AI Guard
    if (aiResult && aiResult.chaptersByNumber.size > 0) {
      const stripPadaAndPurify = (raw: string): string => {
        if (!raw) return "";
        let cleaned = raw
          .replace(/[\u0900-\u097F]*ॐ[\u0900-\u097F]*|॥|।/g, (m) => (targetLang === "ta" || targetLang === "ml" ? "" : m))
          .replace(/\b(?:Nakshatra\s+)?Pada\s*[-:#]?\s*\d*\b/gi, "")
          .replace(/(?:ನಕ್ಷತ್ರ\s*)?ಪಾದ\s*[-:#]?\s*[೦-೯\d]*/gu, "")
          .replace(/(?:नक्षत्र\s*)?चरण\s*[-:#]?\s*[०-९\d]*/gu, "")
          .replace(/(?:నక్షత్ర\s*)?పాదం\s*[-:#]?\s*[౦-౯\d]*/gu, "")
          .replace(/(?:நட்சத்திர\s*)?பாதம்\s*[-:#]?\s*\d*/gu, "")
          .replace(/(?:നക്ഷത്ര\s*)?പാദം\s*[-:#]?\s*\d*/gu, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        cleaned = cleanPunctuationArtifacts(cleaned);
        if (targetLang !== "en") {
          cleaned = cleanRegionalPreserveBullets(cleaned, targetLang);
        }
        return cleaned;
      };

      const isScriptValidForLang = (txt: string): boolean => {
        if (!txt || txt.trim().length < 15) return false;
        if (targetLang === "en") return !/[\u0900-\u0D7F]/.test(txt);
        const reMap: Record<Exclude<SevenLang, "en">, RegExp> = {
          kn: /[\u0C80-\u0CFF]/,
          mr: /[\u0900-\u097F]/,
          hi: /[\u0900-\u097F]/,
          te: /[\u0C00-\u0C7F]/,
          ta: /[\u0B80-\u0BFF]/,
          ml: /[\u0D00-\u0D7F]/,
        };
        if (!reMap[targetLang].test(txt)) return false;
        const latinCount = (txt.match(/[A-Za-z]/g) || []).length;
        return latinCount <= 2;
      };

      // 1) Overlay Cover Personalization
      if (aiResult.coverAssurancePara1 && isScriptValidForLang(aiResult.coverAssurancePara1)) {
        const cleanP1 = stripPadaAndPurify(aiResult.coverAssurancePara1);
        if (cleanP1.length >= 60 && isScriptValidForLang(cleanP1)) {
          coverPage.personalAssurancePara1 = cleanP1;
        }
      }
      if (aiResult.coverAssurancePara2 && isScriptValidForLang(aiResult.coverAssurancePara2)) {
        const cleanP2 = stripPadaAndPurify(aiResult.coverAssurancePara2);
        if (cleanP2.length >= 60 && isScriptValidForLang(cleanP2)) {
          coverPage.personalAssurancePara2 = cleanP2;
        }
      }
      if (aiResult.coverTagline && isScriptValidForLang(aiResult.coverTagline)) {
        const cleanTag = stripPadaAndPurify(aiResult.coverTagline);
        if (cleanTag.length >= 12 && isScriptValidForLang(cleanTag)) {
          coverPage.bookletEditionLine = `${cleanTag} • #${toNativeDigits(narrativeVariant + 1, targetLang)}`;
        }
      }

      // 2) Overlay Dosha Insights for Ch 23 Visual Audit Matrix
      for (const d of activeDoshaProfiles) {
        const aiDosha = aiResult.doshaInsightsById.get(d.id);
        if (aiDosha) {
          const cleanDoing = stripPadaAndPurify(aiDosha.doingNow);
          const cleanAction = stripPadaAndPurify(aiDosha.exactAction);
          if (cleanDoing.length >= 25 && isScriptValidForLang(cleanDoing)) {
            d.doingNow = cleanDoing;
          }
          if (cleanAction.length >= 20 && isScriptValidForLang(cleanAction)) {
            d.exactAction = cleanAction;
          }
        }
      }

      // 3) Overlay Chapters 1..25 with strict cross-chapter sentence dedup & invariants
      const seenGlobalSentences = new Set<string>();
      const minorRomanceGuard = (txt: string): string => {
        if (ageDecimal >= 18) return txt;
        return txt
          .replace(/\b(marriage|spouse|husband|wife|romantic|dating|promotion|salary hike|mortgage|business profit)\b/gi, "learning & family blessings")
          .replace(/(ಮದುವೆ|ವಿವಾಹ|ದಾಂಪತ್ಯ|ಪತಿ|ಪತ್ನಿ|ಪ್ರೇಮ|ಉದ್ಯೋಗ ಬಡ್ತಿ)/gu, "ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ")
          .replace(/(शादी|विवाह|दांपत्य|पति|पत्नी|लग्नगाठ)/gu, "शिक्षण आणि कुटुंबाचा आशीर्वाद")
          .replace(/(వివాహం|పెళ్లి|దాంపత్యం|భార్య|భర్త)/gu, "చదువు మరియు పెద్దల ఆశీర్వాదం")
          .replace(/(திருமணம்|தாம்பத்தியம்|மனைவி|கணவன்)/gu, "கல்வி மற்றும் பெரியோர் ஆசி")
          .replace(/(വിവാഹം|ദാമ്പത്യം|ഭാര്യ|ഭർത്താവ്)/gu, "വിദ്യാഭ്യാസവും കുടുംബാശിസ്സും");
      };

      for (const ch of chapters) {
        const aiCh = aiResult.chaptersByNumber.get(ch.chapterNumber);
        if (!aiCh) continue;

        const aiTitle = minorRomanceGuard(stripPadaAndPurify(aiCh.title));
        const aiQuestion = minorRomanceGuard(stripPadaAndPurify(aiCh.devoteeQuestion.replace(/^(?:Question|ಪ್ರಶ್ನೆ|प्रश्न|सवाल|ప్రశ్న|கேள்வி|ചോദ്യം)\s*[:\-]\s*/iu, "")));
        const aiHook = minorRomanceGuard(stripPadaAndPurify(aiCh.storyHook));
        const aiGuidance = minorRomanceGuard(stripPadaAndPurify(aiCh.practicalGuidance));
        const aiBadge = minorRomanceGuard(stripPadaAndPurify(aiCh.chapterBadge));

        const dedupedParas: string[] = [];
        for (const rawP of aiCh.paragraphs) {
          const cleanP = minorRomanceGuard(cleanDegreesFromText(stripPadaAndPurify(rawP)));
          if (!isScriptValidForLang(cleanP) || cleanP.length < 30) continue;
          const sentences = cleanP.split(/(?<=[.!?।])\s+/u).map((s) => s.trim()).filter(Boolean);
          const uniqueSentences: string[] = [];
          for (const s of sentences) {
            const normKey = s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").slice(0, 72);
            if (normKey.length >= 16 && seenGlobalSentences.has(normKey)) continue;
            if (normKey.length >= 16) seenGlobalSentences.add(normKey);
            uniqueSentences.push(s);
          }
          if (uniqueSentences.length > 0) {
            dedupedParas.push(uniqueSentences.join(" "));
          }
        }

        if (isScriptValidForLang(aiQuestion)) ch.question = aiQuestion;
        if (isScriptValidForLang(aiTitle)) ch.title = aiTitle;
        if (isScriptValidForLang(aiHook)) ch.storyHook = aiHook;
        if (isScriptValidForLang(aiGuidance)) ch.practicalGuidance = aiGuidance;
        if (isScriptValidForLang(aiBadge) && aiBadge.length >= 4) ch.guidanceBadge = aiBadge;

        if (dedupedParas.length >= 3 && dedupedParas.join(" ").length >= 340) {
          ch.paragraphs = dedupedParas;
        } else if (dedupedParas.length >= 2) {
          ch.paragraphs = [...dedupedParas, ch.paragraphs[ch.paragraphs.length - 1]].filter(Boolean);
        }

        // Invariant Guard — Ch 1 exact live Tarabala report date bracket
        if (ch.chapterNumber === 1) {
          const dateToken = `[${extendedPrecision.reportDateDisplay}]`;
          const hasDate = ch.question.includes(extendedPrecision.reportDateDisplay) || ch.paragraphs.join(" ").includes(extendedPrecision.reportDateDisplay);
          if (!hasDate) {
            ch.question = `${ch.question} ${dateToken}`.trim();
          } else if (!ch.question.includes(dateToken) && !ch.paragraphs[0]?.includes(dateToken)) {
            ch.paragraphs[0] = `${ch.paragraphs[0]} ${dateToken}`.trim();
          }
        }

        // Invariant Guard — Ch 11 explicit Yoga names
        if (ch.chapterNumber === 11 && detectedYogasSummary) {
          const combined11 = `${ch.question} ${ch.paragraphs.join(" ")}`;
          const firstYoga = detectedYogasSummary.split(",")[0]?.trim() || "";
          if (firstYoga && !combined11.includes(firstYoga)) {
            ch.paragraphs[ch.paragraphs.length - 1] = `${ch.paragraphs[ch.paragraphs.length - 1]} (${detectedYogasSummary})`.trim();
          }
        }

        // Invariant Guard — Ch 23 4-pillar scientific Dosha visibility (Kuja, Sarpa, Shani, Maandi)
        if (ch.chapterNumber === 23) {
          const combined23 = `${ch.paragraphs.join(" ")}`;
          const pillarTag = pick7({
            kn: "ಕುಜ, ಸರ್ಪ, ಶನಿ ಹಾಗೂ ಮಾಂದಿ ಪರಿಶೀಲನೆ ಸಂಪೂರ್ಣವಾಗಿದೆ.",
            mr: "कुज, सर्प, शनि आणि मांदी दोष तपासणी पूर्ण झाली आहे.",
            hi: "कुज, सर्प, शनि एवं मांदी दोष परीक्षण पूर्ण है।",
            te: "కుజ, సర్ప, శని మరియు మాంది దోష పరిశీలన పూర్తయింది.",
            ta: "செவ்வாய், சர்ப்ப, சனி மற்றும் மாந்தி தோஷ ஆய்வு நிறைவடைந்துள்ளது.",
            ml: "കുജ, സർപ്പ, ശനി, മാന്ദി ദോഷ പരിശോധന പൂർത്തിയാക്കിയിരിക്കുന്നു.",
            en: "Scientific Kuja, Sarpa, Shani, and Maandi evaluation is complete."
          }, targetLang);
          const checkWords = targetLang === "en" ? ["Kuja", "Sarpa", "Maandi"] : targetLang === "ta" ? ["செவ்வாய்", "மாந்தி"] : targetLang === "ml" ? ["കുജ", "മാന്ദി"] : ["मांदी", "మాంది", "ಮಾಂದಿ"];
          if (!checkWords.some((w) => combined23.includes(w))) {
            ch.paragraphs[ch.paragraphs.length - 1] = `${ch.paragraphs[ch.paragraphs.length - 1]} ${pillarTag}`.trim();
          }
        }

        // Invariant Guard — Ch 25 Gokarna Sanctuary anchor
        if (ch.chapterNumber === 25) {
          const combined25 = `${ch.paragraphs.join(" ")} ${ch.practicalGuidance || ""}`;
          const gokarnaRegex = /gokarna|ಗೋಕರ್ಣ|गोकर्ण|గోకర్ణ|கோகர்ண|ഗോകർണ്ണ/i;
          if (!gokarnaRegex.test(combined25)) {
            const gokarnaLine = pick7({
              kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಅನುಗ್ರಹ ಸದಾ ನಿಮ್ಮೊಂದಿಗಿರಲಿ.",
              mr: "श्री क्षेत्र गोकर्ण महाबळेश्वर कृपा सदैव पाठीशी राहो.",
              hi: "श्री क्षेत्र गोकर्ण महाबलेश्वर की कृपा सदैव आपके साथ रहे।",
              te: "శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర అనుగ్రహం ఎల్లప్పుడూ తోడుండును.",
              ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் அருள் எப்போதும் துணை நிற்கும்.",
              ml: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര അനുഗ്രഹം എന്നും തുണയായിരിക്കട്ടെ.",
              en: "May the timeless grace of Sri Kshetra Gokarna Mahabaleshwara guard your journey."
            }, targetLang);
            ch.paragraphs[ch.paragraphs.length - 1] = `${ch.paragraphs[ch.paragraphs.length - 1]} ${gokarnaLine}`.trim();
          }
        }
      }
    }
  }

  options?.onProgress?.(90, pick7({
    kn: "೪. ಮುಖ್ಯ ಅರ್ಚಕ ಚೈತನ್ಯ ಪಂಡಿತರ ದೈವಿಕ ಆಶೀರ್ವಾದ & ರಕ್ಷಾ ಕವಚ ಜೋಡಣೆ...",
    mr: "४. मुख्य पुरोहित चैतन्य पंडित यांचे दैवी आशीर्वाद...",
    hi: "४. मुख्य अर्चक चैतन्य पंडित का दिव्य आशीर्वाद एवं रक्षा कवच...",
    te: "4. ముఖ్య అర్చకులు చైతన్య పండిట్ ఆశీర్వాదం...",
    ta: "4. தலைமை அர்ச்சகர் சைதன்ய பண்டிதர் ஆசீர்வாதம்...",
    ml: "4. മുഖ്യ അർച്ചകൻ ചൈതന്യ പണ്ഡിതിന്റെ ഗോകർണ്ണ ആശിസ്സുകൾ ചേർക്കുന്നു...",
    en: "4. Binding Chief Priest Chaitanya Pandit Blessings & Final Seal..."
  }, targetLang));

  // Priest Contact Pinned to Chaitanya Pandit (+91 94821 09844)
  const priestBooking = {
    heading: pick7({
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ, ಸಂಕಲ್ಪ ಪೂಜೆ & ಸೇವಾ ಖಚಿತತೆಗಾಗಿ",
      mr: "श्री क्षेत्र गोकर्ण दोष निवारण, संकल्प पूजा व सेवा बुकिंगसाठी",
      hi: "श्री क्षेत्र गोकर्ण दोष निवारण, संकल्प पूजा एवं सेवा आरक्षण हेतु",
      te: "శ్రీ క్షేత్ర గోకర్ణ దోష నివారణ, సంకల్ప పూజ & సేవా బుకింగ్ కొరకు",
      ta: "ஸ்ரீ க்ஷேத்திர கோகர்ண தோஷ பரிகாரம், சங்கல்ப பூஜை & சேவா உறுதிப்படுத்த",
      ml: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ ദോഷപരിഹാരം, സങ്കല്പ പൂജ & സേവാ ബുക്കിംഗിനായി",
      en: "For Authentic Dosha Parihara, Sankalpa Puja & Sri Kshetra Gokarna Seva Confirmation"
    }, targetLang),
    subheading: pick7({
      kn: "ನೇರವಾಗಿ ಮುಖ್ಯ ಅರ್ಚಕರೊಂದಿಗೆ ಮಾತನಾಡಿ ಪೂಜಾ ಸಂಕಲ್ಪವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ:",
      mr: "थेट मुख्य पुरोहितांशी संपर्क साधून पूजा संकल्प निश्चित करा:",
      hi: "सीधे मुख्य अर्चक से संपर्क कर पूजा संकल्प सुनिश्चित करें:",
      te: "ముఖ్య అర్చకులతో నేరుగా సంప్రదించి పూజా సంకల్పం నిర్ధారించుకోండి:",
      ta: "நேரடியாக தலைமை அர்ச்சகருடன் பேசி பூஜை சங்கல்பத்தை உறுதி செய்யவும்:",
      ml: "പൂജാ സങ്കല്പം ഉറപ്പാക്കാൻ മുഖ്യ അർച്ചകനുമായി നേരിട്ട് ബന്ധപ്പെടുക:",
      en: "Speak directly with the Chief Priest to confirm your sacred Sankalpa:"
    }, targetLang),
    priestTitle: pick7({
      kn: "ಮುಖ್ಯ ಅರ್ಚಕರು",
      mr: "मुख्य पुरोहित",
      hi: "मुख्य अर्चक",
      te: "ముఖ్య అర్చకులు",
      ta: "தலைமை அர்ச்சகர்",
      ml: "മുഖ്യ അർച്ചകൻ",
      en: "Chief Priest"
    }, targetLang),
    priestName: pick7({
      kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
      mr: "वेद मूर्ति चैतन्य पंडित",
      hi: "वेद मूर्ति चैतन्य पंडित",
      te: "వేదమూర్తి చైతన్య పండిత్",
      ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்",
      ml: "വേദമൂർത്തി ചൈതന്യ പണ്ഡിത്",
      en: "Veda Moorthy Chaitanya Pandit"
    }, targetLang),
    phone: "+91 94821 09844",
    phoneDisplay: "+91 94821 09844",
    tel: "+919482109844",
    address: pick7({
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ, ಗೋಕರ್ಣ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",
      mr: "श्री गोकर्ण महाबळेश्वर सानिध्य, गोकर्ण, उत्तर कन्नड, कर्नाटक",
      hi: "श्री गोकर्ण महाबलेश्वर सान्निध्य, गोकर्ण, उत्तर कन्नड़, कर्नाटक",
      te: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం, గోకర్ణ, ఉత్తర కన్నడ, కర్ణాటక",
      ta: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதி, கோகர்ண, உத்தர கன்னடம், கர்நாடகா",
      ml: "ശ്രീ ഗോകർണ്ണ മഹാബലേശ്വര സന്നിധാനം, ഗോകർണ്ണ, കർണാടക",
      en: "Sri Gokarna Mahabaleshwara Sannidhana, Gokarna, Karnataka, India"
    }, targetLang)
  };

  const defaultFamilyProtectionHook = pick7({
    kn: "ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಗ್ರಹಗಳು ಪರಸ್ಪರ ರಕ್ಷಣೆ ಮತ್ತು ಪ್ರಭಾವವನ್ನು ಬೀರುತ್ತವೆ. ನಿಮ್ಮ ಪತಿ/ಪತ್ನಿ, ಮಕ್ಕಳು ಹಾಗೂ ತಂದೆ-ತಾಯಿಯ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಂಪೂರ್ಣ ೨೫-ಅಧ್ಯಾಯಗಳ ಮಹಾ ವರದಿಯನ್ನು ಪರಿಶೀಲಿಸುವುದರಿಂದ ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸಕಾಲಿಕ ದೈವಿಕ ರಕ್ಷಣೆ ಖಚಿತವಾಗುತ್ತದೆ.",
    mr: "कुटुंबातील प्रत्येक सदस्याचे ग्रह एकमेकांवर रक्षण व प्रभाव पाडतात. आपल्या जोडीदार, मुले व पालकांच्या पत्रिकेचा हा २५-अध्यायांचा महाअहवाल तपासल्याने कुटुंबात सुख, शांतता व अखंड संरक्षण लाभते.",
    hi: "परिवार के प्रत्येक सदस्य के ग्रह एक-दूसरे की रक्षा एवं भाग्य को प्रभावित करते हैं। अपने जीवनसाथी, संतानों एवं माता-पिता की कुंडली का संपूर्ण २५-अध्यायीय महा प्रतिवेदन प्राप्त करने से पारिवारिक सौहार्द एवं समयोचित सुरक्षा सुनिश्चित होती है।",
    te: "కుటుంబంలోని ప్రతి ఒక్కరి గ్రహాలు ఒకరికొకరు రక్షణ మరియు ప్రభావాన్ని కలిగి ఉంటాయి. మీ భాగస్వామి, పిల్లలు మరియు తల్లిదండ్రుల 25-అధ్యాయాల సమగ్ర నివేదికను పరిశీలించడం వల్ల కుటుంబ సామరస్యం మరియు దైవిక రక్షణ లభిస్తుంది.",
    ta: "குடும்பத்தில் உள்ள ஒவ்வொருவரின் கிரகங்களும் ஒருவருக்கொருவர் பாதுகாப்பையும் தாக்கத்தையும் ஏற்படுத்துகின்றன. உங்கள் துணை, குழந்தைகள் மற்றும் பெற்றோரின் 25-அத்தியாய ஜாதக அறிக்கையைப் பெறுவது குடும்ப ஒற்றுமையையும் உடனடி பாதுகாப்பையும் உறுதி செய்யும்.",
    ml: "കുടുംബത്തിലെ ഓരോ അംഗത്തിന്റെയും ഗ്രഹനിലയും ദശാകാലവും പരസ്പരം സ്വാധീനിക്കുന്നവയാണ്. ജീവിതപങ്കാളി, മക്കൾ, മാതാപിതാക്കൾ എന്നിവരുടെയും 25-അധ്യായ സമ്പൂർണ്ണ ജാതക റിപ്പോർട്ട് പരിശോധിക്കുന്നത് കുടുംബൈക്യത്തിനും കരുതൽ സംരക്ഷണത്തിനും വഴിയൊരുക്കും.",
    en: "Every family member's planets protect and influence one another. Checking the personalized 25-Chapter Destiny Report for your spouse, children, and parents ensures complete family harmony and timely divine protection."
  }, targetLang);

  const familyProtectionHook =
    aiResult?.familyProtectionHook && aiResult.familyProtectionHook.length >= 30
      ? cleanRegionalPreserveBullets(aiResult.familyProtectionHook, targetLang)
      : defaultFamilyProtectionHook;

  const footerText = pick7({
    kn: "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಕಾಶನ ॥",
    mr: "॥ श्री क्षेत्र गोकर्ण महाबळेश्वर ज्योतिष पीठ • बग्गोण पंचांग प्रकाशन ॥",
    hi: "॥ श्री क्षेत्र गोकर्ण महाबलेश्वर ज्योतिष पीठ • बग्गोण पंचांग प्रकाशन ॥",
    te: "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర జ్యోతిష్య పీఠం • బగ్గోణ పంచాంగ ప్రచురణ ॥",
    ta: "✦ ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வரர் ஜோதிட பீடம் • பக்கோண பஞ்சாங்க வெளியீடு ✦",
    ml: "✦ ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര ജ്യോതിഷ പീഠം • ബഗ്ഗോണ പഞ്ചാംഗ പ്രകാശനം ✦",
    en: "|| Sri Kshetra Gokarna Mahabaleshwara Jyotishya Peetha • Baggona Panchanga Publication ||"
  }, targetLang);

  options?.onProgress?.(100, pick7({
    kn: "೨೫-ಅಧ್ಯಾಯಗಳ ಸಂಪೂರ್ಣ ಮಹಾ ಭವಿಷ್ಯ ವರದಿ ಸಿದ್ಧವಾಗಿದೆ!",
    mr: "२५-अध्यायांचा संपूर्ण महा भविष्य अहवाल तयार आहे!",
    hi: "२५-अध्यायों का संपूर्ण महा फलादेश प्रतिवेदन तैयार है!",
    te: "25-అధ్యాయాల సంపూర్ణ మహా భవిష్య నివేదిక సిద్ధమైంది!",
    ta: "25-அத்தியாயங்கள் கொண்ட முழுமையான ஜாதக அறிக்கை தயார்!",
    ml: "25-അധ്യായ സമ്പൂർണ്ണ മഹാ ജാതക റിപ്പോർട്ട് തയ്യാറായിരിക്കുന്നു!",
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
    title: pick7({
      kn: "ವಿಶೇಷ ಉಚಿತ ಕೊಡುಗೆ: ೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ 'ದೈನಂದಿನ ದರ್ಶನ' ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್",
      mr: "विशेष मोफत भेट: १५ दिवसांचे वैयक्तिक 'दैनिक दर्शन' गुगल कॅलेंडर",
      hi: "विशेष निःशुल्क उपहार: १५-दिवसीय व्यक्तिगत 'दैनिक दर्शन' गूगल कैलेंडर",
      te: "ప్రత్యేక ఉచిత బహుమతి: 15 రోజుల వ్యక్తిగత 'డైలీ దర్శన' గూగుల్ క్యాలెండర్",
      ta: "சிறப்பு இலவச பரிசு: 15 நாட்கள் தனிப்பயனாக்கப்பட்ட 'தினசரி தரிசனம்' கூகுள் காலண்டர்",
      ml: "പ്രത്യേക സൗജന്യ ബോണസ്: 15 ദിവസത്തെ വ്യക്തിഗത 'ദൈനിക് ദർശന' ഗൂഗിൾ കലണ്ടർ",
      en: "Exclusive Free Bonus: 15-Day Personalized 'Daily Darshana' Google Calendar"
    }, targetLang),
    badge: pick7({
      kn: "೧೫ ದಿನಗಳ ಉಚಿತ ಬೋನಸ್",
      mr: "१५ दिवसांचा मोफत बोनस",
      hi: "१५ दिनों का निःशुल्क बोनस",
      te: "15 రోజుల ఉచిత బోనస్",
      ta: "15 நாட்கள் இலவச போனஸ்",
      ml: "15 ദിവസത്തെ സൗജന്യ ബോണസ്",
      en: "15-Day Free Bonus"
    }, targetLang),
    priestTitle: priestBooking.priestTitle,
    priestName: priestBooking.priestName,
    priestPhone: "+91 94821 09844",
    priestPhoneDisplay: "+91 94821 09844",
    qrDataUrl: calendarQrDataUrl,
    googleCalendarUrl: calUrl,
    description: pick7({
      kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ, ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ಲಗ್ನಕ್ಕೆ ನಿಖರವಾಗಿ ಸರಿಹೊಂದುವಂತೆ ೧೫ ದಿನಗಳ ದೈನಂದಿನ ದರ್ಶನವನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಆಕ್ಟಿವೇಟ್ ಮಾಡಿಕೊಳ್ಳಲು ಕೆಳಗಿನ ಅಧಿಕೃತ ಕ್ಯೂಆರ್ ಸಂಕೇತವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
      mr: "आपल्या जन्म नक्षत्र, चंद्र रास व लग्नानुसार १५ दिवसांचे अचूक दैनिक दर्शन आपल्या मोबाईल कॅलेंडरवर जोडण्यासाठी खालील क्यूआर कोड स्कॅन करा.",
      hi: "अपने जन्म नक्षत्र, चंद्र राशि एवं लग्न के अनुसार १५ दिनों का सटीक दैनिक दर्शन अपने मोबाइल कैलेंडर में सक्रिय करने हेतु नीचे दिए गए क्यूआर कोड को स्कैन करें।",
      te: "మీ జన్మ నక్షత్రం, చంద్ర రాశి మరియు లగ్నానికి అనుగుణంగా 15 రోజుల దైనిక దర్శనాన్ని మీ మొబైల్ క్యాలెండర్‌లో యాక్టివేట్ చేసుకోవడానికి క్రింది క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
      ta: "உங்கள் பிறந்த நட்சத்திரம், ராசி மற்றும் லக்னத்திற்கு ஏற்ப 15 நாட்கள் தினசரி தரிசனத்தை உங்கள் போன் காலண்டரில் இணைக்க கீழே உள்ள கியூஆர் குறியீட்டை ஸ்கேன் செய்யவும்.",
      ml: "നിങ്ങളുടെ ജന്മനക്ഷത്രം, ചന്ദ്രരാശി, ലഗ്നം എന്നിവയ്ക്ക് അനുസൃതമായി തയ്യാറാക്കിയ 15 ദിവസത്തെ ദൈനിക് ദർശനം ഫോൺ കലണ്ടറിൽ ചേർക്കാൻ താഴെയുള്ള ഔദ്യോഗിക ക്യുആർ കോഡ് സ്കാൻ ചെയ്യുക.",
      en: "Scan the official QR code below to sync your personalized 15-Day Daily Darshana directly to your phone calendar, calculated mathematically for your exact birth coordinates."
    }, targetLang),
    features: [
      pick7({
        kn: "ದೈನಂದಿನ ತಾರಾಬಲ & ಶುಭ ತಾರೆ ನಿರ್ಣಯ (ಪ್ರತಿ ದಿನವೂ ನಿಮ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ಸಿಗುವ ಶುಭ ಬಲ)",
        mr: "दैनिक ताराबल व शुभ तारा विश्लेषण (दररोजचे नक्षत्र बल)",
        hi: "दैनिक ताराबल एवं शुभ तारा निर्णय (प्रतिदिन का नक्षत्र बल)",
        te: "రోజువారీ తారాబలం & శుభ తార నిర్ణయం (ప్రతిరోజు నక్షత్ర బలం)",
        ta: "தினசரி தாராபலம் & சுப தாரை கணிப்பு (நட்சத்திர பலன்)",
        ml: "നിങ്ങളുടെ ജന്മനക്ഷത്രത്തിനായുള്ള ദൈനംദിന താരാബലവും ശുഭനക്ഷത്ര നിർണ്ണയവും",
        en: "Daily Tarabala & Auspicious Star alignment for your Janma Nakshatra"
      }, targetLang),
      pick7({
        kn: "ಅಧಿಕೃತ ಶುಭ ಮುಹೂರ್ತ, ಅಮೃತ ಕಾಲ & ಅಭಿಜಿತ್ ಕಾಲದ ಸಮಯಾವಧಿ",
        mr: "शुभ मुहूर्त, अमृत काळ व अभिजित काळ वेळ",
        hi: "शुभ मुहूर्त, अमृत काल एवं अभिजित मुहूर्त का सटीक समय",
        te: "శుభ ముహూర్తం, అమృత కాలం & అభిజిత్ కాలం సమయాలు",
        ta: "சுப முகூர்த்தம், அமிர்த காலம் & அபிஜித் காலம் நேரம்",
        ml: "കൃത്യമായ ശുഭമുഹൂർത്തം, അമൃതകാലം, അഭിജിത് മുഹൂർത്ത സമയം",
        en: "Auspicious Muhurta, Amrita Kala & Abhijit Kala windows"
      }, targetLang),
      pick7({
        kn: "ವರ್ಜ್ಯ ಕಾಲ, ರಾಹು ಕಾಲ, ಗುಳಿಕ ಕಾಲ ಹಾಗೂ ಯಮಗಂಡ ಕಾಲದ ನಿಖರ ಗಂಟೆಗಳು",
        mr: "राहु काळ, गुलिक काळ व यमगंड काळ सावधानता वेळ",
        hi: "राहु काल, गुलिक काल एवं यमगंड काल का अचूक समय",
        te: "రాహు కాలం, గుళిక కాలం మరియు యమగండ కాలం సమయాలు",
        ta: "ராகு காலம், குளிகை காலம் மற்றும் எமகண்ட காலம் நேரம்",
        ml: "രാഹുകാലം, ഗുളികകാലം, യമകണ്ഠകാലം എന്നിവയുടെ കൃത്യസമയം",
        en: "Precise Rahu Kala, Gulika Kala, and Yamaganda Kala timings"
      }, targetLang),
      pick7({
        kn: "ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ೭:೦೦ ಗಂಟೆಗೆ ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ದೈನಂದಿನ ಜ್ಯೋತಿಷ್ಯ ಸೂಚನೆ",
        mr: "दररोज सकाळी ७:०० वाजता मोबाईलवर दैनिक अलर्ट",
        hi: "प्रतिदिन प्रातः ७:०० बजे आपके फोन पर दैनिक ज्योतिषीय सूचना",
        te: "ప్రతిరోజూ ఉదయం 7:00 గంటలకు ఫోన్‌లో దైనిక జ్యోతిష్య అలర్ట్",
        ta: "தினமும் காலை 7:00 மணிக்கு போனில் சிறப்பு தினசரி அறிவிப்பு",
        ml: "ദിവസവും രാവിലെ 7:00 മണിക്ക് ഫോണിൽ നേരിട്ട് ജ്യോതിഷ ഓർമ്മപ്പെടുത്തൽ",
        en: "Morning 7:00 AM Smart Astrological Reminder Notification directly on phone"
      }, targetLang)
    ],
    scanInstructions: pick7({
      kn: "ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗೂಗಲ್ ಲೆನ್ಸ್ ಮೂಲಕ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ' ಒತ್ತಿ.",
      mr: "कॅमेरा किंवा गुगल लेन्सने स्कॅन करून 'कॅलेंडरमध्ये जोडा' वर टॅप करा.",
      hi: "कैमरा अथवा गूगल लेंस से स्कैन करें और 'कैलेंडर में जोड़ें' पर टैप करें।",
      te: "కెమెరా లేదా గూగుల్ లెన్స్ ద్వారా స్కాన్ చేసి 'క్యాలెండర్‌లో చేర్చండి' నొక్కండి.",
      ta: "கேமரா அல்லது கூகுள் லென்ஸ் மூலம் ஸ்கேன் செய்து 'காலண்டரில் சேர்' தட்டவும்.",
      ml: "ഫോൺ ക്യാമറയോ ഗൂഗിൾ ലെൻസോ ഉപയോഗിച്ച് സ്കാൻ ചെയ്ത് 'കലണ്ടറിൽ ചേർക്കുക' ടാപ്പ് ചെയ്യുക.",
      en: "Scan with your phone camera or Google Lens and tap 'Add to Calendar'."
    }, targetLang),
    upsellNoticeTitle: pick7({
      kn: "೩೦ ದಿನಗಳ ಪೂರ್ಣ ಕ್ಯಾಲೆಂಡರ್ ಅಪ್‌ಗ್ರೇಡ್ ಸೂಚನೆ",
      mr: "३० दिवसांच्या पूर्ण कॅलेंडर अपग्रेड सूचना",
      hi: "३०-दिवसीय संपूर्ण कैलेंडर अपग्रेड सूचना",
      te: "30 రోజుల పూర్తి క్యాలెండర్ అప్‌గ్రేడ్ సమాచారం",
      ta: "30 நாட்கள் முழு காலண்டர் மேம்படுத்தல் அறிவிப்பு",
      ml: "30 ദിവസത്തെ സമ്പൂർണ്ണ കലണ്ടർ അപ്‌ഗ്രേഡ് അറിയിപ്പ്",
      en: "Full 30-Day Personal Calendar Desk Upgrade"
    }, targetLang),
    upsellNoticeText: pick7({
      kn: "ಬೋನಸ್: ಈ ವರದಿಯೊಂದಿಗೆ ೧೫ ದಿನಗಳ ವೈಯಕ್ತಿಕ 'ದೈನಂದಿನ ದರ್ಶನ' ಕ್ಯಾಲೆಂಡರ್ ಉಚಿತವಾಗಿ ಲಭ್ಯವಿದೆ. ಸಂಪೂರ್ಣ ೩೦ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಪ್ರತ್ಯೇಕವಾಗಿ ಬೇಕೇ? ಕ್ಯಾಶ್ ಡೆಸ್ಕ್‌ನಲ್ಲಿ ₹೩೦೦ ಪಾವತಿಸಿ ತಕ್ಷಣ ಪಡೆಯಿರಿ.",
      mr: "बोनस: या अहवालासोबत १५ दिवसांचे वैयक्तिक 'दैनिक दर्शन' कॅलेंडर मोफत मिळाले आहे. संपूर्ण ३० दिवसांचे वैयक्तिक कॅलेंडर स्वतंत्रपणे हवे असल्यास कॅश डेस्कवर ₹३०० भरून लगेच मिळवा.",
      hi: "बोनस: इस प्रतिवेदन के साथ १५ दिनों का व्यक्तिगत 'दैनिक दर्शन' कैलेंडर निःशुल्क उपलब्ध है। क्या संपूर्ण ३० दिनों का व्यक्तिगत कैलेंडर अलग से चाहते हैं? कैश डेस्क पर ₹३०० का भुगतान करके इसे तुरंत प्राप्त करें।",
      te: "బోనస్: ఈ నివేదికతో పాటు 15 రోజుల వ్యక్తిగత 'డైలీ దర్శన' క్యాలెండర్ ఉచితంగా అందించబడింది. పూర్తి 30 రోజుల వ్యక్తిగత క్యాలెండర్ ప్రత్యేకంగా కావాలా? క్యాష్ డెస్క్ వద్ద ₹300 చెల్లించి వెంటనే పొందండి.",
      ta: "போனஸ்: இந்த ஜாதக அறிக்கையுடன் 15 நாட்கள் தனிப்பயனாக்கப்பட்ட 'தினசரி தரிசனம்' காலண்டர் இலவசமாக வழங்கப்பட்டுள்ளது. முழு 30 நாட்கள் காலண்டர் தனித்தனியாக வேண்டுமா? கேஷ் கவுண்டரில் ₹300 செலுத்தி உடனடியாகப் பெற்றுக் கொள்ளுங்கள்.",
      ml: "ബോണസ്: ഈ ജാതക റിപ്പോർട്ടിനൊപ്പം 15 ദിവസത്തെ വ്യക്തിഗത 'ദൈനിക് ദർശന' കലണ്ടർ സൗജന്യമാണ്. മുഴുവൻ 30 ദിവസത്തെ വ്യക്തിഗത കലണ്ടറും വേണമെങ്കിൽ ക്യാഷ് ഡെസ്കിൽ 300 രൂപ നൽകി ഉടൻ നേടാവുന്നതാണ്.",
      en: "Bonus: Enjoy 15 days of personalized Daily Darshana Calendar FREE with this report. Want the full 30-Day Calendar separately? Pay ₹300 at the Cash Desk to get it instantly."
    }, targetLang)
  };

  const sectionIndexTitles = [
    {
      sectionNumber: 1,
      chapterRange: `${toNativeDigits("1–6", targetLang)}`,
      title: pick7({
        kn: "ತಕ್ಷಣದ ದೈವಿಕ ಸ್ಪಂದನೆ & ಆಂತರಿಕ ಸತ್ಯ ದರ್ಶನ",
        mr: "तात्काळ दैवी प्रचिती व गूढ सत्य दर्शन",
        hi: "तात्कालिक दिव्य अनुभूति एवं अंतस का सत्य",
        te: "తక్షణ దైవిక స్పందన & ఆంతరంగిక సత్య దర్శనం",
        ta: "உடனடி ஆச்சரியம் & அந்தரங்க ரகசிய தரிசனம்",
        ml: "ആന്തരിക സത്യദർശനവും ജീവിക്കുന്ന നിമിഷവും",
        en: "The Instant Hook — Living Moment & Hidden Truths"
      }, targetLang)
    },
    {
      sectionNumber: 2,
      chapterRange: `${toNativeDigits("7–11", targetLang)}`,
      title: pick7({
        kn: "ಕಾಲಚಕ್ರದ ಮಹಾಬಲ & ಗ್ರಹ ಗೋಚಾರ ವಾಸ್ತವ",
        mr: "कालचक्राचे महाबल व ग्रह गोचर वास्तव",
        hi: "कालचक्र का महाबल एवं ग्रह गोचर यथार्थ",
        te: "కాలచక్ర మహాబలం & గ్రహ గోచార వాస్తవం",
        ta: "காலச்சக்கர மகாபலம் & கிரக கோசார உண்மை",
        ml: "ഗ്രഹശക്തിയും ദശാ-ഗോചര യാഥാർത്ഥ്യവും",
        en: "Planetary Power Matrix — Active Dasha & Live Transits"
      }, targetLang)
    },
    {
      sectionNumber: 3,
      chapterRange: `${toNativeDigits("12–16", targetLang)}`,
      title: pick7({
        kn: "ಜೀವನದ ೫ ಪ್ರಮುಖ ಸ್ತಂಭಗಳ ಪ್ರಶ್ನೋತ್ತರ ವಿಶ್ಲೇಷಣೆ",
        mr: "आयुष्यातील ५ प्रमुख स्तंभांचे प्रश्नोत्तर विश्लेषण",
        hi: "जीवन के ५ प्रमुख स्तंभों का प्रश्नोत्तरी विश्लेषण",
        te: "జీవితంలోని 5 ముఖ్య స్తంభాల ప్రశ్నోత్తర విశ్లేషణ",
        ta: "வாழ்க்கையின் 5 முக்கிய தூண்கள் கேள்வி-பதில் ஆய்வு",
        ml: "ജീവിതത്തിലെ 5 പ്രധാന തൂണുകളുടെ അപഗ്രഥനം",
        en: "Key Life Domains — Age & Status Tailored Insights"
      }, targetLang)
    },
    {
      sectionNumber: 4,
      chapterRange: `${toNativeDigits("17–22", targetLang)}`,
      title: pick7({
        kn: "ಕಾಲಮಾನದ ಮಾರ್ಗಸೂಚಿ — ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ದಿಗಂತ",
        mr: "कालक्रमानुसार मार्गदर्शक — ५ वर्षांची सुवर्ण क्षितिजे",
        hi: "कालक्रम का रणनीतिक पथ — ५-वर्षीय स्वर्णिम क्षितिज",
        te: "కాలక్రమ మార్గదర్శి — 5 సంవత్సరాల భవిష్యత్ ప్రణాళిక",
        ta: "காலக்கோடு வழிகாட்டல் — 5 வருட பொற்காலம்",
        ml: "ഭാവി മാർഗ്ഗരേഖ — അടുത്ത 5 വർഷത്തെ ചക്രവാളം",
        en: "Strategic Roadmap — Near-Term & 5-Year Horizon"
      }, targetLang)
    },
    {
      sectionNumber: 5,
      chapterRange: `${toNativeDigits("23–25", targetLang)}`,
      title: pick7({
        kn: "ದೋಷ ಪರಿಹಾರ ರಹಸ್ಯ & ಮುಖ್ಯ ಅರ್ಚಕರ ಪರಮ ಆಶೀರ್ವಾದ",
        mr: "दोष निवारण रहस्य व मुख्य पुरोहितांचे परम आशीर्वाद",
        hi: "दोष निवारण रहस्य एवं मुख्य अर्चक का परम आशीर्वाद",
        te: "దోష నివారణ రహస్యం & ముఖ్య అర్చకుల దివ్య ఆశీర్వాదం",
        ta: "தோஷ நிவர்த்தி ரகசியம் & தலைமை அர்ச்சகரின் ஆசீர்வாதம்",
        ml: "ദോഷപരിഹാര രഹസ്യവും മുഖ്യ അർച്ചകന്റെ ആശിസ്സും",
        en: "Remedial Precision & Chief Astrologer's Final Verdict"
      }, targetLang)
    }
  ];

  const initialChapterPages: Record<number, number> = {};
  for (let ch = 1; ch <= 24; ch++) {
    initialChapterPages[ch] = ch + 3; // P1 Cover, P2 Index, P3 Details, P4..P27 Ch 1..24
  }
  initialChapterPages[25] = 29; // P28 is 15-day Calendar QR, P29 is Ch 25

  const precisionBadgeText = isChandraBasisOnly
    ? chandraTagLocalized
    : timePrecision === "approx_window"
      ? (options?.resolvedBtrSummary || pick7({
          kn: "BTR ಪರಿಷ್ಕೃತ ಸಮಯ",
          en: "BTR Rectified Window",
          hi: "BTR संशोधित समय",
          mr: "BTR निश्चित वेळ",
          te: "BTR సవరించిన సమయం",
          ta: "BTR திருத்தப்பட்ட நேரம்",
          ml: "BTR നിർണ്ണയിച്ച സമയം"
        }, targetLang))
      : undefined;

  const suryaRashiNameLocalized = RASHI_7L[((sunP.rashi.index % 12) + 12) % 12]?.[targetLang] || "";
  const effectiveDisplayTime = isChandraBasisOnly ? chandraTagLocalized : timePrecision === "approx_window" && options?.resolvedBtrSummary ? `${birthTime} (${options.resolvedBtrSummary})` : birthTime;

  return {
    devoteeName: localizedDevoteeName,
    rawName,
    birthDate,
    birthTime: effectiveDisplayTime,
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
    horaLord: isChandraBasisOnly ? `${suryaRashiNameLocalized}` : horaLordName,
    janmaHora: isChandraBasisOnly ? `${suryaRashiNameLocalized}` : janmaHora,
    livePrashnaHora,
    ayanamsha: ayanamshaName,
    currentMahadasha,
    currentBhukti: currentBhuktiLord,
    bhuktiEndDate,
    janmaDashaBalance,
    isDashaSandhi,
    yogiPlanet: yogiPlanetName,
    yogiNakshatra,
    yogiRashi: RASHI_7L[secretProfile.yogiRashi]?.[targetLang] || "Cancer",
    yogiColor: localizedYogiColor,
    yogiDirection: localizedYogiDirection,
    yogiDay: localizedYogiDay,
    yogiGemstone: localizedYogiGemstone,
    yogiDeity: localizedYogiDeity,
    avayogiPlanet: avayogiPlanetName,
    avayogiNakshatra,
    avayogiRashi: RASHI_7L[secretProfile.avayogiRashi]?.[targetLang] || "Gemini",
    bhriguBinduDegreeFormatted: `${bhriguDeg}°`,
    bhriguBinduRashi: bhriguBinduRashiName,
    bhriguBinduTurningWindow: `${now.getFullYear() + 1} - ${now.getFullYear() + 2}`,
    maandiHouse: isChandraBasisOnly ? (((sunP.rashi.index - lagnaRashiIdx + 12) % 12) + 1) : maandiHouse,
    maandiRashi: isChandraBasisOnly ? (options?.sankhyaSummary || suryaRashiNameLocalized) : maandiRashiName,
    hasMaandiKnot: !isChandraBasisOnly,
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
    activeDoshaProfiles,
    chartVisualMetrics,
    lagnaRashiIdx,
    moonRashiIdx,
    rawMahadashaPlanet: rawMaha,
    rawBhuktiPlanet: rawBhukti,
    heroSummary: {
      heroPlanetName,
      heroPlanetHouse,
      heroPlanetRashi,
      nearestColleagueName,
      nearestColleagueHouse,
      nearestColleagueRashi,
    },
    initialChapterPages,
    initialCalendarQrPage: 28,
    initialFinalBlessingPage: 30,
    chapters,
    narrativeVariant,
    isAiGenerated: Boolean(aiResult?.isAiGenerated),
    aiRunId: aiResult?.aiRunId,
    aiChaptersCount: aiResult?.aiChaptersCount ?? 0,
    timePrecision,
    precisionBadgeText,
    sankhyaSummary: options?.sankhyaSummary,
    laterTimeUpdateUrl: options?.laterTimeUpdateUrl,
    calendarQrSection,
    familyProtectionHook,
    priestBooking,
    footerText
  };
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
  lang: SevenLang
): { imgData: string; widthMm: number; heightMm: number } | null {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const fontMap: Record<SevenLang, string> = {
      kn: getIndicFontFamily7L("kn"),
      mr: getIndicFontFamily7L("mr"),
      hi: getIndicFontFamily7L("hi"),
      te: getIndicFontFamily7L("te"),
      ta: getIndicFontFamily7L("ta"),
      ml: getIndicFontFamily7L("ml"),
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
  lang?: SevenLang;
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
  const originalContainerStyle = containerEl.getAttribute("style") || "";
  const originalIndexPageTexts: Array<{ el: HTMLElement; text: string }> = [];

  // Exact Premium PDF V1 Continuous Royal Parchment Scroll Geometry
  const pdfWidthMm = 210;
  const borderClearanceMm = 10;
  const contentXMm = 8;
  const contentWidthMm = 194; // Leaves 2mm crisp gutter inside the 6mm inner border & 4mm outer border
  const MAX_SAFE_PAGE_CONTENT_MM = 4800 - borderClearanceMm * 2;

  try {
    if (parentEl) {
      parentEl.setAttribute(
        "style",
        "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFF7ED;"
      );
    }
    containerEl.setAttribute(
      "style",
      `${originalContainerStyle ? originalContainerStyle + ";" : ""} width: 900px; background-color: #FFF7ED;`
    );

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    const pendingImages = Array.from(containerEl.querySelectorAll("img"))
      .filter((img) => !img.complete)
      .map(
        (img) =>
          new Promise<void>((resolve) => {
            const timer = setTimeout(resolve, 2500);
            img.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
            img.addEventListener("error", () => { clearTimeout(timer); resolve(); }, { once: true });
          })
      );
    if (pendingImages.length > 0) {
      await Promise.all(pendingImages);
    }
    await new Promise((resolve) => setTimeout(resolve, 450));

    const rawSections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    const sections = rawSections.filter((s) => {
      const rect = s.getBoundingClientRect();
      return rect.height > 0 && s.style.display !== "none" && s.style.visibility !== "hidden";
    });

    if (sections.length < 5) {
      throw new Error(`Insufficient sections detected for 25-Chapter PDF (${sections.length} found). Rendering aborted.`);
    }

    interface ScrollSection {
      name: string;
      imgData: string;
      heightMm: number;
    }
    const renderedSections: ScrollSection[] = [];
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
        pick7({
          kn: `ಪುಟ ರಚನೆ (${i + 1}/${sections.length}): ${sectionName}...`,
          mr: `पृष्ठ निर्मिती (${i + 1}/${sections.length}): ${sectionName}...`,
          hi: `पृष्ठ निर्माण (${i + 1}/${sections.length}): ${sectionName}...`,
          te: `పేజీ నిర్మాణం (${i + 1}/${sections.length}): ${sectionName}...`,
          ta: `பக்க உருவாக்கம் (${i + 1}/${sections.length}): ${sectionName}...`,
          ml: `പേജ് നിർമ്മാണം (${i + 1}/${sections.length}): ${sectionName}...`,
          en: `Rendering Section (${i + 1}/${sections.length})...`,
        }, lang)
      );

      const canvas = await captureDomElementToCanvas(sectionEl, 40);
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const heightMm = (canvas.height * contentWidthMm) / canvas.width;
      renderedSections.push({
        name: sectionName,
        imgData: canvas.toDataURL("image/jpeg", 0.95),
        heightMm,
      });
      canvas.width = 0;
      canvas.height = 0;
    }

    const totalPdfHeightMm = renderedSections.reduce((sum, s) => sum + s.heightMm, 0);
    if (totalPdfHeightMm <= 0) {
      throw new Error("Calculated PDF height is zero. Cannot generate empty PDF.");
    }

    // Group sections cleanly across continuous scroll pages (max ~4800mm per page to stay safely inside jsPDF limits)
    const buildScrollPages = (items: ScrollSection[]) => {
      const out: Array<{ pageNumber: number; sections: ScrollSection[]; contentHeightMm: number }> = [];
      let curSecs: ScrollSection[] = [];
      let curH = 0;
      for (const sec of items) {
        if (curSecs.length > 0 && curH + sec.heightMm > MAX_SAFE_PAGE_CONTENT_MM) {
          out.push({ pageNumber: out.length + 1, sections: curSecs, contentHeightMm: curH });
          curSecs = [sec];
          curH = sec.heightMm;
        } else {
          curSecs.push(sec);
          curH += sec.heightMm;
        }
      }
      if (curSecs.length > 0) {
        out.push({ pageNumber: out.length + 1, sections: curSecs, contentHeightMm: curH });
      }
      return out;
    };

    let scrollPages = buildScrollPages(renderedSections);

    // Synchronize Index section page numbers + record hyperlink bounds cleanly
    const exactSectionPageMap: Record<string, number> = {};
    for (const p of scrollPages) {
      for (const s of p.sections) {
        if (!(s.name in exactSectionPageMap)) {
          exactSectionPageMap[s.name] = p.pageNumber;
        }
      }
    }

    const indexLinkItems: Array<{
      targetKey: string;
      leftRatio: number;
      topRatio: number;
      rightRatio: number;
      bottomRatio: number;
    }> = [];

    if (executiveIndexEl) {
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
          const idxPos = renderedSections.findIndex((s) => s.name === "executive-index");
          if (idxPos >= 0) {
            renderedSections[idxPos] = {
              name: "executive-index",
              imgData: idxCanvas.toDataURL("image/jpeg", 0.95),
              heightMm: (idxCanvas.height * contentWidthMm) / idxCanvas.width,
            };
            scrollPages = buildScrollPages(renderedSections);
          }
          idxCanvas.width = 0;
          idxCanvas.height = 0;
        }
      }

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

    const firstPageTotalHeightMm = scrollPages[0].contentHeightMm + borderClearanceMm * 2;
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidthMm, firstPageTotalHeightMm],
      compress: true,
    });

    const totalPages = scrollPages.length;
    const indexPlacements: Array<{ pdfPage: number; x: number; y: number; w: number; h: number }> = [];
    const exactSectionTargetCoords: Record<string, { pageNumber: number; yMm: number }> = {};

    for (let pIdx = 0; pIdx < scrollPages.length; pIdx++) {
      const page = scrollPages[pIdx];
      const pageHeightMm = page.contentHeightMm + borderClearanceMm * 2;
      if (pIdx > 0) {
        pdf.addPage([pdfWidthMm, pageHeightMm], "p");
      }

      // 1. Royal Warm Ivory Background (#FFF7ED) matching Premium PDF V1
      pdf.setFillColor(255, 247, 237);
      pdf.rect(0, 0, pdfWidthMm, pageHeightMm, "F");

      // 2. Stack every section continuously top-to-bottom cleanly (ZERO empty bottom gaps!)
      let currentYMm = borderClearanceMm;
      for (const sec of page.sections) {
        if (!(sec.name in exactSectionTargetCoords)) {
          exactSectionTargetCoords[sec.name] = { pageNumber: pIdx + 1, yMm: currentYMm };
        }
        pdf.addImage(sec.imgData, "JPEG", contentXMm, currentYMm, contentWidthMm, sec.heightMm, undefined, "FAST");
        if (sec.name === "executive-index") {
          indexPlacements.push({
            pdfPage: pIdx + 1,
            x: contentXMm,
            y: currentYMm,
            w: contentWidthMm,
            h: sec.heightMm,
          });
        }
        currentYMm += sec.heightMm;
      }

      // 3. Draw Outer & Inner Royal Gold Double Borders LAST (Exact Premium PDF V1 Style)
      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.75);
      pdf.rect(4, 4, pdfWidthMm - 8, pageHeightMm - 8, "S");

      pdf.setDrawColor(180, 83, 9);
      pdf.setLineWidth(0.25);
      pdf.rect(6, 6, pdfWidthMm - 12, pageHeightMm - 12, "S");
    }

    // Bind clickable Table of Contents internal hyperlinks
    for (const placement of indexPlacements) {
      for (const item of indexLinkItems) {
        const targetInfo = exactSectionTargetCoords[item.targetKey];
        if (!targetInfo || targetInfo.pageNumber < 1 || targetInfo.pageNumber > totalPages) continue;
        const linkX = placement.x + item.leftRatio * placement.w;
        const linkY = placement.y + item.topRatio * placement.h;
        const linkW = Math.max(10, (item.rightRatio - item.leftRatio) * placement.w);
        const linkH = Math.max(2, (item.bottomRatio - item.topRatio) * placement.h);
        pdf.setPage(placement.pdfPage);
        pdf.link(linkX, linkY, linkW, linkH, { pageNumber: targetInfo.pageNumber });
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
    if (originalContainerStyle) {
      containerEl.setAttribute("style", originalContainerStyle);
    } else {
      containerEl.removeAttribute("style");
    }
    if (parentEl) {
      parentEl.setAttribute("style", originalStyle);
    }
  }
}
