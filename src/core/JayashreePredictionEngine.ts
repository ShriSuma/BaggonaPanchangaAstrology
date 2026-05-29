import { PlanetName, type KundliOutput, type PlanetPosition } from "./AstroTypes";
import {
  vimshottariBalanceAtBirth,
  vimshottariBalanceYmdPatrika,
  findBhuktiAtAge,
  generateDashaTimeline,
  generateBhuktiTimeline,
  type BhuktiSpan
} from "./DashaBhuktiEngine";
import { ageDecimalYearsAt, wallClockBirthToUtc } from "./birthTime";
import { lordOfHouse } from "./ChartPredictionKnowledge";
import { translateTexts } from "../services/translationService";
import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToRashi, normalizeDegree, getAyanamsa } from "./AstroMath";
import * as Astronomy from "astronomy-engine";

export type JayashreePrediction = {
  intro: string;
  dashaContext: string;
  education: string;
  career: string;
  health: string;
  finance: string;
  housing: string;
};

// Map planet enum names to Kannada and English names
const PLANETS_KN: Record<PlanetName, string> = {
  [PlanetName.Sun]: "ರವಿ (ಸೂರ್ಯ)",
  [PlanetName.Moon]: "ಚಂದ್ರ",
  [PlanetName.Mars]: "ಮಂಗಳ (ಕುಜ)",
  [PlanetName.Mercury]: "ಬುಧ",
  [PlanetName.Jupiter]: "ಗುರು",
  [PlanetName.Venus]: "ಶುಕ್ರ",
  [PlanetName.Saturn]: "ಶನಿ",
  [PlanetName.Rahu]: "ರಾಹು",
  [PlanetName.Ketu]: "ಕೇತು"
};

const PLANETS_EN: Record<PlanetName, string> = {
  [PlanetName.Sun]: "Sun (Surya)",
  [PlanetName.Moon]: "Moon (Chandra)",
  [PlanetName.Mars]: "Mars (Mangala)",
  [PlanetName.Mercury]: "Mercury (Budha)",
  [PlanetName.Jupiter]: "Jupiter (Guru)",
  [PlanetName.Venus]: "Venus (Shukra)",
  [PlanetName.Saturn]: "Saturn (Shani)",
  [PlanetName.Rahu]: "Rahu",
  [PlanetName.Ketu]: "Ketu"
};

// Map Rashi indices to Kannada and English names
const RASHIS_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ",
  "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const RASHIS_EN = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
];

// Map Nakshatra indices to Kannada and English names
const NAKSHATRAS_KN = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರಾ", "ಆರಿದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ",
  "ಮಖಾ", "ಪುಬ್ಬಾ", "ಉತ್ತರಾ", "ಹಸ್ತಾ", "ಚಿತ್ತಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢಾ", "ಉತ್ತರಾಷಾಢಾ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಾಭಾದ್ರಾ", "ಉತ್ತರಾಭಾದ್ರಾ", "ರೇವತಿ"
];

const NAKSHATRAS_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

/**
 * Helper to check standard Vedic planetary aspects on a house
 */
export function planetAspectsHouse(planet: PlanetName, planetHouse: number, targetHouse: number): boolean {
  if (planetHouse === targetHouse) return true;
  
  // All planets aspect the 7th house from their position
  const aspect7 = ((planetHouse + 6 - 1) % 12) + 1;
  if (targetHouse === aspect7) return true;

  if (planet === PlanetName.Mars) {
    const aspect4 = ((planetHouse + 3 - 1) % 12) + 1;
    const aspect8 = ((planetHouse + 7 - 1) % 12) + 1;
    return targetHouse === aspect4 || targetHouse === aspect8;
  }
  if (planet === PlanetName.Jupiter) {
    const aspect5 = ((planetHouse + 4 - 1) % 12) + 1;
    const aspect9 = ((planetHouse + 8 - 1) % 12) + 1;
    return targetHouse === aspect5 || targetHouse === aspect9;
  }
  if (planet === PlanetName.Saturn) {
    const aspect3 = ((planetHouse + 2 - 1) % 12) + 1;
    const aspect10 = ((planetHouse + 9 - 1) % 12) + 1;
    return targetHouse === aspect3 || targetHouse === aspect10;
  }

  return false;
}

/**
 * Generate Jayashree Pandit predictions base text
 */
export function generateJayashreePredictionBase(
  kundli: KundliOutput,
  context: {
    name: string;
    birthDate: string;
    birthTime: string;
    latitude: number;
    longitude: number;
    ayanamsaModel?: "lahiri" | "drik_ganita";
  },
  lang: string = "kn"
): JayashreePrediction {
  const model = context.ayanamsaModel ?? "lahiri";
  const name = context.name || "Seeker";
  const birthDate = context.birthDate;
  const birthTime = context.birthTime;

  // Retrieve basic details
  const natalMoonRashiIdx = kundli.moonSign.index;
  const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonNakshatraIdx = moon?.nakshatra.index ?? 0;
  const lagnaRashiIdx = kundli.lagnaRashi.index;

  // Calculate birth Dasha balance
  const birthDasha = vimshottariBalanceAtBirth(kundli);
  const birthLord = birthDasha.lord;
  const birthBalance = vimshottariBalanceYmdPatrika(birthDasha.balanceYears);

  // Calculate current age
  const ageDecimal = ageDecimalYearsAt(birthDate, birthTime, context.latitude, context.longitude, new Date());
  const ageYears = Math.floor(ageDecimal);
  const ageMonths = Math.floor((ageDecimal - ageYears) * 12);

  // Current Dasha & Bhukti
  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  const mahaLord = currentDasha?.maha.planet ?? PlanetName.Venus;
  const bhuktiLord = currentDasha?.bhukti ?? PlanetName.Jupiter;

  // Dynamic lords
  const p2Lord = lordOfHouse(kundli, 2);
  const p4Lord = lordOfHouse(kundli, 4);
  const p5Lord = lordOfHouse(kundli, 5);
  const p6Lord = lordOfHouse(kundli, 6);
  const p7Lord = lordOfHouse(kundli, 7);
  const p8Lord = lordOfHouse(kundli, 8);
  const p9Lord = lordOfHouse(kundli, 9);
  const p10Lord = lordOfHouse(kundli, 10);
  const p11Lord = lordOfHouse(kundli, 11);

  // Houses for specific planets to make it dynamic
  const p9House = kundli.planets.find((p) => p.name === p9Lord)?.house ?? 9;
  const p10House = kundli.planets.find((p) => p.name === p10Lord)?.house ?? 10;
  const p11House = kundli.planets.find((p) => p.name === p11Lord)?.house ?? 11;
  const p6House = kundli.planets.find((p) => p.name === p6Lord)?.house ?? 6;
  const p8House = kundli.planets.find((p) => p.name === p8Lord)?.house ?? 8;
  const p4House = kundli.planets.find((p) => p.name === p4Lord)?.house ?? 4;
  const p5House = kundli.planets.find((p) => p.name === p5Lord)?.house ?? 5;
  const p7House = kundli.planets.find((p) => p.name === p7Lord)?.house ?? 7;
  const p2House = kundli.planets.find((p) => p.name === p2Lord)?.house ?? 2;

  // Calculate transits dynamically from Moon sign
  const now = new Date();
  const longs = siderealLongitudes(now, model);
  
  const saturnTransitRashi = degreeToRashi(longs.saturn).index;
  const saturnTransitHouse = ((saturnTransitRashi - natalMoonRashiIdx + 12) % 12) + 1;

  const jupiterTransitRashi = degreeToRashi(longs.jupiter).index;
  const jupiterTransitHouse = ((jupiterTransitRashi - natalMoonRashiIdx + 12) % 12) + 1;

  // Check Dasha Sandhi
  let isSandhi = false;
  let sandhiTransitionKn = "";
  let sandhiTransitionEn = "";
  const dashaTimeline = generateDashaTimeline(kundli);
  for (const entry of dashaTimeline) {
    const diff = Math.abs(ageDecimal - entry.endAge);
    if (diff <= 1.0) {
      if (entry.planet === PlanetName.Venus) {
        isSandhi = true;
        sandhiTransitionKn = "ಶುಕ್ರ-ರವಿ ಸಂಧಿ (ಶುಕ್ರ ದಶೆ ಕಳೆದು ರವಿ ದಶೆ ಪ್ರಾರಂಭ)";
        sandhiTransitionEn = "Shukra-Ravi Sandhi (Venus to Sun transition)";
      } else if (entry.planet === PlanetName.Mars) {
        isSandhi = true;
        sandhiTransitionKn = "ಕುಜ-ರಾಹು ಸಂಧಿ";
        sandhiTransitionEn = "Kuja-Rahu Sandhi (Mars to Rahu transition)";
      } else if (entry.planet === PlanetName.Rahu) {
        isSandhi = true;
        sandhiTransitionKn = "ರಾಹು-ಬೃಹಸ್ಪತಿ ಸಂಧಿ";
        sandhiTransitionEn = "Rahu-Brihaspati Sandhi (Rahu to Jupiter transition)";
      } else {
        isSandhi = true;
        sandhiTransitionKn = `${PLANETS_KN[entry.planet]} ದಶಾ ಸಂಧಿ`;
        sandhiTransitionEn = `${PLANETS_EN[entry.planet]} Dasha Sandhi`;
      }
    }
  }

  // Dynamic status evaluation helpers
  const getHouseStatus = (houseNum: number) => {
    if ([6, 8, 12].includes(houseNum)) return "weak";
    if ([1, 4, 7, 10, 5, 9, 11].includes(houseNum)) return "strong";
    return "neutral";
  };

  const getDynamicPredictionKn = (topic: string, lord: string, lordHouse: number, houseNum: number, strongText: string, weakText: string, neutralText: string) => {
    const status = getHouseStatus(lordHouse);
    const baseText = `${houseNum}ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${lord} ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lordHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.`;
    if (status === "strong") return `${baseText} ಇದು ಅತ್ಯಂತ ಅನುಕೂಲಕರ ಸ್ಥಾನ. ${strongText}`;
    if (status === "weak") return `${baseText} ಇದು ಸ್ವಲ್ಪ ದುರ್ಬಲ ಸ್ಥಾನ. ${weakText}`;
    return `${baseText} ಇದು ಸಾಧಾರಣ ಸ್ಥಾನ. ${neutralText}`;
  };

  const getDynamicPredictionEn = (topic: string, lord: string, lordHouse: number, houseNum: number, strongText: string, weakText: string, neutralText: string) => {
    const status = getHouseStatus(lordHouse);
    const baseText = `The lord of the ${houseNum}th house, ${lord}, is placed in the ${lordHouse}th house in your chart.`;
    if (status === "strong") return `${baseText} This is a highly favorable position. ${strongText}`;
    if (status === "weak") return `${baseText} This is a slightly challenging position. ${weakText}`;
    return `${baseText} This is a neutral position. ${neutralText}`;
  };

  if (lang === "kn") {
    const nakshatraKn = NAKSHATRAS_KN[moonNakshatraIdx] ?? "";
    const rashiKn = RASHIS_KN[natalMoonRashiIdx] ?? "";
    const lagnaKn = RASHIS_KN[lagnaRashiIdx] ?? "";
    const birthLordKn = PLANETS_KN[birthLord];
    const mahaLordKn = PLANETS_KN[mahaLord];
    const bhuktiLordKn = PLANETS_KN[bhuktiLord];

    const p2LordKn = PLANETS_KN[p2Lord];
    const p4LordKn = PLANETS_KN[p4Lord];
    const p5LordKn = PLANETS_KN[p5Lord];
    const p6LordKn = PLANETS_KN[p6Lord];
    const p7LordKn = PLANETS_KN[p7Lord];
    const p8LordKn = PLANETS_KN[p8Lord];
    const p9LordKn = PLANETS_KN[p9Lord];
    const p10LordKn = PLANETS_KN[p10Lord];
    const p11LordKn = PLANETS_KN[p11Lord];

    const intro = `ನಮಸ್ಕಾರ, ನಾನು ಜಯಶ್ರೀ ಪಂಡಿತ್. ಕಳೆದ ೬೦ ವರ್ಷಗಳಿಂದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮತ್ತು ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ನನ್ನ ಅನುಭವವನ್ನು ಧಾರೆ ಎರೆದಿದ್ದೇನೆ. ಈಗ ನಾನು ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇನೆ. ನೀವು ${nakshatraKn} ನಕ್ಷತ್ರ ${rashiKn} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ. ನಿಮ್ಮ ಲಗ್ನವು ${lagnaKn} ಆಗಿದೆ. ನಿಮ್ಮ ಜಾತಕದ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಈಗ ಪ್ರಾರಂಭಿಸೋಣ.`;

    const dashaContext = `ನಿಮ್ಮ ಜನ್ಮ ಸಮಯದ ಆಧಾರದ ಮೇಲೆ, ನೀವು ಜನಿಸಿದಾಗ ${birthLordKn} ದಶೆ ನಡೆಯುತ್ತಿತ್ತು. ಈಗ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ, ನಿಮಗೆ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ. ಗ್ರಹಗಳ ಈ ಸಂಚಾರ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿಯ ಪ್ರಭಾವವು ನಿಮ್ಮ ಜೀವನದ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳನ್ನು ಹೇಗೆ ರೂಪಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ನಾನು ವಿವರಿಸುತ್ತೇನೆ.`;

    let health = getDynamicPredictionKn("ಆರೋಗ್ಯ", p6LordKn, p6House, 6,
      "ನಿಮ್ಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಉತ್ತಮವಾಗಿರುತ್ತದೆ. ಸಣ್ಣಪುಟ್ಟ ಕಾಯಿಲೆಗಳು ಬಂದರೂ ಶೀಘ್ರವೇ ಗುಣಮುಖರಾಗುವಿರಿ. ಶತ್ರುಗಳ ಮೇಲೆ ಜಯ ಸಾಧಿಸುವಿರಿ.",
      "ಆರೋಗ್ಯದ ಬಗ್ಗೆ ವಿಶೇಷ ಕಾಳಜಿ ವಹಿಸುವುದು ಅಗತ್ಯ. ಕೀಲು ನೋವು, ಆಯಾಸ ಕಾಡಬಹುದು. ಸರಿಯಾದ ಆಹಾರ ಪದ್ಧತಿ ರೂಢಿಸಿಕೊಳ್ಳಿ.",
      "ಆರೋಗ್ಯ ಸಾಧಾರಣವಾಗಿರುತ್ತದೆ. ದೈನಂದಿನ ವ್ಯಾಯಾಮದಿಂದ ಉತ್ತಮ ಆರೋಗ್ಯ ಕಾಪಾಡಿಕೊಳ್ಳಬಹುದು."
    ) + ` ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯು ${saturnTransitHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಗುರುವು ${jupiterTransitHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ನಿಯಮಿತವಾಗಿ ಕುಲದೇವರ ಆರಾಧನೆ ಮಾಡುವುದರಿಂದ ದೈಹಿಕ ಮತ್ತು ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.`;
    
    if (isSandhi) {
      health += ` ಇದಲ್ಲದೆ, ಪ್ರಸ್ತುತ ನಿಮಗೆ ${sandhiTransitionKn} ನಡೆಯುತ್ತಿರುವುದರಿಂದ, ದಶಾ ಸಂಧಿಯ ಕಾಲದಲ್ಲಿ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೊಂಚ ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ. ಈ ದಶಾ ಸಂಧಿ ಶಾಂತಿಯನ್ನು ಮಾಡಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`;
    }

    const career = getDynamicPredictionKn("ಉದ್ಯೋಗ", p10LordKn, p10House, 10,
      "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು, ಬಡ್ತಿ ಮತ್ತು ಗೌರವ ಲಭಿಸಲಿದೆ. ಮೇಲಧಿಕಾರಿಗಳಿಂದ ಮೆಚ್ಚುಗೆ ಸಿಗಲಿದೆ. ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ ಖಚಿತ.",
      "ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ಒತ್ತಡ ಮತ್ತು ಬದಲಾವಣೆಗಳು ಎದುರಾಗಬಹುದು. ಹಿರಿಯರೊಡನೆ ವಾದ ವಿವಾದ ಬೇಡ. ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ.",
      "ವೃತ್ತಿಯಲ್ಲಿ ನಿರಂತರ ಶ್ರಮದಿಂದ ಮಾತ್ರ ಯಶಸ್ಸು ಕಾಣಬಹುದು. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆಗೆ ತಕ್ಕ ಪ್ರತಿಫಲ ಕಾಲಕ್ರಮೇಣ ಲಭಿಸುತ್ತದೆ."
    ) + ` ಲಾಭ ಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${p11LordKn} ${p11House}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ನಿಮ್ಮ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲವನ್ನು ನಿರ್ಧರಿಸಲಿದ್ದಾನೆ.`;

    const housing = getDynamicPredictionKn("ಕುಟುಂಬ", p4LordKn, p4House, 4,
      "ಕುಟುಂಬದಲ್ಲಿ ಅತ್ಯಂತ ನೆಮ್ಮದಿಯ ವಾತಾವರಣವಿರುತ್ತದೆ. ಹೊಸ ಮನೆ ಅಥವಾ ವಾಹನ ಖರೀದಿಸುವ ಯೋಗವಿದೆ. ತಾಯಿಯ ಆರೋಗ್ಯ ಉತ್ತಮವಾಗಿರುತ್ತದೆ.",
      "ಮನೆಯಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮೂಡಬಹುದು. ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಇರಲಿ. ಕುಟುಂಬದ ಸದಸ್ಯರೊಂದಿಗೆ ಹೊಂದಾಣಿಕೆ ಅಗತ್ಯ.",
      "ಕುಟುಂಬದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ಸಾಧಾರಣವಾಗಿರುತ್ತದೆ. ಎಲ್ಲರೊಂದಿಗೆ ಬೆರೆತು ಹೋಗುವುದರಿಂದ ನೆಮ್ಮದಿ ಸಿಗುತ್ತದೆ."
    ) + ` ಏಳನೇ ಅಧಿಪತಿ ${p7LordKn} ${p7House}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನವನ್ನು ರೂಪಿಸಲಿದ್ದಾನೆ.`;

    const finance = getDynamicPredictionKn("ಆರ್ಥಿಕತೆ", p2LordKn, p2House, 2,
      "ಹಣಕಾಸಿನ ಹರಿವು ಅತ್ಯುತ್ತಮವಾಗಿರುತ್ತದೆ. ಉಳಿತಾಯ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತದೆ. ಆರ್ಥಿಕ ಪ್ರಗತಿ ನಿಮ್ಮನ್ನು ಹೊಸ ಹಂತಕ್ಕೆ ಕೊಂಡೊಯ್ಯಲಿದೆ.",
      "ಆದಾಯವಿದ್ದರೂ ಖರ್ಚುಗಳು ಹೆಚ್ಚಾಗಲಿವೆ. ಹಣದ ವಿಚಾರದಲ್ಲಿ ಯಾರಿಗೂ ಜಾಮೀನು ನಿಲ್ಲಬೇಡಿ. ಮಿತವ್ಯಯ ಅಳವಡಿಸಿಕೊಳ್ಳಿ.",
      "ಹಣಕಾಸಿನ ಪರಿಸ್ಥಿತಿ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ. ದಿನನಿತ್ಯದ ಅಗತ್ಯಗಳಿಗೆ ತೊಂದರೆ ಇರುವುದಿಲ್ಲ, ಆದರೆ ಅನಗತ್ಯ ಖರ್ಚುಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕುವುದು ಒಳಿತು."
    ) + ` ನಿಮ್ಮ ಭಾಗ್ಯ ಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${p9LordKn} ${p9House}ನೇ ಮನೆಯಲ್ಲಿದ್ದು, ದೈವಾನುಗ್ರಹದಿಂದ ಸಂಕಷ್ಟಗಳಿಂದ ಪಾರುಮಾಡಲಿದ್ದಾನೆ.`;

    const education = getDynamicPredictionKn("ವಿದ್ಯಾಭ್ಯಾಸ", p5LordKn, p5House, 5,
      "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಇದು ಅತ್ಯುತ್ತಮ ಸಮಯ. ನಿರೀಕ್ಷಿಸಿದ ಫಲಿತಾಂಶ ಖಂಡಿತ ದೊರೆಯಲಿದೆ. ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ನಿಮ್ಮದಾಗಲಿದೆ.",
      "ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಏಕಾಗ್ರತೆಯ ಕೊರತೆ ಕಾಡಬಹುದು. ಹೆಚ್ಚಿನ ಶ್ರಮ ವಹಿಸಿ ಓದುವುದು ಅಗತ್ಯ. ತಾಯಿ ಸರಸ್ವತಿಯ ಆರಾಧನೆ ಮಾಡಿ.",
      "ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಸಾಧಾರಣ ಪ್ರಗತಿ ಇರಲಿದೆ. ಸತತ ಪ್ರಯತ್ನದಿಂದ ಮಾತ್ರ ಗುರಿ ಮುಟ್ಟಬಹುದು."
    );

    return { intro, dashaContext, education, career, health, finance, housing };
  } else {
    // ENGLISH BASE
    const nakshatraEn = NAKSHATRAS_EN[moonNakshatraIdx] ?? "";
    const rashiEn = RASHIS_EN[natalMoonRashiIdx] ?? "";
    const lagnaEn = RASHIS_EN[lagnaRashiIdx] ?? "";
    const birthLordEn = PLANETS_EN[birthLord];
    const mahaLordEn = PLANETS_EN[mahaLord];
    const bhuktiLordEn = PLANETS_EN[bhuktiLord];

    const p2LordEn = PLANETS_EN[p2Lord];
    const p4LordEn = PLANETS_EN[p4Lord];
    const p5LordEn = PLANETS_EN[p5Lord];
    const p6LordEn = PLANETS_EN[p6Lord];
    const p7LordEn = PLANETS_EN[p7Lord];
    const p8LordEn = PLANETS_EN[p8Lord];
    const p9LordEn = PLANETS_EN[p9Lord];
    const p10LordEn = PLANETS_EN[p10Lord];
    const p11LordEn = PLANETS_EN[p11Lord];

    const intro = `Namaskara, I am Jayashree Pandit. With over 60 years of profound experience in Jyotishya and Baggona Panchanga, I am now looking at your horoscope. You were born in ${nakshatraEn} Nakshatra and ${rashiEn} Rashi. Your Ascendant (Lagna) is ${lagnaEn}. Let us dive deep into the detailed analysis of your birth chart.`;

    const dashaContext = `Based on your exact birth time, you were born during the period of ${birthLordEn} Dasha. At your current age, you are going through the Mahadasha of ${mahaLordEn} and the Antardasha (Bhukti) of ${bhuktiLordEn}. Let me explain how this current planetary period, combined with ongoing transits, will shape your life path.`;

    let health = getDynamicPredictionEn("Health", p6LordEn, p6House, 6,
      "Your immunity and resilience will be strong. You will overcome illnesses quickly and conquer your obstacles easily.",
      "Special care regarding health is required. You may face fatigue or joint pains. Maintain a proper diet and active lifestyle.",
      "Your health will be stable. Regular exercise will help you maintain your well-being."
    ) + ` Currently, in transit, Saturn is moving through your ${saturnTransitHouse}th house and Jupiter through the ${jupiterTransitHouse}th house. Regular prayers to your family deity will ensure both physical and mental peace.`;

    if (isSandhi) {
      health += ` Additionally, since you are going through a ${sandhiTransitionEn}, which is a transitional planetary phase, it is advisable to be slightly more careful about your health and perform the relevant Sandhi Shanti rituals for smooth sailing.`;
    }

    const career = getDynamicPredictionEn("Career", p10LordEn, p10House, 10,
      "You will see excellent growth, promotions, and respect in your career. Superiors will recognize your hard work.",
      "You may face stress or sudden changes at the workplace. Avoid arguments with authorities and stay patient.",
      "Your career requires continuous hard work. Honest efforts will gradually yield good results."
    ) + ` The lord of gains, ${p11LordEn}, is placed in the ${p11House}th house, influencing your ultimate financial rewards.`;

    const housing = getDynamicPredictionEn("Housing & Family", p4LordEn, p4House, 4,
      "Your domestic life will be highly peaceful. There are strong yogas for buying a new vehicle or property.",
      "Minor disagreements may arise at home. Be cautious while driving and maintain harmony with family members.",
      "Domestic life will be average and stable. Clear communication will bring peace."
    ) + ` The 7th lord ${p7LordEn} is in the ${p7House}th house, which defines your marital harmony.`;

    const finance = getDynamicPredictionEn("Finances", p2LordEn, p2House, 2,
      "Your cash flow will be excellent. You will be able to save well and reach new financial heights.",
      "Expenses might exceed your income. Avoid taking huge loans or standing as a guarantor for others.",
      "Your financial situation will be steady. Controlling unnecessary expenditures is advised."
    ) + ` Thanks to the blessings of your 9th lord ${p9LordEn} in the ${p9House}th house, divine grace will protect you from severe financial blockages.`;

    const education = getDynamicPredictionEn("Education", p5LordEn, p5House, 5,
      "This is an excellent time for students. You will achieve desired results and success in competitive exams.",
      "You might lack concentration. Extra effort is needed in studies. Worshipping Goddess Saraswati is highly recommended.",
      "Academic progress will be moderate. Only persistent effort will help you reach your goals."
    );

    return { intro, dashaContext, education, career, health, finance, housing };
  }
}


/**
 * Public function to generate and translate Jayashree Pandit predictions.
 * Translates using translateTexts if language is HI, TE, TA, and returns localized readings.
 */
export async function generateJayashreePrediction(
  kundli: KundliOutput,
  context: {
    name: string;
    birthDate: string;
    birthTime: string;
    latitude: number;
    longitude: number;
    ayanamsaModel?: "lahiri" | "drik_ganita";
  },
  lang: string = "kn"
): Promise<JayashreePrediction> {
  // If target language is Kannada or English, generate directly (avoiding translation loss)
  if (lang === "kn" || lang === "en") {
    return generateJayashreePredictionBase(kundli, context, lang);
  }

  // Generate English base for other languages (hi, te, ta) and translate
  const base = generateJayashreePredictionBase(kundli, context, "en");

  const fields = ["intro", "dashaContext", "education", "career", "health", "finance", "housing"] as const;
  const originals = fields.map((key) => base[key]);

  const translated = await translateTexts(originals, lang);

  const result = { ...base };
  fields.forEach((key, i) => {
    result[key] = translated[i] ?? base[key];
  });

  return result;
}