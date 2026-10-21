import React, { useState, useMemo, useEffect } from "react";
import { useAppStore, type SupportedLanguage } from "../../stores/appStore";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { useWalletStore } from "../wallet/walletStore";
import { calculateKarmaMandalaSynthesis } from "./karmaCalculations";
import { CosmicRadarChart } from "./CosmicRadarChart";
import { JapaMandalaCounter } from "./JapaMandalaCounter";
import { GokarnaSevaBookingModal } from "./GokarnaSevaBookingModal";
import { KarmaShareLinkModal } from "./KarmaShareLinkModal";
import { KARMA_MANDALA_5L } from "./karmaMandalaLocale";
import type { FrictionNode, GokarnaSevaRecommendation } from "./karmaMandalaTypes";
import { calculateKundli } from "../../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../../core/AstroTypes";
import { degreeToNakshatra, degreeToRashi } from "../../core/AstroMath";
import { decodeDevoteeToken, type DevoteeTokenPayload } from "../../utils/tokenCipher";

// Default authentic fallback chart if no active devotee session exists
const DEFAULT_DEMO_INPUT: KundliInput = {
  name: "ಶ್ರೀ ಭಕ್ತ / Devotee",
  birthDate: "1990-05-15",
  birthTime: "10:30",
  latitude: 14.5479,
  longitude: 74.3188
};

export const KarmaMandalaPage: React.FC = () => {
  const language = (useAppStore((s) => s.language) || "kn") as SupportedLanguage;
  const setPage = useAppStore((s) => s.setPage);
  const session = useKundliViewerStore((s) => s.session);

  const wallet = useWalletStore((s) => s.wallet);
  const deductForService = useWalletStore((s) => s.deductForService);
  const openRechargeModal = useWalletStore((s) => s.openRechargeModal);

  const [showPostRemedy, setShowPostRemedy] = useState<boolean>(false);
  const [activePillarId, setActivePillarId] = useState<string>("sade_sati");
  const [selectedSeva, setSelectedSeva] = useState<GokarnaSevaRecommendation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>("");

  // Standalone End-User Token & Expiration State
  const [tokenPayload, setTokenPayload] = useState<DevoteeTokenPayload | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Check for incoming token on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const rawToken = urlParams.get("token") || urlParams.get("karmaToken") || urlParams.get("id");
    if (!rawToken) return;

    const decoded = decodeDevoteeToken(rawToken);
    if (decoded) {
      setTokenPayload(decoded);
      setIsStandalone(true);
      setIsUnlocked(true); // Token links granted by Priest/Admin auto-unlock the sacred dossier!

      if (decoded.exp) {
        const diffMs = decoded.exp - Date.now();
        if (diffMs <= 0) {
          setIsExpired(true);
        } else {
          setRemainingSeconds(Math.floor(diffMs / 1000));
        }
      }
    }
  }, []);

  // Countdown timer for 20-min / expiring token
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Live countdown clock state
  const [nowDate, setNowDate] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute or obtain chart
  const chartOutput: KundliOutput = useMemo(() => {
    if (tokenPayload) {
      const birthDate = tokenPayload.dob || "1993-03-16";
      const birthTime = tokenPayload.tob || "01:40";
      const lat = tokenPayload.lat ?? tokenPayload.lt ?? 14.5479;
      const lng = tokenPayload.lng ?? tokenPayload.lg ?? 74.3188;
      const name = tokenPayload.name || tokenPayload.n || "ಶ್ರೀ ಭಕ್ತ";
      return calculateKundli(
        {
          name,
          birthDate,
          birthTime,
          latitude: lat,
          longitude: lng
        },
        { ayanamsaModel: "lahiri" }
      );
    }
    if (session?.result) {
      return session.result;
    }
    return calculateKundli(DEFAULT_DEMO_INPUT, { ayanamsaModel: "lahiri" });
  }, [tokenPayload, session]);

  const devoteeName = tokenPayload?.name || tokenPayload?.n || session?.input?.name || "ಶ್ರೀ ಭಕ್ತ (Devotee)";

  // Dynamic Karma Synthesis
  const synthesis = useMemo(() => {
    return calculateKarmaMandalaSynthesis(chartOutput, {
      evalDate: nowDate,
      devoteeName,
      isUnlocked
    });
  }, [chartOutput, nowDate, devoteeName, isUnlocked]);

  const activeNode = useMemo(() => {
    return (
      synthesis.nodes.find((n) => n.id === activePillarId) ||
      synthesis.highestCrisisNode
    );
  }, [synthesis, activePillarId]);

  // Handle Seva Booking Click
  const handleOpenSevaBooking = (seva: GokarnaSevaRecommendation) => {
    setSelectedSeva(seva);
    setIsBookingModalOpen(true);
  };

  // Handle 50 Coins Unlock for Full Dossier
  const handleUnlockDossier = async () => {
    const coinBalance = wallet?.coinBalance ?? 0;
    if (coinBalance < 50) {
      setUnlockError(
        KARMA_MANDALA_5L.wallet.insufficientBalance[language] ||
        KARMA_MANDALA_5L.wallet.insufficientBalance.kn
      );
      openRechargeModal();
      return;
    }

    setUnlockError("");
    const res = await deductForService(50, "Karma Mandala Dossier Unlock", devoteeName);
    if (res.success) {
      setIsUnlocked(true);
    } else {
      setUnlockError(res.error || "Unlock transaction failed");
    }
  };

  // Format hours remaining into Days and Hours string
  const formatTimeRemaining = (hours: number): string => {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    if (days > 0) {
      return `${days} ದಿನ ${remHours} ಗಂಟೆ (${days}d ${remHours}h)`;
    }
    return `${hours} ಗಂಟೆ (${hours}h)`;
  };

  const tHeader = KARMA_MANDALA_5L.header;
  const tRadar = KARMA_MANDALA_5L.radar;

  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#06040d] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border-2 border-red-500/50 rounded-2xl p-6 text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center text-3xl">
            ⏳
          </div>
          <h2 className="text-xl font-serif font-black text-amber-200">
            ಈ ದೈವಿಕ ಲಿಂಕ್‌ನ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            ತಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಕರ್ಮ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಕವಚ ವೀಕ್ಷಣೆಯ ನಿಗದಿತ ಕಾಲಾವಧಿ (೨೦ ನಿಮಿಷ / ಅವಧಿ) ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಹೊಸ ಲಿಂಕ್ ಪಡೆಯಲು ಅಥವಾ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ ಸಂಕಲ್ಪಕ್ಕಾಗಿ ಮುಖ್ಯ ಅರ್ಚಕರನ್ನು ಸಂಪರ್ಕಿಸಿ:
          </p>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 font-serif font-bold text-sm">
            ಮುಖ್ಯ ಅರ್ಚಕರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್
          </div>
          <a
            href="tel:9972339362"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm py-2.5 px-4 rounded-xl shadow-lg transition"
          >
            <span>📞</span>
            <span>ಅರ್ಚಕರ ನೇರ ಸಂಪರ್ಕ: 9972339362</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06040d] text-slate-100 pb-20 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sacred Top Glow Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />

      {/* Navigation Breadcrumb / Standalone Banner */}
      {isStandalone ? (
        <div className="max-w-md mx-auto pt-4 px-4 text-center space-y-2">
          <img
            src="/baggona_panchanga_gold_banner.jpg"
            alt="॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥"
            className="w-full rounded-xl shadow-lg border border-amber-500/40"
          />
          {remainingSeconds !== null && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-mono font-bold animate-pulse">
              <span>⏳</span>
              <span>
                ಸಮಾಲೋಚನಾ ರಕ್ಷಾ ಕವಚ ಮಾನ್ಯತೆ: {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, "0")} ನಿಮಿಷ ಬಾಕಿ
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 pt-4 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            <span>←</span>
            <span>ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Home)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              <span>🔗</span>
              <span>ಭಕ್ತರ ಲಿಂಕ್ ರಚಿಸಿ (Share Link)</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30">
              <span className="text-sm">🪙</span>
              <span className="font-mono font-bold text-amber-300">
                {(wallet?.coinBalance ?? 0).toLocaleString()} Coins
              </span>
            </div>
            <button
              onClick={() => openRechargeModal()}
              className="px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all text-[11px]"
            >
              + Recharge
            </button>
          </div>
        </div>
      )}

      {/* Main Header Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-3">
          <span>🪔</span>
          <span>ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ</span>
        </div>

        <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-wide drop-shadow-md">
          {tHeader.pageTitle[language] || tHeader.pageTitle.kn}
        </h1>

        <p className="max-w-3xl mx-auto text-xs md:text-sm text-slate-300 mt-2.5 leading-relaxed font-sans">
          {tHeader.pageSubtitle[language] || tHeader.pageSubtitle.kn}
        </p>

        {/* Devotee Astrological Identity Ribbon */}
        <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg text-xs md:text-sm text-amber-200">
          <span className="font-bold text-amber-400">{synthesis.devoteeName}</span>
          <span className="text-amber-500">•</span>
          <span>{synthesis.lagnaName[language] || synthesis.lagnaName.kn} ಲಗ್ನ</span>
          <span className="text-amber-500">•</span>
          <span>{synthesis.chandraRashiName[language] || synthesis.chandraRashiName.kn} ರಾಶಿ</span>
          <span className="text-amber-500">•</span>
          <span>{synthesis.nakshatraName[language] || synthesis.nakshatraName.kn} ನಕ್ಷತ್ರ</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CRITICAL PLANETARY CRISIS ALERT BANNER */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 my-5">
        <div className="rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-red-950/70 via-slate-950 to-amber-950/60 p-4 md:p-6 shadow-[0_10px_35px_rgba(239,68,68,0.25)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-3xl md:text-4xl animate-pulse">⚡</span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                {tRadar.criticalAlertBadge[language] || tRadar.criticalAlertBadge.kn}
              </div>
              <h2 className="text-base md:text-lg font-bold text-white">
                {synthesis.highestCrisisNode.title[language] || synthesis.highestCrisisNode.title.kn} (
                {synthesis.highestCrisisNode.frictionScore}% ಘರ್ಷಣೆ)
              </h2>
              <p className="text-xs text-red-200/90 mt-1 max-w-xl leading-relaxed">
                {synthesis.highestCrisisNode.primaryAffliction[language] ||
                  synthesis.highestCrisisNode.primaryAffliction.kn}
              </p>
            </div>
          </div>

          {/* Quick Action Button to Book Seva */}
          <button
            onClick={() => handleOpenSevaBooking(synthesis.highestCrisisNode.gokarnaSeva)}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs md:text-sm shadow-xl hover:from-amber-400 hover:to-yellow-400 transition-all transform active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <span>🪔</span>
            <span>ಗೋಕರ್ಣ ಪರಿಹಾರ ಸೇವೆ ಬುಕ್ ಮಾಡಿ</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: INTERACTIVE COSMIC FRICTION RADAR & POST-RELIEF HARMONY */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 my-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Visual Radar Mandala */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Toggle Modes */}
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-900 border border-amber-500/30 mb-4 shadow-inner">
              <button
                onClick={() => setShowPostRemedy(false)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  !showPostRemedy
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tRadar.toggleLiveFriction[language] || tRadar.toggleLiveFriction.kn}
              </button>
              <button
                onClick={() => setShowPostRemedy(true)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  showPostRemedy
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tRadar.togglePostRelief[language] || tRadar.togglePostRelief.kn}
              </button>
            </div>

            {/* SVG Cosmic Radar Chart */}
            <CosmicRadarChart
              nodes={synthesis.nodes}
              activePillarId={activePillarId}
              onSelectNode={(n) => setActivePillarId(n.id)}
              showPostRemedy={showPostRemedy}
              language={language}
            />

            {/* Dual Score Indicators */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-red-500/30 text-center">
                <div className="text-[11px] text-red-300 font-medium">
                  {tRadar.frictionScoreLabel[language] || tRadar.frictionScoreLabel.kn}
                </div>
                <div className="text-2xl font-black font-mono text-red-400 mt-0.5">
                  {synthesis.overallFrictionScore}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center">
                <div className="text-[11px] text-emerald-300 font-medium">
                  {tRadar.harmonyScoreLabel[language] || tRadar.harmonyScoreLabel.kn}
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  {synthesis.overallHarmonyScore}%
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Node Deep Breakdown */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-slate-900/95 via-[#0d091e] to-slate-950 p-5 md:p-6 shadow-2xl relative">
              <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                    ಆಯ್ದ ಗ್ರಹ ಪೀಡಾ ವಿಶ್ಲೇಷಣೆ
                  </span>
                  <h3 className="text-lg md:text-xl font-bold font-serif text-amber-200">
                    {activeNode.title[language] || activeNode.title.kn}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold">
                  <span>ತೀವ್ರತೆ:</span>
                  <span className="font-mono">{activeNode.frictionScore}%</span>
                </div>
              </div>

              {/* Transit Context */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-amber-100/90 mb-3.5 leading-relaxed font-sans">
                {activeNode.transitContext[language] || activeNode.transitContext.kn}
              </div>

              {/* Classical Authority Quote */}
              <div className="mb-3.5">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  ಶಾಸ್ತ್ರೀಯ ಆಧಾರ (Classical Shastra Authority):
                </span>
                <span className="text-xs text-amber-300 font-serif italic bg-amber-950/30 px-2.5 py-1 rounded border border-amber-500/20 inline-block">
                  {activeNode.classicalAuthority[language] || activeNode.classicalAuthority.kn}
                </span>
              </div>

              {/* Immediate Priority Action */}
              <div className="mb-4">
                <span className="text-[11px] font-bold text-amber-300 block mb-1">
                  🎯 ತಕ್ಷಣದ ಪರಿಹಾರ ಮಾರ್ಗದರ್ಶನ (Immediate Action):
                </span>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/70 p-3 rounded-xl border border-amber-500/20">
                  {activeNode.immediateAction[language] || activeNode.immediateAction.kn}
                </p>
              </div>

              {/* Recommended Gokarna Seva Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs md:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🪔</span>
                    <span>{activeNode.gokarnaSeva.name[language] || activeNode.gokarnaSeva.name.kn}</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ₹{activeNode.gokarnaSeva.costInRupees}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {activeNode.gokarnaSeva.significance[language] || activeNode.gokarnaSeva.significance.kn}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleOpenSevaBooking(activeNode.gokarnaSeva)}
                    className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>ಸಂಕಲ್ಪ ಸೇವೆ ಬುಕ್ ಮಾಡಿ</span>
                  </button>
                  <a
                    href={`tel:${activeNode.gokarnaSeva.priestPhone}`}
                    className="py-2 px-3 rounded-lg bg-slate-900 border border-amber-500/30 hover:bg-slate-800 text-amber-200 text-xs font-medium text-center"
                  >
                    ಅರ್ಚಕರಿಗೆ ಕರೆ: {activeNode.gokarnaSeva.priestPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: UPCOMING HIGH-POTENCY GOKARNA MUHURTHA TIMELINE */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 my-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold font-serif text-amber-300 flex items-center gap-2">
              <span>🔔</span>
              <span>ಗೋಕರ್ಣ ಪರಿಹಾರ ಮುಹೂರ್ತ ದಿಕ್ಸೂಚಿ (Auspicious Remedial Windows)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರ ಹಾಗೂ ಗೋಚಾರ ತಿಥಿ ಗಣಿತದ ಪ್ರಕಾರ ೧೦ ಪಟ್ಟು ಶಕ್ತಿಶಾಲಿ ಪರಿಹಾರ ಕಾಲಗಳು.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {synthesis.upcomingMuhurthas.map((muh) => (
            <div
              key={muh.id}
              className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 shadow-lg flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                    {muh.remedialPowerMultiplier[language] || muh.remedialPowerMultiplier.kn}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-red-400">
                    ⏳ {formatTimeRemaining(muh.urgencyHoursRemaining)}
                  </span>
                </div>

                <h3 className="text-xs md:text-sm font-bold text-white mb-1">
                  {muh.title[language] || muh.title.kn}
                </h3>
                <div className="text-[11px] text-amber-200/80 mb-2 font-mono">
                  {muh.tithiVara[language] || muh.tithiVara.kn}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {muh.guideline[language] || muh.guideline.kn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenSevaBooking(synthesis.highestCrisisNode.gokarnaSeva)}
                  className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors"
                >
                  ಈ ಮುಹೂರ್ತದಲ್ಲಿ ಸೇವೆ ಸಂಕಲ್ಪಿಸಿ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: 40-DAY SACRED DAILY JAPA MANDALA (RETENTION & HABIT LOOP) */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 my-8">
        <JapaMandalaCounter
          mantra={synthesis.activeJapaMantra}
          language={language}
          devoteeName={synthesis.devoteeName}
        />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: WALLET UNLOCK GATE / MONETIZATION UPSELL */}
      {/* ========================================================================= */}
      {!isUnlocked && (
        <div className="max-w-4xl mx-auto px-4 my-8">
          <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 p-5 md:p-7 shadow-2xl text-center">
            <span className="text-3xl">📜</span>
            <h3 className="text-lg md:text-xl font-bold font-serif text-amber-200 mt-2">
              {KARMA_MANDALA_5L.wallet.unlockPariharaTitle[language] ||
                KARMA_MANDALA_5L.wallet.unlockPariharaTitle.kn}
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-lg mx-auto leading-relaxed">
              ೫೦ ಕೆಂಪು ನಾಣ್ಯಗಳಿಂದ ೫ ಕರ್ಮ ದೋಷಗಳ ಸಂಪೂರ್ಣ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ, ನಿಖರ ಮುಹೂರ್ತ ಸಮಯ ಹಾಗೂ ಗೋಕರ್ಣ ಯಂತ್ರ ಪತ್ರವನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಿ.
            </p>

            {unlockError && (
              <div className="mt-3 p-2 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-lg inline-block">
                {unlockError}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleUnlockDossier}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs md:text-sm shadow-xl hover:from-amber-400 hover:to-yellow-400 transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🪙</span>
                <span>
                  {KARMA_MANDALA_5L.wallet.unlockButton[language] ||
                    KARMA_MANDALA_5L.wallet.unlockButton.kn}
                </span>
              </button>

              <button
                onClick={() => openRechargeModal()}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {KARMA_MANDALA_5L.wallet.rechargeNow[language] ||
                  KARMA_MANDALA_5L.wallet.rechargeNow.kn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gokarna Seva Booking Modal */}
      {selectedSeva && (
        <GokarnaSevaBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          seva={selectedSeva}
          devoteeName={synthesis.devoteeName}
          nakshatraName={synthesis.nakshatraName[language] || synthesis.nakshatraName.kn}
          rashiName={synthesis.chandraRashiName[language] || synthesis.chandraRashiName.kn}
          language={language}
        />
      )}

      {/* Karma Share Link Modal */}
      <KarmaShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialDevoteeName={synthesis.devoteeName}
        initialDob={session?.input?.birthDate || "1993-03-16"}
        initialTob={session?.input?.birthTime || "01:40"}
        initialPlace={(session?.input as any)?.locationName || (session?.input as any)?.place || "Gokarna"}
        initialPincode={session?.input?.pincode || "581326"}
        initialGotra={session?.input?.gothra || (session?.input as any)?.gotra || "Kashyapa"}
        initialNakshatra={
          chartOutput.planets?.find((p) => p.name === "Moon")
            ? degreeToNakshatra(chartOutput.planets.find((p) => p.name === "Moon")!.degree).index
            : 18
        }
        initialRashi={
          chartOutput.planets?.find((p) => p.name === "Moon")
            ? degreeToRashi(chartOutput.planets.find((p) => p.name === "Moon")!.degree).index
            : 8
        }
        initialLang={language}
      />
    </div>
  );
};

export default KarmaMandalaPage;
