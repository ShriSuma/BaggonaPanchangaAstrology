import { describe, it, expect } from "vitest";
import {
  digitalRootR9,
  calculateMoolank,
  calculateBhagyank,
  calculateNameNumerology,
  generateVedicGridMatrix,
  parseActiveVedicYogas,
  calculateVedicCompatibility,
  calculateMahadashaTimeline,
  calculateAnnualAntardasha,
  calculateNestedDashaState,
  calculateMobileNumerology,
  calculateVehicleNumerology,
  buildCompleteVedicNumerologyProfile,
  VEDIC_37_YOGAS_DATABASE
} from "../features/sankhyashastra/vedicNumerologyEngine";

describe("Vedic Numerology (Sankhya Shastra) Engine - Full Test Suite", () => {
  describe("Digital Root R9(x) Function", () => {
    it("computes single-digit roots (1..9) with modular formula", () => {
      expect(digitalRootR9(1)).toBe(1);
      expect(digitalRootR9(9)).toBe(9);
      expect(digitalRootR9(10)).toBe(1);
      expect(digitalRootR9(18)).toBe(9);
      expect(digitalRootR9(24)).toBe(6); // 2+4 = 6
      expect(digitalRootR9(30)).toBe(3); // 3+0 = 3
      expect(digitalRootR9(36)).toBe(9); // 3+6 = 9
      expect(digitalRootR9(50)).toBe(5); // 5+0 = 5
      expect(digitalRootR9(108)).toBe(9); // 1+0+8 = 9
    });
  });

  describe("System Validation Benchmark: Test Case A (Sachin Tendulkar)", () => {
    // Input: DOB = April 24, 1973 (24-04-1973); Name = "SACHIN TENDULKAR"
    const day = 24;
    const month = 4;
    const year = 1973;
    const name = "SACHIN TENDULKAR";

    it("calculates Moolank = 6 (Venus) for compound day 24", () => {
      const mInfo = calculateMoolank(day);
      expect(mInfo.moolank).toBe(6);
      expect(mInfo.isCompound).toBe(true);
      expect(mInfo.rulingGraha.sanskritName).toBe("Shukra");
    });

    it("calculates Bhagyank = 3 (Jupiter) for 24-04-1973 (Sum 30)", () => {
      const bInfo = calculateBhagyank(day, month, year);
      expect(bInfo.totalSum).toBe(30);
      expect(bInfo.bhagyank).toBe(3);
      expect(bInfo.rulingGraha.sanskritName).toBe("Guru");
    });

    it("calculates Chaldean Namank = 5 (Mercury) for 'SACHIN TENDULKAR' (Sum 50)", () => {
      const nInfo = calculateNameNumerology(name);
      // SACHIN: 3+1+3+5+1+5 = 18
      // TENDULKAR: 4+5+5+4+6+3+2+1+2 = 32
      // Total = 18 + 32 = 50 -> 5
      expect(nInfo.namankCompound).toBe(50);
      expect(nInfo.namank).toBe(5);
      expect(nInfo.rulingGraha.sanskritName).toBe("Budha");
    });

    it("populates 3x3 Vedic Grid with exact cell frequencies for Sachin Tendulkar", () => {
      const grid = generateVedicGridMatrix(day, month, year);
      // Century 19 excluded.
      // Raw digits: 2, 4 (Day 24), 4 (Month 04), 7, 3 (Year 73).
      // Compound day 24 adds Moolank 6.
      // Bhagyank 3 is added.
      // Expected Frequencies:
      // Cell 3 = 2 (Year 3 + Bhagyank 3)
      // Cell 4 = 2 (Day 4 + Month 4)
      // Cell 2 = 1 (Day 2)
      // Cell 6 = 1 (Moolank 6)
      // Cell 7 = 1 (Year 7)
      // Cells 1, 5, 8, 9 = 0
      expect(grid.cells[3].count).toBe(2);
      expect(grid.cells[4].count).toBe(2);
      expect(grid.cells[2].count).toBe(1);
      expect(grid.cells[6].count).toBe(1);
      expect(grid.cells[7].count).toBe(1);
      expect(grid.cells[1].count).toBe(0);
      expect(grid.cells[5].count).toBe(0);
      expect(grid.cells[8].count).toBe(0);
      expect(grid.cells[9].count).toBe(0);

      // Verify Missing Numbers
      expect(grid.missingNumbers).toEqual([1, 5, 8, 9]);

      // Verify Active Yogas (Y04: 3-6-2 Education, Y21: 6-2 Artistic, Y23: 3-6 Advisory Cash Flow, Y26: 2-4 Drishti Conflict, Y30: 3-2 Philosophical Wisdom)
      const { activeYogas } = parseActiveVedicYogas(grid);
      const yogaIds = activeYogas.map((y) => y.id);
      expect(yogaIds).toContain("Y04"); // 3-6-2
      expect(yogaIds).toContain("Y21"); // 6-2
      expect(yogaIds).toContain("Y23"); // 3-6
      expect(yogaIds).toContain("Y26"); // 2-4
      expect(yogaIds).toContain("Y30"); // 3-2
    });
  });

  describe("System Validation Benchmark: Test Case B (High-Stress Profile)", () => {
    // Subject Details: Born August 14, 1994 (14-08-1994), Target Date = August 19, 2026
    const day = 14;
    const month = 8;
    const year = 1994;
    const targetDate = new Date(2026, 7, 19); // 19-Aug-2026

    it("calculates Moolank = 5 (Mercury) for compound day 14", () => {
      const mInfo = calculateMoolank(day);
      expect(mInfo.moolank).toBe(5);
      expect(mInfo.isCompound).toBe(true);
      expect(mInfo.rulingGraha.sanskritName).toBe("Budha");
    });

    it("calculates Bhagyank = 9 (Mars) for 14-08-1994 (Sum 36 -> 9)", () => {
      const bInfo = calculateBhagyank(day, month, year);
      expect(bInfo.totalSum).toBe(36);
      expect(bInfo.bhagyank).toBe(9);
      expect(bInfo.rulingGraha.sanskritName).toBe("Mangala");
    });

    it("populates 3x3 Vedic Grid with exact cell frequencies for Test Case B", () => {
      const grid = generateVedicGridMatrix(day, month, year);
      // Century 19 excluded.
      // Raw digits: 1, 4 (Day 14), 8 (Month 08), 9, 4 (Year 94).
      // Compound day 14 adds Moolank 5.
      // Bhagyank 9 is added.
      // Expected Frequencies:
      // Cell 1 = 1 (Day 1)
      // Cell 4 = 2 (Day 4 + Year 4)
      // Cell 5 = 1 (Moolank 5)
      // Cell 8 = 1 (Month 8)
      // Cell 9 = 2 (Year 9 + Bhagyank 9)
      // Cells 2, 3, 6, 7 = 0
      expect(grid.cells[1].count).toBe(1);
      expect(grid.cells[4].count).toBe(2);
      expect(grid.cells[5].count).toBe(1);
      expect(grid.cells[8].count).toBe(1);
      expect(grid.cells[9].count).toBe(2);
      expect(grid.cells[2].count).toBe(0);
      expect(grid.cells[3].count).toBe(0);
      expect(grid.cells[6].count).toBe(0);
      expect(grid.cells[7].count).toBe(0);

      expect(grid.missingNumbers).toEqual([2, 3, 6, 7]);
    });

    it("evaluates Dasha timing at Age 32 on Aug 19, 2026 and flags Multiplicity Overload", () => {
      const dasha = calculateNestedDashaState(day, month, year, targetDate);
      expect(dasha.currentAge).toBe(32);
      // Active Mahadasha at age 32:
      // MD starts with Moolank 5 (Ages 0..5, 5 yrs)
      // MD 6: Ages 5..11 (6 yrs)
      // MD 7: Ages 11..18 (7 yrs)
      // MD 8: Ages 18..26 (8 yrs)
      // MD 9: Ages 26..35 (9 yrs) -> Age 32 falls in MD 9 (Mars)
      expect(dasha.activeMahadasha.grahaNumber).toBe(9);
      expect(dasha.activeMahadasha.grahaMeta.sanskritName).toBe("Mangala");

      // Verify Multiplicity Overload flag because 9 and 4 are double in the grid
      expect(dasha.multiplicityStatus.isOverload).toBe(true);
      expect(dasha.multiplicityStatus.overloadDigits).toContain(9);
      expect(dasha.multiplicityStatus.explanationKn).toContain("Multiplicity Overload");
    });
  });

  describe("Complete 37 Yogas Parser Matrix (Y01 to Y37)", () => {
    it("contains all 37 codified yogas in the database", () => {
      expect(VEDIC_37_YOGAS_DATABASE).toHaveLength(37);
      const ids = VEDIC_37_YOGAS_DATABASE.map((y) => y.id);
      for (let i = 1; i <= 37; i++) {
        const idStr = `Y${String(i).padStart(2, "0")}`;
        expect(ids).toContain(idStr);
      }
    });

    it("parses plane yogas Y01 (3-1-9), Y07 (6-7-5), Y06 (2-8-4) accurately", () => {
      // Grid with Thought plane 3, 1, 9
      const gridA = generateVedicGridMatrix(19, 3, 1993);
      const { activeYogas } = parseActiveVedicYogas(gridA);
      const yogaIds = activeYogas.map((y) => y.id);
      expect(yogaIds).toContain("Y01"); // Thought Plane (3-1-9)
      expect(yogaIds).toContain("Y20"); // 1-9
      expect(yogaIds).toContain("Y31"); // 3-9
    });
  });

  describe("Asymmetric Graha Maitri Directional Compatibility Engine", () => {
    it("calculates directional compatibility with asymmetric scores", () => {
      // Person A: Sun (1) vs Person B: Saturn (8)
      // 1 -> 8 is Enemy (20)
      // 8 -> 1 is Enemy (20)
      const res = calculateVedicCompatibility(
        { name: "Devotee 1", day: 1, month: 1, year: 1990 }, // M=1, B=3 (1+1+1+9+9+0 = 21 -> 3)
        { name: "Devotee 2", day: 8, month: 8, year: 1998 }  // M=8, B=8 (8+8+1+9+9+8 = 43 -> 7)
      );

      expect(res.moolankA).toBe(1);
      expect(res.moolankB).toBe(8);
      expect(res.scoreMoolankAB.score).toBe(20);
      expect(res.scoreMoolankBA.score).toBe(20);
      expect(res.compatibilityIndex).toBeLessThan(60);
    });

    it("calculates high harmony for friendly numbers (e.g. 1 and 5)", () => {
      // Sun (1) and Mercury (5)
      const res = calculateVedicCompatibility(
        { name: "Person 1", day: 1, month: 5, year: 1990 }, // M=1, B=7
        { name: "Person 5", day: 5, month: 5, year: 1990 }  // M=5, B=2
      );

      expect(res.scoreMoolankAB.score).toBe(100);
      expect(res.scoreMoolankBA.score).toBe(100);
      expect(res.compatibilityIndex).toBeGreaterThanOrEqual(60);
    });
  });

  describe("Mobile & Vehicle Numerology Engines", () => {
    it("evaluates mobile number reduction and warns on prohibited ending 2, 4, 8", () => {
      // 9972339362 -> ending in 2
      const res = calculateMobileNumerology("9972339362");
      expect(res.lastDigit).toBe(2);
      expect(res.hasProhibitedEnding).toBe(true);
      expect(res.verdictKn).toContain("ಎಚ್ಚರಿಕೆ");
    });

    it("evaluates favorable mobile numbers without prohibited endings", () => {
      // 9845012345 -> Sum = 41 -> 5 (Mercury)
      const res = calculateMobileNumerology("9845012345");
      expect(res.singleDigit).toBe(5);
      expect(res.lastDigit).toBe(5);
      expect(res.isFavorable).toBe(true);
      expect(res.hasProhibitedEnding).toBe(false);
    });

    it("flags vehicle friction for Moolank 3 against vehicle sum 6 (Jupiter vs Venus)", () => {
      // Plate: 1230 -> 1+2+3+0 = 6
      const res = calculateVehicleNumerology("KA 01 AB 1230", 3, 3);
      expect(res.singleDigit).toBe(6);
      expect(res.hasFrictionWithMoolank).toBe(true);
    });
  });

  describe("Complete Vedic Profile Generator", () => {
    it("builds a 100% complete profile for any native", () => {
      const profile = buildCompleteVedicNumerologyProfile("ShreeSuma", 15, 5, 1993);
      expect(profile.devoteeName).toBe("ShreeSuma");
      expect(profile.moolankInfo.moolank).toBe(6);
      expect(profile.bhagyankInfo.bhagyank).toBe(6); // 15-05-1993 -> 1+5+0+5+1+9+9+3 = 33 -> 6
      expect(profile.gridMatrix).toBeDefined();
      expect(profile.yogasResult.activeYogas.length).toBeGreaterThan(0);
      expect(profile.nestedDasha.activeMahadasha).toBeDefined();
      expect(profile.nestedDasha.activeAntardasha).toBeDefined();
      expect(profile.optimalNameTargets).toBeDefined();
    });
  });

  describe("Vedic Numerology Engine Corner Cases & Edge Conditions", () => {
    it("handles Indic Kannada text input seamlessly through phoneme transliteration", () => {
      const nInfo = calculateNameNumerology("ಶ್ರೀರಾಮ್");
      expect(nInfo.cleanName.length).toBeGreaterThan(0);
      expect(nInfo.namank).toBeGreaterThanOrEqual(1);
      expect(nInfo.namank).toBeLessThanOrEqual(9);
      expect(nInfo.rulingGraha).toBeDefined();
    });

    it("handles Leap Year Birth Dates (e.g. Feb 29, 2024)", () => {
      const profile = buildCompleteVedicNumerologyProfile("LeapNative", 29, 2, 2024);
      // Day 29 -> 2+9 = 11 -> 2 (Moon)
      expect(profile.moolankInfo.moolank).toBe(2);
      expect(profile.moolankInfo.isCompound).toBe(true);
      // Sum: 2+9 + 0+2 + 2+0+2+4 = 11 + 2 + 8 = 21 -> 3 (Jupiter)
      expect(profile.bhagyankInfo.bhagyank).toBe(3);
      expect(profile.gridMatrix.cells[2].count).toBeGreaterThan(0);
    });

    it("handles Millennium 2000 dates (e.g. Jan 1, 2000)", () => {
      const profile = buildCompleteVedicNumerologyProfile("Y2KNative", 1, 1, 2000);
      expect(profile.moolankInfo.moolank).toBe(1);
      expect(profile.moolankInfo.isCompound).toBe(false);
      // 1 + 1 + 2 + 0 + 0 + 0 = 4 (Rahu)
      expect(profile.bhagyankInfo.bhagyank).toBe(4);
      // Century 20 excluded, YY is 00 (no year digits added), Bhagyank 4 added, Day 1 and Month 1 added
      expect(profile.gridMatrix.cells[1].count).toBe(2); // Day 1 + Month 1
      expect(profile.gridMatrix.cells[4].count).toBe(1); // Bhagyank 4
    });

    it("handles zero, negative and large boundary inputs in Digital Root R9(x)", () => {
      expect(digitalRootR9(0)).toBe(9);
      expect(digitalRootR9(-18)).toBe(9);
      expect(digitalRootR9(-24)).toBe(6);
      expect(digitalRootR9(999999)).toBe(9);
      expect(digitalRootR9(1000000)).toBe(1);
    });

    it("handles empty or blank name inputs gracefully with default auspicious fallback", () => {
      const nInfo = calculateNameNumerology("");
      expect(nInfo.cleanName).toBe("SHREE");
      expect(nInfo.namank).toBeGreaterThanOrEqual(1);
    });
  });
});
