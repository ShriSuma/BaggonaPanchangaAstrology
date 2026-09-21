import { describe, it, expect } from "vitest";
import {
  determineAccurateProfession,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { PlanetName, type KundliOutput, type PlanetPosition, type Rashi, type Nakshatra } from "../core/AstroTypes";

describe("Career Fields & Lifetime Marriage Destiny Engine Audit", () => {
  const createMockKundli = (overrides?: Partial<KundliOutput>): KundliOutput => {
    const defaultRashi: Rashi = {
      index: 0, // Aries
      english: "Aries",
      sanskrit: "Mesha"
    };

    const dummyNakshatra: Nakshatra = {
      index: 0,
      sanskrit: "Ashwini",
      english: "Ashwini",
      deity: "Ashvins"
    };

    const dummyPlanets: PlanetPosition[] = [
      { name: PlanetName.Sun, house: 10, degree: 280, nakshatra: dummyNakshatra, rashi: { index: 9, english: "Capricorn", sanskrit: "Makara" }, isRetrograde: false },
      { name: PlanetName.Moon, house: 1, degree: 15, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Mars, house: 10, degree: 298, nakshatra: dummyNakshatra, rashi: { index: 9, english: "Capricorn", sanskrit: "Makara" }, isRetrograde: false }, // Exalted Mars in 10th (Ruchaka Yoga)
      { name: PlanetName.Mercury, house: 11, degree: 310, nakshatra: dummyNakshatra, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, isRetrograde: false },
      { name: PlanetName.Jupiter, house: 9, degree: 250, nakshatra: dummyNakshatra, rashi: { index: 8, english: "Sagittarius", sanskrit: "Dhanus" }, isRetrograde: false }, // Own sign 9th house
      { name: PlanetName.Venus, house: 7, degree: 200, nakshatra: dummyNakshatra, rashi: { index: 6, english: "Libra", sanskrit: "Tula" }, isRetrograde: false }, // Own sign in 7th
      { name: PlanetName.Saturn, house: 11, degree: 320, nakshatra: dummyNakshatra, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, isRetrograde: false },
      { name: PlanetName.Rahu, house: 3, degree: 70, nakshatra: dummyNakshatra, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, isRetrograde: true },
      { name: PlanetName.Ketu, house: 9, degree: 250, nakshatra: dummyNakshatra, rashi: { index: 8, english: "Sagittarius", sanskrit: "Dhanus" }, isRetrograde: true }
    ];

    return {
      ascendant: 10,
      lagnaRashi: defaultRashi,
      moonSign: defaultRashi,
      sunSign: { index: 9, english: "Capricorn", sanskrit: "Makara" },
      moonPada: 1,
      planets: dummyPlanets,
      houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      ...overrides
    };
  };

  // =========================================================================
  // 1. CAREER FIELDS WHERE NATIVE WILL SHINE AUDIT
  // =========================================================================
  describe("Career Fields Where Native Shines & Flourishes", () => {
    it("computes ranked career fields with suitability percentages and whyNativeShinesKn explanations", () => {
      const chart = createMockKundli();
      const prof = determineAccurateProfession(chart, { devoteeName: "ಆದರ್ಶ", devoteeAge: 28 });

      expect(prof.topSuitableFields).toBeDefined();
      expect(prof.topSuitableFields!.length).toBeGreaterThanOrEqual(5);

      // Verify descending order of suitability
      for (let i = 0; i < prof.topSuitableFields!.length - 1; i++) {
        expect(prof.topSuitableFields![i].suitabilityPercentage).toBeGreaterThanOrEqual(
          prof.topSuitableFields![i + 1].suitabilityPercentage
        );
      }

      // Check fields have whyNativeShinesKn & coreStrengthsKn
      for (const field of prof.topSuitableFields!) {
        expect(field.fieldNameKn).toBeTruthy();
        expect(field.fieldNameEn).toBeTruthy();
        expect(field.whyNativeShinesKn).toBeTruthy();
        expect(field.whyNativeShinesEn).toBeTruthy();
        expect(field.coreStrengthsKn).toBeTruthy();
        expect(field.verdictKn).toBeTruthy();
      }
    });

    it("detects special high-power career yogas (Ruchaka Yoga, Digbala Sun, Simhasana Yoga) and leadership potential", () => {
      const chart = createMockKundli();
      const prof = determineAccurateProfession(chart, { devoteeName: "ವಿಕ್ರಮ್", devoteeAge: 32 });

      expect(prof.specialCareerYogasKn).toBeDefined();
      expect(prof.specialCareerYogasKn!.length).toBeGreaterThanOrEqual(1);

      // Mars is exalted in 10th house (Makara) -> Ruchaka Mahapurusha Yoga
      const hasRuchaka = prof.specialCareerYogasKn!.some(y => y.includes("ರುಚಕ"));
      expect(hasRuchaka).toBe(true);

      // Sun is in 10th house -> Digbala Sun / Simhasana Yoga
      const hasSunOrSimhasana = prof.specialCareerYogasKn!.some(y => y.includes("ಸೂರ್ಯ") || y.includes("ಸಿಂಹಾಸನ"));
      expect(hasSunOrSimhasana).toBe(true);

      // Leadership potential is identified
      expect(prof.leadershipPotentialKn).toBeDefined();
      expect(prof.leadershipPotentialKn!.length).toBeGreaterThan(10);
    });
  });

  // =========================================================================
  // 2. ACADEMIC & SUBJECT APTITUDES AUDIT
  // =========================================================================
  describe("Academic & Subject Aptitudes", () => {
    it("evaluates all 6 core academic disciplines with scores and astrological indicators", () => {
      const chart = createMockKundli();
      const prof = determineAccurateProfession(chart, { devoteeName: "ಶ್ರೇಯಸ್", devoteeAge: 22 });

      expect(prof.subjectAptitudes).toBeDefined();
      expect(prof.subjectAptitudes!.length).toBe(6);

      const expectedCodes = [
        "maths_analytics",
        "science_technology",
        "rajakiya_governance",
        "commerce_banking",
        "arts_creativity",
        "history_law_dharma"
      ];

      for (const expectedCode of expectedCodes) {
        const item = prof.subjectAptitudes!.find(s => s.code === expectedCode);
        expect(item).toBeDefined();
        expect(item!.nameKn).toBeTruthy();
        expect(item!.nameEn).toBeTruthy();
        expect(item!.scorePercentage).toBeGreaterThanOrEqual(30);
        expect(item!.scorePercentage).toBeLessThanOrEqual(100);
        expect(item!.ratingKn).toBeTruthy();
        expect(item!.planetaryIndicatorKn).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // 3. LIFETIME MARRIAGE DESTINY DETERMINATION AUDIT
  // =========================================================================
  describe("Lifetime Marriage Destiny Determination (ಜೀವಿತಾವಧಿಯ ವಿವಾಹ ಯೋಗ)", () => {
    it("determines Assured Timely Marriage (ಖಚಿತ ಕಲ್ಯಾಣ ಭಾಗ್ಯ) when 7th house and Venus are strong and unblemished", () => {
      const chart = createMockKundli(); // Venus in 7th house Libra (own sign), Jupiter in 9th house aspecting 1st
      const destiny = determineMarriageDestiny(chart, { devoteeName: "ಸ್ನೇಹ", devoteeAge: 25, gender: "Female" });

      expect(destiny.verdict).toBe("assured_marriage");
      expect(destiny.badgeColor).toBe("emerald");
      expect(destiny.directAnswerKn).toContain("ಕಲ್ಯಾಣ ಭಾಗ್ಯ");
      expect(destiny.marriageTimingWindowKn).toMatch(/2[1-6]\s*ರಿಂದ\s*2[6-9]/);
      expect(destiny.astrologicalReasoningKn).toBeTruthy();
      expect(destiny.classicalRuleCitedKn).toBeTruthy();
      expect(destiny.blessingRemedyKn).toBeTruthy();
    });

    it("determines Delayed Marriage (ವಿಳಂಬ ವಿವಾಹ) with explicit 'Delay is NOT Denial' reassurance when Saturn/Rahu affect 7th house", () => {
      const chart = createMockKundli();
      // Put Saturn in 7th house and afflicted Venus
      const pSaturn = chart.planets.find(p => p.name === PlanetName.Saturn)!;
      const pVenus = chart.planets.find(p => p.name === PlanetName.Venus)!;
      pSaturn.house = 7;
      pVenus.house = 6; // Venus in 6th house (dusthana)

      const destiny = determineMarriageDestiny(chart, { devoteeName: "ಕಿರಣ್", devoteeAge: 30, gender: "Male" });

      expect(destiny.verdict).toBe("delayed_marriage");
      expect(destiny.badgeColor).toBe("amber");
      expect(destiny.directAnswerKn).toContain("ವಿಳಂಬ ವಿವಾಹ");
      expect(destiny.marriageTimingWindowKn).toMatch(/29|30|31|32|33|34|35|36/);
      expect(destiny.delayFactorsKn).toBeDefined();
      expect(destiny.delayFactorsKn!.length).toBeGreaterThan(0);
      // Verify delay is distinguished from denial
      expect(destiny.titleKn).toContain("ವಿಳಂಬ");
      expect(destiny.blessingRemedyKn).toContain("ಪರಿಹರಿ");
    });

    it("identifies Lifelong Celibacy / Sanyasa Yoga (ಅಖಂಡ ಅವಿವಾಹ / ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ) when 4+ planets cluster and strong Pravrajya indicators exist", () => {
      const chart = createMockKundli();
      // Put 5 planets in 10th house (Classical Pravrajya Yoga / Sanyasa)
      chart.planets.forEach((p, idx) => {
        if (idx < 5) {
          p.house = 10;
        }
      });
      // Saturn aspecting Ketu with ascetic combination
      const pSaturn = chart.planets.find(p => p.name === PlanetName.Saturn)!;
      const pKetu = chart.planets.find(p => p.name === PlanetName.Ketu)!;
      pSaturn.house = 10;
      pKetu.house = 12;

      const destiny = determineMarriageDestiny(chart, { devoteeName: "ಸನ್ಯಾಸಿ", devoteeAge: 40 });

      expect(destiny.verdict).toBe("lifelong_celibacy_denial");
      expect(destiny.badgeColor).toBe("purple");
      expect(destiny.directAnswerKn).toContain("ಬ್ರಹ್ಮಚರ್ಯ");
      expect(destiny.historicalCelebrityParallelKn).toBeDefined();
      expect(destiny.historicalCelebrityParallelKn).toMatch(/ಕಲಾಂ|ವಾಜಪೇಯಿ|ವಿವೇಕಾನಂದ|Kalam|Vajpayee|Vivekananda/i);
    });

    it("identifies Already Married (ಗೃಹಸ್ಥಾಶ್ರಮ / ಸುಖಿ ದಾಂಪತ್ಯ) when native is mature age with clean 7th house", () => {
      const chart = createMockKundli();
      const destiny = determineMarriageDestiny(chart, { devoteeName: "ಮಂಜುನಾಥ", devoteeAge: 46 });

      expect(destiny.verdict).toBe("already_married");
      expect(destiny.badgeColor).toBe("emerald");
      expect(destiny.directAnswerKn).toContain("ಗೃಹಸ್ಥಾಶ್ರಮ");
    });

    it("identifies Already Married (ಗೃಹಸ್ಥಾಶ್ರಮ / ಸುಖಿ ದಾಂಪತ್ಯ) for real-world devotee (DOB 1982-07-25, 12:05 PM, Pin 581326) when maritalStatus is omitted", async () => {
      const { calculateKundli } = await import("../core/KundliEngine");
      const chart = calculateKundli({
        name: "ಭಕ್ತ (ಉತ್ತರ ಕನ್ನಡ)",
        birthDate: "1982-07-25",
        birthTime: "12:05",
        latitude: 14.5479,
        longitude: 74.3188,
        pincode: "581326"
      });

      const destiny = determineMarriageDestiny(chart, {
        devoteeName: "ಭಕ್ತ (ಉತ್ತರ ಕನ್ನಡ)",
        birthDate: "1982-07-25",
        devoteeAge: 44,
        gender: "Male"
      });

      expect(destiny.verdict).toBe("already_married");
      expect(destiny.badgeColor).toBe("emerald");
      expect(destiny.directAnswerKn).toContain("ಗೃಹಸ್ಥಾಶ್ರಮ");
    });

    it("identifies Lifelong Celibacy & Unmarried Destiny (12th House Moon-Saturn Sayana Sukha Bhanga) ONLY when native explicitly affirms unmarried status", async () => {
      const { calculateKundli } = await import("../core/KundliEngine");
      const chart = calculateKundli({
        name: "ಭಕ್ತ (ಉತ್ತರ ಕನ್ನಡ)",
        birthDate: "1982-07-25",
        birthTime: "12:05",
        latitude: 14.5479,
        longitude: 74.3188,
        pincode: "581326"
      });

      const destiny = determineMarriageDestiny(chart, {
        devoteeName: "ಭಕ್ತ (ಉತ್ತರ ಕನ್ನಡ)",
        birthDate: "1982-07-25",
        devoteeAge: 44,
        gender: "Male",
        maritalStatus: "unmarried"
      });

      expect(destiny.verdict).toBe("lifelong_celibacy_denial");
      expect(destiny.badgeColor).toBe("purple");
      expect(destiny.directAnswerKn).toContain("ಬ್ರಹ್ಮಚರ್ಯ");
      expect(destiny.directAnswerKn).toContain("ಅವಿವಾಹ");
      expect(destiny.directAnswerEn).toContain("Lifelong Celibacy");
      expect(destiny.titleKn).toContain("12ರಲ್ಲಿ ಚಂದ್ರ-ಶನಿ ಯುತಿ");
      expect(destiny.marriageTimingWindowKn).toContain("ಲೌಕಿಕ ಸಂಸಾರ ಬಂಧನವಿಲ್ಲ");
      expect(destiny.astrologicalReasoningKn).toContain("ಶಯನಸುಖ ಭಂಗ");
      expect(destiny.classicalRuleCitedKn).toContain("ಫಲದೀಪಿಕಾ");
    });
  });

  // =========================================================================
  // 4. INTEGRATION AUDIT: PANCHANGA ANGA SYNTHESIS ENGINE
  // =========================================================================
  describe("Integration in generatePanchangaAngaSynthesis", () => {
    it("attaches marriageDestiny to currentDiagnosis in the synthesis output", async () => {
      const { calculateKundli } = await import("../core/KundliEngine");
      const testContext = {
        birthDate: "1993-05-31",
        birthTime: "09:25",
        latitude: 14.5479,
        longitude: 74.3188,
        devoteeName: "ವಿಜಯ್",
        gender: "Male" as const
      };

      const chart = calculateKundli({
        name: testContext.devoteeName,
        birthDate: testContext.birthDate,
        birthTime: testContext.birthTime,
        latitude: testContext.latitude,
        longitude: testContext.longitude
      });

      const synthesis = generatePanchangaAngaSynthesis(chart, testContext);

      expect(synthesis.currentDiagnosis.marriageDestiny).toBeDefined();
      expect(synthesis.currentDiagnosis.marriageDestiny!.verdict).toBeTruthy();
      expect(synthesis.currentDiagnosis.marriageDestiny!.directAnswerKn).toBeTruthy();
      expect(synthesis.currentDiagnosis.marriageDestiny!.marriageTimingWindowKn).toBeTruthy();
      expect(synthesis.currentDiagnosis.accurateProfession!.topSuitableFields).toBeDefined();
      expect(synthesis.currentDiagnosis.accurateProfession!.topSuitableFields!.length).toBeGreaterThan(0);
      expect(synthesis.currentDiagnosis.accurateProfession!.subjectAptitudes).toBeDefined();
      expect(synthesis.currentDiagnosis.accurateProfession!.subjectAptitudes!.length).toBe(6);
    });
  });
});
