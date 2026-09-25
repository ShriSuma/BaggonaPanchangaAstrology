import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import {
  DailyPoojaSankalpaModal,
  DEFAULT_NEXT_STEP_PROMPTS,
  WAITING_CARD_HEADER,
  getStepNarrationText
} from "../components/darshana/DailyPoojaSankalpaModal";
import {
  buildVoiceStreamUrl,
  splitTextIntoSentences,
  getVoiceIdForLanguage,
  streamSentencePipeline
} from "../features/audio/aiVoiceCloneEngine";
import { buildDailyPoojaSteps } from "../features/seva/dailySankalpaPoojaEngine";
import * as priestNarrator from "../features/seva/priestAudioNarrator";
import * as globalAudioManager from "../features/audio/globalAudioManager";

describe("Daily Pooja - Audio Default OFF, Sticky Auto-Play & Ritual Waiting Audit", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalAudioManager.stopAllAudioGlobal();
  });

  afterEach(() => {
    cleanup();
    globalAudioManager.stopAllAudioGlobal();
  });

  describe("Voice API - Streaming & Language Voice Mapping", () => {
    it("maps 5 languages to ultra-fast male voices with in-memory RAM cache", () => {
      expect(getVoiceIdForLanguage("kn")).toBe("voice_kannada_male");
      expect(getVoiceIdForLanguage("te")).toBe("voice_telugu_male");
      expect(getVoiceIdForLanguage("ta")).toBe("voice_tamil_male");
      expect(getVoiceIdForLanguage("hi")).toBe("voice_hindi_male");
      expect(getVoiceIdForLanguage("en")).toBe("voice_kannada_male");
    });

    it("builds correct direct streaming GET URL with gender=male and sanitized text", () => {
      const url = buildVoiceStreamUrl("ದೇವರೆದುರು ದೀಪ ಬೆಳಗಿಸಿ 🪔", "voice_kannada_male");
      expect(url).toContain("https://indian-language-voici-clone-tts-7273.ai.studio/v1/text-to-speech/voice_kannada_male");
      expect(url).toContain("gender=male");
      expect(url).not.toContain("🪔"); // Emojis stripped
    });

    it("splits long text into progressive sentences cleanly", () => {
      const text = "ದೇವರಿಗೆ ಎರಡೂ ಕೈಯನ್ನು ಮುಗಿದು ನಮಸ್ಕರಿಸಿ. ದೇವರ ಮುಂದೆ ಶುದ್ಧ ಎಣ್ಣೆಯ ದೀಪವನ್ನು ಬೆಳಗಿಸಿ! ಈಗ ಹೇಳುವ ಮಂತ್ರವನ್ನು ಸರಿಯಾಗಿ ಕೇಳಿ.";
      const sentences = splitTextIntoSentences(text);
      expect(sentences.length).toBe(3);
      expect(sentences[0]).toContain("ನಮಸ್ಕರಿಸಿ");
      expect(sentences[1]).toContain("ಬೆಳಗಿಸಿ");
      expect(sentences[2]).toContain("ಕೇಳಿ");
    });
  });

  describe("Ritual Action Waiting & Next Button Instructions", () => {
    it("Step 1 contains explicit waiting statement and 'ಮುಂದುವರಿಸಿ' button direction in Kannada", () => {
      const promptKn = DEFAULT_NEXT_STEP_PROMPTS.kn[1];
      expect(promptKn).toContain("ಕಾಯುತ್ತಿದ್ದೇನೆ");
      expect(promptKn).toContain("ಮುಂದುವರಿಸಿ");
    });

    it("Step 5 contains explicit waiting statement and 'ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ' button direction in Kannada", () => {
      const promptKn = DEFAULT_NEXT_STEP_PROMPTS.kn[5];
      expect(promptKn).toContain("ಕಾಯುತ್ತಿದ್ದೇನೆ");
      expect(promptKn).toContain("ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ");
    });

    it("all 5 languages contain waiting instructions across all 5 steps", () => {
      const langs = ["kn", "hi", "te", "ta", "en"] as const;
      for (const lang of langs) {
        for (let step = 1; step <= 5; step++) {
          const prompt = DEFAULT_NEXT_STEP_PROMPTS[lang][step];
          expect(prompt).toBeDefined();
          expect(prompt.length).toBeGreaterThan(15);
          if (lang === "kn") {
            expect(prompt).toContain("ಕಾಯುತ್ತಿದ್ದೇನೆ");
          } else if (lang === "hi") {
            expect(prompt).toContain("प्रतीक्षा");
          } else if (lang === "te") {
            expect(prompt).toContain("వేచి ఉంటాను");
          } else if (lang === "ta") {
            expect(prompt).toContain("காத்திருக்கிறேன்");
          } else if (lang === "en") {
            expect(prompt).toContain("waiting");
          }
        }
      }
    });

    it("spoken priest narration includes the waiting and next step prompt", () => {
      const steps = buildDailyPoojaSteps({ devoteeName: "ಶ್ರೀನಿವಾಸ", lang: "kn" });
      const step1Text = getStepNarrationText(steps[0], "kn");
      expect(step1Text).toContain("ನೀವು ದೀಪ ಬೆಳಗಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ");
      expect(step1Text).toContain("ಮುಂದುವರಿಸಿ");
    });
  });

  describe("DailyPoojaSankalpaModal - Audio Opt-In & Sticky Session Lifecycle", () => {
    it("opens modal with audio completely OFF by default without auto-playing", async () => {
      const speakSpy = vi.spyOn(priestNarrator, "speakPriestNarration");

      render(
        <DailyPoojaSankalpaModal
          isOpen={true}
          onClose={vi.fn()}
          devoteeName="ಮನೋಜ್"
          gotra="ಕಾಶ್ಯಪ"
          rashiName="ಧನು"
          lang="kn"
        />
      );

      // Verify that NO audio was triggered on open
      expect(speakSpy).not.toHaveBeenCalled();

      // Verify the dedicated waiting card is displayed
      expect(screen.getByText(WAITING_CARD_HEADER.kn)).toBeDefined();

      // Verify the next button displays 'ಮುಂದುವರಿಸಿ'
      expect(screen.getByText("ಮುಂದುವರಿಸಿ")).toBeDefined();
    });

    it("starts playing audio only when user clicks the audio play button", async () => {
      const speakSpy = vi.spyOn(priestNarrator, "speakPriestNarration").mockReturnValue(() => {});

      render(
        <DailyPoojaSankalpaModal
          isOpen={true}
          onClose={vi.fn()}
          devoteeName="ಮನೋಜ್"
          gotra="ಕಾಶ್ಯಪ"
          rashiName="ಧನು"
          lang="kn"
        />
      );

      expect(speakSpy).not.toHaveBeenCalled();

      // User clicks 'ಧ್ವನಿ ಕೇಳಿ'
      const playBtn = screen.getByText("ಧ್ವನಿ ಕೇಳಿ");
      fireEvent.click(playBtn);

      expect(speakSpy).toHaveBeenCalledTimes(1);
    });

    it("keeps playing audio on next step if user had clicked audio ON (sticky opt-in)", async () => {
      const speakSpy = vi.spyOn(priestNarrator, "speakPriestNarration").mockReturnValue(() => {});

      render(
        <DailyPoojaSankalpaModal
          isOpen={true}
          onClose={vi.fn()}
          devoteeName="ಮನೋಜ್"
          gotra="ಕಾಶ್ಯಪ"
          rashiName="ಧನು"
          lang="kn"
        />
      );

      // Devotee turns audio ON
      const playBtn = screen.getByText("ಧ್ವನಿ ಕೇಳಿ");
      fireEvent.click(playBtn);
      expect(speakSpy).toHaveBeenCalledTimes(1);

      // Devotee clicks 'ಮುಂದುವರಿಸಿ' to advance to Step 2
      const nextBtn = screen.getByText("ಮುಂದುವರಿಸಿ");
      fireEvent.click(nextBtn);

      // Audio should automatically trigger for Step 2 because audio was ON
      await waitFor(() => {
        expect(speakSpy).toHaveBeenCalledTimes(2);
      });
    });

    it("advances silently without audio on next step if user did NOT turn audio ON", async () => {
      const speakSpy = vi.spyOn(priestNarrator, "speakPriestNarration").mockReturnValue(() => {});

      render(
        <DailyPoojaSankalpaModal
          isOpen={true}
          onClose={vi.fn()}
          devoteeName="ಮನೋಜ್"
          gotra="ಕಾಶ್ಯಪ"
          rashiName="ಧನು"
          lang="kn"
        />
      );

      // Devotee never clicked audio button, clicks 'ಮುಂದುವರಿಸಿ' directly
      const nextBtn = screen.getByText("ಮುಂದುವರಿಸಿ");
      fireEvent.click(nextBtn);

      // Step advances, but audio remains silent (0 calls)
      await new Promise((r) => setTimeout(r, 300));
      expect(speakSpy).not.toHaveBeenCalled();
    });

    it("stops audio and disables sticky auto-play when user clicks stop button", async () => {
      let activeOnStart: (() => void) | undefined;
      const speakSpy = vi.spyOn(priestNarrator, "speakPriestNarration").mockImplementation(
        (_text, _lang, _onEnd, _key, _voiceId, onStart) => {
          activeOnStart = onStart;
          if (onStart) onStart();
          return () => {};
        }
      );

      render(
        <DailyPoojaSankalpaModal
          isOpen={true}
          onClose={vi.fn()}
          devoteeName="ಮನೋಜ್"
          gotra="ಕಾಶ್ಯಪ"
          rashiName="ಧನು"
          lang="kn"
        />
      );

      // 1. Devotee starts audio
      const playBtn = screen.getByText("ಧ್ವನಿ ಕೇಳಿ");
      fireEvent.click(playBtn);
      expect(speakSpy).toHaveBeenCalledTimes(1);

      // 2. Devotee clicks stop button ("ಧ್ವನಿ ನಿಲ್ಲಿಸಿ")
      const stopBtn = screen.getByText("ಧ್ವನಿ ನಿಲ್ಲಿಸಿ");
      fireEvent.click(stopBtn);

      // 3. Devotee clicks 'ಮುಂದುವರಿಸಿ'
      const nextBtn = screen.getByText("ಮುಂದುವರಿಸಿ");
      fireEvent.click(nextBtn);

      // Audio should NOT play on next step because user explicitly stopped it
      await new Promise((r) => setTimeout(r, 300));
      expect(speakSpy).toHaveBeenCalledTimes(1); // Still only 1 call from step 1
    });
  });
});
