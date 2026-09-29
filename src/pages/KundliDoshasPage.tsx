import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import {
  calculateComprehensiveDoshas,
  type ComprehensiveDoshaReport,
  type DetectedDosha,
  type DoshaCategory,
} from "../core/ComprehensiveDoshaEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";

export const KundliDoshasPage: React.FC = () => {
  const { i18n } = useTranslation();
  const setPage = useAppStore((s) => s.setPage);
  const session = useKundliViewerStore((s) => s.session);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);

  // Selected language for dosha view (kn, hi, te, ta, en)
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    const l = i18n.language ? i18n.language.split("-")[0] : "kn";
    return ["kn", "hi", "te", "ta", "en"].includes(l) ? l : "kn";
  });

  // Active filter tab
  const [activeFilter, setActiveFilter] = useState<"all" | "active_only" | "natal" | "dasha_sandhi" | "gochara">("all");

  // Local fallback state if no session in store
  const [localKundli, setLocalKundli] = useState<KundliOutput | null>(session?.result ?? null);
  const [localInput, setLocalInput] = useState<KundliInput | null>(session?.input ?? null);
  const [isLoading, setIsLoading] = useState(false);

  // Attempt to load from localStorage if store is empty
  useEffect(() => {
    if (!localKundli && typeof window !== "undefined") {
      try {
        const storedStr = localStorage.getItem("baggona_kundli_session");
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          if (stored.name && stored.birthDate && stored.birthTime) {
            setIsLoading(true);
            const payload: KundliInput = {
              name: stored.name,
              birthDate: stored.birthDate,
              birthTime: stored.birthTime,
              latitude: stored.latitude || defaultLat,
              longitude: stored.longitude || defaultLng,
              gender: stored.gender || "Male",
              pincode: stored.pincode
            };
            calculateKundliWithPlaceSun(payload, { ayanamsaModel: "lahiri" })
              .then((res) => {
                setLocalKundli(res);
                setLocalInput(payload);
              })
              .catch((err) => console.warn("Failed to restore stored kundli:", err))
              .finally(() => setIsLoading(false));
          }
        }
      } catch (e) {
        console.warn("Storage parse error:", e);
      }
    }
  }, [localKundli, defaultLat, defaultLng]);

  // Compute the comprehensive doshas report
  const doshaReport: ComprehensiveDoshaReport | null = useMemo(() => {
    if (!localKundli || !localInput) return null;
    return calculateComprehensiveDoshas(localKundli, localInput, new Date());
  }, [localKundli, localInput]);

  // Filtered list of doshas
  const filteredDoshas = useMemo(() => {
    if (!doshaReport) return [];
    let list = doshaReport.doshas;
    if (activeFilter === "active_only") {
      list = list.filter((d) => d.isDetected);
    } else if (activeFilter === "natal") {
      list = list.filter((d) => d.category === "natal");
    } else if (activeFilter === "dasha_sandhi") {
      list = list.filter((d) => d.category === "dasha_sandhi");
    } else if (activeFilter === "gochara") {
      list = list.filter((d) => d.category === "gochara");
    }
    return list;
  }, [doshaReport, activeFilter]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getLangText = (obj: Record<string, string> | undefined, fallback: string = ""): string => {
    if (!obj) return fallback;
    return obj[selectedLang] || obj["en"] || obj["kn"] || fallback;
  };

  const getLangArray = (obj: Record<string, string[]> | undefined): string[] => {
    if (!obj) return [];
    return obj[selectedLang] || obj["en"] || obj["kn"] || [];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 print:bg-white print:text-black print:pb-0">
      {/* 🌟 Top Navigation Bar 🌟 */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all border border-amber-500/30"
            >
              <span>←</span>
              <span>{selectedLang === "kn" ? "ಜಾತಕಕ್ಕೆ ಹಿಂತಿರುಗಿ" : "Back to Kundli"}</span>
            </button>
            <span className="text-sm font-extrabold text-amber-200 hidden sm:inline">
              ॥ ಸಮಗ್ರ ಜಾತಕ ದೋಷ ನಿರ್ಣಯ & ಶಾಂತಿ ಪರಿಹಾರ ದರ್ಶನ ॥
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 🌐 5-Language Selector */}
            <div className="inline-flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700">
              {[
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "hi", label: "हिन्दी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" },
                { code: "en", label: "English" }
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedLang === l.code
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 🖨️ Print Dossier Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <span>🖨️</span>
              <span>{selectedLang === "kn" ? "ಪತ್ರ ಮುದ್ರಣ (Print PDF)" : "Print Dossier"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📜 Main Content Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full mb-3" />
            <p className="text-amber-300 text-sm font-semibold">
              {selectedLang === "kn" ? "ಜಾತಕದ ದೋಷಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Kundli Doshas & Planetary Alignments..."}
            </p>
          </div>
        )}

        {/* Empty State when no Kundli is loaded */}
        {!isLoading && !doshaReport && (
          <div className="rounded-3xl border-2 border-dashed border-amber-500/40 bg-slate-900/60 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="text-5xl animate-bounce">🛡️</div>
            <h2 className="text-xl font-bold text-amber-200">
              {selectedLang === "kn" ? "ಯಾವುದೇ ಜಾತಕ ಸಿದ್ಧವಾಗಿಲ್ಲ" : "No Active Kundli Found"}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedLang === "kn"
                ? "ದೋಷ ವಿಶ್ಲೇಷಣೆ ವೀಕ್ಷಿಸಲು ಮೊದಲು 'ಜಾತಕ' ಪುಟದಲ್ಲಿ ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ ಹಾಗೂ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ."
                : "To examine technical Dosha calculations and sacred Vedic remedies, please generate a Kundli first."}
            </p>
            <button
              type="button"
              onClick={() => setPage("kundli")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition-all"
            >
              <span>✨</span>
              <span>{selectedLang === "kn" ? "ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ (Open Kundli Page)" : "Generate Kundli Now"}</span>
            </button>
          </div>
        )}

        {/* 🌟 Rich Dosha Dossier View 🌟 */}
        {!isLoading && doshaReport && (
          <>
            {/* Header / Devotee Metadata Banner */}
            <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/80 via-slate-900 to-stone-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black print:p-4">
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-amber-500/20 pb-6 print:border-black">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-black uppercase text-amber-300 border border-amber-400/30 print:border-black print:text-black">
                    <span>🔱</span>
                    <span>॥ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-amber-100 mt-2 tracking-tight print:text-black">
                    {selectedLang === "kn" ? "ಸಮಗ್ರ ಜಾತಕ ದೋಷ ನಿರ್ಣಯ & ಪರಿಹಾರ ದರ್ಶನ" : "Comprehensive Kundli Dosha Analysis & Shanti"}
                  </h1>
                  <p className="text-xs text-amber-200/80 mt-1 print:text-black">
                    {selectedLang === "kn"
                      ? "ಪಿತೃ, ನಾರಾಯಣ ಬಲಿ, ಕಾಳಸರ್ಪ, ಗುರು ಚಂಡಾಲ, ಬಾಲಾರಿಷ್ಟ, ಬಾಲ್ಯಗ್ರಹ, ಕುಜ, ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ & ಗೋಚಾರ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ"
                      : "Rigorous Parashari analysis of Pitru, Narayana Bali, Kala Sarpa, Guru Chandala, Balarishta, Kuja, Dasha Sandhi & Transits"}
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0 bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30 print:bg-white print:border-black">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest print:text-black">
                    {selectedLang === "kn" ? "ಜಾತಕರ ಹೆಸರು" : "Native's Name"}
                  </div>
                  <div className="text-lg font-black text-amber-200 capitalize mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.name}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mt-1 print:text-black">
                    {doshaReport.devoteeInfo.birthDate} • {doshaReport.devoteeInfo.birthTime}
                  </div>
                </div>
              </div>

              {/* Natal Coordinates & Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-2">
                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {selectedLang === "kn" ? "ಜನ್ಮ ಲಗ್ನ" : "Ascendant (Lagna)"}
                  </div>
                  <div className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.lagnaRashi}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {selectedLang === "kn" ? "ಚಂದ್ರ ರಾಶಿ & ನಕ್ಷತ್ರ" : "Moon Sign & Nakshatra"}
                  </div>
                  <div className="text-sm font-black text-slate-100 mt-0.5 print:text-black">
                    {doshaReport.devoteeInfo.moonRashi} • {doshaReport.devoteeInfo.nakshatra} ({doshaReport.devoteeInfo.pada})
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {selectedLang === "kn" ? "ಸಕ್ರಿಯ ದೋಷಗಳು" : "Active Afflictions"}
                  </div>
                  <div className="text-sm font-black text-rose-400 mt-0.5 print:text-black">
                    {doshaReport.summary.totalActive} / {doshaReport.summary.totalEvaluated}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 border border-amber-500/20 text-center print:border-black">
                  <div className="text-[10px] uppercase font-bold text-amber-400 print:text-black">
                    {selectedLang === "kn" ? "ದಶಾ ಸಂಧಿ ಸ್ಥಿತಿ" : "Dasha Sandhi Status"}
                  </div>
                  <div className="text-sm font-black text-amber-300 mt-0.5 print:text-black">
                    {doshaReport.activeSandhiAlert?.status === "active"
                      ? (selectedLang === "kn" ? "ಸಕ್ರಿಯ ಸಂಧಿ ಕಾಲ ⚠️" : "Active Sandhi ⚠️")
                      : (selectedLang === "kn" ? "ಸ್ಥಿರ ದಶಾ ಕಾಲ" : "Stable Phase")}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 print:hidden">
              {[
                { id: "all", kn: "ಎಲ್ಲಾ ದೋಷಗಳು", en: "All Evaluated", count: doshaReport.summary.totalEvaluated },
                { id: "active_only", kn: "ಸಕ್ರಿಯ ದೋಷಗಳು", en: "Active Afflictions Only", count: doshaReport.summary.totalActive },
                { id: "natal", kn: "ಜನ್ಮ ಜಾತಕ ದೋಷಗಳು", en: "Natal Doshas", count: doshaReport.doshas.filter((d) => d.category === "natal").length },
                { id: "dasha_sandhi", kn: "ದಶಾ-ಭುಕ್ತಿ ಸಂಧಿ", en: "Dasha Sandhi", count: doshaReport.doshas.filter((d) => d.category === "dasha_sandhi").length },
                { id: "gochara", kn: "ಗೋಚಾರ ದೋಷಗಳು", en: "Gochara Transits", count: doshaReport.doshas.filter((d) => d.category === "gochara").length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    activeFilter === tab.id
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <span>{selectedLang === "kn" ? tab.kn : tab.en}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.id ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* 🛡️ Dosha Cards Grid */}
            <div className="space-y-6">
              {filteredDoshas.map((dosha) => {
                const isAfflicted = dosha.isDetected;
                const borderClass = !isAfflicted
                  ? "border-emerald-500/30 bg-slate-900/50"
                  : dosha.severity === "critical"
                  ? "border-rose-500/60 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900"
                  : "border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900";

                const badgeBg = !isAfflicted
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : dosha.severity === "critical"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/40";

                return (
                  <article
                    key={dosha.id}
                    className={`rounded-3xl border-2 ${borderClass} p-6 sm:p-7 shadow-xl space-y-5 transition-all print:border-black print:bg-white print:text-black print:p-4 print:break-inside-avoid`}
                  >
                    {/* Header Row: Title, Badge, and Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 print:border-black">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-900/40 text-2xl print:border-black">
                          {isAfflicted ? (dosha.severity === "critical" ? "⚠️" : "⚡") : "🛡️"}
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-amber-200 print:text-black">
                            {getLangText(dosha.name)}
                          </h2>
                          <p className="text-[11px] text-slate-400 print:text-black">
                            {dosha.technicalDetail.scripturalReference}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase border ${badgeBg} print:border-black print:text-black`}>
                          <span>{isAfflicted ? "●" : "✓"}</span>
                          <span>{getLangText(dosha.statusBadge)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 🔍 SECTION 1: Technical "WHY" Breakdown */}
                    <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80 space-y-2 print:bg-white print:border-black">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                        <span>🔍</span>
                        <span>
                          {selectedLang === "kn"
                            ? "ಶಾಸ್ತ್ರೀಯ ತಾಂತ್ರಿಕ ಕಾರಣ (Technical Astronomical Why)"
                            : "Technical Astrological Justification (Why)"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-medium print:text-black">
                        {getLangText(dosha.technicalWhy)}
                      </p>

                      {/* Technical Tags: Houses, Grahas, Mitigation */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {dosha.technicalDetail.houseNumbers.length > 0 && (
                          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                            <span>🏠</span>
                            <span>
                              {selectedLang === "kn" ? "ಭಾವಗಳು: " : "Houses: "}
                              {dosha.technicalDetail.houseNumbers.join(", ")}
                            </span>
                          </div>
                        )}
                        {dosha.technicalDetail.grahasInvolved.length > 0 && (
                          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-slate-700 print:border-black print:text-black">
                            <span>🪐</span>
                            <span>
                              {selectedLang === "kn" ? "ಗ್ರಹಗಳು: " : "Grahas: "}
                              {dosha.technicalDetail.grahasInvolved.join(", ")}
                            </span>
                          </div>
                        )}
                        {dosha.technicalDetail.hasBhangaOrMitigation && (
                          <div className="inline-flex items-center gap-1 rounded-lg bg-emerald-950/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/40 print:border-black print:text-black">
                            <span>✨</span>
                            <span>
                              {selectedLang === "kn" ? "ಭಂಗ / ಪರಿಹಾರಕ ಬಲ: " : "Mitigation: "}
                              {getLangText(dosha.technicalDetail.bhangaDescription)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ⚡ SECTION 2: Real-World Life Manifestation (2 Paragraphs) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                        <span>⚡</span>
                        <span>
                          {selectedLang === "kn"
                            ? "ದೈನಂದಿನ ಜೀವನದ ಪ್ರಭಾವ (Real-World Life Manifestation)"
                            : "Real-World Daily Impact"}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-300 print:text-black">
                        {getLangText(dosha.lifeImpact)
                          .split(/\n\n+/)
                          .map((para, idx) => (
                            <p key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 print:border-none print:p-0">
                              {para}
                            </p>
                          ))}
                      </div>
                    </div>

                    {/* 🔱 SECTION 3: Prescribed Vedic Shanti & Parihara */}
                    {isAfflicted && (
                      <div className="rounded-2xl bg-amber-950/30 border border-amber-500/30 p-4 space-y-3 print:border-black print:bg-white">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 print:text-black">
                          <span>🔱</span>
                          <span>
                            {selectedLang === "kn"
                              ? "ಶಾಸ್ತ್ರೋಕ್ತ ಶಾಂತಿ & ಪರಿಹಾರಗಳು (Vedic Shanti & Remedies)"
                              : "Sacred Vedic Shanti & Parihara"}
                          </span>
                        </div>

                        {/* Sacred Temple / Ritual */}
                        <div className="rounded-xl bg-slate-900/80 p-3 border border-amber-400/30 flex items-start gap-2.5 print:bg-white print:border-black">
                          <span className="text-xl">🛕</span>
                          <div>
                            <div className="text-[10px] font-bold uppercase text-amber-400 print:text-black">
                              {selectedLang === "kn" ? "ಶಿಫಾರಸು ಮಾಡಿದ ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜೆ / ಕ್ಷೇತ್ರ" : "Recommended Vedic Ritual & Shrine"}
                            </div>
                            <div className="text-xs sm:text-sm font-black text-amber-200 mt-0.5 print:text-black">
                              {getLangText(dosha.recommendedPooja)}
                            </div>
                          </div>
                        </div>

                        {/* Practical Lifestyle Remedies */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-400 print:text-black">
                            {selectedLang === "kn" ? "ದೈನಂದಿನ ಆಚರಣೆಗಳು & ಮಂತ್ರ ಪರಿಹಾರ:" : "Prescribed Daily Remediations & Mantras:"}
                          </div>
                          <ul className="space-y-1">
                            {getLangArray(dosha.remedies).map((rem, rIdx) => (
                              <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-2 print:text-black">
                                <span className="text-amber-400 font-bold shrink-0">✦</span>
                                <span>{rem}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default KundliDoshasPage;
