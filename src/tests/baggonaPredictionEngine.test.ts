import { describe, expect, it } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { generateBaggonaPredictions, generatePersonalReading } from "../core/BaggonaPredictionEngine";

describe("BaggonaPredictionEngine", () => {
  it("computes traditional predictions for Pramod (31-May-1993)", () => {
    const birth = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3187
    };
    const k = calculateKundli({ name: "Pramod", ...birth }, { ayanamsaModel: "lahiri" });
    const trad = calculateTraditionalBaggona(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, "lahiri");

    const preds = generateBaggonaPredictions(k, trad);

    expect(preds.overview.length).toBeGreaterThan(0);
    expect(preds.planets.length).toBe(9); // 9 planets
    expect(preds.houses.length).toBe(12); // 12 houses
    expect(preds.yogas.length).toBeGreaterThan(0);
    expect(preds.longevity.length).toBeGreaterThan(0);

    // Verify some specific values from the PDF rules
    const sunPred = preds.planets.find(p => p.title.startsWith("Sun"));
    expect(sunPred).toBeDefined();
    expect(sunPred?.description).toContain("Kshatriya (Warrior)");
    expect(sunPred?.description).toContain("Shiva");

    const jupiterPred = preds.planets.find(p => p.title.startsWith("Jupiter"));
    expect(jupiterPred).toBeDefined();
    expect(jupiterPred?.description).toContain("Brahmana (Priest/Intellectual)");
    expect(jupiterPred?.description).toContain("Shiva (Guru)");

    // Test Personal Reading
    const personal = generatePersonalReading(k, birth);
    expect(personal.cosmicProfile.length).toBeGreaterThan(0);
    expect(personal.todaysTransits.length).toBeGreaterThan(0);
    expect(personal.currentLifeChapter.cycle).toBeDefined();
    expect(personal.upcomingChapters.chapter1.cycle).toBeDefined();
    expect(personal.upcomingChapters.chapter2.cycle).toBeDefined();
  });

  it("computes traditional predictions for Vidyashree (24-Oct-1997)", () => {
    const birth = {
      birthDate: "1997-10-24",
      birthTime: "20:15",
      latitude: 14.5479,
      longitude: 74.3187
    };
    const k = calculateKundli({ name: "Vidyashree", ...birth }, { ayanamsaModel: "lahiri" });
    const trad = calculateTraditionalBaggona(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, "lahiri");

    const preds = generateBaggonaPredictions(k, trad);

    expect(preds.overview.length).toBeGreaterThan(0);
    expect(preds.planets.length).toBe(9);
    expect(preds.houses.length).toBe(12);
    expect(preds.yogas.length).toBeGreaterThan(0);
    expect(preds.longevity.length).toBeGreaterThan(0);

    // Test Personal Reading
    const personal = generatePersonalReading(k, birth);
    expect(personal.cosmicProfile.length).toBeGreaterThan(0);
    expect(personal.todaysTransits.length).toBeGreaterThan(0);
    expect(personal.currentLifeChapter.cycle).toBeDefined();
    expect(personal.upcomingChapters.chapter1.cycle).toBeDefined();
    expect(personal.upcomingChapters.chapter2.cycle).toBeDefined();
  });
});
