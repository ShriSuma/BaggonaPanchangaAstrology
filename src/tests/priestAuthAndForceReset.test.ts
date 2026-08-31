import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore, hashPassword } from "../features/auth/authStore";
import { syncUserProfile, getUserProfile, isPriestFirstTimeSetupDone } from "../db/firestoreDb";
import { db } from "../db/indexedDb";

describe("Priest Authentication & First-Time Force Password Setup Engine", () => {
  beforeEach(async () => {
    useAuthStore.getState().logout();
    await useAuthStore.getState().seedDefaultUser();
    localStorage.clear();
  });

  it("handles remote priest lookup, first-time login with Baggona123, force reset, and subsequent login", async () => {
    const priestUsername = "sankhya_test_priest";
    const initialPassword = "Baggona123";
    const newPermanentPassword = "MySecureSankhya@2026";
    const initialHash = await hashPassword(initialPassword);

    // 1. Simulate SuperAdmin creating Priest in Firestore Users collection
    await syncUserProfile({
      id: priestUsername,
      username: priestUsername,
      name: "Sankhya Shastra Priest",
      role: "priest",
      passwordHash: initialHash,
      mustResetPassword: true,
      firstTimeSetupCompleted: false,
      allowedModules: ["sankhyashastra", "panchanga"],
      createdAt: new Date().toISOString()
    });

    // Ensure user is NOT in local IndexedDB (simulating priest opening link on a new phone/browser)
    await db.users.where("username").equals(priestUsername).delete();

    // 2. First-time login attempt with initial default password (case-insensitive)
    const loginRes = await useAuthStore.getState().login(priestUsername, "Baggona123");
    expect(loginRes.success).toBe(true);
    expect(loginRes.requiresPasswordChange).toBe(true);
    expect(useAuthStore.getState().step).toBe("force_reset_password");
    expect(useAuthStore.getState().pendingUsername).toBe(priestUsername);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // 3. Complete first-time password setup with new permanent password
    const setupRes = await useAuthStore.getState().completeFirstTimePasswordSetup(newPermanentPassword);
    expect(setupRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser).toBe(priestUsername);
    expect(useAuthStore.getState().step).toBe("credentials");

    // 4. Verify password update in Firestore
    const updatedProfile = await getUserProfile(priestUsername);
    expect(updatedProfile).toBeDefined();
    const newHash = await hashPassword(newPermanentPassword);
    expect(updatedProfile?.passwordHash).toBe(newHash);
    expect(updatedProfile?.firstTimeSetupCompleted).toBe(true);
    expect(updatedProfile?.mustResetPassword).toBe(false);

    // 5. Logout and log in again with new permanent password
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    const secondLoginRes = await useAuthStore.getState().login(priestUsername, newPermanentPassword);
    expect(secondLoginRes.success).toBe(true);
    expect(secondLoginRes.requiresPasswordChange).toBeUndefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser).toBe(priestUsername);
  });

  it("handles case-insensitive initial password baggona123 vs Baggona123", async () => {
    const priestUsername = "gokul_priest";
    const initialHash = await hashPassword("baggona123");

    await syncUserProfile({
      id: priestUsername,
      username: priestUsername,
      name: "Gokul Shastri",
      role: "priest",
      passwordHash: initialHash,
      mustResetPassword: true,
      firstTimeSetupCompleted: false,
      allowedModules: ["panchanga"],
      createdAt: new Date().toISOString()
    });

    await db.users.where("username").equals(priestUsername).delete();

    // Login with uppercase B
    const res = await useAuthStore.getState().login(priestUsername, "Baggona123");
    expect(res.success).toBe(true);
    expect(res.requiresPasswordChange).toBe(true);
    expect(useAuthStore.getState().step).toBe("force_reset_password");
  });

  it("allows password reset request for remote Firestore users", async () => {
    const priestUsername = "remote_priest_reset";
    await syncUserProfile({
      id: priestUsername,
      username: priestUsername,
      name: "Remote Priest",
      role: "priest",
      passwordHash: await hashPassword("baggona123"),
      mustResetPassword: false,
      firstTimeSetupCompleted: true,
      allowedModules: ["panchanga"],
      createdAt: new Date().toISOString()
    });

    await db.users.where("username").equals(priestUsername).delete();

    const resetReq = await useAuthStore.getState().requestPasswordReset(priestUsername);
    expect(resetReq.success).toBe(true);
    expect(useAuthStore.getState().step).toBe("reset_password");
    expect(useAuthStore.getState().resetUsername).toBe(priestUsername);
  });
});
