import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";
import { gameAudio } from "../utils/gameAudio";
import { VedicMindReaderGame } from "../components/games/VedicMindReaderGame";
import { YogaDoshaParampadaGame } from "../components/games/YogaDoshaParampadaGame";
import { NavagrahaBoardGame } from "../components/games/NavagrahaBoardGame";
import { AstroCharadesGame } from "../components/games/AstroCharadesGame";
import { SankhyaDuelGame } from "../components/games/SankhyaDuelGame";
import { VedicTriviaBlitzGame } from "../components/games/VedicTriviaBlitzGame";
import { LearnKundliGame } from "../components/games/LearnKundliGame";
import { encodeAcademyToken } from "../utils/tokenCipher";

type ActiveGameId = "hub" | "yogadosha" | "mindreader" | "parampada" | "charades" | "sankhya" | "trivia" | "learnkundli";

export default function AstroGamesPage(): JSX.Element {
  const { i18n } = useTranslation();
  const isKn = i18n.language.startsWith("kn");

  const [activeGame, setActiveGame] = useState<ActiveGameId>("hub");
  const [isMuted, setIsMuted] = useState<boolean>(gameAudio.isMuted);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareStudentName, setShareStudentName] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const generateShareUrl = (): string => {
    if (typeof window === "undefined") return "";
    const nameToUse = (shareStudentName || "ವಿದ್ಯಾರ್ಥಿ").trim();
    const token = encodeAcademyToken({
      name: nameToUse,
      lang: i18n.language,
      level: 1,
      step: 1,
      invitedBy: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)"
    });
    const origin = window.location.origin;
    return `${origin}/academy?academyToken=${token}`;
  };

  const handleCopyLink = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(generateShareUrl());
    setCopied(true);
    gameAudio.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = generateShareUrl();
    const text = isKn
      ? `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ (Kundli Academy)!\n\nಆತ್ಮೀಯ ${shareStudentName || "ವಿದ್ಯಾರ್ಥಿ"},\nಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ) ಅವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳೊಂದಿಗೆ ೧೨ ಮನೆಗಳ ಕುಂಡಲಿ ಫಲಜ್ಯೋತಿಷ್ಯವನ್ನು ಗೇಮ್ ರೂಪದಲ್ಲಿ ಕಲಿಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಬಳಸಿ:\n\n👉 ${url}\n\n॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ ಪ್ರಸನ್ನ ॥`
      : `🕉️ Baggona Vedic Kundli Gurukula!\n\nDear ${shareStudentName || "Student"},\nMaster the 12 houses of Janma Kundali in an authentic gaming quest under the sacred mentorship of Revered Shreeram Pandit (Guruji) based on Dr. B.V. Raman's classical master rules:\n\n👉 ${url}\n\nBlessings from Shri Shantikaparameshwari!`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

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
      id: "yogadosha" as ActiveGameId,
      titleKn: "೧. ಯೋಗ & ದೋಷ ಮಹಾ ಪರಮಪದ (Yoga & Dosha)",
      titleEn: "1. Yoga & Dosha Maha Parampada (Snake & Ladder)",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players (Board & Roller)",
      icon: "🐍",
      descKn: "೧೦೦ ಮನೆಗಳ ಮಹಾ ಬೋರ್ಡ್, ೩ಡಿ ಡೈಸ್ ರೋಲರ್, ಲಕ್ಕಿ ನಂಬರ್ ಬೋನಸ್, ಪುಣ್ಯ ಯೋಗ ಮೆಟ್ಟಿಲುಗಳು (Ladders) ಹಾಗೂ ಕರ್ಮ ದೋಷ ಸರ್ಪಗಳು (Snakes)!",
      descEn: "100-cell grand Vedic board, animated dice roller, lucky number match bonuses, Divine Yogas (Ladders) & Karmic Doshas (Snakes)!"
    },
    {
      id: "mindreader" as ActiveGameId,
      titleKn: "೨. ಚಿತ್ತ ರಹಸ್ಯ (Vedic Mind Reader)",
      titleEn: "2. The 108 Vedic Mind Reader",
      badgeKn: "ಏಕ ವ್ಯಕ್ತಿ (Solo / 1 Player)",
      badgeEn: "Solo (1 Player vs Oracle)",
      icon: "🔮",
      descKn: "ಮನಸ್ಸಿನಲ್ಲಿ ಯಾವುದೇ ಸಂಖ್ಯೆ, ರಾಶಿ ಅಥವಾ ನವಗ್ರಹ ಅಂದುಕೊಳ್ಳಿ; ಓರಾಕಲ್ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಅಚ್ಚರಿಯಾಗಿ ಓದುತ್ತದೆ!",
      descEn: "Think of any secret number, Zodiac sign, or deity; the mystical Oracle will reveal your exact thought!"
    },
    {
      id: "parampada" as ActiveGameId,
      titleKn: "೩. ನವಗ್ರಹ ಪರಮಪದ (Cosmic Board)",
      titleEn: "3. Cosmic Navagraha Roller & Ladders",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Multi-player",
      icon: "🎲",
      descKn: "೬೪ ಮನೆಗಳ ನವಗ್ರಹ ಬೋರ್ಡ್, ಪುಣ್ಯ ಮೆಟ್ಟಿಲುಗಳು, ರಾಹು-ಶನಿ ಕರ್ಮ ಸರ್ಪಗಳು ಹಾಗೂ ವಿಶೇಷ ಟಾಸ್ಕ್‌ಗಳ ಬೋರ್ಡ್ ಗೇಮ್!",
      descEn: "64-tile celestial board, Punya ladders, Rahu-Shani obstacles, and special interactive tasks!"
    },
    {
      id: "charades" as ActiveGameId,
      titleKn: "೪. ರಾಶಿ ನಕ್ಷತ್ರ ರಹಸ್ಯ (Astro Charades)",
      titleEn: "4. Astro Charades & 'Who Am I?'",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Party Game",
      icon: "🌟",
      descKn: "೪೫ ಸೆಕೆಂಡುಗಳ ಟೈಮರ್, ಜ್ಯೋತಿಷ್ಯ ಸುಳಿವುಗಳು, ಧ್ವನಿ ಎಫೆಕ್ಟ್‌ಗಳು ಹಾಗೂ ರೋಚಕ ಊಹೆಯ ಪಾರ್ಟಿ ಆಟ!",
      descEn: "45-second timer, astrological clues, sound effects, and fast-paced guessing fun during travels!"
    },
    {
      id: "sankhya" as ActiveGameId,
      titleKn: "೫. ಸಂಖ್ಯಾ ಚಕ್ರ ಸಮರ (Numerology Duel)",
      titleEn: "5. Vedic Numerology Castle Clash",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Dice Duel",
      icon: "🔢",
      descKn: "ಜನ್ಮ ದಿನಾಂಕದ ಮೂಲಾಂಕದಿಂದ ೯ ನವಗ್ರಹ ದುರ್ಗಗಳನ್ನು ವಶಪಡಿಸಿಕೊಳ್ಳುವ ರೋಚಕ ತಂತ್ರಗಾರಿಕೆ ಆಟ!",
      descEn: "Conquer 9 planetary castles using your birth date's Driver number and friendly cosmic alliances!"
    },
    {
      id: "trivia" as ActiveGameId,
      titleKn: "೬. ಮಹಾ ಜ್ಯೋತಿಷ್ಯ ರಸಪ್ರಶ್ನೆ (Trivia Blitz)",
      titleEn: "6. Grand Vedic Trivia Blitz",
      badgeKn: "೨ - ೮ ಆಟಗಾರರು (2 to 8 Players)",
      badgeEn: "2 to 8 Players Quiz Show",
      icon: "🧠",
      descKn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ, ಪಂಚಾಂಗ, ೨೭ ನಕ್ಷತ್ರಗಳು ಹಾಗೂ ಪುರಾಣ ರಹಸ್ಯಗಳ ಬಹು ಆಯ್ಕೆಯ ಜ್ಞಾನ ಸಂಗ್ರಾಮ!",
      descEn: "Epic multi-player trivia show on Gokarna legends, Panchanga, 27 Nakshatras, and Puranas!"
    },
    {
      id: "learnkundli" as ActiveGameId,
      titleKn: "೭. ಜಾತಕ & ಪಂಚಾಂಗ ಕಲಿಕಾ ಖೇಲ (Learn Kundli)",
      titleEn: "7. Learn to Read Janma Kundali & Panchanga",
      badgeKn: "೧೨ ಹಂತಗಳ ಅಕಾಡೆಮಿ (12 Levels Academy)",
      badgeEn: "12 Levels Interactive Academy",
      icon: "📖",
      descKn: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ, ೧೨ ಮನೆಗಳ ಒಡೆಯ, ಉಚ್ಚ-ನೀಚ ಹಾಗೂ ಫಲಜ್ಯೋತಿಷ್ಯದ ಸರಳ ಕಲಿಕೆ!",
      descEn: "Interactive South Indian chart, 12 house lords, exaltation, debilitation, friendships, and placement outcomes under Revered Shreeram Pandit's guidance!"
    }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 sm:px-4 py-4 sm:py-6">
      {/* Master Top Header Card */}
      <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 shadow-inner flex items-center justify-center text-3xl sm:text-4xl select-none shrink-0">
              🎮
            </div>
            <div>
              <div className="text-[10px] font-extrabold tracking-widest text-amber-800 uppercase flex items-center gap-1.5 flex-wrap">
                <span>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಖೇಲ ಮಂಡಲ ॥</span>
                <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold">Gaming Arena</span>
              </div>
              <h1 className="font-serif text-lg sm:text-2xl font-extrabold text-amber-950 mt-0.5">
                {isKn ? "ಜ್ಯೋತಿಷ್ಯ & ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ ಸಂವಾದಾತ್ಮಕ ಆಟಗಳು" : "Vedic Astrology & Numerology Gaming Arena"}
              </h1>
              <p className="text-xs text-amber-900/90 font-medium mt-1">
                {isKn
                  ? "ಮೊಬೈಲ್, ಪ್ರಯಾಣ, ಕಾರು ಚಾಲನೆ, ಕುಟುಂಬ ಹಾಗೂ ಮಿತ್ರರೊಂದಿಗೆ ಆಡಲು ೭ ರೋಚಕ ಆಟಗಳು (ಏಕ ವ್ಯಕ್ತಿ, ೨ ರಿಂದ ೮ ಆಟಗಾರರು & ಕಲಿಕಾ ಅಕಾಡೆಮಿ)"
                  : "7 engaging games for mobile, travel, and family leisure (Solo, 2-8 Players & Kundli Academy)"}
              </p>
            </div>
          </div>

          {/* Sound & Hub Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
              className="p-2 sm:p-2.5 rounded-xl border border-amber-300 bg-white/90 text-amber-900 hover:bg-white shadow-xs font-bold text-xs sm:text-sm"
            >
              {isMuted ? "🔇 ಧ್ವನಿ ಆಫ್" : "🔊 ಧ್ವನಿ ಆನ್"}
            </button>

            {activeGame !== "hub" && (
              <button
                type="button"
                onClick={() => setActiveGame("hub")}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-800 text-amber-50 font-bold text-xs shadow-md hover:bg-amber-900 transition flex items-center gap-1"
              >
                <span>🏠</span>
                <span>{isKn ? "Hub" : "All Games"}</span>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
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

      {/* HUB VIEW: 7 Game Cards */}
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
      {activeGame === "yogadosha" && <YogaDoshaParampadaGame lang={i18n.language} />}
      {activeGame === "mindreader" && <VedicMindReaderGame lang={i18n.language} />}
      {activeGame === "parampada" && <NavagrahaBoardGame lang={i18n.language} />}
      {activeGame === "charades" && <AstroCharadesGame lang={i18n.language} />}
      {activeGame === "sankhya" && <SankhyaDuelGame lang={i18n.language} />}
      {activeGame === "trivia" && <VedicTriviaBlitzGame lang={i18n.language} />}
      {activeGame === "learnkundli" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-100/70 border border-amber-300 p-3 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveGame("hub")}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:text-amber-800"
            >
              <span>←</span>
              <span>{isKn ? "ಆಟಗಳ ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Games Hub"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShareModal(true);
                gameAudio.playChime();
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white font-black text-xs shadow-md hover:from-amber-700 hover:to-black transition flex items-center gap-1.5"
            >
              <span>🔗</span>
              <span>{isKn ? "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಲಿಂಕ್ ಕಳುಹಿಸಿ" : "Generate Vidyarthi Link"}</span>
            </button>
          </div>

          <LearnKundliGame lang={i18n.language} isStandalone={false} />
        </div>
      )}

      {/* Share Modal Dialog (Priest/Admin only) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border-2 border-amber-400 p-6 max-w-md w-full shadow-2xl space-y-4 relative text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <div>
                  <div className="text-[9px] font-extrabold text-amber-400 uppercase">॥ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ ॥</div>
                  <h3 className="font-serif text-base font-black text-white">
                    {isKn ? "ವಿದ್ಯಾರ್ಥಿಗೆ ವೈಯಕ್ತಿಕ ಲಿಂಕ್ ಕಳುಹಿಸಿ" : "Generate Vidyarthi Learning Link"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 font-black flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-300 mb-1">
                  👤 {isKn ? "ವಿದ್ಯಾರ್ಥಿ / ಭಕ್ತರ ಹೆಸರು:" : "Student / Devotee Name:"}
                </label>
                <input
                  type="text"
                  value={shareStudentName}
                  onChange={(e) => setShareStudentName(e.target.value)}
                  placeholder={isKn ? "ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು ನಮೂದಿಸಿ" : "Enter Student Name"}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-500/40 bg-slate-950 font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 break-all text-[11px] font-mono text-amber-300">
                {generateShareUrl()}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow hover:bg-amber-400 transition flex items-center justify-center gap-1.5"
                >
                  <span>{copied ? "✅" : "📋"}</span>
                  <span>{copied ? (isKn ? "ಕಾಪಿ ಆಯಿತು!" : "Copied!") : (isKn ? "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ" : "Copy Link")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 rounded-xl bg-emerald-600 text-white font-black shadow hover:bg-emerald-500 transition flex items-center justify-center gap-1.5"
                >
                  <span>💬</span>
                  <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ" : "Share WhatsApp"}</span>
                </button>
              </div>

              <p className="text-[10px] text-amber-200/80 text-center font-medium">
                🔒 {isKn
                  ? "ಈ ಲಿಂಕ್ ತೆರೆದಾಗ ವಿದ್ಯಾರ್ಥಿಯು ಕೇವಲ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಕುಂಡಲಿ ಕಲಿಕಾ ಆಟವನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಬಹುದು. ಇತರ ಯಾವುದೇ ಪುಟಗಳಿಗೆ ಪ್ರವೇಶವಿರುವುದಿಲ್ಲ."
                  : "Recipients exclusively access Guruji Shreeram Pandit's Kundli Gurukula game without logging in."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
