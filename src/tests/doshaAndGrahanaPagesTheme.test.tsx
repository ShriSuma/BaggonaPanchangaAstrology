import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import KundliDoshasPage from "../pages/KundliDoshasPage";
import GuruShukraAstodayaGrahanaPage from "../pages/GuruShukraAstodayaGrahanaPage";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("KundliDoshasPage and GuruShukraAstodayaGrahanaPage - Theme & Functionality Audit", () => {
  const sampleInput: KundliInput = {
    name: "Suma",
    birthDate: "1993-03-22",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Female",
  };

  beforeEach(() => {
    useAppStore.setState({
      language: "kn",
      currentPage: "kundli" as any,
    });

    const kundli = calculateKundli(sampleInput, { ayanamsaModel: "lahiri" });
    useKundliViewerStore.setState({
      session: {
        input: sampleInput,
        result: kundli,
      } as any,
    });
  });

  it("KundliDoshasPage renders with royal cream and gold theme without dark theme slate classes", () => {
    const { container } = render(<KundliDoshasPage />);

    // Assert container uses the royal cream background #FFFDF7
    const mainDiv = container.querySelector(".min-h-screen");
    expect(mainDiv).toBeTruthy();
    expect(mainDiv?.className).toContain("bg-[#FFFDF7]");
    expect(mainDiv?.className).not.toContain("bg-slate-950");

    // Title in Kannada
    expect(screen.getByRole("heading", { level: 1, name: /ಸಮಗ್ರ ಜಾತಕ ದೋಷ ನಿರ್ಣಯ/i })).toBeTruthy();

    // Verify tabs
    const overviewTab = screen.getByRole("button", { name: /ಸಮಗ್ರ ಪತ್ರ ದರ್ಶನ/i });
    expect(overviewTab).toBeTruthy();

    const gandaTab = screen.getByRole("button", { name: /ಗಂಡಾಂತರಗಳು & ವಯೋಮಿತಿ/i });
    expect(gandaTab).toBeTruthy();
    fireEvent.click(gandaTab);

    // Check content switch
    expect(screen.getAllByText(/ಗಂಡಾಂತರಗಳು & ಸಂರಕ್ಷಣಾ ವಯೋಮಿತಿ/i).length).toBeGreaterThan(0);
  });

  it("GuruShukraAstodayaGrahanaPage renders with royal cream and gold theme and interacts seamlessly", () => {
    const { container } = render(<GuruShukraAstodayaGrahanaPage />);

    // Assert container uses the royal cream background #FFFDF7
    const mainDiv = container.querySelector(".min-h-screen");
    expect(mainDiv).toBeTruthy();
    expect(mainDiv?.className).toContain("bg-[#FFFDF7]");
    expect(mainDiv?.className).not.toContain("bg-slate-950");

    // Check title
    expect(screen.getByText(/॥ ಗುರು-ಶುಕ್ರರ ಅಸ್ತೋದಯ & ಗ್ರಹಣ ಮಹಾದರ್ಶನ ॥/i)).toBeTruthy();

    // Check quick year selection chip
    const year2025Chip = screen.getByRole("button", { name: "2025" });
    expect(year2025Chip).toBeTruthy();
    fireEvent.click(year2025Chip);

    // Switch to Astodaya tab
    const astodayaTab = screen.getByRole("button", { name: /ಗುರು-ಶುಕ್ರ ಅಸ್ತೋದಯ & ಮೌಢ್ಯ/i });
    expect(astodayaTab).toBeTruthy();
    fireEvent.click(astodayaTab);

    expect(screen.getByText(/ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಅಸ್ತೋದಯ/i)).toBeTruthy();
    expect(screen.getByText(/ದೈತ್ಯಗುರು ಶುಕ್ರ ಅಸ್ತೋದಯ/i)).toBeTruthy();

    // Switch to Unified tab
    const unifiedTab = screen.getByRole("button", { name: /ಸಮಗ್ರ ವಾರ್ಷಿಕ ಪಂಚಾಂಗ ಸೂಚಿ/i });
    expect(unifiedTab).toBeTruthy();
    fireEvent.click(unifiedTab);

    expect(screen.getByText(/॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಅಧಿಕೃತ ಶಾಸ್ತ್ರೀಯ ವರದಿ ॥/i)).toBeTruthy();
  });
});
