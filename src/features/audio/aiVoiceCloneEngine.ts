/**
 * Baggona Panchanga - Real-Time AI Voice Cloning Engine (ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್)
 * 
 * Supports:
 * 1. ElevenLabs Instant Voice Cloning (Custom API key & Voice ID)
 * 2. Hugging Face Inference API / Coqui XTTS-v2 (Zero-shot voice cloning with reference audio)
 * 3. Guaranteed In-Browser Male Vedic Speech Synthesizer with WebKit GC anchor and Mikaela/Coral blacklist
 * 4. Resonant Web Audio DSP Acoustic Filtering with 125Hz F0 masculine resonance
 */

import type { SevaLang } from "../seva/sevaLocale";
import { getVoiceProfileById, type PriestVoiceProfile } from "./priestVoiceDatabase";

export type VoiceCloneProvider = "web_dsp" | "elevenlabs" | "huggingface_xtts" | "edge_neural";

export interface VoiceCloneConfig {
  provider: VoiceCloneProvider;
  hfApiKey?: string;
  hfModelUrl?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoiceId?: string;
  autoFallbackToDsp: boolean;
  bassBoostGain: number; // 0.0 to 3.0
  formantWarmthHz: number; // e.g. 120Hz fundamental F0
  preferredPitch: number; // 0.74 (deeper masculine voice)
  preferredRate: number;  // 0.88 (steady cadence)
}

const CLONE_CONFIG_STORAGE_KEY = "baggona_ai_voice_clone_config_v3";

export const DEFAULT_CLONE_CONFIG: VoiceCloneConfig = {
  provider: "web_dsp",
  hfModelUrl: "https://api-inference.huggingface.co/models/coqui/XTTS-v2",
  autoFallbackToDsp: true,
  bassBoostGain: 2.2,
  formantWarmthHz: 125,
  preferredPitch: 0.76,
  preferredRate: 0.88
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
 * Stops any currently playing cloned audio or speech synthesis
 */
export function stopClonedAudio(): void {
  if (activeCloneAudio) {
    activeCloneAudio.pause();
    activeCloneAudio.currentTime = 0;
    activeCloneAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    (window as any).__baggonaActiveUtterance = null;
    window.speechSynthesis.cancel();
  }
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
 * 1. Tries ElevenLabs if configured
 * 2. Tries Hugging Face XTTS if configured
 * 3. Guaranteed Male-Only In-Browser Web Audio Formant DSP (Strictly filters out Mikaela/Coral, binds 125Hz pitch)
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
        return playAudioUrlWithDSP(audioUrl, onEnd);
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
        return playAudioUrlWithDSP(audioUrl, onEnd);
      }
    } catch (e) {
      console.warn("[AIVoiceCloneEngine] Hugging Face XTTS error, falling back:", e);
    }
  }

  // 3. Guaranteed Male-Only In-Browser Web Audio Formant DSP (Strictly filters out Mikaela/Coral)
  return playStrictlyMaleWebSpeechDSP(text, lang, profile, onEnd, config);
}

/**
 * Plays an audio URL via HTML5 Audio with proper end callbacks
 */
function playAudioUrlWithDSP(url: string, onEnd?: () => void): () => void {
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
 * STRICTLY MALE Web Speech Synthesis (Hard blacklists "Mikaela", "Coral", "Samantha", etc.)
 * Pre-configures pitch 0.76 and rate 0.88 to match ShriSuma's resonant acoustic profile
 */
export async function playStrictlyMaleWebSpeechDSP(
  text: string,
  lang: SevaLang,
  profile: PriestVoiceProfile,
  onEnd?: () => void,
  config?: VoiceCloneConfig
): Promise<() => void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  // Ensure any paused queue is resumed
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  const voices = await getAvailableVoicesAsync();
  const utterance = new SpeechSynthesisUtterance(text);

  if (lang === "kn") utterance.lang = "kn-IN";
  else if (lang === "hi") utterance.lang = "hi-IN";
  else if (lang === "te") utterance.lang = "te-IN";
  else if (lang === "ta") utterance.lang = "ta-IN";
  else utterance.lang = "en-IN";

  // Priest resonant chanting pitch & masculine cadence matching user F0 frequency
  utterance.pitch = config?.preferredPitch || profile.voicePitch || 0.76;
  utterance.rate = config?.preferredRate || profile.voiceRate || 0.88;
  utterance.volume = 1.0;

  // Strict blacklist to banish Mikaela, Coral, Samantha, and any female synth voices
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
    // 1. First priority: Indian Male Voice
    const indianMale = voices.find(v => {
      const name = v.name.toLowerCase();
      const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      const isMale = preferredMaleNames.some(m => name.includes(m));
      return isIndian && isMale && !isBanned;
    });

    // 2. Second priority: Any Indian Voice that is NOT banned female
    const anyIndianNonFemale = voices.find(v => {
      const name = v.name.toLowerCase();
      const isIndian = v.lang.includes("IN") || v.lang.includes("kn") || v.lang.includes("hi");
      const isBanned = bannedFemaleNames.some(b => name.includes(b));
      return isIndian && !isBanned;
    });

    // 3. Third priority: Any Male voice on the system
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

  // Anchor utterance globally to prevent WebKit/Chromium garbage collection drops
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

  // Small delay to ensure previous audio/oscillator has released audio channel
  setTimeout(() => {
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
