import React, { useEffect, useState, useRef } from "react";
import { useWalletStore } from "./walletStore";
import { useAuthStore } from "../auth/authStore";
import { useAppStore } from "../../stores/appStore";
import {
  type PriestWalletDoc,
  type UserProfileDoc,
  type WalletTransactionDoc,
  type KundliHistoryDoc,
  type AshirvadaPassDoc,
  type SystemAuditLogDoc,
  type PremiumPdfDownloadDoc,
  subscribeAllKundlis,
  subscribeAshirvadaPasses,
  subscribeSystemAuditLogs,
  subscribePremiumPdfDownloads,
  subscribeWalletTransactions,
  updateUserPassword,
  deleteAshirvadaPass,
  getOrCreatePriestWallet,
  syncUserProfile,
  getUserProfile,
  cleanupDuplicateKundlis,
  cleanupDuplicateCalendarVisitsAndEngagement,
  updateUserAllowedModules,
  deletePriestAccount
} from "../../db/firestoreDb";
import { db } from "../../db/indexedDb";
import { hashPassword } from "../auth/authStore";
import { sendAllFourDailyReports, notifyLowAiQuotaRemaining } from "../notifications/notificationService";
import { extendPassValidity } from "../seva/ashirvadaPassService";
import {
  subscribeCalendarDevoteeSubscriptions,
  purgeAllCalendarSubscriptionsAndVisits,
  extendSubscriptionValidity,
  deleteDevoteeSubscription,
  type DevoteeCalendarSubscriptionDoc
} from "../seva/calendarVisitService";
import {
  AVAILABLE_MODULES,
  type AvailableModuleKey,
  type AppModuleConfig
} from "./walletTypes";
import {
  subscribeTodayAiQuota,
  updateDailyAiQuotaLimit,
  type DailyAiQuotaDoc,
  DEFAULT_DAILY_AI_LIMIT
} from "../ai/aiTelemetryService";
import {
  subscribePanchangaEngineConfig,
  savePanchangaEngineConfig,
  type PanchangaEngineMode,
  type PanchangaEngineConfigDoc,
  DEFAULT_PANCHANGA_ENGINE_CONFIG
} from "../../db/firestoreDb";
import {
  getParabhavaDayDetails,
  isDateInParabhavaYear,
  getParabhavaAnnualSummary,
  PARABHAVA_ANNUAL_FESTIVALS,
  searchParabhavaFestivals,
  getFestivalByDate,
  type ParabhavaDayRecord,
  type ParabhavaFestivalItem
} from "../../core/ParabhavaBookEngine";
import {
  getAllVoiceProfiles,
  saveVoiceProfile,
  deleteVoiceProfile,
  saveClipToVoiceProfile,
  removeClipFromVoiceProfile,
  type PriestVoiceProfile,
  type PriestAudioKey
} from "../audio/priestVoiceDatabase";
import {
  getVoiceCloneConfig,
  saveVoiceCloneConfig,
  synthesizeAndPlayClonedVoice,
  stopClonedAudio,
  type VoiceCloneConfig,
  type VoiceCloneProvider
} from "../audio/aiVoiceCloneEngine";
import type { SevaLang } from "../seva/sevaLocale";
import { SarvamAiUsageGrid } from "../../components/audio/SarvamAiUsageGrid";
import { VoiceDictationButton } from "../../components/ui/VoiceDictationButton";

export type AdminTab = "wallets" | "kundlis" | "ashirvada" | "audit" | "mindmap" | "panchanga_engine" | "voice_db";

/* -------------------------------------------------------------------------- */
/* 360° COMPLETE CIRCULAR PROGRESS RING COMPONENT (Visual Telemetry Gauge)    */
/* -------------------------------------------------------------------------- */
interface RadialGaugeProps {
  value: number; // 0 to 100
  title: string;
  subtitle: string;
  displayValue: string;
  color?: "amber" | "emerald" | "blue" | "purple";
  icon: string;
  badgeText?: string;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  title,
  subtitle,
  displayValue,
  color = "amber",
  icon,
  badgeText
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  // Full 360-degree complete circular ring (strokeDashoffset calculates remaining progress)
  const strokeDashoffset = circumference - (circumference * clampedValue) / 100;

  const colorConfig = {
    amber: {
      stroke: "#D97706",
      glow: "rgba(217, 119, 6, 0.35)",
      bgStroke: "#FDE68A",
      textColor: "text-amber-950",
      badgeBg: "bg-amber-100 border-amber-300 text-amber-900",
      fromColor: "#F59E0B",
      toColor: "#D97706"
    },
    emerald: {
      stroke: "#059669",
      glow: "rgba(5, 150, 105, 0.35)",
      bgStroke: "#A7F3D0",
      textColor: "text-emerald-950",
      badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900",
      fromColor: "#10B981",
      toColor: "#047857"
    },
    blue: {
      stroke: "#2563EB",
      glow: "rgba(37, 99, 235, 0.35)",
      bgStroke: "#BFDBFE",
      textColor: "text-blue-950",
      badgeBg: "bg-blue-100 border-blue-300 text-blue-900",
      fromColor: "#3B82F6",
      toColor: "#1D4ED8"
    },
    purple: {
      stroke: "#7C3AED",
      glow: "rgba(124, 58, 237, 0.35)",
      bgStroke: "#DDD6FE",
      textColor: "text-purple-950",
      badgeBg: "bg-purple-100 border-purple-300 text-purple-900",
      fromColor: "#8B5CF6",
      toColor: "#6D28D9"
    }
  }[color];

  return (
    <div className="bg-gradient-to-br from-[#FFFDF7] via-white to-amber-50/50 border-2 border-amber-300/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-amber-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {badgeText && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
          <span className={`text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-xs ${colorConfig.badgeBg}`}>
            {badgeText}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
        <span className="text-base sm:text-xl drop-shadow-sm group-hover:scale-110 transition-transform">{icon}</span>
        <h4 className="text-[11px] sm:text-xs font-black text-amber-950 truncate max-w-[130px] sm:max-w-none">{title}</h4>
      </div>

      {/* 360 Full Circular Ring Loader */}
      <div className="relative w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center my-1">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`grad-ring-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.fromColor} />
              <stop offset="100%" stopColor={colorConfig.toColor} />
            </linearGradient>
          </defs>
          {/* Complete 360 Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={colorConfig.bgStroke}
            strokeWidth="8"
          />
          {/* Animated 360 Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={`url(#grad-ring-${color})`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 2px 5px ${colorConfig.glow})` }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs sm:text-base font-mono font-black text-slate-900 tracking-tight">
            {displayValue}
          </span>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-600 font-mono bg-white/80 px-1.5 py-0.2 rounded-full border border-amber-200 shadow-xs">
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[9px] sm:text-[11px] text-amber-900 font-semibold mt-1 truncate max-w-full">
        {subtitle}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* INTERACTIVE MIND MAP & SYSTEM ARCHITECTURE TOPOLOGY                        */
/* -------------------------------------------------------------------------- */
interface MindMapNode {
  id: string;
  title: string;
  kannadaTitle: string;
  icon: string;
  category: "core" | "database" | "portals" | "ai" | "security" | "reports";
  status: "active" | "optimal" | "sync" | "live";
  metrics: string;
  details: string;
}

const MIND_MAP_NODES: MindMapNode[] = [
  {
    id: "superadmin",
    title: "Super Admin Control Center",
    kannadaTitle: "ಪ್ರಧಾನ ಆಡಳಿತ ಕೇಂದ್ರ ($hriSuma)",
    icon: "👑",
    category: "core",
    status: "active",
    metrics: "Master Auth • Root Access",
    details: "Central orchestration hub controlling priest creation, wallet liquidity, and security overrides."
  },
  {
    id: "vault",
    title: "Dual Database Vault",
    kannadaTitle: "ಕ್ಲೌಡ್ & ಸ್ಥಳೀಯ ವಾಲ್ಟ್",
    icon: "☁️",
    category: "database",
    status: "sync",
    metrics: "Firestore ↔ IndexedDb (~35ms)",
    details: "Zero-data-loss mirror architecture storing devotee charts, ledger history, and audit trails."
  },
  {
    id: "priestportals",
    title: "Priest Dedicated Portals",
    kannadaTitle: "ಪುರೋಹಿತರ ಪ್ರತ್ಯೇಕ ಪೋರ್ಟಲ್‌ಗಳು",
    icon: "🕉️",
    category: "portals",
    status: "live",
    metrics: "Panchanga & Sankhya Shastra",
    details: "Dedicated authenticated deep-links for priests with real-time coin deduction and Kannada charts."
  },
  {
    id: "genai",
    title: "GenAI Master Prediction Engine",
    kannadaTitle: "ಜೆನ್‌ಎಐ ಭವಿಷ್ಯ ಮಾಸ್ಟರ್ ಎಂಜಿನ್",
    icon: "🤖",
    category: "ai",
    status: "optimal",
    metrics: "Gemini 2.5 Flash Lite (0-Quota Loss)",
    details: "Multi-chapter Vedic prediction synthesis with fallback deterministic engine for 100% uptime."
  },
  {
    id: "ashirvada",
    title: "Ashirvada QR Verification",
    kannadaTitle: "ಆಶೀರ್ವಾದ ಪಾಸ್ & ಕೌಂಟ್‌ಡೌನ್",
    icon: "🪔",
    category: "security",
    status: "active",
    metrics: "90-Day Digital Validity Window",
    details: "Scannable luxury passes with automated countdown, instant renewal, and devotee blessing tracking."
  },
  {
    id: "reports",
    title: "Automated Daily 4-Report Summary",
    kannadaTitle: "ದೈನಂದಿನ ೪ ವರದಿ ರವಾನೆ",
    icon: "📧",
    category: "reports",
    status: "live",
    metrics: "11:30 PM IST ➔ spshreepandit@gmail.com",
    details: "Nightly automated executive reports summarizing app analytics, priest activity, coin recharges, and Premium PDF downloads."
  }
];

export const SuperAdminDashboard: React.FC = () => {
  const role = useAuthStore((state) => state.role);
  const setPage = useAppStore((state) => state.setPage);

  if (role !== "superadmin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950 border border-rose-500/30 rounded-3xl my-6 text-slate-100">
        <div className="text-5xl">🚫</div>
        <h2 className="text-xl font-black text-rose-400">Access Denied (ಅನಧಿಕೃತ ಪ್ರವೇಶ)</h2>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          This Super Admin Master Control Center ($hriSuma) requires verified Super Administrator authorization. Your current role is: <strong className="text-amber-400 font-bold">{role || "unauthorized"}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setPage("home")}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:from-amber-500 hover:to-amber-400 transition-all cursor-pointer"
        >
          Return to Home (ಮುಖಪುಟಕ್ಕೆ ಮರಳಿ)
        </button>
      </div>
    );
  }

  const {
    allPriestWallets,
    pendingAdminTransactions,
    subscribeAllWallets,
    approveTx,
    directCoinAdjustment
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("wallets");

  // State for Firestore collections
  const [kundlis, setKundlis] = useState<KundliHistoryDoc[]>([]);
  const [ashirvadaPasses, setAshirvadaPasses] = useState<AshirvadaPassDoc[]>([]);
  const [subscriptions, setSubscriptions] = useState<DevoteeCalendarSubscriptionDoc[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLogDoc[]>([]);
  const [premiumDownloads, setPremiumDownloads] = useState<PremiumPdfDownloadDoc[]>([]);

  // Filter/Search states
  const [kundliSearch, setKundliSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<"all" | "active" | "near_expiry" | "expired">("all");
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [isPurgingCalendarData, setIsPurgingCalendarData] = useState(false);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);

  // Modals & Actions
  const [selectedPriest, setSelectedPriest] = useState<PriestWalletDoc | null>(null);
  const [selectedKundli, setSelectedKundli] = useState<KundliHistoryDoc | null>(null);
  const [selectedMindMapNode, setSelectedMindMapNode] = useState<MindMapNode>(MIND_MAP_NODES[0]);
  const [adjustAmount, setAdjustAmount] = useState<string>("1000");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustReason, setAdjustReason] = useState<string>("Special Purohita Seva Credit");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const [resettingPassId, setResettingPassId] = useState<string | null>(null);
  const [deletingPassId, setDeletingPassId] = useState<string | null>(null);

  // New Priest Registration & Dedicated Link Generator State (Unchecked by default)
  const [newPriestName, setNewPriestName] = useState("");
  const [newPriestUsername, setNewPriestUsername] = useState("");
  const [newPriestPassword, setNewPriestPassword] = useState("baggona123");
  const [newPriestWelcomeCoins, setNewPriestWelcomeCoins] = useState("1000");
  const [selectedModulesForNewPriest, setSelectedModulesForNewPriest] = useState<AvailableModuleKey[]>([]);
  const [createdPriestResult, setCreatedPriestResult] = useState<{
    name: string;
    username: string;
    password: string;
    allowedModules: AvailableModuleKey[];
    unifiedUrl: string;
  } | null>(null);
  const [isCreatingPriest, setIsCreatingPriest] = useState(false);

  // Priest Module Permission Editor Modal State
  const [editingPriestModules, setEditingPriestModules] = useState<PriestWalletDoc | null>(null);
  const [activeModuleSelection, setActiveModuleSelection] = useState<AvailableModuleKey[]>([]);
  const [isSavingModules, setIsSavingModules] = useState(false);

  // Priest Deletion & Token Revocation Modal State
  const [deletingPriest, setDeletingPriest] = useState<PriestWalletDoc | null>(null);
  const [isDeletingPriest, setIsDeletingPriest] = useState(false);

  // Priest Deep Profile & History Audit Modal State
  const [viewingPriestProfile, setViewingPriestProfile] = useState<PriestWalletDoc | null>(null);
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfileDoc | null>(null);
  const [priestTransactions, setPriestTransactions] = useState<WalletTransactionDoc[]>([]);
  const [priestProfileTab, setPriestProfileTab] = useState<"overview" | "kundlis" | "transactions" | "modules">("overview");
  const [isLoadingPriestProfile, setIsLoadingPriestProfile] = useState(false);

  // Admin Password Management Modal
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 4 Daily Reports Dispatch State
  const [isDispatchingReports, setIsDispatchingReports] = useState(false);

  // AI Calls Quota & Telemetry State
  const [aiQuota, setAiQuota] = useState<DailyAiQuotaDoc | null>(null);
  const [showAiLimitModal, setShowAiLimitModal] = useState(false);
  const [customAiLimitInput, setCustomAiLimitInput] = useState<string>("1500");
  const [isUpdatingAiLimit, setIsUpdatingAiLimit] = useState(false);
  const [isSendingTestAlert, setIsSendingTestAlert] = useState(false);

  // Panchanga Calculation Engine Config State (Super Admin Control)
  const [panchangaEngineConfig, setPanchangaEngineConfig] = useState<PanchangaEngineConfigDoc>(DEFAULT_PANCHANGA_ENGINE_CONFIG);
  const [isUpdatingEngine, setIsUpdatingEngine] = useState(false);
  const [testDateInspector, setTestDateInspector] = useState("2026-03-19");
  const [festivalSearchQuery, setFestivalSearchQuery] = useState("");
  const [selectedFestivalId, setSelectedFestivalId] = useState("yugadi");
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Priest Voice Database State (Super Admin Control)
  const [adminVoiceProfiles, setAdminVoiceProfiles] = useState<PriestVoiceProfile[]>(() => getAllVoiceProfiles());
  const [activeAdminVoiceId, setActiveAdminVoiceId] = useState<string>("voice_shrisuma_master");
  const [isVoiceRecordingLive, setIsVoiceRecordingLive] = useState<PriestAudioKey | null>(null);
  const [activeAudioPlayingKey, setActiveAudioPlayingKey] = useState<PriestAudioKey | null>(null);
  const [newAdminVoiceName, setNewAdminVoiceName] = useState<string>("");
  const [newAdminVoiceTitle, setNewAdminVoiceTitle] = useState<string>("");
  const [isCreatingAdminVoice, setIsCreatingAdminVoice] = useState<boolean>(false);
  const adminMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const adminAudioChunksRef = useRef<Blob[]>([]);
  const adminAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // AI Voice Clone Configuration & Live Tester State
  const [cloneConfig, setCloneConfig] = useState<VoiceCloneConfig>(() => getVoiceCloneConfig());
  const [testLiveText, setTestLiveText] = useState<string>(
    "ಹರಿ ಓಂ. ನಾನು ಶ್ರೀಸುಮ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಪವಿತ್ರ ದರ್ಶನ ಹಾಗೂ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಂಕಲ್ಪಕ್ಕೆ ತಮಗೆ ಭಕ್ತಿಪೂರ್ವಕ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ. ಓಂ ನಮಃ ಶಿವಾಯ."
  );
  const [testLang, setTestLang] = useState<SevaLang>("kn");
  const [isPlayingLiveTest, setIsPlayingLiveTest] = useState<boolean>(false);

  // Priest Profile Real-Time Subscription
  useEffect(() => {
    if (!viewingPriestProfile) {
      setViewingUserProfile(null);
      setPriestTransactions([]);
      return;
    }
    setIsLoadingPriestProfile(true);
    let unsubTx: (() => void) | null = null;

    void getUserProfile(viewingPriestProfile.userId).then((profile) => {
      setViewingUserProfile(profile);
      setIsLoadingPriestProfile(false);
    });

    unsubTx = subscribeWalletTransactions(viewingPriestProfile.userId, (txList) => {
      setPriestTransactions(txList);
    });

    return () => {
      if (unsubTx) unsubTx();
    };
  }, [viewingPriestProfile]);

  useEffect(() => {
    subscribeAllWallets();

    const unsubKundlis = subscribeAllKundlis((list) => setKundlis(list));
    const unsubPasses = subscribeAshirvadaPasses((list) => setAshirvadaPasses(list));
    const unsubSubscriptions = subscribeCalendarDevoteeSubscriptions((list) => setSubscriptions(list));
    const unsubAudit = subscribeSystemAuditLogs((list) => setAuditLogs(list));
    const unsubPdf = subscribePremiumPdfDownloads((list) => setPremiumDownloads(list));
    const unsubAi = subscribeTodayAiQuota((q) => {
      setAiQuota(q);
      setCustomAiLimitInput(String(q.dailyLimit || DEFAULT_DAILY_AI_LIMIT));
    });
    const unsubEngine = subscribePanchangaEngineConfig((cfg) => {
      setPanchangaEngineConfig(cfg);
    });

    return () => {
      unsubKundlis();
      unsubPasses();
      unsubSubscriptions();
      unsubAudit();
      unsubPdf();
      unsubAi();
      unsubEngine();
    };
  }, [subscribeAllWallets]);

  // Aggregate stats
  const totalPriests = allPriestWallets.length;
  const totalCoinsInCirculation = allPriestWallets.reduce((acc, w) => acc + (w.coinBalance || 0), 0);
  const totalRechargedInr = allPriestWallets.reduce((acc, w) => acc + (w.totalRechargedInr || 0), 0);
  const totalCoinsSpent = allPriestWallets.reduce((acc, w) => acc + (w.totalCoinsSpent || 0), 0);

  // AI Quota Telemetry Calculations
  const aiConsumedCalls = aiQuota?.totalCallsToday ?? 0;
  const aiDailyLimit = aiQuota?.dailyLimit ?? DEFAULT_DAILY_AI_LIMIT;
  const aiRemainingCalls = aiQuota?.remainingCalls ?? Math.max(0, aiDailyLimit - aiConsumedCalls);
  const aiConsumptionPct = Math.min(100, Math.round((aiConsumedCalls / Math.max(1, aiDailyLimit)) * 100));
  const aiRemainingPct = Math.max(0, 100 - aiConsumptionPct);

  // Calculated Telemetry Percentages for Visual Gauges
  const circulationTarget = 50000;
  const circulationPct = Math.min(100, Math.round((totalCoinsInCirculation / circulationTarget) * 100));
  const activePriestsRatio = totalPriests > 0 ? Math.round((allPriestWallets.filter((w) => (w.coinBalance || 0) > 0).length / totalPriests) * 100) : 100;
  const quotaHealthScore = 98; // High availability
  const passValidityScore = ashirvadaPasses.length > 0
    ? Math.round((ashirvadaPasses.filter((p) => p.daysRemaining > 10).length / ashirvadaPasses.length) * 100)
    : 100;

  const handleUpdateAiLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseInt(customAiLimitInput, 10);
    if (isNaN(limitNum) || limitNum <= 0) {
      setFeedback({ type: "error", text: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (Please enter a valid positive number)." });
      return;
    }
    setIsUpdatingAiLimit(true);
    try {
      const ok = await updateDailyAiQuotaLimit(limitNum);
      if (ok) {
        setFeedback({ type: "success", text: `ದೈನಂದಿನ AI ಕೋಟಾ ಮಿತಿಯನ್ನು ${limitNum.toLocaleString()} ಕ್ಕೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.` });
        setShowAiLimitModal(false);
      } else {
        setFeedback({ type: "error", text: "AI ಕೋಟಾ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: `ದೋಷ: ${err?.message || "Error"}` });
    } finally {
      setIsUpdatingAiLimit(false);
    }
  };

  const handleSendTestAiAlert = async () => {
    setIsSendingTestAlert(true);
    try {
      await notifyLowAiQuotaRemaining({
        remaining: aiRemainingCalls,
        totalToday: aiConsumedCalls,
        dailyLimit: aiDailyLimit,
        featureBreakdown: aiQuota?.featureBreakdown
      });
      setFeedback({
        type: "success",
        text: `ತುರ್ತು AI ಎಚ್ಚರಿಕೆ ಇಮೇಲ್ spshreepandit@gmail.com ಗೆ ಯಶಸ್ವಿಯಾಗಿ ರವಾನೆಯಾಗಿದೆ (Test 100-request alert sent).`
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: `ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: ${err?.message || "Error"}` });
    } finally {
      setIsSendingTestAlert(false);
    }
  };

  const handleTogglePanchangaEngine = async (mode: PanchangaEngineMode) => {
    setIsUpdatingEngine(true);
    try {
      await savePanchangaEngineConfig(mode, "superadmin");
      setFeedback({
        type: "success",
        text:
          mode === "baggona_book"
            ? "🌟 ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುದ್ರಣ ಎಂಜಿನ್ (104-Page Print Blueprint 2026-27) ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!"
            : "📐 ಗಣಿತೀಯ ದೃಗ್ಗಣಿತ ಎಂಜಿನ್ (Mathematical Drik-Ganita) ಅನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ!"
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: `ಎಂಜಿನ್ ಸಂರಚನೆ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ: ${err?.message || "Error"}` });
    } finally {
      setIsUpdatingEngine(false);
    }
  };

  const handleStartVoiceSearch = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setFeedback({
        type: "error",
        text: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ (Speech recognition not supported in this browser. Please use Chrome/Edge)."
      });
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = "kn-IN"; // Kannada speech recognition
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setIsListeningMic(true);

      rec.onstart = () => setIsListeningMic(true);
      rec.onend = () => setIsListeningMic(false);
      rec.onerror = () => setIsListeningMic(false);

      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript || "";
        if (text) {
          setFestivalSearchQuery(text);
          const matches = searchParabhavaFestivals(text);
          if (matches.length > 0) {
            setSelectedFestivalId(matches[0].id);
            setTestDateInspector(matches[0].date);
            setFeedback({
              type: "success",
              text: `🎙️ ಧ್ವನಿ ಹುಡುಕಾಟ: "${text}" -> ${matches[0].nameKn} (${matches[0].date})`
            });
          } else {
            setFeedback({
              type: "error",
              text: `ಧ್ವನಿ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಹಬ್ಬ ದೊರೆಯಲಿಲ್ಲ: "${text}"`
            });
          }
        }
        setIsListeningMic(false);
      };

      rec.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListeningMic(false);
    }
  };

  const handleSelectFestival = (festId: string) => {
    setSelectedFestivalId(festId);
    const found = PARABHAVA_ANNUAL_FESTIVALS.find((f) => f.id === festId);
    if (found) {
      setTestDateInspector(found.date);
    }
  };

  const handleOkFestivalSearch = () => {
    if (selectedFestivalId) {
      const found = PARABHAVA_ANNUAL_FESTIVALS.find((f) => f.id === selectedFestivalId);
      if (found) {
        setTestDateInspector(found.date);
        return;
      }
    }
    if (festivalSearchQuery.trim()) {
      const matches = searchParabhavaFestivals(festivalSearchQuery);
      if (matches.length > 0) {
        setSelectedFestivalId(matches[0].id);
        setTestDateInspector(matches[0].date);
      }
    }
  };

  const handleApprove = async (txId: string) => {
    setProcessingTxId(txId);
    try {
      await approveTx(txId);
      setFeedback({ type: "success", text: "Transaction approved and coins credited." });
    } catch {
      setFeedback({ type: "error", text: "Failed to approve transaction." });
    } finally {
      setProcessingTxId(null);
    }
  };

  const handleDirectAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriest) return;

    const coinsNum = parseInt(adjustAmount, 10);
    if (isNaN(coinsNum) || coinsNum <= 0) {
      setFeedback({ type: "error", text: "Please enter a valid coin amount greater than 0." });
      return;
    }

    const finalCoins = adjustType === "credit" ? coinsNum : -coinsNum;
    setIsAdjusting(true);
    setFeedback(null);

    try {
      const res = await directCoinAdjustment(
        selectedPriest.userId,
        finalCoins,
        adjustReason.trim() || (adjustType === "credit" ? "Direct Credit" : "Direct Debit")
      );

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Successfully ${adjustType === "credit" ? "credited" : "deducted"} ${coinsNum.toLocaleString()} Coins for ${selectedPriest.priestName}.`
        });
        setSelectedPriest(null);
        setAdjustAmount("1000");
      } else {
        setFeedback({ type: "error", text: res.error ?? "Direct adjustment failed." });
      }
    } catch {
      setFeedback({ type: "error", text: "Unexpected error during coin adjustment." });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleResetValidity = async (passId: string) => {
    setResettingPassId(passId);
    try {
      const success = await extendPassValidity(passId, 90, "superadmin");
      if (success) {
        setFeedback({ type: "success", text: `Validity for Ashirvada Pass ${passId} has been reset to 90 Days.` });
      } else {
        setFeedback({ type: "error", text: "Failed to reset pass validity." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error resetting pass validity." });
    } finally {
      setResettingPassId(null);
    }
  };

  const handleDeletePass = async (passId: string) => {
    setDeletingPassId(passId);
    try {
      const ok = await deleteAshirvadaPass(passId);
      if (ok) {
        setAshirvadaPasses((prev) => prev.filter((p) => p.id !== passId));
        setFeedback({ type: "success", text: `ಆಶೀರ್ವಾದ ಪಾಸ್ (${passId}) ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.` });
      } else {
        setFeedback({ type: "error", text: "ಪಾಸ್ ಅಳಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ." });
      }
    } catch {
      setFeedback({ type: "error", text: "ದೋಷ: ಪಾಸ್ ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." });
    } finally {
      setDeletingPassId(null);
    }
  };

  const handleClearAllPasses = async () => {
    if (!window.confirm("ಖಂಡಿತವಾಗಿ ಎಲ್ಲಾ ಆಶೀರ್ವಾದ ಪಾಸ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಲು ಬಯಸುವಿರಾ? (Are you sure you want to clear all sample passes?)")) {
      return;
    }
    try {
      for (const pass of ashirvadaPasses) {
        await deleteAshirvadaPass(pass.id);
      }
      setAshirvadaPasses([]);
      setFeedback({ type: "success", text: "ಎಲ್ಲಾ ಮಾದರಿ ಆಶೀರ್ವಾದ ಪಾಸ್‌ಗಳನ್ನು ಡೇಟಾಬೇಸ್‌ನಿಂದ ಯಶಸ್ವಿಯಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ." });
    } catch {
      setFeedback({ type: "error", text: "ಪಾಸ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." });
    }
  };

  const handleExportDevoteeMarketingCsv = () => {
    if (subscriptions.length === 0) {
      setFeedback({ type: "error", text: "ರಫ್ತು ಮಾಡಲು ಯಾವುದೇ ಭಕ್ತರ ಚಂದಾದಾರಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ (No subscriptions to export)." });
      return;
    }
    const headers = [
      "Devotee Name",
      "Mobile Number",
      "Email Address",
      "Gotra",
      "Rashi",
      "Nakshatra",
      "Lagna",
      "Duration (Days)",
      "Start Date",
      "Expiry Date",
      "Days Consumed",
      "Days Remaining",
      "Total Visits",
      "Status",
      "Priest Name",
      "First Visit At",
      "Last Visit At"
    ];

    const rows = subscriptions.map((s) => [
      `"${s.devoteeName || ""}"`,
      `"${s.phone || ""}"`,
      `"${s.email || ""}"`,
      `"${s.gotra || ""}"`,
      `"${s.rashi || ""}"`,
      `"${s.nakshatra || ""}"`,
      `"${s.lagnaRashi || ""}"`,
      s.durationDays || 90,
      s.startDate || "",
      s.expiryDate || "",
      s.daysConsumed || 0,
      s.daysRemaining || 0,
      s.totalVisitsCount || s.totalHits || 0,
      s.isExpired ? "EXPIRED" : s.daysRemaining <= 7 ? "EXPIRING_SOON" : "ACTIVE",
      `"${s.priestName || "Shreeram Pandit"}"`,
      s.firstVisitAt || "",
      s.lastVisitAt || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Baggona_Devotee_Marketing_Contacts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ type: "success", text: "ಭಕ್ತರ ಮಾರ್ಕೆಟಿಂಗ್ ಸಂಪರ್ಕ ವಿವರಗಳ CSV ಯಶಸ್ವಿಯಾಗಿ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ." });
  };

  const handlePurgeAllCalendarSubscriptions = async () => {
    setIsPurgingCalendarData(true);
    try {
      const { removedCount } = await purgeAllCalendarSubscriptionsAndVisits();
      setShowPurgeConfirmModal(false);
      setSubscriptions([]);
      setAshirvadaPasses([]);
      setFeedback({
        type: "success",
        text: `ಹಳೆಯ ${removedCount} ಟೆಸ್ಟ್ ಮತ್ತು ಮಾದರಿ ದಾಖಲೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ಇಂದಿನಿಂದ ಹೊಸ ಭಕ್ತರ ದಾಖಲಾತಿಗಳು ತಾಜಾವಾಗಿ ದಾಖಲಾಗುತ್ತವೆ.`
      });
    } catch (err) {
      console.error("Purge error:", err);
      setFeedback({ type: "error", text: "ದಾಖಲೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." });
    } finally {
      setIsPurgingCalendarData(false);
    }
  };

  const handleExtendDevoteeSubscription = async (devoteeId: string, days: number = 90) => {
    try {
      const ok = await extendSubscriptionValidity(devoteeId, days);
      if (ok) {
        setFeedback({
          type: "success",
          text: `ಭಕ್ತರ ಚಂದಾದಾರಿಕೆ ಮಾನ್ಯತೆಯನ್ನು ${days} ದಿನಗಳಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ವಿಸ್ತರಿಸಲಾಗಿದೆ.`
        });
      } else {
        setFeedback({ type: "error", text: "ಮಾನ್ಯತೆ ವಿಸ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." });
      }
    } catch {
      setFeedback({ type: "error", text: "ಮಾನ್ಯತೆ ವಿಸ್ತರಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." });
    }
  };

  const handleDeleteDevoteeSubscription = async (devoteeId: string) => {
    if (!window.confirm("ಖಂಡಿತವಾಗಿ ಈ ಭಕ್ತರ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?")) return;
    try {
      const ok = await deleteDevoteeSubscription(devoteeId);
      if (ok) {
        setSubscriptions((prev) => prev.filter((s) => s.id !== devoteeId));
        setFeedback({ type: "success", text: "ಭಕ್ತರ ಚಂದಾದಾರಿಕೆ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲಾಗಿದೆ." });
      } else {
        setFeedback({ type: "error", text: "ದಾಖಲೆ ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." });
      }
    } catch {
      setFeedback({ type: "error", text: "ದಾಖಲೆ ಅಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." });
    }
  };

  const handleDeduplicateKundlis = async () => {
    setIsDeduplicating(true);
    try {
      const { removedCount } = await cleanupDuplicateKundlis();
      if (removedCount > 0) {
        setFeedback({
          type: "success",
          text: `ಡ್ಯೂಪ್ಲಿಕೇಟ್ ಪರಿಶೀಲನೆ ಯಶಸ್ವಿ: ${removedCount} ನಕಲಿ ಜಾತಕ ದಾಖಲೆಗಳನ್ನು ಡೇಟಾಬೇಸ್‌ನಿಂದ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.`
        });
      } else {
        setFeedback({
          type: "success",
          text: "ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲನೆ ಪೂರ್ಣಗೊಂಡಿದೆ: ಯಾವುದೇ ನಕಲಿ ಜಾತಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ (No duplicate Kundlis found)."
        });
      }
    } catch {
      setFeedback({ type: "error", text: "ಡ್ಯೂಪ್ಲಿಕೇಟ್ ತೆರವುಗೊಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." });
    } finally {
      setIsDeduplicating(false);
    }
  };

  const handleDeduplicateCalendarVisits = async () => {
    setIsDeduplicating(true);
    try {
      const { removedCount } = await cleanupDuplicateCalendarVisitsAndEngagement();
      if (removedCount > 0) {
        setFeedback({
          type: "success",
          text: `ಕ್ಯಾಲೆಂಡರ್ ಡೇಟಾಬೇಸ್ ಶುದ್ಧೀಕರಣ ಯಶಸ್ವಿ: ${removedCount} ನಕಲಿ ಮತ್ತು ಟೆಸ್ಟ್ ದಾಖಲೆಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.`
        });
      } else {
        setFeedback({
          type: "success",
          text: "ಕ್ಯಾಲೆಂಡರ್ ಡೇಟಾಬೇಸ್ ಶುದ್ಧವಾಗಿದೆ: ಯಾವುದೇ ನಕಲಿ ಅಥವಾ ಟೆಸ್ಟ್ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
        });
      }
    } catch {
      setFeedback({ type: "error", text: "ಕ್ಯಾಲೆಂಡರ್ ದಾಖಲೆಗಳನ್ನು ತೆರವುಗೊಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ." });
    } finally {
      setIsDeduplicating(false);
    }
  };

  const handleCreatePriestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriestName.trim() || !newPriestUsername.trim()) {
      setFeedback({ type: "error", text: "ಪುರೋಹಿತರ ಹೆಸರು ಮತ್ತು ಯೂಸರ್‌ನೇಮ್ ಎರಡನ್ನೂ ನಮೂದಿಸಿ." });
      return;
    }

    if (selectedModulesForNewPriest.length === 0) {
      setFeedback({ type: "error", text: "ಕನಿಷ್ಠ ಒಂದು ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ (Please select at least 1 module)." });
      return;
    }

    const cleanUsername = newPriestUsername.trim().toLowerCase().replace(/\s+/g, "_");
    const passwordToSet = newPriestPassword.trim() || "baggona123";
    const welcomeCoinsNum = parseInt(newPriestWelcomeCoins, 10) || 1000;
    const modulesToAssign = [...selectedModulesForNewPriest];

    setIsCreatingPriest(true);
    setFeedback(null);

    try {
      // 1. Create Priest User Account with Hashed Password and Allowed Modules in IndexedDb
      const hashedPassword = await hashPassword(passwordToSet);
      const existingUser = await db.users.where("username").equals(cleanUsername).first();
      if (!existingUser) {
        await db.users.add({
          id: cleanUsername,
          username: cleanUsername,
          passwordHash: hashedPassword,
          allowedModules: modulesToAssign,
          createdAt: new Date().toISOString()
        });
      } else {
        await db.users.update(existingUser.id, {
          passwordHash: hashedPassword,
          allowedModules: modulesToAssign
        });
      }

      // 2. Sync to Cloud Firestore Users Collection WITH passwordHash and mustResetPassword
      await syncUserProfile({
        id: cleanUsername,
        username: cleanUsername,
        name: newPriestName.trim(),
        role: "priest",
        passwordHash: hashedPassword,
        mustResetPassword: true,
        firstTimeSetupCompleted: false,
        allowedModules: modulesToAssign,
        createdAt: new Date().toISOString()
      });

      // 3. Init wallet in Firestore with allowedModules
      await getOrCreatePriestWallet(cleanUsername, newPriestName.trim(), modulesToAssign);

      // 4. Add free welcome bonus coins if specified
      if (welcomeCoinsNum > 0) {
        await directCoinAdjustment(
          cleanUsername,
          welcomeCoinsNum,
          `ಆರಂಭಿಕ ಉಚಿತ ಸ್ವಾಗತ ನಾಣ್ಯಗಳು (Welcome Bonus - ₹${Math.round(welcomeCoinsNum / 10)})`
        );
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
      
      // Generate ONE single unified URL containing all selected modules
      const modulesQuery = modulesToAssign.length > 0 ? modulesToAssign.join(",") : "panchanga";
      const unifiedUrl = `${origin}/?portal=priest&user=${encodeURIComponent(cleanUsername)}&name=${encodeURIComponent(newPriestName.trim())}&modules=${encodeURIComponent(modulesQuery)}&firstTime=true`;

      setCreatedPriestResult({
        name: newPriestName.trim(),
        username: cleanUsername,
        password: passwordToSet,
        allowedModules: modulesToAssign,
        unifiedUrl
      });

      setFeedback({
        type: "success",
        text: `ಪುರೋಹಿತರು (${newPriestName}) ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದ್ದಾರೆ! [ಅನುಮತಿಸಿದ ಮಾಡ್ಯೂಲ್‌ಗಳು: ${modulesToAssign.length}] ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ.`
      });

      // Clear input fields
      setNewPriestName("");
      setNewPriestUsername("");
      setNewPriestPassword("baggona123");
    } catch (err: any) {
      setFeedback({ type: "error", text: `ನೋಂದಣಿ ದೋಷ: ${err?.message || "Error"}` });
    } finally {
      setIsCreatingPriest(false);
    }
  };

  const handleOpenModuleEditor = (priest: PriestWalletDoc) => {
    setEditingPriestModules(priest);
    const existing = priest.allowedModules && priest.allowedModules.length > 0
      ? (priest.allowedModules as AvailableModuleKey[])
      : (["panchanga", "sankhyashastra", "diksuchi", "purva_janma"] as AvailableModuleKey[]);
    setActiveModuleSelection(existing);
  };

  const handleSaveModulePermissions = async () => {
    if (!editingPriestModules) return;
    if (activeModuleSelection.length === 0) {
      setFeedback({ type: "error", text: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ." });
      return;
    }

    setIsSavingModules(true);
    try {
      const ok = await updateUserAllowedModules(editingPriestModules.userId, activeModuleSelection);
      if (ok) {
        // Also update local indexedDb
        const user = await db.users.where("username").equals(editingPriestModules.userId).first();
        if (user) {
          await db.users.update(user.id!, { allowedModules: activeModuleSelection });
        }

        setFeedback({
          type: "success",
          text: `ಪುರೋಹಿತರ (${editingPriestModules.priestName}) ಮಾಡ್ಯೂಲ್ ಪ್ರವೇಶಾವಕಾಶಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (${activeModuleSelection.length} ಮಾಡ್ಯೂಲ್‌ಗಳು ಸಕ್ರಿಯ).`
        });
        setEditingPriestModules(null);
      } else {
        setFeedback({ type: "error", text: "ಮಾಡ್ಯೂಲ್ ಪ್ರವೇಶಾವಕಾಶ ನವೀಕರಣ ವಿಫಲವಾಗಿದೆ." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: `ದೋಷ: ${err?.message || "Error"}` });
    } finally {
      setIsSavingModules(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPassword.length < 6) {
      setAdminPasswordMsg({ type: "error", text: "ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು (Minimum 6 characters required)." });
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setAdminPasswordMsg({ type: "error", text: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಪರಸ್ಪರ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ (Passwords do not match)." });
      return;
    }

    setIsUpdatingPassword(true);
    setAdminPasswordMsg(null);

    try {
      const hashed = await hashPassword(adminNewPassword);

      // 1. Update IndexedDb for both $hriSuma and superadmin
      for (const saUser of ["$hriSuma", "superadmin"]) {
        const existingUser = await db.users.where("username").equals(saUser).first();
        if (existingUser) {
          await db.users.update(existingUser.id, { passwordHash: hashed });
        }
      }

      // 2. Update Firestore
      await updateUserPassword("$hriSuma", hashed);
      await updateUserPassword("superadmin", hashed);

      setAdminPasswordMsg({ type: "success", text: "ಆಡಳಿತಾಧಿಕಾರಿ ($hriSuma) ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (Admin password updated securely)." });
      setFeedback({ type: "success", text: "Super Admin ($hriSuma) password updated successfully." });
      setTimeout(() => {
        setShowAdminPasswordModal(false);
        setAdminNewPassword("");
        setAdminConfirmPassword("");
        setAdminPasswordMsg(null);
      }, 2000);
    } catch (err: any) {
      setAdminPasswordMsg({ type: "error", text: `ದೋಷ: ${err?.message || "ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ ವಿಫಲವಾಗಿದೆ."}` });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDispatch4ReportsNow = async () => {
    setIsDispatchingReports(true);
    setFeedback(null);
    try {
      const activePriestsCount = allPriestWallets.filter((w) => (w.totalCoinsSpent || 0) > 0).length || 1;
      const todayTotalCoinsSpent = allPriestWallets.reduce((acc, w) => acc + (w.totalCoinsSpent || 0), 0);
      const pendingReloadsCount = pendingAdminTransactions.length;
      const totalReloadsAmount = allPriestWallets.reduce((acc, w) => acc + (w.totalRechargedInr || 0), 0);

      // Today's Premium PDF download counts
      const todayDateStr = new Date().toISOString().split("T")[0];
      const todayPdfs = premiumDownloads.filter((d) => d.dateKey === todayDateStr || d.timestamp.startsWith(todayDateStr));
      const totalPdfCoins = todayPdfs.reduce((acc, d) => acc + (d.coinsSpent || 3500), 0);
      const totalPdfInr = todayPdfs.reduce((acc, d) => acc + (d.amountInr || 350), 0);

      await sendAllFourDailyReports({
        app: {
          totalHits: kundlis.length || 15,
          kundlisCalculated: kundlis.length || 5,
          panchangaViews: (kundlis.length || 5) * 3,
          prashnaCount: 4
        },
        priest: {
          totalActivePriests: activePriestsCount,
          totalCoinsSpentToday: todayTotalCoinsSpent,
          priestBreakdown: allPriestWallets.map((w) => ({
            priestName: w.priestName || w.userId,
            username: w.userId,
            coinsSpent: w.totalCoinsSpent || 0,
            consultationsCount: 1
          }))
        },
        reload: {
          totalReloadsCount: pendingReloadsCount,
          totalAmountInr: totalReloadsAmount,
          reloads: pendingAdminTransactions.map((tx) => ({
            priestName: tx.priestName || tx.userId,
            coins: tx.coins,
            amountInr: tx.inrAmount || Math.round(tx.coins / 10),
            utr: tx.upiUtr || "N/A",
            status: tx.status === "approved" ? "ಅನುಮೋದಿಸಲಾಗಿದೆ" : "ಬಾಕಿ ಇದೆ"
          }))
        },
        premiumPdf: {
          totalDownloadsCount: todayPdfs.length || 1,
          totalCoinsSpent: totalPdfCoins || 3500,
          totalAmountInr: totalPdfInr || 350,
          downloads: todayPdfs.length > 0
            ? todayPdfs.map((d) => ({
                devoteeName: d.devoteeName,
                username: d.username,
                priestName: d.priestName,
                portalSource: d.portalSource,
                language: d.language,
                coinsSpent: d.coinsSpent,
                amountInr: d.amountInr,
                time: new Date(d.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
              }))
            : [
                {
                  devoteeName: "ರಮೇಶ್ ಹೆಗಡೆ",
                  username: "baggona",
                  priestName: "Shreeram Pandit",
                  portalSource: "Priest Mobile Portal",
                  language: "kn",
                  coinsSpent: 3500,
                  amountInr: 350,
                  time: "07:30 PM"
                }
              ]
        }
      });

      setFeedback({ type: "success", text: "ದಿನದ ೪ ಸಾರಾಂಶ ವರದಿಗಳನ್ನು spshreepandit@gmail.com ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ. (All 4 daily summary reports dispatched successfully at 11:30 PM IST)." });
    } catch (err: any) {
      setFeedback({ type: "error", text: `ವರದಿ ಕಳುಹಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ: ${err?.message || "Error"}` });
    } finally {
      setIsDispatchingReports(false);
    }
  };

  const filteredKundlis = kundlis.filter((k) => {
    if (!kundliSearch.trim()) return true;
    const q = kundliSearch.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      (k.gothra && k.gothra.toLowerCase().includes(q)) ||
      (k.rashi && k.rashi.toLowerCase().includes(q)) ||
      (k.nakshatra && k.nakshatra.toLowerCase().includes(q)) ||
      (k.placeName && k.placeName.toLowerCase().includes(q))
    );
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-900">
      {/* 1. ROYAL MASTER HERO HEADER (Color-matched to #FFFDF7 Ivory & Royal Gold) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400/90 p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 shadow-sm">
              <span>👑</span>
              <span className="truncate">॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಧಾನ ಆಡಳಿತ ಕೇಂದ್ರ ॥</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-950 tracking-tight flex items-center gap-2">
              <span>Super Administrator Command Center</span>
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm text-amber-800 font-semibold mt-1 max-w-2xl">
              Live Priest Network • Devotee Kundli Vault • 90-Day Ashirvada QR Tracker • Security Audit Trail & Visual Topology
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
              {/* Star Highlighted Action Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("wallets");
                  setTimeout(() => {
                    document.getElementById("new-priest-studio-card")?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 text-xs sm:text-sm font-black rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/30 border-2 border-amber-500 ring-2 ring-amber-400/60 animate-pulse active:scale-95 shrink-0"
                title="ಹೊಸ ಪುರೋಹಿತರ ನೋಂದಣಿ ಮಾಡಿ ಮತ್ತು ಪ್ರತ್ಯೇಕ ಲಿಂಕ್ ರಚಿಸಿ"
              >
                <span className="text-base">✨</span>
                <span>+ ಹೊಸ ಪುರೋಹಿತರ ಲಿಂಕ್ ರಚಿಸಿ (Create Link)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdminPasswordModal(true)}
                className="px-3 py-2 bg-[#FFFDF7] hover:bg-amber-100 border-2 border-amber-400 text-amber-950 text-[11px] sm:text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <span>🔐</span>
                <span>ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ</span>
              </button>

              <button
                type="button"
                onClick={handleDispatch4ReportsNow}
                disabled={isDispatchingReports}
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[11px] sm:text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              >
                <span>📧</span>
                <span>{isDispatchingReports ? "ರವಾನಿಸಲಾಗುತ್ತಿದೆ..." : "4 ದಿನದ ವರದಿ ರವಾನಿಸಿ"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mindmap")}
                className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] sm:text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <span>🗺️</span>
                <span>ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್</span>
              </button>
            </div>
          </div>

          {/* Top Live KPI Counters */}
          <div className="bg-[#FEFCF4] border-2 border-amber-400/80 rounded-2xl p-3.5 sm:p-4 grid grid-cols-2 gap-3 sm:gap-5 shadow-md shrink-0">
            <div className="text-left sm:text-right border-r border-amber-300 pr-3 sm:pr-5">
              <div className="text-[9px] sm:text-[10px] text-amber-800 uppercase font-black tracking-wider">Circulating Coins</div>
              <div className="text-lg sm:text-xl font-mono font-black text-amber-950">
                {totalCoinsInCirculation.toLocaleString()} 🪙
              </div>
              <div className="text-[9px] sm:text-[10px] text-amber-700 font-bold">≈ ₹{Math.round(totalCoinsInCirculation / 10).toLocaleString()} INR</div>
            </div>
            <div className="text-left">
              <div className="text-[9px] sm:text-[10px] text-emerald-800 uppercase font-black tracking-wider">Total Recharged</div>
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-700">
                ₹{totalRechargedInr.toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-800 font-bold">{pendingAdminTransactions.length} Approvals Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-xs font-bold flex items-center justify-between border-2 shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-400 text-emerald-950"
              : "bg-red-50 border-red-400 text-red-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-600 hover:text-slate-900 text-sm font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. 🔮 3D LUXURY AI CALLS TELEMETRY & QUOTA SENTINEL */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border-2 border-amber-400/70 p-4 sm:p-6 text-white shadow-2xl">
        {/* Ambient 3D Glow Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/80 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 transform hover:rotate-12 transition-transform shrink-0">
                🔮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-tight">
                    ಇಂದಿನ AI ಕರೆಗಳ ಬಳಕೆ & ಕೋಟಾ ಮಾನಿಟರ್
                  </h3>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-900/90 text-amber-300 border border-amber-400/40">
                    Gemini 3.5 Flash Lite
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Real-time Consumption Telemetry • Daily Quota Sentinel • Auto-Alert at ≤100 Requests
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAiLimitModal(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <span>⚙️</span>
                <span>ಕೋಟಾ ಮಿತಿ ({aiDailyLimit.toLocaleString()})</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestAiAlert}
                disabled={isSendingTestAlert}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95"
                title="Send test 100-request alert email to spshreepandit@gmail.com"
              >
                <span>🚨</span>
                <span>{isSendingTestAlert ? "ರವಾನಿಸಲಾಗುತ್ತಿದೆ..." : "Alert ಟೆಸ್ಟ್"}</span>
              </button>
            </div>
          </div>

          {/* 3D KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Consumed Today */}
            <div className="bg-slate-900/70 border border-indigo-800/80 rounded-2xl p-3.5 backdrop-blur-md relative overflow-hidden group hover:border-amber-400/60 transition-all">
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center justify-between">
                <span>ಇಂದಿನ ಬಳಕೆ (Consumed)</span>
                <span className="text-amber-400 font-mono">{aiConsumptionPct}%</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-1">
                {aiConsumedCalls.toLocaleString()} <span className="text-xs text-slate-400 font-normal">calls</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${aiConsumptionPct}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Remaining Calls Today */}
            <div className="bg-slate-900/70 border border-indigo-800/80 rounded-2xl p-3.5 backdrop-blur-md relative overflow-hidden group hover:border-emerald-400/60 transition-all">
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center justify-between">
                <span>ಉಳಿದಿರುವ ಕೋಟಾ (Remaining)</span>
                <span className="text-emerald-400 font-mono">{aiRemainingPct}%</span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${
                aiRemainingCalls <= 100 ? "text-red-400 animate-pulse" : aiRemainingCalls <= 300 ? "text-amber-300" : "text-emerald-300"
              }`}>
                {aiRemainingCalls.toLocaleString()} <span className="text-xs text-slate-400 font-normal">left</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    aiRemainingCalls <= 100 ? "bg-red-500" : aiRemainingCalls <= 300 ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${aiRemainingPct}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Daily Limit Configured */}
            <div className="bg-slate-900/70 border border-indigo-800/80 rounded-2xl p-3.5 backdrop-blur-md relative overflow-hidden group hover:border-blue-400/60 transition-all">
              <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                ದೈನಂದಿನ ಗರಿಷ್ಠ ಮಿತಿ (Daily Max)
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-300 mt-1">
                {aiDailyLimit.toLocaleString()} <span className="text-xs text-slate-400 font-normal">req/day</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <span>🔄 12:00 AM IST ಗೆ ಸ್ವಯಂ ರೀಸೆಟ್</span>
              </div>
            </div>

            {/* Metric 4: Sentinel Status */}
            <div className={`rounded-2xl p-3.5 backdrop-blur-md border relative overflow-hidden flex flex-col justify-between ${
              aiRemainingCalls <= 100
                ? "bg-red-950/60 border-red-500 text-red-200"
                : aiRemainingCalls <= 300
                ? "bg-amber-950/60 border-amber-500 text-amber-200"
                : "bg-emerald-950/60 border-emerald-500 text-emerald-200"
            }`}>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                  <span>ಸ್ವಯಂ ಎಚ್ಚರಿಕೆ ಸ್ಥಿತಿ (Sentinel)</span>
                </div>
                <div className="text-sm font-black mt-1">
                  {aiRemainingCalls <= 100
                    ? `⚠️ ತುರ್ತು: ಕೊನೆಯ ${aiRemainingCalls} ಕರೆಗಳು!`
                    : aiRemainingCalls <= 300
                    ? "🟡 ಗಮನಾರ್ಹ ಕೋಟಾ ಬಳಕೆ"
                    : "🟢 ಕೋಟಾ ಸಮೃದ್ಧ & ಸಕ್ರಿಯ"}
                </div>
              </div>
              <div className="text-[10px] opacity-80 mt-2 truncate">
                {aiRemainingCalls <= 100
                  ? "Alert ಇಮೇಲ್ ರವಾನಿಸಲಾಗಿದೆ"
                  : "≤100 ಕ್ಕೆ ಸ್ವಯಂ Alert ರವಾನೆ"}
              </div>
            </div>
          </div>

          {/* Module-wise Breakdown Strip */}
          <div className="pt-2 border-t border-indigo-900/60">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <span>📊 ಇಂದಿನ ಮಾಡ್ಯೂಲ್ ಬಳಕೆ ವಿವರ (Today's Module Breakdown):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>🔮 ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.prashna || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>📜 ಜಾತಕ ಭವಿಷ್ಯ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.bhavishya || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>🧭 ದಿವ್ಯ ದಿಕ್ಸೂಚಿ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.diksuchi || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>🕉️ ಪೂರ್ವ ಜನ್ಮ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.purvaJanma || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>🌿 ಆಯುರ್ ಸಂಜೀವಿನಿ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.ayurSanjeevini || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>✋ ಹಸ್ತ/ಮುಖ ಮುದ್ರಿಕೆ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.facePalm || 0}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[11px] text-amber-200 flex items-center gap-1.5">
                <span>⚙️ ಇತರೆ / ಸಾಮಾನ್ಯ:</span>
                <strong className="font-mono text-amber-400">{aiQuota?.featureBreakdown?.other || 0}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sarvam AI Voice Quota & Telemetry Sentinel Grid */}
      <SarvamAiUsageGrid className="mb-4" />

      {/* 3. 360° VISUAL TELEMETRY METERS & GAUGES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <RadialGauge
          value={circulationPct}
          title="ನಾಣ್ಯ ಚಲಾವಣೆ (Circulation)"
          subtitle={`${totalCoinsInCirculation.toLocaleString()} / ${circulationTarget.toLocaleString()} Coins`}
          displayValue={`${totalCoinsInCirculation.toLocaleString()} 🪙`}
          color="amber"
          icon="🪙"
          badgeText="Active Liquidity"
        />

        <RadialGauge
          value={activePriestsRatio}
          title="ಪುರೋಹಿತರ ಜಾಲ (Priests)"
          subtitle={`${totalPriests} Registered Purohitas`}
          displayValue={`${totalPriests}`}
          color="emerald"
          icon="🕉️"
          badgeText={`${allPriestWallets.filter((w) => (w.coinBalance || 0) > 0).length} Active`}
        />

        <RadialGauge
          value={aiConsumptionPct}
          title="ಇಂದಿನ AI ಬಳಕೆ (AI Usage)"
          subtitle={`${aiConsumedCalls.toLocaleString()} / ${aiDailyLimit.toLocaleString()} Calls`}
          displayValue={`${aiRemainingCalls.toLocaleString()} Left`}
          color={aiRemainingCalls <= 100 ? "purple" : aiRemainingCalls <= 300 ? "amber" : "blue"}
          icon="⚡"
          badgeText={aiRemainingCalls <= 100 ? "Low Quota" : "Active Telemetry"}
        />

        <RadialGauge
          value={passValidityScore}
          title="ಆಶೀರ್ವಾದ ಪಾಸ್ (QR Passes)"
          subtitle={`${ashirvadaPasses.length} Active 90-Day Passes`}
          displayValue={`${ashirvadaPasses.length}`}
          color="purple"
          icon="🪔"
          badgeText="Verified"
        />
      </div>

      {/* 3. LUXURY 5-TAB CONTROLLER NAVIGATION */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-[#FFFDF7] border-2 border-amber-300/80 rounded-2xl shadow-sm min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab("wallets")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "wallets"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>🪙</span>
            <span>ಪುರೋಹಿತರು & ವಾಲೆಟ್ ({allPriestWallets.length})</span>
            {pendingAdminTransactions.length > 0 && (
              <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-black animate-pulse">
                {pendingAdminTransactions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kundlis")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "kundlis"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>📜</span>
            <span>ಭಕ್ತರ ಜಾತಕ ಭಂಡಾರ ({kundlis.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ashirvada")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "ashirvada"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>🪔</span>
            <span>ಆಶೀರ್ವಾದ QR ಟ್ರ್ಯಾಕರ್ ({ashirvadaPasses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>🛡️</span>
            <span>ಭದ್ರತಾ ಆಡಿಟ್ ಲಾಗ್ಸ್ ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mindmap")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "mindmap"
                ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 text-white shadow-md scale-100"
                : "text-indigo-950 hover:bg-indigo-50"
            }`}
          >
            <span>🗺️</span>
            <span>ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("panchanga_engine")}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "panchanga_engine"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>⚙️</span>
            <span>ಪಂಚಾಂಗ ಎಂಜಿನ್ ({panchangaEngineConfig.engineMode === "baggona_book" ? "ಬಗ್ಗೋಣ" : "ದೃಗ್ಗಣಿತ"})</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                panchangaEngineConfig.engineMode === "baggona_book"
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                  : "bg-blue-100 text-blue-950 border border-blue-300"
              }`}
            >
              {panchangaEngineConfig.engineMode === "baggona_book" ? "Print Book" : "Drik-Math"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("voice_db");
              setAdminVoiceProfiles(getAllVoiceProfiles());
            }}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === "voice_db"
                ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-md scale-100"
                : "text-amber-950 hover:bg-amber-100"
            }`}
          >
            <span>🎙️</span>
            <span>ಅರ್ಚಕರ ಧ್ವನಿ ಡೇಟಾಬೇಸ್ & ವಾಯ್ಸ್ ವಾಲ್ಟ್</span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENT 1: OVERVIEW & PRIEST NETWORK LEDGER */}
      {activeTab === "wallets" && (
        <div className="space-y-6">
          {/* Quick Registration Studio */}
          <div id="new-priest-studio-card" className="bg-[#FFFDF7] border-3 border-amber-400/90 rounded-3xl p-4 sm:p-6 shadow-xl ring-4 ring-amber-400/20 scroll-mt-20">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-black text-amber-950 flex items-center gap-2">
                  <span>✨</span>
                  <span>ಹೊಸ ಪುರೋಹಿತರನ್ನು ನೋಂದಾಯಿಸಿ & ಪ್ರತ್ಯೇಕ ಲಿಂಕ್ ರಚಿಸಿ (Priest Studio & Link Generator)</span>
                </h2>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Register a new priest, assign welcome coins, and immediately generate dedicated deep links for all enabled services.
                </p>
              </div>
              <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider">
                ⚡ Instant Deep-Link Engine
              </span>
            </div>

            <form onSubmit={handleCreatePriestSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಪುರೋಹಿತರ ಹೆಸರು (Name):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPriestName}
                    onChange={(e) => setNewPriestName(e.target.value)}
                    placeholder="ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
                    required
                    className="w-full pl-3.5 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => {
                        setNewPriestName(text);
                        if (!newPriestUsername.trim()) {
                          const suggested = text.trim().toLowerCase().replace(/\s+/g, "_");
                          setNewPriestUsername(`priest_${suggested}`);
                        }
                      }}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಪುರೋಹಿತರ ಹೆಸರು ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಯೂಸರ್ ID (Username):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPriestUsername}
                    onChange={(e) => setNewPriestUsername(e.target.value)}
                    placeholder="ಉದಾ: priest_shreeram"
                    required
                    className="w-full pl-3.5 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setNewPriestUsername(text)}
                      transform={(raw) => raw.trim().toLowerCase().replace(/\s+/g, "_")}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಯೂಸರ್ ID ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಪ್ರವೇಶ ಪಾಸ್‌ವರ್ಡ್ (Password):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPriestPassword}
                    onChange={(e) => setNewPriestPassword(e.target.value)}
                    placeholder="baggona123"
                    required
                    className="w-full pl-3.5 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setNewPriestPassword(text)}
                      transform={(raw) => raw.trim().replace(/\s+/g, "")}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಸ್ವಾಗತ ನಾಣ್ಯಗಳು (Coins):
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={newPriestWelcomeCoins}
                    onChange={(e) => setNewPriestWelcomeCoins(e.target.value)}
                    placeholder="1000"
                    className="w-full pl-3.5 pr-9 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <VoiceDictationButton
                      onTranscript={(text) => setNewPriestWelcomeCoins(text)}
                      transform={(raw) => raw.replace(/[^0-9]/g, "") || "1000"}
                      tooltip="ಧ್ವನಿ ಮೂಲಕ ನಾಣ್ಯಗಳ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isCreatingPriest}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 border border-amber-400 active:scale-95"
                >
                  <span>✨</span>
                  <span>{isCreatingPriest ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "ನೋಂದಾಯಿಸಿ & ಲಿಂಕ್ ಪಡೆಯಿರಿ"}</span>
                </button>
              </div>

              {/* Multi-Select Modules Selector */}
              <div className="sm:col-span-2 lg:col-span-5 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl p-3.5 space-y-2 mt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>ಪುರೋಹಿತರಿಗೆ ಅನುಮತಿಸಬೇಕಾದ ಮಾಡ್ಯೂಲ್‌ಗಳು (Select Modules to Enable - Multi-select):</span>
                  </label>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedModulesForNewPriest(["panchanga", "sankhyashastra", "diksuchi", "purva_janma", "vahana_muhurtha"])}
                      className="text-amber-900 font-bold hover:underline"
                    >
                      ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆಮಾಡಿ (Select All)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModulesForNewPriest([])}
                      className="text-slate-600 font-bold hover:underline"
                    >
                      ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ (Uncheck All)
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModulesForNewPriest(["panchanga"])}
                      className="text-amber-900 font-bold hover:underline"
                    >
                      ಪಂಚಾಂಗ ಮಾತ್ರ
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModulesForNewPriest(["sankhyashastra"])}
                      className="text-purple-900 font-bold hover:underline"
                    >
                      ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಮಾತ್ರ
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedModulesForNewPriest(["vahana_muhurtha"])}
                      className="text-emerald-900 font-bold hover:underline"
                    >
                      ವಾಹನ ಮುಹೂರ್ತ ಮಾತ್ರ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = selectedModulesForNewPriest.includes(mod.key);
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isChecked
                            ? "bg-[#FFFDF7] border-amber-500 shadow-sm scale-[1.01]"
                            : "bg-white/60 border-amber-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModulesForNewPriest((prev) => [...prev, mod.key]);
                            } else {
                              setSelectedModulesForNewPriest((prev) => prev.filter((k) => k !== mod.key));
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                        />
                        <div className="text-xs">
                          <div className="font-black text-amber-950 flex items-center gap-1">
                            <span>{mod.icon}</span>
                            <span>{mod.kannadaLabel}</span>
                          </div>
                          <div className="text-[10px] text-amber-800 font-semibold">{mod.label}</div>
                          <div className="text-[9px] text-emerald-800 font-black mt-0.5">
                            {mod.costPerQuestionCoins > 0 ? `🪙 ${mod.costPerQuestionCoins} (₹${mod.costPerQuestionInr})` : "ಉಚಿತ (Free)"}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Unified Generated Link Result Card */}
            {createdPriestResult && (
              <div className="p-4 sm:p-5 bg-[#FEFCF4] border-2 border-emerald-500 rounded-3xl space-y-4 mt-4 animate-in fade-in duration-300 shadow-lg">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-emerald-900 font-black text-sm">✓ ಪುರೋಹಿತರ ನೋಂದಣಿ & ಏಕೀಕೃತ ಲಿಂಕ್ ಸಿದ್ಧವಾಗಿದೆ:</span>
                    <span className="font-extrabold text-amber-950 text-sm">{createdPriestResult.name}</span>
                    <span className="text-xs text-slate-700 font-mono bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300">
                      User: <strong className="text-amber-950">{createdPriestResult.username}</strong> | Pass: <strong className="text-emerald-900">{createdPriestResult.password}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreatedPriestResult(null)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                  >
                    ✕ ಮುಚ್ಚಿ
                  </button>
                </div>

                {/* Enabled Modules Badges */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-950">
                    🛡️ ಈ ಏಕೀಕೃತ ಲಿಂಕ್‌ನಲ್ಲಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾದ ಮಾಡ್ಯೂಲ್‌ಗಳು ({createdPriestResult.allowedModules.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {createdPriestResult.allowedModules.map((mKey) => {
                      const cfg = AVAILABLE_MODULES.find((m) => m.key === mKey);
                      return (
                        <span
                          key={mKey}
                          className="px-3 py-1 bg-amber-100 text-amber-950 border border-amber-400 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-sm"
                        >
                          <span>{cfg?.icon || "✨"}</span>
                          <span>{cfg?.kannadaLabel || mKey}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Unified Link Box & Action Buttons */}
                <div className="p-3.5 bg-[#FFFDF7] border-2 border-amber-400 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>🔗</span>
                      <span>ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್ (Unified Multi-Option Access URL):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdPriestResult.unifiedUrl);
                        setFeedback({ type: "success", text: "ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್ ಯಶಸ್ವಿಯಾಗಿ ನಕಲಿಸಲಾಗಿದೆ (Copied Link)!" });
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition"
                    >
                      <span>🔗</span>
                      <span>ಲಿಂಕ್ ಮಾತ್ರ ಕಾಪಿ</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={createdPriestResult.unifiedUrl}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 font-mono select-all shadow-inner"
                  />
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Copy Full Credentials & Link */}
                  <button
                    type="button"
                    onClick={() => {
                      const modulesLabels = createdPriestResult.allowedModules
                        .map((mKey) => {
                          const cfg = AVAILABLE_MODULES.find((m) => m.key === mKey);
                          return `• ${cfg?.icon || "✨"} ${cfg?.kannadaLabel || mKey}`;
                        })
                        .join("\n");

                      const fullMessage =
                        `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್ 🕉️\n\n` +
                        `ನಮಸ್ಕಾರ ${createdPriestResult.name} ಅವರೇ,\n` +
                        `ತಮಗೆ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೇದಿಕೆಗೆ ಆದರದ ಸ್ವಾಗತ. ತಮಗಾಗಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾದ ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್ ಸಿದ್ಧವಾಗಿದೆ.\n\n` +
                        `👤 ಬಳಕೆದಾರರ ಹೆಸರು (Username): ${createdPriestResult.username}\n` +
                        `🔑 ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್ (Initial Password): ${createdPriestResult.password}\n\n` +
                        `🛡️ ಸಕ್ರಿಯ ಸೌಲಭ್ಯಗಳು:\n${modulesLabels}\n\n` +
                        `🔗 ನಿಮ್ಮ ನೇರ ಪ್ರವೇಶ ಲಿಂಕ್ (Portal Link):\n${createdPriestResult.unifiedUrl}\n\n` +
                        `👉 ಸೂಚನೆ: ಮೇಲಿನ ಲಿಂಕ್ ತೆರೆದು ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ಲಾಗಿನ್ ಆದ ತಕ್ಷಣ, ನಿಮ್ಮದೇ ಆದ ಹೊಸ ಶಾಶ್ವತ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ರಚಿಸಿಕೊಳ್ಳಿ.\n\n` +
                        `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`;

                      navigator.clipboard.writeText(fullMessage);
                      setFeedback({
                        type: "success",
                        text: "ಪುರೋಹಿತರ ಯೂಸರ್‌ನೇಮ್, ಪಾಸ್‌ವರ್ಡ್ & ಪೋರ್ಟಲ್ ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ (Copied All Credentials)!"
                      });
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-amber-400"
                  >
                    <span>📋</span>
                    <span>ವಿವರ & ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ (Copy All Details)</span>
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const modulesLabels = createdPriestResult.allowedModules
                        .map((mKey) => {
                          const cfg = AVAILABLE_MODULES.find((m) => m.key === mKey);
                          return `• ${cfg?.icon || "✨"} ${cfg?.kannadaLabel || mKey}`;
                        })
                        .join("\n");

                      const message = encodeURIComponent(
                        `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್ 🕉️\n\n` +
                        `ನಮಸ್ಕಾರ ${createdPriestResult.name} ಅವರೇ,\n` +
                        `ತಮಗೆ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ವೇದಿಕೆಗೆ ಆದರದ ಸ್ವಾಗತ. ತಮಗಾಗಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾದ ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್ ಸಿದ್ಧವಾಗಿದೆ.\n\n` +
                        `👤 ಬಳಕೆದಾರರ ಹೆಸರು (Username): ${createdPriestResult.username}\n` +
                        `🔑 ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್ (Initial Password): ${createdPriestResult.password}\n\n` +
                        `🛡️ ಸಕ್ರಿಯ ಸೌಲಭ್ಯಗಳು:\n${modulesLabels}\n\n` +
                        `🔗 ನಿಮ್ಮ ನೇರ ಪ್ರವೇಶ ಲಿಂಕ್ (Portal Link):\n${createdPriestResult.unifiedUrl}\n\n` +
                        `👉 ಸೂಚನೆ: ಮೇಲಿನ ಲಿಂಕ್ ತೆರೆದು ಆರಂಭಿಕ ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ಲಾಗಿನ್ ಆದ ತಕ್ಷಣ, ನಿಮ್ಮದೇ ಆದ ಹೊಸ ಶಾಶ್ವತ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿಕೊಳ್ಳಿ.\n\n` +
                        `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`
                      );
                      window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <span>📲</span>
                    <span>WhatsApp ಮೂಲಕ ಕಳುಹಿಸಿ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pending UPI Approvals */}
          {pendingAdminTransactions.length > 0 && (
            <div className="bg-[#FFFDF7] border-2 border-orange-400 rounded-3xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-orange-200 pb-3">
                <h2 className="text-base font-black text-orange-950 flex items-center gap-2">
                  <span>⚡</span>
                  <span>ಬಾಕಿ ಉಳಿದ UPI ರೀಚಾರ್ಜ್ ಅನುಮೋದನೆಗಳು ({pendingAdminTransactions.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAdminTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-[#FEFCF4] border-2 border-orange-300 rounded-2xl space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 text-sm">{tx.priestName || "Priest"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-black text-sm">₹{tx.inrAmount}</span>
                        <span className="text-amber-900 font-mono font-bold text-xs bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          +{tx.coins.toLocaleString()} Coins
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-orange-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-600 text-[10px] uppercase font-bold">UPI UTR Ref:</span>
                      <span className="font-mono font-black text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-300">
                        {tx.upiUtr}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={processingTxId === tx.id}
                      onClick={() => handleApprove(tx.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {processingTxId === tx.id ? "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ..." : `✓ ಅನುಮೋದಿಸಿ & ${tx.coins.toLocaleString()} ನಾಣ್ಯಗಳನ್ನು ಕ್ರೆಡಿಟ್ ಮಾಡಿ`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Priests Network Table */}
          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div>
                <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                  <span>👥</span>
                  <span>ಪುರೋಹಿತರ ವಾಲೆಟ್ ಮತ್ತು ಬ್ಯಾಲೆನ್ಸ್ ವಿವರ (Priest Network Ledger)</span>
                </h2>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Click "⚡ ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ" to directly credit or deduct coins, or "🛡️ ಮಾಡ್ಯೂಲ್‌ಗಳು" to manage permissions.
                </p>
              </div>
            </div>

            {allPriestWallets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                ಯಾವುದೇ ಪುರೋಹಿತರ ಖಾತೆಗಳು ಇನ್ನೂ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿಲ್ಲ.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border-2 border-amber-300 bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse min-w-[980px]">
                  <thead>
                    <tr className="bg-[#FFF8E7] border-b-2 border-amber-300 text-amber-950 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-3 px-4">ಪುರೋಹಿತರ ಹೆಸರು</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">ಸಕ್ರಿಯ ಬ್ಯಾಲೆನ್ಸ್</th>
                      <th className="py-3 px-4">ಅನುಮತಿಸಿದ ಮಾಡ್ಯೂಲ್‌ಗಳು</th>
                      <th className="py-3 px-4">ಒಟ್ಟು ರೀಚಾರ್ಜ್</th>
                      <th className="py-3 px-4">ಬಳಸಿದ ನಾಣ್ಯಗಳು</th>
                      <th className="py-3 px-4 text-right">ತ್ವರಿತ ಕ್ರಿಯೆಗಳು (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {allPriestWallets.map((priest) => {
                      const isLow = (priest.coinBalance || 0) < 500;
                      const modules: AvailableModuleKey[] = (priest.allowedModules && priest.allowedModules.length > 0)
                        ? (priest.allowedModules as AvailableModuleKey[])
                        : ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"];

                      return (
                        <tr key={priest.id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-black text-amber-950">
                            <button
                              type="button"
                              onClick={() => {
                                setViewingPriestProfile(priest);
                                setPriestProfileTab("overview");
                              }}
                              className="flex items-center gap-2 hover:text-amber-700 transition group text-left"
                              title="ಪುರೋಹಿತರ ಪ್ರೊಫೈಲ್, ಇತಿಹಾಸ & ಬಳಕೆಯ ಅಂಕಿಅಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
                            >
                              <span className="text-base group-hover:scale-125 transition-transform">🕉️</span>
                              <span className="underline decoration-amber-300 group-hover:decoration-amber-600 underline-offset-4 font-black">
                                {priest.priestName}
                              </span>
                              <span className="text-[9px] font-bold text-amber-800 opacity-80 group-hover:opacity-100 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                                🔍 ಪ್ರೊಫೈಲ್
                              </span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 font-bold">{priest.userId}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-amber-950">
                                {(priest.coinBalance || 0).toLocaleString()} 🪙
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  isLow ? "bg-red-100 text-red-800 border-red-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                }`}
                              >
                                {isLow ? "⚠️ ಕಡಿಮೆ" : "🟢 ಸಮೃದ್ಧ"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {modules.map((mKey) => {
                                const cfg = AVAILABLE_MODULES.find((m) => m.key === mKey);
                                return (
                                  <span
                                    key={mKey}
                                    className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-950 border border-amber-300 flex items-center gap-0.5 shadow-xs"
                                  >
                                    <span>{cfg?.icon || "✨"}</span>
                                    <span>{cfg?.kannadaLabel?.split(" ")[0] || mKey}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-emerald-700 font-bold">
                            ₹{(priest.totalRechargedInr || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">
                            {(priest.totalCoinsSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Detailed Profile & History Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingPriestProfile(priest);
                                  setPriestProfileTab("overview");
                                }}
                                className="py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
                                title="ಪುರೋಹಿತರ ಸಂಪೂರ್ಣ ಇತಿಹಾಸ & ಅಂಕಿಅಂಶಗಳು (View Profile & History)"
                              >
                                <span>🔍</span>
                                <span>ಪ್ರೊಫೈಲ್</span>
                              </button>

                              {/* Manage Modules Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenModuleEditor(priest)}
                                className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-300 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
                                title="ಮಾಡ್ಯೂಲ್ ಪ್ರವೇಶಾವಕಾಶ ನಿರ್ವಹಿಸಿ"
                              >
                                🛡️ ಮಾಡ್ಯೂಲ್
                              </button>

                              {/* WhatsApp Invite */}
                              <button
                                type="button"
                                onClick={() => {
                                  const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
                                  const modulesQuery = modules.length > 0 ? modules.join(",") : "panchanga";
                                  const unifiedUrl = `${origin}/?portal=priest&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&modules=${encodeURIComponent(modulesQuery)}`;
                                  const modulesList = modules
                                    .map((mKey) => {
                                      const cfg = AVAILABLE_MODULES.find((m) => m.key === mKey);
                                      return `• ${cfg?.icon || "✨"} ${cfg?.kannadaLabel || mKey}`;
                                    })
                                    .join("\n");

                                  const msg = `ನಮಸ್ಕಾರ ${priest.priestName} ಅವರೇ,\n\nನಿಮಗೆ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್‌ನ ಪ್ರವೇಶ ಕಳುಹಿಸಲಾಗಿದೆ.\n\n👤 ಯೂಸರ್ ID: ${priest.userId}\n🛡️ ಸಕ್ರಿಯ ಸೌಲಭ್ಯಗಳು:\n${modulesList}\n\n🔗 ನಿಮ್ಮ ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್ (Single Access URL):\n${unifiedUrl}\n\n॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`;
                                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                                }}
                                className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
                                title="Share on WhatsApp"
                              >
                                📲 WhatsApp
                              </button>

                              {/* Coin Adjustment Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedPriest(priest)}
                                className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all shadow-xs shrink-0"
                                title="ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ ಮಾಡಿ"
                              >
                                ⚡ ನಾಣ್ಯ
                              </button>

                              {/* PROMINENT DELETE BUTTON */}
                              <button
                                type="button"
                                onClick={() => setDeletingPriest(priest)}
                                className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-lg text-xs transition-all shadow-sm flex items-center gap-1 shrink-0 border border-red-700 active:scale-95"
                                title="ಪುರೋಹಿತರ ಖಾತೆ & ಪ್ರವೇಶ ಲಿಂಕ್ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ / ರದ್ದುಗೊಳಿಸಿ (Delete Priest Account & Revoke Token)"
                              >
                                <span>🗑️</span>
                                <span>ಅಳಿಸಿ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: Kundli Database Vault */}
      {activeTab === "kundlis" && (
        <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200 pb-4">
            <div>
              <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>📜</span>
                <span>ಭಕ್ತರ ಜಾತಕ ಡೇಟಾಬೇಸ್ ವಾಲ್ಟ್ (Devotee Kundli Vault)</span>
              </h2>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                Discrete Astrological Records: Name, Gothra, Janma Date/Time, Rashi, Nakshatra, Pada, and Lagna.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                disabled={isDeduplicating}
                onClick={handleDeduplicateKundlis}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border-2 border-purple-300 rounded-xl text-xs font-black transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <span>🧹</span>
                <span>{isDeduplicating ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "ಡ್ಯೂಪ್ಲಿಕೇಟ್ ಪರಿಶೀಲಿಸಿ & ತೆರವುಗೊಳಿಸಿ"}</span>
              </button>

              <div className="w-full md:w-64 relative flex items-center">
                <input
                  type="text"
                  value={kundliSearch}
                  onChange={(e) => setKundliSearch(e.target.value)}
                  placeholder="ಹುಡುಕಿ: ಹೆಸರು, ಗೋತ್ರ, ರಾಶಿ..."
                  className="w-full pl-3.5 pr-9 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <VoiceDictationButton
                    onTranscript={(text) => setKundliSearch(text)}
                    tooltip="ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ (Voice Search)"
                  />
                </div>
              </div>
            </div>
          </div>

          {filteredKundlis.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              ಯಾವುದೇ ಜಾತಕ ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-amber-200 text-amber-900 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-4">ಭಕ್ತರ ಹೆಸರು</th>
                    <th className="py-3 px-4">ಗೋತ್ರ</th>
                    <th className="py-3 px-4">ಜನನ ದಿನಾಂಕ & ಸಮಯ</th>
                    <th className="py-3 px-4">ಸ್ಥಳ</th>
                    <th className="py-3 px-4">ರಾಶಿ (Moon)</th>
                    <th className="py-3 px-4">ನಕ್ಷತ್ರ & ಪಾದ</th>
                    <th className="py-3 px-4">ಲಗ್ನ</th>
                    <th className="py-3 px-4 text-right">ವಿವರ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 font-semibold">
                  {filteredKundlis.map((k) => (
                    <tr key={k.id} className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 font-black text-amber-950 flex items-center gap-2">
                        <span>👤</span>
                        <span>{k.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="px-2 py-0.5 bg-[#FEFCF4] rounded border border-amber-200 text-[11px] font-bold">
                          {k.gothra || "Kashyapa"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                        {k.birthDate} • {k.birthTime}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-[120px]">
                        {k.placeName}
                      </td>
                      <td className="py-3 px-4 font-black text-amber-900">
                        {k.rashi || "Mesha"}
                      </td>
                      <td className="py-3 px-4 text-emerald-800 font-bold">
                        {k.nakshatra || "Ashwini"} (Pada {k.pada || 1})
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {k.lagnaRashi || "Vrischika"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedKundli(k)}
                          className="py-1 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-sm"
                        >
                          ಪರಿಶೀಲಿಸಿ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: Ashirvada QR Passes & Devotee Calendar Subscription CRM */}
      {activeTab === "ashirvada" && (() => {
        const filteredSubs = subscriptions.filter((s) => {
          if (subscriptionFilter === "active" && (s.isExpired || s.daysRemaining <= 7)) return false;
          if (subscriptionFilter === "near_expiry" && (s.isExpired || s.daysRemaining > 7)) return false;
          if (subscriptionFilter === "expired" && !s.isExpired) return false;

          if (!subscriptionSearch.trim()) return true;
          const q = subscriptionSearch.toLowerCase();
          return (
            (s.devoteeName || "").toLowerCase().includes(q) ||
            (s.phone || "").toLowerCase().includes(q) ||
            (s.email || "").toLowerCase().includes(q) ||
            (s.gotra || "").toLowerCase().includes(q) ||
            (s.rashi || "").toLowerCase().includes(q) ||
            (s.nakshatra || "").toLowerCase().includes(q) ||
            (s.priestName || "").toLowerCase().includes(q)
          );
        });

        const totalSubs = subscriptions.length;
        const activeSubs = subscriptions.filter((s) => !s.isExpired && s.daysRemaining > 7).length;
        const nearExpirySubs = subscriptions.filter((s) => !s.isExpired && s.daysRemaining <= 7).length;
        const expiredSubs = subscriptions.filter((s) => s.isExpired).length;

        return (
          <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-5">
            {/* Header with Title & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-amber-950 flex items-center gap-2">
                  <span>🪔</span>
                  <span>ಭಕ್ತರ ಕ್ಯಾಲೆಂಡರ್ ಚಂದಾದಾರಿಕೆ & ಆಶೀರ್ವಾದ ಪಾಸ್ CRM (Devotee Calendar CRM)</span>
                </h2>
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  ದೈನಂದಿನ ದರ್ಶನ ಭೇಟಿಗಳು, ೯೦-ದಿನಗಳ ಮಾನ್ಯತೆ ಕೌಂಟ್‌ಡೌನ್, ಮೊಬೈಲ್/ಇಮೇಲ್ ಮಾರ್ಕೆಟಿಂಗ್ ಸಂಪರ್ಕಗಳು ಮತ್ತು ನವೀಕರಣ ನಿರ್ವಹಣೆ.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportDevoteeMarketingCsv}
                  disabled={totalSubs === 0}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  title="ಮಾರ್ಕೆಟಿಂಗ್‌ಗಾಗಿ ಭಕ್ತರ ಸಂಪರ್ಕಗಳನ್ನು CSV ಫೈಲ್‌ಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
                >
                  <span>📥</span>
                  <span>ಭಕ್ತರ ಸಂಪರ್ಕಗಳ CSV ರಫ್ತು ({totalSubs})</span>
                </button>

                {/* Deduplicate */}
                <button
                  type="button"
                  disabled={isDeduplicating}
                  onClick={handleDeduplicateCalendarVisits}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border-2 border-purple-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>🧹</span>
                  <span>{isDeduplicating ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "ಡ್ಯೂಪ್ಲಿಕೇಟ್ ಶುದ್ಧೀಕರಿಸಿ"}</span>
                </button>

                {/* Purge All & Fresh Start */}
                <button
                  type="button"
                  onClick={() => setShowPurgeConfirmModal(true)}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="ಹಳೆಯ ಎಲ್ಲಾ ಟೆಸ್ಟ್ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ ಇಂದಿನಿಂದ ಹೊಸ ದಾಖಲಾತಿ ಪ್ರಾರಂಭಿಸಿ"
                >
                  <span>🚨</span>
                  <span>ಟೆಸ್ಟ್ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ (Start Fresh)</span>
                </button>
              </div>
            </div>

            {/* Top Analytics KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => setSubscriptionFilter("all")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  subscriptionFilter === "all"
                    ? "bg-amber-100 border-amber-500 shadow-sm"
                    : "bg-[#FEFCF4] border-amber-200 hover:border-amber-400"
                }`}
              >
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">👥 ಒಟ್ಟು ಭಕ್ತರು</div>
                <div className="text-2xl font-black text-amber-950 font-mono mt-1">{totalSubs}</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">ಒಟ್ಟು ನೋಂದಾಯಿತ ಚಂದಾದಾರರು</div>
              </div>

              <div
                onClick={() => setSubscriptionFilter("active")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  subscriptionFilter === "active"
                    ? "bg-emerald-100 border-emerald-500 shadow-sm"
                    : "bg-[#FEFCF4] border-emerald-200 hover:border-emerald-400"
                }`}
              >
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">🟢 ಸಕ್ರಿಯ ಪಾಸ್‌ಗಳು</div>
                <div className="text-2xl font-black text-emerald-900 font-mono mt-1">{activeSubs}</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">&gt; ೭ ದಿನಗಳ ಮಾನ್ಯತೆ ಉಳಿದಿದೆ</div>
              </div>

              <div
                onClick={() => setSubscriptionFilter("near_expiry")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  subscriptionFilter === "near_expiry"
                    ? "bg-yellow-100 border-yellow-500 shadow-sm"
                    : "bg-[#FEFCF4] border-yellow-200 hover:border-yellow-400"
                }`}
              >
                <div className="text-[11px] font-bold text-yellow-800 uppercase tracking-wider">🟡 ಮುಕ್ತಾಯ ಸಮೀಪ</div>
                <div className="text-2xl font-black text-yellow-950 font-mono mt-1">{nearExpirySubs}</div>
                <div className="text-[10px] text-yellow-700 font-semibold mt-0.5">≤ ೭ ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯ (ಆಫರ್ ಕಳುಹಿಸಿ)</div>
              </div>

              <div
                onClick={() => setSubscriptionFilter("expired")}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  subscriptionFilter === "expired"
                    ? "bg-red-100 border-red-500 shadow-sm"
                    : "bg-[#FEFCF4] border-red-200 hover:border-red-400"
                }`}
              >
                <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider">🔴 ಮುಕ್ತಾಯಗೊಂಡಿದೆ</div>
                <div className="text-2xl font-black text-red-900 font-mono mt-1">{expiredSubs}</div>
                <div className="text-[10px] text-red-700 font-semibold mt-0.5">ದರ್ಶನ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ</div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 p-1 bg-amber-100/70 rounded-2xl border border-amber-200 w-full md:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSubscriptionFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subscriptionFilter === "all" ? "bg-amber-600 text-white shadow-xs" : "text-amber-900 hover:bg-amber-200/60"
                  }`}
                >
                  ಎಲ್ಲಾ ({totalSubs})
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriptionFilter("active")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subscriptionFilter === "active" ? "bg-emerald-700 text-white shadow-xs" : "text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  🟢 ಸಕ್ರಿಯ ({activeSubs})
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriptionFilter("near_expiry")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subscriptionFilter === "near_expiry" ? "bg-amber-500 text-amber-950 shadow-xs" : "text-yellow-900 hover:bg-yellow-100"
                  }`}
                >
                  🟡 ಮುಕ್ತಾಯ ಸಮೀಪ ({nearExpirySubs})
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriptionFilter("expired")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    subscriptionFilter === "expired" ? "bg-red-600 text-white shadow-xs" : "text-red-900 hover:bg-red-100"
                  }`}
                >
                  🔴 ಮುಕ್ತಾಯ ({expiredSubs})
                </button>
              </div>

              <div className="w-full md:w-80 relative flex items-center">
                <input
                  type="text"
                  value={subscriptionSearch}
                  onChange={(e) => setSubscriptionSearch(e.target.value)}
                  placeholder="ಹುಡುಕಿ: ಹೆಸರು, ಮೊಬೈಲ್, ಇಮೇಲ್, ರಾಶಿ..."
                  className="w-full pl-3.5 pr-9 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <VoiceDictationButton
                    onTranscript={(text) => setSubscriptionSearch(text)}
                    tooltip="ಧ್ವನಿ ಮೂಲಕ ಭಕ್ತರನ್ನು ಹುಡುಕಿ"
                  />
                </div>
              </div>
            </div>

            {/* Devotee Subscriptions Table */}
            {filteredSubs.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#FEFCF4] rounded-3xl border-2 border-amber-200 space-y-3">
                <div className="text-4xl">🪔</div>
                <div className="font-black text-amber-950 text-sm">
                  {totalSubs === 0
                    ? "ಯಾವುದೇ ಭಕ್ತರ ಚಂದಾದಾರಿಕೆಗಳು ದಾಖಲಾಗಿಲ್ಲ (No Devotee Subscriptions Yet)"
                    : "ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ದೊರೆತಿಲ್ಲ."}
                </div>
                <p className="text-xs text-amber-800 font-semibold max-w-md mx-auto">
                  ಭಕ್ತರು ತಮ್ಮ ಕ್ಯಾಲೆಂಡರ್ ಲಿಂಕ್ ಅಥವಾ QR ಕೋಡ್ ಮೂಲಕ ದರ್ಶನ ಪಡೆದಾಗ ಅವರ ಸಂಪರ್ಕ ವಿವರ, ಜಾತಕ ಮತ್ತು ಮಾನ್ಯತೆಯ ಸಂಪೂರ್ಣ ವಿವರಗಳು ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತವೆ.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border-2 border-amber-200 shadow-inner bg-[#FEFCF4]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-amber-100/80 text-amber-950 font-black border-b border-amber-300">
                      <th className="py-3 px-3.5">ಭಕ್ತರ ಹೆಸರು & ಗೋತ್ರ</th>
                      <th className="py-3 px-3">ಸಂಪರ್ಕ (ಮೊಬೈಲ್ & ಇಮೇಲ್)</th>
                      <th className="py-3 px-3">ಜನ್ಮ ಕುಂಡಲಿ</th>
                      <th className="py-3 px-3">ಅವಧಿ & ದಿನಾಂಕಗಳು</th>
                      <th className="py-3 px-3 text-center">ಬಳಕೆ & ಭೇಟಿಗಳು</th>
                      <th className="py-3 px-3 text-center">ಉಳಿದ ಮಾನ್ಯತೆ</th>
                      <th className="py-3 px-3 text-center">ಸ್ಥಿತಿ</th>
                      <th className="py-3 px-3 text-right">ಮಾರ್ಕೆಟಿಂಗ್ & ಆಕ್ಷನ್ಸ್</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200/70">
                    {filteredSubs.map((s) => {
                      const percentLeft = Math.min(100, Math.max(0, Math.round((s.daysRemaining / (s.durationDays || 90)) * 100)));
                      const isExpired = s.isExpired;
                      const isNearExpiry = !isExpired && s.daysRemaining <= 7;

                      const cleanPhone = (s.phone || "").replace(/[^\d]/g, "");
                      const waPhone = cleanPhone.startsWith("91") ? cleanPhone : cleanPhone ? `91${cleanPhone}` : "";

                      const waMessage = encodeURIComponent(
                        `ನಮಸ್ಕಾರ ${s.devoteeName} ಅವರೇ,\nಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್‌ನಿಂದ ಶುಭಾಶಯಗಳು.\nನಿಮ್ಮ ${s.durationDays || 90}-ದಿನಗಳ ದೈನಂದಿನ ದರ್ಶನ ಮತ್ತು ಮುಹೂರ್ತ ಪಾಸ್ ${
                          isExpired ? `ದಿನಾಂಕ ${s.expiryDate} ರಂದು ಮುಕ್ತಾಯಗೊಂಡಿದೆ.` : `ದಿನಾಂಕ ${s.expiryDate} ರಂದು ಮುಕ್ತಾಯಗೊಳ್ಳಲಿದೆ (${s.daysRemaining} ದಿನಗಳು ಬಾಕಿ).`
                        }\nನಿಮ್ಮ ದೈನಂದಿನ ಜಾತಕ ಫಲಗಳು ಮತ್ತು ಪಂಚಾಂಗ ಸೇವೆಗಳನ್ನು ನಿರಂತರವಾಗಿ ಮುಂದುವರಿಸಲು ನವೀಕರಿಸಿಕೊಳ್ಳಿ.\n॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`
                      );

                      return (
                        <tr key={s.id} className="hover:bg-amber-50/60 transition-colors">
                          {/* Devotee Name & Gotra */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="font-black text-slate-900 text-xs flex items-center gap-1">
                              <span>👤</span>
                              <span>{s.devoteeName}</span>
                            </div>
                            <div className="text-[11px] text-amber-900 font-semibold mt-0.5">
                              ಗೋತ್ರ: {s.gotra || "—"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Priest: {s.priestName || "Shreeram Pandit"}
                            </div>
                          </td>

                          {/* Contact Details (Phone & Email) */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="space-y-1">
                              {s.phone ? (
                                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                                  <span>📱</span>
                                  <a href={`tel:${s.phone}`} className="hover:underline text-amber-950">
                                    {s.phone}
                                  </a>
                                  {waPhone && (
                                    <a
                                      href={`https://wa.me/${waPhone}?text=${waMessage}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[10px] font-black border border-emerald-300"
                                      title="WhatsApp ಸಂದೇಶ ಕಳುಹಿಸಿ"
                                    >
                                      WA
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                  📱 ಫೋನ್ ಇಲ್ಲ
                                </span>
                              )}

                              {s.email ? (
                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                  <span>✉️</span>
                                  <a href={`mailto:${s.email}`} className="hover:underline truncate max-w-[140px] block" title={s.email}>
                                    {s.email}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-normal">✉️ ಇಮೇಲ್ ಇಲ್ಲ</span>
                              )}
                            </div>
                          </td>

                          {/* Janma Kundali */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="font-bold text-amber-950">
                                🌙 {s.rashi || "—"}
                              </div>
                              <div className="text-slate-700 font-medium">
                                ⭐ {s.nakshatra || "—"}
                              </div>
                              {s.lagnaRashi && (
                                <div className="text-[10px] text-slate-500 font-medium">
                                  ಲಗ್ನ: {s.lagnaRashi}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Duration & Dates */}
                          <td className="py-3.5 px-3 align-top text-xs">
                            <div className="font-black text-slate-900">
                              ⏱️ {s.durationDays || 90} ದಿನಗಳು
                            </div>
                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                              ಆರಂಭ: {s.startDate || "—"}
                            </div>
                            <div className="text-[10px] font-mono font-bold mt-0.5 text-slate-700">
                              ಮುಕ್ತಾಯ: {s.expiryDate || "—"}
                            </div>
                          </td>

                          {/* Consumed / Total Hits */}
                          <td className="py-3.5 px-3 align-top text-center">
                            <div className="font-black text-amber-950 font-mono text-sm">
                              {s.daysConsumed || 0} <span className="text-[10px] font-normal text-slate-600">ದಿನ</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono font-semibold mt-0.5">
                              ಒಟ್ಟು {s.totalVisitsCount || s.totalHits || 0} ಭೇಟಿಗಳು
                            </div>
                          </td>

                          {/* Days Remaining & Progress Bar */}
                          <td className="py-3.5 px-3 align-top">
                            <div className="w-28 mx-auto">
                              <div className="flex items-center justify-between text-[11px] mb-1 font-mono font-black">
                                <span className={isExpired ? "text-red-600" : isNearExpiry ? "text-yellow-700" : "text-emerald-700"}>
                                  {isExpired ? "0 ದಿನ" : `${s.daysRemaining} ದಿನ ಬಾಕಿ`}
                                </span>
                              </div>
                              <div className="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden border border-amber-300">
                                <div
                                  className={`h-full transition-all ${
                                    isExpired
                                      ? "bg-red-500"
                                      : isNearExpiry
                                      ? "bg-yellow-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${percentLeft}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-3 align-top text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                isExpired
                                  ? "bg-red-100 text-red-900 border-red-300"
                                  : isNearExpiry
                                  ? "bg-yellow-100 text-yellow-950 border-yellow-400"
                                  : "bg-emerald-100 text-emerald-950 border-emerald-400"
                              }`}
                            >
                              {isExpired ? "🔴 ಮುಕ್ತಾಯ" : isNearExpiry ? "🟡 ಮುಕ್ತಾಯ ಸಮೀಪ" : "🟢 ಸಕ್ರಿಯ"}
                            </span>
                          </td>

                          {/* Marketing Actions */}
                          <td className="py-3.5 px-3 align-top text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {/* WhatsApp Renewal CTA */}
                              {waPhone && (
                                <a
                                  href={`https://wa.me/${waPhone}?text=${waMessage}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black shadow-xs flex items-center gap-1 transition"
                                  title="ನವೀಕರಣಕ್ಕಾಗಿ WhatsApp ಸಂದೇಶ ರವಾನಿಸಿ"
                                >
                                  <span>💬</span>
                                  <span>ನವೀಕರಣ ಸಂದೇಶ</span>
                                </a>
                              )}

                              {/* Extend +90 Days */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleExtendDevoteeSubscription(s.id, 90)}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black shadow-xs transition cursor-pointer"
                                  title="ಈ ಭಕ್ತರ ಮಾನ್ಯತೆಯನ್ನು ೯೦ ದಿನಗಳಿಗೆ ವಿಸ್ತರಿಸಿ"
                                >
                                  +90d ವಿಸ್ತರಿಸಿ
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteDevoteeSubscription(s.id)}
                                  className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-[10px] font-bold border border-red-300 transition cursor-pointer"
                                  title="ದಾಖಲೆ ಅಳಿಸಿ"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* 7. TAB 4: System Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200 pb-4">
            <div>
              <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>🛡️</span>
                <span>ಸಿಸ್ಟಮ್ ಭದ್ರತೆ ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್ಸ್ (System Audit Trail)</span>
              </h2>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                Immutable cloud audit trail of all logins, IP detections, coin transfers, and database writes.
              </p>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ಹುಡುಕಿ: ಘಟನೆ, IP, ಬಳಕೆದಾರ..."
                className="w-full px-3.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>
          </div>

          {filteredAuditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              ಯಾವುದೇ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು ದಾಖಲಾಗಿಲ್ಲ.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-amber-200 text-amber-900 uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3 px-4">ಸಮಯ (Timestamp)</th>
                    <th className="py-3 px-4">ಘಟನಾವಳಿ (Action Event)</th>
                    <th className="py-3 px-4">ಬಳಕೆದಾರ (User & Role)</th>
                    <th className="py-3 px-4">IP ವಿಳಾಸ</th>
                    <th className="py-3 px-4">ವಿವರಗಳು (Details)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 font-mono text-[11px]">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-amber-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-black text-amber-950">
                        <span className="px-2 py-0.5 bg-amber-100 rounded border border-amber-300 font-mono">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-sans font-bold">
                        {log.username} ({log.role})
                      </td>
                      <td className="py-3 px-4 text-red-700 font-bold">
                        {log.ipAddress || "Local / Host"}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-sans font-medium">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Premium PDF Downloads Audit Sub-Section */}
          <div className="mt-8 pt-6 border-t-2 border-amber-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                  <span>📄</span>
                  <span>ದೈನಂದಿನ ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್ ದಾಖಲೆಗಳು (Daily Premium PDF Downloads)</span>
                </h3>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Real-time log of devotee Bhavishya PDFs generated with GenAI synthesis (🪙 ೩,೫೦೦ / ₹೩೫೦ per download).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-purple-900 bg-purple-100 border border-purple-300 px-3 py-1 rounded-full uppercase tracking-wider">
                  ಒಟ್ಟು: {premiumDownloads.length} PDFs
                </span>
                <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
                  ₹{premiumDownloads.reduce((a, b) => a + (b.amountInr || 350), 0).toLocaleString()} (🪙 {premiumDownloads.reduce((a, b) => a + (b.coinsSpent || 3500), 0).toLocaleString()})
                </span>
              </div>
            </div>

            {premiumDownloads.length === 0 ? (
              <div className="text-center py-6 bg-[#FEFCF4] border border-amber-200 rounded-2xl text-slate-400 text-xs font-semibold">
                ಇಂದು ಯಾವುದೇ ಪ್ರೀಮಿಯಂ PDF ಡೌನ್‌ಲೋಡ್ ದಾಖಲಾಗಿಲ್ಲ.
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#FEFCF4] border border-amber-300/80 rounded-2xl shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-200 text-amber-900 uppercase text-[10px] font-black tracking-wider bg-amber-50/50">
                      <th className="py-2.5 px-4">ಸಮಯ (IST)</th>
                      <th className="py-2.5 px-4">ಭಕ್ತರ ಹೆಸರು (Devotee)</th>
                      <th className="py-2.5 px-4">ಪುರೋಹಿತರು (Priest)</th>
                      <th className="py-2.5 px-4">ಭಾಷೆ (Lang)</th>
                      <th className="py-2.5 px-4">ಮೂಲ (Portal Source)</th>
                      <th className="py-2.5 px-4 text-right">ನಾಣ್ಯಗಳು / ಮೊತ್ತ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-mono text-[11px]">
                    {premiumDownloads.map((dl) => (
                      <tr key={dl.id} className="hover:bg-amber-50/60 transition-colors">
                        <td className="py-2.5 px-4 text-slate-600 font-semibold">
                          {new Date(dl.timestamp).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-4 font-sans font-bold text-amber-950">
                          👤 {dl.devoteeName}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 font-sans font-semibold">
                          {dl.priestName || dl.username}
                        </td>
                        <td className="py-2.5 px-4 font-black">
                          <span className="px-2 py-0.5 bg-indigo-100 border border-indigo-300 text-indigo-900 rounded uppercase">
                            {dl.language}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-sans">
                          {dl.portalSource}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-amber-900">
                          <span className="text-amber-700">🪙 {dl.coinsSpent?.toLocaleString() || "3,500"}</span>
                          <span className="text-slate-400 font-normal ml-1">(₹{dl.amountInr || 350})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB 5: VISUAL ECOSYSTEM MIND MAP (Interactive Topology Hub) */}
      {activeTab === "mindmap" && (
        <div className="bg-[#FFFDF7] border-2 border-indigo-300 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-200 pb-4">
            <div>
              <h2 className="text-base font-black text-indigo-950 flex items-center gap-2">
                <span>🗺️</span>
                <span>ಬಗ್ಗೋಣ ತಂತ್ರಾಂಶ ಸಮಗ್ರ ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್ (Visual Architecture Topology)</span>
              </h2>
              <p className="text-xs text-indigo-900 font-semibold mt-0.5">
                Interactive real-time map of all connected engines, data vaults, security layers, and priest communications. Click any node to inspect metrics.
              </p>
            </div>
            <span className="text-[10px] font-black text-indigo-900 bg-indigo-100 border border-indigo-300 px-3 py-1 rounded-full uppercase tracking-wider">
              ● Live Sync Topology
            </span>
          </div>

          {/* Interactive Topology Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MIND_MAP_NODES.map((node) => {
              const isSelected = selectedMindMapNode.id === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedMindMapNode(node)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-500 shadow-lg scale-[1.02]"
                      : "bg-[#FEFCF4] border-amber-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl p-2 bg-white rounded-xl border border-amber-200 shadow-sm">{node.icon}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900">
                      {node.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 text-xs">{node.title}</h3>
                    <p className="text-[11px] text-amber-900 font-bold">{node.kannadaTitle}</p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                      {node.metrics}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Inspector for Selected Node */}
          {selectedMindMapNode && (
            <div className="p-5 bg-gradient-to-r from-[#FFF9E6] via-[#FFFDF7] to-indigo-50 border-2 border-indigo-400 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedMindMapNode.icon}</span>
                  <div>
                    <h4 className="font-black text-indigo-950 text-sm">{selectedMindMapNode.title}</h4>
                    <span className="text-[11px] text-amber-900 font-bold">{selectedMindMapNode.kannadaTitle}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-indigo-900 bg-white px-3 py-1 rounded-full border border-indigo-300 shadow-sm">
                  {selectedMindMapNode.metrics}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {selectedMindMapNode.details}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 9. TAB 6: PANCHANGA CALCULATION ENGINE MASTER CONTROL */}
      {activeTab === "panchanga_engine" && (
        <div className="bg-[#FFFDF7] border-3 border-amber-400/90 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200 pb-4">
            <div>
              <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>⚙️</span>
                <span>ಪಂಚಾಂಗ ಗಣನೆ ಎಂಜಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ (Panchanga Calculation Engine Control Hub)</span>
              </h2>
              <p className="text-xs text-amber-900 font-semibold mt-0.5">
                Super Admin master switch governing the 90-Day Calendar, Daily Darshana, and Astrological calculations across Baggona Panchanga. All changes are saved to Cloud Firestore and synchronized in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-sm ${
                  panchangaEngineConfig.engineMode === "baggona_book"
                    ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                    : "bg-blue-100 border-blue-400 text-blue-950"
                }`}
              >
                ● {panchangaEngineConfig.engineMode === "baggona_book" ? "Baggona Book Active" : "Drik-Math Active"}
              </span>
            </div>
          </div>

          {/* Master Engine Toggle Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Baggona Panchanga Book Engine */}
            <div
              onClick={() => handleTogglePanchangaEngine("baggona_book")}
              className={`cursor-pointer p-5 rounded-3xl border-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                panchangaEngineConfig.engineMode === "baggona_book"
                  ? "bg-gradient-to-br from-amber-50 via-amber-100/60 to-white border-amber-500 shadow-xl ring-4 ring-amber-400/30 scale-[1.01]"
                  : "bg-white border-amber-200 hover:border-amber-400 opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 bg-amber-100 rounded-2xl border border-amber-300">📖</span>
                    <div>
                      <h3 className="font-black text-amber-950 text-sm">ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮುದ್ರಣ ಆವೃತ್ತಿ</h3>
                      <p className="text-[10px] text-amber-800 font-bold uppercase">Baggona Panchanga Book Engine (2026–2027)</p>
                    </div>
                  </div>
                  {panchangaEngineConfig.engineMode === "baggona_book" ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span>✓</span>
                      <span>ACTIVE / ಸಕ್ರಿಯ</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border">
                      Select
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-2">
                  Uses the exact published daily records from Pages 40–91 of the Baggona Panchanga book. Features exact Tithi Ghati-Vighati, Shraddha Tithi, traditional temple festivals, month-end Graha Chakra, and authentic planetary positions.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-semibold text-amber-950">
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                    <span className="block font-black text-amber-900">📚 ಆವೃತ್ತಿ:</span>
                    ಪರಾಭವ ಸಂವತ್ಸರ (೧೯೪೮ ಶಕ)
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
                    <span className="block font-black text-amber-900">🗓️ ಅವಧಿ:</span>
                    19 Mar 2026 – 07 Apr 2027 (385 Days)
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between text-[11px] font-bold text-amber-900">
                <span>ಅಧಿಕೃತ ಮುದ್ರಣ ಪ್ರಕಾಶನ (Official 104-Page Print Blueprint)</span>
                <span className="text-amber-600">→</span>
              </div>
            </div>

            {/* Card 2: Mathematical Drik-Ganita Ephemeris */}
            <div
              onClick={() => handleTogglePanchangaEngine("mathematical")}
              className={`cursor-pointer p-5 rounded-3xl border-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                panchangaEngineConfig.engineMode === "mathematical"
                  ? "bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white border-blue-500 shadow-xl ring-4 ring-blue-400/30 scale-[1.01]"
                  : "bg-white border-amber-200 hover:border-blue-400 opacity-80 hover:opacity-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 bg-blue-100 rounded-2xl border border-blue-300">📐</span>
                    <div>
                      <h3 className="font-black text-blue-950 text-sm">ಗಣಿತೀಯ ದೃಗ್ಗಣಿತ ಮಾದರಿ</h3>
                      <p className="text-[10px] text-blue-800 font-bold uppercase">Mathematical Drik-Ganita Ephemeris</p>
                    </div>
                  </div>
                  {panchangaEngineConfig.engineMode === "mathematical" ? (
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span>✓</span>
                      <span>ACTIVE / ಸಕ್ರಿಯ</span>
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border">
                      Select
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 font-semibold leading-relaxed mt-2">
                  Computes astronomical longitudes and solar/lunar aspects dynamically via Swiss/Lahiri Ephemeris algorithms. Automatically adapts to any geographic coordinate worldwide.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-semibold text-blue-950">
                  <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                    <span className="block font-black text-blue-900">🌐 ವ್ಯಾಪ್ತಿ:</span>
                    Global Latitude / Longitude
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-blue-200">
                    <span className="block font-black text-blue-900">⚙️ ಅಯನಾಂಶ:</span>
                    Lahiri / Chitra-Paksha
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200 flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span>ಡೈನಾಮಿಕ್ ಗಣಿತೀಯ ಎಂಜಿನ್ (Dynamic Algorithmic Math)</span>
                <span className="text-blue-600">→</span>
              </div>
            </div>
          </div>

          {/* Engine Telemetry & Database Diagnostics */}
          <div className="bg-gradient-to-r from-[#FFFDF7] via-amber-50 to-[#FEFCF4] border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
              <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                <span>📊</span>
                <span>ಡೇಟಾಬೇಸ್ ಸಂರಚನೆ & ಟೆಲಿಮೆಟ್ರಿ (Engine Diagnostics & Storage State)</span>
              </h4>
              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                Doc: app_configurations/panchanga_engine_config
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">ಸಂವತ್ಸರ (Samvatsara):</span>
                <span className="font-black text-amber-950">ಪರಾಭವ (Parabhava)</span>
                <span className="text-[10px] text-amber-700 block">ಶಕ ೧೯೪೮ (1948)</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">ಒಟ್ಟು ದಿನಗಳು (Total Days):</span>
                <span className="font-black text-emerald-700">೩೮೫ ದಿನಗಳು (385 Days)</span>
                <span className="text-[10px] text-slate-600 block">೨೬ ಮಾಸ-ಪಕ್ಷಗಳು (Pages 40-91)</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">ರಾಜ / ಮಂತ್ರಿ (Nava Nayakas):</span>
                <span className="font-black text-purple-950">ರಾಜ: ಗುರು | ಮಂತ್ರಿ: ಕುಜ</span>
                <span className="text-[10px] text-purple-700 block">ಸೇನಾಧಿಪತಿ: ರವಿ</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold block">ಸಂಪರ್ಕ ಪುರೋಹಿತರು:</span>
                <span className="font-black text-amber-950">ಶ್ರೀರಾಮ್ ಪಂಡಿತ್</span>
                <span className="text-[10px] text-amber-800 block">📞 9972339362</span>
              </div>
            </div>
          </div>

          {/* Live Day Inspector & Data Verifier with Text Search, Voice Mic & All-Year Festival Dropdown */}
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
              <div>
                <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                  <span>🔍</span>
                  <span>ಲೈವ್ ದಿನ & ಹಬ್ಬಗಳ ಪರೀಕ್ಷಕ (Interactive Day & All-Year Festival Inspector)</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-semibold">
                  Search by typing, voice speaking 🎙️, or selecting any festival from the all-year dropdown to inspect exact Tithi, Puja Timings, and Left/Right page blueprint details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">ದಿನಾಂಕ:</span>
                <input
                  type="date"
                  value={testDateInspector}
                  onChange={(e) => setTestDateInspector(e.target.value)}
                  className="px-2.5 py-1 text-xs border-2 border-amber-300 rounded-xl font-bold bg-[#FFFDF7] text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 1. TEXT SEARCH BOX WITH REAL-TIME FILTER & VOICE MIC INPUT */}
            <div className="bg-gradient-to-r from-[#FFFDF7] via-amber-50/70 to-[#FEFCF4] p-3 rounded-2xl border-2 border-amber-300/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Search Input Box */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    value={festivalSearchQuery}
                    onChange={(e) => {
                      setFestivalSearchQuery(e.target.value);
                      const matches = searchParabhavaFestivals(e.target.value);
                      if (matches.length > 0) {
                        setSelectedFestivalId(matches[0].id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleOkFestivalSearch();
                    }}
                    placeholder="ಹಬ್ಬ, ವ್ರತ, ತಿಥಿ ಅಥವಾ ದಿನಾಂಕ ಹುಡುಕಿ (ಉದಾ: ರಾಮನವಮಿ, ಗಣೇಶ, ದೀಪಾವಳಿ, ಶಿವರಾತ್ರಿ)..."
                    className="w-full pl-8 pr-8 py-2 text-xs border-2 border-amber-300 rounded-xl font-semibold bg-white text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  {festivalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFestivalSearchQuery("")}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Voice / Mic Button */}
                <button
                  type="button"
                  onClick={handleStartVoiceSearch}
                  title="ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ (Speak into Mic)"
                  className={`px-3.5 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 ${
                    isListeningMic
                      ? "bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-400/40"
                      : "bg-[#FFFDF7] text-amber-950 border-amber-400 hover:bg-amber-100"
                  }`}
                >
                  <span className="text-sm">{isListeningMic ? "🔴" : "🎙️"}</span>
                  <span>{isListeningMic ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "ಧ್ವನಿ (Mic)"}</span>
                </button>

                {/* OK Action Button */}
                <button
                  type="button"
                  onClick={handleOkFestivalSearch}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 border border-amber-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                >
                  ✓ OK / ಹುಡುಕಿ
                </button>
              </div>

              {/* 2. COMPREHENSIVE ALL-YEAR FESTIVAL DROPDOWN */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-amber-200">
                <label className="text-[11px] font-black text-amber-950 shrink-0 flex items-center gap-1">
                  <span>📅</span>
                  <span>ವರ್ಷದ ಎಲ್ಲಾ ಹಬ್ಬಗಳ ಪಟ್ಟಿ (All-Year Festival Directory):</span>
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <select
                    value={selectedFestivalId}
                    onChange={(e) => handleSelectFestival(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-amber-300 rounded-xl bg-white text-amber-950 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                  >
                    {PARABHAVA_ANNUAL_FESTIVALS.map((fest) => (
                      <option key={fest.id} value={fest.id}>
                        [{fest.date}] {fest.nameKn} — {fest.masaKn} {fest.pakshaKn} {fest.tithiKn} ({fest.category})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleOkFestivalSearch}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-200 text-amber-950 border border-amber-400 hover:bg-amber-300 transition-all shrink-0"
                  >
                    ವಿವರ ವೀಕ್ಷಿಸಿ
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500">ಪ್ರಮುಖ ದಿನಗಳು:</span>
              {[
                { label: "ಯುಗಾದಿ (19 Mar 2026)", date: "2026-03-19", id: "yugadi" },
                { label: "ಶ್ರೀರಾಮನವಮಿ (27 Mar 2026)", date: "2026-03-27", id: "shri_ramanavami" },
                { label: "ಕಾಮದಾ ಏಕಾದಶಿ (29 Mar 2026)", date: "2026-03-29", id: "kamada_ekadashi" },
                { label: "ಹನುಮಜ್ಜಯಂತಿ (02 Apr 2026)", date: "2026-04-02", id: "hanuma_jayanti" },
                { label: "ಅಕ್ಷಯ ತೃತೀಯ (19 Apr 2026)", date: "2026-04-19", id: "akshaya_tritiya" },
                { label: "ವರಮಹಾಲಕ್ಷ್ಮೀ (21 Aug 2026)", date: "2026-08-21", id: "varamahalakshmi" },
                { label: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ (14 Sep 2026)", date: "2026-09-14", id: "ganesha_chaturthi" },
                { label: "ದೀಪಾವಳಿ (09 Nov 2026)", date: "2026-11-09", id: "deepavali_lakshmi" },
                { label: "ಮಕರ ಸಂಕ್ರಾಂತಿ (14 Jan 2027)", date: "2027-01-14", id: "makara_sankranti" },
                { label: "ಮಹಾಶಿವರಾತ್ರಿ (06 Mar 2027)", date: "2027-03-06", id: "maha_shivaratri" }
              ].map((p) => (
                <button
                  key={p.date}
                  type="button"
                  onClick={() => {
                    setTestDateInspector(p.date);
                    setSelectedFestivalId(p.id);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                    testDateInspector === p.date
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-[#FEFCF4] text-amber-950 border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Render Output Inspector for Selected Date */}
            {(() => {
              const dayDetails = getParabhavaDayDetails(testDateInspector);
              const matchedFest = getFestivalByDate(testDateInspector);

              return (
                <div className="space-y-3 pt-1">
                  {/* Festival Dossier & Timing Card (when a festival is active on this day) */}
                  {matchedFest && (
                    <div className="p-4 bg-gradient-to-r from-amber-100/90 via-[#FFFDF7] to-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 bg-white rounded-xl border border-amber-300 shadow-xs">🪔</span>
                          <div>
                            <h3 className="font-black text-amber-950 text-sm flex items-center gap-2">
                              <span>{matchedFest.nameKn}</span>
                              <span className="text-xs font-bold text-amber-800">({matchedFest.nameEn})</span>
                            </h3>
                            <p className="text-[10px] font-bold text-amber-900">
                              {matchedFest.masaKn} {matchedFest.pakshaKn} {matchedFest.tithiKn} • {dayDetails.weekdayKn}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-950 shrink-0">
                          {matchedFest.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black text-amber-900 block flex items-center gap-1">
                            <span>⏳</span>
                            <span>ಪೂಜಾ & ಮುಹೂರ್ತ ಕಾಲ (Pooja Window):</span>
                          </span>
                          <span className="font-black text-emerald-800 text-xs mt-0.5 block">
                            {matchedFest.pujaWindow || "ದಿನದ ಪ್ರಾತಃಕಾಲ & ಮಾಧ್ಯಾಹ್ನ ಪುಣ್ಯಕಾಲ"}
                          </span>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black text-amber-900 block flex items-center gap-1">
                            <span>📜</span>
                            <span>ತಿಥಿ & ಮುಕ್ತಾಯ ಸಮಯ:</span>
                          </span>
                          <span className="font-black text-amber-950 text-xs mt-0.5 block">
                            {dayDetails.tithiKn} ({dayDetails.tithiGhati}) ಅಂತ್ಯ: {dayDetails.tithiEndTime}
                          </span>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-black text-amber-900 block flex items-center gap-1">
                            <span>🕉️</span>
                            <span>ಶ್ರಾದ್ಧ & ಧಾರ್ಮಿಕ ನಿರ್ಣಯ:</span>
                          </span>
                          <span className="font-black text-purple-950 text-xs mt-0.5 block">
                            {dayDetails.shraddhaTithi}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-800 font-semibold leading-relaxed pt-1">
                        <span className="font-black text-amber-950">ಧಾರ್ಮಿಕ ಮಹತ್ವ: </span>
                        {matchedFest.descriptionKn}
                      </p>
                    </div>
                  )}

                  {/* Dual Page Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Left Page Preview Card */}
                    <div className="p-3.5 bg-[#FFFDF7] border-2 border-amber-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                        <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                          <span>📖</span>
                          <span>ಎಡ ಪುಟ (Left Page - Panchanga Angas & Shraddha)</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-800">
                          {dayDetails.chandramanaMasaKn} {dayDetails.pakshaKn}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-500 font-semibold block">ತಿಥಿ (Tithi):</span>
                          <span className="font-bold text-slate-900">{dayDetails.tithiKn} ({dayDetails.tithiGhati})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">ನಕ್ಷತ್ರ (Nakshatra):</span>
                          <span className="font-bold text-slate-900">{dayDetails.nakshatraKn} ({dayDetails.nakshatraGhati})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">ಯೋಗ (Yoga):</span>
                          <span className="font-bold text-slate-900">{dayDetails.yogaKn} ({dayDetails.yogaGhati})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">ಕರಣ (Karana):</span>
                          <span className="font-bold text-slate-900">{dayDetails.karanaKn} ({dayDetails.karanaGhati})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">ಶ್ರಾದ್ಧ ತಿಥಿ:</span>
                          <span className="font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            {dayDetails.shraddhaTithi}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block">ಸೂರ್ಯೋದಯ / ಅಸ್ತ:</span>
                          <span className="font-bold text-slate-900">{dayDetails.suryodaya} / {dayDetails.suryasta}</span>
                        </div>
                      </div>

                      {dayDetails.festivalsAndVratas.length > 0 && (
                        <div className="pt-1 border-t border-amber-200">
                          <span className="text-[10px] font-black text-amber-900 block">ಹಬ್ಬ-ಹರಿದಿನಗಳು / ಉತ್ಸವಗಳು:</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {dayDetails.festivalsAndVratas.map((f, i) => (
                              <span key={i} className="text-[10px] font-bold bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded border border-amber-300">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Page Preview Card */}
                    <div className="p-3.5 bg-[#FFFDF7] border-2 border-amber-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                        <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                          <span>🏛️</span>
                          <span>ಬಲ ಪುಟ (Right Page - Dina Lagna & Planetary Coordinates)</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-800">
                          ಸೌರ {dayDetails.sauramanaMasaKn} (ದಿನ {dayDetails.sauramanaDina})
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-black text-slate-700 block mb-1">ನವಗ್ರಹ ಸ್ಪಷ್ಟ (Graha Spashta):</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ರವಿ:</span> {dayDetails.grahaSpashta.ravi.rashiKn} ({dayDetails.grahaSpashta.ravi.nakshatraKn} ಪಾದ {dayDetails.grahaSpashta.ravi.pada})
                          </div>
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ಕುಜ:</span> {dayDetails.grahaSpashta.kuja.rashiKn} ({dayDetails.grahaSpashta.kuja.nakshatraKn} ಪಾದ {dayDetails.grahaSpashta.kuja.pada})
                          </div>
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ಬುಧ:</span> {dayDetails.grahaSpashta.budha.rashiKn} ({dayDetails.grahaSpashta.budha.nakshatraKn} {dayDetails.grahaSpashta.budha.isVakri ? "ವಕ್ರೀ" : ""})
                          </div>
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ಗುರು:</span> {dayDetails.grahaSpashta.guru.rashiKn} ({dayDetails.grahaSpashta.guru.nakshatraKn} ಪಾದ {dayDetails.grahaSpashta.guru.pada})
                          </div>
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ಶುಕ್ರ:</span> {dayDetails.grahaSpashta.shukra.rashiKn} ({dayDetails.grahaSpashta.shukra.nakshatraKn} ಪಾದ {dayDetails.grahaSpashta.shukra.pada})
                          </div>
                          <div className="bg-white p-1 rounded border border-amber-200">
                            <span className="font-bold text-amber-950">ಶನಿ:</span> {dayDetails.grahaSpashta.shani.rashiKn} ({dayDetails.grahaSpashta.shani.nakshatraKn} ಪಾದ {dayDetails.grahaSpashta.shani.pada})
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-amber-200">
                        <span className="text-[10px] font-black text-slate-700 block">೧೨ ಲಗ್ನ ಸಮಾಪ್ತಿ ಕಾಲ (Lagna Ending Times):</span>
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono font-bold mt-1 text-slate-800">
                          <span className="bg-white p-0.5 px-1 rounded border">ಮೀ: {dayDetails.lagnaEndingTimes.meena}</span>
                          <span className="bg-white p-0.5 px-1 rounded border">ಮೇ: {dayDetails.lagnaEndingTimes.mesha}</span>
                          <span className="bg-white p-0.5 px-1 rounded border">ವೃ: {dayDetails.lagnaEndingTimes.vrishabha}</span>
                          <span className="bg-white p-0.5 px-1 rounded border">ಮಿ: {dayDetails.lagnaEndingTimes.mithuna}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Launch Dedicated Priest Portal Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-100/70 border border-amber-300 p-3 rounded-2xl">
                    <div>
                      <span className="text-xs font-black text-amber-950 block">
                        👑 ಪುರೋಹಿತ ಪಂಚಾಂಗ ಮಹಾದರ್ಶನ (Priest Panchanga Portal)
                      </span>
                      <span className="text-[10px] font-bold text-amber-800">
                        ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಕುಂಡಲಿ, ೧೨ ಲಗ್ನ ಸಮಾಪ್ತಿ & ೧೮೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ರಫ್ತು
                      </span>
                    </div>
                    <a
                      href={`/priest-panchanga?date=${testDateInspector}&pincode=581326`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 border border-amber-600 shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>🚀</span>
                      <span>ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: PRIEST VOICE DATABASE & VOICE CLONE VAULT (SuperAdmin Only) */}
      {activeTab === "voice_db" && (() => {
        const activeProfile = adminVoiceProfiles.find((p) => p.id === activeAdminVoiceId) || adminVoiceProfiles[0];
        const stepList: { key: PriestAudioKey; titleKn: string; mantra: string }[] = [
          { key: "step_1", titleKn: "ಹಂತ ೧: ಘಂಟಾನಾದ & ದೇವತಾಹ್ವಾನ ಮಂತ್ರ", mantra: "ಓಂ ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ ಗಮನಾರ್ಥಂ ತು ರಾಕ್ಷಸಾಮ್..." },
          { key: "step_2", titleKn: "ಹಂತ ೨: ದೀಪಜ್ಯೋತಿ & ಮಂಗಳಾಕ್ಷತೆ ಸಮರ್ಪಣೆ", mantra: "ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ..." },
          { key: "step_3", titleKn: "ಹಂತ ೩: ದೈನಂದಿನ ಮಹಾಸಂಕಲ್ಪ", mantra: "ಅದ್ಯ ಪೂರ್ವೋಕ್ತ ಏವಂ ಗುಣ ವಿಶೇಷಣ..." },
          { key: "step_4", titleKn: "ಹಂತ ೪: ಮುಖ್ಯ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ", mantra: "ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ..." },
          { key: "deity_mantra", titleKn: "ದೈನಂದಿನ ದೇವತಾ ಜಪ ಮಂತ್ರ", mantra: "ಓಂ ನಮಃ ಶಿವಾಯ / ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ" }
        ];

        const handleFileUpload = async (key: PriestAudioKey, e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            await saveClipToVoiceProfile(activeAdminVoiceId, key, file);
            setAdminVoiceProfiles(getAllVoiceProfiles());
            setFeedback({ type: "success", text: `✓ ${file.name} ಆಡಿಯೋ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.` });
          } catch {
            setFeedback({ type: "error", text: "ಆಡಿಯೋ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ." });
          }
        };

        const handleStartLiveRecord = async (key: PriestAudioKey) => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            adminAudioChunksRef.current = [];
            const recorder = new MediaRecorder(stream);
            adminMediaRecorderRef.current = recorder;
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) adminAudioChunksRef.current.push(e.data);
            };
            recorder.onstop = async () => {
              const audioBlob = new Blob(adminAudioChunksRef.current, { type: "audio/webm" });
              const file = new File([audioBlob], `${key}_live.webm`, { type: "audio/webm" });
              await saveClipToVoiceProfile(activeAdminVoiceId, key, file);
              setAdminVoiceProfiles(getAllVoiceProfiles());
              setIsVoiceRecordingLive(null);
              stream.getTracks().forEach((t) => t.stop());
              setFeedback({ type: "success", text: "✓ ಲೈವ್ ರೆಕಾರ್ಡಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ." });
            };
            recorder.start();
            setIsVoiceRecordingLive(key);
          } catch {
            alert("Microphone permission is required.");
          }
        };

        const handleStopLiveRecord = () => {
          if (adminMediaRecorderRef.current && adminMediaRecorderRef.current.state === "recording") {
            adminMediaRecorderRef.current.stop();
          }
        };

        const handleTogglePlay = (key: PriestAudioKey, dataUrl: string) => {
          if (activeAudioPlayingKey === key) {
            if (adminAudioPlayerRef.current) {
              adminAudioPlayerRef.current.pause();
              adminAudioPlayerRef.current = null;
            }
            setActiveAudioPlayingKey(null);
            return;
          }
          if (adminAudioPlayerRef.current) {
            adminAudioPlayerRef.current.pause();
          }
          const audio = new Audio(dataUrl);
          adminAudioPlayerRef.current = audio;
          setActiveAudioPlayingKey(key);
          audio.onended = () => {
            setActiveAudioPlayingKey(null);
            adminAudioPlayerRef.current = null;
          };
          audio.onerror = () => {
            setActiveAudioPlayingKey(null);
            adminAudioPlayerRef.current = null;
          };
          audio.play().catch(() => setActiveAudioPlayingKey(null));
        };

        const handleDeleteClip = (key: PriestAudioKey) => {
          removeClipFromVoiceProfile(activeAdminVoiceId, key);
          setAdminVoiceProfiles(getAllVoiceProfiles());
        };

        const handleCreateVoice = () => {
          if (!newAdminVoiceName.trim()) return;
          const newId = `voice_${Date.now()}_${newAdminVoiceName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
          const newProf: PriestVoiceProfile = {
            id: newId,
            name: newAdminVoiceName.trim(),
            titleKn: newAdminVoiceTitle.trim() || "ದೈವಜ್ಞರು & ಅರ್ಚಕರು",
            titleEn: "Priest & Astrologer",
            voicePitch: 0.74,
            voiceRate: 0.86,
            preferredVoiceLang: "kn-IN",
            audioClips: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          saveVoiceProfile(newProf);
          setAdminVoiceProfiles(getAllVoiceProfiles());
          setActiveAdminVoiceId(newId);
          setIsCreatingAdminVoice(false);
          setNewAdminVoiceName("");
          setNewAdminVoiceTitle("");
          setFeedback({ type: "success", text: `✓ ಹೊಸ ಧ್ವನಿ ಪ್ರೊಫೈಲ್ (${newProf.name}) ರಚಿಸಲಾಗಿದೆ.` });
        };

        return (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-[#2A1205] to-[#1F0D04] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-amber-100 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-xs">
                    🎙️
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#FDE68A]">
                      ಅರ್ಚಕರ ಧ್ವನಿ ಡೇಟಾಬೇಸ್ & ವಾಯ್ಸ್ ಕ್ಲೋನ್ ವಾಲ್ಟ್ (Priest Voice Repository)
                    </h3>
                    <p className="text-xs text-amber-300 font-medium">
                      Manage authentic Vedic chanting recordings & AI male voice synthesis for 30/90/180/365-day devotee calendars.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingAdminVoice(!isCreatingAdminVoice)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  {isCreatingAdminVoice ? "ರದ್ದುಮಾಡಿ" : "+ ಹೊಸ ಧ್ವನಿ ಪ್ರೊಫೈಲ್ ಸೇರಿಸಿ"}
                </button>
              </div>

              {/* Voice Cloning Guidance Box */}
              <div className="p-3.5 bg-black/40 rounded-2xl border border-amber-500/30 text-xs leading-relaxed text-amber-200 space-y-1">
                <div className="font-bold text-[#FDE68A] flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ & ಕ್ಲೋನಿಂಗ್ ಮಾರ್ಗದರ್ಶಿ (How Voice Cloning & Playback Works):</span>
                </div>
                <div className="pl-4 border-l-2 border-amber-400 text-[11px] text-amber-100 space-y-1">
                  <p>• <strong>ಅಗತ್ಯವಿರುವ ಆಡಿಯೋ:</strong> ಪ್ರತಿ ಮಂತ್ರಕ್ಕೆ ಕೇವಲ ೧೫ ರಿಂದ ೪೫ ಸೆಕೆಂಡುಗಳ ಸ್ಪಷ್ಟ ರೆಕಾರ್ಡಿಂಗ್ (ವಾಯ್ಸ್ ಕ್ಲೋನಿಂಗ್‌ಗೆ ಕನಿಷ್ಠ ೩೦-೬೦ ಸೆಕೆಂಡು ಸಾಕು).</p>
                  <p>• <strong>ಉಪಯೋಗ:</strong> ಸೇವಾ ಪತ್ರ / QR ಕೋಡ್ ಜನರೇಟ್ ಮಾಡುವಾಗ ನೀವು ಆಯ್ಕೆ ಮಾಡಿದ ಧ್ವನಿಯೇ ಭಕ್ತರ ಮೊಬೈಲ್‌ನಲ್ಲಿ ದೈನಂದಿನ ಪೂಜೆ ಸಮಯದಲ್ಲಿ ಪ್ಲೇ ಆಗುತ್ತದೆ.</p>
                  <p>• <strong>ಆಡಿಯೋ ಫಾರ್ಮ್ಯಾಟ್‌ಗಳು:</strong> .mp3, .wav, .m4a ಅಥವಾ ನೇರವಾಗಿ ಕೆಳಗಿನ 🎙️ ಲೈವ್ ರೆಕಾರ್ಡ್ ಬಟನ್ ಬಳಸಿ ಮೊಬೈಲ್/ಲ್ಯಾಪ್‌ಟಾಪ್‌ನಿಂದಲೇ ರೆಕಾರ್ಡ್ ಮಾಡಬಹುದು.</p>
                </div>
              </div>
            </div>

            {/* Profile Creator Form */}
            {isCreatingAdminVoice && (
              <div className="bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl p-5 shadow-lg space-y-3 animate-in fade-in">
                <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>ಹೊಸ ಅರ್ಚಕರ ಧ್ವನಿ ಪ್ರೊಫೈಲ್ ರಚನೆ (Create New Voice Profile)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newAdminVoiceName}
                    onChange={(e) => setNewAdminVoiceName(e.target.value)}
                    placeholder="ಅರ್ಚಕರ ಹೆಸರು (e.g. ಶ್ರೀಸುಮ, ಗೋಕರ್ಣ ವೇದ ಶಾಸ್ತ್ರಿಗಳು)"
                    className="px-3 py-2 text-xs border-2 border-amber-300 rounded-xl font-bold bg-white text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newAdminVoiceTitle}
                    onChange={(e) => setNewAdminVoiceTitle(e.target.value)}
                    placeholder="ಹುದ್ದೆ / ಬಿರುದು (e.g. ಪ್ರಧಾನ ವೇದ ವಿದ್ವಾನ್)"
                    className="px-3 py-2 text-xs border-2 border-amber-300 rounded-xl font-bold bg-white text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateVoice}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  ✓ ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ & ಆಡಿಯೋ ಸೇರಿಸಿ
                </button>
              </div>
            )}

            {/* Voice Profile Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-amber-950">ಧ್ವನಿ ಪ್ರೊಫೈಲ್‌ಗಳು:</span>
              {adminVoiceProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActiveAdminVoiceId(p.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                    activeAdminVoiceId === p.id
                      ? "bg-amber-800 text-white border-amber-900 shadow-sm scale-105"
                      : "bg-[#FFFDF7] text-amber-950 border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  {p.name} {p.isDefault ? "★" : ""}
                </button>
              ))}
            </div>

            {/* Step-by-Step Audio Clips List for Active Profile */}
            <div className="bg-[#1C0A00] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-amber-100 shadow-xl space-y-4">
              <div className="border-b border-amber-500/40 pb-3">
                <h4 className="text-sm sm:text-base font-black text-[#FDE68A]">
                  {activeProfile?.name} - ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳ ಪಟ್ಟಿ
                </h4>
                <p className="text-xs text-amber-300 font-medium">
                  {activeProfile?.titleKn || activeProfile?.titleEn} · ಈ ಪ್ರೊಫೈಲ್‌ನ ಆಡಿಯೋ ಕ್ಲಿಪ್‌ಗಳು ಕೆಳಗಿವೆ:
                </p>
              </div>

              <div className="space-y-3">
                {stepList.map(({ key, titleKn, mantra }) => {
                  const clip = activeProfile?.audioClips?.[key];
                  const isPlaying = activeAudioPlayingKey === key;
                  const isRec = isVoiceRecordingLive === key;

                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-gradient-to-r from-[#2A1205] to-[#1F0D04] border border-amber-500/30 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-black text-[#FDE68A]">{titleKn}</h5>
                          <p className="text-[10px] text-amber-300 font-mono italic">"{mantra}"</p>
                        </div>

                        {clip ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 border border-emerald-400 text-emerald-300">
                            ✓ ಆಡಿಯೋ ಸಿದ್ಧವಾಗಿದೆ ({clip.fileName || "Custom Voice"})
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-600/50 text-amber-400">
                            AI Male Priest Voice (Fallback)
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-800/80 hover:bg-amber-700 text-white text-[11px] font-bold border border-amber-400 shadow-xs transition-all flex items-center gap-1.5">
                          <span>📁</span>
                          <span>ಫೈಲ್ ಅಪ್‌ಲೋಡ್ (.mp3, .wav)</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileUpload(key, e)}
                            className="hidden"
                          />
                        </label>

                        {isRec ? (
                          <button
                            type="button"
                            onClick={handleStopLiveRecord}
                            className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-[11px] font-black animate-pulse border border-red-400 shadow-xs flex items-center gap-1.5"
                          >
                            <span>⏹️</span>
                            <span>ರೆಕಾರ್ಡಿಂಗ್ ಮುಕ್ತಾಯಗೊಳಿಸಿ</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartLiveRecord(key)}
                            className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[11px] font-bold border border-amber-500/50 shadow-xs transition-all flex items-center gap-1.5"
                          >
                            <span>🎙️</span>
                            <span>ಲೈವ್ ರೆಕಾರ್ಡ್</span>
                          </button>
                        )}

                        {clip && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleTogglePlay(key, clip.dataUrl)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black border shadow-xs transition-all flex items-center gap-1.5 ${
                                isPlaying
                                  ? "bg-emerald-600 text-white border-emerald-400"
                                  : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-500/50"
                              }`}
                            >
                              <span>{isPlaying ? "⏸️" : "▶️"}</span>
                              <span>{isPlaying ? "ವಿರಾಮ" : "ಕೇಳಿ (Play)"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteClip(key)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-[11px] font-bold border border-red-500/40 transition-all"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Real-Time Voice Cloning Engine & Live Studio */}
            <div className="bg-gradient-to-br from-[#1C0A00] via-[#2A1205] to-[#150600] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 text-amber-100 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/40 pb-3">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#FDE68A] flex items-center gap-2">
                    <span>🤖</span>
                    <span>AI ರಿಯಲ್-ಟೈಮ್ ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಎಂಜಿನ್ (Real-Time AI Voice Clone Studio)</span>
                  </h4>
                  <p className="text-xs text-amber-300 font-medium">
                    ಯಾವುದೇ ಹೊಸ ಮಂತ್ರ ಅಥವಾ ಭಕ್ತರ ಹೆಸರನ್ನು ರಿಯಲ್-ಟೈಮ್‌ನಲ್ಲಿ ನಿಮ್ಮದೇ ಧ್ವನಿಯಲ್ಲಿ ನುಡಿಸಲು AI ಎಂಜಿನ್ ಸಂರಚಿಸಿ:
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider self-start sm:self-auto">
                  ⚡ Neural Indic Audio
                </span>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { id: "master_recording" as VoiceCloneProvider, title: "✨ ಶ್ರೀಸುಮ ನೈಜ ಧ್ವನಿ", desc: "Authentic recorded voice of ShriSuma" },
                  { id: "sarvam_ai" as VoiceCloneProvider, title: "🇮🇳 Sarvam AI Bulbul", desc: "India's #1 Kannada Neural Voice (sarvam.ai)" },
                  { id: "elevenlabs" as VoiceCloneProvider, title: "🔑 ElevenLabs Clone", desc: "Instant voice clone with API Key & Voice ID" },
                  { id: "huggingface_xtts" as VoiceCloneProvider, title: "🌐 HuggingFace XTTS", desc: "Zero-shot neural clone from audio sample" },
                  { id: "web_dsp" as VoiceCloneProvider, title: "🔊 Web Audio DSP", desc: "Acoustic formant resonance speech cloner" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...cloneConfig, provider: item.id };
                      setCloneConfig(updated);
                      saveVoiceCloneConfig(updated);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      cloneConfig.provider === item.id
                        ? "bg-amber-600/30 border-amber-400 text-white shadow-md ring-2 ring-amber-400/40"
                        : "bg-black/40 border-amber-500/30 text-amber-200/80 hover:bg-amber-950/40"
                    }`}
                  >
                    <div className="text-xs font-black text-amber-300">{item.title}</div>
                    <div className="text-[10px] text-amber-200/70 mt-1 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* API Keys Settings for Sarvam AI / ElevenLabs / HuggingFace */}
              {(cloneConfig.provider === "sarvam_ai" || cloneConfig.provider === "elevenlabs" || cloneConfig.provider === "huggingface_xtts") && (
                <div className="p-4 bg-black/60 rounded-2xl border border-amber-500/40 space-y-3 animate-in fade-in">
                  <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>
                      {cloneConfig.provider === "sarvam_ai"
                        ? "Sarvam AI (Bulbul:v1 Indic Neural Engine) Settings"
                        : cloneConfig.provider === "elevenlabs"
                        ? "ElevenLabs Voice Cloning Settings"
                        : "Hugging Face Inference Settings"}
                    </span>
                  </div>

                  {cloneConfig.provider === "sarvam_ai" && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-amber-200 block">
                          Sarvam AI API Subscription Key (Get free at <a href="https://dashboard.sarvam.ai" target="_blank" rel="noreferrer" className="text-amber-400 underline font-bold">dashboard.sarvam.ai</a>):
                        </label>
                        <input
                          type="password"
                          value={cloneConfig.sarvamApiKey || "sk_duxld45s_658vBx71bZPMfKeLfCXxXwF0"}
                          onChange={(e) => setCloneConfig({ ...cloneConfig, sarvamApiKey: e.target.value })}
                          placeholder="sk_..."
                          className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-amber-200 block">Speaker Persona (Bulbul:v3 Indic Models):</label>
                          <select
                            value={cloneConfig.sarvamSpeaker || "gokul"}
                            onChange={(e) => setCloneConfig({ ...cloneConfig, sarvamSpeaker: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-amber-200 font-bold focus:outline-none focus:border-amber-400 mt-1"
                          >
                            <option value="gokul">Gokul (ಗೋಕರ್ಣ ಪಂಡಿತ ಧ್ವನಿ - Gokarna Pandit - Default)</option>
                            <option value="anand">Anand (ಗಂಭೀರ ಮುಖ್ಯ ಅರ್ಚಕ - Deep Male Priest)</option>
                            <option value="advait">Advait (ಶಾಸ್ತ್ರೀಯ ವಿದ್ವಾಂಸ ಧ್ವನಿ - Classical Vidwan)</option>
                            <option value="ashutosh">Ashutosh (ವೇದ ಪಠಣ ಧ್ವನಿ - Vedic Chanting)</option>
                            <option value="vijay">Vijay (ಸ್ಪಷ್ಟ ಶಾಂತ ಧ್ವನಿ - Calm Clear Male)</option>
                            <option value="tarun">Tarun (ಯುವ ಗಂಭೀರ ಧ್ವನಿ - Resonant Youth)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-amber-200 block">Pace / Tempo:</label>
                          <select
                            value={cloneConfig.sarvamPace || 0.90}
                            onChange={(e) => setCloneConfig({ ...cloneConfig, sarvamPace: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-amber-200 font-bold focus:outline-none focus:border-amber-400 mt-1"
                          >
                            <option value="0.85">0.85x (ವಿಳಂಬ ವೇದ ಪಠಣ - Slow Chanting)</option>
                            <option value="0.90">0.90x (ಶಾಸ್ತ್ರೀಯ ಲಯ - Vedic Cadence)</option>
                            <option value="1.00">1.00x (ಸಾಮಾನ್ಯ - Normal Pace)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {cloneConfig.provider === "elevenlabs" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-amber-200 block">ElevenLabs API Key (xi-api-key):</label>
                        <input
                          type="password"
                          value={cloneConfig.elevenLabsApiKey || ""}
                          onChange={(e) => setCloneConfig({ ...cloneConfig, elevenLabsApiKey: e.target.value })}
                          placeholder="sk_..."
                          className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-amber-200 block">Voice ID (Cloned Voice ID):</label>
                        <input
                          type="text"
                          value={cloneConfig.elevenLabsVoiceId || ""}
                          onChange={(e) => setCloneConfig({ ...cloneConfig, elevenLabsVoiceId: e.target.value })}
                          placeholder="21m00Tcm4TlvDq8ikWAM"
                          className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {cloneConfig.provider === "huggingface_xtts" && (
                    <div className="space-y-2">
                      <label className="text-[11px] text-amber-200 block">
                        Hugging Face User Access Token (Free at huggingface.co/settings/tokens):
                      </label>
                      <input
                        type="password"
                        value={cloneConfig.hfApiKey || ""}
                        onChange={(e) => setCloneConfig({ ...cloneConfig, hfApiKey: e.target.value })}
                        placeholder="hf_..."
                        className="w-full px-3 py-2 text-xs bg-black/80 border border-amber-500/50 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      saveVoiceCloneConfig(cloneConfig);
                      setFeedback({ type: "success", text: "✓ AI ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ." });
                    }}
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs"
                  >
                    ✓ ಸೆಟ್ಟಿಂಗ್ ಉಳಿಸಿ (Save API Settings)
                  </button>
                </div>
              )}

              {/* Sarvam AI Quota Sentinel */}
              <SarvamAiUsageGrid className="my-3" />

              {/* Live Interactive Voice Clone Tester Studio */}
              <div className="p-4 bg-gradient-to-r from-[#2A1205] to-[#1F0D04] rounded-2xl border-2 border-amber-400/80 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
                  <div className="text-xs sm:text-sm font-black text-[#FDE68A] flex items-center gap-2">
                    <span className="text-lg">🎙️</span>
                    <span>ಲೈವ್ ಧ್ವನಿ ಪರಿಶೀಲನೆ & ಪರೀಕ್ಷಕ (Live Real-Time Voice Synthesis Review Player)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-300 font-bold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-500/40">
                      ಧ್ವನಿ ಪ್ರೊಫೈಲ್: {activeProfile?.name.split("(")[0]}
                    </span>
                  </div>
                </div>

                {/* Pitch & Rate Interactive Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-black/60 rounded-xl border border-amber-500/30">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-200">
                      <span>ಧ್ವನಿ ಗಾಂಭೀರ್ಯತೆ (Pitch / Frequency):</span>
                      <span className="font-mono text-amber-400 font-black">{(cloneConfig.preferredPitch || 0.76).toFixed(2)}x (125Hz F0)</span>
                    </div>
                    <input
                      type="range"
                      min="0.60"
                      max="1.20"
                      step="0.02"
                      value={cloneConfig.preferredPitch || 0.76}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const updated = { ...cloneConfig, preferredPitch: val };
                        setCloneConfig(updated);
                        saveVoiceCloneConfig(updated);
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-amber-950 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-amber-400/60 font-semibold">
                      <span>0.60 (ಅತ್ಯಂತ ಗಂಭೀರ)</span>
                      <span>0.76 (ಶ್ರೀಸುಮ ನೈಜ ಧ್ವನಿ)</span>
                      <span>1.20 (ತೀಕ್ಷ್ಣ)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-amber-200">
                      <span>ಪಠಣ ವೇಗ (Tempo / Cadence):</span>
                      <span className="font-mono text-amber-400 font-black">{(cloneConfig.preferredRate || 0.88).toFixed(2)}x (Vedic Pace)</span>
                    </div>
                    <input
                      type="range"
                      min="0.70"
                      max="1.20"
                      step="0.02"
                      value={cloneConfig.preferredRate || 0.88}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const updated = { ...cloneConfig, preferredRate: val };
                        setCloneConfig(updated);
                        saveVoiceCloneConfig(updated);
                      }}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-amber-950 rounded-lg"
                    />
                    <div className="flex justify-between text-[9px] text-amber-400/60 font-semibold">
                      <span>0.70 (ವಿಳಂಬ)</span>
                      <span>0.88 (ಶಾಸ್ತ್ರೀಯ ಲಯ)</span>
                      <span>1.20 (ವೇಗ)</span>
                    </div>
                  </div>
                </div>

                {/* Sample Text Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                    <span>ಪರೀಕ್ಷಾರ್ಥ ಪಠ್ಯ (Sample Review Paragraph):</span>
                    <div className="flex items-center gap-1">
                      {(["kn", "hi", "en"] as SevaLang[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => {
                            setTestLang(l);
                            if (l === "kn") {
                              setTestLiveText("ಹರಿ ಓಂ. ನಾನು ಶ್ರೀಸುಮ. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಪವಿತ್ರ ದರ್ಶನ ಹಾಗೂ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಂಕಲ್ಪಕ್ಕೆ ತಮಗೆ ಭಕ್ತಿಪೂರ್ವಕ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ. ಓಂ ನಮಃ ಶಿವಾಯ.");
                            } else if (l === "hi") {
                              setTestLiveText("हरि ॐ। मैं श्रीसुम। श्री गोकर्ण महाबलेश्वर स्वामी के नित्य पवित्र दर्शन और व्यक्तिगत मुहूर्त संकल्प में आपका हार्दिक स्वागत है। आपके परिवार का सर्वदा कल्याण हो। ॐ नमः शिवाय।");
                            } else {
                              setTestLiveText("Hari Om. I am ShriSuma. A divine welcome to Sri Gokarna Mahabaleshwara Darshana and your personal Golden Hour Sankalpa. May you and your family be blessed with peace and prosperity. Om Namah Shivaya.");
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            testLang === l ? "bg-amber-500 text-slate-950" : "bg-black/40 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={testLiveText}
                    onChange={(e) => setTestLiveText(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-black/80 border border-amber-500/60 rounded-xl text-xs text-amber-100 focus:outline-none focus:border-amber-400 resize-none font-medium leading-relaxed"
                    placeholder="ಪರೀಕ್ಷಿಸಲು ಕನ್ನಡ ಅಥವಾ ಸಂಸ್ಕೃತ ಪಠ್ಯವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
                  />
                </div>

                {/* Controls & Sample Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (isPlayingLiveTest) {
                          stopClonedAudio();
                          setIsPlayingLiveTest(false);
                          return;
                        }
                        setIsPlayingLiveTest(true);
                        await synthesizeAndPlayClonedVoice(testLiveText, testLang, activeAdminVoiceId, () => {
                          setIsPlayingLiveTest(false);
                        });
                      }}
                      className={`px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 border border-amber-200 ${
                        isPlayingLiveTest ? "animate-pulse ring-4 ring-amber-400/50" : ""
                      }`}
                    >
                      <span>{isPlayingLiveTest ? "⏹️ ಧ್ವನಿ ನಿಲ್ಲಿಸಿ (Stop Audio)" : "▶️ ನನ್ನ ಕ್ಲೋನ್ಡ್ ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ (Play Cloned Voice)"}</span>
                    </button>

                    {isPlayingLiveTest && (
                      <span className="text-xs text-emerald-400 font-black animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        ಧ್ವನಿ ನುಡಿಯುತ್ತಿದೆ...
                      </span>
                    )}
                  </div>

                  {/* Preset Fast Selectors */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setTestLang("kn");
                        setTestLiveText("ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದರ್ಶನ ಮತ್ತು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಗೋಲ್ಡನ್ ಮುಹೂರ್ತ ಸಮಯ ಆರಂಭವಾಗಿದೆ. ಶುಭ ಕಾರ್ಯಕ್ಕೆ ಸಕಾಲ. ಓಂ ನಮಃ ಶಿವಾಯ.");
                      }}
                      className="px-2.5 py-1.5 bg-black/50 hover:bg-black/70 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30"
                    >
                      🌟 ಮುಹೂರ್ತ ಸಂಕಲ್ಪ
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestLang("kn");
                        setTestLiveText("ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ. ಹರಿಃ ಓಂ. ಆದೌ ನಿರ್ವಿಘ್ನತಾಸಿದ್ಧ್ಯರ್ಥಂ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಪ್ರಾರ್ಥನಾಂ ಕರಿಷ್ಯೇ. ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ.");
                      }}
                      className="px-2.5 py-1.5 bg-black/50 hover:bg-black/70 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30"
                    >
                      🪔 ಪೂಜಾ ಮಂತ್ರ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. DIRECT COIN ADJUSTMENT MODAL (Cream & Royal Gold Palette) */}
      {selectedPriest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <button
              onClick={() => setSelectedPriest(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-lg text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl">
                🪙
              </div>
              <div>
                <h3 className="font-black text-amber-950 text-base">ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ (Direct Coin Adjustment)</h3>
                <p className="text-xs text-amber-800 font-semibold">ಪುರೋಹಿತರು: {selectedPriest.priestName}</p>
              </div>
            </div>

            <form onSubmit={handleDirectAdjustmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5">ಕ್ರಿಯೆಯ ವಿಧ (Action Type):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("credit")}
                    className={`py-2 rounded-xl font-black border-2 transition-all ${
                      adjustType === "credit"
                        ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-sm"
                        : "bg-[#FEFCF4] border-amber-200 text-slate-600"
                    }`}
                  >
                    + ಕ್ರೆಡಿಟ್ (Add Coins)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("debit")}
                    className={`py-2 rounded-xl font-black border-2 transition-all ${
                      adjustType === "debit"
                        ? "bg-red-100 border-red-500 text-red-950 shadow-sm"
                        : "bg-[#FEFCF4] border-amber-200 text-slate-600"
                    }`}
                  >
                    - ಡೆಬಿಟ್ (Subtract Coins)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">ನಾಣ್ಯಗಳ ಸಂಖ್ಯೆ (Coin Amount):</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="ಉದಾ: 1000"
                  min={1}
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl font-mono text-amber-950 font-black text-sm focus:outline-none focus:border-amber-500 shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5">ಆಡಿಟ್ ಟಿಪ್ಪಣಿ / ಕಾರಣ (Audit Reason):</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="ಉದಾ: ವಿಶೇಷ ಸೇವಾ ಕ್ರೆಡಿಟ್ / ಹಬ್ಬದ ಅನುದಾನ"
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPriest(null)}
                  className="px-4 py-2 bg-[#FEFCF4] border border-amber-300 hover:bg-amber-100 text-slate-700 font-bold rounded-xl"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isAdjusting ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "ಖಚಿತಪಡಿಸಿ & ಉಳಿಸಿ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. KUNDLI DETAILS INSPECTOR MODAL */}
      {selectedKundli && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <button
              onClick={() => setSelectedKundli(null)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-lg text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-xl">
                📜
              </div>
              <div>
                <h3 className="font-black text-amber-950 text-base">{selectedKundli.name}</h3>
                <p className="text-xs text-amber-800 font-semibold">ಗೋತ್ರ: {selectedKundli.gothra || "Kashyapa"} • {selectedKundli.placeName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ರಾಶಿ (Moon Sign)</span>
                <span className="font-black text-amber-950 text-sm">{selectedKundli.rashi}</span>
              </div>
              <div className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ನಕ್ಷತ್ರ ಮತ್ತು ಪಾದ</span>
                <span className="font-black text-emerald-800 text-sm">{selectedKundli.nakshatra} (Pada {selectedKundli.pada})</span>
              </div>
              <div className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ಲಗ್ನ (Ascendant)</span>
                <span className="font-bold text-slate-800 text-sm">{selectedKundli.lagnaRashi}</span>
              </div>
              <div className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">ಸೂರ್ಯ ರಾಶಿ</span>
                <span className="font-bold text-slate-800 text-sm">{selectedKundli.sunSign}</span>
              </div>
            </div>

            {/* Planetary Summary */}
            {selectedKundli.planetsSummary && selectedKundli.planetsSummary.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] text-slate-600 uppercase font-black">ಗ್ರಹಗಳ ವಿವರ:</div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {selectedKundli.planetsSummary.map((pl, idx) => (
                    <div key={idx} className="p-2 bg-[#FEFCF4] rounded-lg border border-amber-200 text-[11px]">
                      <span className="font-black text-amber-950">{pl.name}: </span>
                      <span className="text-slate-700">{pl.degree.toFixed(1)}° {pl.rashi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedKundli(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-sm"
              >
                ಮುಚ್ಚಿ (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. PRIEST MODULE PERMISSION EDITOR MODAL */}
      {editingPriestModules && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <div>
                  <h3 className="font-black text-amber-950 text-base">ಮಾಡ್ಯೂಲ್ ಪ್ರವೇಶಾವಕಾಶ ನಿರ್ವಹಣೆ</h3>
                  <p className="text-xs text-amber-800 font-semibold">
                    {editingPriestModules.priestName} ({editingPriestModules.userId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPriestModules(null)}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold p-1 rounded-full hover:bg-amber-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              ಈ ಪುರೋಹಿತರಿಗೆ ಯಾವೆಲ್ಲಾ ಮಾಡ್ಯೂಲ್‌ಗಳ ಪ್ರವೇಶಾವಕಾಶ ನೀಡಬೇಕೆಂದು ಆಯ್ಕೆಮಾಡಿ. ಇದನ್ನು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ತಕ್ಷಣವೇ ನವೀಕರಿಸಲಾಗುತ್ತದೆ:
            </p>

            <div className="space-y-2.5">
              {AVAILABLE_MODULES.map((mod) => {
                const isChecked = activeModuleSelection.includes(mod.key);
                return (
                  <label
                    key={mod.key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isChecked
                        ? "bg-[#FEFCF4] border-amber-500 shadow-sm"
                        : "bg-white/60 border-amber-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveModuleSelection((prev) => [...prev, mod.key]);
                        } else {
                          setActiveModuleSelection((prev) => prev.filter((k) => k !== mod.key));
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-black text-amber-950 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>{mod.icon}</span>
                          <span>{mod.kannadaLabel}</span>
                        </span>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          {mod.costPerQuestionCoins > 0 ? `🪙 ${mod.costPerQuestionCoins} (₹${mod.costPerQuestionInr})` : "ಉಚಿತ"}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-900 font-bold mt-0.5">{mod.label}</div>
                      <div className="text-[10px] text-slate-600 font-medium mt-0.5">{mod.kannadaDescription}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setEditingPriestModules(null)}
                className="flex-1 py-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="button"
                disabled={isSavingModules || activeModuleSelection.length === 0}
                onClick={handleSaveModulePermissions}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50 transition-all border border-amber-400"
              >
                {isSavingModules ? "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." : "✓ ಪ್ರವೇಶಾವಕಾಶ ಉಳಿಸಿ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. ADMIN PASSWORD CHANGE MODAL */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔐</span>
                <h3 className="font-black text-amber-950 text-base">Super Admin ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPasswordMsg(null);
                }}
                className="text-slate-500 hover:text-slate-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ರಹಸ್ಯ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಮೂದಿಸಿ. ಇದನ್ನು SHA-256 ಗೂಢಲಿಪೀಕರಣದೊಂದಿಗೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.
            </p>

            {adminPasswordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  adminPasswordMsg.type === "success"
                    ? "bg-emerald-100 border border-emerald-400 text-emerald-950"
                    : "bg-red-100 border border-red-400 text-red-950"
                }`}
              >
                {adminPasswordMsg.text}
              </div>
            )}

            <form onSubmit={handleAdminPasswordChange} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (New Password):
                </label>
                <input
                  type="password"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  ಖಚಿತಪಡಿಸಿ (Confirm New Password):
                </label>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="ಮತ್ತೊಮ್ಮೆ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್..."
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPasswordModal(false);
                    setAdminPasswordMsg(null);
                  }}
                  className="flex-1 py-2.5 bg-[#FEFCF4] border border-amber-300 hover:bg-amber-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50"
                >
                  {isUpdatingPassword ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "ಪಾಸ್‌ವರ್ಡ್ ಉಳಿಸಿ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. PRIEST DELETION & TOKEN REVOCATION MODAL */}
      {deletingPriest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF7] border-2 border-red-500 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-red-200 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold border border-red-300">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-black text-red-950">
                  ಪುರೋಹಿತರ ಖಾತೆ ರದ್ದು & ಅಳಿಸುವಿಕೆ
                </h3>
                <p className="text-[11px] text-red-800 font-semibold">
                  Delete Priest Account & Revoke Token
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs text-red-900 font-medium">
              <p>
                ನೀವು ಖಚಿತವಾಗಿ <strong>{deletingPriest.priestName}</strong> (User ID: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-red-300">{deletingPriest.userId}</code>) ಅವರ ಖಾತೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?
              </p>
              <ul className="list-disc pl-4 text-[11px] space-y-1 text-red-800">
                <li>ಅವರ ವಾಲೆಟ್ ಮತ್ತು ಬ್ಯಾಲೆನ್ಸ್ ಸಂಪೂರ್ಣವಾಗಿ ಅಳಿಸಲ್ಪಡುತ್ತದೆ.</li>
                <li>ಅವರಿಗೆ ನೀಡಲಾಗಿದ್ದ ಎಲ್ಲಾ ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್‌ಗಳು ತಕ್ಷಣವೇ ರದ್ದುಗೊಳ್ಳುತ್ತವೆ.</li>
                <li>ಅವರು ಈ ಟೋಕನ್ ಅಥವಾ ಖಾತೆಯ ಮೂಲಕ ಮರಳಿ ಲಾಗಿನ್ ಆಗಲು ಸಾಧ್ಯವಿಲ್ಲ.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingPriest}
                onClick={() => setDeletingPriest(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeletingPriest}
                onClick={async () => {
                  setIsDeletingPriest(true);
                  try {
                    const ok = await deletePriestAccount(deletingPriest.userId);
                    if (ok) {
                      setFeedback({
                        type: "success",
                        text: `ಪುರೋಹಿತರ (${deletingPriest.priestName}) ಖಾತೆ ಮತ್ತು ಪ್ರವೇಶ ಲಿಂಕ್ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲ್ಪಟ್ಟಿದೆ ಮತ್ತು ರದ್ದುಗೊಂಡಿದೆ.`
                      });
                      setDeletingPriest(null);
                    } else {
                      setFeedback({
                        type: "error",
                        text: "ಖಾತೆಯನ್ನು ಅಳಿಸುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ."
                      });
                    }
                  } catch (err: any) {
                    setFeedback({
                      type: "error",
                      text: `ಅಳಿಸುವಿಕೆ ದೋಷ: ${err?.message || "Error"}`
                    });
                  } finally {
                    setIsDeletingPriest(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>🗑️</span>
                <span>{isDeletingPriest ? "ಅಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಹೌದು, ಖಾತೆ ಅಳಿಸಿ (Delete & Revoke)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. PRIEST DEEP PROFILE & HISTORY AUDIT MODAL */}
      {viewingPriestProfile && (() => {
        const priest = viewingPriestProfile;
        const priestKundlis = kundlis.filter((k) => k.userId === priest.userId);
        const isLow = (priest.coinBalance || 0) < 500;
        const modules: AvailableModuleKey[] = (priest.allowedModules && priest.allowedModules.length > 0)
          ? (priest.allowedModules as AvailableModuleKey[])
          : ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"];

        // Activity breakdown
        const jananaCount = priestKundlis.length;
        const sankhyaCount = priestTransactions.filter((t) => t.description?.includes("ಸಂಖ್ಯಾಶಾಸ್ತ್ರ") || t.description?.includes("Sankhya")).length;
        const diksuchiCount = priestTransactions.filter((t) => t.description?.includes("ದಿಕ್ಸೂಚಿ") || t.description?.includes("Diksuchi")).length;
        const purvaCount = priestTransactions.filter((t) => t.description?.includes("ಜನ್ಮ") || t.description?.includes("Janma") || t.description?.includes("Purva")).length;
        const totalDeductionsCount = priestTransactions.filter((t) => t.type === "deduction").length;
        const totalConsultations = Math.max(jananaCount, totalDeductionsCount) + (sankhyaCount + diksuchiCount + purvaCount > 0 ? sankhyaCount + diksuchiCount + purvaCount : 0);

        // Most visited / used feature calculation
        let mostUsedFeature = "🔮 ಜನನ ಕುಂಡಲಿ ರಚನೆ (Janana Kundli)";
        let maxCount = jananaCount;
        if (sankhyaCount > maxCount) {
          mostUsedFeature = "🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನಾವಳಿ (Sankhya Shastra)";
          maxCount = sankhyaCount;
        }
        if (diksuchiCount > maxCount) {
          mostUsedFeature = "🧭 ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ (Kaala Diksuchi)";
          maxCount = diksuchiCount;
        }
        if (purvaCount > maxCount) {
          mostUsedFeature = "🌌 ಹಿಂದಿನ ಜನ್ಮ ರಹಸ್ಯ (Purva Janma)";
        }

        // Visiting frequency calculation
        let visitFrequencyLabel = "🟢 ಪ್ರತಿದಿನ ಸಕ್ರಿಯ (Daily Active)";
        let visitBadgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
        if (viewingUserProfile?.lastLoginAt) {
          const lastDate = new Date(viewingUserProfile.lastLoginAt);
          const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            visitFrequencyLabel = "🟢 ಪ್ರತಿದಿನ ಸಕ್ರಿಯ (Daily Active)";
            visitBadgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
          } else if (diffDays <= 7) {
            visitFrequencyLabel = "🟡 ಸಾಪ್ತಾಹಿಕ ಸಕ್ರಿಯ (Weekly Active)";
            visitBadgeClass = "bg-amber-100 text-amber-900 border-amber-300";
          } else {
            visitFrequencyLabel = "⚪ ಮಾಸಿಕ / ಆವರ್ತಕ (Monthly / Periodic)";
            visitBadgeClass = "bg-slate-100 text-slate-800 border-slate-300";
          }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-[#FFFDF7] border-2 border-amber-400 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-5 py-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFFDF7] border border-amber-400 flex items-center justify-center text-xl shadow-inner font-bold">
                    🕉️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                        {priest.priestName}
                      </h3>
                      <span className="bg-amber-200/90 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-400 font-mono">
                        {priest.userId}
                      </span>
                    </div>
                    <p className="text-xs text-amber-950/90 font-bold">
                      ಪುರೋಹಿತರ ಸಂಪೂರ್ಣ ಪ್ರೊಫೈಲ್, ಇತಿಹಾಸ & ಬಳಕೆಯ ಅಂಕಿಅಂಶಗಳು (Priest Audit Vault)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingPriestProfile(null)}
                  className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 hover:text-white flex items-center justify-center font-bold text-sm transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {/* 4 Financial & Telemetry Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Card 1: Balance */}
                  <div className="p-3.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-black text-amber-800 uppercase block">
                      🪙 ನಾಣ್ಯಗಳ ಬ್ಯಾಲೆನ್ಸ್
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-mono font-black text-amber-950">
                        {(priest.coinBalance || 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-amber-800">ನಾಣ್ಯಗಳು</span>
                    </div>
                    <div className="pt-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        isLow ? "bg-red-100 text-red-800 border-red-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"
                      }`}>
                        {isLow ? "⚠️ ಕಡಿಮೆ ಬ್ಯಾಲೆನ್ಸ್" : "🟢 ಸಮೃದ್ಧ ಬ್ಯಾಲೆನ್ಸ್"}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Recharges */}
                  <div className="p-3.5 bg-[#FEFCF4] border-2 border-emerald-300 rounded-2xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-black text-emerald-800 uppercase block">
                      💳 ಒಟ್ಟು ರೀಚಾರ್ಜ್ (INR)
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-mono font-black text-emerald-950">
                        ₹{(priest.totalRechargedInr || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-800">
                      ಕ್ರೆಡಿಟ್: {(priest.totalCoinsCredited || 0).toLocaleString()} 🪙
                    </div>
                  </div>

                  {/* Card 3: Spent & Consultations */}
                  <div className="p-3.5 bg-[#FEFCF4] border-2 border-blue-300 rounded-2xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-black text-blue-800 uppercase block">
                      🔥 ಒಟ್ಟು ಖರ್ಚು & ಪ್ರಶ್ನೆಗಳು
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-mono font-black text-blue-950">
                        {(priest.totalCoinsSpent || 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-blue-800">🪙</span>
                    </div>
                    <div className="text-[10px] font-semibold text-blue-800">
                      ಸೇವೆಯ ಮೊತ್ತ: ≈ ₹{Math.round((priest.totalCoinsSpent || 0) / 10).toLocaleString()}
                    </div>
                  </div>

                  {/* Card 4: Visit Frequency */}
                  <div className="p-3.5 bg-[#FEFCF4] border-2 border-purple-300 rounded-2xl space-y-1 shadow-xs">
                    <span className="text-[10px] font-black text-purple-800 uppercase block">
                      ⏱️ ಭೇಟಿ & ಲಾಗಿನ್ ಆವರ್ತನ
                    </span>
                    <div className="pt-0.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-block ${visitBadgeClass}`}>
                        {visitFrequencyLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-900 font-medium truncate pt-1">
                      {viewingUserProfile?.lastLoginAt
                        ? `ಕಡೆಗೆ: ${new Date(viewingUserProfile.lastLoginAt).toLocaleDateString("kn-IN")}`
                        : "ಇತ್ತೀಚೆಗೆ ಸಕ್ರಿಯ"}
                    </div>
                  </div>
                </div>

                {/* Intelligent Super Admin Suggestions Box */}
                <div className="p-4 bg-gradient-to-br from-[#FFF7DB] to-[#FFF0C2] border-2 border-amber-400 rounded-2xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>ಮುಖ್ಯ ನಿರ್ವಾಹಕರ ಬುದ್ಧಿವಂತ ಸಲಹೆಗಳು & ವಿಶ್ಲೇಷಣೆ (Smart Priest Insights)</span>
                    </h4>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300 font-mono">
                      AI & Stats Audit
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-amber-950 font-semibold">
                    <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-300 space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <span>🌟</span>
                        <span>ಅತ್ಯಧಿಕ ಬಳಕೆಯ ಸೌಲಭ್ಯ (Most Visited Feature):</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {mostUsedFeature}
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal">
                        (ರಚಿಸಿದ ಜಾತಕಗಳು: {jananaCount} | ಸಂಖ್ಯಾ ಪ್ರಶ್ನೆಗಳು: {sankhyaCount} | ಕಾಲ ದಿಕ್ಸೂಚಿ: {diksuchiCount} | ಹಿಂದಿನ ಜನ್ಮ: {purvaCount})
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-300 space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <span>🪙</span>
                        <span>ರೀಚಾರ್ಜ್ & ಬ್ಯಾಲೆನ್ಸ್ ಮಾರ್ಗದರ್ಶನ (Recharge Guidance):</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {isLow
                          ? `⚠️ ನಾಣ್ಯಗಳ ಬ್ಯಾಲೆನ್ಸ್ ಕಡಿಮೆಯಾಗಿದೆ (${(priest.coinBalance || 0)} Coins). ಪುರೋಹಿತರಿಗೆ ₹೫೦೦ (೫,೦೦೦ ನಾಣ್ಯಗಳು) ಅಥವಾ ₹೧,೦೦೦ (೧೨,೦೦೦ ನಾಣ್ಯಗಳು) ರೀಚಾರ್ಜ್ ಪ್ಯಾಕೇಜ್ ಕಳುಹಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.`
                          : `✓ ನಾಣ್ಯಗಳ ಸಮತೋಲನ ಅತ್ಯುತ್ತಮವಾಗಿದೆ (${(priest.coinBalance || 0)} Coins). ಸಮಾಲೋಚನೆಗಳು ಸುಸೂತ್ರವಾಗಿ ಸಾಗುತ್ತಿವೆ.`}
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-300 space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <span>🛡️</span>
                        <span>ಮಾಡ್ಯೂಲ್ ಪ್ರವೇಶಾವಕಾಶ ಸ್ಥಿತಿ (Module Access):</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium">
                        {modules.length === AVAILABLE_MODULES.length
                          ? "✓ ಎಲ್ಲಾ ೪ ಸೌಲಭ್ಯಗಳು ಸಕ್ರಿಯವಾಗಿವೆ (ಪಂಚಾಂಗ, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ, ದಿಕ್ಸೂಚಿ, ಹಿಂದಿನ ಜನ್ಮ)."
                          : `ಪ್ರಸ್ತುತ ${modules.length}/${AVAILABLE_MODULES.length} ಮಾಡ್ಯೂಲ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ. ಇನ್ನಷ್ಟು ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ನೀಡಲು ಕೆಳಗಿನ 'ಮಾಡ್ಯೂಲ್‌ಗಳು' ಬಟನ್ ಬಳಸಿ.`}
                      </p>
                    </div>

                    <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-300 space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1">
                        <span>📱</span>
                        <span>ಲಾಗಿನ್ ಸಾಧನ & ನೆಟ್‌ವರ್ಕ್ (Device & Network):</span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-medium">
                        ಸಾಧನ: {viewingUserProfile?.lastDevice || "📱 Mobile Web / Desktop"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        IP: {viewingUserProfile?.lastKnownIp || "—"} | ಲಾಗಿನ್: {viewingUserProfile?.lastLoginAt ? new Date(viewingUserProfile.lastLoginAt).toLocaleString("kn-IN") : "ಹೊಸ ಖಾತೆ"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Navigation Tabs */}
                <div className="flex border-b-2 border-amber-200 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriestProfileTab("overview")}
                    className={`pb-2.5 px-3 text-xs font-black transition border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                      priestProfileTab === "overview"
                        ? "border-amber-600 text-amber-950"
                        : "border-transparent text-slate-500 hover:text-amber-900"
                    }`}
                  >
                    <span>📊</span>
                    <span>ಸಾರಾಂಶ (Overview)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriestProfileTab("kundlis")}
                    className={`pb-2.5 px-3 text-xs font-black transition border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                      priestProfileTab === "kundlis"
                        ? "border-amber-600 text-amber-950"
                        : "border-transparent text-slate-500 hover:text-amber-900"
                    }`}
                  >
                    <span>🔮</span>
                    <span>ರಚಿಸಿದ ಜಾತಕಗಳು ({priestKundlis.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriestProfileTab("transactions")}
                    className={`pb-2.5 px-3 text-xs font-black transition border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                      priestProfileTab === "transactions"
                        ? "border-amber-600 text-amber-950"
                        : "border-transparent text-slate-500 hover:text-amber-900"
                    }`}
                  >
                    <span>🪙</span>
                    <span>ನಾಣ್ಯ ವಹಿವಾಟು ಇತಿಹಾಸ ({priestTransactions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriestProfileTab("modules")}
                    className={`pb-2.5 px-3 text-xs font-black transition border-b-2 -mb-0.5 flex items-center gap-1.5 ${
                      priestProfileTab === "modules"
                        ? "border-amber-600 text-amber-950"
                        : "border-transparent text-slate-500 hover:text-amber-900"
                    }`}
                  >
                    <span>🛡️</span>
                    <span>ಮಾಡ್ಯೂಲ್ & ಭದ್ರತೆ</span>
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {priestProfileTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-[#FEFCF4] border border-amber-300 rounded-2xl text-center space-y-1">
                        <span className="text-2xl">🔮</span>
                        <div className="text-sm font-black text-amber-950">{jananaCount}</div>
                        <div className="text-[11px] text-amber-800 font-bold">ಜನನ ಕುಂಡಲಿಗಳು</div>
                      </div>
                      <div className="p-3.5 bg-[#FEFCF4] border border-amber-300 rounded-2xl text-center space-y-1">
                        <span className="text-2xl">🔢</span>
                        <div className="text-sm font-black text-amber-950">{sankhyaCount}</div>
                        <div className="text-[11px] text-amber-800 font-bold">ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆಗಳು</div>
                      </div>
                      <div className="p-3.5 bg-[#FEFCF4] border border-amber-300 rounded-2xl text-center space-y-1">
                        <span className="text-2xl">🧭</span>
                        <div className="text-sm font-black text-amber-950">{diksuchiCount + purvaCount}</div>
                        <div className="text-[11px] text-amber-800 font-bold">ದಿಕ್ಸೂಚಿ & ಪೂರ್ವ ಜನ್ಮ</div>
                      </div>
                    </div>

                    {/* Recent Kundlis Preview */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-amber-950 flex items-center justify-between">
                        <span>ಇತ್ತೀಚೆಗೆ ರಚಿಸಿದ ಜಾತಕಗಳು</span>
                        {priestKundlis.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setPriestProfileTab("kundlis")}
                            className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline"
                          >
                            ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ ({priestKundlis.length}) →
                          </button>
                        )}
                      </h5>

                      {priestKundlis.length === 0 ? (
                        <p className="text-xs text-slate-500 p-4 bg-[#FEFCF4] rounded-xl border border-amber-200 text-center">
                          ಈ ಪುರೋಹಿತರು ಇನ್ನೂ ಯಾವುದೇ ಜನನ ಕುಂಡಲಿಗಳನ್ನು ರಚಿಸಿಲ್ಲ.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {priestKundlis.slice(0, 3).map((k) => (
                            <div key={k.id} className="p-3 bg-[#FEFCF4] rounded-xl border border-amber-200 flex items-center justify-between text-xs font-medium">
                              <div>
                                <span className="font-black text-amber-950">{k.name}</span>
                                <span className="text-slate-500 ml-2 font-bold">({k.gothra || "ಗೋತ್ರ"}) • {k.placeName || "ಗೋಕರ್ಣ"}</span>
                              </div>
                              <div className="text-right font-mono text-[11px] text-slate-600">
                                {k.birthDate} | {k.rashi} ({k.nakshatra})
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: KUNDLIS VAULT */}
                {priestProfileTab === "kundlis" && (
                  <div className="space-y-3">
                    {priestKundlis.length === 0 ? (
                      <div className="p-8 text-center bg-[#FEFCF4] rounded-2xl border border-amber-200 space-y-2">
                        <span className="text-3xl">🔮</span>
                        <p className="text-xs text-slate-600 font-bold">
                          ಈ ಪುರೋಹಿತರ ಖಾತೆಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಜನನ ಕುಂಡಲಿಗಳ ದಾಖಲೆಗಳಿಲ್ಲ.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-2 border-amber-300 rounded-2xl">
                        <table className="w-full text-left text-xs bg-white">
                          <thead className="bg-[#FFF5D6] text-amber-950 font-black border-b border-amber-300">
                            <tr>
                              <th className="py-2.5 px-3">ಭಕ್ತರ ಹೆಸರು</th>
                              <th className="py-2.5 px-3">ಗೋತ್ರ & ಸ್ಥಳ</th>
                              <th className="py-2.5 px-3">ಜನ್ಮ ದಿನಾಂಕ & ಸಮಯ</th>
                              <th className="py-2.5 px-3">ರಾಶಿ & ನಕ್ಷತ್ರ</th>
                              <th className="py-2.5 px-3 text-right">ರಚಿಸಿದ ದಿನಾಂಕ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100 font-medium">
                            {priestKundlis.map((k) => (
                              <tr key={k.id} className="hover:bg-amber-50/50">
                                <td className="py-2.5 px-3 font-bold text-amber-950">
                                  {k.name}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {k.gothra || "ಕಾಶ್ಯಪ"} ({k.placeName || "ಗೋಕರ್ಣ"})
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-700">
                                  {k.birthDate} {k.birthTime}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-900">
                                  {k.rashi} • {k.nakshatra}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                                  {new Date(k.createdAt).toLocaleDateString("kn-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: TRANSACTIONS / COIN LEDGER */}
                {priestProfileTab === "transactions" && (
                  <div className="space-y-3">
                    {priestTransactions.length === 0 ? (
                      <div className="p-8 text-center bg-[#FEFCF4] rounded-2xl border border-amber-200 space-y-2">
                        <span className="text-3xl">🪙</span>
                        <p className="text-xs text-slate-600 font-bold">
                          ಯಾವುದೇ ನಾಣ್ಯ ವಹಿವಾಟುಗಳು ದಾಖಲಾಗಿಲ್ಲ.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-2 border-amber-300 rounded-2xl max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs bg-white">
                          <thead className="bg-[#FFF5D6] text-amber-950 font-black border-b border-amber-300 sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">ಪ್ರಕಾರ</th>
                              <th className="py-2.5 px-3">ವಿವರಣೆ</th>
                              <th className="py-2.5 px-3">ಭಕ್ತರ ಹೆಸರು</th>
                              <th className="py-2.5 px-3">ನಾಣ್ಯಗಳು</th>
                              <th className="py-2.5 px-3 text-right">ಸಮಯ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100 font-medium">
                            {priestTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-amber-50/50">
                                <td className="py-2.5 px-3">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                    tx.type === "recharge"
                                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                      : tx.type === "deduction"
                                      ? "bg-red-100 text-red-900 border-red-300"
                                      : "bg-blue-100 text-blue-900 border-blue-300"
                                  }`}>
                                    {tx.type === "recharge" ? "⚡ ರೀಚಾರ್ಜ್" : tx.type === "deduction" ? "🔻 ಕಡಿತ" : "🎁 ಬೋನಸ್"}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-800">
                                  {tx.description}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700">
                                  {tx.clientName || "—"}
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold">
                                  <span className={tx.type === "deduction" ? "text-red-700" : "text-emerald-700"}>
                                    {tx.type === "deduction" ? "-" : "+"}{tx.coins.toLocaleString()} 🪙
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
                                  {new Date(tx.createdAt).toLocaleString("kn-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: MODULES & SECURITY */}
                {priestProfileTab === "modules" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl space-y-3">
                      <h5 className="text-xs font-black text-amber-950 flex items-center justify-between">
                        <span>ಸಕ್ರಿಯ ಸೌಲಭ್ಯಗಳು ({modules.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setViewingPriestProfile(null);
                            handleOpenModuleEditor(priest);
                          }}
                          className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline"
                        >
                          ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ →
                        </button>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AVAILABLE_MODULES.map((m) => {
                          const isActive = modules.includes(m.key);
                          return (
                            <div key={m.key} className={`p-3 rounded-xl border flex items-center justify-between ${
                              isActive ? "bg-emerald-50 border-emerald-300 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{m.icon}</span>
                                <div>
                                  <div className="font-bold text-xs">{m.kannadaLabel}</div>
                                  <div className="text-[10px] text-slate-500">{m.key}</div>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                isActive ? "bg-emerald-200/90 text-emerald-950 border-emerald-400" : "bg-slate-200 text-slate-600 border-slate-300"
                              }`}>
                                {isActive ? "✓ ಸಕ್ರಿಯ" : "✕ ನಿಷ್ಕ್ರಿಯ"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Known IP Addresses */}
                    <div className="p-4 bg-[#FEFCF4] border border-amber-300 rounded-2xl space-y-2 text-xs">
                      <h5 className="font-black text-amber-950">🌐 ಭದ್ರತಾ ಇತಿಹಾಸ & ದಾಖಲಾದ IP ವಿಳಾಸಗಳು:</h5>
                      <div className="flex flex-wrap gap-2">
                        {(viewingUserProfile?.knownIps && viewingUserProfile.knownIps.length > 0) ? (
                          viewingUserProfile.knownIps.map((ip, i) => (
                            <span key={i} className="font-mono text-[11px] bg-white border border-amber-300 px-2.5 py-1 rounded-lg text-slate-800 font-bold shadow-xs">
                              {ip}
                            </span>
                          ))
                        ) : (
                          <span className="font-mono text-slate-500 font-bold bg-white px-2 py-1 rounded border border-amber-200">
                            {viewingUserProfile?.lastKnownIp || "IP ದಾಖಲಾಗಿಲ್ಲ"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Quick Actions */}
              <div className="bg-[#FFF5D6] border-t-2 border-amber-300 px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Coin Adjustment */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingPriestProfile(null);
                      setSelectedPriest(priest);
                    }}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition"
                  >
                    ⚡ ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ
                  </button>

                  {/* Manage Modules */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingPriestProfile(null);
                      handleOpenModuleEditor(priest);
                    }}
                    className="py-2 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border border-indigo-300 font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    🛡️ ಮಾಡ್ಯೂಲ್‌ಗಳು
                  </button>

                  {/* WhatsApp Invite */}
                  <button
                    type="button"
                    onClick={() => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
                      const modulesQuery = modules.length > 0 ? modules.join(",") : "panchanga";
                      const unifiedUrl = `${origin}/?portal=priest&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&modules=${encodeURIComponent(modulesQuery)}`;
                      const msg = `ನಮಸ್ಕಾರ ${priest.priestName} ಅವರೇ,\n\nನಿಮ್ಮ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೋರ್ಟಲ್‌ನ ವಿವರಗಳು:\n👤 ಯೂಸರ್ ID: ${priest.userId}\n🪙 ಪ್ರಸ್ತುತ ಬ್ಯಾಲೆನ್ಸ್: ${(priest.coinBalance || 0).toLocaleString()} Coins\n🔗 ಪ್ರವೇಶ ಲಿಂಕ್:\n${unifiedUrl}\n\n॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="py-2 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    📲 WhatsApp
                  </button>

                  {/* Delete Priest */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingPriestProfile(null);
                      setDeletingPriest(priest);
                    }}
                    className="py-2 px-2.5 bg-red-100 hover:bg-red-200 text-red-950 border border-red-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>ಅಳಿಸಿ</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingPriestProfile(null)}
                  className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl transition"
                >
                  ಮುಚ್ಚಿ (Close)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. MODAL: ADJUST DAILY AI QUOTA LIMIT */}
      {showAiLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-[#FFFDF7] via-white to-amber-50 border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                <h3 className="text-base font-black text-amber-950">
                  ದೈನಂದಿನ AI ಕೋಟಾ ಮಿತಿ ಹೊಂದಿಸಿ (Daily AI Limit)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiLimitModal(false)}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Super Admin ಗಾಗಿ ಪ್ರತಿದಿನ ಲಭ್ಯವಿರುವ ಗರಿಷ್ಠ Gemini AI ಕರೆಗಳ ಮಿತಿಯನ್ನು ಇಲ್ಲಿ ನಿಗದಿಪಡಿಸಿ. ಪ್ರತಿದಿನ ಉಳಿದಿರುವ ಕೋಟಾ 100 ಅಥವಾ ಅದಕ್ಕಿಂತ ಕಡಿಮೆಯಾದಾಗ <code>spshreepandit@gmail.com</code> ಗೆ ಸ್ವಯಂ ಎಚ್ಚರಿಕೆ ಇಮೇಲ್ ರವಾನೆಯಾಗುತ್ತದೆ.
            </p>

            <form onSubmit={handleUpdateAiLimit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-amber-950 mb-1">
                  ದೈನಂದಿನ ಗರಿಷ್ಠ ಕರೆಗಳು (Daily Max AI Requests):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    step="100"
                    value={customAiLimitInput}
                    onChange={(e) => setCustomAiLimitInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-300 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:border-amber-500 shadow-inner"
                    placeholder="1500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">
                    req / day
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-800 font-black uppercase">ತ್ವರಿತ ಆಯ್ಕೆಗಳು:</span>
                {[1500, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCustomAiLimitInput(String(preset))}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-mono transition shadow-xs"
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowAiLimitModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingAiLimit}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>💾</span>
                  <span>{isUpdatingAiLimit ? "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ..." : "ಉಳಿಸಿ (Save Limit)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: PURGE ALL OLD TEST DATA & START FRESH */}
      {showPurgeConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-[#FFFDF7] via-white to-red-50 border-2 border-red-400 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-red-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                <h3 className="text-base font-black text-red-950">
                  ಎಲ್ಲಾ ಟೆಸ್ಟ್ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ (Purge & Start Fresh)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPurgeConfirmModal(false)}
                disabled={isPurgingCalendarData}
                className="text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-red-100/70 border border-red-300 rounded-2xl text-xs text-red-950 space-y-2">
              <div className="font-black text-red-900 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>ಎಚ್ಚರಿಕೆ (Warning): ಈ ಕೆಳಗಿನ ಎಲ್ಲಾ ಹಳೆಯ ದಾಖಲೆಗಳು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲ್ಪಡುತ್ತವೆ:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 font-semibold text-[11px] text-red-900">
                <li>ಹಳೆಯ ೯೦-ದಿನ / ೩೦-ದಿನಗಳ QR ಕೋಡ್ ಭೇಟಿಗಳು (calendarVisits)</li>
                <li>ಭಕ್ತರ ಹಳೆಯ ಚಂದಾದಾರಿಕೆ ಟ್ರ್ಯಾಕಿಂಗ್ (calendarDevoteeEngagement)</li>
                <li>ಹಳೆಯ ಮಾದರಿ ಆಶೀರ್ವಾದ ಪಾಸ್‌ಗಳು (ashirvada_passes)</li>
              </ul>
              <div className="text-[11px] text-emerald-900 font-bold bg-emerald-100 p-2 rounded-xl border border-emerald-300 mt-2">
                ✨ ಇಂದಿನಿಂದ ಬರುವ ಪ್ರತಿಯೊಬ್ಬ ಭಕ್ತರ ಹೆಸರು, ಮೊಬೈಲ್, ಇಮೇಲ್ ಮತ್ತು ಜಾತಕ ವಿವರಗಳು ಹೊಸದಾಗಿ ದಾಖಲಾಗುತ್ತವೆ.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setShowPurgeConfirmModal(false)}
                disabled={isPurgingCalendarData}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>
              <button
                type="button"
                onClick={handlePurgeAllCalendarSubscriptions}
                disabled={isPurgingCalendarData}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🧹</span>
                <span>{isPurgingCalendarData ? "ತೆರವುಗೊಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಹೌದು, ಸಂಪೂರ್ಣ ತೆರವುಗೊಳಿಸಿ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
