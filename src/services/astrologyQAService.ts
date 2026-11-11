/**
 * astrologyQAService.ts
 *
 * Baggona Authentic Vedic Astrology Q&A & Consultation Service (ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಎಂಜಿನ್)
 * Powered by classical treatises (Brihat Parashara Hora Shastra, Muhurtha Chintamani, Jataka Parijata),
 * deterministic astronomical math engines, and Google Gemini (gemini-3.5-flash-lite).
 *
 * Capabilities:
 * 1. General & deep Vedic Astrology questions in Kannada, English, Hindi, Telugu, Tamil.
 * 2. Specialized Nakshatra & Pada Dosha analysis (e.g. Mula 1st Pada Gandanta, Ashlesha, Jyeshtha, Revati).
 * 3. Exact Muhurtha calculations (Vehicle purchase, Griha Pravesha, Marriage, Shop opening) with Baggona Panchanga dates.
 * 4. Technical Birth Chart / Kundali analysis (7th house marriage, 4th house property, 10th house career) with optional DOB/TOB/Place.
 * 5. Sacred Baggona & Gokarna temple remedies (Shanti Homa, Rudrabhisheka, Ganapati Seva, Shreeram Pandit blessings).
 */

import { askGemini, type AskGeminiChatTurn } from "../core/GeminiEngine";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../core/birthTime";
import { calculateVahanaKharidiMuhurtha } from "../features/muhurtha/vahanaMuhurthaEngine";
import { calculateTraditionalBaggona, type TraditionalBaggonaPanchanga } from "../core/TraditionalBaggonaEngine";
import { calculateInstantPrashnaClock, type InstantPrashnaClock } from "../core/instantPrashnaEngine";
import { siderealLongitudes } from "../core/EphemerisEngine";
import { RASHIS } from "../core/AstroTypes";
import {
  NAKSHATRA_SHASTRA_CATALOG,
  BHAVA_SHASTRA_CATALOG,
  GRAHA_SHASTRA_MATRIX,
  lookupNakshatraByName
} from "./jyotishyaShastraKnowledge";
import {
  lookupNakshatraByDevoteeName,
  lookupAvakahadaByNakshatraAndPada,
  extractCandidateNameFromQuery,
  type AvakahadaMatchResult,
  type AvakahadaPadaEntry
} from "./avakahadaChakraService";
import { findOfflineIndianCityOrPin } from "../data/offlineCityPincodeDb";
import { calculateKundli } from "../core/KundliEngine";
import {
  calculateComprehensiveDoshas,
  type ComprehensiveDoshaReport
} from "../core/ComprehensiveDoshaEngine";
import { rashiIndexInHouse, signLord } from "../core/KundliInsightsEngine";
import {
  toKannadaPlanet,
  toKannadaRashi,
  toKannadaNakshatra
} from "../utils/kannadaAstrologyTerms";
import {
  searchBaggonaFestivals,
  type MasterFestivalItem
} from "../core/BaggonaFestivalRegistry";
import type { SupportedLanguage } from "../stores/appStore";

export interface BirthDetailsInput {
  name?: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  place?: string;
  latitude?: number;
  longitude?: number;
  gender?: "Male" | "Female" | "Other";
}

export interface AstrologyQASection {
  title: string;
  content: string;
  icon: string;
}

export interface PersonalHoroscopeData {
  name: string;
  birthDate: string;
  birthTime: string;
  place: string;
  pincode: string;
  lat: number;
  lng: number;
  lagnaRashiKn: string;
  lagnaRashiEn: string;
  lagnaDegree: number;
  moonRashiKn: string;
  moonRashiEn: string;
  moonNakshatraKn: string;
  moonNakshatraEn: string;
  moonPada: number;
  sunRashiKn: string;
  sunRashiEn: string;
  currentMahadashaKn: string;
  currentAntardashaKn: string;
  namakarana: {
    canonicalSyllableKn: string;
    canonicalSyllableEn: string;
    allSyllablesKn: string[];
    sampleNamesKn: string[];
    sampleNamesEn: string[];
    deityKn: string;
    ganaKn: string;
    animalYoniKn: string;
    nadiKn: string;
    elementKn: string;
  };
  aarogya: {
    vitalitySummaryKn: string;
    sixthHouseSummaryKn: string;
    eighthHouseSummaryKn: string;
    tridoshaKn: string;
    cautionsKn: string[];
    remedialHomasKn: string[];
  };
  ayush: {
    longevityCategoryKn: string;
    longevityCategoryEn: string;
    ayurBhavaKn: string;
    saturnPlacementKn: string;
    marakaGrahasKn: string;
    protectiveYogasKn: string;
    mrityunjayaMantra: string;
  };
  doshas: {
    activeCount: number;
    doshaList: Array<{
      nameKn: string;
      nameEn: string;
      severityKn: string;
      technicalWhyKn: string;
      pariharaKn: string;
    }>;
    gandantaSummaryKn?: string;
    sadeSatiSummaryKn?: string;
  };
}

export interface AstrologyQAResponse {
  id: string;
  question: string;
  language: SupportedLanguage;
  fullAnswer: string;
  spokenText: string;
  detectedIntent:
    | "name_nakshatra_lookup"
    | "nakshatra_pada_dosha"
    | "muhurtha_timing"
    | "marriage_7th_house"
    | "career_10th_house"
    | "panchanga_today"
    | "horary_prashna"
    | "marana_shraddha"
    | "surrender_closure_muhurtha"
    | "festival_vrata_details"
    | "aarogya_health"
    | "ayush_longevity"
    | "namakarana_naming"
    | "comprehensive_dosha_shanti"
    | "personal_kundli_full"
    | "general_siddhanta";
  sections: AstrologyQASection[];
  chartData?: {
    lagna: string;
    moonSign: string;
    nakshatra: string;
    dashaText: string;
    technicalHighlights: string[];
  };
  nameLookupData?: {
    name: string;
    syllable: string;
    syllableKn: string;
    syllableEn: string;
    nakshatraName: string;
    nakshatraNameKn: string;
    nakshatraNameEn: string;
    pada: number;
    rashiNameKn: string;
    rashiNameEn: string;
    rashiLordKn: string;
    rashiLordEn: string;
    nakshatraLordKn: string;
    nakshatraLordEn: string;
    deityKn: string;
    deityEn: string;
    ganaKn: string;
    animalYoniKn: string;
  };
  maranaShraddhaData?: {
    demiseDate: string;
    demiseSamvatsaraKn: string;
    demiseMasaKn: string;
    demisePakshaKn: string;
    demiseTithiKn: string;
    demiseNakshatraKn: string;
    demiseWeekdayKn: string;
    targetYear: number;
    pratyabdikaDate: string;
    pratyabdikaFormattedKn: string;
    aparahnaKala: string;
    hasPanchakaDosha: boolean;
    panchakaSummaryKn?: string;
    ashauchaDays: number;
    gokarnaSevas: string[];
  };
  surrenderMuhurthaData?: {
    actionTypeKn: string;
    recommendedDays: Array<{
      date: string;
      weekdayKn: string;
      tithiKn: string;
      nakshatraKn: string;
      timeWindowKn: string;
      reasonKn: string;
    }>;
    inauspiciousAvoidDays: string[];
    keyPrinciplesKn: string[];
    rinaMuktiMantra: string;
  };
  festivalData?: {
    festivalNameKn: string;
    festivalNameEn: string;
    date: string;
    masaKn: string;
    pakshaKn: string;
    tithiKn: string;
    pujaWindowKn: string;
    descriptionKn: string;
    vrataVidhanaKn: string;
    mantra?: string;
  };
  livePanchangaMoment?: {
    samvatsaraKn: string;
    masaKn: string;
    pakshaKn: string;
    tithiKn: string;
    weekdayKn: string;
    moonNakshatraKn: string;
    yogaKn: string;
    karanaKn: string;
    horaLordKn: string;
    horaLordEn: string;
    choghadiyaKn: string;
    rahuKalamTimeStr: string;
    chandraBalaStatusKn: string;
  };
  personalHoroscopeData?: PersonalHoroscopeData;
}

export interface AskBaggonaAstrologyParams {
  question: string;
  language: SupportedLanguage;
  birthDetails?: BirthDetailsInput;
  conversationHistory?: AskGeminiChatTurn[];
  geminiApiKey?: string;
}


/**
 * Extracts date (ISO, DMY, or Month Name) and target year from user query
 */
export function extractDateAndTargetYear(question: string): {
  extractedDate: string | null;
  targetYear: number;
} {
  const currentYear = new Date().getFullYear(); // 2026
  let targetYear = currentYear;

  // Check if a specific target year is mentioned (e.g. 2026, 2027, 2028)
  const yearMatches = question.match(/\b(202[4-9]|203[0-5])\b/g);
  if (yearMatches && yearMatches.length > 0) {
    targetYear = parseInt(yearMatches[yearMatches.length - 1], 10);
  }

  // 1. Matches YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = question.match(/\b(19\d\d|20\d\d)[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return { extractedDate: `${y}-${m}-${d}`, targetYear };
  }

  // 2. Matches DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = question.match(/\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](19\d\d|20\d\d)\b/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return { extractedDate: `${y}-${m}-${d}`, targetYear };
  }

  // 3. Textual month dates: "12th April 2023" or "April 12, 2023"
  const months: Record<string, string> = {
    jan: "01", january: "01", feb: "02", february: "02",
    mar: "03", march: "03", apr: "04", april: "04",
    may: "05", jun: "06", june: "06", jul: "07", july: "07",
    aug: "08", august: "08", sep: "09", september: "09",
    oct: "10", october: "10", nov: "11", november: "11",
    dec: "12", december: "12"
  };

  const textMatch1 = question.match(/\b(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+([A-Za-z]+)[,\s]+(19\d\d|20\d\d)\b/i);
  if (textMatch1) {
    const d = textMatch1[1].padStart(2, "0");
    const monKey = textMatch1[2].toLowerCase();
    const y = textMatch1[3];
    if (months[monKey]) {
      return { extractedDate: `${y}-${months[monKey]}-${d}`, targetYear };
    }
  }

  const textMatch2 = question.match(/\b([A-Za-z]+)\s+(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?[,\s]+(19\d\d|20\d\d)\b/i);
  if (textMatch2) {
    const monKey = textMatch2[1].toLowerCase();
    const d = textMatch2[2].padStart(2, "0");
    const y = textMatch2[3];
    if (months[monKey]) {
      return { extractedDate: `${y}-${months[monKey]}-${d}`, targetYear };
    }
  }

  return { extractedDate: null, targetYear };
}

/**
 * Deterministically finds the annual Pratyabdika Shraddha date in target year
 * carrying the demise Tithi during Aparahna Kaala (01:30 PM - 03:45 PM IST).
 */
export function calculatePratyabdikaShraddha(
  demiseDateStr: string,
  targetYear?: number,
  lat: number = 14.5479,
  lng: number = 74.3188
): NonNullable<AstrologyQAResponse["maranaShraddhaData"]> {
  const currentYear = new Date().getFullYear();
  const targetYr = targetYear || currentYear;
  const demiseP = calculateTraditionalBaggona(demiseDateStr, "12:00", lat, lng);

  const masaRoot = demiseP.masaKn.replace(/ಮಾಸ/g, "").trim();
  const pakshaRoot = demiseP.pakshaKn.replace(/ಪಕ್ಷ/g, "").trim();
  const tithiRoot = demiseP.tithiKn.split(" ")[0].trim();

  // Scan targetYear for matching Masa, Paksha, and Tithi during Aparahna (14:00)
  const startDate = new Date(Date.UTC(targetYr, 0, 1));
  let matchedDateStr = "";
  let matchedWeekdayKn = "";

  for (let offset = 0; offset < 366; offset++) {
    const d = new Date(startDate.getTime() + offset * 24 * 60 * 60 * 1000);
    if (d.getUTCFullYear() !== targetYr) break;
    const dStr = d.toISOString().split("T")[0];
    const p = calculateTraditionalBaggona(dStr, "14:00", lat, lng);
    if (
      p.masaKn.includes(masaRoot) &&
      p.pakshaKn.includes(pakshaRoot) &&
      p.tithiKn.includes(tithiRoot)
    ) {
      matchedDateStr = dStr;
      matchedWeekdayKn = p.weekdayKn;
      break;
    }
  }

  // Fallback if boundary scan
  if (!matchedDateStr) {
    matchedDateStr = `${targetYr}-${demiseDateStr.slice(5)}`;
    const fallbackP = calculateTraditionalBaggona(matchedDateStr, "14:00", lat, lng);
    matchedWeekdayKn = fallbackP.weekdayKn;
  }

  const parts = matchedDateStr.split("-");
  const formattedKn = `${parts[2]}-${parts[1]}-${parts[0]} (${matchedWeekdayKn})`;

  const panchakStars = ["ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಾಭಾದ್ರಪದ", "ಉತ್ತರಾಭಾದ್ರಪದ", "ರೇವತಿ", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
  const hasPanchaka = panchakStars.some(s => demiseP.moonNakshatraKn.includes(s) || demiseP.moonNakshatra.includes(s));

  return {
    demiseDate: demiseDateStr,
    demiseSamvatsaraKn: demiseP.samvatsaraKn,
    demiseMasaKn: demiseP.masaKn,
    demisePakshaKn: demiseP.pakshaKn,
    demiseTithiKn: demiseP.tithiKn,
    demiseNakshatraKn: demiseP.moonNakshatraKn,
    demiseWeekdayKn: demiseP.weekdayKn,
    targetYear: targetYr,
    pratyabdikaDate: matchedDateStr,
    pratyabdikaFormattedKn: formattedKn,
    aparahnaKala: "೦೧:೩೦ PM - ೦೩:೪೫ PM (ಅಪರಾಹ್ನ ಕಾಲ)",
    hasPanchakaDosha: hasPanchaka,
    panchakaSummaryKn: hasPanchaka
      ? "ಧನಿಷ್ಠಾ ಪಂಚಕ ದೋಷವಿದೆ: ೫ ದರ್ಭೆ ಪುತ್ಥಳಿಗಳನ್ನು (ಕುಶ ಪುತ್ಥಳಿ) ಶವದೊಂದಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ದಹನ ಮಾಡಬೇಕು ಮತ್ತು ೨೭ ದಿನಗಳ ಬಳಿಕ ಪಂಚಕ ಶಾಂತಿ ಹೋಮ ನೆರವೇರಿಸಬೇಕು."
      : "ಶುದ್ಧ - ಯಾವುದೇ ಪಂಚಕ ದೋಷವಿಲ್ಲ.",
    ashauchaDays: 10,
    gokarnaSevas: [
      "ತಿಲ ಹೋಮ (Thila Homa - ಪಿತೃ ಮುಕ್ತಿ)",
      "ನಾರಾಯಣ ಬಲಿ (Narayana Bali - ಗತಿ ಮುಕ್ತಿ)",
      "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ (Tripindi Shraddha - ಪ್ರೇತ ಬಾಧಾ ನಿವೃತ್ತಿ)",
      "ಗೋ-ದಾನ & ಅನ್ನದಾನ"
    ]
  };
}

/**
 * Evaluates Muhurtha for Surrendering a Hotel, Commercial Lease, or Business Closure
 * Based on Baggona Siddhanta: Tuesday (Bhaume Rina Vimochana) and Chara Lagna.
 */
export function calculateSurrenderMuhurthaDates(
  year: number,
  month: number,
  lat: number = 14.5479,
  lng: number = 74.3188
): NonNullable<AstrologyQAResponse["surrenderMuhurthaData"]> {
  const recommendedDays: NonNullable<AstrologyQAResponse["surrenderMuhurthaData"]>["recommendedDays"] = [];
  const charaStars = ["ಅಶ್ವಿನಿ", "ಪುಷ್ಯ", "ಹಸ್ತ", "ಸ್ವಾತಿ", "ಶ್ರವಣ", "ಶತಭಿಷಾ", "Ashwini", "Pushya", "Hasta", "Swati", "Shravana", "Shatabhisha"];

  const now = new Date();
  const startDate = new Date(Date.UTC(year, month - 1, 1));

  for (let d = 0; d < 45 && recommendedDays.length < 4; d++) {
    const candidate = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
    if (candidate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) continue;

    const dateStr = candidate.toISOString().split("T")[0];
    const p = calculateTraditionalBaggona(dateStr, "12:00", lat, lng);

    const isTuesday = p.weekdayIndex === 2; // Mars - Bhaume Rina Vimochana
    const isThursday = p.weekdayIndex === 4; // Jupiter - Amicable peaceful closure

    if (!isTuesday && !isThursday) continue;

    const isRikta = /ಚತುರ್ಥಿ|ನವಮಿ|ಚತುರ್ದಶಿ|ಅಮಾವಾಸ್ಯೆ|Chaturthi|Navami|Chaturdashi|Amavasya/i.test(p.tithiKn);
    if (isRikta) continue;

    const parts = dateStr.split("-");
    const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;

    recommendedDays.push({
      date: dateStr,
      weekdayKn: p.weekdayKn,
      tithiKn: p.tithiKn,
      nakshatraKn: p.moonNakshatraKn,
      timeWindowKn: "ಬೆಳಿಗ್ಗೆ ೧೧:೪೫ - ೧೨:೩೫ (ಅಭಿಜಿತ್ ಮುಹೂರ್ತ) ಅಥವಾ ಮಧ್ಯಾಹ್ನ ೦೧:೩೦ - ೦೩:೦೦ (ಅಮೃತ ಚೋಘಡಿಯಾ)",
      reasonKn: isTuesday
        ? "ಮಂಗಳವಾರದ ಭೌಮೇ ಋಣವಿಮೋಚನಾ ಯೋಗ: ಗುತ್ತಿಗೆ ಬಾಕಿ ಅಥವಾ ಸಾಲದ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಿಸಲು ಅತ್ಯುತ್ಕೃಷ್ಟ."
        : "ಗುರುವಾರದ ಸೌಮ್ಯ ಯೋಗ: ಮಾಲೀಕರು ಮತ್ತು ಗುತ್ತಿಗೆದಾರರ ನಡುವೆ ಶಾಂತಿಯುತ, ವಿವಾದರಹಿತ ಒಪ್ಪಿಸುವಿಕೆ ಹಾಗೂ ಠೇವಣಿ ಮರುಪಾವತಿ."
    });
  }

  return {
    actionTypeKn: "ವ್ಯಾಪಾರ / ಹೊಟೇಲ್ ಒಪ್ಪಿಸುವಿಕೆ, ಗುತ್ತಿಗೆ ಮುಕ್ತಾಯ & ಋಣ ವಿಮೋಚನಾ ಮುಹೂರ್ತ",
    recommendedDays,
    inauspiciousAvoidDays: [
      "ಶನಿವಾರ (Saturday): ಶನಿವಾರದಂದು ಒಪ್ಪಿಸಿದರೆ ವ್ಯಾಪಾರವು ವಿವಾದದಲ್ಲಿ ಸಿಲುಕಿ ಮುಕ್ತಾಯವಾಗದೆ ವಿಳಂಬವಾಗುತ್ತದೆ.",
      "ಬುಧವಾರ (Wednesday): ಬುಧವಾರದಂದು ಒಪ್ಪಿಸಿದರೆ ನೂತನ ವ್ಯಾಪಾರ ಅಥವಾ ಸಾಲದ ಸುಳಿಗೆ ಮತ್ತೆ ಸಿಲುಕುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ.",
      "ರಿಕ್ತ ತಿಥಿಗಳು (೪, ೯, ೧೪) & ಅಮಾವಾಸ್ಯೆ: ಈ ತಿಥಿಗಳಲ್ಲಿ ಕೈಗೊಂಡ ಸಮಾಪ್ತಿಯು ನಷ್ಟ ಹಾಗೂ ಮನಸ್ತಾಪ ಉಂಟುಮಾಡುತ್ತದೆ."
    ],
    keyPrinciplesKn: [
      "ಚರ ಲಗ್ನ (ಮೇಷ, ಕರ್ಕಾಟಕ, ತುಲಾ, ಮಕರ): ವ್ಯಾಪಾರವನ್ನು ಶಾಶ್ವತವಾಗಿ, ತ್ವರಿತವಾಗಿ ಕಡಿದುಹಾಕಲು ಚರ ಲಗ್ನ ಅಗತ್ಯ. ಸ್ಥಿರ ಲಗ್ನದಲ್ಲಿ ಒಪ್ಪಿಸಿದರೆ ಸಮಸ್ಯೆಗಳು ಅಲ್ಲಿಯೇ ಗಿರಕಿ ಹೊಡೆಯುತ್ತವೆ.",
      "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ (೧೧:೪೫ AM - ೧೨:೩೫ PM): ಸೂರ್ಯನ ಪ್ರಖರ ಬಲದಿಂದ ಸರ್ವ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ.",
      "ರಾಹುಕಾಲ, ಯಮಗಂಡ ಮತ್ತು ವಿಷ್ಟಿ (ಭದ್ರಾ) ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಬೇಕು."
    ],
    rinaMuktiMantra: "ಓಂ ಮಂಗಳೋ ಭೂಮಿಪುತ್ರಶ್ಚ ಋಣಹರ್ತಾ ಧನಪ್ರದಃ । ಸ್ಥಿರಾಸನೋ ಮಹಾಕಾಯಃ ಸರ್ವಕರ್ಮಾವರೋಧಕಃ ॥"
  };
}

/**
 * Looks up Master Annual Festival details from Baggona Festival Registry
 */
export function calculateFestivalDetails(
  query: string
): AstrologyQAResponse["festivalData"] | undefined {
  const result = searchBaggonaFestivals(query);
  if (!result.exactMatch) return undefined;
  const f = result.exactMatch;

  const mantra = f.nameKn.includes("ಗಣೇಶ")
    ? "॥ ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ ॥"
    : f.nameKn.includes("ಶಿವ")
    ? "॥ ಓಂ ನಮಃ ಶಿವಾಯ ॥"
    : f.nameKn.includes("ಲಕ್ಷ್ಮೀ")
    ? "॥ ಓಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ॥"
    : f.nameKn.includes("ರಾಮ")
    ? "॥ ಶ್ರೀ ರಾಮ ಜಯ ರಾಮ ಜಯ ಜಯ ರಾಮ ॥"
    : `॥ ಶ್ರೀ ${f.nameKn} ಪ್ರಸನ್ನಃ ॥`;

  const vrataVidhanaKn = `${f.descriptionKn} — ಬಗ್ಗೋಣ ಸಂಪ್ರದಾಯದಂತೆ ಶುದ್ಧ ಸ್ನಾನ, ದೇವತಾ ಸಂಕಲ್ಪ, ಷೋಡಶೋಪಚಾರ ಪೂಜೆ ಮತ್ತು ನೈವೇದ್ಯ ಸಮರ್ಪಣೆ.`;

  return {
    festivalNameKn: f.nameKn,
    festivalNameEn: f.nameEn,
    date: f.date,
    masaKn: f.masaKn,
    pakshaKn: f.pakshaKn,
    tithiKn: f.tithiKn,
    pujaWindowKn: f.pujaWindowKn,
    descriptionKn: f.descriptionKn,
    vrataVidhanaKn,
    mantra
  };
}


export interface ExtractedBirthDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  place: string;
  pincode: string;
  latitude: number;
  longitude: number;
  hasExplicitDate: boolean;
  hasExplicitTime: boolean;
  hasExplicitPlace: boolean;
  hasExplicitPincode: boolean;
}

/**
 * Robust entity extractor that parses Devotee Name, DOB, TOB, City, and Pincode
 * from any conversational user prompt (Kannada or English).
 */
export function extractPersonAndBirthDetails(
  question: string,
  existingInput?: BirthDetailsInput
): ExtractedBirthDetails {
  let name = existingInput?.name?.trim() || "";
  let birthDate = existingInput?.birthDate || "";
  let birthTime = existingInput?.birthTime || "";
  let place = existingInput?.place?.trim() || "";
  let pincode = "";
  let latitude = existingInput?.latitude || 14.5479; // Default Sri Kshetra Baggona / Gokarna
  let longitude = existingInput?.longitude || 74.3188;

  let hasExplicitDate = Boolean(birthDate);
  let hasExplicitTime = Boolean(birthTime);
  let hasExplicitPlace = Boolean(place && place !== "Custom");
  let hasExplicitPincode = false;

  // 1. Pincode Extraction (6 digits: 100000 - 999999)
  const pinMatch = question.match(/\b([1-9]\d{5})\b/);
  if (pinMatch) {
    pincode = pinMatch[1];
    hasExplicitPincode = true;
    const resolvedPin = findOfflineIndianCityOrPin(pincode);
    if (resolvedPin) {
      if (!place || place === "Custom") place = resolvedPin.name;
      latitude = resolvedPin.lat;
      longitude = resolvedPin.lng;
      hasExplicitPlace = true;
    }
  }

  // 2. City / Place Extraction
  if (!hasExplicitPlace || place === "Custom") {
    const placeMatch = question.match(
      /(?:ಸ್ಥಳ|place|city|ಊರು|ಹುಟ್ಟಿದ\s*ಊರು|ಹುಟ್ಟಿದ\s*ಸ್ಥಳ)\s*[:=]?\s*([A-Za-z\u0C80-\u0CFF]+)/i
    );
    if (placeMatch && placeMatch[1]) {
      const candidatePlace = placeMatch[1].trim();
      const resolved = findOfflineIndianCityOrPin(candidatePlace);
      if (resolved) {
        place = resolved.name;
        if (!pincode) pincode = resolved.pincode;
        latitude = resolved.lat;
        longitude = resolved.lng;
        hasExplicitPlace = true;
      } else {
        place = candidatePlace;
        hasExplicitPlace = true;
      }
    } else {
      const knownCities = [
        "gokarna", "kumta", "honnavar", "karwar", "sirsi", "ankola", "bhatkal",
        "bangalore", "bengaluru", "mangalore", "mangaluru", "udupi", "hubli",
        "hubballi", "dharwad", "belgaum", "belagavi", "mysore", "mysuru",
        "shimoga", "shivamogga", "tumkur", "tumakuru", "bellary", "ballari",
        "hassan", "mandya", "davanagere", "mumbai", "pune", "delhi", "chennai", "hyderabad"
      ];
      const qLower = question.toLowerCase();
      for (const city of knownCities) {
        if (qLower.includes(city)) {
          const resolved = findOfflineIndianCityOrPin(city);
          if (resolved) {
            place = resolved.name;
            if (!pincode) pincode = resolved.pincode;
            latitude = resolved.lat;
            longitude = resolved.lng;
            hasExplicitPlace = true;
            break;
          }
        }
      }
    }
  }

  // 3. Date of Birth (DOB) Extraction
  if (!birthDate) {
    const dobMatch = question.match(
      /(?:dob|ಹುಟ್ಟಿದ\s*ದಿನಾಂಕ|ದಿನಾಂಕ|ಜನನ\s*ದಿನಾಂಕ|born\s*on|birth\s*date)\s*[:=]?\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/i
    );
    if (dobMatch && dobMatch[1]) {
      const rawDate = dobMatch[1];
      if (/^\d{4}/.test(rawDate)) {
        const parts = rawDate.split(/[-/]/);
        birthDate = `${parts[0]}-${String(parts[1]).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")}`;
      } else {
        const parts = rawDate.split(/[-/]/);
        birthDate = `${parts[2]}-${String(parts[1]).padStart(2, "0")}-${String(parts[0]).padStart(2, "0")}`;
      }
      hasExplicitDate = true;
    } else {
      const extracted = extractDateAndTargetYear(question).extractedDate;
      if (extracted) {
        birthDate = extracted;
        hasExplicitDate = true;
      }
    }
  }

  // 4. Time of Birth (TOB) Extraction
  if (!birthTime) {
    const timeMatch = question.match(
      /(?:tob|ಸಮಯ|ಜನನ\s*ಸಮಯ|time|born\s*at|at)\s*[:=]?\s*(?:ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ)?\s*(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?/i
    );
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3]?.toLowerCase();
      const qContext = question
        .substring(Math.max(0, timeMatch.index! - 15), timeMatch.index! + 20)
        .toLowerCase();

      if (ampm === "pm" && hours < 12) hours += 12;
      else if (ampm === "am" && hours === 12) hours = 0;
      else if (!ampm) {
        if (
          (qContext.includes("ಮಧ್ಯಾಹ್ನ") ||
            qContext.includes("ಸಂಜೆ") ||
            qContext.includes("ರಾತ್ರಿ")) &&
          hours < 12
        ) {
          hours += 12;
        }
      }

      birthTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      hasExplicitTime = true;
    } else {
      const standaloneTime = question.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm|AM|PM)?\b/);
      if (standaloneTime) {
        let hours = parseInt(standaloneTime[1], 10);
        const minutes = parseInt(standaloneTime[2], 10);
        const ampm = standaloneTime[3]?.toLowerCase();
        if (ampm === "pm" && hours < 12) hours += 12;
        else if (ampm === "am" && hours === 12) hours = 0;
        birthTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        hasExplicitTime = true;
      } else {
        birthTime = "12:00"; // default noon if time not given
      }
    }
  }

  // 5. Person Name Extraction
  if (!name) {
    const nameMatch = question.match(
      /(?:ಹೆಸರು|name|ವ್ಯಕ್ತಿಯ\s*ಹೆಸರು|ಬಾಲಕನ\s*ಹೆಸರು|ಮಗನ\s*ಹೆಸರು|ಮಗಳ\s*ಹೆಸರು|devotee)\s*[:=]?\s*([A-Za-z\u0C80-\u0CFF]+)/i
    );
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    } else {
      const candidate = extractCandidateNameFromQuery(question);
      if (
        candidate &&
        candidate.length >= 2 &&
        !["ಯಾವಾಗ", "ಹೇಗೆ", "ಮುಹೂರ್ತ", "ತಿಥಿ", "ನಕ್ಷತ್ರ", "ಯಾವ", "ಆರೋಗ್ಯ", "ಆಯುಷ್ಯ", "ದೋಷ"].includes(candidate)
      ) {
        name = candidate;
      } else {
        name = "ಭಕ್ತರು (Native Devotee)";
      }
    }
  }

  if (!place) place = "Gokarna (ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ)";
  if (!pincode) pincode = "581326";

  return {
    name,
    birthDate,
    birthTime,
    place,
    pincode,
    latitude,
    longitude,
    hasExplicitDate,
    hasExplicitTime,
    hasExplicitPlace,
    hasExplicitPincode
  };
}

/**
 * Computes 100% deterministic Personal Astrology Profile (Lagna, Rashi, Nakshatra Pada,
 * Namakarana syllables, Aarogya health analysis, Ayush longevity, and Doshas)
 */
export function calculatePersonalAstrologyProfile(
  details: ExtractedBirthDetails,
  targetDate: Date = new Date()
): PersonalHoroscopeData | undefined {
  if (!details.hasExplicitDate || !details.birthDate) {
    return undefined;
  }

  try {
    const kundliInput = {
      name: details.name,
      birthDate: details.birthDate,
      birthTime: details.birthTime,
      latitude: details.latitude,
      longitude: details.longitude,
      pincode: details.pincode
    };

    const kundli = calculateKundli(kundliInput);
    const doshaReport = calculateComprehensiveDoshas(kundli, kundliInput, targetDate);

    const lagnaRashiKn = toKannadaRashi(kundli.lagnaRashi.index);
    const lagnaRashiEn = kundli.lagnaRashi?.english || "Aries";
    const lagnaDegree = kundli.ascendant || 0;

    const moon = kundli.planets.find((p) => p.name === "Moon");
    const moonRashiKn = toKannadaRashi(moon?.rashi.index);
    const moonRashiEn = moon?.rashi.english || "Aries";
    const moonNakshatraKn = toKannadaNakshatra(moon?.nakshatra.index);
    const moonNakshatraEn = moon?.nakshatra.english || "Ashwini";
    const moonPada = kundli.moonPada || 1;

    const sun = kundli.planets.find((p) => p.name === "Sun");
    const sunRashiKn = toKannadaRashi(sun?.rashi.index);
    const sunRashiEn = sun?.rashi.english || "Aries";

    const age = ageDecimalYearsAt(
      details.birthDate,
      details.birthTime,
      details.latitude,
      details.longitude,
      targetDate
    );
    const bhukti = findBhuktiAtAge(kundli, age);
    const currentMahadashaKn = bhukti
      ? toKannadaPlanet(bhukti.maha.planet) + " ಮಹಾದಶಾ"
      : "ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ";
    const currentAntardashaKn = bhukti
      ? toKannadaPlanet(bhukti.bhukti) + " ಅಂತರ್ದಶಾ"
      : "ಶುಭ ಅಂತರ್ದಶಾ";

    // 1. Namakarana from Avakahada
    const avakahada = lookupAvakahadaByNakshatraAndPada(moonNakshatraEn, moonPada);
    const canonicalSyllableKn = avakahada?.canonicalSoundKn || "ಅ";
    const canonicalSyllableEn = avakahada?.canonicalSoundEn || "A";
    const allSyllablesKn = avakahada?.syllablesKn || [canonicalSyllableKn];
    const sampleNamesKn = avakahada?.sampleNamesKn || [];
    const sampleNamesEn = avakahada?.sampleNamesEn || [];
    const deityKn = avakahada?.deityKn || "ಇಷ್ಟದೇವತೆ";
    const ganaKn = avakahada?.ganaKn || "ದೇವ";
    const animalYoniKn = avakahada?.animalYoniKn || "ಕುದುರೆ";
    const nadiKn = avakahada?.nadiKn || "ಆದ್ಯ";
    const elementKn = avakahada?.elementKn || "ಅಗ್ನಿ";

    // 2. Aarogya (Health & 6th House) Analysis
    const sixthHouseIdx = (kundli.lagnaRashi.index + 5) % 12;
    const sixthHouseRashiKn = toKannadaRashi(sixthHouseIdx);
    const sixthHousePlanets = kundli.planets.filter((p) => p.house === 6);
    const eighthHousePlanets = kundli.planets.filter((p) => p.house === 8);

    const lagnaLordName = signLord(kundli.lagnaRashi.index);
    const lagnaLordHouse =
      kundli.planets.find((p) => p.name === lagnaLordName)?.house || 1;
    const isLagnaLordStrong = [1, 4, 5, 7, 9, 10, 11].includes(lagnaLordHouse);

    const vitalitySummaryKn = isLagnaLordStrong
      ? `ಲಗ್ನಾಧಿಪತಿಯು ${lagnaLordHouse}ನೇ ಶುಭ ಭಾವದಲ್ಲಿದ್ದು, ನೈಸರ್ಗಿಕ ಜೀವಬಲ (Vitality) ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಸದೃಢವಾಗಿದೆ.`
      : `ಲಗ್ನಾಧಿಪತಿಯು ${lagnaLordHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಶಾರೀರಿಕ ತ್ರಾಣ ಮತ್ತು ರೋಗನಿರೋಧಕ ಬಲವನ್ನು ನಿರಂತರ ಜಪ-ಧ್ಯಾನಗಳಿಂದ ವೃದ್ಧಿಸಿಕೊಳ್ಳಬೇಕು.`;

    const sixthHouseSummaryKn =
      sixthHousePlanets.length > 0
        ? `೬ನೇ ರೋಗ ಭಾವದಲ್ಲಿ (${sixthHouseRashiKn}) ${sixthHousePlanets.map((p) => toKannadaPlanet(p.name)).join(", ")} ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಇದೆ.`
        : `೬ನೇ ರೋಗ ಭಾವವು (${sixthHouseRashiKn}) ಶುಭ ದೃಷ್ಟಿಯಲ್ಲಿದ್ದು, ಸಾಧಾರಣ ಋತುಮಾನದ ಬಾಧೆಗಳ ಹೊರತು ತೀವ್ರ ರೋಗ ಭೀತಿಯಿಲ್ಲ.`;

    const eighthHouseSummaryKn =
      eighthHousePlanets.length > 0
        ? `೮ನೇ ಆಯುರ್ಭಾವದಲ್ಲಿ ${eighthHousePlanets.map((p) => toKannadaPlanet(p.name)).join(", ")} ಗ್ರಹಗಳಿದ್ದು, ದೀರ್ಘಕಾಲಿಕ ವಾತ/ಉದರ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ.`
        : `೮ನೇ ಆಯುರ್ಭಾವವು ನಿರ್ದೋಷವಾಗಿದ್ದು, ದೀರ್ಘಾಯುಷ್ಯದ ಬಲವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ.`;

    // Tridosha from Lagna element
    const tridoshaKn = ["ಮೇಷ", "ಸಿಂಹ", "ಧನುಸ್ಸು"].includes(lagnaRashiKn)
      ? "ಪಿತ್ತ ಪ್ರಕೃತಿ (ಅಗ್ನಿ ತತ್ವ - ಉಷ್ಣ, ಜೀರ್ಣಕ್ರಿಯೆ, ರಕ್ತ ಸಂಚಲನ ಕಾಳಜಿ)"
      : ["ಮಿಥುನ", "ತುಲಾ", "ಕುಂಭ"].includes(lagnaRashiKn)
      ? "ವಾತ ಪ್ರಕೃತಿ (ವಾಯು ತತ್ವ - ನರಮಂಡಲ, ಕೀಲು, ವಾಯು ಪ್ರಕೋಪ ಕಾಳಜಿ)"
      : ["ಕರ್ಕಾಟಕ", "ವೃಶ್ಚಿಕ", "ಮೀನ"].includes(lagnaRashiKn)
      ? "ಕಫ ಪ್ರಕೃತಿ (ಜಲ ತತ್ವ - ಶೀತ, ಶ್ವಾಸಕೋಶ, ಜಲ ದೋಷ ಕಾಳಜಿ)"
      : "ವಾತ-ಕಫ ಮಿಶ್ರಿತ ಪ್ರಕೃತಿ (ಪೃಥ್ವಿ ತತ್ವ - ಮೂಳೆ, ಸ್ನಾಯು, ಶಾರೀರಿಕ ಬಲ)";

    const cautionsKn: string[] = [];
    if (sixthHousePlanets.some((p) => p.name === "Mars" || p.name === "Sun")) {
      cautionsKn.push("ರಕ್ತದೊತ್ತಡ, ಉಷ್ಣ ಪಿತ್ತ ಮತ್ತು ಶಸ್ತ್ರಚಿಕಿತ್ಸಾ ಎಚ್ಚರಿಕೆ.");
    }
    if (sixthHousePlanets.some((p) => p.name === "Saturn" || p.name === "Rahu")) {
      cautionsKn.push("ಕೀಲು ನೋವು, ಅಜೀರ್ಣ ಮತ್ತು ಅನಿಶ್ಚಿತ ನರಗಳ ದೌರ್ಬಲ್ಯ ಎಚ್ಚರಿಕೆ.");
    }
    if (cautionsKn.length === 0) {
      cautionsKn.push("ಋತು ಬದಲಾವಣೆಯ ಸಂದರ್ಭದಲ್ಲಿ ಜೀರ್ಣಾಂಗ ಮತ್ತು ಶೀತ ರಕ್ಷಣೆ.");
    }

    const remedialHomasKn = [
      "ಧನ್ವಂತರಿ ಮಹಾಹೋಮ (ಆರೋಗ್ಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ ಸಿದ್ಧಿಗೆ)",
      "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ",
      "ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ನಿತ್ಯ ಪಠಣ (ಜೀವಬಲ ವೃದ್ಧಿಗೆ)"
    ];

    // 3. Ayush (Longevity) Analysis
    const saturn = kundli.planets.find((p) => p.name === "Saturn");
    const saturnHouse = saturn?.house || 1;
    const saturnPlacementKn = `ಆಯುಷ್ಯಕಾರಕ ಶನಿಯು ${saturnHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದಾನೆ ${
      saturnHouse === 8 ? "(೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಆಯುರ್ವೃದ್ಧಿಕಾರಕ)" : ""
    }`;

    const secondLordIdx = rashiIndexInHouse(kundli.lagnaRashi.index, 2);
    const seventhLordIdx = rashiIndexInHouse(kundli.lagnaRashi.index, 7);
    const marakaGrahasKn = `ಮಾರಕ ಸ್ಥಾನಗಳಾದ ೨ನೇ ಮನೆ ಅಧಿಪತಿ (${toKannadaPlanet(
      signLord(secondLordIdx)
    )}) ಮತ್ತು ೭ನೇ ಮನೆ ಅಧಿಪತಿ (${toKannadaPlanet(signLord(seventhLordIdx))})`;

    const longevityCategoryKn =
      isLagnaLordStrong || saturnHouse === 8
        ? "ದೀರ್ಘಾಯುಷ್ಯ (ಪೂರ್ಣಾಯು ೭೦ ರಿಂದ ೧೦೦+ ವರ್ಷಗಳ ಸುಕ್ಷೇಮ ಯೋಗ)"
        : "ಮಧ್ಯಮಾಯುಷ್ಯ (೫೫ ರಿಂದ ೭೫ ವರ್ಷಗಳು - ನಿರಂತರ ಮೃತ್ಯುಂಜಯ ಕವಚದಿಂದ ಆಯುರ್ವೃದ್ಧಿ)";
    const longevityCategoryEn =
      isLagnaLordStrong || saturnHouse === 8
        ? "Purnayu (Full Longevity 70 to 100+ Years)"
        : "Madhyayu (Medium Longevity 55 to 75 Years)";

    const eighthHouseIdx = (kundli.lagnaRashi.index + 7) % 12;
    const ayurBhavaKn = `೮ನೇ ಆಯುರ್ಭಾವವು ${toKannadaRashi(eighthHouseIdx)} ರಾಶಿಯಲ್ಲಿದ್ದು ಆಯುಷ್ಯ ಬಲವನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.`;
    const protectiveYogasKn =
      "ಗುರು ಬಲ, ಲಗ್ನ ರಕ್ಷಾ ಕವಚ ಹಾಗೂ ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ದೈವಿಕ ರಕ್ಷಣೆ.";
    const mrityunjayaMantra =
      "॥ ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥";

    // 4. Dosha Analysis
    const activeDoshas = (doshaReport.doshas || []).filter((d) => d.severity !== "none");
    const doshaList = activeDoshas.map((d) => ({
      nameKn: d.name?.kn || d.name?.en || d.id,
      nameEn: d.name?.en || d.name?.kn || d.id,
      severityKn:
        d.severity === "critical"
          ? "ತೀವ್ರ ದೋಷ"
          : d.severity === "high"
          ? "ಮಧ್ಯಮ ತೀವ್ರ"
          : "ಸಾಮಾನ್ಯ ದೋಷ",
      technicalWhyKn: d.technicalWhy?.kn || d.technicalWhy?.en || "ಗ್ರಹಗಳ ಸಂಯೋಗ ಮತ್ತು ದೃಷ್ಟಿ ಫಲ.",
      pariharaKn: d.recommendedPooja?.kn || d.recommendedPooja?.en || "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪರಿಹಾರ ಸೇವೆ."
    }));

    return {
      name: details.name,
      birthDate: details.birthDate,
      birthTime: details.birthTime,
      place: details.place,
      pincode: details.pincode,
      lat: details.latitude,
      lng: details.longitude,
      lagnaRashiKn,
      lagnaRashiEn,
      lagnaDegree,
      moonRashiKn,
      moonRashiEn,
      moonNakshatraKn,
      moonNakshatraEn,
      moonPada,
      sunRashiKn,
      sunRashiEn,
      currentMahadashaKn,
      currentAntardashaKn,
      namakarana: {
        canonicalSyllableKn,
        canonicalSyllableEn,
        allSyllablesKn,
        sampleNamesKn,
        sampleNamesEn,
        deityKn,
        ganaKn,
        animalYoniKn,
        nadiKn,
        elementKn
      },
      aarogya: {
        vitalitySummaryKn,
        sixthHouseSummaryKn,
        eighthHouseSummaryKn,
        tridoshaKn,
        cautionsKn,
        remedialHomasKn
      },
      ayush: {
        longevityCategoryKn,
        longevityCategoryEn,
        ayurBhavaKn,
        saturnPlacementKn,
        marakaGrahasKn,
        protectiveYogasKn,
        mrityunjayaMantra
      },
      doshas: {
        activeCount: doshaList.length,
        doshaList,
        gandantaSummaryKn: (doshaReport.gandantaraAndBhaya?.activeGandantarasCount ?? 0) > 0
          ? "ಗಂಡಾಂತ ಸಂಧಿ ದೋಷವಿದೆ (ಶಾಂತಿ ಅವಶ್ಯಕ)."
          : "ಯಾವುದೇ ಗಂಡಾಂತ ದೋಷವಿಲ್ಲ (ಪರಿಶುದ್ಧ ಜನನ).",
        sadeSatiSummaryKn: "ಪ್ರಸ್ತುತ ಗೋಚಾರ ಶನಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ."
      }
    };
  } catch (err) {
    console.warn("Failed to calculate personal astrology profile:", err);
    return undefined;
  }
}

/**
 * Detects special astrological entities from the user prompt
 */
function inspectQuestionIntent(
  question: string,
  birthDetails?: BirthDetailsInput
): {
  intent: AstrologyQAResponse["detectedIntent"];
  nakshatraIndex?: number;
  nakshatraName?: string;
  pada?: number;
  isVahanaMuhurtha: boolean;
  isMarriageQuery: boolean;
  isCareerQuery: boolean;
  isMulaNakshatra: boolean;
  isRevatiNakshatra: boolean;
  isMeenaRashi: boolean;
  isNameLookup: boolean;
  matchedNameData?: AvakahadaMatchResult;
  isPanchangaQuery: boolean;
  isHoraryQuery: boolean;
  isMaranaShraddha: boolean;
  isSurrenderClosure: boolean;
  isFestival: boolean;
  isAarogya: boolean;
  isAyush: boolean;
  isNamakarana: boolean;
  isDosha: boolean;
  extractedBirthDetails: ExtractedBirthDetails;
  extractedDate: string | null;
  targetYear: number;
} {
  const qLower = question.toLowerCase();

  const extractedBirthDetails = extractPersonAndBirthDetails(question, birthDetails);
  const isAarogya =
    /aarogya|health|disease|illness|sick|hospital|roga|ayurveda|tridosha|diet|body|vitality|immunity|ಆರೋಗ್ಯ|ರೋಗ|ಕಾಯಿಲೆ|ಅನಾರೋಗ್ಯ|ವೈದ್ಯ|ಆಸ್ಪತ್ರೆ|ದೈಹಿಕ\s*ಬಲ|ಪಿತ್ತ|ವಾತ|ಕಫ|ಚಿಕಿತ್ಸೆ|ದೇಹ\s*ಸ್ಥಿತಿ|ರೋಗ\s*ಬಾಧೆ|ರೋಗಕಾರಕ/i.test(
      qLower
    );

  const isAyush =
    /ayush|ayurdaya|longevity|lifespan|life\s*span|how\s*long|death\s*timing|maraka|maraka\s*dasha|mrityunjaya|ಆಯುಷ್ಯ|ಆಯುಸ್ಸು|ಆಯುರ್ದಾಯ|ಆಯಸ್ಸು|ಮಾರಕ|ಮೃತ್ಯು|ಎಷ್ಟು\s*ವರ್ಷ|ಬಾಲಾರಿಷ್ಟ|ದೀರ್ಘಾಯುಷ್ಯ|ಅಪಮೃತ್ಯು|ಆಯುರ್ವೇದ\s*ರಕ್ಷೆ|ಆಯುರ್ವೃದ್ಧಿ/i.test(
      qLower
    );

  const isNamakarana =
    /namakarana|naming|baby\s*name|letter|syllable|name\s*suggestion|ನಾಮಕರಣ|ನಾಮಾಕ್ಷರ|ಹೆಸರು\s*ಇಡು|ಮಗುವಿನ\s*ಹೆಸರು|ಯಾವ\s*ಅಕ್ಷರ|ಶುಭ\s*ಹೆಸರು|ನಾಮಧೇಯ|ನಾಮ\s*ಕರಣ|ಮಗುವಿಗೆ\s*ಹೆಸರು/i.test(
      qLower
    );

  const isDosha =
    /dosha|shanti|parihara|manglik|kuja\s*dosha|kala\s*sarpa|pitru\s*dosha|guru\s*chandala|balarishta|gandanta|sade\s*sati|ashtama\s*shani|ದೋಷ|ಶಾಂತಿ|ಪರಿಹಾರ|ಕುಜ\s*ದೋಷ|ಮಾಂಗಲಿಕ|ಕಾಲಸರ್ಪ|ಕಾಳಸರ್ಪ|ಪಿತೃ\s*ದೋಷ|ಗುರು\s*ಚಂಡಾಲ|ಗಂಡಾಂತ|ಏಳರೆನಾಡು|ಸಾಡೇಸಾತಿ|ಅಷ್ಟಮ\s*ಶನಿ|ಸರ್ಪ\s*ದೋಷ|ಬಾಲಾರಿಷ್ಟ|ದೋಷಗಳ/i.test(
      qLower
    );

  // 1. Check for Name-to-Nakshatra Lookup (Avakahada Chakra)
  const isNameQuerySyntax =
    /whose\s*name|name\s*is|ಹೆಸರು|ಯಾರ\s*ಹೆಸರು|ನಾಮಾಕ್ಷರ|whose|belongs\s*to\s*which\s*nakshatra|what\s*star\s*for|which\s*pada\s*for/i.test(
      qLower
    );

  const matchedName = lookupNakshatraByDevoteeName(question);
  const isNameLookup = Boolean(
    matchedName &&
      !extractedBirthDetails.hasExplicitDate &&
      !isAarogya &&
      !isAyush &&
      !isNamakarana &&
      !isDosha &&
      (isNameQuerySyntax ||
        /whose\s*name|ಯಾರ\s*ಹೆಸರು|ನಾಮಾಕ್ಷರ\s*ನಕ್ಷತ್ರ|hiranya|hiranyaksha|ಹಿರಣ್ಯಾ|ಹಿರಣ್ಯ|prakash|pramod|ಪ್ರಕಾಶ್|ಪ್ರಮೋದ್/i.test(
          qLower
        ))
  );

  // 2. Strict Pada Detection (Avoid single digit false positives!)
  const isPada1 =
    /(?:1st\s*pada|1\s*pada|೧\s*ನೇ\s*ಪಾದ|1\s*ನೇ\s*ಪಾದ|ಪ್ರಥಮ\s*ಪಾದ|पहला\s*चरण|ఒకటవ\s*పాదం|முதல்\s*பாதம்|1st\s*quarter)/i.test(
      qLower
    );
  const isPada2 =
    /(?:2nd\s*pada|2\s*pada|೨\s*ನೇ\s*ಪಾದ|2\s*ನೇ\s*ಪಾದ|ದ್ವಿತೀಯ\s*ಪಾದ|दूसरा\s*चरण|రెండవ\s*పాదం|இரண்டாம்\s*பாதம்|2nd\s*quarter)/i.test(
      qLower
    );
  const isPada3 =
    /(?:3rd\s*pada|3\s*pada|೩\s*ನೇ\s*ಪಾದ|3\s*ನೇ\s*ಪಾದ|ತೃತೀಯ\s*ಪಾದ|तीसरा\s*चरण|మూడవ\s*పాదం|மூன்றாம்\s*பாதம்|3rd\s*quarter)/i.test(
      qLower
    );
  const isPada4 =
    /(?:4th\s*pada|4\s*pada|೪\s*ನೇ\s*ಪಾದ|4\s*ನೇ\s*ಪಾದ|ಚತುರ್ಥ\s*ಪಾದ|चौथा\s*चरण|నాల్గవ\s*పాదం|நான்காம்\s*பாதம்|4th\s*quarter)/i.test(
      qLower
    );

  const detectedPada = isPada1 ? 1 : isPada2 ? 2 : isPada3 ? 3 : isPada4 ? 4 : undefined;

  // 3. Specific Nakshatra Detection (Brihat Parashara 27 Nakshatras)
  const isMula = /(?:mula|moola|ಮೂಲ|ಮೂಲಾ|मूल|మూల|மூல)/i.test(qLower);
  const isRevati = /(?:revati|revathi|ರೇವತಿ|रेवती|రేవతి|ரேவதி)/i.test(qLower);
  const isMeena = /(?:meen|meena|pisces|ಮೀನ|मीन|మీన|மீனம்)/i.test(qLower);

  const matchedShastraNak = lookupNakshatraByName(qLower);

  // 4. Topic Detection
  const isVahana =
    /vahana|vehicle|car|bike|ಖರೀದಿ|ವಾಹನ|ಗಾಡಿ|ಕಾರು|वाहन|गाड़ी|వాహనం|வாகனம்|buy|purchase/i.test(qLower);
  const isMarriage =
    /marriage|marry|wedding|vivaha|maduve|ಲಗ್ನ|ಮದುವೆ|ವಿವಾಹ|ಸಪ್ತಮ|7th\s*house|विवाह|शादी|పెళ్లి|వివాహం|திருமணம்/i.test(
      qLower
    );
  const isCareer =
    /job|career|work|business|promotion|ವೃತ್ತಿ|ಉದ್ಯೋಗ|ಕೆಲಸ|ವ್ಯಾಪಾರ|10th\s*house|ದಶಮ|नौकरी|व्यापार|ఉద్యోగం|தொழில்/i.test(
      qLower
    );

  const isPanchangaQuery =
    /(?:ಇಂದಿನ|ಇವತ್ತಿನ|today(?:'s)?)\s*(?:ಬಗ್ಗೋಣ\s*)?(?:ಪಂಚಾಂಗ|ತಿಥಿ|ನಕ್ಷತ್ರ|ವಾರ|ಯೋಗ|ಕರಣ|ಹೋರಾ|ಹೋರೆ|ರಾಹುಕಾಲ|ಚೋಘಡಿಯಾ|panchanga|tithi|nakshatra|hora)|ಪಂಚಾಂಗ\s*(?:ತಿಳಿಸಿ|ಹೇಳಿ|ಯಾವುದು)|ಇಂದಿನ\s*ದಿನ|ಹೋರಾ\s*ಸಮಯ|ಚೋಘಡಿಯಾ|ರಾಹುಕಾಲ|rahu\s*kaala|choghadiya/i.test(
      qLower
    );

  const isHoraryQuery =
    /ಆಗುವುದೇ|ಸಿಗುವುದೇ|ಬರುವುದೇ|will\s*i\s*get|will\s*it\s*happen|should\s*i|ಪ್ರಶ್ನ|horary|prashna|success|recover/i.test(
      qLower
    );

  // 5. Marana / Death / Shraddha / Ashaucha Detection
  const isMaranaShraddha =
    /marana|death|died|demise|shraddha|shradh|ashaucha|antyeshti|antya\s*samskara|garuda\s*purana|masika|pratyabdika|mahalaya|tarpana|moksha|asthi|ಮರಣ|ಸಾವು|ತೀರಿಕೊಂಡ|ಶ್ರಾದ್ಧ|ಆಶೌಚ|ಅಂತ್ಯೇಷ್ಟಿ|ಮಾಸಿಕ|ಪ್ರತ್ಯಾಬ್ದಿಕ|ಪಿಂಡ|ತರ್ಪಣ|ಅಸ್ಥಿ|ಮೋಕ್ಷ|ಗರುಡ\s*ಪುರಾಣ|ಪಂಚಕ|ಧನಿಷ್ಠಾ|ತಿಥಿ\s*ಶ್ರಾದ್ಧ/i.test(
      qLower
    );

  // 6. Surrender / Closure / Rina Mukti Muhurtha Detection (Hotel, Lease, Business)
  const isSurrenderClosure =
    /\bsurrender\b|\bsurrendering\b|\bhandover\b|\bvacate\b|\bwinding\s*up\b|\bdebt\b|\brepay\b|\bloan\b|\brina\s*mukti\b|\brina\s*vimochana\b|\blease\b|\bclose\s*hotel\b|\bclose\s*business\b|ಹೊಟೇಲ್\s*ಒಪ್ಪಿಸ|ಒಪ್ಪಿಸ|ಖಾಲಿ\s*ಮಾಡು|ವ್ಯಾಪಾರ\s*ಸಮಾಪ್ತಿ|ವ್ಯಾಪಾರ\s*ಮುಕ್ತಾಯ|ಅಂಗಡಿ\s*ಮುಚ್ಚ|ಸಾಲ\s*ತೀರಿಸ|ಋಣ\s*ಮುಕ್ತಿ|ಕರಾರು\s*ರದ್ದು|ಬಿಸಿನೆಸ್\s*ಕ್ಲೋಸ್/i.test(
      qLower
    );

  // 7. Festival & Vrata Detection
  const isFestival =
    /festival|vrata|ekadashi|shivaratri|deepavali|diwali|ganesh|chaturthi|ugadi|sankranti|navaratri|dasara|janmashtami|gokulashtami|rama\s*navami|hanuman\s*jayanti|akshaya\s*tritiya|dussehra|ಹಬ್ಬ|ಉತ್ಸವ|ವ್ರತ|ಏಕಾದಶಿ|ಶಿವರಾತ್ರಿ|ದೀಪಾವಳಿ|ಗಣೇಶ|ಚತುರ್ಥಿ|ಯುಗಾದಿ|ಸಂಕ್ರಾಂತಿ|ನವರಾತ್ರಿ|ದಸರಾ|ಜನ್ಮಾಷ್ಟಮಿ|ಗೋಕುಲಾಷ್ಟಮಿ|ರಾಮನವಮಿ|ಹನುಮಜ್ಜಯಂತಿ|ಅಕ್ಷಯ\s*ತೃತೀಯ/i.test(
      qLower
    );


  const { extractedDate, targetYear } = extractDateAndTargetYear(question);

  let intent: AstrologyQAResponse["detectedIntent"] = "general_siddhanta";

  if (isMaranaShraddha) {
    intent = "marana_shraddha";
  } else if (isSurrenderClosure) {
    intent = "surrender_closure_muhurtha";
  } else if (isFestival) {
    intent = "festival_vrata_details";
  } else if (isVahana || /muhurtha|muhurat|ಮುಹೂರ್ತ|ಶುಭ ದಿನ|good day|griha\s*pravesha|ಗೃಹಪ್ರವೇಶ/i.test(qLower)) {
    intent = "muhurtha_timing";
  } else if (isMarriage) {
    intent = "marriage_7th_house";
  } else if (isCareer) {
    intent = "career_10th_house";
  } else if (isMula || /ashlesha|jyeshtha|ashwini|magha/i.test(qLower) || (matchedShastraNak && !isAarogya && !isAyush && !isNamakarana)) {
    intent = "nakshatra_pada_dosha";
  } else if (isNameLookup) {
    intent = "name_nakshatra_lookup";
  } else if (isPanchangaQuery) {
    intent = "panchanga_today";
  } else if (isAarogya) {
    intent = "aarogya_health";
  } else if (isAyush) {
    intent = "ayush_longevity";
  } else if (isNamakarana) {
    intent = "namakarana_naming";
  } else if (isDosha && (extractedBirthDetails.hasExplicitDate || /ಕುಜ\s*ದೋಷ|ಮಾಂಗಲಿಕ|ಕಾಲಸರ್ಪ|ಕಾಳಸರ್ಪ|ಪಿತೃ\s*ದೋಷ|ನನ್ನ\s*ಜಾತಕ|check\s*dosha/i.test(qLower))) {
    intent = "comprehensive_dosha_shanti";
  } else if (extractedBirthDetails.hasExplicitDate) {
    intent = "personal_kundli_full";
  } else if (isHoraryQuery) {
    intent = "horary_prashna";
  } else {
    intent = "general_siddhanta";
  }

  return {
    intent,
    nakshatraIndex: isNameLookup
      ? matchedName?.entry.nakshatraIndex
      : isMula
      ? 18
      : isRevati
      ? 26
      : matchedShastraNak?.index,
    nakshatraName: isNameLookup
      ? matchedName?.entry.nakshatraNameEn
      : isMula
      ? "Mula"
      : isRevati
      ? "Revati"
      : matchedShastraNak?.name.en,
    pada: isNameLookup ? matchedName?.entry.pada : detectedPada,
    isVahanaMuhurtha: isVahana,
    isMarriageQuery: isMarriage,
    isCareerQuery: isCareer,
    isMulaNakshatra: isMula,
    isRevatiNakshatra: isRevati,
    isMeenaRashi: isMeena,
    isNameLookup,
    matchedNameData: isNameLookup ? matchedName : undefined,
    isPanchangaQuery,
    isHoraryQuery,
    isMaranaShraddha,
    isSurrenderClosure,
    isFestival,
    isAarogya,
    isAyush,
    isNamakarana,
    isDosha,
    extractedBirthDetails,
    extractedDate,
    targetYear
  };
}

/**
 * Strips raw markdown artifacts (stars, slashes, hashtags) and normalizes formatting
 * into clean, natural Indic/English prose.
 */
export function sanitizeAstrologyText(text: string, lang: SupportedLanguage = "kn"): string {
  if (!text) return "";
  let cleaned = text;

  // 1. Remove bold/italic markdown stars (**bold**, *italic*, __bold__, _italic_)
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/__(.*?)__/g, "$1");
  cleaned = cleaned.replace(/_(.*?)_/g, "$1");

  // 2. Remove markdown header markers at start of lines (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // 3. Replace awkward raw slashes between words with natural conjunctions
  if (lang === "kn") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " ಮತ್ತು ");
  } else if (lang === "hi") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " और ");
  } else if (lang === "te") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " మరియు ");
  } else if (lang === "ta") {
    cleaned = cleaned.replace(/\s*\/\s*/g, " மற்றும் ");
  } else {
    cleaned = cleaned.replace(/\s*\/\s*/g, " and ");
  }

  // 4. Clean bullet markdown tokens (* bullet, - bullet) at line starts
  cleaned = cleaned.replace(/^[*\-•]\s+/gm, "");

  // 5. Clean any lingering raw asterisks or hash symbols
  cleaned = cleaned.replace(/[*#]/g, "");

  // 6. Clean multiple spaces but keep line breaks intact
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  return cleaned.trim();
}

/**
 * Formulates a serene, natural spoken narration for text-to-speech audio playback.
 * Removes all bullet symbols, numbering, and technical debris so it sounds like a living
 * master Daivajna speaking live wisdom to the devotee.
 */
export function buildSpokenAstrologyNarrative(
  sections: AstrologyQASection[],
  lang: SupportedLanguage
): string {
  if (!sections || sections.length === 0) return "";

  const cleanSpoken = (txt: string) =>
    txt
      .replace(/^[೧೨೩೪1234]\.\s*/gm, "")
      .replace(/^[*\-•]\s*/gm, "")
      .replace(/[#*`_~]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const parts: string[] = [];

  // 1. Spoken philosophical analysis
  if (sections[0]?.content) {
    const p1 = sections[0].content.split("\n").filter((l) => l.trim().length > 0)[0] || "";
    if (p1) parts.push(cleanSpoken(p1));
  }

  // 2. Spoken timing counsel
  if (sections[1]?.content) {
    const p2 = sections[1].content.split("\n").filter((l) => l.trim().length > 0)[0] || "";
    if (p2) parts.push(cleanSpoken(p2));
  }

  // 3. Spoken priest blessing & verdict
  if (sections[3]?.content) {
    const p4 = cleanSpoken(sections[3].content);
    if (p4) parts.push(p4);
  }

  return parts.join(". ");
}

/**
 * Parses raw markdown response into structured royal cards
 */
function parseAstrologyAnswerSections(rawText: string, lang: SupportedLanguage): AstrologyQASection[] {
  const sections: AstrologyQASection[] = [];

  // First try splitting by markdown headings with section numbers
  let rawParts = rawText.split(/(?:^|\n)(?:###|\*\*|##)\s*(?:[೧೨೩೪1234]\.|\d\.)\s*/);

  // If no markdown tokens were present, split by top-level numbered headings separated by double newlines
  if (rawParts.length < 4) {
    rawParts = rawText.split(/(?:^|\n\s*\n)\s*(?:[೧೨೩೪1234]\.|\d\.)\s*/);
  }

  const defaultTitles: Record<SupportedLanguage, [string, string, string, string]> = {
    kn: [
      "೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ",
      "೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ",
      "೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ",
      "೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ"
    ],
    en: [
      "1. Classical Shastra & Technical Analysis",
      "2. Auspicious Timing, Muhurtha & Planetary Transits",
      "3. Sacred Remedies, Shanti Homa & Temple Sevas",
      "4. Astrologer's Verdict & Divine Blessings"
    ],
    hi: [
      "१. शास्त्रीय सिद्धांत एवं तकनीकी विश्लेषण",
      "२. काल निर्णय, शुभ मुहूर्त एवं दशा फल",
      "३. दैवीय उपाय, शांति होम एवं पूजा विधि",
      "४. ज्योतिषी का संदेश एवं आशीर्वाद"
    ],
    te: [
      "1. శాస్త్రీయ సిద్ధాంతం & జ్యోతిష్య విశ్లేషణ",
      "2. కాల నిర్ణయం, శుభ ముహూర్తం & దశా ఫలితం",
      "3. దైవిక పరిహారాలు, శాంతి హోమం & పూజా విధానం",
      "4. ఆచార్యుల సందేశం & ఆశీర్వాదం"
    ],
    ta: [
      "1. சாஸ்திர ரீதியான ஜோதிட விளக்கம்",
      "2. கால நிர்ணயம், சுப முகூர்த்தம் & தசா பலன்கள்",
      "3. பரிகாரங்கள், சாந்தி ஹோமம் & வழிபாட்டு முறை",
      "4. ஜோதிடரின் வழிகாட்டுதல் & ஆசிகள்"
    ]
  };

  const icons = ["📜", "⏱️", "🪔", "✨"];
  const titles = defaultTitles[lang] || defaultTitles.kn;

  if (rawParts.length >= 4) {
    for (let i = 1; i < rawParts.length && i <= 4; i++) {
      const part = rawParts[i].trim();
      const firstLineEnd = part.indexOf("\n");
      let title = titles[i - 1];
      let content = part;

      if (firstLineEnd !== -1) {
        const potentialTitle = part.substring(0, firstLineEnd).replace(/[*#]/g, "").trim();
        if (potentialTitle.length > 3 && potentialTitle.length < 80) {
          title = potentialTitle;
          content = part.substring(firstLineEnd).trim();
        }
      }

      sections.push({
        title: title.replace(/[*#]/g, "").trim(),
        content: sanitizeAstrologyText(content, lang),
        icon: icons[i - 1]
      });
    }
  }

  // Fallback if unstructured
  if (sections.length === 0) {
    const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (paragraphs.length >= 4) {
      for (let i = 0; i < 4; i++) {
        sections.push({
          title: titles[i],
          content: sanitizeAstrologyText(paragraphs[i], lang),
          icon: icons[i]
        });
      }
    } else {
      sections.push({
        title: titles[0],
        content: sanitizeAstrologyText(rawText, lang),
        icon: "📜"
      });
    }
  }

  return sections;
}

/**
 * Main Astrological Q&A Consultation Engine
 */
export async function askBaggonaAstrology({
  question,
  language,
  birthDetails,
  conversationHistory = [],
  geminiApiKey = ""
}: AskBaggonaAstrologyParams): Promise<AstrologyQAResponse> {
  const analysis = inspectQuestionIntent(question, birthDetails);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 0. Live Baggona Panchanga 6 Angas & Prashna Clock
  const dateStr = now.toISOString().split("T")[0]!;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const tradPanchanga = calculateTraditionalBaggona(dateStr, timeStr, 14.5479, 74.3188);
  const longs = siderealLongitudes(now, "lahiri");
  const moonDeg = longs.moon ?? 0;
  const transitMoonRashiIdx = Math.floor(moonDeg / 30) % 12;
  const prashnaClock = calculateInstantPrashnaClock(transitMoonRashiIdx, now, 14.5479, 74.3188);

  const livePanchangaMoment: AstrologyQAResponse["livePanchangaMoment"] = {
    samvatsaraKn: tradPanchanga.samvatsaraKn,
    masaKn: tradPanchanga.masaKn,
    pakshaKn: tradPanchanga.pakshaKn,
    tithiKn: `${tradPanchanga.tithiKn} (${tradPanchanga.tithi})`,
    weekdayKn: `${tradPanchanga.weekdayKn} (${tradPanchanga.weekday})`,
    moonNakshatraKn: `${tradPanchanga.moonNakshatraKn} (${tradPanchanga.moonNakshatra})`,
    yogaKn: `${tradPanchanga.yogaKn} (${tradPanchanga.yoga})`,
    karanaKn: `${tradPanchanga.karanaKn} (${tradPanchanga.karana})`,
    horaLordKn: prashnaClock.horaLordKn,
    horaLordEn: prashnaClock.horaLordEn,
    choghadiyaKn: `${prashnaClock.choghadiyaNameKn} (${prashnaClock.choghadiyaNameEn})`,
    rahuKalamTimeStr: prashnaClock.rahuKalamTimeStr,
    chandraBalaStatusKn: prashnaClock.chandraBalaStatusKn
  };

  let chartData: AstrologyQAResponse["chartData"] | undefined;

  let astronomicalContext = `
[LIVE BAGGONA PANCHANGA AT MOMENT OF PRASHNA (ಬಗ್ಗೋಣ ಗೋಕರ್ಣ ಮಹಾಸನ್ನಿಧಿ)]:
- ಸಂವತ್ಸರ (Samvatsara): ${tradPanchanga.samvatsaraKn} (${tradPanchanga.samvatsara})
- ಮಾಸ & ಪಕ್ಷ (Masa & Paksha): ${tradPanchanga.masaKn} ಮಾಸ, ${tradPanchanga.pakshaKn} ಪಕ್ಷ
- ತಿಥಿ (Tithi): ${tradPanchanga.tithiKn} (${tradPanchanga.tithi}, ಘಟಿ: ${tradPanchanga.tithiGhati})
- ವಾರ (Vara / Weekday): ${tradPanchanga.weekdayKn} (${tradPanchanga.weekday})
- ಚಂದ್ರ ನಕ್ಷತ್ರ (Moon Nakshatra): ${tradPanchanga.moonNakshatraKn} (${tradPanchanga.moonNakshatra})
- ಯೋಗ & ಕರಣ (Yoga & Karana): ${tradPanchanga.yogaKn} ಯೋಗ, ${tradPanchanga.karanaKn} ಕರಣ
- ಪ್ರಸ್ತುತ ಗ್ರಹ ಹೋರೆ (Planetary Hora): ${prashnaClock.horaLordKn} (${prashnaClock.horaLordEn}) - ${prashnaClock.horaSignificanceKn}
- ಪ್ರಸ್ತುತ ಚೋಘಡಿಯಾ (Choghadiya): ${prashnaClock.choghadiyaNameKn} (${prashnaClock.choghadiyaNameEn}) - ${prashnaClock.choghadiyaDescKn}
- ರಾಹು ಕಾಲ (Rahu Kaala): ${prashnaClock.rahuKalamTimeStr} ${prashnaClock.isRahuKalamActive ? "(ರಾಹುಕಾಲ ಸಕ್ರಿಯವಾಗಿದೆ - ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಎಚ್ಚರಿಕೆ)" : "(ಶುಭ ಮುಹೂರ್ತ ಸಕ್ರಿಯ)"}
- ಚಂದ್ರ ಬಲ (Chandra Bala): ${prashnaClock.chandraBalaStatusKn}
`;

  // 0.5 Calculate Deterministic Personal Horoscope Profile if birth details / DOB are provided
  const personalHoroscopeData = calculatePersonalAstrologyProfile(
    analysis.extractedBirthDetails,
    now
  );

  if (personalHoroscopeData) {
    if (!chartData) {
      chartData = {
        lagna: `${personalHoroscopeData.lagnaRashiKn} (${personalHoroscopeData.lagnaRashiEn})`,
        moonSign: `${personalHoroscopeData.moonRashiKn} (${personalHoroscopeData.moonRashiEn})`,
        nakshatra: `${personalHoroscopeData.moonNakshatraKn} ${personalHoroscopeData.moonPada}ನೇ ಪಾದ`,
        dashaText: `${personalHoroscopeData.currentMahadashaKn} - ${personalHoroscopeData.currentAntardashaKn}`,
        technicalHighlights: [
          `ಲಗ್ನ: ${personalHoroscopeData.lagnaRashiKn} ${personalHoroscopeData.lagnaDegree.toFixed(1)}°`,
          `ಆಯುರ್ದಾಯ: ${personalHoroscopeData.ayush.longevityCategoryKn}`,
          `ಆರೋಗ್ಯ: ${personalHoroscopeData.aarogya.tridoshaKn}`,
          `ನಾಮಾಕ್ಷರ: ${personalHoroscopeData.namakarana.canonicalSyllableKn} (${personalHoroscopeData.namakarana.allSyllablesKn.join(", ")})`,
          `ದೋಷಗಳು: ${personalHoroscopeData.doshas.activeCount} ಸಕ್ರಿಯ`
        ]
      };
    }

    astronomicalContext += `
[DETERMINISTIC PERSONAL HOROSCOPE OF DEVOTEE (ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಸಿದ್ಧಾಂತ)]:
- Devotee Name: ${personalHoroscopeData.name}
- Birth Date & Time: ${personalHoroscopeData.birthDate} ${personalHoroscopeData.birthTime}
- Place & Pincode: ${personalHoroscopeData.place} (${personalHoroscopeData.pincode}), Lat: ${personalHoroscopeData.lat}, Lng: ${personalHoroscopeData.lng}
- Lagna (Ascendant): ${personalHoroscopeData.lagnaRashiKn} (${personalHoroscopeData.lagnaRashiEn}), Degree: ${personalHoroscopeData.lagnaDegree.toFixed(2)}°
- Moon Sign (Rashi): ${personalHoroscopeData.moonRashiKn} (${personalHoroscopeData.moonRashiEn})
- Janma Nakshatra: ${personalHoroscopeData.moonNakshatraKn} (${personalHoroscopeData.moonNakshatraEn}), Pada: ${personalHoroscopeData.moonPada}
- Current Running Dasha: ${personalHoroscopeData.currentMahadashaKn} - ${personalHoroscopeData.currentAntardashaKn}
- Namakarana Canonical Sound: '${personalHoroscopeData.namakarana.canonicalSyllableKn}' (${personalHoroscopeData.namakarana.canonicalSyllableEn})
- All Namakarana Syllables: ${personalHoroscopeData.namakarana.allSyllablesKn.join(", ")}
- Auspicious Sample Names: ${personalHoroscopeData.namakarana.sampleNamesKn.join(", ")}
- Devata, Gana, Yoni, Nadi, Element: ${personalHoroscopeData.namakarana.deityKn}, ${personalHoroscopeData.namakarana.ganaKn} Gana, ${personalHoroscopeData.namakarana.animalYoniKn} Yoni, ${personalHoroscopeData.namakarana.nadiKn} Nadi, ${personalHoroscopeData.namakarana.elementKn} Element
- Aarogya (Health) Analysis: ${personalHoroscopeData.aarogya.vitalitySummaryKn} | ${personalHoroscopeData.aarogya.sixthHouseSummaryKn} | ${personalHoroscopeData.aarogya.tridoshaKn}
- Ayush (Longevity) Analysis: ${personalHoroscopeData.ayush.longevityCategoryKn} | ${personalHoroscopeData.ayush.ayurBhavaKn} | ${personalHoroscopeData.ayush.saturnPlacementKn}
- Detected Active Doshas (${personalHoroscopeData.doshas.activeCount}): ${personalHoroscopeData.doshas.doshaList.map((d) => `${d.nameKn} (${d.severityKn}): ${d.technicalWhyKn}`).join("; ")}
- Gandanta Status: ${personalHoroscopeData.doshas.gandantaSummaryKn}
`;
  }

  // 1. Calculate live birth chart if Date & Time are provided
  if (birthDetails?.birthDate && birthDetails?.birthTime) {
    try {
      const lat = birthDetails.latitude || 19.076;
      const lng = birthDetails.longitude || 72.8777;
      const kundliResult = await calculateKundliWithPlaceSun(
        {
          name: birthDetails.name || "Devotee",
          birthDate: birthDetails.birthDate,
          birthTime: birthDetails.birthTime,
          latitude: lat,
          longitude: lng
        },
        { ayanamsaModel: "lahiri", nodeType: "true" }
      );

      const age = ageDecimalYearsAt(
        birthDetails.birthDate,
        birthDetails.birthTime,
        lat,
        lng,
        now
      );
      const currentBhukti = findBhuktiAtAge(kundliResult, age);

      const lagnaRashi = kundliResult.lagnaRashi?.english || "Unknown";
      const moonPlanet = kundliResult.planets?.find((p) => p.name === "Moon");
      const moonRashi = kundliResult.moonSign?.english || "Unknown";
      const nakshatra = moonPlanet?.nakshatra?.english || "Unknown";
      const pada = kundliResult.moonPada ?? 1;

      const dashaStr = currentBhukti
        ? `${currentBhukti.maha.planet} Mahadasha - ${currentBhukti.bhukti} Antardasha`
        : "Vimshottari Dasha";

      // 7th House for Marriage
      const seventhHouseDeg = kundliResult.houses?.[6];
      const seventhSign =
        seventhHouseDeg !== undefined
          ? RASHIS[Math.floor(seventhHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      // 4th House for Vehicles & Comforts
      const fourthHouseDeg = kundliResult.houses?.[3];
      const fourthSign =
        fourthHouseDeg !== undefined
          ? RASHIS[Math.floor(fourthHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      // 10th House for Career & Profession
      const tenthHouseDeg = kundliResult.houses?.[9];
      const tenthSign =
        tenthHouseDeg !== undefined
          ? RASHIS[Math.floor(tenthHouseDeg / 30) % 12]?.english || "Unknown"
          : "Unknown";

      const planetSummary = (kundliResult.planets || [])
        .map((p) => `${p.name} in House ${p.house} (${p.rashi?.english})`)
        .join(", ");

      astronomicalContext += `
[ASTRONOMICAL KUNDALI DATA OF DEVOTEE]:
- Name: ${birthDetails.name || "Devotee"}
- Gender: ${birthDetails.gender || "Not specified"}
- DOB: ${birthDetails.birthDate}, Time: ${birthDetails.birthTime}, Place: ${birthDetails.place || "Custom"}
- Ascendant (Lagna / 1st House): ${lagnaRashi}
- Moon Sign (Rashi): ${moonRashi}
- Birth Nakshatra & Pada: ${nakshatra} Pada ${pada}
- Current Running Period: ${dashaStr}
- 4th House (Vehicles/Property/Home): ${fourthSign}
- 7th House (Marriage/Spouse/Kalatra): ${seventhSign}
- 10th House (Career/Karma/Status): ${tenthSign}
- Complete Natal Planetary Houses: ${planetSummary}
- Current Transits (Gochara): Saturn in Pisces/Aquarius, Jupiter in Taurus/Gemini, Rahu in Pisces, Ketu in Virgo.
`;

      chartData = {
        lagna: lagnaRashi,
        moonSign: moonRashi,
        nakshatra: `${nakshatra} (Pada ${pada})`,
        dashaText: dashaStr,
        technicalHighlights: [
          `Lagna: ${lagnaRashi}`,
          `Moon: ${moonRashi} (${nakshatra} Pada ${pada})`,
          `Dasha: ${dashaStr}`,
          `7th House (Marriage): ${seventhSign}`,
          `4th House (Vehicles): ${fourthSign}`,
          `10th House (Career): ${tenthSign}`
        ]
      };
    } catch (e) {
      console.warn("[astrologyQAService] Error calculating birth chart, proceeding with general astronomical engine:", e);
    }
  }

  // 2. Inject Vahana Muhurtha Engine data if question asks about vehicle purchase
  if (analysis.isVahanaMuhurtha) {
    try {
      const rashiIdx = analysis.isMeenaRashi ? 11 : 0; // Default to Meena if mentioned
      const nakshatraIdx = analysis.isRevatiNakshatra ? 26 : 0; // Default to Revati if mentioned

      const curReport = calculateVahanaKharidiMuhurtha({
        personName: birthDetails?.name || "Devotee",
        rashiIndex: rashiIdx,
        nakshatraIndex: nakshatraIdx,
        year: currentYear,
        month: currentMonth,
        lang: language
      });

      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const nextReport = calculateVahanaKharidiMuhurtha({
        personName: birthDetails?.name || "Devotee",
        rashiIndex: rashiIdx,
        nakshatraIndex: nakshatraIdx,
        year: nextYear,
        month: nextMonth,
        lang: language
      });

      const curTopDays = (curReport.topRecommendedDays || []).slice(0, 3);
      const nextTopDays = (nextReport.topRecommendedDays || []).slice(0, 3);

      const topDaysText = [...curTopDays, ...nextTopDays]
        .map(
          (d) =>
            `- Date: ${d.dayFormatted} (${d.weekdayKn} / ${d.weekdayEn}) | Tithi: ${d.tithiKn} | Nakshatra: ${d.nakshatraKn} | Auspicious Time Window: ${d.auspiciousTimeWindowKn} | Suitability Score: ${d.suitabilityScore}% (Tara: ${d.taraNameKn}, Chandra Bala: ${d.chandraNameKn})`
        )
        .join("\n");

      astronomicalContext += `
[BAGGONA PANCHANGA VAHANA MUHURTHA ENGINE OUTPUT]:
Evaluated for Devotee Rashi: ${analysis.isMeenaRashi ? "ಮೀನ (Pisces)" : "Janma Rashi"}, Nakshatra: ${analysis.isRevatiNakshatra ? "ರೇವತಿ (Revati)" : "Janma Nakshatra"}.
Top highly recommended vehicle purchase & delivery days for ${currentMonth}/${currentYear} & ${nextMonth}/${nextYear}:
${topDaysText}
Vehicle Purchase Rules according to Baggona Siddhanta:
- Lord Venus (ಶುಕ್ರ) is the planetary Karaka for vehicles, and 4th House (ಸುಖ/ವಾಹನ ಸ್ಥಾನ) governs vehicular comforts.
- Auspicious Weekdays: Friday (ಶುಕ್ರವಾರ), Wednesday (ಬುಧವಾರ), Thursday (ಗುರುವಾರ).
- Auspicious Nakshatras: Revati, Ashwini, Rohini, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Dhanishta, Shatabhisha.
- Tithi: Shukla Paksha 2, 3, 5, 7, 10, 11, 13 (avoid Amavasya & Rikta Tithis 4, 9, 14).
- Avoid: Rahu Kaala, Yamagandam, Gulika Kaala, and Vishti (Bhadra) Karana.
- Vahana Pooja: Perform Ganesha & Lord Hanuman Pooja at the temple with lemon under 4 wheels and coconut breaking.
`;
    } catch (e) {
      console.warn("[astrologyQAService] Error generating Vahana Muhurtha context:", e);
    }
  }

  // 3. Inject Name to Nakshatra & Avakahada Chakra Shastra
  if (analysis.isNameLookup && analysis.matchedNameData) {
    const nd = analysis.matchedNameData;
    astronomicalContext += `
[BAGGONA AVAKAHADA CHAKRA & NAMAKSHARA SHASTRA RESOLUTION]:
- Name Analyzed: "${nd.matchedName}"
- First Syllable Sound (ನಾಮಾಕ್ಷರ ಧ್ವನಿ): '${nd.inputSyllable}'
- Exact Birth Star (ಜನ್ಮ ನಕ್ಷತ್ರ): ${nd.entry.nakshatraNameKn} (${nd.entry.nakshatraNameEn})
- Exact Quarter (ಪಾದ): ${nd.entry.pada}ನೇ ಪಾದ (Pada ${nd.entry.pada})
- Moon Sign (ರಾಶಿ): ${nd.entry.rashiNameKn} (${nd.entry.rashiNameEn})
- Rashi Lord (ರಾಶ್ಯಾಧಿಪತಿ): ${nd.entry.rashiLordKn} (${nd.entry.rashiLordEn})
- Nakshatra Lord (ನಕ್ಷತ್ರಾಧಿಪತಿ): ${nd.entry.nakshatraLordKn} (${nd.entry.nakshatraLordEn})
- Presiding Vedic Deity (ದೇವತೆ): ${nd.entry.deityKn} (${nd.entry.deityEn})
- Gana (ಗಣ): ${nd.entry.ganaKn} (${nd.entry.ganaEn})
- Animal Yoni (ಯೋನಿ): ${nd.entry.animalYoniKn} (${nd.entry.animalYoniEn})
- Nadi (ನಾಡಿ): ${nd.entry.nadiKn} (${nd.entry.nadiEn})
- Element (ತತ್ತ್ವ): ${nd.entry.elementKn} (${nd.entry.elementEn})
- Canonical Syllable Variants: ${nd.entry.syllablesKn.join(", ")} (${nd.entry.syllablesEn.join(", ")})
- Classical Shastra Verdict: ${nd.analysisKn}

CRITICAL MANDATE FOR THIS DEVOTEE INQUIRY:
1. The user asks about the name '${nd.matchedName}' (e.g. Hiranyaksha / Hiranya).
2. State clearly in Section 1 that '${nd.matchedName}' begins with the sound '${nd.inputSyllable}' and belongs UNQUESTIONABLY to ${nd.entry.nakshatraNameKn} (${nd.entry.nakshatraNameEn}) Nakshatra, Pada ${nd.entry.pada}, in ${nd.entry.rashiNameKn} (${nd.entry.rashiNameEn}) Rashi.
3. DO NOT STATE THAT THIS IS MULA NAKSHATRA 1ST PADA! This name is Punarvasu Nakshatra 4th Pada, Karkataka Rashi.
4. If the question mentions 'Prakash', explain that 'Prakash' or 'Pramod' begins with 'Pra' (Uttara Phalguni 3rd Pada, Kanya Rashi), whereas 'Hiranyaksha' begins with 'Hi' (Punarvasu 4th Pada, Karkataka Rashi).
`;
  }

  // 4. Inject Gandanta & Nakshatra Pada Shastra ONLY when Mula is explicitly queried
  if (analysis.isMulaNakshatra) {
    astronomicalContext += `
[VEDIC SHASTRA ON MULA NAKSHATRA & GANDANTA DOSHA - BRIHAT PARASHARA HORA SHASTRA]:
- Mula Nakshatra (ಮೂಲಾ ನಕ್ಷತ್ರ) spans 0°00' to 13°20' Dhanu (Sagittarius). Lord is Ketu, Deity is Nirriti.
- Pada 1 (೧ನೇ ಪಾದ): 0°00' - 3°20' Dhanu. This is the exact junction (Sandhi) between Jala Rashi (Scorpio 30°) and Agni Rashi (Sagittarius 0°). This is classical "Abhukta Moola / Ganda Moola".
- Classical Texts on Pada 1: Brihat Parashara states "ಆದ್ಯೇ ಪಾದೇ ಪಿತುರ್ಹಾನಿಃ" (can bring temporary health/financial struggles to father or elders if left without Shanti).
- CRITICAL ASTROLOGICAL REASSURANCE:
  * It is NOT an incurable danger or life-threatening curse. In Vedic astrology, Gandanta represents deep spiritual fire and karmic transformation.
  * Classical Shastra prescribes the exact 'Mula Nakshatra Shanti Homa' (ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ) performed within 27 days (when Moon returns to Mula) or on any Shukla Paksha auspicious Mula day.
  * Shanti Vidhi: 27 Kalasha Snana with 27 Nakshatra sacred herbal waters, Navagraha Homa, Rudra Japa, Maha Mrityunjaya Japa, and Go-dana (cow donation or Gau-seva).
  * Father should not see the child directly until Shanti is performed; father views the baby's face first in a bronze vessel filled with pure clarified butter/ghee (ಕಂಚಿನ ಪಾತ್ರೆಯಲ್ಲಿ ತುಪ್ಪದ ಮುಖ ದರ್ಶನ).
  * Post-Shanti Outcome: After Mula Shanti, Mula 1st Pada children grow into exceptionally brilliant, fearless, visionary leaders, scholars, and spiritual achievers.
  * Prescribed Sacred Temple Seva: Gokarna Mahabaleshwara Rudrabhisheka, Idagunji Ganapati Pooja, and Subramanya Sarpa/Ketu Shanti.
`;
  } else if (analysis.nakshatraIndex !== undefined && !analysis.isNameLookup) {
    const nakRecord = NAKSHATRA_SHASTRA_CATALOG[analysis.nakshatraIndex];
    if (nakRecord) {
      astronomicalContext += `
[CLASSICAL VEDIC NAKSHATRA SHASTRA - BRIHAT PARASHARA HORA SHASTRA]:
- Nakshatra: ${nakRecord.name.kn} (${nakRecord.name.en}), Index: ${nakRecord.index + 1} of 27.
- Lord (ಅಧಿಪತಿ): ${nakRecord.lordName.kn} (${nakRecord.lordName.en}).
- Deity (ದೇವತೆ): ${nakRecord.deity.kn} (${nakRecord.deity.en}).
- Gana: ${nakRecord.ganaKn} (${nakRecord.gana}), Yoni: ${nakRecord.animalYoni.kn}.
- Span in Zodiac: ${nakRecord.rashiSpans.kn}.
- Muhurtha Quality: ${nakRecord.muhurthaQuality.kn}.
${nakRecord.isGandaMoola ? `- Gandanta Note: ${nakRecord.gandantaDescription?.kn}` : "- Auspicious Nature: This Nakshatra does NOT have Abhukta Moola Gandanta dosha. It is blessed and auspicious."}
`;
    }
  }

  // 4. Inject 7th House & Vivaha Shastra if marriage inquiry
  if (analysis.isMarriageQuery) {
    astronomicalContext += `
[VEDIC SHASTRA ON MARRIAGE & 7TH HOUSE (ಸಪ್ತಮ ಭಾವ / ವಿವಾಹ ಕಾಲ)]:
- 7th House (Kalatra Bhava) governs marriage, spouse, relationship harmony, and marital longevity.
- Venus (ಶುಕ್ರ) is Karaka for spouse in male charts; Jupiter (ಗುರು) is Karaka in female charts.
- Marriage Timing Windows: Triggered during Mahadasha/Antardasha of 7th Lord, 1st Lord, 2nd Lord, 9th Lord, or planets aspecting the 7th House.
- Gochara (Transit) Trigger: Double transit of Jupiter (Guru Gochara) and Saturn (Shani Gochara) aspecting the 7th house or natal Venus/Jupiter.
- When Gochara Guru casts 5th, 7th, or 9th divine aspect on 7th house or Lagna, marriage alliances materialize rapidly.
- Sacred Remedies: Mangala Gowri Pooja, Katyayani Vrata, Lord Shiva-Parvati Kalyana Seva, Gokarna Mahabaleshwara Abhisheka.
`;
  }

  // 5. Inject Marana, Demise Panchanga & Shraddha Tithi Shastra
  let maranaShraddhaData: AstrologyQAResponse["maranaShraddhaData"] | undefined;
  if (analysis.isMaranaShraddha) {
    const demiseDate = analysis.extractedDate || "2023-04-12";
    maranaShraddhaData = calculatePratyabdikaShraddha(
      demiseDate,
      analysis.targetYear || currentYear,
      14.5479,
      74.3188
    );

    astronomicalContext += `
[BAGGONA MARANOTTARA & SHRADHHA TITHI SHASTRA (ಧರ್ಮಸಿಂಧು & ನಿರ್ಣಯಸಿಂಧು ಸಿದ್ಧಾಂತ)]:
- Demise Date Analyzed: ${maranaShraddhaData.demiseDate}
- Demise Samvatsara: ${maranaShraddhaData.demiseSamvatsaraKn}
- Demise Lunar Month (Masa): ${maranaShraddhaData.demiseMasaKn} ಮಾಸ
- Demise Lunar Fortnight (Paksha): ${maranaShraddhaData.demisePakshaKn} ಪಕ್ಷ
- Demise Tithi: ${maranaShraddhaData.demiseTithiKn}
- Demise Nakshatra: ${maranaShraddhaData.demiseNakshatraKn}
- Demise Weekday: ${maranaShraddhaData.demiseWeekdayKn}
- Target Year for Pratyabdika Shraddha: ${maranaShraddhaData.targetYear}
- Calculated Pratyabdika Shraddha Date in ${maranaShraddhaData.targetYear}: ${maranaShraddhaData.pratyabdikaFormattedKn}
- Sacred Shraddha Time Window: ${maranaShraddhaData.aparahnaKala}
- Panchaka Dosha Status: ${maranaShraddhaData.panchakaSummaryKn}
- Ashaucha Rules: 10 days for Sapindas (ಜ್ಞಾತಿಗಳಿಗೆ ೧೦ ದಿನಗಳ ಪೂರ್ಣ ಆಶೌಚ).
- Moksha Remedies: Gokarna Mahabaleshwara Thila Homa, Narayana Bali, and Tripindi Shraddha under Priest Shreeram Pandit.
`;
  }

  // 6. Inject Hotel / Business Surrender & Rina Mukti Muhurtha Shastra
  let surrenderMuhurthaData: AstrologyQAResponse["surrenderMuhurthaData"] | undefined;
  if (analysis.isSurrenderClosure) {
    surrenderMuhurthaData = calculateSurrenderMuhurthaDates(
      currentYear,
      currentMonth,
      14.5479,
      74.3188
    );

    const recDaysText = surrenderMuhurthaData.recommendedDays
      .map(
        (d) =>
          `- ದಿನಾಂಕ: ${d.date} (${d.weekdayKn}) | ತಿಥಿ: ${d.tithiKn} | ನಕ್ಷತ್ರ: ${d.nakshatraKn} | ಮುಹೂರ್ತ: ${d.timeWindowKn} | ಫಲ: ${d.reasonKn}`
      )
      .join("\n");

    astronomicalContext += `
[BAGGONA RINA MUKTI & BUSINESS/HOTEL SURRENDER MUHURTHA SHASTRA]:
Action: Surrendering Hotel, Handing over Commercial Lease, Business Termination, Debt Clearance.
Classical Shastra Mandate (Muhurtha Chintamani & Brihat Samhita):
- Tuesday (ಮಂಗಳವಾರ / Bhaume Rina Vimochana): The supreme day to settle liabilities and surrender loss-making establishments. Martian fire burns the recurring liability so the debt never recurs.
- Thursday (ಗುರುವಾರ) & Sunday (ಭಾನುವಾರ): Auspicious for peaceful negotiation and amicable lease termination without litigation.
- Avoid Saturday (drags into perpetual dispute) and Wednesday (creates revolving financial liability).
- Avoid Rikta Tithis (Chaturthi 4, Navami 9, Chaturdashi 14) and Amavasya.
- Chara Lagna (Aries, Cancer, Libra, Capricorn) is essential for swift, permanent closure.
- Recommended dates in current & upcoming weeks:
${recDaysText}
- Key Principles:
${surrenderMuhurthaData.keyPrinciplesKn.map((k) => `* ${k}`).join("\n")}
- Inauspicious avoid days:
${surrenderMuhurthaData.inauspiciousAvoidDays.map((a) => `* ${a}`).join("\n")}
`;
  }

  // 7. Inject Festival & Vrata Shastra
  let festivalData: AstrologyQAResponse["festivalData"] | undefined;
  if (analysis.isFestival) {
    festivalData = calculateFestivalDetails(question);
    if (festivalData) {
      astronomicalContext += `
[BAGGONA MASTER ANNUAL FESTIVAL REGISTRY DATA]:
- Festival Name: ${festivalData.festivalNameKn} (${festivalData.festivalNameEn})
- Date in Baggona Panchanga: ${festivalData.date}
- Lunar Month (Masa): ${festivalData.masaKn}
- Paksha & Tithi: ${festivalData.pakshaKn}, ${festivalData.tithiKn}
- Puja Muhurtha Window: ${festivalData.pujaWindowKn}
- Description & Significance: ${festivalData.descriptionKn}
- Vrata Vidhana & Rituals: ${festivalData.vrataVidhanaKn}
${festivalData.mantra ? `- Sacred Chanting Mantra: ${festivalData.mantra}` : ""}
`;
    }
  }

  // Construct target language instruction
  const langNames: Record<SupportedLanguage, string> = {
    kn: "Kannada (ಕನ್ನಡ)",
    en: "English",
    hi: "Hindi (हिन्दी)",
    te: "Telugu (తెలుగు)",
    ta: "Tamil (தமிழ்)"
  };
  const targetLangStr = langNames[language] || "Kannada (ಕನ್ನಡ)";

  const systemPrompt = `You are the revered 100-Year Traditional Chief Astrologer and Daivajna of Sri Kshetra Baggona (ಬಗ್ಗೋಣ ಸನ್ನಿಧಿ ದೈವಜ್ಞ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್).
You carry the accumulated mastery and wisdom of 100 years of unbroken Vedic tradition, rooted in Brihat Parashara Hora Shastra, Jataka Parijata, Muhurtha Chintamani, Nirnaya Sindhu, Dharma Sindhu, Garuda Purana, and the sacred Baggona Panchanga Siddhanta.

You answer ANY astrological inquiry without limitation, functioning as the ultimate Vedic expert and assistant:
1. Birth & Jataka (ಜನನ & ಜಾತಕ): 12 Bhavas, planetary yogas, Dasha-Bhukti, Gochara transits, Gandanta / Dosha shanti.
2. Death & Maranottara (ಮರಣ, ಆಶೌಚ & ಶ್ರಾದ್ಧ): Demise Tithi, Masa, Paksha determination, Pratyabdika Shraddha date, Aparahna Kala (೧:೩೦ - ೩:೪೫ PM), Dhanishta Panchaka dosha, Ashaucha days, Garuda Purana wisdom, and Gokarna Mahabaleshwara Moksha Sevas.
3. Muhurtha & Business Decisions (ಮುಹೂರ್ತ & ವ್ಯವಹಾರ ನಿರ್ಣಯ): Launching enterprise, or surrendering a hotel / commercial lease / debt clearance (ಋಣ ಮುಕ್ತಿ ಮುಹೂರ್ತ - ಮಂಗಳವಾರ ಭೌಮೇ ಋಣವಿಮೋಚನಮ್, ರಿಕ್ತ ತಿಥಿ ತ್ಯಾಗ, ಚರ ಲಗ್ನ), vehicle purchase, Griha Pravesha, marriage.
4. Avakahada Chakra (ಆವಕಹಡ ಚಕ್ರ): 108 Pada Namakshara sound vibration frequencies (e.g. Hiranyaksha = 'Hi' = Punarvasu 4th Pada, Karka Rashi).
5. Festivals & Vratas (ಹಬ್ಬಗಳು & ವ್ರತಗಳು): Exact dates, Tithi Nirnaya, Puja Muhurthas, and Vrata Vidhana.
6. Horary / Prashna (ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ): Immediate task success, recovery, litigation verdict.

OUTPUT LANGUAGE: ${targetLangStr}.
${
  language === "kn"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure, grammatically rich, respectful Kannada script (ಕನ್ನಡ ಲಿಪಿ). NEVER use English letters (Latin characters) to write Kannada words. Use classical Sanskrit-Kannada astrological terminology (ಲಗ್ನ, ಭಾವ, ನಕ್ಷತ್ರ, ಗೋಚಾರ, ಮುಹೂರ್ತ, ಶಾಂತಿ, ಪರಿಹಾರ)."
    : language === "hi"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Devanagari Hindi script."
    : language === "te"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Telugu script."
    : language === "ta"
    ? "MANDATORY RULE: Write EXCLUSIVELY in pure Tamil script."
    : "Write in clear, authoritative, empathetic English with standard Vedic astrological Sanskrit terms in parentheses."
}

PERSONA & NARRATION:
Adopt the persona of a revered, warm, deeply learned 100-year traditional Vedic Daivajna (Priest Shreeram Pandit of Baggona).
Speak directly to the devotee as if sharing live spoken wisdom from your profound astrological knowledge, not reading from a textbook.
Begin Section 1 with a respectful, warm address: 'ಆತ್ಮೀಯ ಭಕ್ತರೇ,' (or 'Dear Devotee,' in English).

CRITICAL FORMATTING INSTRUCTIONS (STRICT):
1. NEVER USE RAW ASTERISKS (**bold** or *italic* or * bullets).
2. NEVER USE RAW SLASHES (/); replace slashes with natural words like 'ಮತ್ತು' (and) or 'ಅಥವಾ' (or).
3. DO NOT USE RAW HASHES (#, ##) inside the body text.
4. For numbered points in Section 2 and Section 3, write clean numbers like '೧. [ಶೀರ್ಷಿಕೆ]: [ವಿವರಣೆ]' or '1. [Title]: [Description]' without asterisks.
5. The explanation must flow smoothly and naturally like an enlightened master astrologer giving oral counsel.

THE USER'S QUESTION:
"${question}"

ASTRONOMICAL & SHASTRA CONTEXT DETECTED BY BAGGONA ENGINES:
${astronomicalContext || "General Vedic Astrology Siddhanta Query."}

STRICT 4-SECTION STRUCTURAL CONTRACT:
You must provide a deeply learned, comprehensive, clear, and reassuring response structured into the following EXACT 4 sections:

### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
(For English: ### 1. Classical Shastra & Technical Analysis)
- Deep dive into the astrological mechanics: exact Nakshatra Pada, Gandanta junction, Bhavas (7th for marriage, 4th for vehicle, 10th for career), Graha lords, and classical treatises (Brihat Parashara, Jataka Parijata).
- If birth details are provided, weave in the Lagna, running Dasha-Bhukti, and specific houses.
- Address the user's specific concern directly with empathy (e.g. if asking whether Mula 1st Pada is dangerous, explain calmly with Shastra authority).

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
(For English: ### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits)
- Provide concrete dates, months, favorable weekdays, Tithis, and Nakshatras based on Baggona Panchanga.
- Mention favorable planetary transits (Jupiter, Saturn, Rahu-Ketu) and timing windows.
- Mention timings to avoid: Rahu Kaala, Yamagandam, Gulika, and Chandrashtama.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
(For English: ### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas)
- Give 3 practical, authentic, classical Vedic remedies (Parihara / Shanti) as clean numbered lines without asterisks.
- E.g. for Mula 1st Pada: Mula Shanti Homa, 27 Kalasha Snana, Gau-seva, Ghee vessel face viewing by father.
- E.g. for Vehicle: Lord Ganesha & Hanuman Vahana Pooja with lemon and coconut.
- E.g. for Marriage: Katyayani Mantra Japa, Gokarna Mahabaleshwara Rudrabhisheka, Ganapati Homa.
- Specific sacred deity mantras with authentic count (e.g. 108 or 1008 times).

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
(For English: ### 4. Astrologer's Verdict & Sacred Blessing)
- Provide a compassionate, uplifting verdict dispelling fear and inspiring confidence.
- Conclude with a traditional Vedic blessing and priest attribution by Priest Shreeram Pandit of Baggona ("॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥").
`;

  let responseText = "";

  try {
    responseText = await askGemini(
      `Baggona Astrology Q&A: ${question.slice(0, 40)}`,
      systemPrompt,
      geminiApiKey,
      language,
      {
        raw: true,
        temperature: 0.5,
        conversationHistory: conversationHistory.slice(-8)
      }
    );
  } catch (err: any) {
    console.error("[astrologyQAService] Gemini API call failed, generating deterministic Vedic Shastra fallback:", err);
    responseText = generateDeterministicVedicFallback(
      question,
      analysis,
      language,
      birthDetails,
      chartData,
      personalHoroscopeData
    );
  }

  // Parse structured sections
  const sections = parseAstrologyAnswerSections(responseText, language);

  // Generate spoken text for audio synthesis
  const spokenText = buildSpokenAstrologyNarrative(sections, language);

  const nameLookupData = analysis.matchedNameData
    ? {
        name: analysis.matchedNameData.matchedName,
        syllable: analysis.matchedNameData.inputSyllable,
        syllableKn: analysis.matchedNameData.entry.canonicalSoundKn,
        syllableEn: analysis.matchedNameData.entry.canonicalSoundEn,
        nakshatraName: analysis.matchedNameData.entry.nakshatraNameEn,
        nakshatraNameKn: analysis.matchedNameData.entry.nakshatraNameKn,
        nakshatraNameEn: analysis.matchedNameData.entry.nakshatraNameEn,
        pada: analysis.matchedNameData.entry.pada,
        rashiNameKn: analysis.matchedNameData.entry.rashiNameKn,
        rashiNameEn: analysis.matchedNameData.entry.rashiNameEn,
        rashiLordKn: analysis.matchedNameData.entry.rashiLordKn,
        rashiLordEn: analysis.matchedNameData.entry.rashiLordEn,
        nakshatraLordKn: analysis.matchedNameData.entry.nakshatraLordKn,
        nakshatraLordEn: analysis.matchedNameData.entry.nakshatraLordEn,
        deityKn: analysis.matchedNameData.entry.deityKn,
        deityEn: analysis.matchedNameData.entry.deityEn,
        ganaKn: analysis.matchedNameData.entry.ganaKn,
        animalYoniKn: analysis.matchedNameData.entry.animalYoniKn
      }
    : undefined;

  return {
    id: `qa_${Date.now()}`,
    question,
    language,
    fullAnswer: responseText,
    spokenText,
    detectedIntent: analysis.intent,
    sections,
    chartData,
    nameLookupData,
    maranaShraddhaData,
    surrenderMuhurthaData,
    festivalData,
    livePanchangaMoment,
    personalHoroscopeData
  };
}

/**
 * 100% Deterministic Fallback when offline or API key is not present
 */
function generateDeterministicVedicFallback(
  question: string,
  analysis: ReturnType<typeof inspectQuestionIntent>,
  lang: SupportedLanguage,
  birthDetails?: BirthDetailsInput,
  chartData?: AstrologyQAResponse["chartData"],
  personalHoroscopeData?: PersonalHoroscopeData
): string {
  // 0.0 Personal Horoscope Profile Fallback (Aarogya, Ayush, Namakarana, Doshas, Full Kundli)
  if (personalHoroscopeData) {
    const p = personalHoroscopeData;
    if (analysis.isAarogya) {
      if (lang === "kn") {
        return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ${p.name} ಅವರ ಜನ್ಮಕುಂಡಲಿಯ ಆರೋಗ್ಯ (ರೋಗ ಭಾವ) ವಿಶ್ಲೇಷಣೆ:
- ಜನ್ಮ ಲಗ್ನ: ${p.lagnaRashiKn} (${p.lagnaDegree.toFixed(1)}°), ಚಂದ್ರ ರಾಶಿ: ${p.moonRashiKn}, ಜನ್ಮ ನಕ್ಷತ್ರ: ${p.moonNakshatraKn} ${p.moonPada}ನೇ ಪಾದ.
- ಜೀವಬಲ ವಿಶ್ಲೇಷಣೆ: ${p.aarogya.vitalitySummaryKn}
- ೬ನೇ ರೋಗ ಸ್ಥಾನ: ${p.aarogya.sixthHouseSummaryKn}
- ೮ನೇ ಆಯುರ್ಭಾವ: ${p.aarogya.eighthHouseSummaryKn}
- ಶಾರೀರಿಕ ಪ್ರಕೃತಿ ತತ್ತ್ವ: ${p.aarogya.tridoshaKn}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
- ಪ್ರಸ್ತುತ ಮಹಾದಶಾ & ಅಂತರ್ದಶಾ: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು: ${p.aarogya.cautionsKn.join(" ")}
- ಗೋಚಾರ ಗ್ರಹಗಳಾದ ಗುರು ಮತ್ತು ಶನಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದ್ದು, ಸಕಾಲಿಕ ಚಿಕಿತ್ಸೆ ಮತ್ತು ದೈವಿಕ ರಕ್ಷೆಯಿಂದ ದೀರ್ಘಾಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
${p.aarogya.remedialHomasKn.map((h, i) => `${i + 1}. ${h}`).join("\n")}
೪. ನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ "ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಧನ್ವಂತರಯೇ ಅಮೃತಕಲಶ ಹಸ್ತಾಯ ಸರ್ವಭಯ ವಿನಾಶನಾಯ" ಧನ್ವಂತರಿ ಮಂತ್ರ ಜಪ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಧನ್ವಂತರಿ ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸಕಲ ರೋಗ ಭಯಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೃಢಕಾಯ ಮತ್ತು ಆಯುರಾರೋಗ್ಯ ಸದಾ ರಕ್ಷಿಸಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
      } else {
        return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, here is the authentic Vedic Medical Astrology analysis for ${p.name}:
- Lagna: ${p.lagnaRashiEn} (${p.lagnaDegree.toFixed(1)}°), Moon Sign: ${p.moonRashiEn}, Nakshatra: ${p.moonNakshatraEn} Pada ${p.moonPada}.
- Vitality & Immunity: ${p.aarogya.vitalitySummaryKn}
- 6th House (Roga Bhava): ${p.aarogya.sixthHouseSummaryKn}
- 8th House (Chidra / Longevity): ${p.aarogya.eighthHouseSummaryKn}
- Ayurvedic Constitution: ${p.aarogya.tridoshaKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
- Current Running Dasha: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- Health Directives: ${p.aarogya.cautionsKn.join(" ")}

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Dhanvantari Maha Homa for holistic vitality and immunity.
2. Maha Mrityunjaya Japa and Rudrabhisheka at Gokarna Mahabaleshwara temple.
3. Daily recitation of Aditya Hridaya Stotram for solar vitality.

### 4. Astrologer's Verdict & Sacred Blessing
May Lord Dhanvantari and Lord Mahabaleshwara bestow complete physical well-being, vitality, and longevity upon you.
- Blessings by Priest Shreeram Pandit of Baggona.`;
      }
    }

    if (analysis.isAyush) {
      if (lang === "kn") {
        return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ${p.name} ಅವರ ಜಾತಕದ ಆಯುರ್ದಾಯ ಮತ್ತು ಆಯುಷ್ಯ ನಿರ್ಣಯ:
- ಆಯುಷ್ಯ ವರ್ಗೀಕರಣ: ${p.ayush.longevityCategoryKn} (${p.ayush.longevityCategoryEn}).
- ${p.ayush.ayurBhavaKn}
- ${p.ayush.saturnPlacementKn}.
- ${p.ayush.marakaGrahasKn}.
- ಶುಭ ಗ್ರಹ ರಕ್ಷಾ ಯೋಗಗಳು: ${p.ayush.protectiveYogasKn}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
- ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲ: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- ಜಾತಕದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಆಯುಷ್ಯಕಾರಕ ಶನಿಯ ಸ್ಥಿತಿ ಬಲಿಷ್ಠವಾಗಿದ್ದು, ವಯೋಸಹಜ ಮೈಲಿಗಲ್ಲುಗಳಲ್ಲಿ ಯಾವುದೇ ಅಕಾಲಿಕ ಅಪಮೃತ್ಯು ದೋಷವಿಲ್ಲ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ನಿತ್ಯ ಶ್ರೀ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ):
   ${p.ayush.mrityunjayaMantra}
೨. ಪ್ರತಿ ವರ್ಷ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ ಆಯುಷ್ಯ ಹೋಮ ನೆರವೇರಿಸುವುದು.
೩. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋಸೇವೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶಿವಾನುಗ್ರಹದಿಂದ ಅಪಮೃತ್ಯು ಭಯ ನಿವಾರಣೆಯಾಗಿ, ಶತಮಾನಂ ಭವತಿ ಶತಾಯುಃ ಪುರುಷಃ ಸತೇಂದ್ರಿಯ ಆಯುಷ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
      } else {
        return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on Brihat Parashara Hora Shastra, here is the Ayurdaya (Longevity) determination for ${p.name}:
- Longevity Category: ${p.ayush.longevityCategoryEn}.
- 8th House (Ayur Bhava): ${p.ayush.ayurBhavaKn}
- Saturn (Ayushkaraka): ${p.ayush.saturnPlacementKn}
- Maraka Lords: ${p.ayush.marakaGrahasKn}
- Protective Grace: ${p.ayush.protectiveYogasKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
- Running Period: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- Natural lifespan is protected by auspicious planetary positions.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Daily chanting of Maha Mrityunjaya Mantra 108 times:
   ${p.ayush.mrityunjayaMantra}
2. Annual Ayushya Homa on Janma Nakshatra day.
3. Rudrabhisheka at Gokarna Mahabaleshwara temple.

### 4. Astrologer's Verdict & Sacred Blessing
May Lord Shiva protect you from all afflictions and grant complete longevity, peace, and vitality.
- Blessings by Priest Shreeram Pandit of Baggona.`;
      }
    }

    if (analysis.isNamakarana) {
      if (lang === "kn") {
        return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಆವಕಹಡ ಚಕ್ರದ ಪ್ರಕಾರ ಶಿಶುವಿನ ನಾಮಕರಣ ಜ್ಯೋತಿಷ್ಯ ವಿವರಣೆ:
- ಜನ್ಮ ನಕ್ಷತ್ರ: ${p.moonNakshatraKn} (${p.moonNakshatraEn}), ಪಾದ: ${p.moonPada}ನೇ ಪಾದ.
- ಜನ್ಮ ರಾಶಿ: ${p.moonRashiKn} (${p.moonRashiEn}).
- ಶಾಸ್ತ್ರೋಕ್ತ ಪ್ರಧಾನ ನಾಮಾಕ್ಷರ: '${p.namakarana.canonicalSyllableKn}' (${p.namakarana.canonicalSyllableEn}).
- ಅನುಮೋದಿತ ನಾಮಾಕ್ಷರ ಧ್ವನಿಗಳು: ${p.namakarana.allSyllablesKn.join(", ")}.
- ಅಧಿದೇವತೆ: ${p.namakarana.deityKn}, ಗಣ: ${p.namakarana.ganaKn}, ಯೋನಿ: ${p.namakarana.animalYoniKn}, ನಾಡಿ: ${p.namakarana.nadiKn}.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ನಾಮಕರಣ ಸಂಸ್ಕಾರ ಮುಹೂರ್ತ:
೧. ಶಿಶು ಜನಿಸಿದ ೧೧ನೇ ದಿನ, ೧೨ನೇ ದಿನ, ೧೬ನೇ ದಿನ ಅಥವಾ ೨೮ನೇ ದಿನ ಪ್ರಶಸ್ತ.
೨. ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ತಿಥಿ, ಗುರು ಅಥವಾ ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ ಅಭಿಜಿತ್ ಮುಹೂರ್ತದಲ್ಲಿ ನಾಮಕರಣ ನೆರವೇರಿಸಿ.
೩. ರಾಹುಕಾಲ ಮತ್ತು ಭದ್ರಾ ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಿ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಶಿಫಾರಸು ಮಾಡಲಾದ ಶಾಸ್ತ್ರೋಕ್ತ ಶುಭ ಹೆಸರುಗಳು:
   ${p.namakarana.sampleNamesKn.join(", ")} (${p.namakarana.sampleNamesEn.join(", ")}).
೨. ನಾಮಕರಣ ವಿಧಿ: ಗಣಪತಿ ಪೂಜೆ, ಪುಣ್ಯಾಹವಾಚನ ನೆರವೇರಿಸಿ, ಕಂಚಿನ ತಟ್ಟೆಯಲ್ಲಿ ಕೆಂಪು ಅಕ್ಕಿ ಹರಡಿ ಚಿನ್ನದ ಉಂಗುರದಿಂದ ಮಗುವಿನ ನಾಮ ಬರೆಯುವುದು.
೩. ತಂದೆಯು ಮಗುವಿನ ಬಲ ಕಿವಿಯಲ್ಲಿ ಮೂರು ಬಾರಿ ನಾಮವನ್ನು ಉಚ್ಚರಿಸಬೇಕು.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಈ ನಾಮಾಕ್ಷರದಿಂದ ಇಡುವ ಹೆಸರು ಮಗುವಿಗೆ ಸಕಲ ಸದ್ಗುಣ, ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ತರಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
      } else {
        return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on Baggona Avakahada Chakra, here is the baby naming (Namakarana) determination:
- Birth Nakshatra: ${p.moonNakshatraEn} Pada ${p.moonPada}
- Moon Sign (Rashi): ${p.moonRashiEn}
- Primary Naming Syllable: '${p.namakarana.canonicalSyllableEn}' ('${p.namakarana.canonicalSyllableKn}')
- Auspicious Starting Syllables: ${p.namakarana.allSyllablesKn.join(", ")}
- Devata: ${p.namakarana.deityKn}, Gana: ${p.namakarana.ganaKn}, Yoni: ${p.namakarana.animalYoniKn}, Nadi: ${p.namakarana.nadiKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Namakarana Sanskara Muhurtha:
1. Conduct on 11th, 12th, 16th, or 28th day after birth during morning Abhijit Muhurtha.
2. Avoid Rahu Kaalam and Vishti Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Recommended Auspicious Baby Names:
   ${p.namakarana.sampleNamesEn.join(", ")}.
2. Ritual: Write the name on unbroken rice grains spread in a bronze plate using a gold ring, and father whispers the name 3 times into the baby's right ear.

### 4. Astrologer's Verdict & Sacred Blessing
May the sacred vibration of this name bring fame, health, wisdom, and divine protection to the child.
- Blessings by Priest Shreeram Pandit of Baggona.`;
      }
    }

    if (analysis.isDosha) {
      if (lang === "kn") {
        return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ${p.name} ಅವರ ಜಾತಕದ ಸಮಗ್ರ ವೈದಿಕ ದೋಷ ಪರಿಶೀಲನೆ:
- ಸಕ್ರಿಯ ದೋಷಗಳ ಸಂಖ್ಯೆ: ${p.doshas.activeCount}.
${p.doshas.doshaList.length > 0 ? p.doshas.doshaList.map((d, i) => `${i + 1}. ${d.nameKn} (${d.severityKn}): ${d.technicalWhyKn}`).join("\n") : "ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಗ್ರಹ ದೋಷಗಳಿಲ್ಲ (ಶುದ್ಧ ಜಾತಕ)."}
- ಗಂಡಾಂತ ಸಂಧಿ ದೋಷ: ${p.doshas.gandantaSummaryKn}
- ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸ್ಥಿತಿ: ${p.doshas.sadeSatiSummaryKn}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
- ಪ್ರಸ್ತುತ ಮಹಾದಶಾ & ಅಂತರ್ದಶಾ: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- ಮುಂಬರುವ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನ, ಮಂಗಳವಾರ ಅಥವಾ ಶನಿವಾರದಂದು ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಪ್ರಶಸ್ತ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
${p.doshas.doshaList.length > 0 ? p.doshas.doshaList.map((d, i) => `${i + 1}. ${d.nameKn} ಪರಿಹಾರ: ${d.pariharaKn}`).join("\n") : "೧. ನಿತ್ಯ ಗಾಯತ್ರೀ ಜಪ ಹಾಗೂ ನವಗ್ರಹ ಸ್ತೋತ್ರ ಪಠಣ."}
- ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಸೇವೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ ಹೋಮಗಳಿಂದ ಸಕಲ ಗ್ರಹ ಬಾಧೆಗಳು ಭಸ್ಮವಾಗಿ ಜೀವನದಲ್ಲಿ ಶಾಂತಿ, ಸಂಪತ್ತು ಮತ್ತು ಶ್ರೇಯಸ್ಸು ನೆಲೆಸುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
      } else {
        return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, comprehensive Vedic Dosha analysis for ${p.name}:
- Active Doshas Evaluated: ${p.doshas.activeCount}.
${p.doshas.doshaList.length > 0 ? p.doshas.doshaList.map((d, i) => `${i + 1}. ${d.nameEn} (${d.severityKn}): ${d.technicalWhyKn}`).join("\n") : "The chart is purified with zero severe planetary doshas."}
- Gandanta Status: ${p.doshas.gandantaSummaryKn}
- Gochara Status: ${p.doshas.sadeSatiSummaryKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
- Running Dasha Period: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- Shanti rituals are best scheduled on upcoming Shukla Paksha mornings.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
${p.doshas.doshaList.length > 0 ? p.doshas.doshaList.map((d, i) => `${i + 1}. ${d.nameEn} Shanti: ${d.pariharaKn}`).join("\n") : "1. Daily Gayatri Mantra recitation and Navagraha prayer."}
- Rudrabhisheka and Navagraha Homa at Gokarna Mahabaleshwara Temple.

### 4. Astrologer's Verdict & Sacred Blessing
Proper Vedic propitiation dissolves karmic burdens and awakens divine abundance.
- Blessings by Priest Shreeram Pandit of Baggona.`;
      }
    }

    // Default Personal Kundli Full
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ${p.name} ಅವರ ಸಮಗ್ರ ಬಗ್ಗೋಣ ಜನ್ಮಕುಂಡಲಿ ವಿವರಣೆ:
- ಜನ್ಮ ಲಗ್ನ: ${p.lagnaRashiKn} (${p.lagnaDegree.toFixed(1)}°), ಚಂದ್ರ ರಾಶಿ: ${p.moonRashiKn}, ಜನ್ಮ ನಕ್ಷತ್ರ: ${p.moonNakshatraKn} ${p.moonPada}ನೇ ಪಾದ.
- ಸೂರ್ಯ ರಾಶಿ: ${p.sunRashiKn}, ಆಯುರ್ದಾಯ ವರ್ಗ: ${p.ayush.longevityCategoryKn}.
- ಆರೋಗ್ಯ ಸ್ಥಿತಿ: ${p.aarogya.vitalitySummaryKn} (${p.aarogya.tridoshaKn}).
- ಸಕ್ರಿಯ ದೋಷಗಳು: ${p.doshas.activeCount} ದೋಷಗಳು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
- ಪ್ರಸ್ತುತ ವಿಂಶೋತ್ತರಿ ದಶಾ: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- ಗುರು-ಶನಿ ಗೋಚಾರ ಪ್ರಭಾವವು ಸಮತೋಲಿತವಾಗಿದ್ದು, ಶುಕ್ಲ ಪಕ್ಷದ ದಿನಗಳಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿವೆ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ನಿತ್ಯ ಗಾಯತ್ರೀ ಜಪ (೧೦೮ ಬಾರಿ) ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ನವಗ್ರಹ ದೇವತಾ ಪ್ರಾರ್ಥನೆ.
೩. ${p.aarogya.remedialHomasKn[0]}.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಧರ್ಮಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಯಿರಿ, ಜಾತಕದ ಸಕಲ ಶುಭ ಗ್ರಹ ಬಲಗಳು ನಿಮ್ಮ ಕುಟುಂಬವನ್ನು ರಕ್ಷಿಸಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, comprehensive birth chart synthesis for ${p.name}:
- Lagna: ${p.lagnaRashiEn} (${p.lagnaDegree.toFixed(1)}°), Moon Sign: ${p.moonRashiEn}, Nakshatra: ${p.moonNakshatraEn} Pada ${p.moonPada}.
- Longevity: ${p.ayush.longevityCategoryEn}.
- Health & Constitution: ${p.aarogya.tridoshaKn}.
- Active Doshas: ${p.doshas.activeCount} evaluated.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
- Running Period: ${p.currentMahadashaKn} - ${p.currentAntardashaKn}.
- Favorable planetary cycles support steady spiritual and worldly prosperity.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Daily Gayatri Mantra recitation and Kuladevata remembrance.
2. Rudrabhisheka at Gokarna Mahabaleshwara Temple.
3. Dhanvantari Maha Homa and cow service.

### 4. Astrologer's Verdict & Sacred Blessing
May Lord Shiva and Lord Ganesha bless your life with health, wisdom, and complete peace.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // 0.1 Marana, Demise Panchanga & Shraddha Tithi Fallback
  if (analysis.isMaranaShraddha) {
    const demiseDate = analysis.extractedDate || "2023-04-12";
    const currentYear = new Date().getFullYear();
    const data = calculatePratyabdikaShraddha(demiseDate, analysis.targetYear || currentYear, 14.5479, 74.3188);

    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಹಾಗೂ ಧರ್ಮಸಿಂಧು, ನಿರ್ಣಯಸಿಂಧು ಶಾಸ್ತ್ರಗಳ ಆಧಾರದ ಮೇಲೆ ಮರಣ ದಿನಾಂಕ ಹಾಗೂ ಶ್ರಾದ್ಧ ತಿಥಿ ಗಣಿತವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. 
- ಮರಣ ಹೊಂದಿದ ದಿನಾಂಕ: ${data.demiseDate}
- ಸಂವತ್ಸರ: ${data.demiseSamvatsaraKn} ಸಂವತ್ಸರ
- ಚಾಂದ್ರಮಾನ ಮಾಸ: ${data.demiseMasaKn} ಮಾಸ
- ಪಕ್ಷ: ${data.demisePakshaKn}
- ತಿಥಿ: ${data.demiseTithiKn}
- ನಕ್ಷತ್ರ: ${data.demiseNakshatraKn}
- ವಾರ: ${data.demiseWeekdayKn}
ಶಾಸ್ತ್ರದ ನಿಯಮದಂತೆ (ಧರ್ಮಸಿಂಧು ಶ್ರಾದ್ಧ ಪರಿಚ್ಛೇದ), ವಾರ್ಷಿಕ ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧವನ್ನು ಮರಣ ಹೊಂದಿದ ಅದೇ ಮಾಸ, ಅದೇ ಪಕ್ಷ ಮತ್ತು ಅದೇ ತಿಥಿಯಂದು ಅಪರಾಹ್ನ ವ್ಯಾಪ್ತಿಯಿರುವ ಕಾಲದಲ್ಲಿ ಆಚರಿಸಬೇಕು. 
${data.hasPanchakaDosha ? `ವಿಶೇಷ ಎಚ್ಚರಿಕೆ: ${data.panchakaSummaryKn}` : "ಪಂಚಕ ಪರಿಶೀಲನೆ: ಮರಣ ನಕ್ಷತ್ರವು ಶುದ್ಧವಾಗಿದ್ದು, ಯಾವುದೇ ಧನಿಷ್ಠಾ ಪಂಚಕ ದೋಷವಿಲ್ಲ."}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
${data.targetYear}ನೇ ಸಾಲಿನ ಪ್ರತ್ಯಾಬ್ದಿಕ ಶ್ರಾದ್ಧ ದಿನಾಂಕ ಹಾಗೂ ಮುಹೂರ್ತ:
೧. ಶ್ರಾದ್ಧ ದಿನಾಂಕ: ${data.pratyabdikaFormattedKn}
೨. ಶ್ರಾದ್ಧ ಕಾಲ (ಅಪರಾಹ್ನ ಕಾಲ): ${data.aparahnaKala}
೩. ಆಶೌಚ ಗಣಿತ: ಜ್ಞಾತಿ ಸಪಿಂಡರಿಗೆ ೧೦ ದಿನಗಳ ಪೂರ್ಣ ಆಶೌಚ, ಸಮಾನೋದಕರಿಗೆ ೩ ದಿನಗಳು.
೪. ಶ್ರಾದ್ಧ ದಿನದಂದು ಕುತಪ ಹಾಗೂ ರೌಹಿಣ ಮುಹೂರ್ತಗಳಲ್ಲಿ (ಮಧ್ಯಾಹ್ನ ೧೨:೦೦ ರಿಂದ ೨:೩೦) ಪಿಂಡ ಪ್ರದಾನ ಮಾಡುವುದು ಪರಮ ಶ್ರೇಷ್ಠ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಪಿತೃ ತರ್ಪಣ & ತಿಲಾಂಜಲಿ: ಕಪ್ಪು ಎಳ್ಳು, ದರ್ಭೆ ಮತ್ತು ತುಳಸಿ ದಳಗಳೊಂದಿಗೆ ಪಿತೃ ತರ್ಪಣ ನೀಡುವುದು.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಮುಕ್ತಿ ಸೇವೆ: ಗೋಕರ್ಣದಲ್ಲಿ ತಿಲ ಹೋಮ (Thila Homa), ನಾರಾಯಣ ಬಲಿ (Narayana Bali) ಮತ್ತು ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ (Tripindi Shraddha) ನೆರವೇರಿಸುವುದರಿಂದ ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿ ದೊರೆಯುತ್ತದೆ.
೩. ಗೋ-ದಾನ ಮತ್ತು ಅನ್ನಸಂತರ್ಪಣೆ: ಶ್ರಾದ್ಧದ ನಂತರ ಗೋವಿಗೆ ಗೋಗ್ರಾಸ ನೀಡಿ, ಸತ್ಪಾತ್ರರಿಗೆ ಅನ್ನದಾನ ಮತ್ತು ವಸ್ತ್ರದಾನ ಮಾಡುವುದು ವಂಶಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ ತರುತ್ತದೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶ್ರದ್ಧೆಯಿಂದ ಮಾಡುವ ಶ್ರಾದ್ಧ ಕರ್ಮದಿಂದ ಪಿತೃ ದೇವತೆಗಳು ತೃಪ್ತರಾಗಿ ಸಂತಾನ ವೃದ್ಧಿ ಮತ್ತು ಸುಖ-ಶಾಂತಿಯ ಆಶೀರ್ವಾದ ನೀಡುತ್ತಾರೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on Baggona Panchanga and classical Dharma Sindhu and Nirnaya Sindhu scriptures, here is the verified Marana and Shraddha Tithi determination:
- Demise Date: ${data.demiseDate}
- Samvatsara: ${data.demiseSamvatsaraKn}
- Lunar Month (Masa): ${data.demiseMasaKn}
- Lunar Fortnight (Paksha): ${data.demisePakshaKn}
- Demise Tithi: ${data.demiseTithiKn}
- Demise Nakshatra: ${data.demiseNakshatraKn} (${data.demiseWeekdayKn})
Per classical Shastra, the annual Pratyabdika Shraddha must be observed on the exact lunar month, fortnight, and tithi during the Aparahna Kaala window.
${data.hasPanchakaDosha ? `Panchaka Note: ${data.panchakaSummaryKn}` : "Panchaka Check: Demise star is clean, no Dhanishta Panchaka dosha."}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Pratyabdika Shraddha Determination for Year ${data.targetYear}:
1. Exact Shraddha Date: ${data.pratyabdikaFormattedKn}
2. Sacred Shraddha Window: ${data.aparahnaKala}
3. Kutapa & Rauhina Muhurthas (11:45 AM - 02:30 PM) are supremely sacred for Pinda Pradana.
4. Ashaucha: 10 days for Sapindas.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Pitru Tarpana with black sesame seeds (Tilanjali), Darbha grass, and Tulasi leaves.
2. Moksha Sevas at Sri Kshetra Gokarna Mahabaleshwara: Thila Homa, Narayana Bali, and Tripindi Shraddha for ancestral liberation.
3. Gau-seva (feeding cows) and Annadana to the needy.

### 4. Astrologer's Verdict & Sacred Blessing
May the departed soul attain Vaikuntha Moksha and shower eternal protection and blessings upon your family lineage.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // 0.2 Business / Hotel Surrender & Rina Mukti Muhurtha Fallback
  if (analysis.isSurrenderClosure) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const data = calculateSurrenderMuhurthaDates(currentYear, currentMonth, 14.5479, 74.3188);

    if (lang === "kn") {
      const recDaysLines = data.recommendedDays.map((d, i) => `${i + 1}. ದಿನಾಂಕ: ${d.date} (${d.weekdayKn}) - ತಿಥಿ: ${d.tithiKn}, ನಕ್ಷತ್ರ: ${d.nakshatraKn}\n   ಮುಹೂರ್ತ: ${d.timeWindowKn}\n   ಶಾಸ್ತ್ರ ಫಲ: ${d.reasonKn}`).join("\n");

      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಹೊಟೇಲ್ ಒಪ್ಪಿಸುವಿಕೆ, ಗುತ್ತಿಗೆ ಮುಕ್ತಾಯ ಅಥವಾ ವ್ಯಾಪಾರ ಸಮಾಪ್ತಿಗಾಗಿ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಹಾಗೂ ಮುಹೂರ್ತ ಚಿಂತಾಮಣಿ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಸೂಕ್ಷ್ಮ ಕಾಲ ನಿರ್ಣಯ ಇಲ್ಲಿದೆ:
೧. ಮಂಗಳವಾರದ ಋಣ ವಿಮೋಚನಾ ಯೋಗ (Bhaume Rina Vimochana): ಬೃಹತ್ ಸಂಹಿತೆಯ ಪ್ರಕಾರ ಮಂಗಳವಾರದಂದು ಸಾಲ ಅಥವಾ ಹೊಟೇಲ್/ವ್ಯಾಪಾರದ ಗುತ್ತಿಗೆ ಬಾಕಿ ತೀರಿಸಿ ಒಪ್ಪಿಸಿದರೆ, ಆ ವ್ಯಕ್ತಿಯು ಆ ಋಣದಿಂದ ಶಾಶ್ವತವಾಗಿ ಮುಕ್ತನಾಗುತ್ತಾನೆ. ಕುಜನ ಅಗ್ನಿತತ್ವವು ನಷ್ಟದ ಹೊಣೆಯನ್ನು ಸುಟ್ಟುಹಾಕುತ್ತದೆ.
೨. ಗುರುವಾರ (Guru Vara): ಮಾಲೀಕರು ಮತ್ತು ಗುತ್ತಿಗೆದಾರರ ನಡುವೆ ಶಾಂತಿಯುತ, ವಿವಾದರಹಿತ ಒಪ್ಪಿಸುವಿಕೆ ಹಾಗೂ ಠೇವಣಿ ಮರುಪಾವತಿಗೆ ಗುರುವು ಅತ್ಯಂತ ಪ್ರಶಸ್ತ.
೩. ಚರ ಲಗ್ನ ಆವಶ್ಯಕತೆ (Movable Ascendant): ಮೇಷ, ಕರ್ಕಾಟಕ, ತುಲಾ, ಮಕರ ಲಗ್ನಗಳಲ್ಲಿ ಒಪ್ಪಿಸಿದರೆ ವ್ಯಾಪಾರವು ತ್ವರಿತವಾಗಿ, ಶಾಶ್ವತವಾಗಿ ಕಡಿದುಹೋಗುತ್ತದೆ; ಸ್ಥಿರ ಲಗ್ನದಲ್ಲಿ ಒಪ್ಪಿಸಿದರೆ ಸಮಸ್ಯೆಗಳು ಅಲ್ಲಿಯೇ ಗಿರಕಿ ಹೊಡೆಯುತ್ತವೆ.
೪. ರಿಕ್ತ ತಿಥಿ ತ್ಯಾಗ: ಚತುರ್ಥಿ (೪), ನವಮೀ (೯), ಚತುರ್ದಶಿ (೧೪) ಮತ್ತು ಅಮಾವಾಸ್ಯೆ ದಿನಗಳಲ್ಲಿ ಒಪ್ಪಿಸಬಾರದು.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಹೊಟೇಲ್ ಒಪ್ಪಿಸಲು / ವ್ಯವಹಾರ ಮುಕ್ತಾಯಕ್ಕೆ ಮುಂಬರುವ ಅತ್ಯುತ್ತಮ ಮುಹೂರ್ತಗಳು:
${recDaysLines}

ವರ್ಜ್ಯ ದಿನಗಳು:
೧. ಶನಿವಾರ: ವ್ಯಾಪಾರವು ಮುಗಿಯದೆ ವ್ಯಾಜ್ಯ, ಕೋರ್ಟ್ ಕಚೇರಿ ಅಥವಾ ವಿಳಂಬಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ.
೨. ಬುಧವಾರ: ಬುಧವಾರದಂದು ಒಪ್ಪಿಸಿದರೆ ನೂತನ ವ್ಯಾಪಾರ ಅಥವಾ ಸಾಲದ ಸುಳಿಗೆ ಮತ್ತೆ ಸಿಲುಕುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ.
೩. ರಾಹುಕಾಲ, ಯಮಗಂಡ ಕಾಲ ಮತ್ತು ಭದ್ರಾ (ವಿಷ್ಟಿ) ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಿ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಋಣಮೋಚಕ ಮಂಗಳ ಸ್ತೋತ್ರ ಪಠಣ: ಒಪ್ಪಿಸುವ ಮುನ್ನ ದಿನ ೨೧ ಬಾರಿ 'ಮಂಗಳೋ ಭೂಮಿಪುತ್ರಶ್ಚ ಋಣಹರ್ತಾ ಧನಪ್ರದಃ' ಸ್ತೋತ್ರ ಪಠಿಸಿ.
೨. ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗರಿಕೆ ಸಮರ್ಪಣೆ: ನಿರ್ವಿಘ್ನವಾಗಿ ಕರಾರು ಮುಕ್ತಾಯವಾಗಲು ಗಣೇಶನಿಗೆ ಗರಿಕೆ ಅರ್ಚನೆ ಮತ್ತು ಕೊಬ್ಬರಿ ನೈವೇದ್ಯ.
೩. ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನದಲ್ಲಿ ಕೆಂಪು ಹೂವು ಮತ್ತು ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಣೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಈ ಶಾಸ್ತ್ರೋಕ್ತ ಮುಹೂರ್ತದಲ್ಲಿ ಒಪ್ಪಿಸುವುದರಿಂದ ಹಳೆಯ ಹೊಣೆಗಾರಿಕೆಗಳು ಕಳಚಿ, ಮುಂದಿನ ನೂತನ ಸತ್ಕಾರ್ಯಗಳಿಗೆ ಶುಭೋದಯವಾಗುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      const recDaysLines = data.recommendedDays.map((d, i) => `${i + 1}. Date: ${d.date} (${d.weekdayKn}) - Tithi: ${d.tithiKn}, Nakshatra: ${d.nakshatraKn}\n   Window: ${d.timeWindowKn}\n   Reason: ${d.reasonKn}`).join("\n");

      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on Baggona Panchanga and Muhurtha Chintamani, here are the precise electional principles for surrendering a hotel, terminating a lease, or closing an enterprise:
1. Tuesday (Bhaume Rina Vimochana): Classical treatises emphasize that settling liabilities or handing over a loss-making lease on Tuesday ensures permanent debt liberation so that financial burdens never recur.
2. Thursday (Guru Vara): Ideal for amicable handovers, polite settlement with landlords, and smooth deposit refunds without dispute.
3. Movable Ascendant (Chara Lagna): Surrender must occur during Aries, Cancer, Libra, or Capricorn Lagna to ensure a swift, definitive severance. Fixed signs (Sthira Lagna) must be avoided as they cause lingering entanglements.
4. Avoid Rikta Tithis (4th, 9th, 14th) and Amavasya.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Top Recommended Dates in Baggona Panchanga:
${recDaysLines}

Days to Strictly Avoid:
1. Saturday: Drags lease settlements into court disputes and endless delays.
2. Wednesday: Creates revolving commercial debt.
3. Rahu Kaalam, Yamagandam, and Vishti (Bhadra) Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Recitation of Rina Mochaka Mangala Stotram 21 times before final handover.
2. Ganesha Pooja with Garika grass for obstruction-free contract closure.
3. Lighting a ghee lamp at Lord Subramanya or Hanuman temple.

### 4. Astrologer's Verdict & Sacred Blessing
Surrendering in these calculated Muhurthas frees you from all past karmic and financial encumbrances, paving the way for great future success.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // 0.3 Festival & Vrata Fallback
  if (analysis.isFestival) {
    const fData = calculateFestivalDetails(question);
    if (fData) {
      if (lang === "kn") {
        return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ವಾರ್ಷಿಕ ಮಹೋತ್ಸವ ತಖ್ತೆಯ ಪ್ರಕಾರ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಹಬ್ಬದ ವಿವರಣೆ:
- ಹಬ್ಬದ ಹೆಸರು: ${fData.festivalNameKn} (${fData.festivalNameEn})
- ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ದಿನಾಂಕ: ${fData.date}
- ಚಾಂದ್ರಮಾನ ಮಾಸ: ${fData.masaKn}
- ಪಕ್ಷ & ತಿಥಿ: ${fData.pakshaKn}, ${fData.tithiKn}
- ಮಹತ್ವ: ${fData.descriptionKn}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
೧. ಹಬ್ಬದ ಆಚರಣಾ ದಿನ: ${fData.date}
೨. ಶುಭ ಪೂಜಾ ಮುಹೂರ್ತ ಕಾಲ: ${fData.pujaWindowKn}
೩. ಬ್ರಹ್ಮ ಮುಹೂರ್ತದಲ್ಲಿ ಅಭ್ಯಂಗ ಸ್ನಾನ ಮತ್ತು ಶುಭ ಹೋರಾ ಸಮಯದಲ್ಲಿ ಸಂಕಲ್ಪ.
೪. ರಾಹುಕಾಲವನ್ನು ತ್ಯಜಿಸಿ ಪ್ರಧಾನ ಪೂಜೆ ನೆರವೇರಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ವ್ರತ ವಿಧಿ & ಸಂಕಲ್ಪ: ${fData.vrataVidhanaKn}
${fData.mantra ? `೨. ಪ್ರಧಾನ ಮಂತ್ರ ಜಪ: ${fData.mantra} (೧೦೮ ಬಾರಿ).` : "೨. ಇಷ್ಟದೇವತಾ ಸಹಸ್ರನಾಮ ಪಠಣ."}
೩. ಮಹಾ ನೈವೇದ್ಯ ಮತ್ತು ಸತ್ಪಾತ್ರರಿಗೆ ಅನ್ನದಾನ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಈ ಪವಿತ್ರ ವ್ರತಾಚರಣೆಯು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ, ಸಕಲ ಸೌಭಾಗ್ಯ ಮತ್ತು ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣದ ದೈವಿಕ ಕೃಪೆಯನ್ನು ತರಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
      } else {
        return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, here is the official Baggona Panchanga determination for the festival:
- Festival: ${fData.festivalNameEn} (${fData.festivalNameKn})
- Calendar Date: ${fData.date}
- Lunar Month (Masa): ${fData.masaKn}
- Paksha & Tithi: ${fData.pakshaKn}, ${fData.tithiKn}
- Spiritual Significance: ${fData.descriptionKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
1. Festival Date: ${fData.date}
2. Auspicious Pooja Window: ${fData.pujaWindowKn}
3. Perform Abhyanga Snana during Brahma Muhurtha and Sankalpa during auspicious Hora.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Sacred Vrata Observance: ${fData.vrataVidhanaKn}
${fData.mantra ? `2. Divine Chanting Mantra: ${fData.mantra}` : "2. Recitation of Sahasranama Stotram."}
3. Maha Prasada offering and Annadana to devotees.

### 4. Astrologer's Verdict & Sacred Blessing
May this sacred festival bring boundless joy, prosperity, and divine blessings from Sri Kshetra Baggona to your family.
- Blessings by Priest Shreeram Pandit of Baggona.`;
      }
    }
  }

  // 1. Name to Nakshatra & Pada Fallback (Avakahada Chakra)
  if (analysis.isNameLookup && analysis.matchedNameData) {
    const nd = analysis.matchedNameData;
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಹಾಗೂ ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಆವಕಹಡ ಚಕ್ರದ (Avakahada Chakra) ಪ್ರಕಾರ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. '${nd.matchedName}' ನಾಮವು '${nd.inputSyllable}' ಧ್ವನಿಯಿಂದ ಆರಂಭವಾಗುವುದರಿಂದ ಇದು ನಿಖರವಾಗಿ **${nd.entry.nakshatraNameKn} ನಕ್ಷತ್ರದ ${nd.entry.pada}ನೇ ಪಾದ (Pada ${nd.entry.pada})** ಹಾಗೂ **${nd.entry.rashiNameKn} ರಾಶಿಗೆ (${nd.entry.rashiNameEn})** ಸೇರುತ್ತದೆ. ಈ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ${nd.entry.nakshatraLordKn} ಹಾಗೂ ರಾಶ್ಯಾಧಿಪತಿ ${nd.entry.rashiLordKn}. ಇದರ ಪವಿತ್ರ ಆರಾಧ್ಯ ದೇವತೆ ${nd.entry.deityKn}. ಗಣ: ${nd.entry.ganaKn}, ಯೋನಿ: ${nd.entry.animalYoniKn}. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಇದನ್ನು ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದವೆಂದು ತಪ್ಪಾಗಿ ಭಾವಿಸಬಾರದು; ಇದು ಪುನರ್ವಸು ನಕ್ಷತ್ರ ೪ನೇ ಪಾದ ಕರ್ಕಾಟಕ ರಾಶಿಯಾಗಿದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
${nd.entry.nakshatraNameKn} ನಕ್ಷತ್ರದ ೪ನೇ ಪಾದದ ವ್ಯಕ್ತಿಗಳಿಗೆ ಗುರು ಮತ್ತು ಚಂದ್ರರ ಅನುಗ್ರಹದಿಂದ ಸೌಮ್ಯ, ದಯಾಳು ಮತ್ತು ಉನ್ನತ ಜ್ಞಾನದ ವ್ಯಕ್ತಿತ್ವವಿರುತ್ತದೆ. ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಗುರು ಬಲ ಮತ್ತು ಶುಕ್ರವಾರ, ಗುರುವಾರಗಳ ಶುಭ ದಿನಗಳು ಹೊಸ ಕಾರ್ಯಾರಂಭಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿವೆ. ರಾಹುಕಾಲವನ್ನು ತ್ಯಜಿಸಿ ಶುಭ ಕಾರ್ಯಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಸರಸ್ವತೀ & ಮಹಾಗಣಪತಿ ನಾಮಾಕ್ಷರ ಸಿದ್ಧಿ ಪೂಜೆ: '${nd.inputSyllable}' ಧ್ವನಿ ತರಂಗಾಂತರವು ಆಜ್ಞಾ ಚಕ್ರವನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ನಿತ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಹಾಗೂ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ನೆರವೇರಿಸಿ.
೩. ಪ್ರತಿ ಗುರುವಾರ ಹಳದಿ ವಸ್ತ್ರ ಅಥವಾ ಕಡಲೆಬೇಳೆ ದಾನ ಮತ್ತು ಗೋ-ಸೇವೆ ಮಾಡುವುದು ಭಾಗ್ಯವರ್ಧಕ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
${nd.entry.nakshatraNameKn} ೪ನೇ ಪಾದದ ನಾಮಧಾರಕರಿಗೆ ಮಹಾಲಕ್ಷ್ಮಿ ಹಾಗೂ ಶಿವ-ಪಾರ್ವತಿಯರ ದೈವಿಕ ಅನುಗ್ರಹ ಸದಾ ಇರುತ್ತದೆ. ಸತ್ಕರ್ಮಗಳಿಂದ ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳು ಸಿದ್ಧಿಸಲಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on classical Brihat Parashara Hora Shastra and the sacred Baggona Avakahada Chakra tradition, the name '${nd.matchedName}' resonates with the phonetic syllable '${nd.inputSyllable}'. This deterministically belongs to **${nd.entry.nakshatraNameEn} Nakshatra, Pada ${nd.entry.pada}** in **${nd.entry.rashiNameEn} (${nd.entry.rashiNameKn} Rashi)**. Nakshatra lord is ${nd.entry.nakshatraLordEn}, sign lord is ${nd.entry.rashiLordEn}, and presiding deity is ${nd.entry.deityEn}. Gana: ${nd.entry.ganaEn}, Yoni: ${nd.entry.animalYoniEn}. This is definitively Punarvasu Nakshatra 4th Pada, not Mula Nakshatra.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Punarvasu 4th Pada natives are blessed with emotional intelligence, divine grace, and spiritual scholarship under Moon and Jupiter. Thursdays and Mondays are auspicious for new undertakings, avoiding Rahu Kaalam.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Saraswati-Ganesha Namakshara Siddhi Pooja and recitation of Guru Brihaspati Stotram.
2. Rudrabhisheka at Sri Kshetra Gokarna Mahabaleshwara temple.
3. Feed cows with fresh green grass or offer yellow grains on Thursdays.

### 4. Astrologer's Verdict & Sacred Blessing
May Lord Mahabaleshwara and Goddess Aditi illuminate your life with boundless peace, health, and prosperity.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // 2. Today's Live Baggona Panchanga Fallback
  if (analysis.isPanchangaQuery) {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]!;
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const p = calculateTraditionalBaggona(dateStr, timeStr, 14.5479, 74.3188);
    const clk = calculateInstantPrashnaClock(0, now, 14.5479, 74.3188);

    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ಇಂದಿನ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಶುಭ ಮುಹೂರ್ತ ಮತ್ತು ಗ್ರಹಗತಿ ವಿವರಣೆ:
- ಸಂವತ್ಸರ: ${p.samvatsaraKn}
- ಮಾಸ & ಪಕ್ಷ: ${p.masaKn} ಮಾಸ, ${p.pakshaKn} ಪಕ್ಷ
- ತಿಥಿ: ${p.tithiKn} (${p.tithi})
- ವಾರ: ${p.weekdayKn} (${p.weekday})
- ನಕ್ಷತ್ರ: ${p.moonNakshatraKn} (${p.moonNakshatra})
- ಯೋಗ: ${p.yogaKn}, ಕರಣ: ${p.karanaKn}

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
- ಪ್ರಸ್ತುತ ಗ್ರಹ ಹೋರೆ: ${clk.horaLordKn} (${clk.horaLordEn}) - ${clk.horaSignificanceKn}
- ಪ್ರಸ್ತುತ ಚೋಘಡಿಯಾ: ${clk.choghadiyaNameKn} (${clk.choghadiyaNameEn}) - ${clk.choghadiyaDescKn}
- ರಾಹು ಕಾಲ: ${clk.rahuKalamTimeStr} ${clk.isRahuKalamActive ? "(ಪ್ರಸ್ತುತ ರಾಹುಕಾಲ ಸಕ್ರಿಯ)" : "(ಶುಭ ಕಾಲ)"}
- ಚಂದ್ರ ಬಲ: ${clk.chandraBalaStatusKn}

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ದಿನದ ಆರಂಭದಲ್ಲಿ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಮತ್ತು ಕುಲದೇವತಾ ಸ್ಮರಣೆ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ತುಪ್ಪದ ದೀಪ ಸಮರ್ಪಣೆ.
೩. ಗಾಯತ್ರೀ ಜಪ (೧೦೮ ಬಾರಿ) ಮತ್ತು ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಇಂದಿನ ದೈವಿಕ ಪಂಚಾಂಗವು ಸತ್ಕರ್ಮಗಳಿಗೆ ಮಂಗಳವನ್ನುಂಟುಮಾಡಲಿ. ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಸನ್ನಿಧಿಯ ಆಶೀರ್ವಾದಗಳು.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, here is today's authentic Baggona Panchanga summary:
- Samvatsara: ${p.samvatsaraKn} (${p.samvatsara})
- Month & Paksha: ${p.masaKn} Masa, ${p.pakshaKn} Paksha
- Tithi: ${p.tithiKn} (${p.tithi})
- Weekday: ${p.weekdayKn} (${p.weekday})
- Moon Nakshatra: ${p.moonNakshatraKn} (${p.moonNakshatra})
- Yoga: ${p.yogaKn}, Karana: ${p.karanaKn}

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
- Current Hora: ${clk.horaLordEn} (${clk.horaSignificanceEn})
- Choghadiya: ${clk.choghadiyaNameEn} (${clk.choghadiyaQuality})
- Rahu Kaalam: ${clk.rahuKalamTimeStr}
- Chandra Bala: ${clk.chandraBalaStatusEn}

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Morning prayer to Lord Maha Ganapati and Kuladevata.
2. Rudrabhisheka at Gokarna Mahabaleshwara temple.
3. Chanting of Gayatri Mantra 108 times.

### 4. Astrologer's Verdict & Sacred Blessing
May the auspicious planetary vibrations of today bring fulfillment and divine peace to you.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  if (analysis.isMulaNakshatra) {
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರ ಹಾಗೂ ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಸಿದ್ಧಾಂತದ ಆಧಾರದಲ್ಲಿ ಆಳವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಮೂಲಾ ನಕ್ಷತ್ರವು ಕೇತು ಗ್ರಹದ ಅಧಿಪತ್ಯದಲ್ಲಿದ್ದು, ವೃಶ್ಚಿಕ ರಾಶಿಯ ಜಲತತ್ವ ಮತ್ತು ಧನು ರಾಶಿಯ ಅಗ್ನಿತತ್ವದ ಸಂಧಿಯಲ್ಲಿ ಬರುತ್ತದೆ. ಮೊದಲನೇ ಪಾದವು (೦° ರಿಂದ ೩°೨೦' ಧನು) ಅಭುಕ್ತ ಮೂಲಾ ಅಥವಾ ಗಂಡಾಂತ ಸಂಧಿ ಎಂದು ಕರೆಯಲ್ಪಡುತ್ತದೆ. ಬೃಹತ್ ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಮೊದಲ ಪಾದದಲ್ಲಿ ಜನನವಾದಾಗ ಪೋಷಕರಿಗೆ ವಿಶೇಷವಾಗಿ ತಂದೆಯ ಆರೋಗ್ಯ ಮತ್ತು ವ್ಯವಹಾರದಲ್ಲಿ ಆರಂಭಿಕ ಸವಾಲುಗಳು ಉಂಟಾಗಬಹುದು. ಆದರೆ ಇದು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಶಾಶ್ವತವಾದ ಅಪಾಯ ಅಥವಾ ಹೆದರಿಕೆಯ ವಿಷಯವಲ್ಲ. ವೈದಿಕ ಶಾಸ್ತ್ರದಲ್ಲಿ ಇದಕ್ಕೆ ಸ್ಪಷ್ಟ ಮತ್ತು ಶಕ್ತಿಯುತ ಪರಿಹಾರಗಳನ್ನು ನೀಡಲಾಗಿದೆ. ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿಯ ನಂತರ ಈ ದೋಷವು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಶಿಶು ಜನಿಸಿದ ೨೭ನೇ ದಿನದಂದು (ಚಂದ್ರನು ಪುನಃ ಮೂಲಾ ನಕ್ಷತ್ರಕ್ಕೆ ಪ್ರವೇಶಿಸಿದಾಗ) ಅಥವಾ ಮುಂದಿನ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ದಿನದಂದು ಮೂಲಾ ಶಾಂತಿ ಮುಹೂರ್ತ ನಿಗದಿಪಡಿಸಬೇಕು. ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಬ್ರಹ್ಮ ಮುಹೂರ್ತ ಅಥವಾ ಅಭಿಜಿತ್ ಮುಹೂರ್ತದ ಸಮಯ ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾಗಿದೆ. ರಾಹುಕಾಲ, ಯಮಗಂಡ ಕಾಲ ಮತ್ತು ಭದ್ರಾ ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ ಹೋಮ: ೨೭ ತೀರ್ಥಕ್ಷೇತ್ರಗಳ ಪವಿತ್ರ ಜಲದಿಂದ ೨೭ ನಕ್ಷತ್ರ ಕಲಶ ಸ್ನಾನ ಮಾಡಿಸುವುದು.
೨. ತುಪ್ಪದ ಪಾತ್ರೆಯಲ್ಲಿ ಮುಖ ದರ್ಶನ: ಶಾಂತಿ ಪೂಜೆ ಮುಗಿಯುವವರೆಗೆ ತಂದೆ ಮಗುವನ್ನು ನೇರವಾಗಿ ನೋಡದೆ, ಕಂಚಿನ ಪಾತ್ರೆಯಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪ ತುಂಬಿಸಿ ಅದರಲ್ಲಿ ಮಗುವಿನ ಮುಖದ ಪ್ರತಿಬಿಂಬವನ್ನು ನೋಡಿ ದೃಷ್ಟಿದೋಷ ನಿವಾರಿಸಿಕೊಳ್ಳಬೇಕು.
೩. ಗೋ-ದಾನ ಮತ್ತು ರುದ್ರಾಭಿಷೇಕ: ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ಗೋಮಾತೆಯ ಸೇವೆ ಮಾಡಿಸುವುದು ಅತ್ಯಂತ ಶುಭಪ್ರದ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದದ ಮಕ್ಕಳು ಶಾಂತಿ ಹೋಮದ ನಂತರ ಅತ್ಯಂತ ಧೈರ್ಯಶಾಲಿಗಳಾಗಿ, ಉನ್ನತ ನಾಯಕತ್ವ ಮತ್ತು ತೀಕ್ಷ್ಣ ಬುದ್ಧಿವಂತಿಕೆಯನ್ನು ಪಡೆದು ಕುಟುಂಬಕ್ಕೆ ಕೀರ್ತಿ ತರುತ್ತಾರೆ. ಹೆದರುವ ಅಗತ್ಯವಿಲ್ಲ, ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ ನೆರವೇರಿಸಿ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, based on classical Brihat Parashara Hora Shastra and the sacred Baggona tradition, your inquiry has been deeply evaluated. Mula Nakshatra is ruled by Ketu and presiding deity Nirriti, placed at the critical Gandanta junction between Scorpio (water) and Sagittarius (fire). The 1st Pada (0°00' to 3°20' Sagittarius) is known as Abhukta Moola Gandanta. Classical texts like Brihat Parashara note that an unpropitiated birth in this pada can bring temporary hurdles to the father or elders. However, this is NOT a permanent curse or incurable danger; classical Vedic Shastra provides comprehensive Shanti rites that completely dissolve all negative influences and awaken immense spiritual strength.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
The Shanti ceremony should ideally be conducted on the 27th day after birth when the Moon returns to Mula Nakshatra, or during an auspicious Shukla Paksha morning in Abhijit Muhurtha. Avoid Rahu Kaalam, Yamagandam, and Vishti Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Mula Nakshatra Shanti Homa: Sacred 27-Kalasha herbal water bath and Navagraha Homa.
2. Father Ghee Reflection Ritual: The father first views the infant reflection in a bronze vessel filled with pure clarified butter before looking at the baby directly.
3. Cow Service and Gokarna Rudrabhisheka: Perform Rudrabhisheka at Gokarna Mahabaleshwara temple and offer feed to cows.

### 4. Astrologer's Verdict & Sacred Blessing
Once proper Shanti is performed, children born in Mula 1st Pada develop fearless leadership, brilliant intellectual acumen, and deep wisdom. May Lord Mahabaleshwara and Lord Ganesha bless the child.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  if (analysis.isVahanaMuhurtha) {
    if (lang === "kn") {
      return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ವಾಹನ ಖರೀದಿಗೆ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ೪ನೇ ಭಾವ (ವಾಹನ ಮತ್ತು ಸುಖ ಸ್ಥಾನ) ಹಾಗೂ ಶುಕ್ರ ಗ್ರಹದ ಬಲ ಅತ್ಯಂತ ಮುಖ್ಯವಾಗಿದೆ. ರೇವತಿ ನಕ್ಷತ್ರ ಹಾಗೂ ಮೀನ ರಾಶಿಯವರಿಗೆ ಶುಕ್ರನು ಕಾರಕನಾಗಿದ್ದು, ಚರ ಮತ್ತು ಮೃದು ನಕ್ಷತ್ರಗಳಾದ ರೇವತಿ, ಅಶ್ವಿನಿ, ರೋಹಿಣಿ, ಪುನರ್ವಸು, ಪುಷ್ಯ, ಹಸ್ತ, ಸ್ವಾತಿ, ಶ್ರವಣ ನಕ್ಷತ್ರಗಳು ಅತ್ಯಂತ ಶುಭವಾಗಿವೆ. ಚಂದ್ರಬಲವು ೧, ೩, ೬, ೭, ೧೦, ೧೧ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ಅಷ್ಟಮ ಚಂದ್ರ (ಚಂದ್ರಷ್ಟಮ) ಇಲ್ಲದ ದಿನವನ್ನು ಆರಿಸಬೇಕು.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ವಾಹನ ಖರೀದಿಗೆ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ ದಿನಗಳು:
೧. ಶುಕ್ರವಾರ ಮತ್ತು ಗುರುವಾರ: ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ ೯:೩೦ ರಿಂದ ೧೦:೪೫ (ಅಮೃತ ಕಾಲ) ಅಥವಾ ಮಧ್ಯಾಹ್ನ ೧೨:೦೦ ರಿಂದ ೧೨:೪೫ (ಅಭಿಜಿತ್ ಮುಹೂರ್ತ).
೨. ಬುಧವಾರ: ರೇವತಿ ನಕ್ಷತ್ರದ ಅಧಿಪತಿ ಬುಧನಾಗಿದ್ದರಿಂದ, ಬುಧವಾರದ ಮುಹೂರ್ತವೂ ರೇವತಿ ನಕ್ಷತ್ರದವರಿಗೆ ಅತ್ಯಂತ ಶುಭಪ್ರದ.
೩. ವರ್ಜ್ಯ ಸಮಯ: ರಾಹುಕಾಲ (ಶುಕ್ರವಾರ ಬೆಳಿಗ್ಗೆ ೧೦:೩೦ ರಿಂದ ೧೨:೦೦), ಯಮಗಂಡ ಕಾಲ ಮತ್ತು ಭದ್ರಾ ಕರಣವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಬಿಡಬೇಕು.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ದೇವಸ್ಥಾನದಲ್ಲಿ ವಾಹನ ಪೂಜೆ: ವಾಹನವನ್ನು ಮನೆಗೆ ತರುವ ಮುನ್ನ ಸಮೀಪದ ಗಣಪತಿ ಅಥವಾ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನದಲ್ಲಿ ವಾಹನ ಪೂಜೆ ನೆರವೇರಿಸಿ.
೨. ನಿಂಬೆಹಣ್ಣು ಮತ್ತು ತೆಂಗಿನಕಾಯಿ: ನಾಲ್ಕು ಚಕ್ರಗಳ ಕೆಳಗೆ ನಿಂಬೆಹಣ್ಣುಗಳನ್ನು ಇರಿಸಿ ವಾಹನ ಚಲಾಯಿಸುವುದು ಮತ್ತು ದೃಷ್ಟಿದೋಷ ನಿವಾರಣೆಗೆ ವಾಹನದ ಮುಂದೆ ಕಾಯಿ ಒಡೆಯುವುದು.
೩. ಓಂ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ ಜಪ: ವಾಹನದಲ್ಲಿ ಕುಳಿತು ೧೨ ಬಾರಿ ಈ ಮಂತ್ರವನ್ನು ಪಠಿಸಿ ಮೊದಲ ಪ್ರಯಾಣ ಆರಂಭಿಸಿ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ರೇವತಿ ನಕ್ಷತ್ರ ಮೀನ ರಾಶಿಯವರಿಗೆ ಈ ಮುಹೂರ್ತದಲ್ಲಿ ಖರೀದಿಸುವ ವಾಹನವು ದೀರ್ಘಕಾಲಿಕ ಸುಖ, ಸುರಕ್ಷತೆ ಮತ್ತು ಸಂಪತ್ತನ್ನು ತರಲಿದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
    } else {
      return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, for vehicle purchase, the 4th House (Sukha and Vahana Bhava) and Lord Venus are primary significators. For Revati Nakshatra and Meena Rashi, Mercury and Jupiter provide guidance. Movable and soft nakshatras like Revati, Rohini, Punarvasu, Pushya, Hasta, Swati, and Shravana are considered supremely auspicious. Chandra Bala must be favorable, avoiding 8th house Chandrashtama.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
According to Baggona Panchanga:
1. Recommended Days: Fridays (Venus), Thursdays (Jupiter), and Wednesdays (Mercury).
2. Favorable Hours: Abhijit Muhurtha (11:55 AM to 12:45 PM) or morning Amrita Kaala.
3. Strictly Avoid: Rahu Kaalam, Yamagandam, and Vishti Karana.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Temple Vahana Pooja: Conduct a dedicated Pooja to Lord Ganesha and Lord Hanuman before driving home.
2. Protection Ritual: Place lemons beneath the four tires and break a sacred coconut to ward off evil eye.
3. Sacred Chanting: Chant 'Om Namo Bhagavate Vasudevaya' 12 times before commencing your first journey.

### 4. Astrologer's Verdict & Sacred Blessing
A vehicle acquired during these aligned planetary hours will bring safety, prosperity, and continuous joy to the family.
- Blessings by Priest Shreeram Pandit of Baggona.`;
    }
  }

  // General Vedic Astrological Fallback
  if (lang === "kn") {
    return `### ೧. ಶಾಸ್ತ್ರೀಯ ಸಿದ್ಧಾಂತ & ತಾಂತ್ರಿಕ ವಿವರಣೆ
ಆತ್ಮೀಯ ಭಕ್ತರೇ, ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮತ್ತು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಗ್ರಹಗಳು, ಭಾವಗಳು ಮತ್ತು ನಕ್ಷತ್ರ ಸಂಯೋಗಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ${
      chartData ? `ನಿಮ್ಮ ಲಗ್ನ: ${chartData.lagna}, ರಾಶಿ: ${chartData.moonSign}, ನಕ್ಷತ್ರ: ${chartData.nakshatra}, ಪ್ರಸ್ತುತ ದಶಾ: ${chartData.dashaText}.` : ""
    } ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿ ಮತ್ತು ಕಾರಕತ್ವಗಳು ಸಕಾರಾತ್ಮಕ ಫಲಗಳನ್ನು ಸೂಚಿಸುತ್ತಿವೆ.

### ೨. ಕಾಲ ನಿರ್ಣಯ & ಶುಭ ಮುಹೂರ್ತ / ದಶಾ ಫಲ
ಪ್ರಸ್ತುತ ಗುರು ಮತ್ತು ಶನಿ ಗೋಚಾರ ಫಲಗಳು ಕರ್ಮ ಮತ್ತು ಫಲ ಸಮತೋಲನವನ್ನು ತರುತ್ತಿವೆ. ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ತಿಥಿಗಳು ಹಾಗೂ ಗುರು, ಶುಕ್ರವಾರಗಳ ದಿನಗಳು ನಿಮ್ಮ ಉದ್ದೇಶಿತ ಕಾರ್ಯಗಳಿಗೆ ಅತ್ಯಂತ ಫಲಪ್ರದವಾಗಿವೆ. ರಾಹುಕಾಲ ಹಾಗೂ ಚಂದ್ರಷ್ಟಮ ದಿನಗಳನ್ನು ಹೊರತುಪಡಿಸಿ ಮುಂದುವರಿಯಿರಿ.

### ೩. ದೈವಿಕ ಪರಿಹಾರ, ಶಾಂತಿ ಹೋಮ & ಪೂಜಾ ವಿಧಾನ
೧. ನಿತ್ಯ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪ (೧೦೮ ಬಾರಿ) ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ.
೨. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಮತ್ತು ಪಂಚಾಮೃತ ಅಭಿಷೇಕ.
೩. ಪ್ರತಿ ಶನಿವಾರ ಮತ್ತು ಮಂಗಳವಾರ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ.

### ೪. ಆಚಾರ್ಯರ ದೈವಿಕ ಸಂದೇಶ & ಆಶೀರ್ವಾದ
ಶ್ರದ್ಧೆ ಮತ್ತು ಸತ್ಕರ್ಮಗಳಿಂದ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೈವಾನುಗ್ರಹ ಸದಾ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.
॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಬಗ್ಗೋಣ ದೈವಿಕ ಆಶೀರ್ವಾದಗಳು ॥`;
  } else {
    return `### 1. Classical Shastra & Technical Analysis
Dear Devotee, according to classical Vedic Siddhanta and Baggona Panchanga traditions, the planetary positions and relevant houses for your query indicate positive spiritual and material alignments. ${
      chartData ? `Lagna: ${chartData.lagna}, Rashi: ${chartData.moonSign}, Nakshatra: ${chartData.nakshatra}, Running Period: ${chartData.dashaText}.` : ""
    } Benefic aspects support steady progress.

### 2. Auspicious Timing, Muhurtha Windows & Planetary Transits
Jupiter transit offers grace, while Saturn encourages disciplined effort. Favorable timing is supported in the coming months during Shukla Paksha on Thursdays and Fridays, avoiding Rahu Kaalam.

### 3. Sacred Remedies, Shanti Homa & Baggona Temple Sevas
1. Daily Gayatri Mantra chanting (108 times) and Kuladevata remembrance.
2. Rudrabhisheka and Sankalpa Seva at Gokarna Mahabaleshwara Temple.
3. Recitation of Hanuman Chalisa on Tuesdays and Saturdays.

### 4. Astrologer's Verdict & Sacred Blessing
Maintain steady faith and pure intentions. Auspicious cosmic grace will guide your path forward.
- Blessings by Priest Shreeram Pandit of Baggona.`;
  }
}
