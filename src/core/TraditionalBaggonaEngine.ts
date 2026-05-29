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
  { year: 1950, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1951, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1952, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1953, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1954, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1955, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1956, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1957, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1958, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1959, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1960, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1961, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1962, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1963, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1964, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1965, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1966, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1967, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1968, offsets: { moonOffset: -6.2135, sunNakOffset: 4.0062, tithiSunOffset: 13.1590, yogaSunOffset: 13.1975 } },
  { year: 1969, offsets: { moonOffset: -5.8144, sunNakOffset: 3.8676, tithiSunOffset: 12.5108, yogaSunOffset: 12.5694 } },
  { year: 1970, offsets: { moonOffset: -4.7747, sunNakOffset: 3.5066, tithiSunOffset: 10.8218, yogaSunOffset: 10.9329 } },
  { year: 1971, offsets: { moonOffset: -3.7349, sunNakOffset: 3.1456, tithiSunOffset: 9.1328, yogaSunOffset: 9.2964 } },
  { year: 1972, offsets: { moonOffset: -2.6951, sunNakOffset: 2.7845, tithiSunOffset: 7.4438, yogaSunOffset: 7.6598 } },
  { year: 1973, offsets: { moonOffset: -1.6553, sunNakOffset: 2.4235, tithiSunOffset: 5.7548, yogaSunOffset: 6.0233 } },
  { year: 1974, offsets: { moonOffset: -0.6155, sunNakOffset: 2.0624, tithiSunOffset: 4.0658, yogaSunOffset: 4.3868 } },
  { year: 1975, offsets: { moonOffset: 0.4242, sunNakOffset: 1.7014, tithiSunOffset: 2.3768, yogaSunOffset: 2.7503 } },
  { year: 1976, offsets: { moonOffset: 1.2011, sunNakOffset: 1.4307, tithiSunOffset: 1.2072, yogaSunOffset: 1.4869 } },
  { year: 1977, offsets: { moonOffset: 1.3244, sunNakOffset: 1.3847, tithiSunOffset: 1.3291, yogaSunOffset: 1.1517 } },
  { year: 1978, offsets: { moonOffset: 1.4476, sunNakOffset: 1.3388, tithiSunOffset: 1.4511, yogaSunOffset: 0.8164 } },
  { year: 1979, offsets: { moonOffset: 1.5708, sunNakOffset: 1.2928, tithiSunOffset: 1.5731, yogaSunOffset: 0.4812 } },
  { year: 1980, offsets: { moonOffset: 1.6941, sunNakOffset: 1.2468, tithiSunOffset: 1.6950, yogaSunOffset: 0.1459 } },
  { year: 1981, offsets: { moonOffset: 1.8173, sunNakOffset: 1.2008, tithiSunOffset: 1.8170, yogaSunOffset: -0.1894 } },
  { year: 1982, offsets: { moonOffset: 1.9405, sunNakOffset: 1.1548, tithiSunOffset: 1.9389, yogaSunOffset: -0.5246 } },
  { year: 1983, offsets: { moonOffset: 2.0637, sunNakOffset: 1.1089, tithiSunOffset: 2.0609, yogaSunOffset: -0.8599 } },
  { year: 1984, offsets: { moonOffset: 2.1870, sunNakOffset: 1.0629, tithiSunOffset: 2.1828, yogaSunOffset: -1.1951 } },
  { year: 1985, offsets: { moonOffset: 2.3102, sunNakOffset: 1.0169, tithiSunOffset: 2.3048, yogaSunOffset: -1.5304 } },
  { year: 1986, offsets: { moonOffset: 2.4334, sunNakOffset: 0.9709, tithiSunOffset: 2.4268, yogaSunOffset: -1.8657 } },
  { year: 1987, offsets: { moonOffset: 2.5567, sunNakOffset: 0.9250, tithiSunOffset: 2.5487, yogaSunOffset: -2.2009 } },
  { year: 1988, offsets: { moonOffset: 2.6799, sunNakOffset: 0.8790, tithiSunOffset: 2.6707, yogaSunOffset: -2.5362 } },
  { year: 1989, offsets: { moonOffset: 2.8031, sunNakOffset: 0.8330, tithiSunOffset: 2.7926, yogaSunOffset: -2.8714 } },
  { year: 1990, offsets: { moonOffset: 2.9264, sunNakOffset: 0.7870, tithiSunOffset: 2.9146, yogaSunOffset: -3.2067 } },
  { year: 1991, offsets: { moonOffset: 3.0496, sunNakOffset: 0.7410, tithiSunOffset: 3.0366, yogaSunOffset: -3.5420 } },
  { year: 1992, offsets: { moonOffset: 3.1728, sunNakOffset: 0.6951, tithiSunOffset: 3.1585, yogaSunOffset: -3.8772 } },
  { year: 1993, offsets: { moonOffset: 1.5166, sunNakOffset: 0.6700, tithiSunOffset: 1.8761, yogaSunOffset: -8.0831 } },
  { year: 1994, offsets: { moonOffset: 0.2737, sunNakOffset: 0.6959, tithiSunOffset: 0.9558, yogaSunOffset: -10.8946 } },
  { year: 1995, offsets: { moonOffset: 0.8254, sunNakOffset: 0.7401, tithiSunOffset: 1.4770, yogaSunOffset: -9.4534 } },
  { year: 1996, offsets: { moonOffset: 1.3772, sunNakOffset: 0.7842, tithiSunOffset: 1.9983, yogaSunOffset: -8.0122 } },
  { year: 1997, offsets: { moonOffset: 1.9289, sunNakOffset: 0.8284, tithiSunOffset: 2.5196, yogaSunOffset: -6.5710 } },
  { year: 1998, offsets: { moonOffset: 2.4807, sunNakOffset: 0.8725, tithiSunOffset: 3.0409, yogaSunOffset: -5.1298 } },
  { year: 1999, offsets: { moonOffset: 3.0325, sunNakOffset: 0.9167, tithiSunOffset: 3.5621, yogaSunOffset: -3.6885 } },
  { year: 2000, offsets: { moonOffset: 3.5842, sunNakOffset: 0.9608, tithiSunOffset: 4.0834, yogaSunOffset: -2.2473 } },
  { year: 2001, offsets: { moonOffset: 4.1360, sunNakOffset: 1.0050, tithiSunOffset: 4.6047, yogaSunOffset: -0.8061 } },
  { year: 2002, offsets: { moonOffset: 4.6877, sunNakOffset: 1.0491, tithiSunOffset: 5.1259, yogaSunOffset: 0.6351 } },
  { year: 2003, offsets: { moonOffset: 5.2395, sunNakOffset: 1.0933, tithiSunOffset: 5.6472, yogaSunOffset: 2.0763 } },
  { year: 2004, offsets: { moonOffset: 5.7913, sunNakOffset: 1.1374, tithiSunOffset: 6.1685, yogaSunOffset: 3.5175 } },
  { year: 2005, offsets: { moonOffset: 6.3430, sunNakOffset: 1.1816, tithiSunOffset: 6.6897, yogaSunOffset: 4.9587 } },
  { year: 2006, offsets: { moonOffset: 6.4435, sunNakOffset: 1.1694, tithiSunOffset: 6.4165, yogaSunOffset: 5.5004 } },
  { year: 2007, offsets: { moonOffset: 6.1993, sunNakOffset: 1.1142, tithiSunOffset: 5.5362, yogaSunOffset: 5.3548 } },
  { year: 2008, offsets: { moonOffset: 5.9550, sunNakOffset: 1.0590, tithiSunOffset: 4.6559, yogaSunOffset: 5.2093 } },
  { year: 2009, offsets: { moonOffset: 5.7107, sunNakOffset: 1.0037, tithiSunOffset: 3.7757, yogaSunOffset: 5.0637 } },
  { year: 2010, offsets: { moonOffset: 5.4665, sunNakOffset: 0.9485, tithiSunOffset: 2.8954, yogaSunOffset: 4.9181 } },
  { year: 2011, offsets: { moonOffset: 5.2222, sunNakOffset: 0.8933, tithiSunOffset: 2.0151, yogaSunOffset: 4.7726 } },
  { year: 2012, offsets: { moonOffset: 4.9779, sunNakOffset: 0.8381, tithiSunOffset: 1.1349, yogaSunOffset: 4.6270 } },
  { year: 2013, offsets: { moonOffset: 4.7337, sunNakOffset: 0.7829, tithiSunOffset: 0.2546, yogaSunOffset: 4.4815 } },
  { year: 2014, offsets: { moonOffset: 4.4894, sunNakOffset: 0.7276, tithiSunOffset: -0.6257, yogaSunOffset: 4.3359 } },
  { year: 2015, offsets: { moonOffset: 4.2451, sunNakOffset: 0.6724, tithiSunOffset: -1.5059, yogaSunOffset: 4.1903 } },
  { year: 2016, offsets: { moonOffset: 4.0009, sunNakOffset: 0.6172, tithiSunOffset: -2.3862, yogaSunOffset: 4.0448 } },
  { year: 2017, offsets: { moonOffset: 3.7566, sunNakOffset: 0.5620, tithiSunOffset: -3.2665, yogaSunOffset: 3.8992 } },
  { year: 2018, offsets: { moonOffset: 3.5123, sunNakOffset: 0.5068, tithiSunOffset: -4.1467, yogaSunOffset: 3.7537 } },
  { year: 2019, offsets: { moonOffset: 3.2681, sunNakOffset: 0.4515, tithiSunOffset: -5.0270, yogaSunOffset: 3.6081 } },
  { year: 2020, offsets: { moonOffset: 3.0238, sunNakOffset: 0.3963, tithiSunOffset: -5.9073, yogaSunOffset: 3.4625 } },
  { year: 2021, offsets: { moonOffset: 2.7796, sunNakOffset: 0.3411, tithiSunOffset: -6.7875, yogaSunOffset: 3.3170 } },
  { year: 2022, offsets: { moonOffset: 2.5353, sunNakOffset: 0.2859, tithiSunOffset: -7.6678, yogaSunOffset: 3.1714 } },
  { year: 2023, offsets: { moonOffset: 2.2910, sunNakOffset: 0.2307, tithiSunOffset: -8.5481, yogaSunOffset: 3.0259 } },
  { year: 2024, offsets: { moonOffset: 2.0468, sunNakOffset: 0.1754, tithiSunOffset: -9.4284, yogaSunOffset: 2.8803 } },
  { year: 2025, offsets: { moonOffset: 1.8025, sunNakOffset: 0.1202, tithiSunOffset: -10.3086, yogaSunOffset: 2.7347 } },
  { year: 2026, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2027, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2028, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2029, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2030, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2031, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2032, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2033, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2034, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2035, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2036, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2037, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2038, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2039, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2040, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2041, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2042, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2043, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2044, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2045, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2046, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2047, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2048, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2049, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
  { year: 2050, offsets: { moonOffset: 1.6927, sunNakOffset: 0.0954, tithiSunOffset: -10.7043, yogaSunOffset: 2.6693 } },
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
