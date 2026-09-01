import React, { useState, useMemo } from "react";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../features/auth/authStore";
import { useWalletStore } from "../features/wallet/walletStore";
import {
  generateBhagyodayaReport,
  type BhagyodayaReport,
  type BhagyodayaLang,
  type GoldenMilestoneYear
} from "../features/bhagyodaya/bhagyodayaEngine";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { synthesizeAndPlayClonedVoice, stopClonedAudio } from "../features/audio/aiVoiceCloneEngine";

type TabPillarKey = "all" | "wealth" | "relationship" | "health" | "protection" | "milestones" | "karma" | "temple";

export default function BhagyodayaPage(): JSX.Element {
  const session = useKundliViewerStore((s) => s.session);
  const setPage = useAppStore((s) => s.setPage);
  const language = useAppStore((s) => s.language);
  const role = useAuthStore((s) => s.role);
  const wallet = useWalletStore((s) => s.wallet);
  const deductForService = useWalletStore((s) => s.deductForService);

  const [activeTab, setActiveTab] = useState<TabPillarKey>("all");
  const [reportLang, setReportLang] = useState<BhagyodayaLang>(
    language.startsWith("kn") ? "kn" : language.startsWith("hi") ? "hi" : language.startsWith("ta") ? "ta" : language.startsWith("te") ? "te" : "en"
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedMilestoneYear, setSelectedMilestoneYear] = useState<number | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(true); // Default true for rich user engagement
  const [unlockMessage, setUnlockMessage] = useState<string>("");

  const report: BhagyodayaReport | null = useMemo(() => {
    if (!session || !session.result) return null;
    return generateBhagyodayaReport(
      session.result,
      {
        name: session.input.name || "Devotee",
        birthDate: session.birthDateYmd || session.input.birthDate || "1990-01-01",
        birthTime: session.birthTimeHm || session.input.birthTime || "10:00",
        gotra: session.input.gothra || "ಕಾಶ್ಯಪ"
      },
      reportLang
    );
  }, [session, reportLang]);

  // Handle PDF Export
  const handleDownloadPdf = async (langToUse?: BhagyodayaLang) => {
    const lang = langToUse || reportLang;
    setReportLang(lang);
    setIsGeneratingPdf(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      const safeName = (session?.input.name || "Devotee").replace(/[^a-zA-Z0-9_\u0C80-\u0CFF]/g, "_");
      await generatePDFFromElement(
        "bhagyodaya-pdf-container",
        `${safeName}_Bhagyodaya_Mahadarshana_${lang.toUpperCase()}.pdf`
      );
    } catch (err) {
      console.error("[BhagyodayaPage] PDF Generation error:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Handle Audio Voice Synthesis
  const handlePlayVoiceSummary = async () => {
    if (isPlayingAudio) {
      stopClonedAudio();
      setIsPlayingAudio(false);
      return;
    }

    if (!report) return;
    setIsPlayingAudio(true);
    try {
      const summaryText = reportLang === "kn"
        ? `ನಮಸ್ಕಾರ ${report.devoteeName} ಅವರೇ. ನಿಮ್ಮ ಜಾತಕದ ಮಹಾಭಾಗ್ಯೋದಯ ವಿಶ್ಲೇಷಣೆ. ನಿಮ್ಮ ಲಗ್ನ ${report.lagnaRashi}, ಜನ್ಮ ರಾಶಿ ${report.moonRashi}, ಹಾಗೂ ನಕ್ಷತ್ರ ${report.nakshatra}. ನಿಮ್ಮ ಧನಯೋಗ ಸ್ಕೋರ್ ನೂರಕ್ಕೆ ${report.wealth.dhanaYogaScore}. ${report.wealth.wealthVerdict} ನಿಮ್ಮ ಋಣ ವಿಮೋಚನೆ ಮತ್ತು ಅದೃಷ್ಟದ ಸುವರ್ಣ ಅವಧಿ ಶೀಘ್ರದಲ್ಲೇ ಆರಂಭವಾಗಲಿದೆ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರ ಅನುಗ್ರಹವು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸದಾ ಇರಲಿ.`
        : `Namaskara ${report.devoteeName}. Here is your Divine Bhagyodaya Life Reading. Your Ascendant is ${report.lagnaRashi}, Moon Sign is ${report.moonRashi}, and Birth Star is ${report.nakshatra}. Your Dhana Yoga score is ${report.wealth.dhanaYogaScore} out of 100. ${report.wealth.wealthVerdict} May Lord Mahabaleshwara bless your family with boundless prosperity.`;

      await synthesizeAndPlayClonedVoice(
        summaryText,
        reportLang === "kn" ? "kn" : reportLang === "hi" ? "hi" : reportLang === "ta" ? "ta" : reportLang === "te" ? "te" : "en",
        undefined,
        () => setIsPlayingAudio(false)
      );
    } catch (err) {
      console.warn("[BhagyodayaPage] Audio synthesis warning:", err);
      setIsPlayingAudio(false);
    }
  };

  // If no Kundali exists in memory session
  if (!session || !report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-950/40 via-neutral-950 to-stone-900 p-8 md:p-12 shadow-2xl text-amber-100 space-y-6">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl border border-amber-400/40 bg-amber-900/40 text-4xl shadow-inner animate-bounce">
            🌟
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-amber-300">
              ಭಾಗ್ಯೋದಯ ಮಹಾದರ್ಶನ & ಜೀವನ ಸಂಜೀವಿನಿ ರಹಸ್ಯ
            </h2>
            <p className="text-xs md:text-sm text-amber-200/80 max-w-xl mx-auto leading-relaxed">
              ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದ ಆಧಾರದ ಮೇಲೆ ಧನ ಯೋಗ, ಸಾಲ ಮುಕ್ತಿ, ವಿವಾಹ ಕಾಲ, ಆಯುರ್ ರಕ್ಷೆ, ದೃಷ್ಟಿ ನಿವಾರಣೆ ಹಾಗೂ ೧೦ ವರ್ಷಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳನ್ನು ಅರಿಯಲು ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಜಾತಕವನ್ನು ರಚಿಸಿ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPage("kundli")}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-8 py-4 text-sm font-black text-neutral-950 shadow-xl hover:scale-105 transition-all"
          >
            <span>◈</span>
            <span>ಜಾತಕ ವಿವರ ನಮೂದಿಸಿ (Generate Janma Kundali)</span>
            <span>➜</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-4 py-6 space-y-6 text-slate-900 dark:text-amber-100">
      {/* ── TOP HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-950 via-slate-950 to-amber-900 p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-950/70 px-3 py-1 text-xs font-black uppercase text-amber-300">
              <span>🌟</span>
              <span>ಮಹಾಭಾಗ್ಯೋದಯ ಜೀವನ ಸಂಜೀವಿನಿ • Master Life Dossier</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-amber-200">
              {report.devoteeName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-200/90 pt-1">
              <span className="rounded-lg bg-black/40 px-2.5 py-1 border border-amber-500/30">
                🎂 {report.birthDate} ({report.birthTime})
              </span>
              <span className="rounded-lg bg-black/40 px-2.5 py-1 border border-amber-500/30">
                ☸️ ಲಗ್ನ: {report.lagnaRashi}
              </span>
              <span className="rounded-lg bg-black/40 px-2.5 py-1 border border-amber-500/30">
                🌙 ರಾಶಿ: {report.moonRashi}
              </span>
              <span className="rounded-lg bg-black/40 px-2.5 py-1 border border-amber-500/30">
                ✨ ನಕ್ಷತ್ರ: {report.nakshatra} (ಪಾದ {report.nakshatraPada})
              </span>
              <span className="rounded-lg bg-black/40 px-2.5 py-1 border border-amber-500/30">
                🕉️ ಗೋತ್ರ: {report.gotra}
              </span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-2.5">
            <button
              type="button"
              onClick={handlePlayVoiceSummary}
              className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-black shadow-lg transition-all ${
                isPlayingAudio
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-amber-500 hover:bg-amber-400 text-neutral-950"
              }`}
            >
              <span>{isPlayingAudio ? "⏹️" : "🎙️"}</span>
              <span>{isPlayingAudio ? "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)" : "ದೈವಜ್ಞ ಧ್ವನಿ ಆಲಿಸಿ (Play Voice)"}</span>
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => void handleDownloadPdf()}
              className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400 bg-amber-950/80 hover:bg-amber-900 px-5 py-3 text-xs font-black text-amber-200 shadow-lg transition-all disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <div className="h-4 w-4 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
              ) : (
                <span>📄</span>
              )}
              <span>{isGeneratingPdf ? "PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "೭-ಪುಟಗಳ ಮಹಾ ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)"}</span>
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-amber-500/30 pt-4 text-xs font-bold">
          <div className="flex items-center gap-2 text-amber-300">
            <span>🌐 ವರದಿ ಭಾಷೆ (Language):</span>
            <div className="flex gap-1">
              {(["kn", "en", "hi", "ta", "te"] as BhagyodayaLang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setReportLang(l)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase transition ${
                    reportLang === l
                      ? "bg-amber-400 text-black shadow-md"
                      : "bg-black/40 text-amber-200 hover:bg-amber-900/60"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[11px] text-amber-300/70">
            ಪೂಜ್ಯ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ವೇದ ಗಣಿತ ಮತ್ತು ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಾಮಾಣಿಕ ಸೂತ್ರಗಳು
          </span>
        </div>
      </div>

      {/* ── 7-PILLAR TAB NAVIGATOR ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "🌟 ಸಮಗ್ರ ದರ್ಶನ (All 7 Pillars)", icon: "✦" },
          { id: "wealth", label: "💰 ಧನ & ಋಣ ಮುಕ್ತಿ", icon: "🪙" },
          { id: "relationship", label: "❤️ ವಿವಾಹ & ಸಂತಾನ", icon: "💍" },
          { id: "health", label: "🌿 ಆಯುರ್ ಆರೋಗ್ಯ ರಕ್ಷೆ", icon: "🛡️" },
          { id: "protection", label: "🛡️ ದೃಷ್ಟಿ & ಗ್ರಹ ರಕ್ಷಾ ಕವಚ", icon: "⚡" },
          { id: "milestones", label: "🌟 ೧೦-ವರ್ಷ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲು", icon: "🗓️" },
          { id: "karma", label: "💎 ರತ್ನ & ನಿತ್ಯ ಕರ್ಮ", icon: "📿" },
          { id: "temple", label: "🪔 ಗೋಕರ್ಣ ಸಂಕಲ್ಪ ಸೇವೆ", icon: "🕉️" }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabPillarKey)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 shadow-lg scale-105"
                : "bg-white dark:bg-neutral-900 border border-amber-400/30 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── PILLAR 1: WEALTH & DEBT FREEDOM ── */}
      {(activeTab === "all" || activeTab === "wealth") && (
        <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-950/30 via-black to-slate-950 p-6 md:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400 bg-amber-900/60 text-2xl">
                💰
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-amber-200">
                  ೧. ಧನ ಪ್ರಾಪ್ತಿ, ಮಹಾ ಯೋಗ & ಋಣ ವಿಮೋಚನ ರಹಸ್ಯ
                </h3>
                <p className="text-xs text-amber-300/70">
                  Wealth Breakout Timeline, Dhana Yogas & Debt Liberation Blueprint
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-400">ಧನ ಯೋಗ ಸಾಮರ್ಥ್ಯ</span>
              <div className="text-xl md:text-2xl font-black text-yellow-300">
                {report.wealth.dhanaYogaScore} / ೧೦೦
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-black/50 p-4 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>🌟</span>
                <span>ಪ್ರಮುಖ ಧನ ಯೋಗ: {report.wealth.dhanaYogaName}</span>
              </span>
              <p className="text-xs leading-relaxed text-amber-100/90">
                {report.wealth.wealthVerdict}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>⌛</span>
                <span>ಋಣ ವಿಮೋಚನ ಕಾಲಾವಧಿ (Debt Freedom Window):</span>
              </span>
              <p className="text-xs leading-relaxed text-emerald-200 font-bold">
                {report.wealth.runaVimochanaTimeline}
              </p>
              <div className="text-[11px] text-emerald-300/80 pt-1">
                ಸೂಕ್ತ ಆದಾಯ ದಿಕ್ಕು: <strong className="text-yellow-300">{report.wealth.optimalWealthDirection}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 space-y-2">
            <span className="text-xs font-bold text-amber-300">🏢 ಅದೃಷ್ಟ ತರುವ ಪ್ರಮುಖ ಉದ್ಯೋಗ / ವ್ಯಾಪಾರ ರಂಗಗಳು:</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {report.wealth.goldenCareerSectors.map((sector, i) => (
                <span key={i} className="rounded-xl bg-black/60 border border-amber-400/40 px-3 py-1.5 text-xs text-amber-100 font-bold">
                  ✓ {sector}
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs text-yellow-200/90 border-t border-amber-500/20 pt-2">
              <strong>🪔 ಕುಬೇರ ಪರಿಹಾರ:</strong> {report.wealth.kuberaRemedy}
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 2: MARRIAGE & CHILDREN ── */}
      {(activeTab === "all" || activeTab === "relationship") && (
        <div className="rounded-3xl border-2 border-rose-400/50 bg-gradient-to-br from-rose-950/30 via-black to-slate-950 p-6 md:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400 bg-rose-900/60 text-2xl">
                ❤️
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-rose-200">
                  ೨. ವಿವಾಹ ಯೋಗ, ದಾಂಪತ್ಯ ಸುಖ & ಸಂತಾನ ಭಾಗ್ಯ
                </h3>
                <p className="text-xs text-rose-300/70">
                  Marriage Timing Window, Soul Partner Attributes & Family Harmony
                </p>
              </div>
            </div>
            <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-400/40">
              {report.relationship.dampatyaHarmonyRating}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-rose-500/30 bg-black/50 p-4 space-y-2">
              <span className="text-xs font-bold text-rose-400">💍 ಕಂಕಣ ಭಾಗ್ಯ ಕಾಲಾವಧಿ:</span>
              <p className="text-sm font-black text-amber-200">
                {report.relationship.vivahaYogaWindow}
              </p>
              <div className="text-xs text-rose-200/80 pt-1">
                ಸಂಗಾತಿಯ ಬರುವ ದಿಕ್ಕು: <strong className="text-yellow-300">{report.relationship.spouseDirection}</strong>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-black/50 p-4 space-y-2">
              <span className="text-xs font-bold text-rose-400">👶 ಸಂತಾನ ಭಾಗ್ಯ ಕಾಲಾವಧಿ:</span>
              <p className="text-sm font-black text-emerald-300">
                {report.relationship.santathiBlessingWindow}
              </p>
              <p className="text-xs text-rose-200/80">
                ಜೀವನ ಸಂಗಾತಿ ಲಕ್ಷಣ: {report.relationship.spouseCharacteristics}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-100">
            <strong>🪔 ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಪರಿಹಾರ:</strong> {report.relationship.relationshipRemedy}
          </div>
        </div>
      )}

      {/* ── PILLAR 3: HEALTH & VITALITY ── */}
      {(activeTab === "all" || activeTab === "health") && (
        <div className="rounded-3xl border-2 border-teal-400/50 bg-gradient-to-br from-teal-950/30 via-black to-slate-950 p-6 md:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-400 bg-teal-900/60 text-2xl">
                🌿
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-teal-200">
                  ೩. ಆಯುರ್ ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ & ದೀರ್ಘಾಯುಷ್ಯ ರಹಸ್ಯ
                </h3>
                <p className="text-xs text-teal-300/70">
                  Health Constitution, Disease Prevention & Natural Herbal Vitality
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-teal-400">ಪ್ರಕೃತಿ ದೋಷ</span>
              <div className="text-base font-black text-teal-300">
                {report.health.constitutionDosha} ಪ್ರಕೃತಿ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-teal-500/30 bg-black/50 p-4 space-y-2">
              <span className="text-xs font-bold text-teal-400">🌱 ಆಯುರ್ ಸಂಜೀವಿನಿ ಗಿಡಮೂಲಿಕೆಗಳು:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {report.health.ayurSanjeeviniHerbs.map((h, i) => (
                  <span key={i} className="rounded-xl bg-teal-950/80 border border-teal-400/40 px-3 py-1 text-xs text-teal-200 font-bold">
                    🌿 {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-teal-500/30 bg-black/50 p-4 space-y-2">
              <span className="text-xs font-bold text-teal-400">🛡️ ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷಾ ಕವಚ:</span>
              <p className="text-xs leading-relaxed text-teal-100">
                {report.health.mahaMrityunjayaShield}
              </p>
              <p className="text-xs text-yellow-200/80 pt-1">
                <strong>ದೈನಂದಿನ ಆಹಾರ ಕ್ರಮ:</strong> {report.health.dailyDietRitual}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 4: PROTECTION & EVIL EYE ── */}
      {(activeTab === "all" || activeTab === "protection") && (
        <div className="rounded-3xl border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-950/30 via-black to-slate-950 p-6 md:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400 bg-indigo-900/60 text-2xl">
                🛡️
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-indigo-200">
                  ೪. ದೃಷ್ಟಿ ದೋಷ, ಶತ್ರು ಬಾಧಾ & ಗ್ರಹ ದೋಷ ನಿವಾರಣಾ ಕವಚ
                </h3>
                <p className="text-xs text-indigo-300/70">
                  Evil Eye Protection, Enemy Shield & Sudarshana Raksha Mantra
                </p>
              </div>
            </div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-400/40">
              ದೃಷ್ಟಿ ಪ್ರಭಾವ: {report.protection.drishtiSensitivityLevel}
            </span>
          </div>

          <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/40 p-5 space-y-3">
            <span className="text-xs font-black uppercase text-amber-300">
              ⚡ ಶ್ರೀ ಮಹಾಸುದರ್ಶನ ರಕ್ಷಾ ಮಂತ್ರ (Sudarshana Shield):
            </span>
            <div className="rounded-xl bg-black/70 p-3.5 font-serif text-sm font-black text-amber-200 tracking-wide border border-amber-500/30">
              {report.protection.sudarshanaKavachaMantra}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-200 pt-2">
              <div>
                <strong>ರಕ್ಷಾ ಸೂತ್ರ ಧಾರಣೆ ಸಮಯ:</strong> {report.protection.rakshaSutraTiming}
              </div>
              <div>
                <strong>ಮನೆ ಮತ್ತು ವ್ಯವಹಾರ ರಕ್ಷೆ:</strong> {report.protection.homeEnergyRemedy}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 5: 10-YEAR GOLDEN MILESTONES (2026 - 2036) ── */}
      {(activeTab === "all" || activeTab === "milestones") && (
        <div className="rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-neutral-950 via-slate-950 to-amber-950/40 p-6 md:p-8 text-white shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400 bg-amber-900/60 text-2xl">
                🌟
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-amber-200">
                  ೫. ಮುಂದಿನ ೧೦ ವರ್ಷಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು (2026 – 2036)
                </h3>
                <p className="text-xs text-amber-300/70">
                  Year-by-Year Turning Points, Breakthrough Opportunities & Life Guidance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-yellow-400">● ಸ್ವರ್ಣಾವಧಿ</span>
              <span className="flex items-center gap-1 text-emerald-400">● ಸ್ಥಿರ ಪ್ರಗತಿ</span>
              <span className="flex items-center gap-1 text-amber-300">● ಶಾಂತಿ ಅವಧಿ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {report.milestones.map((m) => {
              const isSelected = selectedMilestoneYear === m.year;
              const cardBorder = m.rating === "golden"
                ? "border-amber-400 bg-amber-950/30 hover:border-yellow-300"
                : m.rating === "growth"
                ? "border-emerald-500/50 bg-emerald-950/20 hover:border-emerald-400"
                : "border-slate-600 bg-slate-900/40 hover:border-slate-400";

              return (
                <div
                  key={m.year}
                  onClick={() => setSelectedMilestoneYear(isSelected ? null : m.year)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 ${cardBorder} ${
                    isSelected ? "ring-2 ring-amber-400 scale-[1.03] shadow-2xl" : "hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <span className="text-base font-black text-amber-200">{m.year}</span>
                    <span className="text-[10px] text-slate-400 font-bold">ವಯಸ್ಸು: {m.age}</span>
                  </div>
                  <div className="mt-2 text-xs font-black text-yellow-300 line-clamp-2">
                    {m.theme}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-amber-400/80">
                    {m.ratingLabel}
                  </div>
                  <p className="mt-2 text-[11px] leading-snug text-slate-300 line-clamp-3">
                    {m.astrologicalReason}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Milestone Deep-Dive Modal / Expanded Card */}
          {selectedMilestoneYear && (
            <div className="rounded-2xl border-2 border-amber-400 bg-black/80 p-5 space-y-3 animate-fade-in shadow-2xl">
              {(() => {
                const sel = report.milestones.find((m) => m.year === selectedMilestoneYear);
                if (!sel) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                      <h4 className="text-base font-black text-amber-300">
                        🗓️ {sel.year} ನೇ ವರ್ಷದ ಸಮಗ್ರ ದರ್ಶನ (Age {sel.age}): {sel.theme}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedMilestoneYear(null)}
                        className="text-xs text-amber-400 hover:text-white"
                      >
                        ✕ ಮುಚ್ಚಿ
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong className="text-amber-400">ಗ್ರಹ ಸಂಚಾರ & ಕಾರಣ:</strong>
                        <p className="text-slate-200 mt-1">{sel.astrologicalReason}</p>
                      </div>
                      <div>
                        <strong className="text-emerald-400">ಅತ್ಯಂತ ಶುಭ ತಿಂಗಳುಗಳು:</strong>
                        <p className="text-slate-200 mt-1">{sel.favorableMonths.join(", ")}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs bg-amber-950/60 p-3 rounded-xl border border-amber-500/30 text-amber-200 font-bold">
                      💡 ನಿಮ್ಮ ಕರ್ತವ್ಯ ಮಾರ್ಗದರ್ಶನ: {sel.actionableGuidance}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── PILLAR 6: GEMSTONE, RUDRAKSHA & 5-MIN MORNING ROUTINE ── */}
      {(activeTab === "all" || activeTab === "karma") && (
        <div className="rounded-3xl border-2 border-yellow-400/50 bg-gradient-to-br from-neutral-950 via-slate-950 to-amber-950/40 p-6 md:p-8 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400 bg-yellow-950/60 text-2xl">
                💎
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-yellow-200">
                  ೬. ಭಾಗ್ಯ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ೫-ನಿಮಿಷದ ದೈನಂದಿನ ಕರ್ಮ ಸಂಕಲ್ಪ
                </h3>
                <p className="text-xs text-amber-300/70">
                  Lucky Gemstone, Mukhi Rudraksha & 5-Minute Daily Morning Sanskrit Blueprint
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gemstone */}
            <div className="rounded-2xl border border-amber-500/40 bg-black/60 p-5 space-y-3">
              <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                <span>💍</span>
                <span>ಜನ್ಮ ಭಾಗ್ಯ ರತ್ನ: {report.karmaBlueprint.bhagyaGemstone.name}</span>
              </span>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-1.5 text-slate-400">ತೂಕ (Weight):</td>
                    <td className="py-1.5 font-bold text-right text-amber-200">{report.karmaBlueprint.bhagyaGemstone.weightRatti}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-1.5 text-slate-400">ಲೋಹ (Metal):</td>
                    <td className="py-1.5 font-bold text-right text-amber-200">{report.karmaBlueprint.bhagyaGemstone.metal}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-1.5 text-slate-400">ಬೆರಳು (Finger):</td>
                    <td className="py-1.5 font-bold text-right text-amber-200">{report.karmaBlueprint.bhagyaGemstone.finger}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-slate-400">ಧಾರಣೆ ದಿನ:</td>
                    <td className="py-1.5 font-bold text-right text-yellow-300">{report.karmaBlueprint.bhagyaGemstone.consecrationDay}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-amber-300/80 italic">
                ⚠️ {report.karmaBlueprint.bhagyaGemstone.caution}
              </p>
            </div>

            {/* Rudraksha & 5-Minute Routine */}
            <div className="rounded-2xl border border-amber-500/40 bg-black/60 p-5 space-y-3">
              <span className="text-xs font-black uppercase text-emerald-300 flex items-center gap-1.5">
                <span>📿</span>
                <span>ಜನ್ಮ ರುದ್ರಾಕ್ಷಿ: {report.karmaBlueprint.rudrakshaMukhi}</span>
              </span>
              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-amber-300">ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಬೇಕಾದ ಮಂತ್ರ:</strong>
                  <div className="mt-1 rounded-xl bg-amber-950/80 p-2.5 font-serif font-black text-amber-200 border border-amber-500/30">
                    {report.karmaBlueprint.fiveMinuteMorningRoutine.prescribedMantra}
                  </div>
                </div>
                <div className="flex justify-between text-slate-300 pt-1">
                  <span>ಪಠಣ ಸಂಖ್ಯೆ: <strong className="text-yellow-300">{report.karmaBlueprint.fiveMinuteMorningRoutine.chantCount} ಬಾರಿ</strong></span>
                  <span>ಮುಖ ಮಾಡುವ ದಿಕ್ಕು: <strong className="text-yellow-300">{report.karmaBlueprint.fiveMinuteMorningRoutine.facingDirection}</strong></span>
                </div>
                <p className="text-[11px] text-slate-300 pt-1">
                  <strong>ದಾನ ಧರ್ಮ:</strong> {report.karmaBlueprint.charityAction}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 7: GOKARNA TEMPLE SEVA & SANKALPA ── */}
      {(activeTab === "all" || activeTab === "temple") && (
        <div className="rounded-3xl border-2 border-amber-500 bg-gradient-to-br from-amber-950 via-slate-950 to-neutral-900 p-6 md:p-8 text-white shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400 bg-amber-900/80 text-2xl">
                🪔
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-amber-200">
                  ೭. ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರ ಅರ್ಚನಾ ಸಂಕಲ್ಪ & ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೇವೆ
                </h3>
                <p className="text-xs text-amber-300/70">
                  Consecrated Temple Archana, Daily Prasada & 90-Day Ashirvada Pass
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPage("seva")}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-xs font-black text-black shadow-lg hover:scale-105 transition"
            >
              🪔 ಸೇವೆಗೆ ನೋಂದಾಯಿಸಿ (Book Seva)
            </button>
          </div>

          <div className="rounded-2xl border border-amber-400/40 bg-black/60 p-5 space-y-3">
            <div className="text-xs text-amber-300 font-bold">
              ದೇವರ ಸನ್ನಿಧಿ: <strong>{report.templeBlessing.deity}</strong> ({report.templeBlessing.templeName})
            </div>
            <div className="rounded-xl bg-amber-950/80 p-4 font-serif text-sm font-black text-amber-200 border border-amber-500/40 leading-relaxed">
              ॥ {report.templeBlessing.specialSankalpaMantra} ॥
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ಈ ವಿಶೇಷ ಸಂಕಲ್ಪವನ್ನು ಪ್ರತಿದಿನ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಮುಖಾಂತರ ಗೋಕರ್ಣದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಂದ ನಿಮ್ಮ ಗೋತ್ರ ಮತ್ತು ನಕ್ಷತ್ರದ ಹೆಸರಿನಲ್ಲಿ ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.
            </p>
          </div>
        </div>
      )}

      {/* ── HIDDEN 7-PAGE PRINTABLE / EXPORTABLE PDF CONTAINER ── */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="bhagyodaya-pdf-container" className="w-[800px] bg-white text-slate-900 p-8 space-y-6 font-sans">
          {/* Header */}
          <div className="border-4 border-amber-600 rounded-3xl p-6 text-center bg-amber-50/50 space-y-2">
            <div className="text-2xl font-black text-amber-900 tracking-wide">
              ॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥
            </div>
            <div className="text-xl font-bold text-slate-800">
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ • ಗೋಕರ್ಣ
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-amber-800 border-t border-amber-300 pt-2">
              ಮಹಾಭಾಗ್ಯೋದಯ & ಜೀವನ ಸಂಜೀವಿನಿ ರಹಸ್ಯ ಪತ್ರ (Life Master Dossier)
            </div>
          </div>

          {/* Devotee Bio Strip */}
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-100/40 p-4 text-xs font-bold grid grid-cols-3 gap-2">
            <div>ಭಕ್ತರ ಹೆಸರು: <strong className="text-amber-950">{report.devoteeName}</strong></div>
            <div>ಜನ್ಮ ದಿನಾಂಕ: <strong>{report.birthDate}</strong></div>
            <div>ಜನ್ಮ ಸಮಯ: <strong>{report.birthTime}</strong></div>
            <div>ಲಗ್ನ: <strong>{report.lagnaRashi}</strong></div>
            <div>ರಾಶಿ: <strong>{report.moonRashi}</strong></div>
            <div>ನಕ್ಷತ್ರ: <strong>{report.nakshatra}</strong></div>
            <div>ಗೋತ್ರ: <strong>{report.gotra}</strong></div>
            <div>ರಾಶ್ಯಾಧಿಪತಿ: <strong>{report.rashiLord}</strong></div>
            <div>ಲಗ್ನಾಧಿಪತಿ: <strong>{report.lagnaLord}</strong></div>
          </div>

          {/* 7 Pillars Print Cards */}
          <div className="border-2 border-amber-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-amber-950">೧. ಧನ ಪ್ರಾಪ್ತಿ & ಋಣ ವಿಮೋಚನ</h3>
            <p className="text-xs leading-relaxed text-slate-800">{report.wealth.wealthVerdict}</p>
            <p className="text-xs font-bold text-emerald-800">ಋಣ ಮುಕ್ತಿ ಕಾಲ: {report.wealth.runaVimochanaTimeline}</p>
          </div>

          <div className="border-2 border-rose-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-rose-950">೨. ವಿವಾಹ, ದಾಂಪತ್ಯ & ಸಂತಾನ</h3>
            <p className="text-xs leading-relaxed text-slate-800">{report.relationship.spouseCharacteristics}</p>
            <p className="text-xs font-bold text-rose-900">ವಿವಾಹ ಕಾಲಾವಧಿ: {report.relationship.vivahaYogaWindow}</p>
          </div>

          <div className="border-2 border-teal-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-teal-950">೩. ಆಯುರ್ ಆರೋಗ್ಯ & ದೀರ್ಘಾಯುಷ್ಯ</h3>
            <p className="text-xs text-slate-800">{report.health.mahaMrityunjayaShield}</p>
            <p className="text-xs font-bold text-teal-900">ಆಯುರ್ ಸಂಜೀವಿನಿ ಗಿಡಮೂಲಿಕೆಗಳು: {report.health.ayurSanjeeviniHerbs.join(", ")}</p>
          </div>

          <div className="border-2 border-indigo-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-indigo-950">೪. ದೃಷ್ಟಿ & ಶತ್ರು ಬಾಧಾ ನಿವಾರಣೆ</h3>
            <div className="font-serif text-xs font-bold bg-amber-50 p-2 border border-amber-300 rounded-lg">
              {report.protection.sudarshanaKavachaMantra}
            </div>
          </div>

          <div className="border-2 border-amber-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-amber-950">೫. ಮುಂದಿನ ೧೦ ವರ್ಷಗಳ ಸುವರ್ಣ ಮೈಲಿಗಲ್ಲುಗಳು</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {report.milestones.slice(0, 6).map((m) => (
                <div key={m.year} className="border border-amber-200 p-2 rounded-lg bg-amber-50/40">
                  <strong>{m.year} (Age {m.age}):</strong> {m.theme}
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-yellow-500 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-black text-yellow-950">೬. ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ನಿತ್ಯ ಸಂಕಲ್ಪ</h3>
            <p className="text-xs">
              ಭಾಗ್ಯ ರತ್ನ: <strong>{report.karmaBlueprint.bhagyaGemstone.name}</strong> ({report.karmaBlueprint.bhagyaGemstone.weightRatti})
            </p>
            <p className="text-xs">
              ರುದ್ರಾಕ್ಷಿ: <strong>{report.karmaBlueprint.rudrakshaMukhi}</strong>
            </p>
          </div>

          {/* Footer Seal */}
          <div className="border-t-2 border-amber-600 pt-4 text-center text-xs font-bold text-amber-950">
            <div>ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಅಧಿಕೃತ ಜಾತಕ ರಹಸ್ಯ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಆಶೀರ್ವಾದದೊಂದಿಗೆ</div>
            <div className="text-[10px] text-slate-500 mt-1">Gokarna Heritage Vedic Computation Engine</div>
          </div>
        </div>
      </div>
    </div>
  );
}
