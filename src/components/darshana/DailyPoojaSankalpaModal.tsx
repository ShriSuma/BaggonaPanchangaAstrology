import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getPoojaStreak, recordPoojaSankalpaCompleted, type PoojaStreakInfo } from "../../features/seva/calendarVisitService";
import { playTempleBellChime, speakPriestNarration, stopPriestAudio } from "../../features/seva/priestAudioNarrator";
import { POOJA_16_UPACHARES, type PoojaUpacharaStep } from "../../features/seva/poojaUpacharaEngine";
import type { PriestAudioKey } from "../../features/audio/priestVoiceDatabase";

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
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [isLampLit, setIsLampLit] = useState(false);
  const [showAkshataAnimation, setShowAkshataAnimation] = useState(false);
  const [showFlowerAnimation, setShowFlowerAnimation] = useState(false);
  const [streakInfo, setStreakInfo] = useState<PoojaStreakInfo | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const devoteeKey = devoteeName ? devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default";
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upacharaList = POOJA_16_UPACHARES({
    devoteeName,
    gotra,
    rashiName,
    nakshatraName,
    priestName,
    lang
  });

  const totalSteps = upacharaList.length; // 16 steps
  const currentStepData: PoojaUpacharaStep = upacharaList[Math.min(step - 1, totalSteps - 1)] || upacharaList[0];

  useEffect(() => {
    if (isOpen) {
      const current = getPoojaStreak(devoteeKey);
      setStreakInfo(current);
      if (current.isCompletedToday) {
        setIsLampLit(true);
        setStep(17); // Step 17 is completion overview
      } else {
        setStep(1);
        setIsLampLit(false);
      }
      if (mode === "priest_guided" && !current.isCompletedToday) {
        playStepPriestAudio(1);
      }
    } else {
      cleanupAudioAndTimers();
    }

    return () => {
      cleanupAudioAndTimers();
    };
  }, [isOpen, devoteeKey]);

  const cleanupAudioAndTimers = () => {
    stopPriestAudio();
    setIsAudioPlaying(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  // Play priest voice for the given step
  const playStepPriestAudio = (targetStep: number) => {
    cleanupAudioAndTimers();
    if (targetStep > totalSteps) return;

    setIsAudioPlaying(true);

    if (targetStep === 1 || targetStep === 3 || targetStep === 15) {
      playTempleBellChime();
    }

    const stepItem = upacharaList[targetStep - 1] || upacharaList[0];
    const narration = stepItem.narrationText[lang] || stepItem.narrationText.kn;
    const fullSpeech = `${stepItem.titleKn}. ${narration} ${stepItem.sanskritMantra}`;
    const stepKey = `step_${targetStep}` as PriestAudioKey;

    const stopFn = speakPriestNarration(fullSpeech, lang, () => {
      setIsAudioPlaying(false);
      // Auto-advance if Auto-Play mode is active
      if (isAutoPlay && targetStep < totalSteps) {
        autoPlayTimerRef.current = setTimeout(() => {
          handleNextStep(targetStep + 1);
        }, 3500); // comfortable 3.5s pause between steps for devotee action
      }
    }, stepKey, voiceId);

    stopSpeechRef.current = stopFn;
  };

  if (!isOpen) return null;

  const handleNextStep = (nextStepIndex?: number) => {
    const nextStep = nextStepIndex !== undefined ? nextStepIndex : step + 1;

    // Trigger step-specific visual enhancements
    if (nextStep >= 2) setIsLampLit(true);
    if (nextStep === 3 || nextStep === 15) {
      playTempleBellChime();
      if (onPlayBell) onPlayBell();
    }
    if (nextStep === 5 || nextStep === 10 || nextStep === 12) {
      setShowAkshataAnimation(true);
      setTimeout(() => setShowAkshataAnimation(false), 1500);
    }
    if (nextStep === 12 || nextStep === 8) {
      setShowFlowerAnimation(true);
      setTimeout(() => setShowFlowerAnimation(false), 1500);
    }

    if (nextStep > totalSteps) {
      handleCompletePooja();
      return;
    }

    setStep(nextStep);
    if (mode === "priest_guided" || isAutoPlay) {
      playStepPriestAudio(nextStep);
    }
  };

  const handlePrevStep = () => {
    if (step <= 1) return;
    const prev = step - 1;
    setStep(prev);
    if (mode === "priest_guided") {
      playStepPriestAudio(prev);
    }
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep < 1 || targetStep > totalSteps) return;
    setStep(targetStep);
    if (targetStep >= 2) setIsLampLit(true);
    if (mode === "priest_guided") {
      playStepPriestAudio(targetStep);
    }
  };

  const handleCompletePooja = async () => {
    cleanupAudioAndTimers();
    playTempleBellChime();
    const updated = await recordPoojaSankalpaCompleted(devoteeKey, devoteeName, gotra, priestName);
    setStreakInfo(updated);
    setStep(17); // Final completion view

    // Final Benediction Speech
    const benediction = upacharaList[totalSteps - 1];
    const narration = benediction.narrationText[lang] || benediction.narrationText.kn;
    const fullSpeech = `${benediction.sanskritMantra}. ${narration}`;
    setIsAudioPlaying(true);
    speakPriestNarration(fullSpeech, lang, () => setIsAudioPlaying(false), "step_16", voiceId);
  };

  const handleClose = () => {
    cleanupAudioAndTimers();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-300"
      style={{ zIndex: 9999 }}
    >
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#1C0A00] via-[#2A1205] to-[#150600] border-2 border-amber-400/90 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] p-4 sm:p-6 text-amber-100 my-auto space-y-4">
        {/* Top Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-amber-400/70 hover:text-amber-300 text-sm font-black p-2 rounded-full hover:bg-amber-950/80 transition-colors border border-amber-500/30 shadow-md"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Sanctum Header */}
        <div className="text-center space-y-1 pb-2 border-b border-amber-500/40">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/50 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
            <span>🕉️</span>
            <span>॥ ೧೬ ಉಪಚಾರಗಳ ನಿತ್ಯ ಮಹಾಪೂಜೆ (16 Upacharas Daily Pooja) ॥</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-amber-200 leading-tight">
            ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದೈನಂದಿನ ಷೋಡಶೋಪಚಾರ ಪೂಜಾ ವಿಧಿ
          </h3>
          <p className="text-[11px] text-amber-300/80 font-bold">
            ಭಕ್ತರು: <strong className="text-amber-200 font-black">{devoteeName}</strong> • ಗೋತ್ರ: <span className="font-semibold">{gotra}</span> • ರಾಶಿ: <span className="font-semibold">{rashiName}</span> • ನಕ್ಷತ್ರ: <span className="font-semibold">{nakshatraName}</span>
          </p>
        </div>

        {/* Control Bar: Priest Voice Guided vs Self-Paced vs 20-Min Auto Flow */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 rounded-2xl border border-amber-500/40">
          <button
            type="button"
            onClick={() => {
              setMode("priest_guided");
              setIsAutoPlay(false);
              if (step <= totalSteps) playStepPriestAudio(step);
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
              mode === "priest_guided" && !isAutoPlay
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md border border-amber-300"
                : "text-amber-300/80 hover:bg-amber-950/60"
            }`}
          >
            <span>🎙️</span>
            <span className="truncate">ಅರ್ಚಕರ ಧ್ವನಿ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAutoPlay(true);
              setMode("priest_guided");
              if (step <= totalSteps) playStepPriestAudio(step);
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
              isAutoPlay
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md border border-amber-300"
                : "text-amber-300/80 hover:bg-amber-950/60"
            }`}
          >
            <span>⏱️</span>
            <span className="truncate">೨೦-ನಿಮಿಷ ಸ್ವಯಂ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("self_guided");
              setIsAutoPlay(false);
              cleanupAudioAndTimers();
            }}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 ${
              mode === "self_guided" && !isAutoPlay
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md border border-amber-300"
                : "text-amber-300/80 hover:bg-amber-950/60"
            }`}
          >
            <span>👤</span>
            <span className="truncate">ಸ್ವಯಂ ಪೂಜೆ</span>
          </button>
        </div>

        {/* 16 Upacharas Horizontal Step Jump Ribbon */}
        {step <= totalSteps && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
              <span>ಉಪಚಾರ ಹಂತ {step} / {totalSteps}</span>
              <span className="text-amber-400/80">{Math.round((step / totalSteps) * 100)}% ಸಂಪನ್ನ</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/30">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>

            {/* Quick Step Buttons Ribbon */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 px-0.5 no-scrollbar">
              {upacharaList.map((item) => (
                <button
                  key={item.step}
                  onClick={() => handleJumpToStep(item.step)}
                  className={`shrink-0 w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center border ${
                    step === item.step
                      ? "bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-md scale-105"
                      : step > item.step
                      ? "bg-amber-950/60 text-emerald-400 border-emerald-500/50"
                      : "bg-black/40 text-amber-300/60 border-amber-500/20 hover:border-amber-400/50"
                  }`}
                  title={`${item.step}. ${item.titleKn}`}
                >
                  <span>{item.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sacred Atma Linga & Upachara Visualizer Altar */}
        <div className="relative h-44 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/60 border-2 border-amber-400/80 overflow-hidden flex flex-col items-center justify-center text-amber-100 shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />

          {/* Shivalinga / Sanctum Visual */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
              <div className="text-5xl drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] transition-transform duration-300">
                {step === 1 ? "💧" : step === 3 ? "🔔" : step === 4 ? "🐘" : step === 6 ? "🏺" : step === 9 ? "🥛" : step === 13 ? "💨" : step === 14 ? "🍎" : step === 15 ? "🔥" : "🕉️"}
              </div>
            </div>

            {/* Sacred Lamp (Deepa) and Sanctum Title */}
            <div className="mt-2 flex items-center gap-6">
              <div className={`transition-all duration-700 transform ${isLampLit || step >= 2 ? "scale-110 opacity-100" : "scale-90 opacity-40"}`}>
                <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]">🪔</span>
              </div>
              <div className="text-xs font-serif font-black text-amber-300 tracking-wider">
                {step <= totalSteps ? currentStepData.titleKn : "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ"}
              </div>
              <div className={`transition-all duration-700 transform ${isLampLit || step >= 2 ? "scale-110 opacity-100" : "scale-90 opacity-40"}`}>
                <span className="text-2xl filter drop-shadow-[0_0_10px_rgba(245,158,11,1)]">🪔</span>
              </div>
            </div>
          </div>

          {/* Falling Akshata Animation */}
          {showAkshataAnimation && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="text-2xl animate-bounce">✨ 🌾 ✨ 🌾 ✨</span>
            </div>
          )}

          {/* Falling Flower Shower Animation */}
          {showFlowerAnimation && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-in fade-in">
              <span className="text-2xl animate-bounce">🌸 🌺 🌼 🌸 🌺</span>
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

        {/* Active Step Content (Steps 1 to 16) */}
        {step <= totalSteps && (
          <div className="p-4 bg-black/40 border-2 border-amber-500/50 rounded-2xl space-y-3">
            {/* Step Header */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentStepData.icon}</span>
                <div>
                  <h4 className="text-sm font-black text-amber-200 leading-tight">
                    {currentStepData.titleKn}
                  </h4>
                  <p className="text-[10px] text-amber-300/70 font-semibold">{currentStepData.titleEn}</p>
                </div>
              </div>

              {/* Audio Play/Stop Button for Current Step */}
              <button
                type="button"
                onClick={() => {
                  if (isAudioPlaying) {
                    cleanupAudioAndTimers();
                  } else {
                    playStepPriestAudio(step);
                  }
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-[11px] rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 shrink-0 border border-amber-300"
              >
                <span>{isAudioPlaying ? "⏸️ ನಿಲ್ಲಿಸಿ" : "▶️ ಧ್ವನಿ ಆಲಿಸಿ"}</span>
              </button>
            </div>

            {/* Sacred Sanskrit Mantra */}
            <div className="p-2.5 bg-amber-950/50 rounded-xl border border-amber-400/40 text-center">
              <p className="text-xs font-serif font-black text-amber-200 leading-relaxed italic">
                "{currentStepData.sanskritMantra}"
              </p>
            </div>

            {/* Action Guide for Devotee in Front of Temple */}
            <div className="p-2.5 bg-black/60 rounded-xl border border-amber-500/30 space-y-1">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>👉 ನೀವು ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕೈಂಕರ್ಯ:</span>
              </div>
              <p className="text-xs text-amber-100 font-medium leading-relaxed">
                {currentStepData.actionGuide[lang] || currentStepData.actionGuide.kn}
              </p>
            </div>

            {/* Spiritual Significance */}
            <div className="text-[11px] text-amber-300/80 font-medium italic flex items-center gap-1.5">
              <span>✨ ಫಲ:</span>
              <span>{currentStepData.spiritualSignificance[lang] || currentStepData.spiritualSignificance.kn}</span>
            </div>

            {/* Step Navigation Controls (Prev / Next) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step <= 1}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 border ${
                  step <= 1
                    ? "opacity-40 cursor-not-allowed bg-black/30 border-amber-500/20 text-amber-400/50"
                    : "bg-black/60 hover:bg-amber-950/60 border-amber-500/40 text-amber-200 active:scale-98"
                }`}
              >
                <span>👈 ಹಿಂದಿನ ಉಪಚಾರ</span>
              </button>

              <button
                type="button"
                onClick={() => handleNextStep()}
                className="py-2.5 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1 border border-amber-300"
              >
                <span>{step === totalSteps ? "🕉️ ಪೂಜೆ ಸಂಪನ್ನಗೊಳಿಸಿ ✓" : "ಮುಂದಿನ ಉಪಚಾರ 👉"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 17: Completion & Divine Ashirvada Celebration View */}
        {step > totalSteps && (
          <div className="p-4 bg-black/40 border-2 border-emerald-500/70 rounded-2xl space-y-3 text-center animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-400 rounded-full text-xs font-black">
              <span>✓</span>
              <span>ಇಂದಿನ ೧೬ ಉಪಚಾರಗಳ ದೈವಿಕ ಮಹಾಪೂಜೆ ಸಂಪನ್ನವಾಗಿದೆ! ✓</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-200 flex items-center justify-center gap-1.5">
                <span>🔥</span>
                <span>{streakInfo?.currentStreak || 1} ದಿನಗಳ ಸತತ ಪವಿತ್ರ ಪೂಜಾ ಸಂಕಲ್ಪ</span>
              </h4>
              <p className="text-xs text-amber-200/80 font-medium">
                ನಿಮ್ಮ ಶ್ರದ್ಧಾ ಭಕ್ತಿಯಿಂದ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ವಿಶೇಷ ಆಶೀರ್ವಾದ ಸದಾ ನಿಮ್ಮ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬದೊಂದಿಗೆ ಇರಲಿದೆ.
              </p>
            </div>

            {/* Devotee Sankalpa Summary Card */}
            <div className="p-3 bg-black/60 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-200 text-left space-y-1">
              <div>🕉️ <strong>ಭಕ್ತರು:</strong> <span className="text-amber-300">{devoteeName}</span> ({gotra} ಗೋತ್ರ, {rashiName} ರಾಶಿ, {nakshatraName} ನಕ್ಷತ್ರ)</div>
              <div>🙏 <strong>ಪ್ರಧಾನ ಅರ್ಚಕರು:</strong> <span className="text-amber-300">{priestName}</span> (ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ)</div>
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

            {/* Replay or Finish Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  playStepPriestAudio(1);
                }}
                className="py-2.5 px-3 bg-black/60 hover:bg-amber-950/60 border border-amber-500/40 text-amber-200 font-black text-xs rounded-xl transition-all active:scale-98 flex items-center justify-center gap-1"
              >
                <span>🔄 ಪುನಃ ಪೂಜೆ ಆರಂಭಿಸಿ</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-98 border border-emerald-400 flex items-center justify-center gap-1"
              >
                <span>ದರ್ಶನ ಮುಂದುವರಿಸಿ ✓</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
