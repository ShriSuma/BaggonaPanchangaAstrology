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

    const intro = `ನಮಸ್ಕಾರ, ನಾನು ಜಯಶ್ರೀ ಪಂಡಿತ್. ಕಳೆದ ೬೦ ವರ್ಷಗಳಿಂದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮತ್ತು ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರದಲ್ಲಿ ನನ್ನ ಅನುಭವವನ್ನು ಧಾರೆ ಎರೆದಿದ್ದೇನೆ. ಈಗ ನಾನು ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇನೆ. ನೀವು ${nakshatraKn} ನಕ್ಷತ್ರ ${rashiKn} ರಾಶಿಯಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ. ನಿಮ್ಮ ಲಗ್ನವು ${lagnaKn} ಆಗಿದೆ. ನಿಮ್ಮ ಜಾತಕದ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಈಗ ಪ್ರಾರಂಭಿಸೋಣ.`;

    const dashaContext = `ನಿಮ್ಮ ಜನ್ಮ ಸಮಯದ ಆಧಾರದ ಮೇಲೆ, ನೀವು ಜನಿಸಿದಾಗ ${birthLordKn} ದಶೆ ನಡೆಯುತ್ತಿತ್ತು. ಈಗ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ವಯಸ್ಸಿಗೆ ಅನುಗುಣವಾಗಿ, ನಿಮಗೆ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದೆ. ಗ್ರಹಗಳ ಈ ಸಂಚಾರ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿಯ ಪ್ರಭಾವವು ನಿಮ್ಮ ಜೀವನದ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳನ್ನು ಹೇಗೆ ರೂಪಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ನಾನು ವಿವರಿಸುತ್ತೇನೆ.`;

    let health = `ಮೊದಲನೆಯದಾಗಿ, ಆರೋಗ್ಯದ ವಿಚಾರ: ಆರನೇ ಮನೆಯಿಂದ ರೋಗ ಮತ್ತು ವೈರಿಗಳ ವಿಚಾರವನ್ನು ನೋಡುತ್ತೇವೆ. ಆರನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${p6LordKn} ${p6House}ನೇ ಮನೆಯಲ್ಲಿ ಕುಳಿತಿದ್ದಾನೆ. ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯು ${saturnTransitHouse}ನೇ ಮನೆಯಲ್ಲಿ ಮತ್ತು ಗುರುವು ${jupiterTransitHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾರೆ. ಈ ಗ್ರಹಗತಿಯಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯದಲ್ಲಿ ಕೆಲವು ಸಣ್ಣಪುಟ್ಟ ಏರುಪೇರುಗಳು, ಅಂದರೆ ಕೀಲು ನೋವು ಅಥವಾ ಆಯಾಸ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಆದರೆ ಭಯಪಡುವ ಅಗತ್ಯವಿಲ್ಲ. ಸರಿಯಾದ ಆಹಾರ ಪದ್ಧತಿ ಮತ್ತು ದೈನಂದಿನ ವ್ಯಾಯಾಮದಿಂದ ನೀವು ಉತ್ತಮ ಆರೋಗ್ಯವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಬಹುದು. ದೇವರ ಮೇಲೆ ಭಾರ ಹಾಕಿ, ನಿಯಮಿತವಾಗಿ ಕುಲದೇವರ ಆರಾಧನೆ ಮಾಡುವುದರಿಂದ ದೈಹಿಕ ಮತ್ತು ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಲಭಿಸುತ್ತದೆ.`;
    
    if (isSandhi) {
      health += ` ಇದಲ್ಲದೆ, ಪ್ರಸ್ತುತ ನಿಮಗೆ ${sandhiTransitionKn} ನಡೆಯುತ್ತಿರುವುದರಿಂದ, ದಶಾ ಸಂಧಿಯ ಕಾಲದಲ್ಲಿ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೊಂಚ ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ. ಈ ದಶಾ ಸಂಧಿ ಶಾಂತಿಯನ್ನು ಮಾಡಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`;
    }

    const career = `ಎರಡನೆಯದಾಗಿ, ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿಜೀವನ: ಹತ್ತನೇ ಮನೆಯಿಂದ (ಕರ್ಮ ಸ್ಥಾನ) ವೃತ್ತಿ ಮತ್ತು ರಾಜ್ಯ ಸರ್ಕಾರದ ನೌಕರಿಯನ್ನು ನೋಡುತ್ತೇವೆ. ಇದರ ಅಧಿಪತಿ ${p10LordKn} ${p10House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ಲಾಭ ಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${p11LordKn} ${p11House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ, ನೀವು ಎಂದಿಗೂ ಸುಮ್ಮನೆ ಕೂರುವವರಲ್ಲ; ಸದಾ ಕಾಲ ಒಂದಲ್ಲ ಒಂದು ಕೆಲಸದಲ್ಲಿ ನಿಮ್ಮನ್ನು ತೊಡಗಿಸಿಕೊಳ್ಳುತ್ತೀರಿ. ನೀವು ಮಾಡುವ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ಖಂಡಿತ ಸಿಗುತ್ತದೆ. ಸಾರ್ವಜನಿಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕತೆಗೆ ಒಳ್ಳೆಯ ಹೆಸರು ಮತ್ತು ಮನ್ನಣೆ ಲಭಿಸುತ್ತದೆ. ಮೇಲಧಿಕಾರಿಗಳಿಂದ ಮೆಚ್ಚುಗೆ ಮತ್ತು ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು ನಿಮ್ಮ ಹೆಗಲೇರಲಿವೆ.`;

    const housing = `ಮೂರನೆಯದಾಗಿ, ಕುಟುಂಬ, ಹೆಂಡತಿ ಮತ್ತು ಮಕ್ಕಳು: ನಾಲ್ಕನೇ ಮನೆಯಿಂದ ಕುಟುಂಬದ ಸುಖ, ತಾಯಿ, ಮತ್ತು ವಾಹನವನ್ನು ನೋಡುತ್ತೇವೆ. ಇದರ ಅಧಿಪತಿಯಾದ ${p4LordKn} ${p4House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನವು ಮಧುರವಾಗಿರುತ್ತದೆ. ಪತ್ನಿಯೊಂದಿಗೆ ಉತ್ತಮ ಬಾಂಧವ್ಯ ಮತ್ತು ಅನ್ಯೋನ್ಯತೆ ಮೂಡಲಿದೆ. ಮಕ್ಕಳ ವಿಷಯದಲ್ಲಿ ನೋಡುವುದಾದರೆ, ಅವರ ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಬೆಳವಣಿಗೆಯು ನಿಮಗೆ ಸಂತಸ ತರುತ್ತದೆ. ಒಟ್ಟಾರೆಯಾಗಿ ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿಯ ವಾತಾವರಣ ನೆಲೆಸಲಿದೆ. ಮನೆಯಲ್ಲಿ ಯಾವುದೇ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳಿದ್ದರೂ, ಪರಸ್ಪರ ಮಾತುಕತೆಯಿಂದ ಅವು ಸುಲಭವಾಗಿ ಬಗೆಹರಿಯಲಿವೆ.`;

    const finance = `ನಾಲ್ಕನೆಯದಾಗಿ, ದೈನಂದಿನ ಚಟುವಟಿಕೆ, ಆರ್ಥಿಕತೆ ಮತ್ತು ಸಂಪತ್ತು: ಎರಡನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${p2LordKn} ${p2House}ನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ. ಹಣಕಾಸಿನ ಹರಿವು ಉತ್ತಮವಾಗಿದ್ದರೂ, ಕೈಯಲ್ಲಿ ದುಡ್ಡು ನಿಲ್ಲುವುದು ಕಷ್ಟ. ನೀವು ಎಷ್ಟು ಸಂಪಾದನೆ ಮಾಡುತ್ತೀರೋ, ಅಷ್ಟೇ ಖರ್ಚು ಕೂಡ ಬರುತ್ತದೆ. ಅನಗತ್ಯ ಖರ್ಚುಗಳಿಗೆ ಕಡಿವಾಣ ಹಾಕುವುದು ಒಳಿತು. ಆದರೂ, ನಿಮ್ಮ ಭಾಗ್ಯ ಸ್ಥಾನದ ಅಧಿಪತಿಯಾದ ${p9LordKn} ಮತ್ತು ಗುರುವಿನ ಅನುಗ್ರಹದಿಂದ ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳು ನಿಮ್ಮನ್ನು ಕಾಡುವುದಿಲ್ಲ. ದೈನಂದಿನ ಚಟುವಟಿಕೆಗಳಲ್ಲಿ ಚುರುಕುತನವಿರುತ್ತದೆ. ಕುಟುಂಬದೊಂದಿಗೆ ಕಾಲ ಕಳೆಯಲು ಮತ್ತು ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ಪಾಲ್ಗೊಳ್ಳಲು ಇದು ಸಕಾಲ. ಸ್ವಂತ ಮನೆ ಕಟ್ಟುವ ಅಥವಾ ಜಾಗ ಖರೀದಿಸುವ ಯೋಗವೂ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿದೆ.`;

    const education = `ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಶಿಕ್ಷಣ: ಐದನೇ ಮನೆಯಿಂದ ವಿದ್ಯೆ, ಬುದ್ಧಿ ಮತ್ತು ಉನ್ನತ ಶಿಕ್ಷಣವನ್ನು ನೋಡುತ್ತೇವೆ. ಇದರ ಅಧಿಪತಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ. ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಇದು ಅತ್ಯುತ್ತಮ ಸಮಯ. ನೀವು ನಿರೀಕ್ಷಿಸಿದ ಫಲಿತಾಂಶಗಳು ಖಂಡಿತವಾಗಿ ದೊರೆಯಲಿವೆ. ಏಕಾಗ್ರತೆ ಹೆಚ್ಚಾಗಿರುತ್ತದೆ ಮತ್ತು ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವ ಆಸಕ್ತಿ ಮೂಡುತ್ತದೆ. ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ವಿದೇಶಕ್ಕೆ ಹೋಗುವ ಪ್ರಯತ್ನಗಳಿದ್ದರೆ, ಅದರಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗುವ ಸಾಧ್ಯತೆಗಳಿವೆ. ತಾಯಿ ಸರಸ್ವತಿಯ ಆರಾಧನೆ ಮಾಡುವುದರಿಂದ ಇನ್ನಷ್ಟು ಒಳಿತಾಗುತ್ತದೆ.`;

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

    const intro = `Namaskara, I am Jayashree Pandit. With over 60 years of profound experience in Jyotishya and Baggona Panchanga, I am now looking at your horoscope. You were born in ${nakshatraEn} Nakshatra and ${rashiEn} Rashi. Your Ascendant (Lagna) is ${lagnaEn}. Let us dive deep into the detailed analysis of your birth chart.`;

    const dashaContext = `Based on your exact birth time, you were born during the period of ${birthLordEn} Dasha. At your current age, you are going through the Mahadasha of ${mahaLordEn} and the Antardasha (Bhukti) of ${bhuktiLordEn}. Let me explain how this current planetary period, combined with ongoing transits, will shape your life path.`;

    let health = `First, let's talk about your Health: We analyze diseases and physical well-being from the 6th house. The lord of the 6th house, ${p6LordEn}, is placed in the ${p6House}th house. Currently, in transit, Saturn is moving through your ${saturnTransitHouse}th house and Jupiter through the ${jupiterTransitHouse}th house. Due to this planetary alignment, you might experience minor health fluctuations like joint pains or general fatigue. However, there is no need to worry. Maintaining a disciplined diet and daily exercise will keep you strong. Have faith in the divine; regular prayers to your family deity will ensure both physical and mental peace.`;

    if (isSandhi) {
      health += ` Additionally, since you are going through a ${sandhiTransitionEn}, which is a transitional planetary phase, it is advisable to be slightly more careful about your health and perform the relevant Sandhi Shanti rituals for smooth sailing.`;
    }

    const career = `Second, regarding your Work and Career: The 10th house (Karma Sthana) rules your profession, and its lord ${p10LordEn} is sitting in the ${p10House}th house. The lord of gains, ${p11LordEn}, is in the ${p11House}th house. According to your chart, you are someone who cannot sit idle; you are always actively engaged in your work. The hard work and dedication you put in will definitely yield fruitful results. You will earn a highly respected name in the public sphere or your professional circle. Appreciation from superiors and new responsibilities are strongly indicated.`;

    const housing = `Third, looking at your Family, Spouse, and Children: The 4th house signifies domestic happiness, and its lord ${p4LordEn} is in the ${p4House}th house. Your marital life is blessed with warmth and understanding. You will share a deeply affectionate bond with your spouse. Regarding children, their growth, education, and achievements will bring you immense joy and pride. Overall, a peaceful and harmonious atmosphere will prevail in your household. Any minor disagreements can be easily resolved through patient communication.`;

    const finance = `Finally, your Daily Activities, Finances, and Wealth: The 2nd lord of wealth, ${p2LordEn}, is in the ${p2House}th house. While your earning capacity and cash flow are excellent, holding onto money might be a challenge for you. Your expenses tend to match your income. It is advisable to put a check on unnecessary expenditures. Nevertheless, thanks to the blessings of your 9th lord ${p9LordEn} and Jupiter, you will never face severe financial blockages. You will remain highly active in your daily routines. This is also a favorable period for family gatherings, religious activities, and there is a strong yoga for purchasing property or constructing a house.`;

    const education = `Regarding Education and Knowledge: The 5th house governs intellect, learning, and higher education. The lord of the 5th house is favorably placed in your chart. For students, this is an excellent period. You will certainly achieve your expected results. Your concentration levels will be high, and you will develop a keen interest in learning new subjects. If you are trying for higher education abroad, there are strong chances of success. Worshipping Goddess Saraswati will bring you even greater benefits.`;

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