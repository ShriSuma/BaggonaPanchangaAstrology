import { useState } from "react";
import type { SupportedLanguage } from "../../stores/appStore";
import { pickL5, T_VARAMAHALAKSHMI } from "../../features/varamahalakshmi/varamahalakshmiLocale";
import type { SthiraLagnaMuhurtha } from "../../features/varamahalakshmi/varamahalakshmiTypes";

type Props = {
  muhurthas: SthiraLagnaMuhurtha[];
  sunriseStr: string;
  sunsetStr: string;
  dateStr: string;
  lang: SupportedLanguage;
};

export default function SthiraLagnaMuhurthaCard({
  muhurthas,
  sunriseStr,
  sunsetStr,
  dateStr,
  lang
}: Props): JSX.Element {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const selected = muhurthas[selectedIdx] ?? muhurthas[0]!;

  return (
    <div className="space-y-4">
      {/* Hero Banner explaining Sthira Lagna */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/60 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
              <span>👑</span> {pickL5(T_VARAMAHALAKSHMI.bestSthiraWindow, lang)}
            </div>
            <h3 className="mt-2 font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              {dateStr} • {pickL5(T_VARAMAHALAKSHMI.tabMuhurtha, lang)}
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-amber-900/80 sm:text-sm">
              {pickL5(T_VARAMAHALAKSHMI.whySthiraLagna, lang)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <div className="rounded-xl border border-amber-300/80 bg-white/80 px-3 py-1.5 text-amber-900 shadow-2xs">
              🌅 {lang === "kn" ? "ಸೂರ್ಯೋದಯ" : "Sunrise"}: <strong>{sunriseStr}</strong>
            </div>
            <div className="rounded-xl border border-amber-300/80 bg-white/80 px-3 py-1.5 text-amber-900 shadow-2xs">
              🌇 {lang === "kn" ? "ಸೂರ್ಯಾಸ್ತ" : "Sunset"}: <strong>{sunsetStr}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Lagna Selector Pills */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {muhurthas.map((m, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={m.lagnaName}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                isSelected
                  ? "border-amber-600 bg-amber-700 text-amber-50 shadow-md ring-2 ring-amber-400"
                  : "border-amber-200 bg-white/90 text-amber-950 hover:border-amber-400 hover:bg-amber-50"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? "text-amber-200" : "text-amber-700"
                  }`}
                >
                  {m.isPradosha
                    ? "✨ Pradosha Kaala"
                    : m.isAbhijit
                    ? "☀️ Abhijit Window"
                    : "🏛️ Sthira Lagna"}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSelected ? "bg-amber-800 text-amber-100" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  ★ {m.auspiciousScore}/10
                </span>
              </div>
              <div className="mt-1 font-serif text-base font-bold">
                {pickL5(m.lagnaNameL5, lang)}
              </div>
              <div
                className={`mt-1 font-mono text-xs font-semibold ${
                  isSelected ? "text-amber-100" : "text-amber-800"
                }`}
              >
                ⏰ {m.startTime} – {m.endTime}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed View of Selected Lagna */}
      <div className="rounded-2xl border border-amber-300/80 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
              {lang === "kn" ? "ಆಯ್ದ ಪೂಜಾ ಕಾಲ ವಿವರ" : "Selected Muhurtha Details"}
            </span>
            <h4 className="font-serif text-xl font-bold text-amber-950">
              {pickL5(selected.lagnaNameL5, lang)} ({selected.startTime} – {selected.endTime})
            </h4>
          </div>
          <span className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
            ✓ {lang === "kn" ? "ಅತ್ಯಂತ ಶುಭಕರ" : "Highly Auspicious"}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200/70">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">
              🎯 {lang === "kn" ? "ಈ ಕಾಲದಲ್ಲಿ ಯಾವ ಪೂಜೆ ಮಾಡಬೇಕು?" : "Recommended Pooja Activities"}
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-amber-950">
              {pickL5(selected.bestFor, lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-amber-100 bg-slate-50/70 p-3">
              <span className="font-bold text-slate-700">🌺 {lang === "kn" ? "ಪೂಜಾ ಕ್ರಮ" : "Pooja Sequence"}:</span>
              <p className="mt-0.5 text-slate-600">
                {lang === "kn"
                  ? "ಕಲಶ ಸ್ಥಾಪನೆ → ಅಷ್ಟಲಕ್ಷ್ಮಿ ಆವಾಹನೆ → ದೋರಗ್ರಂಥಿ ಪೂಜೆ → ಮಹಾಮಂಗಳಾರತಿ"
                  : "Kalasha Sthapana → Ashta Lakshmi Invocation → 9-Knot Dora Pooja → Maha Mangalarati"}
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-slate-50/70 p-3">
              <span className="font-bold text-slate-700">💡 {lang === "kn" ? "ಶಾಸ್ತ್ರ ಸೂಕ್ತಿ" : "Scriptural Guidance"}:</span>
              <p className="mt-0.5 text-slate-600">
                {lang === "kn"
                  ? "ರಾಹುಕಾಲವನ್ನು ಹೊರತುಪಡಿಸಿ ಈ ಸ್ಥಿರ ಲಗ್ನ ಕಾಲಾವಧಿಯಲ್ಲಿ ಪೂಜಿಸುವುದು ಶ್ರೇಷ್ಠ."
                  : "Perform the rituals within this window avoiding Rahu Kaala for permanent blessings."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
