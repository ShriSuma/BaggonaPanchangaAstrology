import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import {
  analyzeDailyLunarStability,
  buildBtrWindowCandidates,
  resolveBtrSelection,
  buildChandraSankhyaProfile,
  computeDeepPrashnaHoraryReading,
  getPrashnaDomainOptions
} from "../features/hotelSecret/hotelUnknownTimeEngine";
import {
  HOTEL_PALM_PRICE_INR,
  HOTEL_FACE_PRICE_INR,
  HOTEL_PRASHNA_PRICE_INR,
  HOTEL_SAMUDRIKA_COMBO_INR,
  HOTEL_TRINETRA_ALL3_INR,
  HOTEL_EXPRESS_PRICE_INR,
  HOTEL_PDF_PRICE_INR,
  HOTEL_PREMIUM_REMEDY_PRICE_INR,
  verifyHotelPaymentInstant
} from "../features/hotelSecret/antarangaService";
import { executePalmReading } from "../features/palmreading/palmReadingEngine";
import { executeFaceReading } from "../features/facereading/faceReadingEngine";
import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";
import { FaceReadingPdfTemplate } from "../components/facereading/FaceReadingPdfTemplate";
import { HotelPrashnaPdfTemplate } from "../components/hotelSecret/HotelPrashnaPdfTemplate";
import { prepareSampoornaMaster25Data } from "../services/sampoornaMaster25Service";
import { SampoornaMaster25PdfTemplate } from "../components/sampoornaMaster25/SampoornaMaster25PdfTemplate";
import { HotelExpressWalkInPdfTemplate } from "../components/hotelSecret/HotelExpressWalkInPdfTemplate";
import type { SevenLang } from "../services/sampoornaMaster25Locale7L";
import fs from "fs";
import path from "path";
import { generateExpressWalkInAiNarrative } from "../features/hotelSecret/hotelUnknownTimeEngine";
import {
  checkHotelFreePreviewQuota,
  markHotelFreePreviewConsumed,
  clearTestHotelQuotaMemory,
  getFreeQuotaExhaustedMessage
} from "../features/hotelSecret/hotelFreeQuotaGuard";

const SEVEN_LANGS: SevenLang[] = ["kn", "en", "hi", "mr", "te", "ta", "ml"];

describe("Hotel QR Unknown-Time, BTR, Prashna & Express ₹149 Verification", () => {
  beforeEach(() => {
    cleanup();
  });

  const sampleKundliInput = {
    name: "Karthik Rao",
    birthDate: "1994-06-15",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male" as const
  };

  it("1. Preserves 100% existing behavior for Exact Date + Time (Zero Regression)", async () => {
    const kundli = calculateKundli(sampleKundliInput);
    const exactPayload = await prepareSampoornaMaster25Data(
      {
        kundli,
        placeLabel: "Gokarna",
        input: sampleKundliInput
      },
      "kn",
      { enableAi: false, timePrecision: "exact" }
    );

    expect(exactPayload.timePrecision).toBe("exact");
    expect(exactPayload.hasMaandiKnot).toBe(true);
    expect(exactPayload.lagnaName).toBeTruthy();
    expect(exactPayload.lagnaName).not.toContain("ಚಂದ್ರ ಲಗ್ನ");
    expect(exactPayload.chapters).toHaveLength(25);
  });

  it("2. Detects both Constant-Moon dates and Lunar-Shift dates with binary refinement", () => {
    let foundConstant = false;
    let foundShift = false;

    for (let day = 1; day <= 28; day++) {
      const dateStr = `1995-05-${String(day).padStart(2, "0")}`;
      const stability = analyzeDailyLunarStability(dateStr, 14.5479, 74.3188, "kn");
      if (!stability.hasMoonShift) {
        foundConstant = true;
        expect(stability.isRashiConstant).toBe(true);
        expect(stability.isNakshatraConstant).toBe(true);
      } else {
        foundShift = true;
        expect(stability.transitionApproxHour).toMatch(/^[\d೦-೯]{2}:[\d೦-೯]{2}$/);
        const stabilityEn = analyzeDailyLunarStability(dateStr, 14.5479, 74.3188, "en");
        expect(stabilityEn.transitionApproxHour).toMatch(/^\d{2}:\d{2}$/);
        const nakChanged = stability.earlyCandidate.moonNakIdx !== stability.lateCandidate.moonNakIdx;
        const rashiChanged = stability.earlyCandidate.moonRashiIdx !== stability.lateCandidate.moonRashiIdx;
        expect(nakChanged || rashiChanged).toBe(true);
      }
      if (foundConstant && foundShift) break;
    }

    expect(foundConstant).toBe(true);
    expect(foundShift).toBe(true);
  });

  it("3. Builds Solar-Anchored 2-Tap BTR candidates across windows and distinguishes Lagna selections in all 7 languages", () => {
    for (const lang of SEVEN_LANGS) {
      const btr = buildBtrWindowCandidates("1995-05-15", "morning_7_11", 14.5479, 74.3188, lang);
      expect(btr.candidates.length).toBeGreaterThanOrEqual(2);
      expect(btr.requiresTwoTapTieBreak).toBe(true);
      expect(btr.questions?.q1Prompt).toBeTruthy();

      const pickA = resolveBtrSelection(btr, "A", "A");
      const pickB = resolveBtrSelection(btr, "B", "B");
      expect(pickA.confidencePct).toBeGreaterThanOrEqual(80);
      expect(pickB.confidencePct).toBeGreaterThanOrEqual(80);
      expect(pickA.selected.lagnaRashiIdx).not.toBe(pickB.selected.lagnaRashiIdx);
    }
  });

  it("4. Computes Chandra-Sankhya numerology & Deep Prashna Shastra (KP 1–108 + Tajika Ithasala) cleanly across 7 languages", () => {
    const kundli = calculateKundli(sampleKundliInput);

    for (const lang of SEVEN_LANGS) {
      const sankhya = buildChandraSankhyaProfile("Aishwarya Kamath", "1996-08-21", kundli, lang);
      expect(sankhya.mulank).toBeGreaterThanOrEqual(1);
      expect(sankhya.mulank).toBeLessThanOrEqual(9);
      expect(sankhya.bhagyank).toBeGreaterThanOrEqual(1);
      expect(sankhya.bhagyank).toBeLessThanOrEqual(9);
      expect(sankhya.chaldeanCompound).toBeGreaterThan(0);
      expect(sankhya.suryaLagnaName).toBeTruthy();

      const domains = getPrashnaDomainOptions(lang);
      expect(domains).toHaveLength(5);

      const prashna1 = computeDeepPrashnaHoraryReading({
        devoteeName: "Aishwarya Kamath",
        questionDomain: "career_wealth",
        horaryNumber: 5, // 1..9 -> Aries (0)
        latitude: 14.5479,
        longitude: 74.3188,
        lang,
        now: new Date("2026-11-27T12:15:00+05:30")
      });
      expect(prashna1.seedLagnaIdx).toBe(0);
      expect(prashna1.ithasalaHarmonyScore).toBeGreaterThanOrEqual(38);
      expect(prashna1.ithasalaHarmonyScore).toBeLessThanOrEqual(97);
      expect(prashna1.verdictTitle).toBeTruthy();

      const prashna100 = computeDeepPrashnaHoraryReading({
        devoteeName: "Aishwarya Kamath",
        questionDomain: "urgent_decision",
        horaryNumber: 105, // 100..108 -> Pisces (11)
        latitude: 14.5479,
        longitude: 74.3188,
        lang,
        now: new Date("2026-11-27T12:15:00+05:30")
      });
      expect(prashna100.seedLagnaIdx).toBe(11);
    }
  });

  it("5. Date-Only mode anchors Master 25-Chapter PDF to Chandra Lagna, disables synthetic Maandi, and renders cleanly", async () => {
    const kundli = calculateKundli({
      ...sampleKundliInput,
      birthTime: "12:00"
    });
    const chandraPayload = await prepareSampoornaMaster25Data(
      {
        kundli,
        placeLabel: "Gokarna",
        input: { ...sampleKundliInput, birthTime: "12:00" }
      },
      "kn",
      {
        enableAi: false,
        timePrecision: "date_only_chandra",
        sankhyaSummary: "Mulank 6 • Bhagyank 8 • Venus",
        laterTimeUpdateUrl: "https://baggonapanchanga.com/antaranga?table=4"
      }
    );

    expect(chandraPayload.timePrecision).toBe("date_only_chandra");
    expect(chandraPayload.hasMaandiKnot).toBe(false);
    expect(chandraPayload.lagnaName).toContain("ಚಂದ್ರ");
    expect(chandraPayload.birthTime).not.toContain("12:00");

    const { container } = render(React.createElement(SampoornaMaster25PdfTemplate, { data: chandraPayload }));
    expect(container.textContent).toContain("ಚಂದ್ರ");
    expect(container.textContent).toContain("Mulank 6");
  });

  it("6. Validates ₹149 Express Walk-In pricing, payment confirmation, and renders Express PDF across all 7 languages", async () => {
    expect(HOTEL_EXPRESS_PRICE_INR).toBe(149);
    expect(HOTEL_PDF_PRICE_INR).toBe(350);
    expect(HOTEL_PREMIUM_REMEDY_PRICE_INR).toBe(450);

    const kundli = calculateKundli(sampleKundliInput);

    for (const lang of SEVEN_LANGS) {
      const payRes = await verifyHotelPaymentInstant("ORD_EXP_1", "Raghavendra", 149, lang, "express_149", {
        authorizationSource: "CASHIER_DESK",
        approvedBy: "ShriSuma"
      });
      expect(payRes.success).toBe(true);
      expect(payRes.message).toMatch(/149|೧೪೯|१४९/);

      const sankhya = buildChandraSankhyaProfile("Raghavendra", "1992-03-11", kundli, lang);
      const prashna = computeDeepPrashnaHoraryReading({
        devoteeName: "Raghavendra",
        questionDomain: "career_wealth",
        horaryNumber: 36,
        latitude: 14.5479,
        longitude: 74.3188,
        lang,
        now: new Date("2026-11-27T13:00:00+05:30")
      });

      const { container } = render(
        React.createElement(HotelExpressWalkInPdfTemplate, {
          data: {
            devoteeName: "Raghavendra",
            lang,
            tableNumber: "7",
            hotelName: "Pandit Palette, Gokarna",
            generatedDateStr: "2026-11-27",
            prashna,
            sankhya,
            aiParagraphs: [prashna.verdictSummary]
          }
        })
      );

      expect(container.querySelector("#hotel-express-walkin-pdf")).not.toBeNull();
      expect(container.textContent).toContain("Raghavendra");
      expect(container.textContent).toContain("94821 09844");
      cleanup();
    }
  });

  it("7. Computes Pranapada, Tattva Shodhana, Kunda, Trisphuta, Chatusphuta, Chatra Rashi & Pancha Pakshi across 7 languages", () => {
    for (const lang of SEVEN_LANGS) {
      const btrMale = buildBtrWindowCandidates("1995-05-15", "morning_7_11", 14.5479, 74.3188, lang, undefined, "Male");
      const btrFemale = buildBtrWindowCandidates("1995-05-15", "morning_7_11", 14.5479, 74.3188, lang, undefined, "Female");
      expect(btrMale.candidates[0].pranapadaRashiName).toBeTruthy();
      expect(btrMale.candidates[0].kundaRashiName).toBeTruthy();
      expect(btrMale.candidates[0].tattvaLabel).toBeTruthy();
      expect(btrFemale.candidates[0].tattvaLabel).toBeTruthy();

      const prashna = computeDeepPrashnaHoraryReading({
        devoteeName: "Meenakshi",
        questionDomain: "career_wealth",
        horaryNumber: 42,
        latitude: 14.5479,
        longitude: 74.3188,
        lang,
        now: new Date("2026-11-27T13:15:00+05:30")
      });
      expect(prashna.trisphutaRashiName).toBeTruthy();
      expect(prashna.trisphutaNakshatraName).toBeTruthy();
      expect(prashna.chatusphutaRashiName).toBeTruthy();
      expect(prashna.chatraRashiName).toBeTruthy();
      expect(prashna.panchaPakshiBird).toBeTruthy();
      expect(prashna.panchaPakshiState).toBeTruthy();
      expect(prashna.tajikaYogaLabel).toBeTruthy();
    }
  });

  it("8. Validates standalone ₹150 Palm/Face, ₹200 Prashna, Combos & 7-Language separate PDF rendering", async () => {
    expect(HOTEL_PALM_PRICE_INR).toBe(150);
    expect(HOTEL_FACE_PRICE_INR).toBe(150);
    expect(HOTEL_PRASHNA_PRICE_INR).toBe(200);
    expect(HOTEL_SAMUDRIKA_COMBO_INR).toBe(249);
    expect(HOTEL_TRINETRA_ALL3_INR).toBe(349);

    const dummyImg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==";
    const kundli = calculateKundli(sampleKundliInput);

    for (const lang of SEVEN_LANGS) {
      const pPalm = await verifyHotelPaymentInstant("ORD_P_1", "Meenakshi", 150, lang, "palm_150", {
        authorizationSource: "CASHIER_DESK",
        approvedBy: "ShriSuma"
      });
      const pPrashna = await verifyHotelPaymentInstant("ORD_PR_1", "Meenakshi", 200, lang, "prashna_200", {
        authorizationSource: "CASHIER_DESK",
        approvedBy: "ShriSuma"
      });
      expect(pPalm.success).toBe(true);
      expect(pPrashna.success).toBe(true);
      expect(pPalm.message).toMatch(/150|೧೫೦|१५०/);
      expect(pPrashna.message).toMatch(/200|೨೦೦|२००/);

      const palmRes = await executePalmReading(dummyImg, "right", "Meenakshi", lang, "");
      const faceRes = await executeFaceReading(dummyImg, "Meenakshi", lang, "");
      const sankhya = buildChandraSankhyaProfile("Meenakshi", "1995-05-15", kundli, lang);
      const prashna = computeDeepPrashnaHoraryReading({
        devoteeName: "Meenakshi",
        questionDomain: "family_peace",
        horaryNumber: 72,
        latitude: 14.5479,
        longitude: 74.3188,
        lang,
        now: new Date("2026-11-27T13:15:00+05:30")
      });

      const r1 = render(React.createElement(PalmReadingPdfTemplate, { result: palmRes, personName: "Meenakshi", lang, containerId: "hotel-palm-pdf-render" }));
      expect(r1.container.querySelector("#hotel-palm-pdf-render")).not.toBeNull();
      cleanup();

      const r2 = render(React.createElement(FaceReadingPdfTemplate, { result: faceRes, devoteeName: "Meenakshi", lang, containerId: "hotel-face-pdf-render" }));
      expect(r2.container.querySelector("#hotel-face-pdf-render")).not.toBeNull();
      cleanup();

      const r3 = render(
        React.createElement(HotelPrashnaPdfTemplate, {
          data: {
            devoteeName: "Meenakshi",
            lang,
            tableNumber: "3",
            hotelName: "Pandit Palette",
            generatedDateStr: "2026-11-27",
            placeName: "Gokarna",
            prashna,
            sankhya,
            aiParagraphs: [prashna.verdictSummary]
          }
        })
      );
      expect(r3.container.querySelector("#hotel-prashna-pdf-render")).not.toBeNull();
      expect(r3.container.textContent).toContain(prashna.trisphutaRashiName);
      cleanup();
    }
  });

  it("enforces IP & device 1-free-answer limit while NEVER blocking paid downloads", async () => {
    clearTestHotelQuotaMemory();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("baggona_hotel_qr_free_claimed_v1");
      window.localStorage.removeItem("baggona_hotel_device_fp_v1");
    }

    const firstAttempt = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "203.0.113.42",
      overrideDeviceId: "dev_alpha"
    });
    expect(firstAttempt.allowed).toBe(true);
    expect(firstAttempt.alreadyUsed).toBe(false);

    await markHotelFreePreviewConsumed({
      ip: "203.0.113.42",
      deviceId: "dev_alpha",
      serviceUsed: "hasta_samudrika",
      hotelName: "Pandit Palette",
      tableNumber: "5",
      guestName: "Rohan"
    });

    const secondSameDevice = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "203.0.113.42",
      overrideDeviceId: "dev_alpha"
    });
    expect(secondSameDevice.allowed).toBe(false);
    expect(secondSameDevice.alreadyUsed).toBe(true);

    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("baggona_hotel_qr_free_claimed_v1");
    }
    const secondIncognitoSameIp = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "203.0.113.42",
      overrideDeviceId: "dev_incognito_2"
    });
    expect(secondIncognitoSameIp.allowed).toBe(false);
    expect(secondIncognitoSameIp.alreadyUsed).toBe(true);

    const paidOverride = await checkHotelFreePreviewQuota({
      isPaymentVerified: true,
      overrideIp: "203.0.113.42",
      overrideDeviceId: "dev_alpha"
    });
    expect(paidOverride.allowed).toBe(true);
    expect(paidOverride.alreadyUsed).toBe(false);

    const familyUpsellOverride = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      isPaidFamilyUpsell: true,
      overrideIp: "203.0.113.42",
      overrideDeviceId: "dev_alpha"
    });
    expect(familyUpsellOverride.allowed).toBe(true);

    const differentVisitor = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "198.51.100.77",
      overrideDeviceId: "dev_fresh_guest"
    });
    expect(differentVisitor.allowed).toBe(true);

    const langs: SevenLang[] = ["kn", "en", "hi", "mr", "te", "ta", "ml"];
    for (const lang of langs) {
      const msg = getFreeQuotaExhaustedMessage(lang, "203.0.113.42");
      expect(msg).toContain("203.0.113.42");
      expect(msg.length).toBeGreaterThan(30);
    }
  });

  it("renders dedicated 4 Life Domains (Family, Money, Health, Profession) & multi-paragraph depth on all 3 PDFs across all 7 languages", async () => {
    const langs: SevenLang[] = ["kn", "en", "hi", "mr", "te", "ta", "ml"];
    const dummyImg =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const kundli = calculateKundli({
      name: "Kiran Sharma",
      birthDate: "1994-07-19",
      birthTime: "10:15",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male"
    });

    for (const lang of langs) {
      const palmRes = await executePalmReading(dummyImg, "right", "Kiran Sharma", lang, "");
      expect(palmRes.lifeDomains).toBeDefined();
      const palmFamily = palmRes.lifeDomains!.family[lang] || palmRes.lifeDomains!.family.en;
      const palmMoney = palmRes.lifeDomains!.money[lang] || palmRes.lifeDomains!.money.en;
      const palmHealth = palmRes.lifeDomains!.health[lang] || palmRes.lifeDomains!.health.en;
      const palmProf = palmRes.lifeDomains!.profession[lang] || palmRes.lifeDomains!.profession.en;
      expect(palmFamily.length).toBeGreaterThan(15);
      expect(palmMoney.length).toBeGreaterThan(15);
      expect(palmHealth.length).toBeGreaterThan(15);
      expect(palmProf.length).toBeGreaterThan(15);
      expect(palmRes.aiPrediction.split(/\n\n+/).length).toBeGreaterThanOrEqual(2);

      const pRender = render(
        React.createElement(PalmReadingPdfTemplate, {
          result: palmRes,
          personName: "Kiran Sharma",
          lang,
          containerId: `test-palm-domains-${lang}`
        })
      );
      expect(pRender.container.textContent).toContain(palmFamily);
      expect(pRender.container.textContent).toContain(palmProf);
      cleanup();

      const faceRes = await executeFaceReading(dummyImg, "Kiran Sharma", lang, "");
      expect(faceRes.lifeDomains).toBeDefined();
      const faceFamily = faceRes.lifeDomains!.family[lang] || faceRes.lifeDomains!.family.en;
      const faceMoney = faceRes.lifeDomains!.money[lang] || faceRes.lifeDomains!.money.en;
      const faceHealth = faceRes.lifeDomains!.health[lang] || faceRes.lifeDomains!.health.en;
      const faceProf = faceRes.lifeDomains!.profession[lang] || faceRes.lifeDomains!.profession.en;
      expect(faceFamily.length).toBeGreaterThan(15);
      expect(faceMoney.length).toBeGreaterThan(15);
      expect(faceHealth.length).toBeGreaterThan(15);
      expect(faceProf.length).toBeGreaterThan(15);
      expect(faceRes.aiPrediction.split(/\n\n+/).length).toBeGreaterThanOrEqual(2);

      const fRender = render(
        React.createElement(FaceReadingPdfTemplate, {
          result: faceRes,
          devoteeName: "Kiran Sharma",
          lang,
          containerId: `test-face-domains-${lang}`
        })
      );
      expect(fRender.container.textContent).toContain(faceMoney);
      expect(fRender.container.textContent).toContain(faceHealth);
      cleanup();

      const sankhya = buildChandraSankhyaProfile("Kiran Sharma", "1994-07-19", kundli, lang);
      const prashna = computeDeepPrashnaHoraryReading({
        devoteeName: "Kiran Sharma",
        questionDomain: "career_wealth",
        horaryNumber: 45,
        latitude: 14.5479,
        longitude: 74.3188,
        lang
      });
      expect(prashna.domainGuidance).toBeDefined();
      expect(prashna.domainGuidance.family.length).toBeGreaterThan(15);
      expect(prashna.domainGuidance.money.length).toBeGreaterThan(15);
      expect(prashna.domainGuidance.health.length).toBeGreaterThan(15);
      expect(prashna.domainGuidance.profession.length).toBeGreaterThan(15);

      const aiParagraphs = await generateExpressWalkInAiNarrative({
        devoteeName: "Kiran Sharma",
        lang,
        prashna,
        sankhya,
        apiKey: ""
      });
      expect(aiParagraphs.length).toBeGreaterThanOrEqual(3);

      const prRender = render(
        React.createElement(HotelPrashnaPdfTemplate, {
          data: {
            devoteeName: "Kiran Sharma",
            lang,
            tableNumber: "5",
            hotelName: "Pandit Palette",
            generatedDateStr: "2026-11-27",
            placeName: "Gokarna",
            prashna,
            sankhya,
            aiParagraphs
          }
        })
      );
      const renderedPrashnaText = (prRender.container.textContent || "").replace(/#/g, "");
      expect(renderedPrashnaText).toContain(prashna.domainGuidance.family.replace(/#/g, ""));
      expect(renderedPrashnaText).toContain(prashna.domainGuidance.profession.replace(/#/g, ""));
      expect(renderedPrashnaText).toContain(aiParagraphs[0].replace(/#/g, ""));
      expect(renderedPrashnaText).toContain(aiParagraphs[2].replace(/#/g, ""));
      cleanup();
    }
  });

  it("strictly isolates single-service separate PDFs inside AntarangadaSatyaPage (zero combo bundles)", () => {
    const pageSrc = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/AntarangadaSatyaPage.tsx"),
      "utf-8"
    );
    expect(pageSrc).not.toContain("samudrika_combo_249");
    expect(pageSrc).not.toContain("trinetra_all3_349");
    expect(pageSrc).not.toContain("express_149");
    expect(pageSrc).toContain("paidByServiceMode");
    expect(pageSrc).toContain("checkHotelFreePreviewQuota");
  });

  it("blocks repeat free generation for the same person and same details even across different IPs/devices, and removes upfront prices from menu bar & pre-download UI", async () => {
    clearTestHotelQuotaMemory();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("baggona_hotel_qr_free_claimed_v1");
      window.localStorage.removeItem("baggona_hotel_qr_free_sigs_v1");
      window.localStorage.removeItem("baggona_hotel_device_fp_v1");
    }

    const personSignature = {
      serviceMode: "kundli",
      guestName: "Srinivas Rao",
      birthDate: "1991-06-14",
      birthTime: "08:30",
      timePrecision: "exact",
      placeName: "Hyderabad",
      gender: "male"
    };

    const firstAttempt = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "198.51.100.10",
      overrideDeviceId: "dev_srinivas_1",
      personSignature
    });
    expect(firstAttempt.allowed).toBe(true);

    await markHotelFreePreviewConsumed({
      ip: "198.51.100.10",
      deviceId: "dev_srinivas_1",
      serviceUsed: "kundli",
      hotelName: "Pandit Palette",
      tableNumber: "3",
      guestName: "Srinivas Rao",
      personSignature
    });

    // Different IP & different device + cleared localStorage, but SAME person/details -> BLOCKED!
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("baggona_hotel_qr_free_claimed_v1");
    }
    const repeatSamePerson = await checkHotelFreePreviewQuota({
      isPaymentVerified: false,
      overrideIp: "203.0.113.88",
      overrideDeviceId: "dev_srinivas_other_phone",
      personSignature: { ...personSignature, birthTime: "09:00" }
    });
    expect(repeatSamePerson.allowed).toBe(false);
    expect(repeatSamePerson.reason).toBe("same_person_or_details");

    // Paid download/regeneration for the same person -> STILL ALLOWED!
    const paidSamePerson = await checkHotelFreePreviewQuota({
      isPaymentVerified: true,
      overrideIp: "203.0.113.88",
      overrideDeviceId: "dev_srinivas_other_phone",
      personSignature
    });
    expect(paidSamePerson.allowed).toBe(true);

    // UI menu bar & pre-download teaser check: ZERO ₹ prices shown in menu bar or pre-download CTAs
    const pageSrc = fs.readFileSync(
      path.resolve(process.cwd(), "src/pages/AntarangadaSatyaPage.tsx"),
      "utf-8"
    );
    expect(pageSrc).not.toContain("price: `₹${HOTEL_PALM_PRICE_INR}`");
    expect(pageSrc).not.toContain("price: `₹${HOTEL_FACE_PRICE_INR}`");
    expect(pageSrc).not.toContain("price: `₹${HOTEL_PRASHNA_PRICE_INR}`");
    expect(pageSrc).not.toContain("price: `₹${HOTEL_PDF_PRICE_INR}`");
    expect(pageSrc).toContain("Download Complete Separate PDF Report");
    expect(pageSrc).toContain("ఉచితం");
    expect(pageSrc).toContain("இலவசம்");
  });
});
