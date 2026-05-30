import SunCalc from "suncalc";
import { normalizeDegree, dateToJulianUt, calculateLocalSiderealTime } from "./AstroMath";
import { siderealLongitudes, meanObliquityDegrees, ascendantTropicalDegrees } from "./EphemerisEngine";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import type { AyanamsaModel } from "./AstroTypes";
import { BaggonaAuthenticData, type AuthenticBaggonaMuhurtha } from "../data/BaggonaMuhurthas2026";

export interface LagnaEntry {
  startTime: string; // HH:mm format
  endTime: string;
  rashiIdx: number;
  rashiName: string;
  rashiNameKn: string;
  purityScore: number;
  explanation: string;
  explanationKn: string;
}

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
  types: ("marriage" | "housewarming" | "upanayana" | "general" | "choula" | "devapratishtha")[];
  purityScore: number; // Max of the lagnas or day purity
  lagnas: LagnaEntry[];
  isAuthenticMatch?: boolean; // Flag to indicate if this comes directly from the Baggona Panchanga text
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

const RASHIS_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];
const RASHIS_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];

/**
 * Calculates Shuddha Muhurthas day-by-day and exact Lagnas based on Baggona Panchanga rules.
 */
export async function fetchShuddhaMuhurthas(
  year: number,
  latitude: number,
  longitude: number,
  ayanamsaModel: AyanamsaModel = "lahiri"
): Promise<MuhurthaEntry[]> {
  const list: MuhurthaEntry[] = [];

  const authenticMatches = (year === 2026 || year === 2027) ? processAuthenticBaggonaData(year) : [];

  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const daysInYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365;

  // Strict Baggona Panchanga Constants
  const TYAJYA_NAKSHATRAS = [1, 2, 10, 15, 17, 19]; // Bharani, Krittika, Pubba, Vishakha, Jyeshtha, Purvashadha
  const TYAJYA_WEEKDAYS = [2]; // Tuesday is strictly forbidden
  const INAUSPICIOUS_YOGAS = [0, 5, 8, 9, 12, 14, 16, 18, 26]; // Vishkambha, Atiganda, Shoola, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti

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

    const moonSunrise = normalizeDegree(longToday.moon + dailyMoonMotion * (sunriseLocalHours - 5.5) / 24);
    const sunSunrise = normalizeDegree(longToday.sun + dailySunMotion * (sunriseLocalHours - 5.5) / 24);

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

    // --- PHASE 1: BAGGONA PANCHANGA DAY FILTER (DINA SHUDDHI) ---
    // Rule 1: Moudhya Shuddhi (Combustion Check for Jupiter & Venus)
    const jupiterDist = Math.abs(normalizeDegree(longToday.sun - longToday.jupiter));
    const isJupiterCombust = Math.min(jupiterDist, 360 - jupiterDist) <= 11;
    const venusDist = Math.abs(normalizeDegree(longToday.sun - longToday.venus));
    const isVenusCombust = Math.min(venusDist, 360 - venusDist) <= 10;
    if (isJupiterCombust || isVenusCombust) continue; // Reject Day: Guru/Shukra Moudhya

    // Rule 2: Masa Shuddhi (Kharmas / Shoonya Masa)
    const sunSignIdx = Math.floor(longToday.sun / 30);
    const isKharmas = sunSignIdx === 8 || sunSignIdx === 11; // Dhanus(8) or Meena(11)
    if (isKharmas) continue; // Reject Day: Kharmas

    // Rule 3: Vara Shuddhi (Weekday Check)
    if (TYAJYA_WEEKDAYS.includes(weekdayIdx)) continue; // Reject Day: Kuja Vara (Tuesday)

    // Rule 4: Tithi Shuddhi (Lunar Day Check)
    // Strict rejection of Amavasya. Rikta tithis (3,8,13) are kept permissive based on empirical data, but Amavasya is absolutely forbidden.
    if (tithiIdx === 29) continue; // Reject Day: Amavasya

    // Rule 5: Karana Shuddhi (Vishti / Bhadra Check)
    if (karanaIdx === 6) continue; // Reject Day: Bhadra Karana

    // Rule 6: Yoga Shuddhi (Inauspicious Yogas)
    if (INAUSPICIOUS_YOGAS.includes(yogaIdx)) continue; // Reject Day: Inauspicious Nitya Yoga

    // Rule 7: Nakshatra Shuddhi (Generic Tyajya)
    if (TYAJYA_NAKSHATRAS.includes(moonNakIdx)) continue; // Reject Day: Ugra/Krura Nakshatra

    // --- PHASE 2: LAGNA GENERATOR FOR PURE DAYS ---
    // If the day is pure, find auspicious Lagnas during the day.
    // Each Lagna will be strictly tested for Ashtama Shuddhi and Lagna Shuddhi.
    const lagnas: LagnaEntry[] = [];
    let currentLagnaIdx = -1;
    let currentLagnaStart: Date | null = null;
    let prevLagnaIdx = -1;

    // Step through the day in 10-minute increments to find Lagna boundaries
    for (let m = 0; m < 24 * 60; m += 10) {
      const timeUtc = new Date(today530.getTime() + m * 60 * 1000 - 5.5 * 3600 * 1000); // converting IST 'm' to UTC
      const jd = dateToJulianUt(timeUtc);
      const lst = calculateLocalSiderealTime(timeUtc, longitude);
      const eps = meanObliquityDegrees(jd);
      const ascTropical = ascendantTropicalDegrees(lst, latitude, eps);
      const ayanamsa = ayanamsaModel === "lahiri" ? siderealLongitudes(timeUtc, ayanamsaModel).ayanamsa : siderealLongitudes(timeUtc, ayanamsaModel).ayanamsa;
      const ascendant = normalizeDegree(ascTropical - ayanamsa);
      const rashiIdx = Math.floor(ascendant / 30) % 12;

      if (rashiIdx !== currentLagnaIdx) {
        if (currentLagnaIdx !== -1 && currentLagnaStart) {
          // A lagna block just ended. Analyze it using the midpoint.
          const midTime = new Date((currentLagnaStart.getTime() + timeUtc.getTime()) / 2);
          const block = analyzeLagnaBlock(currentLagnaIdx, currentLagnaStart, timeUtc, midTime, latitude, longitude, ayanamsaModel);
          if (block) {
            lagnas.push(block);
          }
        }
        currentLagnaIdx = rashiIdx;
        currentLagnaStart = timeUtc;
      }
    }

    if (lagnas.length > 0) {
      const types: ("marriage" | "housewarming" | "upanayana" | "general" | "choula" | "devapratishtha")[] = [];

      // Relaxed Nakshatras based on Baggona Empirical Data
      const shubhaTithis = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28]; 
      const allowedWeekdays = [0, 1, 3, 4, 5, 6];

      const baggageVivahaNaks = [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26]; // Included Magha, Mula, Swati
      if (baggageVivahaNaks.includes(moonNakIdx) && shubhaTithis.includes(tithiIdx) && allowedWeekdays.includes(weekdayIdx)) types.push("marriage");
      
      const gpNaks = [3, 4, 11, 12, 13, 16, 20, 21, 22, 23, 25, 26];
      if (gpNaks.includes(moonNakIdx) && shubhaTithis.includes(tithiIdx) && allowedWeekdays.includes(weekdayIdx)) types.push("housewarming");
      
      const upaNaks = [3, 4, 5, 7, 9, 12, 13, 16, 21, 22, 23, 24, 26]; // Included Ardra, Magha, Purva Bhadrapada
      if (upaNaks.includes(moonNakIdx) && allowedWeekdays.includes(weekdayIdx)) types.push("upanayana");

      const choulaNaks = [0, 3, 4, 6, 7, 12, 13, 14, 21, 22, 23, 26];
      if (choulaNaks.includes(moonNakIdx) && allowedWeekdays.includes(weekdayIdx)) types.push("choula");

      if (types.length > 0) types.push("devapratishtha");
      if (types.length === 0) types.push("general");

      // Check if this date exists in the authentic matching database
      let isAuthenticMatch = false;
      const authenticEntry = authenticMatches.find(m => m.date === dateStr);
      if (authenticEntry) {
         isAuthenticMatch = true;
         // Ensure we merge the types so it matches the authentic categories
         for (const t of authenticEntry.types) {
           if (!types.includes(t)) types.push(t);
         }
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
        purityScore: Math.max(...lagnas.map(l => l.purityScore)),
        lagnas,
        isAuthenticMatch
      });
    }
  }

  return list;
}

/**
 * Transforms the static authentic dataset into the MuhurthaEntry format for UI consumption.
 */
function processAuthenticBaggonaData(year: number): MuhurthaEntry[] {
  const list: MuhurthaEntry[] = [];
  const entriesForYear = BaggonaAuthenticData.filter(d => d.date.endsWith(year.toString()));
  
  // Group by date
  const groupedByDate: Record<string, AuthenticBaggonaMuhurtha[]> = {};
  for (const entry of entriesForYear) {
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const parts = entry.date.split("-");
    if (parts.length === 3) {
      const yyyy = parts[2]!;
      const mm = parts[1]!;
      const dd = parts[0]!;
      const isoDate = `${yyyy}-${mm}-${dd}`;
      if (!groupedByDate[isoDate]) groupedByDate[isoDate] = [];
      groupedByDate[isoDate]!.push(entry);
    }
  }

  for (const [dateStr, entries] of Object.entries(groupedByDate)) {
    // Base data from first entry
    const first = entries[0]!;
    
    // Compute indexes
    const weekdayIdx = WEEKDAYS_EN.findIndex(w => w === first.vara) !== -1 ? WEEKDAYS_EN.findIndex(w => w === first.vara) : 0;
    const tithiIdx = first.tithi - 1 + (first.paksha === "Krishna" ? 15 : 0);
    const nakIdx = NAKSHATRAS_EN.findIndex(n => n.includes(first.nakshatra) || first.nakshatra.includes(n)) !== -1 
      ? NAKSHATRAS_EN.findIndex(n => n.includes(first.nakshatra) || first.nakshatra.includes(n)) : 0;
    
    const lagnas: LagnaEntry[] = entries.map(e => {
      const rIdx = RASHIS_EN.findIndex(r => r.includes(e.lagna) || e.lagna.includes(r)) !== -1 
        ? RASHIS_EN.findIndex(r => r.includes(e.lagna) || e.lagna.includes(r)) : (e.lagna === "Abhijit" ? 12 : 0);
      
      const rName = e.lagna === "Abhijit" ? "Abhijit" : RASHIS_EN[rIdx] || e.lagna;
      const rNameKn = e.lagna === "Abhijit" ? "ಅಭಿಜಿತ್" : RASHIS_KN[rIdx] || e.lagna;

      return {
        startTime: e.time,
        endTime: e.time, // Exact time provided in text
        rashiIdx: rIdx,
        rashiName: rName,
        rashiNameKn: rNameKn,
        purityScore: 100, // Authentic matches are always 100% pure
        explanation: "Authentic Muhurtha extracted directly from Baggona Panchanga text.",
        explanationKn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗದಿಂದ ನೇರವಾಗಿ ಆಯ್ಕೆಮಾಡಿದ ಶುದ್ಧ ಮುಹೂರ್ತ."
      };
    });

    const allTypes = new Set<string>();
    entries.forEach(e => e.category.forEach(c => allTypes.add(c)));

    list.push({
      date: dateStr,
      weekdayIdx,
      weekdayName: first.vara,
      weekdayNameKn: WEEKDAYS_KN[weekdayIdx] || first.vara,
      tithiIdx,
      tithiName: TITHIS_EN[tithiIdx] || `Tithi ${first.tithi}`,
      tithiNameKn: TITHIS_KN[tithiIdx] || `ತಿಥಿ ${first.tithi}`,
      nakshatraIdx: nakIdx,
      nakshatraName: first.nakshatra,
      nakshatraNameKn: NAKSHATRAS_KN[nakIdx] || first.nakshatra,
      yogaIdx: 0, // Not provided in simple table
      yogaName: "-",
      yogaNameKn: "-",
      karanaIdx: 0,
      karanaName: "-",
      karanaNameKn: "-",
      types: Array.from(allTypes) as any,
      purityScore: 100,
      lagnas,
      isAuthenticMatch: true
    });
  }

  // Sort by date
  list.sort((a, b) => a.date.localeCompare(b.date));

  return list;
}

/**
 * Analyzes a specific Lagna block for Ashtama Shuddhi and Guru/Shukra Balam.
 */
function analyzeLagnaBlock(
  lagnaIdx: number,
  start: Date,
  end: Date,
  mid: Date,
  lat: number,
  lng: number,
  ayanamsaModel: AyanamsaModel
): LagnaEntry | null {
  const longs = siderealLongitudes(mid, ayanamsaModel);
  const planets = [
    { name: "Sun", rashi: Math.floor(longs.sun / 30) % 12, isMalefic: true },
    { name: "Moon", rashi: Math.floor(longs.moon / 30) % 12, isMalefic: false },
    { name: "Mars", rashi: Math.floor(longs.mars / 30) % 12, isMalefic: true },
    { name: "Mercury", rashi: Math.floor(longs.mercury / 30) % 12, isMalefic: false },
    { name: "Jupiter", rashi: Math.floor(longs.jupiter / 30) % 12, isMalefic: false },
    { name: "Venus", rashi: Math.floor(longs.venus / 30) % 12, isMalefic: false },
    { name: "Saturn", rashi: Math.floor(longs.saturn / 30) % 12, isMalefic: true },
    { name: "Rahu", rashi: Math.floor(longs.rahu / 30) % 12, isMalefic: true },
    { name: "Ketu", rashi: Math.floor(longs.ketu / 30) % 12, isMalefic: true }
  ];

  const ashtamaHouse = (lagnaIdx + 7) % 12; // 8th house is 7 steps ahead
  
  // Rule 8: Ashtama Shuddhi: 8th house must be completely empty
  const planetsIn8th = planets.filter(p => p.rashi === ashtamaHouse);
  if (planetsIn8th.length > 0) return null; // Reject Lagna: Ashtama Shuddhi fails

  // Rule 9: Lagna Shuddhi: Lagna shouldn't have malefic planets
  const maleficsInLagna = planets.filter(p => p.isMalefic && p.rashi === lagnaIdx);
  if (maleficsInLagna.length > 0) return null; // Reject Lagna: Malefic in Ascendant

  // Rule 10: Guru/Shukra Balam
  let guruBalam = false;
  let shukraBalam = false;
  const auspiciousHouses = [lagnaIdx, (lagnaIdx + 3) % 12, (lagnaIdx + 4) % 12, (lagnaIdx + 6) % 12, (lagnaIdx + 8) % 12, (lagnaIdx + 9) % 12];
  
  for (const p of planets) {
    if (p.name === "Jupiter" && auspiciousHouses.includes(p.rashi)) guruBalam = true;
    if (p.name === "Venus" && auspiciousHouses.includes(p.rashi)) shukraBalam = true;
  }

  // Calculate score and explanation
  let score = 85; // Base for passing Ashtama Shuddhi
  let expEn = "This Lagna has perfect Ashtama Shuddhi (empty 8th house) and is free from malefics in the ascendant.";
  let expKn = "ಈ ಲಗ್ನವು ಸಂಪೂರ್ಣ ಅಷ್ಟಮ ಶುದ್ಧಿಯನ್ನು (೮ನೇ ಮನೆ ಖಾಲಿ) ಹೊಂದಿದ್ದು, ಲಗ್ನದಲ್ಲಿ ಪಾಪಗ್ರಹಗಳಿಲ್ಲದೇ ಶುದ್ಧವಾಗಿದೆ.";

  if (guruBalam || shukraBalam) {
    score = 100;
    expEn = "Exceptional Purity! Has perfect Ashtama Shuddhi AND strong Guru/Shukra Balam (Jupiter/Venus in Kendra/Trikona), which destroys any minor doshas.";
    expKn = "ಅತ್ಯುತ್ತಮ ಮುಹೂರ್ತ! ಸಂಪೂರ್ಣ ಅಷ್ಟಮ ಶುದ್ಧಿಯ ಜೊತೆಗೆ ಪ್ರಬಲ ಗುರು/ಶುಕ್ರ ಬಲವಿದ್ದು (ಕೇಂದ್ರ/ತ್ರಿಕೋನದಲ್ಲಿ), ಇದು ಸಕಲ ದೋಷಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.";
  }

  // Formatting time nicely to IST
  const formatTime = (d: Date) => {
    const ist = new Date(d.getTime() + 5.5 * 3600 * 1000); // Force output formatting relative to IST logic
    let h = ist.getUTCHours();
    const m = String(ist.getUTCMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
  };

  return {
    startTime: formatTime(start),
    endTime: formatTime(end),
    rashiIdx: lagnaIdx,
    rashiName: RASHIS_EN[lagnaIdx]!,
    rashiNameKn: RASHIS_KN[lagnaIdx]!,
    purityScore: score,
    explanation: expEn,
    explanationKn: expKn
  };
}
