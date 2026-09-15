import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";

describe("Chart Diagnostics & Marriage Accuracy", () => {
  // Test Case 1: 1993-03-16 01:40 Man
  it("correctly identifies Marriage Delay as primary challenge for 1993-03-16 01:40 Man with Saptama Kuja & retrograde lords", () => {
    const context = {
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Man",
      gender: "Male" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    
    // Primary challenge should be Marriage Delay (Personal / Marriage)
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.area).toBe("Personal / Marriage");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.description).toContain("ಕಂಕಣ ಭಾಗ್ಯ");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.description).toContain("ವಿವಾಹ");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.description).toContain("ವೃತ್ತಿ-ಉದ್ಯೋಗದಲ್ಲಿ ಶ್ರಮವಿದ್ದರೂ");

    // Root cause should identify Saptama Kuja and retrograde lords
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.planetaryRootCause).toContain("ಸಪ್ತಮ ಕುಜ ದೋಷ");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.planetaryRootCause).toContain("ಬುಧ ವಕ್ರಿಯಾಗಿದ್ದು");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.planetaryRootCause).toContain("ಶುಕ್ರ ವಕ್ರಿಯಾಗಿರುವುದು");

    // Current Life Situation
    const cls = synthesis.currentDiagnosis.currentLifeSituation;
    expect(cls?.category).toBe("marriage_delay");
    expect(cls?.headlineKn).toContain("ವಿವಾಹ ವಿಳಂಬ");
    expect(cls?.externalLifeRealityKn).toContain("ಸಪ್ತಮ ಕುಜ ದೋಷ");
    expect(cls?.externalLifeRealityKn).toContain("ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ");

    // Instant Q&A must put Marriage question as #1 for this native
    expect(synthesis.instantQAList[0].category).toBe("marriage");
    expect(synthesis.instantQAList[0].questionKn).toContain("ವಿವಾಹ ಯೋಗ");
    expect(synthesis.instantQAList[0].panditScriptKn).toContain("ಸಪ್ತಮ ಕುಜ ದೋಷ");
  });

  // Test Case 2: Chart with NO marriage affliction must NOT get marriage delay
  it("does NOT show marriage delay for a chart with strong unafflicted 7th house", () => {
    // Chart with Jupiter in 9th, direct planets, 10th house focus
    const context = {
      birthDate: "1990-10-15",
      birthTime: "12:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Executive",
      gender: "Male" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.area).not.toBe("Personal / Marriage");
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).not.toBe("marriage_delay");
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).not.toBe("marriage_delay");
  });

  // Test Case 3: Student must get academic focus, NOT marriage
  it("shows student academic focus for a 19-year-old native, never marriage", () => {
    const context = {
      birthDate: "2007-06-15",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Student",
      gender: "Female" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).toBe("student_academic_stress");
  });

  // Test Case 4: Senior citizen must get senior legacy, NOT marriage
  it("shows senior peaceful legacy for a 65-year-old native, never marriage", () => {
    const context = {
      birthDate: "1960-08-10",
      birthTime: "06:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Senior",
      gender: "Male" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).toBe("elderly_peace_legacy");
  });

  // Test Case 5: Explicitly MARRIED user must NEVER receive marriage delay, even with 7th house afflictions
  it("strictly ensures an already married user NEVER gets marriage delay reading even if their chart has Saptama Kuja", () => {
    const context = {
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Married Man",
      gender: "Male" as const,
      maritalStatus: "married" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    // Must NEVER diagnose marriage_delay for a married user!
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).not.toBe("marriage_delay");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.description).not.toContain("ಕಂಕಣ ಭಾಗ್ಯ");
    expect(synthesis.currentDiagnosis.primaryLifeChallenge.description).not.toContain("ವಿವಾಹ ವಿಳಂಬ");
    // Must NEVER offer 'When will you get married?' question to an already married native
    expect(synthesis.instantQAList.some(q => q.id === "q_marriage_1")).toBe(false);
  });

  // Test Case 6: General user with unspecified status having only an ISOLATED 7th house placement does NOT trigger marriage delay
  it("guards general users with isolated single 7th house placements against false marriage delay", () => {
    // Normal career-oriented adult born 1988-11-20
    const context = {
      birthDate: "1988-11-20",
      birthTime: "14:30",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "General Adult",
      gender: "Male" as const
    };

    const kundli = calculateKundli({
      name: context.devoteeName,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      latitude: context.latitude,
      longitude: context.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, context);
    // Should focus on Career / Finance / Work, NOT marriage delay
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).not.toBe("marriage_delay");
  });
});

