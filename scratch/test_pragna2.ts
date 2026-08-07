import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

const res = calculateTraditionalBaggona("1980-07-05", "12:44", 14.5479, 74.3187, "lahiri");
console.log(JSON.stringify(res, null, 2));
