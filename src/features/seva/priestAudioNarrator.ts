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
import { synthesizeAndPlayClonedVoice, stopClonedAudio, resolveBestVedicVoice } from "../audio/aiVoiceCloneEngine";
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

  // NOTE: synthesizeAndPlayClonedVoice manages its own audio session token.
  // Do NOT call startNewAudioSession() here, which would bump currentPlaybackToken
  // and cause isPlaybackTokenActive(token) to immediately fail upon completion!
  let cancelCloneFn: (() => void) | null = null;
  let isCancelled = false;

  const safeOnEnd = () => {
    if (!isCancelled && onEnd) {
      onEnd();
    }
  };

  const safeOnStart = () => {
    if (!isCancelled && onStart) {
      onStart();
    }
  };

  // Pure Real-time AI Voice Synthesis (Authentic Priest & Devotional Cadence only)
  // STRICT USER MANDATE: "If the proper is there, then only link it. Otherwise, you don't need to link it, please."
  // Never fall back to distorted or robotic browser speech synthesis.
  synthesizeAndPlayClonedVoice(text, lang, voiceId, safeOnEnd, safeOnStart).then((cancelFn) => {
    if (isCancelled) {
      if (cancelFn) cancelFn();
      return;
    }
    cancelCloneFn = cancelFn;
  }).catch((err) => {
    if (isCancelled) return;
    console.warn("[PriestAudioNarrator] Authentic voice playback unavailable, skipping robotic fallback per user mandate:", err);
    safeOnEnd();
  });

  return () => {
    isCancelled = true;
    if (cancelCloneFn) {
      cancelCloneFn();
    } else {
      stopAllAudioGlobal();
    }
  };
}

export function stopPriestAudio(): void {
  stopAllAudioGlobal();
}
