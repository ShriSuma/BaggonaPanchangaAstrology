import SunCalc from "suncalc";
import * as Astronomy from "astronomy-engine";
import { degreeToNakshatra, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel, PanchangOutput } from "./AstroTypes";
import { panchangClockTimeZone } from "./placeTime";
import { getTithiEnd } from "./VedicCalculations";

const TITHIS = [
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dvitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya"
];

const KN_TITHI: Record<string, string> = {
  Pratipada: "ಪ್ರತಿಪದೆ",
  Dvitiya: "ದ್ವಿತೀಯ",
  Tritiya: "ತೃತೀಯ",
  Chaturthi: "ಚತುರ್ಥಿ",
  Panchami: "ಪಂಚಮಿ",
  Shashthi: "ಷಷ್ಠಿ",
  Saptami: "ಸಪ್ತಮಿ",
  Ashtami: "ಅಷ್ಟಮಿ",
  Navami: "ನವಮಿ",
  Dashami: "ದಶಮಿ",
  Ekadashi: "ಏಕಾದಶಿ",
  Dwadashi: "ದ್ವಾದಶಿ",
  Trayodashi: "ತ್ರಯೋದಶಿ",
  Chaturdashi: "ಚತುರ್ದಶಿ",
  Purnima: "ಹುಣ್ಣಿಮೆ",
  Amavasya: "ಅಮಾವಾಸ್ಯೆ"
};

const YOGAS = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti"
];

const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
  "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

export type PanchangCalcOptions = {
  /** BCP 47 locale for numeric time formatting */
  locale?: string;
  /** IANA zone for sunrise/sunset labels (overrides auto when set) */
  clockTimeZone?: string;
  /** Indian PIN etc. — drives IST when postal lat/lng are missing */
  pincode?: string;
  /** Sidereal zero-point: default Drik Gaṇita (True Spica 180°). */
  ayanamsaModel?: AyanamsaModel;
};

export const calculatePanchang = (date: Date, lat: number, lng: number, opts?: PanchangCalcOptions): PanchangOutput => {
  const locale = opts?.locale ?? "en-IN";
  const clockTz = opts?.clockTimeZone ?? panchangClockTimeZone(lat, lng, opts?.pincode ?? "");
  const formatTime = (d?: Date): string =>
    d
      ? d.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: clockTz
        })
      : "--:--";

  const times = SunCalc.getTimes(date, lat, lng);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);

  // Evaluate today's Panchanga parameters at Sunrise of the day
  const evalDate = times.sunrise || date;
  const ayanamsa = getAyanamsa(evalDate, opts?.ayanamsaModel ?? "lahiri");

  const sunTropical = normalizeDegree(Astronomy.SunPosition(evalDate).elon);
  const moonTropical = normalizeDegree(Astronomy.EclipticGeoMoon(evalDate).lon);
  const sunLong = normalizeDegree(sunTropical - ayanamsa);
  const moonLong = normalizeDegree(moonTropical - ayanamsa);

  const tithiIdx = Math.floor(normalizeDegree(moonLong - sunLong) / 12) % 30;
  const yogaIdx = Math.floor(normalizeDegree(moonLong + sunLong) / (360 / 27)) % 27;

  // Accurate Karana calculation based on Sunrise elongation
  const halfTithiIdxSunrise = Math.floor(normalizeDegree(moonLong - sunLong) / 6) % 60;
  let karanaIdx = 0;
  if (halfTithiIdxSunrise === 0) {
    karanaIdx = 10; // Kintughna
  } else if (halfTithiIdxSunrise >= 1 && halfTithiIdxSunrise <= 56) {
    karanaIdx = (halfTithiIdxSunrise - 1) % 7; // Movable Karanas
  } else if (halfTithiIdxSunrise === 57) {
    karanaIdx = 7; // Shakuni
  } else if (halfTithiIdxSunrise === 58) {
    karanaIdx = 8; // Chatushpada
  } else {
    karanaIdx = 9; // Naga
  }

  const paksha = tithiIdx < 15 ? "Shukla" : "Krishna";
  const nakshatra = degreeToNakshatra(moonLong);

  // Calculate Tithi end time and Upari (thereafter) Tithi details
  const tithiEnd = getTithiEnd(evalDate, opts?.ayanamsaModel ?? "lahiri");
  const tithiEndTime = formatTime(tithiEnd);

  const nextTithiIdx = (tithiIdx + 1) % 30;
  const tithiNext = TITHIS[nextTithiIdx] ?? "";
  const tithiNextKn = KN_TITHI[tithiNext] ?? tithiNext;

  return {
    tithi: TITHIS[tithiIdx],
    tithiKn: KN_TITHI[TITHIS[tithiIdx]],
    nakshatra: nakshatra.english,
    yoga: YOGAS[yogaIdx],
    karana: KARANAS[karanaIdx],
    paksha,
    sunrise: formatTime(times.sunrise),
    sunset: formatTime(times.sunset),
    moonrise: formatTime(moonTimes.rise ?? undefined),
    tithiEndTime,
    tithiNext,
    tithiNextKn
  };
};
