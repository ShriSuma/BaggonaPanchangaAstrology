import { describe, it } from "vitest";
import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
describe("TraditionalBaggonaEngine", () => {
  it("prints ghati for test case", () => {
    const res = calculateTraditionalBaggona("1992-07-18", "03:36", 14.5479, 74.3187, "vakya");
    console.log("TEST CASE (1992-07-18 03:36 AM) - VAKYA MODE:");
    console.log(`Visha: ${res.vishaGhati.ghati}:${res.vishaGhati.vighati}`);
    console.log(`Amritha: ${res.amrithaGhati.ghati}:${res.amrithaGhati.vighati}`);
  });
});
