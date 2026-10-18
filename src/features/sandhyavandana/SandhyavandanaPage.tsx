/**
 * Baggona Panchanga - Authentic Karnataka Vedic Sandhyavandana Master Page
 * Designed in luxury cream & sacred gold temple aesthetic.
 *
 * Features:
 * 1. Trikaala Sandhyavandana (Pratah, Madhyahna, Sayam) with auto-time detection
 * 2. Complete Step-by-Step Guided Ritual (Aachamana to Samarpana)
 * 3. Individual Mantra Learning & Priest Audio Player (with synthesizeAndPlayClonedVoice)
 * 4. Comprehensive Gotra Pravara Studio with personalized Abhivadana generator
 * 5. 4 Sacred Mahamantras Suite (Gayatri, Om Namah Shivaya, Om Namo Narayanaya, Gotra Pravara)
 * 6. 3-Month (90-day) Shareable Link Generator & Database validation
 */

import React, { useState, useEffect, useRef } from "react";
import {
  SANDHYA_PERIODS,
  SANDHYAVANDANA_STEPS,
  GOTRA_CATALOG,
  FEATURED_MANTRA_SUITE,
  detectCurrentSandhyaPeriod,
  buildPersonalizedAbhivadana
} from "./sandhyavandanaData";
import type { SandhyaPeriod, SandhyaStep, GotraItem, FeaturedMantraItem, SandhyavandanaSession } from "./sandhyavandanaTypes";
import {
  getSandhyavandanaSession,
  updateSandhyavandanaProgress,
  decodeSecureSandhyavandanaToken
} from "./sandhyavandanaDbService";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../audio/aiVoiceCloneEngine";
import type { SevaLang } from "../seva/sevaLocale";

export const SandhyavandanaPage: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"guided" | "learning" | "gotra" | "mahamantras">("guided");
  const [selectedPeriod, setSelectedPeriod] = useState<SandhyaPeriod>("pratah");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Gotra Pravara State
  const [selectedGotraId, setSelectedGotraId] = useState<string>("vashishta_traya");
  const [devoteeNameInput, setDevoteeNameInput] = useState<string>("ಶ್ರೀರಾಮ");

  // Mahamantras State
  const [selectedMahamantraId, setSelectedMahamantraId] = useState<string>("gayatri");
  const [japaTarget, setJapaTarget] = useState<number>(28);
  const [japaCurrentCount, setJapaCurrentCount] = useState<number>(0);

  // Priest Voice Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const activeVoiceCancelRef = useRef<(() => void) | null>(null);

  // 3-Month Shareable Link & Database Session State
  const [session, setSession] = useState<SandhyavandanaSession | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(false);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [daysRemaining, setDaysRemaining] = useState<number>(90);

  // Auto-detect current Sandhya period on load
  useEffect(() => {
    const detected = detectCurrentSandhyaPeriod();
    setSelectedPeriod(detected);
  }, []);

  // Filter steps applicable to the selected period
  const applicableSteps = SANDHYAVANDANA_STEPS.filter((step) =>
    step.applicablePeriods.includes(selectedPeriod)
  );

  const currentStep: SandhyaStep | undefined = applicableSteps[currentStepIdx] || applicableSteps[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopClonedAudio();
      if (activeVoiceCancelRef.current) {
        activeVoiceCancelRef.current();
        activeVoiceCancelRef.current = null;
      }
    };
  }, []);

  // -------------------------------------------------------------
  // Check for incoming 3-Month Link Token (?token=... or ?id=...)
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function checkTokenParam() {
      if (typeof window === "undefined") return;
      const urlParams = new URLSearchParams(window.location.search);
      const rawToken = urlParams.get("token") || urlParams.get("svToken") || urlParams.get("id");

      if (!rawToken) return;

      setLoadingSession(true);
      const decoded = decodeSecureSandhyavandanaToken(rawToken);

      if (decoded.isValid && decoded.sessionId) {
        if (decoded.isExpired) {
          if (!isMounted) return;
          setSessionExpired(true);
          setLoadingSession(false);
          return;
        }

        const data = await getSandhyavandanaSession(decoded.sessionId);
        if (!isMounted) return;

        if (data) {
          setSession(data);
          if (data.devoteeName) setDevoteeNameInput(data.devoteeName);
          if (data.devoteeGotraId) setSelectedGotraId(data.devoteeGotraId);
          if (data.preferredPeriod) setSelectedPeriod(data.preferredPeriod);

          // Calculate remaining days
          const diffMs = new Date(data.expiresAt).getTime() - Date.now();
          const remDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          setDaysRemaining(remDays);
          if (remDays <= 0) {
            setSessionExpired(true);
          }
        }
      } else {
        // Direct ID lookup fallback
        const data = await getSandhyavandanaSession(rawToken);
        if (!isMounted) return;
        if (data) {
          setSession(data);
          const diffMs = new Date(data.expiresAt).getTime() - Date.now();
          const remDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          setDaysRemaining(remDays);
          if (remDays <= 0) setSessionExpired(true);
        }
      }

      setLoadingSession(false);
    }

    void checkTokenParam();
  }, []);

  // -------------------------------------------------------------
  // Audio Narrator Controller (Priest Voice)
  // -------------------------------------------------------------
  const playPriestAudio = async (textToSpeak: string, itemId: string, lang: SevaLang | "sa" = "kn") => {
    if (isPlayingAudio && playingItemId === itemId) {
      stopClonedAudio();
      if (activeVoiceCancelRef.current) {
        activeVoiceCancelRef.current();
        activeVoiceCancelRef.current = null;
      }
      setIsPlayingAudio(false);
      setPlayingItemId(null);
      return;
    }

    stopClonedAudio();
    if (activeVoiceCancelRef.current) {
      activeVoiceCancelRef.current();
      activeVoiceCancelRef.current = null;
    }

    setIsPlayingAudio(true);
    setPlayingItemId(itemId);

    try {
      const cancelFn = await synthesizeAndPlayClonedVoice(
        textToSpeak,
        lang,
        "voice_sriram_pandit",
        () => {
          setIsPlayingAudio(false);
          setPlayingItemId(null);
          activeVoiceCancelRef.current = null;
        },
        () => {
          setIsPlayingAudio(true);
          setPlayingItemId(itemId);
        }
      );
      activeVoiceCancelRef.current = cancelFn;
    } catch (e) {
      console.warn("[SandhyavandanaPage] Priest audio playback notice:", e);
      setIsPlayingAudio(false);
      setPlayingItemId(null);
    }
  };

  // -------------------------------------------------------------
  // Step Navigation in Guided Mode
  // -------------------------------------------------------------
  const handleNextStep = () => {
    stopClonedAudio();
    setIsPlayingAudio(false);
    setPlayingItemId(null);
    if (currentStepIdx < applicableSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Completed full ritual!
      if (session) {
        void updateSandhyavandanaProgress(session.id, {
          completedRounds: (session.completedRounds || 0) + 1,
          lastActivePeriod: selectedPeriod
        });
      }
      alert("ಅಭಿನಂದನೆಗಳು! ತಮ್ಮ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿಯು ಯಶಸ್ವಿಯಾಗಿ ಸಂಪೂರ್ಣಗೊಂಡಿದೆ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಅನುಗ್ರಹವು ಸದಾ ನಿಮ್ಮ ಮೇಲಿರಲಿ.");
      setCurrentStepIdx(0);
    }
  };

  const handlePrevStep = () => {
    stopClonedAudio();
    setIsPlayingAudio(false);
    setPlayingItemId(null);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const personalizedAbhivadana = buildPersonalizedAbhivadana(selectedGotraId, devoteeNameInput);
  const activePeriodMeta = SANDHYA_PERIODS[selectedPeriod];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-amber-950 flex flex-col items-center selection:bg-amber-200 font-sans pb-16">
      {/* -------------------------------------------------------------
          Sacred Top Temple Masthead & Insignia
          ------------------------------------------------------------- */}
      <header className="w-full bg-gradient-to-b from-[#2D1810] via-[#3E1F14] to-[#2D1810] text-amber-100 border-b-3 border-amber-500 shadow-xl px-4 py-3 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center text-2xl shadow-md border border-amber-300">
              🕉️
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-serif font-black tracking-wide text-amber-200">
                ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ವೈದಿಕ ಸಂಧ್ಯಾವಂದನಾ ಕಾರ್ಯಕ್ರಮ ॥
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-300/90 font-medium">
                ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪರಂಪರೆ • ಋಗ್ವೇದ & ಯಜುರ್ವೇದ ತ್ರಿಕಾಲ ಸಂಧ್ಯೋಪಾಸನಾ ವಿಧಿ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <a
              href="tel:9972339362"
              className="bg-amber-900/90 hover:bg-amber-950 text-amber-200 font-serif text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-400/50 shadow-xs transition"
            >
              📞 ಪಂಡಿತ ಸಂಪರ್ಕ
            </a>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------
          Session Active / Expiry Status Banner
          ------------------------------------------------------------- */}
      {sessionExpired ? (
        <div className="w-full bg-red-100 border-b-2 border-red-400 p-3 text-center text-red-900 text-xs font-bold animate-in fade-in">
          ⚠️ ಈ ಸಂಧ್ಯಾವಂದನಾ ಲಿಂಕ್‌ನ ೩ ತಿಂಗಳ (೯೦ ದಿನಗಳ) ಮಾನ್ಯತೆಯ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಹೊಸ ಲಿಂಕ್ ಪಡೆಯಲು ದಯವಿಟ್ಟು ಮುಖ್ಯ ಅರ್ಚಕರನ್ನು ಸಂಪರ್ಕಿಸಿ: <a href="tel:9972339362" className="underline font-black">9972339362</a>.
        </div>
      ) : session ? (
        <div className="w-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border-b border-amber-300 px-3 py-1.5 text-xs text-amber-900 flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-base">👤</span>
            <span className="font-bold">{session.devoteeName}</span>
            <span className="text-stone-500">({GOTRA_CATALOG.find((g) => g.id === session.devoteeGotraId)?.nameKn || "ವಸಿಷ್ಠ ಗೋತ್ರ"})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold text-[11px] border border-amber-400">
              ⏳ {daysRemaining} ದಿನಗಳು ಬಾಕಿ (೩ ತಿಂಗಳ ಮಾನ್ಯತೆ)
            </span>
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-4xl px-3 pt-4 space-y-4">
        {/* -------------------------------------------------------------
            Trikaala Sandhya Period Selector & Auto-Detection Chips
            ------------------------------------------------------------- */}
        <div className="bg-white/95 border-2 border-amber-300 rounded-2xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold border-b border-amber-200 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span>⏱️ ಸಂಧ್ಯಾ ಕಾಲ ಆಯ್ಕೆ:</span>
              <span className="font-serif text-amber-800">
                (ಪ್ರಸ್ತುತ ಸಮಯಕ್ಕೆ ತಕ್ಕಂತೆ ಆಟೋ-ಸೆಲೆಕ್ಟ್ ಆಗಿದೆ)
              </span>
            </span>
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              ಅರ್ಘ್ಯ ನಿರ್ದೇಶನ: {activePeriodMeta.arghyaDirectionKn}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(Object.keys(SANDHYA_PERIODS) as SandhyaPeriod[]).map((periodKey) => {
              const meta = SANDHYA_PERIODS[periodKey];
              const isSelected = selectedPeriod === periodKey;
              return (
                <button
                  key={periodKey}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(periodKey);
                    setCurrentStepIdx(0);
                    stopClonedAudio();
                    setIsPlayingAudio(false);
                    setPlayingItemId(null);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white border-amber-500 shadow-md scale-[1.01]"
                      : "bg-[#FAF6EE] border-amber-200 text-amber-950 hover:bg-amber-100 hover:border-amber-300"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <span>{meta.icon}</span>
                      <span>{meta.titleKn}</span>
                    </div>
                    <div className={`text-[10px] ${isSelected ? "text-amber-200" : "text-stone-500"}`}>
                      {meta.timeRangeKn}
                    </div>
                  </div>
                  {isSelected && <span className="text-base font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------------------------------------
            Primary Feature Navigation Tabs (4 Pillars)
            ------------------------------------------------------------- */}
        <div className="flex items-center justify-between gap-1.5 bg-amber-100/80 p-1.5 rounded-2xl border border-amber-300 text-xs overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("guided")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              activeTab === "guided"
                ? "bg-amber-800 text-white shadow-md"
                : "text-amber-900 hover:bg-amber-200/60"
            }`}
          >
            <span>🪷</span>
            <span>ಪೂರ್ಣ ಸಂಧ್ಯಾವಂದನಾ ವಿಧಿ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("learning")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              activeTab === "learning"
                ? "bg-amber-800 text-white shadow-md"
                : "text-amber-900 hover:bg-amber-200/60"
            }`}
          >
            <span>📖</span>
            <span>ಮಂತ್ರ ಶ್ರವಣ & ಕಲಿಯುವಿಕೆ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gotra")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              activeTab === "gotra"
                ? "bg-amber-800 text-white shadow-md"
                : "text-amber-900 hover:bg-amber-200/60"
            }`}
          >
            <span>📜</span>
            <span>ಗೋತ್ರ ಪ್ರವರ ದರ್ಪಣ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mahamantras")}
            className={`flex-1 py-2 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center justify-center gap-1.5 ${
              activeTab === "mahamantras"
                ? "bg-amber-800 text-white shadow-md"
                : "text-amber-900 hover:bg-amber-200/60"
            }`}
          >
            <span>✨</span>
            <span>೪ ಮಹಾಮಂತ್ರಗಳು</span>
          </button>
        </div>

        {/* =============================================================
            TAB 1: ಪೂರ್ಣ ಸಂಧ್ಯಾವಂದನಾ ಮಹಾವಿಧಿ (Complete Step-by-Step Guided Ritual)
            ============================================================= */}
        {activeTab === "guided" && currentStep && (
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
            {/* Step Header with Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-amber-200 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                  ಹಂತ {currentStepIdx + 1} / {applicableSteps.length}
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-black text-amber-950 mt-1">
                  {currentStep.titleKn}
                </h2>
                <p className="text-xs text-stone-500">{currentStep.titleEn}</p>
              </div>

              {/* Priest Audio Guidance Button */}
              <button
                type="button"
                onClick={() =>
                  playPriestAudio(
                    `${currentStep.priestSpokenInstructionKn} ${currentStep.mantraKannada}`,
                    `step_${currentStep.id}`
                  )
                }
                className={`font-serif text-xs font-bold px-4 py-2 rounded-xl shadow-md border transition flex items-center gap-2 active:scale-95 ${
                  isPlayingAudio && playingItemId === `step_${currentStep.id}`
                    ? "bg-red-600 text-white border-red-700 animate-pulse"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-400 hover:from-amber-700 hover:to-amber-800"
                }`}
              >
                <span>{isPlayingAudio && playingItemId === `step_${currentStep.id}` ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🎙️ ಪಂಡಿತರ ಧ್ವನಿ ಶ್ರವಣ"}</span>
              </button>
            </div>

            {/* Action Cue (ಕೈಕರಣ / ಮುದ್ರೆ / ಭಂಗಿ) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3.5 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl mt-0.5 shrink-0">{currentStep.icon}</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-900">
                    ಕೈಕರಣ & ಆಚರಣೆ (Physical Gesture & Action Cue):
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                    {currentStep.actionCueKn}
                  </p>
                  <p className="text-[11px] text-stone-600 font-sans">
                    {currentStep.kaikaranaNotesKn}
                  </p>
                </div>
              </div>
            </div>

            {/* Sanskrit / Kannada Mantra Display */}
            <div className="bg-[#FAF6EE] border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-inner space-y-3">
              <div className="text-[11px] font-bold text-amber-800 tracking-wider flex items-center justify-between">
                <span>॥ ಪವಿತ್ರ ವೇದ ಮಂತ್ರ ಪಾಠ ॥</span>
                <span className="text-[10px] text-stone-500 font-normal">ಕರ್ನಾಟಕ ಶಾಸ್ತ್ರೀಯ ಉಚ್ಛಾರಣೆ</span>
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-amber-950 whitespace-pre-line leading-relaxed tracking-wide bg-white/80 p-3.5 rounded-xl border border-amber-200">
                {currentStep.mantraKannada}
              </div>
            </div>

            {/* Meaning & Spiritual Significance */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">ಭಾವಾರ್ಥ & ರಹಸ್ಯ:</span>
              <p className="text-stone-700 leading-relaxed font-sans">{currentStep.meaningKn}</p>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold font-serif bg-stone-100 hover:bg-amber-100 text-stone-700 disabled:opacity-40 border border-stone-300 transition"
              >
                ◀ ಹಿಂದಿನ ಹಂತ
              </button>

              <div className="text-xs font-serif font-bold text-amber-900">
                ಹಂತ {currentStepIdx + 1} / {applicableSteps.length}
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-serif bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-md active:scale-95 transition"
              >
                {currentStepIdx === applicableSteps.length - 1 ? "✓ ಸಂಧ್ಯಾವಂದನೆ ಸಂಪೂರ್ಣ" : "ಮುಂದಿನ ಹಂತ ▶"}
              </button>
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 2: ಮಂತ್ರ ಶ್ರವಣ & ಕಲಿಯುವಿಕೆ (Mantra Learning & Audio Player)
            ============================================================= */}
        {activeTab === "learning" && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm text-xs text-amber-900">
              <p className="font-bold">
                🎧 ಸಂಧ್ಯಾವಂದನೆಯ ಪ್ರತ್ಯೇಕ ಮಂತ್ರಗಳನ್ನು ಇಲ್ಲಿ ಆಲಿಸಿ ಕಲಿಯಬಹುದು.
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">
                ಪ್ರತಿಯೊಂದು ಮಂತ್ರದ ಪಕ್ಕದಲ್ಲಿರುವ ಆಡಿಯೋ ಬಟನ್ ಒತ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ನೇರ ವೇದ ಉಚ್ಛಾರಣೆಯನ್ನು ಆಲಿಸಿ ಅನುಸರಿಸಿ.
              </p>
            </div>

            <div className="space-y-2.5">
              {applicableSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-3.5 shadow-xs transition space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold font-serif text-sm text-amber-950">
                        {step.titleKn}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        playPriestAudio(
                          `${step.priestSpokenInstructionKn} ${step.mantraKannada}`,
                          `learn_${step.id}`
                        )
                      }
                      className={`text-xs font-serif font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                        isPlayingAudio && playingItemId === `learn_${step.id}`
                          ? "bg-red-600 text-white border-red-700 animate-pulse"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                      }`}
                    >
                      <span>{isPlayingAudio && playingItemId === `learn_${step.id}` ? "⏹️ ನಿಲ್ಲಿಸಿ" : "▶ ಆಲಿಸಿ"}</span>
                    </button>
                  </div>

                  <div className="text-xs font-serif text-amber-950 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 whitespace-pre-line leading-relaxed">
                    {step.mantraKannada}
                  </div>

                  <div className="text-[11px] text-stone-600 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>{step.actionCueKn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 3: ಗೋತ್ರ ಪ್ರವರ ದರ್ಪಣ (Gotra Pravara Studio & Abhivadana)
            ============================================================= */}
        {activeTab === "gotra" && (
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 animate-in fade-in duration-300">
            <div className="border-b-2 border-amber-200 pb-3">
              <h2 className="text-lg sm:text-xl font-serif font-black text-amber-950">
                ॥ ಗೋತ್ರ ಪ್ರವರ ದರ್ಪಣ & ಅಭಿವಾದನ ಕಲಿಯುವಿಕೆ ॥
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                ನಿಮ್ಮ ಗೋತ್ರವನ್ನು ಆರಿಸಿ, ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ — ತಕ್ಷಣವೇ ನಿಮ್ಮ ಅಧಿಕೃತ ಅಭಿವಾದನ ಮಂತ್ರವು ರಚನೆಯಾಗುತ್ತದೆ.
              </p>
            </div>

            {/* Inputs: Devotee Name & Gotra Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">
                  ನಿಮ್ಮ ಹೆಸರು (ದೇವದತ್ತ / ಶ್ರೀರಾಮ):
                </label>
                <input
                  type="text"
                  value={devoteeNameInput}
                  onChange={(e) => setDevoteeNameInput(e.target.value)}
                  placeholder="ಉದಾಹರಣೆಗೆ: ಶ್ರೀರಾಮ"
                  className="w-full bg-[#FAF6EE] border-2 border-amber-300 rounded-xl px-3 py-2 text-sm text-amber-950 focus:outline-hidden focus:border-amber-600 font-serif"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 block">
                  ನಿಮ್ಮ ಗೋತ್ರವನ್ನು ಆರಿಸಿ (೧೬+ ಗೋತ್ರಗಳು):
                </label>
                <select
                  value={selectedGotraId}
                  onChange={(e) => setSelectedGotraId(e.target.value)}
                  className="w-full bg-[#FAF6EE] border-2 border-amber-300 rounded-xl px-3 py-2 text-sm text-amber-950 focus:outline-hidden focus:border-amber-600 font-serif"
                >
                  {GOTRA_CATALOG.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameKn} ({g.pravaraTypeKn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generated Personalized Abhivadana Formula Card */}
            <div className="bg-gradient-to-br from-[#FAF6EE] to-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-900 font-bold border-b border-amber-300/80 pb-2">
                <span className="flex items-center gap-1.5">
                  <span>📜 ನಿಮ್ಮ ವೈದಿಕ ಅಭಿವಾದನ ಮಂತ್ರ:</span>
                  <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md text-[10px]">
                    {GOTRA_CATALOG.find((g) => g.id === selectedGotraId)?.pravaraTypeKn}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    playPriestAudio(
                      `ಈಗ ನಿಮ್ಮ ಗೋತ್ರ ಪ್ರವರ ಅಭಿವಾದನ. ಬಲಗೈಯಿಂದ ಬಲಕಿವಿಯನ್ನು, ಎಡಗೈಯಿಂದ ಎಡಕಿವಿಯನ್ನು ಸ್ಪರ್ಶಿಸಿ ನಮಸ್ಕರಿಸಿ: ${personalizedAbhivadana.kn}`,
                      "gotra_audio"
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition flex items-center gap-1.5 shadow-sm ${
                    isPlayingAudio && playingItemId === "gotra_audio"
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-amber-700 hover:bg-amber-800 text-white"
                  }`}
                >
                  <span>{isPlayingAudio && playingItemId === "gotra_audio" ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🎙️ ಪಂಡಿತ ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ"}</span>
                </button>
              </div>

              <div className="text-base sm:text-lg font-serif font-black text-amber-950 leading-relaxed bg-white/90 p-4 rounded-xl border border-amber-300 shadow-inner">
                {personalizedAbhivadana.kn}
              </div>

              <div className="text-xs text-stone-600 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">ಋಷಿ ಪ್ರವರ ವಿವರ:</span>
                <p>
                  ಮೂಲ ಋಷಿಗಳು: {GOTRA_CATALOG.find((g) => g.id === selectedGotraId)?.pravaraRishisKn}
                </p>
                <p className="text-[11px] text-stone-500 font-sans">
                  ಕೈಕರಣ: ಎರಡೂ ಕೈಗಳಿಂದ ಕಿವಿಯನ್ನು ಹಿಡಿದು (ಬಲಗೈ ಬಲಕಿವಿಗೆ, ಎಡಗೈ ಎಡಕಿವಿಗೆ) ಮಂತ್ರ ಪಠಿಸಿ ಭೂಮಿಗೆ ಬಾಗಿ ಸಾಷ್ಟಾಂಗ ಪ್ರಣಾಮ ಸಲ್ಲಿಸಬೇಕು.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================
            TAB 4: ೪ ಮಹಾಮಂತ್ರಗಳು (4 Sacred Mahamantras Suite)
            ============================================================= */}
        {activeTab === "mahamantras" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Quick Mahamantra Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FEATURED_MANTRA_SUITE.map((m) => {
                const isSelected = selectedMahamantraId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMahamantraId(m.id);
                      setJapaCurrentCount(0);
                      stopClonedAudio();
                      setIsPlayingAudio(false);
                      setPlayingItemId(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? "bg-gradient-to-b from-amber-600 to-amber-800 text-white border-amber-500 shadow-md"
                        : "bg-white border-amber-200 text-amber-950 hover:bg-amber-50"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-xs font-serif font-bold leading-tight line-clamp-1">
                      {m.titleKn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Mahamantra Deep Card */}
            {(() => {
              const activeMantra =
                FEATURED_MANTRA_SUITE.find((m) => m.id === selectedMahamantraId) ||
                FEATURED_MANTRA_SUITE[0];

              return (
                <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-amber-200 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                        {activeMantra.deityKn}
                      </span>
                      <h2 className="text-lg sm:text-xl font-serif font-black text-amber-950 mt-1">
                        {activeMantra.titleKn}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        playPriestAudio(
                          `${activeMantra.mantraKannada} ${activeMantra.meaningKn}`,
                          `mahamantra_${activeMantra.id}`
                        )
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 shadow-md ${
                        isPlayingAudio && playingItemId === `mahamantra_${activeMantra.id}`
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800"
                      }`}
                    >
                      <span>{isPlayingAudio && playingItemId === `mahamantra_${activeMantra.id}` ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🎙️ ಪಂಡಿತ ಧ್ವನಿ ಶ್ರವಣ"}</span>
                    </button>
                  </div>

                  {/* Sacred Mantra Text */}
                  <div className="bg-[#FAF6EE] border-2 border-amber-300/80 rounded-2xl p-5 text-center shadow-inner space-y-2">
                    <div className="text-base sm:text-xl font-serif font-black text-amber-950 leading-relaxed tracking-wide">
                      {activeMantra.mantraKannada}
                    </div>
                  </div>

                  {/* Meaning & Significance */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
                    <div>
                      <span className="font-bold text-amber-900 block">ಪಾವನ ಭಾವಾರ್ಥ:</span>
                      <p className="text-stone-700 leading-relaxed font-sans">{activeMantra.meaningKn}</p>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">ಮಹತ್ವ & ಫಲಶ್ರುತಿ:</span>
                      <p className="text-stone-700 leading-relaxed font-sans">{activeMantra.significanceKn}</p>
                    </div>
                  </div>

                  {/* Interactive Japa Bead Counter */}
                  <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900">ಜಪ ಗುರಿ:</span>
                      {activeMantra.japaOptions.map((target) => (
                        <button
                          key={target}
                          type="button"
                          onClick={() => {
                            setJapaTarget(target);
                            setJapaCurrentCount(0);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                            japaTarget === target
                              ? "bg-amber-800 text-white border-amber-900 shadow-xs"
                              : "bg-white text-amber-900 border-amber-300 hover:bg-amber-200"
                          }`}
                        >
                          {target}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-500 block">ಪ್ರಸ್ತುತ ಜಪ</span>
                        <span className="font-mono text-lg font-black text-amber-950">
                          {japaCurrentCount} / {japaTarget}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (japaCurrentCount < japaTarget) {
                            setJapaCurrentCount(japaCurrentCount + 1);
                          } else {
                            alert(`ಅಭಿನಂದನೆಗಳು! ${japaTarget} ಬಾರಿ ಜಪ ಸಂಪೂರ್ಣವಾಯಿತು.`);
                            setJapaCurrentCount(0);
                          }
                        }}
                        className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md active:scale-90 transition flex items-center gap-1.5"
                      >
                        <span>📿 ಜಪ ಮಣಿ ಎಣಿಸಿ (+1)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setJapaCurrentCount(0)}
                        className="text-[11px] text-stone-500 hover:text-stone-700 underline"
                      >
                        ರೀಸೆಟ್
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

    </div>
  );
};

export default SandhyavandanaPage;
