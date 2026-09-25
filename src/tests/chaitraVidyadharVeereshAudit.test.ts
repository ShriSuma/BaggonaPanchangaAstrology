import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { diagnoseCurrentLifeSituation } from "../core/CurrentLifeAndCareerDiagnosticEngine";

describe("Chaitra, Vidyadhar and Veeresh Astrological Audit", () => {
  it("Vidyadhar and Chaitra are correctly diagnosed as Grihasthas (not waiting for marriage)", () => {
    // Vidyadhar (Age 36/37 in 2026, born 1989)
    const vidyadharInput = {
      name: "ವಿದ್ಯಾಧರ",
      birthDate: "1989-10-18",
      birthTime: "16:30",
      latitude: 14.5479,
      longitude: 74.3187,
      gender: "Male" as const
    };
    const vidyadharKundli = calculateKundli(vidyadharInput);
    const vidyadharDiag = diagnoseCurrentLifeSituation(vidyadharKundli, {
      birthDate: vidyadharInput.birthDate,
      birthTime: vidyadharInput.birthTime,
      latitude: vidyadharInput.latitude,
      longitude: vidyadharInput.longitude,
      devoteeName: vidyadharInput.name,
      gender: vidyadharInput.gender
    });

    // Must NOT diagnose marriage delay (ಕಂಕಣ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ) for adult Grihastha
    expect(vidyadharDiag.category).not.toBe("marriage_delay");
    expect(vidyadharDiag.headlineKn).not.toContain("ಕಂಕಣ ಭಾಗ್ಯ");

    // Chaitra (Age 34/35 in 2026, born 1991)
    const chaitraInput = {
      name: "ಚೈತ್ರಾ",
      birthDate: "1991-06-05",
      birthTime: "16:15",
      latitude: 14.5479,
      longitude: 74.3187,
      gender: "Female" as const
    };
    const chaitraKundli = calculateKundli(chaitraInput);
    const chaitraDiag = diagnoseCurrentLifeSituation(chaitraKundli, {
      birthDate: chaitraInput.birthDate,
      birthTime: chaitraInput.birthTime,
      latitude: chaitraInput.latitude,
      longitude: chaitraInput.longitude,
      devoteeName: chaitraInput.name,
      gender: chaitraInput.gender
    });

    // Must NOT diagnose marriage delay (ಕಂಕಣ ಭಾಗ್ಯದ ನಿರೀಕ್ಷೆ) for adult Grihastha
    expect(chaitraDiag.category).not.toBe("marriage_delay");
    expect(chaitraDiag.headlineKn).not.toContain("ಕಂಕಣ ಭಾಗ್ಯ");

    // When explicitly passing maritalStatus: "married", both remain non-marriage_delay
    const chaitraMarriedDiag = diagnoseCurrentLifeSituation(chaitraKundli, {
      ...chaitraInput,
      maritalStatus: "married"
    });
    expect(chaitraMarriedDiag.category).not.toBe("marriage_delay");
  });

  it("Veeresh has 12th house Sayanasthana Mars+Saturn and 7th lord in 12th: must flag multiple relationships and NEVER grant Ekapatni Vrata", () => {
    // Veeresh (Born 1982-04-30 19:30)
    const veereshInput = {
      name: "ವೀರೇಶ್",
      birthDate: "1982-04-30",
      birthTime: "19:30",
      latitude: 14.5479,
      longitude: 74.3187,
      gender: "Male" as const
    };
    const veereshKundli = calculateKundli(veereshInput);
    const veereshSynthesis = generatePanchangaAngaSynthesis(veereshKundli, veereshInput);
    const gbaVeeresh = veereshSynthesis.currentDiagnosis.goodBadAnalysis;
    const dim1Veeresh = veereshSynthesis.currentDiagnosis.negativeShades?.sensualMarital;

    // Strict Fidelity check: Must NEVER be awarded Ekapatni Vrata
    expect(gbaVeeresh?.isHighFidelityVrata).toBe(false);
    expect(gbaVeeresh?.hasMultipleRelationshipsRisk).toBe(true);

    // Fidelity summary warning
    expect(gbaVeeresh?.fidelitySummaryKn).toContain("ಬಹು ಪ್ರಣಯ ಸಂಬಂಧ");

    // Dimension 1 (Sensual / Marital Shadow score)
    expect(dim1Veeresh?.score).toBeGreaterThanOrEqual(14);
    expect(dim1Veeresh?.badgeKn).toContain("ಬಹು ಪ್ರಣಯ ಸಂಬಂಧ");
    expect(dim1Veeresh?.analysisKn).toContain("12ನೇ ಶಯನ-ವ್ಯಯ ಸ್ಥಾನ");
    expect(dim1Veeresh?.analysisKn).toContain("ಬಹು ಸ್ತ್ರೀಯರೊಂದಿಗೆ ಶಾರೀರಿಕ/ರಹಸ್ಯ ಸಂಬಂಧಗಳು");
  });
});
