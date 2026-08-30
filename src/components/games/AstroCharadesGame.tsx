import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type AstroCharadesProps = {
  lang?: string;
};

type CardItem = {
  titleKn: string;
  titleEn: string;
  categoryKn: string;
  categoryEn: string;
  hintsKn: string[];
  hintsEn: string[];
  emoji: string;
};

const DECK: CardItem[] = [
  {
    titleKn: "ಮೇಷ ರಾಶಿ (Aries)",
    titleEn: "Aries (Mesha)",
    categoryKn: "ದ್ವಾದಶ ರಾಶಿ",
    categoryEn: "Zodiac Sign",
    hintsKn: ["ಅಗ್ನಿ ತತ್ತ್ವ", "ಮಂಗಳ ಗ್ರಹದ ಅಧಿಪತ್ಯ", "ಕುರಿ (Ram) ಚಿಹ್ನೆ"],
    hintsEn: ["Fire Element", "Ruled by Mars", "Ram Symbol"],
    emoji: "♈"
  },
  {
    titleKn: "ಅಶ್ವಿನೀ ನಕ್ಷತ್ರ (Ashwini)",
    titleEn: "Ashwini Nakshatra",
    categoryKn: "೨೭ ನಕ್ಷತ್ರಗಳು",
    categoryEn: "27 Nakshatras",
    hintsKn: ["ಮೊದಲ ನಕ್ಷತ್ರ", "ಕುದುರೆ (Horse) ಚಿಹ್ನೆ", "ವೈದ್ಯಕೀಯ ದೇವತೆಗಳು"],
    hintsEn: ["First Nakshatra", "Horse Symbol", "Physicians of Gods"],
    emoji: "🐎"
  },
  {
    titleKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ",
    titleEn: "Sri Gokarna Mahabaleshwara",
    categoryKn: "ಪವಿತ್ರ ಕ್ಷೇತ್ರ & ದೇವತೆ",
    categoryEn: "Sacred Kshetra & Deity",
    hintsKn: ["ಆತ್ಮಲಿಂಗ", "ರಾವಣನ ಪೌರಾಣಿಕ ಕಥೆ", "ಉತ್ತರ ಕನ್ನಡ ಕರಾವಳಿ"],
    hintsEn: ["Atmalinga", "Legend of Ravana & Ganesha", "Arabian Sea Coast"],
    emoji: "🔱"
  },
  {
    titleKn: "ರವಿ ದೇವ (Ravi)",
    titleEn: "Lord Ravi (Sun)",
    categoryKn: "ನವಗ್ರಹ",
    categoryEn: "Navagraha",
    hintsKn: ["ಗ್ರಹಗಳ ರಾಜ", "ಸಿಂಹ ರಾಶಿಯ ಅಧಿಪತಿ", "ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ"],
    hintsEn: ["King of Planets", "Lord of Leo", "Aditya Hridaya Stotra"],
    emoji: "☀️"
  },
  {
    titleKn: "ಗಜಕೇಸರಿ ಯೋಗ (Gaja Kesari)",
    titleEn: "Gaja Kesari Yoga",
    categoryKn: "ರಾಜಯೋಗ",
    categoryEn: "Vedic Raja Yoga",
    hintsKn: ["ಗುರು ಮತ್ತು ಚಂದ್ರನ ಸಂಯೋಗ/ಕೇಂದ್ರ", "ಆನೆ ಮತ್ತು ಸಿಂಹದ ಶಕ್ತಿ", "ಅಪಾರ ಕೀರ್ತಿ & ಸಂಪತ್ತು"],
    hintsEn: ["Jupiter & Moon Kendra", "Elephant & Lion Power", "Fame & Prosperity"],
    emoji: "🐘"
  },
  {
    titleKn: "ಶ್ರೀ ಸರಸ್ವತೀ ದೇವಿ",
    titleEn: "Goddess Saraswati",
    categoryKn: "ವಿದ್ಯಾ ದೇವತೆ",
    categoryEn: "Divine Goddess",
    hintsKn: ["ವೀಣೆ & ಪುಸ್ತಕ", "ಬಿಳಿಯ ಹಂಸ ವಾಹನ", "ಜ್ಞಾನ ಹಾಗೂ ಸಂಗೀತದ ಅಧಿದೇವತೆ"],
    hintsEn: ["Veena & Sacred Book", "White Swan", "Goddess of Music & Wisdom"],
    emoji: "🪕"
  },
  {
    titleKn: "ಶನಿ ಸಾಡೇ ಸಾತಿ (Sade Sati)",
    titleEn: "Shani Sade Sati",
    categoryKn: "ಗ್ರಹ ಗೋಚಾರ",
    categoryEn: "Planetary Transit",
    hintsKn: ["೭.೫ ವರ್ಷಗಳ ಶನಿ ದೃಷ್ಟಿ", "ಚಂದ್ರ ರಾಶಿಯ ೧೨, ೧, ೨ನೇ ಮನೆ", "ಶಿಸ್ತು & ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆ"],
    hintsEn: ["7.5 Year Saturn Transit", "12th, 1st, 2nd from Moon", "Lessons in Patience"],
    emoji: "🪐"
  },
  {
    titleKn: "ಕುಂಭ ರಾಶಿ (Aquarius)",
    titleEn: "Aquarius (Kumbha)",
    categoryKn: "ದ್ವಾದಶ ರಾಶಿ",
    categoryEn: "Zodiac Sign",
    hintsKn: ["ವಾಯು ತತ್ತ್ವ", "ಕುಂಭ (ಕಲಶ) ಹೊತ್ತ ಮಾನವ", "ಶನಿ ಗ್ರಹದ ಆಧಿಪತ್ಯ"],
    hintsEn: ["Air Element", "Water Bearer", "Ruled by Saturn"],
    emoji: "♒"
  }
];

export const AstroCharadesGame: React.FC<AstroCharadesProps> = ({ lang = "kn" }) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<string[]>([
    "Player 1",
    "Player 2",
    "Player 3",
    "Player 4"
  ]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [listeningPlayerIdx, setListeningPlayerIdx] = useState<number | null>(null);

  const [currentGuesserIndex, setCurrentGuesserIndex] = useState<number>(0);
  const [deckIndex, setDeckIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Sync players list when playerCount changes
  useEffect(() => {
    setPlayers((prev) => {
      return Array.from({ length: playerCount }, (_, i) => {
        const defaultName = isKn ? `ಆಟಗಾರ ${i + 1}` : `Player ${i + 1}`;
        return prev[i] || defaultName;
      });
    });
  }, [playerCount, isKn]);

  const handleUpdatePlayerName = (idx: number, newName: string) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const oldName = updated[idx];
      updated[idx] = newName;
      setScores((s) => {
        const newScores = { ...s };
        if (oldName && newScores[oldName] !== undefined) {
          newScores[newName] = newScores[oldName];
          if (oldName !== newName) delete newScores[oldName];
        }
        return newScores;
      });
      return updated;
    });
  };

  const handleMicForPlayer = (idx: number) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        isKn
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ (Chrome/Safari ಬಳಸಿ)."
          : "Speech recognition is not supported in this browser."
      );
      return;
    }

    try {
      if (listeningPlayerIdx === idx) {
        setListeningPlayerIdx(null);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = isKn ? "kn-IN" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setListeningPlayerIdx(idx);

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0]?.transcript || "";
        if (speechResult.trim()) {
          handleUpdatePlayerName(idx, speechResult.trim());
        }
        setListeningPlayerIdx(null);
      };

      recognition.onerror = () => {
        setListeningPlayerIdx(null);
      };

      recognition.onend = () => {
        setListeningPlayerIdx(null);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setListeningPlayerIdx(null);
    }
  };

  const handleStartGame = () => {
    const initialScores: Record<string, number> = {};
    players.forEach((p) => {
      initialScores[p] = 0;
    });
    setScores(initialScores);
    setCurrentGuesserIndex(0);
    setDeckIndex(0);
    setTimeLeft(45);
    setIsActive(false);
    setShowHints(false);
    setIsGameOver(false);
    setIsGameStarted(true);
    gameAudio.playSuccess();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            gameAudio.playBuzzer();
            return 0;
          }
          if (prev <= 6) {
            gameAudio.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const handleStartRound = () => {
    setTimeLeft(45);
    setIsActive(true);
    setShowHints(false);
    gameAudio.playChime();
  };

  const handleCorrectGuess = () => {
    const p = players[currentGuesserIndex];
    setScores((prev) => ({ ...prev, [p]: (prev[p] || 0) + 10 }));
    gameAudio.playSuccess();

    if (deckIndex + 1 < DECK.length) {
      setDeckIndex(deckIndex + 1);
      setShowHints(false);
    } else {
      setIsActive(false);
      setIsGameOver(true);
    }
  };

  const handlePass = () => {
    gameAudio.playTick();
    if (deckIndex + 1 < DECK.length) {
      setDeckIndex(deckIndex + 1);
      setShowHints(false);
    } else {
      setIsActive(false);
      setIsGameOver(true);
    }
  };

  const handleNextPlayerTurn = () => {
    setCurrentGuesserIndex((currentGuesserIndex + 1) % players.length);
    setTimeLeft(45);
    setIsActive(false);
    setShowHints(false);
  };

  const currentCard = DECK[deckIndex % DECK.length];
  const currentGuesser = players[currentGuesserIndex];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl select-none">🌟</span>
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
                ॥ ರಾಶಿ ನಕ್ಷತ್ರ ರಹಸ್ಯ · ೨ ರಿಂದ ೮ ಆಟಗಾರರ ಪಾರ್ಟಿ ಗೇಮ್ (Astro Charades) ॥
              </div>
              <h3 className="font-serif text-base font-bold text-amber-950">
                {isKn ? "ರಾಶಿ ನಕ್ಷತ್ರ ರಹಸ್ಯ & 'ನಾನು ಯಾರು?' ಊಹೆಯ ಆಟ" : "Astro Charades & Mystery Clues"}
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                {isKn
                  ? "ಒಬ್ಬ ಆಟಗಾರ ಊಹಿಸಬೇಕು, ಉಳಿದವರು ಜ್ಯೋತಿಷ್ಯ ಸುಳಿವುಗಳನ್ನು ನೀಡಬೇಕು! ೪೫ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಅಂಕ ಗಳಿಸಿ ವಿಜಯಿಯಾಗಿ."
                  : "One player guesses while others give astrological clues before the 45-second timer runs out!"}
              </p>
            </div>
          </div>

          {isGameStarted && (
            <button
              type="button"
              onClick={() => {
                setIsActive(false);
                setIsGameStarted(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 shrink-0 cursor-pointer"
            >
              🔄 {isKn ? "ಹೊಸ ಆಟ" : "Reset"}
            </button>
          )}
        </div>
      </Card>

      {/* Pre-Game Setup: Player Count & Editable Names */}
      {!isGameStarted ? (
        <Card className="border-2 border-amber-400 bg-white p-5 shadow-lg space-y-4 max-w-xl mx-auto">
          <div className="text-center space-y-1">
            <h4 className="font-serif text-base sm:text-lg font-black text-amber-950">
              👥 {isKn ? "ಆಟಗಾರರ ಸಂಖ್ಯೆಯನ್ನು ಆರಿಸಿ (೨ ರಿಂದ ೮)" : "Select Number of Players (2 to 8)"}
            </h4>
            <p className="text-xs text-amber-900 font-medium">
              {isKn
                ? "ಪ್ರತಿಯೊಬ್ಬ ಆಟಗಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ."
                : "Enter player names or use the microphone to speak each name."}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setPlayerCount(num);
                  gameAudio.playTick();
                }}
                className={`w-11 h-11 rounded-2xl font-black text-sm transition shadow-xs flex items-center justify-center cursor-pointer ${
                  playerCount === num
                    ? "bg-amber-900 text-amber-50 border-2 border-amber-950 scale-110 shadow-md"
                    : "bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Editable Name List */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
              <span>{isKn ? "ಆಟಗಾರರ ಹೆಸರುಗಳನ್ನು ನಮೂದಿಸಿ / ಧ್ವನಿ ಬಳಸಿ:" : "Edit Player Names / Use Microphone:"}</span>
              <span className="text-[11px] text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                {playerCount} {isKn ? "ಆಟಗಾರರು" : "Players"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
              {players.map((p, i) => (
                <div key={i} className="p-3 rounded-2xl bg-amber-50/90 border-2 border-amber-200 flex items-center gap-3 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-200/80 border border-amber-400 flex items-center justify-center text-lg shrink-0 shadow-2xs font-extrabold text-amber-950">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-amber-900 font-extrabold mb-1">
                      <span>{isKn ? `ಆಟಗಾರ ${i + 1}` : `Player ${i + 1}`}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={p}
                        onChange={(e) => handleUpdatePlayerName(i, e.target.value)}
                        placeholder={isKn ? `ಆಟಗಾರ ${i + 1} ಹೆಸರು` : `Player ${i + 1} Name`}
                        className="w-full h-8 px-2.5 text-xs font-bold text-slate-900 bg-white rounded-xl border border-amber-300 focus:border-amber-600 focus:outline-none transition shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleMicForPlayer(i)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs transition border cursor-pointer ${
                          listeningPlayerIdx === i
                            ? "bg-rose-600 text-white animate-pulse border-rose-700 shadow-md"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs"
                        }`}
                        title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೆಸರನ್ನು ಹೇಳಿ (Mic)" : "Dictate name via Mic"}
                      >
                        {listeningPlayerIdx === i ? "🔴" : "🎙️"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-amber-50 font-black text-sm shadow-lg hover:from-amber-700 hover:to-black transition active:scale-98 cursor-pointer"
          >
            🚀 {isKn ? "ಅಸ್ಟ್ರೋ ಶರೇಡ್ಸ್ ಪ್ರಾರಂಭಿಸಿ!" : "Start Astro Charades!"}
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Active Game Card */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-2 border-amber-400 bg-white p-6 shadow-md text-center space-y-5">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  {isKn ? "ಪ್ರಸ್ತುತ ಊಹಿಸುವ ಆಟಗಾರ:" : "Guesser's Turn:"}
                </span>
                <span className="text-sm font-extrabold text-amber-950">
                  👤 {currentGuesser}
                </span>
              </div>

              {/* Countdown Timer Badge */}
              <div className={`px-4 py-1.5 rounded-2xl font-black text-base border flex items-center gap-1.5 shadow-xs ${
                timeLeft <= 10 ? "bg-rose-100 border-rose-300 text-rose-700 animate-pulse" : "bg-amber-100 border-amber-300 text-amber-950"
              }`}>
                <span>⏳</span>
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Mystery Word / Card Display */}
            {!isActive ? (
              <div className="py-10 space-y-3">
                <span className="text-5xl block">🎭</span>
                <h4 className="font-serif text-base font-bold text-amber-950">
                  {isKn ? `${currentGuesser}, ನಿಮ್ಮ ಸುತ್ತು ಪ್ರಾರಂಭಿಸಲು ಸಿದ್ಧರಾಗಿ!` : `Ready for ${currentGuesser}'s turn?`}
                </h4>
                <p className="text-xs text-amber-900/80">
                  {isKn ? "ಫೋನ್ ಹಿಡಿದುಕೊಳ್ಳಿ, ಉಳಿದವರು ಸುಳಿವು ನೀಡಲು ಪ್ರಾರಂಭಿಸುತ್ತಾರೆ." : "Hold the device up and let your friends give clues!"}
                </p>
                <button
                  type="button"
                  onClick={handleStartRound}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 font-extrabold text-sm shadow-md hover:scale-105 transition"
                >
                  🚀 {isKn ? "ಸುತ್ತು ಪ್ರಾರಂಭಿಸಿ (START)" : "Start 45s Round"}
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-4 animate-fade-in">
                <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 py-1 px-3 rounded-full border border-amber-300">
                  {isKn ? currentCard.categoryKn : currentCard.categoryEn}
                </span>

                <div className="space-y-1">
                  <div className="text-5xl">{currentCard.emoji}</div>
                  <h3 className="text-2xl font-black text-amber-950 tracking-wide">
                    {isKn ? currentCard.titleKn : currentCard.titleEn}
                  </h3>
                </div>

                {/* Optional Clues / Hints */}
                {showHints ? (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-bold text-amber-900 space-y-1">
                    <span className="block text-[10px] text-amber-800 uppercase">💡 ಸುಳಿವುಗಳು (Clues):</span>
                    {(isKn ? currentCard.hintsKn : currentCard.hintsEn).map((h, idx) => (
                      <div key={idx}>• {h}</div>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowHints(true)}
                    className="text-xs text-amber-800 font-bold underline hover:text-amber-950"
                  >
                    💡 {isKn ? "ಸುಳಿವು ತೋರಿಸಿ (Show Hints)" : "Show Hints"}
                  </button>
                )}

                {/* Game Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCorrectGuess}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-extrabold text-xs shadow-md hover:from-emerald-700 hover:to-emerald-800 transition flex items-center justify-center gap-2"
                  >
                    <span>✅</span>
                    <span>{isKn ? "ಸರಿ ಉತ್ತರ (+೧೦ ಅಂಕ)" : "Correct (+10 pts)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePass}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-extrabold text-xs shadow-md hover:from-amber-700 hover:to-amber-800 transition flex items-center justify-center gap-2"
                  >
                    <span>⏭️</span>
                    <span>{isKn ? "ಮುಂದಕ್ಕೆ (Pass / Skip)" : "Pass / Next"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Turn Switch button */}
            {!isActive && (
              <div className="pt-2 border-t border-amber-100 flex justify-center">
                <button
                  type="button"
                  onClick={handleNextPlayerTurn}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>{isKn ? "ಮುಂದಿನ ಆಟಗಾರನಿಗೆ ಪಾಸ್ ಮಾಡಿ" : "Switch to Next Player"}</span>
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Live Scoreboard */}
        <div>
          <Card className="border border-amber-300 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-serif text-xs font-bold text-amber-950 border-b border-amber-200 pb-1 flex items-center justify-between">
              <span>🏆 {isKn ? "ಅಂಕಪಟ್ಟಿ (Scoreboard)" : "Live Scoreboard"}</span>
              <span className="text-[10px] text-amber-800 font-bold">Round 1</span>
            </h4>

            <div className="space-y-2">
              {players.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    idx === currentGuesserIndex
                      ? "bg-amber-100 border border-amber-400"
                      : "bg-amber-50/50 border border-amber-100"
                  }`}
                >
                  <span className="text-amber-950">👤 {p}</span>
                  <span className="text-amber-900 font-extrabold text-sm">{scores[p] || 0} pts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};
