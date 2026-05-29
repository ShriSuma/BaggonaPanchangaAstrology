import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";
import {
  getTithiEnd,
  getNakshatraEnd,
  getYogaEnd,
  getKaranaEnd,
  getSunNakshatraEnd
} from "./src/core/VedicCalculations";

function getEndGhati(endTime: Date, sunriseUtc: Date): { ghati: number; vighati: number } {
  const ms = endTime.getTime() - sunriseUtc.getTime();
  const totalVighati = Math.floor(ms / 24_000);
  return {
    ghati: Math.max(0, Math.floor(totalVighati / 60)),
    vighati: Math.max(0, totalVighati % 60)
  };
}

function run(birthDate: string, birthTime: string, lat: number, lon: number) {
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
  const noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lon);
  const scTimes = SunCalc.getTimes(noonUtc, lat, lon);
  const sunriseUtc = scTimes.sunrise;
  
  console.log(`\n=================== ${birthDate} ${birthTime} ===================`);
  
  // Search from sunriseUtc instead of birthUtc
  const tEnd = getTithiEnd(sunriseUtc, "lahiri");
  const nEnd = getNakshatraEnd(sunriseUtc, "lahiri");
  const yEnd = getYogaEnd(sunriseUtc, "lahiri");
  const kEnd = getKaranaEnd(sunriseUtc, "lahiri");
  const sEnd = getSunNakshatraEnd(sunriseUtc, "lahiri");
  
  console.log("Tithi End Ghati:", getEndGhati(tEnd, sunriseUtc));
  console.log("Nakshatra End Ghati:", getEndGhati(nEnd, sunriseUtc));
  console.log("Yoga End Ghati:", getEndGhati(yEnd, sunriseUtc));
  console.log("Karana End Ghati:", getEndGhati(kEnd, sunriseUtc));
  console.log("Sun Nakshatra End Ghati:", getEndGhati(sEnd, sunriseUtc));
}

run("1993-05-31", "09:25", 14.5479, 74.3187);
run("1997-10-24", "20:15", 14.5479, 74.3187);
