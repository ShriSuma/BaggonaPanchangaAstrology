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
  HOTEL_EXPRESS_PRICE_INR,
  HOTEL_PDF_PRICE_INR,
  HOTEL_PREMIUM_REMEDY_PRICE_INR,
  verifyHotelPaymentInstant
} from "../features/hotelSecret/antarangaService";
import { prepareSampoornaMaster25Data } from "../services/sampoornaMaster25Service";
import { SampoornaMaster25PdfTemplate } from "../components/sampoornaMaster25/SampoornaMaster25PdfTemplate";
import { HotelExpressWalkInPdfTemplate } from "../components/hotelSecret/HotelExpressWalkInPdfTemplate";
import type { SevenLang } from "../services/sampoornaMaster25Locale7L";

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
      const payRes = await verifyHotelPaymentInstant("ORD_EXP_1", "Raghavendra", 149, lang, "express_149");
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
});
