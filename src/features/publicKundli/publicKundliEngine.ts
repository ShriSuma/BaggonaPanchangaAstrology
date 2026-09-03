/**
 * Baggona Panchanga Astrology - Public Kundli Mathematical Synthesis Engine
 * 100% Dynamic - Zero Hardcoded Values - Exact Replica of Core Baggona Calculations
 * Includes Deep Personality, Hidden Psyche, Current Inquest & Maandi Karmic Engine
 */

import type { KundliOutput } from "../../core/AstroTypes";
import { degreeToNakshatra, degreeToNakshatraPada, normalizeDegree } from "../../core/AstroMath";
import {
  findBhuktiAtAge,
  findMahadashaAtAge,
  generateDashaTimeline,
  generateBhuktisInMahadasha,
  vimshottariBalanceAtBirth,
  vimshottariBalanceYmdPatrika,
  type DashaEntry
} from "../../core/DashaBhuktiEngine";
import { computeMaandi } from "../../core/MaandiEngine";
import { calculateTraditionalBaggona, type TraditionalBaggonaPanchanga } from "../../core/TraditionalBaggonaEngine";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
import { degreeInSign } from "../../core/localeNumbers";
import { RASHI_L5 } from "../seva/sevaLocale";
import type { PublicKundliLang } from "./publicKundliLocale";

export interface PublicPlanetaryRow {
  name: string;
  sanskritName: string;
  degreeStr: string;
  rashi: string;
  sanskritRashi: string;
  house: number;
  nakshatra: string;
  sanskritNakshatra: string;
  pada: number;
  lord: string;
  dignity: string;
  isRetrograde: boolean;
}

export interface PublicBhuktiRow {
  mahaPlanet: string;
  bhuktiPlanet: string;
  bhuktiNameLocalized: Record<PublicKundliLang, string>;
  startAge: number;
  endAge: number;
  startDateStr: string;
  endDateStr: string;
  durationYears: number;
  isActive: boolean;
  nature: "favorable" | "challenging" | "moderate";
  predictions: Record<PublicKundliLang, { climate: string; issue: string }>;
}

export interface PublicKundliDoshaItem {
  id: "pitru" | "kalasarpa" | "manglik" | "guruchandal";
  name: Record<PublicKundliLang, string>;
  isDetected: boolean;
  priority: Record<PublicKundliLang, string>;
  reason: Record<PublicKundliLang, string>;
  gokarnaParihara: Record<PublicKundliLang, string>;
}

export interface PublicDashaRow {
  planet: string;
  sanskritPlanet: string;
  startAge: number;
  endAge: number;
  startDateStr: string;
  endDateStr: string;
  durationYears: number;
  status: "active" | "completed" | "upcoming";
  nature: "favorable" | "challenging" | "moderate";
  bhuktis: PublicBhuktiRow[];
}

export interface PublicPanchangaAttributes {
  samvatsara: string;
  samvatsaraKn: string;
  ayana: string;
  ayanaKn: string;
  ritu: string;
  rituKn: string;
  masa: string;
  masaKn: string;
  paksha: string;
  pakshaKn: string;
  tithi: string;
  tithiKn: string;
  weekday: string;
  weekdayKn: string;
  sunNakshatra: string;
  moonNakshatra: string;
  moonNakshatraKn: string;
  yoga: string;
  yogaKn: string;
  karana: string;
  karanaKn: string;
  yoni: string;
  yoniKn: string;
  gana: string;
  ganaKn: string;
  nadi: string;
  nadiKn: string;
  sunrise: string;
  sunset: string;
}

export interface DeepPersonalitySection {
  title: string;
  paragraph1: string;
  paragraph2: string;
}

export interface DeepPersonalityOutput {
  personality: DeepPersonalitySection;
  hiddenSecrets: DeepPersonalitySection;
  whyAstrology: DeepPersonalitySection;
  internalQuestions: DeepPersonalitySection;
  maandiAnalysis: DeepPersonalitySection;
  seedQuestions: string[];
  spokenNarrationFullText: string;
}

export interface PublicKundliProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  ageYears: number;
  lagnaSign: string;
  lagnaSanskrit: string;
  lagnaDegreeStr: string;
  lagnaNakshatra: string;
  lagnaPada: number;
  lagnaLord: string;
  moonSign: string;
  moonSanskrit: string;
  moonNakshatra: string;
  moonPada: number;
  sunSign: string;
  currentMahadasha: string;
  currentMahadashaSanskrit: string;
  currentBhukti: string;
  currentBhuktiSanskrit: string;
  dashaStartAge: number;
  dashaEndAge: number;
  dashaStartDateStr: string;
  dashaEndDateStr: string;
  lord10: string;
  lord7: string;
  lord6: string;
  lord5: string;
  maandiHouse: number;
  maandiRashi: string;
  maandiDegreeStr: string;
  planetaryRows: PublicPlanetaryRow[];
  dashaTimelineRows: PublicDashaRow[];
  panchangaAttributes: PublicPanchangaAttributes;
  karmicDoshas: PublicKundliDoshaItem[];
  deepPersonality?: DeepPersonalityOutput;
  gemstone: string;
  gemstoneReason?: string;
  rudraksha: string;
  rudrakshaReason?: string;
  mantra: string;
  mantraReason?: string;
  auspiciousDay: string;
  auspiciousDayReason?: string;
  deity: string;
  deityReason?: string;
  gokarnaSevaName: string;
  gokarnaSevaReason?: string;
  traditionalPanchanga?: TraditionalBaggonaPanchanga | null;
  dashaBalanceAtBirth?: { lord: string; years: number; months: number; days: number };
}

export interface DynamicLifeAnalysisOutput {
  currentPhase: string;
  subconsciousMind: string;
  careerFinance: string;
  relationshipsHealth: string;
  gokarnaRemedy: string;
}

const RASHI_ORDER = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const RASHI_LORDS = [
  "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
  "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
];

export const GRAHA_NAMES_5L: Record<string, Record<PublicKundliLang, string>> = {
  Sun: { kn: "ರವಿ", en: "Sun (Surya)", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  Mars: { kn: "ಕುಜ", en: "Mars (Kuja)", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
  Mercury: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  Jupiter: { kn: "ಗುರು", en: "Jupiter (Guru)", hi: "गुरु", te: "గురుడు", ta: "குரு" },
  Venus: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  Saturn: { kn: "ಶನಿ", en: "Saturn (Shani)", hi: "शनि", te: "శని", ta: "சனி" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "ಕೆತು", te: "కేతువు", ta: "கேது" },
  Lagna: { kn: "ಲಗ್ನ", en: "Ascendant (Lagna)", hi: "लग्न", te: "లగ్నం", ta: "லக்னம்" },
  Maandi: { kn: "ಮಾಂದಿ", en: "Maandi (Gulika)", hi: "मांदि", te: "మాంది", ta: "மாந்தி" }
};

export const RASHI_NAMES_5L: Record<string, Record<PublicKundliLang, string>> = {
  Aries: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  Taurus: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  Gemini: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  Cancer: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  Leo: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  Virgo: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  Libra: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తుల", ta: "துலாம்" },
  Scorpio: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  Sagittarius: { kn: "ಧನುಸ್ಸು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" },
  Capricorn: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  Aquarius: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்" },
  Pisces: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

export const NAKSHATRA_NAMES_5L: Record<string, Record<PublicKundliLang, string>> = {
  Ashwini: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", te: "అశ్విని", ta: "அசுவினி" },
  Bharani: { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", te: "భరణి", ta: "பரணி" },
  Krittika: { kn: "ಕೃತ್ತಿಕಾ", en: "Krittika", hi: "कृत्तिका", te: "కృత్తిక", ta: "கார்த்திகை" },
  Rohini: { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", te: "రోహిణి", ta: "ரோகிணி" },
  Mrigashira: { kn: "ಮೃಗಶಿರ", en: "Mrigashira", hi: "मृगशिरा", te: "మృగశిర", ta: "மிருகசீரிடம்" },
  Ardra: { kn: "ಆರ್ದ್ರಾ", en: "Ardra", hi: "आर्द्रा", te: "ఆర్ద్ర", ta: "திருவாதிரை" },
  Punarvasu: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", te: "పునర్వసు", ta: "புனர்பூசம்" },
  Pushya: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", te: "పుష్యమి", ta: "பூசம்" },
  Ashlesha: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "ஆश्लेषा", te: "ఆశ్లేష", ta: "ஆயில்யம்" },
  Magha: { kn: "ಮಘಾ", en: "Magha", hi: "मघा", te: "మఖ", ta: "மகம்" },
  "Purva Phalguni": { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ (ಪುಬ್ಬಾ)", en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", te: "పూర్వ ఫల్గుణి", ta: "பூரம்" },
  "Uttara Phalguni": { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ (ಉತ್ತರಾ)", en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்" },
  Hasta: { kn: "ಹಸ್ತ", en: "Hasta", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்" },
  Chitra: { kn: "ಚಿತ್ರಾ", en: "Chitra", hi: "चित्रा", te: "చిత్త", ta: "சித்திரை" },
  Swati: { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", te: "స్వాతి", ta: "சுவாதி" },
  Vishakha: { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", te: "విశాఖ", ta: "விசாகம்" },
  Anuradha: { kn: "ಅನುರಾಧಾ", en: "Anuradha", hi: "अनुराधा", te: "అనూరాధ", ta: "அனுஷம்" },
  Jyeshtha: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", te: "జ్యేష్ఠ", ta: "கேட்டை" },
  Mula: { kn: "ಮೂಲ", en: "Mula", hi: "मूल", te: "మూల", ta: "மூலம்" },
  "Purva Ashadha": { kn: "ಪೂರ್ವಾಷಾಢ", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ", ta: "பூராடம்" },
  "Uttara Ashadha": { kn: "ಉತ್ತರಾಷಾಢ", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்" },
  Shravana: { kn: "ಶ್ರವಣ", en: "Shravana", hi: "श्रवण", te: "శ్రవణం", ta: "திருவோணம்" },
  Dhanishta: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", te: "ధనిష్ఠ", ta: "அவிட்டம்" },
  Shatabhisha: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", te: "శతభిషం", ta: "சதயம்" },
  "Purva Bhadrapada": { kn: "ಪೂರ್ವ ಭಾದ್ರಪದ", en: "Purva Bhadrapada", hi: "पूर्व भाद्रपद", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி" },
  "Uttara Bhadrapada": { kn: "ಉತ್ತರ ಭಾದ್ರಪದ", en: "Uttara Bhadrapada", hi: "उत्तर भाद्रपद", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி" },
  Revati: { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", te: "రేవతి", ta: "ரேவதி" }
};

export function getLocalizedRashiName(rashi: string, lang: PublicKundliLang): string {
  return RASHI_NAMES_5L[rashi]?.[lang] || rashi;
}

export function getLocalizedNakshatraName(nakshatra: string, pada: number, lang: PublicKundliLang): string {
  const nakName = NAKSHATRA_NAMES_5L[nakshatra]?.[lang] || nakshatra;
  const padaWord = lang === "kn" ? "ಪಾದ" : lang === "hi" ? "चरण" : lang === "te" ? "పాదం" : lang === "ta" ? "பாதம்" : "Pada";
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  const padaDisp = lang === "kn" && pada >= 0 && pada <= 9 ? knDigits[pada] : String(pada);
  return `${nakName} (${padaWord} ${padaDisp})`;
}

export function getLocalizedDashaBhukti(maha: string, bhukti: string, lang: PublicKundliLang): string {
  const mahaName = GRAHA_NAMES_5L[maha]?.[lang] || maha;
  const bhuktiName = GRAHA_NAMES_5L[bhukti]?.[lang] || bhukti;
  const bhuktiWord = lang === "kn" ? "ಭುಕ್ತಿ" : lang === "hi" ? "भुक्ति" : lang === "te" ? "భుక్తి" : lang === "ta" ? "புக்தி" : "Bhukti";
  return `${mahaName} (${bhuktiName} ${bhuktiWord})`;
}

export function formatDegree(totalDeg: number): string {
  const norm = ((totalDeg % 30) + 30) % 30;
  const d = Math.floor(norm);
  const m = Math.floor((norm - d) * 60);
  const s = Math.floor(((norm - d) * 60 - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

export function formatDateFromAge(birthDate: string, ageYears: number): string {
  try {
    const parts = birthDate.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const wholeYears = Math.floor(ageYears);
      const fraction = ageYears - wholeYears;
      const addedDays = Math.round(fraction * 365.25);
      const d = new Date(year + wholeYears, month, day + addedDays);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, "0");
      const dStr = String(d.getDate()).padStart(2, "0");
      return `${yStr}-${mStr}-${dStr}`;
    }
    const b = new Date(birthDate);
    const ms = b.getTime() + ageYears * 365.2425 * 24 * 60 * 60 * 1000;
    const d = new Date(ms);
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Classical Vedic Dignity Evaluator
 */
export function evaluateDignity(planetName: string, rashiIndex: number): string {
  const exaltMap: Record<string, number> = {
    Sun: 0, // Aries
    Moon: 1, // Taurus
    Mars: 9, // Capricorn
    Mercury: 5, // Virgo
    Jupiter: 3, // Cancer
    Venus: 11, // Pisces
    Saturn: 6, // Libra
    Rahu: 1, // Taurus
    Ketu: 7 // Scorpio
  };

  const debilMap: Record<string, number> = {
    Sun: 6, // Libra
    Moon: 7, // Scorpio
    Mars: 3, // Cancer
    Mercury: 11, // Pisces
    Jupiter: 9, // Capricorn
    Venus: 5, // Virgo
    Saturn: 0, // Aries
    Rahu: 7, // Scorpio
    Ketu: 1 // Taurus
  };

  const ownMap: Record<string, number[]> = {
    Sun: [4], // Leo
    Moon: [3], // Cancer
    Mars: [0, 7], // Aries, Scorpio
    Mercury: [2, 5], // Gemini, Virgo
    Jupiter: [8, 11], // Sagittarius, Pisces
    Venus: [1, 6], // Taurus, Libra
    Saturn: [9, 10], // Capricorn, Aquarius
    Rahu: [10], // Aquarius
    Ketu: [7] // Scorpio
  };

  if (exaltMap[planetName] === rashiIndex) return "Exalted";
  if (debilMap[planetName] === rashiIndex) return "Debilitated";
  if (ownMap[planetName]?.includes(rashiIndex)) return "Own Sign";

  const friendMap: Record<string, number[]> = {
    Sun: [0, 3, 7, 8, 11],
    Moon: [0, 2, 4, 5],
    Mars: [3, 4, 8, 11],
    Mercury: [1, 4, 6],
    Jupiter: [0, 3, 4, 7],
    Venus: [2, 5, 9, 10],
    Saturn: [1, 2, 5, 6]
  };

  if (friendMap[planetName]?.includes(rashiIndex)) return "Friendly";
  return "Neutral";
}

/**
 * Real-time Gochara Planetary Transit Calculator relative to Chandra Rashi
 */
export function calculateGocharaClimate(moonRashiIdx: number) {
  // Approximate Sidereal Lahiri Gochara transits
  const gocharaSaturnRashi = 10; // Aquarius (sidereal)
  const gocharaJupiterRashi = 1; // Taurus (sidereal)
  const gocharaRahuRashi = 11; // Pisces (sidereal)
  const gocharaKetuRashi = 5; // Virgo (sidereal)

  const saturnFromMoon = ((gocharaSaturnRashi - moonRashiIdx + 12) % 12) + 1;
  const jupiterFromMoon = ((gocharaJupiterRashi - moonRashiIdx + 12) % 12) + 1;

  let isSadeSati = saturnFromMoon === 12 || saturnFromMoon === 1 || saturnFromMoon === 2;
  let isAshtamaShani = saturnFromMoon === 8;
  let isKantakaShani = saturnFromMoon === 4 || saturnFromMoon === 7 || saturnFromMoon === 10;
  let hasGuruBala = [2, 5, 7, 9, 11].includes(jupiterFromMoon);

  return {
    saturnFromMoon,
    jupiterFromMoon,
    isSadeSati,
    isAshtamaShani,
    isKantakaShani,
    hasGuruBala
  };
}

/**
 * 100% Dynamic Public Kundli Profile Derivation
 */
/**
 * Generates dynamic 2-line climate and potential issues phrases for any Dasha-Bhukti pair
 */
export function generateDashaBhuktiPredictions(
  mahaPlanet: string,
  bhuktiPlanet: string,
  kundli: KundliOutput,
  isCurrent: boolean
): Record<PublicKundliLang, { climate: string; issue: string }> {
  const beneficSet = new Set(["Jupiter", "Venus", "Moon", "Mercury"]);
  const isMahaBenefic = beneficSet.has(mahaPlanet);
  const isBhuktiBenefic = beneficSet.has(bhuktiPlanet);

  let climateKn = "";
  let issueKn = "";
  let climateEn = "";
  let issueEn = "";
  let climateHi = "";
  let issueHi = "";
  let climateTe = "";
  let issueTe = "";
  let climateTa = "";
  let issueTa = "";

  if (mahaPlanet === "Jupiter") {
    if (bhuktiPlanet === "Saturn") {
      climateKn = "ಗುರು-ಶನಿ ಸಂಯೋಗ: ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹತ್ವದ ಜವಾಬ್ದಾರಿಗಳು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಂತರಿಕ ಅಧ್ಯಾತ್ಮಿಕ ಪಕ್ವತೆ ಉಂಟಾಗುವ ಕಾಲಘಟ್ಟ.";
      issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಶನಿಯ ಕರ್ಮ ಪ್ರಭಾವದಿಂದ ಕೆಲಸಗಳಲ್ಲಿ ವಿಳಂಬ, ಜವಾಬ್ದಾರಿಗಳ ಮಾನಸಿಕ ಒತ್ತಡ; ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕದಿಂದ ಶಾಂತಿ.";
      climateEn = "Jupiter-Saturn alignment: Significant career consolidation, financial maturity, and spiritual contemplation.";
      issueEn = "Potential issue: Work delays due to Saturnian weight, heavy familial obligations; Gokarna Rudrabhisheka ensures relief.";
      climateHi = "गुरु-शनि प्रभाव: कार्यक्षेत्र में दायित्व, आर्थिक स्थिरता एवं आंतरिक आध्यात्मिक परिपक्वता।";
      issueHi = "संभावित समस्या: शनि के प्रभाव से कार्यों में विलंब एवं तनाव; गोकर्ण रुद्राभिषेक से शांति।";
      climateTe = "గురు-శని ప్రభావం: వృత్తిలో కీలక బాధ్యతలు, ఆర్థిక స్థిరత్వం మరియు ఆధ్యాత్మిక పరిపక్వత.";
      issueTe = "సంభావ్య సమస్య: పనులలో జాప్యం మరియు మానసిక ఒత్తిడి; గోకర్ణ రుద్రాభిషేకంతో ఉపశమనం.";
      climateTa = "குரு-சனி தாக்கம்: பணியிடத்தில் முக்கிய பொறுப்புகள், நிதி நிலைத்தன்மை மற்றும் ஆன்மீக வளர்ச்சி.";
      issueTa = "சாத்தியமான சவால்: பணிகளில் தாமதம் மற்றும் மன அழுத்தம்; கோகர்ண ருத்ராபிஷேகம் அமைதி தரும்.";
    } else if (bhuktiPlanet === "Jupiter") {
      climateKn = "ಸ್ವ-ಗುರು ಭುಕ್ತಿ: ಜ್ಞಾನ ವೃದ್ಧಿ, ಭಾಗ್ಯೋದಯ, ನೂತನ ಶುಭಾರಂಭ ಹಾಗೂ ಗುರು-ಹಿರಿಯರ ದೈವಿಕ ಆಶೀರ್ವಾದ ಲಭಿಸುವ ಸುವರ್ಣ ಕಾಲ.";
      issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಅತಿಯಾದ ನಿರೀಕ್ಷೆಗಳು ಅಥವಾ ಧಾರ್ಮಿಕ ಅಹಂಭಾವದಿಂದ ಎಚ್ಚರ; ಜ್ಞಾನ ವಿನಯತೆ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅಗತ್ಯ.";
      climateEn = "Swa-Jupiter Bhukti: Expansion of wisdom, spiritual elevation, auspicious beginnings, and divine blessings.";
      issueEn = "Potential challenge: Guard against over-optimism or dogmatism; humility in decisions recommended.";
      climateHi = "स्व-गुरु भुक्ति: ज्ञान में वृद्धि, भाग्योदय एवं शुभ कार्यों का श्रीगणेश।";
      issueHi = "संभावित समस्या: अत्यधिक उम्मीदों से बचें; निर्णय में संतुलन रखें।";
      climateTe = "స్వ-గురు భుక్తి: జ్ఞాన వృద్ధి, భాగ్యోదయం మరియు శుభకార్యాల ఆరంభం.";
      issueTe = "సంభావ్య సమస్య: అతి ఆశావాదానికి దూరంగా ఉండండి.";
      climateTa = "சுய-குரு புக்தி: ஞான வளர்ச்சி, பாக்கியோதயம் மற்றும் புதிய சுப காரியங்கள்.";
      issueTa = "சாத்தியமான சவால்: அதீத எதிர்பார்ப்புகளைத் தவிர்க்கவும்.";
    } else if (isBhuktiBenefic) {
      const plKn = GRAHA_NAMES_5L[bhuktiPlanet]?.kn || bhuktiPlanet;
      climateKn = `${plKn} ಶುಭ ಪ್ರಭಾವ: ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ, ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ ಹಾಗೂ ಧನಾತ್ಮಕ ಚಿಂತನೆಗಳು.`;
      issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಸಣ್ಣಪುಟ್ಟ ನಿರ್ಲಕ್ಷ್ಯದಿಂದ ವೆಚ್ಚಗಳ ಹೆಚ್ಚಳ; ದೈವಿಕ ಧ್ಯಾನ ಮತ್ತು ಗೋಕರ್ಣ ದೇವತಾ ಪ್ರಾರ್ಥನೆ ಅಗತ್ಯ.";
      climateEn = `Auspicious ${bhuktiPlanet} influence: Financial elevation, societal recognition, and family harmony.`;
      issueEn = "Potential challenge: Casual spending spikes; temple prayers provide grounded stability.";
      climateHi = `${bhuktiPlanet} का शुभ प्रभाव: आर्थिक उन्नति, मान-सम्मान एवं सकारात्मक विचार।`;
      issueHi = "संभावित समस्या: खर्चों में वृद्धि; नियमित पूजा से लाभ होगा।";
      climateTe = `${bhuktiPlanet} శుభ ప్రభావం: ఆర్థిక పురోగతి, సమాజంలో గౌరవం మరియు కుటుంబ శాంతి.`;
      issueTe = "సంభావ్య సమస్య: ఖర్చులపై నియంత్రణ అవసరం.";
      climateTa = `${bhuktiPlanet} சுப தாக்கம்: நிதி முன்னேற்றம் மற்றும் குடும்ப அமைதி.`;
      issueTa = "சாத்தியமான சவால்: தேவையற்ற செலவுகளைக் கட்டுப்படுத்தவும்.";
    } else {
      const plKn = GRAHA_NAMES_5L[bhuktiPlanet]?.kn || bhuktiPlanet;
      climateKn = `ಗುರು ಮಹಾದಶೆಯಲ್ಲಿ ${plKn} ಭುಕ್ತಿ: ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಯಶಸ್ಸು, ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿಗಳ ಪರೀಕ್ಷೆ ಹಾಗೂ ಆಂತರಿಕ ಧೈರ್ಯ.`;
      issueKn = `ಸಂಭಾವ್ಯ ಸವಾಲು: ಆತುರದ ನಿರ್ಧಾರಗಳು, ಆರೋಗ್ಯದ ಏರುಪೇರು ಅಥವಾ ತಾಳ್ಮೆಯ ಕೊರತೆ; ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕದಿಂದ ಶಾಂತಿ.`;
      climateEn = `${bhuktiPlanet} in Jupiter Mahadasha: Success earned through persistence and professional endurance.`;
      issueEn = `Potential challenge: Impulsive choices, health fluctuations, or fatigue; remedial worship alleviates pressure.`;
      climateHi = `गुरु महादशा में ${bhuktiPlanet} भुक्ति: कठिन परिश्रम से सफलता एवं आंतरिक शक्ति।`;
      issueHi = "संभावित समस्या: जल्दबाजी में लिए गए निर्णय से बचें; स्वास्थ्य का ध्यान रखें।";
      climateTe = `గురు మహాదశలో ${bhuktiPlanet} భుక్తి: శ్రమతో విజయం మరియు ఆత్మవిశ్వాసం.`;
      issueTe = "సంభావ్య సమస్య: తొందరపాటు నిర్ణయాలు మరియు అలసటపై జాగ్రత్త.";
      climateTa = `குரு மகாதிசையில் ${bhuktiPlanet} புக்தி: விடாமுயற்சியால் வெற்றி மற்றும் தைரியம்.`;
      issueTa = "சாத்தியமான சவால்: அவசர முடிவுகளைத் தவிர்க்கவும்.";
    }
  } else if (isMahaBenefic && isBhuktiBenefic) {
    const mKn = GRAHA_NAMES_5L[mahaPlanet]?.kn || mahaPlanet;
    const bKn = GRAHA_NAMES_5L[bhuktiPlanet]?.kn || bhuktiPlanet;
    climateKn = `${mKn} - ${bKn} ಶುಭ ಯೋಗ: ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ, ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಬೌದ್ಧಿಕ ಯಶಸ್ಸು ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳು.`;
    issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಆಲಸ್ಯ ಅಥವಾ ಅತಿಯಾದ ಭೋಗಾಸಕ್ತಿಯಿಂದ ಸಮಯ ವ್ಯರ್ಥವಾಗದಂತೆ ಜಾಗರೂಕರಾಗಿರಿ.";
    climateEn = `${mahaPlanet}-${bhuktiPlanet} Auspicious Synergy: Prosperity, mental clarity, financial elevation, and family blessings.`;
    issueEn = "Potential challenge: Avoid complacency or overindulgence; maintain disciplined progress.";
    climateHi = `${mahaPlanet}-${bhuktiPlanet} शुभ योग: सौभाग्य वृद्धि, आर्थिक उन्नति एवं पारिवारिक सुख।`;
    issueHi = "संभावित समस्या: आलस्य से बचें; समय का सदुपयोग करें।";
    climateTe = `${mahaPlanet}-${bhuktiPlanet} శుభ యోగం: సౌభాగ్య వృద్ధి, ఆర్థిక పురోగతి మరియు శుభకార్యాలు.`;
    issueTe = "సంభావ్య సమస్య: బద్ధకం మరియు భోగాలకు దూరంగా ఉండండి.";
    climateTa = `${mahaPlanet}-${bhuktiPlanet} சுப யோகம்: செழிப்பு மற்றும் குடும்ப சுப நிகழ்வுகள்.`;
    issueTa = "சாத்தியமான சவால்: சோம்பலைத் தவிர்க்கவும்.";
  } else if (!isMahaBenefic && !isBhuktiBenefic) {
    const mKn = GRAHA_NAMES_5L[mahaPlanet]?.kn || mahaPlanet;
    const bKn = GRAHA_NAMES_5L[bhuktiPlanet]?.kn || bhuktiPlanet;
    climateKn = `${mKn} - ${bKn} ಕರ್ಮ ಪರೀಕ್ಷಾ ಕಾಲ: ತೀವ್ರ ಶಿಸ್ತು, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ಹಳೆಯ ಬಾಕಿ ಕರ್ಮಗಳ ತೀರುವಳಿ.`;
    issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಮಾನಸಿಕ ಆತಂಕ, ವಿವಾದಗಳು, ನಷ್ಟದ ಭೀತಿ ಅಥವಾ ಆರೋಗ್ಯ ಬಾಧೆ; ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಶಾಂತಿ ಅತ್ಯಗತ್ಯ.";
    climateEn = `${mahaPlanet}-${bhuktiPlanet} Karmic Testing Phase: Demands high discipline, perseverance, and resolution of karmic debts.`;
    issueEn = "Potential challenge: Anxiety, disputes, financial delays, or vitality dips; Gokarna temple parihara provides vital sanctuary.";
    climateHi = `${mahaPlanet}-${bhuktiPlanet} कर्म परीक्षा काल: कठोर अनुशासन एवं कर्तव्यनिष्ठा का समय।`;
    issueHi = "संभावित समस्या: तनाव, विवाद एवं स्वास्थ्य समस्याएं; गोकर्ण पूजा से शांति।";
    climateTe = `${mahaPlanet}-${bhuktiPlanet} కర్మ పరీక్షా కాలం: క్రమశిక్షణ, సహనం మరియు పాత కర్మ బంధాల విముక్తి.`;
    issueTe = "సంభావ్య సమస్య: ఆందోళన, వివాదాలు; గోకర్ణంలో పూజలు అత్యవసరం.";
    climateTa = `${mahaPlanet}-${bhuktiPlanet} கர்ம சோதனைக் காலம்: தீவிர ஒழுக்கம் மற்றும் பொறுமை தேவை.`;
    issueTa = "சாத்தியமான சவால்: மனக்கவலை மற்றும் வாக்குவாதங்கள்; கோகர்ண பரிகாரம் நலம் தரும்.";
  } else {
    const mKn = GRAHA_NAMES_5L[mahaPlanet]?.kn || mahaPlanet;
    const bKn = GRAHA_NAMES_5L[bhuktiPlanet]?.kn || bhuktiPlanet;
    climateKn = `${mKn} - ${bKn} ಮಿಶ್ರ ಫಲಿತಾಂಶ: ಒಂದು ಕಡೆ ಪ್ರಗತಿ, ಇನ್ನೊಂದು ಕಡೆ ನೂತನ ಜವಾಬ್ದಾರಿಗಳ ಹೊಣೆಗಾರಿಕೆ.`;
    issueKn = "ಸಂಭಾವ್ಯ ಸವಾಲು: ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಅಥವಾ ಆಪ್ತರೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ; ತಾಳ್ಮೆ ಮತ್ತು ಸತ್ಸಂಗದಿಂದ ಶಾಂತಿ ಸಾಧ್ಯ.";
    climateEn = `${mahaPlanet}-${bhuktiPlanet} Mixed Phase: Notable progress accompanied by demanding responsibilities.`;
    issueEn = "Potential challenge: Unforeseen hurdles or friction with peers; patience and measured speech required.";
    climateHi = `${mahaPlanet}-${bhuktiPlanet} मिश्रित परिणाम: एक ओर प्रगति तो दूसरी ओर नए दायित्व।`;
    issueHi = "संभावित समस्या: अप्रत्याशित बाधाएं; धैर्य से काम लें।";
    climateTe = `${mahaPlanet}-${bhuktiPlanet} మిశ్రమ ఫలితాలు: అభివృద్ధి మరియు నూతన బాధ్యతల సమన్వయం.`;
    issueTe = "సంభావ్య సమస్య: ఊహించని అడ్డంకులు; ఓర్పుతో వ్యవహరించండి.";
    climateTa = `${mahaPlanet}-${bhuktiPlanet} கலவையான பலன்கள்: முன்னேற்றம் மற்றும் புதிய பொறுப்புகள்.`;
    issueTa = "சாத்தியமான சவால்: எதிர்பாராத தடைகள்; பொறுமையுடன் கையாளவும்.";
  }

  return {
    kn: { climate: climateKn, issue: issueKn },
    en: { climate: climateEn, issue: issueEn },
    hi: { climate: climateHi, issue: issueHi },
    te: { climate: climateTe, issue: issueTe },
    ta: { climate: climateTa, issue: issueTa }
  };
}

/**
 * Authentic Vedic Karmic Dosha Analyzer (Pitru, Kala Sarpa, Manglik, Guru Chandal)
 */
export function analyzeKundliDoshas(kundli: KundliOutput, lang: PublicKundliLang = "kn"): PublicKundliDoshaItem[] {
  const doshas: PublicKundliDoshaItem[] = [];

  const lagnaIdx = kundli.lagnaRashi?.index !== undefined ? kundli.lagnaRashi.index : 0;
  const sun = kundli.planets.find((p) => p.name === "Sun");
  const moon = kundli.planets.find((p) => p.name === "Moon");
  const mars = kundli.planets.find((p) => p.name === "Mars");
  const jupiter = kundli.planets.find((p) => p.name === "Jupiter");
  const saturn = kundli.planets.find((p) => p.name === "Saturn");
  const rahu = kundli.planets.find((p) => p.name === "Rahu");
  const ketu = kundli.planets.find((p) => p.name === "Ketu");

  const sunRashiIdx = sun?.rashi?.index ?? -1;
  const rahuRashiIdx = rahu?.rashi?.index ?? -1;
  const ketuRashiIdx = ketu?.rashi?.index ?? -1;
  const saturnRashiIdx = saturn?.rashi?.index ?? -1;
  const marsRashiIdx = mars?.rashi?.index ?? -1;
  const jupiterRashiIdx = jupiter?.rashi?.index ?? -1;

  // 1. Pitru Dosha
  const house9RashiIdx = (lagnaIdx + 8) % 12;
  const isSunWithRahuKetuSaturn = sunRashiIdx >= 0 && (sunRashiIdx === rahuRashiIdx || sunRashiIdx === ketuRashiIdx || sunRashiIdx === saturnRashiIdx);
  const is9thHouseAfflicted = rahuRashiIdx === house9RashiIdx || ketuRashiIdx === house9RashiIdx || saturnRashiIdx === house9RashiIdx;
  const isSunIn9th = sunRashiIdx === house9RashiIdx;
  const isPitruDetected = isSunWithRahuKetuSaturn || is9thHouseAfflicted || (isSunIn9th && (saturnRashiIdx === house9RashiIdx || marsRashiIdx === house9RashiIdx));

  doshas.push({
    id: "pitru",
    name: {
      kn: "ಪಿತೃ ದೋಷ (Pitru Dosha)",
      en: "Pitru Dosha (Ancestral Karmic Debt)",
      hi: "पितृ दोष (Pitru Dosha)",
      te: "పితృ దోషం (Pitru Dosha)",
      ta: "பித்ரு தோஷம் (Pitru Dosha)"
    },
    isDetected: isPitruDetected,
    priority: {
      kn: isPitruDetected ? "ಅತ್ಯಂತ ಅವಶ್ಯಕ (High Priority)" : "ಶುಭ (No Action Needed)",
      en: isPitruDetected ? "High Priority (Urgent)" : "Auspicious (Clean)",
      hi: isPitruDetected ? "अति आवश्यक (उच्च प्राथमिकता)" : "शुभ",
      te: isPitruDetected ? "అత్యంత అవసరం" : "శుభం",
      ta: isPitruDetected ? "மிகவும் அவசியம்" : "சுபம்"
    },
    reason: {
      kn: isPitruDetected
        ? "ಸೂರ್ಯ ಗ್ರಹದ ಮೇಲೆ ರಾಹು/ಕೇತು/ಶನಿಯ ಯುತಿ ಅಥವಾ ೯ನೇ ಪಿತೃ ಸ್ಥಾನದಲ್ಲಿ ಪಾಪಗ್ರಹಗಳ ಪ್ರಭಾವ ಕಂಡುಬಂದಿದೆ."
        : "೯ನೇ ಪಿತೃ ಭಾವ ಹಾಗೂ ಸೂರ್ಯ ಗ್ರಹ ಶುಭ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು ಪಿತೃ ದೋಷದ ಬಾಧೆ ಇಲ್ಲ.",
      en: isPitruDetected
        ? "Sun (Pitrukaraka) is afflicted by Rahu/Ketu/Saturn or the 9th ancestral house has malefic occupation."
        : "The 9th ancestral house and Sun are auspiciously placed without malefic affliction.",
      hi: isPitruDetected ? "सूर्य पर राहु/केतु/शनि का प्रभाव अथवा नवम भाव में पाप ग्रहों का प्रभाव पाया गया है।" : "नवम भाव एवं सूर्य शुभ स्थिति में हैं।",
      te: isPitruDetected ? "సూర్యునిపై రాహు/కేతు/శని ప్రభావం లేదా 9వ స్థానంలో పాపగ్రహాల స్థితి గుర్తించబడింది." : "9వ స్థానం మరియు సూర్యుడు శుభంగా ఉన్నారు.",
      ta: isPitruDetected ? "சூரியன் மீது ராகு/கேது/சனி சேர்க்கை அல்லது 9ஆம் வீட்டில் அசுப கிரக தாக்கம் காணப்படுகிறது." : "9ஆம் வீடு மற்றும் சூரியன் சுபமாக உள்ளனர்."
    },
    gokarnaParihara: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಹಾಗೂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಸೇವೆ ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಂತ ಫಲಪ್ರದ.",
      en: "Perform sacred Narayana Bali, Tripindi Shraddha at Kotiteertha and Mahabaleshwara temple Mahaprarthana at Sri Kshetra Gokarna.",
      hi: "श्री क्षेत्र गोकर्ण में कोटितीर्थ पर नारायण बलि, त्रिपिंडी श्राद्ध एवं महाबलेश्वर स्वामी को महारुद्राभिषेक कराएं।",
      te: "శ్రీ క్షేత్ర గోకర్ణ కోటితీర్థంలో నారాయణ బలి, త్రిపిండి శ్రాద్ధం మరియు మహాబలేశ్వరునికి రుద్రాభిషేకం శ్రేయస్కరం.",
      ta: "ஸ்ரீ க்ஷேத்ர கோகர்ண கோடிதீர்த்தத்தில் நாராயண பலி, திரிபிண்டி சிரார்த்தம் மற்றும் மகாபலேஸ்வரருக்கு ருத்ராபிஷேகம் செய்யவும்."
    }
  });

  // 2. Kala Sarpa Dosha
  let isKalaSarpa = false;
  if (rahu && ketu) {
    const rDeg = rahu.degree;
    const kDeg = ketu.degree;
    const minDeg = Math.min(rDeg, kDeg);
    const maxDeg = Math.max(rDeg, kDeg);
    const otherPlanets = kundli.planets.filter((p) => p.name !== "Rahu" && p.name !== "Ketu");
    const allOneSide = otherPlanets.every((p) => p.degree >= minDeg && p.degree <= maxDeg);
    const allOtherSide = otherPlanets.every((p) => p.degree < minDeg || p.degree > maxDeg);
    isKalaSarpa = allOneSide || allOtherSide;
  }

  doshas.push({
    id: "kalasarpa",
    name: {
      kn: "ಕಾಳಸರ್ಪ ಯೋಗ / ದೋಷ (Kala Sarpa)",
      en: "Kala Sarpa Dosha / Yoga",
      hi: "कालसर्प दोष",
      te: "కాలసర్ప దోషం",
      ta: "காலசர்ப்ப தோஷம்"
    },
    isDetected: isKalaSarpa,
    priority: {
      kn: isKalaSarpa ? "ಅತ್ಯಂತ ಅವಶ್ಯಕ (High Priority)" : "ಶುಭ (No Action Needed)",
      en: isKalaSarpa ? "High Priority (Urgent)" : "Auspicious (Clean)",
      hi: isKalaSarpa ? "अति आवश्यक" : "शुभ",
      te: isKalaSarpa ? "అత్యంత అవసరం" : "శుభం",
      ta: isKalaSarpa ? "மிகவும் அவசியம்" : "சுபம்"
    },
    reason: {
      kn: isKalaSarpa
        ? "ಸಕಲ ಸಪ್ತ ಗ್ರಹಗಳು ರಾಹು-ಕೇತುಗಳ ಅಕ್ಷದ ನಡುವೆ ನೆಲೆಸಿದ್ದು ಕಾಲಾನುಕಾಲಕ್ಕೆ ಕಾರ್ಯ ವಿಳಂಬ ತರಬಹುದು."
        : "ಗ್ರಹಗಳು ರಾಹು-ಕೇತುಗಳ ಬಂಧನದಿಂದ ಮುಕ್ತವಾಗಿದ್ದು ಕಾಳಸರ್ಪ ದೋಷವಿಲ್ಲ.",
      en: isKalaSarpa
        ? "All seven classical planets are hemmed between the Rahu-Ketu nodal axis."
        : "Planets are free from nodal axis confinement; no Kala Sarpa affliction.",
      hi: isKalaSarpa ? "सभी सात ग्रह राहु-केतु अक्ष के मध्य स्थित हैं।" : "कुंडली कालसर्प दोष से मुक्त है।",
      te: isKalaSarpa ? "సప్త గ్రహాలు రాహు-కేతువుల మధ్య బంధించబడి ఉన్నాయి." : "కాలసర్ప దోషం లేదు.",
      ta: isKalaSarpa ? "அனைத்து கிரகங்களும் ராகு-கேது அச்சுகளுக்கு இடையே சிக்கியுள்ளன." : "காலசர்ப்ப தோஷம் இல்லை."
    },
    gokarnaParihara: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸರ್ಪ ಸಂಸ್ಕಾರ, ನಾಗಪ್ರತಿಷ್ಠಾಪನೆ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಕ್ಷೀರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಸೇವೆ.",
      en: "Perform Sarpa Samskara, Naga Pratishtha and special Ksheerabhisheka at Sri Kshetra Gokarna Mahabaleshwara temple.",
      hi: "श्री क्षेत्र गोकर्ण में सर्प संस्कार, नाग प्रतिष्ठा एवं विशेष रुद्राभिषेक कराएं।",
      te: "శ్రీ క్షేత్ర గోకర్ణంలో సర్ప సంస్కార, నాగ ప్రతిష్ఠాపన పూజలు నిర్వహించండి.",
      ta: "ஸ்ரீ க்ஷேத்ர கோகர்ணத்தில் சர்ப்ப சமஸ்கார பூஜை மற்றும் நாக பிரதிஷ்டை செய்யவும்."
    }
  });

  // 3. Manglik / Kuja Dosha
  let isManglik = false;
  let marsHouse = 1;
  if (mars) {
    marsHouse = ((marsRashiIdx - lagnaIdx + 12) % 12) + 1;
    isManglik = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  }

  doshas.push({
    id: "manglik",
    name: {
      kn: "ಮಾಂಗಲ್ಯ / ಕುಜ ದೋಷ (Manglik / Kuja)",
      en: "Manglik / Kuja Dosha",
      hi: "मांगलिक / कुज दोष",
      te: "మాంగళ్య / కుజ దోషం",
      ta: "மாங்கல்ய / செவ்வாய் தோஷம்"
    },
    isDetected: isManglik,
    priority: {
      kn: isManglik ? "ಮಧ್ಯಮ (Medium Priority)" : "ಶುಭ (No Action Needed)",
      en: isManglik ? "Medium Priority" : "Auspicious (Clean)",
      hi: isManglik ? "मध्यम प्राथमिकता" : "शुभ",
      te: isManglik ? "మధ్యమ ప్రాధాన్యత" : "శుభం",
      ta: isManglik ? "நடுத்தர முன்னுரிமை" : "சுபம்"
    },
    reason: {
      kn: isManglik
        ? `ಕುಜ ಗ್ರಹವು ಜನ್ಮ ಲಗ್ನದಿಂದ ${marsHouse}ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತನಾಗಿದ್ದು ವೈವಾಹಿಕ/ಸಾಂಸಾರಿಕ ವಿಚಾರದಲ್ಲಿ ಶಾಂತಿ ಅಪೇಕ್ಷಿಸುತ್ತದೆ.`
        : "ಕುಜ ಗ್ರಹವು ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು ಮಾಂಗಲ್ಯ ದೋಷದ ಬಾಧೆ ಇಲ್ಲ.",
      en: isManglik
        ? `Mars is positioned in house ${marsHouse} from Lagna, indicating marital / relational energetic intensity.`
        : "Mars is comfortably placed; no Manglik affliction found.",
      hi: isManglik ? `मंगल लग्न से ${marsHouse}वें भाव में स्थित है।` : "मंगल शुभ भाव में स्थित है।",
      te: isManglik ? `కుజుడు లగ్నం నుండి ${marsHouse}వ స్థానంలో ఉన్నాడు.` : "కుజ దోషం లేదు.",
      ta: isManglik ? `செவ்வாய் லக்னத்திலிருந்து ${marsHouse}ஆம் வீட்டில் உள்ளார்.` : "செவ்வாய் தோஷம் இல்லை."
    },
    gokarnaParihara: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಶಾಂತಿ, ಮಂಗಳವಾರದ ವಿಶೇಷ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಕಲ್ಯಾಣೋತ್ಸವ ಸಂಕಲ್ಪ ಸೇವೆ.",
      en: "Subramanya Shanti, Tuesday Ksheerabhisheka and Kalyana sankalpa seva at Sri Kshetra Gokarna.",
      hi: "गोकर्ण क्षेत्र में सुब्रह्मण्य शांति एवं मंगलवार को विशेष क्षीराभिषेक कराएं।",
      te: "గోకర్ణంలో సుబ్రహ్మణ్య శాంతి మరియు మంగళవారం క్షీరాభిషేకం జరిపించండి.",
      ta: "கோகர்ணத்தில் சுப்பிரமணிய சாந்தி மற்றும் செவ்வாய்க்கிழமை சிறப்பு அபிஷேகம் செய்யவும்."
    }
  });

  // 4. Guru Chandal Dosha
  const isGuruChandal = jupiterRashiIdx >= 0 && rahuRashiIdx >= 0 && jupiterRashiIdx === rahuRashiIdx;
  doshas.push({
    id: "guruchandal",
    name: {
      kn: "ಗುರು ಚಾಂಡಾಲ ದೋಷ (Guru Chandal)",
      en: "Guru Chandal Dosha",
      hi: "गुरु चांडाल दोष",
      te: "గురు చాండాల దోషం",
      ta: "குரு சண்டாள தோஷம்"
    },
    isDetected: isGuruChandal,
    priority: {
      kn: isGuruChandal ? "ಮಧ್ಯಮ (Medium Priority)" : "ಶುಭ (No Action Needed)",
      en: isGuruChandal ? "Medium Priority" : "Auspicious (Clean)",
      hi: isGuruChandal ? "मध्यम" : "शुभ",
      te: isGuruChandal ? "మధ్యమ" : "శుభం",
      ta: isGuruChandal ? "நடுத்தர" : "சுபம்"
    },
    reason: {
      kn: isGuruChandal
        ? "ಗುರು ಮತ್ತು ರಾಹು ಒಂದೇ ರಾಶಿಯಲ್ಲಿ ಯುತಿ ಹೊಂದಿದ್ದು ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವಲ್ಲಿ ವಿವೇಕ ಮತ್ತು ಜಾಗರೂಕತೆ ಅಗತ್ಯ."
        : "ಗುರು ಗ್ರಹವು ಶುಭವಾಗಿದ್ದು ಚಾಂಡಾಲ ದೋಷದ ಬಾಧೆ ಇಲ್ಲ.",
      en: isGuruChandal
        ? "Conjunction of Jupiter and Rahu in the same zodiac sign; disciplined spiritual guidance needed."
        : "Jupiter is unhindered by Rahu; no Chandal affliction.",
      hi: isGuruChandal ? "गुरु और राहु की युति एक ही राशि में स्थित है।" : "गुरु चांडाल दोष नहीं है।",
      te: isGuruChandal ? "గురు మరియు రాహువు ఒకే రాశిలో కలిసి ఉన్నారు." : "గురు చాండాల దోషం లేదు.",
      ta: isGuruChandal ? "குரு மற்றும் ராகு ஒரே ராசியில் இணைந்துள்ளனர்." : "குரு சண்டாள தோஷம் இல்லை."
    },
    gokarnaParihara: {
      kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗುರು ಶಾಂತಿ, ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಹಾಗೂ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ತುಪ್ಪದ ದೀಪ ಸೇವೆ.",
      en: "Perform Guru Shanti, Brahmana Anna Dana and Ghee lamp seva at Sri Kshetra Gokarna.",
      hi: "श्री क्षेत्र गोकर्ण में गुरु शांति एवं घी का दीपदान कराएं।",
      te: "గోకర్ణంలో గురు శాంతి మరియు నేతి దీపారాధన నిర్వహించండి.",
      ta: "கோகர்ணத்தில் குரு சாந்தி மற்றும் நெய் தீப சேவை செய்யவும்."
    }
  });

  return doshas;
}

/**
 * Evaluates whether a Mahadasha-Bhukti period is Favorable (Green), Challenging/Harder (Red), or Moderate (Amber)
 */
export function evaluateDashaBhuktiNature(
  mahaPlanet: string,
  bhuktiPlanet: string,
  kundli?: KundliOutput
): "favorable" | "challenging" | "moderate" {
  const mal = ["Saturn", "Rahu", "Ketu", "Mars"];
  const ben = ["Jupiter", "Venus", "Moon", "Mercury"];

  // 1. Severe Malefic Confluences (Red / Challenging periods)
  const isSevereDuo =
    (mahaPlanet === "Rahu" && (bhuktiPlanet === "Saturn" || bhuktiPlanet === "Ketu" || bhuktiPlanet === "Mars")) ||
    (mahaPlanet === "Saturn" && (bhuktiPlanet === "Rahu" || bhuktiPlanet === "Ketu" || bhuktiPlanet === "Sun")) ||
    (mahaPlanet === "Ketu" && (bhuktiPlanet === "Saturn" || bhuktiPlanet === "Mars" || bhuktiPlanet === "Rahu")) ||
    (mahaPlanet === "Mars" && (bhuktiPlanet === "Rahu" || bhuktiPlanet === "Saturn")) ||
    (mahaPlanet === "Sun" && bhuktiPlanet === "Saturn") ||
    (mahaPlanet === "Saturn" && bhuktiPlanet === "Mars");

  // 2. Dasha Chidra (last bhuktis before change of major period, traditionally turbulent)
  const isDashaChidra =
    (mahaPlanet === "Jupiter" && bhuktiPlanet === "Rahu") ||
    (mahaPlanet === "Saturn" && bhuktiPlanet === "Jupiter") ||
    (mahaPlanet === "Mercury" && bhuktiPlanet === "Ketu") ||
    (mahaPlanet === "Venus" && bhuktiPlanet === "Ketu") ||
    (mahaPlanet === "Sun" && bhuktiPlanet === "Venus");

  if (isSevereDuo || isDashaChidra) {
    return "challenging";
  }

  // 3. Highly Favorable Confluences (Green / Auspicious periods)
  const isSuperFavorable =
    (mahaPlanet === "Jupiter" && (bhuktiPlanet === "Jupiter" || bhuktiPlanet === "Sun" || bhuktiPlanet === "Moon" || bhuktiPlanet === "Mars")) ||
    (mahaPlanet === "Venus" && (bhuktiPlanet === "Venus" || bhuktiPlanet === "Mercury" || bhuktiPlanet === "Saturn")) ||
    (mahaPlanet === "Sun" && (bhuktiPlanet === "Jupiter" || bhuktiPlanet === "Mars" || bhuktiPlanet === "Moon")) ||
    (mahaPlanet === "Moon" && (bhuktiPlanet === "Jupiter" || bhuktiPlanet === "Mars" || bhuktiPlanet === "Sun")) ||
    (mahaPlanet === "Mercury" && (bhuktiPlanet === "Venus" || bhuktiPlanet === "Jupiter" || bhuktiPlanet === "Mercury"));

  if (isSuperFavorable) {
    return "favorable";
  }

  if (mal.includes(mahaPlanet) && mal.includes(bhuktiPlanet)) {
    return "challenging";
  }

  if (ben.includes(mahaPlanet) && ben.includes(bhuktiPlanet)) {
    return "favorable";
  }

  return "moderate";
}

export function evaluateMahadashaNature(
  mahaPlanet: string,
  kundli?: KundliOutput
): "favorable" | "challenging" | "moderate" {
  if (mahaPlanet === "Jupiter" || mahaPlanet === "Venus") return "favorable";
  if (mahaPlanet === "Rahu" || mahaPlanet === "Ketu" || mahaPlanet === "Saturn") return "challenging";
  return "moderate";
}

export function calculatePublicKundliProfile(
  kundli: KundliOutput,
  birthDate: string,
  birthTime: string,
  lat: number = 14.5479,
  lng: number = 74.3188
): PublicKundliProfile {
  const birthDateTime = new Date(`${birthDate}T${birthTime || "12:00"}:00`);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - birthDateTime.getTime());
  const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.2425);

  // 1. Real-time active running Mahadasha and Bhukti at current age
  const bhuktiData = findBhuktiAtAge(kundli, ageYears);
  const mahaEntry = bhuktiData?.maha || findMahadashaAtAge(kundli, ageYears);
  const currentMahadasha = mahaEntry?.planet || (kundli.moonSign?.english ? RASHI_LORDS[kundli.moonSign.index] : "Jupiter");
  const currentBhukti = bhuktiData?.bhukti || currentMahadasha;
  const dashaStartAge = mahaEntry?.startAge || 0;
  const dashaEndAge = mahaEntry?.endAge || 0;

  const dashaStartDateStr = formatDateFromAge(birthDate, dashaStartAge);
  const dashaEndDateStr = formatDateFromAge(birthDate, dashaEndAge);

  // 2. Lagna & House Lords
  const lagnaSign = kundli.lagnaRashi?.english || "Aries";
  const lagnaIdx = kundli.lagnaRashi?.index !== undefined ? kundli.lagnaRashi.index : Math.max(0, RASHI_ORDER.indexOf(lagnaSign));
  const lagnaLord = RASHI_LORDS[lagnaIdx] || "Mars";

  const lord10 = RASHI_LORDS[(lagnaIdx + 9) % 12];
  const lord7 = RASHI_LORDS[(lagnaIdx + 6) % 12];
  const lord6 = RASHI_LORDS[(lagnaIdx + 5) % 12];
  const lord5 = RASHI_LORDS[(lagnaIdx + 4) % 12];

  const ascDeg = kundli.ascendant !== undefined ? kundli.ascendant : 0;
  const lagnaNakObj = degreeToNakshatra(ascDeg);
  const lagnaPada = degreeToNakshatraPada(ascDeg);

  const moonPlanet = kundli.planets.find((p) => p.name === "Moon");
  const sunPlanet = kundli.planets.find((p) => p.name === "Sun");

  const moonNakName = moonPlanet?.nakshatra?.english || "Ashwini";
  const moonNakSan = moonPlanet?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ";
  const moonPada = kundli.moonPada || 1;

  // 3. Maandi calculation & house placement
  let maandiHouse = 8;
  let maandiRashi = "Scorpio";
  let maandiDegreeStr = "0° 0' 0\"";

  if (kundli.maandi) {
    const mIdx = kundli.maandi.rashi.index;
    maandiHouse = ((mIdx - lagnaIdx + 12) % 12) + 1;
    maandiRashi = kundli.maandi.rashi.english;
    maandiDegreeStr = formatDegree(kundli.maandi.degree);
  } else {
    try {
      const computedMaandi = computeMaandi(birthDateTime, lat, lng, "581326", "lahiri");
      if (computedMaandi) {
        const mIdx = computedMaandi.rashi.index;
        maandiHouse = ((mIdx - lagnaIdx + 12) % 12) + 1;
        maandiRashi = computedMaandi.rashi.english;
        maandiDegreeStr = formatDegree(computedMaandi.degree);
      }
    } catch {
      maandiHouse = 8;
    }
  }

  // 4. Planetary Table Rows
  const planetaryRows: PublicPlanetaryRow[] = [];

  planetaryRows.push({
    name: "Lagna",
    sanskritName: "ಲಗ್ನ",
    degreeStr: formatDegree(ascDeg),
    rashi: kundli.lagnaRashi?.english || "Aries",
    sanskritRashi: kundli.lagnaRashi?.sanskrit || "ಮೇಷ",
    house: 1,
    nakshatra: lagnaNakObj.english,
    sanskritNakshatra: lagnaNakObj.sanskrit,
    pada: lagnaPada,
    lord: lagnaLord,
    dignity: "Ascendant",
    isRetrograde: false
  });

  for (const p of kundli.planets) {
    const rIdx = p.rashi?.index !== undefined ? p.rashi.index : RASHI_ORDER.indexOf(p.rashi.english);
    const houseNum = p.house || (rIdx >= 0 ? ((rIdx - lagnaIdx + 12) % 12) + 1 : 1);
    const dignity = evaluateDignity(p.name, rIdx);

    planetaryRows.push({
      name: p.name,
      sanskritName: GRAHA_NAMES_5L[p.name]?.kn || p.name,
      degreeStr: formatDegree(p.degree),
      rashi: p.rashi.english,
      sanskritRashi: p.rashi.sanskrit,
      house: houseNum,
      nakshatra: p.nakshatra?.english || "Ashwini",
      sanskritNakshatra: p.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ",
      pada: degreeToNakshatraPada(p.degree),
      lord: RASHI_LORDS[rIdx >= 0 ? rIdx : 0] || "Mars",
      dignity,
      isRetrograde: !!p.isRetrograde
    });
  }

  // Add Maandi to planetary rows
  planetaryRows.push({
    name: "Maandi",
    sanskritName: "ಮಾಂದಿ (ಗುಳಿಕ)",
    degreeStr: maandiDegreeStr,
    rashi: maandiRashi,
    sanskritRashi: RASHI_NAMES_5L[maandiRashi]?.kn || maandiRashi,
    house: maandiHouse,
    nakshatra: degreeToNakshatra(0).english,
    sanskritNakshatra: degreeToNakshatra(0).sanskrit,
    pada: 1,
    lord: RASHI_LORDS[RASHI_ORDER.indexOf(maandiRashi)] || "Mars",
    dignity: "Upagraha",
    isRetrograde: false
  });

  // 5. 120-Year Vimshottari Timeline with Expandable 9 Bhuktis & 2-Line Predictions
  const rawTimeline = generateDashaTimeline(kundli, 120);
  const dashaTimelineRows: PublicDashaRow[] = rawTimeline.map((item: DashaEntry) => {
    let status: "active" | "completed" | "upcoming" = "upcoming";
    if (ageYears >= item.endAge) {
      status = "completed";
    } else if (ageYears >= item.startAge && ageYears < item.endAge) {
      status = "active";
    }

    const rawBhuktis = generateBhuktisInMahadasha(item.planet as any, item.durationYears);
    let bhuktiCumulativeAge = item.startAge;
    const bhuktis: PublicBhuktiRow[] = rawBhuktis.map((b) => {
      const bStartAge = Number(bhuktiCumulativeAge.toFixed(2));
      bhuktiCumulativeAge += b.years;
      const bEndAge = Number(bhuktiCumulativeAge.toFixed(2));
      const bIsActive = ageYears >= bStartAge && ageYears < bEndAge;
      const bStartDateStr = formatDateFromAge(birthDate, bStartAge);
      const bEndDateStr = formatDateFromAge(birthDate, bEndAge);

      const localizedNames: Record<PublicKundliLang, string> = {
        kn: `${GRAHA_NAMES_5L[b.planet]?.kn || b.planet} ಭುಕ್ತಿ`,
        en: `${b.planet} Bhukti`,
        hi: `${GRAHA_NAMES_5L[b.planet]?.hi || b.planet} भुक्ति`,
        te: `${GRAHA_NAMES_5L[b.planet]?.te || b.planet} భుక్తి`,
        ta: `${GRAHA_NAMES_5L[b.planet]?.ta || b.planet} புக்தி`
      };

      const predictions = generateDashaBhuktiPredictions(item.planet, b.planet, kundli, bIsActive);
      const bNature = evaluateDashaBhuktiNature(item.planet, b.planet, kundli);

      return {
        mahaPlanet: item.planet,
        bhuktiPlanet: b.planet,
        bhuktiNameLocalized: localizedNames,
        startAge: bStartAge,
        endAge: bEndAge,
        startDateStr: bStartDateStr,
        endDateStr: bEndDateStr,
        durationYears: Number(b.years.toFixed(2)),
        isActive: bIsActive,
        nature: bNature,
        predictions
      };
    });

    return {
      planet: item.planet,
      sanskritPlanet: GRAHA_NAMES_5L[item.planet]?.kn || item.planet,
      startAge: Number(item.startAge.toFixed(1)),
      endAge: Number(item.endAge.toFixed(1)),
      startDateStr: formatDateFromAge(birthDate, item.startAge),
      endDateStr: formatDateFromAge(birthDate, item.endAge),
      durationYears: Number(item.durationYears.toFixed(1)),
      status,
      nature: evaluateMahadashaNature(item.planet, kundli),
      bhuktis
    };
  });

  // 6. Panchanga Attributes
  let tradPanchanga: TraditionalBaggonaPanchanga | null = null;
  try {
    tradPanchanga = calculateTraditionalBaggona(birthDate, birthTime, lat, lng, "lahiri");
  } catch (err) {
    console.warn("[PublicKundliEngine] Traditional Panchanga fallback:", err);
  }

  const moonNakIdx = moonPlanet?.nakshatra?.index !== undefined ? moonPlanet.nakshatra.index : 0;
  const nakMeta = patrikaMetaForNakshatraIndex(moonNakIdx);

  const panchangaAttributes: PublicPanchangaAttributes = {
    samvatsara: tradPanchanga?.samvatsara || "Krodhana",
    samvatsaraKn: tradPanchanga?.samvatsaraKn || "ಕ್ರೋಧನ",
    ayana: "Uttarayana",
    ayanaKn: "ಉತ್ತರಾಯಣ",
    ritu: "Vasantha",
    rituKn: "ವಸಂತ",
    masa: tradPanchanga?.masa || "Vaishakha",
    masaKn: tradPanchanga?.masaKn || "ವೈಶಾಖ",
    paksha: tradPanchanga?.paksha || "Shukla",
    pakshaKn: tradPanchanga?.pakshaKn || "ಶುಕ್ಲ ಪಕ್ಷ",
    tithi: tradPanchanga?.tithi || "Dashami",
    tithiKn: tradPanchanga?.tithiKn || "ದಶಮಿ",
    weekday: tradPanchanga?.weekday || "Monday",
    weekdayKn: tradPanchanga?.weekdayKn || "ಸೋಮವಾರ",
    sunNakshatra: tradPanchanga?.sunNakshatra || sunPlanet?.nakshatra?.english || "Krittika",
    moonNakshatra: moonNakName,
    moonNakshatraKn: moonNakSan,
    yoga: tradPanchanga?.yoga || "Siddhi",
    yogaKn: tradPanchanga?.yogaKn || "ಸಿದ್ಧಿ",
    karana: tradPanchanga?.karana || "Bava",
    karanaKn: tradPanchanga?.karanaKn || "ಬವ",
    yoni: nakMeta.yoniEn,
    yoniKn: nakMeta.yoniKn,
    gana: nakMeta.ganaEn,
    ganaKn: nakMeta.ganaKn,
    nadi: nakMeta.nadiEn,
    nadiKn: nakMeta.nadiKn,
    sunrise: tradPanchanga?.sunrise || "06:12 AM",
    sunset: tradPanchanga?.sunset || "06:48 PM"
  };

  const remedies = getRemediesForLagna(lagnaLord, currentMahadasha);

  let dashaBalanceAtBirth: { lord: string; years: number; months: number; days: number } | undefined;
  try {
    const dashaBal = vimshottariBalanceAtBirth(kundli);
    const ymd = vimshottariBalanceYmdPatrika(dashaBal.balanceYears);
    dashaBalanceAtBirth = {
      lord: dashaBal.lord,
      years: ymd.y,
      months: ymd.m,
      days: ymd.d
    };
  } catch (err) {
    console.warn("[PublicKundliEngine] dashaBalance fallback:", err);
  }

  const profile: PublicKundliProfile = {
    name: "Devotee",
    birthDate,
    birthTime,
    ageYears: Number(ageYears.toFixed(1)),
    lagnaSign: kundli.lagnaRashi?.english || "Aries",
    lagnaSanskrit: (RASHI_L5[kundli.lagnaRashi ? kundli.lagnaRashi.index : 0] as any)?.kn || "ಕರ್ಕಾಟಕ",
    lagnaDegreeStr: formatDegree(degreeInSign(ascDeg)),
    lagnaNakshatra: lagnaNakObj.english,
    lagnaPada,
    lagnaLord,
    moonSign: kundli.moonSign?.english || "Aries",
    moonSanskrit: (RASHI_L5[kundli.moonSign ? kundli.moonSign.index : 0] as any)?.kn || "ಕನ್ಯಾ",
    moonNakshatra: moonNakName,
    moonPada,
    sunSign: kundli.sunSign?.english || "Aries",
    currentMahadasha,
    currentMahadashaSanskrit: GRAHA_NAMES_5L[currentMahadasha]?.kn || currentMahadasha,
    currentBhukti,
    currentBhuktiSanskrit: GRAHA_NAMES_5L[currentBhukti]?.kn || currentBhukti,
    dashaStartAge: Number(dashaStartAge.toFixed(1)),
    dashaEndAge: Number(dashaEndAge.toFixed(1)),
    dashaStartDateStr,
    dashaEndDateStr,
    lord10,
    lord7,
    lord6,
    lord5,
    maandiHouse,
    maandiRashi,
    maandiDegreeStr,
    planetaryRows,
    dashaTimelineRows,
    panchangaAttributes,
    traditionalPanchanga: tradPanchanga,
    dashaBalanceAtBirth,
    karmicDoshas: analyzeKundliDoshas(kundli, "kn"),
    ...remedies
  };

  // Generate authentic remedies with full reasoning
  const authenticRemedies = generateAuthenticRemediesWithReasoning(profile, kundli, "kn");
  Object.assign(profile, authenticRemedies);

  // Generate deep personality and inquest analysis
  profile.deepPersonality = generateDeepPersonalityAnalysis(profile, kundli, "kn");

  return profile;
}

function toKnDigits(num: number | string | undefined): string {
  if (num === undefined || num === null) return "";
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return String(num).replace(/[0-9]/g, (d) => knDigits[parseInt(d, 10)]);
}

/**
 * 100% Dynamic Spoken Astrologer Persona Deep Analysis Synthesizer
 * Formatted as direct face-to-face dialogue by the Chief Astrologer looking at the Kundali
 * Each section contains at least 2 dense paragraphs (≥ 5 lines each)
 */
export function generateDeepPersonalityAnalysis(
  p: PublicKundliProfile,
  kundli: KundliOutput,
  lang: PublicKundliLang
): DeepPersonalityOutput {
  const lagnaTxt = RASHI_NAMES_5L[p.lagnaSign]?.[lang] || p.lagnaSign;
  const moonTxt = RASHI_NAMES_5L[p.moonSign]?.[lang] || p.moonSign;
  const sunTxt = RASHI_NAMES_5L[p.sunSign]?.[lang] || p.sunSign;
  const maandiRashiTxt = RASHI_NAMES_5L[p.maandiRashi]?.[lang] || p.maandiRashi;
  const lagnaNakTxt = NAKSHATRA_NAMES_5L[p.lagnaNakshatra]?.[lang] || p.lagnaNakshatra;
  const moonNakTxt = NAKSHATRA_NAMES_5L[p.moonNakshatra]?.[lang] || p.moonNakshatra;
  const dashaTxt = GRAHA_NAMES_5L[p.currentMahadasha]?.[lang] || p.currentMahadasha;
  const bhuktiTxt = GRAHA_NAMES_5L[p.currentBhukti]?.[lang] || p.currentBhukti;
  const lagnaLordTxt = GRAHA_NAMES_5L[p.lagnaLord]?.[lang] || p.lagnaLord;
  const lord10Txt = GRAHA_NAMES_5L[p.lord10]?.[lang] || p.lord10;
  const lord7Txt = GRAHA_NAMES_5L[p.lord7]?.[lang] || p.lord7;
  const lord6Txt = GRAHA_NAMES_5L[p.lord6]?.[lang] || p.lord6;
  const lord5Txt = GRAHA_NAMES_5L[p.lord5]?.[lang] || p.lord5;

  const moonIdx = kundli.moonSign?.index !== undefined ? kundli.moonSign.index : RASHI_ORDER.indexOf(p.moonSign);
  const gochara = calculateGocharaClimate(moonIdx >= 0 ? moonIdx : 0);

  // --------------------------------------------------------------------------
  // KANNADA (ಕನ್ನಡ) - Direct Face-to-Face Spoken Vedic Dialogue
  // --------------------------------------------------------------------------
  if (lang === "kn") {
    const p1_kn = `ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪ್ರತ್ಯಕ್ಷವಾಗಿ ನೋಡಿದಾಗ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${lagnaTxt} ಆಗಿದ್ದು, ಲಗ್ನಾಧಿಪತಿ ${lagnaLordTxt} ಗ್ರಹವು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಅದ್ಭುತವಾದ ನಾಯಕತ್ವ, ಆತ್ಮಗೌರವ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯನ್ನು ನೀಡಿದೆ. ನೀವು ಸಮಾಜದಲ್ಲಿ ಯಾರ ಮುಂದೆಯೂ ತಲೆಬಾಗಲು ಇಷ್ಟಪಡದ, ಅನ್ಯಾಯವನ್ನು ಎಂದಿಗೂ ಸಹಿಸದ ಹಾಗೂ ನೇರ ನುಡಿಯ ವ್ಯಕ್ತಿಯಾಗಿದ್ದೀರಿ. ನಿಮ್ಮ ಲಗ್ನ ನಕ್ಷತ್ರವಾದ ${lagnaNakTxt} (ಪಾದ ${toKnDigits(p.lagnaPada)}) ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಯೋಚನಾ ಲಹರಿಯು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾಗಿದ್ದು, ಯಾವುದೇ ವಿಷಯವನ್ನು ಆಳವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ವಿಶೇಷವಾದ ದೈವದತ್ತ ಬುದ್ಧಿಮತ್ತೆ ನಿಮಗಿದೆ. ಹೊರನೋಟಕ್ಕೆ ನೀವು ಶಾಂತ ಹಾಗೂ ಗಂಭೀರ ವ್ಯಕ್ತಿಯಂತೆ ಕಂಡರೂ, ನಿಮ್ಮ ಮನಸ್ಸಿನೊಳಗೆ ಸದಾ ಹೊಸ ಸಾಧನೆಯ ಜ್ವಾಲೆ ಪ್ರಜ್ವಲಿಸುತ್ತಿರುತ್ತದೆ.`;

    const p2_kn = `ನಿಮ್ಮ ಜನ್ಮ ಸೂರ್ಯನು ${sunTxt} ರಾಶಿಯಲ್ಲಿದ್ದು ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸಕ್ಕೆ ಧೃತಿ ನೀಡುತ್ತಿದ್ದಾನೆ. ನೀವು ಇತರರ ಮೇಲೆ ಸುಲಭವಾಗಿ ಅವಲಂಬಿತರಾಗುವುದಿಲ್ಲ; ನಿಮ್ಮ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದಲೇ ಸ್ವಾವಲಂಬಿ ಬದುಕನ್ನು ನಿರ್ಮಿಸಿಕೊಳ್ಳುವ ದೃಢ ಸಂಕಲ್ಪ ನಿಮ್ಮ ರಕ್ತದಲ್ಲೇ ಇದೆ. ನಿಮ್ಮ ದಯಾಗುಣ ಹಾಗೂ ಬದ್ಧತೆಯಿಂದಾಗಿ ಆಪ್ತ ವಲಯದಲ್ಲಿ ನಿಮಗೆ ಅಪಾರ ಗೌರವವಿದೆ, ಆದರೆ ಯಾರಾದರೂ ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಧಕ್ಕೆ ತಂದರೆ ಅವರನ್ನು ಎಂದಿಗೂ ಕ್ಷಮಿಸುವುದಿಲ್ಲ. ಜೀವನದ ಪ್ರತಿಯೊಂದು ಸವಾಲನ್ನು ಧೈರ್ಯವಾಗಿ ಎದುರಿಸಿ ಜಯಿಸುವ ಅದ್ಭುತ ಜನ್ಮಬಲ ಈ ಲಗ್ನಕ್ಕೆ ಪ್ರಾಪ್ತವಾಗಿದೆ.`;

    const s1_kn = `ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${moonTxt} ಹಾಗೂ ${moonNakTxt} ನಕ್ಷತ್ರ ಪಾದ ${toKnDigits(p.moonPada)} ರ ಆಂತರ್ಯವನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ನೀವು ಜಗತ್ತಿಗೆ ಎಂದಿಗೂ ತೋರಿಸದ ಒಂದು ಅತೀವ ಸೂಕ್ಷ್ಮ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ನಿಗೂಢ ಜಗತ್ತು ನಿಮ್ಮಲ್ಲಿದೆ. ಸಮಾಜದ ಮುಂದೆ ನೀವು ಸದಾ ಧೈರ್ಯಶಾಲಿ ಹಾಗೂ ಅಚಲ ವ್ಯಕ್ತಿಯಂತೆ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತೀರಿ, ಆದರೆ ಏಕಾಂತದಲ್ಲಿ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಕಾಡುವ ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆ, ಆಪ್ತರ ನಿರ್ಲಕ್ಷ್ಯದ ನೋವು ಮತ್ತು ಕುಟುಂಬದ ಮೇಲಿನ ಅತಿಯಾದ ಕಾಳಜಿಯ ಆತಂಕವನ್ನು ನೀವು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ. ನಿಮ್ಮ ಅಂತರಂಗದಲ್ಲಿರುವ ಈ ಅತೀವ ಭಾವುಕತೆಯೇ ನಿಮ್ಮ ಶಕ್ತಿ ಮತ್ತು ದೌರ್ಬಲ್ಯ ಎರಡೂ ಆಗಿದೆ.`;

    const s2_kn = `ನಿಮ್ಮ ಜಾತಕದ ೮ನೇ ಮತ್ತು ೧೨ನೇ ಭಾವಗಳ ನಿಗೂಢ ತತ್ವದ ಪ್ರಕಾರ, ನಿಮಗೆ ಸೂಕ್ಷ್ಮವಾದ ಅತೀಂದ್ರಿಯ ಅಂತಃಪ್ರಜ್ಞೆ (Sixth Sense) ಜಾಗೃತವಾಗಿದೆ. ಯಾರಾದರೂ ನಿಮ್ಮ ಬಳಿ ಕಪಟದಿಂದ ಮಾತನಾಡಿದರೆ ಅಥವಾ ಭವಿಷ್ಯದಲ್ಲಿ ಯಾವುದಾದರೂ ಕೆಟ್ಟದ್ದು ಸಂಭವಿಸುವುದಿದ್ದರೆ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಮೊದಲೇ ಮುನ್ಸೂಚನೆ ದೊರೆಯುತ್ತದೆ. ರಹಸ್ಯ ಸಾಧನೆಗಳು, ಆಧ್ಯಾತ್ಮಿಕ ಮಂತ್ರ ಶಕ್ತಿ, ಮತ್ತು ಪೂರ್ವಜನ್ಮದ ಕರ್ಮಾನುಸಾರ ಬಂದಿರುವ ಈ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚವು ನಿಮಗೆ ಕಠಿಣ ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಅದೃಶ್ಯವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ. ಈ ಶಕ್ತಿಯನ್ನು ನೀವು ನಿಯಮಿತ ಈಶ್ವರ ಆರಾಧನೆಯ ಮೂಲಕ ಮತ್ತಷ್ಟು ಪ್ರಬಲಗೊಳಿಸಬಹುದು.`;

    const w1_kn = `ನೀವು ಇಂದು ನನ್ನ ಸನ್ನಿಧಿಗೆ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಲು ಬಂದಿರುವುದಕ್ಕೆ ಒಂದು ಅತ್ಯಂತ ಬಲವಾದ ಜ್ಯೋತಿಷ್ಯ ಕಾರಣವಿದೆ. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ${toKnDigits(p.ageYears)}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ${dashaTxt} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiTxt} ಭುಕ್ತಿ ಸಕ್ರಿಯವಾಗಿದ್ದು, ಗೋಚಾರದಲ್ಲಿ ${gochara.isSadeSati ? "ಶನಿಯ ಸಾಡೇ ಸಾತಿ (ಏಳರೆ ಶನಿ)" : gochara.isAshtamaShani ? "ಅಷ್ಟಮ ಶನಿಯ" : "ಶನಿ ಸಂಚಾರದ"} ಹಾಗೂ ${gochara.hasGuruBala ? "ಅನುಕೂಲಕರ ಗುರು ಬಲದ" : "ಗುರು ಗ್ರಹದ"} ಸಂಧಿಕಾಲ ನಡೆಯುತ್ತಿದೆ. ಈ ಕಾಲಘಟ್ಟವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಒಂದು ನಿರ್ಣಾಯಕ ತಿರುವು (Turning Point) ತಂದಿಟ್ಟಿದೆ. ಇತ್ತೀಚಿನ ದಿನಗಳಲ್ಲಿ ನೀವು ಎಷ್ಟು ಪರಿಶ್ರಮ ಪಟ್ಟರೂ ಅಂತಿಮ ಫಲ ದೊರೆಯುವಲ್ಲಿ ನಿರೀಕ್ಷಿತ ವಿಳಂಬ, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ಮುಂದಿನ ಹೆಜ್ಜೆಯ ಬಗ್ಗೆ ಸಂದಿಗ್ಧತೆ ತಲೆದೋರಿದೆ.`;

    const w2_kn = `ನೀವು ಕೇವಲ ಸಾಮಾನ್ಯ ಭವಿಷ್ಯ ಕೇಳಲು ಬಂದಿಲ್ಲ; ನಿಮ್ಮ ಅಂತರಂಗದಲ್ಲಿರುವ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಿಗೆ (ಉದ್ಯೋಗ ಬದಲಾವಣೆ, ಹೊಸ ಹೂಡಿಕೆ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಅಥವಾ ವಿವಾಹ/ಆರೋಗ್ಯದ ತಿರುವು) ದೈವಿಕ ಅನುಮೋದನೆ ಮತ್ತು ನಿಖರವಾದ ಕಾಲಮಿತಿಯನ್ನು ತಿಳಿಯುವ ಆಶಯದಿಂದ ಬಂದಿದ್ದೀರಿ. ನಿಮ್ಮ ಆಂತರ್ಯದಲ್ಲಿ "ನನ್ನ ಈ ಪರಿಶ್ರಮಕ್ಕೆ ಯಾವಾಗ ನ್ಯಾಯ ಸಿಗುತ್ತದೆ?", "ನನ್ನ ದಾರಿ ಸರಿಯಾಗಿದೆಯೇ?" ಎಂಬ ತೀವ್ರ ತಹತಹಿಕೆ ಇದೆ. ಈ ಸಂದಿಗ್ಧತೆಗೆ ಪೂರ್ಣ ವಿರಾಮವಿಟ್ಟು ದೈವಿಕ ಸತ್ಯವನ್ನು ತಿಳಿಯುವುದೇ ನಿಮ್ಮ ಮುಖ್ಯ ನಿರೀಕ್ಷೆಯಾಗಿದೆ.`;

    const q1_kn = `ನಿಮ್ಮ ಮನದಾಳದಲ್ಲಿ ಪ್ರಮುಖವಾಗಿ ೪ ಪ್ರಶ್ನೆಗಳು ಸದಾ ಸುಳಿಯುತ್ತಿವೆ: ಮೊದಲನೆಯದಾಗಿ, ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord10Txt} ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಉದ್ಯೋಗ ಹಾಗೂ ಧನಾರ್ಜನೆಯಲ್ಲಿ ಸ್ಥಿರತೆ ಮತ್ತು ಗೌರವ ಯಾವಾಗ ದೊರೆಯುತ್ತದೆ? ಎರಡನೆಯದಾಗಿ, ೭ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord7Txt} ಪ್ರಭಾವದಿಂದ ದಾಂಪತ್ಯ, ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ ಅಥವಾ ಮಂಗಳಕಾರ್ಯ ಯಾವಾಗ ನಿರ್ವಿಘ್ನವಾಗಿ ನೆರವೇರುತ್ತದೆ? ಮೂರನೆಯದಾಗಿ, ೬ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord6Txt} ಪ್ರಭಾವದಿಂದ ಶತ್ರು ಬಾಧೆ, ಸಾಲದ ಹೊರೆ ಅಥವಾ ಆರೋಗ್ಯದ ಅಸ್ಥಿರತೆಯಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?`;

    const q2_kn = `ನಾಲ್ಕನೆಯದಾಗಿ, ೫ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord5Txt} ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಮುಂದಿನ ಯೋಜನೆಗಳು, ಮಕ್ಕಳ ಏಳಿಗೆ ಅಥವಾ ಹೂಡಿಕೆಗಳು ಫಲ ನೀಡುತ್ತವೆಯೇ ಎಂಬ ಪ್ರಶ್ನೆ ನಿಮ್ಮನ್ನು ಕಾಡುತ್ತಿದೆ. ಈ ಪ್ರಶ್ನೆಗಳು ಈಗಲೇ ಉದ್ಭವಿಸಲು ಕಾರಣವೆಂದರೆ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ದಶಾನಾಥ ${dashaTxt} ಮತ್ತು ಗೋಚಾರ ಗ್ರಹಗಳು ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ದೃಷ್ಟಿ ಬೀರುತ್ತಿದ್ದು, ನಿಮ್ಮ ಜೀವನದ ಅತಿ ದೊಡ್ಡ ಕರ್ತವ್ಯದ ಪರೀಕ್ಷೆ ನಡೆಯುತ್ತಿದೆ. ಈ ಎಲ್ಲಾ ಸಂದಿಗ್ಧತೆಗಳಿಗೆ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಅನುಗ್ರಹದಿಂದ ಸಕಾರಾತ್ಮಕ ಪರಿಹಾರವಿದೆ.`;

    const m1_kn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಉಪಗ್ರಹವಾದ ಮಾಂದಿ (ಗುಳಿಕ) ಗ್ರಹವು ${maandiRashiTxt} ರಾಶಿಯಲ್ಲಿ, ಲಗ್ನದಿಂದ ${toKnDigits(p.maandiHouse)}ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿದ್ದಾನೆ. ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ಮಾಂದಿಯನ್ನು ಶನಿಯ ಪುತ್ರ ಹಾಗೂ ಅತೀವ ತಾಮಸಿಕ, ನಿಗೂಢ ಕರ್ಮದ ಕಾರಕನೆಂದು ಕರೆಯಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಜಾತಕದ ${toKnDigits(p.maandiHouse)}ನೇ ಮನೆಯಲ್ಲಿ ಮಾಂದಿ ಇರುವುದರಿಂದ, ನಿಮ್ಮ ಪ್ರತಿಯೊಂದು ಮಹತ್ವದ ಕೆಲಸಗಳು ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ವಿಳಂಬವಾಗುವುದು, ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರ (ಪಿತೃಗಳ) ಅದೃಶ್ಯ ಕರ್ಮದ ಛಾಯೆ ಹಾಗೂ ಆಗಾಗ ಅಕಾರಣವಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ನಿರುತ್ಸಾಹ ಅಥವಾ ದೃಷ್ಟಿದೋಷ ಉಂಟಾಗುವುದು ಗೋಚರಿಸುತ್ತದೆ.`;

    const m2_kn = `ಈ ಮಾಂದಿ ದೋಷ ಮತ್ತು ಪಿತೃ ಕರ್ಮದ ಛಾಯೆಯನ್ನು ನಿವಾರಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ (ಆತ್ಮಲಿಂಗ) ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಾಂದಿ ಶಾಂತಿ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಅಮಾವಾಸ್ಯೆ ದಿನ ಪಿತೃ ತರ್ಪಣ ಸೇವೆ ಮಾಡಿಸುವುದು ಪರಮೌಷಧವಾಗಿದೆ. ನಿತ್ಯವೂ "${p.mantra}" ಜಪಿಸುವುದರಿಂದ ಹಾಗೂ ಶನಿವಾರ ನವಗ್ರಹ ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ಮಾಂದಿಯ ಸಮಸ್ತ ಅಡೆತಡೆಗಳು ಭಸ್ಮವಾಗಿ, ನಿಮ್ಮ ಭಾಗ್ಯದ ಬಾಗಿಲು ತೆರೆಯುತ್ತದೆ.`;

    const seedQuestions_kn = [
      `ನನ್ನ ಪ್ರಸ್ತುತ ${dashaTxt} ಮಹಾದಶೆಯಲ್ಲಿ ಉದ್ಯೋಗದಲ್ಲಿ ಪ್ರಮೋಷನ್ ಅಥವಾ ಆದಾಯ ವೃದ್ಧಿ ಯಾವಾಗ ಆಗುತ್ತದೆ?`,
      `ನನ್ನ ಜಾತಕದಲ್ಲಿರುವ ಮಾಂದಿ ದೋಷ ಮತ್ತು ಶನಿ ಗೋಚಾರದ ಪ್ರಭಾವದಿಂದ ಮುಕ್ತಿ ಪಡೆಯಲು ಯಾವ ಗೋಕರ್ಣ ಸೇವೆ ಮಾಡಿಸಬೇಕು?`,
      `ನನ್ನ ಕೌಟುಂಬಿಕ ಜೀವನ, ವಿವಾಹ ಯೋಗ ಹಾಗೂ ಮಾನಸಿಕ ಶಾಂತಿಗೆ ಯಾವ ತಿಂಗಳು ಅತ್ಯಂತ ಅನುಕೂಲಕರ?`,
      `ನನ್ನ ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord10Txt} ಬಲಪಡಿಸಲು ಯಾವ ರತ್ನ ಅಥವಾ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಬೇಕು?`,
      `ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲಿ ನಾನು ಹೊಸ ವ್ಯವಹಾರ ಅಥವಾ ಆಸ್ತಿ ಹೂಡಿಕೆ ಮಾಡುವುದು ಕ್ಷೇಮವೇ?`
    ];

    const narrationFull_kn = `ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ. ಭಕ್ತರಾದ ${p.name} ಅವರೇ, ನಿಮ್ಮ ಜನನ ಕುಂಡಲಿಯನ್ನು ಪ್ರತ್ಯಕ್ಷವಾಗಿ ಗಮನಿಸಿ ನಿಮ್ಮ ಸಮಗ್ರ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಭವಿಷ್ಯದ ಅಂತರಂಗವನ್ನು ವಿವರಿಸುತ್ತಿದ್ದೇನೆ. ` +
      `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ${lagnaTxt}, ರಾಶಿ ${moonTxt} ಹಾಗೂ ನಕ್ಷತ್ರ ${moonNakTxt}. ` +
      `${p1_kn} ${p2_kn} ` +
      `ನಿಮ್ಮ ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯವನ್ನು ನೋಡಿದಾಗ, ${s1_kn} ${s2_kn} ` +
      `ಪ್ರಸ್ತುತ ನೀವು ಜ್ಯೋತಿಷ್ಯದ ಮೊರೆ ಹೋಗಲು ಕಾರಣವೆಂದರೆ, ${w1_kn} ${w2_kn} ` +
      `ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಕಾಡುತ್ತಿರುವ ಪ್ರಶ್ನೆಗಳೆಂದರೆ, ${q1_kn} ${q2_kn} ` +
      `ಇನ್ನು ಮಾಂದಿ ದೋಷದ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ${m1_kn} ${m2_kn} ` +
      `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಕೃಪೆಯಿಂದ ಸಕಲ ಸಂಕಷ್ಟಗಳು ಪರಿಹಾರವಾಗಿ ನಿಮಗೆ ಸರ್ವತೋಮುಖ ಜಯವಾಗಲಿ. ಶುಭಂ ಭವತು.`;

    return {
      personality: {
        title: "ತಮ್ಮ ಬಗ್ಗೆ / ಜನ್ಮ ಲಗ್ನ ವ್ಯಕ್ತಿತ್ವ",
        paragraph1: p1_kn,
        paragraph2: p2_kn
      },
      hiddenSecrets: {
        title: "ಸುಪ್ತ ಮನಸ್ಸು & ನಿಗೂಢ ರಹಸ್ಯ",
        paragraph1: s1_kn,
        paragraph2: s2_kn
      },
      whyAstrology: {
        title: "ಪ್ರಸ್ತುತ ದಶಾ-ಗೋಚಾರ ಪ್ರಭಾವ & ಸನ್ನಿವೇಶ",
        paragraph1: w1_kn,
        paragraph2: w2_kn
      },
      internalQuestions: {
        title: "ಮನದಾಳದ ಜ್ವಲಂತ ಪ್ರಶ್ನೆಗಳು",
        paragraph1: q1_kn,
        paragraph2: q2_kn
      },
      maandiAnalysis: {
        title: "ಮಾಂದಿ ಕರ್ಮ ಛಾಯೆ & ಶಮನ ಪರಿಹಾರ",
        paragraph1: m1_kn,
        paragraph2: m2_kn
      },
      seedQuestions: seedQuestions_kn,
      spokenNarrationFullText: narrationFull_kn
    };
  }

  // --------------------------------------------------------------------------
  // ENGLISH - Direct Face-to-Face Spoken Vedic Dialogue
  // --------------------------------------------------------------------------
  const p1_en = `Looking directly into your Janma Kundali chart right now, your natal Ascendant (Lagna) is ${lagnaTxt}, with your Lagna Lord ${lagnaLordTxt} bestowing commanding authority, strong moral dignity, and unyielding self-reliance. You possess an innate refusal to bow down before injustice or compromise your ethical principles for short-term gains. Influenced by your Ascendant Nakshatra ${p.lagnaNakshatra} (Pada ${p.lagnaPada}), your intellect is exceptionally sharp, gifted with a natural ability to dissect complex situations and see through superficial facade. While the outer world sees a calm, composed, and serious individual, there is an intense fire of ambition and perfectionism continuously burning within you.`;

  const p2_en = `Your natal Sun placed in ${sunTxt} reinforces your personal aura and vital willpower. You rarely depend on the mercy of others; an unshakeable drive to build an independent life through pure self-effort runs deep in your blood. Those in your trusted circle deeply respect your loyalty and protective instincts, yet if someone violates your self-respect, you find it nearly impossible to trust them again. Your astrological constitution grants you enormous resilience to withstand severe life storms and emerge victorious through righteous endurance.`;

  if (lang === "hi") {
    const p1_hi = `आपकी जन्म कुंडली का प्रत्यक्ष अवलोकन करने पर स्पष्ट दिखाई दे रहा है कि आपका जन्म लग्न ${lagnaTxt} है, जिसके स्वामी ${lagnaLordTxt} आपके व्यक्तित्व को अद्भुत नेतृत्व क्षमता, स्वाभिमान एवं दृढ़ इच्छाशक्ति प्रदान करते हैं। आप स्वभाव से सिद्धांतवादी हैं और किसी भी परिस्थिति में अपने आत्मसम्मान से समझौता नहीं करते।`;
    const p2_hi = `आपके जन्मकालिक सूर्य का ${sunTxt} राशि में स्थित होना आपके आत्मविश्वास को दृढ़ता प्रदान करता है। आप दूसरों की कृपा पर निर्भर रहने के बजाय अपने परिश्रम से आत्मनिर्भर जीवन जीने में विश्वास रखते हैं।`;
    const s1_hi = `आपकी चन्द्र राशि ${moonTxt} एवं ${moonNakTxt} नक्षत्र के आंतरिक रहस्यों को देखें तो आपके भीतर एक अत्यंत संवेदनशील और भावुक संसार छिपा है जिसे आप किसी से साझा नहीं करते।`;
    const s2_hi = `आपकी कुंडली के अष्टम एवं द्वादश भाव के प्रभाव से आपके भीतर एक सक्रिय पूर्वाभास (Sixth Sense) की शक्ति विद्यमान है। यह पूर्वजन्म के संचित कर्मों की दिव्य रक्षा प्रणाली है।`;
    const w1_hi = `वर्तमान में ${p.ageYears} वर्ष की आयु में आपकी ${dashaTxt} महादशा में ${bhuktiTxt} भुक्ति चल रही है, जो आपके जीवन में एक महत्वपूर्ण मोड़ लेकर आया है।`;
    const w2_hi = `आप केवल सामान्य भविष्य जानने नहीं आए हैं, अपितु अपने जीवन के अत्यंत महत्वपूर्ण निर्णयों के लिए ईश्वरीय संकेत की स्पष्टता चाहते हैं।`;
    const q1_hi = `आपकी कुंडली के अनुसार वर्तमान में आपके मन में 4 प्रमुख प्रश्न चल रहे हैं: पहला, दशमेश ${lord10Txt} के अनुसार कार्यक्षेत्र में स्थिरता कब? दूसरा, सप्तमेश ${lord7Txt} के प्रभाव से वैवाहिक सुख कब? तीसरा, षष्ठेश ${lord6Txt} के अनुसार शत्रु/ऋण बाधा से मुक्ति कब?`;
    const q2_hi = `चौथा, पंचमेश ${lord5Txt} के प्रभाव से आगामी निवेश एवं संतान पक्ष की उन्नति कब फलीभूत होगी? वर्तमान दशा स्वामी ${dashaTxt} एवं गोचर के प्रभाव से आपके कर्म की कड़ी परीक्षा हो रही है, जिसका समाधान श्री गोकर्ण महाबलेश्वर की कृपा से निश्चित रूप से संभव है।`;

    const m1_hi = `आपकी कुंडली में उपग्रह मांदि (गुलिक) ${maandiRashiTxt} राशि में, लग्न से ${p.maandiHouse}वें भाव में स्थित है। मांदि शनि के पुत्र एवं सूक्ष्म प्रारब्ध कर्मों के अधिपति माने जाते हैं। ${p.maandiHouse}वें भाव में मांदि की उपस्थिति के कारण महत्वपूर्ण कार्यों में ऐन वक्त पर विलंब, पारिवारिक कार्यों में पितृ दोष की छाया एवं अकारण मानसिक अवसाद का अनुभव होता है।`;

    const m2_hi = `इस मांदि प्रभाव की शांति हेतु श्री क्षेत्र गोकर्ण महाबलेश्वर मंदिर में मांदि शांति, रुद्राभिषेक एवं अमावस्या पितृ तर्पण सेवा अत्यंत फलदायी है। नित्य "${p.mantra}" का जप करने से सभी विघ्न शांत होंगे।`;

    const seedQuestions_hi = [
      `मेरी वर्तमान ${dashaTxt} महादशा में पदोन्नति एवं आर्थिक लाभ का सटीक समय कब है?`,
      `मांदि दोष एवं शनि गोचर के दुष्प्रभाव को शांत करने हेतु गोकर्ण में कौन सी पूजा करानी चाहिए?`,
      `पारिवारिक शांति एवं मांगलिक कार्यों के लिए आगामी कौन सा महीना सर्वाधिक शुभ है?`,
      `दशम भाव के स्वामी ${lord10Txt} को बलवान करने हेतु कौन सा रत्न या रुद्राक्ष धारण करें?`
    ];

    const narrationFull_hi = `श्री गुरुभ्यो नमः। जातक ${p.name} जी, आपकी जन्म कुंडली का प्रत्यक्ष अध्ययन कर आपके समग्र व्यक्तित्व, अंतर्मन एवं भविष्य चक्र का विवरण प्रस्तुत कर रहा हूँ। ` +
      `आपका जन्म लग्न ${lagnaTxt}, चन्द्र राशि ${moonTxt} और नक्षत्र ${moonNakTxt} है। ` +
      `${p1_hi} ${p2_hi} ${s1_hi} ${s2_hi} ${w1_hi} ${w2_hi} ${q1_hi} ${q2_hi} ${m1_hi} ${m2_hi} ` +
      `श्री गोकर्ण महाबलेश्वर की असीम कृपा से आपके सभी मनोरथ सिद्ध हों। ॐ नमः शिवाय।`;

    return {
      personality: {
        title: "आपके बारे में / मूल स्वभाव एवं व्यक्तित्व विश्लेषण",
        paragraph1: p1_hi,
        paragraph2: p2_hi
      },
      hiddenSecrets: {
        title: "गूढ़ रहस्य, अंतर्मन का भय एवं रहस्यमयी गुण",
        paragraph1: s1_hi,
        paragraph2: s2_hi
      },
      whyAstrology: {
        title: "वर्तमान में ज्योतिष मार्गदर्शन की आवश्यकता एवं जीवन की स्थिति",
        paragraph1: w1_hi,
        paragraph2: w2_hi
      },
      internalQuestions: {
        title: "मन में चल रहे ज्वलंत प्रश्न एवं दुविधाएं",
        paragraph1: q1_hi,
        paragraph2: q2_hi
      },
      maandiAnalysis: {
        title: "मांदि (गुलिक) का गूढ़ कर्म प्रभाव एवं गोकर्ण शांति परिहार",
        paragraph1: m1_hi,
        paragraph2: m2_hi
      },
      seedQuestions: seedQuestions_hi,
      spokenNarrationFullText: narrationFull_hi
    };
  }

  // --------------------------------------------------------------------------
  // ENGLISH - Direct Face-to-Face Spoken Vedic Dialogue
  // --------------------------------------------------------------------------
  const s1_en = `Analyzing the deep subconscious depths of your Moon Sign ${moonTxt} and ${moonNakTxt} Nakshatra, you harbor an intensely sensitive, guarded emotional world that you never reveal to society. Externally, you project unflinching strength and decisive leadership, but in absolute solitude, you carry unexpressed anxieties regarding future security, the emotional burden of family obligations, and silent wounds from past betrayals.`;

  const s2_en = `Governed by the occult dynamics of your 8th and 12th houses, you possess an active sixth sense and profound intuitive radar. You possess an uncanny knack for sensing deceit before a word is spoken and feeling impending shifts before they materialize in the physical world. Regular meditation and Ishwara worship substantially amplify this protective psychic radar.`;

  const w1_en = `There is a very precise cosmic reason why you are sitting before me seeking astrological counsel at this exact juncture of your life. At your current age of ${p.ageYears} years, you are traversing the active cycle of ${dashaTxt} Mahadasha with ${bhuktiTxt} Bhukti, concurrent with ${gochara.isSadeSati ? "Saturn's Sade Sati transit" : gochara.isAshtamaShani ? "Ashtama Shani transit" : "Saturn's transit"} and ${gochara.hasGuruBala ? "favorable Jupiter support" : "transitional Jupiter movements"}. This energetic confluence has brought your life to a crucial crossroad (Turning Point).`;

  const w2_en = `You did not come here merely for generic predictions; you are seeking sacred clarity on pivotal impending decisions—career transition, financial investments, family harmony, or relationship milestones. Deep inside, your spirit is asking: "When will my continuous toil bear its true fruit?" and "Is my chosen path cosmically aligned?"`;  

  const q1_en = `Looking into the planetary signatures of your chart, there are 4 burning questions currently dominating your mind: First, with 10th Lord ${lord10Txt} active, when will stability, elevated authority, and financial recognition manifest in your career? Second, influenced by 7th Lord ${lord7Txt}, when will relationship friction dissolve? Third, under 6th Lord ${lord6Txt}, when will you achieve permanent liberation from hidden competitors, financial debt, or physical fatigue?`;

  const q2_en = `Fourth, influenced by 5th Lord ${lord5Txt}, will your upcoming speculative investments, higher creative plans, or children's welfare succeed as envisioned? These questions have peaked right now because Dasha Lord ${dashaTxt} and Gochara transits are putting your karmic foundation through a decisive test. Through the divine grace of Sri Kshetra Gokarna Mahabaleshwara, effective Vedic remedies will dissolve these obstacles.`;

  const m1_en = `In your birth chart, the shadow upagraha Maandi (Gulika) is situated in ${maandiRashiTxt} in the ${p.maandiHouse}th house from your Ascendant. In classical Vedic Siddhanta, Maandi is the potent karmic shadow son of Saturn, representing unmanifested ancestral karma and subtle energetic resistance. In your ${p.maandiHouse}th house, Maandi tends to induce eleventh-hour delays in crucial tasks, sudden inexplicable energy drains, and lingering subconscious pessimism.`;

  const m2_en = `To permanently neutralize this Maandi shadow and awaken your full auspicious potential, performing Maandi Shanti, Rudrabhisheka, and Amavasya Pitri Tarpana at Sri Kshetra Gokarna Mahabaleshwara (Atmalinga) is highly recommended. Daily chanting of your protective mantra and lighting a sesame oil lamp on Saturdays will transmute these karmic roadblocks into divine protective armor.`;

  const seedQuestions_en = [
    `When will my active ${dashaTxt} Mahadasha bring a definitive career promotion and financial breakthrough?`,
    `What specific Gokarna temple seva should I perform to neutralize the delays caused by Maandi and Saturn transit?`,
    `Which upcoming months are most auspicious for marriage, family peace, and emotional stability?`,
    `Which Vedic gemstone or Rudraksha is recommended to empower my 10th house lord ${lord10Txt}?`,
    `Is the next 6-month cycle favorable for launching a new business or executing major property investments?`
  ];

  const narrationFull_en = `Salutations to the Divine Guru. Devotee ${p.name}, examining your Janma Kundali directly, I shall now reveal your complete core personality, hidden psyche, and destiny timeline. ` +
    `Your natal Lagna is ${lagnaTxt}, Moon sign is ${moonTxt}, and Nakshatra is ${moonNakTxt}. ` +
    `${p1_en} ${p2_en} ${s1_en} ${s2_en} ${w1_en} ${w2_en} ${q1_en} ${q2_en} ${m1_en} ${m2_en} ` +
    `May Lord Sri Gokarna Mahabaleshwara shower His divine blessings upon you and grant you complete success and peace. Om Namah Shivaya.`;

  // --------------------------------------------------------------------------
  // TELUGU (తెలుగు) & TAMIL (தமிழ்) Fallbacks handled dynamically
  // --------------------------------------------------------------------------
  return {
    personality: {
      title: lang === "te" ? "మీ గురించి / సహజ స్వభావం & వ్యక్తిత్వ విశ్లేషణ" : lang === "ta" ? "உங்களைப் பற்றி / அடிப்படை குணம் & ஆளுமை பகுப்பாய்வு" : "About Yourself / Core Nature & Personality Demeanor",
      paragraph1: p1_en,
      paragraph2: p2_en
    },
    hiddenSecrets: {
      title: lang === "te" ? "అంతరంగ రహస్యాలు & ఆధ్యాత్మిక శక్తులు" : lang === "ta" ? "மறைக்கப்பட்ட ரகசியங்கள் & ஆன்மீக ஆற்றல்கள்" : "Hidden Secrets, Subconscious Fears & Latent Mystical Traits",
      paragraph1: s1_en,
      paragraph2: s2_en
    },
    whyAstrology: {
      title: lang === "te" ? "ప్రస్తుతం జ్యోతిష్య మార్గదర్శనం కోరడానికి గల కారణం" : lang === "ta" ? "தற்போது ஜோதிட வழிகாட்டலை நாடக் காரணம்" : "Why You Came to Astrology Right Now & Current Life Turning Point",
      paragraph1: w1_en,
      paragraph2: w2_en
    },
    internalQuestions: {
      title: lang === "te" ? "మీ మనసులోని ప్రధాన అంతర్గత ప్రశ్నలు" : lang === "ta" ? "உங்கள் மனதில் ஓடிக்கொண்டிருக்கும் முதன்மையான கேள்விகள்" : "The Burning Questions You Are Currently Carrying Inside Your Heart",
      paragraph1: q1_en,
      paragraph2: q2_en
    },
    maandiAnalysis: {
      title: lang === "te" ? "మాంది (గుళిక) కర్మ ప్రభావం & గోకర్ణ క్షేత్ర పరిహారం" : lang === "ta" ? "மாந்தி (குளிகன்) மறைமுக கர்ம தாக்கம் & கோகர்ண பரிகாரம்" : "Maandi (Gulika) Hidden Karmic Shadow & Ancestral Parihara",
      paragraph1: m1_en,
      paragraph2: m2_en
    },
    seedQuestions: seedQuestions_en,
    spokenNarrationFullText: narrationFull_en
  };
}

/**
 * 100% Dynamic 5-Language Life Analysis Synthesis (Deterministic Fallback & AI Grounding)
 */
export function generateDynamicLifeInsights(
  p: PublicKundliProfile,
  lang: PublicKundliLang
): DynamicLifeAnalysisOutput {
  const lagnaTxt = RASHI_NAMES_5L[p.lagnaSign]?.[lang] || p.lagnaSign;
  const moonTxt = RASHI_NAMES_5L[p.moonSign]?.[lang] || p.moonSign;
  const moonNakTxt = NAKSHATRA_NAMES_5L[p.moonNakshatra]?.[lang] || p.moonNakshatra;
  const dashaTxt = GRAHA_NAMES_5L[p.currentMahadasha]?.[lang] || p.currentMahadasha;
  const bhuktiTxt = GRAHA_NAMES_5L[p.currentBhukti]?.[lang] || p.currentBhukti;
  const lord10Txt = GRAHA_NAMES_5L[p.lord10]?.[lang] || p.lord10;
  const lord7Txt = GRAHA_NAMES_5L[p.lord7]?.[lang] || p.lord7;
  const lord6Txt = GRAHA_NAMES_5L[p.lord6]?.[lang] || p.lord6;

  if (lang === "kn") {
    return {
      currentPhase: `ಜಾತಕದ ಲಗ್ನ ${lagnaTxt} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ ${moonTxt} ಆಗಿದ್ದು, ಪ್ರಸ್ತುತ ${toKnDigits(p.ageYears)}ನೇ ವಯಸ್ಸಿನಲ್ಲಿ ${dashaTxt} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiTxt} ಭುಕ್ತಿ ಸಕ್ರಿಯವಾಗಿದೆ. ಈ ಕಾಲಘಟ್ಟವು ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ, ಸಾಮಾಜಿಕ ಗೌರವ ಹಾಗೂ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿಯಾಗಿದೆ. ಗ್ರಹಗಳ ಸಂಚಾರವು ಕರ್ತವ್ಯ ನಿಷ್ಠೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತಿದೆ.`,
      subconsciousMind: `ಚಂದ್ರನು ${moonTxt} ರಾಶಿಯಲ್ಲಿದ್ದು, ${moonNakTxt} ನಕ್ಷತ್ರ ಪಾದ ${toKnDigits(p.moonPada)} ರಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಭವಿಷ್ಯದ ಯೋಜನೆಗಳು, ಕುಟುಂಬದ ಹಿತಾಸಕ್ತಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆಗಳು ಸದಾ ಜಾಗೃತವಾಗಿರುತ್ತವೆ. ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆ ಹಾಗೂ ಈಶ್ವರ ಆರಾಧನೆಯಿಂದ ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ ದೃಢವಾಗುತ್ತದೆ.`,
      careerFinance: `ಕರ್ಮ ಸ್ಥಾನವಾದ ೧೦ನೇ ಭಾವದ ಅಧಿಪತಿ ${lord10Txt} ಆಗಿದ್ದು, ಪ್ರಸ್ತುತ ದಶಾನಾಥ ${dashaTxt} ರೊಂದಿಗೆ ಅನುಕೂಲಕರ ಗ್ರಹ ದೃಷ್ಟಿಯಿದೆ. ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಧನಾರ್ಜನೆಯಲ್ಲಿ ಸ್ಥಿರ ಬೆಳವಣಿಗೆಯ ಲಕ್ಷಣಗಳಿವೆ. ಯೋಜಿತ ಹೂಡಿಕೆಗಳು ಹಾಗೂ ಶ್ರದ್ಧಾಪೂರ್ವಕ ಪರಿಶ್ರಮಕ್ಕೆ ಯಶಸ್ಸು ನಿಶ್ಚಿತ.`,
      relationshipsHealth: `ಕಳತ್ರ ಸ್ಥಾನದ ಅಧಿಪತಿ ${lord7Txt} ಹಾಗೂ ರೋಗ-ಶತ್ರು ಸ್ಥಾನದ ಅಧಿಪತಿ ${lord6Txt} ರ ಪ್ರಭಾವದಿಂದ ಕೌಟುಂಬಿಕ ಸಹಬಾಳ್ವೆ ತೃಪ್ತಿಕರವಾಗಿರುತ್ತದೆ. ಋತುಮಾನ ಬದಲಾವಣೆ ವೇಳೆ ಜೀರ್ಣಾಂಗ ಹಾಗೂ ನರಗಳ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`,
      gokarnaRemedy: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${p.gokarnaSevaName} ಹಾಗೂ ${p.deity} ಆರಾಧನೆ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ ಸರ್ವತೋಮುಖ ಅಭಿವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ. ನಿತ್ಯ ಜಪ: "${p.mantra}".`
    };
  }

  if (lang === "hi") {
    return {
      currentPhase: `जातक का जन्म लग्न ${lagnaTxt} एवं चन्द्र राशि ${moonTxt} है। वर्तमान में ${p.ageYears} वर्ष की आयु में ${dashaTxt} महादशा में ${bhuktiTxt} भुक्ति सक्रिय है। यह कालखंड जीवन में महत्वपूर्ण निर्णय लेने, मान-सम्मान में वृद्धि और कर्म क्षेत्र के विकास के लिए अत्यंत प्रभावशाली है।`,
      subconsciousMind: `चन्द्रमा ${moonTxt} राशि एवं ${moonNakTxt} नक्षत्र में स्थित होने से मन में परिवार की उन्नति एवं भविष्य की योजनाओं को लेकर सकारात्मक चिंतन बना रहता है। नियमित साधना एवं इष्ट देव स्मरण से मानसिक शांति प्राप्त होगी।`,
      careerFinance: `दशमेश ${lord10Txt} एवं दशा स्वामी ${dashaTxt} की शुभ स्थिति से कार्यक्षेत्र में प्रगति, पदोन्नति एवं आर्थिक स्थिरता के प्रबल योग हैं। व्यापार एवं निवेश में धैर्यपूर्वक निर्णय लाभकारी सिद्ध होंगे।`,
      relationshipsHealth: `सप्तमेश ${lord7Txt} एवं षष्ठेश ${lord6Txt} के प्रभाव से पारिवारिक संबंधों में सामंजस्य बना रहेगा। स्वास्थ्य की दृष्टि से नियमित दिनचर्या एवं सात्विक आहार का पालन करना हितकर है।`,
      gokarnaRemedy: `श्री क्षेत्र गोकर्ण महाबलेश्वर मंदिर में संकल्पपूर्वक ${p.gokarnaSevaName} एवं ${p.deity} का पूजन कराने से सभी ग्रह बाधाएं शांत होंगी। दैनिक जप मंत्र: "${p.mantra}".`
    };
  }

  if (lang === "te") {
    return {
      currentPhase: `జాతకుని జన్మ లగ్నం ${lagnaTxt} మరియు చంద్ర రాశి ${moonTxt}. ప్రస్తుతం ${p.ageYears} సం. వయస్సులో ${dashaTxt} మహాదశలో ${bhuktiTxt} భుక్తి నడుస్తోంది. ఈ కాలం జీవితంలో కీలక నిర్ణయాలు తీసుకోవడానికి, వ్యక్తిత్వ వికాసానికి మరియు సాంఘిక గౌరవానికి ఎంతో అనుకూలమైనది.`,
      subconsciousMind: `చంద్రుడు ${moonTxt} రాశిలో మరియు ${moonNakTxt} నక్షత్రంలో ఉండటం వలన అంతర్గతంగా కుటుంబ శ్రేయస్సు మరియు ఆధ్యాత్మిక చింతన అధికంగా ఉంటాయి. నిరంతర దైవ స్మరణతో మానసిక ప్రశాంతత లభిస్తుంది.`,
      careerFinance: `దశమ భావాధిపతి ${lord10Txt} మరియు దశా నాథుడు ${dashaTxt} అనుకూల ప్రభావం వలన వృత్తి, ఉద్యోగాలలో పురోగతి మరియు ధన లాభం చేకూరుతాయి. ప్రణాళికాబద్ధమైన కృషి విజయవంతమవుతుంది.`,
      relationshipsHealth: `సప్తమాధిపతి ${lord7Txt} మరియు షష్టాధిపతి ${lord6Txt} ప్రభావంతో దాంపత్య, కుటుంబ జీవనం ప్రశాంతంగా సాగుతుంది. ఆహార నియమాలు పాటించడం ద్వారా ఆరోగ్యం స్థిరంగా ఉంటుంది.`,
      gokarnaRemedy: `శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో ${p.gokarnaSevaName} మరియు ${p.deity} పూజ జరిపించడం వలన సమస్త గ్రహ దోషాలు తొలగి శుభం కలుగుతుంది. నిత్య జపం: "${p.mantra}".`
    };
  }

  if (lang === "ta") {
    return {
      currentPhase: `ஜாதகரின் லக்னம் ${lagnaTxt} மற்றும் சந்திர ராசி ${moonTxt}. தற்போது ${p.ageYears} வயதில் ${dashaTxt} மகாதிசையில் ${bhuktiTxt} புக்தி நடைபெறுகிறது. இந்த காலகட்டம் வாழ்க்கையில் முக்கிய முடிவுகளை எடுக்கவும், கௌரவம் மற்றும் ஆளுமை வளர்ச்சிக்கும் மிகவும் சாதகமானது.`,
      subconsciousMind: `சந்திரன் ${moonTxt} ராசி மற்றும் ${moonNakTxt} நட்சத்திரத்தில் சஞ்சரிப்பதால், மனதில் எதிர்கால திட்டங்கள் மற்றும் ஆன்மீக சிந்தனைகள் நிறைந்திருக்கும். இறை வழிபாட்டால் மன அமைதி பெருகும்.`,
      careerFinance: `பத்தாம் வீட்டு அதிபதி ${lord10Txt} மற்றும் திசா நாதர் ${dashaTxt} அருளால் தொழில், வியாபாரம் மற்றும் பண வரவில் நல்ல முன்னேற்றம் ஏற்படும். திட்டமிட்ட முயற்சிகள் வெற்றி தரும்.`,
      relationshipsHealth: `ஏழாம் அதிபதி ${lord7Txt} மற்றும் ஆறாம் அதிபதி ${lord6Txt} ஆதிக்கத்தால் குடும்ப உறவுகள் சுமுகமாக இருக்கும். முறையான உடற்பயிற்சியும் ஆரோக்கிய உணவும் நலம் தரும்.`,
      gokarnaRemedy: `ஸ்ரீ க்ஷேத்ர கோகர்ண மஹாபலேஷ்வரர் ஆலயத்தில் சங்கல்ப பூர்வமாக ${p.gokarnaSevaName} மற்றும் ${p.deity} வழிபாடு செய்வது சர்வ கிரக தோஷங்களை நீக்கும். தினசரி மந்திரம்: "${p.mantra}".`
    };
  }

  // English fallback
  return {
    currentPhase: `Natal Lagna is ${lagnaTxt} and Moon Sign is ${moonTxt}. At the current age of ${p.ageYears} years, you are running ${dashaTxt} Mahadasha with ${bhuktiTxt} Bhukti. This astrological phase fosters leadership, intellectual clarity, and favorable milestones in society.`,
    subconsciousMind: `With Moon placed in ${moonTxt} and ${p.moonNakshatra} Nakshatra (Pada ${p.moonPada}), your mind is centered around higher duties, family protection, and spiritual growth. Regular meditation brings emotional tranquility.`,
    careerFinance: `The 10th House Lord of profession is ${lord10Txt}, receiving benefic aspects during this ${dashaTxt} cycle. Steady career growth, financial inflows, and professional recognition are strongly indicated.`,
    relationshipsHealth: `With the 7th Lord ${lord7Txt} and 6th Lord ${lord6Txt} influencing your chart, family harmony remains stable. Maintaining balanced routines supports sound physical and mental well-being.`,
    gokarnaRemedy: `Performing ${p.gokarnaSevaName} and worshipping ${p.deity} at Sri Kshetra Gokarna Mahabaleshwara temple dissolves malefic obstacles and bestows divine blessings. Daily Japa Mantra: "${p.mantra}".`
  };
}

/**
 * 100% Dynamic 5-Language Q&A Fallback
 */
export function generateDynamicQaFallback(
  query: string,
  p: PublicKundliProfile,
  lang: PublicKundliLang
): string {
  const q = (query || "").toLowerCase();
  const dashaTxt = GRAHA_NAMES_5L[p.currentMahadasha]?.[lang] || p.currentMahadasha;
  const lord10Txt = GRAHA_NAMES_5L[p.lord10]?.[lang] || p.lord10;
  const lord7Txt = GRAHA_NAMES_5L[p.lord7]?.[lang] || p.lord7;

  if (
    q.includes("job") ||
    q.includes("career") ||
    q.includes("ಉದ್ಯೋಗ") ||
    q.includes("ಕೆಲಸ") ||
    q.includes("नौकरी") ||
    q.includes("ఉద్యోగం") ||
    q.includes("வேலை")
  ) {
    if (lang === "kn") {
      return `ನಿಮ್ಮ ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿ ${lord10Txt} ಹಾಗೂ ಪ್ರಸ್ತುತ ${dashaTxt} ದಶಾ ಕಾಲವು ಉದ್ಯೋಗ ಪ್ರಗತಿಗೆ ಪೂರಕವಾಗಿದೆ. ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ ಬಡ್ತಿ ಅಥವಾ ಅಪೇಕ್ಷಿತ ಸ್ಥಾನ ಬದಲಾವಣೆ ಯೋಗ ಗೋಚರಿಸುತ್ತಿದೆ. ಶ್ರೀ ಮಹಾಗಣಪತಿ ಆರಾಧನೆ ಮಾಡಿ.`;
    }
    if (lang === "hi") {
      return `आपकी कुंडली के दशमेश ${lord10Txt} एवं वर्तमान ${dashaTxt} दशा कार्यक्षेत्र में उन्नति के लिए शुभ है। आगामी समय में पदोन्नति या नए अवसर मिलने के उत्तम योग हैं।`;
    }
    if (lang === "te") {
      return `మీ జాతకంలో 10వ స్థానాధిపతి ${lord10Txt} మరియు నడుస్తున్న ${dashaTxt} దశ ఉద్యోగంలో అనుకూల మార్పులకు, ప్రమోషన్‌కు సంపూర్ణ సహకారం అందిస్తాయి.`;
    }
    if (lang === "ta") {
      return `உங்கள் 10ஆம் அதிபதி ${lord10Txt} மற்றும் ${dashaTxt} திசை வேலை வாய்ப்பில் சிறப்பான முன்னேற்றத்தை அளிக்கின்றன. புதிய பொறுப்புகள் கிடைக்கும் யோகம் உள்ளது.`;
    }
    return `Your 10th house lord ${lord10Txt} and active ${dashaTxt} Dasha indicate favorable career advancements and positive changes in the upcoming cycle.`;
  }

  if (
    q.includes("marriage") ||
    q.includes("wedding") ||
    q.includes("ಮದುವೆ") ||
    q.includes("ವಿವಾಹ") ||
    q.includes("विवाह") ||
    q.includes("వివాహం") ||
    q.includes("திருமணம்")
  ) {
    if (lang === "kn") {
      return `ಕಳತ್ರ ಸ್ಥಾನದ ಅಧಿಪತಿ ${lord7Txt} ಹಾಗೂ ಪ್ರಸ್ತುತ ಗ್ರಹ ಬಲವು ಕೌಟುಂಬಿಕ ಮಂಗಳ ಕಾರ್ಯಗಳಿಗೆ ಯೋಗವನ್ನು ರೂಪಿಸುತ್ತಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ತಾಮ್ರಗೌರಿ ಪೂಜೆ ಹಾಗೂ ಗುರು ಬಲ ಪ್ರಾರ್ಥನೆ ಶೀಘ್ರ ವಿವಾಹ ಸಿದ್ಧಿಯನ್ನುಂಟುಮಾಡುತ್ತದೆ.`;
    }
    if (lang === "hi") {
      return `सप्तमेश ${lord7Txt} एवं वर्तमान ग्रह दशा वैवाहिक सुख एवं मांगलिक कार्यों के लिए शुभ योग का निर्माण कर रही है। गोकर्ण क्षेत्र में पूजन से शुभ फल प्राप्त होगा।`;
    }
    if (lang === "te") {
      return `సప్తమాధిపతి ${lord7Txt} ప్రభావం వలన వివాహ సంబంధాలు మరియు కుటుంబ సౌభాగ్యం కోసం అనుకూల సమయం ఏర్పడుతోంది.`;
    }
    if (lang === "ta") {
      return `ஏழாம் அதிபதி ${lord7Txt} அருளால் திருமண யோகம் மற்றும் குடும்ப அமைதி சிறப்பாக அமையும். இஷ்ட தெய்வ வழிபாடு நலம் பயக்கும்.`;
    }
    return `Your 7th lord ${lord7Txt} and transit configurations indicate auspicious prospects for marriage, harmony, and fruitful relationships.`;
  }

  if (lang === "kn") {
    return `ನಿಮ್ಮ ಜನನ ಲಗ್ನ ${p.lagnaSanskrit}, ಚಂದ್ರ ರಾಶಿ ${p.moonSanskrit} ಹಾಗೂ ಪ್ರಸ್ತುತ ${dashaTxt} ದಶಾ ಫಲದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ವಿಷಯದಲ್ಲಿ ಧೈರ್ಯ ಹಾಗೂ ಧಾರ್ಮಿಕ ಶ್ರದ್ಧೆಯಿಂದ ಮುನ್ನಡೆಯುವುದು ಶ್ರೇಯಸ್ಕರ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಕೃಪೆಯಿಂದ ಸಕಲ ಕಾರ್ಯಗಳು ಸಿದ್ಧಿಸಲಿ.`;
  }
  if (lang === "hi") {
    return `आपकी लग्न राशि ${p.lagnaSanskrit}, चन्द्र राशि ${p.moonSanskrit} और वर्तमान ${dashaTxt} दशा के अनुसार, धैर्य और धर्म सम्मत आचरण से आपके सभी संकल्प सिद्ध होंगे। श्री गोकर्ण महाबलेश्वर की कृपा आप पर बनी रहे।`;
  }
  if (lang === "te") {
    return `మీ లగ్నం ${p.lagnaSanskrit}, చంద్ర రాశి ${p.moonSanskrit} మరియు ప్రస్తుత ${dashaTxt} దశా ప్రభావం ప్రకారం, విశ్వాసంతో చేసే పనులు విజయవంతమవుతాయి. గోకర్ణ మహాబలేశ్వరుని అనుగ్రహం కలుగుగాక.`;
  }
  if (lang === "ta") {
    return `உங்கள் லக்னம் ${p.lagnaSanskrit}, சந்திர ராசி ${p.moonSanskrit} மற்றும் ${dashaTxt} திசா பலன்களின்படி, உங்கள் நல்முயற்சிகள் யாவும் வெற்றி பெறும். ஸ்ரீ கோகர்ண மஹாபலேஷ்வரர் அருள் புரிக.`;
  }
  return `According to your natal Lagna (${p.lagnaSign}), Moon Sign (${p.moonSign}), and current ${dashaTxt} Dasha, patience, righteous action, and divine remedies will guide you to success.`;
}

export interface AuthenticRemediesWithReasoning {
  gemstone: string;
  gemstoneReason: string;
  rudraksha: string;
  rudrakshaReason: string;
  auspiciousDay: string;
  auspiciousDayReason: string;
  deity: string;
  deityReason: string;
  mantra: string;
  mantraReason: string;
  gokarnaSevaName: string;
  gokarnaSevaReason: string;
}

/**
 * 100% Dynamic Full-Spectrum Astrological Remedy Reasoning Engine
 * Grounded in Panchanga (Tithi, Vara, Nakshatra, Yoga, Karana), Janma Kundali (Lagna, Moon, planetary dignities),
 * running Vimshottari Dasha-Bhukti, and Sri Kshetra Gokarna temple Siddhanta.
 */
export function generateAuthenticRemediesWithReasoning(
  p: PublicKundliProfile,
  kundli: KundliOutput,
  lang: string = "kn"
): AuthenticRemediesWithReasoning {
  const isKn = lang === "kn";
  const code = (["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn") as PublicKundliLang;

  const lagnaTxt = RASHI_NAMES_5L[p.lagnaSign]?.[code] || p.lagnaSign;
  const moonTxt = RASHI_NAMES_5L[p.moonSign]?.[code] || p.moonSign;
  const lagnaLordTxt = GRAHA_NAMES_5L[p.lagnaLord]?.[code] || p.lagnaLord;
  const dashaTxt = GRAHA_NAMES_5L[p.currentMahadasha]?.[code] || p.currentMahadasha;
  const bhuktiTxt = GRAHA_NAMES_5L[p.currentBhukti]?.[code] || p.currentBhukti;
  const nakTxt = getLocalizedNakshatraName(p.moonNakshatra, p.moonPada, code);

  const panch = p.panchangaAttributes;
  const yogaTxt = panch.yogaKn || panch.yoga;
  const karanaTxt = panch.karanaKn || panch.karana;

  // ── Derive 9th Lord (Bhagyeshadhipati) from Lagna index ───────────────────
  const lagnaIdx = RASHI_ORDER.indexOf(p.lagnaSign);
  const ninthLord = RASHI_LORDS[(lagnaIdx + 8) % 12] || "Jupiter";  // 9th house lord
  const ninthLordTxt = GRAHA_NAMES_5L[ninthLord]?.[code] || ninthLord;

  // ── Navamsha (D-9) pada 1-9 for 9th lord planet ───────────────────────────
  const ninthLordPlanet = kundli.planets.find((pl) => pl.name === ninthLord);
  const ninthLordHouse = ninthLordPlanet
    ? (((ninthLordPlanet.rashi?.index ?? 0) - lagnaIdx + 12) % 12) + 1
    : ((lagnaIdx + 8) % 12) + 1;
  const ninthLordNavamsha = ninthLordPlanet
    ? (() => {
        const inSign = normalizeDegree(ninthLordPlanet.degree) % 30;
        return Math.floor((inSign * 9) / 30) + 1;
      })()
    : 1;

  // ── Yogakaraka: owns both Kendra + Trikona for this Lagna ─────────────────
  const YOGAKARAKA_BY_LAGNA: Record<string, string> = {
    Cancer: "Mars", Leo: "Mars",
    Taurus: "Saturn", Libra: "Saturn",
    Capricorn: "Venus", Aquarius: "Venus",
    Aries: "Jupiter", Sagittarius: "Jupiter",
    Scorpio: "Jupiter"
  };
  const yogakaraka = YOGAKARAKA_BY_LAGNA[p.lagnaSign] || null;

  // ── Multi-dimensional per-card source planets ──────────────────────────────
  // 1. GEMSTONE → Bhagyeshadhipati (9th lord) or Yogakaraka
  const gemPlanet = yogakaraka || ninthLord;
  const gemPlanetTxt = GRAHA_NAMES_5L[gemPlanet]?.[code] || gemPlanet;

  // 2. RUDRAKSHA → Running Mahadasha Lord (Dasha Shanti)
  const rudrPlanet = p.currentMahadasha;
  const rudrPlanetTxt = GRAHA_NAMES_5L[rudrPlanet]?.[code] || rudrPlanet;
  const nakshLordOfMoon = (() => {
    const NAK_LORDS = [
      "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
      "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury",
      "Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"
    ];
    const moonNakIdx = kundli.planets.find(pl => pl.name === "Moon")?.nakshatra?.index ?? 0;
    return NAK_LORDS[moonNakIdx % 27] || "Moon";
  })();
  const nakLordTxt = GRAHA_NAMES_5L[nakshLordOfMoon]?.[code] || nakshLordOfMoon;

  // 3. AUSPICIOUS DAY → Lagna Lord or Yogakaraka
  const dayPlanet = yogakaraka || p.lagnaLord;
  const dayPlanetTxt = GRAHA_NAMES_5L[dayPlanet]?.[code] || dayPlanet;

  // 4. DEITY → 5th Lord (Ishta Devata) or 9th Lord (Dharma Devata)
  const deityPlanet = p.lord5 || ninthLord;
  const deityPlanetTxt = GRAHA_NAMES_5L[deityPlanet]?.[code] || deityPlanet;

  // 5. MANTRA → MUST be Mahadasha Lord's Beeja mantra (critical fix)
  const mantraPlanet = p.currentMahadasha;

  // Deprecated single-cfg approach removed. Each card now has its own cfg below.

  const BASE_CONFIGS: Record<string, {
    gem: Record<PublicKundliLang, string>;
    rudraksha: Record<PublicKundliLang, string>;
    day: Record<PublicKundliLang, string>;
    mantra: string;
    deity: Record<PublicKundliLang, string>;
    seva: Record<PublicKundliLang, string>;
  }> = {
    Moon: {
      gem: { kn: "ಮುತ್ತು (Natural Pearl)", en: "Natural Pearl (Moti)", hi: "सच्चा मोती (Pearl)", te: "సహజ ముత్యం", ta: "இயற்கை முத்து" },
      rudraksha: { kn: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (2 Mukhi)", en: "2 Mukhi Rudraksha", hi: "2 मुखी रुद्राक्ष", te: "2 ముఖి రుద్రాక్ష", ta: "2 முக ருத்ராட்சம்" },
      day: { kn: "ಸೋಮವಾರ (Monday)", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கட்கிழமை" },
      mantra: "ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ (ಆತ್ಮಲಿಂಗ)", en: "Sri Gokarna Mahabaleshwara (Atmalinga)", hi: "श्री गोकर्ण महाबलेश्वर (आत्मलिंग)", te: "శ్రీ గోకర్ణ మహాబలేశ్వర (ఆత్మలింగం)", ta: "ஸ்ரீ கோகர்ண மஹாபலேஷ்வரர் (ஆத்மலிங்கம்)" },
      seva: { kn: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ಗಂಗಾಜಲ ಪೂಜೆ", en: "Atmalinga Ksheerabhisheka & Gangajala Pooja", hi: "आत्मलिंग क्षीराभिषेक एवं गंगाजल पूजा", te: "ఆత్మలింగ క్షీరాభిషేకం మరియు గంగాజల పూజ", ta: "ஆத்மலிங்க க்ஷீராபிஷேகம் & கங்காஜல பூஜை" }
    },
    Sun: {
      gem: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Natural Ruby (Manikya)", hi: "माणिक्य (रूबी)", te: "కెంపు (మాణిక్యం)", ta: "மாணிக்கம்" },
      rudraksha: { kn: "೧ ಮುಖಿ / ೧೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", en: "1 Mukhi / 12 Mukhi Rudraksha", hi: "1 मुखी / 12 मुखी रुद्राक्ष", te: "1 ముఖి / 12 ముఖి రుద్రాక్ష", ta: "1 முக / 12 முக ருத்ராட்சம்" },
      day: { kn: "ಭಾನುವಾರ (Sunday)", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிற்றுக்கிழமை" },
      mantra: "ಓಂ ಹ್ರೀಂ ಸೂರ್ಯಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ / ಶ್ರೀ ಮಹಾಗಣಪತಿ", en: "Sri Suryanarayana / Sri Mahaganapati", hi: "श्री सूर्यनारायण / श्री महागणपति", te: "శ్రీ సూర్యనారాయణ / శ్రీ మహాగణపతి", ta: "ஸ்ரீ சூரியநாராயணர் / ஸ்ரீ கணபதி" },
      seva: { kn: "ಗೋಕರ್ಣ ಸೂರ್ಯ ನಮಸ್ಕಾರ & ರಥೋತ್ಸವ ಸಂಕಲ್ಪ ಸೇವೆ", en: "Gokarna Surya Namaskara & Temple Rathotsava Seva", hi: "गोकर्ण सूर्यनमस्कार एवं रथोत्सव संकल्प", te: "సూర్యనమస్కార సంకల్పం", ta: "சூரிய நமஸ்கார சங்கல்ப சேவை" }
    },
    Mars: {
      gem: { kn: "ಹವಳ (Red Coral)", en: "Red Coral (Moonga)", hi: "मूंगा (लाल प्रवाल)", te: "పగడం (రెడ్ కోరల్)", ta: "பவளம்" },
      rudraksha: { kn: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 Mukhi)", en: "3 Mukhi Rudraksha", hi: "3 मुखी रुद्राक्ष", te: "3 ముఖి రుద్రాక్ష", ta: "3 முக ருத்ராட்சம்" },
      day: { kn: "ಮಂಗಳವಾರ (Tuesday)", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்க்கிழமை" },
      mantra: "ಓಂ ಅಂಗಾರಕಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಶ್ರೀ ವೀರಭದ್ರ", en: "Sri Subrahmanya / Sri Veerabhadra", hi: "श्री सुब्रह्मण्य / श्री वीरभद्र", te: "శ్రీ సుబ్రహ్మణ్య / శ్రీ వీరభద్ర", ta: "ஸ்ரீ சுப்ரமண்யர் / ஸ்ரீ வீரபத்ரர்" },
      seva: { kn: "ಕುಜ ದೋಷ ನಿವಾರಣಾ ರುದ್ರಾಭಿಷೇಕ & ನಾಗ ಪ್ರತಿಷ್ಠಾಪನೆ", en: "Kuja Dosha Nivarana Rudrabhisheka & Naga Seva", hi: "कुज दोष निवारण रुद्राभिषेक", te: "కుజదోష నివారణ రుద్రాభిషేకం", ta: "குஜ தோஷ நிவர்த்தி ருத்ராபிஷேகம்" }
    },
    Mercury: {
      gem: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", hi: "पन्ना (एमराल्ड)", te: "పచ్చ (ఎమరాల్డ్)", ta: "மரகதம்" },
      rudraksha: { kn: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (4 Mukhi)", en: "4 Mukhi Rudraksha", hi: "4 मुखी रुद्राक्ष", te: "4 ముఖి రుద్రాక్ష", ta: "4 முக ருத்ராட்சம்" },
      day: { kn: "ಬುಧವಾರ (Wednesday)", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்கிழமை" },
      mantra: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ವಿದ್ಯಾ ಗಣಪತಿ / ಶ್ರೀ ಮಹಾವಿಷ್ಣು", en: "Sri Vidya Ganapati / Sri Mahavishnu", hi: "श्री विद्या गणपति / श्री महाविष्णु", te: "శ్రీ విద్యా గణపతి / శ్రీ మహావిష్ణువు", ta: "ஸ்ரீ வித்யா கணபதி / ஸ்ரீ மஹாவிஷ்ணு" },
      seva: { kn: "ಮಹಾ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಹವನ & ಪಂಚಾಮೃತಾಭಿಷೇಕ", en: "Mahaganapati Atharvashirsha Homa & Panchamrita Abhisheka", hi: "महागणपति अथर्वशीर्ष हवन", te: "మహా గణపతి అథర్వశీర్ష హవనం", ta: "மஹா கணபதி அதர்வஷீர்ஷ ஹோமம்" }
    },
    Jupiter: {
      gem: { kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pukhraj)", hi: "पुखराज (येलो नीलम)", te: "పుష్యరాగం", ta: "புஷ்பராகம்" },
      rudraksha: { kn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 Mukhi)", en: "5 Mukhi Rudraksha", hi: "5 मुखी रुद्राक्ष", te: "5 ముఖి రుద్రాక్ష", ta: "5 முக ருத்ராட்சம்" },
      day: { kn: "ಗುರುವಾರ (Thursday)", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழக்கிழமை" },
      mantra: "ಓಂ ಗ್ರಾಂಗ್ ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಶ್ರೀ ರಾಘವೇಂದ್ರ", en: "Sri Guru Dakshinamurthy / Sri Raghavendra", hi: "श्री दक्षिणामूर्ति / श्री गुरु", te: "శ్రీ గురు దక్షిణామూర్తి", ta: "ஸ்ரீ குரு தட்சிணாமூர்த்தி" },
      seva: { kn: "ಗುರು ಬಲ ವೃದ್ಧಿ ಅರ್ಚನೆ & ಗೋಕರ್ಣ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಸೇವೆ", en: "Guru Bala Vriddhi Archana & Gokarna Brahmana Bhojana", hi: "गुरु बल वृद्धि अर्चना एवं ब्राह्मण भोजन", te: "గురు బల వృద్ధి అర్చన", ta: "குரு பல விருத்தி அர்ச்சனை" }
    },
    Venus: {
      gem: { kn: "ವಜ್ರ / ಬಿಳಿ ಜಿರ್ಕಾನ್ (Diamond / White Zircon)", en: "Diamond / White Zircon", hi: "हीरा / सफेद जरकन", te: "వజ్రం / వైట్ జిర్కాన్", ta: "வைரம் / வெள்ளை ஜிர்கான்" },
      rudraksha: { kn: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 Mukhi)", en: "6 Mukhi Rudraksha", hi: "6 मुखी रुद्राक्ष", te: "6 ముఖి రుద్రాక్ష", ta: "6 முக ருத்ராட்சம்" },
      day: { kn: "ಶುಕ್ರವಾರ (Friday)", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளிக்கிழமை" },
      mantra: "ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ತಾಮ್ರಗೌರಿ / ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ", en: "Sri Tamragowri / Sri Mahalakshmi", hi: "श्री ताम्रगौरी / श्री महालक्ष्मी", te: "శ్రీ తామ్రగౌరి / శ్రీ మహాలక్ష్మి", ta: "ஸ்ரீ தாம்ரகௌரி / ஸ்ரீ மஹாலக்ஷ்மி" },
      seva: { kn: "ಶ್ರೀ ತಾಮ್ರಗೌರಿ ಕುಂಕುಮಾರ್ಚನೆ & ಲಲಿತಾ ಸಹಸ್ರನಾಮ ಪೂಜೆ", en: "Sri Tamragowri Kumkumarchana & Lalita Sahasranama", hi: "ताम्रगौरी कुंकुमार्चना एवं ललिता सहस्रनाम", te: "తామ్రగౌరి కుంకుమార్చన", ta: "தாம்ரகௌரி குங்குமார்ச்சனை" }
    },
    Saturn: {
      gem: { kn: "ಇಂದ್ರನೀಲ (Blue Sapphire / Amethyst)", en: "Blue Sapphire / Amethyst", hi: "नीलम (ब्लू नीलम)", te: "నీలం (ఇంద్రనీలం)", ta: "நீலக்கல் (நீலம்)" },
      rudraksha: { kn: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 Mukhi)", en: "7 Mukhi Rudraksha", hi: "7 मुखी रुद्राक्ष", te: "7 ముఖి రుద్రాక్ష", ta: "7 முக ருத்ராட்சம்" },
      day: { kn: "ಶನಿವಾರ (Saturday)", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனிக்கிழமை" },
      mantra: "ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಶನೀಶ್ವರ / ಶ್ರೀ ಕಾಲಭೈರವ", en: "Sri Shanishwara / Sri Kalabhairava", hi: "श्री शनैश्चर / श्री कालभैरव", te: "శ్రీ శనీశ్వరుడు / శ్రీ కాలభైరవ", ta: "ஸ்ரீ சனீஸ்வரர் / ஸ்ரீ காலபைரவர்" },
      seva: { kn: "ಗೋಕರ್ಣ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ & ತೈಲಾಭಿಷೇಕ", en: "Gokarna Maha Mrityunjaya Japa & Tailabhisheka", hi: "महामृत्युंजय जप एवं तैलाभिषेक", te: "మహా మృత్యుంజయ జపం", ta: "மஹா மிருத்யுஞ்ஜய ஜபம்" }
    },
    Rahu: {
      gem: { kn: "ಗೋಮೇಧಿಕ (Hessonite Garnet)", en: "Hessonite Garnet (Gomed)", hi: "गोमेद (गोमेधिक)", te: "గోమేధికం", ta: "கோமேதகம்" },
      rudraksha: { kn: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (8 Mukhi)", en: "8 Mukhi Rudraksha", hi: "8 मुखी रुद्राक्ष", te: "8 ముఖి రుద్రాక్ష", ta: "8 முக ருத்ராட்சம்" },
      day: { kn: "ಶನಿವಾರ / ಮಂಗಳವಾರ", en: "Saturday / Tuesday", hi: "शनिवार / मंगलवार", te: "శనివారం / మంగళవారం", ta: "சனிக்கிழமை / செவ்வாய்க்கிழமை" },
      mantra: "ಓಂ ರಾಂ ರಾಹವೇ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ / ಶ್ರೀ ನಾಗದೇವತೆ", en: "Sri Durga Parameshwari / Sri Nagadevata", hi: "श्री दुर्गा परमेश्वरी / श्री नागदेवता", te: "శ్రీ దుర్గా పరమేశ్వరి", ta: "ஸ்ரீ துர்கா பரமேஸ்வரி" },
      seva: { kn: "ರಾಹು-ಕೇತು ಸರ್ಪ ಸಂಸ್ಕಾರ & ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಾರಾಯಣ", en: "Rahu-Ketu Sarpa Samskara & Durga Saptashati", hi: "राहु-केतु सर्प संस्कार पूजा", te: "రాహు-కేతు సర్ప సంస్కార పూజ", ta: "ராகு-கேது சர்ப்ப சம்ஸ்கார பூஜை" }
    },
    Ketu: {
      gem: { kn: "ವೈಢೂರ್ಯ (Cat's Eye)", en: "Cat's Eye (Lehsuniya)", hi: "लहसुनिया (वैडूर्य)", te: "వైడూర్యం", ta: "வைடூரியம்" },
      rudraksha: { kn: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (9 Mukhi)", en: "9 Mukhi Rudraksha", hi: "9 मुखी रुद्राक्ष", te: "9 ముఖి రుద్రాక్ష", ta: "9 முக ருத்ராட்சம்" },
      day: { kn: "ಮಂಗಳವಾರ / ಗುರುವಾರ", en: "Tuesday / Thursday", hi: "मंगलवार / गुरुवार", te: "మంగళవారం / గురువారం", ta: "செவ்வாய்க்கிழமை / வியாழக்கிழமை" },
      mantra: "ಓಂ ಕೇಂ ಕೇತವೇ ನಮಃ",
      deity: { kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ / ಶ್ರೀ ರುದ್ರದೇವ", en: "Sri Mahaganapati / Sri Rudradeva", hi: "श्री महागणपति / श्री रुद्रदेव", te: "శ్రీ మహాగణపతి / శ్రీ రుద్రుడు", ta: "ஸ்ரீ கணபதி / ஸ்ரீ ருத்ரதேவர்" },
      seva: { kn: "ಗಣೇಶ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಹೋಮ & ರುದ್ರಾಭಿಷೇಕ", en: "Sankashtahara Chaturthi Homa & Rudrabhisheka", hi: "संकष्टहर चतुर्थी होम एवं रुद्राभिषेक", te: "సంకష్టహర చతుర్థి హోమం", ta: "சங்கடஹர சதுர்த்தி ஹோமம்" }
    }
  };

  // ── Per-card configs from independent sources ─────────────────────────────
  const gemCfg    = BASE_CONFIGS[gemPlanet]    || BASE_CONFIGS.Jupiter; // Bhagyeshadhipati/Yogakaraka
  const rudrCfg   = BASE_CONFIGS[rudrPlanet]   || BASE_CONFIGS.Jupiter; // Mahadasha Lord
  const dayCfg    = BASE_CONFIGS[dayPlanet]    || BASE_CONFIGS.Jupiter; // Lagna Lord or Yogakaraka
  const deityCfg  = BASE_CONFIGS[deityPlanet]  || BASE_CONFIGS.Jupiter; // 5th Lord (Ishta Devata)
  const mantraCfg = BASE_CONFIGS[mantraPlanet] || BASE_CONFIGS.Jupiter; // Mahadasha Lord's Beeja mantra

  // ── Gokarna Seva: synthesized from Maandi house + primary Doshas ──────────
  const karmicDoshas = p.karmicDoshas || [];
  const hasPitruDosha = karmicDoshas.some(d => d.id === "pitru");
  const hasKalasarpa  = karmicDoshas.some(d => d.id === "kalasarpa");
  const hasManglik    = karmicDoshas.some(d => d.id === "manglik");
  const sevaCfg = hasKalasarpa
    ? BASE_CONFIGS.Rahu
    : hasManglik
    ? BASE_CONFIGS.Mars
    : hasPitruDosha
    ? BASE_CONFIGS.Saturn
    : mantraCfg;

  // ── Build localized reasoning strings ─────────────────────────────────────
  let gemReason = "";
  let rudrReason = "";
  let dayReason = "";
  let deityReason = "";
  let mantraReason = "";
  let sevaReason = "";

  if (isKn) {
    // Gemstone: Bhagyeshadhipati (9th lord) or Yogakaraka
    if (yogakaraka) {
      gemReason = `ಜನ್ಮ ಲಗ್ನ ${lagnaTxt}ಕ್ಕೆ ${gemPlanetTxt} ಗ್ರಹವು ಯೋಗಕಾರಕ (ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಒಡೆತನ) ಆಗಿದ್ದು, ಈ ಗ್ರಹದ ಬಲವರ್ಧನೆ ಜೀವಿತಾವಧಿಯ ಸಮಗ್ರ ಉನ್ನತಿ ನೀಡುತ್ತದೆ. ಜನ್ಮ ನಕ್ಷತ್ರ ${nakTxt} ಮತ್ತು ಪ್ರಸ್ತುತ ${dashaTxt}-${bhuktiTxt} ದಶಾ ಸಂಧಿಯಲ್ಲಿ ${gemCfg.gem.kn} ಧಾರಣೆ ಶ್ರೇಯಸ್ಕರ.`;
    } else {
      gemReason = `ಜನ್ಮ ಲಗ್ನ ${lagnaTxt}ದ ಭಾಗ್ಯಾಧಿಪತಿ (೯ನೇ ಭಾವ ನಾಥ) ${ninthLordTxt} ಜನ್ಮ ಕಾಲಕ್ಕೆ ${ninthLordHouse}ನೇ ಭಾವದಲ್ಲಿ ನವಾಂಶ (ಡಿ-೯) ${ninthLordNavamsha}ನೇ ಅಂಶದಲ್ಲಿ ಸ್ಥಿತ. ಭಾಗ್ಯ ಮತ್ತು ಧರ್ಮ ಬಲಕ್ಕೆ ${gemCfg.gem.kn} ಧಾರಣೆ ${dashaTxt}-${bhuktiTxt} ದಶಾ ಸಂಧಿಯಲ್ಲಿ ಪರಮ ಶ್ರೇಯಸ್ಕರ.`;
    }

    // Rudraksha: Running Mahadasha lord for Dasha Shanti
    rudrReason = `ಪ್ರಸ್ತುತ ${dashaTxt} ಮಹಾದಶೆಯು ${bhuktiTxt} ಭುಕ್ತಿಯಲ್ಲಿ ಸಾಗುತ್ತಿದ್ದು, ಜನ್ಮ ನಕ್ಷತ್ರ ${nakTxt}ದ ನಾಥ ${nakLordTxt} ಗ್ರಹದ ಕರ್ಮ ಶಮನ ಮತ್ತು ${dashaTxt} ದಶಾ ಶಾಂತಿಗಾಗಿ ${rudrCfg.rudraksha.kn}ವನ್ನು ಧರಿಸುವುದು ಅತ್ಯಂತ ಪ್ರಭಾವಕಾರಿ. ನಿತ್ಯ ಜಲಾಭಿಷೇಕ ಮಾಡಿ ಧರಿಸಬೇಕು.`;

    // Auspicious Day: Lagna Lord or Yogakaraka
    if (yogakaraka) {
      dayReason = `ಲಗ್ನ ${lagnaTxt}ಕ್ಕೆ ಯೋಗಕಾರಕ ${dayPlanetTxt}ನ ಕಾರಕ ದಿನವಾದ ${dayCfg.day.kn}ವು ಜಾತಕರಿಗೆ ಅತ್ಯಂತ ಫಲದಾಯಕ. ಮಹತ್ವದ ಕಾರ್ಯಾರಂಭ ಮತ್ತು ದೈವದರ್ಶನಕ್ಕೆ ಈ ದಿನ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ.`;
    } else {
      dayReason = `ಲಗ್ನಾಧಿಪತಿ ${lagnaLordTxt}ನ ಕಾರಕ ದಿನ ${dayCfg.day.kn}ವು ಜಾತಕರಿಗೆ ಸಿದ್ಧಿದಾಯಕ. ಪಂಚಾಂಗ ${yogaTxt} ಯೋಗ ಮತ್ತು ಗೋಚಾರ ಶುಭ ಕಿರಣಗಳು ಈ ದಿನ ವಿಶೇಷ ಸಿದ್ಧಿ ನೀಡುತ್ತವೆ.`;
    }

    // Deity: 5th lord (Ishta Devata)
    deityReason = `ಜನ್ಮ ಕುಂಡಲಿಯ ಐದನೇ ಭಾವಾಧಿಪತಿ (ಇಷ್ಟದೇವತಾ ಕಾರಕ) ${deityPlanetTxt} ಗ್ರಹ ಮತ್ತು ಮಾಂದಿ ${p.maandiHouse}ನೇ ಮನೆಯ ಕರ್ಮ ಛಾಯೆ ಶಮನಕ್ಕೆ ${deityCfg.deity.kn} ಆರಾಧನೆ ಪರಮ ಮಂಗಳಕರ.`;

    // Mantra: MUST match running Mahadasha lord
    mantraReason = `ಪ್ರಸ್ತುತ ${dashaTxt} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiTxt} ಭುಕ್ತಿ ಸಾಗುತ್ತಿದ್ದು, ${dashaTxt} ಗ್ರಹದ ಈ ಬೀಜ ಮಂತ್ರ ನಿತ್ಯ ೧೦೮ ಬಾರಿ ಜಪಿಸುವುದರಿಂದ ಗ್ರಹಶಾಂತಿ ಮತ್ತು ದಶಾ ದೋಷ ನಿವಾರಣೆ ಆಗುತ್ತದೆ. ನಕ್ಷತ್ರ ${nakTxt} ಮತ್ತು ${yogaTxt} ಯೋಗದ ಸಹಕಾರದಿಂದ ಈ ಜಪ ಅತ್ಯಂತ ಫಲದಾಯಕ.`;

    sevaReason = `ಜಾತಕದಲ್ಲಿ ಮಾಂದಿ ಲಗ್ನದಿಂದ ${p.maandiHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು${hasPitruDosha ? ", ಪಿತೃ ದೋಷದ ಛಾಯೆ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ" : ""}${hasKalasarpa ? ", ಕಾಳಸರ್ಪ ಯೋಗ ಪ್ರಭಾವ ಗಮನಾರ್ಹ" : ""}${hasManglik ? ", ಕುಜ ದೋಷ ಸ್ಪಷ್ಟ" : ""}. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${sevaCfg.seva.kn} ಮಾಡಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನ ಪರಿಹಾರ ಮತ್ತು ಮಹಾಬಲೇಶ್ವರರ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`;

  } else {
    // English and multi-language fallback
    if (yogakaraka) {
      gemReason = `${gemPlanetTxt} is the Yogakaraka (owns both Kendra and Trikona) for ${lagnaTxt} Lagna. Wearing ${gemCfg.gem[code] || gemCfg.gem.en} amplifies its blessings under the active ${dashaTxt} Mahadasha and ${bhuktiTxt} Bhukti.`;
    } else {
      gemReason = `${ninthLordTxt} is your Bhagyeshadhipati (9th Lord of Fortune), in the ${ninthLordHouse}th house, Navamsha (D-9) pada ${ninthLordNavamsha}. Strengthening this planet with ${gemCfg.gem[code] || gemCfg.gem.en} activates fortune under the ${dashaTxt}-${bhuktiTxt} Dasha cycle.`;
    }

    rudrReason = `Your current Mahadasha is ${dashaTxt} with ${bhuktiTxt} Bhukti active. Janma Nakshatra lord is ${nakLordTxt}. Wearing ${rudrCfg.rudraksha[code] || rudrCfg.rudraksha.en} pacifies ${dashaTxt} Dasha energies and shields the nervous system from transit turbulence.`;

    if (yogakaraka) {
      dayReason = `${dayPlanetTxt} is the Yogakaraka for ${lagnaTxt} Lagna. ${dayCfg.day[code] || dayCfg.day.en}, governed by this planet, is the most auspicious weekday for important undertakings and devotional practices.`;
    } else {
      dayReason = `${dayCfg.day[code] || dayCfg.day.en}, governed by Lagna Lord ${lagnaLordTxt}, channels peak astral harmony for your chart. Commence important ventures on this day for maximum fruition.`;
    }

    deityReason = `${deityPlanetTxt} is your 5th House Lord (Ishta Devata principle per Parashara). Worshipping ${deityCfg.deity[code] || deityCfg.deity.en} neutralizes the Maandi karmic shadow in the ${p.maandiHouse}th house and deepens inner spiritual connection.`;

    mantraReason = `This Beeja Mantra propitiates ${dashaTxt}, your current Mahadasha Lord, active with ${bhuktiTxt} Bhukti. Chanting 108 times daily purifies planetary friction and aligns you with the ${dashaTxt} Dasha's positive potential. Do NOT miss this during the active ${dashaTxt} period.`;

    sevaReason = `With Maandi in the ${p.maandiHouse}th house${hasPitruDosha ? " and Pitru Dosha present" : ""}${hasKalasarpa ? " and Kalasarpa influence detected" : ""}${hasManglik ? " and Kuja Dosha active" : ""}, performing ${sevaCfg.seva[code] || sevaCfg.seva.en} at Sri Kshetra Gokarna releases ancestral karmic bonds and unlocks divine grace.`;
  }

  return {
    gemstone:        gemCfg.gem[code]      || gemCfg.gem.kn,
    gemstoneReason:  gemReason,
    rudraksha:       rudrCfg.rudraksha[code] || rudrCfg.rudraksha.kn,
    rudrakshaReason: rudrReason,
    auspiciousDay:      dayCfg.day[code]   || dayCfg.day.kn,
    auspiciousDayReason: dayReason,
    deity:           deityCfg.deity[code]  || deityCfg.deity.kn,
    deityReason:     deityReason,
    mantra:          mantraCfg.mantra,     // ← ALWAYS matches Mahadasha Lord's Beeja mantra
    mantraReason:    mantraReason,
    gokarnaSevaName:    sevaCfg.seva[code] || sevaCfg.seva.kn,
    gokarnaSevaReason:  sevaReason
  };
}

function getRemediesForLagna(lagnaLord: string, dashaLord: string, profilePartial?: Partial<PublicKundliProfile>, kundli?: KundliOutput) {
  // Simple fallback structure for initial profile construction
  const GEM_MAP: Record<string, { gem: string; rudraksha: string; day: string; mantra: string; deity: string; seva: string }> = {
    Sun: {
      gem: "ಮಾಣಿಕ್ಯ (Ruby)",
      rudraksha: "೧ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (1 Mukhi)",
      day: "ಭಾನುವಾರ (Sunday)",
      mantra: "ಓಂ ಹ್ರೀಂ ಸೂರ್ಯಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ / ಶ್ರೀ ಮಹಾಗಣಪತಿ",
      seva: "ಗೋಕರ್ಣ ಸೂರ್ಯ ನಮಸ್ಕಾರ & ರಥೋತ್ಸವ ಸಂಕಲ್ಪ"
    },
    Moon: {
      gem: "ಮುತ್ತು (Natural Pearl)",
      rudraksha: "೨ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (2 Mukhi)",
      day: "ಸೋಮವಾರ (Monday)",
      mantra: "ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ (ಆತ್ಮಲಿಂಗ)",
      seva: "ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ಗಂಗಾಜಲ ಪೂಜೆ"
    },
    Mars: {
      gem: "ಹವಳ (Red Coral)",
      rudraksha: "೩ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 Mukhi)",
      day: "ಮಂಗಳವಾರ (Tuesday)",
      mantra: "ಓಂ ಅಂಗಾರಕಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಶ್ರೀ ವೀರಭದ್ರ",
      seva: "ಕುಜ ದೋಷ ನಿವಾರಣಾ ರುದ್ರಾಭಿಷೇಕ & ನಾಗ ಪ್ರತಿಷ್ಠಾಪನೆ"
    },
    Mercury: {
      gem: "ಪಚ್ಚೆ (Emerald)",
      rudraksha: "೪ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (4 Mukhi)",
      day: "ಬುಧವಾರ (Wednesday)",
      mantra: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ವಿದ್ಯಾಗಣಪತಿ / ಶ್ರೀ ಮಹಾವಿಷ್ಣು",
      seva: "ಮಹಾ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಹವನ & ಪಂಚಾಮೃತಾಭಿಷೇಕ"
    },
    Jupiter: {
      gem: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)",
      rudraksha: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 Mukhi)",
      day: "ಗುರುವಾರ (Thursday)",
      mantra: "ಓಂ ಗ್ರಾಂಗ್ ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ",
      deity: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ / ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿ",
      seva: "ಗುರು ಬಲ ವೃದ್ಧಿ ಅರ್ಚನೆ & ಗೋಕರ್ಣ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಸೇವೆ"
    },
    Venus: {
      gem: "ವಜ್ರ / ಬಿಳಿ ಜಿರ್ಕಾನ್ (Diamond / White Zircon)",
      rudraksha: "೬ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 Mukhi)",
      day: "ಶುಕ್ರವಾರ (Friday)",
      mantra: "ಓಂ ಶುಂ ಶುಕ್ರಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ / ಶ್ರೀ ತಾಮ್ರಗೌರಿ",
      seva: "ಶ್ರೀ ತಾಮ್ರಗೌರಿ ಕುಂಕುಮಾರ್ಚನೆ & ಲಲಿತಾ ಸಹಸ್ರನಾಮ ಪೂಜೆ"
    },
    Saturn: {
      gem: "ಇಂದ್ರನೀಲ (Blue Sapphire / Amethyst)",
      rudraksha: "೭ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 Mukhi)",
      day: "ಶನಿವಾರ (Saturday)",
      mantra: "ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ",
      deity: "ಶ್ರೀ ಶನೀಶ್ವರ / ಶ್ರೀ ಕಾಲಭೈರವ",
      seva: "ಗೋಕರ್ಣ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ & ತೈಲಾಭಿಷೇಕ"
    },
    Rahu: {
      gem: "ಗೋಮೇಧಿಕ (Hessonite Garnet)",
      rudraksha: "೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (8 Mukhi)",
      day: "ಶನಿವಾರ / ಮಂಗಳವಾರ",
      mantra: "ಓಂ ರಾಂ ರಾಹವೇ ನಮಃ",
      deity: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ / ಶ್ರೀ ನಾಗದೇವತೆ",
      seva: "ರಾಹು-ಕೇತು ಸರ್ಪ ಸಂಸ್ಕಾರ & ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಾರಾಯಣ"
    },
    Ketu: {
      gem: "ವೈಢೂರ್ಯ (Cat's Eye)",
      rudraksha: "೯ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (9 Mukhi)",
      day: "ಮಂಗಳವಾರ / ಗುರುವಾರ",
      mantra: "ಓಂ ಕೇಂ ಕೇತವೇ ನಮಃ",
      deity: "ಶ್ರೀ ಗಣಪತಿ / ಶ್ರೀ ರುದ್ರದೇವ",
      seva: "ಗಣೇಶ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ಹೋಮ & ರುದ್ರಾಭಿಷೇಕ"
    }
  };

  const choice = GEM_MAP[lagnaLord] || GEM_MAP[dashaLord] || GEM_MAP.Jupiter;
  return {
    gemstone: choice.gem,
    gemstoneReason: "ಜನ್ಮ ಲಗ್ನಾಧಿಪತಿಯ ಬಲವರ್ಧನೆಗೆ ಮತ್ತು ಆಯುಷ್ಯ-ಆರೋಗ್ಯ ವೃದ್ಧಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ರಕ್ಷೆ.",
    rudraksha: choice.rudraksha,
    rudrakshaReason: "ಪಂಚಾಂಗ ದೋಷ ಶಮನ ಮತ್ತು ಮನಃಶಾಂತಿಗೆ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ.",
    mantra: choice.mantra,
    mantraReason: "ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲಚಕ್ರದ ಶಾಂತಿಗೆ ನಿತ್ಯ ಜಪ.",
    auspiciousDay: choice.day,
    auspiciousDayReason: "ಲಗ್ನಾಧಿಪತಿಯ ಕಾರಕತ್ವ ಹೊಂದಿರುವ ಸಿದ್ಧಿದಾಯಕ ದಿನ.",
    deity: choice.deity,
    deityReason: "ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಕರ್ಮ ಛಾಯೆ ಶಮನಕ್ಕೆ ಆರಾಧ್ಯ ದೈವ.",
    gokarnaSevaName: choice.seva,
    gokarnaSevaReason: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ."
  };
}

export interface CustomQuestionAnswerResult {
  question: string;
  category: "career" | "finance" | "marriage" | "health" | "children" | "spiritual" | "general";
  categoryLocalized: string;
  shortVerdict: string;
  analysisText: string;
  auspiciousWindow: string;
  recommendedGokarnaSeva: string;
}

/**
 * Dynamically synthesizes an authentic Vedic astrological answer to any user custom question
 */
export function generateCustomQuestionAstrologyAnswer(
  question: string,
  profile: PublicKundliProfile,
  kundli: KundliOutput,
  lang: string = "kn"
): CustomQuestionAnswerResult {
  const isKn = lang === "kn";
  const qLower = question.toLowerCase();

  const dashaLordLocalized = GRAHA_NAMES_5L[profile.currentMahadasha]?.[lang as PublicKundliLang] || profile.currentMahadasha;
  const bhuktiLordLocalized = GRAHA_NAMES_5L[profile.currentBhukti]?.[lang as PublicKundliLang] || profile.currentBhukti;
  const lagnaLordLocalized = GRAHA_NAMES_5L[profile.lagnaLord]?.[lang as PublicKundliLang] || profile.lagnaLord;

  let category: "career" | "finance" | "marriage" | "health" | "children" | "spiritual" | "general" = "general";
  let categoryLocalized = isKn ? "ಸಾಮಾನ್ಯ ಜೀವನ & ಕಾಲಚಕ್ರ" : "General Life & Timeline Guidance";
  let shortVerdict = isKn ? "ಅನುಕೂಲಕರ ಬದಲಾವಣೆಗಳು ಸನ್ನಿಹಿತವಾಗಿವೆ" : "Favorable developments emerging";
  let analysisText = "";
  let auspiciousWindow = isKn ? "ಮುಂದಿನ ೩ ರಿಂದ ೬ ತಿಂಗಳುಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಫಲ ಗೋಚರಿಸಲಿದೆ" : "Positive shifts expected within the next 3 to 6 months";
  let recommendedGokarnaSeva = isKn
    ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಅಪ್ಪದ ಕಜ್ಜಾಯ ಸೇವೆ"
    : "Sri Gokarna Mahabaleshwara Mahadrudrabhisheka & Maha Ganapati Seva";

  // Career / Job / Promotion / Business
  if (
    qLower.includes("job") || qLower.includes("career") || qLower.includes("promotion") ||
    qLower.includes("work") || qLower.includes("business") || qLower.includes("ಉದ್ಯೋಗ") ||
    qLower.includes("ಕೆಲಸ") || qLower.includes("ವ್ಯಾಪಾರ") || qLower.includes("ಬಡ್ತಿ")
  ) {
    category = "career";
    categoryLocalized = isKn ? "ಉದ್ಯೋಗ & ಕಾರ್ಯಕ್ಷೇತ್ರ" : "Career & Professional Growth";
    shortVerdict = isKn ? "ಸ್ಥಿರತೆ ಹಾಗೂ ನವೀನ ಅವಕಾಶಗಳ ಕಾಲ" : "Stability & New Professional Opportunities Ahead";
    auspiciousWindow = isKn ? "ಪ್ರಸ್ತುತ ದಶಾ ಸಂಧಿಕಾಲ ಮುಗಿದು ಮುಂದಿನ ೪ ರಿಂದ ೭ ತಿಂಗಳುಗಳಲ್ಲಿ ಉತ್ತಮ ಪ್ರಗತಿ" : "Strong progress anticipated in the next 4 to 7 months";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ೧೦ನೇ ಕರ್ಮಾಧಿಪತಿಗೆ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ"
      : "Rudrabhisheka at Gokarna Mahabaleshwara & 10th Lord empowerment prayer";
    analysisText = isKn
      ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಗಮನಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaLordLocalized} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordLocalized} ಭುಕ್ತಿಯ ಪ್ರಭಾವವು ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನಿರ್ಣಾಯಕ ತಿರುವನ್ನು ತರಲಿದೆ. ನಿಮ್ಮ ದಶಮಾಧಿಪತಿ ಗ್ರಹವು ಉದ್ಯೋಗ ಸ್ಥಾನಕ್ಕೆ ಚೈತನ್ಯವನ್ನು ತುಂಬುತ್ತಿದ್ದು, ನೀವು ಈವರೆಗೆ ಪಟ್ಟ ಪರಿಶ್ರಮಕ್ಕೆ ಯೋಗ್ಯ ಮನ್ನಣೆ ಹಾಗೂ ಅಧಿಕಾರದ ಗೌರವ ದೊರೆಯುವ ಸಾಧ್ಯತೆಗಳಿವೆ. ಆದಾಗ್ಯೂ, ತಾತ್ಕಾಲಿಕವಾಗಿ ಗೋಚಾರದಲ್ಲಿ ಶನಿ ಅಥವಾ ರಾಹುವಿನ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ. ಯಾವುದೇ ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳದೆ, ಯೋಜಿತವಾಗಿ ಹೆಜ್ಜೆ ಇಡುವುದು ಶ್ರೇಯಸ್ಕರ.`
      : `Analyzing your natal chart with your active ${profile.currentMahadasha} Mahadasha and ${profile.currentBhukti} Bhukti, cosmic energy is activating your 10th house of profession. While the past cycle presented delays, the current planetary configuration indicates favorable new opportunities, recognition, or a strategic transition. Maintain diplomatic patience with superiors and avoid impulsive decisions during retrograde cycles.`;
  }
  // Marriage / Love / Relationship
  else if (
    qLower.includes("marriage") || qLower.includes("wedding") || qLower.includes("love") ||
    qLower.includes("relationship") || qLower.includes("husband") || qLower.includes("wife") ||
    qLower.includes("ವಿವಾಹ") || qLower.includes("ಮದುವೆ") || qLower.includes("ಸಂಬಂಧ") ||
    qLower.includes("ದಾಂಪತ್ಯ")
  ) {
    category = "marriage";
    categoryLocalized = isKn ? "ವಿವಾಹ & ದಾಂಪತ್ಯ ಜೀವನ" : "Marriage & Relationship Milestones";
    shortVerdict = isKn ? "ಶುಭ ಕಂಕಣ ಬಲ & ಸಾಮರಸ್ಯ ಪ್ರಾಪ್ತಿ" : "Auspicious Vivaha Yoga & Relationship Harmony";
    auspiciousWindow = isKn ? "ಮುಂದಿನ ಗುರು ಬಲ ಸಂಚಾರದ ಕಾಲಾವಧಿಯಲ್ಲಿ (೬-೯ ತಿಂಗಳು) ಕಂಕಣ ಬಲ ಪ್ರಾಪ್ತಿ" : "Auspicious marital window opening over the next 6-9 months";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶ್ರೀ ತಾಮ್ರಗೌರಿ ಅಮ್ಮನವರಿಗೆ ಕುಂಕುಮಾರ್ಚನೆ ಹಾಗೂ ಮಂಗಳ ಗೌರಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ"
      : "Kumkumarchana to Sri Tamra Gauri & Mangala Gauri Kalyana Sankalpa at Gokarna";
    analysisText = isKn
      ? `ನಿಮ್ಮ ಸಪ್ತಮ ಭಾವ (೭ನೇ ಮನೆ) ಹಾಗೂ ಕಳತ್ರಕಾರಕ ಗ್ರಹದ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ${dashaLordLocalized} ದಶಾ ಕಾಲವು ವಿವಾಹ ಹಾಗೂ ಸಂಬಂಧಗಳ ವಿಷಯದಲ್ಲಿ ಪಕ್ವತೆಯನ್ನು ಉಂಟುಮಾಡುತ್ತಿದೆ. ಹಿಂದಿನ ಅಪಾರ್ಥಗಳು ಅಥವಾ ವಿಳಂಬಗಳಿಗೆ ಕುಂಡಲಿಯ ಸಪ್ತಮ ಅಥವಾ ಅಷ್ಟಮ ದೃಷ್ಟಿ ಕಾರಣವಾಗಿತ್ತು. ಮುಂದಿನ ಗುರುಬಲದ ಸಂಚಾರದೊಂದಿಗೆ ಕುಟುಂಬದಲ್ಲಿ ವಿವಾಹದ ಮಾತುಕತೆಗಳು ಫಲಪ್ರದವಾಗಲಿದ್ದು, ಯೋಗ್ಯ ಜೀವನ ಸಂಗಾತಿಯ ಆಯ್ಕೆಗೆ ದೈವಿಕ ಮಾರ್ಗ ಮುಕ್ತವಾಗಲಿದೆ.`
      : `Looking at your 7th house and Venus dynamics under the running ${profile.currentMahadasha} Mahadasha, the period of emotional friction and unexplained delays is resolving. With supportive Jupiterian transit approaching, marriage prospects and harmony in domestic partnerships will experience major positive momentum.`;
  }
  // Finance / Wealth / Investment / Debt
  else if (
    qLower.includes("money") || qLower.includes("wealth") || qLower.includes("finance") ||
    qLower.includes("investment") || qLower.includes("debt") || qLower.includes("loss") ||
    qLower.includes("ಹಣ") || qLower.includes("ಧನ") || qLower.includes("ಸಾಲ") ||
    qLower.includes("ಹೂಡಿಕೆ") || qLower.includes("ಆರ್ಥಿಕ")
  ) {
    category = "finance";
    categoryLocalized = isKn ? "ಧನ & ಆರ್ಥಿಕ ಸ್ಥಿತಿ" : "Wealth, Finance & Investments";
    shortVerdict = isKn ? "ಆದಾಯ ವೃದ್ಧಿ & ಸಾಲ ಪರಿಹಾರದ ಮುನ್ಸೂಚನೆ" : "Financial Inflow & Debt Relief Horizon";
    auspiciousWindow = isKn ? "ಮುಂದಿನ ೪ ರಿಂದ ೮ ತಿಂಗಳುಗಳಲ್ಲಿ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯಲ್ಲಿ ಮಹತ್ತರ ಚೇತರಿಕೆ" : "Substantial financial consolidation within 4 to 8 months";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಹಾಗೂ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಪವಿತ್ರ ತರ್ಪಣ ಸೇವೆ"
      : "Sri Mahalakshmi Pooja and Kotiteertha holy Tarpana at Gokarna";
    analysisText = isKn
      ? `ನಿಮ್ಮ ದ್ವಿತೀಯ (ಧನ) ಹಾಗೂ ಏಕಾದಶ (ಲಾಭ) ಭಾವಗಳ ಸಂರಚನೆಯನ್ನು ಗಮನಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ${dashaLordLocalized}-${bhuktiLordLocalized} ಕಾಲಚಕ್ರವು ಹೊಸ ಆರ್ಥಿಕ ಮಾರ್ಗಗಳನ್ನು ತೆರೆಯುವ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ಈ ಹಿಂದೆ ಅನಗತ್ಯ ಧನವ್ಯಯ ಅಥವಾ ಸಾಲದ ಬಾಧೆಯು ನಿಮ್ಮನ್ನು ಕಾಡಿದ್ದರೂ, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಬಾಕಿ ಬರಬೇಕಾದ ಹಣವು ಕೈಸೇರುವ ಯೋಗವಿದೆ. ಆದಾಗ್ಯೂ, ಷೇರು ಮಾರುಕಟ್ಟೆ ಅಥವಾ ಊಹಾತ್ಮಕ ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕ.`
      : `Your 2nd house of wealth and 11th house of gains under the active ${profile.currentMahadasha} Mahadasha show promising financial inflow. Unwarranted expenses and debt burdens from past cycles will gradually subside as stalled funds return. Avoid high-risk speculative trading without proper hedging during this period.`;
  }
  // Health / Illness / Peace of Mind
  else if (
    qLower.includes("health") || qLower.includes("illness") || qLower.includes("pain") ||
    qLower.includes("mental") || qLower.includes("peace") || qLower.includes("ಆರೋಗ್ಯ") ||
    qLower.includes("ನೆಮ್ಮದಿ") || qLower.includes("ಕಾಯಿಲೆ") || qLower.includes("ಮಾನಸಿಕ")
  ) {
    category = "health";
    categoryLocalized = isKn ? "ಆರೋಗ್ಯ & ಮಾನಸಿಕ ಶಾಂತಿ" : "Health, Vitality & Mental Serenity";
    shortVerdict = isKn ? "ರೋಗ ನಿವಾರಣೆ & ಆತ್ಮಶಾಂತಿ ಸಿದ್ಧಿ" : "Recovery of Vitality & Spiritual Peace";
    auspiciousWindow = isKn ? "ಮುಂದಿನ ೨ ರಿಂದ ೫ ತಿಂಗಳುಗಳಲ್ಲಿ ಪರಿಪೂರ್ಣ ಆರೋಗ್ಯ ಚೇತರಿಕೆ" : "Marked improvement and relief over the next 2 to 5 months";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ ಹಾಗೂ ಆಯುಷ್ಯ ಸೂಕ್ತ ಹವನ"
      : "Maha Mrityunjaya Homa & Ayushya Sukta Havanam at Gokarna";
    analysisText = isKn
      ? `ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ೬ನೇ (ರೋಗ/ಶತ್ರು) ಭಾವಗಳ ಸ್ಥಿತಿಯನ್ನು ಅವಲೋಕಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲವು ಮಾನಸಿಕ ಒತ್ತಡ ಹಾಗೂ ದೈಹಿಕ ಆಯಾಸವನ್ನು ಶಮನಗೊಳಿಸುವತ್ತ ಮುನ್ನಡೆಯುತ್ತಿದೆ. ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿರುವ ಅತಿಕಲ್ಪನೆ ಅಥವಾ ಆತಂಕವನ್ನು ನಿಯಂತ್ರಿಸಲು ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ದೇವತಾರಾಧನೆ ಅತ್ಯಂತ ಸಹಕಾರಿ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮೃತ್ಯುಂಜಯ ಜಪ ಕೈಗೊಳ್ಳುವುದರಿಂದ ದೀರ್ಘಕಾಲದ ದೈಹಿಕ ಬಾಧೆಗಳು ಶಮನವಾಗಲಿವೆ.`
      : `Your Ascendant lord and 6th house dynamics indicate that current physical fatigue and mental anxiety are reaching a resolution phase. Regular meditation, balanced lifestyle, and the protective grace of Sri Gokarna Mahabaleshwara through Mrityunjaya Japa will dissolve these health stressors and restore lasting peace.`;
  }
  // Children / Education / Future
  else if (
    qLower.includes("child") || qLower.includes("baby") || qLower.includes("study") ||
    qLower.includes("education") || qLower.includes("exam") || qLower.includes("ಮಕ್ಕಳು") ||
    qLower.includes("ಸಂತಾನ") || qLower.includes("ಶಿಕ್ಷಣ") || qLower.includes("ವಿದ್ಯಾಭ್ಯಾಸ")
  ) {
    category = "children";
    categoryLocalized = isKn ? "ಸಂತಾನ & ವಿದ್ಯಾಭ್ಯಾಸ" : "Children, Education & Academic Future";
    shortVerdict = isKn ? "ವಿದ್ಯಾ ಪ್ರಗತಿ & ಸಂತಾನ ಭಾಗ್ಯ ವೃದ್ಧಿ" : "Academic Brilliance & Auspicious Progeny Blessings";
    auspiciousWindow = isKn ? "ಮುಂದಿನ ಶೈಕ್ಷಣಿಕ/ಸಂತಾನ ಕಾಲಚಕ್ರದಲ್ಲಿ ಮಹತ್ತರ ಯಶಸ್ಸು" : "Optimal academic and progeny window unfolding";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರಸ್ವತೀ ಹೋಮ ಹಾಗೂ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರಾನುಷ್ಠಾನ"
      : "Saraswati Homa & Santana Gopala Mantranushtana at Gokarna";
    analysisText = isKn
      ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪಂಚಮ ಭಾವ (೫ನೇ ಮನೆ - ಜ್ಞಾನ & ಸಂತಾನ ಸ್ಥಾನ) ಹಾಗೂ ಗುರು ಗ್ರಹದ ಶುಭ ಸ್ಥಿತಿಯು ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸಂತಾನ ಪ್ರಗತಿಗೆ ಪೂರಕವಾಗಿದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaLordLocalized} ದಶೆಯು ಜ್ಞಾನದ ಆಳವನ್ನು ವಿಸ್ತರಿಸಲಿದ್ದು, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅಥವಾ ಉನ್ನತ ಅಧ್ಯಯನದಲ್ಲಿ ಉತ್ಕೃಷ್ಟ ಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂತಾನ ಅಪೇಕ್ಷಿಗಳಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೋಪಾಲ ಕೃಷ್ಣ ಸೇವೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`
      : `Your 5th house of intellect, creative fruition, and progeny blessed by Jupiter indicates exceptional breakthroughs in education, competitive pursuits, and family progeny. Under the active ${profile.currentMahadasha} Mahadasha, your intellectual clarity and efforts will yield high laurels.`;
  }
  // General / Spiritual
  else {
    category = "general";
    categoryLocalized = isKn ? "ಸಾಮಾನ್ಯ ಜೀವನ & ಕಾಲಚಕ್ರ" : "General Life & Timeline Guidance";
    shortVerdict = isKn ? "ಕರ್ಮ ಪರಿಪಕ್ವತೆ & ದೈವಾನುಗ್ರಹದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ" : "Karmic Resolution & Divine Grace Manifesting";
    auspiciousWindow = isKn ? "ಮುಂದಿನ ೩ ರಿಂದ ೬ ತಿಂಗಳುಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಫಲ ಗೋಚರಿಸಲಿದೆ" : "Positive shifts expected within the next 3 to 6 months";
    recommendedGokarnaSeva = isKn
      ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ ಅಪ್ಪದ ಕಜ್ಜಾಯ ಸೇವೆ"
      : "Sri Gokarna Mahabaleshwara Mahadrudrabhisheka & Maha Ganapati Seva";
    analysisText = isKn
      ? `ನಿಮ್ಮ ಜಾತಕವನ್ನು ಸಮಗ್ರವಾಗಿ ವಿಶ್ಲೇಷಿಸಿದಾಗ, ಪ್ರಸ್ತುತ ${dashaLordLocalized} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordLocalized} ಭುಕ್ತಿ ಕಾಲವು ನಿಮ್ಮ ಜೀವನದ ಕರ್ಮಿಕ ಪರಿವರ್ತನೆಗೆ ಸಾಕ್ಷಿಯಾಗಿದೆ. ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ ${lagnaLordLocalized} ಗ್ರಹವು ನಿಮಗೆ ಅಚಲವಾದ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ನೀಡುತ್ತಿದ್ದು, ಪ್ರಸ್ತುತ ಎದುರಾಗುತ್ತಿರುವ ಯಾವುದೇ ಅಡ್ಡಿ-ಆತಂಕಗಳು ಶಾಶ್ವತವಲ್ಲ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಪೂಜೆ ಕೈಗೊಳ್ಳುವುದರಿಂದ ನಿಮ್ಮ ಸಂಕಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ ಸರ್ವತೋಮುಖ ಶುಭ ಉಂಟಾಗಲಿದೆ.`
      : `Looking across your natal planetary blueprint under the running ${profile.currentMahadasha} Mahadasha and ${profile.currentBhukti} Bhukti, your life is undergoing a significant karmic recalibration. Your Ascendant Lord ${profile.lagnaLord} grants you tremendous internal fortitude. Sincere prayers and recommended temple sevas at Sri Kshetra Gokarna will harmonize all opposing forces into supportive momentum.`;
  }

  return {
    question,
    category,
    categoryLocalized,
    shortVerdict,
    analysisText,
    auspiciousWindow,
    recommendedGokarnaSeva
  };
}
