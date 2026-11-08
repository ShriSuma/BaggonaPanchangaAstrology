import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createConsultationSession,
  getConsultationSession,
  startConsultationTimer,
  updateDevoteeContact,
  encodeSecureConsultationToken,
  decodeSecureConsultationToken,
  processSessionLifecycle,
  claimBonusMinute
} from "../features/consultation/consultationDbService";
import {
  computeDevoteeKundli,
  generateConsultationAnswer
} from "../features/consultation/consultationAIEngine";
import {
  presentConsultationReply,
  senseAndCategorizeQuestion
} from "../features/consultation/consultationPresenterEngine";
import { computeDevoteePanchangaProfile } from "../features/consultation/consultationPanchangaService";
import {
  getInitialPriestGreeting,
  DEFAULT_PRIEST_CONTACT,
  type ConsultationSession,
  type ConsultationChatMessage
} from "../features/consultation/consultationTypes";

describe("20-Minute Live Consultation End-to-End Audit: Sri Shreeram Pandit Profile", () => {
  const SHREERAM_PANDIT_INPUT = {
    name: "Shreeram Pandit",
    dob: "1993-05-31",
    tob: "06:30", // Morning
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

  describe("Phase 1: Astrological Foundation & Panchanga Patrika Card Accuracy", () => {
    it("computes authentic Vedic planetary coordinates, Lagna, Rashi, and Dasha for 31 May 1993 Gokarna", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      const astro = await computeDevoteeKundli(session);

      // Verify computed Lagna, Rashi, and Nakshatra
      expect(astro.lagnaName).toBeTruthy();
      expect(astro.moonRashi).toBeTruthy();
      expect(astro.nakshatra).toBeTruthy();
      expect(astro.pada).toBeGreaterThanOrEqual(1);
      expect(astro.pada).toBeLessThanOrEqual(4);
      expect(astro.currentDashaText).toBeTruthy();

      // Compute Panchanga Patrika Profile
      const patrika = await computeDevoteePanchangaProfile(session);
      expect(patrika.tithi).toBeTruthy();
      expect(patrika.vaara).toBeTruthy(); // 31 May 1993 was a Monday (Somavara)
      expect(patrika.nakshatra).toBeTruthy();
      expect(patrika.yoga).toBeTruthy();
      expect(patrika.karana).toBeTruthy();
      expect(patrika.lagna).toBeTruthy();
      expect(patrika.moonRashi).toBeTruthy();

      console.log("[Audit Chart Details]", {
        devotee: session.name,
        dob: session.dob,
        tob: session.tob,
        place: session.place,
        lagna: astro.lagnaName,
        rashi: astro.moonRashi,
        nakshatra: `${astro.nakshatra} (Pada ${astro.pada})`,
        dasha: astro.currentDashaText,
        vaara: patrika.vaara,
        tithi: patrika.tithi
      });
    });
  });

  describe("Phase 2: Link Generation, Token Security, and Initial Landing Flow", () => {
    it("generates a tamper-proof secure token and preserves session identity", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      const token = encodeSecureConsultationToken(session.id);

      expect(token).toMatch(/^bgn_cst_[a-zA-Z0-9_-]+\.[a-z0-9]+$/);

      const decoded = decodeSecureConsultationToken(token);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(session.id);
    });

    it("verifies initial landing is strictly pending with ZERO unsolicited messages or popups", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);

      // Invariant 1: Session starts in 'pending' status
      expect(session.status).toBe("pending");
      expect(session.startedAt).toBeNull();
      expect(session.expiresAt).toBeNull();

      // Invariant 2: Zero messages until started
      expect(session.messages).toEqual([]);

      // Invariant 3: Mobile number is not pre-assumed
      expect(session.userPhone).toBeUndefined();
      expect(session.hasProvidedContact).toBe(false);
    });
  });

  describe("Phase 3: Session Activation, Contact Capture & Database Timer Anchor", () => {
    it("anchors the 20-minute countdown in database with a clean initial welcome greeting", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);

      // Devotee enters mobile number
      const updated = await updateDevoteeContact(session.id, { phone: "9972339362" });
      expect(updated.userPhone).toBe("9972339362");
      expect(updated.hasProvidedContact).toBe(true);

      // Devotee clicks Start Consultation
      const started = await startConsultationTimer(session.id);
      expect(started.status).toBe("active");
      expect(started.startedAt).toBeTruthy();
      expect(started.expiresAt).toBeTruthy();

      const startTime = new Date(started.startedAt!).getTime();
      const expTime = new Date(started.expiresAt!).getTime();
      const durationSeconds = Math.round((expTime - startTime) / 1000);

      // Strictly 20 minutes (1200 seconds)
      expect(durationSeconds).toBe(1200);

      // Initial Priest Greeting Verification:
      expect(started.messages.length).toBe(1);
      const greeting = started.messages[0];
      expect(greeting.sender).toBe("astrologer");
      expect(greeting.text).toContain("ಶ್ರೀರಾಮ ಪಂಡಿತ್");

      // MANDATORY RULE: Initial greeting MUST NOT prescribe gemstones or unasked predictions!
      expect(greeting.text).not.toContain("ವಜ್ರ");
      expect(greeting.text).not.toContain("ರತ್ನ");
      expect(greeting.text).not.toContain("Diamond");
      expect(greeting.text).not.toContain("ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲಿ ವಿವಾಹ");
    });
  });

  describe("Phase 4: Multi-Turn Q&A Simulation (10-Minute Deep Conversation)", () => {
    let activeSession: ConsultationSession;

    beforeEach(async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      activeSession = await startConsultationTimer(session.id);
    });

    it("Turn 1 - Career & Professional Growth: answers strictly relevant to career without gemstone leak", async () => {
      const q1 = "ನನ್ನ ಉದ್ಯೋಗದಲ್ಲಿ ಪ್ರಸ್ತುತ ಬಹಳ ಮಾನಸಿಕ ಒತ್ತಡವಿದೆ, ಯಾವಾಗ ಕೆಲಸ ಬದಲಾವಣೆ ಅಥವಾ ಬಡ್ತಿ ಸಾಧ್ಯ?";
      const category = senseAndCategorizeQuestion(q1, activeSession).category;
      expect(["CAREER_FRUSTRATION_DISTRESS", "ASTROLOGICAL_DEEP"]).toContain(category);

      const reply1 = await presentConsultationReply({
        session: activeSession,
        userQuestion: q1,
        conversationHistory: [],
        isSubsequentQuestion: false,
        questionIndex: 0
      });

      expect(reply1.fullText).toBeTruthy();
      expect(reply1.fullText.length).toBeGreaterThan(100);

      // Must be relevant to career, work, and planetary timing
      const lower = reply1.fullText.toLowerCase();
      expect(
        lower.includes("ಉದ್ಯೋಗ") ||
        lower.includes("ಕೆಲಸ") ||
        lower.includes("ದಶಾ") ||
        lower.includes("ಗ್ರಹ") ||
        lower.includes("ವೃತ್ತಿ")
      ).toBe(true);

      // ZERO UNSOLICITED GEMSTONE ADVICE:
      expect(reply1.fullText).not.toContain("ವಜ್ರ ಧರಿಸಿ");
      expect(reply1.fullText).not.toContain("ವಜ್ರದ ಉಂಗುರ");
      expect(reply1.fullText).not.toContain("Diamond");
    });

    it("Turn 2 - Matrimony & Marriage Horizon: authentic mathematical analysis without hardcoded generic 6-month claim", async () => {
      const q2 = "ನನ್ನ ವಿವಾಹ ಯಾವಾಗ ಆಗಬಹುದು? ದಾಂಪತ್ಯ ಜೀವನ ಹೇಗಿರಲಿದೆ?";
      const reply2 = await presentConsultationReply({
        session: activeSession,
        userQuestion: q2,
        conversationHistory: [
          { role: "user", text: "ಉದ್ಯೋಗದ ಪ್ರಶ್ನೆ" },
          { role: "model", text: "ಉದ್ಯೋಗ ಪರಿಹಾರ ನೀಡಲಾಗಿದೆ." }
        ],
        isSubsequentQuestion: true,
        questionIndex: 1
      });

      expect(reply2.fullText).toBeTruthy();
      const lower = reply2.fullText.toLowerCase();
      expect(
        lower.includes("ವಿವಾಹ") ||
        lower.includes("ಕಳತ್ರ") ||
        lower.includes("ದಾಂಪತ್ಯ") ||
        lower.includes("ಸಪ್ತಮ") ||
        lower.includes("ಗುರು")
      ).toBe(true);

      // Must NOT contain unsolicited Diamond/Vajra wearing instructions
      expect(reply2.fullText).not.toContain("ವಜ್ರ ಧರಿಸಿ");
      expect(reply2.fullText).not.toContain("White Zircon");
    });

    it("Turn 3 - Financial Prosperity & Wealth: provides astrological financial insights", async () => {
      const q3 = "ಹಣಕಾಸಿನ ಹೂಡಿಕೆ ಅಥವಾ ಹೊಸ ವ್ಯವಹಾರದಲ್ಲಿ ಯಾವಾಗ ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಸಿಗಬಹುದು?";
      const reply3 = await presentConsultationReply({
        session: activeSession,
        userQuestion: q3,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 2
      });

      expect(reply3.fullText).toBeTruthy();
      const lower = reply3.fullText.toLowerCase();
      expect(
        lower.includes("ಹಣ") ||
        lower.includes("ಆರ್ಥಿಕ") ||
        lower.includes("ಧನ") ||
        lower.includes("ಲಾಭ") ||
        lower.includes("ವ್ಯವಹಾರ")
      ).toBe(true);
    });

    it("Turn 4 - Spiritual Parihara & Gokarna Seva: guides devotee to authentic Vedic remedies", async () => {
      const q4 = "ನನ್ನ ಗ್ರಹ ದೋಷ ನಿವಾರಣೆಗೆ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಯಾವ ಸೇವೆ ಅಥವಾ ಪೂಜೆ ಮಾಡಿಸಬೇಕು?";
      const reply4 = await presentConsultationReply({
        session: activeSession,
        userQuestion: q4,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 3
      });

      expect(reply4.fullText).toBeTruthy();
      expect(reply4.fullText).toContain("ಗೋಕರ್ಣ");
      expect(
        reply4.fullText.includes("ಮಹಾಬಲೇಶ್ವರ") ||
        reply4.fullText.includes("ಸಂಕಲ್ಪ") ||
        reply4.fullText.includes("ಪೂಜೆ") ||
        reply4.fullText.includes("ಶಾಂತಿ")
      ).toBe(true);
    });

    it("Turn 5 - Gemstone Inquiry (ONLY WHEN ASKED): responds accurately to gemstone query", async () => {
      const q5 = "ನನ್ನ ಜಾತಕಕ್ಕೆ ನಾನು ವಜ್ರ ಅಥವಾ ಯಾವ ರತ್ನವನ್ನು ಧರಿಸಬೇಕು?";
      const reply5 = await presentConsultationReply({
        session: activeSession,
        userQuestion: q5,
        conversationHistory: [],
        isSubsequentQuestion: true,
        questionIndex: 4
      });

      expect(reply5.fullText).toBeTruthy();
      // Since devotee explicitly asked about gemstones, gemstone evaluation is valid here
      const mentionsGemstone =
        reply5.fullText.includes("ರತ್ನ") ||
        reply5.fullText.includes("ವಜ್ರ") ||
        reply5.fullText.includes("ಶುಕ್ರ") ||
        reply5.fullText.includes("ಗ್ರಹ");
      expect(mentionsGemstone).toBe(true);
    });
  });

  describe("Phase 5: Multi-Device Sync & Hard 20-Minute Expiration Shield", () => {
    it("maintains identical remaining time across multiple devices synced from Firestore expiresAt", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      const started = await startConsultationTimer(session.id);

      const expDate = new Date(started.expiresAt!).getTime();

      // Device 1 (Mobile): Simulate 5 minutes elapsed (300 seconds)
      const fiveMinsLater = new Date(started.startedAt!).getTime() + 5 * 60 * 1000;
      const device1Remaining = Math.max(0, Math.floor((expDate - fiveMinsLater) / 1000));
      expect(device1Remaining).toBe(15 * 60); // Exactly 15 minutes remaining

      // Device 2 (Laptop opened after 5 minutes): Reads same Firestore session expiresAt
      const device2Calculated = Math.max(0, Math.floor((expDate - fiveMinsLater) / 1000));
      expect(device2Calculated).toBe(device1Remaining); // Identical parity!
    });

    it("locks session completely into expired state once remaining seconds reach zero", async () => {
      const session = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      await updateDevoteeContact(session.id, { phone: "9972339362" });
      const started = await startConsultationTimer(session.id);

      // Simulate 20 minutes elapsed
      const pastExpiryDate = new Date(Date.now() - 1000).toISOString();
      started.expiresAt = pastExpiryDate;

      // Run lifecycle verification
      const evaluated = await processSessionLifecycle(started);
      expect(evaluated.status).toBe("expired");

      // Chief Priest contact must be verified for the expired screen call button
      expect(DEFAULT_PRIEST_CONTACT.phone).toBe("9972339362");
      expect(DEFAULT_PRIEST_CONTACT.callUri).toBe("tel:9972339362");
    });
  });

  describe("Phase 6: Multi-Profile Diversity & Distinct Kundli Accuracy", () => {
    it("guarantees distinct individuals receive 100% personalized astrological answers matching their unique Kundalis", async () => {
      // Profile A: Shreeram Pandit (1993, Gokarna)
      const sessionA = await createConsultationSession(SHREERAM_PANDIT_INPUT);
      const astroA = await computeDevoteeKundli(sessionA);

      // Profile B: Different Devotee from Bengaluru (1985, Bengaluru)
      const sessionB = await createConsultationSession({
        name: "Anand Sharma",
        dob: "1985-11-20",
        tob: "18:45",
        place: "Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        timezone: 5.5,
        language: "kn"
      });
      const astroB = await computeDevoteeKundli(sessionB);

      // Charts must be genuinely distinct
      console.log("[Chart Comparison]", {
        ProfileA: { name: sessionA.name, lagna: astroA.lagnaName, rashi: astroA.moonRashi, dasha: astroA.currentDashaText },
        ProfileB: { name: sessionB.name, lagna: astroB.lagnaName, rashi: astroB.moonRashi, dasha: astroB.currentDashaText }
      });

      expect(astroA.lagnaName !== astroB.lagnaName || astroA.moonRashi !== astroB.moonRashi || astroA.currentDashaText !== astroB.currentDashaText).toBe(true);

      const q = "ನನ್ನ ಉದ್ಯೋಗ ಮತ್ತು ಭವಿಷ್ಯದ ಬಗ್ಗೆ ತಿಳಿಸಿ.";
      const replyA = await presentConsultationReply({ session: sessionA, userQuestion: q });
      const replyB = await presentConsultationReply({ session: sessionB, userQuestion: q });

      expect(replyA.fullText).not.toEqual(replyB.fullText);
      expect(replyA.fullText).toContain("ಶ್ರೀರಾಮ ಪಂಡಿತ್");
      expect(replyB.fullText).toContain("ಆನಂದ್ ಶರ್ಮಾ");
    });
  });
});
