import React, { useState, useEffect, useRef, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  type GuidedPoojaItem,
  type GuidedPoojaStep,
  filterGuidedPoojas,
  getStepSpokenAudio,
  GUIDED_POOJA_KEYS
} from "../../features/pooja/guidedPoojaData";
import {
  type GuidedVrataItem,
  filterGuidedVratas,
  GUIDED_VRATA_KEYS
} from "../../features/pooja/guidedVrataData";
import {
  SANKALPA_PURPOSES,
  type SankalpaPurposeKey,
  buildSanskritSankalpaMantra,
  buildLocalizedSankalpaText
} from "../../features/pooja/guidedSankalpaService";
import {
  speakGuidedPoojaStep,
  stopGuidedPoojaAudio,
  pauseGuidedPoojaAudio,
  resumeGuidedPoojaAudio,
  playTempleBellChime
} from "../../features/pooja/guidedPoojaAudioNarrator";

export interface GuidedPoojaDevoteeViewProps {
  poojaKeys?: string[];
  vrataKeys?: string[];
  initialCategory?: "poojas" | "vratas";
  sankalpaKey?: SankalpaPurposeKey;
  customGoal?: string;
  devoteeName?: string;
  gotra?: string;
  lang?: SevaLang;
  priestName?: string;
  onOpenConfigurator?: () => void;
}

export const GuidedPoojaDevoteeView: React.FC<GuidedPoojaDevoteeViewProps> = ({
  poojaKeys = [...GUIDED_POOJA_KEYS],
  vrataKeys = [...GUIDED_VRATA_KEYS],
  initialCategory = "poojas",
  sankalpaKey = "kutumba",
  customGoal,
  devoteeName = "ಭಕ್ತರು",
  gotra = "ಕಾಶ್ಯಪ",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  onOpenConfigurator
}) => {
  // Real-time language state: initialized from URL/prop, dynamically switchable on screen
  const [currentLang, setCurrentLang] = useState<SevaLang>(lang);

  useEffect(() => {
    if (lang) {
      setCurrentLang(lang);
    }
  }, [lang]);

  // Category state: Poojas (ನಿತ್ಯ ಪೂಜೆಗಳು) vs Vratas (ಪುಣ್ಯ ವ್ರತಗಳು)
  const [activeCategory, setActiveCategory] = useState<"poojas" | "vratas">(initialCategory);

  const activePoojas = useMemo(() => filterGuidedPoojas(poojaKeys), [poojaKeys]);
  const activeVratas = useMemo(() => filterGuidedVratas(vrataKeys), [vrataKeys]);

  const [selectedPoojaKey, setSelectedPoojaKey] = useState<string>(() => {
    return activePoojas[0]?.key || "sandhyavandana";
  });

  const [selectedVrataKey, setSelectedVrataKey] = useState<string>(() => {
    return activeVratas[0]?.key || "kalyana_mangalagauri_vrata";
  });

  const currentPooja: GuidedPoojaItem = useMemo(() => {
    const found = activePoojas.find((p) => p.key === selectedPoojaKey);
    return found || activePoojas[0] || null;
  }, [activePoojas, selectedPoojaKey]);

  const currentVrata: GuidedVrataItem = useMemo(() => {
    const found = activeVratas.find((v) => v.key === selectedVrataKey);
    return found || activeVratas[0] || null;
  }, [activeVratas, selectedVrataKey]);

  // The active item whose steps are being performed (either Pooja or Vrata)
  const currentRitualItem: {
    key: string;
    titleKn: string;
    titleEn: string;
    subtitleKn: string;
    subtitleEn: string;
    icon: string;
    badgeTextKn: string;
    badgeTextEn: string;
    steps: GuidedPoojaStep[];
  } = useMemo(() => {
    if (activeCategory === "vratas" && currentVrata) {
      return currentVrata;
    }
    return currentPooja;
  }, [activeCategory, currentPooja, currentVrata]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [, setIsFinished] = useState<boolean>(false);
  const [forceSanskritScript, setForceSanskritScript] = useState<boolean>(false);

  // Vrata Samagri checklist checked item state (item id -> boolean)
  const [checkedSamagri, setCheckedSamagri] = useState<Record<string, boolean>>({});
  const [showSamagriDrawer, setShowSamagriDrawer] = useState<boolean>(false);
  const [showVrataDetails, setShowVrataDetails] = useState<boolean>(true);
  const [isPlayingSankalpa, setIsPlayingSankalpa] = useState<boolean>(false);

  // Interactive Japa counter for repetitive chants (e.g. 28x, 108x)
  const [currentJapaCount, setCurrentJapaCount] = useState<number>(0);

  const activeCancelRef = useRef<(() => void) | null>(null);

  // Reset step index and audio when switching category or ritual
  useEffect(() => {
    stopCurrentAudio();
    setCurrentStepIndex(0);
    setCurrentJapaCount(0);
    setIsFinished(false);
  }, [activeCategory, selectedPoojaKey, selectedVrataKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  const currentStep: GuidedPoojaStep | undefined = currentRitualItem?.steps[currentStepIndex];

  const stopCurrentAudio = () => {
    if (activeCancelRef.current) {
      try {
        activeCancelRef.current();
      } catch {}
      activeCancelRef.current = null;
    }
    stopGuidedPoojaAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
    setIsPlayingSankalpa(false);
  };

  const handlePlayCurrentStep = async () => {
    if (!currentStep) return;

    if (isPaused) {
      await resumeGuidedPoojaAudio();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    stopCurrentAudio();
    playTempleBellChime();

    // Pure priest tone: instructions in selected language + all mantras strictly in pure Sanskrit (Devanagari)
    const speechText = getStepSpokenAudio(currentStep, currentLang);

    activeCancelRef.current = await speakGuidedPoojaStep(
      speechText,
      currentLang,
      {
        onStart: () => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
          setIsPaused(false);
        },
        onLoadingChange: (loading) => {
          setIsLoadingAudio(loading);
        },
        onEnd: () => {
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoadingAudio(false);
          markStepCompleted(currentStep.step);

          // If auto advance is on and not last step, move forward
          if (autoAdvance && currentRitualItem && currentStepIndex < currentRitualItem.steps.length - 1) {
            setTimeout(() => {
              handleNextStep(true);
            }, 1200);
          } else if (currentStepIndex === (currentRitualItem?.steps.length || 0) - 1) {
            setIsFinished(true);
            playTempleBellChime();
          }
        },
        onError: (err) => {
          console.warn("[GuidedPooja] Playback warning:", err);
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }
      }
    );
  };

  const handlePause = () => {
    pauseGuidedPoojaAudio();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleNextStep = (autoPlayNext = false) => {
    if (!currentRitualItem) return;
    if (currentStepIndex < currentRitualItem.steps.length - 1) {
      stopCurrentAudio();
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentJapaCount(0);
      if (autoPlayNext) {
        setTimeout(() => {
          void handlePlayCurrentStep();
        }, 300);
      }
    } else {
      setIsFinished(true);
      playTempleBellChime();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      stopCurrentAudio();
      setCurrentStepIndex((prev) => prev - 1);
      setCurrentJapaCount(0);
    }
  };

  const handleJumpToStep = (index: number) => {
    stopCurrentAudio();
    setCurrentStepIndex(index);
    setCurrentJapaCount(0);
    setIsFinished(false);
  };

  const markStepCompleted = (stepNum: number) => {
    const activeKey = currentRitualItem.key;
    setCompletedSteps((prev) => {
      const existing = prev[activeKey] || [];
      if (!existing.includes(stepNum)) {
        return { ...prev, [activeKey]: [...existing, stepNum] };
      }
      return prev;
    });
  };

  const handleIncrementJapa = () => {
    if (!currentStep?.japaTarget) return;
    setCurrentJapaCount((prev) => {
      const next = prev + 1;
      if (next >= (currentStep.japaTarget || 0)) {
        playTempleBellChime();
      }
      return next;
    });
  };

  const handleResetJapa = () => {
    setCurrentJapaCount(0);
  };

  // Play personalized Vedic Sankalpa audio in Sanskrit with chosen language intro
  const handlePlaySankalpaAudio = async () => {
    if (isPlayingSankalpa) {
      stopCurrentAudio();
      return;
    }

    stopCurrentAudio();
    playTempleBellChime();
    setIsPlayingSankalpa(true);

    const sanskritMantra = buildSanskritSankalpaMantra({
      devoteeName,
      gotra,
      purposeKey: sankalpaKey,
      customGoal,
      priestName
    });

    const localizedIntro = currentLang === "en"
      ? `Now reciting your personal Vedic Sankalpa on behalf of devotee ${devoteeName}.`
      : currentLang === "te"
      ? `ఇప్పుడు భక్తులు ${devoteeName} గారి తరపున వైదిక దేశ-కాల సంకల్ప పఠనం.`
      : currentLang === "ta"
      ? `இப்போது பக்தர் ${devoteeName} அவர்களின் சார்பில் வைதீக சங்கல்ப பாராயணம்.`
      : currentLang === "hi"
      ? `अब भक्त ${devoteeName} के निमित्त वैदिक देश-काल संकल्प पाठ।`
      : `ಈಗ ಭಕ್ತರಾದ ${devoteeName} ಅವರ ಪರವಾಗಿ ವೈದಿಕ ದೇಶ-ಕಾಲ ಸಂಕಲ್ಪ ಪಠಣ.`;

    const fullSankalpaSpoken = `${localizedIntro}\n\n${sanskritMantra}`;

    activeCancelRef.current = await speakGuidedPoojaStep(
      fullSankalpaSpoken,
      currentLang,
      {
        onStart: () => setIsPlayingSankalpa(true),
        onEnd: () => {
          setIsPlayingSankalpa(false);
          playTempleBellChime();
        },
        onError: () => setIsPlayingSankalpa(false)
      }
    );
  };

  const toggleSamagriItem = (id: string) => {
    setCheckedSamagri((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Localized string helpers
  const getStepTitle = (st: GuidedPoojaStep, l: SevaLang) => {
    if (l === "en") return st.titleEn;
    if (l === "hi" && st.titleHi) return st.titleHi;
    if (l === "te" && st.titleTe) return st.titleTe;
    if (l === "ta" && st.titleTa) return st.titleTa;
    return st.titleKn;
  };

  const getActionCue = (st: GuidedPoojaStep, l: SevaLang) => {
    if (l === "en") return st.actionCueEn;
    if (l === "hi" && st.actionCueHi) return st.actionCueHi;
    if (l === "te" && st.actionCueTe) return st.actionCueTe;
    if (l === "ta" && st.actionCueTa) return st.actionCueTa;
    return st.actionCueKn;
  };

  const getPriestNote = (st: GuidedPoojaStep, l: SevaLang) => {
    if (l === "en") return st.hiddenPriestInstructionEn;
    return st.hiddenPriestInstructionKn;
  };

  const totalSteps = currentRitualItem?.steps.length || 1;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const activeVrataSamagriCount = currentVrata?.samagriList?.length || 0;
  const checkedVrataSamagriCount = (currentVrata?.samagriList || []).filter((s) => checkedSamagri[s.id]).length;

  const localizedSankalpa = buildLocalizedSankalpaText(
    { devoteeName, gotra, purposeKey: sankalpaKey, customGoal, priestName },
    currentLang
  );
  const sankalpaPurposeOption = SANKALPA_PURPOSES[sankalpaKey] || SANKALPA_PURPOSES.kutumba;

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-amber-950 flex flex-col items-center pb-28 select-none">
      {/* 1. Top Sanctuary Header (Royal Cream & Gold with Temple Motif) */}
      <header className="w-full max-w-md mx-auto px-4 pt-3 pb-2.5 bg-gradient-to-b from-[#FFF9E6] to-[#FFFDF7] border-b-2 border-amber-400/80 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse" aria-hidden="true">🪔</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-amber-900 tracking-tight leading-tight">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಪೂಜಾ & ವ್ರತ ಮಾರ್ಗದರ್ಶನ ॥
                </h1>
              </div>
              <p className="text-[10px] text-amber-800/80 font-bold">
                🙏 {currentLang === "en" ? "Priest" : "ಪುರೋಹಿತರು"}: {priestName} · {currentLang === "en" ? "Devotee" : "ಭಕ್ತರು"}: {devoteeName} ({gotra} {currentLang === "en" ? "Gotra" : "ಗೋತ್ರ"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => playTempleBellChime()}
              className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-400/70 text-amber-900 text-sm shadow-xs active:scale-90 transition-transform"
              title="ಘಂಟಾನಾದ (Temple Bell Chime)"
              aria-label="Ring Temple Bell"
            >
              🔔
            </button>
            {onOpenConfigurator && (
              <button
                type="button"
                onClick={onOpenConfigurator}
                className="px-2 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-[11px] shadow-sm hover:from-amber-500 hover:to-amber-400 active:scale-95 transition-all"
                title="ಪೂಜಾ & ವ್ರತ ಆಯ್ಕೆ / ಲಿಂಕ್ ರಚನೆ"
              >
                ⚙️ {currentLang === "en" ? "Config" : "ಲಿಂಕ್ ರಚಿಸಿ"}
              </button>
            )}
          </div>
        </div>

        {/* 2. INSTANT MULTILINGUAL SCRIPT & VOICE SELECTOR (ಕನ್ನ | ENG | ತೆಲುಗು | தமிழ் | हिन्दी) */}
        <div className="mt-2 flex items-center justify-between gap-1.5">
          <span className="text-[10px] font-bold text-amber-800">
            🌐 {currentLang === "en" ? "Language" : "ಭಾಷೆ"}:
          </span>
          <div className="flex items-center gap-1 bg-[#FFF9E6] p-0.5 rounded-xl border border-amber-300/80">
            {(["kn", "en", "te", "ta", "hi"] as SevaLang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setCurrentLang(l)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                  currentLang === l
                    ? "bg-amber-600 text-white shadow-xs scale-[1.03]"
                    : "text-amber-900 hover:bg-amber-200/60"
                }`}
              >
                {l === "kn" ? "ಕನ್ನಡ" : l === "en" ? "ENG" : l === "te" ? "తెలుగు" : l === "ta" ? "தமிழ்" : "हिन्दी"}
              </button>
            ))}
          </div>
        </div>

        {/* 3. DUAL MAIN CATEGORY SWITCHER: 🪔 ನಿತ್ಯ ಪೂಜೆಗಳು | 🌸 ಪುಣ್ಯ ವ್ರತಗಳು */}
        <div className="mt-2 grid grid-cols-2 gap-1.5 p-1 bg-[#FFF8DC] border-2 border-amber-400/80 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setActiveCategory("poojas")}
            className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeCategory === "poojas"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md ring-2 ring-amber-500/50 scale-[1.02]"
                : "text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-300/40"
            }`}
          >
            <span>🪔</span>
            <span>{currentLang === "en" ? `Daily Poojas (${activePoojas.length})` : `ನಿತ್ಯ ಪೂಜಾ ವಿಧಿ (${activePoojas.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("vratas")}
            className={`py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              activeCategory === "vratas"
                ? "bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-md ring-2 ring-pink-500/50 scale-[1.02]"
                : "text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-300/40"
            }`}
          >
            <span>🌸</span>
            <span>{currentLang === "en" ? `Sacred Vratas (${activeVratas.length})` : `ವ್ರತ ಮಹಾವಿಧಿ (${activeVratas.length})`}</span>
          </button>
        </div>

        {/* 4. DYNAMIC SUBCATEGORY TABS (Cream & Gold Pill Slider) */}
        <div className="mt-2">
          <div
            className="flex items-center gap-1.5 p-1 bg-[#FFFBEA] border-2 border-amber-400/80 rounded-2xl shadow-inner overflow-x-auto no-scrollbar scroll-smooth"
            role="tablist"
            aria-label="Pooja & Vrata Selection Tabs"
          >
            {activeCategory === "poojas" ? (
              activePoojas.map((pooja) => {
                const isActive = pooja.key === selectedPoojaKey;
                const tabTitle = currentLang === "en" ? pooja.titleEn : pooja.titleKn;
                return (
                  <button
                    key={pooja.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedPoojaKey(pooja.key)}
                    className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md ring-2 ring-amber-500/50 scale-[1.02]"
                        : "text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-300/50"
                    }`}
                  >
                    <span className="text-sm" aria-hidden="true">{pooja.icon}</span>
                    <span className="whitespace-nowrap">{tabTitle}</span>
                  </button>
                );
              })
            ) : (
              activeVratas.map((vrata) => {
                const isActive = vrata.key === selectedVrataKey;
                const tabTitle = currentLang === "en" ? vrata.titleEn : vrata.titleKn;
                return (
                  <button
                    key={vrata.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedVrataKey(vrata.key)}
                    className={`shrink-0 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white shadow-md ring-2 ring-pink-500/50 scale-[1.02]"
                        : "text-amber-900 bg-amber-50/80 hover:bg-amber-100 border border-amber-300/50"
                    }`}
                  >
                    <span className="text-sm" aria-hidden="true">{vrata.icon}</span>
                    <span className="whitespace-nowrap">{tabTitle}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Mobile View Optimized */}
      <main className="w-full max-w-md mx-auto px-3 pt-3 pb-8 flex-1 flex flex-col gap-3">
        {/* Active Ritual Header Banner */}
        <div className="bg-[#FFFDF5] border-2 border-amber-400/70 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{currentRitualItem?.icon}</span>
              <h2 className="text-sm font-black text-amber-950 truncate">
                {currentLang === "en" ? currentRitualItem?.titleEn : currentRitualItem?.titleKn}
              </h2>
            </div>
            <p className="text-[11px] text-amber-800/80 font-medium truncate mt-0.5">
              {currentLang === "en" ? currentRitualItem?.subtitleEn : currentRitualItem?.subtitleKn}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-400/70">
            {currentLang === "en" ? currentRitualItem?.badgeTextEn : currentRitualItem?.badgeTextKn}
          </span>
        </div>

        {/* 5. PERSONALIZED SANKALPA CARD (Custom intentions: Marriage delay, Family, Exams, Job, Health, etc.) */}
        <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF6D6] border-2 border-amber-400/90 rounded-2xl p-3.5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{sankalpaPurposeOption.icon}</span>
              <span className="text-xs font-black text-amber-950">
                {localizedSankalpa.title}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePlaySankalpaAudio}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                isPlayingSankalpa
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
              title="ಸಂಕಲ್ಪ ಮಂತ್ರ ಶ್ರವಣ (Listen to Sanskrit Sankalpa)"
            >
              <span>{isPlayingSankalpa ? (currentLang === "en" ? "⏹️ Stop" : "⏹️ ನಿಲ್ಲಿಸಿ") : (currentLang === "en" ? "🔊 Listen Sankalpa" : "🔊 ಸಂಕಲ್ಪ ಪಠಣ")}</span>
            </button>
          </div>

          <p className="text-[11px] font-bold text-amber-900 leading-snug">
            {localizedSankalpa.summary} · {localizedSankalpa.intentionText}
          </p>
        </div>

        {/* 6. VRATA DETAILS & SAMAGRI CHECKLIST (Displayed exclusively when on Vrata tab) */}
        {activeCategory === "vratas" && currentVrata && (
          <div className="flex flex-col gap-2.5">
            {/* Vrata Purpose, Phala & Timing Card */}
            <div className="bg-[#FFFDF8] border-2 border-pink-400/70 rounded-2xl p-3 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-pink-900 tracking-wider flex items-center gap-1">
                  <span>🌸</span>
                  <span>{currentLang === "en" ? "Vrata Mahatmya & Purpose" : "ವ್ರತ ಮಹಾತ್ಮೆ & ಉದ್ದೇಶ"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVrataDetails(!showVrataDetails)}
                  className="text-[10px] font-bold text-pink-800 hover:underline"
                >
                  {showVrataDetails ? (currentLang === "en" ? "Collapse ▲" : "ಸಂಕ್ಷೇಪಿಸಿ ▲") : (currentLang === "en" ? "Details ▼" : "ವಿವರ ನೋಡಿ ▼")}
                </button>
              </div>

              {showVrataDetails && (
                <div className="space-y-2 pt-1 text-xs text-amber-950">
                  <div className="bg-pink-50/80 border border-pink-300/60 rounded-xl p-2.5">
                    <span className="font-black text-pink-900 block mb-0.5">
                      🎯 {currentLang === "en" ? "Why to do this Vrata:" : "ವ್ರತದ ಉದ್ದೇಶ & ಕಾರಣ:"}
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {currentLang === "en" ? currentVrata.purposeEn : currentVrata.purposeKn}
                    </p>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-300/60 rounded-xl p-2.5">
                    <span className="font-black text-amber-900 block mb-0.5">
                      🌟 {currentLang === "en" ? "Benefits (Phalashruti) to Expect:" : "ಫಲಶ್ರುತಿ (ಏನು ಫಲ ನಿರೀಕ್ಷಿಸಬಹುದು?):"}
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {currentLang === "en" ? currentVrata.benefitsEn : currentVrata.benefitsKn}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-300/60 rounded-xl p-2.5">
                    <span className="font-black text-emerald-900 block mb-0.5">
                      👤 {currentLang === "en" ? "Ideal For (Candidates):" : "ಯಾರಿಗೆ ವಿಶೇಷ ಫಲಕಾರಿ:"}
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {currentLang === "en" ? currentVrata.idealForEn : currentVrata.idealForKn}
                    </p>
                  </div>

                  <div className="bg-indigo-50/80 border border-indigo-300/60 rounded-xl p-2.5">
                    <span className="font-black text-indigo-900 block mb-0.5">
                      ⏰ {currentLang === "en" ? "Auspicious Muhurtha & Timing:" : "ಶುಭ ಮುಹೂರ್ತ & ಕಾಲ:"}
                    </span>
                    <p className="leading-relaxed text-[11px]">
                      {currentLang === "en" ? currentVrata.timingEn : currentVrata.timingKn}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SAMAGRI / INGREDIENTS CHECKLIST (ವಸ್ತು & ಸಾಮಗ್ರಿಗಳ ಪಟ್ಟಿ) */}
            <div className="bg-gradient-to-br from-[#FFFDF5] to-[#FFFBE8] border-2 border-amber-400 rounded-2xl p-3 shadow-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🧺</span>
                  <span className="text-xs font-black text-amber-950">
                    {currentLang === "en"
                      ? `Samagri Checklist (${checkedVrataSamagriCount}/${activeVrataSamagriCount} ready)`
                      : `ವಸ್ತು & ಸಾಮಗ್ರಿಗಳ ಪಟ್ಟಿ (${checkedVrataSamagriCount}/${activeVrataSamagriCount} ಸಿದ್ಧ)`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSamagriDrawer(!showSamagriDrawer)}
                  className="px-2 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-[10px] font-black text-amber-900 transition-colors"
                >
                  {showSamagriDrawer ? (currentLang === "en" ? "Close ▲" : "ಮುಚ್ಚಿ ▲") : (currentLang === "en" ? "Checklist ▼" : "ಪರಿಶೀಲಿಸಿ ▼")}
                </button>
              </div>

              {showSamagriDrawer && (
                <div className="pt-1.5 flex flex-col gap-1.5 max-h-72 overflow-y-auto no-scrollbar">
                  <p className="text-[10px] text-amber-800 font-bold mb-1">
                    {currentLang === "en"
                      ? "✓ Check off each sacred item before starting the vrata at home:"
                      : "✓ ಪೂಜೆ ಆರಂಭಿಸುವ ಮುನ್ನ ಪ್ರತಿಯೊಂದು ಸಾಮಗ್ರಿಯನ್ನೂ ಪರಿಶೀಲಿಸಿ ಟಿಕ್ ಮಾಡಿ:"}
                  </p>
                  {currentVrata.samagriList.map((item) => {
                    const isChecked = Boolean(checkedSamagri[item.id]);
                    const itemName = currentLang === "en" ? item.itemEn : item.itemKn;
                    const itemQty = currentLang === "en" ? item.quantityEn : item.quantityKn;
                    const itemNotes = currentLang === "en" ? (item.notesEn || item.notesKn) : item.notesKn;

                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                            : "bg-white/90 border-amber-200 text-amber-950"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSamagriItem(item.id)}
                          className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`font-black ${isChecked ? "line-through text-emerald-800" : ""}`}>
                              {itemName}
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded-md">
                              {itemQty}
                            </span>
                          </div>
                          {itemNotes && (
                            <p className="text-[10px] text-amber-700/80 mt-0.5 italic">
                              💡 {itemNotes}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        <div className="bg-amber-100/60 rounded-full h-2 w-full overflow-hidden border border-amber-300/60 mt-1">
          <div
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Step Navigation Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {currentRitualItem?.steps.map((st, idx) => {
            const isCur = idx === currentStepIndex;
            const activeKey = currentRitualItem.key;
            const isDone = (completedSteps[activeKey] || []).includes(st.step);
            const stepTitle = getStepTitle(st, currentLang);
            return (
              <button
                key={st.step}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                  isCur
                    ? "bg-amber-700 text-white shadow-xs ring-2 ring-amber-400"
                    : isDone
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-400"
                    : "bg-amber-50 text-amber-900 border border-amber-300/60"
                }`}
                title={stepTitle}
              >
                {isDone ? `✓ ${st.step}` : currentLang === "en" ? `Step ${st.step}` : `ಹಂತ ${st.step}`}
              </button>
            );
          })}
        </div>

        {/* 7. SACRED STEP CARD (Royal Cream Surface, Gold Border, Zero Black Theme) */}
        {currentStep && (
          <article className="bg-[#FFFDF8] border-2 border-amber-400 rounded-3xl p-4 shadow-md flex flex-col gap-3 relative overflow-hidden">
            {/* Subtle background sacred watermark */}
            <div
              className="absolute -right-8 -bottom-8 text-amber-900/5 text-8xl pointer-events-none select-none"
              aria-hidden="true"
            >
              🕉️
            </div>

            {/* Step Header */}
            <div className="flex items-start justify-between gap-2 border-b border-amber-200/80 pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-black text-amber-700 tracking-wider">
                  {currentLang === "en" ? `Step ${currentStep.step} / ${totalSteps}` : `ಹಂತ ${currentStep.step} / ${totalSteps}`}
                </span>
                <h3 className="text-base font-black text-amber-950 mt-0.5 flex items-center gap-1.5">
                  <span className="text-lg">{currentStep.icon}</span>
                  <span>{getStepTitle(currentStep, currentLang)}</span>
                </h3>
              </div>

              {/* Step Status Badge */}
              {(completedSteps[currentRitualItem.key] || []).includes(currentStep.step) ? (
                <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-400">
                  {currentLang === "en" ? "✓ Done" : "✓ ಪೂರ್ಣಗೊಂಡಿದೆ"}
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-300">
                  {currentLang === "en" ? "In Progress" : "ಸಾಧನೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ"}
                </span>
              )}
            </div>

            {/* ACTION CUE (Crucial physical ritual instruction shown clearly to devotee) */}
            <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border border-amber-300 rounded-2xl p-2.5 shadow-xs flex items-center gap-2">
              <span className="text-lg shrink-0">👉</span>
              <p className="text-xs font-black text-amber-950 leading-snug">
                {getActionCue(currentStep, currentLang)}
              </p>
            </div>

            {/* SACRED MANTRA (Display in devotee's reading script or Sanskrit Devanagari per User Mandate) */}
            <div className="bg-[#FFFCF0] border-2 border-amber-300/80 rounded-2xl p-3.5 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  {currentLang === "en" ? "🕉️ Sacred Vedic Mantra & Japa" : "🕉️ ಪವಿತ್ರ ವೇದ ಮಂತ್ರ & ಜಪ"}
                </span>
                <button
                  type="button"
                  onClick={() => setForceSanskritScript(!forceSanskritScript)}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400/80 bg-amber-100/70 hover:bg-amber-200/80 font-bold text-amber-900 transition-colors active:scale-95 shadow-2xs"
                  title="ಲಿಪಿ ಬದಲಾಯಿಸಿ (Toggle Reading Script / Sanskrit Devanagari)"
                >
                  {forceSanskritScript
                    ? (currentLang === "en" ? "📖 Translated Script" : "📖 ಭಾಷಾ ಲಿಪಿ")
                    : (currentLang === "en" ? "🕉️ Sanskrit Devanagari" : "🕉️ ಸಂಸ್ಕೃತ ದೇವನಾಗರಿ")}
                </button>
              </div>
              <div className="font-serif text-sm sm:text-base font-bold text-amber-950 leading-relaxed whitespace-pre-line">
                {forceSanskritScript
                  ? currentStep.mantraSanskrit
                  : (currentStep.mantraL5?.[currentLang] || currentStep.mantraSanskrit)}
              </div>
            </div>

            {/* INTERACTIVE JAPA COUNTER (If this step includes Japa, e.g. 28x or 108x) */}
            {currentStep.japaTarget && (
              <div className="bg-gradient-to-b from-[#FFFBE6] to-[#FFF8DC] border-2 border-amber-400/90 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">📿</span>
                    <span className="text-xs font-black text-amber-900">
                      {currentLang === "en"
                        ? `Japa Target: ${currentStep.japaTarget} times`
                        : `ಜಪ ಸಂಖ್ಯೆ ಗುರಿ: ${currentStep.japaTarget} ಬಾರಿ`}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-800">
                    {currentJapaCount} / {currentStep.japaTarget}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="bg-amber-200/80 rounded-full h-2 w-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full transition-all duration-200"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentJapaCount / (currentStep.japaTarget || 1)) * 100
                      )}%`
                    }}
                  />
                </div>

                {/* Tap to count buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleIncrementJapa}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 text-xs font-black shadow-md hover:from-amber-500 hover:to-amber-400 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>📿</span>
                    <span>{currentLang === "en" ? "Count Japa (+1)" : "ಜಪ ಎಣಿಕೆ (+೧)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetJapa}
                    className="px-3 py-2 rounded-xl bg-amber-200/70 text-amber-900 hover:bg-amber-300 text-xs font-bold transition-colors"
                    title="ರೀಸೆಟ್"
                  >
                    {currentLang === "en" ? "Reset" : "ರೀಸೆಟ್"}
                  </button>
                </div>
              </div>
            )}

            {/* PRIEST BACKGROUND INSTRUCTION NOTES (Collapsible for deep ritual understanding) */}
            <div className="border-t border-amber-200/70 pt-2">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 transition-colors"
              >
                <span>📜</span>
                <span>
                  {currentLang === "en"
                    ? `Priest Prayoga Notes ${showNotes ? "▲" : "▼"}`
                    : `ಪುರೋಹಿತರ ಪ್ರಕ್ರಿಯೆ & ವಿಧಿ ಟಿಪ್ಪಣಿ ${showNotes ? "▲" : "▼"}`}
                </span>
              </button>
              {showNotes && (
                <div className="mt-2 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs font-medium text-amber-900 leading-relaxed">
                  <p>💡 {getPriestNote(currentStep, currentLang)}</p>
                </div>
              )}
            </div>
          </article>
        )}
      </main>

      {/* 8. FLOATING AUDIO & NAVIGATION CONTROLLER (Sticky Bottom Bar) */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7] to-transparent z-40">
        <div className="bg-[#FFFDF5] border-2 border-amber-400/90 rounded-2xl p-2.5 shadow-xl flex items-center justify-between gap-2">
          {/* Previous Step Button */}
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform"
            title="ಹಿಂದಿನ ಹಂತ (Previous Step)"
            aria-label="Previous Step"
          >
            ⏮️
          </button>

          {/* Core Audio Play / Pause Button with Sanskrit TTS Voice Engine */}
          <div className="flex-1 flex items-center justify-center">
            {isPlaying ? (
              <button
                type="button"
                onClick={handlePause}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>⏸️</span>
                <span>{currentLang === "en" ? "Pause" : "ವಿರಾಮ (Pause)"}</span>
              </button>
            ) : isPaused ? (
              <button
                type="button"
                onClick={() => void handlePlayCurrentStep()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>▶️</span>
                <span>{currentLang === "en" ? "Resume" : "ಮುಂದುವರಿಸಿ (Resume)"}</span>
              </button>
            ) : isLoadingAudio ? (
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 rounded-xl bg-amber-300 text-amber-900 font-black text-xs shadow-md flex items-center justify-center gap-2 animate-pulse"
              >
                <span>⏳</span>
                <span>{currentLang === "en" ? "Preparing Vedic Chants..." : "ವೇದ ಮಂತ್ರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handlePlayCurrentStep()}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 hover:from-amber-500 hover:to-amber-300 active:scale-95 transition-all"
              >
                <span>🔊</span>
                <span>
                  {currentLang === "en"
                    ? "Priest Guidance & Sanskrit Mantras"
                    : currentLang === "te"
                    ? "మంత్ర శ్రవణం & పూజా విధానం"
                    : currentLang === "ta"
                    ? "மந்திர பாராயணம் & பூஜை முறை"
                    : currentLang === "hi"
                    ? "मन्त्र श्रवण एवं पूजा विधि"
                    : "ಪುರೋಹಿತರ ಮಾರ್ಗದರ್ಶನ & ಮಂತ್ರ ಶ್ರವಣ"}
                </span>
              </button>
            )}
          </div>

          {/* Next Step Button */}
          <button
            type="button"
            onClick={() => handleNextStep(false)}
            disabled={!currentRitualItem || currentStepIndex === currentRitualItem.steps.length - 1}
            className="p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-transform"
            title="ಮುಂದಿನ ಹಂತ (Next Step)"
            aria-label="Next Step"
          >
            ⏭️
          </button>

          {/* Auto Advance Toggle */}
          <button
            type="button"
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`p-2 rounded-xl text-[11px] font-black border transition-colors ${
              autoAdvance
                ? "bg-amber-200 border-amber-400 text-amber-950"
                : "bg-white border-amber-200 text-amber-700"
            }`}
            title={autoAdvance ? "Auto-advance ON" : "Auto-advance OFF"}
          >
            {autoAdvance ? (currentLang === "en" ? "⚡Auto" : "⚡ಆಟೋ") : (currentLang === "en" ? "✋Manual" : "✋ಮ್ಯಾನುಯಲ್")}
          </button>
        </div>
      </footer>
    </div>
  );
};
