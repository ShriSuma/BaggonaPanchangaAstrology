import React, { useState } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type TriviaProps = {
  lang?: string;
};

type Question = {
  questionKn: string;
  questionEn: string;
  optionsKn: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationKn: string;
  explanationEn: string;
  category: string;
};

const QUESTIONS: Question[] = [
  {
    questionKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ದೇವತೆಯಾದ 'ಆತ್ಮಲಿಂಗ'ವನ್ನು ಲಂಕೆಗೆ ಕೊಂಡೊಯ್ಯಲು ಪ್ರಯತ್ನಿಸಿದವರು ಯಾರು?",
    questionEn: "Who attempted to carry the sacred Atmalinga to Lanka from Mount Kailash?",
    optionsKn: ["ವಿಭೀಷಣ", "ರಾವಣಾಸುರ", "ಕುಂಭಕರ್ಣ", "ಮೇಘನಾದ"],
    optionsEn: ["Vibhishana", "Ravana", "Kumbhakarna", "Meghanada"],
    correctIndex: 1,
    explanationKn: "ರಾವಣನು ತಪಸ್ಸಿನಿಂದ ಆತ್ಮಲಿಂಗವನ್ನು ಪಡೆದನು. ಆದರೆ ಶ್ರೀ ಗಣಪತಿಯ ಯುಕ್ತಿಯಿಂದ ಗೋಕರ್ಣದಲ್ಲೇ ಪ್ರತಿಷ್ಠಾಪಿತವಾಯಿತು.",
    explanationEn: "Ravana obtained the Atmalinga through penance, but Lord Ganesha ensured its eternal installation at Gokarna.",
    category: "Gokarna Kshetra"
  },
  {
    questionKn: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ 'ಜ್ಞಾನ ಕಾರಕ' ಹಾಗೂ 'ಗುರು ಗ್ರಹ' ಎಂದು ಕರೆಯಲ್ಪಡುವ ಗ್ರಹ ಯಾವುದು?",
    questionEn: "Which planet is hailed as the 'Jnana Karaka' (Wisdom Signifier) and Guru?",
    optionsKn: ["ಬುಧ", "ಶುಕ್ರ", "ಬೃಹಸ್ಪತಿ (ಗುರು)", "ಸೂರ್ಯ"],
    optionsEn: ["Budha", "Shukra", "Brihaspati (Jupiter)", "Surya"],
    correctIndex: 2,
    explanationKn: "ಬೃಹಸ್ಪತಿ (ಗುರು) ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ಶಿಕ್ಷಣ ಹಾಗೂ ಸದ್ಬುದ್ಧಿಯ ಕಾರಕ ಗ್ರಹವಾಗಿದ್ದಾನೆ.",
    explanationEn: "Lord Brihaspati (Jupiter) governs supreme intellect, spirituality, and divine wisdom.",
    category: "Navagrahas"
  },
  {
    questionKn: "ಪಂಚಾಂಗದ ಐದು ಅಂಗಗಳಲ್ಲಿ 'ತಿಥಿ'ಯು ಯಾರ ನಡುವಿನ ಕೋನೀಯ ಅಂತರದಿಂದ ನಿರ್ಧಾರವಾಗುತ್ತದೆ?",
    questionEn: "In Panchanga, which two celestial bodies determine the 'Tithi' through their angular distance?",
    optionsKn: ["ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ", "ಮಂಗಳ ಮತ್ತು ಗುರು", "ಚಂದ್ರ ಮತ್ತು ರಾಹು", "ಶನಿ ಮತ್ತು ಸೂರ್ಯ"],
    optionsEn: ["Sun & Moon (12° intervals)", "Mars & Jupiter", "Moon & Rahu", "Saturn & Sun"],
    correctIndex: 0,
    explanationKn: "ಪ್ರತಿ ೧೨ ಡಿಗ್ರಿ ಸೂರ್ಯ-ಚಂದ್ರರ ಅಂತರವು ಒಂದು ತಿಥಿಯನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ.",
    explanationEn: "Each 12-degree longitudinal separation between Sun and Moon defines one Lunar Tithi.",
    category: "Panchanga"
  },
  {
    questionKn: "೨೭ ನಕ್ಷತ್ರಗಳಲ್ಲಿ ಮೊದಲನೆಯದಾದ 'ಅಶ್ವಿನೀ' ನಕ್ಷತ್ರದ ಮ್ಯಾಸ್ಕಾಟ್ ಪ್ರಾಣಿ ಯಾವುದು?",
    questionEn: "What is the sacred animal mascot of the first Nakshatra, 'Ashwini'?",
    optionsKn: ["ಆನೆ (Elephant)", "ಕುದುರೆ (Horse)", "ಸಿಂಹ (Lion)", "ಹಸು (Cow)"],
    optionsEn: ["Elephant", "Winged Horse", "Lion", "Cow"],
    correctIndex: 1,
    explanationKn: "ಅಶ್ವಿನೀ ನಕ್ಷತ್ರದ ಸಂಕೇತ ಹಾಗೂ ಮ್ಯಾಸ್ಕಾಟ್ ದಿವ್ಯ ಅಶ್ವ (ಕುದುರೆ).",
    explanationEn: "The divine winged horse is the cosmic symbol of Ashwini Nakshatra.",
    category: "Nakshatras"
  },
  {
    questionKn: "ಗಜಕೇಸರಿ ಯೋಗವು ಜಾತಕದಲ್ಲಿ ಯಾವ ಎರಡು ಗ್ರಹಗಳ ಶುಭ ಸಂಯೋಗ ಅಥವಾ ಕೇಂದ್ರ ಸ್ಥಿತಿಯಿಂದ ಉಂಟಾಗುತ್ತದೆ?",
    questionEn: "Gaja Kesari Yoga is formed by the auspicious relationship between which two planets?",
    optionsKn: ["ಗುರು ಮತ್ತು ಚಂದ್ರ", "ಸೂರ್ಯ ಮತ್ತು ಬುಧ", "ಶುಕ್ರ ಮತ್ತು ಮಂಗಳ", "ಶನಿ ಮತ್ತು ರಾಹು"],
    optionsEn: ["Jupiter & Moon", "Sun & Mercury", "Venus & Mars", "Saturn & Rahu"],
    correctIndex: 0,
    explanationKn: "ಚಂದ್ರನಿಂದ ಗುರುವು ೧, ೪, ೭, ೧೦ನೇ (ಕೇಂದ್ರ) ಸ್ಥಾನದಲ್ಲಿದ್ದಾಗ ಪರಮ ಪವಿತ್ರ ಗಜಕೇಸರಿ ಯೋಗ ಉಂಟಾಗುತ್ತದೆ.",
    explanationEn: "When Jupiter is in a Kendra (1, 4, 7, 10) house from the Moon, Gaja Kesari Yoga is formed.",
    category: "Yogas"
  }
];

export const VedicTriviaBlitzGame: React.FC<TriviaProps> = ({ lang = "kn" }) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const [players, setPlayers] = useState<string[]>(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [scores, setScores] = useState<Record<string, number>>({
    "Player 1": 0,
    "Player 2": 0,
    "Player 3": 0,
    "Player 4": 0
  });

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const currQ = QUESTIONS[qIndex % QUESTIONS.length];
  const currPlayer = players[currentPlayerIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === currQ.correctIndex;
    if (isCorrect) {
      gameAudio.playSuccess();
      setScores((prev) => ({ ...prev, [currPlayer]: (prev[currPlayer] || 0) + 20 }));
    } else {
      gameAudio.playBuzzer();
    }
  };

  const handleNextQuestion = () => {
    setSelectedOpt(null);
    setIsAnswered(false);

    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1);
      setCurrentPlayerIdx((currentPlayerIdx + 1) % players.length);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setQIndex(0);
    setCurrentPlayerIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setIsQuizCompleted(false);
    setScores({
      "Player 1": 0,
      "Player 2": 0,
      "Player 3": 0,
      "Player 4": 0
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none">🧠</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ಮಹಾ ಜ್ಯೋತಿಷ್ಯ ರಸಪ್ರಶ್ನೆ · ೨ ರಿಂದ ೮ ಆಟಗಾರರ ರೌಂಡ್ ಕ್ವಿಜ್ (Vedic Trivia) ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಮಹಾ ಜ್ಯೋತಿಷ್ಯ & ಪುರಾಣ ರಸಪ್ರಶ್ನೆ ಬ್ಲಿಟ್ಜ್" : "Grand Vedic Astrology & Kshetra Trivia"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ, ಪಂಚಾಂಗ, ನಕ್ಷತ್ರಗಳು ಹಾಗೂ ಪುರಾಣಗಳ ರೋಚಕ ರಸಪ್ರಶ್ನೆ. ಸರಿಯಾದ ಉತ್ತರಕ್ಕೆ +೨೦ ಅಂಕಗಳು!"
                : "Exciting battle of wits on Gokarna legends, Nakshatras, and Panchanga. +20 points per correct answer!"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Question Card */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-2 border-amber-400 bg-white p-6 shadow-md space-y-4">
            {!isQuizCompleted ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-black text-amber-950 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    👤 {isKn ? `ಪ್ರಶ್ನೆ ಯಾರಿಗೆ: ${currPlayer}` : `Turn: ${currPlayer}`}
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    {isKn ? `ಪ್ರಶ್ನೆ ${qIndex + 1} / ${QUESTIONS.length}` : `Question ${qIndex + 1} of ${QUESTIONS.length}`}
                  </span>
                </div>

                <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                  [{currQ.category}]
                </div>

                <h3 className="font-serif text-base font-bold text-amber-950 leading-relaxed">
                  {isKn ? currQ.questionKn : currQ.questionEn}
                </h3>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(isKn ? currQ.optionsKn : currQ.optionsEn).map((opt, idx) => {
                    const isSelected = selectedOpt === idx;
                    const isCorrect = idx === currQ.correctIndex;

                    let btnStyle = "bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100";
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-950 font-black";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-100 border-rose-500 text-rose-950";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-3.5 rounded-xl border-2 text-xs font-bold text-left transition shadow-2xs flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <span>✅</span>}
                        {isAnswered && isSelected && !isCorrect && <span>❌</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {isAnswered && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs font-medium text-amber-950 space-y-1 animate-fade-in">
                    <strong className="text-amber-900 block font-bold">
                      💡 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ವಿವರಣೆ:" : "Vedic Insight:"}
                    </strong>
                    <p>{isKn ? currQ.explanationKn : currQ.explanationEn}</p>
                  </div>
                )}

                {/* Next Button */}
                {isAnswered && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl bg-amber-800 text-amber-50 font-extrabold text-xs shadow-md hover:bg-amber-900 transition flex items-center gap-2"
                    >
                      <span>{qIndex + 1 < QUESTIONS.length ? (isKn ? "ಮುಂದಿನ ಪ್ರಶ್ನೆ" : "Next Question") : (isKn ? "ಫಲಿತಾಂಶ ನೋಡಿ" : "View Results")}</span>
                      <span>➡️</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <span className="text-5xl">🏆</span>
                <h3 className="font-serif text-lg font-black text-amber-950">
                  {isKn ? "॥ ಮಹಾ ರಸಪ್ರಶ್ನೆ ಪೂರ್ಣಗೊಂಡಿದೆ! ॥" : "Trivia Completed!"}
                </h3>
                <p className="text-xs text-amber-900">
                  {isKn ? "ಎಲ್ಲಾ ಆಟಗಾರರು ಅದ್ಭುತವಾಗಿ ಪಾಲ್ಗೊಂಡಿದ್ದಾರೆ." : "Great battle of Vedic knowledge!"}
                </p>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-8 py-3 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs shadow-md hover:bg-amber-900 transition"
                >
                  🔄 {isKn ? "ಮತ್ತೊಮ್ಮೆ ಆಡಿ (Play Again)" : "Play Again"}
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Live Scores */}
        <div>
          <Card className="border border-amber-300 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-serif text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
              🏆 {isKn ? "ಅಂಕಪಟ್ಟಿ (Scoreboard)" : "Live Scores:"}
            </h4>

            <div className="space-y-2">
              {players.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    idx === currentPlayerIdx && !isQuizCompleted
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
    </div>
  );
};
