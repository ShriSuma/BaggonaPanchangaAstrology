import React from "react";
import type { VivahaMelameliResult } from "../../features/melameli/vivahaMelameliEngine";
import type { MelameliLanguage } from "../../features/melameli/vivahaMelameliLocale";
import { getMelameliText } from "../../features/melameli/vivahaMelameliLocale";
import { PlanetName } from "../../core/AstroTypes";

interface Props {
  melameliResult: VivahaMelameliResult;
  selectedLang?: MelameliLanguage;
  boyName?: string;
  girlName?: string;
  boyBirthDate?: string;
  boyBirthTime?: string;
  girlBirthDate?: string;
  girlBirthTime?: string;
  placeLabel?: string;
}

export default function VivahaMelameliPdfTemplate({
  melameliResult,
  selectedLang = "kn",
  boyName = "ವರ (Groom)",
  girlName = "ವಧು (Bride)",
  boyBirthDate = "",
  boyBirthTime = "",
  girlBirthDate = "",
  girlBirthTime = "",
  placeLabel = "Gokarna, Karnataka"
}: Props): JSX.Element {
  const {
    boyKundli,
    girlKundli,
    totalScore,
    maxScore,
    percentage,
    band,
    verdictText,
    ashtaKuta,
    dashaKutaAdditions,
    kujaDosha,
    papaSamya,
    dashaSandhi,
    gokarnaSevas
  } = melameliResult;

  const bMoon = boyKundli.planets.find((p) => p.name === PlanetName.Moon);
  const gMoon = girlKundli.planets.find((p) => p.name === PlanetName.Moon);

  const bPada = bMoon ? Math.floor(((bMoon.degree % (360 / 27)) / (360 / 108))) + 1 : 1;
  const gPada = gMoon ? Math.floor(((gMoon.degree % (360 / 27)) / (360 / 108))) + 1 : 1;

  const getScoreBadgeColor = (status: string) => {
    switch (status) {
      case "auspicious":
      case "cancelled":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "moderate":
        return "bg-amber-100 text-amber-900 border-amber-300";
      default:
        return "bg-rose-100 text-rose-900 border-rose-300";
    }
  };

  return (
    <div
      id="vivaha-melameli-pdf-root"
      className="w-[794px] bg-[#fcfaf5] text-slate-900 font-serif leading-relaxed"
      style={{ boxSizing: "border-box" }}
    >
      {/* ------------------- PAGE 1: AUSPICIOUS HOROSCOPE PROFILE & TOTAL SCORE ------------------- */}
      <div
        className="pdf-page w-[794px] min-h-[1123px] h-[1123px] p-8 flex flex-col justify-between relative bg-gradient-to-b from-[#fdfbf7] via-[#fffdf9] to-[#faf6ed] border-b-2 border-amber-300"
        style={{ boxSizing: "border-box", pageBreakAfter: "always" }}
      >
        {/* Top Gold Border Accent */}
        <div className="border-4 border-amber-600/60 p-6 rounded-2xl h-full flex flex-col justify-between bg-white/70 shadow-sm">
          {/* Header */}
          <div className="text-center border-b-2 border-amber-400 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🪔</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                ॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ ॥
              </span>
              <span className="text-xl">🪔</span>
            </div>
            <h1 className="text-2xl font-extrabold text-amber-950 tracking-tight">
              {getMelameliText("pageTitle", selectedLang)}
            </h1>
            <p className="text-[11px] text-amber-900/80 mt-1 italic">
              {getMelameliText("loaderShloka", selectedLang)}
            </p>
          </div>

          {/* Boy & Girl Comparative Profile Table */}
          <div className="my-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <span>💞</span> {selectedLang === "kn" ? "ವರ ಮತ್ತು ವಧುವಿನ ಜಾತಕ ವಿವರಗಳು" : "Groom & Bride Astrological Profiles"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Boy Card */}
              <div className="border-2 border-indigo-200 rounded-xl p-3.5 bg-gradient-to-br from-indigo-50/70 to-blue-50/40">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-1.5 mb-2">
                  <span className="font-bold text-xs text-indigo-950 flex items-center gap-1">
                    <span>🤵</span> {boyName}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
                    {selectedLang === "kn" ? "ವರ (Groom)" : "Groom"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ದಿನಾಂಕ:" : "Birth Date:"}</div>
                  <div className="font-bold text-slate-900">{boyBirthDate || "—"}</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ಸಮಯ:" : "Birth Time:"}</div>
                  <div className="font-bold text-slate-900">{boyBirthTime || "—"}</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಲಗ್ನ ರಾಶಿ:" : "Lagna:"}</div>
                  <div className="font-bold text-amber-900">{boyKundli.lagnaRashi.sanskrit} ({boyKundli.lagnaRashi.english})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಚಂದ್ರ ರಾಶಿ:" : "Moon Sign:"}</div>
                  <div className="font-bold text-indigo-950">{bMoon?.rashi.sanskrit} ({bMoon?.rashi.english})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Nakshatra:"}</div>
                  <div className="font-bold text-indigo-950">{bMoon?.nakshatra.sanskrit} (ಪಾದ {bPada})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಪ್ರಸ್ತುತ ದಶಾ:" : "Current Dasha:"}</div>
                  <div className="font-bold text-emerald-800">{dashaSandhi.boyCurrentDasha} ({dashaSandhi.boyRemainingYears} yrs)</div>
                </div>
              </div>

              {/* Girl Card */}
              <div className="border-2 border-rose-200 rounded-xl p-3.5 bg-gradient-to-br from-rose-50/70 to-pink-50/40">
                <div className="flex items-center justify-between border-b border-rose-200 pb-1.5 mb-2">
                  <span className="font-bold text-xs text-rose-950 flex items-center gap-1">
                    <span>👰</span> {girlName}
                  </span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                    {selectedLang === "kn" ? "ವಧು (Bride)" : "Bride"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ದಿನಾಂಕ:" : "Birth Date:"}</div>
                  <div className="font-bold text-slate-900">{girlBirthDate || "—"}</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ಸಮಯ:" : "Birth Time:"}</div>
                  <div className="font-bold text-slate-900">{girlBirthTime || "—"}</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಲಗ್ನ ರಾಶಿ:" : "Lagna:"}</div>
                  <div className="font-bold text-amber-900">{girlKundli.lagnaRashi.sanskrit} ({girlKundli.lagnaRashi.english})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಚಂದ್ರ ರಾಶಿ:" : "Moon Sign:"}</div>
                  <div className="font-bold text-rose-950">{gMoon?.rashi.sanskrit} ({gMoon?.rashi.english})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಜನ್ಮ ನಕ್ಷತ್ರ:" : "Nakshatra:"}</div>
                  <div className="font-bold text-rose-950">{gMoon?.nakshatra.sanskrit} (ಪಾದ {gPada})</div>
                  <div className="text-slate-600">{selectedLang === "kn" ? "ಪ್ರಸ್ತುತ ದಶಾ:" : "Current Dasha:"}</div>
                  <div className="font-bold text-emerald-800">{dashaSandhi.girlCurrentDasha} ({dashaSandhi.girlRemainingYears} yrs)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Compatibility Score Box */}
          <div className="my-2 p-5 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-500/10 text-center shadow-inner">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-900">
              {getMelameliText("scoreLabel", selectedLang)}
            </span>
            <div className="my-2 flex items-center justify-center gap-3">
              <span className="text-4xl font-extrabold text-amber-950 tracking-tight">
                {totalScore} / {maxScore}
              </span>
              <span className="text-sm font-bold bg-amber-600 text-white px-3 py-1 rounded-full shadow-sm">
                {percentage}%
              </span>
            </div>
            <div className="mt-1 font-bold text-sm text-emerald-900">
              {band === "excellent"
                ? getMelameliText("verdictExcellent", selectedLang)
                : band === "good"
                ? getMelameliText("verdictGood", selectedLang)
                : band === "average"
                ? getMelameliText("verdictAverage", selectedLang)
                : getMelameliText("verdictInauspicious", selectedLang)}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-700 max-w-xl mx-auto italic">
              "{verdictText[selectedLang]}"
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50">
              <span className="font-bold text-slate-600 block">ನಾಡಿ ಹೊಂದಾಣಿಕೆ</span>
              <span className="font-extrabold text-emerald-800 text-xs">
                {ashtaKuta.find((k) => k.id === "nadi")?.score}/8 Pts
              </span>
            </div>
            <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50">
              <span className="font-bold text-slate-600 block">ಭಕೂಟ ಹೊಂದಾಣಿಕೆ</span>
              <span className="font-extrabold text-emerald-800 text-xs">
                {ashtaKuta.find((k) => k.id === "bhakoot")?.score}/7 Pts
              </span>
            </div>
            <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50">
              <span className="font-bold text-slate-600 block">ಕುಜ (ಮಾಂಗ್ಲಿಕ್)</span>
              <span className="font-extrabold text-indigo-900 text-xs">
                {kujaDosha.mutualKujaBalance ? "ನಿರ್ದೋಷ (Safe)" : "ಶಾಂತಿ ಅಗತ್ಯ"}
              </span>
            </div>
            <div className="border border-amber-200 rounded-lg p-2 bg-amber-50/50">
              <span className="font-bold text-slate-600 block">ದಶಾ ಸಂಧಿ</span>
              <span className="font-extrabold text-emerald-800 text-xs">
                {dashaSandhi.hasDashaSandhi ? "ದೋಷವಿದೆ" : "ಶುಭಕರ"}
              </span>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="border-t border-amber-300 pt-2 flex items-center justify-between text-[10px] text-amber-950 font-semibold">
            <span>{placeLabel}</span>
            <span>{getMelameliText("priestContact", selectedLang)}</span>
            <span>ಪುಟ ೧ / ೩</span>
          </div>
        </div>
      </div>

      {/* ------------------- PAGE 2: ASHTA KUTA & DASHAKOOTA DETAILED BREAKDOWN ------------------- */}
      <div
        className="pdf-page w-[794px] min-h-[1123px] h-[1123px] p-8 flex flex-col justify-between relative bg-gradient-to-b from-[#fdfbf7] via-[#fffdf9] to-[#faf6ed] border-b-2 border-amber-300"
        style={{ boxSizing: "border-box", pageBreakAfter: "always" }}
      >
        <div className="border-4 border-amber-600/60 p-6 rounded-2xl h-full flex flex-col justify-between bg-white/70 shadow-sm">
          {/* Section Header */}
          <div className="border-b-2 border-amber-400 pb-2 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
              <span>🔱</span> {getMelameliText("tabAshtakoota", selectedLang)}
            </h2>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
              36 Points Classical Evaluation
            </span>
          </div>

          {/* Ashta Kuta Breakdown Table */}
          <div className="my-2 overflow-hidden rounded-xl border border-amber-300 bg-white shadow-xs">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-amber-100/80 text-amber-950 font-bold border-b border-amber-300">
                <tr>
                  <th className="py-2 px-3">ಕೂಟ (Kuta Name)</th>
                  <th className="py-2 px-3 text-center">ಗರಿಷ್ಠ (Max)</th>
                  <th className="py-2 px-3 text-center">ಗಳಿಕೆ (Score)</th>
                  <th className="py-2 px-3">ವಿವರಣೆ ಮತ್ತು ಫಲ (Significance & Effect)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {ashtaKuta.map((kuta) => (
                  <tr key={kuta.id} className="hover:bg-amber-50/50">
                    <td className="py-2 px-3 font-bold text-amber-950">
                      {kuta.name[selectedLang]}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-500">
                      {kuta.maxScore}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-extrabold border ${getScoreBadgeColor(kuta.status)}`}>
                        {kuta.score}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800 text-[10px] leading-snug">
                      <p>{kuta.description[selectedLang]}</p>
                      {kuta.cancellationNote && (
                        <p className="mt-0.5 text-emerald-800 font-bold">
                          ✨ {kuta.cancellationNote[selectedLang]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* South Indian Dashakoota & Rajju / Vedha Cards */}
          <div className="my-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <span>🌟</span> {getMelameliText("tabDashakoota", selectedLang)} (South Indian Baggona Kootas)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Mahendra */}
              <div className="border border-amber-200 rounded-xl p-2.5 bg-amber-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-950">
                    {dashaKutaAdditions.mahendra.name[selectedLang]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getScoreBadgeColor(dashaKutaAdditions.mahendra.status)}`}>
                    {dashaKutaAdditions.mahendra.score === 1 ? "ಶುಭ (Auspicious)" : "ಮಧ್ಯಮ"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {dashaKutaAdditions.mahendra.description[selectedLang]}
                </p>
              </div>

              {/* Stree Deergha */}
              <div className="border border-amber-200 rounded-xl p-2.5 bg-amber-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-950">
                    {dashaKutaAdditions.streeDeergha.name[selectedLang]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getScoreBadgeColor(dashaKutaAdditions.streeDeergha.status)}`}>
                    {dashaKutaAdditions.streeDeergha.score === 1 ? "ಶುಭ (Auspicious)" : "ಸಾಮಾನ್ಯ"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {dashaKutaAdditions.streeDeergha.description[selectedLang]}
                </p>
              </div>

              {/* Rajju */}
              <div className="border border-amber-200 rounded-xl p-2.5 bg-amber-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-950">
                    {dashaKutaAdditions.rajju.name[selectedLang]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getScoreBadgeColor(dashaKutaAdditions.rajju.status)}`}>
                    {dashaKutaAdditions.rajju.score === 1 ? "ನಿರ್ದೋಷ" : "ರಜ್ಜು ದೋಷ"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {dashaKutaAdditions.rajju.description[selectedLang]}
                </p>
              </div>

              {/* Vedha */}
              <div className="border border-amber-200 rounded-xl p-2.5 bg-amber-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-amber-950">
                    {dashaKutaAdditions.vedha.name[selectedLang]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getScoreBadgeColor(dashaKutaAdditions.vedha.status)}`}>
                    {dashaKutaAdditions.vedha.score === 1 ? "ವೇಧ ರಹಿತ (ಶುಭ)" : "ವೇಧ ದೋಷ"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {dashaKutaAdditions.vedha.description[selectedLang]}
                </p>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="border-t border-amber-300 pt-2 flex items-center justify-between text-[10px] text-amber-950 font-semibold">
            <span>ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ</span>
            <span>{getMelameliText("priestContact", selectedLang)}</span>
            <span>ಪುಟ ೨ / ೩</span>
          </div>
        </div>
      </div>

      {/* ------------------- PAGE 3: KUJA DOSHA, PAPA SAMYA & GOKARNA SEVAS ------------------- */}
      <div
        className="pdf-page w-[794px] min-h-[1123px] h-[1123px] p-8 flex flex-col justify-between relative bg-gradient-to-b from-[#fdfbf7] via-[#fffdf9] to-[#faf6ed]"
        style={{ boxSizing: "border-box" }}
      >
        <div className="border-4 border-amber-600/60 p-6 rounded-2xl h-full flex flex-col justify-between bg-white/70 shadow-sm">
          {/* Section Header */}
          <div className="border-b-2 border-amber-400 pb-2 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
              <span>🛡️</span> {getMelameliText("tabKujaAndPapa", selectedLang)}
            </h2>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
              Lagna, Moon & Venus Analysis
            </span>
          </div>

          {/* Kuja Dosha Side-by-Side Analysis */}
          <div className="my-2 grid grid-cols-2 gap-3">
            <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50/40">
              <h4 className="font-bold text-xs text-indigo-950 mb-1.5 flex items-center justify-between">
                <span>🤵 {selectedLang === "kn" ? "ವರನ ಕುಜ ದೋಷ ಸ್ಥಿತಿ" : "Groom Kuja Dosha"}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                  {kujaDosha.boy.hasKujaDosha ? (kujaDosha.boy.isCancelled ? "ಪರಿಹಾರವಾಗಿದೆ" : "ದೋಷವಿದೆ") : "ದೋಷವಿಲ್ಲ"}
                </span>
              </h4>
              <div className="space-y-1 text-[10px] text-slate-700">
                <p>ಲಗ್ನದಿಂದ: {kujaDosha.boy.marsHouseFromLagna}ನೇ ಮನೆ | ಚಂದ್ರನಿಂದ: {kujaDosha.boy.marsHouseFromMoon}ನೇ ಮನೆ</p>
                {kujaDosha.boy.cancellationReason && (
                  <p className="text-emerald-800 font-bold mt-1">✨ {kujaDosha.boy.cancellationReason[selectedLang]}</p>
                )}
              </div>
            </div>

            <div className="border border-rose-200 rounded-xl p-3 bg-rose-50/40">
              <h4 className="font-bold text-xs text-rose-950 mb-1.5 flex items-center justify-between">
                <span>👰 {selectedLang === "kn" ? "ವಧುವಿನ ಕುಜ ದೋಷ ಸ್ಥಿತಿ" : "Bride Kuja Dosha"}</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                  {kujaDosha.girl.hasKujaDosha ? (kujaDosha.girl.isCancelled ? "ಪರಿಹಾರವಾಗಿದೆ" : "ದೋಷವಿದೆ") : "ದೋಷವಿಲ್ಲ"}
                </span>
              </h4>
              <div className="space-y-1 text-[10px] text-slate-700">
                <p>ಲಗ್ನದಿಂದ: {kujaDosha.girl.marsHouseFromLagna}ನೇ ಮನೆ | ಚಂದ್ರನಿಂದ: {kujaDosha.girl.marsHouseFromMoon}ನೇ ಮನೆ</p>
                {kujaDosha.girl.cancellationReason && (
                  <p className="text-emerald-800 font-bold mt-1">✨ {kujaDosha.girl.cancellationReason[selectedLang]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Papa Samya & Dasha Sandhi */}
          <div className="my-2 grid grid-cols-2 gap-3 text-[10px]">
            <div className="border border-amber-200 rounded-xl p-2.5 bg-white">
              <span className="font-bold text-amber-950 block text-xs mb-1">⚖️ ಪಾಪ ಸಾಮ್ಯ (Malefic Balance)</span>
              <p className="text-slate-700">{papaSamya.verdict[selectedLang]}</p>
            </div>
            <div className="border border-amber-200 rounded-xl p-2.5 bg-white">
              <span className="font-bold text-amber-950 block text-xs mb-1">⏳ ದಶಾ ಸಂಧಿ ಪರಿಶೀಲನೆ</span>
              <p className="text-slate-700">{dashaSandhi.verdict[selectedLang]}</p>
            </div>
          </div>

          {/* Gokarna Kshetra Special Vivaha Seva Recommendations */}
          <div className="my-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
              <span>🪔</span> {selectedLang === "kn" ? "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ವಿವಾಹ ಶಾಂತಿ & ಕಲ್ಯಾಣ ಸೇವೆಗಳು" : "Gokarna Kshetra Consecrated Marriage Sevas"}
            </h3>
            <div className="space-y-2">
              {gokarnaSevas.map((seva) => (
                <div key={seva.sevaId} className="border border-amber-300 rounded-xl p-3 bg-gradient-to-r from-amber-50/60 to-white">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1 mb-1.5">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1">
                      <span>🔱</span> {seva.title[selectedLang]}
                    </span>
                    <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                      ಸೇವಾ ಕೋಡ್: {seva.bookingCode}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-700">
                    <div>
                      <span className="font-bold text-amber-900 block">ಏಕೆ ಅವಶ್ಯಕ (Why):</span>
                      <span>{seva.whyRequired[selectedLang]}</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">ಮಹಾತ್ಮೆ (Significance):</span>
                      <span>{seva.significance[selectedLang]}</span>
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block">ಫಲ ಪ್ರಾಪ್ತಿ (Transformation):</span>
                      <span>{seva.howTransforms[selectedLang]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priest Endorsement & Official Seal */}
          <div className="border-t-2 border-amber-400 pt-3 flex items-center justify-between">
            <div className="text-[10px] text-slate-700 max-w-sm leading-tight">
              <p className="font-bold text-amber-950">ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಆಶೀರ್ವಾದ</p>
              <p className="italic">
                "ಶ್ರೀ ಪರಮೇಶ್ವರ ಹಾಗೂ ಮಂಗಳ ಗೌರೀ ದೇವಿಯ ಕೃಪೆಯಿಂದ ನೂತನ ವಧು-ವರರಿಗೆ ದೀರ್ಘಾಯುಷ್ಯ, ಸತ್ಸಂತಾನ ಹಾಗೂ ಶಾಂತಿ-ಸಮೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ."
              </p>
            </div>
            <div className="text-right border-l border-amber-300 pl-4">
              <p className="font-extrabold text-xs text-amber-950">ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್</p>
              <p className="text-[10px] text-amber-900 font-medium">ಪ್ರಧಾನ ಅರ್ಚಕರು, ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ</p>
              <p className="text-[10px] font-bold text-slate-900">+91 99723 39362</p>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div className="border-t border-amber-300 pt-2 flex items-center justify-between text-[10px] text-amber-950 font-semibold">
            <span>ದಾಂಪತ್ಯ ಸುಖ ಶಾಂತಿ ಆಶೀರ್ವಾದ ಪತ್ರಿಕೆ</span>
            <span>Baggona Panchanga Astrology</span>
            <span>ಪುಟ ೩ / ೩</span>
          </div>
        </div>
      </div>
    </div>
  );
}
