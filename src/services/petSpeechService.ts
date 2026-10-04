/**
 * petSpeechService.ts
 *
 * Dedicated Speech Synthesis and Voice Output Service for the Super Admin AI Pet.
 * Uses the Web Speech API with multilingual voice matching (Kannada, Hindi, Telugu, Tamil, English).
 * Provides callbacks for mouth/soundwave animations and safe mobile audio playback.
 */

import type { SupportedLanguage } from "../stores/appStore";

export type SpeechStateListener = (isSpeaking: boolean) => void;

class PetSpeechService {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<SpeechStateListener> = new Set();
  private voiceCache: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.voiceCache = window.speechSynthesis.getVoices() || [];
  }

  public subscribe(listener: SpeechStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(isSpeaking: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(isSpeaking);
      } catch (err) {
        console.error("PetSpeechService listener error:", err);
      }
    });
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

  public stop(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.notify(false);
  }

  /**
   * Sanitizes text to remove markdown, URLs, symbols and emojis so the browser TTS reads smoothly.
   */
  public cleanTextForSpeech(rawText: string): string {
    return rawText
      .replace(/https?:\/\/\S+/g, "") // remove URLs
      .replace(/[*#_~`>[\]()|]/g, " ") // remove markdown characters
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // remove emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Speaks the given text using the best matching voice for the target language.
   */
  public speak(
    text: string,
    lang: SupportedLanguage = "kn",
    onComplete?: () => void
  ): void {
    if (this.isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onComplete) onComplete();
      return;
    }

    const clean = this.cleanTextForSpeech(text);
    if (!clean) {
      if (onComplete) onComplete();
      return;
    }

    // Stop any existing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(clean);
    this.currentUtterance = utterance;

    // Language prefix mapping
    const langPrefixes: Record<SupportedLanguage, string[]> = {
      kn: ["kn-IN", "kn", "hi-IN", "en-IN"],
      hi: ["hi-IN", "hi", "en-IN"],
      te: ["te-IN", "te", "hi-IN", "en-IN"],
      ta: ["ta-IN", "ta", "hi-IN", "en-IN"],
      en: ["en-IN", "en-GB", "en-US", "en"]
    };

    const targetPrefixes = langPrefixes[lang] || ["en-IN", "en"];
    const voices = this.voiceCache.length > 0 ? this.voiceCache : window.speechSynthesis.getVoices() || [];

    // Find best voice match
    let chosenVoice: SpeechSynthesisVoice | undefined;
    for (const prefix of targetPrefixes) {
      chosenVoice = voices.find(
        (v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix.toLowerCase())
      );
      if (chosenVoice) break;
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = targetPrefixes[0];
    }

    // Tuned for a warm, celestial companion tone
    utterance.pitch = 1.1; // slightly higher pitch for cute/divine companion feel
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify(false);
      if (onComplete) onComplete();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      this.currentUtterance = null;
      this.notify(false);
      if (onComplete) onComplete();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to speak utterance:", err);
      this.notify(false);
      if (onComplete) onComplete();
    }
  }
}

export const petSpeechService = new PetSpeechService();
