import { generateKundli } from "./src/core/SwissEpheEngine";
import { generateTraditionalBaggonaPanchanga } from "./src/core/TraditionalBaggonaEngine";

const k = generateKundli({
  birthDate: "1993-05-31",
  birthTime: "09:25",
  latitude: 14.3,
  longitude: 74.4,
  name: "Pramod"
});
const p = generateTraditionalBaggonaPanchanga(
  "1993-05-31",
  "09:25",
  14.3,
  74.4,
  k,
  "lahiri"
);
console.log("Visha: ", p.vishaGhati);
console.log("Amritha: ", p.amrithaGhati);
console.log("Ishta: ", p.suryodhayadgata);
