import React, { useState, useEffect, useMemo, useRef } from "react";
import { useWalletStore } from "../wallet/walletStore";
import { useAuthStore } from "../auth/authStore";
import { useAppStore } from "../../stores/appStore";
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
import { notifyPasswordResetCompleted, notifySystemFailureAlert } from "../notifications/notificationService";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { translateText } from "../../utils/translator";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { PdfTemplate, type PdfTranslations, type PremiumData } from "../../components/RamanBhavishya/PdfTemplate";
import { generateMasterPrediction } from "../../core/MasterPredictionEngine";
import { detectAffairIndicators } from "../../core/layers/NatalLayer";
import { askGemini } from "../../core/GeminiEngine";
import { getTransitsForDate } from "../../core/BaggonaPredictionEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { WEEKDAY_L5 } from "../../features/seva/sevaLocale";
import {
  type GrahaKey,
  tp,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  formatBirthLine,
  greetingLine,
  runningPeriodSentence,
  buildComprehensiveIntro,
  newRunId,
  stripJayashreeIntro
} from "../../features/premiumPdf/premiumPdfLocale";
import {
  buildPremiumPrompts,
  type NatalPlacement,
  type TransitPlacement
} from "../../features/premiumPdf/premiumPrompts";

const toGraha = (planet: any): GrahaKey => String(planet) as GrahaKey;
const asText = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join(" ") : value ?? "";

const toSafeArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return [{ impact: val }];
  if (typeof val === "object") return [val];
  return [];
};

const ensureValidSection = async (
  items: any,
  fallbackText: string,
  targetLang: string
): Promise<{ name?: string; impact: string; remedy?: string; dateRange?: string }[]> => {
  const safeItems = toSafeArray(items);
  const validItems = safeItems.filter(item => item && (item.impact || item.description || item.trait || "").trim().length > 10);
  if (validItems.length > 0) {
    return validItems;
  }
  const translatedFallback = await translateText(fallbackText, targetLang);
  return [{ impact: translatedFallback }];
};

function buildKundaliCharacteristicsFallback(lang: string, lagnaStr: string, moonStr: string, dashaStr: string, bhuktiStr: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}), ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaStr} ಮಹಾದಶೆಯ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ವಿಶಿಷ್ಟವಾದ ತೇಜಸ್ಸು ಹಾಗೂ ಬಲವನ್ನು ತುಂಬುತ್ತದೆ. ನೀವು ಸ್ವಾಭಾವಿಕವಾಗಿಯೇ ಉನ್ನತ ತರ್ಕಜ್ಞಾನ, ದೃಢ ಮನೋಬಲ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಅತ್ಯಂತ ಶಿಸ್ತಿನಿಂದ ನಿರ್ವಹಿಸುವ ನಾಯಕತ್ವ ಗುಣಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ. ಗ್ರಹಗಳ ಬಲವಾದ ಸ್ಥಿತಿಯಿಂದಾಗಿ ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಯೋಜನೆಗಳಲ್ಲಿ ದೂರದರ್ಶಿತ್ವ ಎದ್ದು ಕಾಣುತ್ತದೆ. ಸಮಾಜದಲ್ಲಿ ಧಾರ್ಮಿಕ ಗೌರವ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಮೌಲ್ಯಗಳನ್ನು ಕಾಯ್ದುಕೊಂಡು ನಡೆಯುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದ ಮುಖ್ಯ ಲಕ್ಷಣವಾಗಿದೆ.\n\nಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${bhuktiStr} ಭುಕ್ತಿ ಕಾಲವು ನಿಮ್ಮ ಆಂತರಿಕ ಚೇತನವನ್ನು ಮತ್ತಷ್ಟು ಜಾಗೃತಗೊಳಿಸಲಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ನವೀನ ಆಲೋಚನೆಗಳು ಮೂಡಿಬರಲಿದ್ದು, ಕೈಗೊಂಡ ಕಾರ್ಯಗಳಲ್ಲಿ ಸತತ ಪ್ರಯತ್ನ ಹಾಗೂ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಶ್ರೇಷ್ಠ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म लग्न (${lagnaStr}), चंद्र राशि (${moonStr}) और वर्तमान ${dashaStr} महादशा का प्रभाव आपके व्यक्तित्व को अत्यंत प्रभावशाली और दूरदर्शी बनाता है। आप प्राकृतिक रूप से उच्च तार्किक क्षमता, दृढ इच्छाशक्ति और पारिवारिक उत्तरदायित्वों को निष्ठापूर्वक निभाने वाले गुणों से संपन्न हैं।\n\nवर्तमान ${bhuktiStr} भुक्ति का प्रभाव आपकी आंतरिक ऊर्जा को और मजबूत करेगा।`;
  }
  if (baseLang === "te") {
    return `మీ జన్మ లగ్నం (${lagnaStr}), చంద్ర రాశి (${moonStr}) మరియు ప్రస్తుత ${dashaStr} మహాతశ ప్రభావం మీ వ్యక్తిత్వానికి విశేషమైన తేಜస్సును এবং మానసిక బలాన్ని అందిస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் லக்னம் (${lagnaStr}), சந்திர ರಾசி (${moonStr}) மற்றும் தற்போதைய ${dashaStr} தசா காலம் உங்கள் ஆளுமைக்கு மிகுந்த வலிமையையும் நற்பெயரையும் தருகிறது.`;
  }
  return `Based on your birth Lagna (${lagnaStr}), Moon sign (${moonStr}), and running ${dashaStr} Mahadasha, your personality is imbued with strong intellect, resilience, and natural leadership capabilities.`;
}

function buildKundaliDarkSecretFallback(lang: string, lagnaStr: string, moonStr: string, dashaStr: string, bhuktiStr: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ ಅಷ್ಟಮ ಹಾಗೂ ದ್ವಾದಶ ಭಾವಗಳ ಕರ್ಮಿಕ ಸಂರಚನೆ, ರಾಹು-ಕೇತುಗಳ ಸ್ಥಿತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaStr} ದಶೆಯ ಆಂತರಿಕ ಪ್ರಭಾವವು ನಿಮ್ಮ ಆತ್ಮದ ಆಳದಲ್ಲಿ ಅಡಗಿರುವ ಗೂಢ ರಹಸ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನೀವು ಹೊರನೋಟಕ್ಕೆ ಅತ್ಯಂತ ಶಾಂತ ಹಾಗೂ ಧೈರ್ಯಶಾಲಿಯಾಗಿ ಕಂಡುಬಂದರೂ, ಒಳಗಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಹಳೆಯ ಘಟನೆಗಳ ಕಲ್ಪನೆ ಅಥವಾ ಭಾವನಾತ್ಮಕ ಒಂಟಿತನದ ಅನಿಸಿಕೆಗಳು ಒಮ್ಮೊಮ್ಮೆ ಬಾಧಿಸಬಹುದು.\n\nಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${bhuktiStr} ಭುಕ್ತಿ ಕಾಲವು ಈ ಕರ್ಮಿಕ ಮಾನಸಿಕ ಸಂಕೋಲೆಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆಯುವ ಸುಸಮಯವಾಗಿದೆ. ನಿತ್ಯವೂ ಧ್ಯಾನ, ನವಗ್ರಹ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಶಮನ ಪರಿಹಾರವಾಗಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के अष्टम और द्वादश भाव का कर्मिक प्रभाव, राहू-केतु की स्थिति तथा वर्तमान ${dashaStr} महादशा आपके भीतर एक गहरे आध्यात्मिक अनुभव का संकेत देती है।`;
  }
  return `The karmic alignment of your 8th and 12th houses, the nodal axis of Rahu-Ketu, and your running ${dashaStr} Mahadasha point to a deep soul pattern. Externally you maintain composure, while internally navigating silent emotional vulnerabilities.`;
}

function buildKundaliCurrentPhaseFallback(lang: string, lagnaStr: string, moonStr: string, dashaStr: string, bhuktiStr: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaStr} ಮಹಾದಶಾ ಹಾಗೂ ${bhuktiStr} ಭುಕ್ತಿ ಕಾಲಘಟ್ಟವು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಪ್ರಮುಖ ಬದಲಾವಣೆಗಳನ್ನು ಉಂಟುಮಾಡುತ್ತಿದೆ. ಗ್ರಹಗಳ ಪ್ರಚಲಿತ ಸಂಚಾರವು ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಜವಾಬ್ದಾರಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತಿದ್ದು, ಹೊಸ ಅವಕಾಶಗಳಿಗೆ ಹಾದಿ ಮಾಡಿಕೊಡುತ್ತಿದೆ.`;
  }
  return `Based on your birth Lagna (${lagnaStr}) and Moon sign (${moonStr}), your running ${dashaStr} Mahadasha and ${bhuktiStr} Bhukti activate significant developments in personal and professional spheres. Daily responsibilities expand while opening doors to long-term growth.`;
}

function enrichYogaDescription(name: string, impact: string, lang: string, lagnaStr: string = "Lagna", moonStr: string = "Moon Sign"): string {
  const cleanImpact = (impact || "").trim();
  if (cleanImpact.length >= 100) return cleanImpact;
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `${cleanImpact} ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗುರು, ಚಂದ್ರ ಹಾಗೂ ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಗ್ರಹಗಳ ಶುಭ ಸ್ಥಿತಿಯಿಂದ ಈ ಯೋಗವು ಸಿದ್ಧಿಸಿದೆ. ಇದರ ಸತ್ಪ್ರಭಾವದಿಂದ ಜೀವನದಲ್ಲಿ ಉನ್ನತ ಗೌರವ, ಕೀರ್ತಿ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳು ಪ್ರಾಪ್ತಿಯಾಗಲಿವೆ.`;
  }
  return `${cleanImpact} Auspicious planetary combinations activate this favorable Yoga, bestowing prosperity, wisdom, and success.`;
}

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
  const [urlPriestName, setUrlPriestName] = useState<string>("");

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
    let resolvedUser = currentUser || "priest_shreeram";
    let resolvedName = DEFAULT_PRIEST_NAME;

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      const nameParam = params.get("name");

      if (nameParam) {
        resolvedName = decodeURIComponent(nameParam);
        setUrlPriestName(resolvedName);
        localStorage.setItem("baggona_priest_name", resolvedName);
      } else if (localStorage.getItem("baggona_priest_name")) {
        resolvedName = localStorage.getItem("baggona_priest_name")!;
        setUrlPriestName(resolvedName);
      }

      if (userParam) {
        resolvedUser = userParam;
        localStorage.setItem("baggona_priest_id", userParam);
      } else if (localStorage.getItem("baggona_priest_id")) {
        resolvedUser = localStorage.getItem("baggona_priest_id")!;
      }

      if (params.get("reset") === "true" || params.get("firstTime") === "true") {
        setShowPasswordSetup(true);
      }
    }

    void initWallet(resolvedUser, resolvedName);

    // 5-Second Welcome Toast Timer
    const timer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser, initWallet]);

  const activePriestDisplayName = urlPriestName || wallet?.priestName || (typeof window !== "undefined" ? localStorage.getItem("baggona_priest_name") : null) || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
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

  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const ayanamsaModel = useAppStore((state) => state.ayanamsaModel);

  // Generate Kundli Handler with 250 Coin Deduction & Auto-Refund Guard
  const handleGenerateKundli = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = SERVICE_COIN_COSTS.KUNDLI_CALCULATION.coins; // 250 Coins (₹25)

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಕುಂಡಲಿ ರಚನೆಗೆ ೨೫೦ ನಾಣ್ಯಗಳು (₹೨೫) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsCalculatingKundli(true);
    setFeedback(null);

    // 1. Deduct 250 Coins
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
        text: `ಶ್ರೀ ${devoteeName || "ಭಕ್ತರ"} ಜನನ ಕುಂಡಲಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೨೫೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)`
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
    } catch (err: any) {
      console.error("[PriestMobilePortal] Kundli calc error:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        action: "ಜನನ ಕುಂಡಲಿ ರಚನೆ (Janana Kundli Calculation)",
        attemptedCoins: 250,
        errorMessage: err?.message || "Kundli calculation runtime failure"
      });
      setFeedback({
        type: "error",
        text: "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೨೫೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingKundli(false);
    }
  };

  // PDF Export States & References
  const [pdfLanguage, setPdfLanguage] = useState<string>("kn");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [premiumDataForPdf, setPremiumDataForPdf] = useState<PremiumData | null>(null);
  const [premiumPdfTranslations, setPremiumPdfTranslations] = useState<PdfTranslations | null>(null);
  const [premiumPdfDeepInsights, setPremiumPdfDeepInsights] = useState<Record<string, string> | null>(null);
  const premiumPdfRef = useRef<HTMLDivElement>(null);

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

  const kundliSession = useMemo<KundliViewerSession | null>(() => {
    if (!kundliResult) return null;
    return {
      input: {
        name: devoteeName || "ಭಕ್ತರು",
        birthDate,
        birthTime,
        gender: "male",
        latitude,
        longitude,
        ayanamsa: "lahiri"
      },
      birthDateYmd: birthDate,
      birthTimeHm: birthTime,
      homePlaceName: placeName,
      placeLabel: placeName,
      result: kundliResult,
      dasha: dashaBhuktiInfo ? ({
        birthDasha: dashaBhuktiInfo.birthDasha,
        currentDasha: dashaBhuktiInfo.runningDasha
      } as any) : null,
      dailyPrediction: null
    } as unknown as KundliViewerSession;
  }, [kundliResult, devoteeName, birthDate, birthTime, latitude, longitude, placeName, dashaBhuktiInfo]);

  // Handle Full Baggona Bhavishya GenAI Premium PDF Download with 3,500 Coin Deduction & Auto-Refund Guard
  const handleDownloadPremiumPdf = async () => {
    if (!kundliResult) {
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮೊದಲು ಭಕ್ತರ ಜನನ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ."
      });
      return;
    }

    const cost = SERVICE_COIN_COSTS.PREMIUM_KUNDLI_PDF?.coins || 3500; // 3,500 Coins / ₹350
    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಪ್ರೀಮಿಯಂ ಜಾತಕ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ೩,೫೦೦ ನಾಣ್ಯಗಳು (₹೩೫೦) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ನಿಮ್ಮಲ್ಲಿ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsGeneratingPdf(true);
    setFeedback(null);

    // 1. Deduct 3,500 Coins
    const deductRes = await deductForService(cost, "ಪ್ರೀಮಿಯಂ ಜಾತಕ ಕುಂಡಲಿ ಭವಿಷ್ಯ PDF ಡೌನ್‌ಲೋಡ್", devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsGeneratingPdf(false);
      return;
    }

    try {
      const lang = pdfLanguage;
      const runId = newRunId();
      const moonPlanet = kundliResult.planets.find((p: PlanetPosition) => p.name === "Moon");
      const now = new Date();
      const ageYears = ageDecimalYearsAt(
        birthDate,
        birthTime,
        latitude,
        longitude,
        now
      );
      const currentBhuktiData = findBhuktiAtAge(kundliResult, ageYears);
      const mahaLord = currentBhuktiData ? toGraha(currentBhuktiData.maha.planet) : null;
      const bhuktiLord = currentBhuktiData ? toGraha(currentBhuktiData.bhukti) : null;
      const panchanga = calculateTraditionalBaggona(birthDate, birthTime, latitude, longitude);

      const ashirvadaSource = `Chief Priest ${activePriestDisplayName} of Sri Kshetra Gokarna conveys sacred blessings: Under the grace of Lord Mahabaleshwara, may your life be filled with longevity, peace, harmony, and complete success.`;

      const translatedData: PdfTranslations = {
        title: tp("title", lang),
        subtitle: tp("subtitle", lang),
        nameLabel: tp("nameLabel", lang),
        nameValue: devoteeName || "ಭಕ್ತರು",
        dobLabel: tp("dobLabel", lang),
        dobValue: formatBirthLine(lang, birthDate, birthTime),
        lagnaLabel: tp("lagnaLabel", lang),
        lagnaValue: kundliResult.lagnaRashi ? pick(RASHI_L5[kundliResult.lagnaRashi.index], lang) : "",
        moonLabel: tp("moonLabel", lang),
        moonValue: pick(RASHI_L5[kundliResult.moonSign.index], lang),
        nakshatraLabel: tp("nakshatraLabel", lang),
        nakshatraValue: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
        eraLabel: tp("eraLabel", lang),
        dashaLabel: tp("dashaLabel", lang),
        bhuktiLabel: tp("bhuktiLabel", lang),
        dashaPlanetValue: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
        bhuktiPlanetValue: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "",
        ashirvadaTitle: tp("ashirvadaTitle", lang),
        ashirvadaValue: await translateText(ashirvadaSource, lang),
        footer: tp("footer", lang),
        yogasTitle: tp("yogasTitle", lang),
        doshasTitle: tp("doshasTitle", lang),
        remedyTitle: tp("remedyTitle", lang),
        characteristicsTitle: tp("characteristicsTitle", lang),
        darkSecretTitle: tp("darkSecretTitle", lang),
        timelineTitle: tp("timelineTitle", lang),
        gocharaTitle: tp("gocharaTitle", lang),
        summaryTitle: tp("summaryTitle", lang),
        introTitle: tp("introTitle", lang),
        introGreeting: greetingLine(lang, devoteeName || "ಭಕ್ತರು"),
        introPrepared: buildComprehensiveIntro(lang, {
          name: devoteeName || "ಭಕ್ತರು",
          lagna: kundliResult.lagnaRashi ? pick(RASHI_L5[kundliResult.lagnaRashi.index], lang) : "",
          moonSign: pick(RASHI_L5[kundliResult.moonSign.index], lang),
          nakshatra: moonPlanet ? pick(NAKSHATRA_L5[moonPlanet.nakshatra.index], lang) : "",
          birthWeekday: pick(WEEKDAY_L5[panchanga.weekdayIndex], lang),
          birthDateFormatted: formatBirthLine(lang, birthDate, birthTime).split(",")[0],
          birthTime: birthTime,
          mahaLord: mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "",
          bhuktiLord: bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : ""
        }),
        introRunning: mahaLord && bhuktiLord ? runningPeriodSentence(lang, mahaLord, bhuktiLord) : "",
        introBegin: tp("introBegin", lang),
      };

      setPremiumPdfTranslations(translatedData);

      // Execute Master Prediction Engine
      const result = await generateMasterPrediction(kundliResult, {
        name: devoteeName || "ಭಕ್ತರು",
        birthDate,
        birthTime,
        latitude,
        longitude,
        lang
      });

      const parseGeminiJSON = (text: string) => {
        try {
          const match = text.match(/\{[\s\S]*\}/);
          return match ? JSON.parse(match[0]) : {};
        } catch {
          return {};
        }
      };

      const affairResult = detectAffairIndicators(kundliResult);
      const affairNote = (affairResult.hasAffairIndicators && affairResult.confidence !== "low")
        ? `The chart carries ${affairResult.confidence}-confidence classical indicators of hidden romantic complexity (${affairResult.indicators.slice(0, 2).join("; ")}). Give this one short paragraph, framed as a karmic soul-pattern in dignified language. Never judgemental.`
        : `This chart shows no confirmed indicator of a secret relationship. Do not raise the subject at all.`;

      const liveTransits = getTransitsForDate(kundliResult.moonSign.index, now, ayanamsaModel);
      const transits: TransitPlacement[] = Object.entries(liveTransits).map(([planet, pos]) => ({
        graha: toGraha(planet),
        rashiIndex: pos.rashiIndex,
        houseFromMoon: pos.house
      }));

      const natalPlanets: NatalPlacement[] = kundliResult.planets.map(p => ({
        graha: toGraha(p.name),
        rashiIndex: p.rashi.index,
        house: p.house,
        retrograde: p.isRetrograde,
        debilitated: p.isDebilitated,
        exalted: p.isExalted
      }));

      const prompts = buildPremiumPrompts({
        lang,
        runId,
        name: devoteeName || "ಭಕ್ತರು",
        gender: "Male",
        ageYears,
        lagnaRashiIndex: kundliResult.lagnaRashi?.index ?? null,
        moonRashiIndex: kundliResult.moonSign.index,
        moonNakshatraIndex: moonPlanet?.nakshatra.index ?? null,
        sunRashiIndex: kundliResult.sunSign?.index ?? null,
        natalPlanets,
        transits,
        mahaLord,
        bhuktiLord,
        bhuktiEndsAtAge: currentBhuktiData?.bhuktiEndAge ?? null,
        engineYogas: result.aiGeneratedNarrative?.yogas ?? [],
        engineDoshas: result.aiGeneratedNarrative?.doshas ?? [],
        pariharas: (result.pariharas ?? []).map(
          p => `${p.doshaName}: ${p.poojaName} (${p.whenToDo}, ${p.whereToDo})`
        ),
        shadowSelf: result.natalLayer.shadowSelf.bluntTruth,
        karmicBaggage: result.natalLayer.karmicBaggage.soulPurpose,
        lifePhase: result.timingLayer.lifeClock.currentPhase,
        overallTone: stripJayashreeIntro(result.masterSynthesis.overallTone),
        careerNote: result.masterSynthesis.career,
        financeNote: result.masterSynthesis.finance,
        roadmap: result.timingLayer.twelveMonthRoadmap,
        affairNote
      });

      const safeAsk = async (label: string, prompt: string, temp = 0.3) => {
        try {
          const raw = await askGemini(label, prompt, geminiApiKey, lang, { raw: true, temperature: temp });
          if (typeof raw === "string" && (raw.includes("Sorry, I encountered an error") || raw.includes("check your API key") || raw.includes("Error"))) {
            return "";
          }
          return raw;
        } catch {
          return "";
        }
      };

      const [resCharacteristics, resDarkSecret, resCurrentPhase, resYogas, resDoshas] = await Promise.all([
        safeAsk("Generate Characteristics", prompts.characteristics, 0.3),
        safeAsk("Generate Dark Secret", prompts.darkSecret, 0.3),
        safeAsk("Generate Current Phase", prompts.currentPhase, 0.3),
        safeAsk("Generate Premium Yogas", prompts.yogas, 0.4),
        safeAsk("Generate Premium Doshas", prompts.doshas, 0.4),
      ]);

      const [resTimeline, resGochara, resSummary] = await Promise.all([
        safeAsk("Generate Timeline", prompts.timeline, 0.4),
        safeAsk("Generate Gochara", prompts.gochara, 0.4),
        safeAsk("Generate Summary", prompts.summary, 0.3),
      ]);

      const dataCharacteristics = parseGeminiJSON(resCharacteristics);
      const dataDarkSecret = parseGeminiJSON(resDarkSecret);
      const dataCurrentPhase = parseGeminiJSON(resCurrentPhase);
      const dataYogas = parseGeminiJSON(resYogas);
      const dataDoshas = parseGeminiJSON(resDoshas);
      const dataTimeline = parseGeminiJSON(resTimeline);
      const dataGochara = parseGeminiJSON(resGochara);
      const dataSummary = parseGeminiJSON(resSummary);

      const lagnaStr = kundliResult.lagnaRashi ? pick(RASHI_L5[kundliResult.lagnaRashi.index], lang) : "";
      const moonStr = pick(RASHI_L5[kundliResult.moonSign.index], lang);
      const dashaName = mahaLord ? pick(GRAHA_L5[mahaLord], lang) : "Dasha";
      const bhuktiName = bhuktiLord ? pick(GRAHA_L5[bhuktiLord], lang) : "Bhukti";

      const charFallbackText = buildKundaliCharacteristicsFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName);
      const secretFallbackText = buildKundaliDarkSecretFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName);
      const currentPhaseFallbackText = buildKundaliCurrentPhaseFallback(lang, lagnaStr, moonStr, dashaName, bhuktiName);
      const rawSummaryFallback = stripJayashreeIntro(`${result.masterSynthesis.overallTone || 'A balanced planetary outlook for the future.'}\n\n${result.masterSynthesis.career || ''}\n\n${result.masterSynthesis.finance || ''}`);

      const finalCharacteristics = await ensureValidSection(dataCharacteristics.characteristics, charFallbackText, lang);
      const finalDarkSecret = await ensureValidSection(dataDarkSecret.darkSecret, secretFallbackText, lang);
      const finalCurrentPhase = await ensureValidSection(dataCurrentPhase.currentPhase, currentPhaseFallbackText, lang);
      const finalSummary = await ensureValidSection(dataSummary.summary, rawSummaryFallback, lang);

      const rawYogasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.yogas || [{ name: "Dasha Yoga", significance: stripJayashreeIntro(result.masterSynthesis.overallTone) }]).map(async y => ({
          name: await translateText(y.name, lang),
          impact: await translateText(stripJayashreeIntro(asText(y.significance) || result.masterSynthesis.overallTone), lang)
        }))
      );
      const rawYogasArray = toSafeArray(dataYogas.yogas).filter((y: any) => (y?.impact || "").trim().length > 10).length > 0
        ? dataYogas.yogas
        : rawYogasFallback;

      const finalYogas = (rawYogasArray || []).map((y: any) => ({
        ...y,
        impact: enrichYogaDescription(y.name || y.trait || "", y.impact || "", lang, lagnaStr, moonStr)
      }));

      const rawDoshasFallback = await Promise.all(
        (result.aiGeneratedNarrative?.doshas || [{ name: "Karmic Challenge", significance: result.natalLayer.karmicBaggage.description, remedy: result.natalLayer.karmicBaggage.soulPurpose }]).map(async d => ({
          name: await translateText(d.name, lang),
          impact: await translateText(asText(d.significance) || result.natalLayer.karmicBaggage.description, lang),
          remedy: await translateText(d.remedy || result.natalLayer.karmicBaggage.soulPurpose, lang)
        }))
      );
      const finalDoshas = toSafeArray(dataDoshas.doshas).filter((d: any) => (d?.impact || "").trim().length > 10).length > 0
        ? dataDoshas.doshas
        : rawDoshasFallback;

      const engineRoadmap6 = result.timingLayer.twelveMonthRoadmap.slice(0, 6);
      const fallbackTimeline = await Promise.all(
        engineRoadmap6.map(async r => ({
          dateRange: await translateText(r.month, lang),
          impact: await translateText(r.prediction, lang)
        }))
      );

      const validTimelineItems = toSafeArray(dataTimeline.timeline).filter((t: any) => (t?.impact || "").trim().length > 10);
      const finalTimeline = validTimelineItems.length >= 4
        ? await Promise.all(
          validTimelineItems.map(async (t: any) => ({
            ...t,
            dateRange: await translateText(t.dateRange || "", lang)
          }))
        )
        : fallbackTimeline;

      const rawGocharaFallback = await Promise.all([
        {
          name: await translateText(result.timingLayer.lifeClock.currentPhase || "Current Transit Phase", lang),
          impact: await translateText(result.timingLayer.lifeClock.description || result.masterSynthesis.overallTone, lang),
          remedy: await translateText(result.timingLayer.lifeClock.emotionalValidation || "", lang)
        }
      ]);
      const finalGochara = toSafeArray(dataGochara.gochara).filter((g: any) => (g?.impact || "").trim().length > 10).length > 0
        ? dataGochara.gochara
        : rawGocharaFallback;

      const premiumDataPayload: PremiumData = {
        characteristics: finalCharacteristics,
        darkSecret: finalDarkSecret,
        currentPhase: finalCurrentPhase,
        yogas: finalYogas,
        doshas: finalDoshas,
        timeline: finalTimeline,
        gochara: finalGochara,
        summary: finalSummary
      };

      setPremiumDataForPdf(premiumDataPayload);

      // Wait for React to flush state to hidden PdfTemplate
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!premiumPdfRef.current) throw new Error("Premium PDF template ref not found");

      const containerEl = premiumPdfRef.current;
      const parentEl = containerEl.parentElement;
      const originalStyle = parentEl?.getAttribute("style") || "";
      if (parentEl) {
        parentEl.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: -9999; pointer-events: none; opacity: 1; visibility: visible; width: 900px; background-color: #FFFFFF;");
      }

      await (document as any).fonts?.ready;
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#FFFFFF",
        allowTaint: true
      });

      if (parentEl) {
        parentEl.setAttribute("style", originalStyle);
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.75);
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight], compress: true });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const langNames: Record<string, string> = { kn: "Kannada", ta: "Tamil", te: "Telugu", hi: "Hindi", en: "English" };
      const langName = langNames[lang] || "Kannada";
      const safeName = (devoteeName || "bhaktaru").trim().replace(/\s+/g, "_");
      pdf.save(`Baggona_Panchanga_Prediction_${langName}_${safeName}.pdf`);

      setFeedback({
        type: "success",
        text: "ಪ್ರೀಮಿಯಂ ಜಾತಕ ಭವಿಷ್ಯ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ. (೩,೫೦೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)"
      });
    } catch (err: any) {
      console.error("[PriestMobilePortal] Premium PDF download failed:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        action: `ಪ್ರೀಮಿಯಂ ಜಾತಕ PDF ಡೌನ್‌ಲೋಡ್ (${pdfLanguage})`,
        attemptedCoins: 3500,
        errorMessage: err?.message || "PDF generation runtime failure"
      });
      setFeedback({
        type: "error",
        text: "ಪಿಡಿಎಫ್ ರಚನೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೩,೫೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsGeneratingPdf(false);
      setPremiumDataForPdf(null);
    }
  };

  // Handle Astrological Question Consultation with 750 Coin Deduction & Auto-Refund Guard
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

    const cost = SERVICE_COIN_COSTS.ASTROLOGY_QUESTION.coins; // 750 Coins (₹75)
    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಗೆ ೭೫೦ ನಾಣ್ಯಗಳು (₹೭೫) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsConsulting(true);
    setFeedback(null);

    // 1. Deduct 750 Coins
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
        text: "ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನಾ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೭೫೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)"
      });
    } catch (err: any) {
      console.error("[PriestMobilePortal] Consultation error:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        action: `ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ (${selectedCategoryKey})`,
        attemptedCoins: 750,
        errorMessage: err?.message || "Consultation engine runtime failure"
      });
      setFeedback({
        type: "error",
        text: "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೭೫೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
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
                🙏 ನಮಸ್ಕಾರ {activePriestDisplayName} ಅವರೇ • ಪುರೋಹಿತ ಕೇಂದ್ರ
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
                ದರ: 🪙 ೨೫೦ (₹೨೫)
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
                    <span className="opacity-80 font-mono font-bold">(🪙 ೨೫೦)</span>
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

              {/* Premium PDF Download Card with Language Selection */}
              <div className="bg-[#FFFDF7] border-2 border-amber-400/90 rounded-3xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄✨</span>
                    <div>
                      <h3 className="text-xs font-black text-amber-950">
                        ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ PDF (Bhavishya GenAI)
                      </h3>
                      <p className="text-[10px] text-amber-700 font-semibold">
                        ಸಂಪೂರ್ಣ AI ಮಾಸ್ಟರ್ ಭವಿಷ್ಯ, ಯೋಗ, ದೋಷ ಮತ್ತು ೧೨ ತಿಂಗಳ ಮಾರ್ಗಸೂಚಿ
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                    🪙 ೩,೫೦೦ (₹೩೫೦)
                  </span>
                </div>

                {/* PDF Language Radio Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-amber-900 block">
                    🌐 ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ (Select PDF Language):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
                      { code: "en", name: "English" },
                      { code: "hi", name: "हिन्दी (Hindi)" },
                      { code: "te", name: "తెలుగు (Telugu)" },
                      { code: "ta", name: "தமிழ் (Tamil)" }
                    ].map((lang) => (
                      <label
                        key={lang.code}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                          pdfLanguage === lang.code
                            ? "bg-amber-100/90 border-amber-500 text-amber-950 font-black shadow-sm"
                            : "bg-[#FEFCF4] border-amber-200 text-slate-700 font-semibold hover:border-amber-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pdfLanguage"
                          value={lang.code}
                          checked={pdfLanguage === lang.code}
                          onChange={() => setPdfLanguage(lang.code)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs">{lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Premium Bhavishya Blue/Indigo Button Matching Baggona Bhavishya */}
                <button
                  type="button"
                  onClick={handleDownloadPremiumPdf}
                  disabled={isGeneratingPdf}
                  className={`w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 border-2 border-indigo-400 flex items-center justify-center gap-2 transition-all ${
                    isGeneratingPdf ? "opacity-75 cursor-wait" : "hover:scale-[1.01]"
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>ಪ್ರೀಮಿಯಂ PDF ರಚಿಸಲಾಗುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">📄✨</span>
                      <span>ಪ್ರೀಮಿಯಂ PDF (Premium PDF • 🪙 ೩,೫೦೦ / ₹೩೫೦)</span>
                    </>
                  )}
                </button>
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
                ದರ: 🪙 ೭೫೦ (₹೭೫)
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
                <span className="font-mono font-bold text-amber-900">🪙 ೨೫೦ (₹೨೫)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಪ್ರೀಮಿಯಂ ಜಾತಕ ಭವಿಷ್ಯ PDF ಡೌನ್‌ಲೋಡ್</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೩,೫೦೦ (₹೩೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">ಪ್ರತಿ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ (೪ ಪ್ಯಾರಾಗ್ರಾಫ್)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೭೫೦ (₹೭೫)</span>
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

      {/* Hidden PDF Container Conforming to baggona-pdf-layout-guard */}
      <div
        style={{
          position: "fixed",
          left: "0px",
          top: "0px",
          width: "900px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1000,
          overflow: "hidden",
          height: 0
        }}
      >
        {premiumDataForPdf && premiumPdfTranslations && kundliSession && (
          <PdfTemplate
            ref={premiumPdfRef}
            theme="sunrise"
            session={kundliSession}
            predictions={[]}
            translations={premiumPdfTranslations}
            deepInsights={premiumPdfDeepInsights || {}}
            premiumData={premiumDataForPdf}
          />
        )}
      </div>
    </div>
  );
};
