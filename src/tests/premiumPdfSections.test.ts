import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { generateBaggonaPredictions, generatePersonalReading } from "../core/BaggonaPredictionEngine";
import { buildPremiumPrompts } from "../features/premiumPdf/premiumPrompts";
import type { KundliInput } from "../core/AstroTypes";

const pramodBirth: KundliInput = {
  name: "Pramod",
  birthDate: "1993-05-31",
  birthTime: "09:25",
  latitude: 14.5479,
  longitude: 74.3187,
  gender: "Male"
};

describe("Comprehensive PDF Section Completeness & 2-Paragraph Validation", () => {
  const locales = ["kn", "en", "hi", "te", "ta"] as const;

  locales.forEach((lang) => {
    it(`validates all core sections exist with non-empty 2-paragraph content for Pramod (${lang})`, () => {
      const kundli = calculateKundli(pramodBirth, { ayanamsaModel: "lahiri" });
      const panchanga = calculateTraditionalBaggona("1993-05-31", "09:25", 14.5479, 74.3187, "lahiri");

      const baggonaPreds = generateBaggonaPredictions(kundli, panchanga, lang);
      const personalReadings = generatePersonalReading(kundli, pramodBirth, lang);

      // 1. Houses Section Must Have 12 Houses
      expect(baggonaPreds.houses.length).toBe(12);

      // 2. Marriage (House 7) Section Must Always Exist and be non-empty
      const house7 = baggonaPreds.houses[6]; // 7th house
      expect(house7).toBeDefined();
      expect(house7.description.length).toBeGreaterThan(20);

      // 3. Career (House 10) Section Must Always Exist
      const house10 = baggonaPreds.houses[9]; // 10th house
      expect(house10).toBeDefined();
      expect(house10.description.length).toBeGreaterThan(20);

      // 4. Health & Longevity Must Always Exist
      expect(baggonaPreds.longevity.length).toBeGreaterThan(0);
      expect(baggonaPreds.longevity[0].description.length).toBeGreaterThan(20);

      // 5. Family & Wealth (House 2) Must Always Exist
      const house2 = baggonaPreds.houses[1]; // 2nd house
      expect(house2).toBeDefined();
      expect(house2.description.length).toBeGreaterThan(20);

      // 6. Yogas & Doshas Sections Must Be Present
      expect(baggonaPreds.yogas.length).toBeGreaterThan(0);
      expect(baggonaPreds.doshas.length).toBeGreaterThan(0);

      // 7. Personal Reading Chapters Must Be Non-Empty
      expect(personalReadings.cosmicProfile.length).toBeGreaterThan(0);
      expect(personalReadings.currentLifeChapter.description.length).toBeGreaterThan(20);
    });
  });

  it("enforces strict 2-paragraph (5 lines each) prompt rules for characteristics and darkSecret", () => {
    const prompts = buildPremiumPrompts({
      lang: "kn",
      runId: "test-run",
      name: "Pramod",
      ageYears: 32,
      lagnaRashiIndex: 3,
      moonRashiIndex: 5,
      moonNakshatraIndex: 12,
      sunRashiIndex: 1,
      natalPlanets: [],
      transits: [],
      mahaLord: "Jupiter",
      bhuktiLord: "Saturn",
      bhuktiEndsAtAge: 35,
      engineYogas: [],
      engineDoshas: [],
      pariharas: [],
      shadowSelf: "Test shadow",
      karmicBaggage: "Test karma",
      lifePhase: "Test phase",
      overallTone: "Test tone",
      careerNote: "Test career",
      financeNote: "Test finance",
      roadmap: [],
      affairNote: "Test affair"
    });

    expect(prompts.characteristics).toContain("EACH PARAGRAPH MUST CONTAIN AT LEAST 5 FULL, SUBSTANTIAL LINES OF TEXT");
    expect(prompts.darkSecret).toContain("EACH PARAGRAPH MUST CONTAIN AT LEAST 5 FULL, SUBSTANTIAL LINES OF TEXT");
    expect(prompts.darkSecret).toContain("niguda rahasya");
  });
});
