import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { KarmaMandalaPage } from "../features/karmaSanjeevini/KarmaMandalaPage";
import { useAppStore } from "../stores/appStore";

describe("KarmaMandalaPage Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the flagship title in English and Priest contact info", () => {
    useAppStore.setState({ language: "en" });
    render(<KarmaMandalaPage />);

    // Check Header Title in English
    const enTitles = screen.getAllByText(/Divine Karma Sanjeevini & Sri Kshetra Gokarna Remedial Command Center/i);
    expect(enTitles.length).toBeGreaterThanOrEqual(1);

    // Check Gokarna Sannidhi Ribbon
    expect(
      screen.getByText(/ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್/i)
    ).toBeInTheDocument();

    // Check Priest phone number presence
    const priestPhones = screen.getAllByText(/9972339362/);
    expect(priestPhones.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the flagship title in Kannada when language is kn", () => {
    useAppStore.setState({ language: "kn" });
    render(<KarmaMandalaPage />);

    // Check Header Title in Kannada
    const knTitles = screen.getAllByText(/॥ ದೈವಿಕ ಕರ್ಮ ಸಂಜೀವಿನಿ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ ಮಂಡಲ ॥/i);
    expect(knTitles.length).toBeGreaterThanOrEqual(1);

    // Check Japa Mandala presence in Kannada
    const japaElements = screen.getAllByText(/೪೦ ದಿನಗಳ ಜಪ ಸಾಧನಾ ಚಕ್ರ/i);
    expect(japaElements.length).toBeGreaterThanOrEqual(1);

    // Check Gokarna Remedial Muhurtha section in Kannada
    const muhurthaElements = screen.getAllByText(/ಗೋಕರ್ಣ ಪರಿಹಾರ ಮುಹೂರ್ತ ದಿಕ್ಸೂಚಿ/i);
    expect(muhurthaElements.length).toBeGreaterThanOrEqual(1);
  });
});
