/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_NARRATIVE_API_URL?: string;
  readonly VITE_NARRATIVE_API_KEY?: string;
  readonly VITE_PREDICTION_API_URL?: string;
  readonly VITE_PREDICTION_API_KEY?: string;
  /** Optional override for translation proxy (default `/api/translate`). */
  readonly VITE_TRANSLATE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?raw" {
  const content: string;
  export default content;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart?: (() => void) | null;
  onresult?: ((event: SpeechRecognitionEvent) => void) | null;
  onerror?: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend?: (() => void) | null;
}

interface Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

