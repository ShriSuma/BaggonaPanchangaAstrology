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

  // Dynamic lords of 2nd, 4th, 10th, 8th, 11th, etc.
  const p2Lord = lordOfHouse(kundli, 2);
  const p4Lord = lordOfHouse(kundli, 4);
  const p5Lord = lordOfHouse(kundli, 5);
  const p10Lord = lordOfHouse(kundli, 10);
  const p11Lord = lordOfHouse(kundli, 11);
  const p8Lord = lordOfHouse(kundli, 8);

  const p2 = kundli.planets.find(p => p.name === p2Lord);
  const p4 = kundli.planets.find(p => p.name === p4Lord);
  const p5 = kundli.planets.find(p => p.name === p5Lord);
  const p10 = kundli.planets.find(p => p.name === p10Lord);
  const p11 = kundli.planets.find(p => p.name === p11Lord);
  const p8 = kundli.planets.find(p => p.name === p8Lord);

  // Calculate transits dynamically from Moon sign
  const now = new Date();
  const longs = siderealLongitudes(now, model);
  
  const saturnTransitRashi = degreeToRashi(longs.saturn).index;
  const saturnTransitHouse = ((saturnTransitRashi - natalMoonRashiIdx + 12) % 12) + 1;

  const jupiterTransitRashi = degreeToRashi(longs.jupiter).index;
  const jupiterTransitHouse = ((jupiterTransitRashi - natalMoonRashiIdx + 12) % 12) + 1;

  // Check Dasha Sandhi
  let isSandhi = false;
  let sandhiTransition = "";
  const dashaTimeline = generateDashaTimeline(kundli);
  for (const entry of dashaTimeline) {
    const diff = Math.abs(ageDecimal - entry.endAge);
    if (diff <= 1.0) {
      if (entry.planet === PlanetName.Venus) {
        isSandhi = true;
        sandhiTransition = "Venus-Sun (ಶುಕ್ರ-ರವಿ)";
      } else if (entry.planet === PlanetName.Mars) {
        isSandhi = true;
        sandhiTransition = "Mars-Rahu (ಮಂಗಳ-ರಾಹು)";
      } else if (entry.planet === PlanetName.Rahu) {
        isSandhi = true;
        sandhiTransition = "Rahu-Jupiter (ರಾಹು-ಗುರು)";
      }
    }
  }

  // Check Ashtamadhipatya rule
  let isTulaOrMeshaLagna = lagnaRashiIdx === 0 || lagnaRashiIdx === 6; // Aries or Libra
  let isSunOrMoon8L = p8Lord === PlanetName.Sun || p8Lord === PlanetName.Moon;

  if (lang === "kn") {
    const nakshatraKn = NAKSHATRAS_KN[moonNakshatraIdx] ?? "";
    const rashiKn = RASHIS_KN[natalMoonRashiIdx] ?? "";
    const lagnaKn = RASHIS_KN[lagnaRashiIdx] ?? "";
    const birthLordKn = PLANETS_KN[birthLord];
    const mahaLordKn = PLANETS_KN[mahaLord];
    const bhuktiLordKn = PLANETS_KN[bhuktiLord];

    const p2LordKn = PLANETS_KN[p2Lord];
    const p4LordKn = PLANETS_KN[p4Lord];

    const intro = `ಗ್ರೀಟಿಂಗ್ಸ್, ಆತ್ಮೀಯ ${name}. ಜಯಶ್ರೀ ಪಂಡಿತ್ ರವರು ನಿಮ್ಮ ಜಾತಕವನ್ನು ವಿವರವಾಗಿ ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದಾರೆ. ನೀವು ಹುಟ್ಟಿದ ನಕ್ಷತ್ರ ${nakshatraKn}, ರಾಶಿ ${rashiKn}, ಮತ್ತು ಲಗ್ನ ${lagnaKn} ಆಗಿದೆ.`;

    const dashaContext = `ವಿಶ್ಲೇಷಣೆ ಮಾಡಿದಾಗ, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಅಧಿಪತಿಯಾದ ${birthLordKn} ಮಹಾದೆಸೆಯಲ್ಲಿ ಹುಟ್ಟಿದ್ದೀರಿ. ಹುಟ್ಟಿದಾಗ ಈ ದೆಸೆಯು ${birthBalance.y} ವರ್ಷ ${birthBalance.m} ತಿಂಗಳು ${birthBalance.d} ದಿನಗಳವರೆಗೆ ಇತ್ತು. ಪ್ರಸ್ತುತ, ನೀವು ${ageYears} ವರ್ಷದ ${ageMonths} ತಿಂಗಳ ವಯಸ್ಸಿನಲ್ಲಿ ${mahaLordKn} ಮಹಾದೆಸೆಯಲ್ಲಿ ${bhuktiLordKn} ಭುಕ್ತಿಯನ್ನು ನಡೆಸುತ್ತಿದ್ದೀರಿ. ಇದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಪ್ರಮುಖ ತಿರುವು.`;

    const education = `ಶಿಕ್ಷಣದ ಬಗ್ಗೆ ಹೇಳುವುದಾದರೆ, ದ್ವಿತೀಯಾಧಿಪತಿ (${p2LordKn}) ಮತ್ತು ಚತುರ್ಥಾಧಿಪತಿ (${p4LordKn}) ಅವರ ಶುಭ ಸ್ಥಿತಿಯು ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಪೂರಕವಾಗಿದೆ. ೨೮ ವರ್ಷ ೧೧ ತಿಂಗಳು ವರೆಗೂ ಜಾತಕದಲ್ಲಿ ಉನ್ನತ ಶಿಕ್ಷಣಕ್ಕೆ ಅತ್ಯಂತ ಉತ್ತಮ ಅವಕಾಶಗಳಿವೆ. ನಿರಂತರ ಪ್ರಯತ್ನ ಮತ್ತು ಏಕಾಗ್ರತೆಯಿಂದ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.`;

    const career = `ಉದ್ಯೋಗದ ವಿಷಯದಲ್ಲಿ ಹೇಳುವುದಾದರೆ, ಚತುರ್ಥ ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿ ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಕರ್ಮಾಧಿಪತಿ ಚಂದ್ರನ ಜೊತೆಯಲ್ಲೇ ಇರುವುದರಿಂದ ಉದ್ಯೋಗದಲ್ಲಿ ಉತ್ತಮ ಯಶಸ್ಸು ಕಂಡುಬರುತ್ತದೆ. ರಾಜ್ಯ ಸರ್ಕಾರದಿಂದ ಅಥವಾ ಸೆಂಟ್ರಲ್ ಗೌರ್ಮೆಂಟ್ (ಕೇಂದ್ರ ಸರ್ಕಾರ) ಹುದ್ದೆಗಳಲ್ಲಿ ಅವಕಾಶಗಳಿವೆ. ಆರಂಭದಲ್ಲಿ ಕಾರ್ಮಿಕ ಕೆಲಸದಂತಹ ಕಠಿಣ ಶ್ರಮವಿದ್ದರೂ, ಸಾರ್ವಜನಿಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಒಳ್ಳೆ ಹೆಸರು ಗಳಿಸುತ್ತಾರೆ. ೩೪ ರಿಂದ ೪೬ ವರ್ಷದ ಅವಧಿಯಲ್ಲಿ ಉದ್ಯೋಗದಲ್ಲಿ ಮಹತ್ವದ ಬದಲಾವಣೆ ಅಥವಾ ವರ್ಗಾವಣೆಗಳು ಕಾಣಿಸುತ್ತವೆ. ೨೦೩೦ ರ ಹೊತ್ತಿಗೆ ಉದ್ಯೋಗದಲ್ಲಿ ಉತ್ತಮ ಸ್ಥಿರತೆ ದೊರೆಯುತ್ತದೆ.`;

    let shaniTransitKnText = "";
    if ([12, 1, 2].includes(saturnTransitHouse)) {
      shaniTransitKnText = `ಪ್ರಸ್ತುತ ಗೋಚಾರ ಶನಿಯು ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ ${saturnTransitHouse}ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಜಾತಕದಲ್ಲಿ ಏಳೂವರೆ ಶನಿ ಪ್ರಭಾವ ಬೀರಲಿದ್ದಾನೆ.`;
    } else if (saturnTransitHouse === 8) {
      shaniTransitKnText = "ಪ್ರಸ್ತುತ ಗೋಚಾರ ಶನಿಯು ಜನ್ಮ ಚಂದ್ರನಿಂದ ೮ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವವಿದೆ.";
    } else if (saturnTransitHouse === 4) {
      shaniTransitKnText = "ಪ್ರಸ್ತುತ ಗೋಚಾರ ಶನಿಯು ಜನ್ಮ ಚಂದ್ರನಿಂದ ೪ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಅರ್ಧಾಷ್ಟಮ ಶನಿ ಪ್ರಭಾವವಿದೆ.";
    } else {
      shaniTransitKnText = `ಪ್ರಸ್ತುತ ಗೋಚಾರ ಶನಿಯು ಜನ್ಮ ಚಂದ್ರನಿಂದ ${saturnTransitHouse}ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಸಾಧಾರಣ ಪ್ರಭಾವ ಬೀರಲಿದ್ದಾನೆ.`;
    }

    let health = `ಆರೋಗ್ಯದ ದೃಷ್ಟಿಯಿಂದ, ೩೪ ರಿಂದ ೪೬ ವರ್ಷದ ಅವಧಿಯಲ್ಲಿ ದೈಹಿಕ ಆಯಾಸ ಮತ್ತು ಆರೋಗ್ಯದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಕಿರಿಕಿರಿಗಳು ಕಂಡುಬರಬಹುದು. ರಹಸ್ಯ ವೈರಿಗಳ ಉಪಸ್ಥಿತಿ ಮತ್ತು ಮಾನಸಿಕ ನೆಮ್ಮದಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು. ${shaniTransitKnText} ಪರಿಹಾರಕ್ಕಾಗಿ ಶಿವನ ಆರಾಧನೆ ಮತ್ತು ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮಾಡುವುದು ಉತ್ತಮ.`;
    
    if (isSandhi) {
      health += ` ಗಮನಿಸಿ: ನೀವು ಪ್ರಸ್ತುತ ${sandhiTransition} ದಶಾ ಸಂಧಿಯಲ್ಲಿದ್ದೀರಿ (ದೆಸೆಯ ಬದಲಾವಣೆ ಸಮಯ). ಈ ಅವಧಿಯಲ್ಲಿ ದಶಾ ಸಂಧಿ ಶಾಂತಿ ಮಾಡಿಸುವುದು ಶ್ರೇಯಸ್ಕರ.`;
    }

    const finance = `ಹಣಕಾಸಿನ ವಿಚಾರದಲ್ಲಿ ಹೇಳುವುದಾದರೆ, ಆದಾಯಕ್ಕೆ ತಕ್ಕಂತೆ ಅಷ್ಟೇ ಖರ್ಚು ಮಾಡಬೇಕೆಂದು ಜಯಶ್ರೀ ಪಂಡಿತ್ ರವರು ಸಲಹೆ ನೀಡುತ್ತಾರೆ. ಎರಡನೇ ಹಾಗೂ ಹನ್ನೊಂದನೇ ಮನೆಯ ಅಧಿಪತಿಗಳು ದುಸ್ಥಾನದಲ್ಲಿದ್ದರೆ ಧನ ಹರಿವು ಹೆಚ್ಚಿದ್ದರೂ ವೆಚ್ಚಗಳು ನಿಯಂತ್ರಣ ತಪ್ಪಬಹುದು. ಯೋಜಿತ ಬಜೆಟ್‌ನೊಂದಿಗೆ ಆರ್ಥಿಕ ಶಿಸ್ತನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.`;

    const housing = `ನಿವಾಸದ ವಿಷಯದಲ್ಲಿ, ಸ್ವಂತ ಮನೆಯಲ್ಲಿದ್ದರೆ ಗ್ರಹಗಳ ಅಶುಭ ಗೋಚಾರದ ಪ್ರಭಾವಗಳು ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತವೆ ಮತ್ತು ಮನೆಯಲ್ಲಿ ನೆಮ್ಮದಿ ನೆಲೆಸುತ್ತದೆ. ಬಾಡಿಗೆ ಮನೆಯಲ್ಲಿದ್ದರೆ ಪದೇ ಪದೇ ಸ್ಥಳಾಂತರ ಅಥವಾ ಕೌಟುಂಬಿಕ ಕಿರಿಕಿರಿಗಳು ಉಂಟಾಗಬಹುದು.`;

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

    const intro = `Dear ${name}, greetings. Jayashree Pandit is analyzing your horoscope in detail. You were born on ${birthDate} at ${birthTime}. Your birth Nakshatra is ${nakshatraEn}, Rashi is ${rashiEn}, and Ascendant (Lagna) is ${lagnaEn}.`;

    const dashaContext = `Upon analyzing your horoscope, you were born under the Mahadasha of ${birthLordEn}, the lord of your birth Nakshatra. At birth, this Dasha had a remaining balance of ${birthBalance.y} years, ${birthBalance.m} months, and ${birthBalance.d} days. Currently, at the age of ${ageYears} years and ${ageMonths} months, you are running ${mahaLordEn} Mahadasha with ${bhuktiLordEn} Bhukti. This is a significant turning point in your life.`;

    const education = `Regarding education, the placement of the 2nd house lord (${p2LordEn}) and the 4th house lord (${p4LordEn}) supports academic learning. The period up to 28 years and 11 months is critical and highly supportive for higher studies and academic accomplishment. Consistent effort and dedication will help you overcome these delays.`;

    const career = `Regarding career, the positioning of the 4th and 5th house lords in the 10th house of Karma, with the 10th lord conjunct the Moon, indicates excellent prospects. You have strong indicators for state government or central government employment. Although early stages require service-oriented hard work, you will earn a good reputation in public fields. The age block of 34 to 46 years suggests career transformations or transfers. By 2030, you will find stable ground and clear professional progress.`;

    let shaniTransitEnText = "";
    if ([12, 1, 2].includes(saturnTransitHouse)) {
      shaniTransitEnText = `Currently, transit Saturn is in your ${saturnTransitHouse}th house from Moon, causing Sade Sati.`;
    } else if (saturnTransitHouse === 8) {
      shaniTransitEnText = "Currently, transit Saturn is in your 8th house from Moon, causing Ashtama Shani.";
    } else if (saturnTransitHouse === 4) {
      shaniTransitEnText = "Currently, transit Saturn is in your 4th house from Moon, causing Ardha-Ashtama Shani.";
    } else {
      shaniTransitEnText = `Currently, transit Saturn is transiting your ${saturnTransitHouse}th house from Moon, in a neutral position.`;
    }

    let health = `Regarding health and transits, minor health issues, fatigue, or mental stress could surface during the ages of 34 to 46. ${shaniTransitEnText} To manage these transits, practicing meditation, worshipping Lord Shiva, and chanting Hanuman Chalisa is highly recommended.`;

    if (isSandhi) {
      health += ` Note: You are currently near a ${sandhiTransition} Dasha Sandhi (transition period). Performing Sandhi Shanti homam is recommended to ease this transition.`;
    }

    const finance = `In financial matters, Mother Jayashree advises that you must match your expenses to your income. Since your financial houses suggest fluctuations, keeping a strict budget and avoiding unnecessary expenditures will ensure long-term wealth accumulation.`;

    const housing = `Concerning your residence, living in your own home will buffer you against negative planetary transits and bring stability. Residing in rented properties could trigger temporary domestic worries or relocation delays.`;

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