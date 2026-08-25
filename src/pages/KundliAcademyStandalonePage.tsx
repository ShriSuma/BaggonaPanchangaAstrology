import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { LearnKundliGame } from "../components/games/LearnKundliGame";
import { decodeAcademyToken, encodeAcademyToken } from "../utils/tokenCipher";
import { gameAudio } from "../utils/gameAudio";

export default function KundliAcademyStandalonePage(): JSX.Element {
  const [studentName, setStudentName] = useState<string>("ವಿದ್ಯಾರ್ಥಿ");
  const [invitedBy, setInvitedBy] = useState<string>("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
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
        setInvitedBy(decoded.invitedBy || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
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
      invitedBy: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
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
      ? `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ (Kundli Academy)!\n\nಆತ್ಮೀಯ ${studentName}, ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳೊಂದಿಗೆ ೧೨ ಮನೆಗಳ ಕುಂಡಲಿ ಫಲಜ್ಯೋತಿಷ್ಯವನ್ನು ಸರಳವಾಗಿ ಕಲಿಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಬಳಸಿ:\n\n👉 ${currentShareUrl}`
      : `🕉️ Baggona Vedic Kundli Academy!\n\nDear ${studentName}, master the 12 houses of Janma Kundali with Dr. B.V. Raman's classical Vedic rules using this interactive link:\n\n👉 ${currentShareUrl}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/60 text-slate-900 flex flex-col justify-between p-3 sm:p-6 select-text">
      <div className="mx-auto max-w-5xl w-full space-y-6">
        {/* Dedicated Standalone Temple Header */}
        <header className="rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-amber-900 via-amber-950 to-orange-950 p-5 sm:p-6 text-amber-50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 font-black flex items-center justify-center text-3xl shadow-lg border-2 border-amber-200 select-none">
                🕉️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-300 bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ ॥
                  </span>
                  <span className="text-[10px] bg-emerald-800 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/40">
                    ✨ {isKn ? "ವೈಯಕ್ತಿಕ ಕಲಿಕಾ ತಾಣ" : "Personalized Learning Sanctuary"}
                  </span>
                </div>

                <h1 className="font-serif text-lg sm:text-2xl font-black text-amber-100 tracking-tight">
                  {isKn ? `ಸ್ವಾಗತ, ${studentName}!` : `Welcome, ${studentName}!`}
                </h1>

                <p className="text-xs text-amber-200/90 font-medium">
                  {isKn
                    ? `ಮಾರ್ಗದರ್ಶನ: ${invitedBy} · ಡಾ. ಬಿ.ವಿ. ರಾಮನ್ ಅವರ ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಪ್ರಕಾರ ಕುಂಡಲಿ ಕಲಿಕೆ.`
                    : `Mentored by: ${invitedBy} · Classical Vedic astrology based on Dr. B.V. Raman's foundational rules.`}
                </p>
              </div>
            </div>

            {/* Language Toggle & Share Link Button */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setLang(isKn ? "en" : "kn")}
                className="px-3 py-1.5 rounded-xl border border-amber-400/60 bg-amber-900/80 text-amber-100 font-bold text-xs hover:bg-amber-800 shadow-xs transition"
              >
                🌐 {isKn ? "English" : "ಕನ್ನಡ"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowShareModal(true);
                  gameAudio.playChime();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-xs shadow-lg hover:from-amber-300 hover:to-yellow-300 transition flex items-center gap-1.5 active:scale-95"
              >
                <span>🔗</span>
                <span>{isKn ? "ಲಿಂಕ್ ಹಂಚಿಕೊಳ್ಳಿ" : "Share Link"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Master Interactive Kundli Academy */}
        <main className="relative z-10">
          <LearnKundliGame lang={lang} />
        </main>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-amber-400 p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                <h3 className="font-serif text-base font-black text-amber-950">
                  {isKn ? "ವಿದ್ಯಾರ್ಥಿಗೆ ವೈಯಕ್ತಿಕ ಲಿಂಕ್ ಕಳುಹಿಸಿ" : "Share Personalized Student Link"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center hover:bg-amber-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  👤 {isKn ? "ವಿದ್ಯಾರ್ಥಿ / ಭಕ್ತರ ಹೆಸರು:" : "Student / Devotee Name:"}
                </label>
                <input
                  type="text"
                  value={shareCustomName}
                  onChange={(e) => setShareCustomName(e.target.value)}
                  placeholder={studentName}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/50 font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 break-all text-[11px] font-mono text-amber-900">
                {currentShareUrl}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 rounded-xl bg-amber-900 text-amber-50 font-bold shadow hover:bg-black transition flex items-center justify-center gap-1.5"
                >
                  <span>{copied ? "✅" : "📋"}</span>
                  <span>{copied ? (isKn ? "ಕಾಪಿ ಆಯಿತು!" : "Copied!") : (isKn ? "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ" : "Copy Link")}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                >
                  <span>💬</span>
                  <span>{isKn ? "WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ" : "Share WhatsApp"}</span>
                </button>
              </div>

              <p className="text-[10px] text-amber-800/80 text-center font-medium">
                🔒 {isKn
                  ? "ಈ ಲಿಂಕ್ ತೆರೆದಾಗ ವಿದ್ಯಾರ್ಥಿಯು ಕೇವಲ ಕುಂಡಲಿ ಕಲಿಕಾ ತಾಣವನ್ನು ಮಾತ್ರ ವೀಕ್ಷಿಸಬಹುದು. ಇತರ ಯಾವುದೇ ಪುಟಗಳಿಗೆ ಪ್ರವೇಶವಿರುವುದಿಲ್ಲ."
                  : "Recipients of this secure link can exclusively access the Kundli Academy without logging in."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Auspicious Footer */}
      <footer className="mt-8 text-center text-xs text-amber-900/70 font-medium py-3 border-t border-amber-200/60">
        ॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ & ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ · ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ ॥
      </footer>
    </div>
  );
}
