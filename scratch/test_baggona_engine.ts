import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";

const result = calculateTraditionalBaggona("2005-06-12", "15:30", 14.0, 74.5);
console.log(JSON.stringify(result, null, 2));
