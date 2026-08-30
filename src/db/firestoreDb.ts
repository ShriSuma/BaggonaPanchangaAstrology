import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from "firebase/firestore";
import { firestore } from "../services/firebase";
import type { KundliOutput, PanchangOutput } from "../core/AstroTypes";
import { db } from "./indexedDb";

export type UserRole = "priest" | "admin" | "superadmin" | "devotee";

export interface UserProfileDoc {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  passwordHash?: string;
  firstTimeSetupCompleted?: boolean;
  mustResetPassword?: boolean;
  allowedModules?: string[]; // ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"]
  phone?: string;
  email?: string;
  knownIps?: string[];
  lastKnownIp?: string;
  lastDevice?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PriestWalletDoc {
  id: string;
  userId: string;
  priestName: string;
  coinBalance: number;
  totalRechargedInr: number;
  totalCoinsCredited: number;
  totalCoinsSpent: number;
  allowedModules?: string[]; // ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"]
  updatedAt: string;
}

export interface WalletTransactionDoc {
  id: string;
  walletId: string;
  userId: string;
  priestName?: string;
  type: "recharge" | "deduction" | "bonus" | "refund";
  inrAmount?: number;
  coins: number;
  packageKey?: string;
  upiUtr?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  description: string;
  clientName?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface PanchangHistoryDoc {
  id: string;
  date: string;
  location: string;
  data: PanchangOutput;
  createdBy?: string;
  createdAt: string;
}

export interface KundliHistoryDoc {
  id: string;
  userId: string;
  priestName?: string;
  name: string;
  birthDate: string;
  birthTime: string;
  placeName: string;
  latitude?: number;
  longitude?: number;
  pincode?: string;
  gothra?: string;

  // Discrete Astrological Fields
  rashi: string;
  rashiSanskrit?: string;
  nakshatra: string;
  nakshatraSanskrit?: string;
  pada: number;
  lagnaRashi: string;
  sunSign: string;
  planetsSummary?: Array<{
    name: string;
    degree: number;
    rashi: string;
    house: number;
    isRetrograde?: boolean;
  }>;

  // Full calculation payload
  kundliData: KundliOutput;
  createdAt: string;
  updatedAt?: string;
}

export interface AshirvadaPassDownloadLog {
  downloadedBy: string;
  role: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AshirvadaPassDoc {
  id: string;
  userId: string;
  priestName: string;
  devoteeName: string;
  sevaName: string;
  totalDays: number;
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  qrCodeUrl?: string;
  downloadCount: number;
  lastDownloadedAt?: string;
  downloadHistory: AshirvadaPassDownloadLog[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemAuditLogDoc {
  id: string;
  action: string;
  userId: string;
  username: string;
  role: string;
  ipAddress?: string;
  device?: string;
  details: string;
  timestamp: string;
}

export interface NotificationLogDoc {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

export interface PremiumPdfDownloadDoc {
  id: string;
  devoteeName: string;
  username: string;
  priestName?: string;
  portalSource: "Baggona Bhavishya" | "Priest Mobile Portal" | "Direct Download";
  language: string; // "kn" | "en" | "hi" | "te" | "ta"
  coinsSpent: number; // e.g. 3500
  amountInr: number; // e.g. 350
  timestamp: string;
  dateKey: string; // "YYYY-MM-DD"
}

// Collection references
const USERS_COL = "users";
const WALLETS_COL = "wallets";
const TRANSACTIONS_COL = "transactions";
const PANCHANG_COL = "panchangHistory";
const KUNDLIS_COL = "kundlis";
const ASHIRVADA_COL = "ashirvadaPasses";
const AUDIT_COL = "systemAuditLogs";
const NOTIFICATIONS_COL = "notifications";
const PREMIUM_PDF_DOWNLOADS_COL = "premiumPdfDownloads";

// Helper to clean undefined values before Firestore writes
function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Sync or create user profile in Firestore
 */
export async function syncUserProfile(profile: UserProfileDoc): Promise<void> {
  try {
    const userRef = doc(firestore, USERS_COL, profile.id);
    await setDoc(userRef, sanitizeFirestoreData({
      ...profile,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  } catch (err) {
    console.warn("[Firestore] Failed to sync user profile:", err);
  }
}

/**
 * Fetch a User Profile from Firestore or local Dexie database
 */
export async function getUserProfile(userId: string): Promise<UserProfileDoc | null> {
  try {
    const cleanId = userId.trim().toLowerCase();
    if (firestore) {
      const userRef = doc(firestore, USERS_COL, cleanId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfileDoc;
      }
      const q = query(collection(firestore, USERS_COL), where("username", "==", cleanId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as UserProfileDoc;
      }
    }
    const local = await db.users.where("username").equals(cleanId).first();
    if (local) {
      return {
        id: local.id || cleanId,
        username: local.username,
        name: local.username,
        role: "priest",
        allowedModules: local.allowedModules,
        createdAt: local.createdAt || new Date().toISOString(),
        lastLoginAt: local.lastLoginAt
      };
    }
    return null;
  } catch (err) {
    console.warn("[Firestore] Failed to fetch user profile:", err);
    return null;
  }
}

/**
 * Fetch or initialize a Priest Wallet in Firestore
 */
export async function getOrCreatePriestWallet(
  userId: string,
  priestName: string = "Shreeram Pandit",
  allowedModules?: string[]
): Promise<PriestWalletDoc> {
  try {
    const walletRef = doc(firestore, WALLETS_COL, userId);
    const snap = await getDoc(walletRef);
    if (snap.exists()) {
      const data = snap.data() as PriestWalletDoc;
      if (allowedModules && allowedModules.length > 0 && !data.allowedModules) {
        await updateDoc(walletRef, { allowedModules });
        data.allowedModules = allowedModules;
      }
      return data;
    }

    const newWallet: PriestWalletDoc = {
      id: userId,
      userId,
      priestName,
      coinBalance: 1000, // Welcome bonus 1,000 free coins for priest/user first time
      totalRechargedInr: 0,
      totalCoinsCredited: 1000,
      totalCoinsSpent: 0,
      allowedModules: allowedModules || ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"],
      updatedAt: new Date().toISOString()
    };

    await setDoc(walletRef, newWallet);
    return newWallet;
  } catch (err) {
    console.warn("[Firestore] Error getting or creating priest wallet:", err);
    return {
      id: userId,
      userId,
      priestName,
      coinBalance: 1000,
      totalRechargedInr: 0,
      totalCoinsCredited: 1000,
      totalCoinsSpent: 0,
      allowedModules: allowedModules || ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"],
      updatedAt: new Date().toISOString()
    };
  }
}

/**
 * Super Admin: Update allowed modules for a user in both users and wallets collections
 */
export async function updateUserAllowedModules(
  userId: string,
  allowedModules: string[]
): Promise<boolean> {
  try {
    // 1. Update wallet doc
    const walletRef = doc(firestore, WALLETS_COL, userId);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      await updateDoc(walletRef, {
        allowedModules,
        updatedAt: new Date().toISOString()
      });
    }

    // 2. Update user profile doc
    const userRef = doc(firestore, USERS_COL, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        allowedModules,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Query by username
      const q = query(collection(firestore, USERS_COL), where("username", "==", userId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        await updateDoc(qSnap.docs[0].ref, {
          allowedModules,
          updatedAt: new Date().toISOString()
        });
      }
    }
    return true;
  } catch (err) {
    console.error("[Firestore] Failed to update user allowed modules:", err);
    return false;
  }
}

/**
 * Super Admin: Delete a Priest Account, revoke wallet, and remove access tokens permanently
 */
export async function deletePriestAccount(userId: string): Promise<boolean> {
  try {
    const cleanId = userId.trim().toLowerCase();

    // 1. Delete from Firestore Wallets collection
    try {
      if (firestore) {
        const walletRef = doc(firestore, WALLETS_COL, cleanId);
        await deleteDoc(walletRef);
      }
    } catch (e) {
      console.warn("[Firestore] Error deleting wallet doc:", e);
    }

    // 2. Delete from Firestore Users collection (direct ID and by query)
    try {
      if (firestore) {
        const userRef = doc(firestore, USERS_COL, cleanId);
        await deleteDoc(userRef);

        const q = query(collection(firestore, USERS_COL), where("username", "==", cleanId));
        const qSnap = await getDocs(q);
        for (const d of qSnap.docs) {
          await deleteDoc(d.ref);
        }
      }
    } catch (e) {
      console.warn("[Firestore] Error deleting user doc:", e);
    }

    // 3. Delete MFA OTP doc if any
    try {
      if (firestore) {
        const otpRef = doc(firestore, MFA_OTPS_COL, cleanId);
        await deleteDoc(otpRef);
      }
    } catch (e) {
      console.warn("[Firestore] Error deleting MFA OTP doc:", e);
    }

    // 4. Delete from local IndexedDB (Dexie)
    try {
      const existing = await db.users.where("username").equals(cleanId).first();
      if (existing && existing.id) {
        await db.users.delete(existing.id);
      }
      await db.users.where("username").equals(cleanId).delete();
    } catch (e) {
      console.warn("[IndexedDB] Error deleting local user:", e);
    }

    // 5. Clean up localStorage setup/session keys for this priest if present
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("baggona_pwd_setup_done_" + cleanId);
        if (localStorage.getItem("baggona_priest_id") === cleanId) {
          localStorage.removeItem("baggona_priest_id");
          localStorage.removeItem("baggona_priest_name");
        }
      } catch {}
    }

    console.log(`[Firestore] ✅ Priest account ${cleanId} deleted & revoked permanently`);
    return true;
  } catch (err) {
    console.error("[Firestore] Delete priest account error:", err);
    return false;
  }
}

/**
 * Check if a priest user account exists and is active (not deleted or revoked)
 */
export async function isPriestAccountActive(userId: string): Promise<boolean> {
  try {
    const cleanId = userId.trim().toLowerCase();
    // Default master priests/admins are always allowed
    if (cleanId === "superadmin" || cleanId === "baggona" || cleanId === "priest_shreeram") {
      return true;
    }

    if (firestore) {
      // Check Firestore user doc
      const userRef = doc(firestore, USERS_COL, cleanId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return true;
      }

      // Check query by username in Firestore
      const q = query(collection(firestore, USERS_COL), where("username", "==", cleanId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return true;
      }

      // Check wallet existence in Firestore
      const walletRef = doc(firestore, WALLETS_COL, cleanId);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        return true;
      }
    }

    // Check IndexedDB
    const localUser = await db.users.where("username").equals(cleanId).first();
    if (localUser) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn("[Firestore] isPriestAccountActive check error:", err);
    return true; // fail-safe fallback
  }
}

/**
 * Real-time subscription to a priest wallet
 */
export function subscribePriestWallet(userId: string, onUpdate: (wallet: PriestWalletDoc) => void): Unsubscribe {
  const walletRef = doc(firestore, WALLETS_COL, userId);
  return onSnapshot(walletRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as PriestWalletDoc);
    }
  }, (err) => {
    console.warn("[Firestore] Wallet listener error:", err);
  });
}

/**
 * Record a wallet transaction (Recharge request or deduction)
 */
export async function createWalletTransaction(tx: WalletTransactionDoc): Promise<string> {
  try {
    const txRef = doc(firestore, TRANSACTIONS_COL, tx.id);
    await setDoc(txRef, tx);
    return tx.id;
  } catch (err) {
    console.error("[Firestore] Failed to create wallet transaction:", err);
    throw err;
  }
}

/**
 * Real-time subscription to transactions for a priest/wallet
 */
export function subscribeWalletTransactions(
  userId: string,
  onUpdate: (transactions: WalletTransactionDoc[]) => void,
  limitCount: number = 50
): Unsubscribe {
  const q = query(
    collection(firestore, TRANSACTIONS_COL),
    where("userId", "==", userId),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const list: WalletTransactionDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WalletTransactionDoc);
    });
    // Sort descending by createdAt
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] Transactions listener error:", err);
  });
}

/**
 * Real-time subscription to ALL pending transactions (Admin view)
 */
export function subscribePendingTransactions(
  onUpdate: (transactions: WalletTransactionDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(firestore, TRANSACTIONS_COL),
    where("status", "==", "pending")
  );

  return onSnapshot(q, (snapshot) => {
    const list: WalletTransactionDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WalletTransactionDoc);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] Pending transactions listener error:", err);
  });
}

/**
 * Approve a coin recharge transaction and update wallet balance atomically
 */
export async function approveRechargeTransaction(txId: string): Promise<boolean> {
  try {
    const txRef = doc(firestore, TRANSACTIONS_COL, txId);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return false;

    const tx = txSnap.data() as WalletTransactionDoc;
    if (tx.status !== "pending") return false;

    // Update transaction
    await updateDoc(txRef, {
      status: "approved",
      approvedAt: new Date().toISOString()
    });

    // Update wallet
    const walletRef = doc(firestore, WALLETS_COL, tx.userId);
    const walletSnap = await getDoc(walletRef);
    if (walletSnap.exists()) {
      const currentWallet = walletSnap.data() as PriestWalletDoc;
      await updateDoc(walletRef, {
        coinBalance: (currentWallet.coinBalance || 0) + tx.coins,
        totalRechargedInr: (currentWallet.totalRechargedInr || 0) + (tx.inrAmount || 0),
        totalCoinsCredited: (currentWallet.totalCoinsCredited || 0) + tx.coins,
        updatedAt: new Date().toISOString()
      });
    }

    return true;
  } catch (err) {
    console.error("[Firestore] Failed to approve recharge transaction:", err);
    return false;
  }
}

/**
 * Super Admin: Real-time subscription to ALL Priest Wallets in Firestore
 */
export function subscribeAllPriestWallets(
  onUpdate: (wallets: PriestWalletDoc[]) => void
): Unsubscribe {
  const q = query(collection(firestore, WALLETS_COL));
  return onSnapshot(q, (snapshot) => {
    const list: PriestWalletDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as PriestWalletDoc);
    });
    list.sort((a, b) => (b.coinBalance || 0) - (a.coinBalance || 0));
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] All wallets listener error:", err);
  });
}

/**
 * Super Admin: Direct Coin Injection or Manual Adjustment for any Priest
 */
export async function directAdminCoinAdjustment(
  userId: string,
  coinsToAdjust: number,
  reason: string = "Super Admin Direct Credit"
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const walletRef = doc(firestore, WALLETS_COL, userId);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) {
      return { success: false, newBalance: 0, error: "Priest wallet not found" };
    }

    const currentWallet = walletSnap.data() as PriestWalletDoc;
    const newBalance = Math.max(0, (currentWallet.coinBalance || 0) + coinsToAdjust);

    await updateDoc(walletRef, {
      coinBalance: newBalance,
      totalCoinsCredited: coinsToAdjust > 0 ? (currentWallet.totalCoinsCredited || 0) + coinsToAdjust : (currentWallet.totalCoinsCredited || 0),
      totalCoinsSpent: coinsToAdjust < 0 ? (currentWallet.totalCoinsSpent || 0) + Math.abs(coinsToAdjust) : (currentWallet.totalCoinsSpent || 0),
      updatedAt: new Date().toISOString()
    });

    // Create audit transaction record
    const txId = `tx_admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await createWalletTransaction({
      id: txId,
      walletId: userId,
      userId,
      priestName: currentWallet.priestName,
      type: coinsToAdjust > 0 ? "bonus" : "deduction",
      coins: coinsToAdjust,
      status: "completed",
      description: `[Super Admin] ${reason}`,
      createdAt: new Date().toISOString()
    });

    return { success: true, newBalance };
  } catch (err) {
    console.error("[Firestore] Admin coin adjustment failed:", err);
    return { success: false, newBalance: 0, error: "Failed to adjust coins in database" };
  }
}

/**
 * Updates a user's password hash in Firestore
 */
export async function updateUserPassword(
  usernameOrId: string,
  passwordHash: string
): Promise<boolean> {
  try {
    const q = query(collection(firestore, USERS_COL), where("username", "==", usernameOrId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userDoc = snap.docs[0];
      await updateDoc(userDoc.ref, {
        passwordHash,
        firstTimeSetupCompleted: true,
        mustResetPassword: false,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    // Try by ID directly
    const directRef = doc(firestore, USERS_COL, usernameOrId);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await updateDoc(directRef, {
        passwordHash,
        firstTimeSetupCompleted: true,
        mustResetPassword: false,
        updatedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Firestore] updateUserPassword error:", err);
    return false;
  }
}

/**
 * Super Admin & Priest Authentication:
 * Checks if a Priest has already completed their first-time password setup/reset.
 * Verifies localStorage cache first, then Firestore user profile, then local IndexedDB.
 */
export async function isPriestFirstTimeSetupDone(userId: string): Promise<boolean> {
  try {
    const cleanId = userId.trim().toLowerCase();

    // 1. Check client-side local cache
    if (typeof window !== "undefined") {
      const localFlag = localStorage.getItem("baggona_pwd_setup_done_" + cleanId);
      if (localFlag === "true") {
        return true;
      }
    }

    // 2. Check Firestore User Profile
    const profile = await getUserProfile(cleanId);
    if (profile) {
      if (profile.firstTimeSetupCompleted === true || (profile.passwordHash && !profile.mustResetPassword)) {
        if (typeof window !== "undefined") {
          localStorage.setItem("baggona_pwd_setup_done_" + cleanId, "true");
        }
        return true;
      }
    }

    // 3. Check IndexedDB Users table
    const localUser = await db.users.where("username").equals(cleanId).first();
    if (localUser && localUser.passwordHash) {
      if (typeof window !== "undefined") {
        localStorage.setItem("baggona_pwd_setup_done_" + cleanId, "true");
      }
      return true;
    }

    return false;
  } catch (err) {
    console.warn("[Firestore] isPriestFirstTimeSetupDone check error:", err);
    return false;
  }
}

/**
 * Deduct coins from Priest wallet for a service
 */
export async function deductPriestCoins(
  userId: string,
  coinsToDeduct: number,
  description: string,
  clientName?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const walletRef = doc(firestore, WALLETS_COL, userId);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) {
      return { success: false, newBalance: 0, error: "Wallet not found" };
    }

    const wallet = walletSnap.data() as PriestWalletDoc;
    if (wallet.coinBalance < coinsToDeduct) {
      return {
        success: false,
        newBalance: wallet.coinBalance,
        error: `Insufficient coins (${wallet.coinBalance} available, ${coinsToDeduct} needed)`
      };
    }

    const newBalance = wallet.coinBalance - coinsToDeduct;
    await updateDoc(walletRef, {
      coinBalance: newBalance,
      totalCoinsSpent: (wallet.totalCoinsSpent || 0) + coinsToDeduct,
      updatedAt: new Date().toISOString()
    });

    // Create deduction record
    const txId = `tx_deduct_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await createWalletTransaction({
      id: txId,
      walletId: userId,
      userId,
      type: "deduction",
      coins: -coinsToDeduct,
      status: "completed",
      description,
      clientName,
      createdAt: new Date().toISOString()
    });

    return { success: true, newBalance };
  } catch (err) {
    console.error("[Firestore] Deduct coins error:", err);
    return { success: false, newBalance: 0, error: "Database deduction error" };
  }
}

/**
 * Save Panchanga record to cloud Firestore
 */
export async function savePanchangToFirestore(record: PanchangHistoryDoc): Promise<void> {
  try {
    const panchangRef = doc(firestore, PANCHANG_COL, record.id);
    await setDoc(panchangRef, sanitizeFirestoreData(record), { merge: true });
  } catch (err) {
    console.warn("[Firestore] Save Panchang error:", err);
  }
}

/**
 * Save Kundli record to cloud Firestore with automatic deduplication
 */
export async function saveKundliToFirestore(record: KundliHistoryDoc): Promise<void> {
  try {
    const cleanName = (record.name || "").trim().toLowerCase();
    const cleanDate = (record.birthDate || "").trim();
    const cleanTime = (record.birthTime || "").trim();

    // Deduplication check: see if a kundli with exact same name, birth date, and birth time exists
    if (cleanName && cleanDate) {
      const q = query(
        collection(firestore, KUNDLIS_COL),
        where("birthDate", "==", record.birthDate)
      );
      const snap = await getDocs(q);
      const duplicate = snap.docs.find((d) => {
        const data = d.data() as KundliHistoryDoc;
        return (data.name || "").trim().toLowerCase() === cleanName &&
               (data.birthTime || "").trim() === cleanTime;
      });

      if (duplicate) {
        // Update the existing record instead of creating a duplicate
        const targetRef = doc(firestore, KUNDLIS_COL, duplicate.id);
        await setDoc(targetRef, sanitizeFirestoreData({ ...record, id: duplicate.id, updatedAt: new Date().toISOString() }), { merge: true });
        return;
      }
    }

    const kundliRef = doc(firestore, KUNDLIS_COL, record.id);
    await setDoc(kundliRef, sanitizeFirestoreData(record), { merge: true });
  } catch (err) {
    console.warn("[Firestore] Save Kundli error:", err);
  }
}

/**
 * Super Admin: One-click Background Deduplicator for Kundli Database
 */
export async function cleanupDuplicateKundlis(): Promise<{ removedCount: number }> {
  try {
    const q = query(collection(firestore, KUNDLIS_COL), limit(300));
    const snap = await getDocs(q);
    const seen = new Map<string, string>(); // fingerprint -> docId
    let removedCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data() as KundliHistoryDoc;
      const fingerprint = `${(data.name || "").trim().toLowerCase()}_${(data.birthDate || "").trim()}_${(data.birthTime || "").trim()}`;
      
      if (seen.has(fingerprint)) {
        // Duplicate found! Delete redundant duplicate
        await deleteDoc(docSnap.ref);
        removedCount++;
      } else {
        seen.set(fingerprint, docSnap.id);
      }
    }

    return { removedCount };
  } catch (err) {
    console.error("[Firestore] Deduplication error:", err);
    return { removedCount: 0 };
  }
}

/**
 * Audit notification dispatch
 */
export async function logNotificationAudit(log: NotificationLogDoc): Promise<void> {
  try {
    const notifRef = doc(firestore, NOTIFICATIONS_COL, log.id);
    await setDoc(notifRef, sanitizeFirestoreData(log));
  } catch (err) {
    console.warn("[Firestore] Notification audit log error:", err);
  }
}

/**
 * Super Admin: Real-time subscription to all saved Kundlis in Firestore
 */
export function subscribeAllKundlis(
  onUpdate: (kundlis: KundliHistoryDoc[]) => void
): Unsubscribe {
  const q = query(collection(firestore, KUNDLIS_COL), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: KundliHistoryDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as KundliHistoryDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] All kundlis listener error:", err);
  });
}

/**
 * Save or update Ashirvada QR pass in Firestore
 */
export async function saveAshirvadaPassToFirestore(pass: AshirvadaPassDoc): Promise<void> {
  try {
    const passRef = doc(firestore, ASHIRVADA_COL, pass.id);
    await setDoc(passRef, sanitizeFirestoreData(pass), { merge: true });
  } catch (err) {
    console.warn("[Firestore] Save Ashirvada pass error:", err);
  }
}

/**
 * Super Admin / Priest: Real-time subscription to Ashirvada Passes
 */
export function subscribeAshirvadaPasses(
  onUpdate: (passes: AshirvadaPassDoc[]) => void
): Unsubscribe {
  const q = query(collection(firestore, ASHIRVADA_COL), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: AshirvadaPassDoc[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as AshirvadaPassDoc;
      // Calculate dynamic days remaining from now to expiresAt
      const expTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const dynamicDaysLeft = Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));
      list.push({ ...data, daysRemaining: dynamicDaysLeft });
    });
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] Ashirvada passes listener error:", err);
  });
}

/**
 * Super Admin: 1-Click Reset / Extend Ashirvada Pass Validity Days
 */
export async function resetAshirvadaPassValidity(
  passId: string,
  additionalDays: number = 90
): Promise<boolean> {
  try {
    const passRef = doc(firestore, ASHIRVADA_COL, passId);
    const snap = await getDoc(passRef);
    if (!snap.exists()) return false;

    const newExpiresAt = new Date(Date.now() + additionalDays * 24 * 60 * 60 * 1000).toISOString();

    await updateDoc(passRef, {
      totalDays: additionalDays,
      expiresAt: newExpiresAt,
      daysRemaining: additionalDays,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (err) {
    console.error("[Firestore] Reset validity error:", err);
    return false;
  }
}

/**
 * Super Admin: Delete an Ashirvada QR pass by ID
 */
export async function deleteAshirvadaPass(passId: string): Promise<boolean> {
  try {
    const passRef = doc(firestore, ASHIRVADA_COL, passId);
    await deleteDoc(passRef);
    return true;
  } catch (err) {
    console.error("[Firestore] Delete pass error:", err);
    return false;
  }
}

/**
 * Record a download event for an Ashirvada QR pass
 */
export async function recordAshirvadaPassDownload(
  passId: string,
  downloadedBy: string,
  role: string,
  ipAddress?: string
): Promise<boolean> {
  try {
    const passRef = doc(firestore, ASHIRVADA_COL, passId);
    const snap = await getDoc(passRef);
    if (!snap.exists()) return false;

    const data = snap.data() as AshirvadaPassDoc;
    const history = Array.isArray(data.downloadHistory) ? data.downloadHistory : [];

    history.unshift({
      downloadedBy,
      role,
      timestamp: new Date().toISOString(),
      ipAddress: ipAddress || "Unknown IP"
    });

    await updateDoc(passRef, {
      downloadCount: (data.downloadCount || 0) + 1,
      lastDownloadedAt: new Date().toISOString(),
      downloadHistory: history.slice(0, 50),
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (err) {
    console.warn("[Firestore] Record pass download error:", err);
    return false;
  }
}

/**
 * Log an immutable System Audit Event (logins, IP alerts, coin credits, Kundli creations)
 */
export async function logSystemAuditEvent(log: SystemAuditLogDoc): Promise<void> {
  try {
    const auditRef = doc(firestore, AUDIT_COL, log.id);
    await setDoc(auditRef, sanitizeFirestoreData(log));
  } catch (err) {
    console.warn("[Firestore] Log audit event error:", err);
  }
}

/**
 * Super Admin: Real-time subscription to System Audit Logs
 */
export function subscribeSystemAuditLogs(
  onUpdate: (logs: SystemAuditLogDoc[]) => void
): Unsubscribe {
  const q = query(collection(firestore, AUDIT_COL), orderBy("timestamp", "desc"), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: SystemAuditLogDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as SystemAuditLogDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] Audit logs listener error:", err);
  });
}

/**
 * Log a Premium PDF Download Event in Firestore
 */
export async function logPremiumPdfDownload(data: Omit<PremiumPdfDownloadDoc, "id">): Promise<string> {
  const id = `pdf_dl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const record: PremiumPdfDownloadDoc = {
    id,
    ...data
  };
  try {
    const ref = doc(firestore, PREMIUM_PDF_DOWNLOADS_COL, id);
    await setDoc(ref, sanitizeFirestoreData(record));
  } catch (err) {
    console.warn("[Firestore] Failed to log premium PDF download:", err);
  }
  return id;
}

/**
 * Query today's Premium PDF downloads from Firestore
 */
export async function getTodayPremiumPdfDownloads(targetDate?: string): Promise<PremiumPdfDownloadDoc[]> {
  const dateKey = targetDate || new Date().toISOString().split("T")[0];
  try {
    const q = query(
      collection(firestore, PREMIUM_PDF_DOWNLOADS_COL),
      where("dateKey", "==", dateKey)
    );
    const snap = await getDocs(q);
    const list: PremiumPdfDownloadDoc[] = [];
    snap.forEach((d) => list.push(d.data() as PremiumPdfDownloadDoc));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    console.warn("[Firestore] getTodayPremiumPdfDownloads error:", err);
    return [];
  }
}

/**
 * Real-time subscription to all Premium PDF downloads
 */
export function subscribePremiumPdfDownloads(
  onUpdate: (downloads: PremiumPdfDownloadDoc[]) => void
): Unsubscribe {
  const q = query(collection(firestore, PREMIUM_PDF_DOWNLOADS_COL), orderBy("timestamp", "desc"), limit(100));
  return onSnapshot(q, (snapshot) => {
    const list: PremiumPdfDownloadDoc[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as PremiumPdfDownloadDoc);
    });
    onUpdate(list);
  }, (err) => {
    console.warn("[Firestore] Premium PDF downloads listener error:", err);
  });
}

export const MFA_OTPS_COL = "mfa_otps";

export interface MfaOtpDoc {
  id: string;
  username: string;
  otpCode: string;
  recipientEmail: string;
  createdAt: string;
  expiresAt: string;
  expiresAtMs: number;
  isUsed: boolean;
  usedAt?: string;
}

/**
 * Register & store a 6-digit MFA OTP in Firestore with a 3-minute TTL
 */
export async function saveMfaOtpToDb(
  username: string,
  otpCode: string,
  recipientEmail: string = "spshreepandit@gmail.com",
  validityMinutes: number = 3
): Promise<boolean> {
  try {
    const cleanUsername = username.trim().toLowerCase();
    const docRef = doc(firestore, MFA_OTPS_COL, cleanUsername);
    const now = Date.now();
    const expiresAtMs = now + validityMinutes * 60 * 1000;
    const otpData: MfaOtpDoc = {
      id: cleanUsername,
      username,
      otpCode,
      recipientEmail,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString(),
      expiresAtMs,
      isUsed: false
    };
    await setDoc(docRef, otpData);
    console.log(`[Firestore] 🔒 MFA OTP registered in DB for ${username} (Expires in ${validityMinutes} mins)`);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to save MFA OTP to DB:`, err);
    return false;
  }
}

/**
 * Validate a 6-digit MFA OTP from Firestore DB (checks match, 3-min expiry, and single-use)
 */
export async function validateMfaOtpInDb(
  username: string,
  inputOtp: string,
  options?: { consume?: boolean }
): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!firestore) return { valid: true };
    const cleanUsername = username.trim().toLowerCase();
    const docRef = doc(firestore, MFA_OTPS_COL, cleanUsername);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      // In offline/test scenarios where OTP document wasn't written to Firestore, allow memory-based OTP verification
      return { valid: true };
    }

    const data = snap.data() as MfaOtpDoc;

    if (data.otpCode !== inputOtp.trim()) {
      return { valid: false, error: "Invalid 6-digit code. Please check your email (spshreepandit@gmail.com)." };
    }

    if (data.isUsed) {
      return { valid: false, error: "This verification code has already been used. Please request a new code." };
    }

    if (Date.now() > data.expiresAtMs) {
      return { valid: false, error: "Verification code has expired. OTP is valid for 3 minutes only. Please click 'Resend OTP Code'." };
    }

    // Mark as used unless caller opted out
    if (options?.consume !== false) {
      await updateDoc(docRef, {
        isUsed: true,
        usedAt: new Date().toISOString()
      });
    }

    console.log(`[Firestore] ✅ MFA OTP successfully validated in DB for ${username}`);
    return { valid: true };
  } catch (err) {
    console.warn(`[Firestore] validateMfaOtpInDb error (falling back to memory state):`, err);
    // If firestore is offline or in test mock mode, allow memory validation
    return { valid: true };
  }
}

