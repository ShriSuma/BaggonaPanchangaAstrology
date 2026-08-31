import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getPoojaStreak, recordPoojaSankalpaCompleted, type PoojaStreakInfo } from "../../features/seva/calendarVisitService";
import { getPriestStepSpeechText, playTempleBellChime, speakPriestNarration, stopPriestAudio } from "../../features/seva/priestAudioNarrator";

export interface DailyPoojaSankalpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  lang?: SevaLang;
  priestName?: string;
  voiceId?: string;
  onPlayBell?: () => void;
}

export const DailyPoojaSankalpaModal: React.FC<DailyPoojaSankalpaModalProps> = ({
  isOpen,
  onClose,
  devoteeName,
  gotra = "ಕಾಶ್ಯಪ",
  rashiName = "ಧನು",
  nakshatraName = "ಮೂಲ",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  voiceId,
  onPlayBell
}) => {
  const [mode, setMode] = useState<"priest_guided" | "self_guided">("priest_guided");
  const [step, setStep] = useState<number>(1);
  const [isLampLit, setIsLampLit] = useState(false);
  const [showAkshataAnimation, setShowAkshataAnimation] = useState(false);
  const [streakInfo, setStreakInfo] = useState<PoojaStreakInfo | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const devoteeKey = devoteeName ? devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default";
  const stopSpeechRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getPoojaStreak(devoteeKey);
      setStreakInfo(current);
      if (current.isCompletedToday) {
        setIsLampLit(true);
        setStep(4);
      } else {
        setStep(1);
        setIsLampLit(false);
      }
      // If priest guided mode, speak step 1
      if (mode === "priest_guided") {
        playStepPriestAudio(1);
      }
    } else {
      stopPriestAudio();
      setIsAudioPlaying(false);
    }

    return () => {
      stopPriestAudio();
    };
  }, [isOpen, devoteeKey]);

  // Handle playing priest voice for given step
  const playStepPriestAudio = (targetStep: number) => {
    stopPriestAudio();
    setIsAudioPlaying(true);

    if (targetStep === 1) {
      playTempleBellChime();
    }

    const { narrationText, sanskritMantra } = getPriestStepSpeechText({
      devoteeName,
      gotra,
      rashiName,
      nakshatraName,
      priestName,
      lang,
      step: targetStep
    });

    const fullSpeech = `${narrationText} ${sanskritMantra}`;
    const stepKey = `step_${targetStep}` as "step_1" | "step_2" | "step_3" | "step_4";
    const stopFn = speakPriestNarration(fullSpeech, lang, () => {
      setIsAudioPlaying(false);
    }, stepKey, voiceId);
    stopSpeechRef.current = stopFn;
  };

  if (!isOpen) return null;

  const handleStep1Bell = () => {
    playTempleBellChime();
    if (onPlayBell) onPlayBell();
    setStep(2);
    if (mode === "priest_guided") {
      playStepPriestAudio(2);
    }
  };

  const handleStep2Offer = () => {
    setIsLampLit(true);
    setShowAkshataAnimation(true);
    setTimeout(() => {
      setShowAkshataAnimation(false);
      setStep(3);
      if (mode === "priest_guided") {
        playStepPriestAudio(3);
      }
    }, 1200);
  };

  const handleStep3Complete = async () => {
    const updated = await recordPoojaSankalpaCompleted(devoteeKey, devoteeName, gotra, priestName);
    setStreakInfo(updated);
    setStep(4);
    if (mode === "priest_guided") {
      playStepPriestAudio(4);
    }
  };

  const handleClose = () => {
    stopPriestAudio();
    setIsAudioPlaying(false);
    onClose();
  };

  const stepDetails = getPriestStepSpeechText({
    devoteeName,
    gotra,
    rashiName,
    nakshatraName,
    priestName,
    lang,
    step
  });

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
      style={{ zIndex: 9999 }}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1C0A00] via-[#2A1205] to-[#150600] border-2 border-amber-400/90 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-5 sm:p-6 text-amber-100 my-auto space-y-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-amber-400/70 hover:text-amber-300 text-sm font-black p-1.5 rounded-full hover:bg-amber-950/80 transition-colors border border-amber-500/30"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Sanctum Header */}
        <div className="text-center space-y-1 pb-3 border-b border-amber-500/40">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full text-[10px] font-black uppercase tracking-wider">
            <span>🕉️</span>
            <span>॥ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾ ಸಂಕಲ್ಪ ಪೂಜೆ ॥</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-amber-200 leading-tight">
            ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಪವಿತ್ರ ದರ್ಶನ & ಸಂಕಲ್ಪ
          </h3>
          <p className="text-[11px] text-amber-300/80 font-bold">
            ಭಕ್ತರು: <strong className="text-amber-200 font-black">{devoteeName}</strong> • ಗೋತ್ರ: <span className="font-semibold">{gotra}</span> • ಅರ್ಚಕರು: <span className="font-semibold text-amber-300">{priestName}</span>
          </p>
        </div>

        {/* Dual Mode Switch: Priest Voice Guided vs Self-Paced */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-2xl border border-amber-500/40">
          <button
            type="button"
            onClick={() => {
              setMode("priest_guided");
              playStepPriestAudio(step);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === "priest_guided"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md border border-amber-300"
                : "text-amber-300/80 hover:bg-amber-950/60"
            }`}
          >
            <span>🎙️</span>
            <span>ಅರ್ಚಕರ ಧ್ವನಿ (Priest Voice)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("self_guided");
              stopPriestAudio();
              setIsAudioPlaying(false);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === "self_guided"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md border border-amber-300"
                : "text-amber-300/80 hover:bg-amber-950/60"
            }`}
          >
            <span>👤</span>
            <span>ಸ್ವಯಂ ಪೂಜೆ (Self-Paced)</span>
          </button>
        </div>

        {/* Sacred Atma Linga Sanctum Visualizer */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/60 border-2 border-amber-400/80 overflow-hidden flex flex-col items-center justify-center text-amber-100 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />

          {/* Shivalinga / Sanctum Visual */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
              <div className="text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.9)]">
                🕉️
              </div>
            </div>

            {/* Sacred Lamp (Deepa) */}
            <div className="mt-2 flex items-center gap-6">
              <div className={`transition-all duration-700 transform ${isLampLit ? "scale-110 opacity-100" : "scale-90 opacity-40"}`}>
                <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]">🪔</span>
              </div>
              <div className="text-xs font-serif font-black text-amber-300 tracking-wider">
                ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ
              </div>
              <div className={`transition-all duration-700 transform ${isLampLit ? "scale-110 opacity-100" : "scale-90 opacity-40"}`}>
                <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]">🪔</span>
              </div>
            </div>
          </div>

          {/* Akshata Rain Falling Animation */}
          {showAkshataAnimation && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <span className="text-2xl animate-bounce">✨ 🌾 ✨ 🌾 ✨</span>
            </div>
          )}

          {/* Audio Wave Bar Indicator when Priest Voice is Speaking */}
          {isAudioPlaying && (
            <div className="absolute bottom-2 px-3 py-1 bg-amber-950/90 border border-amber-400/80 rounded-full text-[10px] font-mono font-black text-amber-300 flex items-center gap-1.5 animate-pulse shadow-md">
              <span>🔊</span>
              <span>ಅರ್ಚಕರ ಧ್ವನಿ ಸಕ್ರಿಯ: {priestName}</span>
              <span className="text-amber-400 animate-ping">॥ ılılıll ॥</span>
            </div>
          )}

          {/* Real-Time Pooja Streak Badge */}
          {streakInfo && (
            <div className="absolute top-2 left-2 z-20 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/80 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md">
              <span>🔥</span>
              <span>{streakInfo.currentStreak} ದಿನಗಳ ಸತತ ಪೂಜೆ</span>
            </div>
          )}
        </div>

        {/* Priest Narration Audio Bar with Repeat & Toggle */}
        <div className="p-3 bg-black/50 rounded-2xl border border-amber-500/40 flex items-center justify-between gap-2 shadow-sm">
          <div className="text-xs font-bold text-amber-200 truncate flex items-center gap-1.5">
            <span className="text-amber-400">🛕</span>
            <span className="truncate">ಹಂತ {step}: {stepDetails.narrationText.slice(0, 40)}...</span>
          </div>

          <button
            type="button"
            onClick={() => playStepPriestAudio(step)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-[11px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 shrink-0 border border-amber-300"
          >
            <span>{isAudioPlaying ? "🔊 ಪುನಃ ಆಲಿಸಿ" : "▶️ ಧ್ವನಿ ಆಲಿಸಿ"}</span>
          </button>
        </div>

        {/* Step Progression Content */}
        {step === 1 && (
          <div className="p-4 bg-black/40 border-2 border-amber-500/50 rounded-2xl space-y-3 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">ಹಂತ ೧ / ೪</span>
              <h4 className="text-sm font-black text-amber-200">೧. ದೇವಸ್ಥಾನದ ಘಂಟಾನಾದ ಮೊಳಗಿಸಿ</h4>
              <p className="text-xs font-serif font-bold text-amber-300 italic">
                "{stepDetails.sanskritMantra}"
              </p>
              <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                ಘಂಟಾನಾದದಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ನಿವಾರಣೆಯಾಗಿ ದೈವಿಕ ತರಂಗಗಳು ಜಾಗೃತವಾಗುತ್ತವೆ.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStep1Bell}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-amber-300"
            >
              <span>🔔 ಘಂಟೆ ಬಾರಿಸಿ & ಮುಂದುವರಿಯಿರಿ (Ring Bell & Continue)</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-4 bg-black/40 border-2 border-amber-500/50 rounded-2xl space-y-3 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">ಹಂತ ೨ / ೪</span>
              <h4 className="text-sm font-black text-amber-200">೨. ದೀಪ ಪ್ರಜ್ವಲಿಸಿ & ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ</h4>
              <p className="text-xs font-serif font-bold text-amber-300 italic">
                "{stepDetails.sanskritMantra}"
              </p>
              <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                ಜ್ಞಾನಜ್ಯೋತಿ ದೀಪ ಹಾಗೂ ಮಂಗಳಾಕ್ಷತೆಯಿಂದ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStep2Offer}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-amber-300"
            >
              <span>🪔 ದೀಪ ಬೆಳಗಿಸಿ & ಅಕ್ಷತೆ ಹಾಕಿ (Offer Akshata)</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 bg-black/40 border-2 border-amber-500/50 rounded-2xl space-y-3 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">ಹಂತ ೩ / ೪</span>
              <h4 className="text-xs font-serif font-black text-amber-200 leading-relaxed italic">
                "{stepDetails.sanskritMantra}"
              </h4>
            </div>

            <div className="p-2.5 bg-black/60 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-200">
              ಭಕ್ತರು: <strong className="text-amber-300">{devoteeName}</strong> ({gotra} ಗೋತ್ರ, {rashiName} ರಾಶಿ, {nakshatraName} ನಕ್ಷತ್ರ)
            </div>

            <button
              type="button"
              onClick={handleStep3Complete}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 border border-emerald-400"
            >
              <span>🕉️ ಸಂಕಲ್ಪ ಆಶೀರ್ವಾದ ಸ್ವೀಕರಿಸಿ (Complete Sankalpa)</span>
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="p-4 bg-black/40 border-2 border-emerald-500/70 rounded-2xl space-y-3 text-center animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-400 rounded-full text-xs font-black">
              <span>✓</span>
              <span>ಇಂದಿನ ದೈವಿಕ ಸಂಕಲ್ಪ ಸಂಪನ್ನವಾಗಿದೆ! ✓</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-200 flex items-center justify-center gap-1.5">
                <span>🔥</span>
                <span>{streakInfo?.currentStreak || 1} ದಿನಗಳ ಸತತ ಪವಿತ್ರ ಪೂಜಾ ಸಂಕಲ್ಪ</span>
              </h4>
              <p className="text-xs text-amber-200/80 font-medium">
                ನಿಮ್ಮ ಶ್ರದ್ಧಾ ಭಕ್ತಿಯಿಂದ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ವಿಶೇಷ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮೊಂದಿಗಿದೆ.
              </p>
            </div>

            {/* Milestone Unlock Notice if applicable */}
            {streakInfo?.milestoneUnlocked && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/60 rounded-xl text-xs text-amber-200 font-bold space-y-1">
                <div className="text-base">{streakInfo.milestoneUnlocked.icon}</div>
                <div className="font-black text-amber-300">
                  {streakInfo.milestoneUnlocked.titleKn}
                </div>
                <div className="text-[10px] text-amber-400/80">
                  {streakInfo.milestoneUnlocked.descriptionKn}
                </div>
              </div>
            )}

            <div className="p-2.5 bg-black/60 rounded-xl border border-amber-500/40 text-[11px] font-semibold text-amber-200 flex items-center justify-center gap-2">
              <span>🙏</span>
              <span>ಮುಖ್ಯ ಅರ್ಚಕ {priestName} ಅವರ ಸನ್ನಿಧಿ ಆಶೀರ್ವಾದ</span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 border border-amber-300"
            >
              ದರ್ಶನ ಮುಂದುವರಿಸಿ (Continue Darshana)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
