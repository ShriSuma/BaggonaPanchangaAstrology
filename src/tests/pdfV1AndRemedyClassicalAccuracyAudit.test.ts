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
import { generateAstrologicalPrescriptions } from "../core/PanchangaAngaSynthesisEngine";
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

  it("strictly enforces consistency between Premium PDF V1 and Remedy PDF for Vajra / Havala and Rudraksha", () => {
    // Test case: Taurus Lagna (Vrishabha - index 1), Moon in Krittika (Sun Nakshatra - index 2)
    // Venus rules Lagna -> Vajra (Diamond) is primary gemstone, 6 Mukhi Rudraksha is primary.
    // Sun rules Nakshatra -> 1 Mukhi Rudraksha is Nakshatra Rudraksha.
    // Havala MUST be strictly false because Taurus native wears Vajra, and Mars is 7th/12th Maraka.
    const taurusInput: KundliInput = {
      name: "Taurus Devotee",
      birthDate: "1988-05-10",
      birthTime: "06:30",
      latitude: 13.0,
      longitude: 77.5,
      gender: "Male"
    };

    const taurusOutput: KundliOutput = {
      ascendant: 45.0, // Taurus
      lagnaRashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      moonSign: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
      sunSign: { index: 0, sanskrit: "Mesha", english: "Aries" },
      moonPada: 1,
      planets: [
        {
          name: PlanetName.Venus,
          degree: 15,
          isRetrograde: false,
          rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" },
          house: 1,
          nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" }
        },
        {
          name: PlanetName.Moon,
          degree: 28,
          isRetrograde: false,
          rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
          house: 12,
          nakshatra: { index: 2, sanskrit: "Krittika", english: "Krittika", deity: "Agni" }
        },
        {
          name: PlanetName.Mars,
          degree: 10,
          isRetrograde: false,
          rashi: { index: 9, sanskrit: "Makara", english: "Capricorn" },
          house: 9,
          nakshatra: { index: 22, sanskrit: "Dhanishta", english: "Dhanishta", deity: "Vasus" }
        }
      ],
      houses: Array.from({ length: 12 }, (_, i) => (i * 30 + 45) % 360)
    };

    const remedyReport = generateKundliRemedyReport(taurusOutput, taurusInput);
    const { rudrakshaRecommendation, gemstoneRecommendation } = remedyReport.gokarnaTempleRemedies;

    // 1. Gemstone must be Vajra (Diamond)
    expect(gemstoneRecommendation.stone.kn).toContain("ವಜ್ರ");
    expect(gemstoneRecommendation.metal.kn).toContain("ಬೆಳ್ಳಿ");

    // 2. Rudraksha must include 6 Mukhi (Lagna - Venus) AND 1 Mukhi (Nakshatra - Sun)
    expect(rudrakshaRecommendation.mukhi.kn).toContain("6 ಮುಖಿ");
    expect(rudrakshaRecommendation.mukhi.kn).toContain("1 ಮುಖಿ");
    // Ensure no English "Mukhi" leak in Kannada
    expect(rudrakshaRecommendation.mukhi.kn).not.toMatch(/\bMukhi\b/);

    // 3. Verify Havala incompatibility guard: For Taurus, Havala is strictly prohibited
    const prescriptions = generateAstrologicalPrescriptions(taurusOutput);
    expect(prescriptions.gemstoneRing.isHavalaRecommended).toBe(false);
    expect(prescriptions.gemstoneRing.primaryGemstoneKn).toContain("ವಜ್ರ");

    // 4. Verify identical gemstone values across both engines
    expect(gemstoneRecommendation.stone.kn).toBe(
      `${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight})`
    );
    expect(gemstoneRecommendation.metal.kn).toBe(prescriptions.gemstoneRing.metalKn);
  });

  it("accurately computes Nakshatra-aligned Sacred Neck Wear (Sara), Vajra Master Rules, Black Color Advisory and Empirical Benchmarks across all 12 Lagnas", () => {
    const lagnaConfigs = [
      { lagna: 0, name: "Aries", vajraAllowed: false, blackAllowed: false },
      { lagna: 1, name: "Taurus", vajraAllowed: true, blackAllowed: true },
      { lagna: 2, name: "Gemini", vajraAllowed: true, blackAllowed: false },
      { lagna: 3, name: "Cancer", vajraAllowed: false, blackAllowed: false },
      { lagna: 4, name: "Leo", vajraAllowed: false, blackAllowed: false },
      { lagna: 5, name: "Virgo", vajraAllowed: true, blackAllowed: false },
      { lagna: 6, name: "Libra", vajraAllowed: true, blackAllowed: true },
      { lagna: 7, name: "Scorpio", vajraAllowed: false, blackAllowed: false },
      { lagna: 8, name: "Sagittarius", vajraAllowed: false, blackAllowed: false },
      { lagna: 9, name: "Capricorn", vajraAllowed: true, blackAllowed: true },
      { lagna: 10, name: "Aquarius", vajraAllowed: true, blackAllowed: true },
      { lagna: 11, name: "Pisces", vajraAllowed: false, blackAllowed: false }
    ];

    lagnaConfigs.forEach(({ lagna, name, vajraAllowed, blackAllowed }) => {
      const mockChart: KundliOutput = {
        ascendant: lagna * 30 + 15,
        lagnaRashi: { index: lagna, sanskrit: name, english: name },
        moonSign: { index: (lagna + 3) % 12, sanskrit: "MoonSign", english: "MoonSign" },
        sunSign: { index: (lagna + 1) % 12, sanskrit: "SunSign", english: "SunSign" },
        moonPada: 1,
        planets: [
          {
            name: PlanetName.Moon,
            degree: 140,
            isRetrograde: false,
            rashi: { index: 4, sanskrit: "Simha", english: "Leo" },
            house: 5,
            nakshatra: { index: 10, sanskrit: "Magha", english: "Magha", deity: "Pitris" }
          }
        ],
        houses: Array.from({ length: 12 }, (_, i) => (i * 30 + lagna * 30) % 360)
      };

      const mockInput: KundliInput = {
        name: `${name} Native`,
        birthDate: "1992-08-20",
        birthTime: "12:00",
        latitude: 12.97,
        longitude: 77.59,
        gender: "Female"
      };

      const prescriptions = generateAstrologicalPrescriptions(mockChart);
      const remedyReport = generateKundliRemedyReport(mockChart, mockInput);

      // 1. Nakshatra-aligned Neck Wear Sara verification
      expect(prescriptions.neckWearSara).toBeDefined();
      expect(prescriptions.neckWearSara?.pendantKn).toBeTruthy();
      expect(prescriptions.neckWearSara?.pendantEn).toBeTruthy();
      expect(prescriptions.neckWearSara?.pendantHi).toBeTruthy();
      expect(prescriptions.neckWearSara?.pendantTe).toBeTruthy();
      expect(prescriptions.neckWearSara?.pendantTa).toBeTruthy();
      expect(prescriptions.neckWearSara?.threadColorKn).toBeTruthy();
      expect(prescriptions.neckWearSara?.wearingProcedureKn).toContain("ವಿಶುದ್ಧ");

      // Verify Remedy Report parity for neck wear
      expect(remedyReport.gokarnaTempleRemedies.neckWearRecommendation).toBeDefined();
      expect(remedyReport.gokarnaTempleRemedies.neckWearRecommendation?.pendant.kn).toBe(
        prescriptions.neckWearSara?.pendantKn
      );

      // 2. Vajra Master Rules verification
      expect(prescriptions.gemstoneRing.vajraMasterRules).toBeDefined();
      expect(prescriptions.gemstoneRing.vajraMasterRules?.isVajraRecommended).toBe(vajraAllowed);
      if (vajraAllowed) {
        expect(prescriptions.gemstoneRing.vajraMasterRules?.verdictKn).toContain("ಶುಭಪ್ರದ ಭಾಗ್ಯವರ್ಧಕ");
        expect(prescriptions.gemstoneRing.vajraMasterRules?.substituteKn).toContain("ಝಿರ್ಕಾನ್");
      } else {
        expect(prescriptions.gemstoneRing.vajraMasterRules?.verdictKn).toContain("ನಿಷೇಧಿಸಲಾಗಿದೆ");
        expect(prescriptions.gemstoneRing.vajraMasterRules?.substituteKn).toContain("ಪರ್ಯಾಯ ರತ್ನ");
      }
      expect(remedyReport.gokarnaTempleRemedies.vajraMasterRules?.isVajraRecommended).toBe(vajraAllowed);

      // 3. Black Color Advisory verification
      expect(prescriptions.luckyAttributes.blackColorAdvisory).toBeDefined();
      expect(prescriptions.luckyAttributes.blackColorAdvisory?.isBlackFavorable).toBe(blackAllowed);
      if (blackAllowed) {
        expect(prescriptions.luckyAttributes.blackColorAdvisory?.statusKn).toContain("ಶುಭ & ರಕ್ಷಾ ಕವಚ");
      } else {
        expect(prescriptions.luckyAttributes.blackColorAdvisory?.statusKn).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ");
      }
      expect(remedyReport.gokarnaTempleRemedies.blackColorAdvisory?.isBlackFavorable).toBe(blackAllowed);

      // 4. Empirical Benchmark Case Study verification (from 100 Case Archives)
      expect(prescriptions.benchmarkCaseStudy).toBeDefined();
      expect(prescriptions.benchmarkCaseStudy?.titleKn).toBeTruthy();
      expect(prescriptions.benchmarkCaseStudy?.wrongItemKn).toBeTruthy();
      expect(prescriptions.benchmarkCaseStudy?.adverseOutcomeKn).toBeTruthy();
      expect(prescriptions.benchmarkCaseStudy?.rootCauseKn).toBeTruthy();
      expect(prescriptions.benchmarkCaseStudy?.turnaroundKn).toBeTruthy();
      expect(remedyReport.gokarnaTempleRemedies.benchmarkCaseStudy?.id).toBe(
        prescriptions.benchmarkCaseStudy?.id
      );
    });
  });
});
