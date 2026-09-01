import React from "react";
import { stopAllAudioGlobal } from "../../features/audio/globalAudioManager";

interface VedicAudioLoaderModalProps {
  isOpen: boolean;
  onCancel?: () => void;
  titleKn?: string;
  titleEn?: string;
  subtitleKn?: string;
}

export const VedicAudioLoaderModal: React.FC<VedicAudioLoaderModalProps> = ({
  isOpen,
  onCancel,
  titleKn = "ಶ್ರೀ ದೈವಜ್ಞರ ದೈವಿಕ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
  titleEn = "Synthesizing Sacred Priest Voice (Sarvam AI Indic Neural TTS)...",
  subtitleKn = "ವೇದ ಮಂತ್ರಗಳು & ಪವಿತ್ರ ಸಂಕಲ್ಪದ ಆಡಿಯೋ ಸಿದ್ಧವಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ೨-೩ ಕ್ಷಣ ನಿರೀಕ್ಷಿಸಿ."
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    stopAllAudioGlobal();
    if (onCancel) onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
    >
      <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-400/90 bg-gradient-to-b from-stone-950 via-neutral-900 to-black p-6 md:p-8 text-center text-white shadow-2xl space-y-6">
        {/* Glow effect */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Big Animated Sacred Diya / Spinner Icon */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600/30 via-yellow-500/20 to-amber-400/30 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
          <span className="text-5xl animate-bounce">🪔</span>
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-300 border-r-transparent border-b-yellow-400 border-l-transparent animate-spin" />
        </div>

        {/* Titles */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
            ॥ ವೇದ ನಾದ ಸಂಶ್ಲೇಷಣೆ ॥
          </span>
          <h3 className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 font-serif">
            {titleKn}
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed font-medium">
            {subtitleKn}
          </p>
          <p className="text-[10px] text-stone-400">
            {titleEn}
          </p>
        </div>

        {/* Pulsing Loading Bar */}
        <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden border border-amber-500/20">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full w-2/3 rounded-full animate-pulse mx-auto" />
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="w-full py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold transition-all border border-stone-600/50 flex items-center justify-center gap-2"
        >
          <span>✕</span>
          <span>ರದ್ದುಗೊಳಿಸಿ (Cancel Audio)</span>
        </button>
      </div>
    </div>
  );
};
