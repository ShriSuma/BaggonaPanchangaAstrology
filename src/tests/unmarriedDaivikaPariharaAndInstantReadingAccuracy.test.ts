import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  diagnoseCurrentLifeSituation,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";

describe("Unmarried Native Daivika Parihara & Instant Reading Accuracy Audit", () => {
  it("Unmarried female native with 7th/8th house afflictions: Diagnoses marriage_delay and NEVER marital_discord", () => {
    // A female native born in 1996 (age 30), with Kuja or Ketu/Saturn in 7th/8th house
    const birthDate = "1996-08-14";
    const birthTime = "14:30";
    const lat = 15.3647;
    const lng = 75.1240;

    const kundli = calculateKundli({
      name: "Kirti Talpankar",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng
    });
    expect(kundli).toBeDefined();

    const context = {
      devoteeName: "Kirti Talpankar",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Female",
      devoteeAge: 30,
      maritalStatus: "unmarried"
    };

    // 1. Marriage Destiny evaluation
    const destiny = determineMarriageDestiny(kundli, context);
    expect(destiny.verdict).toBe("delayed_marriage");

    // 2. Current Life Situation Diagnosis
    const currentLife = diagnoseCurrentLifeSituation(kundli, context);
    expect(currentLife.category).toBe("marriage_delay");
    expect(currentLife.titleKn).toContain("ವಿವಾಹ ವಿಳಂಬ");
    expect(currentLife.detailedRealityKn).not.toContain("ಪತಿಯೊಂದಿಗೆ ಕಲಹ");
    expect(currentLife.detailedRealityKn).not.toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು");
    expect(currentLife.detailedRealityEn).not.toContain("acute marital discord");

    // 3. Synthesis Engine
    const synthesis = generatePanchangaAngaSynthesis(kundli, {
      ...context,
      lang: "kn"
    });
    expect(synthesis.currentDiagnosis.currentLifeSituation?.category).toBe("marriage_delay");

    // 4. Daivika Parihara (generateKundliRemedyReport)
    const remedyReport = generateKundliRemedyReport(kundli, {
      name: "Kirti Talpankar",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Female",
      maritalStatus: "unmarried"
    });

    expect(remedyReport.primaryStruggle.category).toBe("marriage_delay");
    expect(remedyReport.primaryStruggle.title.kn).toContain("ವಿವಾಹ ವಿಳಂಬ");
    expect(remedyReport.primaryStruggle.title.kn).not.toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕೊರತೆ");
  });

  it("Unspecified marital status for female native with delayed marriage destiny: Safely routes to marriage_delay instead of marital fighting", () => {
    // When devotee fills form without explicitly checking marital status
    const birthDate = "1995-10-25";
    const birthTime = "11:15";
    const lat = 14.4289;
    const lng = 74.4172;

    const kundli = calculateKundli({
      name: "ಅನನ್ಯ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng
    });

    const context = {
      devoteeName: "ಅನನ್ಯ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Female",
      devoteeAge: 30
      // maritalStatus is unspecified/undefined
    };

    const currentLife = diagnoseCurrentLifeSituation(kundli, context);
    expect(currentLife.category).toBe("marriage_delay");
    expect(currentLife.category).not.toBe("marital_discord");

    const remedyReport = generateKundliRemedyReport(kundli, {
      name: "ಅನನ್ಯ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Female"
    });

    expect(remedyReport.primaryStruggle.category).toBe("marriage_delay");
  });

  it("Married male priest (Regression Test): Accurately preserves marital discord / relationship friction diagnosis when married", () => {
    // Shreedhar Bhat / 22-Mar-1993 23:48 IST, married priest
    const birthDate = "1993-03-22";
    const birthTime = "23:48";
    const lat = 14.4289;
    const lng = 74.4172;

    const kundli = calculateKundli({
      name: "ಶ್ರೀಧರ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng
    });

    const context = {
      devoteeName: "ಶ್ರೀಧರ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Male",
      devoteeAge: 33,
      maritalStatus: "married"
    };

    const currentLife = diagnoseCurrentLifeSituation(kundli, context);
    // As confirmed married, marital_discord is permitted and expected due to severe 7th/8th house combustions
    expect(currentLife.category).toBe("marital_discord");

    const remedyReport = generateKundliRemedyReport(kundli, {
      name: "ಶ್ರೀಧರ ಭಟ್",
      birthDate,
      birthTime,
      latitude: lat,
      longitude: lng,
      gender: "Male",
      maritalStatus: "married"
    });

    // Married male with marital_discord in CLS correctly gets relationship_friction in remedy report
    expect(remedyReport.primaryStruggle.category).toBe("relationship_friction");
    expect(remedyReport.primaryStruggle.title.kn).toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕೊರತೆ");
  });
});
