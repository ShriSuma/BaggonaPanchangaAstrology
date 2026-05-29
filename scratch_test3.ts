import { wallClockBirthToUtc } from "./src/core/birthTime";
import { siderealLongitudes } from "./src/core/EphemerisEngine";
import { degreeToRashi, normalizeDegree } from "./src/core/AstroMath";

const birthDate = "1997-10-24";
const birthTime = "20:15";
const lat = 14.5479;
const lon = 74.3187;

const birthUtc = wallClockBirthToUtc(birthDate, birthTime, lat, lon);
const longs = siderealLongitudes(birthUtc, "lahiri");
const moonLong = normalizeDegree(longs.moon);
const nakIdx = Math.floor(moonLong / (360 / 27));

console.log("Birth UTC:", birthUtc.toISOString());
console.log("Moon Longitude:", moonLong);
console.log("Nakshatra Index at Birth:", nakIdx);
