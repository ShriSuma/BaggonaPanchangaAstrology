/**
 * Baggona Panchanga - Universal Cross-Tab & Global Audio Coordinator (ಜಾಗತಿಕ ಧ್ವನಿ ಸಂಯೋಜಕ)
 * 
 * Guarantees:
 * 1. STRICT SINGLE AUDIO PLAYBACK: At any given moment, across ALL browser tabs and windows,
 *    ONLY ONE text-to-speech / audio stream / chant can ever play.
 * 2. Cross-Tab Auto-Kill (BroadcastChannel + LocalStorage storage events):
 *    When audio starts in Tab B, Tab A (and all other tabs) immediately stop playing.
 * 3. Race Condition & Latency Shield (Generation Tokens):
 *    If an async TTS network call (e.g. Sarvam AI / ElevenLabs) takes 500-1000ms, but the user
 *    has already clicked another tab, step, or stopped playback, the late response will NEVER play.
 * 4. Comprehensive Cleanup:
 *    Stops HTML5 Audio, Web Speech Synthesis (SpeechSynthesisUtterance), Web Audio API (AudioContext & Oscillators),
 *    and notifies all UI components to reset their playing states.
 */

const SYNC_CHANNEL_NAME = "baggona_audio_sync_channel";
const STORAGE_KILL_KEY = "baggona_audio_global_kill_signal";

// Unique ID for this browser tab/window instance
const CURRENT_TAB_ID = typeof window !== "undefined"
  ? `tab_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`
  : "tab_server";

let currentPlaybackToken = 0;
const activeAudios = new Set<HTMLAudioElement>();
const activeAudioContexts = new Set<AudioContext>();
const stopListeners = new Set<() => void>();

let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    syncChannel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type === "STOP_ALL_AUDIO" && data.sourceTabId !== CURRENT_TAB_ID) {
        stopAllAudioLocal();
      }
    };
  } catch (err) {
    console.warn("[GlobalAudioManager] BroadcastChannel initialization warning:", err);
  }
}

// Fallback listener for browsers/cross-tab storage events
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KILL_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.sourceTabId !== CURRENT_TAB_ID) {
          stopAllAudioLocal();
        }
      } catch {}
    }
  });

  // Stop audio on tab unload / navigation
  window.addEventListener("beforeunload", () => {
    stopAllAudioLocal();
  });
  window.addEventListener("pagehide", () => {
    stopAllAudioLocal();
  });
}

/**
 * Registers an active HTMLAudioElement so it can be terminated globally.
 */
export function registerActiveAudio(audio: HTMLAudioElement): () => void {
  activeAudios.add(audio);
  const cleanup = () => {
    activeAudios.delete(audio);
  };
  audio.addEventListener("ended", cleanup);
  audio.addEventListener("pause", cleanup);
  audio.addEventListener("error", cleanup);
  return cleanup;
}

/**
 * Registers an active Web Audio AudioContext so it can be closed or suspended.
 */
export function registerAudioContext(ctx: AudioContext): () => void {
  activeAudioContexts.add(ctx);
  return () => {
    activeAudioContexts.delete(ctx);
  };
}

/**
 * Registers a callback to be notified whenever audio is stopped globally
 * (used by UI buttons to reset their isPlaying states).
 */
export function onGlobalAudioStop(callback: () => void): () => void {
  stopListeners.add(callback);
  return () => {
    stopListeners.delete(callback);
  };
}

/**
 * Stops all audio strictly within the CURRENT tab (without re-broadcasting).
 */
export function stopAllAudioLocal(): void {
  currentPlaybackToken++;

  // 1. Pause and reset all HTMLAudioElements
  for (const audio of activeAudios) {
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    } catch {}
  }
  activeAudios.clear();

  // 2. Cancel native browser SpeechSynthesis
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      (window as any).__baggonaActiveUtterance = null;
      window.speechSynthesis.cancel();
    } catch {}
  }

  // 3. Suspend/Close any active Web Audio AudioContexts
  for (const ctx of activeAudioContexts) {
    try {
      if (ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    } catch {}
  }
  activeAudioContexts.clear();

  // 4. Notify all UI listeners
  for (const listener of stopListeners) {
    try {
      listener();
    } catch (err) {
      console.warn("[GlobalAudioManager] Error in stopListener:", err);
    }
  }
}

/**
 * Stops all audio in the current tab AND broadcasts the kill signal to all other open tabs/windows.
 */
export function stopAllAudioGlobal(): void {
  stopAllAudioLocal();

  // Broadcast to other tabs via BroadcastChannel
  if (syncChannel) {
    try {
      syncChannel.postMessage({
        type: "STOP_ALL_AUDIO",
        sourceTabId: CURRENT_TAB_ID,
        timestamp: Date.now()
      });
    } catch (err) {
      console.warn("[GlobalAudioManager] BroadcastChannel postMessage error:", err);
    }
  }

  // Fallback broadcast via LocalStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        STORAGE_KILL_KEY,
        JSON.stringify({
          sourceTabId: CURRENT_TAB_ID,
          timestamp: Date.now()
        })
      );
    } catch {}
  }
}

/**
 * Starts a new audio session:
 * 1. Immediately stops all other audio across all tabs.
 * 2. Returns a new unique playback token.
 * 3. The caller MUST check `isPlaybackTokenActive(token)` after any async gap before playing sound.
 */
export function startNewAudioSession(): number {
  stopAllAudioGlobal();
  return currentPlaybackToken;
}

/**
 * Checks whether the playback token is still valid (i.e. no subsequent audio or stop event occurred).
 */
export function isPlaybackTokenActive(token: number): boolean {
  return token === currentPlaybackToken;
}

// Global safety hook on window
if (typeof window !== "undefined") {
  (window as any).__baggonaStopAllAudio = stopAllAudioGlobal;
}
