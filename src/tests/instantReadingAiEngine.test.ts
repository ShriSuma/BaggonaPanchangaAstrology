import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCurrentLifeSituationWithAi } from "../core/instantReadingAiEngine";
import type { CurrentLifeSituationDiagnosis } from "../core/CurrentLifeAndCareerDiagnosticEngine";
import * as GeminiModule from "../core/GeminiEngine";

describe("Instant Reading AI Engine Suite (10-Retry Loop & Impressive Header)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCls: CurrentLifeSituationDiagnosis = {
    category: "creative_media_stardom",
    titleKn: "ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ಸಾರ್ವಜನಿಕ ಪ್ರಭಾವ",
    titleEn: "Public Acclaim, Strategic Artistry & Creative Growth",
    headlineKn: "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿ",
    headlineEn: "Public Acclaim, Fame, Strategic Artistry & Career Honors",
    detailedRealityKn: "ಶಾಸ್ತ್ರೀಯ ಕಲಾತ್ಮಕ ಯೋಜನೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವದ ಹಂಬಲ.",
    detailedRealityEn: "Classical artistic planning and desire for public honor.",
    planetaryCulpritKn: "10ನೇ ಕರ್ಮಾಧಿಪತಿಯ ಪ್ರಭಾವ",
    planetaryCulpritEn: "Influence of 10th lord",
    symptomsChecklistKn: [
      "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆಯ ನಿರೀಕ್ಷೆ",
      "ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳ ರೂಪಿಸುವಿಕೆ",
      "ವೃತ್ತಿಪರ ಮನ್ನಣೆಯ ಹಂಬಲ"
    ],
    symptomsChecklistEn: [
      "Desire for public appreciation",
      "Formulating creative strategies",
      "Urge for career recognition"
    ],
    severity: "moderate",
    reliefTimelineKn: "ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ",
    reliefTimelineEn: "Within next 3 to 6 months",
    gokarnaRemedyKn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ",
    gokarnaRemedyEn: "Bilvarchana at Sri Kshetra Gokarna",
    externalLifeRealityKn: "ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳು ಹಾಗೂ ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿಗಾಗಿ ಪ್ರಯತ್ನ.",
    externalLifeRealityEn: "Efforts for creative planning and career honor.",
    internalMindsetKn: "ಮನಸ್ಸಿನಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ ಮತ್ತು ಪ್ರಶಂಸೆಯ ನಿರೀಕ್ಷೆ.",
    internalMindsetEn: "Mindset focused on public prestige and deserved acclaim."
  };

  const mockSession = {
    input: {
      name: "Rohit",
      gender: "Male"
    },
    result: {
      lagnaRashi: { english: "Leo" },
      moonSign: { english: "Aries" },
      planets: [
        { name: "Moon", house: 9, nakshatra: { english: "Ashwini" } },
        { name: "Sun", house: 10 }
      ]
    }
  };

  const mockCurrentDiagnosis = {
    prasthuthaSthiti: {
      runningDashaSummary: "ರವಿ ಮಹಾದಶೆ - ಗುರು ಭುಕ್ತಿ"
    },
    primaryLifeChallenge: {
      area: "Creative & Media Arts",
      description: "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ & ಕೀರ್ತಿ"
    },
    accurateProfession: {
      titleKn: "ಕಲಾತ್ಮಕ & ನಾಯಕತ್ವ ಕ್ಷೇತ್ರ",
      titleEn: "Creative & Leadership Field"
    }
  };

  it("successfully parses AI output on first attempt and updates headline and details", async () => {
    vi.spyOn(GeminiModule, "askGemini").mockResolvedValue(
      JSON.stringify({
        headlineKn: "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿ",
        headlineEn: "Public Recognition, Fame, Strategic Artistry & Career Honors",
        detailedRealityKn: "ನಿಮ್ಮ ಪ್ರತಿಭೆ ಮತ್ತು ಶ್ರಮಕ್ಕೆ ಸಾರ್ವಜನಿಕವಾಗಿ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ ಸಿಗುವ ಸಕಾಲ ಸನ್ನಿಹಿತವಾಗಿದೆ.",
        detailedRealityEn: "The time has arrived for public recognition and honors for your talents.",
        externalLifeRealityKn: "ದೊಡ್ಡ ಮಟ್ಟದ ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳು ಮತ್ತು ವೃತ್ತಿ ಪ್ರಗತಿಯ ಹೆಜ್ಜೆಗಳು ಆರಂಭವಾಗುತ್ತಿವೆ.",
        externalLifeRealityEn: "Significant artistic plans and career advancement steps are initiating.",
        internalMindsetKn: "ಮನಸ್ಸಿನಲ್ಲಿ ಕೀರ್ತಿ, ಸಾರ್ವಜನಿಕ ಗೌರವ ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮಕ್ಕೆ ಯೋಗ್ಯ ಬೆಲೆ ಸಿಗಬೇಕೆಂಬ ಆಕಾಂಕ್ಷೆ ಇದೆ.",
        internalMindsetEn: "Internal mindset is anchored in seeking deserved prestige and professional acknowledgment.",
        planetaryCulpritKn: "10ನೇ ಕರ್ಮಾಧಿಪತಿಯ ಶುಭ ಸಂಚಾರ",
        planetaryCulpritEn: "Auspicious transit of the 10th lord",
        symptomsChecklistKn: [
          "ತನ್ನ ಪ್ರತಿಭೆಗೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗಬೇಕೆಂಬ ಹಂಬಲ",
          "ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳ ಅಂತಿಮಗೊಳಿಸುವಿಕೆ",
          "ಸಾರ್ವಜನಿಕ ವಲಯದಲ್ಲಿ ಪ್ರಶಂಸೆಯ ಬಯಕೆ"
        ],
        symptomsChecklistEn: [
          "Urge for deserved spotlight on talents",
          "Finalizing strategic artistic plans",
          "Desire for public praise and professional honor"
        ]
      })
    );

    const result = await generateCurrentLifeSituationWithAi({
      session: mockSession,
      currentDiagnosis: mockCurrentDiagnosis,
      cls: mockCls,
      apiKey: "test-api-key",
      lang: "kn"
    });

    expect(result).toBeDefined();
    expect(result?.headlineKn).toBe("ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ, ಕೀರ್ತಿ, ಕಲಾತ್ಮಕ ಯೋಜನೆ & ವೃತ್ತಿ ಗೌರವ ಪ್ರಾಪ್ತಿ");
    expect(result?.detailedRealityKn).toContain("ಪ್ರತಿಭೆ");
    expect(result?.externalLifeRealityKn).toContain("ಕಲಾತ್ಮಕ ಯೋಜನೆಗಳು");
    expect(result?.symptomsChecklistKn.length).toBe(3);
  });

  it("retries up to 10 times upon intermittent failures and succeeds on 3rd attempt", async () => {
    let callCount = 0;
    vi.spyOn(GeminiModule, "askGemini").mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error("Temporary network timeout");
      }
      return JSON.stringify({
        headlineKn: "ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ & ಕಲಾತ್ಮಕ ಕೀರ್ತಿ ಪ್ರಾಪ್ತಿ",
        headlineEn: "Public Acclaim & Strategic Renown",
        detailedRealityKn: "ದೀರ್ಘಾವಧಿಯ ಶ್ರಮಕ್ಕೆ ನ್ಯಾಯಯುತ ಕೀರ್ತಿ ಲಭಿಸುವ ಕಾಲಘಟ್ಟ.",
        detailedRealityEn: "Phase of rightful acclaim for long-standing hard work."
      });
    });

    const result = await generateCurrentLifeSituationWithAi({
      session: mockSession,
      currentDiagnosis: mockCurrentDiagnosis,
      cls: mockCls,
      apiKey: "test-api-key",
      lang: "kn"
    });

    expect(callCount).toBe(3);
    expect(result?.headlineKn).toBe("ಸಾರ್ವಜನಿಕ ಮನ್ನಣೆ & ಕಲಾತ್ಮಕ ಕೀರ್ತಿ ಪ್ರಾಪ್ತಿ");
    expect(result?.detailedRealityKn).toBe("ದೀರ್ಘಾವಧಿಯ ಶ್ರಮಕ್ಕೆ ನ್ಯಾಯಯುತ ಕೀರ್ತಿ ಲಭಿಸುವ ಕಾಲಘಟ್ಟ.");
  });

  it("cleanly falls back to deterministic diagnosis after 10 failed attempts without throwing or corrupting data", async () => {
    let callCount = 0;
    vi.spyOn(GeminiModule, "askGemini").mockImplementation(async () => {
      callCount++;
      throw new Error("Persistent 503 Quota Exceeded");
    });

    const result = await generateCurrentLifeSituationWithAi({
      session: mockSession,
      currentDiagnosis: mockCurrentDiagnosis,
      cls: mockCls,
      apiKey: "test-api-key",
      lang: "kn"
    });

    // Verified that it retried exactly 10 times
    expect(callCount).toBe(10);
    // Verified clean fallback to mockCls
    expect(result).toBeDefined();
    expect(result?.headlineKn).toBe(mockCls.headlineKn);
    expect(result?.detailedRealityKn).toBe(mockCls.detailedRealityKn);
    expect(result?.category).toBe(mockCls.category);
  });
});
