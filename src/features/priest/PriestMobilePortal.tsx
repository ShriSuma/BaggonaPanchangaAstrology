import React, { useState, useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
import { useWalletStore } from "../wallet/walletStore";
import { useAuthStore, SUPER_ADMIN_USERNAMES } from "../auth/authStore";
import { useAppStore } from "../../stores/appStore";
import {
  SERVICE_COIN_COSTS,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  DEFAULT_PRIEST_NAME,
  RECHARGE_PACKAGES
} from "../wallet/walletTypes";
import { usePricingConfigStore } from "../wallet/pricingConfigStore";
import { calculateKundliWithPlaceSun } from "../../core/KundliEngine";
import { type KundliOutput, type PlanetPosition } from "../../core/AstroTypes";
import {
  PRIEST_CONSULTATION_CATEGORIES,
  generatePriestConsultationReading,
  type PriestConsultationResult
} from "./priestQuestionEngine";
import { SpeechRecognitionSession } from "../../utils/speechRecognitionHelper";
import SouthIndianChart from "../../components/kundli/SouthIndianChart";
import TraditionalSouthPatrika from "../../components/kundli/TraditionalSouthPatrika";
import { saveKundliToFirestore, updateUserPassword, logPremiumPdfDownload, isPriestAccountActive, isPriestFirstTimeSetupDone, getUserProfile } from "../../db/firestoreDb";
import { hashPassword } from "../auth/authStore";
import { notifyPasswordResetCompleted, notifySystemFailureAlert, notifyPremiumPdfDownloaded } from "../notifications/notificationService";
import { calculateTraditionalBaggona } from "../../core/TraditionalBaggonaEngine";
import { translateText } from "../../utils/translator";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { PdfTemplate, type PdfTranslations, type PremiumData } from "../../components/RamanBhavishya/PdfTemplate";
import { GokarnaKundaliTemplate } from "../../components/template/GokarnaKundaliTemplate";
import { DashaPdfTemplate } from "../../components/kundli/DashaPdfTemplate";
import { FallingCoinsRefillModal } from "../../components/wallet/FallingCoinsRefillModal";
import { CoinDeductionModal } from "../../components/wallet/CoinDeductionModal";
import { VahanaKharidiMuhurthaTab } from "../../components/muhurtha/VahanaKharidiMuhurthaTab";
import { SankhyaShastraPriestPortal } from "./SankhyaShastraPriestPortal";
import { DivyaKaalaDiksuchiPage } from "../../pages/DivyaKaalaDiksuchiPage";
import { HindinaJanmaPage } from "../../pages/HindinaJanmaPage";
import type { AvailableModuleKey } from "../wallet/walletTypes";
import { exportPanchangaWithDashaPdf, exportElementAsPdf } from "../../core/ExportUtils";
import { patrikaMetaForNakshatraIndex } from "../../core/nakshatraPatrikaMeta";
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

export type PriestTab =
  | "kundli"
  | "questions"
  | "sankhyashastra"
  | "diksuchi"
  | "purva_janma"
  | "vahana_muhurtha"
  | "wallet";

const PRIEST_KUNDLI_STORAGE_KEY = "baggona_priest_kundli_active_session";

function loadSavedPriestKundliState(): any {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PRIEST_KUNDLI_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

  const { getCoins } = usePricingConfigStore();
  const kundliCost = getCoins("KUNDLI_CALCULATION", 500);
  const stdPdfCost = getCoins("STANDARD_JANANA_KUNDLI_PDF", 1000);
  const premPdfCost = getCoins("PREMIUM_KUNDLI_PDF", 3500);
  const questionCost = getCoins("ASTROLOGY_QUESTION", 500);

  const { currentUser, role } = useAuthStore();
  const isSuperAdmin =
    role === "superadmin" ||
    (currentUser && SUPER_ADMIN_USERNAMES.some((u) => u.toLowerCase() === currentUser.toLowerCase() || u === currentUser));
  const [urlPriestName, setUrlPriestName] = useState<string>("");

  // Allowed modules resolution: URL param "modules" takes precedence, then wallet.allowedModules, then portal query param
  const allowedModules = useMemo<AvailableModuleKey[]>((): AvailableModuleKey[] => {
    if (typeof window === "undefined") return ["panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"];
    const params = new URLSearchParams(window.location.search);
    const modulesParam = params.get("modules");
    if (modulesParam) {
      const parsed: AvailableModuleKey[] = modulesParam
        .split(",")
        .map((m) => m.trim().toLowerCase())
        .filter((m): m is AvailableModuleKey => ["panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"].includes(m as any));
      if (parsed.length > 0) return parsed;
    }
    if (wallet?.allowedModules && wallet.allowedModules.length > 0) {
      return wallet.allowedModules.filter((m): m is AvailableModuleKey =>
        ["panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"].includes(m as any)
      );
    }
    const portal = params.get("portal")?.toLowerCase();
    if (portal === "sankhyashastra" || portal === "sankhya") return ["sankhyashastra"];
    if (portal === "diksuchi") return ["diksuchi"];
    if (portal === "purva_janma" || portal === "hindinajanma") return ["purva_janma"];
    if (portal === "vahana_muhurtha" || portal === "vahanamuhurtha") return ["vahana_muhurtha"];
    if (portal === "panchanga") return ["panchanga"];
    return ["panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"];
  }, [wallet?.allowedModules]);

  const visibleTabs = useMemo(() => {
    const tabs: Array<{ id: PriestTab; label: string; icon: string }> = [];
    if (allowedModules.includes("panchanga")) {
      tabs.push({ id: "kundli", label: "ಜನನ ಕುಂಡಲಿ", icon: "🔮" });
      tabs.push({ id: "questions", label: "ಪ್ರಶ್ನೋತ್ತರ", icon: "💬" });
    }
    if (allowedModules.includes("sankhyashastra")) {
      tabs.push({ id: "sankhyashastra", label: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ", icon: "🔢" });
    }
    if (allowedModules.includes("diksuchi")) {
      tabs.push({ id: "diksuchi", label: "ಕಾಲ ದಿಕ್ಸೂಚಿ", icon: "🧭" });
    }
    if (allowedModules.includes("purva_janma")) {
      tabs.push({ id: "purva_janma", label: "ಹಿಂದಿನ ಜನ್ಮ", icon: "📜" });
    }
    if (allowedModules.includes("vahana_muhurtha")) {
      tabs.push({ id: "vahana_muhurtha", label: "ವಾಹನ ಮುಹೂರ್ತ", icon: "🚗" });
    }
    // Always include Wallet tab
    tabs.push({ id: "wallet", label: "ವಾಲೆಟ್", icon: "🪙" });
    return tabs;
  }, [allowedModules]);

  // Load Saved Session from localStorage (Anti-Reset Guard for Refresh / Mobile Disconnects)
  const savedSession = useMemo(() => loadSavedPriestKundliState(), []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<PriestTab>(() => {
    if (savedSession?.activeTab) return savedSession.activeTab;
    return "kundli";
  });

  // Synchronize activeTab with visibleTabs if activeTab is not allowed
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  // Pre-Action Coin Deduction Confirmation Modal State
  const [pendingDeduction, setPendingDeduction] = useState<{
    isOpen: boolean;
    serviceTitle: string;
    serviceTitleKannada: string;
    costCoins: number;
    inrEquivalent: number;
    devoteeName: string;
    description: string;
    icon?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

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

  // Form State (Janana Kundli) - Restored from localStorage if available
  const [devoteeName, setDevoteeName] = useState(() => savedSession?.devoteeName || "");
  const [gothra, setGothra] = useState(() => savedSession?.gothra || "ಕಾಶ್ಯಪ");
  const [birthDate, setBirthDate] = useState(() => savedSession?.birthDate || new Date().toISOString().split("T")[0]);
  const [birthTime, setBirthTime] = useState(() => savedSession?.birthTime || "12:00");
  const [placeName, setPlaceName] = useState(() => savedSession?.placeName || "ಗೋಕರ್ಣ");
  const [latitude, setLatitude] = useState(() => savedSession?.latitude ?? 14.54);
  const [longitude, setLongitude] = useState(() => savedSession?.longitude ?? 74.31);
  const [chartStyle, setChartStyle] = useState<"south" | "north">(() => savedSession?.chartStyle || "south");
  const [pdfLanguage, setPdfLanguage] = useState<string>(() => savedSession?.pdfLanguage || "kn");

  // Generated Kundli Data
  const [kundliResult, setKundliResult] = useState<KundliOutput | null>(() => savedSession?.kundliResult || null);
  const [isCalculatingKundli, setIsCalculatingKundli] = useState(false);

  // Standard Janana Kundli PDF Options & States (1,000 Coins / ₹100)
  const [selectedJananaPdfOption, setSelectedJananaPdfOption] = useState<"kundli_with_dasha" | "kundli_only">(
    () => savedSession?.selectedJananaPdfOption || "kundli_with_dasha"
  );
  const [isGeneratingJananaPdf, setIsGeneratingJananaPdf] = useState(false);
  const [jananaDynamicValues, setJananaDynamicValues] = useState<Record<string, string>>({});
  const traditionalExportRef = useRef<HTMLDivElement>(null);
  const dashaExportRef = useRef<HTMLDivElement>(null);

  // Question / Consultation State & Subsequent History
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(() => savedSession?.selectedCategoryKey || "maduve");
  const [customQuestion, setCustomQuestion] = useState(() => savedSession?.customQuestion || "");
  const [consultationResult, setConsultationResult] = useState<PriestConsultationResult | null>(() => savedSession?.consultationResult || null);
  const [consultationHistory, setConsultationHistory] = useState<PriestConsultationResult[]>(() => savedSession?.consultationHistory || []);
  const [isConsulting, setIsConsulting] = useState(false);

  // Voice Recognition States
  const [isListeningFor, setIsListeningFor] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Recharge Modal State
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [upiUtrInput, setUpiUtrInput] = useState("");
  const [rechargeQrUrl, setRechargeQrUrl] = useState<string>("");
  const [rechargeFeedback, setRechargeFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

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

  // Global UI Feedback / Alert
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-Save State to localStorage so mobile refresh / network drop preserves everything
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stateToSave = {
        devoteeName,
        gothra,
        birthDate,
        birthTime,
        placeName,
        latitude,
        longitude,
        chartStyle,
        pdfLanguage,
        activeTab,
        kundliResult,
        selectedJananaPdfOption,
        selectedCategoryKey,
        customQuestion,
        consultationResult,
        consultationHistory
      };
      localStorage.setItem(PRIEST_KUNDLI_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn("[PriestMobilePortal] Failed to persist state to localStorage:", err);
    }
  }, [
    devoteeName,
    gothra,
    birthDate,
    birthTime,
    placeName,
    latitude,
    longitude,
    chartStyle,
    pdfLanguage,
    activeTab,
    kundliResult,
    selectedJananaPdfOption,
    selectedCategoryKey,
    customQuestion,
    consultationResult,
    consultationHistory
  ]);

  // Reset / Clear Form & Session (Only erases on explicit Priest Reset click)
  const handleResetKundli = () => {
    try {
      localStorage.removeItem(PRIEST_KUNDLI_STORAGE_KEY);
    } catch {}
    setDevoteeName("");
    setGothra("ಕಾಶ್ಯಪ");
    setBirthDate(new Date().toISOString().split("T")[0]);
    setBirthTime("12:00");
    setPlaceName("ಗೋಕರ್ಣ");
    setLatitude(14.54);
    setLongitude(74.31);
    setKundliResult(null);
    setConsultationResult(null);
    setCustomQuestion("");
    setActiveTab("kundli");
    setFeedback({
      type: "success",
      text: "ಜಾತಕ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಿಸೆಟ್ ಮಾಡಲಾಗಿದೆ. ನೀವು ಹೊಸ ಜಾತಕವನ್ನು ರಚಿಸಬಹುದು (Reset successful)."
    });
  };

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

    }

    const isResetOrFirstTime = typeof window !== "undefined" && (new URLSearchParams(window.location.search).get("reset") === "true" || new URLSearchParams(window.location.search).get("firstTime") === "true");

    const checkActive = async () => {
      const isSuper =
        role === "superadmin" ||
        SUPER_ADMIN_USERNAMES.some(
          (u) => u.toLowerCase() === resolvedUser.toLowerCase() || u === resolvedUser
        );

      if (isSuper) {
        setIsAccessRevoked(false);
        // If super admin is accessing without an explicit priest user param, link to master priest account
        const hasExplicitPriestParam =
          typeof window !== "undefined" && Boolean(new URLSearchParams(window.location.search).get("user"));
        const targetPriestUser = hasExplicitPriestParam ? resolvedUser : "priest_shreeram";
        const targetPriestName = hasExplicitPriestParam ? resolvedName : "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪ್ರಧಾನ ಪುರೋಹಿತರು)";

        void initWallet(targetPriestUser, targetPriestName);

        try {
          const prof = await getUserProfile(targetPriestUser);
          if (prof?.email) setPriestEmail(prof.email);
          if (prof?.phone || prof?.mobileNumber) setPriestPhone(prof.phone || prof.mobileNumber || "");
        } catch (err) {
          console.warn("[PriestMobilePortal] Error preloading profile:", err);
        }
        return;
      }

      const active = await isPriestAccountActive(resolvedUser);
      if (!active) {
        setIsAccessRevoked(true);
        if (typeof window !== "undefined") {
          localStorage.removeItem("baggona_priest_id");
          localStorage.removeItem("baggona_priest_name");
        }
        return;
      }
      setIsAccessRevoked(false);
      void initWallet(resolvedUser, resolvedName);

      // Pre-load existing email & phone from user profile if available
      try {
        const prof = await getUserProfile(resolvedUser);
        if (prof?.email) setPriestEmail(prof.email);
        if (prof?.phone || prof?.mobileNumber) setPriestPhone(prof.phone || prof.mobileNumber || "");
      } catch (err) {
        console.warn("[PriestMobilePortal] Error preloading profile:", err);
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

    // 5-Second Welcome Toast Timer
    const timer = setTimeout(() => {
      setShowWelcomeToast(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser, initWallet]);

  const activePriestDisplayName = urlPriestName || wallet?.priestName || (typeof window !== "undefined" ? localStorage.getItem("baggona_priest_name") : null) || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const coinBalance = wallet?.coinBalance ?? 0;

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

  // Generate Kundli Handler with 500 Coin (₹50) Deduction & Pre-Action Confirmation Modal
  const handleGenerateKundli = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = kundliCost;

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಕುಂಡಲಿ ರಚನೆಗೆ ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setPendingDeduction({
      isOpen: true,
      serviceTitle: "Detailed Birth Kundli Generation",
      serviceTitleKannada: "ಜನನ ಕುಂಡಲಿ & ಗ್ರಹಸ್ಥಿತಿ ರಚನೆ",
      costCoins: cost,
      inrEquivalent: 50,
      devoteeName: devoteeName || "ಭಕ್ತರು",
      description: `ಶ್ರೀ ${devoteeName || "ಭಕ್ತರ"} (${placeName || "ಗೋಕರ್ಣ"}) ಜನನ ಕುಂಡಲಿ, ನವಗ್ರಹ ಸ್ಪಷ್ಟ, ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಯೋಗಗಳ ಗಣನೆ.`,
      icon: "🔮",
      onConfirm: async () => {
        await executeKundliGeneration(cost);
      }
    });
  };

  const executeKundliGeneration = async (cost: number) => {
    setIsCalculatingKundli(true);
    setFeedback(null);

    // 1. Deduct 500 Coins
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
        birthTime: birthTime || "12:00",
        place: placeName || "ಗೋಕರ್ಣ",
        latitude,
        longitude,
        timezone: 5.5,
        gothra: gothra || "ಕಾಶ್ಯಪ"
      };

      const output = await calculateKundliWithPlaceSun(birthPayload, {
        ayanamsaModel: ayanamsaModel || "lahiri",
        nodeType: "true"
      });
      setKundliResult(output);
      setFeedback({
        type: "success",
        text: `ಶ್ರೀ ${devoteeName || "ಭಕ್ತರ"} ಜನನ ಕುಂಡಲಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೫೦೦ ನಾಣ್ಯಗಳು / ₹೫೦ ಕಡಿತಗೊಂಡಿವೆ)`
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
        attemptedCoins: cost,
        errorMessage: err?.message || "Kundli calculation runtime failure"
      });
      setFeedback({
        type: "error",
        text: "ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೫೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsCalculatingKundli(false);
    }
  };

  // PDF Export States & References
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

  // Date and Traditional Panchanga computation for Janana Kundli PDF
  const birthDateObj = useMemo(() => {
    if (!birthDate) return new Date();
    const [y, m, d] = birthDate.split("-").map(Number);
    return new Date(y || 2026, (m || 1) - 1, d || 1, 12, 0, 0, 0);
  }, [birthDate]);

  const traditionalData = useMemo(() => {
    if (!kundliResult) return null;
    return calculateTraditionalBaggona(birthDate, birthTime || "12:00", latitude, longitude);
  }, [kundliResult, birthDate, birthTime, latitude, longitude]);

  const isDayBirthComputed = useMemo(() => {
    if (!birthTime) return true;
    const [hh, mm] = (birthTime || "12:00").split(":").map(Number);
    const birthMins = (hh || 12) * 60 + (mm || 0);
    let sunriseMins = 360; // 06:00
    let sunsetMins = 1080; // 18:00
    if (traditionalData?.sunrise && traditionalData.sunrise.includes(":")) {
      const [sh, sm] = traditionalData.sunrise.split(":").map(Number);
      if (!isNaN(sh) && !isNaN(sm)) sunriseMins = sh * 60 + sm;
    }
    if (traditionalData?.sunset && traditionalData.sunset.includes(":")) {
      const [sh, sm] = traditionalData.sunset.split(":").map(Number);
      if (!isNaN(sh) && !isNaN(sm)) sunsetMins = sh * 60 + sm;
    }
    return birthMins >= sunriseMins && birthMins < sunsetMins;
  }, [birthTime, traditionalData?.sunrise, traditionalData?.sunset]);

  // Handle Standard Baggona Panchanga Janana Kundli PDF Download (1,000 Coins / ₹100)
  const handleDownloadJananaKundliPdf = async () => {
    if (!kundliResult) {
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮೊದಲು ಭಕ್ತರ ಜನನ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ."
      });
      return;
    }

    const cost = stdPdfCost;
    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ೧,೦೦೦ ನಾಣ್ಯಗಳು ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ನಿಮ್ಮಲ್ಲಿ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setIsGeneratingJananaPdf(true);
    setFeedback(null);

    // 1. Deduct 1,000 Coins
    const deductRes = await deductForService(cost, "ಬಗ್ಗೋಣ ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್", devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsGeneratingJananaPdf(false);
      return;
    }

    try {
      // Non-Kannada localized terms
      const newVals: Record<string, string> = {};
      if (pdfLanguage !== "kn" && traditionalData) {
        const yoniMeta = patrikaMetaForNakshatraIndex(kundliResult.planets.find((p: any) => p.name === "Moon")?.nakshatra.index || 0);
        const keys = [
          "samvatsara", "masa", "paksha", "tithi", "weekday", "sunNakshatra", "moonNakshatra", "yoga", "karana", "sankrantiSign",
          "yoni", "gana", "nadi", "label_yoni", "label_gana", "label_nadi", "label_footer"
        ];
        const texts = [
          traditionalData.samvatsaraKn, traditionalData.masaKn, traditionalData.pakshaKn, traditionalData.tithiKn, traditionalData.weekdayKn, 
          traditionalData.sunNakshatraKn, traditionalData.moonNakshatraKn, traditionalData.yogaKn, traditionalData.karanaKn, traditionalData.sankrantiSignKn,
          yoniMeta.yoniKn, yoniMeta.ganaKn, yoniMeta.nadiKn, "ಯೋನಿ", "ಗಣ", "ನಾಡಿ", "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರು"
        ];
        const targetLocale = pdfLanguage === "en" ? "en-US" : `${pdfLanguage}-IN`;
        const translated = await Promise.all(texts.map((txt) => translateText(txt, targetLocale)));
        keys.forEach((k, i) => (newVals[k] = translated[i]));
      }
      setJananaDynamicValues(newVals);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const traditionalEl = traditionalExportRef.current;
      const dashaEl = dashaExportRef.current;
      const safeName = (devoteeName || "bhaktaru").trim().replace(/\s+/g, "_");
      const baseFileName = `Baggona_Janana_Kundali_${safeName}`;

      if (!traditionalEl) throw new Error("Traditional Kundali template ref not found");

      if (selectedJananaPdfOption === "kundli_with_dasha" && dashaEl) {
        await exportPanchangaWithDashaPdf(traditionalEl, dashaEl, baseFileName);
      } else {
        await exportElementAsPdf(traditionalEl, baseFileName);
      }

      // Log download to Firestore for 11:30 PM report
      void logPremiumPdfDownload({
        devoteeName: devoteeName || "ಭಕ್ತರು",
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        portalSource: "Priest Mobile Portal",
        language: pdfLanguage,
        coinsSpent: cost,
        amountInr: Math.round(cost / 10),
        timestamp: new Date().toISOString(),
        dateKey: new Date().toISOString().split("T")[0]
      });

      void notifyPremiumPdfDownloaded({
        clientName: devoteeName || "ಭಕ್ತರು",
        pdfType: `Baggona Janana Kundli PDF (${selectedJananaPdfOption === "kundli_with_dasha" ? "Kundli + Dasha" : "Kundli Only"})`,
        language: pdfLanguage,
        pageCount: selectedJananaPdfOption === "kundli_with_dasha" ? 2 : 1,
        priestName: activePriestDisplayName
      });

      setFeedback({
        type: "success",
        text: "ಬಗ್ಗೋಣ ಜನನ ಕುಂಡಲಿ PDF ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ. (೧,೦೦೦ ನಾಣ್ಯಗಳು ಕಡಿತಗೊಂಡಿವೆ)"
      });
    } catch (err: any) {
      console.error("[PriestMobilePortal] Janana Kundli PDF download failed:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        action: `ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್ (${selectedJananaPdfOption})`,
        attemptedCoins: cost,
        errorMessage: err?.message || "Janana Kundli PDF generation failure"
      });
      setFeedback({
        type: "error",
        text: "ಜನನ ಕುಂಡಲಿ PDF ರಚನೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ೧,೦೦೦ ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ."
      });
    } finally {
      setIsGeneratingJananaPdf(false);
    }
  };

  // Handle Full Baggona Bhavishya GenAI Premium PDF Download with 3,500 Coin Deduction & Auto-Refund Guard
  const handleDownloadPremiumPdf = async () => {
    if (!kundliResult) {
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮೊದಲು ಭಕ್ತರ ಜನನ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ."
      });
      return;
    }

    const cost = premPdfCost;
    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಪ್ರೀಮಿಯಂ ಜಾತಕ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ೩,೫೦೦ ನಾಣ್ಯಗಳು ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ನಿಮ್ಮಲ್ಲಿ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
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

      // 1. Log to Firestore for 11:30 PM Tri/Quad Report Dispatcher
      void logPremiumPdfDownload({
        devoteeName: devoteeName || "ಭಕ್ತರು",
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        portalSource: "Priest Mobile Portal",
        language: lang,
        coinsSpent: cost,
        amountInr: Math.round(cost / 10),
        timestamp: new Date().toISOString(),
        dateKey: new Date().toISOString().split("T")[0]
      });

      // 2. Transactional email alert to Super Admin
      void notifyPremiumPdfDownloaded({
        clientName: devoteeName || "ಭಕ್ತರು",
        pdfType: "Baggona Bhavishya GenAI Premium PDF",
        language: lang,
        pageCount: 1,
        priestName: activePriestDisplayName
      });

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

  // Handle Astrological Question Consultation with 500 Coin (₹50) Deduction & Pre-Action Confirmation Modal
  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kundliResult) {
      setFeedback({
        type: "error",
        text: "ದಯವಿಟ್ಟು ಮೊದಲು 'ಜನನ ಕುಂಡಲಿ' ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಭಕ್ತರ ಕುಂಡಲಿಯನ್ನು ರಚಿಸಿ."
      });
      setActiveTab("kundli");
      return;
    }

    const cost = questionCost;

    if (coinBalance < cost) {
      setFeedback({
        type: "error",
        text: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ. ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಗೆ ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦) ಅಗತ್ಯವಿದೆ. ಪ್ರಸ್ತುತ ${coinBalance} ನಾಣ್ಯಗಳಿವೆ.`
      });
      setIsRechargeOpen(true);
      return;
    }

    setPendingDeduction({
      isOpen: true,
      serviceTitle: "Astrology Question & Consultation",
      serviceTitleKannada: "ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ",
      costCoins: cost,
      inrEquivalent: 50,
      devoteeName: devoteeName || "ಭಕ್ತರು",
      description: `ವರ್ಗ: ${selectedCategoryKey} | ಪ್ರಶ್ನೆ: "${customQuestion.trim() || "ಸಾಮಾನ್ಯ ಜೀವನ ಮಾರ್ಗದರ್ಶನ"}"`,
      icon: "💬",
      onConfirm: async () => {
        await executeConsultation(cost);
      }
    });
  };

  const executeConsultation = async (cost: number) => {
    setIsConsulting(true);
    setFeedback(null);

    // 1. Deduct 500 Coins
    const deductRes = await deductForService(cost, `ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನೆ: ${selectedCategoryKey}`, devoteeName || "ಭಕ್ತರು");
    if (!deductRes.success) {
      setFeedback({ type: "error", text: deductRes.error || "ನಾಣ್ಯ ಕಡಿತ ವಿಫಲವಾಗಿದೆ." });
      setIsConsulting(false);
      return;
    }

    try {
      const res = await generatePriestConsultationReading({
        kundli: kundliResult!,
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
        text: `ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನಾ ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. (೫೦೦ ನಾಣ್ಯಗಳು / ₹೫೦ ಕಡಿತಗೊಂಡಿವೆ)`
      });
    } catch (err: any) {
      console.error("[PriestMobilePortal] Consultation error:", err);
      // Auto-Refund Guard
      await refundCoins(cost, "ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆ ದೋಷ");
      void notifySystemFailureAlert({
        username: wallet?.userId || currentUser || "priest",
        priestName: activePriestDisplayName,
        action: `ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ (${selectedCategoryKey})`,
        attemptedCoins: cost,
        errorMessage: err?.message || "Consultation engine runtime failure"
      });
      setFeedback({
        type: "error",
        text: `ಪ್ರಶ್ನೆ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಉಂಟಾಗಿದೆ. ಕಡಿತಗೊಂಡ ${cost} ನಾಣ್ಯಗಳನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ಮರುಪಾವತಿಸಲಾಗಿದೆ.`
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

  // Handle Password Reset / Setup (4 Mandatory Fields: Email, Mobile, Password, Confirm Password)
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
      const uid = currentUser || (typeof window !== "undefined" ? localStorage.getItem("baggona_priest_id") : null) || "priest_shreeram";
      
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
            ಈ ಪುರೋಹಿತರ ಪ್ರವೇಶ ಲಿಂಕ್ ಅಥವಾ ಖಾತೆಯನ್ನು ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Super Admin) ರದ್ದುಗೊಳಿಸಿದ್ದಾರೆ / ಅಳಿಸಿದ್ದಾರೆ. ಈ ಲಿಂಕ್ ಇನ್ನು ಮುಂದೆ ಮಾನ್ಯವಾಗಿರುವುದಿಲ್ಲ.
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

      {/* Super Admin Master Oversight Notice Bar */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 text-amber-300 border-b border-amber-500/40 px-3 sm:px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-base">🛡️</span>
            <span>
              ಪ್ರಧಾನ ಆಡಳಿತ ವೀಕ್ಷಣೆ (Super Admin Master Oversight) • ಪುರೋಹಿತ ಖಾತೆ:{" "}
              <span className="text-white font-black">{activePriestDisplayName}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => useAppStore.getState().setPage("superadmindashboard")}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] transition cursor-pointer shadow flex items-center gap-1"
          >
            <span>🛡️ Super Admin Control Center</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* 1. Royal Brand Header Bar (Golden-White Dual-Tier Mobile-First Theme) */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/98 backdrop-blur-md border-b-2 border-amber-400/80 shadow-md">
        {/* Top Brand & Actions Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: Brand Icon + Title in Guaranteed Single Line */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 text-base sm:text-xl font-bold shadow-md shadow-amber-500/20 border border-amber-400 shrink-0">
              🕉️
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-950 tracking-tight leading-none">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
              </h1>
              <span className="hidden xs:inline-block px-1.5 py-0.5 bg-amber-200/90 border border-amber-400 rounded-md text-[9px] font-black text-amber-950 font-mono">
                v1.0
              </span>
            </div>
          </div>

          {/* Right: Reset Action & Coin Balance Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Priest Reset Action Button (Anti-Reset Guard: State is only wiped on explicit Priest click) */}
            <button
              type="button"
              onClick={handleResetKundli}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-100/90 hover:bg-amber-200 border border-amber-400 text-amber-950 font-bold text-[10px] sm:text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap"
              title="ಹೊಸ ಜಾತಕ ನಮೂದಿಸಲು ರಿಸೆಟ್ ಮಾಡಿ"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">ಹೊಸ ಜಾತಕ</span>
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
            <span className="hidden sm:inline-block text-[10px] text-amber-800 font-semibold">• ಅಧಿಕೃತ ಜ್ಯೋತಿಷಿ</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-amber-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="hidden xs:inline text-emerald-800 font-black">ಲೈವ್</span>
            <span className="bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-400 font-mono text-[9px]">
              {activeTab === "kundli" ? "ಜನನ ಕುಂಡಲಿ" : activeTab === "questions" ? "ಪ್ರಶ್ನೋತ್ತರ" : "ವಾಲೆಟ್"}
            </span>
          </div>
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

      {/* 2. Mobile Tab Switcher (Royal Cream & Gold - Dynamic Multi-Module Support) */}
      <div className="px-3 sm:px-4 mt-3.5">
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#FFFDF7] border-2 border-amber-400/60 rounded-2xl shadow-sm">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[95px] py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md font-black ring-1 ring-amber-500"
                    : "text-amber-900 hover:bg-amber-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pre-Action Coin Deduction Confirmation Modal */}
      {pendingDeduction && (
        <CoinDeductionModal
          isOpen={pendingDeduction.isOpen}
          serviceTitle={pendingDeduction.serviceTitle}
          serviceTitleKannada={pendingDeduction.serviceTitleKannada}
          costCoins={pendingDeduction.costCoins}
          inrEquivalent={pendingDeduction.inrEquivalent}
          devoteeName={pendingDeduction.devoteeName}
          description={pendingDeduction.description}
          icon={pendingDeduction.icon || "🪙"}
          onConfirm={pendingDeduction.onConfirm}
          onCancel={() => setPendingDeduction(null)}
          onClose={() => setPendingDeduction(null)}
          onOpenRefill={() => {
            setPendingDeduction(null);
            setIsRechargeOpen(true);
          }}
        />
      )}

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
                ದರ: 🪙 ೨೫೦ ನಾಣ್ಯಗಳು
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
                  <div className="flex items-center gap-2">
                    <span>ಪ್ರಮುಖ ೫ ಪಂಚಾಂಗ ವಿವರಗಳು</span>
                    <span className="text-amber-950 font-mono font-bold">({devoteeName} - {gothra})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetKundli}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-sm active:scale-95"
                    title="ಹೊಸ ಜಾತಕ ರಚಿಸಲು ಎಲ್ಲವನ್ನು ರಿಸೆಟ್ ಮಾಡಿ"
                  >
                    <span>🔄</span>
                    <span>ಹೊಸ ಜಾತಕ (Reset)</span>
                  </button>
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
                    <span className="text-[10px] text-amber-800 block font-bold">🧘 ನಿತ್ಯ ಯೋಗ</span>
                    <span className="font-bold text-amber-950">
                      {traditionalData?.yoga || (kundliResult as any).yoga?.sanskrit || "ಶುಭ"}
                    </span>
                  </div>

                  {/* Karana */}
                  <div className="p-3 rounded-2xl bg-[#FEFCF4] border-2 border-amber-300">
                    <span className="text-[10px] text-amber-800 block font-bold">⚡ ಕರಣ</span>
                    <span className="font-bold text-amber-950">
                      {traditionalData?.karana || (kundliResult as any).karana?.sanskrit || "ಬವ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vimshottari Dasha-Bhukti Timeline Card */}
              {dashaBhuktiInfo && (
                <div className="bg-[#FFFDF7] border-2 border-amber-400/80 rounded-3xl p-5 shadow-md space-y-3">
                  <div className="border-b border-amber-200 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-black text-amber-950 flex items-center gap-2">
                      <span>⏳</span>
                      <span>ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ವಿವರಗಳು (Dasha Timeline)</span>
                    </h3>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      ಸಕ್ರಿಯ ದಶೆ
                    </span>
                  </div>

                  {dashaBhuktiInfo.isSandhiPeriod && (
                    <div className="p-2.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 text-[11px] font-bold">
                      {dashaBhuktiInfo.sandhiAlertText}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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

              {/* Authentic Royal South Indian Janana Kundali Patrika (100% Pure Kannada - Exact PDF Replica) */}
              <div className="bg-[#FFFDF7] border-2 border-amber-400/90 rounded-3xl p-3 sm:p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📜✨</span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-amber-950">
                        ದಕ್ಷಿಣ ಭಾರತೀಯ ಸಾಂಪ್ರದಾಯಿಕ ಜನನ ಕುಂಡಲಿ ಪತ್ರಿಕೆ (South Indian Patrika)
                      </h3>
                      <p className="text-[10px] text-amber-800 font-semibold">
                        ೧೦೦% ಶುದ್ಧ ಕನ್ನಡ • ಲಗ್ನ, ಮಾಂದಿ, ನವಾಂಶ ಅಂಶಕ & ಪಂಚಾಂಗ ವಿವರಗಳು
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    PDF ಹೋಲಿಕೆ (Exact Replica)
                  </span>
                </div>

                <div className="overflow-x-auto flex justify-center p-1 sm:p-2 bg-[#FEFCF4] rounded-2xl border-2 border-amber-300 shadow-inner">
                  <TraditionalSouthPatrika
                    kundli={kundliResult}
                    personName={devoteeName || "ಭಕ್ತರು"}
                    gothra={gothra || "ಕಾಶ್ಯಪ"}
                    birthDate={birthDate}
                    birthTime={birthTime || "12:00"}
                    latitude={latitude}
                    longitude={longitude}
                    placeLabel={placeName || "ಗೋಕರ್ಣ"}
                    ayanamsaModel={ayanamsaModel || "lahiri"}
                  />
                </div>
              </div>

              {/* Baggona Panchanga Janana Kundli PDF Download Card with Radio Options (1,000 Coins / ₹100) */}
              <div className="bg-[#FFFDF7] border-2 border-amber-400/90 rounded-3xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📜✨</span>
                    <div>
                      <h3 className="text-xs font-black text-amber-950">
                        ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ PDF (Janana Kundli)
                      </h3>
                      <p className="text-[10px] text-amber-700 font-semibold">
                        ದಶಾ-ಭುಕ್ತಿ ವಿವರಗಳು ಹಾಗೂ ಸಾಂಪ್ರದಾಯಿಕ ಪಂಚಾಂಗ ಜಾತಕ ಪತ್ರಿಕೆ
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black text-amber-900 bg-[#FFF5D6] px-2.5 py-1 rounded-full border border-amber-400">
                    🪙 ೧,೦೦೦ ನಾಣ್ಯಗಳು
                  </span>
                </div>

                {/* PDF Content Choice Radio Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-amber-900 block">
                    📑 PDF ಮಾದರಿ ಆಯ್ಕೆಮಾಡಿ (Select PDF Option):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedJananaPdfOption === "kundli_with_dasha"
                          ? "bg-amber-100/90 border-amber-500 text-amber-950 font-black shadow-sm"
                          : "bg-[#FEFCF4] border-amber-200 text-slate-700 font-semibold hover:border-amber-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jananaPdfOption"
                        value="kundli_with_dasha"
                        checked={selectedJananaPdfOption === "kundli_with_dasha"}
                        onChange={() => setSelectedJananaPdfOption("kundli_with_dasha")}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">ಜನನ ಕುಂಡಲಿ + ದಶಾ ಭುಕ್ತಿ ಪತ್ರಿಕೆ</div>
                        <div className="text-[10px] text-amber-800 font-medium">ಸಂಪೂರ್ಣ ೨-ಪುಟಗಳ ವಿಸ್ತೃತ ಪತ್ರಿಕೆ</div>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedJananaPdfOption === "kundli_only"
                          ? "bg-amber-100/90 border-amber-500 text-amber-950 font-black shadow-sm"
                          : "bg-[#FEFCF4] border-amber-200 text-slate-700 font-semibold hover:border-amber-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jananaPdfOption"
                        value="kundli_only"
                        checked={selectedJananaPdfOption === "kundli_only"}
                        onChange={() => setSelectedJananaPdfOption("kundli_only")}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">ಜನನ ಕುಂಡಲಿ ಮಾತ್ರ (Single Page)</div>
                        <div className="text-[10px] text-amber-800 font-medium">ಮುಖ್ಯ ಜಾತಕ ನಕ್ಷೆ & ೫ ಪಂಚಾಂಗ ವಿವರಗಳು</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Janana Kundli PDF Gold Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadJananaKundliPdf}
                  disabled={isGeneratingJananaPdf}
                  className={`w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 border-2 border-amber-400 flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                    isGeneratingJananaPdf ? "opacity-75 cursor-wait" : "hover:scale-[1.01]"
                  }`}
                >
                  {isGeneratingJananaPdf ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>ಜನನ ಕುಂಡಲಿ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">📜</span>
                      <span>ಜನನ ಕುಂಡಲಿ PDF (Janana Kundli PDF • 🪙 ೧,೦೦೦)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Premium Bhavishya GenAI PDF Download Card with Language Selection */}
              <div className="bg-[#FFFDF7] border-2 border-indigo-400/90 rounded-3xl p-5 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄✨</span>
                    <div>
                      <h3 className="text-xs font-black text-indigo-950">
                        ಪ್ರೀಮಿಯಂ ಭವಿಷ್ಯ PDF (Bhavishya GenAI)
                      </h3>
                      <p className="text-[10px] text-indigo-700 font-semibold">
                        ಸಂಪೂರ್ಣ AI ಮಾಸ್ಟರ್ ಭವಿಷ್ಯ, ಯೋಗ, ದೋಷ ಮತ್ತು ೧೨ ತಿಂಗಳ ಮಾರ್ಗಸೂಚಿ
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-black text-indigo-950 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-400">
                    🪙 ೩,೫೦೦ ನಾಣ್ಯಗಳು
                  </span>
                </div>

                {/* PDF Language Radio Selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-indigo-950 block">
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
                            ? "bg-indigo-100/90 border-indigo-500 text-indigo-950 font-black shadow-sm"
                            : "bg-[#FEFCF4] border-indigo-200 text-slate-700 font-semibold hover:border-indigo-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pdfLanguage"
                          value={lang.code}
                          checked={pdfLanguage === lang.code}
                          onChange={() => setPdfLanguage(lang.code)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
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
                  className={`w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 border-2 border-indigo-400 flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
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
                      <span>ಪ್ರೀಮಿಯಂ PDF (Premium PDF • 🪙 ೩,೫೦೦)</span>
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
                ದರ: 🪙 {selectedCategoryKey === "kaaladiksuchi" || selectedCategoryKey === "purvajanma" ? "೨೦೦" : "೭೫೦"} ನಾಣ್ಯಗಳು
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
                        {cat.nameKn} {cat.houseTarget ? `(${cat.houseTarget}ನೇ ಭಾವ)` : ""}
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
                      <span className="opacity-80 font-mono font-bold">
                        (🪙 {selectedCategoryKey === "kaaladiksuchi" || selectedCategoryKey === "purvajanma" ? "೨೦೦" : "೭೫೦"})
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Consultation Output Card */}
          {consultationResult && (
            <div className="bg-gradient-to-b from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400/90 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 text-slate-900 animate-in fade-in duration-300">
              {/* Ornate Royal Header */}
              <div className="border-b-2 border-amber-300/80 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider mb-1">
                    <span>🕉️</span>
                    <span>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನೋತ್ತರ ಸಮಾಲೋಚನೆ ॥</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950">
                    {consultationResult.categoryNameKn}
                  </h3>
                  <p className="text-xs text-amber-900 font-bold mt-0.5">
                    ಪ್ರಶ್ನೆ: <span className="text-slate-900 font-extrabold font-serif">"{consultationResult.questionText}"</span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 ${
                      consultationResult.hasDoshaOrAffliction
                        ? "bg-red-100 text-red-950 border-2 border-red-400"
                        : "bg-emerald-100 text-emerald-950 border-2 border-emerald-400"
                    }`}
                  >
                    {consultationResult.verdictTextKn}
                  </span>
                </div>
              </div>

              {/* Devotee Coordinates Ribbon */}
              <div className="p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-inner flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-amber-950">
                <div className="flex items-center gap-2">
                  <span className="text-amber-800">👤 ಜಾತಕ:</span>
                  <span className="font-extrabold">{consultationResult.devoteeName}</span>
                  <span className="text-slate-500">({consultationResult.gothra} ಗೋತ್ರ)</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-amber-900 font-semibold">
                  <span>{consultationResult.activeGrahasSummary}</span>
                </div>
              </div>

              {/* 5 Deep Technical Paragraphs (5-6+ lines each) */}
              <div className="space-y-3.5">
                {consultationResult.technicalParagraphs.map((para, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF7] border-2 border-amber-300/90 shadow-sm space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-xs">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-amber-950">
                        {para.titleKn}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-900 leading-relaxed sm:leading-loose whitespace-pre-line font-medium text-justify">
                      {para.contentKn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Baggona & Gokarna Sanjeevini Parihara Card */}
              {consultationResult.remedyListKn && consultationResult.remedyListKn.length > 0 && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-100 via-[#FFF9E6] to-orange-100 rounded-3xl border-2 border-amber-500 shadow-md space-y-3">
                  <div className="flex items-center gap-2 border-b border-amber-300 pb-2">
                    <span className="text-xl">🪔</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-950">
                        ಬಗ್ಗೋಣ & ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರದ ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರ ಮತ್ತು ಜಪಾನುಷ್ಠಾನ:
                      </h4>
                      <p className="text-[10px] text-amber-800 font-semibold">
                        ದೋಷ ಶಮನ ಹಾಗೂ ಕಾರ್ಯಸಿದ್ಧಿಗಾಗಿ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಸೇವೆಗಳು
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs sm:text-sm text-amber-950 font-bold pl-2">
                    {consultationResult.remedyListKn.map((rem, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">✦</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: 1-Click WhatsApp Share & Ask Another */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const parasText = consultationResult.technicalParagraphs
                      .map((p, i) => `*${i + 1}. ${p.titleKn}*\n${p.contentKn}`)
                      .join("\n\n");
                    const remediesText = consultationResult.remedyListKn
                      .map((r, i) => `• ${r}`)
                      .join("\n");
                    const message = encodeURIComponent(
                      `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥\n\n` +
                      `*ಶಾಸ್ತ್ರೀಯ ಸಮಾಲೋಚನಾ ವರದಿ*\n` +
                      `👤 ಭಕ್ತರ ಹೆಸರು: ${consultationResult.devoteeName} (${consultationResult.gothra} ಗೋತ್ರ)\n` +
                      `❓ ಪ್ರಶ್ನೆ: ${consultationResult.questionText}\n` +
                      `⚖️ ನಿರ್ಣಯ: ${consultationResult.verdictTextKn}\n\n` +
                      `${parasText}\n\n` +
                      `*🪔 ಶಾಸ್ತ್ರೀಯ ಪರಿಹಾರಗಳು:*\n${remediesText}\n\n` +
                      `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥\n` +
                      `ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - ಗೋಕರ್ಣ`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>📲</span>
                  <span>WhatsApp ಮೂಲಕ ಪೂರ್ಣ ವರದಿ ಕಳುಹಿಸಿ (Share on WhatsApp)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomQuestion("");
                    window.scrollTo({ top: 100, behavior: "smooth" });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 border border-amber-400 transition-all active:scale-95"
                >
                  <span>➕</span>
                  <span>ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ (Ask Another Question)</span>
                </button>
              </div>

              {/* Previous Questions Session History */}
              {consultationHistory.length > 1 && (
                <div className="pt-4 border-t-2 border-amber-200 space-y-2">
                  <h4 className="text-xs font-black text-amber-950 flex items-center justify-between">
                    <span>📜 ಈ ಅಧಿವೇಶನದ ಹಿಂದಿನ ಪ್ರಶ್ನೋತ್ತರಗಳು ({consultationHistory.length - 1})</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {consultationHistory.slice(1).map((hist, idx) => (
                      <div key={idx} className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-300 text-slate-800 space-y-1 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-950">{hist.categoryNameKn}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 font-bold border border-amber-300">{hist.verdictTextKn}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-medium">{hist.questionText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 3: ಸಂಖ್ಯಾಶಾಸ್ತ್ರ (Sankhya Shastra) */}
      {activeTab === "sankhyashastra" && (
        <div className="mt-2">
          <SankhyaShastraPriestPortal />
        </div>
      )}

      {/* 5. TAB 4: ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ (Divya Kaala Diksuchi) */}
      {activeTab === "diksuchi" && (
        <div className="px-2 sm:px-4 mt-2">
          <DivyaKaalaDiksuchiPage />
        </div>
      )}

      {/* 6. TAB 5: ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ (Hindina Janma) */}
      {activeTab === "purva_janma" && (
        <div className="px-2 sm:px-4 mt-2">
          <HindinaJanmaPage />
        </div>
      )}

      {/* 7. TAB 6: ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ (Vahana Kharidi Muhurtha) */}
      {activeTab === "vahana_muhurtha" && (
        <div className="px-2 sm:px-4 mt-2">
          <VahanaKharidiMuhurthaTab currentUser={currentUser || undefined} defaultPriestName={activePriestDisplayName || undefined} />
        </div>
      )}

      {/* 8. TAB 7: ವಾಲೆಟ್ & ಲೆಡ್ಜರ್ (Wallet & Refill) */}
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
            <h3 className="font-black text-amber-950">📊 ಸೇವಾ ಶುಲ್ಕ ದರಪಟ್ಟಿ (Service Rates - ₹1 = 10 ನಾಣ್ಯಗಳು):</h3>
            <div className="divide-y divide-amber-200 font-semibold">
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">🔮 ಜನನ ಕುಂಡಲಿ ರಚನೆ (Full Kundli Chart)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">💬 ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆ ಸಮಾಲೋಚನೆ (Astrology Consultation)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ & ಹೆಸರು/ಸಂಖ್ಯೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">🧭 ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ ವಿಶ್ಲೇಷಣೆ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">📜 ಹಿಂದಿನ ಜನ್ಮ ಕರ್ಮ ರಹಸ್ಯ</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">🚗 ವಾಹನ ಖರೀದಿ ಶುಭ ಮುಹೂರ್ತ (Vehicle Purchase)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೫೦೦ ನಾಣ್ಯಗಳು (₹೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">📑 ಪ್ರೀಮಿಯಂ ಜಾತಕ ಭವಿಷ್ಯ PDF (Baggona Bhavishya)</span>
                <span className="font-mono font-bold text-amber-900">🪙 ೩,೫೦೦ ನಾಣ್ಯಗಳು (₹೩೫೦)</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-800">🌅 ದೈನಂದಿನ ಪಂಚಾಂಗ ದರ್ಶನ</span>
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

      {/* 6. Coin Refill Modal with Dropping Coins Animation */}
      <FallingCoinsRefillModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        requiredCoins={250}
      />

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

            <form onSubmit={handlePasswordSetupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಇಮೇಲ್ ವಿಳಾಸ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">✉️</span>
                  <input
                    type="email"
                    value={priestEmail}
                    onChange={(e) => setPriestEmail(e.target.value)}
                    placeholder="priest@gmail.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5 font-medium">ಅಧಿಸೂಚನೆಗಳು ಹಾಗೂ ಖಾತೆ ಪುನಃಸ್ಥಾಪನೆಗೆ ಕಡ್ಡಾಯ</p>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಮೊಬೈಲ್ ಸಂಖ್ಯೆ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">📱</span>
                  <input
                    type="tel"
                    value={priestPhone}
                    onChange={(e) => setPriestPhone(e.target.value)}
                    placeholder="9108135387 (೧೦ ಅಂಕಿಗಳು)"
                    maxLength={10}
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-amber-800 mt-0.5 font-medium">೧೦ ಅಂಕಿಗಳ ಅಧಿಕೃತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</p>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔑</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-950 font-bold mb-1">
                  ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ <span className="text-red-600 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🛡️</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ಮತ್ತೊಮ್ಮೆ ನಮೂದಿಸಿ"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
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

      {/* Hidden Traditional Baggona Panchanga Janana Kundali & Dasha Container Conforming to baggona-pdf-layout-guard */}
      {kundliResult && (
        <div
          style={{
            position: "fixed",
            left: "0px",
            top: "0px",
            width: "794px",
            opacity: 0,
            pointerEvents: "none",
            zIndex: -1000,
            overflow: "hidden",
            height: 0
          }}
        >
          <div ref={traditionalExportRef} style={{ width: "794px", minHeight: "1123px", backgroundColor: "#fbf8f1" }}>
            <GokarnaKundaliTemplate
              kundli={kundliResult}
              personName={devoteeName || "ಭಕ್ತರು"}
              parentsName=""
              birthDateObj={birthDateObj}
              birthTimeStr={birthTime}
              isDayBirth={isDayBirthComputed}
              panchanga={traditionalData}
              gothra={gothra || "ಕಾಶ್ಯಪ"}
              pdfLanguage={pdfLanguage}
              dynamicValues={jananaDynamicValues}
            />
          </div>
          {kundliSession && (
            <div ref={dashaExportRef} style={{ width: "794px", backgroundColor: "#ffffff" }}>
              <DashaPdfTemplate session={kundliSession} maxAge={120} pdfLanguage={pdfLanguage} />
            </div>
          )}
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
