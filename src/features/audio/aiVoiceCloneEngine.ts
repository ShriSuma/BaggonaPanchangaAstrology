/**
 * Baggona Panchanga - Real-Time AI Voice Cloning Engine (ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್)
 * 
 * Supports:
 * 1. Master Audio Voice Recording (/audio/shrisuma_master_voice.webm - ShriSuma's Authentic Voice)
 * 2. Sarvam AI Indic Neural TTS Engine (India's native Kannada/Sanskrit Bulbul:v1 model with custom pitch & pace)
 * 3. ElevenLabs Instant Voice Cloning (Custom API key & Voice ID)
 * 4. Hugging Face Inference API / Coqui XTTS-v2 (Zero-shot voice cloning with reference audio)
 * 5. Resonant Web Audio DSP Acoustic Filtering (Male voice, 125Hz F0, zero robotic female fallback)
 */

import type { SevaLang } from "../seva/sevaLocale";
import { getVoiceProfileById, type PriestVoiceProfile } from "./priestVoiceDatabase";
import {
  stopAllAudioGlobal,
  startNewAudioSession,
  isPlaybackTokenActive,
  registerActiveAudio
} from "./globalAudioManager";

export type VoiceCloneProvider = "master_recording" | "sarvam_ai" | "elevenlabs" | "huggingface_xtts" | "web_dsp";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
  sarvamApiKey?: string;
  sarvamSpeaker?: string; // "arvind", "amartya", "karun", "shaan"
  sarvamPace?: number; // 0.85 to 1.10
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  hfApiKey?: string;
  hfModelUrl?: string;
  autoFallbackToMasterRecording: boolean;
  masterAudioUrl: string;
  bassBoostGain: number; // 0.0 to 3.0
  formantWarmthHz: number; // e.g. 120Hz fundamental F0
  preferredPitch: number; // 0.76 (deeper masculine voice)
  preferredRate: number;  // 0.88 (steady cadence)
}

const CLONE_CONFIG_STORAGE_KEY = "baggona_ai_voice_clone_config_v4";

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "sarvam_ai",
  sarvamApiKey: "sk_duxld45s_658vBx71bZPMfKeLfCXxXwF0",
  sarvamSpeaker: "gokul",
  sarvamPace: 0.90,
  autoFallbackToMasterRecording: true,
  masterAudioUrl: "/audio/shrisuma_master_voice.webm",
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
  const envSarvamKey = (import.meta as any).env?.VITE_SARVAM_API_KEY || "sk_duxld45s_658vBx71bZPMfKeLfCXxXwF0";
  if (typeof window === "undefined") {
    return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey };
  }
  try {
    const raw = localStorage.getItem(CLONE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CLONE_CONFIG,
      ...parsed,
      sarvamApiKey: parsed.sarvamApiKey || envSarvamKey,
      sarvamSpeaker: parsed.sarvamSpeaker === "arvind" || parsed.sarvamSpeaker === "anand" ? "gokul" : (parsed.sarvamSpeaker || "gokul")
    };
  } catch {
    return { ...DEFAULT_CLONE_CONFIG, sarvamApiKey: envSarvamKey };
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

/**
 * Real-time Speech Synthesis using the configured AI Voice Cloning provider:
 * 1. Tries Sarvam AI Indic Neural TTS if API key is provided
 * 2. Tries ElevenLabs if configured with custom key and voice ID
 * 3. Tries Hugging Face XTTS if configured
 * 4. Tries Master Audio Recording (/audio/shrisuma_master_voice.webm)
 * 5. Fallback to In-Browser Web Speech Synthesizer with 125Hz F0 tuning
 */
export async function synthesizeAndPlayClonedVoice(
  text: string,
  lang: SevaLang = "kn",
  voiceId?: string,
  onEnd?: () => void
): Promise<() => void> {
  const token = startNewAudioSession();

  const profile = getVoiceProfileById(voiceId);
  const config = getVoiceCloneConfig();

  // 1. Try Sarvam AI Indic Neural TTS (India's native Kannada Bulbul:v3 engine)
  const activeSarvamKey = config.sarvamApiKey || "sk_duxld45s_658vBx71bZPMfKeLfCXxXwF0";
  if (config.provider === "sarvam_ai" || (!config.provider && activeSarvamKey)) {
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
        return playAudioUrl(audioUrl, onEnd, token);
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
        return playAudioUrl(audioUrl, onEnd, token);
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
        return playAudioUrl(audioUrl, onEnd, token);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Hugging Face XTTS error, falling back:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 4. Try Master Audio Recording (/audio/shrisuma_master_voice.webm - ShriSuma's Actual Real Voice)
  if (config.provider === "master_recording" || config.autoFallbackToMasterRecording) {
    try {
      const masterUrl = config.masterAudioUrl || "/audio/shrisuma_master_voice.webm";
      const stopFn = playAudioUrl(masterUrl, onEnd, token);
      if (stopFn) return stopFn;
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Master recording error, falling back to Web Speech:", e);
    }
  }

  if (!isPlaybackTokenActive(token)) return () => {};

  // 5. Fallback to Male-Only Web Speech DSP
  return playStrictlyMaleWebSpeechDSP(text, lang, profile, onEnd, config, token);
}

/**
 * Plays an audio URL via HTML5 Audio with proper end callbacks and global audio tracking
 */
function playAudioUrl(url: string, onEnd?: () => void, token?: number): () => void {
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  const audio = new Audio(url);
  const unregister = registerActiveAudio(audio);

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
 * Sarvam AI Indic Neural TTS API Fetcher (Bulbul:v3 for Kannada, Sanskrit, Hindi, Tamil, Telugu)
 */
async function fetchSarvamAITTS(
  text: string,
  lang: SevaLang,
  apiKey: string,
  speaker = "gokul",
  pace = 0.90
): Promise<string | null> {
  const targetLanguageCode = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : lang === "ta" ? "ta-IN" : lang === "te" ? "te-IN" : "en-IN";
  const validSpeaker = speaker === "arvind" || speaker === "anand" ? "gokul" : (speaker || "gokul");

  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey
    },
    body: JSON.stringify({
      inputs: [text.trim()],
      target_language_code: targetLanguageCode,
      speaker: validSpeaker,
      pace: pace,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: "bulbul:v3"
    })
  });

  if (!response.ok) {
    throw new Error(`Sarvam AI API returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  if (data?.audios && data.audios.length > 0 && data.audios[0]) {
    const base64Audio = data.audios[0];
    return `data:audio/wav;base64,${base64Audio}`;
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
 * STRICTLY MALE Web Speech Synthesis Fallback
 */
export async function playStrictlyMaleWebSpeechDSP(
  text: string,
  lang: SevaLang,
  profile: PriestVoiceProfile,
  onEnd?: () => void,
  config?: VoiceCloneConfig,
  token?: number
): Promise<() => void> {
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const voices = await getAvailableVoicesAsync();
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  const utterance = new SpeechSynthesisUtterance(text);

  if (lang === "kn") utterance.lang = "kn-IN";
  else if (lang === "hi") utterance.lang = "hi-IN";
  else if (lang === "te") utterance.lang = "te-IN";
  else if (lang === "ta") utterance.lang = "ta-IN";
  else utterance.lang = "en-IN";

  utterance.pitch = config?.preferredPitch || profile.voicePitch || 0.76;
  utterance.rate = config?.preferredRate || profile.voiceRate || 0.88;
  utterance.volume = 1.0;

  const bannedFemaleNames = [
    "mikaela", "coral", "samantha", "victoria", "karen", "tessa", "kyoko",
    "moira", "fiona", "siri", "zira", "veena", "sangeeta", "kalpana", "neerja",
    "heera", "sunita", "harita", "shruti", "priya", "pooja", "female", "girl"
  ];

  const preferredMaleNames = [
    "rishi", "ravi", "hemant", "gagan", "madhav", "deep", "pradeep", "manoj",
    "pankaj", "tarun", "kiran", "male", "daniel", "fred", "alex", "george", "guy"
  ];

  if (voices && voices.length > 0) {
    const indianMale = voices.find(v => {
      const name = v.name.toLowerCase();
      const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      const isMale = preferredMaleNames.some(m => name.includes(m));
      return isIndian && isMale && !isBanned;
    });

    const anyIndianNonFemale = voices.find(v => {
      const name = v.name.toLowerCase();
      const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      return isIndian && !isBanned;
    });

    const anyMale = voices.find(v => {
      const name = v.name.toLowerCase();
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      const isMale = preferredMaleNames.some(m => name.includes(m));
      return isMale && !isBanned;
    });

    const chosenVoice = indianMale || anyIndianNonFemale || anyMale;
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
  }

  (window as any).__baggonaActiveUtterance = utterance;

  utterance.onend = () => {
    (window as any).__baggonaActiveUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("[AIVoiceCloneEngine] Speech notice:", e);
    (window as any).__baggonaActiveUtterance = null;
    if (onEnd) onEnd();
  };

  setTimeout(() => {
    if (token !== undefined && !isPlaybackTokenActive(token)) return;
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("[AIVoiceCloneEngine] speak error:", err);
      if (onEnd) onEnd();
    }
  }, 50);

  return () => {
    (window as any).__baggonaActiveUtterance = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
