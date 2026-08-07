import { siderealLongitudes } from "../src/core/TraditionalCalculations";
// Just brute force around the month
const d1 = new Date("1971-06-24T12:00:00Z");
console.log("1971-06-24 is", d1.getUTCDay()); // 4 = Thursday

const d2 = new Date("1993-10-15T12:00:00Z");
console.log("1993-10-15 is", d2.getUTCDay()); // 5 = Friday

