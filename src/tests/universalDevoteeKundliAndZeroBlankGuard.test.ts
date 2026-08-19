import { describe, expect, it } from "vitest";
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import { calculateKundli } from "../core/KundliEngine";
import { validate90DayCalendarPayload, generateSevaICalendarString, calculateDeterministicRhythmDay } from "../features/seva/icsCalendarGenerator";
import { computeLocalFallback90DayPanchanga } from "../features/seva/panchanga90DayAiEngine";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Universal Devotee Kundli & 90-Day Calendar Zero-Blank Guard", () => {
  describe("Universal Devotee Birth Parameters Resolver", () => {
    it("returns explicit DOB/TOB when passed", () => {
      const res = getUniversalBirthDetails({ dob: "2000-01-01", tob: "12:34" });
      expect(res.dob).toBe("2000-01-01");
      expect(res.tob).toBe("12:34");
      expect(res.isDerived).toBe(false);
    });

    it("resolves exact named devotee birth details for Manoj, Dilip, Pramod", () => {
      const manoj = getUniversalBirthDetails({ name: "Manoj Poornamatha" });
      expect(manoj.dob).toBe("1993-03-16");
      expect(manoj.tob).toBe("01:40");

      const dilip = getUniversalBirthDetails({ name: "Dilip Pujari" });
      expect(dilip.dob).toBe("1993-03-22");
      expect(dilip.tob).toBe("23:40");

      const pramod = getUniversalBirthDetails({ name: "Pramod Kudgi" });
      expect(pramod.dob).toBe("1993-05-31");
      expect(pramod.tob).toBe("09:25");
    });

    it("resolves authentic Moon Nakshatra & Dasha for all 27 Nakshatras (0..26)", () => {
      for (let nk = 0; nk < 27; nk++) {
        const details = getUniversalBirthDetails({ nakshatraIndex: nk });
        expect(details.dob).toBeDefined();
        expect(details.tob).toBeDefined();

        const kundli = calculateKundli({
          name: `User Nakshatra ${nk}`,
          birthDate: details.dob,
          birthTime: details.tob,
          latitude: 14.54,
          longitude: 74.31
        });

        const moon = kundli.planets.find((p) => p.name === "Moon");
        expect(moon?.nakshatra?.index).toBe(nk);
      }
    });
  });

  describe("90-Day Calendar Zero-Blank Validation Guard", () => {
    it("passes validation for 100% complete 90-day Panchanga map", () => {
      const map = computeLocalFallback90DayPanchanga(
        "581326",
        "Gokarna",
        "2026-08-19",
        "kn",
        14.54,
        74.31
      );

      const days: RhythmDay[] = Object.keys(map).map((ymd) => {
        return calculateDeterministicRhythmDay(ymd, 24, 11);
      });

      const res = validate90DayCalendarPayload({
        days,
        lang: "kn",
        panditName: "Shreeram Pandit",
        aiPanchangaMap: map
      });

      expect(res.isValid).toBe(true);
      expect(res.missingDayCount).toBe(0);
    });

    it("detects incomplete or empty Panchanga payload", () => {
      const res = validate90DayCalendarPayload({
        days: [],
        lang: "kn",
        panditName: "Shreeram Pandit"
      });

      expect(res.isValid).toBe(false);
      expect(res.missingDayCount).toBe(90);
    });

    it("auto-heals and populates 100% of 90 days in .ics generation without leaving any day blank", () => {
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

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).toContain("BEGIN:VEVENT");
      // Check that at least 90 events exist (90 daily events + Special Vrata Eve Alerts)
      const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBeGreaterThanOrEqual(90);
    });
  });
});
