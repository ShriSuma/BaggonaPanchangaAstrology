import React from "react";
import ReactDOM from "react-dom";

export type VahanaMuhurthaLoaderProps = {
  isKn?: boolean;
  title?: string;
  message?: string;
};

export const VahanaMuhurthaLoader: React.FC<VahanaMuhurthaLoaderProps> = ({
  isKn = true,
  title,
  message
}) => {
  if (typeof document === "undefined") return null;

  const auspiciousNakshatras = ["ಅಶ್ವಿನಿ", "ರೋಹಿಣಿ", "ಪುನರ್ವಸು", "ಪುಷ್ಯ", "ಹಸ್ತ", "ಸ್ವಾತಿ", "ಶ್ರವಣ"];

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
      aria-label="Vahana Muhurtha Computing"
    >
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-950 via-amber-950/80 to-slate-950 text-amber-100 shadow-[0_0_60px_rgba(245,158,11,0.3)] max-w-sm sm:max-w-md w-full">
        {/* Golden Sun Chariot Ambient Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Golden Divine Chariot Wheel & Yantra */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-ping opacity-60" />
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-300 animate-spin-reverse" />
          
          {/* 16-Spoke Divine Chariot Wheel */}
          <div className="absolute inset-3 rounded-full border-2 border-amber-500 animate-spin-slow">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
                <line
                  key={deg}
                  x1="50"
                  y1="4"
                  x2="50"
                  y2="50"
                  stroke="rgba(251, 191, 36, 0.6)"
                  strokeWidth="1"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>
          </div>

          {/* Orbiting Nakshatra Stars */}
          <div className="absolute inset-0 animate-spin-slow">
            {auspiciousNakshatras.map((n, i) => {
              const angle = (i * 360) / auspiciousNakshatras.length;
              const rad = (angle * Math.PI) / 180;
              const radius = 58;
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;

              return (
                <span
                  key={n}
                  className="absolute text-xs text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(${x}px, ${y}px)`,
                    marginLeft: "-6px",
                    marginTop: "-6px"
                  }}
                >
                  ⭐
                </span>
              );
            })}
          </div>

          {/* Central Sacred Chariot Emblem */}
          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex flex-col items-center justify-center text-slate-950 shadow-2xl border-2 border-amber-200 animate-pulse-celestial">
            <span className="text-2xl sm:text-3xl">🚗</span>
            <span className="text-[8px] font-mono font-black tracking-widest text-amber-950 uppercase -mt-0.5">
              ಮುಹೂರ್ತ
            </span>
          </div>
        </div>

        {/* Loading Title */}
        <h3 className="font-serif text-base sm:text-lg font-black text-amber-200 tracking-wide mb-2">
          {title ||
            (isKn
              ? "✨ ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ ಶೋಧನೆ..."
              : "✨ Computing Auspicious Vahana Muhurtha...")}
        </h3>

        {/* Narrative Status */}
        <p className="text-xs sm:text-sm text-amber-300/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ, ಲಗ್ನ ಶುದ್ಧಿ ಹಾಗೂ ಅಮೃತ ಸಿದ್ಧಿ ಯೋಗಗಳ ನಿಖರ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..."
              : "Evaluating Tithi, Vara, Nakshatra, Chandra Bala, and favorable planetary yogas...")}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-1.5 rounded-full bg-amber-950 border border-amber-500/40 overflow-hidden mt-5">
          <div className="h-full w-full shimmer-gold" />
        </div>

        {/* Bouncing Lights */}
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
