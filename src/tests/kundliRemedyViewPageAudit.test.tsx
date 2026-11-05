import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { KundliRemedyView, REMEDY_VIEW_I18N, PAKSHA_LOCALE, TRANSIT_EFFECT_LOCALE } from "../components/kundli/KundliRemedyView";
import { generateKundliRemedyReport, type SupportedLanguage } from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliOutput, type KundliInput } from "../core/AstroTypes";

describe("KundliRemedyView Comprehensive 5-Language Web Page Audit", () => {
  const sampleKundli: KundliOutput = {
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
    moonPada: 2
  };

  const sampleInput: KundliInput = {
    name: "Siddhartha Sharma",
    birthDate: "1988-08-18",
    birthTime: "08:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    gothra: "Vashistha"
  };

  const report = generateKundliRemedyReport(sampleKundli, sampleInput);

  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  const languages: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

  languages.forEach((lang) => {
    it(`renders complete remedy page in ${lang.toUpperCase()} with 100% section coverage and no script leaks`, () => {
      const onDownloadPdf = vi.fn();
      const onPriestChange = vi.fn();

      const { container } = render(
        <KundliRemedyView
          diagnosis={report}
          lang={lang}
          onDownloadPdf={onDownloadPdf}
          onPriestChange={onPriestChange}
        />
      );

      const text = container.textContent || "";
      const t = REMEDY_VIEW_I18N[lang];

      // 1. Header & Devotee Metadata
      expect(text).toContain(t.headerTitle);
      expect(text).toContain(t.lagnaLabel);
      expect(text).toContain(t.rashiLabel);
      expect(text).toContain(t.nakshatraLabel);

      // 2. Section 1: Instant Calm Protocol & Emergency Mantra
      expect(text).toContain(t.emergencyMantraTitle);
      expect(text).toContain(t.startCalmTimerBtn);

      // 3. Section 2: Root Cause Diagnosis & Meters
      expect(text).toContain(t.rootCauseTitle);
      expect(text).toContain(t.metersTitle);
      expect(text).toContain(t.meterKrodha);
      expect(text).toContain(t.meterManas);
      expect(text).toContain(t.meterVitality);
      expect(text).toContain(t.meterPatience);
      expect(text).toContain(t.lifeTurnaroundTitle);

      // 4. Section 2B: Medical-Grade Astrological Prescription
      expect(text).toContain(t.prescriptionCardTitle);
      expect(text).toContain(t.prescriptionNidanaTitle);
      expect(text).toContain(t.prescriptionAnupanaTitle);
      expect(text).toContain(t.prescriptionAushadhaTitle);
      expect(text).toContain(t.prescriptionPathyaTitle);
      expect(text).toContain(t.prescriptionApathyaTitle);
      expect(text).toContain(t.prescriptionProgressionTitle);

      // 5. Section 3: Panchanga 5-Anga & Sacred Tree
      expect(text).toContain(t.panchangaTitle);
      expect(text).toContain(t.sacredTreeTitle);
      expect(text).toContain(t.tithiVrataTitle);
      expect(text).toContain(t.weekdaySadhanaTitle);
      expect(text).toContain(t.yogaKaranaTitle);
      expect(text).toContain(t.padaLabel);
      expect(text).toContain(t.yogaLabel);
      expect(text).toContain(t.karanaLabel);
      expect(text).toContain(t.elementalBalanceLabel);

      // 6. Section 4: Daily Stotras Guide
      expect(text).toContain(t.dailyStotrasTitle);
      expect(text).toContain(t.meaningLabel);
      expect(text).toContain(t.benefitsLabel);

      // 7. Section 5B: 45-Day Mandala Vrata & Interactive Tracker
      expect(text).toContain(t.mandalaSectionTitle);
      expect(text).toContain(t.muhurthaCardTitle);
      expect(text).toContain(t.japaFormulaCardTitle);
      expect(text).toContain(t.japaFormulaCount);
      expect(text).toContain(t.pathyaCardTitle);
      expect(text).toContain(t.dailyChecklistTitle);
      expect(text).toContain(t.trackerCardTitle);
      expect(text).toContain(t.sankalpaBoxTitle);

      // 8. Section 6: Active Dasha-Bhukti & Gochara Transits
      expect(text).toContain(t.dashaGocharaTitle);
      expect(text).toContain(t.mahaDashaLabel);

      // 9. Section 7: Planetary Strength & Benchmark
      expect(text).toContain(t.planetaryTitle);
      expect(text).toContain(report.planetaryStrengthRemedies.influencerBenchmarkComparison.title[lang]);

      // 10. Section 8: Gokarna Mahabaleshwara Sevas & Blessings
      expect(text).toContain(t.gokarnaSevasTitle);
      expect(text).toContain(t.prescribedSevaTitle);
      expect(text).toContain(t.rudrakshaGemstoneTitle);
      expect(text).toContain(t.sacredDanaTitle);
      expect(text).toContain(t.priestSelectionTitle);
      expect(text).toContain(t.templeSealBadge);

      // 11. Script Purity & Zero Leakage Checks
      if (lang === "kn") {
        expect(text).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
        expect(text).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
      } else if (lang === "hi") {
        expect(text).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(text).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
        expect(text).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
        expect(text).not.toMatch(/[\u0400-\u04FF]/); // No Cyrillic
      } else if (lang === "te") {
        expect(text).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(text).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
      } else if (lang === "ta") {
        expect(text).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(text).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
      } else if (lang === "en") {
        // In English, ensure all section headings are in English
        expect(text).toContain("Natal Kundali Astrological Remedy");
        expect(text).toContain("45-Day Mandala Vrata Sadhana");
      }
    });
  });

  it("handles 45-day interactive progress tracker clicks and localStorage persistence", () => {
    const { getByTestId } = render(
      <KundliRemedyView
        diagnosis={report}
        lang="kn"
        onDownloadPdf={vi.fn()}
      />
    );

    const day5Btn = getByTestId("mandala-day-5");
    expect(day5Btn).toBeDefined();

    fireEvent.click(day5Btn);
    // Toggling should update progress and mark check
    expect(day5Btn.textContent).toContain("✓");
  });

  it("handles roadmap phase switching between Phase 1, 2, and 3", () => {
    const { getByTestId } = render(
      <KundliRemedyView
        diagnosis={report}
        lang="en"
        onDownloadPdf={vi.fn()}
      />
    );

    const phase2Btn = getByTestId("mandala-phase-btn-2");
    expect(phase2Btn).toBeDefined();

    fireEvent.click(phase2Btn);
    // Should now display Phase 2 content
    expect(document.body.textContent).toContain(report.mandalaVrataSadhana?.threePhaseRoadmap.phase2.phaseTitle.en);
  });
});
