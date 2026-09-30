import { describe, it, expect } from "vitest";
import {
  localizeYogaName,
  localizeDoshaName,
  localizeGocharaName
} from "../features/premiumPdf/yogaDoshaGocharaEnricher";
import { PDF_T } from "../features/premiumPdf/premiumPdfLocale";
import { getLocalizedDevoteeName, buildDynamicCurrentPhaseFallback } from "../features/premiumPdf/dynamicBhavishyaEngine";

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
});
