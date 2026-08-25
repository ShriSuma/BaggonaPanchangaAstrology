import React, { useState } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";
import { encodeAcademyToken } from "../../utils/tokenCipher";
import {
  HOUSE_LEARNING_MODULES,
  type HouseLearningModule
} from "../../features/kundlilearning/kundliAcademyKnowledge";

export type LearnKundliProps = {
  lang?: string;
};

// South Indian Chart Box Layout Matrix (12 Houses in Classical Fixed Order)
const SOUTH_INDIAN_LAYOUT = [
  { house: 12, rashi: "Meena", labelKn: "೧೨ ಮೀನ", labelEn: "12 Pisces", row: 1, col: 1 },
  { house: 1, rashi: "Mesha", labelKn: "೧ ಮೇಷ (ಲಗ್ನ)", labelEn: "1 Aries (Lagna)", row: 1, col: 2 },
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

export const LearnKundliGame: React.FC<LearnKundliProps> = ({ lang = "kn" }) => {
  const [currentLang, setCurrentLang] = useState<string>(lang || "kn");
  const isKn = currentLang.slice(0, 2) === "kn";

  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1); // 1..7
  const [selectedSimGraha, setSelectedSimGraha] = useState<string>("Sun");
  const [quizScore, setQuizScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareStudentName, setShareStudentName] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const houseData: HouseLearningModule = HOUSE_LEARNING_MODULES[selectedHouse] || HOUSE_LEARNING_MODULES[1];

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
      gameAudio.playTick();
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
    } else {
      gameAudio.playBuzzer();
    }
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const isAllQuizAnswered = houseData.quiz && Object.keys(userAnswers).length === houseData.quiz.length;

  return (
    <div className="space-y-6">
      {/* Master Academy Header with Shreeram Pandit Gurukula Preceptor Badge */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 shadow-inner flex items-center justify-center text-3xl select-none shrink-0">
              🕉️
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-800 text-amber-50 px-2 py-0.5 rounded-md font-bold">
                  ॥ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ (Guruji Mentorship) ॥
                </span>
                <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  Level {selectedHouse} / 12
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl font-extrabold text-amber-950">
                {isKn ? "ಕುಂಡಲಿ ಓದಲು ಕಲಿಯಿರಿ · ಹಂತ-ಹಂತದ ವೈದಿಕ ಅಕಾಡೆಮಿ" : "Learn to Read Janma Kundali · Step-by-Step"}
              </h2>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                {isKn
                  ? "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ) ಅವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ೧೨ ಮನೆಗಳು, ಗ್ರಹ ಮೈತ್ರಿ, ಉಚ್ಚ-ನೀಚ ಹಾಗೂ ಫಲಜ್ಯೋತಿಷ್ಯ ಕಲಿಯಿರಿ."
                  : "Under the direct mentorship of Revered Shreeram Pandit (Guruji), learn the authentic Vedic rules of all 12 houses, aspects, friendships, and placement outcomes!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setCurrentLang(isKn ? "en" : "kn")}
              className="px-3 py-1.5 rounded-xl border border-amber-400 bg-white text-amber-950 font-bold text-xs shadow-xs hover:bg-amber-50"
            >
              🌐 {isKn ? "English ನಲ್ಲಿ ಓದಿ" : "ಕನ್ನಡದಲ್ಲಿ ಓದಿ"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShareModal(true);
                gameAudio.playChime();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-amber-50 font-bold text-xs shadow-xs hover:from-amber-800 hover:to-black transition flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>{isKn ? "ವಿದ್ಯಾರ್ಥಿ ಲಿಂಕ್" : "Share Link"}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Guruji's Blessing Card */}
      {houseData.guruSandeshaKn && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/80 p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📿</span>
            <p className="text-xs text-amber-950 font-medium italic">
              <strong>{isKn ? "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ ಆಶೀರ್ವಚನ:" : "Revered Shreeram Pandit (Guruji's Blessing):"}</strong>{" "}
              "{isKn ? houseData.guruSandeshaKn : houseData.guruSandeshaEn}"
            </p>
          </div>
          <button
            type="button"
            onClick={() => speakText(isKn ? houseData.guruSandeshaKn : houseData.guruSandeshaEn)}
            className="p-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs hover:bg-amber-100 shrink-0"
            title="Listen to Guruji's voice"
          >
            🔊
          </button>
        </div>
      )}

      {/* 12-Level Jump Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => handleSelectHouse(h)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition ${
              selectedHouse === h
                ? "bg-amber-900 text-amber-50 border border-amber-700 shadow-md scale-105"
                : "bg-white border border-amber-200 text-amber-950 hover:bg-amber-50"
            }`}
          >
            {isKn ? `${h}ನೇ ಮನೆ (${HOUSE_LEARNING_MODULES[h]?.naturalRashiKn.split(" ")[0]})` : `House ${h} (${HOUSE_LEARNING_MODULES[h]?.naturalRashiEn.split(" ")[0]})`}
          </button>
        ))}
      </div>

      {/* Main Grid: South Indian Visual Board & Step-by-Step Learning Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive South Indian Chart Box (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="border-2 border-amber-400 bg-amber-50/70 p-3 shadow-md text-center">
            <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest mb-2">
              ॥ ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ ಚಕ್ರ (South Indian Chart) ॥
            </div>

            {/* 4x4 Grid with Hollow Center */}
            <div className="grid grid-cols-4 grid-rows-4 gap-1.5 aspect-square p-2 bg-gradient-to-br from-amber-100 to-amber-200/50 rounded-2xl border-2 border-amber-300 shadow-inner">
              {SOUTH_INDIAN_LAYOUT.map((cell) => {
                const isSelected = selectedHouse === cell.house;
                return (
                  <button
                    key={cell.house}
                    type="button"
                    onClick={() => handleSelectHouse(cell.house)}
                    style={{ gridRow: cell.row, gridColumn: cell.col }}
                    className={`rounded-xl border flex flex-col justify-between p-1.5 text-center transition shadow-2xs ${
                      isSelected
                        ? "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-amber-50 border-amber-950 font-black scale-105 z-10 ring-2 ring-amber-400"
                        : "bg-white/90 border-amber-200 text-amber-950 hover:bg-amber-100 hover:border-amber-400 font-bold"
                    }`}
                  >
                    <span className="text-[9px] opacity-75">{isKn ? `${cell.house}ನೇ ಮನೆ` : `H${cell.house}`}</span>
                    <span className="text-[10px] font-extrabold my-auto leading-tight">
                      {isKn ? cell.labelKn.split(" ")[1] : cell.labelEn.split(" ")[1]}
                    </span>
                  </button>
                );
              })}

              {/* Center Hollow Box */}
              <div
                style={{ gridRow: "2 / 4", gridColumn: "2 / 4" }}
                className="bg-white/95 rounded-xl border border-amber-300 p-2 flex flex-col items-center justify-center text-center shadow-xs"
              >
                <span className="text-2xl select-none">🕉️</span>
                <span className="text-[10px] font-extrabold text-amber-950 mt-0.5">
                  {isKn ? houseData.kannadaName.split("-")[1] : houseData.englishName.split("-")[1]}
                </span>
                <span className="text-[9px] text-amber-800 font-semibold">
                  {isKn ? `ಒಡೆಯ: ${houseData.naturalLordKn}` : `Lord: ${houseData.naturalLordEn}`}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-amber-900/80 font-medium">
              💡 {isKn ? "ಯಾವುದೇ ಮನೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಆ ಮನೆಯ ರಹಸ್ಯಗಳನ್ನು ತಿಳಿಯಿರಿ!" : "Click any house box to jump to its master lesson!"}
            </div>
          </Card>
        </div>

        {/* Right: Master 7-Step Step-by-Step Learning Portal (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-2 border-amber-400 bg-white p-5 shadow-md space-y-4">
            {/* Step Navigation Header */}
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  {isKn ? `ಹಂತ ${currentStep} / ೭` : `Step ${currentStep} of 7`}
                </span>
                <button
                  type="button"
                  onClick={() => speakText(isKn ? houseData.simpleIntroKn : houseData.simpleIntroEn)}
                  title="Listen to pronunciation"
                  className="p-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs border border-amber-200"
                >
                  🔊
                </button>
              </div>

              {/* Step Title */}
              <span className="text-xs font-extrabold text-amber-900 uppercase">
                {currentStep === 1 && (isKn ? "೧. ಮೂಲ ಪರಿಚಯ & ಒಡೆಯ" : "1. Identity & Natural Lord")}
                {currentStep === 2 && (isKn ? "೨. ಜೀವನ ಕ್ಷೇತ್ರ & ಅಂಗಗಳು" : "2. Life Themes & Anatomy")}
                {currentStep === 3 && (isKn ? "೩. ಉಚ್ಚ, ನೀಚ & ಮೂಲತ್ರಿಕೋಣ" : "3. Exaltation & Dignities")}
                {currentStep === 4 && (isKn ? "೪. ಶತ್ರು - ಮಿತ್ರ ಗ್ರಹ ಮೈತ್ರಿ" : "4. Planetary Alliances")}
                {currentStep === 5 && (isKn ? "೫. ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ವಿಶೇಷ ಸೂತ್ರ" : "5. B.V. Raman Master Rules")}
                {currentStep === 6 && (isKn ? "೬. ೯ ಗ್ರಹಗಳ ಫಲ ಸಿಮ್ಯುಲೇಟರ್" : "6. 9-Graha Phala Simulator")}
                {currentStep === 7 && (isKn ? "೭. ಹೌಸ್ ಮಾಸ್ಟರ್ ಪರೀಕ್ಷೆ (Quiz)" : "7. House Master Quiz")}
              </span>
            </div>

            {/* ========================================================== */}
            {/* STEP 1: IDENTITY & FOUNDATIONAL BASICS                     */}
            {/* ========================================================== */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <h3 className="font-serif text-base font-extrabold text-amber-950">
                    {isKn ? houseData.kannadaName : houseData.englishName}
                  </h3>
                  <p className="text-amber-900 leading-relaxed font-medium">
                    {isKn ? houseData.simpleIntroKn : houseData.simpleIntroEn}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">👑 {isKn ? "ನೈಸರ್ಗಿಕ ಮನೆ ಒಡೆಯ (Lord):" : "Natural Ruler:"}</strong>
                    <span className="text-amber-900 font-extrabold text-sm">{isKn ? houseData.naturalLordKn : houseData.naturalLordEn}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">♈ {isKn ? "ನೈಸರ್ಗಿಕ ರಾಶಿ (Zodiac Sign):" : "Natural Zodiac Sign:"}</strong>
                    <span className="text-amber-900 font-extrabold text-sm">{isKn ? houseData.naturalRashiKn : houseData.naturalRashiEn}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">🏛️ {isKn ? "ಭಾವ ವರ್ಗ (Category):" : "House Category:"}</strong>
                    <span className="text-amber-900 font-bold">{isKn ? houseData.bhavaCategoryKn : houseData.bhavaCategoryEn}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">🔥 {isKn ? "ಮಹಾಭೂತ ತತ್ತ್ವ (Element):" : "Elemental Quality:"}</strong>
                    <span className="text-amber-900 font-bold">{isKn ? houseData.elementKn : houseData.elementEn}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">🪐 {isKn ? "ನೈಸರ್ಗಿಕ ಕಾರಕ ಗ್ರಹ (Signifier):" : "Natural Karaka:"}</strong>
                    <span className="text-amber-900 font-bold">{isKn ? houseData.karakaPlanetKn : houseData.karakaPlanetEn}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-1">
                    <strong className="text-amber-950 block">🔄 {isKn ? "ಭಾವತ್ ಭಾವಂ ಮೂಲ (Bhavat Bhavam):" : "Bhavat Bhavam Link:"}</strong>
                    <span className="text-amber-900 font-bold">{isKn ? houseData.bhavatBhavamDescKn : houseData.bhavatBhavamDescEn}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 2: LIFE THEMES & ANATOMY                             */}
            {/* ========================================================== */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="font-serif text-sm font-bold text-amber-950">
                    🎯 {isKn ? "ಈ ಮನೆಯಿಂದ ತಿಳಿಯುವ ಪ್ರಮುಖ ವಿಷಯಗಳು (Core Life Domains):" : "Key Life Themes Represented:"}
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(isKn ? houseData.lifeThemesKn : houseData.lifeThemesEn).map((theme, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 shadow-2xs">
                        ✓ {theme}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1">
                  <strong className="text-amber-950 block font-serif text-sm">
                    🧬 {isKn ? "ಶರೀರದ ಅಂಗಗಳು (Governed Anatomical Organs):" : "Governed Anatomical Organs:"}
                  </strong>
                  <p className="text-amber-900 font-medium leading-relaxed">
                    {isKn ? houseData.bodyPartsKn : houseData.bodyPartsEn}
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 3: EXALTATION, DEBILITATION & MOOLATRIKONA            */}
            {/* ========================================================== */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Exalted Planet Card */}
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <span>🔺</span>
                      <span>{isKn ? "ಉಚ್ಚ ಗ್ರಹ (Exalted Planet - Supreme Power)" : "Exalted Planet (Peak Strength)"}</span>
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded-full">
                      {houseData.dignity.exaltedDegree}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-emerald-900">
                    {isKn ? houseData.dignity.exaltedPlanetKn : houseData.dignity.exaltedPlanetEn}
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed">
                    <strong>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ (Classical Reason):" : "Classical Rationale:"}</strong>{" "}
                    {isKn ? houseData.dignity.exaltationReasonKn : houseData.dignity.exaltationReasonEn}
                  </p>
                </div>

                {/* Debilitated Planet Card */}
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-extrabold text-rose-950 flex items-center gap-1.5">
                      <span>🔻</span>
                      <span>{isKn ? "ನೀಚ ಗ್ರಹ (Debilitated Planet - Challenged State)" : "Debilitated Planet (Challenged)"}</span>
                    </span>
                    <span className="text-[10px] bg-rose-200 text-rose-900 font-black px-2 py-0.5 rounded-full">
                      {houseData.dignity.debilitatedDegree}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-rose-900">
                    {isKn ? houseData.dignity.debilitatedPlanetKn : houseData.dignity.debilitatedPlanetEn}
                  </div>
                  <p className="text-rose-950 font-medium leading-relaxed">
                    <strong>{isKn ? "ಶಾಸ್ತ್ರೀಯ ಕಾರಣ (Classical Reason):" : "Classical Rationale:"}</strong>{" "}
                    {isKn ? houseData.dignity.debilitationReasonKn : houseData.dignity.debilitationReasonEn}
                  </p>
                </div>

                {/* Moolatrikona Card */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-1">
                  <strong className="text-amber-950 block">👑 {isKn ? "ಮೂಲತ್ರಿಕೋಣ ಕ್ಷೇತ್ರ:" : "Moolatrikona Dignity:"}</strong>
                  <p className="text-amber-900 font-bold">
                    {isKn ? houseData.dignity.moolatrikonaKn : houseData.dignity.moolatrikonaEn}
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 4: PLANETARY FRIENDSHIPS & ALLIANCES                 */}
            {/* ========================================================== */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                  <h4 className="font-serif text-sm font-bold text-amber-950">
                    🤝 {isKn ? "ಈ ಮನೆಯ ನೈಸರ್ಗಿಕ ಗ್ರಹ ಮೈತ್ರಿ (Planetary Relationships):" : "Planetary Alliances in this House:"}
                  </h4>

                  <div className="space-y-2">
                    {/* Friends */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <strong className="text-emerald-950 block mb-1">
                        🌟 {isKn ? "ಮಿತ್ರ ಗ್ರಹಗಳು (Friendly Grahas - Boon & Support):" : "Friendly Grahas (Boon & Support):"}
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {(isKn ? houseData.friendshipsKn.friends : houseData.friendshipsEn.friends).map((f, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-emerald-300 rounded-md font-bold text-emerald-900">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Enemies */}
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <strong className="text-rose-950 block mb-1">
                        ⚔️ {isKn ? "ಶತ್ರು ಗ್ರಹಗಳು (Inimical Grahas - Friction & Tests):" : "Inimical Grahas (Friction & Lessons):"}
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {(isKn ? houseData.friendshipsKn.enemies : houseData.friendshipsEn.enemies).map((e, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-rose-300 rounded-md font-bold text-rose-900">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Neutrals */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <strong className="text-slate-950 block mb-1">
                        ⚖️ {isKn ? "ಸಮ ಗ್ರಹಗಳು (Neutral Grahas - Balanced Results):" : "Neutral Grahas (Balanced):"}
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {(isKn ? houseData.friendshipsKn.neutrals : houseData.friendshipsEn.neutrals).map((n, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-slate-300 rounded-md font-bold text-slate-800">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 5: DR. B.V. RAMAN MASTER RULES & ASPECTS             */}
            {/* ========================================================== */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in text-xs">
                {houseData.specialRules.map((rule, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-sm space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                      <h4 className="font-serif text-sm font-extrabold text-amber-950">
                        {isKn ? rule.ruleTitleKn : rule.ruleTitleEn}
                      </h4>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        {rule.classicalSource}
                      </span>
                    </div>

                    <p className="text-amber-900 font-medium leading-relaxed">
                      {isKn ? rule.explanationKn : rule.explanationEn}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-amber-950 space-y-1">
                      <strong className="text-amber-900 block font-bold">
                        📜 {isKn ? "ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಸೂಕ್ಷ್ಮ ಒಳನೋಟ:" : "Dr. B.V. Raman's Astrological Insight:"}
                      </strong>
                      <p className="italic">{isKn ? rule.bvRamanInsightKn : rule.bvRamanInsightEn}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-100/60 text-amber-900 text-[11px]">
                      <strong>💡 {isKn ? "ಪ್ರಾಯೋಗಿಕ ಉದಾಹರಣೆ:" : "Practical Case Example:"}</strong>{" "}
                      {isKn ? rule.practicalExampleKn : rule.practicalExampleEn}
                    </div>
                  </div>
                ))}

                {/* Aspect / Drishti Rules */}
                {houseData.drishtiRules && houseData.drishtiRules.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-2xs space-y-2">
                    <h4 className="font-serif text-sm font-bold text-amber-950">
                      👁️ {isKn ? "ಈ ಮನೆಯಿಂದ ಬೀಳುವ ಗ್ರಹ ದೃಷ್ಟಿಗಳು (Planetary Aspects):" : "Planetary Aspects from this House:"}
                    </h4>
                    <div className="space-y-2">
                      {houseData.drishtiRules.map((dr, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">
                              {dr.symbol} {isKn ? dr.planetKn : dr.planetEn}
                            </span>
                            <div className="flex gap-1">
                              {(isKn ? dr.aspectsKn : dr.aspectsEn).map((a, j) => (
                                <span key={j} className="px-2 py-0.5 rounded-md bg-white border border-amber-300 text-[10px] font-extrabold text-amber-900">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-amber-900 text-[11px] leading-relaxed">
                            {isKn ? dr.drishtiQualityKn : dr.drishtiQualityEn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 6: INTERACTIVE 9-GRAHA OUTCOMES SIMULATOR            */}
            {/* ========================================================== */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center justify-between">
                    <span>🎮 {isKn ? "ಕುಂಡಲಿ ಸಿಮ್ಯುಲೇಟರ್: ೯ ಗ್ರಹಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ ಫಲ ತಿಳಿಯಿರಿ!" : "Kundli Simulator: Select any of 9 Grahas to see Phala!"}</span>
                  </h4>

                  {/* 9 Planets Picker Bar */}
                  <div className="flex flex-wrap gap-1.5">
                    {houseData.grahaEffects.map((ge) => (
                      <button
                        key={ge.planetEn}
                        type="button"
                        onClick={() => {
                          setSelectedSimGraha(ge.planetEn.split(" ")[0]);
                          gameAudio.playTick();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1 ${
                          selectedSimGraha.toLowerCase() === ge.planetEn.split(" ")[0].toLowerCase()
                            ? "bg-amber-900 text-amber-50 border border-amber-950 shadow-sm scale-105"
                            : "bg-white border border-amber-200 text-amber-950 hover:bg-amber-100"
                        }`}
                      >
                        <span>{ge.symbol}</span>
                        <span>{isKn ? ge.planetKn.split(" ")[0] : ge.planetEn.split(" ")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Planet Outcome Card */}
                {(() => {
                  const activeEffect = houseData.grahaEffects.find((g) => g.planetEn.toLowerCase().includes(selectedSimGraha.toLowerCase())) || houseData.grahaEffects[0];
                  if (!activeEffect) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{activeEffect.symbol}</span>
                          <div>
                            <span className="font-extrabold text-sm text-amber-950 block">
                              {isKn ? activeEffect.effectTitleKn : activeEffect.effectTitleEn}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-amber-950 font-medium leading-relaxed">
                        {isKn ? activeEffect.descriptionKn : activeEffect.descriptionEn}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <strong className="text-emerald-950 block">✨ {isKn ? "ದೈವಿಕ ಕೊಡುಗೆಗಳು (Key Gifts):" : "Key Gifts:"}</strong>
                          <ul className="list-disc list-inside text-emerald-900 font-bold space-y-0.5">
                            {(isKn ? activeEffect.keyGiftsKn : activeEffect.keyGiftsEn).map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                          <strong className="text-rose-950 block">⚠️ {isKn ? "ಎಚ್ಚರಿಕೆ (Watch Outs):" : "Watch Outs:"}</strong>
                          <ul className="list-disc list-inside text-rose-900 font-bold space-y-0.5">
                            {(isKn ? activeEffect.watchOutsKn : activeEffect.watchOutsEn).map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {activeEffect.bvRamanVerdictKn && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] italic font-medium">
                          {isKn ? activeEffect.bvRamanVerdictKn : activeEffect.bvRamanVerdictEn}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 7: HOUSE MASTER CERTIFICATION MINI-QUIZ               */}
            {/* ========================================================== */}
            {currentStep === 7 && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-amber-950">
                      🏆 {isKn ? `${selectedHouse}ನೇ ಮನೆಯ ಜ್ಞಾನ ಪರೀಕ್ಷೆ (House Master Quiz)` : `House ${selectedHouse} Master Quiz`}
                    </h4>
                    <span className="text-xs bg-amber-200 text-amber-900 font-black px-3 py-0.5 rounded-full">
                      Score: {quizScore} / {houseData.quiz.length}
                    </span>
                  </div>
                  <p className="text-amber-900">
                    {isKn ? "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ ಅವರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಸರಿಯಾದ ಉತ್ತರಗಳನ್ನು ಆರಿಸಿ 'Golden House Master Seal' ಪಡೆಯಿರಿ!" : "Answer correctly to earn Guruji's Golden House Master Seal!"}
                  </p>
                </div>

                <div className="space-y-3">
                  {houseData.quiz.map((q, qIdx) => {
                    const isAnswered = userAnswers[qIdx] !== undefined;
                    const selectedOpt = userAnswers[qIdx];

                    return (
                      <div key={qIdx} className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2">
                        <strong className="text-amber-950 block font-serif">
                          {qIdx + 1}. {isKn ? q.questionKn : q.questionEn}
                        </strong>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(isKn ? q.optionsKn : q.optionsEn).map((opt, optIdx) => {
                            const isCorrect = optIdx === q.correctIndex;
                            const isChosen = selectedOpt === optIdx;

                            let btnStyle = "bg-amber-50/50 border-amber-200 text-amber-950 hover:bg-amber-100";
                            if (isAnswered) {
                              if (isCorrect) {
                                btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-950 font-black";
                              } else if (isChosen) {
                                btnStyle = "bg-rose-100 border-rose-500 text-rose-950";
                              } else {
                                btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={isAnswered}
                                onClick={() => handleAnswerQuiz(qIdx, optIdx)}
                                className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isCorrect && <span>✅</span>}
                                {isAnswered && isChosen && !isCorrect && <span>❌</span>}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900">
                            <strong>💡 {isKn ? "ಗುರು ಉಪದೇಶ & ವಿವರಣೆ:" : "Guruji's Insight:"}</strong> {isKn ? q.explanationKn : q.explanationEn}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isAllQuizAnswered && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-200 to-yellow-300 border-2 border-amber-500 text-center space-y-2 animate-bounce">
                    <span className="text-3xl">🏅</span>
                    <h4 className="font-serif text-sm font-black text-amber-950">
                      {isKn ? `ಅಭಿನಂದನೆಗಳು! ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರೂಜಿ ಅವರ ಆಶೀರ್ವಾದದಿಂದ ನೀವು ${selectedHouse}ನೇ ಮನೆಯ ಜ್ಞಾನವನ್ನು ಕರಗತ ಮಾಡಿಕೊಂಡಿದ್ದೀರಿ!` : `Congratulations! By Guruji's grace, you mastered House ${selectedHouse}!`}
                    </h4>
                    {selectedHouse < 12 && (
                      <button
                        type="button"
                        onClick={() => handleSelectHouse(selectedHouse + 1)}
                        className="px-6 py-2 rounded-xl bg-amber-900 text-amber-50 font-bold text-xs shadow-md hover:bg-black transition"
                      >
                        ➡️ {isKn ? `ಮುಂದಿನ ${selectedHouse + 1}ನೇ ಮನೆಗೆ ಹೋಗಿ` : `Advance to House ${selectedHouse + 1}`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Stepper Action Bar */}
            <div className="pt-3 border-t border-amber-200 flex items-center justify-between">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={handlePrevStep}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  currentStep === 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-amber-100 text-amber-950 hover:bg-amber-200"
                }`}
              >
                <span>⬅️</span>
                <span>{isKn ? "ಹಿಂದಿನ ಹಂತ" : "Previous"}</span>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: 7 }, (_, i) => i + 1).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCurrentStep(s)}
                    className={`w-6 h-6 rounded-full text-[10px] font-black transition ${
                      currentStep === s
                        ? "bg-amber-900 text-white scale-110 shadow-xs"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentStep === 7}
                onClick={handleNextStep}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  currentStep === 7
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-amber-800 text-amber-50 hover:bg-amber-900 shadow-sm"
                }`}
              >
                <span>{isKn ? "ಮುಂದಿನ ಹಂತ" : "Next"}</span>
                <span>➡️</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Personalized Student Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <div>
                  <div className="text-[9px] font-extrabold text-amber-800 uppercase">॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ ॥</div>
                  <h3 className="font-serif text-base font-black text-amber-950">
                    {isKn ? "ವಿದ್ಯಾರ್ಥಿಗೆ ವೈಯಕ್ತಿಕ ಕಲಿಕಾ ಲಿಂಕ್" : "Personalized Vidyarthi Link"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center hover:bg-amber-200"
              >
                ✕
              </button>
            </div>

            {(() => {
              const nameToUse = (shareStudentName || (isKn ? "ವಿದ್ಯಾರ್ಥಿ" : "Vidyarthi")).trim();
              const token = encodeAcademyToken({
                name: nameToUse,
                lang: currentLang,
                level: selectedHouse,
                step: 1,
                invitedBy: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)"
              });
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const shareUrl = `${origin}/academy?academyToken=${token}`;

              const handleCopy = () => {
                if (!navigator.clipboard) return;
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                gameAudio.playSuccess();
                setTimeout(() => setCopied(false), 2500);
              };

              const handleWhatsApp = () => {
                const msg = isKn
                  ? `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ (Kundli Academy)!\n\nಆತ್ಮೀಯ ${nameToUse},\nಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ) ಅವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳೊಂದಿಗೆ ೧೨ ಮನೆಗಳ ಕುಂಡಲಿ ಫಲಜ್ಯೋತಿಷ್ಯವನ್ನು ಕಲಿಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ತೆರೆಯಿರಿ:\n\n👉 ${shareUrl}\n\n॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ ಪ್ರಸನ್ನ ॥`
                  : `🕉️ Baggona Vedic Kundli Gurukula!\n\nDear ${nameToUse},\nLearn to read Janma Kundali under the guidance of Revered Shreeram Pandit (Guruji) based on Dr. B.V. Raman's classical master rules:\n\n👉 ${shareUrl}\n\nBlessings from Shri Shantikaparameshwari!`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
              };

              return (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-amber-950 mb-1">
                      👤 {isKn ? "ವಿದ್ಯಾರ್ಥಿ / ಭಕ್ತರ ಹೆಸರು:" : "Vidyarthi / Devotee Name:"}
                    </label>
                    <input
                      type="text"
                      value={shareStudentName}
                      onChange={(e) => setShareStudentName(e.target.value)}
                      placeholder={isKn ? "ಉದಾ: ರಮೇಶ್, ಸುಮ, ಪ್ರಿಯಾ..." : "e.g., Ramesh, Suma, Priya..."}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/50 font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 break-all text-[11px] font-mono text-amber-900">
                    {shareUrl}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="py-2.5 rounded-xl bg-amber-900 text-amber-50 font-bold shadow hover:bg-black transition flex items-center justify-center gap-1.5"
                    >
                      <span>{copied ? "✅" : "📋"}</span>
                      <span>{copied ? (isKn ? "ಕಾಪಿ ಆಯಿತು!" : "Copied!") : (isKn ? "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ" : "Copy Link")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsApp}
                      className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                    >
                      <span>💬</span>
                      <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ" : "Share WhatsApp"}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-amber-800/80 text-center font-medium">
                    🔒 {isKn
                      ? "ಈ ಲಿಂಕ್ ತೆರೆದಾಗ ವಿದ್ಯಾರ್ಥಿಯು ಕೇವಲ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಕುಂಡಲಿ ಕಲಿಕಾ ತಾಣವನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಬಹುದು. ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ."
                      : "Recipients exclusively access Guruji Shreeram Pandit's Kundli Academy without login."}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
