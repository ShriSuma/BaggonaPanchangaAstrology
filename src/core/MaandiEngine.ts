import type { PlaceSunTimes } from "./birthSunTimes";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import { calculateLocalSiderealTime, dateToJulianUt, degreeToRashi, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel } from "./AstroTypes";
import { ascendantTropicalDegrees, meanObliquityDegrees } from "./EphemerisEngine";
import { formatClockAtPlace } from "./placeTime";

/**
 * Weekday 0=Sun … 6=Sat → 1-based segment index (1..8) for Gulika/Maandi start after sunrise.
 * Sunday 7th eighth … Saturday 1st eighth.
 */
const GULIKA_START_SEGMENT: Record<number, number> = {
  0: 7, // Sun
  1: 6, // Mon
  2: 5, // Tue
  3: 4, // Wed
  4: 3, // Thu
  5: 2, // Fri
  6: 1  // Sat (Saturn's own day is first segment)
};

/**
 * Night-time segments (from sunset to sunrise).
 * Sunday night starts with 5th lord (Jupiter), Saturday is 4th.
 */
const GULIKA_START_SEGMENT_NIGHT: Record<number, number> = {
  0: 3, // Sun
  1: 2, // Mon
  2: 1, // Tue
  3: 7, // Wed
  4: 6, // Thu
  5: 5, // Fri
  6: 4  // Sat
};

export const computeMaandi = (
  birthUtc: Date,
  latitude: number,
  longitude: number,
  pincode = "",
  ayanamsaModel: AyanamsaModel = "lahiri",
  sunTimes?: PlaceSunTimes
): { degree: number; rashi: ReturnType<typeof degreeToRashi>; windowLabel: string } => {
  if (!sunTimes) {
    throw new Error("computeMaandi requires birthplace sunrise/sunset (resolveBirthSunTimes)");
  }

  const birthMs = birthUtc.getTime();
  const sunriseMs = sunTimes.sunrise.getTime();
  const sunsetMs = sunTimes.sunset.getTime();

  let startMs = 0;
  let segMs = 0;
  let wd = 0;

  if (birthMs >= sunsetMs) {
    // Night birth after sunset
    wd = vedicWeekdayAtBirth(birthUtc, sunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    const nightMs = 24 * 60 * 60 * 1000 - dayMs;
    segMs = nightMs / 8;
    const seg = GULIKA_START_SEGMENT_NIGHT[wd] ?? 1;
    startMs = sunsetMs + (seg - 1) * segMs;
  } else if (birthMs < sunriseMs) {
    // Night birth before sunrise (belongs to previous Hindu day)
    const prevDate = new Date(birthUtc.getTime() - 86_400_000);
    wd = vedicWeekdayAtBirth(prevDate, sunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    const nightMs = 24 * 60 * 60 * 1000 - dayMs;
    segMs = nightMs / 8;
    const seg = GULIKA_START_SEGMENT_NIGHT[wd] ?? 1;
    const yesterdaySunsetMs = sunriseMs - nightMs;
    startMs = yesterdaySunsetMs + (seg - 1) * segMs;
  } else {
    // Daytime birth
    wd = vedicWeekdayAtBirth(birthUtc, sunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    segMs = dayMs / 8;
    const seg = GULIKA_START_SEGMENT[wd] ?? 1;
    startMs = sunriseMs + (seg - 1) * segMs;
  }

  // Ascendant early in Gulika segment (≈0.8% offset for consistency with traditional tables)
  const maandiMs = startMs + segMs * 0.008;
  const mid = new Date(maandiMs);
  const jd = dateToJulianUt(mid);
  const lst = calculateLocalSiderealTime(mid, longitude);
  const eps = meanObliquityDegrees(jd);
  const ascTropical = ascendantTropicalDegrees(lst, latitude, eps);
  const ayan = getAyanamsa(mid, ayanamsaModel);
  const deg = normalizeDegree(ascTropical - ayan);

  const startClock = formatClockAtPlace(new Date(startMs), "en-IN", latitude, longitude, pincode);
  const endClock = formatClockAtPlace(new Date(startMs + segMs), "en-IN", latitude, longitude, pincode);

  return {
    degree: deg,
    rashi: degreeToRashi(deg),
    windowLabel: `${startClock}–${endClock}`
  };
};
