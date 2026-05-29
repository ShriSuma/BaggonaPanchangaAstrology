import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";
const t = calculateTraditionalBaggona("1993-05-31", "09:25", 14.5479, 74.3187, "lahiri");
console.log(JSON.stringify(t, null, 2));
