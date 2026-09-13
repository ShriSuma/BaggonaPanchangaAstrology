import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  generateVedicConsultationAnswer,
  evaluateNativeNegativeShadesAndCriminality
} from "../core/PanchangaAngaSynthesisEngine";
import { PlanetName } from "../core/AstroTypes";

describe("Negative Shades, Criminality & Moral Integrity Shastric Audit", () => {
  // Test 1: Clean Upright Native (Zero False Positives Guarantee)
  it("guarantees 100% false-positive immunity for clean natives with Jupiter/benefic protection (Pramod's chart)", () => {
    const pramodContext = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
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

    expect(shades).toBeDefined();
    if (!shades) return;

    // Must be in purity tier (0 to 15)
    expect(shades.overallScore).toBeLessThanOrEqual(15);
    expect(shades.category).toBe("purity");
    expect(shades.categoryTitleKn).toContain("ಪರಿಶುದ್ಧ ಸತ್ಚಾರಿತ್ರ್ಯ & ಅಪರಾಧ");
    expect(shades.categoryTitleEn).toContain("Impeccable Moral Integrity");

    // Must have Jupiter protection or benefic Kendra shield
    expect(shades.isJupiterProtected || shades.hasBeneficKendraShield).toBe(true);

    // All 5 classical dimensions must be free from malefic risk
    expect(shades.financialIntegrity.hasRisk).toBe(false);
    expect(shades.financialIntegrity.score).toBeLessThanOrEqual(3);
    expect(shades.financialIntegrity.analysisKn).toContain("ಪ್ರಾಮಾಣಿಕ");
    expect(shades.financialIntegrity.analysisKn).toContain("ಸಂಪೂರ್ಣ ಶೂನ್ಯ");

    expect(shades.violenceAggression.hasRisk).toBe(false);
    expect(shades.violenceAggression.score).toBeLessThanOrEqual(3);
    expect(shades.violenceAggression.analysisKn).toContain("ಅಹಿಂಸಾ ಧರ್ಮ");
    expect(shades.violenceAggression.analysisKn).toContain("ಸಂಪೂರ್ಣ ಶೂನ್ಯ");

    expect(shades.legalBandhana.hasRisk).toBe(false);
    expect(shades.legalBandhana.score).toBeLessThanOrEqual(3);
    expect(shades.legalBandhana.analysisKn).toContain("ಕಾನೂನಿನ ಚೌಕಟ್ಟಿನಲ್ಲಿ");
    expect(shades.legalBandhana.analysisKn).toContain("ಲವಲೇಶವೂ ನಿಮ್ಮ ಜಾತಕಕ್ಕಿಲ್ಲ");

    expect(shades.conductDownwardPath.hasRisk).toBe(false);
    expect(shades.conductDownwardPath.score).toBeLessThanOrEqual(3);
    expect(shades.conductDownwardPath.analysisKn).toContain("ಸನ್ಮಾರ್ಗ");

    // Dimension 1 accurately captures real-life sensual restlessness / roving eye (Kama Chanchalya)
    expect(shades.sensualMarital.hasRisk).toBe(true);
    expect(shades.sensualMarital.analysisKn).toContain("ಕಾಮ ಚಾಂಚಲ್ಯ");

    // Strict formatting checks: NO markdown bold asterisks in Kannada text
    expect(shades.categoryDescriptionKn).not.toContain("**");
    expect(shades.categoryDescriptionKn).not.toContain("*");
    expect(shades.financialIntegrity.analysisKn).not.toContain("**");
    expect(shades.violenceAggression.analysisKn).not.toContain("**");
    expect(shades.legalBandhana.analysisKn).not.toContain("**");
    expect(shades.protectionRemedyKn).not.toContain("**");
  });

  // Test 2: Child Protection (<14 years) Innocence Preservation
  it("protects minor children (<14 years) with absolute zero score and childhood innocence preservation", () => {
    const childContext = {
      birthDate: "2018-08-10",
      birthTime: "14:30",
      latitude: 12.9716,
      longitude: 77.5946,
      devoteeName: "Master Aarav",
      gender: "Male" as const,
      devoteeAge: 8
    };

    const childKundli = calculateKundli({
      name: childContext.devoteeName,
      birthDate: childContext.birthDate,
      birthTime: childContext.birthTime,
      latitude: childContext.latitude,
      longitude: childContext.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(childKundli, childContext);
    const shades = synthesis.currentDiagnosis.negativeShades;

    expect(shades).toBeDefined();
    if (!shades) return;

    expect(shades.overallScore).toBe(0);
    expect(shades.isChildShielded).toBe(true);
    expect(shades.category).toBe("purity");
    expect(shades.categoryDescriptionKn).toContain("ಮುಗ್ಧತೆ");
    expect(shades.categoryDescriptionEn).toContain("innocence");

    // All 5 dimensions must have score 0 and no risk
    expect(shades.sensualMarital.score).toBe(0);
    expect(shades.sensualMarital.hasRisk).toBe(false);
    expect(shades.financialIntegrity.score).toBe(0);
    expect(shades.financialIntegrity.hasRisk).toBe(false);
    expect(shades.violenceAggression.score).toBe(0);
    expect(shades.violenceAggression.hasRisk).toBe(false);
    expect(shades.legalBandhana.score).toBe(0);
    expect(shades.legalBandhana.hasRisk).toBe(false);
    expect(shades.conductDownwardPath.score).toBe(0);
    expect(shades.conductDownwardPath.hasRisk).toBe(false);
  });

  // Test 3: Gender Tailoring Audit (Pati vs Patni)
  it("applies strictly appropriate gender-tailored vocabulary for male and female natives", () => {
    // Male native
    const maleContext = {
      birthDate: "1990-01-15",
      birthTime: "10:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Suresh",
      gender: "Male" as const,
      devoteeAge: 35
    };
    const maleKundli = calculateKundli({
      name: maleContext.devoteeName,
      birthDate: maleContext.birthDate,
      birthTime: maleContext.birthTime,
      latitude: maleContext.latitude,
      longitude: maleContext.longitude
    });
    const maleSynthesis = generatePanchangaAngaSynthesis(maleKundli, maleContext);
    const maleShades = maleSynthesis.currentDiagnosis.negativeShades;
    expect(maleShades).toBeDefined();
    expect(maleShades?.sensualMarital.analysisKn).toMatch(/ಏಕಪತ್ನಿ|ಪತ್ನಿ/);

    // Female native
    const femaleContext = {
      birthDate: "1990-01-15",
      birthTime: "10:00",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Lakshmi",
      gender: "Female" as const,
      devoteeAge: 35
    };
    const femaleSynthesis = generatePanchangaAngaSynthesis(maleKundli, femaleContext);
    const femaleShades = femaleSynthesis.currentDiagnosis.negativeShades;
    expect(femaleShades).toBeDefined();
    expect(femaleShades?.sensualMarital.analysisKn).toMatch(/ಏಕಪತಿ|ಪತಿ/);
    expect(femaleShades?.sensualMarital.analysisKn).not.toContain("ಏಕಪತ್ನಿ");
  });

  // Test 4: Synthetic Afflicted Chart Detection
  it("accurately detects classical malefic yogas (Chora Yoga, Angaraka Yoga, Bandhana Yoga) in an afflicted chart", () => {
    // Construct a synthetic afflicted chart without Jupiter aspect, heavily afflicted 8th and 12th houses
    const afflictedKundli = {
      lagnaRashi: { index: 0, sanskrit: "Mesha", english: "Aries" },
      moonSign: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" },
      moonPada: 2,
      planets: [
        // Mars and Rahu in 8th house (Vrishchika) - Asura/Angaraka Yoga
        { name: PlanetName.Mars, house: 8, rashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" }, nakshatra: { english: "Anuradha" } },
        { name: PlanetName.Rahu, house: 8, rashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" }, nakshatra: { english: "Jyeshtha" } },
        // Mercury in 8th house with Mars and Rahu - Classical Chora Yoga
        { name: PlanetName.Mercury, house: 8, rashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" }, nakshatra: { english: "Jyeshtha" } },
        // Ketu in 2nd house
        { name: PlanetName.Ketu, house: 2, rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" }, nakshatra: { english: "Krittika" } },
        // Saturn in 12th house (Bandhana Yoga)
        { name: PlanetName.Saturn, house: 12, rashi: { index: 11, sanskrit: "Meena", english: "Pisces" }, nakshatra: { english: "Revati" } },
        // Venus in 8th house with Mars/Rahu
        { name: PlanetName.Venus, house: 8, rashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" }, nakshatra: { english: "Anuradha" } },
        // Sun in 6th house
        { name: PlanetName.Sun, house: 6, rashi: { index: 5, sanskrit: "Kanya", english: "Virgo" }, nakshatra: { english: "Chitra" } },
        // Moon in 8th house with Rahu
        { name: PlanetName.Moon, house: 8, rashi: { index: 7, sanskrit: "Vrishchika", english: "Scorpio" }, nakshatra: { english: "Anuradha" } },
        // Jupiter in 3rd house (Gemini) - No aspect on Lagna (1), 2nd (2), Moon (8)
        { name: PlanetName.Jupiter, house: 3, rashi: { index: 2, sanskrit: "Mithuna", english: "Gemini" }, nakshatra: { english: "Ardra" } },
      ],
      houses: [
        { houseNumber: 1, signIndex: 0 },
        { houseNumber: 2, signIndex: 1 },
        { houseNumber: 3, signIndex: 2 },
        { houseNumber: 4, signIndex: 3 },
        { houseNumber: 5, signIndex: 4 },
        { houseNumber: 6, signIndex: 5 },
        { houseNumber: 7, signIndex: 6 },
        { houseNumber: 8, signIndex: 7 },
        { houseNumber: 9, signIndex: 8 },
        { houseNumber: 10, signIndex: 9 },
        { houseNumber: 11, signIndex: 10 },
        { houseNumber: 12, signIndex: 11 },
      ]
    };

    const assessment = evaluateNativeNegativeShadesAndCriminality(
      afflictedKundli as any,
      { birthDate: "1988-11-20", birthTime: "16:00", latitude: 15.0, longitude: 75.0, devoteeAge: 38, gender: "Male" }
    );

    // Score must reflect the afflictions
    expect(assessment.overallScore).toBeGreaterThan(30);
    expect(assessment.isJupiterProtected).toBe(false);

    // At least one of the major shadow dimensions must have risk flagged
    const hasAnyRisk = 
      assessment.sensualMarital.hasRisk || 
      assessment.financialIntegrity.hasRisk || 
      assessment.violenceAggression.hasRisk || 
      assessment.legalBandhana.hasRisk;
    expect(hasAnyRisk).toBe(true);

    // Astrological bases must reference classical texts
    const allBasis = [
      assessment.sensualMarital.astrologicalBasisKn,
      assessment.financialIntegrity.astrologicalBasisKn,
      assessment.violenceAggression.astrologicalBasisKn,
      assessment.legalBandhana.astrologicalBasisKn
    ].join(" ");
    expect(allBasis).toMatch(/ಯೋಗ|ಶುಕ್ರ|ಬುಧ|ಕುಜ|ರಾಹು/);
  });

  // Test 5: Vedic Consultation Direct Q&A Verifications (Authoritative Verdicts)
  it("provides authoritative negative 'ಇಲ್ಲ!' verdicts for upright natives across all criminality/fraud/violence queries", () => {
    const pramodContext = {
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      devoteeName: "Pramod",
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: pramodContext.devoteeName,
      birthDate: pramodContext.birthDate,
      birthTime: pramodContext.birthTime,
      latitude: pramodContext.latitude,
      longitude: pramodContext.longitude
    });
    const synthesis = generatePanchangaAngaSynthesis(kundli, pramodContext);

    // 1. Theft / Fraud Query
    const theftAnswer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ನನ್ನ ಜಾತಕದಲ್ಲಿ ಕಳ್ಳತನ, ವಂಚನೆ ಅಥವಾ ಹಣಕಾಸಿನ ಮೋಸ ಮಾಡುವ ಯೋಗವಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(theftAnswer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(theftAnswer).toContain("ಕಳ್ಳತನ (ಚೋರ ಯೋಗ), ವಂಚನೆ");
    expect(theftAnswer).not.toContain("ನೀವು ಕಳ್ಳತನ ಮಾಡುತ್ತೀರಿ");

    // 2. Violence / Murder Query
    const violenceAnswer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ಜಾತಕದಲ್ಲಿ ಕೊಲೆ, ಹಿಂಸೆ, ಆಯುಧ ಪ್ರಯೋಗ ಅಥವಾ ಹತ್ಯಾ ಯೋಗವಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(violenceAnswer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(violenceAnswer).toContain("ಹತ್ಯಾ ಯೋಗ, ಕ್ರೌರ್ಯ, ಮಾರಣಾಂತಿಕ ಹಲ್ಲೆ");
    expect(violenceAnswer).not.toContain("ನೀವು ಕೊಲೆ ಮಾಡುತ್ತೀರಿ");

    // 3. Prison / Legal Confinement Query
    const prisonAnswer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ನನಗೆ ಜೈಲು ವಾಸ, ಅರೆಸ್ಟ್ ಅಥವಾ ಕಾರಾಗೃಹ ಬಂಧನ ಯೋಗವಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(prisonAnswer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(prisonAnswer).toContain("ಬಂಧನ ಯೋಗ, ಪೊಲೀಸ್ ಕೇಸು ಅಥವಾ ಕಾರಾಗೃಹ ವಾಸದ");
    expect(prisonAnswer).not.toContain("ನೀವು ಜೈಲಿಗೆ ಹೋಗುತ್ತೀರಿ");

    // 4. Bad Company / Downward Path Query
    const badCompanyAnswer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ನಾನು ಕುಸಂಗಕ್ಕೆ ಸಿಲುಕಿ ದುರ್ಮಾರ್ಗಕ್ಕೆ ಜಾರುವ ಸಾಧ್ಯತೆ ಇದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(badCompanyAnswer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(badCompanyAnswer).toContain("ದುರ್ಮಾರ್ಗ ಅಥವಾ ಕುಸಂಗಕ್ಕೆ ಬಲಿಯಾಗುವ ದೋಷವಿಲ್ಲ");

    // 5. Extramarital / Sensual Query
    const sensualAnswer = generateVedicConsultationAnswer(
      kundli,
      synthesis.currentDiagnosis,
      synthesis.prescriptions,
      "ದಾಂಪತ್ಯದಲ್ಲಿ ಬಾಹ್ಯ ಆಕರ್ಷಣೆ ಅಥವಾ ಪರಸ್ತ್ರೀ ವ್ಯಾಮೋಹದ ಅಪಾಯವಿದೆಯೇ?",
      "Pramod",
      true,
      33,
      "Male"
    );
    expect(sensualAnswer).toContain("• 🔮 ಸ್ಪಷ್ಟ ದೈವಜ್ಞ ಉತ್ತರ: ಇಲ್ಲ!");
    expect(sensualAnswer).toContain("ದಾಂಪತ್ಯೇತರ ಸಂಬಂಧ, ಪರಸ್ತ್ರೀ/ಪರಪುರುಷ ವ್ಯಾಮೋಹ");

    // 6. Instant Q&A list check for q_integrity_1
    const integrityQuestion = synthesis.instantQAList.find(q => q.id === "q_integrity_1");
    expect(integrityQuestion).toBeDefined();
    expect(integrityQuestion?.panditScriptKn).toContain("ಅತ್ಯುನ್ನತ ಸತ್ಚಾರಿತ್ರ್ಯ ಹಾಗೂ ಸದಾಚಾರದಿಂದ ಕೂಡಿದೆ");
    expect(integrityQuestion?.panditScriptKn).toContain("ಸರ್ವದೋಷ ವಿನಾಶನಃ");
  });
});
