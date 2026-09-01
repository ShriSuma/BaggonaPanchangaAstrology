import { describe, it, expect } from "vitest";
import {
  generatePanchangaAngaSynthesis,
  generateAstrologicalPrescriptions,
  generateCurrentLifeDiagnosis,
  YOGA_RULES,
  KARANA_RULES
} from "../core/PanchangaAngaSynthesisEngine";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

const sampleKundli: KundliOutput = {
  ascendant: 124.5, // Leo Lagna -> Lord Sun
  moonSign: { index: 3, sanskrit: "Karka", english: "Cancer" },
  sunSign: { index: 0, sanskrit: "Mesha", english: "Aries" },
  lagnaRashi: { index: 4, sanskrit: "Simha", english: "Leo" },
  moonPada: 1,
  houses: Array.from({ length: 12 }, (_, i) => (124.5 + i * 30) % 360),
  planets: [
    {
      name: PlanetName.Sun,
      degree: 10.0,
      rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" },
      house: 9,
      isExalted: true
    },
    {
      name: PlanetName.Moon,
      degree: 105.0, // Cancer in 12th house (Trika sector)
      rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
      nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
      house: 12
    },
    {
      name: PlanetName.Mars,
      degree: 298.0,
      rashi: { index: 9, sanskrit: "Makara", english: "Capricorn" },
      nakshatra: { index: 22, sanskrit: "Dhanishtha", english: "Dhanishtha", deity: "Vasus" },
      house: 6,
      isExalted: true
    },
    {
      name: PlanetName.Mercury,
      degree: 165.0,
      rashi: { index: 5, sanskrit: "Kanya", english: "Virgo" },
      nakshatra: { index: 12, sanskrit: "Hasta", english: "Hasta", deity: "Savitar" },
      house: 2,
      isExalted: true
    },
    {
      name: PlanetName.Jupiter,
      degree: 95.0,
      rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
      nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
      house: 12,
      isExalted: true
    },
    {
      name: PlanetName.Venus,
      degree: 357.0,
      rashi: { index: 11, sanskrit: "Meena", english: "Pisces" },
      nakshatra: { index: 26, sanskrit: "Revati", english: "Revati", deity: "Pushan" },
      house: 8,
      isExalted: true
    },
    {
      name: PlanetName.Saturn,
      degree: 200.0,
      rashi: { index: 6, sanskrit: "Tula", english: "Libra" },
      nakshatra: { index: 14, sanskrit: "Swati", english: "Swati", deity: "Vayu" },
      house: 3,
      isExalted: true
    },
    {
      name: PlanetName.Rahu,
      degree: 45.0,
      rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
      house: 10
    },
    {
      name: PlanetName.Ketu,
      degree: 225.0,
      rashi: { index: 7, sanskrit: "Vrischika", english: "Scorpio" },
      nakshatra: { index: 16, sanskrit: "Anuradha", english: "Anuradha", deity: "Mitra" },
      house: 4
    }
  ],
  maandi: {
    degree: 170.0,
    rashi: { index: 5, sanskrit: "Kanya", english: "Virgo" },
    windowLabel: "14 Gh"
  }
};

describe("PanchangaAngaSynthesisEngine", () => {
  describe("1. 27 Solar-Lunar Yogas", () => {
    it("should contain all 27 classical Yogas with deities and temperaments", () => {
      expect(YOGA_RULES.length).toBe(27);
      for (const y of YOGA_RULES) {
        expect(y.sanskrit).toBeTruthy();
        expect(y.english).toBeTruthy();
        expect(y.deity).toBeTruthy();
        expect(y.temperament).toBeTruthy();
      }
    });

    it("should classify auspicious and inauspicious Yogas correctly", () => {
      const vishkambha = YOGA_RULES.find((y) => y.english === "Vishkambha");
      expect(vishkambha?.isAuspicious).toBe(false);
      expect(vishkambha?.remedy).toBeTruthy();

      const saubhagya = YOGA_RULES.find((y) => y.english === "Saubhagya");
      expect(saubhagya?.isAuspicious).toBe(true);

      const vyatipata = YOGA_RULES.find((y) => y.english === "Vyatipata");
      expect(vyatipata?.isAuspicious).toBe(false);
      expect(vyatipata?.remedy).toContain("cows");
    });
  });

  describe("2. 11 Karanas Rules", () => {
    it("should contain 7 Chara and 4 Sthira Karanas with deities and symbols", () => {
      const keys = Object.keys(KARANA_RULES);
      expect(keys.length).toBe(11);

      const vishti = KARANA_RULES["Vishti"];
      expect(vishti.isVishtiBhadra).toBe(true);
      expect(vishti.type).toBe("Chara");
      expect(vishti.remedy).toBeTruthy();

      const shakuni = KARANA_RULES["Shakuni"];
      expect(shakuni.type).toBe("Sthira");
      expect(shakuni.symbol).toContain("Crow");
    });
  });

  describe("3. Astrological Prescriptions (Rudraksha, Gemstone Ring, Colors)", () => {
    it("should prescribe 1 Mukhi Rudraksha and Ruby (Manikya) for Leo (Simha) Lagna", () => {
      const prescriptions = generateAstrologicalPrescriptions(sampleKundli);
      expect(prescriptions.rudraksha.mukhi).toBe(1);
      expect(prescriptions.rudraksha.planet).toBe(PlanetName.Sun);
      expect(prescriptions.gemstoneRing.primaryGemstoneEn).toBe("Ruby");
      expect(prescriptions.gemstoneRing.fingerEn).toContain("Ring Finger");
      expect(prescriptions.luckyAttributes.carColors.length).toBeGreaterThan(0);
      expect(prescriptions.luckyAttributes.avoidColors).toContain("Dark Blue");
    });
  });

  describe("4. Current Life Diagnosis & Mental State", () => {
    it("should diagnose Trika Moon mental sensitivity and identify active challenge", () => {
      const diagnosis = generateCurrentLifeDiagnosis(sampleKundli, {
        birthDate: "1992-04-20",
        birthTime: "06:30",
        latitude: 14.5479,
        longitude: 74.3187
      });

      expect(diagnosis.mentalStateIssue.hasIssue).toBe(true);
      expect(diagnosis.mentalStateIssue.domain).toBe("Manassu (Mental Peace)");
      expect(diagnosis.mentalStateIssue.diagnosis).toContain("12");
      expect(diagnosis.primaryLifeChallenge.area).toBeTruthy();
      expect(diagnosis.prasthuthaSthiti.immediateRemedies.length).toBeGreaterThan(0);
      expect(diagnosis.astrologerTalkingPoints.openingIceBreakerKn).toBeTruthy();
      expect(diagnosis.astrologerTalkingPoints.hiddenSubconsciousWorryKn).toBeTruthy();
    });
  });

  describe("5. Master 5-Anga Synthesis Generation & Instant Q&A", () => {
    it("should generate full 5-Anga synthesis, multi-paragraph executive reading, and instant Q&A", () => {
      const output = generatePanchangaAngaSynthesis(sampleKundli, {
        birthDate: "1992-04-20",
        birthTime: "06:30",
        latitude: 14.5479,
        longitude: 74.3187,
        lang: "kn"
      });

      expect(output.panchanga.vara.nameKn).toBeTruthy();
      expect(output.panchanga.tithi.nameKn).toBeTruthy();
      expect(output.panchanga.yoga.rule).toBeTruthy();
      expect(output.panchanga.karana.rule).toBeTruthy();
      expect(output.prescriptions.rudraksha.mukhi).toBe(1);
      expect(output.prescriptions.gemstoneRing.panchangaSynergy).toBeTruthy();
      expect(output.instantQAList.length).toBeGreaterThanOrEqual(5);
      expect(output.instantQAList[0].panditScriptKn).toBeTruthy();
      expect(output.multiParagraphExecutiveReading.length).toBe(4);
      expect(output.multiParagraphExecutiveReading[0]).toContain("ಪಂಚಾಂಗ");
    });
  });
});
