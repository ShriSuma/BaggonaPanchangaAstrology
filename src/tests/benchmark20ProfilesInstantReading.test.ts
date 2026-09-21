import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { PlanetName } from "../core/AstroTypes";
import {
  diagnoseCurrentLifeSituation,
  determineAccurateProfession,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { BENCHMARK_20_PROFILES, type BenchmarkProfile } from "../data/benchmarkProfiles20";

describe("20 Real-World Public Profiles Benchmark Suite & Instant Reading Accuracy Audit", () => {
  it("verifies all 20 benchmark profiles are loaded with Rodden Rating AA", () => {
    expect(BENCHMARK_20_PROFILES.length).toBe(20);
    for (const p of BENCHMARK_20_PROFILES) {
      expect(p.roddenRating).toBe("AA");
      expect(p.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.birthTime).toMatch(/^\d{2}:\d{2}$/);
      expect(p.latitude).toBeTypeOf("number");
      expect(p.longitude).toBeTypeOf("number");
    }
  });

  // Run audit for each of the 20 profiles
  BENCHMARK_20_PROFILES.forEach((profile: BenchmarkProfile, index: number) => {
    it(`[Profile ${index + 1}/20] Auditing ${profile.name} (${profile.ageBracket}, ${profile.gender}, age ~${profile.approxAgeIn2026})`, () => {
      const kundli = calculateKundli({
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude
      });

      expect(kundli).toBeDefined();
      expect(kundli.lagnaRashi).toBeDefined();
      expect(kundli.moonSign).toBeDefined();

      const moon = kundli.planets.find(p => p.name === PlanetName.Moon);

      const context = {
        devoteeName: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gender: profile.gender,
        devoteeAge: profile.approxAgeIn2026,
        maritalStatus: profile.maritalStatus,
        hasChildren: profile.hasChildren
      };

      // 1. Accurate Profession Determination
      const profession = determineAccurateProfession(kundli, context);
      expect(profession).toBeDefined();
      expect(profession.code).toBeDefined();

      // 2. Current Life Situation Diagnosis
      const diagnosis = diagnoseCurrentLifeSituation(kundli, context);
      expect(diagnosis).toBeDefined();
      expect(diagnosis.category).toBeDefined();
      expect(diagnosis.titleKn).toBeTruthy();
      expect(diagnosis.detailedRealityKn).toBeTruthy();

      // 3. Marriage Destiny Assessment
      const marriage = determineMarriageDestiny(kundli, context);
      expect(marriage).toBeDefined();
      expect(marriage.verdict).toBeDefined();

      // 4. Panchanga Anga Synthesis Output
      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        ...context,
        lang: "kn"
      });

      expect(synthesis).toBeDefined();
      expect(synthesis.panchanga.vara).toBeDefined();
      expect(synthesis.panchanga.tithi).toBeDefined();
      expect(synthesis.panchanga.nakshatra).toBeDefined();
      expect(synthesis.panchanga.yoga).toBeDefined();
      expect(synthesis.panchanga.karana).toBeDefined();
      expect(synthesis.prescriptions.rudraksha).toBeDefined();
      expect(synthesis.prescriptions.gemstoneRing).toBeDefined();
      expect(synthesis.goodBadAnalysis.goodTraits.length).toBeGreaterThan(0);
      expect(synthesis.goodBadAnalysis.badTraits.length).toBeGreaterThan(0);
      expect(synthesis.currentDiagnosis.astrologerTalkingPoints).toBeDefined();

      const topFields = (profession.topSuitableFields || []).slice(0, 3).map(f => `${f.fieldCode} (${f.suitabilityPercentage}%)`).join(", ");

      // Print comprehensive report line
      console.log(`[PROFILE #${index + 1}/20: ${profile.name.toUpperCase()}]`);
      console.log(`  Age Bracket: ${profile.ageBracket} (approx age: ${profile.approxAgeIn2026}, gender: ${profile.gender})`);
      console.log(`  Lagna: ${kundli.lagnaRashi.english} (${kundli.lagnaRashi.sanskrit}), Moon: ${kundli.moonSign.english} (${kundli.moonSign.sanskrit})`);
      console.log(`  Nakshatra: ${moon?.nakshatra?.english || "N/A"}`);
      console.log(`  Calculated Profession: ${profession.code} - ${profession.titleEn}`);
      console.log(`  Top Fields: ${topFields || profession.code}`);
      console.log(`  Calculated Life Diagnosis: ${diagnosis.category} - "${diagnosis.titleEn}"`);
      console.log(`  Marriage Destiny Verdict: ${marriage.verdict} - "${marriage.titleEn}"`);
      console.log(`  Internet Ground Truth:`);
      console.log(`    - Field: ${profile.internetGroundTruth.primaryFieldAndInterests.join("; ")}`);
      console.log(`    - Character: ${profile.internetGroundTruth.characterAndTemperament.join("; ")}`);
      console.log(`    - Current Life: ${profile.internetGroundTruth.currentLifeReality}`);
      console.log(`--------------------------------------------------------------------------------`);
    });
  });
});
