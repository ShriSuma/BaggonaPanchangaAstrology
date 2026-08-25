import React, { useState } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type Player = {
  id: number;
  name: string;
  avatar: string;
  color: string;
  position: number;
  score: number;
};

export type NavagrahaBoardProps = {
  lang?: string;
  initialPlayers?: Player[];
};

const DEFAULT_AVATARS = [
  { symbol: "☀️", name: "Surya", color: "bg-amber-500" },
  { symbol: "🌙", name: "Chandra", color: "bg-slate-300" },
  { symbol: "🔥", name: "Kuja", color: "bg-rose-500" },
  { symbol: "💎", name: "Budha", color: "bg-emerald-500" },
  { symbol: "🌟", name: "Guru", color: "bg-yellow-400" },
  { symbol: "💖", name: "Shukra", color: "bg-pink-400" },
  { symbol: "🪐", name: "Shani", color: "bg-indigo-600" },
  { symbol: "🌪️", name: "Rahu", color: "bg-purple-600" }
];

const LADDERS: Record<number, { to: number; nameKn: string; nameEn: string }> = {
  5: { to: 14, nameKn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದರ್ಶನ ಪುಣ್ಯ (+9)", nameEn: "Gokarna Kshetra Pilgrimage (+9)" },
  18: { to: 37, nameKn: "ಶ್ರೀ ಸರಸ್ವತೀ ಯೋಗ & ವಿದ್ಯಾ ಬಲ (+19)", nameEn: "Saraswati Yoga Wisdom (+19)" },
  28: { to: 52, nameKn: "ಗಜ ಕೇಸರಿ ಮಹಾ ರಾಜಯೋಗ (+24)", nameEn: "Gaja Kesari Royal Fortune (+24)" },
  43: { to: 61, nameKn: "ಮಹಾ ಶಿವರಾತ್ರಿ ಉಪವಾಸ ಜಾಗರಣೆ (+18)", nameEn: "Maha Shivaratri Enlightenment (+18)" }
};

const SNAKES: Record<number, { to: number; nameKn: string; nameEn: string }> = {
  22: { to: 7, nameKn: "ರಾಹು ಗ್ರಹಣ ದೋಷ (-15)", nameEn: "Rahu Solar Eclipse Delay (-15)" },
  44: { to: 25, nameKn: "ಶನಿ ಸಾಡೇ ಸಾತಿ ಪರೀಕ್ಷೆ (-19)", nameEn: "Shani Sade Sati Trial (-19)" },
  58: { to: 33, nameKn: "ಕುಜ ದೋಷಾಗ್ನಿ ತಾಪ (-25)", nameEn: "Angaraka Kuja Obstacle (-25)" },
  62: { to: 19, nameKn: "ಕೇತು ಮಾಯಾ ಭ್ರಮೆ (-43)", nameEn: "Ketu Maya Illusion Fall (-43)" }
};

const SPECIAL_TASKS: Record<number, { taskKn: string; taskEn: string }> = {
  10: { taskKn: "ಗಾಯತ್ರೀ ಮಂತ್ರ ಅಥವಾ ಸರಸ್ವತೀ ಶ್ಲೋಕ ಪಠಿಸಿ!", taskEn: "Recite the Gayatri Mantra or a Saraswati Shloka!" },
  20: { taskKn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಅಥವಾ ರಾಶಿಯನ್ನು ಎಲ್ಲರಿಗೂ ಹೇಳಿ!", taskEn: "Share your birth star or zodiac sign with everyone!" },
  30: { taskKn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಒಂದು ಪೌರಾಣಿಕ ಕಥೆ ಹೇಳಿ!", taskEn: "Share a legendary fact about Gokarna Kshetra!" },
  40: { taskKn: "ನಿಮ್ಮ ನೆಚ್ಚಿನ ಜ್ಯೋತಿಷ್ಯ ಗ್ರಹದ ಹೆಸರು ಹೇಳಿ!", taskEn: "Name your favorite celestial planet and its color!" },
  50: { taskKn: "ಮುಂದಿನ ಆಟಗಾರನಿಗೆ ಶುಭ ಹಾರೈಕೆ ನೀಡಿ!", taskEn: "Offer a joyful Vedic blessing to the next player!" }
};

export const NavagrahaBoardGame: React.FC<NavagrahaBoardProps> = ({
  lang = "kn",
  initialPlayers
}) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const [playerCount, setPlayerCount] = useState<number>(4);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers || [
      { id: 1, name: "Player 1", avatar: "☀️", color: "bg-amber-500", position: 1, score: 0 },
      { id: 2, name: "Player 2", avatar: "🌙", color: "bg-sky-400", position: 1, score: 0 },
      { id: 3, name: "Player 3", avatar: "🔥", color: "bg-rose-500", position: 1, score: 0 },
      { id: 4, name: "Player 4", avatar: "💎", color: "bg-emerald-500", position: 1, score: 0 }
    ]
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>(
    isKn ? "ಆಟ ಪ್ರಾರಂಭಿಸಲು ಡೈಸ್ ರೋಲ್ ಮಾಡಿ!" : "Roll the golden cosmic dice to begin!"
  );
  const [winner, setWinner] = useState<Player | null>(null);
  const [activeSpecialTask, setActiveSpecialTask] = useState<string | null>(null);

  const handleStartGame = (count: number) => {
    setPlayerCount(count);
    const newPlayers: Player[] = [];
    for (let i = 0; i < count; i++) {
      const av = DEFAULT_AVATARS[i % DEFAULT_AVATARS.length];
      newPlayers.push({
        id: i + 1,
        name: `Player ${i + 1}`,
        avatar: av.symbol,
        color: av.color,
        position: 1,
        score: 0
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setWinner(null);
    setIsGameStarted(true);
    setLogMessage(isKn ? "ಖೇಲ ಪ್ರಾರಂಭವಾಗಿದೆ! ೧ನೇ ಆಟಗಾರನ ಸರದಿ." : "The Cosmic Game has begun! Player 1's turn.");
    gameAudio.playChime();
  };

  const handleRollDice = () => {
    if (isRolling || winner) return;

    setIsRolling(true);
    gameAudio.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        processMove(finalRoll);
      }
    }, 60);
  };

  const processMove = (roll: number) => {
    const p = players[currentPlayerIndex];
    let newPos = p.position + roll;

    if (newPos >= 64) {
      newPos = 64;
      p.position = 64;
      setWinner(p);
      setLogMessage(isKn ? `🏆 ${p.name} (${p.avatar}) ಮೋಕ್ಷ ಸ್ಥಾನ (೬೪) ತಲುಪಿ ಜಯಶಾಲಿಗಳಾಗಿದ್ದಾರೆ!` : `🏆 ${p.name} reached Moksha (64) and won the Cosmic Game!`);
      gameAudio.playSuccess();
      return;
    }

    let extraMsg = "";

    // Check Ladder
    if (LADDERS[newPos]) {
      const l = LADDERS[newPos];
      newPos = l.to;
      extraMsg = isKn ? ` 🌟 ಪುಣ್ಯ ಮೆಟ್ಟಿಲು: ${l.nameKn}!` : ` 🌟 Punya Ladder: ${l.nameEn}!`;
      gameAudio.playSuccess();
    }
    // Check Snake
    else if (SNAKES[newPos]) {
      const s = SNAKES[newPos];
      newPos = s.to;
      extraMsg = isKn ? ` 🐍 ಕರ್ಮ ಸರ್ಪ: ${s.nameKn}!` : ` 🐍 Karma Snake: ${s.nameEn}!`;
      gameAudio.playBuzzer();
    }
    // Check Task
    else if (SPECIAL_TASKS[newPos]) {
      const t = SPECIAL_TASKS[newPos];
      setActiveSpecialTask(isKn ? t.taskKn : t.taskEn);
      extraMsg = isKn ? " 📜 ಕರ್ಮ ಟಾಸ್ಕ್ ಸ್ವೀಕರಿಸಿ!" : " 📜 Special Karma Task!";
      gameAudio.playChime();
    }

    const updated = [...players];
    updated[currentPlayerIndex] = { ...p, position: newPos };
    setPlayers(updated);

    setLogMessage(
      isKn
        ? `${p.name} ${roll} ರೋಲ್ ಮಾಡಿ, ${newPos}ನೇ ಮನೆಗೆ ತಲುಪಿದರು.${extraMsg}`
        : `${p.name} rolled ${roll} and moved to square ${newPos}.${extraMsg}`
    );

    // Next player turn (unless rolled 6)
    if (roll !== 6) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    } else {
      setLogMessage((prev) => prev + (isKn ? " (೬ ಬಂದಿದ್ದರಿಂದ ಮತ್ತೊಮ್ಮೆ ರೋಲ್ ಮಾಡಿ!)" : " (Rolled 6! Bonus turn!)"));
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl select-none">🎲</span>
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
                ॥ ನವಗ್ರಹ ಪರಮಪದ · ೨ ರಿಂದ ೮ ಆಟಗಾರರ ವೈದಿಕ ಬೋರ್ಡ್ ಗೇಮ್ (2-8 Players) ॥
              </div>
              <h3 className="font-serif text-base font-bold text-amber-950">
                {isKn ? "ನವಗ್ರಹ ಪರಮಪದ & ಕರ್ಮ ಮೆಟ್ಟಿಲುಗಳ ಆಟ" : "Cosmic Navagraha Roller & Karmic Ladders"}
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                {isKn
                  ? "ಕುಟುಂಬ & ಮಿತ್ರರೊಂದಿಗೆ ಪ್ರಯಾಣದಲ್ಲಿ ಆಡಬಹುದಾದ ಆಕರ್ಷಕ ಪರಮಪದ ಆಟ. ಪುಣ್ಯ ಮೆಟ್ಟಿಲುಗಳಿಂದ ಮೋಕ್ಷ ಸ್ಥಾನ (೬೪) ತಲುಪಿ ವಿಜಯಿಯಾಗಿ!"
                  : "Authentic Vedic Snakes & Ladders for 2 to 8 players. Climb Punya ladders, overcome Rahu-Shani obstacles, and reach Moksha!"}
              </p>
            </div>
          </div>

          {isGameStarted && (
            <button
              type="button"
              onClick={() => setIsGameStarted(false)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-amber-900 font-bold text-xs hover:bg-amber-50"
            >
              🔄 {isKn ? "ಹೊಸ ಆಟ" : "Reset"}
            </button>
          )}
        </div>
      </Card>

      {/* Setup Step: Player Count Selection (2 to 8) */}
      {!isGameStarted ? (
        <Card className="border border-amber-300 bg-white p-6 shadow-sm space-y-4 text-center">
          <h4 className="font-serif text-base font-bold text-amber-950">
            {isKn ? "ಎಷ್ಟು ಜನ ಆಟಗಾರರು ಆಡಲು ಬಯಸುತ್ತೀರಿ? (Select 2 to 8 Players)" : "Select Number of Players (2 to 8):"}
          </h4>

          <div className="flex flex-wrap justify-center gap-2">
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleStartGame(num)}
                className={`w-12 h-12 rounded-2xl font-extrabold text-base transition shadow-sm flex items-center justify-center ${
                  playerCount === num
                    ? "bg-amber-800 text-amber-50 border-2 border-amber-900 scale-105"
                    : "bg-amber-50 text-amber-950 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="pt-2 text-xs text-amber-900/80">
            {isKn ? "ಪ್ರತಿ ಆಟಗಾರನಿಗೂ ನವಗ್ರಹ ದೇವತೆಯ ಚಿಹ್ನೆ & ಬಣ್ಣ ನಿಗದಿಪಡಿಸಲಾಗುತ್ತದೆ." : "Each player receives a unique Navagraha avatar token."}
          </div>
        </Card>
      ) : (
        /* Active Game Arena */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: 8x8 Board Grid (Squares 1 to 64) */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/50 p-3 shadow-md">
              <div className="grid grid-cols-8 gap-1.5 text-center">
                {Array.from({ length: 64 }, (_, i) => 64 - i).map((sq) => {
                  const isLadderStart = Boolean(LADDERS[sq]);
                  const isSnakeHead = Boolean(SNAKES[sq]);
                  const isMoksha = sq === 64;
                  const isStart = sq === 1;

                  // Find players currently on this square
                  const occupyingPlayers = players.filter((p) => p.position === sq);

                  return (
                    <div
                      key={sq}
                      className={`relative aspect-square rounded-xl border flex flex-col justify-between p-1 text-[10px] font-extrabold transition shadow-2xs ${
                        isMoksha
                          ? "bg-gradient-to-br from-yellow-300 to-amber-500 border-amber-600 text-amber-950 font-black shadow-md ring-2 ring-amber-400 animate-pulse"
                          : isLadderStart
                          ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                          : isSnakeHead
                          ? "bg-rose-100 border-rose-400 text-rose-950"
                          : sq % 2 === 0
                          ? "bg-white border-amber-200 text-amber-900"
                          : "bg-amber-50/70 border-amber-200 text-amber-950"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] opacity-75">
                        <span>{sq}</span>
                        {isLadderStart && <span>🪜</span>}
                        {isSnakeHead && <span>🐍</span>}
                        {isMoksha && <span>🕉️</span>}
                        {isStart && <span>🚩</span>}
                      </div>

                      {/* Tokens on this square */}
                      <div className="flex flex-wrap gap-0.5 justify-center items-center my-auto">
                        {occupyingPlayers.map((op) => (
                          <span
                            key={op.id}
                            title={op.name}
                            className="text-xs bg-white/90 rounded-full px-0.5 border border-amber-400 shadow-2xs scale-110"
                          >
                            {op.avatar}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Status Log Bar */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2">
              <span>📢</span>
              <span>{logMessage}</span>
            </div>
          </div>

          {/* Right: Controls & Player Standings */}
          <div className="space-y-4">
            {/* Dice Roll Control Card */}
            <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-100 via-white to-amber-50 p-5 shadow-md text-center space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-extrabold text-amber-900 uppercase">
                  {isKn ? "ಪ್ರಸ್ತುತ ಆಟಗಾರ:" : "Current Player:"}
                </span>
                <span className="text-xs font-black text-amber-950 bg-amber-200 px-2.5 py-0.5 rounded-full">
                  {currentPlayer?.name} ({currentPlayer?.avatar})
                </span>
              </div>

              {/* 3D Dice Graphic */}
              <div className="py-2">
                <div
                  className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-200 border-4 border-amber-600 shadow-xl flex items-center justify-center text-4xl font-black text-indigo-950 transition-transform ${
                    isRolling ? "animate-spin scale-90" : "scale-100 hover:scale-105"
                  }`}
                >
                  {diceValue}
                </div>
              </div>

              <button
                type="button"
                disabled={isRolling || Boolean(winner)}
                onClick={handleRollDice}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 ${
                  isRolling || winner
                    ? "bg-amber-300 text-amber-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-amber-50 hover:scale-[1.02] shadow-amber-900/20"
                }`}
              >
                <span>🎲</span>
                <span>{isRolling ? (isKn ? "ತಿರುಗುತ್ತಿದೆ..." : "Rolling...") : isKn ? "ಡೈಸ್ ರೋಲ್ ಮಾಡಿ (ROLL)" : "Roll Dice"}</span>
              </button>
            </Card>

            {/* Players Position Scoreboard */}
            <Card className="border border-amber-300 bg-white p-4 shadow-sm space-y-2">
              <h4 className="font-serif text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                🏆 {isKn ? "ಆಟಗಾರರ ಸ್ಥಾನಗಳು (Live Scoreboard)" : "Player Standings:"}
              </h4>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {players.map((p, idx) => {
                  const isCurrent = idx === currentPlayerIndex;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition ${
                        isCurrent
                          ? "bg-amber-100 border border-amber-400 shadow-2xs"
                          : "bg-amber-50/50 border border-amber-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.avatar}</span>
                        <span className="text-amber-950">{p.name}</span>
                        {isCurrent && <span className="text-[9px] bg-amber-800 text-white px-1.5 py-0.2 rounded">Turn</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-amber-900 font-extrabold">
                          {p.position} / 64
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Special Karma Task Modal */}
      {activeSpecialTask && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white p-6 shadow-2xl space-y-4 text-center animate-fade-in">
            <span className="text-4xl block">📜</span>
            <h4 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "॥ ದೈವಿಕ ಕರ್ಮ ಸವಾಲು (Karma Task) ॥" : "Sacred Karma Challenge!"}
            </h4>
            <div className="bg-amber-100/70 p-4 rounded-2xl border border-amber-300 text-sm font-extrabold text-amber-950">
              {activeSpecialTask}
            </div>
            <button
              type="button"
              onClick={() => setActiveSpecialTask(null)}
              className="w-full py-2.5 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs hover:bg-amber-900 transition"
            >
              ✅ {isKn ? "ಟಾಸ್ಕ್ ಪೂರ್ಣಗೊಳಿಸಿದೆ (Done)" : "Completed"}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};
