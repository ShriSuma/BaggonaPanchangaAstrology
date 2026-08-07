import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

const res = calculateTraditionalBaggona("2007-03-20", "15:30", 14.5479, 74.3187, "lahiri");
console.log(JSON.stringify(res, null, 2));
