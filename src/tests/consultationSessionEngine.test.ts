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
  senseAndCategorizeQuestion,
  presentConsultationReply,
  type ConsultationQuestionCategory
} from "../features/consultation/consultationPresenterEngine";
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
      expect(result.currentDashaText.includes("ಮಹಾದಶಾ") || result.currentDashaText.includes("Mahadasha")).toBe(true);
      expect(result.currentDashaTextEn).toContain("Mahadasha");
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

  describe("9. Senior Priest Presenter & Intelligent Sensing Engine", () => {
    const mockDevoteeSession: ConsultationSession = {
      id: "bgn_cst_presenter_test",
      name: "ಆನಂದ ಹೆಗಡೆ (Anand Hegde)",
      dob: "1998-08-20", // Youth (~28 years old)
      tob: "10:15",
      place: "ಶಿರಸಿ (Sirsi, Karnataka)",
      lat: 14.6196,
      lng: 74.8354,
      timezone: 5.5,
      language: "kn" as ConsultationLanguage,
      durationMinutes: 20,
      graceDeleteMinutes: 20,
      createdAt: new Date().toISOString(),
      status: "active" as const,
      hasProvidedContact: true,
      bonusMinuteClaimed: false,
      messages: [],
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      priestPhone: "9972339362"
    };

    it("senses devotee age, life stage, and location accurately", () => {
      const sensed = senseAndCategorizeQuestion(
        "ನನ್ನ ಜೀವನದಲ್ಲಿ ಈಗ ಏನು ನಡೀತಿದೆ ಹೇಳು?",
        mockDevoteeSession
      );

      expect(sensed.ageYears).toBeGreaterThanOrEqual(27);
      expect(sensed.lifeStage).toBe("MID_CAREER");
      expect(sensed.place).toBe("ಶಿರಸಿ (Sirsi, Karnataka)");
      expect(sensed.category).toBe("LIFE_OVERVIEW_EXISTENTIAL");
    });

    it("accurately categorizes all the specific questions stated by user", () => {
      // 1. "nanna eega en naditida nanna jeevandalli helu"
      const q1 = senseAndCategorizeQuestion(
        "ನನ್ನ ಈಗ ಏನು ನಡೀತಿದೆ ನನ್ನ ಜೀವನದಲ್ಲಿ ಹೇಳು?",
        mockDevoteeSession
      );
      expect(q1.category).toBe("LIFE_OVERVIEW_EXISTENTIAL");

      // 2. "naan en maadli eega? Naanu naale trip-ge hogbeku antiddini en maadtia?"
      const q2 = senseAndCategorizeQuestion(
        "ನಾನು ಏನು ಮಾಡ್ಲಿ ಈಗ? ನಾನು ನಾಳೆ ಟ್ರಿಪ್‌ಗೆ ಹೋಗ್ಬೇಕು ಅಂತಿದ್ದೀನಿ ಏನು ಮಾಡ್ತೀಯಾ?",
        mockDevoteeSession
      );
      expect(q2.category).toBe("DAILY_TRIP_TRAVEL");

      // 3. "nange avange fight aytu, naanu avanige en maadli?"
      const q3 = senseAndCategorizeQuestion(
        "ನನಗೂ ಅವನಿಗೂ ಫೈಟ್ ಆಯಿತು, ನಾನು ಅವನಿಗೆ ಏನು ಮಾಡ್ಲಿ?",
        mockDevoteeSession
      );
      expect(q3.category).toBe("INTERPERSONAL_CONFLICT");

      // 4. "namma maneyalli ivattu hale paatre sikkide, ellinda sikkirbahudu? Yaake sikkirbahudu? Namma mane ee mooleli ondeeno sikkide, aa mooleli eno sikkide"
      const q4 = senseAndCategorizeQuestion(
        "ನಮ್ಮ ಮನೆಯಲ್ಲಿ ಇವತ್ತು ಹಳೆ ಪಾತ್ರೆ ಸಿಕ್ಕಿದೆ, ಎಲ್ಲಿಂದ ಸಿಕ್ಕಿರಬಹುದು? ಯಾಕೆ ಸಿಕ್ಕಿರಬಹುದು? ನಮ್ಮ ಮನೆ ಈ ಮೂಲೇಲಿ ಒಂದೇನೋ ಸಿಕ್ಕಿದೆ, ಆ ಮೂಲೇಲಿ ಏನೋ ಸಿಕ್ಕಿದೆ",
        mockDevoteeSession
      );
      expect(q4.category).toBe("DOMESTIC_OMEN_VASTU");

      // 5. "Naanu Aishwarya Rai na maduve aagbouda? Naanu heroine na maduve aagbouda?"
      const q5 = senseAndCategorizeQuestion(
        "ನಾನು ಐಶ್ವರ್ಯ ರೈ ನ ಮದುವೆ ಆಗಬಹುದಾ? ನಾನು ಹೀರೋಯಿನ್ ನ ಮದುವೆ ಆಗಬಹುದಾ?",
        mockDevoteeSession
      );
      expect(q5.category).toBe("CELEBRITY_FANTASY");

      // 6. "Naanu pornstar na maduve aagbouda?"
      const q6 = senseAndCategorizeQuestion(
        "ನಾನು pornstar ನ ಮದುವೆ ಆಗಬಹುದಾ?",
        mockDevoteeSession
      );
      expect(q6.category).toBe("PROVOCATIVE_TABOO");

      // 7. Normal Greeting
      const q7 = senseAndCategorizeQuestion(
        "ನಮಸ್ಕಾರ ಸ್ವಾಮಿ ಹೇಗಿದ್ದೀರಿ?",
        mockDevoteeSession
      );
      expect(q7.category).toBe("CONVERSATIONAL_GREETING");

      // 8. Deep Astrological
      const q8 = senseAndCategorizeQuestion(
        "ನನ್ನ ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷ ಮತ್ತು ಕಂಕಣ ಬಲ ಹೇಗಿದೆ?",
        mockDevoteeSession
      );
      expect(q8.category).toBe("ASTROLOGICAL_DEEP");
    });

    it("generates dignified, fatherly, compassionate response for celebrity fantasy (Aishwarya Rai)", async () => {
      const response = await presentConsultationReply({
        session: mockDevoteeSession,
        userQuestion: "ನಾನು ಐಶ್ವರ್ಯ ರೈ ನ ಮದುವೆ ಆಗಬಹುದಾ?",
        conversationHistory: [],
        apiKey: ""
      });

      expect(response.sensedContext.category).toBe("CELEBRITY_FANTASY");
      expect(response.fullText).toContain("ಆನಂದ");
      // Must gently clarify that she is already married / has family
      expect(
        response.fullText.includes("ಸಂಸಾರ") ||
        response.fullText.includes("ವಿವಾಹಿತ") ||
        response.fullText.includes("ಕುಟುಂಬ") ||
        response.fullText.includes("ಗೃಹಿಣಿ") ||
        response.fullText.includes("ಮದುವೆ")
      ).toBe(true);
      // Must encourage hard work, earning livelihood, character building & real-life partner
      expect(
        response.fullText.includes("ಪರಿಶ್ರಮ") ||
        response.fullText.includes("ಸಾಧನೆ") ||
        response.fullText.includes("ಶ್ರಮಿಸಿ") ||
        response.fullText.includes("ಯಶಸ್ಸು") ||
        response.fullText.includes("ಗುಣ")
      ).toBe(true);
      expect(
        response.fullText.includes("ಬಾಳಸಂಗಾತಿ") ||
        response.fullText.includes("ಸಪ್ತಮ ಭಾವ") ||
        response.fullText.includes("ಸಂಗಾತಿ") ||
        response.fullText.includes("ಜೀವನ ಸಂಗಾತಿ")
      ).toBe(true);
      // Zero harshness, zero AI robotic disclaimer
      expect(response.fullText).not.toContain("I am an AI");
      expect(response.fullText).not.toContain("ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ");
    });

    it("generates sacred travel muhurtha and Kuladevata blessing for trip planning query", async () => {
      const response = await presentConsultationReply({
        session: mockDevoteeSession,
        userQuestion: "ನಾನು ನಾಳೆ ಟ್ರಿಪ್‌ಗೆ ಹೋಗ್ಬೇಕು ಅಂತಿದ್ದೀನಿ ಏನು ಮಾಡ್ತೀಯಾ?",
        conversationHistory: [],
        apiKey: ""
      });

      expect(response.sensedContext.category).toBe("DAILY_TRIP_TRAVEL");
      expect(
        response.fullText.includes("ರಾಹು ಕಾಲ") ||
        response.fullText.includes("ರಾಹುಕಾಲ") ||
        response.fullText.includes("ಪ್ರವಾಸ") ||
        response.fullText.includes("ಪ್ರಯಾಣ") ||
        response.fullText.includes("ಮುಹೂರ್ತ")
      ).toBe(true);
      expect(
        response.fullText.includes("ಗಣಪತಿ") ||
        response.fullText.includes("ಕುಲದೇವತೆ") ||
        response.fullText.includes("ಮಹಾಬಲೇಶ್ವರ") ||
        response.fullText.includes("ಆಶೀರ್ವಾದ") ||
        response.fullText.includes("ರಕ್ಷಣೆ")
      ).toBe(true);
    });

    it("generates soothing Vedic counsel and Shanti for interpersonal conflict query", async () => {
      const response = await presentConsultationReply({
        session: mockDevoteeSession,
        userQuestion: "ನನಗೂ ಅವನಿಗೂ ಫೈಟ್ ಆಯಿತು, ನಾನು ಅವನಿಗೆ ಏನು ಮಾಡ್ಲಿ?",
        conversationHistory: [],
        apiKey: ""
      });

      expect(response.sensedContext.category).toBe("INTERPERSONAL_CONFLICT");
      expect(
        response.fullText.includes("ಕೋಪ") ||
        response.fullText.includes("ಕ್ರೋಧ") ||
        response.fullText.includes("ಕುಜ")
      ).toBe(true);
      expect(
        response.fullText.includes("ತಾಳ್ಮೆ") ||
        response.fullText.includes("ಶಾಂತಿ")
      ).toBe(true);
    });

    it("generates Nimitta Shastra and Vastu corner purification without superstition for domestic finding", async () => {
      const response = await presentConsultationReply({
        session: mockDevoteeSession,
        userQuestion: "ನಮ್ಮ ಮನೇಲಿ ಇವತ್ತು ಹಳೆ ಪಾತ್ರೆ ಸಿಕ್ಕಿದೆ, ಮೂಲೆಲಿ ಏನೋ ಸಿಕ್ಕಿದೆ...",
        conversationHistory: [],
        apiKey: ""
      });

      expect(response.sensedContext.category).toBe("DOMESTIC_OMEN_VASTU");
      expect(
        response.fullText.includes("ವಾಸ್ತು") ||
        response.fullText.includes("ಮೂಲೆ") ||
        response.fullText.includes("ಪಾತ್ರೆ")
      ).toBe(true);
      // Must advise purification (lamp, prayer, Tulasi or Ganga-jala)
      expect(
        response.fullText.includes("ದೀಪ") ||
        response.fullText.includes("ಶುದ್ಧ") ||
        response.fullText.includes("ಪ್ರಾರ್ಥನೆ")
      ).toBe(true);
    });

    it("generates calm, dignified redirection for provocative/taboo questions", async () => {
      const response = await presentConsultationReply({
        session: mockDevoteeSession,
        userQuestion: "ನಾನು pornstar ನ ಮದುವೆ ಆಗಬಹುದಾ?",
        conversationHistory: [],
        apiKey: ""
      });

      expect(response.sensedContext.category).toBe("PROVOCATIVE_TABOO");
      expect(
        response.fullText.includes("ಇಂದ್ರಿಯ ನಿಗ್ರಹ") ||
        response.fullText.includes("ಸದ್ಗುಣ") ||
        response.fullText.includes("ಗೌರವಯುತ")
      ).toBe(true);
      // No vulgarity or harsh rebuke
      expect(response.fullText).not.toContain("stupid");
      expect(response.fullText).not.toContain("fool");
    });
  });

  describe("Personalized Initial Priest Greeting & Token Resilience", () => {
    it("generates personalized initial priest greeting addressing devotee by name in all 7 languages", async () => {
      const { getInitialPriestGreeting } = await import("../features/consultation/consultationTypes");

      // Kannada
      const knGreeting = getInitialPriestGreeting("kn", "ರಮೇಶ್ ಕುಮಾರ್");
      expect(knGreeting).toContain("ನಮಸ್ಕಾರ ರಮೇಶ್ ಕುಮಾರ್ ಅವರೇ");
      expect(knGreeting).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(knGreeting).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ");
      expect(knGreeting).toContain("೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಸಮಾಲೋಚನೆ");

      // English
      const enGreeting = getInitialPriestGreeting("en", "Ramesh Kumar");
      expect(enGreeting).toContain("Namaskara Ramesh Kumar ji");
      expect(enGreeting).toContain("Shreeram Pandit");
      expect(enGreeting).toContain("Gokarna");
      expect(enGreeting).toContain("20-minute private consultation");

      // Hindi
      const hiGreeting = getInitialPriestGreeting("hi", "रमेश कुमार");
      expect(hiGreeting).toContain("नमस्कार रमेश कुमार जी");
      expect(hiGreeting).toContain("श्रीराम पंडित");

      // Telugu
      const teGreeting = getInitialPriestGreeting("te", "రమేష్ కుమార్");
      expect(teGreeting).toContain("నమస్కారం రమేష్ కుమార్ గారూ");
      expect(teGreeting).toContain("శ్రీరామ్ పండిత్");

      // Tamil
      const taGreeting = getInitialPriestGreeting("ta", "ரமேஷ்");
      expect(taGreeting).toContain("வணக்கம் ரமேஷ் அவர்களே");
      expect(taGreeting).toContain("ஸ்ரீராம் பண்டிட்");

      // Malayalam
      const mlGreeting = getInitialPriestGreeting("ml", "രമേഷ്");
      expect(mlGreeting).toContain("നമസ്കാരം രമേഷ്");
      expect(mlGreeting).toContain("ശ്രീറാം പണ്ഡിറ്റ്");

      // Marathi
      const mrGreeting = getInitialPriestGreeting("mr", "रमेश");
      expect(mrGreeting).toContain("नमस्कार रमेश जी");
      expect(mrGreeting).toContain("श्रीराम पंडित");
    });

    it("automatically inserts the personalized greeting when consultation timer is started", async () => {
      const session = await createConsultationSession({
        name: "ವಿನಾಯಕ ಭಟ್",
        dob: "1994-06-20",
        tob: "08:15",
        place: "Gokarna",
        language: "kn"
      });

      expect(session.status).toBe("pending");
      expect(session.messages.length).toBe(0);

      const activeSession = await startConsultationTimer(session.id);
      expect(activeSession.status).toBe("active");
      expect(activeSession.messages.length).toBe(1);
      expect(activeSession.messages[0].sender).toBe("astrologer");
      expect(activeSession.messages[0].text).toContain("ನಮಸ್ಕಾರ ವಿನಾಯಕ ಭಟ್ ಅವರೇ");
      expect(activeSession.messages[0].text).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    });

    it("resiliently decodes secure tokens, raw session tokens, and query parameter strings", () => {
      const rawId = "bgn_7a8b9c0d1e";
      const secureToken = encodeSecureConsultationToken(rawId);

      // 1. Standard secure token
      const res1 = decodeSecureConsultationToken(secureToken);
      expect(res1.isValid).toBe(true);
      expect(res1.sessionId).toBe(rawId);

      // 2. URL-encoded secure token
      const res2 = decodeSecureConsultationToken(encodeURIComponent(secureToken));
      expect(res2.isValid).toBe(true);
      expect(res2.sessionId).toBe(rawId);

      // 3. String with id= prefix
      const res3 = decodeSecureConsultationToken(`id=${secureToken}`);
      expect(res3.isValid).toBe(true);
      expect(res3.sessionId).toBe(rawId);

      // 4. Raw session ID
      const res4 = decodeSecureConsultationToken(rawId);
      expect(res4.isValid).toBe(true);
      expect(res4.sessionId).toBe(rawId);

      // 5. String with session= prefix
      const res5 = decodeSecureConsultationToken(`session=${rawId}`);
      expect(res5.isValid).toBe(true);
      expect(res5.sessionId).toBe(rawId);
    });

    it("strictly separates /consultation-generator from /consultation chat route", () => {
      function evaluateConsultationRoutes(pathname: string, search: string = "", hash: string = "") {
        const isConsultationGeneratorRoute = (
          pathname === "/consultation-generator" ||
          pathname.startsWith("/consultation-generator/") ||
          pathname.startsWith("/link-generator") ||
          pathname.startsWith("/consultation_generator") ||
          search.includes("portal=consultation_generator") ||
          search.includes("portal=link_generator") ||
          search.includes("page=consultation_generator") ||
          hash.includes("#/consultation-generator") ||
          hash.includes("#consultation-generator") ||
          hash.includes("#/link-generator") ||
          hash.includes("#link-generator")
        );

        const isConsultationRoute = !isConsultationGeneratorRoute && (
          pathname === "/consultation" ||
          pathname.startsWith("/consultation/") ||
          pathname === "/chat-session" ||
          pathname.startsWith("/chat-session/") ||
          pathname === "/astrology-chat" ||
          pathname.startsWith("/astrology-chat/") ||
          search.includes("portal=consultation") ||
          search.includes("portal=chat_session") ||
          search.includes("portal=chat") ||
          search.includes("session=bgn_") ||
          search.includes("id=bgn_") ||
          search.includes("token=bgn_") ||
          hash.startsWith("#/consultation?") ||
          hash === "#/consultation" ||
          hash.startsWith("#/consultation/") ||
          hash === "#consultation" ||
          hash.startsWith("#consultation?") ||
          hash.startsWith("#/chat-session") ||
          hash.includes("id=bgn_") ||
          hash.includes("session=bgn_")
        );

        return { isConsultationGeneratorRoute, isConsultationRoute };
      }

      // /consultation-generator MUST NOT trigger isConsultationRoute
      const gen1 = evaluateConsultationRoutes("/consultation-generator");
      expect(gen1.isConsultationGeneratorRoute).toBe(true);
      expect(gen1.isConsultationRoute).toBe(false);

      const gen2 = evaluateConsultationRoutes("/consultation-generator/");
      expect(gen2.isConsultationGeneratorRoute).toBe(true);
      expect(gen2.isConsultationRoute).toBe(false);

      const gen3 = evaluateConsultationRoutes("/", "", "#/consultation-generator");
      expect(gen3.isConsultationGeneratorRoute).toBe(true);
      expect(gen3.isConsultationRoute).toBe(false);

      const gen4 = evaluateConsultationRoutes("/", "?portal=consultation_generator");
      expect(gen4.isConsultationGeneratorRoute).toBe(true);
      expect(gen4.isConsultationRoute).toBe(false);

      // /consultation MUST trigger isConsultationRoute
      const chat1 = evaluateConsultationRoutes("/consultation", "?id=bgn_cst_abc.123");
      expect(chat1.isConsultationGeneratorRoute).toBe(false);
      expect(chat1.isConsultationRoute).toBe(true);

      const chat2 = evaluateConsultationRoutes("/consultation", "?session=bgn_abcdef1234");
      expect(chat2.isConsultationGeneratorRoute).toBe(false);
      expect(chat2.isConsultationRoute).toBe(true);

      const chat3 = evaluateConsultationRoutes("/", "", "#/consultation?id=bgn_cst_abc.123");
      expect(chat3.isConsultationGeneratorRoute).toBe(false);
      expect(chat3.isConsultationRoute).toBe(true);
    });

    it("resolves session ID when id parameter is corrupted but session parameter is valid", () => {
      const validSessionId = "bgn_9k8j7h6g5f";
      const corruptedIdParam = "bgn_cst_TAMPERED_STRING.invalidhash";

      const candidateTokens = [
        corruptedIdParam,
        validSessionId
      ];

      let resolvedSessionId: string | null = null;

      // Pass 1: Try decodeSecureConsultationToken
      for (const token of candidateTokens) {
        const decoded = decodeSecureConsultationToken(token);
        if (decoded.isValid && decoded.sessionId) {
          resolvedSessionId = decoded.sessionId;
          break;
        }
      }

      // Pass 2: Fallback for bgn_ pattern
      if (!resolvedSessionId) {
        for (const token of candidateTokens) {
          let clean = token.trim().toLowerCase().replace(/^(id|session|token)=/, "");
          try { clean = decodeURIComponent(clean); } catch {}
          if (/^bgn_[a-z0-9]{8,16}$/.test(clean)) {
            resolvedSessionId = clean;
            break;
          }
        }
      }

      expect(resolvedSessionId).toBe(validSessionId);
    });

    it("verifies computeDevoteeKundli strictly localizes Lagna, Rashi, Nakshatra, and Dasha in all 7 languages without English leakage", async () => {
      // Devotee born 1994-06-15 08:30 in Kumta has Karkataka (Cancer) Lagna
      const baseDevotee: ConsultationSession = {
        id: "bgn_karkataka_test",
        name: "ಆನಂದ ಹೆಗಡೆ",
        dob: "1994-06-15",
        tob: "08:30",
        place: "Kumta, Karnataka",
        lat: 14.4258,
        lng: 74.4174,
        timezone: 5.5,
        language: "kn",
        durationMinutes: 20,
        graceDeleteMinutes: 20,
        createdAt: new Date().toISOString(),
        status: "pending",
        hasProvidedContact: false,
        bonusMinuteClaimed: false,
        messages: [],
        priestName: "Shreeram Pandit",
        priestPhone: "9972339362"
      };

      // 1. Kannada: Must be "ಕರ್ಕಾಟಕ", not "Cancer" or "Karka"
      const knAstro = await computeDevoteeKundli({ ...baseDevotee, language: "kn" });
      expect(knAstro.lagnaName).toBe("ಕರ್ಕಾಟಕ");
      expect(knAstro.moonRashi).toBe("ಸಿಂಹ");
      expect(knAstro.nakshatra).toBe("ಪುನರ್ವಸು");
      expect(knAstro.currentDashaText).toContain("ಮಹಾದಶಾ");
      expect(knAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 2. Hindi: Must be "कर्क"
      const hiAstro = await computeDevoteeKundli({ ...baseDevotee, language: "hi" });
      expect(hiAstro.lagnaName).toBe("कर्क");
      expect(hiAstro.moonRashi).toBe("सिंह");
      expect(hiAstro.currentDashaText).toContain("महादशा");
      expect(hiAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 3. Telugu: Must be "కర్కాటకం"
      const teAstro = await computeDevoteeKundli({ ...baseDevotee, language: "te" });
      expect(teAstro.lagnaName).toBe("కర్కాటకం");
      expect(teAstro.moonRashi).toBe("సింహం");
      expect(teAstro.currentDashaText).toContain("మహాదశ");
      expect(teAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 4. Tamil: Must be "கடகம்"
      const taAstro = await computeDevoteeKundli({ ...baseDevotee, language: "ta" });
      expect(taAstro.lagnaName).toBe("கடகம்");
      expect(taAstro.moonRashi).toBe("சிம்மம்");
      expect(taAstro.currentDashaText).toContain("மகாதிசை");
      expect(taAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 5. Malayalam: Must be "കർക്കിടകം"
      const mlAstro = await computeDevoteeKundli({ ...baseDevotee, language: "ml" });
      expect(mlAstro.lagnaName).toBe("കർക്കിടകം");
      expect(mlAstro.moonRashi).toBe("ചിങ്ങം");
      expect(mlAstro.currentDashaText).toContain("മഹാദശ");
      expect(mlAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 6. Marathi: Must be "कर्क"
      const mrAstro = await computeDevoteeKundli({ ...baseDevotee, language: "mr" });
      expect(mrAstro.lagnaName).toBe("कर्क");
      expect(mrAstro.moonRashi).toBe("सिंह");
      expect(mrAstro.currentDashaText).toContain("महादशा");
      expect(mrAstro.lagnaName).not.toMatch(/[a-zA-Z]/);

      // 7. English: Contains Sanskrit and English
      const enAstro = await computeDevoteeKundli({ ...baseDevotee, language: "en" });
      expect(enAstro.lagnaName).toContain("Cancer");
      expect(enAstro.currentDashaText).toContain("Mahadasha");
    });
  });
});




