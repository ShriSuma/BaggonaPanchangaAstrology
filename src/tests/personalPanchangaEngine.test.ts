import { describe, expect, it } from "vitest";
import { calculatePersonal90DayPanchanga } from "../core/PersonalPanchangaEngine";

describe("PersonalPanchangaEngine 90-Day Personal Rhythm Suite", () => {
  const pramodInput = {
    name: "Pramod Kudgi",
    birthDate: "1993-05-31",
    birthTime: "09:25",
    latitude: 14.5479,
    longitude: 74.3187,
    pincode: "581326"
  };

  it("calculates 90-day report for Pramod Kudgi with exact day counts and 3-color distribution", async () => {
    const report = await calculatePersonal90DayPanchanga(pramodInput, "2026-08-18", 90);

    expect(report.devoteeName).toBe("Pramod Kudgi");
    expect(report.days).toHaveLength(90);
    expect(report.startDate).toBe("2026-08-18");

    // Total days check
    expect(report.greenDaysCount + report.yellowDaysCount + report.redDaysCount).toBe(90);

    // Verify 3-color distribution balance (Yellow 🟡 days must be present and non-zero)
    expect(report.yellowDaysCount).toBeGreaterThan(0);
    expect(report.greenDaysCount).toBeGreaterThan(0);

    // Verify day 1 output structure
    const day1 = report.days[0];
    expect(day1.score).toBeGreaterThanOrEqual(18);
    expect(day1.score).toBeLessThanOrEqual(98);
    expect(["green", "yellow", "red"]).toContain(day1.color);

    // Verify 5-language localized text fields
    expect(day1.guidanceLine1.kn).toBeDefined();
    expect(day1.guidanceLine1.en).toBeDefined();
    expect(day1.guidanceLine2.kn).toBeDefined();
    expect(day1.vehicleSuitability.kn).toContain("🚘");
    expect(day1.vehicleSuitability.en).toContain("🚘");
  });
});
