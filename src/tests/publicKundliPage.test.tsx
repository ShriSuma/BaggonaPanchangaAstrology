import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  T_PUBLIC_KUNDLI,
  getPublicKundliText,
  PUBLIC_KUNDLI_LANGUAGES,
  type PublicKundliLang
} from "../features/publicKundli/publicKundliLocale";
import { SERVICE_COIN_COSTS } from "../features/wallet/walletTypes";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import {
  calculatePublicKundliProfile,
  generateDynamicLifeInsights,
  generateDynamicQaFallback,
  generateDeepPersonalityAnalysis,
  generateCustomQuestionAstrologyAnswer,
  evaluateDignity,
  formatDegree,
  formatDateFromAge
} from "../features/publicKundli/publicKundliEngine";
import PublicKundliPage from "../pages/PublicKundliPage";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "kn",
      changeLanguage: vi.fn()
    }
  })
}));

vi.mock("../db/firestoreDb", () => ({
  deductPriestCoins: vi.fn().mockResolvedValue({ success: true, newBalance: 4500 }),
  saveKundliToFirestore: vi.fn().mockResolvedValue("mock_doc_id"),
  getOrCreatePriestWallet: vi.fn().mockResolvedValue({ userId: "PRIEST", coinBalance: 5000 }),
  subscribeServicePricingConfig: vi.fn((cb) => {
    cb({});
    return () => {};
  }),
  saveServicePricingConfig: vi.fn().mockResolvedValue(true),
  LOCAL_STORAGE_SERVICE_PRICING_KEY: "baggona_service_pricing_cache_test"
}));

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockResolvedValue(
    JSON.stringify({
      currentPhase: "Currently experiencing a favorable transit period with planetary stability.",
      subconsciousMind: "Inner focus on higher wisdom and career duties.",
      careerFinance: "Strong progress and auspicious gains indicated.",
      relationshipsHealth: "Harmonious familial relations with stable health.",
      gokarnaRemedy: "Rudrabhisheka at Sri Kshetra Gokarna Mahabaleshwara temple."
    })
  )
}));

vi.mock("../core/ExportUtils", () => ({
  exportPanchangaWithDashaPdf: vi.fn().mockResolvedValue(undefined),
  exportElementAsPdf: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("../features/notifications/notificationService", () => ({
  notifyPublicPremiumPdfRequested: vi.fn().mockResolvedValue({ success: true }),
  sendEmailNotification: vi.fn().mockResolvedValue({ success: true })
}));

describe("Public Kundli & Live Astrology Analysis 100% Dynamic Engine Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const sampleInput: KundliInput = {
    name: "Devotee Anant",
    birthDate: "1995-05-15",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gothra: "Kashyapa",
    gender: "Male",
    pincode: "581326"
  };

  // ==========================================================================
  // SECTION 1: 5-LANGUAGE LOCALIZATION DICTIONARY & INTEGRITY
  // ==========================================================================
  describe("1. 5-Language Localization Dictionary & Key Integrity", () => {
    const requiredLanguages: PublicKundliLang[] = ["kn", "en", "hi", "te", "ta"];

    it("supports all 5 required languages in PUBLIC_KUNDLI_LANGUAGES list", () => {
      expect(PUBLIC_KUNDLI_LANGUAGES.map((l) => l.code)).toEqual(requiredLanguages);
    });

    it("verifies all dictionary entries have non-empty text across all 5 languages", () => {
      const keys = Object.keys(T_PUBLIC_KUNDLI);
      expect(keys.length).toBeGreaterThanOrEqual(30);

      for (const key of keys) {
        const item = T_PUBLIC_KUNDLI[key];
        for (const lang of requiredLanguages) {
          expect(item[lang], `Missing or empty [${lang}] for key: ${key}`).toBeDefined();
          expect(item[lang].trim().length).toBeGreaterThan(0);
        }
      }
    });

    it("returns correct localized text with fallback for getPublicKundliText", () => {
      expect(getPublicKundliText("portalTitle", "kn")).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
      expect(getPublicKundliText("portalTitle", "en")).toContain("Baggona Panchanga");
      expect(getPublicKundliText("portalTitle", "hi")).toContain("बग्गोण पंचांग");
      expect(getPublicKundliText("portalTitle", "te")).toContain("బగ్గోణ పంచాంగ");
      expect(getPublicKundliText("portalTitle", "ta")).toContain("பக்கோண பஞ்சாங்க");
      expect(getPublicKundliText("nonExistentKey", "kn")).toBe("nonExistentKey");
    });
  });

  // ==========================================================================
  // SECTION 2: DYNAMIC SERVICE PRICING CONFIGURATION & PRIEST COIN GATING
  // ==========================================================================
  describe("2. Dynamic Service Pricing Configuration & Wallet Integration", () => {
    it("defines exact coin pricing in SERVICE_COIN_COSTS constants", () => {
      expect(SERVICE_COIN_COSTS["PUBLIC_KUNDLI_GENERATION"]).toBeDefined();
      expect(SERVICE_COIN_COSTS["PUBLIC_KUNDLI_GENERATION"].coins).toBe(500);
      expect(SERVICE_COIN_COSTS["PUBLIC_KUNDLI_GENERATION"].inrEquivalent).toBe(50);

      expect(SERVICE_COIN_COSTS["PUBLIC_LIFE_ANALYSIS_QA"]).toBeDefined();
      expect(SERVICE_COIN_COSTS["PUBLIC_LIFE_ANALYSIS_QA"].coins).toBe(1000);
      expect(SERVICE_COIN_COSTS["PUBLIC_LIFE_ANALYSIS_QA"].inrEquivalent).toBe(100);

      expect(SERVICE_COIN_COSTS["PUBLIC_KUNDLI_PDF_DOWNLOAD"]).toBeDefined();
      expect(SERVICE_COIN_COSTS["PUBLIC_KUNDLI_PDF_DOWNLOAD"].coins).toBe(500);

      expect(SERVICE_COIN_COSTS["PUBLIC_TAB_UNLOCK"]).toBeDefined();
      expect(SERVICE_COIN_COSTS["PUBLIC_TAB_UNLOCK"].coins).toBe(200);

      expect(SERVICE_COIN_COSTS["PUBLIC_CUSTOM_QUESTION_QA"]).toBeDefined();
      expect(SERVICE_COIN_COSTS["PUBLIC_CUSTOM_QUESTION_QA"].coins).toBe(500);
      expect(SERVICE_COIN_COSTS["PUBLIC_CUSTOM_QUESTION_QA"].inrEquivalent).toBe(50);
    });
  });

  // ==========================================================================
  // SECTION 3: MATHEMATICAL COMPUTATIONS, DEEP PERSONALITY & MAANDI ENGINE
  // ==========================================================================
  describe("3. Mathematical Computations, Deep Personality & Maandi Engine", () => {
    it("calculates authentic Lahiri Kundli and derives real-time running Dasha & Maandi", async () => {
      const computed = await calculateKundliWithPlaceSun(sampleInput, { ayanamsaModel: "lahiri" });
      expect(computed).toBeDefined();
      expect(computed.lagnaRashi).toBeDefined();
      expect(computed.moonSign).toBeDefined();

      const profile = calculatePublicKundliProfile(computed, "1995-05-15", "10:30", 14.5479, 74.3188);

      expect(profile.ageYears).toBeGreaterThan(25);
      expect(profile.currentMahadasha).toBeDefined();
      expect(profile.currentBhukti).toBeDefined();
      expect(profile.dashaStartDateStr).toBeDefined();
      expect(profile.dashaEndDateStr).toBeDefined();

      // Verify Maandi calculation
      expect(profile.maandiHouse).toBeGreaterThanOrEqual(1);
      expect(profile.maandiHouse).toBeLessThanOrEqual(12);
      expect(profile.maandiRashi).toBeDefined();
      expect(profile.maandiDegreeStr).toBeDefined();

      // Verify planetary rows structure and types
      expect(profile.planetaryRows.length).toBeGreaterThanOrEqual(10);
      for (const row of profile.planetaryRows) {
        expect(typeof row.name).toBe("string");
        expect(typeof row.rashi).toBe("string");
        expect(typeof row.nakshatra).toBe("string");
        expect(typeof row.degreeStr).toBe("string");
        expect(typeof row.house).toBe("number");
        expect(typeof row.pada).toBe("number");
        expect(typeof row.lord).toBe("string");
        expect(typeof row.dignity).toBe("string");
      }

      // Verify 120-year timeline
      expect(profile.dashaTimelineRows.length).toBeGreaterThan(5);
      const activeRows = profile.dashaTimelineRows.filter((r) => r.status === "active");
      expect(activeRows.length).toBe(1);
    });

    it("generates 100% dynamic 2-paragraph deep personality, hidden secrets, and Maandi inquest in Kannada and English", async () => {
      const computed = await calculateKundliWithPlaceSun(sampleInput, { ayanamsaModel: "lahiri" });
      const profile = calculatePublicKundliProfile(computed, "1995-05-15", "10:30", 14.5479, 74.3188);

      // Test Kannada Deep Personality Analysis
      const deepKn = generateDeepPersonalityAnalysis(profile, computed, "kn");
      expect(deepKn.personality.paragraph1.length).toBeGreaterThan(150);
      expect(deepKn.personality.paragraph2.length).toBeGreaterThan(150);
      expect(deepKn.hiddenSecrets.paragraph1.length).toBeGreaterThan(150);
      expect(deepKn.hiddenSecrets.paragraph2.length).toBeGreaterThan(150);
      expect(deepKn.whyAstrology.paragraph1.length).toBeGreaterThan(150);
      expect(deepKn.whyAstrology.paragraph2.length).toBeGreaterThan(150);
      expect(deepKn.internalQuestions.paragraph1.length).toBeGreaterThan(150);
      expect(deepKn.internalQuestions.paragraph2.length).toBeGreaterThan(150);
      // Verify zero English words leak into Kannada paragraphs
      expect(deepKn.maandiAnalysis.paragraph1).not.toMatch(/\b(Virgo|Aries|Taurus|Gemini|Cancer|Leo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/);
      expect(deepKn.personality.paragraph1).not.toMatch(/\b(Ashwini|Bharani|Krittika|Rohini|Mrigashira|Ardra|Punarvasu|Pushya|Ashlesha|Magha|Purva|Uttara|Hasta|Chitra|Swati|Vishakha|Anuradha|Jyeshtha|Mula|Shravana|Dhanishta|Shatabhisha|Revati)\b/);
      expect(deepKn.maandiAnalysis.paragraph1).toContain("ರಾಶಿಯಲ್ಲಿ");

      // Verify direct spoken astrologer tone
      expect(deepKn.personality.paragraph1).toContain("ನೋಡಿ, ನಿಮ್ಮ ಜಾತಕವನ್ನು ಪ್ರತ್ಯಕ್ಷವಾಗಿ");
      expect(deepKn.seedQuestions.length).toBeGreaterThanOrEqual(4);
      expect(deepKn.spokenNarrationFullText).toContain("ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ");

      // Test English Deep Personality Analysis
      const deepEn = generateDeepPersonalityAnalysis(profile, computed, "en");
      expect(deepEn.personality.paragraph1.length).toBeGreaterThan(150);
      expect(deepEn.personality.paragraph2.length).toBeGreaterThan(150);
      expect(deepEn.hiddenSecrets.paragraph1.length).toBeGreaterThan(150);
      expect(deepEn.hiddenSecrets.paragraph2.length).toBeGreaterThan(150);
      expect(deepEn.whyAstrology.paragraph1.length).toBeGreaterThan(150);
      expect(deepEn.whyAstrology.paragraph2.length).toBeGreaterThan(150);
      expect(deepEn.maandiAnalysis.paragraph1.length).toBeGreaterThan(150);
      expect(deepEn.maandiAnalysis.paragraph2.length).toBeGreaterThan(150);
      expect(deepEn.personality.paragraph1).toContain("Looking directly into your Janma Kundali");
    });

    it("evaluates planetary dignities and degree formatting accurately", () => {
      expect(evaluateDignity("Sun", 0)).toBe("Exalted");
      expect(evaluateDignity("Sun", 6)).toBe("Debilitated");
      expect(evaluateDignity("Sun", 4)).toBe("Own Sign");
      expect(evaluateDignity("Moon", 1)).toBe("Exalted");
      expect(evaluateDignity("Mars", 9)).toBe("Exalted");

      expect(formatDegree(15.5)).toBe("15° 30' 0\"");
      expect(formatDateFromAge("2000-01-01", 10)).toBe("2010-01-01");
    });
  });

  // ==========================================================================
  // SECTION 4: UI WORKFLOW & 6 INTERACTIVE TABS TEST
  // ==========================================================================
  describe("4. Standalone Public UI Component & Flow Verification", () => {
    it("renders the PublicKundliPage with sacred invocation and input form", () => {
      render(<PublicKundliPage />);

      expect(screen.getByText(/ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ/i)).toBeInTheDocument();
      expect(screen.getByTestId("devotee-name-input")).toBeInTheDocument();
      expect(screen.getByText(/ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i)).toBeInTheDocument();
    });

    it("switches UI language dynamically when language pill is clicked", () => {
      render(<PublicKundliPage />);

      const enBtn = screen.getByRole("button", { name: "English" });
      fireEvent.click(enBtn);

      expect(screen.getByText(/Baggona Panchanga Astrology Office/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter Authentic Birth Details/i)).toBeInTheDocument();
    });

    it("executes Step 1 to Step 2 transition and renders pure localized badges and Karmic Dosha Box with Pitru Dosha", async () => {
      render(<PublicKundliPage />);

      const nameInput = screen.getByTestId("devotee-name-input");
      fireEvent.change(nameInput, { target: { value: "Devotee Anant" } });

      const generateBtn = screen.getByRole("button", { name: /ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Devotee Anant/i })).toBeInTheDocument();
      }, { timeout: 6000 });

      // Verify the single action button
      expect(
        screen.getByText(/ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ\? ನೇರ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText(/1,?000 Coins/i).length).toBeGreaterThanOrEqual(1);

      // Verify Top Summary Badges in pure localized Kannada (Zero English words in brackets)
      expect(screen.getAllByText("ಕರ್ಕಾಟಕ").length).toBeGreaterThanOrEqual(1); // Pure Kannada Lagna
      expect(screen.getAllByText("ಕನ್ಯಾ").length).toBeGreaterThanOrEqual(1); // Pure Kannada Rashi
      expect(screen.getAllByText(/ಪಾದ/i).length).toBeGreaterThanOrEqual(1); // Pure Kannada Nakshatra & Pada
      expect(screen.getAllByText(/ಭುಕ್ತಿ/i).length).toBeGreaterThanOrEqual(1); // Pure Kannada Dasha & Bhukti

      // Verify Karmic Dosha Box (Pitru Dosha, Status, Gokarna Pariahra)
      expect(screen.getByText(/ಜನ್ಮ ಕುಂಡಲಿ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ಪಿತೃ ದೋಷ/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/ಗೋಕರ್ಣ ಪರಿಹಾರ/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/ನಾರಾಯಣ ಬಲಿ.*ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ/i).length).toBeGreaterThanOrEqual(1);

      // Verify 3 Restructured Tab buttons
      expect(screen.getByRole("button", { name: /📜 ಜಾತಕ ಪತ್ರಿಕೆ & ಪಂಚಾಂಗ/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /⏳ ದಶಾ & ಭುಕ್ತಿ ಕಾಲಚಕ್ರ/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /🔒 ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ \(1,000 Coins\)/i })).toBeInTheDocument();

      // Tab 1 (Patrika) is default active: Jyotishya Saramsha table, Dwadasha Bhava chart, Remedies with reasoning
      expect(screen.getByText(/ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸಾರಾಂಶ/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ಘಟಿ/i).length).toBeGreaterThanOrEqual(5);
      expect(screen.getAllByText(/ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ/i).length).toBeGreaterThanOrEqual(1);

      // Verify Center Box contains Devotee Name, Date, Time, Rashi, Nakshatra, Lagna
      expect(screen.getAllByText(/Devotee Anant/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸಿದ್ಧ ರಕ್ಷೆ/i).length).toBeGreaterThanOrEqual(1);

      // Planetary placements table is removed per user instruction
      expect(screen.queryByText(/ಗ್ರಹ ಸ್ಥಿತಿ & ಅಂಶ ಕೋಷ್ಟಕ/i)).toBeNull();
      expect(screen.getByText(/ದೈವಿಕ ಪರಿಹಾರಗಳು & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು/i)).toBeInTheDocument();
      // Verify Astrological Reasons (ಶಾಸ್ತ್ರೀಯ ಕಾರಣ) are rendered for remedies
      expect(screen.getAllByText(/ಶಾಸ್ತ್ರೀಯ ಕಾರಣ:/i).length).toBeGreaterThanOrEqual(4);
    });

    it("verifies Tab 2 Dasha & Bhukti with expandable 9 Bhuktis accordion and 2-line predictive phrases", async () => {
      render(<PublicKundliPage />);

      const nameInput = screen.getByTestId("devotee-name-input");
      fireEvent.change(nameInput, { target: { value: "Devotee Anant" } });

      const generateBtn = screen.getByRole("button", { name: /ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Devotee Anant/i })).toBeInTheDocument();
      }, { timeout: 6000 });

      // Click Tab 2: Dasha & Bhukti
      const dashaTabBtn = screen.getByRole("button", { name: /⏳ ದಶಾ & ಭುಕ್ತಿ ಕಾಲಚಕ್ರ/i });
      fireEvent.click(dashaTabBtn);

      // Verify 120-Year Vimshottari Mahadasha timeline is visible
      expect(screen.getByText(/೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಚಕ್ರ/i)).toBeInTheDocument();
      expect(screen.getByText(/೯ ಭುಕ್ತಿಗಳು & ಫಲಗಳನ್ನು ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ/i)).toBeInTheDocument();

      // Verify Color-coded Dasha-Bhukti badges are rendered
      expect(screen.getAllByText(/ಶುಭ ಫಲ|ಕಷ್ಟಕರ ಕಾಲ|ಮಿಶ್ರ ಫಲ/i).length).toBeGreaterThanOrEqual(1);

      // Verify 2-line predictive phrases are rendered in Bhuktis
      expect(screen.getAllByText(/ಜೀವನ ಸ್ಥಿತಿ/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/ಸಂಭಾವ್ಯ ಸವಾಲು/i).length).toBeGreaterThanOrEqual(1);
    });

    it("verifies Tab 3 Personality is locked with 1,000-coin modal and unlocks upon confirmation", async () => {
      render(<PublicKundliPage />);

      const nameInput = screen.getByTestId("devotee-name-input");
      fireEvent.change(nameInput, { target: { value: "Devotee Anant" } });

      const generateBtn = screen.getByRole("button", { name: /ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Devotee Anant/i })).toBeInTheDocument();
      }, { timeout: 6000 });

      // Click Tab 3 button (locked)
      const personalityTabBtn = screen.getByRole("button", { name: /🔒 ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ \(1,000 Coins\)/i });
      fireEvent.click(personalityTabBtn);

      // Confirmation modal should open
      await waitFor(() => {
        expect(
          screen.getByText(/ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ ಅನ್‌ಲಾಕ್ ಮಾಡಲು 1,000 ನಾಣ್ಯಗಳನ್ನು \(Coins\) ಕಡಿತಗೊಳಿಸಲಾಗುವುದು/i)
        ).toBeInTheDocument();
      });

      // Confirm unlock
      const confirmUnlockBtn = screen.getByRole("button", { name: /🪙 ಹೌದು, ಅನ್‌ಲಾಕ್ ಮಾಡಿ/i });
      fireEvent.click(confirmUnlockBtn);

      // Tab 3 should now unlock and show the 5 personality reading sections, audio narration, and custom question section
      await waitFor(() => {
        expect(screen.getAllByText(/ಜನ್ಮ ಲಗ್ನ & ಸಹಜ ವ್ಯಕ್ತಿತ್ವ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ಸುಪ್ತ ಮನಸ್ಸು & ನಿಗೂಢ ರಹಸ್ಯ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ಪ್ರಸ್ತುತ ದಶಾ-ಗೋಚಾರ ಪ್ರಭಾವ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ಮಾಂದಿ ಕರ್ಮ ಛಾಯೆ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/ಧ್ವನಿ ಕಥನ ಕೇಳಿ/i)).toBeInTheDocument();
        expect(screen.getByText(/ಇತರ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ/i)).toBeInTheDocument();
      });
    });

    it("renders the ₹350 Premium Grand Royal Consultation card with direct call and email actions", async () => {
      const { notifyPublicPremiumPdfRequested } = await import("../features/notifications/notificationService");

      render(<PublicKundliPage />);

      const nameInput = screen.getByTestId("devotee-name-input");
      fireEvent.change(nameInput, { target: { value: "Devotee Anant" } });

      const generateBtn = screen.getByRole("button", { name: /ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Devotee Anant/i })).toBeInTheDocument();
      });

      // Verify ₹350 Grand Consultation Card
      expect(screen.getByText(/ಸಂಪೂರ್ಣ ರಾಜವೈಭವ ಜಾತಕ & ನೇರ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ \(₹೩೫೦ ಮಾತ್ರ\)/i)).toBeInTheDocument();
      expect(screen.getByText(/ಸಂಪೂರ್ಣ ೮-೧೦ ಪುಟಗಳ ಮುದ್ರಣೀಯ ರಾಜವೈಭವ ಜಾತಕ PDF ಪುಸ್ತಕ/i)).toBeInTheDocument();

      // Verify Direct Phone Call Action
      const callBtn = screen.getByTestId("direct-astrologer-call-btn");
      expect(callBtn).toBeInTheDocument();
      expect(callBtn.getAttribute("href")).toBe("tel:+919972339362");

      // Verify Send Email Action
      const emailBtn = screen.getByTestId("send-email-to-astrologer-btn");
      expect(emailBtn).toBeInTheDocument();
      expect(emailBtn).toHaveTextContent(/spshripandit@gmail.com/i);

      // Click Email button
      fireEvent.click(emailBtn);

      await waitFor(() => {
        expect(notifyPublicPremiumPdfRequested).toHaveBeenCalledWith(
          expect.objectContaining({
            userName: "Devotee Anant",
            targetEmail: "spshripandit@gmail.com"
          })
        );
      });
    });

    it("synthesizes authentic categorized astrological answers for any custom questions", async () => {
      const computed = await calculateKundliWithPlaceSun(sampleInput, { ayanamsaModel: "lahiri" });
      const profile = calculatePublicKundliProfile(computed, "1995-05-15", "10:30", 14.5479, 74.3188);

      // Career Question
      const careerAns = generateCustomQuestionAstrologyAnswer("When will I get a promotion in my job?", profile, computed, "kn");
      expect(careerAns.category).toBe("career");
      expect(careerAns.categoryLocalized).toBe("ಉದ್ಯೋಗ & ಕಾರ್ಯಕ್ಷೇತ್ರ");
      expect(careerAns.analysisText.length).toBeGreaterThan(150);
      expect(careerAns.recommendedGokarnaSeva).toContain("ಗೋಕರ್ಣ");

      // Marriage Question
      const marriageAns = generateCustomQuestionAstrologyAnswer("When will my marriage happen?", profile, computed, "kn");
      expect(marriageAns.category).toBe("marriage");
      expect(marriageAns.categoryLocalized).toBe("ವಿವಾಹ & ದಾಂಪತ್ಯ ಜೀವನ");
      expect(marriageAns.analysisText.length).toBeGreaterThan(150);

      // Finance Question
      const financeAns = generateCustomQuestionAstrologyAnswer("Will my financial debt clear soon?", profile, computed, "kn");
      expect(financeAns.category).toBe("finance");
      expect(financeAns.categoryLocalized).toBe("ಧನ & ಆರ್ಥಿಕ ಸ್ಥಿತಿ");

      // Health Question
      const healthAns = generateCustomQuestionAstrologyAnswer("How is my health and mental peace?", profile, computed, "kn");
      expect(healthAns.category).toBe("health");
      expect(healthAns.categoryLocalized).toBe("ಆರೋಗ್ಯ & ಮಾನಸಿಕ ಶಾಂತಿ");
    });

    it("submits custom question in Tab 3, deducts 500 coins, and renders dynamic answer card", async () => {
      const { deductPriestCoins } = await import("../db/firestoreDb");

      render(<PublicKundliPage />);

      const nameInput = screen.getByTestId("devotee-name-input");
      fireEvent.change(nameInput, { target: { value: "Devotee Anant" } });

      const generateBtn = screen.getByRole("button", { name: /ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Devotee Anant/i })).toBeInTheDocument();
      });

      // Unlock Tab 3
      const personalityTabBtn = screen.getByRole("button", { name: /🔒 ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ \(1,000 Coins\)/i });
      fireEvent.click(personalityTabBtn);

      const confirmUnlockBtn = screen.getByRole("button", { name: /🪙 ಹೌದು, ಅನ್‌ಲಾಕ್ ಮಾಡಿ/i });
      fireEvent.click(confirmUnlockBtn);

      await waitFor(() => {
        expect(screen.getByText(/ಇತರ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ/i)).toBeInTheDocument();
      });

      // Type custom question in textarea
      const textarea = screen.getByPlaceholderText(/ನಿಮ್ಮ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ/i);
      fireEvent.change(textarea, { target: { value: "ನನ್ನ ನೂತನ ವ್ಯಾಪಾರ ಆರಂಭಕ್ಕೆ ಸೂಕ್ತ ಕಾಲ ಯಾವಾಗ?" } });

      // Click submit question button
      const submitBtn = screen.getByRole("button", { name: /ಪ್ರಶ್ನೆ ಸಲ್ಲಿಸಿ/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(deductPriestCoins).toHaveBeenCalledWith(
          expect.anything(),
          500,
          expect.stringContaining("Public Kundli Custom Question Inquest"),
          expect.anything()
        );
      });

      // Verify synthesized response appears
      await waitFor(() => {
        expect(screen.getByText(/ಉದ್ಯೋಗ & ಕಾರ್ಯಕ್ಷೇತ್ರ/i)).toBeInTheDocument();
        expect(screen.getByText(/"ನನ್ನ ನೂತನ ವ್ಯಾಪಾರ ಆರಂಭಕ್ಕೆ ಸೂಕ್ತ ಕಾಲ ಯಾವಾಗ\?"|ನನ್ನ ನೂತನ ವ್ಯಾಪಾರ/i)).toBeInTheDocument();
      });
    });
  });
});
