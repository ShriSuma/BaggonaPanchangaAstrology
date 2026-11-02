import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import {
  generateKundliRemedyReport,
  type SupportedLanguage
} from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";

describe("Daivika Parihara Deep Personalization & Panchanga Synthesis Guard", () => {
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

  const devoteeInput: KundliInput = {
    name: "ರಾಘವೇಂದ್ರ ಭಟ್",
    birthDate: "1988-10-24",
    birthTime: "06:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    gothra: "ವಿಶ್ವಾಮಿತ್ರ",
    primaryConcern: "career_obstacles"
  };

  const languages: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

  it("1. Generates complete 10-day relief and 15-day transformation milestones across all 5 languages", () => {
    const report = generateKundliRemedyReport(mockKundli, devoteeInput);
    const turnaround = report.lifeTurnaroundTiming;

    expect(turnaround).toBeDefined();
    expect(turnaround.day10Expectation).toBeDefined();
    expect(turnaround.day15Expectation).toBeDefined();
    expect(turnaround.beforeState).toBeDefined();
    expect(turnaround.afterState).toBeDefined();
    expect(turnaround.astrologicalReason).toBeDefined();

    for (const lang of languages) {
      expect(turnaround.day10Expectation?.[lang]).toBeTruthy();
      expect(turnaround.day10Expectation?.[lang]?.length).toBeGreaterThan(15);

      expect(turnaround.day15Expectation?.[lang]).toBeTruthy();
      expect(turnaround.day15Expectation?.[lang]?.length).toBeGreaterThan(15);

      expect(turnaround.beforeState?.[lang]).toBeTruthy();
      expect(turnaround.afterState?.[lang]).toBeTruthy();
      expect(turnaround.astrologicalReason?.[lang]).toBeTruthy();
    }
  });

  it("2. Accurately synthesizes Dasha Sandhi status (active, upcoming, or stable) with localized title and remedy", () => {
    const report = generateKundliRemedyReport(mockKundli, devoteeInput);
    const dashaAnalysis = report.dashaBhuktiAnalysis;

    expect(dashaAnalysis.sandhiAlert).toBeDefined();
    expect(["active", "upcoming", "stable"]).toContain(dashaAnalysis.sandhiAlert?.status);

    for (const lang of languages) {
      expect(dashaAnalysis.sandhiAlert?.title[lang]).toBeTruthy();
      expect(dashaAnalysis.sandhiAlert?.description[lang]).toBeTruthy();
      expect(dashaAnalysis.sandhiAlert?.remedy[lang]).toBeTruthy();
    }
  });

  it("3. Generates Panchanga 5-Angas elemental balance reason in all 5 languages", () => {
    const report = generateKundliRemedyReport(mockKundli, devoteeInput);
    const panchanga = report.panchangaRemedies;

    expect(panchanga.elementalBalanceReason).toBeDefined();

    for (const lang of languages) {
      const reason = panchanga.elementalBalanceReason?.[lang];
      expect(reason).toBeTruthy();
      expect(reason?.length).toBeGreaterThan(15);
    }
  });

  it("4. Ensures zero English token leakage into Indic text for Kannada milestones", () => {
    const report = generateKundliRemedyReport(mockKundli, devoteeInput);
    const turnaround = report.lifeTurnaroundTiming;

    const kn10 = turnaround.day10Expectation?.kn || "";
    const kn15 = turnaround.day15Expectation?.kn || "";
    const knBefore = turnaround.beforeState?.kn || "";
    const knAfter = turnaround.afterState?.kn || "";

    const forbiddenTokens = ["the", "and", "relief", "turnaround", "breakthrough", "after", "days", "stress"];
    for (const token of forbiddenTokens) {
      const regex = new RegExp(`\\b${token}\\b`, "i");
      expect(kn10).not.toMatch(regex);
      expect(kn15).not.toMatch(regex);
      expect(knBefore).not.toMatch(regex);
      expect(knAfter).not.toMatch(regex);
    }
  });

  it("5. PDF Template renders 10-day relief, 15-day transformation, and Sandhi alerts without breaking 3-page layout", () => {
    const report = generateKundliRemedyReport(mockKundli, devoteeInput);
    const { container } = render(<KundliRemedyPdfTemplate diagnosis={report} lang="kn" />);

    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(3);

    // Page 1 should contain elemental balance
    const page1Text = pages[0]?.textContent || "";
    expect(page1Text).toContain("ಪಂಚಭೂತ ಸಮನ್ವಯ ತತ್ತ್ವ");

    // Page 3 should contain turnaround and milestones
    const page3Text = pages[2]?.textContent || "";
    expect(page3Text).toContain("೧೦ ದಿನಗಳ ನಿರಂತರ ಸಾಧನೆಯ ಅನುಭವ");
    expect(page3Text).toContain("೧೫ ದಿನಗಳ ನಂತರ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಜೀವನ ತಿರುವು");
    expect(page3Text).toContain("ಪರಿಹಾರ ಪೂರ್ವ vs ಪರಿಹಾರೋತ್ತರ ಫಲ");
    expect(page3Text).toContain("ದಶಾ-ಸಂಧಿ ಕಾಲಾವಧಿ");
  });

  it("6. Audits all struggle categories for comprehensive non-empty milestone generation", () => {
    const concerns = [
      "career_obstacles",
      "marriage_delay",
      "health_issues",
      "financial_debt",
      "family_conflict",
      "education_focus",
      "spiritual_growth"
    ];

    for (const concern of concerns) {
      const rep = generateKundliRemedyReport(mockKundli, { ...devoteeInput, primaryConcern: concern });
      const tt = rep.lifeTurnaroundTiming;

      expect(tt.day10Expectation?.kn).toBeTruthy();
      expect(tt.day10Expectation?.en).toBeTruthy();
      expect(tt.day15Expectation?.kn).toBeTruthy();
      expect(tt.day15Expectation?.en).toBeTruthy();
      expect(tt.beforeState?.kn).toBeTruthy();
      expect(tt.afterState?.kn).toBeTruthy();
    }
  });
});
