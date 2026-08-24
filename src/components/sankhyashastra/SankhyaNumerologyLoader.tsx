import React from "react";

export type SankhyaNumerologyLoaderProps = {
  isKn?: boolean;
  message?: string;
};

export const SankhyaNumerologyLoader: React.FC<SankhyaNumerologyLoaderProps> = ({
  isKn = true,
  message
}) => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/90 via-amber-900/90 to-amber-950/95 text-amber-100 shadow-2xl backdrop-blur-md">
      {/* Animated Numerology Grid & Orbit */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-6">
        {/* Outer Pulsing Golden Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 animate-ping opacity-75"></div>
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-300 animate-spin" style={{ animationDuration: "12s" }}></div>

        {/* Orbiting Numerology Digits */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
          {digits.map((num, i) => {
            const angle = (i * 360) / 9;
            const rad = (angle * Math.PI) / 180;
            const radius = 52; // px offset from center
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <span
                key={num}
                className="absolute text-xs font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-6px",
                  marginTop: "-10px"
                }}
              >
                {num}
              </span>
            );
          })}
        </div>

        {/* Central Prashna Gem Icon */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-2xl shadow-inner border border-amber-200 animate-pulse">
          🔢
        </div>
      </div>

      {/* Loading Title & Narrative */}
      <h4 className="font-serif text-base font-bold text-amber-200 tracking-wide mb-1.5 animate-pulse">
        {isKn ? "✨ ಸಂಖ್ಯಾ ಪ್ರಶ್ನಾ ಗಣಿತ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "✨ Computing Vedic Numerology Prashna..."}
      </h4>
      <p className="text-xs text-amber-300/80 max-w-xs font-medium leading-relaxed">
        {message ||
          (isKn
            ? "ಪ್ರಶ್ನಾ ಲಗ್ನ, ನಕ್ಷತ್ರ ಹಾಗೂ ಗೋಚರ ಗ್ರಹ ಸನ್ನಿವೇಶದ ಆಧಾರದಲ್ಲಿ ಸಿದ್ಧ ಉತ್ತರದ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..."
            : "Calculating Prashna Lagna, Digital Root & Ephemeris Transits...")}
      </p>

      {/* Animated Loading Dots */}
      <div className="flex gap-1.5 mt-4">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2 h-2 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-2 h-2 rounded-full bg-amber-200 animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
    </div>
  );
};
