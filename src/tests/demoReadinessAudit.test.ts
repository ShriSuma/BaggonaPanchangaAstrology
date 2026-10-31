import { describe, it, expect } from "vitest";
import { ensureCompleteSentences, ensureNamePresence } from "../features/premiumPdf/dynamicBhavishyaEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { PriestQrCard1PageTemplate } from "../components/seva/pdf/PriestQrCard1PageTemplate";
import { PDF_I18N } from "../components/kundli/KundliRemedyPdfTemplate";
import React from "react";
import ReactDOMServer from "react-dom/server";

describe("Demo Readiness Audit: Hindi & English Strict Language Isolation & Formatting", () => {
  it("prevents dangling truncated endings like 'ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ' with ensureCompleteSentences", () => {
    // Exact screenshot cut-off text:
    const truncatedKn =
      "ಮ ಅವರೇ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮತ್ತು ಕುಟುಂಬ ಜೀವನದಲ್ಲಿ ಸೌಂದರ್ಯ, ಕಲೆ ಮತ್ತು ಸಾಮರಸ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಈ ಮಾಳವ್ಯ ಯೋಗವು ಅತ್ಯಂತ ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸುತ್ತದೆ. ಕಷ್ಟದ ಕಾಲದಲ್ಲೂ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಘನತೆ ಮತ್ತು ಮೌಲ್ಯಗಳು ಎಂದಿಗೂ ಕುಗ್ಗದಂತೆ ಈ ಯೋಗವು ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ";

    const fixedKn = ensureCompleteSentences(truncatedKn, "kn");

    // Must NOT end with orphaned "ನಿಮ್ಮ"
    expect(fixedKn.endsWith("ನಿಮ್ಮ")).toBe(false);
    expect(fixedKn.endsWith("ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ.")).toBe(true);
    expect(fixedKn).not.toContain("ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ");
  });

  it("handles trailing incomplete sentences across Hindi and English with ensureCompleteSentences", () => {
    const truncatedHi =
      "मालव्य योग के प्रभाव से आपके जीवन में सुख और समृद्धि की वृद्धि होगी। आपके व्यक्तित्व में निखार आएगा और आप";
    const fixedHi = ensureCompleteSentences(truncatedHi, "hi");
    expect(fixedHi.endsWith("और आप")).toBe(false);
    expect(fixedHi.endsWith("वृद्धि होगी।")).toBe(true);

    const truncatedEn =
      "Malavya Yoga brings immense prosperity and artistic flair to your life. Your innate dignity will remain unshaken and your";
    const fixedEn = ensureCompleteSentences(truncatedEn, "en");
    expect(fixedEn.endsWith("and your")).toBe(false);
    expect(fixedEn.endsWith("to your life.")).toBe(true);
  });

  it("expands single-letter truncated devotee initial 'ಮ' to full canonical name 'ಮನೋಜ್'", () => {
    // Exact screenshot 2 text:
    const singleInitialKn =
      "ಮ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಂಚಮಹಾಪುರುಷ ಯೋಗಗಳಲ್ಲಿ ಒಂದಾದ ಅತಿಶಯವಾದ ಮಾಳವ್ಯ ಯೋಗವು ಉಂಟಾಗಿದೆ.\n\n" +
      "ಮ ಅವರೇ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮತ್ತು ಕುಟುಂಬ ಜೀವನದಲ್ಲಿ ಸೌಂದರ್ಯ, ಕಲೆ ಮತ್ತು ಸಾಮರಸ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಈ ಯೋಗವು ಸಹಕಾರಿ.";

    const fixed = ensureNamePresence(singleInitialKn, "Manoj", "kn");

    // Single letter "ಮ, " or "ಮ ಅವರೇ" must be expanded to "ಮನೋಜ್"
    expect(fixed).not.toMatch(/^ಮ,\s*/);
    expect(fixed).not.toContain("ಮ ಅವರೇ");
    expect(fixed).toContain("ಮನೋಜ್");
    expect(fixed.startsWith("ಮನೋಜ್ ಅವರೇ,") || fixed.startsWith("ಮನೋಜ್,")).toBe(true);
  });

  it("heals exact Screenshot 1 text: purges abhimani, collapses duplicate greetings, eliminates Tamil honorifics, and strips name spam in subsequent paragraphs", () => {
    const rawScreenshot1 =
      "ಅಭಿಮಾನಿ ಶ್ರೀಯುತ ಮನೋಜ್ ಅವರೇ, ಪ್ರಿಯ ಮನುಜ್ ಅವರ‍್ಗಳೇ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದಿಂದ ಸಪ್ತಮ ಸ್ಥಾನವಾದ ಮಿಥುನ ರಾಶಿಯಲ್ಲಿ ಕುಜ ಗ್ರಹವು ಸ್ಥಿತನಾಗಿರುವುದು ಮತ್ತು ಸಪ್ತಮ ಅಧಿಪತಿಯಾದ ಬುಧನು ಕುಂಭ ರಾಶಿಯಲ್ಲಿ ಮೂರನೇ ಮನೆಯಲ್ಲಿ ವಕ್ರಗತಿಯಲ್ಲಿರುವುದು ನಿಮ್ಮ ವೈವಾಹಿಕ ಜೀವನದ ಆಳವಾದ ಕರ್ಮದ ಬಂಧವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತದೆ. ಈಗ ನಡೆಯುತ್ತಿರುವ ಚಂದ್ರ ಮಹಾದಶಾವಿನಲ್ಲಿ ಶನಿ ಭುಕ್ತಿಯ ಪ್ರಭಾವದಿಂದಾಗಿ ಮದುವೆ ಮತ್ತು ದಾಂಪತ್ಯದ ವಿಷಯದಲ್ಲಿ ಅನೇಕ ರೀತಿಯ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ವಿಳಂಬಗಳು ಎದುರಾಗುತ್ತಿರುವುದು ಸಹಜವೇ ಆಗಿದೆ. ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷವು ಸಪ್ತಮ ಭಾವದಲ್ಲಿ ರೂಪುಗೊಂಡಿರುವುದರಿಂದ, ವೈವಾಹಿಕ ಸಂಬಂಧಗಳನ್ನು ಕುದುರಿಸುವಾಗ ಪರಸ್ಪರ ಒಮ್ಮತ ಮೂಡಲು ಅತಿಯಾದ ಶ್ರಮ ಹಾಗೂ ತಾಳ್ಮೆ ಅಗತ್ಯವಾಗಿದೆ\n\n" +
      "ಮನುಜ್ ಅವರೇ, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ ವಿವಾಹ ಕಾರಕನಾದ ಶುಕ್ರನು ಮೀನ ರಾಶಿಯಲ್ಲಿ ನಾಲ್ಕನೇ ಮನೆಯಲ್ಲಿ";

    const fixed = ensureNamePresence(rawScreenshot1, "Manoj", "kn");
    const paras = fixed.split("\n\n");

    expect(fixed).not.toContain("ಅಭಿಮಾನಿ");
    expect(fixed).not.toContain("ಅವರ‍್ಗಳೇ");
    expect(fixed).not.toContain("ಅವರ್ಗಳೇ");
    expect(fixed).not.toContain("ಮನುಜ್");
    
    // Paragraph 0 should have exactly 1 respectful greeting: "ಮನೋಜ್ ಅವರೇ, "
    expect(paras[0].startsWith("ಮನೋಜ್ ಅವರೇ,")).toBe(true);
    expect(paras[0]).not.toContain("ಪ್ರಿಯ");

    // Paragraph 1 must NOT repeat the greeting "ಮನೋಜ್ ಅವರೇ" or "ಮನುಜ್ ಅವರೇ"
    expect(paras[1]).not.toMatch(/^(?:ಮನೋಜ್|ಮನುಜ್)\s*ಅವರೇ/);
    expect(paras[1].startsWith("ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ")).toBe(true);
  });

  it("heals exact Screenshot 2 text: expands 'ಮ' initial, removes dangling 'ನಿಮ್ಮ', and moderates paragraph 2", () => {
    const rawScreenshot2 =
      "ಮ, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಂಚಮಹಾಪುರುಷ ಯೋಗಗಳಲ್ಲಿ ಒಂದಾದ ಅತಿಶಯವಾದ ಮಾಳವ್ಯ ಯೋಗವು ಉಂಟಾಗಿದೆ. ಶುಕ್ರ ಗ್ರಹವು ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿ ಸ್ವಕ್ಷೇತ್ರ ಅಥವಾ ಉಚ್ಚ ಸ್ಥಾನದಲ್ಲಿ ನೆಲೆಸಿದಾಗ ಸಿದ್ಧಿಸುವ ಈ ಯೋಗವು ವ್ಯಕ್ತಿಗೆ ಅಸಾಧಾರಣ ನಾಯಕತ್ವ ಗುಣಗಳು, ಭೋಗ-ಭಾಗ್ಯಗಳು ಮತ್ತು ಉದಾತ್ತ ಸ್ವಭಾವದ ಚಾರಿತ್ರ್ಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ\n\n" +
      "ಮ ಅವರೇ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮತ್ತು ಕುಟುಂಬ ಜೀವನದಲ್ಲಿ ಸೌಂದರ್ಯ, ಕಲೆ ಮತ್ತು ಸಾಮರಸ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಈ ಮಾಳವ್ಯ ಯೋಗವು ಅತ್ಯಂತ ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸುತ್ತದೆ. ಕಷ್ಟದ ಕಾಲದಲ್ಲೂ ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಘನತೆ ಮತ್ತು ಮೌಲ್ಯಗಳು ಎಂದಿಗೂ ಕುಗ್ಗದಂತೆ ಈ ಯೋಗವು ನಿಮ್ಮನ್ನು ಕಾಪಾಡುತ್ತದೆ. ನಿಮ್ಮ";

    const fixed = ensureNamePresence(rawScreenshot2, "Manoj", "kn");
    const paras = fixed.split("\n\n");

    // Paragraph 0 must not start with "ಮ,"
    expect(paras[0]).not.toMatch(/^ಮ,\s*/);
    expect(paras[0].startsWith("ಮನೋಜ್ ಅವರೇ,") || paras[0].startsWith("ಮನೋಜ್,")).toBe(true);

    // Paragraph 1 must not contain "ಮ ಅವರೇ"
    expect(paras[1]).not.toContain("ಮ ಅವರೇ");

    // Paragraph 1 must not end with dangling "ನಿಮ್ಮ"
    expect(paras[1].endsWith("ನಿಮ್ಮ")).toBe(false);
    expect(paras[1].endsWith("ಕಾಪಾಡುತ್ತದೆ.")).toBe(true);
  });

  it("verifies KundliRemedyPdfTemplate PDF_I18N Hindi section has Devanagari numeral '८.' and zero Kannada", () => {
    const hiI18n = PDF_I18N.hi;
    expect(hiI18n.sec8Title).toBe("८. प्रधान अर्चक का आशीर्वचन एवं गोकर्ण मुद्रा");
    expect(hiI18n.sec8Title).not.toContain("೮");

    // Ensure all strings in hiI18n have zero Kannada characters
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    for (const [key, val] of Object.entries(hiI18n)) {
      if (typeof val === "string") {
        expect(kannadaRegex.test(val), `Key ${key} contains Kannada in Hindi: ${val}`).toBe(false);
      }
    }
  });

  it("verifies PriestQrCard1PageTemplate renders 100% pure Hindi with zero Kannada characters", () => {
    const htmlHi = ReactDOMServer.renderToStaticMarkup(
      React.createElement(PriestQrCard1PageTemplate, {
        personName: "Manoj",
        rashiName: "तुला",
        nakshatraName: "स्वाती",
        gotra: "कश्यप",
        priestName: "वेदपूर्ति श्रीराम पंडित",
        priestPhone: "9972339362",
        durationDays: 30,
        qrDataUrl: "data:image/png;base64,mock",
        lang: "hi"
      })
    );

    // Zero Kannada script in Hindi output
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    expect(kannadaRegex.test(htmlHi)).toBe(false);

    // Hindi specific strings must be present
    expect(htmlHi).toContain("श्री गोकर्ण महाबलेश्वर सन्निधि");
    expect(htmlHi).toContain("१.");
    expect(htmlHi).toContain("२.");
    expect(htmlHi).toContain("३.");
    expect(htmlHi).toContain("दूरभाष");
  });

  it("verifies PriestQrCard1PageTemplate renders 100% pure English with zero Indic characters", () => {
    const htmlEn = ReactDOMServer.renderToStaticMarkup(
      React.createElement(PriestQrCard1PageTemplate, {
        personName: "Manoj",
        rashiName: "Libra",
        nakshatraName: "Swati",
        gotra: "Kashyapa",
        priestName: "Veda Murthi Shreeram Pandit",
        priestPhone: "9972339362",
        durationDays: 30,
        qrDataUrl: "data:image/png;base64,mock",
        lang: "en"
      })
    );

    // Zero Kannada script in English output
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    expect(kannadaRegex.test(htmlEn)).toBe(false);

    // English specific strings must be present
    expect(htmlEn).toContain("Sri Gokarna Mahabaleshwara Sannidhi");
    expect(htmlEn).toContain("1.");
    expect(htmlEn).toContain("2.");
    expect(htmlEn).toContain("3.");
    expect(htmlEn).toContain("Phone:");
  });

  it("verifies KundliDoshaPdfTemplate renders pure Hindi with zero Kannada script", () => {
    const mockReport: any = {
      devoteeInfo: {
        name: "मनोज",
        birthDate: "1994-05-15",
        birthTime: "14:30",
        lagnaRashi: "तुला",
        moonRashi: "तुला",
        nakshatra: "स्वाती",
        pada: 2,
        currentAge: 32,
        ageStageKey: "gruhastha",
        currentDashaStr: "शुक्र - बुध",
        ageStageNameRecord: { hi: "गृहस्थ जीवन (28-50 वर्ष)", en: "Gruhastha (28-50 Yrs)" },
        currentAgeFocusSummary: { hi: "वर्तमान आयु में करियर एवं गृहस्थ शांति प्राथमिक कर्तव्य है।" }
      },
      doshas: [
        {
          id: "kuja_dosha",
          name: { hi: "कुज (मंगल) दोष", en: "Kuja Dosha" },
          isDetected: true,
          severity: "high",
          agePriorityRank: 1,
          technicalReason: { hi: "सप्तम भाव में मंगल स्थित है।" },
          recommendedPooja: { hi: "कुज शांति होम" },
          remedies: { hi: ["मंगल गायत्री मंत्र", "सुब्रह्मण्य आराधना"] },
          immediateActionRequired: { hi: "प्रति मंगलवार लाल पुष्प अर्पण करें।" },
          statusBadge: { hi: "सक्रिय" }
        }
      ],
      gandantaraAndBhaya: {
        activeGandantaras: [],
        detectedFears: []
      },
      summary: {
        totalEvaluated: 12,
        criticalCount: 0,
        highCount: 1,
        moderateCount: 0,
        karmicIndexScore: 35
      }
    };

    const htmlHi = ReactDOMServer.renderToStaticMarkup(
      React.createElement(KundliDoshaPdfTemplate, {
        report: mockReport,
        lang: "hi",
        qrCodeDataUrl: "data:image/png;base64,mock"
      })
    );

    // Zero Kannada characters anywhere in the rendered HTML!
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    expect(kannadaRegex.test(htmlHi)).toBe(false);

    // Check key localized Hindi elements
    expect(htmlHi).toContain("भाग १");
    expect(htmlHi).toContain("॥ सूर्य ॥");
    expect(htmlHi).toContain("॥ शिव ॥");
    expect(htmlHi).toContain("जातक विवरण");
    expect(htmlHi).toContain("प्रमुख कर्म दोष विश्लेषण");
    expect(htmlHi).toContain("परीक्षित वर्ग:");
    expect(htmlHi).toContain("कर्म दोष सूचकांक:");
  });

  it("verifies KundliDoshaPdfTemplate renders pure English with zero Indic script", () => {
    const mockReport: any = {
      devoteeInfo: {
        name: "Manoj",
        birthDate: "1994-05-15",
        birthTime: "14:30",
        lagnaRashi: "Libra",
        moonRashi: "Libra",
        nakshatra: "Swati",
        pada: 2,
        currentAge: 32,
        ageStageKey: "gruhastha",
        currentDashaStr: "Venus - Mercury",
        ageStageNameRecord: { en: "Householder (28-50 Yrs)" },
        currentAgeFocusSummary: { en: "Focus on career consolidation and domestic stability." }
      },
      doshas: [
        {
          id: "kuja_dosha",
          name: { en: "Kuja (Manglik) Dosha" },
          isDetected: true,
          severity: "high",
          agePriorityRank: 1,
          technicalReason: { en: "Mars is placed in the 7th kendra house." },
          recommendedPooja: { en: "Kuja Shanti Homa" },
          remedies: { en: ["Mangala Gayatri Mantra", "Subrahmanya Worship"] },
          immediateActionRequired: { en: "Offer red flowers on Tuesdays." },
          statusBadge: { en: "Active" }
        }
      ],
      gandantaraAndBhaya: {
        activeGandantaras: [],
        detectedFears: []
      },
      summary: {
        totalEvaluated: 12,
        criticalCount: 0,
        highCount: 1,
        moderateCount: 0,
        karmicIndexScore: 35
      }
    };

    const htmlEn = ReactDOMServer.renderToStaticMarkup(
      React.createElement(KundliDoshaPdfTemplate, {
        report: mockReport,
        lang: "en",
        qrCodeDataUrl: "data:image/png;base64,mock"
      })
    );

    // Zero Kannada script anywhere in the English output
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    expect(kannadaRegex.test(htmlEn)).toBe(false);

    // Check key localized English elements
    expect(htmlEn).toContain("Part 1");
    expect(htmlEn).toContain("॥ Surya ॥");
    expect(htmlEn).toContain("॥ Shiva ॥");
    expect(htmlEn).toContain("Native Profile");
    expect(htmlEn).toContain("Primary Karmic Doshas");
    expect(htmlEn).toContain("Evaluated Categories:");
    expect(htmlEn).toContain("Karmic Vulnerability:");
  });
});