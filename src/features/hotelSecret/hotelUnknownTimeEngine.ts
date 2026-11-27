/**
 * HOTEL UNKNOWN / APPROXIMATE BIRTH-TIME & WALK-IN PRASHNA ENGINE (7 LANGUAGES)
 * ============================================================================
 * Strictly isolated enhancement for Hotel Table QR guests who:
 *  1) Know approximate birth window -> Solar-anchored 2-Tap Birth Time Rectification (BTR)
 *  2) Know Date + Place only -> Daily Lunar Stability Scan + Chandra Lagna + Surya Lagna + Sankhya Shastra
 *  3) Know neither Date nor Time -> Prashna Shastra (Udaya Lagna + 1-108 KP/Horary + Tajika Ithasala)
 *     + Chaldean Name Numerology + Optional Palm/Face Biometric Samudrika merge.
 *
 * ZERO impact on existing Exact Date + Time calculation pipelines.
 */

import { calculateKundli } from "../../core/KundliEngine";
import { calculateInstantPrashnaClock, type InstantPrashnaClock } from "../../core/instantPrashnaEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../../core/AstroTypes";
import { signLord } from "../../core/KundliInsightsEngine";
import { getFunctionalNature, type RashiIndex, type Planet } from "../../engine/jyotishPrecisionGates";

function getClassicalDignity(planet: Planet, rashiIdx: RashiIndex): "EXALTED" | "OWN" | "DEBILITATED" | "NEUTRAL" {
  const exalt: Partial<Record<Planet, number>> = {
    Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6
  };
  const debil: Partial<Record<Planet, number>> = {
    Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0
  };
  if (exalt[planet] === rashiIdx) return "EXALTED";
  if (debil[planet] === rashiIdx) return "DEBILITATED";
  if (String(signLord(rashiIdx)) === String(planet)) return "OWN";
  return "NEUTRAL";
}
import {
  calculateMulankFromDob,
  calculateBhagyankFromDob,
  calculateChaldeanNameNumber,
  calculatePythagoreanNameNumber,
  reduceToSingleDigit,
  NUMEROLOGY_GUIDANCE_MAP
} from "../sankhyashastra/sankhyaNumerologyUtils";
import {
  type SevenLang,
  pick7,
  RASHI_7L,
  GRAHA_7L,
  NAKSHATRA_7L,
  ELEMENT_NAMES_7L,
  toNativeDigits7L
} from "../../services/sampoornaMaster25Locale7L";
import { cleanEnglishFromRegionalText } from "../premiumPdf/premiumPdfLocale";
import { askGemini } from "../../core/GeminiEngine";

export type HotelBirthTimePrecision =
  | "exact"
  | "approx_window"
  | "date_only_chandra"
  | "no_dob_instant";

export type ApproxTimeWindowId =
  | "dawn_4_7"
  | "morning_7_11"
  | "midday_11_15"
  | "evening_15_19"
  | "night_19_23"
  | "midnight_23_4";

export type PrashnaQuestionDomain =
  | "career_wealth"
  | "marriage_partner"
  | "family_peace"
  | "health_vitality"
  | "urgent_decision";

export interface ApproxTimeWindowMeta {
  id: ApproxTimeWindowId;
  midpointTime: string;
  startHour: number;
  endHour: number;
  labels: Record<SevenLang, string>;
}

export const APPROX_TIME_WINDOWS: ApproxTimeWindowMeta[] = [
  {
    id: "dawn_4_7",
    midpointTime: "05:30",
    startHour: 4,
    endHour: 7,
    labels: {
      kn: "ಬ್ರಾಹ್ಮಿ / ಮುಂಜಾನೆ (4 AM – 7 AM)",
      en: "Early Dawn (4 AM – 7 AM)",
      hi: "भोर / प्रातःकाल (4 AM – 7 AM)",
      mr: "पहाट (4 AM – 7 AM)",
      te: "తెల్లవారుజాము (4 AM – 7 AM)",
      ta: "அதிகாலை (4 AM – 7 AM)",
      ml: "അതിരാവിലെ / ബ്രാഹ്മമുഹൂർത്തം (4–7 AM)"
    }
  },
  {
    id: "morning_7_11",
    midpointTime: "09:00",
    startHour: 7,
    endHour: 11,
    labels: {
      kn: "ಬೆಳಗ್ಗೆ (7 AM – 11 AM)",
      en: "Morning (7 AM – 11 AM)",
      hi: "सुबह (7 AM – 11 AM)",
      mr: "सकाळ (7 AM – 11 AM)",
      te: "ఉదయం (7 AM – 11 AM)",
      ta: "காலை (7 AM – 11 AM)",
      ml: "രാവിലെ (7 AM – 11 AM)"
    }
  },
  {
    id: "midday_11_15",
    midpointTime: "13:00",
    startHour: 11,
    endHour: 15,
    labels: {
      kn: "ಮಧ್ಯಾಹ್ನ (11 AM – 3 PM)",
      en: "Midday / Afternoon (11 AM – 3 PM)",
      hi: "दोपहर (11 AM – 3 PM)",
      mr: "दुपार (11 AM – 3 PM)",
      te: "మధ్యాహ్నం (11 AM – 3 PM)",
      ta: "மதியம் (11 AM – 3 PM)",
      ml: "ഉച്ചയ്ക്ക് (11 AM – 3 PM)"
    }
  },
  {
    id: "evening_15_19",
    midpointTime: "17:00",
    startHour: 15,
    endHour: 19,
    labels: {
      kn: "ಸಂಜೆ / ಸೂರ್ಯಾಸ್ತ (3 PM – 7 PM)",
      en: "Late Afternoon / Sunset (3 PM – 7 PM)",
      hi: "शाम / गोधूलि (3 PM – 7 PM)",
      mr: "सायंकाळ (3 PM – 7 PM)",
      te: "సాయంత్రం (3 PM – 7 PM)",
      ta: "மாலை (3 PM – 7 PM)",
      ml: "വൈകുന്നേരം (3 PM – 7 PM)"
    }
  },
  {
    id: "night_19_23",
    midpointTime: "21:00",
    startHour: 19,
    endHour: 23,
    labels: {
      kn: "ರಾತ್ರಿ (7 PM – 11 PM)",
      en: "Night (7 PM – 11 PM)",
      hi: "रात्रि (7 PM – 11 PM)",
      mr: "रात्र (7 PM – 11 PM)",
      te: "రాత్రి (7 PM – 11 PM)",
      ta: "இரவு (7 PM – 11 PM)",
      ml: "രാത്രി (7 PM – 11 PM)"
    }
  },
  {
    id: "midnight_23_4",
    midpointTime: "01:30",
    startHour: 23,
    endHour: 28,
    labels: {
      kn: "ಮಧ್ಯರಾತ್ರಿ (11 PM – 4 AM)",
      en: "Midnight / Late Night (11 PM – 4 AM)",
      hi: "मध्यरात्रि (11 PM – 4 AM)",
      mr: "मध्यरात्र (11 PM – 4 AM)",
      te: "అర్ధరాత్రి (11 PM – 4 AM)",
      ta: "நள்ளிரவு (11 PM – 4 AM)",
      ml: "അർദ്ധരാത്രി (11 PM – 4 AM)"
    }
  }
];

export interface LunarCandidateOption {
  sampleTime: string;
  moonRashiIdx: number;
  moonRashiName: string;
  moonNakIdx: number;
  moonNakName: string;
  elementKey: "fire" | "earth" | "air" | "water";
  traitCue: string;
}

export interface DailyLunarStabilityReport {
  hasMoonShift: boolean;
  isRashiConstant: boolean;
  isNakshatraConstant: boolean;
  transitionApproxHour?: string;
  earlyCandidate: LunarCandidateOption;
  lateCandidate: LunarCandidateOption;
  tieBreakerPrompt: string;
}

export interface BtrCandidate {
  sampleTime: string;
  lagnaRashiIdx: number;
  lagnaName: string;
  lagnaLord: PlanetName;
  lagnaLordName: string;
  lagnaLordHouse: number;
  elementKey: "fire" | "earth" | "air" | "water";
  elementLabel: string;
  pranapadaRashiName: string;
  kundaRashiName: string;
  tattvaLabel: string;
  tattvaGenderMatch: boolean;
  kundli: KundliOutput;
}

export interface BtrRectificationQuestion {
  q1Prompt: string;
  q1OptionA: string;
  q1OptionB: string;
  q2Prompt: string;
  q2OptionA: string;
  q2OptionB: string;
}

export interface BtrWindowResult {
  windowId: ApproxTimeWindowId;
  windowLabel: string;
  candidates: BtrCandidate[];
  requiresTwoTapTieBreak: boolean;
  questions?: BtrRectificationQuestion;
  defaultCandidate: BtrCandidate;
}

export interface ChandraSankhyaProfile {
  mulank: number;
  bhagyank: number;
  chaldeanCompound: number;
  chaldeanSingle: number;
  pythagoreanSingle: number;
  luckyNumbers: number[];
  luckyColor: string;
  luckyDay: string;
  rulingPlanet: string;
  coreStrengths: string;
  cautionPoint: string;
  suryaLagnaRashiIdx: number;
  suryaLagnaName: string;
}

export interface DeepPrashnaHoraryResult {
  questionDomain: PrashnaQuestionDomain;
  questionLabel: string;
  horaryNumber: number; // 1..108
  clock: InstantPrashnaClock;
  udayaLagnaIdx: number;
  udayaLagnaName: string;
  udayaLagnaLordName: string;
  seedLagnaIdx: number;
  seedLagnaName: string;
  seedNakshatraName: string;
  karyaBhava: number;
  karyaLordName: string;
  ithasalaHarmonyScore: number; // 35..98
  ithasalaType: "direct_sambandha" | "supportive_trine" | "patient_effort" | "delay_obstacle";
  tajikaYogaLabel: string;
  isMuthasilaExact: boolean;
  trisphutaRashiName: string;
  trisphutaNakshatraName: string;
  chatusphutaRashiName: string;
  chatraRashiName: string;
  panchaPakshiBird: string;
  panchaPakshiState: string;
  timingForecast: string;
  verdictTitle: string;
  verdictSummary: string;
  remedialAction: string;
  aiInsightParagraphs?: string[];
}

function getElementKeyFromRashi(rIdx: number): "fire" | "earth" | "air" | "water" {
  const m = ((rIdx % 4) + 4) % 4;
  if (m === 0) return "fire";
  if (m === 1) return "earth";
  if (m === 2) return "air";
  return "water";
}

function getElementTemperamentCue(elem: "fire" | "earth" | "air" | "water", lang: SevenLang): string {
  switch (elem) {
    case "fire":
      return pick7({
        kn: "ತಕ್ಷಣದ ನಿರ್ಧಾರ, ಧೈರ್ಯ, ಸ್ವಾಭಿಮಾನ & ಚುರುಕು ಸ್ವಭಾವ",
        en: "Decisive, bold initiative, proud self-respect & quick drive",
        hi: "तत्काल निर्णय, साहस, स्वाभिमान एवं तेज ऊर्जा",
        mr: "त्वरित निर्णय, धाडस, स्वाभिमान व वेगवान ऊर्जा",
        te: "వేగవంతమైన నిర్ణయాలు, ధైర్యం మరియు ఆత్మగౌరవం",
        ta: "துணிச்சல், உடனடி முடிவு மற்றும் சுயமரியாதை",
        ml: "വേഗത്തിലുള്ള തീരുമാനങ്ങൾ, ധൈര്യം, ആത്മാഭിമാനം"
      }, lang);
    case "earth":
      return pick7({
        kn: "ಪ್ರಾಯೋಗಿಕ ಚಿಂತನೆ, ತಾಳ್ಮೆ, ಭದ್ರತೆ & ಸ್ಥಿರ ಪ್ರಯತ್ನ",
        en: "Practical, patient builder, values material stability & detail",
        hi: "व्यावहारिक सोच, धैर्य, स्थिरता एवं सूक्ष्म योजना",
        mr: "व्यावहारिक दृष्टिकोन, संयम व भक्कम नियोजन",
        te: "ప్రాక్టికల్ ఆలోచన, సహనం మరియు స్థిరమైన ప్రయత్నం",
        ta: "நடைமுறை சிந்தனை, பொறுமை மற்றும் நிலையான உழைப்பு",
        ml: "പ്രായോഗിക ബുദ്ധി, ക്ഷമ, സ്ഥിരതയുള്ള ആസൂത്രണം"
      }, lang);
    case "air":
      return pick7({
        kn: "ವಾಕ್ಚಾತುರ್ಯ, ಕುತೂಹಲ, ಬುದ್ಧಿಶಕ್ತಿ & ಜನಸಂಪರ್ಕ",
        en: "Communicative, analytical curiosity, adaptable & socially sharp",
        hi: "वाक्पटुता, जिज्ञासा, तर्कशक्ति एवं सामाजिक संपर्क",
        mr: "बोलकेपणा, जिज्ञासा, तर्कबुद्धी व जनसंपर्क",
        te: "వాక్చాతుర్యం, జిజ్ఞాస మరియు లోతైన విశ్లేషణ",
        ta: "பேச்சுத்திறன், புத்திக்கூர்மை மற்றும் ஆய்வு மனப்பான்மை",
        ml: "സംഭാഷണ ചാതുര്യം, ജിജ്ഞാസ, ബുദ്ധിശക്തി"
      }, lang);
    case "water":
      return pick7({
        kn: "ಗಾಢ ಭಾವನೆ, ಅಂತಃಸ್ಫೂರ್ತಿ, ಕುಟುಂಬ ಪ್ರೀತಿ & ಕರುಣೆ",
        en: "Deep intuition, empathetic emotional memory & family devotion",
        hi: "गहन भावना, अंतर्ज्ञान, करुणा एवं पारिवारिक संवेदनशीलता",
        mr: "सखोल भावना, अंतर्ज्ञान व कुटुंबाविषयी माया",
        te: "లోతైన భావోద్వేగం, అంతర్దృష్టి మరియు కుటుంబ ఆప్యాయత",
        ta: "ஆழ்ந்த உணர்வு, உள்ளுணர்வு மற்றும் குடும்பப் பாசம்",
        ml: "ഗാഢമായ വികാരങ്ങൾ, ഉൾക്കാഴ്ച, കുടുംബസ്നേഹം"
      }, lang);
  }
}

function makeSampleKundli(base: Omit<KundliInput, "birthTime">, hhmm: string): KundliOutput {
  return calculateKundli({
    ...base,
    birthTime: hhmm
  });
}

function getMoonNakshatraIdx(k: KundliOutput): number {
  const mP = k.planets.find((p) => p.name === PlanetName.Moon);
  if (mP?.nakshatra?.index !== undefined) return mP.nakshatra.index;
  const deg = ((k.moonSign?.index ?? 0) * 30) + (mP?.degree ?? 15);
  return Math.floor(deg / 13.333333) % 27;
}

/**
 * 1. DAILY LUNAR BOUNDARY & EPHEMERIS STABILITY ENGINE
 *    Checks 00:15 -> 23:45 on the user's exact birth date to mathematically verify whether
 *    Moon Rashi / Nakshatra ever crossed a boundary that day.
 */
export function analyzeDailyLunarStability(
  birthDate: string,
  latitude: number,
  longitude: number,
  lang: SevenLang,
  pincode?: string,
  gender: "Male" | "Female" = "Male"
): DailyLunarStabilityReport {
  const baseInput: Omit<KundliInput, "birthTime"> = {
    name: "Native",
    birthDate,
    latitude,
    longitude,
    gender,
    pincode
  };

  const sampleTimes = ["00:15", "06:00", "12:00", "18:00", "23:45"];
  const samples = sampleTimes.map((t) => ({ t, k: makeSampleKundli(baseInput, t) }));

  const first = samples[0];
  const last = samples[samples.length - 1];

  const firstR = (((first.k.moonSign?.index ?? 0) % 12) + 12) % 12;
  const lastR = (((last.k.moonSign?.index ?? 0) % 12) + 12) % 12;
  const firstN = getMoonNakshatraIdx(first.k);
  const lastN = getMoonNakshatraIdx(last.k);

  const isRashiConstant = firstR === lastR;
  const isNakshatraConstant = firstN === lastN;
  const hasMoonShift = !isRashiConstant || !isNakshatraConstant;

  // Binary refine transition minute if shift occurred
  let transitionApproxHour: string | undefined;
  if (hasMoonShift) {
    let lowMin = 15;
    let highMin = 23 * 60 + 45;
    for (let i = 0; i < 8; i++) {
      const mid = Math.floor((lowMin + highMin) / 2);
      const hh = String(Math.floor(mid / 60)).padStart(2, "0");
      const mm = String(mid % 60).padStart(2, "0");
      const midK = makeSampleKundli(baseInput, `${hh}:${mm}`);
      const midR = (((midK.moonSign?.index ?? 0) % 12) + 12) % 12;
      const midN = getMoonNakshatraIdx(midK);
      if (midR === firstR && midN === firstN) {
        lowMin = mid;
      } else {
        highMin = mid;
      }
    }
    const hh = String(Math.floor(highMin / 60)).padStart(2, "0");
    const mm = String(highMin % 60).padStart(2, "0");
    transitionApproxHour = toNativeDigits7L(`${hh}:${mm}`, lang);
  }

  const earlyRashi = RASHI_7L[firstR]?.[lang] || RASHI_7L[0].en;
  const lateRashi = RASHI_7L[lastR]?.[lang] || RASHI_7L[0].en;
  const earlyNak = NAKSHATRA_7L[firstN]?.[lang] || NAKSHATRA_7L[0].en;
  const lateNak = NAKSHATRA_7L[lastN]?.[lang] || NAKSHATRA_7L[0].en;

  const earlyElem = getElementKeyFromRashi(firstR);
  const lateElem = getElementKeyFromRashi(lastR);

  const earlyCandidate: LunarCandidateOption = {
    sampleTime: "04:30",
    moonRashiIdx: firstR,
    moonRashiName: earlyRashi,
    moonNakIdx: firstN,
    moonNakName: earlyNak,
    elementKey: earlyElem,
    traitCue: getElementTemperamentCue(earlyElem, lang)
  };

  const lateCandidate: LunarCandidateOption = {
    sampleTime: "20:30",
    moonRashiIdx: lastR,
    moonRashiName: lateRashi,
    moonNakIdx: lastN,
    moonNakName: lateNak,
    elementKey: lateElem,
    traitCue: getElementTemperamentCue(lateElem, lang)
  };

  const tieBreakerPrompt = hasMoonShift
    ? pick7({
        kn: `ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕದಂದು ಚಂದ್ರನು ಸುಮಾರು ${transitionApproxHour} ಕ್ಕೆ ರಾಶಿ/ನಕ್ಷತ್ರ ಬದಲಾಯಿಸಿದ್ದಾನೆ. ೧೦೦% ನಿಖರ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ನಿಮ್ಮ ಸ್ವಭಾವ ಅಥವಾ ಅಂದಾಜು ಸಮಯ ಆರಿಸಿ:`,
        en: `The Moon shifted Nakshatra/Sign around ${transitionApproxHour} on your birth date. Select which matches better for 100% accuracy:`,
        hi: `आपकी जन्म तिथि को चंद्रमा ने लगभग ${transitionApproxHour} बजे राशि/नक्षत्र बदला। १००% सटीक फल हेतु सही विकल्प चुनें:`,
        mr: `तुमच्या जन्मदिनी चंद्राने सुमारे ${transitionApproxHour} वाजता राशी/नक्षत्र बदलले. १००% अचूक फलासाठी योग्य पर्याय निवडा:`,
        te: `మీ పుట్టిన తేదీన చంద్రుడు సుమారు ${transitionApproxHour} గంటలకు రాశి/నక్షత్రం మారాడు. 100% ఖచ్చితత్వం కోసం సరిపోయేదాన్ని ఎంచుకోండి:`,
        ta: `உங்கள் பிறந்த தேதியில் சந்திரன் சுமார் ${transitionApproxHour} மணிக்கு மாறியுள்ளது. 100% துல்லியத்திற்குப் பொருத்தமானதைத் தேர்ந்தெடுக்கவும்:`,
        ml: `നിങ്ങളുടെ ജനന തീയതിയിൽ ഏകദേശം ${transitionApproxHour}-ന് ചന്ദ്രൻ രാശി/നക്ഷത്രം മാറിയിട്ടുണ്ട്. 100% കൃത്യതയ്ക്കായി ഉചിതമായത് തിരഞ്ഞെടുക്കുക:`
      }, lang)
    : "";

  return {
    hasMoonShift,
    isRashiConstant,
    isNakshatraConstant,
    transitionApproxHour,
    earlyCandidate,
    lateCandidate,
    tieBreakerPrompt
  };
}

/**
 * 2. SOLAR-ANCHORED 2-TAP BIRTH TIME RECTIFICATION (BTR) FOR ROUGH WINDOW USERS
 */
const TATTVA_LABELS_7L: Array<{
  key: "prithvi" | "jala" | "agni" | "vayu" | "akasha";
  mins: number;
  maleFriendly: boolean;
  labels: Record<SevenLang, string>;
}> = [
  {
    key: "prithvi",
    mins: 6,
    maleFriendly: true,
    labels: { kn: "ಪೃಥ್ವಿ ತತ್ತ್ವ (ಭೂಮಿ)", en: "Prithvi Tattva (Earth)", hi: "पृथ्वी तत्त्व", mr: "पृथ्वी तत्त्व", te: "పృథ్వీ తత్త్వం", ta: "பிருத்வி தத்துவம்", ml: "പൃഥ്വി തത്ത്വം" }
  },
  {
    key: "jala",
    mins: 12,
    maleFriendly: false,
    labels: { kn: "ಜಲ ತತ್ತ್ವ (ನೀರು)", en: "Jala Tattva (Water)", hi: "जल तत्त्व", mr: "जल तत्त्व", te: "జల తత్త్వం", ta: "ஜல தத்துவம்", ml: "ജല തത്ത്വം" }
  },
  {
    key: "agni",
    mins: 18,
    maleFriendly: true,
    labels: { kn: "ಅಗ್ನಿ ತತ್ತ್ವ (ತೇಜಸ್ಸು)", en: "Agni Tattva (Fire)", hi: "अग्नि तत्त्व", mr: "अग्नि तत्त्व", te: "అగ్ని తత్త్వం", ta: "அக்னி தத்துவம்", ml: "അഗ്നി തത്ത്വം" }
  },
  {
    key: "vayu",
    mins: 24,
    maleFriendly: false,
    labels: { kn: "ವಾಯು ತತ್ತ್ವ (ಗಾಳಿ)", en: "Vayu Tattva (Air)", hi: "वायु तत्त्व", mr: "वायव्य तत्त्व", te: "వాయు తత్త్వం", ta: "வாயு தத்துவம்", ml: "വായു തത്ത്വം" }
  },
  {
    key: "akasha",
    mins: 30,
    maleFriendly: true,
    labels: { kn: "ಆಕಾಶ ತತ್ತ್ವ (ಚೇತನ)", en: "Akasha Tattva (Ether)", hi: "आकाश तत्त्व", mr: "आकाश तत्त्व", te: "ఆకాశ తత్త్వం", ta: "ஆகாச தத்துவம்", ml: "ஆകാശ തത്ത്വം" }
  }
];

function computeBtrPranapadaTattvaKundaMetrics(
  timeStr: string,
  k: KundliOutput,
  gender: "Male" | "Female",
  lang: SevenLang
): {
  pranapadaRashiName: string;
  kundaRashiName: string;
  tattvaLabel: string;
  tattvaGenderMatch: boolean;
} {
  const [hhStr, mmStr] = timeStr.split(":");
  const minsOfDay = (Number(hhStr) || 12) * 60 + (Number(mmStr) || 0);
  // Elapsed minutes from approximate 06:00 AM Sunrise
  const minsFromSunrise = ((minsOfDay - 360) + 1440) % 1440;
  // Classical Tattva Shodhana (6:12:18:24:30 min cycles summing to 90 mins)
  const mod90 = minsFromSunrise % 90;
  let acc = 0;
  let activeTattva = TATTVA_LABELS_7L[0];
  for (const t of TATTVA_LABELS_7L) {
    acc += t.mins;
    if (mod90 < acc) {
      activeTattva = t;
      break;
    }
  }
  const tattvaGenderMatch = gender === "Male" ? activeTattva.maleFriendly : !activeTattva.maleFriendly;

  // Pranapada Lagna (PPL): 1 Pala = 0.4 min -> palasFromSunrise = minsFromSunrise * 2.5
  const palasFromSunrise = minsFromSunrise * 2.5;
  const sunDeg = k.planets.find((p) => p.name === PlanetName.Sun)?.degree ?? ((k.sunSign?.index ?? 0) * 30 + 15);
  const sunSign = Math.floor(((sunDeg % 360) + 360) % 360 / 30);
  const modalityOffset = sunSign % 3 === 0 ? 0 : sunSign % 3 === 1 ? 240 : 120; // Movable->Sun, Fixed->9th, Dual->5th
  const pranapadaDeg = (sunDeg + modalityOffset + (palasFromSunrise * 2)) % 360;
  const pranapadaRashiIdx = Math.floor(((pranapadaDeg % 360) + 360) % 360 / 30) % 12;

  // Kunda Lagna: (Lagna Longitude * 81) % 360
  const lagnaDeg = typeof k.ascendant === "number" ? k.ascendant : ((k.lagnaRashi?.index ?? 0) * 30 + 15);
  const kundaDeg = (lagnaDeg * 81) % 360;
  const kundaRashiIdx = Math.floor(((kundaDeg % 360) + 360) % 360 / 30) % 12;

  return {
    pranapadaRashiName: RASHI_7L[pranapadaRashiIdx]?.[lang] || RASHI_7L[0].en,
    kundaRashiName: RASHI_7L[kundaRashiIdx]?.[lang] || RASHI_7L[0].en,
    tattvaLabel: activeTattva.labels[lang] || activeTattva.labels.en,
    tattvaGenderMatch
  };
}

export function buildBtrWindowCandidates(
  birthDate: string,
  windowId: ApproxTimeWindowId,
  latitude: number,
  longitude: number,
  lang: SevenLang,
  pincode?: string,
  gender: "Male" | "Female" = "Male"
): BtrWindowResult {
  const win = APPROX_TIME_WINDOWS.find((w) => w.id === windowId) || APPROX_TIME_WINDOWS[1];
  const baseInput: Omit<KundliInput, "birthTime"> = {
    name: "Native",
    birthDate,
    latitude,
    longitude,
    gender,
    pincode
  };

  // Sample every 15 mins inside window so Tattva Shodhana + Pranapada can select the finest minute per Lagna
  const rawSamples: Array<{ timeStr: string; k: KundliOutput; lagnaIdx: number }> = [];
  for (let h = win.startHour + 0.25; h < win.endHour; h += 0.25) {
    const wrappedH = h >= 24 ? h - 24 : h;
    const hh = String(Math.floor(wrappedH)).padStart(2, "0");
    const mm = String(Math.round((wrappedH - Math.floor(wrappedH)) * 60) % 60).padStart(2, "0");
    const timeStr = `${hh}:${mm}`;
    const k = makeSampleKundli(baseInput, timeStr);
    const lIdx = (((k.lagnaRashi?.index ?? 0) % 12) + 12) % 12;
    rawSamples.push({ timeStr, k, lagnaIdx: lIdx });
  }

  // Deduplicate by Lagna Rashi index picking the best Tattva-gender matched sample closest to midpoint
  const groupedByLagna = new Map<number, typeof rawSamples>();
  for (const s of rawSamples) {
    const arr = groupedByLagna.get(s.lagnaIdx) || [];
    arr.push(s);
    groupedByLagna.set(s.lagnaIdx, arr);
  }

  const candidates: BtrCandidate[] = [];
  for (const [lIdx, items] of groupedByLagna.entries()) {
    const midIdx = Math.floor(items.length / 2);
    let chosen = items[midIdx];
    let chosenMetrics = computeBtrPranapadaTattvaKundaMetrics(chosen.timeStr, chosen.k, gender, lang);
    // Prefer a sample near midpoint whose Tattva strictly satisfies gender alignment (Tattva Shodhana)
    for (let offset = 0; offset < items.length; offset++) {
      const idx = midIdx + (offset % 2 === 0 ? Math.floor(offset / 2) : -Math.ceil(offset / 2));
      if (idx >= 0 && idx < items.length) {
        const candidateSample = items[idx];
        const m = computeBtrPranapadaTattvaKundaMetrics(candidateSample.timeStr, candidateSample.k, gender, lang);
        if (m.tattvaGenderMatch) {
          chosen = candidateSample;
          chosenMetrics = m;
          break;
        }
      }
    }

    const rIdx = lIdx as RashiIndex;
    const lordG = signLord(rIdx);
    const lordP = chosen.k.planets.find((p) => p.name === lordG);
    const placedHouse = lordP ? (((lordP.rashi.index - lIdx + 12) % 12) + 1) : 1;
    const elemKey = getElementKeyFromRashi(lIdx);
    candidates.push({
      sampleTime: chosen.timeStr,
      lagnaRashiIdx: lIdx,
      lagnaName: RASHI_7L[lIdx]?.[lang] || RASHI_7L[0].en,
      lagnaLord: lordG,
      lagnaLordName: GRAHA_7L[lordG]?.[lang] || String(lordG),
      lagnaLordHouse: placedHouse,
      elementKey: elemKey,
      elementLabel: ELEMENT_NAMES_7L[elemKey]?.[lang] || elemKey,
      pranapadaRashiName: chosenMetrics.pranapadaRashiName,
      kundaRashiName: chosenMetrics.kundaRashiName,
      tattvaLabel: chosenMetrics.tattvaLabel,
      tattvaGenderMatch: chosenMetrics.tattvaGenderMatch,
      kundli: chosen.k
    });
  }

  const defaultCandidate = candidates[Math.floor(candidates.length / 2)] || candidates[0];
  const requiresTwoTapTieBreak = candidates.length >= 2;
  let questions: BtrRectificationQuestion | undefined;

  if (requiresTwoTapTieBreak) {
    const cA = candidates[0];
    const cB = candidates[candidates.length - 1];
    const focusA = getBtrBhavaFocusLabel(cA.lagnaLordHouse, lang);
    const focusB = getBtrBhavaFocusLabel(cB.lagnaLordHouse, lang);

    questions = {
      q1Prompt: pick7({
        kn: "೧. ಜನರು ನಿಮ್ಮನ್ನು ಮೊದಲ ಭೇಟಿಯಲ್ಲಿ ಹೇಗೆ ಗುರುತಿಸುತ್ತಾರೆ?",
        en: "1. Which first impression describes you more naturally?",
        hi: "१. पहली मुलाकात में लोग आपके स्वभाव को कैसा महसूस करते हैं?",
        mr: "१. पहिल्या भेटीत लोकांना तुमचा स्वभाव कसा जाणवतो?",
        te: "1. మొదటి పరిచయంలో ప్రజలు మీ స్వభావాన్ని ఎలా గుర్తిస్తారు?",
        ta: "1. முதல் சந்திப்பில் உங்கள் இயல்பை மற்றவர்கள் எப்படிப் பார்க்கிறார்கள்?",
        ml: "1. ആദ്യ കൂടിക്കാഴ്ചയിൽ ആളുകൾ നിങ്ങളുടെ സ്വഭാവം എങ്ങനെ കാണുന്നു?"
      }, lang),
      q1OptionA: `${cA.lagnaName} (${getElementTemperamentCue(cA.elementKey, lang)})`,
      q1OptionB: `${cB.lagnaName} (${getElementTemperamentCue(cB.elementKey, lang)})`,
      q2Prompt: pick7({
        kn: "೨. ಕಳೆದ ೨–೩ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಮುಖ ಆಲೋಚನೆ ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿದೆ?",
        en: "2. Over the last 2–3 years, where did your main life focus gather?",
        hi: "२. पिछले २–३ वर्षों में आपके जीवन का मुख्य ध्यान किस क्षेत्र पर रहा है?",
        mr: "२. गेल्या २–३ वर्षांत तुमच्या आयुष्याचे मुख्य लक्ष कोणत्या क्षेत्रावर आहे?",
        te: "2. గత 2–3 సంవత్సరాలుగా మీ ప్రధాన దృష్టి ఏ రంగంపై ఉంది?",
        ta: "2. கடந்த 2–3 ஆண்டுகளில் உங்கள் முக்கிய கவனம் எந்தத் துறையில் இருந்தது?",
        ml: "2. കഴിഞ്ഞ 2–3 വർഷങ്ങളിൽ നിങ്ങളുടെ പ്രധാന ശ്രദ്ധ ഏത് മേഖലയിലായിരുന്നു?"
      }, lang),
      q2OptionA: focusA,
      q2OptionB: focusB
    };
  }

  return {
    windowId,
    windowLabel: win.labels[lang] || win.labels.en,
    candidates,
    requiresTwoTapTieBreak,
    questions,
    defaultCandidate
  };
}

function getBtrBhavaFocusLabel(house: number, lang: SevenLang): string {
  if ([1, 5, 9].includes(house)) {
    return pick7({
      kn: "ಸ್ವಂತ ಗುರುತು, ವಿದ್ಯೆ, ಮಕ್ಕಳ ಪ್ರಗತಿ ಅಥವಾ ದೈವಿಕ ಪಥ",
      en: "Self-reinvention, learning, creative authority, or higher dharma",
      hi: "स्व-विकास, ज्ञान, संतान या भाग्य निर्माण",
      mr: "स्व-विकास, शिक्षण, मुले किंवा भाग्योदय",
      te: "ఆత్మవిశ్వాసం, విద్య లేదా సంతాన/భాగ్య వృద్ధి",
      ta: "சுய வளர்ச்சி, கல்வி, குழந்தைகள் அல்லது பாக்கியம்",
      ml: "വ്യക്തിഗത വളർച്ച, വിദ്യാഭ്യാസം, ഭാഗ്യോദയം"
    }, lang);
  }
  if ([4, 7, 10].includes(house)) {
    return pick7({
      kn: "ವೃತ್ತಿ ಪ್ರಗತಿ, ಕುಟುಂಬ ಜವಾಬ್ದಾರಿ, ಮನೆ ಅಥವಾ ಪಾಲುದಾರಿಕೆ",
      en: "Career elevation, home stability, property, or key partnership",
      hi: "करियर, घर-परिवार, संपत्ति या मुख्य साझेदारी",
      mr: "करिअर, घर-जमीन किंवा कुटुंब/भागीदारी",
      te: "వృత్తి, గృహ సౌఖ్యం, ఆస్తి లేదా భాగస్వామ్యం",
      ta: "தொழில் உயர்வு, வீடு-குடும்பம் அல்லது கூட்டாண்மை",
      ml: "തൊഴിൽ പുരോഗതി, വീട്-കുടുംബം, പങ്കാളിത്തം"
    }, lang);
  }
  return pick7({
    kn: "ಆರ್ಥಿಕ ನಿಧಿ ಸಂಚಯ, ಶ್ರಮದ ಲಾಭ ಹಾಗೂ ಆಂತರಿಕ ಪರಿವರ್ತನೆ",
    en: "Wealth discipline, behind-the-scenes effort, or deep transformation",
    hi: "धन संचय, गुप्त परिश्रम एवं जीवन परिवर्तन",
    mr: "धन संचय, परिश्रम व आंतरिक परिवर्तन",
    te: "ధన సంచయం, శ్రమ ద్వారా లాభం మరియు మార్పు",
    ta: "பொருளாதார சேமிப்பு, கடின உழைப்பு மற்றும் மாற்றம்",
    ml: "സാമ്പത്തിക അച്ചടക്കം, കഠിനാധ്വാനം, ആന്തരിക മാറ്റം"
  }, lang);
}

export function resolveBtrSelection(
  btrResult: BtrWindowResult,
  q1Choice: "A" | "B",
  q2Choice: "A" | "B"
): { selected: BtrCandidate; confidencePct: number } {
  const list = btrResult.candidates;
  if (list.length <= 1) {
    return { selected: btrResult.defaultCandidate, confidencePct: 92 };
  }
  const cA = list[0];
  const cB = list[list.length - 1];
  const scoreA = (q1Choice === "A" ? 2 : 0) + (q2Choice === "A" ? 1 : 0);
  const scoreB = (q1Choice === "B" ? 2 : 0) + (q2Choice === "B" ? 1 : 0);
  if (scoreA >= scoreB) {
    return { selected: cA, confidencePct: scoreA === 3 ? 91 : 83 };
  }
  return { selected: cB, confidencePct: scoreB === 3 ? 91 : 83 };
}

/**
 * 3. CHANDRA-SURYA-SANKHYA DUAL NUMEROLOGY + ASTROLOGY SNAPSHOT
 */
export function buildChandraSankhyaProfile(
  fullName: string,
  birthDate: string,
  kundli: KundliOutput,
  lang: SevenLang
): ChandraSankhyaProfile {
  const mulank = calculateMulankFromDob(birthDate);
  const bhagyank = calculateBhagyankFromDob(birthDate);
  const chaldean = calculateChaldeanNameNumber(fullName || "Devotee");
  const pythag = calculatePythagoreanNameNumber(fullName || "Devotee");

  const guidance = NUMEROLOGY_GUIDANCE_MAP[mulank] || NUMEROLOGY_GUIDANCE_MAP[1];
  const sunP = kundli.planets.find((p) => p.name === PlanetName.Sun) || kundli.planets[0];
  const suryaIdx = (((sunP.rashi?.index ?? 0) % 12) + 12) % 12;

  const rawPlanet = String(guidance.rulerEn || "Sun").split("(")[0].trim().replace(/[^A-Za-z]/g, "");
  const planetLocalized = GRAHA_7L[rawPlanet]?.[lang] || (lang === "kn" ? guidance.rulerKn : guidance.rulerEn);

  // Compute harmonic friendly numbers safely
  const rawFriendly = [mulank, bhagyank, chaldean.single, reduceToSingleDigit(mulank + bhagyank)];
  const luckyNumbers = Array.from(new Set(rawFriendly.filter((x) => x >= 1 && x <= 9)));

  const colorMap: Record<number, Record<SevenLang, string>> = {
    1: { kn: "ಕೇಸರಿ-ಬಂಗಾರ", en: "Saffron Gold", hi: "सुनहरा केसरिया", mr: "केशरी सोनेरी", te: "బంగారు కాషాయం", ta: "தங்கக் காவி", ml: "സ്വർണ്ണ കാവി" },
    2: { kn: "ಶುದ್ಧ ಬಿಳಿ / ಬೆಳ್ಳಿ", en: "Pearl White", hi: "मोती सफेद", mr: "शुभ्र पांढरा", te: "ముత్యపు తెలుపు", ta: "முத்து வெள்ளை", ml: "മുത്തു വെള്ള" },
    3: { kn: "ಹಳದಿ / ಪೀತಾಂಬರ", en: "Sacred Yellow", hi: "पीताम्बर पीला", mr: "पिवळा", te: "పసుపు వర్ణం", ta: "மஞ்சள்", ml: "മഞ്ഞ" },
    4: { kn: "ನೀಲಿ / ಬೂದು", en: "Electric Blue", hi: "नीला-धूसर", mr: "निळा", te: "నీలం", ta: "நீலம்", ml: "നീല" },
    5: { kn: "ಹಸಿರು / ಮರಕತ", en: "Emerald Green", hi: "पन्ना हरा", mr: "हिरवा", te: "పచ్చ వర్ణం", ta: "பச்சை", ml: "മരതക പച്ച" },
    6: { kn: "ಗುಲಾಬಿ / ಶ್ವೇತ", en: "Lotus Pink & White", hi: "गुलाबी-श्वेत", mr: "गुलाबी-पांढरा", te: "గులాబీ తెలుపు", ta: "இளஞ்சிவப்பு", ml: "ഇളം റോസ്-വെള്ള" },
    7: { kn: "ತಿಳಿ ಹಳದಿ / ಚಂದನ", en: "Sandalwood & Soft Gold", hi: "चंदन पीत", mr: "चंदनी", te: "గంధపు వర్ణం", ta: "சந்தன நிறம்", ml: "ചന്ദന നിറം" },
    8: { kn: "ಕಡು ನೀಲಿ / ನೇರಳೆ", en: "Deep Sapphire", hi: "गहरा नीला", mr: "गडद निळा", te: "ముదురు నీలం", ta: "கருநீலம்", ml: "കടും നീല" },
    9: { kn: "ಕುಂಕುಮ ಕೆಂಪು", en: "Vermilion Coral", hi: "सिंदूरी लाल", mr: "शेंदरी लाल", te: "కుంకుమ ఎరుపు", ta: "குங்குமச் சிவப்பு", ml: "കുങ്കുമ ചുവപ്പ്" }
  };

  const weekdayByMulank: Record<number, Record<SevenLang, string>> = {
    1: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", mr: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு", ml: "ഞായറാഴ്ച" },
    2: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", mr: "सोमवार", te: "సోమవారం", ta: "திங்கள்", ml: "തിങ്കളാഴ്ച" },
    3: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", mr: "गुरुवार", te: "గురువారం", ta: "வியாழன்", ml: "വ്യാഴാഴ്ച" },
    4: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", mr: "शनिवार", te: "శనివారం", ta: "சனி", ml: "ശനിയാഴ്ച" },
    5: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", mr: "बुधवार", te: "బుధవారం", ta: "புதன்", ml: "ബുധനാഴ്ച" },
    6: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", mr: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி", ml: "വെള്ളിയാഴ്ച" },
    7: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", mr: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு", ml: "ഞായറാഴ്ച" },
    8: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", mr: "शनिवार", te: "శనివారం", ta: "சனி", ml: "ശനിയാഴ്ച" },
    9: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", mr: "मंगळवार", te: "మంగళవారం", ta: "செவ்வாய்", ml: "ചൊവ്വാഴ്ച" }
  };

  const traitsLocalized = cleanEnglishFromRegionalText(
    lang === "kn"
      ? guidance.traitsKn
      : lang === "en"
        ? guidance.traitsEn
        : `${planetLocalized} • ${weekdayByMulank[mulank]?.[lang] || ""} • ${colorMap[mulank]?.[lang] || ""}`,
    lang
  );

  const deityLocalized = lang === "kn" ? guidance.deityKn : lang === "en" ? guidance.deityEn : planetLocalized;

  return {
    mulank,
    bhagyank,
    chaldeanCompound: chaldean.compound,
    chaldeanSingle: chaldean.single,
    pythagoreanSingle: pythag.single,
    luckyNumbers,
    luckyColor: colorMap[mulank]?.[lang] || (lang === "kn" ? guidance.luckyColorsKn : guidance.luckyColorsEn),
    luckyDay: weekdayByMulank[mulank]?.[lang] || weekdayByMulank[1].en,
    rulingPlanet: planetLocalized,
    coreStrengths: traitsLocalized,
    cautionPoint: deityLocalized,
    suryaLagnaRashiIdx: suryaIdx,
    suryaLagnaName: RASHI_7L[suryaIdx]?.[lang] || RASHI_7L[0].en
  };
}

/**
 * 4. CLASSICAL PRASHNA SHASTRA + KP 1–108 HORARY + TAJIKA ITHASALA ENGINE (NO DOB NEEDED)
 */
const DOMAIN_META: Record<PrashnaQuestionDomain, { bhava: number; karaka: Planet; labels: Record<SevenLang, string> }> = {
  career_wealth: {
    bhava: 10,
    karaka: "Jupiter",
    labels: {
      kn: "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ & ಧನ ಲಾಭ",
      en: "Career, Business & Financial Gain",
      hi: "करियर, व्यापार एवं धन लाभ",
      mr: "करिअर, व्यवसाय व आर्थिक लाभ",
      te: "ఉద్యోగం, వ్యాపారం & ధన లాభం",
      ta: "தொழில், வியாபாரம் & பண வரவு",
      ml: "തൊഴിൽ, ബിസിനസ്സ് & ധനലാഭം"
    }
  },
  marriage_partner: {
    bhava: 7,
    karaka: "Venus",
    labels: {
      kn: "ವಿವಾಹ, ದಾಂಪತ್ಯ & ಪಾಲುದಾರಿಕೆ",
      en: "Marriage, Relationship & Partnership",
      hi: "विवाह, प्रेम एवं जीवनसाथी",
      mr: "विवाह, नातेसंबंध व जोडीदार",
      te: "వివాహం, ప్రేమ & భాగస్వామ్యం",
      ta: "திருமணம், உறவு & துணை",
      ml: "വിവാഹം, പ്രണയം & ദാമ്പത്യം"
    }
  },
  family_peace: {
    bhava: 4,
    karaka: "Moon",
    labels: {
      kn: "ಕುಟುಂಬ ನೆಮ್ಮದಿ, ಮನೆ & ಜಮೀನು",
      en: "Family Harmony, Home & Property",
      hi: "पारिवारिक सुख, घर एवं संपत्ति",
      mr: "कौटुंबिक शांतता, घर व मालमत्ता",
      te: "కుటుంబ ప్రశాంతత, ఇల్లు & ఆస్తి",
      ta: "குடும்ப அமைதி, வீடு & சொத்து",
      ml: "കുടുംബ സമാധാനം, വീട് & സ്വത്ത്"
    }
  },
  health_vitality: {
    bhava: 6,
    karaka: "Sun",
    labels: {
      kn: "ಆರೋಗ್ಯ ಚೇತರಿಕೆ & ಮಾನಸಿಕ ಶಕ್ತಿ",
      en: "Health Recovery & Vitality",
      hi: "स्वास्थ्य सुधार एवं मानसिक शांति",
      mr: "आरोग्य सुधारणा व मानसिक बळ",
      te: "ఆరోగ్య మెరుగుదల & మనశ్శాంతి",
      ta: "உடல்நல மேன்மை & மன அமைதி",
      ml: "ആരോഗ്യ പുരോഗതി & മാനസിക ശക്തി"
    }
  },
  urgent_decision: {
    bhava: 11,
    karaka: "Jupiter",
    labels: {
      kn: "ತಕ್ಷಣದ ನಿರ್ಧಾರ / ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ (ಹೌದು / ತಡೆ?)",
      en: "Urgent Decision / Fulfillment (Yes or Wait?)",
      hi: "त्वरित निर्णय / मनोकामना सिद्धि",
      mr: "तातडीचा निर्णय / मनोकामना सिद्धी",
      te: "తక్షణ నిర్ణయం / కోరిక నెరవేరుతుందా?",
      ta: "உடனடி முடிவு / எண்ணிய காரிய சித்தி",
      ml: "അടിയന്തര തീരുമാനം / ആഗ്രഹ സാഫല്യം"
    }
  }
};

export function getPrashnaDomainOptions(lang: SevenLang): Array<{ id: PrashnaQuestionDomain; label: string }> {
  return (Object.keys(DOMAIN_META) as PrashnaQuestionDomain[]).map((id) => ({
    id,
    label: DOMAIN_META[id].labels[lang] || DOMAIN_META[id].labels.en
  }));
}

export function computeDeepPrashnaHoraryReading(params: {
  devoteeName: string;
  questionDomain: PrashnaQuestionDomain;
  horaryNumber: number; // 1..108
  latitude: number;
  longitude: number;
  lang: SevenLang;
  pincode?: string;
  now?: Date;
}): DeepPrashnaHoraryResult {
  const {
    devoteeName,
    questionDomain,
    latitude,
    longitude,
    lang,
    pincode,
    now = new Date()
  } = params;

  const cleanNum = Math.max(1, Math.min(108, Math.round(params.horaryNumber || 27)));
  const yyyy = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");

  // 1. Live Udaya Lagna at the exact Table Scan moment
  const prashnaKundli = calculateKundli({
    name: devoteeName || "Guest",
    birthDate: `${yyyy}-${mo}-${dd}`,
    birthTime: `${hh}:${mm}`,
    latitude,
    longitude,
    pincode,
    gender: "Male"
  });

  const udayaLagnaIdx = (((prashnaKundli.lagnaRashi?.index ?? 0) % 12) + 12) % 12;
  const udayaLordPlanet = signLord(udayaLagnaIdx as RashiIndex);
  const seedZero = cleanNum - 1; // 0..107
  const seedLagnaIdx = Math.floor(seedZero / 9) % 12; // Exact 108 Pada-to-12 Rashi Wheel!
  const seedNakIdx = Math.floor(seedZero / 4) % 27;

  // 2. Karya Bhava & Karaka Strength
  const dom = DOMAIN_META[questionDomain] || DOMAIN_META.urgent_decision;
  const karyaRashiIdx = ((udayaLagnaIdx + dom.bhava - 1) % 12) as RashiIndex;
  const karyaLordPlanet = signLord(karyaRashiIdx);

  const prashnaMoonIdx = (((prashnaKundli.moonSign?.index ?? 0) % 12) + 12) % 12;
  const clock = calculateInstantPrashnaClock(prashnaMoonIdx, now, latitude, longitude);

  const udayaLordPos = prashnaKundli.planets.find((p) => p.name === udayaLordPlanet);
  const karyaLordPos = prashnaKundli.planets.find((p) => p.name === karyaLordPlanet);
  const uLordR = (((udayaLordPos?.rashi.index ?? udayaLagnaIdx) % 12) + 12) % 12;
  const kLordR = (((karyaLordPos?.rashi.index ?? karyaRashiIdx) % 12) + 12) % 12;

  // Tajika Ithasala / Bhava Sambandha Distance (Udaya Lagna Lord -> Karya Lord)
  const mutualBhava = (((kLordR - uLordR + 12) % 12) + 1);
  const uLordHouseFromUdaya = (((uLordR - udayaLagnaIdx + 12) % 12) + 1);
  const kLordHouseFromUdaya = (((kLordR - udayaLagnaIdx + 12) + 12) % 12) + 1;
  const seedHarmonyHouse = (((seedLagnaIdx - udayaLagnaIdx + 12) % 12) + 1);

  const karyaDignity = getClassicalDignity(karyaLordPlanet as Planet, kLordR as RashiIndex);
  const fnNature = getFunctionalNature(udayaLagnaIdx as RashiIndex, dom.karaka);

  let score = 62;
  if ([1, 3, 4, 5, 7, 9, 10, 11].includes(mutualBhava)) score += 16;
  else if ([6, 8, 12].includes(mutualBhava)) score -= 12;

  if ([1, 4, 5, 7, 9, 10, 11].includes(kLordHouseFromUdaya)) score += 10;
  if ([1, 4, 5, 7, 9, 11].includes(seedHarmonyHouse)) score += 6;
  if (karyaDignity === "EXALTED" || karyaDignity === "OWN") score += 12;
  else if (karyaDignity === "DEBILITATED") score -= 12;
  if (clock.choghadiyaQuality === "auspicious" || clock.choghadiyaQuality === "gainful") score += 6;
  if (clock.isRahuKalamActive) score -= 8;
  if (fnNature === "YOGAKARAKA" || fnNature === "BENEFIC") score += 4;
  score = Math.max(38, Math.min(97, score));

  let ithasalaType: DeepPrashnaHoraryResult["ithasalaType"] = "supportive_trine";
  if ([1, 7, 10].includes(mutualBhava)) ithasalaType = "direct_sambandha";
  else if ([5, 9, 11].includes(mutualBhava)) ithasalaType = "supportive_trine";
  else if ([2, 3, 4].includes(mutualBhava)) ithasalaType = "patient_effort";
  else ithasalaType = "delay_obstacle";

  // Classical Kerala Prashna Sphuta Matrix & Pancha Pakshi Biorhythm
  const udayaDeg = typeof prashnaKundli.ascendant === "number" ? prashnaKundli.ascendant : udayaLagnaIdx * 30 + 15;
  const moonDeg = prashnaKundli.planets.find((p) => p.name === PlanetName.Moon)?.degree ?? prashnaMoonIdx * 30 + 15;
  const sunDeg = prashnaKundli.planets.find((p) => p.name === PlanetName.Sun)?.degree ?? 0;
  const gulikaDeg = (prashnaKundli as any).maandi?.degree ?? ((((udayaLagnaIdx + 6) % 12) * 30) + 15);
  const trisphutaDeg = ((udayaDeg + moonDeg + gulikaDeg) % 360 + 360) % 360;
  const chatusphutaDeg = ((trisphutaDeg + sunDeg) % 360 + 360) % 360;
  const trisphutaRashiIdx = Math.floor(trisphutaDeg / 30) % 12;
  const trisphutaNakIdx = Math.floor(trisphutaDeg / (360 / 27)) % 27;
  const chatusphutaRashiIdx = Math.floor(chatusphutaDeg / 30) % 12;
  const sunRashiIdx = Math.floor((((sunDeg % 360) + 360) % 360) / 30) % 12;
  const chatraRashiIdx = ((udayaLagnaIdx + ((seedLagnaIdx - sunRashiIdx + 12) % 12)) % 12);

  // Tajika Muthasila (partile orb <= 5° between Udaya Lord and Karya Lord degree-in-sign)
  const uDegInSign = ((udayaLordPos?.degree ?? 15) % 30 + 30) % 30;
  const kDegInSign = ((karyaLordPos?.degree ?? 15) % 30 + 30) % 30;
  const isMuthasilaExact = [1, 3, 5, 7, 9, 10, 11].includes(mutualBhava) && Math.abs(uDegInSign - kDegInSign) <= 5;
  if (isMuthasilaExact) score = Math.min(98, score + 4);

  const tajikaYogaLabel = isMuthasilaExact
    ? pick7({ kn: "ಪೂರ್ಣ ಮುತಸಿಲ ಇತ್ಥಸಾಲ ಯೋಗ (ಶೀಘ್ರ ಸಿದ್ಧಿ)", en: "Muthasila Partile Ithasala Yoga (Immediate)", hi: "पूर्ण मुतसिल इत्थसाल योग (शीघ्र सिद्धि)", mr: "पूर्ण मुतसिल इत्थसाल योग (तातडीने सिद्धी)", te: "పూర్ణ ముతసిల ఇత్థసాల యోగం", ta: "முழு முத்தசில இத்தசால யோகம்", ml: "പൂർണ്ണ മുതസില ഇത്ഥസാല യോഗം" }, lang)
    : ithasalaType === "direct_sambandha" || ithasalaType === "supportive_trine"
      ? pick7({ kn: "ಶುಭ ತಾಜಿಕ ಇತ್ಥಸಾಲ ಯೋಗ", en: "Auspicious Tajika Ithasala Yoga", hi: "शुभ ताजिक इत्थसाल योग", mr: "शुभ ताजिक इत्थसाल योग", te: "శుభ తాజిక ఇత్థసాల యోగం", ta: "சுப தாஜிக இத்தசால யோகம்", ml: "ശുഭ താജിക ഇത്ഥസാല യോഗം" }, lang)
      : ithasalaType === "patient_effort"
        ? pick7({ kn: "ಶ್ರಮ-ಸಹಿತ ನಕ್ತ ಯೋಗ (ತಾಳ್ಮೆ)", en: "Nakta / Effort-Backed Yoga", hi: "नक्त / प्रयास-साध्य योग", mr: "नक्त / प्रयत्न-साध्य योग", te: "నక్త / ప్రయత్న యోగం", ta: "நக்த / முயற்சி யோகம்", ml: "നക്ത / പരിശ്രമ യോഗം" }, lang)
        : pick7({ kn: "ಇಸರಫ ವಿಳಂಬ ಯೋಗ (ಎಚ್ಚರಿಕೆ)", en: "Isarapha Separation Signal (Wait)", hi: "इसरफ विलंब योग (प्रतीक्षा)", mr: "इसरफ विलंब योग (प्रतीक्षा)", te: "ఇసరఫ ఆలస్య యోగం", ta: "இசரப தாமத யோகம்", ml: "ഇസരഫ കാലതാമസ യോഗം" }, lang);

  // Pancha Pakshi Shastra Bird & Current 5-Yaama State
  const birdIndex = Math.floor(seedNakIdx / 6) % 5; // 5 Tamil Siddha Pakshis
  const pakshiBirds: Array<Record<SevenLang, string>> = [
    { kn: "ಗರುಡ (ಭೇರುಂಡ / Vulture)", en: "Vulture (Vallooru)", hi: "गरुड़ / वल्लूरु पक्षी", mr: "गरुड / वल्लूरू पक्षी", te: "గరుడ పక్షి", ta: "வல்லூறு பட்சி", ml: "വല്ലൂറു പക്ഷി" },
    { kn: "ಗೂಬೆ (ಉಲೂಕ / Owl)", en: "Owl (Aanthai)", hi: "उलूक / आंथै पक्षी", mr: "उलूक / आंथै पक्षी", te: "ఉలూక పక్షి", ta: "ஆந்தை பட்சி", ml: "ആന്ത പക്ഷി" },
    { kn: "ಕಾಗೆ (ಕಾಕ / Crow)", en: "Crow (Kagam)", hi: "काक / कागम पक्षी", mr: "काक / कागम पक्षी", te: "కాక పక్షి", ta: "காகம் பட்சி", ml: "കാകം പക്ഷി" },
    { kn: "ಕೋಳಿ (ಕುಕ್ಕುಟ / Cock)", en: "Cock (Kozhi)", hi: "कुक्कुट / कोझी पक्षी", mr: "कुक्कुट / कोझी पक्षी", te: "కుక్కుట పక్షి", ta: "கோழி பட்சி", ml: "കോഴി പക്ഷി" },
    { kn: "ನವಿಲು (ಮಯೂರ / Peacock)", en: "Peacock (Mayil)", hi: "मयूर / मयिल पक्षी", mr: "मयूर / मयिल पक्षी", te: "మయూర పక్షి", ta: "மயில் பட்சி", ml: "മയിൽ പക്ഷി" }
  ];
  const minsSince6 = (((now.getHours() * 60 + now.getMinutes()) - 360) + 1440) % 720;
  const yaamaIdx = Math.floor(minsSince6 / 144) % 5; // 5 Yaamas of ~2h 24m
  const pakshiStateIdx = (birdIndex + now.getDay() + yaamaIdx) % 5;
  const pakshiStates: Array<Record<SevenLang, string>> = [
    { kn: "ರಾಜ್ಯ (ಆಡಳಿತ – ೧೦೦% ಶುಭ)", en: "Rajya (Ruling – Peak Power)", hi: "राज्य (अत्यंत बलवान)", mr: "राज्य (अत्यंत बलवान)", te: "రాజ్య స్థితి (అత్యుత్తమం)", ta: "அரசு (உச்ச பலம்)", ml: "രാജ്യാവസ്ഥ (അത്യുത്തമം)" },
    { kn: "ಭಕ್ಷಣ (ಪೋಷಣೆ – ಲಾಭದಾಯಕ)", en: "Bhakshana (Feeding – Gainful)", hi: "भक्षण (लाभदायक स्थिति)", mr: "भक्षण (लाभदायक स्थिती)", te: "భక్షణ స్థితి (లాభం)", ta: "ஊண் (லாபகரம்)", ml: "ഭക്ഷണാവസ്ഥ (ലാഭകരം)" },
    { kn: "ಗಮನ (ಸಂಚಾರ – ಮಧ್ಯಮ)", en: "Gamana (Walking – Steady)", hi: "गमन (संतुलित गति)", mr: "गमन (संतुलित गती)", te: "గమన స్థితి (మధ్యమం)", ta: "நடை (நடுநிலை)", ml: "ഗമനാവസ്ഥ (മധ്യമം)" },
    { kn: "ನಿದ್ರಾ (ವಿಶ್ರಾಂತಿ – ನಿಧಾನ)", en: "Nidra (Sleeping – Low Drive)", hi: "निद्रा (विश्राम / धीमा)", mr: "निद्रा (संथ गती)", te: "నిద్రా స్థితి (నెమ్మది)", ta: "துயில் (மந்த நிலை)", ml: "നിദ്രാവസ്ഥ (മന്ദഗതി)" },
    { kn: "ಶಾಂತ (ಮೌನ – ಪರಿಶೀಲನಾ ಸಮಯ)", en: "Resting / Caution – Verify First", hi: "विश्राम – सोचकर कदम बढ़ाएं", mr: "विश्राम – विचारपूर्वक पाऊल टाका", te: "జాగ్రత్త సమయం", ta: "எச்சரிக்கை நிலை", ml: "ജാഗ്രതാ സമയം" }
  ];

  const trisphutaRashiName = RASHI_7L[trisphutaRashiIdx]?.[lang] || RASHI_7L[0].en;
  const trisphutaNakshatraName = NAKSHATRA_7L[trisphutaNakIdx]?.[lang] || NAKSHATRA_7L[0].en;
  const chatusphutaRashiName = RASHI_7L[chatusphutaRashiIdx]?.[lang] || RASHI_7L[0].en;
  const chatraRashiName = RASHI_7L[chatraRashiIdx]?.[lang] || RASHI_7L[0].en;
  const panchaPakshiBird = pakshiBirds[birdIndex]?.[lang] || pakshiBirds[0].en;
  const panchaPakshiState = pakshiStates[pakshiStateIdx]?.[lang] || pakshiStates[0].en;

  const udayaLagnaName = RASHI_7L[udayaLagnaIdx]?.[lang] || RASHI_7L[0].en;
  const udayaLagnaLordName = GRAHA_7L[udayaLordPlanet]?.[lang] || String(udayaLordPlanet);
  const seedLagnaName = RASHI_7L[seedLagnaIdx]?.[lang] || RASHI_7L[0].en;
  const seedNakshatraName = NAKSHATRA_7L[seedNakIdx]?.[lang] || NAKSHATRA_7L[0].en;
  const karyaLordName = GRAHA_7L[karyaLordPlanet]?.[lang] || String(karyaLordPlanet);
  const questionLabel = dom.labels[lang] || dom.labels.en;

  const timingForecast =
    ithasalaType === "direct_sambandha"
      ? pick7({
          kn: "೩ ರಿಂದ ೧೪ ದಿನಗಳಲ್ಲಿ ಸ್ಪಷ್ಟ ಫಲಿತಾಂಶದ ಚಲನೆ",
          en: "Clear forward breakthrough inside 3 to 14 days",
          hi: "३ से १४ दिनों के भीतर सकारात्मक प्रगति",
          mr: "३ ते १४ दिवसांत सकारात्मक हालचाल",
          te: "3 నుండి 14 రోజుల్లో స్పష్టమైన శుభ ఫలితం",
          ta: "3 முதல் 14 நாட்களில் தெளிவான முன்னேற்றம்",
          ml: "3 മുതൽ 14 ദിവസത്തിനകം ശുഭകരമായ പുരോഗതി"
        }, lang)
      : ithasalaType === "supportive_trine"
      ? pick7({
          kn: "೩ ರಿಂದ ೮ ವಾರಗಳಲ್ಲಿ ಸಹಕಾರಿ ಫಲ ಹಾಗೂ ಪ್ರಗತಿ",
          en: "Steady auspicious alignment building over 3 to 8 weeks",
          hi: "३ से ८ सप्ताह के भीतर उत्तम सहयोग एवं सफलता",
          mr: "३ ते ८ आठवड्यांत उत्तम प्रगती व यश",
          te: "3 నుండి 8 వారాల్లో అనుకూల ఫలితం",
          ta: "3 முதல் 8 வாரங்களில் நற்பலன் சேரும்",
          ml: "3 മുതൽ 8 ആഴ്ചകൾക്കുള്ളിൽ അനുകൂല ഫലം"
        }, lang)
      : ithasalaType === "patient_effort"
      ? pick7({
          kn: "೨ ರಿಂದ ೪ ತಿಂಗಳಲ್ಲಿ ತಾಳ್ಮೆಯ ಪ್ರಯತ್ನದಿಂದ ಯಶಸ್ಸು",
          en: "Success materializing in 2 to 4 months through structured patience",
          hi: "२ से ४ महीनों में धैर्यपूर्ण प्रयास से सिद्धि",
          mr: "२ ते ४ महिन्यांत संयमी प्रयत्नातून यश",
          te: "2 నుండి 4 నెలల్లో సహనంతో విజయం",
          ta: "2 முதல் 4 மாதங்களில் பொறுமையான முயற்சியால் வெற்றி",
          ml: "2 മുതൽ 4 മാസത്തിനുള്ളിൽ സ്ഥിരപരിശ്രമത്തിലൂടെ വിജയം"
        }, lang)
      : pick7({
          kn: "ತಕ್ಷಣದ ಅವಸರ ಬೇಡ — ಪರಿಹಾರದ ನಂತರ ೩–೬ ತಿಂಗಳಲ್ಲಿ ಮಾರ್ಗ ಸುಗಮ",
          en: "Defer hasty leaps now; clarity & smoother opening arrives after 3–6 months",
          hi: "अभी जल्दबाजी न करें; उपाय एवं धैर्य से ३–६ माह में मार्ग खुलेगा",
          mr: "आता घाई टाळा; ३–६ महिन्यांत योग्य संधी मिळेल",
          te: "తొందరపాటు వద్దు; 3–6 నెలల్లో శుభ మార్గం తెరుచుకుంటుంది",
          ta: "அவசரப்பட வேண்டாம்; 3–6 மாதங்களில் தடைகள் நீங்கும்",
          ml: "ഇപ്പോൾ തിടുക്കപ്പെടരുത്; 3–6 മാസത്തിനകം ശരിയായ വഴി തെളിയും"
        }, lang);

  const verdictTitle =
    score >= 78
      ? pick7({
          kn: "ಶುಭ ಪ್ರಶ್ನ ಯೋಗ — ಹೌದು, ಮುನ್ನಡೆಯಲು ಸಕಾಲ",
          en: "Strong Yes / Supportive Prashna Yoga",
          hi: "उत्तम प्रश्न योग — आगे बढ़ने का शुभ समय",
          mr: "शुभ प्रश्न योग — होय, पुढे जाण्याची उत्तम वेळ",
          te: "శుభ ప్రశ్న యోగం — ముందుకు సాగడానికి మంచి సమయం",
          ta: "சுப பிரசன்ன யோகம் — ஆம், முன்னேறச் சரியான நேரம்",
          ml: "ശുഭ പ്രശ്ന യോഗം — മുന്നോട്ടു പോകാൻ അനുകൂല സമയം"
        }, lang)
      : score >= 60
      ? pick7({
          kn: "ಮಧ್ಯಮ ಶುಭ — ವ್ಯವಸ್ಥಿತ ಯೋಜನೆಯಿಂದ ಕಾರ್ಯ ಸಿದ್ಧಿ",
          en: "Balanced / Effort-Backed Fulfillment",
          hi: "संतुलित योग — सही योजना से कार्यसिद्धि",
          mr: "संतुलित योग — योग्य नियोजनातून यश",
          te: "సమతుల్య యోగం — ప్రణాళికతో విజయం",
          ta: "மிதமான சுபம் — திட்டமிட்ட முயற்சியால் வெற்றி",
          ml: "സന്തുലിത യോഗം — കൃത്യമായ ആസൂത്രണത്തിലൂടെ വിജയം"
        }, lang)
      : pick7({
          kn: "ತಾಳ್ಮೆ & ಎಚ್ಚರಿಕೆಯ ಸೂಚನೆ — ಪರಿಶೀಲಿಸಿ ಹೆಜ್ಜೆ ಇಡಿ",
          en: "Cautionary Signal — Wait, Verify & Strengthen Ground",
          hi: "सावधानी का संकेत — ठहरकर विचार करें",
          mr: "सावधगिरीचा इशारा — तपासून पाऊल टाका",
          te: "జాగ్రత్త సూచన — ఆలోచించి నిర్ణయం తీసుకోండి",
          ta: "கவன எச்சரிக்கை — நிதானமாக ஆராய்ந்து செயல்படவும்",
          ml: "ജാഗ്രതാ നിർദ്ദേശം — ചിന്തിച്ചു മാത്രം തീരുമാനമെടുക്കുക"
        }, lang);

  const numStr = toNativeDigits7L(cleanNum, lang);
  const bhavaStr = toNativeDigits7L(dom.bhava, lang);
  const scoreStr = toNativeDigits7L(score, lang);
  const uHStr = toNativeDigits7L(uLordHouseFromUdaya, lang);

  const verdictSummary = pick7({
    kn: `ಈ ಕ್ಷಣದ ಉದಯ ಲಗ್ನ ${udayaLagnaName} ಹಾಗೂ ನೀವು ಆಯ್ದ ಪವಿತ್ರ ಸಂಖ್ಯೆ ${numStr} (${seedLagnaName} / ${seedNakshatraName} ನಕ್ಷತ್ರ) ಪರಸ್ಪರ ಸಂಯೋಗದಲ್ಲಿದೆ. ${bhavaStr}ನೇ ಭಾವಾಧಿಪತಿ ${karyaLordName} ಮತ್ತು ಲಗ್ನಾಧಿಪತಿ ${udayaLagnaLordName} (ಸ್ಥಾನ ${uHStr}) ನಡುವೆ ${scoreStr}% ಕಾರ್ಯಸಿದ್ಧಿ ಬಲವಿದೆ.`,
    en: `Cast at the exact moment of your question, Udaya Lagna rises in ${udayaLagnaName} with Horary Seed #${numStr} (${seedLagnaName}, ${seedNakshatraName}). Lord ${karyaLordName} of Bhava ${dom.bhava} forms a ${score}% Tajika relationship with Ascendant Lord ${udayaLagnaLordName} in House ${uLordHouseFromUdaya}.`,
    hi: `आपके प्रश्न के सटीक क्षण पर उदय लग्न ${udayaLagnaName} तथा पावन संख्या ${numStr} (${seedLagnaName} / ${seedNakshatraName}) उदित हुई है। भाव ${bhavaStr} के स्वामी ${karyaLordName} और लग्नेश ${udayaLagnaLordName} के बीच ${scoreStr}% सफलता योग बन रहा है।`,
    mr: `तुमच्या प्रश्नाच्या क्षणी उदय लग्न ${udayaLagnaName} असून पवित्र क्रमांक ${numStr} (${seedLagnaName} / ${seedNakshatraName}) जुळून आला आहे. स्थान ${bhavaStr} स्वामी ${karyaLordName} आणि लग्नेश ${udayaLagnaLordName} यांच्यात ${scoreStr}% कार्यसिद्धी योग आहे.`,
    te: `మీ ప్రశ్న సమయంలో ఉదయ లగ్నం ${udayaLagnaName} కాగా, పవిత్ర సంఖ్య ${numStr} (${seedLagnaName} / ${seedNakshatraName}) శుభ సంకేతమైంది. ${bhavaStr}వ భావాధిపతి ${karyaLordName} మరియు లగ్నాధిపతి ${udayaLagnaLordName} మధ్య ${scoreStr}% కార్యసిద్ధి బలం ఉంది.`,
    ta: `உங்கள் கேள்வி நேரத்தில் உதய லக்னம் ${udayaLagnaName} ஆகவும், புனித எண் ${numStr} (${seedLagnaName} / ${seedNakshatraName}) ஆகவும் அமைந்துள்ளது. ${bhavaStr}-ம் பாவாதிபதி ${karyaLordName} மற்றும் லக்னாதிபதி ${udayaLagnaLordName} இடையே ${scoreStr}% காரிய சித்தி உள்ளது.`,
    ml: `നിങ്ങളുടെ ചോദ്യനിമിഷത്തിലെ ഉദയലഗ്നം ${udayaLagnaName} ഉം തിരഞ്ഞെടുത്ത സംഖ്യ ${numStr} (${seedLagnaName} / ${seedNakshatraName}) ഉം ആണ്. ${bhavaStr}-ാം ഭാവാധിപൻ ${karyaLordName}-ഉം ലഗ്നാധിപൻ ${udayaLagnaLordName}-ഉം ചേർന്ന് ${scoreStr}% കാര്യസിദ്ധി ബലം നൽകുന്നു.`
  }, lang);

  const remedialAction = pick7({
    kn: `ಇಂದಿನ ಪ್ರಶ್ನ ಸೂಚನೆ: ${karyaLordName} ಬಲವರ್ಧನೆಗಾಗಿ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ೧೧ ಬಾರಿ ಮಂತ್ರ ಸ್ಮರಣೆ ಮಾಡಿ ಮತ್ತು ತಂದೆ-ತಾಯಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ.`,
    en: `Prashna Alignment Rule: Honor ${karyaLordName}'s discipline today, avoid impulsive promises during Rahu Kalam (${clock.rahuKalamTimeStr}), and begin key action under ${udayaLagnaLordName} focus.`,
    hi: `प्रश्न संरेखण: ${karyaLordName} की शांति हेतु आज संयम रखें एवं शुभ कार्य से पूर्व प्रातः ११ बार इष्ट स्मरण करें।`,
    mr: `प्रश्न मार्गदर्शन: ${karyaLordName} बलासाठी राहुकाळ (${clock.rahuKalamTimeStr}) टाळून शांत चित्ताने निर्णय घ्या.`,
    te: `ప్రశ్న మార్గదర్శకం: ${karyaLordName} బలం కోసం రాహుకాలం (${clock.rahuKalamTimeStr}) దాటిన తర్వాత కీలక నిర్ణయాలు తీసుకోండి.`,
    ta: `பிரசன்ன வழிகாட்டல்: ${karyaLordName} அருளுக்காக ராகு காலம் (${clock.rahuKalamTimeStr}) தவிர்த்து நிதானமாகச் செயல்படவும்.`,
    ml: `പ്രശ്ന നിർദ്ദേശം: ${karyaLordName}-ന്റെ പ്രീതിക്കായി രാഹുകാലം (${clock.rahuKalamTimeStr}) ഒഴിവാക്കി ശാന്തമായി തീരുമാനമെടുക്കുക.`
  }, lang);

  return {
    questionDomain,
    questionLabel,
    horaryNumber: cleanNum,
    clock,
    udayaLagnaIdx,
    udayaLagnaName,
    udayaLagnaLordName,
    seedLagnaIdx,
    seedLagnaName,
    seedNakshatraName,
    karyaBhava: dom.bhava,
    karyaLordName,
    ithasalaHarmonyScore: score,
    ithasalaType,
    tajikaYogaLabel,
    isMuthasilaExact,
    trisphutaRashiName,
    trisphutaNakshatraName,
    chatusphutaRashiName,
    chatraRashiName,
    panchaPakshiBird,
    panchaPakshiState,
    timingForecast,
    verdictTitle,
    verdictSummary,
    remedialAction
  };
}

/**
 * Generates personalized Gemini 3.5 Flash Lite paragraphs for the ₹149 Express Walk-In PDF
 */
export async function generateExpressWalkInAiNarrative(params: {
  devoteeName: string;
  lang: SevenLang;
  prashna: DeepPrashnaHoraryResult;
  sankhya?: ChandraSankhyaProfile;
  palmSummary?: string;
  faceSummary?: string;
  apiKey?: string;
}): Promise<string[]> {
  const { devoteeName, lang, prashna, sankhya, palmSummary, faceSummary, apiKey } = params;
  const activeKey = (
    apiKey ||
    (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY : "") ||
    ""
  ).trim();
  const isTest = typeof process !== "undefined" && (process.env?.NODE_ENV === "test" || process.env?.VITEST === "true");

  const fallback = [
    prashna.verdictSummary,
    sankhya
      ? pick7({
          kn: `ನಿಮ್ಮ ನಾಮ ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಚಾಲ್ಡಿಯನ್ ಸಂಖ್ಯೆ ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} (ಮೂಲಾಂಕ ${toNativeDigits7L(sankhya.mulank, lang)}) ಆಗಿದ್ದು, ಶುಭ ಬಣ್ಣ ${sankhya.luckyColor} ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಿಗೆ ಸ್ಥಿರತೆ ನೀಡುತ್ತದೆ.`,
          en: `Your Chaldean Name Vibration balances at ${sankhya.chaldeanCompound} (Root ${sankhya.chaldeanSingle}), aligned with ${sankhya.luckyColor} and lucky numbers ${sankhya.luckyNumbers.join(", ")}.`,
          hi: `आपके नाम का चाल्डियन अंक ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} है और शुभ रंग ${sankhya.luckyColor} आपके प्रयासों में स्थिरता लाता है।`,
          mr: `तुमच्या नावाची चाल्डियन संख्या ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} असून शुभ रंग ${sankhya.luckyColor} तुमचा आत्मविश्वास वाढवतो.`,
          te: `మీ నామ సంఖ్యాబలం ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} మరియు శుభ వర్ణం ${sankhya.luckyColor} మీ పనులకు బలం చేకూరుస్తుంది.`,
          ta: `உங்கள் பெயரின் எண் அதிர்வு ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} மற்றும் அதிர்ஷ்ட நிறம் ${sankhya.luckyColor} வெற்றியைத் தரும்.`,
          ml: `നിങ്ങളുടെ പേരിന്റെ ചാൽഡിയൻ സംഖ്യ ${toNativeDigits7L(sankhya.chaldeanCompound, lang)} ഉം ശുഭനിറം ${sankhya.luckyColor}-ഉം പ്രവർത്തനങ്ങൾക്ക് ഉറപ്പ് നൽകുന്നു.`
        }, lang)
      : prashna.remedialAction,
    prashna.remedialAction
  ];

  if (!activeKey || isTest) return fallback;

  try {
    const langNames: Record<SevenLang, string> = {
      kn: "Kannada", en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", ml: "Malayalam", mr: "Marathi"
    };
    const prompt = `Write 3 vivid, personal paragraphs (70-120 words each) strictly in pure ${langNames[lang]} script (ZERO English words if non-English, zero markdown stars/hashes) synthesizing a dining-table Prashna + Samudrika + Numerology consultation for ${devoteeName}:
- Question Focus: ${prashna.questionLabel}
- Udaya Lagna: ${prashna.udayaLagnaName} (Lord ${prashna.udayaLagnaLordName}) | Karya Lord: ${prashna.karyaLordName} | Score: ${prashna.ithasalaHarmonyScore}%
- Horary Seed #${prashna.horaryNumber}: ${prashna.seedLagnaName} (${prashna.seedNakshatraName})
- Timing: ${prashna.timingForecast}
${sankhya ? `- Numerology: Mulank=${sankhya.mulank}, Bhagyank=${sankhya.bhagyank}, Chaldean=${sankhya.chaldeanCompound}, LuckyColor=${sankhya.luckyColor}` : ""}
${palmSummary ? `- Palm Biometrics: ${palmSummary}` : ""}
${faceSummary ? `- Face Samudrika: ${faceSummary}` : ""}
Return ONLY a JSON array of 3 strings.`;

    const raw = await askGemini("HotelExpressPrashnaAI", prompt, activeKey, langNames[lang], {
      raw: true,
      temperature: 0.9,
      retries: 2
    });
    const m = raw.match(/\[[\s\S]*\]/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return parsed.map((p: any) =>
          lang === "en" ? String(p).trim() : cleanEnglishFromRegionalText(String(p).trim(), lang)
        );
      }
    }
  } catch {
    // Graceful deterministic fallback
  }

  return fallback;
}
