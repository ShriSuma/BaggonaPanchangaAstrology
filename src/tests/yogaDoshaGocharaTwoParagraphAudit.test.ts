import { describe, it, expect } from "vitest";
import {
  enrichYogaDescription,
  enrichDoshaDescription,
  enrichGocharaDescription,
  hasTwoSubstantialParagraphs,
} from "../features/premiumPdf/yogaDoshaGocharaEnricher";

describe("Yoga, Dosha & Gochara Two-Paragraph Strict Contract Audit", () => {
  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  describe("Yoga Enrichment - Exactly 2 Paragraphs & 4-5 Lines Contract", () => {
    const yogaNames = [
      "Gajakesari Yoga",
      "Obhayachari Yoga",
      "Mahalakshmi Yoga",
      "Dharma-Karma Adhipati Yoga",
      "Budhaditya Yoga",
      "Amala Yoga", // Generic fallback
    ];

    yogaNames.forEach((yogaName) => {
      languages.forEach((lang) => {
        it(`should produce exactly 2 substantial paragraphs for ${yogaName} in [${lang}]`, () => {
          const rawShort = "Short 1-line impact statement.";
          const enriched = enrichYogaDescription(
            yogaName,
            rawShort,
            lang,
            "Mesha",
            "Vrishabha",
            35,
            "Guru",
            "Shani"
          );

          // 1. Must split into exactly 2 paragraphs by \n\n
          const paras = enriched.split(/\n\n+/).map((p) => p.trim());
          expect(paras).toHaveLength(2);

          // 2. Both paragraphs must be substantial (>= 200 chars to ensure 4-5 lines of text)
          expect(paras[0].length).toBeGreaterThanOrEqual(200);
          expect(paras[1].length).toBeGreaterThanOrEqual(200);

          // 3. Paragraph 1 should include the short input or context
          if (lang === "en") {
            expect(paras[0]).toContain(rawShort);
          }
        });
      });
    });
  });

  describe("Dosha Enrichment - Exactly 2 Paragraphs & 4-5 Lines Contract", () => {
    const doshaNames = [
      "Kuja Dosha",
      "Kala Sarpa Dosha",
      "Guru Chandala Dosha",
      "Pitri Dosha", // Generic fallback
    ];

    doshaNames.forEach((doshaName) => {
      languages.forEach((lang) => {
        it(`should produce exactly 2 substantial paragraphs for ${doshaName} in [${lang}]`, () => {
          const rawShort = "Slight affliction noted in 7th house.";
          const enriched = enrichDoshaDescription(
            doshaName,
            rawShort,
            lang,
            "Karka",
            "Simha",
            40,
            "Shani",
            "Budha"
          );

          const paras = enriched.split(/\n\n+/).map((p) => p.trim());
          expect(paras).toHaveLength(2);

          // Both paragraphs must be at least 200 chars (4-5 lines in PDF body font)
          expect(paras[0].length).toBeGreaterThanOrEqual(200);
          expect(paras[1].length).toBeGreaterThanOrEqual(200);

          if (lang === "en") {
            expect(paras[0]).toContain(rawShort);
          }
        });
      });
    });
  });

  describe("Gochara Enrichment - Exactly 2 Paragraphs & 4-5 Lines Contract", () => {
    const transitNames = [
      "Saturn Transit (Shani Gochara)",
      "Jupiter Transit (Guru Gochara)",
      "Rahu Ketu Transit",
      "Mars Transit", // Generic fallback
    ];

    transitNames.forEach((transitName) => {
      languages.forEach((lang) => {
        it(`should produce exactly 2 substantial paragraphs for ${transitName} in [${lang}]`, () => {
          const rawShort = "Transiting 9th house from Janma Rashi.";
          const enriched = enrichGocharaDescription(
            transitName,
            rawShort,
            lang,
            "Makara",
            32,
            "Budha",
            "Shukra"
          );

          const paras = enriched.split(/\n\n+/).map((p) => p.trim());
          expect(paras).toHaveLength(2);

          // Both paragraphs must be at least 200 chars (4-5 lines in PDF body font)
          expect(paras[0].length).toBeGreaterThanOrEqual(200);
          expect(paras[1].length).toBeGreaterThanOrEqual(200);

          if (lang === "en") {
            expect(paras[0]).toContain(rawShort);
          }
        });
      });
    });
  });

  describe("hasTwoSubstantialParagraphs Validator & Preservation Behavior", () => {
    it("returns false for undefined or empty string", () => {
      expect(hasTwoSubstantialParagraphs(undefined)).toBe(false);
      expect(hasTwoSubstantialParagraphs("")).toBe(false);
    });

    it("returns false for a single paragraph even if long", () => {
      const longSinglePara = "A".repeat(400);
      expect(hasTwoSubstantialParagraphs(longSinglePara)).toBe(false);
    });

    it("returns false if one of the two paragraphs is too short (< 180 chars)", () => {
      const p1 = "A".repeat(250);
      const p2 = "Too short";
      expect(hasTwoSubstantialParagraphs(`${p1}\n\n${p2}`)).toBe(false);
    });

    it("returns true if both paragraphs are at least 180 chars", () => {
      const p1 = "A".repeat(200);
      const p2 = "B".repeat(200);
      expect(hasTwoSubstantialParagraphs(`${p1}\n\n${p2}`)).toBe(true);
    });

    it("preserves AI text if it already contains 2 substantial paragraphs", () => {
      const existingP1 = "This is a detailed Vedic definition of Gajakesari Yoga explaining the planetary positions in great depth and classical authority.".repeat(2);
      const existingP2 = "This explains what this yoga is currently doing in their life regarding career stability, ethical leadership, and peace of mind.".repeat(2);
      const fullText = `${existingP1}\n\n${existingP2}`;

      const enriched = enrichYogaDescription("Gajakesari", fullText, "en");
      expect(enriched).toBe(fullText);
    });
  });
});
