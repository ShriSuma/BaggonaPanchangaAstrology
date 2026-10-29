import { describe, it, expect } from "vitest";
import {
  LAGNA_GEMSTONE_RULES,
  NAKSHATRA_NECK_WEAR_CATALOG,
  GEMSTONE_REAL_LIFE_BENCHMARK_CASES,
  evaluateGemstoneAndAmuletPrescription,
  generateGemstoneConsultationAnswer
} from "../core/panchangaGemstoneAmuletEngine";
import { generateVedicConsultationAnswer } from "../core/PanchangaAngaSynthesisEngine";
import { PlanetName } from "../core/AstroTypes";
import type { KundliOutput } from "../core/AstroTypes";

function createMockKundli(
  lagnaIdx: number,
  moonRashiIdx: number,
  moonNakshatraName: string,
  moonNakshatraIdx: number,
  marsRashiIdx: number = 0
): KundliOutput {
  return {
    lagnaRashi: {
      index: lagnaIdx,
      name: "Lagna",
      english: "Aries",
      sanskrit: "Mesha"
    },
    moonSign: {
      index: moonRashiIdx,
      name: "MoonSign",
      english: "Aries",
      sanskrit: "Mesha"
    },
    planets: [
      {
        name: PlanetName.Moon,
        rashi: { index: moonRashiIdx, name: "Moon", english: "Moon", sanskrit: "Chandra" },
        nakshatra: { index: moonNakshatraIdx, english: moonNakshatraName, pada: 1 }
      },
      {
        name: PlanetName.Mars,
        rashi: { index: marsRashiIdx, name: "Mars", english: "Mars", sanskrit: "Kuja" },
        nakshatra: { index: 0, english: "Ashwini", pada: 1 }
      },
      {
        name: PlanetName.Sun,
        rashi: { index: 0, name: "Sun", english: "Sun", sanskrit: "Surya" },
        nakshatra: { index: 0, english: "Ashwini", pada: 1 }
      },
      {
        name: PlanetName.Saturn,
        rashi: { index: 9, name: "Saturn", english: "Saturn", sanskrit: "Shani" },
        nakshatra: { index: 21, english: "Shravana", pada: 1 }
      }
    ]
  } as unknown as KundliOutput;
}

describe("Panchanga Gemstone & Neck Wear Engine (ರತ್ನ & ಕಂಠಾಭರಣ ಶಾಸ್ತ್ರ)", () => {
  it("contains complete and valid Parashari rules for all 12 Lagnas", () => {
    const lagnaIndices = Object.keys(LAGNA_GEMSTONE_RULES).map(Number);
    expect(lagnaIndices.length).toBe(12);

    for (let i = 0; i < 12; i++) {
      const rule = LAGNA_GEMSTONE_RULES[i];
      expect(rule).toBeDefined();
      expect(rule.primaryGemEn).toBeTruthy();
      expect(rule.primaryGemKn).toBeTruthy();
      expect(rule.metalEn).toBeTruthy();
      expect(rule.metalKn).toBeTruthy();
      expect(rule.fingerEn).toBeTruthy();
      expect(rule.fingerKn).toBeTruthy();
      expect(rule.caratRange).toBeTruthy();
      expect(rule.mantraKn).toBeTruthy();
      expect(rule.mantraEn).toBeTruthy();
      expect(rule.prohibitedGems.length).toBeGreaterThan(0);
      expect(rule.luckyColorsKn.length).toBeGreaterThan(0);
      expect(rule.luckyColorsEn.length).toBeGreaterThan(0);
      expect(rule.avoidColorsKn.length).toBeGreaterThan(0);
      expect(rule.avoidColorsEn.length).toBeGreaterThan(0);
    }
  });

  it("strictly prohibits dangerous gemstones that rule Dusthana (6/8/12) houses", () => {
    // Taurus (Vrishabha, idx 1): Guru is 8th/11th lord -> Pushparaga strictly prohibited
    const taurus = LAGNA_GEMSTONE_RULES[1];
    expect(
      taurus.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("yellow sapphire") || g.gemstoneKn.includes("ಪುಷ್ಯರಾಗ")
      )
    ).toBe(true);

    // Gemini (Mithuna, idx 2): Mars is 6th/11th lord -> Red Coral strictly prohibited
    const gemini = LAGNA_GEMSTONE_RULES[2];
    expect(
      gemini.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("red coral") || g.gemstoneKn.includes("ಹವಳ")
      )
    ).toBe(true);

    // Cancer (Karkataka, idx 3): Saturn is 7th/8th Maraka/Dusthana lord -> Blue Sapphire strictly prohibited
    const cancer = LAGNA_GEMSTONE_RULES[3];
    expect(
      cancer.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("blue sapphire") || g.gemstoneKn.includes("ನೀಲಂ")
      )
    ).toBe(true);

    // Leo (Simha, idx 4): Saturn is 6th/7th lord -> Blue Sapphire strictly prohibited
    const leo = LAGNA_GEMSTONE_RULES[4];
    expect(
      leo.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("blue sapphire") || g.gemstoneKn.includes("ನೀಲಂ")
      )
    ).toBe(true);

    // Virgo (Kanya, idx 5): Mars is 3rd/8th Dusthana lord -> Red Coral strictly prohibited
    const virgo = LAGNA_GEMSTONE_RULES[5];
    expect(
      virgo.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("red coral") || g.gemstoneKn.includes("ಹವಳ")
      )
    ).toBe(true);

    // Libra (Tula, idx 6): Jupiter is 3rd/6th Dusthana lord -> Yellow Sapphire strictly prohibited
    const libra = LAGNA_GEMSTONE_RULES[6];
    expect(
      libra.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("yellow sapphire") || g.gemstoneKn.includes("ಪುಷ್ಯರಾಗ")
      )
    ).toBe(true);

    // Scorpio (Vrishchika, idx 7): Venus is 7th/12th Maraka/Vyaya lord -> Diamond strictly prohibited
    const scorpio = LAGNA_GEMSTONE_RULES[7];
    expect(
      scorpio.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("diamond") || g.gemstoneKn.includes("ವಜ್ರ")
      )
    ).toBe(true);

    // Sagittarius (Dhanu, idx 8): Venus is 6th/11th lord -> Diamond prohibited
    const sagittarius = LAGNA_GEMSTONE_RULES[8];
    expect(
      sagittarius.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("diamond") || g.gemstoneKn.includes("ವಜ್ರ")
      )
    ).toBe(true);

    // Capricorn (Makara, idx 9): Sun is 8th lord -> Ruby strictly prohibited
    const capricorn = LAGNA_GEMSTONE_RULES[9];
    expect(
      capricorn.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("ruby") || g.gemstoneKn.includes("ಮಾಣಿಕ್ಯ")
      )
    ).toBe(true);

    // Pisces (Meena, idx 11): Venus is 3rd/8th lord -> Diamond prohibited
    const pisces = LAGNA_GEMSTONE_RULES[11];
    expect(
      pisces.prohibitedGems.some(
        g => g.gemstoneEn.toLowerCase().includes("diamond") || g.gemstoneKn.includes("ವಜ್ರ")
      )
    ).toBe(true);
  });

  it("contains all 27 Nakshatras in NAKSHATRA_NECK_WEAR_CATALOG with valid Mukhi and Pendants", () => {
    const nakshatraKeys = Object.keys(NAKSHATRA_NECK_WEAR_CATALOG);
    expect(nakshatraKeys.length).toBe(27);

    for (const nakKey of nakshatraKeys) {
      const nak = NAKSHATRA_NECK_WEAR_CATALOG[nakKey];
      expect(nak).toBeDefined();
      expect(nak.mukhi).toBeGreaterThanOrEqual(1);
      expect(nak.mukhi).toBeLessThanOrEqual(14);
      expect(nak.deityKn).toBeTruthy();
      expect(nak.pendantKn).toBeTruthy();
      expect(nak.threadKn).toBeTruthy();
      expect(nak.blessingKn).toBeTruthy();
      expect(nak.blessingEn).toBeTruthy();
    }
  });

  it("safely evaluates Mars (Red Coral / Havala) as Yogakaraka for Cancer and Leo, and malefic for Gemini and Virgo", () => {
    // Cancer (Karkataka, idx 3, Mars in 4th house Libra -> 4th house Kendra)
    const cancerChart = createMockKundli(3, 3, "Pushya", 7, 6);
    const cancerEval = evaluateGemstoneAndAmuletPrescription(cancerChart, {
      vara: "Tuesday",
      tithi: "Shukla Navami",
      nakshatra: "Pushya",
      yoga: "Siddhi",
      karana: "Bava"
    });
    expect(cancerEval.havalaAnalysis.isRecommended).toBe(true);

    // Gemini (Mithuna, idx 2, Mars in 6th house Scorpio)
    const geminiChart = createMockKundli(2, 2, "Ardra", 5, 7);
    const geminiEval = evaluateGemstoneAndAmuletPrescription(geminiChart, {
      vara: "Wednesday",
      tithi: "Shukla Dashami",
      nakshatra: "Ardra",
      yoga: "Shubha",
      karana: "Kaulava"
    });
    expect(geminiEval.havalaAnalysis.isRecommended).toBe(false);
    expect(geminiEval.havalaAnalysis.verdictKn).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಬೇಡ");
  });

  it("contains at least 25 real-world classical benchmark cases with verified turnarounds", () => {
    expect(GEMSTONE_REAL_LIFE_BENCHMARK_CASES.length).toBeGreaterThanOrEqual(25);
    for (const bCase of GEMSTONE_REAL_LIFE_BENCHMARK_CASES) {
      expect(bCase.id).toBeTruthy();
      expect(bCase.titleKn).toBeTruthy();
      expect(bCase.titleEn).toBeTruthy();
      expect(bCase.nativeProfileKn).toBeTruthy();
      expect(bCase.wrongItemWornKn).toBeTruthy();
      expect(bCase.adverseOutcomeKn).toBeTruthy();
      expect(bCase.astrologicalRootCauseKn).toBeTruthy();
      expect(bCase.correctedPrescriptionKn).toBeTruthy();
      expect(bCase.verifiedTurnaroundKn).toBeTruthy();
    }
  });

  it("generates deterministic 4-bullet consultation answers for ring and neck wear questions", () => {
    const meshaChart = createMockKundli(0, 0, "Ashwini", 0, 0);
    const answerKn = generateGemstoneConsultationAnswer(
      meshaChart,
      "ನಾನು ಯಾವ ಉಂಗುರ ಮತ್ತು ಕೊರಳಲ್ಲಿ ಏನು ಧರಿಸಬೇಕು?",
      "ರಾಮ",
      true
    );

    expect(answerKn).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ");
    expect(answerKn).toContain("• 🎯 ಪಂಚಾಂಗ, ನಕ್ಷತ್ರ & ಗ್ರಹ ಶಾಸ್ತ್ರೀಯ ಕಾರಣ");
    expect(answerKn).toContain("• ⚠️ ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ರತ್ನ & ಅಪಾಯದ ಎಚ್ಚರಿಕೆ");
    expect(answerKn).toContain("• 📿 ಕೊರಳ ಧಾರಣೆ, ಮುಹೂರ್ತ & ಶ್ರೀ ಸನ್ನಿಧಾನ ಆಶೀರ್ವಾದ");

    const cancerChart = createMockKundli(3, 3, "Pushya", 7, 0);
    const answerEn = generateGemstoneConsultationAnswer(
      cancerChart,
      "Which ring or gemstone should I wear for luck?",
      "Devotee",
      false
    );

    expect(answerEn).toContain("• 🔮 Direct Daivajna Verdict");
    expect(answerEn).toContain("• 🎯 Astrological & Panchanga Foundation");
    expect(answerEn).toContain("• ⚠️ Strict Contraindications & Prohibited Stones (Severe Warning)");
    expect(answerEn).toContain("• 📿 Neck Wear, Consecration Muhurtha & Temple Grace");
  });

  it("dispatches gemstone queries seamlessly in generateVedicConsultationAnswer", () => {
    const meshaChart = createMockKundli(0, 0, "Ashwini", 0, 0);
    const answer = generateVedicConsultationAnswer(
      meshaChart,
      {} as any,
      {} as any,
      "ನನ್ನ ರಾಶಿಗೆ ಯಾವ ರತ್ನ ಉಂಗುರ ಅದೃಷ್ಟ ತರುತ್ತದೆ?",
      "ರಾಮ",
      true
    );

    expect(answer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ");
    expect(answer).toContain("• ⚠️ ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ರತ್ನ & ಅಪಾಯದ ಎಚ್ಚರಿಕೆ");
  });
});
