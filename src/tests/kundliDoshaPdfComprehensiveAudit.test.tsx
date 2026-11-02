import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ReactDOMServer from "react-dom/server";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("Kundli Dosha PDF Comprehensive Audit & Guard Verification", () => {
  const sampleNative: KundliInput = {
    name: "Gokarna Devotee",
    birthDate: "1992-08-25",
    birthTime: "10:15",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male",
    pincode: "581326"
  };

  const kundli = calculateKundli(sampleNative, { ayanamsaModel: "lahiri" });
  const report = calculateComprehensiveDoshas(kundli, sampleNative, new Date("2026-11-01"));

  it("1. Strictly enforces 2 A4 pages with 900px width and 1273px height", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-dosha-a4-check"
        report={report}
        lang="kn"
      />
    );

    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(2);

    pages.forEach((page) => {
      const el = page as HTMLElement;
      expect(el.style.width).toBe("900px");
      expect(el.style.height).toBe("1273px");
      expect(el.style.minHeight).toBe("1273px");
      expect(el.style.maxHeight).toBe("1273px");
      expect(el.style.overflow).toBe("hidden");
      expect(el.style.pageBreakAfter).toBe("always");
    });
  });

  it("2. Verifies pure Indic localization with ZERO English subtitles in parentheses", () => {
    const indicLangs: ("kn" | "hi" | "te" | "ta")[] = ["kn", "hi", "te", "ta"];

    indicLangs.forEach((lang) => {
      const { container } = render(
        <KundliDoshaPdfTemplate
          id={`test-dosha-pure-${lang}`}
          report={report}
          lang={lang}
        />
      );

      const text = container.textContent || "";

      // Ensure no leftover English subtitles in parentheses
      expect(text).not.toContain("(Immediate Priority Action)");
      expect(text).not.toContain("(No Critical Afflictions)");
      expect(text).not.toContain("(Secondary Afflictions)");
      expect(text).not.toContain("(Harmonious Alignment)");
      expect(text).not.toContain("(Natal Balance Overview)");
      expect(text).not.toContain("(Life Hazards & Safe Age Limits)");
      expect(text).not.toContain("(Innate Fears & Phobias)");
      expect(text).not.toContain("(Critical)");
      expect(text).not.toContain("(High)");
    });
  });

  it("3. Verifies Tamil uses pure Baggona spelling 'பக்கோண' consistently", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-dosha-ta-spelling"
        report={report}
        lang="ta"
      />
    );

    const text = container.textContent || "";
    expect(text).toContain("பக்கோண பஞ்சாங்க");
    expect(text).not.toContain("பக்ககோண");
  });

  it("4. Verifies fear.severity is properly localized across all 5 languages", () => {
    // Create mock report with a detected fear of high severity
    const mockReportWithFears = {
      ...report,
      gandantaraAndBhaya: {
        ...report.gandantaraAndBhaya,
        activeGandantaras: [],
        detectedFears: [
          {
            id: "fear_jala",
            type: "jala_bhaya" as const,
            name: {
              kn: "ಜಲ ಭಯ",
              hi: "जल भय",
              te: "జల భయం",
              ta: "நீர் பயம்",
              en: "Water Phobia"
            },
            icon: "🌊",
            isDetected: true,
            severity: "high" as const,
            planetaryTrigger: { kn: "ಚಂದ್ರ", hi: "चंद्र", te: "చంద్ర", ta: "சந்திரன்", en: "Moon" },
            psychologicalSymptom: { kn: "ಆತಂಕ", hi: "चिंता", te: "ఆందోళన", ta: "பயம்", en: "Anxiety" },
            realLifeManifestation: { kn: "ಹಿಂಜರಿಕೆ", hi: "झिझक", te: "భయం", ta: "தயக்கம்", en: "Hesitation" },
            strengtheningPractice: { kn: "ಧ್ಯಾನ", hi: "ध्यान", te: "ధ్యానం", ta: "தியானம்", en: "Meditation" }
          }
        ]
      }
    };

    const checks = [
      { lang: "kn", expectedSeverity: "ತೀವ್ರ ಭಯ" },
      { lang: "hi", expectedSeverity: "तीव्र भय" },
      { lang: "te", expectedSeverity: "తీవ్ర భయం" },
      { lang: "ta", expectedSeverity: "தீவிர பயம்" },
      { lang: "en", expectedSeverity: "High" }
    ];

    checks.forEach(({ lang, expectedSeverity }) => {
      const { container } = render(
        <KundliDoshaPdfTemplate
          id={`test-fear-sev-${lang}`}
          report={mockReportWithFears as any}
          lang={lang}
        />
      );
      expect(container.textContent).toContain(expectedSeverity);
    });
  });

  it("5. Supports overridePriestName and overridePriestPhone seamlessly", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-dosha-override-priest"
        report={report}
        lang="kn"
        overridePriestName="ವೇ|| ಮೂ|| ಶ್ರೀ ದತ್ತಾತ್ರೇಯ ಭಟ್"
        overridePriestPhone="+91 98860 12345"
      />
    );

    const text = container.textContent || "";
    expect(text).toContain("ವೇ|| ಮೂ|| ಶ್ರೀ ದತ್ತಾತ್ರೇಯ ಭಟ್");
    expect(text).toContain("+91 98860 12345");
  });

  it("6. Verifies zero Kannada script leakage in Hindi, Telugu, Tamil, and English", () => {
    const kannadaCharRegex = /[\u0C80-\u0CFF]/g;

    ["hi", "te", "ta", "en"].forEach((targetLang) => {
      const renderedHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(KundliDoshaPdfTemplate, {
          report,
          lang: targetLang,
          qrCodeDataUrl: "data:image/png;base64,mock"
        })
      );
      const matches = renderedHtml.match(kannadaCharRegex);
      if (matches) {
        console.error(`Kannada characters leaked in ${targetLang}:`, [...new Set(matches)].join(" "));
      }
      expect(matches).toBeNull();
    });
  });
});
