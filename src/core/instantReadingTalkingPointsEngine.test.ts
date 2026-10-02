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
});
