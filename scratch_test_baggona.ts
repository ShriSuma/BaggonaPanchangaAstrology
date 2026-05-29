import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";

console.log("=== PRAMOD ===");
console.log(JSON.stringify(calculateTraditionalBaggona("1993-05-31", "09:25", 14.5479, 74.3187, "lahiri"), null, 2));

console.log("=== VIDYASHREE ===");
console.log(JSON.stringify(calculateTraditionalBaggona("1997-10-24", "20:15", 14.5479, 74.3187, "lahiri"), null, 2));
