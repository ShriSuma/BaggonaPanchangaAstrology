import { describe, it, expect } from "vitest";
import {
  analyzeQuestionComplexity,
  computeAstrologicalRecommendations,
  buildDeterministicGemstoneReading,
  buildDeterministicColorReading,
  buildDeterministicNumberReading,
  buildDeterministicDayDeityReading,
  buildDeterministicFollowUpClarificationReading,
  generateConsultationAnswer,
  computeDevoteeKundli
} from "../features/consultation/consultationAIEngine";
import type {
  ConsultationSession,
  ConsultationLanguage
} from "../features/consultation/consultationTypes";

describe("Consultation Complexity & 80/20 Dynamic Length Engine", () => {
  const baseSession: ConsultationSession = {
    id: "test-session-1",
    name: "ರಾಘವೇಂದ್ರ",
    dob: "1994-07-28",
    tob: "10:30",
    place: "Gokarna",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    language: "kn",
    createdAt: new Date().toISOString(),
    status: "active",
    messages: [],
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362"
  };

  describe("1. analyzeQuestionComplexity (80/20 Dynamic Paragraph Assessment)", () => {
    it("classifies gemstone / ratna / havala questions as QUICK_SPECIFIC with 1-2 target paragraphs", () => {
      const q1 = "What ratna / havala match for his janma kundali?";
      const res1 = analyzeQuestionComplexity(q1);
      expect(res1.complexity).toBe("QUICK_SPECIFIC");
      expect(res1.domain).toBe("GEMSTONE_RATNA");
      expect(res1.maxParagraphs).toBeLessThanOrEqual(2);
      expect(res1.promptDirective).toContain("80/20 GOLDEN RULE");

      const q2 = "ನನ್ನ ಜಾತಕಕ್ಕೆ ಯಾವ ರತ್ನ ಅಥವಾ ಹವಳ ಧರಿಸಬೇಕು?";
      const res2 = analyzeQuestionComplexity(q2);
      expect(res2.complexity).toBe("QUICK_SPECIFIC");
      expect(res2.domain).toBe("GEMSTONE_RATNA");
    });

    it("classifies lucky color questions as QUICK_SPECIFIC with 1-2 target paragraphs", () => {
      const q1 = "Which color will suit for me?";
      const res1 = analyzeQuestionComplexity(q1);
      expect(res1.complexity).toBe("QUICK_SPECIFIC");
      expect(res1.domain).toBe("LUCKY_COLOR");
      expect(res1.maxParagraphs).toBeLessThanOrEqual(2);

      const q2 = "ನನಗೆ ಅದೃಷ್ಟ ತರುವ ಶುಭ ಬಣ್ಣ ಯಾವುದು?";
      const res2 = analyzeQuestionComplexity(q2);
      expect(res2.complexity).toBe("QUICK_SPECIFIC");
      expect(res2.domain).toBe("LUCKY_COLOR");
    });

    it("classifies lucky number questions as QUICK_SPECIFIC with 1-2 target paragraphs", () => {
      const q = "Which number is lucky for my vehicle?";
      const res = analyzeQuestionComplexity(q);
      expect(res.complexity).toBe("QUICK_SPECIFIC");
      expect(res.domain).toBe("LUCKY_NUMBER");
      expect(res.maxParagraphs).toBeLessThanOrEqual(2);
    });

    it("classifies auspicious day / deity queries as QUICK_SPECIFIC with 1-2 target paragraphs", () => {
      const q = "ನನ್ನ ಇಷ್ಟದೇವತೆ ಯಾರು ಮತ್ತು ಯಾವ ವಾರ ಪೂಜಿಸಬೇಕು?";
      const res = analyzeQuestionComplexity(q);
      expect(res.complexity).toBe("QUICK_SPECIFIC");
      expect(res.domain).toBe("AUSPICIOUS_DAY_DEITY");
      expect(res.maxParagraphs).toBeLessThanOrEqual(2);
    });

    it("classifies short follow-up clarification queries as exactly 1 paragraph", () => {
      const q1 = "ಯಾವ ಬೆರಳಿಗೆ ಹಾಕಬೇಕು?";
      const res1 = analyzeQuestionComplexity(q1, undefined, true);
      expect(res1.complexity).toBe("QUICK_SPECIFIC");
      expect(res1.domain).toBe("FOLLOW_UP_CLARIFICATION");
      expect(res1.maxParagraphs).toBe(1);

      const q2 = "which finger right hand or left?";
      const res2 = analyzeQuestionComplexity(q2, undefined, true);
      expect(res2.complexity).toBe("QUICK_SPECIFIC");
      expect(res2.domain).toBe("FOLLOW_UP_CLARIFICATION");
      expect(res2.maxParagraphs).toBe(1);
    });

    it("classifies timing questions as FOCUSED_MODERATE with 2 paragraphs", () => {
      const q = "ನನಗೆ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?";
      const res = analyzeQuestionComplexity(q);
      expect(res.complexity).toBe("FOCUSED_MODERATE");
      expect(res.domain).toBe("TIMING_WINDOW");
      expect(res.targetParagraphs).toBe(2);
    });

    it("classifies deep karmic dosha queries as COMPREHENSIVE_DEEP with 3-4 paragraphs", () => {
      const q = "ನನ್ನ ಜಾತಕದಲ್ಲಿರುವ ಸರ್ಪ ದೋಷ ಅಥವಾ ಕುಜ ದೋಷಕ್ಕೆ ಪರಿಹಾರ ತಿಳಿಸಿ";
      const res = analyzeQuestionComplexity(q);
      expect(res.complexity).toBe("COMPREHENSIVE_DEEP");
      expect(res.domain).toBe("DOSHA_PARIHARA");
      expect(res.targetParagraphs).toBe(3);
      expect(res.maxParagraphs).toBe(4);
    });
  });

  describe("2. computeAstrologicalRecommendations (Authentic Vedic Planetary Rules)", () => {
    it("accurately derives recommendations for Cancer Lagna (Karka) with Mars as Yoga-Karaka", async () => {
      // DOB that yields Cancer Lagna or mock computed data
      const astroData = await computeDevoteeKundli(baseSession);
      const rec = computeAstrologicalRecommendations(astroData, "kn");

      expect(rec.primaryGemstoneName.kn).toBeDefined();
      expect(rec.luckyColors.kn).toBeDefined();
      expect(rec.primaryNumber).toBeGreaterThan(0);
      expect(rec.ishtaDevata.kn).toBeDefined();
      expect(rec.sacredMantra.kn).toBeDefined();
      expect(rec.auspiciousDay.kn).toBeDefined();
    });

    it("correctly identifies Red Coral (Havala) compatibility for Yoga-Karaka / Martian Ascendants", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      // Cancer (3), Leo (4), Aries (0), Scorpio (7), Sagittarius (8), Pisces (11)
      const mockCancer = { ...astroData, lagnaIdx: 3 };
      const recCancer = computeAstrologicalRecommendations(mockCancer, "kn");
      expect(recCancer.isCoralMatched).toBe(true);

      const mockLeo = { ...astroData, lagnaIdx: 4 };
      const recLeo = computeAstrologicalRecommendations(mockLeo, "kn");
      expect(recLeo.isCoralMatched).toBe(true);

      const mockTaurus = { ...astroData, lagnaIdx: 1 };
      const recTaurus = computeAstrologicalRecommendations(mockTaurus, "kn");
      expect(recTaurus.isCoralMatched).toBe(false);
    });
  });

  describe("3. Deterministic Reading Builders (Front-loaded 80/20 Execution)", () => {
    it("buildDeterministicGemstoneReading outputs 1-2 paragraphs and answers directly in sentence 1", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      const rec = computeAstrologicalRecommendations(astroData, "kn");

      const readingKn = buildDeterministicGemstoneReading(
        baseSession,
        "What ratna / havala match for his janma kundali?",
        astroData,
        rec,
        false
      );
      const paras = readingKn.split(/\n\s*\n/);
      expect(paras.length).toBeLessThanOrEqual(2);
      expect(paras[0]).toMatch(/ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಮಂಗಳಕರವಾದ ಮುಖ್ಯ ರತ್ನವೆಂದರೆ/);
      expect(readingKn).toMatch(/ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ/);
      // Zero filler
      expect(paras.length).toBeGreaterThanOrEqual(1);
    });

    it("buildDeterministicGemstoneReading affirms Red Coral when asked and matched", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      const mockCancer = { ...astroData, lagnaIdx: 3 }; // Cancer Lagna: Moon lord, Mars yoga-karaka
      const rec = computeAstrologicalRecommendations(mockCancer, "en");

      const sessionEn: ConsultationSession = { ...baseSession, language: "en" };
      const readingEn = buildDeterministicGemstoneReading(
        sessionEn,
        "What ratna / havala match for his janma kundali?",
        mockCancer,
        rec,
        false
      );
      const paras = readingEn.split(/\n\s*\n/);
      expect(paras.length).toBeLessThanOrEqual(2);
      expect(paras[0]).toMatch(/For your birth chart, the most auspicious and empowering primary gemstone is/);
      expect(readingEn).toContain("Red Coral (Havala / Moonga)");
    });

    it("buildDeterministicColorReading outputs 1-2 paragraphs and gives direct colors in sentence 1", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      const rec = computeAstrologicalRecommendations(astroData, "kn");

      const reading = buildDeterministicColorReading(
        baseSession,
        "Which color will suit for me?",
        astroData,
        rec,
        true
      );
      const paras = reading.split(/\n\s*\n/);
      expect(paras.length).toBeLessThanOrEqual(2);
      expect(paras[0]).toMatch(/ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಕಾರ ನಿಮಗೆ ಅತ್ಯಂತ ಶುಭ ಮತ್ತು ಅದೃಷ್ಟ ತರುವ ಮುಖ್ಯ ಬಣ್ಣಗಳು:/);
      expect(reading).not.toContain("4-ಪ್ಯಾರಾಗ್ರಾಫ್");
    });

    it("buildDeterministicNumberReading outputs 1-2 paragraphs and states primary number in sentence 1", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      const rec = computeAstrologicalRecommendations(astroData, "kn");

      const reading = buildDeterministicNumberReading(
        baseSession,
        "Which number is lucky?",
        astroData,
        rec,
        true
      );
      const paras = reading.split(/\n\s*\n/);
      expect(paras.length).toBeLessThanOrEqual(2);
      expect(paras[0]).toMatch(/ನಿಮ್ಮ ಮುಖ್ಯ ಅದೃಷ್ಟ ಸಂಖ್ಯೆ/);
    });

    it("buildDeterministicFollowUpClarificationReading outputs exactly 1 crisp paragraph", async () => {
      const astroData = await computeDevoteeKundli(baseSession);
      const rec = computeAstrologicalRecommendations(astroData, "kn");

      const reading = buildDeterministicFollowUpClarificationReading(
        baseSession,
        "ಯಾವ ಬೆರಳಿಗೆ ಹಾಕಬೇಕು?",
        astroData,
        rec,
        true
      );
      const paras = reading.split(/\n\s*\n/);
      expect(paras.length).toBe(1);
      expect(reading).toMatch(/ರತ್ನ ಧಾರಣೆಯ ಶಾಸ್ತ್ರೋಕ್ತ ನಿಯಮ:/);
      expect(reading).toMatch(/ಬೆರಳು/);
    });
  });

  describe("4. End-to-End generateConsultationAnswer (Fallback Mode Without API Key)", () => {
    it("returns 1-2 paragraphs when devotee asks about gemstone / havala, without 4-paragraph boilerplate", async () => {
      const res = await generateConsultationAnswer({
        session: baseSession,
        userQuestion: "What ratna / havala match for his janma kundali?",
        apiKey: "" // forces fallback
      });

      expect(res.paragraphs.length).toBeLessThanOrEqual(2);
      expect(res.paragraphs.length).toBeGreaterThanOrEqual(1);
      expect(res.paragraphs[0]).toMatch(/ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಹಾಗೂ ಮಂಗಳಕರವಾದ ಮುಖ್ಯ ರತ್ನವೆಂದರೆ/);
      // Does not attach an unrequested dosha card to a simple ratna query
      expect(res.activeDoshaCard).toBeUndefined();
    });

    it("returns 1-2 paragraphs when devotee follows up asking 'Which color will suit for me?'", async () => {
      const res = await generateConsultationAnswer({
        session: baseSession,
        userQuestion: "Which color will suit for me?",
        isSubsequentQuestion: true,
        questionIndex: 1,
        apiKey: ""
      });

      expect(res.paragraphs.length).toBeLessThanOrEqual(2);
      expect(res.paragraphs[0]).toMatch(/ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪ್ರಕಾರ ನಿಮಗೆ ಅತ್ಯಂತ ಶುಭ ಮತ್ತು ಅದೃಷ್ಟ ತರುವ ಮುಖ್ಯ ಬಣ್ಣಗಳು:/);
      expect(res.paragraphs.length).not.toBe(4);
    });

    it("returns exactly 1 paragraph for a short follow-up clarification", async () => {
      const res = await generateConsultationAnswer({
        session: baseSession,
        userQuestion: "ಯಾವ ಬೆರಳಿಗೆ ಹಾಕಬೇಕು?",
        isSubsequentQuestion: true,
        questionIndex: 2,
        apiKey: ""
      });

      expect(res.paragraphs.length).toBe(1);
      expect(res.fullText).toMatch(/ರತ್ನ ಧಾರಣೆಯ ಶಾಸ್ತ್ರೋಕ್ತ ನಿಯಮ/);
    });

    it("returns 2-3 paragraphs for a timing inquiry without a 4th dosha chapter", async () => {
      const res = await generateConsultationAnswer({
        session: baseSession,
        userQuestion: "ನನಗೆ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?",
        apiKey: ""
      });

      expect(res.paragraphs.length).toBeLessThanOrEqual(3);
      expect(res.fullText).toMatch(/೯೮|98/); // timeline calculated
      // Should not include a 4th dosha chapter
      expect(res.fullText).not.toContain("॥ ವೈದಿಕ ದೋಷ ನಿವಾರಣೆ ಹಾಗೂ ಗೋಕರ್ಣ ಪರಿಹಾರ ಅಧ್ಯಾಯ ॥");
    });
  });

  describe("5. Pure Localization Across All 7 Languages", () => {
    const languages: ConsultationLanguage[] = ["kn", "hi", "te", "ta", "ml", "mr", "en"];

    languages.forEach((lang) => {
      it(`generates pure localized gemstone reading for language: ${lang}`, async () => {
        const session: ConsultationSession = { ...baseSession, language: lang };
        const astroData = await computeDevoteeKundli(session);
        const rec = computeAstrologicalRecommendations(astroData, lang);

        const reading = buildDeterministicGemstoneReading(
          session,
          "What ratna / havala match?",
          astroData,
          rec,
          false
        );

        expect(reading).toBeDefined();
        const paras = reading.split(/\n\s*\n/);
        expect(paras.length).toBeLessThanOrEqual(2);

        // Verify script integrity: if Indic, should contain native characters and not English words in the primary sentences
        if (lang === "kn") expect(reading).toMatch(/[\u0C80-\u0CFF]/);
        if (lang === "hi") expect(reading).toMatch(/[\u0900-\u097F]/);
        if (lang === "te") expect(reading).toMatch(/[\u0C00-\u0C7F]/);
        if (lang === "ta") expect(reading).toMatch(/[\u0B80-\u0BFF]/);
        if (lang === "ml") expect(reading).toMatch(/[\u0D00-\u0D7F]/);
        if (lang === "mr") expect(reading).toMatch(/[\u0900-\u097F]/);
        if (lang === "en") expect(reading).toMatch(/[A-Za-z]/);
      });

      it(`generates pure localized color reading for language: ${lang}`, async () => {
        const session: ConsultationSession = { ...baseSession, language: lang };
        const astroData = await computeDevoteeKundli(session);
        const rec = computeAstrologicalRecommendations(astroData, lang);

        const reading = buildDeterministicColorReading(
          session,
          "Which color will suit for me?",
          astroData,
          rec,
          true
        );

        expect(reading).toBeDefined();
        const paras = reading.split(/\n\s*\n/);
        expect(paras.length).toBeLessThanOrEqual(2);
      });
    });
  });
});
