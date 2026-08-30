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
});
