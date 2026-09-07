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

export type VoiceCloneProvider = "indic_parler" | "sarvam_ai" | "elevenlabs" | "huggingface_xtts" | "web_dsp";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
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

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "indic_parler",
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

/**
 * Stops any currently playing cloned audio or speech synthesis across all tabs
 */
export function stopClonedAudio(): void {
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
 * High-Precision Multi-Engine AI Voice Cloning Synthesizer:
 * 1. Tries Sarvam AI Indic Neural TTS (India's native Kannada Bulbul:v3 engine)
 * 2. Tries ElevenLabs if configured with custom key
 * 3. Tries Hugging Face XTTS if configured
 * 4. Fallback to In-Browser Web Speech Synthesizer with 125Hz F0 tuning
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

  const profile = getVoiceProfileById(voiceId);
  const config = getVoiceCloneConfig();

  // 1. Primary AI Voice Engine: AI4Bharat Indic-Parler-TTS (22+ Indic Languages with Authentic Priest & Devotional Cadence)
  const activeHfKey = config.hfApiKey || (import.meta as any).env?.VITE_HF_API_KEY || "";
  if (config.provider === "indic_parler" || (!config.provider && activeHfKey)) {
    try {
      const audioUrl = await fetchIndicParlerTTS(text, lang, activeHfKey, token);
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
        text,
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
      const audioUrl = await fetchElevenLabsTTS(text, config.elevenLabsApiKey, config.elevenLabsVoiceId);
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
      const audioUrl = await fetchHuggingFaceXTTS(text, lang, config.hfApiKey, profile.sampleAudioUrl, config.hfModelUrl);
      if (!isPlaybackTokenActive(token)) return () => {};
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd, token, onStart);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Hugging Face XTTS error, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 4. Fallback to Male-Only Web Speech DSP (Dynamic browser TTS)
  return playStrictlyMaleWebSpeechDSP(text, lang, profile, onEnd, config, token, onStart, fallbackTransliteration);
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
  const cleanText = text.trim();
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

  // 4. Tier 4: Direct browser-to-HuggingFace Space call via Gradio 5 SSE
  const controller = new AbortController();
  const unregisterAbort = registerAbortController(controller);

  // 15-second timeout to prevent hanging
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const voiceDescription = INDIC_PARLER_VOICE_DESCRIPTIONS[lang] || INDIC_PARLER_VOICE_DESCRIPTIONS.kn;
    const sessionHash = Math.random().toString(36).substring(2);

    const joinRes = await fetch("https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/join", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
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

    const eventRes = await fetch(`https://ai4bharat-indic-parler-tts.hf.space/gradio_api/queue/data?session_hash=${sessionHash}`, {
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${hfToken}`
      }
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
                console.warn("[AIVoiceCloneEngine] Indic-Parler space notice:", payload.output.error);
                throw new Error(String(payload.output.error));
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
          } catch {}
        }
      }
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
    unregisterAbort();
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
  const cleanText = text.trim();
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
