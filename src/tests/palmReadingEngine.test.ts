import { describe, it, expect } from "vitest";
import { executePalmReading } from "../features/palmreading/palmReadingEngine";

describe("Hastarekha Shastra (Palmistry) Engine", () => {
  it("executes palm reading with structured output", async () => {
    const mockImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const result = await executePalmReading(
      mockImage,
      "right",
      "Test Devotee",
      "kn",
      ""
    );

    expect(result).toBeDefined();
    expect(result.handSide).toBe("right");
    expect(result.lifeLine).toBeDefined();
    expect(result.headLine).toBeDefined();
    expect(result.heartLine).toBeDefined();
    expect(result.fateLine).toBeDefined();
    expect(result.sunLine).toBeDefined();
    expect(result.overallScore).toBe(88);
  }, 15000);
});
