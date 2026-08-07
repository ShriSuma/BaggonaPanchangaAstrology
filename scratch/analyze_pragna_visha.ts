import { siderealLongitudes, getNakshatraStart, getNakshatraEnd } from "../src/core/VedicCalculations";

const VISHA_GHATI_START = [
    50, 24, 30, 40, 14, 21, 30, 20, 32, // Ashwini to Ashlesha
    30, 20, 18, 22, 20, 14, 14, 10, 14, // Magha to Jyeshtha
    20, 24, 20, 10, 10, 18, 16, 24, 30  // Mula to Revati
];

const dateStr = "1980-07-05";
const b = new Date(`${dateStr}T06:12:00Z`); // around sunrise UTC
let searchTime = b;
for(let i=0; i<3; i++) {
    const end = getNakshatraEnd(searchTime, 'lahiri');
    const start = getNakshatraStart(searchTime, 'lahiri');
    const endDeg = siderealLongitudes(end, 'lahiri').moon;
    const nakIdx = Math.floor((endDeg - 0.0001) / (360 / 27)) % 27;
    const vOffset = VISHA_GHATI_START[nakIdx] ?? 20;
    console.log(`Nakshatra ${nakIdx}, Start: ${start.toISOString()}, End: ${end.toISOString()}, VOffset: ${vOffset}`);
    searchTime = new Date(end.getTime() + 2 * 3600 * 1000);
}
