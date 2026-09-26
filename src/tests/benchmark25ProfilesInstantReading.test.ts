import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge
} from "../core/PanchangaAngaSynthesisEngine";
import { BENCHMARK_25_PROFILES } from "../data/benchmarkProfiles25";

describe("Benchmark 25 Profiles Instant Reading & Character/Vocation Audit", () => {
  it("contains exactly 25 comprehensive benchmark profiles covering diverse real-world categories", () => {
    expect(BENCHMARK_25_PROFILES.length).toBe(25);
    const criminals = BENCHMARK_25_PROFILES.filter(p => p.category === "criminal_scam");
    const lawyers = BENCHMARK_25_PROFILES.filter(p => p.category === "trial_lawyer");
    const celebrities = BENCHMARK_25_PROFILES.filter(p => p.category === "celebrity_sports");
    const leaders = BENCHMARK_25_PROFILES.filter(p => p.category === "visionary_leader");
    const normals = BENCHMARK_25_PROFILES.filter(p => p.category === "normal_citizen");

    expect(criminals.length).toBe(5);
    expect(lawyers.length).toBe(3);
    expect(celebrities.length).toBe(7);
    expect(leaders.length).toBe(5);
    expect(normals.length).toBe(5);
  });

  for (const profile of BENCHMARK_25_PROFILES) {
    it(`evaluates ${profile.name} [${profile.category}] with 100% accuracy on vocation, criminal traits & secrecy`, () => {
      const age = calculateDevoteeAge(profile.birthDate);
      const kundli = calculateKundli({
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude
      });

      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        devoteeName: profile.name,
        gender: profile.gender,
        devoteeAge: age,
        maritalStatus: profile.maritalStatus,
        lang: "kn"
      });

      const diag = synthesis.currentDiagnosis;
      expect(diag).toBeDefined();

      // 1. Career Vocation Matching
      const topProfessionCode = diag.accurateProfession?.code;
      expect(topProfessionCode).toBe(profile.expectedCareerCode);

      // Verify interest fields are populated
      const topField = diag.accurateProfession?.topSuitableFields?.[0];
      expect(topField).toBeDefined();
      if (topField) {
        expect(topField.interestFieldsKn).toBeDefined();
        expect(topField.interestFieldsKn?.length).toBeGreaterThanOrEqual(2);
      }

      // 2. Character & Negative Shades Dimensions (Criminality, Scam, Murder, Bandhana)
      const shades = diag.negativeShades;
      expect(shades).toBeDefined();
      if (shades) {
        // Overall Score Range
        expect(shades.overallScore).toBeGreaterThanOrEqual(profile.negativeShadeScoreRange[0]);
        expect(shades.overallScore).toBeLessThanOrEqual(profile.negativeShadeScoreRange[1]);

        // Dimension 1: Sensual / Marital Infidelity
        expect(shades.sensualMarital.hasRisk).toBe(profile.expectedDim1Risk);

        // Dimension 2: Financial Integrity / Theft & Fraud
        expect(shades.financialIntegrity.hasRisk).toBe(profile.expectedDim2Risk);

        // Dimension 3: Violence / Assault / Homicide
        expect(shades.violenceAggression.hasRisk).toBe(profile.expectedDim3Risk);

        // Dimension 4: Bandhana / Litigation & Incarceration
        expect(shades.legalBandhana.hasRisk).toBe(profile.expectedDim4Risk);

        // Specific Offender & Archetype Checks
        if (profile.id === "bernie-madoff") {
          // Bernie Madoff: Mega-Ponzi Chora Yoga & 150-yr prison Bandhana
          expect(shades.financialIntegrity.hasRisk).toBe(true);
          expect(shades.legalBandhana.hasRisk).toBe(true);
          expect(shades.financialIntegrity.titleKn).toContain("ಮಹಾಚೋರ ಯೋಗ");
          expect(shades.legalBandhana.titleKn).toContain("ಮಹಾಬಂಧನ ಯೋಗ");
        }

        if (profile.id === "ted-bundy") {
          // Ted Bundy: Asura-Pishacha Serial Homicide & Electric Chair Death Row
          expect(shades.violenceAggression.hasRisk).toBe(true);
          expect(shades.legalBandhana.hasRisk).toBe(true);
          expect(shades.violenceAggression.titleKn).toContain("ಅಸುರ-ಪಿಶಾಚ ಹತ್ಯಾ ಯೋಗ");
          expect(shades.legalBandhana.titleKn).toContain("ಮರಣದಂಡನೆ");
        }

        if (profile.id === "charles-manson") {
          // Charles Manson: Shrapit Asura Cult Homicide & 46-yr prison
          expect(shades.violenceAggression.hasRisk).toBe(true);
          expect(shades.legalBandhana.hasRisk).toBe(true);
          expect(shades.violenceAggression.titleKn).toContain("ಶಾಪಗ್ರಸ್ತ ಅಸುರ ಹತ್ಯಾ ಪಿತೂರಿ ಯೋಗ");
          expect(shades.legalBandhana.titleKn).toContain("ಆಜೀವ ಕಾರಾಗೃಹ ಬಂಧನ");
        }

        if (profile.id === "oj-simpson") {
          // O.J. Simpson: Mars-Rahu in 10th Angaraka Violence & 9-yr armed robbery prison
          expect(shades.violenceAggression.hasRisk).toBe(true);
          expect(shades.legalBandhana.hasRisk).toBe(true);
          expect(shades.violenceAggression.titleKn).toContain("ಅಂಗಾರಕ-ಅಸುರ ಯೋಗ");
          expect(shades.legalBandhana.titleKn).toContain("ಬಂಧನ ಯೋಗ");
        }

        if (profile.id === "darshan-thoogudeepa") {
          // Darshan Thoogudeepa: Mars-Rahu in 2nd / Renukaswamy homicide custody
          expect(shades.sensualMarital.hasRisk).toBe(true);
          expect(shades.violenceAggression.hasRisk).toBe(true);
          expect(shades.legalBandhana.hasRisk).toBe(true);
        }

        if (profile.id === "apj-abdul-kalam") {
          // Dr. Kalam: Naishtika Brahmachari - Spotless Lifelong Celibacy & Purity
          expect(shades.sensualMarital.hasRisk).toBe(false);
          expect(shades.sensualMarital.titleKn).toContain("ನೈಷ್ಠಿಕ ಬ್ರಹ್ಮಚರ್ಯ");
          expect(shades.overallScore).toBeLessThanOrEqual(10);
        }

        // Normal Citizens: Suma Kulkarni, Raghavendra Rao, Venkatesh Sharma, Manjunath Gowda, Vidyadhar Hegde
        if (profile.category === "normal_citizen") {
          expect(shades.overallScore).toBeLessThanOrEqual(10);
          expect(shades.category).toBe("purity");
          expect(shades.sensualMarital.hasRisk).toBe(false);
          expect(shades.financialIntegrity.hasRisk).toBe(false);
          expect(shades.violenceAggression.hasRisk).toBe(false);
          expect(shades.legalBandhana.hasRisk).toBe(false);
          expect(shades.conductDownwardPath.hasRisk).toBe(false);
        }
      }

      // 3. Secrecy & Disclosure Habit: "Inside it will they tell to persons or not"
      const secrecyKn = diag.goodBadAnalysis?.secrecyHabitKn || "";
      expect(secrecyKn.length).toBeGreaterThan(10);

      if (profile.expectedSecrecyType === "kullam_kulla") {
        expect(secrecyKn).toContain("ಕುಲ್ಲಂ ಕುಲ್ಲಾ");
      } else if (profile.expectedSecrecyType === "pragmatic_discretion") {
        expect(secrecyKn).toContain("ಪ್ರಾಯೋಗಿಕ");
      } else if (profile.expectedSecrecyType === "diplomatic_mask") {
        expect(secrecyKn).toContain("ಬೌದ್ಧಿಕ");
      } else if (profile.expectedSecrecyType === "deep_vault") {
        expect(secrecyKn).toContain("ಗೌಪ್ಯತೆ");
      }
    });
  }
});
