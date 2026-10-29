import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";

describe("Kundli Doshas Precision & Already-Done Shanti Intelligence Audit", () => {
  // Adult Devotee Profile (45-year-old)
  const adultInput: KundliInput = {
    name: "Srikanth Upadhyaya",
    birthDate: "1981-08-20",
    birthTime: "18:45",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  const kundli = calculateKundli(adultInput, { ayanamsaModel: "lahiri" });

  it("1. Unmarked/pending doshas produce dual-state conditional guidance in all 5 languages", () => {
    // Generate without any completed pariharas map
    const report = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-10-29"));
    const detected = report.doshas.filter((d) => d.isDetected);

    expect(detected.length).toBeGreaterThan(0);

    for (const dosha of detected) {
      // Must default to 'pending'
      expect(dosha.shantiStatus).toBe("pending");

      // Must have conditionalGuidance across all 5 languages
      expect(dosha.conditionalGuidance).toBeDefined();
      expect(dosha.conditionalGuidance?.kn).toContain("ವಿಶೇಷ ಮಾರ್ಗದರ್ಶನ:");
      expect(dosha.conditionalGuidance?.kn).toContain("ಮಾಡಿಸಿದ್ದರೆ");
      expect(dosha.conditionalGuidance?.en).toContain("Special Guidance:");
      expect(dosha.conditionalGuidance?.hi).toContain("विशेष मार्गदर्शन:");
      expect(dosha.conditionalGuidance?.te).toContain("ప్రత్యేక సూచన:");
      expect(dosha.conditionalGuidance?.ta).toContain("முக்கிய குறிப்பு:");

      // Must have subconsciousFear across all 5 languages
      expect(dosha.subconsciousFear).toBeDefined();
      expect(dosha.subconsciousFear?.kn?.length).toBeGreaterThan(10);
      expect(dosha.subconsciousFear?.en?.length).toBeGreaterThan(10);
      expect(dosha.subconsciousFear?.hi?.length).toBeGreaterThan(10);
      expect(dosha.subconsciousFear?.te?.length).toBeGreaterThan(10);
      expect(dosha.subconsciousFear?.ta?.length).toBeGreaterThan(10);
    }
  });

  it("2. When devotee/priest marks a dosha as already performed (e.g. 2020), it updates to completed validation", () => {
    // Pick the first detected dosha
    const initialReport = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-10-29"));
    const targetDoshaId = initialReport.doshas.find((d) => d.isDetected)?.id || "pitru_dosha";

    const completedMap = {
      [targetDoshaId]: { isCompleted: true, completedYear: 2020 }
    };

    const report = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-10-29"), completedMap);
    const updatedDosha = report.doshas.find((d) => d.id === targetDoshaId);

    expect(updatedDosha).toBeDefined();
    expect(updatedDosha?.shantiStatus).toBe("completed");
    expect(updatedDosha?.completedYear).toBe("2020");

    // Status badge reflects completion
    expect(updatedDosha?.statusBadge.kn).toContain("✓ ಸಿದ್ಧ ಶಾಂತಿ (2020)");
    expect(updatedDosha?.statusBadge.en).toContain("✓ SHANTI COMPLETED");

    // Already-done narration explains pacification and confirms no repeat homa is needed
    expect(updatedDosha?.alreadyDoneNarration).toBeDefined();
    expect(updatedDosha?.alreadyDoneNarration?.kn).toContain("2020");
    expect(updatedDosha?.alreadyDoneNarration?.kn).toContain("ಕರ್ಮ ಋಣವು ಬಹುತೇಕ ಶಮನಗೊಂಡಿದೆ");
    expect(updatedDosha?.alreadyDoneNarration?.kn).toContain("ಮತ್ತೆ ಯಾವುದೇ ದೊಡ್ಡ ಹೋಮ-ಪೂಜೆಗಳ ಅಗತ್ಯವಿಲ್ಲ");

    expect(updatedDosha?.alreadyDoneNarration?.en).toContain("2020");
    expect(updatedDosha?.alreadyDoneNarration?.en).toContain("pacified");
    expect(updatedDosha?.alreadyDoneNarration?.en).toContain("No repetition of major fire rituals");
  });

  it("3. For an adult (age 45), Gandantaras with surpassed thresholds (vulnerableTillAge <= 45) show safe completion", () => {
    const report = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-10-29"));
    const gandantaras = report.gandantaraAndBhaya.allGandantaras.filter((g) => g.isDetected);

    // Look for hazards where age threshold is surpassed
    const passedHazards = gandantaras.filter((g) => !g.isCurrentlyInDangerWindow);

    for (const hazard of passedHazards) {
      expect(hazard.currentAge).toBeGreaterThan(hazard.vulnerableTillAge);
      expect(hazard.ageWindowDescription.kn).toContain("✅ ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ ದಾಟಿದೆ");
      expect(hazard.ageWindowDescription.en).toContain("✅ Safe Threshold Surpassed");
    }
  });

  it("4. KundliDoshaPdfTemplate renders completed status badge, already-done reassurance, and passed hazard status", () => {
    const completedMap = {
      pitru_dosha: { isCompleted: true, completedYear: "2019" }
    };

    const report = calculateComprehensiveDoshas(kundli, adultInput, new Date("2026-10-29"), completedMap);

    const { container } = render(
      <KundliDoshaPdfTemplate id="test-dosha-pdf" report={report} lang="kn" />
    );

    // Container width must be exactly 900px
    const root = container.querySelector("#test-dosha-pdf");
    expect(root).toBeTruthy();
    expect(root?.getAttribute("style")).toContain("width: 900px");

    // Exactly 2 pages
    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(2);

    for (const page of pages) {
      expect(page.getAttribute("style")).toContain("height: 1273px");
      expect(page.getAttribute("style")).toContain("overflow: hidden");
    }

    // Check priest branding and phone
    expect(container.textContent).toContain("+91 99723 39362");
    expect(container.textContent).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");

    // If pitru dosha was detected and completed, check completed text
    const pitru = report.doshas.find((d) => d.id === "pitru_dosha");
    if (pitru?.isDetected) {
      expect(container.textContent).toContain("✓ ಸಿದ್ಧ ಶಾಂತಿ (2019)");
      expect(container.textContent).toContain("ಶಾಂತಿ ನೆರವೇರಿದ ದೃಢೀಕರಣ:");
    }

    // Check subconscious fear label
    expect(container.textContent).toContain("ಆಂತರಿಕ ಮನೋಭಯ");
  });
});

