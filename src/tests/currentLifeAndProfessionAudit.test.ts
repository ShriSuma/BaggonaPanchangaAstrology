import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  generateVedicConsultationAnswer
} from "../core/PanchangaAngaSynthesisEngine";
import {
  diagnoseCurrentLifeSituation,
  determineAccurateProfession
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { PlanetName, type KundliOutput, type PlanetPosition, type Rashi, type Nakshatra } from "../core/AstroTypes";

describe("Current Life Situation & Accurate Profession Diagnostic Audit", () => {
  // Helper to build a clean mock Kundli
  const createMockKundli = (overrides?: Partial<KundliOutput>): KundliOutput => {
    const defaultRashi: Rashi = {
      index: 2, // Gemini
      english: "Gemini",
      sanskrit: "Mithuna"
    };

    const dummyNakshatra: Nakshatra = {
      index: 4,
      sanskrit: "Mrigashira",
      english: "Mrigashira",
      deity: "Soma"
    };

    const dummyPlanets: PlanetPosition[] = [
      { name: PlanetName.Sun, house: 10, degree: 74, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Moon, house: 1, degree: 65, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Mars, house: 3, degree: 125, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Mercury, house: 10, degree: 82, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Jupiter, house: 9, degree: 310, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Venus, house: 11, degree: 25, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Saturn, house: 9, degree: 315, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: false },
      { name: PlanetName.Rahu, house: 10, degree: 88, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: true },
      { name: PlanetName.Ketu, house: 4, degree: 268, nakshatra: dummyNakshatra, rashi: defaultRashi, isRetrograde: true }
    ];

    return {
      ascendant: 60,
      lagnaRashi: defaultRashi,
      moonSign: defaultRashi,
      sunSign: defaultRashi,
      moonPada: 1,
      planets: dummyPlanets,
      houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      ...overrides
    };
  };

  // =========================================================================
  // 1. REAL LIFE SITUATION & ACUTE STRUGGLES AUDIT
  // =========================================================================
  describe("Current Life Situation & Acute Struggle Diagnostics", () => {
    it("diagnoses Property Share / Family Home dispute (ಆಸ್ತಿ ಪಾಲು / ಮನೆಯ ಭಾಗದ ಜಗಳ) when 4th house and Mars/Saturn are afflicted", () => {
      const propertyAfflictedKundli = createMockKundli();
      // Put Mars in 4th house (bhoomi/griha) and Saturn in 4th, with 4th lord afflicted
      const pMars = propertyAfflictedKundli.planets.find(p => p.name === PlanetName.Mars)!;
      const pSaturn = propertyAfflictedKundli.planets.find(p => p.name === PlanetName.Saturn)!;
      pMars.house = 4;
      pSaturn.house = 4;

      const diagnosis = diagnoseCurrentLifeSituation(
        propertyAfflictedKundli,
        { devoteeName: "ರಮೇಶ್", devoteeAge: 42, gender: "Male" }
      );

      expect(diagnosis.category).toBe("property_share_dispute");
      expect(diagnosis.titleKn).toContain("ಆಸ್ತಿ ಪಾಲು");
      expect(diagnosis.headlineKn).toContain("ಆಸ್ತಿ ಪಾಲು");
      expect(diagnosis.detailedRealityKn).toContain("ಮನೆಯ ಹಕ್ಕು");
      expect(diagnosis.symptomsChecklistKn.length).toBeGreaterThanOrEqual(3);
      expect(diagnosis.reliefTimelineKn).toMatch(/\d+/); // English digits
      expect(diagnosis.gokarnaRemedyKn).toContain("ಗೋಕರ್ಣ");
    });

    it("diagnoses Business Partner Distrust / Betrayal (ಪಾಲುದಾರರ ವಂಚನೆ / ನಂಬಿಕೆದ್ರೋಹ) when 7th house and partner indicators are afflicted", () => {
      const partnerRiskKundli = createMockKundli();
      const pRahu = partnerRiskKundli.planets.find(p => p.name === PlanetName.Rahu)!;
      const pSaturn = partnerRiskKundli.planets.find(p => p.name === PlanetName.Saturn)!;
      const pMercury = partnerRiskKundli.planets.find(p => p.name === PlanetName.Mercury)!;
      // Put Rahu and Saturn in 7th house (partnerships/commerce), Mercury in 8th house
      pRahu.house = 7;
      pSaturn.house = 7;
      pMercury.house = 8;

      const diagnosis = diagnoseCurrentLifeSituation(
        partnerRiskKundli,
        { devoteeName: "ಸುರೇಶ್", devoteeAge: 38, gender: "Male" }
      );

      expect(diagnosis.category).toBe("partner_distrust_betrayal");
      expect(diagnosis.titleKn).toContain("ಪಾಲುದಾರ");
      expect(diagnosis.headlineKn).toContain("ನಂಬಿಕೆದ್ರೋಹ");
      expect(diagnosis.detailedRealityKn).toContain("ಲೆಕ್ಕಪತ್ರ");
      expect(diagnosis.symptomsChecklistKn.length).toBeGreaterThanOrEqual(3);
      expect(diagnosis.reliefTimelineKn).toMatch(/\d+/);
      expect(diagnosis.gokarnaRemedyKn).toContain("ಗೋಕರ್ಣ");
    });

    it("diagnoses Marriage Delay (ವಿವಾಹ ವಿಳಂಬ) for native age 29 with 7th house affliction", () => {
      const marriageDelayKundli = createMockKundli();
      const pSaturn = marriageDelayKundli.planets.find(p => p.name === PlanetName.Saturn)!;
      const pRahu = marriageDelayKundli.planets.find(p => p.name === PlanetName.Rahu)!;
      pSaturn.house = 7;
      pRahu.house = 7;

      const diagnosis = diagnoseCurrentLifeSituation(
        marriageDelayKundli,
        { devoteeName: "ಪ್ರಿಯಾ", devoteeAge: 29, gender: "Female" }
      );

      expect(diagnosis.category).toBe("marriage_delay");
      expect(diagnosis.titleKn).toContain("ವಿವಾಹ ವಿಳಂಬ");
      expect(diagnosis.headlineKn).toContain("ವಿವಾಹ");
      expect(diagnosis.symptomsChecklistKn.length).toBeGreaterThanOrEqual(3);
    });

    it("diagnoses Delayed Childbirth / Progeny Anxiety (ಸಂತಾನ ವಿಳಂಬ / ಕೊರಗು) when 5th house is afflicted", () => {
      const childlessKundli = createMockKundli();
      const pRahu = childlessKundli.planets.find(p => p.name === PlanetName.Rahu)!;
      const pKetu = childlessKundli.planets.find(p => p.name === PlanetName.Ketu)!;
      pRahu.house = 5;
      pKetu.house = 11;

      const diagnosis = diagnoseCurrentLifeSituation(
        childlessKundli,
        { devoteeName: "ದಂಪತಿಗಳು", devoteeAge: 33, gender: "Male" }
      );

      expect(diagnosis.category).toBe("childless_anxiety");
      expect(diagnosis.titleKn).toContain("ಸಂತಾನ");
      expect(diagnosis.headlineKn).toContain("ಸಂತಾನ");
    });

    it("diagnoses Student Academic Stress (ವಿದ್ಯಾಭ್ಯಾಸ / ಪರೀಕ್ಷಾ ಆತಂಕ) for teenager", () => {
      const studentKundli = createMockKundli();
      const diagnosis = diagnoseCurrentLifeSituation(
        studentKundli,
        { devoteeName: "ಕಿರಣ್", devoteeAge: 17, gender: "Male" }
      );

      expect(diagnosis.category).toBe("student_academic_stress");
      expect(diagnosis.titleKn).toContain("ವಿದ್ಯಾಭ್ಯಾಸ");
      expect(diagnosis.symptomsChecklistKn.length).toBeGreaterThanOrEqual(3);
    });

    it("diagnoses Senior Peace & Legacy Settlement (ವಾನಪ್ರಸ್ಥ ಶಾಂತಿ) for elders above 60", () => {
      const seniorKundli = createMockKundli();
      const diagnosis = diagnoseCurrentLifeSituation(
        seniorKundli,
        { devoteeName: "ವೆಂಕಟೇಶ್ ಶಾಸ್ತ್ರಿ", devoteeAge: 68, gender: "Male" }
      );

      expect(diagnosis.category).toBe("elderly_peace_legacy");
      expect(diagnosis.titleKn).toContain("ವಾನಪ್ರಸ್ಥ");
      expect(diagnosis.headlineKn).toContain("ಆಸ್ತಿ ಪಾಲು ವಿಲೇವಾರಿ");
    });
  });

  // =========================================================================
  // 2. ACCURATE SPECIFIC PROFESSION DETERMINATION AUDIT
  // =========================================================================
  describe("Accurate Specific Profession Determination", () => {
    it("accurately identifies Software / IT Engineer when 10th house is Gemini/Virgo with Mercury and Rahu", () => {
      const itKundli = createMockKundli();
      // Lagna is Virgo (5), 10th house is Gemini (2) with Mercury and Rahu
      itKundli.lagnaRashi = { index: 5, english: "Virgo", sanskrit: "Kanya" };
      const pMercury = itKundli.planets.find(p => p.name === PlanetName.Mercury)!;
      const pRahu = itKundli.planets.find(p => p.name === PlanetName.Rahu)!;
      pMercury.house = 10;
      pRahu.house = 10;

      const prof = determineAccurateProfession(itKundli, { devoteeAge: 30 });
      expect(prof.code).toBe("it_software");
      expect(prof.titleKn).toContain("ಸಾಫ್ಟ್‌ವೇರ್");
      expect(prof.specificRoleKn).toContain("ಡೆವಲಪರ್");
      expect(prof.workEnvironmentKn).toContain("ತಂತ್ರಜ್ಞಾನ ಸಂಸ್ಥೆ");
      expect(prof.confidenceScore).toBeGreaterThanOrEqual(80);
    });

    it("accurately identifies Banker / Finance / CA when 10th house connects with Mercury and Jupiter", () => {
      const bankKundli = createMockKundli();
      // Lagna Leo (4), 10th house Taurus (1 - Venus), with Mercury and Jupiter in 10th
      bankKundli.lagnaRashi = { index: 4, english: "Leo", sanskrit: "Simha" };
      const pMercury = bankKundli.planets.find(p => p.name === PlanetName.Mercury)!;
      const pJupiter = bankKundli.planets.find(p => p.name === PlanetName.Jupiter)!;
      pMercury.house = 10;
      pJupiter.house = 10;

      const prof = determineAccurateProfession(bankKundli, { devoteeAge: 32 });
      expect(prof.code).toBe("banking_finance");
      expect(prof.titleKn).toContain("ಬ್ಯಾಂಕಿಂಗ್");
      expect(prof.specificRoleKn).toContain("ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್");
      expect(prof.workEnvironmentKn).toContain("ಬ್ಯಾಂಕ್");
    });

    it("accurately identifies Teacher / Professor when Jupiter is in 10th house or strong 9th/10th", () => {
      const teacherKundli = createMockKundli();
      // Lagna Gemini (2), 10th house Pisces (11 - Jupiter), Jupiter in 10th house
      teacherKundli.lagnaRashi = { index: 2, english: "Gemini", sanskrit: "Mithuna" };
      const pJupiter = teacherKundli.planets.find(p => p.name === PlanetName.Jupiter)!;
      const pMercury = teacherKundli.planets.find(p => p.name === PlanetName.Mercury)!;
      pJupiter.house = 10;
      pMercury.house = 5;

      const prof = determineAccurateProfession(teacherKundli, { devoteeAge: 40 });
      expect(prof.code).toBe("teaching_academics");
      expect(prof.titleKn).toContain("ಶಿಕ್ಷಣ");
      expect(prof.specificRoleKn).toContain("ಉಪನ್ಯಾಸಕ");
    });

    it("accurately identifies Doctor / Healthcare when Mars/Sun/Ketu connect with 10th or 6th/8th healer axis", () => {
      const docKundli = createMockKundli();
      // Lagna Cancer (3), 10th house Aries (0 - Mars), Sun and Mars in 10th house
      docKundli.lagnaRashi = { index: 3, english: "Cancer", sanskrit: "Karka" };
      const pMars = docKundli.planets.find(p => p.name === PlanetName.Mars)!;
      const pSun = docKundli.planets.find(p => p.name === PlanetName.Sun)!;
      pMars.house = 10;
      pSun.house = 10;

      const prof = determineAccurateProfession(docKundli, { devoteeAge: 36 });
      expect(prof.code).toBe("medical_healthcare");
      expect(prof.titleKn).toContain("ವೈದ್ಯಕೀಯ");
      expect(prof.specificRoleKn).toContain("ವೈದ್ಯ");
    });

    it("accurately identifies Priest / Vedic Astrologer when Jupiter/Sun/Ketu dominate 9th and 10th houses", () => {
      const purohitaKundli = createMockKundli();
      // Lagna Gemini (2), 10th house Pisces (11 - Jupiter), Jupiter and Ketu in 10th house
      purohitaKundli.lagnaRashi = { index: 2, english: "Gemini", sanskrit: "Mithuna" };
      const pJupiter = purohitaKundli.planets.find(p => p.name === PlanetName.Jupiter)!;
      const pKetu = purohitaKundli.planets.find(p => p.name === PlanetName.Ketu)!;
      const pSun = purohitaKundli.planets.find(p => p.name === PlanetName.Sun)!;
      const pMercury = purohitaKundli.planets.find(p => p.name === PlanetName.Mercury)!;
      pJupiter.house = 10;
      pJupiter.degree = 328; // Jupiter as AmK (28 deg in Pisces)
      pKetu.house = 10;
      pSun.house = 9;
      pSun.degree = 89; // Sun as AK (29 deg in Gemini)
      pMercury.house = 12; // away from 10th
      pMercury.degree = 70;

      const prof = determineAccurateProfession(purohitaKundli, { devoteeAge: 45 });
      expect(prof.code).toBe("priest_vedic_astrology");
      expect(prof.titleKn).toContain("ವೇದ ವಿದ್ವಾಂಸರು");
      expect(prof.specificRoleKn).toContain("ವೇದ ಪಂಡಿತರು");
    });

    it("accurately identifies Government Officer / Civil Services / Police when Sun and Mars dominate Aries/Leo 10th", () => {
      const govtKundli = createMockKundli();
      // Lagna Scorpio (7), 10th house Leo (4 - Sun), Sun in 10th (Digbala) and Mars aspecting
      govtKundli.lagnaRashi = { index: 7, english: "Scorpio", sanskrit: "Vrischika" };
      const pSun = govtKundli.planets.find(p => p.name === PlanetName.Sun)!;
      const pMars = govtKundli.planets.find(p => p.name === PlanetName.Mars)!;
      pSun.house = 10;
      pMars.house = 1; // 1st to 10th aspect / strong Mars

      const prof = determineAccurateProfession(govtKundli, { devoteeAge: 35 });
      expect(prof.code).toBe("government_civil_police");
      expect(prof.titleKn).toContain("ಸರ್ಕಾರಿ");
      expect(prof.specificRoleKn).toContain("ಅಧಿಕಾರಿ");
    });
  });

  // =========================================================================
  // 3. MULTI-PARAGRAPH EXECUTIVE READING STRUCTURE & MANDATORY INTEGRITY
  // =========================================================================
  describe("Multi-Paragraph Executive Reading Integrity", () => {
    it("ensures Paragraph 1 leads with Currently What He Is Going Through and Paragraph 2 with Accurate Profession", () => {
      const testContext = {
        birthDate: "1993-05-31",
        birthTime: "09:25",
        latitude: 14.5479,
        longitude: 74.3188,
        devoteeName: "ಪ್ರಮೋದ್",
        gender: "Male" as const
      };

      const kundli = calculateKundli({
        name: testContext.devoteeName,
        birthDate: testContext.birthDate,
        birthTime: testContext.birthTime,
        latitude: testContext.latitude,
        longitude: testContext.longitude
      });

      const synthesis = generatePanchangaAngaSynthesis(kundli, testContext);
      const paragraphs = synthesis.multiParagraphExecutiveReading;

      expect(paragraphs.length).toBe(4);

      // Paragraph 1: Currently What He Is Going Through
      const p1 = paragraphs[0];
      expect(p1).toContain("ನಮಸ್ಕಾರ ಪ್ರಮೋದ್");
      expect(p1).toContain("ಪ್ರಸ್ತುತ");
      // Must contain running dasha and acute situation
      expect(p1).toContain("ದಶಾ");

      // Paragraph 2: Accurate Profession Determination
      const p2 = paragraphs[1];
      expect(p2).toContain("10ನೇ ಕರ್ಮ ಸ್ಥಾನ");
      expect(p2).toContain("ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ");
      expect(p2).toContain("ನಿಖರ ವೃತ್ತಿ");

      // Paragraph 3: Turning Point & Relief Timeline with English digits
      const p3 = paragraphs[2];
      expect(p3).toMatch(/\d+/); // English digits
      expect(p3).toContain("ತಿಂಗಳ");

      // Paragraph 4: Gemstone, Rudraksha, and Gokarna remedies
      const p4 = paragraphs[3];
      expect(p4).toContain("ರತ್ನ");
      expect(p4).toContain("ರುದ್ರಾಕ್ಷಿ");
      expect(p4).toContain("ಗೋಕರ್ಣ");

      // ZERO markdown bold asterisks anywhere in Kannada paragraphs
      paragraphs.forEach((p, idx) => {
        expect(p).not.toContain("**");
        expect(p).not.toContain("*");
      });
    });
  });

  // =========================================================================
  // 4. INSTANT VEDIC CONSULTATION Q&A INTENT AUDIT
  // =========================================================================
  describe("Instant Vedic Consultation Q&A Intent Audit", () => {
    const testContext = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "ಪ್ರಮೋದ್",
      gender: "Male" as const,
      devoteeAge: 31
    };

    const kundli = calculateKundli({
      name: testContext.devoteeName,
      birthDate: testContext.birthDate,
      birthTime: testContext.birthTime,
      latitude: testContext.latitude,
      longitude: testContext.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, testContext);

    it("returns accurate response for 'ಪ್ರಸ್ತುತ ಯಾವ ಕಷ್ಟ ಎದುರಿಸುತ್ತಿದ್ದೇನೆ?' query", () => {
      const answer = generateVedicConsultationAnswer(
        kundli,
        synthesis.currentDiagnosis,
        synthesis.prescriptions,
        "ಪ್ರಸ್ತುತ ನಾನು ಯಾವ ಕಷ್ಟ ಎದುರಿಸುತ್ತಿದ್ದೇನೆ?",
        testContext.devoteeName,
        true,
        testContext.devoteeAge,
        testContext.gender
      );

      expect(answer).toContain("ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ");
      expect(answer).toContain("ವಾಸ್ತವ ಜೀವನ ಸ್ಥಿತಿ & ಗ್ರಹಗಳ ಕೈವಾಡ");
      expect(answer).toContain("ನಿಖರ ಕಾಲಾವಧಿ / ತಿರುವು");
      expect(answer).toContain("ಶಾಸ್ತ್ರೋಕ್ತ ಮುಕ್ತಿ ಪರಿಹಾರ & ಮಾರ್ಗೋಪಾಯ");
      expect(answer).toContain("ಗೋಕರ್ಣ");
      expect(answer).not.toContain("**");
    });

    it("returns accurate response for 'ಯಾವ ಉದ್ಯೋಗ ಮಾಡುತ್ತಿದ್ದೇನೆ?' query", () => {
      const answer = generateVedicConsultationAnswer(
        kundli,
        synthesis.currentDiagnosis,
        synthesis.prescriptions,
        "ನನ್ನ ಜಾತಕದ ಪ್ರಕಾರ ನಾನು ಯಾವ ಉದ್ಯೋಗ ಮಾಡುತ್ತಿದ್ದೇನೆ?",
        testContext.devoteeName,
        true,
        testContext.devoteeAge,
        testContext.gender
      );

      expect(answer).toContain("ಜಾತಕರ ನಿಖರ ವೃತ್ತಿ & ಕಾರ್ಯಕ್ಷೇತ್ರ");
      expect(answer).toContain("ದಿನನಿತ್ಯದ ಕಾರ್ಯಕ್ಷೇತ್ರ & ಪರಿಸರ");
      expect(answer).toContain("ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ (AmK)");
      expect(answer).toContain("10ನೇ ಕರ್ಮ ಸ್ಥಾನ");
      expect(answer).not.toContain("**");
    });

    it("returns authoritative response for Property Share / Partition query", () => {
      const answer = generateVedicConsultationAnswer(
        kundli,
        synthesis.currentDiagnosis,
        synthesis.prescriptions,
        "ಆಸ್ತಿ ಪಾಲು ಜಗಳ ಯಾವಾಗ ಬಗೆಹರಿಯುತ್ತದೆ?",
        testContext.devoteeName,
        true,
        testContext.devoteeAge,
        testContext.gender
      );

      expect(answer).toContain("ಆಸ್ತಿ ಪಾಲು");
      expect(answer).toContain("ಭೂಮಿ-ಕಾರಕ ಕುಜ");
      expect(answer).toContain("ಗೋಕರ್ಣ");
      expect(answer).not.toContain("**");
    });

    it("returns authoritative response for Business Partner Betrayal query", () => {
      const answer = generateVedicConsultationAnswer(
        kundli,
        synthesis.currentDiagnosis,
        synthesis.prescriptions,
        "ವ್ಯಾಪಾರದಲ್ಲಿ ಪಾಲುದಾರರ ವಂಚನೆ ನಂಬಿಕೆದ್ರೋಹ ಇದೆಯೇ?",
        testContext.devoteeName,
        true,
        testContext.devoteeAge,
        testContext.gender
      );

      expect(answer).toContain("ಪಾಲುದಾರ");
      expect(answer).toContain("7ನೇ");
      expect(answer).toContain("ಗೋಕರ್ಣ");
      expect(answer).not.toContain("**");
    });
  });
});
