import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getPoojaStreak, recordPoojaSankalpaCompleted, type PoojaStreakInfo } from "../../features/seva/calendarVisitService";
import { playTempleBellChime, speakPriestNarration, stopPriestAudio } from "../../features/seva/priestAudioNarrator";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../../features/audio/globalAudioManager";
import { buildDailyPoojaSteps, type DailyPoojaStep } from "../../features/seva/dailySankalpaPoojaEngine";
import { useSankalpaStore } from "../../features/sankalpa/sankalpaStore";
import { ManageSankalpaModal } from "./ManageSankalpaModal";
import { PostPoojaRemedyJapaCard } from "./PostPoojaRemedyJapaCard";
import type { KundliOutput } from "../../core/AstroTypes";

export interface DailyPoojaSankalpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeId?: string;
  devoteeName: string;
  birthKundli?: KundliOutput | null;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  lang?: SevaLang;
  priestName?: string;
  voiceId?: string;
  samvatsara?: string;
  ayana?: string;
  ritu?: string;
  masa?: string;
  paksha?: string;
  tithi?: string;
  vasara?: string;
  nakshatra?: string;
  onPlayBell?: () => void;
  onStreakUpdated?: (streak: PoojaStreakInfo) => void;
}

export const DailyPoojaSankalpaModal: React.FC<DailyPoojaSankalpaModalProps> = ({
  isOpen,
  onClose,
  devoteeId,
  devoteeName,
  birthKundli,
  gotra = "ಕಾಶ್ಯಪ",
  rashiName = "ಧನು",
  nakshatraName = "ಮೂಲ",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  voiceId,
  samvatsara,
  ayana,
  ritu,
  masa,
  paksha,
  tithi,
  vasara,
  nakshatra,
  onPlayBell,
  onStreakUpdated
}) => {
  const { sankalpas, loadSankalpas } = useSankalpaStore();

  const [mode, setMode] = useState<"priest_guided" | "self_guided">("priest_guided");
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);
  const [isLampLit, setIsLampLit] = useState(false);
  const [showAkshataAnimation, setShowAkshataAnimation] = useState(false);
  const [isAratiRotating, setIsAratiRotating] = useState(false);
  const [streakInfo, setStreakInfo] = useState<PoojaStreakInfo | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isManageSankalpaOpen, setIsManageSankalpaOpen] = useState(false);

  const devoteeKey = devoteeId || (devoteeName ? devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default");
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      void loadSankalpas(devoteeKey, devoteeName);
    }
  }, [isOpen, devoteeKey, devoteeName, loadSankalpas]);

  const poojaSteps = buildDailyPoojaSteps({
    devoteeName,
    gotra,
    rashiName,
    nakshatraName,
    priestName,
    lang,
    samvatsara,
    ayana,
    ritu,
    masa,
    paksha,
    tithi,
    vasara,
    nakshatra,
    activeSankalpas: sankalpas
  });

  const totalSteps = poojaSteps.length; // 5 steps (3-5 mins)
  const currentStepData: DailyPoojaStep = poojaSteps[Math.min(step - 1, totalSteps - 1)] || poojaSteps[0];

  useEffect(() => {
    if (isOpen) {
      const current = getPoojaStreak(devoteeKey);
      setStreakInfo(current);
      if (current.isCompletedToday) {
        setIsLampLit(true);
        setStep(6); // Step 6 is completion overview
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

  useEffect(() => {
    const unregister = onGlobalAudioStop(() => {
      setIsAudioPlaying(false);
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    });
    return () => unregister();
  }, []);

  const cleanupAudioAndTimers = () => {
    stopAllAudioGlobal();
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

    if (targetStep === 1 || targetStep === 5) {
      playTempleBellChime();
      if (onPlayBell) onPlayBell();
    }

    const stepObj = poojaSteps[targetStep - 1];
    if (!stepObj) return;

    const speechText = `${stepObj.sanskritMantra}. ${stepObj.narrationText[lang || "kn"] || stepObj.narrationText.kn}`;

    speakPriestNarration(
      speechText,
      lang,
      () => {
        setIsAudioPlaying(false);
        if (isAutoPlay && targetStep < totalSteps) {
          autoPlayTimerRef.current = setTimeout(() => {
            handleNextStep(targetStep + 1);
          }, 2500);
        } else if (isAutoPlay && targetStep === totalSteps) {
          autoPlayTimerRef.current = setTimeout(() => {
            handleCompletePooja();
          }, 3000);
        }
      },
      undefined,
      voiceId
    );
  };

  const handleNextStep = (nextStepNum?: number) => {
    const next = nextStepNum !== undefined ? nextStepNum : step + 1;

    if (next === 2) {
      setIsLampLit(true);
    }
    if (next === 4) {
      setShowAkshataAnimation(true);
      setTimeout(() => setShowAkshataAnimation(false), 3500);
    }
    if (next === 5) {
      setIsAratiRotating(true);
      playTempleBellChime();
    }

    if (next <= totalSteps) {
      setStep(next);
      if (mode === "priest_guided") {
        playStepPriestAudio(next);
      }
    } else {
      handleCompletePooja();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      if (mode === "priest_guided") {
        playStepPriestAudio(prev);
      }
    }
  };

  const handleCompletePooja = async () => {
    cleanupAudioAndTimers();
    const updated = await recordPoojaSankalpaCompleted(devoteeKey, devoteeName, gotra, priestName);
    setStreakInfo(updated);
    if (onStreakUpdated) {
      onStreakUpdated(updated);
    }
    setStep(6); // Step 6 = completion screen
    setIsLampLit(true);
    playTempleBellChime();
  };

  const handleShareBlessings = () => {
    const activeTitles = sankalpas.filter((s) => s.isActive).map((s) => s.title).join(", ");
    const text = encodeURIComponent(
      `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ನಿತ್ಯ ಪೂಜಾ ಆಶೀರ್ವಾದ 🕉️\n\n` +
      `ನಮಸ್ಕಾರ, ನಾನು ಇಂದು ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${devoteeName} ಅವರ ಪರವಾಗಿ ೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ದೇವರ ಪೂಜೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿಸಿದ್ದೇನೆ.\n\n` +
      `🪔 ಇಂದಿನ ಪವಿತ್ರ ಸಂಕಲ್ಪಗಳು:\n${activeTitles || "ಕುಟುಂಬದ ಸಕಲ ಆರೋಗ್ಯ, ಮನಶ್ಶಾಂತಿ & ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧಿ"}\n\n` +
      `🔥 ಪೂಜಾ ನಿರಂತರತೆ: ${streakInfo?.currentStreak || 1} ದಿನಗಳು\n` +
      `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ ॥\n` +
      `🔗 ದೈನಂದಿನ ದರ್ಶನ: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99990,
          background: "rgba(10, 4, 1, 0.92)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #1C0F05 0%, #0D0501 100%)",
            border: "2.5px solid #F59E0B",
            borderRadius: 24,
            maxWidth: 720,
            width: "100%",
            maxHeight: "94vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(245, 158, 11, 0.35)",
            overflow: "hidden",
            color: "#FFFDF7",
            position: "relative"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Temple Altar Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              borderBottom: "2px solid #F59E0B",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>🪔</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FEF3C7" }}>
                    {lang === "kn" ? "೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜೆ" :
                     lang === "hi" ? "३-५ मिनट दैनिक वैदिक संकल्प एवं सरल पूजा" :
                     lang === "te" ? "3-5 నిమిషాల నిత్య దైవిక సంకల్పం & పూజ" :
                     lang === "ta" ? "3-5 நிமிட நித்ய வைதீக சங்கல்பம் & பூஜை" :
                     "3-5 Min Vedic Daily Sankalpa & Pooja"}
                  </h2>
                  <span
                    style={{
                      background: "rgba(245, 158, 11, 0.2)",
                      border: "1px solid #F59E0B",
                      color: "#FDE68A",
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 12
                    }}
                  >
                    {step <= 5 ? `ಹಂತ ${step} / ೫` : "ಪೂರ್ಣಗೊಂಡಿದೆ"}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#FDE68A", marginTop: 2 }}>
                  {devoteeName} ({gotra} ಗೋತ್ರ · {rashiName} ರಾಶಿ) · {priestName} ಮಾರ್ಗದರ್ಶನ
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Manage Sankalpas Button */}
              <button
                type="button"
                onClick={() => setIsManageSankalpaOpen(true)}
                style={{
                  background: "rgba(245, 158, 11, 0.25)",
                  border: "1.5px solid #FCD34D",
                  color: "#FEF3C7",
                  borderRadius: 12,
                  padding: "6px 12px",
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>📝</span>
                <span>{lang === "kn" ? "ಸಂಕಲ್ಪಗಳು" : "Sankalpas"}</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(253, 230, 138, 0.4)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  color: "#FEF3C7",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div style={{ background: "#451A03", height: 6, width: "100%" }}>
            <div
              style={{
                background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                height: "100%",
                width: `${Math.min(100, (step / 5) * 100)}%`,
                transition: "width 0.4s ease"
              }}
            />
          </div>

          {/* Main Scrollable Shrine Area */}
          <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {step <= 5 ? (
              <>
                {/* Visual Sanctum Altar Card */}
                <div
                  style={{
                    background: "radial-gradient(circle at center, #2D1405 0%, #150802 100%)",
                    border: "2px solid #D97706",
                    borderRadius: 20,
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
                  }}
                >
                  {/* Altar Deity Aura */}
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0) 70%)",
                      position: "absolute",
                      top: 15,
                      pointerEvents: "none"
                    }}
                  />

                  {/* Icon & Animations */}
                  <div style={{ fontSize: 56, marginBottom: 8, position: "relative", zIndex: 2 }}>
                    {currentStepData.icon}
                  </div>

                  {/* Interactive Visual Cue */}
                  {currentStepData.key === "deepa_achamana" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 24, filter: isLampLit ? "drop-shadow(0 0 12px #F59E0B)" : "grayscale(80%)" }}>
                        🪔
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A" }}>
                        {isLampLit ? "ದೀಪ ಪ್ರಜ್ವಲಿತವಾಗಿದೆ (Lamp Lit)" : "ದೇವರೆದುರು ದೀಪ ಬೆಳಗಿಸಿ"}
                      </span>
                    </div>
                  )}

                  {currentStepData.key === "guru_ganapati" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", marginTop: 4 }}>
                      ✋ ಬಲಗೈಯಲ್ಲಿ ಅಕ್ಷತೆ-ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ (Hold Akshata in Hand)
                    </div>
                  )}

                  {currentStepData.key === "sankalpa_samarpana" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#34D399", marginTop: 4 }}>
                      🌸 ದೇವತಾ ಚರಣಾರವಿಂದಕ್ಕೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ (Offer Akshata to Lotus Feet)
                    </div>
                  )}

                  {currentStepData.key === "deeparadhana_namaskara" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", marginTop: 4 }}>
                      🔔 ಮಂಗಳಾರತಿ ಬೆಳಗಿ · ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ (Wave Arati & Bow Down)
                    </div>
                  )}

                  {/* Step Title */}
                  <h3 style={{ margin: "10px 0 0 0", fontSize: 18, fontWeight: 900, color: "#FEF3C7", textAlign: "center" }}>
                    {lang === "kn" ? currentStepData.titleKn :
                     lang === "hi" ? currentStepData.titleHi :
                     lang === "te" ? currentStepData.titleTe :
                     lang === "ta" ? currentStepData.titleTa :
                     currentStepData.titleEn}
                  </h3>
                </div>

                {/* Sanskrit Mantra Gold Box */}
                <div
                  style={{
                    background: "rgba(254, 243, 199, 0.08)",
                    border: "1.5px solid #F59E0B",
                    borderRadius: 16,
                    padding: "16px 18px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#FDE68A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                    🕉️ ವೇದ ಮಂತ್ರ & ದೈವಿಕ ಸಂಕಲ್ಪ (Vedic Chanting)
                  </div>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#FFFBEB",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      fontFamily: "'Nirmala UI', sans-serif"
                    }}
                  >
                    {currentStepData.sanskritMantra}
                  </div>
                </div>

                {/* Active Personal Sankalpas Summary (Displayed in Step 3 & 4) */}
                {(currentStepData.key === "maha_sankalpa" || currentStepData.key === "sankalpa_samarpana") && (
                  <div
                    style={{
                      background: "rgba(120, 53, 15, 0.4)",
                      border: "1.5px solid #D97706",
                      borderRadius: 16,
                      padding: "12px 16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#FDE68A" }}>
                        📜 ಇಂದಿನ ಮಂತ್ರದಲ್ಲಿ ಸೇರಿರುವ ನಿಮ್ಮ ಸಂಕಲ್ಪಗಳು ({sankalpas.filter((s) => s.isActive).length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsManageSankalpaOpen(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#60A5FA",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        + ಸಂಕಲ್ಪ ಸೇರಿಸಿ / ತಿದ್ದು
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {sankalpas
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <span
                            key={s.id}
                            style={{
                              background: "rgba(245, 158, 11, 0.2)",
                              border: "1px solid #FCD34D",
                              color: "#FEF3C7",
                              fontSize: 11.5,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 12
                            }}
                          >
                            ✨ {s.title}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action & Guidance Box */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(69, 26, 3, 0.6) 0%, rgba(28, 15, 5, 0.8) 100%)",
                    border: "1px solid #B45309",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#FDE68A", fontSize: 12, fontWeight: 900 }}>
                    <span>👉</span>
                    <span>{lang === "kn" ? "ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕ್ರಮ (Action):" : "Your Ritual Action:"}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#FEF3C7", lineHeight: 1.5, fontWeight: 600 }}>
                    {currentStepData.actionGuide[lang || "kn"] || currentStepData.actionGuide.kn}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#D1D5DB", marginTop: 4, fontStyle: "italic" }}>
                    🌿 {currentStepData.spiritualSignificance[lang || "kn"] || currentStepData.spiritualSignificance.kn}
                  </div>
                </div>
              </>
            ) : (
              /* Step 6: Completion & Ashirvada Screen */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "24px 16px",
                  gap: 16
                }}
              >
                <div style={{ fontSize: 64, filter: "drop-shadow(0 0 20px #F59E0B)" }}>
                  🪔✨
                </div>

                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#FEF3C7" }}>
                  {lang === "kn" ? "॥ ನಿತ್ಯ ಸಂಕಲ್ಪ ಪೂಜೆ ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿತು ॥" :
                   lang === "hi" ? "॥ नित्य संकल्प पूजा सफलतापूर्वक संपन्न हुई ॥" :
                   "॥ Daily Vedic Sankalpa & Pooja Completed ॥"}
                </h3>

                <p style={{ margin: 0, fontSize: 13.5, color: "#FDE68A", maxWidth: 500, lineHeight: 1.5 }}>
                  {lang === "kn" ?
                    `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಗಣಪತಿಯ ಪರಮಾನುಗ್ರಹದಿಂದ ಶ್ರೀ ${devoteeName} ಅವರ ಸಕಲ ಸಂಕಲ್ಪಗಳು ಶೀಘ್ರ ಈಡೇರಲಿ.` :
                    `May all noble prayers and Sankalpas of ${devoteeName} be fulfilled through the divine grace of Lord Mahabaleshwara.`}
                </p>

                {/* Streak Badge */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #78350F, #451A03)",
                    border: "2px solid #F59E0B",
                    borderRadius: 20,
                    padding: "14px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  <span style={{ fontSize: 32 }}>🔥</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#FEF3C7" }}>
                      {lang === "kn" ? `ನಿರಂತರ ಪೂಜಾ ಸಾಧನೆ: ${streakInfo?.currentStreak || 1} ದಿನಗಳು` :
                       `Continuous Pooja Streak: ${streakInfo?.currentStreak || 1} Days`}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#FDE68A" }}>
                      {lang === "kn" ? "ದೈನಂದಿನ ಭಕ್ತಿ ಸಾಧನೆಯು ಸಮಸ್ತ ಗ್ರಹದೋಷಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ." :
                       "Daily devotion purifies planetary vibrations."}
                    </div>
                  </div>
                </div>

                {/* Post-Pooja 11-Time Kundli Remedy Japa Counter */}
                <div className="w-full text-left my-2">
                  <PostPoojaRemedyJapaCard
                    birthKundli={birthKundli}
                    devoteeName={devoteeName}
                    gotra={gotra}
                    rashiName={rashiName}
                    nakshatraName={nakshatraName}
                    lang={lang}
                    voiceId={voiceId}
                  />
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShareBlessings}
                  style={{
                    background: "#059669",
                    color: "#FFFFFF",
                    border: "1.5px solid #34D399",
                    borderRadius: 14,
                    padding: "12px 24px",
                    fontSize: 13.5,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 16px rgba(5, 150, 105, 0.4)"
                  }}
                >
                  <span>📲</span>
                  <span>{lang === "kn" ? "WhatsApp ಮೂಲಕ ಆಶೀರ್ವಾದ ಹಂಚಿಕೊಳ್ಳಿ" : "Share Blessings via WhatsApp"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Controls Footer */}
          <div
            style={{
              background: "#1C0F05",
              borderTop: "1.5px solid #78350F",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10
            }}
          >
            {step <= 5 ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  style={{
                    background: step === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
                    color: step === 1 ? "#6B7280" : "#FEF3C7",
                    border: "1px solid rgba(253, 230, 138, 0.2)",
                    borderRadius: 12,
                    padding: "10px 16px",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: step === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  ← {lang === "kn" ? "ಹಿಂದಿನ ಹಂತ" : "Previous"}
                </button>

                {/* Audio Status & Auto-Play Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAudioPlaying) {
                        cleanupAudioAndTimers();
                      } else {
                        playStepPriestAudio(step);
                      }
                    }}
                    style={{
                      background: isAudioPlaying ? "#D97706" : "rgba(245, 158, 11, 0.2)",
                      border: "1.5px solid #F59E0B",
                      color: "#FEF3C7",
                      borderRadius: 12,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>{isAudioPlaying ? "🔊" : "🔈"}</span>
                    <span>{isAudioPlaying ? (lang === "kn" ? "ಧ್ವನಿ ಪಠಣ..." : "Chanting...") : (lang === "kn" ? "ಧ್ವನಿ ಕೇಳಿ" : "Play Voice")}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleNextStep()}
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#1C0A00",
                    border: "1.5px solid #FDE68A",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
                  }}
                >
                  <span>{step === 5 ? "✨" : "→"}</span>
                  <span>{step === 5 ? (lang === "kn" ? "ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ" : "Complete Pooja") : (lang === "kn" ? "ಮುಂದಿನ ಹಂತ" : "Next Step")}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#1C0A00",
                  border: "1.5px solid #FDE68A",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                {lang === "kn" ? "ಮುಚ್ಚಿ & ಇಂದಿನ ದರ್ಶನ ಮುಂದುವರಿಸಿ" : "Close & Continue Daily Darshana"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Manage Sankalpa Modal */}
      <ManageSankalpaModal
        isOpen={isManageSankalpaOpen}
        onClose={() => setIsManageSankalpaOpen(false)}
        userId={devoteeKey}
        devoteeName={devoteeName}
        lang={lang}
      />
    </>
  );
};
