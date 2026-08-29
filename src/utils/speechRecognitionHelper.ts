/**
 * Baggona Panchanga Voice Dictation Engine
 * Provides browser Web Speech API integration for Kannada (`kn-IN`) voice input.
 */

export interface SpeechRecognitionResultState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

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
        this.recognition.interimResults = false;
        this.recognition.lang = this.lang;
      }
    }
  }

  public isAvailable(): boolean {
    return this.recognition !== null;
  }

  public startListening(
    onResult: (text: string) => void,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): boolean {
    if (!this.recognition) {
      if (onError) onError("Voice recognition is not supported in this browser.");
      return false;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const text = event.results[0][0].transcript;
        onResult(text.trim());
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errorMsg = event.error || "Voice capture error";
      if (onError) onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.isListening = true;
      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError(String(e));
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
