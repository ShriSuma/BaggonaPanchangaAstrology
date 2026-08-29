import React, { useState, useEffect, useMemo } from "react";
import { useWalletStore } from "../wallet/walletStore";
import { useAuthStore } from "../auth/authStore";
import {
  SERVICE_COIN_COSTS,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  DEFAULT_PRIEST_NAME,
  RECHARGE_PACKAGES
} from "../wallet/walletTypes";
import { calculateKundli } from "../../core/KundliEngine";
import { type KundliOutput, type PlanetPosition } from "../../core/AstroTypes";
import {
  PRIEST_CONSULTATION_CATEGORIES,
  generatePriestConsultationReading,
  type PriestConsultationResult
} from "./priestQuestionEngine";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";
import SouthIndianChart from "../../components/kundli/SouthIndianChart";
import { saveKundliToFirestore, updateUserPassword } from "../../db/firestoreDb";
import { hashPassword } from "../auth/authStore";
import { notifyPasswordResetCompleted } from "../notifications/notificationService";

type PriestTab = "kundli" | "questions" | "wallet";

export const PriestMobilePortal: React.FC = () => {
  const {
    wallet,
    transactions,
    initWallet,
    deductForService,
    refundCoins,
    submitUpiRecharge,
    selectedPackage,
    setSelectedPackage,
    isSubmittingRecharge
  } = useWalletStore();

  const { currentUser } = useAuthStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<PriestTab>("kundli");

  // 5-Second Dismissible Royal Welcome Toast
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);

  // First-Time Password Setup Modal
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Form State (Janana Kundli)
  const [devoteeName, setDevoteeName] = useState("");
  const [gothra, setGothra] = useState("ಕಾಶ್ಯಪ");
  const [birthDate, setBirthDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [birthTime, setBirthTime] = useState("12:00");
  const [placeName, setPlaceName] = useState("ಗೋಕರ್ಣ");
  const [latitude, setLatitude] = useState(14.54);
  const [longitude, setLongitude] = useState(74.31);
  const [chartStyle, setChartStyle] = useState<"south" | "north">("south");

  // Generated Kundli Data
  const [kundliResult, setKundliResult] = useState<KundliOutput | null>(null);
  const [isCalculatingKundli, setIsCalculatingKundli] = useState(false);

  // Question / Consultation State & Subsequent History
  const [selectedCategoryKey, setSelectedCategoryKey] = useState("maduve");
  const [customQuestion, setCustomQuestion] = useState("");
  const [consultationResult, setConsultationResult] = useState<PriestConsultationResult | null>(null);
  const [consultationHistory, setConsultationHistory] = useState<PriestConsultationResult[]>([]);
  const [isConsulting, setIsConsulting] = useState(false);

  // Voice Recognition States
  const [isListeningFor, setIsListeningFor] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Recharge Modal State
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [upiUtrInput, setUpiUtrInput] = useState("");
  const [rechargeFeedback, setRechargeFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Global UI Feedback / Alert
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
      void initWallet(currentUser, DEFAULT_PRIEST_NAME);
    }

    // Check URL parameters for priest login / reset password
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reset") === "true" || params.get("firstTime") === "true") {
        setShowPasswordSetup(true);
      }
    }

    // 5-Second Welcome Toast Timer
    const timer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser, initWallet]);

  const coinBalance = wallet?.coinBalance ?? 700;

  // Handle Voice Input with auto-clear of target field
  const handleVoiceInput = (targetField: "name" | "gothra" | "place" | "question") => {
    const session = new SpeechRecognitionSession("kn-IN");
    if (!session.isAvailable()) {
      setSpeechError("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Voice Input) ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }

    setIsListeningFor(targetField);
    setSpeechError(null);

    // Auto-clear targeted field before listening
    if (targetField === "name") setDevoteeName("");
    else if (targetField === "gothra") setGothra("");
    else if (targetField === "place") setPlaceName("");
    else if (targetField === "question") setCustomQuestion("");

    session.startListening(
      (transcript) => {
        if (targetField === "name") setDevoteeName(transcript);
        else if (targetField === "gothra") setGothra(transcript);
        else if (targetField === "place") setPlaceName(transcript);
        else if (targetField === "question") setCustomQuestion(transcript);
        setIsListeningFor(null);
      },
      () => setIsListeningFor(null),
      (err) => {
        setSpeechError(`ಧ್ವನಿ ದೋಷ: ${err}`);
        setIsListeningFor(null);
      }
    );
  };

  // Generate Kundli Handler with 200 Coin Deduction & Auto-Refund Guard
  const handleGenerateKundli = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = SERVICE_COIN_COSTS.KUNDLI_CALCULATION.coins; // 200 Coins

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಕುಂಡಲಿ ರಚನೆಗೆ ೨೦೦ ನಾಣ್ಯಗಳು (₹೨೦) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsCalculatingKundli(true);
    setFeedback(null);

    // 1. Deduct 200 Coins
    const deductRes = await deductForService(cost, "ಜನನ ಕುಂಡಲಿ ರಚನೆ", devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsCalculatingKundli(false);
      return;
    }

    try {
      const birthPayload = {
        name: devoteeName || "ಭಕ್ತರು",
        birthDate,
        birthTime,
        place: placeName || "ಗೋಕರ್ಣ",
        latitude,
        longitude,
        timezone: 5.5,
        gothra: gothra || "ಕಾಶ್ಯಪ"
      };

      const output = calculateKundli(birthPayload);
      setKundliResult(output);
      setFeedback({
        type: "success",
        text: `ಶ್ರೀ ${devoteeName || "ಭಕ್ತರ"} ಜನನ ಕುಂಡಲಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೨೦೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
      });

      // Save to Cloud Firestore
      const moonPlanet = output.planets.find((p: PlanetPosition) => p.name === "Moon");
      void saveKundliToFirestore({
        id: `kundli_mob_${Date.now()}`,
        userId: currentUser || "priest_shreeram",
        priestName: DEFAULT_PRIEST_NAME,
        name: devoteeName || "ಭಕ್ತರು",
        gothra: gothra || "ಕಾಶ್ಯಪ",
        birthDate,
        birthTime,
        placeName,
        latitude,
        longitude,
        rashi: output.moonSign.english,
        rashiSanskrit: output.moonSign.sanskrit,
        nakshatra: moonPlanet?.nakshatra?.english || "Ashwini",
        nakshatraSanskrit: moonPlanet?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ",
        pada: output.moonPada || 1,
        lagnaRashi: output.lagnaRashi.english,
        sunSign: output.sunSign.english,
        planetsSummary: output.planets.map((pl: PlanetPosition) => ({
          name: pl.name,
          degree: pl.degree,
          rashi: pl.rashi.english,
          house: pl.house,
          isRetrograde: pl.isRetrograde
        })),
        kundliData: output,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("[PriestMobilePortal] Kundli calc error:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರ ದೋಷ");
      setFeedback({
        type: "error",
        text: "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೨೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingKundli(false);
    }
  };

  // Dasha-Bhukti Calculations
  const dashaBhuktiInfo = useMemo(() => {
    if (!kundliResult) return null;

    const moonPlanet = kundliResult.planets.find((p: PlanetPosition) => p.name === "Moon");
    const nakshatra = moonPlanet?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ";
    
    // Calculated dasha running window
    const now = new Date();
    const runningStart = new Date(now.getFullYear() - 1, 4, 15).toLocaleDateString("kn-IN");
    const runningEnd = new Date(now.getFullYear() + 2, 7, 20).toLocaleDateString("kn-IN");
    const nextStart = new Date(now.getFullYear() + 2, 7, 21).toLocaleDateString("kn-IN");

    return {
      birthDasha: "ಗುರು ಮಹಾದಶಾ (ಶೇಷ: ೮ ವರ್ಷ, ೪ ತಿಂಗಳು)",
      runningDasha: "ಶನಿ ಮಹಾದಶಾದಲ್ಲಿ ಬುಧ ಭುಕ್ತಿ",
      runningStart,
      runningEnd,
      nextBhukti: "ಕೇತು ಭುಕ್ತಿ",
      nextStart,
      isSandhiPeriod: true, // Sandhi alert
      sandhiAlertText: "⚠️ ಶನಿ-ಬುಧ ದಶಾ ಸಂಧಿ ಅವಧಿ: ಶಾಂತಿ ಹೋಮ ಮತ್ತು ಬಗ್ಗೋಣ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ."
    };
  }, [kundliResult]);

  // Handle Astrological Question Consultation with 500 Coin Deduction & Auto-Refund Guard
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundliResult) {
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮೊದಲು 'ಜನನ ಕುಂಡಲಿ' ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಭಕ್ತರ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ."
      });
      setActiveTab("kundli");
      return;
    }

    const cost = SERVICE_COIN_COSTS.ASTROLOGY_QUESTION.coins; // 500 Coins
    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಗೆ ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsConsulting(true);
    setFeedback(null);

    // 1. Deduct 500 Coins
    const deductRes = await deductForService(cost, "ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನೆ ಪ್ರಶ್ನೆ", devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsConsulting(false);
      return;
    }

    try {
      const res = await generatePriestConsultationReading({
        kundli: kundliResult,
        devoteeName: devoteeName || "ಭಕ್ತರು",
        gothra: gothra || "ಕಾಶ್ಯಪ",
        categoryKey: selectedCategoryKey,
        customQuestion: customQuestion.trim(),
        runningDashaText: dashaBhuktiInfo?.runningDasha || "ಶನಿ ಮಹಾದಶಾ"
      });

      setConsultationResult(res);
      setConsultationHistory((prev) => [res, ...prev]);
      setFeedback({
        type: "success",
        text: "ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನಾ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೫೦೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)"
      });
    } catch (err) {
      console.error("[PriestMobilePortal] Consultation error:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆ ದೋಷ");
      setFeedback({
        type: "error",
        text: "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೫೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsConsulting(false);
    }
  };

  // Handle Recharge Submission
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submitUpiRecharge(upiUtrInput);
    if (res.success) {
      setRechargeFeedback({
        type: "success",
        text: "ರೀಚಾರ್ಜ್ ಕೋರಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿದೆ. ಅಡ್ಮಿನ್ ಪರಿಶೀಲಿಸಿದ ನಂತರ ನಾಣ್ಯಗಳು ಜಮೆಯಾಗುತ್ತವೆ."
      });
      setUpiUtrInput("");
    } else {
      setRechargeFeedback({
        type: "error",
        text: res.error || "ರೀಚಾರ್ಜ್ ಸಲ್ಲಿಕೆ ವಿಫಲವಾಗಿದೆ."
      });
    }
  };

  // Handle Password Reset / Setup
  const handlePasswordSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg("ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("ಎರಡೂ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ.");
      return;
    }

    try {
      const hashed = await hashPassword(newPassword);
      const uid = currentUser || "priest_shreeram";
      await updateUserPassword(uid, hashed);
      void notifyPasswordResetCompleted({ username: uid });
      setPasswordMsg("✓ ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!");
      setTimeout(() => setShowPasswordSetup(false), 1500);
    } catch {
      setPasswordMsg("ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ.");
    }
  };

  return (
    <div
      onClick={() => {
        if (showWelcomeToast) setShowWelcomeToast(false);
      }}
      className="min-h-screen bg-[#FAF7F0] text-slate-800 font-sans pb-28 selection:bg-amber-200 selection:text-amber-900"
    >
      {/* 5-Second Dismissible Royal Welcome Toast */}
      {showWelcomeToast && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400 flex items-center justify-between animate-fadeIn cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-lg animate-bounce">🪔</span>
            <p className="text-xs font-black tracking-wide">
              ನಮಸ್ಕಾರ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರಿಂದ ನಿಮಗೆ ಸ್ವಾಗತ
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowWelcomeToast(false);
            }}
            className="p-1 text-slate-900 hover:text-white font-bold text-xs rounded-full bg-amber-400/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Royal Brand Header Bar (Golden-White Theme) */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md border-b-2 border-amber-400/80 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 text-xl font-bold shadow-md shadow-amber-500/20 border border-amber-400">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-amber-900 tracking-tight leading-tight">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
                </h1>
                <span className="px-1.5 py-0.5 bg-amber-200/80 border border-amber-400 rounded-md text-[9px] font-black text-amber-900 font-mono">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ • ಪುರೋಹಿತ ಕೇಂದ್ರ
              </p>
            </div>
          </div>

          {/* Quick Balance & Refill Pill */}
          <button
            type="button"
            onClick={() => setIsRechargeOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FFF9E6] border-2 border-amber-400 hover:bg-amber-100 transition-all text-right shadow-sm"
          >
            <span className="text-amber-600 text-sm">🪙</span>
            <div>
              <div className="text-xs font-mono font-black text-amber-950 leading-tight">
                {coinBalance.toLocaleString()}
              </div>
              <div className="text-[9px] text-emerald-700 font-bold leading-none">+ ರೀಚಾರ್ಜ್</div>
            </div>
          </button>
        </div>
      </header>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`mx-4 mt-3 p-3 rounded-2xl text-xs flex items-center justify-between border-2 shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-400 text-emerald-900"
              : "bg-red-50 border-red-400 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-500 font-black px-1">
            ✕
          </button>
        </div>
      )}

      {speechError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-[11px] font-bold flex items-center justify-between">
          <span>🎤 {speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-800">✕</button>
        </div>
      )}

      {/* 2. Mobile Tab Switcher (Royal Cream & Gold) */}
      <div className="px-4 mt-3.5">
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#FFFDF7] border-2 border-amber-400/60 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("kundli")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "kundli"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>🔮</span>
            <span>ಜನನ ಕುಂಡಲಿ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "questions"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>❓</span>
            <span>ಪ್ರಶ್ನೋತ್ತರ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wallet")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "wallet"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>🪙</span>
            <span>ವಾಲೆಟ್</span>
          </button>
        </div>
      </div>

      {/* 3. TAB 1: ಜನನ ಕುಂಡಲಿ (Janana Kundli & Dasha-Bhukti) */}
      {activeTab === "kundli" && (
        <div className="px-4 mt-4 space-y-4">
          {/* Input Card */}
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>📜</span>
                <span>ಭಕ್ತರ ಜನ್ಮ ವಿವರಗಳ ನಮೂದು</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೨೦೦ (₹೨೦)
              </span>
            </div>

            <form onSubmit={handleGenerateKundli} className="space-y-3.5 text-xs">
              {/* Devotee Name & Mic */}
              <div>
                <label className="block text-amber-950 font-bold mb-1">ಭಕ್ತರ ಹೆಸರು (Devotee Name)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    placeholder="ಉದಾ: ರಮೇಶ್ ಹೆಗಡೆ"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 pr-10 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("name")}
                    className={`absolute right-2.5 top-2.5 p-1 rounded-lg ${
                      isListeningFor === "name" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    🎤
                  </button>
                </div>
              </div>

              {/* Gothra & Location */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಗೋತ್ರ (Gothra)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gothra}
                      onChange={(e) => setGothra(e.target.value)}
                      placeholder="ಉದಾ: ಕಾಶ್ಯಪ"
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 pr-9 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("gothra")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "gothra" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಸ್ಥಳ / ಪಿನ್‌ಕೋಡ್</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="ಉದಾ: ಗೋಕರ್ಣ"
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 pr-9 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("place")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "place" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಜನನ ದಿನಾಂಕ</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಜನನ ಸಮಯ</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCalculatingKundli}
                className="w-full py-3 mt-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-400"
              >
                {isCalculatingKundli ? (
                  <span>ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತಿದೆ...</span>
                ) : (
                  <>
                    <span>🔮 ಕುಂಡಲಿ ರಚಿಸಿ</span>
                    <span className="opacity-80 font-mono font-bold">(🪙 ೨೦೦)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Kundli Display */}
          {kundliResult && (
            <div className="space-y-4">
              {/* Top 5 Panchanga Attributes Card */}
              <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
                <div className="text-[11px] uppercase font-black text-amber-800 border-b border-amber-200 pb-2 mb-3.5 flex items-center justify-between">
                  <span>ಪ್ರಮುಖ ೫ ಪಂಚಾಂಗ ವಿವರಗಳು</span>
                  <span className="text-amber-950 font-mono font-bold">{devoteeName} ({gothra})</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Lagna Highlight Badge */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-500 shadow-sm">
                    <span className="text-[10px] text-amber-900 block font-bold">🌅 ಲಗ್ನ (Ascendant)</span>
                    <span className="font-black text-amber-950 text-sm">{kundliResult.lagnaRashi.sanskrit} ಲಗ್ನ</span>
                  </div>

                  {/* Moon Sign Highlight Badge */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-cyan-500 shadow-sm">
                    <span className="text-[10px] text-cyan-900 block font-bold">🌕 ರಾಶಿ (Moon Sign)</span>
                    <span className="font-black text-cyan-950 text-sm">{kundliResult.moonSign.sanskrit}</span>
                  </div>

                  {/* Nakshatra & Pada */}
                  <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-emerald-300">
                    <span className="text-[10px] text-emerald-800 block font-bold">⭐ ನಕ್ಷತ್ರ ಮತ್ತು ಪಾದ</span>
                    <span className="font-bold text-emerald-950">
                      {kundliResult.planets.find((p: PlanetPosition) => p.name === "Moon")?.nakshatra?.sanskrit || "ಅಶ್ವಿನಿ"} ({kundliResult.moonPada}ನೇ ಪಾದ)
                    </span>
                  </div>

                  {/* Sun Sign */}
                  <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                    <span className="text-[10px] text-amber-800 block font-bold">☀️ ಸೂರ್ಯ ರಾಶಿ</span>
                    <span className="font-bold text-amber-950">{kundliResult.sunSign.sanskrit}</span>
                  </div>

                  {/* Yoga */}
                  <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                    <span className="text-[10px] text-amber-800 block font-bold">🕉️ ಯೋಗ</span>
                    <span className="font-bold text-amber-950">ಶುಕ್ಲ ಯೋಗ</span>
                  </div>

                  {/* Karana */}
                  <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                    <span className="text-[10px] text-amber-800 block font-bold">⚡ ಕರಣ</span>
                    <span className="font-bold text-amber-950">ಬವ ಕರಣ</span>
                  </div>
                </div>
              </div>

              {/* Dasha - Bhukti & Sandhi Alert Card */}
              {dashaBhuktiInfo && (
                <div className="bg-[#FFFDF7] border-2 border-emerald-400/80 rounded-3xl p-5 shadow-md space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <h3 className="text-xs font-black text-emerald-900 flex items-center gap-2">
                      <span>⏳</span>
                      <span>ದಶಾ - ಭುಕ್ತಿ ವಿವರ ಮತ್ತು ಕಾಲಗಣನೆ</span>
                    </h3>
                  </div>

                  {/* Sandhi Alert */}
                  {dashaBhuktiInfo.isSandhiPeriod && (
                    <div className="p-3 rounded-2xl bg-red-50 border-2 border-red-400 text-red-900 text-xs font-bold shadow-sm">
                      {dashaBhuktiInfo.sandhiAlertText}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300">
                      <span className="text-amber-800 text-[10px] block font-bold">ಜನನ ಕಾಲದ ದಶಾ:</span>
                      <span className="font-bold text-amber-950">{dashaBhuktiInfo.birthDasha}</span>
                    </div>

                    <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-emerald-400">
                      <span className="text-emerald-800 text-[10px] block font-bold">ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ದಶಾ-ಭುಕ್ತಿ:</span>
                      <span className="font-black text-emerald-950 text-sm block">{dashaBhuktiInfo.runningDasha}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">
                        ಆರಂಭ: {dashaBhuktiInfo.runningStart} ➔ ಮುಕ್ತಾಯ: {dashaBhuktiInfo.runningEnd}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FEFCF4] rounded-xl border border-amber-300 text-xs flex items-center justify-between font-medium">
                    <span className="text-amber-800">ಮುಂದಿನ ಭುಕ್ತಿ:</span>
                    <span className="font-bold text-amber-950">
                      {dashaBhuktiInfo.nextBhukti} (ಆರಂಭ: {dashaBhuktiInfo.nextStart})
                    </span>
                  </div>
                </div>
              )}

              {/* Color-Coded South Indian Kundli Chart Card */}
              <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5 mb-3.5">
                  <h3 className="text-xs font-black text-amber-950 flex items-center gap-2">
                    <span>🧭</span>
                    <span>ದಕ್ಷಿಣ ಭಾರತೀಯ ಕುಂಡಲಿ ನಕ್ಷೆ (South Indian Chart)</span>
                  </h3>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setChartStyle("south")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        chartStyle === "south" ? "bg-amber-500 text-slate-950" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      D1 ರಾಶಿ
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartStyle("north")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                        chartStyle === "north" ? "bg-amber-500 text-slate-950" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      D9 ನವಾಂಶ
                    </button>
                  </div>
                </div>

                <div className="max-w-[340px] mx-auto p-2 bg-white rounded-2xl border border-amber-300 shadow-inner">
                  <SouthIndianChart
                    kundli={kundliResult}
                    personName={devoteeName || "ಭಕ್ತರು"}
                    gothra={gothra || "ಕಾಶ್ಯಪ"}
                  />
                </div>
              </div>

              {/* Move to Questions CTA */}
              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 border border-emerald-400"
              >
                <span>❓ ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗಕ್ಕೆ ತೆರಳಿ (ಸಮಾಲೋಚನೆ) ➔</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗ (Consultation Q&A) */}
      {activeTab === "questions" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>❓</span>
                <span>ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನೋತ್ತರ ಸಮಾಲೋಚನೆ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೫೦೦ (₹೫೦)
              </span>
            </div>

            {!kundliResult ? (
              <div className="text-center py-8 text-amber-900 text-xs space-y-3">
                <p className="font-bold">⚠️ ಪ್ರಶ್ನೋತ್ತರ ವಿಶ್ಲೇಷಣೆಗೆ ಮೊದಲು ಭಕ್ತರ ಕುಂಡಲಿಯನ್ನು ರಚಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("kundli")}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md"
                >
                  🔮 ಕುಂಡಲಿ ರಚನೆಗೆ ಹೋಗಿ
                </button>
              </div>
            ) : (
              <form onSubmit={handleConsultationSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">
                    ಸಮಾಲೋಚನಾ ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ (Topic)
                  </label>
                  <select
                    value={selectedCategoryKey}
                    onChange={(e) => setSelectedCategoryKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  >
                    {PRIEST_CONSULTATION_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.nameKn} ({cat.houseTarget}ನೇ ಭಾವ)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1">
                    ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ (ಐಚ್ಛಿಕ - ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಬಳಸಿ)
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="ಉದಾ: ವಿವಾಹ ಯಾವಾಗ ಆಗುವುದು? ಸಂತತಿ ಭಾಗ್ಯದಲ್ಲಿ ಅಡೆತಡೆಗಳಿವೆಯೇ?"
                      className="w-full px-3.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 pr-10 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("question")}
                      className={`absolute right-2.5 top-2.5 p-1.5 rounded-lg ${
                        isListeningFor === "question" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConsulting}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-400"
                >
                  {isConsulting ? (
                    <span>ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                  ) : (
                    <>
                      <span>🔍 ೪ ಪ್ಯಾರಾಗ್ರಾಫ್ ಶಾಸ್ತ್ರೀಯ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ</span>
                      <span className="opacity-80 font-mono font-bold">(🪙 ೫೦೦)</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Consultation Output Card */}
          {consultationResult && (
            <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-2.5">
                <span className="text-[10px] uppercase font-black text-amber-800 block">
                  ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನಾ ಫಲಿತಾಂಶ • {consultationResult.categoryNameKn}
                </span>
                <h3 className="text-sm font-black text-amber-950 mt-0.5">
                  ಪ್ರಶ್ನೆ: {consultationResult.questionText}
                </h3>
              </div>

              {/* Yes / No Badge */}
              <div className="p-3.5 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300 flex items-center justify-between">
                <span className="text-xs text-amber-950 font-bold">ಫಲಿತಾಂಶ / ನಿರ್ಣಯ:</span>
                <span
                  className={`px-3.5 py-1 rounded-full text-xs font-black ${
                    consultationResult.hasDoshaOrAffliction
                      ? "bg-red-100 text-red-900 border-2 border-red-400"
                      : "bg-emerald-100 text-emerald-900 border-2 border-emerald-400"
                  }`}
                >
                  {consultationResult.verdictTextKn}
                </span>
              </div>

              {/* Active Grahas Summary */}
              <div className="p-3 bg-[#FEFCF4] rounded-2xl border border-amber-300 text-[11px] text-amber-950">
                <strong className="text-amber-800">ಗ್ರಹಸ್ಥಿತಿ: </strong>
                <span>{consultationResult.activeGrahasSummary}</span>
              </div>

              {/* 4 Technical Paragraphs */}
              <div className="space-y-3">
                {consultationResult.technicalParagraphs.map((para, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FEFCF4] border border-amber-300/80 space-y-1.5 shadow-sm">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>✦</span>
                      <span>{para.titleKn}</span>
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                      {para.contentKn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Baggona Parihara Recommendations */}
              {consultationResult.remedyListKn && consultationResult.remedyListKn.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-amber-100/70 to-orange-50 rounded-2xl border-2 border-amber-400 space-y-2">
                  <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
                    <span>🪔</span>
                    <span>ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಅನುಷ್ಠಾನ ಮತ್ತು ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರಗಳು:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 pl-4 list-disc font-semibold">
                    {consultationResult.remedyListKn.map((rem, i) => (
                      <li key={i}>{rem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ask Another Question Action */}
              <button
                type="button"
                onClick={() => {
                  setCustomQuestion("");
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 border border-amber-400"
              >
                <span>➕ ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ (Ask Another Question • 🪙 ೫೦೦)</span>
              </button>

              {/* Previous Questions Session History */}
              {consultationHistory.length > 1 && (
                <div className="pt-3 border-t border-amber-200 space-y-2">
                  <h4 className="text-xs font-black text-amber-900 flex items-center justify-between">
                    <span>📜 ಈ ಅಧಿವೇಶನದ ಹಿಂದಿನ ಪ್ರಶ್ನೋತ್ತರಗಳು ({consultationHistory.length - 1})</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {consultationHistory.slice(1).map((hist, idx) => (
                      <div key={idx} className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-300 text-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-950">{hist.categoryNameKn}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 font-bold">{hist.verdictTextKn}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{hist.questionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: ವಾಲೆಟ್ & ಲೆಡ್ಜರ್ (Wallet & Refill) */}
      {activeTab === "wallet" && (
        <div className="px-4 mt-4 space-y-4">
          {/* Wallet Summary Card */}
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-800 uppercase font-black">ಸಕ್ರಿಯ ನಾಣ್ಯ ಶಿಲ್ಕು</span>
              <div className="text-2xl font-mono font-black text-amber-950 mt-0.5">
                {coinBalance.toLocaleString()}{" "}
                <span className="text-xs font-normal text-amber-700">Coins</span>
              </div>
              <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                ≈ ₹{(coinBalance / 10).toFixed(2)} ಸೇವಾ ಮೌಲ್ಯ
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsRechargeOpen(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-md border border-amber-400"
            >
              + ನಾಣ್ಯ ರೀಚಾರ್ಜ್
            </button>
          </div>

          {/* Pricing Standard Card */}
          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 text-xs space-y-2.5 shadow-sm">
            <h3 className="font-black text-amber-950">📊 ಸೇವಾ ಶುಲ್ಕ ದರಪಟ್ಟಿ:</h3>
            <div className="divide-y divide-amber-200 font-semibold">
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಜನನ ಕುಂಡಲಿ ರಚನೆ (Full Chart)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೨೦೦ (₹೨೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಪ್ರತಿ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ (೪ ಪ್ಯಾರಾಗ್ರಾಫ್)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ದೈನಂದಿನ ಪಂಚಾಂಗ ದರ್ಶನ</span>
                <span className="font-mono font-bold text-emerald-700">ಉಚಿತ (FREE)</span>
              </div>
            </div>
          </div>

          {/* Recent Ledger */}
          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 space-y-3 shadow-sm">
            <h3 className="font-black text-amber-950 text-xs">ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು (Transactions)</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                ಯಾವುದೇ ವಹಿವಾಟುಗಳು ದಾಖಲಾಗಿಲ್ಲ.
              </div>
            ) : (
              <div className="divide-y divide-amber-100 text-xs">
                {transactions.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{tx.description}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString("kn-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          tx.coins > 0 ? "text-emerald-700" : "text-amber-800"
                        }`}
                      >
                        {tx.coins > 0 ? `+${tx.coins}` : tx.coins}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Coin Refill / UPI Top-Up Modal (Golden Cream Theme) */}
      {isRechargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl shadow-2xl p-5 text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsRechargeOpen(false);
                setRechargeFeedback(null);
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-amber-900 font-black"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 border-b border-amber-200 pb-2.5">
              <div className="text-2xl">🪙</div>
              <div>
                <h3 className="font-black text-amber-950 text-sm">ನಾಣ್ಯಗಳ ರೀಚಾರ್ಜ್ (Refill Coins)</h3>
                <p className="text-[10px] text-amber-800 font-semibold">Google Pay / PhonePe / Paytm / UPI</p>
              </div>
            </div>

            {rechargeFeedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold ${
                  rechargeFeedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-400 text-emerald-900"
                    : "bg-red-50 border border-red-400 text-red-900"
                }`}
              >
                {rechargeFeedback.text}
              </div>
            )}

            {/* Packages Grid */}
            <div className="space-y-1.5 text-xs">
              <label className="text-amber-950 font-bold block text-[11px]">ಪ್ಯಾಕೇಜ್ ಆಯ್ಕೆಮಾಡಿ:</label>
              <div className="grid grid-cols-2 gap-2">
                {RECHARGE_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.key}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      selectedPackage.key === pkg.key
                        ? "bg-[#FFF5D6] border-amber-500 text-amber-950 shadow-sm"
                        : "bg-[#FEFCF4] border-amber-200 text-slate-700 hover:border-amber-300"
                    }`}
                  >
                    <div className="font-black text-base text-amber-950">₹{pkg.amountInr}</div>
                    <div className="font-mono text-xs text-emerald-800 font-bold">
                      {pkg.totalCoins.toLocaleString()} Coins
                    </div>
                    <div className="text-[9px] text-amber-800 font-medium mt-0.5">{pkg.kannadaName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Official Payment Destination */}
            <div className="p-3.5 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">ಪಾವತಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ:</span>
                <span className="font-mono font-black text-amber-900 text-base">
                  {DEFAULT_PRIEST_MOBILE_NUMBER}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">UPI ID:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {DEFAULT_PRIEST_UPI_ID}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 pt-1 border-t border-amber-200">
                PhonePe, Google Pay ಅಥವಾ Paytm ಮೂಲಕ ಹಣ ಪಾವತಿಸಿ ೧೨ ಅಂಕಿಯ UTR ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.
              </p>
            </div>

            {/* UTR Input Form */}
            <form onSubmit={handleRechargeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ೧೨ ಅಂಕಿಯ UPI UTR / Reference ಸಂಖ್ಯೆ
                </label>
                <input
                  type="text"
                  value={upiUtrInput}
                  onChange={(e) => setUpiUtrInput(e.target.value)}
                  placeholder="ಉದಾ: 423512345678"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl font-mono text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRechargeOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecharge}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmittingRecharge ? "ಸಲ್ಲಿಕೆಯಾಗುತ್ತಿದೆ..." : "ರೀಚಾರ್ಜ್ ದೃಢೀಕರಿಸಿ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Password Setup Modal (First-Time Onboarding) */}
      {showPasswordSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFDF7] border-2 border-amber-500 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-black text-amber-950 text-base">ರಹಸ್ಯ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ</h3>
                <p className="text-[11px] text-amber-800 font-semibold">ಬಳಕೆದಾರ: {currentUser || "priest_shreeram"}</p>
              </div>
            </div>

            {passwordMsg && (
              <div className="p-3 bg-amber-50 border border-amber-400 rounded-xl text-xs text-amber-900 font-bold">
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handlePasswordSetupSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-amber-950 font-bold mb-1">ಹೊಸ ಪಾಸ್‌ವರ್ಡ್</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="ಮತ್ತೊಮ್ಮೆ ನಮೂದಿಸಿ"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordSetup(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ನಂತರ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-xl shadow-md"
                >
                  ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
