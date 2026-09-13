import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";

describe("Regression Test for 31 May 1993 Native Feedback", () => {
  it("accurately diagnoses marital discord, priesthood, alcohol under stress, and sensual restlessness", () => {
    const kundli = calculateKundli({
      name: "Native",
      birthDate: "1993-05-31",
      birthTime: "09:20",
      latitude: 14.42,
      longitude: 74.41
    });

    const synth = generatePanchangaAngaSynthesis(kundli, {
      birthDate: "1993-05-31",
      birthTime: "09:20",
      latitude: 14.42,
      longitude: 74.41,
      devoteeName: "Devotee",
      gender: "Male"
    });

    // 1. Marital Discord in Samsara (NOT "You have not yet married")
    expect(synth.currentDiagnosis.currentLifeSituation?.category).toBe("marital_discord");
    expect(synth.currentDiagnosis.currentLifeSituation?.titleKn).toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು");

    // 2. Accurate Profession: Temple Priest, Archaka, Homa-Havana & Vedic Priesthood (NOT Civil Engineering)
    expect(synth.currentDiagnosis.accurateProfession?.code).toBe("priest_vedic_astrology");
    expect(synth.currentDiagnosis.accurateProfession?.titleKn).toContain("ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು");
    expect(synth.currentDiagnosis.accurateProfession?.specificRoleKn).toContain("ಹೋಮ-ಹವನ");

    // 3. Realistic Character Diagnosis (NOT false teetotaler or false marital fidelity whitewashing)
    expect(synth.currentDiagnosis.goodBadAnalysis?.isTeetotaler).toBe(false);
    expect(synth.currentDiagnosis.goodBadAnalysis?.hasMaritalFidelity).toBe(false);
    expect(synth.currentDiagnosis.goodBadAnalysis?.dietSummaryKn).toContain("ಮದ್ಯಪಾನ");
    expect(synth.currentDiagnosis.goodBadAnalysis?.fidelitySummaryKn).toContain("ಕಾಮ ಚಾಂಚಲ್ಯ");

    // Bad Trait 2: Sensual restlessness / roving eye
    expect(synth.currentDiagnosis.goodBadAnalysis?.badTraits[1].titleKn).toContain("ಕಾಮ ಚಾಂಚಲ್ಯ");
    // Bad Trait 3: Alcohol consumption under stress
    expect(synth.currentDiagnosis.goodBadAnalysis?.badTraits[2].titleKn).toContain("ಮದ್ಯಪಾನ");

    // 4. Criminal False Accusation Shield: Still protected against violent/predatory crimes
    expect(synth.currentDiagnosis.negativeShades?.violenceAggression.hasRisk).toBe(false);
    expect(synth.currentDiagnosis.negativeShades?.financialIntegrity.hasRisk).toBe(false);
  });
});
