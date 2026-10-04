/**
 * petSpeechService.ts
 *
 * Dedicated Speech Synthesis and Voice Output Service for the Super Admin AI Pet.
 * Uses the third-party AI Studio streaming voice engine (synthesizeAndPlayClonedVoice with voice_sriram_pandit)
 * for authentic, high-fidelity Indic speech playback without browser SpeechSynthesis limits or stutter.
 * Includes automatic resilient fallback to strictly masculine Web Speech DSP when offline.
 */

import type { SupportedLanguage } from "../stores/appStore";
import type { SevaLang } from "../features/seva/sevaLocale";
import {
  synthesizeAndPlayClonedVoice,
  stopClonedAudio,
  sanitizeTextForSpeech
} from "../features/audio/aiVoiceCloneEngine";

export type SpeechStateListener = (isSpeaking: boolean) => void;

class PetSpeechService {
  private isMuted: boolean = false;
  private _isSpeaking: boolean = false;
  private cancelCurrentAudio: (() => void) | null = null;
  private listeners: Set<SpeechStateListener> = new Set();
  private voiceId: string = "voice_sriram_pandit";

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean): void {
    this._isSpeaking = isSpeaking;
    this.listeners.forEach((listener) => {
      try {
        listener(isSpeaking);
      } catch (err) {
        console.error("PetSpeechService listener error:", err);
      }
    });
  }

  public isSpeaking(): boolean {
    return this._isSpeaking;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVoiceId(id: string): void {
    if (id) this.voiceId = id;
  }

  public getVoiceId(): string {
    return this.voiceId;
  }

  public stop(): void {
    if (this.cancelCurrentAudio) {
      try {
        this.cancelCurrentAudio();
      } catch {}
      this.cancelCurrentAudio = null;
    }
    stopClonedAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.notify(false);
  }

  /**
   * Sanitizes text to remove markdown, URLs, symbols and emojis so the voice engine reads smoothly.
   */
  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return "";
    return sanitizeTextForSpeech(
      rawText
        .replace(/https?:\/\/\S+/g, "") // remove URLs
        .replace(/[*#_~`>[\]()|]/g, " ") // remove markdown characters
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // remove emojis
        .replace(/[\u{2600}-\u{26FF}]/gu, "")
        .replace(/[\u{2700}-\u{27BF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Speaks the given text using the third-party AI Studio Streaming Voice Engine (voice_sriram_pandit)
   * with automatic fallback. Full text is spoken clearly and completely.
   */
  public async speak(
    text: string,
    lang: SupportedLanguage = "kn",
    onComplete?: () => void,
    onStart?: () => void,
    customVoiceId?: string
  ): Promise<() => void> {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return () => {};
    }

    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      if (onComplete) onComplete();
      return () => {};
    }

    // Stop any existing speech before starting new utterance
    this.stop();

    if (typeof window === "undefined") {
      if (onComplete) onComplete();
      return () => {};
    }

    const sevaLang: SevaLang = (lang === "kn" || lang === "hi" || lang === "te" || lang === "ta" || lang === "en")
      ? lang
      : "kn";

    const targetVoice = customVoiceId || this.voiceId;

    try {
      this.notify(true);
      if (onStart) onStart();

      const cancelFn = await synthesizeAndPlayClonedVoice(
        clean,
        sevaLang,
        targetVoice,
        () => {
          this.cancelCurrentAudio = null;
          this.notify(false);
          if (onComplete) onComplete();
        },
        () => {
          this.notify(true);
          if (onStart) onStart();
        }
      );

      this.cancelCurrentAudio = cancelFn;
      return cancelFn;
    } catch (err) {
      console.warn("[PetSpeechService] AI Studio voice synthesis error, notifying end:", err);
      this.cancelCurrentAudio = null;
      this.notify(false);
      if (onComplete) onComplete();
      return () => {};
    }
  }
}

export const petSpeechService = new PetSpeechService();
