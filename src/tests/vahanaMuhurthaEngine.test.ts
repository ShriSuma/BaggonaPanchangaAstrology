import { describe, it, expect } from "vitest";
import { calculateVahanaKharidiMuhurtha } from "../features/muhurtha/vahanaMuhurthaEngine";

describe("vahanaMuhurthaEngine", () => {
  it("calculates personalized vehicle purchase dates for Mesha Rashi, Ashwini Nakshatra", () => {
    const report = calculateVahanaKharidiMuhurtha({
      personName: "ಶ್ರೀ ರಾಘವೇಂದ್ರ",
      rashiIndex: 0, // Mesha
      nakshatraIndex: 0, // Ashwini
      year: 2026,
      month: 3 // March 2026
    });

    expect(report).toBeDefined();
    expect(report.devoteeName).toBe("ಶ್ರೀ ರಾಘವೇಂದ್ರ");
    expect(report.devoteeRashiKn).toBe("ಮೇಷ");
    expect(report.devoteeNakshatraKn).toBe("ಅಶ್ವಿನಿ");
    expect(report.targetMonthLabelKn).toContain("ಮಾರ್ಚ್ 2026");
    expect(report.totalDaysEvaluated).toBe(31);
    expect(report.allMonthDays.length).toBe(31);
    expect(report.topRecommendedDays.length).toBeGreaterThan(0);

    const firstRec = report.topRecommendedDays[0];
    expect(firstRec.suitabilityScore).toBeGreaterThanOrEqual(65);
    expect(firstRec.isChandrashtama).toBe(false);
    expect(firstRec.auspiciousTimeWindowKn).toBeDefined();
    expect(firstRec.vahanaPujaGuidelineKn).toBeDefined();
  });

  it("applies Chandrashtama penalty properly for 8th house transit", () => {
    const report = calculateVahanaKharidiMuhurtha({
      personName: "ಭಕ್ತರು",
      rashiIndex: 3, // Karka
      nakshatraIndex: 7, // Pushya
      year: 2026,
      month: 4 // April 2026
    });

    const chandrashtamaDays = report.allMonthDays.filter((d) => d.isChandrashtama);
    chandrashtamaDays.forEach((day) => {
      expect(day.isRecommended).toBe(false);
      expect(day.suitabilityRating).toBe("AVERAGE");
    });
  });
});
