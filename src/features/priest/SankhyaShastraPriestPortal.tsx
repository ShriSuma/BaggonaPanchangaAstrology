import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "../wallet/walletStore";
import { useAuthStore } from "../auth/authStore";
import {
  SERVICE_COIN_COSTS,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  DEFAULT_PRIEST_NAME,
  RECHARGE_PACKAGES
} from "../wallet/walletTypes";
import {
  generateSankhyaPrashnaReading,
  generateSankhyaNameSuggestion,
  generateSankhyaMobileVehicleSuggestion,
  type SankhyaPrashnaResult,
  type SankhyaNameResult,
  type SankhyaMobileVehicleResult
} from "./sankhyaShastraPriestEngine";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";
import { setDoc, doc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { updateUserPassword } from "../../db/firestoreDb";
import { hashPassword } from "../auth/authStore";
import { notifyPasswordResetCompleted, notifySystemFailureAlert } from "../notifications/notificationService";

type SankhyaTab = "prashna" | "name_numbers" | "wallet";

const PRIEST_SANKHYA_STORAGE_KEY = "baggona_priest_sankhya_active_session";

function loadSavedPriestSankhyaState(): any {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRIEST_SANKHYA_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const SankhyaShastraPriestPortal: React.FC = () => {
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
  const [urlPriestName, setUrlPriestName] = useState<string>("");

  // Load Saved Session from localStorage (Anti-Reset Guard for Refresh / Mobile Disconnects)
  const savedSankhya = useMemo(() => loadSavedPriestSankhyaState(), []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<SankhyaTab>(() => savedSankhya?.activeTab || "prashna");

  // 5-Second Dismissible Royal Welcome Toast
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);

  // First-Time Password Setup Modal
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  // Tab 1: Prashna Oracle State (350 Coins / ₹35) - Restored from localStorage
  const [devoteeName, setDevoteeName] = useState(() => savedSankhya?.devoteeName || "");
  const [gothra, setGothra] = useState(() => savedSankhya?.gothra || "ಕಾಶ್ಯಪ");
  const [prashnaNumber, setPrashnaNumber] = useState<number>(() => savedSankhya?.prashnaNumber ?? 108);
  const [prashnaQuestion, setPrashnaQuestion] = useState(() => savedSankhya?.prashnaQuestion || "");
  const [prashnaResult, setPrashnaResult] = useState<SankhyaPrashnaResult | null>(() => savedSankhya?.prashnaResult || null);
  const [prashnaHistory, setPrashnaHistory] = useState<SankhyaPrashnaResult[]>(() => savedSankhya?.prashnaHistory || []);
  const [isCalculatingPrashna, setIsCalculatingPrashna] = useState(false);

  // Tab 2: Name & Mobile/Vehicle State (2000 Coins / ₹200) - Restored from localStorage
  const [suggestionType, setSuggestionType] = useState<"name" | "mobile_vehicle">(
    () => savedSankhya?.suggestionType || "name"
  );
  const [nameInput, setNameInput] = useState(() => savedSankhya?.nameInput || "");
  const [birthDate, setBirthDate] = useState(() => savedSankhya?.birthDate || new Date().toISOString().split("T")[0]);
  const [rashi, setRashi] = useState(() => savedSankhya?.rashi || "ಮೇಷ");
  const [nakshatra, setNakshatra] = useState(() => savedSankhya?.nakshatra || "ಅಶ್ವಿನಿ");
  const [mobileVehicleTarget, setMobileVehicleTarget] = useState<"mobile" | "vehicle">(
    () => savedSankhya?.mobileVehicleTarget || "mobile"
  );
  const [nameResult, setNameResult] = useState<SankhyaNameResult | null>(() => savedSankhya?.nameResult || null);
  const [mobileVehicleResult, setMobileVehicleResult] = useState<SankhyaMobileVehicleResult | null>(
    () => savedSankhya?.mobileVehicleResult || null
  );
  const [isCalculatingSuggestion, setIsCalculatingSuggestion] = useState(false);

  // Voice Recognition States
  const [isListeningFor, setIsListeningFor] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Recharge Modal State
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [upiUtrInput, setUpiUtrInput] = useState("");
  const [rechargeQrUrl, setRechargeQrUrl] = useState<string>("");
  const [rechargeFeedback, setRechargeFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate Scannable Dynamic UPI QR Code for Selected Package
  useEffect(() => {
    if (isRechargeOpen) {
      const payeeName = "Baggona Panchanga";
      const note = `COINS-${selectedPackage.key.toUpperCase()}-${wallet?.userId || currentUser || "PRIEST"}`;
      const upiUri = `upi://pay?pa=${encodeURIComponent(DEFAULT_PRIEST_UPI_ID)}&pn=${encodeURIComponent(
        payeeName
      )}&am=${selectedPackage.amountInr.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

      QRCode.toDataURL(upiUri, {
        width: 180,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" }
      })
        .then((url) => setRechargeQrUrl(url))
        .catch((err) => console.warn("Recharge QR Code Error:", err));
    }
  }, [isRechargeOpen, selectedPackage, wallet, currentUser]);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-Save State to localStorage so mobile refresh / network drop preserves everything
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stateToSave = {
        activeTab,
        devoteeName,
        gothra,
        prashnaNumber,
        prashnaQuestion,
        prashnaResult,
        prashnaHistory,
        suggestionType,
        nameInput,
        birthDate,
        rashi,
        nakshatra,
        mobileVehicleTarget,
        nameResult,
        mobileVehicleResult
      };
      localStorage.setItem(PRIEST_SANKHYA_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn("[SankhyaShastraPriestPortal] Failed to persist state to localStorage:", err);
    }
  }, [
    activeTab,
    devoteeName,
    gothra,
    prashnaNumber,
    prashnaQuestion,
    prashnaResult,
    prashnaHistory,
    suggestionType,
    nameInput,
    birthDate,
    rashi,
    nakshatra,
    mobileVehicleTarget,
    nameResult,
    mobileVehicleResult
  ]);

  // Reset / Clear Form & Session (Only erases on explicit Priest Reset click)
  const handleResetSankhya = () => {
    try {
      localStorage.removeItem(PRIEST_SANKHYA_STORAGE_KEY);
    } catch {}
    setDevoteeName("");
    setGothra("ಕಾಶ್ಯಪ");
    setPrashnaNumber(108);
    setPrashnaQuestion("");
    setPrashnaResult(null);
    setNameInput("");
    setBirthDate(new Date().toISOString().split("T")[0]);
    setNameResult(null);
    setMobileVehicleResult(null);
    setActiveTab("prashna");
    setFeedback({
      type: "success",
      text: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಿಸೆಟ್ ಮಾಡಲಾಗಿದೆ. ನೀವು ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಬಹುದು (Reset successful)."
    });
  };

  useEffect(() => {
    let resolvedUser = currentUser || "priest_sankhya";
    let resolvedName = DEFAULT_PRIEST_NAME;

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      const nameParam = params.get("name");

      if (nameParam) {
        resolvedName = decodeURIComponent(nameParam);
        setUrlPriestName(resolvedName);
        localStorage.setItem("baggona_sankhya_priest_name", resolvedName);
      } else if (localStorage.getItem("baggona_sankhya_priest_name")) {
        resolvedName = localStorage.getItem("baggona_sankhya_priest_name")!;
        setUrlPriestName(resolvedName);
      }

      if (userParam) {
        resolvedUser = userParam;
        localStorage.setItem("baggona_sankhya_priest_id", userParam);
      } else if (localStorage.getItem("baggona_sankhya_priest_id")) {
        resolvedUser = localStorage.getItem("baggona_sankhya_priest_id")!;
      }

      if (params.get("reset") === "true" || params.get("firstTime") === "true") {
        setShowPasswordSetup(true);
      }
    }

    void initWallet(resolvedUser, resolvedName);

    const timer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser, initWallet]);

  const activePriestDisplayName = urlPriestName || wallet?.priestName || (typeof window !== "undefined" ? localStorage.getItem("baggona_sankhya_priest_name") : null) || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const coinBalance = wallet?.coinBalance ?? 700;

  // Handle Voice Input
  const handleVoiceInput = (targetField: "name" | "gothra" | "question" | "nameInput") => {
    const session = new SpeechRecognitionSession("kn-IN");
    if (!session.isAvailable()) {
      setSpeechError("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.");
      return;
    }

    setIsListeningFor(targetField);
    setSpeechError(null);

    if (targetField === "name") setDevoteeName("");
    else if (targetField === "gothra") setGothra("");
    else if (targetField === "question") setPrashnaQuestion("");
    else if (targetField === "nameInput") setNameInput("");

    session.startListening(
      (transcript) => {
        if (targetField === "name") setDevoteeName(transcript);
        else if (targetField === "gothra") setGothra(transcript);
        else if (targetField === "question") setPrashnaQuestion(transcript);
        else if (targetField === "nameInput") setNameInput(transcript);
        setIsListeningFor(null);
      },
      () => setIsListeningFor(null),
      (err) => {
        setSpeechError(`ಧ್ವನಿ ದೋಷ: ${err}`);
        setIsListeningFor(null);
      }
    );
  };

  // 1. Submit Prashna Oracle (450 Coins / ₹45)
  const handlePrashnaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = SERVICE_COIN_COSTS.SANKHYA_PRASHNA?.coins || 250;

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆಗೆ ೨೫೦ ನಾಣ್ಯಗಳು ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsCalculatingPrashna(true);
    setFeedback(null);

    // Deduct 250 Coins
    const deductRes = await deductForService(cost, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ", devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsCalculatingPrashna(false);
      return;
    }

    try {
      const result = await generateSankhyaPrashnaReading({
        number: prashnaNumber,
        question: prashnaQuestion.trim() || "ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ಶುಭ ಫಲ",
        devoteeName: devoteeName || "ಭಕ್ತರು",
        gothra: gothra || "ಕಾಶ್ಯಪ"
      });

      setPrashnaResult(result);
      setPrashnaHistory((prev) => [result, ...prev]);
      setFeedback({
        type: "success",
        text: `ಸಂಖ್ಯೆ ${prashnaNumber} ರ ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನಾವಳಿ ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ. (೨೫೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
      });

      // Save to Cloud Firestore
      try {
        const prashnaRef = doc(firestore, "sankhyashastra_prashna_history", `prashna_${Date.now()}`);
        await setDoc(prashnaRef, {
          userId: currentUser || "priest_sankhya",
          priestName: activePriestDisplayName,
          portalType: "sankhyashastra",
          devoteeName: devoteeName || "ಭಕ್ತರು",
          gothra: gothra || "ಕಾಶ್ಯಪ",
          number: prashnaNumber,
          question: prashnaQuestion,
          result,
          costCoins: cost,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("[SankhyaPortal] Firestore log error:", dbErr);
      }
    } catch (err: any) {
      console.error("[SankhyaPortal] Prashna error:", err);
      await refundCoins(cost, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆ ಲೆಕ್ಕಾಚಾರ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest_sankhya",
        priestName: activePriestDisplayName,
        action: `ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆ (${prashnaNumber})`,
        attemptedCoins: 250,
        errorMessage: err?.message || "Sankhya Prashna runtime error"
      });
      setFeedback({
        type: "error",
        text: "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೨೫೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingPrashna(false);
    }
  };

  // 2. Submit Name or Mobile/Vehicle Suggestion (500 Coins)
  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = SERVICE_COIN_COSTS.SANKHYA_NAME_SUGGESTION?.coins || 500;

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಈ ಸೇವೆಗೆ ೫೦೦ ನಾಣ್ಯಗಳು ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsCalculatingSuggestion(true);
    setFeedback(null);

    const serviceName = suggestionType === "name" ? "ಶುಭ ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ" : "ಮೊಬೈಲ್ ಮತ್ತು ವಾಹನ ಸಂಖ್ಯಾ ಸೂಚನೆ";
    const deductRes = await deductForService(cost, serviceName, nameInput || devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsCalculatingSuggestion(false);
      return;
    }

    try {
      if (suggestionType === "name") {
        const res = await generateSankhyaNameSuggestion({
          inputName: nameInput || "ಆನಂದ",
          birthDate,
          rashi,
          nakshatra
        });
        setNameResult(res);
        setMobileVehicleResult(null);
      } else {
        const res = await generateSankhyaMobileVehicleSuggestion({
          birthDate,
          targetType: mobileVehicleTarget
        });
        setMobileVehicleResult(res);
        setNameResult(null);
      }

      setFeedback({
        type: "success",
        text: `${serviceName} ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೫೦೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
      });

      // Save to Cloud Firestore
      try {
        const numRef = doc(firestore, "sankhyashastra_suggestions_history", `sugg_${Date.now()}`);
        await setDoc(numRef, {
          userId: currentUser || "priest_sankhya",
          priestName: activePriestDisplayName,
          portalType: "sankhyashastra",
          serviceType: suggestionType,
          birthDate,
          costCoins: cost,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("[SankhyaPortal] Firestore log error:", dbErr);
      }
    } catch (err: any) {
      console.error("[SankhyaPortal] Suggestion error:", err);
      await refundCoins(cost, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸೂಚನಾ ಲೆಕ್ಕಾಚಾರ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest_sankhya",
        priestName: activePriestDisplayName,
        action: serviceName,
        attemptedCoins: 500,
        errorMessage: err?.message || "Sankhya Suggestion runtime error"
      });
      setFeedback({
        type: "error",
        text: "ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೫೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingSuggestion(false);
    }
  };

  // Recharge Submission
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

  // Password Reset / Setup
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
      const uid = currentUser || "priest_sankhya";
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
            <span className="text-lg animate-bounce">🔢</span>
            <p className="text-xs font-black tracking-wide">
              ನಮಸ್ಕಾರ {activePriestDisplayName} ಅವರೇ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರಿಂದ ನಿಮಗೆ ಸ್ವಾಗತ
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

      {/* Royal Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/95 backdrop-blur-md border-b-2 border-amber-400/80 px-3 sm:px-4 py-2.5 sm:py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 text-lg sm:text-xl font-bold shadow-md shadow-amber-500/20 border border-amber-400 shrink-0">
              🔢
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-900 tracking-tight leading-tight truncate">
                  ॥ ಬಗ್ಗೋಣ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ॥
                </h1>
                <span className="px-1 py-0.2 bg-amber-200/80 border border-amber-400 rounded text-[9px] font-black text-amber-900 font-mono shrink-0">
                  v1.0
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-amber-700 font-bold uppercase tracking-wider truncate">
                🙏 ನಮಸ್ಕಾರ {activePriestDisplayName} ಅವರೇ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Priest Reset Action Button (Anti-Reset Guard: State is only wiped on explicit Priest click) */}
            <button
              type="button"
              onClick={handleResetSankhya}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-amber-100/90 hover:bg-amber-200 border-2 border-amber-400 text-amber-950 font-bold text-[11px] sm:text-xs shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title="ಹೊಸ ಪ್ರಶ್ನೆ ನಮೂದಿಸಲು ರಿಸೆಟ್ ಮಾಡಿ"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">ಹೊಸ ಪ್ರಶ್ನೆ / </span>
              <span>ರಿಸೆಟ್</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRechargeOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl bg-[#FFF9E6] border-2 border-amber-400 hover:bg-amber-100 transition-all text-right shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
              title="ನಾಣ್ಯಗಳನ್ನು ರೀಚಾರ್ಜ್ ಮಾಡಿ"
            >
              <span className="text-amber-600 text-xs sm:text-sm">🪙</span>
              <div>
                <div className="text-[11px] sm:text-xs font-mono font-black text-amber-950 leading-tight">
                  {coinBalance.toLocaleString()}
                </div>
                <div className="text-[8px] sm:text-[9px] text-emerald-700 font-bold leading-none">+ ರೀಚಾರ್ಜ್</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Global Feedback */}
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
          <button onClick={() => setFeedback(null)} className="text-slate-500 font-black px-1">✕</button>
        </div>
      )}

      {speechError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-[11px] font-bold flex items-center justify-between">
          <span>🎤 {speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-800">✕</button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="px-4 mt-3.5">
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#FFFDF7] border-2 border-amber-400/60 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("prashna")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "prashna"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>🔮</span>
            <span>ಪ್ರಶ್ನಾವಳಿ (₹೩೫)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("name_numbers")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "name_numbers"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>✍️</span>
            <span>ನಾಮ & ಸಂಖ್ಯೆ (₹೨೦೦)</span>
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

      {/* TAB 1: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ (350 Coins / ₹35) */}
      {activeTab === "prashna" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>🔮</span>
                <span>ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೪೫೦ (₹೪೫)
              </span>
            </div>

            <form onSubmit={handlePrashnaSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಭಕ್ತರ ಹೆಸರು</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      placeholder="ಉದಾ: ಗುರುಪ್ರಸಾದ್"
                      required
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("name")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "name" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಗೋತ್ರ</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gothra}
                      onChange={(e) => setGothra(e.target.value)}
                      placeholder="ಉದಾ: ಕಾಶ್ಯಪ"
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("gothra")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "gothra" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಸಂಖ್ಯೆ ಆಯ್ಕೆಮಾಡಿ (೧ ರಿಂದ ೧೦೮ ಅಥವಾ ೧ ರಿಂದ ೨೪೯)
                </label>
                <input
                  type="number"
                  min={1}
                  max={249}
                  value={prashnaNumber}
                  onChange={(e) => setPrashnaNumber(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಭಕ್ತರ ಪ್ರಶ್ನೆ (ಟೈಪ್ ಮಾಡಿ ಅಥವಾ 🎤 ಮೈಕ್ ಒತ್ತಿ)
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={prashnaQuestion}
                    onChange={(e) => setPrashnaQuestion(e.target.value)}
                    placeholder="ಉದಾ: ಈ ವರ್ಷ ನೂತನ ವ್ಯಾಪಾರ ಆರಂಭಿಸುವುದು ಲಾಭದಾಯಕವೇ?"
                    required
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
                disabled={isCalculatingPrashna}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-400"
              >
                {isCalculatingPrashna ? (
                  <span>ಸಂಖ್ಯಾ ದೈವಜ್ಞ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                ) : (
                  <>
                    <span>🔍 ೪ ಪ್ಯಾರಾಗ್ರಾಫ್ ನಿಖರ ಫಲಿತಾಂಶ ಪಡೆಯಿರಿ</span>
                    <span className="opacity-80 font-mono font-bold">(🪙 ೨೫೦)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prashna Result Card */}
          {prashnaResult && (
            <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-800 block">
                    ಸಂಖ್ಯೆ {prashnaResult.number} ರ ಶಾಸ್ತ್ರೀಯ ನಿರ್ಣಯ
                  </span>
                  <h3 className="text-sm font-black text-amber-950 mt-0.5">
                    ಪ್ರಶ್ನೆ: {prashnaResult.question}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetSankhya}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
                  title="ಹೊಸ ಪ್ರಶ್ನೆ ನಮೂದಿಸಲು ರಿಸೆಟ್ ಮಾಡಿ"
                >
                  <span>🔄</span>
                  <span>ಹೊಸ ಪ್ರಶ್ನೆ (Reset)</span>
                </button>
              </div>

              {/* Badges Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">ಗ್ರಹಾಧಿಪತಿ</span>
                  <span className="font-black text-amber-950">{prashnaResult.rulingPlanetKn}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-emerald-300">
                  <span className="text-[10px] text-emerald-800 block font-bold">ಪ್ರಕೃತಿ ವರ್ಗೀಕರಣ</span>
                  <span className="font-black text-emerald-950">{prashnaResult.natureKn}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">ಸಾಮಾಜಿಕ ವರ್ಗ ಪ್ರಭಾವ</span>
                  <span className="font-bold text-amber-950 text-[11px]">{prashnaResult.varnaKn}</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">ದಿಕ್ಕು & ಕಾಲ</span>
                  <span className="font-bold text-amber-950 text-[11px]">
                    {prashnaResult.rulingDirectionKn} ({prashnaResult.auspiciousTimeframeKn})
                  </span>
                </div>
              </div>

              {/* 4 Paragraphs */}
              <div className="space-y-3">
                {prashnaResult.technicalParagraphs.map((para, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FEFCF4] border border-amber-300/80 space-y-1 shadow-sm">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>✦</span>
                      <span>{para.titleKn}</span>
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {para.contentKn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Remedies */}
              {prashnaResult.remedyListKn && (
                <div className="p-4 bg-gradient-to-br from-amber-100/70 to-orange-50 rounded-2xl border-2 border-amber-400 space-y-2">
                  <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
                    <span>🪔</span>
                    <span>ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 pl-4 list-disc font-semibold">
                    {prashnaResult.remedyListKn.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ask Another Prashna Action */}
              <button
                type="button"
                onClick={() => {
                  setPrashnaQuestion("");
                  window.scrollTo({ top: 100, behavior: "smooth" });
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 border border-amber-400"
              >
                <span>➕ ಇನ್ನೊಂದು ಪ್ರಶ್ನಾವಳಿ ಕೇಳಿ (Ask Another Prashna • 🪙 ೨೫೦)</span>
              </button>

              {/* Previous Prashna Session History */}
              {prashnaHistory.length > 1 && (
                <div className="pt-3 border-t border-amber-200 space-y-2">
                  <h4 className="text-xs font-black text-amber-900 flex items-center justify-between">
                    <span>📜 ಈ ಅಧಿವೇಶನದ ಹಿಂದಿನ ಪ್ರಶ್ನಾವಳಿಗಳು ({prashnaHistory.length - 1})</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {prashnaHistory.slice(1).map((hist, idx) => (
                      <div key={idx} className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-300 text-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-950">ಸಂಖ್ಯೆ {hist.number} • {hist.rulingPlanetKn}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 font-bold">{hist.verdictBadgeKn}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{hist.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ಶುಭ ನಾಮ ಮತ್ತು ಮೊಬೈಲ್/ವಾಹನ ಸೂಚನೆ (500 Coins) */}
      {activeTab === "name_numbers" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>✍️</span>
                <span>ಶುಭ ನಾಮ & ಸಂಖ್ಯಾ ಸಂಯೋಜನೆ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೫೦೦ ನಾಣ್ಯಗಳು
              </span>
            </div>

            {/* Sub-toggle: Name vs Mobile/Vehicle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#FEFCF4] border border-amber-300 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSuggestionType("name")}
                className={`py-2 rounded-lg transition-all ${
                  suggestionType === "name" ? "bg-amber-500 text-slate-950 font-black shadow-sm" : "text-amber-900"
                }`}
              >
                👶 ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ
              </button>
              <button
                type="button"
                onClick={() => setSuggestionType("mobile_vehicle")}
                className={`py-2 rounded-lg transition-all ${
                  suggestionType === "mobile_vehicle" ? "bg-amber-500 text-slate-950 font-black shadow-sm" : "text-amber-900"
                }`}
              >
                📱 ಮೊಬೈಲ್ & ವಾಹನ ಸಂಖ್ಯೆ
              </button>
            </div>

            <form onSubmit={handleSuggestionSubmit} className="space-y-3.5 text-xs">
              {suggestionType === "name" ? (
                <>
                  <div>
                    <label className="block text-amber-950 font-bold mb-1">
                      ಪ್ರಸ್ತುತ ಹೆಸರು ಅಥವಾ ಮಗುವಿನ / ವ್ಯಾಪಾರದ ಹೆಸರು (English / ಕನ್ನಡ)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="ಉದಾ: ANAND หรือ SHREERAM"
                        required
                        className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500 pr-10 shadow-inner uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => handleVoiceInput("nameInput")}
                        className={`absolute right-2 top-2 p-1 rounded-lg ${
                          isListeningFor === "nameInput" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
                        }`}
                      >
                        🎤
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-amber-950 font-bold mb-1">ಜನ್ಮ ದಿನಾಂಕ</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        className="w-full px-2.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-950 font-bold mb-1">ರಾಶಿ (ಐಚ್ಛಿಕ)</label>
                      <input
                        type="text"
                        value={rashi}
                        onChange={(e) => setRashi(e.target.value)}
                        placeholder="ಮೇಷ"
                        className="w-full px-2.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-950 font-bold mb-1">ನಕ್ಷತ್ರ (ಐಚ್ಛಿಕ)</label>
                      <input
                        type="text"
                        value={nakshatra}
                        onChange={(e) => setNakshatra(e.target.value)}
                        placeholder="ಅಶ್ವಿನಿ"
                        className="w-full px-2.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold text-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-amber-950 font-bold mb-1">ಉದ್ದೇಶ ಆಯ್ಕೆಮಾಡಿ</label>
                      <select
                        value={mobileVehicleTarget}
                        onChange={(e) => setMobileVehicleTarget(e.target.value as "mobile" | "vehicle")}
                        className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl font-bold"
                      >
                        <option value="mobile">📱 ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (SIM)</option>
                        <option value="vehicle">🚗 ವಾಹನ ನೋಂದಣಿ ಸಂಖ್ಯೆ (RC)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-amber-950 font-bold mb-1">ಜನ್ಮ ದಿನಾಂಕ</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isCalculatingSuggestion}
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-amber-400"
              >
                {isCalculatingSuggestion ? (
                  <span>ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತಿದೆ...</span>
                ) : (
                  <>
                    <span>✨ ಶುಭ ಸಂಖ್ಯಾ ಶಿಫಾರಸು ಪಡೆಯಿರಿ</span>
                    <span className="opacity-80 font-mono font-bold">(🪙 ೫೦೦)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Name Result Display */}
          {nameResult && (
            <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-800 block">
                    ನಾಮ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿಶ್ಲೇಷಣೆ
                  </span>
                  <h3 className="text-sm font-black text-amber-950 mt-0.5">
                    ಹೆಸರು: {nameResult.inputName} (ಚಾಲ್ಡಿಯನ್ ಮೊತ್ತ: {nameResult.currentNameNumber})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetSankhya}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
                  title="ಹೊಸ ನಾಮ ಸೂಚನೆಗಾಗಿ ರಿಸೆಟ್ ಮಾಡಿ"
                >
                  <span>🔄</span>
                  <span>ಹೊಸ ಸೂಚನೆ (Reset)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">ಮೂಲಾಂಕ (Mulanka)</span>
                  <span className="font-mono font-black text-amber-950 text-base">{nameResult.mulanka}</span>
                </div>
                <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-emerald-400">
                  <span className="text-[10px] text-emerald-800 block font-bold">ಭಾಗ್ಯಾಂಕ (Bhagyanka)</span>
                  <span className="font-mono font-black text-emerald-950 text-base">{nameResult.bhagyanka}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-amber-400 text-xs font-bold text-amber-950">
                {nameResult.harmonyVerdictKn}
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-black text-amber-950">✨ ಶಿಫಾರಸು ಮಾಡಿದ ಶುಭ ಅಕ್ಷರ ಸಂಯೋಜನೆಗಳು:</h4>
                <div className="space-y-1.5 font-semibold">
                  {nameResult.recommendedSpellingsKn.map((spell, i) => (
                    <div key={i} className="p-2.5 bg-[#FEFCF4] rounded-xl border border-amber-300 text-slate-900">
                      {spell}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FEFCF4] rounded-2xl border border-amber-300 text-xs space-y-1 font-medium">
                <div><strong className="text-amber-900">ಶುಭ ರತ್ನ:</strong> {nameResult.luckyGemsKn}</div>
                <div><strong className="text-amber-900">ಶುಭ ವಾರ:</strong> {nameResult.luckyDaysKn}</div>
              </div>
            </div>
          )}

          {/* Mobile / Vehicle Result Display */}
          {mobileVehicleResult && (
            <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-800 block">
                    {mobileVehicleResult.targetType === "mobile" ? "📱 ಮೊಬೈಲ್ ಸಂಖ್ಯಾ ಶಿಫಾರಸು" : "🚗 ವಾಹನ ಸಂಖ್ಯಾ ಶಿಫಾರಸು"}
                  </span>
                  <h3 className="text-sm font-black text-amber-950 mt-0.5">
                    ಮೂಲಾಂಕ {mobileVehicleResult.mulanka} • ಭಾಗ್ಯಾಂಕ {mobileVehicleResult.bhagyanka}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetSankhya}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
                  title="ಹೊಸ ಸಂಖ್ಯೆಗಾಗಿ ರಿಸೆಟ್ ಮಾಡಿ"
                >
                  <span>🔄</span>
                  <span>ಹೊಸ ಸಂಖ್ಯೆ (Reset)</span>
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs space-y-1 font-bold text-emerald-950">
                <div>ಅತ್ಯಂತ ಶುಭ ಮೊತ್ತಗಳು: {mobileVehicleResult.auspiciousTotals.join(", ")}</div>
                <div className="text-red-700">ವರ್ಜಿಸಬೇಕಾದ ಸಂಖ್ಯೆಗಳು: {mobileVehicleResult.unfavorableTotals.join(", ")}</div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-black text-amber-950">🌟 ಶಿಫಾರಸು ಮಾಡಿದ ಸಂಖ್ಯಾ ಮಾದರಿಗಳು:</h4>
                <div className="space-y-1.5 font-semibold">
                  {mobileVehicleResult.recommendedCombinations.map((comb, i) => (
                    <div key={i} className="p-2.5 bg-[#FEFCF4] rounded-xl border border-amber-300 text-slate-900">
                      {comb}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FEFCF4] rounded-2xl border border-amber-300 text-xs font-medium leading-relaxed">
                {mobileVehicleResult.reasonsKn}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ವಾಲೆಟ್ & ರೀಚಾರ್ಜ್ */}
      {activeTab === "wallet" && (
        <div className="px-4 mt-4 space-y-4">
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

          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 text-xs space-y-2.5 shadow-sm">
            <h3 className="font-black text-amber-950">📊 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸೇವಾ ಶುಲ್ಕ ದರಪಟ್ಟಿ:</h3>
            <div className="divide-y divide-amber-200 font-semibold">
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೨೫೦ ನಾಣ್ಯಗಳು</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಶುಭ ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಮೊಬೈಲ್ & ವಾಹನ ಸಂಖ್ಯಾ ಸೂಚನೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು</span>
              </div>
            </div>
          </div>

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
                      <div className={`font-mono font-bold ${tx.coins > 0 ? "text-emerald-700" : "text-amber-800"}`}>
                        {tx.coins > 0 ? `+${tx.coins}` : tx.coins}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-500">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coin Refill Modal */}
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

            {/* Scannable Dynamic UPI QR Code */}
            {rechargeQrUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-sm text-center">
                <p className="text-[11px] font-bold text-amber-950 mb-1">
                  📱 ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ (Scan & Pay ₹{selectedPackage.amountInr})
                </p>
                <img
                  src={rechargeQrUrl}
                  alt="UPI QR Code"
                  className="w-36 h-36 border border-amber-200 rounded-xl p-1 bg-white shadow-sm"
                />
                <p className="text-[9px] text-slate-500 font-mono mt-1">
                  GPay / PhonePe / Paytm / BHIM UPI
                </p>
              </div>
            )}

            <div className="p-3.5 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">ಪಾವತಿ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ:</span>
                <span className="font-mono font-black text-amber-900 text-base">{DEFAULT_PRIEST_MOBILE_NUMBER}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-bold">UPI ID:</span>
                <span className="font-mono font-bold text-emerald-800">{DEFAULT_PRIEST_UPI_ID}</span>
              </div>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-950 font-bold mb-1">೧೨ ಅಂಕಿಯ UPI UTR / Reference ಸಂಖ್ಯೆ</label>
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

      {/* Password Setup Modal */}
      {showPasswordSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFDF7] border-2 border-amber-500 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="font-black text-amber-950 text-base">ರಹಸ್ಯ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಿ</h3>
                <p className="text-[11px] text-amber-800 font-semibold">ಬಳಕೆದಾರ: {currentUser || "priest_sankhya"}</p>
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
