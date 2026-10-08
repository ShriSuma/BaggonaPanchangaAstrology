/**
 * Baggona Panchanga - Guided Pooja Audio Narrator
 * (ಪುರೋಹಿತ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಎಂಜಿನ್)
 * 
 * Powered by third-party Neural AI Voice API (Custom Studio Real-Time Streaming Gemini TTS API / Sarvam Indic Neural).
 * 
 * STRICT USER MANDATE:
 * - "For text to speech use third party API tool that I have already given you. And if it is initial load is taking 25 seconds also fine, but I want the third party API only to tell the instruction and tell the details."
 * - "The priest is sitting with them and giving the instruction and the priest knows the knowledge of 50 years, he is doing the same thing from 50 years."
 */

import type { SevaLang } from "../seva/sevaLocale";
import {
  synthesizeAndPlayClonedVoice,
  stopClonedAudio,
  pauseClonedAudio,
  resumeClonedAudio,
  isClonedAudioPaused,
  seekClonedAudio
} from "../audio/aiVoiceCloneEngine";
import { playTempleBellChime } from "../seva/priestAudioNarrator";
import { stopAllAudioGlobal } from "../audio/globalAudioManager";

export interface GuidedAudioCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

let activeCancelFn: (() => void) | null = null;
let isAudioActive = false;

/**
 * Recites the sacred Priest guidance and Vedic mantra using the third-party neural voice API
 */
export async function speakGuidedPoojaStep(
  speechText: string,
  lang: SevaLang = "kn",
  callbacks?: GuidedAudioCallbacks,
  voiceId: string = "voice_sriram_pandit"
): Promise<() => void> {
  // Stop any active audio before starting new step
  stopGuidedPoojaAudio();

  if (!speechText || !speechText.trim()) {
    callbacks?.onEnd?.();
    return () => {};
  }

  callbacks?.onLoadingChange?.(true);
  isAudioActive = true;

  let cancelFn: (() => void) | null = null;
  let isCancelled = false;

  const handleStart = () => {
    callbacks?.onLoadingChange?.(false);
    callbacks?.onStart?.();
  };

  const handleEnd = () => {
    callbacks?.onLoadingChange?.(false);
    isAudioActive = false;
    activeCancelFn = null;
    callbacks?.onEnd?.();
  };

  try {
    cancelFn = await synthesizeAndPlayClonedVoice(
      speechText,
      lang,
      voiceId,
      () => {
        if (!isCancelled) handleEnd();
      },
      () => {
        if (!isCancelled) handleStart();
      }
    );

    if (isCancelled) {
      if (cancelFn) cancelFn();
      return () => {};
    }

    activeCancelFn = cancelFn;
  } catch (err) {
    callbacks?.onLoadingChange?.(false);
    isAudioActive = false;
    activeCancelFn = null;
    callbacks?.onError?.(err);
    callbacks?.onEnd?.();
  }

  return () => {
    isCancelled = true;
    callbacks?.onLoadingChange?.(false);
    isAudioActive = false;
    if (cancelFn) {
      cancelFn();
    } else {
      stopClonedAudio();
    }
    activeCancelFn = null;
  };
}

export function pauseGuidedPoojaAudio(): void {
  pauseClonedAudio();
}

export function resumeGuidedPoojaAudio(): Promise<void> {
  return resumeClonedAudio();
}

export function isGuidedPoojaAudioPaused(): boolean {
  return isClonedAudioPaused();
}

export function isGuidedPoojaAudioActive(): boolean {
  return isAudioActive;
}

export function seekGuidedPoojaAudio(deltaSeconds: number): void {
  seekClonedAudio(deltaSeconds);
}

export function stopGuidedPoojaAudio(): void {
  if (activeCancelFn) {
    try {
      activeCancelFn();
    } catch {}
    activeCancelFn = null;
  }
  isAudioActive = false;
  stopClonedAudio();
  stopAllAudioGlobal();
}

export { playTempleBellChime };
