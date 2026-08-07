import { siderealLongitudes, getNakshatraStart, getNakshatraEnd } from "../src/core/VedicCalculations";
import { getAmrithaGhatiFromVisha } from "../src/core/VedicCalculations";

const VISHA_GHATI_START = [
    50, 24, 30, 40, 14, 21, 30, 20, 32, // Ashwini to Ashlesha
    30, 20, 18, 22, 20, 14, 14, 10, 14, // Magha to Jyeshtha
    20, 24, 20, 10, 10, 18, 16, 24, 30  // Mula to Revati
];

function checkVisha(dateStr: string) {
  console.log(`\n--- Date: ${dateStr} ---`);
  const b = new Date(`${dateStr}T12:00:00Z`); // noon
  // get nakshatra at beginning of day (approx 00:00 UTC)
  
  const bStart = new Date(b.getTime() - 24 * 3600 * 1000);
  const nStart = getNakshatraStart(b, 'lahiri');
  
  console.log("Nakshatra Start:", nStart.toISOString());
  
  // We can just use the sidereal longitude to find exact nakshatra periods.
}
