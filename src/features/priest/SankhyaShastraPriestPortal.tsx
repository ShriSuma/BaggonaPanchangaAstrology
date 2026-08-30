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
import { updateUserPassword, isPriestAccountActive } from "../../db/firestoreDb";
import { hashPassword } from "../auth/authStore";
import { notifyPasswordResetCompleted, notifySystemFailureAlert } from "../notifications/notificationService";
import { CoinDeductionModal } from "../../components/wallet/CoinDeductionModal";
import { FallingCoinsRefillModal } from "../../components/wallet/FallingCoinsRefillModal";

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
  const [isAccessRevoked, setIsAccessRevoked] = useState(false);

  // Pre-Action Coin Deduction Confirmation Modal State
  const [pendingDeduction, setPendingDeduction] = useState<{
    isOpen: boolean;
    serviceTitle: string;
    serviceTitleKannada: string;
    costCoins: number;
    devoteeName: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Tab 1: Prashna Oracle State (200 Coins / ₹20) - Restored from localStorage
  const [devoteeName, setDevoteeName] = useState(() => savedSankhya?.devoteeName || "");
  const [gothra, setGothra] = useState(() => savedSankhya?.gothra || "ಕಾಶ್ಯಪ");
  const [prashnaNumber, setPrashnaNumber] = useState<number>(() => savedSankhya?.prashnaNumber ?? 108);
  const [prashnaQuestion, setPrashnaQuestion] = useState(() => savedSankhya?.prashnaQuestion || "");
  const [prashnaResult, setPrashnaResult] = useState<SankhyaPrashnaResult | null>(() => savedSankhya?.prashnaResult || null);
  const [prashnaHistory, setPrashnaHistory] = useState<SankhyaPrashnaResult[]>(() => savedSankhya?.prashnaHistory || []);
  const [isCalculatingPrashna, setIsCalculatingPrashna] = useState(false);

  // Tab 2: Name & Mobile/Vehicle State (200 Coins / ₹20) - Restored from localStorage
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

  // Refill Modal State
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

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
        const isDone = localStorage.getItem("baggona_pwd_setup_done_" + resolvedUser) === "true";
        if (!isDone) {
          setShowPasswordSetup(true);
        }
      }
    }

    const checkActive = async () => {
      const active = await isPriestAccountActive(resolvedUser);
      if (!active) {
        setIsAccessRevoked(true);
        if (typeof window !== "undefined") {
          localStorage.removeItem("baggona_sankhya_priest_id");
          localStorage.removeItem("baggona_sankhya_priest_name");
        }
        return;
      }
      void initWallet(resolvedUser, resolvedName);
    };
    void checkActive();

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

  // 1. Submit Prashna Oracle (200 Coins / ₹20) with Pre-Action Confirmation
  const executePrashnaCalculation = async (cost: number) => {
    setIsCalculatingPrashna(true);
    setFeedback(null);

    // Deduct 200 Coins
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
        text: `ಸಂಖ್ಯೆ ${prashnaNumber} ರ ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನಾವಳಿ ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ. (${cost} ನಾಣ್ಯಗಳು / ₹${Math.round(cost / 10)} ಕಡಿತಗೊಂಡಿವೆ)`
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
        attemptedCoins: cost,
        errorMessage: err?.message || "Sankhya Prashna runtime error"
      });
      setFeedback({
        type: "error",
        text: `ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ${cost} ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ.`
      });
    } finally {
      setIsCalculatingPrashna(false);
    }
  };

  const handlePrashnaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = SERVICE_COIN_COSTS.SANKHYA_PRASHNA?.coins || 500;

    setPendingDeduction({
      isOpen: true,
      serviceTitle: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ (Sankhya Prashna Oracle)",
      serviceTitleKannada: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ",
      costCoins: cost,
      devoteeName: devoteeName || "ಭಕ್ತರು",
      description: `ಪ್ರಶ್ನೆ ಸಂಖ್ಯೆ ${prashnaNumber}: "${prashnaQuestion.trim() || "ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ಶುಭ ಫಲ"}"`,
      onConfirm: async () => {
        await executePrashnaCalculation(cost);
      }
    });
  };

  // 2. Submit Name or Mobile/Vehicle Suggestion (500 Coins) with Pre-Action Confirmation
  const executeSuggestionCalculation = async (cost: number, serviceName: string) => {
    setIsCalculatingSuggestion(true);
    setFeedback(null);

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
        text: `${serviceName} ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (${cost} ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
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
        attemptedCoins: cost,
        errorMessage: err?.message || "Sankhya Suggestion runtime error"
      });
      setFeedback({
        type: "error",
        text: `ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ${cost} ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ.`
      });
    } finally {
      setIsCalculatingSuggestion(false);
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = suggestionType === "name"
      ? (SERVICE_COIN_COSTS.SANKHYA_NAME_SUGGESTION?.coins || 500)
      : (SERVICE_COIN_COSTS.SANKHYA_MOBILE_VEHICLE?.coins || 500);

    const serviceName = suggestionType === "name" ? "ಶುಭ ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ" : "ಮೊಬೈಲ್ ಮತ್ತು ವಾಹನ ಸಂಖ್ಯಾ ಸೂಚನೆ";

    setPendingDeduction({
      isOpen: true,
      serviceTitle: `${serviceName} (Sankhya Guidance)`,
      serviceTitleKannada: serviceName,
      costCoins: cost,
      devoteeName: nameInput || devoteeName || "ಭಕ್ತರು",
      description: suggestionType === "name"
        ? `ಹೆಸರು ವಿಶ್ಲೇಷಣೆ: "${nameInput || "ಆನಂದ"}" (ಹುಟ್ಟಿದ ದಿನಾಂಕ: ${birthDate})`
        : `ಸಂಖ್ಯೆ ಆಯ್ಕೆ: ${mobileVehicleTarget === "mobile" ? "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" : "ವಾಹನ ನೋಂದಣಿ ಸಂಖ್ಯೆ"}`,
      onConfirm: async () => {
        await executeSuggestionCalculation(cost, serviceName);
      }
    });
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
      const uid = currentUser || (typeof window !== "undefined" ? localStorage.getItem("baggona_sankhya_priest_id") : null) || "priest_sankhya";
      await updateUserPassword(uid, hashed);
      if (typeof window !== "undefined") {
        localStorage.setItem("baggona_pwd_setup_done_" + uid, "true");
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("reset");
          url.searchParams.delete("firstTime");
          const newSearch = url.searchParams.toString();
          window.history.replaceState({}, document.title, url.pathname + (newSearch ? `?${newSearch}` : "") + url.hash);
        } catch {}
      }
      void notifyPasswordResetCompleted({ username: uid });
      setPasswordMsg("✓ ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!");
      setTimeout(() => setShowPasswordSetup(false), 1500);
    } catch {
      setPasswordMsg("ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ.");
    }
  };

  if (isAccessRevoked) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-red-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 mx-auto flex items-center justify-center text-3xl">
            🚫
          </div>
          <h2 className="text-lg font-black text-red-950">
            ಪ್ರವೇಶ ರದ್ದುಗೊಂಡಿದೆ (Access Revoked)
          </h2>
          <p className="text-xs text-red-900 leading-relaxed font-semibold">
            ಈ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪುರೋಹಿತರ ಪ್ರವೇಶ ಲಿಂಕ್ ಅಥವಾ ಖಾತೆಯನ್ನು ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Super Admin) ರದ್ದುಗೊಳಿಸಿದ್ದಾರೆ / ಅಳಿಸಿದ್ದಾರೆ. ಈ ಲಿಂಕ್ ಇನ್ನು ಮುಂದೆ ಮಾನ್ಯವಾಗಿರುವುದಿಲ್ಲ.
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ದಯವಿಟ್ಟು ಮುಖ್ಯ ನಿರ್ವಾಹಕರನ್ನು (Super Admin: 9972339362) ಸಂಪರ್ಕಿಸಿ.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = window.location.origin;
              }
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md active:scale-95 transition"
          >
            🏠 ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Go to Home)
          </button>
        </div>
      </div>
    );
  }

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

      {/* Royal Header Bar (Dual-Tier Mobile-First Theme) */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/98 backdrop-blur-md border-b-2 border-amber-400/80 shadow-md">
        {/* Top Brand & Actions Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: Brand Icon + Title in Guaranteed Single Line */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 text-base sm:text-xl font-bold shadow-md shadow-amber-500/20 border border-amber-400 shrink-0">
              🔢
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-950 tracking-tight leading-none">
                ॥ ಬಗ್ಗೋಣ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ॥
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 bg-amber-200/90 border border-amber-400 rounded-md text-[9px] font-black text-amber-950 font-mono">
                v1.0
              </span>
            </div>
          </div>

          {/* Right: Reset Action & Coin Balance Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Priest Reset Action Button */}
            <button
              type="button"
              onClick={handleResetSankhya}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 border border-amber-400 text-amber-950 font-bold text-[10px] sm:text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap"
              title="ಹೊಸ ಪ್ರಶ್ನೆ ನಮೂದಿಸಲು ರಿಸೆಟ್ ಮಾಡಿ"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">ಹೊಸ ಪ್ರಶ್ನೆ</span>
              <span className="sm:hidden">ರಿಸೆಟ್</span>
            </button>

            {/* Quick Balance & Refill Pill */}
            <button
              type="button"
              onClick={() => setIsRechargeOpen(true)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap border-2 ${
                coinBalance < 200
                  ? "bg-red-50 border-red-500 text-red-950 animate-pulse ring-1 ring-red-400"
                  : "bg-[#FFF9E6] border-amber-400 hover:bg-amber-100 text-amber-950"
              }`}
              title={coinBalance < 200 ? "⚠️ ನಾಣ್ಯಗಳ ಕೊರತೆ! ರೀಫಿಲ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ" : "ನಾಣ್ಯಗಳನ್ನು ರೀಚಾರ್ಜ್ ಮಾಡಿ"}
            >
              <span className="text-xs sm:text-sm">{coinBalance < 200 ? "⚠️" : "🪙"}</span>
              <div className="text-left">
                <div className={`text-[11px] sm:text-xs font-mono font-black leading-tight ${coinBalance < 200 ? "text-red-700 font-bold" : "text-amber-950"}`}>
                  {coinBalance.toLocaleString()} 🪙
                </div>
                <div className={`text-[8px] sm:text-[9px] font-extrabold leading-none ${coinBalance < 200 ? "text-red-600 animate-bounce" : "text-emerald-700"}`}>
                  {coinBalance < 200 ? "ಕೊರತೆ (+ರೀಫಿಲ್)" : "+ ರೀಚಾರ್ಜ್"}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Sub-Header: Dedicated Mobile-Friendly Priest Greeting & Status Bar */}
        <div className="bg-gradient-to-r from-[#FFF5D6] via-[#FFF9E6] to-[#FFF5D6] border-t border-amber-300/80 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0">🙏</span>
            <span className="font-extrabold text-amber-950 truncate text-[11px] sm:text-xs">
              ನಮಸ್ಕಾರ <strong className="text-amber-900 font-black">{activePriestDisplayName}</strong> ಅವರೇ
            </span>
            <span className="hidden sm:inline-block text-[10px] text-amber-800 font-semibold">• ಸಂಖ್ಯಾಶಾಸ್ತ್ರಜ್ಞ</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-amber-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="hidden xs:inline text-emerald-800 font-black">ಲೈವ್</span>
            <span className="bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-400 font-mono text-[9px]">
              {activeTab === "prashna" ? "ಪ್ರಶ್ನಾವಳಿ (500🪙)" : activeTab === "name_numbers" ? "ನಾಮ/ಸಂಖ್ಯೆ (500🪙)" : "ವಾಲೆಟ್"}
            </span>
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
            <span>ಪ್ರಶ್ನಾವಳಿ (🪙 ೫೦೦)</span>
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
            <span>🔢</span>
            <span>ನಾಮ & ಸಂಖ್ಯೆ (🪙 ೫೦೦)</span>
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

      {/* TAB 1: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ (500 Coins) */}
      {activeTab === "prashna" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>🔮</span>
                <span>ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೫೦೦ ನಾಣ್ಯಗಳು (500 Coins)
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
                  className="w-full px-3 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:border-amber-500 shadow-inner font-mono"
                />
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">ಭಕ್ತರ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ</label>
                <div className="relative">
                  <textarea
                    value={prashnaQuestion}
                    onChange={(e) => setPrashnaQuestion(e.target.value)}
                    placeholder="ಉದಾ: ನನಗೆ ಮದುವೆ ಆಗುವಂತಹ ಗಂಡನ ಅಕ್ಕ ಬಾವ ನನಗೆ ಬೈತಾಯಿದ್ದಾರೆ ಯಾಕೆ? ಅಥವಾ ಕಳೆದುಹೋದ ವಸ್ತು ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?"
                    rows={2}
                    required
                    className="w-full px-3.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("question")}
                    className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                      isListeningFor === "question" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
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
                    <span className="opacity-80 font-mono font-bold">(🪙 ೫೦೦)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prashna Result Card - Clean Unified Single Page Layout */}
          {prashnaResult && (
            <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
              <div className="border-b border-amber-200 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider block">
                    ॥ ಸಂಖ್ಯಾ ಪ್ರಶ್ನಾವಳಿ ನಿರ್ಣಯ • ಸಂಖ್ಯೆ {prashnaResult.number} ॥
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-amber-950 mt-0.5">
                    ಪ್ರಶ್ನೆ: {prashnaResult.question}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-950 rounded-xl text-xs font-black">
                    {prashnaResult.verdictBadgeKn}
                  </span>
                  <button
                    type="button"
                    onClick={handleResetSankhya}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
                    title="ಹೊಸ ಪ್ರಶ್ನೆ ನಮೂದಿಸಲು ರಿಸೆಟ್ ಮಾಡಿ"
                  >
                    <span>🔄</span>
                    <span>ಹೊಸ ಪ್ರಶ್ನೆ</span>
                  </button>
                </div>
              </div>

              {/* Context Summary Strip */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold text-amber-900 bg-[#FEFCF4] p-3 rounded-2xl border border-amber-300/80">
                <span>🪐 ಗ್ರಹಾಧಿಪತಿ: <strong className="text-amber-950 font-black">{prashnaResult.rulingPlanetKn}</strong></span>
                <span>•</span>
                <span>🔄 ಪ್ರಕೃತಿ: <strong className="text-amber-950 font-black">{prashnaResult.natureKn}</strong></span>
                <span>•</span>
                <span>🧭 ದಿಕ್ಕು & ಕಾಲ: <strong className="text-amber-950 font-black">{prashnaResult.rulingDirectionKn} ({prashnaResult.auspiciousTimeframeKn})</strong></span>
              </div>

              {/* Unified 4 In-Depth Paragraphs Reading */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FEFCF4] to-white border-2 border-amber-300/80 space-y-3.5 shadow-xs">
                {prashnaResult.technicalParagraphs.map((para, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span className="text-amber-600">✦</span>
                      <span>{para.titleKn}</span>
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium pl-3 border-l-2 border-amber-300">
                      {para.contentKn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Remedies */}
              {prashnaResult.remedyListKn && (
                <div className="p-4 bg-gradient-to-br from-amber-100/70 to-orange-50 rounded-2xl border-2 border-amber-400 space-y-1.5">
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
                <span>➕ ಇನ್ನೊಂದು ಪ್ರಶ್ನಾವಳಿ ಕೇಳಿ (Ask Another Prashna • 🪙 ೫೦೦)</span>
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
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>✍️</span>
                <span>ಶುಭ ನಾಮ & ಸಂಖ್ಯಾ ಸಂಯೋಜನೆ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 ೫೦೦ ನಾಣ್ಯಗಳು (500 Coins)
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

      {/* Falling Coins Refill Modal with Dropping Coins Animation */}
      <FallingCoinsRefillModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        requiredCoins={200}
      />

      {/* Pre-Action Coin Deduction Confirmation Modal */}
      {pendingDeduction && (
        <CoinDeductionModal
          isOpen={pendingDeduction.isOpen}
          serviceTitle={pendingDeduction.serviceTitle}
          serviceTitleKannada={pendingDeduction.serviceTitleKannada}
          costCoins={pendingDeduction.costCoins}
          devoteeName={pendingDeduction.devoteeName}
          description={pendingDeduction.description}
          onClose={() => setPendingDeduction(null)}
          onConfirm={pendingDeduction.onConfirm}
          onOpenRefill={() => {
            setPendingDeduction(null);
            setIsRechargeOpen(true);
          }}
        />
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
                ಸಕ್ರಿಯ ಪುರೋಹಿತ ಕೋಶ
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
            <h3 className="font-black text-amber-950">📊 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸೇವಾ ಶುಲ್ಕ ದರಪಟ್ಟಿ (🪙 ನಾಣ್ಯ ಕೋಶ):</h3>
            <div className="divide-y divide-amber-200 font-semibold">
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (500 Coins)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಶುಭ ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (500 Coins)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಮೊಬೈಲ್ & ವಾಹನ ಸಂಖ್ಯಾ ಸೂಚನೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (500 Coins)</span>
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
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      try {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("reset");
                        url.searchParams.delete("firstTime");
                        const newSearch = url.searchParams.toString();
                        window.history.replaceState({}, document.title, url.pathname + (newSearch ? `?${newSearch}` : "") + url.hash);
                      } catch {}
                    }
                    setShowPasswordSetup(false);
                  }}
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
