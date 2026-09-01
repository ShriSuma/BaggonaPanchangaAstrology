import React, { useState, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import type { PersonalRemedyJapaInfo } from "../../features/remedies/kundliPersonalRemedyJapaEngine";
import { playTempleBellChime } from "../../features/seva/priestAudioNarrator";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../../features/audio/globalAudioManager";
import { recordDevoteeJapaCompleted, type DevoteeStreakRecord, type DevoteeMilestoneReward } from "../../features/seva/devoteeStreakService";

export interface RemedyJapa11CounterProps {
  remedyInfo: PersonalRemedyJapaInfo;
  lang?: SevaLang;
  devoteeName?: string;
  gotra?: string;
  voiceId?: string;
  onJapaCompleted?: (streak: DevoteeStreakRecord, unlocked: DevoteeMilestoneReward[]) => void;
  className?: string;
}

export const RemedyJapa11Counter: React.FC<RemedyJapa11CounterProps> = ({
  remedyInfo,
  lang = "kn",
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ",
  voiceId = "voice_shrisuma_master",
  onJapaCompleted,
  className = ""
}) => {
  const [japaCount, setJapaCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoadingPriestAudio, setIsLoadingPriestAudio] = useState<boolean>(false);
  const [isPlayingPriestAudio, setIsPlayingPriestAudio] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [unlockedRewards, setUnlockedRewards] = useState<DevoteeMilestoneReward[]>([]);

  const devoteeKey = devoteeName.toLowerCase().replace(/\s+/g, "_") || "devotee_default";

  useEffect(() => {
    const unregister = onGlobalAudioStop(() => {
      setIsPlayingPriestAudio(false);
      setIsLoadingPriestAudio(false);
    });
    return () => {
      unregister();
      stopAllAudioGlobal();
    };
  }, []);

  const handleIncrementJapa = async () => {
    if (japaCount >= 11) return;

    playTempleBellChime();
    const nextCount = japaCount + 1;
    setJapaCount(nextCount);

    if (nextCount === 11) {
      setIsCompleted(true);
      setShowConfetti(true);
      stopAllAudioGlobal();

      // Cloud Firestore & LocalStorage Sync
      try {
        const { updatedStreak, newlyUnlockedMilestones } = await recordDevoteeJapaCompleted(
          devoteeKey,
          devoteeName,
          gotra
        );
        if (newlyUnlockedMilestones.length > 0) {
          setUnlockedRewards(newlyUnlockedMilestones);
        }
        if (onJapaCompleted) {
          onJapaCompleted(updatedStreak, newlyUnlockedMilestones);
        }
      } catch (err) {
        console.warn("[RemedyJapa11Counter] Streak record error:", err);
      }
    }
  };

  const handleResetJapa = () => {
    setJapaCount(0);
    setIsCompleted(false);
    setShowConfetti(false);
  };

  const handleTogglePriestAudio = async () => {
    if (isPlayingPriestAudio || isLoadingPriestAudio) {
      stopAllAudioGlobal();
      setIsPlayingPriestAudio(false);
      setIsLoadingPriestAudio(false);
      return;
    }

    stopAllAudioGlobal();
    setIsLoadingPriestAudio(true);
    setIsPlayingPriestAudio(false);
    playTempleBellChime();

    const textToSpeak = `${remedyInfo.deityName[lang] || remedyInfo.deityName.kn}. ${remedyInfo.sanskritShloka}. ${remedyInfo.calmingBenefit[lang] || remedyInfo.calmingBenefit.kn}`;

    try {
      await synthesizeAndPlayClonedVoice(
        textToSpeak,
        lang,
        voiceId,
        () => {
          setIsPlayingPriestAudio(false);
          setIsLoadingPriestAudio(false);
        },
        () => {
          setIsLoadingPriestAudio(false);
          setIsPlayingPriestAudio(true);
        }
      );
    } catch {
      setIsLoadingPriestAudio(false);
      setIsPlayingPriestAudio(false);
    }
  };

  const targetCount = 11;
  const progressPercent = Math.min(100, Math.round((japaCount / targetCount) * 100));

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-neutral-950 to-amber-900/40 p-6 md:p-8 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Background Sacred Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>📿</span>
            <span>{lang === "kn" ? "೧೧ ಬಾರಿ ಪರಿಹಾರ ಮಂತ್ರ ಜಪ" : "11-Time Vedic Remedy Japa"}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
            {remedyInfo.afflictionTitle[lang] || remedyInfo.afflictionTitle.kn}
          </h3>
          <p className="text-amber-200/80 text-sm mt-1">
            {remedyInfo.deityName[lang] || remedyInfo.deityName.kn}
          </p>
        </div>

        {/* Listen with Priest Audio Button */}
        <button
          onClick={handleTogglePriestAudio}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
            isPlayingPriestAudio
              ? "bg-rose-600 text-white animate-pulse shadow-rose-900/50"
              : isLoadingPriestAudio
              ? "bg-amber-800 text-amber-100 shadow-amber-950/50"
              : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-amber-950 hover:text-black shadow-amber-900/40 hover:scale-[1.02]"
          }`}
        >
          {isPlayingPriestAudio ? (
            <>
              <span>⏹️</span>
              <span>{lang === "kn" ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ" : "Stop Audio"}</span>
            </>
          ) : isLoadingPriestAudio ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>{lang === "kn" ? "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Synthesizing..."}</span>
            </>
          ) : (
            <>
              <span>🎙️</span>
              <span>{lang === "kn" ? "ಗುರುಮುಖೇನ ಶ್ರವಣ" : "Listen with Priest"}</span>
            </>
          )}
        </button>
      </div>

      {/* Affliction Diagnosis Reason */}
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/20 text-xs md:text-sm text-amber-200/90 leading-relaxed">
        <span className="font-semibold text-amber-300">💡 {lang === "kn" ? "ದೋಷ ನಿವಾರಣಾ ಮಾರ್ಗ:" : "Remedy Purpose:"} </span>
        {remedyInfo.afflictionReason[lang] || remedyInfo.afflictionReason.kn}
      </div>

      {/* Sacred Mantra Display Box */}
      <div className="mt-5 rounded-2xl bg-black/50 border border-amber-500/30 p-5 text-center shadow-inner relative group">
        <div className="text-xs text-amber-400/70 font-mono uppercase tracking-wider mb-2">
          {lang === "kn" ? "॥ ದಿವ್ಯ ಜಪ ಮಂತ್ರ ॥" : "॥ Sacred Vedic Shloka ॥"}
        </div>
        <p className="text-lg md:text-2xl font-serif font-bold text-amber-100 leading-relaxed whitespace-pre-line tracking-wide drop-shadow-md">
          {remedyInfo.sanskritShloka}
        </p>
        <p className="mt-3 text-xs md:text-sm text-amber-300/80 italic font-mono">
          {remedyInfo.transliteration}
        </p>
        <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs md:text-sm text-amber-200/90">
          <span className="font-semibold text-amber-400">{lang === "kn" ? "ಭಾವಾರ್ಥ: " : "Meaning: "}</span>
          {remedyInfo.meaning[lang] || remedyInfo.meaning.kn}
        </div>
      </div>

      {/* 11-Bead Japamala Track */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-3">
          <span>{lang === "kn" ? "ಜಪಮಾಲೆ ಪ್ರಗತಿ (೧೧ ಮಣಿಗಳು):" : "Japamala Progress (11 Beads):"}</span>
          <span className="text-amber-400 font-mono text-sm">{japaCount} / {targetCount} ({progressPercent}%)</span>
        </div>

        {/* Beads Row */}
        <div className="grid grid-cols-11 gap-1.5 md:gap-2">
          {Array.from({ length: targetCount }).map((_, idx) => {
            const beadNumber = idx + 1;
            const isBeadDone = beadNumber <= japaCount;
            const isCurrentBead = beadNumber === japaCount + 1;

            return (
              <button
                key={idx}
                onClick={handleIncrementJapa}
                disabled={isCompleted}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-full text-xs font-bold transition-all duration-300 ${
                  isBeadDone
                    ? "bg-gradient-to-tr from-emerald-600 to-green-400 text-white shadow-lg shadow-emerald-900/50 scale-100 ring-2 ring-emerald-400"
                    : isCurrentBead
                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg shadow-yellow-500/50 scale-110 animate-bounce ring-2 ring-yellow-200"
                    : "bg-neutral-900/80 text-amber-500/50 border border-amber-500/20 hover:border-amber-400/50 hover:text-amber-300"
                }`}
                title={`Bead ${beadNumber}`}
              >
                {isBeadDone ? "✓" : beadNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Main Tap-to-Chant Button */}
      {!isCompleted ? (
        <div className="mt-6 text-center">
          <button
            onClick={handleIncrementJapa}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-bold text-lg md:text-xl shadow-xl shadow-amber-950/60 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 border border-amber-300/60"
          >
            <span className="text-2xl animate-spin">📿</span>
            <span>
              {lang === "kn"
                ? `ಜಪಿಸಲು ಸ್ಪರ್ಶಿಸಿ (${japaCount} / ೧೧ ಮುಗಿದಿದೆ)`
                : `Tap to Chant (${japaCount} / 11 Completed)`}
            </span>
            <span className="text-sm px-2.5 py-1 rounded-full bg-black/20 text-amber-950 font-mono">
              +1
            </span>
          </button>
          <p className="text-xs text-amber-300/60 mt-2">
            {lang === "kn"
              ? "ಪ್ರತಿ ಮಂತ್ರ ಪಠಿಸಿದ ನಂತರ ಬಟನ್ ಸ್ಪರ್ಶಿಸಿ ೧೧ ಬಾರಿ ಜಪ ಪೂರ್ಣಗೊಳಿಸಿ"
              : "Tap after each chant to complete the 11 sacred rounds"}
          </p>
        </div>
      ) : (
        /* HURRAY CELEBRATION & FRESH MIND BLESSING CARD */
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-green-900/80 to-teal-950/90 border-2 border-emerald-400/80 p-6 text-center shadow-2xl animate-fade-in">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-4xl mb-3 animate-bounce">
            🎉
          </div>
          <h4 className="text-2xl font-extrabold text-emerald-200">
            {remedyInfo.celebrationHurrayText[lang] || remedyInfo.celebrationHurrayText.kn}
          </h4>

          {/* Calming Fresh Mind Divine Blessing */}
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-emerald-400/30 text-emerald-100 text-base md:text-lg font-medium leading-relaxed">
            🌿 <span className="font-bold text-yellow-300">
              {remedyInfo.freshMindBlessingText[lang] || remedyInfo.freshMindBlessingText.kn}
            </span>
          </div>

          <p className="mt-3 text-xs md:text-sm text-emerald-300/90">
            ✨ {remedyInfo.calmingBenefit[lang] || remedyInfo.calmingBenefit.kn}
          </p>

          {/* Unlocked Milestone Alert if any */}
          {unlockedRewards.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-sm">
              <span className="font-bold text-yellow-300">🌟 ಹೊಸ ಪುರಸ್ಕಾರ ಅನ್‌ಲಾಕ್: </span>
              {unlockedRewards.map((r) => r.rewardTitle[lang] || r.rewardTitle.kn).join(" · ")}
            </div>
          )}

          {/* Reset button to chant again */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={handleResetJapa}
              className="px-5 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-400/40 text-emerald-100 text-xs font-semibold transition-all"
            >
              🔄 {lang === "kn" ? "ಮತ್ತೊಮ್ಮೆ ೧೧ ಬಾರಿ ಜಪಿಸಿ" : "Chant 11 Times Again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
