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
  deductPriestCoins
} from "../../db/firestoreDb";
import {
  type CoinPackage,
  RECHARGE_PACKAGES,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_NAME
} from "./walletTypes";
import { notifyCoinRechargeRequested, notifyCoinRechargeApproved } from "../notifications/notificationService";

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

  // Unsubscribe callbacks
  walletUnsub: (() => void) | null;
  txUnsub: (() => void) | null;
  adminUnsub: (() => void) | null;
  allWalletsUnsub: (() => void) | null;

  // Actions
  initWallet: (userId: string, priestName?: string) => Promise<void>;
  subscribeAllWallets: () => void;
  setSelectedPackage: (pkg: CoinPackage) => void;
  openRechargeModal: () => void;
  closeRechargeModal: () => void;
  openAdminApprovalModal: () => void;
  closeAdminApprovalModal: () => void;
  submitUpiRecharge: (upiUtr: string) => Promise<{ success: boolean; error?: string }>;
  deductForService: (coins: number, serviceName: string, clientName?: string) => Promise<{ success: boolean; error?: string }>;
  approveTx: (txId: string) => Promise<boolean>;
  directCoinAdjustment: (userId: string, coins: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  refundCoins: (coins: number, reason: string) => Promise<{ success: boolean; error?: string }>;
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
  isLoading: false,
  error: null,
  successMessage: null,

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

  submitUpiRecharge: async (upiUtr: string) => {
    const { wallet, selectedPackage } = get();
    if (!wallet) {
      return { success: false, error: "Wallet not initialized. Please log in." };
    }

    const cleanUtr = upiUtr.trim().replace(/\s+/g, "");
    if (cleanUtr.length < 8) {
      return { success: false, error: "Please enter a valid 12-digit UPI Reference / UTR Number." };
    }

    set({ isSubmittingRecharge: true, error: null });

    try {
      const txId = `tx_rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newTx: WalletTransactionDoc = {
        id: txId,
        walletId: wallet.id,
        userId: wallet.userId,
        priestName: wallet.priestName,
        type: "recharge",
        inrAmount: selectedPackage.amountInr,
        coins: selectedPackage.totalCoins,
        packageKey: selectedPackage.key,
        upiUtr: cleanUtr,
        status: "pending",
        description: `Recharge: ${selectedPackage.name} (₹${selectedPackage.amountInr} for ${selectedPackage.totalCoins.toLocaleString()} Coins)`,
        createdAt: new Date().toISOString()
      };

      await createWalletTransaction(newTx);

      // Trigger automatic email alert to admin with UTR verification info
      void notifyCoinRechargeRequested({
        txId,
        priestName: wallet.priestName,
        amountInr: selectedPackage.amountInr,
        coins: selectedPackage.totalCoins,
        packageName: selectedPackage.name,
        upiUtr: cleanUtr,
        timestamp: new Date().toLocaleString("en-IN")
      });

      set({
        isSubmittingRecharge: false,
        successMessage: `Recharge request for ₹${selectedPackage.amountInr} (${selectedPackage.totalCoins} Coins) submitted with UTR ${cleanUtr}. Coins will be credited upon verification.`
      });

      return { success: true };
    } catch (err) {
      console.error("[WalletStore] Recharge submission failed:", err);
      set({
        isSubmittingRecharge: false,
        error: "Failed to submit recharge request. Please try again."
      });
      return { success: false, error: "Failed to submit recharge request." };
    }
  },

  deductForService: async (coins: number, serviceName: string, clientName?: string) => {
    const { wallet } = get();
    if (!wallet) {
      return { success: false, error: "Wallet not connected" };
    }

    if (wallet.coinBalance < coins) {
      return {
        success: false,
        error: `Insufficient coins (${wallet.coinBalance} available, ${coins} needed). Please recharge your wallet.`
      };
    }

    const res = await deductPriestCoins(wallet.userId, coins, serviceName, clientName);
    if (!res.success) {
      return { success: false, error: res.error ?? "Deduction failed" };
    }

    return { success: true };
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
