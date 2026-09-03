import React from "react";
import ReactDOM from "react-dom";

export type DiksuchiCompassLoaderProps = {
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const DiksuchiCompassLoader: React.FC<DiksuchiCompassLoaderProps> = ({
  isKn = true,
  title,
  message
}) => {
  if (typeof document === "undefined") return null;

  const ashtaDikpalakas = [
    { label: "ಉ", name: "ಕುಬೇರ", deg: 0 },
    { label: "ಈ", name: "ಈಶಾನ", deg: 45 },
    { label: "ಪೂ", name: "ಇಂದ್ರ", deg: 90 },
    { label: "ಆ", name: "ಅಗ್ನಿ", deg: 135 },
    { label: "ದ", name: "ಯಮ", deg: 180 },
    { label: "ನೈ", name: "ನಿರೃತಿ", deg: 225 },
    { label: "ಪ", name: "ವರುಣ", deg: 270 },
    { label: "ವಾ", name: "ವಾಯು", deg: 315 }
  ];

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
      aria-label="Kaala Diksuchi Directional Calculation"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-950 via-teal-950/80 to-slate-950 text-amber-100 shadow-[0_0_60px_rgba(20,184,166,0.25)] max-w-sm sm:max-w-md w-full">
        {/* Divine Ambient Radial Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 8-Directional Celestial Vedic Compass */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          {/* Compass Outer Bezel */}
          <div className="absolute inset-0 rounded-full border-2 border-teal-400/50 animate-ping opacity-50" />
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-400/70 animate-spin-slow" />
          
          {/* Degree Markings and Cardinal Labels */}
          <div className="absolute inset-3 rounded-full border border-amber-500/50 bg-slate-950/60">
            {ashtaDikpalakas.map((d) => {
              const rad = ((d.deg - 90) * Math.PI) / 180;
              const radius = 54;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <div
                  key={d.name}
                  className="absolute flex items-center justify-center w-5 h-5 -ml-2.5 -mt-2.5 text-[9px] font-mono font-black text-amber-300 drop-shadow-md"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  title={d.name}
                >
                  {d.label}
                </div>
              );
            })}
          </div>

          {/* Animated Compass Magnetic Needle */}
          <div className="absolute inset-0 flex items-center justify-center animate-compass-needle pointer-events-none">
            <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">
              {/* North Pointer (Gold-Red) */}
              <polygon points="50,12 56,48 44,48" fill="#EF4444" stroke="#FDE047" strokeWidth="1.5" />
              {/* South Pointer (Silver-Teal) */}
              <polygon points="50,88 56,52 44,52" fill="#0D9488" stroke="#5EEAD4" strokeWidth="1.5" />
              {/* Center Pivot Pivot */}
              <circle cx="50" cy="50" r="5" fill="#F59E0B" stroke="#FFF" strokeWidth="2" />
            </svg>
          </div>

          {/* Central Compass Pivot Emblem */}
          <div className="relative z-10 w-9 h-9 rounded-full bg-slate-950/80 flex items-center justify-center text-base border border-amber-300 shadow-md">
            🧭
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-amber-200 tracking-wide mb-2">
          {title ||
            (isKn
              ? "✨ ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ & ಅಷ್ಟದಿಕ್ಪಾಲಕ ಆವಾಹನೆ..."
              : "✨ Aligning Ashta-Dikpalaka Celestial Compass...")}
        </h3>

        {/* Narrative Status */}
        <p className="text-xs sm:text-sm text-teal-200/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ಅಮೃತ ಮುಹೂರ್ತ, ಶುಭ-ಅಶುಭ ದಿಕ್ಕುಗಳು, ರಾಹುಕಾಲ, ಯಮಗಂಡ ಹಾಗೂ ಗುಳಿಕ ಕಾಲ ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ..."
              : "Calculating planetary hour (Hora), Choghadiya, Rahu-Kalam, and favorable directional alignments...")}
        </p>

        {/* Teal-Gold Progress Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-900 border border-teal-500/40 overflow-hidden mt-5">
          <div className="h-full w-full bg-gradient-to-r from-teal-500 via-amber-400 to-teal-400 shimmer-gold" />
        </div>

        {/* Bouncing Energy Markers */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-teal-200 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>,
    document.body
  );
};
