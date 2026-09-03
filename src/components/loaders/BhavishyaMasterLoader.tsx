import React from "react";
import ReactDOM from "react-dom";

export type BhavishyaMasterLoaderProps = {
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const BhavishyaMasterLoader: React.FC<BhavishyaMasterLoaderProps> = ({
  isKn = true,
  title,
  message
}) => {
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999
      }}
      className="fixed inset-0 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden m-0 select-none animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Vedic Consultation & Report Synthesis"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-indigo-400/80 bg-gradient-to-b from-slate-950 via-indigo-950/90 to-slate-950 text-indigo-100 shadow-[0_0_60px_rgba(99,102,241,0.35)] max-w-sm sm:max-w-md w-full">
        {/* Indigo-Gold Radiance Halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Sacred Palm Leaf Manuscript & Cosmic Yantra */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping opacity-60" />
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-300 animate-spin-reverse" />
          
          {/* Rotating Sri Yantra Geometry */}
          <div className="absolute inset-3 rounded-full border-2 border-indigo-500/80 animate-spin-slow">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <polygon points="50,15 80,75 20,75" fill="none" stroke="rgba(165, 180, 252, 0.5)" strokeWidth="1.5" />
              <polygon points="50,85 80,25 20,25" fill="none" stroke="rgba(251, 191, 36, 0.5)" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(165, 180, 252, 0.4)" strokeWidth="1" />
            </svg>
          </div>

          {/* Central Sacred Palm-Leaf Manuscript Emblem */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-700 via-indigo-600 to-amber-500 flex flex-col items-center justify-center text-white shadow-2xl border-2 border-indigo-200 animate-pulse-celestial">
            <span className="text-2xl sm:text-3xl">📄</span>
            <span className="text-[8px] font-mono font-black tracking-widest text-amber-200 uppercase -mt-0.5">
              ಭವಿಷ್ಯ
            </span>
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-indigo-200 tracking-wide mb-2">
          {title ||
            (isKn
              ? "✨ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ AI ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ..."
              : "✨ Synthesizing Baggona Vedic Analysis...")}
        </h3>

        {/* Narrative Status */}
        <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ಋಷಿ ಪರಂಪರೆ, ೧೨ ಭಾವ ಫಲ, ಯೋಗ-ದೋಷ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕ ಮಾರ್ಗದರ್ಶನ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
              : "Evaluating 12 astrological houses, transit impacts, auspicious yogas, and remedial guidance...")}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-900 border border-indigo-500/40 overflow-hidden mt-5">
          <div className="h-full w-full bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-400 shimmer-gold" />
        </div>

        {/* Bouncing Lights */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>,
    document.body
  );
};
