import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { KundliGurukulaContent } from "../components/kundli/KundliGurukulaContent";

export const KundliGurukulaPage: React.FC = () => {
  const { i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabel = useAppStore((s) => s.placeLabel);

  const session = useKundliViewerStore((s) => s.session);

  // Local state for active Kundli calculation
  const [kundli, setKundli] = useState<KundliOutput | null>(session?.result ?? null);
  const [nativeName, setNativeName] = useState<string>(session?.input?.name || "ಜಾತಕರು");
  const [birthDate, setBirthDate] = useState<string>(session?.birthDateYmd || "");
  const [birthTime, setBirthTime] = useState<string>(session?.birthTimeHm || "");
  const [gender, setGender] = useState<string | undefined>(session?.input?.gender);

  // Synchronize when store session updates
  useEffect(() => {
    if (session?.result) {
      setKundli(session.result);
      setNativeName(session.input?.name || "ಜಾತಕರು");
      setBirthDate(session.birthDateYmd || session.input?.birthDate || "");
      setBirthTime(session.birthTimeHm || session.input?.birthTime || "");
      setGender(session.input?.gender);
    }
  }, [session]);

  // Fallback: If no session exists in Zustand store, attempt to load from localStorage or compute default
  useEffect(() => {
    if (!kundli && typeof window !== "undefined") {
      try {
        const storedStr =
          localStorage.getItem("baggona_gurukula_active_kundli") ||
          localStorage.getItem("baggona_kundli_session") ||
          localStorage.getItem("baggona_priest_kundli_active_session");

        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          const input: KundliInput = {
            name: parsed.name || "ಜಾತಕರು",
            birthDate: parsed.birthDate || "1990-01-01",
            birthTime: parsed.birthTime || "10:30",
            latitude: parsed.latitude || defaultLat || 14.2884,
            longitude: parsed.longitude || defaultLng || 74.4439,
            gender: (parsed.gender === "female" || parsed.gender === "Female") ? "Female" : "Male"
          };
          calculateKundliWithPlaceSun(input, { ayanamsaModel: "lahiri" })
            .then((calc) => {
              setKundli(calc);
              setNativeName(input.name);
              setBirthDate(input.birthDate);
              setBirthTime(input.birthTime);
              setGender(input.gender);
            })
            .catch((e) => console.warn("Failed calculating stored kundli:", e));
          return;
        }
      } catch (err) {
        console.warn("Could not load stored session for Gurukula page:", err);
      }

      // Default baseline horoscope (Kumta, Karnataka)
      const fallbackInput: KundliInput = {
        name: "ಜಾತಕರು",
        birthDate: "1995-05-15",
        birthTime: "07:30",
        latitude: defaultLat || 14.2884,
        longitude: defaultLng || 74.4439,
        gender: "Male"
      };
      calculateKundliWithPlaceSun(fallbackInput, { ayanamsaModel: "lahiri" })
        .then((fallbackCalc) => {
          setKundli(fallbackCalc);
          setNativeName(fallbackInput.name);
          setBirthDate(fallbackInput.birthDate);
          setBirthTime(fallbackInput.birthTime);
          setGender(fallbackInput.gender);
        })
        .catch((e) => console.warn("Failed calculating fallback kundli:", e));
    }
  }, [kundli, defaultLat, defaultLng, placeLabel]);

  // Scroll to top on page mount & ensure document body overflow is restored
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, []);

  const handleBackToKundli = () => {
    // If router history exists, go back, else switch page to 'kundli'
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/gurukula")) {
      window.location.href = "/#kundli";
    } else {
      setPage("kundli");
    }
  };

  const isKn = i18n.language.startsWith("kn");
  const displayDevoteeName = (isKn && (nativeName === "Devotee" || !nativeName)) ? "ಜಾತಕರು" : nativeName;

  if (!kundli) {
    return (
      <div className="min-h-screen bg-[#faf6ee] flex items-center justify-center text-amber-950 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-sm text-stone-700">
            {isKn ? "ಕುಂಡಲಿ ವಾಚನ ಗುರು ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "Loading Kundli Gurukula Masterclass..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950 overflow-x-hidden">
      
      {/* Top Breadcrumb & Return Ribbon */}
      <div className="bg-[#fffdfa] border-b-2 border-[#d4af37]/40 px-4 md:px-8 py-2.5 flex items-center justify-between text-xs font-bold shadow-sm">
        <button
          type="button"
          onClick={handleBackToKundli}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-amber-100 via-[#fff8e7] to-amber-200 text-amber-950 font-black hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <span>←</span>
          <span>{isKn ? "ಕುಂಡಲಿ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Kundli"}</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-stone-600 text-xs">
          <span>🏛️</span>
          <span>{isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಗುರುಕುಲ" : "Baggona Panchanga Astrology Gurukula"}</span>
        </div>

        <div className="flex items-center gap-2 text-stone-700 text-xs font-bold">
          <span className="hidden md:inline">{isKn ? "ಜಾತಕರು:" : "Devotee:"}</span>
          <span className="text-amber-950 font-black">{displayDevoteeName}</span>
        </div>
      </div>

      {/* Main Gurukula Full-Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="rounded-3xl border-2 border-[#d4af37] bg-[#fffdfa] shadow-xl overflow-visible">
          <KundliGurukulaContent
            kundli={kundli}
            birthDate={birthDate}
            birthTime={birthTime}
            nativeName={displayDevoteeName}
            gender={gender}
            isStandalonePage={true}
            onBack={handleBackToKundli}
          />
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="mt-8 border-t-2 border-[#d4af37]/40 bg-[#fffdfa] py-6 px-4 text-center text-xs text-stone-600">
        <div className="max-w-3xl mx-auto space-y-1">
          <p className="font-bold text-amber-950">
            {isKn
              ? "॥ ಶ್ರೀ ಜಗನ್ಮಾತಾ ಭುವನೇಶ್ವರಿ ಪ್ರಸನ್ನ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ದೈವಜ್ಞ ಶಿಕ್ಷಣ ಪದ್ಧತಿ ॥"
              : "Baggona Panchanga Kundli Gurukula Masterclass • Chief Priest Shreeram Pandit Tradition"}
          </p>
          <p className="text-[11px] text-stone-500">
            {isKn
              ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ, ಪಂಚಾಂಗ ೫ ಅಂಗಗಳು, ನವತಾರಾ ಚಕ್ರ, ೧೦ ಉಪಗ್ರಹಗಳು ಹಾಗೂ ಗೋಚಾರ ಸಮನ್ವಯ."
              : "Authentic Parashari Hora Shastra, 5 Angas, Navatara Chakra, 10 Upagrahas & Gochara Transits."}
          </p>
        </div>
      </footer>

    </div>
  );
};

export default KundliGurukulaPage;
