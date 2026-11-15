import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createConsultationSession,
  getConsultationSession,
  startConsultationTimer,
  updateDevoteeContact,
  addConsultationMessage,
  processSessionLifecycle,
  purgeExpiredConsultationSession,
  saveConsultationRulingsLedger
} from "../features/consultation/consultationDbService";
import {
  computeDevoteeKundli,
  generateConsultationAnswer,
  detectAndResolveUltaPaltaProbe,
  verifyAndHarmonizeWithPreviousAnswers,
  buildConsultationRulingsLedger
} from "../features/consultation/consultationAIEngine";
import { presentConsultationReply } from "../features/consultation/consultationPresenterEngine";
import type {
  ConsultationSession,
  ConsultationChatMessage,
  ConsultationRulingRecord
} from "../features/consultation/consultationTypes";

describe("20-Minute Isolated Consultation Session Memory & Ulta-Palta Anti-Contradiction Audit", () => {
  // Test Devotee with Libra (Tula) Lagna: 15 Oct 1995, 07:15 AM Gokarna
  const TULA_DEVOTEE = {
    name: "ರಾಘವೇಂದ್ರ ಭಟ್ (Raghavendra Bhat)",
    dob: "1995-10-15",
    tob: "07:15",
    place: "Gokarna",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    language: "kn" as const
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Requirement 1: 20-Minute Session Isolation & Automatic Data Clean-out", () => {
    it("strictly isolates session for 20 minutes and cleans out historical chat data once expired", async () => {
      const session = await createConsultationSession(TULA_DEVOTEE);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      const activeSession = await startConsultationTimer(session.id);

      // Verify timer is set to 20 minutes from start
      const startTime = new Date(activeSession.startedAt!).getTime();
      const expTime = new Date(activeSession.expiresAt!).getTime();
      expect(Math.round((expTime - startTime) / 1000)).toBe(1200); // 20 minutes (1200s)

      // Add questions, answers, and rulings to session
      const userMsg: ConsultationChatMessage = {
        id: "msg_user_1",
        sender: "user",
        text: "ನನ್ನ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ತಿಳಿಸಿ",
        timestamp: new Date().toISOString()
      };
      const rulings: ConsultationRulingRecord[] = [
        {
          domain: "GEMSTONE_REMEDY",
          questionSummary: "Prescribed Gemstone",
          primaryVerdict: "Diamond / White Zircon approved. Yellow Sapphire strictly prohibited for Libra Lagna.",
          approvedOptions: ["Diamond (Vajra)", "White Zircon"],
          rejectedOptions: ["Yellow Sapphire (Pushparaga / Pukhraj) - 6th lord of debts and disease for Libra"]
        }
      ];

      await addConsultationMessage(activeSession.id, userMsg, rulings);

      // Verify messages and rulings are persisted in database
      const loadedBeforeExpiry = await getConsultationSession(activeSession.id);
      expect(loadedBeforeExpiry).toBeTruthy();
      expect(loadedBeforeExpiry!.messages.length).toBeGreaterThan(0);
      expect(loadedBeforeExpiry!.rulingsLedger).toBeTruthy();
      expect(loadedBeforeExpiry!.rulingsLedger!.length).toBeGreaterThan(0);

      // Simulate 20 minutes elapsed
      activeSession.expiresAt = new Date(Date.now() - 5000).toISOString();

      // Process lifecycle after 20 minutes
      const expiredSession = await processSessionLifecycle(activeSession);
      expect(expiredSession.status).toBe("expired");

      // MANDATORY USER REQUIREMENT: After 20 minutes, historical chat data is completely cleaned out
      expect(expiredSession.messages).toEqual([]);
      expect(expiredSession.rulingsLedger).toEqual([]);

      // Security check: Expired session strictly rejects any new message append
      await expect(
        addConsultationMessage(activeSession.id, {
          id: "msg_user_late",
          sender: "user",
          text: "Can I ask another question after 20 minutes?",
          timestamp: new Date().toISOString()
        })
      ).rejects.toThrow(/expired/i);
    });
  });

  describe("Requirement 2: Persistent In-Session Memory & Database Cross-Checking", () => {
    it("persists rulings in database and checks previous determinations on subsequent questions", async () => {
      const session = await createConsultationSession(TULA_DEVOTEE);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      const activeSession = await startConsultationTimer(session.id);

      // Compute kundli and build rulings ledger
      const astroData = await computeDevoteeKundli(activeSession);
      const ledger = buildConsultationRulingsLedger([], activeSession, astroData);

      expect(ledger.length).toBeGreaterThan(0);
      const gemRecord = ledger.find((r) => r.domain === "GEMSTONE_REMEDY");
      expect(gemRecord).toBeTruthy();
      // For Libra Lagna, Yellow Sapphire (Pushparaga) MUST be rejected as 6th lord
      expect(gemRecord!.rejectedOptions.some((opt) => /yellow sapphire|pushparaga|ಪುಷ್ಯರಾಗ/i.test(opt))).toBe(true);

      // Save rulings ledger to database
      await saveConsultationRulingsLedger(activeSession.id, ledger);

      // Reload from database and verify persistence
      const reloaded = await getConsultationSession(activeSession.id);
      expect(reloaded!.rulingsLedger).toBeTruthy();
      expect(reloaded!.rulingsLedger!.length).toBe(ledger.length);
    });
  });

  describe("Requirement 3: Ulta-Palta & Reverse Query Anti-Contradiction Consistency", () => {
    let activeSession: ConsultationSession;
    let ledger: ConsultationRulingRecord[];

    beforeEach(async () => {
      const session = await createConsultationSession(TULA_DEVOTEE);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      activeSession = await startConsultationTimer(session.id);

      const astroData = await computeDevoteeKundli(activeSession);
      // Simulate that Abroad, Property, Marriage, Business, and Debt rulings were established in the session
      ledger = buildConsultationRulingsLedger(
        [
          { role: "user", text: "ವಿದೇಶದಲ್ಲಿ ನೆಲೆಸಬಹುದೇ?" },
          { role: "model", text: "ಸ್ವದೇಶದಲ್ಲೇ (ಭಾರತದಲ್ಲೇ) ನೆಲೆಸುವುದು ಶ್ರೇಷ್ಠ." },
          { role: "user", text: "ವಿವಾಹ ಯಾವಾಗ?" },
          { role: "model", text: "ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲಿ ವಿವಾಹ ಯೋಗ ಶತಸಿದ್ಧ." },
          { role: "user", text: "ವ್ಯಾಪಾರ ಮಾಡಬಹುದೇ?" },
          { role: "model", text: "ಸ್ವಂತ ಮಾಲೀಕತ್ವದಲ್ಲಿ ವ್ಯಾಪಾರ ಮಾಡಿ, ಪಾಲುದಾರಿಕೆ ಬೇಡ." }
        ],
        activeSession,
        astroData
      );
      activeSession.rulingsLedger = ledger;
      await saveConsultationRulingsLedger(activeSession.id, ledger);
    });

    it("Probe 1 - Gemstones Ulta-Palta: Firmly rejects Pushparaga (Yellow Sapphire) for Libra Lagna even if asked 'just for 1 month'", async () => {
      const ultaPaltaQ = "ನಾನು ಕೇವಲ ಒಂದು ತಿಂಗಳಿಗಾಗಿ ಹಳದಿ ಪುಷ್ಯರಾಗ ರತ್ನವನ್ನು ಧರಿಸಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: ultaPaltaQ,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 1
      });

      expect(reply.fullText).toBeTruthy();
      expect(reply.fullText).toContain("ಪುಷ್ಯರಾಗ");
      expect(
        reply.fullText.includes("ಧರಿಸಬಾರದು") ||
        reply.fullText.includes("ನಿಷೇಧ") ||
        reply.fullText.includes("ವರ್ಜಿತ") ||
        reply.fullText.includes("STRICTLY PROHIBITED")
      ).toBe(true);
      // Confirms Venus Lagna stone (Diamond / White Zircon) as sole authentic stone
      expect(
        reply.fullText.includes("ವಜ್ರ") ||
        reply.fullText.includes("ಜಿರ್ಕಾನ್") ||
        reply.fullText.includes("Diamond")
      ).toBe(true);
    });

    it("Probe 2 - Abroad Settlement Ulta-Palta: Firmly reinforces Swadesha (India) when devotee asks about permanent Canada/Germany PR", async () => {
      const ultaPaltaAbroadQ = "ನನಗೆ ಕೆನಡಾ ಅಥವಾ ಜರ್ಮನಿ ಪಿಆರ್ ಸಿಕ್ಕರೆ ಅಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ನೆಲೆಸಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: ultaPaltaAbroadQ,
        conversationHistory: [
          { role: "user", text: "ವಿದೇಶದಲ್ಲಿ ನೆಲೆಸಬಹುದೇ?" },
          { role: "model", text: "ಸ್ವದೇಶದಲ್ಲೇ ನೆಲೆಸುವುದು ಶ್ರೇಷ್ಠ." }
        ],
        isSubsequentQuestion: true,
        questionIndex: 2
      });

      expect(reply.fullText).toBeTruthy();
      // Must uphold prior ruling: Swadesha / India is best, permanent foreign settlement is unfavorable
      expect(
        reply.fullText.includes("ಸ್ವದೇಶ") ||
        reply.fullText.includes("ಭಾರತ") ||
        reply.fullText.includes("Swadesha") ||
        reply.fullText.includes("India")
      ).toBe(true);
      expect(
        reply.fullText.includes("ಶಾಶ್ವತ") ||
        reply.fullText.includes("ಅಶುಭ") ||
        reply.fullText.includes("unfavorable") ||
        reply.fullText.includes("ನಿಷೇಧ")
      ).toBe(true);
    });

    it("Probe 3 - Marriage Timing Ulta-Palta: Dispels pessimism and firmly maintains 6-month window when devotee asks 'Will marriage take 3 years?'", async () => {
      const ultaPaltaMarriageQ = "ನನ್ನ ಮದುವೆ ಆಗಲು ೩ ವರ್ಷ ತಡವಾಗುತ್ತದೆಯೇ? ಖಚಿತವಾಗಿ ಆಗುತ್ತದೆಯೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: ultaPaltaMarriageQ,
        conversationHistory: [
          { role: "user", text: "ವಿವಾಹ ಯಾವಾಗ?" },
          { role: "model", text: "ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲಿ ವಿವಾಹ ಯೋಗ ಶತಸಿದ್ಧ." }
        ],
        isSubsequentQuestion: true,
        questionIndex: 3
      });

      expect(reply.fullText).toBeTruthy();
      // Must maintain 100% confidence with zero dilemma
      expect(
        reply.fullText.includes("೬ ತಿಂಗಳ") ||
        reply.fullText.includes("6 months") ||
        reply.fullText.includes("ಶತಸಿದ್ಧ") ||
        reply.fullText.includes("ವಿವಾಹ")
      ).toBe(true);
      expect(
        reply.fullText.includes("೩ ವರ್ಷ ವಿಳಂಬವಾಗುವುದಿಲ್ಲ") ||
        reply.fullText.includes("NOT be delayed") ||
        reply.fullText.includes("ವಿಳಂಬವಾಗುವುದಿಲ್ಲ")
      ).toBe(true);
    });

    it("Probe 4 - Business Partnership Ulta-Palta: Strictly rejects 50-50 partnership and upholds sole proprietorship", async () => {
      const ultaPaltaPartnershipQ = "ನನ್ನ ಆಪ್ತ ಸ್ನೇಹಿತನ ಜತೆ ೫೦-೫೦ ಪಾಲುದಾರಿಕೆ (partnership) ವ್ಯಾಪಾರ ಮಾಡಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: ultaPaltaPartnershipQ,
        conversationHistory: [
          { role: "user", text: "ವ್ಯಾಪಾರ ಮಾಡಬಹುದೇ?" },
          { role: "model", text: "ಸ್ವಂತ ಮಾಲೀಕತ್ವದಲ್ಲಿ ವ್ಯಾಪಾರ ಮಾಡಿ." }
        ],
        isSubsequentQuestion: true,
        questionIndex: 4
      });

      expect(reply.fullText).toBeTruthy();
      expect(
        reply.fullText.includes("ಪಾಲುದಾರಿಕೆ") ||
        reply.fullText.includes("partnership")
      ).toBe(true);
      expect(
        reply.fullText.includes("ನಿಷೇಧ") ||
        reply.fullText.includes("STRICTLY PROHIBITED") ||
        reply.fullText.includes("ವರ್ಜಿತ") ||
        reply.fullText.includes("ಬೇಡ")
      ).toBe(true);
      expect(
        reply.fullText.includes("ಸ್ವತಂತ್ರ ಮಾಲೀಕತ್ವ") ||
        reply.fullText.includes("Sole Proprietorship") ||
        reply.fullText.includes("ಸ್ವಂತ")
      ).toBe(true);
    });

    it("Probe 5 - Health & Medicine Ulta-Palta: Strictly rejects stopping doctor's medicine and commands continuing medical treatment", async () => {
      const stopMedicineQ = "ನಾನು ವೈದ್ಯರ ಔಷಧಗಳನ್ನು ನಿಲ್ಲಿಸಿ ಕೇವಲ ಗೋಕರ್ಣ ಪೂಜೆ ಮತ್ತು ಹೋಮ ಮಾತ್ರ ಮಾಡಿಸಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: stopMedicineQ,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 5
      });

      expect(reply.fullText).toBeTruthy();
      expect(
        reply.fullText.includes("ಔಷಧ") ||
        reply.fullText.includes("medicine") ||
        reply.fullText.includes("ವೈದ್ಯ")
      ).toBe(true);
      expect(
        reply.fullText.includes("ನಿಲ್ಲಿಸಬಾರದು") ||
        reply.fullText.includes("NEVER discontinue") ||
        reply.fullText.includes("ಬಾರದು")
      ).toBe(true);
    });

    it("Probe 6 - Speculative Debt Ulta-Palta: Strictly warns against taking fresh speculative loans", async () => {
      const freshDebtQ = "ಹಳೆಯ ಸಾಲ ತೀರಿಸಲು ಮತ್ತೊಂದು ಹೊಸ ಸಾಲ ಅಥವಾ ಹೆಚ್ಚಿನ ಬಡ್ಡಿಯ ಸಾಲ ಮಾಡಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: freshDebtQ,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 6
      });

      expect(reply.fullText).toBeTruthy();
      expect(
        reply.fullText.includes("ಸಾಲ") ||
        reply.fullText.includes("debt") ||
        reply.fullText.includes("loan")
      ).toBe(true);
      expect(
        reply.fullText.includes("ವಿರೋಧಿಸುತ್ತದೆ") ||
        reply.fullText.includes("warned against") ||
        reply.fullText.includes("ಬಾರದು") ||
        reply.fullText.includes("ನಿಷೇಧ")
      ).toBe(true);
    });

    it("Probe 7 - Disputed Land Ulta-Palta: Strictly rejects purchasing litigation property", async () => {
      const disputedLandQ = "ಕೋರ್ಟ್ ವ್ಯಾಜ್ಯವಿರುವ ವಿವಾದಿತ ಜಮೀನನ್ನು ಕಡಿಮೆ ಬೆಲೆಗೆ ಸಿಗುತ್ತದೆ ಎಂದು ಖರೀದಿಸಬಹುದೇ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: disputedLandQ,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 7
      });

      expect(reply.fullText).toBeTruthy();
      expect(
        reply.fullText.includes("ವಿವಾದಿತ") ||
        reply.fullText.includes("disputed") ||
        reply.fullText.includes("ಆಸ್ತಿ")
      ).toBe(true);
      expect(
        reply.fullText.includes("ನಿಷೇಧ") ||
        reply.fullText.includes("PROHIBITED") ||
        reply.fullText.includes("ಬೇಡ")
      ).toBe(true);
    });
  });

  describe("Requirement 4: Detail Richness & Layperson Comprehensibility", () => {
    it("guarantees answers have sufficient depth (at least 2 rich paragraphs) with planetary logic, timeline, and remedies", async () => {
      const session = await createConsultationSession(TULA_DEVOTEE);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      const activeSession = await startConsultationTimer(session.id);

      const q = "ನನ್ನ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಮುಂದಿನ ೧-೨ ವರ್ಷಗಳಲ್ಲಿ ಯಾವ ಪ್ರಮುಖ ತಿರುವು ಮತ್ತು ಆರ್ಥಿಕ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದೆ?";
      const reply = await presentConsultationReply({
        session: activeSession,
        userQuestion: q,
        conversationHistory: [],
        isSubsequentQuestion: false,
        questionIndex: 0
      });

      expect(reply.fullText).toBeTruthy();
      // Must not be a short, cryptic response (at least 200 characters)
      expect(reply.fullText.length).toBeGreaterThan(200);

      // Must have at least 2 structured paragraphs
      expect(reply.paragraphs.length).toBeGreaterThanOrEqual(2);

      // Must contain devotee name, astrological grounding, and blessings
      expect(reply.fullText).toContain("ರಾಘವೇಂದ್ರ");
      expect(
        reply.fullText.includes("ಲಗ್ನ") ||
        reply.fullText.includes("ರಾಶಿ") ||
        reply.fullText.includes("ದಶಾ") ||
        reply.fullText.includes("ಗ್ರಹ")
      ).toBe(true);
      expect(reply.fullText).toContain("ಗೋಕರ್ಣ");
    });
  });
});
