import React from "react";

export interface BaggonaBookLoaderModalProps {
  isOpen: boolean;
  samvatsaraKn: string;
  samvatsaraEn: string;
  shakaYear: number;
  gregorianYears: string;
  progressPercent: number;
  currentPage: number;
  totalPages?: number;
  stageTextKn: string;
  isReady: boolean;
  downloadUrl: string | null;
  fileName: string;
  fileSizeBytes?: number;
  errorMessage?: string | null;
  onClose: () => void;
  onPrintNative?: () => void;
}

export const BaggonaBookLoaderModal: React.FC<BaggonaBookLoaderModalProps> = ({
  isOpen,
  samvatsaraKn,
  shakaYear,
  gregorianYears,
  progressPercent,
  currentPage,
  totalPages = 104,
  stageTextKn,
  isReady,
  downloadUrl,
  fileName,
  fileSizeBytes,
  errorMessage,
  onClose,
  onPrintNative
}) => {
  if (!isOpen) return null;

  const fileSizeMb = fileSizeBytes ? (fileSizeBytes / 1024 / 1024).toFixed(2) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Front Cover Container (Exact replica style of Baggona Panchanga front page) */}
      <div
        className="relative w-full max-w-lg bg-[#FAF5E6] border-8 border-double border-amber-800 rounded-3xl p-6 md:p-8 shadow-2xl text-amber-950 font-serif overflow-hidden ring-4 ring-amber-400/40 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dedicated Close Button (Always accessible) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 md:w-9 md:h-9 rounded-full bg-amber-900 hover:bg-amber-950 text-amber-100 hover:text-white flex items-center justify-center font-black text-sm md:text-base shadow-xl border-2 border-amber-400 transition-all hover:scale-110 active:scale-90 cursor-pointer"
          title="ಮುಚ್ಚಿ (Close / Dismiss)"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 text-xl text-amber-700 select-none">卐</div>
        <div className="absolute top-2 right-12 text-xl text-amber-700 select-none">卐</div>
        <div className="absolute bottom-2 left-2 text-xl text-amber-700 select-none">🕉️</div>
        <div className="absolute bottom-2 right-2 text-xl text-amber-700 select-none">🕉️</div>

        {/* Front Cover Header */}
        <div className="text-center space-y-1 pb-3 border-b-2 border-amber-800/40">
          <div className="text-xs font-bold tracking-widest text-amber-800">
            ॥ ಶ್ರೀ ಕುಲದೇವತಾ ಪ್ರಸನ್ನ ॥
          </div>
          <div className="text-3xl md:text-4xl font-black text-amber-950 tracking-wider">
            ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
          </div>
          <div className="text-sm font-black text-amber-900">
            ಶ್ರೀ {samvatsaraKn} ಸಂವತ್ಸರದ ವಾರ್ಷಿಕ ಮುದ್ರಣ ಆವೃತ್ತಿ ({gregorianYears})
          </div>
          <div className="text-[11px] font-bold text-amber-800/90 font-sans">
            ಶ್ರೀ ಶಕ {shakaYear} • ಗೋಕರ್ಣ ದೃಗ್ಗಣಿತ ಪದ್ಧತಿ • ೧೦೪ ಪುಟಗಳ ಅಧಿಕೃತ ಮುದ್ರಣ
          </div>
        </div>

        {/* Status: ERROR */}
        {errorMessage ? (
          <div className="my-6 p-4 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 font-sans space-y-3">
            <div className="flex items-center gap-2 font-black text-sm">
              <span className="text-xl">⚠️</span>
              <span>ಪಿಡಿಎಫ್ ರಚನೆಯಲ್ಲಿ ಅಡಚಣೆ ಉಂಟಾಗಿದೆ (Error generating PDF)</span>
            </div>
            <p className="text-xs text-red-800">{errorMessage}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-700 text-white text-xs font-black rounded-xl hover:bg-red-800 shadow"
              >
                ಮುಚ್ಚಿ (Close)
              </button>
            </div>
          </div>
        ) : isReady && downloadUrl ? (
          /* Status: READY WITH DIRECT DOWNLOAD */
          <div className="my-6 space-y-4">
            <div className="p-4 bg-emerald-50 border-2 border-emerald-600 rounded-2xl text-emerald-950 text-center font-sans space-y-2 shadow-inner">
              <div className="text-3xl">🎉 📖 🪔</div>
              <h3 className="font-black text-base text-emerald-900">
                ನಿಮ್ಮ ೧೦೪-ಪುಟಗಳ ಪಂಚಾಂಗ ಪುಸ್ತಕ ಸಿದ್ಧವಾಗಿದೆ!
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                ಸಂಪೂರ್ಣ ೧ ರಿಂದ ೧೦೪ ಪುಟಗಳು, ಪಾರಂಪರಿಕ ಚೌಕಟ್ಟು, ಮತ್ತು ಶುದ್ಧ ಕನ್ನಡ ಫಾಂಟ್‌ನೊಂದಿಗೆ ರಚಿತವಾಗಿದೆ.
              </p>
              {fileSizeMb && (
                <div className="inline-block text-[11px] font-bold bg-emerald-200/70 text-emerald-900 px-3 py-0.5 rounded-full">
                  ಗಾತ್ರ: {fileSizeMb} MB • 104 ಪುಟಗಳು (A4)
                </div>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col gap-2.5 font-sans">
              <a
                href={downloadUrl}
                download={fileName}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 border border-emerald-300 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                <span className="text-xl">📥</span>
                <span>ಈಗಲೇ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Download File)</span>
              </a>

              {onPrintNative && (
                <button
                  onClick={onPrintNative}
                  className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border border-amber-400/80 shadow flex items-center justify-center gap-2 transition-all"
                >
                  <span>🖨️</span>
                  <span>ನೇರ ಮುದ್ರಣ ಅಥವಾ ಬ್ರೌಸರ್ ಪಿಡಿಎಫ್ ಉಳಿಸಿ (Native Print / Save)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors text-center"
              >
                ಮುಕ್ತಾಯ (Done / Close)
              </button>
            </div>
          </div>
        ) : (
          /* Status: IN PROGRESS (REAL PAGE-BY-PAGE TICKER) */
          <div className="py-4 space-y-4">
            {/* Animated Sacred Graha Mandala Chakra */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Spinning outer mandala ring */}
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-600/60 animate-[spin_6s_linear_infinite]" />
                {/* Pulsing inner ring */}
                <div className="absolute inset-2 rounded-full border-2 border-amber-500/40 animate-ping" />
                {/* Golden Diya / Kalasha emblem */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg border-2 border-amber-700">
                  <span className="text-2xl animate-bounce">🪔</span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-2xl font-black text-amber-950 font-mono tracking-wider">
                  {progressPercent}%
                </span>
                <div className="text-xs font-black text-amber-800 uppercase tracking-wider mt-0.5">
                  ಪುಟ {currentPage} / {totalPages} ಸಂಸ್ಕರಣೆಯಲ್ಲಿದೆ
                </div>
              </div>
            </div>

            {/* Live Stage Progress Bar */}
            <div className="space-y-2 bg-white/80 p-3.5 rounded-2xl border border-amber-300 shadow-inner font-sans">
              <div className="flex justify-between items-center text-xs font-black text-amber-950">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  <span>ಲೈವ್ ಪುಟ ರಚನೆ (Live Progress):</span>
                </span>
                <span className="font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <div className="w-full h-3 bg-amber-200/70 rounded-full overflow-hidden p-0.5 border border-amber-300">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 rounded-full transition-all duration-150 shadow-sm"
                  style={{ width: `${Math.max(progressPercent, 2)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-700 font-medium text-center italic min-h-[2em] flex items-center justify-center truncate px-2">
                {stageTextKn || "ಪುಸ್ತಕದ ಪುಟಗಳು ಸಿದ್ಧವಾಗುತ್ತಿವೆ..."}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Verification & Heritage Stamp */}
        <div className="mt-2 pt-3 border-t border-amber-800/30 flex items-center justify-between text-[10px] text-amber-900 font-bold font-sans">
          <span>ಸಂಪಾದಕರು: ಶ್ರೀ ರಾಮ ಪಂಡಿತ - ಶ್ರೀ ಶಂಕರನಾರಾಯಣ ಪಂಡಿತ</span>
          {isReady ? (
            <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              <span>✅</span>
              <span>೧೦೪ ಪುಟಗಳು ಸಿದ್ಧ</span>
            </span>
          ) : (
            <span className="text-amber-700 animate-pulse">ದೃಗ್ಗಣಿತ ಮುದ್ರಣ ಚಾಲ್ತಿಯಲ್ಲಿದೆ...</span>
          )}
        </div>

        {/* User Dismiss Action */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-300/90 text-amber-950 text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 border border-amber-500/50 shadow-sm cursor-pointer"
          >
            <span>✕</span>
            <span>{isReady ? "ಸಂವಾದ ಮುಚ್ಚಿ (Close Dialog)" : "ರದ್ದುಮಾಡಿ / ಮುಚ್ಚಿ (Cancel / Close)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
