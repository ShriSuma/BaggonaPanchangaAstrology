import { describe, it, expect } from "vitest";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("ComprehensiveDoshaEngine Panchanga and Gochara Dynamic Audit", () => {
  // Sample 1: Devotee born 1990-05-15 in Gokarna
  const inputA: KundliInput = {
    name: "Devotee A",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  // Sample 2: Devotee born 1987-10-24 in Chennai
  const inputB: KundliInput = {
    name: "Devotee B",
    birthDate: "1987-10-24",
    birthTime: "06:15",
    latitude: 13.08,
    longitude: 80.27,
    gender: "Female"
  };

  it("calculates comprehensive dosha report with localized devotee info", () => {
    const kundliA = calculateKundli(inputA, { ayanamsaModel: "lahiri" });
    const reportA = calculateComprehensiveDoshas(kundliA, inputA, new Date("2026-09-29"));

    expect(reportA).toBeDefined();
    expect(reportA.doshas.length).toBeGreaterThanOrEqual(13);

    // Verify devoteeInfo multilingual records
    expect(reportA.devoteeInfo.lagnaRashiRecord.kn).toBeDefined();
    expect(reportA.devoteeInfo.lagnaRashiRecord.en).toBeDefined();
    expect(reportA.devoteeInfo.moonRashiRecord.kn).toBeDefined();
    expect(reportA.devoteeInfo.moonRashiRecord.en).toBeDefined();
    expect(reportA.devoteeInfo.nakshatraRecord.kn).toBeDefined();
    expect(reportA.devoteeInfo.nakshatraRecord.en).toBeDefined();
    expect(reportA.devoteeInfo.currentDashaRecord.kn).toBeDefined();
    expect(reportA.devoteeInfo.currentDashaRecord.en).toBeDefined();
  });

  it("evaluates live Gochara Jupiter and Rahu-Ketu transit doshas dynamically", () => {
    const kundliA = calculateKundli(inputA, { ayanamsaModel: "lahiri" });
    const reportA = calculateComprehensiveDoshas(kundliA, inputA, new Date("2026-09-29"));

    const gocharaGuru = reportA.doshas.find((d) => d.id === "gochara_guru");
    const gocharaRK = reportA.doshas.find((d) => d.id === "gochara_rahu_ketu");

    expect(gocharaGuru).toBeDefined();
    expect(gocharaGuru?.category).toBe("gochara");
    expect(gocharaGuru?.technicalDetail.grahaDegrees?.[0].degreeFormatted).toMatch(/\d+°\d+'/);
    expect(gocharaGuru?.technicalWhy.kn.length).toBeGreaterThan(20);
    expect(gocharaGuru?.technicalWhy.en.length).toBeGreaterThan(20);

    expect(gocharaRK).toBeDefined();
    expect(gocharaRK?.category).toBe("gochara");
    expect(gocharaRK?.technicalDetail.grahasInvolved).toContain("Rahu (Live)");
  });

  it("evaluates Panchanga-based Doshas (Tithi Shunya, Nitya Yoga, Vishti Karana)", () => {
    const kundliB = calculateKundli(inputB, { ayanamsaModel: "lahiri" });
    const reportB = calculateComprehensiveDoshas(kundliB, inputB, new Date("2026-09-29"));

    const tithiShunya = reportB.doshas.find((d) => d.id === "tithi_shunya_dosha");
    const yogaDosha = reportB.doshas.find((d) => d.id === "panchanga_yoga_dosha");
    const karanaDosha = reportB.doshas.find((d) => d.id === "panchanga_karana_dosha");

    expect(tithiShunya).toBeDefined();
    expect(tithiShunya?.category).toBe("panchanga");
    expect(tithiShunya?.name.kn).toContain("ತಿಥಿ");

    expect(yogaDosha).toBeDefined();
    expect(yogaDosha?.category).toBe("panchanga");
    expect(yogaDosha?.technicalWhy.kn).toContain("ಯೋಗ");

    expect(karanaDosha).toBeDefined();
    expect(karanaDosha?.category).toBe("panchanga");
    expect(karanaDosha?.name.kn).toContain("ಕರಣ");
  });

  it("produces distinct, mathematically personalized outputs for different natives with zero constant strings", () => {
    const kundliA = calculateKundli(inputA, { ayanamsaModel: "lahiri" });
    const kundliB = calculateKundli(inputB, { ayanamsaModel: "lahiri" });

    const reportA = calculateComprehensiveDoshas(kundliA, inputA, new Date("2026-09-29"));
    const reportB = calculateComprehensiveDoshas(kundliB, inputB, new Date("2026-09-29"));

    // Compare planetary degree texts in technicalWhy
    const whyA = reportA.doshas.map((d) => d.technicalWhy.en).join(" ");
    const whyB = reportB.doshas.map((d) => d.technicalWhy.en).join(" ");

    expect(whyA).not.toEqual(whyB);
    expect(reportA.devoteeInfo.lagnaRashi).not.toEqual(reportB.devoteeInfo.lagnaRashi);
  });
});
