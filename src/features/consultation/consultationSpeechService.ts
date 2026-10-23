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
 * Merges two speech string segments cleanly while intelligently detecting and stripping
 * any suffix-prefix overlap (up to 25 words) caused by speech engine restarts or buffer repeats.
 * E.g. "ನನ್ನ ಮದುವೆ ಯಾವಾಗ" + "ಯಾವಾಗ ಆಗುತ್ತದೆ" -> "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ"
 * E.g. "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ" + "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ" -> "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ ತಿಳಿಸಿ"
 */
export function mergeSpeechSegments(baseText: string, incomingSegment: string): string {
  const b = (baseText || "").trim();
  const inc = (incomingSegment || "").trim();
  if (!b) return sanitizeDuplicateSpeechWords(inc);
  if (!inc) return sanitizeDuplicateSpeechWords(b);

  const bTokens = b.split(/\s+/).filter(Boolean);
  const incTokens = inc.split(/\s+/).filter(Boolean);

  // Normalize tokens for matching (strip common punctuation for comparison)
  const norm = (s: string) => s.toLowerCase().replace(/^[.,!?;:॥|]+|[.,!?;:॥|]+$/g, "");

  const maxOverlap = Math.min(bTokens.length, incTokens.length, 25);
  let overlapLen = 0;

  for (let len = maxOverlap; len >= 1; len--) {
    let match = true;
    for (let k = 0; k < len; k++) {
      const bWord = norm(bTokens[bTokens.length - len + k]);
      const incWord = norm(incTokens[k]);
      if (bWord !== incWord) {
        match = false;
        break;
      }
    }
    if (match) {
      overlapLen = len;
      break;
    }
  }

  // If suffix of base matches prefix of incoming, slice off the duplicate prefix
  const remainingInc = incTokens.slice(overlapLen).join(" ");
  const merged = cleanJoin(b, remainingInc);
  return sanitizeDuplicateSpeechWords(merged);
}

/**
 * Deduplicates accidental consecutive identical words, multi-word phrase echoes,
 * or full repeated sentences caused by microphone feedback loops, speech engine stuttering,
 * browser auto-restart overlap, or repeated result firing.
 * E.g. "ಅವನು ಅವನು ಅವನು ಅವನು ಅವಳಿಗೆ ಅವಳಿಗೆ" -> "ಅವನು ಅವಳಿಗೆ"
 * E.g. "ಯಾವಾಗ ಆಗುತ್ತದೆ ಯಾವಾಗ ಆಗುತ್ತದೆ" -> "ಯಾವಾಗ ಆಗುತ್ತದೆ"
 * E.g. "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ? ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?" -> "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?"
 */
export function sanitizeDuplicateSpeechWords(text: string): string {
  if (!text) return "";

  const trimmed = text.trim();
  if (!trimmed) return "";

  // Helper to normalize tokens for comparison (stripping terminal punctuation)
  const norm = (s: string) => s.toLowerCase().replace(/^[.,!?;:॥|]+|[.,!?;:॥|]+$/g, "");

  // 1. Sentence-level deduplication
  // Split on sentence terminators while preserving them or linebreaks
  const rawSentences = trimmed.split(/(?<=[.!?॥|]|\n+)\s*/).filter(Boolean);
  let dedupedText = trimmed;

  if (rawSentences.length > 1) {
    const cleanSentences: string[] = [];
    for (const sentence of rawSentences) {
      const sTrim = sentence.trim();
      if (!sTrim) continue;
      const prev = cleanSentences[cleanSentences.length - 1];
      if (prev && norm(sTrim) === norm(prev.trim())) {
        continue; // drop duplicate identical sentence
      }
      cleanSentences.push(sTrim);
    }
    dedupedText = cleanSentences.join(" ");
  }

  // 2. Token-level n-gram deduplication (from 25-word phrases down to single words)
  let tokens = dedupedText.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return dedupedText;

  let changed = true;
  let iterations = 0;
  // Repeat passes until stable (max 4 passes to prevent infinite loop)
  while (changed && iterations < 4) {
    changed = false;
    iterations++;

    // Try phrase lengths from 25 down to 1
    const maxK = Math.min(25, Math.floor(tokens.length / 2));
    for (let k = maxK; k >= 1; k--) {
      const newTokens: string[] = [];
      let i = 0;

      while (i < tokens.length) {
        // Check if tokens[i .. i+k-1] matches tokens[i+k .. i+2k-1]
        if (i + 2 * k <= tokens.length) {
          let match = true;
          for (let m = 0; m < k; m++) {
            if (norm(tokens[i + m]) !== norm(tokens[i + k + m])) {
              match = false;
              break;
            }
          }
          if (match) {
            // Found duplicate phrase of length k! Push first copy, skip second copy
            for (let m = 0; m < k; m++) {
              newTokens.push(tokens[i + m]);
            }
            i += 2 * k;
            changed = true;
            continue;
          }
        }

        // Also check if tokens[i] matches the immediately preceding token (single-word duplicate)
        if (k === 1 && newTokens.length > 0) {
          const prev = newTokens[newTokens.length - 1];
          if (norm(tokens[i]) === norm(prev)) {
            i++;
            changed = true;
            continue;
          }
        }

        newTokens.push(tokens[i]);
        i++;
      }

      tokens = newTokens;
      if (changed) break; // restart scan on changed tokens
    }
  }

  return tokens.join(" ").replace(/\s+([.,!?;:॥|])/g, "$1").trim();
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

      const sessionCombined = mergeSpeechSegments(
        this.currentSessionFinal,
        this.currentInterim
      );
      const rawFull = mergeSpeechSegments(this.baseText, sessionCombined);
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
        // using mergeSpeechSegments to seamlessly eliminate any suffix-prefix overlap.
        if (this.currentSessionFinal) {
          this.baseText = mergeSpeechSegments(this.baseText, this.currentSessionFinal);
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
          this.baseText = mergeSpeechSegments(this.baseText, this.currentSessionFinal);
          this.currentSessionFinal = "";
        }
        if (callbacks.onStateChange) callbacks.onStateChange(false);
        const rawFull = mergeSpeechSegments(this.baseText, this.currentInterim);
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
      this.baseText = mergeSpeechSegments(this.baseText, this.currentSessionFinal);
      this.currentSessionFinal = "";
    }

    const rawFull = mergeSpeechSegments(this.baseText, this.currentInterim);
    const finalSanitized = sanitizeDuplicateSpeechWords(rawFull);
    this.currentInterim = "";
    return finalSanitized;
  }

  public getIsActive(): boolean {
    return this.isExplicitlyActive;
  }
}
