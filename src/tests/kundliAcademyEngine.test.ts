import { describe, it, expect } from "vitest";
import { HOUSE_LEARNING_MODULES } from "../features/kundlilearning/kundliAcademyKnowledge";

describe("Kundli Academy 12-House Learning Engine Tests", () => {
  it("contains complete, authentic data for all 12 Vedic Houses (Bhavas)", () => {
    for (let h = 1; h <= 12; h++) {
      const house = HOUSE_LEARNING_MODULES[h];
      expect(house).toBeDefined();
      expect(house.houseNumber).toBe(h);
      expect(house.kannadaName).toBeDefined();
      expect(house.englishName).toBeDefined();
      expect(house.naturalLordKn).toBeDefined();
      expect(house.naturalRashiKn).toBeDefined();
      expect(house.bodyPartsKn).toBeDefined();
      expect(house.lifeThemesKn.length).toBeGreaterThan(2);
    }
  });

  it("verifies accurate Uccha (Exalted) and Neecha (Debilitated) classical definitions", () => {
    // House 1 (Mesha) -> Surya Exalted, Shani Debilitated
    const h1 = HOUSE_LEARNING_MODULES[1];
    expect(h1.dignity.exaltedPlanetKn).toContain("ಸೂರ್ಯ");
    expect(h1.dignity.debilitatedPlanetKn).toContain("ಶನಿ");

    // House 4 (Karkataka) -> Guru Exalted, Kuja Debilitated
    const h4 = HOUSE_LEARNING_MODULES[4];
    expect(h4.dignity.exaltedPlanetKn).toContain("ಗುರು");
    expect(h4.dignity.debilitatedPlanetKn).toContain("ಮಂಗಳ");

    // House 7 (Tula) -> Shani Exalted, Surya Debilitated
    const h7 = HOUSE_LEARNING_MODULES[7];
    expect(h7.dignity.exaltedPlanetKn).toContain("ಶನಿ");
    expect(h7.dignity.debilitatedPlanetKn).toContain("ಸೂರ್ಯ");

    // House 10 (Makara) -> Kuja Exalted, Guru Debilitated
    const h10 = HOUSE_LEARNING_MODULES[10];
    expect(h10.dignity.exaltedPlanetKn).toContain("ಮಂಗಳ");
    expect(h10.dignity.debilitatedPlanetKn).toContain("ಗುರು");

    // House 12 (Meena) -> Shukra Exalted, Budha Debilitated
    const h12 = HOUSE_LEARNING_MODULES[12];
    expect(h12.dignity.exaltedPlanetKn).toContain("ಶುಕ್ರ");
    expect(h12.dignity.debilitatedPlanetKn).toContain("ಬುಧ");
  });

  it("validates that all house quizzes have non-empty questions, options, and valid correct answers", () => {
    for (let h = 1; h <= 12; h++) {
      const house = HOUSE_LEARNING_MODULES[h];
      expect(house.quiz).toBeDefined();
      expect(house.quiz.length).toBeGreaterThanOrEqual(1);

      house.quiz.forEach((q) => {
        expect(q.questionKn.length).toBeGreaterThan(5);
        expect(q.questionEn.length).toBeGreaterThan(5);
        expect(q.optionsKn.length).toBeGreaterThanOrEqual(2);
        expect(q.optionsEn.length).toBeGreaterThanOrEqual(2);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.optionsKn.length);
        expect(q.explanationKn.length).toBeGreaterThan(5);
      });
    }
  });

  it("provides rich Graha placement outcomes with gifts and watch-outs", () => {
    const h1 = HOUSE_LEARNING_MODULES[1];
    expect(h1.grahaEffects.length).toBe(9); // All 9 planets defined for Lagna
    const sunEffect = h1.grahaEffects.find((g) => g.planetEn.includes("Sun"));
    expect(sunEffect).toBeDefined();
    expect(sunEffect?.keyGiftsKn.length).toBeGreaterThan(1);
    expect(sunEffect?.watchOutsKn.length).toBeGreaterThan(0);
  });
});
