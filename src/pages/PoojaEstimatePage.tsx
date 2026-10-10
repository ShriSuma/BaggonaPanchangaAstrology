import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  POOJA_ESTIMATE_CATALOG,
  TIER_METADATA,
  computeConsolidatedPoojaPlan,
  type PoojaTier,
  type PoojaDomain,
  type PoojaEstimateItem
} from "../data/poojaCostEstimateData";
import ErrorBoundary from "../components/ErrorBoundary";

export const PoojaEstimatePage: React.FC = () => {
  // Read query params from URL if any
  const initialParams = useMemo(() => {
    if (typeof window === "undefined") return { poojaIds: ["narayana_bali"], tier: "medium" as PoojaTier };
    const params = new URLSearchParams(window.location.search);
    const poojasParam = params.get("poojas");
    const tierParam = params.get("tier") as PoojaTier | null;
    
    const parsedIds = poojasParam
      ? poojasParam.split(",").map(s => s.trim()).filter(Boolean)
      : ["narayana_bali"];

    const validTier: PoojaTier = (tierParam === "low" || tierParam === "medium" || tierParam === "high")
      ? tierParam
      : "medium";

    return {
      poojaIds: parsedIds.length > 0 ? parsedIds : ["narayana_bali"],
      tier: validTier
    };
  }, []);

  // Selected pooja IDs (supports multi-select)
  const [selectedPoojaIds, setSelectedPoojaIds] = useState<string[]>(initialParams.poojaIds);
  // Current active tier
  const [activeTier, setActiveTier] = useState<PoojaTier>(initialParams.tier);
  // Domain category filter for the selector
  const [activeDomainFilter, setActiveDomainFilter] = useState<PoojaDomain | "all">("all");
  // Search query for pooja list
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Active detail section tab: "samagri" | "vidhana_cost" | "benefits"
  const [activeSectionTab, setActiveSectionTab] = useState<"samagri" | "vidhana_cost" | "benefits">("samagri");
  // Expanded per-pooja breakdown accordion IDs
  const [expandedPoojaId, setExpandedPoojaId] = useState<string | null>(null);
  // Audio playing state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  // Copy alert state
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync to URL silently
  useEffect(() => {
    if (typeof window !== "undefined" && window.history) {
      const params = new URLSearchParams(window.location.search);
      params.set("poojas", selectedPoojaIds.join(","));
      params.set("tier", activeTier);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    }
  }, [selectedPoojaIds, activeTier]);

  // Filtered poojas for selection
  const filteredCatalog = useMemo(() => {
    return POOJA_ESTIMATE_CATALOG.filter(p => {
      const matchesDomain = activeDomainFilter === "all" || p.domain === activeDomainFilter;
      const matchesSearch = searchQuery.trim() === "" ||
        p.nameKn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitleKn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDomain && matchesSearch;
    });
  }, [activeDomainFilter, searchQuery]);

  // Compute consolidated plan
  const consolidatedPlan = useMemo(() => {
    return computeConsolidatedPoojaPlan(selectedPoojaIds, activeTier);
  }, [selectedPoojaIds, activeTier]);

  // Toggle pooja selection
  const handleTogglePooja = (id: string) => {
    setSelectedPoojaIds(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all or reset
  const handleQuickSelectPreset = (ids: string[]) => {
    setSelectedPoojaIds(ids);
  };

  // Text-to-speech for Kannada narrative
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrative = `ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ. ${consolidatedPlan.selectedPoojas.map(p => p.nameKn).join(", ")}. ಶ್ರೇಣಿ: ${TIER_METADATA[activeTier].nameKn}. ಒಟ್ಟು ವೆಚ್ಚ: ${consolidatedPlan.comboPackageCost} ರೂಪಾಯಿಗಳು. ಋತ್ವಿಜರು: ${consolidatedPlan.totalPriestsCoordinated} ವೇದ ಪಂಡಿತರು. ${consolidatedPlan.selectedPoojas[0]?.whyNeedThisPoojaKn || ""}. ವಿವರಗಳಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್.`;

    const utterance = new SpeechSynthesisUtterance(narrative);
    utterance.lang = "kn-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const tierMeta = TIER_METADATA[activeTier];
    const poojaNames = consolidatedPlan.selectedPoojas.map(p => `• ${p.nameKn}`).join("\n");
    const text = `*॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜಾ ಯೋಜನೆ & ವೆಚ್ಚ ವಿವರ ॥*\n\n` +
      `*ಆಯ್ಕೆಯಾದ ಪೂಜೆಗಳು:*\n${poojaNames}\n\n` +
      `*ಆಯ್ಕೆ ಮಾಡಿದ ಶ್ರೇಣಿ:* ${tierMeta.nameKn} (${tierMeta.priceTag})\n` +
      `*ಒಟ್ಟು ವೆಚ್ಚ:* ₹${consolidatedPlan.comboPackageCost.toLocaleString("en-IN")}/-\n` +
      `*ಋತ್ವಿಜರು:* ${consolidatedPlan.priestTeamSummaryKn}\n` +
      `*ಅವಧಿ:* ${consolidatedPlan.totalDurationKn}\n` +
      `*ಜಪ ಸಂಖ್ಯೆ:* ${consolidatedPlan.totalJapaCountKn}\n\n` +
      `*ಮುಖ್ಯ ವೈಶಿಷ್ಟ್ಯ:* ${consolidatedPlan.selectedPoojas[0]?.tiers[activeTier].whyChooseThisTierKn || ""}\n\n` +
      `ಸಂಪೂರ್ಣ ವಿವರ & ದಿನಾಂಕ ನಿಗದಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ: *ಶ್ರೀರಾಮ್ ಪಂಡಿತ್* (೯೯೭೨೩೩೯೩೬೨ / 9972339362)\n` +
      `ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ.`;

    const encoded = encodeURI(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  // Copy details
  const handleCopySummary = async () => {
    const tierMeta = TIER_METADATA[activeTier];
    const poojaNames = consolidatedPlan.selectedPoojas.map(p => `• ${p.nameKn}`).join("\n");
    const text = `॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜಾ ಯೋಜನೆ & ವೆಚ್ಚ ವಿವರ ॥\n\n` +
      `ಆಯ್ಕೆಯಾದ ಪೂಜೆಗಳು:\n${poojaNames}\n\n` +
      `ಶ್ರೇಣಿ: ${tierMeta.nameKn} (${tierMeta.priceTag})\n` +
      `ಒಟ್ಟು ವೆಚ್ಚ: ₹${consolidatedPlan.comboPackageCost.toLocaleString("en-IN")}/-\n` +
      `ಋತ್ವಿಜರು: ${consolidatedPlan.priestTeamSummaryKn}\n` +
      `ಅವಧಿ: ${consolidatedPlan.totalDurationKn}\n` +
      `ಜಪ: ${consolidatedPlan.totalJapaCountKn}\n\n` +
      `ಸಂಪರ್ಕಿಸಿ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      // fallback
    }
  };

  // Print quotation
  const handlePrint = () => {
    window.print();
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FFFDF7] dark:bg-slate-950 text-amber-950 dark:text-amber-50 selection:bg-amber-500 selection:text-white pb-24">
        {/* Top Sacred Heritage Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950 text-amber-100 px-4 pt-10 pb-12 shadow-2xl border-b-2 border-amber-500/40">
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
          
          <div className="relative max-w-5xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs md:text-sm font-semibold tracking-wider uppercase shadow-inner">
              <span>॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 tracking-tight leading-tight">
              ಶಾಸ್ತ್ರೋಕ್ತ ಪೂಜಾ ಯೋಜನೆ & ವೆಚ್ಚ ವಿವರ
            </h1>

            <p className="text-sm md:text-base text-amber-200/90 max-w-3xl mx-auto leading-relaxed">
              ನಾರಾಯಣ ಬಲಿ, ಪ್ರೇತೋದ್ಧಾರ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ಮಹಾಗಣಪತಿ, ಮೃತ್ಯುಂಜಯ, ಸುದರ್ಶನ ಹಾಗೂ ಸಂಯುಕ್ತ ಹೋಮಗಳ ಸಂಪೂರ್ಣ ಸಾಮಗ್ರಿ ಪಟ್ಟಿ, ಋತ್ವಿಜರ ಸಂಖ್ಯೆ, ಹೋಮ ದ್ರವ್ಯ, ಭೋಜನ ಹಾಗೂ ಪಾರದರ್ಶಕ ಶಾಸ್ತ್ರೋಕ್ತ ವೆಚ್ಚದ ಸಮಗ್ರ ದರ್ಶನ.
            </p>

            {/* Quick Call Action for Shreeram Pandit */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:9972339362"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>📞</span>
                <span>ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 9972339362 ಗೆ ಕರೆ ಮಾಡಿ</span>
              </a>

              <button
                type="button"
                onClick={handleToggleSpeech}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                  isSpeaking
                    ? "bg-rose-500/20 border-rose-400 text-rose-200 animate-pulse"
                    : "bg-amber-500/15 border-amber-400/50 text-amber-300 hover:bg-amber-500/25"
                }`}
              >
                <span>{isSpeaking ? "⏹️" : "🔊"}</span>
                <span>{isSpeaking ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ" : "ಕನ್ನಡ ವಿವರಣೆ ಆಲಿಸಿ"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Workspace */}
        <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-8 space-y-8" ref={printAreaRef}>
          
          {/* STEP 1: POOJA SELECTION CONTROLS */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-200/80 dark:border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">೧</span>
                  <h2 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100">
                    ಪೂಜೆಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ (Select Single or Multiple Poojas)
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  ಒಂದೇ ಬಾರಿಗೆ ಒಂದು ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು ಪೂಜೆಗಳನ್ನು ಆರಿಸಿಕೊಳ್ಳಿ. ಸಂಯುಕ್ತ ಪೂಜೆಗಳಿಗೆ ವಿಶೇಷ ರಿಯಾಯಿತಿ ದೊರೆಯುತ್ತದೆ.
                </p>
              </div>

              {/* Counter Pill */}
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-xs font-bold text-amber-900 dark:text-amber-300">
                  ಆಯ್ಕೆಯಾದ ಪೂಜೆಗಳು: {selectedPoojaIds.length}
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                ತ್ವರಿತ ಸಂಯೋಜನೆಗಳು (Quick Popular Combinations):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["narayana_bali"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.length === 1 && selectedPoojaIds[0] === "narayana_bali"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  ☘ ನಾರಾಯಣ ಬಲಿ (Single)
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["pretoddhara"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.length === 1 && selectedPoojaIds[0] === "pretoddhara"
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  🪔 ಪ್ರೇತೋದ್ಧಾರ (Single)
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["narayana_bali", "pretoddhara"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.length === 2 && selectedPoojaIds.includes("narayana_bali") && selectedPoojaIds.includes("pretoddhara")
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  🔱 ನಾರಾಯಣ ಬಲಿ + ಪ್ರೇತೋದ್ಧಾರ (Combined)
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["narayana_bali_tripindi_pretoddhara"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.includes("narayana_bali_tripindi_pretoddhara")
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  👑 ತ್ರಿಪುಟ ಮಹಾಸಂಪುಟ (3-in-1 Triple)
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["maha_ganapati_homa", "navagraha_shanti_homa"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.includes("maha_ganapati_homa") && selectedPoojaIds.includes("navagraha_shanti_homa")
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  🐘 ಗಣಪತಿ + ನವಗ್ರಹ ಶಾಂತಿ
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSelectPreset(["maha_mrityunjaya_homa", "sudarshana_homa"])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPoojaIds.includes("maha_mrityunjaya_homa") && selectedPoojaIds.includes("sudarshana_homa")
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-slate-700 hover:bg-amber-100"
                  }`}
                >
                  🛡️ ಮೃತ್ಯುಂಜಯ + ಸುದರ್ಶನ ರಕ್ಷಾ ಹೋಮ
                </button>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1 flex gap-1 p-1 bg-amber-50/80 dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeDomainFilter === "all"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-800"
                  }`}
                >
                  ಎಲ್ಲವೂ (All)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter("pitru")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeDomainFilter === "pitru"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-800"
                  }`}
                >
                  ☘ ಪಿತೃ ಕಾರ್ಯ & ಪ್ರೇತೋದ್ಧಾರ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter("devata")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeDomainFilter === "devata"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-800"
                  }`}
                >
                  🐘 ದೇವತಾ ಹೋಮಗಳು
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDomainFilter("combined")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeDomainFilter === "combined"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-800"
                  }`}
                >
                  🔱 ಸಂಯುಕ್ತ ಮಹಾ ಸಂಪುಟಗಳು
                </button>
              </div>

              {/* Search Box */}
              <div className="sm:w-64 relative">
                <input
                  type="text"
                  placeholder="ಪೂಜೆ ಹುಡುಕಿ / Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 text-xs text-amber-950 dark:text-amber-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute left-3 top-2.5 text-xs opacity-60">🔍</span>
              </div>
            </div>

            {/* Interactive Multi-Select Pooja Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {filteredCatalog.map(pooja => {
                const isSelected = selectedPoojaIds.includes(pooja.id);
                return (
                  <div
                    key={pooja.id}
                    onClick={() => handleTogglePooja(pooja.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all select-none relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/40"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-amber-300 hover:bg-amber-50/30"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl" aria-hidden>{pooja.icon}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-amber-500 border-amber-600 text-slate-950 font-bold"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100 leading-snug">
                          {pooja.nameKn}
                        </h3>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {pooja.subtitleKn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">
                        ಆರಂಭ: ₹{pooja.tiers.low.basePrice.toLocaleString("en-IN")}
                      </span>
                      {pooja.isCombined && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/40 text-[10px] font-bold text-amber-900 dark:text-amber-300">
                          ಸಂಯುಕ್ತ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* STEP 2: 3-TIER PRICING STANDARD SELECTOR */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">೨</span>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100">
                ಪೂಜಾ ಶ್ರೇಣಿಯನ್ನು ಆರಿಸಿ (Choose Low, Medium or High Standard)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["low", "medium", "high"] as PoojaTier[]).map(tierKey => {
                const meta = TIER_METADATA[tierKey];
                const isActive = activeTier === tierKey;
                const sampleTier = consolidatedPlan.selectedPoojas[0]?.tiers[tierKey];

                return (
                  <div
                    key={tierKey}
                    onClick={() => setActiveTier(tierKey)}
                    className={`cursor-pointer rounded-3xl p-5 sm:p-6 transition-all relative border flex flex-col justify-between ${
                      isActive
                        ? `${meta.borderClass} ${meta.bgClass} shadow-xl scale-[1.02]`
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 shadow-md opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Header badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl" aria-hidden>{meta.icon}</span>
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${meta.badgeClass}`}>
                          {tierKey === "medium" ? "★ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ" : tierKey === "high" ? "👑 ಭವ್ಯ ಶ್ರೇಷ್ಠ" : "ಮಿತವ್ಯಯ"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-amber-950 dark:text-amber-100">
                          {meta.nameKn}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {meta.descriptionKn}
                        </p>
                      </div>

                      {/* Pricing Tag */}
                      <div className="pt-2">
                        <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 tracking-tight">
                          ₹{consolidatedPlan.selectedPoojas.length === 1
                            ? sampleTier?.basePrice.toLocaleString("en-IN")
                            : consolidatedPlan.comboPackageCost.toLocaleString("en-IN")
                          }
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            {consolidatedPlan.selectedPoojas.length > 1 ? "(ಸಂಯುಕ್ತ ಪ್ಯಾಕೇಜ್)" : ""}
                          </span>
                        </div>
                        {consolidatedPlan.selectedPoojas.length > 1 && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                            ಸಂಯುಕ್ತ ರಿಯಾಯಿತಿ ಉಳಿತಾಯ: ₹{consolidatedPlan.bundleSavings.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>

                      {/* Key highlights list */}
                      <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            ಋತ್ವಿಜರು: {sampleTier?.priestCount} ವೇದ ಪಂಡಿತರು
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📿</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ಜಪ: {sampleTier?.japaCountKn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🏺</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ಕಲಶಗಳು: {sampleTier?.kalashaCountKn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🪙</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ಪ್ರತಿಮೆ: {sampleTier?.prathimaKn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Selector Indicator */}
                    <div className="pt-5 mt-4">
                      <div className={`w-full py-2.5 rounded-xl text-center text-xs font-black transition-all ${
                        isActive
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}>
                        {isActive ? "✓ ಆಯ್ಕೆಯಾದ ಶ್ರೇಣಿ (Selected)" : "ಆಯ್ಕೆ ಮಾಡಿ (Select)"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HIGH-TIER PERSUASION HIGHLIGHT BOX (Impressing the client!) */}
          <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-700/15 border-2 border-amber-400/80 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
                  <span>👑 ಮಹತ್ವದ ಮಾರ್ಗದರ್ಶನ</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100">
                  ಏಕೆ ₹30,000 ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪವನ್ನು ಆರಿಸಿಕೊಳ್ಳಬೇಕು?
                </h3>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  ₹12,000 ಶ್ರೇಣಿಯು ಸೀಮಿತ ಬಜೆಟ್‌ನ ಕಡ್ಡಾಯ ಶಾಸ್ತ್ರೋಕ್ತ ವಿಧಿಯಾಗಿದೆ. ಆದರೆ ₹30,000 ಭವ್ಯ ಮಹಾಸಂಕಲ್ಪದಲ್ಲಿ <strong>೭ ಜನ ಶ್ರೋತ್ರೀಯ ವೇದ ವಿದ್ವಾಂಸರು</strong> ಅಹೋರಾತ್ರಿ ಕುಳಿತು <strong>೧೦,೦೦೦+ ಅಖಂಡ ಜಪಗಳನ್ನು</strong> ನೆರವೇರಿಸುತ್ತಾರೆ. ಶುದ್ಧ ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಪ್ರತಿಮೆ ದಾನ, ೧೦ ಕೆಜಿ ಹಸುವಿನ ತುಪ್ಪದ ಹವಿಸ್ಸು ಹಾಗೂ ರೇಷ್ಮೆ ಶಾಲು ಪೂರ್ಣಾಹುತಿ ನೀಡಲಾಗುತ್ತದೆ. ಇದರಿಂದ ತಲೆಮಾರುಗಳ ಘೋರ ಕರ್ಮ ದೋಷಗಳು ಮೂಲದಿಂದಲೇ ಭಸ್ಮವಾಗಿ ಮನೆಗೆ ಅಜರಾಮರ ದೈವೀ ರಕ್ಷಾ ಕವಚ ಲಭಿಸುತ್ತದೆ.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-amber-200/80 dark:border-slate-800">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">₹12,000 (ಮಿತವ್ಯಯ):</span>
                    <span className="text-slate-600 dark:text-slate-400">೨ ಪುರೋಹಿತರು, ೧,೦೦೮ ಜಪ, ತಾಮ್ರದ ಪ್ರತಿಮೆ, ಮೂಲ ಶಾಸ್ತ್ರ ಸಂಪನ್ನ.</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-amber-200/80 dark:border-slate-800">
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">₹20,000 (ಮಧ್ಯಮ):</span>
                    <span className="text-slate-600 dark:text-slate-400">೪ ಪುರೋಹಿತರು, ೫,೦೦೦ ಜಪ, ಬೆಳ್ಳಿಯ ಪ್ರತಿಮೆ, ಅಷ್ಟದ್ರವ್ಯ ಹವನ.</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/20 dark:bg-amber-500/20 border-2 border-amber-500">
                    <span className="font-black text-amber-950 dark:text-amber-200 block">₹30,000 (ಭವ್ಯ ದಿವ್ಯ):</span>
                    <span className="text-amber-900 dark:text-amber-300 font-semibold">೭ ಪುರೋಹಿತರು, ೧೦,೦೦೦+ ಜಪ, ಚಿನ್ನ/ಬೆಳ್ಳಿ ಪ್ರತಿಮೆ, ರೇಷ್ಮೆ ಪೂರ್ಣಾಹುತಿ.</span>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTier("high")}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-black text-sm hover:from-amber-500 hover:to-yellow-400 shadow-xl shadow-amber-500/30 transition-all transform hover:scale-105"
                >
                  👑 ₹30,000 ಶ್ರೇಣಿ ಆರಿಸಿ
                </button>
              </div>
            </div>
          </section>

          {/* STEP 3: THE 3 CORE DETAIL CATEGORIES TABS */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xl border border-amber-200/80 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">೩</span>
                <h2 className="text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100">
                  ಪೂಜೆಯ ವಿವರವಾದ ವಿಭಾಗಗಳು (Complete Structured Details)
                </h2>
              </div>

              {/* Share & Print Quick Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-slate-700 bg-amber-50/60 dark:bg-slate-800 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
                  title="ವಿವರಗಳನ್ನು ಕಾಪಿ ಮಾಡಿ"
                >
                  {copySuccess ? "✓ ಕಾಪಿ ಆಯಿತು" : "📋 ಕಾಪಿ"}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm"
                  title="ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ"
                >
                  📲 ವಾಟ್ಸಾಪ್
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm"
                  title="ಪ್ರಿಂಟ್ ತೆಗೆಯಿರಿ"
                >
                  🖨️ ಮುದ್ರಿಸಿ
                </button>
              </div>
            </div>

            {/* 3 Main Tab Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-amber-50/80 dark:bg-slate-800/80 rounded-2xl border border-amber-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveSectionTab("samagri")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeSectionTab === "samagri"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-700 dark:text-slate-300 hover:text-amber-900"
                }`}
              >
                <span>📦</span>
                <span>ವಿಭಾಗ ೧: ಸಾಮಗ್ರಿಗಳ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionTab("vidhana_cost")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeSectionTab === "vidhana_cost"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-700 dark:text-slate-300 hover:text-amber-900"
                }`}
              >
                <span>🔥</span>
                <span>ವಿಭಾಗ ೨: ಋತ್ವಿಜರು, ಹೋಮ ದ್ರವ್ಯ & ವೆಚ್ಚ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionTab("benefits")}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeSectionTab === "benefits"
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "text-slate-700 dark:text-slate-300 hover:text-amber-900"
                }`}
              >
                <span>🌺</span>
                <span>ವಿಭಾಗ ೩: ಪೂಜಾ ಫಲ & ಜೀವನ ಬದಲಾವಣೆ</span>
              </button>
            </div>

            {/* TAB 1: SAMAGRI LIST */}
            {activeSectionTab === "samagri" && (
              <div className="space-y-6 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 text-xs text-amber-900 dark:text-amber-200">
                  💡 <strong>ಸೂಚನೆ:</strong> ಈ ಪಟ್ಟಿಯು ಆಯ್ಕೆಯಾದ <strong>{consolidatedPlan.selectedPoojas.length}</strong> ಪೂಜೆಗಳಿಗೆ ಮತ್ತು <strong>{TIER_METADATA[activeTier].nameKn}</strong> ಶ್ರೇಣಿಗೆ ತಕ್ಕಂತೆ ಸಮಗ್ರವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಭಕ್ತರು ತರಬೇಕಾದ ಸರಳ ಸಾಮಗ್ರಿಗಳು ಹಾಗೂ ಪುರೋಹಿತರೇ ಕ್ಷೇತ್ರದಿಂದ ಸಿದ್ಧಪಡಿಸುವ ಪವಿತ್ರ ಸಾಮಗ್ರಿಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: What Devotee Brings */}
                  <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/40 border border-emerald-300 dark:border-emerald-800/60 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 dark:border-emerald-800/40">
                      <span className="text-xl">🧺</span>
                      <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-300">
                        ಭಕ್ತರು ತರಬೇಕಾದ ಸಾಮಗ್ರಿಗಳು (Provided by Devotee)
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {consolidatedPlan.devoteeItems.map(item => (
                        <div key={item.id} className="flex items-start justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">{item.nameKn}</span>
                            <span className="text-[11px] text-slate-500">{item.importanceKn}</span>
                          </div>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px] shrink-0">
                            {item.quantityKn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: What Priests Arrange */}
                  <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/40 border border-amber-300 dark:border-amber-800/60 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-200 dark:border-amber-800/40">
                      <span className="text-xl">🪔</span>
                      <h3 className="font-black text-sm text-amber-950 dark:text-amber-300">
                        ಪುರೋಹಿತರು ವ್ಯವಸ್ಥೆ ಮಾಡುವ ಪವಿತ್ರ ಸಾಮಗ್ರಿಗಳು (Arranged by Priests)
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {consolidatedPlan.priestItems.map(item => (
                        <div key={item.id} className="flex items-start justify-between gap-2 text-xs py-1.5 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-200 block">{item.nameKn}</span>
                            <span className="text-[11px] text-slate-500">{item.importanceKn}</span>
                          </div>
                          <span className="font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[11px] shrink-0">
                            {item.quantityKn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROCEDURE, HOMA DRAVYA, PRIESTS, FOOD & TRANSPARENT COST */}
            {activeSectionTab === "vidhana_cost" && (
              <div className="space-y-6 pt-2">
                {/* Priests Team & Coordination Card */}
                <div className="rounded-2xl p-5 bg-amber-50/50 dark:bg-slate-800/40 border border-amber-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👥</span>
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-100">
                          ಋತ್ವಿಕ್ ಮಂಡಳಿ & ಕರ್ತವ್ಯಗಳು ({consolidatedPlan.totalPriestsCoordinated} ವೇದ ಪಂಡಿತರು)
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {consolidatedPlan.priestTeamSummaryKn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">ಪ್ರಧಾನ ಆಚಾರ್ಯರು:</span>
                      <p className="text-slate-600 dark:text-slate-400">ಸಂಕಲ್ಪ, ಪಂಚಕಲಶ ಸ್ಥಾಪನೆ, ಪ್ರಧಾನ ಸೂಕ್ತ ಪಾರಾಯಣ ಹಾಗೂ ಸಮಗ್ರ ಕಾರ್ಯದ ದೈವೀ ನಿರ್ವಹಣೆ.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">ಹೋತೃ & ಬ್ರಹ್ಮ ವಿದ್ವಾಂಸರು:</span>
                      <p className="text-slate-600 dark:text-slate-400">ಅಗ್ನಿ ಪ್ರತಿಷ್ಠೆ, ಮಂತ್ರಮುಖ ಆಹುತಿ, ತುಪ್ಪ ಹಾಗೂ ಹವಿಸ್ಸು ಸಮರ್ಪಣೆ, ವಿಧಿ ರಕ್ಷಣೆ.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">ಜಪಕರ್ತೃ ಋತ್ವಿಜರು:</span>
                      <p className="text-slate-600 dark:text-slate-400">ಅಖಂಡ {consolidatedPlan.totalJapaCountKn} ಪಠಣ ಹಾಗೂ ಶಾಂತಿ ಸೂಕ್ತ ಆವರ್ತನ.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ದಕ್ಷಿಣೆ:</span>
                      <p className="text-slate-600 dark:text-slate-400">{consolidatedPlan.selectedPoojas[0]?.tiers[activeTier].brahmanaBhojanaKn}</p>
                    </div>
                  </div>
                </div>

                {/* Homa Dravyas Put in Havana */}
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/40 border border-amber-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <h3 className="font-black text-sm text-amber-950 dark:text-amber-100">
                      ಹೋಮ/ಹವನಕ್ಕೆ ಹಾಕುವ ಪವಿತ್ರ ದ್ರವ್ಯಗಳು (Sacred Homa Dravyas & Havis)
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {consolidatedPlan.selectedPoojas.flatMap(p => p.havanaSpecialtiesKn).map((spec, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs font-semibold text-amber-900 dark:text-amber-200">
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transparent Cost Breakdown Table */}
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/40 border border-amber-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-100">
                          ವೆಚ್ಚ ಏಕೆ ಇಷ್ಟು ಆಗುತ್ತದೆ? (Transparent Rupee-by-Rupee Breakdown)
                        </h3>
                        <p className="text-xs text-slate-500">
                          ಪ್ರತಿಯೊಂದು ಪೈಸೆಗೂ ಸ್ಪಷ್ಟ ಶಾಸ್ತ್ರೋಕ್ತ ಲೆಕ್ಕಾಚಾರ
                        </p>
                      </div>
                    </div>

                    <span className="text-lg font-black text-amber-700 dark:text-amber-300">
                      ಒಟ್ಟು: ₹{consolidatedPlan.comboPackageCost.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-amber-200 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                          <th className="py-2.5 px-3 font-bold">ವೆಚ್ಚದ ಶೀರ್ಷಿಕೆ</th>
                          <th className="py-2.5 px-3 font-bold">ವಿವರ</th>
                          <th className="py-2.5 px-3 font-bold text-right">ಮೊತ್ತ (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {consolidatedPlan.consolidatedCostBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-3 font-bold text-amber-950 dark:text-amber-200">{item.headKn}</td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{item.descriptionKn}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">₹{item.amount.toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                        {consolidatedPlan.bundleSavings > 0 && (
                          <tr className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-bold">
                            <td className="py-2.5 px-3">ಸಂಯುಕ್ತ ಪ್ಯಾಕೇಜ್ ರಿಯಾಯಿತಿ</td>
                            <td className="py-2.5 px-3">ಏಕಕಾಲದಲ್ಲಿ ಹಲವು ಪೂಜೆಗಳನ್ನು ನೆರವೇರಿಸಿದ ಮಂಟಪ & ಋತ್ವಿಕ್ ಉಳಿತಾಯ</td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">-₹{consolidatedPlan.bundleSavings.toLocaleString("en-IN")}</td>
                          </tr>
                        )}
                        <tr className="bg-amber-50 dark:bg-slate-800 font-black text-sm text-amber-950 dark:text-amber-100 border-t-2 border-amber-300 dark:border-amber-700">
                          <td className="py-3 px-3" colSpan={2}>ಅಂತಿಮ ಪಾವತಿ ವೆಚ್ಚ ({TIER_METADATA[activeTier].nameKn})</td>
                          <td className="py-3 px-3 text-right font-mono text-amber-700 dark:text-amber-300">₹{consolidatedPlan.comboPackageCost.toLocaleString("en-IN")}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PURPOSE, SHASTRA ROOT CAUSE & EXPECTED LIFE SHIFTS */}
            {activeSectionTab === "benefits" && (
              <div className="space-y-6 pt-2">
                {consolidatedPlan.selectedPoojas.map(pooja => (
                  <div key={pooja.id} className="rounded-2xl p-5 bg-amber-50/40 dark:bg-slate-800/40 border border-amber-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-amber-200 dark:border-slate-700">
                      <span className="text-2xl">{pooja.icon}</span>
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-amber-950 dark:text-amber-100">
                          {pooja.nameKn}
                        </h3>
                        <p className="text-xs text-slate-500">{pooja.subtitleKn}</p>
                      </div>
                    </div>

                    {/* Why do this pooja */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide block">
                        ಈ ಪೂಜೆಯನ್ನು ಏಕೆ ಮಾಡಬೇಕು? (Why this ritual is essential):
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {pooja.whyNeedThisPoojaKn}
                      </p>
                    </div>

                    {/* Shastra Reference */}
                    <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-slate-900/80 border border-amber-300/60 text-xs italic text-amber-900 dark:text-amber-300">
                      📜 <strong>ಶಾಸ್ತ್ರ ಪ್ರಮಾಣ:</strong> {pooja.shastraReferenceKn}
                    </div>

                    {/* Expected Shifts in Life */}
                    <div className="space-y-2 pt-2 text-xs">
                      <span className="font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wide block">
                        ಪೂಜೆಯ ನಂತರ ಜೀವನದಲ್ಲಿ ನಿರೀಕ್ಷಿಸಬಹುದಾದ ಶುಭ ಫಲಗಳು (Expected Life Shifts):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pooja.expectedLifeShiftsKn.map((shift, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                            <span className="text-slate-700 dark:text-slate-300">{shift}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PER-POOJA EXPANDABLE BREAKDOWN CARDS */}
          {consolidatedPlan.selectedPoojas.length > 1 && (
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-100 dark:border-slate-800">
                <span className="text-xl">📑</span>
                <h3 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-100">
                  ಪ್ರತ್ಯೇಕ ಪೂಜಾ ವಿವರಗಳು (Individual Pooja Breakdown)
                </h3>
              </div>

              <div className="space-y-3">
                {consolidatedPlan.selectedPoojas.map(pooja => {
                  const isExpanded = expandedPoojaId === pooja.id;
                  const poojaTier = pooja.tiers[activeTier];

                  return (
                    <div key={pooja.id} className="rounded-2xl border border-amber-200 dark:border-slate-800 overflow-hidden">
                      <div
                        onClick={() => setExpandedPoojaId(isExpanded ? null : pooja.id)}
                        className="p-4 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{pooja.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-100">{pooja.nameKn}</h4>
                            <p className="text-[11px] text-slate-500">ಪ್ರತ್ಯೇಕ ವೆಚ್ಚ: ₹{poojaTier.basePrice.toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          {isExpanded ? "▲ ಮುಚ್ಚಿ" : "▼ ವಿಸ್ತರಿಸಿ"}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-slate-900 text-xs space-y-3 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-slate-700 dark:text-slate-300">{pooja.whyNeedThisPoojaKn}</p>
                          <div className="text-slate-600 dark:text-slate-400">
                            <strong>ಋತ್ವಿಜರು:</strong> {poojaTier.priestTeamKn} | <strong>ಜಪ:</strong> {poojaTier.japaCountKn}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            <strong>ಹೋಮ ದ್ರವ್ಯಗಳು:</strong> {poojaTier.homaDravyasKn.join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* FINAL CONSULTATION & BOOKING ACTION DESK */}
          <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-900 via-amber-950 to-slate-950 text-amber-100 shadow-2xl border border-amber-500/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                ಪೂಜಾ ಸಂಕಲ್ಪ ಮಾರ್ಗದರ್ಶನ
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200">
                ಪೂಜೆ ನಿಗದಿಪಡಿಸಲು ಅಥವಾ ಮುಹೂರ್ತ ತಿಳಿಯಲು ಕರೆ ಮಾಡಿ
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl">
                ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ, ಗೋತ್ರ ಹಾಗೂ ಅನುಕೂಲಕರ ತಿಥಿ-ವಾರದಂತೆ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಅಥವಾ ನಿಮ್ಮ ಸ್ವಗೃಹದಲ್ಲಿ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಲು ಪ್ರಧಾನ ಪುರೋಹಿತರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಮಾಲೋಚಿಸಿ.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="tel:9972339362"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm hover:from-amber-400 hover:to-yellow-400 transition-all shadow-xl shadow-amber-500/30 text-center"
              >
                📞 ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 9972339362
              </a>
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg text-center"
              >
                📲 ವಾಟ್ಸಾಪ್ ಸಂದೇಶ ಕಳುಹಿಸಿ
              </button>
            </div>
          </section>

        </main>
      </div>
    </ErrorBoundary>
  );
};

export default PoojaEstimatePage;
