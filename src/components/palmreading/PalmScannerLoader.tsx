import React from "react";

export type PalmScannerLoaderProps = {
  isKn?: boolean;
  message?: string;
};

export const PalmScannerLoader: React.FC<PalmScannerLoaderProps> = ({
  isKn = true,
  message
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-950/90 via-amber-900/90 to-amber-950/95 text-amber-100 shadow-2xl backdrop-blur-md">
      {/* Animated Palm Energy Scanner */}
      <div className="relative w-32 h-36 flex items-center justify-center mb-6 overflow-hidden rounded-2xl border border-amber-400/30 bg-amber-950/60 shadow-inner">
        {/* Palm Icon */}
        <div className="text-6xl text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.7)] animate-pulse">
          ✋
        </div>

        {/* Laser Scanning Line */}
        <div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce"
          style={{ animationDuration: "2s" }}
        ></div>

        {/* Orbiting Planetary Mount Sparkles */}
        <div className="absolute top-2 left-3 text-xs opacity-80 animate-ping">🪐</div>
        <div className="absolute bottom-2 right-3 text-xs opacity-80 animate-ping" style={{ animationDelay: "500ms" }}>🌟</div>
        <div className="absolute top-4 right-3 text-xs opacity-80 animate-ping" style={{ animationDelay: "1000ms" }}>✨</div>
      </div>

      {/* Loading Header & Description */}
      <h4 className="font-serif text-base font-bold text-amber-200 tracking-wide mb-1.5 animate-pulse">
        {isKn ? "🖐️ ಹಸ್ತ ರೇಖೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "🖐️ Scanning Palm Lines & Mounts..."}
      </h4>
      <p className="text-xs text-amber-300/80 max-w-xs font-medium leading-relaxed">
        {message ||
          (isKn
            ? "ಆಯುರ್ ರೇಖೆ, ಬುದ್ಧಿ ರೇಖೆ, ಹೃದಯ ರೇಖೆ ಹಾಗೂ ೭ ಗ್ರಹ ಪರ್ವತಗಳ ನಿಖರ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..."
            : "Analyzing Life Line, Head Line, Heart Line & Planetary Mounts...")}
      </p>

      {/* Loading Bar */}
      <div className="w-48 h-1.5 bg-amber-950/80 rounded-full mt-4 overflow-hidden border border-amber-500/40">
        <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
