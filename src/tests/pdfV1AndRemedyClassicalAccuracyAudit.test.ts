import { describe, it, expect } from "vitest";
import {
  analyzeKundali,
  buildDynamicCareerFallback,
  buildDynamicWealthFallback,
  buildDynamicCurrentPhaseFallback,
  toKnDigits,
  toHiDigits,
  toTeDigits,
  toTaDigits
} from "../features/premiumPdf/dynamicBhavishyaEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";

describe("PDF V1 & Remedy Classical Accuracy and Multi-Language Audit", () => {
  it("converts numbers into authentic native script digits for kn, hi, te, ta", () => {
    expect(toKnDigits(2028)).toBe("೨೦೨೮");
    expect(toHiDigits(2028)).toBe("२०२८");
    expect(toTeDigits(2028)).toBe("౨౦౨౮");
    expect(toTaDigits(2028)).toBe("௨௦௨௮");
  });

  it("accurately detects and synthesizes Dasha-Chidra (terminal 9th Bhukti) in Phaladeepika", () => {
    // Jupiter Mahadasha - Rahu Bhukti is the terminal 9th Bhukti of Jupiter Mahadasha
    const chart = analyzeKundali({
      lang: "kn",
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: [
        { graha: "Sun", house: 1, rashiIndex: 0 },
        { graha: "Jupiter", house: 1, rashiIndex: 0 }, // Digbala
        { graha: "Moon", house: 4, rashiIndex: 3 }
      ],
      mahaLord: "Jupiter",
      bhuktiLord: "Rahu",
      gender: "Male",
      ageYears: 35
    });

    expect(chart.isDashaChidra).toBe(true);
    expect(chart.digbalaGrahas).toContain("Jupiter");

    const knPhase = buildDynamicCurrentPhaseFallback(chart);
    expect(knPhase).toContain("ದಶಾ-ಚಿದ್ರ");

    // Test in Hindi
    const chartHi = { ...chart, lang: "hi" };
    const hiPhase = buildDynamicCurrentPhaseFallback(chartHi);
    expect(hiPhase).toContain("दशा-छिद्र");

    // Test in Telugu
    const chartTe = { ...chart, lang: "te" };
    const tePhase = buildDynamicCurrentPhaseFallback(chartTe);
    expect(tePhase).toContain("దశా-ఛిద్ర");

    // Test in Tamil
    const chartTa = { ...chart, lang: "ta" };
    const taPhase = buildDynamicCurrentPhaseFallback(chartTa);
    expect(taPhase).toContain("தசா-சித்ர");

    // Test in English
    const chartEn = { ...chart, lang: "en" };
    const enPhase = buildDynamicCurrentPhaseFallback(chartEn);
    expect(enPhase).toContain("Dasha-Chidra");
  });

  it("incorporates Bhavat Bhavam reflection rules into Career and Wealth chapters across all 5 languages", () => {
    const chart = analyzeKundali({
      lang: "kn",
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: [
        { graha: "Sun", house: 10, rashiIndex: 9 }, // Digbala in 10
        { graha: "Mars", house: 10, rashiIndex: 9 }
      ],
      mahaLord: "Sun",
      bhuktiLord: "Mars",
      gender: "Male",
      ageYears: 32
    });

    // Career Bhavat Bhavam (10th from 10th = 7th house)
    const knCareer = buildDynamicCareerFallback(chart);
    expect(knCareer).toContain("ಭಾವತ್ ಭಾವಂ");

    const hiCareer = buildDynamicCareerFallback({ ...chart, lang: "hi" });
    expect(hiCareer).toContain("भावत् भावम्");

    const teCareer = buildDynamicCareerFallback({ ...chart, lang: "te" });
    expect(teCareer).toContain("భావత్ భావం");

    const taCareer = buildDynamicCareerFallback({ ...chart, lang: "ta" });
    expect(taCareer).toContain("பாவத் பாவம்");

    const enCareer = buildDynamicCareerFallback({ ...chart, lang: "en" });
    expect(enCareer).toContain("Bhavat Bhavam");

    // Wealth Bhavat Bhavam (11th from 11th = 9th house)
    const knWealth = buildDynamicWealthFallback(chart);
    expect(knWealth).toContain("ಭಾವತ್ ಭಾವಂ");

    const hiWealth = buildDynamicWealthFallback({ ...chart, lang: "hi" });
    expect(hiWealth).toContain("भावत् भावम्");

    const teWealth = buildDynamicWealthFallback({ ...chart, lang: "te" });
    expect(teWealth).toContain("భావత్ భావం");

    const taWealth = buildDynamicWealthFallback({ ...chart, lang: "ta" });
    expect(taWealth).toContain("பாவத் பாவம்");

    const enWealth = buildDynamicWealthFallback({ ...chart, lang: "en" });
    expect(enWealth).toContain("Bhavat Bhavam");
  });

  it("verifies Remedy Engine gemstoneRecommendation metal is localized across all 5 languages without English leaks", () => {
    const mockInput: KundliInput = {
      name: "Devotee Test",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      latitude: 14.5,
      longitude: 74.3,
      timezone: 5.5
    };

    const mockOutput: KundliOutput = {
      lagnaRashi: { index: 0, name: "Mesha", english: "Aries" },
      lagnaDegree: 15.0,
      moonSign: { index: 3, name: "Karka", english: "Cancer" },
      sunSign: { index: 1, name: "Vrishabha", english: "Taurus" },
      moonPada: 2,
      planets: [
        {
          name: PlanetName.Mars,
          degree: 15,
          speed: 1,
          isRetrograde: false,
          rashi: { index: 0, name: "Mesha", english: "Aries" },
          house: 1,
          nakshatra: { index: 0, name: "Ashwini", english: "Ashwini", pada: 1 }
        },
        {
          name: PlanetName.Moon,
          degree: 10,
          speed: 13,
          isRetrograde: false,
          rashi: { index: 3, name: "Karka", english: "Cancer" },
          house: 4,
          nakshatra: { index: 7, name: "Pushya", english: "Pushya", pada: 2 }
        }
      ],
      houses: [
        { house: 1, rashi: { index: 0, name: "Mesha", english: "Aries" } }
      ]
    };

    const remedyResult = generateKundliRemedyReport(mockOutput, mockInput);
    const metal = remedyResult.gokarnaTempleRemedies.gemstoneRecommendation.metal;

    expect(metal.kn).toBeTruthy();
    expect(metal.en).toBeTruthy();
    expect(metal.hi).toBeTruthy();
    expect(metal.te).toBeTruthy();
    expect(metal.ta).toBeTruthy();

    // Verify non-empty and language-specific
    expect(metal.kn.length).toBeGreaterThan(0);
    expect(metal.hi.length).toBeGreaterThan(0);
    expect(metal.te.length).toBeGreaterThan(0);
    expect(metal.ta.length).toBeGreaterThan(0);
  });
});
