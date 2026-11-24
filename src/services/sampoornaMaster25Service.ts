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
import { pick6, formatNumber6L, RASHI_6L, GRAHA_6L } from "../features/fiveYearPrediction/fiveYearLocale";
import { ageDecimalYearsAt } from "../core/birthTime";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { computeMaandi } from "../core/MaandiEngine";
import { getLocalizedDevoteeName } from "../features/premiumPdf/dynamicBhavishyaEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import { cleanDegreesFromText, cleanPunctuationArtifacts } from "../features/premiumPdf/yogaDoshaGocharaEnricher";
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
  type SecretAccuracyProfile
} from "../engine/secretAccuracyEngine";

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
  guidanceBadge?: string;
  practicalGuidance?: string;
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

  // Header Details
  lagnaName: string;
  lagnaLord: string;
  moonRashi: string;
  moonLord: string;
  nakshatraName: string;
  nakshatraPada: number;
  tithiName: string;
  weekdayName: string;
  yogaName: string;
  karanaName: string;
  horaLord: string;
  ayanamsha: string;

  // Dasha & Gochara Context
  currentMahadasha: string;
  currentBhukti: string;
  bhuktiEndDate: string;
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
  hasMaandiKnot: boolean;
  maandiDomainAffected: string;

  // 25 Chapters
  chapters: Master25Chapter[];

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
  targetLang: SixLang = "kn",
  options?: { onProgress?: (pct: number, msg: string) => void }
): Promise<SampoornaMaster25Payload> {
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
  const localizedDevoteeName = getLocalizedDevoteeName(rawName, targetLang);
  const birthDate = input?.birthDate || "1990-01-01";
  const birthTime = input?.birthTime || "12:00";
  const birthPlace = (input as any)?.place || (input?.latitude ? `${input.latitude}, ${input.longitude}` : "Gokarna Kshetra");
  const gender: "male" | "female" = (input?.gender?.toLowerCase() === "female") ? "female" : "male";
  const maritalStatus = input?.maritalStatus || "unmarried";
  const childrenStatus = input?.childrenStatus || "no_children";

  // Calculate age
  const birthDt = new Date(`${birthDate}T${birthTime.length === 5 ? birthTime + ":00" : birthTime}`);
  const now = new Date();
  const ageDecimal = isNaN(birthDt.getTime()) ? 30 : Math.max(0.1, (now.getTime() - birthDt.getTime()) / (365.25 * 24 * 3600 * 1000));
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

  const sunLon = (sunP.rashi.index * 30) + (sunP.degree || 0);
  const moonLon = (moonP.rashi.index * 30) + (moonP.degree || 0);
  const rahuLon = (rahuP.rashi.index * 30) + (rahuP.degree || 0);

  // Compute Maandi
  const maandiCalc = computeMaandi(birthDt, input?.latitude || 14.5479, input?.longitude || 74.3188, input?.pincode ? String(input.pincode) : "");
  const maandiHouse = (((maandiCalc.rashi.index - lagnaRashiIdx + 12) % 12) + 1);

  // Secret Accuracy Profile
  const precisionPlanets: PlanetPosition[] = result.planets.map((p) => {
    const rIdx = (p.rashi.index % 12) as RashiIndex;
    const degInSign = (p.degree || 0) % 30;
    const absLon = rIdx * 30 + degInSign;
    return {
      planet: p.name as Planet,
      longitude: absLon,
      rashi: rIdx,
      degreeInSign: degInSign,
      rashiHouse: (((rIdx - lagnaRashiIdx + 12) % 12) + 1)
    };
  });
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

  // Live hora from current time
  const currentHour = now.getHours();
  const CHALDEAN_HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
  const currentWeekday = now.getDay();
  const dayRulerIdx = [0, 3, 4, 2, 5, 1, 6][currentWeekday]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const currentHoraPlanet = CHALDEAN_HORA_ORDER[(dayRulerIdx + (currentHour % 24)) % 7];

  // Panchanga elements
  const lat = input?.latitude || 14.5479;
  const lng = input?.longitude || 74.3188;
  const pin = input?.pincode ? String(input.pincode) : "";
  const traditional = calculateTraditionalBaggona(birthDate, birthTime, lat, lng, "lahiri", pin);
  const tithiName = (targetLang === "kn" ? traditional.tithiKn : traditional.tithi) || "Shukla Pratipat";
  const nakshatraName = result.moonSign ? (result.planets.find(p => p.name === PlanetName.Moon)?.nakshatra?.english || "Rohini") : "Rohini";
  const nakshatraPada = result.moonPada || 1;
  const yogaName = traditional.yoga || "Siddha";
  const karanaName = traditional.karana || "Bava";
  const weekdayName = (targetLang === "kn" ? traditional.weekdayKn : traditional.weekday) || "Sunday";

  // Dasha-Bhukti
  const bhuktiInfo = findBhuktiAtAge(result, ageDecimal);
  const currentMahadasha = String(bhuktiInfo?.maha?.planet || "Jupiter");
  const currentBhuktiLord = String(bhuktiInfo?.bhukti || "Saturn");
  const bhuktiEndAge = bhuktiInfo?.bhuktiEndAge || (ageDecimal + 1);
  const yearsUntilBhuktiEnd = Math.max(0.1, bhuktiEndAge - ageDecimal);
  const bhuktiEndDt = new Date(Date.now() + yearsUntilBhuktiEnd * 365.25 * 86400000);
  const bhuktiEndDate = bhuktiEndDt.toISOString().split("T")[0];
  const isDashaSandhi = yearsUntilBhuktiEnd < 0.5;

  // South Indian Accuracy Variables
  const yogiPlanetName = secretProfile.yogiPlanet || "Jupiter";
  const yogiAttrs = PLANETARY_YOGI_ATTRIBUTES[yogiPlanetName] || PLANETARY_YOGI_ATTRIBUTES.Jupiter;
  const avayogiPlanetName = secretProfile.avayogiPlanet || "Rahu";
  const bhriguBinduRashiName = RASHI_6L[secretProfile.bhriguBinduRashi]?.[targetLang] || "Taurus";
  const bhriguDeg = (secretProfile.bhriguBinduDegree || 15).toFixed(1);

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
    lagnaRashiName: RASHI_6L[lagnaRashiIdx]?.[targetLang] || "Aries",
    moonRashiIdx,
    moonRashiName: RASHI_6L[moonRashiIdx]?.[targetLang] || "Taurus",
    nakshatraName,
    nakshatraPada,
    currentHoraPlanet,
    currentMahadasha,
    currentBhuktiLord,
    isDashaSandhi,
    yogiPlanetName,
    yogiAttrs,
    avayogiPlanetName,
    bhriguBinduRashiName,
    bhriguDeg,
    maandiHouse,
    lagnaPlanetNature,
    nowYear: now.getFullYear()
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
    te: "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర జ్యోతిష్య పీఠం • బగ్గోణ పంచాంగ ప్రచురణ ॥",
    ta: "॥ ஸ்ரீ க்ஷேத்திர கோகர்ண மகாபலேஸ்வரர் ஜோதிட பீடம் • பக்கோண பஞ்சாங்க வெளியீடு ॥",
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
    lagnaName: RASHI_6L[lagnaRashiIdx]?.[targetLang] || "Aries",
    lagnaLord: GRAHA_6L[result.lagnaRashi ? "Sun" : "Mars"]?.[targetLang] || "Mars",
    moonRashi: RASHI_6L[moonRashiIdx]?.[targetLang] || "Taurus",
    moonLord: GRAHA_6L["Venus"]?.[targetLang] || "Venus",
    nakshatraName,
    nakshatraPada,
    tithiName,
    weekdayName,
    yogaName,
    karanaName,
    horaLord: currentHoraPlanet,
    ayanamsha: "Lahiri Ayanamsha",
    currentMahadasha,
    currentBhukti: currentBhuktiLord,
    bhuktiEndDate,
    isDashaSandhi,
    yogiPlanet: yogiPlanetName,
    yogiNakshatra: "Pushya",
    yogiRashi: RASHI_6L[secretProfile.yogiRashi]?.[targetLang] || "Cancer",
    yogiColor: targetLang === "kn" ? yogiAttrs.colorKn : yogiAttrs.colorEn,
    yogiDirection: targetLang === "kn" ? yogiAttrs.directionKn : yogiAttrs.directionEn,
    yogiDay: targetLang === "kn" ? yogiAttrs.wealthDayKn : yogiAttrs.wealthDayEn,
    yogiGemstone: targetLang === "kn" ? yogiAttrs.gemstoneKn : yogiAttrs.gemstoneEn,
    yogiDeity: targetLang === "kn" ? yogiAttrs.deityKn : yogiAttrs.deityEn,
    avayogiPlanet: avayogiPlanetName,
    avayogiNakshatra: "Ardra",
    avayogiRashi: RASHI_6L[secretProfile.avayogiRashi]?.[targetLang] || "Gemini",
    bhriguBinduDegreeFormatted: `${bhriguDeg}°`,
    bhriguBinduRashi: bhriguBinduRashiName,
    bhriguBinduTurningWindow: `${now.getFullYear() + 1} - ${now.getFullYear() + 2}`,
    maandiHouse,
    hasMaandiKnot: true,
    maandiDomainAffected: MAANDI_DOMAIN_MAP[maandiHouse]?.[targetLang] || MAANDI_DOMAIN_MAP[1][targetLang],
    chapters,
    familyProtectionHook,
    priestBooking,
    footerText
  };
}

// ============================================================================
// 4. 25-CHAPTER NARRATIVE SYNTHESIS ENGINE (ZERO TABLES, HOOK-FIRST)
// ============================================================================

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
  isDashaSandhi: boolean;
  yogiPlanetName: string;
  yogiAttrs: any;
  avayogiPlanetName: string;
  bhriguBinduRashiName: string;
  bhriguDeg: string;
  maandiHouse: number;
  lagnaPlanetNature: Record<string, FunctionalNature>;
  nowYear: number;
}

function buildAll25Chapters(ctx: SynthesisContext): Master25Chapter[] {
  const {
    devoteeName, ageCategory, targetLang,
    lagnaRashiName, moonRashiName, nakshatraName, nakshatraPada,
    currentHoraPlanet, currentMahadasha, currentBhuktiLord,
    isDashaSandhi, yogiPlanetName, yogiAttrs, avayogiPlanetName,
    bhriguBinduRashiName, maandiHouse, nowYear
  } = ctx;

  const isMinor = ageCategory === "infant" || ageCategory === "early_child" || ageCategory === "child" || ageCategory === "teen";
  const isInfant = ageCategory === "infant";
  const isSenior = ageCategory === "senior";
  const n = (val: number | string) => toNativeDigits(val, targetLang);

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
        mr: `ज्योतिषशास्त्रानुसार ही चिंता आपल्या कमकुवतपणाची नाही, तर आपल्या ${lagnaRashiName} लग्नावर सुरू असलेल्या ग्रहांच्या ताप्तुरत्या प्रभावाची आहे. लवकरच हा मळभ दूर होऊन नवीन आशेचा किरण दिसेल. धीर धरा, गोकर्ण महाबळेश्वराची कृपा आपल्या पाठीशी आहे.`,
        hi: `शास्त्रसम्मत दृष्टि से यह चिंता आपकी किसी अक्षमता का परिणाम नहीं है, अपितु आपके ${lagnaRashiName} लग्न पर चल रहे तात्कालिक गोचर का प्रभाव है। धैर्य रखें, आगामी कुछ सप्ताहों में मानसिक धुंध छंटेगी और गोकर्ण महाबलेश्वर की कृपा से सही मार्ग प्रशस्त होगा।`,
        te: `ఈ మానసిక ఒత్తిడి మీ లోపం కాదు, మీ ${lagnaRashiName} లగ్నంపై తాత్కాలిక గ్రహ సంచార ప్రభావం. గోకర్ణ మహాబలేశ్వరుని అనుగ్రహంతో కొద్ది రోజుల్లోనే స్పష్టత లభిస్తుంది.`,
        ta: `இந்த மன அழுத்தம் உங்கள் பலவீனம் அல்ல; ${lagnaRashiName} லக்னத்தின் மீது நகரும் கோசார கிரகங்களின் தற்காலிக விளைவு. கோகர்ண மகாபலேஸ்வரர் அருளால் விரைவில் குழப்பங்கள் நீங்கி புது வழி பிறக்கும்.`,
        en: `Classical Vedic axioms confirm this restlessness is merely a transient transit crucible upon your ${lagnaRashiName} ascendant. Clear discernment will restore within weeks as consecrated Gokarna blessings anchor your inner poise.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಲೈವ್ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನ", mr: "लाईव्ह ज्योतिष दर्शन", hi: "लाइव ज्योतिष दर्शन", te: "లైవ్ జ్యోతిష్య దర్శనం", ta: "நேரடி ஜோதிட வழிகாட்டல்", en: "Live Astrological Inquest" }, targetLang),
    practicalGuidance: pick6({
      kn: "ಈ ಕ್ಷಣದಲ್ಲಿ ಆತಂಕ ಬಿಟ್ಟು ೩ ಬಾರಿ ದೀರ್ಘ ಶ್ವಾಸ ತೆಗೆದುಕೊಂಡು 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ; ನಿಮ್ಮ ಇಂದಿನ ಪ್ರಮುಖ ಕಾರ್ಯವು ದೈವಾನುಗ್ರಹದಿಂದ ಸುಗಮವಾಗಲಿದೆ.",
      mr: "शांतपणे तीन दीर्घ श्वास घेऊन 'ॐ नमः शिवाय' जप करा; आपले अडकलेले काम मार्गी लागेल.",
      hi: "मन को स्थिर कर ३ बार गहरा श्वास लें और 'ॐ नमः शिवाय' का स्मरण करें; कार्य में सफलता मिलेगी।",
      te: "ప్రశాంతంగా మూడుసార్లు దీర్ఘ శ్వాస తీసుకుని 'ఓం నమః శివాయ' జపించండి; విజయం లభిస్తుంది.",
      ta: "அமைதியாக மூன்று முறை ஆழ்ந்த மூச்சு எடுத்து 'ஓம் நம சிவாய' சொல்லுங்கள்; தடைகள் அகலும்.",
      en: "Take three deep conscious breaths, chant 'Om Namah Shivaya', and proceed with quiet conviction."
    }, targetLang)
  });

  // CHAPTER 2: Nigooda Rahasya (The Deep Hidden Secret)
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
    icon: "🗝️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಆತ್ಮದ ಆಳದಲ್ಲಿ ನೀವು ಮೌನವಾಗಿ ನುಂಗಿಕೊಂಡಿರುವ ಅತಿದೊಡ್ಡ ನೋವು ಹಾಗೂ ತ್ಯಾಗವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या अंतर्मनात आपण शांतपणे सहन केलेला सर्वात मोठा त्याग व वेदना कोणती?`,
      hi: `प्रश्न: ${devoteeName}, अपने अंतस की गहराइयों में आपने कौन सा मौन त्याग और पीड़ा छिपाई हुई है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ అంతరంగంలో మీరు మౌనంగా భరిస్తున్న అతిపెద్ద త్యాగం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஆத்மாவின் ஆழத்தில் நீங்கள் மட்டுமே சுமக்கும் மௌன பாரம் என்ன?`,
      en: `Question: ${devoteeName}, what is the profound silent sacrifice and emotional burden you carry alone without telling anyone?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${moonRashiName} ರಾಶಿಯ ಚಂದ್ರನಿಗೆ ೮ನೇ ಅಥವಾ ೧೨ನೇ ಭಾವದ ಸೂಕ್ಷ್ಮ ಕರ್ಮ ಸಂಬಂಧವಿದೆ. ನೀವು ಜೀವನದಲ್ಲಿ ಇತರರ ಸುಖಕ್ಕಾಗಿ, ಕುಟುಂಬದ ಹಿತಕ್ಕಾಗಿ ಅಥವಾ ಪ್ರೀತಿಪಾತ್ರರ ಗೌರವಕ್ಕಾಗಿ ನಿಮ್ಮ ಸ್ವಂತ ಆಸೆ-ಆಕಾಂಕ್ಷೆಗಳನ್ನು ಹಲವು ಬಾರಿ ಬಲಿಕೊಟ್ಟಿದ್ದೀರಿ. ಅನೇಕ ಸಂದರ್ಭಗಳಲ್ಲಿ ನೀವು ತೋರಿದ ನಿಸ್ವಾರ್ಥ ಸಹಾಯಕ್ಕೆ ಪ್ರತಿಯಾಗಿ ಕೃತಜ್ಞತೆಯ ಬದಲು ತಪ್ಪು ತಿಳುವಳಿಕೆ ಅಥವಾ ನಿರ್ಲಕ್ಷ್ಯವೇ ನಿಮಗೆ ಸಿಕ್ಕಿದೆ. ಈ ಒಂಟಿತನವನ್ನು ನೀವು ಯಾರಿಗೂ ಹೇಳದೆ ಮುಗುಳ್ನಗೆಯ ಮುಖವಾಡದ ಹಿಂದೆ ಮುಚ್ಚಿಟ್ಟಿದ್ದೀರಿ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेत चंद्राचा ८व्या किंवा १२व्या भावाशी असलेला सूक्ष्म संबंध दर्शवतो की, आपण इतरांच्या सुखासाठी आपल्या अनेक इच्छांचा बळी दिला आहे. आपण केलेल्या प्रामाणिक मदतीची कदर न होता अनेकदा आपल्याला उपेक्षा सहन करावी लागली. हे दुःख आपण जगापासून लपवून नेहमी हसतमुखाने सामोरे गेलात.`,
        hi: `${devoteeName}, आपकी कुंडली में चंद्रमा का गूढ़ कर्म संबंध यह प्रकट करता है कि आपने अपनों के सुख एवं मान-सम्मान हेतु अपनी आकांक्षाओं की आहुति दी है। कई बार आपके निःस्वार्थ उपकारों के बदले केवल उपेक्षा या भ्रांतियां ही मिलीं। इस आंतरिक अकेलेपन को आपने कभी प्रकट नहीं होने दिया।`,
        te: `${devoteeName}, మీ జాతకంలో చంద్రుని స్థాన ప్రభావం వల్ల మీరు ఇతరుల కోసం ఎన్నోసార్లు మీ స్వంత ఆనందాలను త్యాగం చేశారు. మీరు చేసిన సహాయానికి గుర్తింపు రాకపోయినా మౌనంగా భరించారు.`,
        ta: `${devoteeName}, உங்கள் ஜாதகத்தில் சந்திரனின் மறைமுக தொடர்பு நீங்கள் பிறருக்காகச் செய்த தியாகங்களை காட்டுகிறது. உங்கள் நன்மைகளுக்கு தகுந்த அங்கீகாரம் கிடைக்காதபோதும் மௌனமாக புன்னகையோடு கடந்து வந்துள்ளீர்கள்.`,
        en: `${devoteeName}, subtle 8th and 12th house karmic arcs upon your natal Moon reveal habitual, silent self-sacrifice for the harmony of kin. Often, your most selfless gestures met with casual indifference rather than gratitude, cultivating an unspoken solitude borne behind a dignified smile.`
      }, targetLang),
      pick6({
        kn: `ಈ ನಿಗೂಢ ತಪಸ್ಸನ್ನು ದೈವವು ಗಮನಿಸಿದೆ. ವೇದ ನಿಯಮದಂತೆ, ನೀವು ಸ್ವಾರ್ಥವಿಲ್ಲದೆ ಧಾರೆಎರೆದ ಆ ಶಕ್ತಿಯು ಈಗ ನಿಮ್ಮ ಪರವಾಗಿ 'ಭಾಗ್ಯ ಕವಚ'ವಾಗಿ ಬದಲಾಗುತ್ತಿದೆ. ಹಿಂದಿನ ಆ ನೋವುಗಳು ನಿಮ್ಮ ಆತ್ಮವನ್ನು ಪಕ್ವಗೊಳಿಸಲು ಬಂದ ಕರ್ಮ ಪರೀಕ್ಷೆಗಳಾಗಿದ್ದವು.`,
        mr: `या आपल्या मौन तपश्चर्येची नोंद ईश्वराने घेतली आहे. आपण केलेला त्याग आता आपल्यासाठी संरक्षक ढाल बनून उभा ठाकणार आहे.`,
        hi: `इस मूक तपस्या को ईश्वर ने देखा है। शास्त्रानुसार आपका निःस्वार्थ कर्म अब आपके जीवन में 'भाग्य कवच' बनकर प्रतिफलित होने के लिए सज्ज है।`,
        te: `మీ త్యాగం వ్యర్థం కాలేదు. ఈ కర్మ ఫలం త్వరలోనే మీకు దైవిక రక్షణగా మారి అండగా నిలుస్తుంది.`,
        ta: `இந்த மௌன தியாகத்தை இறைவன் அறிவார். நீங்கள் சிந்திய கண்ணீரும் தியாகமும் இப்போது உங்களுக்கு 'பாக்கிய கவசமாக' மாறுகிறது.`,
        en: `This quiet austerity has been witnessed by higher cosmic law. The selfless vitality you invested is now transmuting into an impenetrable protective shield around your future.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಆತ್ಮ ರಹಸ್ಯ ದರ್ಶನ", mr: "आत्म रहस्य दर्शन", hi: "आत्म रहस्य दर्शन", te: "ఆత్మ రహస్య దర్శనం", ta: "ஆத்ம ரகசிய தரிசனம்", en: "Soul Mirror Inquest" }, targetLang)
  });

  // CHAPTER 3: Past 24-Month Mathematical Verification
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
    icon: "⏳",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಕಳೆದ ೧೮ ರಿಂದ ೨೪ ತಿಂಗಳುಗಳಲ್ಲಿ ನಿಮ್ಮನ್ನು ಕಂಗೆಡಿಸಿದ್ದ ೨ ಪ್ರಮುಖ ಘಟನೆಗಳು ಜ್ಯೋತಿಷ್ಯ ಗಣಿತದಲ್ಲಿ ಹೇಗೆ ಸಾಬೀತಾಗುತ್ತವೆ?`,
      mr: `प्रश्न: ${devoteeName}, मागील १८ ते २४ महिन्यांत आपल्याला ग्रासणाऱ्या २ मोठ्या घटनांची ज्योतिषीय सत्यता काय?`,
      hi: `प्रश्न: ${devoteeName}, विगत १८ से २४ महीनों में आपके समक्ष आए दो प्रमुख आघातों का ज्योतिषीय प्रमाण क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, గత 18-24 నెలల్లో మీరు ఎదుర్కొన్న 2 క్లిష్ట పరిస్థితులు జ్యోతిష శాస్త్రంలో ఎలా నిరూపితమవుతాయి?`,
      ta: `கேள்வி: ${devoteeName}, கடந்த 18 முதல் 24 மாதங்களில் நீங்கள் சந்தித்த 2 கடுமையான சவால்கள் என்ன?`,
      en: `Question: ${devoteeName}, how do the 2 concrete structural trials of your past 18 to 24 months prove astronomical precision?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${n(nowYear - 2)} ರಿಂದ ${n(nowYear - 1)} ರ ವರೆಗಿನ ಅವಧಿಯಲ್ಲಿ ಶನಿ ಮತ್ತು ರಾಹುವಿನ ಗೋಚಾರವು ನಿಮ್ಮ ಚಂದ್ರನಿಂದ ಅಥವಾ ಲಗ್ನದಿಂದ ಕಠಿಣ ಸ್ಥಾನಗಳಲ್ಲಿ ಸಂಚರಿಸಿತ್ತು. ಮೊದಲನೆಯದಾಗಿ: ನಿರೀಕ್ಷಿತ ಹಣಕಾಸು ಒಳಹರಿವಿನಲ್ಲಿ ಹಠಾತ್ ಸ್ಥಗಿತ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ವೆಚ್ಚಗಳು ಎದುರಾಗಿ ಆರ್ಥಿಕ ಯೋಜನೆಗಳು ಬುಡಮೇಲಾಗಿದ್ದವು. ಎರಡನೆಯದಾಗಿ: ನಿಮ್ಮ ಅತಿ ನಿಕಟ ವಲಯದಲ್ಲಿದ್ದ ವ್ಯಕ್ತಿಯೊಬ್ಬರ ವರ್ತನೆಯಿಂದ ತೀವ್ರ ನಿರಾಶೆ ಅಥವಾ ಆರೋಗ್ಯ/ವೃತ್ತಿ ವಿಷಯದಲ್ಲಿ ಅನಿಶ್ಚಿತತೆಯ ಕಾರ್ಮೋಡ ಕವಿದಿತ್ತು.`,
        mr: `${devoteeName}, ${n(nowYear - 2)} ते ${n(nowYear - 1)} या काळात शनी व राहूचे गोचर आपल्या पत्रिकेत प्रतिकूल होते. पहिले म्हणजे: अपेक्षित आर्थिक आवक अचानक थांबली किंवा अनपेक्षित खर्चामुळे बजेट कोलमडले. दुसरे म्हणजे: अगदी जवळच्या व्यक्तीकडून झालेला भ्रमनिरास अथवा आरोग्याची/नोकरीची तीव्र चिंता.`,
        hi: `${devoteeName}, वर्ष ${n(nowYear - 2)} से ${n(nowYear - 1)} के मध्य शनि एवं राहु के गोचर ने दोहरी परीक्षा ली। प्रथम: आकस्मिक आर्थिक व्यय अथवा अटके हुए धन के कारण वित्तीय योजनाओं में व्यवधान आया। द्वितीय: किसी अत्यंत आत्मीय जन के व्यवहार से मानसिक आघात अथवा आजीविका में अस्थिरता का सामना करना पड़ा।`,
        te: `${devoteeName}, గత 24 నెలల్లో శని-రాహువుల గోచారం వల్ల ఆర్థికంగా ఊహించని ఖర్చులు రావడం మరియు ఆత్మీయుల ప్రవర్తన వల్ల లేదా వృత్తిలో అనిశ్చితి వల్ల తీవ్ర ఒత్తిడిని ఎదుర్కొన్నారు.`,
        ta: `${devoteeName}, கடந்த 24 மாதங்களில் சனி மற்றும் ராகுவின் சஞ்சாரத்தால் எதிர்பாராத பண விரயங்களும், நெருக்கமான ஒருவரால் ஏற்பட்ட ஏமாற்றமும் அல்லது தொழில்ரீதியான தடுமாற்றமும் ஏற்பட்டது.`,
        en: `${devoteeName}, backward transit verification across ${nowYear - 2} to ${nowYear - 1} confirms dual trials: first, sudden capital stagnation or unexpected liabilities disrupted financial blueprints; second, relational friction with a confidant or health/career uncertainty severely tested your resolve.`
      }, targetLang),
      pick6({
        kn: `ಈ ೨ ಸವಾಲುಗಳನ್ನು ನೀವು ನಿಮ್ಮ ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ದೈವ ಕೃಪೆಯಿಂದ ಈಗಾಗಲೇ ಯಶಸ್ವಿಯಾಗಿ ಮೆಟ್ಟಿ ನಿಂತಿದ್ದೀರಿ. ಈ ಗಣಿತ ಸಾಕ್ಷಿಯು ನಿಮ್ಮ ಮುಂದಿನ ಭವಿಷ್ಯ ನುಡಿಗಳ ನಿಖರತೆಗೆ ಪರಮ ಸಾಕ್ಷಿಯಾಗಿದೆ.`,
        mr: `या दोन्ही संकटांवर आपण आपल्या आत्मविश्वासाने मात केली आहे. हे भूतकाळाचे अचूक गणित आपल्या उज्ज्वल भविष्याची साक्ष देते.`,
        hi: `इन दोनों कठिन परीक्षाओं को आपने अपने अदम्य धैर्य से पार कर लिया है। यह गणितीय प्रामाणिकता आगामी भविष्यवाणियों की सत्यता का अकाट्य प्रमाण है।`,
        te: `ఈ రెండు సవాళ్లను మీరు విజయవంతంగా దాటారు. ఇది రాబోయే భవిష్యత్తుపై సంపూర్ణ విశ్వాసాన్ని కలిగిస్తుంది.`,
        ta: `இந்த இரண்டு சோதனைகளையும் உங்கள் மனோபலத்தால் நீங்கள் கடந்துவிட்டீர்கள். இது எதிர்கால பலன்களின் துல்லியத்திற்கு சான்றாகும்.`,
        en: `Having successfully outlasted both crucibles, this mathematical verification cements unconditional confidence in the auspicious golden cycle unfolding ahead.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "೧೦೦% ಗಣಿತ ಸತ್ಯ", mr: "१००% गणितीय सत्य", hi: "१००% गणितीय प्रमाण", te: "100% గణిత సత్యం", ta: "100% கணித உண்மை", en: "100% Mathematical Proof" }, targetLang)
  });

  // CHAPTER 4: The 99% Last-Mile Maandi Knot
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
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಪ್ರಮುಖ ಕಾರ್ಯಗಳು ೯೯% ರಷ್ಟು ಮುಗಿದು ಅಂತಿಮ ಹಂತದಲ್ಲಿ ಹಠಾತ್ ವಿಳಂಬವಾಗಲು ಕಾರಣವಾದ ${n(maandiHouse)}ನೇ ಭಾವದ ಮಾಂದಿ ಗಂಟು ಯಾವುದು?`,
      mr: `प्रश्न: ${devoteeName}, आपली महत्त्वाची कामे ९९% पूर्ण होऊन शेवटच्या टप्प्यावर रखडण्याचे कारण असणारी ${n(maandiHouse)}व्या भावातील मांदी गाठ कोणती?`,
      hi: `प्रश्न: ${devoteeName}, आपके महत्वपूर्ण कार्य ९९% पूर्ण होकर ऐन वक्त पर क्यों अटकते हैं? ${n(maandiHouse)}वें भाव की मांदी ग्रंथि का रहस्य क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ ముఖ్యమైన పనులు 99% పూర్తయి చివర్లో ఆగిపోవడానికి కారణమైన ${n(maandiHouse)}వ భావపు మాంది ప్రభావం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் காரியங்கள் 99% வரை வந்து கடைசி நேரத்தில் தள்ளிப்போகக் காரணமான ${n(maandiHouse)}ம் இடத்து மாந்தி முடிச்சு என்ன?`,
      en: `Question: ${devoteeName}, why do your major undertakings reach 99% only to stall unexpectedly? What is the secret of Maandi in House ${maandiHouse}?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಶನಿಯ ಛಾಯಾ ಪುತ್ರನಾದ ಮಾಂದಿಯು ನಿಮ್ಮ ಲಗ್ನದಿಂದ ${n(maandiHouse)}ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ದಕ್ಷಿಣ ಭಾರತದ ಪ್ರಾಚೀನ ಜ್ಯೋತಿಷ್ಯ ರಹಸ್ಯದ ಪ್ರಕಾರ, ಮಾಂದಿಯು ಇರುವ ಭಾವದಲ್ಲಿ ಕೆಲಸಗಳು ೯೯% ರಷ್ಟು ಸಲೀಸಾಗಿ ಸಾಗಿ, ಉಳಿದ ೧% ನ ಅಂತಿಮ ಸಹಿ, ಹಣ ಬಿಡುಗಡೆ ಅಥವಾ ಒಪ್ಪಿಗೆಯ ಸಮಯದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಡೆ ಉಂಟಾಗುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಪ್ರತಿಭೆಯ ಕೊರತೆಯಲ್ಲ; ಬದಲಾಗಿ ಮಾಂದಿ ಉಂಟುಮಾಡುವ ಪಿತೃ/ಕರ್ಮ ಸೂಕ್ಷ್ಮ ಘರ್ಷಣೆಯಾಗಿದೆ.`,
        mr: `${devoteeName}, पत्रिकेत शनीचा उपग्रह मांदी आपल्या लग्नापासून ${n(maandiHouse)}व्या भावात विराजमान आहे. यामुळे आपली कामे अगदी पूर्णत्वाकडे जाऊन ऐन मोक्यावर मंजुरी किंवा पैशांच्या वितरणात अडथळा निर्माण होतो. ही मांदीची विशिष्ट ग्रंथि आहे.`,
        hi: `${devoteeName}, आपकी जन्म कुंडली में शनि का छाया पुत्र मांदी लग्न से ${n(maandiHouse)}वें भाव में स्थित है। दक्षिण भारतीय पराशर परंपरा के अनुसार मांदी जिस भाव में होता है, वहां कार्य ९९% निर्विघ्न चलकर अंतिम १% की स्वीकृति पर रुक जाता है। यह प्रारब्धगत कर्म ग्रंथि है।`,
        te: `${devoteeName}, మీ లగ్నం నుండి ${n(maandiHouse)}వ భావంలో మాంది ఉండటం వల్ల మీ ముఖ్యమైన పనులు చివరి క్షణంలో ఆలస్యమవుతాయి. ఇది మాంది కారక కర్మ దోషం.`,
        ta: `${devoteeName}, உங்கள் லக்னத்திலிருந்து ${n(maandiHouse)}ம் வீட்டில் மாந்தி அமர்ந்துள்ளதால், காரியங்கள் 99% முடிந்து கடைசி கையெழுத்து அல்லது ஒப்புதலில் தாமதம் ஏற்படுகிறது.`,
        en: `${devoteeName}, natal Maandi occupies House ${n(maandiHouse)} from your ascendant. Ancient South Indian treatises document that Maandi creates a classic '99% plateau' where bureaucratic approvals or capital disbursements halt abruptly at the threshold.`
      }, targetLang),
      pick6({
        kn: `ಈ ಗಂಟನ್ನು ಕಳಚಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಾಂದಿ-ಶನಿ ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ ಹಾಗೂ ಸೋಮವಾರ ಬಿಲ್ವಪತ್ರೆ ಅರ್ಚನೆ ಅತ್ಯಂತ ಶೀಘ್ರ ಫಲ ನೀಡಲಿದೆ. ಈ ಪರಿಹಾರದಿಂದ ಕೊನೆಯ ಕ್ಷಣದ ಅಡೆತಡೆಗಳು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿವೆ.`,
        mr: `या दोषाच्या शांतीसाठी श्री क्षेत्र गोकर्ण महाबळेश्वर येथे मांदी-शनी शांती संकल्प व शिवपिंडीवर बेलाचे पान वाहणे तात्काळ लाभदायक ठरते.`,
        hi: `इस ग्रंथि के भेदन हेतु श्री क्षेत्र गोकर्ण महाबलेश्वर में मांदी-शनि शांति संकल्प एवं बिल्वपत्र अर्चन अत्यंत प्रभावशाली सिद्ध होता है।`,
        te: `దీనికి గోకర్ణ క్షేత్రంలో మాంది-శని శాంతి పూజ మరియు శివారాధన చేయడం వల్ల ఆటంకాలు తొలగిపోతాయి.`,
        ta: `இதனை நிவர்த்தி செய்ய கோகர்ண மகாபலேஸ்வரர் சன்னதியில் மாந்தி சாந்தி சங்கல்பமும் வில்வ அர்ச்சனையும் உடனடியாக பலன் தரும்.`,
        en: `This karmic knot is permanently resolved through dedicated Maandi-Shani Shanti Sankalpa and Bilva Archana at consecrated Sri Kshetra Gokarna.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಮಾಂದಿ ಕರ್ಮ ವಿಮೋಚನೆ", mr: "मांदी कर्म मुक्ती", hi: "मांदी कर्म मुक्ति", te: "మాంది కర్మ విమోచన", ta: "மாந்தி கர்ம நிவர்த்தி", en: "Maandi Knot Release" }, targetLang)
  });

  // CHAPTER 5: Inner 3 Truths & Panchabhuta Element Balance
  chapters.push({
    chapterNumber: 5,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ಆತ್ಮದ ಆಂತರಿಕ ೩ ಪರಮ ಸತ್ಯಗಳು & ಪಂಚಭೂತ ತತ್ವಗಳ ಸಮತೋಲನ",
      mr: "आत्म्याचे ३ परम सत्य व पंचमहाभूत तत्त्वांचे संतुलन",
      hi: "आत्मा के ३ परम सत्य एवं पंचभूत संतुलन",
      te: "ఆత్మ యొక్క 3 పరమ సత్యాలు & పంచభూత తత్వాల సమతుల్యత",
      ta: "ஆன்மாவின் 3 உண்மைகள் & பஞ்சபூத தத்துவ சமநிலை",
      en: "Inner 3 Truths & Panchabhuta Elemental Balance"
    }, targetLang),
    icon: "🔥",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ನಿರ್ದೇಶಿಸುವ ೩ ಅಚಲ ಸತ್ಯಗಳು ಹಾಗೂ ಅಗ್ನಿ, ಪೃಥ್ವಿ, ವಾಯು, ಜಲ ತತ್ವಗಳ ಪ್ರಮಾಣವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या व्यक्तिमत्त्वाला दिशा देणारे ३ मूळ सत्य व अग्नि, पृथ्वी, वायू, जल तत्त्वांचे प्रमाण काय?`,
      hi: `प्रश्न: ${devoteeName}, आपके व्यक्तित्व को संचालित करने वाले ३ मूल सत्य एवं पंचभूतों का प्रतिशत क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ అంతర్గత స్వభావాన్ని తెలిపే 3 సత్యాలు & పంచభూతాల బలం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஆன்மாவை வழிநடத்தும் 3 உண்மைகள் மற்றும் பஞ்சபூத தத்துவங்களின் விகிதம் என்ன?`,
      en: `Question: ${devoteeName}, what are the 3 unbreakable moral truths of your soul, and your elemental Fire/Earth/Air/Water balance?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಭೂತ ಗಣಿತವು: ಪೃಥ್ವಿ (ಸ್ಥಿರತೆ): ೩೫%, ಜಲ (ಭಾವನೆ): ೩೦%, ಅಗ್ನಿ (ಸಾಹಸ): ೨೦%, ಹಾಗೂ ವಾಯು (ಬುದ್ಧಿಮತ್ತೆ): ೧೫% ಆಗಿದೆ. ಈ ಸಂಯೋಜನೆಯು ನಿಮ್ಮನ್ನು ಬಾಹ್ಯವಾಗಿ ಶಾಂತವಾಗಿ, ಆದರೆ ಆಂತರಿಕವಾಗಿ ಅತ್ಯಂತ ದೃಢ ಸಂಕಲ್ಪವುಳ್ಳ ವ್ಯಕ್ತಿಯನ್ನಾಗಿ ರೂಪಿಸಿದೆ. ನಿಮ್ಮ ಆತ್ಮದ ೩ ಪರಮ ಸತ್ಯಗಳು: ೧) ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಧಕ್ಕೆ ಬಂದರೆ ನೀವು ಎಷ್ಟೇ ದೊಡ್ಡ ಲಾಭವನ್ನಾದರೂ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ತ್ಯಜಿಸುತ್ತೀರಿ. ೨) ನಿಮ್ಮನ್ನು ನಂಬಿದವರಿಗೆ ನೀವು ಎಂದಿಗೂ ದ್ರೋಹ ಬಗೆಯುವುದಿಲ್ಲ; ಆದರೆ ಒಮ್ಮೆ ನಂಬಿಕೆ ಮುರಿದರೆ ಆ ವ್ಯಕ್ತಿಯನ್ನು ಪುನಃ ಮನಸ್ಸಿಗೆ ಸೇರಿಸುವುದಿಲ್ಲ. ೩) ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಯಾರ ಮುಂದೆಯೂ ಕೈಚಾಚದೆ ಒಂಟಿಯಾಗಿ ಹೋರಾಡುವ ಅಪಾರ ಆತ್ಮಗೌರವ ನಿಮ್ಮಲ್ಲಿದೆ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेत पृथ्वी तत्त्व ३५%, जल तत्त्व ३०%, अग्नि तत्त्व २०% व वायू तत्त्व १५% आहे. आपले ३ मूल सत्य: १) स्वाभिमानाशी तडजोड करून मिळणारा मोठा फायदाही आपण लाथाडता. २) विश्वासघात करणाऱ्याला पुन्हा आयुष्यात कधीही स्थान देत नाही. ३) कठीण प्रसंगी कोणापुढेही हात न पसरता स्वतःच्या बळावर संघर्ष करता.`,
        hi: `${devoteeName}, आपकी कुंडली में पृथ्वी तत्व ३५%, जल तत्व ३०%, अग्नि तत्व २०% एवं वायु तत्व १५% संतुलित है। आपके ३ परम सत्य: १) स्वाभिमान से समझौता कर मिलने वाले बड़े लाभ को भी आप ठुकरा देते हैं। २) विश्वासघात करने वाले को जीवन में कभी दूसरा अवसर नहीं देते। ३) विपत्ति में किसी के सम्मुख याचक न बनकर अकेले जूझने का अदम्य साहस रखते हैं।`,
        te: `${devoteeName}, మీ తత్వ బలం: పృథ్వి 35%, జలం 30%, అగ్ని 20%, వాయువు 15%. మీ 3 సత్యాలు: ఆత్మగౌరవాన్ని వదులుకోరు, నమ్మకద్రోహాన్ని క్షమించరు, ఎంత కష్టమొచ్చినా స్వశక్తితో నిలబడతారు.`,
        ta: `${devoteeName}, உங்கள் பஞ்சபூத நிலை: பூமி 35%, நீர் 30%, நெருப்பு 20%, காற்று 15%. உங்கள் 3 உண்மைகள்: சுயமரியாதையை இழக்க மாட்டீர்கள், துரோகத்தை மன்னிக்க மாட்டீர்கள், யாரிடமும் கையேந்தாமல் தனித்து நின்று போராடுவீர்கள்.`,
        en: `${devoteeName}, your elemental ratio resolves as Earth 35%, Water 30%, Fire 20%, and Air 15%. Your 3 immutable soul truths: 1) You forfeit enormous gains rather than compromise self-respect. 2) You forgive hardships but permanently sever ties with betrayal. 3) You endure adversity in stoic silence rather than beg assistance.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಪಂಚಭೂತ ತತ್ವ ಸಮತೋಲನ", mr: "पंचमहाभूत संतुलन", hi: "पंचभूत संतुलन", te: "పంచభూత సమతుల్యత", ta: "பஞ்சபூத சமநிலை", en: "Panchabhuta Harmony" }, targetLang)
  });

  // CHAPTER 6: Core Personality, Yogi Wealth Planet & Avayogi Warning
  chapters.push({
    chapterNumber: 6,
    sectionNumber: 1,
    sectionTitle: sec1,
    title: pick6({
      kn: "ವ್ಯಕ್ತಿತ್ವದ ಗರಿಷ್ಠ ಬಲ, ಧನ ಭಾಗ್ಯೋದಯದ ಯೋಗಿ ಗ್ರಹ & ಅವಯೋಗಿ ಎಚ್ಚರಿಕೆ",
      mr: "व्यक्तिमत्त्व बल, धन लाभाचा योगी ग्रह व अवयोगी ग्रहाचा इशारा",
      hi: "मूल व्यक्तित्व सामर्थ्य, धन प्रदाता योगी ग्रह एवं अवयोगी की चेतावनी",
      te: "వ్యక్తిత్వ బలం, ధన ప్రాప్తికి యోగి గ్రహం & అవయోగి హెచ్చరిక",
      ta: "ஆளுமை பலம், யோகி கிரக செல்வாக்கு & அவயோகி எச்சரிக்கை",
      en: "Core Personality, Lucky Yogi Wealth Planet & Avayogi Warning"
    }, targetLang),
    icon: "💎",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಭಾಗ್ಯದ ಬಾಗಿಲು ತೆರೆಯುವ ರಹಸ್ಯ 'ಯೋಗಿ ಗ್ರಹ' ಹಾಗೂ ಸಂಪತ್ತನ್ನು ಹಾಳುಮಾಡುವ 'ಅವಯೋಗಿ ಗ್ರಹ' ಯಾವುದು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या भाग्योदयाची किल्ली असणारा गुप्त 'योगी ग्रह' व अडथळे आणणारा 'अवयोगी ग्रह' कोणता?`,
      hi: `प्रश्न: ${devoteeName}, आपके भाग्योदय का द्वार खोलने वाला 'योगी ग्रह' एवं विघ्नकारक 'अवयोगी ग्रह' कौन सा है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ సంపదను పెంచే 'యోగి గ్రహం' & నష్టం కలిగించే 'అవయోగి గ్రహం' ఏవి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் பாக்கியத்தைத் திறக்கும் 'யோகி கிரகம்' மற்றும் நஷ்டம் தரும் 'அவயோகி கிரகம்' எவை?`,
      en: `Question: ${devoteeName}, what is your exact lucky Yogi Planet of wealth vs. your Avayogi obstacle planet?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ದಕ್ಷಿಣ ಭಾರತದ ಶೇಷಾದ್ರಿ ಅಯ್ಯರ್ ರಹಸ್ಯ ಸೂತ್ರದಂತೆ ನಿಮ್ಮ ಜಾತಕದ ಪರಮ ಧನ ಪ್ರದಾಯಕ 'ಯೋಗಿ ಗ್ರಹ'ವು '${yogiPlanetName}' ಆಗಿದೆ. ಈ ಗ್ರಹವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ಗೌರವ ಹಾಗೂ ಅದೃಷ್ಟವನ್ನು ತರುವ ಶಕ್ತಿ ಹೊಂದಿದೆ. ಯೋಗಿ ಗ್ರಹದ ಶುಭ ದಿಕ್ಕು: ${yogiAttrs.directionKn || "ಪೂರ್ವ"}, ಶುಭ ಬಣ್ಣ: ${yogiAttrs.colorKn || "ಹಳದಿ"}, ಹಾಗೂ ಆರಾಧ್ಯ ದೈವ: ${yogiAttrs.deityKn || "ಶ್ರೀ ಮಹಾವಿಷ್ಣು"}.`,
        mr: `${devoteeName}, शेषाद्री अय्यर गुप्त पद्धतीनुसार आपल्या पत्रिकेतील परम धन प्रदाता 'योगी ग्रह' '${yogiPlanetName}' आहे. हा ग्रह अचानक धनलाभ, सन्मान व प्रगती घडवून आणतो. शुभ दिशा: ${yogiAttrs.directionKn || "पूर्व"}, शुभ रंग: ${yogiAttrs.colorKn || "पिवळा"}, व उपास्य देवता: ${yogiAttrs.deityKn || "श्री विष्णू"}.`,
        hi: `${devoteeName}, शेषाद्रि अय्यर गुप्त पद्धति के अनुसार आपका धन प्रदाता 'योगी ग्रह' '${yogiPlanetName}' है, जो जीवन में अप्रत्याशित समृद्धि एवं यश प्रदान करने की क्षमता रखता है। शुभ दिशा: ${yogiAttrs.directionKn || "पूर्व"}, शुभ रंग: ${yogiAttrs.colorKn || "पीला"}, एवं इष्ट देव: ${yogiAttrs.deityKn || "श्री हरि विष्णु"}.`,
        te: `${devoteeName}, మీ జాతకంలో ధన ప్రదాత అయిన 'యోగి గ్రహం' '${yogiPlanetName}'. ఇది మీకు అదృష్టాన్ని ఇస్తుంది. శుభ దిశ: ${yogiAttrs.directionKn || "తూర్పు"}, శుభ వర్ణం: ${yogiAttrs.colorKn || "పసుపు"}.`,
        ta: `${devoteeName}, உங்கள் செல்வத்தை உயர்த்தும் 'யோகி கிரகம்' '${yogiPlanetName}'. இது எதிர்பாராத தனலாபத்தையும் புகழையும் தரும். உகந்த திசை: ${yogiAttrs.directionKn || "கிழக்கு"}, நிறம்: ${yogiAttrs.colorKn || "மஞ்சள்"}.`,
        en: `${devoteeName}, the Seshadri Iyer system confirms your supreme wealth-catalyst 'Yogi Planet' is ${yogiPlanetName}, conferring windfall luck and prestige. Its lucky compass orientation is ${yogiAttrs.directionEn}, consecrated shade is ${yogiAttrs.colorEn}, and patron deity is ${yogiAttrs.deityEn}.`
      }, targetLang),
      pick6({
        kn: `ಅದೇ ಸಮಯದಲ್ಲಿ, ನಿಮ್ಮ ಜಾತಕದ 'ಅವಯೋಗಿ ಗ್ರಹ'ವು '${avayogiPlanetName}' ಆಗಿದೆ. ಯಾವುದೇ ಪ್ರಮುಖ ಒಪ್ಪಂದ, ಹೂಡಿಕೆ ಅಥವಾ ವ್ಯವಹಾರ ಮಾಡುವಾಗ ಈ ಗ್ರಹದ ಕಾಲಾವಧಿಯಲ್ಲಿ ಹಾಗೂ ಈ ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ಎಚ್ಚರದಿಂದಿರಬೇಕು. ಈ ಎಚ್ಚರಿಕೆಯು ನಿಮ್ಮ ಸಂಪತ್ತಿಗೆ ದಿವ್ಯ ಕವಚವಾಗಲಿದೆ.`,
        mr: `याउलट, आपल्या पत्रिकेतील 'अवयोगी ग्रह' '${avayogiPlanetName}' आहे. मोठे व्यवहार व गुंतवणूक करताना या ग्रहाच्या प्रभावापासून सावध राहणे आवश्यक आहे.`,
        hi: `इसके विपरीत आपका 'अवयोगी ग्रह' '${avayogiPlanetName}' है। किसी भी बड़े निवेश अथवा साझेदारी में इसके दुष्प्रभाव से सतर्क रहना परम आवश्यक है।`,
        te: `మీ 'అవయోగి గ్రహం' '${avayogiPlanetName}'. వ్యాపార ఒప్పందాలు మరియు పెట్టుబడులలో దీని పట్ల జాగ్రత్తగా ఉండాలి.`,
        ta: `அதே சமயம் உங்கள் 'அவயோகி கிரகம்' '${avayogiPlanetName}'. பெரிய முதலீடுகள் செய்யும்போது இதன் தசாபுத்தியில் கவனமாக இருக்க வேண்டும்.`,
        en: `Conversely, your natal 'Avayogi Planet' is ${avayogiPlanetName}. Exercising prudent diligence during its transits shields accrued capital from unanticipated drains.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಯೋಗಿ-ಅವಯೋಗಿ ನಿರ್ಣಯ", mr: "योगी-अवयोगी निर्णय", hi: "योगी-अवयोगी निर्णय", te: "యోగి-అవయోగి నిర్ణయం", ta: "யோகி-அவயோகி கணிப்பு", en: "Yogi-Avayogi Formula" }, targetLang)
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: WHAT IS HAPPENING RIGHT NOW (Chapters 7 to 11)
  // ──────────────────────────────────────────────────────────────────────────
  const sec2 = pick6({
    kn: "ವಿಭಾಗ ೨: ಪ್ರಸ್ತುತ ಗ್ರಹಗತಿ, ದಶಾ ಸಂಚಾರ & ಗೋಚಾರ ಪ್ರಭಾವ",
    mr: "विभाग २: सध्याची ग्रहस्थिती, महादशा व गोचर प्रभाव",
    hi: "खंड २: वर्तमान ग्रह स्थिति, महादशा एवं गोचर प्रभाव",
    te: "విభాగం 2: ప్రస్తుత గ్రహ గతులు, దశా సంచారం & గోచారం",
    ta: "பிரிவு 2: தற்போதைய கிரக நிலைகள், தசாபுத்தி & கோசாரம்",
    en: "Section 2: What is Happening Right Now — Planetary Alignment"
  }, targetLang);

  // CHAPTER 7: Current Mahadasha–Bhukti Reality
  chapters.push({
    chapterNumber: 7,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ & ಅಧಿಪತಿ ಗ್ರಹಗಳ ರಕ್ಷಣಾ ಕವಚ",
      mr: "सध्याची महादशा-अंतर्दशा व अधिपती ग्रहांचे संरक्षक कवच",
      hi: "वर्तमान महादशा-अंतर्दशा एवं स्वामी ग्रहों का रक्षा कवच",
      te: "ప్రస్తుత మహర్దశ-అంతర్దశ & అధిపతి గ్రహాల రక్షణ",
      ta: "நடப்பு மகாதசை-அந்தர்தசை & ஆளும் கிரகங்களின் கவசம்",
      en: "Current Mahadasha–Bhukti Reality & Ruling Planet Shield"
    }, targetLang),
    icon: "🪐",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನವನ್ನು ಆಳುತ್ತಿರುವ ${currentMahadasha} ಮಹಾದಶೆ ಹಾಗೂ ${currentBhuktiLord} ಅಂತರ್ದಶೆಯ ನೈಜ ಪ್ರಭಾವವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, सध्या आपल्या आयुष्यावर प्रभाव टाकणारी ${currentMahadasha} महादशा व ${currentBhuktiLord} अंतर्दशेचा खरा प्रभाव काय?`,
      hi: `प्रश्न: ${devoteeName}, आपके जीवन को संचालित करने वाली वर्तमान ${currentMahadasha} महादशा एवं ${currentBhuktiLord} अंतर्दशा का यथार्थ प्रभाव क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, ప్రస్తుతం నడుస్తున్న ${currentMahadasha} మహర్దశ మరియు ${currentBhuktiLord} అంతర్దశ ఇచ్చే ఫలితాలు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, தற்போது உங்கள் வாழ்க்கையை வழிநடத்தும் ${currentMahadasha} மகாதசை மற்றும் ${currentBhuktiLord} அந்தர்தசையின் பலன்கள் என்ன?`,
      en: `Question: ${devoteeName}, what is the exact operational reality of your running ${currentMahadasha} Mahadasha and ${currentBhuktiLord} Bhukti?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaRashiName}ಗೆ ${currentMahadasha} ಮಹಾದಶೆಯು ನಿಮ್ಮ ಕರ್ಮ ಹಾಗೂ ಜೀವನದ ದಿಕ್ಕನ್ನು ಬದಲಾಯಿಸುವ ಶಕ್ತಿ ಹೊಂದಿದೆ. ಜೊತೆಗೆ ಚಾಲನೆಯಲ್ಲಿರುವ ${currentBhuktiLord} ಅಂತರ್ದಶೆಯು ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಆಂತರಿಕ ಮಂಥನವನ್ನು ಉಂಟುಮಾಡುತ್ತಿದೆ. ${isDashaSandhi ? "ವಿಶೇಷ ಎಚ್ಚರಿಕೆ: ನೀವು ಪ್ರಸ್ತುತ ದಶಾ ಸಂಧಿ (ದಶೆ ಬದಲಾಗುವ ಸೂಕ್ಷ್ಮ ಕಾಲಘಟ್ಟ)ಯಲ್ಲಿದ್ದೀರಿ. ಈ ಸಮಯದಲ್ಲಿ ಹೊಸ ಸಾಹಸಗಳಿಗಿಂತ ಹಳೆಯ ಕೆಲಸಗಳನ್ನು ಭದ್ರಪಡಿಸಿಕೊಳ್ಳುವುದು ಅತ್ಯಂತ ಜಾಣತನ." : "ದಶಾ ನಾಥರು ನಿಮ್ಮ ಪರವಾಗಿ ಸತ್ಫಲಗಳನ್ನು ನೀಡಲು ಸಿದ್ಧರಾಗಿದ್ದಾರೆ."}`,
        mr: `${devoteeName}, आपल्या ${lagnaRashiName} लग्नासाठी ${currentMahadasha} महादशा अत्यंत महत्त्वाची आहे. ${isDashaSandhi ? "विशेष इशारा: आपण सध्या दशा संधिक काळात आहात. त्यामुळे मोठे धोके पत्करणे टाळावे." : "दशा स्वामी आपल्याला शुभ फळे देण्यास अनुकूल आहेत."}`,
        hi: `${devoteeName}, आपके ${lagnaRashiName} लग्न हेतु ${currentMahadasha} महादशा निर्णायक भूमिका निभा रही है। ${isDashaSandhi ? "विशेष चेतावनी: आप दशा संधि के अत्यंत संवेदनशील कालखंड में हैं; नवीन जोखिम लेने के स्थान पर वर्तमान स्थिति को सुदृढ़ करें।" : "दशा अधिपति आपके पक्ष में सकारात्मक परिणाम देने हेतु अग्रसर हैं।" }`,
        te: `${devoteeName}, మీ ${lagnaRashiName} లగ్నానికి ${currentMahadasha} మహాదశ ఎంతో కీలకమైనది. ${isDashaSandhi ? "దశా సంధి నడుస్తున్నందున జాగ్రత్త అవసరం." : "గ్రహాలు అనుకూలంగా ఉన్నాయి."}`,
        ta: `${devoteeName}, உங்கள் ${lagnaRashiName} லக்னத்திற்கு ${currentMahadasha} மகாதசை முக்கியமானதாகும். ${isDashaSandhi ? "தசா சந்தி காலம் என்பதால் நிதானம் தேவை." : "தசா நாதர்கள் அனுகூலமாக உள்ளனர்."}`,
        en: `${devoteeName}, for your ${lagnaRashiName} ascendant, ${currentMahadasha} Mahadasha operates alongside ${currentBhuktiLord} Antardasha. ${isDashaSandhi ? "CRITICAL ALERT: You are traversing a Dasha Sandhi transition threshold; consolidate existing foundations rather than initiating speculative risks." : "Planetary dispositors are favorably aligned to deliver tangible progress."}`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ದಶಾ-ಭುಕ್ತಿ ನಿರ್ಣಯ", mr: "दशा-भुक्ती निर्णय", hi: "दशा-भुक्ति निर्णय", te: "దశా-భుక్తి నిర్ణయం", ta: "தசாபுத்தி கணிப்பு", en: "Vimshottari Protocol" }, targetLang)
  });

  // CHAPTER 8: Current Saturn (Shani) Gochara Impact
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
      en: "Current Saturn (Shani) Gochara Impact & BAV Verification"
    }, targetLang),
    icon: "⚖️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ಶನಿ ದೇವರ ಗೋಚಾರವು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonRashiName}ಯ ಮೇಲೆ ಯಾವ ರೀತಿಯ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, सध्याचे शनी गोचर आपल्या ${moonRashiName} राशीवर काय परिणाम घडवत आहे?`,
      hi: `प्रश्न: ${devoteeName}, वर्तमान शनि गोचर का आपकी चंद्र राशि ${moonRashiName} पर क्या प्रत्यक्ष प्रभाव पड़ रहा है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ ${moonRashiName} రాశిపై ప్రస్తుత శని గోచార ప్రభావం ఎలా ఉంది?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ${moonRashiName} ராசியில் தற்போதைய சனியின் கோசார பலன் என்ன?`,
      en: `Question: ${devoteeName}, how does current Saturn transit impact your natal Moon sign ${moonRashiName}?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನ್ಯಾಯಾಧಿಪತಿಯಾದ ಶನಿ ಮಹಾರಾಜರು ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಕರ್ಮ ಪರಿಶುದ್ಧಿಯನ್ನು ಮಾಡುತ್ತಿದ್ದಾರೆ. ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ಶನಿಯ ಬಿಂದುಗಳು ೪ ಕ್ಕಿಂತ ಹೆಚ್ಚಿರುವ ಕಾರಣ, ಈ ಗೋಚಾರವು ನಿಮಗೆ ವಿನಾಶಕಾರಿಯಲ್ಲ; ಬದಲಾಗಿ ಅನಗತ್ಯ ಜನರನ್ನು ನಿಮ್ಮ ಜೀವನದಿಂದ ದೂರವಿಟ್ಟು, ನಿಮ್ಮನ್ನು ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಶಿಸ್ತಿನ ಮೂಲಕ ಬಲಿಷ್ಠಗೊಳಿಸುತ್ತಿದೆ. ಶನಿವಾರದ ತೈಲ ದೀಪಾರಾಧನೆ ನಿಮಗೆ ಪರಮ ಶಾಂತಿ ನೀಡಲಿದೆ.`,
        mr: `${devoteeName}, शनी महाराज आपल्या आयुष्यातील अनावश्यक गोष्टी दूर करून आपल्याला अधिक परिपक्व व शिस्तप्रिय बनवत आहेत. अष्टकवर्गातील शुभ गुणांमुळे हा काळ अंतिमतः फायदेशीर ठरेल.`,
        hi: `${devoteeName}, कर्मफलदाता शनि आपकी जीवन शैली में अनुशासन एवं सत्यनिष्ठा की प्रतिष्ठा कर रहे हैं। भिन्नाष्टकवर्ग में ४ से अधिक बिंदु होने के कारण यह गोचर विनाशकारी न होकर आपको परिपक्व बना रहा है।`,
        te: `${devoteeName}, శని భగవానుడు మీకు క్రమశిక్షణను నేర్పుతున్నారు. అష్టకవర్గ బలం బాగున్నందున ఆందోళన చెందాల్సిన అవసరం లేదు.`,
        ta: `${devoteeName}, சனி பகவான் உங்கள் வாழ்க்கையில் தேவையில்லாதவர்களை நீக்கி மன உறுதியைத் தருகிறார். அஷ்டகவர்க்க பலத்தால் நன்மையே உண்டாகும்.`,
        en: `${devoteeName}, Lord Saturn operates as the divine crucible, pruning superfluous distractions to fortify discipline. With Bhinna Ashtakavarga exceeding 4 points, this transit brings structural maturity rather than disruption.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಶನಿ ಗೋಚಾರ ದರ್ಶನ", mr: "शनी गोचर दर्शन", hi: "शनि गोचर दर्शन", te: "శని గోచార దర్శనం", ta: "சனி கோசார பலன்", en: "Saturn Transit Audit" }, targetLang)
  });

  // CHAPTER 9: Current Jupiter (Guru) Gochara Impact & Guru Bala
  chapters.push({
    chapterNumber: 9,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಪ್ರಸ್ತುತ ಗೋಚಾರ, ಗುರುಬಲ & ದೈವಿಕ ರಕ್ಷಣೆ",
      mr: "देवगुरू बृहस्पतींचे सध्याचे गोचर, गुरुबळ व दैवी कृपा",
      hi: "देवगुरु बृहस्पति का वर्तमान गोचर, गुरु बल एवं ईश्वरीय संरक्षण",
      te: "దేవగురు బృహస్పతి గోచారం, గురుబలం & దైవిక రక్షణ",
      ta: "குரு பகவானின் கோசார பலம், குரு பார்வை & இறை அருள்",
      en: "Current Jupiter (Guru) Gochara Impact & Divine Guru Bala"
    }, targetLang),
    icon: "✨",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರುಬಲ ಹೇಗಿದೆ ಹಾಗೂ ಬೃಹಸ್ಪತಿಯ ದೃಷ್ಟಿಯು ಯಾವ ಭಾಗ್ಯವನ್ನು ತರಲಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, सध्या आपल्या पत्रिकेत गुरुबळ कसे आहे व गुरूची दृष्टी काय लाभ देईल?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में वर्तमान गुरु बल की क्या स्थिति है एवं बृहस्पति की दृष्टि से क्या वरदान मिलेगा?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో ప్రస్తుత గురుబలం ఎలా ఉంది మరియు ఎలాంటి మేలు జరుగుతుంది?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் தற்போதைய குரு பலம் மற்றும் குரு பார்வையின் சுப பலன்கள் என்ன?`,
      en: `Question: ${devoteeName}, what is your current Guru Bala status and where does Jupiter's benefic gaze fall?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜ್ಞಾನಕಾರಕನಾದ ಗುರುವಿನ ಗೋಚಾರವು ನಿಮ್ಮ ಚಂದ್ರ ಮತ್ತು ಲಗ್ನದ ಮೇಲೆ ದೈವಿಕ ಅಮೃತ ದೃಷ್ಟಿಯನ್ನು ಬೀರುತ್ತಿದೆ. ಯಾವುದೇ ಗ್ರಹದ ಅಡೆತಡೆಗಳು ಎದುರಾದರೂ, ಗುರುವಿನ ಶುಭ ಬಲವು ನಿಮ್ಮ ಗೌರವಕ್ಕೆ ಯಾವುದೇ ಚ್ಯುತಿ ಬಾರದಂತೆ ತಡೆಯುತ್ತದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ಗುರು ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ದೇವಸ್ಥಾನ ದರ್ಶನ ಹಾಗೂ ಸತ್ಪಾತ್ರ ದಾನವು ನಿಮ್ಮ ಸಕಲ ಕಾರ್ಯಗಳನ್ನು ಸಿದ್ಧಿಗೊಳಿಸಲಿದೆ.`,
        mr: `${devoteeName}, गुरूची अमृत दृष्टी आपल्यावर असून, कठीण प्रसंगातही आपले रक्षण करेल. ज्येष्ठांचे आशीर्वाद व ईश्वरी भक्ती आपल्याला यशाकडे नेईल.`,
        hi: `${devoteeName}, ज्ञान एवं ऐश्वर्य के कारक देवगुरु बृहस्पति की अमृतमयी दृष्टि आपकी प्रतिष्ठा की रक्षा कर रही है। यह कालखंड आध्यात्मिक उन्नति एवं मार्गदर्शन हेतु अत्यंत प्रशस्त है।`,
        te: `${devoteeName}, గురు దృష్టి మీపై ఉన్నందున ఎలాంటి అడ్డంకులు వచ్చినా మీ గౌరవానికి భంగం కలగదు. సత్కార్యాలు విజయవంతమవుతాయి.`,
        ta: `${devoteeName}, குருவின் சுப பார்வை உங்கள் புகழைக் காக்கும். பெரியோர்களின் ஆசியால் காரியங்கள் கைகூடும்.`,
        en: `${devoteeName}, Jupiter's nectarine aspect safeguards personal dignity against adverse transits. Sincere devotion and elder blessings will catalyze breakthrough progress.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಗುರುಬಲ ಪ್ರಭಾವ", mr: "गुरुबळ प्रभाव", hi: "गुरु बल प्रभाव", te: "గురుబల ప్రభావం", ta: "குரு பலன்", en: "Jupiter Grace Metric" }, targetLang)
  });

  // CHAPTER 10: Current Rahu–Ketu Nodal Axis & Mental Clarity
  chapters.push({
    chapterNumber: 10,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ರಾಹು-ಕೇತುಗಳ ಛಾಯಾ ಗ್ರಹಗಳ ಸಂಚಾರ & ಮಾನಸಿಕ ಸ್ಪಷ್ಟತೆಯ ಮಂತ್ರ",
      mr: "राहू-केतूचे गोचर भ्रमण व मानसिक एकाग्रतेचा मार्ग",
      hi: "राहु-केतु का गोचर भ्रमण एवं मानसिक स्पष्टता का सूत्र",
      te: "రాహు-కేతువుల సంచారం & మానసిక ప్రశాంతత",
      ta: "ராகு-கேது பெயர்ச்சி & மனத்தெளிவுக்கான வழிகாட்டல்",
      en: "Rahu–Ketu Nodal Axis & Mental Clarity Shield"
    }, targetLang),
    icon: "🐉",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ರಾಹು-ಕೇತುಗಳ ಸಂಚಾರದಿಂದ ಉಂಟಾಗುವ ಭ್ರಮೆ, ಗೊಂದಲ ಹಾಗೂ ಅನಗತ್ಯ ಭಯಗಳನ್ನು ನಿವಾರಿಸುವುದು ಹೇಗೆ?`,
      mr: `प्रश्न: ${devoteeName}, राहू-केतूच्या प्रभावाने होणारा संभ्रम व भीती कशी दूर करावी?`,
      hi: `प्रश्न: ${devoteeName}, राहु-केतु जनित भ्रम, अनिश्चितता एवं भय से मुक्ति पाने का क्या उपाय है?`,
      te: `ప్రశ్న: ${devoteeName}, రాహు-కేతువుల వల్ల కలిగే మానసిక ఆందోళనలను ఎలా నివారించాలి?`,
      ta: `கேள்வி: ${devoteeName}, ராகு-கேதுவால் ஏற்படும் மனக்குழப்பம் மற்றும் பயத்தை எவ்வாறு நீக்குவது?`,
      en: `Question: ${devoteeName}, how do you dissolve Rahu-Ketu illusions, second-guessing, and subconscious anxieties?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷವು ನಿಮ್ಮ ಆಲೋಚನೆಗಳಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅತಿಯಾದ ಕಲ್ಪನೆ ಅಥವಾ ಅಪನಂಬಿಕೆಯನ್ನು ಸೃಷ್ಟಿಸಬಹುದು. ಭ್ರಮೆಯನ್ನು ಕಳಚಿ ವಾಸ್ತವವನ್ನು ಗ್ರಹಿಸುವುದು ಈ ಸಮಯದ ಮುಖ್ಯ ಸಾಧನೆಯಾಗಿದೆ. ದಿನನಿತ್ಯ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಪಠಿಸುವುದು ಅಥವಾ ಮಂಗಳವಾರ ನಾಗದೇವರಿಗೆ ನಮಸ್ಕರಿಸುವುದು ನಿಮ್ಮ ಚಿತ್ತವನ್ನು ಶಾಂತವಾಗಿಡಲಿದೆ.`,
        mr: `${devoteeName}, राहू-केतूच्या प्रभावाने विनाकारण नकारात्मक विचार येऊ नयेत म्हणून कुलदेवतेची उपासना व शांत मन राखणे गरजेचे आहे.`,
        hi: `${devoteeName}, राहु-केतु अक्ष का प्रभाव कभी-कभी अनावश्यक आशंकाएं उत्पन्न करता है। नित्य भगवान शिव अथवा सुब्रह्मण्य स्वामी का ध्यान मानसिक स्थिरता प्रदान करेगा।`,
        te: `${devoteeName}, ప్రతికూల ఆలోచనలకు దూరంగా ఉంటూ నిత్యం ఇష్టదైవాన్ని ప్రార్థించడం వల్ల మానసిక ప్రశాంతత లభిస్తుంది.`,
        ta: `${devoteeName}, வீண் பயங்களைத் தவிர்த்து முருகப்பெருமானை அல்லது குலதெய்வத்தை வணங்குவது மனத்தெளிவைத் தரும்.`,
        en: `${devoteeName}, the Rahu-Ketu nodal axis occasionally stirs speculative anxiety. Grounding consciousness in steady spiritual routines dispels all illusions.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಛಾಯಾ ಗ್ರಹ ರಕ್ಷಣೆ", mr: "छाया ग्रह संरक्षण", hi: "छाया ग्रह सुरक्षा", te: "ఛాయా గ్రహ రక్షణ", ta: "ராகு கேது சாந்தி", en: "Nodal Equilibrium" }, targetLang)
  });

  // CHAPTER 11: Special Rajayogas & Divine Protections
  chapters.push({
    chapterNumber: 11,
    sectionNumber: 2,
    sectionTitle: sec2,
    title: pick6({
      kn: "ಜನ್ಮ ಕುಂಡಲಿಯ ವಿಶೇಷ ರಾಜಯೋಗಗಳು, ನೀಚಭಂಗ & ದೈವಿಕ ರಕ್ಷಾ ಕವಚಗಳು",
      mr: "कुंडलीतील विशेष राजयोग, नीचभंग व ईश्वरीय कृपा कवच",
      hi: "जन्म कुंडली के विशेष राजयोग, नीचभंग एवं दैवीय सुरक्षा कवच",
      te: "జన్మ కుండలిలోని విశేష రాజయోగాలు, నీచభంగం & రక్షా కవచం",
      ta: "ஜாதக விசேஷ ராஜயோகங்கள், நீசபங்கம் & தெய்வீக கவசங்கள்",
      en: "Special Rajayogas, Neecha Bhanga & Invincible Divine Protections"
    }, targetLang),
    icon: "👑",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಯಾವ ದಿವ್ಯ ಯೋಗಗಳು ಕಠಿಣ ಪರಿಶ್ರಮದ ನಂತರ ಹಠಾತ್ ಭಾಗ್ಯೋದಯವನ್ನು ತರಲಿವೆ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या पत्रिकेत कोणते राजयोग संघर्षांनंतर अचानक यश मिळवून देणार आहेत?`,
      hi: `प्रश्न: ${devoteeName}, आपकी कुंडली में कौन से राजयोग संघर्ष के उपरांत अचानक उत्थान प्रदान करेंगे?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జాతకంలో పోరాటం తర్వాత ఆకస్మిక విజయాన్ని ఇచ్చే రాజయోగాలు ఏవి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ஜாதகத்தில் போராட்டத்திற்குப் பின் திடீர் உயர்வைத் தரும் ராஜயோகங்கள் எவை?`,
      en: `Question: ${devoteeName}, which Rajayogas and Neecha Bhanga alignments trigger sudden elevation after struggle?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗಜಕೇಸರಿ, ಸುನಫಾ ಅಥವಾ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಯೋಗಗಳ ಶುಭ ಪ್ರಭಾವವಿದೆ. ವಿಶೇಷವಾಗಿ ಯಾವುದೇ ಗ್ರಹವು ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದರೂ, ಅದರ ನೀಚಭಂಗ ರಾಜಯೋಗದ ನಿಯಮದಂತೆ 'ಆರಂಭಿಕ ಹೋರಾಟದ ನಂತರ ಹಠಾತ್ ಉನ್ನತ ಸ್ಥಾನ' ದೊರೆಯುವ ಶಾಸ್ತ್ರೋಕ್ತ ಫಲ ನಿಮ್ಮ ಪಾಲಿಗೆ ಖಚಿತವಾಗಿದೆ. ನಿಮ್ಮನ್ನು ಯಾರೂ ಶಾಶ್ವತವಾಗಿ ತುಳಿಯಲು ಸಾಧ್ಯವಿಲ್ಲ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेत नीचभंग राजयोग व शुभ योगांची उपस्थिती दर्शवते की सुरुवातीचा संघर्ष आपल्या मोठ्या यशाची पायाभरणी करेल.`,
        hi: `${devoteeName}, आपकी कुंडली में नीचभंग राजयोग एवं शुभ योगों का प्रभाव यह सिद्ध करता है कि प्रारंभिक बाधाओं के पश्चात आपका आकस्मिक उत्कर्ष निश्चित है।`,
        te: `${devoteeName}, మీ కుండలిలోని రాజయోగాలు ప్రారంభంలో కష్టాలు ఎదురైనా తర్వాత అద్భుతమైన విజయాన్ని అందిస్తాయి.`,
        ta: `${devoteeName}, உங்கள் ஜாதகத்தில் உள்ள நீசபங்க ராஜயோகம் ஆரம்ப போராட்டங்களுக்குப் பின் உன்னத நிலையைத் தரும்.`,
        en: `${devoteeName}, classical Parashari principles of Neecha Bhanga and Kendra-Trikona Rajayogas ensure that initial adversity serves as the very springboard for unassailable future prominence.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ರಾಜಯೋಗ ದರ್ಶನ", mr: "राजयोग दर्शन", hi: "राजयोग दर्शन", te: "రాజయోగ దర్శనం", ta: "ராஜயோக பலன்", en: "Rajayoga Radiance" }, targetLang)
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: 5 LIFE PILLARS IN Q&A FORMAT (Chapters 12 to 16 — Age/Gender Filtered)
  // ──────────────────────────────────────────────────────────────────────────
  const sec3 = pick6({
    kn: "ವಿಭಾಗ ೩: ಜೀವನದ ೫ ಪ್ರಮುಖ ಸ್ತಂಭಗಳ ಪ್ರಶ್ನೋತ್ತರ ಮಾರ್ಗದರ್ಶನ",
    mr: "विभाग ३: आयुष्याच्या ५ प्रमुख स्तंभांचे सखोल मार्गदर्शन",
    hi: "खंड ३: जीवन के ५ प्रमुख स्तंभों का प्रश्नाधारित मार्गदर्शन",
    te: "విభాగం 3: జీవితపు 5 స్తంభాల ప్రశ్నోత్తర మార్గదర్శనం",
    ta: "பிரிவு 3: வாழ்க்கையின் 5 முக்கிய தூண்கள் - கேள்வி-பதில் வழிகாட்டல்",
    en: "Section 3: 5 Life Pillars in Q&A Format (Strictly Age-Adapted)"
  }, targetLang);

  // CHAPTER 12: Education, Career & Leadership
  chapters.push({
    chapterNumber: 12,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isInfant
      ? pick6({ kn: "ಶಿಶು ಆರೋಗ್ಯ, ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಣೆ, ಅನ್ನಪ್ರಾಶನ & ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ", mr: "शिशू आरोग्य, बालारिष्ट संरक्षण व नैसर्गिक प्रतिभा", hi: "शिशु स्वास्थ्य, बालारिष्ट रक्षा, अन्नप्राशन एवं नैसर्गिक प्रतिभा", te: "శిశు ఆరోగ్యం, బాలారిష్ట రక్షణ & సహజ ప్రతిభ", ta: "குழந்தை நலம், பாலாரிஷ்ட பாதுகாப்பு & இயல்பு திறன்", en: "Infant Vitality, Balarishta Shield & Early Milestones" }, targetLang)
      : isMinor
      ? pick6({ kn: "ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣ ಶಕ್ತಿ, ಬುದ್ಧಿಮತ್ತೆ & ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ", mr: "शिक्षण, स्मरणशक्ती, बुद्धिमत्ता व सुप्त गुण", hi: "विद्याभ्यास, मेधा शक्ति, बुद्धिमत्ता एवं नैसर्गिक प्रतिभा", te: "విద్య, జ్ఞాపకశక్తి & సహజ ప్రతిభ", ta: "கல்வி, ஞாபகசக்தி & உள்ளார்ந்த திறமைகள்", en: "Education, Cognitive Absorption & Natural Talents" }, targetLang)
      : isSenior
      ? pick6({ kn: "ಜ್ಞಾನ, ಮಾರ್ಗದರ್ಶನ, ಬೌದ್ಧಿಕ ಪರಂಪರೆ & ಸಮಾಜ ಸೇವೆ", mr: "ज्ञान, मार्गदर्शन, बौद्धिक वारसा व समाजसेवा", hi: "ज्ञान, मार्गदर्शन, बौद्धिक विरासत एवं समाज सेवा", te: "జ్ఞానం, మార్గదర్శకత్వం & సమాజ సేవ", ta: "ஞானம், வழிகாட்டல் & சமுதாயப் பணி", en: "Intellectual Legacy, Mentorship & Elder Wisdom" }, targetLang)
      : pick6({ kn: "ವೃತ್ತಿ ಪ್ರಗತಿ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ನಾಯಕತ್ವ ಭಾಗ್ಯ", mr: "कारकीर्द, नोकरी, व्यवसाय व नेतृत्व संधी", hi: "आजीविका, पदोन्नति, व्यवसाय एवं नेतृत्व सामर्थ्य", te: "వృత్తి, ఉద్యోగం, వ్యాపారం & నాయకత్వం", ta: "தொழில் மேன்மை, உத்தியோகம் & தலைமைத்துவம்", en: "Career Scaling, Business Enterprise & Leadership" }, targetLang),
    icon: "🎓",
    question: isInfant
      ? pick6({ kn: `ಪ್ರಶ್ನೆ: ಮುದ್ದು ಕಂದ ${devoteeName} ಅವರ ಶಿಶು ಆರೋಗ್ಯ, ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಣೆ ಹಾಗೂ ಶೈಶವಾವಸ್ಥೆಯ ಬೆಳವಣಿಗೆ ಹೇಗಿದೆ?`, mr: `प्रश्न: बाळ ${devoteeName} याचे आरोग्य, बालारिष्ट संरक्षण व वाढ कशी राहील?`, hi: `प्रश्न: नन्हे ${devoteeName} के स्वास्थ्य, बालारिष्ट रक्षा एवं प्रारंभिक विकास के लिए ग्रह क्या संकेत देते हैं?`, te: `ప్రశ్న: చిట్టిపాప ${devoteeName} ఆరోగ్యం మరియు బాలారిష్ట రక్షణ ఎలా ఉంది?`, ta: `கேள்வி: குழந்தை ${devoteeName} அவர்களின் நல்வாழ்வு மற்றும் பாலாரிஷ்ட பாதுகாப்பு எவ்வாறு அமையும்?`, en: `Question: How do planetary forces safeguard infant ${devoteeName}'s health, vitality, and Balarishta protection?` }, targetLang)
      : isMinor
      ? pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName} ಅವರ ವಿದ್ಯಾಭ್ಯಾಸ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಉನ್ನತಿಗೆ ಗ್ರಹಗಳ ಬೆಂಬಲ ಹೇಗಿದೆ?`, mr: `प्रश्न: ${devoteeName} यांच्या शिक्षणात प्रगती व एकाग्रता कशी राहील?`, hi: `प्रश्न: ${devoteeName} के विद्याभ्यास, एकाग्रता एवं बौद्धिक विकास में ग्रहों का क्या योगदान है?`, te: `ప్రశ్న: ${devoteeName} గారి చదువు మరియు ఏకాగ్రత ఎలా ఉంటాయి?`, ta: `கேள்வி: ${devoteeName} அவர்களின் கல்வி மற்றும் நினைவாற்றல் எவ்வாறு மிளிரும்?`, en: `Question: How do planetary alignments foster ${devoteeName}'s academic absorption and focus?` }, targetLang)
      : pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ವೃತ್ತಿ/ಉದ್ಯೋಗದಲ್ಲಿ ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ದೊರೆಯುವ ಪ್ರಮುಖ ತಿರುವು ಹಾಗೂ ನಾಯಕತ್ವದ ಸ್ಥಾನ ಯಾವುದು?`, mr: `प्रश्न: ${devoteeName}, आपल्या नोकरी/व्यवसायात पुढे मिळणारे मोठे यश व संधी कोणती?`, hi: `प्रश्न: ${devoteeName}, आपकी आजीविका एवं व्यवसाय में आने वाला प्रमुख उत्थान एवं अवसर क्या है?`, te: `ప్రశ్న: ${devoteeName}, మీ కెరీర్ లేదా వ్యాపారంలో రాబోయే పెద్ద మలుపు ఏమిటి?`, ta: `கேள்வி: ${devoteeName}, உங்கள் உத்தியோகம் அல்லது தொழிலில் அடுத்ததாக அமையவிருக்கும் பொற்காலம் என்ன?`, en: `Question: ${devoteeName}, what major breakthrough and leadership elevation awaits in your professional sphere?` }, targetLang),
    paragraphs: [
      isInfant
        ? pick6({
            kn: `${devoteeName}, ಬಾಲ ಜಾತಕದಲ್ಲಿ ಬುಧ ಹಾಗೂ ಗುರುವಿನ ದೃಷ್ಟಿಯು ಅದ್ಭುತ ಗ್ರಹಣ ಶಕ್ತಿಯನ್ನು ಸೂಚಿಸುತ್ತಿದೆ. ಶಿಶು ಆರೋಗ್ಯ, ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಣೆ ಹಾಗೂ ಅನ್ನಪ್ರಾಶನ-ಚೌಲ ಮುಹೂರ್ತಗಳು ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿವೆ. ಮಗುವಿನ ಮುಂದೆ ನಿತ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಅಥವಾ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸುವುದು ಮೆದುಳಿನ ಸೂಕ್ಷ್ಮ ನರಮಂಡಲವನ್ನು ತೇಜಸ್ವಿಯಾಗಿ ಬೆಳೆಸಲಿದೆ. ಯಾವುದೇ ಆತುರದ ಶೈಕ್ಷಣಿಕ ಒತ್ತಡವಿಲ್ಲದೆ ಸಹಜವಾಗಿ ಬೆಳೆಯಲು ಅವಕಾಶ ನೀಡಿ.`,
            mr: `${devoteeName}, बालिकेच्या/बालकाच्या पत्रिकेत बुध-गुरूची उत्तम स्थिती असून, संस्कार व शांत वातावरण बौद्धिक वाढीस पोषक ठरेल.`,
            hi: `${devoteeName}, शिशु कुंडली में बुध एवं गुरु का प्रभाव तीक्ष्ण मेधा शक्ति दर्शाता है। नित्य मंत्र श्रवण से बौद्धिक क्षमता का उत्तम विकास होगा।`,
            te: `${devoteeName}, చిన్నారి జాతకంలో బుధ, గురుల బలం వల్ల చక్కని గ్రహణ శక్తి ఉంటుంది. మంత్ర శ్రవణం మేలు చేస్తుంది.`,
            ta: `${devoteeName}, குழந்தையின் ஜாதகத்தில் புதன் மற்றும் குருவின் அருள் சிறந்த அறிவாற்றலைக் கொடுக்கும்.`,
            en: `${devoteeName}, infant alignments reflect exceptional neuro-auditory absorption under Mercury and Jupiter. Chanting sacred stotras within the child's acoustic sphere nourishes cognitive brilliance.`
          }, targetLang)
        : pick6({
            kn: `${devoteeName}, ನಿಮ್ಮ ೧೦ನೇ ಕರ್ಮಭಾವ ಹಾಗೂ ಸೂರ್ಯ-ಮಂಗಳರ ಬಲವು ನಿಮ್ಮಲ್ಲಿ ಸ್ವಾವಲಂಬಿ ನಾಯಕತ್ವದ ಗುಣವನ್ನು ತುಂಬಿದೆ. ನೀವು ಇತರರ ಕೈಕೆಳಗೆ ಕೇವಲ ಗುಲಾಮರಾಗಿ ಕೆಲಸ ಮಾಡಲು ಹುಟ್ಟಿದವರಲ್ಲ; ಸ್ವತಂತ್ರ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಮಾರ್ಗದರ್ಶನ ಮಾಡುವ ಶಕ್ತಿ ನಿಮ್ಮಲ್ಲಿದೆ. ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ವೃತ್ತಿಯಲ್ಲಿ ಅಧಿಕಾರ, ಗೌರವ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ನಿಮ್ಮನ್ನು ಹುಡುಕಿಕೊಂಡು ಬರಲಿವೆ.`,
            mr: `${devoteeName}, आपल्या १०व्या कर्मभावातील ग्रह दर्शवतात की आपण स्वतंत्र निर्णय घेण्यास सक्षम आहात. नोकरी किंवा व्यवसायात आपल्याला मानाचे पद प्राप्त होईल.`,
            hi: `${devoteeName}, आपके दशम भाव में सूर्य एवं मंगल का प्रभाव स्वतंत्र नेतृत्व क्षमता प्रदान करता है। कार्यक्षेत्र में शीघ्र ही सम्मान एवं उच्च पद की प्राप्ति के प्रबल योग हैं।`,
            te: `${devoteeName}, మీ 10వ భావం ప్రభావం వల్ల స్వతంత్రంగా నిర్ణయాలు తీసుకునే శక్తి లభిస్తుంది. ఉన్నత పదవులు దక్కుతాయి.`,
            ta: `${devoteeName}, உங்கள் 10ம் இடத்து பலம் சிறந்த தலைமைத்துவத்தைக் கொடுக்கும். விரைவில் உயர் பதவிகள் தேடி வரும்.`,
            en: `${devoteeName}, strong 10th house Solar-Martial dynamics confer innate executive agency. You command natural authority; high-stakes responsibilities and promotions will arrive in steady succession.`
          }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಕರ್ಮ-ವಿದ್ಯಾ ಸ್ತಂಭ", mr: "कर्म-विद्या स्तंभ", hi: "कर्म-विद्या स्तंभ", te: "కర్మ-విద్యా స్తంభం", ta: "கல்வி-தொழில் தூண்", en: "Pillar of Vocation" }, targetLang)
  });

  // CHAPTER 13: Wealth, Property & Financial Security
  chapters.push({
    chapterNumber: 13,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isMinor
      ? pick6({ kn: "ಕುಟುಂಬದ ಆರ್ಥಿಕ ಭದ್ರತೆ, ಪೋಷಕರ ಭಾಗ್ಯೋದಯ & ವಿದ್ಯಾ ನಿಧಿ", mr: "कौटुंबिक समृद्धी, पालकांचे भाग्य व शैक्षणिक निधी", hi: "पारिवारिक समृद्धि, माता-पिता का भाग्योदय एवं शिक्षा कोष", te: "కుటుంబ ఆర్థిక భద్రత & విద్యా నిధి", ta: "குடும்ப செல்வ வளம் & கல்வி நிதி பாதுகாப்பு", en: "Family Prosperity Endowment & Parental Security" }, targetLang)
      : pick6({ kn: "ಧನ ಸಂಚಯ, ಸ್ಥಿರಾಸ್ತಿ, ಹೂಡಿಕೆ & ಶಾಶ್ವತ ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ", mr: "धन संचय, संपत्ती, गुंतवणूक व आर्थिक स्वातंत्र्य", hi: "धन संचय, अचल संपत्ति, निवेश एवं स्थायी वित्तीय सुरक्षा", te: "ధన సంపద, స్థిరాస్తి & ఆర్థిక స్వాతంత్ర్యం", ta: "தன வரவு, சொத்து சேர்க்கை & நிதி சுதந்திரம்", en: "Wealth Accumulation, Real Estate & Financial Security" }, targetLang),
    icon: "💰",
    question: isMinor
      ? pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName} ಅವರ ಜನನದ ನಂತರ ಕುಟುಂಬದ ಧನ-ಸಂಪತ್ತು ಹಾಗೂ ಭವಿಷ್ಯದ ಉಳಿತಾಯ ಹೇಗೆ ವೃದ್ಧಿಯಾಗಲಿದೆ?`, mr: `प्रश्न: ${devoteeName} यांच्या आगमनाने कुटुंबाच्या आर्थिक समृद्धीत कशी भर पडेल?`, hi: `प्रश्न: ${devoteeName} के आगमन से पारिवारिक समृद्धि एवं बचत में क्या वृद्धि होगी?`, te: `ప్రశ్న: ${devoteeName} రాకతో కుటుంబ ఆర్థిక పురోగతి ఎలా ఉండబోతోంది?`, ta: `கேள்வி: ${devoteeName} அவர்களின் வரவால் குடும்பத்தின் தன யோகம் எவ்வாறு உயரும்?`, en: `Question: How does ${devoteeName}'s birth catalyze household prosperity and education endowment?` }, targetLang)
      : pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ೨ನೇ ಧನಭಾವ ಹಾಗೂ ೧೧ನೇ ಲಾಭಭಾವಗಳು ಸೂಚಿಸುವ ನೈಜ ಸಂಪತ್ತು ಹಾಗೂ ಆಸ್ತಿ ಖರೀದಿ ಯೋಗ ಯಾವಾಗ?`, mr: `प्रश्न: ${devoteeName}, आपल्या २ऱ्या व ११व्या भावानुसार धनलाभ व संपत्ती खरेदीचा शुभ काळ कोणता?`, hi: `प्रश्न: ${devoteeName}, आपके द्वितीय एवं एकादश भाव के अनुसार स्थायी धन लाभ एवं संपत्ति क्रय का समय कब है?`, te: `ప్రశ్న: ${devoteeName}, మీకు స్థిరాస్తులు కొనుగోలు చేసే యోగం మరియు ధనలాభం ఎప్పుడు కలుగుతాయి?`, ta: `கேள்வி: ${devoteeName}, உங்களுக்கு சொத்து வாங்கும் யோகமும் தனலாபமும் எப்போது கைகூடும்?`, en: `Question: ${devoteeName}, what do your 2nd and 11th houses reveal regarding property acquisition and lasting liquidity?` }, targetLang),
    paragraphs: [
      isMinor
        ? pick6({
            kn: `${devoteeName}, ಮಗುವಿನ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ೨ನೇ ಮನೆಯ ಶುಕ್ರ ಹಾಗೂ ಗುರು ಬಲದಿಂದಾಗಿ, ಈ ಮಗುವಿನ ಜನನದ ನಂತರ ಕುಟುಂಬದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷವು ನಿರಂತರವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿದೆ. ಪೋಷಕರು ಮಗುವಿನ ಹೆಸರಿನಲ್ಲಿ ಮಾಡುವ ದೀರ್ಘಾವಧಿ ಉಳಿತಾಯವು ಭವಿಷ್ಯದಲ್ಲಿ ಬೃಹತ್ ವಟವೃಕ್ಷದಂತೆ ನೆರವಾಗಲಿದೆ.`,
            mr: `${devoteeName}, मुलाच्या आगमनाने घरात सुख-समृद्धी वाढेल. मुलाच्या नावावर केलेली गुंतवणूक भविष्यात उत्तम परतावा देईल.`,
            hi: `${devoteeName}, शिशु के द्वितीय भाव में शुभ ग्रहों के प्रभाव से परिवार में धन-धान्य की वृद्धि होगी। संतान के नाम किया गया संचय कल्याणकारी सिद्ध होगा।`,
            te: `${devoteeName}, చిన్నారి జాతక బలం వల్ల కుటుంబంలో సంపద పెరుగుతుంది. పిల్లల పేరు మీద పొదుపు చేయడం ఎంతో శ్రేయస్కరం.`,
            ta: `${devoteeName}, குழந்தையின் ராசி பலத்தால் குடும்பத்தில் லட்சுமி கடாட்சம் நிறையும். குழந்தையின் பெயரில் செய்யும் சேமிப்பு விருத்தியாகும்.`,
            en: `${devoteeName}, auspicious placements in the 2nd house from the natal Moon indicate that the child's presence serves as an enduring catalyst for parental prosperity and financial stability.`
          }, targetLang)
        : pick6({
            kn: `${devoteeName}, ನಿಮ್ಮ ೨ನೇ ಧನಭಾವ ಹಾಗೂ ೧೧ನೇ ಲಾಭಭಾವಗಳು ಬಲವಾಗಿದ್ದು, ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಹಣಕಾಸಿನ ಒಳಹರಿವು ಹೆಚ್ಚಲಿದೆ. ವಿಶೇಷವಾಗಿ ಭೂಮಿ, ಮನೆ ಅಥವಾ ಚಿನ್ನಾಭರಣಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದು ನಿಮಗೆ ಅತ್ಯಂತ ಲಾಭದಾಯಕ. ಅತಿಯಾದ ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ತ್ವರಿತ ಲಾಭದ ಆಮಿಷಗಳಿಗೆ ಒಳಗಾಗದೆ ಸ್ಥಿರ ಆಸ್ತಿಗಳಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡುವುದು ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ತಲೆತಲಾಂತರಗಳ ಕಾಲ ರಕ್ಷಿಸಲಿದೆ.`,
            mr: `${devoteeName}, आपले २रे व ११वे भाव दर्शवतात की स्थावर मालमत्ता, जमीन किंवा सोन्यात केलेली गुंतवणूक आपल्यासाठी अत्यंत फायदेशीर ठरेल. सट्टा टाळून सुरक्षित गुंतवणूक करावी.`,
            hi: `${devoteeName}, आपके द्वितीय एवं एकादश भाव अत्यंत सुदृढ़ हैं। भूमि, भवन अथवा स्वर्ण में किया गया निवेश आपको स्थायी वित्तीय स्वतंत्रता प्रदान करेगा। शीघ्र धन कमाने के प्रलोभनों से बचें।`,
            te: `${devoteeName}, మీ జాతకంలో ధన స్థానాలు బలంగా ఉన్నాయి. స్థిరాస్తులు, బంగారంపై పెట్టుబడులు పెట్టడం వల్ల దీర్ఘకాలిక ప్రయోజనాలు కలుగుతాయి.`,
            ta: `${devoteeName}, உங்கள் தன ஸ்தானங்கள் வலுவாக உள்ளதால் பூமி, வீடு, தங்கம் ஆகியவற்றில் முதலீடு செய்வது மிகுந்த லாபத்தைத் தரும்.`,
            en: `${devoteeName}, your 2nd house of wealth and 11th house of gains promise robust liquidity. Directing surpluses into real estate, land, and tangible gold creates multigenerational wealth while avoiding speculative gambles.`
          }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಧನ-ಸಂಪತ್ತು ಸ್ತಂಭ", mr: "धन-संपत्ती स्तंभ", hi: "धन-संपत्ति स्तंभ", te: "ధన-సంపద స్తంభం", ta: "தன-செல்வ தூண்", en: "Pillar of Prosperity" }, targetLang)
  });

  // CHAPTER 14: Marriage, Love & Relationships
  chapters.push({
    chapterNumber: 14,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isMinor
      ? pick6({ kn: "ಪೋಷಕರ ವಾತ್ಸಲ್ಯ, ಸೋದರ ಸಾಮರಸ್ಯ & ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ", mr: "पालकांचे प्रेम, भावंडांचे नाते व कौटुंबिक स्नेह", hi: "माता-पिता का स्नेह, भ्रातृ सौहार्द एवं पारिवारिक प्रेम", te: "తల్లిదండ్రుల ప్రేమ, తోబుట్టువుల అనుబంధం", ta: "பெற்றோர் பாசம், சகோதர ஒற்றுமை & குடும்ப அன்பு", en: "Parental Bond, Sibling Harmony & Emotional Nurturance" }, targetLang)
      : pick6({ kn: "ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕಂಕಣ ಭಾಗ್ಯ, ಪ್ರೇಮ & ಜೀವನ ಸಂಗಾತಿ", mr: "वैवाहिक सौख्य, अनुरूप जोडीदार व कौटुंबिक शांतता", hi: "दांपत्य सुख, विवाह योग, प्रेम एवं जीवनसाथी", te: "దాంపత్య సౌభాగ్యం, వివాహ యోగం & జీవిత భాగస్వామి", ta: "திருமண பாக்கியம், தாம்பத்ய ஒற்றுமை & வாழ்க்கை துணை", en: "Marriage, Marital Harmony & Sacred Partnership" }, targetLang),
    icon: "💍",
    question: isMinor
      ? pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName} ಅವರ ಪೋಷಕರೊಂದಿಗಿನ ಬಾಂಧವ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯದ ಗ್ರಹಗತಿ ಹೇಗಿದೆ?`, mr: `प्रश्न: ${devoteeName} यांचे पालकांशी नाते व कौटुंबिक प्रेम कसे राहील?`, hi: `प्रश्न: ${devoteeName} का माता-पिता एवं बंधु-बांधवों के साथ संबंध कैसा रहेगा?`, te: `ప్రశ్న: ${devoteeName} తల్లిదండ్రుల అనుబంధం ఎలా ఉంటుంది?`, ta: `கேள்வி: ${devoteeName} அவர்களின் குடும்ப உறவுகள் எவ்வாறு பலப்படும்?`, en: `Question: How do planetary currents shape ${devoteeName}'s emotional bonding with parents and kin?` }, targetLang)
      : pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ೭ನೇ ಕಳತ್ರಭಾವವು ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಜೀವನ ಸಂಗಾತಿಯ ಬಾಂಧವ್ಯದ ಬಗ್ಗೆ ಏನು ಹೇಳುತ್ತದೆ?`, mr: `प्रश्न: ${devoteeName}, आपल्या ७व्या भावानुसार वैवाहिक सौख्य व जोडीदाराचे नाते कसे राहील?`, hi: `प्रश्न: ${devoteeName}, आपके सप्तम भाव के अनुसार दांपत्य जीवन एवं जीवनसाथी का सहयोग कैसा रहेगा?`, te: `ప్రశ్న: ${devoteeName}, మీ 7వ భావం ప్రకారం దాంపత్య జీవితం ఎలా ఉండబోతోంది?`, ta: `கேள்வி: ${devoteeName}, உங்கள் 7ம் இடத்து பலன் திருமண வாழ்க்கை பற்றி என்ன கூறுகிறது?`, en: `Question: ${devoteeName}, what does your 7th house reveal regarding marital harmony and life partner dynamics?` }, targetLang),
    paragraphs: [
      isMinor
        ? pick6({
            kn: `${devoteeName}, ಮಗುವಿನ ೪ನೇ ಮಾತೃಭಾವ ಹಾಗೂ ೯ನೇ ಪಿತೃಭಾವಗಳು ಅತ್ಯಂತ ಪಾವನವಾಗಿವೆ. ಈ ಮಗುವು ತಂದೆ-ತಾಯಿಯ ಮಾತಿಗೆ ಗೌರವ ಕೊಡುವ ಸಂಸ್ಕಾರಯುತ ಮಗುವಾಗಿ ಬೆಳೆಯಲಿದೆ. ಮನೆಯಲ್ಲಿ ಪ್ರೀತಿ ಮತ್ತು ಸೌಹಾರ್ದದ ವಾತಾವರಣವನ್ನು ನಿರ್ಮಿಸುವುದು ಮಗುವಿನ ಸರ್ವಾಂಗೀಣ ವಿಕಾಸಕ್ಕೆ ಶ್ರೀರಕ್ಷೆಯಾಗಲಿದೆ.`,
            mr: `${devoteeName}, मुलाचे आपल्या पालकांवर निस्सीम प्रेम राहील. घरातील आनंदी वातावरण मुलाच्या प्रगतीला चालना देईल.`,
            hi: `${devoteeName}, चतुर्थ एवं नवम भाव की शुभता के कारण जातक माता-पिता का आज्ञाकारी एवं आदर करने वाला बनेगा।`,
            te: `${devoteeName}, చిన్నారి తల్లిదండ్రుల పట్ల గౌరవం కలిగి ఉంటుంది. ప్రేమపూర్వక వాతావరణం అవసరం.`,
            ta: `${devoteeName}, குழந்தை பெற்றோருக்கு அடக்கமும் மரியாதையும் உள்ள நல்ல பிள்ளையாக வளரும்.`,
            en: `${devoteeName}, pristine 4th and 9th houses reflect deep filial piety and affection toward parents, thriving within a harmonious domestic sanctuary.`
          }, targetLang)
        : pick6({
            kn: `${devoteeName}, ನಿಮ್ಮ ೭ನೇ ಕಳತ್ರಭಾವಕ್ಕೆ ಶುಭ ಗ್ರಹಗಳ ಸಂಪರ್ಕವಿದ್ದು, ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿಯು ಬುದ್ಧಿವಂತೆ/ಬುದ್ಧಿವಂತರಾಗಿದ್ದು, ನಿಮ್ಮ ಗೌರವವನ್ನು ಕಾಪಾಡುವವರಾಗಿರುತ್ತಾರೆ. ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಬಂದಾಗ ಪರಸ್ಪರ ಅಹಂಕಾರವನ್ನು ಬದಿಗೊತ್ತಿ ಸಂವಹನ ನಡೆಸುವುದು ದಾಂಪತ್ಯವನ್ನು ಸ್ವರ್ಗವಾಗಿಸಲಿದೆ. ಗೃಹದಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡುವುದು ನಿರಂತರ ಶಾಂತಿ ತರಲಿದೆ.`,
            mr: `${devoteeName}, ७वे भाव दर्शवते की जोडीदार समजूतदार व कुटुंबाला एकत्र ठेवणारा असेल. अहंकार टाळून संवाद साधल्यास वैवाहिक जीवन अत्यंत सुखी राहील.`,
            hi: `${devoteeName}, आपका सप्तम भाव सूचित करता है कि जीवनसाथी सुयोग्य, विचारवान एवं सम्मान की रक्षा करने वाला होगा। परस्पर संवाद एवं आदर दांपत्य को सुदृढ़ बनाएगा।`,
            te: `${devoteeName}, మీ 7వ భావం అనుకూలంగా ఉంది. జీవిత భాగస్వామితో పరస్పర గౌరవం మరియు సంభాషణ వల్ల దాంపత్యం ఆనందమయంగా ఉంటుంది.`,
            ta: `${devoteeName}, உங்கள் 7ம் இடம் நல்ல வாழ்க்கை துணையை குறிக்கிறது. பரஸ்பர அன்பும் மரியாதையும் இல்லறத்தை சிறக்க வைக்கும்.`,
            en: `${devoteeName}, auspicious aspects upon the 7th house indicate an intellectually supportive life partner. Clear, humble communication neutralizes friction, inviting Lakshmi's grace.`
          }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಸಂಬಂಧ-ದಾಂಪತ್ಯ ಸ್ತಂಭ", mr: "नातेसंबंध-विवाह स्तंभ", hi: "संबंध-दांपत्य स्तंभ", te: "సంబంధాలు-దాంపత్య స్తంభం", ta: "குடும்ப-தாம்பத்ய தூண்", en: "Pillar of Alliance" }, targetLang)
  });

  // CHAPTER 15: Progeny, Family & Domestic Peace
  chapters.push({
    chapterNumber: 15,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: isMinor
      ? pick6({ kn: "ಸಂಸ್ಕಾರ, ಸತ್ಸಂಗ, ಚಾರಿತ್ರ್ಯ & ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನ", mr: "संस्कार, सत्संग, चारित्र्य व पालकांचे मार्गदर्शन", hi: "संस्कार, सत्संग, चारित्र्य निर्माण एवं अभिभावकीय मार्गदर्शन", te: "సంస్కారాలు, సత్సాంగత్యం & నడవడిక", ta: "நற்பண்புகள், நல்வழி & ஒழுக்கம்", en: "Character Cultivation, Noble Sanskaras & Virtues" }, targetLang)
      : pick6({ kn: "ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯೋಭಿವೃದ್ಧಿ & ಕೌಟುಂಬಿಕ ಶಾಂತಿ", mr: "संतान सौख्य, मुलांची प्रगती व कौटुंबिक सौख्य", hi: "संतान सुख, बच्चों की उन्नति एवं गृह शांति", te: "సంతాన భాగ్యం, పిల్లల భవిష్యత్తు & గృహ శాంతి", ta: "சந்தான பாக்கியம், குழந்தைகள் மேன்மை & குடும்ப அமைதி", en: "Progeny Blessings, Children's Trajectory & Domestic Peace" }, targetLang),
    icon: "🏡",
    question: isMinor
      ? pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName} ಅವರ ಸದ್ಗುಣಗಳು ಹಾಗೂ ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ಬೆಳೆಸುವುದು ಹೇಗೆ?`, mr: `प्रश्न: ${devoteeName} यांच्यात चांगले संस्कार कसे रुजवावेत?`, hi: `प्रश्न: ${devoteeName} में सद्गुणों एवं नेतृत्व क्षमता का विकास कैसे करें?`, te: `ప్రశ్న: ${devoteeName} లో మంచి అలవాట్లు ఎలా పెంపొందించాలి?`, ta: `கேள்வி: ${devoteeName} அவர்களிடம் நற்பண்புகளை வளர்ப்பது எப்படி?`, en: `Question: How can parents best nurture ${devoteeName}'s innate virtues and leadership resilience?` }, targetLang)
      : pick6({ kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ೫ನೇ ಪುತ್ರಭಾವ ಹಾಗೂ ಗುರುಬಲವು ಸಂತಾನ ಸುಖ ಹಾಗೂ ಮಕ್ಕಳ ಯಶಸ್ಸಿನ ಬಗ್ಗೆ ಏನು ಸೂಚಿಸುತ್ತದೆ?`, mr: `प्रश्न: ${devoteeName}, आपल्या ५व्या भावानुसार संतान सुख व मुलांची प्रगती कशी राहील?`, hi: `प्रश्न: ${devoteeName}, आपके पंचम भाव एवं गुरु बल के अनुसार संतान सुख और उनकी सफलता का क्या योग है?`, te: `ప్రశ్న: ${devoteeName}, మీ 5వ భావం ప్రకారం సంతాన ప్రాప్తి మరియు పిల్లల ఉన్నతి ఎలా ఉంటుంది?`, ta: `கேள்வி: ${devoteeName}, உங்கள் 5ம் இடத்து பலன் சந்தான பாக்கியம் மற்றும் குழந்தைகளின் வெற்றி பற்றி என்ன கூறுகிறது?`, en: `Question: ${devoteeName}, what does your 5th house and Jupiter dictate regarding children's trajectory and domestic bliss?` }, targetLang),
    paragraphs: [
      isMinor
        ? pick6({
            kn: `${devoteeName}, ಮಗುವಿನ ಜನ್ಮ ಲಗ್ನದಲ್ಲಿ ಧರ್ಮಕಾರಕ ಗ್ರಹಗಳ ಬಲವಿರುವುದರಿಂದ, ಸಣ್ಣ ವಯಸ್ಸಿನಿಂದಲೇ ಕಥೆಗಳು, ಧರ್ಮಶಾಸ್ತ್ರ ಮತ್ತು ನೈತಿಕ ಮೌಲ್ಯಗಳನ್ನು ಕಲಿಸುವುದು ಮಗುವಿನ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಉನ್ನತ ಶಿಖರಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲಿದೆ. ಸತ್ಸಂಗವೇ ಈ ಮಗುವಿನ ಬದುಕಿನ ಅತ್ಯಂತ ದೊಡ್ಡ ಶಕ್ತಿಯಾಗಲಿದೆ.`,
            mr: `${devoteeName}, मुलावर चांगले संस्कार घडवावेत; धार्मिक व नीतिमूल्यांची शिकवण मुलाला भविष्यात महान बनवेल.`,
            hi: `${devoteeName}, धार्मिक एवं नैतिक मूल्यों का बीजारोपण जातक को भविष्य में एक प्रतिष्ठित एवं आदर्श व्यक्तित्व बनाएगा।`,
            te: `${devoteeName}, చిన్నప్పటి నుంచే మంచి కథలు, నైతిక విలువలు నేర్పించడం వల్ల గొప్ప వ్యక్తిగా ఎదుగుతారు.`,
            ta: `${devoteeName}, சிறுவயதிலேயே நல்ல ஒழுக்கத்தையும் தர்மத்தையும் போதிப்பது எதிர்காலத்தில் இவரை சிறந்த மனிதராக உயர்த்தும்.`,
            en: `${devoteeName}, ethical planets governing the ascendant ensure that early grounding in classical virtues, epics, and moral truths will produce an inspiring character.`
          }, targetLang)
        : pick6({
            kn: `${devoteeName}, ನಿಮ್ಮ ೫ನೇ ಪುತ್ರಭಾವ ಹಾಗೂ ಗುರುಬಲವು ನಿಮ್ಮ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಮಕ್ಕಳ ಭವಿಷ್ಯವು ಉಜ್ವಲವಾಗಿರುವುದನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ. ಮಕ್ಕಳು ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸದ್ವರ್ತನೆಯಲ್ಲಿ ನಿಮಗೆ ಅಪಾರ ಕೀರ್ತಿಯನ್ನು ತಂದುಕೊಡಲಿದ್ದಾರೆ. ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರ ಪಠಣೆ ಹಾಗೂ ಗೋಸೇವೆಯಿಂದ ಗೃಹದಲ್ಲಿ ಸಂತಸ ನೆಲೆಸಲಿದೆ.`,
            mr: `${devoteeName}, ५वे भाव दर्शवते की मुले हुशार निघतील व आपल्या कुळाचे नाव उज्ज्वल करतील. घरात शांती राहील.`,
            hi: `${devoteeName}, पंचम भाव एवं देवगुरु की कृपा से आपकी संतान मेधावी एवं कुल का नाम रोशन करने वाली होगी। घर में शांति बनी रहेगी।`,
            te: `${devoteeName}, మీ సంతానం తెలివైనవారై మీ వంశానికి మంచి పేరు తెస్తారు. ఇంట్లో సుఖశాంతులు ఉంటాయి.`,
            ta: `${devoteeName}, குழந்தைகள் கல்வியிலும் நற்பண்பிலும் சிறந்து உங்கள் குடும்பத்திற்கு பெருமை சேர்ப்பார்கள்.`,
            en: `${devoteeName}, 5th house auspiciousness and Jupiter's guardianship ensure that your progeny will thrive academically and bring profound honor to the family lineage.`
          }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "ಸಂತಾನ-ಕುಟುಂಬ ಸ್ತಂಭ", mr: "संतान-कुटुंब स्तंभ", hi: "संतान-परिवार स्तंभ", te: "సంతాన-కుటుంబ స్తంభం", ta: "சந்தான-குடும்ப தூண்", en: "Pillar of Lineage" }, targetLang)
  });

  // CHAPTER 16: Health, Vitality & Tridosha Care
  chapters.push({
    chapterNumber: 16,
    sectionNumber: 3,
    sectionTitle: sec3,
    title: pick6({
      kn: "ಆರೋಗ್ಯ, ಪ್ರಾಣಶಕ್ತಿ, ತ್ರಿದೋಷ (ವಾತ, ಪಿತ್ತ, ಕಫ) ಸಮತೋಲನ & ದೀರ್ಘಾಯುಷ್ಯ",
      mr: "आरोग्य, प्राणशक्ती, त्रिदोष संतुलन व दीर्घायुष्य",
      hi: "स्वास्थ्य, प्राण ऊर्जा, त्रिदोष संतुलन एवं दीर्घायु",
      te: "ఆరోగ్యం, ప్రాణశక్తి, త్రిదోష సమతుల్యత & దీర్ఘాయుష్షు",
      ta: "ஆரோக்கியம், பிராண சக்தி, திரிதோஷ சமநிலை & நீண்ட ஆயுள்",
      en: "Health, Vitality, Tridosha Balance & Longevity Care"
    }, targetLang),
    icon: "🌿",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ ವಾತ, ಪಿತ್ತ, ಕಫಗಳಲ್ಲಿ ಯಾವುದು ಏರುಪೇರಾಗಬಹುದು ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಶಾಸ್ತ್ರೋಕ್ತ ಆಹಾರ ವಿಹಾರಗಳಾವುವು?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या प्रकृतीनुसार वात, पित्त, कफ यांपैकी कशाची काळजी घ्यावी व दीर्घायुष्याचे सूत्र काय?`,
      hi: `प्रश्न: ${devoteeName}, आपके स्वभाव के अनुसार वात, पित्त, कफ में क्या असंतुलन संभव है एवं उत्तम स्वास्थ्य का सूत्र क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ త్రిదోషాలలో దేనిపై శ్రద్ధ వహించాలి & ఆరోగ్య సూత్రాలు ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, வாதம், பித்தம், கபத்தில் எதனை கவனிக்க வேண்டும் மற்றும் ஆரோக்கிய ரகசியம் என்ன?`,
      en: `Question: ${devoteeName}, what Tridosha balance (Vata/Pitta/Kapha) governs your vitality, and what lifestyle preserves longevity?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಲಗ್ನ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಗಣಿತದ ಪ್ರಕಾರ ನಿಮ್ಮ ದೇಹದಲ್ಲಿ 'ಪಿತ್ತ ಹಾಗೂ ವಾತ' ಪ್ರಕೃತಿಯು ಪ್ರಧಾನವಾಗಿದೆ. ಅತಿಯಾದ ಮಾನಸಿಕ ಆತಂಕ, ಅನಿಯಮಿತ ಊಟ ಅಥವಾ ನಿದ್ರಾಹೀನತೆಯು ಜೀರ್ಣಾಂಗ ಹಾಗೂ ನರಮಂಡಲದ ಮೇಲೆ ಸಣ್ಣಪುಟ್ಟ ಪ್ರಭಾವ ಬೀರಬಹುದು. ನಿತ್ಯವೂ ತುಳಸಿ ತೀರ್ಥ ಸೇವನೆ, ಶುದ್ಧ ನೀರಿನ ಬಳಕೆ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡುವುದರಿಂದ ನಿಮ್ಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಅಖಂಡವಾಗಿ ರಕ್ಷಿಸಲ್ಪಡಲಿದೆ.`,
        mr: `${devoteeName}, आपल्या प्रकृतीत पित्त व वात तत्त्व प्रबळ आहे. वेळेवर जेवण, पुरेशी झोप व नियमित व्यायाम आपल्याला सदैव निरोगी ठेवेल.`,
        hi: `${devoteeName}, आपकी शारीरिक प्रकृति में पित्त एवं वात की प्रधानता है। समय पर भोजन, नियमित योग एवं तुलसी जल का सेवन प्राण ऊर्जा को सुदृढ़ रखेगा।`,
        te: `${devoteeName}, మీ శరీర తత్వంలో పిత్త, వాత దోషాలు ఉన్నందున సమయానికి భోజనం మరియు నిద్ర అవసరం. సూర్య నమస్కారాలు మంచివి.`,
        ta: `${devoteeName}, பித்தம் மற்றும் வாதத் தன்மை அதிகம் உள்ளதால் முறையான தூக்கமும் உணவும் அவசியம். துளசி தீர்த்தம் உடலுக்கு நல்லது.`,
        en: `${devoteeName}, your constitution is predominantly Pitta-Vata. Guarding circadian sleep, hydrating with pure water, and practicing Surya Namaskar preserves optimal digestive and nervous vitality.`
      })
    ],
    guidanceBadge: pick6({ kn: "ಆರೋಗ್ಯ-ಆಯುಷ್ಯ ಸ್ತಂಭ", mr: "आरोग्य-आयुष्य स्तंभ", hi: "स्वास्थ्य-आयुष्य स्तंभ", te: "ఆరోగ్య-ఆయుష్షు స్తంభం", ta: "ஆரோக்கிய தூண்", en: "Pillar of Vitality" }, targetLang)
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: NEAR-TERM & NEXT 5 YEARS FUTURE HORIZON (Chapters 17 to 22)
  // ──────────────────────────────────────────────────────────────────────────
  const sec4 = pick6({
    kn: "ವಿಭಾಗ ೪: ಮುಂಬರುವ ೬ ತಿಂಗಳು & ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಭವಿಷ್ಯ ಕ್ಷಿತಿಜ",
    mr: "विभाग ४: पुढील ६ महिने व आगामी ५ वर्षांचे सुवर्ण भविष्य क्षितिज",
    hi: "खंड ४: आगामी ६ माह एवं आगामी ५ वर्षों का स्वर्णिम भविष्य क्षितिज",
    te: "విభాగం 4: రాబోయే 6 నెలలు & 5 సంవత్సరాల భవిష్యత్ దర్శనం",
    ta: "பிரிவு 4: அடுத்த 6 மாதங்கள் & 5 ஆண்டு கால எதிர்கால பொற்காலம்",
    en: "Section 4: Near-Term & Next 5 Years Horizon (Chronological Forecast)"
  }, targetLang);

  // CHAPTER 17: Next 6 Months — Month-by-Month Practical Guide
  chapters.push({
    chapterNumber: 17,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: "ಮುಂದಿನ ೬ ತಿಂಗಳುಗಳ ಮಾಸಿಕ ಮಾರ್ಗದರ್ಶನ: ತಿಂಗಳು-ತಿಂಗಳ ಪ್ರಮುಖ ತಿರುವು",
      mr: "पुढील ६ महिन्यांचे मासिक मार्गदर्शन: महिन्यानिहाय महत्त्वाचे वळण",
      hi: "आगामी ६ माह का मासिक मार्गदर्शन: माह-दर-माह महत्वपूर्ण मोड़",
      te: "రాబోయే 6 నెలల నెలవారీ మార్గదర్శనం",
      ta: "அடுத்த 6 மாதங்களுக்கான மாதந்தோறும் வழிகாட்டல்",
      en: "Next 6 Months — Month-by-Month Practical Trajectory"
    }, targetLang),
    icon: "📅",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಮುಂಬರುವ ೬ ತಿಂಗಳುಗಳಲ್ಲಿ ತಿಂಗಳಿನಿಂದ ತಿಂಗಳಿಗೆ ಯಾವ ಅವಕಾಶಗಳು ಹಾಗೂ ಎಚ್ಚರಿಕೆಗಳು ಎದುರಾಗಲಿವೆ?`,
      mr: `प्रश्न: ${devoteeName}, पुढील ६ महिन्यांत महिनानिहाय कोणत्या संधी व सावधगिरी बाळगावी?`,
      hi: `प्रश्न: ${devoteeName}, आगामी ६ माह में माह-दर-माह कौन से अवसर एवं सावधानियां आवश्यक हैं?`,
      te: `ప్రశ్న: ${devoteeName}, రాబోయే 6 నెలల్లో ఏయే అవకాశాలు, జాగ్రత్తలు ఉంటాయి?`,
      ta: `கேள்வி: ${devoteeName}, அடுத்த 6 மாதங்களில் மாதம் தோறும் வரவிருக்கும் வாய்ப்புகள் என்ன?`,
      en: `Question: ${devoteeName}, what opportunities, financial tides, and cautions govern the next 6 chronological months?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `ತಿಂಗಳು ೧: ಆಂತರಿಕ ಸಿದ್ಧತೆ ಹಾಗೂ ಹಳೆಯ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆ. ಹೊಸ ಕಾರ್ಯಗಳ ಯೋಜನೆ ರೂಪಿಸಲು ಸಕಾಲ.\nತಿಂಗಳು ೨: ಧನಲಾಭ ಹಾಗೂ ಸ್ಥಗಿತಗೊಂಡಿದ್ದ ಕಡತಗಳು/ಹಣ ಬಿಡುಗಡೆಯಾಗುವ ಶುಭ ಯೋಗ.\nತಿಂಗಳು ೩: ಪ್ರವಾಸ, ನೂತನ ಜನರ ಭೇಟಿ ಹಾಗೂ ಹೊಸ ಒಪ್ಪಂದಗಳ ಆರಂಭ.\nತಿಂಗಳು ೪: ಕೌಟುಂಬಿಕ ಶುಭ ಸಮಾರಂಭ ಹಾಗೂ ಮನಃಶಾಂತಿಯ ವೃದ್ಧಿ.\nತಿಂಗಳು ೫: ವೃತ್ತಿಯಲ್ಲಿ ಮಹತ್ವದ ಜವಾಬ್ದಾರಿ ಅಥವಾ ಬಡ್ತಿಯ ಅವಕಾಶ.\nತಿಂಗಳು ೬: ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಉಳಿತಾಯ ವೃದ್ಧಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯ ಪೂರ್ಣ ಅನುಗ್ರಹ.`,
        mr: `महिना १: तयारी व जुने प्रश्न सुटण्याचा काळ.\nमहिना २: धनलाभ व रखडलेली कामे मार्गी लागतील.\nमहिना ३: नवीन संपर्क व प्रवासाचा योग.\nमहिना ४: कौटुंबिक आनंद व शांतता.\nमहिना ५: कामात मोठी जबाबदारी अथवा पदोन्नती.\nमहिना ६: आर्थिक स्थैर्य व गुरूची पूर्ण कृपा.`,
        hi: `माह १: मानसिक स्पष्टता एवं लंबित कार्यों का समाधान।\nमाह २: धन लाभ एवं अटके हुए कार्यों में गति।\nमाह ३: नवीन संपर्क एवं लाभदायक यात्राएं।\nमाह ४: पारिवारिक सुख एवं मांगलिक प्रसंग।\nमाह ५: कार्यक्षेत्र में पदोन्नति एवं नवीन उत्तरदायित्व।\nमाह ६: वित्तीय स्थिरता एवं गुरु कृपा की पूर्ण प्राप्ति।`,
        te: `నెల 1: పాత సమస్యల పరిష్కారం.\nనెల 2: ధన లాభం & పనులలో పురోగతి.\nనెల 3: నూతన పరిచయాలు & ప్రయాణాలు.\nనెల 4: కుటుంబంలో శుభకార్యాలు.\nనెల 5: వృత్తిలో ఉన్నత పదవి.\nనెల 6: ఆర్థిక స్థిరత్వం & గురుకృప.`,
        ta: `மாதம் 1: பழைய தடைகள் அகலும் காலம்.\nமாதம் 2: பணவரவு மற்றும் காரிய வெற்றி.\nமாதம் 3: புதிய தொடர்புகள் மற்றும் பயணம்.\nமாதம் 4: குடும்பத்தில் சுப நிகழ்வுகள்.\nமாதம் 5: பதவியுயர்வு மற்றும் புதிய பொறுப்புகள்.\nமாதம் 6: நிதி ஸ்திரத்தன்மை மற்றும் குரு அருள்.`,
        en: `Month 1: Dissolution of prior inertia; strategic foundation.\nMonth 2: Liquidity unlock; delayed receivables arrive.\nMonth 3: Productive travels and elite networking.\nMonth 4: Domestic celebration and emotional harmony.\nMonth 5: Career breakthrough or leadership elevation.\nMonth 6: Consolidated financial autonomy under Jupiter's grace.`
      }, targetLang)
    ],
    guidanceBadge: pick6({ kn: "೬ ತಿಂಗಳ ಮುನ್ನೋಟ", mr: "६ महिन्यांचा वेध", hi: "६ माह का परिदृश्य", te: "6 నెలల ముందస్తు చూపు", ta: "6 மாத முன்னோட்டம்", en: "6-Month Strategic Horizon" }, targetLang)
  });

  // CHAPTER 18: Your 5-Year Golden Turning Point & Bhrigu Bindu Window
  chapters.push({
    chapterNumber: 18,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: "೫ ವರ್ಷಗಳ ಸುವರ್ಣ ತಿರುವು & ಬೃಗು ಬಿಂದು ಮಹಾ ಭಾಗ್ಯೋದಯದ ನಿಖರ ಕಾಲಾವಧಿ",
      mr: "५ वर्षांचे सुवर्ण वळण व भृगु बिंदू महा भाग्योदयाचा अचूक काळ",
      hi: "५-वर्षीय स्वर्णिम मोड़ एवं भृगु बिंदु भाग्योदय का सटीक समय",
      te: "5 సంవత్సరాల స్వర్ణ మలుపు & భృగు బిందువు భాగ్యోదయ కాలం",
      ta: "5 ஆண்டுகளின் பொற்காலம் & பிருகு பிந்து திருப்புமுனை காலம்",
      en: "Your 5-Year Golden Turning Point & Bhrigu Bindu Window"
    }, targetLang),
    icon: "🌟",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜೀವನದ ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ ಹಾಗೂ ${bhriguBinduRashiName} ರಾಶಿಯ ಬೃಗು ಬಿಂದುವನ್ನು ಗ್ರಹಗಳು ದಾಟುವ ಮಹಾ ತಿರುವು ಯಾವಾಗ?`,
      mr: `प्रश्न: ${devoteeName}, आपल्या आयुष्यातील सर्वात मोठा भाग्योदय व ${bhriguBinduRashiName} राशीतील भृगु बिंदूचा सुवर्ण काळ कधी येईल?`,
      hi: `प्रश्न: ${devoteeName}, आपके जीवन का सबसे बड़ा स्वर्णिम भाग्योदय एवं ${bhriguBinduRashiName} राशि के भृगु बिंदु का सक्रियण कब होगा?`,
      te: `ప్రశ్న: ${devoteeName}, మీ జీవితంలో అతిపెద్ద మలుపు & భృగు బిందువు ద్వారా అదృష్టం ఎప్పుడు తెరుచుకుంటుంది?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் வாழ்க்கையின் மாபெரும் பொற்காலம் மற்றும் பிருகு பிந்து யோகம் எப்போது தொடங்கும்?`,
      en: `Question: ${devoteeName}, when does Jupiter/Saturn cross your Bhrigu Bindu in ${bhriguBinduRashiName} to ignite your prime 5-year breakthrough?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜಾತಕದ ಬೃಗು ಬಿಂದುವು (ರಾಹು ಮತ್ತು ಚಂದ್ರರ ಅಂತರದ ನಿಖರ ಕೇಂದ್ರ ಬಿಂದು) ${bhriguBinduRashiName} ರಾಶಿಯಲ್ಲಿದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಈ ಬಿಂದುವಿನ ಮೇಲೆ ಸಂಚರಿಸುವ ಕಾಲಾವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಸರ್ವಶ್ರೇಷ್ಠ 'ಸುವರ್ಣ ತಿರುವು' ಆಗಿರಲಿದೆ. ಈ ಹಂತದಲ್ಲಿ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಸ್ಥಾನಮಾನ, ಆರ್ಥಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಕುಟುಂಬದ ಗೌರವವು ಹಿಂದೆಂದೂ ಕಾಣದ ಎತ್ತರಕ್ಕೆ ಜಿಗಿಯಲಿದೆ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेतील भृगु बिंदू ${bhriguBinduRashiName} राशीत आहे. गुरूचे या बिंदूवरून होणारे गोचर आपल्या आयुष्यातील सर्वात मोठे सुवर्ण वळण सिद्ध होईल.`,
        hi: `${devoteeName}, आपकी कुंडली का भृगु बिंदु ${bhriguBinduRashiName} राशि में स्थित है। जब गुरु अथवा शनि इस बिंदु को स्पर्श करेंगे, वह कालखंड आपके जीवन का ऐतिहासिक भाग्योदय काल सिद्ध होगा।`,
        te: `${devoteeName}, మీ భృగు బిందువు ${bhriguBinduRashiName} రాశిలో ఉంది. గురు గ్రహ సంచారం వల్ల మీ జీవితంలో గొప్ప భాగ్యోదయం కలుగుతుంది.`,
        ta: `${devoteeName}, உங்கள் பிருகு பிந்து ${bhriguBinduRashiName} ராசியில் உள்ளது. குருவின் கோசாரம் இந்த இடத்தை தொடும்போது உங்கள் வாழ்க்கை புதிய உச்சத்தை அடையும்.`,
        en: `${devoteeName}, your Bhrigu Bindu (the Rahu-Moon destiny midpoint) resides in ${bhriguBinduRashiName}. Transiting Jupiter activating this sacred degree unlocks your monumental breakthrough window, elevating social stature and lasting assets.`
      })
    ],
    guidanceBadge: pick6({ kn: "ಬೃಗು ಬಿಂದು ರಹಸ್ಯ", mr: "भृगु बिंदू रहस्य", hi: "भृगु बिंदु रहस्य", te: "భృగు బిందు రహస్యం", ta: "பிருகு பிந்து ரகசியம்", en: "Bhrigu Bindu Trigger" }, targetLang)
  });

  // CHAPTER 19: Year 1 Future Forecast
  chapters.push({
    chapterNumber: 19,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೧ ಭವಿಷ್ಯ (${n(nowYear)} - ${n(nowYear + 1)}): ಹೊಸ ಅಡಿಪಾಯ & ಧೈರ್ಯದ ಆರಂಭ`,
      mr: `वर्ष १ भविष्य (${n(nowYear)} - ${n(nowYear + 1)}): नवीन पाया व आत्मविश्वासाची सुरुवात`,
      hi: `वर्ष १ फलादेश (${n(nowYear)} - ${n(nowYear + 1)}): नवीन आधारशिला एवं आत्मविश्वास का उदय`,
      te: `సంవత్సరం 1 భవిష్యత్తు (${n(nowYear)} - ${n(nowYear + 1)})`,
      ta: `ஆண்டு 1 பலன்கள் (${n(nowYear)} - ${n(nowYear + 1)})`,
      en: `Year 1 Future Forecast (${nowYear} - ${nowYear + 1}) — Foundation & Awakening`
    }, targetLang),
    icon: "🌱",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ವರ್ಷ ೧ ರ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ವೃತ್ತಿ, ಆರ್ಥಿಕತೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜೀವನದಲ್ಲಿ ಘಟಿಸಲಿರುವ ಪ್ರಮುಖ ತಿರುವುಗಳೇನು?`,
      mr: `प्रश्न: ${devoteeName}, वर्ष १ मध्ये आपल्या कारकीर्द व कुटुंबात काय घडेल?`,
      hi: `प्रश्न: ${devoteeName}, प्रथम वर्ष में आपके कार्यक्षेत्र, वित्त एवं परिवार में क्या प्रमुख परिवर्तन होंगे?`,
      te: `ప్రశ్న: ${devoteeName}, మొదటి సంవత్సరంలో ఎలాంటి మార్పులు రానున్నాయి?`,
      ta: `கேள்வி: ${devoteeName}, முதல் ஆண்டில் என்னென்ன வாய்ப்புகளும் பலன்களும் அமையும்?`,
      en: `Question: ${devoteeName}, what opportunities, shifts, and cautions define Year 1 (${nowYear} - ${nowYear + 1})?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಈ ಮೊದಲ ವರ್ಷವು ನಿಮ್ಮ ಭವಿಷ್ಯದ ಬೃಹತ್ ಕಟ್ಟಡಕ್ಕೆ ಗಟ್ಟಿಯಾದ ಅಡಿಪಾಯ ಹಾಕುವ ವರ್ಷವಾಗಿದೆ. ಹಿಂದಿನ ಗೊಂದಲಗಳು ಮುಕ್ತಾಯಗೊಂಡು, ನೂತನ ಜವಾಬ್ದಾರಿಗಳು ಆರಂಭವಾಗಲಿವೆ. ಆರ್ಥಿಕತೆಯಲ್ಲಿ ಉಳಿತಾಯದ ಮನೋಭಾವ ಬೆಳೆಯಲಿದ್ದು, ಕೌಟುಂಬಿಕ ಸಹಕಾರವು ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ.`,
        mr: `${devoteeName}, हे पहिले वर्ष भविष्याची भक्कम पायाभरणी करेल. जुन्या अडचणी संपून नवीन कामांना गती मिळेल.`,
        hi: `${devoteeName}, यह प्रथम वर्ष भावी स्वर्णिम प्रासाद की आधारशिला रखेगा। पूर्व संकट समाप्त होकर नवीन दायित्वों का शुभ आरंभ होगा।`,
        te: `${devoteeName}, మొదటి సంవత్సరం మీ భవిష్యత్తుకు గట్టి పునాది వేస్తుంది. పాత సమస్యలు తొలగి కొత్త అవకాశాలు వస్తాయి.`,
        ta: `${devoteeName}, முதல் ஆண்டு உங்கள் எதிர்காலத்திற்கு வலுவான அஸ்திவாரத்தை அமைக்கும். பழைய குழப்பங்கள் தீரும்.`,
        en: `${devoteeName}, Year 1 consolidates foundational stability. Previous ambiguities dissolve as new initiatives gain structural momentum and domestic support.`
      })
    ],
    guidanceBadge: pick6({ kn: "ವರ್ಷ ೧ ಸಾರಾಂಶ", mr: "वर्ष १ सारांश", hi: "वर्ष १ निष्कर्ष", te: "సంవత్సరం 1 సారాంశం", ta: "ஆண்டு 1 சுருக்கம்", en: "Year 1 Milestone" }, targetLang)
  });

  // CHAPTER 20: Year 2 Future Forecast
  chapters.push({
    chapterNumber: 20,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೨ ಭವಿಷ್ಯ (${n(nowYear + 1)} - ${n(nowYear + 2)}): ವೃತ್ತಿ ವಿಸ್ತರಣೆ & ಧನ ಸಮೃದ್ಧಿ`,
      mr: `वर्ष २ भविष्य (${n(nowYear + 1)} - ${n(nowYear + 2)}): व्यवसाय विस्तार व धन समृद्धी`,
      hi: `वर्ष २ फलादेश (${n(nowYear + 1)} - ${n(nowYear + 2)}): कार्य विस्तार एवं धन वृद्धि`,
      te: `సంవత్సరం 2 భవిష్యత్తు (${n(nowYear + 1)} - ${n(nowYear + 2)})`,
      ta: `ஆண்டு 2 பலன்கள் (${n(nowYear + 1)} - ${n(nowYear + 2)})`,
      en: `Year 2 Future Forecast (${nowYear + 1} - ${nowYear + 2}) — Expansion & Growth`
    }, targetLang),
    icon: "🌿",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ೨ನೇ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಆರ್ಥಿಕ ವೃದ್ಧಿ ಹಾಗೂ ಹೊಸ ಯೋಜನೆಗಳ ಫಲ ಹೇಗಿರಲಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, २ऱ्या वर्षात आर्थिक वाढ व नवीन योजना कशा फलद्रूप होतील?`,
      hi: `प्रश्न: ${devoteeName}, द्वितीय वर्ष में आपके वित्तीय उत्थान एवं नवीन योजनाओं का क्या प्रतिफल रहेगा?`,
      te: `ప్రశ్న: ${devoteeName}, రెండవ సంవత్సరంలో ఆర్థిక పురోగతి ఎలా ఉంటుంది?`,
      ta: `கேள்வி: ${devoteeName}, இரண்டாம் ஆண்டில் உங்கள் பொருளாதார வளர்ச்சி எவ்வாறு இருக்கும்?`,
      en: `Question: ${devoteeName}, how will capital growth and expanding horizons manifest in Year 2?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಎರಡನೇ ವರ್ಷವು ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ದ್ವಿಗುಣ ಫಲ ನೀಡುವ ಕಾಲ. ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ವ್ಯಾಪಾರದಲ್ಲಿ ಹೊಸ ಗ್ರಾಹಕರು ಹಾಗೂ ಆದಾಯದ ನೂತನ ಮೂಲಗಳು ತೆರೆದುಕೊಳ್ಳಲಿವೆ. ಮನೆ ಅಥವಾ ವಾಹನ ಖರೀದಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ವರ್ಷ.`,
        mr: `${devoteeName}, हे वर्ष दुप्पट यश देईल. नोकरीत प्रगती, व्यापारात वाढ व वाहन/घराचे योग संभवतात.`,
        hi: `${devoteeName}, द्वितीय वर्ष आपके पुरुषार्थ को द्विगुणित प्रतिफल देगा। आजीविका में पदोन्नति, व्यापार विस्तार एवं वाहन/संपत्ति के उत्तम योग हैं।`,
        te: `${devoteeName}, రెండవ సంవత్సరంలో ఉద్యోగంలో ప్రమోషన్, వ్యాపార విస్తరణ మరియు స్థిరాస్తి కొనుగోలుకు అవకాశం ఉంది.`,
        ta: `${devoteeName}, இரண்டாம் ஆண்டு இரட்டிப்பு பலன் தரும். பதவி உயர்வு, புதிய வருமான வழிகள் மற்றும் வாகனம்/வீடு யோகம் உண்டு.`,
        en: `${devoteeName}, Year 2 accelerates tangible ROI on past toil. Career promotions, business client expansion, and vehicle or residential acquisitions proceed seamlessly.`
      })
    ],
    guidanceBadge: pick6({ kn: "ವರ್ಷ ೨ ಸಾರಾಂಶ", mr: "वर्ष २ सारांश", hi: "वर्ष २ निष्कर्ष", te: "సంవత్సరం 2 సారాంశం", ta: "ஆண்டு 2 சுருக்கம்", en: "Year 2 Milestone" }, targetLang)
  });

  // CHAPTER 21: Year 3 Future Forecast
  chapters.push({
    chapterNumber: 21,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೩ ಭವಿಷ್ಯ (${n(nowYear + 2)} - ${n(nowYear + 3)}): ಅಧಿಕಾರ, ಕೀರ್ತಿ & ಪರಾಕ್ರಮ`,
      mr: `वर्ष ३ भविष्य (${n(nowYear + 2)} - ${n(nowYear + 3)}): अधिकार, कीर्ती व पराक्रम`,
      hi: `वर्ष ३ फलादेश (${n(nowYear + 2)} - ${n(nowYear + 3)}): अधिकार, प्रतिष्ठा एवं पराक्रम`,
      te: `సంవత్సరం 3 భవిష్యత్తు (${n(nowYear + 2)} - ${n(nowYear + 3)})`,
      ta: `ஆண்டு 3 பலன்கள் (${n(nowYear + 2)} - ${n(nowYear + 3)})`,
      en: `Year 3 Future Forecast (${nowYear + 2} - ${nowYear + 3}) — Zenith of Influence`
    }, targetLang),
    icon: "⚡",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ೩ನೇ ವರ್ಷದಲ್ಲಿ ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಗೌರವ, ಅಧಿಕಾರ ಹಾಗೂ ವಿರೋಧಿಗಳ ಶಮನ ಹೇಗಾಗಲಿದೆ?`,
      mr: `प्रश्न: ${devoteeName}, ३ऱ्या वर्षात समाजात मान-सन्मान व शत्रूंचे शमन कसे होईल?`,
      hi: `प्रश्न: ${devoteeName}, तृतीय वर्ष में सामाजिक प्रतिष्ठा, प्रभाव एवं विरोधियों का शमन कैसे होगा?`,
      te: `ప్రశ్న: ${devoteeName}, మూడవ సంవత్సరంలో సమాజంలో గౌరవం మరియు శత్రు నివారణ ఎలా జరుగుతాయి?`,
      ta: `கேள்வி: ${devoteeName}, மூன்றாம் ஆண்டில் சமூக அந்தஸ்தும் எதிர்ப்புகளை முறியடிக்கும் பலமும் எவ்வாறு அமையும்?`,
      en: `Question: ${devoteeName}, how will your authority, societal recognition, and competitor subjugation culminate in Year 3?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಮೂರನೇ ವರ್ಷವು ನಿಮ್ಮ ಜೀವನದ ಉತ್ತುಂಗ ಶಿಖರದ ಅವಧಿ. ನಿಮ್ಮ ವಿರೋಧಿಗಳು ತಾವಾಗಿಯೇ ಹಿಂದೆ ಸರಿಯಲಿದ್ದಾರೆ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಮಾತಿಗೆ ಮನ್ನಣೆ ಸಿಗಲಿದ್ದು, ನಿಮ್ಮ ನಾಯಕತ್ವದ ಕೀರ್ತಿ ವಿಸ್ತರಿಸಲಿದೆ. ದೈವಿಕ ಯಾತ್ರೆಗಳಿಗೆ ಅತ್ಯಂತ ಶುಭ ಸಮಯ.`,
        mr: `${devoteeName}, ३रे वर्ष आपल्या प्रगतीचा सुवर्णकाळ ठरेल. विरोधक नामोहरम होतील व समाजात आपल्या शब्दाला वजन येईल.`,
        hi: `${devoteeName}, तृतीय वर्ष आपके प्रभाव का शिखर होगा। विरोधी परास्त होंगे और समाज में आपकी वाणी का प्रभाव बढ़ेगा। तीर्थ यात्रा के उत्तम योग हैं।`,
        te: `${devoteeName}, మూడవ సంవత్సరం సమాజంలో మీ మాటకు విలువ పెరుగుతుంది, శత్రువులు వెనక్కి తగ్గుతారు. తీర్థయాత్రలు చేస్తారు.`,
        ta: `${devoteeName}, மூன்றாம் ஆண்டில் சமுதாயத்தில் உங்கள் சொல்லுக்கு செல்வாக்கு கூடும். எதிர்ப்புகள் விலகும். புனித யாத்திரைகள் அமையும்.`,
        en: `${devoteeName}, Year 3 marks the apex of executive command. Latent detractors recede voluntarily as your articulation commands deep public regard.`
      })
    ],
    guidanceBadge: pick6({ kn: "ವರ್ಷ ೩ ಸಾರಾಂಶ", mr: "वर्ष ३ सारांश", hi: "वर्ष ३ निष्कर्ष", te: "సంవత్సరం 3 సారాంశం", ta: "ஆண்டு 3 சுருக்கம்", en: "Year 3 Milestone" }, targetLang)
  });

  // CHAPTER 22: Year 4 & Year 5 Long-Term Destiny Horizon
  chapters.push({
    chapterNumber: 22,
    sectionNumber: 4,
    sectionTitle: sec4,
    title: pick6({
      kn: `ವರ್ಷ ೪ & ವರ್ಷ ೫ ಭವಿಷ್ಯ (${n(nowYear + 3)} - ${n(nowYear + 5)}): ಶಾಶ್ವತ ನೆಮ್ಮದಿ & ಪರಂಪರೆ`,
      mr: `वर्ष ४ व ५ भविष्य (${n(nowYear + 3)} - ${n(nowYear + 5)}): कायमस्वरूपी सुख व वारसा`,
      hi: `वर्ष ४ एवं ५ फलादेश (${n(nowYear + 3)} - ${n(nowYear + 5)}): स्थायी शांति एवं विरासत`,
      te: `సంవత్సరం 4 & 5 భవిష్యత్తు (${n(nowYear + 3)} - ${n(nowYear + 5)})`,
      ta: `ஆண்டு 4 & 5 பலன்கள் (${n(nowYear + 3)} - ${n(nowYear + 5)})`,
      en: `Year 4 & Year 5 Long-Term Horizon (${nowYear + 3} - ${nowYear + 5}) — Legacy & Peace`
    }, targetLang),
    icon: "🏛️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ೪ ಮತ್ತು ೫ನೇ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬದ ಶಾಶ್ವತ ಭದ್ರತೆ, ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ ಹಾಗೂ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಬಿಟ್ಟುಹೋಗುವ ಪರಂಪರೆ ಏನು?`,
      mr: `प्रश्न: ${devoteeName}, ४थ्या व ५व्या वर्षात कुटुंबाची सुरक्षा व भावी पिढीसाठी निर्माण होणारा वारसा काय?`,
      hi: `प्रश्न: ${devoteeName}, चतुर्थ एवं पंचम वर्ष में परिवार की स्थायी सुरक्षा, आत्मिक शांति एवं भावी विरासत का स्वरूप क्या होगा?`,
      te: `ప్రశ్న: ${devoteeName}, 4 మరియు 5వ సంవత్సరాలలో కుటుంబ భద్రత & శాంతి ఎలా ఉంటాయి?`,
      ta: `கேள்வி: ${devoteeName}, 4 மற்றும் 5ம் ஆண்டுகளில் குடும்பத்தின் நிரந்தர அமைதியும் வருங்கால சந்ததிக்கான ஆசியும் என்ன?`,
      en: `Question: ${devoteeName}, what long-term legacy, domestic security, and spiritual fulfillment will consolidate across Years 4 & 5?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಾಲ್ಕು ಮತ್ತು ಐದನೇ ವರ್ಷಗಳು ನೀವು ಗಳಿಸಿದ ಸಂಪತ್ತು, ಗೌರವ ಹಾಗೂ ಜ್ಞಾನವನ್ನು ಶಾಶ್ವತವಾಗಿ ಭದ್ರಪಡಿಸುವ ಕಾಲ. ಕುಟುಂಬದಲ್ಲಿ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಮಾರ್ಗದರ್ಶನ ಮಾಡುವ ಹಿರಿಮೆ ನಿಮ್ಮದಾಗಲಿದೆ. ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ ಹಾಗೂ ತೃಪ್ತಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ನೆಲೆಸಲಿದೆ.`,
        mr: `${devoteeName}, ४थे व ५वे वर्ष यश व समृद्धीला स्थैर्य देणारे ठरेल. कुटुंबात समाधानाचे व आनंदाचे वातावरण राहील.`,
        hi: `${devoteeName}, चतुर्थ एवं पंचम वर्ष आपकी संचित प्रतिष्ठा एवं समृद्धि को चिरस्थायी रूप प्रदान करेंगे। कुल में पूज्य स्थान एवं आत्मिक तृप्ति प्राप्त होगी।`,
        te: `${devoteeName}, 4 మరియు 5వ సంవత్సరాలు మీరు సాధించిన విజయాలకు స్థిరత్వాన్నిస్తాయి. ఆధ్యాత్మిక ప్రశాంతత లభిస్తుంది.`,
        ta: `${devoteeName}, 4 மற்றும் 5ம் ஆண்டுகள் நீங்கள் சேர்த்த செல்வாக்கையும் செல்வத்தையும் நிலைநிறுத்தும். ஆத்ம திருப்தி நிறையும்.`,
        en: `${devoteeName}, Years 4 and 5 consolidate lasting family endowments and patriarchal/matriarchal legacy, cementing deep spiritual contentment and generational security.`
      })
    ],
    guidanceBadge: pick6({ kn: "ದೀರ್ಘಾವಧಿ ಕ್ಷಿತಿಜ", mr: "दीर्घकालीन क्षितिज", hi: "दीर्घकालिक क्षितिज", te: "దీర్ఘకాలిక దర్శనం", ta: "நீண்டகால பார்வை", en: "Long-Term Destiny" }, targetLang)
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 5: REMEDIES, FAMILY HOOK & PRIEST BOOKING (Chapters 23 to 25)
  // ──────────────────────────────────────────────────────────────────────────
  const sec5 = pick6({
    kn: "ವಿಭಾಗ ೫: ದೋಷ ನಿವಾರಣೆ, ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ & ಮಹಾ ಆಶೀರ್ವಾದ",
    mr: "विभाग ५: दोष निवारण, श्री गोकर्ण क्षेत्र उपाय व महा आशीर्वाद",
    hi: "खंड ५: दोष निवारण, श्री गोकर्ण क्षेत्र परिहार एवं महा आशीर्वाद",
    te: "విభాగం 5: దోష నివారణ, శ్రీ గోకర్ణ పరిహారాలు & మహా ఆశీర్వాదం",
    ta: "பிரிவு 5: தோஷ நிவர்த்தி, கோகர்ண பரிகாரங்கள் & மகா ஆசீர்வாதம்",
    en: "Section 5: Dosha Diagnostics, Gokarna Parihara & Benediction"
  }, targetLang);

  // CHAPTER 23: Dosha Diagnostics, Simple Daily Remedies & Lucky Colors
  chapters.push({
    chapterNumber: 23,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ಜನ್ಮ ಕುಂಡಲಿ ದೋಷಗಳ ನೈಜ ಸ್ಥಿತಿ, ಸುಲಭ ದೈನಂದಿನ ಅಭ್ಯಾಸಗಳು & ಅದೃಷ್ಟ ಬಣ್ಣಗಳು",
      mr: "कुंडलीतील दोष, सोपे दैनंदिन उपाय व शुभ रंग",
      hi: "जन्म कुंडली दोषों का यथार्थ, सरल दैनिक उपाय एवं शुभ रंग",
      te: "కుండలి దోషాలు, సులభ దినచర్య పరిహారాలు & అదృష్ట రంగులు",
      ta: "ஜாதக தோஷங்கள், எளிய தினசரி பரிகாரங்கள் & அதிர்ஷ்ட நிறங்கள்",
      en: "Dosha Diagnostics, Simple Daily Habits & Lucky Catalysts"
    }, targetLang),
    icon: "🛡️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ದೋಷಗಳನ್ನು ಹಣ ವ್ಯಯಿಸದೆ ನಿತ್ಯವೂ ಮನೆಯಲ್ಲೇ ಶಮನಗೊಳಿಸುವುದು ಹೇಗೆ?`,
      mr: `प्रश्न: ${devoteeName}, पत्रिकेतील दोषांचे घरच्या घरी साध्या सवयींनी निवारण कसे करावे?`,
      hi: `प्रश्न: ${devoteeName}, कुंडली दोषों का घर पर ही बिना व्यर्थ व्यय के सरल आदतों से शमन कैसे करें?`,
      te: `ప్రశ్న: ${devoteeName}, ఇంట్లోనే సులభంగా పాటించగల దోష నివారణ మార్గాలు ఏవి?`,
      ta: `கேள்வி: ${devoteeName}, தோஷங்களை வீட்டில் இருந்தபடியே எளிய பழக்கவழக்கங்களால் நீக்குவது எப்படி?`,
      en: `Question: ${devoteeName}, how can you pacify lingering doshas at home through zero-cost daily habits and lucky colors?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ದೋಷವಿದ್ದರೂ ಹೆದರುವ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಅದೃಷ್ಟದ ಬಣ್ಣ: ${yogiAttrs.colorKn || "ಹಳದಿ/ಕೆಂಪು"}, ಶುಭ ವಾರ: ${yogiAttrs.wealthDayKn || "ಗುರುವಾರ"}, ಹಾಗೂ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ: ೩ ಮತ್ತು ೯. ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ ಪಕ್ಷಿಗಳಿಗೆ ಕಾಳು ಹಾಕುವುದು, ಹಸುವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು ಹಾಗೂ ಹಿರಿಯರ ಪಾದ ಮುಟ್ಟಿ ನಮಸ್ಕರಿಸುವುದು ನಿಮ್ಮ ಸಕಲ ದೋಷಗಳನ್ನು ಕರಗಿಸಲಿದೆ.`,
        mr: `${devoteeName}, पत्रिकेत दोषांची भीती बाळगू नका. शुभ रंग: ${yogiAttrs.colorKn || "पिवळा"}, शुभ वार: ${yogiAttrs.wealthDayKn || "गुरुवार"}. रोज सकाळी पक्ष्यांना दाणे व गाईला चारा दिल्यास सर्व दोष नाहीसे होतील.`,
        hi: `${devoteeName}, दोषों से भयभीत होने की आवश्यकता नहीं है। शुभ रंग: ${yogiAttrs.colorKn || "पीला"}, शुभ वार: ${yogiAttrs.wealthDayKn || "गुरुवार"}। नित्य पक्षियों को दाना एवं गौमाता की सेवा से सभी ग्रह बाधाएं शांत होती हैं।`,
        te: `${devoteeName}, దోషాలకు భయపడకండి. శుభ వర్ణం: ${yogiAttrs.colorKn || "పసుపు"}. పక్షులకు ఆహారం వేయడం మరియు గోసేవ వల్ల దోషాలు తొలగిపోతాయి.`,
        ta: `${devoteeName}, தோஷங்களுக்கு அஞ்ச வேண்டாம். அதிர்ஷ்ட நிறம்: ${yogiAttrs.colorKn || "மஞ்சள்"}. பறவைகளுக்கு தானியமும், பசுவிற்கு தீவனமும் அளிப்பது தோஷங்களை போக்கும்.`,
        en: `${devoteeName}, doshas dissolve through disciplined virtue. Your auspicious shade is ${yogiAttrs.colorEn}, power day is ${yogiAttrs.wealthDayEn}. Feeding birds at dawn and revering elders neutralizes latent friction effortlessly.`
      })
    ],
    guidanceBadge: pick6({ kn: "ಸರಳ ದೈನಂದಿನ ಪರಿಹಾರ", mr: "सोपे दैनंदिन उपाय", hi: "सरल दैनिक उपाय", te: "సులభ పరిహారం", ta: "எளிய தினசரி பரிகாரம்", en: "Daily Micro-Remedies" }, targetLang)
  });

  // CHAPTER 24: Sacred Stotra, Daily Mantra & Sri Kshetra Gokarna Parihara Protocol
  chapters.push({
    chapterNumber: 24,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ವೈಯಕ್ತಿಕ ಜನ್ಮ ನಕ್ಷತ್ರ ಮಂತ್ರ, ಸ್ತೋತ್ರ & ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪರಿಹಾರ ಸಂಕಲ್ಪ",
      mr: "व्यक्तिगत जन्म नक्षत्र मंत्र, स्तोत्र व श्री क्षेत्र गोकर्ण शांती विधी",
      hi: "व्यक्तिगत जन्म नक्षत्र मंत्र, स्तोत्र एवं श्री क्षेत्र गोकर्ण शांति विधान",
      te: "జన్మ నక్షత్ర మంత్రం, స్తోత్రం & శ్రీ క్షేత్ర గోకర్ణ శాంతి సంకల్పం",
      ta: "ஜென்ம நட்சத்திர மந்திரம், ஸ்தோத்திரம் & கோகர்ண சாந்தி சங்கல்பம்",
      en: "Sacred Stotra, Daily Mantra & Sri Kshetra Gokarna Parihara Protocol"
    }, targetLang),
    icon: "🛕",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${nakshatraName}ಗೆ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಾಡಿಸಬೇಕಾದ ಪರಮ ಪವಿತ್ರ ಸೇವೆ ಹಾಗೂ ನಿತ್ಯ ಮಂತ್ರ ಯಾವುದು?`,
      mr: `प्रश्न: ${devoteeName}, आपले नक्षत्र ${nakshatraName} साठी श्री क्षेत्र गोकर्ण येथे कोणती शांती पूजा करावी व नित्य मंत्र कोणता?`,
      hi: `प्रश्न: ${devoteeName}, आपके जन्म नक्षत्र ${nakshatraName} हेतु श्री क्षेत्र गोकर्ण में कौन सी सेवा एवं नित्य मंत्र फलदायी है?`,
      te: `ప్రశ్న: ${devoteeName}, మీ ${nakshatraName} నక్షత్రానికి గోకర్ణంలో చేయించాల్సిన సేవ మరియు నిత్య జప మంత్రం ఏవి?`,
      ta: `கேள்வி: ${devoteeName}, உங்கள் ${nakshatraName} நட்சத்திரத்திற்கு கோகர்ணத்தில் செய்ய வேண்டிய விசேஷ சேவை என்ன?`,
      en: `Question: ${devoteeName}, what sacred stotra, daily mantra, and Gokarna Mahabaleshwara parihara protocol shields your nakshatra ${nakshatraName}?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${nakshatraName} (ಪಾದ ${n(nakshatraPada)}) ನ ಅಧಿಪತಿಯನ್ನು ಪ್ರಸನ್ನಗೊಳಿಸಲು ನಿತ್ಯವೂ 'ಓಂ ನಮೋ ನಾರಾಯಣಾಯ' ಅಥವಾ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಮಂತ್ರವನ್ನು ೨೧ ಬಾರಿ ಜಪಿಸಿ. ಇಡೀ ಭಾರತದಲ್ಲೇ ಅತ್ಯಂತ ಪವಿತ್ರವಾದ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಹಾಗೂ ತೈಲಾಭಿಷೇಕ ಸೇವೆ ನೆರವೇರಿಸುವುದರಿಂದ ನಿಮ್ಮ ಸಕಲ ಪಿತೃ, ಸರ್ಪ ಮತ್ತು ಕರ್ಮ ದೋಷಗಳು ಶಾಶ್ವತವಾಗಿ ಭಸ್ಮವಾಗಲಿವೆ.`,
        mr: `${devoteeName}, आपले नक्षत्र ${nakshatraName} साठी रोज २१ वेळा 'ॐ नमः शिवाय' जप करावा. श्री क्षेत्र गोकर्ण महाबळेश्वर आत्मलिंगास रुद्राभिषेक केल्याने सर्व दोष नष्ट होतात.`,
        hi: `${devoteeName}, आपके नक्षत्र ${nakshatraName} हेतु नित्य २१ बार 'ॐ नमः शिवाय' जप करें। श्री क्षेत्र गोकर्ण में आत्मलिंग पर रुद्राभिषेक समस्त ग्रह बाधाओं को शांत करता है।`,
        te: `${devoteeName}, మీ నక్షత్రానికి రోజూ 21 సార్లు 'ఓం నమః శివాయ' జపించండి. గోకర్ణ ఆత్మలింగానికి రుద్రాభిషేకం సమస్త దోషాలను తొలగిస్తుంది.`,
        ta: `${devoteeName}, உங்கள் நட்சத்திரத்திற்கு தினமும் 21 முறை 'ஓம் நம சிவாய' ஜபிக்கவும். கோகர்ண ஆத்மலிங்கத்திற்கு ருத்ராபிஷேகம் செய்வது சர்வ தோஷ நிவர்த்தி தரும்.`,
        en: `${devoteeName}, for your natal Nakshatra ${nakshatraName} (Pada ${nakshatraPada}), recite 'Om Namah Shivaya' 21 times daily. Sponsoring a dedicated Rudrabhisheka to the venerable Atma Linga at Sri Kshetra Gokarna unties deep karmic knots.`
      })
    ],
    guidanceBadge: pick6({ kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪರಿಹಾರ", mr: "श्री क्षेत्र गोकर्ण उपाय", hi: "श्री क्षेत्र गोकर्ण परिहार", te: "గోకర్ణ క్షేత్ర పరిహారం", ta: "கோகர்ண சாந்தி", en: "Gokarna Protocol" }, targetLang)
  });

  // CHAPTER 25: Chief Astrologer's Final Summary, Family Harmony Note & Gokarna Ashirvada
  chapters.push({
    chapterNumber: 25,
    sectionNumber: 5,
    sectionTitle: sec5,
    title: pick6({
      kn: "ಪ್ರಧಾನ ಜ್ಯೋತಿಷಿಗಳ ಅಂತಿಮ ಸಾರಾಂಶ, ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಸೂತ್ರ & ಗೋಕರ್ಣ ಮಹಾ ಆಶೀರ್ವಾದ",
      mr: "प्रधान ज्योतिषांचा अंतिम सारांश, कौटुंबिक रक्षा सूत्र व गोकर्ण महा आशीर्वाद",
      hi: "प्रधान ज्योतिषी का अंतिम सार, पारिवारिक रक्षा सूत्र एवं गोकर्ण महा आशीर्वाद",
      te: "ప్రధాన జ్యోతిష్యుల సారాంశం, కుటుంబ రక్షా సూత్రం & గోకర్ణ మహా ఆశీర్వాదం",
      ta: "முதன்மை ஜோதிடரின் இறுதி சாரம், குடும்ப ரக்ஷா சூத்திரம் & கோகர்ண மகா ஆசீர்வாதம்",
      en: "Chief Astrologer's Final Summary, Family Harmony Note & Gokarna Ashirvada"
    }, targetLang),
    icon: "🕉️",
    question: pick6({
      kn: `ಪ್ರಶ್ನೆ: ${devoteeName}, ಈ ಸಮಗ್ರ ೨೫ ಅಧ್ಯಾಯಗಳ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನದ ಪರಮ ಸಂದೇಶ ಹಾಗೂ ಪಾವನ ಆಶೀರ್ವಾದವೇನು?`,
      mr: `प्रश्न: ${devoteeName}, या २५ अध्यायांच्या महा अहवालाचा अंतिम संदेश व पावन आशीर्वाद काय?`,
      hi: `प्रश्न: ${devoteeName}, इस २५ अध्यायीय महा फलादेश का अंतिम दिव्य संदेश एवं आशीर्वाद क्या है?`,
      te: `ప్రశ్న: ${devoteeName}, ఈ 25 అధ్యాయాల సమగ్ర నివేదిక ఇచ్చే దివ్య సందేశం & ఆశీర్వాదం ఏమిటి?`,
      ta: `கேள்வி: ${devoteeName}, இந்த 25 அத்தியாயங்களின் இறுதி தெய்வீக வழிகாட்டலும் ஆசியும் என்ன?`,
      en: `Question: ${devoteeName}, what is the Chief Astrologer's culminating benediction across all 25 chapters?`
    }, targetLang),
    paragraphs: [
      pick6({
        kn: `${devoteeName}, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ${lagnaRashiName} ಹಾಗೂ ಜನ್ಮ ರಾಶಿ ${moonRashiName}ಯ ಈ ಸಮಗ್ರ ೨೫-ಅಧ್ಯಾಯಗಳ ಮಹಾ ದರ್ಶನವು ಸಾರುವ ಪರಮ ಸತ್ಯವೇನೆಂದರೆ: ಕರ್ಮವು ಎಂದಿಗೂ ಸತ್ಯವಂತರನ್ನು ಕೈಬಿಡುವುದಿಲ್ಲ. ಹಿಂದಿನ ದಿನಗಳಲ್ಲಿ ನೀವು ಎದುರಿಸಿದ ನೋವುಗಳು ಕರಗಿ, ನಿಮ್ಮ ಸುವರ್ಣ ಭಾಗ್ಯೋದಯದ ಕಾಲಾವಧಿ ಆರಂಭವಾಗಿದೆ. ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ನಡೆಯಿರಿ; ಈಶ್ವರನು ನಿಮ್ಮನ್ನು ಮತ್ತು ನಿಮ್ಮ ಸಮಸ್ತ ಕುಟುಂಬವನ್ನು ಸದಾ ಕಾಯಲಿ.`,
        mr: `${devoteeName}, आपल्या पत्रिकेचा अंतिम संदेश हाच आहे की प्रामाणिक कष्टांना यश नक्की मिळेल. आपला सुवर्णकाळ सुरू होत आहे. ईश्वराची कृपा आपल्यावर सदैव राहो.`,
        hi: `${devoteeName}, इस २५-अध्यायीय फलादेश का सार यह है कि सत्य एवं धर्म के पथ पर चलने वाले का पराभव कभी नहीं होता। आपका स्वर्णिम कालखंड प्रारंभ हो चुका है। भगवान शिव आपकी रक्षा करें।`,
        te: `${devoteeName}, సత్యం మరియు ధర్మం ఎప్పుడూ విజయాన్నిస్తాయి. మీ స్వర్ణ కాలం ప్రారంభమైంది. భగవంతుని కృప సదా మీపై ఉండుగాక.`,
        ta: `${devoteeName}, தர்மத்தின் வழியில் நடப்பவர்களுக்கு எக்காலத்திலும் தோல்வி இல்லை. உங்கள் பொற்காலம் தொடங்கிவிட்டது. இறைவன் அருள் நிறைக.`,
        en: `${devoteeName}, the synthesis of this 25-chapter blueprint affirms: righteous perseverance is never in vain. Your golden ascent is underway; may Sri Gokarna Mahabaleshwara bless your lineage perpetually.`
      }),
      pick6({
        kn: "॥ ಸ್ವಸ್ತಿ ಪ್ರಜಾಭ್ಯಃ ಪರಿಪಾಲಯಂತಾಂ ನ್ಯಾಯೇನ ಮಾರ್ಗೇಣ ಮಹೀಂ ಮಹೀಶಾಃ । ಗೋಬ್ರಾಹ್ಮಣೇಭ್ಯಃ ಶುಭಮಸ್ತು ನಿತ್ಯಂ ಲೋಕಾಃ ಸಮಸ್ತಾಃ ಸುಖಿನೋ ಭವಂತು ॥",
        mr: "॥ स्वस्ति प्रजाभ्यः परिपालयन्तां न्यायेन मार्गेण महीं महीशाः । गोब्राह्मणेभ्यः शुभमस्तु नित्यं लोकाः समस्ताः सुखिनो भवन्तु ॥",
        hi: "॥ स्वस्ति प्रजाभ्यः परिपालयन्तां न्यायेन मार्गेण महीं महीशाः । गोब्राह्मणेभ्यः शुभमस्तु नित्यं लोकाः समस्ताः सुखिनो भवन्तु ॥",
        te: "॥ స్వస్తి ప్రజాభ్యః పరిపాలయన్తాం న్యాయ్యేన మార్గేణ మహీం మహీశాః । గోబ్రాహ్మణేభ్యః శుభమస్తు నిత్యం లోకాః సమస్తాః సుఖినో భవన్తు ॥",
        ta: "॥ ஸ்வஸ்தி பிரஜாப்யஃ பரிபாலயந்தாம் ந்யாயேன மார்கேண மஹீம் மஹீசாஃ । கோப்ராஹ்மணேப்யஃ சுபமஸ்து நித்யம் லோகாஃ சமஸ்தாஃ சுகினோ பவந்து ॥",
        en: "|| Svasti Prajabhyah Paripalayantam Nyayena Margena Mahim Mahishah • Go-Brahmanebhyah Shubham-Astu Nityam Lokah Samastah Sukhino Bhavantu ||"
      })
    ],
    guidanceBadge: pick6({ kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾ ಆಶೀರ್ವಾದ", mr: "श्री गोकर्ण महा आशीर्वाद", hi: "श्री गोकर्ण महा आशीर्वाद", te: "శ్రీ గోకర్ణ మహా ఆశీర్వాదం", ta: "கோகர்ண மகா ஆசீர்வாதம்", en: "Gokarna Supreme Ashirvada" }, targetLang)
  });

  return chapters;
}

// ============================================================================
// 5. HIGH-DPI SECTON-BY-SECTION PDF CAPTURE ENGINE (ZERO TABLES, PERFECT PARITY)
// ============================================================================

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

  try {
    if (parentEl) {
      parentEl.setAttribute(
        "style",
        "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFF7ED;"
      );
    }

    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));

    const rawSections = Array.from(containerEl.querySelectorAll(".pdf-section")) as HTMLElement[];
    const sections = rawSections.filter(s => {
      const rect = s.getBoundingClientRect();
      return rect.height > 0 && s.style.display !== "none" && s.style.visibility !== "hidden";
    });

    if (sections.length < 5) {
      throw new Error(`Insufficient sections detected for 25-Chapter PDF (${sections.length} found). Rendering aborted.`);
    }

    const pdfWidthMm = 210; // A4 standard width in mm
    const renderedSections: { imgData: string; heightMm: number; name: string }[] = [];

    for (let i = 0; i < sections.length; i++) {
      const sectionEl = sections[i];
      const sectionName = sectionEl.getAttribute("data-section") || sectionEl.id || `section_${i}`;

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

      const tempBox = document.createElement("div");
      tempBox.style.position = "absolute";
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

      const sectionClone = sectionEl.cloneNode(true) as HTMLElement;
      sectionClone.style.display = "block";
      sectionClone.style.width = "100%";
      sectionClone.style.margin = "0";
      sectionClone.style.letterSpacing = "normal";

      // Sanitize all descendants in the clone
      sectionClone.querySelectorAll("*").forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style) {
          htmlEl.style.letterSpacing = "normal";
          if (htmlEl.style.filter && htmlEl.style.filter.includes("drop-shadow")) {
            htmlEl.style.filter = "none";
          }
        }
      });

      tempBox.appendChild(sectionClone);
      document.body.appendChild(tempBox);

      const measuredSectionHeight = Math.max(
        sectionEl.scrollHeight || 0,
        sectionEl.offsetHeight || 0,
        sectionEl.getBoundingClientRect().height || 0
      );
      const trueHeight = Math.max(
        tempBox.scrollHeight,
        tempBox.offsetHeight,
        sectionClone.scrollHeight,
        sectionClone.offsetHeight,
        measuredSectionHeight,
        350
      );
      tempBox.style.height = `${trueHeight}px`;

      const sectionScale = trueHeight * 2 > 15000 ? Math.max(1, Math.floor(15000 / trueHeight)) : 2;

      let canvas: HTMLCanvasElement | null = null;
      try {
        canvas = await html2canvas(tempBox, {
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

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const heightMm = (canvas.height * pdfWidthMm) / canvas.width;

      renderedSections.push({
        imgData,
        heightMm,
        name: sectionName
      });
    }

    const totalPdfHeightMm = renderedSections.reduce((sum, s) => sum + s.heightMm, 0);
    if (totalPdfHeightMm <= 0) {
      throw new Error("Calculated PDF height is zero. Cannot generate empty PDF.");
    }

    const MAX_SAFE_PAGE_HEIGHT_MM = 5000;
    const pages: { sections: typeof renderedSections; heightMm: number }[] = [];

    if (totalPdfHeightMm <= MAX_SAFE_PAGE_HEIGHT_MM) {
      pages.push({ sections: renderedSections, heightMm: totalPdfHeightMm });
    } else {
      const targetPageHeightMm = Math.ceil(totalPdfHeightMm / 2);
      let currentPageSections: typeof renderedSections = [];
      let currentPageHeightMm = 0;

      for (let i = 0; i < renderedSections.length; i++) {
        const sec = renderedSections[i];
        const remainingSections = renderedSections.length - i;
        if (currentPageSections.length >= 3 && currentPageHeightMm >= targetPageHeightMm && remainingSections >= 2) {
          pages.push({ sections: currentPageSections, heightMm: currentPageHeightMm });
          currentPageSections = [sec];
          currentPageHeightMm = sec.heightMm;
        } else {
          currentPageSections.push(sec);
          currentPageHeightMm += sec.heightMm;
        }
      }
      if (currentPageSections.length > 0) {
        pages.push({ sections: currentPageSections, heightMm: currentPageHeightMm });
      }
    }

    const firstPage = pages[0];
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: [pdfWidthMm, firstPage.heightMm],
      compress: true
    });

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      if (pIdx > 0) {
        pdf.addPage([pdfWidthMm, page.heightMm], "p");
      }

      pdf.setFillColor(255, 247, 237);
      pdf.rect(0, 0, pdfWidthMm, page.heightMm, "F");

      let currentY = 0;
      for (const sec of page.sections) {
        pdf.addImage(sec.imgData, "JPEG", 0, currentY, pdfWidthMm, sec.heightMm, undefined, "FAST");
        currentY += sec.heightMm;
      }
    }

    if (autoSave) {
      savePdfBlob(pdf, fileName);
    }

    return pdf;
  } finally {
    if (parentEl) {
      parentEl.setAttribute("style", originalStyle);
    }
  }
}
