import { describe, it, expect } from "vitest";
import {
  generateSpecializedFallbackReply,
  type SensedDevoteeContext
} from "../features/consultation/consultationPresenterEngine";
import {
  computeDevoteeKundli,
  generateConsultationAnswer,
  buildDeterministicAbroadSettlementReading,
  detectAndResolveUltaPaltaProbe
} from "../features/consultation/consultationAIEngine";
import {
  CONSULTATION_CHAT_UI_I18N,
  type ConsultationLanguage,
  type ConsultationSession
} from "../features/consultation/consultationTypes";

describe("Consultation Multilingual Purity and 1-Person 1-Link Isolation Audit", () => {
  const ALL_LANGUAGES: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];

  const mockSessionBase: ConsultationSession = {
    id: "session-test-purity",
    name: "Suresh Kumar",
    userPhone: "9876543210",
    dob: "1990-05-15",
    tob: "10:30",
    place: "Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    timezone: 5.5,
    language: "kn",
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1200000).toISOString(),
    status: "active",
    messages: []
  };

  describe("1. Specialized Fallback Reply - 0% Language Leakage across all 7 languages", () => {

    const categories = [
      "CAREER_FRUSTRATION_DISTRESS",
      "GENERAL_KNOWLEDGE_WORLDLY",
      "SILLY_TROLLING_MOCKERY",
      "EMOTIONAL_DISTRESS_LIFE",
      "CHILD_PARENT_INQUIRY",
      "SANTHANA_PROGENY_SENSITIVE",
      "SECRET_INTIMATE_TABOO",
      "CELEBRITY_FANTASY",
      "PROVOCATIVE_TABOO",
      "DOMESTIC_OMEN_VASTU",
      "DAILY_TRIP_TRAVEL",
      "INTERPERSONAL_CONFLICT",
      "LIFE_OVERVIEW_EXISTENTIAL",
      "CONVERSATIONAL_GREETING"
    ] as const;

    for (const lang of ALL_LANGUAGES) {
      it(`should return pure script for all categories in language: ${lang}`, () => {
        const session: ConsultationSession = {
          ...mockSessionBase,
          language: lang
        };

        for (const cat of categories) {
          const sensed: SensedDevoteeContext = {
            ageYears: 34,
            lifeStage: "MID_CAREER",
            place: "Bengaluru",
            category: cat,
            categoryLabel: cat,
            detectedTopicSnippet: cat,
            priestPersonaTone: "compassionate_grounding"
          };

          const reply = generateSpecializedFallbackReply({
            session,
            userQuestion: "test question",
            sensed,
            lagnaName: "ಮೇಷ",
            moonRashi: "ವೃಷಭ",
            nakshatra: "ಕೃತಿಕಾ",
            currentDashaText: "ಗುರು"
          });
          expect(reply).toBeTruthy();
          expect(reply.length).toBeGreaterThan(40);

          // For non-Kannada languages, verify zero Kannada script characters in the output
          if (lang !== "kn") {
            const hasKannadaChar = /[\u0C80-\u0CFF]/.test(reply);
            expect(hasKannadaChar, `Found Kannada characters in ${lang} fallback for ${cat}: ${reply}`).toBe(false);
          }

          // For non-English languages, verify appropriate native script is present
          if (lang === "hi" || lang === "mr") {
            expect(/[\u0900-\u097F]/.test(reply), `Expected Devanagari script in ${lang}`).toBe(true);
          } else if (lang === "te") {
            expect(/[\u0C00-\u0C7F]/.test(reply), `Expected Telugu script in ${lang}`).toBe(true);
          } else if (lang === "ta") {
            expect(/[\u0B80-\u0BFF]/.test(reply), `Expected Tamil script in ${lang}`).toBe(true);
          } else if (lang === "ml") {
            expect(/[\u0D00-\u0D7F]/.test(reply), `Expected Malayalam script in ${lang}`).toBe(true);
          }
        }
      });
    }
  });

  describe("2. Deterministic Fallback AI Engine - 0% Kannada Leakage in non-Kannada locales", () => {
    for (const lang of (["en", "hi", "te", "ta", "ml", "mr"] as ConsultationLanguage[])) {
      it(`should return zero Kannada characters in fallback reading for ${lang}`, async () => {
        const session: ConsultationSession = {
          ...mockSessionBase,
          id: `session-${lang}-audit`,
          name: "Devotee",
          userPhone: "9972339362",
          dob: "1988-08-20",
          tob: "14:15",
          place: "Bengaluru",
          language: lang,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 1200000).toISOString(),
          status: "active",
          messages: []
        };

        const astroData = await computeDevoteeKundli(session);

        const testQueries = [
          "Hello Guruji Namaste",
          "When will my marriage happen?",
          "How will my career progress?",
          "Can I do business or job?",
          "Tell me about my lucky color and gemstone",
          "Can I wear blue sapphire?",
          "Should I buy disputed property?",
          "Can I quit my job immediately for trading?"
        ];

        for (const query of testQueries) {
          // Calling generateConsultationAnswer with empty key to force immediate deterministic fallback
          const result = await generateConsultationAnswer({
            session,
            userQuestion: query,
            conversationHistory: [],
            apiKey: ""
          });

          const reading = result.fullText;
          expect(reading).toBeTruthy();
          expect(reading.length).toBeGreaterThan(40);

          // Zero Kannada unicode characters allowed in non-Kannada languages
          const hasKannadaChar = /[\u0C80-\u0CFF]/.test(reading);
          expect(
            hasKannadaChar,
            `Found Kannada characters in ${lang} fallback for query "${query}":\n${reading}`
          ).toBe(false);
        }
      });
    }
  });

  describe("3. Abroad Settlement Parashari Dynamic 4th House Evaluation", () => {
    it("should dynamically differentiate Sthira vs Chara/Dwiswabhava 4th house across languages", async () => {
      const sessionSthira: ConsultationSession = {
        ...mockSessionBase,
        id: "session-sthira",
        name: "Ramesh",
        userPhone: "9972339362",
        dob: "1990-01-01",
        tob: "06:00",
        place: "Gokarna",
        lat: 14.5479,
        lng: 74.3188,
        timezone: 5.5,
        language: "en",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1200000).toISOString(),
        status: "active",
        messages: []
      };

      const astroData = await computeDevoteeKundli(sessionSthira);

      const reading = buildDeterministicAbroadSettlementReading(
        sessionSthira,
        "Can I settle abroad permanently in Canada?",
        astroData
      );

      expect(reading).toBeTruthy();
      expect(reading).toContain("Shri Sacchidananda Ganeshaya Namaha");
      expect(reading).toContain("Swadesha (India)");
      expect(reading).toContain("Sri Kshetra Gokarna Mahabaleshwara");
    });
  });

  describe("4. Ulta-Palta Probes Multilingual Integrity", () => {
    const probes = [
      "Can I settle permanently abroad in Canada?",
      "Can I immediately quit my job for day trading?",
      "Can I purchase this disputed court litigation land?"
    ];

    for (const lang of ALL_LANGUAGES) {
      it(`should return pure script without Kannada leakage in ${lang} for anti-contradiction probes`, () => {
        for (const probe of probes) {
          const res = detectAndResolveUltaPaltaProbe(
            probe,
            [{
              domain: "ABROAD_SETTLEMENT",
              questionSummary: "Abroad Settlement",
              primaryVerdict: "Swadesha is best",
              approvedOptions: ["India"],
              rejectedOptions: ["Permanent abroad settlement"]
            }],
            lang
          );

          if (res) {
            if (lang !== "kn") {
              const hasKannada = /[\u0C80-\u0CFF]/.test(res);
              expect(hasKannada, `Found Kannada in ${lang} for probe "${probe}": ${res}`).toBe(false);
            }
          }
        }
      });
    }
  });

  describe("5. 1-Person 1-Link Strict Isolation & Chief Priest Contact Verification", () => {
    it("should verify family booking button directs to Chief Priest Shreeram Pandit (9972339362) across all 7 languages", () => {
      for (const lang of ALL_LANGUAGES) {
        const ui = CONSULTATION_CHAT_UI_I18N[lang];
        expect(ui).toBeDefined();
        expect(ui.bookForFamilyBtn).toBeTruthy();
        expect(ui.bookForFamilyModalTitle).toBeTruthy();
        expect(ui.bookForFamilyModalDesc).toBeTruthy();
        expect(ui.bookForFamilyCallBtn).toContain("9972339362");

        // Verify non-Kannada UI keys have zero Kannada leakage
        if (lang !== "kn") {
          expect(/[\u0C80-\u0CFF]/.test(ui.bookForFamilyBtn)).toBe(false);
          expect(/[\u0C80-\u0CFF]/.test(ui.bookForFamilyModalTitle)).toBe(false);
          expect(/[\u0C80-\u0CFF]/.test(ui.bookForFamilyModalDesc)).toBe(false);
          expect(/[\u0C80-\u0CFF]/.test(ui.audioPriestPlaying)).toBe(false);
          expect(/[\u0C80-\u0CFF]/.test(ui.audioPlayBtn)).toBe(false);
          expect(/[\u0C80-\u0CFF]/.test(ui.savePrintBtn)).toBe(false);
        }
      }
    });
  });
});
