import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { PlanetName } from "../core/AstroTypes";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { BENCHMARK_20_PROFILES, type BenchmarkProfile } from "../data/benchmarkProfiles20";
import {
  analyzeKundali,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicSummaryFallback,
  buildDynamicPrescriptions,
  buildDynamicSoulMirrorFallback,
  buildDynamicAnnualForecastFallback
} from "../features/premiumPdf/dynamicBhavishyaEngine";

describe("20 Benchmark Profiles Premium PDF V1 Accuracy & Sacred Prescriptions Audit", () => {
  it("verifies all 20 benchmark profiles are available with verified Rodden Rating AA", () => {
    expect(BENCHMARK_20_PROFILES).toHaveLength(20);
    for (const p of BENCHMARK_20_PROFILES) {
      expect(p.roddenRating).toBe("AA");
      expect(p.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.birthTime).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  // Audit all 20 benchmark profiles
  BENCHMARK_20_PROFILES.forEach((profile: BenchmarkProfile, index: number) => {
    it(`[Profile ${index + 1}/20] Audits ${profile.name} (${profile.ageBracket}, age ~${profile.approxAgeIn2026}, ${profile.gender})`, () => {
      // 1. Calculate Natal Kundli
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

      const moon = kundli.planets.find((p) => p.name === PlanetName.Moon);
      expect(moon).toBeDefined();
      const nakIndex = moon!.nakshatra.index;
      expect(nakIndex).toBeGreaterThanOrEqual(0);
      expect(nakIndex).toBeLessThan(27);

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

      // 2. Generate 5-Anga Synthesis & Prescriptions
      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        ...context,
        lang: "kn"
      });

      expect(synthesis).toBeDefined();
      expect(synthesis.prescriptions).toBeDefined();
      const { rudraksha, gemstoneRing } = synthesis.prescriptions;

      // 3. Audit Rudraksha & Nakshatra Alignment
      expect(rudraksha.mukhi).toBeGreaterThanOrEqual(1);
      expect(rudraksha.mukhi).toBeLessThanOrEqual(14);
      expect(rudraksha.nameKn).toContain("ಮುಖಿ");
      expect(rudraksha.nameEn).toContain("Mukhi");
      expect(rudraksha.deity.length).toBeGreaterThan(0);
      expect(rudraksha.wearingMethod.length).toBeGreaterThan(15);

      // Verify Nakshatra Rudraksha is populated
      expect(rudraksha.nakshatraNameKn).toBeTruthy();
      expect(rudraksha.nakshatraNameEn).toBeTruthy();
      expect(rudraksha.nakshatraMukhi).toBeGreaterThanOrEqual(1);
      expect(rudraksha.nakshatraMukhi).toBeLessThanOrEqual(14);
      expect(rudraksha.nakshatraDeityKn).toBeTruthy();
      expect(rudraksha.nakshatraWearingMethodKn).toBeTruthy();

      // 4. Audit Gemstone & Havala (Red Coral / Pravala) Recommendation
      expect(gemstoneRing.primaryGemstoneKn.length).toBeGreaterThan(0);
      expect(gemstoneRing.primaryGemstoneEn.length).toBeGreaterThan(0);
      expect(gemstoneRing.fingerKn.length).toBeGreaterThan(0);
      expect(gemstoneRing.metalKn.length).toBeGreaterThan(0);
      expect(gemstoneRing.activationDay.length).toBeGreaterThan(0);

      // Check Havala logic:
      // Mars is benefic for Aries(0), Cancer(3), Leo(4), Scorpio(7), Sagittarius(8), Pisces(11)
      const lagnaRashiIdx = kundli.lagnaRashi.index;
      const mars = kundli.planets.find((p) => p.name === PlanetName.Mars);
      const marsRashiIdx = mars ? mars.rashi.index : 0;
      const marsHouseFromLagna = ((marsRashiIdx - lagnaRashiIdx + 12) % 12) + 1;
      const isMarsDusthana = [6, 8, 12].includes(marsHouseFromLagna);
      const isMarsBeneficLagna = [0, 3, 4, 7, 8, 11].includes(lagnaRashiIdx);
      const isKujaNakshatra = (nakIndex % 9) === 4; // Mrigashira (4), Chitra (13), Dhanishta (22)
      const expectedHavala = isKujaNakshatra || (isMarsBeneficLagna && !isMarsDusthana);

      expect(gemstoneRing.isHavalaRecommended).toBe(expectedHavala);

      if (expectedHavala) {
        expect(gemstoneRing.havalaPrescriptionKn).toContain("ಹವಳ");
        expect(gemstoneRing.havalaPrescriptionKn).toContain("ಅನಾಮಿಕಾ");
        expect(gemstoneRing.havalaPrescriptionKn).toContain("ತಾಮ್ರ");
        expect(gemstoneRing.havalaPrescriptionKn).toContain("ಮಂಗಳವಾರ");
        expect(gemstoneRing.havalaPrescriptionKn).toContain("ತಾರಾಬಲ");

        expect(gemstoneRing.havalaPrescriptionEn).toContain("Red Coral");
        expect(gemstoneRing.havalaPrescriptionEn).toContain("Ring Finger");
        expect(gemstoneRing.havalaPrescriptionEn).toContain("Copper");
        expect(gemstoneRing.havalaPrescriptionEn).toContain("Tuesday");

        expect(gemstoneRing.consecrationTarasKn).toContain("ತಾರೆ");
        expect(gemstoneRing.consecrationTarasEn).toContain("Tara");
      }

      // 5. Audit Life-Stage Accuracy & Zero Contradictions
      const age = profile.approxAgeIn2026;
      const isInfantOrChild = age <= 12;
      const isSenior = age >= 60;

      // Dynamic Fallback Check
      const parsedChart = analyzeKundali({
        lagnaRashiIndex: kundli.lagnaRashi.index,
        moonRashiIndex: kundli.moonSign.index,
        moonNakshatraIndex: nakIndex,
        natalPlanets: kundli.planets.map((p, idx) => ({
          graha: p.name as any,
          name: p.name,
          rashiIndex: p.rashi.index,
          house: ((p.rashi.index - kundli.lagnaRashi.index + 12) % 12) + 1
        })),
        gender: profile.gender,
        ageYears: age,
        lang: "kn",
        name: profile.name,
        maritalStatus: profile.maritalStatus,
        hasChildren: profile.hasChildren ? "yes" : "no"
      });

      const dynamicSummary = buildDynamicSummaryFallback(parsedChart);
      expect(dynamicSummary.length).toBeGreaterThan(100);

      // Verify no inappropriate life-stage text for children/infants
      if (isInfantOrChild) {
        expect(dynamicSummary).not.toContain("ಕಳತ್ರ");
        expect(dynamicSummary).not.toContain("ದಾಂಪತ್ಯ ಸುಖ");
        expect(dynamicSummary).not.toContain("ಹೂಡಿಕೆ");
      }

      // Verify senior focus
      if (isSenior) {
        expect(dynamicSummary).toMatch(/ಆಧ್ಯಾತ್ಮಿಕ|ಶಾಂತಿ|ಆರೋಗ್ಯ|ನಿವೃತ್ತಿ|ಪರಮ ಸುಖ|ಚಿಂತನೆ/);
      }

      // 6. Audit Soul Mirror & Dynamic Prescriptions
      const soulMirror = buildDynamicSoulMirrorFallback(parsedChart);
      expect(soulMirror).toBeDefined();
      expect(soulMirror.elemental.firePercent + soulMirror.elemental.earthPercent + soulMirror.elemental.airPercent + soulMirror.elemental.waterPercent).toBe(100);
      expect(soulMirror.truth1Text.length).toBeGreaterThanOrEqual(80);
      expect(soulMirror.truth2Text.length).toBeGreaterThanOrEqual(80);
      expect(soulMirror.truth3Text.length).toBeGreaterThanOrEqual(80);

      const dynPresc = buildDynamicPrescriptions(parsedChart);
      expect(dynPresc.gemstone.length).toBeGreaterThan(0);
      expect(dynPresc.rudraksha.length).toBeGreaterThan(0);
      expect(dynPresc.ishtaDevata.length).toBeGreaterThan(0);
      expect(dynPresc.luckyNumbers.length).toBeGreaterThan(0);
      expect(dynPresc.luckyDays.length).toBeGreaterThan(0);

      // 7. Audit Dynamic Annual Forecast Fallback (Next 1-Year Master Forecast)
      const annualForecast = buildDynamicAnnualForecastFallback(parsedChart);
      expect(annualForecast).toBeDefined();
      expect(annualForecast.length).toBeGreaterThanOrEqual(500);
      const paras = annualForecast.split(/\n\n+/);
      expect(paras).toHaveLength(4);
      expect(paras[3]).toMatch(/^【.+】/);
    });
  });

  it("verifies 100% pure multi-language isolation with zero English tokens leaking into regional scripts", () => {
    const testProfile = BENCHMARK_20_PROFILES[0]!; // Rocky Barker
    const languages: ("kn" | "hi" | "te" | "ta")[] = ["kn", "hi", "te", "ta"];

    languages.forEach((lang) => {
      const parsed = analyzeKundali({
        lagnaRashiIndex: 3,
        moonRashiIndex: 7,
        moonNakshatraIndex: 16,
        natalPlanets: [
          { graha: "Sun", rashiIndex: 0, house: 10 },
          { graha: "Moon", rashiIndex: 7, house: 5 },
          { graha: "Mars", rashiIndex: 0, house: 10 }
        ],
        gender: "Male",
        ageYears: 25,
        lang,
        name: testProfile.name
      });

      const dynPresc = buildDynamicPrescriptions(parsed);
      const sm = buildDynamicSoulMirrorFallback(parsed);
      const af = buildDynamicAnnualForecastFallback(parsed);

      // Verify no Latin/English alphabet leaks into regional text
      const regionalPrescText = `${dynPresc.gemstone} ${dynPresc.rudraksha} ${dynPresc.ishtaDevata}`;
      const regionalSoulText = `${sm.truth1Text} ${sm.truth2Text} ${sm.truth3Text}`;
      const regionalAfText = af;

      // English letters pattern [a-zA-Z] should be 0 in regional texts
      const englishInPresc = regionalPrescText.match(/[a-zA-Z]/g) || [];
      const englishInSoul = regionalSoulText.match(/[a-zA-Z]/g) || [];
      const englishInAf = regionalAfText.match(/[a-zA-Z]/g) || [];

      expect(englishInPresc.length).toBe(0);
      expect(englishInSoul.length).toBe(0);
      expect(englishInAf.length).toBe(0);
    });
  });
});
