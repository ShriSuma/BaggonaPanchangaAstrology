import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DailySatkarmaPracticeCard } from "../components/seva/DailySatkarmaPracticeCard";
import { calculateDeterministicRhythmDay } from "../features/seva/icsCalendarGenerator";

describe("DailySatkarmaPracticeCard Component & Interactive 3-Button Check-in", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  const mockDay = calculateDeterministicRhythmDay("2026-08-21", 12, 5);

  it("renders daily satkarma title, action, and benefit in Kannada", () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
        panditName="ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
      />
    );

    expect(screen.getByText(/ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ/i)).toBeDefined();
    expect(screen.getByText(/ನೀವು ಇಂದು ಈ ಪುಟ್ಟ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿದಿರಾ/i)).toBeDefined();
    expect(screen.getByText(/ಹೌದು/i)).toBeDefined();
    expect(screen.getByText(/ಇನ್ನೂ ಇಲ್ಲ/i)).toBeDefined();
    expect(screen.getByText(/ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ/i)).toBeDefined();
  });

  it("renders localized content in English, Hindi, Telugu, and Tamil", () => {
    const { rerender } = render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="en"
        devoteeName="Ananya"
      />
    );
    expect(screen.getByText(/Daily Good Karma Practice/i)).toBeDefined();
    expect(screen.getByText(/Have you practiced this simple good deed today/i)).toBeDefined();
    expect(screen.getByText(/Yes \(Done\)/i)).toBeDefined();
    expect(screen.getByText(/Still Not Yet/i)).toBeDefined();

    rerender(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="hi"
        devoteeName="अनन्या"
      />
    );
    expect(screen.getByText(/आज का शुभ सत्कर्म अभ्यास/i)).toBeDefined();

    rerender(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="te"
        devoteeName="అనన్య"
      />
    );
    expect(screen.getByText(/నేటి సత్ಕರ್ಮ ಸಂಕಲ್ಪಂ|నేటి సత్కర్మ సంకల్పం/i)).toBeDefined();
  });

  it("selecting Yes displays celebration message and saves to localStorage", () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
      />
    );

    const yesBtn = screen.getByText(/ಹೌದು/i);
    fireEvent.click(yesBtn);

    expect(screen.getByText(/ಸತ್ಕರ್ಮ ಸಂಪನ್ನಗೊಂಡಿದೆ/i)).toBeDefined();
    expect(screen.getByText(/ಸತ್ಕರ್ಮದ ಫಲ ನಿಮ್ಮೊಂದಿಗೆ ಸದಾ ಇರಲಿ/i)).toBeDefined();
    expect(localStorage.getItem(`baggona_satkarma_${mockDay.ymd}`)).toBe("yes");
  });

  it("selecting Still Not Yet calculates remaining hours and minutes today and displays inspiring encouragement", () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
      />
    );

    const notYetBtn = screen.getByText(/ಇನ್ನೂ ಇಲ್ಲ/i);
    fireEvent.click(notYetBtn);

    expect(screen.getByText(/ಇಂದಿನ ದಿನ ಮುಗಿಯಲು ಇನ್ನೂ/i)).toBeDefined();
    expect(screen.getByText(/ಚಿಂತಿಸಬೇಡಿ! ದಿನ ಮುಗಿಯಲು ಇನ್ನೂ ಸಾಕಷ್ಟು ಸಮಯವಿದೆ/i)).toBeDefined();
    expect(screen.getByText(/ನೀವು ಖಂಡಿತ ಇದನ್ನು ಮಾಡಬಲ್ಲಿರಿ/i)).toBeDefined();
    expect(localStorage.getItem(`baggona_satkarma_${mockDay.ymd}`)).toBe("not_yet");
  });

  it("selecting No displays warm, guilt-free motivation encouraging tomorrow's practice", () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
      />
    );

    const noBtn = screen.getByText(/ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ/i);
    fireEvent.click(noBtn);

    expect(screen.getByText(/ಪರವಾಗಿಲ್ಲ! ನಾಳೆ ಹೊಸ ಆರಂಭ/i)).toBeDefined();
    expect(screen.getByText(/ನಾಳೆಯಿಂದ ಈ ಸತ್ಕರ್ಮವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ/i)).toBeDefined();
    expect(screen.getByText(/ನಿಮ್ಮ ಮನಸ್ಸಿಗೂ ಅಪಾರ ಆಂತರಿಕ ಶಾಂತಿ/i)).toBeDefined();
    expect(localStorage.getItem(`baggona_satkarma_${mockDay.ymd}`)).toBe("no");
  });

  it("allows user to change / undo choice", () => {
    render(
      <DailySatkarmaPracticeCard
        day={mockDay}
        lang="kn"
        devoteeName="ಅನನ್ಯಾ"
      />
    );

    const yesBtn = screen.getByText(/ಹೌದು/i);
    fireEvent.click(yesBtn);
    expect(screen.getByText(/ಸತ್ಕರ್ಮ ಸಂಪನ್ನಗೊಂಡಿದೆ/i)).toBeDefined();

    const undoBtn = screen.getByText(/ಬದಲಾಯಿಸಿ \(Undo\)/i);
    fireEvent.click(undoBtn);

    // Buttons should now be back
    expect(screen.getByText(/ಹೌದು/i)).toBeDefined();
    expect(screen.getByText(/ಇನ್ನೂ ಇಲ್ಲ/i)).toBeDefined();
  });
});
