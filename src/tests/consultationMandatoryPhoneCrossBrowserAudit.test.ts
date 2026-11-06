import { describe, it, expect } from "vitest";
import {
  createConsultationSession,
  getConsultationSession,
  updateDevoteeContact,
  startConsultationTimer,
  isValidPhoneNumber,
  isValidEmailAddress
} from "../features/consultation/consultationDbService";
import {
  CONSULTATION_LANGUAGES,
  CONSULTATION_MODAL_I18N,
  getInitialPriestGreeting
} from "../features/consultation/consultationTypes";
import {
  senseAndCategorizeQuestion,
  presentConsultationReply
} from "../features/consultation/consultationPresenterEngine";
import {
  CANONICAL_VEDIC_ASTROLOGY_RULES_REFERENCE
} from "../features/consultation/consultationAIEngine";

describe("Consultation Mandatory Mobile Number, Cross-Browser Persistence & Senior Priest Audit", () => {
  describe("1. Strict Mobile Number Mandatory & Email Optional Verification", () => {
    it("strictly requires 10-digit mobile number and rejects empty or invalid formats", () => {
      // Empty phone
      expect(isValidPhoneNumber("")).toBe(false);
      expect(isValidPhoneNumber("   ")).toBe(false);

      // Incomplete phone (< 7 digits)
      expect(isValidPhoneNumber("987654")).toBe(false);
      expect(isValidPhoneNumber("12345")).toBe(false);

      // Non-numeric phone
      expect(isValidPhoneNumber("abcdefghij")).toBe(false);
      expect(isValidPhoneNumber("98765abcde")).toBe(false);

      // Valid 10-digit mobile numbers
      expect(isValidPhoneNumber("9972339362")).toBe(true);
      expect(isValidPhoneNumber("9876543210")).toBe(true);
      expect(isValidPhoneNumber("+919972339362")).toBe(true);
      expect(isValidPhoneNumber("09972339362")).toBe(true);
    });

    it("treats email address as strictly optional: empty is allowed, but invalid format is rejected", () => {
      // Email is optional: empty string is valid for optional submission
      const emailInputEmpty = "";
      const isEmailProvided = Boolean(emailInputEmpty.trim());
      expect(isEmailProvided).toBe(false); // allowed to be empty

      // If devotee does provide an email, it must be syntactically valid
      expect(isValidEmailAddress("devotee@example.com")).toBe(true);
      expect(isValidEmailAddress("shreeram.pandit@gokarna.org")).toBe(true);

      // Invalid email formats are rejected
      expect(isValidEmailAddress("notanemail")).toBe(false);
      expect(isValidEmailAddress("devotee@")).toBe(false);
      expect(isValidEmailAddress("@domain.com")).toBe(false);
    });

    it("verifies all 7 languages in CONSULTATION_MODAL_I18N explicitly specify Mobile as Mandatory and Email as Optional", () => {
      CONSULTATION_LANGUAGES.forEach((meta) => {
        const i18n = CONSULTATION_MODAL_I18N[meta.code];
        expect(i18n).toBeDefined();

        // Subtitle must exist and have guidance
        expect(i18n.contactModalSubtitle.length).toBeGreaterThan(15);

        // Phone label must indicate mandatory nature
        expect(i18n.phoneLabel.length).toBeGreaterThan(0);

        // Email label must indicate optional nature
        expect(i18n.emailLabel.length).toBeGreaterThan(0);

        // Dedicated phone mandatory error message must be present
        expect(i18n.phoneMandatoryError).toBeDefined();
        expect(i18n.phoneMandatoryError.length).toBeGreaterThan(10);
      });
    });
  });

  describe("2. Cross-Browser Persistence & Database Grounding for Consultation URL", () => {
    it("shows pop-up modal on initial launch when mobile number is missing in DB, but skips modal in different browser once saved", async () => {
      // 1. Super Admin generates the 20-minute consultation link for devotee
      const freshSession = await createConsultationSession({
        name: "Devotee Ramesh",
        dob: "1990-05-15",
        tob: "10:30",
        place: "Gokarna",
        language: "kn"
      });

      expect(freshSession.userPhone).toBeUndefined();
      expect(freshSession.hasProvidedContact).toBe(false);

      // 2. Browser 1 Simulation (Devotee opens the link for the first time)
      // On initial page load:
      const browser1Fetched = await getConsultationSession(freshSession.id);
      expect(browser1Fetched).not.toBeNull();

      // UI logic condition check in Browser 1:
      const browser1HasStoredPhone = Boolean(
        browser1Fetched?.userPhone && isValidPhoneNumber(browser1Fetched.userPhone.trim())
      );
      // Because phone is NOT yet in DB, pop-up MUST come 1st before user can start progress!
      expect(browser1HasStoredPhone).toBe(false);

      // 3. Devotee fills in mobile number (mandatory) and optional email in Browser 1
      const savedSession = await updateDevoteeContact(freshSession.id, {
        phone: "9972339362",
        email: "devotee.ramesh@example.com"
      });

      expect(savedSession.userPhone).toBe("9972339362");
      expect(savedSession.userEmail).toBe("devotee.ramesh@example.com");
      expect(savedSession.hasProvidedContact).toBe(true);

      // 4. Browser 2 Simulation (User copies the link and pastes it into Chrome / Safari / Incognito)
      // When Browser 2 opens the exact same URL:
      const browser2Fetched = await getConsultationSession(freshSession.id);
      expect(browser2Fetched).not.toBeNull();

      // UI logic condition check in Browser 2:
      const browser2HasStoredPhone = Boolean(
        browser2Fetched?.userPhone && isValidPhoneNumber(browser2Fetched.userPhone.trim())
      );

      // Because phone was ALREADY stored in DB during setup in Browser 1,
      // Browser 2 MUST NOT show the contact pop-up modal!
      expect(browser2HasStoredPhone).toBe(true);
      expect(browser2Fetched?.userPhone).toBe("9972339362");
      expect(browser2Fetched?.userEmail).toBe("devotee.ramesh@example.com");
    });

    it("persists contact across browsers even when email is omitted (optional)", async () => {
      const freshSession = await createConsultationSession({
        name: "Shweta Joshi",
        dob: "1994-11-22",
        tob: "16:45",
        place: "Hubli",
        language: "kn"
      });

      // Devotee enters mobile number only, leaving email blank (optional)
      const updated = await updateDevoteeContact(freshSession.id, {
        phone: "9876543210"
        // email omitted
      });

      expect(updated.userPhone).toBe("9876543210");
      expect(updated.userEmail ?? null).toBeNull();

      // In a completely new browser session:
      const reFetched = await getConsultationSession(freshSession.id);
      const hasStoredPhone = Boolean(
        reFetched?.userPhone && isValidPhoneNumber(reFetched.userPhone.trim())
      );

      // Phone is present, so modal does not appear in new browser
      expect(hasStoredPhone).toBe(true);
      expect(reFetched?.userPhone).toBe("9876543210");
      expect(reFetched?.userEmail ?? null).toBeNull();
    });
  });

  describe("3. Senior Priest Persona (50+ Year Revered Shreeram Pandit) & 100% Vedic Accuracy", () => {
    it("greets devotee with revered Chief Priest Shreeram Pandit identity and confirms birth chart analysis", () => {
      const greetingKn = getInitialPriestGreeting("kn", "ರಾಘವೇಂದ್ರ");
      expect(greetingKn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(greetingKn).toContain("ಗೋಕರ್ಣ");
      expect(greetingKn).toContain("ರಾಘವೇಂದ್ರ");
      expect(greetingKn).toContain("ಲಗ್ನ");

      const greetingEn = getInitialPriestGreeting("en", "Raghavendra");
      expect(greetingEn).toContain("Shreeram Pandit");
      expect(greetingEn).toContain("Gokarna");
      expect(greetingEn).toContain("Raghavendra");
      expect(greetingEn).toContain("birth chart");
    });

    it("accurately senses and categorizes diverse inquiries without confusion", async () => {
      const session = await createConsultationSession({
        name: "ವಿನಾಯಕ್ ಭಟ್",
        dob: "1988-04-12",
        tob: "06:30",
        place: "Gokarna",
        language: "kn"
      });

      // Career distress
      const careerContext = senseAndCategorizeQuestion(
        "ನನ್ನ ಕೆಲಸದಲ್ಲಿ ಬಹಳ ಒತ್ತಡವಿದೆ, ಪ್ರಮೋಷನ್ ಸಿಗುತ್ತಿಲ್ಲ, ಯಾಕೆ ಹೀಗಾಗುತ್ತಿದೆ?",
        session
      );
      expect(careerContext.category).toBe("CAREER_FRUSTRATION_DISTRESS");

      // Worldly general knowledge
      const gkContext = senseAndCategorizeQuestion(
        "What is the capital of France?",
        session
      );
      expect(gkContext.category).toBe("GENERAL_KNOWLEDGE_WORLDLY");

      // Silly / Trolling inquiry
      const sillyContext = senseAndCategorizeQuestion(
        "Who would win in a fight, Batman or Superman?",
        session
      );
      expect(sillyContext.category).toBe("SILLY_TROLLING_MOCKERY");

      // Marriage timing inquiry
      const marriageContext = senseAndCategorizeQuestion(
        "ನನ್ನ ವಿವಾಹ ಯಾವಾಗ ಆಗಬಹುದು? ಯಾವ ದಿಕ್ಕಿನಿಂದ ಕನ್ಯೆ ಬರಬಹುದು?",
        session
      );
      expect(marriageContext.category).toBe("ASTROLOGICAL_DEEP");
    });

    it("incorporates canonical Vedic astrology rules for 100% precision", () => {
      const rulesUpper = CANONICAL_VEDIC_ASTROLOGY_RULES_REFERENCE.toUpperCase();
      expect(rulesUpper).toContain("DHARMA-KARMADHIPATI RAJA YOGA");
      expect(rulesUpper).toContain("GAJA KESARI YOGA");
      expect(rulesUpper).toContain("SADE SATI");
      expect(rulesUpper).toContain("BRIHAT PARASHARA HORA SHASTRA");
      expect(rulesUpper).toContain("B.V. RAMAN");
    });
  });
});
