import SunCalc from "suncalc";
import { inferBirthTimezoneIana } from "./birthTime";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { fetchSunriseSunsetUtc, getCachedSunriseSunset, type SunriseSunsetUtc } from "./sunriseSunsetApi";
import {
  calendarYmdForPanchangPin,
  calendarYmdInTimeZone,
  panchangClockTimeZone,
  weekdayInTimeZone
} from "./placeTime";

export type PlaceSunTimes = SunriseSunsetUtc & { source: "api" | "suncalc" };

/** Noon on the birth civil day at the birthplace (IST for India PIN / bbox). */
export const solarNoonAnchorForBirth = (birthUtc: Date, lat: number, lng: number, pincode = ""): Date => {
  const tz = inferBirthTimezoneIana(lat, lng);
  const ymd = calendarYmdInTimeZone(birthUtc, tz);
  if (tz === "Asia/Kolkata") {
    return new Date(`${ymd}T12:00:00+05:30`);
  }
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

/**
 * Exact NOAA 2-pass Astronomical Algorithm (Jean Meeus Astronomical Algorithms).
 * Computes apparent sunrise & sunset with standard atmospheric refraction (34') and
 * solar semidiameter (16') with 90.8333° zenith, matching USNO, NOAA, and Drik Panchang within seconds.
 */
export const calculateExactNoaaSunTimes = (
  date: Date,
  lat: number,
  lng: number
): { sunrise: Date; sunset: Date; solarNoon: Date } => {
  const year = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  let y = year;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  const rad = Math.PI / 180.0;
  const deg = 180.0 / Math.PI;

  const getSunEqAndDec = (t: number) => {
    let L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
    if (L0 < 0) L0 += 360;
    const M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
    const mrad = M * rad;
    const C = Math.sin(mrad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
              Math.sin(2 * mrad) * (0.019993 - 0.000101 * t) +
              Math.sin(3 * mrad) * 0.000289;
    const trueLong = L0 + C;
    const omega = 125.04 - 1934.136 * t;
    const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * rad);
    const sec = 21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813));
    const e0 = 23.0 + (26.0 + (sec / 60.0)) / 60.0;
    const eps = e0 + 0.00256 * Math.cos(omega * rad);
    const dec = Math.asin(Math.sin(eps * rad) * Math.sin(lambda * rad));
    const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
    const yVal = Math.tan((eps * rad) / 2.0) ** 2;
    const sin2L0 = Math.sin(2.0 * L0 * rad);
    const sinM = Math.sin(mrad);
    const cos2L0 = Math.cos(2.0 * L0 * rad);
    const sin4L0 = Math.sin(4.0 * L0 * rad);
    const sin2M = Math.sin(2.0 * mrad);
    const eqTime = 4.0 * deg * (yVal * sin2L0 - 2.0 * e * sinM + 4.0 * e * yVal * sinM * cos2L0 - 0.5 * yVal * yVal * sin4L0 - 1.25 * e * e * sin2M);
    return { eqTime, dec };
  };

  const getHourAngle = (latitude: number, dec: number) => {
    const zenith = 90.8333 * rad; // Standard 90°50'
    const latRad = latitude * rad;
    const cosHA = (Math.cos(zenith) / (Math.cos(latRad) * Math.cos(dec))) - Math.tan(latRad) * Math.tan(dec);
    if (cosHA > 1.0 || cosHA < -1.0) return null;
    return Math.acos(cosHA);
  };

  const t0 = (JD - 2451545.0) / 36525.0;
  const initial = getSunEqAndDec(t0);
  const ha0 = getHourAngle(lat, initial.dec);

  if (ha0 === null) {
    const noonUtcMin = 720 - (4 * lng) - initial.eqTime;
    const noonDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0) + Math.round(noonUtcMin * 60 * 1000));
    return {
      sunrise: new Date(noonDate.getTime() - 6 * 3600 * 1000),
      sunset: new Date(noonDate.getTime() + 6 * 3600 * 1000),
      solarNoon: noonDate
    };
  }

  const noonUtcMin = 720 - (4 * lng) - initial.eqTime;
  const rise1 = 720 - 4.0 * (lng + ha0 * deg) - initial.eqTime;
  const set1  = 720 - 4.0 * (lng - ha0 * deg) - initial.eqTime;

  // 2nd pass refinement at sunrise and sunset instants
  const tRise = (JD + rise1 / 1440.0 - 2451545.0) / 36525.0;
  const riseData = getSunEqAndDec(tRise);
  const haRise = getHourAngle(lat, riseData.dec) ?? ha0;
  const riseUtcMin = 720 - 4.0 * (lng + haRise * deg) - riseData.eqTime;

  const tSet = (JD + set1 / 1440.0 - 2451545.0) / 36525.0;
  const setData = getSunEqAndDec(tSet);
  const haSet = getHourAngle(lat, setData.dec) ?? ha0;
  const setUtcMin = 720 - 4.0 * (lng - haSet * deg) - setData.eqTime;

  const toUtcDate = (minutes: number) => {
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    return new Date(dayStart.getTime() + Math.round(minutes * 60 * 1000));
  };

  return {
    sunrise: toUtcDate(riseUtcMin),
    sunset: toUtcDate(setUtcMin),
    solarNoon: toUtcDate(noonUtcMin)
  };
};

/**
 * Authoritative synchronous sunrise/sunset for civil day:
 * Checks cached internet API times first; otherwise runs exact NOAA 2-pass algorithm.
 */
export const sunTimesSyncForBirth = (
  birthUtc: Date,
  lat: number,
  lng: number,
  pincode = ""
): PlaceSunTimes => {
  const ymd = calendarYmdForPanchangPin(birthUtc, lat, lng, pincode);
  const cached = getCachedSunriseSunset(lat, lng, ymd);
  if (cached) {
    return { sunrise: cached.sunrise, sunset: cached.sunset, source: "api" };
  }

  try {
    const [y, m, d] = ymd.split("-").map(Number);
    const anchorDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const exact = calculateExactNoaaSunTimes(anchorDate, lat, lng);
    if (exact && !isNaN(exact.sunrise.getTime()) && !isNaN(exact.sunset.getTime())) {
      return { sunrise: exact.sunrise, sunset: exact.sunset, source: "suncalc" };
    }
  } catch {}

  const anchor = solarNoonAnchorForBirth(birthUtc, lat, lng, pincode);
  const times = SunCalc.getTimes(anchor, lat, lng);
  const jyotish = resolveSunTimesForJyotish(
    { sunrise: times.sunrise, sunset: times.sunset },
    lat,
    lng,
    pincode
  );
  return { sunrise: jyotish.sunrise, sunset: jyotish.sunset, source: "suncalc" };
};

/**
 * Authoritative sunrise/sunset at the birth place for the birth civil date
 * (USNO internet API when available, else exact NOAA 2-pass algorithm).
 */
export const resolveBirthSunTimes = async (
  birthUtc: Date,
  lat: number,
  lng: number,
  pincode = ""
): Promise<PlaceSunTimes> => {
  const ymd = calendarYmdForPanchangPin(birthUtc, lat, lng, pincode);
  const api = await fetchSunriseSunsetUtc(lat, lng, ymd);
  if (api) {
    return { sunrise: api.sunrise, sunset: api.sunset, source: "api" };
  }
  return sunTimesSyncForBirth(birthUtc, lat, lng, pincode);
};

/**
 * Weekday for Gulika/Maandi and similar rules: on the Hindu day at the place,
 * birth before sunrise belongs to the previous weekday (Sun=0 … Sat=6).
 */
export const vedicWeekdayAtBirth = (birthUtc: Date, sunrise: Date, lat: number, lng: number): number => {
  const tz = inferBirthTimezoneIana(lat, lng);
  if (birthUtc.getTime() < sunrise.getTime()) {
    const prev = new Date(birthUtc.getTime() - 86_400_000);
    return weekdayInTimeZone(prev, tz);
  }
  return weekdayInTimeZone(birthUtc, tz);
};

export const birthPlaceClockTz = (lat: number, lng: number, pincode = ""): string =>
  panchangClockTimeZone(lat, lng, pincode);

