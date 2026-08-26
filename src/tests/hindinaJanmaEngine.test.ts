import { describe, it, expect } from "vitest";
import {
  computePastLifePersona,
  computeSanchitaKarma,
  computeInnateBoons,
  computePhobiaAndBirthmark,
  computeRahuKetuMokshaAxis,
  computeKarmicRemedies,
  executeHindinaJanmaCalculation
} from "../features/hindinajanma/hindinaJanmaEngine";
import type { HindinaJanmaInput } from "../features/hindinajanma/hindinaJanmaTypes";

describe("Hindina Janma (Past Life Astrology) Engine", () => {
  it("computes authentic past life persona archetype", () => {
    const input: HindinaJanmaInput = {
      personName: "Shankara",
      dob: "1992-05-15",
      gender: "Male",
      lang: "kn"
    };

    const persona = computePastLifePersona(4, 16, input);
    expect(persona.eraAndTimeline.kn).toBeDefined();
    expect(persona.geographicalRealm.kn).toBeDefined();
    expect(persona.socialStatusAndVocation.kn).toBeDefined();
    expect(persona.dominantGraha).toBeDefined();
  });

  it("computes Sanchita Karma Punya vs Paapa ratios", () => {
    const karma = computeSanchitaKarma(16, 5);
    expect(karma.sanchitaPunyaPercentage).toBeGreaterThanOrEqual(70);
    expect(karma.sanchitaPunyaPercentage + karma.sanchitaPaapaPercentage).toBe(100);
    expect(karma.dominantKarmicDebt.kn).toBeDefined();
    expect(karma.karmicCurseOrBlessing.kn).toBeDefined();
  });

  it("computes innate boons and talents", () => {
    const boons = computeInnateBoons(4, "ancient_temples");
    expect(boons.inheritedTalents.kn.length).toBeGreaterThanOrEqual(3);
    expect(boons.sacredDeityAffinity.kn).toContain("ಮಹಾಬಲೇಶ್ವರ");
    expect(boons.dejaVuTriggers.kn.length).toBeGreaterThanOrEqual(2);
  });

  it("computes birthmark and phobia correlations", () => {
    const corr = computePhobiaAndBirthmark("head_face", "water_drowning");
    expect(corr.birthmarkSignificance.kn).toContain("ಮಚ್ಚೆ");
    expect(corr.phobiaKarmicOrigin.kn).toContain("ಜಲ");
    expect(corr.pastLifeTransitionType.kn).toBeDefined();
  });

  it("computes Rahu-Ketu soul evolution axis", () => {
    const axis = computeRahuKetuMokshaAxis(4);
    expect(axis.ketuPastLifeMastery.kn).toContain("ಕೇತು");
    expect(axis.rahuCurrentLifeMission.kn).toContain("ರಾಹು");
    expect(axis.soulMaturityLevel.kn).toContain("ಆತ್ಮ");
  });

  it("provides sacred Gokarna remedies with Chief Priest details", () => {
    const remedies = computeKarmicRemedies();
    expect(remedies.sacredAtmaShantiMantra).toContain("ವಾಸುದೇವಾಯ");
    expect(remedies.priestName).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(remedies.priestPhone).toBe("9972339362");
    expect(remedies.recommendedTilaAndDanaItems.kn.length).toBeGreaterThanOrEqual(3);
  });

  it("executes full Hindina Janma calculation without error", async () => {
    const input: HindinaJanmaInput = {
      personName: "Devotee",
      dob: "1995-11-20",
      tob: "14:30",
      gender: "Female",
      birthPlace: "581326",
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
    expect(res.karmaAnalysis.sanchitaPunyaPercentage).toBeGreaterThanOrEqual(50);
  });
});
