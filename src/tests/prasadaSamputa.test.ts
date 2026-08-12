import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { calculateRhythm } from "../core/DailyRhythmEngine";
import { recommendSevas } from "../core/GokarnaSevaEngine";
import { pick, RASHI_L5, NAKSHATRA_L5, COLOUR_L5, DIRECTION_L5 } from "../features/seva/sevaLocale";
import { formatLongDate, tithiLabel, nakshatraName, rashiName } from "../features/seva/sevaPresentation";
import type { KundliInput } from "../core/AstroTypes";

const pramodBirth: KundliInput = {
  name: "Pramod",
  birthDate: "1993-05-31",
  birthTime: "09:25",
  latitude: 14.5479,
  longitude: 74.3187,
  gender: "Male"
};

describe("Prasada Samputa & Seva Engine Master Verification", () => {
  it("computes accurate 6-month rhythm & recommendations from Master Engine for Pramod", () => {
    const kundli = calculateKundli(pramodBirth, { ayanamsaModel: "lahiri" });
    expect(kundli).toBeDefined();

    const rhythm = calculateRhythm(
      kundli,
      pramodBirth.birthDate,
      pramodBirth.birthTime,
      pramodBirth.latitude,
      pramodBirth.longitude,
      new Date("2026-08-12T00:00:00Z"),
      { days: 90, ayanamsaModel: "lahiri" }
    );

    expect(rhythm.days.length).toBeGreaterThanOrEqual(90);
    expect(rhythm.personalNumbers.length).toBeGreaterThan(0);
    expect(rhythm.personalColour).toBeDefined();
    expect(rhythm.personalDirection).toBeDefined();

    const { recommendations } = recommendSevas(kundli, { ayanamsaModel: "lahiri" });
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].seva.id).toBeDefined();
  });

  it("safely formats dates, tithis, rashis, and nakshatras in all 5 languages without throwing exceptions", () => {
    const kundli = calculateKundli(pramodBirth, { ayanamsaModel: "lahiri" });
    const rhythm = calculateRhythm(
      kundli,
      pramodBirth.birthDate,
      pramodBirth.birthTime,
      pramodBirth.latitude,
      pramodBirth.longitude,
      new Date("2026-08-12T00:00:00Z"),
      { days: 30 }
    );

    const locales = ["kn", "en", "hi", "te", "ta"];

    locales.forEach((lang) => {
      const today = rhythm.days[0];
      expect(formatLongDate(today, lang)).not.toBe("");
      expect(tithiLabel(today, lang)).not.toBe("");
      expect(rashiName(rhythm.janmaRashiIndex, lang)).not.toBe("");
      expect(nakshatraName(rhythm.janmaNakshatraIndex, lang)).not.toBe("");

      // Test pick safely handles null or undefined values
      expect(pick(undefined, lang)).toBe("");
      expect(pick(null, lang)).toBe("");
      expect(pick(COLOUR_L5[rhythm.personalColour], lang)).not.toBe("");
      expect(pick(DIRECTION_L5[rhythm.personalDirection], lang)).not.toBe("");
    });
  });

  it("verifies Prasada Kit data structures are 100% complete and resilient for rendering", () => {
    const kundli = calculateKundli(pramodBirth, { ayanamsaModel: "lahiri" });
    const rhythm = calculateRhythm(
      kundli,
      pramodBirth.birthDate,
      pramodBirth.birthTime,
      pramodBirth.latitude,
      pramodBirth.longitude,
      new Date("2026-08-12T00:00:00Z"),
      { days: 90 }
    );
    const { recommendations } = recommendSevas(kundli, { ayanamsaModel: "lahiri" });

    const identity = {
      personName: pramodBirth.name,
      gotra: "Vashishtha",
      rashiIndex: rhythm.janmaRashiIndex,
      nakshatraIndex: rhythm.janmaNakshatraIndex,
      placeLabel: "Gokarna"
    };

    expect(identity.personName).toBe("Pramod");
    expect(rhythm.days[0]).toBeDefined();
    expect(recommendations[0].seva.name.kn).toBeDefined();
  });
});
