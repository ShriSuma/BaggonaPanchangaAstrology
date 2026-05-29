import { calculateTraditionalBaggona } from "./src/core/TraditionalBaggonaEngine";
const res = calculateTraditionalBaggona("1993-05-31", "06:00", 14.55, 74.318);
console.log(res.yoga, res.yogaGhati, res.yogaVighati);
