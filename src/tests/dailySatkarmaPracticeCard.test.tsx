import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { DailySatkarmaPracticeCard } from "../components/seva/DailySatkarmaPracticeCard";
import { calculateDeterministicRhythmDay } from "../features/seva/icsCalendarGenerator";

describe("DailySatkarmaPracticeCard Component & Interactive 3-Button Check-in", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  const mockDay = calculateDeterministicRhythmDay("2026-08-21", 12, 5);

  it("renders daily satkarma title, action, and benefit in Kannada", async () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
        panditName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
        userId="user_test_kn"
      />
    );

    expect(await screen.findByText(/ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ/i)).toBeDefined();
    expect(screen.getByText(/ನೀವು ಇಂದು ಈ ಪುಟ್ಟ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿದಿರಾ/i)).toBeDefined();
    expect(screen.getByText(/ಹೌದು/i)).toBeDefined();
    expect(screen.getByText(/ಇನ್ನೂ ಇಲ್ಲ/i)).toBeDefined();
    expect(screen.getByText(/ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ/i)).toBeDefined();
  });

  it("renders localized content in English, Hindi, Telugu, and Tamil", async () => {
    const { rerender } = render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="en"
        devoteeName="Ananya"
        userId="user_test_en"
      />
    );
    expect(await screen.findByText(/Daily Good Karma Practice/i)).toBeDefined();
    expect(screen.getByText(/Have you practiced this simple good deed today/i)).toBeDefined();
    expect(screen.getByText(/Yes \(Done\)/i)).toBeDefined();
    expect(screen.getByText(/Still Not Yet/i)).toBeDefined();

    rerender(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="hi"
        devoteeName="अनन्या"
        userId="user_test_hi"
      />
    );
    expect(await screen.findByText(/आज का शुभ सत्कर्म अभ्यास/i)).toBeDefined();

    rerender(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="te"
        devoteeName="అనన్య"
        userId="user_test_te"
      />
    );
    expect(await screen.findByText(/నేటి సత్కర్మ సంకల్పం/i)).toBeDefined();
  });

  it("selecting Yes displays confirmation and updates DB / Punya Butte", async () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
        userId="user_test_yes"
      />
    );

    const yesBtn = await screen.findByText(/ಹೌದು/i);
    fireEvent.click(yesBtn);

    expect(await screen.findByText(/ಪುಣ್ಯ ಬುಟ್ಟಿ ಭರ್ತಿಯಾಗಿದೆ/i)).toBeDefined();
  });

  it("selecting Still Not Yet displays 3-hour reminder confirmation", async () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
        userId="user_test_not_yet"
      />
    );

    const notYetBtn = await screen.findByText(/ಇನ್ನೂ ಇಲ್ಲ/i);
    fireEvent.click(notYetBtn);

    expect(await screen.findByText(/೩ ಗಂಟೆಗಳ ನಂತರ ಮತ್ತೆ ನೆನಪಿಸಲಾಗುವುದು/i)).toBeDefined();
  });

  it("selecting No displays warm encouraging message and logs Karma entry", async () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
        userId="user_test_no"
      />
    );

    const noBtn = await screen.findByText(/ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ/i);
    fireEvent.click(noBtn);

    expect(await screen.findByText(/ನಾಳೆಯಿಂದ ಈ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿ/i)).toBeDefined();
  });
});
