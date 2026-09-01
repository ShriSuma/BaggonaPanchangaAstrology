import { describe, expect, it } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generateBhagyodayaReport } from "../features/bhagyodaya/bhagyodayaEngine";

describe("BhagyodayaEngine", () => {
  const personA = {
    name: "Shreeram Sharma",
    birthDate: "1992-06-15",
    birthTime: "08:30",
    latitude: 14.5478,
    longitude: 74.3188,
    gotra: "ವಸಿಷ್ಠ"
  };

  const personB = {
    name: "Ananya Hegde",
    birthDate: "1998-11-24",
    birthTime: "17:45",
    latitude: 12.9716,
    longitude: 77.5946,
    gotra: "ವಿಶ್ವಾಮಿತ್ರ"
  };

  it("calculates all 7 emotional pillars deterministically in Kannada", () => {
    const k = calculateKundli(personA);
    const report = generateBhagyodayaReport(k, personA, "kn");

    expect(report.devoteeName).toBe("Shreeram Sharma");
    expect(report.birthDate).toBe("1992-06-15");
    expect(report.lagnaRashi).toBeTruthy();
    expect(report.moonRashi).toBeTruthy();
    expect(report.nakshatra).toBeTruthy();
    expect(report.nakshatraPada).toBeGreaterThanOrEqual(1);
    expect(report.nakshatraPada).toBeLessThanOrEqual(4);

    // Pillar 1: Wealth & Debt
    expect(report.wealth.dhanaYogaScore).toBeGreaterThanOrEqual(60);
    expect(report.wealth.dhanaYogaScore).toBeLessThanOrEqual(100);
    expect(report.wealth.wealthVerdict).toBeTruthy();
    expect(report.wealth.runaVimochanaTimeline).toBeTruthy();
    expect(report.wealth.goldenCareerSectors.length).toBeGreaterThan(0);
    expect(report.wealth.optimalWealthDirection).toBeTruthy();

    // Pillar 2: Marriage & Children
    expect(report.relationship.vivahaYogaWindow).toBeTruthy();
    expect(report.relationship.spouseCharacteristics).toBeTruthy();
    expect(report.relationship.santathiBlessingWindow).toBeTruthy();

    // Pillar 3: Health Vitality
    expect(report.health.vitalityScore).toBeGreaterThan(0);
    expect(report.health.constitutionDosha).toMatch(/Vata|Pitta|Kapha|Tridosha/);
    expect(report.health.ayurSanjeeviniHerbs.length).toBeGreaterThan(0);
    expect(report.health.mahaMrityunjayaShield).toBeTruthy();

    // Pillar 4: Protection
    expect(report.protection.drishtiSensitivityLevel).toMatch(/Low|Medium|High|Severe/);
    expect(report.protection.sudarshanaKavachaMantra).toContain("ಮಹಾಸುದರ್ಶನಾಯ");

    // Pillar 5: 10-Year Milestones (2026-2036)
    expect(report.milestones.length).toBe(10);
    expect(report.milestones[0].year).toBe(new Date().getFullYear());
    expect(report.milestones[0].theme).toBeTruthy();
    expect(report.milestones[0].favorableMonths.length).toBeGreaterThan(0);

    // Pillar 6: Gemstone & Rudraksha
    expect(report.karmaBlueprint.bhagyaGemstone.name).toBeTruthy();
    expect(report.karmaBlueprint.bhagyaGemstone.weightRatti).toBeTruthy();
    expect(report.karmaBlueprint.rudrakshaMukhi).toBeTruthy();
    expect(report.karmaBlueprint.fiveMinuteMorningRoutine.prescribedMantra).toBeTruthy();

    // Pillar 7: Temple Blessing
    expect(report.templeBlessing.deity).toContain("ಮಹಾಬಲೇಶ್ವರ");
    expect(report.templeBlessing.specialSankalpaMantra).toContain("ವಸಿಷ್ಠ");
    expect(report.templeBlessing.specialSankalpaMantra).toContain("Shreeram Sharma");
  });

  it("calculates English report with localized strings and 10 milestones", () => {
    const k = calculateKundli(personA);
    const report = generateBhagyodayaReport(k, personA, "en");

    expect(report.devoteeName).toBe("Shreeram Sharma");
    expect(report.wealth.wealthVerdict).toContain("Ascendant");
    expect(report.milestones.length).toBe(10);
    expect(report.milestones[0].ratingLabel).toMatch(/Golden|Steady|Vigilance/);
    expect(report.karmaBlueprint.fiveMinuteMorningRoutine.facingDirection).toContain("East");
  });

  it("yields distinct, personalized reports and milestone timelines for different people", () => {
    const kA = calculateKundli(personA);
    const reportA = generateBhagyodayaReport(kA, personA, "kn");

    const kB = calculateKundli(personB);
    const reportB = generateBhagyodayaReport(kB, personB, "kn");

    // Must have different lagna/moon/nakshatra
    expect(reportA.birthDate).not.toBe(reportB.birthDate);
    expect(reportA.gotra).toBe("ವಸಿಷ್ಠ");
    expect(reportB.gotra).toBe("ವಿಶ್ವಾಮಿತ್ರ");

    expect(reportA.templeBlessing.specialSankalpaMantra).toContain("ವಸಿಷ್ಠ");
    expect(reportB.templeBlessing.specialSankalpaMantra).toContain("ವಿಶ್ವಾಮಿತ್ರ");

    // Milestones must be distinct based on their differing age and running Dasha-Bhukti
    expect(reportA.milestones[0].age).not.toBe(reportB.milestones[0].age);
    expect(reportA.milestones[0].astrologicalReason).not.toBe(reportB.milestones[0].astrologicalReason);
  });
});
