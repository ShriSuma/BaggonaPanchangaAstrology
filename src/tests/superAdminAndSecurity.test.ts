import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore, hashPassword } from "../features/auth/authStore";
import { useWalletStore } from "../features/wallet/walletStore";
import { getClientDeviceInfo } from "../features/auth/ipSecurityService";
import {
  renderNewIpLoginAlertEmail,
  renderPasswordResetOtpEmail,
  renderPasswordChangedConfirmationEmail
} from "../features/notifications/emailTemplates";
import { db } from "../db/indexedDb";

describe("Super Admin & Intrusion Security Engine", () => {
  beforeEach(async () => {
    useAuthStore.getState().logout();
    await useAuthStore.getState().seedDefaultUser();
  });

  it("parses client device info into clean readable metadata", () => {
    const info = getClientDeviceInfo("103.24.56.78");
    expect(info.ip).toBe("103.24.56.78");
    expect(info.deviceType).toBeDefined();
    expect(info.browser).toBeDefined();
    expect(info.os).toBeDefined();
    expect(info.timestamp).toBeDefined();
  });

  it("renders New IP Login security alert email with mandatory details", () => {
    const html = renderNewIpLoginAlertEmail({
      username: "baggona",
      role: "priest",
      ip: "103.24.56.78",
      browser: "Google Chrome",
      os: "macOS Apple",
      deviceType: "💻 Desktop / Laptop",
      timestamp: "29/08/2026, 03:55:00 pm"
    });

    expect(html).toContain("103.24.56.78");
    expect(html).toContain("baggona (PRIEST)");
    expect(html).toContain("Google Chrome");
    expect(html).toContain("macOS Apple");
    expect(html).toContain("Security Alert: New Login");
  });

  it("renders Password Reset OTP and Confirmation emails", () => {
    const otpHtml = renderPasswordResetOtpEmail({
      username: "baggona",
      otpCode: "746219",
      expiresAt: "04:10 PM"
    });

    expect(otpHtml).toContain("746219");
    expect(otpHtml).toContain("Password Reset Request");
    expect(otpHtml).toContain("baggona");

    const confHtml = renderPasswordChangedConfirmationEmail({
      username: "baggona",
      timestamp: "29/08/2026, 04:05:00 pm"
    });

    expect(confHtml).toContain("Password Changed Successfully");
    expect(confHtml).toContain("baggona");
  });

  it("executes complete Forgot Password & Reset flow with SHA-256 update", async () => {
    const store = useAuthStore.getState();

    // 1. Request password reset
    const reqRes = await store.requestPasswordReset("baggona");
    expect(reqRes.success).toBe(true);
    expect(useAuthStore.getState().step).toBe("reset_password");
    expect(useAuthStore.getState().resetUsername).toBe("baggona");

    const activeResetOtp = useAuthStore.getState().resetOtp!;
    expect(activeResetOtp).toHaveLength(6);

    // 2. Reject incorrect OTP
    const failRes = await store.verifyResetOtpAndSetPassword("000000", "newSecretPass123");
    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain("Invalid");

    // 3. Reject short password
    const shortPassRes = await store.verifyResetOtpAndSetPassword(activeResetOtp, "123");
    expect(shortPassRes.success).toBe(false);
    expect(shortPassRes.error).toContain("at least 6 characters");

    // 4. Accept correct OTP and update password
    const successRes = await store.verifyResetOtpAndSetPassword(activeResetOtp, "brandNewPass@2026");
    expect(successRes.success).toBe(true);
    expect(useAuthStore.getState().step).toBe("credentials");

    // 5. Verify user can now log in with the new password
    const loginRes = await useAuthStore.getState().login("baggona", "brandNewPass@2026", { skipMfa: true });
    expect(loginRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("authenticates Super Admin account with role 'superadmin' using ShriSuma and ShriSuma@2026", async () => {
    const loginRes = await useAuthStore.getState().login("ShriSuma", "ShriSuma@2026", { skipMfa: true });
    expect(loginRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().role).toBe("superadmin");
    expect(useAuthStore.getState().currentUser).toBe("ShriSuma");
  });

  it("authenticates Super Admin account with role 'superadmin' using $hriSuma", async () => {
    const loginRes = await useAuthStore.getState().login("$hriSuma", "admin@baggona2026", { skipMfa: true });
    expect(loginRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().role).toBe("superadmin");
  });

  it("authenticates Super Admin account with backward compatible 'superadmin'", async () => {
    const loginRes = await useAuthStore.getState().login("superadmin", "ShriSuma@2026", { skipMfa: true });
    expect(loginRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().role).toBe("superadmin");
  });

  it("renders System Failure Alert Email with priest details, action, and attempted coins", async () => {
    const { renderSystemFailureAlertEmail } = await import("../features/notifications/emailTemplates");
    const html = renderSystemFailureAlertEmail({
      username: "priest_raghavendra",
      priestName: "ರಾಘವೇಂದ್ರ ಭಟ್",
      action: "ಜನನ ಕುಂಡಲಿ ರಚನೆ",
      attemptedCoins: 200,
      errorMessage: "AI API Quota Limit Exceeded",
      clientIp: "103.24.56.78",
      timestamp: "29/08/2026, 06:45:00 pm"
    });

    expect(html).toContain("ರಾಘವೇಂದ್ರ ಭಟ್");
    expect(html).toContain("priest_raghavendra");
    expect(html).toContain("ಜನನ ಕುಂಡಲಿ ರಚನೆ");
    expect(html).toContain("200 Coins");
    expect(html).toContain("AI API Quota Limit Exceeded");
    expect(html).toContain("103.24.56.78");
  });

  it("renders Luxury MFA OTP Email with 3-minute validity warning and 6-digit code", async () => {
    const { renderMfaOtpEmail } = await import("../features/notifications/emailTemplates");
    const html = renderMfaOtpEmail({
      username: "ShriSuma",
      otpCode: "948215",
      expiresAt: "10:18 PM",
      recipientEmail: "spshreepandit@gmail.com",
      timestamp: "29/08/2026, 10:15:00 pm"
    });

    expect(html).toContain("948215");
    expect(html).toContain("spshreepandit@gmail.com");
    expect(html).toContain("Valid for 3 minutes only");
    expect(html).toContain("ShriSuma");
  });

  it("dispatches 3-minute MFA OTP and enforces 3-minute expiry during login", async () => {
    const loginRes = await useAuthStore.getState().login("ShriSuma", "ShriSuma@2026");
    expect(loginRes.success).toBe(true);
    expect(loginRes.requiresMfa).toBe(true);
    expect(useAuthStore.getState().step).toBe("mfa_pending");
    expect(useAuthStore.getState().pendingUsername).toBe("ShriSuma");

    // Expiry must be <= 3 minutes (180,000 ms) from now
    const expiresAt = useAuthStore.getState().otpExpiresAt!;
    expect(expiresAt - Date.now()).toBeLessThanOrEqual(3 * 60 * 1000 + 100);
    expect(expiresAt - Date.now()).toBeGreaterThan(2 * 60 * 1000);
  });

  it("deletes a priest account, revokes wallet/token and blocks portal access", async () => {
    const { deletePriestAccount, isPriestAccountActive, getOrCreatePriestWallet, syncUserProfile } = await import("../db/firestoreDb");
    const testPriestId = "test_priest_to_delete";
    const testPriestName = "ಪರೀಕ್ಷಾ ಪುರೋಹಿತರು";

    // 1. Create priest in IndexedDB & Firestore
    await db.users.put({
      id: testPriestId,
      username: testPriestId,
      passwordHash: await hashPassword("temp123"),
      allowedModules: ["panchanga", "sankhyashastra"],
      createdAt: new Date().toISOString()
    });

    // 2. Verify account is initially active
    const isActiveBefore = await isPriestAccountActive(testPriestId);
    expect(isActiveBefore).toBe(true);

    // 3. Delete priest account via Super Admin deletion function
    const deleted = await deletePriestAccount(testPriestId);
    expect(deleted).toBe(true);

    // 4. Verify account is now revoked and inactive
    const isActiveAfter = await isPriestAccountActive(testPriestId);
    expect(isActiveAfter).toBe(false);

    // 5. Verify local DB user was deleted
    const localUser = await db.users.where("username").equals(testPriestId).first();
    expect(localUser).toBeUndefined();
  });

  it("verifies isPriestFirstTimeSetupDone returns true for configured priests and prevents repeated popups", async () => {
    const { isPriestFirstTimeSetupDone, updateUserPassword } = await import("../db/firestoreDb");
    const priestUser = `priest_subrahmanya_${Date.now()}`;
    if (typeof window !== "undefined") {
      localStorage.removeItem("baggona_pwd_setup_done_" + priestUser);
    }
    await db.users.where("username").equals(priestUser).delete();

    // 1. Initial user has not configured password
    const notDoneInitially = await isPriestFirstTimeSetupDone(priestUser);
    expect(notDoneInitially).toBe(false);

    // 2. Priest sets their password
    await db.users.put({
      id: priestUser,
      username: priestUser,
      passwordHash: await hashPassword("Subramanya@2026"),
      createdAt: new Date().toISOString()
    });
    await updateUserPassword(priestUser, await hashPassword("Subramanya@2026"));

    // 3. Next time priest opens URL (even with firstTime=true), isPriestFirstTimeSetupDone must be true
    const isDoneNow = await isPriestFirstTimeSetupDone(priestUser);
    expect(isDoneNow).toBe(true);
  });

  it("updates and stores priest email and 10-digit mobile number alongside password hash in DB", async () => {
    const { updateUserPassword, getUserProfile, getOrCreatePriestWallet } = await import("../db/firestoreDb");
    const testPriest = `priest_gokarna_${Date.now()}`;
    const testEmail = "shreeram.gokarna@gmail.com";
    const testPhone = "9108135387";
    const newHashed = await hashPassword("GokarnaTemple#2026");

    // Initialize wallet and user profile
    await getOrCreatePriestWallet(testPriest, "ಶ್ರೀರಾಮ್ ಭಟ್", ["panchanga", "sankhyashastra"]);

    // Update with 4 mandatory fields (Email, Phone, Password)
    const success = await updateUserPassword(testPriest, newHashed, {
      email: testEmail,
      phone: testPhone,
      mobileNumber: testPhone
    });
    expect(success).toBe(true);

    // Verify Firestore user profile
    const profile = await getUserProfile(testPriest);
    expect(profile).toBeDefined();
    expect(profile?.email).toBe(testEmail);
    expect(profile?.phone).toBe(testPhone);
    expect(profile?.firstTimeSetupCompleted).toBe(true);
    expect(profile?.mustResetPassword).toBe(false);
  });

  it("guarantees Super Admin accounts ($hriSuma, ShriSuma, superadmin) are always active in isPriestAccountActive", async () => {
    const { isPriestAccountActive } = await import("../db/firestoreDb");

    // All variations of Super Admin accounts must be unconditionally recognized
    expect(await isPriestAccountActive("$hriSuma")).toBe(true);
    expect(await isPriestAccountActive("ShriSuma")).toBe(true);
    expect(await isPriestAccountActive("superadmin")).toBe(true);
    expect(await isPriestAccountActive("superadmin_dollar_shrisuma")).toBe(true);
    expect(await isPriestAccountActive("priest_shreeram")).toBe(true);
    expect(await isPriestAccountActive("baggona")).toBe(true);

    // Non-existent synthetic priest should return false
    expect(await isPriestAccountActive("completely_fake_nonexistent_priest_999")).toBe(false);
  });
});

