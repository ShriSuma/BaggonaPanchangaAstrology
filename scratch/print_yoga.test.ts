import { describe, it } from "vitest";
import { getAyanamsaModel } from "../src/core/AstroEngine";
import { getHinduSunTimes, getYogaEnd, getTithiEnd } from "../src/core/EphemerisEngine";
describe("test", () => {
  it("prints", () => {
    const model = getAyanamsaModel("Lahiri");
    const b = new Date(Date.UTC(1997, 9, 24, 14, 45)); 
    const s = getHinduSunTimes(b, 14.5479, 74.3187).sunriseUtc;
    console.log("Tithi End: " + getTithiEnd(b, model).toISOString());
    console.log("Yoga End: " + getYogaEnd(b, model).toISOString());
  });
});
