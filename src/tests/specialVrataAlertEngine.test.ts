import { describe, expect, it } from "vitest";
import { detectSpecialVrata, get90DaySpecialVratas } from "../features/seva/specialVrataAlertEngine";
import { generateSevaICalendarString, calculateDeterministicRhythmDay } from "../features/seva/icsCalendarGenerator";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Special Vrata Alert Engine", () => {
  it("detects Amavasya, Ekadashi, Sankashti, Purnima, and Festivals correctly", () => {
    const list = get90DaySpecialVratas("2026-08-19", "kn");
    expect(list.length).toBeGreaterThan(0);

    const firstSpecial = list[0];
    expect(firstSpecial.isSpecial).toBe(true);
    expect(firstSpecial.eveAlertTitle).toContain("1-Day Prior Prep");
    expect(firstSpecial.mantra).toBeDefined();

    // Test specific special item
    const single = detectSpecialVrata(firstSpecial.ymd, "en");
    expect(single.isSpecial).toBe(true);
    expect(single.eveAlertTitle).toContain("Tomorrow");
  });

  it("extracts all Special Vratas in a 90-day period", () => {
    const list = get90DaySpecialVratas("2026-08-19", "kn");
    expect(list.length).toBeGreaterThan(0);
    const categories = list.map((item) => item.category);
    expect(categories.some((c) => ["EKADASHI", "AMAVASYA", "PURNIMA", "SANKASHTI", "PRADOSHAM", "FESTIVAL"].includes(c))).toBe(true);
  });

  it("generates 1-day prior Eve Alert events in .ics file output", () => {
    const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
      const d = new Date("2026-08-19");
      d.setDate(d.getDate() + i);
      const ymd = d.toISOString().slice(0, 10);
      return calculateDeterministicRhythmDay(ymd, 12, 5);
    });

    const ics = generateSevaICalendarString({
      days,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Test Devotee"
    });

    expect(ics).toContain("baggona-eve-");
    expect(ics).toContain("1-Day Prior Prep");
  });
});
