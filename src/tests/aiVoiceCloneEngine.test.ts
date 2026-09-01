import { describe, it, expect, vi, beforeEach } from "vitest";
import { synthesizeAndPlayClonedVoice, stopClonedAudio, getVoiceCloneConfig } from "../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal } from "../features/audio/globalAudioManager";

describe("AI Voice Clone Engine & Dynamic Neural TTS", () => {
  beforeEach(() => {
    stopAllAudioGlobal();
    vi.restoreAllMocks();
  });

  it("guarantees config provider defaults to Sarvam AI with zero static master recordings", () => {
    const config = getVoiceCloneConfig();
    expect(config.provider).toBe("sarvam_ai");
    expect(config.sarvamSpeaker).toBe("gokul");
    expect((config as any).autoFallbackToMasterRecording).toBeUndefined();
    expect((config as any).masterAudioUrl).toBeUndefined();
  });

  it("dynamically synthesizes audio via Sarvam AI API and invokes onStart callback", async () => {
    const mockAudioDataUrl = "data:audio/wav;base64,UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    
    // Mock global fetch for Sarvam AI
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audios: ["UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="]
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

  it("serves repeated clicks instantaneously from in-memory LRU cache without extra HTTP requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audios: ["UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="]
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
});
