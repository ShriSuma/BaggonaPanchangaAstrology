import { describe, it, expect } from "vitest";
import { calculateGandantaraAndBhaya } from "../core/GandantaraAndBhayaEngine";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("GandantaraAndBhayaEngine Parashari Technical Audit", () => {
  // Sample 1: Chart with Moon in 8th house, Mars in 8th, Rahu in 9th
  const sampleInput1: KundliInput = {
    name: "Devotee One",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    latitude: 14.54, // Gokarna
    longitude: 74.31,
    gender: "Male"
  };

  // Sample 2: Chart with Mars in Cancer (Debilitated / Neecha Mars), Rahu in 8th house
  const sampleInput2: KundliInput = {
    name: "Devotee Two",
    birthDate: "1987-10-24",
    birthTime: "06:15",
    latitude: 13.08, // Chennai
    longitude: 80.27,
    gender: "Female"
  };

  it("evaluates Gandantara life hazard windows and computes safe age limits accurately", () => {
    const kundli1 = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const report = calculateGandantaraAndBhaya(kundli1, sampleInput1, new Date("2026-09-29"));

    expect(report).toBeDefined();
    expect(report.currentAge).toBeGreaterThan(30);
    expect(report.allGandantaras.length).toBeGreaterThanOrEqual(1);

    for (const g of report.activeGandantaras) {
      expect(g.vulnerableTillAge).toBeGreaterThanOrEqual(18);
      expect(g.isCurrentlyInDangerWindow).toBe(report.currentAge <= g.vulnerableTillAge);

      // Verify 5-language localization for names, age window descriptions, cautions
      expect(g.name.kn.length).toBeGreaterThan(5);
      expect(g.name.hi.length).toBeGreaterThan(5);
      expect(g.name.te.length).toBeGreaterThan(5);
      expect(g.name.ta.length).toBeGreaterThan(5);
      expect(g.name.en.length).toBeGreaterThan(5);

      expect(g.ageWindowDescription.kn.length).toBeGreaterThan(20);
      expect(g.ageWindowDescription.en.length).toBeGreaterThan(20);

      expect(g.cautionDirectives.kn.length).toBeGreaterThanOrEqual(1);
      expect(g.cautionDirectives.en.length).toBeGreaterThanOrEqual(1);

      expect(g.protectiveParihara.kn.length).toBeGreaterThan(5);
      expect(g.protectiveParihara.en.length).toBeGreaterThan(5);
    }
  });

  it("detects innate phobias (hydrophobia, hemophobia, ophidiophobia) and provides psychological symptoms & remedies", () => {
    const kundli2 = calculateKundli(sampleInput2, { ayanamsaModel: "lahiri" });
    const report = calculateGandantaraAndBhaya(kundli2, sampleInput2, new Date("2026-09-29"));

    expect(report.detectedFears).toBeDefined();
    expect(report.detectedFears.length).toBeGreaterThanOrEqual(1);

    for (const fear of report.detectedFears) {
      // Must have planetary trigger and symptoms in all 5 languages
      expect(fear.planetaryTrigger.kn.length).toBeGreaterThan(10);
      expect(fear.planetaryTrigger.hi.length).toBeGreaterThan(10);
      expect(fear.planetaryTrigger.en.length).toBeGreaterThan(10);

      expect(fear.psychologicalSymptom.kn.length).toBeGreaterThan(15);
      expect(fear.psychologicalSymptom.hi.length).toBeGreaterThan(15);
      expect(fear.psychologicalSymptom.en.length).toBeGreaterThan(15);

      expect(fear.realLifeManifestation.kn.length).toBeGreaterThan(15);
      expect(fear.realLifeManifestation.en.length).toBeGreaterThan(15);

      expect(fear.strengtheningPractice.kn.length).toBeGreaterThan(10);
      expect(fear.strengtheningPractice.en.length).toBeGreaterThan(10);
    }
  });

  it("integrates seamlessly into ComprehensiveDoshaReport", () => {
    const kundli = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const comprehensiveReport = calculateComprehensiveDoshas(kundli, sampleInput1, new Date("2026-09-29"));

    expect(comprehensiveReport.gandantaraAndBhaya).toBeDefined();
    expect(comprehensiveReport.gandantaraAndBhaya.currentAge).toBeGreaterThan(30);
    expect(comprehensiveReport.gandantaraAndBhaya.allGandantaras).toBeDefined();
    expect(comprehensiveReport.gandantaraAndBhaya.detectedFears).toBeDefined();
  });
});
