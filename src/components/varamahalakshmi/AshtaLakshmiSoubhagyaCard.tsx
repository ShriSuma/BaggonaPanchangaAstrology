import { useState } from "react";
import type { SupportedLanguage } from "../../stores/appStore";
import { pickL5 } from "../../features/varamahalakshmi/varamahalakshmiLocale";
import type { PersonalizedVaramahalakshmiAnalysis } from "../../features/varamahalakshmi/varamahalakshmiTypes";

type Props = {
  analysis: PersonalizedVaramahalakshmiAnalysis;
  lang: SupportedLanguage;
};

export default function AshtaLakshmiSoubhagyaCard({ analysis, lang }: Props): JSX.Element {
  const { ashtaLakshmi } = analysis;
  const [copiedStotra, setCopiedStotra] = useState(false);

  const handleCopyStotra = async () => {
    const text = `${pickL5(ashtaLakshmi.nameL5, lang)}\n${pickL5(ashtaLakshmi.stotraL5, lang)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStotra(true);
      setTimeout(() => setCopiedStotra(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-4">
      {/* Royal Ashta Lakshmi Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-50 via-amber-100/40 to-orange-50 p-5 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-3xl shadow-inner text-amber-50">
              {ashtaLakshmi.icon}
            </div>
            <div>
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-amber-700">
                {lang === "kn"
                  ? `${analysis.nakshatraName} ನಕ್ಷತ್ರದ ಅಧಿದೇವತೆ`
                  : `Guardian Deity of ${analysis.nakshatraName}`}
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-950">
                {pickL5(ashtaLakshmi.nameL5, lang)}
              </h3>
              <p className="text-xs font-semibold text-amber-800">
                {analysis.personName} • {analysis.gotra}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-300 bg-white/90 px-4 py-2 text-center shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {lang === "kn" ? "ಶುಕ್ರ & ಧನ ಬಲ" : "Venus & Wealth Score"}
            </div>
            <div className="font-serif text-xl font-extrabold text-emerald-700">
              {analysis.venusStrengthScore}% <span className="text-xs font-sans text-amber-900">★ ಶುಭ</span>
            </div>
          </div>
        </div>

        {/* Description & Blessings */}
        <div className="mt-4 space-y-2 rounded-xl bg-white/80 p-4 border border-amber-200/60 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-amber-950 font-medium">
            {pickL5(ashtaLakshmi.descriptionL5, lang)}
          </p>
          <div className="flex items-start gap-2 pt-2 border-t border-amber-100 text-xs font-semibold text-amber-900">
            <span className="text-emerald-700 text-sm">✦</span>
            <span>{pickL5(ashtaLakshmi.blessingL5, lang)}</span>
          </div>
        </div>

        {/* Auspicious Offerings Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              👗 {lang === "kn" ? "ಶುಭ ಸೀರೆ ಬಣ್ಣ" : "Lucky Saree Color"}
            </div>
            <div className="mt-1 font-serif text-sm font-bold text-amber-950">
              {pickL5(ashtaLakshmi.recommendedSareeColorL5, lang)}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              🌺 {lang === "kn" ? "ದೇವಿಗೆ ಪ್ರಿಯ ಪುಷ್ಪ" : "Auspicious Flowers"}
            </div>
            <div className="mt-1 font-serif text-sm font-bold text-amber-950">
              {pickL5(ashtaLakshmi.recommendedFlowerL5, lang)}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              🍯 {lang === "kn" ? "ವಿಶೇಷ ನೈವೇದ್ಯ" : "Favorite Naivedya"}
            </div>
            <div className="mt-1 font-serif text-sm font-bold text-amber-950">
              {pickL5(ashtaLakshmi.specialNaivedyaL5, lang)}
            </div>
          </div>
        </div>

        {/* Sacred Chanting Box */}
        <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 p-4 text-amber-50 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              ॥ ಸಿದ್ಧ ಅಷ್ಟಲಕ್ಷ್ಮೀ ಸ್ತೋತ್ರಮ್ ॥
            </span>
            <button
              type="button"
              onClick={() => void handleCopyStotra()}
              className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition"
            >
              {copiedStotra ? "✓ Copied" : "📋 Copy Shloka"}
            </button>
          </div>
          <p className="mt-2 text-sm sm:text-base font-serif italic leading-relaxed text-amber-100 text-center">
            {pickL5(ashtaLakshmi.stotraL5, lang)}
          </p>
        </div>
      </div>

      {/* Planetary Wealth Analysis Note */}
      <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
        <h4 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
          <span>✨</span> {lang === "kn" ? "ಶುಕ್ರ & ಧನಸ್ಥಾನ ಜ್ಯೋತಿಷ್ಯ ಫಲ" : "Astrological Wealth & Soubhagya Insights"}
        </h4>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {pickL5(analysis.venusPlacementSummaryL5, lang)}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {pickL5(analysis.dhanaHouseSummaryL5, lang)}
        </p>
      </div>
    </div>
  );
}
