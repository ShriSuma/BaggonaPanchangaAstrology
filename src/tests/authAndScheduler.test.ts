import { describe, it, expect, beforeEach } from "vitest";
import { hashPassword, useAuthStore } from "../features/auth/authStore";
import { getMsUntil11PMIST, sendDailyReportEmail, REPORT_EMAIL_RECIPIENT } from "../features/reports/dailyScheduler";
import { db, recordDailyHit, getDailyHitsCount } from "../db/indexedDb";

describe("Authentication Store & Password Hashing", () => {
  beforeEach(async () => {
    await db.users.clear();
    useAuthStore.setState({ isAuthenticated: false, currentUser: null, isLoading: false });
  });

  it("hashes password accurately using SHA-256", async () => {
    const hash = await hashPassword("jayashree123007");
    expect(hash).toBeTypeOf("string");
    expect(hash.length).toBe(64); // SHA-256 hex string length
  });

  it("seeds default user and logs in with valid credentials", async () => {
    const res = await useAuthStore.getState().login("baggona", "jayashree123007");
    expect(res.success).toBe(true);
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

  it("calculates time remaining until 11 PM IST", () => {
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
});
