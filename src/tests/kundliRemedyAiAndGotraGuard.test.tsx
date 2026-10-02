import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { generateKundliRemedyWithAi, REMEDY_AI_FALLBACK_MESSAGES } from "../features/remedies/kundliRemedyAiEngine";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { KundliRemedyView } from "../components/kundli/KundliRemedyView";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";

describe("Kundli Gotra Default Bug Elimination & AI Remedy 10-Retry Guard", () => {
  const mockKundli: KundliOutput = {
    planets: [
      { name: PlanetName.Sun, degree: 45, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
      { name: PlanetName.Moon, degree: 140, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
      { name: PlanetName.Mars, degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 1 },
      { name: PlanetName.Mercury, degree: 60, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 2 },
      { name: PlanetName.Jupiter, degree: 120, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 3 },
      { name: PlanetName.Venus, degree: 90, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 6, english: "Ardra", sanskrit: "Ardra", deity: "Rudra" }, house: 2 },
      { name: PlanetName.Saturn, degree: 210, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 7 },
      { name: PlanetName.Rahu, degree: 330, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, nakshatra: { index: 24, english: "Shatabhisha", sanskrit: "Shatabhisha", deity: "Varuna" }, house: 10 },
      { name: PlanetName.Ketu, degree: 150, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 11, english: "Purva Phalguni", sanskrit: "Purva Phalguni", deity: "Bhaga" }, house: 4 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => i * 30),
    ascendant: 15,
    lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" },
    moonSign: { index: 4, english: "Leo", sanskrit: "Simha" },
    sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
    moonPada: 1
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Gotra Preservation Guard", () => {
    it("should NOT default Gotra to 'Kashyapa' when Gotra is undefined", () => {
      const inputWithoutGotra: KundliInput = {
        name: "Devotee No Gotra",
        birthDate: "1990-01-01",
        birthTime: "12:00",
        latitude: 14.5479,
        longitude: 74.3188,
        gender: "Male"
      };

      const report = generateKundliRemedyReport(mockKundli, inputWithoutGotra);
      expect(report.gotra).toBeUndefined();
      expect(report.gotra).not.toBe("Kashyapa");
      expect(report.gotra).not.toBe("ಕಾಶ್ಯಪ");
      // Chief priest blessing should not mention any gotra
      expect(report.chiefPriestBlessing.ashirvadaMeaning.kn).not.toContain("ಕಾಶ್ಯಪ");
      expect(report.chiefPriestBlessing.ashirvadaMeaning.en).not.toContain("Kashyapa");
    });

    it("should NOT default Gotra to 'Kashyapa' when Gotra is empty string or whitespace", () => {
      const inputWithEmptyGotra: KundliInput = {
        name: "Devotee Empty Gotra",
        birthDate: "1990-01-01",
        birthTime: "12:00",
        latitude: 14.5479,
        longitude: 74.3188,
        gender: "Female",
        gothra: "   "
      };

      const normalizedGotra = inputWithEmptyGotra.gothra?.trim() || undefined;
      expect(normalizedGotra).toBeUndefined();
      expect(normalizedGotra).not.toBe("Kashyapa");

      const report = generateKundliRemedyReport(mockKundli, {
        ...inputWithEmptyGotra,
        gothra: normalizedGotra
      });
      expect(report.gotra).toBeUndefined();
      expect(report.chiefPriestBlessing.ashirvadaMeaning.kn).not.toContain("ಕಾಶ್ಯಪ");
      expect(report.chiefPriestBlessing.ashirvadaMeaning.en).not.toContain("Kashyapa");
    });

    it("should retain genuine Gotra when provided by user", () => {
      const inputWithRealGotra: KundliInput = {
        name: "Devotee Real Gotra",
        birthDate: "1990-01-01",
        birthTime: "12:00",
        latitude: 14.5479,
        longitude: 74.3188,
        gender: "Male",
        gothra: "Bharadwaja"
      };

      const report = generateKundliRemedyReport(mockKundli, inputWithRealGotra);
      expect(report.gotra).toBe("Bharadwaja");
      expect(report.chiefPriestBlessing.ashirvadaMeaning.kn).toContain("Bharadwaja ಗೋತ್ರದ");
      expect(report.chiefPriestBlessing.ashirvadaMeaning.en).toContain("Bharadwaja Gotra");
    });
  });

  describe("AI Remedy Engine 10-Retry and Fallback Warning Guard", () => {
    const input: KundliInput = {
      name: "Test Devotee",
      birthDate: "1992-05-15",
      birthTime: "09:30",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male"
    };

    it("should perform up to 10 retries on GenAI failure and fall back to classical remedy with warning banner", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        return Promise.reject(new Error("Network / Rate limit simulated error"));
      });

      const report = await generateKundliRemedyWithAi({
        kundli: mockKundli,
        input,
        lang: "kn",
        apiKey: "mock-gemini-api-key",
        retryDelayMs: 0
      });

      // Verify exactly 10 attempts were made
      expect(attempts).toBe(10);

      // Verify fallback behavior
      expect(report.isAiGenerated).toBe(false);
      expect(report.aiFallbackMessage).toBeDefined();
      expect(report.aiFallbackMessage?.kn).toBe(REMEDY_AI_FALLBACK_MESSAGES.kn);
      expect(report.aiFallbackMessage?.kn).toContain("ಇದು AI ರಚಿಸಿದ");
      expect(report.aiFallbackMessage?.kn).toContain("೧೦ ಬಾರಿ ಪ್ರಯತ್ನಿಸಿದರೂ");

      // Classical calculations must still be fully intact
      expect(report.devoteeName).toBe("Test Devotee");
      expect(report.instantCalmingProtocol.steps.length).toBe(4);
      expect(report.panchangaRemedies).toBeDefined();
      expect(report.chiefPriestBlessing.phone).toBe("+91 99723 39362");
    });

    it("should succeed when GenAI succeeds within retry limit", async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("Transient failure"));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: "॥ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ ॥ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನ ಮತ್ತು ಚಂದ್ರನ ಸ್ಥಿತಿಯನ್ನು ಅವಲೋಕಿಸಿದಾಗ..."
                    }
                  ]
                }
              }
            ]
          })
        });
      });

      const report = await generateKundliRemedyWithAi({
        kundli: mockKundli,
        input,
        lang: "kn",
        apiKey: "mock-gemini-api-key",
        retryDelayMs: 0
      });

      expect(attempts).toBe(3);
      expect(report.isAiGenerated).toBe(true);
      expect(report.aiNarration).toContain("ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ");
      expect(report.aiFallbackMessage).toBeUndefined();
    });

    it("should provide localized fallback warnings in all 5 languages", () => {
      expect(REMEDY_AI_FALLBACK_MESSAGES.kn).toContain("ಇದು AI ರಚಿಸಿದ");
      expect(REMEDY_AI_FALLBACK_MESSAGES.en).toContain("This is not an AI-generated");
      expect(REMEDY_AI_FALLBACK_MESSAGES.hi).toContain("यह AI");
      expect(REMEDY_AI_FALLBACK_MESSAGES.te).toContain("ఇది AI ద్వారా");
      expect(REMEDY_AI_FALLBACK_MESSAGES.ta).toContain("இது AI");
    });
  });

  describe("Script Purity & Zero Cross-Language Leakage Guard", () => {
    it("should verify no Kannada characters leak into Devanagari Sanskrit stotras or Beeja mantras", () => {
      const input: KundliInput = {
        name: "Shree Purity Devotee",
        birthDate: "1995-08-15",
        birthTime: "08:30",
        latitude: 14.5479,
        longitude: 74.3188,
        gender: "Male"
      };

      const report = generateKundliRemedyReport(mockKundli, input);

      // Check emergency beeja mantras
      const knRegex = /[\u0C80-\u0CFF]/;
      const devanagariRegex = /[\u0900-\u097F]/;

      // Sanskrit stotras must contain Devanagari and NOT Kannada
      for (const stotra of report.personalizedStotras) {
        expect(devanagariRegex.test(stotra.shlokaSanskrit)).toBe(true);
        expect(knRegex.test(stotra.shlokaSanskrit)).toBe(false);
      }

      // Check Panchanga Nakshatra Beeja Mantra
      expect(devanagariRegex.test(report.panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)).toBe(true);
      expect(knRegex.test(report.panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit)).toBe(false);
    });
  });

  describe("End-User Printed PDF Cleanliness & Operator UI Alert Separation Guard", () => {
    const input: KundliInput = {
      name: "Devotee Ananda",
      birthDate: "1993-04-12",
      birthTime: "11:15",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male"
    };

    it("PDF MUST NEVER show any fallback/failure warning banners to the end user when AI fails", () => {
      const fallbackReport = generateKundliRemedyReport(mockKundli, input);
      fallbackReport.isAiGenerated = false;
      fallbackReport.aiFallbackMessage = REMEDY_AI_FALLBACK_MESSAGES;

      const { container } = render(
        <KundliRemedyPdfTemplate diagnosis={fallbackReport} lang="kn" />
      );

      const textContent = container.textContent || "";
      // Must NOT contain any part of the fallback warning or failure notices
      expect(textContent).not.toContain("ಇದು AI ರಚಿಸಿದ");
      expect(textContent).not.toContain("ವಿಫಲವಾಗಿದ್ದರಿಂದ");
      expect(textContent).not.toContain("೧೦ ಬಾರಿ");
      expect(textContent).not.toContain("This is not an AI-generated");
      expect(textContent).not.toContain("AI generation failed");

      // Must cleanly contain the authentic Section 1 title and devotee info
      expect(textContent).toContain("೧. ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ");
      expect(textContent).toContain("Devotee Ananda");
    });

    it("PDF renders the prestigious AI narration card when AI generation succeeds", () => {
      const successReport = generateKundliRemedyReport(mockKundli, input);
      successReport.isAiGenerated = true;
      successReport.aiNarrationText = {
        kn: "॥ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ ॥ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನ ಮತ್ತು ಚಂದ್ರನ ಸ್ಥಿತಿಯನ್ನು ಅವಲೋಕಿಸಿದಾಗ..."
      };

      const { container } = render(
        <KundliRemedyPdfTemplate diagnosis={successReport} lang="kn" />
      );

      const textContent = container.textContent || "";
      expect(textContent).toContain("ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ");
      expect(textContent).not.toContain("AI ದೈವಿಕ");
      expect(textContent).toContain("ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ");
      expect(textContent).not.toContain("ವಿಫಲವಾಗಿದ್ದರಿಂದ");
    });

    it("App UI displays the alert warning to the logged-in Baggona Panchanga user / Super Admin when AI fails", () => {
      const fallbackReport = generateKundliRemedyReport(mockKundli, input);
      fallbackReport.isAiGenerated = false;
      fallbackReport.aiFallbackMessage = REMEDY_AI_FALLBACK_MESSAGES;

      const { container } = render(
        <KundliRemedyView
          diagnosis={fallbackReport}
          lang="kn"
          onDownloadPdf={vi.fn()}
        />
      );

      const textContent = container.textContent || "";
      // In the interactive UI for the logged-in user, the alert is clearly shown
      expect(textContent).toContain("ಇದು AI ರಚಿಸಿದ ನಿರೂಪಣೆಯಲ್ಲ");
      expect(textContent).toContain("೧೦ ಬಾರಿ ಪ್ರಯತ್ನಿಸಿದರೂ");
    });
  });
});
