import { describe, expect, it } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generateMasterPrediction, type MasterEngineContext } from "../core/MasterPredictionEngine";

describe("MasterPredictionEngine - Premium Layered MVP", () => {
  it("computes master prediction and extracts Layer 1 & 2 details", async () => {
    const context: MasterEngineContext = {
      name: "Pramod",
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3187,
      ayanamsaModel: "lahiri",
      lang: "en",
      isMarried: false,
      hasJob: true,
      gender: "Male"
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const prediction = await generateMasterPrediction(kundli, context);

    // Layer 1: Natal 
    expect(prediction.natalLayer.shadowSelf.title).toBeDefined();
    expect(prediction.natalLayer.karmicBaggage.soulPurpose).toBeDefined();

    // Layer 2: Timing
    expect(prediction.timingLayer.lifeClock.currentPhase).toBeDefined();
    expect(prediction.timingLayer.twelveMonthRoadmap.length).toBe(12);

    // Layer 3: Priority Scoring (Pramod is ~33 and unmarried, has a job)
    // Priority should be Marriage
    expect(prediction.masterSynthesis.priorityTopic).toContain("Marriage");
  });

  it("prioritizes Career for an unemployed person", async () => {
    const context: MasterEngineContext = {
      name: "Job Seeker",
      birthDate: "1997-10-24",
      birthTime: "20:15",
      latitude: 14.5479,
      longitude: 74.3187,
      ayanamsaModel: "lahiri",
      lang: "en",
      isMarried: false,
      hasJob: false
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const prediction = await generateMasterPrediction(kundli, context);

    // Person is ~29 and unemployed, Priority should be Career
    expect(prediction.masterSynthesis.priorityTopic).toContain("Career");
  });

  it("prioritizes Family Expansion for a married person without children", async () => {
    const context: MasterEngineContext = {
      name: "Married Person",
      birthDate: "1990-01-01",
      birthTime: "12:00",
      latitude: 14.5479,
      longitude: 74.3187,
      ayanamsaModel: "lahiri",
      lang: "en",
      isMarried: true,
      hasChildren: false,
      hasJob: true
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const prediction = await generateMasterPrediction(kundli, context);

    // Person is ~36, married, no kids. Priority should be Family
    expect(prediction.masterSynthesis.priorityTopic).toContain("Family");
  });

  it("prioritizes Health/Retirement for someone over 60", async () => {
    const context: MasterEngineContext = {
      name: "Senior",
      birthDate: "1950-01-01",
      birthTime: "12:00",
      latitude: 14.5479,
      longitude: 74.3187,
      ayanamsaModel: "lahiri",
      lang: "en",
      isMarried: true,
      hasChildren: true,
      hasJob: true
    };

    const kundli = calculateKundli(context, { ayanamsaModel: "lahiri" });
    const prediction = await generateMasterPrediction(kundli, context);

    // Person is ~76. Priority should be Health
    expect(prediction.masterSynthesis.priorityTopic).toContain("Health");
  });
});
