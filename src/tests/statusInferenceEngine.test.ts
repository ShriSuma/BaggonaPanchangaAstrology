import { describe, expect, it } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { inferLifeStatus } from "../core/StatusInferenceEngine";

describe("StatusInferenceEngine - Marital Status Prediction", () => {
  it("predicts Friend 1 (16 March 1993, 1:40 AM) is likely unmarried", () => {
    // 16 March 1993 at 1:40 AM, age is ~33, we expect them to be flagged as unmarried due to chart afflictions
    const context = {
      name: "Friend 1",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479, // Udupi default
      longitude: 74.3187,
      ayanamsaModel: "lahiri" as const
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const ageDecimal = 33; // 2026 - 1993
    
    const inference = inferLifeStatus(kundli, ageDecimal);
    
    // We expect the engine to catch the severe delays and flag them as likely unmarried
    expect(inference.isLikelyUnmarried).toBe(true);
  });

  it("predicts Friend 2 (4 November 1993, 9:15 AM) is likely unmarried", () => {
    // 4 Nov 1993 at 9:15 AM, age is ~32, we expect them to be flagged as unmarried
    const context = {
      name: "Friend 2",
      birthDate: "1993-11-04",
      birthTime: "09:15",
      latitude: 14.5479,
      longitude: 74.3187,
      ayanamsaModel: "lahiri" as const
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const ageDecimal = 32; // 2026 - 1993
    
    const inference = inferLifeStatus(kundli, ageDecimal);
    
    // We expect the engine to catch the severe delays and flag them as likely unmarried
    expect(inference.isLikelyUnmarried).toBe(true);
  });
});
