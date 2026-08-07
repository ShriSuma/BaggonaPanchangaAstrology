import { describe, it } from "vitest";
import { getHinduSunTimes, getNakshatraStart, getNakshatraEnd } from "../src/core/EphemerisEngine";
import { siderealLongitudes } from "../src/core/EphemerisEngine";

describe("bounds", () => {
  it("prints", () => {
    const s = getHinduSunTimes(new Date(Date.UTC(1992, 6, 17, 22, 6)), 14.5479, 74.3187).sunriseUtc;
    const model = "vakya";
    console.log("Sunrise:", s.toISOString());
    const start = getNakshatraStart(s, model);
    const end = getNakshatraEnd(s, model);
    console.log("Nakshatra active at sunrise:", Math.floor((siderealLongitudes(end, model, "mean").moon - 0.0001) / (360/27)) % 27);
    console.log("Start:", start.toISOString(), "End:", end.toISOString());
  });
});
