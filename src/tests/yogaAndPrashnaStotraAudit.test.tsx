import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { ensureCompleteSentences } from "../features/premiumPdf/dynamicBhavishyaEngine";
import { enrichYogaDescription } from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { PdfTemplate, type PdfTranslations, type PremiumData } from "../components/RamanBhavishya/PdfTemplate";

describe("Yoga Section No-Cutoff & Prashna Stotra Zero-Repetition Audit", () => {
  describe("1. Yoga Section: No Cutoff In Between", () => {
    it("ensures ensureCompleteSentences preserves complete multi-sentence paragraphs without cutting off sentences in between", () => {
      // Paragraph where sentence 2 does not have a period at the end:
      const fullTextKn =
        "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗಜಕೇಸರಿ ಯೋಗವಿದೆ. ಈ ಯೋಗವು ಸಕಲ ಜಯವನ್ನು ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ";
      const completedKn = ensureCompleteSentences(fullTextKn, "kn");

      // Must NOT chop off sentence 2!
      expect(completedKn).toContain("ಈ ಯೋಗವು ಸಕಲ ಜಯವನ್ನು ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.");
      expect(completedKn).toBe("ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗಜಕೇಸರಿ ಯೋಗವಿದೆ. ಈ ಯೋಗವು ಸಕಲ ಜಯವನ್ನು ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.");
    });

    it("ensures ensureCompleteSentences still properly strips interrupted token cutoffs ending with dangling conjunctions or pronouns", () => {
      const danglingKn =
        "ಕಷ್ಟದ ಕಾಲದಲ್ಲೂ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಘನತೆ ಎಂದಿಗೂ ಕುಗ್ಗದಂತೆ ಈ ಯೋಗವು ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ";
      const cleanedKn = ensureCompleteSentences(danglingKn, "kn");

      expect(cleanedKn.endsWith("ನಿಮ್ಮ")).toBe(false);
      expect(cleanedKn.endsWith("ಕಾಪಾಡುತ್ತದೆ.")).toBe(true);
    });

    it("verifies enrichYogaDescription produces complete, generous paragraphs for classical yogas without cutoff", () => {
      const enrichedKn = enrichYogaDescription("Gajakesari Yoga", "", "kn", "ಮೇಷ", "ಕರ್ಕಾಟಕ", 32, "ಗುರು", "ಶುಕ್ರ");
      const paras = enrichedKn.split("\n\n");

      expect(paras.length).toBe(2);
      // Both paragraphs must end with proper terminal punctuation
      expect(paras[0].endsWith(".")).toBe(true);
      expect(paras[1].endsWith(".")).toBe(true);

      // Paragraph 1 explains what the yoga is; Paragraph 2 explains life impact
      expect(paras[0]).toContain("ಗಜಕೇಸರಿ");
      expect(paras[1]).toContain("ರಕ್ಷಣಾ ಕವಚ");
    });
  });

  describe("2. Prashna Stotra & Immediate Guidance: Zero Repetition", () => {
    const mockTranslations: PdfTranslations = {
      title: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ ಭವಿಷ್ಯ",
      subtitle: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ವರದಿ",
      nameLabel: "ಹೆಸರು",
      nameValue: "ಶ್ರೀರಾಮ ಪಂಡಿತ್",
      dobLabel: "ಜನ್ಮ ದಿನಾಂಕ",
      dobValue: "18-04-1996",
      lagnaLabel: "ಲಗ್ನ",
      moonLabel: "ರಾಶಿ",
      nakshatraLabel: "ನಕ್ಷತ್ರ",
      eraLabel: "ಸಂವತ್ಸರ",
      dashaLabel: "ದಶಾ",
      bhuktiLabel: "ಭುಕ್ತಿ",
      lagnaValue: "ಮೇಷ",
      moonValue: "ಕರ್ಕಾಟಕ",
      nakshatraValue: "ಪುಷ್ಯ",
      dashaPlanetValue: "ಗುರು",
      bhuktiPlanetValue: "ಶುಕ್ರ",
      characteristicsTitle: "ವ್ಯಕ್ತಿತ್ವ",
      darkSecretTitle: "ಅಂತರಂಗ ರಹಸ್ಯ",
      ashirvadaTitle: "ಆಶೀರ್ವಾದ",
      ashirvadaValue: "ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು",
      yogasTitle: "ಶುಭ ಯೋಗಗಳು",
      doshasTitle: "ದೋಷ ಪರಿಹಾರ",
      remedyTitle: "ಪರಿಹಾರ",
      timelineTitle: "ಕಾಲಚಕ್ರ",
      gocharaTitle: "ಗೋಚಾರ ಫಲ",
      summaryTitle: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ",
      footer: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
      prashnaGuidanceTitle: "ಪ್ರಶ್ನಾ ದೃಷ್ಟಿ & ತಾತ್ಕಾಲಿಕ ಮಾರ್ಗದರ್ಶನ"
    };

    const mockSession: any = {
      id: "test-session",
      input: {
        name: "ಶ್ರೀರಾಮ ಪಂಡಿತ್",
        dob: "1996-04-18",
        tob: "06:15",
        place: "Gokarna",
        lat: 14.54,
        lng: 74.31,
        gender: "male"
      },
      result: {
        planets: [
          { name: "Jupiter", house: 1, rashi: { index: 0, name: "Mesha" } },
          { name: "Moon", house: 4, rashi: { index: 3, name: "Karka" } }
        ]
      }
    };

    it("deduplicates repeated prashna paragraphs and renders at most ONE Stotra/Shield box", () => {
      // Simulate duplicate paragraphs and multiple Stotra/Shield boxes:
      const duplicatePrashnaData: PremiumData = {
        yogas: [],
        doshas: [],
        prashnaGuidance: [
          {
            impact:
              "ಪ್ರಶ್ನಾ ಲಗ್ನವಾದ ಮೇಷ ಮತ್ತು ಪ್ರಶ್ನಾ ಚಂದ್ರ ರಾಶಿಯಾದ ಕರ್ಕಾಟಕ ಈ ಕ್ಷಣದ ನಿಮ್ಮ ಮನಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ.\n\n" +
              "ನಿಮ್ಮ ಅಂತರ್ಗತದಲ್ಲಿ ಈ ಕ್ಷಣದ ಅತ್ಯಂತ ತೀವ್ರ ಪ್ರಶ್ನೆ ಅಥವಾ ಚಿಂತೆಯ ಉತ್ತರ ಇಲ್ಲಿದೆ.\n\n" +
              "【ಪ್ರಶ್ನಾ ರಕ್ಷಾ ಕವಚ】: 'ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ' - ಈ ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ."
          },
          {
            impact:
              "ಪ್ರಶ್ನಾ ಲಗ್ನವಾದ ಮೇಷ ಮತ್ತು ಪ್ರಶ್ನಾ ಚಂದ್ರ ರಾಶಿಯಾದ ಕರ್ಕಾಟಕ ಈ ಕ್ಷಣದ ನಿಮ್ಮ ಮನಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ.\n\n" +
              "ನಿಮ್ಮ ಅಂತರ್ಗತದಲ್ಲಿ ಈ ಕ್ಷಣದ ಅತ್ಯಂತ ತೀವ್ರ ಪ್ರಶ್ನೆ ಅಥವಾ ಚಿಂತೆಯ ಉತ್ತರ ಇಲ್ಲಿದೆ.\n\n" +
              "【ಪ್ರಶ್ನಾ ರಕ್ಷಾ ಕವಚ】: 'ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ' - ಈ ಮಂತ್ರವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ."
          }
        ]
      };

      const html = ReactDOMServer.renderToStaticMarkup(
        <PdfTemplate
          theme="sunrise"
          session={mockSession}
          predictions={[]}
          translations={mockTranslations}
          deepInsights={{}}
          premiumData={duplicatePrashnaData}
          lang="kn"
        />
      );

      // Verify the HTML contains the Prashna section
      expect(html).toContain('data-section="prashna-guidance"');

      // Count occurrences of the Shield callout
      const shieldMatches = html.match(/【ಪ್ರಶ್ನಾ ರಕ್ಷಾ ಕವಚ】/g) || [];
      expect(shieldMatches.length).toBe(1);

      // Count occurrences of the main paragraph
      const paraMatches = html.match(/ಪ್ರಶ್ನಾ ಲಗ್ನವಾದ ಮೇಷ ಮತ್ತು ಪ್ರಶ್ನಾ ಚಂದ್ರ ರಾಶಿಯಾದ ಕರ್ಕಾಟಕ/g) || [];
      expect(paraMatches.length).toBe(1);
    });
  });
});
