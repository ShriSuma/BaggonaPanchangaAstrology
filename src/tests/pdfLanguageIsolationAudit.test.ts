import { describe, it, expect } from "vitest";
import {
  localizeYogaName,
  localizeDoshaName,
  localizeGocharaName,
  localizeDoshaRemedy
} from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { PDF_T, cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import {
  getLocalizedDevoteeName,
  buildDynamicCurrentPhaseFallback,
  buildDynamicTimelineFallback,
  ensureNamePresence,
  moderateNameRepetition
} from "../features/premiumPdf/dynamicBhavishyaEngine";

describe("Premium PDF V1 - 100% Strict Language Isolation Audit", () => {
  const regionalLangs = ["kn", "hi", "te", "ta"] as const;

  it("verifies PDF_T has authentic hand-authored footer and ashirvadaValue for all 5 languages with zero English in regional", () => {
    for (const lang of regionalLangs) {
      const footer = PDF_T.footer[lang];
      const ashirvada = PDF_T.ashirvadaValue[lang];

      expect(footer).toBeDefined();
      expect(footer.length).toBeGreaterThan(5);
      expect(/[a-zA-Z]/.test(footer)).toBe(false);

      expect(ashirvada).toBeDefined();
      expect(ashirvada.length).toBeGreaterThan(20);
      expect(/[a-zA-Z]/.test(ashirvada)).toBe(false);
    }

    expect(PDF_T.footer.en).toContain("Baggona");
    expect(PDF_T.ashirvadaValue.en).toContain("Mukhyaprana");
  });

  it("verifies localizeYogaName translates classical yogas into pure native script with zero English in regional", () => {
    const testYogas = [
      "Gajakesari Yoga",
      "Budhaditya Yoga",
      "Ruchaka Yoga",
      "Bhadra Yoga",
      "Hamsa Yoga",
      "Malavya Yoga",
      "Shasha Yoga",
      "Chandra Mangala Yoga",
      "Lakshmi Yoga",
      "Saraswati Yoga",
      "Ubhayachari Yoga",
      "Vasi Yoga",
      "Vesi Yoga",
      "Neechabhanga Raja Yoga",
      "Dharma Karmadhipati Yoga"
    ];

    for (const lang of regionalLangs) {
      for (const yoga of testYogas) {
        const localized = localizeYogaName(yoga, lang);
        expect(localized).toBeDefined();
        expect(localized.length).toBeGreaterThan(0);
        expect(/[a-zA-Z]/.test(localized)).toBe(false);
      }
    }
  });

  it("verifies localizeDoshaName translates doshas into pure native script with zero English in regional", () => {
    const testDoshas = [
      "Kuja Dosha",
      "Manglik Dosha",
      "Kemadruma Dosha",
      "Sarpa Dosha",
      "Kala Sarpa Dosha",
      "Rahu-Ketu Dosha",
      "Pitru Dosha",
      "Guru Chandal Dosha",
      "Shani Sade Sati",
      "Ashtama Shani",
      "Kantaka Shani"
    ];

    for (const lang of regionalLangs) {
      for (const dosha of testDoshas) {
        const localized = localizeDoshaName(dosha, lang);
        expect(localized).toBeDefined();
        expect(localized.length).toBeGreaterThan(0);
        expect(/[a-zA-Z]/.test(localized)).toBe(false);
      }
    }
  });

  it("verifies localizeGocharaName translates transits into pure native script with zero English in regional", () => {
    const testTransits = [
      "Shani Gochara",
      "Guru Gochara",
      "Rahu-Ketu Gochara",
      "Surya Gochara"
    ];

    for (const lang of regionalLangs) {
      for (const transit of testTransits) {
        const localized = localizeGocharaName(transit, lang);
        expect(localized).toBeDefined();
        expect(localized.length).toBeGreaterThan(0);
        expect(/[a-zA-Z]/.test(localized)).toBe(false);
      }
    }
  });

  it("verifies getLocalizedDevoteeName transliterates English names into pure native script with zero Latin in regional", () => {
    const names = ["Raman", "Vinayaka", "Pramod Kudgi", "Shreeram Pandit"];

    for (const lang of regionalLangs) {
      for (const name of names) {
        const loc = getLocalizedDevoteeName(name, lang);
        expect(loc).toBeDefined();
        expect(loc.length).toBeGreaterThan(0);
        expect(/[a-zA-Z]/.test(loc)).toBe(false);
      }
    }

    // In English, it retains the name
    expect(getLocalizedDevoteeName("Raman", "en")).toBe("Raman");
  });

  it("verifies buildDynamicCurrentPhaseFallback generates pure regional text with zero Latin characters", () => {
    for (const lang of regionalLangs) {
      const fallback = buildDynamicCurrentPhaseFallback({
        name: "Raman",
        lang,
        ageYears: 32,
        maritalStatus: "married",
        hasChildren: "no_children",
        gender: "Male",
        lagnaRashiIndex: 0,
        lagnaSignName: lang === "kn" ? "ಮೇಷ" : lang === "hi" ? "मेष" : lang === "te" ? "మేషం" : "மேஷம்",
        moonRashiIndex: 1,
        moonSignName: lang === "kn" ? "ವೃಷಭ" : lang === "hi" ? "वृषभ" : lang === "te" ? "వృషభం" : "ரிஷபம்",
        nakshatraName: "Rohini",
        mahaLordKey: "Jupiter",
        mahaLordName: lang === "kn" ? "ಗುರು" : lang === "hi" ? "बृहस्पति" : lang === "te" ? "గురువు" : "குரு",
        bhuktiLordKey: "Saturn",
        bhuktiLordName: lang === "kn" ? "ಶನಿ" : lang === "hi" ? "शनि" : lang === "te" ? "శని" : "சனி",
        dashaSummary: "",
        houses: {},
        venusPlacement: null,
        jupiterPlacement: null,
        saturnPlacement: null,
        marsPlacement: null,
        mercuryPlacement: null,
        sunPlacement: null,
        moonPlacement: null,
        isManglik: false,
        spouseDirection: { en: "North", kn: "ಉತ್ತರ", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" },
        transitSaturn: null,
        transitJupiter: null,
        transitRahu: null,
        transitKetu: null
      });

      expect(fallback).toBeDefined();
      expect(fallback.length).toBeGreaterThan(100);
      expect(/[a-zA-Z]/.test(fallback)).toBe(false);
    }
  });

  it("verifies localizeDoshaRemedy provides pure Indic script and marital status appropriate Kuja Dosha remedies", () => {
    // 1. Married status: Must focus on marital harmony, NOT delay in marriage
    for (const lang of regionalLangs) {
      const marriedRemedy = localizeDoshaRemedy("Kuja Dosha", "", lang, "married");
      expect(marriedRemedy).toBeDefined();
      expect(marriedRemedy.length).toBeGreaterThan(15);
      expect(/[a-zA-Z]/.test(marriedRemedy)).toBe(false);

      if (lang === "kn") {
        expect(marriedRemedy).toContain("ದಾಂಪತ್ಯ");
        expect(marriedRemedy).not.toContain("ವಿಳಂಬ");
      }
    }

    // 2. English married status:
    const enMarriedRemedy = localizeDoshaRemedy("Kuja Dosha", "", "en", "married");
    expect(enMarriedRemedy).toContain("marital harmony");
    expect(enMarriedRemedy).not.toContain("delay in marriage");

    // 3. Unmarried / Single status:
    const knSingleRemedy = localizeDoshaRemedy("Kuja Dosha", "", "kn", "unmarried");
    expect(knSingleRemedy).toContain("ಕಲ್ಯಾಣ");
    expect(/[a-zA-Z]/.test(knSingleRemedy)).toBe(false);
  });

  it("verifies cleanEnglishFromRegionalText eliminates broken Latin-stripping artifacts such as ': 7 × ..'", () => {
    const rawBroken = "ಮಂಗಳ ದೋಷ ಪರಿಹಾರ : 7 × .. ಪ್ರತಿನಿತ್ಯ ಧ್ಯಾನ ಮಾಡಿ : 108 * .";
    const cleaned = cleanEnglishFromRegionalText(rawBroken, "kn");

    expect(cleaned).not.toContain(": 7 × ..");
    expect(cleaned).not.toContain("×");
    expect(cleaned).not.toContain(": 108 * .");
    expect(cleaned).toContain("ಮಂಗಳ ದೋಷ ಪರಿಹಾರ");
    expect(cleaned).toContain("ಪ್ರತಿನಿತ್ಯ ಧ್ಯಾನ ಮಾಡಿ");
  });

  it("verifies buildDynamicTimelineFallback produces 6 months of detailed Vedic transits, Chandrashtama, and Upasanas with zero Latin in regional languages", () => {
    for (const lang of regionalLangs) {
      const timeline = buildDynamicTimelineFallback({
        name: "Devotee",
        lang,
        ageYears: 35,
        maritalStatus: "married",
        hasChildren: "has_children",
        gender: "Female",
        lagnaRashiIndex: 3,
        lagnaSignName: "ಕರ್ಕಾಟಕ",
        moonRashiIndex: 3,
        moonSignName: "ಕರ್ಕಾಟಕ",
        nakshatraName: "ಪುಷ್ಯ",
        mahaLordKey: "Saturn",
        mahaLordName: "ಶನಿ",
        bhuktiLordKey: "Mercury",
        bhuktiLordName: "ಬುಧ",
        dashaSummary: "",
        houses: {
          1: { rashiName: "ಕರ್ಕಾಟಕ", lordName: "ಚಂದ್ರ", planetNames: [] },
          2: { rashiName: "ಸಿಂಹ", lordName: "ಸೂರ್ಯ", planetNames: [] },
          3: { rashiName: "ಕನ್ಯಾ", lordName: "ಬುಧ", planetNames: [] },
          4: { rashiName: "ತುಲಾ", lordName: "ಶುಕ್ರ", planetNames: [] },
          5: { rashiName: "ವೃಶ್ಚಿಕ", lordName: "ಕುಜ", planetNames: [] },
          6: { rashiName: "ಧನು", lordName: "ಗುರು", planetNames: [] },
          7: { rashiName: "ಮಕರ", lordName: "ಶನಿ", planetNames: [] },
          8: { rashiName: "ಕುಂಭ", lordName: "ಶನಿ", planetNames: [] },
          9: { rashiName: "ಮೀನ", lordName: "ಗುರು", planetNames: [] },
          10: { rashiName: "ಮೇಷ", lordName: "ಕುಜ", planetNames: [] },
          11: { rashiName: "ವೃಷಭ", lordName: "ಶುಕ್ರ", planetNames: [] },
          12: { rashiName: "ಮಿಥುನ", lordName: "ಬುಧ", planetNames: [] }
        },
        venusPlacement: null,
        jupiterPlacement: null,
        saturnPlacement: null,
        marsPlacement: null,
        mercuryPlacement: null,
        sunPlacement: null,
        moonPlacement: null,
        isManglik: false,
        spouseDirection: { en: "North", kn: "ಉತ್ತರ", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" },
        transitSaturn: { rashiIndex: 10, houseFromMoon: 8, isSadeSati: false, isAshtama: true, isKantaka: false },
        transitJupiter: { rashiIndex: 1, houseFromMoon: 11, isGuruBala: true },
        transitRahu: { rashiIndex: 11, houseFromMoon: 12 },
        transitKetu: { rashiIndex: 5, houseFromMoon: 6 }
      } as any);

      expect(timeline).toHaveLength(6);
      for (const item of timeline) {
        expect(item.dateRange).toBeDefined();
        expect(item.impact.length).toBeGreaterThan(150);
        expect(item.monthlyUpasana).toBeDefined();
        expect(item.shubhaDinagalu).toBeDefined();
        expect(item.chandrashtamaDinagalu).toBeDefined();
        // Strict pure Indic check: zero Latin characters
        expect(/[a-zA-Z]/.test(item.impact)).toBe(false);
        expect(/[a-zA-Z]/.test(item.dateRange)).toBe(false);
      }
    }
  });

  it("verifies cleanEnglishFromRegionalText completely purges Japanese, CJK, and cross-Indic scripts", () => {
    // 1. Japanese / CJK leakage in Kannada
    const rawWithJapanese = "ಉತ್ತರ ಭಾದ್ರಪದ ನಕ್ಷತ್ರ ಮತ್ತು ಶುಭ ಫಲ 日本語 こんにちは 東京 2026";
    const cleanedKn = cleanEnglishFromRegionalText(rawWithJapanese, "kn");
    expect(cleanedKn).toContain("ಉತ್ತರ ಭಾದ್ರಪದ ನಕ್ಷತ್ರ ಮತ್ತು ಶುಭ ಫಲ");
    expect(cleanedKn).not.toContain("日本語");
    expect(cleanedKn).not.toContain("こんにちは");
    expect(cleanedKn).not.toContain("東京");

    // 2. Cross-script Indic leakage: Tamil and Devanagari in Kannada
    const rawCrossScriptKn = "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ தமிழ் வணக்கம் नमस्ते";
    const cleanedCrossKn = cleanEnglishFromRegionalText(rawCrossScriptKn, "kn");
    expect(cleanedCrossKn).toContain("ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ");
    expect(cleanedCrossKn).not.toContain("தமிழ்");
    expect(cleanedCrossKn).not.toContain("வணக்கம்");
    expect(cleanedCrossKn).not.toContain("नमस्ते");

    // 3. Transliterated Tamil honorific suffixes in Kannada
    const rawTamilSuffixKn = "ಪ್ರಿಯ ಮನೋಜ್ ಅವರ‍್ಗಳೇ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದಿಂದ ಅವರ‍್ಗಳಿಗೆ ಮಂಗಳವಾಗಲಿ ಅವರ‍್ಗಳ ಆಶೀರ್ವಾದ";
    const cleanedTamilSuffix = cleanEnglishFromRegionalText(rawTamilSuffixKn, "kn");
    expect(cleanedTamilSuffix).toContain("ಅವರೇ");
    expect(cleanedTamilSuffix).not.toContain("ಅವರ‍್ಗಳೇ");
    expect(cleanedTamilSuffix).not.toContain("ಅವರ್ಗಳೇ");
    expect(cleanedTamilSuffix).toContain("ಅವರಿಗೆ");
    expect(cleanedTamilSuffix).not.toContain("ಅವರ‍್ಗಳಿಗೆ");
    expect(cleanedTamilSuffix).toContain("ಅವರ");
    expect(cleanedTamilSuffix).not.toContain("ಅವರ‍್ಗಳ");

    // 4. "ಅಭಿಮಾನಿ" and Telugu "ಗಾರು/ಕರು" purge in Kannada
    const rawAbhimaniKn = "ಅಭಿಮಾನಿ ಶ್ರೀಯುತ ಮನೋಜ್ ಕರು ಅವರೇ";
    const cleanedAbhimani = cleanEnglishFromRegionalText(rawAbhimaniKn, "kn");
    expect(cleanedAbhimani).not.toContain("ಅಭಿಮಾನಿ");
    expect(cleanedAbhimani).toContain("ಮನೋಜ್ ಅವರೇ");

    // 5. Cross-script Indic leakage in Hindi: Kannada in Hindi
    const rawCrossScriptHi = "आपकी कुंडली में शुभ योग है ನಿಮ್ಮ ಜಾತಕ";
    const cleanedCrossHi = cleanEnglishFromRegionalText(rawCrossScriptHi, "hi");
    expect(cleanedCrossHi).toContain("आपकी कुंडली में शुभ योग है");
    expect(cleanedCrossHi).not.toContain("ನಿಮ್ಮ ಜಾತಕ");
  });

  it("verifies ensureNamePresence normalizes devotee name variants (Manoj/ಮನೋಜ್) and collapses duplicate stacked greetings", () => {
    // Exact screenshot text regression test:
    const screenshotText =
      "ಅಭಿಮಾನಿ ಶ್ರೀಯುತ ಮನೋಜ್ ಅವರೇ, ಪ್ರಿಯ ಮನುಜ್ ಅವರ‍್ಗಳೇ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನದಿಂದ ಸಪ್ತಮ ಸ್ಥಾನವಾದ ಮಿಥುನ ರಾಶಿಯಲ್ಲಿ ಕುಜ ಗ್ರಹವು ಸ್ಥಿತನಾಗಿರುವುದು.\n\n" +
      "ಮನುಜ್ ಅವರೇ, ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ ವಿವಾಹ ಕಾರಕನಾದ ಶುಕ್ರನು ಮೀನ ರಾಶಿಯಲ್ಲಿ ನಾಲ್ಕನೇ ಮನೆಯಲ್ಲಿದ್ದಾನೆ.";

    const result = ensureNamePresence(screenshotText, "Manoj", "kn");

    // Must NOT contain inappropriate "ಅಭಿಮಾನಿ"
    expect(result).not.toContain("ಅಭಿಮಾನಿ");

    // Must NOT contain misspelled "ಮನುಜ್"
    expect(result).not.toContain("ಮನುಜ್");

    // Must NOT contain Tamil suffix "ಅವರ‍್ಗಳೇ"
    expect(result).not.toContain("ಅವರ‍್ಗಳೇ");

    // Must collapse duplicate greeting into single dignified "ಮನೋಜ್ ಅವರೇ,"
    expect(result.startsWith("ಮನೋಜ್ ಅವರೇ,")).toBe(true);

    // Paragraph 2 must NOT spam "ಮನೋಜ್ ಅವರೇ," or "ಮನುಜ್ ಅವರೇ," again — it should naturally flow with "ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ"
    const paras = result.split("\n\n");
    expect(paras).toHaveLength(2);
    expect(paras[1]).not.toContain("ಮನೋಜ್ ಅವರೇ");
    expect(paras[1]).not.toContain("ಮನುಜ್ ಅವರೇ");
    expect(paras[1]).toContain("ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಕಾರ");
  });

  it("verifies moderateNameRepetition prevents robotic name spam across paragraphs", () => {
    const multiMention =
      "ಮನೋಜ್ ಅವರೇ, ನಿಮ್ಮ ಲಗ್ನವು ವೃಷಭ. ಮನೋಜ್ ಅವರ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ.\n\n" +
      "ಮನೋಜ್ ಅವರೇ, ನಿಮ್ಮ ದಶಮ ಸ್ಥಾನದಲ್ಲಿ ಸೂರ್ಯನಿದ್ದಾನೆ. ಮನೋಜ್ ಅವರಿಗೆ ಉತ್ತಮ ಗೌರವ ಸಿಗಲಿದೆ.";

    const moderated = moderateNameRepetition(multiMention, "ಮನೋಜ್", "kn");

    // First greeting preserved
    expect(moderated.startsWith("ಮನೋಜ್ ಅವರೇ,")).toBe(true);

    // Subsequent mentions in para 1 replaced with natural pronouns
    const paras = moderated.split("\n\n");
    expect(paras[0]).toContain("ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು ಬಲವಿದೆ");
    expect(paras[0]).not.toContain("ಮನೋಜ್ ಅವರ ಜಾತಕದಲ್ಲಿ");

    // Para 2 does not repeat "ಮನೋಜ್ ಅವರೇ" at opening or inside
    expect(paras[1]).not.toContain("ಮನೋಜ್ ಅವರೇ");
    expect(paras[1]).toContain("ನಿಮ್ಮ ದಶಮ ಸ್ಥಾನದಲ್ಲಿ");
    expect(paras[1]).toContain("ನಿಮಗೆ ಉತ್ತಮ ಗೌರವ ಸಿಗಲಿದೆ");
  });
});
