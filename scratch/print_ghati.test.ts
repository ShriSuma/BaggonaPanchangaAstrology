import { describe, expect, it } from "vitest";
import { calculateTraditionalBaggona } from "../src/core/TraditionalBaggonaEngine";
describe("TraditionalBaggonaEngine", () => {
  it("prints ghati", () => {
    const ayanamsas = ["lahiri", "raman", "kp"];
    for (const a of ayanamsas) {
      console.log(`\n--- ${a.toUpperCase()} ---`);
      const res = calculateTraditionalBaggona("1997-10-24", "20:15", 14.5479, 74.3187, a as any);
      console.log(`Visha: ${res.vishaGhati.ghati}:${res.vishaGhati.vighati}`);
      console.log(`Amritha: ${res.amrithaGhati.ghati}:${res.amrithaGhati.vighati}`);
    }
  });
});
