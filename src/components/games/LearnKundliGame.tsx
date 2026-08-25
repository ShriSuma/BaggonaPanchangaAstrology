import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";
import { encodeAcademyToken } from "../../utils/tokenCipher";
import {
  HOUSE_LEARNING_MODULES,
  MASTER_12_HOUSE_GRAND_EXAMPLE,
  type HouseLearningModule
} from "../../features/kundlilearning/kundliAcademyKnowledge";

export type LearnKundliProps = {
  lang?: string;
  isStandalone?: boolean;
};

// South Indian Chart Box Layout Matrix (12 Houses in Classical Fixed Order)
const SOUTH_INDIAN_LAYOUT = [
  { house: 12, rashi: "Meena", labelKn: "೧೨ ಮೀನ", labelEn: "12 Pisces", row: 1, col: 1 },
  { house: 1, rashi: "Mesha", labelKn: "೧ ಮೇಷ", labelEn: "1 Aries", row: 1, col: 2 },
  { house: 2, rashi: "Vrishabha", labelKn: "೨ ವೃಷಭ", labelEn: "2 Taurus", row: 1, col: 3 },
  { house: 3, rashi: "Mithuna", labelKn: "೩ ಮಿಥುನ", labelEn: "3 Gemini", row: 1, col: 4 },

  { house: 11, rashi: "Kumbha", labelKn: "೧೧ ಕುಂಭ", labelEn: "11 Aquarius", row: 2, col: 1 },
  { house: 4, rashi: "Karkataka", labelKn: "೪ ಕರ್ಕಾಟಕ", labelEn: "4 Cancer", row: 2, col: 4 },

  { house: 10, rashi: "Makara", labelKn: "೧೦ ಮಕರ", labelEn: "10 Capricorn", row: 3, col: 1 },
  { house: 5, rashi: "Simha", labelKn: "೫ ಸಿಂಹ", labelEn: "5 Leo", row: 3, col: 4 },

  { house: 9, rashi: "Dhanu", labelKn: "೯ ಧನು", labelEn: "9 Sagittarius", row: 4, col: 1 },
  { house: 8, rashi: "Vrischika", labelKn: "೮ ವೃಶ್ಚಿಕ", labelEn: "8 Scorpio", row: 4, col: 2 },
  { house: 7, rashi: "Tula", labelKn: "೭ ತುಲಾ", labelEn: "7 Libra", row: 4, col: 3 },
  { house: 6, rashi: "Kanya", labelKn: "೬ ಕನ್ಯಾ", labelEn: "6 Virgo", row: 4, col: 4 }
];

export const LearnKundliGame: React.FC<LearnKundliProps> = ({
  lang = "kn",
  isStandalone = false
}) => {
  const [currentLang, setCurrentLang] = useState<string>(lang || "kn");
  const isKn = currentLang.slice(0, 2) === "kn";

  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1..7
  const [selectedSimGraha, setSelectedSimGraha] = useState<string>("Sun");
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [completedHouses, setCompletedHouses] = useState<number[]>([1]);
  const [xpPoints, setXpPoints] = useState<number>(150);
  const [showGrandMasterModal, setShowGrandMasterModal] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareStudentName, setShareStudentName] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const houseData: HouseLearningModule =
    HOUSE_LEARNING_MODULES[selectedHouse] || HOUSE_LEARNING_MODULES[1];

  const handleSelectHouse = (h: number) => {
    setSelectedHouse(h);
    setCurrentStep(1);
    setUserAnswers({});
    setQuizScore(0);
    gameAudio.playChime();
  };

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      setXpPoints((prev) => prev + 25);
      gameAudio.playTick();
    } else if (currentStep === 7) {
      // Completed house quest!
      if (!completedHouses.includes(selectedHouse)) {
        setCompletedHouses((prev) => [...prev, selectedHouse]);
        setXpPoints((prev) => prev + 100);
      }
      setShowCelebration(true);
      gameAudio.playSuccess();
      setTimeout(() => setShowCelebration(false), 3500);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      gameAudio.playTick();
    }
  };

  // Voice Speech Audio Reciter
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = isKn ? "kn-IN" : "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handleAnswerQuiz = (qIdx: number, optIdx: number) => {
    if (userAnswers[qIdx] !== undefined) return;
    const isCorrect = optIdx === houseData.quiz[qIdx].correctIndex;
    if (isCorrect) {
      gameAudio.playSuccess();
      setQuizScore((s) => s + 1);
      setXpPoints((x) => x + 50);
    } else {
      gameAudio.playBuzzer();
    }
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const isAllQuizAnswered =
    houseData.quiz && Object.keys(userAnswers).length === houseData.quiz.length;

  const stepsList = [
    { num: 1, nameKn: "ಭಾವ ಪರಿಚಯ", nameEn: "Core Traits", icon: "🌟" },
    { num: 2, nameKn: "ಉಚ್ಚ & ನೀಚ", nameEn: "Dignity", icon: "👑" },
    { num: 3, nameKn: "೯ ಗ್ರಹಗಳ ಫಲ", nameEn: "9 Planets", icon: "🪐" },
    { num: 4, nameKn: "ಯೋಗ ನಿಯಮ", nameEn: "Vedic Rules", icon: "📜" },
    { num: 5, nameKn: "ಗ್ರಹ ದೃಷ್ಟಿ", nameEn: "Aspects", icon: "👁️" },
    { num: 6, nameKn: "ನೈಜ ಉದಾಹರಣೆ", nameEn: "Real Example", icon: "⭐" },
    { num: 7, nameKn: "ಸಿದ್ಧಿ ಪರೀಕ್ಷೆ", nameEn: "Mastery Quiz", icon: "🏆" }
  ];

  return (
    <div className="space-y-5 select-none font-sans text-slate-100">
      {/* ====================================================================== */}
      {/* 1. TOP GAMING HUD (XP BAR, LEVEL, AUDIO, GRAND SYNTHESIS TRIGGER)     */}
      {/* ====================================================================== */}
      <div className="rounded-2xl border-2 border-amber-500/80 bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-950 p-4 sm:p-5 shadow-2xl shadow-amber-950/40 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black flex items-center justify-center text-3xl shadow-lg border-2 border-amber-200">
                🕉️
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full border border-emerald-200">
                LIVE
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                  ॥ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ ಗೇಮ್ ॥
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  🎮 Quest Arena
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
                <span>{isKn ? "ಕುಂಡಲಿ ೧೨ ಭಾವ ರಹಸ್ಯ ಸಿದ್ಧಿ ಆಟ" : "Kundali 12 Houses Mastery Game"}</span>
              </h2>
              <p className="text-[11px] text-amber-200/80 font-medium">
                {isKn
                  ? "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಹಾಗೂ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಸಂವಾದಾತ್ಮಕ ಕಲಿಕೆ."
                  : "Gamified Vedic Horoscopy learning based on Dr. B.V. Raman & Revered Shreeram Pandit."}
              </p>
            </div>
          </div>

          {/* Player Stats & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* XP & Level Meter */}
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-inner">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                  <span>⚡ XP: {xpPoints}</span>
                  <span className="text-emerald-400 font-extrabold ml-2">{completedHouses.length}/12 {isKn ? "ಭಾವ ಸಿದ್ಧಿ" : "Mastered"}</span>
                </div>
                <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden border border-amber-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, (completedHouses.length / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Master 12-House Synthesis Button */}
            <button
              type="button"
              onClick={() => {
                setShowGrandMasterModal(true);
                gameAudio.playChime();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white px-3.5 py-2 text-xs font-black shadow-lg border border-purple-400 transition-all transform active:scale-95"
            >
              <span>🏆</span>
              <span>{isKn ? "ಸಮಗ್ರ ೧೨ ಭಾವ ಮಹಾ ಫಲ" : "12-House Grand Synthesis"}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex rounded-xl bg-slate-900 border border-amber-500/40 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setCurrentLang("kn");
                  gameAudio.playTick();
                }}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${
                  isKn ? "bg-amber-500 text-slate-950 shadow" : "text-amber-200 hover:text-white"
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentLang("en");
                  gameAudio.playTick();
                }}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${
                  !isKn ? "bg-amber-500 text-slate-950 shadow" : "text-amber-200 hover:text-white"
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. SPOTLIGHT SOUTH INDIAN CHART ARENA (SELECTED HOUSE FOCUS / FADE OTHERS) */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Col: South Indian Spotlight Wheel (Col span 5) */}
        <div className="lg:col-span-5 rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                {isKn ? "ದಕ್ಷಿಣ ಭಾರತ ಕುಂಡಲಿ ಸ್ಪಾಟ್‌ಲೈಟ್" : "South Indian Spotlight Arena"}
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
              {isKn ? "ಮನೆ ಆರಿಸಿ (Select House)" : "Click House"}
            </span>
          </div>

          {/* 4x4 Grid Matrix with Spotlight Animation */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 aspect-square p-2 bg-slate-950/90 rounded-xl border border-amber-500/40 shadow-inner relative">
            {SOUTH_INDIAN_LAYOUT.map((cell) => {
              const isSelected = selectedHouse === cell.house;
              const isCompleted = completedHouses.includes(cell.house);

              // Grid positioning for South Indian layout
              const gridRowColStyle: React.CSSProperties = {
                gridRow: cell.row,
                gridColumn: cell.col
              };

              return (
                <button
                  key={cell.house}
                  type="button"
                  onClick={() => handleSelectHouse(cell.house)}
                  style={gridRowColStyle}
                  className={`relative rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center transition-all duration-300 text-center ${
                    isSelected
                      ? "ring-4 ring-amber-400 bg-gradient-to-br from-amber-500/40 via-amber-900/90 to-yellow-950 text-white font-black scale-105 z-20 shadow-[0_0_25px_rgba(245,158,11,0.8)] border-2 border-amber-300 animate-pulse"
                      : "opacity-35 grayscale-[0.6] blur-[0.2px] scale-95 bg-slate-900/80 border border-slate-800 text-slate-300 hover:opacity-80 hover:scale-100 hover:grayscale-0 hover:border-amber-500/50"
                  }`}
                >
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black shadow">
                      ✓
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-amber-300 drop-shadow">
                    {cell.house}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1">
                    {isKn ? cell.labelKn.split(" ")[1] : cell.labelEn.split(" ")[1]}
                  </span>
                  {isSelected && (
                    <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded mt-0.5 uppercase tracking-tighter">
                      ACTIVE 🔥
                    </span>
                  )}
                </button>
              );
            })}

            {/* Center Brahma Sthana Emblem */}
            <div
              style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }}
              className="bg-gradient-to-br from-amber-950/90 via-slate-950 to-amber-950/90 rounded-xl border border-amber-500/40 flex flex-col items-center justify-center p-2 text-center shadow-inner"
            >
              <span className="text-2xl animate-spin" style={{ animationDuration: "20s" }}>
                ☸️
              </span>
              <span className="text-[11px] font-black text-amber-300 tracking-wider mt-1">
                {isKn ? "ಬ್ರಹ್ಮ ಸ್ಥಾನ" : "Brahma Sthana"}
              </span>
              <span className="text-[9px] text-amber-200/80 font-bold mt-0.5">
                {houseData.kannadaName.split(" - ")[1] || houseData.sanskritName}
              </span>
              <span className="text-[9px] text-emerald-400 font-extrabold mt-1">
                {isKn ? "ಭಾವ " : "House "} {selectedHouse} / 12
              </span>
            </div>
          </div>

          {/* Quick House Selector Pills for Mobile Ease */}
          <div className="flex flex-wrap gap-1 pt-1 justify-center">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleSelectHouse(h)}
                className={`w-7 h-7 rounded-lg text-xs font-black transition ${
                  selectedHouse === h
                    ? "bg-amber-400 text-slate-950 shadow-md scale-110 ring-2 ring-amber-200"
                    : completedHouses.includes(h)
                    ? "bg-emerald-900/70 text-emerald-200 border border-emerald-500/50"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Active House Quest Arena & Step-by-Step Learning (Col span 7) */}
        <div className="lg:col-span-7 rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-xl space-y-4">
          {/* House Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <h3 className="font-serif text-lg font-black text-amber-300">
                  {isKn ? houseData.kannadaName : houseData.englishName}
                </h3>
              </div>
              <div className="text-xs text-amber-200/80 font-bold mt-0.5">
                {isKn ? "ನೈಸರ್ಗಿಕ ರಾಶಿ:" : "Natural Rashi:"} <span className="text-white font-extrabold">{isKn ? houseData.naturalRashiKn : houseData.naturalRashiEn}</span> · {isKn ? "ಅಧಿಪತಿ:" : "Lord:"} <span className="text-white font-extrabold">{isKn ? houseData.naturalLordKn : houseData.naturalLordEn}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => speakText(isKn ? `${houseData.kannadaName}. ${houseData.simpleIntroKn}` : `${houseData.englishName}. ${houseData.simpleIntroEn}`)}
              className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition"
            >
              <span>🔊</span>
              <span>{isKn ? "ಧ್ವನಿ ವಿವರಣೆ" : "Voice Recite"}</span>
            </button>
          </div>

          {/* 7-Step Navigation Node Bar */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {stepsList.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  setCurrentStep(st.num);
                  gameAudio.playTick();
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  currentStep === st.num
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md scale-105"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                }`}
              >
                <span>{st.icon}</span>
                <span>{isKn ? st.nameKn : st.nameEn}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Core Traits & Karakatvas */}
          {currentStep === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="rounded-xl bg-amber-950/60 border border-amber-500/40 p-3.5 text-xs text-amber-100 leading-relaxed font-medium">
                {isKn ? houseData.simpleIntroKn : houseData.simpleIntroEn}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-1">
                  <div className="text-amber-300 font-bold">🏛️ {isKn ? "ಭಾವದ ವರ್ಗ:" : "Bhava Category:"}</div>
                  <div className="text-white font-extrabold">{isKn ? houseData.bhavaCategoryKn : houseData.bhavaCategoryEn}</div>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-1">
                  <div className="text-amber-300 font-bold">🔥 {isKn ? "ಪಂಚಭೂತ ತತ್ತ್ವ:" : "Element:"}</div>
                  <div className="text-white font-extrabold">{isKn ? houseData.elementKn : houseData.elementEn}</div>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-1">
                  <div className="text-amber-300 font-bold">☀️ {isKn ? "ನೈಸರ್ಗಿಕ ಕಾರಕ ಗ್ರಹ:" : "Karaka Planet:"}</div>
                  <div className="text-white font-extrabold">{isKn ? houseData.karakaPlanetKn : houseData.karakaPlanetEn}</div>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-1">
                  <div className="text-amber-300 font-bold">👤 {isKn ? "ಶರೀರದ ಅಂಗಗಳು:" : "Body Parts:"}</div>
                  <div className="text-white font-extrabold">{isKn ? houseData.bodyPartsKn : houseData.bodyPartsEn}</div>
                </div>
              </div>

              {/* Life Themes Matrix */}
              <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-2">
                <div className="text-xs font-bold text-amber-300">
                  🎯 {isKn ? "ಮುಖ್ಯ ಜೀವನ ವಿಷಯಗಳು (Key Themes):" : "Core Life Themes:"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isKn ? houseData.lifeThemesKn : houseData.lifeThemesEn).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold"
                    >
                      • {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guru Sandesha */}
              <div className="rounded-xl bg-gradient-to-r from-amber-950 to-orange-950 border border-amber-400/60 p-3 text-xs text-amber-100 font-serif italic leading-relaxed">
                🙏 {isKn ? houseData.guruSandeshaKn : houseData.guruSandeshaEn}
              </div>
            </div>
          )}

          {/* STEP 2: Exaltation & Debilitation (Dignity) */}
          {currentStep === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Exalted Planet */}
                <div className="rounded-xl bg-emerald-950/70 border-2 border-emerald-500/70 p-3.5 space-y-1.5 shadow-lg shadow-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <span>👑</span>
                      <span>{isKn ? "ಪರಮೋಚ್ಚ ಗ್ರಹ (Exalted)" : "Exalted Planet"}</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                      {houseData.dignity.exaltedDegree}
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {isKn ? houseData.dignity.exaltedPlanetKn : houseData.dignity.exaltedPlanetEn}
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    {isKn ? houseData.dignity.exaltationReasonKn : houseData.dignity.exaltationReasonEn}
                  </p>
                </div>

                {/* Debilitated Planet */}
                <div className="rounded-xl bg-rose-950/70 border-2 border-rose-500/70 p-3.5 space-y-1.5 shadow-lg shadow-rose-950/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{isKn ? "ಪರಮ ನೀಚ ಗ್ರಹ (Debilitated)" : "Debilitated Planet"}</span>
                    </span>
                    <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                      {houseData.dignity.debilitatedDegree}
                    </span>
                  </div>
                  <div className="text-sm font-black text-white">
                    {isKn ? houseData.dignity.debilitatedPlanetKn : houseData.dignity.debilitatedPlanetEn}
                  </div>
                  <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                    {isKn ? houseData.dignity.debilitationReasonKn : houseData.dignity.debilitationReasonEn}
                  </p>
                </div>
              </div>

              {/* Moolatrikona Dignity */}
              <div className="rounded-xl bg-slate-900 border border-amber-500/40 p-3 text-xs space-y-1">
                <div className="text-amber-300 font-bold">📐 {isKn ? "ಮೂಲತ್ರಿಕೋಣ ಅಧಿಪತ್ಯ:" : "Moolatrikona Dignity:"}</div>
                <div className="text-white font-extrabold">{isKn ? houseData.dignity.moolatrikonaKn : houseData.dignity.moolatrikonaEn}</div>
              </div>

              {/* Natural Graha Friendships */}
              <div className="rounded-xl bg-slate-900 border border-amber-500/40 p-3 text-xs space-y-2">
                <div className="text-amber-300 font-bold">🤝 {isKn ? "ನೈಸರ್ಗಿಕ ಮಿತ್ರ-ಶತ್ರು-ಸಮ ಗ್ರಹ ಮೈತ್ರಿ:" : "Planetary Friendships:"}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-emerald-950/40 border border-emerald-600/40 p-2 rounded-lg">
                    <div className="text-emerald-300 font-bold">✨ {isKn ? "ಮಿತ್ರ ಗ್ರಹಗಳು:" : "Friends:"}</div>
                    <div className="text-white mt-1">{(isKn ? houseData.friendshipsKn.friends : houseData.friendshipsEn.friends).join(", ")}</div>
                  </div>
                  <div className="bg-rose-950/40 border border-rose-600/40 p-2 rounded-lg">
                    <div className="text-rose-300 font-bold">⚔️ {isKn ? "ಶತ್ರು ಗ್ರಹಗಳು:" : "Enemies:"}</div>
                    <div className="text-white mt-1">{(isKn ? houseData.friendshipsKn.enemies : houseData.friendshipsEn.enemies).join(", ")}</div>
                  </div>
                  <div className="bg-amber-950/40 border border-amber-600/40 p-2 rounded-lg">
                    <div className="text-amber-300 font-bold">⚖️ {isKn ? "ಸಮ ಗ್ರಹಗಳು:" : "Neutrals:"}</div>
                    <div className="text-white mt-1">{(isKn ? houseData.friendshipsKn.neutrals : houseData.friendshipsEn.neutrals).join(", ")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 9 Planets Placements Interactive Selector */}
          {currentStep === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>🪐 {isKn ? "ಯಾವುದೇ ಗ್ರಹವನ್ನು ಆರಿಸಿ ಫಲ ತಿಳಿಯಿರಿ:" : "Select a Planet to View Placement Effects:"}</span>
                <span className="text-[10px] text-slate-400">{isKn ? "೯ ಗ್ರಹಗಳು ಲಭ್ಯ" : "9 Planets"}</span>
              </div>

              {/* 9 Planet Selector Badges */}
              <div className="flex flex-wrap gap-1.5">
                {houseData.grahaEffects.map((ge) => (
                  <button
                    key={ge.planetEn}
                    type="button"
                    onClick={() => {
                      setSelectedSimGraha(ge.planetEn.split(" ")[0]);
                      gameAudio.playTick();
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedSimGraha === ge.planetEn.split(" ")[0]
                        ? "bg-amber-400 text-slate-950 font-black shadow-md scale-105 ring-2 ring-amber-200"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <span>{ge.symbol}</span>
                    <span>{isKn ? ge.planetKn.split(" ")[0] : ge.planetEn.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Selected Planet Deep-Dive Card */}
              {(() => {
                const currentGraha =
                  houseData.grahaEffects.find((g) => g.planetEn.split(" ")[0] === selectedSimGraha) ||
                  houseData.grahaEffects[0];
                return (
                  <div className="rounded-xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 to-slate-950 p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentGraha.symbol}</span>
                        <div>
                          <h4 className="text-sm font-black text-amber-300">
                            {isKn ? currentGraha.effectTitleKn : currentGraha.effectTitleEn}
                          </h4>
                          <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                            {isKn ? "ಸ್ಥಾನ ಫಲ" : "Placement Fruition"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {isKn ? currentGraha.descriptionKn : currentGraha.descriptionEn}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/40 p-2.5 space-y-1">
                        <div className="text-emerald-300 font-bold">✨ {isKn ? "ಶುಭ ಫಲಗಳು:" : "Key Gifts:"}</div>
                        <ul className="list-disc list-inside text-emerald-100 space-y-0.5">
                          {(isKn ? currentGraha.keyGiftsKn : currentGraha.keyGiftsEn).map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 p-2.5 space-y-1">
                        <div className="text-rose-300 font-bold">⚠️ {isKn ? "ಎಚ್ಚರಿಕೆ & ಸವಾಲುಗಳು:" : "Watch Outs:"}</div>
                        <ul className="list-disc list-inside text-rose-100 space-y-0.5">
                          {(isKn ? currentGraha.watchOutsKn : currentGraha.watchOutsEn).map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-lg bg-amber-950/50 border border-amber-500/30 p-2.5 text-xs text-amber-200 font-serif italic">
                      {isKn ? currentGraha.bvRamanVerdictKn : currentGraha.bvRamanVerdictEn}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* STEP 4: Special Parashara & B.V. Raman Rules */}
          {currentStep === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-xs font-bold text-amber-300">
                📜 {isKn ? "ಪರಾಶರ & ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳು:" : "Classical Parashara & B.V. Raman Astrological Principles:"}
              </div>

              <div className="space-y-3">
                {houseData.specialRules.map((sr, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-500/50 bg-slate-900/90 p-3.5 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-300">
                        {isKn ? sr.ruleTitleKn : sr.ruleTitleEn}
                      </h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                        {sr.classicalSource}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {isKn ? sr.explanationKn : sr.explanationEn}
                    </p>

                    <div className="rounded-lg bg-amber-950/60 border border-amber-500/30 p-2.5 text-xs text-amber-200 font-serif italic">
                      <span className="font-bold text-amber-300">💡 ಬಿ.ವಿ. ರಾಮನ್ ಸೂತ್ರ:</span> {isKn ? sr.bvRamanInsightKn : sr.bvRamanInsightEn}
                    </div>

                    <div className="text-[11px] text-emerald-300 font-bold bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-lg">
                      <span>🧪 {isKn ? "ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆ:" : "Practical Application:"} </span>
                      <span className="text-emerald-100 font-medium">{isKn ? sr.practicalExampleKn : sr.practicalExampleEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Planetary Drishti Aspects */}
          {currentStep === 5 && (
            <div className="space-y-3 animate-fade-in">
              <div className="text-xs font-bold text-amber-300">
                👁️ {isKn ? "ಈ ಭಾವದಿಂದ ಗ್ರಹಗಳ ದೃಷ್ಟಿ ಪರಿಣಾಮಗಳು:" : "Planetary Aspects (Drishti) Originating From This House:"}
              </div>

              <div className="space-y-2.5">
                {houseData.drishtiRules.map((dr, idx) => (
                  <div key={idx} className="rounded-xl border border-amber-500/40 bg-slate-900 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <span>{dr.symbol}</span>
                        <span>{isKn ? dr.planetKn : dr.planetEn}</span>
                      </span>
                      <div className="flex gap-1">
                        {(isKn ? dr.aspectsKn : dr.aspectsEn).map((asp, i) => (
                          <span key={i} className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                            {asp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {isKn ? dr.drishtiQualityKn : dr.drishtiQualityEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Real-World Chart Case Study (NEW!) */}
          {currentStep === 6 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h4 className="text-xs sm:text-sm font-black text-amber-300">
                    {isKn ? houseData.realWorldExample.exampleTitleKn : houseData.realWorldExample.exampleTitleEn}
                  </h4>
                </div>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  Case Study
                </span>
              </div>

              {/* Chart Context Setup */}
              <div className="rounded-xl bg-slate-900/90 border border-amber-500/40 p-3 text-xs text-amber-100 font-medium leading-relaxed">
                <span className="font-bold text-amber-300">🔍 {isKn ? "ಜಾತಕ ಹಿನ್ನೆಲೆ:" : "Horoscope Context:"} </span>
                {isKn ? houseData.realWorldExample.chartContextKn : houseData.realWorldExample.chartContextEn}
              </div>

              {/* Key Placements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {houseData.realWorldExample.keyPlacements.map((kp, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-2.5 border ${
                      kp.isPositive ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100" : "bg-rose-950/40 border-rose-500/50 text-rose-100"
                    }`}
                  >
                    <div className="font-extrabold flex items-center justify-between">
                      <span className={kp.isPositive ? "text-emerald-300" : "text-rose-300"}>
                        {isKn ? kp.planetKn : kp.planetEn} in House {kp.house}
                      </span>
                      <span className="text-[10px] bg-slate-900 px-1.5 py-0.2 rounded font-bold">
                        {isKn ? kp.rashiKn : kp.rashiEn}
                      </span>
                    </div>
                    <div className="text-[11px] mt-1 font-medium">{isKn ? kp.conditionKn : kp.conditionEn}</div>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Synthesis Breakdown */}
              <div className="rounded-xl bg-slate-900 border border-amber-500/40 p-3.5 space-y-2">
                <div className="text-xs font-black text-amber-300">
                  📋 {isKn ? "ಹಂತ-ಹಂತದ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ:" : "Step-by-Step Synthesis Analysis:"}
                </div>
                <div className="space-y-1.5 text-xs text-slate-200">
                  {(isKn ? houseData.realWorldExample.synthesisAnalysisKn : houseData.realWorldExample.synthesisAnalysisEn).map((point, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800 font-medium">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dr. B.V. Raman Verdict */}
              <div className="rounded-xl bg-gradient-to-r from-amber-950 to-orange-950 border border-amber-400 p-3 text-xs text-amber-100 font-serif italic leading-relaxed">
                ✨ {isKn ? houseData.realWorldExample.bvRamanGoldenVerdictKn : houseData.realWorldExample.bvRamanGoldenVerdictEn}
              </div>

              {/* Remedial Takeaway */}
              <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-bold flex items-center gap-2">
                <span>🪔</span>
                <span>{isKn ? houseData.realWorldExample.remedialTakeawayKn : houseData.realWorldExample.remedialTakeawayEn}</span>
              </div>
            </div>
          )}

          {/* STEP 7: Mastery Quiz & Victory Test */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>🏆</span>
                  <span>{isKn ? "ಸಿದ್ಧಿ ಪರೀಕ್ಷೆ (Mastery Test):" : "House Mastery Quiz:"}</span>
                </h4>
                <span className="text-xs bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full">
                  Score: {quizScore} / {houseData.quiz.length}
                </span>
              </div>

              <div className="space-y-3">
                {houseData.quiz.map((q, qIdx) => {
                  const hasAnswered = userAnswers[qIdx] !== undefined;
                  const isCorrect = userAnswers[qIdx] === q.correctIndex;

                  return (
                    <div key={qIdx} className="rounded-xl border border-amber-500/40 bg-slate-900 p-3.5 space-y-3">
                      <div className="text-xs font-bold text-white">
                        {qIdx + 1}. {isKn ? q.questionKn : q.questionEn}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(isKn ? q.optionsKn : q.optionsEn).map((opt, optIdx) => {
                          let optStyle = "bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-800";
                          if (hasAnswered) {
                            if (optIdx === q.correctIndex) {
                              optStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-black ring-2 ring-emerald-400";
                            } else if (userAnswers[qIdx] === optIdx) {
                              optStyle = "bg-rose-950/80 border-rose-500 text-rose-200 font-bold";
                            } else {
                              optStyle = "bg-slate-950/40 border-slate-800 text-slate-500 opacity-50";
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleAnswerQuiz(qIdx, optIdx)}
                              className={`p-2.5 rounded-xl border text-xs text-left transition font-medium ${optStyle}`}
                            >
                              <span className="font-bold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div
                          className={`rounded-lg p-2.5 text-xs font-medium leading-relaxed ${
                            isCorrect
                              ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-200"
                              : "bg-rose-950/60 border border-rose-500/50 text-rose-200"
                          }`}
                        >
                          <div className="font-black mb-0.5">
                            {isCorrect ? "✅ ಸರಿಯಾದ ಉತ್ತರ! (Correct Answer)" : "❌ ತಪ್ಪು ಉತ್ತರ (Incorrect)"}
                          </div>
                          <div>{isKn ? q.explanationKn : q.explanationEn}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isAllQuizAnswered && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-2 border-emerald-400 p-4 text-center space-y-2 shadow-xl animate-bounce">
                  <div className="text-3xl">🎉</div>
                  <div className="text-sm font-black text-emerald-300">
                    {isKn ? "ಅಭಿನಂದನೆಗಳು! ಈ ಭಾವದ ಸಿದ್ಧಿ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ." : "Congratulations! House Mastery Test Complete."}
                  </div>
                  <div className="text-xs text-emerald-100 font-bold">
                    +100 XP ಗಳಿಸಲಾಗಿದೆ! ಮುಂದಿನ ಮನೆಗೆ ಪ್ರವೇಶಿಸಿ.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-amber-500/30">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-30 transition border border-slate-700"
            >
              ← {isKn ? "ಹಿಂದಿನ ಹಂತ" : "Previous"}
            </button>

            <div className="text-xs font-black text-amber-300">
              {isKn ? "ಹಂತ" : "Step"} {currentStep} / 7
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg transition transform active:scale-95"
            >
              {currentStep === 7 ? (isKn ? "ಸಿದ್ಧಿ ಮುಕ್ತಾಯ 🎉" : "Complete Quest 🎉") : (isKn ? "ಮುಂದಿನ ಹಂತ →" : "Next Step →")}
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. MASTER 12-HOUSE GRAND SYNTHESIS MODAL (POPUP ARENA)                 */}
      {/* ====================================================================== */}
      {showGrandMasterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <h3 className="font-serif text-base sm:text-xl font-black text-amber-300">
                    {isKn ? MASTER_12_HOUSE_GRAND_EXAMPLE.titleKn : MASTER_12_HOUSE_GRAND_EXAMPLE.titleEn}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium">
                    {isKn ? MASTER_12_HOUSE_GRAND_EXAMPLE.subtitleKn : MASTER_12_HOUSE_GRAND_EXAMPLE.subtitleEn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGrandMasterModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 font-black flex items-center justify-center text-sm border border-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Sovereign Horoscope Card */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-500/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-900/80 px-2 py-0.5 rounded-full">
                  {MASTER_12_HOUSE_GRAND_EXAMPLE.horoscopeName}
                </span>
                <h4 className="text-sm sm:text-base font-black text-white mt-1">
                  {MASTER_12_HOUSE_GRAND_EXAMPLE.lagna}
                </h4>
              </div>
              <span className="text-xs bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-full shadow">
                12 Houses Unified
              </span>
            </div>

            {/* 12-House Synthesis Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MASTER_12_HOUSE_GRAND_EXAMPLE.all12HouseAnalysis.map((item) => {
                let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
                if (item.conditionQuality.includes("Exalted") || item.conditionQuality.includes("Raja")) {
                  badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
                }

                return (
                  <div
                    key={item.houseNumber}
                    className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-3.5 space-y-2 shadow-sm hover:border-amber-400 transition"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-black text-amber-300">
                        {isKn ? item.houseNameKn : item.houseNameEn}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {item.conditionQuality}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>
                        <span className="text-amber-400 font-bold">{isKn ? "ರಾಶಿ:" : "Sign:"}</span> {isKn ? item.rashiKn : item.rashiEn}
                      </div>
                      <div>
                        <span className="text-amber-400 font-bold">{isKn ? "ಗ್ರಹ ಸ್ಥಿತಿ:" : "Planets:"}</span> {item.planetsPresent}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-200 leading-relaxed font-medium bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                      {isKn ? item.interpretationKn : item.interpretationEn}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Grand Overall Verdict */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 p-4 space-y-2">
              <div className="text-xs font-black text-amber-300 flex items-center gap-2">
                <span>🌟</span>
                <span>{isKn ? "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ & ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಮಹಾ ತೀರ್ಪು:" : "Grand Master Verdict:"}</span>
              </div>
              <p className="text-xs text-amber-100 font-serif italic leading-relaxed">
                {isKn ? MASTER_12_HOUSE_GRAND_EXAMPLE.overallGrandVerdictKn : MASTER_12_HOUSE_GRAND_EXAMPLE.overallGrandVerdictEn}
              </p>
            </div>

            {/* Master Life Lesson */}
            <div className="rounded-2xl bg-emerald-950/80 border border-emerald-400 p-4 flex items-center gap-3">
              <span className="text-2xl">🕉️</span>
              <div className="text-xs text-emerald-100 font-bold leading-relaxed">
                {isKn ? MASTER_12_HOUSE_GRAND_EXAMPLE.masterLifeLessonKn : MASTER_12_HOUSE_GRAND_EXAMPLE.masterLifeLessonEn}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGrandMasterModal(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-lg hover:from-amber-300 hover:to-yellow-400"
              >
                {isKn ? "ಮುಚ್ಚಿ & ಆಟ ಮುಂದುವರಿಸಿ" : "Close Arena"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
