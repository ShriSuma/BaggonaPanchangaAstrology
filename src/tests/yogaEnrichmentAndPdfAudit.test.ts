import { describe, it, expect } from "vitest";
import { enrichYogaDescription } from "../components/RamanBhavishya/BhavishyaView";

describe("Yoga Enrichment & PDF Quality Audit Tests", () => {
  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  it("enriches 1-line Obhayachari Yoga text into full 3-4 sentence paragraph for Kannada", () => {
    const rawShortText = "ರಾಜನಿಗೆ ಸಮಾನ, ಒಳ್ಳೆಯ, ಸಹಾನುಭೂತಿ ಮತ್ತು ಪರೋಪಕಾರಿ.";
    const enriched = enrichYogaDescription("Obhayachari Yoga", rawShortText, "kn", "ಕರ್ಕಾಟಕ", "ಕನ್ಯಾ");

    expect(enriched).toContain(rawShortText);
    expect(enriched.length).toBeGreaterThan(120);
    expect(enriched).toContain("ಉಭಯಚಾರಿ ಯೋಗ");
  });

  it("enriches 1-line Gajakesari Yoga text into full substantial paragraph for all 5 languages", () => {
    const rawShortText = "Guru in Kendra from Moon.";

    languages.forEach((l) => {
      const enriched = enrichYogaDescription("Gajakesari Yoga", rawShortText, l, "Ascendant", "Moon");
      expect(enriched).toBeTruthy();
      expect(enriched.length).toBeGreaterThan(100);
    });
  });

  it("enriches 1-line Lakshmi Yoga text into full substantial paragraph for Hindi & Telugu", () => {
    const shortHindi = "अत्यंत सुंदर रूप, उच्च ख्याति और संपत्ति।";
    const enrichedHi = enrichYogaDescription("Lakshmi Yoga", shortHindi, "hi", "कर्क", "कन्या");
    expect(enrichedHi.length).toBeGreaterThan(100);
    expect(enrichedHi).toContain("महालक्ष्मी");

    const shortTe = "అత్యంత సుందర రూపం మరియు సంపద.";
    const enrichedTe = enrichYogaDescription("Lakshmi Yoga", shortTe, "te", "కర్కాటక", "కన్య");
    expect(enrichedTe.length).toBeGreaterThan(100);
  });
});
