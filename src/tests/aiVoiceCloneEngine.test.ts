import { describe, it, expect, vi, beforeEach } from "vitest";
import { synthesizeAndPlayClonedVoice, stopClonedAudio, getVoiceCloneConfig, resolveBestVedicVoice, saveVoiceCloneConfig } from "../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";

describe("AI Voice Clone Engine & Dynamic Neural TTS", () => {
  beforeEach(() => {
    stopAllAudioGlobal();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("guarantees config provider defaults to Indic-Parler TTS with zero static master recordings", () => {
    const config = getVoiceCloneConfig();
    expect(config.provider).toBe("indic_parler");
    expect((config as any).autoFallbackToMasterRecording).toBeUndefined();
    expect((config as any).masterAudioUrl).toBeUndefined();
  });

  it("dynamically synthesizes audio via Indic-Parler TTS API and invokes onStart callback", async () => {
    const mockAudioUrl = "data:audio/mp3;base64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    
    // Mock global fetch for /api/indic-tts proxy
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioUrl: mockAudioUrl
      })
    } as any);

    const onStart = vi.fn();
    const onEnd = vi.fn();

    // Mock HTMLAudioElement
    const playMock = vi.fn().mockImplementation(function (this: HTMLAudioElement) {
      if (this.onplay) (this.onplay as any)();
      return Promise.resolve();
    });

    const originalAudio = globalThis.Audio;
    globalThis.Audio = class {
      src = "";
      onplay: any = null;
      onended: any = null;
      onerror: any = null;
      play = playMock;
      pause = vi.fn();
      currentTime = 0;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      constructor(src?: string) {
        if (src) this.src = src;
      }
    } as any;

    const stopFn = await synthesizeAndPlayClonedVoice(
      "ಶ್ರೀ ಗಣಪತಯೇ ನಮಃ",
      "kn",
      "voice_shrisuma_master",
      onEnd,
      onStart
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/indic-tts",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("kn")
      })
    );
    expect(onStart).toHaveBeenCalledTimes(1);

    stopFn();
    globalThis.Audio = originalAudio;
  });

  it("serves repeated clicks instantaneously from in-memory LRU cache without extra HTTP requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioUrl: "data:audio/mp3;base64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
      })
    } as any);

    const onStart1 = vi.fn();
    const onStart2 = vi.fn();

    const originalAudio = globalThis.Audio;
    globalThis.Audio = class {
      src = "";
      onplay: any = null;
      onended: any = null;
      onerror: any = null;
      play = vi.fn().mockImplementation(function (this: HTMLAudioElement) {
        if (this.onplay) (this.onplay as any)();
        return Promise.resolve();
      });
      pause = vi.fn();
      currentTime = 0;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      constructor(src?: string) {
        if (src) this.src = src;
      }
    } as any;

    const text = "ಓಂ ನಮೋ ನಾರಾಯಣಾಯ ಶುಭಮಸ್ತು";

    // 1st invocation fetches from network
    await synthesizeAndPlayClonedVoice(text, "kn", undefined, undefined, onStart1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(onStart1).toHaveBeenCalledTimes(1);

    // 2nd invocation hits in-memory LRU cache (0ms network request)
    await synthesizeAndPlayClonedVoice(text, "kn", undefined, undefined, onStart2);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // STILL 1 (no second network request)
    expect(onStart2).toHaveBeenCalledTimes(1);

    globalThis.Audio = originalAudio;
  });

  it("dynamically synthesizes audio via Sarvam AI API when provider is explicitly set to sarvam_ai", async () => {
    saveVoiceCloneConfig({ provider: "sarvam_ai" });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audios: ["UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="]
      })
    } as any);

    const onStart = vi.fn();
    const onEnd = vi.fn();

    const playMock = vi.fn().mockImplementation(function (this: HTMLAudioElement) {
      if (this.onplay) (this.onplay as any)();
      return Promise.resolve();
    });

    const originalAudio = globalThis.Audio;
    globalThis.Audio = class {
      src = "";
      onplay: any = null;
      onended: any = null;
      onerror: any = null;
      play = playMock;
      pause = vi.fn();
      currentTime = 0;
      addEventListener = vi.fn();
      removeEventListener = vi.fn();
      constructor(src?: string) {
        if (src) this.src = src;
      }
    } as any;

    const stopFn = await synthesizeAndPlayClonedVoice(
      "ಶ್ರೀ ಗಣಪತಯೇ ನಮಃ",
      "kn",
      "voice_shrisuma_master",
      onEnd,
      onStart
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.sarvam.ai/text-to-speech",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("kn-IN")
      })
    );
    expect(onStart).toHaveBeenCalledTimes(1);

    stopFn();
    globalThis.Audio = originalAudio;
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
});
