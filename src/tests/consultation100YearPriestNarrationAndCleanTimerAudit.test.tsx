import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  isRemedyRequested,
  buildDeterministicMarriageReading
} from "../features/consultation/consultationAIEngine";
import { ConsultationChatPage } from "../features/consultation/ConsultationChatPage";
import { type ConsultationSession } from "../features/consultation/consultationTypes";

// Mock Firebase & App Stores for ConsultationChatPage test
vi.mock("../../firebase", () => ({
  firestore: null,
  auth: null
}));

vi.mock("../wallet/walletStore", () => ({
  useWalletStore: () => ({
    wallet: { priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್", priestPhone: "9972339362" }
  })
}));

vi.mock("../../stores/kundliViewerStore", () => ({
  useKundliViewerStore: () => ({
    session: null
  })
}));

vi.mock("../../stores/appStore", () => ({
  useAppStore: {
    getState: () => ({ geminiApiKey: "" })
  }
}));

const mockSession: ConsultationSession = {
  id: "bgn_testaudit123",
  name: "Ganesh Bhat",
  dob: "1994-08-20",
  tob: "08:45",
  place: "Gokarna",
  language: "kn",
  lat: 14.5479,
  lng: 74.3188,
  timezone: 5.5,
  createdAt: new Date().toISOString(),
  status: "pending",
  messages: [],
  durationMinutes: 20,
  graceDeleteMinutes: 20,
  priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  priestPhone: "9972339362"
};

vi.mock("../features/consultation/consultationDbService", () => ({
  getConsultationSession: vi.fn(async () => mockSession),
  createConsultationSession: vi.fn(),
  updateDevoteeContact: vi.fn(),
  startConsultationTimer: vi.fn(),
  expireConsultationSession: vi.fn(),
  appendConsultationMessage: vi.fn(),
  addConsultationMessage: vi.fn(),
  decodeSecureConsultationToken: vi.fn((token: string) => ({
    isValid: true,
    sessionId: token
  })),
  encodeSecureConsultationToken: vi.fn(() => "mock-token"),
  claimBonusMinute: vi.fn(),
  isValidPhoneNumber: vi.fn(() => true),
  isValidEmailAddress: vi.fn(() => true),
  recordConsultationQuestion: vi.fn(),
  submitConsultationReview: vi.fn(),
  hasUserReviewedOrDismissedSession: vi.fn(() => false),
  markSessionReviewDismissed: vi.fn()
}));

vi.mock("../features/consultation/consultationPanchangaService", () => ({
  computeDevoteePanchangaProfile: vi.fn(async () => ({
    name: "Ganesh Bhat",
    devoteeName: "Ganesh Bhat",
    dob: "1994-08-20",
    tob: "08:45",
    place: "Gokarna",
    dobFormatted: "20 Aug 1994",
    tobFormatted: "08:45 AM",
    vaara: "ಶನಿವಾರ",
    vaaraLord: "ಶನಿ",
    vaaraWithLord: "ಶನಿವಾರ (ಶನಿ)",
    janmaHora: "ಸೂರ್ಯ ಹೋರೆ",
    horaLord: "ಸೂರ್ಯ",
    tithi: "ಪೂರ್ಣಿಮಾ",
    paksha: "ಶುಕ್ಲ ಪಕ್ಷ",
    nakshatra: "ಶ್ರವಣ",
    nakshatraWithPada: "ಶ್ರವಣ (ಪಾದ ೧)",
    pada: 1,
    rashi: "ಮಕರ",
    moonRashi: "ಮಕರ",
    lagna: "ಸಿಂಹ",
    yoga: "ಶೋಭನ",
    karana: "ಬವ",
    isDeityBlessed: true,
    labels: {
      cardTitle: "॥ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆ ಜನ್ಮ ಪತ್ರಿಕೆ ॥",
      cardSubtitle: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ",
      sanctumTitle: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ • ಗೋಕರ್ಣ",
      devoteeNameLabel: "ಭಕ್ತರ ಹೆಸರು",
      placeLabel: "ಜನ್ಮ ಸ್ಥಳ",
      dobLabel: "ಜನ್ಮ ದಿನಾಂಕ",
      tobLabel: "ಜನ್ಮ ಸಮಯ",
      limbsTitle: "ಪಂಚಾಂಗ ಪಂಚಾಂಗಗಳು & ಕುಂಡಲಿ ನಿರ್ಣಯ",
      vaaraLabel: "ವಾರ",
      vaaraLordLabel: "ಅಧಿಪತಿ",
      horaLabel: "ಜನ್ಮ ಹೋರೆ",
      tithiLabel: "ತಿಥಿ",
      nakshatraLabel: "ನಕ್ಷತ್ರ & ಪಾದ",
      rashiLabel: "ಜನ್ಮ ರಾಶಿ",
      lagnaLabel: "ಜನ್ಮ ಲಗ್ನ",
      yogaLabel: "ನಿತ್ಯ ಯೋಗ",
      karanaLabel: "ಕರಣ",
      dashaLabel: "ಪ್ರಸ್ತುತ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ",
      phonePromptLabel: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      phonePlaceholder: "೧೦ ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
      startConsultationBtn: "ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ (೨೦ ನಿಮಿಷ)",
      startingBtn: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
      sacredNotice: "೨೦ ನಿಮಿಷಗಳ ಕಾಲಾವಕಾಶ • ನೇರ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಂವಾದ",
      priestTitle: "ಮುಖ್ಯ ದೈವಜ್ಞರು: ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      priestLocationPhone: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ • Ph: 9972339362",
      toggleViewShow: "ವಿವರ ವೀಕ್ಷಿಸಿ ▾",
      toggleViewHide: "ಮರೆಮಾಡಿ ▴"
    }
  }))
}));

describe("100-Year Experienced Priest Narration & Consultation UX Audit", () => {
  describe("1. isRemedyRequested Intelligence Guard", () => {
    it("returns false for questions asking about timing or outcome without remedy", () => {
      expect(isRemedyRequested("When will I get married?")).toBe(false);
      expect(isRemedyRequested("Why is my marriage getting delayed?")).toBe(false);
      expect(isRemedyRequested("ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲಿ ಮದುವೆ ಆಗುತ್ತಾ?")).toBe(false);
      expect(isRemedyRequested("ನನಗೆ ಸರ್ಕಾರಿ ನೌಕರಿ ಯಾವಾಗ ಸಿಗುತ್ತೆ?")).toBe(false);
      expect(isRemedyRequested("Will my business grow this year?")).toBe(false);
    });

    it("returns true when devotee explicitly asks for remedies, poojas, or pariharas", () => {
      expect(isRemedyRequested("What is the remedy for marriage delay?")).toBe(true);
      expect(isRemedyRequested("ವಿವಾಹಕ್ಕೆ ಏನು ಪರಿಹಾರ ಮಾಡಬೇಕು?")).toBe(true);
      expect(isRemedyRequested("ಗೋಕರ್ಣದಲ್ಲಿ ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ ಇದೆಯಾ?")).toBe(true);
      expect(isRemedyRequested("ಕುಜ ಶಾಂತಿ ಹೋಮ ಮಾಡಿಸಬೇಕಾ?")).toBe(true);
      expect(isRemedyRequested("कर्ज मुक्ति के लिए कोई उपाय बताएं")).toBe(true);
    });
  });

  describe("2. 100-Year Priest Astrological Narration & Empathy", () => {
    it("marriage inquiry (unmarried): opens with empathetic recognition of current delay and provides exact house/Dasha timing without unsolicited remedies", () => {
      const reading = buildDeterministicMarriageReading(
        mockSession,
        "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತೆ? ಏಕೆ ತಡವಾಗುತ್ತಿದೆ?",
        undefined
      );

      // Paragraph 1: Empathetic acknowledgment of current life reality (unmarried, alliance talks stalling)
      expect(reading).toContain("೧೦೦% ಖಚಿತ ಜಾತಕ ನಿರ್ಣಯ");
      expect(reading).toContain("ನೀವು ಪ್ರಸ್ತುತ ಅವಿವಾಹಿತರಾಗಿದ್ದು");
      expect(reading).toContain("ಸಂಬಂಧಗಳು ಕೊನೆಯ ಹಂತದವರೆಗೂ ಬಂದು ಕೈತಪ್ಪಿ ಹೋಗುತ್ತಿರುವುದು");
      expect(reading).toContain("೭ನೇ ಕಳತ್ರ ಭಾವ ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿ");

      // Paragraph 2: Astrological timing mechanism (upcoming Bhukti shift in 20-180 days + Gochara Guru aspect)
      expect(reading).toContain("ಮುಂದಿನ ೨೦ ರಿಂದ ೧೮೦ ದಿನಗಳ ಅವಧಿಯಲ್ಲಿ");
      expect(reading).toContain("೯೮% ರಿಂದ ೧೦೦% ರಷ್ಟು ಖಚಿತತೆಯೊಂದಿಗೆ");
      expect(reading).toContain("ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ (ಗುರು) ಅಮೃತ ದೃಷ್ಟಿ");
      expect(reading).toContain("ಯಾವುದೇ ಗೊಂದಲ ಅಥವಾ ಅನುಮಾನಕ್ಕೆ ಆಸ್ಪದವಿಲ್ಲ");

      // Strictly ZERO unsolicited remedy advertisement
      expect(reading).not.toContain("ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ");
    });

    it("marriage inquiry (with remedy requested): includes sacred Gokarna Kalyana Sankalpa and priest contact", () => {
      const reading = buildDeterministicMarriageReading(
        mockSession,
        "ಮದುವೆ ಶೀಘ್ರವಾಗಿ ಆಗಲು ಏನು ಪರಿಹಾರ ಅಥವಾ ಪೂಜೆ ಮಾಡಬೇಕು?",
        undefined
      );

      expect(reading).toContain("ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ ಪೂಜೆ");
      expect(reading).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(reading).toContain("9972339362");
    });

    it("marital discord inquiry: recognizes devotee is already married and experiencing domestic friction", () => {
      const reading = buildDeterministicMarriageReading(
        mockSession,
        "ದಾಂಪತ್ಯದಲ್ಲಿ ತುಂಬಾ ಜಗಳವಾಗುತ್ತಿದೆ, ಡಿವೋರ್ಸ್ ಆಗುತ್ತಾ?",
        undefined
      );

      expect(reading).toContain("ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ ನಿರ್ಣಯ");
      expect(reading).toContain("ನೀವು ಈಗಾಗಲೇ ವಿವಾಹಿತರಾಗಿದ್ದು");
      expect(reading).toContain("ಪರಸ್ಪರ ಹೊಂದಾಣಿಕೆಯ ಕೊರತೆ");
      expect(reading).toContain("೧೨ನೇ ಶಯನ ಸುಖ ಸ್ಥಾನ");
    });

    it("English marriage inquiry: contains 100% confident prediction, empathetic reality reflection, and zero dilemma", () => {
      const reading = buildDeterministicMarriageReading(
        { ...mockSession, language: "en" },
        "When will I get married?",
        undefined
      );

      expect(reading).toContain("100% Confident Astrological Prediction");
      expect(reading).toContain("you are currently unmarried");
      expect(reading).toContain("matrimonial alliances have repeatedly stalled at the final threshold");
      expect(reading).toContain("7th house (Kalatra Bhava)");
      expect(reading).toContain("over the next 20 to 180 days");
      expect(reading).toContain("98% to 100% mathematical certainty");
      expect(reading).toContain("zero room for doubt or dilemma in your chart");
      expect(reading).not.toContain("Kalyana Sankalpa");
    });
  });

  describe("3. Consultation UI Cleanliness, Timer, & Zero Burger Controller Guard", () => {
    it("renders compact 20:00 timer badge in top header when session is pending", async () => {
      render(<ConsultationChatPage sessionId="bgn_testaudit123" />);

      // The header timer badge should show 20:00 allocated consultation
      const timerBadges = await screen.findAllByText(/20:00/);
      expect(timerBadges.length).toBeGreaterThan(0);
    });

    it("verifies NO burger button or navigation drawer is present in the consultation link", async () => {
      const { container } = render(<ConsultationChatPage sessionId="bgn_testaudit123" />);
      await screen.findAllByText(/20:00/);

      // Strictly zero hamburger navigation button
      const burgerButtons = container.querySelectorAll('button[aria-label="Open Navigation Menu"]');
      expect(burgerButtons.length).toBe(0);

      // Strictly zero external drawer navigation
      expect(container.querySelector('[title="Super Admin Navigation Menu"]')).toBeNull();
    });
  });
});
