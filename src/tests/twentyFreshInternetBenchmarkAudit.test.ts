import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge
} from "../core/PanchangaAngaSynthesisEngine";
import { buildDeterministicFirstSixPoints } from "../core/instantReadingTalkingPointsEngine";
import { BENCHMARK_PROFILES_20_FRESH } from "../data/benchmarkProfiles20Fresh";

describe("20 Fresh Internet Benchmark Profiles Audit (Career, Marriage, Life Phase & Destiny Catalysts)", () => {
  let careerMatches = 0;
  let marriageMatches = 0;
  let situationMatches = 0;
  let catalystsMatches = 0;

  for (const profile of BENCHMARK_PROFILES_20_FRESH) {
    it(`evaluates ${profile.name} (${profile.publicRole}) with >=90% fidelity & destiny catalysts`, () => {
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
        maritalStatus: profile.maritalStatusInput,
        lang: "kn"
      });

      const diag = synthesis.currentDiagnosis;
      const catalysts = synthesis.destinyCatalysts;

      // 1. Career Accuracy
      const primaryCode = diag.accurateProfession?.code;
      const topCodes = diag.accurateProfession?.topSuitableFields?.slice(0, 3).map((f) => f.fieldCode) || [];
      const careerMatched = profile.expectedCareerCodes.includes(primaryCode as any) ||
        topCodes.some((tc) => profile.expectedCareerCodes.includes(tc as any));
      if (careerMatched) careerMatches++;

      // 2. Marriage Destiny Accuracy
      const marriageVerdict = diag.marriageDestiny?.verdict;
      const marriageMatched = marriageVerdict === profile.expectedMarriageVerdict;
      if (marriageMatched) marriageMatches++;

      // 3. Current Life Situation Accuracy
      const currentCategory = diag.currentLifeSituation?.category;
      const situationMatched = profile.expectedLifeCategories.includes(currentCategory as any);
      if (situationMatched) situationMatches++;

      // 4. Destiny Catalysts & Lucky Charms Verification
      expect(catalysts).toBeDefined();
      expect(catalysts?.gemstoneRingCatalyst.yogakarakaGemstoneKn).toBeTruthy();
      expect(catalysts?.gemstoneRingCatalyst.prescribedRingFingerKn).toBeTruthy();
      expect(catalysts?.gemstoneRingCatalyst.catalyticImpactKn).toBeTruthy();

      expect(catalysts?.marriageBhagya.detailedExplanationKn).toBeTruthy();
      expect(catalysts?.marriageBhagya.bhagyaIntensityKn).toBeTruthy();

      expect(catalysts?.daughterBhagya.lakshmiArrivalImpactKn).toBeTruthy();
      expect(catalysts?.daughterBhagya.astrologicalBasisKn).toBeTruthy();

      expect(catalysts?.nameSoundVibration.janmaPadaNumber).toBeGreaterThanOrEqual(1);
      expect(catalysts?.nameSoundVibration.recommendedStartingSyllablesKn.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.nameSoundVibration.vibrationHarmonyAnalysisKn).toBeTruthy();

      // Why Felt Unlucky & Why Luck Unlocks Now verification
      expect(catalysts?.whyFeltUnlucky.explanationKn).toBeTruthy();
      expect(catalysts?.whyFeltUnlucky.astrologicalReasonKn).toBeTruthy();
      expect(catalysts?.whyLuckUnlocksNow.explanationKn).toBeTruthy();
      expect(catalysts?.whyLuckUnlocksNow.timingWindowKn).toBeTruthy();

      // Relocation Bhagya & Stree Bhagya verification
      expect(catalysts?.relocationBhagya.explanationKn).toBeTruthy();
      expect(catalysts?.relocationBhagya.favorableDirectionsKn).toBeTruthy();
      expect(catalysts?.streeBhagya.luckyPersonKn).toBeTruthy();
      expect(catalysts?.streeBhagya.explanationKn).toBeTruthy();

      // Spiritual Temple & Lucky Matrix verification
      expect(catalysts?.spiritualTempleCatalyst.templeKn).toBeTruthy();
      expect(catalysts?.spiritualTempleCatalyst.remedyDetailsKn).toBeTruthy();
      expect(catalysts?.luckyMatrix.ageOfAwakening).toBeGreaterThanOrEqual(21);
      expect(catalysts?.luckyMatrix.luckyNumbers.length).toBeGreaterThanOrEqual(2);
      expect(catalysts?.luckyMatrix.luckyDaysKn.length).toBeGreaterThanOrEqual(2);
      expect(catalysts?.luckyMatrix.vehicleColorsKn.length).toBeGreaterThanOrEqual(1);

      // 4.1 Lucky & Unlucky Audit Comprehensive Verification
      expect(catalysts?.luckAudit).toBeDefined();
      expect(catalysts?.luckAudit.whyFeelingLucky.titleKn).toBeTruthy();
      expect(catalysts?.luckAudit.whyFeelingLucky.overviewKn).toBeTruthy();
      expect(catalysts?.luckAudit.whyFeelingLucky.janmaKundliGraceKn).toBeTruthy();
      expect(catalysts?.luckAudit.whyFeelingLucky.gocharaTransitGraceKn).toBeTruthy();
      expect(catalysts?.luckAudit.whyFeelingLucky.dashaBhuktiGraceKn).toBeTruthy();
      expect(catalysts?.luckAudit.primaryLuckyCatalystsKn.length).toBeGreaterThanOrEqual(2);
      expect(catalysts?.luckAudit.realLifeLuckExamples.length).toBe(4);
      for (const ex of catalysts!.luckAudit.realLifeLuckExamples) {
        expect(ex.titleKn).toBeTruthy();
        expect(ex.scenarioKn).toBeTruthy();
        expect(ex.triggerKn).toBeTruthy();
      }

      expect(catalysts?.unluckyAudit).toBeDefined();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.titleKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.overviewKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.janmaKundliCauseKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.gocharaTransitCauseKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.dashaBhuktiCauseKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.whyFeelingUnlucky.karmicCrucibleKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.unluckyThingsAndTriggers.length).toBe(5);
      expect(catalysts?.unluckyAudit.realLifeUnluckyExamples.length).toBe(4);
      for (const ex of catalysts!.unluckyAudit.realLifeUnluckyExamples) {
        expect(ex.titleKn).toBeTruthy();
        expect(ex.scenarioKn).toBeTruthy();
        expect(ex.triggerKn).toBeTruthy();
      }

      expect(catalysts?.unluckyAudit.unluckyMatrix.inimicalRashisKn.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.unluckyAudit.unluckyMatrix.unluckyDaysKn.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.unluckyAudit.unluckyMatrix.unluckyDirectionsKn.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.unluckyAudit.unluckyMatrix.unluckyColorsKn.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.unluckyAudit.unluckyMatrix.avoidNumbers.length).toBeGreaterThanOrEqual(1);
      expect(catalysts?.unluckyAudit.unluckyMatrix.strictlyAvoidActivitiesKn.length).toBeGreaterThanOrEqual(3);

      expect(catalysts?.unluckyAudit.unluckyRemediesAndShields.protectiveMantraKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.unluckyRemediesAndShields.protectiveKshetraKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.unluckyRemediesAndShields.dailyShieldHabitKn).toBeTruthy();
      expect(catalysts?.unluckyAudit.unluckyRemediesAndShields.dosAndDontsKn.length).toBeGreaterThanOrEqual(3);

      // Prescriptions synchronization
      expect(synthesis.prescriptions.gemstoneRing.yogakarakaGemstoneKn).toBeTruthy();
      expect(synthesis.prescriptions.gemstoneRing.bhagyaGemstoneKn).toBeTruthy();

      // Instant Reading Talking Points synchronization (Card 6)
      const sessionMock = {
        input: { name: profile.name, gender: profile.gender },
        result: {
          lagnaRashi: kundli.lagnaRashi,
          moonSign: kundli.moonSign,
          planets: kundli.planets,
          maandi: kundli.maandi
        }
      };
      const structuredPoints = buildDeterministicFirstSixPoints(synthesis, sessionMock, true);
      const card6Points = structuredPoints.immediateTurningPoint;
      expect(card6Points.length).toBeGreaterThanOrEqual(12);

      const hasYogakarakaPoint = card6Points.some((p) => p.text.includes("ಯೋಗಕಾರಕ ರತ್ನ") || p.tagKn === "ಸಿದ್ಧ ರತ್ನ ಧಾರಣೆ");
      const hasMarriagePoint = card6Points.some((p) => p.text.includes("ಕಳತ್ರ ಭಾಗ್ಯೋದಯ") || p.tagKn === "ಕಳತ್ರ ಭಾಗ್ಯೋದಯ");
      const hasDaughterPoint = card6Points.some((p) => p.text.includes("ಪುತ್ರಿ ಭಾಗ್ಯ") || p.tagKn === "ಗೃಹಲಕ್ಷ್ಮೀ ಯೋಗ");
      const hasNameVibrationPoint = card6Points.some((p) => p.text.includes("ನಾಮಾಕ್ಷರ ಕಂಪನ") || p.tagKn === "ನಾಮಾಕ್ಷರ ಕಂಪನ");

      expect(hasYogakarakaPoint).toBe(true);
      expect(hasMarriagePoint).toBe(true);
      expect(hasDaughterPoint).toBe(true);
      expect(hasNameVibrationPoint).toBe(true);

      catalystsMatches++;

      console.log(`[VERIFIED] ${profile.name}:
  Career: ${primaryCode} (Expected: ${profile.expectedCareerCodes.join(", ")}) => ${careerMatched ? "MATCH" : "DIFF"}
  Marriage: ${marriageVerdict} (Expected: ${profile.expectedMarriageVerdict}) => ${marriageMatched ? "MATCH" : "DIFF"}
  Life Situation: ${currentCategory} (Expected: ${profile.expectedLifeCategories.join(", ")}) => ${situationMatched ? "MATCH" : "DIFF"}
  Yogakaraka Gemstone: ${catalysts?.gemstoneRingCatalyst.yogakarakaGemstoneKn} on ${catalysts?.gemstoneRingCatalyst.prescribedRingFingerKn}
  Sound Frequency Syllables (Pada ${catalysts?.nameSoundVibration.janmaPadaNumber}): ${catalysts?.nameSoundVibration.recommendedStartingSyllablesKn.join(", ")}`);

      expect(careerMatched).toBe(true);
      expect(marriageMatched).toBe(true);
      expect(situationMatched).toBe(true);
    });
  }

  it("achieves >= 90% benchmark accuracy across all 20 fresh profiles", () => {
    const total = BENCHMARK_PROFILES_20_FRESH.length;
    const careerPct = (careerMatches / total) * 100;
    const marriagePct = (marriageMatches / total) * 100;
    const situationPct = (situationMatches / total) * 100;
    const catalystsPct = (catalystsMatches / total) * 100;

    console.log(`\n======================================================`);
    console.log(`20 FRESH INTERNET BENCHMARK PROFILES FINAL SCORECARD:`);
    console.log(`Career Accuracy: ${careerMatches}/${total} (${careerPct.toFixed(1)}%)`);
    console.log(`Marriage Accuracy: ${marriageMatches}/${total} (${marriagePct.toFixed(1)}%)`);
    console.log(`Current Life Situation Accuracy: ${situationMatches}/${total} (${situationPct.toFixed(1)}%)`);
    console.log(`Destiny Catalysts & Lucky Charms: ${catalystsMatches}/${total} (${catalystsPct.toFixed(1)}%)`);
    console.log(`======================================================\n`);

    expect(careerPct).toBeGreaterThanOrEqual(90);
    expect(marriagePct).toBeGreaterThanOrEqual(90);
    expect(situationPct).toBeGreaterThanOrEqual(90);
    expect(catalystsPct).toBe(100);
  });
});
