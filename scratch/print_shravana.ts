import { getAyanamsaModel } from "./src/core/AstroEngine";
import { getHinduSunTimes, getNakshatraStart, getNakshatraEnd } from "./src/core/EphemerisEngine";
import { siderealLongitudes } from "./src/core/AstroEngine";

// Using require to bypass ts-node module resolution issues with vitest config
const { calculateTraditionalBaggona } = require("./src/core/TraditionalBaggonaEngine");
const res = calculateTraditionalBaggona("1992-07-18", "03:36", 14.5479, 74.3187, "lahiri");
console.log("Sun Nakshatra:", res.sunNakshatra);
console.log("Moon Nakshatra:", res.moonNakshatra);
