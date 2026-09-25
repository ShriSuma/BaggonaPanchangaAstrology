import React, { useState, useEffect, useRef } from "react";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../../features/audio/aiVoiceCloneEngine";
import type { SevaLang } from "../../features/seva/sevaLocale";

interface AudioPlayerButtonProps {
  text: string;
  lang?: string;
  className?: string;
  voiceType?: "default" | "jayashree" | "dramatic" | "priest";
}

export default function AudioPlayerButton({ text, lang = "kn-IN", className = "" }: AudioPlayerButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup if unmounted while playing
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      stopClonedAudio();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      stopClonedAudio();
      setIsPlaying(false);
      return;
    }

    const rawCode = lang.split("-")[0].toLowerCase();
    const cleanLang: SevaLang = (["kn", "hi", "te", "ta", "en"].includes(rawCode) ? rawCode : "kn") as SevaLang;

    setIsPlaying(true);
    void synthesizeAndPlayClonedVoice(
      text,
      cleanLang,
      "voice_sriram_pandit",
      () => {
        setIsPlaying(false);
        cancelRef.current = null;
      },
      () => {
        setIsPlaying(true);
      }
    ).then((cancelFn) => {
      cancelRef.current = cancelFn;
    });
  };

  return (
    <button
      type="button"
      onClick={togglePlay}
      className={`inline-flex items-center justify-center rounded-full p-2 text-indigo-700 transition-colors hover:bg-indigo-100 ${
        isPlaying ? "bg-indigo-100 text-indigo-900" : ""
      } ${className}`}
      title={isPlaying ? "Stop Audio" : "Listen to Audio"}
    >
      {isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}
