import { getVishaAndAmrithaGhati } from "./src/core/VedicCalculations";
import { getAyanamsaModel } from "./src/core/AstroEngine";
import { getHinduSunTimes, getNakshatraStart, getNakshatraEnd } from "./src/core/EphemerisEngine";
import { siderealLongitudes } from "./src/core/AstroEngine";

const birthUtcV = new Date(Date.UTC(1997, 9, 24, 14, 45)); 
const sV = getHinduSunTimes(birthUtcV, 14.5479, 74.3187).sunriseUtc;
const ayanamsaModel = getAyanamsaModel("Lahiri");

console.log("Sunrise:", sV.toISOString());

let searchTime = new Date(sV.getTime());
for (let i = 0; i < 3; i++) {
  const end = getNakshatraEnd(searchTime, ayanamsaModel);
  const start = getNakshatraStart(searchTime, ayanamsaModel);
  
  const endDeg = siderealLongitudes(end, ayanamsaModel, "mean").moon;
  const nakIdx = Math.floor((endDeg - 0.0001) / (360 / 27)) % 27;
  
  const vOffset = [50, 24, 30, 40, 14, 21, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 20, 24, 20, 10, 10, 18, 16, 24, 30][nakIdx];
  const aOffset = [42, 48, 54, 52, 38, 35, 54, 44, 56, 54, 44, 42, 45, 44, 38, 38, 34, 38, 44, 48, 44, 34, 34, 42, 40, 48, 54][nakIdx];

  const vTime = new Date(start.getTime() + vOffset * 1440000);
  const aTime = new Date(start.getTime() + aOffset * 1440000);
  
  console.log(`Nak ${nakIdx}: Start=${start.toISOString()} End=${end.toISOString()}`);
  console.log(`  vOffset=${vOffset} -> vTime=${vTime.toISOString()} (Valid? ${vTime >= sV})`);
  console.log(`  aOffset=${aOffset} -> aTime=${aTime.toISOString()} (Valid? ${aTime >= sV})`);
  
  searchTime = new Date(end.getTime() + 2 * 60 * 60 * 1000);
}
