import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DailyPoojaSankalpaModal } from "../components/darshana/DailyPoojaSankalpaModal";
import * as priestNarrator from "../features/seva/priestAudioNarrator";
import * as globalAudioManager from "../features/audio/globalAudioManager";

// Mock priestAudioNarrator
vi.mock("../features/seva/priestAudioNarrator", () => {
  let isPlaying = false;
  let isPaused = false;
  return {
    speakPriestNarration: vi.fn((text, lang, onEnd, onBoundary, voiceId, onStart) => {
      isPlaying = true;
      isPaused = false;
      if (onStart) onStart();
      return () => {
        isPlaying = false;
        isPaused = false;
        if (onEnd) onEnd();
      };
    }),
    pausePriestAudio: vi.fn(() => {
      isPaused = true;
    }),
    resumePriestAudio: vi.fn(() => {
      isPaused = false;
    }),
    isPriestAudioPaused: vi.fn(() => isPaused),
    seekPriestAudio: vi.fn(),
    stopPriestAudio: vi.fn(() => {
      isPlaying = false;
      isPaused = false;
    }),
    isProperAudioAvailableForStep: vi.fn(() => true)
  };
});

describe("Daily Pooja Audio Controls & Japa Refinement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalAudioManager.stopAllAudioGlobal();
  });

  afterEach(() => {
    cleanup();
    globalAudioManager.stopAllAudioGlobal();
  });

  it("renders audio player dock upon clicking play, allowing Pause, Resume, Seek, and Restart", async () => {
    render(
      <DailyPoojaSankalpaModal
        isOpen={true}
        onClose={vi.fn()}
        devoteeName="ವಿಶ್ವಾಸ್"
        lang="kn"
      />
    );

    // Initial state: Play button is available
    const playBtn = screen.getByText("ಧ್ವನಿ ಕೇಳಿ");
    expect(playBtn).toBeDefined();

    // Click play
    fireEvent.click(playBtn);

    // Now audio is playing; dock controls appear
    expect(screen.getByTitle("ವಿರಾಮ")).toBeDefined(); // Pause button
    expect(screen.getAllByText("10s").length).toBe(2); // Seek backward and forward
    expect(screen.getByTitle("ಮೊದಲಿಂದ")).toBeDefined(); // Restart button
    expect(screen.getByText("ಧ್ವನಿ ನಿಲ್ಲಿಸಿ")).toBeDefined(); // Stop button

    // Click pause button
    const pauseBtn = screen.getByTitle("ವಿರಾಮ");
    fireEvent.click(pauseBtn);
    expect(priestNarrator.pausePriestAudio).toHaveBeenCalledTimes(1);

    // Now button switches to Resume title
    const resumeBtn = screen.getByTitle("ಮುಂದುವರಿಸಿ");
    expect(resumeBtn).toBeDefined();

    // Click resume button
    fireEvent.click(resumeBtn);
    expect(priestNarrator.resumePriestAudio).toHaveBeenCalledTimes(1);

    // Test seek -10s
    const seekBackBtn = screen.getByTitle("-೧೦ಸೆ");
    fireEvent.click(seekBackBtn);
    expect(priestNarrator.seekPriestAudio).toHaveBeenCalledWith(-10);

    // Test seek +10s
    const seekFwdBtn = screen.getByTitle("+೧೦ಸೆ");
    fireEvent.click(seekFwdBtn);
    expect(priestNarrator.seekPriestAudio).toHaveBeenCalledWith(10);

    // Test restart from beginning
    const restartBtn = screen.getByTitle("ಮೊದಲಿಂದ");
    fireEvent.click(restartBtn);
    expect(priestNarrator.speakPriestNarration).toHaveBeenCalledTimes(2);

    // Test stop
    const stopBtn = screen.getByText("ಧ್ವನಿ ನಿಲ್ಲಿಸಿ");
    fireEvent.click(stopBtn);
    // Returns to idle play button
    expect(screen.getByText("ಧ್ವನಿ ಕೇಳಿ")).toBeDefined();
  });

  it("supports double-clicking the ritual action card to toggle Pause/Resume", async () => {
    render(
      <DailyPoojaSankalpaModal
        isOpen={true}
        onClose={vi.fn()}
        devoteeName="ಶ್ರೀಧರ್"
        lang="kn"
      />
    );

    // Start playing
    fireEvent.click(screen.getByText("ಧ್ವನಿ ಕೇಳಿ"));
    expect(screen.getByTitle("ವಿರಾಮ")).toBeDefined();

    // Find the guidance card with title
    const guidanceCard = screen.getByTitle("ಡಬಲ್ ಕ್ಲಿಕ್: ವಿರಾಮಗೊಳಿಸಿ (Double click to pause)");
    expect(guidanceCard).toBeDefined();

    // Double-click guidance card to pause
    fireEvent.doubleClick(guidanceCard);
    expect(priestNarrator.pausePriestAudio).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle("ಮುಂದುವರಿಸಿ")).toBeDefined();

    // Double-click again to resume
    fireEvent.doubleClick(guidanceCard);
    expect(priestNarrator.resumePriestAudio).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle("ವಿರಾಮ")).toBeDefined();
  });

  describe("AI Voice Clone Engine - 5-Second Wait & Pause/Seek Mechanics", () => {
    it("exports pauseClonedAudio, resumeClonedAudio, isClonedAudioPaused, seekClonedAudio", async () => {
      const cloneEngine = await import("../features/audio/aiVoiceCloneEngine");
      expect(typeof cloneEngine.pauseClonedAudio).toBe("function");
      expect(typeof cloneEngine.resumeClonedAudio).toBe("function");
      expect(typeof cloneEngine.isClonedAudioPaused).toBe("function");
      expect(typeof cloneEngine.seekClonedAudio).toBe("function");
      expect(cloneEngine.isClonedAudioPaused()).toBe(false);
    });

    it("synthesizeAndPlayClonedVoice waits 5000ms before falling back to Web Speech to prevent overlapping voices", async () => {
      vi.useFakeTimers();
      const cloneEngine = await import("../features/audio/aiVoiceCloneEngine");

      let startCalled = false;
      let endCalled = false;

      // Call synthesizeAndPlayClonedVoice
      const cancelFn = await cloneEngine.synthesizeAndPlayClonedVoice(
        "ಓಂ ನಮಃ ಶಿವಾಯ",
        "kn",
        "voice_kannada_male",
        () => { endCalled = true; },
        () => { startCalled = true; }
      );

      // Advance 4900ms (less than 5s) -> Web Speech fallback must NOT have fired prematurely
      vi.advanceTimersByTime(4900);
      expect(startCalled).toBe(false);

      // Cancel playback cleans up gracefully
      cancelFn();
      vi.useRealTimers();
    });
  });
});

