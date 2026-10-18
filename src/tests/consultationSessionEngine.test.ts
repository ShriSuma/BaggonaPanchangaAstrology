import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CONSULTATION_LANGUAGES,
  DEFAULT_PRIEST_CONTACT,
  CONSULTATION_MODAL_I18N,
  type ConsultationLanguage,
  type ConsultationSession,
  type ConsultationQuestionRecord,
  type ConsultationReview
} from "../features/consultation/consultationTypes";
import {
  generateSessionToken,
  createConsultationSession,
  getConsultationSession,
  startConsultationTimer,
  expireConsultationSession,
  deleteConsultationSession,
  addConsultationMessage,
  updateDevoteeContact,
  claimBonusMinute,
  encodeSecureConsultationToken,
  decodeSecureConsultationToken,
  isValidPhoneNumber,
  isValidEmailAddress,
  recordConsultationQuestion,
  listAllConsultationQuestions,
  submitConsultationReview,
  listAllConsultationReviews,
  hasUserReviewedOrDismissedSession,
  markSessionReviewDismissed,
  getConsultationTelemetry
} from "../features/consultation/consultationDbService";
import {
  computeDevoteeKundli,
  generateConsultationAnswer,
  detectRelevantQuestionDosha,
  CONSULTATION_LANG_NAMES
} from "../features/consultation/consultationAIEngine";
import {
  ContinuousSpeechEngine,
  LANGUAGE_SPEECH_LOCALES
} from "../features/consultation/consultationSpeechService";
import {
  computeDevoteePanchangaProfile,
  VAARA_I18N,
  TITHI_NAMES_I18N,
  NAKSHATRAS_I18N,
  RASHIS_I18N,
  YOGAS_I18N,
  KARANAS_I18N,
  PANCHANGA_PATRIKA_LABELS_I18N
} from "../features/consultation/consultationPanchangaService";

describe("Baggona 20-Minute Consultation Engine Test Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("1. Languages & Priest Contact Specifications", () => {
    it("supports all 7 mandatory languages with proper speech locales", () => {
      const expectedLangs: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];
      const actualCodes = CONSULTATION_LANGUAGES.map((l) => l.code);
      expect(actualCodes).toEqual(expect.arrayContaining(expectedLangs));
      expect(CONSULTATION_LANGUAGES.length).toBe(7);

      expectedLangs.forEach((code) => {
        const meta = CONSULTATION_LANGUAGES.find((l) => l.code === code);
        expect(meta).toBeDefined();
        expect(meta?.nativeName).toBeTruthy();
        expect(meta?.speechLocale).toMatch(/^[a-z]{2}-IN$/);
        expect(meta?.sampleGreeting).toBeTruthy();
        expect(LANGUAGE_SPEECH_LOCALES[code]).toBe(meta?.speechLocale);
        expect(CONSULTATION_LANG_NAMES[code]).toBeTruthy();
      });
    });

    it("verifies Shreeram Pandit Gokarna priest contact details (direct call, NO whatsapp)", () => {
      expect(DEFAULT_PRIEST_CONTACT.phone).toBe("9972339362");
      expect(DEFAULT_PRIEST_CONTACT.name).toContain("Shreeram Pandit");
      expect(DEFAULT_PRIEST_CONTACT.gokarnaLocation).toContain("Gokarna");
      expect(DEFAULT_PRIEST_CONTACT.callUri).toBe("tel:9972339362");
      // Explicit requirement: "NO WhatsApp link, I am not in WhatsApp."
      expect((DEFAULT_PRIEST_CONTACT as any).whatsappUri).toBeUndefined();
    });

    it("verifies 7-language modal i18n copy completeness", () => {
      const langs: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];
      langs.forEach((lang) => {
        const copy = CONSULTATION_MODAL_I18N[lang];
        expect(copy).toBeDefined();
        expect(copy.contactModalTitle).toBeTruthy();
        expect(copy.phoneLabel).toBeTruthy();
        expect(copy.emailLabel).toBeTruthy();
        expect(copy.timerModalTitle).toBeTruthy();
        expect(copy.timerModalWarning).toMatch(/20|೨೦|२०/);
        expect(copy.timerModalStrictCondition).toBeTruthy();
        expect(copy.startTimerBtn).toBeTruthy();
        expect(copy.callPriestBtn).toContain("9972339362");
        expect(copy.tamperedLinkTitle).toBeTruthy();
      });
    });
  });

  describe("2. Tamper-Proof Cryptographic Token Encoding", () => {
    it("encodes session ID into encrypted string and successfully decodes", () => {
      const sessionId = "bgn_cst_9f8a2b3c";
      const encoded = encodeSecureConsultationToken(sessionId);

      expect(encoded).toMatch(/^bgn_cst_[A-Za-z0-9_-]+\.[a-z0-9]+$/);
      expect(encoded).not.toContain(sessionId); // Obfuscated

      const decoded = decodeSecureConsultationToken(encoded);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(sessionId);
    });

    it("rejects token immediately if even 1 single character is tampered or changed", () => {
      const sessionId = "bgn_cst_test1234";
      const encoded = encodeSecureConsultationToken(sessionId);

      // Modify one character in the payload
      const parts = encoded.split(".");
      const alteredPayload = parts[0].slice(0, -1) + (parts[0].slice(-1) === "a" ? "b" : "a");
      const tamperedToken = `${alteredPayload}.${parts[1]}`;

      const decoded = decodeSecureConsultationToken(tamperedToken);
      expect(decoded.isValid).toBe(false);
      expect(decoded.sessionId).toBeNull();
      expect(decoded.error).toContain("mismatch");
    });

    it("rejects corrupted tokens with invalid format", () => {
      expect(decodeSecureConsultationToken("invalid_random_string").isValid).toBe(false);
      expect(decodeSecureConsultationToken("bgn_cst_malformed").isValid).toBe(false);
    });
  });

  describe("3. Contact Validation & Profile Update", () => {
    it("validates Indian and international phone numbers correctly", () => {
      expect(isValidPhoneNumber("9876543210")).toBe(true);
      expect(isValidPhoneNumber("+919876543210")).toBe(true);
      expect(isValidPhoneNumber("09876543210")).toBe(true);
      expect(isValidPhoneNumber("+14155552671")).toBe(true);

      // Invalid phones
      expect(isValidPhoneNumber("12345")).toBe(false);
      expect(isValidPhoneNumber("abcdefghij")).toBe(false);
      expect(isValidPhoneNumber("")).toBe(false);
    });

    it("validates email addresses correctly", () => {
      expect(isValidEmailAddress("devotee@example.com")).toBe(true);
      expect(isValidEmailAddress("shri.pandit@gokarna.org")).toBe(true);

      // Invalid emails
      expect(isValidEmailAddress("notanemail")).toBe(false);
      expect(isValidEmailAddress("devotee@")).toBe(false);
      expect(isValidEmailAddress("")).toBe(false);
    });

    it("updates devotee contact info in session profile and sets hasProvidedContact flag", async () => {
      const session = await createConsultationSession({
        name: "Suresh Hegde",
        dob: "1988-06-20",
        tob: "08:45",
        place: "Sirsi",
        language: "kn"
      });

      expect(session.hasProvidedContact).toBe(false);
      expect(session.userPhone).toBeUndefined();

      const updated = await updateDevoteeContact(session.id, {
        phone: "9876543210",
        email: "suresh@example.com"
      });

      expect(updated.hasProvidedContact).toBe(true);
      expect(updated.userPhone).toBe("9876543210");
      expect(updated.userEmail).toBe("suresh@example.com");

      // Verify retrieval from storage
      const fetched = await getConsultationSession(session.id);
      expect(fetched?.hasProvidedContact).toBe(true);
      expect(fetched?.userPhone).toBe("9876543210");
    });
  });

  describe("4. Timer Activation, Multi-Browser DB Sync & Bonus Extension", () => {
    it("starts 20-minute countdown when user clicks start", async () => {
      const baseSession = await createConsultationSession({
        name: "Raghavendra Sharma",
        dob: "1988-11-20",
        tob: "14:15",
        place: "Bengaluru",
        language: "kn"
      });

      const startTime = new Date("2026-10-18T10:00:00.000Z");
      vi.setSystemTime(startTime);

      const activeSession = await startConsultationTimer(baseSession.id);
      expect(activeSession.status).toBe("active");
      expect(activeSession.startedAt).toBe(startTime.toISOString());

      // Exactly 20 minutes for expiresAt
      const expectedExpiry = new Date("2026-10-18T10:20:00.000Z").toISOString();
      expect(activeSession.expiresAt).toBe(expectedExpiry);

      // Exactly 40 minutes for deleteAt (20m session + 20m grace)
      const expectedDelete = new Date("2026-10-18T10:40:00.000Z").toISOString();
      expect(activeSession.deleteAt).toBe(expectedDelete);
    });

    it("verifies multi-browser timing consistency based on database startedAt", async () => {
      const baseSession = await createConsultationSession({
        name: "Prasad Bhat",
        dob: "1990-03-12",
        tob: "11:00",
        place: "Gokarna",
        language: "kn"
      });

      const startTime = new Date("2026-10-18T10:00:00.000Z");
      vi.setSystemTime(startTime);
      await startConsultationTimer(baseSession.id);

      // Client 1 (Chrome) used 4 minutes -> 16 minutes remaining
      vi.setSystemTime(new Date("2026-10-18T10:04:00.000Z"));
      const chromeCheck = await getConsultationSession(baseSession.id);
      const chromeRemaining = Math.floor((new Date(chromeCheck!.expiresAt!).getTime() - Date.now()) / 1000);
      expect(chromeRemaining).toBe(16 * 60);

      // Client 2 (Mozilla opened 1 min later) -> 15 minutes remaining
      vi.setSystemTime(new Date("2026-10-18T10:05:00.000Z"));
      const mozillaCheck = await getConsultationSession(baseSession.id);
      const mozillaRemaining = Math.floor((new Date(mozillaCheck!.expiresAt!).getTime() - Date.now()) / 1000);
      expect(mozillaRemaining).toBe(15 * 60);
    });

    it("successfully claims bonus +1 minute extension (extending from 20m to 21m)", async () => {
      const session = await createConsultationSession({
        name: "Mahesh Patil",
        dob: "1987-04-18",
        tob: "16:20",
        place: "Dharwad",
        language: "kn"
      });

      const startTime = new Date("2026-10-18T10:00:00.000Z");
      vi.setSystemTime(startTime);
      await startConsultationTimer(session.id);

      // Advance clock to 19 minutes and 50 seconds (10 seconds remaining!)
      vi.setSystemTime(new Date("2026-10-18T10:19:50.000Z"));

      const extended = await claimBonusMinute(session.id);
      expect(extended.durationMinutes).toBe(21);
      expect(extended.bonusMinuteClaimed).toBe(true);

      // Expiry pushed by +60 seconds (10:21:00)
      const expectedNewExpiry = new Date("2026-10-18T10:21:00.000Z").toISOString();
      expect(extended.expiresAt).toBe(expectedNewExpiry);

      // Bonus cannot be claimed twice
      const secondClaim = await claimBonusMinute(session.id);
      expect(secondClaim.expiresAt).toBe(expectedNewExpiry);
    });

    it("automatically deactivates and expires link when 20 minutes elapse", async () => {
      const baseSession = await createConsultationSession({
        name: "Venkatesh Rao",
        dob: "1985-04-10",
        tob: "06:45",
        place: "Hubballi",
        language: "kn"
      });

      const startTime = new Date("2026-10-18T10:00:00.000Z");
      vi.setSystemTime(startTime);
      await startConsultationTimer(baseSession.id);

      // Advance clock to 20 minutes and 1 second -> Automatically marks expired!
      vi.setSystemTime(new Date("2026-10-18T10:20:01.000Z"));
      const expiredSession = await getConsultationSession(baseSession.id);
      expect(expiredSession?.status).toBe("expired");
    });
  });

  describe("5. Astrological Precision & Response Standards", () => {
    it("computes authentic Vedic Kundli parameters for devotee", async () => {
      const session = await createConsultationSession({
        name: "B.V. Raman Test",
        dob: "1912-08-08",
        tob: "19:38",
        place: "Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        language: "kn"
      });

      const result = await computeDevoteeKundli(session);
      expect(result.kundli).toBeDefined();
      expect(result.lagnaName).toBeTruthy();
      expect(result.moonRashi).toBeTruthy();
      expect(result.nakshatra).toBeTruthy();
      expect(result.pada).toBeGreaterThanOrEqual(1);
      expect(result.pada).toBeLessThanOrEqual(4);
      expect(result.currentDashaText).toContain("Mahadasha");
      expect(result.planetsSummary.length).toBeGreaterThan(50);
    });

    it("generates 4 paragraphs with dedicated Gokarna Parihara chapter when dosha is detected", async () => {
      const session = await createConsultationSession({
        name: "Suresh Bhat",
        dob: "1984-12-05",
        tob: "07:30",
        place: "Gokarna",
        lat: 14.5479,
        lng: 74.3188,
        language: "kn"
      });

      const answer = await generateConsultationAnswer({
        session,
        userQuestion: "ನನ್ನ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಉನ್ನತಿ ಯಾವಾಗ?",
        apiKey: ""
      });

      expect(answer.hasDosha).toBe(true);
      expect(answer.paragraphs.length).toBe(4);
      expect(answer.fullText).toMatch(/ಬಗ್ಗೋಣ ಪಂಚಾಂಗ|ಗೋಕರ್ಣ/);
      expect(answer.fullText).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ");
      expect(answer.fullText).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(answer.fullText).toMatch(/9972339362|೯೯೭೨೩೩೯೩೬೨/);
    });

    it("generates exactly 3 or 4 paragraphs adhering to Vedic rules in fallback mode", async () => {
      const session = await createConsultationSession({
        name: "Devotee Test",
        dob: "1995-05-15",
        tob: "12:00",
        place: "Udupi",
        lat: 13.3409,
        lng: 74.7421,
        language: "en"
      });

      const answer = await generateConsultationAnswer({
        session,
        userQuestion: "What are some general spiritual practices for peace?",
        apiKey: ""
      });

      if (!answer.hasDosha) {
        expect(answer.paragraphs.length).toBe(3);
      } else {
        expect(answer.paragraphs.length).toBe(4);
      }
      expect(answer.fullText.length).toBeGreaterThan(100);
    });
  });

  describe("6. Devotee Question Tracking & Firestore Ingestion (`consultation_questions`)", () => {
    it("records devotee question and retrieves from listAllConsultationQuestions", async () => {
      const sampleQuestion: ConsultationQuestionRecord = {
        id: "q_test_001",
        sessionId: "bgn_cst_session123",
        userId: "9876543210",
        userName: "Suresh Hegde",
        userPhone: "9876543210",
        userEmail: "suresh@example.com",
        question: "ನನಗೆ ಸರ್ಕಾರಿ ಕೆಲಸ ಸಿಗುವುದೇ?",
        answerSnippet: "ಲಗ್ನಾಧಿಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ಮುಂಬರುವ ಗುರು ಸಂಚಾರದಲ್ಲಿ ಯಶಸ್ಸು...",
        hasDosha: true,
        doshaName: "ಕಾಲಸರ್ಪ ದೋಷ",
        doshaParihara: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಸರ್ಪಶಾಂತಿ ಹೋಮ",
        language: "kn",
        timestamp: new Date().toISOString()
      };

      await recordConsultationQuestion(sampleQuestion);

      const all = await listAllConsultationQuestions();
      expect(all.length).toBeGreaterThanOrEqual(1);

      const found = all.find((q) => q.id === "q_test_001");
      expect(found).toBeDefined();
      expect(found?.userName).toBe("Suresh Hegde");
      expect(found?.hasDosha).toBe(true);
      expect(found?.doshaName).toBe("ಕಾಲಸರ್ಪ ದೋಷ");
      expect(found?.doshaParihara).toContain("ಗೋಕರ್ಣ");
    });
  });

  describe("7. 5-Star Rating & Feedback Review System (`consultation_reviews`)", () => {
    it("submits 5-star review and updates status to reviewed", async () => {
      const review: ConsultationReview = {
        id: "rev_test_001",
        sessionId: "bgn_cst_session123",
        userId: "9876543210",
        userName: "Suresh Hegde",
        userPhone: "9876543210",
        rating: 5,
        feedbackText: "ಅದ್ಭುತ ನಿಖರ ಭವಿಷ್ಯ ಮತ್ತು ಗೋಕರ್ಣ ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶನ!",
        timestamp: new Date().toISOString()
      };

      expect(hasUserReviewedOrDismissedSession("bgn_cst_session123")).toBe(false);

      await submitConsultationReview(review);

      expect(hasUserReviewedOrDismissedSession("bgn_cst_session123")).toBe(true);

      const allReviews = await listAllConsultationReviews();
      const found = allReviews.find((r) => r.id === "rev_test_001");
      expect(found).toBeDefined();
      expect(found?.rating).toBe(5);
      expect(found?.feedbackText).toContain("ಅದ್ಭುತ");
    });

    it("marks review modal as dismissed so devotee is never pestered again", () => {
      const sessionId = "bgn_cst_dismiss_test";
      expect(hasUserReviewedOrDismissedSession(sessionId)).toBe(false);

      markSessionReviewDismissed(sessionId);

      expect(hasUserReviewedOrDismissedSession(sessionId)).toBe(true);
    });
  });

  describe("8. Super Admin & Priest Telemetry Dashboard Aggregation", () => {
    it("aggregates total devotees, questions per user, and average star rating", async () => {
      const session = await createConsultationSession({
        name: "Anand Nayak",
        dob: "1992-09-14",
        tob: "10:15",
        place: "Kumta",
        language: "kn"
      });

      await recordConsultationQuestion({
        id: "q_anand_1",
        sessionId: session.id,
        userId: "9988776655",
        userName: "Anand Nayak",
        userPhone: "9988776655",
        question: "ನನ್ನ ವಿವಾಹ ಯಾವಾಗ ಆಗುವುದು?",
        answerSnippet: "7ನೇ ಭಾವದಲ್ಲಿ ಕುಜ ಪ್ರಭಾವ...",
        hasDosha: true,
        doshaName: "ಕುಜ ದೋಷ",
        doshaParihara: "ಕುಜ ಶಾಂತಿ ಹೋಮ",
        language: "kn",
        timestamp: new Date().toISOString()
      });

      await recordConsultationQuestion({
        id: "q_anand_2",
        sessionId: session.id,
        userId: "9988776655",
        userName: "Anand Nayak",
        userPhone: "9988776655",
        question: "ವ್ಯಾಪಾರದಲ್ಲಿ ಹೂಡಿಕೆ ಮಾಡಬಹುದೇ?",
        answerSnippet: "ಗುರು ಸಂಚಾರದ ಶುಭ ಕಾಲ...",
        hasDosha: false,
        language: "kn",
        timestamp: new Date().toISOString()
      });

      await submitConsultationReview({
        id: "rev_anand",
        sessionId: session.id,
        userId: "9988776655",
        userName: "Anand Nayak",
        userPhone: "9988776655",
        rating: 5,
        feedbackText: "ಖಂಡಿತ ಪೂಜೆ ಮಾಡಿಸುತ್ತೇನೆ",
        timestamp: new Date().toISOString()
      });

      const telemetry = await getConsultationTelemetry();

      expect(telemetry.totalQuestions).toBeGreaterThanOrEqual(2);
      expect(telemetry.totalReviews).toBeGreaterThanOrEqual(1);
      expect(telemetry.averageRating).toBeGreaterThanOrEqual(1);
      expect(telemetry.averageRating).toBeLessThanOrEqual(5);

      const anandGroup = telemetry.questionsByDevotee.find((g) => g.userName === "Anand Nayak");
      expect(anandGroup).toBeDefined();
      expect(anandGroup?.totalQuestions).toBe(2);
      expect(anandGroup?.questions.some((q) => q.hasDosha)).toBe(true);
    });
  });

  describe("8. Sacred Devotee Panchanga Patrika & 50+ Year Priest Persona", () => {
    const mockSessionBase: ConsultationSession = {
      id: "bgn_cst_panchanga_test",
      name: "ರಮೇಶ್ ಭಟ್ (Ramesh Bhat)",
      dob: "1994-06-15",
      tob: "08:30",
      place: "Kumta, Karnataka",
      lat: 14.4258,
      lng: 74.4174,
      timezone: 5.5,
      language: "kn" as ConsultationLanguage,
      durationMinutes: 20,
      graceDeleteMinutes: 20,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      hasProvidedContact: false,
      bonusMinuteClaimed: false,
      messages: [],
      priestName: "Shreeram Pandit",
      priestPhone: "9972339362"
    };

    it("accurately computes 5 sacred Panchanga limbs + Lagna + Dasha for Kannada locale", async () => {
      const profile = await computeDevoteePanchangaProfile(mockSessionBase);

      expect(profile.devoteeName).toBe("ರಮೇಶ್ ಭಟ್ (Ramesh Bhat)");
      expect(profile.dob).toBe("1994-06-15");
      expect(profile.tob).toBe("08:30");
      expect(profile.place).toBe("Kumta, Karnataka");

      // Vaara
      expect(profile.vaara).toContain("ವಾರ");
      expect(profile.vaaraRaw).toBe("Wednesday");

      // Tithi
      expect(profile.tithi).toBeTruthy();
      expect(profile.tithi).toMatch(/ಪಕ್ಷ/);

      // Nakshatra & Pada
      expect(profile.nakshatra).toBeTruthy();
      expect(profile.pada).toBeGreaterThanOrEqual(1);
      expect(profile.pada).toBeLessThanOrEqual(4);
      expect(profile.nakshatraWithPada).toMatch(/ಪಾದ/);

      // Rashi & Lagna
      expect(profile.rashi).toBe("ಸಿಂಹ");
      expect(profile.lagna).toBeTruthy();

      // Nitya Yoga & Karana
      expect(profile.yoga).toBeTruthy();
      expect(profile.karana).toBeTruthy();

      // Running Dasha-Bhukti
      expect(profile.currentDasha).toMatch(/ದಶಾ/);
    });

    it("verifies pure 7-language localization with zero English token leakage into Indic scripts", async () => {
      const targetLangs: ConsultationLanguage[] = ["kn", "hi", "te", "ta", "ml", "mr", "en"];

      for (const lang of targetLangs) {
        const localizedSession = { ...mockSessionBase, language: lang };
        const profile = await computeDevoteePanchangaProfile(localizedSession);

        expect(profile.vaara).toBeTruthy();
        expect(profile.tithi).toBeTruthy();
        expect(profile.nakshatra).toBeTruthy();
        expect(profile.rashi).toBeTruthy();
        expect(profile.lagna).toBeTruthy();
        expect(profile.yoga).toBeTruthy();
        expect(profile.karana).toBeTruthy();
        expect(profile.currentDasha).toBeTruthy();

        const labels = PANCHANGA_PATRIKA_LABELS_I18N[lang];
        expect(labels.cardTitle).toBeTruthy();
        expect(labels.cardSubtitle).toBeTruthy();
        expect(labels.vaaraLabel).toBeTruthy();
        expect(labels.tithiLabel).toBeTruthy();
        expect(labels.nakshatraLabel).toBeTruthy();
        expect(labels.rashiLabel).toBeTruthy();
        expect(labels.lagnaLabel).toBeTruthy();
        expect(labels.yogaLabel).toBeTruthy();
        expect(labels.karanaLabel).toBeTruthy();
        expect(labels.dashaLabel).toBeTruthy();
        expect(labels.startConsultationBtn).toBeTruthy();

        if (lang !== "en") {
          // Indic scripts must not contain untranslated raw English labels like 'Wednesday' or 'Moon Sign'
          expect(profile.vaara).not.toContain("Wednesday");
          expect(profile.vaara).not.toContain("Monday");
        }
      }
    });

    it("enforces Vedic sunrise Vaara rule (birth before sunrise belongs to previous Vedic day)", async () => {
      // 1994-06-15 is civil Wednesday.
      // A birth at 04:15 AM is before sunrise (approx 06:05 AM in Kumta/Gokarna).
      // Under authentic Vedic Shastra, it belongs to the previous day (Tuesday / ಮಂಗಳವಾರ).
      const preDawnSession = {
        ...mockSessionBase,
        dob: "1994-06-15",
        tob: "04:15",
        language: "kn" as ConsultationLanguage
      };
      const profile = await computeDevoteePanchangaProfile(preDawnSession);
      expect(profile.vaara).toBe("ಮಂಗಳವಾರ");
      expect(profile.vaaraRaw).toBe("Tuesday");

      // A birth at 10:30 AM after sunrise on the same date belongs to Wednesday (ಬುಧವಾರ).
      const postSunriseSession = {
        ...mockSessionBase,
        dob: "1994-06-15",
        tob: "10:30",
        language: "kn" as ConsultationLanguage
      };
      const postProfile = await computeDevoteePanchangaProfile(postSunriseSession);
      expect(postProfile.vaara).toBe("ಬುಧವಾರ");
      expect(postProfile.vaaraRaw).toBe("Wednesday");
    });

    it("revered 50+ year priest persona handles normal greetings and philosophical inquiry with Daiva Vachana blessing", async () => {
      // Deterministic fallback response when no API key is provided
      const greetingAnswer = await generateConsultationAnswer({
        session: mockSessionBase,
        userQuestion: "ನಮಸ್ಕಾರ ಸ್ವಾಮಿ, ಹೇಗಿದ್ದೀರಿ? ನಿಮ್ಮ ಆಶೀರ್ವಾದ ಬೇಕು.",
        conversationHistory: [],
        apiKey: ""
      });

      // Must be warm, paternal, and divine blessing without cold robot disclaimers
      expect(
        greetingAnswer.fullText.includes("ಆಶೀರ್ವಾದ") ||
        greetingAnswer.fullText.includes("ಅನುಗ್ರಹ") ||
        greetingAnswer.fullText.includes("ಹಾರೈಸುತ್ತೇವೆ")
      ).toBe(true);
      expect(greetingAnswer.fullText).toContain("ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ");
      expect(greetingAnswer.fullText).not.toContain("I am an AI");
      expect(greetingAnswer.fullText).not.toContain("ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ");
    });

    it("provides astrological answers grounded in Baggona Panchanga chart math with dosha parihara", async () => {
      const careerAnswer = await generateConsultationAnswer({
        session: mockSessionBase,
        userQuestion: "ನನ್ನ ವೃತ್ತಿ ಮತ್ತು ವ್ಯಾಪಾರದಲ್ಲಿ ಯಾವಾಗ ಉತ್ತಮ ಲಾಭ ಸಿಗಬಹುದು?",
        conversationHistory: [],
        apiKey: ""
      });

      expect(careerAnswer.fullText.length).toBeGreaterThan(100);
      expect(careerAnswer.fullText).toContain("ರಮೇಶ್ ಭಟ್");
      // Fallback includes guidance for Shreeram Pandit contact (in Kannada numerals ೯೯೭೨೩೩೯೩೬೨ or standard 9972339362)
      expect(careerAnswer.fullText).toMatch(/9972339362|೯೯೭೨೩೩೯೩೬೨/);
    });
  });
});


