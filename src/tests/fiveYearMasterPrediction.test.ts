import { describe, it, expect } from "vitest";
import {
  compute5YearMasterPrediction,
  getAgeCategory,
  getParashariGemstoneRecommendation,
  selectPrescribedStotra
} from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import {
  SIX_LANGS,
  RASHI_6L,
  GRAHA_6L,
  NAKSHATRA_6L,
  WEEKDAY_6L,
  formatNumber6L,
  toKnDigits,
  toDevanagariDigits
} from "../features/fiveYearPrediction/fiveYearLocale";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

// Mock Kundli Output for testing
const createMockKundli = (lagnaIdx: number, moonIdx: number): KundliOutput => ({
  ascendant: lagnaIdx * 30 + 15,
  lagnaRashi: { index: lagnaIdx, sanskrit: "Lagna", english: "Aries" },
  moonSign: { index: moonIdx, sanskrit: "Chandra", english: "Taurus" },
  sunSign: { index: 0, sanskrit: "Surya", english: "Aries" },
  moonPada: 2,
  houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  planets: [
    {
      name: PlanetName.Sun,
      degree: 15,
      house: 1,
      rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini" }
    },
    {
      name: PlanetName.Moon,
      degree: 45,
      house: 2,
      rashi: { index: moonIdx, sanskrit: "Vrishabha", english: "Taurus" },
      nakshatra: { index: 3, sanskrit: "Rohini", english: "Rohini", deity: "Brahma" }
    },
    {
      name: PlanetName.Mars,
      degree: 10,
      house: 1,
      rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini" }
    },
    {
      name: PlanetName.Saturn,
      degree: 340,
      house: 12,
      rashi: { index: 11, sanskrit: "Meena", english: "Pisces" },
      nakshatra: { index: 25, sanskrit: "Uttara Bhadrapada", english: "Uttara Bhadrapada", deity: "Ahirbudhnya" }
    },
    {
      name: PlanetName.Jupiter,
      degree: 75,
      house: 3,
      rashi: { index: 2, sanskrit: "Mithuna", english: "Gemini" },
      nakshatra: { index: 5, sanskrit: "Ardra", english: "Ardra", deity: "Rudra" }
    }
  ]
});

describe("Baggona 5-Year Master Destiny Forecast Engine", () => {
  it("supports all 6 languages including brand new Marathi (mr)", () => {
    expect(SIX_LANGS).toEqual(["kn", "en", "hi", "ta", "te", "mr"]);
    expect(RASHI_6L).toHaveLength(12);
    expect(NAKSHATRA_6L).toHaveLength(27);
    expect(WEEKDAY_6L).toHaveLength(7);

    // Verify Marathi names for signs
    expect(RASHI_6L[0].mr).toBe("मेष");
    expect(RASHI_6L[1].mr).toBe("वृषभ");
    expect(RASHI_6L[6].mr).toBe("तूळ");
    expect(RASHI_6L[11].mr).toBe("मीन");

    // Verify Marathi names for planets
    expect(GRAHA_6L.Sun.mr).toBe("सूर्य");
    expect(GRAHA_6L.Mars.mr).toBe("मंगळ");
    expect(GRAHA_6L.Saturn.mr).toBe("शनी देव");
    expect(GRAHA_6L.Jupiter.mr).toBe("गुरू (बृहस्पति)");
  });

  it("correctly converts numerals for Kannada and Marathi/Hindi Devanagari", () => {
    expect(toKnDigits(250)).toBe("೨೫೦");
    expect(toDevanagariDigits(250)).toBe("२५०");
    expect(formatNumber6L(2026, "mr")).toBe("२०२६");
    expect(formatNumber6L(2026, "kn")).toBe("೨೦೨೬");
  });

  it("detects age categories accurately", () => {
    expect(getAgeCategory(8)).toBe("child");
    expect(getAgeCategory(19)).toBe("youth");
    expect(getAgeCategory(35)).toBe("adult");
    expect(getAgeCategory(68)).toBe("senior");
  });

  it("strictly enforces Parashari Lagna Lordship for Hawala (Cancer/Leo) vs Vajra", () => {
    // Cancer (index 3) -> Hawala is supreme Yogakaraka, Vajra strictly prohibited
    const cancerRec = getParashariGemstoneRecommendation(3, "kn");
    expect(cancerRec.gem).toContain("ಕೆಂಪು ಹವಳ");
    expect(cancerRec.caveat).toContain("ವಜ್ರ (Diamond) ಧರಿಸಬಾರದು");

    // Leo (index 4) in Marathi
    const leoRecMr = getParashariGemstoneRecommendation(4, "mr");
    expect(leoRecMr.gem).toContain("लाल पोवळे");
    expect(leoRecMr.caveat).toContain("हिरा (Diamond) वर्ज्य आहे");

    // Taurus (index 1) -> Venus lord -> Vajra / White Sapphire
    const taurusRec = getParashariGemstoneRecommendation(1, "kn");
    expect(taurusRec.gem).toContain("ವಜ್ರ");

    // Capricorn (index 9) in Marathi -> Vajra Yogakaraka
    const capRecMr = getParashariGemstoneRecommendation(9, "mr");
    expect(capRecMr.gem).toContain("हिरा किंवा पांढरा पुखराज");
  });

  it("computes 5 full chronological years with authentic Samvatsaras and transits", () => {
    const kundli = createMockKundli(0, 1); // Mesha Lagna, Vrishabha Moon
    const payload = compute5YearMasterPrediction(
      kundli,
      "1992-05-15",
      "10:30",
      "kn",
      "Pramod Kodgi",
      2026
    );

    expect(payload.years).toHaveLength(5);
    expect(payload.years[0].gregorianRange).toBe("2026 - 2027");
    expect(payload.years[1].gregorianRange).toBe("2027 - 2028");
    expect(payload.years[2].gregorianRange).toBe("2028 - 2029");
    expect(payload.years[3].gregorianRange).toBe("2029 - 2030");
    expect(payload.years[4].gregorianRange).toBe("2030 - 2031");

    // Check that every year has non-empty fields
    payload.years.forEach((yr, idx) => {
      expect(yr.samvatsaraKn.length).toBeGreaterThan(2);
      expect(yr.vitalityScore).toBeGreaterThanOrEqual(30);
      expect(yr.vitalityScore).toBeLessThanOrEqual(100);
      expect(yr.shaniGocharaText.length).toBeGreaterThan(10);
      expect(yr.guruGocharaText.length).toBeGreaterThan(10);
      expect(yr.whatToExpect.length).toBeGreaterThanOrEqual(3);
      expect(yr.turningPointSeason.length).toBeGreaterThan(5);
      expect(yr.goldenOpportunityWindow.length).toBeGreaterThan(5);
      expect(yr.cautionAndGuidance.length).toBeGreaterThan(5);
    });
  });

  it("generates age-appropriate chapters with substantive paragraphs for adults", () => {
    const kundli = createMockKundli(3, 3); // Cancer Lagna, Cancer Moon (age ~34)
    const payload = compute5YearMasterPrediction(
      kundli,
      "1990-08-10",
      "08:15",
      "kn",
      "Smt. Lakshmi",
      2026
    );

    expect(payload.ageCategory).toBe("adult");
    expect(payload.chapters.length).toBeGreaterThanOrEqual(3);

    // Verify Career & Wealth chapters exist
    const hasCareer = payload.chapters.some(c => c.id === "adult_career");
    const hasWealth = payload.chapters.some(c => c.id === "adult_wealth");
    const hasFamily = payload.chapters.some(c => c.id === "adult_family");
    expect(hasCareer).toBe(true);
    expect(hasWealth).toBe(true);
    expect(hasFamily).toBe(true);

    // Verify substantive paragraphs
    payload.chapters.forEach(ch => {
      expect(ch.paragraphs.length).toBeGreaterThanOrEqual(2);
      ch.paragraphs.forEach(p => {
        expect(p.length).toBeGreaterThan(30);
      });
      expect(ch.keyAdvice.length).toBeGreaterThan(10);
    });
  });

  it("generates pediatric educational chapters without marriage/affair leaks for children", () => {
    const kundli = createMockKundli(0, 0); // Mesha Lagna, Mesha Moon (child age ~8)
    const payload = compute5YearMasterPrediction(
      kundli,
      "2018-04-12",
      "14:20",
      "mr",
      "Master Aryan",
      2026
    );

    expect(payload.ageCategory).toBe("child");
    const chapterIds = payload.chapters.map(c => c.id);
    expect(chapterIds).toContain("child_education");
    expect(chapterIds).toContain("child_health");
    expect(chapterIds).toContain("child_talents");
    expect(chapterIds).not.toContain("adult_career");
    expect(chapterIds).not.toContain("adult_family");
  });

  it("selects classical Stotra with Sanskrit verse and native meaning", () => {
    const kundli = createMockKundli(0, 11); // Meena Moon with active Saturn transit
    const stotra = selectPrescribedStotra(kundli, true, PlanetName.Saturn, "kn");

    expect(stotra.id).toBe("shani_dasharatha");
    expect(stotra.sanskritVerse).toContain("नमः कृष्णाय नीलाय");
    expect(stotra.meaningNative).toContain("ಶನೈಶ್ಚರ");
    expect(stotra.chantingRounds).toBe(11);
  });

  it("produces zero English leaks in Marathi output", () => {
    const kundli = createMockKundli(6, 6); // Tula Lagna, Tula Moon
    const payload = compute5YearMasterPrediction(
      kundli,
      "1985-11-20",
      "06:45",
      "mr",
      "Shri Rajesh Kulkarni",
      2026
    );

    expect(payload.targetLanguage).toBe("mr");
    expect(payload.lagnaRashi).toBe("तूळ");
    expect(payload.moonRashi).toBe("तूळ");

    // Verify macroSummary has Devanagari script
    expect(/[\u0900-\u097F]/.test(payload.macroSummary.overview)).toBe(true);
    expect(/[\u0900-\u097F]/.test(payload.astrologerBlessing)).toBe(true);

    // Verify priest blessing mentions Shreeram Pandit
    expect(payload.astrologerBlessing).toContain("श्रीराम पंडित");
  });

  it("accurately calculates Moon Pada 4 and verifies Pada resolution determinism", () => {
    // Ashwini spans 0° to 13°20' (13.333°).
    // Pada 1: 0° - 3°20' (3.333°)
    // Pada 2: 3°20' - 6°40' (6.666°)
    // Pada 3: 6°40' - 10°00' (10.000°)
    // Pada 4: 10°00' - 13°20' (13.333°)
    // A moon at 12.5° in Mesha is strictly Ashwini Pada 4.
    const pada4Kundli: KundliOutput = {
      ...createMockKundli(0, 0),
      moonPada: 4,
      planets: [
        ...createMockKundli(0, 0).planets.filter(p => p.name !== PlanetName.Moon),
        {
          name: PlanetName.Moon,
          degree: 12.5,
          house: 1,
          rashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
          nakshatra: { index: 0, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini" }
        }
      ]
    };

    const payloadKn = compute5YearMasterPrediction(
      pada4Kundli,
      "1995-02-14",
      "04:20",
      "kn",
      "Ganesh Hegde",
      2026
    );

    expect(payloadKn.nakshatraPada).toBe("೪");
    expect(payloadKn.padaWord).toBe("ಪಾದ");

    const payloadMr = compute5YearMasterPrediction(
      pada4Kundli,
      "1995-02-14",
      "04:20",
      "mr",
      "Ganesh Hegde",
      2026
    );
    expect(payloadMr.nakshatraPada).toBe("४");
    expect(payloadMr.padaWord).toBe("चरण");

    const payloadTe = compute5YearMasterPrediction(
      pada4Kundli,
      "1995-02-14",
      "04:20",
      "te",
      "Ganesh Hegde",
      2026
    );
    expect(payloadTe.nakshatraPada).toBe("౪");
    expect(payloadTe.padaWord).toBe("పాదం");

    const payloadTa = compute5YearMasterPrediction(
      pada4Kundli,
      "1995-02-14",
      "04:20",
      "ta",
      "Ganesh Hegde",
      2026
    );
    expect(payloadTa.nakshatraPada).toBe("௪");
    expect(payloadTa.padaWord).toBe("பாதம்");
  });

  it("generates the 5-Year Master Future Milestones Matrix with all 6 dimensions", () => {
    const kundli = createMockKundli(1, 1);
    const payload = compute5YearMasterPrediction(
      kundli,
      "1994-06-21",
      "12:00",
      "kn",
      "Venkatesh Bhat",
      2026
    );

    expect(payload.milestoneMatrix).toBeDefined();
    expect(payload.milestoneMatrix).toHaveLength(6);

    // Verify key dimensions
    const dimensions = payload.milestoneMatrix.map(m => m.dimensionTitle);
    expect(dimensions).toContain("🌟 ಪಂಚವರ್ಷದ ಮಹಾ ತಿರುವು");
    expect(dimensions).toContain("💼 ಉದ್ಯೋಗ ಪದವಿ ಉನ್ನತಿ & ವೃತ್ತಿ ನಾಯಕತ್ವ");
    expect(dimensions).toContain("💰 ಧನ ಸಮೃದ್ಧಿ & ಸಾಲ ವಿಮುಕ್ತಿ");
    expect(dimensions).toContain("🏡 ಗೃಹ ನಿರ್ಮಾಣ / ನಿವೇಶನ & ವಾಹನ ಯೋಗ");
    expect(dimensions).toContain("💍 ಮಾಂಗಲ್ಯ ಭಾಗ್ಯ / ಸಂತಾನ ಸೌಖ್ಯ / ದಾಂಪತ್ಯ");
    expect(dimensions).toContain("⚠️ ಎಚ್ಚರಿಕೆಯ ಕಾಲ & ಗೋಕರ್ಣ ರಕ್ಷಾ ಕವಚ");

    // Verify every milestone has timing window and advice
    payload.milestoneMatrix.forEach(m => {
      expect(m.timingWindow.length).toBeGreaterThan(4);
      expect(m.planetaryCatalyst.length).toBeGreaterThan(4);
      expect(m.probabilityScore.length).toBeGreaterThan(2);
      expect(m.actionAdvice.length).toBeGreaterThan(10);
    });
  });

  it("generates 4 authentic quarterly seasons per year for future timing curiosity", () => {
    const kundli = createMockKundli(4, 4);
    const payload = compute5YearMasterPrediction(
      kundli,
      "1988-10-15",
      "18:30",
      "mr",
      "Sunil Joshi",
      2026
    );

    expect(payload.years).toHaveLength(5);
    payload.years.forEach((yr, yIdx) => {
      expect(yr.seasons).toBeDefined();
      expect(yr.seasons).toHaveLength(4);

      yr.seasons?.forEach((q) => {
        expect(q.seasonName.length).toBeGreaterThan(2);
        expect(q.gregorianMonths.length).toBeGreaterThan(4);
        expect(q.vedicMonths.length).toBeGreaterThan(4);
        expect(q.predictedOutcome.length).toBeGreaterThan(15);
        expect(q.opportunityBadge.length).toBeGreaterThan(2);
      });
    });
  });

  it("generates pivotal turning point with impact description for devotee psychology", () => {
    const kundli = createMockKundli(7, 7);
    const payload = compute5YearMasterPrediction(
      kundli,
      "1991-03-25",
      "09:15",
      "hi",
      "Vivek Sharma",
      2026
    );

    expect(payload.macroSummary.pivotalTurningPointTitle).toBeDefined();
    expect(payload.macroSummary.pivotalTurningPointTitle!.length).toBeGreaterThan(5);
    expect(payload.macroSummary.pivotalTurningPointSeason!.length).toBeGreaterThan(3);
    expect(payload.macroSummary.pivotalTurningPointImpact!.length).toBeGreaterThan(25);
  });

  it("calculates authentic Janana Panchanga with real Hora, Weekday and Ayanamsha", () => {
    const kundli = createMockKundli(0, 0); // Mesha Lagna
    const payload = compute5YearMasterPrediction(
      kundli,
      "1992-05-18", // Monday
      "06:30",
      "kn",
      "Prasanna Hegde",
      2026,
      { latitude: 14.5479, longitude: 74.3188 } // Gokarna
    );

    expect(payload.jananaPanchanga).toBeDefined();
    const jp = payload.jananaPanchanga!;
    expect(jp.tithi.length).toBeGreaterThan(2);
    expect(jp.paksha.length).toBeGreaterThan(2);
    expect(jp.yoga.length).toBeGreaterThan(2);
    expect(jp.karana.length).toBeGreaterThan(2);
    expect(jp.weekday.length).toBeGreaterThan(2);
    expect(jp.janmaHora.length).toBeGreaterThan(2);
    expect(jp.ayanamsha).toContain("ಚಿತ್ರಾಪಕ್ಷ");
  });

  it("calculates Muntha progression, Moorthy Nirnaya, and SAV points for 5 years", () => {
    const kundli = createMockKundli(3, 3); // Cancer Lagna (idx 3), Cancer Moon (idx 3)
    // Age in 2026 for 1990 birth = 36. Muntha = (3 + 36) % 12 = 39 % 12 = 3 (Cancer / Karka)
    const payload = compute5YearMasterPrediction(
      kundli,
      "1990-08-10",
      "08:15",
      "kn",
      "Smt. Lakshmi",
      2026
    );

    expect(payload.years).toHaveLength(5);
    payload.years.forEach((yr, idx) => {
      expect(yr.munthaHouse).toBeDefined();
      expect(yr.munthaRashi).toBeDefined();
      expect(yr.munthaTheme).toBeDefined();
      expect(yr.munthaTheme!.length).toBeGreaterThan(5);

      expect(yr.moorthyNirnaya).toBeDefined();
      expect(yr.moorthyNirnaya!.saturnMoorthy.length).toBeGreaterThan(2);
      expect(yr.moorthyNirnaya!.jupiterMoorthy.length).toBeGreaterThan(2);

      expect(yr.shaniGocharaText.length).toBeGreaterThan(5);
      expect(yr.guruGocharaText.length).toBeGreaterThan(5);
      expect(typeof yr.savPoints).toBe("number");
      expect(yr.savPoints as number).toBeGreaterThanOrEqual(18);
      expect(yr.savPoints as number).toBeLessThanOrEqual(45);
    });

    // Verify Muntha progression: year 0 munthaHouse is 1, year 1 is 2, etc. (since Muntha in Lagna = House 1)
    expect(payload.years[0].munthaHouse).toBe(1);
    expect(payload.years[1].munthaHouse).toBe(2);
    expect(payload.years[2].munthaHouse).toBe(3);
  });

  it("generates the 5-Year Auspicious Muhurtas, Financial Roadmap, Health Shield, and Pilgrimage", () => {
    const kundli = createMockKundli(5, 5); // Kanya Lagna
    const payload = compute5YearMasterPrediction(
      kundli,
      "1986-09-22",
      "16:45",
      "mr",
      "Santosh Patil",
      2026
    );

    // 1. Muhurta Windows
    expect(payload.muhurtaWindows).toBeDefined();
    expect(payload.muhurtaWindows!.length).toBe(5);
    payload.muhurtaWindows!.forEach(mw => {
      expect(mw.category.length).toBeGreaterThan(3);
      expect(mw.timingWindow.length).toBeGreaterThan(3);
      expect(mw.description.length).toBeGreaterThan(5);
    });

    // 2. Financial Roadmap
    expect(payload.financialRoadmap).toBeDefined();
    expect(payload.financialRoadmap!.length).toBe(5);
    payload.financialRoadmap!.forEach(fr => {
      expect(fr.yearRange.length).toBeGreaterThan(3);
      expect(fr.financialStance.length).toBeGreaterThan(3);
      expect(fr.keyAction.length).toBeGreaterThan(10);
      expect(fr.targetSectors.length).toBeGreaterThan(3);
    });

    // 3. Health & Longevity Shield
    expect(payload.healthShield).toBeDefined();
    expect(payload.healthShield!.length).toBe(3);
    payload.healthShield!.forEach(hs => {
      expect(hs.vulnerableWindow.length).toBeGreaterThan(3);
      expect(hs.focusArea.length).toBeGreaterThan(3);
      expect(hs.preventiveGuidance.length).toBeGreaterThan(10);
    });

    // 4. Punyakshetra Sacred Pilgrimage
    expect(payload.punyakshetraYatra).toBeDefined();
    expect(payload.punyakshetraYatra!.length).toBe(3);
    payload.punyakshetraYatra!.forEach(py => {
      expect(py.recommendedKshetra.length).toBeGreaterThan(3);
      expect(py.idealSeason.length).toBeGreaterThan(3);
      expect(py.spiritualBenefit.length).toBeGreaterThan(10);
    });
  });

  it("generates Year-by-Year Gokarna Remedies, Nakshatra Tree Aradhana, and Family Interlocking", () => {
    const kundli = createMockKundli(2, 2); // Mithuna Lagna
    const payload = compute5YearMasterPrediction(
      kundli,
      "1993-12-05",
      "11:20",
      "kn",
      "Kiran Rao",
      2026
    );

    // 1. Year Specific Remedies
    expect(payload.yearSpecificRemedies).toBeDefined();
    expect(payload.yearSpecificRemedies!.length).toBe(5);
    payload.yearSpecificRemedies!.forEach((yr, idx) => {
      expect(yr.yearIndex).toBe(idx);
      expect(yr.gregorianRange.length).toBeGreaterThan(3);
      expect(yr.transitChallenge.length).toBeGreaterThan(5);
      expect(yr.gokarnaSeva.length).toBeGreaterThan(5);
      expect(yr.mantra.length).toBeGreaterThan(5);
    });

    // 2. Nakshatra Sacred Tree
    expect(payload.nakshatraVriksha).toBeDefined();
    expect(payload.nakshatraVriksha!.vrikshaName.length).toBeGreaterThan(2);
    expect(payload.nakshatraVriksha!.bijaMantra.length).toBeGreaterThan(5);
    expect(payload.nakshatraVriksha!.aradhanaProtocol.length).toBeGreaterThan(10);

    // 3. Family Destiny Interlocking
    expect(payload.familyDestinyInterlocking).toBeDefined();
    const fam = payload.familyDestinyInterlocking!;
    expect(fam.impactOnSpouse.length).toBeGreaterThan(10);
    expect(fam.impactOnChildren.length).toBeGreaterThan(10);
    expect(fam.impactOnParents.length).toBeGreaterThan(10);
    expect(fam.familyBundleCta.length).toBeGreaterThan(10);
    expect(fam.familyQrUrl).toContain("baggona.com/bhavishya?mode=fiveYear");
  });

  it("computes Kundli Dosha Diagnostics with 3 substantive paragraphs & Gokarna protection shield", () => {
    const kundli = createMockKundli(0, 1);
    const payload = compute5YearMasterPrediction(
      kundli,
      "1988-06-15",
      "09:30",
      "kn",
      "Venkatesh Bhat",
      2026
    );

    expect(payload.doshaAnalysis).toBeDefined();
    const dosha = payload.doshaAnalysis!;
    expect(dosha.inquestQuestion.length).toBeGreaterThan(15);
    expect(dosha.paragraphs).toHaveLength(3);
    dosha.paragraphs.forEach(p => {
      expect(p.length).toBeGreaterThan(50);
    });
    expect(dosha.detectedDoshas.length).toBeGreaterThan(0);
    expect(dosha.overallDoshaScore.length).toBeGreaterThan(2);
    expect(dosha.remedyShieldSummary.length).toBeGreaterThan(15);
  });

  it("ensures each chronological year has questionInquest and exactly 3 substantive paragraphs", () => {
    const kundli = createMockKundli(3, 4);
    const payload = compute5YearMasterPrediction(
      kundli,
      "1995-10-20",
      "14:45",
      "kn",
      "Shruthi Rao",
      2026
    );

    expect(payload.years).toHaveLength(5);
    payload.years.forEach((yr, idx) => {
      expect(yr.yearIndex).toBe(idx);
      expect(yr.questionInquest).toBeDefined();
      expect(yr.questionInquest!.length).toBeGreaterThan(15);
      expect(yr.paragraphs).toBeDefined();
      expect(yr.paragraphs!).toHaveLength(3);
      yr.paragraphs!.forEach(p => {
        expect(p.length).toBeGreaterThan(30);
      });
    });
  });

  it("ensures child and senior chapters have contemplationInquest and 3 full paragraphs", () => {
    const kundli = createMockKundli(1, 2);
    
    // Child (age < 13)
    const childPayload = compute5YearMasterPrediction(
      kundli,
      "2018-05-10",
      "10:00",
      "kn",
      "Aarav",
      2026
    );
    expect(childPayload.ageCategory).toBe("child");
    childPayload.chapters.forEach(ch => {
      expect(ch.contemplationInquest).toBeDefined();
      expect(ch.paragraphs).toHaveLength(3);
    });

    // Senior (age >= 55)
    const seniorPayload = compute5YearMasterPrediction(
      kundli,
      "1960-03-15",
      "08:00",
      "kn",
      "Narayana Hegde",
      2026
    );
    expect(seniorPayload.ageCategory).toBe("senior");
    seniorPayload.chapters.forEach(ch => {
      expect(ch.contemplationInquest).toBeDefined();
      expect(ch.paragraphs).toHaveLength(3);
    });
  });

  it("ensures youth life stage (age 13-22) gets dedicated youth chapters with 3 full paragraphs and zero adult leakage", () => {
    const kundli = createMockKundli(1, 2);
    const youthPayload = compute5YearMasterPrediction(
      kundli,
      "2007-08-20",
      "14:30",
      "kn",
      "Prajwal",
      2026
    );

    expect(youthPayload.ageCategory).toBe("youth");
    expect(youthPayload.chapters.map(c => c.id)).toEqual([
      "youth_education_career",
      "youth_skills_growth",
      "youth_wellness_direction"
    ]);

    youthPayload.chapters.forEach(ch => {
      expect(ch.contemplationInquest).toBeDefined();
      expect(ch.paragraphs).toHaveLength(3);
      ch.paragraphs.forEach(p => {
        expect(p.length).toBeGreaterThan(150);
        // Zero spouse / divorce / marital discord leaks for youth
        expect(p).not.toMatch(/ವಿಚ್ಛೇದನ|ದಾಂಪತ್ಯ ಕಲಹ|ವೈವಾಹಿಕ ಬಿಕ್ಕಟ್ಟು|divorce/i);
      });
    });
  });

  it("generates authentic Daivajna Summary, Sacred Deity Portrait and 100% Dynamic Devotee Shloka", () => {
    const kundli = createMockKundli(0, 4); // Aries Lagna, Leo Moon
    const payload = compute5YearMasterPrediction(
      kundli,
      "1994-06-15",
      "10:30",
      "kn",
      "Shreesuma Upadhyaya",
      2026
    );

    // 1. Daivajna Summary
    expect(payload.daivajnaSummary).toBeDefined();
    expect(payload.daivajnaSummary!.p1KarmicJourney?.length).toBeGreaterThan(200);
    expect(payload.daivajnaSummary!.p2PeakGoldenEra?.length).toBeGreaterThan(200);
    expect(payload.daivajnaSummary!.p3AttentionPointsAndSolace?.length).toBeGreaterThan(200);
    expect(payload.daivajnaSummary!.careerFinancialPivot).toBeDefined();
    expect(payload.daivajnaSummary!.healthVitalityShield).toBeDefined();
    expect(payload.daivajnaSummary!.spiritualRemedyFulfillment).toBeDefined();
    expect(payload.daivajnaSummary!.relationshipFamilyHarmony).toBeDefined();

    // 2. Sacred Deity Portrait
    expect(payload.sacredDeityImage).toBeDefined();
    expect(payload.sacredDeityImage!.imagePath).toMatch(/^\/daily_posters\/.+\.(png|webp|jpg)$/);
    expect(payload.sacredDeityImage!.deityName.length).toBeGreaterThan(3);
    expect(payload.sacredDeityImage!.deityTitle?.length).toBeGreaterThan(5);
    expect(payload.sacredDeityImage!.blessingsSubtitle?.length).toBeGreaterThan(10);

    // 3. 100% Dynamic Devotee Shloka
    expect(payload.personalizedDynamicShloka).toBeDefined();
    expect(payload.personalizedDynamicShloka!.shlokaSanskrit?.length).toBeGreaterThan(20);
    expect(payload.personalizedDynamicShloka!.shlokaRegional?.length).toBeGreaterThan(20);
    expect(payload.personalizedDynamicShloka!.meaning?.length).toBeGreaterThan(50);
    expect(payload.personalizedDynamicShloka!.chantCount).toBeDefined();
    expect(payload.personalizedDynamicShloka!.auspiciousTime).toBeDefined();
    expect(payload.personalizedDynamicShloka!.auspiciousDirection).toBeDefined();
    expect(payload.personalizedDynamicShloka!.spiritualFruit).toBeDefined();
    expect(payload.personalizedDynamicShloka!.deityRationale?.length).toBeGreaterThan(30);

    // Verify Marathi locale dynamic shloka
    const mrPayload = compute5YearMasterPrediction(
      kundli,
      "1994-06-15",
      "10:30",
      "mr",
      "श्रीसुमा उपाध्याय",
      2026
    );
    expect(mrPayload.daivajnaSummary!.titleKn).toContain("दैवज्ञ ज्योतिष महा सारांश");
    expect(mrPayload.sacredDeityImage!.deityName).toBeDefined();
    expect(mrPayload.personalizedDynamicShloka!.meaning).toBeDefined();
  });
});

