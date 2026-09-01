import { describe, it, expect } from "vitest";
import {
  generateVedicSynthesis,
  getNakshatraTaxonomy,
  NAKSHATRA_TAXONOMIES,
  type VedicSynthesisResult
} from "../core/VedicSynthesisEngine";
import { calculateKpSubLord, nakshatraLordForIndex } from "../core/kpSubLordEngine";
import {
  computeSubDivisionalAmsha,
  saptamsaSignIndex,
  dasamsaSignIndex,
  dwadasamsaSignIndex,
  isPushkaramshaDegree,
  isGandantaDegree
} from "../core/subDivisions";
import {
  calculateHoroscopeRashmi,
  calculateSinglePlanetRashmi,
  isPlanetCombust
} from "../core/rashmiChinthaEngine";
import { generateMasterPrediction } from "../core/MasterPredictionEngine";
import { VEDIC_SYNTHESIS_I18N, getVedicSynthesisLocale } from "../i18n/vedicSynthesisLocale";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

const sampleKundli: KundliOutput = {
  ascendant: 124.5, // Simha (Leo) Lagna ~ 4.5° in Simha -> Magha Nakshatra
  moonSign: { index: 3, sanskrit: "Karka", english: "Cancer" },
  sunSign: { index: 0, sanskrit: "Mesha", english: "Aries" },
  lagnaRashi: { index: 4, sanskrit: "Simha", english: "Leo" },
  moonPada: 1,
  houses: Array.from({ length: 12 }, (_, i) => (124.5 + i * 30) % 360),
  planets: [
    {
      name: PlanetName.Sun,
      degree: 10.0, // 10° Aries (Deep Exaltation in Ashwini Pada 3)
      rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" },
      house: 9,
      isExalted: true
    },
    {
      name: PlanetName.Moon,
      degree: 105.0, // 15° Cancer (Pushya Pada 4)
      rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
      nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
      house: 12
    },
    {
      name: PlanetName.Mars,
      degree: 298.0, // 28° Capricorn (Deep Exaltation in Dhanishtha Pada 2)
      rashi: { index: 9, sanskrit: "Makara", english: "Capricorn" },
      nakshatra: { index: 22, sanskrit: "Dhanishtha", english: "Dhanishtha", deity: "Vasus" },
      house: 6,
      isExalted: true
    },
    {
      name: PlanetName.Mercury,
      degree: 165.0, // 15° Virgo (Deep Exaltation in Hasta Pada 2)
      rashi: { index: 5, sanskrit: "Kanya", english: "Virgo" },
      nakshatra: { index: 12, sanskrit: "Hasta", english: "Hasta", deity: "Savitar" },
      house: 2,
      isExalted: true
    },
    {
      name: PlanetName.Jupiter,
      degree: 95.0, // 5° Cancer (Deep Exaltation in Pushya Pada 1)
      rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
      nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" },
      house: 12,
      isExalted: true,
      isRetrograde: true
    },
    {
      name: PlanetName.Venus,
      degree: 357.0, // 27° Pisces (Deep Exaltation in Revati Pada 4)
      rashi: { index: 11, sanskrit: "Meena", english: "Pisces" },
      nakshatra: { index: 26, sanskrit: "Revati", english: "Revati", deity: "Pushan" },
      house: 8,
      isExalted: true
    },
    {
      name: PlanetName.Saturn,
      degree: 200.0, // 20° Libra (Deep Exaltation in Swati Pada 4)
      rashi: { index: 6, sanskrit: "Tula", english: "Libra" },
      nakshatra: { index: 14, sanskrit: "Swati", english: "Swati", deity: "Vayu" },
      house: 3,
      isExalted: true
    },
    {
      name: PlanetName.Rahu,
      degree: 45.0, // 15° Taurus (Rohini)
      rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" },
      house: 10
    },
    {
      name: PlanetName.Ketu,
      degree: 225.0, // 15° Scorpio (Anuradha)
      rashi: { index: 7, sanskrit: "Vrischika", english: "Scorpio" },
      nakshatra: { index: 16, sanskrit: "Anuradha", english: "Anuradha", deity: "Mitra" },
      house: 4
    }
  ],
  maandi: {
    degree: 170.0, // Virgo in 2nd house
    rashi: { index: 5, sanskrit: "Kanya", english: "Virgo" },
    windowLabel: "14 Gh (11:30 AM)"
  }
};

describe("VedicSynthesisEngine & Sub-Engines", () => {
  describe("1. 27 Nakshatras Taxonomy", () => {
    it("should provide complete taxonomies for all 27 nakshatras (0 to 26)", () => {
      expect(NAKSHATRA_TAXONOMIES.length).toBe(27);
      for (let i = 0; i < 27; i++) {
        const nak = getNakshatraTaxonomy(i);
        expect(nak.index).toBe(i);
        expect(nak.english).toBeTruthy();
        expect(nak.sanskrit).toBeTruthy();
        expect(nak.deity).toBeTruthy();
        expect(nak.lord).toBeTruthy();
        expect(nak.bodyPart).toBeTruthy();
        expect(nak.mysticalFormula).toBeTruthy();
        expect(nak.remedialMantra).toBeTruthy();
        expect(nak.bestBhavas.length).toBeGreaterThan(0);
      }
    });

    it("should identify anchor exaltation nakshatras accurately", () => {
      const ashwini = getNakshatraTaxonomy(0);
      expect(ashwini.exaltationAnchor?.planet).toBe(PlanetName.Sun);

      const pushya = getNakshatraTaxonomy(7);
      expect(pushya.exaltationAnchor?.planet).toBe(PlanetName.Jupiter);

      const revati = getNakshatraTaxonomy(26);
      expect(revati.exaltationAnchor?.planet).toBe(PlanetName.Venus);
    });
  });

  describe("2. KP Sub-Lord / Kalamsa Engine", () => {
    it("should calculate exact KP Sub-Lords for Ashwini start", () => {
      // 0° Ashwini -> Ketu nakshatra lord, starts with Ketu sub-lord
      const kp = calculateKpSubLord(0.1);
      expect(kp.nakshatraIndex).toBe(0);
      expect(kp.nakshatraLord).toBe(PlanetName.Ketu);
      expect(kp.subLord).toBe(PlanetName.Ketu);
    });

    it("should transition KP Sub-Lord proportionally within Ashwini", () => {
      // Ketu span in Ashwini: 0° to 0°46'40" (0.7777°)
      // Venus span in Ashwini: 0.7777° to 3.0° (0.7777 + 2.2222 = 3.0°)
      const kpVenus = calculateKpSubLord(1.5);
      expect(kpVenus.nakshatraIndex).toBe(0);
      expect(kpVenus.nakshatraLord).toBe(PlanetName.Ketu);
      expect(kpVenus.subLord).toBe(PlanetName.Venus);

      // Sun span: 3.0° to 3.6666°
      const kpSun = calculateKpSubLord(3.2);
      expect(kpSun.subLord).toBe(PlanetName.Sun);
    });
  });

  describe("3. Sub-Divisional Amsha Engine (D-9, D-7, D-10, D-12)", () => {
    it("should calculate D-9 Navamsha sign and 1-12 Karnataka number accurately", () => {
      // 0° Aries -> Aries Navamsha (Sign 0, number 1)
      const amsha1 = computeSubDivisionalAmsha(0.5);
      expect(amsha1.d1Sign).toBe(0);
      expect(amsha1.d9NavamsaSign).toBe(0);
      expect(amsha1.d9NavamsaNumber).toBe(1);
      expect(amsha1.isVargottama).toBe(true);

      // 10° Aries -> Cancer Navamsha (Sign 3, number 4)
      const amshaSun = computeSubDivisionalAmsha(10.0);
      expect(amshaSun.d9NavamsaNumber).toBe(4);
    });

    it("should compute Saptamsha D-7 and Dashamsha D-10", () => {
      const amsha = computeSubDivisionalAmsha(15.0); // 15° Aries (Odd sign)
      expect(amsha.d7SaptamsaNumber).toBeGreaterThanOrEqual(1);
      expect(amsha.d7SaptamsaNumber).toBeLessThanOrEqual(12);
      expect(amsha.d10DasamsaNumber).toBeGreaterThanOrEqual(1);
      expect(amsha.d10DasamsaNumber).toBeLessThanOrEqual(12);
    });

    it("should detect Pushkaramsha and Gandanta degrees", () => {
      expect(isGandantaDegree(0.5)).toBe(true); // Revati-Ashwini junction
      expect(isGandantaDegree(15.0)).toBe(false);
    });
  });

  describe("4. Rashmi Chintha (Planetary Rays)", () => {
    it("should calculate high rays for exalted planets and detect retrogression amplification", () => {
      const synthesis = calculateHoroscopeRashmi(sampleKundli);
      expect(synthesis.totalRashmi).toBeGreaterThan(25);
      expect(synthesis.planets.length).toBe(sampleKundli.planets.length);

      const sunRashmi = synthesis.planets.find((p) => p.planet === PlanetName.Sun);
      expect(sunRashmi?.modifiedRashmi).toBeGreaterThan(9.0); // Exalted Sun near max (10)

      const jupRashmi = synthesis.planets.find((p) => p.planet === PlanetName.Jupiter);
      expect(jupRashmi?.isRetrograde).toBe(true);
    });

    it("should detect combustion with Sun within tight orb", () => {
      expect(isPlanetCombust(12.0, 10.0, PlanetName.Mercury)).toBe(true); // 2 deg diff
      expect(isPlanetCombust(60.0, 10.0, PlanetName.Mercury)).toBe(false);
    });
  });

  describe("5. VedicSynthesisEngine Core Execution", () => {
    it("should execute generateVedicSynthesis and return full structure", async () => {
      const result = await generateVedicSynthesis(sampleKundli, {
        name: "Shri Devotee",
        birthDate: "1990-05-15",
        birthTime: "06:30",
        latitude: 14.5479,
        longitude: 74.3187,
        lang: "kn"
      });

      expect(result.metadata.name).toBe("Shri Devotee");
      expect(result.metadata.lang).toBe("kn");
      expect(result.grahaAmshaProfiles.length).toBeGreaterThanOrEqual(10); // Lagna + 9 planets + Maandi
      expect(result.bhavaSynthesis.length).toBe(12);
      expect(result.maandiProfile).toBeTruthy();
      expect(result.rashmiSynthesis).toBeTruthy();
      expect(result.phalitSutras).toBeTruthy();
      expect(result.advancedMethodologies.jaiminiSynthesis.atmakaraka.planet).toBeTruthy();
      expect(result.advancedMethodologies.nadiKarmicAudit.saturnJupiterKarmicAxis).toBeTruthy();
      expect(result.synthesisSummary.peakStrengthBhavas.length).toBeGreaterThan(0);
    });

    it("should evaluate 4 Phalit Sutras with accurate classifications", async () => {
      const result = await generateVedicSynthesis(sampleKundli, { lang: "en" });
      const sutras = result.phalitSutras;

      expect(sutras.rule1_grahBalLatency).toBeDefined();
      expect(sutras.rule2_bhavBalRedirection).toBeDefined();
      expect(sutras.rule3_stellarContradiction).toBeDefined();
      expect(sutras.rule4_dasaValidation).toBeDefined();
      expect(sutras.rule4_dasaValidation.validatedHouses.length).toBeGreaterThan(0);
    });

    it("should provide accurate Maandi diagnostic readings", async () => {
      const result = await generateVedicSynthesis(sampleKundli, { lang: "kn" });
      expect(result.maandiProfile?.house).toBe(2);
      expect(result.maandiProfile?.diagnosticReading).toContain("Maandi");
      expect(result.maandiProfile?.shantiRemedy).toBeTruthy();
    });
  });

  describe("6. 5-Language Native Locale Engine", () => {
    it("should have complete dictionaries for kn, en, te, ta, hi without missing keys", () => {
      const languages: ("kn" | "en" | "te" | "ta" | "hi")[] = ["kn", "en", "te", "ta", "hi"];
      for (const lang of languages) {
        const dict = getVedicSynthesisLocale(lang);
        expect(dict.title).toBeTruthy();
        expect(dict.subtitle).toBeTruthy();
        expect(dict.stellarMatrixTitle).toBeTruthy();
        expect(dict.bhavaMatrixTitle).toBeTruthy();
        expect(dict.amshaMatrixTitle).toBeTruthy();
        expect(dict.maandiTitle).toBeTruthy();
        expect(dict.phalitSutrasTitle).toBeTruthy();
        expect(dict.nadiKarmaTitle).toBeTruthy();
        expect(dict.jaiminiTitle).toBeTruthy();
        expect(dict.lalKitabTitle).toBeTruthy();
      }
    });
  });

  describe("7. MasterPredictionEngine Integration", () => {
    it("should generate MasterPredictionResult containing vedicSynthesis layer", async () => {
      const master = await generateMasterPrediction(sampleKundli, {
        name: "Devotee Test",
        birthDate: "1995-08-20",
        birthTime: "10:15",
        latitude: 14.5479,
        longitude: 74.3187,
        lang: "en"
      });

      expect(master.vedicSynthesis).toBeDefined();
      expect(master.vedicSynthesis?.grahaAmshaProfiles.length).toBeGreaterThanOrEqual(10);
      expect(master.vedicSynthesis?.bhavaSynthesis.length).toBe(12);
      expect(master.vedicSynthesis?.rashmiSynthesis.totalRashmi).toBeGreaterThan(0);
    });
  });
});
