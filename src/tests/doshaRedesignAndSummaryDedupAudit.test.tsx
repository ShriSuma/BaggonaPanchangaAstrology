import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { ensureAtLeastThreeParagraphs } from "../features/premiumPdf/bhavishyaV1Service";

describe("Dosha Galu PDF Redesign & Summary Deduplication Audit", () => {
  const native: KundliInput = {
    name: "Manoj Kumar",
    birthDate: "1995-11-20",
    birthTime: "09:30",
    latitude: 14.54,
    longitude: 74.31,
    gender: "Male"
  };

  const kundli = calculateKundli(native, { ayanamsaModel: "lahiri" });
  const report = calculateComprehensiveDoshas(kundli, native, new Date("2026-10-31"));

  it("1. ensureAtLeastThreeParagraphs strictly deduplicates overlapping and identical paragraphs", () => {
    const p1 = "ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿಯನ್ನು ಅದ್ಭುತವಾಗಿ ಪ್ರದರ್ಶಿಸುತ್ತದೆ.";
    const p2 = "ಬರುವ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿಯು ಆರ್ಥಿಕ ಉಳಿತಾಯದ ಕ್ರೋಡೀಕರಣ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆಯಾಗಿರಬೇಕು.";
    const p3 = "ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ತರಲಿದೆ.";

    // Provide text where p1 is duplicated with slight whitespace variation
    const aiTextWithDuplicates = `${p1}\n\n${p1}   \n\n${p2}`;
    const fallbackText = `${p1}\n\n${p2}\n\n${p3}`;

    const result = ensureAtLeastThreeParagraphs(aiTextWithDuplicates, fallbackText, 3);
    const resultParas = result.split(/\n\s*\n/).map(p => p.trim());

    // Should have exactly 3 unique paragraphs
    expect(resultParas.length).toBe(3);

    // Verify p1 occurs exactly once
    const p1Count = resultParas.filter(p => p.includes("ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ")).length;
    expect(p1Count).toBe(1);

    // Verify p3 was appended as the missing 3rd unique paragraph
    expect(resultParas.some(p => p.includes("ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ"))).toBe(true);
  });

  it("2. KundliDoshaPdfTemplate renders all 4 devotee pillars for active doshas cleanly", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf"
        report={report}
        lang="kn"
      />
    );

    const text = container.textContent || "";

    // Pillar 1: Root Cause
    expect(text).toContain("ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ:");

    // Pillar 2: Real-world Struggles & Delays
    expect(text).toContain("ನೈಜ ಜೀವನದ ಪರಿಣಾಮಗಳು:");

    // Pillar 3: Prescribed Remedy & Sacred Gokarna Seva
    expect(text).toContain("ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ & ಗೋಕರ್ಣ ಸೇವೆ:");

    // Pillar 4: Expected Life Improvement & Stuck Jobs Moving Forward
    expect(text).toContain("ಪರಿಹಾರದ ನಂತರದ ಸುಧಾರಣೆ & ಶುಭ ಫಲಗಳು:");

    // Verify expected improvement content mentions stuck work and positive transformations
    expect(text).toMatch(/ನಿಂತುಹೋಗಿದ್ದ|ಅಡೆತಡೆಗಳು|ಶಮನವಾಗಿ|ಹೊಸ|ನೆಮ್ಮದಿ|ಸುಧಾರಣೆ/);
  });

  it("3. KundliDoshaPdfTemplate renders Pillar 4 in Hindi and English accurately", () => {
    const { container: hiContainer } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf-hi"
        report={report}
        lang="hi"
      />
    );
    expect(hiContainer.textContent).toContain("शांति उपरांत अपेक्षित जीवन सुधार एवं शुभ परिणाम:");
    expect(hiContainer.textContent).toMatch(/रुके हुए|सुधार|आशीर्वाद|शांति/);

    const { container: enContainer } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf-en"
        report={report}
        lang="en"
      />
    );
    expect(enContainer.textContent).toContain("Expected Life Improvement & Positive Transformations:");
    expect(enContainer.textContent).toMatch(/Stuck projects|dissolve|harmony|protection/i);
  });

  it("4. Priority and status badges are rendered without broken text dropping down", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate
        id="test-doshas-pdf-badges"
        report={report}
        lang="kn"
      />
    );

    // Look for priority pills
    const priorityPills = Array.from(container.querySelectorAll("span")).filter(
      el => el.textContent?.includes("⚡ ಆದ್ಯತೆ #") || el.textContent?.includes("ಆದ್ಯತೆ #")
    );
    expect(priorityPills.length).toBeGreaterThanOrEqual(1);

    priorityPills.forEach(pill => {
      expect(pill.style.whiteSpace).toBe("nowrap");
      expect(pill.style.display).toBe("inline-flex");
    });
  });
});
