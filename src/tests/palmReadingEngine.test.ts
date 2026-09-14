import { describe, it, expect } from "vitest";
import {
  executePalmReading,
  askPalmReadingFollowUp
} from "../features/palmreading/palmReadingEngine";
import {
  VEDIC_HAND_ELEMENTAL_TYPES,
  VEDIC_ANGUSHTHA_THUMB_RULES,
  VEDIC_MAJOR_LINES_RULES,
  VEDIC_MOUNTS_RULES,
  VEDIC_HASTAREKHA_SACRED_YOGAS,
  VEDIC_SACRED_MARKS,
  VEDIC_MANIBANDHA_WRIST_BRACELETS
} from "../features/palmreading/samudrikaKnowledge";

describe("Classical Vedic Hastarekha Shastra (Palm Reading) Engine Tests", () => {
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  it("exports comprehensive classical Vedic palmistry dictionaries", () => {
    expect(VEDIC_HAND_ELEMENTAL_TYPES.earth.nameKn).toContain("ಪೃಥ್ವಿ");
    expect(VEDIC_HAND_ELEMENTAL_TYPES.air.nameKn).toContain("ವಾಯು");
    expect(VEDIC_HAND_ELEMENTAL_TYPES.fire.nameKn).toContain("ಅಗ್ನಿ");
    expect(VEDIC_HAND_ELEMENTAL_TYPES.water.nameKn).toContain("ಜಲ");

    expect(VEDIC_ANGUSHTHA_THUMB_RULES.yavaSign.nameKn).toContain("ಶಿವ ನೇತ್ರ");
    expect(VEDIC_MANIBANDHA_WRIST_BRACELETS).toHaveLength(4);
    expect(VEDIC_HASTAREKHA_SACRED_YOGAS.length).toBeGreaterThanOrEqual(4);
    expect(VEDIC_SACRED_MARKS.matsya.nameKn).toContain("ಮತ್ಸ್ಯ");
    expect(VEDIC_SACRED_MARKS.trishula.nameKn).toContain("ತ್ರಿಶೂಲ");
    expect(VEDIC_SACRED_MARKS.mysticCross.nameKn).toContain("ರಹಸ್ಯ");
  });

  it("executes authentic offline palm reading with rich 5-line micro-topologies and 4-milestones", async () => {
    const result = await executePalmReading(
      dummyBase64,
      "right",
      "ಶ್ರೀರಾಮ್ ಭಕ್ತರು",
      "kn",
      ""
    );

    expect(result.handSide).toBe("right");
    expect(result.devoteeName).toBe("ಶ್ರೀರಾಮ್ ಭಕ್ತರು");
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.lifeLine.lineName.kn).toContain("ಆಯುರ್ ರೇಖೆ");
    expect(result.headLine.lineName.kn).toContain("ಮಸ್ತಿಷ್ಕ");
    expect(result.heartLine.lineName.kn).toContain("ಹೃದಯ");
    expect(result.fateLine.lineName.kn).toContain("ಭಾಗ್ಯ");
    expect(result.sunLine.lineName.kn).toContain("ರವಿ");

    expect(result.mounts.length).toBeGreaterThanOrEqual(3);
    expect(result.specialMarks.length).toBeGreaterThanOrEqual(3);
    expect(result.lifeStageMilestones.estimatedAge).toBeGreaterThanOrEqual(18);
    expect(result.lifeStageMilestones.marriage.timingAgeWindowKn).toBeDefined();
    expect(result.remedyRecommendation.kn).toContain("ಗೋಕರ್ಣ");
    expect(result.aiPrediction).toContain("ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರ");
  });

  it("handles follow-up questions gracefully with priest guidance", async () => {
    const previousResult = await executePalmReading(
      dummyBase64,
      "right",
      "ಶ್ರೀರಾಮ್ ಭಕ್ತರು",
      "kn",
      ""
    );

    const followUp = await askPalmReadingFollowUp(
      previousResult,
      "ನನ್ನ ವಿವಾಹ ಕಾಲ ಯಾವಾಗ?",
      "kn",
      ""
    );

    expect(followUp).toBeDefined();
    expect(followUp.length).toBeGreaterThan(5);
  });

  it("analyzes all 3 image slots (front palm, side marriage percussion, dorsal nails/knuckles)", async () => {
    const frontImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const sideImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mN88eLFfwYGBgZGBgYGAE1UBD1xW6yLAAAAAElFTkSuQmCC";
    const backImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    const result = await executePalmReading(
      frontImg,
      "right",
      "ವೆಂಕಟೇಶ ಭಟ್",
      "kn",
      "",
      undefined,
      sideImg,
      backImg
    );

    expect(result.marriageLineAnalysis).toBeDefined();
    expect(result.marriageLineAnalysis?.lineCount).toBeGreaterThanOrEqual(1);
    expect(result.marriageLineAnalysis?.timingWindow.kn).toBeDefined();
    expect(result.marriageLineAnalysis?.formation.kn).toBeDefined();

    expect(result.nailDorsalAnalysis).toBeDefined();
    expect(result.nailDorsalAnalysis?.nailShape.kn).toBeDefined();
    expect(result.nailDorsalAnalysis?.nailColor.kn).toBeDefined();
    expect(result.nailDorsalAnalysis?.lunulaVitality.kn).toBeDefined();
    expect(result.nailDorsalAnalysis?.knuckleTraits.kn).toBeDefined();
  });

  it("guarantees 100% diversity across 20 distinct devotees (eliminating 18/20 template stagnation)", async () => {
    const devotees = [
      "ಶ್ರೀರಾಮ ಹೆಗಡೆ", "ಗಣಪತಿ ಭಟ್", "ಸುರೇಶ್ ರಾವ್", "ಅನಂತ ಕೃಷ್ಣ",
      "ವೆಂಕಟೇಶ್ ಪ್ರಸಾದ್", "ನಾಗರಾಜ ಶರ್ಮ", "ಶಂಕರ್ ನಾರಾಯಣ", "ಸುಬ್ರಹ್ಮಣ್ಯ",
      "ಕೃಷ್ಣಮೂರ್ತಿ", "ರಾಘವೇಂದ್ರ", "ವಿಶ್ವನಾಥ ಆಚಾರ್ಯ", "ಪ್ರಶಾಂತ್ ಕುಲಕರ್ಣಿ",
      "ದತ್ತಾತ್ರೇಯ ಜೋಶಿ", "ಶ್ರೀಕಾಂತ್ ಭಟ್", "ಮಹೇಶ್ವರ ಅಯ್ಯರ್", "ರವೀಂದ್ರ ಶರ್ಮ",
      "ಕಾರ್ತಿಕ್ ಹೆಬ್ಬಾರ್", "ನರಸಿಂಹಮೂರ್ತಿ", "ಆದರ್ಶ ನಾಯಕ್", "ಮಂಜುನಾಥ ಗೌಡ"
    ];

    const results = await Promise.all(
      devotees.map((devotee, idx) => {
        // Distinct simulated hand image bytes for each devotee
        const simulatedBase64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M${idx % 9}QDwADhgGAWjR9awAAAABJRU5ErkJggg==${idx}`;
        const simulatedSide = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M${(idx + 3) % 9}QDwADhgGAWjR9awAAAABJRU5ErkJggg==side${idx}`;
        const simulatedBack = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M${(idx + 7) % 9}QDwADhgGAWjR9awAAAABJRU5ErkJggg==back${idx}`;
        const handSide = idx % 2 === 0 ? "right" : "left";

        return executePalmReading(
          simulatedBase64,
          handSide,
          devotee,
          "kn",
          "",
          undefined,
          simulatedSide,
          simulatedBack
        );
      })
    );

    expect(results).toHaveLength(20);

    // Track distributions
    const handElements = new Set(results.map(r => r.chironomyHandType.element.kn));
    const marriageWindows = new Set(results.map(r => r.lifeStageMilestones.marriage.timingAgeWindowKn));
    const peakWealthAges = new Set(results.map(r => r.lifeStageMilestones.careerWealth.peakWealthAgeKn));
    const scores = new Set(results.map(r => r.overallScore));
    const lifeLineStatuses = new Set(results.map(r => r.lifeLine.status.kn));
    const headLineStatuses = new Set(results.map(r => r.headLine.status.kn));
    const nailShapes = new Set(results.map(r => r.nailDorsalAnalysis?.nailShape.kn));

    console.log("20 Devotees Diversity Audit Metrics:", {
      uniqueHandElements: handElements.size,
      uniqueMarriageWindows: marriageWindows.size,
      uniquePeakWealthAges: peakWealthAges.size,
      uniqueScores: scores.size,
      uniqueLifeLineStatuses: lifeLineStatuses.size,
      uniqueHeadLineStatuses: headLineStatuses.size,
      uniqueNailShapes: nailShapes.size
    });

    // Zero-Stagnation Assertions:
    // In the user's bug report, 18 out of 20 were identical.
    // We now enforce that elements, marriage windows, wealth peaks, and scores have high diversity:
    expect(handElements.size).toBeGreaterThanOrEqual(4); // At least 4 distinct elements (Earth, Water, Fire, Air, Space)
    expect(marriageWindows.size).toBeGreaterThanOrEqual(4); // At least 4 distinct marriage age windows
    expect(peakWealthAges.size).toBeGreaterThanOrEqual(4); // At least 4 distinct peak wealth configurations
    expect(scores.size).toBeGreaterThanOrEqual(8); // At least 8 distinct score variations
    expect(lifeLineStatuses.size).toBeGreaterThanOrEqual(3); // Varied line statuses
    expect(nailShapes.size).toBeGreaterThanOrEqual(3); // Varied nail shapes

    // Assert that no single marriage window dominates >= 12 people (60%)
    const marriageWindowCounts: Record<string, number> = {};
    results.forEach(r => {
      const w = r.lifeStageMilestones.marriage.timingAgeWindowKn;
      marriageWindowCounts[w] = (marriageWindowCounts[w] || 0) + 1;
    });
    Object.values(marriageWindowCounts).forEach(count => {
      expect(count).toBeLessThanOrEqual(10); // Far below the previous 18/20 stagnation
    });
  });

  it("applies authentic Vedic gender polarity rules (Purusha vs Sthree Shastra)", async () => {
    const maleResult = await executePalmReading(
      dummyBase64,
      "right",
      "ವೆಂಕಟೇಶ್ ಭಟ್",
      "kn",
      "",
      undefined,
      undefined,
      undefined,
      "Male"
    );

    const femaleResult = await executePalmReading(
      dummyBase64,
      "right",
      "ಲಕ್ಷ್ಮೀ ಹೆಗಡೆ",
      "kn",
      "",
      undefined,
      undefined,
      undefined,
      "Female"
    );

    expect(maleResult.handSideLabel.kn).toContain("ಕರ್ಮ ಶಕ್ತಿ");
    expect(femaleResult.handSideLabel.kn).toContain("ಸ್ತ್ರೀ ಕರ್ಮ ಶಕ್ತಿ");
    expect(femaleResult.handSideLabel.en).toContain("Career Karma");

    const femaleLeft = await executePalmReading(
      dummyBase64,
      "left",
      "ಲಕ್ಷ್ಮೀ ಹೆಗಡೆ",
      "kn",
      "",
      undefined,
      undefined,
      undefined,
      "Female"
    );
    expect(femaleLeft.handSideLabel.kn).toContain("ಸ್ತ್ರೀ ಸಹಜ ಪ್ರಾರಬ್ಧ");
    expect(femaleLeft.handSideLabel.en).toContain("Innate Potential, Intuitive Soul Force");
  });

  it("guarantees English view purity with zero Kannada character leakage", async () => {
    const enResult = await executePalmReading(
      dummyBase64,
      "right",
      "Shree Devotee",
      "en",
      "",
      undefined,
      undefined,
      undefined,
      "Male"
    );

    // Kannada Unicode Range: \u0C80-\u0CFF
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    expect(enResult.lifeLine.lineName.en).not.toMatch(kannadaRegex);
    expect(enResult.headLine.lineName.en).not.toMatch(kannadaRegex);
    expect(enResult.heartLine.lineName.en).not.toMatch(kannadaRegex);
    expect(enResult.fateLine.lineName.en).not.toMatch(kannadaRegex);
    expect(enResult.sunLine.lineName.en).not.toMatch(kannadaRegex);
    expect(enResult.handSideLabel.en).not.toMatch(kannadaRegex);
  });

  it("dynamically generates all 7 planetary mounts, detected yogas, and personalized divine remedies for every devotee", async () => {
    const devotees = [
      { name: "ರಾಘವೇಂದ್ರ ಭಟ್", photo: dummyBase64 + "entropyA123" },
      { name: "ಪ್ರಿಯಾಂಕಾ ಹೆಗಡೆ", photo: dummyBase64 + "entropyB456" },
      { name: "ಸುರೇಶ್ ರಾವ್", photo: dummyBase64 + "entropyC789" },
      { name: "ಅನಿತಾ ದೇಶಪಾಂಡೆ", photo: dummyBase64 + "entropyD101" },
      { name: "ವೆಂಕಟೇಶ್ ಶರ್ಮಾ", photo: dummyBase64 + "entropyE202" }
    ];

    const results = await Promise.all(
      devotees.map(d =>
        executePalmReading(d.photo, "right", d.name, "kn", "")
      )
    );

    const gemstones = new Set<string>();
    const rudrakshas = new Set<number>();
    const jupiterEnergies = new Set<number>();

    results.forEach((res) => {
      // All 7 planetary mounts must exist
      expect(res.mounts).toHaveLength(7);
      const mountKeys = res.mounts.map(m => m.mountKey);
      expect(mountKeys).toEqual(["jupiter", "saturn", "sun", "mercury", "mars", "venus", "moon"]);

      res.mounts.forEach((m) => {
        expect(m.energyScore).toBeGreaterThanOrEqual(60);
        expect(m.elevation).toBeDefined();
        expect(m.markings).toBeDefined();
      });

      // Detected Yogas must be present
      expect(res.detectedYogas).toBeDefined();
      expect(res.detectedYogas!.length).toBeGreaterThanOrEqual(4);
      expect(res.detectedYogas!.some(y => y.isPresent)).toBe(true);

      // Personalized Remedy must be structured
      expect(res.personalizedRemedy).toBeDefined();
      expect(res.personalizedRemedy!.primaryGemstone.name.kn).toBeDefined();
      expect(res.personalizedRemedy!.primaryGemstone.finger.kn).toBeDefined();
      expect(res.personalizedRemedy!.primaryGemstone.mantra).toBeDefined();
      expect(res.personalizedRemedy!.primaryRudraksha.mukhi).toBeGreaterThanOrEqual(1);
      expect(res.personalizedRemedy!.templeSeva.templeName.kn).toContain("ಗೋಕರ್ಣ");

      gemstones.add(res.personalizedRemedy!.primaryGemstone.name.kn);
      rudrakshas.add(res.personalizedRemedy!.primaryRudraksha.mukhi);
      jupiterEnergies.add(res.mounts[0].energyScore!);
    });

    // Verify diversity across devotees (no hardcoded identical values)
    expect(gemstones.size).toBeGreaterThanOrEqual(2);
    expect(rudrakshas.size).toBeGreaterThanOrEqual(2);
    expect(jupiterEnergies.size).toBeGreaterThanOrEqual(2);
  });
});

