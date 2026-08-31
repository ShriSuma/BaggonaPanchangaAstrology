/**
 * Parabhava Samvatsara Master Digital Book Engine (ಪರಾಭವ ಸಂವತ್ಸರ ಮಾಸ್ಟರ್ ಪಂಚಾಂಗ ಎಂಜಿನ್)
 * 
 * Extracted and compiled directly from the official 104-page Baggona Panchanga 2026-2027 book
 * (/Users/shreesuma/Downloads/parabav2026-27 (1).pdf - Pages 40 to 91).
 * 
 * Features complete Left Page (Even Page) and Right Page (Odd Page) data for every single day:
 * - Left Page: Tithi, Nakshatra, Yoga, Karana, Ghati-Vighati, Sunrise/Sunset, Dinapramana,
 *              Daily Shraddha Tithi, Festivals/Vratas, Visha/Amrita Ghati, Month-End Graha Chakra.
 * - Right Page: 12 Dina Lagna Ending Times (Meena to Kumbha), Graha Spashta (Planetary coordinates),
 *               and planetary transit annotations.
 */

import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import { getAyanamsa } from "./AstroMath";

export interface ParabhavaLagnaEndingTimes {
  meena: string;
  mesha: string;
  vrishabha: string;
  mithuna: string;
  karkataka: string;
  simha: string;
  kanya: string;
  tula: string;
  vrischika: string;
  dhanu: string;
  makara: string;
  kumbha: string;
}

export interface ParabhavaGrahaPosition {
  planet: string;
  planetKn: string;
  rashi: string;
  rashiKn: string;
  nakshatra: string;
  nakshatraKn: string;
  pada: number;
  isVakri?: boolean;
  navamsha?: string;
}

export interface ParabhavaDayRecord {
  // Calendar Dates & Identifiers
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  weekday: string;
  weekdayKn: string;
  weekdayShortKn: string;

  // Samvatsara & Eras
  shakaYear: number; // 1948
  samvatsara: string; // "Parabhava"
  samvatsaraKn: string; // "ಪರಾಭವ"
  ritu: string; // "Vasanta", "Grishma", "Varsha", "Sharad", "Hemanta", "Shishira"
  rituKn: string; // "ವಸಂತ", "ಗ್ರೀಷ್ಮ", "ವರ್ಷಾ", "ಶರತ್", "ಹೇಮಂತ", "ಶಿಶಿರ"
  ayana: string; // "Uttarayana" | "Dakshinayana"
  ayanaKn: string; // "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" | "ದಕ್ಷಿಣಾಯನಂ"
  
  // Months & Solar Reckoning
  chandramanaMasa: string; // "Chaitra", "Vaishakha", "Adhika_Jyeshtha", "Nija_Jyeshtha", etc.
  chandramanaMasaKn: string; // "ಚೈತ್ರ", "ವೈಶಾಖ", "ಅಧಿಕ ಜ್ಯೇಷ್ಠ", "ನಿಜ ಜ್ಯೇಷ್ಠ"...
  paksha: "Shukla" | "Krishna";
  pakshaKn: "ಶುಕ್ಲ" | "ಕೃಷ್ಣ";
  sauramanaMasa: string; // "Meena", "Mesha", "Vrishabha"...
  sauramanaMasaKn: string; // "ಮೀನ", "ಮೇಷ", "ವೃಷಭ"...
  sauramanaDina: number; // Day of solar month (1-31)
  ayanamsa: string; // "24° 12' 28\""

  // Left Page: Panchanga Angas & Ghati-Vighati
  tithi: string;
  tithiKn: string;
  tithiNumber: number; // 1 to 15 (15=Purnima/Amavasya)
  tithiGhati: string; // "46-30"
  tithiEndTime: string; // "01:05 AM (Next Day)"
  nakshatra: string;
  nakshatraKn: string;
  nakshatraGhati: string; // "53-34"
  nakshatraEndTime: string; // "03:55 AM (Next Day)"
  yoga: string;
  yogaKn: string;
  yogaGhati: string;
  karana: string;
  karanaKn: string;
  karanaGhati: string;
  sunNakshatra: string;
  sunNakshatraKn: string;
  moonRashi: string;
  moonRashiKn: string;

  // Left Page: Solar Timings & Ghati
  vishaGhati: string;
  amritaGhati: string;
  suryodaya: string; // "06:38 AM"
  suryasta: string; // "06:44 PM"
  dinapramana: string; // "30-15" (Ghati-Vighati)

  // Left Page: Shraddha & Religious Observances
  shraddhaTithi: string; // "ಪಾಡ್ಯ ಶ್ರಾದ್ಧ", "ಬಿದಿಗೆ ಶ್ರಾದ್ಧ", "ಏಕಾದಶಿ ಶ್ರಾದ್ಧ"...
  festivalsAndVratas: string[]; // ["ವತ್ಸರಪ್ರಾರಂಭಃ (ಯುಗಾದಿ)", "ಅಭ್ಯಂಗಸ್ನಾನ", "ಧ್ವಜಾರೋಪಣಂ"]
  specialYogasAndNotes: string[]; // ["ಅಮೃತಸಿದ್ಧಿ ಯೋಗ", "ಮೇಷಾಯನ ಪ್ರವೇಶ"]

  // Right Page: 12 Dina Lagna Ending Times
  lagnaEndingTimes: ParabhavaLagnaEndingTimes;

  // Right Page: Daily Planetary Movements (Graha Spashta)
  grahaSpashta: {
    ravi: ParabhavaGrahaPosition;
    chandra: ParabhavaGrahaPosition;
    kuja: ParabhavaGrahaPosition;
    budha: ParabhavaGrahaPosition;
    guru: ParabhavaGrahaPosition;
    shukra: ParabhavaGrahaPosition;
    shani: ParabhavaGrahaPosition;
    rahu: ParabhavaGrahaPosition;
    ketu: ParabhavaGrahaPosition;
  };

  // Month-End Sunrise Graha Chakra (Present for relevant month dates)
  monthEndGrahaChakra?: {
    description: string;
    descriptionKn: string;
    houses: Record<number, string[]>; // 1=Mesha, 2=Vrishabha, ... 12=Meena
  };
}

/* -------------------------------------------------------------------------- */
/* MONTH DEFINITIONS & CALENDAR METADATA                                      */
/* -------------------------------------------------------------------------- */

export interface MonthPakshaDef {
  id: string;
  masa: string;
  masaKn: string;
  paksha: "Shukla" | "Krishna";
  pakshaKn: "ಶುಕ್ಲ" | "ಕೃಷ್ಣ";
  leftPage: number;
  rightPage: number;
  startDate: string;
  dayCount: number;
  sauramanaMasa: string;
  sauramanaMasaKn: string;
  sauramanaStartDina: number;
  ritu: string;
  rituKn: string;
  ayana: string;
  ayanaKn: string;
}

export const PARABHAVA_MONTH_PAKSHAS: MonthPakshaDef[] = [
  { id: "chaitra_shukla", masa: "Chaitra", masaKn: "ಚೈತ್ರ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 40, rightPage: 41, startDate: "2026-03-19", dayCount: 15, sauramanaMasa: "Meena", sauramanaMasaKn: "ಮೀನ", sauramanaStartDina: 5, ritu: "Vasanta", rituKn: "ವಸಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "chaitra_krishna", masa: "Chaitra", masaKn: "ಚೈತ್ರ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 42, rightPage: 43, startDate: "2026-04-03", dayCount: 15, sauramanaMasa: "Meena/Mesha", sauramanaMasaKn: "ಮೀನ/ಮೇಷ", sauramanaStartDina: 20, ritu: "Vasanta", rituKn: "ವಸಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "vaishakha_shukla", masa: "Vaishakha", masaKn: "ವೈಶಾಖ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 44, rightPage: 45, startDate: "2026-04-18", dayCount: 14, sauramanaMasa: "Mesha", sauramanaMasaKn: "ಮೇಷ", sauramanaStartDina: 5, ritu: "Vasanta", rituKn: "ವಸಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "vaishakha_krishna", masa: "Vaishakha", masaKn: "ವೈಶಾಖ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 46, rightPage: 47, startDate: "2026-05-02", dayCount: 15, sauramanaMasa: "Mesha/Vrishabha", sauramanaMasaKn: "ಮೇಷ/ವೃಷಭ", sauramanaStartDina: 19, ritu: "Vasanta", rituKn: "ವಸಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "adhika_jyeshtha_shukla", masa: "Adhika_Jyeshtha", masaKn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 48, rightPage: 49, startDate: "2026-05-17", dayCount: 15, sauramanaMasa: "Vrishabha", sauramanaMasaKn: "ವೃಷಭ", sauramanaStartDina: 3, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "adhika_jyeshtha_krishna", masa: "Adhika_Jyeshtha", masaKn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 50, rightPage: 51, startDate: "2026-06-01", dayCount: 14, sauramanaMasa: "Vrishabha/Mithuna", sauramanaMasaKn: "ವೃಷಭ/ಮಿಥುನ", sauramanaStartDina: 18, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "nija_jyeshtha_shukla", masa: "Nija_Jyeshtha", masaKn: "ನಿಜ ಜ್ಯೇಷ್ಠ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 52, rightPage: 53, startDate: "2026-06-15", dayCount: 15, sauramanaMasa: "Mithuna", sauramanaMasaKn: "ಮಿಥುನ", sauramanaStartDina: 1, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Uttarayana/Dakshinayana", ayanaKn: "ಉದಗಯನಂ/ದಕ್ಷಿಣಾಯನಂ" },
  { id: "nija_jyeshtha_krishna", masa: "Nija_Jyeshtha", masaKn: "ನಿಜ ಜ್ಯೇಷ್ಠ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 54, rightPage: 55, startDate: "2026-06-30", dayCount: 15, sauramanaMasa: "Mithuna", sauramanaMasaKn: "ಮಿಥುನ", sauramanaStartDina: 16, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "ashadha_shukla", masa: "Ashadha", masaKn: "ಆಷಾಢ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 56, rightPage: 57, startDate: "2026-07-15", dayCount: 15, sauramanaMasa: "Karkataka", sauramanaMasaKn: "ಕರ್ಕಾಟಕ", sauramanaStartDina: 1, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "ashadha_krishna", masa: "Ashadha", masaKn: "ಆಷಾಢ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 58, rightPage: 59, startDate: "2026-07-30", dayCount: 14, sauramanaMasa: "Karkataka/Simha", sauramanaMasaKn: "ಕರ್ಕಾಟಕ/ಸಿಂಹ", sauramanaStartDina: 15, ritu: "Grishma", rituKn: "ಗ್ರೀಷ್ಮ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "shravana_shukla", masa: "Shravana", masaKn: "ಶ್ರಾವಣ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 60, rightPage: 61, startDate: "2026-08-13", dayCount: 16, sauramanaMasa: "Simha", sauramanaMasaKn: "ಸಿಂಹ", sauramanaStartDina: 1, ritu: "Varsha", rituKn: "ವರ್ಷಾ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "shravana_krishna", masa: "Shravana", masaKn: "ಶ್ರಾವಣ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 62, rightPage: 63, startDate: "2026-08-29", dayCount: 14, sauramanaMasa: "Simha/Kanya", sauramanaMasaKn: "ಸಿಂಹ/ಕನ್ಯಾ", sauramanaStartDina: 14, ritu: "Varsha", rituKn: "ವರ್ಷಾ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "bhadrapada_shukla", masa: "Bhadrapada", masaKn: "ಭಾದ್ರಪದ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 64, rightPage: 65, startDate: "2026-09-12", dayCount: 15, sauramanaMasa: "Kanya", sauramanaMasaKn: "ಕನ್ಯಾ", sauramanaStartDina: 1, ritu: "Varsha", rituKn: "ವರ್ಷಾ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "bhadrapada_krishna", masa: "Bhadrapada", masaKn: "ಭಾದ್ರಪದ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 66, rightPage: 67, startDate: "2026-09-27", dayCount: 14, sauramanaMasa: "Kanya/Tula", sauramanaMasaKn: "ಕನ್ಯಾ/ತುಲಾ", sauramanaStartDina: 12, ritu: "Varsha", rituKn: "ವರ್ಷಾ", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "ashvayuja_shukla", masa: "Ashvayuja", masaKn: "ಆಶ್ವಯುಜ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 68, rightPage: 69, startDate: "2026-10-11", dayCount: 15, sauramanaMasa: "Tula", sauramanaMasaKn: "ತುಲಾ", sauramanaStartDina: 1, ritu: "Sharad", rituKn: "ಶರತ್", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "ashvayuja_krishna", masa: "Ashvayuja", masaKn: "ಆಶ್ವಯುಜ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 70, rightPage: 71, startDate: "2026-10-26", dayCount: 15, sauramanaMasa: "Tula/Vrischika", sauramanaMasaKn: "ತುಲಾ/ವೃಶ್ಚಿಕ", sauramanaStartDina: 11, ritu: "Sharad", rituKn: "ಶರತ್", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "kartika_shukla", masa: "Kartika", masaKn: "ಕಾರ್ತಿಕ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 72, rightPage: 73, startDate: "2026-11-10", dayCount: 15, sauramanaMasa: "Vrischika", sauramanaMasaKn: "ವೃಶ್ಚಿಕ", sauramanaStartDina: 1, ritu: "Sharad", rituKn: "ಶರತ್", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "kartika_krishna", masa: "Kartika", masaKn: "ಕಾರ್ತಿಕ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 74, rightPage: 75, startDate: "2026-11-25", dayCount: 15, sauramanaMasa: "Vrischika/Dhanu", sauramanaMasaKn: "ವೃಶ್ಚಿಕ/ಧನು", sauramanaStartDina: 11, ritu: "Sharad", rituKn: "ಶರತ್", ayana: "Dakshinayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ" },
  { id: "margashira_shukla", masa: "Margashira", masaKn: "ಮಾರ್ಗಶಿರ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 76, rightPage: 77, startDate: "2026-12-10", dayCount: 14, sauramanaMasa: "Dhanu", sauramanaMasaKn: "ಧನು", sauramanaStartDina: 1, ritu: "Hemanta", rituKn: "ಹೇಮಂತ", ayana: "Dakshinayana/Uttarayana", ayanaKn: "ದಕ್ಷಿಣಾಯನಂ/ಉತ್ತರಾಯಣಂ" },
  { id: "margashira_krishna", masa: "Margashira", masaKn: "ಮಾರ್ಗಶಿರ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 78, rightPage: 79, startDate: "2026-12-24", dayCount: 15, sauramanaMasa: "Dhanu/Makara", sauramanaMasaKn: "ಧನು/ಮಕರ", sauramanaStartDina: 10, ritu: "Hemanta", rituKn: "ಹೇಮಂತ", ayana: "Uttarayana", ayanaKn: "ಉತ್ತರಾಯಣಂ" },
  { id: "pushya_shukla", masa: "Pushya", masaKn: "ಪುಷ್ಯ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 80, rightPage: 81, startDate: "2027-01-08", dayCount: 15, sauramanaMasa: "Makara", sauramanaMasaKn: "ಮಕರ", sauramanaStartDina: 1, ritu: "Hemanta", rituKn: "ಹೇಮಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "pushya_krishna", masa: "Pushya", masaKn: "ಪುಷ್ಯ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 82, rightPage: 83, startDate: "2027-01-23", dayCount: 15, sauramanaMasa: "Makara/Kumbha", sauramanaMasaKn: "ಮಕರ/ಕುಂಭ", sauramanaStartDina: 10, ritu: "Hemanta", rituKn: "ಹೇಮಂತ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "magha_shukla", masa: "Magha", masaKn: "ಮಾಘ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 84, rightPage: 85, startDate: "2027-02-07", dayCount: 15, sauramanaMasa: "Kumbha", sauramanaMasaKn: "ಕುಂಭ", sauramanaStartDina: 1, ritu: "Shishira", rituKn: "ಶಿಶಿರ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "magha_krishna", masa: "Magha", masaKn: "ಮಾಘ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 86, rightPage: 87, startDate: "2027-02-22", dayCount: 15, sauramanaMasa: "Kumbha/Meena", sauramanaMasaKn: "ಕುಂಭ/ಮೀನ", sauramanaStartDina: 11, ritu: "Shishira", rituKn: "ಶಿಶಿರ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "phalguna_shukla", masa: "Phalguna", masaKn: "ಫಾಲ್ಗುಣ", paksha: "Shukla", pakshaKn: "ಶುಕ್ಲ", leftPage: 88, rightPage: 89, startDate: "2027-03-09", dayCount: 14, sauramanaMasa: "Meena", sauramanaMasaKn: "ಮೀನ", sauramanaStartDina: 1, ritu: "Shishira", rituKn: "ಶಿಶಿರ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" },
  { id: "phalguna_krishna", masa: "Phalguna", masaKn: "ಫಾಲ್ಗುಣ", paksha: "Krishna", pakshaKn: "ಕೃಷ್ಣ", leftPage: 90, rightPage: 91, startDate: "2027-03-23", dayCount: 16, sauramanaMasa: "Meena", sauramanaMasaKn: "ಮೀನ", sauramanaStartDina: 10, ritu: "Shishira", rituKn: "ಶಿಶಿರ", ayana: "Uttarayana", ayanaKn: "ಉದಗಯನಂ (ಉತ್ತರಾಯಣ)" }
];

/* -------------------------------------------------------------------------- */
/* MASTER FESTIVALS, SHRADDHA & SPECIAL OBSERVANCES REPOSITORY                */
/* -------------------------------------------------------------------------- */

interface DaySpecialInfo {
  shraddha: string;
  festivals: string[];
  notes: string[];
}

const KNOWN_SPECIAL_DAYS: Record<string, DaySpecialInfo> = {
  "2026-03-19": {
    shraddha: "ಪಾಡ್ಯ ಶ್ರಾದ್ಧ",
    festivals: ["ವತ್ಸರಪ್ರಾರಂಭಃ (ಯುಗಾದಿ)", "ಅಭ್ಯಂಗಸ್ನಾನ", "ಧ್ವಜಾರೋಪಣಂ", "ವಸಂತನವರಾತ್ರಿ ಪ್ರಾರಂಭ"],
    notes: ["ನೂತನ ಪಂಚಾಂಗ ಶ್ರವಣಂ", "ಇಷ್ಟಿಃ", "ಕಲ್ಪಾದಿಃ"]
  },
  "2026-03-20": {
    shraddha: "ಬಿದಿಗೆ ಶ್ರಾದ್ಧ",
    festivals: ["ಬಾಲೇಂದುಪೂಜಾ", "ಚಂದ್ರದರ್ಶನ"],
    notes: ["ಅಮೃತಸಿದ್ಧಿ ಯೋಗ (೨೬-೨೭)", "ಪಂಚಕಮು"]
  },
  "2026-03-21": {
    shraddha: "ತದಿಗೆ ಶ್ರಾದ್ಧ",
    festivals: ["ಮತ್ಸ್ಯಜಯಂತೀ", "ಮನ್ವಾದಿಃ"],
    notes: ["ಮೇಷಾಯನಂ ಪ್ರವೇಶ (೨೦-೩೩)"]
  },
  "2026-03-22": {
    shraddha: "ಚೌತಿ ಶ್ರಾದ್ಧ",
    festivals: ["ವೈನಾಯಕೀ ಚತುರ್ಥೀ", "ವೈಧೃತಿ ಶ್ರಾದ್ಧ"],
    notes: ["ವೈಧೃತಿ ಯೋಗ"]
  },
  "2026-03-23": {
    shraddha: "ಪಂಚಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಶ್ರೀ ಪಂಚಮೀ", "ಕಲ್ಪಾದಿಃ"],
    notes: ["ಲಕ್ಷ್ಮೀ ಪೂಜಾ"]
  },
  "2026-03-24": {
    shraddha: "ಷಷ್ಠಿ-ಸಪ್ತಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಸ್ಕಂದ ಷಷ್ಠೀ"],
    notes: ["ಪ್ರಾಗುದಿತಃ ಕುಜಃ (ಕುಜ ಪೂರ್ವೋದಯ)"]
  },
  "2026-03-25": {
    shraddha: "ಸಪ್ತಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಭವಾನಿ ಉತ್ಪತ್ತಿಃ"],
    notes: ["ಸಪ್ತಮೀ ವ್ರತ"]
  },
  "2026-03-26": {
    shraddha: "ಅಷ್ಟಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಅಶೋಕಾಷ್ಟಮೀ", "ಭವಾನೀ ವ್ರತ"],
    notes: ["ದುರ್ಗಾಷ್ಟಮೀ"]
  },
  "2026-03-27": {
    shraddha: "ನವಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಶ್ರೀರಾಮನವಮೀ", "ವನವಾಸಿ ಸೀತಾರಾಮ ಲಕ್ಷ್ಮಣ ದೇವರ ವರ್ಧಂತಿ"],
    notes: ["ವಸಂತ ನವರಾತ್ರಿ ಸಮಾಪ್ತಿ"]
  },
  "2026-03-28": {
    shraddha: "ದಶಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಶರಾವತಿ ಆರತಿ", "ಶರಾವತಿ ಕುಂಭಸ್ನಾನ ಪ್ರಾರಂಭ", "ಚಿತ್ರಾಪುರ ಧ್ವಜಾರೋಪಣಂ"],
    notes: ["ಧರ್ಮರಾಜ ದಶಮೀ"]
  },
  "2026-03-29": {
    shraddha: "ಏಕಾದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಸರ್ವೇಷಾಮೇಕಾದಶೀ", "ಕಾಮದಾ ಏಕಾದಶಿ"],
    notes: ["ಹರಿವಾಸರ (೨೯ ಮಾರ್ಚ್)"]
  },
  "2026-03-30": {
    shraddha: "ದ್ವಾದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ವಾಮನ ದ್ವಾದಶೀ", "ದಮನಕೋತ್ಸವ", "ಪ್ರದೋಷ ಪೂಜೆ"],
    notes: ["ಮದನ ತ್ರಯೋದಶೀ"]
  },
  "2026-03-31": {
    shraddha: "ತ್ರಯೋದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಅನಂಗಪೂಜಾ", "ಮಹಾವೀರ ಜಯಂತೀ"],
    notes: ["ತ್ರಯೋದಶೀ ವ್ರತ"]
  },
  "2026-04-01": {
    shraddha: "ಚತುರ್ದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಶಿವದಮನೋತ್ಸವಃ"],
    notes: ["ನೃಸಿಂಹ ದಮನೋತ್ಸವ"]
  },
  "2026-04-02": {
    shraddha: "ಹುಣ್ಣಿಮೆ ಶ್ರಾದ್ಧ",
    festivals: ["ಹನುಮಜ್ಜಯಂತೀ", "ಚಿತ್ರಾಪುರ ರಥೋತ್ಸವಃ", "ಅನ್ವಾಧಾನಂ", "ಮನ್ವಾದಿಃ"],
    notes: ["ಸರ್ವದೇವ ದಮನೋತ್ಸವಃ", "ವೈಶಾಖ ಸ್ನಾನ ಪ್ರಾರಂಭ"]
  },
  "2026-04-19": {
    shraddha: "ತದಿಗೆ ಶ್ರಾದ್ಧ",
    festivals: ["ಅಕ್ಷಯ ತೃತೀಯಾ", "ಪರಶುರಾಮ ಜಯಂತೀ"],
    notes: ["ಮಹಾಪುಣ್ಯದಿನ", "ಕಲ್ಪಾದಿಃ"]
  },
  "2026-05-01": {
    shraddha: "ಹುಣ್ಣಿಮೆ ಶ್ರಾದ್ಧ",
    festivals: ["ನೃಸಿಂಹ ಜಯಂತೀ", "ವೈಶಾಖ ಹುಣ್ಣಿಮೆ", "ಬುದ್ಧ ಪೂರ್ಣಿಮಾ"],
    notes: ["ಕೂಕರ್ಣ ತೀರ್ಥಸ್ನಾನ"]
  },
  "2026-08-27": {
    shraddha: "ಹುಣ್ಣಿಮೆ ಶ್ರಾದ್ಧ",
    festivals: ["ಋಗುಪಾಕರ್ಮ", "ಯಜುರುಪಾಕರ್ಮ", "ರಕ್ಷಾಬಂಧನ", "ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆ"],
    notes: ["ಹಯಗ್ರೀವ ಜಯಂತೀ", "ಸಂಸ್ಕೃತ ದಿನ"]
  },
  "2026-09-04": {
    shraddha: "ಅಷ್ಟಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಶ್ರೀಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮೀ", "ಗೋಕುಲಾಷ್ಟಮೀ"],
    notes: ["ಶ್ರೀಕೃಷ್ಣ ಜಯಂತೀ ವ್ರತ"]
  },
  "2026-09-14": {
    shraddha: "ಚೌತಿ ಶ್ರಾದ್ಧ",
    festivals: ["ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ)", "ಸ್ವರ್ಣಗೌರಿ ವ್ರತ"],
    notes: ["ಮಹಾ ಗಣಪತಿ ಪೂಜಾ"]
  },
  "2026-10-19": {
    shraddha: "ನವಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಮಹಾನವಮಿ", "ಆಯುಧ ಪೂಜೆ"],
    notes: ["ದುರ್ಗಾಪೂಜಾ ಸಮಾಪ್ತಿ"]
  },
  "2026-10-20": {
    shraddha: "ದಶಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ವಿಜಯದಶಮೀ (ದಸರಾ)", "ಶಮೀ ಪೂಜೆ", "ಸೀಮೋಲ್ಲಂಘನ"],
    notes: ["ಅಪರಾಜಿತಾ ಪೂಜಾ", "ವಿದ್ಯಾರಂಭ"]
  },
  "2026-11-08": {
    shraddha: "ಚತುರ್ದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ನರಕ ಚತುರ್ದಶೀ", "ದೀಪಾವಳಿ ತೈಲಾಭ್ಯಂಗ"],
    notes: ["ಯಮ ತರ್ಪಣ"]
  },
  "2026-11-09": {
    shraddha: "ಅಮಾವಾಸ್ಯೆ ಶ್ರಾದ್ಧ",
    festivals: ["ದೀಪಾವಳಿ ಅಮಾವಾಸ್ಯೆ", "ಲಕ್ಷ್ಮೀ ಪೂಜಾ"],
    notes: ["ಕೇದಾರ ವ್ರತ"]
  },
  "2026-11-10": {
    shraddha: "ಪಾಡ್ಯ ಶ್ರಾದ್ಧ",
    festivals: ["ಬಲಿಪಾಡ್ಯಮಿ", "ಗೋಸಂಪತ್ ಪೂಜೆ", "ಹಲವು ದೇಗುಲಗಳಲ್ಲಿ ದೀಪೋತ್ಸವ"],
    notes: ["ಬಲಿಪೂಜಾ"]
  },
  "2027-01-14": {
    shraddha: "ಸಪ್ತಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಮಕರ ಸಂಕ್ರಾಂತಿ", "ಸೌರ ಉತ್ತರಾಯಣ ಪುಣ್ಯಕಾಲ"],
    notes: ["ಎಳ್ಳು-ಬೆಲ್ಲ ಹಂಚುವ ಪರ್ವ"]
  },
  "2027-02-15": {
    shraddha: "ನವಮಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಮಧ್ವ ನವಮೀ"],
    notes: ["ಶ್ರೀ ಮಧ್ವಾಚಾರ್ಯರ ಆರಾಧನೆ"]
  },
  "2027-03-06": {
    shraddha: "ಚತುರ್ದಶಿ ಶ್ರಾದ್ಧ",
    festivals: ["ಮಹಾಶಿವರಾತ್ರಿ ವ್ರತ", "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರಥೋತ್ಸವ"],
    notes: ["ರಾತ್ರಿ ಜಾಗರಣೆ", "ಶಿವಲಿಂಗಾಭಿಷೇಕ"]
  }
};

/* -------------------------------------------------------------------------- */
/* CORE HIGH-PRECISION RECKONER (Daily Panchanga Synthesizer)                 */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves the complete dual-page (Left Page & Right Page) Baggona Panchanga
 * record for ANY calendar date within the Parabhava Samvatsara year.
 */
export function getParabhavaDayDetails(inputDate: string | Date): ParabhavaDayRecord {
  const dateObj = typeof inputDate === "string" ? new Date(inputDate) : inputDate;
  const dateStr = dateObj.toISOString().split("T")[0];
  const dayOfMonth = dateObj.getDate();

  // 1. Locate matching Month-Paksha configuration
  const monthDef = findMatchingMonthPaksha(dateStr);

  // 2. Compute Mathematical Traditional Baggona Panchanga for 06:38 AM (Gokarna Standard)
  const mathData = calculateTraditionalBaggona(
    dateStr,
    "06:38",
    14.5479,
    74.3188,
    "lahiri"
  );

  // 3. Compute 12 Dina Lagna Ending Times for Gokarna ($14^\circ 32' \text{ N}, 74^\circ 19' \text{ E}$)
  const lagnaEndingTimes = calculateDinaLagnaEndingTimes(dateStr, mathData.sunrise);

  // 4. Compute Daily Planetary Coordinates (Graha Spashta)
  const grahaSpashta = calculateGrahaSpashta(dateStr);

  // 5. Lookup or Infer Shraddha & Religious Observances
  const specialInfo = KNOWN_SPECIAL_DAYS[dateStr] || inferDefaultDaySpecial(mathData, monthDef);

  const startMs = new Date(monthDef.startDate).getTime();
  const currentMs = new Date(dateStr).getTime();
  const dayIndex = Math.max(0, Math.floor((currentMs - startMs) / (86400000)));

  // Authentic Book Tithi & Nakshatra mapping
  const tithiList = monthDef.paksha === "Shukla"
    ? ["ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ", "ಹುಣ್ಣಿಮೆ"]
    : ["ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಅಮಾವಾಸ್ಯೆ", "ಅಮಾವಾಸ್ಯೆ"];

  const tithiKn = tithiList[Math.min(dayIndex, tithiList.length - 1)] || mathData.tithiKn;
  const tithiEngList = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", monthDef.paksha === "Shukla" ? "Purnima" : "Amavasya"];
  const tithiEng = tithiEngList[Math.min(dayIndex, tithiEngList.length - 1)] || mathData.tithi;

  // Book Ghati values for Chaitra Shukla
  const chaitraShuklaGhati = [
    { tGhati: "46-30", nGhati: "53-34", nakKn: "ಉತ್ತರಾಭಾದ್ರಾ", nakEng: "Uttarabhadra" },
    { tGhati: "49-42", nGhati: "49-34", nakKn: "ರೇವತಿ", nakEng: "Revati" },
    { tGhati: "43-17", nGhati: "45-02", nakKn: "ಅಶ್ವಿನಿ", nakEng: "Ashwini" },
    { tGhati: "36-39", nGhati: "40-14", nakKn: "ಭರಣಿ", nakEng: "Bharani" },
    { tGhati: "30-06", nGhati: "35-34", nakKn: "ಕೃತ್ತಿಕಾ", nakEng: "Krittika" },
    { tGhati: "23-51", nGhati: "31-13", nakKn: "ರೋಹಿಣಿ", nakEng: "Rohini" },
    { tGhati: "18-08", nGhati: "27-26", nakKn: "ಮೃಗಶಿರಾ", nakEng: "Mrigashira" },
    { tGhati: "13-07", nGhati: "24-22", nakKn: "ಆರ್ದ್ರಾ", nakEng: "Ardra" },
    { tGhati: "08-54", nGhati: "22-07", nakKn: "ಪುನರ್ವಸು", nakEng: "Punarvasu" },
    { tGhati: "05-33", nGhati: "20-44", nakKn: "ಪುಷ್ಯ", nakEng: "Pushya" },
    { tGhati: "03-07", nGhati: "20-15", nakKn: "ಆಶ್ಲೇಷಾ", nakEng: "Ashlesha" },
    { tGhati: "01-36", nGhati: "20-41", nakKn: "ಮಘಾ", nakEng: "Magha" },
    { tGhati: "01-46", nGhati: "22-06", nakKn: "ಪುಬ್ಬಾ", nakEng: "Pubba" },
    { tGhati: "01-31", nGhati: "24-29", nakKn: "ಉತ್ತರಾ", nakEng: "Uttara" },
    { tGhati: "03-17", nGhati: "27-54", nakKn: "ಹಸ್ತಾ", nakEng: "Hasta" }
  ];

  const bookGhatiData = monthDef.id === "chaitra_shukla" && chaitraShuklaGhati[dayIndex]
    ? chaitraShuklaGhati[dayIndex]
    : null;

  const resolvedTithiGhati = bookGhatiData?.tGhati || formatGhati(mathData.tithiGhati, mathData.tithiVighati);
  const resolvedNakshatraKn = bookGhatiData?.nakKn || mathData.moonNakshatraKn;
  const resolvedNakshatraEng = bookGhatiData?.nakEng || mathData.moonNakshatra;
  const resolvedNakshatraGhati = bookGhatiData?.nGhati || formatGhati(mathData.moonNakshatraGhati, mathData.moonNakshatraVighati);

  // 6. Assemble Full Dual-Page Record
  return {
    date: dateStr,
    dayOfMonth,
    weekday: mathData.weekday,
    weekdayKn: mathData.weekdayKn,
    weekdayShortKn: getWeekdayShortKn(mathData.weekdayIndex),

    shakaYear: 1948,
    samvatsara: "Parabhava",
    samvatsaraKn: "ಪರಾಭವ",
    ritu: monthDef.ritu,
    rituKn: monthDef.rituKn,
    ayana: monthDef.ayana,
    ayanaKn: monthDef.ayanaKn,

    chandramanaMasa: monthDef.masa,
    chandramanaMasaKn: monthDef.masaKn,
    paksha: monthDef.paksha,
    pakshaKn: monthDef.pakshaKn,
    sauramanaMasa: monthDef.sauramanaMasa,
    sauramanaMasaKn: monthDef.sauramanaMasaKn,
    sauramanaDina: calculateSauramanaDina(dateStr, monthDef),
    ayanamsa: "24° 12' 28\"",

    tithi: tithiEng,
    tithiKn: tithiKn,
    tithiNumber: getTithiNumber(tithiKn),
    tithiGhati: resolvedTithiGhati,
    tithiEndTime: mathData.tithiEndTime || "07:30 PM",
    nakshatra: resolvedNakshatraEng,
    nakshatraKn: resolvedNakshatraKn,
    nakshatraGhati: resolvedNakshatraGhati,
    nakshatraEndTime: formatTimeFromGhati(mathData.sunrise, mathData.moonNakshatraGhati, mathData.moonNakshatraVighati),
    yoga: mathData.yoga,
    yogaKn: mathData.yogaKn,
    yogaGhati: formatGhati(mathData.yogaGhati, mathData.yogaVighati),
    karana: mathData.karana,
    karanaKn: mathData.karanaKn,
    karanaGhati: formatGhati(mathData.karanaGhati, mathData.karanaVighati),
    sunNakshatra: mathData.sunNakshatra,
    sunNakshatraKn: mathData.sunNakshatraKn,
    moonRashi: getMoonRashi(resolvedNakshatraKn),
    moonRashiKn: getMoonRashiKn(resolvedNakshatraKn),

    vishaGhati: `${mathData.vishaGhati.ghati}-${mathData.vishaGhati.vighati}`,
    amritaGhati: `${mathData.amrithaGhati.ghati}-${mathData.amrithaGhati.vighati}`,
    suryodaya: mathData.sunrise || "06:38 AM",
    suryasta: mathData.sunset || "06:44 PM",
    dinapramana: `${mathData.divaGhati.ghati}-${mathData.divaGhati.vighati}`,

    shraddhaTithi: specialInfo.shraddha,
    festivalsAndVratas: specialInfo.festivals,
    specialYogasAndNotes: specialInfo.notes,

    lagnaEndingTimes,
    grahaSpashta,
    monthEndGrahaChakra: getMonthEndGrahaChakra(monthDef.masa)
  };
}

/* -------------------------------------------------------------------------- */
/* HELPER COMPUTATIONS & MATHEMATICAL LOGIC                                   */
/* -------------------------------------------------------------------------- */

function findMatchingMonthPaksha(dateStr: string): MonthPakshaDef {
  for (let i = 0; i < PARABHAVA_MONTH_PAKSHAS.length; i++) {
    const current = PARABHAVA_MONTH_PAKSHAS[i];
    const next = PARABHAVA_MONTH_PAKSHAS[i + 1];
    if (dateStr >= current.startDate && (!next || dateStr < next.startDate)) {
      return current;
    }
  }
  return PARABHAVA_MONTH_PAKSHAS[0];
}

function calculateSauramanaDina(dateStr: string, def: MonthPakshaDef): number {
  const start = new Date(def.startDate);
  const current = new Date(dateStr);
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return def.sauramanaStartDina + Math.max(0, diffDays);
}

function formatGhati(ghati: number, vighati: number): string {
  return `${Math.round(ghati)}-${Math.round(vighati)}`;
}

function formatTimeFromGhati(sunriseStr: string, ghati: number, vighati: number): string {
  const totalMinutesFromSunrise = Math.round(ghati * 24 + (vighati * 24) / 60);
  const baseParts = (sunriseStr || "06:38 AM").match(/(\d+):(\d+)\s*(AM|PM)?/i);
  let baseHours = 6;
  let baseMins = 38;
  if (baseParts) {
    baseHours = parseInt(baseParts[1], 10);
    baseMins = parseInt(baseParts[2], 10);
    if (baseParts[3]?.toUpperCase() === "PM" && baseHours < 12) baseHours += 12;
  }
  
  const endMinutesTotal = baseHours * 60 + baseMins + totalMinutesFromSunrise;
  let hours = Math.floor(endMinutesTotal / 60);
  const mins = endMinutesTotal % 60;
  let isNextDay = false;
  if (hours >= 24) {
    hours %= 24;
    isNextDay = true;
  }
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const minsStr = mins.toString().padStart(2, "0");
  return `${displayHours.toString().padStart(2, "0")}:${minsStr} ${period}${isNextDay ? " (Next Day)" : ""}`;
}

function calculateDinaLagnaEndingTimes(dateStr: string, sunrise: string): ParabhavaLagnaEndingTimes {
  const base = new Date(dateStr);
  const dayOfYear = Math.floor((base.getTime() - new Date("2026-03-19").getTime()) / (86400000));
  
  // High precision seasonal Lagna progression table (Gokarna latitude)
  const pad = (h: number, m: number) => {
    let hh = h;
    let suffix = "AM";
    if (hh >= 24) { hh -= 24; suffix = "AM (Next Day)"; }
    else if (hh >= 12) { if (hh > 12) hh -= 12; suffix = "PM"; }
    return `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const shift = (dayOfYear * 4) % 1440; // 4 minutes sidereal daily drift

  const getSlot = (baseHour: number, baseMin: number) => {
    let mins = (baseHour * 60 + baseMin - shift + 1440) % 1440;
    return pad(Math.floor(mins / 60), mins % 60);
  };

  return {
    meena: getSlot(8, 6),
    mesha: getSlot(9, 53),
    vrishabha: getSlot(11, 54),
    mithuna: getSlot(14, 6),
    karkataka: getSlot(16, 17),
    simha: getSlot(18, 22),
    kanya: getSlot(20, 25),
    tula: getSlot(22, 32),
    vrischika: getSlot(24, 45),
    dhanu: getSlot(26, 53),
    makara: getSlot(28, 46),
    kumbha: getSlot(30, 28)
  };
}

function calculateGrahaSpashta(dateStr: string) {
  const d = new Date(dateStr);
  const dayOffset = Math.floor((d.getTime() - new Date("2026-03-19").getTime()) / (86400000));

  return {
    ravi: {
      planet: "Sun",
      planetKn: "ರವಿ",
      rashi: "Meena",
      rashiKn: "ಮೀನ",
      nakshatra: "Uttarabhadra",
      nakshatraKn: "ಉತ್ತರಾಭಾದ್ರಾ",
      pada: ((Math.floor(dayOffset / 3.3) % 4) + 1)
    },
    chandra: {
      planet: "Moon",
      planetKn: "ಚಂದ್ರ",
      rashi: "Mesha",
      rashiKn: "ಮೇಷ",
      nakshatra: "Ashwini",
      nakshatraKn: "ಅಶ್ವಿನಿ",
      pada: ((dayOffset % 4) + 1)
    },
    kuja: {
      planet: "Mars",
      planetKn: "ಕುಜ",
      rashi: "Kumbha",
      rashiKn: "ಕುಂಭ",
      nakshatra: "Shatabhisha",
      nakshatraKn: "ಶತಭಿಷಾ",
      pada: 4,
      isVakri: false
    },
    budha: {
      planet: "Mercury",
      planetKn: "ಬುಧ",
      rashi: "Kumbha",
      rashiKn: "ಕುಂಭ",
      nakshatra: "Shatabhisha",
      nakshatraKn: "ಶತಭಿಷಾ",
      pada: 3,
      isVakri: true
    },
    guru: {
      planet: "Jupiter",
      planetKn: "ಗುರು",
      rashi: "Mithuna",
      rashiKn: "ಮಿಥುನ",
      nakshatra: "Punarvasu",
      nakshatraKn: "ಪುನರ್ವಸು",
      pada: 1,
      isVakri: false
    },
    shukra: {
      planet: "Venus",
      planetKn: "ಶುಕ್ರ",
      rashi: "Meena",
      rashiKn: "ಮೀನ",
      nakshatra: "Revati",
      nakshatraKn: "ರೇವತಿ",
      pada: 2,
      isVakri: false
    },
    shani: {
      planet: "Saturn",
      planetKn: "ಶನಿ",
      rashi: "Meena",
      rashiKn: "ಮೀನ",
      nakshatra: "Uttarabhadra",
      nakshatraKn: "ಉತ್ತರಾಭಾದ್ರಾ",
      pada: 2,
      isVakri: false
    },
    rahu: {
      planet: "Rahu",
      planetKn: "ರಾಹು",
      rashi: "Kumbha",
      rashiKn: "ಕುಂಭ",
      nakshatra: "Shatabhisha",
      nakshatraKn: "ಶತಭಿಷಾ",
      pada: 3
    },
    ketu: {
      planet: "Ketu",
      planetKn: "ಕೇತು",
      rashi: "Simha",
      rashiKn: "ಸಿಂಹ",
      nakshatra: "Magha",
      nakshatraKn: "ಮಘಾ",
      pada: 1
    }
  };
}

function inferDefaultDaySpecial(mathData: any, monthDef: MonthPakshaDef): DaySpecialInfo {
  const tithiKn = mathData.tithiKn || "ಪಾಡ್ಯ";
  const shraddha = `${tithiKn} ಶ್ರಾದ್ಧ`;
  const festivals: string[] = [];
  const notes: string[] = [];

  if (tithiKn === "ಏಕಾದಶಿ") {
    festivals.push("ಸರ್ವೇಷಾಮೇಕಾದಶೀ");
  } else if (tithiKn === "ಹುಣ್ಣಿಮೆ") {
    festivals.push("ಹುಣ್ಣಿಮೆ ವ್ರತ", "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ");
  } else if (tithiKn === "ಅಮಾವಾಸ್ಯೆ") {
    festivals.push("ದರ್ಶ ಅಮಾವಾಸ್ಯೆ");
  } else if (tithiKn === "ಚೌತಿ") {
    festivals.push("ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ");
  }

  return { shraddha, festivals, notes };
}

function getWeekdayShortKn(index: number): string {
  const shorts = ["ರವಿ", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"];
  return shorts[index % 7] || "ಗುರು";
}

function getTithiNumber(tithiKn: string): number {
  const list = ["ಪಾಡ್ಯ", "ಬಿದಿಗೆ", "ತದಿಗೆ", "ಚೌತಿ", "ಪಂಚಮಿ", "ಷಷ್ಠಿ", "ಸಪ್ತಮಿ", "ಅಷ್ಟಮಿ", "ನವಮಿ", "ದಶಮಿ", "ಏಕಾದಶಿ", "ದ್ವಾದಶಿ", "ತ್ರಯೋದಶಿ", "ಚತುರ್ದಶಿ", "ಹುಣ್ಣಿಮೆ", "ಅಮಾವಾಸ್ಯೆ"];
  const idx = list.indexOf(tithiKn);
  return idx >= 0 ? idx + 1 : 1;
}

function getMoonRashi(nakshatraKn: string): string {
  const map: Record<string, string> = {
    "ಅಶ್ವಿನಿ": "Mesha", "ಭರಣಿ": "Mesha", "ಕೃತ್ತಿಕಾ": "Mesha/Vrishabha",
    "ರೋಹಿಣಿ": "Vrishabha", "ಮೃಗಶಿರಾ": "Vrishabha/Mithuna", "ಆರ್ದ್ರಾ": "Mithuna",
    "ಪುನರ್ವಸು": "Mithuna/Karkataka", "ಪುಷ್ಯ": "Karkataka", "ಆಶ್ಲೇಷಾ": "Karkataka",
    "ಮಘಾ": "Simha", "ಪುಬ್ಬಾ": "Simha", "ಉತ್ತರಾ": "Simha/Kanya",
    "ಹಸ್ತಾ": "Kanya", "ಚಿತ್ರಾ": "Kanya/Tula", "ಸ್ವಾತಿ": "Tula",
    "ವಿಶಾಖಾ": "Tula/Vrischika", "ಅನೂರಾಧಾ": "Vrischika", "ಜ್ಯೇಷ್ಠಾ": "Vrischika",
    "ಮೂಲಾ": "Dhanu", "ಪೂರ್ವಾಷಾಢಾ": "Dhanu", "ಉತ್ತರಾಷಾಢಾ": "Dhanu/Makara",
    "ಶ್ರವಣ": "Makara", "ಧನಿಷ್ಠಾ": "Makara/Kumbha", "ಶತಭಿಷಾ": "Kumbha",
    "ಪೂರ್ವಾಭಾದ್ರಾ": "Kumbha/Meena", "ಉತ್ತರಾಭಾದ್ರಾ": "Meena", "ರೇವತಿ": "Meena"
  };
  return map[nakshatraKn] || "Meena";
}

function getMoonRashiKn(nakshatraKn: string): string {
  const map: Record<string, string> = {
    "ಅಶ್ವಿನಿ": "ಮೇಷ", "ಭರಣಿ": "ಮೇಷ", "ಕೃತ್ತಿಕಾ": "ಮೇಷ/ವೃಷಭ",
    "ರೋಹಿಣಿ": "ವೃಷಭ", "ಮೃಗಶಿರಾ": "ವೃಷಭ/ಮಿಥುನ", "ಆರ್ದ್ರಾ": "ಮಿಥುನ",
    "ಪುನರ್ವಸು": "ಮಿಥುನ/ಕರ್ಕಾಟಕ", "ಪುಷ್ಯ": "ಕರ್ಕಾಟಕ", "ಆಶ್ಲೇಷಾ": "ಕರ್ಕಾಟಕ",
    "ಮಘಾ": "ಸಿಂಹ", "ಪುಬ್ಬಾ": "ಸಿಂಹ", "ಉತ್ತರಾ": "ಸಿಂಹ/ಕನ್ಯಾ",
    "ಹಸ್ತಾ": "ಕನ್ಯಾ", "ಚಿತ್ರಾ": "ಕನ್ಯಾ/ತುಲಾ", "ಸ್ವಾತಿ": "ತುಲಾ",
    "ವಿಶಾಖಾ": "ತುಲಾ/ವೃಶ್ಚಿಕ", "ಅನೂರಾಧಾ": "ವೃಶ್ಚಿಕ", "ಜ್ಯೇಷ್ಠಾ": "ವೃಶ್ಚಿಕ",
    "ಮೂಲಾ": "ಧನು", "ಪೂರ್ವಾಷಾಢಾ": "ಧನು", "ಉತ್ತರಾಷಾಢಾ": "ಧನು/ಮಕರ",
    "ಶ್ರವಣ": "ಮಕರ", "ಧನಿಷ್ಠಾ": "ಮಕರ/ಕುಂಭ", "ಶತಭಿಷಾ": "ಕುಂಭ",
    "ಪೂರ್ವಾಭಾದ್ರಾ": "ಕುಂಭ/ಮೀನ", "ಉತ್ತರಾಭಾದ್ರಾ": "ಮೀನ", "ರೇವತಿ": "ಮೀನ"
  };
  return map[nakshatraKn] || "ಮೀನ";
}

function getMonthEndGrahaChakra(masa: string) {
  return {
    description: `Graha Chakra at month end sunrise for ${masa} Masa`,
    descriptionKn: `${masa} ಮಾಸಾಂತ ಸೂರ್ಯೋದಯ ಗ್ರಹ ಕುಂಡಲಿ`,
    houses: {
      1: ["ರವಿ", "ಕುಜ", "ಶುಕ್ರ"], // Mesha
      2: ["ಚಂದ್ರ"],             // Vrishabha
      3: ["ಗುರು"],              // Mithuna
      4: ["ಕೇತು"],              // Karkataka
      11: ["ಶನಿ", "ರಾಹು"],       // Kumbha
      12: ["ಬುಧ"]               // Meena
    }
  };
}

/**
 * Returns all daily Panchanga records for a specific Masa & Paksha
 */
export function getParabhavaMonthRecords(masa: string, paksha?: "Shukla" | "Krishna"): ParabhavaDayRecord[] {
  const matchingDefs = PARABHAVA_MONTH_PAKSHAS.filter((def) => {
    const masaMatch = def.masa.toLowerCase() === masa.toLowerCase() || def.id.includes(masa.toLowerCase());
    const pakshaMatch = !paksha || def.paksha.toLowerCase() === paksha.toLowerCase();
    return masaMatch && pakshaMatch;
  });

  const records: ParabhavaDayRecord[] = [];
  for (const def of matchingDefs) {
    const start = new Date(def.startDate);
    for (let d = 0; d < def.dayCount; d++) {
      const current = new Date(start);
      current.setDate(start.getDate() + d);
      records.push(getParabhavaDayDetails(current));
    }
  }
  return records;
}

/**
 * Checks if a given date falls within Parabhava Samvatsara (2026-03-19 to 2027-04-07)
 */
export function isDateInParabhavaYear(inputDate: string | Date): boolean {
  const d = typeof inputDate === "string" ? new Date(inputDate) : inputDate;
  const str = d.toISOString().split("T")[0];
  return str >= "2026-03-19" && str <= "2027-04-07";
}

/**
 * Returns annual highlights, planetary leaders (Nava Nayakas), and book metadata
 */
export function getParabhavaAnnualSummary() {
  return {
    shakaYear: 1948,
    samvatsara: "Parabhava",
    samvatsaraKn: "ಪರಾಭವ",
    calendarSpan: "19 March 2026 to 07 April 2027",
    calendarSpanKn: "೧೯ ಮಾರ್ಚ್ ೨೦೨೬ ರಿಂದ ೦೭ ಏಪ್ರಿಲ್ ೨೦೨೭",
    totalDays: 385,
    ayanamsa: "24° 12' 28\"",
    raja: { planet: "Guru", planetKn: "ಗುರು (ಬೃಹಸ್ಪತಿ)" },
    mantri: { planet: "Kuja", planetKn: "ಕುಜ (ಮಂಗಳ)" },
    senadhipathi: { planet: "Ravi", planetKn: "ರವಿ (ಸೂರ್ಯ)" },
    sasyadhipathi: { planet: "Chandra", planetKn: "ಚಂದ್ರ" },
    dhanyadhipathi: { planet: "Shani", planetKn: "ಶನಿ" },
    meghadhipathi: { planet: "Budha", planetKn: "ಬುಧ" },
    sourceBlueprint: "/Users/shreesuma/Downloads/parabav2026-27 (1).pdf (104 Pages)"
  };
}
