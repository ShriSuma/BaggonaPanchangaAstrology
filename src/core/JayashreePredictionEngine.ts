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
  const p6Lord = lordOfHouse(kundli, 6);
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

  if (lang === "kn") {
    const nakshatraKn = NAKSHATRAS_KN[moonNakshatraIdx] ?? "";
    const rashiKn = RASHIS_KN[natalMoonRashiIdx] ?? "";
    const lagnaKn = RASHIS_KN[lagnaRashiIdx] ?? "";
    const birthLordKn = PLANETS_KN[birthLord];
    const mahaLordKn = PLANETS_KN[mahaLord];
    const bhuktiLordKn = PLANETS_KN[bhuktiLord];

    const p2LordKn = PLANETS_KN[p2Lord];
    const p4LordKn = PLANETS_KN[p4Lord];
    const p9LordKn = PLANETS_KN[p9Lord];
    const p10LordKn = PLANETS_KN[p10Lord];
    const p11LordKn = PLANETS_KN[p11Lord];
    const p6LordKn = PLANETS_KN[p6Lord];

    const intro = `ಈಗ ನಾನು ${name} ${nakshatraKn} ನಕ್ಷತ್ರ ${rashiKn} ರಾಶಿ ಇವರದು ಜಾತಕ ನೋಡ್ತಾ ಇದ್ದ ಇಲ್ಲಿ . ಹುಟ್ಟಿದ್ದು ${birthDate} ತಾರೀಕು ಹಗಲು/ರಾತ್ರಿ ${birthTime} ನಿಮಿಷ ಹುಟ್ಟದ್ದು ಈಗ ಜಾತಕ ಹೆಂಗೆ ನೋಡ್ತೋ ಅದರ ಬಗ್ಗೆ ವಿಶ್ಲೇಷಣೆ ಶುರು ಜಯಶ್ರೀ ಪಂಡಿತ್ ಹೇಳ್ತಿರೋರು . ಲಗ್ನ ಬಂದು ${lagnaKn} .`;

    const dashaContext = `ಈಗ ಜಾತಕ ಪರಿಶೀಲನೆ ಮಾಡಿದಾಗ, ಈಗ ಇವರಿಗೆ ${mahaLordKn} ದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡತಾ ಇತ್ತು . ಸೋ ಫಸ್ಟ್ ದಶಾ ಭುಕ್ತಿ ತಗತಾನ . ಈಗ ಯಾವುದು ಕರೆಕ್ಟ್ ಆಗಿ ಫಸ್ಟ್ ವಯಸ್ಸು ಎಷ್ಟು ನೋಡ್ಕೊತಾನೆ . ಓಕೆ . ಆ ವಯಸ್ಸು ಎಷ್ಟು ಸಾಧಾರಣವಾಗಿ ಈಗ ವಯಸ್ಸು ${ageYears} ವರ್ಷದ ${ageMonths} ತಿಂಗಳು ಆಯ್ತು . ಈ ವಯಸ್ಸಿಗೆ ಈಗ ಹುಟ್ಟಕಾದರೆ ಯಾವ ದಶೆ ಒಳಗೆ ಹುಟ್ಟಿದ್ದ? ಹುಟ್ಟಕಾದರೆ ${nakshatraKn} ನಕ್ಷತ್ರಕ್ಕೆ ${birthLordKn} ದಶೆ . ಹುಟ್ಟಕಾದ್ರೆ ${birthLordKn} ದಶೆ ನಡೆತಾ ಇತ್ತು . ಇಷ್ಟು ವರ್ಷ ಬಾಕಿ ಇತ್ತು, ${birthBalance.y} ವರ್ಷದ ${birthBalance.m} ತಿಂಗಳ ${birthBalance.d} ದಿವಸ ಬಾಕಿ ಇತ್ತು . ಕಡೆಗೆ ಈಗ ರನ್ನಿಂಗ್ ಏಜ್ ದಶಭುಕ್ತಿ ತಕೊಂಡು ಲೆಕ್ಕ ಹಾಕ ಹೋಗುವರೆಗೆ ಈಗ ಹಾಲಿ ${mahaLordKn} ದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡತು . ಆಧಾರದ ಮೇಲೆ ಅವರಿಗೆ ಹಾಲಿ ಯಾವ ದಶಾ ಭುಕ್ತಿ ನಡತಾಯಿತು ಲೆಕ್ಕ ಆತ .`;

    const education = `ಶಿಕ್ಷಣದ ವಿಷಯದಲ್ಲಿ ಕೇಳುವುದಾದರೆ ಶಿಕ್ಷಣದ ವಿಷಯದಲ್ಲಿ ಚಲೋ ಇದ್ದು . ಒಂಬತ್ತನೇ ಮನೆಯಿಂದ ನಾವು ಉನ್ನತ ಶಿಕ್ಷಣ ನೋಡ್ತಾ . ಭಾಗ್ಯಾಧಿಪತಿಯಾದ ${p9LordKn} ${p9House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಚತುರ್ಥ ಸ್ಥಾನದಿಂದ ನಾವು ಹೈಸ್ಕೂಲ್ ಶಿಕ್ಷಣ ನೋಡ್ತಾ, ಇದರ ಅಧಿಪತಿ ${p4LordKn} ${p4House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಈ ಗ್ರಹಗಳಿಗೆ ಬಲ ಇರೋದ್ರಿಂದವ ಇವರಿಗೆ ಅಷ್ಟು ಪ್ರಾಬ್ಲಮ್ ಬರ್ತಿದೆ ಹಿಂಗಾಗಿ ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕೆ ಹೋಗುವ ಯೋಗ ಇದ್ದು .`;

    const career = `ಉದ್ಯೋಗ ನೋಡುದಾದರೆ ಕರ್ಮಸ್ಥಾನದಿಂದವ ರಾಜ್ಯ ಸರ್ಕಾರದ ನೌಕರಿ ನೋಡ್ತಾರೆ . ಕರ್ಮಾಧಿಪತಿಯಾದ ${p10LordKn} ${p10House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಲಾಭಸ್ಥಾನದಿಂದವ ಸೆಂಟ್ರಲ್ ಗವರ್ನಮೆಂಟ್ ಜಾಬ್ ನೋಡ್ತಾರೆ . ಲಾಭಾಧಿಪತಿಯಾದ ${p11LordKn} ${p11House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಉದ್ಯೋಗದ ವಿಷಯದಲ್ಲಿ ಆಗಲಿ ಕಾರ್ಮಿಕ ಕೆಲಸ ಶ್ರಮದ ಕೆಲಸ ಒಂದು ಮಿನಿಟ್ ಖಾಲಿ ಇರ್ತದ ಮೇಲೆ ಅದು ಆ ಕೆಲಸದೊಳಗೆ ಅವನು ತೊಡಗಿಕೊಂಡು ಇರ್ತಾನೆ . ಸಾರ್ವಜನಿಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅವ ಒಳ್ಳೆ ಹೆಸರು ಗಳಿಸ್ತಾ ತೊಂದರೆ ಇಲ್ಲ .`;

    let health = `ಆರೋಗ್ಯದ ವಿಷಯದಲ್ಲಿ ೬ನೇ ಮನೆ, ೮ನೇ ಮನೆ, ೧೨ನೇ ಮನೆ ನೋಡಬೇಕು . ಆರು ಅಂದ್ರೆ ರೋಗ ವೈರಿ ಸಾಲ . ಆರನೇ ಮನೆ ಅಧಿಪತಿ ${p6LordKn} ${p6House}ನೇ ಮನೆಯಲ್ಲಿ ಇದ್ದದರಿಂದ ಅವ ರೋಗ ವೈರಿ . ಈಗ ಹಾಲಿ ಗೋಚಾರದಲ್ಲಿ ಶನಿ ${saturnTransitHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದ, ಗುರು ${jupiterTransitHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಇದರಿಂದ ಕೆಲವು ಸಮಸ್ಯೆಗಳು ಆರೋಗ್ಯದಲ್ಲಿ ಕಿರಿಕಿರಿ ಬರಲಕು . ಕಷ್ಟಗಳು ಬಂದಾಗ ಆ ದೇವರು ಈ ದೇವರು ಮಾಡ್ಕೊತ ಹೇಳ ಗೊತ್ತಿಲ್ಲ .`;
    
    if (isSandhi) {
      health += ` ಓಕೆ, ಇನ್ನೊಂದು ಏನು ಅಂದ್ರೆ ಇವರಿಗೆ ಈಗ ${sandhiTransitionKn} ನಡತಾ ಇತ್ತು . ಈ ಸಂಧಿ ಶಾಂತಿ ಕಾರ್ಯಕ್ರಮಗಳನ್ನೆಲ್ಲ ಆರು ತಿಂಗಳದ ಮುಂಚಿತವಾಗಿ ಮಾಡುವಳು ಹೇಳ್ತಾರೆ . ಸಂಧಿ ಶಾಂತಿ ಮಾಡಿಸೋದು ಒಳ್ಳೇದು .`;
    }

    const finance = `ಧನಾಧಿಪತಿ ${p2LordKn} ${p2House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ಎರಡನೇ ಮನೆಯಿಂದಲೂ ಹಣಕಾಸಿನ ವಿಷಯ ನೋಡ್ತಾ ಲಾಭ ಸ್ಥಾನದಿಂದಲೂ ನೋಡ್ತಾ . ಕೈಯಲ್ಲಿ ದುಡ್ಡು ತೋಳು ಇಡೋದು ಗೊತ್ತಿಲ್ಲ ಬೇಕಷ್ಟು ಸಂಪಾದನೆ ಮಾಡುವ ಆದ್ರೆ ದುಡ್ಡು ಅಷ್ಟೇ ಖರ್ಚು ಮಾಡುವ . ಸಾಲ ಮಾಡುವುದು ಅಂದ್ರೆ ದುಡ್ಡು ಖರ್ಚು ಆಗ್ತದೆ ನೋಡಿ ಈ ಹಿಂಗಾಗಿ . ಆದರೂ ಗುರು ಬಲ ಇರೋದ್ರಿಂದವ ಇವರಿಗೆ ಅಷ್ಟು ಪ್ರಾಬ್ಲಮ್ ಬರ್ತಿದೆ .`;

    const housing = `ಕೌಟುಂಬಿಕ ಸುಖ ಮನೆ ಖರೀದಿ ಈಗ ಮನೆ ಖರೀದಿಗೆ ಒಪ್ಪುದಾದ್ರೆ ಹೆಂಗೆ . ಲಗ್ನಾಥ ಚತುರ್ಥದಿಂದ ಕೌಟುಂಬಿಕ ಸುಖ ಮತ್ತು ವಾಹನ ಖರೀದಿ ನೋಡ್ತಾರೆ . ನಾಲ್ಕನೇ ಮನೆಯಿಂದ ತಾಯಿ . ಈ ಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${p4LordKn} ${p4House}ನೇ ಮನೆಯಲ್ಲಿದ್ದ . ತಾಯಿಯ ಸುಖ ಇದ್ದು . ವಾಹನ ಖರೀದಿ ಇದ್ದು ಮನೆ ಕಟ್ಟು ಯೋಗ ಇದ್ದು . ತಾಯಿಯ ಆಸ್ತಿ ಸಿಗುವ ಯೋಗ ಇದ್ದು ಓಹೋಹೋ ಹಿಂಗೆ ಹೇಳಕ .`;

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
    const p9LordEn = PLANETS_EN[p9Lord];
    const p10LordEn = PLANETS_EN[p10Lord];
    const p11LordEn = PLANETS_EN[p11Lord];
    const p6LordEn = PLANETS_EN[p6Lord];

    const intro = `Alright, so I am looking at the horoscope for ${name}, born in ${nakshatraEn} Nakshatra, ${rashiEn} Rashi here. Born on ${birthDate} at ${birthTime}. So let's start the analysis of how to read this horoscope, as told by Jayashree Pandit. The Ascendant (Lagna) is ${lagnaEn}.`;

    const dashaContext = `When we check the horoscope now, currently ${mahaLordEn} Dasha with ${bhuktiLordEn} Bhukti is running. So first, let's take the Dasha Bhukti. Okay, first we check what the exact age is. The age is basically ${ageYears} years and ${ageMonths} months now. If we look back at birth, what Dasha were they born in? Born in ${nakshatraEn} Nakshatra means ${birthLordEn} Dasha. The balance at birth was ${birthBalance.y} years, ${birthBalance.m} months, and ${birthBalance.d} days. So bringing it up to the current running age, it shows ${mahaLordEn} Dasha and ${bhuktiLordEn} Bhukti is happening right now. Based on this, we calculate the current planetary periods.`;

    const education = `If we talk about education, the prospects look good. We check higher education from the 9th house. The 9th lord ${p9LordEn} is placed in the ${p9House}th house. We check primary education from the 4th house, and its lord ${p4LordEn} is in the ${p4House}th house. Since these planets have strength, they won't face major problems, giving a clear path for higher education.`;

    const career = `If we look at career, we check state government jobs from the 10th house (Karma Sthana). The 10th lord ${p10LordEn} is in the ${p10House}th house. Central government jobs are checked from the 11th house (Labha Sthana), whose lord ${p11LordEn} is in the ${p11House}th house. Whether it's service or hard physical work, they won't sit idle for a minute and will constantly be engaged in work. They will earn a very good name in the public sphere without issues.`;

    let health = `For health matters, we have to look at the 6th, 8th, and 12th houses. The 6th house indicates diseases, enemies, and debts. The 6th lord ${p6LordEn} is in the ${p6House}th house. Right now in transit (Gochara), Saturn is in the ${saturnTransitHouse}th house and Jupiter in the ${jupiterTransitHouse}th house. This might cause some health irritations or issues. When difficulties arrive, people just start praying to whatever gods they can find, you know.`;

    if (isSandhi) {
      health += ` Okay, another thing is they are currently going through ${sandhiTransitionEn}. It is usually advised to perform the Sandhi Shanti rituals about six months in advance. Doing the Shanti homam is recommended.`;
    }

    const finance = `The wealth lord (2nd lord) ${p2LordEn} is in the ${p2House}th house. We check financial matters from the 2nd and 11th houses. They might not know how to hold onto money—they'll earn plenty but spend it just as fast. Making debts basically means expenses will happen, you see. However, due to Jupiter's strength, major problems will be avoided.`;

    const housing = `How about family happiness and buying a house? If we check for house purchase... we look at family comfort and vehicle purchase from the 4th house. The 4th house also represents the mother. The 4th lord ${p4LordEn} is in the ${p4House}th house. There is happiness from the mother. There are yogas to buy vehicles and build a house. Getting maternal property is also in the cards, oh yes, that's how we say it.`;

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