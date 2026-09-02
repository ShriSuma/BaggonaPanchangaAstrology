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
      expect(keys.length).toBeGreaterThanOrEqual(45);

      for (const key of keys) {
        for (const lang of requiredLanguages) {
          const val = T_PUBLIC_KUNDLI[key][lang];
          expect(val, `Missing key '${key}' in language '${lang}'`).toBeDefined();
          expect(val.trim().length, `Empty value for key '${key}' in language '${lang}'`).toBeGreaterThan(0);
        }
      }
    });

    it("verifies getPublicKundliText returns accurate translation with fallback", () => {
      expect(getPublicKundliText("portalTitle", "kn")).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ");
      expect(getPublicKundliText("portalTitle", "en")).toContain("Baggona Panchanga Astrology Office");
      expect(getPublicKundliText("portalTitle", "hi")).toContain("बग्गोण पंचांग");
      expect(getPublicKundliText("portalTitle", "te")).toContain("బగ్గోణ పంచాంగ");
      expect(getPublicKundliText("portalTitle", "ta")).toContain("பக்கோண பஞ்சாங்க");

      expect(getPublicKundliText("tabPersonality", "kn")).toContain("ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ");
      expect(getPublicKundliText("tabPersonality", "en")).toContain("Personality & Hidden Psyche");

      // Fallback test
      expect(getPublicKundliText("non_existent_key", "kn")).toBe("non_existent_key");
    });

    it("verifies the single action button text exists in all 5 languages", () => {
      for (const lang of requiredLanguages) {
        const actionText = getPublicKundliText("singleActionBtnText", lang);
        expect(actionText.length).toBeGreaterThan(10);
      }
      expect(getPublicKundliText("singleActionBtnText", "kn")).toContain("ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ?");
      expect(getPublicKundliText("singleActionBtnText", "en")).toContain("What is happening in your life right now?");
    });
  });

  // ==========================================================================
  // SECTION 2: WALLET & SERVICE COIN PRICING ENGINE
  // ==========================================================================
  describe("2. Wallet & Service Coin Pricing Engine", () => {
    it("verifies PUBLIC_KUNDLI_GENERATION is configured for 500 Coins (₹50)", () => {
      const config = SERVICE_COIN_COSTS.PUBLIC_KUNDLI_GENERATION;
      expect(config).toBeDefined();
      expect(config.coins).toBe(500);
      expect(config.inrEquivalent).toBe(50);
      expect(config.category).toBe("kundli");
    });

    it("verifies PUBLIC_LIFE_ANALYSIS_QA is configured for 1000 Coins (₹100)", () => {
      const config = SERVICE_COIN_COSTS.PUBLIC_LIFE_ANALYSIS_QA;
      expect(config).toBeDefined();
      expect(config.coins).toBe(1000);
      expect(config.inrEquivalent).toBe(100);
      expect(config.category).toBe("kundli");
    });

    it("verifies PUBLIC_KUNDLI_PDF_DOWNLOAD is configured for 500 Coins (₹50)", () => {
      const config = SERVICE_COIN_COSTS.PUBLIC_KUNDLI_PDF_DOWNLOAD;
      expect(config).toBeDefined();
      expect(config.coins).toBe(500);
      expect(config.inrEquivalent).toBe(50);
      expect(config.category).toBe("reports");
    });

    it("verifies PUBLIC_TAB_UNLOCK is configured for 200 Coins (₹20)", () => {
      const config = SERVICE_COIN_COSTS.PUBLIC_TAB_UNLOCK;
      expect(config).toBeDefined();
      expect(config.coins).toBe(200);
      expect(config.inrEquivalent).toBe(20);
      expect(config.category).toBe("kundli");
    });
  });

  // ==========================================================================
  // SECTION 3: MATHEMATICAL COMPUTATIONS, DEEP PERSONALITY & MAANDI ENGINE
  // ==========================================================================
  describe("3. Mathematical Computations, Deep Personality & Maandi Engine", () => {
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
      expect(deepKn.maandiAnalysis.paragraph1.length).toBeGreaterThan(150);
      expect(deepKn.maandiAnalysis.paragraph2.length).toBeGreaterThan(150);

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

      // Tab 1 (Patrika) is default active: South Indian chart, Panchanga Angas, Planetary table, Remedies
      expect(screen.getByText(/ಜನನ ಕಾಲದ ಪಂಚಾಂಗ ಅಂಗ ವಿವರಗಳು/i)).toBeInTheDocument();
      expect(screen.getByText(/ಗ್ರಹ ಸ್ಥಿತಿ & ಅಂಶ ಕೋಷ್ಟಕ/i)).toBeInTheDocument();
      expect(screen.getByText(/ದೈವಿಕ ಪರಿಹಾರಗಳು & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು/i)).toBeInTheDocument();
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

      // Tab 3 should now unlock and show the 5 personality reading sections & audio narration
      await waitFor(() => {
        expect(screen.getAllByText(/ತಮ್ಮ ಬಗ್ಗೆ \/ ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ನಿಗೂಢ ರಹಸ್ಯ & ಆಂತರ್ಯದ ಸೂಕ್ಷ್ಮತೆ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ಪ್ರಸ್ತುತ ಜ್ಯೋತಿಷ್ಯದ ಮೊರೆ ಹೋಗಲು ಕಾರಣ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/ಮಾಂದಿ \(ಗುಳಿಕ\) ನಿಗೂಢ ಪ್ರಭಾವ/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(/ಧ್ವನಿ ಕಥನ ಕೇಳಿ/i)).toBeInTheDocument();
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
  });
});
