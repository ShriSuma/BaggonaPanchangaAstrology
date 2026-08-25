import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import { gameAudio } from "../utils/gameAudio";
import { VedicMindReaderGame } from "../components/games/VedicMindReaderGame";
import { NavagrahaBoardGame } from "../components/games/NavagrahaBoardGame";
import { AstroCharadesGame } from "../components/games/AstroCharadesGame";
import { SankhyaDuelGame } from "../components/games/SankhyaDuelGame";
import { VedicTriviaBlitzGame } from "../components/games/VedicTriviaBlitzGame";

type ActiveGameId = "hub" | "mindreader" | "parampada" | "charades" | "sankhya" | "trivia";

export default function AstroGamesPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language.startsWith("kn");

  const [activeGame, setActiveGame] = useState<ActiveGameId>("hub");
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.isMuted);

  const toggleMute = () => {
    gameAudio.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSelectGame = (gameId: ActiveGameId) => {
    setActiveGame(gameId);
    gameAudio.playChime();
  };

  const games = [
    {
      id: "mindreader" as ActiveGameId,
      titleKn: "೧. ಚಿತ್ತ ರಹಸ್ಯ (Vedic Mind Reader)",
      titleEn: "1. The 108 Vedic Mind Reader",
      badgeKn: "ಏಕ ವ್ಯಕ್ತಿ (Solo / 1 Player)",
      badgeEn: "Solo (1 Player vs Oracle)",
      icon: "🔮",
      descKn: "ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಸಂಖ್ಯೆ, ರಾಶಿ ಅಥವಾ ನವಗ್ರಹ ಅಂದುಕೊಳ್ಳಿ; ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಚ್ಚರಿಯಾಗಿ ಓದುತ್ತದೆ!",
      descEn: "Think of any secret number, Zodiac sign, or deity; the mystical Oracle will reveal your exact thought!"
    },
    {
      id: "parampada" as ActiveGameId,
      titleKn: "೨. ನವಗ್ರಹ ಪರಮಪದ (Cosmic Board)",
      titleEn: "2. Cosmic Navagraha Roller & Ladders",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Multi-player",
      icon: "🎲",
      descKn: "೩ಡಿ ಗೋಲ್ಡನ್ ಡೈಸ್ ರೋಲರ್, ಪುಣ್ಯ ಮೆಟ್ಟಿಲುಗಳು, ರಾಹು-ಶನಿ ಕರ್ಮ ಸರ್ಪಗಳು ಹಾಗೂ ವಿಶೇಷ ಟಾಸ್ಕ್‌ಗಳ ಬೋರ್ಡ್ ಗೇಮ್!",
      descEn: "Animated golden dice roller, Punya ladders, Rahu-Shani obstacles, and special interactive tasks!"
    },
    {
      id: "charades" as ActiveGameId,
      titleKn: "೩. ರಾಶಿ ನಕ್ಷತ್ರ ರಹಸ್ಯ (Astro Charades)",
      titleEn: "3. Astro Charades & 'Who Am I?'",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Party Game",
      icon: "🌟",
      descKn: "೪೫ ಸೆಕೆಂಡುಗಳ ಟೈಮರ್, ಜ್ಯೋತಿಷ್ಯ ಸುಳಿವುಗಳು, ಧ್ವನಿ ಎಫೆಕ್ಟ್‌ಗಳು ಹಾಗೂ ರೋಚಕ ಊಹೆಯ ಪಾರ್ಟಿ ಆಟ!",
      descEn: "45-second timer, astrological clues, sound effects, and fast-paced guessing fun during travels!"
    },
    {
      id: "sankhya" as ActiveGameId,
      titleKn: "೪. ಸಂಖ್ಯಾ ಚಕ್ರ ಸಮರ (Numerology Duel)",
      titleEn: "4. Vedic Numerology Castle Clash",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Dice Duel",
      icon: "🔢",
      descKn: "ಜನ್ಮ ದಿನಾಂಕದ ಮೂಲಾಂಕದಿಂದ ೯ ನವಗ್ರಹ ದುರ್ಗಗಳನ್ನು ವಶಪಡಿಸಿಕೊಳ್ಳುವ ರೋಚಕ ತಂತ್ರಗಾರಿಕೆ ಆಟ!",
      descEn: "Conquer 9 planetary castles using your birth date's Driver number and friendly cosmic alliances!"
    },
    {
      id: "trivia" as ActiveGameId,
      titleKn: "೫. ಮಹಾ ಜ್ಯೋತಿಷ್ಯ ರಸಪ್ರಶ್ನೆ (Trivia Blitz)",
      titleEn: "5. Grand Vedic Trivia Blitz",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Quiz Show",
      icon: "🧠",
      descKn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ, ಪಂಚಾಂಗ, ೨೭ ನಕ್ಷತ್ರಗಳು ಹಾಗೂ ಪುರಾಣ ರಹಸ್ಯಗಳ ಬಹು ಆಯ್ಕೆಯ ಜ್ಞಾನ ಸಂಗ್ರಾಮ!",
      descEn: "Epic multi-player trivia show on Gokarna legends, Panchanga, 27 Nakshatras, and Puranas!"
    }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Master Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 shadow-inner flex items-center justify-center text-4xl select-none">
              🎮
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase flex items-center gap-1.5">
                <span>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಖೇಲ ಮಂಡಲ ॥</span>
                <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">Gaming Arena</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-amber-950 mt-0.5">
                {isKn ? "ಜ್ಯೋತಿಷ್ಯ & ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಸಂವಾದಾತ್ಮಕ ಆಟಗಳು" : "Vedic Astrology & Numerology Gaming Arena"}
              </h1>
              <p className="text-xs text-amber-900/90 font-medium mt-1">
                {isKn
                  ? "ಪ್ರಯಾಣ, ಕಾರು ಚಾಲನೆ, ಕುಟುಂಬ ಹಾಗೂ ಮಿತ್ರರೊಂದಿಗೆ ಆಡಲು ೫ ರೋಚಕ ಆಟಗಳು (ಏಕ ವ್ಯಕ್ತಿ & ೨ ರಿಂದ ೮ ಆಟಗಾರರು)"
                  : "5 engaging games for travel, road trips, and family leisure (1 Solo & 4 Multi-player 2-8 Player games)"}
              </p>
            </div>
          </div>

          {/* Sound & Hub Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-2.5 rounded-xl border border-amber-300 bg-white/90 text-amber-900 hover:bg-white shadow-xs font-bold text-sm"
            >
              {isMuted ? "🔇 ಧ್ವನಿ ಆಫ್" : "🔊 ಧ್ವನಿ ಆನ್"}
            </button>

            {activeGame !== "hub" && (
              <button
                type="button"
                onClick={() => setActiveGame("hub")}
                className="px-4 py-2 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs shadow-md hover:bg-amber-900 transition flex items-center gap-1"
              >
                <span>🏠</span>
                <span>{isKn ? "ಎಲ್ಲಾ ಆಟಗಳು (Hub)" : "All Games"}</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Sub-Navigation Switcher (Visible when inside a game) */}
      {activeGame !== "hub" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveGame("hub")}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-white border border-amber-300 text-amber-950 hover:bg-amber-50"
          >
            🏠 Hub
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelectGame(g.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
                activeGame === g.id
                  ? "bg-amber-900 text-amber-50 border border-amber-700 shadow-md scale-105"
                  : "bg-white border border-amber-200 text-amber-950 hover:bg-amber-50"
              }`}
            >
              <span>{g.icon}</span>
              <span>{isKn ? g.titleKn.split(" ")[1] : g.titleEn.split(" ")[1]}</span>
            </button>
          ))}
        </div>
      )}

      {/* HUB VIEW: 5 Game Cards */}
      {activeGame === "hub" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {games.map((game) => (
            <Card
              key={game.id}
              className="border-2 border-amber-300 bg-white hover:border-amber-500 hover:shadow-xl transition p-5 flex flex-col justify-between space-y-4 group cursor-pointer"
              onClick={() => handleSelectGame(game.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-4xl group-hover:scale-110 transition select-none">
                    {game.icon}
                  </span>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {isKn ? game.badgeKn : game.badgeEn}
                  </span>
                </div>

                <h3 className="font-serif text-base font-extrabold text-amber-950 group-hover:text-amber-700 transition">
                  {isKn ? game.titleKn : game.titleEn}
                </h3>

                <p className="text-xs text-amber-900/80 leading-relaxed font-medium">
                  {isKn ? game.descKn : game.descEn}
                </p>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-amber-50 font-bold text-xs shadow hover:from-amber-800 hover:to-black transition flex items-center justify-center gap-1.5"
              >
                <span>▶️</span>
                <span>{isKn ? "ಈಗಲೇ ಆಡಿ (Play Now)" : "Play Now"}</span>
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* ACTIVE GAME SCREENS */}
      {activeGame === "mindreader" && <VedicMindReaderGame lang={i18n.language} />}
      {activeGame === "parampada" && <NavagrahaBoardGame lang={i18n.language} />}
      {activeGame === "charades" && <AstroCharadesGame lang={i18n.language} />}
      {activeGame === "sankhya" && <SankhyaDuelGame lang={i18n.language} />}
      {activeGame === "trivia" && <VedicTriviaBlitzGame lang={i18n.language} />}
    </div>
  );
}
