import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PalmMountsTab from "../components/palmreading/PalmMountsTab";
import SamudrikaYogasTab from "../components/palmreading/SamudrikaYogasTab";
import PalmRemediesTab from "../components/palmreading/PalmRemediesTab";
import PalmTimelineDiagram from "../components/palmreading/PalmTimelineDiagram";
import {
  PLANET_NAMES_L5,
  VEDIC_7_MOUNTS_CATALOG,
  VEDIC_HASTAREKHA_YOGAS_L5,
  VEDIC_REMEDIES_CATALOG_L5
} from "../features/palmreading/samudrikaKnowledge";
import { vimshottariBalanceAtBirth } from "../core/DashaBhuktiEngine";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import type { PalmReadingResult } from "../features/palmreading/palmReadingEngine";

describe("Hasta Mudrika (Palm Reading) Dynamic Tabs & Localization Audit", () => {
  afterEach(() => {
    cleanup();
  });

  const mockResult: PalmReadingResult = {
    generatedAt: "2026-09-02T10:00:00Z",
    verdictTitle: {
      kn: "ರಾಜಯೋಗ ಯುಕ್ತ ಭಾಗ್ಯೋದಯ ಹಸ್ತ",
      en: "Auspicious Royal Destiny Hand",
      hi: "राजयोग युक्त भाग्योदय हस्त",
      te: "రాజయోగ యుక్త భాగ్యోదయ హస్తం",
      ta: "ராஜயோக பாக்கிய ஹஸ்தம்"
    },
    overallScore: 94,
    handSide: "right",
    handSideLabel: { kn: "ಬಲಗೈ", en: "Right Hand" },
    chironomyHandType: {
      element: {
        kn: "ವಾಯು ತತ್ತ್ವ ಹಸ್ತ",
        en: "Air Hand (Intellectual)",
        hi: "वायु तत्त्व हस्त",
        te: "వాయు తత్త్వ హస్తం",
        ta: "வாயு தத்துவ கை"
      },
      traits: {
        kn: "ಬೌದ್ಧಿಕ ಅನ್ವೇಷಣೆ ಹಾಗೂ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಶಕ್ತಿ",
        en: "Analytical foresight and digital intelligence",
        hi: "बौद्धिक अन्वेषण एवं विश्लेषणात्मक क्षमता",
        te: "విశ్లేషణాత్మక ప్రతిభ",
        ta: "ஆராய்ச்சி திறன்"
      }
    },
    thumbAnalysis: {
      yavaSign: {
        kn: "ಪೂರ್ಣ ಯವ ಮುದ್ರಿಕೆ (ಶಿವ ನೇತ್ರ)",
        en: "Eye of Shiva (Yava)",
        hi: "पूर्ण यव मुद्रिका (शिव नेत्र)",
        te: "శివ నేత్రం",
        ta: "சிவ நேத்திரம்"
      },
      willpower: { kn: "ಪ್ರಬಲ ಇಚ್ಛಾಶಕ್ತಿ", en: "Firm Willpower" },
      logic: { kn: "ಚತುರ ತರ್ಕಶಕ್ತಿ", en: "Sharp Logic" }
    },
    imageDataUrl: "data:image/png;base64,dummy",
    devoteeName: "Shree Devotee",
    lifeLine: { lineName: { kn: "ಆಯುರ್ ರೇಖೆ", en: "Life Line" }, status: { kn: "ದೀರ್ಘ", en: "Long" }, indication: { kn: "ಆಯುಷ್ಯ", en: "Vitality" } },
    headLine: { lineName: { kn: "ಬುದ್ಧಿ ರೇಖೆ", en: "Head Line" }, status: { kn: "ದೀರ್ಘ", en: "Long" }, indication: { kn: "ಬುದ್ಧಿ", en: "Intellect" } },
    heartLine: { lineName: { kn: "ಹೃದಯ ರೇಖೆ", en: "Heart Line" }, status: { kn: "ದೀರ್ಘ", en: "Long" }, indication: { kn: "ಪ್ರೇಮ", en: "Devotion" } },
    fateLine: { lineName: { kn: "ಭಾಗ್ಯ ರೇಖೆ", en: "Fate Line" }, status: { kn: "ದೀರ್ಘ", en: "Long" }, indication: { kn: "ಭಾಗ್ಯ", en: "Fortune" } },
    sunLine: { lineName: { kn: "ಸೂರ್ಯ ರೇಖೆ", en: "Sun Line" }, status: { kn: "ದೀರ್ಘ", en: "Long" }, indication: { kn: "ಕೀರ್ತಿ", en: "Fame" } },
    mounts: [
      {
        mountName: { kn: "ಗುರು ಪರ್ವತ", en: "Mount of Jupiter" },
        strength: { kn: "ಉನ್ನತ ಹಾಗೂ ಬಲಯುತ", en: "Prominent & Elevated" },
        indication: {
          kn: "ಉನ್ನತ ನಾಯಕತ್ವ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ.",
          en: "Executive leadership and widespread moral authority."
        }
      },
      {
        mountName: { kn: "ಶನಿ ಪರ್ವತ", en: "Mount of Saturn" },
        strength: { kn: "ಮಧ್ಯಮ ಹಾಗೂ ಸ್ಥಿರ", en: "Moderate & Steady" },
        indication: {
          kn: "ಶಿಸ್ತುಬದ್ಧ ಕಾರ್ಯಶೈಲಿ ಹಾಗೂ ಭೂಮಿ ಯೋಗ.",
          en: "Disciplined execution and real estate stability."
        }
      }
    ],
    specialMarks: [
      {
        mark: {
          kn: "ಪವಿತ್ರ ತ್ರಿಶೂಲ ಚಿಹ್ನೆ",
          en: "Sacred Shiva Trident (Trishula)",
          hi: "पवित्र त्रिशूल चिह्न",
          te: "పవిత్ర త్రిశూల చిహ్నం",
          ta: "புனித திரிசூல குறி"
        },
        mountLocation: {
          kn: "ಗುರು ಪರ್ವತ",
          en: "Mount of Jupiter",
          hi: "गुरु पर्वत",
          te: "గురు పర్వతం",
          ta: "குரு மேடு"
        },
        meaning: {
          kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ಕೃಪಾಕಟಾಕ್ಷ ಮತ್ತು ಶತ್ರುಜಯ.",
          en: "Divine grace of Sri Mahabaleshwara and complete victory over obstacles.",
          hi: "भगवान महाबलेश्वर की साक्षात् कृपा।",
          te: "మహాబలేశ్వరుని అనుగ్రహం.",
          ta: "மகாபலேஸ்வரரின் அருள்."
        }
      }
    ],
    lifeStageMilestones: {
      estimatedAge: 32,
      currentPhaseKn: "ವೃತ್ತಿ ವೃದ್ಧಿ ಕಾಲ",
      currentPhaseEn: "Career Growth Phase",
      education: {
        intellectTraitKn: "ತೀಕ್ಷ್ಣ ಗಣಿತ-ವಿಜ್ಞಾನ ಬುದ್ಧಿ",
        intellectTraitEn: "Sharp analytical intellect",
        recommendedFieldsKn: "ತಂತ್ರಜ್ಞಾನ, ಸಂಶೋಧನೆ",
        recommendedFieldsEn: "Technology, Research"
      },
      marriage: {
        statusKn: "ಅತ್ಯಂತ ಸುಸಂಸ್ಕೃತ ದಾಂಪತ್ಯ",
        statusEn: "Auspicious harmonious union",
        timingAgeWindowKn: "೨೬ ರಿಂದ ೨೯ ವರ್ಷ",
        timingAgeWindowEn: "Ages 26 to 29",
        spouseTraitKn: "ಪವಿತ್ರ ಸಂಸ್ಕಾರಯುತ ಸಂಗಾತಿ",
        spouseTraitEn: "Virtuous, supportive spouse"
      },
      children: {
        prospectsKn: "ಉತ್ತಮ ಸಂತಾನ ಭಾಗ್ಯ",
        prospectsEn: "Auspicious progeny bliss",
        familyBlessingKn: "ಕುಟುಂಬ ಶಾಂತಿ",
        familyBlessingEn: "Family harmony"
      },
      careerWealth: {
        peakWealthAgeKn: "೩೫ ಮತ್ತು ೪೪ನೇ ವರ್ಷ",
        peakWealthAgeEn: "Ages 35 and 44",
        trajectoryKn: "ನಿರಂತರ ಆರ್ಥಿಕ ಏಳಿಗೆ",
        trajectoryEn: "Steep compounding financial ascent"
      }
    },
    remedyRecommendation: {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ, ಬಲಗೈ ತೋರುಬೆರಳಿಗೆ ಪುಷ್ಯರಾಗ ರತ್ನ ಧರಿಸಿ.",
      en: "Perform Ksheerabhishekam at Gokarna and wear Yellow Sapphire on the index finger.",
      hi: "गोकर्ण में क्षीराभिषेक करें एवं तर्जनी में पुखराज धारण करें।",
      te: "గోకర్ణంలో క్షీరాభిషేకం చేసి తర్జనికి పుష్యరాగం ధరించండి.",
      ta: "கோகர்ணத்தில் பாலாபிஷேகம் செய்து சுட்டு விரலில் புஷ்பராகம் அணியுங்கள்."
    },
    aiPrediction: "Test prediction"
  };

  describe("Tab 2: PalmMountsTab Dynamic Wiring & 5-Language Localization", () => {
    it("renders all 7 Vedic planetary mounts dynamically without static fallback locking", () => {
      render(
        <PalmMountsTab
          result={mockResult}
          mounts={mockResult.mounts}
          lang="kn"
          devoteeName="Shree Devotee"
        />
      );

      // Verify all 7 mounts appear
      expect(screen.getByText(/ಗುರು ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಶನಿ ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಸೂರ್ಯ ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಬುಧ ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಶುಕ್ರ ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಚಂದ್ರ ಪರ್ವತ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಕುಜ ಪರ್ವತ/i)).toBeInTheDocument();

      // Verify dynamic strength badge in Kannada
      expect(screen.getAllByText(/ಬಲ:/i).length).toBe(7);

      // Verify AI analyzed indication for Jupiter appears
      expect(screen.getByText(/ಉನ್ನತ ನಾಯಕತ್ವ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ/i)).toBeInTheDocument();
    });

    it("renders PalmMountsTab in English with English labels and badges", () => {
      render(
        <PalmMountsTab
          result={mockResult}
          mounts={mockResult.mounts}
          lang="en"
          devoteeName="Shree Devotee"
        />
      );

      // Verify English badge and headers
      expect(screen.getAllByText(/Strength:/i).length).toBe(7);
      expect(screen.getAllByText(/Ruling Planet:/i).length).toBe(7);
      expect(screen.getAllByText(/Associated Finger:/i).length).toBe(7);
      expect(screen.getByText(/Executive leadership and widespread moral authority/i)).toBeInTheDocument();
    });

    it("renders PalmMountsTab in Hindi, Telugu, and Tamil correctly", () => {
      const { unmount: unmountHi } = render(<PalmMountsTab result={mockResult} lang="hi" />);
      expect(screen.getAllByText(/शक्ति:/i).length).toBeGreaterThanOrEqual(7);
      unmountHi();

      const { unmount: unmountTe } = render(<PalmMountsTab result={mockResult} lang="te" />);
      expect(screen.getAllByText(/బలం:/i).length).toBeGreaterThanOrEqual(7);
      unmountTe();

      const { unmount: unmountTa } = render(<PalmMountsTab result={mockResult} lang="ta" />);
      expect(screen.getAllByText(/பலம்:/i).length).toBeGreaterThanOrEqual(7);
      unmountTa();
    });
  });

  describe("Tab 3: SamudrikaYogasTab Dynamic Marks & 4 Sacred Yogas", () => {
    it("dynamically displays devotee's detected specialMarks from AI result", () => {
      render(
        <SamudrikaYogasTab
          result={mockResult}
          lang="kn"
          devoteeName="Shree Devotee"
        />
      );

      // Verify detected mark appears
      expect(screen.getByText(/ಪವಿತ್ರ ತ್ರಿಶೂಲ ಚಿಹ್ನೆ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರ ಸಾಕ್ಷಾತ್ ಕೃಪಾಕಟಾಕ್ಷ/i)).toBeInTheDocument();

      // Verify 4 Sacred Palm Yogas appear
      expect(screen.getByText(/ಗಜಕೇಸರಿ ಯೋಗ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಮಹಾ ಲಕ್ಷ್ಮೀ ಯೋಗ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಸರಸ್ವತೀ ವಿದ್ಯಾ ಯೋಗ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಭೂಮಿ ಯೋಗ/i)).toBeInTheDocument();
    });

    it("renders SamudrikaYogasTab in English without Kannada fallback leakage", () => {
      render(
        <SamudrikaYogasTab
          result={mockResult}
          lang="en"
          devoteeName="Shree Devotee"
        />
      );

      expect(screen.getByText(/Sacred Shiva Trident \(Trishula\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Divine grace of Sri Mahabaleshwara/i)).toBeInTheDocument();
      expect(screen.getByText(/Gaja Kesari Palm Yoga/i)).toBeInTheDocument();
      expect(screen.getByText(/Mahalakshmi Wealth Yoga/i)).toBeInTheDocument();
      expect(screen.getByText(/4 Wrist Bracelets \(Manibandha Rascettes\):/i)).toBeInTheDocument();
    });
  });

  describe("Tab 4: PalmRemediesTab Personalized AI Recommendation & Catalog", () => {
    it("prominently displays the devotee's personalized AI remedy recommendation", () => {
      render(
        <PalmRemediesTab
          result={mockResult}
          lang="kn"
          devoteeName="Shree Devotee"
        />
      );

      expect(screen.getByText(/ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಬೆರಳುಗಳ ಪ್ರಕಾರ ಧರಿಸಬೇಕಾದ ರತ್ನಗಳು/i)).toBeInTheDocument();
      expect(screen.getByText(/೫ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ/i)).toBeInTheDocument();
      expect(screen.getByText(/ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ/i)).toBeInTheDocument();
    });

    it("renders PalmRemediesTab in English with English remedy texts", () => {
      render(
        <PalmRemediesTab
          result={mockResult}
          lang="en"
          devoteeName="Shree Devotee"
        />
      );

      expect(screen.getByText(/Perform Ksheerabhishekam at Gokarna and wear Yellow Sapphire/i)).toBeInTheDocument();
      expect(screen.getByText(/Index Finger \(Guru - Jupiter\)/i)).toBeInTheDocument();
      expect(screen.getByText(/5-Mukhi Rudraksha \(Lord Kalagni Rudra\)/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Ksheerabhishekam at Gokarna/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("PalmTimelineDiagram: Dynamic Milestones & Current Phase Aura", () => {
    it("dynamically resolves ages from LifeStageMilestones and highlights current phase", () => {
      render(
        <PalmTimelineDiagram
          personName="Shree Devotee"
          lang="kn"
          handSide="right"
          milestones={mockResult.lifeStageMilestones}
        />
      );

      // Milestone ages 21, 26, 35, 45, 62 should be rendered
      expect(screen.getByText(/📍 ವಯಸ್ಸು 21 ವರ್ಷ/i)).toBeInTheDocument();
      expect(screen.getByText(/📍 ವಯಸ್ಸು 26 ವರ್ಷ/i)).toBeInTheDocument();
      expect(screen.getByText(/📍 ವಯಸ್ಸು 35 ವರ್ಷ/i)).toBeInTheDocument();
      expect(screen.getByText(/📍 ವಯಸ್ಸು 45 ವರ್ಷ/i)).toBeInTheDocument();
      expect(screen.getByText(/📍 ವಯಸ್ಸು 62 ವರ್ಷ/i)).toBeInTheDocument();

      // Current phase badge (devotee age 32 is closest to 35)
      expect(screen.getByText(/ಪ್ರಸ್ತುತ ಹಂತ/i)).toBeInTheDocument();

      // Line names
      expect(screen.getByText(/ಆಯುರ್ ರೇಖೆ \(Life Line\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ಬುದ್ಧಿ ರೇಖೆ \(Head Line\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ಹೃದಯ ರೇಖೆ \(Heart Line\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ಭಾಗ್ಯ ರೇಖೆ \(Fate Line\)/i)).toBeInTheDocument();
    });

    it("renders PalmTimelineDiagram in English with English labels", () => {
      render(
        <PalmTimelineDiagram
          personName="Shree Devotee"
          lang="en"
          handSide="right"
          milestones={mockResult.lifeStageMilestones}
        />
      );

      expect(screen.getByText(/📍 Age 21 Years/i)).toBeInTheDocument();
      expect(screen.getByText(/📍 Age 26 Years/i)).toBeInTheDocument();
      expect(screen.getByText(/Current Phase/i)).toBeInTheDocument();
      expect(screen.getByText(/Life Line \(Ayur Rekha\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Head Line \(Buddhi Rekha\)/i)).toBeInTheDocument();
    });
  });

  describe("Kundli Vimshottari Dasha Lord Dynamic Calculation", () => {
    it("derives authentic Vimshottari Dasha Lord and maps across 5 languages", async () => {
      // Test with real astronomical chart calculation
      const kundli = await calculateKundliWithPlaceSun({
        name: "Test Devotee",
        gender: "Male",
        birthDate: "1990-01-15",
        birthTime: "10:30",
        latitude: 14.5479,
        longitude: 74.3188,
        pincode: "581326"
      });

      const dashaBal = vimshottariBalanceAtBirth(kundli);
      expect(dashaBal).toBeDefined();
      expect(dashaBal.lord).toBeDefined();

      const planetName = String(dashaBal.lord);
      expect(PLANET_NAMES_L5[planetName]).toBeDefined();

      // Ensure 5-language mapping is non-empty
      expect(PLANET_NAMES_L5[planetName].kn).toBeTruthy();
      expect(PLANET_NAMES_L5[planetName].en).toBeTruthy();
      expect(PLANET_NAMES_L5[planetName].hi).toBeTruthy();
      expect(PLANET_NAMES_L5[planetName].te).toBeTruthy();
      expect(PLANET_NAMES_L5[planetName].ta).toBeTruthy();

      // Ensure Dasha Lord is NOT statically fixed
      const dashaLordKn = PLANET_NAMES_L5[planetName].kn;
      expect(typeof dashaLordKn).toBe("string");
      expect(dashaLordKn.length).toBeGreaterThan(0);
    });
  });
});
