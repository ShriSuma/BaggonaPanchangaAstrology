import React, { useEffect, useState } from "react";
import { LearnKundliGame } from "../components/games/LearnKundliGame";
import { decodeAcademyToken, encodeAcademyToken } from "../utils/tokenCipher";
import { gameAudio } from "../utils/gameAudio";

export default function KundliAcademyStandalonePage(): JSX.Element {
  const [studentName, setStudentName] = useState<string>("ವಿದ್ಯಾರ್ಥಿ");
  const [invitedBy, setInvitedBy] = useState<string>("ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)");
  const [lang, setLang] = useState<string>("kn");
  const [initialLevel, setInitialLevel] = useState<number>(1);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareCustomName, setShareCustomName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("academyToken") || params.get("token");

    if (token) {
      const decoded = decodeAcademyToken(token);
      if (decoded) {
        setStudentName(decoded.name || "ವಿದ್ಯಾರ್ಥಿ");
        setInvitedBy(decoded.invitedBy || "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)");
        setLang(decoded.lang || "kn");
        setInitialLevel(decoded.level || 1);
        return;
      }
    }

    // Direct query param fallbacks
    const rawName = params.get("name") || params.get("n");
    if (rawName) setStudentName(rawName);

    const rawLang = params.get("lang") || params.get("l");
    if (rawLang) setLang(rawLang);

    const rawLevel = params.get("level") || params.get("lv");
    if (rawLevel) setInitialLevel(parseInt(rawLevel, 10) || 1);
  }, []);

  const isKn = lang.slice(0, 2) === "kn";

  const generateShareUrl = (customName?: string): string => {
    if (typeof window === "undefined") return "";
    const nameToUse = (customName || shareCustomName || studentName || "ವಿದ್ಯಾರ್ಥಿ").trim();
    const token = encodeAcademyToken({
      name: nameToUse,
      lang: lang,
      level: initialLevel,
      step: 1,
      invitedBy: "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)"
    });

    const origin = window.location.origin;
    return `${origin}/academy?academyToken=${token}`;
  };

  const currentShareUrl = generateShareUrl();

  const handleCopyLink = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(currentShareUrl);
    setCopied(true);
    gameAudio.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = isKn
      ? `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ (Kundli Academy)!\n\nಆತ್ಮೀಯ ${studentName},\nಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ) ಅವರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳೊಂದಿಗೆ ೧೨ ಮನೆಗಳ ಕುಂಡಲಿ ಫಲಜ್ಯೋತಿಷ್ಯವನ್ನು ಗೇಮ್ ರೂಪದಲ್ಲಿ ಕಲಿಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಬಳಸಿ:\n\n👉 ${currentShareUrl}\n\n॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ ಪ್ರಸನ್ನ ॥`
      : `🕉️ Baggona Vedic Kundli Gurukula!\n\nDear ${studentName},\nMaster the 12 houses of Janma Kundali in an authentic gaming quest under the sacred mentorship of Revered Shreeram Pandit (Guruji) based on Dr. B.V. Raman's classical master rules:\n\n👉 ${currentShareUrl}\n\nBlessings from Shri Shantikaparameshwari!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 select-none relative overflow-x-hidden font-sans">
      {/* Background Cosmic Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl w-full space-y-5 relative z-10">
        {/* Dedicated Standalone Temple Gurukula Header */}
        <header className="rounded-3xl border-2 border-amber-500/80 bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-950 p-4 sm:p-6 text-amber-50 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black flex items-center justify-center text-3xl shadow-lg border-2 border-amber-200 select-none shrink-0">
                🕉️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/50">
                    ॥ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ ದೀಕ್ಷೆ ॥
                  </span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/50">
                    ✨ {isKn ? "ವಿದ್ಯಾರ್ಥಿ ಕಲಿಕಾ ತಾಣ" : "Vidyarthi Learning Sanctuary"}
                  </span>
                </div>

                <h1 className="font-serif text-lg sm:text-2xl font-black text-white tracking-tight">
                  {isKn ? `ಆತ್ಮೀಯ ಸ್ವಾಗತ, ${studentName}!` : `Welcome, ${studentName}!`}
                </h1>

                <p className="text-xs text-amber-200/90 font-medium">
                  {isKn
                    ? `ಗುರು ಉಪದೇಶ & ಮಾರ್ಗದರ್ಶನ: ${invitedBy} · ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಕುಂಡಲಿ ಕಲಿಕೆ.`
                    : `Preceptor & Guidance: ${invitedBy} · Classical Vedic astrology based on Dr. B.V. Raman's master rules.`}
                </p>
              </div>
            </div>

            {/* Share Link Button */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(true);
                  gameAudio.playChime();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-lg hover:from-amber-300 hover:to-yellow-300 transition flex items-center gap-1.5 active:scale-95"
              >
                <span>🔗</span>
                <span>{isKn ? "ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ" : "Share Link"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Master Interactive Kundli Academy Game */}
        <main className="relative z-10">
          <LearnKundliGame lang={lang} isStandalone={true} />
        </main>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border-2 border-amber-400 p-6 max-w-md w-full shadow-2xl space-y-4 relative text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <div>
                  <div className="text-[9px] font-extrabold text-amber-400 uppercase">॥ ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ ॥</div>
                  <h3 className="font-serif text-base font-black text-white">
                    {isKn ? "ವಿದ್ಯಾರ್ಥಿಗೆ ವೈಯಕ್ತಿಕ ಲಿಂಕ್ ಕಳುಹಿಸಿ" : "Share Personalized Vidyarthi Link"}
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
                  value={shareCustomName}
                  onChange={(e) => setShareCustomName(e.target.value)}
                  placeholder={studentName}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-500/40 bg-slate-950 font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 break-all text-[11px] font-mono text-amber-300">
                {currentShareUrl}
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

      {/* Auspicious Footer */}
      <footer className="mt-8 text-center text-xs text-amber-400/80 font-medium py-3 border-t border-amber-500/20 relative z-10">
        ॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ & ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ · ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ, ಬಗ್ಗೋಣ ॥
      </footer>
    </div>
  );
}
