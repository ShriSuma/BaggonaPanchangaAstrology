/**
 * DashaSandhiAndRoadmapEngine.ts
 * 
 * 100% Authentic Vedic Parashari Engine for:
 * 1. Dasha-Bhukti Sandhi Alert (ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ ಎಚ್ಚರಿಕೆ)
 *    - Detects critical Mahadasha transitions:
 *      * Rahu - Brihaspati Sandhi (ರಾಹು-ಬೃಹಸ್ಪತಿ ಸಂಧಿ)
 *      * Kuja - Rahu Sandhi (ಕುಜ-ರಾಹು ಸಂಧಿ)
 *      * Shukraditya Sandhi (ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿ - ವಿಶೇಷವಾಗಿ ಸ್ತ್ರೀಯರಿಗೆ)
 *      * Shani - Budha, Guru - Shani, Budha - Ketu, Ketu - Shukra, Surya - Chandra, Chandra - Kuja.
 *    - Calculates exact days remaining / countdown, start/end dates, alert severity, and Gokarna remedies.
 * 2. Next 2 Bhuktis Deep Roadmap (ಮುಂದಿನ 2 ಭುಕ್ತಿಗಳ ಫಲಿತ & ನಿರೀಕ್ಷೆ)
 *    - Provides a full roadmap covering the current Bhukti plus the next 2 consecutive Bhuktis (at least 2+ years).
 *    - Computes exact duration in days and months, days remaining / days until start.
 *    - Parashari Maitri (Mitra/Shatru/Sama), house distance (Kendra, Trikona, Shadashtaka 6-8, Dwidwadasa 2-12).
 *    - Janma Lagna Bhava lordship of Bhukti lord (e.g. 2nd Dhana, 7th Kalatra, 10th Karma).
 *    - Dynamic, 100% Parashari predictions for Career, Finances, Family/Marriage, Health, Precautions, and Gokarna Parihara.
 */

import { PlanetName, type KundliOutput } from "./AstroTypes";
import {
  generateDashaTimeline,
  generateBhuktiTimeline,
  type BhuktiSpan,
  type DashaEntry
} from "./DashaBhuktiEngine";
import {
  toKannadaPlanet,
  toKannadaRashi
} from "../utils/kannadaAstrologyTerms";

export type SandhiType =
  | "rahu_jupiter"
  | "mars_rahu"
  | "venus_sun"
  | "jupiter_saturn"
  | "saturn_mercury"
  | "mercury_ketu"
  | "ketu_venus"
  | "sun_moon"
  | "moon_mars"
  | "general_sandhi";

export interface DashaSandhiAlert {
  sandhiCode: SandhiType;
  titleKn: string;
  titleEn: string;
  badgeKn: string;
  badgeEn: string;
  status: "active" | "upcoming";
  alertLevel: "critical" | "high" | "moderate";
  isSpecialForWomen: boolean;
  outgoingPlanet: PlanetName;
  outgoingPlanetKn: string;
  outgoingPlanetEn: string;
  incomingPlanet: PlanetName;
  incomingPlanetKn: string;
  incomingPlanetEn: string;
  startDateStr: string;
  endDateStr: string;
  daysRemainingOrUntil: number;
  totalDurationDays: number;
  durationFormattedKn: string;
  durationFormattedEn: string;
  descriptionKn: string;
  descriptionEn: string;
  warningSymptomsKn: string[];
  warningSymptomsEn: string[];
  recommendedShantiRemediesKn: string[];
  recommendedShantiRemediesEn: string[];
  gokarnaSevaKn: string;
  gokarnaSevaEn: string;
}

export interface BhuktiForecastItem {
  index: number; // 0: current, 1: next bhukti 1, 2: next bhukti 2
  isCurrent: boolean;
  mahaPlanet: PlanetName;
  mahaPlanetKn: string;
  mahaPlanetEn: string;
  bhuktiPlanet: PlanetName;
  bhuktiPlanetKn: string;
  bhuktiPlanetEn: string;
  titleKn: string;
  titleEn: string;
  startAge: number;
  endAge: number;
  startDateStr: string;
  endDateStr: string;
  totalDays: number;
  daysCountFormattedKn: string;
  daysCountFormattedEn: string;
  statusCountdownKn: string;
  statusCountdownEn: string;
  
  // Astrological Parashari Dynamics
  relationship: "mitra" | "shatru" | "sama";
  relationshipKn: string;
  relationshipEn: string;
  houseDistance: number;
  houseDistanceLabelKn: string;
  houseDistanceLabelEn: string;
  bhuktiLordHousesKn: string;
  bhuktiLordHousesEn: string;
  bhuktiLordPlacementKn: string;
  bhuktiLordPlacementEn: string;

  // 100% Dynamic Parashari Forecast
  overallNature: "highly_auspicious" | "auspicious" | "challenging" | "turbulent" | "mixed_growth";
  headlineKn: string;
  headlineEn: string;
  whatToExpectOverviewKn: string;
  whatToExpectOverviewEn: string;
  careerProspectsKn: string;
  careerProspectsEn: string;
  financialProspectsKn: string;
  financialProspectsEn: string;
  familyMarriageProspectsKn: string;
  familyMarriageProspectsEn: string;
  healthMindProspectsKn: string;
  healthMindProspectsEn: string;
  precautionsKn: string;
  precautionsEn: string;
  gokarnaPariharaKn: string;
  gokarnaPariharaEn: string;
}

export interface DashaSandhiAndRoadmapOutput {
  activeSandhiAlert: DashaSandhiAlert | null;
  upcomingSandhiAlert: DashaSandhiAlert | null;
  primarySandhiDisplay: DashaSandhiAlert;
  currentBhukti: BhuktiForecastItem;
  nextBhukti1: BhuktiForecastItem;
  nextBhukti2: BhuktiForecastItem;
  roadmapList: BhuktiForecastItem[];
}

export interface DevoteeContextForSandhi {
  birthDate: string;
  birthTime?: string;
  gender?: "Male" | "Female" | string;
  devoteeName?: string;
  referenceDate?: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function calculateDecimalAgeAtDate(birthDate: string, targetDate: Date = new Date()): number {
  const bDate = new Date(birthDate);
  if (isNaN(bDate.getTime())) return 30.0;
  const msDiff = targetDate.getTime() - bDate.getTime();
  return Math.max(0, msDiff / (365.2425 * 24 * 60 * 60 * 1000));
}

export function formatDateFromDecimalAge(birthDate: string, ageYears: number): string {
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

export function formatDurationInDaysAndMonths(totalDays: number): { kn: string; en: string } {
  if (totalDays <= 0) return { kn: "0 ದಿನಗಳು", en: "0 days" };
  const months = Math.floor(totalDays / 30.4375);
  const remDays = Math.round(totalDays % 30.4375);
  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (years > 0) {
    const kn = `${totalDays} ದಿನಗಳು (${years} ವರ್ಷ ${remMonths > 0 ? `${remMonths} ತಿಂಗಳು ` : ""}${remDays > 0 ? `${remDays} ದಿನಗಳು` : ""})`.trim();
    const en = `${totalDays} days (${years} yr ${remMonths > 0 ? `${remMonths} mo ` : ""}${remDays > 0 ? `${remDays} days` : ""})`.trim();
    return { kn, en };
  }
  if (months > 0) {
    const kn = `${totalDays} ದಿನಗಳು (${months} ತಿಂಗಳು ${remDays > 0 ? `${remDays} ದಿನಗಳು` : ""})`.trim();
    const en = `${totalDays} days (${months} mo ${remDays > 0 ? `${remDays} days` : ""})`.trim();
    return { kn, en };
  }
  return {
    kn: `${totalDays} ದಿನಗಳು`,
    en: `${totalDays} days`
  };
}

// ---------------------------------------------------------------------------
// Parashara Natural Relationships & Lagna Rulerships
// ---------------------------------------------------------------------------

const NATURAL_FRIENDS: Record<PlanetName, PlanetName[]> = {
  [PlanetName.Sun]: [PlanetName.Moon, PlanetName.Mars, PlanetName.Jupiter],
  [PlanetName.Moon]: [PlanetName.Sun, PlanetName.Mercury],
  [PlanetName.Mars]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Jupiter],
  [PlanetName.Mercury]: [PlanetName.Sun, PlanetName.Venus],
  [PlanetName.Jupiter]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars],
  [PlanetName.Venus]: [PlanetName.Mercury, PlanetName.Saturn],
  [PlanetName.Saturn]: [PlanetName.Mercury, PlanetName.Venus],
  [PlanetName.Rahu]: [PlanetName.Mercury, PlanetName.Venus, PlanetName.Saturn],
  [PlanetName.Ketu]: [PlanetName.Mars, PlanetName.Venus, PlanetName.Saturn]
};

const NATURAL_ENEMIES: Record<PlanetName, PlanetName[]> = {
  [PlanetName.Sun]: [PlanetName.Venus, PlanetName.Saturn],
  [PlanetName.Moon]: [],
  [PlanetName.Mars]: [PlanetName.Mercury],
  [PlanetName.Mercury]: [PlanetName.Moon],
  [PlanetName.Jupiter]: [PlanetName.Mercury, PlanetName.Venus],
  [PlanetName.Venus]: [PlanetName.Sun, PlanetName.Moon],
  [PlanetName.Saturn]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars],
  [PlanetName.Rahu]: [PlanetName.Sun, PlanetName.Moon, PlanetName.Mars],
  [PlanetName.Ketu]: [PlanetName.Sun, PlanetName.Moon]
};

export function getNaturalRelationship(planet1: PlanetName, planet2: PlanetName): "mitra" | "shatru" | "sama" {
  if (planet1 === planet2) return "mitra";
  const friends = NATURAL_FRIENDS[planet1] || [];
  const enemies = NATURAL_ENEMIES[planet1] || [];
  if (friends.includes(planet2)) return "mitra";
  if (enemies.includes(planet2)) return "shatru";
  return "sama";
}

const SIGNS_RULED_BY_PLANET: Record<PlanetName, number[]> = {
  [PlanetName.Sun]: [4], // Leo (Simha)
  [PlanetName.Moon]: [3], // Cancer (Karka)
  [PlanetName.Mars]: [0, 7], // Aries (Mesha), Scorpio (Vrischika)
  [PlanetName.Mercury]: [2, 5], // Gemini (Mithuna), Virgo (Kanya)
  [PlanetName.Jupiter]: [8, 11], // Sagittarius (Dhanu), Pisces (Meena)
  [PlanetName.Venus]: [1, 6], // Taurus (Vrishabha), Libra (Tula)
  [PlanetName.Saturn]: [9, 10], // Capricorn (Makara), Aquarius (Kumbha)
  [PlanetName.Rahu]: [10], // Co-ruler Aquarius
  [PlanetName.Ketu]: [7] // Co-ruler Scorpio
};

const BHAVA_NAMES_KN: Record<number, string> = {
  1: "1ನೇ ತನು (ಲಗ್ನ)",
  2: "2ನೇ ಧನ-ಕುಟುಂಬ",
  3: "3ನೇ ಭ್ರಾತೃ-ಸಾಹಸ",
  4: "4ನೇ ಸುಖ-ಮಾತೃ-ಆಸ್ತಿ",
  5: "5ನೇ ಪುತ್ರ-ಬುದ್ಧಿ-ಪೂರ್ವಪುಣ್ಯ",
  6: "6ನೇ ಶತ್ರು-ರೋಗ-ಋಣ",
  7: "7ನೇ ಕಳತ್ರ-ದಾಂಪತ್ಯ-ಪಾಲುದಾರಿಕೆ",
  8: "8ನೇ ಆಯುಷ್ಯ-ಅಷ್ಟಮ-ಸಂಕಟ",
  9: "9ನೇ ಭಾಗ್ಯ-ಧರ್ಮ-ಪಿತೃ",
  10: "10ನೇ ಕರ್ಮ-ಉದ್ಯೋಗ-ಪದವಿ",
  11: "11ನೇ ಲಾಭ-ಆದಾಯ-ಸಿದ್ಧಿ",
  12: "12ನೇ ವ್ಯಯ-ಮೋಕ್ಷ-ವಿದೇಶ"
};

const BHAVA_NAMES_EN: Record<number, string> = {
  1: "1st House (Lagna / Vitality)",
  2: "2nd House (Dhana / Wealth & Family)",
  3: "3rd House (Bhratri / Courage & Initiative)",
  4: "4th House (Sukha / Assets & Peace)",
  5: "5th House (Putra / Intellect & Destiny)",
  6: "6th House (Shatru / Debts & Competition)",
  7: "7th House (Kalatra / Marriage & Partnership)",
  8: "8th House (Ayushya / Vulnerability & Crisis)",
  9: "9th House (Bhagya / Fortune & Dharma)",
  10: "10th House (Karma / Profession & Status)",
  11: "11th House (Labha / Income & Aspirations)",
  12: "12th House (Vyaya / Expenses & Liberation)"
};

export function getBhuktiLordHouses(
  planet: PlanetName,
  lagnaIndex: number
): { housesKn: string; housesEn: string; houseNumbers: number[] } {
  const signs = SIGNS_RULED_BY_PLANET[planet] || [];
  const houseNumbers = signs.map((sIdx) => ((sIdx - lagnaIndex + 12) % 12) + 1);
  const housesKn = houseNumbers.map((h) => BHAVA_NAMES_KN[h] || `${h}ನೇ ಭಾವ`).join(" ಮತ್ತು ") + " ಸ್ಥಾನಗಳ ಅಧಿಪತಿ";
  const housesEn = "Lord of " + houseNumbers.map((h) => BHAVA_NAMES_EN[h] || `${h}th House`).join(" & ");
  return { housesKn, housesEn, houseNumbers };
}

// ---------------------------------------------------------------------------
// 1. Dasha-Bhukti Sandhi Alert Engine
// ---------------------------------------------------------------------------

export function detectDashaSandhiAlert(
  kundli: KundliOutput,
  context: DevoteeContextForSandhi
): { activeAlert: DashaSandhiAlert | null; upcomingAlert: DashaSandhiAlert | null; primary: DashaSandhiAlert } {
  const refDate = context.referenceDate || new Date();
  const currentAge = calculateDecimalAgeAtDate(context.birthDate, refDate);
  const isFemale = context.gender === "Female";
  const dashaTimeline = generateDashaTimeline(kundli, 120);
  const bhuktiTimeline = generateBhuktiTimeline(kundli, 120);

  // Find active Mahadasha
  const activeMahaIdx = dashaTimeline.findIndex((d) => currentAge >= d.startAge - 1e-6 && currentAge < d.endAge - 1e-6);
  const activeMaha = dashaTimeline[activeMahaIdx] || dashaTimeline[0];
  const nextMaha = dashaTimeline[activeMahaIdx + 1];

  // Find active Bhukti
  const activeBhuktiIdx = bhuktiTimeline.findIndex((b) => currentAge >= b.startAge - 1e-6 && currentAge < b.endAge - 1e-6);
  const activeBhukti = bhuktiTimeline[activeBhuktiIdx] || bhuktiTimeline[0];

  // Helper to map planet pair to Sandhi code
  const getSandhiCode = (outgoing: PlanetName, incoming: PlanetName): SandhiType => {
    if (outgoing === PlanetName.Rahu && incoming === PlanetName.Jupiter) return "rahu_jupiter";
    if (outgoing === PlanetName.Mars && incoming === PlanetName.Rahu) return "mars_rahu";
    if (outgoing === PlanetName.Venus && incoming === PlanetName.Sun) return "venus_sun";
    if (outgoing === PlanetName.Jupiter && incoming === PlanetName.Saturn) return "jupiter_saturn";
    if (outgoing === PlanetName.Saturn && incoming === PlanetName.Mercury) return "saturn_mercury";
    if (outgoing === PlanetName.Mercury && incoming === PlanetName.Ketu) return "mercury_ketu";
    if (outgoing === PlanetName.Ketu && incoming === PlanetName.Venus) return "ketu_venus";
    if (outgoing === PlanetName.Sun && incoming === PlanetName.Moon) return "sun_moon";
    if (outgoing === PlanetName.Moon && incoming === PlanetName.Mars) return "moon_mars";
    return "general_sandhi";
  };

  const createAlertObj = (
    outgoing: PlanetName,
    incoming: PlanetName,
    sandhiStartAge: number,
    sandhiEndAge: number,
    status: "active" | "upcoming"
  ): DashaSandhiAlert => {
    const code = getSandhiCode(outgoing, incoming);
    const outKn = toKannadaPlanet(outgoing);
    const inKn = toKannadaPlanet(incoming);
    const isWomanSpecial = code === "venus_sun" && isFemale;

    const startDateStr = formatDateFromDecimalAge(context.birthDate, sandhiStartAge);
    const endDateStr = formatDateFromDecimalAge(context.birthDate, sandhiEndAge);
    const startD = new Date(startDateStr);
    const endD = new Date(endDateStr);
    const totalDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
    const durationFmt = formatDurationInDaysAndMonths(totalDays);

    let daysRemainingOrUntil = 0;
    if (status === "active") {
      daysRemainingOrUntil = Math.max(0, Math.round((endD.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
    } else {
      daysRemainingOrUntil = Math.max(0, Math.round((startD.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
    }

    let alertLevel: "critical" | "high" | "moderate" = "moderate";
    if (code === "venus_sun") {
      alertLevel = isFemale ? "critical" : "high";
    } else if (code === "mars_rahu" || code === "rahu_jupiter") {
      alertLevel = "critical";
    } else if (code === "jupiter_saturn" || code === "mercury_ketu") {
      alertLevel = "high";
    }

    // Dynamic Title & Badge
    let titleKn = `${outKn}-${inKn} ಸಂಧಿ ಕಾಲ`;
    let titleEn = `${outgoing}-${incoming} Sandhi Phase`;
    let badgeKn = "ಮಹಾದಶಾ ಸಂಧಿ";
    let badgeEn = "Mahadasha Sandhi";

    if (code === "venus_sun") {
      titleKn = "ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿ (ಶುಕ್ರ-ಸೂರ್ಯ ಮಹಾಸಂಧಿ)";
      titleEn = "Shukraditya Sandhi (Venus-Sun Junction)";
      badgeKn = isWomanSpecial ? "ಸ್ತ್ರೀಯರಿಗೆ ಪರಮ ಎಚ್ಚರಿಕೆ" : "ತೀವ್ರ ಪರಿವರ್ತನೆ";
      badgeEn = isWomanSpecial ? "Vital Alert for Women" : "Intense Transition";
    } else if (code === "mars_rahu") {
      titleKn = "ಕುಜ-ರಾಹು ಸಂಧಿ (ಅಗ್ನಿ-ವಿಷ ಸಂಧಿಕಾಲ)";
      titleEn = "Kuja-Rahu Sandhi (Mars-Rahu Volatile Junction)";
      badgeKn = "ಆಕಸ್ಮಿಕ ಅಪಾಯ ಎಚ್ಚರಿಕೆ";
      badgeEn = "Accident & Conflict Alert";
    } else if (code === "rahu_jupiter") {
      titleKn = "ರಾಹು-ಬೃಹಸ್ಪತಿ ಸಂಧಿ (ಮಾಯೆಯಿಂದ ಜ್ಞಾನದ ಕಡೆಗೆ)";
      titleEn = "Rahu-Brihaspati Sandhi (Illusion to Wisdom)";
      badgeKn = "ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಥಿತ್ಯಂತರ";
      badgeEn = "Spiritual & Life Shift";
    }

    // Dynamic Warning Symptoms & Descriptions
    const warningSymptomsKn: string[] = [];
    const warningSymptomsEn: string[] = [];
    const recommendedShantiRemediesKn: string[] = [];
    const recommendedShantiRemediesEn: string[] = [];
    let descriptionKn = "";
    let descriptionEn = "";
    let gokarnaSevaKn = "";
    let gokarnaSevaEn = "";

    if (code === "venus_sun") {
      descriptionKn = isWomanSpecial
        ? `ಸ್ತ್ರೀಯರ ಜಾತಕದಲ್ಲಿ 20 ವರ್ಷಗಳ ಶುಕ್ರ ಮಹಾದಶೆ ಮುಗಿದು 6 ವರ್ಷಗಳ ಸೂರ್ಯ ಮಹಾದಶೆ ಪ್ರವೇಶಿಸುವ ಈ "ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿ" ಕಾಲವು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮವಾಗಿದೆ. ಶುಕ್ರನು ಸ್ತ್ರೀ ಸೌಂದರ್ಯ, ರಕ್ತಪರಿಚಲನೆ, ಹಾರ್ಮೋನ್ ಹಾಗೂ ದಾಂಪತ್ಯ ಸುಖದ ಕಾರಕನಾಗಿದ್ದು, ಸೂರ್ಯನು ಉಗ್ರ ಉಷ್ಣಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಶಾರೀರಿಕ ಹಾರ್ಮೋನ್ ಏರುಪೇರು, ಗರ್ಭಾಶಯ/ಥೈರಾಯ್ಡ್ ಸೂಕ್ಷ್ಮತೆ, ನೇತ್ರದೋಷ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಹಂ ಸಂಘರ್ಷ ಹಾಗೂ ಅತ್ತೆ-ಮಾವಂದಿರೊಂದಿಗಿನ ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತೊಡಕುಗಳು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.`
        : `20 ವರ್ಷಗಳ ಸುಖ-ಭೋಗದ ಶುಕ್ರ ಮಹಾದಶೆಯಿಂದ 6 ವರ್ಷಗಳ ಕಠಿಣ ಕರ್ತವ್ಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಅಧಿಕಾರದ ಸೂರ್ಯ ಮಹಾದಶೆಗೆ ಪಾದಾರ್ಪಣೆ ಮಾಡುವ ಸಂಧಿಕಾಲವಿದು. ಲೌಕಿಕ ಆರಾಮದಿಂದ ಕಠಿಣ ಶಿಸ್ತಿಗೆ ಜೀವನ ಒಗ್ಗಿಕೊಳ್ಳುವಾಗ ದೈಹಿಕ ಉಷ್ಣತೆ, ನೇತ್ರದೋಷ, ಪಿತ್ತ ಹಾಗೂ ಹಿರಿಯರೊಂದಿಗೆ ವೈಮನಸ್ಸು ಉಂಟಾಗಬಹುದು.`;
      descriptionEn = isWomanSpecial
        ? `In a female horoscope, the Shukraditya Sandhi (transition from 20-year Venus to 6-year Sun Dasha) is classically treated as high-alert. Venus governs feminine grace, hormonal balance, uterus, and marital bliss, while Sun is piercing solar heat. The native faces hormonal turbulence, thyroid/uterine sensitivities, eye fatigue, ego friction in marriage, and relationship stress with in-laws.`
        : `Transition from 20-year luxury Venus Dasha into 6-year sovereign Sun Dasha. Moving from comfort to high-stakes duty can trigger solar heat, eye strain, acidity, and authority friction.`;

      if (isWomanSpecial) {
        warningSymptomsKn.push("ಗರ್ಭಾಶಯ, ಮಾಸಿಕ ಸ್ರಾವ ಅಥವಾ ಥೈರಾಯ್ಡ್/ಹಾರ್ಮೋನ್ ಏರುಪೇರುಗಳಿಂದ ದೈಹಿಕ ಆಯಾಸ");
        warningSymptomsKn.push("ದಾಂಪತ್ಯದಲ್ಲಿ ಕ್ಷುಲ್ಲಕ ಮಾತಿಗೂ ಅಹಂ ಸಂಘರ್ಷ ಹಾಗೂ ಅತ್ತೆ-ಮಾವಂದಿರ ಕಡೆಯಿಂದ ಮನಸ್ತಾಪ");
        warningSymptomsKn.push("ಕಣ್ಣುಗಳ ಉರಿತ, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ಮುಖದ ಕಾಂತಿ ಕಡಿಮೆಯಾಗುವ ಭಾವನೆ");
        warningSymptomsEn.push("Hormonal fluctuations, uterine/menstrual irregularities, or thyroid stress");
        warningSymptomsEn.push("Ego clashes with spouse and miscommunication with elders/in-laws");
        warningSymptomsEn.push("Eye strain, sleep disruptions, and sudden bodily fatigue");
      } else {
        warningSymptomsKn.push("ಪಿತ್ತೋದ್ರೇಕ, ನೇತ್ರದೋಷ ಹಾಗೂ ದೈಹಿಕ ಉಷ್ಣತೆ ಹೆಚ್ಚಾಗುವುದು");
        warningSymptomsKn.push("ಉದ್ಯೋಗದಲ್ಲಿ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳು ಅಥವಾ ಸರ್ಕಾರದೊಂದಿಗೆ ಘರ್ಷಣೆ");
        warningSymptomsKn.push("ಹಿಂದಿನ ಆರಾಮದಾಯಕ ಜೀವನಶೈಲಿಯಿಂದ ಕಠಿಣ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಬದಲಾಗುವ ಅನಿವಾರ್ಯತೆ");
        warningSymptomsEn.push("Acidity, eye strain, and elevated body heat");
        warningSymptomsEn.push("Authority friction with seniors, mentors, or government bodies");
        warningSymptomsEn.push("Compulsory transition from comfort to demanding responsibility");
      }

      recommendedShantiRemediesKn.push("ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ವೇಳೆಗೆ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಅರ್ಘ್ಯ ಪ್ರದಾನ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಶುಕ್ರ-ಸೂರ್ಯ ಸಂಧಿ ಶಾಂತಿಗಾಗಿ ಗೋಧಿ ಮತ್ತು ಸಕ್ಕರೆಯನ್ನು ಹಸುವಿಗೆ ತಿನ್ನಿಸಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿ ಶಾಂತಿ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಸಂಕಲ್ಪ ಪೂಜೆ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesEn.push("Recite Aditya Hridaya Stotra at sunrise and offer sacred water arghya");
      recommendedShantiRemediesEn.push("Feed cows with whole wheat and jaggery on Sundays and Fridays");
      recommendedShantiRemediesEn.push("Sponsor Shukraditya Sandhi Shanti and Surya Namaskara Pooja at Sri Kshetra Gokarna Mahabaleshwara");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶುಕ್ರಾಧಿತ್ಯ ಸಂಧಿ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ";
      gokarnaSevaEn = "Shukraditya Sandhi Shanti Sankalpa Pooja at Sri Kshetra Gokarna";
    } else if (code === "mars_rahu") {
      descriptionKn = `7 ವರ್ಷಗಳ ಕುಜ ಮಹಾದಶೆಯಿಂದ 18 ವರ್ಷಗಳ ರಾಹು ಮಹಾದಶೆಗೆ ಕಾಲಿಡುವ ಸಂಧಿಕಾಲವಿದು. ಅಗ್ನಿಕಾರಕ ಕುಜನೊಂದಿಗೆ ಮಾಯಾವಿ ಧೂಮ್ರಕಾರಕ ರಾಹುವಿನ ಪ್ರವೇಶವು ಶಾಸ್ತ್ರದಲ್ಲಿ "ಅಗ್ನಿ-ವಿಷ ಯೋಗ"ಕ್ಕೆ ಸಮಾನವಾಗಿದೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಅವಸರದ ನಿರ್ಧಾರಗಳು, ಕೋಪೋದ್ರೇಕ, ವಾಹನ ಅಪಘಾತಗಳು, ರಕ್ತದೋಷ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (Surgery), ವಂಚನೆಗಳು ಹಾಗೂ ನ್ಯಾಯಾಲಯ/ಪೊಲೀಸ್ ವ್ಯಾಜ್ಯಗಳ ಭೀತಿ ಹೆಚ್ಚಿರುತ್ತದೆ.`;
      descriptionEn = `Transition from 7-year Mars Dasha into 18-year Rahu Dasha. Fire meets shadow smoke ("Agni-Visha Yoga"). Risk of hasty impulses, road mishaps, surgical issues, blood-related strain, deceitful partners, and legal entanglements.`;

      warningSymptomsKn.push("ಅತಿಯಾದ ಕೋಪ, ಅವಸರದ ನಿರ್ಧಾರ ಹಾಗೂ ದುಡುಕಿ ಮಾತಾಡಿ ಸಂಬಂಧ ಹಾಳುಮಾಡಿಕೊಳ್ಳುವುದು");
      warningSymptomsKn.push("ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಅಜಾಗರೂಕತೆ, ರಕ್ತದ ಒತ್ತಡ ಅಥವಾ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಯ ಆತಂಕ");
      warningSymptomsKn.push("ಹಣಕಾಸಿನಲ್ಲಿ ಮೋಸ ಹೋಗುವ ಸಾಧ್ಯತೆ ಅಥವಾ ನಂಬಿದವರಿಂದಲೇ ಬೆನ್ನಿಗೆ ಚೂರಿ");
      warningSymptomsEn.push("Intense temper flare-ups and hasty decisions ruining relationships");
      warningSymptomsEn.push("Vehicle carelessness, blood pressure fluctuations, or surgery risks");
      warningSymptomsEn.push("Financial deceit from untrusted associates or sudden disputes");

      recommendedShantiRemediesKn.push("ಪ್ರತಿದಿನ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಮತ್ತು ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪಿಸಿ");
      recommendedShantiRemediesKn.push("ಮಂಗಳವಾರ ತೊಗರಿಬೇಳೆ ದಾನ ಮಾಡಿ, ರಕ್ತದಾನ ಮಾಡುವುದು ಪರಮ ರಕ್ಷಣೆ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ, ನಾಗ ಶಾಂತಿ ಹಾಗೂ ಕುಜ-ರಾಹು ಸಂಧಿ ಶಾಂತಿ ಪೂಜೆ ಸಮರ್ಪಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Subramanya Ashtakam and Mahamrityunjaya Mantra daily");
      recommendedShantiRemediesEn.push("Donate red lentils on Tuesdays or donate blood for protection");
      recommendedShantiRemediesEn.push("Sponsor Subramanya Homa, Naga Shanti and Kuja-Rahu Sandhi Pooja at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ & ಕುಜ-ರಾಹು ಸಂಧಿ ನಿವಾರಣಾ ಶಾಂತಿ";
      gokarnaSevaEn = "Subramanya Homa & Kuja-Rahu Sandhi Shanti Pooja at Sri Kshetra Gokarna";
    } else if (code === "rahu_jupiter") {
      descriptionKn = `18 ವರ್ಷಗಳ ಸುದೀರ್ಘ ರಾಹು ಮಹಾದಶೆಯು ಮುಕ್ತಾಯಗೊಂಡು 16 ವರ್ಷಗಳ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಮಹಾದಶೆ ಆರಂಭವಾಗುವ ಪವಿತ್ರ ಸಂಧಿಕಾಲವಿದು. ಲೌಕಿಕ ಮಾಯೆ, ಗೊಂದಲ, ತೊಳಲಾಟಗಳಿಂದ ಮುಕ್ತವಾಗಿ ಧರ್ಮ, ಸತ್ಯ ಹಾಗೂ ಗುರುಕೃಪೆಯ ಸುವರ್ಣ ಯುಗಕ್ಕೆ ನೀವು ಪ್ರವೇಶಿಸುತ್ತಿದ್ದೀರಿ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಹಳೆಯ ಕರ್ಮಗಳ ಕಳೆತ, ಹಳೆಯ ಸ್ನೇಹಿತರು/ವ್ಯವಹಾರಗಳಿಂದ ದೂರವಾಗುವುದು, ನೂತನ ಜವಾಬ್ದಾರಿಗಳು ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸ್ಥಿತ್ಯಂತರಗಳು ಜರುಗಲಿವೆ.`;
      descriptionEn = `Exit from 18-year Rahu Dasha into 16-year Jupiter Dasha. Shifting from material delusion and chaos into divine dharma, wisdom, and Guru's grace. Karmic clearing, shedding of old relationships, and spiritual awakening accompany this threshold.`;

      warningSymptomsKn.push("ಮಾನಸಿಕ ದಿಗ್ಭ್ರಮೆ, ಯಾವ ಹಾದಿ ಹಿಡಿಯಬೇಕೆಂಬ ಅನಿಶ್ಚಿತತೆ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆ");
      warningSymptomsKn.push("ಹಳೆಯ ವ್ಯಾಪಾರ, ವೃತ್ತಿ ಅಥವಾ ಮನೆ-ಜಾಗ ಬದಲಾವಣೆಯ ತೀವ್ರ ಒತ್ತಡ");
      warningSymptomsKn.push("ಲಿವರ್, ಜೀರ್ಣಾಂಗ ಅಥವಾ ಶರೀರದಲ್ಲಿ ಆಲಸ್ಯ ಹಾಗೂ ಶಕ್ತಿಗುಂದಿದ ಅನುಭವ");
      warningSymptomsEn.push("Mental disorientation, lack of direction, and sleep disturbance");
      warningSymptomsEn.push("Compelling urge to relocate residence or pivot career trajectory");
      warningSymptomsEn.push("Liver/digestive sensitivity and sudden lethargy during karmic shed");

      recommendedShantiRemediesKn.push("ಗುರುವಾರ ಗುರು ಚರಿತ್ರೆ ಪಾರಾಯಣ ಮಾಡಿ ಮತ್ತು ಬ್ರಾಹ್ಮಣರಿಗೆ ಹಳದಿ ಧಾನ್ಯ ದಾನ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮತ್ತು ರಾಹು-ಬೃಹಸ್ಪತಿ ಸಂಧಿ ಶಾಂತಿ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesKn.push("ಕತ್ತಿನಲ್ಲಿ 5-ಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ ಮಾಡಿ ಅಥವಾ ಬಲತೋಳಿಗೆ ರಕ್ಷಾಸೂತ್ರ ಕಟ್ಟಿಕೊಳ್ಳಿ");
      recommendedShantiRemediesEn.push("Read Guru Charitra on Thursdays and donate yellow chickpeas");
      recommendedShantiRemediesEn.push("Perform Rudrabhisheka and Rahu-Brihaspati Sandhi Shanti at Sri Kshetra Gokarna");
      recommendedShantiRemediesEn.push("Wear a consecrated 5-Mukhi Rudraksha for spiritual equilibrium");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಾಹು-ಬೃಹಸ್ಪತಿ ಸಂಧಿ ಶಾಂತಿ & ರುದ್ರಾಭಿಷೇಕ";
      gokarnaSevaEn = "Rahu-Brihaspati Sandhi Shanti & Rudrabhisheka at Sri Kshetra Gokarna";
    } else {
      // General Sandhi
      descriptionKn = `${outKn} ಮಹಾದಶೆಯಿಂದ ${inKn} ಮಹಾದಶೆಗೆ ಜೀವಿತವು ಪಲ್ಲಟಗೊಳ್ಳುವ ಸಂಧಿಕಾಲವಿದು. ಹಿಂದಿನ ದಶೆಯ ಕರ್ಮಗಳು ಮುಗಿದು ನೂತನ ಗ್ರಹದ ಪ್ರಭಾವವು ಶರೀರ ಹಾಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ನೆಲೆಗೊಳ್ಳುವ ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಆರೋಗ್ಯ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಆರ್ಥಿಕ ವಿಚಾರಗಳಲ್ಲಿ ಸಂಯಮದಿಂದ ಮುನ್ನಡೆಯುವುದು ಅಗತ್ಯ.`;
      descriptionEn = `Transition junction from ${outgoing} to ${incoming} Mahadasha. The residual karmic momentum of the outgoing planet gives way to the incoming lord, requiring conscious lifestyle balancing.`;

      warningSymptomsKn.push("ಜೀವನದ ದಿಕ್ಕಿನಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವು ಹಾಗೂ ಆಂತರಿಕ ಅಶಾಂತಿ");
      warningSymptomsKn.push("ಹೊಸ ಹೊಣೆಗಾರಿಕೆಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಲ್ಲಿ ಆರಂಭಿಕ ಗೊಂದಲ");
      warningSymptomsKn.push("ದೈಹಿಕ ನಿಶ್ಯಕ್ತಿ ಅಥವಾ ನಿದ್ರಾಹೀನತೆಯ ಸಂಕಟ");
      warningSymptomsEn.push("Unexpected shift in life direction and internal restlessness");
      warningSymptomsEn.push("Initial friction adjusting to upcoming responsibilities");
      warningSymptomsEn.push("Fluctuating vitality and sleep adjustments");

      recommendedShantiRemediesKn.push("ನವಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪ ಮಾಡಿ ಪ್ರತಿನಿತ್ಯ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನವಗ್ರಹ ಸಂಧಿ ಶಾಂತಿ ಸೇವೆ ಸಮರ್ಪಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Gayatri Mantra daily and sponsor Navagraha Shanti");
      recommendedShantiRemediesEn.push("Sponsor Navagraha Sandhi Shanti at Sri Kshetra Gokarna Mahabaleshwara");
      gokarnaSevaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ${outKn}-${inKn} ನವಗ್ರಹ ಸಂಧಿ ಶಾಂತಿ ಸೇವೆ`;
      gokarnaSevaEn = `Navagraha Sandhi Shanti Pooja at Sri Kshetra Gokarna for ${outgoing}-${incoming}`;
    }

    return {
      sandhiCode: code,
      titleKn,
      titleEn,
      badgeKn,
      badgeEn,
      status,
      alertLevel,
      isSpecialForWomen: isWomanSpecial,
      outgoingPlanet: outgoing,
      outgoingPlanetKn: outKn,
      outgoingPlanetEn: outgoing,
      incomingPlanet: incoming,
      incomingPlanetKn: inKn,
      incomingPlanetEn: incoming,
      startDateStr,
      endDateStr,
      daysRemainingOrUntil,
      totalDurationDays: totalDays,
      durationFormattedKn: durationFmt.kn,
      durationFormattedEn: durationFmt.en,
      descriptionKn,
      descriptionEn,
      warningSymptomsKn,
      warningSymptomsEn,
      recommendedShantiRemediesKn,
      recommendedShantiRemediesEn,
      gokarnaSevaKn,
      gokarnaSevaEn
    };
  };

  // Determine Active Sandhi:
  // Classically, Sandhi Zone is within ±0.75 years (9 months) of a Mahadasha boundary,
  // OR during the terminal Bhukti of a Mahadasha (e.g., Shukra-Surya Bhukti, Kuja-Rahu Bhukti, etc.).
  let activeAlert: DashaSandhiAlert | null = null;
  let upcomingAlert: DashaSandhiAlert | null = null;

  // Check if native is near the end of current Mahadasha (within 1.2 years) or near start of current Mahadasha (within 0.8 years)
  const timeToEndMaha = activeMaha.endAge - currentAge;
  const timeFromStartMaha = currentAge - activeMaha.startAge;

  // Terminal Bhukti check:
  const isTerminalBhukti = activeBhukti.endAge >= activeMaha.endAge - 0.05;
  const isFirstBhukti = activeBhukti.startAge <= activeMaha.startAge + 0.05;

  if (nextMaha && (timeToEndMaha <= 1.2 || isTerminalBhukti)) {
    // We are exiting activeMaha into nextMaha
    const sandhiStartAge = Math.max(activeMaha.startAge, activeMaha.endAge - 1.0);
    const sandhiEndAge = nextMaha.startAge + 0.75;
    activeAlert = createAlertObj(activeMaha.planet, nextMaha.planet, sandhiStartAge, sandhiEndAge, "active");
  } else if (activeMahaIdx > 0 && (timeFromStartMaha <= 0.8 || isFirstBhukti)) {
    // We recently entered activeMaha from prevMaha
    const prevMaha = dashaTimeline[activeMahaIdx - 1]!;
    const sandhiStartAge = Math.max(prevMaha.startAge, prevMaha.endAge - 0.75);
    const sandhiEndAge = activeMaha.startAge + 0.8;
    activeAlert = createAlertObj(prevMaha.planet, activeMaha.planet, sandhiStartAge, sandhiEndAge, "active");
  }

  // Upcoming Sandhi detection:
  if (nextMaha) {
    const sandhiStartAge = Math.max(activeMaha.startAge, activeMaha.endAge - 1.0);
    const sandhiEndAge = nextMaha.startAge + 0.75;
    if (sandhiStartAge > currentAge) {
      upcomingAlert = createAlertObj(activeMaha.planet, nextMaha.planet, sandhiStartAge, sandhiEndAge, "upcoming");
    }
  }

  // Primary display fallback: If active is present, use active; else upcoming; else synthesized upcoming from next Mahadasha
  const primary = activeAlert || upcomingAlert || createAlertObj(
    activeMaha.planet,
    nextMaha ? nextMaha.planet : activeBhukti.bhukti,
    activeMaha.endAge - 0.75,
    (nextMaha?.startAge ?? activeMaha.endAge) + 0.75,
    "upcoming"
  );

  return { activeAlert, upcomingAlert, primary };
}

// ---------------------------------------------------------------------------
// 2. Next 2 Bhuktis Deep Roadmap Engine
// ---------------------------------------------------------------------------

export function calculateNextBhuktisRoadmap(
  kundli: KundliOutput,
  context: DevoteeContextForSandhi
): { currentBhukti: BhuktiForecastItem; nextBhukti1: BhuktiForecastItem; nextBhukti2: BhuktiForecastItem; roadmapList: BhuktiForecastItem[] } {
  const refDate = context.referenceDate || new Date();
  const currentAge = calculateDecimalAgeAtDate(context.birthDate, refDate);
  const bhuktiTimeline = generateBhuktiTimeline(kundli, 120);

  let activeIdx = bhuktiTimeline.findIndex((b) => currentAge >= b.startAge - 1e-6 && currentAge < b.endAge - 1e-6);
  if (activeIdx === -1) {
    activeIdx = currentAge < (bhuktiTimeline[0]?.startAge ?? 0) ? 0 : Math.max(0, bhuktiTimeline.length - 3);
  }

  const span0 = bhuktiTimeline[activeIdx] || bhuktiTimeline[0]!;
  const span1 = bhuktiTimeline[activeIdx + 1] || span0;
  const span2 = bhuktiTimeline[activeIdx + 2] || span1;

  const buildForecastItem = (span: BhuktiSpan, index: number): BhuktiForecastItem => {
    const isCurrent = index === 0;
    const mahaKn = toKannadaPlanet(span.maha);
    const bhuktiKn = toKannadaPlanet(span.bhukti);
    const startDateStr = formatDateFromDecimalAge(context.birthDate, span.startAge);
    const endDateStr = formatDateFromDecimalAge(context.birthDate, span.endAge);
    const startD = new Date(startDateStr);
    const endD = new Date(endDateStr);

    const totalDays = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)));
    const durationFmt = formatDurationInDaysAndMonths(totalDays);

    let daysRemainingOrUntil = 0;
    let statusCountdownKn = "";
    let statusCountdownEn = "";

    if (isCurrent) {
      daysRemainingOrUntil = Math.max(0, Math.round((endD.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
      statusCountdownKn = `ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ • ಇನ್ನೂ ${daysRemainingOrUntil} ದಿನಗಳು ಬಾಕಿ ಇವೆ`;
      statusCountdownEn = `Currently Active • ${daysRemainingOrUntil} days remaining`;
    } else {
      daysRemainingOrUntil = Math.max(0, Math.round((startD.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
      statusCountdownKn = `ಮುಂದಿನ ಹಂತ • ಇನ್ನು ${daysRemainingOrUntil} ದಿನಗಳ ನಂತರ ಆರಂಭ`;
      statusCountdownEn = `Upcoming Phase • Commences in ${daysRemainingOrUntil} days`;
    }

    // Parashari Relationship
    const rel = getNaturalRelationship(span.maha, span.bhukti);
    const relKn = rel === "mitra" ? "ನೈಸರ್ಗಿಕ ಮಿತ್ರತ್ವ (ಶುಭ ಫಲ)" : rel === "shatru" ? "ನೈಸರ್ಗಿಕ ಶತ್ರುತ್ವ (ಸವಾಲಿನ ಫಲ)" : "ಸಮತ್ವ (ಮಿಶ್ರ ಫಲ)";
    const relEn = rel === "mitra" ? "Natural Friendship (Favorable)" : rel === "shatru" ? "Natural Enmity (Challenging)" : "Neutral Affinity (Mixed)";

    // House Distance between Maha Lord & Bhukti Lord in native's Kundli
    const pMaha = kundli.planets.find((p) => p.name === span.maha);
    const pBhukti = kundli.planets.find((p) => p.name === span.bhukti);
    let houseDist = 1;
    if (pMaha && pBhukti) {
      houseDist = ((pBhukti.house - pMaha.house + 12) % 12) + 1;
    }

    let houseDistanceLabelKn = `${houseDist}ನೇ ಭಾವದ ಅಂತರ`;
    let houseDistanceLabelEn = `${houseDist}th house distance`;

    if (houseDist === 6 || houseDist === 8) {
      houseDistanceLabelKn = "ಷಡಾಷ್ಟಕ (6-8) ದೋಷ (ವಿರೋಧ & ಒತ್ತಡ)";
      houseDistanceLabelEn = "Shadashtaka (6-8) Inimical Tension";
    } else if (houseDist === 2 || houseDist === 12) {
      houseDistanceLabelKn = "ದ್ವಿದ್ವಾದಶ (2-12) ವ್ಯಯ ಯೋಗ (ಸ್ಥಾನಪಲ್ಲಟ & ಖರ್ಚು)";
      houseDistanceLabelEn = "Dwidwadasa (2-12) Expenditure & Transition";
    } else if (houseDist === 5 || houseDist === 9) {
      houseDistanceLabelKn = "ನವಪಂಚಮ (5-9) ರಾಜಯೋಗ (ಭಾಗ್ಯೋದಯ & ಯಶಸ್ಸು)";
      houseDistanceLabelEn = "Navapanchama (5-9) Raja Yoga & Fortune";
    } else if ([1, 4, 7, 10].includes(houseDist)) {
      houseDistanceLabelKn = "ಕೇಂದ್ರ ಸ್ಥಾನ ಸಮನ್ವಯ (ಸ್ಥಿರತೆ & ಕ್ರಿಯಾಶೀಲತೆ)";
      houseDistanceLabelEn = "Kendra Angular Cohesion (Action & Stability)";
    } else if ([3, 11].includes(houseDist)) {
      houseDistanceLabelKn = "ಉಪಚಯ (3-11) ಲಾಭ ಯೋಗ (ಅಭಿವೃದ್ಧಿ & ಜಯ)";
      houseDistanceLabelEn = "Upachaya (3-11) Growth & Victory";
    }

    // Janma Lagna House Lordship of Bhukti Lord
    const lagnaIdx = kundli.lagnaRashi.index;
    const { housesKn, housesEn, houseNumbers } = getBhuktiLordHouses(span.bhukti, lagnaIdx);
    const placementHouse = pBhukti?.house ?? 1;
    const bhuktiLordPlacementKn = `${placementHouse}ನೇ ಮನೆಯಲ್ಲಿ (${toKannadaRashi(pBhukti?.rashi.english || "")}) ಸ್ಥಿತರಾಗಿದ್ದಾರೆ`;
    const bhuktiLordPlacementEn = `Placed in ${placementHouse}th House (${pBhukti?.rashi.english || ""})`;

    // Overall Nature determination
    let overallNature: BhuktiForecastItem["overallNature"] = "auspicious";
    const hasDusthanaLord = houseNumbers.some((h) => [6, 8, 12].includes(h));
    const isDusthanaPlaced = [6, 8, 12].includes(placementHouse);
    const isShadashtaka = houseDist === 6 || houseDist === 8;

    if (isShadashtaka || (hasDusthanaLord && isDusthanaPlaced && rel === "shatru")) {
      overallNature = "turbulent";
    } else if (isDusthanaPlaced || rel === "shatru" || houseDist === 2 || houseDist === 12) {
      overallNature = "challenging";
    } else if ((houseDist === 5 || houseDist === 9 || [1, 4, 7, 10, 11].includes(houseDist)) && rel === "mitra" && !isDusthanaPlaced) {
      overallNature = "highly_auspicious";
    } else {
      overallNature = "mixed_growth";
    }

    // Dynamic Parashari Predictions across 5 Pillars
    const titleKn = `${mahaKn} ಮಹಾದಶಾ - ${bhuktiKn} ಭುಕ್ತಿ`;
    const titleEn = `${span.maha} Mahadasha - ${span.bhukti} Bhukti`;

    let headlineKn = "";
    let headlineEn = "";
    let whatToExpectOverviewKn = "";
    let whatToExpectOverviewEn = "";
    let careerProspectsKn = "";
    let careerProspectsEn = "";
    let financialProspectsKn = "";
    let financialProspectsEn = "";
    let familyMarriageProspectsKn = "";
    let familyMarriageProspectsEn = "";
    let healthMindProspectsKn = "";
    let healthMindProspectsEn = "";
    let precautionsKn = "";
    let precautionsEn = "";
    let gokarnaPariharaKn = "";
    let gokarnaPariharaEn = "";

    if (overallNature === "highly_auspicious") {
      headlineKn = `ಭಾಗ್ಯೋದಯ & ಅಧಿಕಾರ ವೃದ್ಧಿ: ${mahaKn}-${bhuktiKn} ಸಮನ್ವಯದಿಂದ ಕಾರ್ಯಸಿದ್ಧಿ`;
      headlineEn = `Golden Advancement & Status: Harmony between ${span.maha} and ${span.bhukti}`;
      whatToExpectOverviewKn = `${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ಮಿತ್ರನಾದ ${bhuktiKn} ಭುಕ್ತಿಯು ${houseDistanceLabelKn} ಪ್ರಭಾವ ಹೊಂದಿದ್ದು, ${housesKn} ಆಗಿ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ದೈವಿಕ ಬೆಂಬಲ ತರಲಿದೆ. ಅಡೆತಡೆಗಳು ಕರಗಿ ದೀರ್ಘಕಾಲದ ಕನಸುಗಳು ನನಸಾಗುವ ಕಾಲ.`;
      whatToExpectOverviewEn = `Under ${span.maha} Mahadasha, harmonious ${span.bhukti} Antardasha operates with ${houseDistanceLabelEn}, activating ${housesEn} to deliver career acceleration and auspicious outcomes.`;
      careerProspectsKn = `ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಪ್ರಮುಖ ಹೊಣೆಗಾರಿಕೆಗಳು ಹಾಗೂ ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ಪ್ರಶಂಸೆ. ಸ್ವಂತ ಉದ್ಯಮಿಗಳಿಗೆ ಹೊಸ ಒಪ್ಪಂದಗಳು ಹಾಗೂ ವಿಸ್ತರಣೆಗೆ ಸಕಾಲ.`;
      careerProspectsEn = `Promotions, leadership responsibilities, and patronage from superiors. Business ventures gain high-value contracts and expansion.`;
      financialProspectsKn = `ಹಣದ ಹರಿವು ಸುಗಮವಾಗಿರಲಿದ್ದು, ಹಳೆಯ ಬಾಕಿ ವಸೂಲಿಯಾಗಲಿದೆ. ಹೊಸ ಆಸ್ತಿ ಅಥವಾ ವಾಹನ ಖರೀದಿ ಯೋಗ ಸಕ್ರಿಯ.`;
      financialProspectsEn = `Smooth financial inflow, recovery of stuck funds, and strong prospects for acquisition of real estate or vehicles.`;
      familyMarriageProspectsKn = `ಕುಟುಂಬದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಸಡಗರ, ದಾಂಪತ್ಯದಲ್ಲಿ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ವೃದ್ಧಿ ಮತ್ತು ಮಕ್ಕಳಿಂದ ಹೆಮ್ಮೆಯ ಸುದ್ದಿ.`;
      familyMarriageProspectsEn = `Auspicious family celebrations, mutual affection in marriage, and gratifying achievements from children.`;
      healthMindProspectsKn = `ಮಾನಸಿಕ ಉತ್ಸಾಹ ಹಾಗೂ ಉತ್ತಮ ದೈಹಿಕ ಶಕ್ತಿ. ಹಳೆಯ ದೀರ್ಘಕಾಲಿಕ ತೊಂದರೆಗಳು ಶಮನವಾಗಲಿವೆ.`;
      healthMindProspectsEn = `High vitality, mental optimism, and sustained recovery from chronic fatigue.`;
      precautionsKn = `ಹೆಚ್ಚಿನ ಯಶಸ್ಸು ಬಂದಾಗ ಅಹಂಕಾರ ಮಾಡದೆ, ವಿನಮ್ರತೆಯಿಂದ ಸತ್ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳಿ.`;
      precautionsEn = `Maintain humility amidst rising success; avoid complacency in legal or contractual documentation.`;
      gokarnaPariharaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕೃತಜ್ಞತಾ ಸಂಕಲ್ಪ ಪೂಜೆ ಮತ್ತು ನವಗ್ರಹ ಫಲಪುಷ್ಪ ಸಮರ್ಪಣೆ.`;
      gokarnaPariharaEn = `Sponsor Gratitude Sankalpa Pooja and Navagraha Blessings at Sri Kshetra Gokarna Mahabaleshwara.`;
    } else if (overallNature === "turbulent" || overallNature === "challenging") {
      headlineKn = `ಎಚ್ಚರಿಕೆಯ ಹೆಜ್ಜೆ ಅಗತ್ಯ: ${mahaKn}-${bhuktiKn} ಸಂಧಿಕಾಲದಲ್ಲಿ ಸಂಯಮವೇ ರಕ್ಷಣೆ`;
      headlineEn = `Strategic Caution & Patience: Navigating ${span.maha}-${span.bhukti} Friction`;
      whatToExpectOverviewKn = `${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯು ${houseDistanceLabelKn} ರೂಪಿಸಿದ್ದು, ${housesKn} ಆಗಿ ಕಾರ್ಯಕ್ಷೇತ್ರ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯಲ್ಲಿ ತಾಳ್ಮೆಯನ್ನು ಪರೀಕ್ಷಿಸಲಿದೆ. ಆವೇಶದ ತೀರ್ಮಾನಗಳು ಬೇಡ.`;
      whatToExpectOverviewEn = `Under ${span.maha} Mahadasha, ${span.bhukti} Antardasha manifests ${houseDistanceLabelEn}, testing patience across ${housesEn}. Impulsive actions must be strictly avoided.`;
      careerProspectsKn = `ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಅನಗತ್ಯ ರಾಜಕೀಯ, ಅಸೂಯೆ ಅಥವಾ ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಭಿಪ್ರಾಯ ಭೇದ. ಹೊಸ ಸಾಹಸಗಳಿಗೆ ಕೈಹಾಕದೆ ಇರುವ ಜಾಗವನ್ನು ಭದ್ರಪಡಿಸಿಕೊಳ್ಳಿ.`;
      careerProspectsEn = `Workplace politics, misunderstandings with seniors, or project delays. Consolidate your present footing rather than launching unvetted ventures.`;
      financialProspectsKn = `ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳು ಅಥವಾ ಹೂಡಿಕೆಯಲ್ಲಿ ನಷ್ಟದ ಸಾಧ್ಯತೆ. ಯಾರಿಗೂ ಜಾಮೀನು ನೀಡಬೇಡಿ ಮತ್ತು ಷೇರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ದುಡುಕಬೇಡಿ.`;
      financialProspectsEn = `Unplanned expenses and cash flow friction. Strictly avoid speculative stock market gambles or standing third-party financial guarantee.`;
      familyMarriageProspectsKn = `ಚಿಕ್ಕ ವಿಷಯಕ್ಕೂ ಮನೆಯಲ್ಲಿ ಮನಸ್ತಾಪ ಹಾಗೂ ಮಾತಿನ ಚಕಮಕಿ. ಸಂಗಾತಿಯ ಮನಸ್ಸನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡು ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`;
      familyMarriageProspectsEn = `Domestic friction sparked by trivial disputes. Practise mindful listening and avoid heated verbal confrontations with family members.`;
      healthMindProspectsKn = `ಅತಿಯಾದ ಚಿಂತೆ, ನಿದ್ರಾಭಂಗ ಅಥವಾ ಹೊಟ್ಟೆ/ರಕ್ತದೊತ್ತಡದ ಏರುಪೇರು. ನಿಯಮಿತ ಧ್ಯಾನ ಹಾಗೂ ಪ್ರಾಣಾಯಾಮ ಅಗತ್ಯ.`;
      healthMindProspectsEn = `Mental anxiety, restless sleep, and digestive or blood pressure fluctuations. Daily pranayama and quiet contemplation are vital.`;
      precautionsKn = `ಯಾವುದೇ ಮಹತ್ವದ ಕಾಗದಪತ್ರಗಳಿಗೆ ಸಹಿ ಹಾಕುವ ಮುನ್ನ ಪರಿಶೀಲಿಸಿ. ಕಾನೂನು ಅಥವಾ ವ್ಯಾಜ್ಯಗಳಿಂದ ದೂರವಿರಿ.`;
      precautionsEn = `Thoroughly vet all legal agreements before signing. Steer clear of contentious disputes or courtroom confrontations.`;
      gokarnaPariharaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ ಮತ್ತು ${bhuktiKn} ಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ ಸಮರ್ಪಿಸಿ.`;
      gokarnaPariharaEn = `Sponsor Mahamrityunjaya Japa and ${span.bhukti} Graha Shanti Pooja at Sri Kshetra Gokarna to dissolve obstacles.`;
    } else {
      // Mixed growth / auspicious
      headlineKn = `ಸ್ಥಿರತೆ & ನೂತನ ಪ್ರಯತ್ನ: ${mahaKn}-${bhuktiKn} ಕಾಲದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ`;
      headlineEn = `Steady Grounding & Enterprise: Rewarding Efforts under ${span.maha}-${span.bhukti}`;
      whatToExpectOverviewKn = `${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiKn} ಭುಕ್ತಿಯು ${houseDistanceLabelKn} ತರಲಿದ್ದು, ${housesKn} ಆಗಿ ಸ್ಥಿರ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡಲಿದೆ. ಆರಂಭದಲ್ಲಿ ಸ್ವಲ್ಪ ಪರಿಶ್ರಮವಿದ್ದರೂ ಅಂತ್ಯದಲ್ಲಿ ನೆಮ್ಮದಿ ಹಾಗೂ ಲಾಭ ದೊರೆಯಲಿದೆ.`;
      whatToExpectOverviewEn = `Under ${span.maha} Mahadasha, ${span.bhukti} Antardasha introduces ${houseDistanceLabelEn}, activating ${housesEn} to reward diligent perseverance with sustainable progress.`;
      careerProspectsKn = `ನಿಮ್ಮ ಕರ್ತವ್ಯದಲ್ಲಿ ಸ್ಥಿರ ಪ್ರಗತಿ. ಹೊಸ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯಲು ಹಾಗೂ ಭವಿಷ್ಯದ ಯೋಜನೆಗಳಿಗೆ ಅಡಿಪಾಯ ಹಾಕಲು ಅತ್ಯುತ್ತಮ ಸಮಯ.`;
      careerProspectsEn = `Consistent performance in professional responsibilities. Auspicious window for skill acquisition and strategic career groundwork.`;
      financialProspectsKn = `ಆದಾಯದಲ್ಲಿ ಸಮತೋಲನ. ಉಳಿತಾಯದ ಕಡೆಗೆ ಗಮನ ಹರಿಸಿ ಮತ್ತು ದೀರ್ಘಾವಧಿ ಹೂಡಿಕೆಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.`;
      financialProspectsEn = `Balanced income streams. Focus on disciplined savings and sound long-term asset allocation.`;
      familyMarriageProspectsKn = `ಸಾಮಾನ್ಯ ಕೌಟುಂಬಿಕ ಶಾಂತಿ. ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಮನೆಯ ಸದಸ್ಯರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಒಡನಾಟ.`;
      familyMarriageProspectsEn = `Harmonious domestic routines. Seek elders' blessings and foster mutual collaboration among household members.`;
      healthMindProspectsKn = `ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಉತ್ತಮ. ಕೆಲಸದ ಒತ್ತಡದಿಂದ ದೇಹಕ್ಕೆ ಆಯಾಸವಾಗದಂತೆ ಸೂಕ್ತ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.`;
      healthMindProspectsEn = `Stable overall vitality. Ensure adequate sleep and hydration to counter routine operational fatigue.`;
      precautionsKn = `ಸಮಯಪಾಲನೆ ಹಾಗೂ ಆಲಸ್ಯವನ್ನು ತ್ಯಜಿಸಿ ನಿರಂತರ ಪ್ರಯತ್ನ ಮುಂದುವರಿಸಿ.`;
      precautionsEn = `Avoid procrastination; maintain structured timelines and disciplined execution.`;
      gokarnaPariharaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನವಗ್ರಹ ದೀಪೋತ್ಸವ ಮತ್ತು ಫಲಪುಷ್ಪ ಸಂಕಲ್ಪ ಸೇವೆ.`;
      gokarnaPariharaEn = `Perform Navagraha Deepotsava and Sankalpa Pooja at Sri Kshetra Gokarna Mahabaleshwara.`;
    }

    return {
      index,
      isCurrent,
      mahaPlanet: span.maha,
      mahaPlanetKn: mahaKn,
      mahaPlanetEn: span.maha,
      bhuktiPlanet: span.bhukti,
      bhuktiPlanetKn: bhuktiKn,
      bhuktiPlanetEn: span.bhukti,
      titleKn,
      titleEn,
      startAge: Number(span.startAge.toFixed(2)),
      endAge: Number(span.endAge.toFixed(2)),
      startDateStr,
      endDateStr,
      totalDays,
      daysCountFormattedKn: durationFmt.kn,
      daysCountFormattedEn: durationFmt.en,
      statusCountdownKn,
      statusCountdownEn,
      relationship: rel,
      relationshipKn: relKn,
      relationshipEn: relEn,
      houseDistance: houseDist,
      houseDistanceLabelKn,
      houseDistanceLabelEn,
      bhuktiLordHousesKn: housesKn,
      bhuktiLordHousesEn: housesEn,
      bhuktiLordPlacementKn,
      bhuktiLordPlacementEn,
      overallNature,
      headlineKn,
      headlineEn,
      whatToExpectOverviewKn,
      whatToExpectOverviewEn,
      careerProspectsKn,
      careerProspectsEn,
      financialProspectsKn,
      financialProspectsEn,
      familyMarriageProspectsKn,
      familyMarriageProspectsEn,
      healthMindProspectsKn,
      healthMindProspectsEn,
      precautionsKn,
      precautionsEn,
      gokarnaPariharaKn,
      gokarnaPariharaEn
    };
  };

  const currentBhukti = buildForecastItem(span0, 0);
  const nextBhukti1 = buildForecastItem(span1, 1);
  const nextBhukti2 = buildForecastItem(span2, 2);

  return {
    currentBhukti,
    nextBhukti1,
    nextBhukti2,
    roadmapList: [currentBhukti, nextBhukti1, nextBhukti2]
  };
}

// ---------------------------------------------------------------------------
// 3. Unified Master Synthesizer
// ---------------------------------------------------------------------------

export function generateDashaSandhiAndRoadmap(
  kundli: KundliOutput,
  context: DevoteeContextForSandhi
): DashaSandhiAndRoadmapOutput {
  const sandhi = detectDashaSandhiAlert(kundli, context);
  const roadmap = calculateNextBhuktisRoadmap(kundli, context);

  return {
    activeSandhiAlert: sandhi.activeAlert,
    upcomingSandhiAlert: sandhi.upcomingAlert,
    primarySandhiDisplay: sandhi.primary,
    currentBhukti: roadmap.currentBhukti,
    nextBhukti1: roadmap.nextBhukti1,
    nextBhukti2: roadmap.nextBhukti2,
    roadmapList: roadmap.roadmapList
  };
}
