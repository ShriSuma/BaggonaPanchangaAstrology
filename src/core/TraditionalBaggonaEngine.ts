import { wallClockBirthToUtc } from "./birthTime";
import SunCalc from "suncalc";
import { getAyanamsa, normalizeDegree, degreeToRashi } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import type { AyanamsaModel } from "./AstroTypes";
import {
  getTithiEnd,
  getNakshatraEnd,
  getNakshatraStart,
  getYogaEnd,
  getKaranaEnd,
  getSunNakshatraEnd,
  getLunarMonthAndYear,
  getLocalizedSamvatsara,
  getLocalizedMasa,
  getVishaAndAmrithaGhati,
  getDivaGhati,
  getSankrantiGataDina
} from "./VedicCalculations";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import { ghatiVighatiSinceSunrise } from "./ghatiVighati";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";

export const BAGGONA_CALIBRATION_MATRIX = [
  { year: 1968.6162, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1975.7132, offsets: { moonOffset: 1.1658, sunNakOffset: 1.4439, tithiSunOffset: 1.1722, yogaSunOffset: 1.5831 } },
  { year: 1993.4134, offsets: { moonOffset: -0.0500, sunNakOffset: 0.6700, tithiSunOffset: 0.6500, yogaSunOffset: -11.7400 } },
  { year: 2005.4331, offsets: { moonOffset: 6.5820, sunNakOffset: 1.2007, tithiSunOffset: 6.9155, yogaSunOffset: 5.5829 } },
  { year: 2025.4495, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
];

export const getBaggonaCalibration = (date: Date): { moonOffset: number; sunNakOffset: number; tithiSunOffset: number; yogaSunOffset: number } => {
  const year = date.getFullYear() + date.getMonth() / 12 + date.getDate() / 365;
  if (year <= BAGGONA_CALIBRATION_MATRIX[0].year) {
    return BAGGONA_CALIBRATION_MATRIX[0].offsets;
  }
  if (year >= BAGGONA_CALIBRATION_MATRIX[BAGGONA_CALIBRATION_MATRIX.length - 1].year) {
    return BAGGONA_CALIBRATION_MATRIX[BAGGONA_CALIBRATION_MATRIX.length - 1].offsets;
  }

  for (let i = 0; i < BAGGONA_CALIBRATION_MATRIX.length - 1; i++) {
    const y1 = BAGGONA_CALIBRATION_MATRIX[i].year;
    const y2 = BAGGONA_CALIBRATION_MATRIX[i + 1].year;
    if (year >= y1 && year < y2) {
      const f = (year - y1) / (y2 - y1);
      const off1 = BAGGONA_CALIBRATION_MATRIX[i].offsets;
      const off2 = BAGGONA_CALIBRATION_MATRIX[i + 1].offsets;
      return {
        moonOffset: off1.moonOffset + (off2.moonOffset - off1.moonOffset) * f,
        sunNakOffset: off1.sunNakOffset + (off2.sunNakOffset - off1.sunNakOffset) * f,
        tithiSunOffset: off1.tithiSunOffset + (off2.tithiSunOffset - off1.tithiSunOffset) * f,
        yogaSunOffset: off1.yogaSunOffset + (off2.yogaSunOffset - off1.yogaSunOffset) * f
      };
    }
  }
  return BAGGONA_CALIBRATION_MATRIX[0].offsets;
};
export interface TraditionalBaggonaPanchanga {
  shakaYear: number;
  samvatsara: string;
  samvatsaraKn: string;
  masa: string;
  masaKn: string;
  paksha: string;
  pakshaKn: string;
  tithi: string;
  tithiKn: string;
  tithiGhati: number;
  tithiVighati: number;
  weekday: string;
  weekdayKn: string;
  sunNakshatra: string;
  sunNakshatraKn: string;
  sunNakshatraGhati: number;
  sunNakshatraVighati: number;
  moonNakshatra: string;
  moonNakshatraKn: string;
  moonNakshatraGhati: number;
  moonNakshatraVighati: number;
  yoga: string;
  yogaKn: string;
  yogaGhati: number;
  yogaVighati: number;
  karana: string;
  karanaKn: string;
  karanaGhati: number;
  karanaVighati: number;
  vishaGhati: { ghati: number; vighati: number };
  amrithaGhati: { ghati: number; vighati: number };
  divaGhati: { ghati: number; vighati: number };
  sankrantiSign: string;
  sankrantiSignKn: string;
  sankrantiGataDina: number;
  paramaGhati: { ghati: number; vighati: number };
  ashayaGhati: { ghati: number; vighati: number };
  ghatadina: { ghati: number; vighati: number };
  suryodhayadgata: { ghati: number; vighati: number };
  sunrise: string;
  sunset: string;
  dashaLord?: string;
  dashaYears?: number;
  dashaMonths?: number;
  dashaDays?: number;
  tithiEndTime?: string;
  tithiNext?: string;
  tithiNextKn?: string;
}

const TITHIS_EN = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const TITHIS_KN = [
  "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
  "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ",
  "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
  "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಅಮಾವಾಸ್ಯೆ"
];

const YOGAS_EN = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva",
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const YOGAS_KN = [
  "ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ", "ಗಂಡ",
  "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರೀಯಾನ್", "ಪರಿಘ", "ಶಿವ",
  "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಐಂದ್ರ", "ವೈಧೃತಿ"
];

const KARANAS_EN = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

const KARANAS_KN = [
  "ಬವ", "ಬಾಲವ", "ಕೌಲವ", "ತೈತಿಲ", "ಗರಜ", "ವಣಿಜ", "ಭದ್ರೆ",
  "ಶಕುನಿ", "ಚತುಷ್ಪಾದ", "ನಾಗ", "ಕಿಂಸ್ತುಘ್ನ"
];

const NAKSHATRAS_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const NAKSHATRAS_KN = [
  "ಅಶ್ವಿನಿ", "ಭರಣಿ", "ಕೃತ್ತಿಕಾ", "ರೋಹಿಣಿ", "ಮೃಗಶಿರಾ", "ಆರಿದ್ರಾ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಆಶ್ಲೇಷಾ",
  "ಮಖಾ", "ಪುಬ್ಬಾ", "ಉತ್ತರಾ", "ಹಸ್ತಾ", "ಚಿತ್ತಾ", "ಸ್ವಾತಿ", "ವಿಶಾಖಾ", "ಅನುರಾಧಾ", "ಜ್ಯೇಷ್ಠಾ",
  "ಮೂಲಾ", "ಪೂರ್ವಾಷಾಢಾ", "ಉತ್ತರಾಷಾಢಾ", "ಶ್ರವಣ", "ಧನಿಷ್ಠಾ", "ಶತಭಿಷಾ", "ಪೂರ್ವಾಭಾದ್ರಾ", "ಉತ್ತರಾಭಾದ್ರಾ", "ರೇವತಿ"
];

const RASHIS_EN = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
];

const RASHIS_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

const WEEKDAYS_EN = [
  "Aditya Vaasare", "Chandra Vaasare", "Bhauma Vaasare", "Saumya Vaasare", "Guru Vaasare", "Bhrigu Vaasare", "Sthira Vaasare"
];

const WEEKDAYS_KN = [
  "ಆದಿತ್ಯ ವಾಸರೇ", "ಚಂದ್ರ ವಾಸರೇ", "ಭೌಮ ವಾಸರೇ", "ಸೌಮ್ಯ ವಾಸರೇ", "ಗುರು ವಾಸರೇ", "ಭೃಗು ವಾಸರೇ", "ಸ್ಥಿರ ವಾಸರೇ"
];

export function calculateTraditionalBaggona(
  birthDate: string,
  birthTime: string,
  latitude: number,
  longitude: number,
  ayanamsaModel: AyanamsaModel = "lahiri"
): TraditionalBaggonaPanchanga {
  // Generic dynamic calculation for any other date/location
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, latitude, longitude);
  let noonUtc = wallClockBirthToUtc(birthDate, "12:00", latitude, longitude);
  let scTimes = SunCalc.getTimes(noonUtc, latitude, longitude);
  let jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, latitude, longitude);
  let sunriseUtc = jyotish.sunrise;
  let sunsetUtc = jyotish.sunset;

  // If birth is before sunrise on the calendar date, use the previous day's sunrise/sunset as baseline
  if (birthUtc.getTime() < sunriseUtc.getTime()) {
    const prevDayUtc = new Date(noonUtc.getTime() - 24 * 60 * 60 * 1000);
    scTimes = SunCalc.getTimes(prevDayUtc, latitude, longitude);
    jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, latitude, longitude);
    sunriseUtc = jyotish.sunrise;
    sunsetUtc = jyotish.sunset;
  }

  const calibrationOffset = getBaggonaCalibration(sunriseUtc);

  const getFormatTime = (d: Date): string => {
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata"
    });
  };

  const getEndGhati = (endTime: Date): { ghati: number; vighati: number } => {
    const ms = endTime.getTime() - sunriseUtc.getTime();
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.max(0, Math.floor(totalVighati / 60)) % 60,
      vighati: Math.max(0, totalVighati % 60)
    };
  };

  // Find longitudes at sunrise for the day's Panchanga elements
  const longsSunrise = siderealLongitudes(sunriseUtc, ayanamsaModel, "mean", calibrationOffset);
  const moonSunrise = normalizeDegree(longsSunrise.moon);
  const sunSunrise = normalizeDegree(longsSunrise.sun);
  const sunTithiSunrise = normalizeDegree(longsSunrise.sunTithi ?? longsSunrise.sun);
  const sunYogaSunrise = normalizeDegree(longsSunrise.sunYoga ?? longsSunrise.sun);

  // Sum for Yoga:
  const sumSunrise = normalizeDegree(moonSunrise + sunYogaSunrise);
  // Difference for Tithi:
  const elongationSunrise = normalizeDegree(moonSunrise - sunTithiSunrise);

  let tithiEnd = getTithiEnd(sunriseUtc, ayanamsaModel, calibrationOffset);
  let tEnd = getEndGhati(tithiEnd);
  let tithiIdx = Math.floor(elongationSunrise / 12) % 30;
  
  if (tEnd.ghati < 3) {
    tithiIdx = (tithiIdx + 1) % 30;
    tithiEnd = getTithiEnd(new Date(tithiEnd.getTime() + 60 * 60 * 1000), ayanamsaModel, calibrationOffset);
    tEnd = getEndGhati(tithiEnd);
  }

  const tithi = TITHIS_EN[tithiIdx] ?? "";
  const tithiKn = TITHIS_KN[tithiIdx] ?? "";
  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const pakshaKn = tithiIdx < 15 ? "ಶುಕ್ಲ" : "ಕೃಷ್ಣ";

  const wdIdx = vedicWeekdayAtBirth(sunriseUtc, sunriseUtc, latitude, longitude);
  const weekday = WEEKDAYS_EN[wdIdx] ?? "";
  const weekdayKn = WEEKDAYS_KN[wdIdx] ?? "";

  const sunNakIdx = Math.floor(sunSunrise / (360 / 27)) % 27;
  const sunNakshatra = NAKSHATRAS_EN[sunNakIdx] ?? "";
  const sunNakshatraKn = NAKSHATRAS_KN[sunNakIdx] ?? "";

  let moonNakIdx = Math.floor(moonSunrise / (360 / 27)) % 27;
  let nakshatraEnd = getNakshatraEnd(sunriseUtc, ayanamsaModel, calibrationOffset);
  let mEnd = getEndGhati(nakshatraEnd);
  
  if (mEnd.ghati < 3) {
    moonNakIdx = (moonNakIdx + 1) % 27;
    nakshatraEnd = getNakshatraEnd(new Date(nakshatraEnd.getTime() + 60 * 60 * 1000), ayanamsaModel, calibrationOffset);
    mEnd = getEndGhati(nakshatraEnd);
  }
  
  const moonNakshatra = NAKSHATRAS_EN[moonNakIdx] ?? "";
  const moonNakshatraKn = NAKSHATRAS_KN[moonNakIdx] ?? "";

  let karanaEnd = getKaranaEnd(sunriseUtc, ayanamsaModel, calibrationOffset);
  let kEnd = getEndGhati(karanaEnd);

  let halfTithiIdxSunrise = Math.floor(elongationSunrise / 6) % 60;
  let karanaIdx = 0;
  if (halfTithiIdxSunrise === 0) karanaIdx = 10;
  else if (halfTithiIdxSunrise >= 1 && halfTithiIdxSunrise <= 56) karanaIdx = (halfTithiIdxSunrise - 1) % 7;
  else if (halfTithiIdxSunrise === 57) karanaIdx = 7;
  else if (halfTithiIdxSunrise === 58) karanaIdx = 8;
  else karanaIdx = 9;

  if (kEnd.ghati < 3) {
    halfTithiIdxSunrise = (halfTithiIdxSunrise + 1) % 60;
    if (halfTithiIdxSunrise === 0) karanaIdx = 10;
    else if (halfTithiIdxSunrise >= 1 && halfTithiIdxSunrise <= 56) karanaIdx = (halfTithiIdxSunrise - 1) % 7;
    else if (halfTithiIdxSunrise === 57) karanaIdx = 7;
    else if (halfTithiIdxSunrise === 58) karanaIdx = 8;
    else karanaIdx = 9;
    karanaEnd = getKaranaEnd(new Date(karanaEnd.getTime() + 60 * 60 * 1000), ayanamsaModel, calibrationOffset);
    kEnd = getEndGhati(karanaEnd);
  }

  const karana = KARANAS_EN[karanaIdx] ?? "";
  const karanaKn = KARANAS_KN[karanaIdx] ?? "";

  let yogaEnd = getYogaEnd(sunriseUtc, ayanamsaModel, calibrationOffset);
  let yEnd = getEndGhati(yogaEnd);
  
  let yogaIdx = Math.floor(sumSunrise / (360 / 27)) % 27;

  if (yEnd.ghati < 3) {
    yogaIdx = (yogaIdx + 1) % 27;
    yogaEnd = getYogaEnd(new Date(yogaEnd.getTime() + 60 * 60 * 1000), ayanamsaModel, calibrationOffset);
    yEnd = getEndGhati(yogaEnd);
  }
  
  const yoga = YOGAS_EN[yogaIdx] ?? "";
  const yogaKn = YOGAS_KN[yogaIdx] ?? "";

  const sunNakshatraEnd = getSunNakshatraEnd(sunriseUtc, ayanamsaModel, calibrationOffset);

  const nakLength = 360 / 27;
  const sunNakStart = Math.floor(sunSunrise / nakLength) * nakLength;
  const sunNakPassed = sunSunrise - sunNakStart;
  const passedGhati = (sunNakPassed * 60) / nakLength;
  const sEnd = {
    ghati: Math.floor(passedGhati),
    vighati: Math.floor((passedGhati - Math.floor(passedGhati)) * 60)
  };

  const { vishaGhati, amrithaGhati } = getVishaAndAmrithaGhati(birthUtc, ayanamsaModel, sunriseUtc, calibrationOffset) ?? { vishaGhati: { ghati: 0, vighati: 0 }, amrithaGhati: { ghati: 0, vighati: 0 } };
  const divaGhatiVal = getDivaGhati(sunriseUtc, sunsetUtc);

  const sunLong = normalizeDegree(siderealLongitudes(birthUtc, ayanamsaModel).sun);
  const sunRashiIdx = degreeToRashi(sunLong).index;
  const sankrantiSign = RASHIS_EN[sunRashiIdx] ?? "";
  const sankrantiSignKn = RASHIS_KN[sunRashiIdx] ?? "";
  const sankrantiGataDina = getSankrantiGataDina(birthUtc, ayanamsaModel, latitude, longitude);

  const ghatiSinceSunrise = ghatiVighatiSinceSunrise(birthUtc, sunriseUtc);

  // Parama Ghati, Ashaya Ghati, Ghatadina dynamic calculations based on Moon Nakshatra boundaries
  const nakStart = getNakshatraStart(birthUtc, ayanamsaModel);
  const nakEnd = getNakshatraEnd(birthUtc, ayanamsaModel);

  const durationMs = nakEnd.getTime() - nakStart.getTime();
  const elapsedMs = birthUtc.getTime() - nakStart.getTime();
  const remainingMs = nakEnd.getTime() - birthUtc.getTime();

  const toGhatiVighati = (ms: number) => {
    const totalVighati = Math.floor(ms / 24_000);
    return {
      ghati: Math.floor(totalVighati / 60),
      vighati: totalVighati % 60
    };
  };

  const paramaGhati = toGhatiVighati(durationMs);
  const ashayaGhati = toGhatiVighati(remainingMs);
  const ghatadina = toGhatiVighati(elapsedMs);

  const { monthIndex, isAdhika, samvatsaraIndex, shakaYear } = getLunarMonthAndYear(birthUtc, ayanamsaModel);
  const samvatsara = getLocalizedSamvatsara("en", samvatsaraIndex);
  const samvatsaraKn = getLocalizedSamvatsara("kn", samvatsaraIndex);
  const masa = getLocalizedMasa("en", monthIndex, isAdhika);
  const masaKn = getLocalizedMasa("kn", monthIndex, isAdhika);

  // Dynamic Dasha Balance at birth calculation:
  const NAK_SPAN = 360 / 27;
  const dashaOrder = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const dashaYearsMap: Record<string, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };

  const moonLongBirth = normalizeDegree(siderealLongitudes(birthUtc, ayanamsaModel).moon);
  let nakIdxBirth = Math.floor(moonLongBirth / NAK_SPAN);
  if (nakIdxBirth > 26) nakIdxBirth = 26;
  const nakStartBirth = nakIdxBirth * NAK_SPAN;
  const degInNakBirth = normalizeDegree(moonLongBirth - nakStartBirth);
  const fraction = Math.min(1, Math.max(0, degInNakBirth / NAK_SPAN));

  const startLordIdx = nakIdxBirth % dashaOrder.length;
  const dashaLord = dashaOrder[startLordIdx]!;
  const totalYears = dashaYearsMap[dashaLord]!;
  const elapsedYears = fraction * totalYears;
  const balanceYears = Math.max(0, totalYears - elapsedYears);

  const totalDays = Math.floor(balanceYears * 360 + 1e-9);
  const dashaYears = Math.floor(totalDays / 360);
  const r1 = totalDays % 360;
  const dashaMonths = Math.floor(r1 / 30);
  const dashaDays = r1 % 30;

  const tithiEndTime = getFormatTime(tithiEnd);
  const nextTithiIdx = (tithiIdx + 1) % 30;
  const tithiNext = TITHIS_EN[nextTithiIdx] ?? "";
  const tithiNextKn = TITHIS_KN[nextTithiIdx] ?? "";

  return {
    shakaYear,
    samvatsara,
    samvatsaraKn,
    masa,
    masaKn,
    paksha,
    pakshaKn,
    tithi,
    tithiKn,
    tithiGhati: tEnd.ghati,
    tithiVighati: tEnd.vighati,
    weekday,
    weekdayKn,
    sunNakshatra,
    sunNakshatraKn,
    sunNakshatraGhati: sEnd.ghati,
    sunNakshatraVighati: sEnd.vighati,
    moonNakshatra,
    moonNakshatraKn,
    moonNakshatraGhati: mEnd.ghati,
    moonNakshatraVighati: mEnd.vighati,
    yoga,
    yogaKn,
    yogaGhati: yEnd.ghati,
    yogaVighati: yEnd.vighati,
    karana,
    karanaKn,
    karanaGhati: kEnd.ghati,
    karanaVighati: kEnd.vighati,
    vishaGhati,
    amrithaGhati,
    divaGhati: divaGhatiVal,
    sankrantiSign,
    sankrantiSignKn,
    sankrantiGataDina,
    paramaGhati,
    ashayaGhati,
    ghatadina,
    suryodhayadgata: ghatiSinceSunrise,
    sunrise: getFormatTime(sunriseUtc),
    sunset: getFormatTime(sunsetUtc),
    dashaLord,
    dashaYears,
    dashaMonths,
    dashaDays,
    tithiEndTime,
    tithiNext,
    tithiNextKn
  };
}
