import { describe, it, expect } from "vitest";
import {
  senseAndCategorizeQuestion
} from "../features/consultation/consultationPresenterEngine";
import {
  analyzeQuestionComplexity,
  buildDeterministicGovtJobReading,
  buildDeterministicBusinessVsJobReading,
  buildDeterministicDebtReliefReading,
  buildDeterministicLegalCaseReading,
  buildDeterministicHealthReading,
  buildDeterministicCompetitiveExamReading,
  detectAndResolveUltaPaltaProbe
} from "../features/consultation/consultationAIEngine";
import {
  CONSULTATION_CHAT_UI_I18N,
  type ConsultationLanguage,
  type ConsultationSession,
  type ConsultationRulingRecord
} from "../features/consultation/consultationTypes";

function createMockSession(lang: ConsultationLanguage = "kn"): ConsultationSession {
  return {
    id: `test_cst_${Date.now()}`,
    name: "ರಾಘವೇಂದ್ರ (Raghavendra)",
    dob: "1994-05-18",
    tob: "06:30",
    place: "Gokarna",
    lat: 14.54,
    lng: 74.31,
    timezone: 5.5,
    language: lang,
    durationMinutes: 20,
    graceDeleteMinutes: 10,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1200000).toISOString(),
    status: "active",
    hasProvidedContact: false,
    bonusMinuteClaimed: false,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362",
    messages: []
  };
}

describe("20-Minute Live Consultation: Classical Astrological Domains & 100% Accuracy Audit", () => {
  const languages: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];

  describe("1. Header Subtitle and Gokarna Town Localization", () => {
    it("verifies all 7 languages have non-empty headerSubtitle and gokarnaTown", () => {
      for (const lang of languages) {
        const ui = CONSULTATION_CHAT_UI_I18N[lang];
        expect(ui.headerSubtitle).toBeTruthy();
        expect(ui.gokarnaTown).toBeTruthy();
        expect(typeof ui.headerSubtitle).toBe("string");
        expect(typeof ui.gokarnaTown).toBe("string");
        if (lang !== "en") {
          // Verify no English leak in non-English headers
          expect(ui.headerSubtitle).not.toMatch(/\b(Consultation|Interactive|Live)\b/i);
        }
      }
    });
  });

  describe("2. Frontline Sensing for New Classical Domains", () => {
    it("categorizes Government Job queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ನನಗೆ ಸರ್ಕಾರಿ ಕೆಲಸ ಸಿಗುತ್ತಾ ಅಥವಾ ಪ್ರೈವೇಟ್ ಮಾಡಬೇಕಾ?", session);
      expect(r1.category).toBe("GOVERNMENT_JOB_AUTHORITY");
      expect(r1.categoryLabel).toContain("ಸರ್ಕಾರಿ ಉದ್ಯೋಗ");

      const r2 = senseAndCategorizeQuestion("Will I get a sarkari government job or private sector?", session);
      expect(r2.category).toBe("GOVERNMENT_JOB_AUTHORITY");

      const r3 = senseAndCategorizeQuestion("क्या मुझे सरकारी नौकरी मिलेगी या प्राइवेट?", session);
      expect(r3.category).toBe("GOVERNMENT_JOB_AUTHORITY");
    });

    it("categorizes Business vs Job & Partnership queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ಸ್ವಂತ ವ್ಯಾಪಾರ ಮಾಡಬೇಕಾ ಅಥವಾ ಕೆಲಸವೇ ಬೆಸ್ಟಾ? ಪಾರ್ಟ್ನರ್‌ಶಿಪ್ ಮಾಡಬಹುದಾ?", session);
      expect(r1.category).toBe("BUSINESS_VS_JOB_COMMERCE");
      expect(r1.categoryLabel).toContain("ವ್ಯಾಪಾರ vs ಉದ್ಯೋಗ");

      const r2 = senseAndCategorizeQuestion("Should I do own business or job? Can I do partnership?", session);
      expect(r2.category).toBe("BUSINESS_VS_JOB_COMMERCE");
    });

    it("categorizes Debt Relief queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ಸಾಲ ಮುಕ್ತಿ ಯಾವಾಗ ಸಿಗುತ್ತೆ? ಸಾಲ ತೀರಿಸಲು ದಾರಿ ಏನು?", session);
      expect(r1.category).toBe("DEBT_RELIEF_FINANCE");

      const r2 = senseAndCategorizeQuestion("How to get debt relief and pay off loans?", session);
      expect(r2.category).toBe("DEBT_RELIEF_FINANCE");
    });

    it("categorizes Legal Court Case queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ಕೋರ್ಟ್ ಕೇಸ್ ಯಾವಾಗ ಇತ್ಯರ್ಥವಾಗುತ್ತೆ? ನಮಗೆ ಗೆಲುವು ಸಿಗುತ್ತಾ?", session);
      expect(r1.category).toBe("LEGAL_DISPUTE_VICTORY");

      const r2 = senseAndCategorizeQuestion("When will my court case resolve and will I win the legal dispute?", session);
      expect(r2.category).toBe("LEGAL_DISPUTE_VICTORY");
    });

    it("categorizes Health Recovery queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಯಾವಾಗ? ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ (ಸರ್ಜರಿ) ಆಗಬೇಕಾ?", session);
      expect(r1.category).toBe("HEALTH_VITALITY_HEALING");

      const r2 = senseAndCategorizeQuestion("When will my health recovery happen and will I need surgery?", session);
      expect(r2.category).toBe("HEALTH_VITALITY_HEALING");
    });

    it("categorizes Competitive Exam queries accurately", () => {
      const session = createMockSession("kn");
      const r1 = senseAndCategorizeQuestion("ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪಾಸ್ ಆಗುತ್ತೇನಾ? ರ್ಯಾಂಕ್ ಬರುತ್ತಾ?", session);
      expect(r1.category).toBe("COMPETITIVE_EXAM_SUCCESS");

      const r2 = senseAndCategorizeQuestion("Will I clear the competitive exam and get top rank?", session);
      expect(r2.category).toBe("COMPETITIVE_EXAM_SUCCESS");
    });
  });

  describe("3. Complexity Engine & 80/20 Rule Directives", () => {
    it("routes to exact domains with exactly 2 paragraphs target", () => {
      const g = analyzeQuestionComplexity("ಸರ್ಕಾರಿ ಕೆಲಸ ಸಿಗುತ್ತಾ?");
      expect(g.domain).toBe("GOVERNMENT_JOB");
      expect(g.targetParagraphs).toBe(2);
      expect(g.promptDirective).toContain("GOVERNMENT JOB VS PRIVATE SECTOR");

      const b = analyzeQuestionComplexity("ಸ್ವಂತ ವ್ಯಾಪಾರ ಮಾಡಬೇಕಾ?");
      expect(b.domain).toBe("BUSINESS_VS_JOB");
      expect(b.targetParagraphs).toBe(2);
      expect(b.promptDirective).toContain("BUSINESS VS EMPLOYMENT & PARTNERSHIP");

      const d = analyzeQuestionComplexity("ಸಾಲ ಮುಕ್ತಿ ಯಾವಾಗ?");
      expect(d.domain).toBe("DEBT_FINANCIAL_RELIEF");
      expect(d.targetParagraphs).toBe(2);
      expect(d.promptDirective).toContain("DEBT RELIEF & FINANCIAL REVIVAL");

      const l = analyzeQuestionComplexity("ಕೋರ್ಟ್ ಕೇಸ್ ಗೆಲುವು ಯಾವಾಗ?");
      expect(l.domain).toBe("LEGAL_COURT_CASE");
      expect(l.targetParagraphs).toBe(2);
      expect(l.promptDirective).toContain("LEGAL DISPUTE & COURT CASE");

      const h = analyzeQuestionComplexity("ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಯಾವಾಗ?");
      expect(h.domain).toBe("HEALTH_LONGEVITY");
      expect(h.targetParagraphs).toBe(2);
      expect(h.promptDirective).toContain("HEALTH RECOVERY & LONGEVITY");

      const e = analyzeQuestionComplexity("ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಪಾಸ್ ಆಗುತ್ತೇನಾ?");
      expect(e.domain).toBe("COMPETITIVE_EXAM_EDUCATION");
      expect(e.targetParagraphs).toBe(2);
      expect(e.promptDirective).toContain("COMPETITIVE EXAM & ACADEMIC MERIT");
    });
  });

  describe("4. Deterministic Readings Across All 7 Languages (Zero English Token Leakage in Indic Scripts)", () => {
    it("generates deterministic Government Job readings across all 7 languages", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicGovtJobReading(session, "Govt job query", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        expect(text).toBeTruthy();
        if (lang === "kn") {
          expect(text).toContain("೧೦ನೇ ಕರ್ಮಸ್ಥಾನ");
          expect(text).toContain("ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ");
          expect(text).not.toMatch(/\b(government|job|sun|career)\b/i);
        } else if (lang === "hi") {
          expect(text).toContain("दशम भाव");
          expect(text).toContain("आदित्य हृदय स्तोत्र");
        }
      }
    });

    it("generates deterministic Business vs Job readings across all 7 languages with strict partnership warning", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicBusinessVsJobReading(session, "Business or job?", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        if (lang === "en") {
          expect(text).toContain("STRICTLY PROHIBITED");
          expect(text).toContain("sole proprietor");
        } else if (lang === "kn") {
          expect(text).toContain("ಪಾಲುದಾರಿಕೆ");
          expect(text).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಮಾಡಬಾರದು");
          expect(text).toContain("ಮಹಾಗಣಪತಿ");
          expect(text).not.toMatch(/\b(partnership|business|sole proprietorship)\b/i);
        }
      }
    });

    it("generates deterministic Debt Relief readings across all 7 languages with Runavimochana Stotra", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicDebtReliefReading(session, "Debt relief?", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        if (lang === "kn") {
          expect(text).toContain("ಋಣವಿಮೋಚನ ಮಂಗಳ ಸ್ತೋತ್ರ");
          expect(text).toContain("ಮಹಾರುದ್ರಾಭಿಷೇಕ");
          expect(text).not.toMatch(/\b(debt|loan|interest)\b/i);
        } else if (lang === "en") {
          expect(text).toContain("Runavimochana Mangala Stotra");
          expect(text).toContain("Rudrabhisheka");
        }
      }
    });

    it("generates deterministic Legal Dispute readings across all 7 languages with Subrahmanya Shatru Samhara", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicLegalCaseReading(session, "Court case?", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        if (lang === "kn") {
          expect(text).toContain("ಶತ್ರು ಸಂಹಾರ ತ್ರಿಶತೀ");
          expect(text).not.toMatch(/\b(court|case|litigation)\b/i);
        }
      }
    });

    it("generates deterministic Health Recovery readings across all 7 languages with Maha Mrityunjaya Japa", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicHealthReading(session, "Health recovery?", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        if (lang === "kn") {
          expect(text).toContain("ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ");
          expect(text).not.toMatch(/\b(health|doctor|surgery)\b/i);
        }
      }
    });

    it("generates deterministic Competitive Exam readings across all 7 languages with Medha Sukta", () => {
      for (const lang of languages) {
        const session = createMockSession(lang);
        const text = buildDeterministicCompetitiveExamReading(session, "Competitive exam?", undefined);
        const paras = text.split(/\n\n+/).filter(Boolean);
        expect(paras.length).toBeGreaterThanOrEqual(2);
        expect(paras.length).toBeLessThanOrEqual(3);
        if (lang === "kn") {
          expect(text).toContain("ಮೇಧಾ ಸೂಕ್ತ");
          expect(text).not.toMatch(/\b(exam|rank|student)\b/i);
        }
      }
    });
  });

  describe("5. Ulta-Palta Contradiction Memory Defenses", () => {
    it("strictly refuses 50-50 partnership when previously rejected in rulingsLedger", () => {
      const ledger: ConsultationRulingRecord[] = [
        {
          domain: "BUSINESS_VS_JOB",
          questionSummary: "Business vs Job",
          primaryVerdict: "Sole proprietorship favored; partnership warned against.",
          rejectedOptions: ["50-50 partnership with friends"],
          approvedOptions: ["Sole proprietorship"]
        }
      ];

      // Kannada inquiry
      const knReply = detectAndResolveUltaPaltaProbe("ನನ್ನ ಗೆಳೆಯನ ಜೊತೆ 50-50 ಪಾಲುದಾರಿಕೆ ಮಾಡಬಹುದಾ?", ledger, "kn");
      expect(knReply).toBeTruthy();
      expect(knReply).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧವಾಗಿದೆ");

      // English inquiry
      const enReply = detectAndResolveUltaPaltaProbe("Can I do 50-50 partnership with my friend?", ledger, "en");
      expect(enReply).toBeTruthy();
      expect(enReply).toContain("STRICTLY PROHIBITED");

      // Hindi inquiry
      const hiReply = detectAndResolveUltaPaltaProbe("क्या मैं मित्र के साथ साझेदारी कर सकता हूँ?", ledger, "hi");
      expect(hiReply).toBeTruthy();
      expect(hiReply).toContain("पूर्णतः वर्जित है");
    });

    it("strictly warns against taking fresh speculative debt", () => {
      const ledger: ConsultationRulingRecord[] = [
        {
          domain: "DEBT_FINANCIAL_RELIEF",
          questionSummary: "Debt Relief",
          primaryVerdict: "Systematic repayment under Runavimochana.",
          rejectedOptions: ["Taking fresh high-interest debt"],
          approvedOptions: ["Principal repayment"]
        }
      ];

      const knReply = detectAndResolveUltaPaltaProbe("ಸಾಲ ತೀರಿಸಲು ಮತ್ತೆ ಹೊಸ ಸಾಲ ಮಾಡಬಹುದಾ?", ledger, "kn");
      expect(knReply).toBeTruthy();
      expect(knReply).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ವಿರೋಧಿಸುತ್ತದೆ");

      const enReply = detectAndResolveUltaPaltaProbe("Can I take more debt or fresh loan to invest?", ledger, "en");
      expect(enReply).toBeTruthy();
      expect(enReply).toContain("strictly warned against");
    });
  });
});
