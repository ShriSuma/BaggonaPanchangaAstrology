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
import { usePricingConfigStore } from "../wallet/pricingConfigStore";
import {
  generateSankhyaPrashnaReading,
  generateSankhyaNameSuggestion,
  generateSankhyaMobileVehicleSuggestion,
  generateSankhyaJanmaReading,
  type SankhyaPrashnaResult,
  type SankhyaNameResult,
  type SankhyaMobileVehicleResult,
  type SankhyaJanmaResult
} from "./sankhyaShastraPriestEngine";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";
import { setDoc, doc } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import { updateUserPassword, isPriestAccountActive, isPriestFirstTimeSetupDone, getUserProfile } from "../../db/firestoreDb";
import { hashPassword } from "../auth/authStore";
import { notifyPasswordResetCompleted, notifySystemFailureAlert } from "../notifications/notificationService";
import { CoinDeductionModal } from "../../components/wallet/CoinDeductionModal";
import { FallingCoinsRefillModal } from "../../components/wallet/FallingCoinsRefillModal";
import { SankhyaNumerologyLoader } from "../../components/sankhyashastra/SankhyaNumerologyLoader";
import { VoiceDictationButton } from "../../components/ui/VoiceDictationButton";
import AudioPlayerButton from "../../components/ui/AudioPlayerButton";

type SankhyaTab = "janma" | "prashna" | "name_numbers" | "wallet";

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

  // Dynamic Service Pricing Store
  const getCoins = usePricingConfigStore((s) => s.getCoins);
  const janmaCost = getCoins("SANKHYA_JANMA_ANALYSIS", 500);
  const prashnaCost = getCoins("SANKHYA_PRASHNA", 250);
  const nameCost = getCoins("SANKHYA_NAME_SUGGESTION", 500);
  const vehicleCost = getCoins("SANKHYA_MOBILE_VEHICLE", 500);

  // Load Saved Session from localStorage (Anti-Reset Guard for Refresh / Mobile Disconnects)
  const savedSankhya = useMemo(() => loadSavedPriestSankhyaState(), []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<SankhyaTab>(() => savedSankhya?.activeTab || "prashna");

  // 5-Second Dismissible Royal Welcome Toast
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);

  // First-Time Password Setup & Profile Reset Modal (4 Mandatory Fields)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [priestEmail, setPriestEmail] = useState("");
  const [priestPhone, setPriestPhone] = useState("");
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

  // Tab 0: Janma Vedic Grid & Dasha Analysis State (500 Coins / ₹50)
  const [janmaDevoteeName, setJanmaDevoteeName] = useState(() => savedSankhya?.janmaDevoteeName || "");
  const [janmaGothra, setJanmaGothra] = useState(() => savedSankhya?.janmaGothra || "ಕಾಶ್ಯಪ");
  const [janmaBirthDate, setJanmaBirthDate] = useState(() => savedSankhya?.janmaBirthDate || "1994-08-14");
  const [janmaTargetDate, setJanmaTargetDate] = useState(() => savedSankhya?.janmaTargetDate || new Date().toISOString().split("T")[0]);
  const [janmaQuestion, setJanmaQuestion] = useState(() => savedSankhya?.janmaQuestion || "");
  const [janmaResult, setJanmaResult] = useState<SankhyaJanmaResult | null>(() => savedSankhya?.janmaResult || null);
  const [isCalculatingJanma, setIsCalculatingJanma] = useState(false);

  // Tab 1: Prashna Oracle State (250 Coins / ₹25) - Empty text box by default as requested
  const [devoteeName, setDevoteeName] = useState(() => savedSankhya?.devoteeName || "");
  const [gothra, setGothra] = useState(() => savedSankhya?.gothra || "ಕಾಶ್ಯಪ");
  const [prashnaNumber, setPrashnaNumber] = useState<string>(() => {
    if (savedSankhya?.prashnaNumber !== undefined && savedSankhya?.prashnaNumber !== null && savedSankhya?.prashnaNumber !== "") {
      return String(savedSankhya.prashnaNumber);
    }
    return "";
  });
  const [numberError, setNumberError] = useState<string | null>(null);
  const [prashnaQuestion, setPrashnaQuestion] = useState(() => savedSankhya?.prashnaQuestion || "");
  const [prashnaResult, setPrashnaResult] = useState<SankhyaPrashnaResult | null>(() => savedSankhya?.prashnaResult || null);
  const [prashnaHistory, setPrashnaHistory] = useState<SankhyaPrashnaResult[]>(() => savedSankhya?.prashnaHistory || []);
  const [isCalculatingPrashna, setIsCalculatingPrashna] = useState(false);

  // Tab 2: Name & Mobile/Vehicle State (250 Coins / ₹25) - Restored from localStorage
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
        janmaDevoteeName,
        janmaGothra,
        janmaBirthDate,
        janmaTargetDate,
        janmaQuestion,
        janmaResult,
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
    janmaDevoteeName,
    janmaGothra,
    janmaBirthDate,
    janmaTargetDate,
    janmaQuestion,
    janmaResult,
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
    setJanmaDevoteeName("");
    setJanmaGothra("ಕಾಶ್ಯಪ");
    setJanmaBirthDate("1994-08-14");
    setJanmaTargetDate(new Date().toISOString().split("T")[0]);
    setJanmaQuestion("");
    setJanmaResult(null);
    setDevoteeName("");
    setGothra("ಕಾಶ್ಯಪ");
    setPrashnaNumber("");
    setNumberError(null);
    setPrashnaQuestion("");
    setPrashnaResult(null);
    setNameInput("");
    setBirthDate(new Date().toISOString().split("T")[0]);
    setNameResult(null);
    setMobileVehicleResult(null);
    setActiveTab("janma");
    setFeedback({
      type: "success",
      text: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಿಸೆಟ್ ಮಾಡಲಾಗಿದೆ. (Reset successful)."
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

    }

    const isResetOrFirstTime = typeof window !== "undefined" && (new URLSearchParams(window.location.search).get("reset") === "true" || new URLSearchParams(window.location.search).get("firstTime") === "true");

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

      // Pre-load existing email & phone from user profile if available
      try {
        const prof = await getUserProfile(resolvedUser);
        if (prof?.email) setPriestEmail(prof.email);
        if (prof?.phone || prof?.mobileNumber) setPriestPhone(prof.phone || prof.mobileNumber || "");
      } catch (err) {
        console.warn("[SankhyaPriestPortal] Error preloading profile:", err);
      }

      // Strict DB Validation: Check if this user has already completed password setup/reset
      if (isResetOrFirstTime) {
        const setupDone = await isPriestFirstTimeSetupDone(resolvedUser);
        if (!setupDone) {
          setShowPasswordSetup(true);
        } else {
          // Setup was already completed earlier in DB: do NOT show popup, strip query params cleanly
          if (typeof window !== "undefined") {
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete("reset");
              url.searchParams.delete("firstTime");
              const newSearch = url.searchParams.toString();
              window.history.replaceState({}, document.title, url.pathname + (newSearch ? `?${newSearch}` : "") + url.hash);
            } catch {}
          }
        }
      }
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
  // Handle Voice Input
  const handleVoiceInput = (targetField: "name" | "gothra" | "question" | "nameInput" | "janmaName" | "janmaGothra" | "janmaQuestion") => {
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
    else if (targetField === "janmaName") setJanmaDevoteeName("");
    else if (targetField === "janmaGothra") setJanmaGothra("");
    else if (targetField === "janmaQuestion") setJanmaQuestion("");

    session.startListening(
      (transcript) => {
        if (targetField === "name") setDevoteeName(transcript);
        else if (targetField === "gothra") setGothra(transcript);
        else if (targetField === "question") setPrashnaQuestion(transcript);
        else if (targetField === "nameInput") setNameInput(transcript);
        else if (targetField === "janmaName") setJanmaDevoteeName(transcript);
        else if (targetField === "janmaGothra") setJanmaGothra(transcript);
        else if (targetField === "janmaQuestion") setJanmaQuestion(transcript);
        setIsListeningFor(null);
      },
      () => setIsListeningFor(null),
      (err) => {
        setSpeechError(`ಧ್ವನಿ ದೋಷ: ${err}`);
        setIsListeningFor(null);
      }
    );
  };

  // 0. Submit Janma Vedic Grid & Dasha Reading (500 Coins / ₹50) with Pre-Action Confirmation
  const executeJanmaCalculation = async (cost: number) => {
    if (isCalculatingJanma) return;
    setIsCalculatingJanma(true);
    setFeedback(null);

    const targetDevotee = janmaDevoteeName.trim() || "ಶ್ರೀಯುತ ಭಕ್ತರು";

    // Deduct 500 Coins
    const deductRes = await deductForService(cost, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಜನ್ಮ ಗ್ರಿಡ್ & ದಶಾ ವಿಶ್ಲೇಷಣೆ", targetDevotee);
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsCalculatingJanma(false);
      return;
    }

    try {
      const result = await generateSankhyaJanmaReading({
        devoteeName: targetDevotee,
        gothra: janmaGothra || "ಕಾಶ್ಯಪ",
        birthDateStr: janmaBirthDate,
        targetDateStr: janmaTargetDate,
        question: janmaQuestion.trim()
      });

      setJanmaResult(result);
      setFeedback({
        type: "success",
        text: `ಶ್ರೀ ${targetDevotee} ಅವರ ಜನ್ಮ ವೇದಿಕ ಗ್ರಿಡ್ ಹಾಗೂ ದಶಾ ಫಲ ಸಿದ್ಧವಾಗಿದೆ. (${cost} ನಾಣ್ಯಗಳು / ₹${Math.round(cost / 10)} ಕಡಿತಗೊಂಡಿವೆ)`
      });

      // Save to Cloud Firestore
      try {
        const janmaRef = doc(firestore, "sankhyashastra_janma_history", `janma_${Date.now()}`);
        await setDoc(janmaRef, {
          userId: currentUser || "priest_sankhya",
          priestName: activePriestDisplayName,
          portalType: "sankhyashastra_janma",
          devoteeName: targetDevotee,
          gothra: janmaGothra || "ಕಾಶ್ಯಪ",
          birthDateStr: janmaBirthDate,
          targetDateStr: janmaTargetDate,
          question: janmaQuestion,
          result,
          costCoins: cost,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("[SankhyaShastraPriestPortal] Firestore janma log warning:", e);
      }
    } catch (err: any) {
      console.error("[SankhyaShastraPriestPortal] Janma reading failed:", err);
      // Auto Refund coins on computation failure
      await refundCoins(cost, "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಜನ್ಮ ಗ್ರಿಡ್ ವಿಶ್ಲೇಷಣೆ ವಿಫಲ (ಮರುಪಾವತಿ)");
      setFeedback({
        type: "error",
        text: "ವಿಶ್ಲೇಷಣೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ನಾಣ್ಯಗಳನ್ನು ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingJanma(false);
    }
  };

  const handleJanmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = janmaCost;
    if (coinBalance < cost) {
      setIsRechargeOpen(true);
      return;
    }

    setPendingDeduction({
      isOpen: true,
      serviceTitle: "Sankhya Janma & Dasha Analysis",
      serviceTitleKannada: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಜನ್ಮ ಗ್ರಿಡ್ & ದಶಾ ವಿಶ್ಲೇಷಣೆ",
      costCoins: cost,
      devoteeName: janmaDevoteeName.trim() || "ಶ್ರೀಯುತ ಭಕ್ತರು",
      description: `ಜನ್ಮ ದಿನಾಂಕ ${janmaBirthDate} ಆಧಾರಿತ ೩x೩ ವೇದಿಕ ಗ್ರಿಡ್, ೩೭ ಯೋಗಗಳು, ಮಹಾದಶೆ-ಅಂತರ್ದಶೆ & ಪರಿಹಾರಗಳ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ (ದರ: 🪙 ${cost} ನಾಣ್ಯಗಳು / ₹${Math.round(cost / 10)})`,
      onConfirm: async () => {
        setPendingDeduction(null);
        await executeJanmaCalculation(cost);
      }
    });
  };

  // 1. Submit Prashna Oracle (250 Coins / ₹25) with Pre-Action Confirmation
  const executePrashnaCalculation = async (cost: number, numToUse: number) => {
    if (isCalculatingPrashna) return; // Prevent double-clicks
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
        number: numToUse,
        question: prashnaQuestion.trim() || "ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ಶುಭ ಫಲ",
        devoteeName: devoteeName || "ಭಕ್ತರು",
        gothra: gothra || "ಕಾಶ್ಯಪ"
      });

      setPrashnaResult(result);
      setPrashnaHistory((prev) => [result, ...prev]);
      setFeedback({
        type: "success",
        text: `ಸಂಖ್ಯೆ ${numToUse} ರ ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನಾವಳಿ ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ. (${cost} ನಾಣ್ಯಗಳು / ₹${Math.round(cost / 10)} ಕಡಿತಗೊಂಡಿವೆ)`
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
          number: numToUse,
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
        action: `ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆ (${numToUse})`,
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
    if (isCalculatingPrashna) return;

    const numTrimmed = String(prashnaNumber || "").trim();
    if (!numTrimmed) {
      setNumberError("The number is required field, please add the number (ಸಂಖ್ಯೆ ಅಗತ್ಯವಿರುವ ಕ್ಷೇತ್ರವಾಗಿದೆ, ದಯವಿಟ್ಟು ೧ ರಿಂದ ೧೦೮ ಅಥವಾ ೨೪೯ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ).");
      setFeedback({
        type: "error",
        text: "The number is required field, please add the number (ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ)."
      });
      return;
    }

    const parsedNum = parseInt(numTrimmed, 10);
    if (isNaN(parsedNum) || parsedNum <= 0) {
      setNumberError("ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಧನಾತ್ಮಕ ಸಂಖ್ಯೆಯನ್ನು (೧-೨೪೯) ನಮೂದಿಸಿ.");
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಧನಾತ್ಮಕ ಸಂಖ್ಯೆಯನ್ನು (೧-೨೪೯) ನಮೂದಿಸಿ."
      });
      return;
    }

    setNumberError(null);
    const cost = prashnaCost;

    setPendingDeduction({
      isOpen: true,
      serviceTitle: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ (Sankhya Prashna Oracle)",
      serviceTitleKannada: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ",
      costCoins: cost,
      devoteeName: devoteeName || "ಭಕ್ತರು",
      description: `ಪ್ರಶ್ನೆ ಸಂಖ್ಯೆ ${parsedNum}: "${prashnaQuestion.trim() || "ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ಶುಭ ಫಲ"}"`,
      onConfirm: async () => {
        await executePrashnaCalculation(cost, parsedNum);
      }
    });
  };

  // 2. Submit Name or Mobile/Vehicle Suggestion (250 Coins) with Pre-Action Confirmation
  const executeSuggestionCalculation = async (cost: number, serviceName: string) => {
    if (isCalculatingSuggestion) return;
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
    if (isCalculatingSuggestion) return;

    const cost = suggestionType === "name" ? nameCost : vehicleCost;

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

  // Password Reset / Setup (4 Mandatory Fields: Email, Mobile, Password, Confirm Password)
  const handlePasswordSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = priestEmail.trim().toLowerCase();
    const cleanPhone = priestPhone.replace(/\D/g, "");

    // 1. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setPasswordMsg("ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (Valid email address is mandatory).");
      return;
    }

    // 2. Phone validation (10 digits)
    if (!cleanPhone || cleanPhone.length < 10) {
      setPasswordMsg("ದಯವಿಟ್ಟು ೧೦ ಅಂಕಿಗಳ ಮಾನ್ಯವಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (Valid 10-digit mobile number is mandatory).");
      return;
    }

    // 3. Password length
    if (newPassword.length < 6) {
      setPasswordMsg("ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು (Minimum 6 characters).");
      return;
    }

    // 4. Confirm Password Match
    if (newPassword !== confirmPassword) {
      setPasswordMsg("ಎರಡೂ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ (Passwords do not match).");
      return;
    }

    try {
      const hashed = await hashPassword(newPassword);
      const uid = currentUser || (typeof window !== "undefined" ? localStorage.getItem("baggona_sankhya_priest_id") : null) || "priest_sankhya";
      
      await updateUserPassword(uid, hashed, {
        email: cleanEmail,
        phone: cleanPhone.slice(-10),
        mobileNumber: cleanPhone.slice(-10)
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("baggona_pwd_setup_done_" + uid, "true");
        localStorage.setItem("baggona_priest_email_" + uid, cleanEmail);
        localStorage.setItem("baggona_priest_phone_" + uid, cleanPhone.slice(-10));
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("reset");
          url.searchParams.delete("firstTime");
          const newSearch = url.searchParams.toString();
          window.history.replaceState({}, document.title, url.pathname + (newSearch ? `?${newSearch}` : "") + url.hash);
        } catch {}
      }

      void notifyPasswordResetCompleted({
        username: uid,
        recipientEmail: cleanEmail
      });

      setPasswordMsg("✓ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!");
      setTimeout(() => {
        setShowPasswordSetup(false);
        setPasswordMsg("");
        setNewPassword("");
        setConfirmPassword("");
      }, 600);
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
                coinBalance < 250
                  ? "bg-red-50 border-red-500 text-red-950 animate-pulse ring-1 ring-red-400"
                  : "bg-[#FFF9E6] border-amber-400 hover:bg-amber-100 text-amber-950"
              }`}
              title={coinBalance < 250 ? "⚠️ ನಾಣ್ಯಗಳ ಕೊರತೆ! ರೀಫಿಲ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ" : "ನಾಣ್ಯಗಳನ್ನು ರೀಚಾರ್ಜ್ ಮಾಡಿ"}
            >
              <span className="text-xs sm:text-sm">{coinBalance < 250 ? "⚠️" : "🪙"}</span>
              <div className="text-left">
                <div className={`text-[11px] sm:text-xs font-mono font-black leading-tight ${coinBalance < 250 ? "text-red-700 font-bold" : "text-amber-950"}`}>
                  {coinBalance.toLocaleString()} 🪙
                </div>
                <div className={`text-[8px] sm:text-[9px] font-extrabold leading-none ${coinBalance < 250 ? "text-red-600 animate-bounce" : "text-emerald-700"}`}>
                  {coinBalance < 250 ? "ಕೊರತೆ (+ರೀಫಿಲ್)" : "+ ರೀಚಾರ್ಜ್"}
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
              {activeTab === "janma"
                ? "ಜನ್ಮ ಗ್ರಿಡ್ (500🪙)"
                : activeTab === "prashna"
                ? "ಪ್ರಶ್ನಾವಳಿ (250🪙)"
                : activeTab === "name_numbers"
                ? "ನಾಮ/ಸಂಖ್ಯೆ (250🪙)"
                : "ವಾಲೆಟ್"}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#FFFDF7] border-2 border-amber-400/60 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("janma")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "janma"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black"
                : "text-amber-900 hover:bg-amber-50"
            }`}
          >
            <span>📐</span>
            <span>ಜನ್ಮ ಗ್ರಿಡ್ (🪙 ೫೦೦)</span>
          </button>

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
            <span>ಪ್ರಶ್ನಾವಳಿ (🪙 ೨೦೦)</span>
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
            <span>ನಾಮ & ಸಂಖ್ಯೆ (🪙 ೨೦೦)</span>
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

      {/* TAB 0: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಜನ್ಮ ಗ್ರಿಡ್ & ದಶಾ ಭವಿಷ್ಯ (500 Coins) */}
      {activeTab === "janma" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>📐</span>
                <span>ವೈದಿಕ ಜನ್ಮ ಗ್ರಿಡ್, ೩೭ ಯೋಗಗಳು & ದಶಾ ವಿಶ್ಲೇಷಣೆ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 {janmaCost} ನಾಣ್ಯಗಳು ({janmaCost} Coins / ₹{Math.round(janmaCost / 10)})
              </span>
            </div>

            <form onSubmit={handleJanmaSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಭಕ್ತರ ಪೂರ್ಣ ಹೆಸರು *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={janmaDevoteeName}
                      onChange={(e) => setJanmaDevoteeName(e.target.value)}
                      placeholder="ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ / SACHIN TENDULKAR"
                      required
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("janmaName")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "janmaName" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
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
                      value={janmaGothra}
                      onChange={(e) => setJanmaGothra(e.target.value)}
                      placeholder="ಉದಾ: ಕಾಶ್ಯಪ / ಶ್ರೀವತ್ಸ"
                      className="w-full px-3 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInput("janmaGothra")}
                      className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                        isListeningFor === "janmaGothra" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
                      }`}
                    >
                      🎤
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-amber-950 font-bold mb-1">ಜನ್ಮ ದಿನಾಂಕ (Date of Birth) *</label>
                  <input
                    type="date"
                    value={janmaBirthDate}
                    onChange={(e) => setJanmaBirthDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1">ದಶಾ ಭವಿಷ್ಯ ಗುರಿ ದಿನಾಂಕ (Target Date)</label>
                  <input
                    type="date"
                    value={janmaTargetDate}
                    onChange={(e) => setJanmaTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ / ಸಮಾಲೋಚನೆ (ಐಚ್ಛಿಕ)</label>
                <div className="relative">
                  <textarea
                    value={janmaQuestion}
                    onChange={(e) => setJanmaQuestion(e.target.value)}
                    placeholder="ಉದಾ: ಉದ್ಯೋಗ ಬಡ್ತಿ, ವಿದೇಶ ಪ್ರಯಾಣ, ಆರ್ಥಿಕ ಪ್ರಗತಿ, ವಿವಾಹ ಕಾಲ..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 pr-8 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("janmaQuestion")}
                    className={`absolute right-1.5 top-2 p-1 rounded-lg ${
                      isListeningFor === "janmaQuestion" ? "bg-red-500 text-white animate-pulse" : "text-amber-700"
                    }`}
                  >
                    🎤
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalculatingJanma}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-black text-sm rounded-2xl shadow-lg border border-amber-400 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{isCalculatingJanma ? "⌛" : "📐"}</span>
                  <span>
                    {isCalculatingJanma
                      ? "ಜಾತಕ ಗಣಿತ ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತಿದೆ..."
                      : "ಜನ್ಮ ಗ್ರಿಡ್ & ದಶಾ ಫಲ ಪಡೆಯಿರಿ (🪙 ೫೦೦ / ₹೫೦)"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Janma Results Presentation */}
          {janmaResult && (
            <div className="space-y-4 animate-fadeIn">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-[#FFF9E6] via-[#FFFDF7] to-[#FFF5D6] border-2 border-amber-400 rounded-3xl p-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                      ವೈದಿಕ ಸಾಂಖ್ಯ ಶಾಸ್ತ್ರ ಪೂರ್ಣ ಜಾತಕ
                    </span>
                    <h3 className="text-lg font-black text-amber-950">
                      ಶ್ರೀ {janmaResult.devoteeName} ({janmaResult.gothra} ಗೋತ್ರ)
                    </h3>
                    <p className="text-xs text-slate-600">
                      ಜನ್ಮ ದಿನಾಂಕ: {janmaResult.birthDateStr} | ಗಣಿತ ಸೂತ್ರ: ಡಿಜಿಟಲ್ ರೂಟ್ R9(x)
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-200/90 border border-amber-400 px-3 py-1 text-xs font-black text-amber-950">
                    {janmaResult.priestVerdictBadgeKn}
                  </span>
                </div>

                {/* 4 Core Number Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  <div className="rounded-2xl border border-amber-300 bg-white p-3 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-amber-800">ಮೂಲಾಂಕ (Psychic)</span>
                    <div className="text-2xl font-black text-amber-700">{janmaResult.profile.moolankInfo.moolank}</div>
                    <div className="text-[10px] font-bold text-slate-700">
                      {janmaResult.profile.moolankInfo.rulingGraha.name.kn}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-orange-300 bg-white p-3 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-orange-800">ಭಾಗ್ಯಾಂಕ (Destiny)</span>
                    <div className="text-2xl font-black text-orange-700">{janmaResult.profile.bhagyankInfo.bhagyank}</div>
                    <div className="text-[10px] font-bold text-slate-700">
                      {janmaResult.profile.bhagyankInfo.rulingGraha.name.kn}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-300 bg-white p-3 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-800">ನಾಮಾಂಕ (Chaldean)</span>
                    <div className="text-2xl font-black text-emerald-700">{janmaResult.profile.nameInfo.namank}</div>
                    <div className="text-[10px] font-bold text-slate-700">
                      {janmaResult.profile.nameInfo.rulingGraha.name.kn}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-300 bg-white p-3 text-center shadow-xs">
                    <span className="text-[10px] font-bold text-indigo-800">ಆತ್ಮೇಚ್ಛೆ & ವ್ಯಕ್ತಿತ್ವ</span>
                    <div className="text-sm font-black text-indigo-900 mt-1">
                      SU: {janmaResult.profile.nameInfo.soulUrge} | Pn: {janmaResult.profile.nameInfo.personality}
                    </div>
                    <div className="text-[9px] text-slate-600">ಸ್ವರ / ವ್ಯಂಜನ ಕಂಪನ</div>
                  </div>
                </div>

                {/* 3x3 Vedic Grid Visualizer */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/50 p-4 mb-4">
                  <h4 className="font-bold text-xs text-amber-950 mb-2.5 flex items-center justify-between">
                    <span>📐 ೩x೩ ನವಗ್ರಹ ವೇದಿಕ ಗ್ರಿಡ್ ಕೋಷ್ಟಕ</span>
                    <span className="text-[10px] text-amber-800">ಶತಮಾನ ಅಂಕಿ ಹೊರತುಪಡಿಸಿದ ನೈಜ ಗ್ರಿಡ್</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                    {[3, 1, 9, 6, 7, 5, 2, 8, 4].map((num) => {
                      const cell = janmaResult.profile.gridMatrix.cells[num];
                      const count = cell.count;
                      return (
                        <div
                          key={num}
                          className={`rounded-xl border p-2.5 text-center flex flex-col items-center justify-center ${
                            count === 0
                              ? "border-slate-200 bg-white text-slate-400 opacity-50"
                              : count === 1
                              ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-bold"
                              : count === 2
                              ? "border-amber-400 bg-amber-100 text-amber-950 font-black ring-2 ring-amber-300"
                              : "border-rose-400 bg-rose-100 text-rose-950 font-black ring-2 ring-rose-300"
                          }`}
                        >
                          <div className="text-xl font-black">{num}</div>
                          <div className="text-[10px] leading-tight">{cell.grahaMeta.sanskritName}</div>
                          <div className="text-[9px] font-mono mt-0.5">
                            {count > 0 ? `×${count}` : "೦"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 37 Yogas & Dasha Analysis */}
                <div className="space-y-3 mb-4">
                  <div className="rounded-2xl border border-amber-300 bg-white p-4">
                    <h4 className="font-bold text-xs text-amber-950 mb-2">
                      ✨ ಸಕ್ರಿಯ ಸಂಖ್ಯಾ ಯೋಗಗಳು ({janmaResult.profile.yogasResult.activeYogas.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {janmaResult.profile.yogasResult.activeYogas.map((y) => (
                        <div
                          key={y.id}
                          className={`rounded-xl border p-2.5 text-xs ${
                            y.isPositive ? "border-emerald-200 bg-emerald-50/50 text-slate-800" : "border-amber-200 bg-amber-50/50 text-slate-800"
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between mb-1">
                            <span>{y.name.kn} ({y.combination.join("-")})</span>
                            <span className={y.isPositive ? "text-emerald-700" : "text-amber-700"}>
                              {y.isPositive ? "🟢 ಶುಭ" : "⚠️ ಎಚ್ಚರಿಕೆ"}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-600">{y.manifestation.kn}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-300 bg-white p-4">
                    <h4 className="font-bold text-xs text-amber-950 mb-1.5">
                      ⏳ ದಶಾ ಕಾಲಚಕ್ರ & ಸಾಂದ್ರತಾ ಸ್ಥಿತಿ
                    </h4>
                    <div className="text-xs text-slate-700 mb-2 leading-relaxed">
                      <strong>ಮಹಾದಶೆ:</strong> {janmaResult.profile.nestedDasha.activeMahadasha.grahaMeta.name.kn} ({janmaResult.profile.nestedDasha.activeMahadasha.grahaNumber}) | <strong>ಅಂತರ್ದಶೆ:</strong> {janmaResult.profile.nestedDasha.activeAntardasha.grahaMeta.name.kn} ({janmaResult.profile.nestedDasha.activeAntardasha.grahaNumber}) | <strong>ಪ್ರತ್ಯಂತರ್ದಶೆ:</strong> {janmaResult.profile.nestedDasha.activePratyantardasha.grahaMeta.name.kn} ({janmaResult.profile.nestedDasha.activePratyantardasha.grahaNumber})
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      {janmaResult.profile.nestedDasha.multiplicityStatus.explanationKn}
                    </div>
                  </div>
                </div>

                {/* AI Deep Reading */}
                {janmaResult.aiDeepReadingKn && (
                  <div className="rounded-2xl border border-amber-300 bg-white p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-xs">
                    <h4 className="font-bold text-amber-950 mb-1.5 border-b border-amber-100 pb-1">
                      🔮 ಗುರುಗಳ ಶಾಸ್ತ್ರೀಯ ಭವಿಷ್ಯ ಫಲ
                    </h4>
                    {janmaResult.aiDeepReadingKn}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ (200 Coins) */}
      {activeTab === "prashna" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>🔮</span>
                <span>ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 {prashnaCost} ನಾಣ್ಯಗಳು ({prashnaCost} Coins / ₹{Math.round(prashnaCost / 10)})
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
                  ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (೧ ರಿಂದ ೧೦೮ ಅಥವಾ ೧ ರಿಂದ ೨೪೯) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={249}
                  value={prashnaNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPrashnaNumber(val);
                    if (val.trim()) setNumberError(null);
                  }}
                  placeholder="ಉದಾ: 108 ಅಥವಾ 1 ರಿಂದ 249"
                  className={`w-full px-3 py-2 bg-[#FEFCF4] border-2 ${
                    numberError
                      ? "border-red-500 bg-red-50/70 ring-2 ring-red-400/50"
                      : "border-amber-300 focus:border-amber-500"
                  } rounded-xl text-slate-900 font-bold text-base focus:outline-none shadow-inner font-mono`}
                />
                {numberError && (
                  <p className="text-red-600 font-bold text-[11px] mt-1.5 flex items-center gap-1 animate-pulse">
                    <span>⚠️</span>
                    <span>{numberError}</span>
                  </p>
                )}
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
                    <span className="opacity-80 font-mono font-bold">(🪙 ೨೦೦)</span>
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

              {/* Revered Priest Divination Header & Highlights */}
              <div className="bg-gradient-to-r from-[#FFF8E7] via-[#FFFDF7] to-[#FFF8E7] border-2 border-amber-400/90 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      🛕 ಗೋಕರ್ಣ-ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರ • ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸಾನ್ನಿಧ್ಯ
                    </span>
                    <h3 className="text-sm font-black text-amber-950 flex items-center gap-1.5 mt-0.5">
                      <span>📜</span>
                      <span>ಅರ್ಚಕರ ಸಾಕ್ಷಾತ್ ವಾಣಿ & ದೈವಿಕ ನಿರ್ಣಯ ಮುಖ್ಯಾಂಶಗಳು</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AudioPlayerButton
                      text={prashnaResult.technicalParagraphs.map(p => `${p.titleKn}. ${p.contentKn}`).join(" ")}
                      lang="kn-IN"
                      voiceType="priest"
                      className="bg-amber-200 text-amber-950 px-2.5 py-1 text-xs font-bold rounded-xl border border-amber-400 shadow-xs hover:bg-amber-300"
                    />
                  </div>
                </div>

                {/* 6 Actionable Prediction Pillars Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">🪐 ಗ್ರಹಾಧಿಪತಿ & ತರಂಗ</span>
                    <span className="font-black text-amber-950">{prashnaResult.rulingPlanetKn}</span>
                    <span className="text-[10px] text-slate-600 block">({prashnaResult.natureKn})</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">🧭 ಶೋಧನಾ / ಕಾರ್ಯ ದಿಕ್ಕು</span>
                    <span className="font-black text-amber-950">{prashnaResult.rulingDirectionKn}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 space-y-0.5 shadow-xs">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">⏳ ಫಲ ಸಿದ್ಧಿ ಕಾಲಾವಧಿ</span>
                    <span className="font-black text-amber-950">{prashnaResult.auspiciousTimeframeKn}</span>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-300 space-y-0.5 shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">👥 ವರ್ಗ & ಜನರ ಮನಸ್ಥಿತಿ</span>
                    <span className="font-black text-amber-950">{prashnaResult.varnaKn}</span>
                  </div>

                  <div className="p-2.5 bg-[#FEFCF4] rounded-xl border-2 border-amber-400 space-y-0.5 shadow-xs col-span-2">
                    <span className="text-[10px] font-black text-amber-900 uppercase block">🗝️ ವಸ್ತು / ಸ್ಥಳ / ಪರಿಸರದ ನೈಜ ಸುಳಿವು</span>
                    <span className="font-bold text-amber-950 leading-relaxed block">{prashnaResult.lostArticleOrPersonKn}</span>
                  </div>
                </div>
              </div>

              {/* Unified 4 In-Depth Priest Scholarly Paragraphs Reading */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FEFCF4] to-white border-2 border-amber-300/80 space-y-4 shadow-xs">
                {prashnaResult.technicalParagraphs.map((para, idx) => (
                  <div key={idx} className="space-y-1.5 pb-3 border-b border-amber-100 last:border-b-0 last:pb-0">
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span className="text-amber-600">✦</span>
                      <span>{para.titleKn}</span>
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium pl-3 border-l-2 border-amber-400">
                      {para.contentKn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Remedies */}
              {prashnaResult.remedyListKn && (
                <div className="p-4 bg-gradient-to-br from-amber-100/70 to-orange-50 rounded-2xl border-2 border-amber-400 space-y-2 shadow-xs">
                  <h4 className="text-xs font-black text-amber-950 flex items-center gap-2 border-b border-amber-300 pb-1.5">
                    <span>🪔</span>
                    <span>ಬಗ್ಗೋಣ ಶ್ರೀ ಮಹಾಗಣಪತಿ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ ಜಪಾನುಷ್ಠಾನ:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950 pl-4 list-disc font-semibold leading-relaxed">
                    {prashnaResult.remedyListKn.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: 1-Click WhatsApp Share & Ask Another */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const parasText = prashnaResult.technicalParagraphs
                      .map((p, i) => `*${i + 1}. ${p.titleKn}*\n${p.contentKn}`)
                      .join("\n\n");
                    const remediesText = (prashnaResult.remedyListKn || [])
                      .map((r, i) => `• ${r}`)
                      .join("\n");
                    const message = encodeURIComponent(
                      `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ॥\n\n` +
                      `*ಅರ್ಚಕರ ಸಾಕ್ಷಾತ್ ವಾಣಿ & ದೈವಿಕ ನಿರ್ಣಯ*\n` +
                      `👤 ಭಕ್ತರು: ${prashnaResult.devoteeName} (${prashnaResult.gothra} ಗೋತ್ರ)\n` +
                      `❓ ಪ್ರಶ್ನೆ: ${prashnaResult.question}\n` +
                      `🪐 ಸಂಖ್ಯೆ: ${prashnaResult.number} (ಅಧಿಪತಿ: ${prashnaResult.rulingPlanetKn} - ${prashnaResult.natureKn})\n` +
                      `🧭 ಶೋಧನಾ ದಿಕ್ಕು: ${prashnaResult.rulingDirectionKn}\n` +
                      `⏳ ಕಾಲಾವಧಿ: ${prashnaResult.auspiciousTimeframeKn}\n` +
                      `🗝️ ಸ್ಥಳ/ವಸ್ತು ಸುಳಿವು: ${prashnaResult.lostArticleOrPersonKn}\n\n` +
                      `${parasText}\n\n` +
                      `*🪔 ಬಗ್ಗೋಣ ದೈವಿಕ ಪರಿಹಾರಗಳು:*\n${remediesText}\n\n` +
                      `॥ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ • ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
                  }}
                  className="py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 border border-emerald-400 active:scale-95 transition-all"
                >
                  <span>💬</span>
                  <span>WhatsApp ನಲ್ಲಿ ವರದಿ ಕಳುಹಿಸಿ</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPrashnaQuestion("");
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                  className="py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 border border-amber-400 active:scale-95 transition-all"
                >
                  <span>➕</span>
                  <span>ಇನ್ನೊಂದು ಪ್ರಶ್ನಾವಳಿ ಕೇಳಿ (🪙 ೨೫೦)</span>
                </button>
              </div>

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

      {/* TAB 2: ಶುಭ ನಾಮ ಮತ್ತು ಮೊಬೈಲ್/ವಾಹನ ಸೂಚನೆ (250 Coins) */}
      {activeTab === "name_numbers" && (
        <div className="px-4 mt-4 space-y-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-md">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <h2 className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>✍️</span>
                <span>ಶುಭ ನಾಮ & ಸಂಖ್ಯಾ ಸಂಯೋಜನೆ</span>
              </h2>
              <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                ದರ: 🪙 {suggestionType === "name" ? nameCost : vehicleCost} ನಾಣ್ಯಗಳು ({suggestionType === "name" ? nameCost : vehicleCost} Coins / ₹{Math.round((suggestionType === "name" ? nameCost : vehicleCost) / 10)})
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
                      ಪ್ರಸ್ತುತ ಹೆಸರು ಅಥವಾ ಮಗುವಿನ / ವ್ಯಾಪಾರದ ಹೆಸರು
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="ಉದಾ: ANAND ಅಥವಾ SHREERAM"
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
                    <span className="opacity-80 font-mono font-bold">(🪙 ೨೫೦)</span>
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
                  <span>ಹೊಸ ಸೂಚನೆ</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300">
                  <span className="text-[10px] text-amber-800 block font-bold">ಮೂಲಾಂಕ (ಜನ್ಮ ಗ್ರಹ ಬಲ)</span>
                  <span className="font-mono font-black text-amber-950 text-base">{nameResult.mulanka}</span>
                </div>
                <div className="p-3 bg-[#FEFCF4] rounded-2xl border-2 border-emerald-400">
                  <span className="text-[10px] text-emerald-800 block font-bold">ಭಾಗ್ಯಾಂಕ (ದೈವಿಕ ಯೋಗ ಸಂಖ್ಯೆ)</span>
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
                  <span>ಹೊಸ ಸಂಖ್ಯೆ</span>
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
        requiredCoins={250}
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
                <span className="text-slate-800">ವೈದಿಕ ಜನ್ಮ ಗ್ರಿಡ್, ೩೭ ಯೋಗಗಳು & ದಶಾ ವಿಶ್ಲೇಷಣೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 {janmaCost} ನಾಣ್ಯಗಳು ({janmaCost} Coins / ₹{Math.round(janmaCost / 10)})</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ ದರ್ಶನ</span>
                <span className="font-mono font-bold text-amber-900">🪙 {prashnaCost} ನಾಣ್ಯಗಳು ({prashnaCost} Coins / ₹{Math.round(prashnaCost / 10)})</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಶುಭ ನಾಮ ಸಂಖ್ಯಾ ಸೂಚನೆ (Name Degree)</span>
                <span className="font-mono font-bold text-amber-900">🪙 {nameCost} ನಾಣ್ಯಗಳು ({nameCost} Coins / ₹{Math.round(nameCost / 10)})</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಮೊಬೈಲ್ & ವಾಹನ ಸಂಖ್ಯಾ ಸೂಚನೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 {vehicleCost} ನಾಣ್ಯಗಳು ({vehicleCost} Coins / ₹{Math.round(vehicleCost / 10)})</span>
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

            <form onSubmit={handlePasswordSetupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಇಮೇಲ್ ವಿಳಾಸ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">✉️</span>
                  <input
                    type="email"
                    value={priestEmail}
                    onChange={(e) => setPriestEmail(e.target.value)}
                    placeholder="priest@gmail.com"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setPriestEmail(text)}
                      transform={(raw) => raw.trim().toLowerCase().replace(/\s+at\s+/g, "@").replace(/\s+dot\s+/g, ".").replace(/\s+/g, "")}
                      lang="en-IN"
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಇಮೇಲ್ ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5 font-medium">ಅಧಿಸೂಚನೆಗಳು ಹಾಗೂ ಖಾತೆ ಪುನಃಸ್ಥಾಪನೆಗೆ ಕಡ್ಡಾಯ</p>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಮೊಬೈಲ್ ಸಂಖ್ಯೆ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">📱</span>
                  <input
                    type="tel"
                    value={priestPhone}
                    onChange={(e) => setPriestPhone(e.target.value)}
                    placeholder="9108135387 (೧೦ ಅಂಕಿಗಳು)"
                    maxLength={10}
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setPriestPhone(text)}
                      transform={(raw) => raw.replace(/[^0-9]/g, "")}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5 font-medium">೧೦ ಅಂಕಿಗಳ ಅಧಿಕೃತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</p>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">🔑</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setNewPassword(text)}
                      transform={(raw) => raw.trim().replace(/\s+/g, "")}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm">🛡️</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ಮತ್ತೊಮ್ಮೆ ನಮೂದಿಸಿ"
                    required
                    className="w-full pl-9 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setConfirmPassword(text)}
                      transform={(raw) => raw.trim().replace(/\s+/g, "")}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ"
                    />
                  </div>
                </div>
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
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                >
                  ನಂತರ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-all transform active:scale-95"
                >
                  ಪ್ರೊಫೈಲ್ & ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Beautiful Animated Numerology Loader for all GenAI / Calculation Requests */}
      {(isCalculatingPrashna || isCalculatingSuggestion || isCalculatingJanma) && (
        <SankhyaNumerologyLoader
          isKn={true}
          message={
            isCalculatingJanma
              ? "೩x೩ ವೇದಿಕ ಗ್ರಿಡ್, ೩೭ ಯೋಗಗಳು, ದಶಾ ಚಕ್ರ ಹಾಗೂ ಪರಿಹಾರಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
              : isCalculatingPrashna
              ? "ಪ್ರಶ್ನಾ ಲಗ್ನ, ಗ್ರಹ ಗೋಚಾರ ಹಾಗೂ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ವಿಶ್ಲೇಷಣೆಯೊಂದಿಗೆ ನಿಖರ ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
              : "ನಾಮ ಹಾಗೂ ಸಂಖ್ಯಾ ಕಂಪನ ಗಣಿತ ವಿಶ್ಲೇಷಣೆ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..."
          }
        />
      )}
    </div>
  );
};
