import { describe, it, expect } from "vitest";
import {
  calculateNumerologyNumbers,
  computeDeepSankhyaAnalysis,
  evaluateDignity,
  computeSamudrikaProfile,
  computeLiveTransitEnergy,
  computeKarmicSoulMission,
  computeDecadeMilestones,
  computeModernWorldAlignment,
  computePrashnaOracle,
  computeRemedialPrescription,
  executeKaalaDiksuchiCalculation
} from "../features/kaaladiksuchi/kaaladiksuchiEngine";
import type { KaalaDiksuchiInput } from "../features/kaaladiksuchi/kaaladiksuchiTypes";

describe("Divya Kaala Diksuchi Engine (No-TOB Astrology)", () => {
  it("calculates numerology numbers and deep Sankhya analysis correctly", () => {
    const res = calculateNumerologyNumbers("1995-08-26", "Pramod Kodagi");
    expect(res.ruling).toBe(8); // 26 -> 2+6=8
    expect(res.destiny).toBeGreaterThanOrEqual(1);
    expect(res.destiny).toBeLessThanOrEqual(9);
    expect(res.soulUrge).toBeGreaterThanOrEqual(1);
    expect(res.soulUrge).toBeLessThanOrEqual(9);
    expect(res.namank).toBeGreaterThanOrEqual(1);

    const input: KaalaDiksuchiInput = {
      personName: "Pramod Kodagi",
      dob: "1995-08-26",
      lang: "kn"
    };
    const sankhya = computeDeepSankhyaAnalysis(input, res.ruling, res.destiny, res.soulUrge, res.namank);
    expect(sankhya.mulank).toBe(8);
    expect(sankhya.mulankLord).toContain("ಶನಿ");
    expect(sankhya.wealthAttractionSecret).toBeDefined();
    expect(sankhya.harmoniousNumbers.length).toBeGreaterThan(0);
  });

  it("evaluates planetary dignity correctly according to Vedic rules", () => {
    expect(evaluateDignity("Sun", 0)).toBe("Exalted"); // Mesha (0)
    expect(evaluateDignity("Sun", 6)).toBe("Debilitated"); // Tula (6)
    expect(evaluateDignity("Sun", 4)).toBe("Own Sign"); // Simha (4)
  });

  it("computes Live Daily Transit Energy (Gochara Pulse)", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Shree",
      dob: "1992-03-15",
      lang: "kn"
    };
    const live = computeLiveTransitEnergy(input, 6);
    expect(live.pranaScore).toBeGreaterThanOrEqual(70);
    expect(live.pranaScore).toBeLessThanOrEqual(100);
    expect(live.peakHourWindow).toBeDefined();
    expect(live.favorableActivities.length).toBeGreaterThan(0);
    expect(live.cautionActivities.length).toBeGreaterThan(0);
  });

  it("computes Karmic Soul Mission and Rahu-Ketu Axis", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Venkatesh",
      dob: "1988-11-20",
      lang: "kn"
    };
    const karmic = computeKarmicSoulMission(input, 7);
    expect(karmic.rahuKetuAxis).toBeDefined();
    expect(karmic.soulPurpose).toBeDefined();
    expect(karmic.pastLifeGifts).toBeDefined();
    expect(karmic.ancestralClearingRemedy).toContain("ಗೋಕರ್ಣ");
  });

  it("computes 10-Year Epoch Milestones accurately", () => {
    const milestones = computeDecadeMilestones("1990-05-15", 6, true);
    expect(milestones.length).toBe(5);
    expect(milestones[0].ageRange).toContain("0 - 15");
    expect(milestones[0].vitalityScore).toBeGreaterThanOrEqual(70);
    expect(milestones[0].rulingPhase).toBeDefined();
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

    const profile = computeSamudrikaProfile(input, 6);
    expect(profile.dominantPlanet).toContain("Jupiter");
    expect(profile.elementalComposition.fire + profile.elementalComposition.earth + profile.elementalComposition.air + profile.elementalComposition.water).toBeCloseTo(100, 0);
  });

  it("computes Modern World Alignment & Human Evolution strategies", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Shree",
      dob: "1988-11-20",
      primaryFocus: "modern_adaptation",
      lang: "kn"
    };

    const samudrika = computeSamudrikaProfile(input, 2);
    const alignment = computeModernWorldAlignment(input, samudrika, 2);

    expect(alignment.userResonanceScore).toBeGreaterThanOrEqual(60);
    expect(alignment.userResonanceScore).toBeLessThanOrEqual(100);
    expect(alignment.keyVulnerabilities.length).toBeGreaterThan(0);
    expect(alignment.growthOpportunities.length).toBeGreaterThan(0);
    expect(alignment.actionableHabitsForToday.length).toBe(4);
  });

  it("executes full end-to-end calculation effortlessly without Birth Time", async () => {
    const input: KaalaDiksuchiInput = {
      personName: "Venkatesh",
      dob: "1985-07-28",
      pincode: "581326",
      primaryFocus: "finance",
      lang: "en"
    };

    const result = await executeKaalaDiksuchiCalculation(input);

    expect(result.suryaRashi).toBeDefined();
    expect(result.chandraRashiEstimate).toBeDefined();
    expect(result.planets.length).toBe(7);
    expect(result.modernWorld.careerAndTechStrategy).toBeDefined();
    expect(result.liveTransit.pranaScore).toBeGreaterThanOrEqual(70);
    expect(result.karmicMission.soulPurpose).toBeDefined();
    expect(result.decadeMilestones.length).toBe(5);
    expect(result.sankhya.mulank).toBe(1); // 28 -> 2+8=10 -> 1
    expect(result.prashnaOracle.prashnaLagna).toBeDefined();
    expect(result.remedies.dailyStotra).toBeDefined();
  });
});
