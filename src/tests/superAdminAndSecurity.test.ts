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
});
