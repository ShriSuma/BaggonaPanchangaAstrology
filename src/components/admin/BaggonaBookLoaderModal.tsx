import React, { useEffect, useState } from "react";

export interface BaggonaBookLoaderModalProps {
  isOpen: boolean;
  samvatsaraKn: string;
  samvatsaraEn: string;
  shakaYear: number;
  gregorianYears: string;
  onComplete: () => void;
  onClose?: () => void;
}

const GENERATION_STAGES = [
  { progress: 10, pageRange: "ಪುಟ ೧–೮", textKn: "ಅವತರಣಿಕೆ (ಪರಿವಿಡಿ), ರಾಹು-ಗುಳಿಕಕಾಲ & ಸ್ವರ್ಣವಲ್ಲೀ/ಇಡಗುಂಜಿ ವಾರ್ಷಿಕ ಉತ್ಸವಗಳು..." },
  { progress: 25, pageRange: "ಪುಟ ೯–೧೪", textKn: "ಪ್ರಸ್ತಾವನೆ, ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ತಿಥಿ, ನವನಾಯಕ ಫಲಂ, ಆರ್ದ್ರಾ ಪ್ರವೇಶ & ಗ್ರಹಣಗಳು..." },
  { progress: 42, pageRange: "ಪುಟ ೧೫–೨೫", textKn: "ಶುಭಕಾರ್ಯ ನಕ್ಷತ್ರಗಳು, ವಾರ್ಷಿಕ ಹಬ್ಬ-ಹುಣ್ಣಿಮೆಗಳು & ದ್ವಾದಶ ರಾಶಿಗಳ ವರ್ಷಭವಿಷ್ಯ..." },
  { progress: 65, pageRange: "ಪುಟ ೨೬–೩೯", textKn: "ಗೋಕರ್ಣ ಉತ್ಸವಗಳು, ಆಶೌಚ ನಿರ್ಣಯ (೪೦ ನಿಯಮಗಳು), ಮುಹೂರ್ತಗಳು & ವಾಸ್ತುಮಂಡಲ..." },
  { progress: 85, pageRange: "ಪುಟ ೪೦–೯೧", textKn: "ದೈನಂದಿನ ಪಂಚಾಂಗಾಂಗ ದ್ವಿಪುಟಗಳು (೧೦ ಕಾಲಂ), ದಿವಾ ಲಗ್ನಗಳು & ಮಾಸಾಂತ ಗ್ರಹಚಕ್ರಗಳು..." },
  { progress: 95, pageRange: "ಪುಟ ೯೨–೧೦೦", textKn: "ಅಷ್ಟಕೂಟ ೩೬ ಗುಣ ಕೋಷ್ಟಕ, ಗೋಕರ್ಣ ಲಗ್ನಸ್ಫುಟ ಸಾರಣಿ & ರಾಜಯೋಗ ಚಕ್ರ..." },
  { progress: 100, pageRange: "ಪುಟ ೧೦೧–೧೦೪", textKn: "ಪಾರಂಪರಿಕ ಜಾಹೀರಾತುಗಳು & ಮುದ್ರಣಾಲಯದ ೧೦೪-ಪುಟಗಳ ಪಿಡಿಎಫ್ ಸಂಪೂರ್ಣ..." }
];

export const BaggonaBookLoaderModal: React.FC<BaggonaBookLoaderModalProps> = ({
  isOpen,
  samvatsaraKn,
  shakaYear,
  gregorianYears,
  onComplete,
  onClose
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      setProgressPercent(0);
      setIsFinished(false);
      return;
    }

    // Step-by-step progress animation
    let step = 0;
    const interval = setInterval(() => {
      if (step < GENERATION_STAGES.length) {
        setCurrentStageIdx(step);
        setProgressPercent(GENERATION_STAGES[step].progress);
        step++;
      } else {
        clearInterval(interval);
        setIsFinished(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const currentStage = GENERATION_STAGES[currentStageIdx] || GENERATION_STAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Front Cover Container (Exact replica style of Baggona Panchanga front page) */}
      <div className="relative w-full max-w-lg bg-[#FAF5E6] border-8 border-double border-amber-800 rounded-3xl p-6 md:p-8 shadow-2xl text-amber-950 font-serif overflow-hidden ring-4 ring-amber-400/40">
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 text-xl text-amber-700 select-none">卐</div>
        <div className="absolute top-2 right-2 text-xl text-amber-700 select-none">卐</div>
        <div className="absolute bottom-2 left-2 text-xl text-amber-700 select-none">🕉️</div>
        <div className="absolute bottom-2 right-2 text-xl text-amber-700 select-none">🕉️</div>

        {/* Front Cover Header */}
        <div className="text-center space-y-1.5 pb-4 border-b-2 border-amber-800/40">
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
            ಶ್ರೀ ಶಕ {shakaYear} • ಗೋಕರ್ಣ ದೃಗ್ಗಣಿತ ಪದ್ಧತಿ • ೧೦೪ ಪುಟಗಳ ಮುದ್ರಣ ಆವೃತ್ತಿ
          </div>
        </div>

        {/* Animated Sacred Graha Mandala Chakra */}
        <div className="py-6 flex flex-col items-center justify-center relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Spinning outer mandala ring */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-600/60 animate-[spin_6s_linear_infinite]" />
            {/* Pulsing inner ring */}
            <div className="absolute inset-2 rounded-full border-2 border-amber-500/40 animate-ping" />
            {/* Golden Diya / Kalasha emblem */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg border-2 border-amber-700">
              <span className="text-3xl animate-bounce">🪔</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xl font-black text-amber-950 font-mono tracking-wider">
              {progressPercent}%
            </span>
            <div className="text-xs font-bold text-amber-800 uppercase tracking-widest mt-0.5">
              {currentStage.pageRange} ಸಿದ್ಧವಾಗುತ್ತಿದೆ
            </div>
          </div>
        </div>

        {/* Live Stage Progress Indicator */}
        <div className="space-y-2 bg-white/80 p-4 rounded-2xl border border-amber-300 shadow-inner">
          <div className="flex justify-between items-center text-xs font-black text-amber-950">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>ಪುಸ್ತಕ ಮುದ್ರಣ ಪ್ರಕ್ರಿಯೆ:</span>
            </span>
            <span className="font-mono text-amber-800">{currentStage.pageRange}</span>
          </div>

          <div className="w-full h-3 bg-amber-200/70 rounded-full overflow-hidden p-0.5 border border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-700 font-sans font-medium text-center italic min-h-[2.5em] flex items-center justify-center">
            {currentStage.textKn}
          </p>
        </div>

        {/* Bottom Verification & Heritage Stamp */}
        <div className="mt-4 pt-3 border-t border-amber-800/30 flex items-center justify-between text-[10px] text-amber-900 font-bold font-sans">
          <span>ಸಂಪಾದಕರು: ಶ್ರೀ ರಾಮ ಪಂಡಿತ - ಶ್ರೀ ಶಂಕರನಾರಾಯಣ ಪಂಡಿತ</span>
          {isFinished ? (
            <span className="text-emerald-700 font-black flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
              <span>✅</span>
              <span>ಸಿದ್ಧವಾಗಿದೆ!</span>
            </span>
          ) : (
            <span className="text-amber-700 animate-pulse">ದೃಗ್ಗಣಿತ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ...</span>
          )}
        </div>
      </div>
    </div>
  );
};
