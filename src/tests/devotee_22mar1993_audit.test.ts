import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  detectNativeDietAndAddiction,
  detectNativeSensualAndFidelity
} from "../core/PanchangaAngaSynthesisEngine";
import {
  diagnoseCurrentLifeSituation,
  determineAccurateProfession
} from "../core/CurrentLifeAndCareerDiagnosticEngine";

describe("Devotee 22-March-1993 (23:48 IST Kumta) Diagnostic & Trait Audit", () => {
  const friendContext = {
    birthDate: "1993-03-22",
    birthTime: "23:48",
    latitude: 14.4289,
    longitude: 74.4172,
    devoteeName: "Vedic Scholar Friend",
    gender: "Male" as const
  };

  const kundli = calculateKundli({
    name: friendContext.devoteeName,
    birthDate: friendContext.birthDate,
    birthTime: friendContext.birthTime,
    latitude: friendContext.latitude,
    longitude: friendContext.longitude
  });

  it("diagnoses marital_discord instead of marriage_delay (married with child, suffering discord)", () => {
    const cls = diagnoseCurrentLifeSituation(kundli, friendContext);
    expect(cls.category).toBe("marital_discord");
    expect(cls.category).not.toBe("marriage_delay");
    expect(cls.titleKn).toContain("ದಾಂಪತ್ಯದಲ್ಲಿ ತೀವ್ರ ಬಿಕ್ಕಟ್ಟು");
  });

  it("diagnoses priest_vedic_astrology due to 9th lord Moon + 10th lord Sun in 5th Pisces Dharma-Karmadhipati Yoga aspected by Jupiter", () => {
    const prof = determineAccurateProfession(kundli, friendContext);
    expect(prof.code).toBe("priest_vedic_astrology");
    expect(prof.code).not.toBe("government_civil_police");
    expect(prof.titleKn).toContain("ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು");
    expect(prof.titleKn).toContain("ಪೌರೋಹಿತ್ಯ");
    expect(prof.astrologicalBasisKn).toContain("ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ");
  });

  it("diagnoses chewing tobacco/zarda habit due to Mars in 8th house aspecting 2nd house of oral intake", () => {
    const diet = detectNativeDietAndAddiction(kundli);
    expect(diet.hasZardaTobaccoHabit).toBe(true);
    expect(diet.isTeetotaler).toBe(false);
    expect(diet.dietSummaryKn).toContain("ಜರ್ದಾ");
    expect(diet.dietSummaryKn).toContain("ತಂಬಾಕು");
  });

  it("diagnoses extramarital romance and massage/spa indulgence due to Ketu in 7th, Mars in 8th, and 12th lord Venus in 5th", () => {
    const sensual = detectNativeSensualAndFidelity(kundli);
    expect(sensual.hasMaritalFidelity).toBe(false);
    expect(sensual.hasStrongAffairRisk).toBe(true);
    expect(sensual.fidelitySummaryKn).toContain("ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ");
    expect(sensual.fidelitySummaryKn).toContain("ಮಸಾಜ್/ಸ್ಪಾ");
  });

  it("generates authentic good and bad traits: Kullam-Kulla candor, Extramarital/Spa, Zarda habit, and ZERO smuggling", () => {
    const synthesis = generatePanchangaAngaSynthesis(kundli, friendContext);
    const badTraits = synthesis.goodBadAnalysis.badTraits;

    // Trait 2: Extramarital & Spa
    const trait2 = badTraits.find(t => t.id === 2);
    expect(trait2).toBeDefined();
    expect(trait2?.titleKn).toContain("ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ");
    expect(trait2?.bulletKn).toContain("ಮಸಾಜ್");

    // Trait 3: Zarda & Chewing Tobacco
    const trait3 = badTraits.find(t => t.id === 3);
    expect(trait3).toBeDefined();
    expect(trait3?.titleKn).toContain("ಜರ್ದಾ");
    expect(trait3?.bulletKn).toContain("ತಂಬಾಕು");

    // Trait 4: Clean Dharmic Earnings - NO Smuggling / False Criminal Tag!
    const trait4 = badTraits.find(t => t.id === 4);
    expect(trait4).toBeDefined();
    expect(trait4?.titleKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ");
    expect(trait4?.titleKn).not.toContain("ಸ್ಮಗ್ಲಿಂಗ್");
    expect(trait4?.bulletKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ");

    // Trait 6: Kullam-Kulla Brazen Candor
    const trait6 = badTraits.find(t => t.id === 6);
    expect(trait6).toBeDefined();
    expect(trait6?.titleKn).toContain("ಕುಲ್ಲಂ ಕುಲ್ಲಾ");
    expect(trait6?.bulletKn).toContain("ಕುಲ್ಲಂ ಕುಲ್ಲಾ");
  });

  it("reflects consistent diagnosis and negative shades through full PanchangaAngaSynthesis", () => {
    const synthesis = generatePanchangaAngaSynthesis(kundli, friendContext);
    const cls = synthesis.currentDiagnosis.currentLifeSituation;
    const prof = synthesis.currentDiagnosis.accurateProfession;

    expect(cls).toBeDefined();
    expect(cls?.category).toBe("marital_discord");

    expect(prof).toBeDefined();
    expect(prof?.code).toBe("priest_vedic_astrology");

    const shades = synthesis.currentDiagnosis.negativeShades;
    expect(shades).toBeDefined();
    expect(shades?.sensualMarital.hasRisk).toBe(true);
    expect(shades?.sensualMarital.titleKn).toContain("ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ");
    expect(shades?.financialIntegrity.hasRisk).toBe(false);
    expect(shades?.financialIntegrity.titleKn).toContain("ಧರ್ಮನಿಷ್ಠ ಆರ್ಥಿಕ ಪ್ರಾಮಾಣಿಕತೆ");
  });
});
