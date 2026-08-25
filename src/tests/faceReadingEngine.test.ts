import { describe, it, expect } from "vitest";
import { executeFaceReading } from "../features/facereading/faceReadingEngine";
import { validateFaceImage } from "../features/facereading/faceValidator";

describe("Classical Vedic Muka Samudrika Shastra Engine", () => {
  it("executes fallback offline face reading with 7 features and 100-year age map", async () => {
    const dummyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await executeFaceReading(
      dummyImage,
      "ಶಿವಾನಂದ ಭಕ್ತರು",
      "kn",
      ""
    );

    expect(result).toBeDefined();
    expect(result.devoteeName).toBe("ಶಿವಾನಂದ ಭಕ್ತರು");
    expect(result.overallTejasScore).toBeGreaterThanOrEqual(50);
    expect(result.features.length).toBe(7);
    expect(result.ageMilestones.length).toBe(4);
    expect(result.moles.length).toBeGreaterThanOrEqual(1);
    expect(result.remedyRecommendation.kn).toContain("ಗೋಕರ್ಣ");
  }, 30000);

  it("validates empty or corrupt face image appropriately", async () => {
    const emptyValidation = await validateFaceImage("", "", "kn");
    expect(emptyValidation.isValid).toBe(false);
    expect(emptyValidation.messageKn).toContain("ಚಿತ್ರದ ಗಾತ್ರ ತೀರಾ ಚಿಕ್ಕದಾಗಿದೆ");
  });
});
