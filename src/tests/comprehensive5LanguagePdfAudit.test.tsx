import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import type { SupportedLanguage } from "../features/remedies/kundliRemedyEngine";
import type { KundliInput } from "../core/AstroTypes";

const devoteeInput: KundliInput = {
  name: "Ramesh Sharma",
  gothra: "Kashyapa",
  birthDate: "1988-10-24",
  birthTime: "06:30",
  latitude: 14.5479,
  longitude: 74.3188,
  gender: "Male"
};

const calculatedKundli = calculateKundli(devoteeInput, { ayanamsaModel: "lahiri" });

describe("Comprehensive 5-Language Purity Audit (Kundli Dosha & Remedy PDFs)", () => {
  const languages: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

  const EXPECTED_PRIEST_NAMES: Record<SupportedLanguage, string> = {
    kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
    en: "Veda Moorthy Chaitanya Pandit",
    hi: "वेदमूर्ति चैतन्य पंडित",
    te: "వేదమూర్తి చైతన్య పండిట్",
    ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்"
  };

  const EXPECTED_DEVOTEE_NAMES: Record<SupportedLanguage, string> = {
    kn: "ರಮೇಶ್ ಶರ್ಮಾ",
    en: "Ramesh Sharma",
    hi: "रमेश शर्मा",
    te: "రమేష్ శర్మ",
    ta: "ரமேஷ் சர்மா"
  };

  const EXPECTED_GOTRAS: Record<SupportedLanguage, string> = {
    kn: "ಕಾಶ್ಯಪ",
    en: "Kashyapa",
    hi: "काश्यप",
    te: "కాశ్యప",
    ta: "காஸ்யப"
  };

  describe("1. KundliDoshaPdfTemplate 5-Language Audit", () => {
    const doshaReport = calculateComprehensiveDoshas(calculatedKundli, devoteeInput, new Date("2026-11-01"));

    languages.forEach((lang) => {
      it(`[${lang.toUpperCase()}] Renders pure localized dossier with correct devotee name, priest name and phone`, () => {
        const { container } = render(
          <KundliDoshaPdfTemplate
            report={doshaReport}
            lang={lang}
          />
        );

        const text = container.textContent || "";

        // Verify Devotee Name is in the appropriate language script
        expect(text).toContain(EXPECTED_DEVOTEE_NAMES[lang]);

        // Verify Chief Priest Name is strictly Veda Moorthy Chaitanya Pandit in the target language
        expect(text).toContain(EXPECTED_PRIEST_NAMES[lang]);

        // Verify Chief Priest Phone is 94821 09844
        expect(text).toContain("94821 09844");

        // Verify no old priest phone number
        expect(text).not.toContain("99723 39362");

        // In Indic modes, technical labels must NOT leak English "Houses:", "Grahas:", "Mitigation:"
        if (lang === "kn") {
          expect(text).not.toContain("Houses:");
          expect(text).not.toContain("Grahas:");
          expect(text).not.toContain("Mitigation:");
          expect(text).toContain("ಭಾವಗಳು:");
          expect(text).toContain("ಗ್ರಹಗಳು:");
        } else if (lang === "hi") {
          expect(text).not.toContain("Houses:");
          expect(text).not.toContain("Grahas:");
          expect(text).not.toContain("Mitigation:");
          expect(text).toContain("भाव:");
          expect(text).toContain("ग्रह:");
        } else if (lang === "te") {
          expect(text).not.toContain("Houses:");
          expect(text).not.toContain("Grahas:");
          expect(text).not.toContain("Mitigation:");
          expect(text).toContain("భావాలు:");
          expect(text).toContain("గ్రహాలు:");
        } else if (lang === "ta") {
          expect(text).not.toContain("Houses:");
          expect(text).not.toContain("Grahas:");
          expect(text).not.toContain("Mitigation:");
          expect(text).toContain("பாவங்கள்:");
          expect(text).toContain("கிரகங்கள்:");
        }
      });
    });
  });

  describe("2. KundliRemedyPdfTemplate 5-Language Audit", () => {
    const remedyDiagnosis = generateKundliRemedyReport(calculatedKundli, devoteeInput);

    languages.forEach((lang) => {
      it(`[${lang.toUpperCase()}] Renders pure 3-page Daivika Parihara report with zero language leakage`, () => {
        const { container } = render(
          <KundliRemedyPdfTemplate
            diagnosis={remedyDiagnosis}
            lang={lang}
          />
        );

        const pages = container.querySelectorAll(".pdf-page");
        expect(pages.length).toBe(3);

        const page1Text = pages[0].textContent || "";
        const page2Text = pages[1].textContent || "";
        const page3Text = pages[2].textContent || "";
        const fullText = container.textContent || "";

        // Verify Devotee Name and Gotra on Page 1
        expect(page1Text).toContain(EXPECTED_DEVOTEE_NAMES[lang]);
        expect(page1Text).toContain(EXPECTED_GOTRAS[lang]);

        // Verify Chief Priest Name on Page 3
        expect(page3Text).toContain(EXPECTED_PRIEST_NAMES[lang]);

        // Verify Chief Priest Phone on Page 3 is 94821 09844
        expect(page3Text).toContain("94821 09844");
        expect(page3Text).not.toContain("99723 39362");

        // Verify English mode has English shlokas/mantras without Devanagari script letters
        if (lang === "en") {
          // Devanagari letters range
          const devanagariLetters = /[\u0904-\u0939\u0958-\u0963]/;
          expect(devanagariLetters.test(fullText)).toBe(false);

          // Kannada letters range
          const kannadaLetters = /[\u0C80-\u0CFF]/;
          expect(kannadaLetters.test(fullText)).toBe(false);
        }

        // In Non-Kannada modes (en, hi, te, ta), verify no Kannada narrative leak
        if (lang !== "kn") {
          const kannadaLetters = /[\u0C80-\u0CFF]/;
          expect(page1Text).not.toContain("ಅಧಿಕೃತ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ");
          expect(page1Text).not.toContain("ಪರಾಶರೀ ಸಿದ್ಧಾಂತದಂತೆ ಸೂಕ್ಷ್ಮವಾಗಿ");
        }
      });
    });
  });
});
