import React, { useState } from "react";
import type { VedicSynthesisResult, GrahaAmshaProfile, BhavaSynthesisGate } from "../../core/VedicSynthesisEngine";
import { getVedicSynthesisLocale, type SupportedLocale } from "../../i18n/vedicSynthesisLocale";

export interface VedicSynthesisCardProps {
  synthesis: VedicSynthesisResult;
  lang?: string;
}

export const VedicSynthesisCard: React.FC<VedicSynthesisCardProps> = ({ synthesis, lang = "kn" }) => {
  const [activeTab, setActiveTab] = useState<"stellar" | "amsha" | "bhavas" | "sutras" | "maandi" | "advanced">("stellar");
  const [selectedGraha, setSelectedGraha] = useState<GrahaAmshaProfile | null>(synthesis.grahaAmshaProfiles[0] || null);

  const currentLang = (lang.split("-")[0]?.toLowerCase() ?? "kn") as SupportedLocale;
  const t = getVedicSynthesisLocale(currentLang);

  const getRelationshipColor = (rel: GrahaAmshaProfile["stellarRelationship"]) => {
    switch (rel) {
      case "Synergistic Amplification":
      case "Exalted Star Elevation":
        return "bg-emerald-900/40 text-emerald-300 border-emerald-500/50";
      case "Paradoxical Synthesis":
        return "bg-purple-900/40 text-purple-300 border-purple-500/50";
      case "Debilitated Star Challenge":
        return "bg-rose-900/40 text-rose-300 border-rose-500/50";
      default:
        return "bg-amber-900/40 text-amber-300 border-amber-500/50";
    }
  };

  const getOutcomeBadge = (outcome: GrahaAmshaProfile["sutraOutcome"]) => {
    switch (outcome) {
      case "Active / Manifest":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">{t.activeStatus}</span>;
      case "Latent / Delayed":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">{t.latentStatus}</span>;
      case "Redirected":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">{t.redirectedStatus}</span>;
      case "Paradoxical":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">{t.paradoxicalStatus}</span>;
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-stone-900 via-slate-900 to-stone-950 text-stone-100 rounded-2xl border-2 border-amber-500/40 shadow-2xl p-4 md:p-6 mb-8 transition-all">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-amber-500/30 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            ✨ {t.title}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-serif">
            ॥ ನಕ್ಷತ್ರ-ಗ್ರಹ-ಭಾವ ಸಂಶ್ಲೇಷಣಾ ದರ್ಶನ ॥
          </h2>
          <p className="text-xs md:text-sm text-stone-400 mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* METRIC BADGES */}
        <div className="flex flex-wrap md:flex-col items-end gap-2 text-right">
          <div className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-amber-500/30 text-xs">
            <span className="text-stone-400">{t.rashmiLabel}: </span>
            <span className="font-bold text-amber-300 text-sm">{synthesis.rashmiSynthesis.totalRashmi}</span>
            <span className="text-stone-500"> ({synthesis.rashmiSynthesis.strengthGrade.split("/")[0]})</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-amber-500/30 text-xs">
            <span className="text-stone-400">ದಶಾ ಕಾಲ: </span>
            <span className="font-bold text-yellow-300">{synthesis.metadata.runningMahadasha} / {synthesis.metadata.runningBhukti}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-stone-800 scrollbar-none text-xs md:text-sm font-medium">
        <button
          onClick={() => setActiveTab("stellar")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "stellar"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          ⭐ {t.stellarMatrixTitle}
        </button>
        <button
          onClick={() => setActiveTab("amsha")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "amsha"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          🔢 {t.amshaMatrixTitle}
        </button>
        <button
          onClick={() => setActiveTab("bhavas")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "bhavas"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          🏛️ {t.bhavaMatrixTitle}
        </button>
        <button
          onClick={() => setActiveTab("sutras")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "sutras"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          ⚖️ {t.phalitSutrasTitle}
        </button>
        <button
          onClick={() => setActiveTab("maandi")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "maandi"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          🔥 {t.maandiTitle}
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === "advanced"
              ? "bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20"
              : "bg-stone-800/60 text-stone-300 hover:bg-stone-800 hover:text-amber-200"
          }`}
        >
          📜 {t.nadiKarmaTitle} & {t.jaiminiTitle}
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="mt-5">
        {/* 1. STELLAR MATRIX TAB */}
        {activeTab === "stellar" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {synthesis.grahaAmshaProfiles.map((p) => {
                const isSelected = selectedGraha?.name === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => setSelectedGraha(p)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-stone-800 border-amber-400 shadow-md ring-1 ring-amber-400/50"
                        : "bg-stone-900/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-200 text-base">{p.name}</span>
                        <span className="text-xs text-stone-400">({p.rashi.english} {p.degree.toFixed(1)}°)</span>
                      </div>
                      {getOutcomeBadge(p.sutraOutcome)}
                    </div>

                    <div className="text-xs space-y-1 text-stone-300">
                      <div className="flex justify-between">
                        <span className="text-stone-400">ನಕ್ಷತ್ರ / ಪಾದ:</span>
                        <span className="font-semibold text-stone-200">{p.nakshatra.english} (ಪಾದ {p.pada})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">{t.nakshatraLordLabel}:</span>
                        <span className="font-semibold text-yellow-300">{p.kpSubLord.nakshatraLord}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">{t.subLordLabel}:</span>
                        <span className="font-semibold text-emerald-400">{p.kpSubLord.subLord}</span>
                      </div>
                      {p.rashmi && (
                        <div className="flex justify-between">
                          <span className="text-stone-400">{t.rashmiLabel}:</span>
                          <span className="font-semibold text-amber-300">{p.rashmi.modifiedRashmi} / {p.rashmi.maxRashmi}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded border ${getRelationshipColor(p.stellarRelationship)}`}>
                        {p.stellarRelationship}
                      </span>
                      <span className="text-stone-400">ಬಲ: <b className="text-stone-200">{p.grahBalScore}%</b></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED GRAHA DEEP DIVE MODAL/CARD */}
            {selectedGraha && (
              <div className="p-4 rounded-xl bg-stone-800/80 border border-amber-500/30 mt-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                    🔍 {selectedGraha.name} - ನಕ್ಷತ್ರ ಫಲಿತ ಸೂತ್ರ ತರ್ಕ (Logic Gate)
                  </h3>
                  <span className="text-xs text-stone-400 font-mono">{selectedGraha.amshaDisplayBadge}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-200 bg-stone-950/60 p-3 rounded-lg border border-stone-800 font-mono">
                  {selectedGraha.logicGateFormula}
                </p>
                <p className="text-xs text-stone-300 pt-1">
                  💡 <b>ವಿಶ್ಲೇಷಣೆ:</b> {selectedGraha.sutraDiagnosis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. SUB-DIVISIONAL AMSHA MATRIX TAB */}
        {activeTab === "amsha" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-800/90 text-amber-300 border-b border-stone-700">
                    <th className="p-3">ಗ್ರಹ / ಲಗ್ನ</th>
                    <th className="p-3">D-1 ರಾಶಿ</th>
                    <th className="p-3">D-9 ನವಾಂಶ (ಅಂಶ)</th>
                    <th className="p-3">D-7 ಸಪ್ತಾಂಶ (ಸಂತಾನ)</th>
                    <th className="p-3">D-10 ದಶಾಂಶ (ಉದ್ಯೋಗ)</th>
                    <th className="p-3">D-12 ದ್ವಾದಶಾಂಶ</th>
                    <th className="p-3">ವರ್ಗೋತ್ತಮ / ಪುಷ್ಕರಾflags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300">
                  {synthesis.grahaAmshaProfiles.map((p) => (
                    <tr key={p.name} className="hover:bg-stone-800/40">
                      <td className="p-3 font-bold text-amber-200">{p.name}</td>
                      <td className="p-3">{p.rashi.english} ({p.degree.toFixed(1)}°)</td>
                      <td className="p-3 font-mono font-bold text-yellow-300">
                        {p.amsha.d9NavamsaNumber}
                      </td>
                      <td className="p-3 font-mono text-emerald-300">
                        {p.amsha.d7SaptamsaNumber}
                      </td>
                      <td className="p-3 font-mono text-cyan-300">
                        {p.amsha.d10DasamsaNumber}
                      </td>
                      <td className="p-3 font-mono text-purple-300">
                        {p.amsha.d12DwadasamsaNumber}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.amsha.isVargottama && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/40 font-bold">ವರ್ಗೋತ್ತಮ</span>
                          )}
                          {p.amsha.isPushkaramsha && (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] border border-yellow-500/40 font-bold">ಪುಷ್ಕರಾಂಶ</span>
                          )}
                          {p.amsha.isGandanta && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/40 font-bold">ಗಂಡಾಂತ</span>
                          )}
                          {!p.amsha.isVargottama && !p.amsha.isPushkaramsha && !p.amsha.isGandanta && (
                            <span className="text-stone-500 text-[11px]">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. 12 BHAVAS & VASTU TAB */}
        {activeTab === "bhavas" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {synthesis.bhavaSynthesis.map((b) => (
                <div
                  key={b.houseNumber}
                  className={`p-3.5 rounded-xl border ${
                    b.isTrikaLeakageNode
                      ? "bg-rose-950/20 border-rose-800/40"
                      : "bg-stone-900/80 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-300 text-sm">{b.sanskritName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono">
                      ಭಾವ ಬಲ: {b.bhavBalScore}%
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-stone-300 mb-2.5">
                    <div className="flex justify-between">
                      <span className="text-stone-400">ಭಾವಾಧಿಪತಿ:</span>
                      <span className="font-semibold text-yellow-300">{b.houseLord} ({b.rashi.english})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">{t.subLordLabel}:</span>
                      <span className="font-semibold text-emerald-400">{b.cuspSubLord.subLord}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">ಭಾವದಲ್ಲಿರುವ ಗ್ರಹಗಳು:</span>
                      <span className="font-semibold text-stone-200">
                        {b.occupants.length ? b.occupants.join(", ") : "ಯಾವುದೂ ಇಲ್ಲ (Empty)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">{t.vastuTitle}:</span>
                      <span className="font-semibold text-cyan-300">{b.vastuDirection}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 bg-stone-950/50 p-2 rounded border border-stone-800/80 mb-2">
                    {b.synthesizedPrediction}
                  </p>

                  <div className="text-[11px] text-stone-400 border-t border-stone-800/60 pt-1.5 flex items-center justify-between">
                    <span>ವಾಸ್ತು ಸಲಹೆ: {b.vastuAlignmentAdvice.slice(0, 45)}...</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${b.dasaValidationStatus.includes("TRUE") ? "text-emerald-400 font-bold" : "text-stone-500"}`}>
                      {b.dasaValidationStatus.includes("TRUE") ? "✓ ದಶಾ ಸಕ್ರಿಯ" : "ಸುಪ್ತ"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PHALIT SUTRA LOGIC GATES */}
        {activeTab === "sutras" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* RULE 1 */}
              <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-300 text-sm">{t.rule1Label}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${synthesis.phalitSutras.rule1_grahBalLatency.passed ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
                    {synthesis.phalitSutras.rule1_grahBalLatency.passed ? "✓ ತೃಪ್ತಿದಾಯಕ" : "ವಿಳಂಬಿತ ಫಲಗಳು"}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {synthesis.phalitSutras.rule1_grahBalLatency.description}
                </p>
              </div>

              {/* RULE 2 */}
              <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-300 text-sm">{t.rule2Label}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${synthesis.phalitSutras.rule2_bhavBalRedirection.compromisedHouses.length === 0 ? "bg-emerald-900/40 text-emerald-300" : "bg-blue-900/40 text-blue-300"}`}>
                    {synthesis.phalitSutras.rule2_bhavBalRedirection.compromisedHouses.length === 0 ? "✓ ಸಮತೋಲನ" : "ಮರುನಿರ್ದೇಶಿತ"}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {synthesis.phalitSutras.rule2_bhavBalRedirection.description}
                </p>
              </div>

              {/* RULE 3 */}
              <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-300 text-sm">{t.rule3Label}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${synthesis.phalitSutras.rule3_stellarContradiction.paradoxicalPlanets.length === 0 ? "bg-emerald-900/40 text-emerald-300" : "bg-purple-900/40 text-purple-300"}`}>
                    {synthesis.phalitSutras.rule3_stellarContradiction.paradoxicalPlanets.length === 0 ? "✓ ಪೂರಕ ನಕ್ಷತ್ರ" : "ವಿರೋಧಾಭಾಸ ಫಲ"}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {synthesis.phalitSutras.rule3_stellarContradiction.description}
                </p>
              </div>

              {/* RULE 4 */}
              <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-yellow-300 text-sm">{t.rule4Label}</h4>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900/40 text-yellow-300 border border-yellow-500/40">
                    ದಶಾ ಕಾಲ: {synthesis.phalitSutras.rule4_dasaValidation.runningMahaLord} / {synthesis.phalitSutras.rule4_dasaValidation.runningBhuktiLord}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {synthesis.phalitSutras.rule4_dasaValidation.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. MAANDI DIAGNOSTICS TAB */}
        {activeTab === "maandi" && (
          <div className="space-y-4">
            {synthesis.maandiProfile ? (
              <div className="p-5 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <h4 className="font-bold text-amber-300 text-base">ಮಾಂದಿ (ಗುಳಿಕ) - {synthesis.maandiProfile.house}ನೇ ಭಾವ</h4>
                      <p className="text-xs text-stone-400 font-mono">
                        ರಾಶಿ: {synthesis.maandiProfile.rashi.english} ({synthesis.maandiProfile.degree.toFixed(1)}°) | ನವಾಂಶ (D-9): {synthesis.maandiProfile.d9NavamsaNumber}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${synthesis.maandiProfile.isUpachayaGain ? "bg-emerald-900/40 text-emerald-300 border-emerald-500/40" : "bg-rose-900/40 text-rose-300 border-rose-500/40"}`}>
                    {synthesis.maandiProfile.isUpachayaGain ? "ಉಪಚಯ ರಕ್ಷಣಾ ಬಲ (Upachaya Triumph)" : "ಶಾಂತಿ ಪರಿಹಾರದ ಅಗತ್ಯ"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 text-xs sm:text-sm text-stone-200 leading-relaxed">
                  💡 <b>ಭಾವ ಫಲ ವಿವರಣೆ:</b> {synthesis.maandiProfile.diagnosticReading}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                  🙏 <b>{t.pariharaLabel}:</b> {synthesis.maandiProfile.shantiRemedy}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 p-4 bg-stone-900 rounded-xl">ಮಾಂದಿ ಗಣನೆ ಲಭ್ಯವಿಲ್ಲ.</p>
            )}
          </div>
        )}

        {/* 6. ADVANCED METHODOLOGIES TAB (NADI, JAIMINI, LAL KITAB) */}
        {activeTab === "advanced" && (
          <div className="space-y-4">
            {/* NADI KARMIC AUDIT */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                📜 {t.nadiKarmaTitle}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                {synthesis.advancedMethodologies.nadiKarmicAudit.pendingKarmaSummary}
              </p>
              <div className="p-2.5 rounded bg-stone-950/60 border border-stone-800 text-xs text-stone-300">
                🪐 <b>ಶನಿ-ಗುರು ಕರ್ಮ ಅಕ್ಷ:</b> {synthesis.advancedMethodologies.nadiKarmicAudit.saturnJupiterKarmicAxis}
              </div>
            </div>

            {/* JAIMINI ARUDHA & CHARA KARAKAS */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3">
              <h4 className="font-bold text-yellow-300 text-sm flex items-center gap-2">
                👑 {t.jaiminiTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded bg-stone-950/60 border border-stone-800">
                  <span className="font-bold text-amber-200">ಆರೂಢ ಲಗ್ನ (AL): </span>
                  <span className="text-stone-300">{synthesis.advancedMethodologies.jaiminiSynthesis.arudhaLagna.house}ನೇ ಭಾವ ({synthesis.advancedMethodologies.jaiminiSynthesis.arudhaLagna.rashi.english})</span>
                </div>
                <div className="p-2.5 rounded bg-stone-950/60 border border-stone-800">
                  <span className="font-bold text-amber-200">ಉಪಪದ ಲಗ್ನ (UL): </span>
                  <span className="text-stone-300">{synthesis.advancedMethodologies.jaiminiSynthesis.upapadaLagna.house}ನೇ ಭಾವ ({synthesis.advancedMethodologies.jaiminiSynthesis.upapadaLagna.rashi.english})</span>
                </div>
                <div className="p-2.5 rounded bg-stone-950/60 border border-stone-800">
                  <span className="font-bold text-amber-200">ಆತ್ಮಕಾರಕ (AK): </span>
                  <span className="text-stone-300">{synthesis.advancedMethodologies.jaiminiSynthesis.atmakaraka.planet} ({synthesis.advancedMethodologies.jaiminiSynthesis.atmakaraka.degree}°)</span>
                </div>
                <div className="p-2.5 rounded bg-stone-950/60 border border-stone-800">
                  <span className="font-bold text-amber-200">ಅಮಾತ್ಯಕಾರಕ (AmK): </span>
                  <span className="text-stone-300">{synthesis.advancedMethodologies.jaiminiSynthesis.amatyakaraka.planet} ({synthesis.advancedMethodologies.jaiminiSynthesis.amatyakaraka.degree}°)</span>
                </div>
              </div>
            </div>

            {/* LAL KITAB PITRA DOSHA & TOTKE */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  🪔 {t.lalKitabTitle}
                </h4>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${synthesis.advancedMethodologies.lalKitabAudit.pitraDoshaDetected ? "bg-rose-900/40 text-rose-300" : "bg-emerald-900/40 text-emerald-300"}`}>
                  {synthesis.advancedMethodologies.lalKitabAudit.pitraDoshaDetected ? "ಪಿತೃ ದೋಷ ಸೂಚನೆ" : "ನಿರ್ದೋಷ (No Pitra Dosha)"}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {synthesis.advancedMethodologies.lalKitabAudit.pitraDoshaDiagnosis}
              </p>
              <div className="space-y-1.5 pt-1">
                {synthesis.advancedMethodologies.lalKitabAudit.totkeRemedies.map((totke, i) => (
                  <div key={i} className="text-xs text-yellow-200/90 flex items-start gap-1.5">
                    <span>✨</span>
                    <span>{totke}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
