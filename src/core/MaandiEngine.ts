import type { PlaceSunTimes } from "./birthSunTimes";
import { calculateExactNoaaSunTimes, sunTimesSyncForBirth, vedicWeekdayAtBirth } from "./birthSunTimes";
import { resolveSunTimesForJyotish } from "./hinduSunTimes";
import { calculateLocalSiderealTime, dateToJulianUt, degreeToRashi, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel } from "./AstroTypes";
import { ascendantTropicalDegrees, meanObliquityDegrees } from "./EphemerisEngine";
import { formatClockAtPlace } from "./placeTime";
import { patrikaNavamshaFromDegree } from "./localeNumbers";

const MANDI_GHATI_DAY = [26, 22, 18, 14, 10, 6, 2]; // Sun=0, Mon=1...
const MANDI_GHATI_NIGHT = [10, 6, 2, 26, 22, 18, 14];

export const computeMaandi = (
  birthUtc: Date,
  latitude: number,
  longitude: number,
  pincode = "",
  ayanamsaModel: AyanamsaModel = "lahiri",
  sunTimes?: PlaceSunTimes
): {
  degree: number;
  rashi: ReturnType<typeof degreeToRashi>;
  navamsha: number;
  windowLabel: string;
} => {
  const actualSunTimes = sunTimes ?? sunTimesSyncForBirth(birthUtc, latitude, longitude, pincode);

  const birthMs = birthUtc.getTime();
  const sunriseMs = actualSunTimes.sunrise.getTime();
  const sunsetMs = actualSunTimes.sunset.getTime();

  let targetMs = 0;
  let wd = 0;
  const isNight = birthMs >= sunsetMs || birthMs < sunriseMs;

  if (isNight) {
    if (birthMs < sunriseMs) {
      // Night birth before sunrise (belongs to previous Hindu day).
      // vedicWeekdayAtBirth automatically detects birthUtc < sunrise and steps back 24h.
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const yesterdayDate = new Date(birthUtc.getTime() - 86_400_000);
      const yesterdayNoaa = calculateExactNoaaSunTimes(yesterdayDate, latitude, longitude);
      const yesterdaySun = resolveSunTimesForJyotish(yesterdayNoaa, latitude, longitude, pincode);
      const yesterdaySunsetMs = yesterdaySun.sunset.getTime();
      
      const nightMs = sunriseMs - yesterdaySunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = yesterdaySunsetMs + (ghati / 30) * nightMs;
    } else {
      // Night birth after sunset (belongs to today's Hindu day).
      wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
      
      const tomorrowDate = new Date(birthUtc.getTime() + 86_400_000);
      const tomorrowNoaa = calculateExactNoaaSunTimes(tomorrowDate, latitude, longitude);
      const tomorrowSun = resolveSunTimesForJyotish(tomorrowNoaa, latitude, longitude, pincode);
      const tomorrowSunriseMs = tomorrowSun.sunrise.getTime();
      
      const nightMs = tomorrowSunriseMs - sunsetMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = sunsetMs + (ghati / 30) * nightMs;
    }
  } else {
    // Daytime birth
    wd = vedicWeekdayAtBirth(birthUtc, actualSunTimes.sunrise, latitude, longitude);
    const dayMs = sunsetMs - sunriseMs;
    const ghati = MANDI_GHATI_DAY[wd] ?? 14;
    targetMs = sunriseMs + (ghati / 30) * dayMs;
  }

  const mid = new Date(targetMs);
  const jd = dateToJulianUt(mid);
  const lst = calculateLocalSiderealTime(mid, longitude);
  const eps = meanObliquityDegrees(jd);
  const ascTropical = ascendantTropicalDegrees(lst, latitude, eps);
  const ayan = getAyanamsa(mid, ayanamsaModel);
  const deg = normalizeDegree(ascTropical - ayan);

  const clockTime = formatClockAtPlace(mid, "en-IN", latitude, longitude, pincode);
  const ghatiVal = isNight ? MANDI_GHATI_NIGHT[wd] : MANDI_GHATI_DAY[wd];
  const windowLabel = `${ghatiVal} Gh (${clockTime})`;

  return {
    degree: deg,
    rashi: degreeToRashi(deg),
    navamsha: patrikaNavamshaFromDegree(deg),
    windowLabel
  };
};

