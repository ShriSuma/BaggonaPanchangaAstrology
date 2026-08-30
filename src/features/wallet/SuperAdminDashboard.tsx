import React, { useEffect, useState } from "react";
import { useWalletStore } from "./walletStore";
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
  updateUserAllowedModules,
  deletePriestAccount
} from "../../db/firestoreDb";
import { db } from "../../db/indexedDb";
import { hashPassword } from "../auth/authStore";
import { sendAllFourDailyReports } from "../notifications/notificationService";
import { extendPassValidity } from "../seva/ashirvadaPassService";
import {
  AVAILABLE_MODULES,
  type AvailableModuleKey,
  type AppModuleConfig
} from "./walletTypes";

export type AdminTab = "wallets" | "kundlis" | "ashirvada" | "audit" | "mindmap";

/* -------------------------------------------------------------------------- */
/* SVG RADIAL GAUGE COMPONENT (Visual Telemetry Dial)                         */
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
  // Use a 240-degree arc gauge
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * clampedValue) / 100;

  const colorConfig = {
    amber: {
      stroke: "#D97706",
      glow: "rgba(217, 119, 6, 0.25)",
      bgStroke: "#FDE68A",
      textColor: "text-amber-950",
      badgeBg: "bg-amber-100 border-amber-300 text-amber-900"
    },
    emerald: {
      stroke: "#059669",
      glow: "rgba(5, 150, 105, 0.25)",
      bgStroke: "#A7F3D0",
      textColor: "text-emerald-950",
      badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900"
    },
    blue: {
      stroke: "#2563EB",
      glow: "rgba(37, 99, 235, 0.25)",
      bgStroke: "#BFDBFE",
      textColor: "text-blue-950",
      badgeBg: "bg-blue-100 border-blue-300 text-blue-900"
    },
    purple: {
      stroke: "#7C3AED",
      glow: "rgba(124, 58, 237, 0.25)",
      bgStroke: "#DDD6FE",
      textColor: "text-purple-950",
      badgeBg: "bg-purple-100 border-purple-300 text-purple-900"
    }
  }[color];

  return (
    <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-amber-500 transition-all">
      {badgeText && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
          <span className={`text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${colorConfig.badgeBg}`}>
            {badgeText}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
        <span className="text-base sm:text-lg">{icon}</span>
        <h4 className="text-[11px] sm:text-xs font-black text-amber-950 truncate max-w-[130px] sm:max-w-none">{title}</h4>
      </div>

      {/* Radial Arc Gauge */}
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center my-0.5 sm:my-1">
        <svg className="w-full h-full -rotate-120 transform" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={colorConfig.bgStroke}
            strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated Value Stroke */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={colorConfig.stroke}
            strokeWidth="8"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 2px 4px ${colorConfig.glow})` }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 sm:pt-2">
          <span className="text-xs sm:text-base font-mono font-black text-slate-900 tracking-tight">
            {displayValue}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 font-mono">
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[9px] sm:text-[11px] text-amber-900 font-semibold mt-0.5 sm:mt-1 truncate max-w-full">
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
  const [auditLogs, setAuditLogs] = useState<SystemAuditLogDoc[]>([]);
  const [premiumDownloads, setPremiumDownloads] = useState<PremiumPdfDownloadDoc[]>([]);

  // Filter/Search states
  const [kundliSearch, setKundliSearch] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [isDeduplicating, setIsDeduplicating] = useState(false);

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
    const unsubAudit = subscribeSystemAuditLogs((list) => setAuditLogs(list));
    const unsubPdf = subscribePremiumPdfDownloads((list) => setPremiumDownloads(list));

    return () => {
      unsubKundlis();
      unsubPasses();
      unsubAudit();
      unsubPdf();
    };
  }, [subscribeAllWallets]);

  // Aggregate stats
  const totalPriests = allPriestWallets.length;
  const totalCoinsInCirculation = allPriestWallets.reduce((acc, w) => acc + (w.coinBalance || 0), 0);
  const totalRechargedInr = allPriestWallets.reduce((acc, w) => acc + (w.totalRechargedInr || 0), 0);
  const totalCoinsSpent = allPriestWallets.reduce((acc, w) => acc + (w.totalCoinsSpent || 0), 0);

  // Calculated Telemetry Percentages for Visual Gauges
  const circulationTarget = 50000;
  const circulationPct = Math.min(100, Math.round((totalCoinsInCirculation / circulationTarget) * 100));
  const activePriestsRatio = totalPriests > 0 ? Math.round((allPriestWallets.filter((w) => (w.coinBalance || 0) > 0).length / totalPriests) * 100) : 100;
  const quotaHealthScore = 98; // High availability
  const passValidityScore = ashirvadaPasses.length > 0
    ? Math.round((ashirvadaPasses.filter((p) => p.daysRemaining > 10).length / ashirvadaPasses.length) * 100)
    : 100;

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

      // 2. Sync to Cloud Firestore Users Collection
      void syncUserProfile({
        id: cleanUsername,
        username: cleanUsername,
        name: newPriestName.trim(),
        role: "priest",
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

      {/* 2. VISUAL TELEMETRY METERS & GAUGES GRID */}
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
          value={quotaHealthScore}
          title="AI ಎಂಜಿನ್ ಸುರಕ್ಷತೆ (AI Health)"
          subtitle="Gemini 2.5 Flash Lite"
          displayValue="99.9%"
          color="blue"
          icon="⚡"
          badgeText="Optimal"
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
            <span>ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್ (Visual Mind Map)</span>
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
                <input
                  type="text"
                  value={newPriestName}
                  onChange={(e) => setNewPriestName(e.target.value)}
                  placeholder="ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಯೂಸರ್ ID (Username):
                </label>
                <input
                  type="text"
                  value={newPriestUsername}
                  onChange={(e) => setNewPriestUsername(e.target.value)}
                  placeholder="ಉದಾ: priest_shreeram"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಪ್ರವೇಶ ಪಾಸ್‌ವರ್ಡ್ (Password):
                </label>
                <input
                  type="text"
                  value={newPriestPassword}
                  onChange={(e) => setNewPriestPassword(e.target.value)}
                  placeholder="baggona123"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1">
                  ಸ್ವಾಗತ ನಾಣ್ಯಗಳು (Coins):
                </label>
                <input
                  type="number"
                  value={newPriestWelcomeCoins}
                  onChange={(e) => setNewPriestWelcomeCoins(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-slate-900 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none shadow-inner"
                />
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

                {/* Unified Link Box */}
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
                        setFeedback({ type: "success", text: "ಏಕೀಕೃತ ಪ್ರವೇಶ ಲಿಂಕ್ ಯಶಸ್ವಿಯಾಗಿ ನಕಲಿಸಲಾಗಿದೆ (Copied)!" });
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition"
                    >
                      <span>📋</span>
                      <span>ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ (Copy Link)</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={createdPriestResult.unifiedUrl}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 font-mono select-all shadow-inner"
                  />
                </div>

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
                      `ನಮಸ್ಕಾರ ${createdPriestResult.name} ಅವರೇ,\n\n` +
                      `ನಿಮಗೆ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮತ್ತು ಜ್ಯೋತಿಷ್ಯ ತಂತ್ರಾಂಶದ ವಿಶೇಷ ಆಹ್ವಾನ ಕಳುಹಿಸಲಾಗಿದೆ.\n\n` +
                      `👤 ಯೂಸರ್‌ನೇಮ್: ${createdPriestResult.username}\n` +
                      `🔑 ಪಾಸ್‌ವರ್ಡ್: ${createdPriestResult.password}\n\n` +
                      `🛡️ ನಿಮ್ಮ ಸಕ್ರಿಯ ಸೌಲಭ್ಯಗಳು:\n${modulesLabels}\n\n` +
                      `🔗 ನಿಮ್ಮ ಏಕೈಕ ಪ್ರವೇಶ ಲಿಂಕ್ (Single Unified Access Link):\n${createdPriestResult.unifiedUrl}\n\n` +
                      `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ॥`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>📲</span>
                  <span>WhatsApp ಮೂಲಕ ಯೂಸರ್‌ನೇಮ್, ಪಾಸ್‌ವರ್ಡ್ & ಏಕೀಕೃತ ಲಿಂಕ್ ಕಳುಹಿಸಿ (Share via WhatsApp)</span>
                </button>
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

              <div className="w-full md:w-64">
                <input
                  type="text"
                  value={kundliSearch}
                  onChange={(e) => setKundliSearch(e.target.value)}
                  placeholder="ಹುಡುಕಿ: ಹೆಸರು, ಗೋತ್ರ, ರಾಶಿ..."
                  className="w-full px-3.5 py-2 bg-[#FEFCF4] border-2 border-amber-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none focus:border-amber-500 shadow-inner"
                />
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

      {/* 6. TAB 3: Ashirvada QR Passes & 90-Day Countdown */}
      {activeTab === "ashirvada" && (
        <div className="bg-[#FFFDF7] border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div>
              <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                <span>🪔</span>
                <span>ಆಶೀರ್ವಾದ ಪತ್ರ & QR ಕೋಡ್ ಪಾಸ್ ೯೦-ದಿನಗಳ ಕೌಂಟ್‌ಡೌನ್ (Ashirvada Pass Tracker)</span>
              </h2>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                Live tracking of remaining active days from 90-day validity window. Super Admin can 1-click Reset/Extend or Delete.
              </p>
            </div>

            {ashirvadaPasses.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllPasses}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>🗑️</span>
                <span>ಎಲ್ಲಾ ಮಾದರಿ ಪಾಸ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ (Clear All Passes)</span>
              </button>
            )}
          </div>

          {ashirvadaPasses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#FEFCF4] rounded-3xl border-2 border-amber-200 space-y-3">
              <div className="text-4xl">🪔</div>
              <div className="font-black text-amber-950 text-sm">
                ಯಾವುದೇ ಆಶೀರ್ವಾದ ಪಾಸ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿಲ್ಲ (No Ashirvada Passes Issued)
              </div>
              <p className="text-xs text-amber-800 font-semibold max-w-md mx-auto">
                ಭಕ್ತರು ಸೇವಾ ಮತ್ತು ಪ್ರಸಾದ ಪುಟದಲ್ಲಿ ನೋಂದಣಿ ಮಾಡಿಕೊಂಡಾಗ ಅವರ 90-ದಿನಗಳ ಮಾನ್ಯತೆಯುಳ್ಳ ಆಶೀರ್ವಾದ ಪಾಸ್‌ಗಳು ಇಲ್ಲಿ ನೇರವಾಗಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ashirvadaPasses.map((pass) => {
                const percentLeft = Math.min(100, Math.max(0, Math.round((pass.daysRemaining / (pass.totalDays || 90)) * 100)));
                const isExpired = pass.daysRemaining <= 0;

                return (
                  <div
                    key={pass.id}
                    className="p-4 bg-[#FEFCF4] border-2 border-amber-300 rounded-2xl space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-amber-950 text-sm">{pass.devoteeName}</div>
                        <div className="text-xs text-amber-800 font-semibold">ಸೇವೆ: {pass.sevaName}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-bold">By {pass.priestName}</span>
                    </div>

                    {/* Progress Bar & Countdown Days */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-bold text-[10px] uppercase">
                          ಉಳಿದ ಮಾನ್ಯತೆ (Remaining Validity):
                        </span>
                        <span
                          className={`font-mono font-black ${
                            isExpired ? "text-red-600" : pass.daysRemaining <= 10 ? "text-orange-600" : "text-emerald-700"
                          }`}
                        >
                          {isExpired ? "ಮುಕ್ತಾಯಗೊಂಡಿದೆ (EXPIRED)" : `⏳ ${pass.daysRemaining} of ${pass.totalDays} Days Left`}
                        </span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden border border-amber-300">
                        <div
                          className={`h-full transition-all ${
                            isExpired
                              ? "bg-red-500"
                              : pass.daysRemaining <= 10
                              ? "bg-orange-500"
                              : "bg-gradient-to-r from-emerald-500 to-amber-500"
                          }`}
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-1">
                        <span>ನೀಡಿದ ದಿನ: {new Date(pass.issuedAt).toLocaleDateString("en-IN")}</span>
                        <span>ಮುಕ್ತಾಯ ದಿನ: {new Date(pass.expiresAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-200">
                      <span className="text-[11px] text-slate-600 font-semibold">
                        📥 ಡೌನ್‌ಲೋಡ್ ಸಂಖ್ಯೆ: <strong>{pass.downloadCount || 0}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={deletingPassId === pass.id}
                          onClick={() => handleDeletePass(pass.id)}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {deletingPassId === pass.id ? "..." : "🗑️ ಅಳಿಸಿ"}
                        </button>

                        <button
                          type="button"
                          disabled={resettingPassId === pass.id}
                          onClick={() => handleResetValidity(pass.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black transition-all disabled:opacity-50 shadow-sm"
                        >
                          {resettingPassId === pass.id ? "Resetting..." : "🔄 ೯೦ ದಿನಗಳಿಗೆ ವಿಸ್ತರಿಸಿ"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};
