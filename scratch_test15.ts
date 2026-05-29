import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";
import { resolveSunTimesForJyotish } from "./src/core/hinduSunTimes";

function findSunCrossing(startUtc: Date, targetDeg: number, searchForward: boolean): Date {
  const getSunLong = (d: Date) => normalizeDegree(siderealLongitudes(d, "lahiri").sun);
  const step = 6 * 60 * 60 * 1000; // 6 hours
  let current = startUtc;
  let prevLong = getSunLong(current);
  
  for (let i = 0; i < 100; i++) {
    const nextTime = new Date(current.getTime() + (searchForward ? step : -step));
    const nextLong = getSunLong(nextTime);
    
    let crossed = false;
    if (searchForward) {
      if (prevLong <= nextLong) {
        crossed = targetDeg >= prevLong && targetDeg <= nextLong;
      } else {
        crossed = targetDeg >= prevLong || targetDeg <= nextLong;
      }
    } else {
      if (prevLong >= nextLong) {
        crossed = targetDeg >= nextLong && targetDeg <= prevLong;
      } else {
        crossed = targetDeg >= nextLong || targetDeg <= prevLong;
      }
    }
    
    if (crossed) {
      let low = searchForward ? current.getTime() : nextTime.getTime();
      let high = searchForward ? nextTime.getTime() : current.getTime();
      for (let iter = 0; iter < 15; iter++) {
        const mid = (low + high) / 2;
        const midLong = getSunLong(new Date(mid));
        if (midLong >= targetDeg) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return new Date((low + high) / 2);
    }
    prevLong = nextLong;
    current = nextTime;
  }
  return startUtc;
}

function run() {
  // Pramod: birth 1993-05-31. Sun at birth was 45.95 degrees.
  // The transition into Rohini is when the Sun crossed 40 degrees.
  // Let's search backward from birthUtc to find when the Sun crossed 40 degrees!
  const birthUtc = wallClockBirthToUtc("1993-05-31", "09:25", 14.5479, 74.3187);
  const crossingTime = findSunCrossing(birthUtc, 40, false);
  console.log("Pramod Sun entry into Rohini UTC:", crossingTime.toISOString());
  console.log("Pramod Sun entry into Rohini Local:", crossingTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  // What is the Sunrise of THAT crossing day?
  const ymd = crossingTime.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const noonUtc = wallClockBirthToUtc(ymd, "12:00", 14.5479, 74.3187);
  const scTimes = SunCalc.getTimes(noonUtc, 14.5479, 74.3187);
  const jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, 14.5479, 74.3187);
  const sunriseUtc = jyotish.sunrise;
  console.log("Crossing Day Sunrise Local:", sunriseUtc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  const ms = crossingTime.getTime() - sunriseUtc.getTime();
  const totalVighati = Math.floor(ms / 24_000);
  const ghati = Math.floor(totalVighati / 60);
  const vighati = totalVighati % 60;
  console.log(`Sun entry into Rohini: ${ghati} Ghati ${vighati} Vighati on ${ymd}`);
  
  // Vidyashree: birth 1997-10-24. Sun at birth was 187.396 degrees.
  // The transition into Swati is when the Sun crossed 186.6666 degrees (186 degrees 40 minutes).
  const birthUtc2 = wallClockBirthToUtc("1997-10-24", "20:15", 14.5479, 74.3187);
  const crossingTime2 = findSunCrossing(birthUtc2, 186.6666667, false);
  console.log("\nVidyashree Sun entry into Swati UTC:", crossingTime2.toISOString());
  console.log("Vidyashree Sun entry into Swati Local:", crossingTime2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const ymd2 = crossingTime2.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const noonUtc2 = wallClockBirthToUtc(ymd2, "12:00", 14.5479, 74.3187);
  const scTimes2 = SunCalc.getTimes(noonUtc2, 14.5479, 74.3187);
  const jyotish2 = resolveSunTimesForJyotish({ sunrise: scTimes2.sunrise, sunset: scTimes2.sunset }, 14.5479, 74.3187);
  const sunriseUtc2 = jyotish2.sunrise;
  console.log("Crossing Day Sunrise 2 Local:", sunriseUtc2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const ms2 = crossingTime2.getTime() - sunriseUtc2.getTime();
  const totalVighati2 = Math.floor(ms2 / 24_000);
  const ghati2 = Math.floor(totalVighati2 / 60);
  const vighati2 = totalVighati2 % 60;
  console.log(`Sun entry into Swati: ${ghati2} Ghati ${vighati2} Vighati on ${ymd2}`);
}

run();
