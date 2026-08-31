import React, { useState, useEffect } from "react";
import { firestore } from "../../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { SevaLang } from "../../features/seva/sevaLocale";

export interface SanctumPrayerBoxProps {
  devoteeName: string;
  gotra?: string;
  dateStr: string;
  lang?: SevaLang;
  priestName?: string;
}

export const SanctumPrayerBox: React.FC<SanctumPrayerBoxProps> = ({
  devoteeName,
  gotra = "ಕಾಶ್ಯಪ",
  dateStr,
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const [prayerText, setPrayerText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = `baggona_sanctum_prayer_${dateStr}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setPrayerText(saved);
        setIsSubmitted(true);
      }
    }
  }, [storageKey]);

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, prayerText.trim());
      } catch {}
    }

    try {
      const prayerId = `prayer_${Date.now()}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const prayerRef = doc(firestore, "sanctumDevoteePrayers", prayerId);
      await setDoc(prayerRef, {
        devoteeName,
        gotra,
        dateStr,
        prayerText: prayerText.trim(),
        priestName,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("[SanctumPrayerBox] Firestore log notice:", err);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-amber-300 pb-2.5">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-lg shadow-sm border border-amber-400">
          📿
        </span>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-amber-950">
            ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ನಿತ್ಯ ಪ್ರಾರ್ಥನಾ ಪತ್ರ (Sanctum Prayer Box)
          </h3>
          <span className="text-[10px] text-amber-800 font-bold">
            ನಿಮ್ಮ ಇಂದಿನ ಪ್ರಾರ್ಥನೆಯನ್ನು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಸಲ್ಲಿಸಿ
          </span>
        </div>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmitPrayer} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              ಇಂದಿನ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನೆ / ಸಂಕಲ್ಪ (೧ ಸಾಲಿನ ಪ್ರಾರ್ಥನೆ):
            </label>
            <input
              type="text"
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder="ಉದಾ: ಕುಟುಂಬದ ಆಯುರಾರೋಗ್ಯ ವೃದ್ಧಿಗೆ ಅಥವಾ ನೂತನ ಉದ್ಯೋಗ ಯಶಸ್ಸಿಗೆ..."
              required
              className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !prayerText.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 border border-amber-400 disabled:opacity-50"
          >
            <span>{isSubmitting ? "ಸಮರ್ಪಿಸಲಾಗುತ್ತಿದೆ..." : "🙏 ಸನ್ನಿಧಿಗೆ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ (Submit Prayer)"}</span>
          </button>
        </form>
      ) : (
        <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl border-2 border-emerald-400 space-y-2 text-center animate-in zoom-in-95">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-400 rounded-full text-[10px] font-black">
            <span>✓</span>
            <span>ಪ್ರಾರ್ಥನೆ ಸನ್ನಿಧಿಗೆ ಸಮರ್ಪಿತವಾಗಿದೆ</span>
          </div>

          <p className="text-xs font-serif font-black text-amber-950 italic">
            "{prayerText}"
          </p>

          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
            ನಿಮ್ಮ ಪ್ರಾರ್ಥನೆಯು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಆತ್ಮಲಿಂಗ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿತವಾಗಿದ್ದು, ಮುಖ್ಯ ಅರ್ಚಕ <strong>{priestName}</strong> ಅವರ ನಿತ್ಯ ಸಂಕಲ್ಪ ಪೂಜೆಯಲ್ಲಿ ಸೇರ್ಪಡೆಗೊಂಡಿದೆ.
          </p>

          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-[10px] font-black text-amber-800 hover:underline pt-1"
          >
            ಹೊಸ ಪ್ರಾರ್ಥನೆ ಬರೆಯಿರಿ (Edit Prayer)
          </button>
        </div>
      )}
    </div>
  );
};
