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
import {
  stopAllAudioGlobal,
  startNewAudioSession,
  isPlaybackTokenActive,
  registerActiveAudio,
  registerAudioContext
} from "../audio/globalAudioManager";

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
    registerAudioContext(ctx);

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

/**
 * Recites text using Dynamic AI Voice Cloning / Sarvam AI Indic Neural TTS
 * with deep Vedic resonance tuned to the priest profile's pitch and rate.
 * 
 * STRICT RULE: Never plays pre-recorded static audio files.
 */
export function speakPriestNarration(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  _stepKey?: PriestAudioKey,
  voiceId?: string,
  onStart?: () => void
): () => void {
  if (typeof window === "undefined") {
    if (onStart) onStart();
    if (onEnd) setTimeout(onEnd, 2000);
    return () => {};
  }

  const token = startNewAudioSession();
  const profile = getVoiceProfileById(voiceId);

  // Pure Real-time AI Voice Synthesis (Sarvam AI Neural TTS with Web Speech Fallback)
  let cancelCloneFn: (() => void) | null = null;
  synthesizeAndPlayClonedVoice(text, lang, voiceId, onEnd, onStart).then((cancelFn) => {
    if (!isPlaybackTokenActive(token)) {
      if (cancelFn) cancelFn();
      return;
    }
    cancelCloneFn = cancelFn;
  }).catch(() => {
    if (!isPlaybackTokenActive(token)) return;
    cancelCloneFn = fallbackMaleTTS(text, lang, onEnd, profile?.voicePitch || 0.74, profile?.voiceRate || 0.86, onStart, token);
  });

  return () => {
    if (cancelCloneFn) cancelCloneFn();
    stopAllAudioGlobal();
  };
}

function fallbackMaleTTS(
  text: string,
  lang: SevaLang = "kn",
  onEnd?: () => void,
  pitch = 0.74,
  rate = 0.86,
  onStart?: () => void,
  token?: number
): () => void {
  if (token !== undefined && !isPlaybackTokenActive(token)) return () => {};

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onStart) onStart();
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

  const voices = window.speechSynthesis.getVoices();

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

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("[PriestAudioNarrator] Speech synthesis notice:", e);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
    if (onStart) onStart();
  } catch {
    if (onEnd) onEnd();
  }

  return () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}

export function stopPriestAudio(): void {
  stopAllAudioGlobal();
}
