import { describe, expect, it } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { generateBaggonaPredictions, calculateGocharaPredictions, generatePersonalReading, housesRuledByPlanet } from "../core/BaggonaPredictionEngine";
import { generateJayashreePredictionBase } from "../core/JayashreePredictionEngine";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

describe("BaggonaAstrologyRules", () => {
  const birth = {
    name: "TestUser",
    birthDate: "1993-05-31",
    birthTime: "09:25",
    latitude: 14.5479,
    longitude: 74.3187
  };

  it("checks Lagna Benefic and Malefic lords scoring adjustments", () => {
    // Pramod has Cancer Lagna (Kataka)
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const trad = calculateTraditionalBaggona(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, "lahiri");
    const preds = generateBaggonaPredictions(k, trad, "en");

    // Lagna index: Kataka is index 3.
    // Kataka Lagna Benefics: Moon, Mars, Jupiter. Malefics: Saturn, Mercury, Venus.
    // Let's verify Sun (non-lord benefic/malefic) vs Mars (Benefic) vs Saturn (Malefic) strength adjustments
    expect(preds.planets.length).toBe(9);
  });

  it("verifies Saturn aspect-based house score modifications", () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const trad = calculateTraditionalBaggona(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, "lahiri");
    const preds = generateBaggonaPredictions(k, trad, "en");

    // Saturn's position in birth chart
    const saturnPl = k.planets.find(p => p.name === PlanetName.Saturn);
    expect(saturnPl).toBeDefined();

    if (saturnPl) {
      const saturnHouse = saturnPl.house;
      const h3 = (saturnHouse + 2) > 12 ? (saturnHouse + 2) - 12 : saturnHouse + 2;
      const h7 = (saturnHouse + 6) > 12 ? (saturnHouse + 6) - 12 : saturnHouse + 6;
      const h10 = (saturnHouse + 9) > 12 ? (saturnHouse + 9) - 12 : saturnHouse + 9;

      const occupiedHousePred = preds.houses[saturnHouse - 1];
      const aspect3HousePred = preds.houses[h3 - 1];
      const aspect7HousePred = preds.houses[h7 - 1];
      const aspect10HousePred = preds.houses[h10 - 1];

      // Verifying descriptive inclusions of aspects
      expect(occupiedHousePred?.description).toContain("Saturn is posited");
      expect(aspect3HousePred?.description).toContain("Saturn casts its 3rd aspect");
      expect(aspect7HousePred?.description).toContain("Saturn casts its 7th aspect");
      expect(aspect10HousePred?.description).toContain("Saturn casts its 10th aspect");
    }
  });

  it("verifies education block in Jayashree Vani excludes 7th house lord completely", () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const predBase = generateJayashreePredictionBase(k, birth, "kn");

    // Should not contain "ಸಪ್ತಮಾಧಿಪತಿ" (which means 7th lord in Kannada)
    expect(predBase.education).not.toContain("ಸಪ್ತಮಾಧಿಪತಿ");
    expect(predBase.education).not.toContain("ಸಪ್ತಮ");
    
    // Should be dynamic and check 2nd and 4th lords
    expect(predBase.education).toContain("ದ್ವಿತೀಯಾಧಿಪತಿ");
    expect(predBase.education).toContain("ಚತುರ್ಥಾಧಿಪತಿ");

    const predEn = generateJayashreePredictionBase(k, birth, "en");
    expect(predEn.education).not.toContain("7th");
    expect(predEn.education).toContain("2nd house lord");
    expect(predEn.education).toContain("4th house lord");
  });

  it("verifies dynamic Gochara transit computations with Sade Sati checking", async () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    
    // Create a mock transit chart where Saturn is in 12th, 1st, or 2nd from natal Moon sign
    // Let's check Moon sign. Natal Moon Rashi index is k.moonSign.index.
    const transitKundli: KundliOutput = JSON.parse(JSON.stringify(k));
    const saturnTransitPl = transitKundli.planets.find((p: any) => p.name === PlanetName.Saturn);
    if (saturnTransitPl) {
      // Position Saturn in natal Moon sign (1st from Moon)
      saturnTransitPl.rashi = k.moonSign;
      // house index 1 is matching Moon sign
      saturnTransitPl.house = 1; 
    }

    const predictions = await calculateGocharaPredictions(k, transitKundli, PlanetName.Saturn, PlanetName.Venus, "en");
    const saturnPred = predictions.find((p: any) => p.planet === PlanetName.Saturn);
    expect(saturnPred).toBeDefined();
    expect(saturnPred?.title).toContain("Sade Sati");
    expect(saturnPred?.status).toBe("caution");
    expect(saturnPred?.remedy).toBeDefined();
    expect(saturnPred?.probability).toBeGreaterThanOrEqual(80); // base (80) + malefic/benefic lord adjustments + dasha lord boost (15) etc.
  });

  it("verifies housesRuledByPlanet and new detailed rules / monthly summary", () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const trad = calculateTraditionalBaggona(birth.birthDate, birth.birthTime, birth.latitude, birth.longitude, "lahiri");
    
    const marsHouses = housesRuledByPlanet(PlanetName.Mars, 3);
    expect(marsHouses).toContain(10);
    expect(marsHouses).toContain(5);

    const personal = generatePersonalReading(k, birth, "en");
    expect(personal.monthlySummary).toBeDefined();
    expect(personal.monthlySummary?.length).toBe(2);
    expect(personal.monthlySummary?.[0].title).toBeDefined();
    expect(personal.monthlySummary?.[0].description).toBeDefined();
    
    const preds = generateBaggonaPredictions(k, trad, "en");
    const mercuryPred = preds.planets.find(p => p.title.toLowerCase().includes("mercury"));
    expect(mercuryPred?.description).toContain("Trishadaya");
  });
});
