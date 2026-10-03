import { describe, it, expect } from "vitest";
import {
  buildDeterministicFirstSixPoints,
  parseOrEnhanceTalkingPoints,
  classifyAstrologyTextTone,
  AstrologerPointItem
} from "./instantReadingTalkingPointsEngine";
import { calculateKundli } from "./KundliEngine";
import { generatePanchangaAngaSynthesis } from "./PanchangaAngaSynthesisEngine";

describe("Instant Reading Structured Talking Points Engine", () => {
  const sampleBirth = {
    name: "Manoj Poornamatha",
    birthDate: "1993-03-16",
    birthTime: "01:40",
    latitude: 14.5479,
    longitude: 74.3187,
    pincode: "581326"
  };

  const kundli = calculateKundli(sampleBirth);
  const synthesis = generatePanchangaAngaSynthesis(kundli, {
    birthDate: sampleBirth.birthDate,
    birthTime: sampleBirth.birthTime,
    latitude: sampleBirth.latitude,
    longitude: sampleBirth.longitude,
    lang: "kn",
    devoteeName: "Manoj Poornamatha"
  });
  const mockSession = { input: sampleBirth, result: kundli };

  it("generates deterministic talking points with at least 10 items for every one of the first 6 sections", () => {
    const points = buildDeterministicFirstSixPoints(synthesis, mockSession, true);

    expect(points.openingIceBreaker.length).toBeGreaterThanOrEqual(10);
    expect(points.hiddenSubconsciousWorry.length).toBeGreaterThanOrEqual(10);
    expect(points.maandiKarmicImpact.length).toBeGreaterThanOrEqual(10);
    expect(points.bodyMarkAndTemperament.length).toBeGreaterThanOrEqual(10);
    expect(points.karmaFinancialReality.length).toBeGreaterThanOrEqual(10);
    expect(points.immediateTurningPoint.length).toBeGreaterThanOrEqual(10);
  });

  it("contains good, bad, and notice color highlights across generated items", () => {
    const points = buildDeterministicFirstSixPoints(synthesis, mockSession, true);
    const allItems: AstrologerPointItem[] = [
      ...points.openingIceBreaker,
      ...points.hiddenSubconsciousWorry,
      ...points.maandiKarmicImpact,
      ...points.bodyMarkAndTemperament,
      ...points.karmaFinancialReality,
      ...points.immediateTurningPoint,
    ];

    const hasGood = allItems.some(i => i.tone === "good");
    const hasBad = allItems.some(i => i.tone === "bad");
    const hasNotice = allItems.some(i => i.tone === "notice");

    expect(hasGood).toBe(true);
    expect(hasBad).toBe(true);
    expect(hasNotice).toBe(true);
  });

  it("classifyAstrologyTextTone accurately identifies auspicious, challenge, and turning point words", () => {
    expect(classifyAstrologyTextTone("ರಾಜಯೋಗ ಶುಭ ಧನ ಲಾಭ ಉನ್ನತಿ")).toBe("good");
    expect(classifyAstrologyTextTone("ದೋಷ ಕಂಟಕ ನಷ್ಟ ಆತಂಕ ಸಂಕಟ")).toBe("bad");
    expect(classifyAstrologyTextTone("ತಿರುವು ಸಂಧಿಕಾಲ ಜಾಗರೂಕತೆ ಎಚ್ಚರಿಕೆ")).toBe("notice");
    expect(classifyAstrologyTextTone("ಸಾಮಾನ್ಯ ದಿನಚರಿ ಮತ್ತು ಗ್ರಹ ಸ್ಥಿತಿ")).toBe("normal");
  });

  it("parseOrEnhanceTalkingPoints guarantees >= 10 points even when input has fewer items", () => {
    const deterministic = buildDeterministicFirstSixPoints(synthesis, mockSession, true);
    const parsed = parseOrEnhanceTalkingPoints(
      {
        openingIceBreaker: [
          { pointNumber: 1, text: "ಶುಭ ಆರಂಭದ ಸೂಚನೆ", tone: "good" },
          { pointNumber: 2, text: "ಸ್ವಲ್ಪ ಜಾಗರೂಕರಾಗಿರಿ", tone: "notice" },
        ]
      },
      deterministic,
      true
    );

    expect(parsed.openingIceBreaker.length).toBeGreaterThanOrEqual(10);
    expect(parsed.openingIceBreaker[0].text).toBe("ಶುಭ ಆರಂಭದ ಸೂಚನೆ");
    expect(parsed.openingIceBreaker[0].tone).toBe("good");
    expect(parsed.openingIceBreaker[1].text).toBe("ಸ್ವಲ್ಪ ಜಾಗರೂಕರಾಗಿರಿ");
    expect(parsed.openingIceBreaker[1].tone).toBe("notice");
  });

  it("strictly enforces ZERO technical astrological jargon in Card 1 (Ice-Breaker & Core Temperament)", () => {
    const pointsKn = buildDeterministicFirstSixPoints(synthesis, mockSession, true);
    const techKnWords = ["ಲಗ್ನ", "ರಾಶಿ", "ನಕ್ಷತ್ರ", "ಗ್ರಹ", "ಭಾವ", "ಅಧಿಪತಿ", "ದಶಾ", "ಕುಂಡಲಿ", "ಪಾದ"];

    expect(pointsKn.openingIceBreaker.length).toBe(12);
    for (const point of pointsKn.openingIceBreaker) {
      for (const techWord of techKnWords) {
        expect(point.text).not.toContain(techWord);
      }
    }

    const pointsEn = buildDeterministicFirstSixPoints(synthesis, mockSession, false);
    const techEnRegex = /\b(lagna|ascendant|rashi|sign|nakshatra|graha|planet|house|bhava|lord|pada|dasha)\b/i;

    expect(pointsEn.openingIceBreaker.length).toBe(12);
    for (const point of pointsEn.openingIceBreaker) {
      expect(point.text).not.toMatch(techEnRegex);
    }
  });

  it("dynamically differentiates Card 1 traits across different Ascendants with psychological precision", () => {
    const ariesPoints = buildDeterministicFirstSixPoints(synthesis, {
      ...mockSession,
      result: { ...kundli, lagnaRashi: { english: "Aries" } }
    }, true);

    const scorpioPoints = buildDeterministicFirstSixPoints(synthesis, {
      ...mockSession,
      result: { ...kundli, lagnaRashi: { english: "Scorpio" } }
    }, true);

    const taurusPoints = buildDeterministicFirstSixPoints(synthesis, {
      ...mockSession,
      result: { ...kundli, lagnaRashi: { english: "Taurus" } }
    }, true);

    // Core traits must be completely distinct
    expect(ariesPoints.openingIceBreaker[0].text).not.toBe(scorpioPoints.openingIceBreaker[0].text);
    expect(scorpioPoints.openingIceBreaker[0].text).not.toBe(taurusPoints.openingIceBreaker[0].text);

    // Aries highlights pioneering leadership & fire
    expect(ariesPoints.openingIceBreaker[0].text).toContain("ನಾಯಕತ್ವ");
    // Taurus highlights rock-solid patience & immovable determination
    expect(taurusPoints.openingIceBreaker[0].text).toContain("ಹಿಮಾಲಯದಂತಹ ಅಚಲ ದೃಢತೆ");
    // Scorpio highlights piercing secrets & deep insight
    expect(scorpioPoints.openingIceBreaker[0].text).toContain("ಅಂತರಂಗದ ಗುಟ್ಟನ್ನು");
  });

  it("parseOrEnhanceTalkingPoints strictly filters out technical jargon from AI points for Card 1", () => {
    const deterministic = buildDeterministicFirstSixPoints(synthesis, mockSession, true);
    const parsed = parseOrEnhanceTalkingPoints(
      {
        openingIceBreaker: [
          { pointNumber: 1, text: "ಜಾತಕರ ಜನ್ಮ ಲಗ್ನವು ಮೇಷ ಆಗಿದೆ ಮತ್ತು ರಾಶಿಯು ವೃಷಭ.", tone: "normal" }, // contains jargon!
          { pointNumber: 2, text: "ಅತ್ಯಂತ ಸ್ವಾಭಿಮಾನಿ ಹಾಗೂ ಕಷ್ಟದಲ್ಲಿ ಯಾರ ಮುಂದೆಯೂ ಕೈಚಾಚದ ವ್ಯಕ್ತಿತ್ವ.", tone: "good" }, // pure human trait!
        ]
      },
      deterministic,
      true
    );

    // Point 1 (which had jargon) must be excluded, clean point 2 accepted, and padded to >= 10 from deterministic
    expect(parsed.openingIceBreaker.length).toBeGreaterThanOrEqual(10);
    expect(parsed.openingIceBreaker.some(p => p.text.includes("ಲಗ್ನವು"))).toBe(false);
    expect(parsed.openingIceBreaker[0].text).toBe("ಅತ್ಯಂತ ಸ್ವಾಭಿಮಾನಿ ಹಾಗೂ ಕಷ್ಟದಲ್ಲಿ ಯಾರ ಮುಂದೆಯೂ ಕೈಚಾಚದ ವ್ಯಕ್ತಿತ್ವ.");
  });
});

