import { describe, it, expect } from "vitest";
import { generateYajnaHawanaPlan } from "../core/YajnaHawanaEngine";
import { calculateKundli } from "../core/KundliEngine";

describe("YajnaHawanaEngine (ಪಿತೃ ಕಾರ್ಯ & ದೇವತಾ ಯಜ್ಞ ಪ್ರತ್ಯೇಕ ಎಂಜಿನ್)", () => {
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

  it("strictly separates Pitru Karya from Deva Karya and builds a 2-stage multi-day schedule for Pitru Dosha", () => {
    const kundli = calculateKundli(sampleBirth1);

    const plan = generateYajnaHawanaPlan(kundli, {
      runningDashaMaha: "ಗುರು",
      runningDashaBhukti: "ಶನಿ",
      primaryChallenge: "Career / Workplace",
      devoteeName: "ಶ್ರೀರಾಮ್"
    });

    expect(plan).toBeDefined();
    expect(plan.devaHomas.length).toBeGreaterThanOrEqual(4);

    // Verify all deva homas are in deva domain
    plan.devaHomas.forEach((homa) => {
      expect(homa.domain).toBe("deva_karya");
      expect(homa.nameKn).toBeTruthy();
      expect(homa.astrologicalRootCauseKn).toBeTruthy();
      expect(homa.sacredProcedureKn).toBeTruthy();
      expect(homa.expectedShiftsAfterPoojaKn).toBeTruthy();
      expect(homa.priestSecretNoteKn).toMatch(/^\[.+\]$/);
    });

    // Check Pitru Dosha Assessment and separation rule
    expect(plan.pitruDoshaAssessment).toBeDefined();
    expect(plan.pitruDoshaAssessment.shastraSeparationRuleKn).toContain("ಧರ್ಮಶಾಸ್ತ್ರದ ಕಟ್ಟುನಿಟ್ಟಿನ ನಿಯಮ");

    // Check Combined Schedule
    expect(plan.combinedSchedule).toBeDefined();
    expect(plan.combinedSchedule.stage2DevaKarya).toBeDefined();
    if (plan.combinedSchedule.scheduleType === "two_stage_multi_day") {
      expect(plan.combinedSchedule.stage1PitruKarya).toBeDefined();
      expect(plan.combinedSchedule.restPeriodShuddhi).toBeDefined();
    }
  });

  it("handles a chart with Sun-Rahu conjunction triggering 2-stage schedule with Narayana Bali & Tripindi Shradha", () => {
    const kundli = calculateKundli(sampleBirth2);

    const plan = generateYajnaHawanaPlan(kundli, {
      runningDashaMaha: "ರಾಹು",
      runningDashaBhukti: "ಗುರು",
      primaryChallenge: "Personal / Marriage"
    });

    expect(plan.pitruDoshaAssessment.hasPitruDosha).toBe(true);
    expect(plan.pitruKaryas.length).toBeGreaterThanOrEqual(2);
    expect(plan.pitruKaryas.some((k) => k.id === "pitru_narayana_bali")).toBe(true);
    expect(plan.pitruKaryas.some((k) => k.id === "pitru_tripindi")).toBe(true);
    expect(plan.combinedSchedule.scheduleType).toBe("two_stage_multi_day");
    expect(plan.combinedSchedule.restPeriodShuddhi?.shastraRuleKn).toContain("೧ ದಿನದ ಶೌಚ-ಶುದ್ಧಿ");
  });
});
