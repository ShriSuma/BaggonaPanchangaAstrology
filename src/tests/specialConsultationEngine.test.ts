import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generateSpecialConsultationReport,
  answerCustomDivineQuestion
} from "../core/SpecialConsultationEngine";

describe("Special Divine Consultation Engine Test Suite", () => {
  const profile = {
    name: "Dr. B.V. Raman",
    birthDate: "1912-08-08",
    birthTime: "19:38",
    latitude: 12.9716,
    longitude: 77.5946,
    gender: "Male" as const,
    maritalStatus: "married"
  };

  const kundli = calculateKundli({
    name: profile.name,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    latitude: profile.latitude,
    longitude: profile.longitude,
    gender: profile.gender
  });

  it("calculates kundli successfully", () => {
    expect(kundli).toBeDefined();
    expect(kundli.planets.length).toBeGreaterThanOrEqual(9);
  });

  it("generates full 6-module Special Consultation Report", () => {
    const report = generateSpecialConsultationReport(kundli, {
      devoteeName: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      maritalStatus: profile.maritalStatus,
      gender: profile.gender
    });

    // 1. Basic Parameters
    expect(report.devoteeName).toBe(profile.name);
    expect(report.lagnaNameKn).toBeDefined();
    expect(report.rashiNameKn).toBeDefined();
    expect(report.nakshatraNameKn).toBeDefined();

    // 2. Module 1: 12-Month Predictive Varshaphala
    expect(report.twelveMonthForecast.months.length).toBe(12);
    expect(report.twelveMonthForecast.months[0].monthNameKn).toBeDefined();
    expect(report.twelveMonthForecast.months[0].financialRating).toMatch(/high|moderate|cautious/);
    expect(report.twelveMonthForecast.months[0].auspiciousDates).toBeDefined();

    // 3. Module 2: Marriage Destiny Dossier
    expect(report.marriageDossier.verdictTitleKn).toBeDefined();
    expect(report.marriageDossier.marriageWindowKn).toBeDefined();
    expect(report.marriageDossier.spouseProfile.directionKn).toBeDefined();
    expect(report.marriageDossier.sacredRemedyKn).toBeDefined();

    // 4. Module 3: Wealth & Career Blueprint
    expect(report.wealthCareer.vocationTypeKn).toBeDefined();
    expect(report.wealthCareer.induLagnaProsperityScore).toBeGreaterThan(0);
    expect(report.wealthCareer.primaryWealthYogasKn.length).toBeGreaterThan(0);
    expect(report.wealthCareer.debtClearanceTimelineKn).toBeDefined();

    // 5. Module 4: Gemstone & Rudraksha Prescription
    expect(report.gemstoneRudraksha.lifeGem.nameKn).toBeDefined();
    expect(report.gemstoneRudraksha.lifeGem.recommendedWeight).toBeDefined();
    expect(report.gemstoneRudraksha.fortuneGem.nameKn).toBeDefined();
    expect(report.gemstoneRudraksha.prohibitedGems.gemNamesKn).toBeDefined();
    expect(report.gemstoneRudraksha.prescribedRudraksha.mukhiKn).toBeDefined();
    expect(report.gemstoneRudraksha.prescribedYantra.nameKn).toBeDefined();

    // 6. Module 5: Ayur Sanjeevini Health Profile
    expect(report.ayurHealth.prakritiConstitutionKn).toBeDefined();
    expect(report.ayurHealth.vulnerableOrgansKn.length).toBeGreaterThan(0);
    expect(report.ayurHealth.healingMantraKn).toBeDefined();

    // 7. Module 6: Astrological Q&A
    expect(report.presetQnAList.length).toBe(5);
    expect(report.presetQnAList[0].questionKn).toContain("ಮನೆ");
    expect(report.presetQnAList[0].answerKn).toBeDefined();
  });

  it("answers custom question with fallback when no api key is provided", async () => {
    const report = generateSpecialConsultationReport(kundli, {
      devoteeName: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime
    });

    const res = await answerCustomDivineQuestion(report, "ನನ್ನ ಮಗಳ ವಿದ್ಯಾಭ್ಯಾಸ ಹೇಗಿದೆ?", "kn");
    expect(res.answer).toBeDefined();
    expect(res.answer.length).toBeGreaterThan(50);
    expect(res.remedy).toContain("ಗೋಕರ್ಣ");
  });
});
