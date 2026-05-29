import * as Astronomy from "astronomy-engine";
import { degreeToRashi, normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import type { AyanamsaModel } from "./AstroTypes";

// Names of 60 Samvatsaras (Jovian cycle years)
const KN_SAMVATSARAS = [
  "ಪ್ರಭವ", "ವಿಭವ", "ಶುಕ್ಲ", "ಪ್ರಮೋದೂತ", "ಪ್ರಜೋತ್ಪತ್ತಿ", "ಆಂಗೀರಸ", "ಶ್ರೀಮುಖ", "ಭಾವ", "ಯುವ", "ಧಾತೃ",
  "ಈಶ್ವರ", "ಬಹುಧಾನ್ಯ", "ಪ್ರಮಾಥಿ", "ವಿಕ್ರಮ", "ವೃಷ", "ಚಿತ್ರಭಾನು", "ಸ್ವಭಾನು", "ತಾರಣ", "ಪಾರ್ಥಿವ", "ವ್ಯಯ",
  "ಸರ್ವಜಿತ್", "ಸರ್ವಧಾರಿ", "ವಿರೋಧಿ", "ವಿಕೃತಿ", "ಖರ", "ನಂದನ", "ವಿಜಯ", "Jaya", "ಮನ್ಮಥ", "ದುರ್ಮುಖಿ",
  "ಹೇವಿಳಂಬಿ", "ವಿಳಂಬಿ", "ವಿಕಾರಿ", "ಶಾರ್ವರಿ", "ಪ್ಲವ", "ಶುಭಕೃತ್", "ಶೋಭಕೃತ್", "ಕ್ರೋಧಿ", "ವಿಶ್ವಾವಸು", "ಪರಾಭವ",
  "ಪ್ಲವಂಗ", "ಕೀಲಕ", "ಸೌಮ್ಯ", "ಸಾಧಾರಣ", "ವಿರೋಧಿಕೃತ್", "ಪರಿದಾವಿ", "ಪ್ರಮಾದೀಚ", "ಆನಂದ", "ರಾಕ್ಷಸ", "ನಳ",
  "ಪಿಂಗಳ", "ಕಾಲಯುಕ್ತಿ", "ಸಿದ್ಧಾರ್ಥಿ", "ರೌದ್ರಿ", "ದುರ್ಮತಿ", "ದುಂದುಭಿ", "ರುಧಿರೋದ್ಗಾರಿ", "ರಕ್ತಾಕ್ಷಿ", "ಕ್ರೋಧನ", "ಅಕ್ಷಯ"
];

const EN_SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajopathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
  "Eeshvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrusha", "Chitrabanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajitu", "Sarvadhari", "Virodhi", "Vikruthi", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukhi",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrutu", "Shobhakrutu", "Krodhi", "Viswavasu", "Parabhava",
  "Plavanga", "Keelaka", "Saumya", "Sadharana", "Virodhikrutu", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Anala",
  "Pingala", "Kalayukti", "Siddharthru", "Raudri", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];

// Names of 12 Lunar Months (Masas)
const KN_MASAS = [
  "ಚೈತ್ರ", "ವೈಶಾಖ", "ಜ್ಯೇಷ್ಠ", "ಆಷಾಢ", "ಶ್ರಾವಣ", "ಭಾದ್ರಪದ",
  "ಆಶ್ವೀಜ", "ಕಾರ್ತಿಕ", "ಮಾರ್ಗಶಿರ", "ಪುಷ್ಯ", "ಮಾಘ", "ಫಾಲ್ಗುಣ"
];

const EN_MASAS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwija", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguni"
];

// Visha Ghati starting points for 27 Nakshatras
const VISHA_GHATI_START: Record<number, number> = {
  0: 50, 1: 24, 2: 30, 3: 40, 4: 14, 5: 21, 6: 30, 7: 20, 8: 32, 9: 30,
  10: 20, 11: 18, 12: 21, 13: 20, 14: 14, 15: 14, 16: 10, 17: 14, 18: 20, 19: 24,
  20: 20, 21: 10, 22: 10, 23: 18, 24: 16, 25: 24, 26: 30
};

const AMRITHA_GHATI_START: Record<number, number> = {
  0: 42, 1: 48, 2: 54, 3: 52, 4: 38, 5: 35, 6: 54, 7: 44, 8: 56, 9: 54,
  10: 44, 11: 42, 12: 45, 13: 44, 14: 38, 15: 38, 16: 34, 17: 38, 18: 44, 19: 48,
  20: 44, 21: 34, 22: 34, 23: 42, 24: 40, 25: 48, 26: 54
};

export const isAngleBetween = (target: number, a: number, b: number): boolean => {
  const t = normalizeDegree(target);
  const x = normalizeDegree(a);
  const y = normalizeDegree(b);
  if (x <= y) {
    return t >= x && t <= y;
  } else {
    return t >= x || t <= y;
  }
};

const findCrossingTime = (
  t1: Date,
  t2: Date,
  target: number,
  getLong: (d: Date) => number
): Date => {
  let low = t1.getTime();
  let high = t2.getTime();
  const tgt = normalizeDegree(target);
  for (let iter = 0; iter < 12; iter++) {
    const mid = (low + high) / 2;
    const l = normalizeDegree(getLong(new Date(mid)));
    const lowL = normalizeDegree(getLong(new Date(low)));
    if (isAngleBetween(tgt, lowL, l)) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return new Date((low + high) / 2);
};

export const findBoundaryCrossing = (
  birthUtc: Date,
  model: AyanamsaModel,
  getLong: (d: Date) => number,
  targetDivisor: number,
  searchForward: boolean
): Date => {
  const birthLong = getLong(birthUtc);
  const currIdx = Math.floor(birthLong / targetDivisor);
  const targetDeg = searchForward
    ? ((currIdx + 1) * targetDivisor) % 360
    : (currIdx * targetDivisor) % 360;
  
  const step = 1.0 * 60 * 60 * 1000; // 1 hour step
  let current = birthUtc;
  let prevLong = birthLong;
  for (let i = 0; i < 30; i++) {
    const nextTime = new Date(current.getTime() + (searchForward ? step : -step));
    const nextLong = getLong(nextTime);
    const startL = searchForward ? prevLong : nextLong;
    const endL = searchForward ? nextLong : prevLong;
    if (isAngleBetween(targetDeg, startL, endL)) {
      return searchForward
        ? findCrossingTime(current, nextTime, targetDeg, getLong)
        : findCrossingTime(nextTime, current, targetDeg, getLong);
    }
    prevLong = nextLong;
    current = nextTime;
  }
  return birthUtc;
};

export const getNakshatraEnd = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }): Date => {
  return findBoundaryCrossing(birthUtc, model, (d) => siderealLongitudes(d, model, "mean", calibrationOffset).moon, 360 / 27, true);
};

export const getNakshatraStart = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }): Date => {
  return findBoundaryCrossing(birthUtc, model, (d) => siderealLongitudes(d, model, "mean", calibrationOffset).moon, 360 / 27, false);
};

export const getTithiEnd = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean", calibrationOffset);
      return normalizeDegree(l.moon - (l.sunTithi ?? l.sun));
    },
    12,
    true
  );
};

export const getYogaEnd = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number, yogaSunOffset?: number }): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean", calibrationOffset);
      return normalizeDegree(l.moon + (l.sunYoga ?? l.sun));
    },
    360 / 27,
    true
  );
};

export const getKaranaEnd = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }): Date => {
  return findBoundaryCrossing(
    birthUtc,
    model,
    (d) => {
      const l = siderealLongitudes(d, model, "mean", calibrationOffset);
      return normalizeDegree(l.moon - (l.sunTithi ?? l.sun));
    },
    6,
    true
  );
};

export const getSunNakshatraEnd = (birthUtc: Date, model: AyanamsaModel, calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }): Date => {
  const getLong = (d: Date) => siderealLongitudes(d, model, "mean", calibrationOffset).sun;
  return findBoundaryCrossing(birthUtc, model, getLong, 360 / 27, true);
};

// Returns previous and next new moons relative to a date
export const getNewMoonsAround = (date: Date): { previous: Date; next: Date } => {
  const prev = Astronomy.SearchMoonPhase(0, date, -40);
  const next = Astronomy.SearchMoonPhase(0, date, 40);
  if (!prev || !next) {
    throw new Error("Unable to search moon phases around the given date");
  }
  return { previous: prev.date, next: next.date };
};

// Computes the Lunar month and Jovian year cycle index
export const getLunarMonthAndYear = (
  birthUtc: Date,
  model: AyanamsaModel
): { monthIndex: number; isAdhika: boolean; samvatsaraIndex: number; shakaYear: number } => {
  const { previous: prevNewMoon, next: nextNewMoon } = getNewMoonsAround(birthUtc);
  
  // Rashi of Sun at previous and next new moon
  const prevSunDeg = siderealLongitudes(prevNewMoon, model).sun;
  const nextSunDeg = siderealLongitudes(nextNewMoon, model).sun;
  
  const prevSunRashi = degreeToRashi(prevSunDeg).index;
  const nextSunRashi = degreeToRashi(nextSunDeg).index;
  
  const isAdhika = prevSunRashi === nextSunRashi;
  const monthIndex = (prevSunRashi + 1) % 12;
  
  const gYear = birthUtc.getFullYear();
  let shakaYear = gYear - 78;
  let samvatsaraIndex = (gYear - 1987 + 60) % 60;
  
  // If birth is before Chaitra Shukla Pratipada of the birth year:
  // Chaitra Shukla Pratipada is monthIndex === 0 (Chaitra) in Shukla Paksha.
  // The year changes at monthIndex = 0.
  // So if monthIndex is Phalguni (11), or if it is Chaitra (0) but still Krishna Paksha:
  // We check the Paksha of the birth time:
  const birthSun = siderealLongitudes(birthUtc, model).sun;
  const birthMoon = siderealLongitudes(birthUtc, model).moon;
  const tithiAngle = normalizeDegree(birthMoon - birthSun);
  const tithiIdx = Math.floor(tithiAngle / 12) % 30;
  const isKrishna = tithiIdx >= 15;
  
  const isBeforeNewYear = (monthIndex === 11) || (monthIndex === 0 && isKrishna);
  if (isBeforeNewYear) {
    shakaYear -= 1;
    samvatsaraIndex = (samvatsaraIndex - 1 + 60) % 60;
  }
  
  return { monthIndex, isAdhika, samvatsaraIndex, shakaYear };
};

export const getLocalizedSamvatsara = (lang: string, index: number): string => {
  const i = ((index % 60) + 60) % 60;
  if (lang.startsWith("kn")) return KN_SAMVATSARAS[i]!;
  return EN_SAMVATSARAS[i]!;
};

export const getLocalizedMasa = (lang: string, index: number, isAdhika: boolean): string => {
  const i = ((index % 12) + 12) % 12;
  const prefix = isAdhika ? (lang.startsWith("kn") ? "ಅಧಿಕ " : "Adhika ") : "";
  const name = lang.startsWith("kn") ? KN_MASAS[i]! : EN_MASAS[i]!;
  return prefix + name;
};

export const getVishaAndAmrithaGhati = (
  birthUtc: Date,
  model: AyanamsaModel,
  sunriseUtc: Date,
  calibrationOffset?: { moonOffset: number, sunNakOffset: number, tithiSunOffset: number }
): {
  vishaGhati: { ghati: number; vighati: number };
  amrithaGhati: { ghati: number; vighati: number };
} => {
  let searchTime = new Date(sunriseUtc.getTime());
  
  let vishaStart: Date | null = null;
  let amrithaStart: Date | null = null;
  
  for (let i = 0; i < 3; i++) {
    // Find Nakshatra ending at or after searchTime
    const end = getNakshatraEnd(searchTime, model, calibrationOffset);
    // Find start of this Nakshatra
    const start = getNakshatraStart(searchTime, model, calibrationOffset);
    
    const dur = end.getTime() - start.getTime();
    
    // Identify Nakshatra index for the ending Nakshatra
    const endDeg = siderealLongitudes(end, model, "mean", calibrationOffset).moon;
    const nakIdx = Math.floor((endDeg - 0.0001) / (360 / 27)) % 27;
    
    const vOffset = VISHA_GHATI_START[nakIdx] ?? 20;
    const aOffset = AMRITHA_GHATI_START[nakIdx] ?? 38;
    
    const vTime = new Date(start.getTime() + (vOffset / 60) * dur);
    const aTime = new Date(start.getTime() + (aOffset / 60) * dur);
    
    if (!vishaStart && vTime.getTime() >= sunriseUtc.getTime()) {
      vishaStart = vTime;
    }
    if (!amrithaStart && aTime.getTime() >= sunriseUtc.getTime()) {
      amrithaStart = aTime;
    }
    
    if (vishaStart && amrithaStart) break;
    
    // Move to next Nakshatra
    searchTime = new Date(end.getTime() + 2 * 60 * 60 * 1000);
  }
  
  const toGhatiVighati = (t: Date) => {
    const ms = Math.max(0, t.getTime() - sunriseUtc.getTime());
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.floor(totalVighati / 60),
      vighati: totalVighati % 60
    };
  };
  
  return {
    vishaGhati: vishaStart ? toGhatiVighati(vishaStart) : { ghati: 0, vighati: 0 },
    amrithaGhati: amrithaStart ? toGhatiVighati(amrithaStart) : { ghati: 0, vighati: 0 }
  };
};

// Diva Ghati (day length in Ghati/Vighati)
export const getDivaGhati = (
  sunriseUtc: Date,
  sunsetUtc: Date
): { ghati: number; vighati: number } => {
  const ms = Math.max(0, sunsetUtc.getTime() - sunriseUtc.getTime());
  const totalVighati = Math.floor(ms / 24_000);
  return {
    ghati: Math.floor(totalVighati / 60) % 60,
    vighati: totalVighati % 60
  };
};

// Sankranti Gata Dina (Calendar days difference since the day of the last Sankranti in the local timezone)
import { inferBirthTimezoneIana } from "./birthTime";
import { calendarYmdInTimeZone } from "./placeTime";

export const getSankrantiGataDina = (
  birthUtc: Date,
  model: AyanamsaModel,
  latitude: number,
  longitude: number
): number => {
  const getSunLong = (d: Date) => normalizeDegree(siderealLongitudes(d, model).sun);
  const sunLong = getSunLong(birthUtc);
  const currIdx = Math.floor(sunLong / 30);
  const targetDeg = currIdx * 30;
  
  // Search backward in 12-hour steps up to 35 days (70 steps)
  const step = 12 * 60 * 60 * 1000;
  let current = birthUtc;
  let prevLong = getSunLong(current);
  let sankrantiTime = birthUtc;
  
  for (let i = 0; i < 70; i++) {
    const nextTime = new Date(current.getTime() - step);
    const nextLong = getSunLong(nextTime);
    
    let crossed = false;
    if (prevLong >= nextLong) {
      crossed = targetDeg >= nextLong && targetDeg <= prevLong;
    } else {
      crossed = targetDeg >= nextLong || targetDeg <= prevLong;
    }
    
    if (crossed) {
      let low = nextTime.getTime();
      let high = current.getTime();
      for (let iter = 0; iter < 15; iter++) {
        const mid = (low + high) / 2;
        const midLong = getSunLong(new Date(mid));
        if (midLong >= targetDeg) {
          high = mid;
        } else {
          low = mid;
        }
      }
      sankrantiTime = new Date((low + high) / 2);
      break;
    }
    prevLong = nextLong;
    current = nextTime;
  }
  
  const tz = inferBirthTimezoneIana(latitude, longitude);
  const sankrantiYmd = calendarYmdInTimeZone(sankrantiTime, tz);
  const birthYmd = calendarYmdInTimeZone(birthUtc, tz);
  
  const sDate = new Date(sankrantiYmd);
  const bDate = new Date(birthYmd);
  const diffDays = Math.round((bDate.getTime() - sDate.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays; // 0-based calendar days passed. In traditional panchang, Sankranti day is day 0, next is day 1, etc.
};
