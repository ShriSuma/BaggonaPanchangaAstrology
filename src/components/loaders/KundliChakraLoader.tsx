import React from "react";
import ReactDOM from "react-dom";

export type KundliChakraLoaderProps = {
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const KundliChakraLoader: React.FC<KundliChakraLoaderProps> = ({
  isKn = true,
  title,
  message
}) => {
  if (typeof document === "undefined") return null;

  const grahaSymbols = [
    { icon: "☀️", name: "ಸೂರ್ಯ", color: "text-amber-400" },
    { icon: "🌙", name: "ಚಂದ್ರ", color: "text-slate-100" },
    { icon: "♂️", name: "ಕುಜ", color: "text-red-400" },
    { icon: "☿", name: "ಬುಧ", color: "text-emerald-400" },
    { icon: "🪐", name: "ಗುರು", color: "text-yellow-300" },
    { icon: "✨", name: "ಶುಕ್ರ", color: "text-rose-300" },
    { icon: "♄", name: "ಶನಿ", color: "text-blue-400" },
    { icon: "🐉", name: "ರಾಹು", color: "text-indigo-400" },
    { icon: "☄️", name: "ಕೇತು", color: "text-amber-500" }
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
      aria-label="Vedic Kundli Computing"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-950 via-amber-950/90 to-slate-950 text-amber-100 shadow-[0_0_60px_rgba(245,158,11,0.35)] max-w-sm sm:max-w-md w-full">
        {/* Divine Ambient Glow Background */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Outer Rotating Navagraha Celestial Chakra */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          {/* Pulsing Outer Radiance */}
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/40 animate-ping opacity-60" />
          
          {/* Counter-rotating Zodiac Geometry Ring */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-300/60 animate-spin-reverse" />
          
          {/* Rotating Zodiac Wheel with 12 Spoke Divisions */}
          <div className="absolute inset-3 rounded-full border-2 border-amber-500/70 animate-spin-slow">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="4"
                  x2="50"
                  y2="14"
                  stroke="rgba(251, 191, 36, 0.7)"
                  strokeWidth="1.5"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>
          </div>

          {/* Orbiting Navagraha Planets */}
          <div className="absolute inset-0 animate-spin-slow">
            {grahaSymbols.map((g, i) => {
              const angle = (i * 360) / grahaSymbols.length;
              const rad = (angle * Math.PI) / 180;
              const radius = 62; // px offset from center
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <div
                  key={g.name}
                  className="absolute flex items-center justify-center w-6 h-6 -ml-3 -mt-3 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  title={g.name}
                >
                  <span className="text-xs sm:text-sm">{g.icon}</span>
                </div>
              );
            })}
          </div>

          {/* Central Sacred Golden Lagna Mandala */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex flex-col items-center justify-center text-slate-950 shadow-2xl border-2 border-amber-200 animate-pulse-celestial">
            <span className="text-xl sm:text-2xl font-serif">ॐ</span>
            <span className="text-[9px] font-mono font-black tracking-widest text-amber-950 uppercase -mt-0.5">
              ಲಗ್ನ
            </span>
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-amber-200 tracking-wide mb-2">
          {title ||
            (isKn
              ? "✨ ವೇದೋಕ್ತ ಜನನ ಕುಂಡಲಿ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..."
              : "✨ Computing Authentic Vedic Janana Kundli...")}
        </h3>

        {/* Narrative Status */}
        <p className="text-xs sm:text-sm text-amber-300/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ಗ್ರಹ ಸ್ಪಷ್ಟ, ನವಾಂಶ, ಭಾವ ಸಂಧಿ ಹಾಗೂ ೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ಮಹಾದಶಾ-ಭುಕ್ತಿ ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತಿದೆ..."
              : "Calculating planetary longitudes, Navamsha, Bhava sandhis & 120-year Vimshottari dasha...")}
        </p>

        {/* Gold Shimmer Progress Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 overflow-hidden mt-5">
          <div className="h-full w-full shimmer-gold" />
        </div>

        {/* Animated Bouncing Jewels */}
        <div className="flex gap-2 mt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>,
    document.body
  );
};
