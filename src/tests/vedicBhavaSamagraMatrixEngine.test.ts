import { describe, it, expect } from "vitest";
import {
  evaluateBhavaSamagraMatrix,
  evaluateAll12Bhavas,
  BHAVA_METADATA,
  KN_PLANET_NAMES,
  KN_RASHI_NAMES
} from "../core/VedicBhavaSamagraMatrixEngine";
import { PlanetName, type KundliOutput, type PlanetPosition } from "../core/AstroTypes";

// Helper to construct mock Kundli charts
const createMockKundli = (overrides?: Partial<KundliOutput>): KundliOutput => {
  const defaultPlanets: PlanetPosition[] = [
    // Sun in Aries (Exalted, degree 10) -> House 1
    {
      name: PlanetName.Sun,
      degree: 10,
      rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" },
      house: 1
    },
    // Moon in Taurus (Exalted, degree 35 -> Rohini) -> House 2
    {
      name: PlanetName.Moon,
      degree: 45,
      rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
      house: 2
    },
    // Mars in Capricorn (Exalted, degree 280) -> House 10
    {
      name: PlanetName.Mars,
      degree: 280,
      rashi: { index: 9, sanskrit: "Makara", english: "Capricorn" },
      nakshatra: { index: 21, sanskrit: "Shravana", english: "Shravana", deity: "Vishnu" },
      house: 10
    },
    // Mercury in Gemini (Own sign, degree 70) -> House 3
    {
      name: PlanetName.Mercury,
      degree: 70,
      rashi: { index: 2, sanskrit: "Mithuna", english: "Gemini" },
      nakshatra: { index: 5, sanskrit: "Ardra", english: "Ardra", deity: "Rudra" },
      house: 3
    },
    // Jupiter in Cancer (Exalted, degree 95) -> House 4
    {
      name: PlanetName.Jupiter,
      degree: 95,
      rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
      nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
      house: 4
    },
    // Venus in Pisces (Exalted, degree 350) -> House 12
    {
      name: PlanetName.Venus,
      degree: 350,
      rashi: { index: 11, sanskrit: "Meena", english: "Pisces" },
      nakshatra: { index: 26, sanskrit: "Revati", english: "Revati", deity: "Pushan" },
      house: 12
    },
    // Saturn in Libra (Exalted, degree 200) -> House 7
    {
      name: PlanetName.Saturn,
      degree: 200,
      rashi: { index: 6, sanskrit: "Tula", english: "Libra" },
      nakshatra: { index: 15, sanskrit: "Vishakha", english: "Vishakha", deity: "Indra-Agni" },
      house: 7
    },
    // Rahu in Taurus (degree 50) -> House 2
    {
      name: PlanetName.Rahu,
      degree: 50,
      rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
      house: 2
    },
    // Ketu in Scorpio (degree 230) -> House 8
    {
      name: PlanetName.Ketu,
      degree: 230,
      rashi: { index: 7, sanskrit: "Vrischika", english: "Scorpio" },
      nakshatra: { index: 17, sanskrit: "Jyeshtha", english: "Jyeshtha", deity: "Indra" },
      house: 8
    }
  ];

  return {
    ascendant: 15,
    planets: defaultPlanets,
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    moonSign: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
    sunSign: { index: 0, sanskrit: "Mesha", english: "Aries" },
    lagnaRashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
    moonPada: 1,
    birthSunTimes: {
      sunrise: "1995-05-15T06:00:00Z",
      sunset: "1995-05-15T18:30:00Z",
      source: "suncalc"
    },
    ...overrides
  };
};

describe("VedicBhavaSamagraMatrixEngine", () => {
  it("should evaluate all 12 houses with valid scores between 0 and 100", () => {
    const kundli = createMockKundli();
    const result = evaluateAll12Bhavas(kundli);

    expect(result.houses).toHaveLength(12);
    expect(result.overallStrongestHouse).toBeGreaterThanOrEqual(1);
    expect(result.overallStrongestHouse).toBeLessThanOrEqual(12);
    expect(result.overallChallengingHouse).toBeGreaterThanOrEqual(1);
    expect(result.overallChallengingHouse).toBeLessThanOrEqual(12);

    for (const h of result.houses) {
      expect(h.netCompositeScore).toBeGreaterThanOrEqual(0);
      expect(h.netCompositeScore).toBeLessThanOrEqual(100);
      expect(h.lagnaPerspectiveScore).toBeGreaterThanOrEqual(0);
      expect(h.lagnaPerspectiveScore).toBeLessThanOrEqual(100);
      expect(h.bhavatBhavamScore).toBeGreaterThanOrEqual(0);
      expect(h.bhavatBhavamScore).toBeLessThanOrEqual(100);
      expect(h.gocharaTransitScore).toBeGreaterThanOrEqual(0);
      expect(h.gocharaTransitScore).toBeLessThanOrEqual(100);
      expect(h.dashaBhuktiScore).toBeGreaterThanOrEqual(0);
      expect(h.dashaBhuktiScore).toBeLessThanOrEqual(100);
      expect(h.navamshaScore).toBeGreaterThanOrEqual(0);
      expect(h.navamshaScore).toBeLessThanOrEqual(100);
      expect(h.nakshatraScore).toBeGreaterThanOrEqual(0);
      expect(h.nakshatraScore).toBeLessThanOrEqual(100);

      expect(h.signNameKn).toBeTruthy();
      expect(h.signNameEn).toBeTruthy();
      expect(h.houseLordKn).toBeTruthy();
      expect(h.houseLordEn).toBeTruthy();
      expect(h.strengthGradeKn).toBeTruthy();
      expect(h.strengthGradeEn).toBeTruthy();
    }
  });

  it("evaluates the 10th house (Career/Karma) according to the user's audio scenario", () => {
    const kundli = createMockKundli();
    const h10 = evaluateBhavaSamagraMatrix({
      kundli,
      targetHouse: 10
    });

    expect(h10.houseNumber).toBe(10);
    expect(h10.signIndex).toBe(9); // Capricorn (Makara) for Aries Lagna
    expect(h10.signNameKn).toBe("ಮಕರ");
    expect(h10.signNameEn).toBe("Capricorn");
    expect(h10.houseLord).toBe(PlanetName.Saturn);
    expect(h10.houseLordKn).toBe("ಶನಿ");

    // In mock chart, Saturn is exalted in Libra in 7th house (Kendra)
    expect(h10.houseLordDignity).toBe("exalted");
    expect(h10.lagnaPerspectiveScore).toBeGreaterThan(70);

    // Mars is in 10th house (Exalted Kuja in Makara)
    expect(h10.occupants.some((o) => o.name === PlanetName.Mars)).toBe(true);

    // Bhavat Bhavam counterpart for 10th is 7th house
    expect(BHAVA_METADATA[10]!.bhavatBhavamCounterpart).toBe(7);
    expect(h10.bhavatBhavamSummaryKn).toContain("ಭಾವತ್ ಭಾವಂ");
  });

  it("handles the classical Parashari reversal rule: Debilitated in Rashi but Exalted Nakshatra Lord", () => {
    // Construct a chart where 1st house lord (Mars for Aries Lagna) is debilitated in Cancer (rashi index 3),
    // but its Nakshatra is Pushya (ruled by Saturn), and Saturn is exalted in Libra in 7th Kendra!
    const kundli = createMockKundli({
      planets: [
        {
          name: PlanetName.Mars,
          degree: 100, // Cancer, Pushya nakshatra (ruled by Saturn)
          rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
          nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
          house: 4
        },
        {
          name: PlanetName.Saturn,
          degree: 200, // Libra (exalted!) in 7th Kendra
          rashi: { index: 6, sanskrit: "Tula", english: "Libra" },
          nakshatra: { index: 15, sanskrit: "Vishakha", english: "Vishakha", deity: "Indra-Agni" },
          house: 7
        },
        {
          name: PlanetName.Moon,
          degree: 45, // Taurus
          rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
          nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
          house: 2
        }
      ]
    });

    const h1 = evaluateBhavaSamagraMatrix({
      kundli,
      targetHouse: 1
    });

    expect(h1.houseLord).toBe(PlanetName.Mars);
    expect(h1.houseLordDignity).toBe("debilitated");
    // Nakshatra ruler is Saturn which is exalted in Kendra
    expect(h1.nakshatraSummaryKn).toContain("ಉಚ್ಚ");
    expect(h1.nakshatraScore).toBeGreaterThanOrEqual(70);
  });

  it("detects Vargottama and Amshaka elevation in Navamsha D9", () => {
    // Place Mars in Aries (degree 1) -> Navamsha is Aries (0 to 3°20' of movable sign is Vargottama)
    const kundli = createMockKundli({
      planets: [
        {
          name: PlanetName.Mars,
          degree: 2.5, // Aries D1 and Aries D9 (Vargottama!)
          rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
          nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" },
          house: 1
        },
        {
          name: PlanetName.Moon,
          degree: 45,
          rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
          nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
          house: 2
        }
      ]
    });

    const h1 = evaluateBhavaSamagraMatrix({
      kundli,
      targetHouse: 1
    });

    expect(h1.navamshaSummaryKn).toContain("ವರ್ಗೋತ್ತಮ");
    expect(h1.navamshaSummaryEn).toContain("Vargottama");
    expect(h1.navamshaScore).toBeGreaterThanOrEqual(75);
  });

  it("respects pure Kannada language without English token leaks in Kannada summaries", () => {
    const kundli = createMockKundli();
    const result = evaluateAll12Bhavas(kundli);

    const englishWordsToForbid = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
      "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"
    ];

    for (const h of result.houses) {
      for (const word of englishWordsToForbid) {
        expect(h.lagnaPerspectiveSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.bhavatBhavamSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.gocharaSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.dashaSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.navamshaSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.nakshatraSummaryKn).not.toMatch(new RegExp(`\\b${word}\\b`));
        expect(h.synthesisKn).not.toMatch(new RegExp(`\\b${word}\\b`));
      }
    }

    for (const word of englishWordsToForbid) {
      expect(result.lifePathSynthesisKn).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });

  it("accurately evaluates custom transit positions in Gochara analysis", () => {
    const kundli = createMockKundli();
    // Test transit Jupiter directly in 10th house (Capricorn = 9)
    const h10WithTransitJupiter = evaluateBhavaSamagraMatrix({
      kundli,
      targetHouse: 10,
      transitPositions: {
        Jupiter: { degree: 285, rashiIndex: 9 }, // Directly in 10th house
        Saturn: { degree: 60, rashiIndex: 2 }   // Gemini
      }
    });

    expect(h10WithTransitJupiter.gocharaTransitScore).toBeGreaterThanOrEqual(75);
    expect(h10WithTransitJupiter.gocharaSummaryKn).toContain("ಗೋಚಾರ ಗುರು");
    expect(h10WithTransitJupiter.gocharaSummaryEn).toContain("Jupiter");
  });
});
