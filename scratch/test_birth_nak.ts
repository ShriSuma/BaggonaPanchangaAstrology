import { siderealLongitudes } from "./src/core/AstroEngine";
import { getAyanamsaModel } from "./src/core/AstroEngine";
const birthUtc = new Date(Date.UTC(1997, 9, 24, 14, 45));
const ayanamsaModel = getAyanamsaModel("Lahiri");
const endDeg = siderealLongitudes(birthUtc, ayanamsaModel, "mean").moon;
const nakIdx = Math.floor((endDeg - 0.0001) / (360 / 27)) % 27;
console.log("Moon Deg:", endDeg);
console.log("Nak Idx:", nakIdx);
