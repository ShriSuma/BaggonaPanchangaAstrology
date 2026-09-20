import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import groundTruthData from "./fixtures/twentyNewInternetBenchmarksGroundTruth.json";

export interface BenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  category: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  gender: "Male" | "Female";
  expectedCurrentLifeCategory?: string;
}

const BENCHMARKS: BenchmarkProfile[] = groundTruthData as BenchmarkProfile[];

describe("Daivika Parihara (Divine Remedies) & Turnaround Timing 20-Benchmark Audit", () => {
  describe("20 Real-World Benchmark Profiles Audit", () => {
    for (const person of BENCHMARKS) {
      it(`evaluates ${person.name} (${person.publicRole}) with Parashari accuracy and authentic turnaround timing`, () => {
        const kundli = calculateKundli({
          name: person.name,
          birthDate: person.birthDate,
          birthTime: person.birthTime,
          latitude: person.lat,
          longitude: person.lon
        });

        const report = generateKundliRemedyReport(kundli, {
          name: person.name,
          birthDate: person.birthDate,
          birthTime: person.birthTime,
          latitude: person.lat,
          longitude: person.lon
        });

        // 1. Elimination of False Anger Flagging:
        // World-class creators, athletes, thinkers, and entrepreneurs must NEVER be falsely diagnosed with "anger_temper"
        expect(report.primaryStruggle.category).not.toBe("anger_temper");
        expect(report.psychologicalProfile.krodhaLevel).toBeLessThan(65);

        // 2. Turnaround Point & Timing Window (ಭಾಗ್ಯೋದಯ ಕಾಲಾವಧಿ) Integrity
        expect(report.lifeTurnaroundTiming).toBeDefined();
        expect(report.lifeTurnaroundTiming.timelineKn).toBeTruthy();
        expect(report.lifeTurnaroundTiming.timelineEn).toBeTruthy();
        expect(report.lifeTurnaroundTiming.catalystGrahaKn).toBeTruthy();
        expect(report.lifeTurnaroundTiming.breakthroughMechanismKn).toBeTruthy();
        expect(report.lifeTurnaroundTiming.specificSevaKn).toBeTruthy();

        // 3. Classical Language & Formatting Rules:
        // - Standard English digits (0-9), zero markdown bold asterisks
        expect(report.lifeTurnaroundTiming.timelineKn).not.toContain("**");
        expect(report.lifeTurnaroundTiming.breakthroughMechanismKn).not.toContain("**");
        expect(report.lifeTurnaroundTiming.specificSevaKn).not.toContain("**");

        // 4. Chief Priest Contact & Determinism
        expect(report.chiefPriestBlessing.priestName.kn).toBe("ವೇದಮೂರ್ತಿ ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
        expect(report.chiefPriestBlessing.priestName.en).toBe("Vedamurthi Shri Shreeram Pandit");
        expect(report.chiefPriestBlessing.phone).toBe("+91 99723 39362");

        // 5. Authentic Dasha-Bhukti Analysis (Dynamic, non-boilerplate)
        expect(report.dashaBhuktiAnalysis.currentMahaDasha).toBeTruthy();
        expect(report.dashaBhuktiAnalysis.currentBhukti).toBeTruthy();
        expect(report.dashaBhuktiAnalysis.periodEffect.kn).toBeTruthy();
        expect(report.dashaBhuktiAnalysis.periodEffect.kn).not.toContain("ಮನಸ್ಸಿನಲ್ಲಿ ಏರಿಳಿತಗಳು ಉಂಟಾಗಬಹುದು."); // Old static boilerplate removed

        // 6. Targeted Gokarna Temple Sevas
        expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toBeTruthy();
        expect(report.gokarnaTempleRemedies.prescribedSeva.idealDay.kn).toBeTruthy();
      });
    }
  });

  describe("Specific Devotee Archetypes & True Mars Combustion Verification", () => {
    it("diagnoses Shreedhar Bhat (Devotee with Marriage Delay) with authentic marriage remedy", () => {
      const shreedharInput = {
        name: "Shreedhar Bhat",
        birthDate: "1993-03-22",
        birthTime: "06:45",
        latitude: 14.5479,
        longitude: 74.3188
      };
      const kundli = calculateKundli(shreedharInput);
      const report = generateKundliRemedyReport(kundli, shreedharInput);

      // Must diagnose marriage delay / relationship alignment, NOT anger
      expect(report.primaryStruggle.category).not.toBe("anger_temper");
      expect(report.psychologicalProfile.krodhaLevel).toBeLessThan(50);
      expect(report.lifeTurnaroundTiming.timelineKn).toBeTruthy();
      // Targeted seva should address marriage / harmony (Uma-Maheshwara or Swayamvara Parvati)
      const sevaKn = report.lifeTurnaroundTiming.specificSevaKn + " " + report.gokarnaTempleRemedies.prescribedSeva.name.kn;
      expect(
        sevaKn.includes("ಉಮಾ-ಮಹೇಶ್ವರ") ||
        sevaKn.includes("ಸ್ವಯಂವರ") ||
        sevaKn.includes("ಕಲ್ಯಾಣ") ||
        sevaKn.includes("ಬೃಹಸ್ಪತಿ") ||
        sevaKn.includes("ಕ್ಷೀರಾಭಿಷೇಕ")
      ).toBe(true);
    });

    it("diagnoses Child Devotee (Age 8) with student academic focus and Medha Dakshinamurthy", () => {
      const childInput = {
        name: "Child Devotee",
        birthDate: "2018-04-12",
        birthTime: "10:15",
        latitude: 12.9716,
        longitude: 77.5946
      };
      const kundli = calculateKundli(childInput);
      const report = generateKundliRemedyReport(kundli, childInput);

      // 8-year-old child must NEVER be diagnosed with violent Pitta rage
      expect(report.primaryStruggle.category).not.toBe("anger_temper");
      expect(report.primaryStruggle.category).toBe("student_academic");
      expect(report.psychologicalProfile.krodhaLevel).toBeLessThan(50);
      // Prescribes Medha Dakshinamurthy / Vidya Ganapati
      const sevaKn = report.lifeTurnaroundTiming.specificSevaKn + " " + report.gokarnaTempleRemedies.prescribedSeva.name.kn;
      expect(
        sevaKn.includes("ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ") ||
        sevaKn.includes("ವಿದ್ಯಾ") ||
        sevaKn.includes("ಸರಸ್ವತೀ")
      ).toBe(true);
    });

    it("diagnoses Dr. Manmohan Singh with statesmanship / leadership, NOT anger", () => {
      const manmohanInput = {
        name: "Dr. Manmohan Singh",
        birthDate: "1932-09-26",
        birthTime: "14:00",
        latitude: 32.9328,
        longitude: 72.8553
      };
      const kundli = calculateKundli(manmohanInput);
      const report = generateKundliRemedyReport(kundli, manmohanInput);

      // Gentle statesman must NOT be flagged with anger
      expect(report.primaryStruggle.category).not.toBe("anger_temper");
      expect(report.psychologicalProfile.krodhaLevel).toBeLessThan(65);
      expect(report.lifeTurnaroundTiming.timelineKn).toBeTruthy();
    });

    it("accurately detects true fiery Mars combustion in Lagna (mockKundliMarsAfflicted)", () => {
      // Complete mock fixture matching KundliOutput interface
      const mockKundliMarsAfflicted: any = {
        planets: [
          { name: "Sun", degree: 45, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
          { name: "Moon", degree: 140, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
          { name: "Mars", degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 1 },
          { name: "Mercury", degree: 60, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 2 },
          { name: "Jupiter", degree: 120, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 3 },
          { name: "Venus", degree: 90, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 6, english: "Ardra", sanskrit: "Ardra", deity: "Rudra" }, house: 2 },
          { name: "Saturn", degree: 210, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 7 },
          { name: "Rahu", degree: 330, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, nakshatra: { index: 24, english: "Shatabhisha", sanskrit: "Shatabhisha", deity: "Varuna" }, house: 10 },
          { name: "Ketu", degree: 150, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 11, english: "Purva Phalguni", sanskrit: "Purva Phalguni", deity: "Bhaga" }, house: 4 }
        ],
        houses: Array.from({ length: 12 }, (_, i) => i * 30),
        ascendant: 15,
        lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" },
        moonSign: { index: 4, english: "Leo", sanskrit: "Simha" },
        sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
        moonPada: 1
      };

      const report = generateKundliRemedyReport(mockKundliMarsAfflicted, {
        name: "Afflicted Devotee",
        birthDate: "1995-08-15",
        birthTime: "08:30",
        latitude: 14.5479,
        longitude: 74.3188
      });

      // True fiery Mars in 1st house (Aries) triggers authentic anger/temper diagnosis
      expect(report.primaryStruggle.category).toBe("anger_temper");
      expect(report.psychologicalProfile.krodhaLevel).toBeGreaterThanOrEqual(70);
      expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಕುಜ ಶಾಂತಿ");
    });
  });
});
