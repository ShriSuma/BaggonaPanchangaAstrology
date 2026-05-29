import { wallClockBirthToUtc } from "./src/core/birthTime";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";

function run() {
  const birthUtc = wallClockBirthToUtc("1993-05-31", "09:25", 14.5479, 74.3187);
  const sunriseUtc = wallClockBirthToUtc("1993-05-31", "06:06", 14.5479, 74.3187);
  
  const moonSunrise = normalizeDegree(siderealLongitudes(sunriseUtc, "lahiri").moon);
  const moonNextSunrise = normalizeDegree(siderealLongitudes(new Date(sunriseUtc.getTime() + 24 * 60 * 60 * 1000), "lahiri").moon);
  const dailyMotion = normalizeDegree(moonNextSunrise - moonSunrise);
  
  const nakIdx = Math.floor(moonSunrise / (360 / 27));
  const nakEndDeg = (nakIdx + 1) * (360 / 27);
  
  let dist = nakEndDeg - moonSunrise;
  if (dist < 0) dist += 360;
  
  const ghatiFloat = dist * 60 / dailyMotion;
  const ghati = Math.floor(ghatiFloat);
  const vighati = Math.floor((ghatiFloat - ghati) * 60);
  
  console.log("Pramod Moon Sunrise exact:", moonSunrise);
  console.log("Pramod Daily Motion exact:", dailyMotion);
  console.log(`Pramod Moon Nakshatra End exact: ${ghati} Ghati ${vighati} Vighati`);
  
  // Vidyashree:
  const sunriseUtc2 = wallClockBirthToUtc("1997-10-24", "06:27", 14.5479, 74.3187);
  const moonSunrise2 = normalizeDegree(siderealLongitudes(sunriseUtc2, "lahiri").moon);
  const moonNextSunrise2 = normalizeDegree(siderealLongitudes(new Date(sunriseUtc2.getTime() + 24 * 60 * 60 * 1000), "lahiri").moon);
  const dailyMotion2 = normalizeDegree(moonNextSunrise2 - moonSunrise2);
  
  const nakIdx2 = Math.floor(moonSunrise2 / (360 / 27));
  const nakEndDeg2 = (nakIdx2 + 1) * (360 / 27);
  
  let dist2 = nakEndDeg2 - moonSunrise2;
  if (dist2 < 0) dist2 += 360;
  
  const ghatiFloat2 = dist2 * 60 / dailyMotion2;
  const ghati2 = Math.floor(ghatiFloat2);
  const vighati2 = Math.floor((ghatiFloat2 - ghati2) * 60);
  
  console.log("\nVidyashree Moon Sunrise exact:", moonSunrise2);
  console.log("Vidyashree Daily Motion exact:", dailyMotion2);
  console.log(`Vidyashree Moon Nakshatra End exact: ${ghati2} Ghati ${vighati2} Vighati`);
}

run();
