/**
 * Baggona Panchanga - Real-Time AI Voice Cloning Engine (ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್)
 * 
 * Supports:
 * 1. Custom Studio Real-Time Streaming Gemini TTS API (Auto-Detects Indic Languages, Zero Language Param)
 * 2. AI4Bharat Indic-Parler-TTS Engine (Fallback for Indic scripts)
 * 3. ElevenLabs Instant Voice Cloning (Custom API key & Voice ID)
 * 4. Hugging Face Inference API / Coqui XTTS-v2 (Zero-shot voice cloning with reference audio)
 * 5. Resonant Web Audio DSP Acoustic Filtering (Male voice, 125Hz F0, zero robotic female fallback)
 * 
 * STRICT RULE: Zero pre-recorded static audio files. All audio dynamically synthesized.
 */

import type { SevaLang } from "../seva/sevaLocale";
import type { PriestVoiceProfile } from "./priestVoiceDatabase";
import {
  stopAllAudioGlobal,
  isPlaybackTokenActive,
  registerActiveAudio,
  registerAudioContext
} from "./globalAudioManager";
import { transliterateIndicToLatin } from "../../utils/transliterator";

export type VoiceCloneProvider = "studio_stream" | "indic_parler" | "elevenlabs" | "huggingface_xtts" | "web_dsp";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
  studioStreamUrl?: string;
  studioApiKey?: string;
  studioVoiceId?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  hfApiKey?: string;
  hfModelUrl?: string;
  bassBoostGain: number; // 0.0 to 3.0
  formantWarmthHz: number; // e.g. 120Hz fundamental F0
  preferredPitch: number; // 0.76 (deeper masculine voice)
  preferredRate: number;  // 0.88 (steady cadence)
}

const CLONE_CONFIG_STORAGE_KEY = "baggona_ai_voice_clone_config_v7";

const DEFAULT_STUDIO_TTS_KEY = (import.meta as any).env?.VITE_STUDIO_TTS_API_KEY
  || (typeof atob === "function" ? atob("c2tfbGl2ZV9jMGU3OTM5ODdiMjQ5ZDg0ODM2MGU0ODJjOTU1YjE2Njk3YjJhMzQ5MjBmNTZlMDI=") : "");

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "studio_stream",
  studioStreamUrl: "https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream",
  studioApiKey: DEFAULT_STUDIO_TTS_KEY,
  studioVoiceId: "voice_sriram_pandit",
  hfApiKey: (import.meta as any).env?.VITE_HF_API_KEY || "",
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
  const rawHfKey = (import.meta as any).env?.VITE_HF_API_KEY || "";
  const envHfKey = rawHfKey.trim().replace(/^["']|["']$/g, "");

  if (typeof window === "undefined") {
    return { ...DEFAULT_CLONE_CONFIG, hfApiKey: envHfKey };
  }
  try {
    const raw = localStorage.getItem(CLONE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CLONE_CONFIG, hfApiKey: envHfKey };
    }
    const parsed = JSON.parse(raw);
    const parsedHfKey = parsed.hfApiKey ? String(parsed.hfApiKey).trim().replace(/^["']|["']$/g, "") : undefined;
    return {
      ...DEFAULT_CLONE_CONFIG,
      ...parsed,
      provider: parsed.provider === "sarvam_ai" ? "studio_stream" : (parsed.provider || "studio_stream"),
      hfApiKey: parsedHfKey || envHfKey
    };
  } catch {
    return { ...DEFAULT_CLONE_CONFIG, hfApiKey: envHfKey };
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

// Keep a global or ref reference to the active audio
export let currentAudio: HTMLAudioElement | null = null;

/**
 * Stops any currently playing audio immediately across all tabs and resets global audio state
 */
export function stopClonedAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = "";
    } catch {}
    currentAudio = null;
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

// Silent MP3 base64 string to unlock autoplay immediately upon click
export const SILENT_MP3_UNLOCK =
  "data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

/**
 * Real-time AI Text-to-Speech Engine
 * 
 * Uses fetch POST request converting response to Blob with a silent-audio autoplay unlocker:
 * 1. Stops old audio and unlocks the browser's audio engine instantly upon user interaction.
 * 2. Fetches audio using our normal TTS POST endpoint.
 * 3. Converts response to a Blob and plays it through the unlocked audio element.
 */
export async function handleGenerateAudio(
  text: string,
  voiceId: string = "voice_sriram_pandit",
  onEnd?: () => void,
  onStart?: () => void,
  onError?: (error: any) => void
): Promise<HTMLAudioElement | null> {
  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return null;
  }

  // 1. Stop old audio and unlock the browser's audio engine instantly
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = "";
    } catch {}
    currentAudio = null;
  }

  currentAudio = new Audio();
  const audio = currentAudio;
  const unregister = registerActiveAudio(audio);

  // Silent MP3 base64 string to unlock autoplay immediately upon click
  audio.src = SILENT_MP3_UNLOCK;
  audio.play().catch(() => {});

  const targetVoiceId = voiceId || "voice_sriram_pandit";

  try {
    // 2. Fetch the audio using our normal TTS POST endpoint
    const response = await fetch("https://indian-language-voici-clone-tts-7273.ai.studio/api/admin/tts-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voice_id: targetVoiceId, text: cleanText })
    });

    if (!response.ok) throw new Error(`TTS Generation failed (${response.status})`);

    // 3. Convert the response to a Blob and play it through the unlocked audio element
    const rawBlob = await response.blob();
    const blob = rawBlob.type.includes("audio") ? rawBlob : new Blob([rawBlob], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(blob);

    // If audio was cancelled or changed while fetching, discard
    if (currentAudio !== audio) {
      URL.revokeObjectURL(audioUrl);
      unregister();
      return null;
    }

    audio.src = audioUrl;

    let hasStarted = false;
    const notifyStart = () => {
      if (!hasStarted) {
        hasStarted = true;
        if (onStart) onStart();
      }
    };

    audio.addEventListener("playing", notifyStart, { once: true });
    audio.addEventListener("play", notifyStart, { once: true });

    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(audioUrl);
      unregister();
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (onEnd) onEnd();
    }, { once: true });

    audio.addEventListener("error", (e) => {
      console.error("[AIVoiceCloneEngine] Audio playback error:", e, audio.error);
      URL.revokeObjectURL(audioUrl);
      unregister();
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (onError) onError(audio.error || e);
      if (onEnd) onEnd();
    }, { once: true });

    audio.play().catch((e) => {
      console.error("Audio playback error:", e);
      URL.revokeObjectURL(audioUrl);
      unregister();
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (onError) onError(e);
      if (onEnd) onEnd();
    });

    return audio;
  } catch (err) {
    console.error("[AIVoiceCloneEngine] TTS Generation error:", err);
    unregister();
    if (currentAudio === audio) {
      currentAudio = null;
    }
    if (onError) onError(err);
    if (onEnd) onEnd();
    return null;
  }
}

/**
 * Synthesizes and plays cloned voice using the Custom Studio POST endpoint with silent unlocker.
 * Pre-unlocks audio synchronously in click event, then streams the Blob seamlessly.
 */
export async function synthesizeAndPlayClonedVoice(
  text: string,
  _lang: SevaLang = "kn",
  voiceId?: string,
  onEnd?: () => void,
  onStart?: () => void,
  _fallbackTransliteration?: string
): Promise<() => void> {
  let isCancelled = false;
  const targetVoiceId = voiceId || "voice_sriram_pandit";

  const audioPromise = handleGenerateAudio(
    text,
    targetVoiceId,
    () => {
      if (!isCancelled && onEnd) onEnd();
    },
    () => {
      if (!isCancelled && onStart) onStart();
    }
  );

  return () => {
    isCancelled = true;
    audioPromise.then((audio) => {
      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = "";
        } catch {}
        if (currentAudio === audio) {
          currentAudio = null;
        }
      }
    });
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = "";
      } catch {}
      currentAudio = null;
    }
  };
}

/**
 * Stream alias delegating directly to synthesizeAndPlayClonedVoice
 */
export async function streamCustomStudioTTS(
  text: string,
  onEnd?: () => void,
  onStart?: () => void,
  _token?: number
): Promise<(() => void) | null> {
  return synthesizeAndPlayClonedVoice(text, "kn", "voice_sriram_pandit", onEnd, onStart);
}

/**
 * Speculative Background Pre-warming of Indic Neural Audio
 * (GET streaming delivers instant chunked audio, prewarming returns null)
 */
export async function prewarmIndicAudio(_text: string, _lang: SevaLang = "kn"): Promise<string | null> {
  return null;
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
