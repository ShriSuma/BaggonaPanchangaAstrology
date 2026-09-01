import { describe, it, expect } from "vitest";
import { generateYajnaHawanaPlan } from "../core/YajnaHawanaEngine";
import { calculateKundli } from "../core/KundliEngine";

describe("YajnaHawanaEngine (ಯಜ್ಞ, ಹವನ & ಪಿತೃ ದೋಷ ಪರಿಹಾರ ಎಂಜಿನ್)", () => {
  const sampleBirth1 = {
    name: "Shreeram Pandit",
    birthDate: "1990-05-15",
    birthTime: "06:30",
    latitude: 12.9716,
    longitude: 77.5946,
    pincode: "560001"
  };

  const sampleBirth2 = {
    name: "Ganesh Bhat",
    birthDate: "1985-08-20",
    birthTime: "14:15",
    latitude: 13.0827,
    longitude: 80.2707,
    pincode: "600001"
  };

  it("dynamically assesses Pitru Dosha, recommends Narayana Bali & Tila Hawana, and generates pure Kannada recommendations", () => {
    const kundli = calculateKundli(sampleBirth1);

    const plan = generateYajnaHawanaPlan(kundli, {
      runningDashaMaha: "ಗುರು",
      runningDashaBhukti: "ಶನಿ",
      primaryChallenge: "Career / Workplace",
      devoteeName: "ಶ್ರೀರಾಮ್"
    });

    expect(plan).toBeDefined();
    expect(plan.recommendedHomas.length).toBeGreaterThanOrEqual(4);

    // Verify each homa has all required fields in Kannada
    plan.recommendedHomas.forEach((homa) => {
      expect(homa.nameKn).toBeTruthy();
      expect(homa.astrologicalRootCauseKn).toBeTruthy();
      expect(homa.sacredProcedureKn).toBeTruthy();
      expect(homa.expectedShiftsAfterPoojaKn).toBeTruthy();
      expect(homa.priestSecretNoteKn).toMatch(/^\[.+\]$/); // Must be enclosed in brackets
      expect(homa.categoryLabelKn).toBeTruthy();
    });

    // Check Pitru Dosha Assessment
    expect(plan.pitruDoshaAssessment).toBeDefined();
    expect(plan.pitruDoshaAssessment.suggestedKaryaKn).toBeTruthy();
    expect(plan.pitruDoshaAssessment.detailedExplanationKn).toBeTruthy();
    expect(plan.pitruDoshaAssessment.gokarnaSignificanceKn).toBeTruthy();

    // Check Combined Samputa Seva
    expect(plan.combinedSamputaSeva).toBeDefined();
    expect(plan.combinedSamputaSeva.titleKn).toContain("ಸಂಪುಟ ಸೇವೆ");
    expect(plan.combinedSamputaSeva.includedHomasKn.length).toBeGreaterThanOrEqual(3);
    expect(plan.combinedSamputaSeva.synergyExplanationKn).toBeTruthy();
    expect(plan.combinedSamputaSeva.recommendedMuhurthaKn).toBeTruthy();
  });

  it("handles a chart with Sun-Rahu conjunction triggering severe Pitru Dosha", () => {
    const kundli = calculateKundli(sampleBirth2);

    const plan = generateYajnaHawanaPlan(kundli, {
      runningDashaMaha: "ರಾಹು",
      runningDashaBhukti: "ಗುರು",
      primaryChallenge: "Personal / Marriage"
    });

    expect(plan.pitruDoshaAssessment).toBeDefined();
    expect(plan.recommendedHomas.some((h) => h.id === "homa_chandi" || h.id === "homa_sudarshana")).toBe(true);
    expect(plan.recommendedHomas.some((h) => h.id === "homa_navagraha")).toBe(true);
    expect(plan.recommendedHomas.some((h) => h.id === "homa_gokarna_abhisheka")).toBe(true);
  });
});
