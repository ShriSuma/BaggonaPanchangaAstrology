import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calculateComprehensiveDoshas } from "../core/ComprehensiveDoshaEngine";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { KundliDoshaPdfTemplate } from "../components/kundli/KundliDoshaPdfTemplate";
import { ensureAtLeastThreeParagraphs, areParagraphsDuplicates, detectSummaryPillar } from "../features/premiumPdf/bhavishyaV1Service";

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

  it("5. strictly deduplicates paragraphs with differing opening devotee salutations", () => {
    const pWithGreeting1 = "ಮನೋಜ್ ಅವರೇ, ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ ಬಲ, ಪ್ರಸ್ತುತ ಸಾಗುತ್ತಿರುವ ಮಹಾದಶಾ ಹಾಗೂ ಭುಕ್ತಿಗಳ ಅದ್ಭುತ ಸಮತೋಲನವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.";
    const pWithGreeting2 = "ಆತ್ಮೀಯ ಮನೋಜ್ ಅವರೇ, ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ ಬಲ, ಪ್ರಸ್ತುತ ಸಾಗುತ್ತಿರುವ ಮಹಾದಶಾ ಹಾಗೂ ಭುಕ್ತಿಗಳ ಅದ್ಭುತ ಸಮತೋಲನವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.";
    const pWithoutGreeting = "ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿ, ನಕ್ಷತ್ರ ಬಲ, ಪ್ರಸ್ತುತ ಸಾಗುತ್ತಿರುವ ಮಹಾದಶಾ ಹಾಗೂ ಭುಕ್ತಿಗಳ ಅದ್ಭುತ ಸಮತೋಲನವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.";

    expect(areParagraphsDuplicates(pWithGreeting1, pWithGreeting2)).toBe(true);
    expect(areParagraphsDuplicates(pWithGreeting1, pWithoutGreeting)).toBe(true);

    const pPriority = "ಬರುವ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಧಾನ ಆದ್ಯತೆಯು ಉತ್ತಮ ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಸಾಧಿಸುವುದಾಗಿರಬೇಕು.";
    const pBlessing = "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹ ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯು ನಿಮ್ಮ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳನ್ನು ಈಡೇರಿಸಲಿ.";

    // Pass narrative with 2 duplicate opening paragraphs
    const combined = `${pWithGreeting1}\n\n${pWithGreeting2}\n\n${pPriority}`;
    const fallback = `${pWithoutGreeting}\n\n${pPriority}\n\n${pBlessing}`;

    const dedupedResult = ensureAtLeastThreeParagraphs(combined, fallback, 3);
    const resultParas = dedupedResult.split(/\n\s*\n/).map(p => p.trim());

    expect(resultParas.length).toBe(3);
    // Overview paragraph should appear only once
    const overviewCount = resultParas.filter(p => p.includes("ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ")).length;
    expect(overviewCount).toBe(1);
    // Missing blessing paragraph should be pulled from fallback
    expect(resultParas.some(p => p.includes("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ"))).toBe(true);
  });

  it("6. verifies thematic pillar detection and prevents duplicate fallback pillar insertion", () => {
    const pOverview = "ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.";
    const pPriority = "ಬರುವ ವರ್ಷಗಳಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿಯು ಆರ್ಥಿಕ ಉಳಿತಾಯದ ಕ್ರೋಡೀಕರಣ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆಯಾಗಿರಬೇಕು.";
    const pBlessing = "ನಿಯಮಿತ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಆಶೀರ್ವಾದದಿಂದ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳು ಸಿದ್ಧಿಸಲಿ.";

    expect(detectSummaryPillar(pOverview)).toBe("overview");
    expect(detectSummaryPillar(pPriority)).toBe("priority");
    expect(detectSummaryPillar(pBlessing)).toBe("blessing");

    // Given AI text covering overview and priority, fallback should NOT duplicate overview
    const aiNarrative = `${pOverview}\n\n${pPriority}`;
    const fallbackFull = `${pOverview}\n\n${pPriority}\n\n${pBlessing}`;

    const res = ensureAtLeastThreeParagraphs(aiNarrative, fallbackFull, 3);
    const paras = res.split(/\n\s*\n/).map(p => p.trim());

    expect(paras.length).toBe(3);
    expect(paras[0]).toContain("ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ");
    expect(paras[1]).toContain("ಮುಖ್ಯ ಗುರಿಯು");
    expect(paras[2]).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ");
  });

  it("7. verifies Dosha severity badges have ZERO English in parentheses across Kannada, Hindi, Telugu and Tamil", () => {
    // Kannada
    const { container: knContainer } = render(
      <KundliDoshaPdfTemplate id="test-badge-kn" report={report} lang="kn" />
    );
    const knText = knContainer.textContent || "";
    expect(knText).not.toContain("(Critical)");
    expect(knText).not.toContain("(High)");
    expect(knText).not.toContain("(Moderate)");
    expect(knText).not.toContain("(Low)");
    expect(knText).toMatch(/ತೀವ್ರ ದೋಷ|ಮಧ್ಯಮ-ತೀವ್ರ|ಮಧ್ಯಮ ದೋಷ/);

    // Hindi
    const { container: hiContainer } = render(
      <KundliDoshaPdfTemplate id="test-badge-hi" report={report} lang="hi" />
    );
    const hiText = hiContainer.textContent || "";
    expect(hiText).not.toContain("(Critical)");
    expect(hiText).not.toContain("(High)");
    expect(hiText).not.toContain("(Moderate)");
    expect(hiText).not.toContain("(Low)");
    expect(hiText).toMatch(/तीव्र दोष|मध्यम-तीव्र|मध्यम दोष/);

    // Telugu
    const { container: teContainer } = render(
      <KundliDoshaPdfTemplate id="test-badge-te" report={report} lang="te" />
    );
    const teText = teContainer.textContent || "";
    expect(teText).not.toContain("(Critical)");
    expect(teText).not.toContain("(High)");
    expect(teText).not.toContain("(Moderate)");
    expect(teText).not.toContain("(Low)");
    expect(teText).toMatch(/తీవ్ర దోషం|మధ్యమ-తీవ్రం|మధ్యమ దోషం/);

    // Tamil
    const { container: taContainer } = render(
      <KundliDoshaPdfTemplate id="test-badge-ta" report={report} lang="ta" />
    );
    const taText = taContainer.textContent || "";
    expect(taText).not.toContain("(Critical)");
    expect(taText).not.toContain("(High)");
    expect(taText).not.toContain("(Moderate)");
    expect(taText).not.toContain("(Low)");
    expect(taText).toMatch(/தீவிர தோஷம்|நடுத்தர-தீவிரம்|நடுத்தர தோஷம்/);
  });

  it("8. verifies severity and priority badges have whiteSpace nowrap and display inline-flex", () => {
    const { container } = render(
      <KundliDoshaPdfTemplate id="test-badge-styles" report={report} lang="kn" />
    );

    const severityBadges = Array.from(container.querySelectorAll("span")).filter(
      el => el.textContent?.includes("ತೀವ್ರ ದೋಷ") || el.textContent?.includes("ಮಧ್ಯಮ-ತೀವ್ರ")
    );
    expect(severityBadges.length).toBeGreaterThanOrEqual(1);

    severityBadges.forEach(badge => {
      expect(badge.style.whiteSpace).toBe("nowrap");
      expect(badge.style.display).toBe("inline-flex");
    });
  });
});
