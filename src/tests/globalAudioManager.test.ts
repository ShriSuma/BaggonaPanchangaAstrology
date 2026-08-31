import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  startNewAudioSession,
  isPlaybackTokenActive,
  stopAllAudioGlobal,
  stopAllAudioLocal,
  registerActiveAudio,
  onGlobalAudioStop
} from "../features/audio/globalAudioManager";

describe("Global Cross-Tab Audio Coordinator", () => {
  beforeEach(() => {
    stopAllAudioLocal();
  });

  it("invalidates previous playback tokens when a new audio session starts", () => {
    const token1 = startNewAudioSession();
    expect(isPlaybackTokenActive(token1)).toBe(true);

    const token2 = startNewAudioSession();
    expect(isPlaybackTokenActive(token1)).toBe(false);
    expect(isPlaybackTokenActive(token2)).toBe(true);
  });

  it("notifies all registered UI listeners when global audio is stopped", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unreg1 = onGlobalAudioStop(listener1);
    const unreg2 = onGlobalAudioStop(listener2);

    stopAllAudioGlobal();

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);

    unreg1();
    stopAllAudioGlobal();

    expect(listener1).toHaveBeenCalledTimes(1); // not called again
    expect(listener2).toHaveBeenCalledTimes(2);

    unreg2();
  });

  it("pauses and clears registered HTMLAudioElements upon stop", () => {
    const mockAudio = {
      pause: vi.fn(),
      currentTime: 10,
      src: "blob:http://localhost/test",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as unknown as HTMLAudioElement;

    registerActiveAudio(mockAudio);
    stopAllAudioLocal();

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.currentTime).toBe(0);
    expect(mockAudio.src).toBe("");
  });
});
