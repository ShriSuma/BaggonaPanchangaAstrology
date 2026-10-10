import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import PoojaEstimatePage from "../pages/PoojaEstimatePage";

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe("PoojaEstimatePage Component", () => {
  it("renders the page with title and primary poojas", () => {
    render(<PoojaEstimatePage />);

    expect(screen.getAllByText(/ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜಾ ಯೋಜನೆ & ವೆಚ್ಚ ವಿವರ/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 9972339362/).length).toBeGreaterThan(0);
  });

  it("renders the 3 pricing tiers (Low ₹12k, Medium ₹20k, High ₹30k)", () => {
    render(<PoojaEstimatePage />);

    expect(screen.getAllByText(/ಸಾಧಾರಣ ಸಂಕಲ್ಪ \(ಮಿತವ್ಯಯ\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ಮಧ್ಯಮ ಸಂಕಲ್ಪ \(ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ರೇಷ್ಠ\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ಉನ್ನತ ಮಹಾಸಂಕಲ್ಪ \(ಭವ್ಯ ದಿವ್ಯ ವಿಧಿ\)/).length).toBeGreaterThan(0);
  });

  it("switches tabs between Samagri, Vidhana/Cost, and Benefits", () => {
    render(<PoojaEstimatePage />);

    // Click on Vidhana & Cost tab
    const vidhanaTab = screen.getAllByText(/ವಿಭಾಗ ೨: ಋತ್ವಿಜರು, ಹೋಮ ದ್ರವ್ಯ/)[0];
    fireEvent.click(vidhanaTab);
    expect(screen.getAllByText(/ವೆಚ್ಚ ಏಕೆ ಇಷ್ಟು ಆಗುತ್ತದೆ\?/).length).toBeGreaterThan(0);

    // Click on Benefits tab
    const benefitsTab = screen.getAllByText(/ವಿಭಾಗ ೩: ಪೂಜಾ ಫಲ & ಜೀವನ ಬದಲಾವಣೆ/)[0];
    fireEvent.click(benefitsTab);
    expect(screen.getAllByText(/ಈ ಪೂಜೆಯನ್ನು ಏಕೆ ಮಾಡಬೇಕು\?/).length).toBeGreaterThan(0);

    // Click back on Samagri tab
    const samagriTab = screen.getAllByText(/ವಿಭಾಗ ೧: ಸಾಮಗ್ರಿಗಳ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ/)[0];
    fireEvent.click(samagriTab);
    expect(screen.getAllByText(/ಭಕ್ತರು ತರಬೇಕಾದ ಸಾಮಗ್ರಿಗಳು/).length).toBeGreaterThan(0);
  });

  it("displays persuasive high tier highlight explaining why to choose ₹30,000", () => {
    render(<PoojaEstimatePage />);

    expect(screen.getAllByText(/ಏಕೆ ₹30,000 ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪವನ್ನು ಆರಿಸಿಕೊಳ್ಳಬೇಕು\?/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/೭ ಜನ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು/).length).toBeGreaterThan(0);
  });
});
