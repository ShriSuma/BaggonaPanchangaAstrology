import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";

describe("Kundli Doshas Age-Adaptive Priority Ordering & PDF Generation Audit", () => {
  // 1. Child Profile: 8-year-old native (born in 2018 relative to 2026)
  const childInput: KundliInput = {
    name: "Master Aarav",
    birthDate: "2018-05-10",
    birthTime: "08:15",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  // 2. Youth / Marriage Candidate Profile: 26-year-old native (born in 2000 relative to 2026)
  const youthInput: KundliInput = {
    name: "Kavya Sharma",
    birthDate: "2000-03-14",
    birthTime: "11:20",
    latitude: 13.08,
    longitude: 80.27,
    gender: "Female"
  };

  // 3. Middle-Aged Householder Profile: 45-year-old native (born in 1981 relative to 2026)
  const adultInput: KundliInput = {
    name: "Ramesh Bhat",
    birthDate: "1981-08-20",
    birthTime: "18:45",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  it("assigns 'bala' life stage and prioritizes Balarishta/Balyagraha for an 8-year-old child", () => {
    const kundli = calculateKundli(childInput, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, childInput, new Date("2026-09-29"));

    expect(report.devoteeInfo.currentAge).toBe(8);
    expect(report.devoteeInfo.ageStageKey).toBe("bala");
    expect(report.devoteeInfo.ageStageNameRecord?.kn).toContain("ಬಾಲ್ಯಾವಸ್ಥೆ");
    expect(report.devoteeInfo.currentAgeFocusSummary?.kn).toContain("ಬಾಲಾರಿಷ್ಟ");

    // Check doshas list order
    const detectedDoshas = report.doshas.filter((d) => d.isDetected);
    expect(detectedDoshas.length).toBeGreaterThan(0);

    // Verify ascending rank ordering (1, 2, 3...)
    for (let i = 0; i < detectedDoshas.length; i++) {
      expect(detectedDoshas[i].agePriorityRank).toBe(i + 1);
      expect(detectedDoshas[i].agePriorityBadge).toBeDefined();
      expect(detectedDoshas[i].agePriorityReason).toBeDefined();
      expect(detectedDoshas[i].immediateActionRequired).toBeDefined();

      if (i > 0) {
        expect((detectedDoshas[i].agePriorityScore ?? 99)).toBeGreaterThanOrEqual(
          detectedDoshas[i - 1].agePriorityScore ?? 0
        );
      }
    }

    // Crucial rule: If balarishta or balyagraha is detected, it MUST be prioritized before pitru dosha or kala sarpa!
    const balarishta = detectedDoshas.find((d) => d.id === "balarishta_dosha");
    const balyagraha = detectedDoshas.find((d) => d.id === "balyagraha_dosha");
    const pitruDosha = detectedDoshas.find((d) => d.id === "pitru_dosha");

    if ((balarishta || balyagraha) && pitruDosha) {
      const balaRank = Math.min(
        balarishta ? (balarishta.agePriorityRank ?? 99) : 99,
        balyagraha ? (balyagraha.agePriorityRank ?? 99) : 99
      );
      const pitruRank = pitruDosha.agePriorityRank ?? 99;
      expect(balaRank).toBeLessThan(pitruRank);
    }
  });

  it("prioritizes Vivaha/Udyoga doshas (Kuja Dosha, Kala Sarpa) for marriage-aged youth (26 yrs)", () => {
    const kundli = calculateKundli(youthInput, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, youthInput, new Date("2026-09-29"));

    expect(report.devoteeInfo.currentAge).toBe(26);
    expect(report.devoteeInfo.ageStageKey).toBe("vivaha_udyoga");
    expect(report.devoteeInfo.ageStageNameRecord?.kn).toContain("ವಿವಾಹ");
    expect(report.devoteeInfo.currentAgeFocusSummary?.kn).toContain("ವಿವಾಹ");

    const detectedDoshas = report.doshas.filter((d) => d.isDetected);
    const kujaDosha = detectedDoshas.find((d) => d.id === "kuja_dosha");
    const balarishta = detectedDoshas.find((d) => d.id === "balarishta");
    const balyagraha = detectedDoshas.find((d) => d.id === "balyagraha");

    // Classical mandate: For adult (26 yrs), Balarishta & Balyagraha must be strictly absent!
    expect(balarishta).toBeUndefined();
    expect(balyagraha).toBeUndefined();

    // In vivaha stage, kuja dosha should be high priority if detected
    if (kujaDosha) {
      expect(kujaDosha.agePriorityRank).toBeLessThanOrEqual(3);
    }
  });

  it("prioritizes Gruhastha doshas (Pitru Dosha, Narayana Bali) for middle-aged householder (45 yrs)", () => {
    const kundli = calculateKundli(adultInput, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-09-29"));

    expect(report.devoteeInfo.currentAge).toBe(45);
    expect(report.devoteeInfo.ageStageKey).toBe("gruhastha");
    expect(report.devoteeInfo.ageStageNameRecord?.kn).toContain("ಗೃಹಸ್ಥ");
    expect(report.devoteeInfo.currentAgeFocusSummary?.kn).toContain("ಪಿತೃ");

    const detectedDoshas = report.doshas.filter((d) => d.isDetected);
    const pitruDosha = detectedDoshas.find((d) => d.id === "pitru_dosha");
    const balarishta = detectedDoshas.find((d) => d.id === "balarishta");
    const balyagraha = detectedDoshas.find((d) => d.id === "balyagraha");

    // Classical mandate: For adult (45 yrs), Balarishta & Balyagraha must be strictly absent!
    expect(balarishta).toBeUndefined();
    expect(balyagraha).toBeUndefined();

    // In gruhastha stage, pitru dosha is supreme priority #1 if detected
    if (pitruDosha) {
      expect(pitruDosha.agePriorityRank).toBe(1);
    }
  });

  it("renders KundliDoshaPdfTemplate with 3 A4 pages, priest seal, and age-prioritized highlights", () => {
    const kundli = calculateKundli(childInput, { ayanamsaModel: "lahiri" });
    const report = calculateComprehensiveDoshas(kundli, childInput, new Date("2026-09-29"));

    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-kundli-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    // Rule 2.1 & 3.2: 3 .pdf-page divs matching A4 format
    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(3);

    // Verify Temple banner and Chief Priest identity
    expect(container.textContent).toContain("ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ");
    expect(container.textContent).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(container.textContent).toContain("+91 99723 39362");

    // Verify Age Strategy Card rendered
    expect(container.textContent).toContain("ಪ್ರಸ್ತುತ ವಯಸ್ಸಿನ ಆದ್ಯತಾ ಸೂಚಿ");
    expect(container.textContent).toContain("ಬಾಲ್ಯಾವಸ್ಥೆ");

    // Verify Immediate action label rendered
    expect(container.textContent).toContain("ಮೊದಲು ಮಾಡಬೇಕಾದ ಕರ್ತವ್ಯ");

    // Verify Gandantara & fears sections rendered
    expect(container.textContent).toContain("ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ");
    expect(container.textContent).toContain("ಅಂತರ್ಗತ ಮನೋಭಯಗಳು");
  });
});
