import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";
import { getSunNakshatraEnd } from "./src/core/VedicCalculations";
import { resolveSunTimesForJyotish } from "./src/core/hinduSunTimes";

function run() {
  const birthUtc = wallClockBirthToUtc("1993-05-31", "09:25", 14.5479, 74.3187);
  
  // getSunNakshatraEnd searches forward for the Sun crossing the next Nakshatra boundary
  const sunEndUtc = getSunNakshatraEnd(birthUtc, "lahiri");
  console.log("Sun Nakshatra End UTC:", sunEndUtc.toISOString());
  console.log("Sun Nakshatra End Local (IST):", sunEndUtc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  // Find Sunrise of THAT day:
  // Convert sunEndUtc to YMD in Asia/Kolkata
  const ymd = sunEndUtc.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const noonUtc = wallClockBirthToUtc(ymd, "12:00", 14.5479, 74.3187);
  const scTimes = SunCalc.getTimes(noonUtc, 14.5479, 74.3187);
  const jyotish = resolveSunTimesForJyotish({ sunrise: scTimes.sunrise, sunset: scTimes.sunset }, 14.5479, 74.3187);
  const crossingSunriseUtc = jyotish.sunrise;
  
  console.log("Crossing Sunrise Local:", crossingSunriseUtc.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  
  const ms = sunEndUtc.getTime() - crossingSunriseUtc.getTime();
  const totalVighati = Math.floor(ms / 24_000);
  const ghati = Math.floor(totalVighati / 60);
  const vighati = totalVighati % 60;
  console.log(`Sun Nakshatra End since its crossing day sunrise: ${ghati} Ghati ${vighati} Vighati`);
  
  // Let's also do Vidyashree:
  const birthUtc2 = wallClockBirthToUtc("1997-10-24", "20:15", 14.5479, 74.3187);
  const sunEndUtc2 = getSunNakshatraEnd(birthUtc2, "lahiri");
  console.log("\nSun Nakshatra End 2 UTC:", sunEndUtc2.toISOString());
  console.log("Sun Nakshatra End 2 Local (IST):", sunEndUtc2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const ymd2 = sunEndUtc2.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const noonUtc2 = wallClockBirthToUtc(ymd2, "12:00", 14.5479, 74.3187);
  const scTimes2 = SunCalc.getTimes(noonUtc2, 14.5479, 74.3187);
  const jyotish2 = resolveSunTimesForJyotish({ sunrise: scTimes2.sunrise, sunset: scTimes2.sunset }, 14.5479, 74.3187);
  const crossingSunriseUtc2 = jyotish2.sunrise;
  console.log("Crossing Sunrise 2 Local:", crossingSunriseUtc2.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
  const ms2 = sunEndUtc2.getTime() - crossingSunriseUtc2.getTime();
  const totalVighati2 = Math.floor(ms2 / 24_000);
  const ghati2 = Math.floor(totalVighati2 / 60);
  const vighati2 = totalVighati2 % 60;
  console.log(`Sun Nakshatra End 2 since its crossing day sunrise: ${ghati2} Ghati ${vighati2} Vighati`);
}

run();
