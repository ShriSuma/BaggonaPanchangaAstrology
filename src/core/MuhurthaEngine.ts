import SunCalc from "suncalc";
import { normalizeDegree } from "./AstroMath";
import { siderealLongitudes } from "./EphemerisEngine";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import type { AyanamsaModel } from "./AstroTypes";

export interface MuhurthaEntry {
  date: string; // YYYY-MM-DD
  weekdayIdx: number;
  weekdayName: string;
  weekdayNameKn: string;
  tithiIdx: number;
  tithiName: string;
  tithiNameKn: string;
  nakshatraIdx: number;
  nakshatraName: string;
  nakshatraNameKn: string;
  yogaIdx: number;
  yogaName: string;
  yogaNameKn: string;
  karanaIdx: number;
  karanaName: string;
  karanaNameKn: string;
  types: ("marriage" | "housewarming" | "upanayana" | "general")[];
  purityScore: number;
  remedy?: string;
  remedyKn?: string;
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

const WEEKDAYS_EN = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const WEEKDAYS_KN = [
  "ಭಾನುವಾರ", "ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"
];

/**
 * Calculates Shuddha Muhurthas day-by-day for the specified year.
 * Exposes a simulated 3rd party lookup API design.
 */
export async function fetchShuddhaMuhurthas(
  year: number,
  latitude: number,
  longitude: number,
  ayanamsaModel: AyanamsaModel = "lahiri"
): Promise<MuhurthaEntry[]> {
  const list: MuhurthaEntry[] = [];
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const daysInYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;

  for (let dIdx = 0; dIdx < daysInYear; dIdx++) {
    const currentUtc = new Date(startDate.getTime() + dIdx * 24 * 60 * 60 * 1000);
    const yyyy = currentUtc.getUTCFullYear();
    const mm = String(currentUtc.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(currentUtc.getUTCDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Compute sunrise time
    const noonUtc = new Date(Date.UTC(yyyy, currentUtc.getUTCMonth(), currentUtc.getUTCDate(), 6, 30, 0));
    const scTimes = SunCalc.getTimes(noonUtc, latitude, longitude);
    const jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, latitude, longitude);
    const sunriseUtc = jyotish.sunrise;

    // Calculate longitudes at Sunrise
    const today530 = new Date(Date.UTC(yyyy, currentUtc.getUTCMonth(), currentUtc.getUTCDate(), 0, 0, 0));
    const next530 = new Date(today530.getTime() + 24 * 60 * 60 * 1000);

    const longToday = siderealLongitudes(today530, ayanamsaModel);
    const longNext = siderealLongitudes(next530, ayanamsaModel);

    let moonNext = longNext.moon;
    if (moonNext < longToday.moon) moonNext += 360;
    const dailyMoonMotion = moonNext - longToday.moon;

    let sunNext = longNext.sun;
    if (sunNext < longToday.sun) sunNext += 360;
    const dailySunMotion = sunNext - longToday.sun;

    const sunriseUtcHours = sunriseUtc.getUTCHours() + sunriseUtc.getUTCMinutes() / 60 + sunriseUtc.getUTCSeconds() / 3600;
    const sunriseLocalHours = sunriseUtcHours + 5.5;

    const moonSunrise = longToday.moon + dailyMoonMotion * (sunriseLocalHours - 5.5) / 24;
    const sunSunrise = longToday.sun + dailySunMotion * (sunriseLocalHours - 5.5) / 24;

    const elongationSunrise = normalizeDegree(moonSunrise - sunSunrise);
    const sumSunrise = normalizeDegree(moonSunrise + sunSunrise);

    const tithiIdx = Math.floor(elongationSunrise / 12) % 30;
    const moonNakIdx = Math.floor(moonSunrise / (360 / 27)) % 27;
    const yogaIdx = Math.floor(sumSunrise / (360 / 27)) % 27;
    const halfTithiIdxSunrise = Math.floor(elongationSunrise / 6) % 60;

    let karanaIdx = 0;
    if (halfTithiIdxSunrise === 0) {
      karanaIdx = 10;
    } else if (halfTithiIdxSunrise >= 1 && halfTithiIdxSunrise <= 56) {
      karanaIdx = (halfTithiIdxSunrise - 1) % 7;
    } else if (halfTithiIdxSunrise === 57) {
      karanaIdx = 7;
    } else if (halfTithiIdxSunrise === 58) {
      karanaIdx = 8;
    } else {
      karanaIdx = 9;
    }

    const weekdayIdx = vedicWeekdayAtBirth(currentUtc, sunriseUtc, latitude, longitude);

    // --- PURITY CHECKS ---
    let purityScore = 100;
    const disqualifications: string[] = [];

    // 0. Combustion (Moudhya) Check for Jupiter & Venus
    const jupiterDist = Math.abs(normalizeDegree(longToday.sun - longToday.jupiter));
    const isJupiterCombust = Math.min(jupiterDist, 360 - jupiterDist) <= 11;
    
    const venusDist = Math.abs(normalizeDegree(longToday.sun - longToday.venus));
    const isVenusCombust = Math.min(venusDist, 360 - venusDist) <= 10;

    if (isJupiterCombust || isVenusCombust) {
      purityScore -= 50; // Critical violation
      disqualifications.push("Combustion (Moudhya)");
    }

    // 0.5. Solar Month Exclusions (Kharmas / Dhanurmasa / Meenamasa)
    const sunSignIdx = Math.floor(longToday.sun / 30);
    const isKharmas = sunSignIdx === 8 || sunSignIdx === 11; // 8 = Sagittarius, 11 = Pisces
    if (isKharmas) {
      purityScore -= 40; // Critical violation
      disqualifications.push("Kharmas (Dhanu/Meena Masa)");
    }

    // 1. Avoid Rikta tithis (4th, 9th, 14th of both pakshas: indices 3, 8, 13, 18, 23, 28) and Amavasya (index 29).
    const isTithiPure = ![3, 8, 13, 18, 23, 28, 29].includes(tithiIdx);

    // 2. Auspicious Nakshatras list
    // Rohini(3), Mrigashira(4), Pushya(7), Uttara Phalguni(11), Hasta(12), Chitra(13), Anuradha(16), Uttara Ashadha(20), Shravana(21), Dhanishta(22), Shatabhisha(23), Uttara Bhadrapada(25), Revati(26)
    const auspiciousNaks = [3, 4, 7, 11, 12, 13, 16, 20, 21, 22, 23, 25, 26];
    const isNakPure = auspiciousNaks.includes(moonNakIdx);

    // 3. Avoid Tuesday (2) and Saturday (6).
    const isWeekdayPure = ![2, 6].includes(weekdayIdx);

    // 4. Avoid negative Yogas: Vishkumbha(0), Atiganda(5), Shoola(8), Ganda(9), Vyaghata(12), Vajra(14), Vyatipata(16), Vaidhriti(26)
    const isYogaPure = ![0, 5, 8, 9, 12, 14, 16, 26].includes(yogaIdx);

    // 5. Avoid Vishti/Bhadra Karana (6) and fixed malefic Karanas (7, 8, 9)
    const isKaranaPure = ![6, 7, 8, 9].includes(karanaIdx);

    if (!isTithiPure) { purityScore -= 20; disqualifications.push("Inauspicious Tithi"); }
    if (!isNakPure) { purityScore -= 20; disqualifications.push("Inauspicious Nakshatra"); }
    if (!isWeekdayPure) { purityScore -= 15; disqualifications.push("Inauspicious Weekday"); }
    if (!isYogaPure) { purityScore -= 10; disqualifications.push("Inauspicious Yoga"); }
    if (!isKaranaPure) { purityScore -= 10; disqualifications.push("Inauspicious Karana"); }

    if (weekdayIdx === 0) purityScore -= 5; // Sunday
    if (tithiIdx === 7 || tithiIdx === 22) purityScore -= 10; // Ashtami
    if (tithiIdx === 14) purityScore -= 5; // Purnima

    const isEverythingPure = purityScore >= 95;

    if (isEverythingPure) {
      const types: ("marriage" | "housewarming" | "upanayana" | "general")[] = [];

      // Marriage (Vivaha) Specific Rules
      const marriageNaks = [3, 4, 11, 12, 16, 20, 25, 26];
      const shubhaTithis = [1, 2, 4, 6, 9, 10, 12, 16, 17, 19, 21, 24, 25, 27];
      if (marriageNaks.includes(moonNakIdx) && shubhaTithis.includes(tithiIdx) && [1, 3, 4, 5].includes(weekdayIdx)) {
        types.push("marriage");
      }

      // Housewarming (Griha Pravesha) Specific Rules
      const gpNaks = [3, 4, 11, 12, 13, 16, 20, 21, 22, 23, 25, 26];
      if (gpNaks.includes(moonNakIdx) && shubhaTithis.includes(tithiIdx) && [1, 3, 4, 5].includes(weekdayIdx)) {
        types.push("housewarming");
      }

      // Upanayana Specific Rules
      const upaNaks = [3, 4, 7, 12, 13, 16, 21, 22, 23, 26];
      if (upaNaks.includes(moonNakIdx) && [0, 3, 4, 5].includes(weekdayIdx)) {
        types.push("upanayana");
      }

      // General fallback
      if (types.length === 0) {
        types.push("general");
      }

      list.push({
        date: dateStr,
        weekdayIdx,
        weekdayName: WEEKDAYS_EN[weekdayIdx]!,
        weekdayNameKn: WEEKDAYS_KN[weekdayIdx]!,
        tithiIdx,
        tithiName: TITHIS_EN[tithiIdx]!,
        tithiNameKn: TITHIS_KN[tithiIdx]!,
        nakshatraIdx: moonNakIdx,
        nakshatraName: NAKSHATRAS_EN[moonNakIdx]!,
        nakshatraNameKn: NAKSHATRAS_KN[moonNakIdx]!,
        yogaIdx,
        yogaName: YOGAS_EN[yogaIdx]!,
        yogaNameKn: YOGAS_KN[yogaIdx]!,
        karanaIdx,
        karanaName: KARANAS_EN[karanaIdx]!,
        karanaNameKn: KARANAS_KN[karanaIdx]!,
        types,
        purityScore
      });
    }
  }

  return list;
}
