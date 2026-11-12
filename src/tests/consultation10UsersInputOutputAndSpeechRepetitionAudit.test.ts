import { describe, it, expect, vi } from "vitest";

// Mock GeminiEngine to instantly engage deterministic engine during unit testing
vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn(async () => {
    throw new Error("Deterministic Fallback Triggered");
  })
}));

import {
  presentConsultationReply
} from "../features/consultation/consultationPresenterEngine";
import {
  generateConsultationAnswer,
  buildDeterministicMarriageReading,
  buildDeterministicSanthanaReading,
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
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362",
    messages: [],
    rulingsLedger: [],
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

      // Verify marriage reading respects Aries Lagna: NO Diamond, pure matrimonial timing without unsolicited remedy
      const marriageReading = buildDeterministicMarriageReading(user1, cleanQuestion, astro);
      expect(marriageReading).not.toContain("ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ");
      expect(marriageReading).not.toContain("ವಜ್ರ");

      const readingWithRemedy = buildDeterministicMarriageReading(user1, cleanQuestion + " ಪರಿಹಾರವೇನು?", astro);
      expect(readingWithRemedy).toContain("ಕಲ್ಯಾಣ ಸಂಕಲ್ಪ");

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
      expect(marriageReading).not.toContain("कल्याण संकल्प");
      expect(marriageReading).not.toContain("सफेद जरकन"); // Marriage reading does not give unsolicited gemstone advice

      const readingWithRemedy = buildDeterministicMarriageReading(user2, cleanQuestion + " कोई उपाय बताएं?", astro);
      expect(readingWithRemedy).toContain("कल्याण संकल्प");

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
      expect(reading).not.toContain("కళ్యాణ సంకల్ప");
      expect(reading).not.toContain("వజ్రం"); // No Diamond

      const readingWithRemedy = buildDeterministicMarriageReading(user3, cleanQuestion + " పరిహారం ఏమిటి?", astro);
      expect(readingWithRemedy).toContain("కళ్యాణ సంకల్ప");

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
      expect(reading).not.toContain("கல்யாண சங்கல்ப");
      expect(reading).not.toContain("வைரம்"); // No Diamond

      const readingWithRemedy = buildDeterministicMarriageReading(user4, cleanQuestion + " பரிகாரம் அல்லது பூஜை என்ன?", astro);
      expect(readingWithRemedy).toContain("கல்யாண சங்கல்ப");

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
      expect(reading).not.toContain("കല്യാണ സങ്കൽപ്പ");
      expect(reading).not.toContain("വജ്രം"); // No Diamond

      const readingWithRemedy = buildDeterministicMarriageReading(user6, cleanQuestion + " പരിഹാരം എന്താണ്?", astro);
      expect(readingWithRemedy).toContain("കല്യാണ സങ്കൽപ്പ");

      const gemText = getLagnaPrescribedGemstoneText(astro, "ml");
      expect(gemText).toContain("പവിഴം");
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
      expect(reading).not.toContain("कल्याण संकल्प");
      expect(reading).not.toContain("हिरा"); // No Diamond

      const readingWithRemedy = buildDeterministicMarriageReading(user7, cleanQuestion + " काही उपाय सांगा?", astro);
      expect(readingWithRemedy).toContain("कल्याण संकल्प");

      const gemText = getLagnaPrescribedGemstoneText(astro, "mr");
      expect(gemText).toContain("पुखराज");
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

      expect(reading).not.toContain("కళ్యాణ సంకల్ప");
      expect(reading).not.toContain("వజ్రం"); // No Diamond

      const readingWithRemedy = buildDeterministicMarriageReading(user10, question + " పరిహారం ఏమిటి?", astro);
      expect(readingWithRemedy).toContain("కళ్యాణ సంకల్ప");

      const gemText = getLagnaPrescribedGemstoneText(astro, "te");
      expect(gemText).toContain("పుష్యరాగం");
    });
  });

  // =========================================================================
  // 3. SANTHANA & PROGENY DUAL-PERSPECTIVE 99% ACCURACY AUDIT
  // =========================================================================
  describe("3. Santhana & Progeny Dual-Perspective 99% Astrological Accuracy Audit", () => {
    it("delivers authentic 85%-90% Santhana yoga and dual-perspective without unsolicited remedy across languages", () => {
      const devotee = createMockSession({
        name: "Santosh Kumar",
        dob: "1992-06-15",
        tob: "08:20",
        place: "Shivamogga",
        lat: 13.9299,
        lng: 75.5681,
        language: "kn"
      });

      // 1. Kannada: No remedy requested
      const readingKn = buildDeterministicSanthanaReading(devotee, "ನನಗೆ ಸಂತಾನ ಯೋಗ ಯಾವಾಗ?", undefined);
      expect(readingKn).toContain("೧೦೦% ಖಚಿತ ಜಾತಕ ನಿರ್ಣಯ (ಸಂತಾನ ಭಾಗ್ಯ ಯೋಗ)");
      expect(readingKn).toContain("ಶೇಕಡಾ ೮೫ ರಿಂದ ೯೦ ರಷ್ಟು ಯೋಗ ಬಲದೊಂದಿಗೆ");
      expect(readingKn).toContain("೫ನೇ ಪಂಚಮ ಭಾವ (ಪುತ್ರ ಹಾಗೂ ಸಂತಾನ ಸ್ಥಾನ)");
      expect(readingKn).toContain("ನೀವು ಪ್ರಸ್ತುತ ಸಂತಾನ ನಿರೀಕ್ಷೆಯಲ್ಲಿದ್ದು");
      expect(readingKn).toContain("ನೀವು ಈಗಾಗಲೇ ಮಕ್ಕಳನ್ನು ಹೊಂದಿರುವ ಪೋಷಕರಾಗಿದ್ದರೆ");
      expect(readingKn).not.toContain("ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾ ಹೋಮ");

      // 2. Kannada: Remedy requested
      const readingKnRemedy = buildDeterministicSanthanaReading(devotee, "ಸಂತಾನ ಭಾಗ್ಯಕ್ಕಾಗಿ ಪೂಜೆ ಅಥವಾ ಪರಿಹಾರವೇನು?", undefined);
      expect(readingKnRemedy).toContain("ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಹಾ ಹೋಮ ಹಾಗೂ ನಾಗ ಪ್ರತಿಷ್ಠಾ");
      expect(readingKnRemedy).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(readingKnRemedy).toContain("9972339362");

      // 3. English: Dual perspective
      const readingEn = buildDeterministicSanthanaReading({ ...devotee, language: "en" }, "Tell me about my children / progeny", undefined);
      expect(readingEn).toContain("100% Confident Astrological Ruling Regarding Progeny & Children");
      expect(readingEn).toContain("85% to 90% planetary indication");
      expect(readingEn).toContain("5th house of progeny");
      expect(readingEn).toContain("If you are currently awaiting or planning for a child");
      expect(readingEn).toContain("if you are already blessed with children");
      expect(readingEn).not.toContain("Sri Santhana Gopala Maha Homa");

      // 4. Hindi: Dual perspective
      const readingHi = buildDeterministicSanthanaReading({ ...devotee, language: "hi" }, "क्या मुझे संतान सुख मिलेगा?", undefined);
      expect(readingHi).toContain("१००% निश्चित दैवज्ञ निर्णय (संतान एवं संतति योग)");
      expect(readingHi).toContain("८५% से ९०% ग्रह योगों की अनुकूलता");
      expect(readingHi).toContain("यदि आप वर्तमान में संतान प्राप्ति की प्रतीक्षा में हैं");
      expect(readingHi).toContain("यदि आप पहले से ही संतानवान हैं");
    });
  });
});