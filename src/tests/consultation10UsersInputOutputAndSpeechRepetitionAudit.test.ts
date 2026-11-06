import { describe, it, expect } from "vitest";
import {
  presentConsultationReply
} from "../features/consultation/consultationPresenterEngine";
import {
  generateConsultationAnswer,
  buildDeterministicMarriageReading,
  deduplicateResponseText,
  computeDevoteeKundli,
  getLagnaPrescribedGemstoneText
} from "../features/consultation/consultationAIEngine";
import {
  sanitizeDuplicateSpeechWords,
  collapseConsecutiveTokens,
  mergeSpeechSegments,
  ContinuousSpeechEngine
} from "../features/consultation/consultationSpeechService";
import type {
  ConsultationSession,
  ConsultationLanguage
} from "../features/consultation/consultationTypes";

function createMockSession(
  overrides: Partial<ConsultationSession> & {
    name: string;
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lng: number;
    language: ConsultationLanguage;
  }
): ConsultationSession {
  return {
    id: `aud-${Math.random().toString(36).substring(2, 9)}`,
    timezone: 5.5,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1200000).toISOString(),
    status: "active" as const,
    hasProvidedContact: true,
    bonusMinuteClaimed: false,
    messages: [],
    ...overrides
  };
}

describe("20-Minute Live Consultation Session: 10 New Users Multi-Language Input/Output & Speech Repetition Audit", () => {
  // =========================================================================
  // 1. DEDUPLICATION ENGINE RIGOROUS REPETITION TESTS (10x-20x Words & Phrases)
  // =========================================================================
  describe("1. Speech & Input Deduplication: Stutter & Loop Collapse Across All Languages", () => {
    it("collapses single words repeated 10x, 20x, or 30x in any language", () => {
      // Kannada: 20x repeat
      const knRepeated = Array(20).fill("ಯಾವಾಗ").join(" ");
      expect(sanitizeDuplicateSpeechWords(knRepeated)).toBe("ಯಾವಾಗ");

      // Hindi: 20x repeat
      const hiRepeated = Array(20).fill("शादी").join(" ");
      expect(sanitizeDuplicateSpeechWords(hiRepeated)).toBe("शादी");

      // Telugu: 20x repeat
      const teRepeated = Array(20).fill("ఎప్పుడు").join(" ");
      expect(sanitizeDuplicateSpeechWords(teRepeated)).toBe("ఎప్పుడు");

      // Tamil: 20x repeat
      const taRepeated = Array(20).fill("எப்போது").join(" ");
      expect(sanitizeDuplicateSpeechWords(taRepeated)).toBe("எப்போது");

      // English: 20x repeat
      const enRepeated = Array(20).fill("when").join(" ");
      expect(sanitizeDuplicateSpeechWords(enRepeated)).toBe("when");

      // Malayalam: 20x repeat
      const mlRepeated = Array(20).fill("എപ്പോൾ").join(" ");
      expect(sanitizeDuplicateSpeechWords(mlRepeated)).toBe("എപ്പോൾ");

      // Marathi: 20x repeat
      const mrRepeated = Array(20).fill("कधी").join(" ");
      expect(sanitizeDuplicateSpeechWords(mrRepeated)).toBe("कधी");
    });

    it("collapses multi-word phrases repeated 5x to 10x without deleting normal sentences", () => {
      // 2-word phrase repeated 6 times
      const knPhrase = Array(6).fill("ನನ್ನ ಮದುವೆ").join(" ") + " ಯಾವಾಗ ಆಗುತ್ತದೆ?";
      expect(sanitizeDuplicateSpeechWords(knPhrase)).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?");

      // 3-word phrase repeated 4 times in English
      const enPhrase = Array(4).fill("will I get").join(" ") + " promotion this year?";
      expect(sanitizeDuplicateSpeechWords(enPhrase)).toBe("will I get promotion this year?");

      // Hindi multi-word stutter
      const hiPhrase = "मुझे मुझे नौकरी कब कब मिलेगी मिलेगी?";
      expect(sanitizeDuplicateSpeechWords(hiPhrase)).toBe("मुझे नौकरी कब मिलेगी?");
    });

    it("ensures deduplicateResponseText cleans AI stutter and loops from output text", () => {
      const repeatedAiText = `
        ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಭ ಯೋಗವಿದೆ ಶುಭ ಯೋಗವಿದೆ.

        ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಭ ಯೋಗವಿದೆ ಶುಭ ಯೋಗವಿದೆ.

        ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ವಿಜಯ ಲಭಿಸಲಿ.
      `;

      const cleaned = deduplicateResponseText(repeatedAiText);
      const paras = cleaned.split("\n\n");
      // Paragraph 2 was identical to Paragraph 1, so it must be deduplicated
      expect(paras.length).toBe(2);
      expect(cleaned).not.toContain("ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ");
      expect(cleaned).not.toContain("ಶುಭ ಯೋಗವಿದೆ ಶುಭ ಯೋಗವಿದೆ");
    });
  });

  // =========================================================================
  // 2. 10 REAL-WORLD USERS WITH FULL ASTROLOGICAL INPUT PARAMETERS
  // =========================================================================
  describe("2. End-to-End Live Audit for 10 Diverse User Profiles", () => {
    // -----------------------------------------------------------------------
    // User 1: Ramesh Gowda - Kannada, Aries (Mesha) Lagna
    // Verify: Lagna Lord is Mars; NO Diamond; Red Coral prescribed for Bhagya
    // -----------------------------------------------------------------------
    it("User 1 [KN, Aries Lagna]: Audits marriage question, verifying Red Coral (NOT Diamond)", async () => {
      const user1 = createMockSession({
        name: "ರಮೇಶ್ ಗೌಡ (Ramesh Gowda)",
        dob: "1996-04-18",
        tob: "06:15",
        place: "Bengaluru",
        lat: 12.9716,
        lng: 77.5946,
        language: "kn"
      });

      const astro = await computeDevoteeKundli(user1);
      expect(astro.lagnaName).toContain("ಮೇಷ");

      // Simulate voice input with stutter
      const rawSpoken = "ನನ್ನ ನನ್ನ ನನ್ನ ಮದುವೆ ಮದುವೆ ಯಾವಾಗ ಯಾವಾಗ ಆಗುತ್ತದೆ ಆಗುತ್ತದೆ?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawSpoken);
      expect(cleanQuestion).toBe("ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?");

      // Verify marriage reading respects Aries Lagna: NO Diamond, but Red Coral
      const marriageReading = buildDeterministicMarriageReading(user1, cleanQuestion, astro);
      expect(marriageReading).toContain("ಕೆಂಪು ಹವಳ");
      expect(marriageReading).not.toContain("ವಜ್ರ");

      const gemText = getLagnaPrescribedGemstoneText(astro, "kn");
      expect(gemText).toContain("ಕೆಂಪು ಹವಳ");
    });

    // -----------------------------------------------------------------------
    // User 2: Priya Sharma - Hindi, Taurus (Vrishabha) Lagna
    // Verify: Lagna Lord is Venus; Diamond / White Zircon IS prescribed
    // -----------------------------------------------------------------------
    it("User 2 [HI, Taurus Lagna]: Audits career and gemstone question, verifying Diamond/White Zircon", async () => {
      const user2 = createMockSession({
        name: "प्रिया शर्मा (Priya Sharma)",
        dob: "1994-05-20",
        tob: "05:30",
        place: "Delhi",
        lat: 28.6139,
        lng: 77.209,
        language: "hi"
      });

      const astro = await computeDevoteeKundli(user2);
      expect(astro.lagnaName).toContain("वृषभ");

      const rawQuestion = "मेरी शादी कब होगी कब होगी बताइए?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawQuestion);
      expect(cleanQuestion).toBe("मेरी शादी कब होगी बताइए?");

      const marriageReading = buildDeterministicMarriageReading(user2, cleanQuestion, astro);
      expect(marriageReading).toContain("हीरा");
      expect(marriageReading).toContain("सफेद जरकन");

      const gemText = getLagnaPrescribedGemstoneText(astro, "hi");
      expect(gemText).toContain("हीरा");
    });

    // -----------------------------------------------------------------------
    // User 3: Venkata Rao - Telugu, Cancer (Karka) Lagna
    // Verify: Lagna Lord is Moon; Natural Pearl prescribed, NO Diamond
    // -----------------------------------------------------------------------
    it("User 3 [TE, Cancer Lagna]: Audits marriage question, verifying Natural Pearl (Mukta), NO Diamond", async () => {
      const user3 = createMockSession({
        name: "వెంకట రావు (Venkata Rao)",
        dob: "1998-07-28",
        tob: "06:45",
        place: "Hyderabad",
        lat: 17.385,
        lng: 78.4867,
        language: "te"
      });

      const astro = await computeDevoteeKundli(user3);
      expect(astro.lagnaName).toContain("కర్కాటక");

      const rawQuestion = "నా పెళ్లి ఎప్పుడు ఎప్పుడు అవుతుంది అవుతుంది?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawQuestion);
      expect(cleanQuestion).toBe("నా పెళ్లి ఎప్పుడు అవుతుంది?");

      const reading = buildDeterministicMarriageReading(user3, cleanQuestion, astro);
      expect(reading).toContain("ముత్యం"); // Pearl
      expect(reading).not.toContain("వజ్రం"); // No Diamond

      const gemText = getLagnaPrescribedGemstoneText(astro, "te");
      expect(gemText).toContain("ముత్యం");
    });

    // -----------------------------------------------------------------------
    // User 4: Lakshmi Narayanan - Tamil, Leo (Simha) Lagna
    // Verify: Lagna Lord is Sun; Ruby prescribed, NO Diamond
    // -----------------------------------------------------------------------
    it("User 4 [TA, Leo Lagna]: Audits career and marriage question, verifying Ruby (Manikya), NO Diamond", async () => {
      const user4 = createMockSession({
        name: "லக்ஷ்மி நாராயணன் (Lakshmi Narayanan)",
        dob: "1993-08-30",
        tob: "06:15",
        place: "Chennai",
        lat: 13.0827,
        lng: 80.2707,
        language: "ta"
      });

      const astro = await computeDevoteeKundli(user4);
      expect(astro.lagnaName).toContain("சிம்ம");

      const rawQuestion = "எனக்கு திருமணம் எப்போது எப்போது நடக்கும்?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawQuestion);
      expect(cleanQuestion).toBe("எனக்கு திருமணம் எப்போது நடக்கும்?");

      const reading = buildDeterministicMarriageReading(user4, cleanQuestion, astro);
      expect(reading).toContain("மாணிக்கம்"); // Ruby
      expect(reading).not.toContain("வைரம்"); // No Diamond

      const gemText = getLagnaPrescribedGemstoneText(astro, "ta");
      expect(gemText).toContain("மாணிக்கம்");
    });

    // -----------------------------------------------------------------------
    // User 5: David Miller - English, Libra (Tula) Lagna
    // Verify: Venus Lagnesha -> Diamond/Zircon; Yellow Sapphire strictly prohibited
    // -----------------------------------------------------------------------
    it("User 5 [EN, Libra Lagna]: Audits Yellow Sapphire inquiry, verifying strict rejection and Diamond/Zircon blessing", async () => {
      const user5 = createMockSession({
        name: "David Miller",
        dob: "1997-10-15",
        tob: "08:30",
        place: "Udupi",
        lat: 13.34,
        lng: 74.74,
        language: "en"
      });

      const astro = await computeDevoteeKundli(user5);
      expect(astro.lagnaName).toContain("Libra");

      // User asks about Yellow Sapphire for Libra
      const question = "Can I wear Yellow Sapphire (Pushparaga) for success in career?";
      const answer = await generateConsultationAnswer({
        session: user5,
        userQuestion: question
      });

      // Must explicitly prohibit Yellow Sapphire because Jupiter is 3rd & 6th lord
      expect(answer.fullText).toContain("STRICTLY PROHIBITED");
      expect(answer.fullText).toContain("6th lord");
      expect(answer.fullText).toContain("Diamond (Vajra) or natural White Zircon");
    });

    // -----------------------------------------------------------------------
    // User 6: Anjali Menon - Malayalam, Scorpio (Vrischika) Lagna
    // Verify: Mars Lagnesha -> Red Coral (പവിഴം), NO Diamond
    // -----------------------------------------------------------------------
    it("User 6 [ML, Scorpio Lagna]: Audits marriage question, verifying Red Coral (പവിഴം)", async () => {
      const user6 = createMockSession({
        name: "അഞ്ജലി മേനോൻ (Anjali Menon)",
        dob: "1995-11-20",
        tob: "07:00",
        place: "Kochi",
        lat: 9.9312,
        lng: 76.2673,
        language: "ml"
      });

      const astro = await computeDevoteeKundli(user6);
      expect(astro.lagnaName).toContain("വൃശ്ചിക");

      const rawQuestion = "എന്റെ വിവാഹം എപ്പോൾ എപ്പോൾ നടക്കും?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawQuestion);
      expect(cleanQuestion).toBe("എന്റെ വിവാഹം എപ്പോൾ നടക്കും?");

      const reading = buildDeterministicMarriageReading(user6, cleanQuestion, astro);
      expect(reading).toContain("പവിഴം"); // Coral
      expect(reading).not.toContain("വജ്രം"); // No Diamond
    });

    // -----------------------------------------------------------------------
    // User 7: Rohan Kulkarni - Marathi, Sagittarius (Dhanu) Lagna
    // Verify: Jupiter Lagnesha -> Yellow Sapphire (पुखराज), NO Diamond
    // -----------------------------------------------------------------------
    it("User 7 [MR, Sagittarius Lagna]: Audits marriage question, verifying Yellow Sapphire (पुखराज)", async () => {
      const user7 = createMockSession({
        name: "रोहन कुलकर्णी (Rohan Kulkarni)",
        dob: "1991-12-25",
        tob: "07:30",
        place: "Pune",
        lat: 18.5204,
        lng: 73.8567,
        language: "mr"
      });

      const astro = await computeDevoteeKundli(user7);
      expect(astro.lagnaName).toContain("धनु");

      const rawQuestion = "माझे लग्न कधी कधी होईल?";
      const cleanQuestion = sanitizeDuplicateSpeechWords(rawQuestion);
      expect(cleanQuestion).toBe("माझे लग्न कधी होईल?");

      const reading = buildDeterministicMarriageReading(user7, cleanQuestion, astro);
      expect(reading).toContain("पुखराज"); // Yellow Sapphire
      expect(reading).not.toContain("हिरा"); // No Diamond
    });

    // -----------------------------------------------------------------------
    // User 8: Deepa Bhat - Kannada, Capricorn (Makara) Lagna
    // Verify: Foreign settlement inquiry confirms Swadesha stability
    // -----------------------------------------------------------------------
    it("User 8 [KN, Capricorn Lagna]: Audits abroad settlement question, verifying Swadesha grounding", async () => {
      const user8 = createMockSession({
        name: "ದೀಪಾ ಭಟ್ (Deepa Bhat)",
        dob: "1997-01-15",
        tob: "07:15",
        place: "Mangaluru",
        lat: 12.9141,
        lng: 74.856,
        language: "kn"
      });

      const question = "ನಾನು ಶಾಶ್ವತವಾಗಿ ವಿದೇಶದಲ್ಲಿ ಸೆಟಲ್ ಆಗಬಹುದಾ?";
      const reply = await presentConsultationReply({
        session: user8,
        userQuestion: question
      });

      expect(reply.fullText).toContain("ಸ್ವದೇಶ");
      expect(reply.fullText).toContain("ಶಾಶ್ವತ");
      // Must not contain duplicated words
      expect(reply.fullText).not.toMatch(/(.+?)\s+\1\s+\1/);
    });

    // -----------------------------------------------------------------------
    // User 9: Amit Verma - Hindi, Aquarius (Kumbha) Lagna
    // Verify: Property investment inquiry confirms clear title land blessed
    // -----------------------------------------------------------------------
    it("User 9 [HI, Aquarius Lagna]: Audits property investment question", async () => {
      const user9 = createMockSession({
        name: "अमित वर्मा (Amit Verma)",
        dob: "1990-02-14",
        tob: "07:45",
        place: "Lucknow",
        lat: 26.8467,
        lng: 80.9462,
        language: "hi"
      });

      const question = "क्या मुझे नया मकान या जमीन खरीदनी चाहिए?";
      const reply = await presentConsultationReply({
        session: user9,
        userQuestion: question
      });

      expect(reply.fullText).toContain("घर");
      expect(reply.fullText).toContain("श्री क्षेत्र गोकर्ण");
      expect(reply.fullText).not.toMatch(/(.+?)\s+\1\s+\1/);
    });

    // -----------------------------------------------------------------------
    // User 10: Swathi Reddy - Telugu, Pisces (Meena) Lagna
    // Verify: Jupiter Lagnesha -> Yellow Sapphire (పుష్యరాగం), NO Diamond
    // -----------------------------------------------------------------------
    it("User 10 [TE, Pisces Lagna]: Audits marriage question, verifying Yellow Sapphire (పుష్యరాగం)", async () => {
      const user10 = createMockSession({
        name: "స్వాతి రెడ్డి (Swathi Reddy)",
        dob: "1999-03-22",
        tob: "06:30",
        place: "Vijayawada",
        lat: 16.5062,
        lng: 80.648,
        language: "te"
      });

      const astro = await computeDevoteeKundli(user10);
      expect(astro.lagnaName).toContain("మీన");

      const question = "నా వివాహం ఎప్పుడు ఖాయమవుతుంది?";
      const reading = buildDeterministicMarriageReading(user10, question, astro);

      expect(reading).toContain("పుష్యరాగం"); // Pushparaga
      expect(reading).not.toContain("వజ్రం"); // No Diamond
    });
  });
});