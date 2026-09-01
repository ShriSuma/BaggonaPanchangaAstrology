import { describe, it, expect } from "vitest";
import {
  generatePanchangaAngaSynthesis,
  generateCurrentLifeDiagnosis,
  generateInstantQAList
} from "../core/PanchangaAngaSynthesisEngine";
import { calculateKundli } from "../core/KundliEngine";
import { cleanAstrologyText } from "../pages/InstantReadingPage";

describe("Instant Reading Dynamic 5-Field Astrologer Verbal Prompts & Synthesis Suite", () => {
  const sampleBirth1 = {
    name: "Manoj Poornamatha",
    birthDate: "1993-03-16",
    birthTime: "01:40",
    latitude: 14.5479,
    longitude: 74.3187,
    pincode: "581326"
  };

  const sampleBirth2 = {
    name: "Pramod Kodagi",
    birthDate: "1990-05-15",
    birthTime: "08:30",
    latitude: 14.5479,
    longitude: 74.3187,
    pincode: "581326"
  };

  const kundli1 = calculateKundli(sampleBirth1);
  const kundli2 = calculateKundli(sampleBirth2);

  it("generates all 5 Master Astrologer Verbal Prompts with at least 2 dense paragraphs each", () => {
    const output = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn"
    });

    const points = output.currentDiagnosis.astrologerTalkingPoints;

    // Verify all 5 master fields exist
    expect(points.openingIceBreakerKn).toBeTruthy();
    expect(points.hiddenSubconsciousWorryKn).toBeTruthy();
    expect(points.karmaFinancialRealityKn).toBeTruthy();
    expect(points.immediateTurningPointKn).toBeTruthy();
    expect(points.siddhaPariharaRemedyKn).toBeTruthy();

    // Verify each field has at least 2 paragraphs (separated by \n\n)
    expect(points.openingIceBreakerKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.hiddenSubconsciousWorryKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.karmaFinancialRealityKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.immediateTurningPointKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.siddhaPariharaRemedyKn.split("\n\n").length).toBeGreaterThanOrEqual(2);

    // Verify depth (>200 chars per field)
    expect(points.openingIceBreakerKn.length).toBeGreaterThan(250);
    expect(points.hiddenSubconsciousWorryKn.length).toBeGreaterThan(250);
    expect(points.karmaFinancialRealityKn.length).toBeGreaterThan(250);
    expect(points.immediateTurningPointKn.length).toBeGreaterThan(250);
    expect(points.siddhaPariharaRemedyKn.length).toBeGreaterThan(250);
  });

  it("ensures 100% chart personalization and distinct readings between different birth charts", () => {
    const output1 = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn"
    });

    const output2 = generatePanchangaAngaSynthesis(kundli2, {
      birthDate: sampleBirth2.birthDate,
      birthTime: sampleBirth2.birthTime,
      latitude: sampleBirth2.latitude,
      longitude: sampleBirth2.longitude,
      lang: "kn"
    });

    const points1 = output1.currentDiagnosis.astrologerTalkingPoints;
    const points2 = output2.currentDiagnosis.astrologerTalkingPoints;

    // Must be distinct and contain respective Lagna / Moon / Nakshatra details
    expect(points1.openingIceBreakerKn).not.toBe(points2.openingIceBreakerKn);
    expect(points1.siddhaPariharaRemedyKn).not.toBe(points2.siddhaPariharaRemedyKn);

    expect(points1.openingIceBreakerKn).toContain(kundli1.lagnaRashi.sanskrit);
    expect(points2.openingIceBreakerKn).toContain(kundli2.lagnaRashi.sanskrit);
  });

  it("strictly enforces English digits across all 5 talking points and remedies", () => {
    const output = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn"
    });

    const points = output.currentDiagnosis.astrologerTalkingPoints;
    const allText = `${points.openingIceBreakerKn} ${points.hiddenSubconsciousWorryKn} ${points.karmaFinancialRealityKn} ${points.immediateTurningPointKn} ${points.siddhaPariharaRemedyKn}`;

    // Should NOT contain Kannada digits ೦-೯
    const knDigitsRegex = /[೦-೯]/;
    expect(knDigitsRegex.test(allText)).toBe(false);

    // Should contain English digits like 3, 5, 2:00 AM, 4:30 AM
    expect(allText).toMatch(/\d+/);
  });

  it("generates deep, multi-paragraph pandit scripts for subsequent category questions", () => {
    const output = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn"
    });

    const qaList = output.instantQAList;
    expect(qaList.length).toBeGreaterThanOrEqual(5);

    for (const q of qaList) {
      expect(q.panditScriptKn.length).toBeGreaterThan(300);
      expect(q.panditScriptKn.split("\n\n").length).toBeGreaterThanOrEqual(3);
      expect(q.astrologicalBasisKn).toBeTruthy();
      expect(q.immediateRemedyKn).toBeTruthy();
    }
  });

  it("cleanAstrologyText sanitizer strips markdown bold asterisks and normalizes text", () => {
    const dirty = "**ನೋಡಿ**, ನಿಮ್ಮ *ಜಾತಕದಲ್ಲಿ* ೩ನೇ ಮನೆ ಹಾಗೂ # ೧೦ನೇ ಮನೆ!";
    const cleaned = cleanAstrologyText(dirty);
    expect(cleaned).not.toContain("**");
    expect(cleaned).not.toContain("*");
    expect(cleaned).not.toContain("#");
    expect(cleaned).toContain("3ನೇ");
    expect(cleaned).toContain("10ನೇ");
  });
});
