import { describe, it, expect } from "vitest";
import {
  analyzeKundali,
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  getLagnaLordRemedyDetails,
  get8thLordNigoodhaDetails,
  type ParsedKundaliChart
} from "../features/premiumPdf/dynamicBhavishyaEngine";
import type { NatalPlacement, TransitPlacement } from "../features/premiumPdf/premiumPrompts";

function createMockChart(
  lagnaIndex: number,
  moonIndex: number,
  lang: string = "kn",
  maritalStatus: "married" | "unmarried" | "general" = "general",
  hasChildren: "yes" | "no" | "general" = "general"
): ParsedKundaliChart {
  const natalPlanets: NatalPlacement[] = [
    { graha: "Sun", rashiIndex: (lagnaIndex + 1) % 12, house: 2, retrograde: false, debilitated: false, exalted: false },
    { graha: "Moon", rashiIndex: moonIndex, house: ((moonIndex - lagnaIndex + 12) % 12) + 1, retrograde: false, debilitated: false, exalted: false },
    { graha: "Mars", rashiIndex: (lagnaIndex + 3) % 12, house: 4, retrograde: false, debilitated: false, exalted: false },
    { graha: "Mercury", rashiIndex: (lagnaIndex + 1) % 12, house: 2, retrograde: false, debilitated: false, exalted: false },
    { graha: "Jupiter", rashiIndex: (lagnaIndex + 4) % 12, house: 5, retrograde: false, debilitated: false, exalted: false },
    { graha: "Venus", rashiIndex: (lagnaIndex + 6) % 12, house: 7, retrograde: false, debilitated: false, exalted: false },
    { graha: "Saturn", rashiIndex: (lagnaIndex + 9) % 12, house: 10, retrograde: false, debilitated: false, exalted: false },
    { graha: "Rahu", rashiIndex: (lagnaIndex + 2) % 12, house: 3, retrograde: false, debilitated: false, exalted: false },
    { graha: "Ketu", rashiIndex: (lagnaIndex + 8) % 12, house: 9, retrograde: false, debilitated: false, exalted: false }
  ];

  const transits: TransitPlacement[] = [
    { graha: "Jupiter", rashiIndex: (moonIndex + 4) % 12, houseFromMoon: 5 },
    { graha: "Saturn", rashiIndex: (moonIndex + 10) % 12, houseFromMoon: 11 },
    { graha: "Rahu", rashiIndex: (moonIndex + 2) % 12, houseFromMoon: 3 },
    { graha: "Ketu", rashiIndex: (moonIndex + 8) % 12, houseFromMoon: 9 }
  ];

  return analyzeKundali({
    lang,
    name: "ದೇವತಾ ಭಕ್ತ",
    gender: "Male",
    ageYears: 32,
    maritalStatus,
    hasChildren,
    lagnaRashiIndex: lagnaIndex,
    moonRashiIndex: moonIndex,
    moonNakshatraIndex: 3,
    natalPlanets,
    transits,
    mahaLord: "Jupiter",
    bhuktiLord: "Venus"
  });
}

describe("Dynamic Samanya (General) Mode & Graha Remedy Parity Audit", () => {
  const languages = ["kn", "hi", "te", "ta", "en"];

  describe("Samanya Mode for Matrimonial (Marriage) Chapter", () => {
    it.each(languages)("guarantees 100% authentic astrological analysis with ZERO corporate filler in %s", (lang) => {
      const chart = createMockChart(0, 3, lang, "general", "general");
      const marriageText = buildDynamicMarriageFallback(chart);

      // Verify substantial length (minimum 3 paragraphs)
      const paras = marriageText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      expect(paras.length).toBeGreaterThanOrEqual(3);
      expect(marriageText.length).toBeGreaterThan(400);

      // Verify ZERO corporate filler words
      const lower = marriageText.toLowerCase();
      expect(lower).not.toContain("business partner");
      expect(lower).not.toContain("commercial collaboration");
      expect(lower).not.toContain("colleagues");
      expect(lower).not.toContain("ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆ");
      expect(lower).not.toContain("ಸಹೋದ್ಯೋಗಿ");
      expect(lower).not.toContain("व्यापारिक साझेदारी");
      expect(lower).not.toContain("सहकर्मी");
      expect(lower).not.toContain("వ్యాపార భాగస్వామ్యం");
      expect(lower).not.toContain("வணிகக் கூட்டாண்மை");

      // Verify authentic matrimonial tokens
      if (lang === "en") {
        expect(lower).toContain("7th house");
        expect(lower).toMatch(/spouse|vivaha|matrimonial/i);
      } else if (lang === "kn") {
        expect(marriageText).toContain("ಸಪ್ತಮ ಭಾವ");
        expect(marriageText).toMatch(/ಕಳತ್ರ|ವಿವಾಹ|ದಾಂಪತ್ಯ/);
      } else if (lang === "hi") {
        expect(marriageText).toContain("सप्तम भाव");
        expect(marriageText).toMatch(/कलत्र|विवाह|दांपत्य/);
      } else if (lang === "te") {
        expect(marriageText).toMatch(/7-వ|సప్తమ/);
        expect(marriageText).toMatch(/కళత్ర|వివాహ|దాంపత్య/);
      } else if (lang === "ta") {
        expect(marriageText).toMatch(/7-ம்|ஏழாம்/);
        expect(marriageText).toMatch(/களத்திர|திருமண|தாம்பத்திய/);
      }
    });
  });

  describe("Samanya Mode for Progeny (Children) Chapter", () => {
    it.each(languages)("guarantees 100% authentic progeny analysis with ZERO mentoring filler in %s", (lang) => {
      const chart = createMockChart(0, 3, lang, "general", "general");
      const childrenText = buildDynamicChildrenFallback(chart, "general");

      // Verify substantial length (minimum 3 paragraphs)
      const paras = childrenText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      expect(paras.length).toBeGreaterThanOrEqual(3);
      expect(childrenText.length).toBeGreaterThan(400);

      // Verify ZERO creative mentoring filler words
      const lower = childrenText.toLowerCase();
      expect(lower).not.toContain("creative project");
      expect(lower).not.toContain("younger generation");
      expect(lower).not.toContain("mentoring");
      expect(lower).not.toContain("junior colleague");
      expect(lower).not.toContain("ಸೃಜನಶೀಲ ಯೋಜನೆ");
      expect(lower).not.toContain("ಕಿರಿಯ ಪೀಳಿಗೆ");
      expect(lower).not.toContain("रचनात्मक परियोजना");
      expect(lower).not.toContain("युवा पीढ़ी");
      expect(lower).not.toContain("సృజనాత్మక ప్రాజెక్టులు");
      expect(lower).not.toContain("படைப்புத் திட்டங்கள்");

      // Verify authentic progeny tokens
      if (lang === "en") {
        expect(lower).toContain("5th house");
        expect(lower).toMatch(/putrakaraka|santana|progeny|children/i);
      } else if (lang === "kn") {
        expect(childrenText).toContain("ಪಂಚಮ ಭಾವ");
        expect(childrenText).toMatch(/ಪುತ್ರಕಾರಕ|ಸಂತಾನ|ಮಕ್ಕಳ/);
      } else if (lang === "hi") {
        expect(childrenText).toContain("पंचम भाव");
        expect(childrenText).toMatch(/पुत्रकारक|संतान/);
      } else if (lang === "te") {
        expect(childrenText).toMatch(/5-వ|పంచమ/);
        expect(childrenText).toMatch(/పుత్రకారక|సంతాన/);
      } else if (lang === "ta") {
        expect(childrenText).toMatch(/5-ம்|ஐந்தாம்/);
        expect(childrenText).toMatch(/புத்திர|சந்தான/);
      }
    });
  });

  describe("Dynamic Lagna Lord Remedies in Characteristics", () => {
    it("dynamically varies presiding deity, ritual, and mantra for Sun, Moon, Mars, Saturn Lagna Lords", () => {
      // Lagna 4 = Leo (Sun lord)
      const leoChart = createMockChart(4, 0, "en");
      const leoText = buildDynamicCharacteristicsFallback(leoChart);
      expect(leoText).toContain("Lord Suryanarayana");
      expect(leoText).toContain("Aditya Hridaya");

      // Lagna 3 = Cancer (Moon lord)
      const cancerChart = createMockChart(3, 0, "en");
      const cancerText = buildDynamicCharacteristicsFallback(cancerChart);
      expect(cancerText).toContain("Lord Chandrashekhara Shiva");
      expect(cancerText).toContain("Om Namah Shivaya");

      // Lagna 0 = Aries (Mars lord)
      const ariesChart = createMockChart(0, 0, "en");
      const ariesText = buildDynamicCharacteristicsFallback(ariesChart);
      expect(ariesText).toContain("Lord Subramanya");
      expect(ariesText).toContain("Hanuman Chalisa");

      // Lagna 9 = Capricorn (Saturn lord)
      const capChart = createMockChart(9, 0, "en");
      const capText = buildDynamicCharacteristicsFallback(capChart);
      expect(capText).toContain("Lord Shani Dev");
      expect(capText).toContain("Dasharatha Shani");

      // In Kannada
      const leoKn = buildDynamicCharacteristicsFallback(createMockChart(4, 0, "kn"));
      expect(leoKn).toContain("ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ");
      expect(leoKn).toContain("ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ");

      const cancerKn = buildDynamicCharacteristicsFallback(createMockChart(3, 0, "kn"));
      expect(cancerKn).toContain("ಶ್ರೀ ಚಂದ್ರಶೇಖರ ಶಿವ");

      const capKn = buildDynamicCharacteristicsFallback(createMockChart(9, 0, "kn"));
      expect(capKn).toContain("ಶ್ರೀ ಶನಿ ಮಹಾತ್ಮ");
    });
  });

  describe("Dynamic 8th Lord Subconscious Conflict & Remedy in Nigoodha Rahasya", () => {
    it("dynamically varies subconscious conflict and sacred remedy based on 8th house lord graha", () => {
      // Leo Lagna (4): 8th house is Pisces (11), lord is Jupiter
      const leoChart = createMockChart(4, 0, "en");
      const leoSecret = buildDynamicDarkSecretFallback(leoChart);
      expect(leoSecret).toContain("philosophical sorrow");
      expect(leoSecret).toContain("Dakshinamurthy Stotram");

      // Cancer Lagna (3): 8th house is Aquarius (10), lord is Saturn
      const cancerChart = createMockChart(3, 0, "en");
      const cancerSecret = buildDynamicDarkSecretFallback(cancerChart);
      expect(cancerSecret).toContain("existential loneliness");
      expect(cancerSecret).toContain("Dasharatha Shani Stotram");

      // Aries Lagna (0): 8th house is Scorpio (7), lord is Mars
      const ariesChart = createMockChart(0, 0, "en");
      const ariesSecret = buildDynamicDarkSecretFallback(ariesChart);
      expect(ariesSecret).toContain("subterranean reservoir of intense impatience");
      expect(ariesSecret.toLowerCase()).toContain("sheetali");

      // Taurus Lagna (1): 8th house is Sagittarius (8), lord is Jupiter
      const taurusChart = createMockChart(1, 0, "en");
      const taurusSecret = buildDynamicDarkSecretFallback(taurusChart);
      expect(taurusSecret).toContain("Dakshinamurthy");

      // In Kannada
      const leoSecretKn = buildDynamicDarkSecretFallback(createMockChart(4, 0, "kn"));
      expect(leoSecretKn).toContain("ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ");

      const ariesSecretKn = buildDynamicDarkSecretFallback(createMockChart(0, 0, "kn"));
      expect(ariesSecretKn).toContain("ಶೀತಲೀ ಪ್ರಾಣಾಯಾಮ");

      const cancerSecretKn = buildDynamicDarkSecretFallback(createMockChart(3, 0, "kn"));
      expect(cancerSecretKn).toContain("ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ");
    });
  });
});
