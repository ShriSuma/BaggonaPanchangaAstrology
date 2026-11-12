import { describe, it, expect } from "vitest";
import {
  encodeSecureConsultationToken,
  decodeSecureConsultationToken,
  isValidPhoneNumber,
  isValidEmailAddress,
  createConsultationSession,
  startConsultationTimer,
  claimBonusMinute,
  addConsultationMessage
} from "../features/consultation/consultationDbService";
import {
  getVoiceIdForLanguage,
  resolveBestVedicVoice
} from "../features/audio/aiVoiceCloneEngine";
import { deduplicateResponseText } from "../features/consultation/consultationAIEngine";
import {
  CONSULTATION_LANGUAGES,
  CONSULTATION_MODAL_I18N,
  CONSULTATION_CHAT_UI_I18N,
  DEFAULT_PRIEST_CONTACT,
  getInitialPriestGreeting
} from "../features/consultation/consultationTypes";

describe("Consultation 20-Minute Link Security, Sandbox Isolation & UX Audit", () => {
  describe("1. Cryptographic Token Tamper Resistance & Access Control", () => {
    it("generates and verifies tamper-proof encrypted tokens with rolling DJB2 checksum", () => {
      const sessionId = "bgn_7x9q2m1k0p";
      const token = encodeSecureConsultationToken(sessionId);
      expect(token).toMatch(/^bgn_cst_[A-Za-z0-9_-]+\.[a-z0-9]+$/);

      const decoded = decodeSecureConsultationToken(token);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(sessionId);
    });

    it("strictly rejects tampered tokens when any character in payload is modified", () => {
      const sessionId = "bgn_8a7b6c5d4e";
      const token = encodeSecureConsultationToken(sessionId);
      const [prefixAndPayload, checksum] = token.split(".");
      
      // Tamper one byte in the payload
      const tamperedPayload = prefixAndPayload.slice(0, -1) + (prefixAndPayload.endsWith("a") ? "b" : "a");
      const tamperedToken = `${tamperedPayload}.${checksum}`;

      const decoded = decodeSecureConsultationToken(tamperedToken);
      expect(decoded.isValid).toBe(false);
      expect(decoded.error).toContain("Tampered token checksum mismatch");
    });

    it("strictly rejects corrupted or forged tokens with invalid checksum", () => {
      const forgedToken = "bgn_cst_SGVsbG9Xb3JsZA.123456";
      const decoded = decodeSecureConsultationToken(forgedToken);
      expect(decoded.isValid).toBe(false);
    });

    it("handles URL encoding and query parameter prefix stripping safely", () => {
      const sessionId = "bgn_abc123def4";
      const rawToken = encodeSecureConsultationToken(sessionId);
      const queryParamToken = `token=${rawToken}`;
      const urlEncodedToken = encodeURIComponent(queryParamToken);

      const decoded = decodeSecureConsultationToken(urlEncodedToken);
      expect(decoded.isValid).toBe(true);
      expect(decoded.sessionId).toBe(sessionId);
    });
  });

  describe("2. Session Lifecycle, Indefinite Extension & Message Injection Defense", () => {
    it("prevents multiple bonus time claims (capped at exactly +1 minute, duration 21m)", async () => {
      const session = await createConsultationSession({
        name: "Devotee Security Test",
        dob: "1992-06-20",
        tob: "14:15",
        place: "Gokarna",
        language: "kn"
      });

      const started = await startConsultationTimer(session.id);
      expect(started.status).toBe("active");
      expect(started.durationMinutes).toBe(20);

      // Claim bonus 1st time -> Granted
      const bonus1 = await claimBonusMinute(session.id);
      expect(bonus1.durationMinutes).toBe(21);
      expect(bonus1.bonusMinuteClaimed).toBe(true);

      // Attempt to claim bonus 2nd time (attack attempt to extend session indefinitely) -> Blocked!
      const bonus2 = await claimBonusMinute(session.id);
      expect(bonus2.durationMinutes).toBe(21);
      expect(bonus2.expiresAt).toBe(bonus1.expiresAt);
    });

    it("strictly rejects message injection into expired consultation sessions", async () => {
      const session = await createConsultationSession({
        name: "Devotee Expiry Test",
        dob: "1990-01-01",
        tob: "08:00",
        place: "Gokarna",
        language: "en"
      });

      // Start session then expire it
      await startConsultationTimer(session.id);
      const { expireConsultationSession } = await import("../features/consultation/consultationDbService");
      await expireConsultationSession(session.id);

      // Attempting to append message must throw security error
      await expect(
        addConsultationMessage(session.id, {
          id: "rogue_msg_1",
          sender: "user",
          text: "Malicious rogue message",
          timestamp: new Date().toISOString()
        })
      ).rejects.toThrow(/expired/i);
    });
  });

  describe("3. Devotee Contact Input Parameter Validation", () => {
    it("validates legitimate Indian mobile numbers (10 digits with/without +91, 0)", () => {
      expect(isValidPhoneNumber("9876543210")).toBe(true);
      expect(isValidPhoneNumber("+919876543210")).toBe(true);
      expect(isValidPhoneNumber("09876543210")).toBe(true);
      expect(isValidPhoneNumber("8123456789")).toBe(true);
      expect(isValidPhoneNumber("7000112233")).toBe(true);
      expect(isValidPhoneNumber("6360123456")).toBe(true);
    });

    it("strictly rejects invalid numbers, letters, scripts, and injection attacks", () => {
      expect(isValidPhoneNumber("")).toBe(false);
      expect(isValidPhoneNumber("123")).toBe(false);
      expect(isValidPhoneNumber("abcdefghij")).toBe(false);
      expect(isValidPhoneNumber("<script>alert(1)</script>")).toBe(false);
      expect(isValidPhoneNumber("9876543210; DROP TABLE users;")).toBe(false);
      expect(isValidPhoneNumber("0000000000")).toBe(false);
    });

    it("validates legitimate email addresses", () => {
      expect(isValidEmailAddress("devotee@example.com")).toBe(true);
      expect(isValidEmailAddress("shree.pandit@baggona.org")).toBe(true);
      expect(isValidEmailAddress("user+astrology@domain.co.in")).toBe(true);
    });

    it("strictly rejects malformed emails, spaces, and injection strings", () => {
      expect(isValidEmailAddress("")).toBe(false);
      expect(isValidEmailAddress("plainaddress")).toBe(false);
      expect(isValidEmailAddress("devotee@")).toBe(false);
      expect(isValidEmailAddress("@domain.com")).toBe(false);
      expect(isValidEmailAddress("<script>alert(1)</script>@domain.com")).toBe(false);
    });
  });

  describe("4. Audio Playback / TTS Voice Engine Across All 7 Languages", () => {
    it("resolves valid male voice IDs for all 7 consultation languages plus Sanskrit", () => {
      expect(getVoiceIdForLanguage("kn")).toBe("voice_kannada_male");
      expect(getVoiceIdForLanguage("hi")).toBe("voice_hindi_male");
      expect(getVoiceIdForLanguage("te")).toBe("voice_telugu_male");
      expect(getVoiceIdForLanguage("ta")).toBe("voice_tamil_male");
      expect(getVoiceIdForLanguage("mr")).toBe("voice_marathi_male");
      expect(getVoiceIdForLanguage("ml")).toBe("voice_malayalam_male");
      expect(getVoiceIdForLanguage("sa")).toBe("voice_sriram_pandit");
      expect(getVoiceIdForLanguage("en")).toBe("voice_kannada_male");
    });

    it("resolves native browser synthesis voices for all languages including Malayalam and Marathi", () => {
      const mockVoices: any[] = [
        { name: "Google ಕನ್ನಡ", lang: "kn-IN" },
        { name: "Google हिन्दी", lang: "hi-IN" },
        { name: "Google తెలుగు", lang: "te-IN" },
        { name: "Google தமிழ்", lang: "ta-IN" },
        { name: "Google मराठी", lang: "mr-IN" },
        { name: "Google മലയാളം", lang: "ml-IN" },
        { name: "Google UK English Male", lang: "en-GB" }
      ];

      expect(resolveBestVedicVoice(mockVoices, "kn")?.lang).toBe("kn-IN");
      expect(resolveBestVedicVoice(mockVoices, "hi")?.lang).toBe("hi-IN");
      expect(resolveBestVedicVoice(mockVoices, "te")?.lang).toBe("te-IN");
      expect(resolveBestVedicVoice(mockVoices, "ta")?.lang).toBe("ta-IN");
      expect(resolveBestVedicVoice(mockVoices, "mr")?.lang).toBe("mr-IN");
      expect(resolveBestVedicVoice(mockVoices, "ml")?.lang).toBe("ml-IN");
    });
  });

  describe("5. Output Parameter & Multi-Lingual Presentation Quality", () => {
    it("deduplicates repeated sentences and paragraphs with NFC normalization and danda stripping", () => {
      const repeatedWithDanda = "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ। ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ॥";
      const result = deduplicateResponseText(repeatedWithDanda);
      expect(result).toBe("ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಗುರು ಬಲವಿದೆ।");
    });

    it("verifies personalized greetings exist for all 7 languages and mention Chief Priest Shreeram Pandit", () => {
      for (const lang of CONSULTATION_LANGUAGES) {
        const greeting = getInitialPriestGreeting(lang.code, "Shreesuma");
        expect(greeting).toBeTruthy();
        expect(greeting).toMatch(/(Shreesuma|ಶ್ರೀಸುಮಾ|श्रीसुमा|శ్రీసుమ|ஸ்ரீசுமா|ശ്രീസുമ)/);
        expect(greeting.length).toBeGreaterThan(50);
      }
    });

    it("verifies all 7 languages have complete UI translations without empty strings", () => {
      for (const lang of CONSULTATION_LANGUAGES) {
        const modal = CONSULTATION_MODAL_I18N[lang.code];
        expect(modal).toBeDefined();
        expect(modal.startTimerBtn).toBeTruthy();
        expect(modal.callPriestBtn).toBeTruthy();

        const ui = CONSULTATION_CHAT_UI_I18N[lang.code];
        expect(ui).toBeDefined();
        expect(ui.listenAudio).toBeTruthy();
        expect(ui.stopAudio).toBeTruthy();
        expect(ui.directCallBtn).toBeTruthy();
      }
    });

    it("verifies default priest phone is strictly Sri Shreeram Pandit 9972339362", () => {
      expect(DEFAULT_PRIEST_CONTACT.phone).toBe("9972339362");
      expect(DEFAULT_PRIEST_CONTACT.callUri).toBe("tel:9972339362");
      expect(DEFAULT_PRIEST_CONTACT.name).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(DEFAULT_PRIEST_CONTACT.name).toContain("Shreeram Pandit");
    });
  });
});
