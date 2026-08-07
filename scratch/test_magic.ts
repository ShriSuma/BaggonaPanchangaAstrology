import { siderealLongitudes } from "./src/core/AstroEngine";
import { getHinduSunTimes } from "./src/core/EphemerisEngine";

const { calculateTraditionalBaggona } = require("./src/core/TraditionalBaggonaEngine");
const res = calculateTraditionalBaggona("1992-07-18", "03:36", 14.5479, 74.3187, "lahiri");
console.log(res.vishaGhati, res.amrithaGhati);
