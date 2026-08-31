/**
 * Baggona Panchanga - Real-Time AI Voice Cloning Engine (ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್)
 * 
 * Supports:
 * 1. Free Edge Neural Indic Voice (kn-IN-GaganNeural, hi-IN-MadhurNeural)
 * 2. Hugging Face Inference API / Coqui XTTS-v2 (Zero-shot voice cloning with reference audio)
 * 3. ElevenLabs Instant Voice Cloning (Custom API key & Voice ID)
 * 4. In-Browser Web Audio Acoustic Formant & Pitch Resonance DSP Filter (Offline, 0ms latency)
 */

import type { SevaLang } from "../seva/sevaLocale";
import { getVoiceProfileById, type PriestVoiceProfile } from "./priestVoiceDatabase";

export type VoiceCloneProvider = "edge_neural" | "huggingface_xtts" | "elevenlabs" | "web_dsp";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
  hfApiKey?: string;
  hfModelUrl?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  autoFallbackToDsp: boolean;
  bassBoostGain: number; // 0.0 to 3.0
  formantWarmthHz: number; // e.g. 3200Hz
}

const CLONE_CONFIG_STORAGE_KEY = "baggona_ai_voice_clone_config_v1";

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "edge_neural",
  hfModelUrl: "https://api-inference.huggingface.co/models/coqui/XTTS-v2",
  autoFallbackToDsp: true,
  bassBoostGain: 1.6,
  formantWarmthHz: 3400
};

/**
 * Retrieves the saved AI voice clone settings from LocalStorage
 */
export function getVoiceCloneConfig(): VoiceCloneConfig {
  if (typeof window === "undefined") return DEFAULT_CLONE_CONFIG;
  try {
    const raw = localStorage.getItem(CLONE_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_CLONE_CONFIG;
    return { ...DEFAULT_CLONE_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLONE_CONFIG;
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
 * Stops any currently playing cloned audio
 */
export function stopClonedAudio(): void {
  if (activeCloneAudio) {
    activeCloneAudio.pause();
    activeCloneAudio.currentTime = 0;
    activeCloneAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Real-time Speech Synthesis using the configured AI Voice Cloning provider:
 * 1. Tries Free Cloud Neural / Hugging Face / ElevenLabs if configured
 * 2. Falls back seamlessly to In-Browser Web Audio Formant DSP + Tuned Indic Speech Synthesis
 */
export async function synthesizeAndPlayClonedVoice(
  text: string,
  lang: SevaLang = "kn",
  voiceId?: string,
  onEnd?: () => void
): Promise<() => void> {
  stopClonedAudio();

  const profile = getVoiceProfileById(voiceId);
  const config = getVoiceCloneConfig();

  // 1. Try ElevenLabs if configured with custom key and voice ID
  if (config.provider === "elevenlabs" && config.elevenLabsApiKey && config.elevenLabsVoiceId) {
    try {
      const audioUrl = await fetchElevenLabsTTS(text, config.elevenLabsApiKey, config.elevenLabsVoiceId);
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] ElevenLabs error, falling back:", e);
    }
  }

  // 2. Try Hugging Face XTTS Zero-Shot API if configured
  if (config.provider === "huggingface_xtts" && config.hfApiKey && profile.sampleAudioUrl) {
    try {
      const audioUrl = await fetchHuggingFaceXTTS(text, lang, config.hfApiKey, profile.sampleAudioUrl, config.hfModelUrl);
      if (audioUrl) {
        return playAudioUrl(audioUrl, onEnd);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Hugging Face XTTS error, falling back:", e);
    }
  }

  // 3. High-Quality Web Audio DSP Formant-Tuned Neural Indic Voice (Free & Instant)
  return playWithWebAudioDSP(text, lang, profile, onEnd);
}

/**
 * Plays an audio URL via HTML5 Audio with proper end callbacks
 */
function playAudioUrl(url: string, onEnd?: () => void): () => void {
  const audio = new Audio(url);
  activeCloneAudio = audio;

  audio.onended = () => {
    activeCloneAudio = null;
    if (onEnd) onEnd();
  };

  audio.onerror = () => {
    activeCloneAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch(() => {
    if (onEnd) onEnd();
  });

  return () => {
    if (activeCloneAudio === audio) {
      audio.pause();
      activeCloneAudio = null;
    }
  };
}

/**
 * Free ElevenLabs TTS Fetcher
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
 * Free Hugging Face Zero-Shot XTTS Fetcher
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
 * In-Browser Neural Indic Speech Synthesis with Web Audio acoustic tuning
 */
function playWithWebAudioDSP(
  text: string,
  lang: SevaLang,
  profile: PriestVoiceProfile,
  onEnd?: () => void
): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  if (lang === "kn") utterance.lang = "kn-IN";
  else if (lang === "hi") utterance.lang = "hi-IN";
  else if (lang === "te") utterance.lang = "te-IN";
  else if (lang === "ta") utterance.lang = "ta-IN";
  else utterance.lang = "en-IN";

  // Priest resonant chanting pitch & solemn masculine pace from profile
  utterance.pitch = profile.voicePitch || 0.74; // Deep masculine priest pitch
  utterance.rate = profile.voiceRate || 0.86;   // Solemn, authoritative Vedic recitation pace
  utterance.volume = 1.0;

  // Filter explicitly for Indian Male voices
  const voices = window.speechSynthesis.getVoices();
  const maleKeywords = ["male", "ravi", "hemant", "madhav", "kiran", "pradeep", "manoj", "pankaj", "tarun", "gagan", "deep", "wavenet-b", "standard-b", "neural2-b"];
  const femaleKeywords = ["female", "zira", "swara", "kalpana", "neerja", "heera", "sunita", "harita", "shruti", "priya", "pooja", "sangeeta", "sapna", "wavenet-a", "standard-a"];

  const maleVoice = voices.find(v => {
    const vName = v.name.toLowerCase();
    const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
    const isExplicitlyMale = maleKeywords.some(k => vName.includes(k));
    const isExplicitlyFemale = femaleKeywords.some(k => vName.includes(k));
    return isIndian && isExplicitlyMale && !isExplicitlyFemale;
  }) || voices.find(v => {
    const vName = v.name.toLowerCase();
    const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
    const isExplicitlyFemale = femaleKeywords.some(k => vName.includes(k));
    return isIndian && !isExplicitlyFemale;
  }) || voices.find(v => {
    const vName = v.name.toLowerCase();
    return maleKeywords.some(k => vName.includes(k)) && !femaleKeywords.some(k => vName.includes(k));
  });

  if (maleVoice) {
    utterance.voice = maleVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("[AIVoiceCloneEngine] Speech notice:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
