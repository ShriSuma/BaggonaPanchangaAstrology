import { describe, it, expect } from "vitest";
import {
  GEMSTONE_100_BENCHMARK_PROFILES,
  getBenchmarkProfilesByCategory,
  getBenchmarkProfilesByOutcome,
  getBenchmarkProfileById,
  getGemstoneAuditStatistics,
  type BenchmarkCaseStudy
} from "../core/gemstoneBenchmark100Profiles";
import {
  confirmGemstoneSuitability,
  generateGemstoneConsultationAnswer,
  evaluateGemstoneAndAmuletPrescription,
  getNakshatraDignityInfo,
  NAKSHATRA_DIGNITY_CATALOG,
  GEMSTONE_REAL_LIFE_BENCHMARK_CASES
} from "../core/panchangaGemstoneAmuletEngine";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

function createMockKundli(
  lagnaIdx: number,
  planetsConfig: Array<{ name: PlanetName; rashiIdx: number; nakshatraIdx?: number; nakshatraName?: string }>
): KundliOutput {
  const RASHI_NAMES = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const RASHI_SANSKRIT = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"
  ];

  const lagnaEnglish = RASHI_NAMES[lagnaIdx] || "Aries";
  const lagnaSanskrit = RASHI_SANSKRIT[lagnaIdx] || "Mesha";

  const planets = planetsConfig.map(p => ({
    name: p.name,
    rashi: {
      index: p.rashiIdx,
      name: p.name,
      english: RASHI_NAMES[p.rashiIdx] || "Aries",
      sanskrit: RASHI_SANSKRIT[p.rashiIdx] || "Mesha"
    },
    nakshatra: {
      index: p.nakshatraIdx ?? 0,
      english: p.nakshatraName ?? "Ashwini",
      pada: 1
    }
  }));

  // Ensure Moon is present
  if (!planets.some(p => p.name === PlanetName.Moon)) {
    planets.push({
      name: PlanetName.Moon,
      rashi: { index: lagnaIdx, name: PlanetName.Moon, english: lagnaEnglish, sanskrit: lagnaSanskrit },
      nakshatra: { index: 0, english: "Ashwini", pada: 1 }
    });
  }

  return {
    lagnaRashi: {
      index: lagnaIdx,
      name: "Lagna",
      english: lagnaEnglish,
      sanskrit: lagnaSanskrit
    },
    moonSign: {
      index: planets.find(p => p.name === PlanetName.Moon)?.rashi.index ?? lagnaIdx,
      name: "MoonSign",
      english: lagnaEnglish,
      sanskrit: lagnaSanskrit
    },
    planets
  } as unknown as KundliOutput;
}

describe("100 Benchmark Gemstone Empirical Audit (೧೦೦ ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ ಕೇಸ್ ಸ್ಟಡಿಗಳು)", () => {
  it("contains exactly 100 comprehensive, non-empty benchmark profiles", () => {
    expect(GEMSTONE_100_BENCHMARK_PROFILES.length).toBe(100);
    expect(GEMSTONE_REAL_LIFE_BENCHMARK_CASES.length).toBe(100);

    for (let i = 0; i < 100; i++) {
      const p = GEMSTONE_100_BENCHMARK_PROFILES[i];
      expect(p.id).toBe(i + 1);
      expect(p.titleKn.trim().length).toBeGreaterThan(5);
      expect(p.titleEn.trim().length).toBeGreaterThan(5);
      expect(p.nativeProfileKn.trim().length).toBeGreaterThan(5);
      expect(p.nativeProfileEn.trim().length).toBeGreaterThan(5);
      expect(p.wrongItemWornKn.trim().length).toBeGreaterThan(5);
      expect(p.wrongItemWornEn.trim().length).toBeGreaterThan(5);
      expect(p.adverseOutcomeKn.trim().length).toBeGreaterThan(5);
      expect(p.adverseOutcomeEn.trim().length).toBeGreaterThan(5);
      expect(p.astrologicalRootCauseKn.trim().length).toBeGreaterThan(5);
      expect(p.astrologicalRootCauseEn.trim().length).toBeGreaterThan(5);
      expect(p.correctedPrescriptionKn.trim().length).toBeGreaterThan(5);
      expect(p.correctedPrescriptionEn.trim().length).toBeGreaterThan(5);
      expect(p.verifiedTurnaroundKn.trim().length).toBeGreaterThan(5);
      expect(p.verifiedTurnaroundEn.trim().length).toBeGreaterThan(5);
      expect(p.gemstoneCategory).toBeTruthy();
      expect(["LIFT_POSITIVE", "DOWNFALL_NEGATIVE"]).toContain(p.outcomeType);
    }
  });

  it("provides balanced representation of both positive lifts and adverse downfalls", () => {
    const stats = getGemstoneAuditStatistics();
    expect(stats.total).toBe(100);
    expect(stats.lifts).toBeGreaterThanOrEqual(40);
    expect(stats.downfalls).toBeGreaterThanOrEqual(40);
    expect(stats.lifts + stats.downfalls).toBe(100);

    // Verify key categories are audited
    expect(stats.categoryBreakdown["Vajra_Diamond"]).toBeGreaterThanOrEqual(10);
    expect(stats.categoryBreakdown["Pushparaga_YellowSapphire"]).toBeGreaterThanOrEqual(10);
    expect(stats.categoryBreakdown["Neelam_BlueSapphire"]).toBeGreaterThanOrEqual(15);
    expect(stats.categoryBreakdown["Gomed_Rahu_Black"]).toBeGreaterThanOrEqual(10);
    expect(stats.categoryBreakdown["Pavala_RedCoral"]).toBeGreaterThanOrEqual(10);
    expect(stats.categoryBreakdown["Panna_Emerald"]).toBeGreaterThanOrEqual(8);
  });

  it("audits iconic public case studies (Bachchan, Taylor, Monroe, Diana, Dutt)", () => {
    // Amitabh Bachchan: Profile #53
    const bachchan = getBenchmarkProfileById(53);
    expect(bachchan).toBeDefined();
    expect(bachchan?.titleEn).toContain("Amitabh Bachchan");
    expect(bachchan?.outcomeType).toBe("LIFT_POSITIVE");

    // Elizabeth Taylor: Profile #29
    const taylor = getBenchmarkProfileById(29);
    expect(taylor).toBeDefined();
    expect(taylor?.titleEn).toContain("Elizabeth Taylor");
    expect(taylor?.outcomeType).toBe("DOWNFALL_NEGATIVE");

    // Marilyn Monroe: Profile #30
    const monroe = getBenchmarkProfileById(30);
    expect(monroe).toBeDefined();
    expect(monroe?.titleEn).toContain("Marilyn Monroe");
    expect(monroe?.outcomeType).toBe("DOWNFALL_NEGATIVE");

    // Princess Diana: Profile #54
    const diana = getBenchmarkProfileById(54);
    expect(diana).toBeDefined();
    expect(diana?.titleEn).toContain("Princess Diana");
    expect(diana?.outcomeType).toBe("DOWNFALL_NEGATIVE");

    // Sanjay Dutt: Profile #48
    const dutt = getBenchmarkProfileById(48);
    expect(dutt).toBeDefined();
    expect(dutt?.titleEn).toContain("Sanjay Dutt");
    expect(dutt?.outcomeType).toBe("LIFT_POSITIVE");
  });
});

describe("Vedic Multi-Factor Gemstone Confirmation Engine (ಪಂಚಾಂಗ & ಗ್ರಹ ದೃಢೀಕರಣ ಎಂಜಿನ್)", () => {
  it("strictly prohibits Yellow Sapphire (Pushparaga) for Tula (Libra) Ascendant with 6th lord warnings", () => {
    // Libra Lagna (idx 6)
    const libraChart = createMockKundli(6, [
      { name: PlanetName.Venus, rashiIdx: 6 }, // Venus in Libra Lagna
      { name: PlanetName.Jupiter, rashiIdx: 8 }, // Jupiter in Sagittarius (3rd house)
      { name: PlanetName.Moon, rashiIdx: 6, nakshatraName: "Swati" }
    ]);

    const result = confirmGemstoneSuitability(libraChart, {
      gemstoneOrPlanet: "Pushparaga"
    });

    expect(result.isConfirmed).toBe(false);
    expect(result.confidenceScore).toBeLessThanOrEqual(10);
    expect(result.primaryAlertEn).toContain("STRICT PROHIBITION");
    expect(result.primaryAlertEn).toContain("3rd and 6th houses");
    expect(result.primaryAlertKn).toContain("ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ಎಚ್ಚರಿಕೆ");
    expect(result.tulaControversyExplanationEn).toContain("Functional Nature");
    expect(result.tulaControversyExplanationKn).toContain("ಪರಾಶರ");
  });

  it("approves Diamond (Vajra) for Tula (Libra) Ascendant when Venus is well-placed", () => {
    // Libra Lagna with Venus in 1st house (Swakshetra)
    const libraChart = createMockKundli(6, [
      { name: PlanetName.Venus, rashiIdx: 6 }, // Venus in Libra (1st house)
      { name: PlanetName.Saturn, rashiIdx: 6 }, // Saturn exalted in Libra (Shasha Yoga)
      { name: PlanetName.Moon, rashiIdx: 6, nakshatraName: "Chitra" }
    ]);

    const result = confirmGemstoneSuitability(libraChart, {
      gemstoneOrPlanet: "Diamond"
    });

    expect(result.isConfirmed).toBe(true);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(90);
    expect(result.tulaControversyExplanationEn).toContain("Lagnadhipati na dosham");
    expect(result.tulaControversyExplanationKn).toContain("ಲಗ್ನಾಧಿಪತಯೇ ನ ದೋಷಃ");
  });

  it("cautions against Diamond for Tula when Venus is debilitated in 6th Virgo without cancellation", () => {
    // Libra Lagna with Venus in 6th Virgo (Debilitated)
    const libraChart = createMockKundli(6, [
      { name: PlanetName.Venus, rashiIdx: 5 }, // Venus debilitated in Virgo (6th house)
      { name: PlanetName.Mercury, rashiIdx: 2 }, // Mercury in Gemini (no Kendra neechabhanga)
      { name: PlanetName.Moon, rashiIdx: 6, nakshatraName: "Swati" }
    ]);

    const result = confirmGemstoneSuitability(libraChart, {
      gemstoneOrPlanet: "Vajra"
    });

    expect(result.isConfirmed).toBe(false);
    expect(result.confidenceScore).toBeLessThan(50);
    expect(result.primaryAlertEn).toContain("debilitated in the 6th house");
    expect(result.primaryAlertKn).toContain("ಕನ್ಯಾ ರಾಶಿಯಲ್ಲಿ ನೀಚನಾಗಿದ್ದು");
  });

  it("evaluates Rahu & Black Color / Hessonite: Approved in Upachaya (3, 6, 11) vs Prohibited in Kendra/Dusthana", () => {
    // Taurus Lagna (idx 1) with Rahu in 11th Pisces (Upachaya)
    const taurusRahuUpachaya = createMockKundli(1, [
      { name: PlanetName.Venus, rashiIdx: 1 },
      { name: PlanetName.Rahu, rashiIdx: 11 }, // 11th house from Taurus
      { name: PlanetName.Moon, rashiIdx: 1, nakshatraName: "Rohini" }
    ]);

    const resultUpachaya = confirmGemstoneSuitability(taurusRahuUpachaya, {
      gemstoneOrPlanet: "Gomed"
    });
    expect(resultUpachaya.isConfirmed).toBe(true);
    expect(resultUpachaya.confidenceScore).toBeGreaterThanOrEqual(85);
    expect(resultUpachaya.rahuBlackColorExplanationEn).toContain("Upachaya House");

    // Aries Lagna (idx 0) with Rahu in 1st Aries (Kendra/Lagna with Moon)
    const ariesRahuLagna = createMockKundli(0, [
      { name: PlanetName.Mars, rashiIdx: 0 },
      { name: PlanetName.Rahu, rashiIdx: 0 }, // 1st house
      { name: PlanetName.Moon, rashiIdx: 0, nakshatraName: "Ashwini" }
    ]);

    const resultKendra = confirmGemstoneSuitability(ariesRahuLagna, {
      gemstoneOrPlanet: "Black color and Gomed"
    });
    expect(resultKendra.isConfirmed).toBe(false);
    expect(resultKendra.confidenceScore).toBeLessThanOrEqual(20);
    expect(resultKendra.primaryAlertEn).toContain("STRICT AVOID");
    expect(resultKendra.primaryAlertEn).toContain("hallucinations");
  });

  it("recognizes Yogakaraka planets with high confidence scores", () => {
    // Capricorn Lagna (idx 9) + Venus (rules 5th & 10th Yogakaraka)
    const capricornChart = createMockKundli(9, [
      { name: PlanetName.Saturn, rashiIdx: 9 },
      { name: PlanetName.Venus, rashiIdx: 1 }, // Venus in Taurus (5th house)
      { name: PlanetName.Moon, rashiIdx: 9, nakshatraName: "Shravana" }
    ]);

    const result = confirmGemstoneSuitability(capricornChart, {
      gemstoneOrPlanet: "Diamond"
    });
    expect(result.isConfirmed).toBe(true);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(85);
    expect(result.lagnaLordshipAnalysisEn).toContain("supreme Yogakaraka");

    // Cancer Lagna (idx 3) + Saturn (rules 7th Maraka & 8th Dusthana)
    const cancerChart = createMockKundli(3, [
      { name: PlanetName.Moon, rashiIdx: 3, nakshatraName: "Pushya" },
      { name: PlanetName.Saturn, rashiIdx: 9 }
    ]);

    const saturnResult = confirmGemstoneSuitability(cancerChart, {
      gemstoneOrPlanet: "Neelam"
    });
    expect(saturnResult.isConfirmed).toBe(false);
    expect(saturnResult.confidenceScore).toBeLessThanOrEqual(20);
    expect(saturnResult.primaryAlertEn).toContain("DANGEROUS DUSTHANA LORD");
  });

  it("detects divine Guru Drishti (Jupiter aspect) purifying chart afflictions", () => {
    // Mars in Cancer (debilitated), but Jupiter in Pisces casting 5th house trine aspect on Cancer
    const marsAfflictedWithGuruDrishti = createMockKundli(0, [
      { name: PlanetName.Mars, rashiIdx: 3 }, // Cancer (idx 3)
      { name: PlanetName.Jupiter, rashiIdx: 11 }, // Pisces (idx 11) -> 5th aspect reaches Cancer (11+4=15%12=3)
      { name: PlanetName.Moon, rashiIdx: 0, nakshatraName: "Ashwini" }
    ]);

    const result = confirmGemstoneSuitability(marsAfflictedWithGuruDrishti, {
      gemstoneOrPlanet: "Red Coral"
    });

    expect(result.aspectDrishtiAnalysisEn).toContain("Guru Drishti");
    expect(result.aspectDrishtiAnalysisKn).toContain("ಅಮೃತ ದೃಷ್ಟಿ");
  });

  it("seamlessly handles consultation queries addressing Tula, Pushparaga, Diamond, and Rahu", () => {
    const libraChart = createMockKundli(6, [
      { name: PlanetName.Venus, rashiIdx: 6 },
      { name: PlanetName.Moon, rashiIdx: 6, nakshatraName: "Swati" }
    ]);

    // Test Kannada answer for Pushparaga on Tula
    const ansKn = generateGemstoneConsultationAnswer(
      libraChart,
      "ನಾನು ತುಲಾ ಲಗ್ನದವನು, ಪುಷ್ಯರಾಗ ಧರಿಸಬಹುದೇ?",
      "ಸುರೇಶ್",
      true,
      "ಗುರು ಮಹಾದಶಾ"
    );
    expect(ansKn).toContain("ತುಲಾ ಲಗ್ನ & ಪುಷ್ಯರಾಗ ಗೊಂದಲ ಪರಿಹಾರ");
    expect(ansKn).toContain("ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿತ");
    expect(ansKn).toContain("ನೈಜ ಸಂಶೋಧನಾ ಕೇಸ್ ಸ್ಟಡಿ");

    // Test English answer for Diamond on Tula
    const ansEn = generateGemstoneConsultationAnswer(
      libraChart,
      "Can I wear diamond for luck as a Libra?",
      "Rohan",
      false,
      "Venus Mahadasha"
    );
    expect(ansEn).toContain("Libra & Diamond Astrological Nuance");
    expect(ansEn).toContain("100% VEDIC APPROVED");
    expect(ansEn).toContain("Real-World Benchmark Case Study");
  });

  it("verifies Swati Nakshatra exaltation/debilitation parity (Saturn Parama Ucha at 20° & Sun Parama Neecha at 10°)", () => {
    const swati = getNakshatraDignityInfo("Swati");
    expect(swati.swamiPlanet).toBe(PlanetName.Rahu);
    expect(swati.nakshatraDevataKn).toContain("ವಾಯುದೇವ");

    // Classical rule highlighted by user: Swati is where Saturn reaches peak Ucha, but Sun reaches peak Neecha!
    expect(swati.exaltedPlanetsKn).toContain("ಶನಿ");
    expect(swati.exaltedPlanetsKn).toContain("೨೦°");
    expect(swati.debilitatedPlanetsKn).toContain("ಸೂರ್ಯ");
    expect(swati.debilitatedPlanetsKn).toContain("೧೦°");

    expect(swati.exaltedPlanetsEn).toContain("Saturn");
    expect(swati.exaltedPlanetsEn).toContain("20°00' Libra");
    expect(swati.debilitatedPlanetsEn).toContain("Sun");
    expect(swati.debilitatedPlanetsEn).toContain("10°00' Libra");

    // Earrings, Hara, Clothes and Sadhana
    expect(swati.karnaKundalaKn).toContain("ವಜ್ರ");
    expect(swati.sacredHaraKn).toContain("೮ ಮುಖಿ ರುದ್ರಾಕ್ಷಿ");
    expect(swati.luckyColorClothesKn).toContain("ಶುದ್ಧ ಬಿಳಿ");
    expect(swati.strictAvoidColorsKn).toContain("ಗಾಢ ಕೆಂಪು");
    expect(swati.nextDayActionableSadhanaKn).toContain("ಮುಂಜಾನೆಯ ಸಾಧನೆ");
  });

  it("verifies all landmark Nakshatra Parama Ucha and Parama Neecha coordinates across the catalog", () => {
    expect(Object.keys(NAKSHATRA_DIGNITY_CATALOG)).toHaveLength(27);

    // Pushya: Jupiter Parama Ucha at 5° Cancer
    const pushya = getNakshatraDignityInfo("Pushya");
    expect(pushya.exaltedPlanetsEn).toContain("Jupiter");
    expect(pushya.exaltedPlanetsEn).toContain("5°00' Cancer");

    // Ashlesha: Mars Parama Neecha at 28° Cancer
    const ashlesha = getNakshatraDignityInfo("Ashlesha");
    expect(ashlesha.debilitatedPlanetsEn).toContain("Mars");
    expect(ashlesha.debilitatedPlanetsEn).toContain("28°00' Cancer");

    // Dhanishta: Mars Parama Ucha at 28° Capricorn
    const dhanishta = getNakshatraDignityInfo("Dhanishta");
    expect(dhanishta.exaltedPlanetsEn).toContain("Mars");
    expect(dhanishta.exaltedPlanetsEn).toContain("28°00' Capricorn");

    // Uttara Ashadha: Jupiter Parama Neecha at 5° Capricorn
    const uttaraAshadha = getNakshatraDignityInfo("UttaraAshadha");
    expect(uttaraAshadha.debilitatedPlanetsEn).toContain("Jupiter");
    expect(uttaraAshadha.debilitatedPlanetsEn).toContain("5°00' Capricorn");

    // Revati: Venus Parama Ucha at 27° Pisces
    const revati = getNakshatraDignityInfo("Revati");
    expect(revati.exaltedPlanetsEn).toContain("Venus");
    expect(revati.exaltedPlanetsEn).toContain("27°00' Pisces");

    // Chitra: Venus Parama Neecha at 27° Virgo
    const chitra = getNakshatraDignityInfo("Chitra");
    expect(chitra.debilitatedPlanetsEn).toContain("Venus");
    expect(chitra.debilitatedPlanetsEn).toContain("27°00' Virgo");

    // Hasta: Mercury Parama Ucha at 15° Virgo
    const hasta = getNakshatraDignityInfo("Hasta");
    expect(hasta.exaltedPlanetsEn).toContain("Mercury");
    expect(hasta.exaltedPlanetsEn).toContain("15°00' Virgo");

    // Uttara Bhadrapada: Mercury Parama Neecha at 15° Pisces
    const uttaraBhadrapada = getNakshatraDignityInfo("UttaraBhadrapada");
    expect(uttaraBhadrapada.debilitatedPlanetsEn).toContain("Mercury");
    expect(uttaraBhadrapada.debilitatedPlanetsEn).toContain("15°00' Pisces");

    // Krittika: Moon Parama Ucha at 3° Taurus
    const krittika = getNakshatraDignityInfo("Krittika");
    expect(krittika.exaltedPlanetsEn).toContain("Moon");
    expect(krittika.exaltedPlanetsEn).toContain("3°00' Taurus");

    // Vishakha: Moon Parama Neecha at 3° Scorpio
    const vishakha = getNakshatraDignityInfo("Vishakha");
    expect(vishakha.debilitatedPlanetsEn).toContain("Moon");
    expect(vishakha.debilitatedPlanetsEn).toContain("3°00' Scorpio");

    // Ashwini: Sun Parama Ucha at 10° Aries
    const ashwini = getNakshatraDignityInfo("Ashwini");
    expect(ashwini.exaltedPlanetsEn).toContain("Sun");
    expect(ashwini.exaltedPlanetsEn).toContain("10°00' Aries");

    // Bharani: Saturn Parama Neecha at 20° Aries
    const bharani = getNakshatraDignityInfo("Bharani");
    expect(bharani.debilitatedPlanetsEn).toContain("Saturn");
    expect(bharani.debilitatedPlanetsEn).toContain("20°00' Aries");
  });

  it("evaluateGemstoneAndAmuletPrescription delivers the complete 5-pillar holistic lucky suite", () => {
    const swatiChart = createMockKundli(6, [
      { name: PlanetName.Venus, rashiIdx: 6 },
      { name: PlanetName.Moon, rashiIdx: 6, nakshatraName: "Swati" }
    ]);

    const result = evaluateGemstoneAndAmuletPrescription(swatiChart, {
      vara: "Friday",
      tithi: "Shukla Navami",
      nakshatra: "Swati",
      yoga: "Siddha",
      karana: "Kaulava"
    });

    // 1. Primary Ring
    expect(result.primaryRing.gemstoneKn).toContain("ವಜ್ರ");
    expect(result.primaryRing.metalKn).toContain("ಬೆಳ್ಳಿ");

    // 2. Neck Wear (Hara / Pendant / Mala)
    expect(result.neckWear.rudrakshaMukhi).toBe(8);
    expect(result.neckWear.nakshatraNameEn).toBe("Swati");

    // 3. Ear Ornament (Karna Kundala)
    expect(result.earOrnament.ornamentTypeKn).toContain("ಕರ್ಣ ಕುಂಡಲ");
    expect(result.earOrnament.biologicalBenefitKn).toContain("ವಾಯು ತತ್ತ್ವ");

    // 4. Nakshatra Dignity with Exalted Saturn and Debilitated Sun
    expect(result.nakshatraDignity.exaltedPlanetsKn).toContain("ಶನಿ");
    expect(result.nakshatraDignity.debilitatedPlanetsKn).toContain("ಸೂರ್ಯ");

    // 5. Next-Day Morning Actionable Sadhana
    expect(result.nextDaySadhana.morningDeityPrayerKn).toContain("ವಾಯುದೇವ");
    expect(result.nextDaySadhana.exactMantraCount).toBe(11);
    expect(result.nextDaySadhana.templeSankalpaKn).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ");

    // Colors
    expect(result.colors.luckyColorsKn.length).toBeGreaterThan(0);
    expect(result.colors.strictAvoidColorsKn.length).toBeGreaterThan(0);
  });
});
