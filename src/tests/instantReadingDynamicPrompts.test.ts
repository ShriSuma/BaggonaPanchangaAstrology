import { describe, it, expect } from "vitest";
import {
  generatePanchangaAngaSynthesis,
  generateCurrentLifeDiagnosis,
  generateInstantQAList
} from "../core/PanchangaAngaSynthesisEngine";
import { calculateKundli } from "../core/KundliEngine";
import { cleanAstrologyText } from "../pages/InstantReadingPage";
import { toKannadaPlanet, toKannadaRashi, toKannadaNakshatra } from "../utils/kannadaAstrologyTerms";

describe("Instant Reading Dynamic 6-Field Astrologer Verbal Prompts & Synthesis Suite", () => {
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

  it("generates all 6 Master Astrologer Verbal Prompts with Maandi in 3rd place (2 dense paragraphs each)", () => {
    const output = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn",
      devoteeName: "Manoj Poornamatha"
    });

    const points = output.currentDiagnosis.astrologerTalkingPoints;

    // Verify all 6 master fields exist
    expect(points.openingIceBreakerKn).toBeTruthy();
    expect(points.hiddenSubconsciousWorryKn).toBeTruthy();
    expect(points.maandiKarmicImpactKn).toBeTruthy(); // 3RD PLACE: MAANDI
    expect(points.karmaFinancialRealityKn).toBeTruthy();
    expect(points.immediateTurningPointKn).toBeTruthy();
    expect(points.siddhaPariharaRemedyKn).toBeTruthy();

    // Verify each field has at least 2 paragraphs (separated by \n\n)
    expect(points.openingIceBreakerKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.hiddenSubconsciousWorryKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.maandiKarmicImpactKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.karmaFinancialRealityKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.immediateTurningPointKn.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(points.siddhaPariharaRemedyKn.split("\n\n").length).toBeGreaterThanOrEqual(2);

    // Verify Maandi specific content
    expect(points.maandiKarmicImpactKn).toContain("ಮಾಂದಿ");
    expect(points.maandiKarmicImpactKn).toContain("ಗೋಕರ್ಣ");

    // Verify depth (>200 chars per field)
    expect(points.openingIceBreakerKn.length).toBeGreaterThan(250);
    expect(points.hiddenSubconsciousWorryKn.length).toBeGreaterThan(250);
    expect(points.maandiKarmicImpactKn.length).toBeGreaterThan(250);
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
      lang: "kn",
      devoteeName: "Manoj"
    });

    const output2 = generatePanchangaAngaSynthesis(kundli2, {
      birthDate: sampleBirth2.birthDate,
      birthTime: sampleBirth2.birthTime,
      latitude: sampleBirth2.latitude,
      longitude: sampleBirth2.longitude,
      lang: "kn",
      devoteeName: "Pramod"
    });

    const points1 = output1.currentDiagnosis.astrologerTalkingPoints;
    const points2 = output2.currentDiagnosis.astrologerTalkingPoints;

    // Must be distinct and contain respective Lagna / Moon / Nakshatra details
    expect(points1.openingIceBreakerKn).not.toBe(points2.openingIceBreakerKn);
    expect(points1.maandiKarmicImpactKn).not.toBe(points2.maandiKarmicImpactKn);
    expect(points1.siddhaPariharaRemedyKn).not.toBe(points2.siddhaPariharaRemedyKn);

    expect(points1.openingIceBreakerKn).toContain(kundli1.lagnaRashi.sanskrit);
    expect(points2.openingIceBreakerKn).toContain(kundli2.lagnaRashi.sanskrit);
  });

  it("strictly enforces English digits across all 6 talking points and remedies", () => {
    const output = generatePanchangaAngaSynthesis(kundli1, {
      birthDate: sampleBirth1.birthDate,
      birthTime: sampleBirth1.birthTime,
      latitude: sampleBirth1.latitude,
      longitude: sampleBirth1.longitude,
      lang: "kn"
    });

    const points = output.currentDiagnosis.astrologerTalkingPoints;
    const allText = `${points.openingIceBreakerKn} ${points.hiddenSubconsciousWorryKn} ${points.maandiKarmicImpactKn} ${points.karmaFinancialRealityKn} ${points.immediateTurningPointKn} ${points.siddhaPariharaRemedyKn}`;

    // Should NOT contain Kannada digits ೦-೯
    const knDigitsRegex = /[೦-೯]/;
    expect(knDigitsRegex.test(allText)).toBe(false);

    // Should contain English digits like 3, 5, 2:00, 4:30
    expect(allText).toMatch(/\d+/);
  });

  it("generates COMPLETE 4 DENSE PARAGRAPHS for each sub-level question in 100% pure Kannada", () => {
    const devoteeName = "Pramod";
    const output = generatePanchangaAngaSynthesis(kundli2, {
      birthDate: sampleBirth2.birthDate,
      birthTime: sampleBirth2.birthTime,
      latitude: sampleBirth2.latitude,
      longitude: sampleBirth2.longitude,
      lang: "kn",
      devoteeName
    });

    const qaList = output.instantQAList;
    expect(qaList.length).toBeGreaterThanOrEqual(8);

    for (const q of qaList) {
      // Must have exactly 4 dense paragraphs
      const paragraphs = q.panditScriptKn.split("\n\n");
      expect(paragraphs.length).toBe(4);

      // Total script length must be substantial (>600 characters for 4 dense paragraphs)
      expect(q.panditScriptKn.length).toBeGreaterThan(600);

      // Must NOT contain raw English planet names
      expect(q.panditScriptKn).not.toMatch(/\bMars\b/i);
      expect(q.panditScriptKn).not.toMatch(/\bSun\b/i);
      expect(q.panditScriptKn).not.toMatch(/\bLeo\b/i);
      expect(q.panditScriptKn).not.toMatch(/\bCancer\b/i);

      // Must use pure traditional Kannada terminology (Kuja, Ravi)
      expect(q.panditScriptKn).not.toContain("ಮಂಗಳ");
      expect(q.panditScriptKn).not.toContain("ಸೂರ್ಯ");

      expect(q.astrologicalBasisKn).toBeTruthy();
      expect(q.immediateRemedyKn).toBeTruthy();

      // Verifies conversational spoken greeting with devotee's name
      expect(q.panditScriptKn).toContain(`ನಮಸ್ಕಾರ ${devoteeName}`);
    }

    // Question 7 specifically verifies the insomnia & spoken slang audio pattern
    const qMind = qaList.find((q) => q.id === "q_mind_1");
    expect(qMind).toBeDefined();
    expect(qMind?.panditScriptKn).toContain("ನಾನ್ ನಿಮ್ಮ ಜಾತಕ ನೋಡಿದೆ");
    expect(qMind?.panditScriptKn).toContain("ನಿದ್ರಾಹೀನತೆಯಾಗಿ");
    expect(qMind?.panditScriptKn).toContain("2:00");
    expect(qMind?.panditScriptKn).toContain("4:30");
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

  it("kannadaAstrologyTerms correctly maps Mars to Kuja and Sun to Ravi", () => {
    expect(toKannadaPlanet("Mars")).toBe("ಕುಜ");
    expect(toKannadaPlanet("Sun")).toBe("ರವಿ");
    expect(toKannadaPlanet("Mangala")).toBe("ಕುಜ");
    expect(toKannadaPlanet("Surya")).toBe("ರವಿ");
    expect(toKannadaRashi("Leo")).toBe("ಸಿಂಹ");
    expect(toKannadaRashi("Cancer")).toBe("ಕರ್ಕಾಟಕ");
    expect(toKannadaNakshatra("Pushya")).toBe("ಪುಷ್ಯ");
  });
});
