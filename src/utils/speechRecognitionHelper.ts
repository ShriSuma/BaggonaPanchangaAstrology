/**
 * Baggona Panchanga Voice Dictation Engine
 * Provides browser Web Speech API integration for Kannada (`kn-IN`) and multilingual voice input.
 * Specially hardened for mobile calls, in-call audio locks, and helpful error diagnostics.
 */

export interface SpeechRecognitionResultState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export interface SpeechErrorInfo {
  code: string;
  userFriendlyMessage: string;
  suggestion: string;
  isCallRelated: boolean;
}

/**
 * Translates low-level browser speech errors into compassionate, actionable diagnostics,
 * specifically handling the common case where an active phone call or mute lock disables audio capture.
 */
export function parseSpeechError(rawErr: any, lang = "kn"): SpeechErrorInfo {
  const isKn = lang.startsWith("kn");
  const code = (typeof rawErr === "string" ? rawErr : rawErr?.error || String(rawErr || "")).toLowerCase();

  if (
    code.includes("audio-capture") ||
    code.includes("trackstart") ||
    code.includes("device_in_use") ||
    code.includes("could not start audio")
  ) {
    return {
      code: "audio-capture",
      userFriendlyMessage: isKn
        ? "ಮೈಕ್ರೋಫೋನ್ ಆಡಿಯೊ ಲಭ್ಯವಿಲ್ಲ. ನೀವು ಫೋನ್ ಕರೆಯಲ್ಲಿದ್ದರೆ (Call) ಅಥವಾ ಮ್ಯೂಟ್ ಆಗಿದ್ದರೆ ಮೊಬೈಲ್ ಬ್ರೌಸರ್ ಆಡಿಯೊ ಪ್ರವೇಶವನ್ನು ನಿರ್ಬಂಧಿಸುತ್ತದೆ."
        : "Microphone audio unavailable. If you are on an active phone call or muted, your mobile browser restricts audio access.",
      suggestion: isKn
        ? "ಕರೆಯನ್ನು ಅನ್‌ಮ್ಯೂಟ್ ಮಾಡಿ / ಸ್ಪೀಕರ್‌ಗೆ ಬದಲಾಯಿಸಿ, ಅಥವಾ ಕೀಬೋರ್ಡ್ ಮೈಕ್ ಬಳಸಿ ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ."
        : "Unmute the call / switch to speaker, or use your phone keyboard's built-in mic.",
      isCallRelated: true
    };
  }

  if (code.includes("not-allowed") || code.includes("permission")) {
    return {
      code: "not-allowed",
      userFriendlyMessage: isKn
        ? "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ ಅಥವಾ ಕರೆಯ ಗೌಪ್ಯತೆಯ ಕಾರಣ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ."
        : "Microphone permission denied or restricted during an active call.",
      suggestion: isKn
        ? "ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ ಅನುಮತಿ ನೀಡಿ, ಅಥವಾ ಕೀಬೋರ್ಡ್ ಬಳಸಿ ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ."
        : "Allow mic in browser settings, or type question directly using keyboard.",
      isCallRelated: true
    };
  }

  if (code.includes("no-speech")) {
    return {
      code: "no-speech",
      userFriendlyMessage: isKn
        ? "ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮೈಕ್ ಮ್ಯೂಟ್ ಆಗಿರಬಹುದು ಅಥವಾ ಧ್ವನಿ ತುಂಬಾ ಕಡಿಮೆಯಿರಬಹುದು."
        : "No speech detected. Mic might be muted or volume was too low.",
      suggestion: isKn
        ? "ಮೈಕ್ ಹತ್ತಿರ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗಿನ ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳ ಪಟ್ಟಿಯಿಂದ ಆರಿಸಿ."
        : "Speak clearly near the mic or tap one of the quick questions below.",
      isCallRelated: true
    };
  }

  if (code.includes("network")) {
    return {
      code: "network",
      userFriendlyMessage: isKn
        ? "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಗೆ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ಸಿಗುತ್ತಿಲ್ಲ."
        : "Network connection required for voice recognition.",
      suggestion: isKn
        ? "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ."
        : "Check internet connection or type manually.",
      isCallRelated: false
    };
  }

  if (code.includes("aborted")) {
    return {
      code: "aborted",
      userFriendlyMessage: isKn
        ? "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ರದ್ದುಗೊಂಡಿದೆ."
        : "Speech recognition was stopped.",
      suggestion: isKn
        ? "ಮತ್ತೊಮ್ಮೆ ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ."
        : "Tap mic again to retry.",
      isCallRelated: false
    };
  }

  return {
    code: code || "unknown",
    userFriendlyMessage: isKn
      ? `ಧ್ವನಿ ಇನ್‌ಪುಟ್ ದೋಷ (${rawErr}).`
      : `Speech recognition error (${rawErr}).`,
    suggestion: isKn
      ? "ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ."
      : "Please try again or type question using your keyboard.",
    isCallRelated: false
  };
}

/**
 * Pre-checks and requests audio permission via getUserMedia to unlock audio session.
 */
export async function requestMicrophoneAccess(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.warn("[SpeechRecognition] getUserMedia pre-check failed:", err);
    return false;
  }
}

/**
 * Common intuitive questions for Sankhya Shastra to allow 1-tap asking while on a call.
 */
export const SANKHYA_QUICK_QUESTIONS_KN = [
  { id: "job", label: "ಉದ್ಯೋಗ ಬಡ್ತಿ", text: "ನನಗೆ ಈ ವರ್ಷ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ ಮತ್ತು ಏಳಿಗೆ ಸಿಗುವುದೇ?" },
  { id: "marriage", label: "ಮದುವೆ ಕಾಲ", text: "ನನ್ನ ವಿವಾಹ ಕಂಕಣ ಭಾಗ್ಯ ಯಾವಾಗ ಕೂಡಿಬರುತ್ತದೆ?" },
  { id: "business", label: "ವ್ಯಾಪಾರ ಆರಂಭ", text: "ಹೊಸ ವ್ಯಾಪಾರ ಅಥವಾ ಹೂಡಿಕೆ ಆರಂಭಿಸಲು ಇದು ಸೂಕ್ತ ಕಾಲವೇ?" },
  { id: "finance", label: "ಆರ್ಥಿಕ ಸಂಕಷ್ಟ", text: "ನನ್ನ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಮತ್ತು ಸಾಲದ ಬಾಧೆ ಯಾವಾಗ ಪರಿಹಾರವಾಗುತ್ತದೆ?" },
  { id: "health", label: "ಆರೋಗ್ಯ ಸುಧಾರಣೆ", text: "ನನ್ನ ದೀರ್ಘಕಾಲದ ಅನಾರೋಗ್ಯ ಯಾವಾಗ ಗುಣಮುಖವಾಗುತ್ತದೆ?" },
  { id: "property", label: "ಮನೆ / ಭೂಮಿ", text: "ನನ್ನ ಸ್ವಂತ ಮನೆ ಅಥವಾ ಜಮೀನು ಖರೀದಿ ಯೋಗ ಯಾವಾಗ ಇದೆ?" },
  { id: "lost", label: "ಕಳೆದುಹೋದ ವಸ್ತು", text: "ನನ್ನ ಕಳೆದುಹೋದ ಅಮೂಲ್ಯ ವಸ್ತು ಮರಳಿ ಸಿಗುವುದೇ?" },
  { id: "abroad", label: "ವಿದೇಶ ಯಾನ", text: "ನನಗೆ ವಿದೇಶ ಪ್ರಯಾಣ ಅಥವಾ ವಿದೇಶದಲ್ಲಿ ಉದ್ಯೋಗ ಯೋಗವಿದೆಯೇ?" }
];

export const SANKHYA_QUICK_QUESTIONS_EN = [
  { id: "job", label: "Career Growth", text: "Will I get a career promotion and growth this year?" },
  { id: "marriage", label: "Marriage Timing", text: "When will my marriage take place and obstacles clear?" },
  { id: "business", label: "New Business", text: "Is this favorable timing to start a new business or investment?" },
  { id: "finance", label: "Financial Relief", text: "When will my financial stress and loans be resolved?" },
  { id: "health", label: "Health Recovery", text: "When will my health and vitality improve?" },
  { id: "property", label: "Home / Property", text: "When is the favorable time for me to buy property or a home?" },
  { id: "lost", label: "Lost Item", text: "Will I be able to recover my lost valuable item?" },
  { id: "abroad", label: "Foreign Travel", text: "Do I have favorable planetary indications for foreign travel?" }
];

export class SpeechRecognitionSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private isListening = false;
  private lang: string;

  constructor(lang = "kn-IN") {
    this.lang = lang;
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.lang;
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onResult: (text: string, isFinal?: boolean) => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): boolean {
    if (!this.recognition) {
      if (onError) {
        onError("Voice recognition is not supported in this browser.");
      }
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      if (text) {
        onResult(text, Boolean(finalTranscript));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorInfo = parseSpeechError(event?.error || event, this.lang);
      if (onError) onError(errorInfo.userFriendlyMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      const errorInfo = parseSpeechError(e?.message || e, this.lang);
      if (onError) onError(errorInfo.userFriendlyMessage);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }
}
