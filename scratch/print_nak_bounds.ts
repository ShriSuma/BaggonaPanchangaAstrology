import { getAyanamsaModel } from "./src/core/AstroEngine";
import { getHinduSunTimes, getNakshatraStart, getNakshatraEnd } from "./src/core/EphemerisEngine";
import { siderealLongitudes } from "./src/core/AstroEngine";

const model = getAyanamsaModel("Lahiri");
const b = new Date(Date.UTC(1997, 9, 24, 14, 45)); 
const s = getHinduSunTimes(b, 14.5479, 74.3187).sunriseUtc;
console.log("Sunrise:", s.toISOString());

let st = new Date(s.getTime());
for(let i=0; i<3; i++) {
  const e = getNakshatraEnd(st, model);
  const start = getNakshatraStart(st, model);
  const n = Math.floor((siderealLongitudes(e, model, "mean").moon - 0.0001) / (360/27)) % 27;
  console.log(`Nak ${n}: start=${start.toISOString()}, end=${e.toISOString()}`);
  st = new Date(e.getTime() + 10000000);
}
