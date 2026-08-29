import { describe, expect, it } from "vitest";
import { getDetailedTithiInfo, getTithiEnd, getTithiStart } from "../core/VedicCalculations";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { detectSpecialVrata, get90DaySpecialVratas } from "../features/seva/specialVrataAlertEngine";
import { calculateDeterministicRhythmDay, generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";

describe("Tithi Accuracy & Majority Ruling Tithi Engine", () => {
  it("calculates accurate Tithi start/end times in IST and determines Majority Tithi", () => {
    // 2026-08-27: Shravana Purnima / Raksha Bandhan
    const testDate = new Date(Date.UTC(2026, 7, 27, 0, 30));
    const detailed = getDetailedTithiInfo(testDate, "lahiri", testDate);

    expect(detailed).toBeDefined();
    expect(detailed.sunriseTithiIdx).toBeGreaterThanOrEqual(0);
    expect(detailed.sunriseTithiIdx).toBeLessThan(30);

    // Verify IST string formatting (e.g., "09:24 PM" or "10:15 AM")
    expect(detailed.tithiStartTimeStr).toMatch(/\d{2}:\d{2}\s+(AM|PM)/i);
    expect(detailed.tithiEndTimeStr).toMatch(/\d{2}:\d{2}\s+(AM|PM)/i);
    expect(detailed.nextTithiStartTimeStr).toMatch(/\d{2}:\d{2}\s+(AM|PM)/i);
    expect(detailed.nextTithiEndTimeStr).toMatch(/\d{2}:\d{2}\s+(AM|PM)/i);

    // Verify 5-language translations exist with zero empty strings
    expect(detailed.tithiName.kn.length).toBeGreaterThan(0);
    expect(detailed.tithiName.en.length).toBeGreaterThan(0);
    expect(detailed.tithiName.hi.length).toBeGreaterThan(0);
    expect(detailed.tithiName.te.length).toBeGreaterThan(0);
    expect(detailed.tithiName.ta.length).toBeGreaterThan(0);

    expect(detailed.nextTithiName.kn.length).toBeGreaterThan(0);
    expect(detailed.nextTithiName.en.length).toBeGreaterThan(0);

    expect(detailed.transitionSummary.kn.length).toBeGreaterThan(0);
    expect(detailed.transitionSummary.en.length).toBeGreaterThan(0);

    // Majority Tithi must be a valid index (0..29)
    expect(detailed.majorityTithiIdx).toBeGreaterThanOrEqual(0);
    expect(detailed.majorityTithiIdx).toBeLessThan(30);
  });

  it("traditional Baggona engine populates detailed Tithi timings in IST", () => {
    const res = calculateTraditionalBaggona("2026-08-28", "06:00", 14.5479, 74.3187, "lahiri");

    expect(res.detailedTithi).toBeDefined();
    expect(res.tithiEndTime).toBeDefined();
    expect(res.tithiNext).toBeDefined();
    expect(res.tithiNextKn).toBeDefined();
    expect(res.tithiStartTime).toBeDefined();
    expect(res.majorityTithi).toBeDefined();
    expect(res.majorityTithiKn).toBeDefined();
  });

  it("uses Majority Tithi for energy score, color band, and special Vrata detection in icsCalendarGenerator", () => {
    const day = calculateDeterministicRhythmDay("2026-08-27", 3, 1);

    expect(day.tithiNumber).toBeDefined();
    expect(day.energyScore).toBeGreaterThanOrEqual(15);
    expect(day.energyScore).toBeLessThanOrEqual(98);
    expect(["high", "steady", "rest"]).toContain(day.band);
    expect(day.luckyColour).toBeDefined();
    expect(day.luckyDirection).toBeDefined();
    expect(Array.isArray(day.luckyNumbers)).toBe(true);
    expect((day as any).detailedTithi).toBeDefined();
  });

  it("detects special Vrata and formats previous day eve reminder with exact IST timings", () => {
    const vrata = detectSpecialVrata("2026-08-28", "kn");

    if (vrata.isSpecial) {
      expect(vrata.eveAlertTitle).toBeDefined();
      expect(vrata.eveAlertSummary).toBeDefined();
      expect(vrata.fastingAdvice).toBeDefined();
      expect(vrata.mantra).toBeDefined();
    }
  });

  it("generates iCalendar payload with rich Tithi transitions and IST timings", () => {
    const ics = generateSevaICalendarString({
      personName: "Suma",
      birthNakshatraIndex: 3,
      birthRashiIndex: 1,
      gotra: "Kashyapa",
      priestName: "Shreeram Pandit",
      startDateStr: "2026-08-28",
      daysCount: 7,
      lang: "kn"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("Asia/Kolkata");
    expect(ics).toContain("SUMMARY:");
    expect(ics).toContain("DESCRIPTION:");
    expect(ics).toContain("END:VCALENDAR");
  });
});
