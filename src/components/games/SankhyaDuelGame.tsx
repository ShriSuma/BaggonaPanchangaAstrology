import React, { useState } from "react";
import Card from "../ui/Card";
import { gameAudio } from "../../utils/gameAudio";

export type SankhyaDuelProps = {
  lang?: string;
};

type DuelPlayer = {
  id: number;
  name: string;
  birthDay: number;
  driverNumber: number;
  score: number;
  capturedZones: number[];
  avatar: string;
};

const PLANET_ZONES = [
  { num: 1, nameKn: "ಸೂರ್ಯ ದುರ್ಗ", nameEn: "Surya Castle", symbol: "☀️", color: "from-amber-400 to-yellow-500", friend: [2, 3, 9], enemy: [8] },
  { num: 2, nameKn: "ಚಂದ್ರ ದುರ್ಗ", nameEn: "Chandra Castle", symbol: "🌙", color: "from-slate-200 to-sky-300", friend: [1, 5], enemy: [8, 9] },
  { num: 3, nameKn: "ಗುರು ದುರ್ಗ", nameEn: "Guru Castle", symbol: "🌟", color: "from-yellow-300 to-amber-400", friend: [1, 2, 9], enemy: [6] },
  { num: 4, nameKn: "ರಾಹು ದುರ್ಗ", nameEn: "Rahu Castle", symbol: "🌪️", color: "from-purple-400 to-indigo-600", friend: [5, 6, 7], enemy: [1, 2, 9] },
  { num: 5, nameKn: "ಬುಧ ದುರ್ಗ", nameEn: "Budha Castle", symbol: "💎", color: "from-emerald-300 to-teal-500", friend: [1, 6], enemy: [2] },
  { num: 6, nameKn: "ಶುಕ್ರ ದುರ್ಗ", nameEn: "Shukra Castle", symbol: "💖", color: "from-pink-300 to-rose-400", friend: [4, 5, 8], enemy: [3] },
  { num: 7, nameKn: "ಕೇತು ದುರ್ಗ", nameEn: "Ketu Castle", symbol: "📿", color: "from-orange-300 to-amber-600", friend: [1, 4], enemy: [2] },
  { num: 8, nameKn: "ಶನಿ ದುರ್ಗ", nameEn: "Shani Castle", symbol: "🪐", color: "from-indigo-400 to-blue-700", friend: [5, 6], enemy: [1, 2, 9] },
  { num: 9, nameKn: "ಮಂಗಳ ದುರ್ಗ", nameEn: "Kuja Castle", symbol: "🔥", color: "from-rose-400 to-red-600", friend: [1, 2, 3], enemy: [4] }
];

export const SankhyaDuelGame: React.FC<SankhyaDuelProps> = ({ lang = "kn" }) => {
  const isKn = (lang || "kn").slice(0, 2) === "kn";

  const [players, setPlayers] = useState<DuelPlayer[]>([
    { id: 1, name: "Player 1", birthDay: 15, driverNumber: 6, score: 0, capturedZones: [], avatar: "💖" },
    { id: 2, name: "Player 2", birthDay: 1, driverNumber: 1, score: 0, capturedZones: [], avatar: "☀️" },
    { id: 3, name: "Player 3", birthDay: 23, driverNumber: 5, score: 0, capturedZones: [], avatar: "💎" },
    { id: 4, name: "Player 4", birthDay: 9, driverNumber: 9, score: 0, capturedZones: [], avatar: "🔥" }
  ]);

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [rollerValue, setRollerValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [log, setLog] = useState<string>(
    isKn ? "ಸಂಖ್ಯಾ ರೋಲರ್ ತಿರುಗಿಸಲು 'ರೋಲ್' ಒತ್ತಿರಿ!" : "Press 'Roll' to spin the 9-Sided Sacred Roller!"
  );

  const calculateDriver = (d: number): number => {
    let sum = d;
    while (sum > 9) {
      sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    }
    return sum || 1;
  };

  const handleUpdatePlayerDay = (id: number, day: number) => {
    const dr = calculateDriver(day);
    const av = PLANET_ZONES.find((z) => z.num === dr)?.symbol || "🌟";
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, birthDay: day, driverNumber: dr, avatar: av } : p))
    );
  };

  const handleRoll = () => {
    if (isRolling) return;
    setIsRolling(true);
    gameAudio.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setRollerValue(Math.floor(Math.random() * 9) + 1);
      count++;
      if (count > 9) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 9) + 1;
        setRollerValue(finalRoll);
        setIsRolling(false);
        resolveDuelMove(finalRoll);
      }
    }, 60);
  };

  const resolveDuelMove = (roll: number) => {
    const curr = players[currentPlayerIdx];
    const zone = PLANET_ZONES.find((z) => z.num === roll) || PLANET_ZONES[0];

    let pts = 10;
    let msg = "";

    if (roll === curr.driverNumber) {
      pts = 50;
      msg = isKn ? `🌟 ಸ್ವಂತ ದುರ್ಗ (${zone.nameKn}) ವಶವಾಯಿತು! +೫೦ ಅಂಕ!` : `🌟 Own Castle (${zone.nameEn}) Conquered! +50 pts!`;
      gameAudio.playSuccess();
    } else if (zone.friend.includes(curr.driverNumber)) {
      pts = 25;
      msg = isKn ? `🤝 ಮಿತ್ರ ದುರ್ಗ (${zone.nameKn}) ಮೈತ್ರಿ! +೨೫ ಅಂಕ!` : `🤝 Allied Castle (${zone.nameEn}) Captured! +25 pts!`;
      gameAudio.playSuccess();
    } else {
      pts = 10;
      msg = isKn ? `⚔️ ಸಮರ ದುರ್ಗ (${zone.nameKn}) ಜಯ! +೧೦ ಅಂಕ!` : `⚔️ Battle Castle (${zone.nameEn}) Secured! +10 pts!`;
      gameAudio.playTick();
    }

    const updated = [...players];
    const newCaptured = Array.from(new Set([...curr.capturedZones, roll]));
    updated[currentPlayerIdx] = {
      ...curr,
      score: curr.score + pts,
      capturedZones: newCaptured
    };
    setPlayers(updated);
    setLog(`${curr.name} ${roll} (${zone.nameKn}) ರೋಲ್ ಮಾಡಿದರು. ${msg}`);

    // Switch player
    if (currentPlayerIdx + 1 < players.length) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
    } else {
      setCurrentPlayerIdx(0);
      setRound((r) => r + 1);
    }
  };

  const currentPlayer = players[currentPlayerIdx];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-5 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-3xl select-none">🔢</span>
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase">
              ॥ ಸಂಖ್ಯಾ ಚಕ್ರ ಸಮರ · ೨ ರಿಂದ ೮ ಆಟಗಾರರ ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಡ್ಯುಯೆಲ್ (Numerology Duel) ॥
            </div>
            <h3 className="font-serif text-base font-bold text-amber-950">
              {isKn ? "ಸಂಖ್ಯಾ ಚಕ್ರ ಸಮರ & ನವದುರ್ಗ ವಿಜಯ" : "Vedic Numerology Castle Clash"}
            </h3>
            <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
              {isKn
                ? "ನಿಮ್ಮ ಜನ್ಮ ದಿನಾಂಕದ ಮೂಲಾಂಕದಿಂದ (Driver Number) ೯ ನವಗ್ರಹ ದುರ್ಗಗಳನ್ನು ವಶಪಡಿಸಿಕೊಳ್ಳಿ. ಮಿತ್ರ ಗ್ರಹಗಳಿಂದ ಡಬಲ್ ಬೋನಸ್ ಅಂಕ ಗಳಿಸಿ!"
                : "Conquer 9 planetary zones using your birth date's Driver Number. Earn double bonus points on friendly planets!"}
            </p>
          </div>
        </div>
      </Card>

      {/* Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 9 Planetary Castles Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {PLANET_ZONES.map((zone) => {
              const captors = players.filter((p) => p.capturedZones.includes(zone.num));
              return (
                <Card
                  key={zone.num}
                  className={`border-2 border-amber-300 p-4 text-center space-y-2 bg-gradient-to-br ${zone.color} text-slate-950 shadow-sm relative overflow-hidden`}
                >
                  <div className="text-3xl">{zone.symbol}</div>
                  <div className="font-extrabold text-xs">
                    #{zone.num} {isKn ? zone.nameKn : zone.nameEn}
                  </div>

                  {/* Captors Badges */}
                  <div className="flex flex-wrap justify-center gap-1 min-h-6 pt-1">
                    {captors.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-white/90 font-extrabold px-1.5 py-0.5 rounded-full shadow-2xs border border-amber-300"
                      >
                        {c.avatar} {c.name.split(" ")[1]}
                      </span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2">
            <span>📢</span>
            <span>{log}</span>
          </div>
        </div>

        {/* Roller & Player Profiles */}
        <div className="space-y-4">
          <Card className="border-2 border-amber-400 bg-white p-5 shadow-md text-center space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="text-xs font-bold text-amber-800">Round {round}</span>
              <span className="text-xs font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {currentPlayer?.name} ({currentPlayer?.avatar})
              </span>
            </div>

            {/* 9-Sided Roller Graphic */}
            <div className="py-2">
              <div
                className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-200 border-4 border-amber-600 shadow-xl flex items-center justify-center text-4xl font-black text-indigo-950 transition-transform ${
                  isRolling ? "animate-spin scale-90" : "scale-100"
                }`}
              >
                {rollerValue}
              </div>
            </div>

            <button
              type="button"
              disabled={isRolling}
              onClick={handleRoll}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-2 ${
                isRolling
                  ? "bg-amber-300 text-amber-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-amber-50 hover:scale-102"
              }`}
            >
              <span>🎲</span>
              <span>{isRolling ? "ತಿರುಗುತ್ತಿದೆ..." : isKn ? "೯-ಸಂಖ್ಯಾ ರೋಲರ್ ತಿರುಗಿಸಿ (ROLL)" : "Roll 9-Sided Wheel"}</span>
            </button>
          </Card>

          {/* Player Cards */}
          <div className="space-y-2">
            {players.map((p, idx) => (
              <Card
                key={p.id}
                className={`p-3 border transition ${
                  idx === currentPlayerIdx
                    ? "border-amber-500 bg-amber-50/90 shadow-sm"
                    : "border-amber-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.avatar}</span>
                    <div>
                      <strong className="text-xs text-amber-950 block">{p.name}</strong>
                      <span className="text-[10px] text-amber-800">
                        {isKn ? `ಮೂಲಾಂಕ: #${p.driverNumber}` : `Driver: #${p.driverNumber}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-amber-950 block">{p.score} pts</span>
                    <span className="text-[10px] text-emerald-800 font-bold">
                      {p.capturedZones.length} Castles
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
