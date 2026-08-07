import { siderealLongitudes, getNakshatraStart, getNakshatraEnd, calculateNakshatra } from "../src/core/VedicCalculations";

const b = new Date("1995-09-21T11:20:00Z"); // Approx birth time
const nak = calculateNakshatra(b, 'lahiri');
console.log("Nakshatra at birth:", nak.nakshatraName);

const nStart = getNakshatraStart(b, 'lahiri');
console.log("Nakshatra Start:", nStart.toISOString());
// Let's print the Visha Ghati offset for this Nakshatra
const VISHA_GHATI_START = [
    50, 24, 30, 40, 14, 21, 30, 20, 32, // Ashwini to Ashlesha
    30, 20, 18, 22, 20, 14, 14, 10, 14, // Magha to Jyeshtha
    20, 24, 20, 10, 10, 18, 16, 24, 30  // Mula to Revati
];
console.log("Visha Ghati Offset:", VISHA_GHATI_START[nak.index]);
