/**
 * Baggona Panchanga - Uninterrupted Continuous Speech Recognition Engine & AI Question Refiner
 * Engineered to support long dictations (up to 4-5 minutes) without unexpected premature cut-offs.
 * Automatically handles browser auto-end events, restarting cleanly without speech buffer pollution.
 *
 * CRITICAL ZERO-DUPLICATION & AI REFINEMENT PROTOCOL:
 * 1. Strictly eliminates the catastrophic duplicate word / sentence accumulation bug caused by
 *    concatenating non-overlapping historical event.results or partial interim hypotheses.
 * 2. Multi-pass anti-stutter deduplication filter collapses any runs of consecutive duplicate
 *    words (even if repeated 10, 20, or 50 times) in a single pass.
 * 3. Fresh SpeechRecognition instantiation on pause-restart prevents Chromium internal result leaks.
 * 4. Fast 2-3 second AI Question Refiner (using gemini-3.5-flash-lite) converts dictated speech into
 *    a polished, respectful, single-sentence Vedic astrological question in the user's chosen language.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppStore } from "../../stores/appStore";
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

export const LANGUAGE_DISPLAY_NAMES: Record<ConsultationLanguage, string> = {
  kn: "Kannada (ಕನ್ನಡ)",
  en: "English",
  hi: "Hindi (हिन्दी)",
  te: "Telugu (తెలుగు)",
  ta: "Tamil (தமிழ்)",
  ml: "Malayalam (മലയാളം)",
  mr: "Marathi (मराठी)"
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
 * Normalizes tokens for strict phonetic and linguistic matching:
 * 1. Unicode NFC normalization (resolves macOS / iOS Safari decomposed NFD speech dictation vs web NFC literals).
 * 2. Strips Zero-Width formatting characters (\u200B zero-width space, \u200C ZWNJ, \u200D ZWJ, \uFEFF BOM, \u00A0 non-breaking space).
 * 3. Strips all terminal and leading punctuation (including Latin and Indic dandas । \u0964, ॥ \u0965, quotes, brackets).
 * 4. Lowercase and collapse internal whitespace.
 */
export function normToken(s: string): string {
  if (!s) return "";
  let norm = typeof s.normalize === "function" ? s.normalize("NFC") : s;
  norm = norm.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "");
  norm = norm.replace(/^[.,!?;:॥|।·•–—"'`“”‘’«»()[\]{}]+|[.,!?;:॥|।·•–—"'`“”‘’«»()[\]{}]+$/g, "");
  return norm.toLowerCase().trim();
}

/**
 * Collapses consecutive identical tokens: e.g. ["ಹಲೋ", "ಹಲೋ", "ಹಲೋ", ...] -> ["ಹಲೋ"].
 * Collapses any number of repetitions (2 to 100 times) in a single O(N) pass.
 */
export function collapseConsecutiveTokens(tokens: string[]): string[] {
  if (tokens.length <= 1) return tokens;
  const result: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    if (!current) continue;
    const prev = result[result.length - 1];
    if (prev && normToken(current) && normToken(current) === normToken(prev)) {
      // Transfer any trailing punctuation from current to prev if prev lacks it
      const trailingPunct = current.match(/[.,!?;:॥|]+$/);
      if (trailingPunct && !/[.,!?;:॥|]+$/.test(prev)) {
        result[result.length - 1] = prev + trailingPunct[0];
      }
      continue; // drop consecutive duplicate word
    }
    result.push(current);
  }
  return result;
}

/**
 * Deduplicates accidental consecutive identical words, multi-word phrase echoes,
 * or full repeated sentences caused by microphone feedback loops, speech engine stuttering,
 * browser auto-restart overlap, or repeated result firing.
 *
 * Guarantees:
 * - "ಅವನು ಅವನು ಅವನು ಅವನು ಅವಳಿಗೆ ಅವಳಿಗೆ" -> "ಅವನು ಅವಳಿಗೆ"
 * - "ಯಾವಾಗ ".repeat(20) -> "ಯಾವಾಗ" (collapses 10 or 20 repeats cleanly!)
 * - "ಯಾವಾಗ ಆಗುತ್ತದೆ ಯಾವಾಗ ಆಗುತ್ತದೆ" -> "ಯಾವಾಗ ಆಗುತ್ತದೆ"
 * - "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ? ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?" -> "ನನ್ನ ಮದುವೆ ಯಾವಾಗ ಆಗುತ್ತದೆ?"
 */
export function sanitizeDuplicateSpeechWords(text: string): string {
  if (!text) return "";

  let trimmed = typeof text.normalize === "function" ? text.normalize("NFC") : text;
  trimmed = trimmed.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\u00A0/g, " ").trim();
  if (!trimmed) return "";

  // 1. Sentence-level deduplication
  const rawSentences = trimmed.split(/(?<=[.!?॥|।]|\n+)\s*/).filter(Boolean);
  let dedupedText = trimmed;

  if (rawSentences.length > 1) {
    const cleanSentences: string[] = [];
    for (const sentence of rawSentences) {
      const sTrim = sentence.trim();
      if (!sTrim) continue;
      const prev = cleanSentences[cleanSentences.length - 1];
      if (prev && normToken(sTrim) === normToken(prev)) {
        continue; // drop duplicate identical sentence
      }
      cleanSentences.push(sTrim);
    }
    dedupedText = cleanSentences.join(" ");
  }

  // 2. Token-level consecutive word collapse (collapses any 10-20 word runs immediately)
  let tokens = dedupedText.split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return dedupedText;
  tokens = collapseConsecutiveTokens(tokens);

  // 3. Multi-word phrase n-gram deduplication (from 15-word phrases down to 2-word phrases)
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 15) {
    changed = false;
    iterations++;

    const maxK = Math.min(15, Math.floor(tokens.length / 2));
    for (let k = maxK; k >= 2; k--) {
      const newTokens: string[] = [];
      let i = 0;

      while (i < tokens.length) {
        // Check if tokens[i .. i+k-1] matches tokens[i+k .. i+2k-1]
        if (i + 2 * k <= tokens.length) {
          let match = true;
          for (let m = 0; m < k; m++) {
            if (normToken(tokens[i + m]) !== normToken(tokens[i + k + m])) {
              match = false;
              break;
            }
          }
          if (match) {
            // Found duplicate phrase of length k! Keep first copy, skip all consecutive repetitions
            for (let m = 0; m < k; m++) {
              newTokens.push(tokens[i + m]);
            }
            let lastSkippedEndToken = "";
            i += k; // point to second copy
            while (i + k <= tokens.length) {
              let nextMatch = true;
              for (let m = 0; m < k; m++) {
                if (normToken(newTokens[newTokens.length - k + m]) !== normToken(tokens[i + m])) {
                  nextMatch = false;
                  break;
                }
              }
              if (nextMatch) {
                lastSkippedEndToken = tokens[i + k - 1];
                i += k; // skip repeated copy
                changed = true;
              } else {
                break;
              }
            }
            if (lastSkippedEndToken && newTokens.length > 0) {
              const trailing = lastSkippedEndToken.match(/[.,!?;:॥|]+$/);
              const lastNew = newTokens[newTokens.length - 1];
              if (trailing && lastNew && !/[.,!?;:॥|]+$/.test(lastNew)) {
                newTokens[newTokens.length - 1] = lastNew + trailing[0];
              }
            }
            continue;
          }
        }

        newTokens.push(tokens[i]);
        i++;
      }

      tokens = collapseConsecutiveTokens(newTokens);
      if (changed) break; // restart scan on changed tokens
    }
  }

  return tokens.join(" ").replace(/\s+([.,!?;:॥|।])/g, "$1").trim();
}

/**
 * Merges two speech string segments cleanly while intelligently detecting and stripping
 * any suffix-prefix overlap (up to 25 words) caused by speech engine restarts or buffer repeats.
 * Never duplicates chunks if incomingSegment is already present inside baseText.
 */
export function mergeSpeechSegments(baseText: string, incomingSegment: string): string {
  const b = (baseText || "").trim();
  const inc = (incomingSegment || "").trim();
  if (!b) return sanitizeDuplicateSpeechWords(inc);
  if (!inc) return sanitizeDuplicateSpeechWords(b);

  const bClean = sanitizeDuplicateSpeechWords(b);
  const incClean = sanitizeDuplicateSpeechWords(inc);

  const bNorm = normToken(bClean);
  const incNorm = normToken(incClean);

  // If incoming segment is already entirely contained within baseText, do NOT append!
  if (bNorm.includes(incNorm)) {
    return bClean;
  }
  // If baseText is entirely contained within incoming segment (e.g. expanded transcription)
  if (incNorm.startsWith(bNorm)) {
    return incClean;
  }

  const bTokens = bClean.split(/\s+/).filter(Boolean);
  const incTokens = incClean.split(/\s+/).filter(Boolean);

  const maxOverlap = Math.min(bTokens.length, incTokens.length, 25);
  let overlapLen = 0;

  for (let len = maxOverlap; len >= 1; len--) {
    let match = true;
    for (let k = 0; k < len; k++) {
      const bWord = normToken(bTokens[bTokens.length - len + k]);
      const incWord = normToken(incTokens[k]);
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
  const merged = cleanJoin(bClean, remainingInc);
  return sanitizeDuplicateSpeechWords(merged);
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
  private callbacks: ContinuousSpeechCallbacks | null = null;

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

  private cleanupRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }
  }

  private attachEventHandlers(callbacks: ContinuousSpeechCallbacks): void {
    if (!this.recognition) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let sessionFinal = "";
      let sessionInterim = "";

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (!item || !item[0]) continue;
        const transcript = (item[0].transcript || "").trim();
        if (!transcript) continue;

        if (item.isFinal) {
          sessionFinal = mergeSpeechSegments(sessionFinal, transcript);
        } else {
          sessionInterim = mergeSpeechSegments(sessionInterim, transcript);
        }
      }

      this.currentSessionFinal = sessionFinal;
      this.currentInterim = sessionInterim;

      const currentChunk = mergeSpeechSegments(sessionFinal, sessionInterim);

      const fullCombined = this.baseText
        ? mergeSpeechSegments(this.baseText, currentChunk)
        : currentChunk;

      const sanitizedFull = sanitizeDuplicateSpeechWords(fullCombined);
      callbacks.onTranscriptUpdate(sanitizedFull, false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      const err = event?.error || "unknown";
      // Ignore routine 'no-speech' or 'aborted' errors when user pauses — we keep the engine active!
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
        // Commit current finalized transcript into baseText before starting new session cleanly
        if (this.currentSessionFinal) {
          this.baseText = mergeSpeechSegments(this.baseText, this.currentSessionFinal);
          this.currentSessionFinal = "";
        }
        this.currentInterim = "";

        if (this.restartTimeout) clearTimeout(this.restartTimeout);
        this.restartTimeout = window.setTimeout(() => {
          if (this.isExplicitlyActive) {
            // Re-instantiate recognition to ensure fresh results array and prevent Chromium buffer leaks
            this.cleanupRecognition();
            this.initRecognition();
            this.attachEventHandlers(callbacks);
            try {
              if (this.recognition) {
                this.recognition.start();
                this.isListening = true;
              }
            } catch (err) {
              console.warn("[ContinuousSpeechEngine] Restart failed:", err);
            }
          }
        }, 120);
      } else {
        if (this.currentSessionFinal) {
          this.baseText = mergeSpeechSegments(this.baseText, this.currentSessionFinal);
          this.currentSessionFinal = "";
        }
        if (callbacks.onStateChange) callbacks.onStateChange(false);
        const fullCombined = mergeSpeechSegments(this.baseText, this.currentInterim);
        const sanitizedFull = sanitizeDuplicateSpeechWords(fullCombined);
        this.currentInterim = "";
        this.baseText = sanitizedFull;
        callbacks.onTranscriptUpdate(sanitizedFull, true);
      }
    };
  }

  public start(
    initialText: string = "",
    callbacks: ContinuousSpeechCallbacks
  ): boolean {
    this.callbacks = callbacks;
    this.cleanupRecognition();
    this.initRecognition();

    if (!this.recognition) {
      if (callbacks.onError) {
        callbacks.onError("Voice recognition is not supported in this browser. Please type your question.");
      }
      return false;
    }

    // Clean initial base text without trailing duplicated whitespace
    this.baseText = sanitizeDuplicateSpeechWords((initialText || "").trim());
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

    this.attachEventHandlers(callbacks);

    try {
      this.recognition.start();
      this.isListening = true;
      if (callbacks.onStateChange) callbacks.onStateChange(true);
      return true;
    } catch (err) {
      console.warn("[ContinuousSpeechEngine] Failed to start:", err);
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

    const fullCombined = mergeSpeechSegments(this.baseText, this.currentInterim);
    const finalSanitized = sanitizeDuplicateSpeechWords(fullCombined);
    this.currentInterim = "";
    this.baseText = finalSanitized;
    return finalSanitized;
  }

  public getIsActive(): boolean {
    return this.isExplicitlyActive;
  }
}

/**
 * Fast 2-3 second AI Question Refiner using gemini-3.5-flash-lite.
 * Analyzes dictated spoken text and converts fragmented / awkward speech into a clear,
 * respectful, single-sentence astrological question in the user's selected language.
 *
 * Guaranteed latency: ≤ 2.5 seconds (protected by race timeout with instant fallback).
 */
export async function refineSpokenConsultationQuestion(params: {
  spokenQuestion: string;
  language: ConsultationLanguage;
  apiKey?: string;
  timeoutMs?: number;
}): Promise<string> {
  const { spokenQuestion, language, apiKey, timeoutMs = 2500 } = params;
  const sanitized = sanitizeDuplicateSpeechWords(spokenQuestion).trim();
  if (!sanitized || sanitized.length < 4) {
    return sanitized;
  }

  // Resolve API Key (respect explicit apiKey parameter if provided)
  const effectiveKey = (
    apiKey !== undefined
      ? apiKey
      : useAppStore.getState?.()?.geminiApiKey ||
        (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_GEMINI_API_KEY : "") ||
        ""
  ).trim();

  if (!effectiveKey) {
    return sanitized;
  }

  const targetLang = LANGUAGE_DISPLAY_NAMES[language] || "Kannada (ಕನ್ನಡ)";

  const prompt = `You are Baggona Panchanga's Vedic consultation voice question refiner.
A devotee just dictated their astrological question using voice speech-to-text in ${targetLang}.
Spoken transcript:
"${sanitized}"

TASK:
Review and refine this spoken question into a single, polished, respectful, and meaningful astrological question in ${targetLang}.

RULES:
1. Fix any speech-to-text repetition, stutter, colloquial phrasing, or incomplete spoken fragments.
2. Preserve the devotee's authentic intent (e.g., job timing, marriage prospects, business success, health, family peace, gemstone suitability).
3. Return ONLY the single refined question string in the native script of ${targetLang}.
4. Absolutely DO NOT include markdown, asterisks, quotation marks, prefixes like "Here is:", or explanations.
5. Length: exactly 1 crisp sentence.`;

  try {
    const genAI = new GoogleGenerativeAI(effectiveKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
        topP: 0.95
      }
    });

    const aiCall = (async () => {
      const res = await model.generateContent(prompt);
      const text = res.response?.text?.() || "";
      let cleaned = text.trim().replace(/^["'`«»]+|["'`«»]+$/g, "").trim();
      cleaned = cleaned.replace(/^(Here is the refined question[:\s]*|Refined question[:\s]*|Question[:\s]*|ಪ್ರಶ್ನೆ[:\s]*|प्रश्न[:\s]*|ప్రశ్న[:\s]*|கேள்வி[:\s]*)/i, "").trim();
      return sanitizeDuplicateSpeechWords(cleaned);
    })();

    const timeoutCall = new Promise<string>((resolve) => {
      setTimeout(() => resolve(sanitized), timeoutMs);
    });

    const result = await Promise.race([aiCall, timeoutCall]);
    if (result && result.length >= 3 && !result.toLowerCase().includes("error")) {
      return sanitizeDuplicateSpeechWords(result);
    }
    return sanitized;
  } catch (err) {
    console.warn("[refineSpokenConsultationQuestion] Falling back to sanitized speech:", err);
    return sanitized;
  }
}
