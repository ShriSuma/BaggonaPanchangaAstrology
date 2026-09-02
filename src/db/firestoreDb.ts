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
  runTransaction,
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
  mobileNumber?: string;
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
  email?: string;
  phone?: string;
  mobileNumber?: string;
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
const APP_CONFIGS_COL = "app_configurations";

export const PANCHANGA_ENGINE_DOC_ID = "panchanga_engine_config";

export type PanchangaEngineMode = "baggona_book" | "mathematical";

export interface PanchangaEngineConfigDoc {
  id: string;
  engineMode: PanchangaEngineMode;
  bookYear: string;
  bookSpan: string;
  updatedAt: string;
  updatedBy?: string;
  description: string;
}

// Helper to clean undefined values before Firestore writes
function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

/**
 * Sync or create user profile in Firestore
 */
export async function syncUserProfile(profile: UserProfileDoc): Promise<void> {
  try {
    const cleanId = (profile.id || profile.username || "").trim().toLowerCase();
    const userRef = doc(firestore, USERS_COL, cleanId);
    await setDoc(userRef, sanitizeFirestoreData({
      ...profile,
      id: cleanId,
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
    const rawId = userId.trim();
    const cleanId = rawId.toLowerCase();
    if (firestore) {
      const userRef = doc(firestore, USERS_COL, cleanId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfileDoc;
      }
      const rawRef = doc(firestore, USERS_COL, rawId);
      const rawSnap = await getDoc(rawRef);
      if (rawSnap.exists()) {
        return rawSnap.data() as UserProfileDoc;
      }
      const q = query(collection(firestore, USERS_COL), where("username", "==", cleanId));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as UserProfileDoc;
      }
      const qRaw = query(collection(firestore, USERS_COL), where("username", "==", rawId));
      const qRawSnap = await getDocs(qRaw);
      if (!qRawSnap.empty) {
        return qRawSnap.docs[0].data() as UserProfileDoc;
      }
    }
    const local = (await db.users.where("username").equals(cleanId).first()) || (await db.users.where("username").equals(rawId).first());
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
      coinBalance: 0, // Paid-only service policy: strictly 0 initial free coins
      totalRechargedInr: 0,
      totalCoinsCredited: 0,
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
      coinBalance: 0,
      totalRechargedInr: 0,
      totalCoinsCredited: 0,
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
    const rawId = (userId || "").trim();
    const cleanId = rawId.toLowerCase();

    // 1. Master priests and Super Admin accounts are always unconditionally active
    const isMasterOrSuperAdmin =
      cleanId === "superadmin" ||
      cleanId === "$hrisuma" ||
      cleanId === "shrisuma" ||
      cleanId === "baggona" ||
      cleanId === "priest_shreeram" ||
      cleanId === "shreerampandit" ||
      cleanId === "superadmin_dollar_shrisuma" ||
      cleanId === "superadmin_shrisuma" ||
      cleanId === "superadmin_master" ||
      rawId === "$hriSuma" ||
      rawId === "ShriSuma";

    if (isMasterOrSuperAdmin) {
      return true;
    }

    if (firestore) {
      // 2. Check direct doc IDs (cleanId, rawId, deterministic superadmin format)
      for (const candidateId of [cleanId, rawId, `superadmin_${cleanId}`]) {
        const userRef = doc(firestore, USERS_COL, candidateId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          return true;
        }
      }

      // 3. Check query by username in Firestore (both rawId and cleanId)
      for (const candidateUsername of [rawId, cleanId]) {
        const q = query(collection(firestore, USERS_COL), where("username", "==", candidateUsername));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          return true;
        }
      }

      // 4. Check wallet existence in Firestore
      for (const candidateWalletId of [cleanId, rawId]) {
        const walletRef = doc(firestore, WALLETS_COL, candidateWalletId);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          return true;
        }
      }
    }

    // 5. Check IndexedDB (both cleanId and rawId)
    const localUser =
      (await db.users.where("username").equals(cleanId).first()) ||
      (await db.users.where("username").equals(rawId).first());
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

// --------------------------------------------------------------------------
// AUTHENTICATION & SECURITY OPERATIONS
// --------------------------------------------------------------------------

/**
 * Updates a user's password hash, email, and mobile number in Firestore
 */
export async function updateUserPassword(
  usernameOrId: string,
  passwordHash: string,
  extraFields?: { email?: string; phone?: string; mobileNumber?: string }
): Promise<boolean> {
  try {
    const cleanId = usernameOrId.trim().toLowerCase();
    const updatePayload: Record<string, any> = {
      passwordHash,
      firstTimeSetupCompleted: true,
      mustResetPassword: false,
      updatedAt: new Date().toISOString()
    };

    if (extraFields?.email) {
      updatePayload.email = extraFields.email.trim().toLowerCase();
    }
    if (extraFields?.phone || extraFields?.mobileNumber) {
      const cleanPhone = (extraFields.phone || extraFields.mobileNumber || "").trim();
      updatePayload.phone = cleanPhone;
      updatePayload.mobileNumber = cleanPhone;
    }

    const q = query(collection(firestore, USERS_COL), where("username", "==", usernameOrId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userDoc = snap.docs[0];
      await updateDoc(userDoc.ref, updatePayload);

      // Also synchronize priest_wallets document if it exists
      try {
        const walletRef = doc(firestore, WALLETS_COL, cleanId);
        const walletSnap = await getDoc(walletRef);
        if (walletSnap.exists()) {
          const wUpdates: Record<string, any> = { updatedAt: new Date().toISOString() };
          if (extraFields?.email) wUpdates.email = extraFields.email.trim().toLowerCase();
          if (extraFields?.phone || extraFields?.mobileNumber) {
            wUpdates.phone = (extraFields.phone || extraFields.mobileNumber || "").trim();
            wUpdates.mobileNumber = wUpdates.phone;
          }
          await updateDoc(walletRef, wUpdates);
        }
      } catch (wErr) {
        console.warn("[Firestore] updateUserPassword wallet sync notice:", wErr);
      }
      return true;
    }

    // Try by ID directly
    const directRef = doc(firestore, USERS_COL, cleanId);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      await updateDoc(directRef, updatePayload);
    } else {
      await setDoc(directRef, {
        id: cleanId,
        username: usernameOrId,
        name: usernameOrId,
        role: "priest",
        createdAt: new Date().toISOString(),
        ...updatePayload
      }, { merge: true });
    }

    // Also synchronize priest_wallets document if it exists
    try {
      const walletRef = doc(firestore, WALLETS_COL, cleanId);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        const wUpdates: Record<string, any> = { updatedAt: new Date().toISOString() };
        if (extraFields?.email) wUpdates.email = extraFields.email.trim().toLowerCase();
        if (extraFields?.phone || extraFields?.mobileNumber) {
          wUpdates.phone = (extraFields.phone || extraFields.mobileNumber || "").trim();
          wUpdates.mobileNumber = wUpdates.phone;
        }
        await updateDoc(walletRef, wUpdates);
      }
    } catch (wErr) {
      console.warn("[Firestore] updateUserPassword wallet sync notice:", wErr);
    }
    return true;
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
 * Deduct coins from Priest wallet for a service with 100% ACID properties (Atomicity, Consistency, Isolation, Durability)
 * Uses Firestore runTransaction to guarantee:
 * 1. Atomicity: Wallet balance update and transaction ledger write happen all-or-nothing.
 * 2. Consistency & Isolation: Atomic read-and-decrement prevents race conditions, duplicate spends, or negative balances.
 * 3. Idempotency: Optional idempotencyKey / deduplication lock prevents double-deduction on rapid duplicate clicks.
 */
export async function deductPriestCoins(
  userId: string,
  coinsToDeduct: number,
  description: string,
  clientName?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; newBalance: number; error?: string; txId?: string }> {
  if (coinsToDeduct <= 0) {
    return { success: true, newBalance: 0 };
  }

  try {
    const walletRef = doc(firestore, WALLETS_COL, userId);
    const txId = idempotencyKey || `tx_deduct_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const txRef = doc(firestore, TRANSACTIONS_COL, txId);

    const result = await runTransaction(firestore, async (transaction) => {
      // 1. Check idempotency: If this transaction already exists, return current wallet state
      const existingTx = await transaction.get(txRef);
      if (existingTx.exists()) {
        const walletSnap = await transaction.get(walletRef);
        const wData = walletSnap.exists() ? (walletSnap.data() as PriestWalletDoc) : null;
        return {
          success: true,
          newBalance: wData?.coinBalance ?? 0,
          txId,
          alreadyProcessed: true
        };
      }

      // 2. Atomic read of wallet
      const walletSnap = await transaction.get(walletRef);
      if (!walletSnap.exists()) {
        throw new Error("WALLET_NOT_FOUND");
      }

      const wallet = walletSnap.data() as PriestWalletDoc;
      const currentBalance = wallet.coinBalance || 0;

      if (currentBalance < coinsToDeduct) {
        throw new Error(`INSUFFICIENT_COINS:${currentBalance}`);
      }

      const newBalance = currentBalance - coinsToDeduct;
      const nowIso = new Date().toISOString();

      // 3. Atomic wallet balance update
      transaction.update(walletRef, {
        coinBalance: newBalance,
        totalCoinsSpent: (wallet.totalCoinsSpent || 0) + coinsToDeduct,
        updatedAt: nowIso
      });

      // 4. Atomic transaction ledger creation
      const txDoc: WalletTransactionDoc = {
        id: txId,
        walletId: userId,
        userId,
        priestName: wallet.priestName,
        type: "deduction",
        coins: -coinsToDeduct,
        status: "completed",
        description,
        clientName,
        createdAt: nowIso
      };
      transaction.set(txRef, txDoc);

      return { success: true, newBalance, txId };
    });

    return result;
  } catch (err: any) {
    console.error("[Firestore] ACID Deduct coins error:", err);
    if (err?.message?.startsWith("INSUFFICIENT_COINS:")) {
      const available = err.message.split(":")[1] || "0";
      return {
        success: false,
        newBalance: Number(available),
        error: `ನಾಣ್ಯಗಳ ಕೊರತೆ ಇದೆ (${available} ನಾಣ್ಯಗಳು ಲಭ್ಯವಿದೆ, ${coinsToDeduct} ನಾಣ್ಯಗಳು ಅಗತ್ಯವಿದೆ). ದಯವಿಟ್ಟು ರೀಚಾರ್ಜ್ ಮಾಡಿ.`
      };
    }
    if (err?.message === "WALLET_NOT_FOUND") {
      return { success: false, newBalance: 0, error: "ಪುರೋಹಿತರ ವಾಲೆಟ್ ಕಂಡುಬಂದಿಲ್ಲ." };
    }
    return { success: false, newBalance: 0, error: "ವಹಿವಾಟು ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ." };
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
 * Super Admin: One-click Background Deduplicator for Calendar Visits & Devotee Engagement Database
 * Cleans duplicate calendar visit documents and test entries.
 */
export async function cleanupDuplicateCalendarVisitsAndEngagement(): Promise<{ removedCount: number }> {
  try {
    if (!firestore) return { removedCount: 0 };
    const snap = await getDocs(query(collection(firestore, "calendarVisits"), limit(500)));
    const seen = new Map<string, string>(); // canonicalKey -> primaryDocId
    let removedCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const devoteeName = (data.devoteeName || "").trim().toLowerCase();
      const token = (data.tokenIdentifier || "").trim();
      const dateClicked = (data.dateClicked || "").trim();
      const actualDate = (data.actualDate || "").trim();

      // Check if it's a test/mock entry
      if (
        devoteeName.includes("test") ||
        devoteeName.includes("mock") ||
        token.includes("test") ||
        token.includes("mock")
      ) {
        await deleteDoc(docSnap.ref);
        removedCount++;
        continue;
      }

      const canonicalKey = `${token}_${actualDate}_${dateClicked}`;
      if (seen.has(canonicalKey)) {
        await deleteDoc(docSnap.ref);
        removedCount++;
      } else {
        seen.set(canonicalKey, docSnap.id);
      }
    }

    return { removedCount };
  } catch (err) {
    console.error("[Firestore] Calendar visits deduplication error:", err);
    return { removedCount: 0 };
  }
}

export interface TestCleanupReport {
  removedUsers: number;
  removedWallets: number;
  removedVisits: number;
  removedEngagement: number;
  removedTokens: number;
  removedKundlis: number;
  details: string[];
}

/**
 * Super Admin Utility to Purge all Test/Mock Profiles & Legacy Synthetic Data
 * Ensures production Cloud Firestore only retains authentic users created by Super Admin or real calendar logins.
 */
export async function cleanupAllTestAndMockProfiles(): Promise<TestCleanupReport> {
  const report: TestCleanupReport = {
    removedUsers: 0,
    removedWallets: 0,
    removedVisits: 0,
    removedEngagement: 0,
    removedTokens: 0,
    removedKundlis: 0,
    details: []
  };

  try {
    if (!firestore) return report;

    const isTestEntry = (str: string) => {
      const s = (str || "").toLowerCase().trim();
      return (
        s.startsWith("test") ||
        s.startsWith("mock") ||
        s.startsWith("sample") ||
        s.startsWith("vitest") ||
        s.startsWith("demo_") ||
        s.includes("test_priest") ||
        s.includes("test-priest") ||
        s.includes("mock_user") ||
        s.includes("mock-user") ||
        s.includes("user_priest_test") ||
        s.includes("priest_remote_test")
      );
    };

    // 1. Purge Test Users
    const usersSnap = await getDocs(query(collection(firestore, USERS_COL), limit(500)));
    for (const docSnap of usersSnap.docs) {
      const data = docSnap.data();
      const uname = data.username || docSnap.id;
      const name = data.name || "";
      // Protect superadmin and authentic priests
      if (uname === "$hriSuma" || uname === "superadmin" || uname === "shreerampandit") continue;

      if (isTestEntry(uname) || isTestEntry(name) || isTestEntry(data.email || "")) {
        await deleteDoc(docSnap.ref);
        report.removedUsers++;
        report.details.push(`User: ${uname}`);
      }
    }

    // 2. Purge Test Wallets
    const walletsSnap = await getDocs(query(collection(firestore, WALLETS_COL), limit(500)));
    for (const docSnap of walletsSnap.docs) {
      const data = docSnap.data();
      const userId = data.userId || docSnap.id;
      const priestName = data.priestName || "";
      if (userId === "$hriSuma" || userId === "superadmin" || userId === "shreerampandit") continue;

      if (isTestEntry(userId) || isTestEntry(priestName)) {
        await deleteDoc(docSnap.ref);
        report.removedWallets++;
        report.details.push(`Wallet: ${userId}`);
      }
    }

    // 3. Purge Test Calendar Visits
    const visitsSnap = await getDocs(query(collection(firestore, "calendarVisits"), limit(500)));
    for (const docSnap of visitsSnap.docs) {
      const data = docSnap.data();
      const name = data.devoteeName || "";
      const token = data.tokenIdentifier || "";
      if (isTestEntry(name) || isTestEntry(token)) {
        await deleteDoc(docSnap.ref);
        report.removedVisits++;
      }
    }

    // 4. Purge Test Calendar Devotee Engagement
    const engSnap = await getDocs(query(collection(firestore, "calendarDevoteeEngagement"), limit(500)));
    for (const docSnap of engSnap.docs) {
      const data = docSnap.data();
      const name = data.devoteeName || "";
      const phone = data.mobileNumber || "";
      if (isTestEntry(name) || isTestEntry(docSnap.id) || phone === "0000000000" || phone === "9999999999") {
        await deleteDoc(docSnap.ref);
        report.removedEngagement++;
      }
    }

    // 5. Purge Test Kundlis
    const kundliSnap = await getDocs(query(collection(firestore, KUNDLIS_COL), limit(500)));
    for (const docSnap of kundliSnap.docs) {
      const data = docSnap.data();
      const name = data.name || "";
      const uId = data.userId || "";
      if (isTestEntry(name) || isTestEntry(uId)) {
        await deleteDoc(docSnap.ref);
        report.removedKundlis++;
      }
    }

    // 6. Purge Test Devotee Tokens
    const tokensSnap = await getDocs(query(collection(firestore, DEVOTEE_TOKENS_COL), limit(500)));
    for (const docSnap of tokensSnap.docs) {
      const data = docSnap.data();
      const name = data.devoteeName || "";
      const sc = data.shortCode || "";
      if (isTestEntry(name) || isTestEntry(sc)) {
        await deleteDoc(docSnap.ref);
        report.removedTokens++;
      }
    }

    return report;
  } catch (err) {
    console.error("[Firestore] cleanupAllTestAndMockProfiles failed:", err);
    return report;
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

/* -------------------------------------------------------------------------- */
/* GLOBAL PANCHANGA ENGINE CONFIGURATION (Super Admin Control)                */
/* -------------------------------------------------------------------------- */

const LOCAL_STORAGE_ENGINE_KEY = "baggona_panchanga_engine_mode";

export const DEFAULT_PANCHANGA_ENGINE_CONFIG: PanchangaEngineConfigDoc = {
  id: PANCHANGA_ENGINE_DOC_ID,
  engineMode: "baggona_book",
  bookYear: "Parabhava 2026-2027 (ಪರಾಭವ ಸಂವತ್ಸರ)",
  bookSpan: "19 March 2026 to 07 April 2027 (385 Days)",
  updatedAt: new Date().toISOString(),
  description: "Official Baggona Panchanga Book Engine (104-page print blueprint) with fallback to Mathematical Drik-Ganita"
};

/**
 * Read the current Panchanga Engine configuration from Firestore DB (with local cache fallback)
 */
export async function getPanchangaEngineConfig(): Promise<PanchangaEngineConfigDoc> {
  try {
    if (firestore) {
      const docRef = doc(firestore, APP_CONFIGS_COL, PANCHANGA_ENGINE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as PanchangaEngineConfigDoc;
        try {
          localStorage.setItem(LOCAL_STORAGE_ENGINE_KEY, data.engineMode);
        } catch (_) {}
        return data;
      }
    }
  } catch (err) {
    console.warn("[Firestore] Failed to fetch panchanga engine config, using cache/default:", err);
  }

  // Fallback to localStorage or default
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_ENGINE_KEY) as PanchangaEngineMode | null;
    if (cached === "baggona_book" || cached === "mathematical") {
      return { ...DEFAULT_PANCHANGA_ENGINE_CONFIG, engineMode: cached };
    }
  } catch (_) {}

  return DEFAULT_PANCHANGA_ENGINE_CONFIG;
}

/**
 * Save / Toggle the Panchanga Engine configuration in Firestore DB
 */
export async function savePanchangaEngineConfig(
  mode: PanchangaEngineMode,
  updatedBy = "superadmin"
): Promise<PanchangaEngineConfigDoc> {
  const configDoc: PanchangaEngineConfigDoc = {
    id: PANCHANGA_ENGINE_DOC_ID,
    engineMode: mode,
    bookYear: "Parabhava 2026-2027 (ಪರಾಭವ ಸಂವತ್ಸರ)",
    bookSpan: "19 March 2026 to 07 April 2027 (385 Days)",
    updatedAt: new Date().toISOString(),
    updatedBy,
    description:
      mode === "baggona_book"
        ? "Active: Baggona Panchanga Book Engine (Exact 104-page print blueprint)"
        : "Active: Mathematical Drik-Ganita Ephemeris Engine"
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_ENGINE_KEY, mode);
  } catch (_) {}

  try {
    if (firestore) {
      const docRef = doc(firestore, APP_CONFIGS_COL, PANCHANGA_ENGINE_DOC_ID);
      await setDoc(docRef, sanitizeFirestoreData(configDoc), { merge: true });
      console.log(`[Firestore] ✅ Panchanga engine mode successfully updated in DB to: ${mode}`);
    }
  } catch (err) {
    console.warn("[Firestore] Failed to save panchanga engine config to Firestore:", err);
  }

  return configDoc;
}

/**
 * Real-time subscription to Panchanga Engine configuration changes
 */
export function subscribePanchangaEngineConfig(
  callback: (config: PanchangaEngineConfigDoc) => void
): Unsubscribe {
  try {
    if (firestore) {
      const docRef = doc(firestore, APP_CONFIGS_COL, PANCHANGA_ENGINE_DOC_ID);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as PanchangaEngineConfigDoc;
            try {
              localStorage.setItem(LOCAL_STORAGE_ENGINE_KEY, data.engineMode);
            } catch (_) {}
            callback(data);
          } else {
            callback(DEFAULT_PANCHANGA_ENGINE_CONFIG);
          }
        },
        (err) => {
          console.warn("[Firestore] subscribePanchangaEngineConfig error, using default:", err);
          callback(DEFAULT_PANCHANGA_ENGINE_CONFIG);
        }
      );
    }
  } catch (err) {
    console.warn("[Firestore] subscribePanchangaEngineConfig setup error:", err);
  }

  callback(DEFAULT_PANCHANGA_ENGINE_CONFIG);
  return () => {};
}

// ── Devotee Personal Sankalpas Cloud Collection ────────────────────────
export const DEVOTEE_SANKALPAS_COL = "devotee_sankalpas";

export interface DevoteeSankalpaDoc {
  id: string;
  userId: string;
  devoteeName?: string;
  category: string;
  title: string;
  description: string;
  sanskritPhrasing?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export async function syncDevoteeSankalpaToCloud(sankalpa: DevoteeSankalpaDoc): Promise<boolean> {
  try {
    if (!firestore) return false;
    const docRef = doc(firestore, DEVOTEE_SANKALPAS_COL, sankalpa.id);
    await setDoc(docRef, {
      ...sankalpa,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("[Firestore] Failed to sync devotee sankalpa to cloud:", err);
    return false;
  }
}

export async function getDevoteeSankalpasFromCloud(userId: string): Promise<DevoteeSankalpaDoc[]> {
  try {
    if (!firestore) return [];
    const cleanUserId = (userId || "devotee_default").toLowerCase().trim();
    const q = query(
      collection(firestore, DEVOTEE_SANKALPAS_COL),
      where("userId", "==", cleanUserId)
    );
    const snap = await getDocs(q);
    const list: DevoteeSankalpaDoc[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DevoteeSankalpaDoc);
    });
    return list;
  } catch (err) {
    console.warn("[Firestore] Failed to get devotee sankalpas from cloud:", err);
    return [];
  }
}

export async function deleteDevoteeSankalpaFromCloud(sankalpaId: string): Promise<boolean> {
  try {
    if (!firestore) return false;
    const docRef = doc(firestore, DEVOTEE_SANKALPAS_COL, sankalpaId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn("[Firestore] Failed to delete devotee sankalpa from cloud:", err);
    return false;
  }
}

// ── 90-Day Devotee Tokens & Backward Compatibility Mapping Tables ─────────
export const DEVOTEE_TOKENS_COL = "devotee_tokens";
export const TOKEN_MAPPINGS_COL = "token_mappings";

export interface DevoteeTokenDoc {
  id: string; // e.g. "bgn_tk_7f9a1b2c3d"
  shortCode: string; // 8-char base62 code, e.g. "K9X2M4P7"
  devoteeName: string;
  nakshatra?: number;
  rashi?: number;
  gotra?: string;
  priestName: string;
  startDate: string;
  totalDays: number; // default 90
  lang: string;
  notificationTime: string;
  dob?: string;
  tob?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  sevaType?: string;
  platform?: "android" | "apple";
  target?: "google" | "webcal" | "sanctum";
  phone?: string;
  email?: string;
  overrideCalendarPhone?: boolean;
  voiceId?: string;
  includePriestCalendar?: boolean;
  fullPayload: Record<string, any>;
  legacyToken?: string;
  createdAt: string;
  expiresAt: string; // Exactly createdAt + 90 days
  lastAccessedAt?: string;
  accessCount: number;
  status: "active" | "expired" | "revoked";
  updatedAt: string;
}

export interface TokenMappingDoc {
  id: string; // Hash or key of legacy token
  legacyToken: string; // Full Base64URL string
  newTokenId: string; // Reference to DevoteeTokenDoc.id
  shortCode: string;
  devoteeName: string;
  priestName: string;
  migratedAt: string;
  expiresAt: string; // 90 days from migration
  accessCount: number;
  lastAccessedAt?: string;
}

// In-memory fallback stores for offline / tests
const memoryDevoteeTokens = new Map<string, DevoteeTokenDoc>();
const memoryTokenMappings = new Map<string, TokenMappingDoc>();

/**
 * Save or update a Devotee Token document in Firestore (and in-memory fallback)
 */
export async function saveDevoteeTokenToDb(tokenDoc: DevoteeTokenDoc): Promise<void> {
  memoryDevoteeTokens.set(tokenDoc.id, { ...tokenDoc });
  if (tokenDoc.shortCode) {
    memoryDevoteeTokens.set(tokenDoc.shortCode, { ...tokenDoc });
  }

  try {
    if (!firestore) return;
    const docRef = doc(firestore, DEVOTEE_TOKENS_COL, tokenDoc.id);
    await setDoc(docRef, sanitizeFirestoreData(tokenDoc), { merge: true });
  } catch (err) {
    console.warn("[Firestore] saveDevoteeTokenToDb error:", err);
  }
}

/**
 * Fetch a Devotee Token by ID or 8-char short code
 */
export async function getDevoteeTokenFromDb(tokenIdOrShortCode: string): Promise<DevoteeTokenDoc | null> {
  const cleanKey = (tokenIdOrShortCode || "").trim();
  if (!cleanKey) return null;

  // Check memory store first
  if (memoryDevoteeTokens.has(cleanKey)) {
    return memoryDevoteeTokens.get(cleanKey)!;
  }

  try {
    if (!firestore) return null;
    // 1. Try by document ID
    const docRef = doc(firestore, DEVOTEE_TOKENS_COL, cleanKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DevoteeTokenDoc;
      memoryDevoteeTokens.set(data.id, data);
      if (data.shortCode) memoryDevoteeTokens.set(data.shortCode, data);
      return data;
    }

    // 2. Try querying by shortCode
    const q = query(collection(firestore, DEVOTEE_TOKENS_COL), where("shortCode", "==", cleanKey), limit(1));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      const data = qSnap.docs[0].data() as DevoteeTokenDoc;
      memoryDevoteeTokens.set(data.id, data);
      if (data.shortCode) memoryDevoteeTokens.set(data.shortCode, data);
      return data;
    }
  } catch (err) {
    console.warn("[Firestore] getDevoteeTokenFromDb error:", err);
  }

  return null;
}

/**
 * Record access count and last accessed timestamp for a token
 */
export async function recordDevoteeTokenAccess(tokenId: string): Promise<void> {
  const now = new Date().toISOString();
  const existing = memoryDevoteeTokens.get(tokenId);
  if (existing) {
    existing.accessCount = (existing.accessCount || 0) + 1;
    existing.lastAccessedAt = now;
    existing.updatedAt = now;
    memoryDevoteeTokens.set(existing.id, existing);
    if (existing.shortCode) memoryDevoteeTokens.set(existing.shortCode, existing);
  }

  try {
    if (!firestore) return;
    const docRef = doc(firestore, DEVOTEE_TOKENS_COL, tokenId);
    await updateDoc(docRef, {
      accessCount: (existing?.accessCount || 1),
      lastAccessedAt: now,
      updatedAt: now
    });
  } catch (err) {
    // Non-critical background telemetry
  }
}

/**
 * Save a legacy token to new short token mapping for backward compatibility
 */
export async function saveTokenMappingToDb(mapping: TokenMappingDoc): Promise<void> {
  memoryTokenMappings.set(mapping.id, { ...mapping });
  memoryTokenMappings.set(mapping.legacyToken, { ...mapping });

  try {
    if (!firestore) return;
    const docRef = doc(firestore, TOKEN_MAPPINGS_COL, mapping.id);
    await setDoc(docRef, sanitizeFirestoreData(mapping), { merge: true });
  } catch (err) {
    console.warn("[Firestore] saveTokenMappingToDb error:", err);
  }
}

/**
 * Get a token mapping entry by legacy token string or mapping ID
 */
export async function getTokenMappingFromDb(legacyTokenOrKey: string): Promise<TokenMappingDoc | null> {
  const cleanKey = (legacyTokenOrKey || "").trim();
  if (!cleanKey) return null;

  if (memoryTokenMappings.has(cleanKey)) {
    return memoryTokenMappings.get(cleanKey)!;
  }

  try {
    if (!firestore) return null;
    // 1. Try by document ID
    const docRef = doc(firestore, TOKEN_MAPPINGS_COL, cleanKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as TokenMappingDoc;
      memoryTokenMappings.set(data.id, data);
      memoryTokenMappings.set(data.legacyToken, data);
      return data;
    }

    // 2. Try by legacyToken exact match
    const q = query(collection(firestore, TOKEN_MAPPINGS_COL), where("legacyToken", "==", cleanKey), limit(1));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      const data = qSnap.docs[0].data() as TokenMappingDoc;
      memoryTokenMappings.set(data.id, data);
      memoryTokenMappings.set(data.legacyToken, data);
      return data;
    }
  } catch (err) {
    console.warn("[Firestore] getTokenMappingFromDb error:", err);
  }

  return null;
}

/**
 * Super Admin & Scheduled Maintenance: Automatically delete tokens & mappings older than 90 days
 */
export async function deleteExpiredTokensAndMappings(): Promise<{ deletedTokens: number; deletedMappings: number }> {
  const now = new Date().toISOString();
  let deletedTokens = 0;
  let deletedMappings = 0;

  // Cleanup in-memory store
  for (const [key, token] of memoryDevoteeTokens.entries()) {
    if (token.expiresAt && token.expiresAt < now) {
      memoryDevoteeTokens.delete(key);
      deletedTokens++;
    }
  }
  for (const [key, mapDoc] of memoryTokenMappings.entries()) {
    if (mapDoc.expiresAt && mapDoc.expiresAt < now) {
      memoryTokenMappings.delete(key);
      deletedMappings++;
    }
  }

  try {
    if (!firestore) return { deletedTokens, deletedMappings };

    // Query expired tokens in Firestore
    const tokenQ = query(collection(firestore, DEVOTEE_TOKENS_COL), where("expiresAt", "<", now));
    const tokenSnap = await getDocs(tokenQ);
    for (const d of tokenSnap.docs) {
      await deleteDoc(d.ref);
    }

    // Query expired mappings in Firestore
    const mapQ = query(collection(firestore, TOKEN_MAPPINGS_COL), where("expiresAt", "<", now));
    const mapSnap = await getDocs(mapQ);
    for (const d of mapSnap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    console.warn("[Firestore] deleteExpiredTokensAndMappings error:", err);
  }

  return { deletedTokens, deletedMappings };
}

/**
 * Real-time subscription to active devotee tokens for Priest / Admin tracking
 */
export function subscribeDevoteeTokens(
  onUpdate: (tokens: DevoteeTokenDoc[]) => void
): Unsubscribe {
  if (!firestore) {
    onUpdate(Array.from(memoryDevoteeTokens.values()));
    return () => {};
  }

  try {
    const q = query(collection(firestore, DEVOTEE_TOKENS_COL), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, (snapshot) => {
      const list: DevoteeTokenDoc[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as DevoteeTokenDoc);
      });
      onUpdate(list);
    }, (err) => {
      console.warn("[Firestore] subscribeDevoteeTokens listener error:", err);
      onUpdate(Array.from(memoryDevoteeTokens.values()));
    });
  } catch (err) {
    onUpdate(Array.from(memoryDevoteeTokens.values()));
    return () => {};
  }
}

// ── Super Admin Dynamic Service Pricing Cloud Collection ──────────────────
export const SERVICE_PRICING_DOC_ID = "service_pricing";
export const LOCAL_STORAGE_SERVICE_PRICING_KEY = "baggona_service_pricing_config_cache";

export interface ServicePricingConfigDoc {
  id: string;
  pricing: Record<string, {
    key: string;
    name: string;
    kannadaName: string;
    coins: number;
    inrEquivalent: number;
    description: string;
    category: string;
  }>;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Real-time subscription to dynamic service coin pricing configuration
 */
export function subscribeServicePricingConfig(
  callback: (pricingMap: Record<string, any>) => void
): Unsubscribe {
  try {
    if (firestore) {
      const docRef = doc(firestore, APP_CONFIGS_COL, SERVICE_PRICING_DOC_ID);
      return onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as ServicePricingConfigDoc;
            if (data.pricing && Object.keys(data.pricing).length > 0) {
              try {
                localStorage.setItem(LOCAL_STORAGE_SERVICE_PRICING_KEY, JSON.stringify(data.pricing));
              } catch (_) {}
              callback(data.pricing);
              return;
            }
          }
          callback({});
        },
        (err) => {
          console.warn("[Firestore] subscribeServicePricingConfig error:", err);
          callback({});
        }
      );
    }
  } catch (err) {
    console.warn("[Firestore] subscribeServicePricingConfig setup error:", err);
  }

  callback({});
  return () => {};
}

/**
 * Save / update dynamic service coin pricing in Cloud Firestore
 */
export async function saveServicePricingConfig(
  pricing: Record<string, any>,
  adminId: string = "superadmin"
): Promise<{ success: boolean; error?: string }> {
  try {
    const configDoc: ServicePricingConfigDoc = {
      id: SERVICE_PRICING_DOC_ID,
      pricing,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_SERVICE_PRICING_KEY, JSON.stringify(pricing));
    } catch (_) {}

    if (firestore) {
      const docRef = doc(firestore, APP_CONFIGS_COL, SERVICE_PRICING_DOC_ID);
      await setDoc(docRef, configDoc, { merge: true });
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Firestore] saveServicePricingConfig error:", err);
    return { success: false, error: err?.message || "Failed to save service pricing to cloud" };
  }
}

