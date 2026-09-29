import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import VarshaBavishyaPage from "../pages/VarshaBavishyaPage";

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultVal?: string) => defaultVal || key,
    i18n: { language: "kn" }
  })
}));

// Mock audio clone engine
vi.mock("../features/audio/aiVoiceCloneEngine", () => ({
  synthesizeAndPlayClonedVoice: vi.fn().mockResolvedValue(() => {}),
  stopClonedAudio: vi.fn()
}));

// Mock pdf generator
vi.mock("../utils/pdfGenerator", () => ({
  generatePDFFromElement: vi.fn().mockResolvedValue({})
}));

afterEach(() => {
  cleanup();
});

describe("VarshaBavishyaPage (Baggona Panchanga 12-Rashi Book View)", () => {
  it("renders the page with Samvatsara metadata, Nakshatra navigator, and all 12 Rashis by default", () => {
    render(<VarshaBavishyaPage />);

    // Header & Title
    expect(screen.getByText(/ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಂವತ್ಸರ ಫಲಂ/i)).toBeDefined();
    expect(screen.getAllByText(/ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನಃ/i).length).toBeGreaterThan(0);

    // Tab buttons
    expect(screen.getByText(/ದ್ವಾದಶ ರಾಶಿಗಳ ಸಮಗ್ರ ಪಂಚಾಂಗ ದರ್ಶನ/i)).toBeDefined();
    expect(screen.getByText(/ಏಕ ರಾಶಿ ವಿಸ್ತೃತ ದರ್ಶನ/i)).toBeDefined();

    // Print & Download Buttons
    expect(screen.getByText(/ಪುಟ ಮುದ್ರಣ \(Print A4\)/i)).toBeDefined();
    expect(screen.getAllByText(/೧೨ ರಾಶಿಗಳ ಪುಸ್ತಕ PDF/i).length).toBeGreaterThanOrEqual(1);

    // Nakshatra Navigator elements
    expect(screen.getByText(/ಜನ್ಮ ನಕ್ಷತ್ರದಂತೆ ಫಲ ಶೋಧನೆ/i)).toBeDefined();
    expect(screen.getAllByText(/ಅಶ್ವಿನಿ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ರೋಹಿಣಿ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ರೇವತಿ/i).length).toBeGreaterThan(0);

    // 12-Rashi cards in All Rashis tab (also present in PDF offscreen container)
    expect(screen.getAllByText(/ಮೇಷ ರಾಶಿ \(Aries\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ವೃಷಭ ರಾಶಿ \(Taurus\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಮಿಥುನ ರಾಶಿ \(Gemini\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಕರ್ಕಾಟಕ ರಾಶಿ \(Cancer\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಸಿಂಹ ರಾಶಿ \(Leo\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಕನ್ಯಾ ರಾಶಿ \(Virgo\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ತುಲಾ ರಾಶಿ \(Libra\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ವೃಶ್ಚಿಕ ರಾಶಿ \(Scorpio\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಧನು ರಾಶಿ \(Sagittarius\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಮಕರ ರಾಶಿ \(Capricorn\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಕುಂಭ ರಾಶಿ \(Aquarius\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಮೀನ ರಾಶಿ \(Pisces\)/i).length).toBeGreaterThanOrEqual(1);
  });

  it("displays authentic Aaya-Vyaya badges with Kannada digits", () => {
    render(<VarshaBavishyaPage />);

    // Kannada Aaya-Vyaya badges
    expect(screen.getAllByText(/ಆದಾಯ: ೧೪ • ವ್ಯಯ: ೧೧ \| ರಾಜಪೂಜ್ಯ: ೪ • ಅವಮಾನ: ೧/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/ಆದಾಯ: ೧೧ • ವ್ಯಯ: ೦೫ \| ರಾಜಪೂಜ್ಯ: ೭ • ಅವಮಾನ: ೪/i).length).toBeGreaterThanOrEqual(1);
  });

  it("allows selecting a Nakshatra and links to its Rashi and padas", () => {
    render(<VarshaBavishyaPage />);

    const rohiniBtn = screen.getByText("ರೋಹಿಣಿ");
    fireEvent.click(rohiniBtn);

    // Rohini selection badge appears
    expect(screen.getByText(/ಆಯ್ಕೆ:/i)).toBeDefined();
    expect(screen.getAllByText(/ರೋಹಿಣಿ/i).length).toBeGreaterThanOrEqual(2);
  });

  it("allows switching to single Rashi deep-dive tab", () => {
    render(<VarshaBavishyaPage />);

    const singleTabBtn = screen.getByText(/ಏಕ ರಾಶಿ ವಿಸ್ತೃತ ದರ್ಶನ/i);
    fireEvent.click(singleTabBtn);

    // Deep dive elements should appear
    expect(screen.getByText(/ರಾಶಿ ಆಯ್ಕೆಮಾಡಿ/i)).toBeDefined();
    expect(screen.getByText(/ಆದಾಯ \(Income\):/i)).toBeDefined();
    expect(screen.getByText(/ವ್ಯಯ \(Expense\):/i)).toBeDefined();
    expect(screen.getByText(/ಆಧ್ಯಾತ್ಮಿಕ ಹಾಗೂ ದೈವಿಕ ಅಂಶಗಳು/i)).toBeDefined();
    expect(screen.getByText(/ಶ್ರೀರಾಮ ಪಂಡಿತ್ ವಾಣಿಯಲ್ಲಿ ಶ್ರವಣ/i)).toBeDefined();
  });

  it("triggers browser native print dialog when print button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<VarshaBavishyaPage />);

    const printBtn = screen.getByText(/ಪುಟ ಮುದ್ರಣ \(Print A4\)/i);
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it("updates year dynamically when quick year buttons are clicked", () => {
    render(<VarshaBavishyaPage />);

    const year2025Btns = screen.getAllByRole("button", { name: /2025/i });
    fireEvent.click(year2025Btns[0]!);

    // Should compute 2025 Vishwavasu
    expect(screen.getAllByText(/ವಿಶ್ವಾವಸು/i).length).toBeGreaterThan(0);
  });

  it("renders offscreen container for 12-Rashi Complete 6-Page A4 PDF Booklet with zero overflow guard", () => {
    const { container } = render(<VarshaBavishyaPage />);

    const pdfContainer = container.querySelector("#baggona-complete-12-rashi-pdf-book");
    expect(pdfContainer).not.toBeNull();

    // Complies with baggona-pdf-layout-guard: left is 0, width is 900px
    expect(pdfContainer?.getAttribute("style")).toContain("left: 0px");
    expect(pdfContainer?.getAttribute("style")).toContain("width: 900px");

    const pdfPages = pdfContainer?.querySelectorAll(".pdf-page");
    // 6 pages (2 Rashis per page) exactly replicating Pages 20-25 of Baggona Panchanga book
    expect(pdfPages?.length).toBe(6);
  });
});
