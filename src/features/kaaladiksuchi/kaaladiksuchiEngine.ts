import { siderealLongitudes } from "../../core/EphemerisEngine";
import { normalizeDegree } from "../../core/AstroMath";
import { askGemini } from "../../core/GeminiEngine";
import type {
  KaalaDiksuchiInput,
  KaalaDiksuchiResult,
  PlanetaryPositionSummary,
  ModernWorldAlignment,
  SamudrikaProfile,
  PrashnaOracleResult,
  RemedialPrescription
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

export function calculateNumerologyNumbers(dob: string, name: string): { ruling: number; destiny: number; soulUrge: number } {
  const parts = dob.split("-").map(Number);
  const day = parts[2] || 1;
  const month = parts[1] || 1;
  const year = parts[0] || 2000;

  const ruling = reduceToSingleDigit(day);
  const destiny = reduceToSingleDigit(day + month + year.toString().split("").reduce((a, b) => a + parseInt(b, 10), 0));

  const vowels = "AEIOU";
  let vowelSum = 0;
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, "");
  for (const ch of cleanName) {
    if (vowels.includes(ch)) {
      vowelSum += (ch.charCodeAt(0) - 64) % 9 || 9;
    }
  }
  const soulUrge = reduceToSingleDigit(vowelSum || 5);

  return { ruling, destiny, soulUrge };
}

export function evaluateDignity(planet: string, rashiIdx: number): "Exalted" | "Own Sign" | "Friendly" | "Neutral" | "Debilitated" {
  // Classical Vedic Exaltation / Debilitation
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

export function computeSamudrikaProfile(input: KaalaDiksuchiInput): SamudrikaProfile {
  let dominantPlanet = "Jupiter (Guru)";
  let archetype = "ಜ್ಞಾನಿ & ಮಾರ್ಗದರ್ಶಕ (The Wise Counselor)";
  let reflex = "ಗಂಭೀರ ಚಿಂತನೆ & ಧರ್ಮನಿಷ್ಠೆ (Calm deliberation and principled action)";
  let superpower = "ಅತ್ಯುನ್ನತ ದೂರದೃಷ್ಟಿ ಹಾಗೂ ಸಂಕೀರ್ಣ ಸವಾಲುಗಳಿಗೆ ಸುಲಭ ಪರಿಹಾರ (Strategic foresight and clear discernment)";

  const elementCounts = { fire: 25, earth: 25, air: 25, water: 25 };

  if (input.foreheadShape === "broad" || input.eyeRadiance === "calm") {
    dominantPlanet = "Jupiter (Guru)";
    archetype = input.lang === "kn" ? "ಧರ್ಮಜ್ಞ & ನಾಯಕ (Visionary Leader & Counselor)" : "Visionary Leader & Counselor";
    elementCounts.fire += 20;
    elementCounts.earth += 10;
  } else if (input.foreheadShape === "angular" || input.eyeRadiance === "sharp") {
    dominantPlanet = "Mars (Kuja / Mangala)";
    archetype = input.lang === "kn" ? "ಸಾಹಸಿ & ನಿರ್ಣಾಯಕ (Action Hero & Decisive Achiever)" : "Action Hero & Decisive Achiever";
    reflex = input.lang === "kn" ? "ತ್ವರಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಂಜದ ಸಾಹಸ ಪ್ರವೃತ್ತಿ" : "Instant decision making and courageous drive";
    elementCounts.fire += 35;
  } else if (input.foreheadShape === "curved" || input.eyeRadiance === "gentle") {
    dominantPlanet = "Venus (Shukra) / Moon (Chandra)";
    archetype = input.lang === "kn" ? "ಸೃಜನಶೀಲ & ಸಹಾನುಭೂತಿ ನಾಯಕ (Empathetic Creator & Diplomat)" : "Empathetic Creator & Diplomat";
    elementCounts.water += 30;
    elementCounts.air += 15;
  } else if (input.foreheadShape === "compact" || input.eyeRadiance === "analytical") {
    dominantPlanet = "Mercury (Budha)";
    archetype = input.lang === "kn" ? "ವಿಶ್ಲೇಷಕ & ಚತುರ ವ್ಯಾಪಾರಿ (Analytical Strategist & Communicator)" : "Analytical Strategist & Communicator";
    elementCounts.air += 35;
    elementCounts.earth += 15;
  }

  if (input.handElement === "fire") elementCounts.fire += 25;
  if (input.handElement === "earth") elementCounts.earth += 25;
  if (input.handElement === "air") elementCounts.air += 25;
  if (input.handElement === "water") elementCounts.water += 25;

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

export function computeModernWorldAlignment(
  input: KaalaDiksuchiInput,
  samudrika: SamudrikaProfile,
  rulingNum: number
): ModernWorldAlignment {
  const isKn = input.lang === "kn";

  const resonance = Math.min(95, Math.max(68, 70 + (rulingNum % 5) * 5 + (samudrika.elementalComposition.air > 30 ? 6 : 2)));

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
  const coords = siderealLongitudes(now);
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

  // Epoch at Noon UTC on birth date for robust Graha calculation
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
  const samudrika = computeSamudrikaProfile(input);
  const modernWorld = computeModernWorldAlignment(input, samudrika, num.ruling);
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

  // Optional AI Deep Synthesis using gemini-3.5-flash-lite
  if (geminiApiKey) {
    try {
      const prompt = `You are a revered Vedic Astrologer and Modern Life Strategist from Gokarna Kshetra.
The user does not know their exact birth time, but provided their Date of Birth (${input.dob}), Name (${input.personName}), Samudrika Face/Palm traits (Dominant Planet: ${samudrika.dominantPlanet}), and Focus: ${input.primaryFocus}.
Analyze their cosmic matrix, their position in today's fast-paced AI/modern world, and synthesize 3 highly inspiring, actionable, and specific paragraphs in ${input.lang === "kn" ? "Kannada language" : input.lang === "hi" ? "Hindi" : input.lang === "te" ? "Telugu" : input.lang === "ta" ? "Tamil" : "English"}.
Keep the tone dignified, royal, spiritual, yet sharply practical for modern life.`;

      const aiResponse = await askGemini(prompt, "", geminiApiKey, input.lang, { raw: true });
      if (aiResponse) {
        aiNarrative = aiResponse;
      }
    } catch {
      // Fallback cleanly to deterministic synthesis
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
    prashnaOracle,
    remedies,
    aiNarrative
  };
}
