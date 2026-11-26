import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn(async () => {
    throw new Error("Mocked offline for deterministic test");
  })
}));

import { computeDevoteePanchangaProfile } from "../features/consultation/consultationPanchangaService";
import {
  computeDevoteeKundli,
  calculateAstrologicalTimeline,
  buildDeterministicMarriageReading
} from "../features/consultation/consultationAIEngine";
import { ConsultationSessionPdfTemplate } from "../components/consultation/ConsultationSessionPdfTemplate";
import {
  CONSULTATION_CHAT_UI_I18N,
  type ConsultationSession,
  type ConsultationChatMessage,
  type ConsultationLanguage
} from "../features/consultation/consultationTypes";

function makeSession(lang: ConsultationLanguage): ConsultationSession {
  return {
    id: `bgn_cst_upgrade_${lang}`,
    name: lang === "en" ? "Arjun Rao" : "ಅರ್ಜುನ್ ರಾವ್",
    dob: "1993-05-31",
    tob: "06:30",
    place: "Gokarna",
    lat: 14.5479,
    lng: 74.3188,
    timezone: 5.5,
    language: lang,
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 1200000).toISOString(),
    durationMinutes: 20,
    graceDeleteMinutes: 20,
    priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    priestPhone: "9972339362",
    messages: []
  };
}

describe("20-Minute Consultation Upgrade: Accuracy, Caching, Narration & Baggona Panchanga PDF", () => {
  it("computes timezone-independent Panchanga Patrika with clean localized DOB/TOB formatting", async () => {
    const knProfile = await computeDevoteePanchangaProfile(makeSession("kn"));
    const enProfile = await computeDevoteePanchangaProfile(makeSession("en"));

    expect(knProfile.vaara).toBe("ಸೋಮವಾರ");
    expect(knProfile.dobFormatted).toBe("31 ಮೇ 1993");
    expect(knProfile.tobFormatted).toContain("06:30");

    expect(enProfile.vaara).toBe("Monday (Somavara)");
    expect(enProfile.dobFormatted).toBe("31 May 1993");
    expect(enProfile.tobFormatted).toBe("06:30 AM");
    expect(enProfile.tithi).toBeTruthy();
    expect(enProfile.nakshatra).toBeTruthy();
    expect(enProfile.lagna).toBeTruthy();
  });

  it("caches computeDevoteeKundli across repeated turns and preserves 7-language timeline purity", async () => {
    const langs: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];

    for (const lang of langs) {
      const session = makeSession(lang);
      const first = await computeDevoteeKundli(session);
      const second = await computeDevoteeKundli(session);

      // Same cached reference guarantees zero redundant chart recomputation on repeat Q&A turns
      expect(second).toBe(first);

      const timeline = calculateAstrologicalTimeline(first.kundli, first.ageYears, "MARRIAGE", lang);
      expect(timeline.topicYogaName).toBeTruthy();
      expect(timeline.topicLabel).toBeTruthy();
      expect(timeline.guruTransitNature).toBeTruthy();
      expect(timeline.rangeSummary).toBeTruthy();

      if (lang !== "kn") {
        expect(/[\u0C80-\u0CFF]/.test(timeline.topicYogaName)).toBe(false);
        expect(/[\u0C80-\u0CFF]/.test(timeline.topicLabel)).toBe(false);
        expect(/[\u0C80-\u0CFF]/.test(timeline.guruTransitNature)).toBe(false);
      }

      if (lang !== "en") {
        expect(timeline.topicYogaName).not.toContain("Vivaha Yoga (Marriage)");
        expect(timeline.guruTransitNature).not.toContain("Auspicious Guru Bal");
        expect(timeline.guruTransitNature).not.toContain("Guru Transit");
      }

      const marriageAnswer = buildDeterministicMarriageReading(
        session,
        lang === "te" ? "నాకు పెళ్లి ఎప్పుడు అవుతుంది?" : "When will my marriage happen?",
        first
      );
      if (lang !== "en") {
        expect(marriageAnswer).not.toContain("within the next 1 year");
        expect(marriageAnswer).not.toContain("within the next 6 months");
      }
      if (lang !== "kn") {
        expect(/[\u0C80-\u0CFF]/.test(marriageAnswer)).toBe(false);
      }
    }
  });

  it("provides pure localized PDF download and family booking strings across all 7 languages", () => {
    const langs: ConsultationLanguage[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];
    for (const lang of langs) {
      const ui = CONSULTATION_CHAT_UI_I18N[lang];
      expect(ui.downloadPdfBtn).toBeTruthy();
      expect(ui.downloadingPdfBtn).toBeTruthy();
      expect(ui.downloadPdfShortBtn).toBe("PDF");
      expect(ui.pdfReadyToast).toBeTruthy();
      expect(ui.familyPriestHeader).toContain("9972339362");

      if (lang !== "kn") {
        const joined = [
          ui.downloadPdfBtn,
          ui.downloadingPdfBtn,
          ui.pdfReadyToast,
          ui.familyPriestHeader,
          ui.familyReqFieldsHeader,
          ui.brandOrgName,
          ui.loadingStatusMsg
        ].join(" ");
        expect(/[\u0C80-\u0CFF]/.test(joined)).toBe(false);
      }
    }
  });

  it("renders ConsultationSessionPdfTemplate cleanly in Sampoorna 25 / Premium PDF V1 layout across languages", async () => {
    const langs: ConsultationLanguage[] = ["kn", "en", "hi", "te"];

    for (const lang of langs) {
      const session = makeSession(lang);
      const profile = await computeDevoteePanchangaProfile(session);
      const sampleMessages: ConsultationChatMessage[] = [
        {
          id: "msg_welcome",
          sender: "astrologer",
          text: lang === "en"
            ? "Namaskara Arjun Rao ji, I am Shreeram Pandit of Shri Kshetra Gokarna."
            : "ನಮಸ್ಕಾರ, ನಾನು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮುಖ್ಯ ದೈವಜ್ಞ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್.",
          timestamp: new Date().toISOString()
        },
        {
          id: "user_1",
          sender: "user",
          text: lang === "en"
            ? "When will my career advancement happen?"
            : "ನನ್ನ ವೃತ್ತಿ ಅಭಿವೃದ್ಧಿ ಯಾವಾಗ ಆಗುತ್ತದೆ?",
          timestamp: new Date().toISOString()
        },
        {
          id: "astro_1",
          sender: "astrologer",
          text:
            lang === "en"
              ? "Career breakthrough begins cleanly within the next 6 months as Guru transits favorably.\n\nStay steady in your current responsibilities while maintaining evening prayers."
              : "ಮುಂದಿನ ೬ ತಿಂಗಳಲ್ಲೇ ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶುಭ ಬದಲಾವಣೆ ಖಚಿತವಾಗಿದೆ.\n\nತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ.",
          timestamp: new Date().toISOString(),
          hasDosha: true,
          doshaName: lang === "en" ? "Kantaka Shani" : "ಕಂಟಕ ಶನಿ",
          activeDoshaCard: {
            doshaId: "shani_gochara_impact",
            doshaName: lang === "en" ? "Kantaka Shani Transit" : "ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ",
            technicalWhy: lang === "en" ? "Saturn in 4th from Moon" : "ಚಂದ್ರನಿಂದ ೪ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ",
            currentLifeProblems: lang === "en" ? "Work pressure" : "ಕಾರ್ಯಕ್ಷೇತ್ರದ ಒತ್ತಡ",
            recommendedPooja: lang === "en" ? "Gokarna Rudrabhisheka" : "ಗೋಕರ್ಣ ರುದ್ರಾಭಿಷೇಕ",
            priestName: lang === "en" ? "Chief Priest Sri Shreeram Pandit" : "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
            priestPhone: "9972339362"
          }
        }
      ];

      const { container } = render(
        <ConsultationSessionPdfTemplate
          session={session}
          panchangaProfile={profile}
          messages={sampleMessages}
        />
      );

      // Strictly zero table tags (Sampoorna 25 rule)
      expect(container.querySelectorAll("table, tr, td, th").length).toBe(0);

      const rootEl = container.querySelector("#consultation-session-pdf-container") as HTMLElement;
      expect(rootEl).not.toBeNull();
      expect(rootEl.style.width).toBe("900px");

      const sections = container.querySelectorAll(".pdf-section");
      expect(sections.length).toBeGreaterThanOrEqual(3);

      const htmlText = container.textContent || "";
      expect(htmlText).toContain("BAGGONA PANCHANGA");
      expect(htmlText).toContain("9972339362");
      expect(htmlText).toContain(profile.lagna);
      expect(htmlText).toContain(profile.rashi);
    }
  });
});
