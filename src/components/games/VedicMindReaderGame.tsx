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

    if (finalVal <= 0) {
      return (
        <div className="text-center py-6 space-y-2">
          <span className="text-4xl">🤔</span>
          <p className="text-sm font-bold text-amber-950">
            {isKn ? "ನೀವು ಯಾವುದೇ ಸಂಖ್ಯೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ ಅಥವಾ ತಪ್ಪು ಉತ್ತರಿಸಿದ್ದೀರಿ!" : "No number was matched. Try again with focus!"}
          </p>
        </div>
      );
    }

    if (mode === "numbers") {
      return (
        <div className="text-center py-6 space-y-3">
          <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ಸಂಖ್ಯೆ ॥
          </div>
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-4xl font-extrabold text-indigo-950 animate-bounce">
            {finalVal}
          </div>
          <p className="text-sm font-bold text-amber-950">
            {isKn
              ? `ನೀವು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಅಂದುಕೊಂಡ ಸಂಖ್ಯೆ: ${finalVal}!`
              : `The secret number in your mind is: ${finalVal}!`}
          </p>
          <p className="text-xs text-amber-900 font-medium">
            🪔 {isKn ? "ವೈದಿಕ ಸಾಮುದ್ರಿಕ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರದ ದೈವಿಕ ರಹಸ್ಯವು ನಿಮ್ಮ ಚಿತ್ತವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗ್ರಹಿಸಿದೆ!" : "The ancient Vedic Oracle has pierced the veil of thought!"}
          </p>
        </div>
      );
    }

    if (mode === "rashis") {
      const rashi = RASHIS.find((r) => r.id === finalVal) || RASHIS[0];
      return (
        <div className="text-center py-6 space-y-3">
          <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ರಾಶಿ ॥
          </div>
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-4xl font-extrabold text-indigo-950 animate-bounce">
            {rashi.symbol}
          </div>
          <h3 className="text-xl font-extrabold text-amber-950">
            {isKn ? rashi.nameKn : rashi.nameEn}
          </h3>
          <p className="text-xs text-amber-900 font-medium">
            ✨ {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮ್ಮ ಮನದ ರಾಶಿ ಪ್ರಕಟವಾಗಿದೆ!" : "Your secret Zodiac sign has been revealed by the Oracle!"}
          </p>
        </div>
      );
    }

    if (mode === "grahas") {
      const graha = GRAHAS.find((g) => g.id === finalVal) || GRAHAS[0];
      return (
        <div className="text-center py-6 space-y-3">
          <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-widest">
            ॥ ನಿಮ್ಮ ಮನಸ್ಸಿನ ರಹಸ್ಯ ನವಗ್ರಹ ದೇವತೆ ॥
          </div>
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-amber-500 shadow-2xl flex items-center justify-center text-4xl font-extrabold text-indigo-950 animate-bounce">
            {graha.symbol}
          </div>
          <h3 className="text-xl font-extrabold text-amber-950">
            {isKn ? graha.nameKn : graha.nameEn}
          </h3>
          <p className="text-xs text-emerald-900 font-extrabold bg-emerald-100 py-1 px-3 rounded-full inline-block border border-emerald-300">
            🪔 {isKn ? `ಗ್ರಹ ಕೃಪೆ: ${graha.blessing}` : `Divine Blessing: ${graha.blessing}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none filter drop-shadow">🔮</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ಚಿತ್ತ ರಹಸ್ಯ · ಏಕ ವ್ಯಕ್ತಿ ಜ್ಯೋತಿಷ್ಯ ಮೈಂಡ್ ರೀಡರ್ (Solo Mind Reader) ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ವೈದಿಕ ಮೈಂಡ್ ರೀಡರ್ & ಮನೋ ಗ್ರಹಣ ಖೇಲ" : "The 108 Vedic Mind Reader (Solo Oracle)"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಸಂಖ್ಯೆ (೧-೬೩), ರಾಶಿ ಅಥವಾ ನವಗ್ರಹವನ್ನು ರಹಸ್ಯವಾಗಿ ನೆನಪಿಸಿಕೊಳ್ಳಿ. ಪ್ರಾಚೀನ ಸಾಮುದ್ರಿಕ ಯಂತ್ರ ತತ್ತ್ವದ ಮೂಲಕ ಈ ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಚ್ಚರಿಯ ರೀತಿಯಲ್ಲಿ ಓದುತ್ತದೆ!"
                : "Silently think of any number, Zodiac sign, or Navagraha deity. Through sacred Vedic binary matrices, the Oracle will pinpoint your exact thought!"}
            </p>
          </div>
        </div>
      </Card>

      {/* Step 0: Mode Selection */}
      {step === 0 && (
        <Card className="border border-amber-300 bg-white p-6 shadow-sm space-y-4">
          <div className="text-center space-y-1">
            <h4 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ನೀವು ಮನಸ್ಸಿನಲ್ಲಿ ಏನು ನೆನಪಿಸಿಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ?" : "What would you like to think of in secret?"}
            </h4>
            <p className="text-xs text-amber-900/80">
              {isKn ? "ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಆಟವನ್ನು ಪ್ರಾರಂಭಿಸಿ:" : "Select a category and challenge the Oracle:"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleStartGame("numbers")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-md transition text-center space-y-2 group"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🔢</span>
              <strong className="text-sm font-bold text-amber-950 block">
                {isKn ? "ರಹಸ್ಯ ಸಂಖ್ಯೆ (೧ - ೬೩)" : "Secret Number (1 - 63)"}
              </strong>
              <p className="text-[11px] text-amber-900/80">
                {isKn ? "ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ೧ ರಿಂದ ೬೩ ಸಂಖ್ಯೆ ಅಂದುಕೊಳ್ಳಿ" : "Think of any integer between 1 and 63"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleStartGame("rashis")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-md transition text-center space-y-2 group"
            >
              <span className="text-3xl block group-hover:scale-110 transition">♈</span>
              <strong className="text-sm font-bold text-amber-950 block">
                {isKn ? "ದ್ವಾದಶ ರಾಶಿ (೧೨ Rashis)" : "12 Zodiac Signs"}
              </strong>
              <p className="text-[11px] text-amber-900/80">
                {isKn ? "ಮೇಷದಿಂದ ಮೀನದವರೆಗೆ ಯಾವುದಾದರೂ ಒಂದು ರಾಶಿ" : "Think of any 1 of the 12 Zodiac signs"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleStartGame("grahas")}
              className="p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white hover:border-amber-500 hover:shadow-md transition text-center space-y-2 group"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🪐</span>
              <strong className="text-sm font-bold text-amber-950 block">
                {isKn ? "ನವಗ್ರಹ ದೇವತೆಗಳು (9 Grahas)" : "9 Navagrahas"}
              </strong>
              <p className="text-[11px] text-amber-900/80">
                {isKn ? "ಸೂರ್ಯನಿಂದ ಕೇತುವಿನವರೆಗೆ ಯಾವುದಾದರೂ ಗ್ರಹ" : "Think of any of the 9 Celestial Planets"}
              </p>
            </button>
          </div>
        </Card>
      )}

      {/* Step 1..N: Card Gates */}
      {step >= 1 && step <= totalBits && (
        <Card className="border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <span className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>🪔</span>
              <span>
                {isKn ? `ಯಂತ್ರ ದ್ವಾರ ${cardIndex + 1} / ${totalBits}` : `Mystic Gate ${cardIndex + 1} of ${totalBits}`}
              </span>
            </span>
            <span className="text-[11px] bg-amber-200 text-amber-900 font-extrabold px-3 py-0.5 rounded-full">
              {isKn ? "ಧ್ಯಾನಸ್ಥರಾಗಿ ಗಮನಿಸಿ" : "Observe Carefully"}
            </span>
          </div>

          <div className="text-center">
            <h4 className="text-sm font-extrabold text-amber-950">
              {isKn
                ? "ನೀವು ಮನಸ್ಸಿನಲ್ಲಿ ಅಂದುಕೊಂಡ ವಿಷಯ ಈ ಕೆಳಗಿನ ಪಟ್ಟಿಯಲ್ಲಿದೆಯೇ?"
                : "Is your secret thought present in this sacred grid?"}
            </h4>
          </div>

          {/* Grid of items in this card */}
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 text-center">
              {cards[cardIndex]?.map((val) => {
                let display = String(val);
                if (mode === "rashis") {
                  const r = RASHIS.find((x) => x.id === val);
                  display = r ? `${r.symbol} ${r.nameKn.split(" ")[0]}` : String(val);
                } else if (mode === "grahas") {
                  const g = GRAHAS.find((x) => x.id === val);
                  display = g ? `${g.symbol} ${g.nameKn.split(" ")[0]}` : String(val);
                }

                return (
                  <div
                    key={val}
                    className="p-2 rounded-xl bg-white border border-amber-200 shadow-2xs font-extrabold text-xs text-amber-950"
                  >
                    {display}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleCardResponse(true)}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-xs shadow-md hover:from-emerald-700 hover:to-emerald-800 transition flex items-center justify-center gap-2"
            >
              <span>✅</span>
              <span>{isKn ? "ಹೌದು, ಇದರಲ್ಲಿದೆ (YES)" : "Yes, it is here!"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCardResponse(false)}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-extrabold text-xs shadow-md hover:from-rose-700 hover:to-rose-800 transition flex items-center justify-center gap-2"
            >
              <span>❌</span>
              <span>{isKn ? "ಇಲ್ಲ, ಇದರಲ್ಲಿಲ್ಲ (NO)" : "No, not here"}</span>
            </button>
          </div>
        </Card>
      )}

      {/* Reveal Step */}
      {step > totalBits && (
        <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-white to-amber-100 p-6 shadow-lg text-center space-y-4 animate-fade-in">
          {isRevealing ? (
            <div className="py-12 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-600 border-t-transparent animate-spin flex items-center justify-center text-3xl">
                🔮
              </div>
              <p className="font-serif text-sm font-extrabold text-amber-950 animate-pulse">
                {isKn ? "ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಗ್ರಹಿಸುತ್ತಿದೆ..." : "The Oracle is reading your consciousness..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {renderRevealedResult()}

              <div className="pt-4 border-t border-amber-200 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-6 py-2.5 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs shadow-md hover:bg-amber-900 transition flex items-center gap-2"
                >
                  <span>🔄</span>
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
