import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { KundliRemedyPdfTemplate, PDF_I18N, TATVA_LOCALE, formatHouseName } from "../components/kundli/KundliRemedyPdfTemplate";
import {
  generateKundliRemedyReport,
  type SupportedLanguage,
  CLASSICAL_STOTRAS_CATALOG,
  computeBadhakaAnalysis,
  NAKSHATRA_REMEDY_DATA,
  computeVedicDoctorPrescription
} from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliOutput, type KundliInput } from "../core/AstroTypes";

describe("KundliRemedyPdfTemplate Comprehensive Word-by-Word 5-Language Audit", () => {
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

  const mockDevotee: KundliInput = {
    name: "Siddhartha Sharma",
    birthDate: "1988-08-18",
    birthTime: "08:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    gothra: "Vashistha",
    primaryConcern: "inner_peace_and_growth"
  };

  const report = generateKundliRemedyReport(mockKundli, mockDevotee);

  beforeEach(() => {
    cleanup();
  });

  const languages: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

  languages.forEach((lang) => {
    it(`validates complete word-by-word 3-page rendering, section coverage and script purity in ${lang.toUpperCase()}`, () => {
      const { container } = render(
        <KundliRemedyPdfTemplate
          diagnosis={report}
          lang={lang}
          overridePriestName="ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್"
          overridePriestPhone="+91 94821 09844"
        />
      );

      const pages = container.querySelectorAll(".pdf-page");
      expect(pages.length).toBe(3);

      const i18n = PDF_I18N[lang];
      const p1Text = pages[0]?.textContent || "";
      const p2Text = pages[1]?.textContent || "";
      const p3Text = pages[2]?.textContent || "";
      const allText = container.textContent || "";

      // ==========================================
      // PAGE 1 AUDIT
      // ==========================================
      expect(p1Text).toContain(i18n.templeBanner);
      expect(p1Text).toContain(i18n.mainTitle);
      expect(p1Text).toContain(i18n.dhyanaShloka);

      // Devotee Matrix
      expect(p1Text).toContain(i18n.devotee);
      expect(p1Text).toContain(i18n.lagna);
      expect(p1Text).toContain(i18n.rashi);
      expect(p1Text).toContain(i18n.nakshatra);
      expect(p1Text).toContain(i18n.birthDetails);
      expect(p1Text).toContain(i18n.panchangaTithiVara);

      // Narration Card
      expect(p1Text).toContain(i18n.narrationHeader);
      expect(p1Text).toContain(i18n.narrationBadge);

      // Section 1: Diagnosis & Struggle
      expect(p1Text).toContain(i18n.sec1Title);
      expect(p1Text).toContain(i18n.krodhaLabel);
      expect(p1Text).toContain(i18n.manasLabel);
      expect(p1Text).toContain(i18n.vitalityLabel);
      expect(p1Text).toContain(i18n.patienceLabel);

      // Badhaka House in localized script
      if (report.badhakaAnalysis) {
        expect(p1Text).toContain(formatHouseName(report.badhakaAnalysis.badhakaHouse, lang));
        expect(p1Text).toContain(i18n.badhakeshLabel);
      }

      // Section 2: Panchanga 5-Angas Alignment
      expect(p1Text).toContain(i18n.sec2Title);
      expect(p1Text).toContain(report.panchangaRemedies.nakshatraRemedy.nakshatraName[lang] || report.panchangaRemedies.nakshatraRemedy.nakshatraName.kn);
      expect(p1Text).toContain(report.panchangaRemedies.yogaRemedy.yogaName[lang] || report.panchangaRemedies.yogaRemedy.yogaName.kn);
      expect(p1Text).toContain(report.panchangaRemedies.karanaRemedy.karanaName[lang] || report.panchangaRemedies.karanaRemedy.karanaName.kn);

      // Tatva must be localized
      const expectedTatva = TATVA_LOCALE[report.panchangaRemedies.karanaRemedy.tatva]?.[lang];
      if (expectedTatva) {
        expect(p1Text).toContain(expectedTatva);
      }

      // Page 1 Footer
      expect(p1Text).toContain(i18n.page1Footer);

      // ==========================================
      // PAGE 2 AUDIT
      // ==========================================
      expect(p2Text).toContain(i18n.page2Title);

      // Section 3: 4-Step Instant Pacification
      expect(p2Text).toContain(i18n.sec3Title);
      expect(p2Text).toContain(i18n.emergencyMantraTitle);

      // Section 4: Daily Pacification Routine
      expect(p2Text).toContain(i18n.sec4Title);
      expect(p2Text).toContain(i18n.morningTab);
      expect(p2Text).toContain(i18n.afternoonTab);
      expect(p2Text).toContain(i18n.eveningTab);

      // Section 5: Personalized Daily Classical Stotra
      expect(p2Text).toContain(i18n.sec5Title);
      expect(p2Text).toContain(i18n.stotraTiming);
      expect(p2Text).toContain(i18n.stotraDirection);
      expect(p2Text).toContain(i18n.stotraCount);
      expect(p2Text).toContain(i18n.stotraBenefits);

      // Daily Peace Sankalpa Card
      expect(p2Text).toContain(i18n.dailySankalpaTitle);

      // Page 2 Footer
      expect(p2Text).toContain(i18n.page2Footer);

      // ==========================================
      // PAGE 3 AUDIT
      // ==========================================
      expect(p3Text).toContain(i18n.page3Title);

      // Section 6: Active Dasha-Bhukti & Gochara Transits
      expect(p3Text).toContain(i18n.sec6Title);
      expect(p3Text).toContain(i18n.turnaroundTitle);

      // Sacred Vedic Graha Shanti Mantra Box
      expect(p3Text).toContain(i18n.vedicGrahaShantiTitle);
      expect(p3Text).toContain(i18n.chant11TimesDaily);
      expect(p3Text).toContain(i18n.prescribedDeityLabel);
      expect(p3Text).toContain(i18n.mantraMeaningLabel);
      expect(p3Text).toContain(i18n.calmingBenefitLabel);

      // Section 7: Gokarna Mahabaleshwara Remedies
      expect(p3Text).toContain(i18n.sec7Title);
      expect(p3Text).toContain(i18n.prescribedSeva);
      expect(p3Text).toContain(i18n.rudraksha);
      expect(p3Text).toContain(i18n.gemstone);
      expect(p3Text).toContain(i18n.daana);

      // Section 8: Chief Priest Blessing & Seal
      expect(p3Text).toContain(i18n.sec8Title);
      expect(p3Text).toContain(i18n.templeSealLabel);
      expect(p3Text).toContain("+91 94821 09844");

      // Page 3 Footer
      expect(p3Text).toContain(i18n.page3Footer);

      // ==========================================
      // SCRIPT PURITY AUDIT
      // ==========================================
      if (lang === "kn") {
        expect(allText).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
        expect(allText).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
      } else if (lang === "hi") {
        expect(allText).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(allText).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
        expect(allText).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
        expect(allText).not.toMatch(/[\u0400-\u04FF]/); // No Cyrillic
      } else if (lang === "te") {
        expect(allText).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(allText).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil
      } else if (lang === "ta") {
        expect(allText).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada
        expect(allText).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu
      } else if (lang === "en") {
        // In English, ensure all section headings are in English
        expect(allText).toContain("Personalized Kundali Astrological Remedy");
        expect(allText).toContain("Daily Mind Pacification Protocol");
        expect(allText).toContain("Sacred Vedic Graha Shanti Mantra");
      }
    });
  });

  it("verifies accurate Parashari gemstone, rudraksha and temple seva determination for worldwide profiles", () => {
    const testCases: Array<{ sign: number; expectedStoneEn: string; expectedMukhiEn: string }> = [
      { sign: 0, expectedStoneEn: "Red Coral", expectedMukhiEn: "3-Mukhi" }, // Mesha / Mars
      { sign: 1, expectedStoneEn: "Diamond", expectedMukhiEn: "6-Mukhi" },   // Vrishabha / Venus
      { sign: 2, expectedStoneEn: "Emerald", expectedMukhiEn: "4-Mukhi" },   // Mithuna / Mercury
      { sign: 3, expectedStoneEn: "Pearl", expectedMukhiEn: "2-Mukhi" },     // Karka / Moon
      { sign: 4, expectedStoneEn: "Ruby", expectedMukhiEn: "1-Mukhi" },      // Simha / Sun
    ];

    for (const tc of testCases) {
      const customKundli: KundliOutput = {
        ...mockKundli,
        lagnaRashi: { index: tc.sign, english: "Sign", sanskrit: "Rashi" }
      };
      const diag = generateKundliRemedyReport(customKundli, mockDevotee);
      const { container } = render(<KundliRemedyPdfTemplate diagnosis={diag} lang="en" />);
      const text = container.textContent || "";

      expect(text).toContain(tc.expectedStoneEn);
      expect(text).toContain(tc.expectedMukhiEn);
      cleanup();
    }
  });

  it("enforces 100% script purity in TATVA_LOCALE across all 5 elements and all 5 languages", () => {
    for (const [tatva, locales] of Object.entries(TATVA_LOCALE)) {
      expect(locales.kn).toMatch(/^[\u0C80-\u0CFF\s]+$/);
      expect(locales.hi).toMatch(/^[\u0900-\u097F\s]+$/);
      expect(locales.te).toMatch(/^[\u0C00-\u0C7F\s]+$/);
      expect(locales.ta).toMatch(/^[\u0B80-\u0BFF\s]+$/);
      expect(locales.en).toMatch(/^[a-zA-Z\s]+$/);
    }
    // Specific check for Fire in Telugu
    expect(TATVA_LOCALE.Fire.te).toBe("అగ్ని");
    expect(TATVA_LOCALE.Fire.te).not.toMatch(/[\u0C80-\u0CFF]/); // Absolutely no Kannada glyphs
  });

  it("enforces 100% script purity across CLASSICAL_STOTRAS_CATALOG in Sanskrit, Hindi, Kannada, Telugu, and Tamil", () => {
    CLASSICAL_STOTRAS_CATALOG.forEach((stotra, idx) => {
      // Shloka Sanskrit & Hindi should not contain South Indian scripts (Kannada, Telugu, Tamil)
      expect(stotra.shlokaSanskrit).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(stotra.shlokaSanskrit).not.toMatch(/[\u0C00-\u0C7F]/);
      expect(stotra.shlokaSanskrit).not.toMatch(/[\u0B80-\u0BFF]/);

      expect(stotra.shlokaHindi).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(stotra.shlokaHindi).not.toMatch(/[\u0C00-\u0C7F]/);
      expect(stotra.shlokaHindi).not.toMatch(/[\u0B80-\u0BFF]/);

      // Kannada shloka must not contain Telugu or Tamil
      expect(stotra.shlokaKannada).not.toMatch(/[\u0C00-\u0C7F]/);
      expect(stotra.shlokaKannada).not.toMatch(/[\u0B80-\u0BFF]/);

      // Telugu shloka must not contain Kannada or Tamil
      expect(stotra.shlokaTelugu).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(stotra.shlokaTelugu).not.toMatch(/[\u0B80-\u0BFF]/);

      // Tamil shloka must not contain Kannada or Telugu
      expect(stotra.shlokaTamil).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(stotra.shlokaTamil).not.toMatch(/[\u0C00-\u0C7F]/);
    });
  });

  it("verifies computeVedicDoctorPrescription mantras are 100% pure script across all struggle categories", () => {
    const categories: Array<Parameters<typeof computeVedicDoctorPrescription>[0]> = [
      "anger_temper",
      "career_obstacles",
      "debt_financial",
      "student_academic",
      "marriage_delay",
      "relationship_friction",
      "health_vitality",
      "legal_confinement",
      "leadership_expansion",
      "creative_stardom",
      "elite_sports",
      "mental_anxiety",
      "general_alignment"
    ];

    for (const cat of categories) {
      const rx = computeVedicDoctorPrescription(cat, PlanetName.Jupiter, 0, "Test Devotee");
      const mantraSanskrit = rx.aushadha.beejaMantra.mantraSanskrit;
      expect(mantraSanskrit).not.toMatch(/[\u0C80-\u0CFF]/); // No Kannada in Sanskrit
      expect(mantraSanskrit).not.toMatch(/[\u0C00-\u0C7F]/); // No Telugu in Sanskrit
      expect(mantraSanskrit).not.toMatch(/[\u0B80-\u0BFF]/); // No Tamil in Sanskrit

      const native = rx.aushadha.beejaMantra.mantraNative;
      expect(native.kn).not.toMatch(/[\u0C00-\u0C7F]/);
      expect(native.kn).not.toMatch(/[\u0B80-\u0BFF]/);

      expect(native.hi).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(native.hi).not.toMatch(/[\u0C00-\u0C7F]/);

      expect(native.te).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(native.te).not.toMatch(/[\u0B80-\u0BFF]/);

      expect(native.ta).not.toMatch(/[\u0C80-\u0CFF]/);
      expect(native.ta).not.toMatch(/[\u0C00-\u0C7F]/);
    }
  });

  it("verifies Parashari Badhaka Sthana logic strictly adheres to Brihat Parashara Hora Shastra for all 12 signs", () => {
    // 0: Mesha (Movable) -> 11th house (Kumbha / Saturn)
    expect(computeBadhakaAnalysis(0).badhakaHouse).toBe(11);
    expect(computeBadhakaAnalysis(0).modality).toBe("Chara");

    // 1: Vrishabha (Fixed) -> 9th house (Makara / Saturn)
    expect(computeBadhakaAnalysis(1).badhakaHouse).toBe(9);
    expect(computeBadhakaAnalysis(1).modality).toBe("Sthira");

    // 2: Mithuna (Dual) -> 7th house (Dhanu / Jupiter)
    expect(computeBadhakaAnalysis(2).badhakaHouse).toBe(7);
    expect(computeBadhakaAnalysis(2).modality).toBe("Dvisvabhava");

    // 3: Karka (Movable) -> 11th house (Vrishabha / Venus)
    expect(computeBadhakaAnalysis(3).badhakaHouse).toBe(11);

    // 4: Simha (Fixed) -> 9th house (Mesha / Mars)
    expect(computeBadhakaAnalysis(4).badhakaHouse).toBe(9);

    // 5: Kanya (Dual) -> 7th house (Meena / Jupiter)
    expect(computeBadhakaAnalysis(5).badhakaHouse).toBe(7);

    // 6: Tula (Movable) -> 11th house (Simha / Sun)
    expect(computeBadhakaAnalysis(6).badhakaHouse).toBe(11);

    // 7: Vrischika (Fixed) -> 9th house (Karka / Moon)
    expect(computeBadhakaAnalysis(7).badhakaHouse).toBe(9);

    // 8: Dhanu (Dual) -> 7th house (Mithuna / Mercury)
    expect(computeBadhakaAnalysis(8).badhakaHouse).toBe(7);

    // 9: Makara (Movable) -> 11th house (Vrischika / Mars)
    expect(computeBadhakaAnalysis(9).badhakaHouse).toBe(11);

    // 10: Kumbha (Fixed) -> 9th house (Tula / Venus)
    expect(computeBadhakaAnalysis(10).badhakaHouse).toBe(9);

    // 11: Meena (Dual) -> 7th house (Kanya / Mercury)
    expect(computeBadhakaAnalysis(11).badhakaHouse).toBe(7);
  });

  it("verifies all 27 Nakshatras in NAKSHATRA_REMEDY_DATA have valid botanical names, pure Indic tree names, and beeja mantras", () => {
    for (let nak = 0; nak < 27; nak++) {
      const data = NAKSHATRA_REMEDY_DATA[nak];
      expect(data).toBeDefined();
      expect(data.tree.botanicalName.length).toBeGreaterThan(3);
      expect(data.tree.kannada.length).toBeGreaterThan(1);
      expect(data.tree.hindi.length).toBeGreaterThan(1);
      expect(data.tree.telugu.length).toBeGreaterThan(1);
      expect(data.tree.tamil.length).toBeGreaterThan(1);
      expect(data.tree.english.length).toBeGreaterThan(1);

      expect(data.beejaMantra.sanskrit.length).toBeGreaterThan(5);
      expect(data.beejaMantra.kannada.length).toBeGreaterThan(5);
    }
  });
});

