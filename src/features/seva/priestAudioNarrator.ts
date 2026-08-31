/**
 * Priest Audio Narrator Engine for Baggona Panchanga Virtual Pooja
 * 
 * Provides authentic, resonant voice recitation for Vedic Pooja steps:
 * 1. Temple Bell Invocation Mantra (ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ...)
 * 2. Deepa & Mantrakshate Offering (ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ... ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ)
 * 3. Personalized Vedic Sankalpa with Devotee Name, Gotra, Rashi, Nakshatra
 * 4. Chief Priest Mangalarathi & Ashirvada with Priest Name
 */

import type { SevaLang } from "./sevaLocale";
import { getVoiceProfileById, type PriestAudioKey } from "../audio/priestVoiceDatabase";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../audio/aiVoiceCloneEngine";

import { POOJA_16_UPACHARES } from "./poojaUpacharaEngine";

export interface PriestNarratorParams {
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  priestName?: string;
  lang?: SevaLang;
  step: number; // 1 to 16 Upacharas
}

export function getPriestStepSpeechText(params: PriestNarratorParams): { sanskritMantra: string; narrationText: string } {
  const { devoteeName, gotra = "ಕಾಶ್ಯಪ", rashiName = "ಧನು", nakshatraName = "ಮೂಲ", priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್", lang = "kn", step } = params;
  const list = POOJA_16_UPACHARES({ devoteeName, gotra, rashiName, nakshatraName, priestName, lang });
  const matched = list.find((item) => item.step === step) || list[list.length - 1];
  return {
    sanskritMantra: matched.sanskritMantra,
    narrationText: matched.narrationText[lang || "kn"] || matched.narrationText.kn
  };
}

/**
 * Plays resonant multi-harmonic temple bell using Web Audio API
 */
export function playTempleBellChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);
    masterGain.connect(ctx.destination);

    // Harmonic bell frequencies for realistic bronze temple bell
    const harmonics = [432, 864, 1296, 1728, 2160, 2592];
    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const amp = 1 / (idx + 1.2);
      oscGain.gain.setValueAtTime(amp, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (3.0 / (idx * 0.4 + 1)));

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 3.2);
    });
  } catch (err) {
    console.warn("[PriestAudioNarrator] Web Audio chime note:", err);
  }
}

let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Recites text using custom recorded audio if available from the selected Priest Voice Profile,
 * or Male Priest TTS voice with deep Vedic resonance tuned to the profile's pitch and rate
 */
export function speakPriestNarration(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  stepKey?: PriestAudioKey,
  voiceId?: string
): () => void {
  if (typeof window === "undefined") {
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  const profile = getVoiceProfileById(voiceId);

  // 1. Check if user uploaded a custom priest voice recording for this step in this profile
  if (stepKey && profile?.audioClips?.[stepKey]) {
    const customAudio = profile.audioClips[stepKey];
    if (customAudio && customAudio.dataUrl) {
      try {
        stopPriestAudio();
        const audio = new Audio(customAudio.dataUrl);
        activeAudioElement = audio;
        audio.onended = () => {
          activeAudioElement = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          activeAudioElement = null;
          // fallback to TTS below
          fallbackMaleTTS(text, lang, onEnd, profile.voicePitch, profile.voiceRate);
        };
        audio.play().catch(() => {
          fallbackMaleTTS(text, lang, onEnd, profile.voicePitch, profile.voiceRate);
        });
        return () => {
          if (activeAudioElement) {
            activeAudioElement.pause();
            activeAudioElement = null;
          }
        };
      } catch {
        // Fallback to TTS below
      }
    }
  }

  // 2. Real-time AI Voice Clone Synthesis (free Edge Neural / Hugging Face / Formant DSP)
  let cancelCloneFn: (() => void) | null = null;
  synthesizeAndPlayClonedVoice(text, lang, voiceId, onEnd).then((cancelFn) => {
    cancelCloneFn = cancelFn;
  }).catch(() => {
    cancelCloneFn = fallbackMaleTTS(text, lang, onEnd, profile?.voicePitch || 0.74, profile?.voiceRate || 0.86);
  });

  return () => {
    if (cancelCloneFn) cancelCloneFn();
    stopClonedAudio();
  };
}

function fallbackMaleTTS(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  pitch = 0.74,
  rate = 0.86
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
  utterance.pitch = pitch; // Deep masculine priest pitch
  utterance.rate = rate;  // Solemn, authoritative Vedic recitation pace
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
    console.warn("[PriestAudioNarrator] Speech synthesis notice:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}

export function stopPriestAudio(): void {
  stopClonedAudio();
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
