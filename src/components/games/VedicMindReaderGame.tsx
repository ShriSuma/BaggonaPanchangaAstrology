import React, { useState } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type MindReaderProps = {
  lang?: string;
};

type Mode = "numbers" | "rashis" | "grahas";

const RASHIS = [
  { id: 1, nameKn: "ಮೇಷ (Aries)", nameEn: "Mesha (Aries)", symbol: "♈" },
  { id: 2, nameKn: "ವೃಷಭ (Taurus)", nameEn: "Vrishabha (Taurus)", symbol: "♉" },
  { id: 3, nameKn: "ಮಿಥುನ (Gemini)", nameEn: "Mithuna (Gemini)", symbol: "♊" },
  { id: 4, nameKn: "ಕರ್ಕಾಟಕ (Cancer)", nameEn: "Karkataka (Cancer)", symbol: "♋" },
  { id: 5, nameKn: "ಸಿಂಹ (Leo)", nameEn: "Simha (Leo)", symbol: "♌" },
  { id: 6, nameKn: "ಕನ್ಯಾ (Virgo)", nameEn: "Kanya (Virgo)", symbol: "♍" },
  { id: 7, nameKn: "ತುಲಾ (Libra)", nameEn: "Tula (Libra)", symbol: "♎" },
  { id: 8, nameKn: "ವೃಶ್ಚಿಕ (Scorpio)", nameEn: "Vrischika (Scorpio)", symbol: "♏" },
  { id: 9, nameKn: "ಧನು (Sagittarius)", nameEn: "Dhanu (Sagittarius)", symbol: "♐" },
  { id: 10, nameKn: "ಮಕರ (Capricorn)", nameEn: "Makara (Capricorn)", symbol: "♑" },
  { id: 11, nameKn: "ಕುಂಭ (Aquarius)", nameEn: "Kumbha (Aquarius)", symbol: "♒" },
  { id: 12, nameKn: "ಮೀನ (Pisces)", nameEn: "Meena (Pisces)", symbol: "♓" }
];

const GRAHAS = [
  { id: 1, nameKn: "ಸೂರ್ಯ (Surya)", nameEn: "Sun (Surya)", symbol: "☀️", blessing: "ತೇಜಸ್ಸು & ನಾಯಕತ್ವ" },
  { id: 2, nameKn: "ಚಂದ್ರ (Chandra)", nameEn: "Moon (Chandra)", symbol: "🌙", blessing: "ಶಾಂತಿ & ಕಲ್ಪನಾ ಶಕ್ತಿ" },
  { id: 3, nameKn: "ಮಂಗಳ (Kuja)", nameEn: "Mars (Mangala)", symbol: "🔥", blessing: "ಧೈರ್ಯ & ಶೌರ್ಯ" },
  { id: 4, nameKn: "ಬುಧ (Budha)", nameEn: "Mercury (Budha)", symbol: "💎", blessing: "ಬುದ್ಧಿ & ವ್ಯಾಪಾರ ಸಿದ್ಧಿ" },
  { id: 5, nameKn: "ಗುರು (Brihaspati)", nameEn: "Jupiter (Guru)", symbol: "🌟", blessing: "ಜ್ಞಾನ & ದೈವಿಕ ರಕ್ಷೆ" },
  { id: 6, nameKn: "ಶುಕ್ರ (Shukra)", nameEn: "Venus (Shukra)", symbol: "💖", blessing: "ಸೌಭಾಗ್ಯ & ಕಲಾ ಪ್ರೇಮ" },
  { id: 7, nameKn: "ಶನಿ (Shani)", nameEn: "Saturn (Shani)", symbol: "🪐", blessing: "ಶಿಸ್ತು & ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ" },
  { id: 8, nameKn: "ರಾಹು (Rahu)", nameEn: "Rahu", symbol: "🌪️", blessing: "ಆಕಸ್ಮಿಕ ಯಶಸ್ಸು" },
  { id: 9, nameKn: "ಕೇತು (Ketu)", nameEn: "Ketu", symbol: "📿", blessing: "ಆಧ್ಯಾತ್ಮಿಕ ಮೋಕ್ಷ" }
];

export const VedicMindReaderGame: React.FC<MindReaderProps> = ({ lang = "kn" }) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const [mode, setMode] = useState<Mode>("numbers");
  const [step, setStep] = useState<number>(0); // 0: Start, 1..6: Cards, 7: Reveal
  const [accumulatedValue, setAccumulatedValue] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [showReferenceGrid, setShowReferenceGrid] = useState<boolean>(false);

  const totalBits = mode === "numbers" ? 6 : mode === "rashis" ? 4 : 4; // 2^6=64, 2^4=16

  // Generate cards on the fly based on binary bit weights
  const getCardsForMode = () => {
    const bitCount = totalBits;
    const cards: number[][] = [];
    const maxVal = mode === "numbers" ? 63 : mode === "rashis" ? 12 : 9;

    for (let bit = 0; bit < bitCount; bit++) {
      const card: number[] = [];
      const bitWeight = 1 << bit; // 1, 2, 4, 8, 16, 32
      for (let n = 1; n <= maxVal; n++) {
        if ((n & bitWeight) !== 0) {
          card.push(n);
        }
      }
      cards.push(card);
    }
    return cards;
  };

  const cards = getCardsForMode();

  const handleStartGame = (selectedMode: Mode) => {
    setMode(selectedMode);
    setStep(1);
    setCardIndex(0);
    setAccumulatedValue(0);
    setIsRevealing(false);
    setShowReferenceGrid(false);
    gameAudio.playChime();
  };

  const handleCardResponse = (present: boolean) => {
    const bitWeight = 1 << cardIndex;
    const nextAcc = present ? accumulatedValue + bitWeight : accumulatedValue;
    setAccumulatedValue(nextAcc);

    if (cardIndex + 1 < totalBits) {
      setCardIndex(cardIndex + 1);
      setStep(cardIndex + 2);
      gameAudio.playTick();
    } else {
      // Reached end -> Reveal
      setIsRevealing(true);
      setStep(totalBits + 1);
      gameAudio.playDiceRoll();

      setTimeout(() => {
        setIsRevealing(false);
        gameAudio.playSuccess();
      }, 1400);
    }
  };

  const renderRevealedResult = () => {
    const finalVal = accumulatedValue;

    if (finalVal <= 0 || (mode === "rashis" && finalVal > 12) || (mode === "grahas" && finalVal > 9) || (mode === "numbers" && finalVal > 63)) {
      return (
        <div className="text-center py-6 space-y-3">
          <span className="text-5xl">🤔</span>
          <h4 className="text-base font-black text-amber-950">
            {isKn ? "ಯಾವುದೇ ಸಂಖ್ಯೆ ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ!" : "No valid match found!"}
          </h4>
          <p className="text-xs text-amber-900/90 font-medium max-w-md mx-auto">
            {isKn
              ? "ಬಹುಶಃ ಯಾವುದಾದರೂ ದ್ವಾರದಲ್ಲಿ ತಪ್ಪಾಗಿ 'ಹೌದು' ಅಥವಾ 'ಇಲ್ಲ' ಒತ್ತಿರಬಹುದು. ಚಿಂತೆ ಬೇಡ, ಏಕಾಗ್ರತೆಯಿಂದ ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ!"
              : "A gate response may have been missed. Relax your mind and try again!"}
          </p>
        </div>
      );
    }

    if (mode === "numbers") {
      return (
        <div className="text-center py-6 space-y-4">
          <div className="text-[11px] font-black text-amber-800 uppercase tracking-widest bg-amber-200/80 px-3 py-1 rounded-full inline-block">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ಸಂಖ್ಯೆ ॥
          </div>
          <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-5xl font-black text-amber-950 animate-bounce">
            {finalVal}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black text-amber-950">
              {isKn
                ? `ನೀವು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಅಂದುಕೊಂಡ ಸಂಖ್ಯೆ: ${finalVal}!`
                : `The secret number in your mind is: ${finalVal}!`}
            </p>
            <p className="text-xs text-amber-900 font-medium">
              🪔 {isKn ? "ವೈದಿಕ ಸಾಮುದ್ರಿಕ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರದ ದೈವಿಕ ರಹಸ್ಯವು ನಿಮ್ಮ ಚಿತ್ತವನ್ನು ನಿಖರವಾಗಿ ಗ್ರಹಿಸಿದೆ!" : "The ancient Vedic Oracle has pinpointed your exact thought!"}
            </p>
          </div>
        </div>
      );
    }

    if (mode === "rashis") {
      const rashi = RASHIS.find((r) => r.id === finalVal) || RASHIS[0];
      return (
        <div className="text-center py-6 space-y-4">
          <div className="text-[11px] font-black text-amber-800 uppercase tracking-widest bg-amber-200/80 px-3 py-1 rounded-full inline-block">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ರಾಶಿ ॥
          </div>
          <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-5xl font-black text-amber-950 animate-bounce">
            {rashi.symbol}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-amber-950">
              {isKn ? rashi.nameKn : rashi.nameEn}
            </h3>
            <p className="text-xs text-amber-900 font-medium">
              ✨ {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಮನದ ರಾಶಿ ಪ್ರಕಟವಾಗಿದೆ!" : "Your secret Zodiac sign has been revealed by the Oracle!"}
            </p>
          </div>
        </div>
      );
    }

    if (mode === "grahas") {
      const graha = GRAHAS.find((g) => g.id === finalVal) || GRAHAS[0];
      return (
        <div className="text-center py-6 space-y-4">
          <div className="text-[11px] font-black text-amber-800 uppercase tracking-widest bg-amber-200/80 px-3 py-1 rounded-full inline-block">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ನವಗ್ರಹ ದೇವತೆ ॥
          </div>
          <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-5xl font-black text-amber-950 animate-bounce">
            {graha.symbol}
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-amber-950">
              {isKn ? graha.nameKn : graha.nameEn}
            </h3>
            <p className="text-xs text-emerald-950 font-black bg-emerald-100 py-1.5 px-4 rounded-full inline-block border border-emerald-400 shadow-xs">
              🪔 {isKn ? `ಗ್ರಹ ಕೃಪೆ: ${graha.blessing}` : `Divine Blessing: ${graha.blessing}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Master Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 sm:p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-4xl select-none filter drop-shadow">🔮</span>
          <div className="space-y-1">
            <div className="text-[10px] font-black tracking-widest text-amber-900 uppercase flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-800 text-amber-50 px-2 py-0.5 rounded-md">
                ॥ ವೈದಿಕ ಚಿತ್ತ ರಹಸ್ಯ · ಮೈಂಡ್ ರೀಡರ್ ॥
              </span>
              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                Solo Oracle
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amber-950">
              {isKn ? "ವೈದಿಕ ಮೈಂಡ್ ರೀಡರ್ & ಮನೋ ಗ್ರಹಣ ಖೇಲ" : "The 108 Vedic Mind Reader (Solo Oracle)"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಸಂಖ್ಯೆ (೧-೬೩), ರಾಶಿ ಅಥವಾ ನವಗ್ರಹವನ್ನು ರಹಸ್ಯವಾಗಿ ನೆನಪಿಸಿಕೊಳ್ಳಿ. ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಯಂತ್ರ ತತ್ತ್ವದ ಮೂಲಕ ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಚ್ಚರಿಯ ರೀತಿಯಲ್ಲಿ ಓದುತ್ತದೆ!"
                : "Silently think of any number, Zodiac sign, or Navagraha deity. Through sacred Vedic binary matrices, the Oracle will pinpoint your exact thought!"}
            </p>
          </div>
        </div>
      </Card>

      {/* Step 0: Mode Selection & Full Secret Number Reference Viewer */}
      {step === 0 && (
        <Card className="border-2 border-amber-300 bg-white p-4 sm:p-6 shadow-md space-y-5">
          <div className="text-center space-y-1">
            <h4 className="font-serif text-base sm:text-lg font-black text-amber-950">
              {isKn ? "ನೀವು ಮನಸ್ಸಿನಲ್ಲಿ ಏನು ನೆನಪಿಸಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?" : "What would you like to think of in secret?"}
            </h4>
            <p className="text-xs text-amber-900/80 font-medium">
              {isKn ? "ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಓರಾಕಲ್ ಸವಾಲನ್ನು ಪ್ರಾರಂಭಿಸಿ:" : "Select a category and challenge the Oracle:"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => handleStartGame("numbers")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-lg transition text-center space-y-2 group active:scale-95 cursor-pointer"
            >
              <span className="text-4xl block group-hover:scale-110 transition">🔢</span>
              <strong className="text-sm font-black text-amber-950 block">
                {isKn ? "ರಹಸ್ಯ ಸಂಖ್ಯೆ (೧ - ೬೩)" : "Secret Number (1 - 63)"}
              </strong>
              <p className="text-xs text-amber-900/80 font-medium">
                {isKn ? "ಮನಸ್ಸಿನಲ್ಲಿ ೧ ರಿಂದ ೬೩ ರವರೆಗೆ ಯಾವುದೇ ಸಂಖ್ಯೆ ಅಂದುಕೊಳ್ಳಿ" : "Think of any integer between 1 and 63"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleStartGame("rashis")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-lg transition text-center space-y-2 group active:scale-95 cursor-pointer"
            >
              <span className="text-4xl block group-hover:scale-110 transition">♈</span>
              <strong className="text-sm font-black text-amber-950 block">
                {isKn ? "ದ್ವಾದಶ ರಾಶಿ (೧೨ Rashis)" : "12 Zodiac Signs"}
              </strong>
              <p className="text-xs text-amber-900/80 font-medium">
                {isKn ? "ಮೇಷದಿಂದ ಮೀನದವರೆಗೆ ಯಾವುದಾದರೂ ಒಂದು ರಾಶಿ" : "Think of any 1 of the 12 Zodiac signs"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleStartGame("grahas")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-lg transition text-center space-y-2 group active:scale-95 cursor-pointer"
            >
              <span className="text-4xl block group-hover:scale-110 transition">🪐</span>
              <strong className="text-sm font-black text-amber-950 block">
                {isKn ? "ನವಗ್ರಹ ದೇವತೆಗಳು (9 Grahas)" : "9 Navagrahas"}
              </strong>
              <p className="text-xs text-amber-900/80 font-medium">
                {isKn ? "ಸೂರ್ಯನಿಂದ ಕೇತುವಿನವರೆಗೆ ಯಾವುದಾದರೂ ಗ್ರಹ" : "Think of any of the 9 Celestial Planets"}
              </p>
            </button>
          </div>

          {/* Full Reference Grid Toggle (Helps users see all available 1-63 choices clearly on mobile) */}
          <div className="pt-2 border-t border-amber-200 text-center">
            <button
              type="button"
              onClick={() => setShowReferenceGrid(!showReferenceGrid)}
              className="text-xs font-black text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200 px-4 py-2 rounded-xl border border-amber-300 transition inline-flex items-center gap-1.5"
            >
              <span>{showReferenceGrid ? "🔼 ಮರೆಮಾಡಿ" : "👁️ ೧ ರಿಂದ ೬೩ ಸಂಖ್ಯೆಗಳ ಪೂರ್ಣ ಪಟ್ಟಿ ನೋಡಿ"}</span>
            </button>

            {showReferenceGrid && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-300 animate-fade-in space-y-2">
                <div className="text-[11px] font-black text-amber-900">
                  {isKn ? "ಈ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಯಾವುದೇ ಒಂದು ಸಂಖ್ಯೆಯನ್ನು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ:" : "Pick any number from below in your mind:"}
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto p-1">
                  {Array.from({ length: 63 }, (_, i) => i + 1).map((n) => (
                    <div
                      key={n}
                      className="p-2 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-950 shadow-2xs text-center"
                    >
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 1..N: Card Gates (Mobile Magnified Grid & High Contrast) */}
      {step >= 1 && step <= totalBits && (
        <Card className="border-2 border-amber-400 bg-gradient-to-b from-amber-50/70 to-white p-4 sm:p-6 shadow-xl space-y-4 animate-fade-in">
          {/* Gate Header */}
          <div className="flex items-center justify-between border-b border-amber-300 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-800 text-amber-50 font-black text-xs flex items-center justify-center shadow-xs">
                {cardIndex + 1}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800">
                  {isKn ? "ವೈದಿಕ ಯಂತ್ರ ದ್ವಾರ" : "Sacred Mystic Gate"}
                </span>
                <h4 className="font-serif text-sm sm:text-base font-black text-amber-950">
                  {isKn ? `ದ್ವಾರ ${cardIndex + 1} / ${totalBits}` : `Gate ${cardIndex + 1} of ${totalBits}`}
                </h4>
              </div>
            </div>
            <span className="text-xs bg-amber-200 text-amber-950 font-black px-3 py-1 rounded-full border border-amber-300">
              {cards[cardIndex]?.length} {isKn ? "ಅಂಶಗಳು" : "Items"}
            </span>
          </div>

          <div className="text-center py-1">
            <h4 className="text-sm sm:text-base font-black text-amber-950">
              {isKn
                ? "ನೀವು ಮನಸ್ಸಿನಲ್ಲಿ ಅಂದುಕೊಂಡ ವಿಷಯ ಈ ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ಗಳಲ್ಲಿದೆಯೇ?"
                : "Is your secret thought present in this sacred grid?"}
            </h4>
            <p className="text-xs text-amber-900/80 font-medium mt-0.5">
              {isKn ? "ಎಲ್ಲಾ ಸಂಖ್ಯೆಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗಮನಿಸಿ ಉತ್ತರಿಸಿ:" : "Check all items carefully and tap your answer:"}
            </p>
          </div>

          {/* Grid of items in this card (Extra Clear, High Contrast Mobile Chips) */}
          <div className="rounded-2xl bg-amber-950/90 border-2 border-amber-400 p-3 sm:p-4 shadow-inner">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5 text-center">
              {cards[cardIndex]?.map((val) => {
                let display = String(val);
                let subText = "";
                if (mode === "rashis") {
                  const r = RASHIS.find((x) => x.id === val);
                  display = r ? `${r.symbol}` : String(val);
                  subText = r ? r.nameKn.split(" ")[0] : "";
                } else if (mode === "grahas") {
                  const g = GRAHAS.find((x) => x.id === val);
                  display = g ? `${g.symbol}` : String(val);
                  subText = g ? g.nameKn.split(" ")[0] : "";
                }

                return (
                  <div
                    key={val}
                    className="min-h-[48px] sm:min-h-[56px] p-2 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center text-center select-none"
                  >
                    <span className="text-base sm:text-lg font-black text-amber-950 leading-none">
                      {display}
                    </span>
                    {subText && (
                      <span className="text-[10px] font-bold text-amber-900 leading-tight mt-0.5 truncate w-full">
                        {subText}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Giant Mobile Touch Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleCardResponse(true)}
              className="py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white font-black text-sm sm:text-base shadow-xl hover:from-emerald-700 hover:to-emerald-900 transition flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ring-2 ring-emerald-400"
            >
              <span className="text-xl">✅</span>
              <span>{isKn ? "ಹೌದು, ಇದರಲ್ಲಿದೆ (YES)" : "YES, It is here!"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCardResponse(false)}
              className="py-4 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white font-black text-sm sm:text-base shadow-xl hover:from-rose-700 hover:to-rose-900 transition flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ring-2 ring-rose-400"
            >
              <span className="text-xl">❌</span>
              <span>{isKn ? "ಇಲ್ಲ, ಇದರಲ್ಲಿಲ್ಲ (NO)" : "NO, Not here"}</span>
            </button>
          </div>
        </Card>
      )}

      {/* Reveal Step */}
      {step > totalBits && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-white to-amber-100 p-6 shadow-xl text-center space-y-4 animate-fade-in">
          {isRevealing ? (
            <div className="py-12 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-amber-600 border-t-transparent animate-spin flex items-center justify-center text-4xl shadow-lg">
                🔮
              </div>
              <p className="font-serif text-base font-black text-amber-950 animate-pulse">
                {isKn ? "ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಗ್ರಹಿಸುತ್ತಿದೆ..." : "The Oracle is reading your consciousness..."}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {renderRevealedResult()}

              <div className="pt-4 border-t border-amber-300 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-8 py-3.5 rounded-2xl bg-amber-900 text-amber-50 font-black text-sm shadow-xl hover:bg-black transition flex items-center gap-2 active:scale-95 cursor-pointer ring-2 ring-amber-400"
                >
                  <span className="text-lg">🔄</span>
                  <span>{isKn ? "ಮತ್ತೊಮ್ಮೆ ಆಡಿ (Play Again)" : "Play Again"}</span>
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
