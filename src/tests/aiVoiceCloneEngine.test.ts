import { describe, it, expect, vi, beforeEach } from "vitest";
import { synthesizeAndPlayClonedVoice, stopClonedAudio, getVoiceCloneConfig, resolveBestVedicVoice, saveVoiceCloneConfig, sanitizeTextForSpeech } from "../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";
import { isProperAudioAvailableForStep } from "../components/darshana/DailyPoojaSankalpaModal";

describe("AI Voice Clone Engine & Dynamic Neural TTS", () => {
  beforeEach(() => {
    stopAllAudioGlobal();
    vi.restoreAllMocks();
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

  it("streams real-time audio via Custom Studio TTS with zero language param and Web Audio API chunks", async () => {
    // Generate dummy 24kHz Int16 mono PCM data (4800 bytes = 2400 samples = 0.1s)
    const pcmChunk1 = new Uint8Array(2400);
    const pcmChunk2 = new Uint8Array(2400);

    let readCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        readCount++;
        if (readCount === 1) return { done: false, value: pcmChunk1 };
        if (readCount === 2) return { done: false, value: pcmChunk2 };
        return { done: true, value: undefined };
      }),
      cancel: vi.fn()
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader
      }
    } as any);

    const onStart = vi.fn();
    const onEnd = vi.fn();

    // Mock AudioContext
    let scheduledBuffers: any[] = [];
    class MockAudioContext {
      currentTime = 0;
      state = "running";
      destination = {};
      createBuffer(channels: number, length: number, sampleRate: number) {
        return {
          duration: length / sampleRate,
          getChannelData: () => new Float32Array(length)
        };
      }
      createBufferSource() {
        const src: any = {
          buffer: null,
          connect: vi.fn(),
          start: vi.fn((time: number) => {
            scheduledBuffers.push({ src, time });
          }),
          onended: null
        };
        return src;
      }
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
    }
    (globalThis as any).AudioContext = MockAudioContext;

    const stopFn = await synthesizeAndPlayClonedVoice(
      "ಓಂ ನಮಃ ಶಿವಾಯ",
      "kn",
      undefined,
      onEnd,
      onStart
    );

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "xi-api-key": EXPECTED_STUDIO_KEY
        })
      })
    );

    // Verify request body strictly has voice_id and text, and ZERO language parameter
    const callArgs = fetchSpy.mock.calls[0];
    const bodyObj = JSON.parse(callArgs[1]?.body as string);
    expect(bodyObj.voice_id).toBe("voice_sriram_pandit");
    expect(bodyObj.text).toBe("ಓಂ ನಮಃ ಶಿವಾಯ");
    expect((bodyObj as any).language).toBeUndefined();
    expect((bodyObj as any).lang).toBeUndefined();

    // Wait microtask for reader loop to process chunk 1
    await new Promise((r) => setTimeout(r, 50));
    expect(onStart).toHaveBeenCalledTimes(1);

    stopFn();
  });

  it("strictly prevents overlapping audios by aborting previous stream and closing previous AudioContext", async () => {
    let abortSignal1: AbortSignal | undefined;
    let abortSignal2: AbortSignal | undefined;
    let audioCtxClosed1 = false;

    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url: any, opts: any) => {
      if (!abortSignal1) {
        abortSignal1 = opts?.signal;
        // Keep 1st stream pending in-flight
        return new Promise((resolve) => {
          opts?.signal?.addEventListener("abort", () => {
            resolve({ ok: false } as any);
          });
        });
      } else {
        abortSignal2 = opts?.signal;
        return {
          ok: true,
          body: {
            getReader: () => ({
              read: async () => ({ done: true, value: undefined }),
              cancel: vi.fn()
            })
          }
        } as any;
      }
    });

    let contextCount = 0;
    class MockAudioContext {
      currentTime = 0;
      state = "running";
      destination = {};
      createBuffer = vi.fn();
      createBufferSource = vi.fn();
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockImplementation(async () => {
        if (contextCount === 1) audioCtxClosed1 = true;
      });
      constructor() {
        contextCount++;
      }
    }
    (globalThis as any).AudioContext = MockAudioContext;

    // Start 1st audio stream (launches asynchronously in background)
    void synthesizeAndPlayClonedVoice("ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ", "kn");

    // Allow fetch to be initiated
    await new Promise((r) => setTimeout(r, 20));
    expect(abortSignal1).toBeDefined();
    expect(abortSignal1?.aborted).toBe(false);

    // Start 2nd audio stream -> must immediately abort 1st stream and close 1st AudioContext
    await synthesizeAndPlayClonedVoice("ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ", "kn");
    expect(abortSignal1?.aborted).toBe(true);
    expect(audioCtxClosed1).toBe(true);
    expect(abortSignal2?.aborted).toBe(false);
  });

  it("enforces isProperAudioAvailableForStep is active (true) for all 16 Daily Pooja steps across all Indic languages", () => {
    const langs: ("kn" | "ta" | "te" | "hi" | "en")[] = ["kn", "ta", "te", "hi", "en"];
    for (const lang of langs) {
      for (let step = 1; step <= 16; step++) {
        expect(isProperAudioAvailableForStep(step, lang)).toBe(true);
      }
    }
  });

  it("dynamically synthesizes audio via Indic-Parler TTS API when provider is explicitly set to indic_parler", async () => {
    saveVoiceCloneConfig({ provider: "indic_parler" });
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
    saveVoiceCloneConfig({ provider: "indic_parler" });
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
});
