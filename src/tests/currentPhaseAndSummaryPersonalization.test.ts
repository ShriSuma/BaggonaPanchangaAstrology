import { describe, it, expect } from "vitest";
import {
  buildDynamicCurrentPhaseFallback,
  buildDynamicSummaryFallback,
  type ParsedKundaliChart
} from "../features/premiumPdf/dynamicBhavishyaEngine";
import { buildPremiumPrompts } from "../features/premiumPdf/premiumPrompts";
import { buildKundaliCurrentPhaseFallback } from "../components/RamanBhavishya/BhavishyaView";

describe("Current Phase & Summary Deep Personalization Test Suite", () => {
  const mockChart = (overrides: Partial<ParsedKundaliChart> = {}): ParsedKundaliChart => ({
    lang: "kn",
    name: "ಪ್ರಮೋದ ಭಟ್",
    lagnaRashiIndex: 0,
    lagnaSignName: "ಮೇಷ (Mesha)",
    moonRashiIndex: 3,
    moonSignName: "ಕರ್ಕಾಟಕ (Karka)",
    nakshatraName: "ಪುಷ್ಯ (Pushya)",
    gender: "Male",
    ageYears: 35,
    mahaLordKey: "Jupiter",
    mahaLordName: "ಗುರು (Guru)",
    bhuktiLordKey: "Saturn",
    bhuktiLordName: "ಶನಿ (Shani)",
    dashaSummary: "ಗುರು - ಶನಿ",
    houses: {} as any,
    venusPlacement: null,
    jupiterPlacement: null,
    saturnPlacement: null,
    marsPlacement: null,
    mercuryPlacement: null,
    sunPlacement: null,
    moonPlacement: null,
    isManglik: false,
    spouseDirection: { en: "", kn: "", hi: "", te: "", ta: "" },
    transitSaturn: { houseFromMoon: 8, isSadeSati: false, isAshtama: true, isKantaka: false },
    transitJupiter: { houseFromMoon: 5, isGuruBala: false },
    transitRahu: null,
    transitKetu: null,
    maritalStatus: "married",
    hasChildren: "has_children",
    ...overrides
  });

  describe("buildDynamicCurrentPhaseFallback", () => {
    it("personalizes for Working Adult (age 35) with name and life stage realities in Kannada", () => {
      const chart = mockChart({ ageYears: 35, name: "ರಾಘವೇಂದ್ರ ರಾವ್", lang: "kn" });
      const text = buildDynamicCurrentPhaseFallback(chart);

      expect(text).toContain("ರಾಘವೇಂದ್ರ ರಾವ್");
      // Must contain adult-specific realities (career duties, family budget)
      expect(text).toMatch(/ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿ|ಕುಟುಂಬದ ಬಜೆಟ್|ದೈನಂದಿನ ಕರ್ತವ್ಯ|ಆರ್ಥಿಕ/);
      // Must contain Dasha and live transits
      expect(text).toContain("ಗುರು");
      expect(text).toContain("ಶನಿ");
      // Must contain Baggona Kshetra blessings
      expect(text).toContain("ಬಗ್ಗೋಣ");

      // Verify exactly 4 paragraphs
      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });

    it("personalizes for Senior Citizen (age 68) focusing on health, grandchildren, and serenity", () => {
      const chart = mockChart({ ageYears: 68, name: "ಗೋಪಾಲಕೃಷ್ಣ ಭಟ್", lang: "kn" });
      const text = buildDynamicCurrentPhaseFallback(chart);

      expect(text).toContain("ಗೋಪಾಲಕೃಷ್ಣ ಭಟ್");
      // Must contain senior-specific themes
      expect(text).toMatch(/ಆರೋಗ್ಯ|ಮನಸ್ಸಿನ ಶಾಂತಿ|ಮೊಮ್ಮಕ್ಕಳ|ಅಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ|ಲೌಕಿಕ ಪೈಪೋಟಿ/);
      expect(text).toContain("ಬಗ್ಗೋಣ");

      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });

    it("personalizes for Youth / Student (age 20) focusing on education and vocational clarity", () => {
      const chart = mockChart({ ageYears: 20, name: "ಸುಮಂತ್ ಹೆಗಡೆ", lang: "kn" });
      const text = buildDynamicCurrentPhaseFallback(chart);

      expect(text).toContain("ಸುಮಂತ್ ಹೆಗಡೆ");
      // Must contain youth/student themes
      expect(text).toMatch(/ವಿದ್ಯಾಭ್ಯಾಸ|ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ|ಏಕಾಗ್ರತೆ|ಗುರಿ/);

      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });

    it("personalizes across all 5 languages (kn, hi, te, ta, en) with devotee name included", () => {
      const langs = [
        { code: "kn", name: "ಪ್ರಮೋದ", regex: /ಪ್ರಮೋದ/ },
        { code: "hi", name: "प्रमोद जी", regex: /प्रमोद जी/ },
        { code: "te", name: "రమేష్ గారు", regex: /రమేష్ గారు/ },
        { code: "ta", name: "சுரேஷ்", regex: /சுரேஷ்/ },
        { code: "en", name: "Pramod Bhat", regex: /Pramod Bhat/ }
      ] as const;

      for (const { code, name, regex } of langs) {
        const chart = mockChart({
          lang: code,
          name,
          ageYears: 62,
          lagnaSignName: code === "hi" ? "मेष" : code === "te" ? "మేషం" : code === "ta" ? "மேஷம்" : code === "kn" ? "ಮೇಷ" : "Aries",
          moonSignName: code === "hi" ? "कर्क" : code === "te" ? "కర్కాటకం" : code === "ta" ? "கடகம்" : code === "kn" ? "ಕರ್ಕಾಟಕ" : "Cancer",
          mahaLordName: code === "hi" ? "गुरु" : code === "te" ? "గురు" : code === "ta" ? "குரு" : code === "kn" ? "ಗುರು" : "Jupiter",
          bhuktiLordName: code === "hi" ? "शनि" : code === "te" ? "శని" : code === "ta" ? "சனி" : code === "kn" ? "ಶನಿ" : "Saturn"
        });
        const text = buildDynamicCurrentPhaseFallback(chart);
        expect(text).toMatch(regex);
        const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
        expect(paragraphs.length).toBe(4);

        // Indic purity check: no English alphabet leakage in non-English texts
        if (code !== "en") {
          const englishWords = text.match(/[A-Za-z]{3,}/g);
          expect(englishWords).toBeNull();
        }
      }
    });
  });

  describe("buildDynamicSummaryFallback", () => {
    it("creates a warm personal soul synthesis with devotee name and yearly priority", () => {
      const chart = mockChart({ ageYears: 42, name: "ಶ್ರೀದೇವಿ", lang: "kn" });
      const text = buildDynamicSummaryFallback(chart);

      expect(text).toContain("ಶ್ರೀದೇವಿ");
      expect(text).toContain("ಗುರು");
      expect(text).toContain("ಶನಿ");
      expect(text).toContain("ಬಗ್ಗೋಣ");

      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(3);
    });

    it("synthesizes senior citizen priorities cleanly across all 5 languages without English leaks", () => {
      const langs = ["kn", "hi", "te", "ta", "en"] as const;

      for (const lang of langs) {
        const chart = mockChart({
          lang,
          name: lang === "en" ? "Ramesh" : "ದೇವತೆ",
          ageYears: 70,
          lagnaSignName: lang === "hi" ? "मेष" : lang === "te" ? "మేషం" : lang === "ta" ? "மேஷம்" : lang === "kn" ? "ಮೇಷ" : "Aries",
          moonSignName: lang === "hi" ? "कर्क" : lang === "te" ? "కర్కాటకం" : lang === "ta" ? "கடகம்" : lang === "kn" ? "ಕರ್ಕಾಟಕ" : "Cancer",
          mahaLordName: lang === "hi" ? "गुरु" : lang === "te" ? "గురు" : lang === "ta" ? "குரு" : lang === "kn" ? "ಗುರು" : "Jupiter",
          bhuktiLordName: lang === "hi" ? "शनि" : lang === "te" ? "శని" : lang === "ta" ? "சனி" : lang === "kn" ? "ಶನಿ" : "Saturn"
        });
        const text = buildDynamicSummaryFallback(chart);
        expect(text.length).toBeGreaterThan(150);

        if (lang !== "en") {
          const englishWords = text.match(/[A-Za-z]{3,}/g);
          expect(englishWords).toBeNull();
        }
      }
    });
  });

  describe("buildPremiumPrompts Personalization Directives", () => {
    it("embeds devotee name, age bracket directives, and living reality in AI prompts", () => {
      const prompts = buildPremiumPrompts({
        lang: "kn",
        runId: "test-run",
        name: "ವೆಂಕಟೇಶ್ ಭಟ್",
        ageYears: 65,
        maritalStatus: "married",
        hasChildren: "has_children",
        lagnaRashiIndex: 1,
        moonRashiIndex: 4,
        moonNakshatraIndex: 10,
        sunRashiIndex: 2,
        natalPlanets: [],
        transits: [],
        mahaLord: "Jupiter",
        bhuktiLord: "Saturn",
        bhuktiEndsAtAge: 68,
        engineYogas: [],
        engineDoshas: [],
        pariharas: [],
        shadowSelf: "None",
        karmicBaggage: "None",
        lifePhase: "Saturn Transit",
        overallTone: "Reflective",
        careerNote: "Advisory",
        financeNote: "Stable",
        roadmap: [],
        affairNote: ""
      });

      // currentPhase prompt checks
      expect(prompts.currentPhase).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(prompts.currentPhase).toContain("respected elder (age 65)");
      expect(prompts.currentPhase).toContain("EXACTLY WHAT IS HAPPENING IN THEIR LIFE RIGHT NOW");
      expect(prompts.currentPhase).toContain("EXACTLY FOUR (4) FULL, DETAILED PARAGRAPHS");

      // summary prompt checks
      expect(prompts.summary).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(prompts.summary).toContain("Do NOT write academic descriptions of astrological houses");
      expect(prompts.summary).toContain("ONE single most important life focus for the coming year");
      expect(prompts.summary).toContain("Baggona Kshetra");

      // timeline prompt checks
      expect(prompts.timeline).toContain("ವೆಂಕಟೇಶ್ ಭಟ್");
      expect(prompts.timeline).toContain("living reality");
    });
  });

  describe("BhavishyaView buildKundaliCurrentPhaseFallback", () => {
    it("returns deeply personal 4-paragraph fallback with name and age-stage specifics", () => {
      const text = buildKundaliCurrentPhaseFallback(
        "kn",
        "ಮೇಷ",
        "ವೃಶ್ಚಿಕ",
        "ಬುಧ",
        "ಶುಕ್ರ",
        "ಕೃಷ್ಣಮೂರ್ತಿ",
        64,
        "Male"
      );

      expect(text).toContain("ಕೃಷ್ಣಮೂರ್ತಿ");
      expect(text).toContain("ಬುಧ");
      expect(text).toContain("ಶುಕ್ರ");
      expect(text).toMatch(/ಆರೋಗ್ಯ|ಮನಸ್ಸಿನ ಶಾಂತಿ|ಮೊಮ್ಮಕ್ಕಳ|ಅಧ್ಯಾತ್ಮಿಕ/);
      expect(text).toContain("ಬಗ್ಗೋಣ");

      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });
  });
});
