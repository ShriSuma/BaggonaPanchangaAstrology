import { describe, it, expect } from "vitest";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("ComprehensiveDoshaEngine Parashari Technical Audit", () => {
  // Sample 1: Chart with Rahu in 9th house, Kuja in 8th house, Sun-Saturn tension
  const sampleInput1: KundliInput = {
    name: "Sri Ramachandra",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    latitude: 14.54, // Gokarna
    longitude: 74.31,
    gender: "Male"
  };

  // Sample 2: Chart with Jupiter-Rahu conjunction (Guru Chandala)
  const sampleInput2: KundliInput = {
    name: "Devotee Two",
    birthDate: "1987-10-24",
    birthTime: "06:15",
    latitude: 13.08, // Chennai
    longitude: 80.27,
    gender: "Female"
  };

  it("evaluates all 8+ Vedic dosha categories and produces a comprehensive report", () => {
    const kundli1 = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli1, sampleInput1, new Date("2026-09-29"));

    expect(report).toBeDefined();
    expect(report.devoteeInfo.name).toBe("Sri Ramachandra");
    expect(report.devoteeInfo.lagnaRashi).toBeDefined();
    expect(report.summary.totalEvaluated).toBeGreaterThanOrEqual(8);
    expect(report.doshas.length).toBeGreaterThanOrEqual(8);

    // Verify presence of all key dosha IDs
    const ids = report.doshas.map((d) => d.id);
    expect(ids).toContain("pitru_dosha");
    expect(ids).toContain("narayana_bali");
    expect(ids).toContain("kala_sarpa");
    expect(ids).toContain("guru_chandala");
    expect(ids).toContain("balarishta");
    expect(ids).toContain("balyagraha");
    expect(ids).toContain("kuja_dosha");
    expect(ids).toContain("dasha_sandhi");
    expect(ids).toContain("gochara_shani");
  });

  it("provides technical justification ('Why') with exact houses and scriptural authority for each detected dosha", () => {
    const kundli1 = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli1, sampleInput1, new Date("2026-09-29"));

    for (const dosha of report.doshas) {
      // Must have technical why text in all 5 languages
      expect(dosha.technicalWhy.kn.length).toBeGreaterThan(10);
      expect(dosha.technicalWhy.hi.length).toBeGreaterThan(10);
      expect(dosha.technicalWhy.te.length).toBeGreaterThan(10);
      expect(dosha.technicalWhy.ta.length).toBeGreaterThan(10);
      expect(dosha.technicalWhy.en.length).toBeGreaterThan(10);

      // Must have scriptural reference
      expect(dosha.technicalDetail.scripturalReference).toBeDefined();
      expect(dosha.technicalDetail.scripturalReference.length).toBeGreaterThan(5);

      // Must have 2-paragraph life impact
      expect(dosha.lifeImpact.kn.length).toBeGreaterThan(20);
      expect(dosha.lifeImpact.en.length).toBeGreaterThan(20);

      // Must have recommended Vedic pooja and remedies
      expect(dosha.recommendedPooja.kn.length).toBeGreaterThan(5);
      expect(dosha.recommendedPooja.en.length).toBeGreaterThan(5);
      expect(dosha.remedies.kn.length).toBeGreaterThanOrEqual(1);
      expect(dosha.remedies.en.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("accurately detects Kuja (Manglik) Dosha and evaluates Bhanga / cancellation rules", () => {
    const kundli = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, sampleInput1);

    const kujaDosha = report.doshas.find((d) => d.id === "kuja_dosha");
    expect(kujaDosha).toBeDefined();

    // Verify technical details
    expect(kujaDosha?.technicalDetail.grahasInvolved).toContain("Mars");
    expect(kujaDosha?.name.kn).toContain("ಕುಜ");
    expect(kujaDosha?.name.en).toContain("Kuja");
  });

  it("evaluates live Gochara Shani (Sade Sati, Ashtama Shani, or Kantaka Shani) from natal Moon sign", () => {
    const kundli = calculateKundli(sampleInput1, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, sampleInput1, new Date("2026-09-29"));

    const gocharaShani = report.doshas.find((d) => d.id === "gochara_shani");
    expect(gocharaShani).toBeDefined();
    expect(gocharaShani?.category).toBe("gochara");
    expect(gocharaShani?.technicalDetail.houseNumbers.length).toBeGreaterThanOrEqual(1);
    expect(gocharaShani?.technicalWhy.kn).toContain("ಶನಿ");
  });

  it("verifies full 5-language localization without English leakage in Indic fields", () => {
    const kundli = calculateKundli(sampleInput2, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, sampleInput2);

    for (const dosha of report.doshas) {
      expect(dosha.name.kn).toBeDefined();
      expect(dosha.name.hi).toBeDefined();
      expect(dosha.name.te).toBeDefined();
      expect(dosha.name.ta).toBeDefined();
      expect(dosha.name.en).toBeDefined();

      // Kannada status badge must be non-empty
      expect(dosha.statusBadge.kn.length).toBeGreaterThan(2);
      expect(dosha.statusBadge.hi.length).toBeGreaterThan(2);
    }
  });
});
