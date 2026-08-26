import { describe, it, expect, vi } from "vitest";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockResolvedValue("॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥\n\nದೈವಿಕ ಪೂರ್ವ ಜನ್ಮ ದರ್ಶನ...")
}));

import {
  computePastLifePersona,
  computeSanchitaKarmaAnalysis,
  computeInnateBoonsAndTalents,
  computePhobiaAndBirthmarkCorrelation,
  computeRahuKetuMokshaAxis,
  computeKarmicRemediesAndGokarnaShanti,
  executeHindinaJanmaCalculation
} from "../features/hindinajanma/hindinaJanmaEngine";
import type { HindinaJanmaInput } from "../features/hindinajanma/hindinaJanmaTypes";

describe("Hindina Janma (Past Life Astrology) Engine", () => {
  it("computes authentic past life persona archetype across different signs", () => {
    const input: HindinaJanmaInput = {
      personName: "Shankara",
      dob: "1992-05-15",
      gender: "Male",
      lang: "kn"
    };

    // Test sign 0 (Mesha)
    const persona0 = computePastLifePersona(0, 0, input);
    expect(persona0.eraAndTimeline.kn).toContain("೧೭ನೇ ಶತಮಾನ");
    expect(persona0.dominantGraha).toContain("ಮಂಗಳ");

    // Test sign 4 (Simha)
    const persona4 = computePastLifePersona(4, 0, input);
    expect(persona4.eraAndTimeline.kn).toContain("ವಿಜಯನಗರ");
    expect(persona4.dominantGraha).toContain("ಸೂರ್ಯ");

    // Test sign 7 (Vrischika)
    const persona7 = computePastLifePersona(7, 0, input);
    expect(persona7.eraAndTimeline.kn).toContain("ಕೇದಾರ-ಬದರೀ");
    expect(persona7.dominantGraha).toContain("ಕೇತು");
  });

  it("computes Sanchita Karma Punya vs Paapa ratios dynamically", () => {
    const input: HindinaJanmaInput = {
      personName: "Ramesh",
      dob: "1988-08-20",
      gender: "Male",
      lang: "kn"
    };

    const karma = computeSanchitaKarmaAnalysis(4, 10, input);
    expect(karma.sanchitaPunyaPercentage).toBeGreaterThanOrEqual(65);
    expect(karma.sanchitaPunyaPercentage + karma.sanchitaPaapaPercentage).toBe(100);
    expect(karma.dominantKarmicDebt.kn).toBeDefined();
    expect(karma.karmicCurseOrBlessing.kn).toBeDefined();
  });

  it("computes innate boons and talents", () => {
    const boons = computeInnateBoonsAndTalents(4, 5, "ancient_temples");
    expect(boons.inheritedTalents.kn.length).toBeGreaterThanOrEqual(3);
    expect(boons.sacredDeityAffinity.kn).toBeDefined();
    expect(boons.dejaVuTriggers.kn.length).toBeGreaterThanOrEqual(2);
  });

  it("computes birthmark and phobia correlations", () => {
    const corr = computePhobiaAndBirthmarkCorrelation("head_face", "water_drowning", 0);
    expect(corr.birthmarkSignificance.kn).toContain("ಮಚ್ಚೆ");
    expect(corr.phobiaKarmicOrigin.kn).toContain("ಜಲ");
    expect(corr.pastLifeTransitionType.kn).toBeDefined();
  });

  it("computes Rahu-Ketu soul evolution axis", () => {
    const axis = computeRahuKetuMokshaAxis(0, 5);
    expect(axis.ketuPastLifeMastery.kn).toBeDefined();
    expect(axis.rahuCurrentLifeMission.kn).toBeDefined();
    expect(axis.soulMaturityLevel.kn).toContain("ಆತ್ಮ");
  });

  it("provides sacred Gokarna remedies with Chief Priest details", () => {
    const remedies = computeKarmicRemediesAndGokarnaShanti(0);
    expect(remedies.sacredAtmaShantiMantra).toContain("ಶಿವಾಯ");
    expect(remedies.priestName).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(remedies.priestPhone).toContain("99723");
    expect(remedies.recommendedTilaAndDanaItems.kn.length).toBeGreaterThanOrEqual(3);
  });

  it("executes full Hindina Janma calculation without error", async () => {
    const input: HindinaJanmaInput = {
      personName: "Devotee",
      dob: "1995-11-20",
      tob: "14:30",
      gender: "Female",
      birthPlace: "581326 Gokarna",
      birthMarkLocation: "neck_chest",
      inexplicableAffinity: "ancient_temples",
      inexplicablePhobia: "heights_fall",
      customQuestion: "What is my karmic mission in this birth?",
      lang: "kn"
    };

    const res = await executeHindinaJanmaCalculation(input);
    expect(res.sunSign).toBeDefined();
    expect(res.moonNakshatra).toBeDefined();
    expect(res.pastLifePersona.socialStatusAndVocation.kn).toBeDefined();
    expect(res.karmaAnalysis.sanchitaPunyaPercentage).toBeGreaterThanOrEqual(60);
    expect(res.aiNarrative).toBeDefined();
  });
});
