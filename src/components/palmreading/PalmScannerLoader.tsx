import React from "react";
import ReactDOM from "react-dom";

export type PalmScannerLoaderProps = {
  isKn?: boolean;
  message?: string;
};

export const PalmScannerLoader: React.FC<PalmScannerLoaderProps> = ({
  isKn = true,
  message
}) => {
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999
      }}
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden m-0"
    >
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-950/95 via-amber-900/95 to-amber-950/95 text-amber-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] max-w-sm w-full">
        {/* Animated Palm Energy Scanner */}
        <div className="relative w-32 h-36 flex items-center justify-center mb-6 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-amber-950/80 shadow-inner">
          {/* Palm Icon */}
          <div className="text-6xl text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
            ✋
          </div>

          {/* Laser Scanning Line */}
          <div
            className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_20px_#f59e0b] animate-bounce"
            style={{ animationDuration: "1.8s" }}
          ></div>

          {/* Orbiting Planetary Mount Sparkles */}
          <div className="absolute top-2 left-3 text-sm opacity-90 animate-ping">🪐</div>
          <div className="absolute bottom-2 right-3 text-sm opacity-90 animate-ping" style={{ animationDelay: "400ms" }}>🌟</div>
          <div className="absolute top-4 right-3 text-sm opacity-90 animate-ping" style={{ animationDelay: "800ms" }}>✨</div>
        </div>

        {/* Loading Header & Description */}
        <h4 className="font-serif text-base font-bold text-amber-200 tracking-wide mb-2 animate-pulse">
          {isKn ? "🖐️ ಹಸ್ತ ರೇಖೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "🖐️ Scanning Palm Lines & Mounts..."}
        </h4>
        <p className="text-xs text-amber-300/90 max-w-xs font-semibold leading-relaxed">
          {message ||
            (isKn
              ? "ಆಯುರ್ ರೇಖೆ, ಬುದ್ಧಿ ರೇಖೆ, ಹೃದಯ ರೇಖೆ ಹಾಗೂ ೭ ಗ್ರಹ ಪರ್ವತಗಳ ನಿಖರ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..."
              : "Analyzing Life Line, Head Line, Heart Line & Planetary Mounts...")}
        </p>

        {/* Loading Bar */}
        <div className="w-48 h-2 bg-amber-950 rounded-full mt-5 overflow-hidden border border-amber-400/50">
          <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>,
    document.body
  );
};
