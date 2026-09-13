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

  const sampleChild = {
    name: "Aarav",
    birthDate: "2018-03-10",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    pincode: "581326"
  };

  it("strictly separates Pitru Karya from Deva Karya and builds a 2-stage multi-day schedule for Pitru Dosha", () => {
    const kundli = calculateKundli(sampleBirth1);

    const plan = generateYajnaHawanaPlan(kundli, {
      runningDashaMaha: "ಗುರು",
      runningDashaBhukti: "ಶನಿ",
      primaryChallenge: "Career / Workplace",
      devoteeName: "ಶ್ರೀರಾಮ್",
      devoteeAge: 34
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
      primaryChallenge: "Personal / Marriage",
      devoteeAge: 38
    });

    expect(plan.pitruDoshaAssessment.hasPitruDosha).toBe(true);
    expect(plan.pitruKaryas.length).toBeGreaterThanOrEqual(2);
    expect(plan.pitruKaryas.some((k) => k.id === "pitru_narayana_bali")).toBe(true);
    expect(plan.pitruKaryas.some((k) => k.id === "pitru_tripindi")).toBe(true);
    expect(plan.combinedSchedule.scheduleType).toBe("two_stage_multi_day");
    expect(plan.combinedSchedule.restPeriodShuddhi?.shastraRuleKn).toContain("1 ದಿನದ ಶೌಚ-ಶುದ್ಧಿ");

    // Root cause must dynamically reflect the detected reasons
    const nb = plan.pitruKaryas.find((k) => k.id === "pitru_narayana_bali");
    expect(nb?.astrologicalRootCauseKn).toBeTruthy();
    expect(nb?.astrologicalRootCauseKn).not.toContain("40 ರಿಂದ 50 ಲಕ್ಷ");
  });

  it("child devotee (<14 years) receives zero Pitru Karyas and 4 dedicated child Deva Homas in 1-day Samputa", () => {
    const kundli = calculateKundli(sampleChild);

    const plan = generateYajnaHawanaPlan(kundli, {
      devoteeName: "ಆರವ್",
      devoteeAge: 6
    });

    // Shastric rule: Children have zero Pitru Dosha
    expect(plan.pitruDoshaAssessment.hasPitruDosha).toBe(false);
    expect(plan.pitruDoshaAssessment.severityLabelKn).toContain("ಮಕ್ಕಳಿಗೆ ಅನ್ವಯಿಸುವುದಿಲ್ಲ");
    expect(plan.pitruKaryas).toHaveLength(0);

    // Single day deva samputa
    expect(plan.combinedSchedule.scheduleType).toBe("single_day_deva_samputa");
    expect(plan.combinedSchedule.titleKn).toContain("ಬಾಲ ಸಂರಕ್ಷಣಾ");

    // 4 Child specific homas
    expect(plan.devaHomas).toHaveLength(4);
    const homaIds = plan.devaHomas.map(h => h.id);
    expect(homaIds).toContain("child_balagraha_shanti");
    expect(homaIds).toContain("child_ayushya_dhanvantari");
    expect(homaIds).toContain("child_medha_saraswati");
    expect(homaIds).toContain("child_gokarna_abhisheka");

    // Dynamic Muhurtha includes Lagna lord weekday
    expect(plan.combinedSchedule.recommendedMuhurthaKn).toMatch(/ವಾರದಂದು|ಮುಹೂರ್ತದಲ್ಲಿ/);
  });

  it("dynamically prescribes Swayamvara Parvathi for marriage challenges and Sri Sukta Kubera for financial challenges", () => {
    const kundli = calculateKundli(sampleBirth1);

    // 1. Marriage challenge
    const marriagePlan = generateYajnaHawanaPlan(kundli, {
      primaryChallenge: "Personal / Marriage",
      devoteeAge: 29
    });
    expect(marriagePlan.devaHomas.some(h => h.id === "homa_swayamvara_parvathi")).toBe(true);

    // 2. Financial challenge
    const financePlan = generateYajnaHawanaPlan(kundli, {
      primaryChallenge: "Financial / Debts",
      devoteeAge: 40
    });
    expect(financePlan.devaHomas.some(h => h.id === "homa_sri_sukta_kubera")).toBe(true);

    // 3. Career challenge
    const careerPlan = generateYajnaHawanaPlan(kundli, {
      primaryChallenge: "Career / Workplace",
      devoteeAge: 35
    });
    expect(careerPlan.devaHomas.some(h => h.id === "homa_chandi")).toBe(true);
  });
});
