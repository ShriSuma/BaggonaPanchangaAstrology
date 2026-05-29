import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";
import { wallClockBirthToUtc } from "./src/core/birthTime";
import SunCalc from "suncalc";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { getAyanamsa, degreeToRashi, normalizeDegree } from "./src/core/AstroMath";
import { getNakshatraStart, getNakshatraEnd } from "./src/core/VedicCalculations";

const birthDate = "1993-05-31";
const birthTime = "09:25";
const latitude = 14.5479;
const longitude = 74.3187;

const birthUtc = wallClockBirthToUtc(birthDate, birthTime, latitude, longitude);
const noonUtc = wallClockBirthToUtc(birthDate, "12:00", latitude, longitude);
const scTimes = SunCalc.getTimes(noonUtc, latitude, longitude);
const sunriseUtc = scTimes.sunrise;
const sunsetUtc = scTimes.sunset;

console.log("Sunrise UTC:", sunriseUtc.toISOString());
console.log("Sunset UTC:", sunsetUtc.toISOString());
console.log("Birth UTC:", birthUtc.toISOString());

const start = getNakshatraStart(birthUtc, "lahiri");
const end = getNakshatraEnd(birthUtc, "lahiri");
console.log("Nakshatra Start UTC:", start.toISOString());
console.log("Nakshatra End UTC:", end.toISOString());

const ms = end.getTime() - sunriseUtc.getTime();
console.log("Difference ms:", ms);
const totalVighati = Math.floor(ms / 24000);
console.log("Total Vighati:", totalVighati);
console.log("Ghati:", Math.floor(totalVighati / 60));
console.log("Vighati:", totalVighati % 60);
