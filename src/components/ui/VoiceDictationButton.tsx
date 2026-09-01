import React, { useState, useRef } from "react";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";

export interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  lang?: "kn-IN" | "en-IN" | "hi-IN" | "te-IN" | "ta-IN";
  tooltip?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  transform?: (raw: string) => string;
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  lang = "kn-IN",
  tooltip = "ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ (Speak to fill)",
  className = "",
  size = "sm",
  transform
}) => {
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<SpeechRecognitionSession | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      if (sessionRef.current) {
        sessionRef.current.stopListening();
      }
      setIsListening(false);
      return;
    }

    const session = new SpeechRecognitionSession(lang);
    if (!session.isAvailable()) {
      alert("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice Input) ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }

    sessionRef.current = session;
    setIsListening(true);

    session.startListening(
      (transcript: string) => {
        const finalVal = transform ? transform(transcript) : transcript;
        onTranscript(finalVal);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      (err: string) => {
        console.warn("[VoiceDictationButton] Speech recognition error:", err);
        setIsListening(false);
      }
    );
  };

  const sizeStyles =
    size === "sm"
      ? "p-1.5 text-xs rounded-lg"
      : size === "lg"
      ? "p-2.5 text-base rounded-2xl"
      : "p-2 text-sm rounded-xl";

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isListening ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತಾಡಿ (Listening... speak now)" : tooltip}
      className={`transition-all flex items-center justify-center cursor-pointer shadow-xs ${sizeStyles} ${
        isListening
          ? "bg-red-600 text-white animate-pulse ring-2 ring-red-400 scale-110 shadow-red-500/50"
          : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 active:scale-95"
      } ${className}`}
    >
      <span className={isListening ? "animate-bounce" : ""}>
        {isListening ? "🎙️" : "🎤"}
      </span>
    </button>
  );
};
