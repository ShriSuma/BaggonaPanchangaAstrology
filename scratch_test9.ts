import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { normalizeDegree } from "./src/core/AstroMath";
import { getNakshatraStart, getNakshatraEnd } from "./src/core/VedicCalculations";

const toGhatiVighati = (ms: number) => {
  const totalVighati = Math.floor(ms / 24_000);
  return {
    ghati: Math.floor(totalVighati / 60),
    vighati: totalVighati % 60
  };
};

function run(birthDate: string, birthTime: string, lat: number, lon: number) {
  const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
  const noonUtc = wallClockBirthToUtc(birthDate, "12:00", lat, lon);
  const scTimes = SunCalc.getTimes(noonUtc, lat, lon);
  const sunriseUtc = scTimes.sunrise;
  
  const nakStart = getNakshatraStart(birthUtc, "lahiri");
  const nakEnd = getNakshatraEnd(birthUtc, "lahiri");
  
  const durationMs = nakEnd.getTime() - nakStart.getTime();
  const elapsedMs = birthUtc.getTime() - nakStart.getTime();
  const remainingMs = nakEnd.getTime() - birthUtc.getTime();
  
  console.log(`\n=================== ${birthDate} ${birthTime} ===================`);
  console.log("Nakshatra Start UTC:", nakStart.toISOString());
  console.log("Nakshatra End UTC:", nakEnd.toISOString());
  console.log("Birth UTC:", birthUtc.toISOString());
  
  console.log("Parama Ghati:", toGhatiVighati(durationMs));
  console.log("Ghatadina:", toGhatiVighati(elapsedMs));
  console.log("Ashaya Ghati:", toGhatiVighati(remainingMs));
  
  const elapsedSunriseMs = birthUtc.getTime() - sunriseUtc.getTime();
  console.log("Suryodhayadgata:", toGhatiVighati(elapsedSunriseMs));
}

run("1993-05-31", "09:25", 14.5479, 74.3187);
run("1997-10-24", "20:15", 14.5479, 74.3187);
