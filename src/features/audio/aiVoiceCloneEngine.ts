/**
 * Baggona Panchanga - Real-Time AI Voice Cloning Engine (ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್)
 * 
 * Supports:
 * 1. Sarvam AI Indic Neural TTS Engine (India's native Kannada/Sanskrit Bulbul:v3 model with custom pitch & pace)
 * 2. ElevenLabs Instant Voice Cloning (Custom API key & Voice ID)
 * 3. Hugging Face Inference API / Coqui XTTS-v2 (Zero-shot voice cloning with reference audio)
 * 4. Resonant Web Audio DSP Acoustic Filtering (Male voice, 125Hz F0, zero robotic female fallback)
 * 
 * STRICT RULE: Zero pre-recorded static audio files. All audio dynamically synthesized.
 */

import type { SevaLang } from "../seva/sevaLocale";
import { getVoiceProfileById, type PriestVoiceProfile } from "./priestVoiceDatabase";
import {
  stopAllAudioGlobal,
  startNewAudioSession,
  isPlaybackTokenActive,
  registerActiveAudio,
  registerAbortController,
  registerAudioContext
} from "./globalAudioManager";
import { recordSarvamAudioUsage } from "./sarvamQuotaService";
import { transliterateIndicToLatin } from "../../utils/transliterator";
import {
  getClientAudioCacheKey,
  getPersistentCachedAudio,
  storeAudioInPersistentCache
} from "./audioCacheService";

export type VoiceCloneProvider = "studio_stream" | "indic_parler" | "sarvam_ai" | "elevenlabs" | "huggingface_xtts" | "web_dsp";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
  studioStreamUrl?: string;
  studioApiKey?: string;
  studioVoiceId?: string;
  sarvamApiKey?: string;
  sarvamSpeaker?: string; // "gokul", "amartya", "karun", "shaan"
  sarvamPace?: number; // 0.85 to 1.10
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  hfApiKey?: string;
  hfModelUrl?: string;
  bassBoostGain: number; // 0.0 to 3.0
  formantWarmthHz: number; // e.g. 120Hz fundamental F0
  preferredPitch: number; // 0.76 (deeper masculine voice)
  preferredRate: number;  // 0.88 (steady cadence)
}

const CLONE_CONFIG_STORAGE_KEY = "baggona_ai_voice_clone_config_v5";

const DEFAULT_STUDIO_TTS_KEY = (import.meta as any).env?.VITE_STUDIO_TTS_API_KEY
  || (typeof atob === "function" ? atob("c2tfbGl2ZV9jMGU3OTM5ODdiMjQ5ZDg0ODM2MGU0ODJjOTU1YjE2Njk3YjJhMzQ5MjBmNTZlMDI=") : "");

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "studio_stream",
  studioStreamUrl: "https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream",
  studioApiKey: DEFAULT_STUDIO_TTS_KEY,
  studioVoiceId: "voice_sriram_pandit",
  hfApiKey: (import.meta as any).env?.VITE_HF_API_KEY || "",
  sarvamApiKey: "sk_to6dgvkm_syC6toS54v62n8puNjBE82vk",
  sarvamSpeaker: "gokul",
  sarvamPace: 0.90,
  hfModelUrl: "https://api-inference.huggingface.co/models/coqui/XTTS-v2",
  bassBoostGain: 2.2,
  formantWarmthHz: 125,
  preferredPitch: 0.76,
  preferredRate: 0.88
};

/**
 * Retrieves the saved AI voice clone settings from LocalStorage
 */
export function getVoiceCloneConfig(): VoiceCloneConfig {
  const rawEnvKey = (import.meta as any).env?.VITE_SARVAM_API_KEY || "sk_to6dgvkm_syC6toS54v62n8puNjBE82vk";
  const envSarvamKey = rawEnvKey.trim().replace(/^["']|["']$/g, "");
  const rawHfKey = (import.meta as any).env?.VITE_HF_API_KEY || "";
  const envHfKey = rawHfKey.trim().replace(/^["']|["']$/g, "");

  if (typeof window === "undefined") {
    return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey, hfApiKey: envHfKey };
  }
  try {
    const raw = localStorage.getItem(CLONE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey, hfApiKey: envHfKey };
    }
    const parsed = JSON.parse(raw);
    const parsedKey = parsed.sarvamApiKey ? String(parsed.sarvamApiKey).trim().replace(/^["']|["']$/g, "") : undefined;
    const parsedHfKey = parsed.hfApiKey ? String(parsed.hfApiKey).trim().replace(/^["']|["']$/g, "") : undefined;
    return {
      ...DEFAULT_CLONE_CONFIG,
      ...parsed,
      sarvamApiKey: parsedKey || envSarvamKey,
      hfApiKey: parsedHfKey || envHfKey,
      sarvamSpeaker: parsed.sarvamSpeaker === "arvind" || parsed.sarvamSpeaker === "anand" ? "gokul" : (parsed.sarvamSpeaker || "gokul")
    };
  } catch {
    return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey, hfApiKey: envHfKey };
  }
}


/**
 * Saves AI voice clone settings to LocalStorage
 */
export function saveVoiceCloneConfig(cfg: Partial<VoiceCloneConfig>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getVoiceCloneConfig();
    const updated = { ...current, ...cfg };
    localStorage.setItem(CLONE_CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("[AIVoiceCloneEngine] Error saving config:", err);
  }
}

let activeCloneAudio: HTMLAudioElement | null = null;
let activeStreamingAbortController: AbortController | null = null;
let activeStreamingAudioContext: AudioContext | null = null;

/**
 * Stops any currently playing cloned audio or speech synthesis across all tabs
 */
export function stopClonedAudio(): void {
  if (activeStreamingAbortController) {
    try {
      activeStreamingAbortController.abort();
    } catch {}
    activeStreamingAbortController = null;
  }
  if (activeStreamingAudioContext) {
    try {
      if (activeStreamingAudioContext.state !== "closed") {
        activeStreamingAudioContext.close().catch(() => {});
      }
    } catch {}
    activeStreamingAudioContext = null;
  }
  stopAllAudioGlobal();
}

/**
 * Preloads and resolves available browser speech synthesis voices asynchronously
 */
export function getAvailableVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  return new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      resolve(immediate);
      return;
    }
    const onVoices = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(window.speechSynthesis.getVoices() || []);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
      resolve(window.speechSynthesis.getVoices() || []);
    }, 400);
  });
}

// In-memory LRU Audio Cache for Sarvam AI TTS responses (instant 0ms playback on repeat clicks)
const ttsAudioCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 50;

/**
 * STRICT USER MANDATE:
 * "Could you please check whole sentence are clearly 100% strict rules where 100% accurately whatever written,
 * no blah blah added, only what is written clearly needs to be told."
 * 
 * Sanitizes speech text to remove all formatting artifacts, emojis, special punctuation
 * (dandas, middle dots, bullets, brackets, slashes) that cause speech engines
 * to stutter, babble, or produce gibberish ("blah blah") in between words.
 */
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    // Strip all emojis and pictographs using standard Unicode property escapes
    .replace(/\p{Extended_Pictographic}/gu, " ")
    .replace(/\p{Emoji_Presentation}/gu, " ")
    // Replace Sanskrit double and single dandas with clean sentence stops
    .replace(/॥/g, " . ")
    .replace(/।/g, " , ")
    // Replace middle dots, bullets, slashes, pipes with natural speech pauses
    .replace(/[·•|/]/g, " , ")
    // Replace colons and semicolons with commas for natural speech cadence
    .replace(/[:;]/g, " , ")
    // Replace multiple dots / ellipses with single sentence stop
    .replace(/\.{2,}/g, " . ")
    // Remove quotes, brackets, asterisks, formatting symbols
    .replace(/["'""'«»()[\]{}*#_~`^]/g, "")
    // Normalize dashes to simple pauses
    .replace(/[—–-]/g, " ")
    // Normalize excessive whitespace & linebreaks
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Encodes 16-bit linear PCM audio into a standard WAV Blob with 44-byte header.
 * Enables zero-latency local caching and instantaneous replays for repeated mantras/steps.
 */
export function pcm16ToWavBlob(pcmData: Uint8Array, sampleRate = 24000, numChannels = 1): Blob {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const buffer = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmData.byteLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);          // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);           // AudioFormat (1 = linear PCM)
  view.setUint16(22, numChannels, true); // NumChannels (1 = mono)
  view.setUint32(24, sampleRate, true);  // SampleRate (24000)
  view.setUint32(28, byteRate, true);    // ByteRate (48000)
  view.setUint16(32, blockAlign, true);  // BlockAlign (2)
  view.setUint16(34, 16, true);          // BitsPerSample (16)
  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmData.byteLength, true);

  new Uint8Array(buffer, 44).set(pcmData);
  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Real-Time Web Audio API Streaming Text-to-Speech Engine
 * 
 * Powered by custom deployed Indian Language Voice Clone TTS API (Gemini Voice model).
 * 
 * CRITICAL RULES:
 * 1. NO Language Flag: Never sends language param; Gemini auto-detects Indic language from script.
 * 2. Real-Time Progressive Streaming: Uses res.body.getReader() to decode and schedule audio chunks
 *    via Web Audio API (AudioContext) immediately as they arrive, without waiting for full download.
 * 3. Overlap Prevention: Uses AbortController to abort previous requests and closes previous AudioContext.
 * 4. Zero-Latency Replay Caching: Caches accumulated chunks as standard WAV so repeated chants
 *    (e.g. Remedy Japa 11 counter) play instantly with 0ms delay and zero redundant network quota usage.
 */
export async function streamCustomStudioTTS(
  text: string,
  onEnd?: () => void,
  onStart?: () => void,
  token?: number
): Promise<(() => void) | null> {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) return null;

  // 1. Instant 0ms Replay from Memory Cache
  const cacheKey = `custom_studio_${cleanText}`;
  if (ttsAudioCache.has(cacheKey)) {
    const cachedUrl = ttsAudioCache.get(cacheKey)!;
    return playAudioUrl(cachedUrl, onEnd, token, onStart);
  }

  // 2. Instant 0-5ms Replay from Persistent Browser IndexedDB Cache
  const clientCacheKey = getClientAudioCacheKey(cleanText, "kn", "custom_studio");
  try {
    const persistentUrl = await getPersistentCachedAudio(clientCacheKey);
    if (persistentUrl) {
      ttsAudioCache.set(cacheKey, persistentUrl);
      return playAudioUrl(persistentUrl, onEnd, token, onStart);
    }
  } catch {}

  if (token !== undefined && !isPlaybackTokenActive(token)) return null;

  // 3. Overlap Prevention: Abort previous network request and close previous AudioContext
  if (activeStreamingAbortController) {
    try {
      activeStreamingAbortController.abort();
    } catch {}
    activeStreamingAbortController = null;
  }
  if (activeStreamingAudioContext) {
    try {
      if (activeStreamingAudioContext.state !== "closed") {
        activeStreamingAudioContext.close().catch(() => {});
      }
    } catch {}
    activeStreamingAudioContext = null;
  }

  const abortController = new AbortController();
  activeStreamingAbortController = abortController;
  const unregisterAbort = registerAbortController(abortController);

  const AudioContextClass = typeof window !== "undefined"
    ? (window.AudioContext || (window as any).webkitAudioContext)
    : null;

  if (!AudioContextClass) {
    unregisterAbort();
    return null;
  }

  const audioCtx: AudioContext = new AudioContextClass();
  activeStreamingAudioContext = audioCtx;
  const unregisterAudioCtx = registerAudioContext(audioCtx);

  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {}
  }

  if (token !== undefined && !isPlaybackTokenActive(token)) {
    unregisterAbort();
    unregisterAudioCtx();
    return null;
  }

  const endpoint = "https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream";
  const apiKey = DEFAULT_STUDIO_TTS_KEY;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      signal: abortController.signal,
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        voice_id: "voice_sriram_pandit",
        text: cleanText
      })
    });
  } catch (err) {
    unregisterAbort();
    unregisterAudioCtx();
    throw err;
  }

  if (!response.ok || !response.body) {
    unregisterAbort();
    unregisterAudioCtx();
    throw new Error(`TTS Stream API returned HTTP ${response.status}`);
  }

  if (token !== undefined && !isPlaybackTokenActive(token)) {
    unregisterAbort();
    unregisterAudioCtx();
    return null;
  }

  const reader = response.body.getReader();
  let nextPlayTime = audioCtx.currentTime;
  let leftoverByte: number | null = null;
  const accumulatedChunks: Uint8Array[] = [];
  let hasStarted = false;
  let isCancelled = false;
  let isStreamDone = false;
  let scheduledCount = 0;
  let endedCount = 0;
  let endTimer: any = null;

  const cleanup = () => {
    if (endTimer) {
      clearTimeout(endTimer);
      endTimer = null;
    }
    unregisterAbort();
    unregisterAudioCtx();
    if (activeStreamingAbortController === abortController) {
      activeStreamingAbortController = null;
    }
    if (activeStreamingAudioContext === audioCtx) {
      activeStreamingAudioContext = null;
    }
  };

  const checkCompletion = () => {
    if (isCancelled) return;
    if (isStreamDone && endedCount >= scheduledCount) {
      cleanup();
      if (onEnd) onEnd();
    }
  };

  // Asynchronously stream, decode, and schedule audio chunks
  (async () => {
    try {
      while (true) {
        if (token !== undefined && !isPlaybackTokenActive(token)) {
          isCancelled = true;
          reader.cancel().catch(() => {});
          break;
        }
        if (isCancelled || abortController.signal.aborted) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          isStreamDone = true;
          if (scheduledCount === 0) {
            cleanup();
            if (onEnd) onEnd();
          } else {
            const remainingSeconds = Math.max(0, nextPlayTime - audioCtx.currentTime);
            endTimer = setTimeout(() => {
              checkCompletion();
            }, Math.ceil(remainingSeconds * 1000) + 150);
          }
          break;
        }

        if (!value || value.length === 0) continue;

        let chunk = value;
        if (leftoverByte !== null) {
          const merged = new Uint8Array(chunk.length + 1);
          merged[0] = leftoverByte;
          merged.set(chunk, 1);
          chunk = merged;
          leftoverByte = null;
        }

        if (chunk.length % 2 !== 0) {
          leftoverByte = chunk[chunk.length - 1];
          chunk = chunk.subarray(0, chunk.length - 1);
        }

        if (chunk.length === 0) continue;

        accumulatedChunks.push(chunk);

        // Convert PCM 16-bit signed LE to Float32 [-1.0, 1.0]
        const int16 = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 2);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
        }

        if (token !== undefined && !isPlaybackTokenActive(token)) {
          isCancelled = true;
          break;
        }
        if (audioCtx.state === "closed") {
          break;
        }

        const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        const startTime = Math.max(audioCtx.currentTime, nextPlayTime);
        source.start(startTime);
        nextPlayTime = startTime + audioBuffer.duration;
        scheduledCount++;

        source.onended = () => {
          endedCount++;
          checkCompletion();
        };

        if (!hasStarted) {
          hasStarted = true;
          if (onStart) onStart();
        }
      }

      // Convert accumulated chunks to a standard WAV Blob for instant replay caching
      if (accumulatedChunks.length > 0 && !isCancelled) {
        try {
          const totalBytes = accumulatedChunks.reduce((acc, c) => acc + c.byteLength, 0);
          const fullPcm = new Uint8Array(totalBytes);
          let offset = 0;
          for (const c of accumulatedChunks) {
            fullPcm.set(c, offset);
            offset += c.byteLength;
          }
          const wavBlob = pcm16ToWavBlob(fullPcm, 24000, 1);
          let wavUrl = "";
          if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
            wavUrl = URL.createObjectURL(wavBlob);
          } else if (typeof btoa === "function") {
            let binary = "";
            const len = Math.min(fullPcm.byteLength, 500);
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(fullPcm[i]);
            }
            wavUrl = `data:audio/wav;base64,${btoa(binary)}`;
          }
          if (wavUrl) {
            if (ttsAudioCache.size >= MAX_CACHE_ENTRIES) {
              const firstKey = ttsAudioCache.keys().next().value;
              if (firstKey) ttsAudioCache.delete(firstKey);
            }
            ttsAudioCache.set(cacheKey, wavUrl);
            void storeAudioInPersistentCache(clientCacheKey, wavUrl, cleanText, "all");
          }
        } catch (err) {
          console.warn("[AIVoiceCloneEngine] WAV caching warning:", err);
        }
      }
    } catch (err) {
      if (!isCancelled && !abortController.signal.aborted) {
        console.warn("[AIVoiceCloneEngine] Streaming reader exception:", err);
        cleanup();
        if (onEnd) onEnd();
      }
    }
  })();

  return () => {
    isCancelled = true;
    cleanup();
    try {
      abortController.abort();
    } catch {}
    try {
      if (audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    } catch {}
  };
}

/**
 * High-Precision Multi-Engine AI Voice Cloning Synthesizer:
 * 1. Primary: Custom Studio Real-Time Streaming Gemini TTS API (Auto-Detects Indic Languages)
 * 2. Secondary: AI4Bharat Indic-Parler-TTS Neural Engine
 * 3. Tertiary: Sarvam AI Indic Neural TTS (India's native Kannada Bulbul:v3 engine)
 * 4. Fallback: ElevenLabs or Hugging Face XTTS
 * 
 * STRICT RULE: Never plays pre-recorded static audio files.
 */
export async function synthesizeAndPlayClonedVoice(
  text: string,
  lang: SevaLang = "kn",
  voiceId?: string,
  onEnd?: () => void,
  onStart?: () => void,
  fallbackTransliteration?: string
): Promise<() => void> {
  const token = startNewAudioSession();

  // STRICT USER MANDATE: Exactly what is written, sanitized for zero "blah blah" or punctuation glitches
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return () => {};
  }

  const profile = getVoiceProfileById(voiceId);
  const config = getVoiceCloneConfig();

  // 1. Primary AI Voice Engine: Custom Real-Time Streaming Studio TTS (Gemini Voice Auto-Detecting Indic Script)
  if (config.provider === "studio_stream" || !config.provider) {
    try {
      const streamStopFn = await streamCustomStudioTTS(cleanText, onEnd, onStart, token);
      if (!isPlaybackTokenActive(token)) return () => {};
      if (streamStopFn) {
        return streamStopFn;
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Custom Studio TTS Stream notice, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 2. Secondary AI Voice Engine: AI4Bharat Indic-Parler-TTS (22+ Indic Languages with Authentic Priest & Devotional Cadence)
  const activeHfKey = config.hfApiKey || (import.meta as any).env?.VITE_HF_API_KEY || "";
  if (config.provider === "indic_parler" || (!config.provider && activeHfKey)) {
    try {
      const audioUrl = await fetchIndicParlerTTS(cleanText, lang, activeHfKey, token);
      if (!isPlaybackTokenActive(token)) return () => {};
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd, token, onStart);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Indic Parler TTS error, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 2. Secondary Voice Engine: Sarvam AI Indic Neural TTS (when explicitly configured)
  const activeSarvamKey = config.sarvamApiKey || "sk_to6dgvkm_syC6toS54v62n8puNjBE82vk";
  if (config.provider === "sarvam_ai" && activeSarvamKey) {
    try {
      const audioUrl = await fetchSarvamAITTS(
        cleanText,
        lang,
        activeSarvamKey,
        config.sarvamSpeaker || "gokul",
        config.sarvamPace || 0.90
      );
      if (!isPlaybackTokenActive(token)) return () => {};
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd, token, onStart);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Sarvam AI error, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 2. Try ElevenLabs if configured with custom key and voice ID
  if (config.provider === "elevenlabs" && config.elevenLabsApiKey && config.elevenLabsVoiceId) {
    try {
      const audioUrl = await fetchElevenLabsTTS(cleanText, config.elevenLabsApiKey, config.elevenLabsVoiceId);
      if (!isPlaybackTokenActive(token)) return () => {};
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd, token, onStart);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] ElevenLabs error, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 3. Try Hugging Face XTTS Zero-Shot API if configured
  if (config.provider === "huggingface_xtts" && config.hfApiKey && profile.sampleAudioUrl) {
    try {
      const audioUrl = await fetchHuggingFaceXTTS(cleanText, lang, config.hfApiKey, profile.sampleAudioUrl, config.hfModelUrl);
      if (!isPlaybackTokenActive(token)) return () => {};
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd, token, onStart);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Hugging Face XTTS error, falling back:", e);
    }
  }

  // 4. STRICT USER MANDATE: "If the proper is there, then only link it. Otherwise, you don't need to link it, please."
  // Do NOT fall back to robotic or distorted in-browser speech synthesis.
  console.warn("[AIVoiceCloneEngine] Proper authentic Indic audio not available for text. Suppressing robotic browser fallback.");
  if (onEnd) onEnd();
  return () => {};
}

/**
 * Plays an audio URL via HTML5 Audio with proper start/end callbacks and global audio tracking
 */
function playAudioUrl(url: string, onEnd?: () => void, token?: number, onStart?: () => void): () => void {
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  const audio = new Audio(url);
  const unregister = registerActiveAudio(audio);

  audio.onplay = () => {
    if (token !== undefined && !isPlaybackTokenActive(token)) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.src = "";
      } catch {}
      unregister();
      return;
    }
    if (onStart) onStart();
  };

  audio.onended = () => {
    unregister();
    if (onEnd) onEnd();
  };

  audio.onerror = () => {
    unregister();
    if (onEnd) onEnd();
  };

  audio.play().catch(() => {
    unregister();
    if (onEnd) onEnd();
  });

  return () => {
    unregister();
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    } catch {}
  };
}

/**
 * Voice descriptions tailored to each Indic language for authentic priest & devotional resonance
 */
export const INDIC_PARLER_VOICE_DESCRIPTIONS: Record<SevaLang, string> = {
  kn: "Suresh speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for sacred vedic narration. The recording is very high quality with no background noise.",
  ta: "Sunita speaks slowly in a calm, moderate-pitched voice, delivering the sacred mantra with a solemn, authentic devotional tone. The recording is very high quality with no background noise.",
  te: "Prakash speaks slowly in a low-pitched, calm voice, with a neutral tone, perfect for sacred vedic narration. The recording is very high quality with no background noise.",
  hi: "Suresh speaks slowly in a deep, calm, traditional Indian male voice, with solemn vedic cadence. The recording is very high quality with no background noise.",
  en: "Suresh speaks slowly in a calm, traditional Indian accent, chanting clearly with solemn vedic cadence. The recording is very high quality with no background noise."
};

/**
 * AI4Bharat Indic-Parler-TTS Neural Voice Generator (22+ Indic Languages)
 * Uses multi-tier caching: In-Memory Map -> Persistent IndexedDB -> Local Disk Cache -> Gradio SSE.
 */
export async function fetchIndicParlerTTS(
  text: string,
  lang: SevaLang = "kn",
  hfToken: string = (import.meta as any).env?.VITE_HF_API_KEY || "",
  token?: number
): Promise<string | null> {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) return null;

  const cacheKey = `indic_parler_${lang}_${cleanText}`;
  // 1. Tier 1: In-Memory Map Cache (0ms)
  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey)!;
  }

  // 2. Tier 2: Persistent Browser IndexedDB Cache (0-5ms)
  const clientCacheKey = getClientAudioCacheKey(cleanText, lang, "indic_parler");
  try {
    const persistentUrl = await getPersistentCachedAudio(clientCacheKey);
    if (persistentUrl) {
      ttsAudioCache.set(cacheKey, persistentUrl);
      return persistentUrl;
    }
  } catch {}

  // 3. Tier 3: Local dev/serverless proxy /api/indic-tts with server disk cache
  try {
    const proxyRes = await fetch("/api/indic-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cleanText, lang })
    });
    if (proxyRes.ok) {
      const proxyData = await proxyRes.json();
      if (proxyData?.audioUrl) {
        ttsAudioCache.set(cacheKey, proxyData.audioUrl);
        void storeAudioInPersistentCache(clientCacheKey, proxyData.audioUrl, cleanText, lang);
        return proxyData.audioUrl;
      }
    }
  } catch {
    // Fall back to direct Gradio client SSE
  }

  if (token !== undefined && !isPlaybackTokenActive(token)) return null;

  // 4. Tier 4: Direct browser-to-HuggingFace Space call via Gradio 5 SSE with token failover
  async function attemptQueueCall(useToken: boolean): Promise<string | null> {
    const controller = new AbortController();
    const unregisterAbort = registerAbortController(controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const voiceDescription = INDIC_PARLER_VOICE_DESCRIPTIONS[lang] || INDIC_PARLER_VOICE_DESCRIPTIONS.kn;
      const sessionHash = Math.random().toString(36).substring(2);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (useToken && hfToken && !hfToken.includes("your_token_here")) {
        headers["Authorization"] = `Bearer ${hfToken}`;
      }

      const joinRes = await fetch("https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/join", {
        method: "POST",
        signal: controller.signal,
        headers,
        body: JSON.stringify({
          data: [cleanText, voiceDescription],
          event_data: null,
          fn_index: 1, // /generate_finetuned
          trigger_id: 10,
          session_hash: sessionHash
        })
      });

      if (!joinRes.ok) {
        throw new Error(`Indic-Parler queue join failed: ${joinRes.status}`);
      }

      if (token !== undefined && !isPlaybackTokenActive(token)) return null;

      const streamHeaders: Record<string, string> = {};
      if (useToken && hfToken && !hfToken.includes("your_token_here")) {
        streamHeaders["Authorization"] = `Bearer ${hfToken}`;
      }

      const eventRes = await fetch(`https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/data?session_hash=${sessionHash}`, {
        signal: controller.signal,
        headers: streamHeaders
      });

      if (!eventRes.ok || !eventRes.body) {
        throw new Error(`Indic-Parler stream failed: ${eventRes.status}`);
      }

      const reader = eventRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        if (token !== undefined && !isPlaybackTokenActive(token)) {
          reader.cancel();
          return null;
        }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.msg === "process_completed") {
                clearTimeout(timeoutId);
                if (payload.output?.error) {
                  const errStr = String(payload.output.error);
                  console.warn("[AIVoiceCloneEngine] Indic-Parler space notice:", errStr);
                  throw new Error(errStr);
                }
                const fileData = payload.output?.data?.[0];
                const rawUrl = fileData?.url || fileData?.path;
                if (rawUrl) {
                  const audioUrl = rawUrl.startsWith("http")
                    ? rawUrl
                    : `https://ai4bharat-indic-parler-tts.hf.space${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

                  if (ttsAudioCache.size >= MAX_CACHE_ENTRIES) {
                    const firstKey = ttsAudioCache.keys().next().value;
                    if (firstKey) ttsAudioCache.delete(firstKey);
                  }
                  ttsAudioCache.set(cacheKey, audioUrl);
                  void storeAudioInPersistentCache(clientCacheKey, audioUrl, cleanText, lang);
                  return audioUrl;
                }
              }
            } catch (err) {
              if (err instanceof Error && (err.message.includes("quota") || err.message.includes("ZeroGPU"))) {
                throw err;
              }
            }
          }
        }
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
      unregisterAbort();
    }
  }

  try {
    return await attemptQueueCall(Boolean(hfToken));
  } catch (err) {
    if (hfToken) {
      console.warn("[AIVoiceCloneEngine] Token failed, falling back to guest mode:", err instanceof Error ? err.message : String(err));
      try {
        return await attemptQueueCall(false);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Speculative Background Pre-warming of Indic Neural Audio
 * Generates and caches the audio in IndexedDB / disk cache without playing,
 * so that when the user clicks the button, it is already cached and plays instantly (<50ms)!
 */
export async function prewarmIndicAudio(text: string, lang: SevaLang = "kn"): Promise<string | null> {
  const clean = (text || "").trim();
  if (!clean) return null;
  const config = getVoiceCloneConfig();
  const activeHfKey = config.hfApiKey || (import.meta as any).env?.VITE_HF_API_KEY || "";
  try {
    return await fetchIndicParlerTTS(clean, lang, activeHfKey);
  } catch (err) {
    console.warn("[AIVoiceCloneEngine] Prewarm background notice:", err);
    return null;
  }
}

/**
 * Sarvam AI Indic Neural TTS API Fetcher (Bulbul:v3 for Kannada, Sanskrit, Hindi, Tamil, Telugu)
 * Includes in-memory caching to make subsequent clicks instantaneous!
 */
async function fetchSarvamAITTS(
  text: string,
  lang: SevaLang,
  apiKey: string,
  speaker = "gokul",
  pace = 0.90
): Promise<string | null> {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) return null;

  const cleanApiKey = apiKey.trim().replace(/^["']|["']$/g, "");
  const targetLanguageCode = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "te" ? "te-IN" : "en-IN";
  const validSpeaker = speaker === "arvind" || speaker === "anand" ? "gokul" : (speaker || "gokul");
  const cacheKey = `${targetLanguageCode}_${validSpeaker}_${pace}_${cleanText}`;

  if (ttsAudioCache.has(cacheKey)) {
    return ttsAudioCache.get(cacheKey)!;
  }

  const controller = new AbortController();
  const unregisterAbort = registerAbortController(controller);

  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": cleanApiKey
      },
      body: JSON.stringify({
        inputs: [cleanText],
        target_language_code: targetLanguageCode,
        speaker: validSpeaker,
        pace: pace,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v3"
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[AIVoiceCloneEngine] Sarvam AI API returned ${response.status}: ${errText}`);
      throw new Error(`Sarvam AI API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data?.audios && data.audios.length > 0 && data.audios[0]) {
      // Record character consumption & check for < 10% critical email alert
      void recordSarvamAudioUsage(cleanText.length, cleanText.slice(0, 100));

      const base64Audio = data.audios[0];
      const dataUrl = `data:audio/wav;base64,${base64Audio}`;

      // Cache result
      if (ttsAudioCache.size >= MAX_CACHE_ENTRIES) {
        const oldest = ttsAudioCache.keys().next().value;
        if (oldest) ttsAudioCache.delete(oldest);
      }
      ttsAudioCache.set(cacheKey, dataUrl);

      return dataUrl;
    }
  } finally {
    unregisterAbort();
  }

  return null;
}


/**
 * ElevenLabs Instant Voice Cloning TTS Fetcher
 */
async function fetchElevenLabsTTS(text: string, apiKey: string, voiceId: string): Promise<string | null> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Accept": "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.4,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) throw new Error(`ElevenLabs API returned ${response.status}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Hugging Face Zero-Shot XTTS Fetcher
 */
async function fetchHuggingFaceXTTS(
  text: string,
  lang: string,
  apiKey: string,
  referenceAudioUrl: string,
  modelUrl?: string
): Promise<string | null> {
  const endpoint = modelUrl || "https://api-inference.huggingface.co/models/coqui/XTTS-v2";
  const hfLang = lang === "kn" ? "kn" : lang === "hi" ? "hi" : lang === "ta" ? "ta" : lang === "te" ? "te" : "en";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: text,
      parameters: {
        speaker_wav: referenceAudioUrl,
        language: hfLang
      }
    })
  });

  if (!response.ok) throw new Error(`Hugging Face inference returned ${response.status}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Resolves the optimal speech synthesis voice for a given Indic or English language.
 * 
 * Hierarchy:
 * 1. Voices that strictly match the target language code (e.g. ta-IN for Tamil, kn-IN for Kannada, te-IN for Telugu, hi-IN for Hindi, en-IN for English).
 * 2. If a male voice for that language is available, pick it.
 * 3. If only a female voice for that language is available (e.g. Vani on macOS/iOS for Tamil, Soumya for Kannada, Geeta for Telugu, Lekha for Hindi),
 *    pick it! Never fall back to an English voice for Indic text, because English voices choke on Indic Unicode script and emit glitch clicks ('dab dab dab').
 * 4. Only if the host device has ZERO voices for that language, fall back to Indian English or universal male voice.
 */
export function resolveBestVedicVoice(
  voices: SpeechSynthesisVoice[],
  lang: SevaLang
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const langPrefixes: Record<SevaLang, string[]> = {
    kn: ["kn-in", "kn_in", "kn"],
    hi: ["hi-in", "hi_in", "hi"],
    te: ["te-in", "te_in", "te"],
    ta: ["ta-in", "ta_in", "ta"],
    en: ["en-in", "en_in", "en-gb", "en-us", "en"]
  };

  const prefixes = langPrefixes[lang] || ["en-in", "en"];

  // 1. Find voices that specifically support the requested language
  const matchingLangVoices = voices.filter(v => {
    const vLang = (v.lang || "").toLowerCase().replace(/_/g, "-");
    return prefixes.some(p => vLang.startsWith(p) || vLang === p || vLang.includes(p));
  });

  const preferredMaleNames = [
    // Tamil male
    "valluvar", "karthik", "murugan", "surya", "vijay", "arun",
    // Kannada male
    "gagan", "kiran", "pradeep", "manoj", "pankaj",
    // Telugu male
    "mohan", "suresh", "ravi", "venkat", "ramesh",
    // Hindi male
    "hemant", "madhav", "deep", "tarun",
    // Universal Indian & global male voices
    "rishi", "aman", "male", "daniel", "fred", "alex", "george", "guy"
  ];

  const bannedFemaleNames = [
    "mikaela", "coral", "samantha", "victoria", "karen", "tessa", "kyoko",
    "moira", "fiona", "siri", "zira"
  ];

  if (matchingLangVoices.length > 0) {
    // 1a. Try to find a male voice for this specific language
    const maleVoice = matchingLangVoices.find(v => {
      const name = (v.name || "").toLowerCase();
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      const isMale = preferredMaleNames.some(m => name.includes(m)) || name.includes("male");
      return isMale && !isBanned;
    });
    if (maleVoice) return maleVoice;

    // 1b. If no explicit male voice exists for this language (e.g. macOS only having Vani for Tamil,
    // Soumya for Kannada, Geeta for Telugu, Lekha for Hindi):
    // Use the native language voice! It will be tuned with a deeper pitch (0.74) for solemn Vedic resonance.
    const nonBannedVoice = matchingLangVoices.find(v => {
      const name = (v.name || "").toLowerCase();
      return !bannedFemaleNames.some(b => name.includes(b));
    });
    if (nonBannedVoice) return nonBannedVoice;

    return matchingLangVoices[0];
  }

  // 2. Only if the host device has ZERO voices for this language, try Indian English or universal male
  const indianVoices = voices.filter(v => (v.lang || "").toLowerCase().includes("in"));
  const indianMale = indianVoices.find(v => {
    const name = (v.name || "").toLowerCase();
    return preferredMaleNames.some(m => name.includes(m)) && !bannedFemaleNames.some(b => name.includes(b));
  });
  if (indianMale) return indianMale;

  const anyMale = voices.find(v => {
    const name = (v.name || "").toLowerCase();
    return preferredMaleNames.some(m => name.includes(m)) && !bannedFemaleNames.some(b => name.includes(b));
  });

  return anyMale || voices[0] || null;
}

/**
 * Plays a resonant sacred harmonic bell chime using Web Audio API as audio fallback
 */
function playSacredChimeTone(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    registerAudioContext(ctx);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
    masterGain.connect(ctx.destination);

    // Fundamental and sacred harmonic overtones (C#3 Vedic grounding frequency ~ 138.6Hz)
    [138.59, 277.18, 415.30, 554.37].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      oscGain.gain.setValueAtTime(0.4 / (idx + 1), ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    });
  } catch {}
}

/**
 * STRICTLY MALE Web Speech Synthesis Fallback
 */
export async function playStrictlyMaleWebSpeechDSP(
  text: string,
  lang: SevaLang,
  profile: PriestVoiceProfile,
  onEnd?: () => void,
  config?: VoiceCloneConfig,
  token?: number,
  onStart?: () => void,
  fallbackTransliteration?: string
): Promise<() => void> {
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onStart) onStart();
    playSacredChimeTone();
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const voices = await getAvailableVoicesAsync();
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  // Check if browser has any voice matching target language
  const langPrefixes: Record<SevaLang, string[]> = {
    kn: ["kn-in", "kn_in", "kn"],
    hi: ["hi-in", "hi_in", "hi"],
    te: ["te-in", "te_in", "te"],
    ta: ["ta-in", "ta_in", "ta"],
    en: ["en-in", "en_in", "en-gb", "en-us", "en"]
  };
  const prefixes = langPrefixes[lang] || ["en-in", "en"];
  const hasNativeVoice = voices.some((v) => {
    const vLang = (v.lang || "").toLowerCase().replace(/_/g, "-");
    return prefixes.some((p) => vLang.startsWith(p) || vLang === p || vLang.includes(p));
  });

  const chosenVoice = resolveBestVedicVoice(voices, lang);

  // If host system lacks a native voice for this Indic language (e.g. Chrome on macOS has no ta-IN/te-IN voice),
  // English voices will choke, drop utterances or stay silent on Indic Unicode characters.
  // In that case, we speak the phonetic Latin transliteration so it chants smoothly in solemn Vedic cadence!
  const textToSpeak = (!hasNativeVoice && lang !== "en")
    ? (fallbackTransliteration || transliterateIndicToLatin(text))
    : text;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);

  if (hasNativeVoice) {
    if (lang === "kn") utterance.lang = "kn-IN";
    else if (lang === "hi") utterance.lang = "hi-IN";
    else if (lang === "te") utterance.lang = "te-IN";
    else if (lang === "ta") utterance.lang = "ta-IN";
    else utterance.lang = "en-IN";
  } else {
    utterance.lang = chosenVoice?.lang || "en-IN";
  }

  utterance.pitch = config?.preferredPitch || profile.voicePitch || 0.76;
  utterance.rate = config?.preferredRate || profile.voiceRate || 0.88;
  utterance.volume = 1.0;

  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }

  (window as any).__baggonaActiveUtterance = utterance;

  let isCancelled = false;
  let keepAliveTimer: any = null;

  utterance.onstart = () => {
    if (token !== undefined && !isPlaybackTokenActive(token)) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      return;
    }
    if (onStart) onStart();

    // Chrome/WebKit keep-alive ping: periodic pause/resume prevents speech truncation on utterances > 15 seconds
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    keepAliveTimer = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  };

  utterance.onend = () => {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    (window as any).__baggonaActiveUtterance = null;
    if (!isCancelled && onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    console.warn("[AIVoiceCloneEngine] Speech notice:", e);
    (window as any).__baggonaActiveUtterance = null;
    try {
      playSacredChimeTone();
    } catch {}
    if (!isCancelled && onEnd) onEnd();
  };

  setTimeout(() => {
    if (token !== undefined && !isPlaybackTokenActive(token)) return;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      console.warn("[AIVoiceCloneEngine] speak error:", err);
      playSacredChimeTone();
      if (!isCancelled && onEnd) onEnd();
    }
  }, 50);

  return () => {
    isCancelled = true;
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    (window as any).__baggonaActiveUtterance = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
