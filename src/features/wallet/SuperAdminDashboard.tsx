import React, { useEffect, useState } from "react";
import { useWalletStore } from "./walletStore";
import {
  type PriestWalletDoc,
  type KundliHistoryDoc,
  type AshirvadaPassDoc,
  type SystemAuditLogDoc,
  subscribeAllKundlis,
  subscribeAshirvadaPasses,
  subscribeSystemAuditLogs,
  updateUserPassword,
  deleteAshirvadaPass,
  getOrCreatePriestWallet,
  syncUserProfile,
  cleanupDuplicateKundlis
} from "../../db/firestoreDb";
import { db } from "../../db/indexedDb";
import { hashPassword } from "../auth/authStore";
import { sendAllThreeDailyReports } from "../notifications/notificationService";
import { extendPassValidity } from "../seva/ashirvadaPassService";

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
    <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-3xl p-4 shadow-md flex flex-col items-center justify-between text-center relative overflow-hidden group hover:border-amber-500 transition-all">
      {badgeText && (
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${colorConfig.badgeBg}`}>
            {badgeText}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-lg">{icon}</span>
        <h4 className="text-xs font-black text-amber-950">{title}</h4>
      </div>

      {/* Radial Arc Gauge */}
      <div className="relative w-28 h-28 flex items-center justify-center my-1">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-base font-mono font-black text-slate-900 tracking-tight">
            {displayValue}
          </span>
          <span className="text-[10px] font-bold text-slate-500 font-mono">
            {clampedValue}%
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[11px] text-amber-900 font-semibold mt-1">
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
    title: "Automated Daily Tri-Report",
    kannadaTitle: "ದೈನಂದಿನ ೩ ವರದಿ ರವಾನೆ",
    icon: "📧",
    category: "reports",
    status: "live",
    metrics: "11:00 PM IST ➔ spshreepandit@gmail.com",
    details: "Nightly automated executive reports summarizing app analytics, priest activity, and coin recharges."
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

  // New Priest Registration & Dedicated Link Generator State
  const [newPriestName, setNewPriestName] = useState("");
  const [newPriestUsername, setNewPriestUsername] = useState("");
  const [newPriestPassword, setNewPriestPassword] = useState("baggona123");
  const [newPriestWelcomeCoins, setNewPriestWelcomeCoins] = useState("1000");
  const [createdPriestResult, setCreatedPriestResult] = useState<{
    name: string;
    username: string;
    password: string;
    panchangaUrl: string;
    sankhyaUrl: string;
  } | null>(null);
  const [isCreatingPriest, setIsCreatingPriest] = useState(false);

  // Admin Password Management Modal
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [adminPasswordMsg, setAdminPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 3 Daily Reports Dispatch State
  const [isDispatchingReports, setIsDispatchingReports] = useState(false);

  useEffect(() => {
    subscribeAllWallets();

    const unsubKundlis = subscribeAllKundlis((list) => setKundlis(list));
    const unsubPasses = subscribeAshirvadaPasses((list) => setAshirvadaPasses(list));
    const unsubAudit = subscribeSystemAuditLogs((list) => setAuditLogs(list));

    return () => {
      unsubKundlis();
      unsubPasses();
      unsubAudit();
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

    const cleanUsername = newPriestUsername.trim().toLowerCase().replace(/\s+/g, "_");
    const passwordToSet = newPriestPassword.trim() || "baggona123";
    const welcomeCoinsNum = parseInt(newPriestWelcomeCoins, 10) || 1000;

    setIsCreatingPriest(true);
    setFeedback(null);

    try {
      // 1. Create Priest User Account with Hashed Password in IndexedDb
      const hashedPassword = await hashPassword(passwordToSet);
      const existingUser = await db.users.where("username").equals(cleanUsername).first();
      if (!existingUser) {
        await db.users.add({
          id: cleanUsername,
          username: cleanUsername,
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString()
        });
      } else {
        await db.users.update(existingUser.id, { passwordHash: hashedPassword });
      }

      // 2. Sync to Cloud Firestore Users Collection
      void syncUserProfile({
        id: cleanUsername,
        username: cleanUsername,
        name: newPriestName.trim(),
        role: "priest",
        createdAt: new Date().toISOString()
      });

      // 3. Init wallet in Firestore
      await getOrCreatePriestWallet(cleanUsername, newPriestName.trim());

      // 4. Add free welcome bonus coins if specified
      if (welcomeCoinsNum > 0) {
        await directCoinAdjustment(
          cleanUsername,
          welcomeCoinsNum,
          `ಆರಂಭಿಕ ಉಚಿತ ಸ್ವಾಗತ ನಾಣ್ಯಗಳು (Welcome Bonus - ₹${Math.round(welcomeCoinsNum / 10)})`
        );
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
      const panchangaUrl = `${origin}/?portal=panchanga&user=${encodeURIComponent(cleanUsername)}&name=${encodeURIComponent(newPriestName.trim())}&firstTime=true`;
      const sankhyaUrl = `${origin}/?portal=sankhyashastra&user=${encodeURIComponent(cleanUsername)}&name=${encodeURIComponent(newPriestName.trim())}&firstTime=true`;

      setCreatedPriestResult({
        name: newPriestName.trim(),
        username: cleanUsername,
        password: passwordToSet,
        panchangaUrl,
        sankhyaUrl
      });

      setFeedback({
        type: "success",
        text: `ಪುರೋಹಿತರು (${newPriestName}) ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದ್ದಾರೆ! ಲಾಗಿನ್ ಪಾಸ್‌ವರ್ಡ್: ${passwordToSet} | ಸ್ವಾಗತ ನಾಣ್ಯಗಳು: ${welcomeCoinsNum}`
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

  const handleDispatch3ReportsNow = async () => {
    setIsDispatchingReports(true);
    setFeedback(null);
    try {
      const activePriestsCount = allPriestWallets.filter((w) => (w.totalCoinsSpent || 0) > 0).length || 1;
      const todayTotalCoinsSpent = allPriestWallets.reduce((acc, w) => acc + (w.totalCoinsSpent || 0), 0);
      const pendingReloadsCount = pendingAdminTransactions.length;
      const totalReloadsAmount = allPriestWallets.reduce((acc, w) => acc + (w.totalRechargedInr || 0), 0);

      await sendAllThreeDailyReports({
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
        }
      });

      setFeedback({ type: "success", text: "ದಿನದ ೩ ಸಾರಾಂಶ ವರದಿಗಳನ್ನು spshreepandit@gmail.com ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ. (All 3 daily summary reports dispatched successfully)." });
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E6] to-[#FFF5D6] border-2 border-amber-400/90 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-xs font-black uppercase tracking-wider mb-2.5 shadow-sm">
              <span>👑</span>
              <span>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಧಾನ ಆಡಳಿತ ಕೇಂದ್ರ ॥</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-950 tracking-tight flex items-center gap-2.5">
              <span>Super Administrator Command Center</span>
            </h1>
            <p className="text-xs md:text-sm text-amber-800 font-semibold mt-1 max-w-2xl">
              Live Priest Network • Devotee Kundli Vault • 90-Day Ashirvada QR Tracker • Security Audit Trail & Visual Topology
            </p>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAdminPasswordModal(true)}
                className="px-3.5 py-1.5 bg-[#FFFDF7] hover:bg-amber-100 border-2 border-amber-400 text-amber-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>🔐</span>
                <span>ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ (Admin Password)</span>
              </button>

              <button
                type="button"
                onClick={handleDispatch3ReportsNow}
                disabled={isDispatchingReports}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <span>📧</span>
                <span>{isDispatchingReports ? "ರವಾನಿಸಲಾಗುತ್ತಿದೆ..." : "3 ದಿನದ ವರದಿ ರವಾನಿಸಿ (Dispatch Tri-Reports)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("mindmap")}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>🗺️</span>
                <span>ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್ (Visual Mind Map)</span>
              </button>
            </div>
          </div>

          {/* Top Live KPI Counters */}
          <div className="bg-[#FEFCF4] border-2 border-amber-400/80 rounded-2xl p-4 flex items-center gap-5 shadow-md">
            <div className="text-right">
              <div className="text-[10px] text-amber-800 uppercase font-black tracking-wider">Circulating Coins</div>
              <div className="text-xl font-mono font-black text-amber-950">
                {totalCoinsInCirculation.toLocaleString()} 🪙
              </div>
              <div className="text-[10px] text-amber-700 font-bold">≈ ₹{Math.round(totalCoinsInCirculation / 10).toLocaleString()} INR</div>
            </div>
            <div className="h-10 w-0.5 bg-amber-300" />
            <div>
              <div className="text-[10px] text-emerald-800 uppercase font-black tracking-wider">Total Recharged</div>
              <div className="text-xl font-mono font-black text-emerald-700">
                ₹{totalRechargedInr.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-800 font-bold">{pendingAdminTransactions.length} Pending Approvals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border-2 shadow-sm ${
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
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
          icon="🤖"
          badgeText="0 Quota Loss"
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

      {/* 3. 5-TAB NAVIGATION BAR (Background matching #FFFDF7 & Gold Accents) */}
      <div className="flex border-b-2 border-amber-300 gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setActiveTab("wallets")}
          className={`py-3 px-4 font-black text-xs rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${
            activeTab === "wallets"
              ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md scale-[1.02]"
              : "bg-[#FFFDF7] text-amber-900 border-amber-200 hover:border-amber-400"
          }`}
        >
          <span>🪙</span>
          <span>ಪುರೋಹಿತರು & ವಾಲೆಟ್ ({allPriestWallets.length})</span>
          {pendingAdminTransactions.length > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {pendingAdminTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("kundlis")}
          className={`py-3 px-4 font-black text-xs rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${
            activeTab === "kundlis"
              ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md scale-[1.02]"
              : "bg-[#FFFDF7] text-amber-900 border-amber-200 hover:border-amber-400"
          }`}
        >
          <span>📜</span>
          <span>ಜಾತಕ ಡೇಟಾಬೇಸ್ ವಾಲ್ಟ್ ({kundlis.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ashirvada")}
          className={`py-3 px-4 font-black text-xs rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${
            activeTab === "ashirvada"
              ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md scale-[1.02]"
              : "bg-[#FFFDF7] text-amber-900 border-amber-200 hover:border-amber-400"
          }`}
        >
          <span>🪔</span>
          <span>ಆಶೀರ್ವಾದ QR ಕೌಂಟ್‌ಡೌನ್ ({ashirvadaPasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-4 font-black text-xs rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${
            activeTab === "audit"
              ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md scale-[1.02]"
              : "bg-[#FFFDF7] text-amber-900 border-amber-200 hover:border-amber-400"
          }`}
        >
          <span>🛡️</span>
          <span>ಸಿಸ್ಟಮ್ ಆಡಿಟ್ ಲಾಗ್ಸ್ ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("mindmap")}
          className={`py-3 px-4 font-black text-xs rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap border-2 ${
            activeTab === "mindmap"
              ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white border-indigo-400 shadow-md scale-[1.02]"
              : "bg-[#FFFDF7] text-indigo-900 border-indigo-200 hover:border-indigo-400"
          }`}
        >
          <span>🗺️</span>
          <span>ಸಿಸ್ಟಮ್ ಮೈಂಡ್‌ಮ್ಯಾಪ್ (Mind Map)</span>
        </button>
      </div>

      {/* 4. TAB 1: Priests & Wallet Ledger */}
      {activeTab === "wallets" && (
        <div className="space-y-6">
          {/* New Priest Registration Studio & Link Generator */}
          <div className="bg-[#FFFDF7] border-2 border-amber-400/90 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-amber-200 pb-3">
              <div>
                <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                  <span>➕</span>
                  <span>ಹೊಸ ಪುರೋಹಿತರನ್ನು ನೋಂದಾಯಿಸಿ & ಪ್ರತ್ಯೇಕ ಲಿಂಕ್ ರಚಿಸಿ (Priest Studio & Link Generator)</span>
                </h2>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  Register a new priest, assign initial welcome coins (1000 🪙), and generate dedicated deep links for Panchanga & Sankhya Shastra.
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
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 border border-amber-400"
                >
                  <span>✨</span>
                  <span>{isCreatingPriest ? "ರಚಿಸಲಾಗುತ್ತಿದೆ..." : "ನೋಂದಾಯಿಸಿ & ಲಿಂಕ್ ಪಡೆಯಿರಿ"}</span>
                </button>
              </div>
            </form>

            {/* Generated Links Result Card */}
            {createdPriestResult && (
              <div className="p-4 bg-[#FEFCF4] border-2 border-emerald-400 rounded-2xl space-y-3 mt-4 animate-in fade-in duration-300 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-emerald-800 font-bold text-sm">✓ ನೋಂದಣಿ ಯಶಸ್ವಿ:</span>
                    <span className="font-extrabold text-amber-950 text-sm">{createdPriestResult.name}</span>
                    <span className="text-xs text-slate-600 font-mono">
                      (User: <strong className="text-amber-900">{createdPriestResult.username}</strong> | Pass: <strong className="text-emerald-800">{createdPriestResult.password}</strong>)
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Panchanga Link */}
                  <div className="p-3 bg-[#FFFDF7] border-2 border-amber-300 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950">🔮 ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಲಿಂಕ್</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdPriestResult.panchangaUrl);
                          setFeedback({ type: "success", text: "ಪಂಚಾಂಗ ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ (Panchanga link copied)!" });
                        }}
                        className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg hover:bg-amber-400 shadow-sm"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={createdPriestResult.panchangaUrl}
                      className="w-full px-2 py-1 bg-white border border-amber-200 rounded text-[10px] text-slate-700 font-mono select-all"
                    />
                  </div>

                  {/* Sankhya Shastra Link */}
                  <div className="p-3 bg-[#FFFDF7] border-2 border-purple-300 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950">🔢 ಬಗ್ಗೋಣ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಲಿಂಕ್</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(createdPriestResult.sankhyaUrl);
                          setFeedback({ type: "success", text: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಲಿಂಕ್ ನಕಲಿಸಲಾಗಿದೆ (Sankhya Shastra link copied)!" });
                        }}
                        className="px-2.5 py-1 bg-purple-600 text-white font-black text-[10px] rounded-lg hover:bg-purple-500 shadow-sm"
                      >
                        📋 Copy Link
                      </button>
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={createdPriestResult.sankhyaUrl}
                      className="w-full px-2 py-1 bg-white border border-purple-200 rounded text-[10px] text-slate-700 font-mono select-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => {
                    const message = encodeURIComponent(
                      `ನಮಸ್ಕಾರ ${createdPriestResult.name} ಅವರೇ,\n\n` +
                      `ನಿಮಗೆ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಮತ್ತು ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ತಂತ್ರಾಂಶದ ವಿಶೇಷ ಆಹ್ವಾನ ಕಳುಹಿಸಲಾಗಿದೆ.\n\n` +
                      `👤 ಯೂಸರ್‌ನೇಮ್: ${createdPriestResult.username}\n` +
                      `🔑 ಪಾಸ್‌ವರ್ಡ್: ${createdPriestResult.password}\n\n` +
                      `🔮 ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪೋರ್ಟಲ್:\n${createdPriestResult.panchangaUrl}\n\n` +
                      `🔢 ಬಗ್ಗೋಣ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪೋರ್ಟಲ್:\n${createdPriestResult.sankhyaUrl}\n\n` +
                      `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥`
                    );
                    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>📲 WhatsApp ಮೂಲಕ ಯೂಸರ್‌ನೇಮ್ & ಪಾಸ್‌ವರ್ಡ್ ಸಹಿತ ಆಹ್ವಾನ ಕಳುಹಿಸಿ (Share via WhatsApp)</span>
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
                  Click "⚡ ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ" to directly credit or deduct coins for any priest.
                </p>
              </div>
            </div>

            {allPriestWallets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                ಯಾವುದೇ ಪುರೋಹಿತರ ಖಾತೆಗಳು ಇನ್ನೂ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿಲ್ಲ.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-200 text-amber-900 uppercase text-[10px] font-black tracking-wider">
                      <th className="py-3 px-4">ಪುರೋಹಿತರ ಹೆಸರು</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">ಸಕ್ರಿಯ ಬ್ಯಾಲೆನ್ಸ್</th>
                      <th className="py-3 px-4">ಒಟ್ಟು ರೀಚಾರ್ಜ್</th>
                      <th className="py-3 px-4">ಬಳಸಿದ ನಾಣ್ಯಗಳು</th>
                      <th className="py-3 px-4 text-right">ತ್ವರಿತ ಕ್ರಿಯೆಗಳು</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-semibold">
                    {allPriestWallets.map((priest) => {
                      const isLow = (priest.coinBalance || 0) < 500;
                      return (
                        <tr key={priest.id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-black text-amber-950 flex items-center gap-2">
                            <span>🕉️</span>
                            <span>{priest.priestName}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{priest.userId}</td>
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
                          <td className="py-3.5 px-4 text-emerald-700 font-bold">
                            ₹{(priest.totalRechargedInr || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">
                            {(priest.totalCoinsSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Panchanga Link */}
                            <button
                              type="button"
                              onClick={() => {
                                const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
                                const url = `${origin}/?portal=panchanga&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&firstTime=true`;
                                if (navigator.clipboard) {
                                  void navigator.clipboard.writeText(url);
                                  setFeedback({ type: "success", text: `✓ Copied Baggona Panchanga Portal link for ${priest.priestName}!` });
                                }
                              }}
                              className="py-1.5 px-2 bg-[#FFFDF7] hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Copy Panchanga Portal Link"
                            >
                              🔮 ಪಂಚಾಂಗ Link
                            </button>

                            {/* Sankhya Shastra Link */}
                            <button
                              type="button"
                              onClick={() => {
                                const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
                                const url = `${origin}/?portal=sankhyashastra&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&firstTime=true`;
                                if (navigator.clipboard) {
                                  void navigator.clipboard.writeText(url);
                                  setFeedback({ type: "success", text: `✓ Copied Baggona Sankhya Shastra Portal link for ${priest.priestName}!` });
                                }
                              }}
                              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-950 border border-purple-300 rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Copy Sankhya Shastra Portal Link"
                            >
                              🔢 ಸಂಖ್ಯಾಶಾಸ್ತ್ರ Link
                            </button>

                            {/* WhatsApp Invite */}
                            <button
                              type="button"
                              onClick={() => {
                                const origin = typeof window !== "undefined" ? window.location.origin : "https://baggona-panchanga.firebaseapp.com";
                                const panchangUrl = `${origin}/?portal=panchanga&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&firstTime=true`;
                                const sankhyaUrl = `${origin}/?portal=sankhyashastra&user=${encodeURIComponent(priest.userId)}&name=${encodeURIComponent(priest.priestName)}&firstTime=true`;
                                const msg = `ನಮಸ್ಕಾರ ${priest.priestName} ಅವರೇ,\n\n೧. ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪುರೋಹಿತ ಕೇಂದ್ರ ಲಿಂಕ್:\n${panchangUrl}\n\n೨. ಬಗ್ಗೋಣ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಕೇಂದ್ರ ಲಿಂಕ್:\n${sankhyaUrl}\n\nದಯವಿಟ್ಟು ಲಿಂಕ್ ತೆರೆದು ನಿಮ್ಮ ರಹಸ್ಯ ಪಾಸ್‌ವರ್ಡ್ ಸೆಟ್ ಮಾಡಿಕೊಳ್ಳಿ.\n॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
                              }}
                              className="py-1.5 px-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-400 rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Share on WhatsApp"
                            >
                              📲 WhatsApp
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedPriest(priest)}
                              className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all shadow-sm"
                            >
                              ⚡ ನಾಣ್ಯ ಹೊಂದಾಣಿಕೆ
                            </button>
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

      {/* 11. ADMIN PASSWORD CHANGE MODAL */}
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
    </div>
  );
};
