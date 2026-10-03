import { describe, it, expect } from "vitest";
import { PlanetName, type KundliOutput, RASHIS, NAKSHATRAS } from "./AstroTypes";
import { calculateGurukulaMasterclass } from "./kundliReadingGurukulaEngine";

describe("Kundli Reading Gurukula Engine (ಕುಂಡಲಿ ವಾಚನ ಗುರು)", () => {
  const mockKundli: KundliOutput = {
    ascendant: 15.5,
    lagnaRashi: RASHIS[1]!, // Vrishabha (Taurus)
    moonSign: RASHIS[3]!, // Karka (Cancer)
    sunSign: RASHIS[9]!, // Makara (Capricorn)
    moonPada: 2,
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    planets: [
      {
        name: PlanetName.Sun,
        house: 9,
        rashi: RASHIS[9]!, // Makara
        degree: 285.5,
        nakshatra: NAKSHATRAS[20]!
      },
      {
        name: PlanetName.Moon,
        house: 3,
        rashi: RASHIS[3]!, // Karka (Own sign)
        degree: 105.2,
        nakshatra: NAKSHATRAS[7]!
      },
      {
        name: PlanetName.Mars,
        house: 10,
        rashi: RASHIS[10]!, // Kumbha
        degree: 312.0,
        nakshatra: NAKSHATRAS[23]!
      },
      {
        name: PlanetName.Mercury,
        house: 9,
        rashi: RASHIS[9]!, // Makara
        degree: 280.1,
        nakshatra: NAKSHATRAS[20]!
      },
      {
        name: PlanetName.Jupiter,
        house: 4,
        rashi: RASHIS[4]!, // Simha
        degree: 130.4,
        nakshatra: NAKSHATRAS[9]!
      },
      {
        name: PlanetName.Venus,
        house: 10,
        rashi: RASHIS[10]!, // Kumbha
        degree: 320.8,
        nakshatra: NAKSHATRAS[24]!
      },
      {
        name: PlanetName.Saturn,
        house: 6,
        rashi: RASHIS[6]!, // Tula (Exalted)
        degree: 200.0,
        nakshatra: NAKSHATRAS[14]!
      },
      {
        name: PlanetName.Rahu,
        house: 1,
        rashi: RASHIS[1]!, // Vrishabha (Exalted)
        degree: 45.0,
        nakshatra: NAKSHATRAS[3]!
      },
      {
        name: PlanetName.Ketu,
        house: 7,
        rashi: RASHIS[7]!, // Vrischika (Exalted)
        degree: 225.0,
        nakshatra: NAKSHATRAS[16]!
      }
    ],
    maandi: {
      degree: 195.4,
      rashi: RASHIS[6]!,
      windowLabel: "Gulika Window"
    }
  };

  it("calculates exactly 11 progressive pedagogical steps", () => {
    const report = calculateGurukulaMasterclass(
      mockKundli,
      "1990-05-15",
      "08:30",
      "ರಾಮಚಂದ್ರ ಶರ್ಮ"
    );

    expect(report.totalSteps).toBe(11);
    expect(report.steps.length).toBe(11);
    expect(report.nativeName).toBe("ರಾಮಚಂದ್ರ ಶರ್ಮ");
    expect(report.lagnaRashiKn).toBe("ವೃಷಭ");
    expect(report.lagnaLordKn).toBe("ಶುಕ್ರ");
    expect(report.moonSignKn).toBe("ಕರ್ಕಾಟಕ");
  });

  it("verifies Step 1: Lagna & Lagna Lord focuses on House 1 and Lagna Lord's house", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const step1 = report.steps[0]!;

    expect(step1.stepIndex).toBe(1);
    expect(step1.stepCode).toBe("lagna_foundation");
    expect(step1.focusHouses).toContain(1);
    expect(step1.focusHouses).toContain(10); // Venus is in house 10
    expect(step1.whereToLookKn.primaryHouseKn).toContain("1ನೇ ಮನೆ");
    expect(step1.technicalAnalysisKn.shastricRuleKn).toBeTruthy();
    expect(step1.spokenConsultationScriptKn).toBeTruthy();
    expect(step1.practicalGuidanceKn).toBeTruthy();
  });

  it("verifies Step 2: Moon, Rashi & Nakshatra detects Moon in Cancer", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const step2 = report.steps[1]!;

    expect(step2.stepIndex).toBe(2);
    expect(step2.stepCode).toBe("moon_mind_anchor");
    expect(step2.whereToLookKn.primaryHouseKn).toContain("3ನೇ ಮನೆ");
    expect(step2.whereToLookKn.primaryHouseKn).toContain("ಕರ್ಕಾಟಕ");
    expect(step2.spokenConsultationScriptKn).toContain("ಕರ್ಕಾಟಕ");
  });

  it("verifies Step 7: Dusthanas & Maandi identifies House 6, 8, 12 and Maandi", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const step7 = report.steps[6]!;

    expect(step7.stepIndex).toBe(7);
    expect(step7.stepCode).toBe("dusthana_maandi_karma");
    expect(step7.focusHouses).toEqual([6, 8, 12]);
    expect(step7.whereToLookKn.occupyingGrahasKn).toContain("ಮಾಂದಿ");
    expect(step7.spokenConsultationScriptKn).toContain("99%");
  });

  it("verifies Step 8: Planetary Dignity detects Exalted Saturn and Own-Sign Moon", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const step8 = report.steps[7]!;

    expect(step8.stepIndex).toBe(8);
    expect(step8.stepCode).toBe("planetary_dignity_matrix");
    const saturnDignity = report.dignityMatrix.find((d) => d.planet === PlanetName.Saturn);
    expect(saturnDignity?.dignityType).toBe("uccha");
    const moonDignity = report.dignityMatrix.find((d) => d.planet === PlanetName.Moon);
    expect(moonDignity?.dignityType).toBe("swakshetra");
  });

  it("verifies Step 10: Vimshottari Dasha calculates running dasha at age", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const step10 = report.steps[9]!;

    expect(step10.stepIndex).toBe(10);
    expect(step10.stepCode).toBe("vimshottari_dasha_timing");
    expect(step10.whereToLookKn.primaryHouseKn).toContain("ಮಹಾದಶಾ");
    expect(step10.spokenConsultationScriptKn).toBeTruthy();
  });

  it("verifies Step 11: Daivajna Synthesis generates closing consultation script", () => {
    const report = calculateGurukulaMasterclass(
      mockKundli,
      "1990-05-15",
      "08:30",
      "ಗಣೇಶ್ ಭಟ್"
    );
    const step11 = report.steps[10]!;

    expect(step11.stepIndex).toBe(11);
    expect(step11.stepCode).toBe("daivajna_synthesis_remedies");
    expect(step11.spokenConsultationScriptKn).toContain("ಗಣೇಶ್ ಭಟ್");
    expect(step11.practicalGuidanceKn).toContain("ಗೋಕರ್ಣ");
  });
});
