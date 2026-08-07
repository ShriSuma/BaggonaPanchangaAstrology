import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

// Shamburu: 1995-09-21 (approx), Time: 11:20 AM
const res = calculateTraditionalBaggona("1995-09-21", "11:20", 14.5479, 74.3187, "lahiri");
console.log(JSON.stringify(res, null, 2));
