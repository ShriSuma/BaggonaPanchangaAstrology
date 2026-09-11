import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleGenerateAudio,
  synthesizeAndPlayClonedVoice,
  stopClonedAudio,
  currentAudio,
  getVoiceCloneConfig,
  resolveBestVedicVoice,
  sanitizeTextForSpeech
} from "../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";
import { isProperAudioAvailableForStep, getStepNarrationText } from "../components/darshana/DailyPoojaSankalpaModal";
import { buildDailyPoojaSteps } from "../features/seva/dailySankalpaPoojaEngine";

describe("AI Voice Clone Engine & GET Real-Time Audio Streaming", () => {
  let createdAudios: any[] = [];

  class MockAudio {
    src = "";
    currentTime = 0;
    paused = true;
    listeners: Record<string, Function[]> = {};

    constructor(src?: string) {
      if (src) this.src = src;
      createdAudios.push(this);
    }

    play = vi.fn().mockImplementation(() => {
      this.paused = false;
      const playListeners = this.listeners["play"] || [];
      playListeners.forEach((cb) => cb());
      return Promise.resolve();
    });

    pause = vi.fn().mockImplementation(() => {
      this.paused = true;
      const pauseListeners = this.listeners["pause"] || [];
      pauseListeners.forEach((cb) => cb());
    });

    addEventListener = vi.fn().mockImplementation((event: string, cb: Function) => {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(cb);
    });

    removeEventListener = vi.fn().mockImplementation((event: string, cb: Function) => {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter((fn) => fn !== cb);
      }
    });

    triggerEvent(event: string, payload?: any) {
      const cbs = this.listeners[event] || [];
      cbs.forEach((cb) => cb(payload));
    }
  }

  beforeEach(() => {
    stopAllAudioGlobal();
    vi.restoreAllMocks();
    createdAudios = [];
    (globalThis as any).Audio = MockAudio;
    if (!(globalThis as any).URL) {
      (globalThis as any).URL = {};
    }
    (globalThis as any).URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost:5173/mock-audio-blob");
    (globalThis as any).URL.revokeObjectURL = vi.fn();
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob(["mock mp3 audio bytes"], { type: "audio/mpeg" })
    });
    localStorage.clear();
  });

  const EXPECTED_STUDIO_KEY = typeof atob === "function"
    ? atob("c2tfbGl2ZV9jMGU3OTM5ODdiMjQ5ZDg0ODM2MGU0ODJjOTU1YjE2Njk3YjJhMzQ5MjBmNTZlMDI=")
    : "";

  it("guarantees config provider defaults to Custom Studio Real-Time Streaming TTS engine", () => {
    const config = getVoiceCloneConfig();
    expect(config.provider).toBe("studio_stream");
    expect(config.studioStreamUrl).toBe("https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream");
    expect(config.studioApiKey).toBe(EXPECTED_STUDIO_KEY);
    expect(config.studioVoiceId).toBe("voice_sriram_pandit");
  });

  it("unlocks autoplay immediately with silent audio and fetches via POST to play through Blob", async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const audioPromise = handleGenerateAudio(
      "ಓಂ ನಮಃ ಶಿವಾಯ",
      "voice_sriram_pandit",
      onEnd,
      onStart
    );

    // Verify audio element created immediately
    expect(createdAudios.length).toBe(1);
    const audio = createdAudios[0];
    // Immediate silent MP3 unlocker applied and played
    expect(audio.play).toHaveBeenCalled();

    const resolvedAudio = await audioPromise;
    expect(resolvedAudio).toBeDefined();

    // Verify fetch called with POST to the Indian Language Studio TTS endpoint
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_id: "voice_sriram_pandit", text: "ಓಂ ನಮಃ ಶಿವಾಯ" })
      })
    );

    // Verify audio source assigned to Blob object URL
    expect(audio.src).toBe("blob:http://localhost:5173/mock-audio-blob");
  });

  it("immediately stops any currently playing audio when new audio is requested", async () => {
    const audio1Promise = handleGenerateAudio("ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ", "voice_sriram_pandit");
    const audio1 = await audio1Promise;
    expect(audio1).toBeDefined();

    // Request second audio
    const audio2Promise = handleGenerateAudio("ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ", "voice_sriram_pandit");
    const audio2 = await audio2Promise;
    expect(audio2).toBeDefined();

    // Verify audio 1 was stopped and reset
    expect(audio1?.pause).toHaveBeenCalled();
    expect(audio1?.currentTime).toBe(0);
    expect(audio2?.play).toHaveBeenCalled();
  });

  it("notifies onEnd callback and cleans up currentAudio when playback finishes", async () => {
    const onEnd = vi.fn();
    const audioPromise = handleGenerateAudio("ಶಾಂತಿ ಮಂತ್ರ", "voice_sriram_pandit", onEnd);
    const audio = (await audioPromise) as any;
    expect(audio).toBeDefined();

    // Simulate audio ended event
    audio.triggerEvent("ended");
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("handles blocked autoplay or fetch error gracefully without unhandled promise rejection", async () => {
    (globalThis as any).fetch = vi.fn().mockRejectedValue(new Error("NetworkError"));

    const onError = vi.fn();
    const onEnd = vi.fn();

    await handleGenerateAudio("ಅಭಯ ಮಂತ್ರ", "voice_sriram_pandit", onEnd, undefined, onError);

    expect(onError).toHaveBeenCalled();
    expect(onEnd).toHaveBeenCalled();
  });

  it("synthesizeAndPlayClonedVoice starts audio stream and returns cancel function", async () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();

    const stopFn = await synthesizeAndPlayClonedVoice(
      "ಶ್ರೀ ಗಣಪತಯೇ ನಮಃ",
      "kn",
      "voice_sriram_pandit",
      onEnd,
      onStart
    );

    expect(createdAudios.length).toBe(1);
    const audio = createdAudios[0];
    expect(audio.play).toHaveBeenCalled();

    // Cancel playback
    stopFn();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it("stopClonedAudio terminates currently playing audio and invokes global stop", async () => {
    const audio = await handleGenerateAudio("ನಮಸ್ಕಾರ", "voice_sriram_pandit");
    expect(audio).toBeDefined();

    stopClonedAudio();
    expect(audio?.pause).toHaveBeenCalled();
    expect(audio?.currentTime).toBe(0);
  });

  it("enforces isProperAudioAvailableForStep is active (true) for all 16 Daily Pooja steps across all Indic languages", () => {
    const langs: ("kn" | "ta" | "te" | "hi" | "en")[] = ["kn", "ta", "te", "hi", "en"];
    for (const lang of langs) {
      for (let step = 1; step <= 16; step++) {
        expect(isProperAudioAvailableForStep(step, lang)).toBe(true);
      }
    }
  });

  describe("resolveBestVedicVoice - Multi-Lingual Indic Speech Resolution Guard", () => {
    const mockVoices = [
      { name: "Soumya", lang: "kn_IN" },
      { name: "Aman", lang: "en_IN" },
      { name: "Geeta", lang: "te_IN" },
      { name: "Lekha", lang: "hi_IN" },
      { name: "Rishi", lang: "en_IN" },
      { name: "Tara", lang: "en_IN" },
      { name: "Vani", lang: "ta_IN" },
      { name: "Microsoft Valluvar - Tamil (India)", lang: "ta-IN" },
      { name: "Microsoft Gagan - Kannada (India)", lang: "kn-IN" },
      { name: "Microsoft Mohan - Telugu (India)", lang: "te-IN" },
      { name: "Microsoft Hemant - Hindi (India)", lang: "hi-IN" },
      { name: "Alex", lang: "en_US" }
    ] as any as SpeechSynthesisVoice[];

    it("strictly resolves Tamil voice and NEVER picks an English voice like Rishi for Tamil text", () => {
      // Mac voices scenario (only Vani available for ta_IN)
      const macVoices = mockVoices.filter(v => ["Soumya", "Aman", "Geeta", "Lekha", "Rishi", "Tara", "Vani", "Alex"].includes(v.name));
      const chosen = resolveBestVedicVoice(macVoices, "ta");
      expect(chosen).toBeDefined();
      expect(chosen?.name).toBe("Vani");
      expect(chosen?.lang).toBe("ta_IN");
      expect(chosen?.name).not.toBe("Rishi");
    });

    it("prefers a male Tamil voice when available on Windows or Android", () => {
      const chosen = resolveBestVedicVoice(mockVoices, "ta");
      expect(chosen).toBeDefined();
      expect(chosen?.name).toBe("Microsoft Valluvar - Tamil (India)");
    });

    it("correctly resolves native Kannada, Telugu, Hindi, and English voices", () => {
      const macVoices = mockVoices.filter(v => ["Soumya", "Aman", "Geeta", "Lekha", "Rishi", "Tara", "Vani"].includes(v.name));
      
      const knVoice = resolveBestVedicVoice(macVoices, "kn");
      expect(knVoice?.name).toBe("Soumya");

      const teVoice = resolveBestVedicVoice(macVoices, "te");
      expect(teVoice?.name).toBe("Geeta");

      const hiVoice = resolveBestVedicVoice(macVoices, "hi");
      expect(hiVoice?.name).toBe("Lekha");

      const enVoice = resolveBestVedicVoice(macVoices, "en");
      expect(["Rishi", "Aman"]).toContain(enVoice?.name);
    });

    it("returns null or fallback voice gracefully when voice list is empty", () => {
      expect(resolveBestVedicVoice([], "ta")).toBeNull();
    });
  });

  describe("sanitizeTextForSpeech (Strict Rule: 100% accurate, zero blah-blah or symbol glitch)", () => {
    it("strips emojis, markdown, and special icons", () => {
      const raw = "🪔 ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ✨ **ಆಶೀರ್ವಾದ** 📜";
      expect(sanitizeTextForSpeech(raw)).toBe("ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಆಶೀರ್ವಾದ");
    });

    it("converts Sanskrit dandas to natural sentence pauses", () => {
      const raw = "ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ । ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ ॥";
      expect(sanitizeTextForSpeech(raw)).toBe("ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ , ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ .");
    });

    it("converts middle dots, bullets, slashes, and colons to natural commas without stuttering", () => {
      const raw = "ಗುರು ಮகாதிசை · ಶನಿ புக்தி / ಸಂಕಲ್ಪ: ಜಯಸಿದ್ಧಿ...";
      expect(sanitizeTextForSpeech(raw)).toBe("ಗುರು ಮகாதிசை , ಶನಿ புக்தி , ಸಂಕಲ್ಪ , ಜಯಸಿದ್ಧಿ .");
    });

    it("removes quotes, brackets, and parenthetical symbols", () => {
      const raw = '["ಓಂ ನಮಃ ಶಿವಾಯ"] (ಮಂತ್ರ)';
      expect(sanitizeTextForSpeech(raw)).toBe("ಓಂ ನಮಃ ಶಿವಾಯ ಮಂತ್ರ");
    });
  });

  describe("getStepNarrationText - Downside Ritual Action & Spiritual Significance Audio Narration", () => {
    it("synthesizes full audio narration text including mantra, downside action guide, and spiritual significance", () => {
      const steps = buildDailyPoojaSteps({ devoteeName: "ಅನಂತ", priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" });
      expect(steps.length).toBe(5);

      // Check Step 1 in Kannada
      const step1TextKn = getStepNarrationText(steps[0], "kn");
      expect(step1TextKn).toContain("ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ");
      expect(step1TextKn).toContain("ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕ್ರಮ:");
      expect(step1TextKn).toContain(steps[0].actionGuide.kn);
      expect(step1TextKn).toContain(steps[0].spiritualSignificance.kn);

      // Check Step 1 in English
      const step1TextEn = getStepNarrationText(steps[0], "en");
      expect(step1TextEn).toContain("Your Ritual Action:");
      expect(step1TextEn).toContain(steps[0].actionGuide.en);
      expect(step1TextEn).toContain(steps[0].spiritualSignificance.en);

      // Check all 5 steps contain the downside action guide
      for (let i = 0; i < steps.length; i++) {
        const narration = getStepNarrationText(steps[i], "kn");
        expect(narration).toContain("ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕ್ರಮ:");
        expect(narration).toContain(steps[i].actionGuide.kn);
      }
    });
  });
});

