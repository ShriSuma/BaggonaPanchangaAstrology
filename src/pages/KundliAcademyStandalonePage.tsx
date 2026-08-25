import React, { useEffect, useState } from "react";
import { LearnKundliGame } from "../components/games/LearnKundliGame";
import { decodeAcademyToken } from "../utils/tokenCipher";

export default function KundliAcademyStandalonePage(): JSX.Element {
  const [studentName, setStudentName] = useState<string>("ವಿದ್ಯಾರ್ಥಿ");
  const [invitedBy, setInvitedBy] = useState<string>("ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)");
  const [lang, setLang] = useState<string>("kn");
  const [tokenDecoded, setTokenDecoded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Strict Sandbox Guard: Intercept any attempt to break out or tamper with history
    const handlePopState = () => {
      if (!window.location.pathname.startsWith("/academy") && !window.location.pathname.startsWith("/learnkundli")) {
        window.history.pushState(null, "", "/academy");
      }
    };
    window.addEventListener("popstate", handlePopState);

    // Prevent external click escapes
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (anchor && anchor.href && !anchor.href.includes("/academy")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", handleGlobalClick, true);

    const params = new URLSearchParams(window.location.search);
    const token = params.get("academyToken") || params.get("token");

    if (token) {
      const decoded = decodeAcademyToken(token);
      if (decoded) {
        setStudentName(decoded.name || "ವಿದ್ಯಾರ್ಥಿ");
        setInvitedBy(decoded.invitedBy || "ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಗುರೂಜಿ)");
        setLang(decoded.lang || "kn");
        setTokenDecoded(true);
        return () => {
          window.removeEventListener("popstate", handlePopState);
          document.removeEventListener("click", handleGlobalClick, true);
        };
      }
    }

    // Direct query param fallbacks
    const rawName = params.get("name") || params.get("n");
    if (rawName) setStudentName(rawName);

    const rawLang = params.get("lang") || params.get("l");
    if (rawLang) setLang(rawLang);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, []);

  const isKn = lang.slice(0, 2) === "kn";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 select-none relative overflow-x-hidden font-sans">
      {/* Background Cosmic Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl w-full space-y-5 relative z-10">
        {/* Dedicated Standalone Temple Gurukula Header (NO share buttons for Vidyarthis) */}
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
                  <span className="text-[10px] bg-slate-900 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    🔒 {isKn ? "ಸುರಕ್ಷಿತ ದೀಕ್ಷಾ ತಾಣ" : "Secured Sanctuary"}
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

            {/* Language Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setLang(isKn ? "en" : "kn")}
                className="px-3.5 py-1.5 rounded-xl border border-amber-400/60 bg-amber-900/80 text-amber-100 font-bold text-xs hover:bg-amber-800 shadow-xs transition"
              >
                🌐 {isKn ? "English" : "ಕನ್ನಡ"}
              </button>
            </div>
          </div>
        </header>

        {/* Master Interactive Kundli Academy Game with Auto-Resume State */}
        <main className="relative z-10">
          <LearnKundliGame lang={lang} isStandalone={true} />
        </main>
      </div>

      {/* Auspicious Footer */}
      <footer className="mt-8 text-center text-xs text-amber-400/80 font-medium py-3 border-t border-amber-500/20 relative z-10">
        ॥ ಶ್ರೀ ಶಾಂತಿಕಾಪರಮೇಶ್ವರೀ & ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ · ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಗುರುಕುಲ, ಬಗ್ಗೋಣ ॥
      </footer>
    </div>
  );
}
