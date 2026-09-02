import React, { useState, useMemo } from "react";
import { usePricingConfigStore } from "../../features/wallet/pricingConfigStore";
import { type ServiceCategory, type ServiceCost } from "../../features/wallet/walletTypes";
import { useAuthStore } from "../../features/auth/authStore";

export const ServicePricingManager: React.FC = () => {
  const {
    pricing,
    isSaving,
    error,
    successMessage,
    saveAllPricing,
    resetToDefaults,
    clearMessages
  } = usePricingConfigStore();

  const { currentUser } = useAuthStore();
  const adminId = typeof currentUser === "string" ? currentUser : "SuperAdmin";

  // Local draft state for editing before saving
  const [draftPricing, setDraftPricing] = useState<Record<string, ServiceCost>>(() => ({ ...pricing }));
  const [selectedCategory, setSelectedCategory] = useState<"all" | ServiceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Sync draft if store pricing updates from cloud and user hasn't edited
  React.useEffect(() => {
    if (!hasChanges) {
      setDraftPricing({ ...pricing });
    }
  }, [pricing, hasChanges]);

  const categories: Array<{ key: "all" | ServiceCategory; label: string; icon: string }> = [
    { key: "all", label: "ಎಲ್ಲಾ ಸೇವೆಗಳು (All)", icon: "✨" },
    { key: "sankhyashastra", label: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Numerology)", icon: "🔢" },
    { key: "divine_tools", label: "ದಿವ್ಯ ಸಾಧನಗಳು (Diksuchi & Past Life)", icon: "🧭" },
    { key: "muhurtha", label: "ಮುಹೂರ್ತ (Muhurtha)", icon: "🚗" },
    { key: "kundli", label: "ಕುಂಡಲಿ & ಜ್ಯೋತಿಷ್ಯ (Kundali)", icon: "📜" },
    { key: "reports", label: "PDF ವರದಿಗಳು (Reports)", icon: "📑" }
  ];

  const handleCoinsChange = (key: string, value: number) => {
    const cleanValue = Math.max(0, Math.min(100000, value || 0));
    setDraftPricing((prev) => {
      const existing = prev[key] || pricing[key];
      if (!existing) return prev;
      return {
        ...prev,
        [key]: {
          ...existing,
          coins: cleanValue,
          inrEquivalent: Math.round(cleanValue / 10)
        }
      };
    });
    setHasChanges(true);
    clearMessages();
  };

  const handleAdjustCoins = (key: string, delta: number) => {
    const current = draftPricing[key]?.coins ?? pricing[key]?.coins ?? 250;
    handleCoinsChange(key, current + delta);
  };

  const handleSave = async () => {
    const success = await saveAllPricing(draftPricing, adminId);
    if (success) {
      setHasChanges(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("ಖಂಡಿತವಾಗಿಯೂ ಎಲ್ಲಾ ಬೆಲೆಗಳನ್ನು ಮೂಲ ನಿಯೋಜಿತ ಬೆಲೆಗಳಿಗೆ (Default Pricing) ಮರುಹೊಂದಿಸಲು ಇಚ್ಚಿಸುತ್ತೀರಾ?")) {
      return;
    }
    const success = await resetToDefaults(adminId);
    if (success) {
      setHasChanges(false);
    }
  };

  const filteredList = useMemo(() => {
    return Object.values(draftPricing).filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kannadaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.key.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [draftPricing, selectedCategory, searchQuery]);

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 text-slate-100 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              ಸೇವಾ ಶುಲ್ಕ ನಾಣ್ಯಗಳ ಸಂರಚನಾ ಕೇಂದ್ರ (Service Pricing Master)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure dynamic coin deduction prices for all public features. Changes update instantaneously across all questionnaires, tab headers, and deduction modals.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all disabled:opacity-50"
            title="Reset all prices to factory defaults"
          >
            🔄 ಮೂಲ ದರಗಳು (Reset Defaults)
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className={`px-5 py-2 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-1.5 ${
              hasChanges
                ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 ring-2 ring-amber-400/60 animate-pulse"
                : "bg-amber-500/20 text-amber-200/50 border border-amber-500/20 cursor-not-allowed"
            }`}
          >
            {isSaving ? "⏳ ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "💾 ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ (Save Pricing)"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-950/80 border border-red-500/60 rounded-2xl text-red-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>⚠️ {error}</span>
          <button onClick={clearMessages} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* SPECIAL SECTION: PUBLIC KUNDLI & LIFE INQUEST PRICING MASTER */}
      <div className="bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <h3 className="font-extrabold text-sm md:text-base text-amber-300">
              ಸಾರ್ವಜನಿಕ ಕುಂಡಲಿ ಸೇವಾ ಶುಲ್ಕ ನಿಯೋಜನೆ (Public Kundli & Analysis Pricing)
            </h3>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            Public Portal Real-Time Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Kundli Generation */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">🪐 ಕುಂಡಲಿ ರಚನೆ (Generation)</span>
              <span className="text-[10px] text-slate-400 font-mono">₹{draftPricing["PUBLIC_KUNDLI_GENERATION"]?.inrEquivalent ?? 50}</span>
            </div>
            <p className="text-[11px] text-slate-400">Public Janma Kundali birth calculation & initial chart</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                step="50"
                value={draftPricing["PUBLIC_KUNDLI_GENERATION"]?.coins ?? 500}
                onChange={(e) => handleCoinsChange("PUBLIC_KUNDLI_GENERATION", parseInt(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 border border-amber-500/40 text-amber-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-400">Coins</span>
            </div>
          </div>

          {/* 2. Live Analysis & Inquest */}
          <div className="bg-slate-900 border-2 border-yellow-400/60 rounded-xl p-3.5 space-y-2 bg-yellow-950/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-300">🌟 ನೇರ ವಿಶ್ಲೇಷಣೆ (1-Click Inquest)</span>
              <span className="text-[10px] text-yellow-200 font-mono font-bold">₹{draftPricing["PUBLIC_LIFE_ANALYSIS_QA"]?.inrEquivalent ?? 100}</span>
            </div>
            <p className="text-[11px] text-slate-400">What is happening in life right now? Live AI Analysis & Q&A</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                step="50"
                value={draftPricing["PUBLIC_LIFE_ANALYSIS_QA"]?.coins ?? 1000}
                onChange={(e) => handleCoinsChange("PUBLIC_LIFE_ANALYSIS_QA", parseInt(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs font-mono font-extrabold bg-slate-950 border-2 border-yellow-400 text-yellow-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-yellow-400">Coins</span>
            </div>
          </div>

          {/* 3. PDF Download */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">📄 PDF ಡೌನ್‌ಲೋಡ್ (Download)</span>
              <span className="text-[10px] text-slate-400 font-mono">₹{draftPricing["PUBLIC_KUNDLI_PDF_DOWNLOAD"]?.inrEquivalent ?? 50}</span>
            </div>
            <p className="text-[11px] text-slate-400">High-resolution 6-page printable Janma Kundali PDF booklet</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                step="50"
                value={draftPricing["PUBLIC_KUNDLI_PDF_DOWNLOAD"]?.coins ?? 500}
                onChange={(e) => handleCoinsChange("PUBLIC_KUNDLI_PDF_DOWNLOAD", parseInt(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 border border-amber-500/40 text-amber-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-400">Coins</span>
            </div>
          </div>

          {/* 4. Tab Unlocks */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">📑 ವಿಭಾಗ ವೀಕ್ಷಣೆ (Tab Unlock)</span>
              <span className="text-[10px] text-slate-400 font-mono">₹{draftPricing["PUBLIC_TAB_UNLOCK"]?.inrEquivalent ?? 20}</span>
            </div>
            <p className="text-[11px] text-slate-400">Individual detailed tab view for planets, dasha & remedies</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="0"
                step="50"
                value={draftPricing["PUBLIC_TAB_UNLOCK"]?.coins ?? 200}
                onChange={(e) => handleCoinsChange("PUBLIC_TAB_UNLOCK", parseInt(e.target.value) || 0)}
                className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-slate-950 border border-amber-500/40 text-amber-300 rounded-lg text-center"
              />
              <span className="text-xs font-bold text-slate-400">Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedCategory === cat.key
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="ಹುಡುಕಿ / Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Pricing Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-extrabold uppercase tracking-wider">
              <th className="p-3.5">ಸೇವೆ / Service Name</th>
              <th className="p-3.5">ವರ್ಗ / Category</th>
              <th className="p-3.5 text-center">ನಾಣ್ಯಗಳ ದರ / Coins (Editable)</th>
              <th className="p-3.5 text-center">ರೂಪಾಯಿ ಮೌಲ್ಯ / INR Value</th>
              <th className="p-3.5 hidden md:table-cell">ವಿವರಣೆ / Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredList.map((item) => {
              const currentCoins = item.coins;
              const inr = Math.round(currentCoins / 10);
              const isModified = currentCoins !== (pricing[item.key]?.coins ?? 250);

              return (
                <tr
                  key={item.key}
                  className={`hover:bg-slate-900/60 transition-colors ${
                    isModified ? "bg-amber-950/20" : ""
                  }`}
                >
                  {/* Service Title */}
                  <td className="p-3.5">
                    <div className="font-black text-amber-200 text-sm">
                      {item.kannadaName || item.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {item.name}
                    </div>
                    <span className="inline-block mt-0.5 text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.key}
                    </span>
                  </td>

                  {/* Category Badge */}
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide bg-slate-800 text-amber-300 border border-amber-500/20">
                      {item.category === "sankhyashastra" && "🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ"}
                      {item.category === "divine_tools" && "🧭 ದಿವ್ಯ ಸಾಧನ"}
                      {item.category === "muhurtha" && "🚗 ಮುಹೂರ್ತ"}
                      {item.category === "kundli" && "📜 ಕುಂಡಲಿ"}
                      {item.category === "reports" && "📑 PDF ವರದಿ"}
                    </span>
                  </td>

                  {/* Editable Coins & Quick Adjustment */}
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustCoins(item.key, -50)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700"
                        title="-50 Coins"
                      >
                        -
                      </button>
                      <div className="relative">
                        <input
                          type="number"
                          step={10}
                          min={0}
                          max={50000}
                          value={currentCoins}
                          onChange={(e) => handleCoinsChange(item.key, parseInt(e.target.value, 10))}
                          className="w-24 px-2 py-1.5 text-center font-mono font-black text-sm rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-inner"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdjustCoins(item.key, 50)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center border border-slate-700"
                        title="+50 Coins"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* INR Equivalent */}
                  <td className="p-3.5 text-center">
                    <span className="font-mono font-black text-emerald-400 text-sm bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block">
                      ₹{inr}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="p-3.5 hidden md:table-cell text-slate-400 text-[11px] max-w-xs">
                    {item.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200/90">
        <span className="text-xl">💡</span>
        <div>
          <strong>ತ್ವರಿತ ಮಾಹಿತಿ (Pro Tip):</strong> ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆಗೆ ₹25 (250 ನಾಣ್ಯಗಳು), ನೇಮ್ ಡಿಗ್ರಿ ಹಾಗೂ ವಾಹನಕ್ಕೆ ₹50 (500 ನಾಣ್ಯಗಳು), ಕಾಲ ದಿಕ್ಸೂಚಿ ಮತ್ತು ಹಿಂದಿನ ಜನ್ಮಕ್ಕೆ ₹20 (200 ನಾಣ್ಯಗಳು) ಮಾನದಂಡ ದರಗಳಾಗಿವೆ. ಇಲ್ಲಿ ಬದಲಾಯಿಸಿದ ತಕ್ಷಣ ಬಳಕೆದಾರರ ಮುಖಪುಟ, ಟ್ಯಾಬ್ ಹೆಡ್ಡರ್ ಹಾಗೂ ನಾಣ್ಯ ಕಡಿತದ ದೃಢೀಕರಣ ಪಟ್ಟಿಯಲ್ಲಿ ಲೈವ್ ಆಗಿ ಅನ್ವಯವಾಗುತ್ತದೆ.
        </div>
      </div>
    </div>
  );
};
