import { describe, it, expect } from "vitest";
import {
  calculateNumerologyNumbers,
  evaluateDignity,
  computeSamudrikaProfile,
  computeModernWorldAlignment,
  computePrashnaOracle,
  computeRemedialPrescription,
  executeKaalaDiksuchiCalculation
} from "../features/kaaladiksuchi/kaaladiksuchiEngine";
import type { KaalaDiksuchiInput } from "../features/kaaladiksuchi/kaaladiksuchiTypes";

describe("Divya Kaala Diksuchi Engine (No-TOB Astrology)", () => {
  it("calculates numerology numbers correctly for DOB and Name", () => {
    const res = calculateNumerologyNumbers("1995-08-26", "Pramod Kodagi");
    expect(res.ruling).toBe(8); // 26 -> 2+6=8
    expect(res.destiny).toBeGreaterThanOrEqual(1);
    expect(res.destiny).toBeLessThanOrEqual(9);
    expect(res.soulUrge).toBeGreaterThanOrEqual(1);
    expect(res.soulUrge).toBeLessThanOrEqual(9);
  });

  it("evaluates planetary dignity correctly according to Vedic rules", () => {
    expect(evaluateDignity("Sun", 0)).toBe("Exalted"); // Mesha (0)
    expect(evaluateDignity("Sun", 6)).toBe("Debilitated"); // Tula (6)
    expect(evaluateDignity("Sun", 4)).toBe("Own Sign"); // Simha (4)
  });

  it("computes Samudrika Profile and elemental compositions correctly", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Pramod",
      dob: "1990-05-15",
      foreheadShape: "broad",
      eyeRadiance: "calm",
      handElement: "earth",
      primaryFocus: "career",
      lang: "kn"
    };

    const profile = computeSamudrikaProfile(input);
    expect(profile.dominantPlanet).toContain("Jupiter");
    expect(profile.elementalComposition.fire + profile.elementalComposition.earth + profile.elementalComposition.air + profile.elementalComposition.water).toBeCloseTo(100, 0);
  });

  it("computes Modern World Alignment & Human Evolution strategies", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Shree",
      dob: "1988-11-20",
      foreheadShape: "angular",
      eyeRadiance: "sharp",
      handElement: "fire",
      primaryFocus: "modern_adaptation",
      lang: "kn"
    };

    const samudrika = computeSamudrikaProfile(input);
    const alignment = computeModernWorldAlignment(input, samudrika, 2);

    expect(alignment.userResonanceScore).toBeGreaterThanOrEqual(60);
    expect(alignment.userResonanceScore).toBeLessThanOrEqual(100);
    expect(alignment.keyVulnerabilities.length).toBeGreaterThan(0);
    expect(alignment.growthOpportunities.length).toBeGreaterThan(0);
    expect(alignment.actionableHabitsForToday.length).toBe(4);
  });

  it("executes full end-to-end calculation without Birth Time", async () => {
    const input: KaalaDiksuchiInput = {
      personName: "Venkatesh",
      dob: "1985-07-28",
      pincode: "581326",
      foreheadShape: "compact",
      eyeRadiance: "analytical",
      handElement: "air",
      primaryFocus: "finance",
      lang: "en"
    };

    const result = await executeKaalaDiksuchiCalculation(input);

    expect(result.suryaRashi).toBeDefined();
    expect(result.chandraRashiEstimate).toBeDefined();
    expect(result.planets.length).toBe(7);
    expect(result.modernWorld.careerAndTechStrategy).toBeDefined();
    expect(result.prashnaOracle.prashnaLagna).toBeDefined();
    expect(result.remedies.dailyStotra).toBeDefined();
  });
});
