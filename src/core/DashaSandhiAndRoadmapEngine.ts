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

    const lagnaIdx = kundli.lagnaRashi.index;
    const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
    const lagnaEn = kundli.lagnaRashi.english;

    const outHouses = getBhuktiLordHouses(outgoing, lagnaIdx);
    const inHouses = getBhuktiLordHouses(incoming, lagnaIdx);

    const pOut = kundli.planets.find((p) => p.name === outgoing);
    const pIn = kundli.planets.find((p) => p.name === incoming);

    const outPlacementHouse = pOut?.house ?? 1;
    const inPlacementHouse = pIn?.house ?? 1;

    const outPlacementKn = `${outPlacementHouse}ನೇ ಮನೆಯಲ್ಲಿ (${toKannadaRashi(pOut?.rashi.english || "")})`;
    const inPlacementKn = `${inPlacementHouse}ನೇ ಮನೆಯಲ್ಲಿ (${toKannadaRashi(pIn?.rashi.english || "")})`;
    const outPlacementEn = `in ${outPlacementHouse}th House (${pOut?.rashi.english || ""})`;
    const inPlacementEn = `in ${inPlacementHouse}th House (${pIn?.rashi.english || ""})`;

    const sandhiDist = pOut && pIn ? (((pIn.house - pOut.house + 12) % 12) + 1) : 1;
    let sandhiRelKn = "";
    let sandhiRelEn = "";
    if (sandhiDist === 6 || sandhiDist === 8) {
      sandhiRelKn = "ಪರಸ್ಪರ 6-8ರ ಷಡಾಷ್ಟಕ ಸಂಬಂಧ (ಸವಾಲಿನ ಸ್ಥಿತ್ಯಂತರ)";
      sandhiRelEn = "mutual 6-8 Shadashtaka relationship (challenging transition)";
    } else if (sandhiDist === 2 || sandhiDist === 12) {
      sandhiRelKn = "ಪರಸ್ಪರ 2-12ರ ದ್ವಿದ್ವಾದಶ ಸಂಬಂಧ (ಸ್ಥಾನಪಲ್ಲಟ & ವೆಚ್ಚ)";
      sandhiRelEn = "mutual 2-12 Dwidwadasa relationship (relocation & expenditure)";
    } else if (sandhiDist === 5 || sandhiDist === 9) {
      sandhiRelKn = "ಪರಸ್ಪರ 5-9ರ ನವಪಂಚಮ ಯೋಗ (ಶುಭ ಸಮನ್ವಯ)";
      sandhiRelEn = "mutual 5-9 Navapanchama yoga (favorable harmony)";
    } else if ([1, 4, 7, 10].includes(sandhiDist)) {
      sandhiRelKn = "ಪರಸ್ಪರ ಕೇಂದ್ರ ಸ್ಥಾನ ಸಮನ್ವಯ (ಸ್ಥಿರತೆ & ಕರ್ಮ ಸಕ್ರಿಯತೆ)";
      sandhiRelEn = "mutual Kendra alignment (stability & active karma)";
    } else {
      sandhiRelKn = "ಪರಸ್ಪರ ಉಪಚಯ ಸಂಬಂಧ (ಹಂತಹಂತವಾದ ಬೆಳವಣಿಗೆ)";
      sandhiRelEn = "mutual Upachaya alignment (progressive growth)";
    }

    const lagnaIntroKn = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaKn} ಲಗ್ನಕ್ಕೆ, ${outHouses.housesKn} ಅಧಿಪತಿಯಾಗಿ ${outPlacementKn} ಸ್ಥಿತರಾಗಿದ್ದ ${outKn} ಮಹಾದಶೆಯು ಮುಕ್ತಾಯಗೊಂಡು, ಈಗ ${inHouses.housesKn} ಅಧಿಪತಿಯಾಗಿ ${inPlacementKn} ಸ್ಥಿತರಾಗುವ ${inKn} ಮಹಾದಶೆಯು ಆರಂಭವಾಗುತ್ತಿದೆ (${sandhiRelKn}). `;
    const lagnaIntroEn = `For your ${lagnaEn} Ascendant, the Mahadasha of ${outgoing} (ruler of ${outHouses.housesEn}, placed ${outPlacementEn}) is concluding, handing over the life steering wheel to ${incoming} (ruler of ${inHouses.housesEn}, placed ${inPlacementEn}) through ${sandhiRelEn}. `;

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
    } else if (code === "jupiter_saturn") {
      titleKn = "ಗುರು-ಶನಿ ಸಂಧಿ (ವಿಸ್ತರಣೆಯಿಂದ ಕರ್ಮ ಶಿಸ್ತಿನ ಕಡೆಗೆ)";
      titleEn = "Guru-Shani Sandhi (Wisdom to Karmic Discipline)";
      badgeKn = "ಜೀವನದ ಮಹಾ ತಿರುವು";
      badgeEn = "Major Karmic Turning Point";
    } else if (code === "saturn_mercury") {
      titleKn = "ಶನಿ-ಬುಧ ಸಂಧಿ (ಪರಿಶ್ರಮದಿಂದ ಬುದ್ಧಿ ಕೌಶಲ್ಯಕ್ಕೆ)";
      titleEn = "Shani-Budha Sandhi (Labor to Intellectual Enterprise)";
      badgeKn = "ವ್ಯಾಪಾರ & ಬುದ್ಧಿ ವಿಕಾಸ";
      badgeEn = "Intellectual & Commercial Upswing";
    } else if (code === "mercury_ketu") {
      titleKn = "ಬುಧ-ಕೇತು ಸಂಧಿ (ತಾರ್ಕಿಕತೆಯಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ಮಂಥನಕ್ಕೆ)";
      titleEn = "Budha-Ketu Sandhi (Logic to Spiritual Dissolution)";
      badgeKn = "ಆಂತರಿಕ ಮಂಥನ";
      badgeEn = "Deep Karmic Introspection";
    } else if (code === "ketu_venus") {
      titleKn = "ಕೇತು-ಶುಕ್ರ ಸಂಧಿ (ವೈರಾಗ್ಯದಿಂದ ಭೋಗ-ಸೌಭಾಗ್ಯದ ಕಡೆಗೆ)";
      titleEn = "Ketu-Shukra Sandhi (Asceticism to Material Prosperity)";
      badgeKn = "ಸೌಭಾಗ್ಯೋದಯ";
      badgeEn = "Prosperity & Bliss";
    } else if (code === "sun_moon") {
      titleKn = "ಸೂರ್ಯ-ಚಂದ್ರ ಸಂಧಿ (ಪ್ರತಾಪದಿಂದ ಮಾನಸಿಕ ಸಾಮರಸ್ಯಕ್ಕೆ)";
      titleEn = "Surya-Chandra Sandhi (Authority to Mind & Harmony)";
      badgeKn = "ಮನೋಸ್ಥಿತ್ಯಂತರ";
      badgeEn = "Psychological Shift";
    } else if (code === "moon_mars") {
      titleKn = "ಚಂದ್ರ-ಕುಜ ಸಂಧಿ (ಭಾವನೆಗಳಿಂದ ಕ್ರಿಯಾಶೀಲ ಶಕ್ತಿಗೆ)";
      titleEn = "Chandra-Kuja Sandhi (Emotions to Dynamic Action)";
      badgeKn = "ಅಗ್ನಿ-ಜಲ ಸಂಧಿಕಾಲ";
      badgeEn = "Dynamic Fire-Water Transition";
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
    } else if (code === "jupiter_saturn") {
      descriptionKn = `16 ವರ್ಷಗಳ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಮಹಾದಶೆ ಮುಗಿದು 19 ವರ್ಷಗಳ ಕರ್ಮಕಾರಕ ಶನಿ ಮಹಾದಶೆ ಪ್ರವೇಶಿಸುವ ನಿರ್ಣಾಯಕ ಸಂಧಿಕಾಲವಿದು. ಗುರುವಿನ ಆಶಾವಾದ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆಯಿಂದ ಶನಿಯ ಕಠಿಣ ಶಿಸ್ತು, ಕರ್ಮ ಪರಿಶ್ರಮ ಮತ್ತು ನೆಲದ ವಾಸ್ತವಕ್ಕೆ ನೀವು ಹೊಂದಿಕೊಳ್ಳಬೇಕಾಗಿದೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ನೈಸರ್ಗಿಕ ಸುಲಭ ಅವಕಾಶಗಳು ನಿಂತು, ಪ್ರತಿಯೊಂದು ಸಾಧನೆಗೂ ದೀರ್ಘಕಾಲಿಕ ತಾಳ್ಮೆ ಮತ್ತು ಶ್ರಮ ಅನಿವಾರ್ಯವಾಗುತ್ತದೆ. ಕೀಲು ನೋವು, ವಾತ ಪ್ರಕೋಪ ಹಾಗೂ ಕುಟುಂಬದ ಭಾರವಾದ ಹೊಣೆಗಾರಿಕೆಗಳು ಎದುರಾಗುತ್ತವೆ.`;
      descriptionEn = `Transition from 16-year Jupiter Dasha into 19-year Saturn Dasha. Shifting from expansive divine grace and optimism to rigorous karmic discipline, ground realities, and structural accountability. Easy patronages recede as every milestone demands disciplined perseverance and endurance.`;

      warningSymptomsKn.push("ಹಿಂದಿನ ಸುಲಭದ ಅವಕಾಶಗಳು ನಿಂತು, ಪ್ರತಿಯೊಂದಕ್ಕೂ ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಗೂ ಕಾಯುವಿಕೆ ಅನಿವಾರ್ಯವಾಗುವುದು");
      warningSymptomsKn.push("ಕೀಲು ನೋವು, ವಾತ ಪ್ರಕೋಪ ಅಥವಾ ಶಾರೀರಿಕ ಆಲಸ್ಯ ಹಾಗೂ ನಿಧಾನಗತಿ");
      warningSymptomsKn.push("ಕುಟುಂಬದ ದೀರ್ಘಕಾಲಿಕ ಹೊಣೆಗಾರಿಕೆಗಳು ಏಕಾಏಕಿ ನಿಮ್ಮ ಹೆಗಲ ಮೇಲೆ ಬೀಳುವುದು");
      warningSymptomsEn.push("Easy patronage dries up; every achievement demands rigorous perseverance and patience");
      warningSymptomsEn.push("Joint stiffness, Vata accumulation, physical fatigue, and slower recovery");
      warningSymptomsEn.push("Heavy long-term family responsibilities descending upon your shoulders");

      recommendedShantiRemediesKn.push("ಶನಿವಾರ ಶನೈಶ್ಚರ ಅಷ್ಟೋತ್ತರ ಪಠಿಸಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ");
      recommendedShantiRemediesKn.push("ಕಬ್ಬಿಣದ ಪಾತ್ರೆ ಅಥವಾ ಕಪ್ಪು ಎಳ್ಳನ್ನು ನಿರ್ಗತಿಕರಿಗೆ ದಾನ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗುರು-ಶನಿ ಸಂಧಿ ಶಾಂತಿ, ತೈಲಾಭಿಷೇಕ ಮತ್ತು ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Shani Ashtottara and light sesame oil lamp on Saturdays");
      recommendedShantiRemediesEn.push("Donate black sesame seeds or iron utensils to the needy");
      recommendedShantiRemediesEn.push("Perform Guru-Shani Sandhi Shanti and Tailabhisheka at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗುರು-ಶನಿ ಸಂಧಿ ಶಾಂತಿ & ತೈಲಾಭಿಷೇಕ ಸೇವೆ";
      gokarnaSevaEn = "Guru-Shani Sandhi Shanti & Tailabhisheka at Sri Kshetra Gokarna";
    } else if (code === "saturn_mercury") {
      descriptionKn = `19 ವರ್ಷಗಳ ದೀರ್ಘ ಶನಿ ಮಹಾದಶೆ ಮುಕ್ತಾಯಗೊಂಡು 17 ವರ್ಷಗಳ ಬುದ್ಧಿಕಾರಕ ಬುಧ ಮಹಾದಶೆ ಆರಂಭವಾಗುವ ಸಂಧಿಕಾಲವಿದು. ಕಠಿಣ ಶಾರೀರಿಕ ಶ್ರಮ ಹಾಗೂ ವಿಳಂಬಗಳ ಯುಗ ಮುಗಿದು ತೀಕ್ಷ್ಣ ಬುದ್ಧಿವಂತಿಕೆ, ವ್ಯಾಪಾರ, ಸಂವಹನ ಮತ್ತು ಹೊಸ ಕೌಶಲ್ಯಗಳ ಸುವರ್ಣಾವಕಾಶ ಆರಂಭವಾಗಲಿದೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಮಾನಸಿಕ ಯೋಚನೆಗಳ ವೇಗ ಹೆಚ್ಚಾಗುವುದು, ನರಗಳ ಆಯಾಸ, ಮತ್ತು ಹಳೆಯ ಶ್ರಮದಾಯಕ ಹಾದಿಯಿಂದ ನೂತನ ವಾಣಿಜ್ಯ ವ್ಯವಹಾರಗಳಿಗೆ ಬದಲಾಗುವ ಆರಂಭಿಕ ತೊಳಲಾಟ ಉಂಟಾಗುತ್ತದೆ.`;
      descriptionEn = `Transition from 19-year Saturn Dasha into 17-year Mercury Dasha. Shifting from arduous physical toil and delays into sharp intellect, commerce, trade networks, and rapid learning. Analytical acceleration may temporarily strain nerves and induce mental fatigue.`;

      warningSymptomsKn.push("ನರಗಳ ದೌರ್ಬಲ್ಯ, ಅತಿಯಾದ ಯೋಚನೆ (Overthinking) ಹಾಗೂ ಚರ್ಮದ ಸೂಕ್ಷ್ಮತೆ");
      warningSymptomsKn.push("ಹಳೆಯ ಶ್ರಮದಾಯಕ ಮಾರ್ಗವನ್ನು ಬಿಟ್ಟು ಹೊಸ ವ್ಯಾಪಾರ/ತಂತ್ರಜ್ಞಾನಕ್ಕೆ ಬದಲಾಗುವ ಗೊಂದಲ");
      warningSymptomsKn.push("ಸಂಬಂಧಿಕರೊಂದಿಗೆ ಕಾಗದಪತ್ರ ಅಥವಾ ಹಣಕಾಸಿನ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆಯ ಕೊರತೆ");
      warningSymptomsEn.push("Nervous strain, analytical overthinking, and skin sensitivities");
      warningSymptomsEn.push("Confusion transitioning from manual grind to commercial or tech ventures");
      warningSymptomsEn.push("Carelessness in business documentation or written contracts");

      recommendedShantiRemediesKn.push("ಬುಧವಾರ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಸಿರು ಹೆಸರುಕಾಳು ದಾನ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಹಸಿರು ವಸ್ತ್ರ ಧರಿಸಿ ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶನಿ-ಬುಧ ಸಂಧಿ ಶಾಂತಿ ಮತ್ತು ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Vishnu Sahasranama on Wednesdays and donate green gram");
      recommendedShantiRemediesEn.push("Offer fresh green grass to sacred cows");
      recommendedShantiRemediesEn.push("Perform Shani-Budha Sandhi Shanti and Vishnu Archana at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶನಿ-ಬುಧ ಸಂಧಿ ಶಾಂತಿ & ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸಂಕಲ್ಪ ಸೇವೆ";
      gokarnaSevaEn = "Shani-Budha Sandhi Shanti & Vishnu Sahasranama Seva at Sri Kshetra Gokarna";
    } else if (code === "mercury_ketu") {
      descriptionKn = `17 ವರ್ಷಗಳ ಬುಧ ಮಹಾದಶೆಯಿಂದ 7 ವರ್ಷಗಳ ಕೇತು ಮಹಾದಶೆಗೆ ಪಾದಾರ್ಪಣೆ ಮಾಡುವ ಆಂತರಿಕ ಸಂಧಿಕಾಲವಿದು. ಲೌಕಿಕ ಲೆಕ್ಕಾಚಾರ, ಬುದ್ಧಿಯ ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯಾಪಾರದ ಆಡಂಬರದಿಂದ ಮುಕ್ತವಾಗಿ ಆಧ್ಯಾತ್ಮಿಕ ವೈರಾಗ್ಯ, ಆತ್ಮಶೋಧನೆ ಮತ್ತು ಆಂತರಿಕ ಸತ್ಯದ ಕಡೆಗೆ ಜೀವನ ತಿರುಗುತ್ತದೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಲೌಕಿಕ ಸಂಬಂಧಗಳ ಬಗ್ಗೆ ದಿಢೀರ್ ನಿರಾಸಕ್ತಿ, ಉದರ ದೋಷಗಳು ಹಾಗೂ ನಂಬಿದವರಿಂದ ನಿರೀಕ್ಷಿತ ಸ್ಪಂದನೆ ಸಿಗದಿರುವ ಮಾನಸಿಕ ಕ್ಷೋಭೆ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.`;
      descriptionEn = `Transition from 17-year Mercury Dasha into 7-year Ketu Dasha. Shifting from commercial calculation and intellectual agility into spiritual detachment, inward reflection, and karmic dissolution. Expect sudden withdrawal from superficial social circuits and digestive fluctuations.`;

      warningSymptomsKn.push("ಲೌಕಿಕ ವ್ಯವಹಾರಗಳ ಬಗ್ಗೆ ದಿಢೀರ್ ನಿರಾಸಕ್ತಿ ಮತ್ತು ಆಂತರಿಕವಾಗಿ ಏಕಾಂತದ ಹಂಬಲ");
      warningSymptomsKn.push("ಅಜೀರ್ಣ, ಉದರ ದೋಷ ಅಥವಾ ನಿಗೂಢ ಚರ್ಮದ ಅಲರ್ಜಿಗಳು");
      warningSymptomsKn.push("ನಂಬಿದ ಪಾಲುದಾರರಿಂದ ಅಥವಾ ಸ್ನೇಹಿತರಿಂದ ನಿರೀಕ್ಷಿತ ಸಹಕಾರ ಸಿಗದಿರುವುದು");
      warningSymptomsEn.push("Sudden loss of interest in mundane transactions and craving for solitude");
      warningSymptomsEn.push("Digestive anomalies, gut sensitivity, or subtle skin allergies");
      warningSymptomsEn.push("Lack of expected cooperation from close business associates or peers");

      recommendedShantiRemediesKn.push("ಪ್ರತಿದಿನ ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಿಸಿ ಗರಿಕೆ ಹುಲ್ಲಿನಿಂದ ಗಣಪತಿಗೆ ಅರ್ಚನೆ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ನವಧಾನ್ಯ ದಾನ ಮಾಡಿ ಬೀದಿ ನಾಯಿಗಳಿಗೆ ರೊಟ್ಟಿ ಅಥವಾ ಆಹಾರ ನೀಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಗಣಪತಿ ಮೋದಕ ಹವನ ಮತ್ತು ಬುಧ-ಕೇತು ಸಂಧಿ ಶಾಂತಿ ಪೂಜೆ ಸಮರ್ಪಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Ganesha Atharvashirsha daily and offer sacred Durva grass");
      recommendedShantiRemediesEn.push("Donate multi-grains and feed animals or dogs");
      recommendedShantiRemediesEn.push("Perform Ganesha Modaka Havanas and Budha-Ketu Sandhi Shanti at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಬುಧ-ಕೇತು ಸಂಧಿ ಶಾಂತಿ & ಗಣಪತಿ ಮೋದಕ ಹವನ";
      gokarnaSevaEn = "Budha-Ketu Sandhi Shanti & Ganesha Modaka Homa at Sri Kshetra Gokarna";
    } else if (code === "ketu_venus") {
      descriptionKn = `7 ವರ್ಷಗಳ ತಪಸ್ಸು ಹಾಗೂ ವೈರಾಗ್ಯದ ಕೇತು ಮಹಾದಶೆ ಮುಗಿದು 20 ವರ್ಷಗಳ ಭೋಗ-ಭಾಗ್ಯದ ಶುಕ್ರ ಮಹಾದಶೆ ಆರಂಭವಾಗುವ ಶುಭ ಸಂಧಿಕಾಲವಿದು. ಶೂನ್ಯತೆ ಹಾಗೂ ಕಷ್ಟಗಳ ಹಾದಿಯಿಂದ ಸಕಲ ಲೌಕಿಕ ಸುಖ, ವಾಹನ, ಆಸ್ತಿ, ಪ್ರೀತಿ ಮತ್ತು ಕೌಟುಂಬಿಕ ಸೌಭಾಗ್ಯದ ಸುವರ್ಣ ಯುಗಕ್ಕೆ ನೀವು ಕಾಲಿಡುತ್ತಿದ್ದೀರಿ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಶರೀರವು ನೂತನ ಸುಖೋಪಭೋಗಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಾಗ ಹಾರ್ಮೋನ್ ಏರುಪೇರು, ದಿಢೀರ್ ವೆಚ್ಚಗಳ ಹೆಚ್ಚಳ ಹಾಗೂ ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳನ್ನು ಮರೆತು ಹೊಸ ಜೀವನಕ್ಕೆ ಒಗ್ಗಿಕೊಳ್ಳುವ ಸವಾಲು ಇರುತ್ತದೆ.`;
      descriptionEn = `Transition from 7-year ascetic Ketu Dasha into 20-year luxurious Venus Dasha. Stepping out of isolation and austerity into the golden realm of romance, material prosperity, aesthetic joy, and family celebrations. Mind and body must adapt gracefully to expanding abundance without slipping into indulgence.`;

      warningSymptomsKn.push("ಹಾರ್ಮೋನ್ ಏರುಪೇರು, ಮಧುಮೇಹ/ಸಕ್ಕರೆ ಮಟ್ಟ ಅಥವಾ ಮೂತ್ರಾಂಗದ ಸೂಕ್ಷ್ಮತೆ");
      warningSymptomsKn.push("ದಿಢೀರ್ ಖರ್ಚುಗಳು ಹೆಚ್ಚಾಗುವುದು, ಐಷಾರಾಮಿ ವಸ್ತುಗಳ ಮೇಲಿನ ವ್ಯಾಮೋಹ");
      warningSymptomsKn.push("ಹೊಸ ಸಂಬಂಧಗಳ ಆಗಮನ ಮತ್ತು ಹಳೆಯ ಭಾವನಾತ್ಮಕ ಗಂಟುಗಳನ್ನು ಬಿಡಿಸುವ ಸವಾಲು");
      warningSymptomsEn.push("Hormonal shifts, urinary tract sensitivities, or blood sugar fluctuations");
      warningSymptomsEn.push("Sudden surge in lifestyle expenses and attraction to luxury assets");
      warningSymptomsEn.push("Arrival of new alliances requiring closure of past emotional baggage");

      recommendedShantiRemediesKn.push("ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟಕಂ ಪಠಿಸಿ ಬಿಳಿ ಹೂವುಗಳಿಂದ ಪೂಜಿಸಿ");
      recommendedShantiRemediesKn.push("ಹಸುವಿಗೆ ಬೆಲ್ಲ-ಅಕ್ಕಿ ನೀಡಿ, ಮುತ್ತೈದೆಯರಿಗೆ ಸುವಾಸಿನೀ ಪೂಜೆ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕೇತು-ಶುಕ್ರ ಸಂಧಿ ನಿವಾರಣಾ ಶಾಂತಿ ಮತ್ತು ಮಹಾಲಕ್ಷ್ಮಿ ಕೃತಜ್ಞತಾ ಪೂಜೆ ಸಮರ್ಪಿಸಿ");
      recommendedShantiRemediesEn.push("Recite Sri Mahalakshmi Ashtakam on Fridays with white flowers");
      recommendedShantiRemediesEn.push("Feed cows with jaggery and rice, sponsor Suvasini Pooja");
      recommendedShantiRemediesEn.push("Perform Ketu-Shukra Sandhi Shanti and Mahalakshmi Pooja at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಕೇತು-ಶುಕ್ರ ಸಂಧಿ ಶಾಂತಿ & ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ";
      gokarnaSevaEn = "Ketu-Shukra Sandhi Shanti & Sri Mahalakshmi Pooja at Sri Kshetra Gokarna";
    } else if (code === "sun_moon") {
      descriptionKn = `6 ವರ್ಷಗಳ ಪ್ರಖರ ಸೂರ್ಯ ಮಹಾದಶೆ ಮುಗಿದು 10 ವರ್ಷಗಳ ತಂಪು ಹಾಗೂ ಶಾಂತಿಯ ಚಂದ್ರ ಮಹಾದಶೆ ಆರಂಭವಾಗುವ ಸಂಧಿಕಾಲವಿದು. ಸೂರ್ಯನ ಉಗ್ರ ಅಧಿಕಾರ, ಆಡಳಿತಾತ್ಮಕ ಸಂಘರ್ಷಗಳಿಂದ ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಬಂಧಗಳತ್ತ ಜೀವನ ಸಾಗುತ್ತದೆ. ಈ ಸಂಧಿಕಾಲದಲ್ಲಿ ಭಾವನಾತ್ಮಕ ಅತಿಸೂಕ್ಷ್ಮತೆ, ನಿದ್ರಾಹೀನತೆ, ಕಫ/ಶೀತದ ಬಾಧೆ ಹಾಗೂ ತಾಯಿಯವರ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರು ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು.`;
      descriptionEn = `Transition from 6-year sovereign Sun Dasha into 10-year peaceful Moon Dasha. The intense heat of public duty gives way to emotional tides, family connection, and mental tranquility. Requires nurturing emotional resilience and managing sleep routines.`;

      warningSymptomsKn.push("ಭಾವನಾತ್ಮಕ ಅತಿಸೂಕ್ಷ್ಮತೆ, ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಕಣ್ಣೀರು ಅಥವಾ ಆಂತರಿಕ ಆತಂಕ");
      warningSymptomsKn.push("ನಿದ್ರಾಹೀನತೆ, ಕಫ/ಶೀತ ಅಥವಾ ನೀರಿನಿಂದ ಬರುವ ಅಲರ್ಜಿಗಳು");
      warningSymptomsKn.push("ತಾಯಿಯವರ ಆರೋಗ್ಯದಲ್ಲಿ ಏರುಪೇರು ಅಥವಾ ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ ಸೂಕ್ಷ್ಮತೆ");
      warningSymptomsEn.push("Emotional hypersensitivity and heightened mood fluctuations");
      warningSymptomsEn.push("Insomnia, phlegm/sinus congestion, or waterborne sensitivities");
      warningSymptomsEn.push("Fluctuations in mother's health and domestic emotional adjustments");

      recommendedShantiRemediesKn.push("ಸೋಮವಾರ ಶಿವನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ ಚಂದ್ರ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ");
      recommendedShantiRemediesKn.push("ಬೆಳ್ಳಿ ಆಭರಣ ಧರಿಸಿ ಹಾಲು ಮತ್ತು ಅಕ್ಕಿಯನ್ನು ಬಡವರಿಗೆ ದಾನ ಮಾಡಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಚಂದ್ರಮೌಳೇಶ್ವರ ಪೂಜೆ ಮತ್ತು ಸೂರ್ಯ-ಚಂದ್ರ ಸಂಧಿ ಶಾಂತಿ ಸೇವೆ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesEn.push("Chant Chandra Gayatri Mantra and offer milk abhisheka on Mondays");
      recommendedShantiRemediesEn.push("Donate milk and rice to the needy");
      recommendedShantiRemediesEn.push("Sponsor Chandramouleshwara Pooja and Surya-Chandra Sandhi Shanti at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸೂರ್ಯ-ಚಂದ್ರ ಸಂಧಿ ಶಾಂತಿ & ಕ್ಷೀರಾಭಿಷೇಕ";
      gokarnaSevaEn = "Surya-Chandra Sandhi Shanti & Ksheerabhisheka at Sri Kshetra Gokarna";
    } else if (code === "moon_mars") {
      descriptionKn = `10 ವರ್ಷಗಳ ಶಾಂತ ಮನೋಭಾವದ ಚಂದ್ರ ಮಹಾದಶೆ ಮುಗಿದು 7 ವರ್ಷಗಳ ತೀಕ್ಷ್ಣ ಹಾಗೂ ಸಾಹಸಪ್ರಧಾನ ಕುಜ ಮಹಾದಶೆ ಆರಂಭವಾಗುವ ಸಂಧಿಕಾಲವಿದು. ಜಲದಿಂದ ಅಗ್ನಿಗೆ ಪಲ್ಲಟಗೊಳ್ಳುವ ಈ ಕಾಲದಲ್ಲಿ ರಕ್ತದೊತ್ತಡ, ಅಸಹನೆ, ಕೋಪೋದ್ರೇಕ ಹಾಗೂ ಆಸ್ತಿ/ಭೂಮಿ ವಿಚಾರಗಳಲ್ಲಿ ದುಡುಕಿನ ನಿರ್ಧಾರಗಳ ಅಪಾಯವಿರುತ್ತದೆ. ಶಕ್ತಿ ಮತ್ತು ಧೈರ್ಯ ಹೆಚ್ಚಾದರೂ ಸಂಯಮ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅತಿ ಮುಖ್ಯ.`;
      descriptionEn = `Transition from 10-year Moon Dasha into 7-year dynamic Mars Dasha. Shifting from water into fire. Energy, ambition, and property drive surge, but require disciplined temper control to avoid hasty conflicts or vehicular recklessness.`;

      warningSymptomsKn.push("ಕ್ಷಣಿಕ ಸಿಡುಕುತನ, ಅಸಹನೆ ಮತ್ತು ಮನೆಯವರೊಂದಿಗೆ ಆವೇಶದ ಮಾತುಗಳು");
      warningSymptomsKn.push("ರಕ್ತದ ಒತ್ತಡ, ಚರ್ಮದಲ್ಲಿ ಉರಿ ಅಥವಾ ಸಣ್ಣಪುಟ್ಟ ಗಾಯಗಳ ಸಂಭವ");
      warningSymptomsKn.push("ಆಸ್ತಿ, ಜಮೀನು ಅಥವಾ ವಾಹನ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಆತುರದ ನಿರ್ಧಾರಗಳಿಂದ ನಷ್ಟ");
      warningSymptomsEn.push("Short-tempered outbursts, impatience, and aggressive speech at home");
      warningSymptomsEn.push("Blood pressure spikes, skin heat rashes, or minor physical bruises");
      warningSymptomsEn.push("Hasty decisions in real estate, land acquisition, or vehicular purchases");

      recommendedShantiRemediesKn.push("ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟೋತ್ತರ ಪಠಿಸಿ ದಾಳಿಂಬೆ ಹಣ್ಣು ಅರ್ಪಿಸಿ");
      recommendedShantiRemediesKn.push("ತೊಗರಿಬೇಳೆ ದಾನ ಮಾಡಿ, ಸಿಹಿಯನ್ನು ಸಹೋದರರಿಗೆ ಹಂಚಿ");
      recommendedShantiRemediesKn.push("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಚಂದ್ರ-ಕುಜ ಸಂಧಿ ಶಾಂತಿ ಮತ್ತು ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ ನೆರವೇರಿಸಿ");
      recommendedShantiRemediesEn.push("Recite Subramanya Ashtottara on Tuesdays");
      recommendedShantiRemediesEn.push("Donate red lentils and share sweets with siblings");
      recommendedShantiRemediesEn.push("Sponsor Chandra-Kuja Sandhi Shanti and Subramanya Homa at Sri Kshetra Gokarna");
      gokarnaSevaKn = "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಚಂದ್ರ-ಕುಜ ಸಂಧಿ ಶಾಂತಿ & ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ";
      gokarnaSevaEn = "Chandra-Kuja Sandhi Shanti & Subramanya Homa at Sri Kshetra Gokarna";
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

    // Chart-specific warning symptoms for incoming houses and placement
    if (inHouses.houseNumbers.includes(10) || inPlacementHouse === 10) {
      warningSymptomsKn.unshift("ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಹಠಾತ್ ಜವಾಬ್ದಾರಿ ಬದಲಾವಣೆ ಅಥವಾ ಕರ್ಮ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಸವಾಲುಗಳು");
      warningSymptomsEn.unshift("Sudden structural shift or new executive responsibilities in professional career");
    }
    if (inHouses.houseNumbers.includes(2) || inHouses.houseNumbers.includes(11) || inHouses.houseNumbers.includes(12)) {
      warningSymptomsKn.unshift("ಧನ ಸಂಗ್ರಹ ಹಾಗೂ ಹಠಾತ್ ದೊಡ್ಡ ಮೊತ್ತದ ವ್ಯಯ/ಹೂಡಿಕೆಗಳ ನಡುವೆ ಸಮತೋಲನದ ಒತ್ತಡ");
      warningSymptomsEn.unshift("Balancing cash flow accumulation against sudden large lifestyle or family expenditures");
    }
    if (inHouses.houseNumbers.includes(7) || inPlacementHouse === 7) {
      warningSymptomsKn.unshift("ದಾಂಪತ್ಯದಲ್ಲಿ ಅಥವಾ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ನೂತನ ಹೊಂದಾಣಿಕೆ ಹಾಗೂ ಸಂವಹನ ಜಾಗರೂಕತೆ");
      warningSymptomsEn.unshift("Need for conscious communication and emotional adaptation in marriage or partnerships");
    }
    if (inHouses.houseNumbers.includes(6) || inHouses.houseNumbers.includes(8) || [6, 8].includes(inPlacementHouse)) {
      warningSymptomsKn.unshift("ಆಕಸ್ಮಿಕ ಅಡೆತಡೆಗಳು, ಸಾಲದ ಲೆಕ್ಕಾಚಾರ ಅಥವಾ ಆಂತರಿಕ ಆತಂಕದ ಬಗ್ಗೆ ಮುನ್ನೆಚ್ಚರಿಕೆ ಅಗತ್ಯ");
      warningSymptomsEn.unshift("Vigilance against sudden friction, pending liabilities, or health/anxiety fluctuations");
    }
    if (inHouses.houseNumbers.includes(4) || inPlacementHouse === 4) {
      warningSymptomsKn.unshift("ಗೃಹ ಶಾಂತಿ, ವಾಸಸ್ಥಳ ಬದಲಾವಣೆ ಅಥವಾ ವಾಹನ-ಆಸ್ತಿ ವಿಚಾರಗಳಲ್ಲಿ ಸೂಕ್ಷ್ಮತೆ");
      warningSymptomsEn.unshift("Sensitivities surrounding domestic peace, residence relocation, or property matters");
    }

    descriptionKn = lagnaIntroKn + descriptionKn;
    descriptionEn = lagnaIntroEn + descriptionEn;

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
    const lagnaKn = toKannadaRashi(kundli.lagnaRashi.english);
    const lagnaEn = kundli.lagnaRashi.english;
    const { housesKn, housesEn, houseNumbers } = getBhuktiLordHouses(span.bhukti, lagnaIdx);
    const placementHouse = pBhukti?.house ?? 1;
    const bhuktiLordPlacementKn = `${placementHouse}ನೇ ಮನೆಯಲ್ಲಿ (${toKannadaRashi(pBhukti?.rashi.english || "")}) ಸ್ಥಿತರಾಗಿದ್ದಾರೆ`;
    const bhuktiLordPlacementEn = `Placed in ${placementHouse}th House (${pBhukti?.rashi.english || ""})`;
    const pMahaHouse = pMaha?.house ?? 1;
    const pMahaRashiKn = toKannadaRashi(pMaha?.rashi.english || "");

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

    const dynamicPillars = buildDynamicBhuktiPillars(
      span.maha,
      span.bhukti,
      mahaKn,
      bhuktiKn,
      overallNature,
      houseDistanceLabelKn,
      houseDistanceLabelEn,
      housesKn,
      housesEn,
      houseNumbers,
      placementHouse,
      bhuktiLordPlacementKn,
      bhuktiLordPlacementEn,
      lagnaKn,
      lagnaEn,
      houseDist,
      pMahaHouse,
      pMahaRashiKn,
      context.gender
    );

    const headlineKn = dynamicPillars.headlineKn;
    const headlineEn = dynamicPillars.headlineEn;
    const whatToExpectOverviewKn = dynamicPillars.whatToExpectOverviewKn;
    const whatToExpectOverviewEn = dynamicPillars.whatToExpectOverviewEn;
    const careerProspectsKn = dynamicPillars.careerProspectsKn;
    const careerProspectsEn = dynamicPillars.careerProspectsEn;
    const financialProspectsKn = dynamicPillars.financialProspectsKn;
    const financialProspectsEn = dynamicPillars.financialProspectsEn;
    const familyMarriageProspectsKn = dynamicPillars.familyMarriageProspectsKn;
    const familyMarriageProspectsEn = dynamicPillars.familyMarriageProspectsEn;
    const healthMindProspectsKn = dynamicPillars.healthMindProspectsKn;
    const healthMindProspectsEn = dynamicPillars.healthMindProspectsEn;
    const precautionsKn = dynamicPillars.precautionsKn;
    const precautionsEn = dynamicPillars.precautionsEn;
    const gokarnaPariharaKn = dynamicPillars.gokarnaPariharaKn;
    const gokarnaPariharaEn = dynamicPillars.gokarnaPariharaEn;

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

// ---------------------------------------------------------------------------
// 4. Dynamic 9-Graha Parashari Pillar Synthesis Engine
// ---------------------------------------------------------------------------

function buildDynamicBhuktiPillars(
  mahaPlanet: PlanetName,
  bhuktiPlanet: PlanetName,
  mahaKn: string,
  bhuktiKn: string,
  overallNature: BhuktiForecastItem["overallNature"],
  houseDistanceLabelKn: string,
  houseDistanceLabelEn: string,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  bhuktiLordPlacementKn: string,
  bhuktiLordPlacementEn: string,
  lagnaKn: string,
  lagnaEn: string,
  houseDist: number,
  pMahaHouse: number,
  pMahaRashiKn: string,
  gender?: string
): {
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
} {
  const isChallenging = overallNature === "turbulent" || overallNature === "challenging";
  const isHighlyAuspicious = overallNature === "highly_auspicious";

  // 1. Dynamic Headline integrating house lordship & placement
  let headlineKn = "";
  let headlineEn = "";
  if (houseNumbers.includes(10) || placementHouse === 10) {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಿಂದ 10ನೇ ಕರ್ಮ ಸ್ಥಾನ ಸಕ್ರಿಯ: ಉದ್ಯೋಗ ಬಲವರ್ಧನೆ & ನಾಯಕತ್ವ (${mahaKn}-${bhuktiKn})`;
    headlineEn = `${bhuktiPlanet} Energizes 10th House: Career Breakthrough & Stature (${mahaPlanet}-${bhuktiPlanet})`;
  } else if (houseNumbers.includes(2) || houseNumbers.includes(11) || [2, 11].includes(placementHouse)) {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಿಂದ ಧನ-ಲಾಭ ಸ್ಥಾನಗಳ ಜಾಗೃತಿ: ಆರ್ಥಿಕ ವೃದ್ಧಿ & ಉಳಿತಾಯ (${mahaKn}-${bhuktiKn})`;
    headlineEn = `${bhuktiPlanet} Activates Wealth Houses: Financial Growth & Assets (${mahaPlanet}-${bhuktiPlanet})`;
  } else if (houseNumbers.includes(7) || placementHouse === 7) {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಿಂದ 7ನೇ ಕಳತ್ರ ಸ್ಥಾನ ಸಕ್ರಿಯ: ಪಾಲುದಾರಿಕೆ & ದಾಂಪತ್ಯ ಸಮನ್ವಯ (${mahaKn}-${bhuktiKn})`;
    headlineEn = `${bhuktiPlanet} Activates 7th House: Matrimony & Strategic Alliances (${mahaPlanet}-${bhuktiPlanet})`;
  } else if (houseNumbers.includes(5) || houseNumbers.includes(9) || [5, 9].includes(placementHouse)) {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಿಂದ ತ್ರಿಕೋನ ಭಾಗ್ಯೋದಯ: ದೈವಬಲ & ಯೋಜನೆಗಳ ಸಾಫಲ್ಯ (${mahaKn}-${bhuktiKn})`;
    headlineEn = `${bhuktiPlanet} Trikona Alignment: Fortune, Wisdom & Milestones (${mahaPlanet}-${bhuktiPlanet})`;
  } else if (isChallenging) {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಲ್ಲಿ ಎಚ್ಚರಿಕೆ & ಸಂಯಮ ಅಗತ್ಯ: ${houseDistanceLabelKn} (${mahaKn}-${bhuktiKn})`;
    headlineEn = `Strategic Caution & Composure: Navigating ${houseDistanceLabelEn} (${mahaPlanet}-${bhuktiPlanet})`;
  } else {
    headlineKn = `${bhuktiKn} ಪ್ರಭಾವದಿಂದ ${housesKn} ಫಲಗಳ ವಿಕಾಸ: ಕಾರ್ಯ ಪ್ರಗತಿ & ಸ್ಥಿರತೆ (${mahaKn}-${bhuktiKn})`;
    headlineEn = `${bhuktiPlanet} Progressively Unfolds ${housesEn}: Steady Milestone Gains (${mahaPlanet}-${bhuktiPlanet})`;
  }

  // 2. What To Expect Overview
  let whatToExpectOverviewKn = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ${lagnaKn} ಲಗ್ನಕ್ಕೆ, ${mahaKn} ಮಹಾದಶೆಯ (${pMahaHouse}ನೇ ಮನೆ) ವಿಶಾಲ ಆಡಳಿತದಡಿ ${bhuktiKn} ಭುಕ್ತಿಯು ಕಾರ್ಯಾರಂಭ ಮಾಡಿದೆ. ಈ ಭುಕ್ತ್ಯಾಧಿಪತಿಯು ${housesKn} ಒಡೆಯನಾಗಿ ${bhuktiLordPlacementKn}. ಮಹಾದಶಾಧಿಪತಿ ಮತ್ತು ಭುಕ್ತ್ಯಾಧಿಪತಿಯ ನಡುವೆ ${houseDistanceLabelKn} ಏರ್ಪಟ್ಟಿದ್ದು, `;
  let whatToExpectOverviewEn = `For your ${lagnaEn} Ascendant, under the overarching term of ${mahaPlanet} Mahadasha (in ${pMahaHouse}th house), ${bhuktiPlanet} Antardasha takes charge as lord of ${housesEn} (${bhuktiLordPlacementEn}). Operating through ${houseDistanceLabelEn}, `;

  if (isHighlyAuspicious) {
    whatToExpectOverviewKn += `ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳಿಗೆ ದೈವಿಕ ಬೆಂಬಲ, ಧನಲಾಭ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ನೂತನ ಗೌರವ ತರಲಿದೆ. ದೀರ್ಘಕಾಲದ ಅಡೆತಡೆಗಳು ಕರಗಿ ಯೋಜನೆಗಳು ವೇಗವಾಗಿ ಕಾರ್ಯರೂಪಕ್ಕೆ ಬರಲಿವೆ.`;
    whatToExpectOverviewEn += `this period unlocks divine momentum, financial elevation, and respected stature, dissolving lingering bottlenecks into tangible success.`;
  } else if (isChallenging) {
    whatToExpectOverviewKn += `ಕಾರ್ಯಕ್ಷೇತ್ರ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯಲ್ಲಿ ನಿಮ್ಮ ತಾಳ್ಮೆ ಮತ್ತು ಸಂಯಮವನ್ನು ಪರೀಕ್ಷಿಸಲಿದೆ. ದುಡುಕಿನ ಆವೇಶದ ನಿರ್ಧಾರಗಳನ್ನು ತ್ಯಜಿಸಿ ವಾಸ್ತವಕ್ಕೆ ತಕ್ಕಂತೆ ಹೆಜ್ಜೆ ಇಡುವುದು ಶ್ರೇಯಸ್ಕರ.`;
    whatToExpectOverviewEn += `this transit rigorously tests your endurance, patience, and composure. Impulsive initiatives must yield to calculated, grounded execution.`;
  } else {
    whatToExpectOverviewKn += `ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಹಂತಹಂತವಾದ ಬೆಳವಣಿಗೆಯನ್ನು ನೀಡಲಿದೆ. ನೂತನ ಯೋಜನೆಗಳಿಗೆ ಭದ್ರ ಬುನಾದಿ ಹಾಕಿ ಭವಿಷ್ಯದ ಅಭಿವೃದ್ಧಿಗೆ ಸಜ್ಜಾಗಲು ಇದು ಸೂಕ್ತ ಕಾಲಾವಧಿ.`;
    whatToExpectOverviewEn += `it yields progressive milestone gains commensurate with honest labor, providing a stable launchpad for long-term aspirations.`;
  }

  // 3. Modally Built 5 Pillars
  const career = buildPersonalizedCareer(
    bhuktiPlanet,
    housesKn,
    housesEn,
    houseNumbers,
    placementHouse,
    bhuktiLordPlacementKn,
    bhuktiLordPlacementEn,
    houseDist,
    isChallenging,
    mahaKn,
    bhuktiKn,
    mahaPlanet
  );

  const finances = buildPersonalizedFinances(
    bhuktiPlanet,
    housesKn,
    housesEn,
    houseNumbers,
    placementHouse,
    bhuktiLordPlacementKn,
    bhuktiLordPlacementEn,
    houseDist,
    isChallenging
  );

  const family = buildPersonalizedFamilyMarriage(
    bhuktiPlanet,
    housesKn,
    housesEn,
    houseNumbers,
    placementHouse,
    bhuktiLordPlacementKn,
    bhuktiLordPlacementEn,
    houseDist,
    isChallenging,
    gender
  );

  const health = buildPersonalizedHealthMind(
    bhuktiPlanet,
    housesKn,
    housesEn,
    houseNumbers,
    placementHouse,
    bhuktiLordPlacementKn,
    bhuktiLordPlacementEn,
    houseDist,
    isChallenging
  );

  const precautions = buildPersonalizedPrecautions(
    bhuktiPlanet,
    housesKn,
    housesEn,
    houseNumbers,
    placementHouse,
    houseDist,
    isChallenging
  );

  const gokarnaRemedy = buildPersonalizedGokarnaRemedy(
    bhuktiPlanet,
    housesKn,
    houseNumbers,
    placementHouse
  );

  return {
    headlineKn,
    headlineEn,
    whatToExpectOverviewKn,
    whatToExpectOverviewEn,
    careerProspectsKn: career.kn,
    careerProspectsEn: career.en,
    financialProspectsKn: finances.kn,
    financialProspectsEn: finances.en,
    familyMarriageProspectsKn: family.kn,
    familyMarriageProspectsEn: family.en,
    healthMindProspectsKn: health.kn,
    healthMindProspectsEn: health.en,
    precautionsKn: precautions.kn,
    precautionsEn: precautions.en,
    gokarnaPariharaKn: gokarnaRemedy.kn,
    gokarnaPariharaEn: gokarnaRemedy.en
  };
}

// ---------------------------------------------------------------------------
// 5. Modular Deeply Personalized Parashari Pillar Builders
// ---------------------------------------------------------------------------

function buildPersonalizedCareer(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  bhuktiLordPlacementKn: string,
  bhuktiLordPlacementEn: string,
  houseDist: number,
  isChallenging: boolean,
  mahaKn: string,
  bhuktiKn: string,
  mahaPlanet: PlanetName
): { kn: string; en: string } {
  let housePartKn = "";
  let housePartEn = "";

  if (houseNumbers.includes(10) || placementHouse === 10) {
    housePartKn = "ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನಕ್ಕೆ 10ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಸಕ್ರಿಯತೆಯಿಂದಾಗಿ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನಾಯಕತ್ವದ ಹುದ್ದೆ, ನಿರ್ಣಾಯಕ ಬಡ್ತಿ ಹಾಗೂ ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಅಧಿಕಾರ ವಿಸ್ತರಣೆಯ ಯೋಗವಿದೆ.";
    housePartEn = "With the 10th house of Karma directly energized, executive leadership, pivotal promotions, and expanded departmental authority manifest.";
  } else if (houseNumbers.includes(1) || placementHouse === 1) {
    housePartKn = "1ನೇ ತನು ಭಾವದ ಸಂಪರ್ಕದಿಂದಾಗಿ ನಿಮ್ಮ ಸ್ವಂತ ನಾಯಕತ್ವ, ನಿರ್ಧಾರ ಶಕ್ತಿ ಹಾಗೂ ವ್ಯಕ್ತಿತ್ವದ ವರ್ಚಸ್ಸಿನಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಹೊಸ ಹಂತ ತಲುಪುವಿರಿ.";
    housePartEn = "Connecting directly with the 1st house (Ascendant), your personal initiative, charisma, and decisive leadership elevate your professional standing.";
  } else if (houseNumbers.includes(6) || placementHouse === 6) {
    housePartKn = "6ನೇ ಸೇವಾ-ಸ್ಪರ್ಧಾ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ತೀವ್ರ ಪೈಪೋಟಿ ಹಾಗೂ ವಿರೋಧಿಗಳ ಸವಾಲುಗಳನ್ನು ನಿರಂತರ ಪರಿಶ್ರಮದಿಂದ ಮೆಟ್ಟಿ ನಿಲ್ಲುವಿರಿ.";
    housePartEn = "Influencing the 6th house of competitive service, workplace rivalries and complex operational challenges are overcome through disciplined perseverance.";
  } else if (houseNumbers.includes(7) || placementHouse === 7) {
    housePartKn = "7ನೇ ವ್ಯಾಪಾರ-ಪಾಲುದಾರಿಕೆ ಸ್ಥಾನದ ಸಕ್ರಿಯತೆಯಿಂದ, ಹೊಸ ವಾಣಿಜ್ಯ ಒಪ್ಪಂದಗಳು, ಕ್ಲೈಂಟ್ ನೆಟ್‌ವರ್ಕ್ ವಿಸ್ತರಣೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕದಿಂದ ಯಶಸ್ಸು.";
    housePartEn = "Energizing the 7th house of partnerships and commerce, key contractual negotiations, client expansions, and public ventures thrive.";
  } else if (houseNumbers.includes(9) || placementHouse === 9) {
    housePartKn = "9ನೇ ಭಾಗ್ಯ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ, ವೃತ್ತಿಪರ ದೂರ ಪ್ರಯಾಣ, ಉನ್ನತ ಅಧಿಕಾರಿಗಳ ದೈವಿಕ ಬೆಂಬಲ ಹಾಗೂ ವೃತ್ತಿ ಭಾಗ್ಯೋದಯದ ಹೊಸ ಹಾದಿ ತೆರೆಯಲಿದೆ.";
    housePartEn = "Governing the 9th house of fortune, long-distance professional travels, patron mentorship, and auspicious career breakthroughs open up.";
  } else if (houseNumbers.includes(11) || placementHouse === 11) {
    housePartKn = "11ನೇ ಲಾಭ ಸ್ಥಾನದ ಸಕ್ರಿಯತೆಯಿಂದ, ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಸಾಧನೆಗೆ ಮನ್ನಣೆ, ಹೊಸ ಪ್ರಭಾವಿ ಸಂಪರ್ಕಗಳು ಹಾಗೂ ವೃತ್ತಿಪರ ಲಾಭ ಲಭಿಸಲಿದೆ.";
    housePartEn = "Activating the 11th house of gains, your past organizational contributions earn prestigious recognition and expanded lucrative networks.";
  } else if (houseNumbers.includes(3) || placementHouse === 3) {
    housePartKn = "3ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ಸ್ವಂತ ಸಾಹಸ, ಮಾರ್ಕೆಟಿಂಗ್, ಮಾಧ್ಯಮ ಅಥವಾ ತಾಂತ್ರಿಕ ನಾವೀನ್ಯತೆಗಳಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಗಮನಾರ್ಹ ಮುನ್ನಡೆ.";
    housePartEn = "Operating through the 3rd house of valor, creative enterprise, marketing campaigns, and technical ingenuity deliver notable progress.";
  } else if (houseNumbers.includes(8) || placementHouse === 8) {
    housePartKn = "8ನೇ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ವೃತ್ತಿಯಲ್ಲಿ ದಿಢೀರ್ ಕಾರ್ಯಭಾರ ಬದಲಾವಣೆ ಅಥವಾ ಆಂತರಿಕ ರಾಜಕೀಯದ ಒತ್ತಡ ಎದುರಾಗಬಹುದು; ಕಾಗದಪತ್ರಗಳಲ್ಲಿ ಪಾರದರ್ಶಕರಾಗಿರಿ.";
    housePartEn = "Involving the 8th house of transformation, sudden structural reassignments or hidden office dynamics require calculated composure and clear paperwork.";
  } else if (houseNumbers.includes(12) || placementHouse === 12) {
    housePartKn = "12ನೇ ವಿದೇಶ-ದೂರದೇಶ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ, ಹೊರರಾಜ್ಯ ಅಥವಾ ವಿದೇಶಿ ಕ್ಲೈಂಟ್‌ಗಳ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು ಹಾಗೂ ತೆರೆಮರೆಯ ಸಂಶೋಧನಾ ಕಾರ್ಯಗಳು ಫಲಪ್ರದ.";
    housePartEn = "Linking with the 12th house of overseas realms, foreign engagements, out-of-state projects, or behind-the-scenes research initiatives prosper.";
  } else {
    housePartKn = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದ ${housesKn} ಒಡೆಯನಾಗಿ ${bhuktiLordPlacementKn} ಸ್ಥಿತರಾಗಿರುವುದರಿಂದ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆಗೆ ತಕ್ಕಂತೆ ವೃತ್ತಿಯಲ್ಲಿ ಸ್ಥಿರ ಮುನ್ನಡೆ ಸಿಗಲಿದೆ.`;
    housePartEn = `Ruling ${housesEn} (${bhuktiLordPlacementEn}), steady professional advancement rewards sincere dedication.`;
  }

  let planetPartKn = "";
  let planetPartEn = "";
  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      planetPartKn = "ಸೂರ್ಯನ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ, ಸರ್ಕಾರಿ ಅಥವಾ ಸಾಂಸ್ಥಿಕ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ವಿಶ್ವಾಸಗಳಿಸುವಿರಿ.";
      planetPartEn = "Sun bestows administrative credibility, institutional recognition, and executive trust.";
      break;
    case PlanetName.Moon:
      planetPartKn = "ಚಂದ್ರನ ಕಾರಕತ್ವದಿಂದ ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ, ಮಾರ್ಕೆಟಿಂಗ್, ಸೃಜನಶೀಲತೆ, ಕಲೆ ಅಥವಾ ಜಲ-ಸಾರಿಗೆ ವ್ಯವಹಾರಗಳು ಚುರುಕುಗೊಳ್ಳಲಿವೆ.";
      planetPartEn = "Moon accelerates public relations, marketing campaigns, creative arts, logistics, and collaborative ventures.";
      break;
    case PlanetName.Mars:
      planetPartKn = "ಕುಜನ ಬಲದಿಂದ ತಾಂತ್ರಿಕ, ರಿಯಲ್ ಎಸ್ಟೇಟ್, ನಿರ್ಮಾಣ, ರಕ್ಷಣೆ ಅಥವಾ ಸ್ಪರ್ಧಾತ್ಮಕ ರಂಗದಲ್ಲಿ ದಿಟ್ಟ ಸಾಹಸದ ಮುನ್ನಡೆ ಸಾಧಿಸುವಿರಿ.";
      planetPartEn = "Mars fuels bold initiatives across engineering, real estate, construction, defense, or high-stakes competitive domains.";
      break;
    case PlanetName.Mercury:
      planetPartKn = "ಬುಧನ ಪ್ರಭಾವದಿಂದ ವಾಣಿಜ್ಯ, ಸಾಫ್ಟ್‌ವೇರ್, ಲೆಕ್ಕಪತ್ರ, ವಿಶ್ಲೇಷಣೆ, ಬರವಣಿಗೆ ಹಾಗೂ ಚುರುಕಿನ ಮಾತುಕತೆಗಳಿಂದ ಹೊಸ ಒಪ್ಪಂದಗಳು ಲಭಿಸಲಿವೆ.";
      planetPartEn = "Mercury empowers commercial transactions, software/data systems, accounting, and persuasive negotiations.";
      break;
    case PlanetName.Jupiter:
      planetPartKn = "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಕೃಪೆಯಿಂದ ಉನ್ನತ ಮಾರ್ಗದರ್ಶನ ಹುದ್ದೆಗಳು, ಶಿಕ್ಷಣ, ಸಲಹಾ ರಂಗ, ಬ್ಯಾಂಕಿಂಗ್ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ಜವಾಬ್ದಾರಿಗಳು ಸಿಗಲಿವೆ.";
      planetPartEn = "Jupiter bestows executive mentorship, academic laurels, advisory status, banking acumen, and moral leadership.";
      break;
    case PlanetName.Venus:
      planetPartKn = "ಶುಕ್ರನ ಪ್ರಭಾವದಿಂದ ವಿನ್ಯಾಸ, ಕಲೆ, ಆತಿಥ್ಯ, ಮಾಧ್ಯಮ, ವಾಹನ, ಐಷಾರಾಮಿ ಹಾಗೂ ಪಾಲುದಾರಿಕೆಯ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಆಕರ್ಷಕ ಬೆಳವಣಿಗೆ.";
      planetPartEn = "Venus elevates aesthetic design, creative media, hospitality, luxury automotive sectors, and lucrative partnerships.";
      break;
    case PlanetName.Saturn:
      planetPartKn = "ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಸಾಂಸ್ಥಿಕ ಶಿಸ್ತು, ಉತ್ಪಾದನೆ, ಕೈಗಾರಿಕೆ, ಕಾರ್ಯಾಚರಣೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ತಳಪಾಯ ಭದ್ರವಾಗಲಿದೆ.";
      planetPartEn = "Saturn anchors operational discipline, heavy industrial systems, manufacturing stability, and endurance-tested consolidation.";
      break;
    case PlanetName.Rahu:
      planetPartKn = "ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ನವೀನ ತಂತ್ರಜ್ಞಾನ, ಡಿಜಿಟಲ್ ರಂಗ, ವಿದೇಶಿ ವ್ಯವಹಾರಗಳು ಹಾಗೂ ಅಸಾಂಪ್ರದಾಯಿಕ ಮಾರ್ಗಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಗೋಚರಿಸಲಿವೆ.";
      planetPartEn = "Rahu sparks breakthroughs across digital technologies, offshore collaborations, and unconventional ventures.";
      break;
    case PlanetName.Ketu:
    default:
      planetPartKn = "ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ಆಳವಾದ ಸಂಶೋಧನೆ, ವಿಶಿಷ್ಟ ತಾಂತ್ರಿಕ ನೈಪುಣ್ಯ ಹಾಗೂ ಸ್ವತಂತ್ರ ಸಲಹಾ ವೃತ್ತಿಯಲ್ಲಿ ಅಪೂರ್ವ ಒಳನೋಟ ಲಭಿಸಲಿದೆ.";
      planetPartEn = "Ketu unlocks niche analytical insights, deep research breakthroughs, and esteemed independent consulting stature.";
      break;
  }

  let distPartKn = "";
  let distPartEn = "";
  if (houseDist === 6 || houseDist === 8) {
    distPartKn = `ಮಹಾದಶಾಧಿಪತಿ ${mahaKn} ಮತ್ತು ಭುಕ್ತ್ಯಾಧಿಪತಿ ${bhuktiKn} ಪರಸ್ಪರ 6-8ರ ಷಡಾಷ್ಟಕ ಸ್ಥಿತಿಯಲ್ಲಿರುವುದರಿಂದ, ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಅಹಂ ಸಂಘರ್ಷಕ್ಕೆ ಆಸ್ಪದ ನೀಡದೆ ಕಚೇರಿ ರಾಜಕೀಯದಿಂದ ದೂರವಿರಿ.`;
    distPartEn = `Operating in a 6-8 Shadashtaka angle between ${mahaPlanet} and ${bhuktiPlanet}, guard against ego friction with seniors and steer clear of partisan workplace politics.`;
  } else if (houseDist === 2 || houseDist === 12) {
    distPartKn = `ಪರಸ್ಪರ 2-12ರ ವ್ಯಯ ಯೋಗವಿರುವುದರಿಂದ ಉದ್ಯೋಗ ಸ್ಥಳ ಬದಲಾವಣೆ ಅಥವಾ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳುವಲ್ಲಿ ಸಂಯಮವಿರಲಿ.`;
    distPartEn = `Operating across a 2-12 Dwidwadasa axis, allow grace during role transitions or structural reorganizations.`;
  } else if (houseDist === 5 || houseDist === 9) {
    distPartKn = `ನವಪಂಚಮ ರಾಜಯೋಗ ಸಮನ್ವಯದಿಂದಾಗಿ ಯೋಜನೆಗಳು ಸರಾಗವಾಗಿ ಕೈಗೂಡಿ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರತಿಷ್ಠೆ ಹೆಚ್ಚಾಗಲಿದೆ.`;
    distPartEn = `Auspicious 5-9 Navapanchama synergy smoothens departmental approvals, elevating your professional goodwill.`;
  } else if ([1, 4, 7, 10].includes(houseDist)) {
    distPartKn = `ಕೇಂದ್ರ ಸಮನ್ವಯದಿಂದಾಗಿ ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ ಭದ್ರವಾಗಲಿದ್ದು, ನಿರ್ಣಾಯಕ ಜವಾಬ್ದಾರಿಗಳು ಲಭಿಸಲಿವೆ.`;
    distPartEn = `Angular Kendra alignment cements your role at the helm of strategic organizational priorities.`;
  } else {
    distPartKn = `ಉಪಚಯ ಪ್ರಭಾವದಿಂದ ಹಂತಹಂತವಾದ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗಲಿದೆ.`;
    distPartEn = `Upachaya momentum assures progressive gains commensurate with diligent labor.`;
  }

  return {
    kn: `${housePartKn} ${planetPartKn} ${distPartKn}`,
    en: `${housePartEn} ${planetPartEn} ${distPartEn}`
  };
}

function buildPersonalizedFinances(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  bhuktiLordPlacementKn: string,
  bhuktiLordPlacementEn: string,
  houseDist: number,
  isChallenging: boolean
): { kn: string; en: string } {
  let housePartKn = "";
  let housePartEn = "";

  if (houseNumbers.includes(2) || houseNumbers.includes(11) || [2, 11].includes(placementHouse)) {
    housePartKn = "ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದ ಧನ-ಲಾಭ (2ನೇ/11ನೇ) ಭಾವಗಳ ಸಕ್ರಿಯತೆಯಿಂದ, ಈ ಭುಕ್ತಿಯಲ್ಲಿ ಉಳಿತಾಯ ವೃದ್ಧಿ, ಹಳೆಯ ಬಾಕಿ ಹಣ ವಸೂಲಾತಿ ಹಾಗೂ ಬ್ಯಾಂಕ್ ಬ್ಯಾಲೆನ್ಸ್ ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಾಗಲಿದೆ.";
    housePartEn = "Activating wealth-generating 2nd and 11th houses, accumulated bank savings surge alongside successful recovery of pending dues.";
  } else if (houseNumbers.includes(5) || houseNumbers.includes(9) || [5, 9].includes(placementHouse)) {
    housePartKn = "ಲಕ್ಷ್ಮಿ ತ್ರಿಕೋನಗಳಾದ 5ನೇ ಅಥವಾ 9ನೇ ಸ್ಥಾನಗಳ ಸಂಪರ್ಕದಿಂದ, ಸಾತ್ವಿಕ ಧನಾಗಮನ, ಪೂರ್ವ ಪುಣ್ಯದ ಫಲವಾಗಿ ಆರ್ಥಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಸಮೃದ್ಧ ಲಾಭ.";
    housePartEn = "Connecting with Lakshmi Trikonas (5th/9th), auspicious financial inflows manifest through noble channels and profitable long-term portfolios.";
  } else if (houseNumbers.includes(6) || placementHouse === 6) {
    housePartKn = "6ನೇ ಋಣ ಸ್ಥಾನದ ಸಂಪರ್ಕವಿರುವುದರಿಂದ ಹಳೆಯ ಸಾಲಗಳನ್ನು ತೀರಿಸಲು ಉತ್ತಮ ಅವಕಾಶ ಸಿಕ್ಕರೂ, ಯಾರಿಗೂ ಸಾಲ ನೀಡುವುದು ಅಥವಾ ಜಾಮೀನು ನಿಲ್ಲುವುದು ಬೇಡ.";
    housePartEn = "Touching the 6th house of liabilities, an opportune window opens to liquidate debts, provided you avoid extending informal loans or collateral guarantees.";
  } else if (houseNumbers.includes(8) || placementHouse === 8) {
    housePartKn = "8ನೇ ಅನಿರೀಕ್ಷಿತ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ಆಕಸ್ಮಿಕ ಧನಲಾಭ ಅಥವಾ ವಿಮಾ/ಪಿತ್ರಾರ್ಜಿತ ಹಕ್ಕುಗಳ ಇತ್ಯರ್ಥದ ಜತೆಗೆ ದಿಢೀರ್ ದುರಸ್ತಿ ವೆಚ್ಚಗಳು ಬರಬಹುದು; ಊಹಾತ್ಮಕ ಅಪಾಯಕಾರಿ ಹೂಡಿಕೆಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ.";
    housePartEn = "Operating through the 8th house, unexpected settlements or insurance/inheritance flows balance against emergency maintenance expenses; strictly avoid speculative gambles.";
  } else if (houseNumbers.includes(12) || placementHouse === 12) {
    housePartKn = "12ನೇ ವ್ಯಯ ಸ್ಥಾನದ ಸಕ್ರಿಯತೆಯಿಂದಾಗಿ ಶುಭ ಸಮಾರಂಭಗಳು, ನೂತನ ಆಸ್ತಿ ಅಥವಾ ದೀರ್ಘಕಾಲಿಕ ಹೂಡಿಕೆಗಳಿಗಾಗಿ ಬೃಹತ್ ಪ್ರಮಾಣದ ಧನವ್ಯಯ ಅನಿವಾರ್ಯವಾಗಲಿದೆ.";
    housePartEn = "Activating the 12th house of expenditure, substantial capital allocations channel into auspicious domestic events, property acquisitions, or foreign ventures.";
  } else if (houseNumbers.includes(4) || placementHouse === 4) {
    housePartKn = "4ನೇ ಗೃಹ-ವಾಹನ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ, ಸ್ಥಿರಾಸ್ತಿ, ನಿವೇಶನ ಅಥವಾ ನೂತನ ವಾಹನ ಖರೀದಿಗೆ ಧನವಿನಿಯೋಗವಾಗಲಿದೆ.";
    housePartEn = "Engaging the 4th house of property and vehicles, assets channel into tangible real estate, home renovations, or automobile upgrades.";
  } else {
    housePartKn = `ದೈನಂದಿನ ಆರ್ಥಿಕ ಹರಿವು ಸಕ್ರಿಯವಾಗಿದ್ದು, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದ ${housesKn} ಒಡೆಯನ ಪ್ರಭಾವದಿಂದ ಬಜೆಟ್ ಶಿಸ್ತು ಕಾಪಾಡಿಕೊಂಡರೆ ಆರ್ಥಿಕ ಭದ್ರತೆ ಸುಧಾರಿಸಲಿದೆ.`;
    housePartEn = `Operating through ${housesEn}, disciplined cash flow stewardship strengthens long-term fiscal security.`;
  }

  let planetPartKn = "";
  let planetPartEn = "";
  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      planetPartKn = "ಸರ್ಕಾರಿ ಒಪ್ಪಂದಗಳು, ಅಧಿಕೃತ ವ್ಯವಹಾರಗಳು ಅಥವಾ ಪಿತ್ರಾರ್ಜಿತ ಹಕ್ಕುಗಳಿಂದ ಧನಾಗಮನ.";
      planetPartEn = "Inflows flow via institutional tenders, formal contracts, or ancestral property entitlements.";
      break;
    case PlanetName.Moon:
      planetPartKn = "ಹಣಕಾಸಿನ ಹರಿವು ದ್ರವ್ಯರೂಪದಲ್ಲಿ ಚುರುಕಾಗಿರಲಿದ್ದು, ಗೃಹಾಲಂಕಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖಕ್ಕಾಗಿ ವೆಚ್ಚಗಳು ಹೆಚ್ಚಾಗಬಹುದು.";
      planetPartEn = "Liquid monetary velocity stays high, with investments channeling into household aesthetics and domestic comfort.";
      break;
    case PlanetName.Mars:
      planetPartKn = "ಭೂಮಿ, ಜಮೀನು ಅಥವಾ ಯಂತ್ರೋಪಕರಣಗಳ ಖರೀದಿ-ಮಾರಾಟದಲ್ಲಿ ಲಾಭ. ಹಳೆಯ ಸಾಲಗಳನ್ನು ತೀರಿಸಲು ಸಕಾಲ.";
      planetPartEn = "Lucrative capital yields across land, real estate, or engineering assets support strategic debt retirement.";
      break;
    case PlanetName.Mercury:
      planetPartKn = "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಷೇರು/ಮ್ಯೂಚುಯಲ್ ಫಂಡ್‌ನಂತಹ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಸಮತೋಲಿತ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಬಹುಮುಖಿ ಆದಾಯ ಮೂಲಗಳು.";
      planetPartEn = "Commercial trading margins expand, with diversified analytical equities and mutual fund portfolios yielding steady dividends.";
      break;
    case PlanetName.Jupiter:
      planetPartKn = "ಧನಲಾಭವು ಸ್ಥಿರ ಹಾಗೂ ಸಾತ್ವಿಕ ಮಾರ್ಗದಲ್ಲಿ ಹರಿದುಬರಲಿದ್ದು, ಧರ್ಮ ಕಾರ್ಯಗಳಿಗೆ ವೆಚ್ಚ ಮಾಡುವ ಸೌಭಾಗ್ಯ ಸಿಗಲಿದೆ.";
      planetPartEn = "Sustainable and ethical financial prosperity, supporting meritorious charitable contributions and generational wealth creation.";
      break;
    case PlanetName.Venus:
      planetPartKn = "ಆಭರಣ, ಕಲೆ, ನೂತನ ವಾಹನ ಅಥವಾ ಆಸ್ತಿಯ ಖರೀದಿಗೆ ಅನುಕೂಲಕರವಾದ ಕಾಲಾವಧಿ. ಸೌಂದರ್ಯ ಮತ್ತು ಸುಖಭೋಗಗಳಿಗಾಗಿ ಧನವ್ಯಯ ಹೆಚ್ಚಾಗಲಿದೆ.";
      planetPartEn = "Favorable cycle for jewelry, luxury aesthetics, high-end vehicles, and lifestyle upgrades.";
      break;
    case PlanetName.Saturn:
      planetPartKn = "ನಿಧಾನವಾದರೂ ಸ್ಥಿರವಾದ ಉಳಿತಾಯ. ಕೈಗಾರಿಕೆ, ಕೃಷಿ, ಗಣಿ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿಗಳಲ್ಲಿ ಹಣ ಹೂಡಲು ಅನುಕೂಲ. ಅನಗತ್ಯ ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ ಶಿಸ್ತುಬದ್ಧವಾಗಿರಿ.";
      planetPartEn = "Methodical and conservative capital accumulation; ideal for industrial machinery, agricultural estates, and physical commodities.";
      break;
    case PlanetName.Rahu:
      planetPartKn = "ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನದ ಅವಕಾಶಗಳಿದ್ದರೂ, ಊಹಾತ್ಮಕ (Speculative) ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು, ಅಪರಿಚಿತ ಸ್ಕೀಮ್‌ಗಳಿಂದ ಸಂಪೂರ್ಣ ದೂರವಿರಿ.";
      planetPartEn = "Windfall earning windows emerge, but strictly avoid speculative intraday shortcuts or unverified get-rich-quick proposals.";
      break;
    case PlanetName.Ketu:
    default:
      planetPartKn = "ಅನಿರೀಕ್ಷಿತ ಮೂಲಗಳಿಂದ ಧನಪ್ರಾಪ್ತಿ ಅಥವಾ ಹಳೆಯ ವ್ಯವಹಾರಗಳ ಇತ್ಯರ್ಥ. ಲೌಕಿಕ ಆಡಂಬರಕ್ಕೆ ಹಣ ವ್ಯರ್ಥ ಮಾಡದೆ ಸತ್ಕಾರ್ಯಗಳಿಗೆ ವಿನಿಯೋಗಿಸುವಿರಿ.";
      planetPartEn = "Resolution of past accounts and debt recovery; minimalist material spending with philanthropic leanings.";
      break;
  }

  return {
    kn: `${housePartKn} ${planetPartKn}`,
    en: `${housePartEn} ${planetPartEn}`
  };
}

function buildPersonalizedFamilyMarriage(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  bhuktiLordPlacementKn: string,
  bhuktiLordPlacementEn: string,
  houseDist: number,
  isChallenging: boolean,
  gender?: string
): { kn: string; en: string } {
  const isFemale = (gender || "").toLowerCase() === "female";
  const spouseTermKn = isFemale ? "ಪತಿ" : "ಪತ್ನಿ";
  const spouseTermEn = isFemale ? "husband" : "wife";

  let housePartKn = "";
  let housePartEn = "";

  if (houseNumbers.includes(7) || placementHouse === 7) {
    housePartKn = `7ನೇ ಕಳತ್ರ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ದಾಂಪತ್ಯ ಬಾಂಧವ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಅನ್ಯೋನ್ಯತೆ ಹೆಚ್ಚಾಗಲಿದೆ; ${spouseTermKn}ಯೊಂದಿಗೆ ಪ್ರಮುಖ ಶುಭ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವಿರಿ. ಅವಿವಾಹಿತರಿಗೆ ವಿವಾಹ ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರಲಿದೆ.`;
    housePartEn = `Energizing the 7th house of matrimony, spousal harmony deepens with pivotal domestic milestones shared with your ${spouseTermEn}. Unmarried natives find auspicious marital prospects.`;
  } else if (houseNumbers.includes(2) || placementHouse === 2) {
    housePartKn = "2ನೇ ಕುಟುಂಬ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ, ಮನೆಯ ಸದಸ್ಯರೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ಒಡನಾಟ, ಮಾತುಕತೆಯಲ್ಲಿ ಮಾಧುರ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶುಭ ಸಮಾರಂಭಗಳ ಸಂಭ್ರಮ.";
    housePartEn = "Engaging the 2nd house of family and speech, warm camaraderie, considerate communication, and festive household gatherings prevail.";
  } else if (houseNumbers.includes(4) || placementHouse === 4) {
    housePartKn = "4ನೇ ಸುಖ-ಮಾತೃ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ ಮನೆಯಲ್ಲಿ ಪ್ರಶಾಂತತೆ, ತಾಯಿಯವರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದ ಹಾಗೂ ನೂತನ ಗೃಹೋಪಯೋಗಿ ವಸ್ತುಗಳ ಆಗಮನ.";
    housePartEn = "Illuminating the 4th house of domestic peace and maternal grace, serene household tranquility and elders' blessings anchor the home.";
  } else if (houseNumbers.includes(5) || placementHouse === 5) {
    housePartKn = "5ನೇ ಸಂತಾನ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಪ್ರಗತಿ, ಸಂತಾನ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ನವೋಲ್ಲಾಸ.";
    housePartEn = "With the 5th house of progeny energized, children achieve commendable milestones alongside joyous domestic celebrations.";
  } else if (houseNumbers.includes(9) || placementHouse === 9) {
    housePartKn = "9ನೇ ಧರ್ಮ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ, ತಂದೆಯವರ ಮಾರ್ಗದರ್ಶನ, ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥಯಾತ್ರೆಯ ಸೌಭಾಗ್ಯ.";
    housePartEn = "Linking with the 9th house of dharma, paternal wisdom, ancestral blessings, and sacred family pilgrimages enrich domestic harmony.";
  } else if (houseNumbers.includes(6) || houseNumbers.includes(8) || [6, 8, 12].includes(placementHouse)) {
    housePartKn = `ದಾಂಪತ್ಯದಲ್ಲಿ ಕ್ಷುಲ್ಲಕ ಮಾತುಗಳಿಗೂ ತಪ್ಪು ತಿಳುವಳಿಕೆ ಬಾರದಂತೆ ಪರಸ್ಪರ ಗೌರವ, ತಾಳ್ಮೆ ಹಾಗೂ ${spouseTermKn}ಯೊಂದಿಗೆ ಮುಕ್ತ ಸಂವಾದ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅಗತ್ಯ.`;
    housePartEn = `Sensitive planetary angles require transparent communication, mutual forgiveness, and patience with your ${spouseTermEn} to prevent minor misunderstandings.`;
  } else {
    housePartKn = "ಕುಟುಂಬದಲ್ಲಿ ಪರಸ್ಪರ ಸಹಕಾರವಿದ್ದು, ದೈನಂದಿನ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಒಟ್ಟಾಗಿ ನಿಭಾಯಿಸುವ ಸಾಮರಸ್ಯವಿರಲಿದೆ.";
    housePartEn = "Solid mutual collaboration governs domestic affairs, ensuring harmonious execution of routine household responsibilities.";
  }

  let planetPartKn = "";
  let planetPartEn = "";
  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      planetPartKn = isChallenging ? "ಮನೆಯಲ್ಲಿ ಕಠಿಣ ಮಾತುಗಳನ್ನು ಆಡದೆ ಹಿರಿಯರೊಂದಿಗೆ ವಿನಮ್ರತೆಯಿಂದ ವರ್ತಿಸುವುದು ಒಳಿತು." : "ಕುಟುಂಬದ ಘನತೆ ಹಾಗೂ ತಂದೆಯವರ ಮಾರ್ಗದರ್ಶನ ವೃದ್ಧಿಯಾಗಲಿದೆ.";
      planetPartEn = isChallenging ? "Guard against authoritative tones during sensitive family discussions." : "Paternal guidance elevates household dignity.";
      break;
    case PlanetName.Moon:
      planetPartKn = "ತಾಯಿಯವರ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದ, ದಾಂಪತ್ಯದಲ್ಲಿ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ನೆಲೆಸಲಿದೆ.";
      planetPartEn = "Maternal affection, spousal warmth, and psychological serenity enrich the domestic atmosphere.";
      break;
    case PlanetName.Mars:
      planetPartKn = isChallenging ? "ಕ್ಷಣಿಕ ಕೋಪ ಅಥವಾ ಹಠದಿಂದ ಮನೆಯವರೊಂದಿಗೆ ವಾಗ್ವಾದಕ್ಕೆ ಇಳಿಯದಂತೆ ಸಂಯಮವಿರಲಿ." : "ಸಹೋದರ-ಸಹೋದರಿಯರೊಂದಿಗೆ ಸಹಕಾರ ಹಾಗೂ ಕುಟುಂಬದ ರಕ್ಷಣೆಗೆ ನೀವು ಧೈರ್ಯದಿಂದ ನಿಲ್ಲುವಿರಿ.";
      planetPartEn = isChallenging ? "Check impulsive flare-ups or stubborn arguments with loved ones." : "Protective vitality and proactive support fortify sibling bonds.";
      break;
    case PlanetName.Mercury:
      planetPartKn = "ಮನೆಯಲ್ಲಿ ಹಾಸ್ಯ, ಉಲ್ಲಾಸ ಮತ್ತು ಬುದ್ಧಿವಂತಿಕೆಯ ಮಾತುಕತೆಗಳು. ಕಿರಿಯ ಸಹೋದರರು ಹಾಗೂ ಮಿತ್ರರಿಂದ ಬೆಂಬಲ ದೊರೆಯಲಿದೆ.";
      planetPartEn = "Lively, witty domestic dialogues and affectionate camaraderie with younger relatives and trusted confidants.";
      break;
    case PlanetName.Jupiter:
      planetPartKn = "ಮನೆಯಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳು, ಸಂತಾನ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ, ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಮ ತೃಪ್ತಿ.";
      planetPartEn = "Auspicious household rituals, sacred celebrations, elders' benedictions, and sublime matrimonial fulfillment.";
      break;
    case PlanetName.Venus:
      planetPartKn = `ದಾಂಪತ್ಯದಲ್ಲಿ ಅಪೂರ್ವ ಪ್ರೀತಿ-ವಾತ್ಸಲ್ಯ, ಮನೆಯಲ್ಲಿ ಸಂಭ್ರಮ ಹಾಗೂ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಸಡಗರ. ${spouseTermKn}ಯಿಂದ ಸಂಪೂರ್ಣ ಸಹಕಾರ.`;
      planetPartEn = `Exquisite romantic harmony, aesthetic celebrations, and unstinting devotion from your ${spouseTermEn}.`;
      break;
    case PlanetName.Saturn:
      planetPartKn = isChallenging ? "ಸಂಗಾತಿಯೊಂದಿಗೆ ನಿಷ್ಠೆ ಮತ್ತು ಪರಸ್ಪರ ಸಹನೆ ಅತ್ಯಗತ್ಯ. ಹಿರಿಯರ ಸೇವೆ ನಿಮ್ಮ ಮೇಲಿರಲಿದೆ." : "ಕುಟುಂಬದ ಹಿರಿಯರ ಸೇವೆ ಮತ್ತು ದೀರ್ಘಕಾಲಿಕ ಕೌಟುಂಬಿಕ ಬುನಾದಿ ಗಟ್ಟಿಯಾಗಲಿದೆ.";
      planetPartEn = isChallenging ? "Practise deep spousal patience and loyalty during demanding domestic phases." : "Devotion to elderly parents solidly anchors domestic roots.";
      break;
    case PlanetName.Rahu:
      planetPartKn = "ಕುಟುಂಬದಲ್ಲಿ ತಪ್ಪು ಕಲ್ಪನೆಗಳು ಮೂಡದಂತೆ ಮುಕ್ತ ಸಂವಾದ ಅಗತ್ಯ. ಹೊರಗಿನವರ ಮಾತುಗಳನ್ನು ನಂಬಿ ಮನೆಯ ಶಾಂತಿಯನ್ನು ಹಾಳುಮಾಡಿಕೊಳ್ಳಬೇಡಿ.";
      planetPartEn = "Maintain absolute transparency to dispel misinterpretations; never let outsider gossip disturb marital trust.";
      break;
    case PlanetName.Ketu:
    default:
      planetPartKn = "ಮನೆಯಲ್ಲಿ ಆಧ್ಯಾತ್ಮಿಕ ವಾತಾವರಣ ನೆಲೆಸಲಿದ್ದು, ಕುಟುಂಬದವರಿಂದ ಅತಿಯಾಗಿ ಪ್ರತ್ಯೇಕಗೊಳ್ಳದೆ ಪ್ರೀತಿಯಿಂದ ಸಂವಹನ ನಡೆಸಿ.";
      planetPartEn = "Spiritual calm graces the household; balance introspective solitude with loving domestic presence.";
      break;
  }

  return {
    kn: `${housePartKn} ${planetPartKn}`,
    en: `${housePartEn} ${planetPartEn}`
  };
}

function buildPersonalizedHealthMind(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  bhuktiLordPlacementKn: string,
  bhuktiLordPlacementEn: string,
  houseDist: number,
  isChallenging: boolean
): { kn: string; en: string } {
  let housePartKn = "";
  let housePartEn = "";

  if (houseNumbers.includes(1) || placementHouse === 1) {
    housePartKn = "1ನೇ ತನು ಭಾವದ ಸಕ್ರಿಯತೆಯಿಂದ ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ಆತ್ಮವಿಶ್ವಾಸ ಹಾಗೂ ದೈಹಿಕ ಕಾಂತಿ ಉತ್ತಮವಾಗಿರಲಿದೆ.";
    housePartEn = "Energizing the 1st house (Ascendant), physical immunity, bodily vitality, and commanding presence remain robust.";
  } else if (houseNumbers.includes(6) || placementHouse === 6) {
    housePartKn = "6ನೇ ರೋಗ ಸ್ಥಾನದ ಪ್ರಭಾವದಿಂದ ಜೀರ್ಣಾಂಗ, ಪಿತ್ತ ಅಥವಾ ಋತುಮಾನದ ಸಣ್ಣಪುಟ್ಟ ಸೋಂಕುಗಳ ಬಗ್ಗೆ ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಜಾಗರೂಕತೆ ಅಗತ್ಯ.";
    housePartEn = "Operating through the 6th house of acute ailments, proactive dietary discipline, gut health, and timely medical attention are advised.";
  } else if (houseNumbers.includes(8) || placementHouse === 8) {
    housePartKn = "8ನೇ ಆಯುಷ್ಯ ಭಾವದ ಪ್ರಭಾವದಿಂದ ಆಂತರಿಕ ಆತಂಕ, ಶಾರೀರಿಕ ದಣಿವು ಅಥವಾ ನಿದ್ರಾಭಂಗ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು; ನಿಯಮಿತ ಪ್ರಾಣಾಯಾಮ ಹಿತಕರ.";
    housePartEn = "Engaging the 8th house, emotional anxiety, sleep irregularities, or energy dips warrant restorative meditation and grounding routines.";
  } else if (houseNumbers.includes(12) || placementHouse === 12) {
    housePartKn = "12ನೇ ವ್ಯಯ ಸ್ಥಾನದ ಸಂಪರ್ಕದಿಂದ ನೇತ್ರದೋಷ, ಪಾದಗಳ ನೋವು ಅಥವಾ ರಾತ್ರಿ ನಿದ್ರಾಹೀನತೆಯ ಬಗ್ಗೆ ಗಮನವಿರಲಿ; ಸಕಾಲಿಕ ವಿಶ್ರಾಂತಿ ಅಗತ್ಯ.";
    housePartEn = "Linking with the 12th house, monitor eye strain, foot fatigue, and nocturnal sleep quality with scheduled restorative rest.";
  } else {
    housePartKn = "ಸಾಮಾನ್ಯ ಶಾರೀರಿಕ ಆರೋಗ್ಯವು ಸಮತೋಲಿತವಾಗಿದ್ದು, ನಿಯಮಿತ ವ್ಯಾಯಾಮ ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆಯಿಂದ ಮಾನಸಿಕ ಶಾಂತಿ ವೃದ್ಧಿಯಾಗಲಿದೆ.";
    housePartEn = "Overall physical vitality remains balanced, with regular yoga and sattvic nutrition nurturing emotional equilibrium.";
  }

  let planetPartKn = "";
  let planetPartEn = "";
  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      planetPartKn = "ಪಿತ್ತ ಪ್ರಕೃತಿ, ನೇತ್ರದೋಷ, ದೈಹಿಕ ಉಷ್ಣತೆ ಹಾಗೂ ರಕ್ತಪರಿಚಲನೆಯ ಬಗ್ಗೆ ಗಮನ ಅಗತ್ಯ. ಮುಂಜಾನೆ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಿತಕರ.";
      planetPartEn = "Monitor Pitta (bile), ocular fatigue, core body heat, and cardiovascular vitality with morning Surya Namaskara.";
      break;
    case PlanetName.Moon:
      planetPartKn = "ಕಫ, ಶೀತ, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ನೀರಿನಿಂದ ಬರುವ ಸೋಂಕುಗಳ ಬಗ್ಗೆ ಜಾಗರೂಕರಾಗಿರಿ. ರಾತ್ರಿ ವೇಳೆ ಲಘು ಆಹಾರ ಸೇವನೆ ಹಾಗೂ ಧ್ಯಾನ ಉತ್ತಮ.";
      planetPartEn = "Watch for Kapha/mucus congestion, sinus fluctuations, and fluid balance; light dinners and evening meditation are restorative.";
      break;
    case PlanetName.Mars:
      planetPartKn = "ರಕ್ತದೊತ್ತಡ, ಮಾಂಸಖಂಡಗಳ ನೋವು, ಚರ್ಮದ ಅಲರ್ಜಿ ಅಥವಾ ಸಣ್ಣಪುಟ್ಟ ಗಾಯಗಳಾಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ. ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಸಂಯಮವಿರಲಿ.";
      planetPartEn = "Maintain blood pressure balance, soothe muscular inflammation, and exercise caution against heat rashes or driving mishaps.";
      break;
    case PlanetName.Mercury:
      planetPartKn = "ನರಗಳ ವ್ಯವಸ್ಥೆ, ಚರ್ಮದ ಕಾಂತಿ ಹಾಗೂ ಗಂಟಲಿನ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಗಮನವಿರಲಿ. ಅತಿಯಾದ ಪರದೆ (Screen) ವೀಕ್ಷಣೆಯಿಂದ ಕಣ್ಣು ಮತ್ತು ಮೆದುಳಿಗೆ ಆಯಾಸವಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.";
      planetPartEn = "Support nervous system health, skin radiance, and vocal cords; avoid digital screen exhaustion and analytical burnout.";
      break;
    case PlanetName.Jupiter:
      planetPartKn = "ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಶಾಂತತೆ. ಆದಾಗ್ಯೂ ಲಿವರ್, ಮಧುಮೇಹ ಅಥವಾ ಕೊಲೆಸ್ಟ್ರಾಲ್ ನಿಯಂತ್ರಣಕ್ಕಾಗಿ ಅತಿಯಾದ ಸಿಹಿ ಮತ್ತು ಕೊಬ್ಬಿನ ಆಹಾರ ತ್ಯಜಿಸಿ.";
      planetPartEn = "Rejuvenating vitality and emotional equilibrium; monitor liver enzymes, blood sugar, and lipid levels through balanced nutrition.";
      break;
    case PlanetName.Venus:
      planetPartKn = "ಮುಖದ ಕಾಂತಿ ಹಾಗೂ ಶಾರೀರಿಕ ಸೌಂದರ್ಯ ವೃದ್ಧಿ. ಆದರೆ ಹಾರ್ಮೋನ್ ಸಮತೋಲನ, ಮೂತ್ರಾಂಗ ಹಾಗೂ ಸಕ್ಕರೆಯ ಪ್ರಮಾಣದ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.";
      planetPartEn = "Radiant aesthetic charm; ensure optimal hormonal balance, kidney hydration, and controlled blood sugar levels.";
      break;
    case PlanetName.Saturn:
      planetPartKn = "ಕೀಲು ನೋವು, ವಾತ ಪ್ರಕೋಪ, ಹಲ್ಲು ಮತ್ತು ಮೂಳೆಗಳ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಗಮನವಿರಲಿ. ನಿಯಮಿತ ತೈಲಮರ್ದನ (Abhyanga) ಹಾಗೂ ಶಾರೀರಿಕ ವಿಶ್ರಾಂತಿ ಅಗತ್ಯ.";
      planetPartEn = "Care for joints, lumbar spine, dental health, and chronic Vata accumulation with warm sesame oil abhyanga.";
      break;
    case PlanetName.Rahu:
      planetPartKn = "ನರಗಳ ಆಯಾಸ, ಮಾನಸಿಕ ಅಶಾಂತಿ, ಅತಿಯಾದ ಕಲ್ಪನೆಗಳು (Anxiety) ಮತ್ತು ನಿದ್ರಾಹೀನತೆ. ಧೂಮಪಾನ, ಮದ್ಯ ಅಥವಾ ಕಲಬೆರಕೆ ಆಹಾರಗಳಿಂದ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ದೂರವಿರಿ.";
      planetPartEn = "Soothe nervous anxiety, restless imagination, and erratic sleep; strictly avoid intoxicants and unhygienic foods.";
      break;
    case PlanetName.Ketu:
    default:
      planetPartKn = "ಅಜೀರ್ಣ, ಉದರ ದೋಷಗಳು, ನಿಗೂಢ ಅಲರ್ಜಿಗಳು ಅಥವಾ ಪಾದಗಳ ನೋವಿನ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ. ಯೋಗ ಮತ್ತು ಪ್ರಾಣಾಯಾಮ ಅತ್ಯುತ್ತಮ ಪರಿಹಾರ.";
      planetPartEn = "Address digestive sensitivities, gut microbiome, subtle allergies, or foot fatigue with daily pranayama and clean nutrition.";
      break;
  }

  return {
    kn: `${housePartKn} ${planetPartKn}`,
    en: `${housePartEn} ${planetPartEn}`
  };
}

function buildPersonalizedPrecautions(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  housesEn: string,
  houseNumbers: number[],
  placementHouse: number,
  houseDist: number,
  isChallenging: boolean
): { kn: string; en: string } {
  let specificRiskKn = "";
  let specificRiskEn = "";

  if (houseDist === 6 || houseDist === 8) {
    specificRiskKn = "ಮಹಾದಶಾಧಿಪತಿ ಮತ್ತು ಭುಕ್ತ್ಯಾಧಿಪತಿಯ ಷಡಾಷ್ಟಕ (6-8) ಸ್ಥಿತಿಯಿರುವುದರಿಂದ ಯಾವುದೇ ಆತುರದ ಅಥವಾ ಆವೇಶದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ; ವಾದ-ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ.";
    specificRiskEn = "Operating under a 6-8 Shadashtaka angle, avoid impulsive or heated confrontations; postpone contentious litigation.";
  } else if (houseNumbers.includes(8) || placementHouse === 8) {
    specificRiskKn = "ಅಪರಿಚಿತ ಹೂಡಿಕೆಗಳು, ವಿವಾದಿತ ಕಾಗದಪತ್ರಗಳು ಹಾಗೂ ರಹಸ್ಯ ವ್ಯವಹಾರಗಳಿಂದ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ದೂರವಿರಿ.";
    specificRiskEn = "Steer clear of unvetted investments, disputed documentation, or clandestine financial deals.";
  } else if (houseNumbers.includes(6) || placementHouse === 6) {
    specificRiskKn = "ಸಾಲ ಮಾಡುವುದು, ವಿನಾಕಾರಣ ಶತ್ರುತ್ವ ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಹಾಗೂ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಘರ್ಷಣೆಗೆ ಇಳಿಯಬೇಡಿ.";
    specificRiskEn = "Avoid contracting new debts, picking unnecessary rivalries, or locking horns with coworkers.";
  } else if (houseNumbers.includes(12) || placementHouse === 12) {
    specificRiskKn = "ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳು ಹಾಗೂ ಅಪರಿಚಿತ ಹೂಡಿಕೆಗಳ ಬಗ್ಗೆ ಎಚ್ಚರವಿರಲಿ; ರಾತ್ರಿ ನಿದ್ರೆಯ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.";
    specificRiskEn = "Control reckless spending and maintain regular restorative sleep hours.";
  }

  let planetPrecautionKn = "";
  let planetPrecautionEn = "";
  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      planetPrecautionKn = "ಅಧಿಕಾರ ಅಥವಾ ಅಹಂಕಾರದ ಮಾತುಗಳಿಂದ ಇತರರನ್ನು ನೋಯಿಸಬೇಡಿ; ಹಿರಿಯರೊಂದಿಗೆ ವಿನಮ್ರತೆ ಕಾಪಾಡಿ ಮತ್ತು ಕಾನೂನು ವಿಚಾರಗಳಲ್ಲಿ ಪಾರದರ್ಶಕರಾಗಿರಿ.";
      planetPrecautionEn = "Avoid hubris with mentors; maintain meticulous legal transparency.";
      break;
    case PlanetName.Moon:
      planetPrecautionKn = "ಭಾವನಾತ್ಮಕ ಆವೇಶದಲ್ಲಿ ಹಣಕಾಸಿನ ಅಥವಾ ಸಂಬಂಧಗಳ ಮಹತ್ವದ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ; ರಾತ್ರಿ ಅತಿಯಾಗಿ ಚಿಂತಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ.";
      planetPrecautionEn = "Never take irreversible financial or relationship choices during emotional highs or lows.";
      break;
    case PlanetName.Mars:
      planetPrecautionKn = "ಕೋಪದ ಕೈಗೆ ಬುದ್ಧಿ ಕೊಡಬೇಡಿ; ದುಡುಕಿ ಯಾವುದೇ ಕಾಗದಪತ್ರಕ್ಕೆ ಸಹಿ ಹಾಕಬೇಡಿ ಮತ್ತು ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ವೇಗ ನಿಯಂತ್ರಿಸಿ.";
      planetPrecautionEn = "Never act out of sudden temper; verify legal fine print thoroughly and control vehicle speeds.";
      break;
    case PlanetName.Mercury:
      planetPrecautionKn = "ಯಾವುದೇ ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಹಾಕುವ ಮುನ್ನ ಪ್ರತಿಯೊಂದು ಷರತ್ತನ್ನು ಕೂಲಂಕಷವಾಗಿ ಓದಿ; ಮಾತಿನಲ್ಲಿ ದ್ವಂದ್ವಾರ್ಥಗಳಿರಬಾರದು.";
      planetPrecautionEn = "Scrutinize every contractual clause before executing agreements; maintain absolute clarity in written correspondence.";
      break;
    case PlanetName.Jupiter:
      planetPrecautionKn = "ಯಾರಿಗೂ ಅತಿಯಾದ ಭರವಸೆಗಳನ್ನು ನೀಡಬೇಡಿ; ನಿಮ್ಮ ನೈತಿಕತೆಯನ್ನು ಕಡೆಗಣಿಸುವ ಯಾವುದೇ ಒಪ್ಪಂದಗಳಿಗೆ ಒಪ್ಪಬೇಡಿ.";
      planetPrecautionEn = "Do not over-commit beyond your capacity; uphold uncompromising ethical standards.";
      break;
    case PlanetName.Venus:
      planetPrecautionKn = "ಅತಿಯಾದ ಭೋಗಾಸಕ್ತಿ, ಐಷಾರಾಮಿ ವೆಚ್ಚಗಳು ಅಥವಾ ಆಡಂಬರಕ್ಕಾಗಿ ಸಾಲ ಮಾಡುವುದರಿಂದ ದೂರವಿರಿ.";
      planetPrecautionEn = "Avoid sensual over-indulgence, extravagant vanity spending, or stretching credit for superficial displays.";
      break;
    case PlanetName.Saturn:
      planetPrecautionKn = "ಕೆಲಸಗಳಲ್ಲಿ ಆಲಸ್ಯ ಮಾಡಬೇಡಿ; ಯಾವುದೇ ಶಾರ್ಟ್‌ಕಟ್ ಹುಡುಕದೆ ನೇರ ನೈತಿಕ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಯಿರಿ ಮತ್ತು ಕಿರಿಯ ನೌಕರರನ್ನು ಗೌರವಿಸಿ.";
      planetPrecautionEn = "Shun procrastination; avoid opportunistic shortcuts and treat subordinates with kindness.";
      break;
    case PlanetName.Rahu:
      planetPrecautionKn = "ಸುಲಭವಾಗಿ ಶ್ರೀಮಂತರಾಗುವ ಆಮಿಷಗಳಿಗೆ ಮರುಳಾಗಬೇಡಿ; ಅಪರಿಚಿತರನ್ನು ಕುರುಡಾಗಿ ನಂಬಿ ಪಾಲುದಾರಿಕೆ ಮಾಡಬೇಡಿ.";
      planetPrecautionEn = "Reject get-rich-quick lures; never enter business alliances without comprehensive background vetting.";
      break;
    case PlanetName.Ketu:
    default:
      planetPrecautionKn = "ಏಕಾಂಗಿತನ ಅಥವಾ ನಿರಾಶಾವಾದಕ್ಕೆ ಒಳಗಾಗಬೇಡಿ; ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕರ್ತವ್ಯಗಳಿಂದ ವಿಮುಖರಾಗದಿರಿ.";
      planetPrecautionEn = "Avoid melancholic isolation; stay actively grounded in your worldly and familial duties.";
      break;
  }

  return {
    kn: specificRiskKn ? `${specificRiskKn} ${planetPrecautionKn}` : planetPrecautionKn,
    en: specificRiskEn ? `${specificRiskEn} ${planetPrecautionEn}` : planetPrecautionEn
  };
}

function buildPersonalizedGokarnaRemedy(
  bhuktiPlanet: PlanetName,
  housesKn: string,
  houseNumbers: number[],
  placementHouse: number
): { kn: string; en: string } {
  const isDusthana = [6, 8, 12].includes(placementHouse) || houseNumbers.some((h) => [6, 8, 12].includes(h));

  switch (bhuktiPlanet) {
    case PlanetName.Sun:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಆದಿತ್ಯ ಹೃದಯ ಸಂಕಲ್ಪ ಪೂಜೆ${isDusthana ? " ಹಾಗೂ ದೋಷ ನಿವಾರಣಾ ಶಾಂತಿ" : ""} ಮತ್ತು ಗೋಧಿ ದಾನ.`,
        en: `Sponsor Surya Namaskara, Aditya Hridaya Sankalpa Pooja${isDusthana ? " and Dosha Nivarana Shanti" : ""} with wheat donation at Sri Kshetra Gokarna.`
      };
    case PlanetName.Moon:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಚಂದ್ರಮೌಳೇಶ್ವರ ಕ್ಷೀರಾಭಿಷೇಕ${isDusthana ? ", ಮಾನಸಿಕ ಶಾಂತಿ ಸಂಕಲ್ಪ" : ""} ಮತ್ತು ಅನ್ನದಾನ ಸೇವೆ.`,
        en: `Sponsor Chandramouleshwara Ksheerabhisheka${isDusthana ? ", Mental Peace Sankalpa" : ""} and Annadana seva at Sri Kshetra Gokarna Mahabaleshwara.`
      };
    case PlanetName.Mars:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ, ಕುಜ ಗ್ರಹ ಶಾಂತಿ${isDusthana ? " ಮತ್ತು ಋಣ ವಿಮೋಚನಾ ಸಂಕಲ್ಪ" : ""} ಹಾಗೂ ತೊಗರಿಬೇಳೆ ದಾನ.`,
        en: `Sponsor Subramanya Homa, Kuja Shanti Pooja${isDusthana ? " and Rina Vimochana Sankalpa" : ""} with toor dal donation at Sri Kshetra Gokarna.`
      };
    case PlanetName.Mercury:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಸಂಕಲ್ಪ ಪೂಜೆ${isDusthana ? ", ಬುಧ ಗ್ರಹ ಶಾಂತಿ" : ""} ಮತ್ತು ಹೆಸರುಕಾಳು ದಾನ.`,
        en: `Sponsor Sri Vishnu Sahasranama Sankalpa Pooja${isDusthana ? ", Budha Shanti" : ""} and green gram donation at Sri Kshetra Gokarna.`
      };
    case PlanetName.Jupiter:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬೃಹಸ್ಪತಿ ಪ್ರೀತ್ಯರ್ಥ ರುದ್ರಾಭಿಷೇಕ${isDusthana ? " ಹಾಗೂ ಗುರು-ಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪ" : ""} ಮತ್ತು ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಸೇವೆ.`,
        en: `Sponsor Brihaspati Rudrabhisheka${isDusthana ? " and Guru Shanti Sankalpa" : ""} with Brahmana Bhojana at Sri Kshetra Gokarna Mahabaleshwara.`
      };
    case PlanetName.Venus:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅರ್ಚನೆ${isDusthana ? ", ಶುಕ್ರ ಶಾಂತಿ" : ""} ಮತ್ತು ಸುವಾಸಿನೀ ಪೂಜೆ.`,
        en: `Sponsor Sri Mahalakshmi Archana${isDusthana ? ", Shukra Shanti" : ""} and Suvasini Pooja at Sri Kshetra Gokarna Mahabaleshwara.`
      };
    case PlanetName.Saturn:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶನೈಶ್ಚರ ತೈಲಾಭಿಷೇಕ, ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ${isDusthana ? " ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ" : ""} ಮತ್ತು ಎಳ್ಳೆಣ್ಣೆ ದೀಪೋತ್ಸವ.`,
        en: `Sponsor Shani Tailabhisheka, Mahamrityunjaya Japa${isDusthana ? " and Navagraha Shanti" : ""} with sesame oil lamp offering at Sri Kshetra Gokarna.`
      };
    case PlanetName.Rahu:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗಾರ್ಚನೆ, ಸರ್ಪ ಶಾಂತಿ${isDusthana ? ", ರಾಹು ಕಾಲ ರುದ್ರಾಭಿಷೇಕ" : ""} ಹಾಗೂ ದುರ್ಗಾ ಕವಚ ಸಂಕಲ್ಪ ಸೇವೆ.`,
        en: `Sponsor Sarpa Shanti, Naga Archana${isDusthana ? ", Rahu Kala Rudrabhisheka" : ""} and Durga Kavacha Pooja at Sri Kshetra Gokarna.`
      };
    case PlanetName.Ketu:
    default:
      return {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಶ್ರೀ ಗಣಪತಿ ಮೋದಕ ಹವನ${isDusthana ? ", ಕೇತು ಗ್ರಹ ದೋಷ ನಿವಾರಣೆ" : ""} ಮತ್ತು ಕೇತು ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ.`,
        en: `Sponsor Sri Ganesha Modaka Havana${isDusthana ? ", Ketu Dosha Nivarana" : ""} and Ketu Shanti Sankalpa Pooja at Sri Kshetra Gokarna.`
      };
  }
}
