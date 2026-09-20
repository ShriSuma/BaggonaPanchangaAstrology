import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge,
  detectNativeDietAndAddiction,
  generateVedicConsultationAnswer
} from "../core/PanchangaAngaSynthesisEngine";
import groundTruthData from "./fixtures/twentyRealWorldNegativeAndMaritalBenchmarks.json";

export interface RealWorldBenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  category: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  gender: "Male" | "Female";
  maritalStatusInput: "married" | "unmarried";
  expectedCareerCode: string;
  expectedMarriageVerdict: "already_married" | "delayed_marriage" | "lifelong_celibacy_denial" | "assured_marriage";
  isExpectedTeetotaler: boolean;
  expectedNegativeScoreMin: number;
  expectedDim1Risk: boolean;
  expectedDim3Risk: boolean;
  expectedDim4Risk: boolean;
  historicalFacts: string;
}

const BENCHMARKS: RealWorldBenchmarkProfile[] = groundTruthData as RealWorldBenchmarkProfile[];

describe("20 Real-World Internet Benchmarks Audit (Criminality, Divorces, Affairs & Marriage Delay)", () => {
  for (const person of BENCHMARKS) {
    it(`evaluates ${person.name} (${person.category}) with 100% Shastric accuracy`, () => {
      const age = calculateDevoteeAge(person.birthDate);
      const kundli = calculateKundli({
        name: person.name,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon
      });

      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon,
        devoteeName: person.name,
        gender: person.gender,
        devoteeAge: age,
        maritalStatus: person.maritalStatusInput,
        lang: "kn"
      });

      const diag = synthesis.currentDiagnosis;
      const diet = detectNativeDietAndAddiction(kundli);
      const shades = diag.negativeShades;
      const marriage = diag.marriageDestiny;

      expect(shades).toBeDefined();
      if (!shades) return;

      // 1. Career suitability match
      expect(diag.accurateProfession?.code).toBe(person.expectedCareerCode);

      // 2. Marriage destiny verdict match
      expect(marriage?.verdict).toBe(person.expectedMarriageVerdict);

      // 3. Diet / Teetotaler lifestyle match
      expect(diet.isTeetotaler).toBe(person.isExpectedTeetotaler);

      // 4. Negative shades score and dimensional risk checks
      expect(shades.overallScore).toBeGreaterThanOrEqual(person.expectedNegativeScoreMin);
      expect(shades.sensualMarital.hasRisk).toBe(person.expectedDim1Risk);
      expect(shades.violenceAggression.hasRisk).toBe(person.expectedDim3Risk);
      expect(shades.legalBandhana.hasRisk).toBe(person.expectedDim4Risk);

      // 5. Specific deep validations for focal profiles:
      if (person.id === "darshan_thoogudeepa") {
        // Darshan: Action cinema, non-teetotaler, affair risk true, violence risk true, Bandhana jail risk true
        expect(shades.overallScore).toBeGreaterThanOrEqual(40);
        expect(shades.sensualMarital.hasRisk).toBe(true);
        expect(shades.violenceAggression.hasRisk).toBe(true);
        expect(shades.legalBandhana.hasRisk).toBe(true);
        expect(shades.legalBandhana.analysisKn).toContain("ಬಂಧನ ಯೋಗ");
      }

      if (person.id === "sanjay_dutt") {
        // Sanjay Dutt: Yerwada prison (Bandhana) & Mars-Venus 10th affair
        expect(shades.legalBandhana.hasRisk).toBe(true);
        expect(shades.sensualMarital.hasRisk).toBe(true);
      }

      if (person.id === "oj_simpson") {
        // O.J. Simpson: Mars-Rahu in 2nd violence & 9-year prison sentence
        expect(shades.violenceAggression.hasRisk).toBe(true);
        expect(shades.legalBandhana.hasRisk).toBe(true);
      }

      if (person.id === "salman_khan") {
        // Salman Khan: Lifelong celibacy denial & Bandhana jail custody
        expect(marriage?.verdict).toBe("lifelong_celibacy_denial");
        expect(shades.legalBandhana.hasRisk).toBe(true);
      }

      if (person.id === "tiger_woods") {
        // Tiger Woods: Infidelity scandal
        expect(shades.sensualMarital.hasRisk).toBe(true);
      }

      if (person.id === "bill_clinton") {
        // Bill Clinton: Extramarital affair & impeachment trial
        expect(shades.sensualMarital.hasRisk).toBe(true);
        expect(shades.legalBandhana.hasRisk).toBe(true);
      }

      if (person.id === "native_33_unmarried") {
        // 33-Year-Old Unmarried Native: Delay marriage, window >= 33, consultation answer future window
        expect(marriage?.verdict).toBe("delayed_marriage");
        expect(marriage?.marriageTimingWindowKn).toMatch(/3[3-9]|4[0-9]/);
        expect(marriage?.marriageTimingWindowKn).not.toContain("28 ರಿಂದ 30");

        const ans = generateVedicConsultationAnswer(
          kundli,
          diag,
          synthesis.prescriptions,
          "ನನಗೆ ಕಂಕಣ ಭಾಗ್ಯ ಅಥವಾ ವಿವಾಹ ಯಾವಾಗ ಆಗಬಹುದು?",
          person.name,
          true,
          age,
          person.gender
        );
        expect(ans).toContain("ವಿಳಂಬ ವಿವಾಹ ಯೋಗ");
        expect(ans).not.toContain("ಮುಂದಿನ 4 ತಿಂಗಳು");
        expect(ans).toMatch(/3[3-9]|4[0-9]/);
      }
    });
  }

  // Bonus Guarantee Test: Upright native (Pramod) maintains 100% false-positive immunity
  it("guarantees Pramod's clean chart remains 100% immune from criminality and Bandhana false positives", () => {
    const pramodContext = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const,
      devoteeAge: 33,
      maritalStatus: "unmarried" as const
    };

    const kundli = calculateKundli({
      name: pramodContext.devoteeName,
      birthDate: pramodContext.birthDate,
      birthTime: pramodContext.birthTime,
      latitude: pramodContext.latitude,
      longitude: pramodContext.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, pramodContext);
    const shades = synthesis.currentDiagnosis.negativeShades;
    const marriage = synthesis.currentDiagnosis.marriageDestiny;

    expect(shades).toBeDefined();
    if (!shades) return;

    // Must be in purity tier (score <= 15)
    expect(shades.overallScore).toBeLessThanOrEqual(15);
    expect(shades.category).toBe("purity");
    expect(shades.violenceAggression.hasRisk).toBe(false);
    expect(shades.legalBandhana.hasRisk).toBe(false);
    expect(shades.financialIntegrity.hasRisk).toBe(false);
    expect(shades.conductDownwardPath.hasRisk).toBe(false);

    // Marriage window for 33-year-old Pramod must be future bounded (>= 33)
    expect(marriage?.marriageTimingWindowKn).toMatch(/3[3-9]|4[0-9]/);
    expect(marriage?.marriageTimingWindowKn).not.toContain("28 ರಿಂದ 30");

    const ans = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ನನಗೆ ಕಂಕಣ ಭಾಗ್ಯ ಅಥವಾ ವಿವಾಹ ಯಾವಾಗ ಆಗಬಹುದು?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(ans).toContain("36 ರಿಂದ 40 ವರ್ಷಗಳ ಅವಧಿಯಲ್ಲಿ");
    expect(ans).not.toContain("ಮುಂದಿನ 4 ತಿಂಗಳು");
  });
});
