import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { BaggonaBookPublisherDashboard } from "../features/admin/BaggonaBookPublisherDashboard";
import {
  validateBaggonaBook,
  type BookValidationReport
} from "../core/BaggonaBookValidationEngine";
import {
  getSamvatsaraMetadata,
  generateUniversal104PageBook
} from "../core/BaggonaUniversalBookEngine";

describe("Baggona Book Publisher UI & Multi-Year Audit (೧೦೪-ಪುಟಗಳ ಪ್ರಕಾಶನ UI & ಸಮಗ್ರ ಆಡಿಟ್)", () => {
  it("verifies 100% green highlight validation for all 4 benchmark Samvatsaras", () => {
    const years = [1946, 1947, 1948, 1949];

    for (const shaka of years) {
      const report: BookValidationReport = validateBaggonaBook(shaka);
      if (!report.isValid) {
        console.log(`Failed shaka ${shaka}:`, report.checks.filter((c) => !c.passed));
      }
      expect(report.isValid).toBe(true);
      expect(report.scorePercentage).toBe(100);
      expect(report.isGreenHighlighted).toBe(true);
      expect(report.publicationReady).toBe(true);
      expect(report.totalPages).toBe(104);
      expect(report.failedChecksCount).toBe(0);
      expect(report.checks.every((c) => c.passed)).toBe(true);
    }
  });

  it("enforces zero English leakage across all 104 page titles for any Samvatsara", () => {
    const years = [1946, 1947, 1948, 1949];
    const englishWordRegex = /[a-zA-Z]{4,}/;

    for (const shaka of years) {
      const pages = generateUniversal104PageBook(shaka);
      expect(pages.length).toBe(104);

      for (const p of pages) {
        const hasEnglishInTitle = englishWordRegex.test(p.titleKn);
        expect(hasEnglishInTitle).toBe(false);
      }
    }
  });

  it("renders the Super Admin BaggonaBookPublisherDashboard with master controls and green badge", () => {
    render(<BaggonaBookPublisherDashboard />);

    // Header assertions
    expect(screen.getByText(/ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ೧೦೪-ಪುಟಗಳ ಸಾರ್ವತ್ರಿಕ ಪ್ರಕಾಶನ ಎಂಜಿನ್/i)).toBeInTheDocument();
    expect(screen.getByText(/Super Admin Exclusive • Master Publisher/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Pure Kannada/i)).toBeInTheDocument();

    // 100% Verified green badge
    expect(screen.getByText(/೧೦೦% ಪರಿಶೀಲಿತ & ಮುದ್ರಣ ಸಿದ್ಧ/i)).toBeInTheDocument();

    // Download button
    expect(screen.getByText(/೧೦೪-ಪುಟಗಳ ಮುದ್ರಣ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್/i)).toBeInTheDocument();

    // Samvatsara selector
    expect(screen.getByText(/ಸಂವತ್ಸರ ಮತ್ತು ಶಕ ವರ್ಷ ಆಯ್ಕೆ:/i)).toBeInTheDocument();

    // Default viewing page (Page 1)
    expect(screen.getAllByText(/ಪುಟ 1 \/ 104/i).length).toBeGreaterThan(0);
  });
});
