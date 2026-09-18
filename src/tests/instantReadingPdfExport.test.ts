import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  PDF_LANGUAGES,
  PDF_DICT,
  getRashiName,
  getNakshatraName,
  getVaraName,
  getPlanetName,
  generateLocalizedExecutiveNarration,
  type SupportedPdfLang,
  type DevoteeIdentity
} from "../components/instantReading/instantReadingPdfLocale";
import InstantReadingPdfTemplate from "../components/instantReading/InstantReadingPdfTemplate";

// Mock synthetic data for testing
const mockSynthesisData: any = {
  panchanga: {
    vara: { nameKn: "ಭಾನುವಾರ (ರವಿವಾರ)", tatva: "ಅಗ್ನಿ ತತ್ತ್ವ", rulerKn: "ರವಿ", rulerEn: "Sun" },
    tithi: { nameKn: "ಶುಕ್ಲ ಪಕ್ಷ ಪಂಚಮೀ", deityKn: "ಸರ್ಪ ದೇವತೆ", paksha: "ಶುಕ್ಲ", lordKn: "ಗುರು", lordEn: "Jupiter" },
    nakshatra: { nameKn: "ರೋಹಿಣಿ", deityKn: "ಬ್ರಹ್ಮ", ganaKn: "ದೇವ ಗಣ", yoniKn: "ಸರ್ಪ ಯೋನಿ", nadiKn: "ಅಂತ್ಯ ನಾಡಿ" },
    yoga: { nameKn: "ಶುಭ", rule: { isAuspicious: true } },
    karana: { nameKn: "ಬವ", rule: { type: "Chara" } }
  },
  currentDiagnosis: {
    primaryLifeChallenge: {
      area: "Career / Workplace",
      description: "ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಜವಾಬ್ದಾರಿಗಳ ಹೆಚ್ಚಳ",
      planetaryRootCause: "ಶನಿ ಸಾಡೇಸಾತಿ ಪ್ರಭಾವ",
      areaKn: "ವೃತ್ತಿ ರಂಗ",
      descriptionEn: "Career transition",
      planetaryRootCauseEn: "Saturn transit"
    },
    currentLifeSituation: {
      severity: "high",
      headlineKn: "ವೃತ್ತಿಪರ ಜವಾಬ್ದಾರಿಗಳ ಹೆಚ್ಚಳ & ಮಾನಸಿಕ ಪರಿವರ್ತನೆ",
      headlineEn: "Career Elevation & Mental Transition",
      externalLifeRealityKn: "ಉದ್ಯೋಗದಲ್ಲಿ ಹೊಸ ಯೋಜನೆಗಳ ಒತ್ತಡ ಹಾಗೂ ಕುಟುಂಬ ಜವಾಬ್ದಾರಿ",
      externalLifeRealityEn: "Workplace pressures and family obligations",
      internalMindsetKn: "ಭವಿಷ್ಯದ ಭದ್ರತೆಯ ಕುರಿತು ಆಂತರಿಕ ಚಿಂತನೆಗಳು",
      internalMindsetEn: "Subtle anxieties regarding future trajectory",
      planetaryCulpritKn: "ಶನಿ ಹಾಗೂ ರಾಹು ಗೋಚಾರ",
      planetaryCulpritEn: "Saturn and Rahu transits",
      reliefTimelineKn: "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ",
      reliefTimelineEn: "within the upcoming 3 to 6 months",
      symptomsChecklistKn: ["ನಿದ್ರಾಹೀನತೆ", "ಮಾನಸಿಕ ಆತಂಕ"],
      symptomsChecklistEn: ["Sleep irregularities", "Restlessness"]
    },
    accurateProfession: {
      titleKn: "ಆಡಳಿತಾತ್ಮಕ ನಾಯಕತ್ವ & ವಾಣಿಜ್ಯ ನಿರ್ವಹಣೆ",
      titleEn: "Administrative Leadership & Commercial Strategy",
      topSuitableFields: [
        { fieldNameKn: "ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ", fieldNameEn: "Information Technology", suitabilityPercentage: 92 },
        { fieldNameKn: "ಆರ್ಥಿಕ ನಿರ್ವಹಣೆ", fieldNameEn: "Financial Management", suitabilityPercentage: 88 }
      ],
      specialCareerYogasKn: ["ಧರ್ಮ ಕರ್ಮಾಧಿಪತಿ ಯೋಗ", "ಬುಧಾದಿತ್ಯ ಯೋಗ"],
      specialCareerYogasEn: ["Dharma Karmadhipati Yoga"],
      leadershipPotentialKn: "ಉನ್ನತ ತಂಡ ನಿರ್ವಹಣಾ ಕೌಶಲ್ಯ",
      leadershipPotentialEn: "Strong strategic governance"
    },
    marriageDestiny: {
      natureOfSpouseKn: "ಶಾಂತ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಪ್ರೇಮಿ",
      natureOfSpouseEn: "Caring, tranquil, and dignified",
      maritalHarmonyKn: "ಉತ್ತಮ ಸಾಮರಸ್ಯ ಹಾಗೂ ಸಹಕಾರ",
      maritalHarmonyEn: "High mutual respect and domestic harmony"
    },
    prasthuthaSthiti: {
      runningDashaSummary: "ಗುರು ಮಹಾದಶಾ | ಬುಧ ಭುಕ್ತಿ (2024 - 2027)",
      runningGocharaSummary: "ಶನಿ ಸಾಡೇಸಾತಿ ಮಧ್ಯಮ ಹಂತ",
      activeTithiSthiti: "ಶುಕ್ಲ ಪಂಚಮೀ ಶುಭ ಮುಹೂರ್ತ",
      immediateRemedies: ["ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ"]
    }
  },
  prescriptions: {
    rudraksha: { nameKn: "೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ", nameEn: "5 Mukhi Rudraksha", wearingDay: "ಸೋಮವಾರ" },
    gemstoneRing: {
      primaryGemstoneKn: "ಹಳದಿ ಪುಷ್ಯರಾಗ",
      primaryGemstoneEn: "Yellow Sapphire",
      caratWeight: "4.5 Carat",
      fingerKn: "ತೋರು ಬೆರಳು (Index Finger)"
    },
    dailyPractice: {
      morningActionKn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯಕ್ಕೆ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ",
      eveningActionKn: "ಸಂಜೆ ತುಳಸಿ ಕಟ್ಟೆ ಎದುರು ದೀಪ ಪ್ರಜ್ವಲನೆ"
    },
    shantiPooja: {
      nameKn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ",
      nameEn: "Sri Mahabaleshwara Maharudrabhisheka",
      purpose: "ಸರ್ವ ದೋಷ ನಿವಾರಣೆ"
    }
  },
  multiParagraphExecutiveReading: [
    "ನಮಸ್ಕಾರ ಭಕ್ತರೇ, ನಾನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ನೋಡಿದೆ.",
    "ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನ ಅತ್ಯಂತ ಬಲಿಷ್ಠವಾಗಿದೆ.",
    "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ ಶುಭ ತಿರುವು ಸಿಗಲಿದೆ.",
    "ಪವಿತ್ರ ಪರಿಹಾರಗಳನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಆಚರಿಸಿ."
  ]
};

const mockDevotee: DevoteeIdentity = {
  name: "Ganesha Bhat",
  age: 34,
  gender: "Male",
  birthDate: "1992-05-15",
  birthTime: "06:30",
  birthPlace: "Gokarna, Karnataka",
  lagnaName: "Taurus",
  rashiName: "Virgo",
  nakshatraName: "Hasta",
  pada: 2
};

const mockSession: any = {
  input: {
    name: "Ganesha Bhat",
    gender: "Male",
    location: "Gokarna, Karnataka",
    birthDate: "1992-05-15",
    birthTime: "06:30"
  },
  result: {
    lagnaRashi: { english: "Taurus", sanskrit: "Vrishabha" },
    moonSign: { english: "Virgo", sanskrit: "Kanya" },
    moonPada: 2,
    planets: [
      { name: "Moon", nakshatra: { english: "Hasta" } }
    ]
  }
};

describe("Instant Reading A4 PDF Export & 6-Language Localization Suite", () => {
  it("verifies all 6 required languages are defined in PDF_LANGUAGES", () => {
    const supportedCodes = PDF_LANGUAGES.map((l) => l.code);
    expect(supportedCodes).toEqual(["kn", "en", "hi", "te", "ta", "ml"]);
  });

  it("verifies PDF_DICT contains complete translations for all 6 languages across key sections", () => {
    const requiredKeys = [
      "brandBanner",
      "brandSubtitle",
      "sealBadge",
      "page1Title",
      "secPanchangaTitle",
      "secNarrationTitle",
      "page1Footer",
      "secLifeRealityTitle",
      "secCareerTitle",
      "secMarriageTitle",
      "secRemediesTitle",
      "priestBlessingTitle",
      "priestName",
      "shantiMantra",
      "page2Footer"
    ];

    for (const key of requiredKeys) {
      const entry = PDF_DICT[key];
      expect(entry, `Missing key: ${key}`).toBeDefined();
      for (const lang of ["kn", "en", "hi", "te", "ta", "ml"] as SupportedPdfLang[]) {
        expect(entry[lang], `Missing lang "${lang}" in key "${key}"`).toBeDefined();
        expect(entry[lang].trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("verifies Rashi lookup returns authentic names across all 6 languages", () => {
    // Mesha / Aries
    expect(getRashiName("Aries", "kn")).toBe("ಮೇಷ");
    expect(getRashiName("Aries", "en")).toContain("Aries");
    expect(getRashiName("Aries", "hi")).toBe("मेष");
    expect(getRashiName("Aries", "te")).toBe("మేషం");
    expect(getRashiName("Aries", "ta")).toBe("மேஷம்");
    expect(getRashiName("Aries", "ml")).toBe("മേടം");

    // Vrishabha / Taurus
    expect(getRashiName("Taurus", "kn")).toBe("ವೃಷಭ");
    expect(getRashiName("Taurus", "ml")).toBe("ഇടവം");
  });

  it("verifies Nakshatra lookup returns authentic names across all 6 languages", () => {
    expect(getNakshatraName("Hasta", "kn")).toBe("ಹಸ್ತಾ");
    expect(getNakshatraName("Hasta", "en")).toBe("Hasta");
    expect(getNakshatraName("Hasta", "hi")).toBe("हस्त");
    expect(getNakshatraName("Hasta", "te")).toBe("హస్త");
    expect(getNakshatraName("Hasta", "ta")).toBe("அஸ்தம்");
    expect(getNakshatraName("Hasta", "ml")).toBe("അത്തം");
  });

  it("verifies Vara and Planet lookups return authentic names", () => {
    expect(getVaraName("Sunday", "kn")).toBe("ರವಿವಾರ");
    expect(getVaraName("Sunday", "ml")).toContain("ഞായർ");
    expect(getPlanetName("Sun", "kn")).toBe("ರವಿ");
    expect(getPlanetName("Jupiter", "te")).toBe("గురువు");
    expect(getPlanetName("Venus", "ta")).toBe("சுக்கிரன்");
    expect(getPlanetName("Mars", "ml")).toContain("ചൊവ്വ");
  });

  it("generates exactly 4 comprehensive paragraphs with zero raw markdown asterisks across all 6 languages", () => {
    const languages: SupportedPdfLang[] = ["kn", "en", "hi", "te", "ta", "ml"];

    for (const lang of languages) {
      const paragraphs = generateLocalizedExecutiveNarration(mockSynthesisData, mockDevotee, lang);
      expect(paragraphs.length, `Language ${lang} should produce exactly 4 paragraphs`).toBe(4);

      for (const para of paragraphs) {
        expect(para.length, `Paragraph in ${lang} should be non-empty`).toBeGreaterThan(40);
        // CRITICAL RULE: Zero markdown bold asterisks (**) or hashtag headings (#)
        expect(para.includes("**"), `Paragraph in ${lang} contains markdown asterisks: "${para}"`).toBe(false);
        expect(para.includes("##"), `Paragraph in ${lang} contains markdown hashes`).toBe(false);
      }

      // Verify devotee name is included in greeting (Paragraph 1)
      expect(paragraphs[0]).toContain(mockDevotee.name);
    }
  });

  it("renders InstantReadingPdfTemplate with both A4 pages and Baggona branding on each page", () => {
    const { container } = render(
      React.createElement(InstantReadingPdfTemplate, {
        synthesisData: mockSynthesisData,
        session: mockSession,
        lang: "kn"
      })
    );

    // Verify 2 A4 PDF pages are generated
    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(2);

    // Verify Baggona Panchanga branding banner exists on both Page 1 and Page 2
    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i].textContent || "";
      expect(pageText).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
      expect(pageText).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ");
    }

    // Verify Devotee Name and 5-Angas are rendered
    expect(container.textContent).toContain("Ganesha Bhat");
    expect(container.textContent).toContain("ರವಿವಾರ");
    expect(container.textContent).toContain("ಹಸ್ತಾ");
  });

  it("renders InstantReadingPdfTemplate in Malayalam without error", () => {
    const { container } = render(
      React.createElement(InstantReadingPdfTemplate, {
        synthesisData: mockSynthesisData,
        session: mockSession,
        lang: "ml"
      })
    );

    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(2);
    // Should have Malayalam banner
    expect(container.textContent).toContain("ബഗ്ഗോണ പഞ്ചാംഗം");
    expect(container.textContent).toContain("ശ്രീ ഗോകർണ മഹാബലേഷ്വര");
  });

  it("verifies 100% parameter accuracy for devotee inputs, coordinates, Kundali lords, and Dasha-Gochara", () => {
    const sessionWithCoords = {
      ...mockSession,
      input: {
        ...mockSession.input,
        latitude: 14.542,
        longitude: 74.318
      },
      result: {
        ...mockSession.result,
        ascendant: 45.42 // Taurus ~15.42°
      }
    };

    const synthesisWithDashaGochara = {
      ...mockSynthesisData,
      currentDiagnosis: {
        ...mockSynthesisData.currentDiagnosis,
        dashaTiming: {
          remainingMonths: 24,
          currentBhuktiEndAge: 36,
          currentMaha: "Jupiter",
          currentBhukti: "Mercury",
          nextBhukti: "Ketu",
          timelineKn: "2024 - 2027",
          timelineEn: "2024 - 2027"
        },
        liveGochara: {
          guruHouseFromMoon: 11,
          shaniHouseFromMoon: 1,
          isSadeSati: true,
          isGuruAnukula: true,
          guruStatusKn: "ಗೋಚಾರ ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ 11ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ",
          shaniStatusKn: "ಶನಿಯು ಜನ್ಮ ರಾಶಿಯಿಂದ 1ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಸಾಡೇ ಸಾತಿ ಪ್ರಭಾವವಿದೆ"
        }
      }
    };

    const { container } = render(
      React.createElement(InstantReadingPdfTemplate, {
        synthesisData: synthesisWithDashaGochara,
        session: sessionWithCoords,
        lang: "kn"
      })
    );

    const text = container.textContent || "";

    // 1. Devotee Inputs
    expect(text).toContain("Ganesha Bhat");
    expect(text).toContain("1992-05-15");
    expect(text).toContain("06:30");
    expect(text).toContain("Gokarna, Karnataka");
    expect(text).toContain("14.54° N, 74.32° E"); // Coordinates
    expect(text).toContain("ಪುರುಷ"); // Gender

    // 2. Janana Kundali Lords & Degree
    expect(text).toContain("ವೃಷಭ"); // Lagna
    expect(text).toContain("ಶುಕ್ರ"); // Lagna Lord (Venus)
    expect(text).toContain("15° 25'"); // Ascendant degree formatted
    expect(text).toContain("ಕನ್ಯಾ"); // Moon Rashi
    expect(text).toContain("ಬುಧ"); // Rashi Lord (Mercury)
    expect(text).toContain("ಹಸ್ತಾ"); // Nakshatra
    expect(text).toContain("ಚಂದ್ರ"); // Nakshatra Lord (Moon)
    expect(text).toContain("ಪಾದ 2"); // Pada

    // 3. Panchanga 5-Angas
    expect(text).toContain("ರವಿವಾರ");
    expect(text).toContain("ಶುಕ್ಲ ಪಕ್ಷ ಪಂಚಮೀ");
    expect(text).toContain("ಶುಭ ಯೋಗ");
    expect(text).toContain("ಚರ ಕರಣ");

    // 4. Running Dasha-Bhukti & Gochara
    expect(text).toContain("ಗುರು"); // Jupiter Mahadasha
    expect(text).toContain("ಬುಧ"); // Mercury Bhukti
    expect(text).toContain("2024 - 2027");
    expect(text).toContain("24 ತಿಂಗಳು ಬಾಕಿ");
    expect(text).toContain("ಕೇತು"); // Next Bhukti
    expect(text).toContain("ಸಾಡೇ ಸಾತಿ"); // Sade Sati live Gochara
  });

  it("guarantees 100% script purity in English without default screen Kannada text leakage", () => {
    const sessionWithCoords = {
      ...mockSession,
      input: {
        ...mockSession.input,
        latitude: 14.542,
        longitude: 74.318
      }
    };

    // User switches to English PDF, but aiNarration might have had Kannada text from the screen
    const kannadaScreenNarration = [
      "ನಮಸ್ಕಾರ ಗಣೇಶ ಭಟ್, ನಿಮ್ಮ ಜಾತಕವನ್ನು ನೋಡಿದೆ.",
      "ನಿಮ್ಮ ಕರ್ಮ ಸ್ಥಾನ ಉತ್ತಮವಾಗಿದೆ.",
      "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೇವರಲ್ಲಿ ಪ್ರಾರ್ಥಿಸಿ."
    ];

    const { container } = render(
      React.createElement(InstantReadingPdfTemplate, {
        synthesisData: mockSynthesisData,
        session: sessionWithCoords,
        aiNarration: kannadaScreenNarration, // Passing Kannada screen narration intentionally
        lang: "en"
      })
    );

    const text = container.textContent || "";

    // Header & Titles must be English
    expect(text).toContain("॥ BAGGONA PANCHANGA ॥");
    expect(text).toContain("Official Seal · 100% Astronomical Fidelity");
    expect(text).toContain("Devotee Profile & Janana Kundali Sacred Sankalpa");
    expect(text).toContain("Active Dasha-Bhukti & Live Planetary Transits (Gochara)");

    // Executive reading must automatically switch to pure English narration, NOT render the Kannada string!
    expect(text).toContain("Namaskaram Ganesha Bhat");
    expect(text).not.toContain("ನಮಸ್ಕಾರ ಗಣೇಶ ಭಟ್");
  });
});

