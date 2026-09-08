import React, { useState, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import type { PersonalRemedyJapaInfo } from "../../features/remedies/kundliPersonalRemedyJapaEngine";
import { playTempleBellChime } from "../../features/seva/priestAudioNarrator";
import { synthesizeAndPlayClonedVoice, stopClonedAudio, prewarmIndicAudio } from "../../features/audio/aiVoiceCloneEngine";
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

const REMEDY_COUNTER_TEXTS: Record<SevaLang, {
  badge: string;
  stopAudio: string;
  synthesizing: string;
  listenWithPriest: string;
  remedyPurpose: string;
  mantraBoxTitle: string;
  meaning: string;
  progressTitle: string;
  tapToChant: (count: number) => string;
  instruction: string;
  unlockedReward: string;
  chantAgain: string;
  loaderTitle: string;
  loaderSubtitle: string;
}> = {
  kn: {
    badge: "೧೧ ಬಾರಿ ಪರಿಹಾರ ಮಂತ್ರ ಜಪ",
    stopAudio: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    synthesizing: "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    listenWithPriest: "ಗುರುಮುಖೇನ ಶ್ರವಣ",
    remedyPurpose: "ದೋಷ ನಿವಾರಣಾ ಮಾರ್ಗ:",
    mantraBoxTitle: "॥ ದಿವ್ಯ ಜಪ ಮಂತ್ರ ॥",
    meaning: "ಭಾವಾರ್ಥ:",
    progressTitle: "ಜಪಮಾಲೆ ಪ್ರಗತಿ (೧೧ ಮಣಿಗಳು):",
    tapToChant: (count) => `ಜಪಿಸಲು ಸ್ಪರ್ಶಿಸಿ (${count} / ೧೧ ಮುಗಿದಿದೆ)`,
    instruction: "ಪ್ರತಿ ಮಂತ್ರ ಪಠಿಸಿದ ನಂತರ ಬಟನ್ ಸ್ಪರ್ಶಿಸಿ ೧೧ ಬಾರಿ ಜಪ ಪೂರ್ಣಗೊಳಿಸಿ",
    unlockedReward: "🌟 ಹೊಸ ಪುರಸ್ಕಾರ ಅನ್‌ಲಾಕ್: ",
    chantAgain: "ಮತ್ತೊಮ್ಮೆ ೧೧ ಬಾರಿ ಜಪಿಸಿ",
    loaderTitle: "ದೋಷ ಪರಿಹಾರ ಮಂತ್ರ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    loaderSubtitle: "ಕುಂಡಲಿ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ಗುರುಮುಖೇನ ಮಂತ್ರ ಶ್ರವಣ ಸಿದ್ಧವಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ."
  },
  te: {
    badge: "11 సార్లు పరిహార మంత్ర జపం",
    stopAudio: "ధ్వని ఆపండి",
    synthesizing: "ధ్వని సిద్ధమవుతోంది...",
    listenWithPriest: "గురుముఖేన వినండి",
    remedyPurpose: "దోష నివారణ మార్గం:",
    mantraBoxTitle: "॥ దివ్య జప మంత్రం ॥",
    meaning: "భావార్థం:",
    progressTitle: "జపమాల పురోగతి (11 పూసలు):",
    tapToChant: (count) => `జపించుటకు తాకండి (${count} / 11 పూర్తయింది)`,
    instruction: "ప్రతి మంత్రం పఠించిన తర్వాత బటన్ తాకి 11 సార్లు జపం పూర్తి చేయండి",
    unlockedReward: "🌟 నూతన పురస్కారం అన్‌లాక్ అయింది: ",
    chantAgain: "మరోసారి 11 సార్లు జపించండి",
    loaderTitle: "దోష నివారణ మంత్ర ధ్వని సిద్ధమవుతోంది...",
    loaderSubtitle: "కుండలి దోష నివారణ కొరకు గురుముఖేన మంత్ర శ్రవణం సిద్ధమవుతోంది, దయచేసి వేచి ఉండండి."
  },
  ta: {
    badge: "11 முறை பரிகார மந்திர ஜபம்",
    stopAudio: "குரலை நிறுத்து",
    synthesizing: "குரல் தயாராகிறது...",
    listenWithPriest: "குரு குரலில் கேட்க",
    remedyPurpose: "தோஷ நிவர்த்தி வழி:",
    mantraBoxTitle: "॥ திவ்ய ஜப மந்திரம் ॥",
    meaning: "பொருள்:",
    progressTitle: "ஜபமாலை முன்னேற்றம் (11 மணிகள்):",
    tapToChant: (count) => `ஜபிக்க தொடவும் (${count} / 11 முடிந்தது)`,
    instruction: "ஒவ்வொரு மந்திரத்திற்கும் பின் பொத்தானைத் தொட்டு 11 முறை ஜபத்தை முடிக்கவும்",
    unlockedReward: "🌟 புதிய பரிசு திறக்கப்பட்டது: ",
    chantAgain: "மீண்டும் 11 முறை ஜபிக்கவும்",
    loaderTitle: "தோஷ பரிகார மந்திர ஆடியோ தயாராகிறது...",
    loaderSubtitle: "ஜாதக தோஷ நிவர்த்திக்கான குரு குரல் மந்திரம் தயாராகிறது, தயவுசெய்து காத்திருக்கவும்."
  },
  hi: {
    badge: "११ बार निवारण मंत्र जप",
    stopAudio: "ध्वनि रोकें",
    synthesizing: "ध्वनि तैयार हो रही है...",
    listenWithPriest: "गुरुमुख से श्रवण",
    remedyPurpose: "दोष निवारण मार्ग:",
    mantraBoxTitle: "॥ दिव्य जप मंत्र ॥",
    meaning: "भावार्थ:",
    progressTitle: "जपमाला प्रगति (११ मनके):",
    tapToChant: (count) => `जप हेतु स्पर्श करें (${count} / ११ पूर्ण)`,
    instruction: "प्रत्येक मंत्र पाठ के बाद बटन दबाकर ११ बार जप पूर्ण करें",
    unlockedReward: "🌟 नया पुरस्कार अनलॉक हुआ: ",
    chantAgain: "पुनः ११ बार जप करें",
    loaderTitle: "दोष निवारण मंत्र ध्वनि तैयार हो रही है...",
    loaderSubtitle: "कुंडली दोष निवारण हेतु गुरुमुख से मंत्र श्रवण तैयार हो रहा है, कृपया प्रतीक्षा करें।"
  },
  en: {
    badge: "11-Time Vedic Remedy Japa",
    stopAudio: "Stop Audio",
    synthesizing: "Synthesizing...",
    listenWithPriest: "Listen with Priest",
    remedyPurpose: "Remedy Purpose:",
    mantraBoxTitle: "॥ Sacred Vedic Shloka ॥",
    meaning: "Meaning:",
    progressTitle: "Japamala Progress (11 Beads):",
    tapToChant: (count) => `Tap to Chant (${count} / 11 Completed)`,
    instruction: "Tap after each chant to complete the 11 sacred rounds",
    unlockedReward: "🌟 New Milestone Unlocked: ",
    chantAgain: "Chant 11 Times Again",
    loaderTitle: "Synthesizing Vedic Remedy Mantra Voice...",
    loaderSubtitle: "Streaming Vedic personal remedy chant in real time, please wait a moment."
  }
};

export const RemedyJapa11Counter: React.FC<RemedyJapa11CounterProps> = ({
  remedyInfo,
  lang = "kn",
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ",
  voiceId = "voice_sriram_pandit",
  onJapaCompleted,
  className = ""
}) => {
  const [japaCount, setJapaCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoadingPriestAudio, setIsLoadingPriestAudio] = useState<boolean>(false);
  const [isPlayingPriestAudio, setIsPlayingPriestAudio] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [unlockedRewards, setUnlockedRewards] = useState<DevoteeMilestoneReward[]>([]);

  const t = REMEDY_COUNTER_TEXTS[lang] || REMEDY_COUNTER_TEXTS.en;
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

  // Proactive Speculative Audio Pre-warming for 11 Japa Shloka
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      const currentShloka = remedyInfo.sanskritShlokaL5?.[lang] || remedyInfo.sanskritShloka;
      const textToSpeak = remedyInfo.audioNarrationText?.[lang] || remedyInfo.audioNarrationText?.kn || `${remedyInfo.deityName[lang] || remedyInfo.deityName.kn}. ${currentShloka}. ${remedyInfo.calmingBenefit[lang] || remedyInfo.calmingBenefit.kn}`;
      void prewarmIndicAudio(textToSpeak, lang);
    }, 1500);
    return () => clearTimeout(timer);
  }, [remedyInfo, lang]);

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
    if (isLoadingPriestAudio) return;
    if (isPlayingPriestAudio) {
      stopAllAudioGlobal();
      setIsPlayingPriestAudio(false);
      setIsLoadingPriestAudio(false);
      return;
    }

    stopAllAudioGlobal();
    setIsLoadingPriestAudio(true);
    setIsPlayingPriestAudio(false);

    // STRICT USER MANDATE: "100% accurately whatever written, no blah blah added, only what is written clearly needs to be told."
    // Recite ONLY the exact mantra written in the sacred box. Zero added deity prefix or calming benefit suffix.
    const currentShloka = remedyInfo.sanskritShlokaL5?.[lang] || remedyInfo.sanskritShloka;
    const textToSpeak = currentShloka;

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
            <span>{t.badge}</span>
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
          type="button"
          disabled={isLoadingPriestAudio}
          onClick={handleTogglePriestAudio}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
            isPlayingPriestAudio
              ? "bg-rose-600 text-white animate-pulse shadow-rose-900/50 cursor-pointer"
              : isLoadingPriestAudio
              ? "bg-amber-900/90 text-amber-200 border border-amber-500/50 shadow-amber-950/50 cursor-not-allowed opacity-90"
              : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-amber-950 hover:text-black shadow-amber-900/40 hover:scale-[1.02] cursor-pointer"
          }`}
        >
          {isPlayingPriestAudio ? (
            <>
              <span>⏹️</span>
              <span>{t.stopAudio}</span>
            </>
          ) : isLoadingPriestAudio ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>{t.synthesizing}</span>
            </>
          ) : (
            <>
              <span>🎙️</span>
              <span>{t.listenWithPriest}</span>
            </>
          )}
        </button>
      </div>

      {/* Affliction Diagnosis Reason */}
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/20 text-xs md:text-sm text-amber-200/90 leading-relaxed">
        <span className="font-semibold text-amber-300">💡 {t.remedyPurpose} </span>
        {remedyInfo.afflictionReason[lang] || remedyInfo.afflictionReason.kn}
      </div>

      {/* Sacred Mantra Display Box */}
      <div className="mt-5 rounded-2xl bg-black/50 border border-amber-500/30 p-5 text-center shadow-inner relative group">
        <div className="text-xs text-amber-400/70 font-mono uppercase tracking-wider mb-2">
          {t.mantraBoxTitle}
        </div>
        <p className="text-lg md:text-2xl font-serif font-bold text-amber-100 leading-relaxed whitespace-pre-line tracking-wide drop-shadow-md">
          {remedyInfo.sanskritShlokaL5?.[lang] || remedyInfo.sanskritShloka}
        </p>
        {lang === "en" && remedyInfo.transliteration && (
          <p className="mt-3 text-xs md:text-sm text-amber-300/80 italic font-mono">
            {remedyInfo.transliteration}
          </p>
        )}
        <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs md:text-sm text-amber-200/90">
          <span className="font-semibold text-amber-400">{t.meaning} </span>
          {remedyInfo.meaning[lang] || remedyInfo.meaning.kn}
        </div>
      </div>

      {/* 11-Bead Japamala Track */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-3">
          <span>{t.progressTitle}</span>
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
              {t.tapToChant(japaCount)}
            </span>
            <span className="text-sm px-2.5 py-1 rounded-full bg-black/20 text-amber-950 font-mono">
              +1
            </span>
          </button>
          <p className="text-xs text-amber-300/60 mt-2">
            {t.instruction}
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
              <span className="font-bold text-yellow-300">{t.unlockedReward}</span>
              {unlockedRewards.map((r) => r.rewardTitle[lang] || r.rewardTitle.kn).join(" · ")}
            </div>
          )}

          {/* Reset button to chant again */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <button
              onClick={handleResetJapa}
              className="px-5 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-400/40 text-emerald-100 text-xs font-semibold transition-all"
            >
              🔄 {t.chantAgain}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
