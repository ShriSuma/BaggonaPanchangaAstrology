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
      gender: "Male"
    };

    const mockOutput: KundliOutput = {
      ascendant: 15.0,
      lagnaRashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      moonSign: { index: 3, sanskrit: "Karka", english: "Cancer" },
      sunSign: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      moonPada: 2,
      planets: [
        {
          name: PlanetName.Mars,
          degree: 15,
          isRetrograde: false,
          rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
          house: 1,
          nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwins" }
        },
        {
          name: PlanetName.Moon,
          degree: 10,
          isRetrograde: false,
          rashi: { index: 3, sanskrit: "Karka", english: "Cancer" },
          house: 4,
          nakshatra: { index: 7, sanskrit: "Pushya", english: "Pushya", deity: "Brihaspati" }
        }
      ],
      houses: Array.from({ length: 12 }, (_, i) => i * 30)
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

  it("accurately computes Badhaka Graha & Badhakesh based on Lagna modality across all modalities", () => {
    const createMockKundli = (lagnaRashiIndex: number): [KundliOutput, KundliInput] => {
      const input: KundliInput = {
        name: "Test Modality",
        birthDate: "1995-01-01",
        birthTime: "12:00",
        latitude: 12.97,
        longitude: 77.59,
        gender: "Male"
      };
      const output: KundliOutput = {
        ascendant: lagnaRashiIndex * 30 + 10,
        lagnaRashi: { index: lagnaRashiIndex, sanskrit: "Lagna", english: "Lagna" },
        moonSign: { index: 0, sanskrit: "Mesha", english: "Aries" },
        sunSign: { index: 8, sanskrit: "Dhanu", english: "Sagittarius" },
        moonPada: 1,
        planets: [
          {
            name: PlanetName.Moon,
            degree: 5,
            isRetrograde: false,
            rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
            house: 1,
            nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwins" }
          }
        ],
        houses: Array.from({ length: 12 }, (_, i) => i * 30)
      };
      return [output, input];
    };

    // 1. Chara (Cardinal) Lagna: Mesha (0) -> 11th house (Kumbha) -> Saturn
    const [charaOutput, charaInput] = createMockKundli(0);
    const charaReport = generateKundliRemedyReport(charaOutput, charaInput);
    expect(charaReport.badhakaAnalysis.modality).toBe("Chara");
    expect(charaReport.badhakaAnalysis.badhakaHouse).toBe(11);
    expect(charaReport.badhakaAnalysis.badhakeshGraha).toBe(PlanetName.Saturn);

    // 2. Sthira (Fixed) Lagna: Vrishabha (1) -> 9th house (Makara) -> Saturn
    const [sthiraOutput, sthiraInput] = createMockKundli(1);
    const sthiraReport = generateKundliRemedyReport(sthiraOutput, sthiraInput);
    expect(sthiraReport.badhakaAnalysis.modality).toBe("Sthira");
    expect(sthiraReport.badhakaAnalysis.badhakaHouse).toBe(9);
    expect(sthiraReport.badhakaAnalysis.badhakeshGraha).toBe(PlanetName.Saturn);

    // 3. Dvisvabhava (Dual) Lagna: Mithuna (2) -> 7th house (Dhanu) -> Jupiter
    const [dualOutput, dualInput] = createMockKundli(2);
    const dualReport = generateKundliRemedyReport(dualOutput, dualInput);
    expect(dualReport.badhakaAnalysis.modality).toBe("Dvisvabhava");
    expect(dualReport.badhakaAnalysis.badhakaHouse).toBe(7);
    expect(dualReport.badhakaAnalysis.badhakeshGraha).toBe(PlanetName.Jupiter);

    // Verify 5-language localization of Badhaka diagnosis & remedy
    expect(dualReport.badhakaAnalysis.modalityLabel.kn).toContain("ದ್ವಿಸ್ವಭಾವ");
    expect(dualReport.badhakaAnalysis.modalityLabel.hi).toContain("द्विस्वभाव");
    expect(dualReport.badhakaAnalysis.modalityLabel.te).toContain("ద్విస్వభావ");
    expect(dualReport.badhakaAnalysis.modalityLabel.ta).toContain("உபய");
    expect(dualReport.badhakaAnalysis.modalityLabel.en).toContain("Dual");
  });

  it("synthesizes authentic Medical-Grade Astrological Prescription (Vedic Chikitsa) with 15-20 day relief progression", () => {
    const input: KundliInput = {
      name: "Sadhaka Devotee",
      birthDate: "1988-08-20",
      birthTime: "06:15",
      latitude: 15.3,
      longitude: 75.1,
      gender: "Male"
    };
    const output: KundliOutput = {
      ascendant: 120, // Simha
      lagnaRashi: { index: 4, sanskrit: "Simha", english: "Leo" },
      moonSign: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" },
      sunSign: { index: 4, sanskrit: "Simha", english: "Leo" },
      moonPada: 4,
      planets: [
        {
          name: PlanetName.Sun,
          degree: 125,
          isRetrograde: false,
          rashi: { index: 4, sanskrit: "Simha", english: "Leo" },
          house: 1,
          nakshatra: { index: 9, sanskrit: "Magha", english: "Magha", deity: "Pitris" }
        },
        {
          name: PlanetName.Mars,
          degree: 140,
          isRetrograde: false,
          rashi: { index: 4, sanskrit: "Simha", english: "Leo" },
          house: 1,
          nakshatra: { index: 10, sanskrit: "Purva Phalguni", english: "Purva Phalguni", deity: "Bhaga" }
        }
      ],
      houses: Array.from({ length: 12 }, (_, i) => i * 30)
    };

    const report = generateKundliRemedyReport(output, input);
    const rx = report.vedicDoctorPrescription;

    // Verify Nidana
    expect(rx.nidana.primaryDosha).toBeTruthy();
    expect(rx.nidana.doshaLabel.kn).toBeTruthy();
    expect(rx.nidana.affectedNadis.kn).toBeTruthy();

    // Verify Anupana
    expect(rx.anupana.vehicleName.kn).toBeTruthy();
    expect(rx.anupana.preparationMethod.kn).toBeTruthy();
    expect(rx.anupana.intakeTiming.kn).toBeTruthy();

    // Verify Aushadha
    expect(rx.aushadha.beejaMantra.mantraNative.kn).toBeTruthy();
    expect(rx.aushadha.beejaMantra.dailyDosageCount.kn).toBeTruthy();
    expect(rx.aushadha.stotraKavacha.kn).toBeTruthy();
    expect(rx.aushadha.sacredSubstance.kn).toBeTruthy();

    // Verify Pathya & Apathya lists
    expect(rx.pathyaApathya.pathyaPrescribed.length).toBeGreaterThanOrEqual(3);
    expect(rx.pathyaApathya.apathyaProhibited.length).toBeGreaterThanOrEqual(3);

    // Verify Chikitsa Kala
    expect(rx.chikitsaKala.idealTimeWindow.kn).toBeTruthy();
    expect(rx.chikitsaKala.facingDirection.kn).toBeTruthy();

    // Verify 15-20 Day Relief Progression Milestones
    expect(rx.reliefMilestones.day1To3.stage.kn).toBeTruthy();
    expect(rx.reliefMilestones.day4To7.stage.kn).toBeTruthy();
    expect(rx.reliefMilestones.day8To14.stage.kn).toBeTruthy();
    expect(rx.reliefMilestones.day15To20.stage.kn).toBeTruthy();
    expect(rx.reliefMilestones.day15To20.observation.kn).toBeTruthy();
    expect(rx.reliefMilestones.day21To45.stage.kn).toBeTruthy();

    // Verify Dasha Adhidevata & Pratyadhidevata
    expect(report.dashaBhuktiAnalysis.adhidevata).toBeDefined();
    expect(report.dashaBhuktiAnalysis.adhidevata?.adhidevata.kn).toBeTruthy();
    expect(report.dashaBhuktiAnalysis.adhidevata?.pratyadhidevata.kn).toBeTruthy();
    expect(report.dashaBhuktiAnalysis.adhidevata?.sadhana.kn).toBeTruthy();
  });
});
