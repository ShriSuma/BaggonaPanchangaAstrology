import { describe, it, expect } from "vitest";
import {
  validateBhavishyaV1Content,
  assertBhavishyaV1Integrity,
  BhavishyaValidationError
} from "../features/premiumPdf/bhavishyaV1Validator";
import { prepareBhavishyaV1Data, type BhavishyaV1Payload } from "../features/premiumPdf/bhavishyaV1Service";
import { calculateKundli } from "../core/KundliEngine";
import {
  analyzeKundali,
  buildDynamicSummaryFallback,
  buildDynamicTimelineFallback,
  buildDynamicSoulMirrorFallback,
  buildDynamicPrescriptions,
  buildDynamicAnnualForecastFallback
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
    soulMirror: {
      elemental: {
        firePercent: 40,
        earthPercent: 30,
        airPercent: 20,
        waterPercent: 10,
        dominantElementKey: "Agni",
        dominantElementName: "ಅಗ್ನಿ ತತ್ವ",
        dominantElementTrait: "ತೇಜಸ್ಸು ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣ",
        shieldGraha: "Mars",
        shieldGrahaName: "ಕುಜ",
        shieldGrahaWhy: "ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿ ಬಲಶಾಲಿಯಾಗಿರುವುದರಿಂದ",
        moonPaksha: "ಶುಕ್ಲ ಪಕ್ಷ",
        moonVitalityTrait: "ಉನ್ನತ ಚೇತನ ಶಕ್ತಿ"
      },
      truth1Title: "೧. ಬಾಹ್ಯ ಗಾಂಭೀರ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಮೌನ",
      truth1Text: "ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವಾದ ಕಟಕ ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯಾದ ವೃಶ್ಚಿಕ ಗ್ರಹ ಸಂಯೋಜನೆಯು ಜಗತ್ತಿನ ಎದುರು ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ದೃಢವಾಗಿ ನಿಲ್ಲಿಸಿದೆ. ನೀವು ಇತರರಿಗೆ ನಿಸ್ವಾರ್ಥವಾಗಿ ಹಂಚುವ ಪ್ರೀತಿಯು ನಿಮಗೂ ಸಿಗಲಿ ಎಂಬ ಹಂಬಲವಿದೆ.",
      truth2Title: "೨. ಅಚಲ ಸ್ವಾಭಿಮಾನ & ವಿಶ್ವಾಸಾರ್ಹತೆಯ ಗಡಿ",
      truth2Text: "ನಿಮ್ಮ ಜೀವನ ಸೂತ್ರದಲ್ಲಿ ಅಜ್ಞಾನ ಅಥವಾ ಮುಗ್ಧತೆಯಿಂದ ಮಾಡಿದ ತಪ್ಪುಗಳನ್ನು ಕ್ಷಮಿಸುತ್ತೀರಿ. ಆದರೆ ಉದ್ದೇಶಪೂರ್ವಕ ನಂಬಿಕೆದ್ರೋಹಕ್ಕೆ ನಿಮ್ಮಲ್ಲಿ ಕ್ಷಮೆಯಿಲ್ಲ.",
      truth3Title: "೩. ಪೂರ್ವಪುಣ್ಯ ರಕ್ಷೆ & ೧೧ನೇ ಗಂಟೆಯ ದೈವಕೃಪೆ",
      truth3Text: "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಪೂರ್ವಪುಣ್ಯ ಬಲವು ನಿಮ್ಮ ಜೀವನದ ರಹಸ್ಯ ಶಕ್ತಿಯಾಗಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣದ ಮುಖ್ಯಪ್ರಾಣ ದೇವರ ಸದಾ ಜಾಗೃತ ಕೃಪಾಕಟಾಕ್ಷ ಸದಾ ರಕ್ಷಣೆ ನೀಡಲಿದೆ."
    },
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
    annualForecast: [
      {
        impact: "【ಆಂತರಿಕ ಸಂಕಲ್ಪ ಹಾಗೂ ದಶಾ-ಗೋಚಾರ ಪ್ರವೇಶ】\nಮುಂದಿನ ಒಂದು ವರ್ಷದ ಅವಧಿಯು ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯಂತ ಮಹತ್ವದ ಹಾಗೂ ಪರಿವರ್ತನೀಯ ಅಧ್ಯಾಯವಾಗಲಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ ಮತ್ತು ನವಾಂಶ ಸ್ಥಿತಿಗಳ ಸೂಕ್ಷ್ಮ ಅವಲೋಕನದಿಂದ ಇದು ಸ್ಪಷ್ಟವಾಗುತ್ತದೆ.\n\n【ವೃತ್ತಿಪರ ವಿಸ್ತರಣೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯ ಉದಯ】\nಉದ್ಯೋಗ ಮತ್ತು ವ್ಯವಹಾರ ರಂಗದಲ್ಲಿ ನೀವು ಕಳೆದ ಕೆಲವು ಸಮಯದಿಂದ ಎದುರಿಸುತ್ತಿದ್ದ ಅನಿಶ್ಚಿತತೆಯು ಈ ವರ್ಷ ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಣೆಯಾಗಲಿದೆ.\n\n【ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ, ಆರೋಗ್ಯ ಚೈತನ್ಯ ಹಾಗೂ ನೆಮ್ಮದಿ】\nಗೃಹ ಜೀವನದಲ್ಲಿ ನವೀನ ಚೈತನ್ಯ ಮೂಡಲಿದ್ದು, ಕುಟುಂಬ ಸದಸ್ಯರ ನಡುವೆ ಪ್ರೀತಿ ಮತ್ತು ಪರಸ್ಪರ ಗೌರವ ವೃದ್ಧಿಸಲಿದೆ.\n\n【ದೈವಿಕ ಸಂಕಲ್ಪ & ವಾರ್ಷಿಕ ವಿಜಯ ಸಾಧನೆ】\nವರ್ಷದ ದ್ವಿತೀಯಾರ್ಧದಲ್ಲಿ ಬರುವ ದೈವಿಕ ಸಂಯೋಗವು ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ಕನಸುಗಳನ್ನು ನನಸಾಗಿಸಲು ಸುವರ್ಣಾವಕಾಶವನ್ನು ಕಲ್ಪಿಸಲಿದೆ."
      }
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

  it("rejects PDF generation when Annual Forecast is completely missing or empty", () => {
    const payloadWithoutAnnual = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadWithoutAnnual.premiumData.annualForecast = [];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, payloadWithoutAnnual, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("ಮುಂದಿನ ೧ ವರ್ಷದ") || s.includes("Annual Forecast") || s.includes("annualForecast"))).toBe(true);
  });

  it("rejects PDF generation when Annual Forecast impact text is too short (< 100 chars)", () => {
    const payloadShortAnnual = JSON.parse(JSON.stringify(mockCompletePayload));
    payloadShortAnnual.premiumData.annualForecast = [{ impact: "Too short annual forecast" }];

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    const result = validateBhavishyaV1Content(container, payloadShortAnnual, "kn");
    expect(result.isValid).toBe(false);
    expect(result.missingSections.some(s => s.includes("ಮುಂದಿನ ೧ ವರ್ಷದ") || s.includes("Annual Forecast") || s.includes("annualForecast"))).toBe(true);
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

    const soulMirrorSec = document.createElement("div");
    soulMirrorSec.className = "pdf-section";
    soulMirrorSec.setAttribute("data-section", "soul-mirror");
    soulMirrorSec.textContent = "ಅಧ್ಯಾಯ ೧: ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು ಹಾಗೂ ಪಂಚಭೂತ ಚೇತನ ಶಕ್ತಿ";
    container.appendChild(soulMirrorSec);

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
    expect(summaryKn).toContain("ಗೋಕರ್ಣ");

    // Test Hindi fallback
    const parsedKundaliHi = analyzeKundali({
      ...kundaliInput,
      lang: "hi"
    });
    const summaryHi = buildDynamicSummaryFallback(parsedKundaliHi);
    expect(summaryHi).toBeDefined();
    expect(summaryHi.length).toBeGreaterThan(250);
    expect(summaryHi).toContain("गोकर्ण");

    // Test Telugu fallback
    const parsedKundaliTe = analyzeKundali({
      ...kundaliInput,
      lang: "te"
    });
    const summaryTe = buildDynamicSummaryFallback(parsedKundaliTe);
    expect(summaryTe).toBeDefined();
    expect(summaryTe.length).toBeGreaterThan(250);
    expect(summaryTe).toContain("గోకర్ణ");

    // Test Tamil fallback
    const parsedKundaliTa = analyzeKundali({
      ...kundaliInput,
      lang: "ta"
    });
    const summaryTa = buildDynamicSummaryFallback(parsedKundaliTa);
    expect(summaryTa).toBeDefined();
    expect(summaryTa.length).toBeGreaterThan(250);
    expect(summaryTa).toContain("கோகர்ண");

    // Test English fallback
    const parsedKundaliEn = analyzeKundali({
      ...kundaliInput,
      lang: "en"
    });
    const summaryEn = buildDynamicSummaryFallback(parsedKundaliEn);
    expect(summaryEn).toBeDefined();
    expect(summaryEn.length).toBeGreaterThan(250);
    expect(summaryEn).toContain("Gokarna");

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

  it("validates missing Soul Mirror & Cosmic Vitality with localized error messages in all 5 languages", () => {
    const payloadWithoutSoulMirror = JSON.parse(JSON.stringify(mockCompletePayload));
    delete payloadWithoutSoulMirror.premiumData.soulMirror;

    const container = document.createElement("div");
    container.style.height = "5000px";
    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section ${i}`;
      container.appendChild(sec);
    }

    // Kannada
    const resKn = validateBhavishyaV1Content(container, payloadWithoutSoulMirror, "kn");
    expect(resKn.isValid).toBe(false);
    expect(resKn.missingSections.some(s => s.includes("ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು") || s.includes("Soul Mirror"))).toBe(true);

    // Hindi
    const resHi = validateBhavishyaV1Content(container, payloadWithoutSoulMirror, "hi");
    expect(resHi.isValid).toBe(false);
    expect(resHi.missingSections.some(s => s.includes("अंतर्मन के त्रिविध सत्य") || s.includes("Soul Mirror"))).toBe(true);

    // Telugu
    const resTe = validateBhavishyaV1Content(container, payloadWithoutSoulMirror, "te");
    expect(resTe.isValid).toBe(false);
    expect(resTe.missingSections.some(s => s.includes("అంతరంగ త్రివిధ సత్యాలు") || s.includes("Soul Mirror"))).toBe(true);

    // Tamil
    const resTa = validateBhavishyaV1Content(container, payloadWithoutSoulMirror, "ta");
    expect(resTa.isValid).toBe(false);
    expect(resTa.missingSections.some(s => s.includes("அந்தரங்கத்தின் மும்மை உண்மைகள்") || s.includes("Soul Mirror"))).toBe(true);

    // English
    const resEn = validateBhavishyaV1Content(container, payloadWithoutSoulMirror, "en");
    expect(resEn.isValid).toBe(false);
    expect(resEn.missingSections.some(s => s.includes("Soul Mirror"))).toBe(true);
  });

  it("generates rich fallback Soul Mirror in all 5 languages with valid lengths and 100% element balance", () => {
    const baseKundali: any = {
      name: "ರಮೇಶ್",
      lagnaRashiIndex: 3, // Cancer (Water)
      moonRashiIndex: 7,  // Scorpio (Water)
      moonNakshatraIndex: 16,
      natalPlanets: [
        { graha: "Sun", name: "Sun", rashiIndex: 0, house: 10 },
        { graha: "Moon", name: "Moon", rashiIndex: 7, house: 5 },
        { graha: "Mars", name: "Mars", rashiIndex: 9, house: 7 },
        { graha: "Mercury", name: "Mercury", rashiIndex: 11, house: 9 },
        { graha: "Jupiter", name: "Jupiter", rashiIndex: 3, house: 1 },
        { graha: "Venus", name: "Venus", rashiIndex: 1, house: 11 },
        { graha: "Saturn", name: "Saturn", rashiIndex: 6, house: 4 },
        { graha: "Rahu", name: "Rahu", rashiIndex: 2, house: 12 },
        { graha: "Ketu", name: "Ketu", rashiIndex: 8, house: 6 }
      ],
      transits: [],
      mahaLord: "Jupiter",
      bhuktiLord: "Saturn",
      ageYears: 32,
      maritalStatus: "married",
      gender: "Male"
    };

    const languages: ("kn" | "hi" | "te" | "ta" | "en")[] = ["kn", "hi", "te", "ta", "en"];

    languages.forEach((lang) => {
      const parsed = analyzeKundali({ ...baseKundali, lang });
      const soulMirror = buildDynamicSoulMirrorFallback(parsed);

      expect(soulMirror).toBeDefined();
      // Total elemental percentage must sum to exactly 100
      const totalPct =
        soulMirror.elemental.firePercent +
        soulMirror.elemental.earthPercent +
        soulMirror.elemental.airPercent +
        soulMirror.elemental.waterPercent;
      expect(totalPct).toBe(100);

      // Element traits must be populated
      expect(soulMirror.elemental.dominantElementKey).toMatch(/Agni|Prithvi|Vayu|Jala/);
      expect(soulMirror.elemental.dominantElementName.length).toBeGreaterThan(0);
      expect(soulMirror.elemental.dominantElementTrait.length).toBeGreaterThan(10);
      expect(soulMirror.elemental.shieldGraha.length).toBeGreaterThan(0);
      expect(soulMirror.elemental.shieldGrahaName.length).toBeGreaterThan(0);
      expect(soulMirror.elemental.shieldGrahaWhy.length).toBeGreaterThan(15);
      expect(soulMirror.elemental.moonPaksha.length).toBeGreaterThan(0);
      expect(soulMirror.elemental.moonVitalityTrait.length).toBeGreaterThan(10);

      // All 3 truths must exceed the 80 character strict validation threshold
      expect(soulMirror.truth1Text.length).toBeGreaterThanOrEqual(80);
      expect(soulMirror.truth2Text.length).toBeGreaterThanOrEqual(80);
      expect(soulMirror.truth3Text.length).toBeGreaterThanOrEqual(80);

      // Verify prescription generation for this language
      const prescriptions = buildDynamicPrescriptions(parsed);
      expect(prescriptions.gemstone.length).toBeGreaterThan(0);
      expect(prescriptions.rudraksha.length).toBeGreaterThan(0);
      expect(prescriptions.ishtaDevata.length).toBeGreaterThan(0);
      expect(prescriptions.luckyNumbers.length).toBeGreaterThan(0);
      expect(prescriptions.luckyDays.length).toBeGreaterThan(0);
    });
  });

  it("passes validation with 100% success when payload has dynamic soul mirror and DOM is rendered", () => {
    const kundaliInput: any = {
      lang: "kn",
      name: "ಶ್ರೀರಾಮ್",
      lagnaRashiIndex: 4,
      moonRashiIndex: 9,
      moonNakshatraIndex: 21,
      natalPlanets: [
        { graha: "Sun", name: "Sun", rashiIndex: 4, house: 1 },
        { graha: "Moon", name: "Moon", rashiIndex: 9, house: 6 },
        { graha: "Mars", name: "Mars", rashiIndex: 0, house: 9 },
        { graha: "Mercury", name: "Mercury", rashiIndex: 4, house: 1 },
        { graha: "Jupiter", name: "Jupiter", rashiIndex: 8, house: 5 },
        { graha: "Venus", name: "Venus", rashiIndex: 3, house: 12 },
        { graha: "Saturn", name: "Saturn", rashiIndex: 10, house: 7 },
        { graha: "Rahu", name: "Rahu", rashiIndex: 1, house: 10 },
        { graha: "Ketu", name: "Ketu", rashiIndex: 7, house: 4 }
      ],
      transits: [],
      mahaLord: "Sun",
      bhuktiLord: "Moon",
      ageYears: 34,
      maritalStatus: "married",
      gender: "Male"
    };

    const parsed = analyzeKundali(kundaliInput);
    const dynamicSoulMirror = buildDynamicSoulMirrorFallback(parsed);

    const testPayload = JSON.parse(JSON.stringify(mockCompletePayload));
    testPayload.premiumData.soulMirror = dynamicSoulMirror;

    const container = document.createElement("div");
    Object.defineProperty(container, "scrollHeight", { value: 6500, configurable: true });
    Object.defineProperty(container, "offsetHeight", { value: 6500, configurable: true });

    for (let i = 0; i < 12; i++) {
      const sec = document.createElement("div");
      sec.className = "pdf-section";
      sec.textContent = `Section content ${i}`;
      container.appendChild(sec);
    }

    const soulMirrorDiv = document.createElement("div");
    soulMirrorDiv.className = "pdf-section";
    soulMirrorDiv.setAttribute("data-section", "soul-mirror");
    soulMirrorDiv.textContent = `${dynamicSoulMirror.truth1Text} ${dynamicSoulMirror.truth2Text} ${dynamicSoulMirror.truth3Text}`;
    container.appendChild(soulMirrorDiv);

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

    const result = validateBhavishyaV1Content(container, testPayload, "kn");
    expect(result.isValid).toBe(true);
    expect(result.missingSections).toHaveLength(0);
    expect(result.errorMessage).toBe("");
  });

  it("guarantees prepareBhavishyaV1Data produces complete Soul Mirror and all 10 chapters even when AI is unavailable", async () => {
    const kundli = calculateKundli({
      name: "ರಮೇಶ್ ಕುಮಾರ್",
      birthDate: "1988-06-15",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3187
    });

    const mockSession: any = {
      result: kundli,
      birthDateYmd: "1988-06-15",
      birthTimeHm: "10:30",
      input: {
        name: "ರಮೇಶ್ ಕುಮಾರ್",
        birthDate: "1988-06-15",
        birthTime: "10:30",
        latitude: 14.5479,
        longitude: 74.3187,
        gender: "Male"
      }
    };

    const payload = await prepareBhavishyaV1Data(mockSession, "kn", "");

    expect(payload).toBeDefined();
    expect(payload.translations.soulMirrorTitle).toBeDefined();
    expect(payload.translations.soulMirrorTitle).toContain("ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು");

    // Soul Mirror validation
    expect(payload.premiumData.soulMirror).toBeDefined();
    expect(payload.premiumData.soulMirror?.truth1Text.length).toBeGreaterThanOrEqual(80);
    expect(payload.premiumData.soulMirror?.truth2Text.length).toBeGreaterThanOrEqual(80);
    expect(payload.premiumData.soulMirror?.truth3Text.length).toBeGreaterThanOrEqual(80);
    expect(payload.premiumData.soulMirror?.elemental).toBeDefined();
    expect(payload.premiumData.soulMirror?.elemental.dominantElementName.length).toBeGreaterThan(0);

    // Characteristics, Current Phase, Dark Secret, Yogas, Doshas, Timeline, Gochara, Summary
    expect(payload.premiumData.characteristics && payload.premiumData.characteristics.length).toBeGreaterThan(0);
    expect(payload.premiumData.darkSecret && payload.premiumData.darkSecret.length).toBeGreaterThan(0);
    expect(payload.premiumData.currentPhase && payload.premiumData.currentPhase.length).toBeGreaterThan(0);
    expect(payload.premiumData.yogas && payload.premiumData.yogas.length).toBeGreaterThan(0);
    expect(payload.premiumData.doshas && payload.premiumData.doshas.length).toBeGreaterThan(0);
    expect(payload.premiumData.timeline).toHaveLength(6);
    expect(payload.premiumData.gochara && payload.premiumData.gochara.length).toBeGreaterThanOrEqual(2);
    expect(payload.premiumData.summary && payload.premiumData.summary.length).toBeGreaterThan(0);

    // Annual Forecast (Next 1-Year Master Forecast) validation
    expect(payload.translations.annualForecastTitle).toBeDefined();
    expect(payload.translations.annualForecastTitle).toContain("ಮುಂದಿನ ೧ ವರ್ಷದ");
    expect(payload.premiumData.annualForecast && payload.premiumData.annualForecast.length).toBeGreaterThan(0);
    expect(payload.premiumData.annualForecast![0].impact.length).toBeGreaterThanOrEqual(100);
    expect(payload.premiumData.annualForecast![0].impact).toContain("【ಮುಂದಿನ ೧ ವರ್ಷದ ದೈವಿಕ ಸಂಕಲ್ಪ & ವಿಜಯ ಸಾಧನೆ】");

    expect(payload.predictions).toHaveLength(5);
  }, 60000);
});


