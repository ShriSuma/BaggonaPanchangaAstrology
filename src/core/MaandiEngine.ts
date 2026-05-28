import type { PlaceSunTimes } from "./birthSunTimes";
import { vedicWeekdayAtBirth } from "./birthSunTimes";
import { calculateLocalSiderealTime, dateToJulianUt, degreeToRashi, getAyanamsa, normalizeDegree } from "./AstroMath";
import type { AyanamsaModel } from "./AstroTypes";
import { ascendantTropicalDegrees, meanObliquityDegrees } from "./EphemerisEngine";
import { formatClockAtPlace } from "./placeTime";

const MANDI_GHATI_DAY = [26, 22, 18, 14, 10, 6, 2]; // Sun=0, Mon=1...
const MANDI_GHATI_NIGHT = [10, 6, 2, 26, 22, 18, 14];

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

  let targetMs = 0;
  let wd = 0;
  const isNight = birthMs >= sunsetMs || birthMs < sunriseMs;

  if (isNight) {
    const dayMs = sunsetMs - sunriseMs;
    const nightMs = 24 * 60 * 60 * 1000 - dayMs;
    
    if (birthMs < sunriseMs) {
      // Night birth before sunrise (belongs to previous Hindu day)
      const prevDate = new Date(birthUtc.getTime() - 86_400_000);
      wd = vedicWeekdayAtBirth(prevDate, sunTimes.sunrise, latitude, longitude);
      const yesterdaySunsetMs = sunriseMs - nightMs;
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = yesterdaySunsetMs + (ghati / 30) * nightMs;
    } else {
      // Night birth after sunset
      wd = vedicWeekdayAtBirth(birthUtc, sunTimes.sunrise, latitude, longitude);
      const ghati = MANDI_GHATI_NIGHT[wd] ?? 14;
      targetMs = sunsetMs + (ghati / 30) * nightMs;
    }
  } else {
    // Daytime birth
    wd = vedicWeekdayAtBirth(birthUtc, sunTimes.sunrise, latitude, longitude);
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
    windowLabel
  };
};

