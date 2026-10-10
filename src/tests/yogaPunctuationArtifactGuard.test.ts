import { describe, it, expect } from "vitest";
import { enrichYogaDescription, cleanPunctuationArtifacts } from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";

describe("Yoga Punctuation Artifact & Dot-Comma Guard", () => {
  it("never prefixes Kannada yoga paragraphs with '.. ,' or stray punctuation", () => {
    const dirtyInputs = [
      ".. ,",
      "...,",
      ". , .",
      "• ",
      ": 7 × ..",
      "  .. ,   ",
      "- ",
      "1. ",
      "-- , .."
    ];

    for (const dirty of dirtyInputs) {
      const result = enrichYogaDescription("Gajakesari Yoga", dirty, "kn", "ಕರ್ಕಾಟಕ", "ಕನ್ಯಾ");
      expect(result).not.toMatch(/^[.,:;\-–—•*|~×\s]+/);
      expect(result.startsWith("..")).toBe(false);
      expect(result.startsWith(",")).toBe(false);
      expect(result.startsWith(".")).toBe(false);
      expect(result).toContain("ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ");
    }
  });

  it("handles English fallback significance cleanly when target language is Kannada without leaking punctuation residue", () => {
    const englishSignificance =
      "Jupiter is in a Kendra from the Moon. Grants intelligence, lasting reputation, and possession of all worldly enjoyments.";

    const result = enrichYogaDescription("Gajakesari Yoga", englishSignificance, "kn", "ಕರ್ಕಾಟಕ", "ಕನ್ಯಾ");
    expect(result).not.toMatch(/^[.,:;\-–—•*|~×\s]+/);
    expect(result.startsWith("..")).toBe(false);
    expect(result.startsWith(",")).toBe(false);
    expect(result.startsWith(".")).toBe(false);
    expect(result).toContain("ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ");
    expect(result).not.toContain("Jupiter");
  });

  it("cleans leading punctuation from AI-generated text starting with '.. , '", () => {
    const textWithLeadingDots =
      ".. , ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯೋಗ ರಚನೆಯಾಗಿದೆ. ಇದು ಜೀವನದ ಪ್ರಮುಖ ಹಂತಗಳಲ್ಲಿ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.\n\nಪ್ರಸ್ತುತ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಈ ಯೋಗವು ಸಕಲ ಸೌಭಾಗ್ಯಗಳನ್ನು ತರುತ್ತದೆ.";

    const cleaned = cleanPunctuationArtifacts(textWithLeadingDots);
    expect(cleaned.startsWith("..")).toBe(false);
    expect(cleaned.startsWith(",")).toBe(false);
    expect(cleaned.startsWith("ನಿಮ್ಮ")).toBe(true);
  });

  it("ensures cleanEnglishFromRegionalText eliminates punctuation residue left by Latin removal", () => {
    const rawEnglish = "Jupiter is in a Kendra from the Moon. Grants intelligence, lasting reputation.";
    const cleaned = cleanEnglishFromRegionalText(rawEnglish, "kn");
    expect(cleaned).toBe("");
  });
});
