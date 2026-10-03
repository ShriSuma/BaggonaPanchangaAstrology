import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { RASHIS, PlanetName } from "../../core/AstroTypes";
import {
  calculateGurukulaMasterclass,
  type GurukulaStep,
  type GurukulaMasterclassReport
} from "../../core/kundliReadingGurukulaEngine";
import {
  CHART_LAYOUT,
  cellOrigin,
  centerRect,
  chartViewSize,
  getCellForRashiIndex,
  houseForSign
} from "./southIndianLayout";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  kundli: KundliOutput;
  birthDate?: string;
  birthTime?: string;
  nativeName?: string;
  gender?: string;
}

export const KundliReadingGurukulaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  kundli,
  birthDate,
  birthTime,
  nativeName = "ಜಾತಕರು",
  gender
}) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<"kn" | "en">(
    i18n.language.startsWith("kn") ? "kn" : "en"
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioUttRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Synchronize language with i18n if user changes global lang
  useEffect(() => {
    setLang(i18n.language.startsWith("kn") ? "kn" : "en");
  }, [i18n.language]);

  // Compute 11-step masterclass report offline
  const report: GurukulaMasterclassReport = useMemo(() => {
    return calculateGurukulaMasterclass(kundli, birthDate, birthTime, nativeName, gender);
  }, [kundli, birthDate, birthTime, nativeName, gender]);

  const currentStep: GurukulaStep = report.steps[activeStepIndex] || report.steps[0]!;

  // Cancel speech on step change or close
  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    stopAudio();
  }, [activeStepIndex, isOpen]);

  // Handle Play/Stop Speech
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert(
        lang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಸೌಲಭ್ಯವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ."
          : "Speech synthesis is not supported in this browser."
      );
      return;
    }

    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    stopAudio();

    const scriptText =
      lang === "kn"
        ? currentStep.spokenConsultationScriptKn
        : currentStep.spokenConsultationScriptEn;

    const cleanText = scriptText.replace(/[*#_`]/g, " ").replace(/\s+/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "kn" ? "kn-IN" : "en-IN";
    utterance.rate = 0.88;
    utterance.pitch = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    audioUttRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveStepIndex((prev) => Math.min(prev + 1, report.steps.length - 1));
      } else if (e.key === "ArrowLeft") {
        setActiveStepIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, report.steps.length, onClose]);

  if (!isOpen) return null;

  // Mini South Indian Chart calculations
  const size = chartViewSize();
  const { cell: cw } = CHART_LAYOUT;
  const cr = centerRect();
  const lagnaIdx = kundli.lagnaRashi.index;

  const byRashi = new Map<number, PlanetPosition[]>();
  for (const p of kundli.planets) {
    const arr = byRashi.get(p.rashi.index) ?? [];
    arr.push(p);
    byRashi.set(p.rashi.index, arr);
  }

  const isKn = lang === "kn";

  const stepPillTitles = [
    { num: 1, kn: "೧. ಲಗ್ನ", en: "1. Lagna" },
    { num: 2, kn: "೨. ಚಂದ್ರ", en: "2. Moon" },
    { num: 3, kn: "೩. ಸುಖ (೪)", en: "3. Sukha (4th)" },
    { num: 4, kn: "೪. ಕಳತ್ರ (೭)", en: "4. Kalatra (7th)" },
    { num: 5, kn: "೫. ಕರ್ಮ (೧೦)", en: "5. Karma (10th)" },
    { num: 6, kn: "೬. ತ್ರಿಕೋಣ (೫, ೯)", en: "6. Trikona (5, 9)" },
    { num: 7, kn: "೭. ತ್ರಿಕ & ಮಾಂದಿ", en: "7. Dusthana/Maandi" },
    { num: 8, kn: "೮. ಬಲಾಬಲ & ಮೈತ್ರಿ", en: "8. Dignity Matrix" },
    { num: 9, kn: "೯. ಯೋಗಗಳು", en: "9. Yogas" },
    { num: 10, kn: "೧೦. ದಶಾ ಕಾಲ", en: "10. Vimshottari" },
    { num: 11, kn: "೧೧. ದೈವಜ್ಞ ಸೂತ್ರ", en: "11. Consultation" }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isKn ? "ಕುಂಡಲಿ ವಾಚನ ಗುರು" : "Kundli Reading Gurukula"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 overflow-hidden animate-fade-in"
    >
      <div className="relative flex flex-col w-full max-w-6xl max-h-[96vh] rounded-3xl border-2 border-amber-500/70 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 text-white shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950 text-2xl shadow-inner animate-pulse">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-amber-200 tracking-wide">
                  {isKn ? "ಕುಂಡಲಿ ವಾಚನ ಗುರು (Kundli Masterclass)" : "Kundli Reading Gurukula Masterclass"}
                </h2>
                <span className="hidden sm:inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300 border border-amber-400/40">
                  {isKn ? "ಬಗ್ಗೋಣ ದೈವಜ್ಞ ಶಿಕ್ಷಣ" : "Priest & Admin Masterclass"}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {isKn
                  ? `${nativeName} • ಲಗ್ನ: ${report.lagnaRashiKn} | ರಾಶಿ: ${report.moonSignKn} (${report.nakshatraKn})`
                  : `${nativeName} • Asc: ${report.lagnaRashiEn} | Moon: ${report.moonSignEn} (${report.nakshatraEn})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="inline-flex rounded-xl bg-slate-900 border border-amber-500/40 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLang("kn")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  isKn ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-amber-200 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  !isKn ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-amber-200 hover:text-white"
                }`}
              >
                English
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/40 bg-slate-900 text-amber-200 hover:bg-amber-500 hover:text-slate-950 hover:scale-105 active:scale-95 transition-all text-lg font-bold"
              aria-label="Close Modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stepper Roadmap Ribbon */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto border-b border-amber-500/20 bg-slate-950/70 scrollbar-thin scrollbar-thumb-amber-500/30 shrink-0">
          {stepPillTitles.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105 font-black ring-2 ring-amber-300"
                    : isCompleted
                    ? "bg-amber-950/40 text-amber-300/80 border border-amber-500/30 hover:bg-amber-900/50"
                    : "bg-slate-900/50 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-amber-200"
                }`}
              >
                {isCompleted && <span className="text-[10px] text-amber-400">✓</span>}
                <span>{isKn ? step.kn : step.en}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Split 2-Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Visual Chart Correlation (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Visual Mini South Indian Chart */}
            <div className="rounded-2xl border-2 border-amber-500/50 bg-[#fffdf8] p-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🗺️</span>
                  <span>{isKn ? "ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ (ಸಕ್ರಿಯ ಹಂತ)" : "South Indian Chart (Active Step)"}</span>
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
                  {isKn ? "ಹಳದಿ ಬಣ್ಣ: ದೃಷ್ಟಿ ಸ್ಥಾನ" : "Amber: Target House"}
                </span>
              </div>

              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-auto max-h-[300px] select-none"
                style={{ background: "#fffdf8" }}
              >
                {/* SVG Style definitions */}
                <defs>
                  <style>{`
                    @keyframes activeGlow {
                      0%, 100% { fill: #FEF3C7; stroke: #D97706; stroke-width: 2.5; }
                      50% { fill: #FDE68A; stroke: #B45309; stroke-width: 3.5; }
                    }
                    .gurukula-highlight {
                      animation: activeGlow 2.5s ease-in-out infinite;
                    }
                  `}</style>
                </defs>

                {/* 12 Signs / Houses */}
                {RASHIS.map((rashi) => {
                  const cell = getCellForRashiIndex(rashi.index);
                  const { x, y } = cellOrigin(cell);
                  const house = houseForSign(lagnaIdx, rashi.index);
                  const isFocusHouse = currentStep.focusHouses.includes(house);
                  const isFocusRashi = currentStep.focusRashis.includes(rashi.index);
                  const isTarget = isFocusHouse || isFocusRashi;
                  const isLagna = rashi.index === lagnaIdx;
                  const isMoon = rashi.index === kundli.moonSign.index;

                  let cellFill = "#ffffff";
                  let cellStroke = "#e2e8f0";
                  let cellStrokeWidth = 1;
                  let animClass = "";

                  if (isTarget) {
                    cellFill = "#FEF3C7";
                    cellStroke = "#D97706";
                    cellStrokeWidth = 2.5;
                    animClass = "gurukula-highlight";
                  } else if (isLagna) {
                    cellFill = "#FFFBEB";
                    cellStroke = "#F59E0B";
                  } else if (isMoon) {
                    cellFill = "#EFF6FF";
                    cellStroke = "#3B82F6";
                  }

                  const occupants = byRashi.get(rashi.index) ?? [];

                  return (
                    <g key={rashi.index}>
                      <rect
                        x={x + 2}
                        y={y + 2}
                        width={cw - 4}
                        height={cw - 4}
                        fill={cellFill}
                        stroke={cellStroke}
                        strokeWidth={cellStrokeWidth}
                        className={animClass}
                        rx="4"
                      />
                      {/* Rashi Name */}
                      <text x={x + 6} y={y + 13} fontSize="8" fill="#78350f" fontWeight="700">
                        {isKn ? rashi.sanskrit : rashi.english.slice(0, 3)}
                      </text>

                      {/* House Number Badge */}
                      <text
                        x={x + cw - 6}
                        y={y + 13}
                        fontSize="7.5"
                        fill={isTarget ? "#b45309" : "#64748b"}
                        fontWeight={isTarget ? "900" : "600"}
                        textAnchor="end"
                      >
                        H{house}
                      </text>

                      {/* Occupying Planets */}
                      <g transform={`translate(${x + 6}, ${y + 24})`}>
                        {isLagna && (
                          <text x={0} y={0} fontSize="7" fill="#b45309" fontWeight="800">
                            [ಲಗ್ನ/ASC]
                          </text>
                        )}
                        {occupants.map((p, pIdx) => {
                          const isSpecial = currentStep.focusPlanets.includes(p.name);
                          return (
                            <text
                              key={p.name}
                              x={0}
                              y={(isLagna ? 10 : 0) + pIdx * 9}
                              fontSize="7.5"
                              fill={isSpecial ? "#b91c1c" : "#1e293b"}
                              fontWeight={isSpecial ? "900" : "600"}
                            >
                              {isKn ? p.name.slice(0, 3) : p.name.slice(0, 3)}
                              {p.isRetrograde ? "(ವ)" : ""}
                            </text>
                          );
                        })}
                      </g>
                    </g>
                  );
                })}

                {/* Center Box of South Chart */}
                <rect
                  x={cr.x + 2}
                  y={cr.y + 2}
                  width={cr.width - 4}
                  height={cr.height - 4}
                  fill="#fffdf8"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  rx="6"
                />
                <text
                  x={cr.x + cr.width / 2}
                  y={cr.y + cr.height / 2 - 12}
                  fontSize="10"
                  fontWeight="900"
                  fill="#78350f"
                  textAnchor="middle"
                >
                  {nativeName}
                </text>
                <text
                  x={cr.x + cr.width / 2}
                  y={cr.y + cr.height / 2 + 2}
                  fontSize="8"
                  fontWeight="700"
                  fill="#92400e"
                  textAnchor="middle"
                >
                  {isKn
                    ? `ಲಗ್ನ: ${report.lagnaRashiKn} | ರಾಶಿ: ${report.moonSignKn}`
                    : `Lagna: ${report.lagnaRashiEn} | Moon: ${report.moonSignEn}`}
                </text>
                <text
                  x={cr.x + cr.width / 2}
                  y={cr.y + cr.height / 2 + 15}
                  fontSize="7.5"
                  fill="#b45309"
                  textAnchor="middle"
                >
                  {isKn ? `ನಕ್ಷತ್ರ: ${report.nakshatraKn}` : `Nak: ${report.nakshatraEn}`}
                </text>
              </svg>
            </div>

            {/* Quick Where-to-Look Inspection Box */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/40 to-slate-950 p-4 text-xs space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2 text-amber-300 font-black uppercase tracking-wider text-[11px] border-b border-amber-500/20 pb-1.5">
                <span>📍</span>
                <span>{isKn ? "ದೃಷ್ಟಿ ಕೇಂದ್ರ (Where to Look)" : "Observation Focus"}</span>
              </div>
              <p className="text-amber-100 font-semibold leading-relaxed">
                {isKn
                  ? currentStep.whereToLookKn.primaryHouseKn
                  : currentStep.whereToLookEn.primaryHouseEn}
              </p>
              <p className="text-amber-200/90 leading-relaxed">
                {isKn
                  ? currentStep.whereToLookKn.rashiAndLordKn
                  : currentStep.whereToLookEn.rashiAndLordEn}
              </p>
              <div className="rounded-xl bg-amber-950/60 p-2.5 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-300">💡 {isKn ? "ಗುರು ಸೂತ್ರ:" : "Master Key:"} </span>
                {isKn
                  ? currentStep.whereToLookKn.observationTipKn
                  : currentStep.whereToLookEn.observationTipEn}
              </div>
            </div>

          </div>

          {/* Right Column: Deep Pedagogical & Consultation Cards (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Step Title Header Banner */}
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black uppercase text-amber-300 border border-amber-400/40">
                  <span>✨</span>
                  <span>{isKn ? currentStep.stageBadgeKn : currentStep.stageBadgeEn}</span>
                </span>
                <span className="text-xs font-black text-amber-400">
                  {isKn ? `ಹಂತ ${currentStep.stepIndex} / ೧೧` : `Step ${currentStep.stepIndex} / 11`}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-black text-amber-100 mt-2">
                {isKn ? currentStep.titleKn : currentStep.titleEn}
              </h3>
            </div>

            {/* Card 1: Technical & Shastric Mechanics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-wider border-b border-indigo-900/60 pb-1.5">
                <span>📐</span>
                <span>{isKn ? "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಸೂತ್ರ & ಗ್ರಹ ಮೈತ್ರಿ" : "Classical Shastric Mechanics & Dignity"}</span>
              </div>
              
              <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-3 italic text-indigo-200 text-xs font-medium">
                "{isKn ? currentStep.technicalAnalysisKn.shastricRuleKn : currentStep.technicalAnalysisEn.shastricRuleEn}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-amber-200">
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isKn ? "ಗ್ರಹ ಬಲಾಬಲ" : "Dignity"}</span>
                  <span className="font-bold text-amber-300">
                    {isKn ? currentStep.technicalAnalysisKn.dignityKn : currentStep.technicalAnalysisEn.dignityEn}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-950/60 p-2 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{isKn ? "ಗ್ರಹ ಮೈತ್ರಿ ಸಂಬಂಧ" : "Planetary Relations"}</span>
                  <span className="font-bold text-amber-300">
                    {isKn ? currentStep.technicalAnalysisKn.grahaRelationsKn : currentStep.technicalAnalysisEn.grahaRelationsEn}
                  </span>
                </div>
              </div>

              {currentStep.technicalAnalysisKn.specialConditionKn && (
                <div className="rounded-lg bg-amber-950/40 border border-amber-500/30 p-2 text-amber-200 text-[11px]">
                  <span className="font-bold text-amber-300">⚡ {isKn ? "ವಿಶೇಷ ಸ್ಥಿತಿ:" : "Special Note:"} </span>
                  {isKn
                    ? currentStep.technicalAnalysisKn.specialConditionKn
                    : currentStep.technicalAnalysisEn.specialConditionEn}
                </div>
              )}

              <ul className="space-y-1.5 text-slate-300 pl-2">
                {(isKn
                  ? currentStep.technicalAnalysisKn.bulletPointsKn
                  : currentStep.technicalAnalysisEn.bulletPointsEn
                ).map((bp, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Why This Result (Astrological Cause & Effect) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-xs space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider border-b border-amber-950 pb-1.5">
                <span>💡</span>
                <span>{isKn ? "ಏಕೆ ಈ ಫಲಿತ? (ಕಾರಣ-ಪರಿಣಾಮ ತರ್ಕ)" : "Why This Result (Astrological Cause & Effect)"}</span>
              </div>
              <p className="text-amber-100/95 leading-relaxed text-xs">
                {isKn
                  ? currentStep.whyThisResultKn.astrologicalLogicKn
                  : currentStep.whyThisResultEn.astrologicalLogicEn}
              </p>
              <div className="rounded-xl bg-slate-950/70 p-2.5 border border-slate-800 text-[11px] text-slate-300">
                <span className="font-bold text-amber-300">{isKn ? "ಪ್ರಮುಖ ಜೀವನ ಕ್ಷೇತ್ರ:" : "Key Life Sphere:"} </span>
                <span>
                  {isKn
                    ? currentStep.whyThisResultKn.lifeDomainKn
                    : currentStep.whyThisResultEn.lifeDomainEn}
                </span>
              </div>
            </div>

            {/* Card 3: Spoken Consultation Script with Web Speech Audio */}
            <div className="rounded-2xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 p-4 text-xs space-y-3 shadow-xl ring-1 ring-amber-400/20">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
                  <span>🗣️</span>
                  <span>{isKn ? "ಭಕ್ತರಿಗೆ ಮುಖತಃ ಏನು ಹೇಳಬೇಕು? (ಸಮಾಲೋಚನಾ ಮಾತು)" : "Spoken Consultation Script (What to tell Client)"}</span>
                </div>

                {/* Speech Button */}
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    isPlayingAudio
                      ? "bg-red-600 text-white animate-pulse shadow-md"
                      : "bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md hover:scale-105 active:scale-95"
                  }`}
                  aria-label="Listen Aloud"
                >
                  <span>{isPlayingAudio ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಮುಖತಃ ಓದಿ"}</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-amber-950/40 border border-amber-500/30 p-3.5 text-amber-100 text-xs md:text-sm leading-relaxed font-serif">
                <span className="text-xl text-amber-400/60 font-serif mr-1">“</span>
                {isKn
                  ? currentStep.spokenConsultationScriptKn
                  : currentStep.spokenConsultationScriptEn}
                <span className="text-xl text-amber-400/60 font-serif ml-1">”</span>
              </div>
            </div>

            {/* Card 4: Practical Guidance & Divine Remedy */}
            <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-3.5 text-xs text-emerald-200 space-y-1.5 shadow-md">
              <div className="flex items-center gap-2 text-emerald-300 font-black uppercase text-[11px]">
                <span>🪔</span>
                <span>{isKn ? "ದೈವಿಕ ಸಲಹೆ & ಪರಿಹಾರ ಸೂತ್ರ" : "Divine Remedy & Guidance"}</span>
              </div>
              <p className="leading-relaxed">
                {isKn
                  ? currentStep.practicalGuidanceKn
                  : currentStep.practicalGuidanceEn}
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-amber-500/30 bg-slate-950/90 shrink-0">
          <button
            type="button"
            onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={activeStepIndex === 0}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeStepIndex === 0
                ? "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                : "bg-slate-900 text-amber-200 border border-amber-500/40 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>⬅</span>
            <span>{isKn ? "ಹಿಂದಿನ ಹಂತ" : "Previous Step"}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300/80 font-bold">
              {isKn ? `ಹಂತ ${activeStepIndex + 1} / ೧೧` : `Step ${activeStepIndex + 1} / 11`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeStepIndex < report.steps.length - 1) {
                setActiveStepIndex((prev) => prev + 1);
              } else {
                onClose();
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <span>
              {activeStepIndex < report.steps.length - 1
                ? isKn
                  ? "ಮುಂದಿನ ಹಂತ"
                  : "Next Step"
                : isKn
                ? "ಮುಕ್ತಾಯ"
                : "Finish"}
            </span>
            <span>➜</span>
          </button>
        </div>

      </div>
    </div>
  );
};
