import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
const res = calculateTraditionalBaggona("1995-09-21", "11:20", 14.5479, 74.3187, "lahiri");
console.log("Nakshatra", res.moonNakshatra);
console.log("Visha", res.vishaGhati);
console.log("Amrita", res.amrithaGhati);
