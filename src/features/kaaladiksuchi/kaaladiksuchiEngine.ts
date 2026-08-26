import { siderealLongitudes } from "../../core/EphemerisEngine";
import { askGemini } from "../../core/GeminiEngine";
import { calculateRahuKaal } from "../../core/RahuKaalEngine";
import type {
  KaalaDiksuchiInput,
  KaalaDiksuchiResult,
  PlanetaryPositionSummary,
  ModernWorldAlignment,
  SamudrikaProfile,
  PrashnaOracleResult,
  RemedialPrescription,
  LiveDailyTransitEnergy,
  KarmicSoulMission,
  DecadeMilestone,
  SankhyaDeepAnalysis,
  DiksuchiCompassMatrix,
  DirectionalGuidance,
  DishaShoolaDaily,
  KaalaTimingRhythm
} from "./kaaladiksuchiTypes";

const RASHI_NAMES_EN = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

const RASHI_NAMES_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕಾಟಕ",
  "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ",
  "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRA_NAMES_KN = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರ", "ಆರ್ದ್ರಾ",
  "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ", "ಮಘಾ", "ಪೂರ್ವ ಫಲ್ಗುಣಿ", "ಉತ್ತರ ಫಲ್ಗುಣಿ",
  "ಹಸ್ತ", "ಚಿತ್ರಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲ", "ಪೂರ್ವಾಷಾಢ", "ಉತ್ತರಾಷಾಢ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ",
  "ಪೂರ್ವ ಭಾದ್ರಪದ", "ಉತ್ತರ ಭಾದ್ರಪದ", "ರೇವತಿ"
];

const WEEKDAY_NAMES_L5: Record<number, { kn: string; en: string; hi: string; te: string; ta: string }> = {
  0: { kn: "ಭಾನುವಾರ (ಆದಿತ್ಯವಾರ)", en: "Sunday (Ravi Vara)", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
  1: { kn: "ಸೋಮವಾರ", en: "Monday (Soma Vara)", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
  2: { kn: "ಮಂಗಳವಾರ", en: "Tuesday (Mangala Vara)", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்" },
  3: { kn: "ಬುಧವಾರ", en: "Wednesday (Budha Vara)", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
  4: { kn: "ಗುರುವಾರ (ಬೃಹಸ್ಪತಿವಾರ)", en: "Thursday (Guru Vara)", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
  5: { kn: "ಶುಕ್ರವಾರ", en: "Friday (Shukra Vara)", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
  6: { kn: "ಶನಿವಾರ", en: "Saturday (Shani Vara)", hi: "शनिवार", te: "శనివారం", ta: "சனி" }
};

function reduceToSingleDigit(num: number): number {
  let val = Math.abs(Math.floor(num));
  while (val > 9) {
    val = val.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return val === 0 ? 9 : val;
}

export function calculateNumerologyNumbers(dob: string, name: string): { ruling: number; destiny: number; soulUrge: number; namank: number } {
  const parts = dob.split("-").map(Number);
  const day = parts[2] || 1;
  const month = parts[1] || 1;
  const year = parts[0] || 2000;

  const ruling = reduceToSingleDigit(day);
  const destiny = reduceToSingleDigit(day + month + year.toString().split("").reduce((a, b) => a + parseInt(b, 10), 0));

  const vowels = "AEIOU";
  let vowelSum = 0;
  let totalNameSum = 0;
  const cleanName = (name || "Devotee").toUpperCase().replace(/[^A-Z]/g, "");

  // Chaldean Gemartia standard mapping
  const CHALDEAN_MAP: Record<string, number> = {
    A: 1, I: 1, J: 1, Q: 1, Y: 1,
    B: 2, K: 2, R: 2,
    C: 3, G: 3, L: 3, S: 3,
    D: 4, M: 4, T: 4,
    E: 5, H: 5, N: 5, X: 5,
    U: 6, V: 6, W: 6,
    O: 7, Z: 7,
    F: 8, P: 8
  };

  for (const ch of cleanName) {
    const val = CHALDEAN_MAP[ch] || (((ch.charCodeAt(0) - 64) % 9) || 9);
    totalNameSum += val;
    if (vowels.includes(ch)) {
      vowelSum += val;
    }
  }

  const soulUrge = reduceToSingleDigit(vowelSum || 5);
  const namank = reduceToSingleDigit(totalNameSum || 1);

  return { ruling, destiny, soulUrge, namank };
}

/** Pincode / Place Coordinates & Local Sun Times */
export function resolvePincodeCoordinates(pincode = "", placeLabel = ""): { lat: number; lng: number; locationName: string } {
  const cleanPin = (pincode || "").trim();
  const cleanPlace = (placeLabel || "").trim();

  // Known major regions & Gokarna default
  const PIN_MAP: Record<string, { lat: number; lng: number; name: string }> = {
    "581326": { lat: 14.5479, lng: 74.3188, name: "Gokarna, Karnataka" },
    "560001": { lat: 12.9716, lng: 77.5946, name: "Bengaluru, Karnataka" },
    "575001": { lat: 12.9141, lng: 74.8560, name: "Mangaluru, Karnataka" },
    "570001": { lat: 12.2958, lng: 76.6394, name: "Mysuru, Karnataka" },
    "580001": { lat: 15.3647, lng: 75.1240, name: "Hubballi-Dharwad, Karnataka" },
    "581343": { lat: 14.2810, lng: 74.4439, name: "Kumta, Karnataka" },
    "581301": { lat: 14.8135, lng: 74.1298, name: "Karwar, Karnataka" },
    "400001": { lat: 18.9388, lng: 72.8354, name: "Mumbai, Maharashtra" },
    "110001": { lat: 28.6139, lng: 77.2090, name: "New Delhi, Delhi" },
    "600001": { lat: 13.0827, lng: 80.2707, name: "Chennai, Tamil Nadu" },
    "500001": { lat: 17.3850, lng: 78.4867, name: "Hyderabad, Telangana" }
  };

  if (PIN_MAP[cleanPin]) {
    return { ...PIN_MAP[cleanPin]!, locationName: cleanPlace || PIN_MAP[cleanPin]!.name };
  }

  // Postal state prefix lookup
  if (cleanPin.startsWith("58") || cleanPin.startsWith("57") || cleanPin.startsWith("56")) {
    return { lat: 14.5479, lng: 74.3188, locationName: cleanPlace || "Gokarna/Karnataka" };
  }

  return { lat: 14.5479, lng: 74.3188, locationName: cleanPlace || "Gokarna Kshetra" };
}

/** Compute Directional Diksuchi & Timing Rhythms */
export function computeDiksuchiCompassMatrix(
  input: KaalaDiksuchiInput,
  rulingNumber: number,
  destinyNumber: number,
  sunRashiIdx: number
): DiksuchiCompassMatrix {
  const isKn = input.lang === "kn";
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  // 1. Career & Power Direction based on Surya Rashi & Ruling Lord
  const careerDirectionsByRuling: Record<number, DirectionalGuidance> = {
    1: {
      directionName: isKn ? "ಪೂರ್ವ ದಿಕ್ಕು (East - Indra / Surya)" : "East (Indra / Surya)",
      deity: isKn ? "ಭಗವಾನ್ ಸೂರ್ಯ ನಾರಾಯಣ & ಇಂದ್ರ" : "Lord Surya Narayana & Indra",
      rulingPlanet: isKn ? "ಸೂರ್ಯ (Surya)" : "Sun (Surya)",
      suitabilityDomain: isKn ? "ನಾಯಕತ್ವ, ಆಡಳಿತ, ನಿರ್ದೇಶನ & ಸ್ವತಂತ್ರ ಉದ್ಯಮ" : "Executive Leadership, Administration & Visionary Enterprise",
      practicalAdvice: isKn
        ? "ಕಾರ್ಯಾಲಯದಲ್ಲಿ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ ಕುಳಿತುಕೊಳ್ಳಿ. ಪೂರ್ವ ದಿಕ್ಕಿನಲ್ಲಿ ಕಿಟಕಿ ಅಥವಾ ಸೂರ್ಯನ ಬೆಳಕು ಬೀಳುವಂತೆ ವ್ಯವಸ್ಥೆ ಮಾಡಿ."
        : "Align your workspace facing East. Ensure clear morning light and unobstructed energy flow from the East."
    },
    2: {
      directionName: isKn ? "ವಾಯುವ್ಯ ದಿಕ್ಕು (North-West - Vayu / Chandra)" : "North-West (Vayu / Chandra)",
      deity: isKn ? "ಚಂದ್ರ ದೇವ & ವಾಯು ಭಗವಾನ್" : "Chandra Deva & Vayu Bhagavan",
      rulingPlanet: isKn ? "ಚಂದ್ರ (Moon)" : "Moon (Chandra)",
      suitabilityDomain: isKn ? "ಸಹಯೋಗ, ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ, ಕಲೆ & ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ" : "Public Relations, Creative Arts, Diplomacy & Liquid Commerce",
      practicalAdvice: isKn
        ? "ಉತ್ತರ ಅಥವಾ ವಾಯುವ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಸಂವಹನ ಸಾಧನಗಳನ್ನು ಇರಿಸಿ. ಶಾಂತ ಮನಸ್ಥಿತಿಯಿಂದ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ."
        : "Position communication systems in the North-West. Foster collaborative diplomacy facing North."
    },
    3: {
      directionName: isKn ? "ಈಶಾನ್ಯ ದಿಕ್ಕು (North-East - Ishanya / Guru)" : "North-East (Ishanya / Guru)",
      deity: isKn ? "ಶ್ರೀ ಮಹಾದೇವ & ಬೃಹಸ್ಪತಿ (ಗುರು)" : "Lord Shiva & Brihaspati (Jupiter)",
      rulingPlanet: isKn ? "ಗುರು (Jupiter)" : "Jupiter (Guru)",
      suitabilityDomain: isKn ? "ಜ್ಞಾನ ಪ್ರಸಾರ, ಶಿಕ್ಷಣ, ಹೂಡಿಕೆ, ಸಮಾಲೋಚನೆ & ಧರ್ಮ ಕಾರ್ಯ" : "Knowledge Architecture, Mentorship, High Wealth & Strategic Advisory",
      practicalAdvice: isKn
        ? "ಮನೆಯ ಅಥವಾ ಕಚೇರಿಯ ಈಶಾನ್ಯ ಮೂಲೆಯನ್ನು ಸದಾ ಶುದ್ಧವಾಗಿಟ್ಟು, ಅಲ್ಲಿ ದೇವರ ಮಂಟಪ ಅಥವಾ ಧ್ಯಾನ ಸ್ಥಾನವಿರಲಿ."
        : "Maintain the North-East zone pristine, sacred, and light. Conduct intellectual and spiritual work facing NE."
    },
    4: {
      directionName: isKn ? "ನೈಋತ್ಯ & ದಕ್ಷಿಣ ದಿಕ್ಕು (South-West / South)" : "South-West / South (Nirriti / Rahu)",
      deity: isKn ? "ಭೈರವ & ದುರ್ಗಾ ದೇವಿ" : "Lord Bhairava & Goddess Durga",
      rulingPlanet: isKn ? "ರಾಹು (Rahu)" : "Rahu (Innovation)",
      suitabilityDomain: isKn ? "ತಂತ್ರಜ್ಞಾನ, ಡಿಜಿಟಲ್ ನಾವೀನ್ಯತೆ, ಸಂಶೋಧನೆ & ರಣತಂತ್ರ" : "Disruptive Systems, Tech Architecture, Analytics & Strategy",
      practicalAdvice: isKn
        ? "ದಕ್ಷಿಣ ಅಥವಾ ನೈಋತ್ಯದಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಪೀಠವನ್ನಿಟ್ಟು, ಉತ್ತರಕ್ಕೆ ಮುಖ ಮಾಡಿ ಕಾರ್ಯ ನಿರ್ವಹಿಸುವುದು ಶ್ರೇಷ್ಠ."
        : "Anchor heavy executive desks in the South-West while facing North or East during work."
    },
    5: {
      directionName: isKn ? "ಉತ್ತರ ದಿಕ್ಕು (North - Kubera / Budha)" : "North (Kubera / Mercury)",
      deity: isKn ? "ಕುಬೇರ & ಶ್ರೀ ಮಹಾವಿಷ್ಣು" : "Lord Kubera & Maha Vishnu",
      rulingPlanet: isKn ? "ಬುಧ (Mercury)" : "Mercury (Budha)",
      suitabilityDomain: isKn ? "ವ್ಯಾಪಾರ, ಷೇರು ಮಾರುಕಟ್ಟೆ, ಸಂವಹನ, ಸಾಫ್ಟ್‌ವೇರ್ & ವಾಣಿಜ್ಯ" : "Trading, Commerce, Software, Media & Rapid Enterprise",
      practicalAdvice: isKn
        ? "ಉತ್ತರ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡಿ ಲೆಕ್ಕಪತ್ರ ಹಾಗೂ ವಹಿವಾಟು ನಡೆಸಿ. ಉತ್ತರ ಭಾಗದಲ್ಲಿ ಹಸಿರು ಗಿಡ ಅಥವಾ ನಾಣ್ಯಗಳ ಪಾತ್ರೆ ಇರಿಸಿ."
        : "Face North for commerce, analytics and trading. Keep the North sector vibrant with green accents."
    },
    6: {
      directionName: isKn ? "ಆಗ್ನೇಯ ದಿಕ್ಕು (South-East - Agni / Shukra)" : "South-East (Agni / Venus)",
      deity: isKn ? "ಮಹಾಲಕ್ಷ್ಮಿ & ಅಗ್ನಿ ದೇವ" : "Goddess Mahalakshmi & Agni Deva",
      rulingPlanet: isKn ? "ಶುಕ್ರ (Venus)" : "Venus (Shukra)",
      suitabilityDomain: isKn ? "ವಿನ್ಯಾಸ, ಬ್ರಾಂಡಿಂಗ್, ಐಷಾರಾಮಿ ವಸ್ತುಗಳು, ಕಲೆ & ಆತಿಥ್ಯ" : "Design, Creative Media, Luxury Goods & Aesthetic Enterprise",
      practicalAdvice: isKn
        ? "ಆಗ್ನೇಯ ದಿಕ್ಕಿನಲ್ಲಿ ದೀಪ ಅಥವಾ ಬೆಳಕಿನ ವ್ಯವಸ್ಥೆ ಇರಲಿ. ಸೌಮ್ಯ ಸುಗಂಧ ಹಾಗೂ ಸೃಜನಶೀಲ ವಾತಾವರಣ ಯಶಸ್ಸು ತರುತ್ತದೆ."
        : "Illuminate the South-East quadrant with warm lighting. Face East during creative design."
    },
    7: {
      directionName: isKn ? "ಈಶಾನ್ಯ & ವಾಯುವ್ಯ (North-East & North-West)" : "North-East & North-West (Ketu / Varuna)",
      deity: isKn ? "ಶ್ರೀ ಗಣಪತಿ & ರುದ್ರ" : "Lord Maha Ganapati & Rudra",
      rulingPlanet: isKn ? "ಕೇತು (Ketu)" : "Ketu (Mysticism)",
      suitabilityDomain: isKn ? "ಆಧ್ಯಾತ್ಮ, ಸಂಶೋಧನೆ, ಔಷಧ, ಗೂಢ ಶಾಸ್ತ್ರ & ತತ್ವಜ್ಞಾನ" : "Spiritual Analytics, Research, Healing Sciences & Philosophy",
      practicalAdvice: isKn
        ? "ಶಾಂತವಾದ ಈಶಾನ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಏಕಾಂತ ಚಿಂತನೆ ನಡೆಸಿ. ಅತಿಯಾದ ಸದ್ದು-ಗದ್ದಲವಿಲ್ಲದ ಸ್ಥಳದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿ."
        : "Perform deep research and contemplative strategy facing North-East in quiet sanctuary."
    },
    8: {
      directionName: isKn ? "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West - Varuna / Shani)" : "West (Varuna / Saturn)",
      deity: isKn ? "ಶನೀಶ್ವರ & ವರುಣ ದೇವ" : "Lord Shani & Varuna Deva",
      rulingPlanet: isKn ? "ಶನಿ (Saturn)" : "Saturn (Shani)",
      suitabilityDomain: isKn ? "ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಮೂಲಸೌಕರ್ಯ, ಶ್ರಮಶೀಲ ಕೈಗಾರಿಕೆ & ದೀರ್ಘಾವಧಿ ವ್ಯವಸ್ಥೆ" : "Infrastructure, Industrial Systems, Property & Enduring Compounding",
      practicalAdvice: isKn
        ? "ಪಶ್ಚಿಮ ದಿಕ್ಕಿನಲ್ಲಿ ಭದ್ರವಾದ ಶೇಖರಣಾ ಕಪಾಟುಗಳಿರಲಿ. ಸ್ಥಿರತೆ ಮತ್ತು ದೀರ್ಘಾವಧಿ ಯೋಜನೆಗಳಿಗೆ ಪಶ್ಚಿಮ ದಿಕ್ಕು ಪೂರಕ."
        : "Anchor physical archives and long-term assets in the West sector. Work with patient discipline."
    },
    9: {
      directionName: isKn ? "ದಕ್ಷಿಣ & ಪೂರ್ವ (South & East - Mangala / Agni)" : "South & East (Mangala / Agni)",
      deity: isKn ? "ಸುಬ್ರಹ್ಮಣ್ಯ (ಕಾರ್ತಿಕೇಯ) & ಆಂಜನೇಯ" : "Lord Kartikeya & Lord Hanuman",
      rulingPlanet: isKn ? "ಮಂಗಳ (Mars)" : "Mars (Mangala)",
      suitabilityDomain: isKn ? "ಸಾಹಸ, ರಕ್ಷಣೆ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ನಾಯಕತ್ವ & ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ" : "Courageous Enterprise, Defense, Sports, Property & Executive Command",
      practicalAdvice: isKn
        ? "ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ ಪ್ರಮುಖ ಕಾರ್ಯ ಪ್ರಾರಂಭಿಸಿ. ದಕ್ಷಿಣ ದಿಕ್ಕಿನಲ್ಲಿ ಶಕ್ತಿ ಮತ್ತು ಧೈರ್ಯದ ಸಂಕೇತಗಳಿರಲಿ."
        : "Initiate high-stakes actions facing East. Maintain vibrant red and copper energy accents."
    }
  };

  const careerDir = careerDirectionsByRuling[rulingNumber] || careerDirectionsByRuling[1]!;

  // 2. Wealth Direction: North (Kubera) & North-East (Ishanya)
  const wealthDir: DirectionalGuidance = {
    directionName: isKn ? "ಉತ್ತರ & ಈಶಾನ್ಯ (North & North-East - Kubera Sthana)" : "North & North-East (Kubera Sthana)",
    deity: isKn ? "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ & ಕುಬೇರ" : "Goddess Mahalakshmi & Lord Kubera",
    rulingPlanet: isKn ? "ಬುಧ ಹಾಗೂ ಗುರು (Mercury & Jupiter)" : "Mercury & Jupiter",
    suitabilityDomain: isKn ? "ಧನ ಸಂಚಯ, ಬ್ಯಾಂಕ್ ಖಾತೆ, ಚಿನ್ನಾಭರಣ & ಆರ್ಥಿಕ ಹೂಡಿಕೆ" : "Asset Accumulation, Wealth Storage, Treasury & High Returns",
    practicalAdvice: isKn
      ? "ಮನೆಯ ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯದಲ್ಲಿ ಹಣದ ತಿಜೋರಿ ಇರಿಸಿ, ಅದರ ಬಾಗಿಲು ಉತ್ತರಕ್ಕೆ ತೆರೆಯುವಂತಿರಲಿ."
      : "Position financial vaults and accounts in the North/NE sector with doors opening Northward."
  };

  // 3. Health & Meditation Direction
  const healthDir: DirectionalGuidance = {
    directionName: isKn ? "ಪೂರ್ವ & ಈಶಾನ್ಯ (East & North-East)" : "East & North-East",
    deity: isKn ? "ಧನ್ವಂತರಿ & ಸೂರ್ಯ ನಾರಾಯಣ" : "Lord Dhanvantari & Surya Narayana",
    rulingPlanet: isKn ? "ಸೂರ್ಯ & ಚಂದ್ರ (Sun & Moon)" : "Sun & Moon",
    suitabilityDomain: isKn ? "ಪ್ರಾಣಾಯಾಮ, ಯೋಗ, ದೈಹಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ & ಮಾನಸಿಕ ನೆಮ್ಮದಿ" : "Pranayama, Yoga, Circadian Rest & Cellular Vitality",
    practicalAdvice: isKn
      ? "ಪೂರ್ವಕ್ಕೆ ತಲೆ ಇಟ್ಟು ಮಲಗುವುದು ಆಳವಾದ ನಿದ್ರೆ ಮತ್ತು ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣಕ್ಕೆ ಅತ್ಯುತ್ತಮ."
      : "Sleep with head aligned towards East or South for optimal cardiovascular balance and restorative rest."
  };

  // 4. Study & Knowledge Direction
  const studyDir: DirectionalGuidance = {
    directionName: isKn ? "ಈಶಾನ್ಯ & ಉತ್ತರ (North-East & North)" : "North-East & North",
    deity: isKn ? "ಸರಸ್ವತಿ ದೇವಿ & ದಕ್ಷಿಣಾಮೂರ್ತಿ" : "Goddess Saraswati & Lord Dakshinamurthy",
    rulingPlanet: isKn ? "ಗುರು & ಬುಧ (Jupiter & Mercury)" : "Jupiter & Mercury",
    suitabilityDomain: isKn ? "ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಂಥ ಪಠಣ, ಸಂಶೋಧನೆ & ಪರೀಕ್ಷಾ ಯಶಸ್ಸು" : "Deep Focus, Academic Mastery, Examination & Strategic Absorption",
    practicalAdvice: isKn
      ? "ಅಧ್ಯಯನ ಮಾಡುವಾಗ ಉತ್ತರ ಅಥವಾ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡುವುದರಿಂದ ಧಾರಣಾ ಶಕ್ತಿ ೨ ಪಟ್ಟು ಹೆಚ್ಚುತ್ತದೆ."
      : "Face North or East while studying or writing to maximize cognitive retention and focus."
  };

  // 5. Daily Disha Shoola (ದಿನದ ದಿಕ್ಶೂಲ)
  const DISHA_SHOOLA_DATA: Record<number, DishaShoolaDaily> = {
    0: {
      afflictedDirection: isKn ? "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West)" : "West",
      reason: isKn ? "ಭಾನುವಾರ ಪಶ್ಚಿಮ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Sunday carries Disha Shoola in the West direction.",
      classicalRemedy: isKn ? "ಅನಿವಾರ್ಯ ಪ್ರಯಾಣವಿದ್ದರೆ ತುಪ್ಪ ಅಥವಾ ವೀಳ್ಯದೆಲೆ ಸೇವಿಸಿ ಹೊರಡುವುದು." : "Consume a drop of Ghee or Betel leaf before inevitable travel."
    },
    1: {
      afflictedDirection: isKn ? "ಪೂರ್ವ ದಿಕ್ಕು (East)" : "East",
      reason: isKn ? "ಸೋಮವಾರ ಪೂರ್ವ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Monday carries Disha Shoola in the East direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಕನ್ನಡಿ ನೋಡಿ (ದರ್ಪಣ ದರ್ಶನ) ಅಥವಾ ಹಾಲು ಸೇವಿಸಿ ಹೊರಡಿ." : "View mirror reflection or take a sip of milk before journey."
    },
    2: {
      afflictedDirection: isKn ? "ಉತ್ತರ ದಿಕ್ಕು (North)" : "North",
      reason: isKn ? "ಮಂಗಳವಾರ ಉತ್ತರ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Tuesday carries Disha Shoola in the North direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಕೊತ್ತಂಬರಿ ಅಥವಾ ಬೆಲ್ಲ ಸೇವಿಸಿ ಗಣಪತಿಯನ್ನು ಸ್ಮರಿಸಿ." : "Consume coriander seeds or jaggery with Ganapati prayer."
    },
    3: {
      afflictedDirection: isKn ? "ಉತ್ತರ ದಿಕ್ಕು (North)" : "North",
      reason: isKn ? "ಬುಧವಾರ ಉತ್ತರ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Wednesday carries Disha Shoola in the North direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಬೆಲ್ಲ ಅಥವಾ ಹಸಿರು ಧಾನ್ಯ ಮುಟ್ಟಿ ನಮಸ್ಕರಿಸಿ." : "Taste jaggery or touch green gram before departure."
    },
    4: {
      afflictedDirection: isKn ? "ದಕ್ಷಿಣ ದಿಕ್ಕು (South)" : "South",
      reason: isKn ? "ಗುರುವಾರ ದಕ್ಷಿಣ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Thursday carries Disha Shoola in the South direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಮೊಸರು ಅಥವಾ ಜೀರಿಗೆ ಸೇವಿಸಿ ಗುರು ಪ್ರಾರ್ಥನೆ ಮಾಡಿ." : "Consume fresh curd or cumin seeds before journey."
    },
    5: {
      afflictedDirection: isKn ? "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West)" : "West",
      reason: isKn ? "ಶುಕ್ರವಾರ ಪಶ್ಚಿಮ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Friday carries Disha Shoola in the West direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಯವಧಾನ್ಯ (ಜವೆಗೋಧಿ) ಅಥವಾ ಹಾಲಿನ ಸಿಹಿ ಸೇವಿಸಿ." : "Consume barley or milk sweets before departure."
    },
    6: {
      afflictedDirection: isKn ? "ಪೂರ್ವ ದಿಕ್ಕು (East)" : "East",
      reason: isKn ? "ಶನಿವಾರ ಪೂರ್ವ ದಿಕ್ಕಿಗೆ ದಿಕ್ಶೂಲ ದೋಷವಿರುತ್ತದೆ." : "Saturday carries Disha Shoola in the East direction.",
      classicalRemedy: isKn ? "ಪ್ರಯಾಣಕ್ಕೆ ಮುನ್ನ ಎಳ್ಳು ಅಥವಾ ಶುಂಠಿ ಸೇವಿಸಿ ಆಂಜನೇಯನನ್ನು ಸ್ಮರಿಸಿ." : "Consume sesame seeds or dry ginger with Hanuman prayer."
    }
  };

  const dailyDisha = DISHA_SHOOLA_DATA[currentDayOfWeek] || DISHA_SHOOLA_DATA[0]!;

  // 6. Kaala Timing Rhythms for Today
  const coords = resolvePincodeCoordinates(input.pincode, input.placeLabel);
  const sunriseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 12, 0);
  const sunsetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 38, 0);

  const rahuKaalObj = calculateRahuKaal(now, sunriseDate, sunsetDate);
  const rahuStr = `${rahuKaalObj.startTime} - ${rahuKaalObj.endTime}`;

  // Standard Segment Timings
  const GULIKA_SEGMENTS: Record<number, string> = {
    0: "03:00 PM - 04:30 PM",
    1: "01:30 PM - 03:00 PM",
    2: "12:00 PM - 01:30 PM",
    3: "10:30 AM - 12:00 PM",
    4: "09:00 AM - 10:30 AM",
    5: "07:30 AM - 09:00 AM",
    6: "06:00 AM - 07:30 AM"
  };

  const YAMAGANDA_SEGMENTS: Record<number, string> = {
    0: "12:00 PM - 01:30 PM",
    1: "10:30 AM - 12:00 PM",
    2: "09:00 AM - 10:30 AM",
    3: "07:30 AM - 09:00 AM",
    4: "06:00 AM - 07:30 AM",
    5: "03:00 PM - 04:30 PM",
    6: "01:30 PM - 03:00 PM"
  };

  const timingRhythm: KaalaTimingRhythm = {
    sunriseTime: "06:12 AM IST",
    sunsetTime: "06:38 PM IST",
    abhijitMuhurtha: "11:58 AM - 12:48 PM IST",
    rahuKaal: rahuStr,
    gulikaKaal: GULIKA_SEGMENTS[currentDayOfWeek] || "01:30 PM - 03:00 PM",
    yamaganda: YAMAGANDA_SEGMENTS[currentDayOfWeek] || "10:30 AM - 12:00 PM",
    peakPranaWindow: isKn
      ? "ಪ್ರಾತಃಕಾಲ ೦೮:೧೫ ರಿಂದ ೧೧:೪೫ ಹಾಗೂ ಸಂಜೆ ೦೪:೩೦ ರಿಂದ ೦೬:೧೫"
      : "08:15 AM - 11:45 AM & 04:30 PM - 06:15 PM"
  };

  return {
    careerDirection: careerDir,
    wealthDirection: wealthDir,
    healthMeditationDirection: healthDir,
    studyKnowledgeDirection: studyDir,
    dailyDishaShoola: dailyDisha,
    timingRhythm
  };
}

export function computeDeepSankhyaAnalysis(input: KaalaDiksuchiInput, ruling: number, destiny: number, soulUrge: number, namank: number): SankhyaDeepAnalysis {
  const isKn = input.lang === "kn";
  const rulingLords = [
    "",
    isKn ? "ಸೂರ್ಯ (Surya - ಆತ್ಮಶಕ್ತಿ)" : "Sun (Leadership & Soul Radiance)",
    isKn ? "ಚಂದ್ರ (Chandra - ಕಲ್ಪನಾಶಕ್ತಿ)" : "Moon (Intuition & Peace)",
    isKn ? "ಗುರು (Jupiter - ಜ್ಞಾನ & ಧರ್ಮ)" : "Jupiter (Wisdom & Abundance)",
    isKn ? "ರಾಹು (Rahu - ತಂತ್ರಜ್ಞಾನ & ನಾವೀನ್ಯತೆ)" : "Rahu (Innovation & Strategy)",
    isKn ? "ಬುಧ (Mercury - ವ್ಯಾಪಾರ & ಚತುರತೆ)" : "Mercury (Commerce & Intellect)",
    isKn ? "ಶುಕ್ರ (Venus - ಕಲೆ & ಸೌಂದರ್ಯ)" : "Venus (Harmony & Luxury)",
    isKn ? "ಕೇತು (Ketu - ಆಧ್ಯಾತ್ಮ & ಸಂಶೋಧನೆ)" : "Ketu (Mysticism & Research)",
    isKn ? "ಶನಿ (Saturn - ಶ್ರಮ & ದೀರ್ಘಾವಧಿ ಯಶಸ್ಸು)" : "Saturn (Discipline & Mastery)",
    isKn ? "ಮಂಗಳ (Mars - ಧೈರ್ಯ & ನಾಯಕತ್ವ)" : "Mars (Courage & Action)"
  ];

  const wealthSecrets = [
    "",
    isKn ? "ಸ್ವತಂತ್ರ ನಾಯಕತ್ವ, ಪೂರ್ವ ದಿಕ್ಕಿನ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಬಂಗಾರದ ವರ್ಣದ ಬಳಕೆ ಸಂಪತ್ತನ್ನು ನಿರಂತರ ಆಕರ್ಷಿಸುತ್ತದೆ." : "Independent executive leadership, morning solar alignment and golden amber accents attract high wealth.",
    isKn ? "ಪಾಲುದಾರಿಕೆ, ಜಲ ತತ್ವದ ವ್ಯಾಪಾರ, ಶಾಂತ ಸಂವಹನ ಹಾಗೂ ಉತ್ತರ-ವಾಯುವ್ಯ ದಿಕ್ಕಿನ ಸಹಯೋಗದಿಂದ ನಿರಂತರ ಧನಾಗಮನ." : "Collaborative ventures, liquid assets, calm diplomacy and North-West alignment bring continuous fortune.",
    isKn ? "ಜ್ಞಾನ ಪ್ರಸಾರ, ಬೋಧನೆ, ಆರ್ಥಿಕ ಸಲಹಾ ಸೇವೆಗಳು ಹಾಗೂ ಈಶಾನ್ಯ ದಿಕ್ಕಿನಲ್ಲಿ ಗುರು ಕೃಪೆಯಿಂದ ಉನ್ನತ ಐಶ್ವರ್ಯ." : "Consultancy, knowledge dissemination, ethical mentorship and North-East alignment unlock generational wealth.",
    isKn ? "ನವೀನ ತಂತ್ರಜ್ಞಾನ, ಸಂಶೋಧನೆ, ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ದಕ್ಷಿಣ-ಪಶ್ಚಿಮ ದಿಕ್ಕಿನ ಸ್ಥಿರತೆಯಿಂದ ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು." : "Systemic innovation, specialized analytics, and anchored South-West grounding yield exponential gains.",
    isKn ? "ವಾಣಿಜ್ಯ, ಷೇರು ಮಾರುಕಟ್ಟೆ, ಸಂವಹನ ಮಾಧ್ಯಮಗಳು ಹಾಗೂ ಉತ್ತರ ದಿಕ್ಕಿನ ಕುಬೇರ ಬಲದಿಂದ ಕ್ಷಿಪ್ರ ಧನಲಾಭ." : "Trading, dynamic communications, analytics, and North Kubera alignment yield rapid wealth compounding.",
    isKn ? "ಸೌಂದರ್ಯ, ಐಷಾರಾಮಿ ವಸ್ತುಗಳು, ಕಲೆ, ವಾಸ್ತುಶಿಲ್ಪ ಹಾಗೂ ಆಗ್ನೇಯ ದಿಕ್ಕಿನ ಸೃಜನಶೀಲತೆಯಿಂದ ಸಮೃದ್ಧಿ." : "Aesthetic design, premium branding, hospitality, and South-East creative balance create abundant prosperity.",
    isKn ? "ಸಂಶೋಧನೆ, ಔಷಧ, ಆಧ್ಯಾತ್ಮಿಕ ಲೇಖನ ಹಾಗೂ ಈಶಾನ್ಯ ದಿಕ್ಕಿನ ಆಂತರಿಕ ವಿವೇಕದಿಂದ ಭಾಗ್ಯೋದಯ." : "Deep research, specialized analytics, wellness and North-East contemplative mastery unlock hidden treasures.",
    isKn ? "ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಮೂಲಸೌಕರ್ಯ, ಶ್ರಮಶೀಲತೆ ಹಾಗೂ ಪಶ್ಚಿಮ ದಿಕ್ಕಿನ ದೃಢ ನಿಷ್ಠೆಯಿಂದ ಶಾಶ್ವತ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ." : "Real estate, engineering, patient compounding, and West-sector discipline build an enduring empire.",
    isKn ? "ಸಾಹಸೋದ್ಯಮ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಕ್ರೀಡೆ ಅಥವಾ ರಕ್ಷಣಾ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅಪಾರ ಯಶಸ್ಸು." : "Bold enterprise, property, executive leadership, and East-South pioneering endeavors create monumental wealth."
  ];

  const careerArchetypes = [
    "",
    isKn ? "ನಾಯಕ / ನಿರ್ದೇಶಕ / ಸ್ವತಂತ್ರ ಸಂಸ್ಥಾಪಕ (Visionary Pioneer)" : "Visionary Founder / Executive Director",
    isKn ? "ಸಲಹೆಗಾರ / ಕಲಾಕಾರ / ಮಾನವ ಸಂಪನ್ಮೂಲ ತಜ್ಞ (Empathetic Counselor / Creator)" : "Empathetic Counselor / Creative Strategist",
    isKn ? "ಗುರು / ಪ್ರಾಧ್ಯಾಪಕ / ಹಣಕಾಸು ತಜ್ಞ (Chief Advisor / Wealth Mentor)" : "Strategic Mentor / Financial Authority",
    isKn ? "ತಂತ್ರಜ್ಞ / ಅನ್ವೇಷಕ / ರಣತಂತ್ರಜ್ಞ (Disruptive Technologist / Analyst)" : "Disruptive Technologist / Strategist",
    isKn ? "ಉದ್ಯಮಿ / ವಾಣಿಜ್ಯ ತಜ್ಞ / ಸಂವಹನಕಾರ (Agile Entrepreneur / Trader)" : "Agile Entrepreneur / Media Specialist",
    isKn ? "ವಿನ್ಯಾಸಕ / ಸೃಜನಶೀಲ ನಿರ್ದೇಶಕ / ರಾಜತಾಂತ್ರಿಕ (Creative Architect / Diplomat)" : "Creative Architect / Brand Leader",
    isKn ? "ವಿಜ್ಞಾನಿ / ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶಕ / ಸಂಶೋಧಕ (Researcher / Spiritual Luminary)" : "Deep Researcher / Spiritual Innovator",
    isKn ? "ಕೈಗಾರಿಕೋದ್ಯಮಿ / ವ್ಯವಸ್ಥಾಪಕ / ನಿರ್ಮಾತೃ (Industrialist / Operations Master)" : "Industrialist / Systems Master",
    isKn ? "ಸಾಹಸಿ / ನಾಯಕ / ಮುಖ್ಯ ಕಾರ್ಯನಿರ್ವಾಹಕ (Commanding Leader / Pioneer)" : "Commanding Leader / Trailblazer"
  ];

  const harmoniousNumbersMap: Record<number, number[]> = {
    1: [1, 2, 3, 5, 9],
    2: [1, 2, 4, 7],
    3: [1, 3, 5, 6, 9],
    4: [1, 2, 7, 8],
    5: [1, 3, 5, 6],
    6: [3, 5, 6, 9],
    7: [1, 2, 4, 7],
    8: [4, 5, 6, 8],
    9: [1, 3, 6, 9]
  };

  return {
    mulank: ruling,
    mulankLord: rulingLords[ruling] || "ಸೂರ್ಯ",
    bhagyank: destiny,
    bhagyankLord: rulingLords[destiny] || "ಗುರು",
    namank,
    soulUrge,
    harmoniousNumbers: harmoniousNumbersMap[ruling] || [1, 3, 5, 9],
    wealthAttractionSecret: wealthSecrets[ruling] || wealthSecrets[1]!,
    careerArchetype: careerArchetypes[ruling] || careerArchetypes[1]!
  };
}

export function evaluateDignity(planet: string, rashiIdx: number): "Exalted" | "Own Sign" | "Friendly" | "Neutral" | "Debilitated" {
  const exaltMap: Record<string, number> = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
  const debilMap: Record<string, number> = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0, Rahu: 7, Ketu: 1 };
  const ownMap: Record<string, number[]> = {
    Sun: [4],
    Moon: [3],
    Mars: [0, 7],
    Mercury: [2, 5],
    Jupiter: [8, 11],
    Venus: [1, 6],
    Saturn: [9, 10],
    Rahu: [10],
    Ketu: [7]
  };

  if (exaltMap[planet] === rashiIdx) return "Exalted";
  if (debilMap[planet] === rashiIdx) return "Debilitated";
  if (ownMap[planet]?.includes(rashiIdx)) return "Own Sign";
  return "Friendly";
}

export function computeSamudrikaProfile(input: KaalaDiksuchiInput, rulingNumber: number): SamudrikaProfile {
  let dominantPlanet = "Jupiter (Guru)";
  let archetype = "ಜ್ಞಾನಿ & ಮಾರ್ಗದರ್ಶಕ (The Wise Counselor)";
  let reflex = "ಗಂಭೀರ ಚಿಂತನೆ & ಧರ್ಮನಿಷ್ಠೆ (Calm deliberation and principled action)";
  let superpower = "ಅತ್ಯುನ್ನತ ದೂರದೃಷ್ಟಿ ಹಾಗೂ ಸಂಕೀರ್ಣ ಸವಾಲುಗಳಿಗೆ ಸುಲಭ ಪರಿಹಾರ (Strategic foresight and clear discernment)";

  const elementCounts = { fire: 25, earth: 25, air: 25, water: 25 };

  const forehead = input.foreheadShape || (rulingNumber === 1 || rulingNumber === 9 ? "angular" : rulingNumber === 2 || rulingNumber === 6 ? "curved" : rulingNumber === 5 ? "compact" : "broad");
  const eyes = input.eyeRadiance || (rulingNumber === 1 || rulingNumber === 9 ? "sharp" : rulingNumber === 2 || rulingNumber === 6 ? "gentle" : rulingNumber === 5 ? "analytical" : "calm");
  const hand = input.handElement || (rulingNumber === 1 || rulingNumber === 9 ? "fire" : rulingNumber === 2 || rulingNumber === 6 ? "water" : rulingNumber === 5 ? "air" : "earth");

  if (forehead === "broad" || eyes === "calm") {
    dominantPlanet = "Jupiter (Guru)";
    archetype = input.lang === "kn" ? "ಧರ್ಮಜ್ಞ & ನಾಯಕ (Visionary Leader & Counselor)" : "Visionary Leader & Counselor";
    elementCounts.fire += 20;
    elementCounts.earth += 10;
  } else if (forehead === "angular" || eyes === "sharp") {
    dominantPlanet = "Mars (Kuja / Mangala)";
    archetype = input.lang === "kn" ? "ಸಾಹಸಿ & ನಿರ್ಣಾಯಕ (Action Hero & Decisive Achiever)" : "Action Hero & Decisive Achiever";
    reflex = input.lang === "kn" ? "ತ್ವರಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಂಜದ ಸಾಹಸ ಪ್ರವೃತ್ತಿ" : "Instant decision making and courageous drive";
    elementCounts.fire += 35;
  } else if (forehead === "curved" || eyes === "gentle") {
    dominantPlanet = "Venus (Shukra) / Moon (Chandra)";
    archetype = input.lang === "kn" ? "ಸೃಜನಶೀಲ & ಸಹಾನುಭೂತಿ ನಾಯಕ (Empathetic Creator & Diplomat)" : "Empathetic Creator & Diplomat";
    elementCounts.water += 30;
    elementCounts.air += 15;
  } else if (forehead === "compact" || eyes === "analytical") {
    dominantPlanet = "Mercury (Budha)";
    archetype = input.lang === "kn" ? "ವಿಶ್ಲೇಷಕ & ಚತುರ ವ್ಯಾಪಾರಿ (Analytical Strategist & Communicator)" : "Analytical Strategist & Communicator";
    elementCounts.air += 35;
    elementCounts.earth += 15;
  }

  if (hand === "fire") elementCounts.fire += 25;
  if (hand === "earth") elementCounts.earth += 25;
  if (hand === "air") elementCounts.air += 25;
  if (hand === "water") elementCounts.water += 25;

  const total = elementCounts.fire + elementCounts.earth + elementCounts.air + elementCounts.water;
  const normalized = {
    fire: Math.round((elementCounts.fire / total) * 100),
    earth: Math.round((elementCounts.earth / total) * 100),
    air: Math.round((elementCounts.air / total) * 100),
    water: Math.round((elementCounts.water / total) * 100)
  };

  return {
    dominantPlanet,
    elementalComposition: normalized,
    personalityArchetype: archetype,
    instinctualReflex: reflex,
    hiddenSuperpower: superpower
  };
}

export function computeLiveTransitEnergy(input: KaalaDiksuchiInput, rulingNumber: number): LiveDailyTransitEnergy {
  const now = new Date();
  const sky = siderealLongitudes(now, "lahiri");
  const isKn = input.lang === "kn";

  const moonRashiIdx = Math.floor(sky.moon / 30);
  const moonRashiName = isKn ? RASHI_NAMES_KN[moonRashiIdx] : RASHI_NAMES_EN[moonRashiIdx];
  const moonNakIdx = Math.floor(sky.moon / (360 / 27));
  const moonNakName = isKn ? NAKSHATRA_NAMES_KN[moonNakIdx] : NAKSHATRA_NAMES_EN[moonNakIdx];

  const pranaScore = Math.min(98, Math.max(72, 75 + (rulingNumber % 4) * 6 + ((now.getUTCHours() % 6) * 2)));

  const peakWindow = isKn
    ? "ಪ್ರಾತಃಕಾಲ ೦೮:೪೫ ರಿಂದ ೧೧:೩೦ (ಸೂರ್ಯ ಕಾಲ & ಅಭಿಜಿತ್ ಮುಹೂರ್ತ)"
    : "08:45 AM to 11:30 AM (Solar Window & Abhijit Muhurtha)";

  const favorable = isKn
    ? [
        "ಪ್ರಮುಖ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳು, ಹೂಡಿಕೆ ಹಾಗೂ ಕಾರ್ಯಾರಂಭ.",
        "ದೇವತಾ ಆರಾಧನೆ, ಗುರು ಸಂದರ್ಶನ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸಂಕಲ್ಪ.",
        "ಉನ್ನತ ಅಧ್ಯಯನ, ಹೊಸ ಕೌಶಲ್ಯ ಕಲಿಕೆ ಹಾಗೂ ವ್ಯಕ್ತಿತ್ವ ವಿಕಸನ."
      ]
    : [
        "Major agreements, asset allocation and strategic undertakings.",
        "Temple sankalpa, sacred meditation and Guru blessings.",
        "Higher learning, advanced skill acquisition and executive focus."
      ];

  const caution = isKn
    ? [
        "ಭಾವನಾತ್ಮಕ ಆತುರದ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ಅನಗತ್ಯ ವಿವಾದಗಳು.",
        "ರಾಹು ಕಾಲದ ಸಮಯದಲ್ಲಿ ಹೊಸ ಕಾರ್ಯ ಅಥವಾ ಪ್ರಯಾಣ ಆರಂಭಿಸುವುದು."
      ]
    : [
        "Impulsive emotional decisions and unnecessary debate.",
        "Initiating new travel or contracts during Rahu Kaala."
      ];

  const summary = isKn
    ? `ಇಂದು ಆಕಾಶ ಮಂಡಲದಲ್ಲಿ ಚಂದ್ರನು ${moonRashiName} ರಾಶಿಯ ${moonNakName} ನಕ್ಷತ್ರದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಮೂಲಾಂಕಕ್ಕೆ (${rulingNumber}) ಅತ್ಯಂತ ಪೂರಕವಾದ ${pranaScore}% ಪ್ರಾಣಶಕ್ತಿ ಪ್ರವಾಹವಿದೆ.`
    : `Today Moon transits ${moonRashiName} in ${moonNakName} Nakshatra, channeling an optimal ${pranaScore}% Pranic Vitality resonance for your Ruling Energy (${rulingNumber}).`;

  const impact = isKn
    ? "ಮನಸ್ಸಿನಲ್ಲಿ ದೃಢ ಸಂಕಲ್ಪ ಮತ್ತು ಕಾರ್ಯೋತ್ಸಾಹ ನೆಲೆಸಲಿದೆ. ದಿಕ್ಕು ಮತ್ತು ಕಾಲದ ಮುಹೂರ್ತ ಪಾಲಿಸಿದರೆ ಜಯ ನಿಶ್ಚಿತ."
    : "High cognitive clarity and constructive execution drive today's rhythm when aligned with Diksuchi guidance.";

  return {
    pranaScore,
    taraBalaLabel: isKn ? "ಮಿತ್ರ ತಾರಾ ಬಲ (Friendly Resonance)" : "Friendly Tara Bala Resonance",
    chandraBalaLabel: isKn ? "ಶುಭ ಚಂದ್ರ ಬಲ (Auspicious Moon Power)" : "Auspicious Chandra Bala Power",
    peakHourWindow: peakWindow,
    favorableActivities: favorable,
    cautionActivities: caution,
    currentTransitSummary: summary,
    chandraGocharaImpact: impact
  };
}

export function computeKarmicSoulMission(input: KaalaDiksuchiInput, sunRashiIdx: number): KarmicSoulMission {
  const isKn = input.lang === "kn";
  const axisPairs = [
    { axis: "ಮೇಷ - ತುಲಾ (Mesha-Tula Axis)", purpose: "ಸ್ವಾವಲಂಬನೆ, ಧರ್ಮನಿಷ್ಠ ನಾಯಕತ್ವ ಮತ್ತು ಸಮತೋಲಿತ ಸಂಬಂಧಗಳ ನಿರ್ಮಾಣ", past: "ಹಿಂದಿನ ಜನ್ಮದ ರಾಜತಾಂತ್ರಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಸಹಯೋಗದ ಜ್ಞಾನ", debt: "ಸಂಬಂಧಗಳಲ್ಲಿ ಅತಿಯಾದ ಅವಲಂಬನೆ ಬಿಟ್ಟು ಸ್ವಂತ ಸಾಮರ್ಥ್ಯದಿಂದ ಮುನ್ನಡೆಯುವುದು" },
    { axis: "ವೃಷಭ - ವೃಶ್ಚಿಕ (Vrishabha-Vrischika Axis)", purpose: "ಆಂತರಿಕ ಪರಿವರ್ತನೆ, ಶಾಶ್ವತ ಸಂಪತ್ತಿನ ರಕ್ಷಣೆ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಥೈರ್ಯ", past: "ದೃಢತೆ ಮತ್ತು ಆರ್ಥಿಕ ಸಂಪನ್ಮೂಲಗಳ ನಿರ್ವಹಣೆಯ ಪ್ರಾವೀಣ್ಯತೆ", debt: "ಭೌತಿಕ ವ್ಯಾಮೋಹ ಕಳೆದು ಅಂತರಂಗದ ಶಾಂತಿಯನ್ನು ಸಾಧಿಸುವುದು" },
    { axis: "ಮಿಥುನ - ಧನು (Mithuna-Dhanu Axis)", purpose: "ಉನ್ನತ ಸತ್ಯದ ಅನ್ವೇಷಣೆ, ವಿಶ್ವಜ್ಞಾನ ಪ್ರಸಾರ ಮತ್ತು ಧರ್ಮೋಪದೇಶ", past: "ಬುದ್ಧಿವಂತಿಕೆ, ಭಾಷಾ ಪ್ರಾವೀಣ್ಯತೆ ಮತ್ತು ತೀಕ್ಷ್ಣ ಸಂವಹನ ಕೌಶಲ್ಯ", debt: "ಕೇವಲ ಮಾಹಿತಿ ಸಂಗ್ರಹ ಬಿಟ್ಟು ಪ್ರತ್ಯಕ್ಷ ಅನುಭವ ಜ್ಞಾನ ಪಡೆಯುವುದು" },
    { axis: "ಕರ್ಕಾಟಕ - ಮಕರ (Karka-Makara Axis)", purpose: "ಜವಾಬ್ದಾರಿಯುತ ಲೋಕಕಲ್ಯಾಣ ಕರ್ಮ ಹಾಗೂ ಸಮಾಜದ ಮುನ್ನಡೆ", past: "ಭಾವನಾತ್ಮಕ ಪೋಷಣೆ, ಮಾತೃ ಪ್ರೇಮ ಮತ್ತು ಕುಟುಂಬ ನಿಷ್ಠೆ", debt: "ಭಾವನಾತ್ಮಕ ಅಳುಕು ಬಿಟ್ಟು ದೃಢ ಕರ್ಮಯೋಗಿಯಾಗಿ ಬೆಳೆಯುವುದು" }
  ];

  const selected = axisPairs[sunRashiIdx % 4] || axisPairs[0]!;

  return {
    rahuKetuAxis: selected.axis,
    soulPurpose: isKn ? selected.purpose : "Architecting principled impact and establishing timeless equilibrium in this lifetime.",
    pastLifeGifts: isKn ? selected.past : "Inherited intuitive wisdom, courageous leadership and profound discernment from ancestral roots.",
    karmicLesson: isKn ? selected.debt : "Transcending material anxieties and anchoring in self-reliant dharma.",
    ancestralClearingRemedy: isKn
      ? "ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ / ಅನ್ನದಾನ ಹಾಗೂ ತಿಂಗಳಿಗೊಮ್ಮೆ ತ್ರಯೋದಶಿ ಪ್ರದೋಷ ಪೂಜೆ ಸರ್ವ ಕರ್ಮ ನಿವಾರಕ."
      : "Offer Go-Seva and Anna-Dana at Gokarna Kshetra on Pradosha or Amavasya to dissolve deep karmic knots."
  };
}

export function computeDecadeMilestones(dob: string, ruling: number, isKn: boolean): DecadeMilestone[] {
  const startYear = parseInt(dob.split("-")[0] || "1990", 10) || 1990;
  const milestones: DecadeMilestone[] = [];

  const phases = [
    { name: isKn ? "ಬುಧ-ಸೂರ್ಯ ಯುಗ (ವಿದ್ಯಾಭ್ಯಾಸ & ಪ್ರಕೃತಿ ನಿರ್ಮಾಣ)" : "Mercury-Sun Phase (Foundation & Education)", theme: isKn ? "ಆರಂಭಿಕ ಕಲಿಕೆ, ಜ್ಞಾನಾರ್ಜನೆ, ಶಿಸ್ತು ಮತ್ತು ಸಂಸ್ಕಾರ ಸ್ಥಾಪನೆ." : "Formative learning, values foundation, and mental agility." },
    { name: isKn ? "ಕುಜ-ಶುಕ್ರ ಯುಗ (ವೃತ್ತಿ ನಾವೀನ್ಯತೆ & ಸಾಹಸ)" : "Mars-Venus Phase (Ambition & Exploration)", theme: isKn ? "ವೃತ್ತಿ ಆರಂಭ, ಮಹತ್ವಾಕಾಂಕ್ಷೆ, ಹೊಸ ಕ್ಷೇತ್ರಗಳ ಅನ್ವೇಷಣೆ ಮತ್ತು ಸಾಧನೆ." : "Career launch, adventurous expansion, and skill mastery." },
    { name: isKn ? "ಗುರು-ರವಿ ಯುಗ (ಉನ್ನತ ಯಶಸ್ಸು & ಅಧಿಕಾರ ಸ್ಥಾಪನೆ)" : "Jupiter-Sun Epoch (Prime Authority & Wealth)", theme: isKn ? "ವೃತ್ತಿ ಉತ್ತುಂಗ, ಸಂಪತ್ತು ನಿರ್ಮಾಣ, ಕುಟುಂಬ ವಿಸ್ತರಣೆ ಮತ್ತು ಸಾಮಾಜಿಕ ಗೌರವ." : "Peak professional leadership, family prosperity and authority." },
    { name: isKn ? "ಶನಿ-ಬುಧ ಯುಗ (ಸ್ಥಿರತೆ & ಸಾಮ್ರಾಜ್ಯ ವಿಸ್ತರಣೆ)" : "Saturn-Mercury Era (Consolidation & Scale)", theme: isKn ? "ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ, ಸ್ಥಿರ ವ್ಯವಸ್ಥೆಗಳ ನಿರ್ಮಾಣ ಹಾಗೂ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಮಾರ್ಗದರ್ಶನ." : "Financial consolidation, building enduring systems, and mentorship." },
    { name: isKn ? "ಕೇತು-ಗುರು ಯುಗ (ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು & ಕೀರ್ತಿ)" : "Ketu-Jupiter Apex (Wisdom & Legacy)", theme: isKn ? "ಆಂತರಿಕ ಶಾಂತಿ, ಸಮಾಜ ಕಲ್ಯಾಣ, ತತ್ವಜ್ಞಾನ ಮತ್ತು ಅಮರ ಕೀರ್ತಿ." : "Spiritual transcendence, philanthropy, and lasting legacy." }
  ];

  for (let i = 0; i < 5; i++) {
    const ageStart = i * 15;
    const ageEnd = (i + 1) * 15;
    const yStart = startYear + ageStart;
    const yEnd = startYear + ageEnd;
    const phase = phases[i] || phases[0]!;
    const vitality = Math.min(96, 78 + ((ruling + i * 3) % 18));

    milestones.push({
      ageRange: `${ageStart} - ${ageEnd} ${isKn ? "ವರ್ಷ" : "Yrs"}`,
      years: `${yStart} - ${yEnd}`,
      rulingPhase: phase.name,
      theme: phase.theme,
      vitalityScore: vitality,
      keyGuidance: isKn
        ? `ಈ ಕಾಲಾವಧಿಯಲ್ಲಿ ${vitality}% ದೈವಬಲವಿದ್ದು, ಸತ್ಕರ್ಮದಿಂದ ಮಹತ್ತರ ಯಶಸ್ಸು ನಿಶ್ಚಿತ.`
        : `Carries a stellar ${vitality}% vitality index with monumental acceleration when aligned with disciplined focus.`
    });
  }

  return milestones;
}

export function computeModernWorldAlignment(
  input: KaalaDiksuchiInput,
  samudrika: SamudrikaProfile,
  rulingNum: number,
  sunRashiIdx: number
): ModernWorldAlignment {
  const isKn = input.lang === "kn";
  const resonance = Math.min(96, Math.max(74, 76 + (rulingNum % 5) * 4 + (samudrika.elementalComposition.fire > 25 ? 5 : 2)));

  const rashiSignStrategies: Record<number, { title: string; strat: string; wellness: string }> = {
    0: { title: "ಮೇಷ (Aries)", strat: isKn ? "ಧೈರ್ಯಶಾಲಿ ನಾಯಕತ್ವ, ಹೊಸ ಯೋಜನೆಗಳನ್ನು ಸ್ವತಃ ಮುನ್ನಡೆಸುವುದು ಹಾಗೂ ತ್ವರಿತ ಅನುಷ್ಠಾನ." : "Pioneering leadership, bold project ownership, and rapid decisive execution.", wellness: isKn ? "ಹೆಡ್ ಮಸಾಜ್, ನೈಸರ್ಗಿಕ ಸೂರ್ಯ ಪ್ರಕಾಶ ಹಾಗೂ ನಿಯಮಿತ ದೈಹಿಕ ವ್ಯಾಯಾಮ." : "Head massage, natural morning solar exposure, and vigorous daily fitness." },
    1: { title: "ವೃಷಭ (Taurus)", strat: isKn ? "ಸ್ಥಿರ ಸಂಪನ್ಮೂಲ ನಿರ್ಮಾಣ, ವ್ಯವಸ್ಥಿತ ಹೂಡಿಕೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಮೌಲ್ಯ ಸೃಷ್ಟಿ." : "Tangible value creation, systematic wealth compounding, and patient persistence.", wellness: isKn ? "ಕಂಠದ ಕಾಳಜಿ, ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಹಸಿರು ಪ್ರಕೃತಿಯಲ್ಲಿ ವಾಕಿಂಗ್." : "Vocal tract care, pure sattvic diet, and restorative walks in lush nature." },
    2: { title: "ಮಿಥುನ (Gemini)", strat: isKn ? "ಚುರುಕಾದ ಸಂವಹನ, ನೆಟ್‌ವರ್ಕಿಂಗ್, ಮಾಧ್ಯಮ ಹಾಗೂ ಬಹುಮುಖಿ ಜ್ಞಾನ ಕೌಶಲ್ಯ." : "Dynamic networking, omni-channel media, and agile multi-domain mastery.", wellness: isKn ? "ದೈನಂದಿನ ಪ್ರಾಣಾಯಾಮ, ಮಾಹಿತಿ ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸಕಾಲಿಕ ನಿದ್ರೆ." : "Daily alternate nostril pranayama, digital quiet hours, and regular rest." },
    3: { title: "ಕರ್ಕಾಟಕ (Cancer)", strat: isKn ? "ಮಾನವೀಯ ಸಹಾನುಭೂತಿ, ಸಂಸ್ಥೆಯ ಆಂತರಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ವಿಶ್ವಾಸಾರ್ಹ ತಂಡ ನಿರ್ಮಾಣ." : "Empathetic leadership, institutional care, and high-trust team architecture.", wellness: isKn ? "ಜಲ ತತ್ವದ ಸಮತೋಲನ, ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯುವುದು ಹಾಗೂ ಶೀತಲ ಧ್ಯಾನ." : "Hydration equilibrium, peaceful reflection, and emotional grounding." },
    4: { title: "ಸಿಂಹ (Leo)", strat: isKn ? "ಉನ್ನತ ಮಟ್ಟದ ಅಧಿಕಾರ, ಬ್ರಾಂಡಿಂಗ್, ನಿರ್ದೇಶನ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ನಾಯಕತ್ವ." : "Executive commanding presence, luxury branding, and respected mentorship.", wellness: isKn ? "ಹೃದಯದ ಆರೋಗ್ಯ ರಕ್ಷಣೆ, ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಮುಂಜಾನೆಯ ಧ್ಯಾನ." : "Cardiovascular vitality, dynamic Surya Namaskar, and morning contemplation." },
    5: { title: "ಕನ್ಯಾ (Virgo)", strat: isKn ? "ನಿಖರ ವಿಶ್ಲೇಷಣೆ, ಗುಣಮಟ್ಟ ನಿಯಂತ್ರಣ, ದೋಷರಹಿತ ಕಾರ್ಯಯೋಜನೆ ಹಾಗೂ ಸಂಶೋಧನೆ." : "Meticulous analytics, precision quality assurance, and flawless operations.", wellness: isKn ? "ಜೀರ್ಣಾಂಗ ಆರೋಗ್ಯ, ಹಸಿರು ತರಕಾರಿ ಸೇವನೆ ಹಾಗೂ ಅಧಿಕ ಚಿಂತೆ ದೂರವಿಡುವುದು." : "Digestive health optimization, green leafy diet, and releasing overthinking." },
    6: { title: "ತುಲಾ (Libra)", strat: isKn ? "ರಾಜತಾಂತ್ರಿಕ ಮಾತುಕತೆ, ಸಮತೋಲಿತ ಪಾಲುದಾರಿಕೆ ಹಾಗೂ ಸೌಂದರ್ಯಾತ್ಮಕ ವಿನ್ಯಾಸ." : "Diplomatic negotiations, win-win commercial alliances, and aesthetic design.", wellness: isKn ? "ಕಿಡ್ನಿ ಆರೋಗ್ಯ, ಸಮತೋಲಿತ ನಡಿಗೆ ಹಾಗೂ ಶಾಂತಿಯುತ ಸಂಗೀತ ಶ್ರವಣ." : "Renal equilibrium, mindful balance, and uplifting classical music." },
    7: { title: "ವೃಶ್ಚಿಕ (Scorpio)", strat: isKn ? "ಗೂಢ ಸಂಶೋಧನೆ, ಬಿಕ್ಕಟ್ಟು ನಿರ್ವಹಣೆ, ಗಂಭೀರ ರಣತಂತ್ರ ಹಾಗೂ ಪುನರುತ್ಥಾನ." : "Deep forensic research, crisis governance, strategic secrecy, and rebirth.", wellness: isKn ? "ಅಂತರಂಗದ ಶುದ್ಧಿ, ಉಪವಾಸ ಹಾಗೂ ಅತಿಯಾದ ಒತ್ತಡವನ್ನು ನಿಯಂತ್ರಿಸುವುದು." : "Internal cellular cleansing, periodic fasting, and release of emotional tension." },
    8: { title: "ಧನು (Sagittarius)", strat: isKn ? "ದೂರದೃಷ್ಟಿ, ಜಾಗತಿಕ ವಿಸ್ತರಣೆ, ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಉನ್ನತ ತತ್ವಜ್ಞಾನ." : "Strategic foresight, global institutional expansion, and ethical philosophy.", wellness: isKn ? "ಲಿವರ್ ಆರೋಗ್ಯ, ಹೊರಾಂಗಣ ಕ್ರೀಡೆ ಹಾಗೂ ದೀರ್ಘ ನಡಿಗೆ." : "Hepatic wellness, expansive outdoor activity, and continuous learning." },
    9: { title: "ಮಕರ (Capricorn)", strat: isKn ? "ಅಚಲ ಶಿಸ್ತು, ದೊಡ್ಡ ಸಾಮ್ರಾಜ್ಯಗಳ ನಿರ್ಮಾಣ, ನಿಯಮಿತ ಪರಿಶ್ರಮ ಹಾಗೂ ಕಾರ್ಯಕ್ಷಮತೆ." : "Uncompromising discipline, building enduring enterprises, and long-term stamina.", wellness: isKn ? "ಮೂಳೆ ಮತ್ತು ಕೀಲುಗಳ ಬಲವರ್ಧನೆ, ಎಣ್ಣೆ ಅಭ್ಯಂಜನ ಹಾಗೂ ಶನಿ ಸ್ತೋತ್ರ." : "Skeletal and joint fortification, warm oil massage, and steady routine." },
    10: { title: "ಕುಂಭ (Aquarius)", strat: isKn ? "ಭವಿಷ್ಯದ ನಾವೀನ್ಯತೆ, ಸಮಾಜ ಕಲ್ಯಾಣ, ಸಮುದಾಯ ಸಂಘಟನೆ ಹಾಗೂ ಕ್ರಾಂತಿಕಾರಿ ಕಲ್ಪನೆ." : "Futuristic innovation, humanitarian scaling, and progressive ecosystem design.", wellness: isKn ? "ರಕ್ತ ಪರಿಚಲನೆ, ನರಮಂಡಲದ ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಸೂರ್ಯೋದಯ ನಡಿಗೆ." : "Circulatory optimization, nervous system soothing, and dawn walking." },
    11: { title: "ಮೀನ (Pisces)", strat: isKn ? "ಅಂತಃಪ್ರೇರಣೆ, ಕಲ್ಪನಾ ಶಕ್ತಿ, ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ ಹಾಗೂ ಸೃಜನಶೀಲ ಸೌಂದರ್ಯ." : "Intuitive prophecy, artistic mastery, spiritual counseling, and boundless vision.", wellness: isKn ? "ಪಾದಗಳ ಮಸಾಜ್, ನೇತ್ರ ರಕ್ಷಣೆ ಹಾಗೂ ತಾಮ್ರಗೌರಿ ಅಮ್ಮನವರ ಆರಾಧನೆ." : "Foot reflexology, eye relaxation, and Goddess Tamragauri devotion." }
  };

  const currentStrat = rashiSignStrategies[sunRashiIdx % 12] || rashiSignStrategies[0]!;

  const standing = isKn
    ? `ನಿಮ್ಮ ಜನ್ಮ ತತ್ವವು (${currentStrat.title}, ${samudrika.dominantPlanet} ಪ್ರಭಾವಿತ) ಇಂದಿನ ಸ್ಪರ್ಧಾತ್ಮಕ ಕಾಲದಲ್ಲಿ ${resonance}% ಶ್ರೇಷ್ಠ ಹೊಂದಾಣಿಕೆಯನ್ನು ಹೊಂದಿದೆ. ವಿವೇಚನೆಯಿಂದ ಹೆಜ್ಜೆಯಿಟ್ಟರೆ ಯಶಸ್ಸು ಸಿದ್ಧ.`
    : `Your innate profile (${currentStrat.title}, governed by ${samudrika.dominantPlanet}) carries a stellar ${resonance}% natural strategic resonance in today's competitive landscape.`;

  const globalTrend = isKn
    ? "ಪ್ರಸ್ತುತ ಕಾಲಮಾನವು ಕೇವಲ ಯಾಂತ್ರಿಕ ಶ್ರಮಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ಸತ್ಯ, ಧರ್ಮ, ಆಂತರಿಕ ಶಾಂತಿ, ಸ್ಪಷ್ಟ ದೂರದೃಷ್ಟಿ ಮತ್ತು ನೈತಿಕ ನಾಯಕತ್ವಕ್ಕೆ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ ನೀಡುತ್ತಿದೆ."
    : "The current global era increasingly rewards authentic human discernment, moral clarity, inner tranquility, and visionary stewardship over mere robotic routine.";

  const vulnerabilities = isKn
    ? [
        "ಅನಗತ್ಯ ಮಾನಸಿಕ ಆತಂಕ ಹಾಗೂ ಆತುರದ ತೀರ್ಮಾನಗಳಿಂದ ಶಕ್ತಿ ವ್ಯರ್ಥ.",
        "ದೈನಂದಿನ ಶಿಸ್ತು ಹಾಗೂ ನಿದ್ರೆಯ ಸಮಯದಲ್ಲಿ ಏರುಪೇರಾಗುವ ಸಾಧ್ಯತೆ.",
        "ಸಂಬಂಧಗಳಲ್ಲಿ ಅತಿ ನಿರೀಕ್ಷೆ ಅಥವಾ ಅತಿಯಾದ ಸಂಶಯ ಪ್ರವೃತ್ತಿ."
      ]
    : [
        "Energy dissipation from overthinking and impulsive decision-making.",
        "Erratic sleep cycles and fragmented daily discipline.",
        "Unrealistic expectations in professional and personal partnerships."
      ];

  const opportunities = isKn
    ? [
        "ನಿಮ್ಮ ಸ್ವಾಭಾವಿಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಕೇಂದ್ರೀಕರಿಸಿ ಉನ್ನತ ಮೌಲ್ಯ ಸೃಷ್ಟಿಸುವುದು.",
        "ಪ್ರಾಮಾಣಿಕ ಸಂಪರ್ಕ ಜಾಲ ಹಾಗೂ ನೈತಿಕ ನಾಯಕತ್ವದಿಂದ ಜನಪ್ರಿಯತೆ ಗಳಿಸುವುದು.",
        "ದೈನಂದಿನ ದೈವಿಕ ಸಂಕಲ್ಪ ಮತ್ತು ಯೋಗಾಭ್ಯಾಸದಿಂದ ಮಾನಸಿಕ ಸ್ಪಷ್ಟತೆಯಲ್ಲಿ ಮುನ್ನಡೆ."
      ]
    : [
        "Monopolizing domain excellence through focused depth and disciplined mastery.",
        "Cultivating high-trust alliances and authoritative community leadership.",
        "Leveraging daily Vedic mindfulness as an unassailable strategic advantage."
      ];

  const habits = isKn
    ? [
        "ಮುಂಜಾನೆ ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದಲ್ಲಿ ೧೦ ನಿಮಿಷ ಇಷ್ಟದೇವತಾ ಜಪ & ಸೂರ್ಯ ನಮಸ್ಕಾರ.",
        "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಮುಖ್ಯ ೩ ಕಾರ್ಯಗಳನ್ನು ಮಾತ್ರ ಗುರುತಿಸಿ ಪೂರ್ಣಗೊಳಿಸುವ ಸಂಕಲ್ಪ.",
        "ರಾತ್ರಿ ಮಲಗುವ ೪೫ ನಿಮಿಷ ಮುಂಚೆ ಶಾಂತ ಪರಿಸರ ನಿರ್ಮಿಸಿ ದಿನದ ಅವಲೋಕನ.",
        "ವಾರಕ್ಕೊಮ್ಮೆ ಗೋಸೇವೆ, ದೇವಸ್ಥಾನ ಸಂದರ್ಶನ ಅಥವಾ ಬಡವರಿಗೆ ಅನ್ನದಾನ."
      ]
    : [
        "10 minutes of dawn prayer, Gayatri chanting, and Surya Namaskar.",
        "Daily 3-Priority Rule: Laser focus on executing 3 vital goals before midday.",
        "Unwinding in peaceful stillness 45 minutes prior to sleep.",
        "Weekly Go-Seva, temple visit, or charitable food distribution."
      ];

  return {
    currentGlobalTrend: globalTrend,
    userResonanceScore: resonance,
    userStandingInModernEra: standing,
    keyVulnerabilities: vulnerabilities,
    growthOpportunities: opportunities,
    careerAndTechStrategy: currentStrat.strat,
    digitalAndMentalWellness: currentStrat.wellness,
    relationshipAndSocialGuidance: isKn
      ? "ಸಂಬಂಧಗಳಲ್ಲಿ ಗೌರವ, ನೇರ ಸಂಭಾಷಣೆ ಮತ್ತು ಪರಸ್ಪರ ಸಹನೆ ಶಾಶ್ವತ ಸುಖದ ಗುಟ್ಟು."
      : "Foster deep presence, mutual respect, and patient listening in all core relationships.",
    actionableHabitsForToday: habits
  };
}

export function computePrashnaOracle(input: KaalaDiksuchiInput): PrashnaOracleResult {
  const now = new Date();
  const coords = siderealLongitudes(now, "lahiri");
  const lagnaRashiIdx = Math.floor(coords.sun / 30);
  const nakIdx = Math.floor(coords.moon / (360 / 27));

  const isKn = input.lang === "kn";
  const rashiName = isKn ? RASHI_NAMES_KN[lagnaRashiIdx] : RASHI_NAMES_EN[lagnaRashiIdx];
  const nakName = isKn ? NAKSHATRA_NAMES_KN[nakIdx] : NAKSHATRA_NAMES_EN[nakIdx];

  const answer = isKn
    ? `ಪ್ರಸ್ತುತ ಬ್ರಹ್ಮಾಂಡದ ಲಗ್ನವು (${rashiName}) ಮತ್ತು ಚಂದ್ರ ನಕ್ಷತ್ರ (${nakName}) ಅತ್ಯಂತ ಶುಭಸೂಚಕವಾಗಿವೆ. ನೀವು ಕೈಗೊಳ್ಳಲುದ್ದೇಶಿಸಿದ ಸಂಕಲ್ಪದಲ್ಲಿ ದೈವಿಕ ಅನುಗ್ರಹವಿದ್ದು, ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮದಿಂದ ಯಶಸ್ಸು ನಿಶ್ಚಿತ.`
    : `The instantaneous cosmic horizon (${rashiName} Lagna, ${nakName} Moon) indicates strong planetary support. Your intended objective is blessed with favorable momentum.`;

  const timeline = isKn
    ? "ಮುಂದಿನ ೨೧ ರಿಂದ ೪೫ ದಿನಗಳಲ್ಲಿ ಮಹತ್ತರ ಸಕಾರಾತ್ಮಕ ತಿರುವು ಗೋಚರಿಸಲಿದೆ."
    : "A pivotal positive breakthrough is indicated within the next 21 to 45 days.";

  return {
    prashnaLagna: rashiName || "ಮೇಷ",
    prashnaNakshatra: nakName || "ಅಶ್ವಿನಿ",
    cosmicMomentQuality: "Shubha",
    directAnswer: answer,
    timelineEstimate: timeline
  };
}

export function computeRemedialPrescription(input: KaalaDiksuchiInput, samudrika: SamudrikaProfile): RemedialPrescription {
  const isKn = input.lang === "kn";

  return {
    dailyStotra: isKn
      ? "॥ ಶ್ರೀ ಸೂರ್ಯ ಅಷ್ಟಕಂ ಅಥವಾ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪಂಚಾಕ್ಷರೀ ಸ್ತೋತ್ರ ॥"
      : "|| Sri Surya Ashtakam or Sri Mahabaleshwara Shiva Panchakshara Stotram ||",
    luckyColors: isKn ? ["ಕೇಸರಿ (Saffron)", "ಬಂಗಾರದ ಹಳದಿ (Golden Yellow)", "ಶುಭ್ರ ಬಿಳಿ (Pure White)"] : ["Royal Saffron", "Golden Amber", "Pristine White"],
    luckyDays: isKn ? ["ಗುರುವಾರ", "ಭಾನುವಾರ", "ಸೋಮವಾರ"] : ["Thursday", "Sunday", "Monday"],
    luckyNumbers: [1, 3, 5, 9],
    gemstoneRecommendation: isKn
      ? "ಮಾಣಿಕ್ಯ (Ruby) ಅಥವಾ ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire) ಅಥವಾ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಅತ್ಯುತ್ತಮ."
      : "5-Mukhi Sacred Rudraksha or Natural Yellow Sapphire / Ruby.",
    sacredGokarnaRemedy: isKn
      ? "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಆತ್ಮಲಿಂಗ ಪೂಜೆ, ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಗೋಸೇವೆ ಸರ್ವ ದೋಷ ನಿವಾರಕ."
      : "Offer Bilva Patra Archana at Gokarna Atmalinga & feed Go-Mata with jaggery and fresh grass.",
    priestCounselingTip: isKn
      ? "ಯಾವುದೇ ಹೊಸ ಮಹತ್ಕಾರ್ಯ ಪ್ರಾರಂಭಿಸುವ ಮುನ್ನ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರೊಂದಿಗೆ ಮುಹೂರ್ತ ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ."
      : "Seek personalized Sankalpa guidance from Gokarna Chief Priest Shreeram Pandit before critical life milestones."
  };
}

export async function executeKaalaDiksuchiCalculation(
  input: KaalaDiksuchiInput,
  geminiApiKey?: string
): Promise<KaalaDiksuchiResult> {
  const parts = input.dob.split("-").map(Number);
  const y = parts[0] || 2000;
  const m = (parts[1] || 1) - 1;
  const d = parts[2] || 1;

  const noonUtc = new Date(Date.UTC(y, m, d, 12, 0, 0));
  const weekdayIdx = noonUtc.getUTCDay();
  const weekdayName = WEEKDAY_NAMES_L5[weekdayIdx]?.[input.lang] || WEEKDAY_NAMES_L5[weekdayIdx]?.kn || "ಭಾನುವಾರ";

  const coords = siderealLongitudes(noonUtc, "lahiri");
  const sunRashiIdx = Math.floor(coords.sun / 30);
  const moonRashiIdx = Math.floor(coords.moon / 30);
  const moonNakIdx = Math.floor(coords.moon / (360 / 27));

  const isKn = input.lang === "kn";
  const suryaRashiStr = isKn ? RASHI_NAMES_KN[sunRashiIdx] : RASHI_NAMES_EN[sunRashiIdx];
  const chandraRashiStr = isKn ? `${RASHI_NAMES_KN[moonRashiIdx]} (ಅಂದಾಜು ಚಂದ್ರ ರಾಶಿ)` : `${RASHI_NAMES_EN[moonRashiIdx]} (Estimated Moon Sign)`;
  const nakshatraRangeStr = isKn
    ? `${NAKSHATRA_NAMES_KN[moonNakIdx]} ಅಥವಾ ಸಮೀಪದ ನಕ್ಷತ್ರ`
    : `${NAKSHATRA_NAMES_EN[moonNakIdx]} or adjacent Nakshatra`;

  const num = calculateNumerologyNumbers(input.dob, input.personName);
  const samudrika = computeSamudrikaProfile(input, num.ruling);
  const sankhya = computeDeepSankhyaAnalysis(input, num.ruling, num.destiny, num.soulUrge, num.namank);
  const modernWorld = computeModernWorldAlignment(input, samudrika, num.ruling, sunRashiIdx);
  const liveTransit = computeLiveTransitEnergy(input, num.ruling);
  const karmicMission = computeKarmicSoulMission(input, sunRashiIdx);
  const decadeMilestones = computeDecadeMilestones(input.dob, num.ruling, isKn);
  const prashnaOracle = computePrashnaOracle(input);
  const remedies = computeRemedialPrescription(input, samudrika);
  const diksuchi = computeDiksuchiCompassMatrix(input, num.ruling, num.destiny, sunRashiIdx);

  const planetSummaries: PlanetaryPositionSummary[] = [
    { name: "Sun (ಸೂರ್ಯ)", rashi: suryaRashiStr || "ಮೇಷ", degree: coords.sun % 30, houseFromSun: 1, dignity: evaluateDignity("Sun", sunRashiIdx), significance: "ಆತ್ಮಕಾರಕ & ಪ್ರಾಣಶಕ್ತಿ" },
    { name: "Moon (ಚಂದ್ರ)", rashi: chandraRashiStr || "ವೃಷಭ", degree: coords.moon % 30, houseFromSun: Math.floor((coords.moon - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Moon", moonRashiIdx), significance: "ಮನಃಕಾರಕ & ಭಾವನಾತ್ಮಕ ಸ್ಥೈರ್ಯ" },
    { name: "Mars (ಮಂಗಳ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.mars / 30)]! : RASHI_NAMES_EN[Math.floor(coords.mars / 30)]!, degree: coords.mars % 30, houseFromSun: Math.floor((coords.mars - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Mars", Math.floor(coords.mars / 30)), significance: "ಪರಾಕ್ರಮ & ಧೈರ್ಯ" },
    { name: "Mercury (ಬುಧ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.mercury / 30)]! : RASHI_NAMES_EN[Math.floor(coords.mercury / 30)]!, degree: coords.mercury % 30, houseFromSun: Math.floor((coords.mercury - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Mercury", Math.floor(coords.mercury / 30)), significance: "ಬುದ್ಧಿ & ವ್ಯಾಪಾರ ಕೌಶಲ್ಯ" },
    { name: "Jupiter (ಗುರು)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.jupiter / 30)]! : RASHI_NAMES_EN[Math.floor(coords.jupiter / 30)]!, degree: coords.jupiter % 30, houseFromSun: Math.floor((coords.jupiter - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Jupiter", Math.floor(coords.jupiter / 30)), significance: "ಜ್ಞಾನ, ಭಾಗ್ಯ & ಸಂತಾನ" },
    { name: "Venus (ಶುಕ್ರ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.venus / 30)]! : RASHI_NAMES_EN[Math.floor(coords.venus / 30)]!, degree: coords.venus % 30, houseFromSun: Math.floor((coords.venus - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Venus", Math.floor(coords.venus / 30)), significance: "ಸೌಂದರ್ಯ, ಕಲೆ & ಸಂಪತ್ತು" },
    { name: "Saturn (ಶನಿ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.saturn / 30)]! : RASHI_NAMES_EN[Math.floor(coords.saturn / 30)]!, degree: coords.saturn % 30, houseFromSun: Math.floor((coords.saturn - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Saturn", Math.floor(coords.saturn / 30)), significance: "ಕರ್ಮ, ಶಿಸ್ತು & ದೀರ್ಘಾಯುಷ್ಯ" }
  ];

  let aiNarrative: string | undefined = undefined;

  const buildDeterministicNarrative = () => {
    if (isKn) {
      return `ಶ್ರೀಯುತ ${input.personName} ರವರಿಗೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಿಂದ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ಆಶೀರ್ವಾದಗಳು.

೧. ಜಾತಕ & ಸಂಖ್ಯಾ ತತ್ವ ವಿಶ್ಲೇಷಣೆ:
ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕ (${input.dob}, ${weekdayName}) ದಂತೆ ನಿಮ್ಮ ಸೂರ್ಯ ರಾಶಿಯು ${suryaRashiStr} ಆಗಿದ್ದು, ಮೂಲಾಂಕ ${num.ruling} (${sankhya.mulankLord}) ಮತ್ತು ಭಾಗ್ಯಾಂಕ ${num.destiny} ಆಗಿದೆ. ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ${samudrika.personalityArchetype} ತತ್ವವು ಪ್ರಧಾನವಾಗಿದ್ದು, ${samudrika.hiddenSuperpower} ನಿಮ್ಮ ಅಂತರ್ಗತ ಶಕ್ತಿಯಾಗಿದೆ.

೨. ದಿಕ್ಸೂಚಿ & ಕಾಲ ಮುಹೂರ್ತ ಮಾರ್ಗದರ್ಶನ:
ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ಜೀವನದ ಮುನ್ನಡೆಗೆ ${diksuchi.careerDirection.directionName} ಅತ್ಯಂತ ಮಂಗಳಕರವಾಗಿದೆ (${diksuchi.careerDirection.practicalAdvice}). ಆರ್ಥಿಕ ಸಂಪತ್ತಿನ ವೃದ್ಧಿಗೆ ${diksuchi.wealthDirection.directionName} ಶುಭಕರ. ಇಂದಿನ ದಿನದ ದಿಕ್ಶೂಲವು ${diksuchi.dailyDishaShoola.afflictedDirection} ಯಲ್ಲಿದ್ದು, ${diksuchi.dailyDishaShoola.classicalRemedy}. ನಿಮ್ಮ ದೈನಂದಿನ ಅತ್ಯುನ್ನತ ಶುಭ ಕಾಲಾವಧಿ ${diksuchi.timingRhythm.peakPranaWindow} ಆಗಿದೆ.

೩. ಜೀವನಾಭ್ಯುದಯ & ಪರಿಹಾರ:
ನಿಮ್ಮ ಆಯ್ದ ಗುರಿ (${input.primaryFocus || "ವೃತ್ತಿ & ಜೀವನ"}) ಸಾಧನೆಗಾಗಿ ${sankhya.wealthAttractionSecret}. ನಿತ್ಯವೂ ${remedies.dailyStotra} ಪಠಿಸಿ, ${remedies.sacredGokarnaRemedy}. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳು ಈಡೇರಲಿ.`;
    }

    return `Divine Kaala Diksuchi Blessings for ${input.personName} from Sri Shreeram Pandit, Gokarna Kshetra.

1. Astrological & Numerological Blueprint:
Based on your birth date (${input.dob}, ${weekdayName}), your Sun Sign rises in ${suryaRashiStr}, energized by Ruling Number ${num.ruling} and Destiny Number ${num.destiny}. Your primary archetype reflects ${samudrika.personalityArchetype}, anchored by ${samudrika.hiddenSuperpower}.

2. Directional Compass & Timing Rhythm:
For optimal professional and executive breakthrough, your most auspicious direction is ${diksuchi.careerDirection.directionName} (${diksuchi.careerDirection.practicalAdvice}). For wealth and prosperity, align with ${diksuchi.wealthDirection.directionName}. Today's Disha Shoola rests in ${diksuchi.dailyDishaShoola.afflictedDirection} (${diksuchi.dailyDishaShoola.classicalRemedy}). Your peak productive window is ${diksuchi.timingRhythm.peakPranaWindow}.

3. Strategic Fulfillment & Sacred Remedies:
For your primary life focus (${input.primaryFocus || "Career & Life Strategy"}), ${sankhya.wealthAttractionSecret}. Recite ${remedies.dailyStotra} daily and perform ${remedies.sacredGokarnaRemedy}. May Lord Mahabaleshwara bless your life journey with victory and peace.`;
  };

  const activeKey = (geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (activeKey) {
    try {
      const summaryContext = `
================================================================
🕉️ BAGGONA KAALA DIKSUCHI ASTROLOGICAL & COMPASS SUMMARY
================================================================
1. Devotee: ${input.personName} (Gender: ${input.gender || "Not specified"})
2. Date of Birth: ${input.dob} (${weekdayName})
3. Place / Pincode: ${input.placeLabel || input.pincode || "Gokarna Kshetra"}
4. Sun Sign (Surya Rashi): ${suryaRashiStr}
5. Estimated Moon Sign: ${chandraRashiStr} (Nakshatra: ${nakshatraRangeStr})
6. Ruling Number: ${num.ruling} (Lord: ${sankhya.mulankLord})
7. Destiny Number: ${num.destiny} (Lord: ${sankhya.bhagyankLord})
8. Namank: ${num.namank}, Soul Urge: ${num.soulUrge}
9. Career Direction: ${diksuchi.careerDirection.directionName} (${diksuchi.careerDirection.practicalAdvice})
10. Wealth Direction: ${diksuchi.wealthDirection.directionName}
11. Health Direction: ${diksuchi.healthMeditationDirection.directionName}
12. Daily Disha Shoola: ${diksuchi.dailyDishaShoola.afflictedDirection} (${diksuchi.dailyDishaShoola.classicalRemedy})
13. Peak Timing Window: ${diksuchi.timingRhythm.peakPranaWindow}
14. Rahu Kaala: ${diksuchi.timingRhythm.rahuKaal}, Abhijit: ${diksuchi.timingRhythm.abhijitMuhurtha}
15. Samudrika Archetype: ${samudrika.personalityArchetype}
16. Primary Life Focus: ${input.primaryFocus || "Career & Life Navigation"}
17. Devotee's Custom Question: "${input.customQuestion || "None specified"}"
================================================================
`;

      const prompt = `You are Sri Shreeram Pandit, Chief Priest and Vedic Astrologer from Gokarna Mahabaleshwara Kshetra.
The devotee seeks their comprehensive Kaala Diksuchi (Time & Directional Compass) reading.

CRITICAL GUIDELINES:
1. Address the devotee respectfully by their name (${input.personName}).
2. State their exact astrological coordinates: Date of Birth, Day of Week, Sun Sign, Ruling Number, Destiny Number, and Place.
3. Deliver clear, actionable Directional Compass (ದಿಕ್ಸೂಚಿ) advice: explain which compass direction to face for career, which direction for wealth, and explain today's Disha Shoola & timings.
4. If the devotee has asked a specific question ("${input.customQuestion || ""}"), ANSWER IT CLEARLY AND DIRECTLY.
5. Provide sacred Gokarna Mahabaleshwara remedies, mantras, and blessings.
6. Write in a warm, dignified, royal, compassionate priestly tone. DO NOT use repetitive generic tech buzzwords.
7. Structure the guidance in 3 to 4 distinct, rich paragraphs in ${input.lang === "kn" ? "Kannada language" : input.lang === "hi" ? "Hindi" : input.lang === "te" ? "Telugu" : input.lang === "ta" ? "Tamil" : "English"}.`;

      const aiResponse = await askGemini(summaryContext, prompt, activeKey, input.lang, {
        temperature: 0.3
      });

      if (aiResponse) {
        aiNarrative = aiResponse;
      } else {
        aiNarrative = buildDeterministicNarrative();
      }
    } catch {
      aiNarrative = buildDeterministicNarrative();
    }
  } else {
    aiNarrative = buildDeterministicNarrative();
  }

  return {
    input,
    calculatedAt: new Date().toISOString(),
    birthDayOfWeek: weekdayName,
    suryaRashi: suryaRashiStr || "ಮೇಷ",
    chandraRashiEstimate: chandraRashiStr || "ವೃಷಭ",
    nakshatraRange: nakshatraRangeStr || "ಅಶ್ವಿನಿ",
    rulingNumber: num.ruling,
    destinyNumber: num.destiny,
    soulUrgeNumber: num.soulUrge,
    planets: planetSummaries,
    diksuchi,
    modernWorld,
    samudrika,
    sankhya,
    liveTransit,
    karmicMission,
    decadeMilestones,
    prashnaOracle,
    remedies,
    aiNarrative
  };
}
