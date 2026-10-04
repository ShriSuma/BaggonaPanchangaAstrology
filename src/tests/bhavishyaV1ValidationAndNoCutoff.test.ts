import { describe, it, expect } from "vitest";
import {
  validateBhavishyaV1Content,
  assertBhavishyaV1Integrity,
  BhavishyaValidationError
} from "../features/premiumPdf/bhavishyaV1Validator";
import type { BhavishyaV1Payload } from "../features/premiumPdf/bhavishyaV1Service";
import {
  analyzeKundali,
  buildDynamicSummaryFallback,
  buildDynamicTimelineFallback
} from "../features/premiumPdf/dynamicBhavishyaEngine";

const mockCompletePayload: BhavishyaV1Payload = {
  ageYears: 32,
  translations: {
    title: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದಿವ್ಯ ಭವಿಷ್ಯ ವರದಿ",
    subtitle: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಪರಂಪರೆ",
    nameLabel: "ಜಾತಕರ ಹೆಸರು",
    nameValue: "ಶ್ರೀರಾಮ್ ಶರ್ಮಾ",
    dobLabel: "ಜನ್ಮ ದಿನಾಂಕ",
    dobValue: "೧೫ ಆಗಸ್ಟ್ ೧೯೯೨",
    lagnaLabel: "ಲಗ್ನ",
    lagnaValue: "ಸಿಂಹ",
    moonLabel: "ರಾಶಿ",
    moonValue: "ಮಕರ",
    nakshatraLabel: "ನಕ್ಷತ್ರ",
    nakshatraValue: "ಶ್ರವಣ",
    eraLabel: "ದಶಾ ಕಾಲ",
    dashaLabel: "ಮಹಾದಶಾ",
    ashirvadaValue: "ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ।",
    ashirvadaTitle: "ದೈವಜ್ಞ ಆಶೀರ್ವಾದ",
    summaryTitle: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ"
  } as any,
  premiumData: {
    characteristics: [
      {
        impact: "ಸಿಂಹ ಲಗ್ನದಲ್ಲಿ ಜನಿಸಿದ ನೀವು ಸ್ವಾಭಾವಿಕವಾಗಿಯೇ ಧೈರ್ಯ, ನಾಯಕತ್ವ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಹೊಂದಿರುತ್ತೀರಿ. ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವಿರಿ."
      }
    ],
    darkSecret: [
      {
        impact: "ಹೊರಗಿನ ಜಗತ್ತಿಗೆ ಶಾಂತವಾಗಿ ಮತ್ತು ದೃಢವಾಗಿ ಕಂಡರೂ, ಅಂತರಂಗದಲ್ಲಿ ನಿಮ್ಮದೇ ಆದ ಒಂಟಿತನ ಮತ್ತು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದ ಸೂಕ್ಷ್ಮ ಸಂಕಟಗಳನ್ನು ನಿಭಾಯಿಸುತ್ತಿದ್ದೀರಿ."
      }
    ],
    currentPhase: [
      {
        impact: "ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಗುರು ಮಹಾದಶೆಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಹೊಸ ತಿರುವನ್ನು ತರಲಿದೆ. ವೃತ್ತಿಪರ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿಗೆ ಇದು ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಕಾಲಘಟ್ಟವಾಗಿದೆ."
      }
    ],
    maandiInquest: {
      title: "ಕರ್ಮ ಪಯಣ: ಮಾಂದಿ ದೃಷ್ಟಿ",
      paragraph1: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಮಾಂದಿ ಗ್ರಹದ ಸ್ಥಿತಿಯು ಪೂರ್ವಜನ್ಮದ ಕರ್ಮಗಳ ಪ್ರಭಾವವನ್ನು ಮತ್ತು ಋಣಾನುಬಂಧಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸೂಚಿಸುತ್ತದೆ.",
      paragraph2: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣದ ಗಣಪತಿ ಸ್ಮರಣೆ ಮತ್ತು ಸತ್ಕರ್ಮಗಳಿಂದ ಈ ಕರ್ಮದ ಭಾರವು ಕರಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿ ಉಂಟಾಗುತ್ತದೆ."
    },
    yogas: [
      {
        name: "ಗಜಕೇಸರಿ ಯೋಗ",
        impact: "ಗುರು ಮತ್ತು ಚಂದ್ರರ ಪರಸ್ಪರ ಕೇಂದ್ರ ಸ್ಥಿತಿಯಿಂದ ಗಜಕೇಸರಿ ಯೋಗ ಉಂಟಾಗಿದ್ದು, ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಪ್ರಸಿದ್ಧಿ ದೊರೆಯಲಿದೆ."
      }
    ],
    doshas: [
      {
        name: "ಕುಜ ದೋಷ",
        impact: "ಕುಜನ ಪ್ರಭಾವದಿಂದ ಜೀವನದಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ತಾಳ್ಮೆಯ ಕೊರತೆ ಕಂಡುಬರಬಹುದು.",
        remedy: "ನಿತ್ಯ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ದರ್ಶನ."
      }
    ],
    gochara: [
      {
        name: "ಗುರು ಗೋಚಾರ ಫಲ",
        impact: "ಗುರು ಗೋಚಾರವು ೯ನೇ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಅದೃಷ್ಟ ಮತ್ತು ತಂದೆಯವರ ಆಶೀರ್ವಾದದಿಂದ ಎಲ್ಲ ಕಾರ್ಯಗಳು ಸುಗಮವಾಗಿ ನೆರವೇರಲಿವೆ."
      }
    ],
    timeline: [
      { dateRange: "ತಿಂಗಳು ೧: ಅಕ್ಟೋಬರ್ ೨೦೨೬", impact: "ವೃತ್ತಿಪರ ಯೋಜನೆಗಳ ಆರಂಭ ಮತ್ತು ಹಿರಿಯರ ಬೆಂಬಲ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ." },
      { dateRange: "ತಿಂಗಳು ೨: ನವೆಂಬರ್ ೨೦೨೬", impact: "ಹಣಕಾಸಿನ ಅನುಕೂಲತೆ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸಂತಸದ ವಾತಾವರಣ ಇರಲಿದೆ." },
      { dateRange: "ತಿಂಗಳು ೩: ಡಿಸೆಂಬರ್ ೨೦೨೬", impact: "ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳಲ್ಲಿ ಭಾಗವಹಿಸುವ ಅವಕಾಶ ಮತ್ತು ಪ್ರಯಾಣ ಯೋಗ." },
      { dateRange: "ತಿಂಗಳು ೪: ಜನವರಿ ೨೦೨೭", impact: "ಆರೋಗ್ಯ ಸುಧಾರಣೆ ಮತ್ತು ನವೀನ ಹೂಡಿಕೆಗಳಿಗೆ ಅತ್ಯುತ್ತಮ ಕಾಲ." }
    ],
    summary: [
      {
        impact: "ಸಮಗ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿದಾಗ ನಿಮ್ಮ ಜಾತಕವು ಅತ್ಯಂತ ಶುಭದಾಯಕವಾಗಿದ್ದು, ಕರ್ತವ್ಯನಿಷ್ಠೆ ಮತ್ತು ಸದಾಚಾರಗಳಿಂದ ನೀವು ಉನ್ನತ ಯಶಸ್ಸನ್ನು ಸಾಧಿಸುವಿರಿ. ಶ್ರೀ ಕ್ಷೇತ್ರದ ಅನುಗ್ರಹ ಸದಾ ನಿಮ್ಮ ಮೇಲಿರಲಿ."
      }
    ]
  },
  predictions: [
    { text: "Career", category: "career", translatedCategory: "ವೃತ್ತಿ", translatedText: "ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು ಮತ್ತು ನಾಯಕತ್ವದ ಸ್ಥಾನಗಳು ಲಭ್ಯವಾಗಲಿವೆ." },
    { text: "Wealth", category: "wealth", translatedCategory: "ಧನ", translatedText: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಭೂಮಿ-ವಾಹನಗಳ ಖರೀದಿ ಯೋಗವಿದೆ." },
    { text: "Marriage", category: "marriage", translatedCategory: "ವಿವಾಹ", translatedText: "ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಾಮರಸ್ಯ ಮತ್ತು ಪರಸ್ಪರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ನೆಲೆಸಲಿದೆ." },
    { text: "Children", category: "children", translatedCategory: "ಸಂತಾನ", translatedText: "ಸಂತಾನ ಭಾಗ್ಯವು ಸತ್ಪುತ್ರ ಯೋಗವನ್ನು ತರಲಿದ್ದು ಕೀರ್ತಿ ತರಲಿದ್ದಾರೆ." },
    { text: "Health", category: "health", translatedCategory: "ಆರೋಗ್ಯ", translatedText: "ಆರೋಗ್ಯವು ಸಾಧಾರಣವಾಗಿ ಉತ್ತಮವಾಗಿದ್ದು ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಿತಕರ." }
  ],
  deepInsights: {}
};

describe("Bhavishya V1 Validation & Anti-Truncation Suite", () => {
  it("rejects PDF generation when Saramsha (Summary) is completely missing", () => {
    const payloadWithoutSaramsha = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadWithoutSaramsha.premiumData.summary = [];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, payloadWithoutSaramsha, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("ಸಾರಾಂಶ") || s.includes("Saramsha"))).toBe(true);
    expect(result.errorMessage).toContain("ಸಾರಾಂಶ");

    expect(() => {
      assertBhavishyaV1Integrity(container, payloadWithoutSaramsha, "kn");
    }).toThrowError(BhavishyaValidationError);
  });

  it("rejects PDF generation when Saramsha impact text is too short (< 50 chars)", () => {
    const payloadWithShortSaramsha = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadWithShortSaramsha.premiumData.summary = [{ impact: "Short text" }];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, payloadWithShortSaramsha, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("ಸಾರಾಂಶ") || s.includes("Saramsha"))).toBe(true);
  });

  it("rejects PDF generation when Timeline has fewer than 4 months", () => {
    const payloadShortTimeline = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadShortTimeline.premiumData.timeline = [
      { dateRange: "Month 1", impact: "Short timeline only 1 month" }
    ];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, payloadShortTimeline, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("೬ ತಿಂಗಳ ಭವಿಷ್ಯ") || s.includes("Timeline"))).toBe(true);
  });

  it("rejects when DOM sections are fewer than 8", () => {
    const container = document.createElement("div");
    container.style.height = "4000px";
    for (let i = 0; i < 3; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, mockCompletePayload, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("ಮುದ್ರಣ ಪುಟಗಳ ಕೊರತೆ") || s.includes("Insufficient DOM sections"))).toBe(true);
  });

  it("passes validation when all 10 chapters and Saramsha are fully present in payload & DOM", () => {
    const container = document.createElement("div");
    Object.defineProperty(container, "scrollHeight", { value: 6000, configurable: true });
    Object.defineProperty(container, "offsetHeight", { value: 6000, configurable: true });

    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section content ${i}`;
      container.appendChild(sec);
    }

    const timelineSec = document.createElement("div");
    timelineSec.className = "pdf-section";
    timelineSec.setAttribute("data-section", "timeline");
    timelineSec.textContent = "೬ ತಿಂಗಳ ಭವಿಷ್ಯ ನಕ್ಷೆ Timeline";
    container.appendChild(timelineSec);

    const summarySec = document.createElement("div");
    summarySec.className = "pdf-section";
    summarySec.setAttribute("data-section", "summary");
    summarySec.id = "pdf-section-summary";
    summarySec.textContent = "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ Saramsha Complete";
    container.appendChild(summarySec);

    const result = validateBhavishyaV1Content(container, mockCompletePayload, "kn");
    expect(result.isValid).toBe(true);
    expect(result.missingSections.length).toBe(0);
    expect(result.errorMessage).toBe("");

    expect(() => {
      assertBhavishyaV1Integrity(container, mockCompletePayload, "kn");
    }).not.toThrow();
  });

  it("generates rich fallback summary in all supported languages without blanks", () => {
    const kundaliInput: any = {
      lang: "kn",
      name: "ರಮೇಶ್",
      lagnaRashiIndex: 0,
      moonRashiIndex: 1,
      moonNakshatraIndex: 3,
      natalPlanets: [
        { graha: "Sun", name: "Sun", rashiIndex: 0, house: 1 },
        { graha: "Moon", name: "Moon", rashiIndex: 1, house: 2 },
        { graha: "Mars", name: "Mars", rashiIndex: 2, house: 3 },
        { graha: "Mercury", name: "Mercury", rashiIndex: 0, house: 1 },
        { graha: "Jupiter", name: "Jupiter", rashiIndex: 8, house: 9 },
        { graha: "Venus", name: "Venus", rashiIndex: 1, house: 2 },
        { graha: "Saturn", name: "Saturn", rashiIndex: 9, house: 10 },
        { graha: "Rahu", name: "Rahu", rashiIndex: 11, house: 12 },
        { graha: "Ketu", name: "Ketu", rashiIndex: 5, house: 6 }
      ],
      transits: [],
      mahaLord: "Jupiter",
      bhuktiLord: "Saturn",
      ageYears: 30,
      maritalStatus: "married",
      gender: "Male"
    };

    const parsedKundaliKn = analyzeKundali(kundaliInput);
    const summaryKn = buildDynamicSummaryFallback(parsedKundaliKn);
    expect(summaryKn).toBeDefined();
    expect(summaryKn.length).toBeGreaterThan(250);
    expect(summaryKn).toContain("ಬಗ್ಗೋಣ");

    // Test Hindi fallback
    const parsedKundaliHi = analyzeKundali({
      ...kundaliInput,
      lang: "hi"
    });
    const summaryHi = buildDynamicSummaryFallback(parsedKundaliHi);
    expect(summaryHi).toBeDefined();
    expect(summaryHi.length).toBeGreaterThan(250);
    expect(summaryHi).toContain("बग्गोण");

    // Test Telugu fallback
    const parsedKundaliTe = analyzeKundali({
      ...kundaliInput,
      lang: "te"
    });
    const summaryTe = buildDynamicSummaryFallback(parsedKundaliTe);
    expect(summaryTe).toBeDefined();
    expect(summaryTe.length).toBeGreaterThan(250);
    expect(summaryTe).toContain("బగ్గోణ");

    // Test Tamil fallback
    const parsedKundaliTa = analyzeKundali({
      ...kundaliInput,
      lang: "ta"
    });
    const summaryTa = buildDynamicSummaryFallback(parsedKundaliTa);
    expect(summaryTa).toBeDefined();
    expect(summaryTa.length).toBeGreaterThan(250);
    expect(summaryTa).toContain("பக்கோண");

    // Test English fallback
    const parsedKundaliEn = analyzeKundali({
      ...kundaliInput,
      lang: "en"
    });
    const summaryEn = buildDynamicSummaryFallback(parsedKundaliEn);
    expect(summaryEn).toBeDefined();
    expect(summaryEn.length).toBeGreaterThan(250);
    expect(summaryEn).toContain("Baggona");

    const timeline = buildDynamicTimelineFallback(parsedKundaliKn);
    expect(timeline.length).toBeGreaterThanOrEqual(6);
    expect(timeline[0].impact.length).toBeGreaterThan(30);
  });

  it("validates missing Saramsha with localized error messages in all 5 languages", () => {
    const payloadWithoutSaramsha = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadWithoutSaramsha.premiumData.summary = [];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    // Hindi
    const resHi = validateBhavishyaV1Content(container, payloadWithoutSaramsha, "hi");
    expect(resHi.isValid).toBe(false);
    expect(resHi.missingSections.some(s => s.includes("सारांश"))).toBe(true);
    expect(resHi.errorMessage).toContain("पीडीएफ डाउनलोड रोक दिया गया");

    // Telugu
    const resTe = validateBhavishyaV1Content(container, payloadWithoutSaramsha, "te");
    expect(resTe.isValid).toBe(false);
    expect(resTe.missingSections.some(s => s.includes("సారాంశం"))).toBe(true);
    expect(resTe.errorMessage).toContain("పిడిఎఫ్ డౌన్‌లోడ్ నిలిపివేయబడింది");

    // Tamil
    const resTa = validateBhavishyaV1Content(container, payloadWithoutSaramsha, "ta");
    expect(resTa.isValid).toBe(false);
    expect(resTa.missingSections.some(s => s.includes("சுருக்கம்"))).toBe(true);
    expect(resTa.errorMessage).toContain("PDF பதிவிறக்கம் நிறுத்தப்பட்டது");

    // English
    const resEn = validateBhavishyaV1Content(container, payloadWithoutSaramsha, "en");
    expect(resEn.isValid).toBe(false);
    expect(resEn.missingSections.some(s => s.includes("Saramsha") || s.includes("Summary"))).toBe(true);
    expect(resEn.errorMessage).toContain("PDF download aborted");
  });
});
