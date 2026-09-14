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
    expect(Array.isArray(result.moles)).toBe(true);
    expect(result.moles.length).toBeGreaterThanOrEqual(0);
    expect(result.remedyRecommendation.kn).toContain("ಗೋಕರ್ಣ");

    // Test distinct profile for a second devotee / image to ensure no hardcoded identical data
    const dummyImage2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADklEQVR42mNk+M9QzwAEhAGAhY1jYwAAAABJRU5ErkJggg==";
    const result2 = await executeFaceReading(
      dummyImage2,
      "ಗಣೇಶ ಶರ್ಮಾ",
      "kn",
      ""
    );
    expect(result2).toBeDefined();
    expect(result2.devoteeName).toBe("ಗಣೇಶ ಶರ್ಮಾ");
    // Ensure not completely static across users
    expect(result2.estimatedAge !== result.estimatedAge || result2.overallTejasScore !== result.overallTejasScore || result2.facialConstitution.primaryElement.en !== result.facialConstitution.primaryElement.en).toBe(true);
  }, 30000);

  it("validates empty or corrupt face image appropriately", async () => {
    const emptyValidation = await validateFaceImage("", "", "kn");
    expect(emptyValidation.isValid).toBe(false);
    expect(emptyValidation.messageKn).toContain("ಚಿತ್ರದ ಗಾತ್ರ ತೀರಾ ಚಿಕ್ಕದಾಗಿದೆ");
  });
});
