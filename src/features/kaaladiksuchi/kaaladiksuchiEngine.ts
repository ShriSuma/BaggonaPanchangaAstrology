import { siderealLongitudes } from "../../core/EphemerisEngine";
import { askGemini } from "../../core/GeminiEngine";
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
  SankhyaDeepAnalysis
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
  let val = num;
  while (val > 9) {
    val = val.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return val;
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
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "");

  for (const ch of cleanName) {
    const val = ((ch.charCodeAt(0) - 64) % 9) || 9;
    totalNameSum += val;
    if (vowels.includes(ch)) {
      vowelSum += val;
    }
  }

  const soulUrge = reduceToSingleDigit(vowelSum || 5);
  const namank = reduceToSingleDigit(totalNameSum || 1);

  return { ruling, destiny, soulUrge, namank };
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
    isKn ? "ಸ್ವಂತ ನಿರ್ಧಾರ, ಪ್ರಾತಃಕಾಲದ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಚಿನ್ನ/ಕೇಸರಿ ವರ್ಣದ ಬಳಕೆ ಸಂಪತ್ತನ್ನು ಆಕರ್ಷಿಸುತ್ತದೆ." : "Independent leadership, morning Surya Arghya and golden-amber accents attract high wealth.",
    isKn ? "ಪಾಲುದಾರಿಕೆ, ಜಲ ತತ್ವದ ವ್ಯಾಪಾರ ಹಾಗೂ ಶಾಂತ ಸಂವಹನದಿಂದ ನಿರಂತರ ಧನಾಗಮನ." : "Collaborative ventures, liquid assets and calm diplomacy bring continuous fortune.",
    isKn ? "ಜ್ಞಾನ ಪ್ರಸಾರ, ಬೋಧನೆ, ಸಲಹಾ ಸೇವೆಗಳು ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ಉನ್ನತ ಐಶ್ವರ್ಯ." : "Consultancy, teaching, knowledge dissemination and Guru blessings unlock multi-generational wealth.",
    isKn ? "ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನ, AI ಸಾಧನಗಳು ಹಾಗೂ ಅಂತರರಾಷ್ಟ್ರೀಯ ಸಂಪರ್ಕಗಳಿಂದ ಅನಿರೀಕ್ಷಿತ ಯಶಸ್ಸು." : "Digital technology, AI tools, and disruptive ventures bring sudden exponential gains.",
    isKn ? "ವ್ಯಾಪಾರ, ಷೇರು ಮಾರುಕಟ್ಟೆ, ಸಂವಹನ ಮಾಧ್ಯಮಗಳು ಹಾಗೂ ಚುರುಕು ನಿರ್ಧಾರಗಳಿಂದ ಧನಲಾಭ." : "Trading, dynamic communications, analytics, and agile execution yield rapid wealth.",
    isKn ? "ಸೌಂದರ್ಯ, ಐಷಾರಾಮಿ ವಸ್ತುಗಳು, ಕಲೆ, ವಾಸ್ತುಶಿಲ್ಪ ಹಾಗೂ ಸತ್ಸಂಗದಿಂದ ಸಮೃದ್ಧಿ." : "Aesthetic design, hospitality, media, and harmonious relationships create abundant prosperity.",
    isKn ? "ಸಂಶೋಧನೆ, ಔಷಧ, ಆಧ್ಯಾತ್ಮಿಕ ಪುಸ್ತಕಗಳು ಹಾಗೂ ಆಂತರಿಕ ವಿವೇಕದಿಂದ ಭಾಗ್ಯೋದಯ." : "Deep research, specialized analytics, wellness and spiritual mastery unlock hidden treasures.",
    isKn ? "ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಮೂಲಸೌಕರ್ಯ, ಶ್ರಮಶೀಲತೆ ಹಾಗೂ ದೃಢ ನಿಷ್ಠೆಯಿಂದ ಶಾಶ್ವತ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ." : "Real estate, engineering, patient compounding, and persistent discipline build an enduring empire.",
    isKn ? "ಸಾಹಸೋದ್ಯಮ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ಕ್ರೀಡೆ ಅಥವಾ ರಕ್ಷಣಾ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅಪಾರ ಯಶಸ್ಸು." : "Bold enterprise, property, executive leadership, and pioneering endeavors create monumental wealth."
  ];

  const careerArchetypes = [
    "",
    isKn ? "ನಾಯಕ / ನಿರ್ದೇಶಕ / ಸ್ವತಂತ್ರ ಉದ್ಯಮಿ (Visionary Pioneer)" : "Visionary Founder / Executive Director",
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
    wealthAttractionSecret: wealthSecrets[ruling] || wealthSecrets[1],
    careerArchetype: careerArchetypes[ruling] || careerArchetypes[1]
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

  // If user didn't pick traits manually, auto-infer seamlessly from ruling number & cosmic blueprint
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

  const pranaScore = Math.min(98, Math.max(72, 75 + (rulingNumber % 4) * 6 + ((now.getUTCHours() % 6) * 2)));

  const peakWindow = isKn
    ? "ಪ್ರಾತಃಕಾಲ ೦೯:೪೫ ರಿಂದ ಮಧ್ಯಾಹ್ನ ೧೨:೨೦ (ಅಭಿಜಿತ್ & ಸೂರ್ಯ ಕಾಲ)"
    : "09:45 AM to 12:20 PM (Abhijit Muhurtha & Solar Window)";

  const favorable = isKn
    ? [
        "ಹೊಸ ಒಪ್ಪಂದಗಳು, ಆರ್ಥಿಕ ಯೋಜನೆಗಳು ಹಾಗೂ ಪ್ರಮುಖ ಸಭೆಗಳು.",
        "ತಂತ್ರಜ್ಞಾನ ಕಲಿಯುವುದು, AI ಸಾಧನಗಳ ಬಳಕೆ ಹಾಗೂ ವಿನ್ಯಾಸ ಕಾರ್ಯಗಳು.",
        "ದೇವತಾರ್ಚನೆ, ಇಷ್ಟದೇವತಾ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಸಂಕಲ್ಪ ಪ್ರಾರ್ಥನೆ."
      ]
    : [
        "High-stakes negotiations, asset allocation and strategic meetings.",
        "Learning advanced technology, AI workflows and architectural design.",
        "Sacred meditation, mantra japa and temple sankalpa."
      ];

  const caution = isKn
    ? [
        "ಅನಗತ್ಯ ವಾದ-ವಿವಾದಗಳು ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಆತುರದ ನಿರ್ಧಾರಗಳು.",
        "ರಾತ್ರಿ ತಡವಾಗಿ ಸ್ಕ್ರೀನ್ ನೋಡುವುದು ಹಾಗೂ ಅಪಥ್ಯ ಆಹಾರ ಸೇವನೆ."
      ]
    : [
        "Impulsive emotional decisions and unnecessary arguments.",
        "Late-night blue-light exposure and erratic sleep cycles."
      ];

  const summary = isKn
    ? `ಇಂದು ಆಕಾಶ ಮಂಡಲದಲ್ಲಿ ಚಂದ್ರನು ${moonRashiName} ರಾಶಿಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಮೂಲಾಂಕಕ್ಕೆ (${rulingNumber}) ಅತ್ಯಂತ ಪೂರಕವಾದ ${pranaScore}% ಪ್ರಾಣಶಕ್ತಿ ಪ್ರವಾಹವಿದೆ.`
    : `Today the Moon is transiting ${moonRashiName}, channeling an optimal ${pranaScore}% Pranic Vitality resonance for your Ruling Energy (${rulingNumber}).`;

  const impact = isKn
    ? "ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಸಕಾರಾತ್ಮಕ ಕಾರ್ಯೋತ್ಸಾಹ ಇರಲಿದೆ. ಹೊಸ ಹೆಜ್ಜೆಗೆ ಇದು ಸಕಾಲ."
    : "High cognitive clarity and constructive execution drive today's cosmic rhythm.";

  return {
    pranaScore,
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
    { axis: "ಮೇಷ - ತುಲಾ (Mesha-Tula Axis)", purpose: "ಸ್ವಾವಲಂಬನೆ ಮತ್ತು ಸಮತೋಲಿತ ಸಂಬಂಧಗಳ ನಿರ್ಮಾಣ", past: "ಹಿಂದಿನ ಜನ್ಮದ ರಾಜತಾಂತ್ರಿಕ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ನಾಯಕತ್ವ", debt: "ಸಂಬಂಧಗಳಲ್ಲಿ ಅತಿ ಅವಲಂಬನೆಯನ್ನು ಬಿಟ್ಟು ಸ್ವಂತ ಕಾಲ ಮೇಲೆ ನಿಲ್ಲುವುದು" },
    { axis: "ವೃಷಭ - ವೃಶ್ಚಿಕ (Vrishabha-Vrischika Axis)", purpose: "ಆಂತರಿಕ ಪರಿವರ್ತನೆ ಮತ್ತು ಸತ್ಯ ಸಂಪತ್ತಿನ ಸಂರಕ್ಷಣೆ", past: "ದೃಢತೆ ಮತ್ತು ಆರ್ಥಿಕ ನಿರ್ವಹಣೆಯ ಜ್ಞಾನ", debt: "ಭೌತಿಕ ವ್ಯಾಮೋಹ ಕಳೆದು ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಥೈರ್ಯ ಗಳಿಸುವುದು" },
    { axis: "ಮಿಥುನ - ಧನು (Mithuna-Dhanu Axis)", purpose: "ಉನ್ನತ ಸತ್ಯದ ಅನ್ವೇಷಣೆ ಮತ್ತು ವಿಶ್ವಜ್ಞಾನ ಪ್ರಸಾರ", past: "ಬುದ್ಧಿವಂತಿಕೆ ಮತ್ತು ಸಂವಹನ ಕೌಶಲ್ಯ", debt: "ಕೇವಲ ಮಾಹಿತಿ ಸಂಗ್ರಹ ಬಿಟ್ಟು ನಿಜವಾದ ಅನುಭವ ಜ್ಞಾನ ಪಡೆಯುವುದು" },
    { axis: "ಕರ್ಕಾಟಕ - ಮಕರ (Karka-Makara Axis)", purpose: "ಜವಾಬ್ದಾರಿಯುತ ಕರ್ಮ ಹಾಗೂ ಸಮಾಜ ಮುನ್ನಡೆ", past: "ಭಾವನಾತ್ಮಕ ಪೋಷಣೆ ಮತ್ತು ಕುಟುಂಬ ನಿಷ್ಠೆ", debt: "ಭಾವನಾತ್ಮಕ ಅಳುಕು ಬಿಟ್ಟು ನಿರ್ಭಯ ಕರ್ಮಯೋಗಿಯಾಗುವುದು" }
  ];

  const selected = axisPairs[sunRashiIdx % 4];

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
  const startYear = parseInt(dob.split("-")[0], 10) || 1990;
  const milestones: DecadeMilestone[] = [];

  const phases = [
    { name: isKn ? "ಬುಧ-ಸೂರ್ಯ ಯುಗ (ವಿದ್ಯಾಭ್ಯಾಸ & ಪ್ರಕೃತಿ ನಿರ್ಮಾಣ)" : "Mercury-Sun Phase (Foundation & Education)", theme: isKn ? "ಆರಂಭಿಕ ಕಲಿಕೆ, ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಸಂಸ್ಕಾರ ಸ್ಥಾಪನೆ." : "Formative learning, values foundation, and mental agility." },
    { name: isKn ? "ಕುಜ-ಶುಕ್ರ ಯುಗ (ವೃತ್ತಿ ನಾವೀನ್ಯತೆ & ಸಾಹಸ)" : "Mars-Venus Phase (Ambition & Exploration)", theme: isKn ? "ವೃತ್ತಿ ಆರಂಭ, ಮಹತ್ವಾಕಾಂಕ್ಷೆ, ಹೊಸ ಕ್ಷೇತ್ರಗಳ ಅನ್ವೇಷಣೆ." : "Career launch, adventurous expansion, and skill mastery." },
    { name: isKn ? "ಗುರು-ರವಿ ಯುಗ (ಉನ್ನತ ಯಶಸ್ಸು & ಅಧಿಕಾರ ಸ್ಥಾಪನೆ)" : "Jupiter-Sun Epoch (Prime Authority & Wealth)", theme: isKn ? "ವೃತ್ತಿ ಉತ್ತುಂಗ, ಸಂಪತ್ತು ನಿರ್ಮಾಣ, ಕುಟುಂಬ ವಿಸ್ತರಣೆ ಮತ್ತು ಸಾಮಾಜಿಕ ಗೌರವ." : "Peak professional leadership, family prosperity and authority." },
    { name: isKn ? "ಶನಿ-ಬುಧ ಯುಗ (ಸ್ಥಿರತೆ & ಸಾಮ್ರಾಜ್ಯ ವಿಸ್ತರಣೆ)" : "Saturn-Mercury Era (Consolidation & Scale)", theme: isKn ? "ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ, ಸ್ಥಿರ ವ್ಯವಸ್ಥೆಗಳ ನಿರ್ಮಾಣ ಹಾಗೂ ದೂರದೃಷ್ಟಿ." : "Financial consolidation, building enduring systems, and mentorship." },
    { name: isKn ? "ಕೇತು-ಗುರು ಯುಗ (ಆಧ್ಯಾತ್ಮಿಕ ತೇಜಸ್ಸು & ಕೀರ್ತಿ)" : "Ketu-Jupiter Apex (Wisdom & Legacy)", theme: isKn ? "ಆಂತರಿಕ ಶಾಂತಿ, ಸಮಾಜ ಕಲ್ಯಾಣ, ತತ್ವಜ್ಞಾನ ಮತ್ತು ಅಮರ ಕೀರ್ತಿ." : "Spiritual transcendence, philanthropy, and lasting legacy." }
  ];

  for (let i = 0; i < 5; i++) {
    const ageStart = i * 15;
    const ageEnd = (i + 1) * 15;
    const yStart = startYear + ageStart;
    const yEnd = startYear + ageEnd;
    const phase = phases[i];
    const vitality = Math.min(95, 78 + ((ruling + i * 3) % 18));

    milestones.push({
      ageRange: `${ageStart} - ${ageEnd} ${isKn ? "ವರ್ಷ" : "Yrs"}`,
      years: `${yStart} - ${yEnd}`,
      rulingPhase: phase.name,
      theme: phase.theme,
      vitalityScore: vitality,
      keyGuidance: isKn
        ? `ಈ ಕಾಲಾವಧಿಯಲ್ಲಿ ${vitality}% ದೈವಬಲವಿದ್ದು, ಧರ್ಮನಿಷ್ಠ ಕರ್ಮದಿಂದ ಮಹತ್ತರ ಯಶಸ್ಸು ಸಾಧ್ಯ.`
        : `Carries a stellar ${vitality}% vitality index with monumental acceleration when aligned with disciplined focus.`
    });
  }

  return milestones;
}

export function computeModernWorldAlignment(
  input: KaalaDiksuchiInput,
  samudrika: SamudrikaProfile,
  rulingNum: number
): ModernWorldAlignment {
  const isKn = input.lang === "kn";
  const resonance = Math.min(96, Math.max(70, 72 + (rulingNum % 5) * 5 + (samudrika.elementalComposition.air > 30 ? 6 : 3)));

  const globalTrend = isKn
    ? "ಪ್ರಸ್ತುತ ಜಗತ್ತು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI), ಡಿಜಿಟಲ್ ವೇಗ, ಆರ್ಥಿಕ ಪಲ್ಲಟಗಳು ಹಾಗೂ ಮಾನಸಿಕ ಒತ್ತಡದ ತೀವ್ರ ಸಂಕ್ರಮಣ ಕಾಲದಲ್ಲಿದೆ. ಯಾಂತ್ರಿಕ ಕೆಲಸಗಳಿಗಿಂತ ಸೃಜನಶೀಲತೆ, ಆಂತರಿಕ ಶಾಂತಿ ಮತ್ತು ಹೊಂದಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯವೇ ಶ್ರೇಷ್ಠ ಸಂಪತ್ತು."
    : "The world is in an exponential era of AI automation, high-velocity digital data, economic restructuring, and cognitive saturation. Resilience, emotional intelligence, and adaptable deep-work are the true differentiators.";

  const standing = isKn
    ? `ನಿಮ್ಮ ಪ್ರಕೃತಿಯು (${samudrika.dominantPlanet} ಪ್ರಧಾನ) ಆಧುನಿಕ ಜಗತ್ತಿನ ಗದ್ದಲದಲ್ಲಿ ಆಂತರಿಕ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಮರ್ಥವಾಗಿದೆ. ನೀವು ${resonance}% ಸಾಮರ್ಥ್ಯದೊಂದಿಗೆ ವೇಗವಾಗಿ ಮುನ್ನಡೆಯುವ ಜಗತ್ತಿಗೆ ಹೊಂದಿಕೊಳ್ಳಬಲ್ಲ ಶಕ್ತಿ ಹೊಂದಿದ್ದೀರಿ.`
    : `Your innate archetype (${samudrika.dominantPlanet} dominated) is wired for grounded discernment amid modern digital chaos, carrying a ${resonance}% alignment index with current global demands.`;

  const vulnerabilities = isKn
    ? [
        "ಡಿಜಿಟಲ್ ಗೊಂದಲ ಹಾಗೂ ಅನಗತ್ಯ ಮಾಹಿತಿ ಪ್ರವಾಹದಿಂದ ಏಕಾಗ್ರತೆ ಭಂಗವಾಗುವ ಸಾಧ್ಯತೆ.",
        "ತ್ವರಿತ ಫಲಿತಾಂಶದ ನಿರೀಕ್ಷೆಯಿಂದ ತಾಳ್ಮೆ ಕಳೆದುಕೊಳ್ಳುವುದು.",
        "ಸ್ಕ್ರೀನ್ ಅವಧಿ ಹೆಚ್ಚಾಗಿ ನಿದ್ರೆ ಹಾಗೂ ದೈಹಿಕ ವ್ಯಾಯಾಮದಲ್ಲಿ ಏರುಪೇರು."
      ]
    : [
        "Risk of cognitive overload and fragmented focus from digital hyper-connectivity.",
        "Impatience driven by modern instant-gratification culture.",
        "Sedentary screen habits impacting sleep rhythms and vital Prana."
      ];

  const opportunities = isKn
    ? [
        "ಹೊಸ ತಂತ್ರಜ್ಞಾನ ಹಾಗೂ AI ಸಾಧನಗಳನ್ನು ನಿಮ್ಮ ಅನುಭವಕ್ಕೆ ಜೋಡಿಸಿ ಉತ್ಪಾದಕತೆ 3x ಹೆಚ್ಚಿಸಿಕೊಳ್ಳುವುದು.",
        "ವಿಶ್ವಾಸಾರ್ಹ ವೈಯಕ್ತಿಕ ಸಂಬಂಧಗಳು ಹಾಗೂ ನೇರ ಸಂವಹನದ ಮೂಲಕ ಉನ್ನತ ಮೌಲ್ಯ ನಿರ್ಮಿಸುವುದು.",
        "ಆಧ್ಯಾತ್ಮಿಕ ತಂತ್ರಜ್ಞಾನ (ಪ್ರಾಣಾಯಾಮ/ಧ್ಯಾನ) ಬಳಸಿ ಮಾನಸಿಕ ಸ್ಪಷ್ಟತೆಯಲ್ಲಿ ಸ್ಪರ್ಧಾತ್ಮಕ ಮುನ್ನಡೆ ಸಾಧಿಸುವುದು."
      ]
    : [
        "Leveraging AI and modern workflow tools to amplify your domain mastery 3x.",
        "Building high-trust, authentic networks that outshine synthetic interactions.",
        "Using daily breathwork & Vedic discipline as an unfair cognitive advantage."
      ];

  const careerStrategy = isKn
    ? "ಕೇವಲ ಶ್ರಮಪಡುವುದಕ್ಕಿಂತ ಬುದ್ಧಿವಂತಿಕೆಯ ವಿನ್ಯಾಸ (Smart Systems) ಅಳವಡಿಸಿಕೊಳ್ಳಿ. ನಿಮ್ಮ ಕ್ಷೇತ್ರದಲ್ಲಿ AI ಮತ್ತು ಆಧುನಿಕ ಮಾಧ್ಯಮಗಳನ್ನು ಸಹೋದ್ಯೋಗಿಯಾಗಿ ಬಳಸಿ ನಾಯಕತ್ವ ಬೆಳೆಸಿಕೊಳ್ಳಿ."
    : "Pivot from routine execution to strategic value architecture. Treat modern AI tools as personal force multipliers while anchoring on human empathy and judgment.";

  const wellness = isKn
    ? "ದಿನಕ್ಕೆ ಕನಿಷ್ಠ 1 ಗಂಟೆ 'ಡಿಜಿಟಲ್ ಉಪವಾಸ' (Screen Detox) ಮಾಡಿ. ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ 10 ನಿಮಿಷ ನೈಸರ್ಗಿಕ ಬೆಳಕು ಪಡೆಯುವುದು ನಿಮ್ಮ ಮೆದುಳಿನ ತೇಜಸ್ಸನ್ನು ಪುನರುಜ್ಜೀವನಗೊಳಿಸುತ್ತದೆ."
    : "Implement a strict 60-minute daily Digital Detox. Get direct morning sunlight within 30 minutes of waking to optimize dopamine and circadian health.";

  const relationships = isKn
    ? "ವರ್ಚುವಲ್ ಸಂದೇಶಗಳ ಬದಲು ಮುಖಾಮುಖಿ ಅಥವಾ ಧ್ವನಿ ಸಂಭಾಷಣೆಗೆ ಪ್ರಾಶಸ್ತ್ಯ ನೀಡಿ. ಕುಟುಂಬ ಮತ್ತು ಹಿತೈಷಿಗಳೊಂದಿಗೆ ಗುಣಮಟ್ಟದ ಸಮಯ ಕಳೆಯುವುದು ಆಂತರಿಕ ನೆಮ್ಮದಿಯ ರಕ್ಷಾಕವಚ."
    : "Prioritize rich in-person or vocal interactions over text messaging. Authentic presence with family and trusted peers builds an unshakeable emotional fortress.";

  const habits = isKn
    ? [
        "ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದಲ್ಲಿ (ಮುಂಜಾನೆ 5:30-6:30) 5 ನಿಮಿಷ ಗಾಯತ್ರಿ ಅಥವಾ ಇಷ್ಟದೇವತಾ ಧ್ಯಾನ.",
        "ಪ್ರತಿದಿನ ಪ್ರಮುಖ 3 ಗುರಿಗಳನ್ನು ಮಾತ್ರ ಬರೆದಿಟ್ಟು ಪೂರ್ಣಗೊಳಿಸುವ ಶಿಸ್ತು.",
        "ರಾತ್ರಿ ಮಲಗುವ 45 ನಿಮಿಷ ಮುಂಚೆ ಮೊಬೈಲ್ ಸ್ಕ್ರೀನ್ ಸಂಪೂರ್ಣ ಬಂದ್ ಮಾಡುವುದು.",
        "ವಾರಕ್ಕೊಮ್ಮೆ ಪ್ರಕೃತಿ ನಡಿಗೆ ಅಥವಾ ಗೋಸೇವೆ ಮೂಲಕ ಭೂಮಿ ತತ್ವ ಸಮತೋಲನ."
      ]
    : [
        "5-minute dawn meditation / Gayatri chanting during Brahma Muhurtha.",
        "Daily 3-Priority Rule: Define and conquer only 3 major tasks before noon.",
        "Zero screen exposure 45 minutes before sleep for deep cellular restoration.",
        "Weekly nature walk or Go-Seva to ground high-frequency digital stress."
      ];

  return {
    currentGlobalTrend: globalTrend,
    userResonanceScore: resonance,
    userStandingInModernEra: standing,
    keyVulnerabilities: vulnerabilities,
    growthOpportunities: opportunities,
    careerAndTechStrategy: careerStrategy,
    digitalAndMentalWellness: wellness,
    relationshipAndSocialGuidance: relationships,
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
    ? `ಪ್ರಸ್ತುತ ಬ್ರಹ್ಮಾಂಡದ ಲಗ್ನವು (${rashiName}) ಮತ್ತು ಚಂದ್ರ ನಕ್ಷತ್ರ (${nakName}) ಅತ್ಯಂತ ಶುಭಸೂಚಕವಾಗಿವೆ. ನೀವು ಕೈಗೊಳ್ಳಲುದ್ದೇಶಿಸಿದ ನಿರ್ಧಾರದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಫಲವಿದೆ. ಧರ್ಮ ಮಾರ್ಗದಲ್ಲಿ ಧೈರ್ಯವಾಗಿ ಹೆಜ್ಜೆಯಿಡಿ.`
    : `The instantaneous cosmic horizon (${rashiName} Lagna, ${nakName} Moon) indicates strong planetary support. Your pending endeavor holds high promise if approached with steady integrity.`;

  const timeline = isKn
    ? "ಮುಂದಿನ ೨೧ ರಿಂದ ೪೫ ದಿನಗಳಲ್ಲಿ ಮಹತ್ತರ ತಿರುವು ಗೋಚರಿಸಲಿದೆ."
    : "A pivotal breakthrough is indicated within the next 21 to 45 days.";

  return {
    prashnaLagna: rashiName,
    prashnaNakshatra: nakName,
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
    luckyNumbers: [1, 3, 7, 9],
    gemstoneRecommendation: isKn
      ? "ಮಾಣಿಕ್ಯ (Ruby) ಅಥವಾ ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire) ಅಥವಾ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಅತ್ಯುತ್ತಮ."
      : "5-Mukhi Sacred Rudraksha or Natural Yellow Sapphire / Ruby.",
    sacredGokarnaRemedy: isKn
      ? "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಆತ್ಮಲಿಂಗ ಪೂಜೆ ಹಾಗೂ ಹಸುವಿಗೆ ಬೆಲ್ಲ-ಹುಲ್ಲು ನೀಡುವುದು ಸರ್ವ ದೋಷ ಪರಿಹಾರಕ."
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
  const modernWorld = computeModernWorldAlignment(input, samudrika, num.ruling);
  const liveTransit = computeLiveTransitEnergy(input, num.ruling);
  const karmicMission = computeKarmicSoulMission(input, sunRashiIdx);
  const decadeMilestones = computeDecadeMilestones(input.dob, num.ruling, isKn);
  const prashnaOracle = computePrashnaOracle(input);
  const remedies = computeRemedialPrescription(input, samudrika);

  const planetSummaries: PlanetaryPositionSummary[] = [
    { name: "Sun (ಸೂರ್ಯ)", rashi: suryaRashiStr, degree: coords.sun % 30, houseFromSun: 1, dignity: evaluateDignity("Sun", sunRashiIdx), significance: "ಆತ್ಮಕಾರಕ & ಪ್ರಾಣಶಕ್ತಿ" },
    { name: "Moon (ಚಂದ್ರ)", rashi: chandraRashiStr, degree: coords.moon % 30, houseFromSun: Math.floor((coords.moon - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Moon", moonRashiIdx), significance: "ಮನಃಕಾರಕ & ಭಾವನಾತ್ಮಕ ಸ್ಥೈರ್ಯ" },
    { name: "Mars (ಮಂಗಳ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.mars / 30)] : RASHI_NAMES_EN[Math.floor(coords.mars / 30)], degree: coords.mars % 30, houseFromSun: Math.floor((coords.mars - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Mars", Math.floor(coords.mars / 30)), significance: "ಪರಾಕ್ರಮ & ಧೈರ್ಯ" },
    { name: "Mercury (ಬುಧ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.mercury / 30)] : RASHI_NAMES_EN[Math.floor(coords.mercury / 30)], degree: coords.mercury % 30, houseFromSun: Math.floor((coords.mercury - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Mercury", Math.floor(coords.mercury / 30)), significance: "ಬುದ್ಧಿ & ವ್ಯಾಪಾರ ಕೌಶಲ್ಯ" },
    { name: "Jupiter (ಗುರು)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.jupiter / 30)] : RASHI_NAMES_EN[Math.floor(coords.jupiter / 30)], degree: coords.jupiter % 30, houseFromSun: Math.floor((coords.jupiter - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Jupiter", Math.floor(coords.jupiter / 30)), significance: "ಜ್ಞಾನ, ಭಾಗ್ಯ & ಸಂತಾನ" },
    { name: "Venus (ಶುಕ್ರ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.venus / 30)] : RASHI_NAMES_EN[Math.floor(coords.venus / 30)], degree: coords.venus % 30, houseFromSun: Math.floor((coords.venus - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Venus", Math.floor(coords.venus / 30)), significance: "ಸೌಂದರ್ಯ, ಕಲೆ & ಸಂಪತ್ತು" },
    { name: "Saturn (ಶನಿ)", rashi: isKn ? RASHI_NAMES_KN[Math.floor(coords.saturn / 30)] : RASHI_NAMES_EN[Math.floor(coords.saturn / 30)], degree: coords.saturn % 30, houseFromSun: Math.floor((coords.saturn - coords.sun + 360) % 360 / 30) + 1, dignity: evaluateDignity("Saturn", Math.floor(coords.saturn / 30)), significance: "ಕರ್ಮ, ಶಿಸ್ತು & ದೀರ್ಘಾಯುಷ್ಯ" }
  ];

  let aiNarrative: string | undefined = undefined;

  if (geminiApiKey) {
    try {
      const prompt = `You are a revered Vedic Astrologer and Modern Life Strategist from Gokarna Kshetra.
The user does not know their exact birth time, but provided their Date of Birth (${input.dob}), Name (${input.personName}), Ruling Number ${num.ruling}, and Focus: ${input.primaryFocus || "modern_adaptation"}.
Analyze their cosmic matrix, their position in today's fast-paced AI/modern world, and synthesize 3 highly inspiring, actionable, and specific paragraphs in ${input.lang === "kn" ? "Kannada language" : input.lang === "hi" ? "Hindi" : input.lang === "te" ? "Telugu" : input.lang === "ta" ? "Tamil" : "English"}.
Keep the tone dignified, royal, spiritual, yet sharply practical for modern life.`;

      const aiResponse = await askGemini(prompt, "", geminiApiKey, input.lang, { raw: true });
      if (aiResponse) {
        aiNarrative = aiResponse;
      }
    } catch {
      // Fallback cleanly
    }
  }

  return {
    input,
    calculatedAt: new Date().toISOString(),
    birthDayOfWeek: weekdayName,
    suryaRashi: suryaRashiStr,
    chandraRashiEstimate: chandraRashiStr,
    nakshatraRange: nakshatraRangeStr,
    rulingNumber: num.ruling,
    destinyNumber: num.destiny,
    soulUrgeNumber: num.soulUrge,
    planets: planetSummaries,
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
