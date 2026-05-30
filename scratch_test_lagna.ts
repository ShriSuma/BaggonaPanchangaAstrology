import { getLagnaAscendant } from "./src/core/LagnaEngine";
import { degreeToRashi } from "./src/core/AstroMath";

const asc = getLagnaAscendant(new Date("1993-05-31T09:25:00+05:30"), 14.55, 74.32, "lahiri");
const rashis = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"];

console.log("Lagna:", Math.floor(asc / 30), rashis[Math.floor(asc / 30)]);

