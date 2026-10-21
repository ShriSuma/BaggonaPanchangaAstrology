/**
 * Baggona Panchanga - Uninterrupted Continuous Speech Recognition Engine
 * Engineered to support long dictations (up to 4-5 minutes) without unexpected premature cut-offs.
 * Automatically handles browser auto-end events, restarting seamlessly while active.
 *
 * CRITICAL FIX:
 * Prevents Web Speech API duplicate word / sentence accumulation bug caused by
 * iterating over historical event.results with un-advanced event.resultIndex.
 * Includes intelligent multi-lingual anti-stutter deduplication filter.
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

/**
 * Utility helper to join string segments cleanly with single space separation.
 */
export function cleanJoin(...parts: (string | undefined | null)[]): string {
  return parts
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deduplicates accidental consecutive identical words or multi-word phrase echoes
 * caused by microphone feedback loops, speech engine stuttering, or repeated result firing.
 * E.g. "ಅವನು ಅವನು ಅವನು ಅವನು ಅವಳಿಗೆ ಅವಳಿಗೆ" -> "ಅವನು ಅವಳಿಗೆ"
 * E.g. "ಯಾವಾಗ ಆಗುತ್ತದೆ ಯಾವಾಗ ಆಗುತ್ತದೆ" -> "ಯಾವಾಗ ಆಗುತ್ತದೆ"
 */
export function sanitizeDuplicateSpeechWords(text: string): string {
  if (!text) return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // 1. Split tokens by whitespace while preserving punctuation attached to words
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return trimmed;

  const cleaned: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = cleaned[cleaned.length - 1];

    // Single-word consecutive duplicate: e.g. "ಅವನು ಅವನು ಅವನು"
    if (prev && current.toLowerCase() === prev.toLowerCase()) {
      continue;
    }

    // Two-word phrase repetition: e.g. "ಯಾವಾಗ ಆಗುತ್ತದೆ ಯಾವಾಗ ಆಗುತ್ತದೆ"
    if (cleaned.length >= 2 && i + 1 < tokens.length) {
      const next = tokens[i + 1];
      const prev1 = cleaned[cleaned.length - 2];
      const prev2 = cleaned[cleaned.length - 1];
      if (
        prev1.toLowerCase() === current.toLowerCase() &&
        prev2.toLowerCase() === next.toLowerCase()
      ) {
        i++; // skip next word of the repeated phrase
        continue;
      }
    }

    // Three-word phrase repetition: e.g. "ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ ನನಗೆ ಕೆಲಸ ಸಿಗುತ್ತಾ"
    if (cleaned.length >= 3 && i + 2 < tokens.length) {
      const next1 = tokens[i + 1];
      const next2 = tokens[i + 2];
      const p1 = cleaned[cleaned.length - 3];
      const p2 = cleaned[cleaned.length - 2];
      const p3 = cleaned[cleaned.length - 1];
      if (
        p1.toLowerCase() === current.toLowerCase() &&
        p2.toLowerCase() === next1.toLowerCase() &&
        p3.toLowerCase() === next2.toLowerCase()
      ) {
        i += 2; // skip remaining 2 words of the repeated 3-word phrase
        continue;
      }
    }

    cleaned.push(current);
  }

  return cleaned.join(" ");
}

export class ContinuousSpeechEngine {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListening = false;
  private isExplicitlyActive = false;
  private language: string;

  /**
   * Base text committed from initial input or previously auto-restarted browser sessions.
   */
  private baseText = "";

  /**
   * Final text computed from the CURRENT active browser recognition session.
   */
  private currentSessionFinal = "";

  /**
   * Interim (in-flight) text hypothesis for the CURRENT active browser recognition session.
   */
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

    // Clean initial base text without trailing duplicated whitespace
    this.baseText = (initialText || "").trim();
    this.currentSessionFinal = "";
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
      let sessionFinal = "";
      let sessionInterim = "";

      // CRITICAL FIX:
      // Always iterate over all results in event.results from 0 to event.results.length.
      // In Web Speech API, event.results is the full session list.
      // Re-reading from 0 and summing final/interim items avoids the catastrophic bug where
      // previously finalized items were repeatedly appended to this.accumulatedText.
      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        const transcript = (item[0].transcript || "").trim();
        if (!transcript) continue;

        if (item.isFinal) {
          sessionFinal += (sessionFinal ? " " : "") + transcript;
        } else {
          sessionInterim += (sessionInterim ? " " : "") + transcript;
        }
      }

      this.currentSessionFinal = sessionFinal;
      this.currentInterim = sessionInterim;

      const rawFull = cleanJoin(
        this.baseText,
        this.currentSessionFinal,
        this.currentInterim
      );

      const sanitizedFull = sanitizeDuplicateSpeechWords(rawFull);
      callbacks.onTranscriptUpdate(sanitizedFull, false);
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
        // Commit the current session's final transcript into baseText before starting new session
        if (this.currentSessionFinal) {
          this.baseText = cleanJoin(this.baseText, this.currentSessionFinal);
          this.currentSessionFinal = "";
        }
        this.currentInterim = "";

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
        if (this.currentSessionFinal) {
          this.baseText = cleanJoin(this.baseText, this.currentSessionFinal);
          this.currentSessionFinal = "";
        }
        if (callbacks.onStateChange) callbacks.onStateChange(false);
        const rawFull = cleanJoin(this.baseText, this.currentInterim);
        const sanitizedFull = sanitizeDuplicateSpeechWords(rawFull);
        callbacks.onTranscriptUpdate(sanitizedFull, true);
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

    if (this.currentSessionFinal) {
      this.baseText = cleanJoin(this.baseText, this.currentSessionFinal);
      this.currentSessionFinal = "";
    }

    const rawFull = cleanJoin(this.baseText, this.currentInterim);
    const finalSanitized = sanitizeDuplicateSpeechWords(rawFull);
    this.currentInterim = "";
    return finalSanitized;
  }

  public getIsActive(): boolean {
    return this.isExplicitlyActive;
  }
}
