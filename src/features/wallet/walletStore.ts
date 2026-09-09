import { create } from "zustand";
import {
  type PriestWalletDoc,
  type WalletTransactionDoc,
  getOrCreatePriestWallet,
  subscribePriestWallet,
  subscribeWalletTransactions,
  subscribePendingTransactions,
  subscribeAllPriestWallets,
  createWalletTransaction,
  approveRechargeTransaction,
  directAdminCoinAdjustment,
  deductPriestCoins,
  creditWalletCoinsDirectly
} from "../../db/firestoreDb";
import {
  type CoinPackage,
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_NAME
} from "./walletTypes";
import { notifyCoinRechargeRequested, notifyCoinRechargeApproved, notifyWalletCoinChange } from "../notifications/notificationService";
import { creditGuestCoins } from "../../utils/publicKundliSecurity";

export interface ActiveDeductionAnimation {
  id: string;
  coins: number;
  serviceName: string;
  timestamp: number;
}

export interface WalletState {
  wallet: PriestWalletDoc | null;
  allPriestWallets: PriestWalletDoc[];
  transactions: WalletTransactionDoc[];
  pendingAdminTransactions: WalletTransactionDoc[];
  selectedPackage: CoinPackage;
  isRechargeModalOpen: boolean;
  isAdminApprovalModalOpen: boolean;
  isSubmittingRecharge: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  recentDeductions: ActiveDeductionAnimation[];

  // Unsubscribe callbacks
  walletUnsub: (() => void) | null;
  txUnsub: (() => void) | null;
  adminUnsub: (() => void) | null;
  allWalletsUnsub: (() => void) | null;

  isDeductingService: boolean;

  // Actions
  initWallet: (userId: string, priestName?: string) => Promise<void>;
  subscribeAllWallets: () => void;
  setSelectedPackage: (pkg: CoinPackage) => void;
  openRechargeModal: () => void;
  closeRechargeModal: () => void;
  openAdminApprovalModal: () => void;
  closeAdminApprovalModal: () => void;
  submitUpiRecharge: (upiUtr?: string, customAmountInr?: number, customCoins?: number) => Promise<{ success: boolean; error?: string }>;
  deductForService: (coins: number, serviceName: string, clientName?: string, idempotencyKey?: string) => Promise<{ success: boolean; error?: string }>;
  approveTx: (txId: string) => Promise<boolean>;
  directCoinAdjustment: (userId: string, coins: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  refundCoins: (coins: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  clearRecentDeduction: (id: string) => void;
  clearMessages: () => void;
  cleanup: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  allPriestWallets: [],
  transactions: [],
  pendingAdminTransactions: [],
  selectedPackage: RECHARGE_PACKAGES[1], // Default to Purohita Silver
  isRechargeModalOpen: false,
  isAdminApprovalModalOpen: false,
  isSubmittingRecharge: false,
  isDeductingService: false,
  isLoading: false,
  error: null,
  successMessage: null,
  recentDeductions: [],

  walletUnsub: null,
  txUnsub: null,
  adminUnsub: null,
  allWalletsUnsub: null,

  initWallet: async (userId: string, priestName: string = DEFAULT_PRIEST_NAME) => {
    // Cleanup previous listeners if any
    get().cleanup();

    set({ isLoading: true, error: null });
    try {
      const initialWallet = await getOrCreatePriestWallet(userId, priestName);
      set({ wallet: initialWallet, isLoading: false });

      // Subscribe to real-time wallet changes
      const wUnsub = subscribePriestWallet(userId, (updatedWallet) => {
        set({ wallet: updatedWallet });
      });

      // Subscribe to real-time transactions
      const tUnsub = subscribeWalletTransactions(userId, (txList) => {
        set({ transactions: txList });
      });

      // Subscribe to pending admin transactions
      const aUnsub = subscribePendingTransactions((pendingList) => {
        set({ pendingAdminTransactions: pendingList });
      });

      set({
        walletUnsub: wUnsub,
        txUnsub: tUnsub,
        adminUnsub: aUnsub
      });
    } catch (err) {
      console.warn("[WalletStore] Init error:", err);
      set({ isLoading: false, error: "Failed to load wallet" });
    }
  },

  subscribeAllWallets: () => {
    const { allWalletsUnsub } = get();
    if (allWalletsUnsub) allWalletsUnsub();

    const unsub = subscribeAllPriestWallets((wallets) => {
      set({ allPriestWallets: wallets });
    });

    const pUnsub = subscribePendingTransactions((pendingList) => {
      set({ pendingAdminTransactions: pendingList });
    });

    set({ allWalletsUnsub: unsub, adminUnsub: pUnsub });
  },

  setSelectedPackage: (pkg: CoinPackage) => {
    set({ selectedPackage: pkg, error: null, successMessage: null });
  },

  openRechargeModal: () => set({ isRechargeModalOpen: true, error: null, successMessage: null }),
  closeRechargeModal: () => set({ isRechargeModalOpen: false, error: null, successMessage: null }),

  openAdminApprovalModal: () => set({ isAdminApprovalModalOpen: true }),
  closeAdminApprovalModal: () => set({ isAdminApprovalModalOpen: false }),

  submitUpiRecharge: async (upiUtr?: string, customAmountInr?: number, customCoins?: number) => {
    const { wallet, selectedPackage } = get();
    const cleanUtr = upiUtr ? upiUtr.trim().replace(/\s+/g, "") : `SCAN_PAY_${Date.now()}`;

    set({ isSubmittingRecharge: true, error: null });

    const effectiveAmount = customAmountInr !== undefined && customAmountInr > 0 ? customAmountInr : selectedPackage.amountInr;
    const effectiveCoins = customCoins !== undefined && customCoins > 0 ? customCoins : selectedPackage.totalCoins;
    const effectiveWalletId = wallet?.id || wallet?.userId || "public_guest_wallet";
    const effectiveUserId = wallet?.userId || wallet?.id || "PUBLIC_GUEST";
    const effectivePriestName = wallet?.priestName || "ಭಕ್ತರು / ಪುರೋಹಿತರು";

    try {
      const txId = `tx_rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newTx: WalletTransactionDoc = {
        id: txId,
        walletId: effectiveWalletId,
        userId: effectiveUserId,
        priestName: effectivePriestName,
        type: "recharge",
        inrAmount: effectiveAmount,
        coins: effectiveCoins,
        packageKey: selectedPackage.key,
        upiUtr: cleanUtr,
        status: "pending",
        description: `PhonePe/GPay Recharge: ₹${effectiveAmount} (${effectiveCoins.toLocaleString()} Coins) - ಪರಿಶೀಲನೆ ಬಾಕಿ (Pending Verification)`,
        createdAt: new Date().toISOString()
      };

      await createWalletTransaction(newTx);

      // Trigger automatic email alert to admin with UTR verification info
      void notifyCoinRechargeRequested({
        txId,
        priestName: effectivePriestName,
        amountInr: effectiveAmount,
        coins: effectiveCoins,
        packageName: selectedPackage.name,
        upiUtr: cleanUtr,
        timestamp: new Date().toLocaleString("en-IN")
      });

      set({
        isSubmittingRecharge: false,
        successMessage: `ಪಾವತಿ ಪರಿಶೀಲನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ (UTR: ${cleanUtr}). ಅರ್ಚಕರು ಪರಿಶೀಲಿಸಿದ ನಂತರ ನಿಮ್ಮ ವಾಲೆಟ್‌ಗೆ ${effectiveCoins.toLocaleString()} ನಾಣ್ಯಗಳನ್ನು ಲೋಡ್ ಮಾಡುತ್ತಾರೆ.`
      });
      return { success: true };
    } catch (err: any) {
      set({ isSubmittingRecharge: false, error: err.message || "Failed to submit recharge" });
      return { success: false, error: err.message };
    }
  },

  deductForService: async (coins: number, serviceName: string, clientName?: string, idempotencyKey?: string) => {
    const { wallet, isDeductingService } = get();
    if (isDeductingService) {
      return { success: false, error: "ವಹಿವಾಟು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ." };
    }
    if (!wallet) {
      return { success: false, error: "Wallet not connected" };
    }

    if (wallet.coinBalance < coins) {
      return {
        success: false,
        error: `Insufficient coins (${wallet.coinBalance} available, ${coins} needed). Please recharge your wallet.`
      };
    }

    set({ isDeductingService: true, error: null });

    try {
      const generatedKey = idempotencyKey || `idemp_${wallet.userId}_${serviceName.replace(/\s+/g, "_")}_${Math.floor(Date.now() / 3000)}`;
      const res = await deductPriestCoins(wallet.userId, coins, serviceName, clientName, generatedKey);
      if (!res.success) {
        set({ isDeductingService: false, error: res.error ?? "Deduction failed" });
        return { success: false, error: res.error ?? "Deduction failed" };
      }

      // Register active floating deduction animation
      const animId = `deduct_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newDeduction: ActiveDeductionAnimation = {
        id: animId,
        coins,
        serviceName,
        timestamp: Date.now()
      };

      set((state) => ({
        isDeductingService: false,
        recentDeductions: [...state.recentDeductions.slice(-4), newDeduction]
      }));

      // Auto dismiss animation after 3.2 seconds
      if (typeof window !== "undefined") {
        setTimeout(() => {
          get().clearRecentDeduction(animId);
        }, 3200);
      }

      return { success: true };
    } catch (err) {
      set({ isDeductingService: false, error: "Deduction error occurred" });
      return { success: false, error: "Deduction error occurred" };
    }
  },


  clearRecentDeduction: (id: string) => {
    set((state) => ({
      recentDeductions: state.recentDeductions.filter((d) => d.id !== id)
    }));
  },

  approveTx: async (txId: string) => {
    const tx = get().pendingAdminTransactions.find((t) => t.id === txId);
    const success = await approveRechargeTransaction(txId);
    if (success && tx) {
      void notifyCoinRechargeApproved({
        txId,
        priestName: tx.priestName || "Priest",
        amountInr: tx.inrAmount || 0,
        coins: tx.coins,
        upiUtr: tx.upiUtr || "N/A"
      });
    }
    return success;
  },

  directCoinAdjustment: async (userId: string, coins: number, reason: string) => {
    const res = await directAdminCoinAdjustment(userId, coins, reason);
    if (!res.success) {
      return { success: false, error: res.error ?? "Direct adjustment failed" };
    }
    // Real-time Email Alert to spshreepandit@gmail.com
    void notifyWalletCoinChange({
      userId,
      priestName: userId,
      coins,
      changeType: coins >= 0 ? "credit" : "deduction",
      reason: `[Direct Adjustment] ${reason}`,
      newBalance: res.newBalance
    });
    return { success: true };
  },

  refundCoins: async (coins: number, reason: string) => {
    const { wallet } = get();
    if (!wallet) return { success: false, error: "Wallet not connected" };
    const res = await directAdminCoinAdjustment(
      wallet.userId,
      Math.abs(coins),
      `[ಸ್ವಯಂ ಮರುಪಾವತಿ / Auto Refund] ${reason}`
    );
    return { success: res.success, error: res.error };
  },

  clearMessages: () => set({ error: null, successMessage: null }),

  cleanup: () => {
    const { walletUnsub, txUnsub, adminUnsub, allWalletsUnsub } = get();
    if (walletUnsub) walletUnsub();
    if (txUnsub) txUnsub();
    if (adminUnsub) adminUnsub();
    if (allWalletsUnsub) allWalletsUnsub();
    set({ walletUnsub: null, txUnsub: null, adminUnsub: null, allWalletsUnsub: null });
  }
}));
