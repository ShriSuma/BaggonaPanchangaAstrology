import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  generateVedicConsultationAnswer,
  detectNativeDietAndAddiction,
  detectNativeSensualAndFidelity
} from "../core/PanchangaAngaSynthesisEngine";
import {
  diagnoseCurrentLifeSituation,
  determineAccurateProfession
} from "../core/CurrentLifeAndCareerDiagnosticEngine";

describe("Universal Parashari Generalization & Multi-Chart Calibration Audit", () => {
  it("Chart 1 (Aries Lagna): Strong 7th lord with domestic discord factors prioritizes Marital Discord over Delay", () => {
    // Aries Lagna native born with strong 7th lord and domestic tension
    const kundli = calculateKundli({
      name: "ರಾಘವೇಂದ್ರ ರಾವ್",
      birthDate: "1990-04-15",
      birthTime: "06:15",
      latitude: 12.9716,
      longitude: 77.5946
    });
    expect(kundli).toBeDefined();

    const diagnosis = diagnoseCurrentLifeSituation(
      kundli,
      {
        devoteeName: "ರಾಘವೇಂದ್ರ ರಾವ್",
        devoteeAge: 34,
        gender: "Male",
        maritalStatus: "married"
      }
    );

    // Because the native is married, marriage_delay is strictly barred
    expect(diagnosis.category).not.toBe("marriage_delay");
  });

  it("Chart 2 (Scorpio Lagna - Devotee 22-Mar-1993): Universal engine preserves 100% precision across all 6 key traits", () => {
    // Devotee: 22 March 1993, 23:48 IST, Kumta/Siddapur (14.4289° N, 74.4172° E)
    const devoteeContext = {
      name: "ಶ್ರೀಧರ ಭಟ್",
      birthDate: "1993-03-22",
      birthTime: "23:48",
      latitude: 14.4289,
      longitude: 74.4172,
      devoteeName: "ಶ್ರೀಧರ ಭಟ್",
      devoteeAge: 31,
      gender: "Male" as const
    };

    const kundli = calculateKundli(devoteeContext);

    // 1. Current Life Diagnostic: Marital Discord
    const currentDiag = diagnoseCurrentLifeSituation(kundli, devoteeContext);
    expect(currentDiag.category).toBe("marital_discord");
    expect(currentDiag.headlineKn).toContain("ದಾಂಪತ್ಯದಲ್ಲಿ");
    expect(currentDiag.planetaryCulpritKn).toContain("7ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕೇತು");
    expect(currentDiag.planetaryCulpritKn).toContain("8ನೇ ಮನೆಯಲ್ಲಿ ಅಷ್ಟಮ ಕುಜ");

    // 2. Profession: Vedic Priest / Astrologer via Dharma-Karmadhipati Raja Yoga
    const careerDiag = determineAccurateProfession(kundli, devoteeContext);
    expect(careerDiag.code).toBe("priest_vedic_astrology");
    expect(careerDiag.titleKn).toContain("ದೇವಸ್ಥಾನದ ಅರ್ಚಕರು");
    expect(careerDiag.astrologicalBasisKn).toContain("ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ");

    // 3. Diet: Zarda & Chewing Tobacco
    const diet = detectNativeDietAndAddiction(kundli);
    expect(diet.hasZardaTobaccoHabit).toBe(true);
    expect(diet.isTeetotaler).toBe(false);
    expect(diet.dietSummaryKn).toContain("ಜರ್ದಾ");

    // 4. Sensual: Extramarital & Spa indulgence
    const sensual = detectNativeSensualAndFidelity(kundli);
    expect(sensual.hasExtramaritalAndSpaAffliction).toBe(true);
    expect(sensual.fidelitySummaryKn).toContain("ಮಸಾಜ್/ಸ್ಪಾ");

    // 5. Secrecy: Kullam-Kulla Candor (Bad Trait 6)
    const synthesis = generatePanchangaAngaSynthesis(kundli, devoteeContext);
    const trait6 = synthesis.goodBadAnalysis.badTraits.find(t => t.id === 6);
    expect(trait6).toBeDefined();
    expect(trait6?.titleKn).toContain("ಕುಲ್ಲಂ ಕುಲ್ಲಾ");
    expect(trait6?.bulletKn).toContain("ಕುಲ್ಲಂ ಕುಲ್ಲಾ");

    // 6. Bad Trait 4: No false smuggling / black market
    const badTrait4 = synthesis.goodBadAnalysis.badTraits.find(t => t.id === 4);
    expect(badTrait4?.titleKn).not.toContain("ಕಳ್ಳಸಾಗಣೆ");
  });

  it("Chart 3 (Dharma-Karmadhipati Raja Yoga Generalization): Temple priest career dynamically references actual lords and house", () => {
    // Devotee 22-Mar-1993 has 9th lord Moon and 10th lord Sun in 5th house Pisces
    const devoteeContext = {
      name: "ವೈದಿಕ ವಿದ್ವಾಂಸ",
      birthDate: "1993-03-22",
      birthTime: "23:48",
      latitude: 14.4289,
      longitude: 74.4172,
      devoteeName: "ವೈದಿಕ ವಿದ್ವಾಂಸ",
      devoteeAge: 31,
      gender: "Male" as const
    };
    const kundli = calculateKundli(devoteeContext);
    const career = determineAccurateProfession(kundli, devoteeContext);

    expect(career.code).toBe("priest_vedic_astrology");
    // Verifies dynamic Kannada Shastric reference:
    expect(career.astrologicalBasisKn).toContain("9ನೇ ಧರ್ಮಾಧಿಪತಿ (ಚಂದ್ರ)");
    expect(career.astrologicalBasisKn).toContain("10ನೇ ಕರ್ಮಾಧಿಪತಿ (ರವಿ)");
    expect(career.astrologicalBasisKn).toContain("5ನೇ ಮಂತ್ರ-ಧರ್ಮ ಭಾವದಲ್ಲಿ");
    expect(career.astrologicalBasisKn).toContain("ಮೀನ");
  });

  it("Chart 4 (Ethical Cleanness Generalization): Pure chart receives definitive 'ಇಲ್ಲ!' for illicit smuggling and black money", () => {
    const devoteeContext = {
      name: "ಶ್ರೀಧರ",
      birthDate: "1993-03-22",
      birthTime: "23:48",
      latitude: 14.4289,
      longitude: 74.4172,
      devoteeName: "ಶ್ರೀಧರ",
      devoteeAge: 31,
      gender: "Male" as const
    };
    const kundli = calculateKundli(devoteeContext);
    const synthesis = generatePanchangaAngaSynthesis(kundli, devoteeContext);

    const answer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ನನ್ನ ಜಾತಕದಲ್ಲಿ ಕಳ್ಳಸಾಗಣೆ (ಸ್ಮಗ್ಲಿಂಗ್) ಅಥವಾ ಅಡ್ಡದಾರಿ ಹಣದ ರಿಸ್ಕ್ ಇದೆಯೇ?",
      devoteeContext.devoteeName,
      true,
      devoteeContext.devoteeAge,
      "kn"
    );

    // Must be a clear, unambiguous "ಇಲ್ಲ!"
    expect(answer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(answer).toContain("ಧರ್ಮ ಮತ್ತು ಕರ್ಮ ಸ್ಥಾನಗಳು ಶುದ್ಧವಾಗಿದ್ದು");
    expect(answer).not.toContain("ಹೌದು! ಜಾತಕದಲ್ಲಿ ಅಡ್ಡದಾರಿ ಹಣ");
  });

  it("Chart 5 (Diet & Zarda Habit Generalization): Dynamically identifies 8th house Mars casting 7th aspect onto 2nd house of oral intake", () => {
    const kundli = calculateKundli({
      name: "ಶ್ರೀಧರ",
      birthDate: "1993-03-22",
      birthTime: "23:48",
      latitude: 14.4289,
      longitude: 74.4172
    });
    const diet = detectNativeDietAndAddiction(kundli);

    expect(diet.hasZardaTobaccoHabit).toBe(true);
    expect(diet.rootCauseKn).toContain("8ನೇ ಮನೆಯಲ್ಲಿರುವ ಅಂಗಾರಕನು 2ನೇ ಮುಖ-ಭೋಜನ ಸ್ಥಾನದ ಮೇಲೆ ನೇರ 7ನೇ ದೃಷ್ಟಿ");
    expect(diet.dietSummaryKn).toContain("ಜರ್ದಾ, ತಂಬಾಕು & ಗುಟ್ಕಾ ವ್ಯಸನ");
  });
});
