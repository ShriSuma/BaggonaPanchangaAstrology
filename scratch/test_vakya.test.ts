import { describe, it } from "vitest";
import { ayanamsaForModel } from "../src/core/Ayanamsa";
import { getHinduSunTimes } from "../src/core/EphemerisEngine";
import { siderealLongitudes } from "../src/core/AstroEngine";

describe("vakya test", () => {
  it("prints", () => {
    // Shravana start was 1:58 AM on July 18.
    const st = new Date(Date.UTC(1992, 6, 17, 20, 28)); // 1:58 AM IST
    const l = siderealLongitudes(st, "lahiri", "mean").moon;
    console.log("Moon Longitude at 1:58 AM (Lahiri):", l);
    
    const target = new Date(Date.UTC(1992, 6, 18, 3, 5)); // 8:35 AM IST
    const l2 = siderealLongitudes(target, "lahiri", "mean").moon;
    console.log("Moon Longitude at 8:35 AM (Lahiri):", l2);
    
    console.log("Difference:", l2 - l);
  });
});
