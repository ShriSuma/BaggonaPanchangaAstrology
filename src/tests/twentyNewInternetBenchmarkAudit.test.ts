import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  determineAccurateProfession,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge,
  detectNativeDietAndAddiction
} from "../core/PanchangaAngaSynthesisEngine";
import groundTruthData from "./fixtures/twentyNewInternetBenchmarksGroundTruth.json";

export interface NewInternetBenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  category: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  gender: "Male" | "Female";
  expectedCareerCode: string;
  expectedCareerDesc: string;
  maritalStatusGroundTruth: string;
  maritalStatusInput?: "married" | "unmarried";
  expectedMarriageVerdict: "already_married" | "delayed_marriage" | "lifelong_celibacy_denial" | "assured_marriage";
  isExpectedTeetotaler: boolean;
  teetotalerEvidence: string;
  romanticAffairsGroundTruth: string;
  currentLifeSituation: string;
  expectedCurrentLifeCategory: string;
  currentDashaFocus: string;
}

const BENCHMARKS: NewInternetBenchmarkProfile[] = groundTruthData as NewInternetBenchmarkProfile[];

describe("20 New Internet Benchmark Profiles Ground-Truth Fidelity Audit", () => {
  for (const person of BENCHMARKS) {
    it(`evaluates ${person.name} (${person.publicRole}) with 100% fidelity`, () => {
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

      const topCodes = diag.accurateProfession?.topSuitableFields?.slice(0, 3).map(f => f.fieldCode) || [];
      const primaryCode = diag.accurateProfession?.code;
      const marriageVerdict = diag.marriageDestiny?.verdict;
      const teetotalerStatus = diet.isTeetotaler;

      console.log(`[PROFILE EVAL] ${person.name}:
  Career: expected=${person.expectedCareerCode}, got primary=${primaryCode}, top3=${topCodes.join(", ")}
  Marriage: expected=${person.expectedMarriageVerdict}, got=${marriageVerdict}
  Teetotaler: expected=${person.isExpectedTeetotaler}, got=${teetotalerStatus}
  CurrentLifeSituation: got category=${diag.currentLifeSituation?.category}, titleKn=${diag.currentLifeSituation?.titleKn}
  Ascendant: ${kundli.ascendant.toFixed(1)}, Planets: ${kundli.planets.map(p => `${p.name}:H${p.house}`).join(" ")}`);

      // 1. Career Suitability & Accurate Profession Match
      expect(primaryCode).toBe(person.expectedCareerCode);

      // 2. Marriage Destiny Verdict Match
      expect(marriageVerdict).toBe(person.expectedMarriageVerdict);

      // 3. Diet / Teetotaler / Alcohol Lifestyle Match
      expect(teetotalerStatus).toBe(person.isExpectedTeetotaler);

      // 4. Current Life Phase & Dasha Bhukti Exists & Active
      expect(diag.prasthuthaSthiti.runningDashaSummary).toBeTruthy();
      expect(diag.dashaTiming?.timelineKn).toBeTruthy();

      // 5. Current Life Situation Real-Life Reality
      expect(diag.currentLifeSituation).toBeDefined();
      expect(diag.currentLifeSituation?.category).toBe(person.expectedCurrentLifeCategory);
      expect(diag.currentLifeSituation?.externalLifeRealityKn).toBeTruthy();
      expect(diag.currentLifeSituation?.internalMindsetKn).toBeTruthy();
      expect(diag.currentLifeSituation?.symptomsChecklistKn.length).toBeGreaterThanOrEqual(3);
      expect(diag.currentLifeSituation?.gokarnaRemedyKn).toContain("ಗೋಕರ್ಣ");
    });
  }
});
