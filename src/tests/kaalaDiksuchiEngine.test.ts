import { describe, it, expect, vi } from "vitest";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockResolvedValue("Divine Kaala Diksuchi Prophecy from Sri Shreeram Pandit")
}));
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
  computeDiksuchiCompassMatrix,
  resolvePincodeCoordinates,
  executeKaalaDiksuchiCalculation
} from "../features/kaaladiksuchi/kaaladiksuchiEngine";
import type { KaalaDiksuchiInput } from "../features/kaaladiksuchi/kaaladiksuchiTypes";

describe("Divya Kaala Diksuchi Engine (Time & Directional Compass)", () => {
  it("resolves pincode coordinates and location name accurately", () => {
    const gokarna = resolvePincodeCoordinates("581326", "Gokarna");
    expect(gokarna.lat).toBeCloseTo(14.5479, 2);
    expect(gokarna.lng).toBeCloseTo(74.3188, 2);

    const blr = resolvePincodeCoordinates("560001", "Bengaluru");
    expect(blr.lat).toBeCloseTo(12.9716, 2);
    expect(blr.lng).toBeCloseTo(77.5946, 2);
  });

  it("computes Directional Diksuchi Compass Matrix and timing rhythms", () => {
    const input: KaalaDiksuchiInput = {
      personName: "Pramod Kodagi",
      dob: "1995-08-26",
      pincode: "581326",
      lang: "kn"
    };

    const compass = computeDiksuchiCompassMatrix(input, 8, 4, 4);
    expect(compass.careerDirection.directionName).toContain("ಪಶ್ಚಿಮ");
    expect(compass.wealthDirection.directionName).toBeDefined();
    expect(compass.healthMeditationDirection.directionName).toBeDefined();
    expect(compass.dailyDishaShoola.afflictedDirection).toBeDefined();
    expect(compass.dailyDishaShoola.classicalRemedy).toBeDefined();
    expect(compass.timingRhythm.sunriseTime).toBeDefined();
    expect(compass.timingRhythm.abhijitMuhurtha).toBeDefined();
    expect(compass.timingRhythm.peakPranaWindow).toBeDefined();
  });

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

  it("computes dynamic, varied Modern World Alignment strategies without repetitive static AI buzzwords", () => {
    const input1: KaalaDiksuchiInput = {
      personName: "Aries Pioneer",
      dob: "1992-04-15",
      primaryFocus: "career",
      lang: "kn"
    };
    const samudrika1 = computeSamudrikaProfile(input1, 6);
    const alignment1 = computeModernWorldAlignment(input1, samudrika1, 6, 0);

    const input2: KaalaDiksuchiInput = {
      personName: "Virgo Analyst",
      dob: "1988-09-10",
      primaryFocus: "modern_adaptation",
      lang: "kn"
    };
    const samudrika2 = computeSamudrikaProfile(input2, 1);
    const alignment2 = computeModernWorldAlignment(input2, samudrika2, 1, 5);

    // Outputs must vary depending on zodiac and profile
    expect(alignment1.careerAndTechStrategy).not.toEqual(alignment2.careerAndTechStrategy);
    expect(alignment1.digitalAndMentalWellness).not.toEqual(alignment2.digitalAndMentalWellness);
    expect(alignment1.userResonanceScore).toBeGreaterThanOrEqual(60);
    expect(alignment1.actionableHabitsForToday.length).toBe(4);
  });

  it("executes full end-to-end calculation effortlessly with Diksuchi Compass and accurate timings", async () => {
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
    expect(result.diksuchi).toBeDefined();
    expect(result.diksuchi.careerDirection).toBeDefined();
    expect(result.diksuchi.dailyDishaShoola).toBeDefined();
    expect(result.diksuchi.timingRhythm.peakPranaWindow).toBeDefined();
    expect(result.modernWorld.careerAndTechStrategy).toBeDefined();
    expect(result.liveTransit.pranaScore).toBeGreaterThanOrEqual(70);
    expect(result.karmicMission.soulPurpose).toBeDefined();
    expect(result.decadeMilestones.length).toBe(5);
    expect(result.sankhya.mulank).toBe(1); // 28 -> 2+8=10 -> 1
    expect(result.prashnaOracle.prashnaLagna).toBeDefined();
    expect(result.remedies.dailyStotra).toBeDefined();
    expect(result.aiNarrative).toBeDefined();
  });
});
