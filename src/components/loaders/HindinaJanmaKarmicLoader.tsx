import React from "react";
import ReactDOM from "react-dom";

export type HindinaJanmaKarmicLoaderProps = {
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const HindinaJanmaKarmicLoader: React.FC<HindinaJanmaKarmicLoaderProps> = ({
  isKn = true,
  title,
  message
}) => {
  if (typeof document === "undefined") return null;

  const karmicRunes = [
    { label: "ಸಂಚಿತ", desc: "Past Accumulation" },
    { label: "ಪ್ರಾರಬ್ಧ", desc: "Present Karma" },
    { label: "ಆಗಾಮಿ", desc: "Future Path" },
    { label: "ಋಣ", desc: "Karmic Debt" },
    { label: "ಪುಣ್ಯ", desc: "Divine Merit" },
    { label: "ಮೋಕ್ಷ", desc: "Liberation" }
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
      aria-label="Karmic Inquest Computing"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-purple-400/80 bg-gradient-to-b from-slate-950 via-purple-950/90 to-slate-950 text-purple-100 shadow-[0_0_60px_rgba(168,85,247,0.3)] max-w-sm sm:max-w-md w-full">
        {/* Mystical Purple Nebula Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Rebirth Samsara Wheel & Karmic Lotus */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          {/* Pulsing Karmic Halo */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/40 animate-ping opacity-60" />
          
          {/* Revolving Samsara Rings */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-purple-300/60 animate-spin-reverse" />
          <div className="absolute inset-3 rounded-full border-2 border-amber-400/70 animate-spin-slow" />

          {/* Orbiting Karmic Pillars */}
          <div className="absolute inset-0 animate-karmic-orbit">
            {karmicRunes.map((k, i) => {
              const angle = (i * 360) / karmicRunes.length;
              const rad = (angle * Math.PI) / 180;
              const radius = 58;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <div
                  key={k.label}
                  className="absolute flex items-center justify-center px-1.5 py-0.5 rounded-md bg-purple-900/90 border border-purple-400/80 -ml-4 -mt-2.5 text-[9px] font-mono font-black text-amber-200 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)] shadow-md"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  title={k.desc}
                >
                  {k.label}
                </div>
              );
            })}
          </div>

          {/* Central Cosmic Rebirth Lotus Emblem */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-amber-500 flex flex-col items-center justify-center text-white shadow-2xl border-2 border-purple-200 animate-pulse-celestial">
            <span className="text-xl sm:text-2xl font-serif">📜</span>
            <span className="text-[8px] font-mono font-black tracking-widest text-amber-200 uppercase -mt-0.5">
              ಕರ್ಮ
            </span>
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-purple-200 tracking-wide mb-2">
          {title ||
            (isKn
              ? "✨ ಹಿಂದಿನ ಜನ್ಮದ ಕರ್ಮ ರಹಸ್ಯ ದರ್ಶನ..."
              : "✨ Unlocking Past-Life Karmic Secrets...")}
        </h3>

        {/* Narrative Status */}
        <p className="text-xs sm:text-sm text-purple-300/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ಪೂರ್ವ ಪುಣ್ಯ, ಕರ್ಮ ಫಲ, ಜನ್ಮಾಂತರ ಋಣಾನುಬಂಧ ಹಾಗೂ ಪರಿಹಾರ ಮಾರ್ಗ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..."
              : "Synthesizing Purva Punya, Sanchita Karma, and ancestral karmic alignments...")}
        </p>

        {/* Purple-Gold Shimmer Progress Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-slate-900 border border-purple-500/40 overflow-hidden mt-5">
          <div className="h-full w-full bg-gradient-to-r from-purple-600 via-amber-400 to-purple-400 shimmer-gold" />
        </div>

        {/* Bouncing Karmic Beads */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>,
    document.body
  );
};
