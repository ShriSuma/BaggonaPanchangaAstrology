/**
 * BAGGONA PANCHANGA — 100% JYOTISH PRECISION GATES ENGINE
 * Deterministic Parashari-Tajika Override Rules, 3-Gate Validator, Tarabala & Past-Event Sales Hook.
 */

import { siderealLongitudes } from "../core/EphemerisEngine";
import { calculateTaraBala, calculateChandraBala, type TaraNumber } from "../core/TaraBalaEngine";

export type RashiIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11; // 0=Aries ... 11=Pisces
export type Planet = "Sun" | "Moon" | "Mars" | "Mercury" | "Jupiter" | "Venus" | "Saturn" | "Rahu" | "Ketu";
export type FunctionalNature = "YOGAKARAKA" | "BENEFIC" | "NEUTRAL" | "MALEFIC" | "MARAKA";

export interface PlanetPosition {
  planet: Planet;
  longitude: number;        // 0 to 359.999 sidereal degrees
  rashi: RashiIndex;        // 0 to 11
  degreeInSign: number;     // 0 to 29.999
  rashiHouse: number;       // 1 to 12 (Whole Sign from Lagna)
  bhavaHouse?: number;      // 1 to 12 (Sripati Bhava Chalit)
  nakshatraLord?: Planet;   // Critical: 2x weight in Dasha delivery
  isRetrograde?: boolean;
  isCombust?: boolean;
  d9Rashi?: RashiIndex;     // Navamsha sign
}

export function normalizePlanetName(planetStr: string): Planet {
  const clean = (planetStr || "").trim().toLowerCase();
  if (clean.includes("sun") || clean.includes("surya") || clean.includes("ravi")) return "Sun";
  if (clean.includes("moon") || clean.includes("chandra")) return "Moon";
  if (clean.includes("mars") || clean.includes("kuja") || clean.includes("mangal")) return "Mars";
  if (clean.includes("mercury") || clean.includes("budha")) return "Mercury";
  if (clean.includes("jupiter") || clean.includes("guru") || clean.includes("brihaspati")) return "Jupiter";
  if (clean.includes("venus") || clean.includes("shukra")) return "Venus";
  if (clean.includes("saturn") || clean.includes("shani")) return "Saturn";
  if (clean.includes("rahu")) return "Rahu";
  if (clean.includes("ketu")) return "Ketu";
  return "Sun";
}

// ============================================================================
// 1. 12-LAGNA FUNCTIONAL NATURE MATRIX (Stops generic "Saturn is bad" errors)
// ============================================================================
export const LAGNA_FUNCTIONAL_MATRIX: Record<RashiIndex, Record<Exclude<Planet, "Rahu" | "Ketu">, FunctionalNature>> = {
  0:  { Sun: "BENEFIC", Moon: "NEUTRAL", Mars: "BENEFIC", Mercury: "MALEFIC", Jupiter: "BENEFIC", Venus: "MARAKA", Saturn: "MALEFIC" },      // Aries
  1:  { Sun: "NEUTRAL", Moon: "MALEFIC", Mars: "MARAKA", Mercury: "BENEFIC", Jupiter: "MALEFIC", Venus: "BENEFIC", Saturn: "YOGAKARAKA" },    // Taurus
  2:  { Sun: "MALEFIC", Moon: "MARAKA", Mars: "MALEFIC", Mercury: "BENEFIC", Jupiter: "NEUTRAL", Venus: "BENEFIC", Saturn: "BENEFIC" },       // Gemini
  3:  { Sun: "MARAKA", Moon: "BENEFIC", Mars: "YOGAKARAKA", Mercury: "MALEFIC", Jupiter: "BENEFIC", Venus: "MALEFIC", Saturn: "MARAKA" },     // Cancer
  4:  { Sun: "BENEFIC", Moon: "NEUTRAL", Mars: "YOGAKARAKA", Mercury: "MARAKA", Jupiter: "BENEFIC", Venus: "MALEFIC", Saturn: "MARAKA" },     // Leo
  5:  { Sun: "MALEFIC", Moon: "MALEFIC", Mars: "MALEFIC", Mercury: "BENEFIC", Jupiter: "MARAKA", Venus: "BENEFIC", Saturn: "NEUTRAL" },       // Virgo
  6:  { Sun: "MALEFIC", Moon: "NEUTRAL", Mars: "MARAKA", Mercury: "BENEFIC", Jupiter: "MALEFIC", Venus: "BENEFIC", Saturn: "YOGAKARAKA" },    // Libra
  7:  { Sun: "BENEFIC", Moon: "BENEFIC", Mars: "BENEFIC", Mercury: "MALEFIC", Jupiter: "BENEFIC", Venus: "MARAKA", Saturn: "NEUTRAL" },       // Scorpio
  8:  { Sun: "BENEFIC", Moon: "NEUTRAL", Mars: "BENEFIC", Mercury: "MARAKA", Jupiter: "BENEFIC", Venus: "MALEFIC", Saturn: "MARAKA" },        // Sagittarius
  9:  { Sun: "MALEFIC", Moon: "MARAKA", Mars: "MALEFIC", Mercury: "BENEFIC", Jupiter: "MALEFIC", Venus: "YOGAKARAKA", Saturn: "BENEFIC" },    // Capricorn
  10: { Sun: "MARAKA", Moon: "MALEFIC", Mars: "NEUTRAL", Mercury: "NEUTRAL", Jupiter: "MARAKA", Venus: "YOGAKARAKA", Saturn: "BENEFIC" },     // Aquarius
  11: { Sun: "MALEFIC", Moon: "BENEFIC", Mars: "BENEFIC", Mercury: "MARAKA", Jupiter: "BENEFIC", Venus: "MALEFIC", Saturn: "MALEFIC" },       // Pisces
};

export function getFunctionalNature(lagna: number | RashiIndex, planet: Planet | string): FunctionalNature {
  const normLagna = (((Math.floor(lagna) % 12) + 12) % 12) as RashiIndex;
  const p = normalizePlanetName(planet);
  if (p === "Rahu" || p === "Ketu") return "NEUTRAL"; // Evaluated via sign & nakshatra dispositor
  return LAGNA_FUNCTIONAL_MATRIX[normLagna]?.[p] || "NEUTRAL";
}

// ============================================================================
// 2. CLASSICAL GOCHARA VEDHA (OBSTRUCTION) ENGINE
// ============================================================================
// Maps [Planet] -> { [FavorableHouseFromMoon]: [ObstructingHouseFromMoon] }
const VEDHA_TABLE: Record<Exclude<Planet, "Rahu" | "Ketu">, Record<number, number>> = {
  Sun:     { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon:    { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mars:    { 3: 12, 6: 9, 11: 5 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Venus:   { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  Saturn:  { 3: 12, 6: 9, 11: 5 },
};

export function hasGocharaVedha(
  targetPlanet: Exclude<Planet, "Rahu" | "Ketu"> | string,
  targetHouseFromMoon: number,
  allTransitHousesFromMoon: Partial<Record<Planet | string, number>>
): { isObstructed: boolean; obstructedBy?: Planet } {
  const normTarget = normalizePlanetName(targetPlanet);
  if (normTarget === "Rahu" || normTarget === "Ketu") return { isObstructed: false };
  const targetClassical = normTarget as Exclude<Planet, "Rahu" | "Ketu">;

  const vedhaHouse = VEDHA_TABLE[targetClassical]?.[targetHouseFromMoon];
  if (!vedhaHouse) return { isObstructed: false };

  for (const [otherPlanetKey, otherHouse] of Object.entries(allTransitHousesFromMoon)) {
    const otherPlanet = normalizePlanetName(otherPlanetKey);
    if (otherPlanet === targetClassical || otherPlanet === "Rahu" || otherPlanet === "Ketu") continue;

    // Classical Parashari Exceptions: Father-Son (Sun-Saturn) & Moon-Mercury do NOT obstruct each other
    if ((targetClassical === "Sun" && otherPlanet === "Saturn") || (targetClassical === "Saturn" && otherPlanet === "Sun")) continue;
    if ((targetClassical === "Moon" && otherPlanet === "Mercury") || (targetClassical === "Mercury" && otherPlanet === "Moon")) continue;

    if (otherHouse === vedhaHouse) {
      return { isObstructed: true, obstructedBy: otherPlanet };
    }
  }
  return { isObstructed: false };
}

// ============================================================================
// 3. NEECHA BHANGA RAJA YOGA (DEBILITATION CANCELLATION) GATE
// ============================================================================
const DEBILITATION_RASHI: Record<Exclude<Planet, "Rahu" | "Ketu">, RashiIndex> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
};

const RASHI_LORD: Record<RashiIndex, Exclude<Planet, "Rahu" | "Ketu">> = {
  0: "Mars", 1: "Venus", 2: "Mercury", 3: "Moon", 4: "Sun", 5: "Mercury",
  6: "Venus", 7: "Mars", 8: "Jupiter", 9: "Saturn", 10: "Saturn", 11: "Jupiter",
};

const EXALTATION_LORD_OF_DEBILITATION_SIGN: Record<RashiIndex, Exclude<Planet, "Rahu" | "Ketu">> = {
  6: "Saturn", 7: "Moon", 3: "Jupiter", 11: "Venus", 9: "Mars", 5: "Mercury", 0: "Sun",
  1: "Moon", 2: "Mercury", 4: "Sun", 8: "Jupiter", 10: "Saturn",
};

export function checkNeechaBhanga(
  planetPos: PlanetPosition,
  allPlanets: Partial<Record<Planet | string, PlanetPosition>>,
  lagnaRashi: number | RashiIndex,
  moonRashi: number | RashiIndex
): { isDebilitated: boolean; hasNeechaBhanga: boolean; reason?: string } {
  const normPlanet = normalizePlanetName(planetPos.planet);
  if (normPlanet === "Rahu" || normPlanet === "Ketu") {
    return { isDebilitated: false, hasNeechaBhanga: false };
  }
  const classicalPlanet = normPlanet as Exclude<Planet, "Rahu" | "Ketu">;

  const normRashi = (((Math.floor(planetPos.rashi) % 12) + 12) % 12) as RashiIndex;
  const isDebilitated = normRashi === DEBILITATION_RASHI[classicalPlanet];
  if (!isDebilitated) return { isDebilitated: false, hasNeechaBhanga: false };

  const lagnaR = (((Math.floor(lagnaRashi) % 12) + 12) % 12) as RashiIndex;
  const moonR = (((Math.floor(moonRashi) % 12) + 12) % 12) as RashiIndex;

  const isKendra = (rashi: number, ref: number) => {
    const diff = (((rashi - ref) % 12) + 12) % 12;
    return diff === 0 || diff === 3 || diff === 6 || diff === 9;
  };

  const signLord = RASHI_LORD[normRashi];
  const signLordPos = allPlanets[signLord] || allPlanets[signLord.toLowerCase()];
  const exaltLord = EXALTATION_LORD_OF_DEBILITATION_SIGN[normRashi];
  const exaltLordPos = allPlanets[exaltLord] || allPlanets[exaltLord.toLowerCase()];

  // Rule 1: Dispositor (sign lord) is in Kendra from Lagna or Moon
  if (signLordPos && (isKendra(signLordPos.rashi, lagnaR) || isKendra(signLordPos.rashi, moonR))) {
    return { isDebilitated: true, hasNeechaBhanga: true, reason: `Dispositor ${signLord} in Kendra` };
  }

  // Rule 2: Planet that gets exalted in this sign is in Kendra from Lagna or Moon
  if (exaltLordPos && (isKendra(exaltLordPos.rashi, lagnaR) || isKendra(exaltLordPos.rashi, moonR))) {
    return { isDebilitated: true, hasNeechaBhanga: true, reason: `Exaltation lord ${exaltLord} in Kendra` };
  }

  // Rule 3: Planet is Retrograde (high Chesta Bala cancels weakness)
  if (planetPos.isRetrograde) {
    return { isDebilitated: true, hasNeechaBhanga: true, reason: "Retrograde (Vakri) Chesta Bala override" };
  }

  return { isDebilitated: true, hasNeechaBhanga: false };
}

// ============================================================================
// 4. DEGREE VULNERABILITY (GANDANTA & RASHI SANDHI)
// ============================================================================
export interface DegreeVulnerability {
  isRashiSandhi: boolean; // 0-1 deg or 29-30 deg
  isGandanta: boolean;    // Water-Fire junctions (within 3°20')
  severity: "NONE" | "MODERATE" | "HIGH_KARMIC_KNOT";
}

export function getDegreeVulnerability(rashi: number | RashiIndex, degreeInSign: number): DegreeVulnerability {
  const normRashi = (((Math.floor(rashi) % 12) + 12) % 12) as RashiIndex;
  const deg = Math.max(0, Math.min(29.9999, degreeInSign % 30));
  const isRashiSandhi = deg < 1.0 || deg > 29.0;

  // Water signs ending (Cancer=3, Scorpio=7, Pisces=11) -> >= 26.6667° (final Pada of Ashlesha, Jyeshtha, Revati)
  // Fire signs starting (Aries=0, Leo=4, Sagittarius=8) -> <= 3.3333° (first Pada of Ashwini, Magha, Moola)
  const isWaterEnd = (normRashi === 3 || normRashi === 7 || normRashi === 11) && deg >= 26.6667;
  const isFireStart = (normRashi === 0 || normRashi === 4 || normRashi === 8) && deg <= 3.3333;
  const isGandanta = isWaterEnd || isFireStart;

  return {
    isRashiSandhi,
    isGandanta,
    severity: isGandanta ? "HIGH_KARMIC_KNOT" : isRashiSandhi ? "MODERATE" : "NONE",
  };
}

// ============================================================================
// 5. DASHA CHIDRA & DASHA SANDHI DETECTOR
// ============================================================================
export function getDashaTransitionStatus(
  mdStartDate: Date,
  mdEndDate: Date,
  targetDate: Date
): { isDashaChidra: boolean; isDashaSandhi: boolean; alertLevel: "NORMAL" | "HIGH_TRANSITION" } {
  const totalMs = mdEndDate.getTime() - mdStartDate.getTime();
  const remainingMs = mdEndDate.getTime() - targetDate.getTime();
  const elapsedMs = targetDate.getTime() - mdStartDate.getTime();
  const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;

  const isDashaChidra = remainingMs > 0 && remainingMs <= totalMs * 0.1; // Final 10% of Mahadasha
  const isDashaSandhi = Math.abs(remainingMs) <= sixMonthsMs || Math.abs(elapsedMs) <= sixMonthsMs;

  return {
    isDashaChidra,
    isDashaSandhi,
    alertLevel: isDashaChidra || isDashaSandhi ? "HIGH_TRANSITION" : "NORMAL",
  };
}

// ============================================================================
// 6. THE 3-GATE EVENT VALIDATOR (Zero-Hallucination Prediction Engine)
// ============================================================================
export interface ThreeGateInput {
  natalPromiseScore: number;         // 0 to 100 (from D-1 + D-9)
  isDashaOrNakshatraActive: boolean; // MD, AD, or their Nakshatra Lord connects to target house
  isDoubleTransitActive: boolean;    // Saturn + Jupiter simultaneously aspect/transit target house
  transitPlanetBAV: number;          // 0 to 8 (Bhinna Ashtakavarga of transiting benefic/Saturn)
  isVedhaObstructed: boolean;        // From hasGocharaVedha()
}

export type PredictionConfidence = "SUPPRESS" | "MODERATE_EFFORT" | "HIGH_CERTAINTY";

export function evaluateThreeGatePrediction(input: ThreeGateInput): {
  confidence: PredictionConfidence;
  gatesPassed: number;
  summaryTag: string;
} {
  const gate1 = input.natalPromiseScore >= 50;
  const gate2 = input.isDashaOrNakshatraActive;
  const gate3 = input.isDoubleTransitActive && input.transitPlanetBAV >= 4 && !input.isVedhaObstructed;

  const gatesPassed = [gate1, gate2, gate3].filter(Boolean).length;

  if (gatesPassed === 3) {
    return { confidence: "HIGH_CERTAINTY", gatesPassed, summaryTag: "SOVEREIGN_FRUITION" };
  }
  if (gatesPassed === 2 && gate1) {
    return { confidence: "MODERATE_EFFORT", gatesPassed, summaryTag: "DELAYED_OR_EFFORT_REQUIRED" };
  }
  return { confidence: "SUPPRESS", gatesPassed, summaryTag: "DO_NOT_PREDICT" };
}

// ============================================================================
// 7. "HOW DID IT KNOW THAT?" PAST-EVENT VERIFICATION GENERATOR (SALES ENGINE)
// ============================================================================
export interface PastVerificationInput {
  pastAntardashaLord: Planet;
  pastAntardashaHouse: number; // Bhava Chalit house ruled/occupied
  pastPeriodLabel: string;     // e.g., "Aug 2024 – Nov 2025"
  maandiHouse: number;         // 1 to 12
  wasSadeSatiOrAshtamaShani: boolean;
}

export interface PastVerificationHook {
  periodLabel: string;
  headlineKey: string;
  mathematicalProof: string;
}

export function generatePastEventVerification(input: PastVerificationInput): PastVerificationHook[] {
  const hooks: PastVerificationHook[] = [];

  // Hook 1: Maandi 99% Last-Mile Knot Proof
  const maandiDomainMap: Record<number, string> = {
    1: "HEALTH_OR_ENERGY_DIP_AT_CRITICAL_MOMENT",
    2: "STALLED_SAVINGS_OR_FAMILY_FRICTION",
    5: "DECISION_PARALYSIS_OR_EDUCATION_DELAY",
    7: "PARTNERSHIP_OR_MARRIAGE_MISTRUST",
    8: "SUDDEN_UNEXPECTED_EXPENSE_OR_ANXIETY",
    10: "CAREER_OR_DEAL_CANCELLED_AT_99_PERCENT",
    11: "BLOCKED_PAYMENTS_OR_DELAYED_GAINS",
  };

  hooks.push({
    periodLabel: input.pastPeriodLabel,
    headlineKey: maandiDomainMap[input.maandiHouse] || "LAST_MINUTE_KARMIC_DELAY",
    mathematicalProof: `Maandi in House ${input.maandiHouse} triggered during ${input.pastAntardashaLord} Antardasha (House ${input.pastAntardashaHouse}).`,
  });

  // Hook 2: Saturn Transit / Dasha Pressure Proof
  if (input.wasSadeSatiOrAshtamaShani) {
    hooks.push({
      periodLabel: input.pastPeriodLabel,
      headlineKey: "HEAVY_MENTAL_LOAD_AND_UNRECOGNIZED_EFFORT",
      mathematicalProof: "Active Saturn Sade Sati / Ashtama Shani pressure verified over the last 24 months.",
    });
  }

  return hooks;
}

// ============================================================================
// 8. LIVE TODAY'S TARABALA & CHANDRASHTAMA (TABLE-SIDE PSYCHIC HOOK)
// ============================================================================
export interface LiveTodayTarabalaOutput {
  taraNumber: TaraNumber;
  taraName: string;
  score: number;
  isFavourable: boolean;
  isDifficult: boolean;
  isChandrashtama: boolean;
  transitMoonRashi: number;
  transitMoonNakshatra: number;
  headline: string;
  energyBadge: string;
  guidanceText: string;
  chandrashtamaAlert?: string;
}

export const TARA_NAMES_7L: Record<TaraNumber, Record<string, { name: string; desc: string; badge: string }>> = {
  1: {
    kn: { name: "ಜನ್ಮ ತಾರೆ", desc: "ದೇಹ-ಮನಸ್ಸಿನ ವಿಶ್ರಾಂತಿ & ಎಚ್ಚರಿಕೆಯ ದಿನ", badge: "ಧ್ಯಾನ & ಸಮಾಧಾನ" },
    en: { name: "Janma Tara", desc: "Mind-Body Poise & Reflective Rest", badge: "Rest & Equilibrium" },
    hi: { name: "जन्म तारा", desc: "आत्म-चिंतन एवं सावधानी का दिवस", badge: "संयम एवं विश्राम" },
    mr: { name: "जन्म तारा", desc: "आत्मचिंतन व सावधगिरीचा दिवस", badge: "शांतता व विश्रांती" },
    te: { name: "జన్మ తార", desc: "శరీర-మనస్సుల విశ్రాంతి & జాగరూకత", badge: "విశ్రాంతి & ప్రశాంతత" },
    ta: { name: "ஜென்ம தாரை", desc: "மன அமைதி மற்றும் விழிப்புணர்வு நாள்", badge: "விழிப்புணர்வு" },
    ml: { name: "ജന്മ താര", desc: "ശരീര-മനസ്സുകളുടെ വിശ്രമം & ജാഗ്രത", badge: "ശാന്തത" }
  },
  2: {
    kn: { name: "ಸಂಪತ್ ತಾರೆ", desc: "ಧನ ಲಾಭ, ಹೊಸ ಅವಕಾಶ & ವ್ಯಾಪಾರ ಸಿದ್ಧಿ", badge: "ಧನ ಸಮೃದ್ಧಿ ಯೋಗ" },
    en: { name: "Sampat Tara", desc: "Financial Inflow, New Opportunities & Gains", badge: "Wealth Inflow" },
    hi: { name: "सम्पत तारा", desc: "धन लाभ, नवीन अवसर एवं व्यापार सिद्धि", badge: "धन वृद्धि योग" },
    mr: { name: "संपत तारा", desc: "धनलाभ, नवीन संधी व व्यावसायिक यश", badge: "आर्थिक यश" },
    te: { name: "సంపత్ తార", desc: "ధన లాభం, నూతన అవకాశాలు & శుభం", badge: "ధన లాభం" },
    ta: { name: "சம்பத் தாரை", desc: "தன லாபம், புதிய வாய்ப்புகள் & வெற்றி", badge: "தன லாபம்" },
    ml: { name: "സമ്പത് താര", desc: "ധനലാഭം, പുതിയ അവസരങ്ങൾ & അഭിവൃദ്ധി", badge: "ഐശ്വര്യം" }
  },
  3: {
    kn: { name: "ವಿಪತ್ ತಾರೆ", desc: "ಅನಗತ್ಯ ವಾದ-ವಿವಾದ ತಪ್ಪಿಸಿ, ತಾಳ್ಮೆ ಅಗತ್ಯ", badge: "ತಾಳ್ಮೆಯ ರಕ್ಷಣೆ" },
    en: { name: "Vipat Tara", desc: "Avoid Hasty Moves & Exercise Patience", badge: "Exercise Caution" },
    hi: { name: "विपत तारा", desc: "विवादों से बचें, धैर्य एवं संयम आवश्यक", badge: "धैर्य आवश्यक" },
    mr: { name: "विपत तारा", desc: "वाद टाळा, संयम व संयमी निर्णय आवश्यक", badge: "संयम ठेवा" },
    te: { name: "విపత్ తార", desc: "వాదోపవాదాలకు దూరంగా ఉండండి, సహనం ముఖ్యం", badge: "నిதானం" },
    ta: { name: "விபத் தாரை", desc: "வீண் வாக்குவாதங்களைத் தவிர்க்கவும், பொறுமை அவசியம்", badge: "பொறுமை" },
    ml: { name: "വിപത് താര", desc: "തർക്കങ്ങൾ ഒഴിവാക്കുക, ക്ഷമ പാലിക്കുക", badge: "ജാഗ്രത" }
  },
  4: {
    kn: { name: "ಕ್ಷೇಮ ತಾರೆ", desc: "ಕುಟುಂಬ ನೆಮ್ಮದಿ, ರಕ್ಷಣೆ & ಆನಂದದಾಯಕ ಭೋಜನ", badge: "ಕ್ಷೇಮ & ರಕ್ಷಣೆ" },
    en: { name: "Kshema Tara", desc: "Family Harmony, Protection & Joyful Dining", badge: "Auspicious Safety" },
    hi: { name: "क्षेम तारा", desc: "पारिवारिक सुख, सुरक्षा एवं आनंदमय समय", badge: "कल्याणकारी" },
    mr: { name: "क्षेम तारा", desc: "कौटुंबिक शांतता, संरक्षण व आनंदी भोजन", badge: "कौटुंबिक सुख" },
    te: { name: "క్షేమ తార", desc: "కుటుంబ శాంతి, రక్షణ & ఆనందం", badge: "క్షేమకరం" },
    ta: { name: "க்ஷேம தாரை", desc: "குடும்ப அமைதி, பாதுகாப்பு & மகிழ்ச்சி", badge: "நலமான நாள்" },
    ml: { name: "ക്ഷേമ താര", desc: "കുടുംബ സമാധാനം, സംരക്ഷണം & സന്തോഷം", badge: "ക്ഷേമം" }
  },
  5: {
    kn: { name: "ಪ್ರತ್ಯಕ್ ತಾರೆ", desc: "ಅಡೆತಡೆಗಳ ನಿವಾರಣೆಗೆ ಶ್ರಮಿಸಿ, ರಿಸ್ಕ್ ಬೇಡ", badge: "ಮಧ್ಯಮ ಬಲ" },
    en: { name: "Pratyak Tara", desc: "Moderate Obstacles, Defer Critical Risks", badge: "Patience Required" },
    hi: { name: "प्रत्यक तारा", desc: "अवरोध निवारण का दिन, जोखिम टालें", badge: "सावधानी" },
    mr: { name: "प्रत्यक तारा", desc: "अडथळे दूर करण्याचा दिवस, धोका पत्करणे टाळा", badge: "दक्षता" },
    te: { name: "ప్రత్యక్ తార", desc: "అడ్డంకులు తొలగించే సమయం, రిస్క్ వద్దు", badge: "నిదానం" },
    ta: { name: "பிரத்யக் தாரை", desc: "தடைகளைத் தவிர்க்கவும், ஆபத்தான முயற்சிகள் வேண்டாம்", badge: "கவனம்" },
    ml: { name: "പ്രത്യക് താര", desc: "തടസ്സങ്ങൾ മാറ്റാനുള്ള സമയം, അപകടങ്ങൾ ഒഴിവാക്കുക", badge: "സൂക്ഷ്മത" }
  },
  6: {
    kn: { name: "ಸಾಧನಾ ತಾರೆ", desc: "ಯಶಸ್ವಿ ಕೆಲಸಗಳು, ಗುರಿ ಸಾಧನೆ & ನಾಯಕತ್ವ", badge: "ವಿಜಯ ಸಿದ್ಧಿ" },
    en: { name: "Sadhana Tara", desc: "Goal Accomplishment, Success & Milestone Triumphs", badge: "Success Energy" },
    hi: { name: "साधना तारा", desc: "कार्य सिद्धि, लक्ष्य प्राप्ति एवं सफलता", badge: "विजय योग" },
    mr: { name: "साधना तारा", desc: "कार्यसिद्धी, ध्येयपूर्ती व नेतृत्व", badge: "ध्येयसिद्धी" },
    te: { name: "సాధన తార", desc: "కార్యసిద్ధి, లక్ష్య సాధన & విజయం", badge: "విజయవంతం" },
    ta: { name: "சாதனா தாரை", desc: "காரிய சித்தி, இலக்கு அடைதல் & வெற்றி", badge: "வெற்றி நாள்" },
    ml: { name: "സാധന താര", desc: "കാര്യസിദ്ധി, ലക്ഷ്യപ്രാപ്തി & ഉന്നത വിജയം", badge: "വിജയം" }
  },
  7: {
    kn: { name: "ನೈಧನ ತಾರೆ", desc: "ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ದಿನ, ಶಿವ-ದುರ್ಗಾ ಆರಾಧನೆ ಮಾಡಿ", badge: "ದೈವಾರಾಧನೆ ಅವಶ್ಯ" },
    en: { name: "Naidhana Tara", desc: "Delicate Transit, Invoke Lord Shiva & Stay Calm", badge: "Spiritual Poise" },
    hi: { name: "नैधन तारा", desc: "संवेदनशील दिवस, शिव आराधना से शांति", badge: "शांति प्रार्थना" },
    mr: { name: "नैधन तारा", desc: "अत्यंत संवेदनशील दिवस, शिवोपासना करा", badge: "शिवस्मरण" },
    te: { name: "నైధన తార", desc: "సున్నితమైన సమయం, శివారాధన మేలు", badge: "శివారాధన" },
    ta: { name: "நைதன தாரை", desc: "கவனமான நாள், சிவ வழிபாடு நன்று", badge: "தெய்வ வழிபாடு" },
    ml: { name: "നൈധന താര", desc: "ശ്രദ്ധയോടുകൂടിയ ദിവസം, ശിവ ഭജനം ഉത്തമം", badge: "പ്രാർത്ഥന" }
  },
  8: {
    kn: { name: "ಮಿತ್ರ ತಾರೆ", desc: "ಸ್ನೇಹಿತರ ಸಹಕಾರ, ಸಂತೋಷ ಕೂಟ & ಶುಭ ವಾರ್ತೆ", badge: "ಸ್ನೇಹ-ಸೌಹಾರ್ದ" },
    en: { name: "Mitra Tara", desc: "Warm Camaraderie, Good News & Cooperative Energy", badge: "Harmonious" },
    hi: { name: "मित्र तारा", desc: "मित्रों का सहयोग, शुभ समाचार एवं सौहार्द", badge: "मित्र लाभ" },
    mr: { name: "मित्र तारा", desc: "मित्रांचे सहकार्य, शुभ वार्ता व आनंद", badge: "मित्र साह्य" },
    te: { name: "మిత్ర తార", desc: "స్నేహితుల సహకారం, శుభవార్తలు & సంతోషం", badge: "మిత్ర లాభం" },
    ta: { name: "மித்ர தாரை", desc: "நண்பர்கள் ஆதரவு, சுப செய்தி & மகிழ்ச்சி", badge: "நட்பு ஆதரவு" },
    ml: { name: "മിത്ര താര", desc: "സുഹൃത്തുക്കളുടെ സഹായം, നല്ല വാർത്തകൾ", badge: "സൗഹൃദം" }
  },
  9: {
    kn: { name: "ಪರಮ ಮಿತ್ರ ತಾರೆ", desc: "ಸರ್ವೋತ್ಕೃಷ್ಟ ಭಾಗ್ಯೋದಯ, ದೈವಿಕ ಆಶೀರ್ವಾದ & ಸಂಭ್ರಮ", badge: "ಪರಮ ಕೃಪೆ" },
    en: { name: "Parama Mitra Tara", desc: "Supreme Divine Blessing, Peak Fortune & Auspicious Harmony", badge: "Supreme Grace" },
    hi: { name: "परम मित्र तारा", desc: "सर्वश्रेष्ठ भाग्योदय, ईश्वरीय कृपा एवं उत्सव", badge: "परम कृपा" },
    mr: { name: "परम मित्र तारा", desc: "सर्वोत्कृष्ट भाग्योदय, दैवी कृपा व यश", badge: "महाभाग्य" },
    te: { name: "పరమ మిత్ర తార", desc: "సర్వోత్కృష్ట భాగ్యోదయం & దైవ కృప", badge: "పరమ శుభం" },
    ta: { name: "பரம மித்ர தாரை", desc: "உன்னத பாக்கியம், தெய்வ அருள் & வெற்றி", badge: "மகா பாக்கியம்" },
    ml: { name: "പരമ മിത്ര താര", desc: "സർവ്വോൽകൃഷ്ട ഭാഗ്യോദയം, ഈശ്വരാനുഗ്രഹം", badge: "പരമ ഭാഗ്യം" }
  }
};

export const CHANDRASHTAMA_ALERTS_7L: Record<string, string> = {
  kn: "⚠️ ಇಂದು ಚಂದ್ರಾಷ್ಟಮ ಪ್ರಭಾವ: ಹೊಸ ಒಪ್ಪಂದಗಳಿಗೆ ಅವಸರ ಬೇಡ, ಶಾಂತಚಿತ್ತದಿಂದ ಇರಿ.",
  en: "⚠️ Active Chandrashtama Today: Avoid emotional decisions & stay serene.",
  hi: "⚠️ आज चंद्राष्टम प्रभाव: भावुक निर्णयों से बचें, शांत मन रखें।",
  mr: "⚠️ आज चंद्राष्टम प्रभाव: घाईगडबडीत निर्णय घेणे टाळा, शांत राहा.",
  te: "⚠️ నేడు చంద్రాష్టమ ప్రభావం: భావోద్వేగ నిర్ణయాలు వద్దు, ప్రశాంతంగా ఉండండి.",
  ta: "⚠️ இன்று சந்திராஷ்டமம்: உணர்ச்சிவசப்பட்டு முடிவுகள் எடுப்பதைத் தவிர்க்கவும்.",
  ml: "⚠️ ഇന്ന് ചന്ദ്രാഷ്ടമ പ്രഭാവം: വൈകാരിക തീരുമാനങ്ങൾ ഒഴിവാക്കുക."
};

export function calculateLiveTodayTarabalaAndChandrashtama(
  natalMoonNakshatra: number,
  natalMoonRashi: number,
  now = new Date(),
  lang = "kn"
): LiveTodayTarabalaOutput {
  const longs = siderealLongitudes(now, "lahiri");
  const transitMoonLon = longs.moon ?? 0;
  const transitMoonRashi = Math.floor(transitMoonLon / 30) % 12;
  const transitMoonNakshatra = Math.floor(transitMoonLon / (360 / 27)) % 27;

  const taraResult = calculateTaraBala(natalMoonNakshatra, transitMoonNakshatra);
  const chandraResult = calculateChandraBala(natalMoonRashi, transitMoonRashi);

  const langKey = TARA_NAMES_7L[taraResult.tara]?.[lang] ? lang : "kn";
  const taraMeta = TARA_NAMES_7L[taraResult.tara][langKey];
  const isChandrashtama = chandraResult.isChandrashtama;
  const chandrashtamaAlert = isChandrashtama ? (CHANDRASHTAMA_ALERTS_7L[langKey] || CHANDRASHTAMA_ALERTS_7L.en) : undefined;

  const headline = `${taraMeta.name} (${taraResult.score}% ${langKey === "kn" ? "ಶುಭ ಬಲ" : langKey === "hi" ? "शुभ बल" : "Support"})`;

  return {
    taraNumber: taraResult.tara,
    taraName: taraMeta.name,
    score: taraResult.score,
    isFavourable: taraResult.isFavourable,
    isDifficult: taraResult.isDifficult,
    isChandrashtama,
    transitMoonRashi,
    transitMoonNakshatra,
    headline,
    energyBadge: taraMeta.badge,
    guidanceText: taraMeta.desc,
    chandrashtamaAlert
  };
}
