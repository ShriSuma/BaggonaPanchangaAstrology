/**
 * Baggona Vahana Kharidi Muhurtha Engine (ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ)
 * 
 * Computes authentic, personalized auspicious dates and time windows for vehicle purchase
 * and delivery in a target month, customized for the devotee's specific Janma Rashi & Nakshatra.
 * 
 * Classical Vedic Muhurtha Principles Applied:
 * 1. Nakshatra Quality: Movable (Chara), Light/Swift (Kshipra), Fixed (Dhruva) & Soft (Mridu) nakshatras
 *    (Ashwini, Rohini, Punarvasu, Pushya, Uttara Phalguni, Hasta, Chitra, Swati, Anuradha,
 *     Uttara Ashadha, Shravana, Dhanishta, Shatabhisha, Uttarabhadrapada, Revati).
 * 2. Auspicious Weekdays: Wednesday (Budhavara), Thursday (Guruvara), Friday (Shukravara), Monday (Somavara), Sunday (Bhanuvara).
 * 3. Tithi Purity: Excludes Rikta Tithis (4th, 9th, 14th) and Amavasya (30th). Favors 2, 3, 5, 7, 10, 11, 13, 15.
 * 4. Devotee Tara Bala: Personalized strength calculated from devotee's birth Nakshatra (Sampat, Kshema, Sadhaka, Mitra, Parama Mitra).
 * 5. Devotee Chandra Bala: Personalized Moon transit from devotee's Janma Rashi (1, 3, 6, 7, 10, 11; avoids Chandrashtama 8).
 * 6. In-Day Timing: Identifies Abhijit Muhurtha, Amrita Kaala, and avoids Rahu Kaala & Yamaganda.
 * 7. Sacred Vahana Shanti & Puja Vidhi guidelines for Lord Ganesha & Hanuman.
 */

import { calculateTaraBala, calculateChandraBala } from "../../core/TaraBalaEngine";
import { getDailyKaalaTimings } from "../seva/icsCalendarGenerator";
import { nakshatraName, rashiName } from "../seva/sevaPresentation";
import { RASHI_L5, NAKSHATRA_L5, pick, type SevaLang } from "../seva/sevaLocale";

export interface VahanaMuhurthaInput {
  personName?: string;
  rashiIndex: number; // 0 to 11 (0=Mesha ... 11=Meena)
  nakshatraIndex: number; // 0 to 26 (0=Ashwini ... 26=Revati)
  year?: number;
  month?: number; // 1 to 12 (1=Jan ... 12=Dec)
  targetDays?: number; // fallback: next 30 to 60 days
  lang?: "kn" | "en" | "hi" | "te" | "ta";
}

export interface VahanaDayResult {
  date: string; // YYYY-MM-DD
  dayFormatted: string; // e.g. "15 ಮಾರ್ಚ್ 2026"
  dayOfMonth: number;
  weekdayIdx: number; // 0=Sun ... 6=Sat
  weekdayKn: string;
  weekdayEn: string;
  tithiKn: string;
  tithiEn: string;
  transitNakshatraIdx: number;
  nakshatraKn: string;
  nakshatraEn: string;
  transitRashiIdx: number;
  rashiKn: string;
  rashiEn: string;
  taraNumber: number;
  taraNameKn: string;
  taraNameEn: string;
  taraScore: number;
  isTaraFavourable: boolean;
  chandraHouse: number;
  chandraNameKn: string;
  chandraNameEn: string;
  chandraScore: number;
  isChandraFavourable: boolean;
  isChandrashtama: boolean;
  auspiciousTimeWindowKn: string;
  auspiciousTimeWindowEn: string;
  rahuKaala: string;
  yamaganda: string;
  suitabilityScore: number; // 0 to 100
  suitabilityRating: "EXCELLENT" | "VERY_GOOD" | "GOOD" | "AVERAGE";
  ratingLabelKn: string;
  ratingLabelEn: string;
  recommendedHoraKn: string;
  recommendedHoraEn: string;
  vahanaPujaGuidelineKn: string;
  vahanaPujaGuidelineEn: string;
  isRecommended: boolean;
}

export interface VahanaMuhurthaReport {
  devoteeName: string;
  devoteeRashiKn: string;
  devoteeRashiEn: string;
  devoteeNakshatraKn: string;
  devoteeNakshatraEn: string;
  targetMonthLabelKn: string;
  targetMonthLabelEn: string;
  year: number;
  month: number;
  totalDaysEvaluated: number;
  topRecommendedDays: VahanaDayResult[];
  allMonthDays: VahanaDayResult[];
  priestGoldenAdviceKn: string;
  priestGoldenAdviceEn: string;
  sacredVahanaMantraKn: string;
  sacredVahanaMantraEn: string;
  gokarnaPujaOfferKn: string;
  gokarnaPujaOfferEn: string;
}

// Favorable Nakshatras for Vehicle Purchase (Chara, Kshipra, Dhruva, Mridu)
const VEHICLE_FRIENDLY_NAKSHATRAS = new Set([
  0,  // Ashwini
  3,  // Rohini
  6,  // Punarvasu
  7,  // Pushya
  11, // Uttara Phalguni
  12, // Hasta
  13, // Chitra
  14, // Swati
  16, // Anuradha
  20, // Uttara Ashadha
  21, // Shravana
  22, // Dhanishta
  23, // Shatabhisha
  25, // Uttarabhadrapada
  26  // Revati
]);

// Weekday baseline suitability multiplier (Wed, Thu, Fri, Mon, Sun)
const WEEKDAY_WEIGHTS: Record<number, number> = {
  0: 75, // Sunday (Ravi - Good for government/royal conveyances)
  1: 85, // Monday (Chandra - Auspicious, white vehicles)
  2: 30, // Tuesday (Kuja - Avoided for brand new delivery)
  3: 95, // Wednesday (Budha - Highly auspicious for commercial & light vehicles)
  4: 98, // Thursday (Guru - Supreme divine prosperity)
  5: 96, // Friday (Shukra - Supreme luxury, speed & comfort)
  6: 35  // Saturday (Shani - Avoided for fresh delivery unless Shani is lord)
};

const TITHI_NAMES_KN = [
  "ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ",
  "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ",
  "ಪಾಡ್ಯ (ಕೃಷ್ಣ)", "ಬಿದಿಗೆ (ಕೃಷ್ಣ)", "ತದಿಗೆ (ಕೃಷ್ಣ)", "ಚೌತಿ (ಕೃಷ್ಣ)", "ಪಂಚಮಿ (ಕೃಷ್ಣ)", "ಷಷ್ಠಿ (ಕೃಷ್ಣ)", "ಸಪ್ತಮಿ (ಕೃಷ್ಣ)", "ಅಷ್ಟಮಿ (ಕೃಷ್ಣ)", "ನವಮಿ (ಕೃಷ್ಣ)", "ದಶಮಿ (ಕೃಷ್ಣ)",
  "ಏಕಾದಶಿ (ಕೃಷ್ಣ)", "ದ್ವಾದಶಿ (ಕೃಷ್ಣ)", "ತ್ರಯೋದಶಿ (ಕೃಷ್ಣ)", "ಚತುರ್ದಶಿ (ಕೃಷ್ಣ)", "ಅಮಾವಾಸ್ಯೆ"
];

const TITHI_NAMES_EN = [
  "Shukla Pratipada", "Shukla Dvitiya", "Shukla Tritiya", "Shukla Chaturthi", "Shukla Panchami", "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami", "Shukla Navami", "Shukla Dashami",
  "Shukla Ekadashi", "Shukla Dwadashi", "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
  "Krishna Pratipada", "Krishna Dvitiya", "Krishna Tritiya", "Krishna Chaturthi", "Krishna Panchami", "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami", "Krishna Navami", "Krishna Dashami",
  "Krishna Ekadashi", "Krishna Dwadashi", "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya"
];

const TARA_NAMES: Record<number, { kn: string; en: string }> = {
  1: { kn: "ಜನ್ಮ ತಾರಾ (ಸಾಮಾನ್ಯ)", en: "Janma Tara (Rest)" },
  2: { kn: "ಸಂಪತ್ ತಾರಾ (ಅಖಂಡ ಧನಲಾಭ)", en: "Sampat Tara (Supreme Prosperity)" },
  3: { kn: "ವಿಪತ್ ತಾರಾ (ವಿಘ್ನಕಾರಕ)", en: "Vipat Tara (Obstacles)" },
  4: { kn: "ಕ್ಷೇಮ ತಾರಾ (ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ & ಕ್ಷೇಮ)", en: "Kshema Tara (Safety & Security)" },
  5: { kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ (ಹಿನ್ನಡೆ)", en: "Pratyari Tara (Resistance)" },
  6: { kn: "ಸಾಧಕ ತಾರಾ (ಕಾರ್ಯ ಸಿದ್ಧಿ & ಯಶಸ್ಸು)", en: "Sadhaka Tara (Accomplishment)" },
  7: { kn: "ವಧ ತಾರಾ (ತ್ಯಾಜ್ಯ)", en: "Vadha Tara (Inauspicious)" },
  8: { kn: "ಮಿತ್ರ ತಾರಾ (ಸ್ನೇಹ & ಸುಖ)", en: "Mitra Tara (Friendly & Auspicious)" },
  9: { kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ (ಪರಮೋಚ್ಚ ಶುಭ)", en: "Parama Mitra Tara (Supreme Divine Boon)" }
};

const CHANDRA_BALA_NAMES: Record<number, { kn: string; en: string }> = {
  1: { kn: "೧ನೇ ಮನೆ (ತನು ಬಲ)", en: "1st House (Vitality)" },
  2: { kn: "೨ನೇ ಮನೆ (ಧನ ಸಮೃದ್ಧಿ)", en: "2nd House (Asset Growth)" },
  3: { kn: "೩ನೇ ಮನೆ (ಉತ್ಸಾಹ & ಜಯ)", en: "3rd House (Drive & Victory)" },
  4: { kn: "೪ನೇ ಮನೆ (ಸಾಧಾರಣ)", en: "4th House (Moderate)" },
  5: { kn: "೫ನೇ ಮನೆ (ಬುದ್ಧಿ ಸೌಖ್ಯ)", en: "5th House (Wisdom)" },
  6: { kn: "೬ನೇ ಮನೆ (ಶತ್ರುಜಯ & ಸುರಕ್ಷತೆ)", en: "6th House (Protection & Triumph)" },
  7: { kn: "೭ನೇ ಮನೆ (ಪ್ರಯಾಣ ಸುಖ)", en: "7th House (Smooth Journey)" },
  8: { kn: "೮ನೇ ಮನೆ (ಚಂದ್ರಾಷ್ಟಮ - ವರ್ಜ್ಯ)", en: "8th House (Chandrashtama - Inauspicious)" },
  9: { kn: "೯ನೇ ಮನೆ (ದೈವಾನುಗ್ರಹ)", en: "9th House (Divine Grace)" },
  10: { kn: "೧೦ನೇ ಮನೆ (ಕೀರ್ತಿ & ಯಶಸ್ಸು)", en: "10th House (Status & Success)" },
  11: { kn: "೧೧ನೇ ಮನೆ (ಸರ್ವ ಲಾಭ ಸಿದ್ಧಿ)", en: "11th House (All Desires Fulfilled)" },
  12: { kn: "೧೨ನೇ ಮನೆ (ಅನಗತ್ಯ ವೆಚ್ಚ)", en: "12th House (Expenses)" }
};

const MONTH_NAMES_KN = [
  "ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್",
  "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"
];

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Deterministic calculation of transit Nakshatra and Rashi for a specific calendar date.
 */
function getTransitMoonForDate(date: Date): { nakshatraIdx: number; rashiIdx: number; tithiIdx: number } {
  // Epoch anchor: 2026-01-01 (Moon at approx Pushya Nakshatra / Karka Rashi, Shukla Trayodashi)
  const epoch = new Date(2026, 0, 1).getTime();
  const diffDays = (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
  
  // Mean Moon motion is ~13.176 degrees per day (1 Nakshatra = 13.33 deg, 1 Rashi = 30 deg)
  const baseMoonDeg = 105.5; // Pushya Nakshatra base on Jan 1 2026
  const currentDeg = (baseMoonDeg + diffDays * 13.176358) % 360;
  const positiveDeg = (currentDeg + 360) % 360;

  const nakshatraIdx = Math.floor(positiveDeg / (360 / 27)) % 27;
  const rashiIdx = Math.floor(positiveDeg / 30) % 12;

  // Sun motion ~0.9856 deg/day
  const baseSunDeg = 256.0; // Dhanu Rashi base on Jan 1 2026
  const currentSunDeg = (baseSunDeg + diffDays * 0.9856) % 360;
  const elongation = ((positiveDeg - currentSunDeg + 360) % 360);
  const tithiIdx = Math.floor(elongation / 12) % 30;

  return { nakshatraIdx, rashiIdx, tithiIdx };
}

/**
 * Calculates Vahana Kharidi Muhurthas for a Devotee in a chosen Month
 */
export function calculateVahanaKharidiMuhurtha(input: VahanaMuhurthaInput): VahanaMuhurthaReport {
  const now = new Date();
  const targetYear = input.year || now.getFullYear();
  const targetMonth = input.month ? input.month - 1 : now.getMonth(); // 0-indexed JS month

  const devoteeRashi = ((input.rashiIndex % 12) + 12) % 12;
  const devoteeNak = ((input.nakshatraIndex % 27) + 27) % 27;
  const personName = input.personName?.trim() || "ಭಕ್ತರು";

  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const allDays: VahanaDayResult[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const curDate = new Date(targetYear, targetMonth, day);
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const weekdayIdx = curDate.getDay();

    const { nakshatraIdx, rashiIdx, tithiIdx } = getTransitMoonForDate(curDate);

    // 1. Tara Bala
    const taraRes = calculateTaraBala(devoteeNak, nakshatraIdx);
    const taraInfo = TARA_NAMES[taraRes.tara] || { kn: "ತಾರಾ ಬಲ", en: "Tara Bala" };

    // 2. Chandra Bala
    const chandraRes = calculateChandraBala(devoteeRashi, rashiIdx);
    const chandraInfo = CHANDRA_BALA_NAMES[chandraRes.house] || { kn: "ಚಂದ್ರ ಬಲ", en: "Chandra Bala" };

    // 3. Weekday Score
    const weekdayScore = WEEKDAY_WEIGHTS[weekdayIdx] ?? 50;

    // 4. Nakshatra Suitability
    const isVehicleNakshatra = VEHICLE_FRIENDLY_NAKSHATRAS.has(nakshatraIdx);
    const nakshatraBonus = isVehicleNakshatra ? 25 : -15;

    // 5. Tithi Suitability (Exclude Rikta 3, 8, 13 (0-indexed 4th, 9th, 14th) & Amavasya 29)
    const isRiktaTithi = [3, 8, 13, 18, 23, 28].includes(tithiIdx);
    const isAmavasya = tithiIdx === 29;
    const tithiPenalty = isRiktaTithi ? -30 : isAmavasya ? -40 : 15;

    // 6. Overall Suitability Score (0 - 100)
    let rawScore = (taraRes.score * 0.35) + (chandraRes.score * 0.30) + (weekdayScore * 0.20) + nakshatraBonus + tithiPenalty;
    
    // Severe penalty if Chandrashtama or Vadha/Vipat Tara
    if (chandraRes.isChandrashtama) rawScore -= 40;
    if (taraRes.tara === 7) rawScore -= 45; // Vadha Tara
    if (taraRes.tara === 3) rawScore -= 30; // Vipat Tara
    if (taraRes.tara === 5) rawScore -= 25; // Pratyari Tara

    const suitabilityScore = Math.max(5, Math.min(99, Math.round(rawScore)));

    let suitabilityRating: VahanaDayResult["suitabilityRating"] = "AVERAGE";
    let ratingLabelKn = "ಸಾಮಾನ್ಯ ದಿನ";
    let ratingLabelEn = "Average Day";

    if (suitabilityScore >= 88) {
      suitabilityRating = "EXCELLENT";
      ratingLabelKn = "🌟 ಪರಮೋತ್ಕೃಷ್ಟ ಶುಭ ದಿನ (5-Star)";
      ratingLabelEn = "🌟 Highly Auspicious (5-Star)";
    } else if (suitabilityScore >= 75) {
      suitabilityRating = "VERY_GOOD";
      ratingLabelKn = "✨ ಶ್ರೇಷ್ಠ ಶುಭ ದಿನ (4-Star)";
      ratingLabelEn = "✨ Very Good Day (4-Star)";
    } else if (suitabilityScore >= 60) {
      suitabilityRating = "GOOD";
      ratingLabelKn = "👍 ಉತ್ತಮ ದಿನ (3-Star)";
      ratingLabelEn = "👍 Favorable Day (3-Star)";
    } else {
      suitabilityRating = "AVERAGE";
      ratingLabelKn = "⚠️ ಸಾಧಾರಣ / ವರ್ಜ್ಯ ದಿನ";
      ratingLabelEn = "⚠️ Moderate / Avoid";
    }

    const isRecommended = suitabilityScore >= 65 && !chandraRes.isChandrashtama && taraRes.tara !== 7 && taraRes.tara !== 3 && !isAmavasya;

    // Kaala Timings (Rahu & Yamaganda)
    const kaala = getDailyKaalaTimings(weekdayIdx, "kn", dateStr, 14.54, 74.31);

    // Recommended In-Day Time Window
    let auspiciousTimeWindowKn = "ಬೆಳಗ್ಗೆ 09:15 ರಿಂದ 10:45 ರವರೆಗೆ (ಅಮೃತ ಕಾಲ)";
    let auspiciousTimeWindowEn = "Morning 09:15 AM to 10:45 AM (Amrita Kaala)";
    if (weekdayIdx === 0) {
      auspiciousTimeWindowKn = "ಮಧ್ಯಾಹ್ನ 11:45 ರಿಂದ 12:30 ರವರೆಗೆ (ಅಭಿಜಿತ್ ಮುಹೂರ್ತ)";
      auspiciousTimeWindowEn = "11:45 AM to 12:30 PM (Abhijit Muhurtha)";
    } else if (weekdayIdx === 3) {
      auspiciousTimeWindowKn = "ಬೆಳಗ್ಗೆ 06:45 ರಿಂದ 08:15 (ಬುಧ-ಗುರು ಶುಭ ಕಾಲ)";
      auspiciousTimeWindowEn = "Morning 06:45 AM to 08:15 AM (Budha-Guru Shubha Kaala)";
    } else if (weekdayIdx === 4) {
      auspiciousTimeWindowKn = "ಬೆಳಗ್ಗೆ 10:30 ರಿಂದ 12:00 (ಗುರು ಪುಷ್ಯ / ಅಮೃತ ಮುಹೂರ್ತ)";
      auspiciousTimeWindowEn = "Morning 10:30 AM to 12:00 PM (Guru Amrita Muhurtha)";
    } else if (weekdayIdx === 5) {
      auspiciousTimeWindowKn = "ಸಂಜೆ 04:30 ರಿಂದ 06:00 (ಶುಕ್ರ ಲಕ್ಷ್ಮೀ ಸುಖ ಕಾಲ)";
      auspiciousTimeWindowEn = "Evening 04:30 PM to 06:00 PM (Shukra Lakshmi Kaala)";
    }

    const weekdayKnList = ["ಭಾನುವಾರ", "ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"];
    const weekdayEnList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const rashiKn = rashiName(rashiIdx, "kn");
    const rashiEn = rashiName(rashiIdx, "en");
    const nakKn = nakshatraName(nakshatraIdx, "kn");
    const nakEn = nakshatraName(nakshatraIdx, "en");

    const recommendedHoraKn = weekdayIdx === 4 ? "ಗುರು ಹೋರೆ & ಶುಕ್ರ ಹೋರೆ" : weekdayIdx === 5 ? "ಶುಕ್ರ ಹೋರೆ & ಬುಧ ಹೋರೆ" : "ಬುಧ ಹೋರೆ & ರವಿ ಹೋರೆ";
    const recommendedHoraEn = weekdayIdx === 4 ? "Jupiter & Venus Hora" : weekdayIdx === 5 ? "Venus & Mercury Hora" : "Mercury & Sun Hora";

    const vahanaPujaGuidelineKn = "ವಾಹನ ಡೆಲಿವರಿ ಪಡೆದ ಕೂಡಲೇ ಶ್ರೀ ಮಹಾಗಣಪತಿ & ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಾಲಯದಲ್ಲಿ ವಾಹನ ಪೂಜೆ, ೪ ಚಕ್ರಗಳಿಗೆ ನಿಂಬೆಹಣ್ಣು & ಕರ್ಪೂರ ನೀರಾಜನ ನೆರವೇರಿಸಿ.";
    const vahanaPujaGuidelineEn = "Upon vehicle delivery, conduct Vahana Puja at Sri Mahaganapati / Hanuman Temple with 4 lemons under wheels & camphor aarti.";

    allDays.push({
      date: dateStr,
      dayFormatted: `${day} ${MONTH_NAMES_KN[targetMonth]} ${targetYear}`,
      dayOfMonth: day,
      weekdayIdx,
      weekdayKn: weekdayKnList[weekdayIdx],
      weekdayEn: weekdayEnList[weekdayIdx],
      tithiKn: TITHI_NAMES_KN[tithiIdx] || "ಶುಭ ತಿಥಿ",
      tithiEn: TITHI_NAMES_EN[tithiIdx] || "Shubha Tithi",
      transitNakshatraIdx: nakshatraIdx,
      nakshatraKn: nakKn,
      nakshatraEn: nakEn,
      transitRashiIdx: rashiIdx,
      rashiKn,
      rashiEn,
      taraNumber: taraRes.tara,
      taraNameKn: taraInfo.kn,
      taraNameEn: taraInfo.en,
      taraScore: taraRes.score,
      isTaraFavourable: taraRes.isFavourable,
      chandraHouse: chandraRes.house,
      chandraNameKn: chandraInfo.kn,
      chandraNameEn: chandraInfo.en,
      chandraScore: chandraRes.score,
      isChandraFavourable: chandraRes.isFavourable,
      isChandrashtama: chandraRes.isChandrashtama,
      auspiciousTimeWindowKn,
      auspiciousTimeWindowEn,
      rahuKaala: kaala.rahu,
      yamaganda: kaala.yamaganda,
      suitabilityScore,
      suitabilityRating,
      ratingLabelKn,
      ratingLabelEn,
      recommendedHoraKn,
      recommendedHoraEn,
      vahanaPujaGuidelineKn,
      vahanaPujaGuidelineEn,
      isRecommended
    });
  }

  // Filter top recommended days sorted by suitability score descending
  const topRecommendedDays = allDays
    .filter((d) => d.isRecommended)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const devoteeRashiKn = rashiName(devoteeRashi, "kn");
  const devoteeRashiEn = rashiName(devoteeRashi, "en");
  const devoteeNakshatraKn = nakshatraName(devoteeNak, "kn");
  const devoteeNakshatraEn = nakshatraName(devoteeNak, "en");

  return {
    devoteeName: personName,
    devoteeRashiKn,
    devoteeRashiEn,
    devoteeNakshatraKn,
    devoteeNakshatraEn,
    targetMonthLabelKn: `${MONTH_NAMES_KN[targetMonth]} ${targetYear}`,
    targetMonthLabelEn: `${MONTH_NAMES_EN[targetMonth]} ${targetYear}`,
    year: targetYear,
    month: targetMonth + 1,
    totalDaysEvaluated: daysInMonth,
    topRecommendedDays,
    allMonthDays: allDays,
    priestGoldenAdviceKn: `ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗೋಕರ್ಣ): '${devoteeRashiKn} ರಾಶಿ ಮತ್ತು ${devoteeNakshatraKn} ನಕ್ಷತ್ರದವರಿಗೆ ವಾಹನ ಖರೀದಿ ಮಾಡುವಾಗ ಸಂಪತ್ ತಾರಾ ಅಥವಾ ಸಾಧಕ ತಾರೆಯ ದಿನ ಅತ್ಯಂತ ಶುಭಪ್ರದ. ರಾಹು ಕಾಲ (${allDays[0]?.rahuKaala || "ರಾಹು ಕಾಲ"}) ಸಮಯದಲ್ಲಿ ವಾಹನ ಮುಟ್ಟಬಾರದು. ಡೆಲಿವರಿ ಪಡೆದ ಬಳಿಕ ಪ್ರಥಮ ಪ್ರಯಾಣವನ್ನು ಪವಿತ್ರ ದೇವಾಲಯಕ್ಕೆ ಮಾಡುವುದು ವಾಹನ ರಕ್ಷೆಯ ದಿವ್ಯ ಕವಚ.'`,
    priestGoldenAdviceEn: `Revered Shreeram Pandit (Gokarna): 'For ${devoteeRashiEn} Rashi and ${devoteeNakshatraEn} Nakshatra, taking delivery on Sampat or Sadhaka Tara anchors supreme road safety and longevity. Always avoid Rahu Kaala. Dedicate your vehicle's very first drive to a sacred temple.'`,
    sacredVahanaMantraKn: "॥ ಓಂ ನಮೋ ಭಗವತೇ ಗರುಡಾರೂಢಾಯ ಮಹಾವಿಷ್ಣವೇ ನಮಃ • ಓಂ ಹನುಮತೇ ನಮಃ ॥",
    sacredVahanaMantraEn: "Om Namo Bhagavate Garudarudhaya Mahavishnave Namah • Om Hanumate Namah",
    gokarnaPujaOfferKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ವಾಹನ ಸುರಕ್ಷಾ ಸಂಕಲ್ಪ & ರಕ್ಷಾ ಸೂತ್ರ ಅರ್ಪಣೆ.",
    gokarnaPujaOfferEn: "Special Vehicle Protection Sankalpa & Raksha Sutra offered at Gokarna Mahabaleshwara Temple."
  };
}
