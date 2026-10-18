/**
 * Baggona Panchanga - Uninterrupted Continuous Speech Recognition Engine
 * Engineered to support long dictations (up to 4-5 minutes) without unexpected premature cut-offs.
 * Automatically handles browser auto-end events, restarting seamlessly while active.
 */

import type { ConsultationLanguage } from "./consultationTypes";

export const LANGUAGE_SPEECH_LOCALES: Record<ConsultationLanguage, string> = {
  kn: "kn-IN",
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  ta: "ta-IN",
  ml: "ml-IN",
  mr: "mr-IN"
};

export interface ContinuousSpeechCallbacks {
  onTranscriptUpdate: (fullTranscript: string, isFinalChunk: boolean) => void;
  onTimeTick?: (elapsedSeconds: number, formattedTime: string) => void;
  onError?: (errMessage: string) => void;
  onStateChange?: (isListening: boolean) => void;
}

export class ContinuousSpeechEngine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListening = false;
  private isExplicitlyActive = false;
  private language: string;
  private accumulatedText = "";
  private currentInterim = "";
  private timerId: number | null = null;
  private elapsedSeconds = 0;
  private maxDurationSeconds = 300; // 5 minutes max continuous session
  private restartTimeout: number | null = null;

  constructor(lang: ConsultationLanguage = "kn") {
    this.language = LANGUAGE_SPEECH_LOCALES[lang] || "kn-IN";
    this.initRecognition();
  }

  public setLanguage(lang: ConsultationLanguage): void {
    this.language = LANGUAGE_SPEECH_LOCALES[lang] || "kn-IN";
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
  }

  public isAvailable(): boolean {
    return typeof window !== "undefined" && (
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
  }

  private initRecognition(): void {
    if (typeof window === "undefined") return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
      this.recognition.maxAlternatives = 1;
    } catch (e) {
      console.warn("[ContinuousSpeechEngine] Init error:", e);
    }
  }

  public start(
    initialText: string = "",
    callbacks: ContinuousSpeechCallbacks
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      if (callbacks.onError) {
        callbacks.onError("Voice recognition is not supported in this browser. Please type your question.");
      }
      return false;
    }

    this.accumulatedText = initialText.trim() ? initialText.trim() + " " : "";
    this.currentInterim = "";
    this.elapsedSeconds = 0;
    this.isExplicitlyActive = true;

    // Timer loop
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      this.elapsedSeconds++;
      const mins = Math.floor(this.elapsedSeconds / 60);
      const secs = this.elapsedSeconds % 60;
      const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      if (callbacks.onTimeTick) {
        callbacks.onTimeTick(this.elapsedSeconds, formatted);
      }

      // Stop gracefully if exceeding 5 minutes
      if (this.elapsedSeconds >= this.maxDurationSeconds) {
        this.stop();
      }
    }, 1000);

    // Event handlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          const finalChunk = item[0].transcript.trim();
          if (finalChunk) {
            this.accumulatedText += finalChunk + " ";
          }
        } else {
          interim += item[0].transcript;
        }
      }
      this.currentInterim = interim;
      const full = (this.accumulatedText + this.currentInterim).trim();
      callbacks.onTranscriptUpdate(full, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      const err = event?.error || "unknown";
      // Ignore routine 'no-speech' or 'aborted' errors when user pauses — we keep the mic running!
      if (err === "no-speech" || err === "aborted") {
        return;
      }
      console.warn("[ContinuousSpeechEngine] Speech error:", err);
      if (err === "not-allowed" || err === "service-not-allowed") {
        this.isExplicitlyActive = false;
        this.stop();
        if (callbacks.onError) {
          callbacks.onError("Microphone access was denied. Please allow microphone permissions in your browser.");
        }
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.isExplicitlyActive) {
        // Automatically restart to fulfill 3-4 minute continuous speaking requirement!
        if (this.restartTimeout) clearTimeout(this.restartTimeout);
        this.restartTimeout = window.setTimeout(() => {
          if (this.isExplicitlyActive && this.recognition) {
            try {
              this.recognition.start();
              this.isListening = true;
            } catch {
              // Might already be active
            }
          }
        }, 80);
      } else {
        if (callbacks.onStateChange) callbacks.onStateChange(false);
        const full = (this.accumulatedText + this.currentInterim).trim();
        callbacks.onTranscriptUpdate(full, true);
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
      if (callbacks.onStateChange) callbacks.onStateChange(true);
      return true;
    } catch (err) {
      console.warn("[ContinuousSpeechEngine] Failed to start:", err);
      // Already running or permission issue
      return false;
    }
  }

  public stop(): string {
    this.isExplicitlyActive = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
    this.isListening = false;
    return (this.accumulatedText + this.currentInterim).trim();
  }

  public getIsActive(): boolean {
    return this.isExplicitlyActive;
  }
}
