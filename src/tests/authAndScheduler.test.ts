import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, useAuthStore } from "../features/auth/authStore";
import { HARDCODED_MFA_EMAIL } from "../features/auth/mfaEmailService";
import { getMsUntil11PMIST, sendDailyReportEmail, REPORT_EMAIL_RECIPIENT } from "../features/reports/dailyScheduler";
import { db, recordDailyHit, getDailyHitsCount } from "../db/indexedDb";

describe("Authentication Store & Multi-Factor Authentication (MFA)", () => {
  beforeEach(async () => {
    await db.users.clear();
    useAuthStore.setState({
      isAuthenticated: false,
      currentUser: null,
      isLoading: false,
      step: "credentials",
      pendingUsername: null,
      pendingUserId: null,
      activeOtp: null,
      otpExpiresAt: null
    });
  });

  it("hashes password accurately using SHA-256", async () => {
    const hash = await hashPassword("jayashree123007");
    expect(hash).toBeTypeOf("string");
    expect(hash.length).toBe(64); // SHA-256 hex string length
  });

  it("seeds default user and logs in directly when skipMfa is enabled", async () => {
    const res = await useAuthStore.getState().login("baggona", "jayashree123007", { skipMfa: true });
    expect(res.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser).toBe("baggona");
  });

  it("triggers 2-step MFA flow and dispatches 6-digit OTP to spshreepandit@gmail.com", async () => {
    const store = useAuthStore.getState();
    const res = await store.login("baggona", "jayashree123007");
    expect(res.success).toBe(true);
    expect(res.requiresMfa).toBe(true);
    expect(useAuthStore.getState().step).toBe("mfa_pending");
    expect(useAuthStore.getState().mfaEmail).toBe(HARDCODED_MFA_EMAIL);

    const generatedOtp = useAuthStore.getState().activeOtp;
    expect(generatedOtp).toBeDefined();
    expect(generatedOtp).toMatch(/^\d{6}$/);

    // Verify invalid OTP code rejection
    const invalidRes = await useAuthStore.getState().verifyMfaOtp("000000");
    expect(invalidRes.success).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // Verify valid OTP code acceptance
    const validRes = await useAuthStore.getState().verifyMfaOtp(generatedOtp!);
    expect(validRes.success).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser).toBe("baggona");
  });

  it("rejects login with invalid password", async () => {
    const res = await useAuthStore.getState().login("baggona", "wrongpassword");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/invalid/i);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe("Daily Hits & 11 PM IST Report Scheduler", () => {
  beforeEach(async () => {
    await db.dailyHits.clear();
  });

  it("increments daily Kundli generation hit count", async () => {
    const count1 = await recordDailyHit();
    expect(count1).toBe(1);

    const count2 = await recordDailyHit();
    expect(count2).toBe(2);

    const total = await getDailyHitsCount();
    expect(total).toBe(2);
  });

  it("calculates time remaining until 11:30 PM IST", () => {
    const ms = getMsUntil11PMIST();
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it("prepares and sends daily summary report email", async () => {
    await recordDailyHit();
    await recordDailyHit();

    const report = await sendDailyReportEmail();
    expect(report.success).toBe(true);
    expect(report.count).toBe(2);
    expect(report.email).toBe(REPORT_EMAIL_RECIPIENT);
  });

  it("verifies quota guard reserves 6 slots for 4 daily summary reports + alerts out of 100 total", async () => {
    const {
      DAILY_EMAIL_LIMIT,
      RESERVED_REPORT_EMAILS,
      SAFE_TRANSACTIONAL_LIMIT,
      sendAllFourDailyReports
    } = await import("../features/notifications/notificationService");

    expect(DAILY_EMAIL_LIMIT).toBe(100);
    expect(RESERVED_REPORT_EMAILS).toBe(6);
    expect(SAFE_TRANSACTIONAL_LIMIT).toBe(94);

    // Verify all 4 daily summary reports dispatch cleanly
    const res = await sendAllFourDailyReports();
    expect(res.success).toBe(true);
  });

  it("verifies Super Admin credentials and updates password securely with SHA-256", async () => {
    await useAuthStore.getState().seedDefaultUser();

    // Verify default superadmin user
    const superAdmin = await db.users.where("username").equals("superadmin").first();
    expect(superAdmin).toBeDefined();

    // Hash new password and update
    const newSecretPassword = "MySecretAdminPass#2026";
    const newHash = await hashPassword(newSecretPassword);
    await db.users.update(superAdmin!.id, { passwordHash: newHash });

    const updatedUser = await db.users.where("username").equals("superadmin").first();
    expect(updatedUser?.passwordHash).toBe(newHash);
  });
});
