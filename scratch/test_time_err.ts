import { wallClockBirthToUtc } from "../src/core/birthTime";
import { siderealLongitudes } from "../src/core/EphemerisEngine";

const d = wallClockBirthToUtc("1993-05-31", "", 12.9, 77.5);
console.log(d);
try {
  siderealLongitudes(d, "lahiri");
} catch(e) {
  console.log("ERR:", e);
}
