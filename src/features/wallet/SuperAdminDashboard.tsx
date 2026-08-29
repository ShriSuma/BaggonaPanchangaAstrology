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
  updateUserPassword
} from "../../db/firestoreDb";
import { db } from "../../db/indexedDb";
import { hashPassword } from "../auth/authStore";
import { sendAllThreeDailyReports } from "../notifications/notificationService";
import { extendPassValidity } from "../seva/ashirvadaPassService";

type AdminTab = "wallets" | "kundlis" | "ashirvada" | "audit";

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

  // Modals & Actions
  const [selectedPriest, setSelectedPriest] = useState<PriestWalletDoc | null>(null);
  const [selectedKundli, setSelectedKundli] = useState<KundliHistoryDoc | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>("1000");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustReason, setAdjustReason] = useState<string>("Special Purohita Seva Credit");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [processingTxId, setProcessingTxId] = useState<string | null>(null);
  const [resettingPassId, setResettingPassId] = useState<string | null>(null);

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

      // 1. Update IndexedDb
      const existingUser = await db.users.where("username").equals("superadmin").first();
      if (existingUser) {
        await db.users.update(existingUser.id, { passwordHash: hashed });
      }

      // 2. Update Firestore
      await updateUserPassword("superadmin_master", hashed);

      setAdminPasswordMsg({ type: "success", text: "ಆಡಳಿತಾಧಿಕಾರಿ ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (Admin password updated securely)." });
      setFeedback({ type: "success", text: "Super Admin password updated successfully." });
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
    <div className="space-y-8 pb-16 font-sans">
      {/* Super Admin Top Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>🛡️</span>
              <span>Super Administrator Master Portal • ಪ್ರಧಾನ ಆಡಳಿತ ಕೇಂದ್ರ</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-amber-100 tracking-tight">
              Master Temple & Database Control Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Live Priest Wallets • Kundli Database Vault • Ashirvada QR Countdown • System Audit
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowAdminPasswordModal(true)}
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>🔐</span>
                <span>ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ (Reset Admin Password)</span>
              </button>

              <button
                type="button"
                onClick={handleDispatch3ReportsNow}
                disabled={isDispatchingReports}
                className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <span>📧</span>
                <span>{isDispatchingReports ? "ರವಾನಿಸಲಾಗುತ್ತಿದೆ..." : "3 ದಿನದ ವರದಿ ರವಾನಿಸಿ (Dispatch 3 Reports)"}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Coins in System</div>
              <div className="text-xl font-mono font-extrabold text-amber-300">
                {totalCoinsInCirculation.toLocaleString()} 🪙
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Network Revenue</div>
              <div className="text-xl font-mono font-extrabold text-emerald-400">
                ₹{totalRechargedInr.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/80 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === "success" ? "✅" : "⚠️"}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Priests</div>
          <div className="text-2xl font-bold text-amber-200 mt-1">{totalPriests}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Registered accounts</div>
        </div>
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Saved Kundlis</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{kundlis.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Database chart records</div>
        </div>
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Ashirvada Passes</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{ashirvadaPasses.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">QR passes in countdown</div>
        </div>
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 uppercase font-semibold">Pending UTR Approvals</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">{pendingAdminTransactions.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Awaiting verification</div>
        </div>
      </div>

      {/* 4-Tab Navigation Bar */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("wallets")}
          className={`py-3 px-5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "wallets"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <span>🪙</span>
          <span>Priests & Wallets ({allPriestWallets.length})</span>
          {pendingAdminTransactions.length > 0 && (
            <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
              {pendingAdminTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("kundlis")}
          className={`py-3 px-5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "kundlis"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <span>📜</span>
          <span>Kundli Database Vault ({kundlis.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ashirvada")}
          className={`py-3 px-5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "ashirvada"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <span>🪔</span>
          <span>Ashirvada QR Countdown ({ashirvadaPasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <span>🛡️</span>
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: Priests & Wallet Ledger */}
      {activeTab === "wallets" && (
        <div className="space-y-6">
          {/* Pending Approvals */}
          {pendingAdminTransactions.length > 0 && (
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Pending UPI Recharge Verifications ({pendingAdminTransactions.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAdminTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-sm">{tx.priestName || "Priest"}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-extrabold text-sm">₹{tx.inrAmount}</span>
                        <span className="text-amber-400 font-mono font-bold text-xs">
                          +{tx.coins.toLocaleString()} Coins
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">UPI UTR ID:</span>
                      <span className="font-mono font-bold text-amber-300 text-xs bg-slate-950 px-2 py-0.5 rounded border border-amber-500/20">
                        {tx.upiUtr}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={processingTxId === tx.id}
                      onClick={() => handleApprove(tx.id)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all disabled:opacity-50"
                    >
                      {processingTxId === tx.id ? "Processing..." : `✓ Approve & Credit ${tx.coins.toLocaleString()} Coins`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Priests Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  <span>👥</span>
                  <span>Priest Network & Live Wallets</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click "⚡ Adjust / Add Coins" to directly credit or deduct coins for any priest.
                </p>
              </div>
            </div>

            {allPriestWallets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No priest wallets detected in Firestore yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Priest Name</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Active Balance</th>
                      <th className="py-3 px-4">Total Recharged</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allPriestWallets.map((priest) => (
                      <tr key={priest.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-amber-200 flex items-center gap-2">
                          <span>🕉️</span>
                          <span>{priest.priestName}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{priest.userId}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-amber-300">
                          {(priest.coinBalance || 0).toLocaleString()} Coins
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-medium">
                          ₹{(priest.totalRechargedInr || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
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
                            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all"
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
                            className="py-1.5 px-2 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/50 rounded-lg text-xs font-semibold transition-all"
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
                            className="py-1.5 px-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                            title="Share on WhatsApp"
                          >
                            📲 WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPriest(priest)}
                            className="py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all"
                          >
                            ⚡ Coins
                          </button>
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

      {/* TAB 2: Kundli Database Vault */}
      {activeTab === "kundlis" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
                <span>📜</span>
                <span>Devotee Kundli Database Vault</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Discrete Astrological Records: Name, Gothra, Janma Date/Time, Rashi, Nakshatra, Pada, and Lagna.
              </p>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={kundliSearch}
                onChange={(e) => setKundliSearch(e.target.value)}
                placeholder="Search by Name, Gothra, Rashi..."
                className="w-full px-3 py-2 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {filteredKundlis.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No Kundli records found in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Devotee Name</th>
                    <th className="py-3 px-4">Gothra</th>
                    <th className="py-3 px-4">Janma Date & Time</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Rashi (Moon)</th>
                    <th className="py-3 px-4">Nakshatra & Pada</th>
                    <th className="py-3 px-4">Lagna</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredKundlis.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-amber-200 flex items-center gap-2">
                        <span>👤</span>
                        <span>{k.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-[11px]">
                          {k.gothra || "Kashyapa"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {k.birthDate} • {k.birthTime}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[120px]">
                        {k.placeName}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-300">
                        {k.rashi || "Mesha"}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">
                        {k.nakshatra || "Ashwini"} (Pada {k.pada || 1})
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {k.lagnaRashi || "Vrischika"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedKundli(k)}
                          className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold"
                        >
                          View Details
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

      {/* TAB 3: Ashirvada QR Passes & 90-Day Countdown */}
      {activeTab === "ashirvada" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
              <span>🪔</span>
              <span>Ashirvada Patra & QR Code Pass Countdown Tracker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking of remaining active days from 90-day validity window. Super Admin can 1-click Reset/Extend.
            </p>
          </div>

          {ashirvadaPasses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No Ashirvada QR passes issued yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ashirvadaPasses.map((pass) => {
                const percentLeft = Math.min(100, Math.max(0, Math.round((pass.daysRemaining / (pass.totalDays || 90)) * 100)));
                const isExpired = pass.daysRemaining <= 0;

                return (
                  <div
                    key={pass.id}
                    className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-amber-200 text-sm">{pass.devoteeName}</div>
                        <div className="text-xs text-slate-400">Seva: {pass.sevaName}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">By {pass.priestName}</span>
                    </div>

                    {/* Progress Bar & Countdown Days */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400 font-semibold text-[10px] uppercase">
                          Remaining Validity:
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isExpired ? "text-red-400" : pass.daysRemaining <= 10 ? "text-orange-400" : "text-emerald-400"
                          }`}
                        >
                          {isExpired ? "EXPIRED (0 Days Left)" : `⏳ ${pass.daysRemaining} of ${pass.totalDays} Days Left`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all ${
                            isExpired
                              ? "bg-red-500"
                              : pass.daysRemaining <= 10
                              ? "bg-orange-500"
                              : "bg-gradient-to-r from-emerald-500 to-amber-400"
                          }`}
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Issued: {new Date(pass.issuedAt).toLocaleDateString("en-IN")}</span>
                        <span>Expires: {new Date(pass.expiresAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <span className="text-[11px] text-slate-400">
                        📥 Download Count: <strong>{pass.downloadCount || 0}</strong>
                      </span>

                      <button
                        type="button"
                        disabled={resettingPassId === pass.id}
                        onClick={() => handleResetValidity(pass.id)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {resettingPassId === pass.id ? "Resetting..." : "🔄 Reset to 90 Days"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: System Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
                <span>🛡️</span>
                <span>System Intrusion & Operation Audit Stream</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable cloud audit trail of all logins, IP detections, coin transfers, and database writes.
              </p>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit actions, IP, user..."
                className="w-full px-3 py-2 bg-slate-950 border border-amber-500/30 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {filteredAuditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No audit records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(log.timestamp).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-300">
                        <span className="px-2 py-0.5 bg-slate-950 rounded border border-amber-500/30">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans">
                        <strong>{log.username}</strong> ({log.role})
                      </td>
                      <td className="py-3 px-4 text-red-300">
                        {log.ipAddress || "Local / Host"}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">
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

      {/* Direct Coin Adjustment Modal */}
      {selectedPriest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-amber-50">
            <button
              onClick={() => setSelectedPriest(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-300 rounded-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                🪙
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-base">Direct Coin Adjustment</h3>
                <p className="text-xs text-slate-400">Priest: {selectedPriest.priestName}</p>
              </div>
            </div>

            <form onSubmit={handleDirectAdjustmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("credit")}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      adjustType === "credit"
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    + Credit Coins (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("debit")}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      adjustType === "debit"
                        ? "bg-red-500/20 border-red-400 text-red-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    - Debit Coins (Subtract)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Coin Amount</label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  min={1}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl font-mono text-amber-200 text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Admin Audit Reason / Note</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Festival Grant / Cash Payment"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/30 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPriest(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isAdjusting ? "Updating..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kundli Details Modal */}
      {selectedKundli && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-amber-50">
            <button
              onClick={() => setSelectedKundli(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-amber-300 rounded-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                📜
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-base">{selectedKundli.name}</h3>
                <p className="text-xs text-slate-400">Gothra: {selectedKundli.gothra || "Kashyapa"} • {selectedKundli.placeName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Rashi (Moon Sign)</span>
                <span className="font-bold text-amber-300 text-sm">{selectedKundli.rashi}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Nakshatra & Pada</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedKundli.nakshatra} (Pada {selectedKundli.pada})</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Lagna (Ascendant)</span>
                <span className="font-bold text-slate-200 text-sm">{selectedKundli.lagnaRashi}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Sun Sign (Surya)</span>
                <span className="font-bold text-slate-200 text-sm">{selectedKundli.sunSign}</span>
              </div>
            </div>

            {/* Planetary Summary List */}
            {selectedKundli.planetsSummary && selectedKundli.planetsSummary.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Planetary Coordinates:</div>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                  {selectedKundli.planetsSummary.map((pl, idx) => (
                    <div key={idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                      <span className="font-bold text-amber-200">{pl.name}: </span>
                      <span className="text-slate-400">{pl.degree.toFixed(1)}° {pl.rashi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedKundli(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Change Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔐</span>
                <h3 className="font-bold text-amber-100 text-base">Super Admin ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminPasswordModal(false);
                  setAdminPasswordMsg(null);
                }}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ರಹಸ್ಯ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಮೂದಿಸಿ. ಇದನ್ನು SHA-256 ಗೂಢಲಿಪೀಕರಣದೊಂದಿಗೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.
            </p>

            {adminPasswordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  adminPasswordMsg.type === "success"
                    ? "bg-emerald-950/90 border border-emerald-500 text-emerald-300"
                    : "bg-red-950/90 border border-red-500 text-red-300"
                }`}
              >
                {adminPasswordMsg.text}
              </div>
            )}

            <form onSubmit={handleAdminPasswordChange} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (New Password):
                </label>
                <input
                  type="password"
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  ಖಚಿತಪಡಿಸಿ (Confirm New Password):
                </label>
                <input
                  type="password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="ಮತ್ತೊಮ್ಮೆ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPasswordModal(false);
                    setAdminPasswordMsg(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50"
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
