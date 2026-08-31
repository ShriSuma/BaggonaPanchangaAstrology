import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTodayAiQuotaUsage,
  recordAiCallUsage,
  updateDailyAiQuotaLimit,
  resetTodayAiQuotaUsageForTest,
  DEFAULT_DAILY_AI_LIMIT
} from "../features/ai/aiTelemetryService";
import { renderLowAiQuotaAlertEmail } from "../features/notifications/emailTemplates";

describe("AI Telemetry & Super Admin Quota Sentinel", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    await resetTodayAiQuotaUsageForTest();
  });

  it("initializes today's quota with default limit and zero usage", async () => {
    const quota = await getTodayAiQuotaUsage();
    expect(quota.totalCallsToday).toBe(0);
    expect(quota.dailyLimit).toBe(DEFAULT_DAILY_AI_LIMIT);
    expect(quota.remainingCalls).toBe(DEFAULT_DAILY_AI_LIMIT);
    expect(quota.featureBreakdown).toBeDefined();
  });

  it("records AI calls per feature module and updates remaining balance accurately", async () => {
    await recordAiCallUsage({ feature: "prashna", model: "gemini-3.5-flash-lite" });
    await recordAiCallUsage({ feature: "bhavishya", model: "gemini-3.5-flash-lite" });
    await recordAiCallUsage({ feature: "bhavishya", model: "gemini-3.5-flash-lite" });
    await recordAiCallUsage({ feature: "diksuchi", model: "gemini-3.5-flash-lite" });

    const quota = await getTodayAiQuotaUsage();
    expect(quota.totalCallsToday).toBe(4);
    expect(quota.featureBreakdown.prashna).toBe(1);
    expect(quota.featureBreakdown.bhavishya).toBe(2);
    expect(quota.featureBreakdown.diksuchi).toBe(1);
    expect(quota.remainingCalls).toBe(quota.dailyLimit - 4);
  });

  it("allows updating daily quota limit and recalculates remaining calls", async () => {
    await updateDailyAiQuotaLimit(3000);
    const quota = await getTodayAiQuotaUsage();
    expect(quota.dailyLimit).toBe(3000);
    expect(quota.remainingCalls).toBe(3000 - quota.totalCallsToday);
  });

  it("renders rich Low AI Quota Alert email with Kannada heading and module breakdown", () => {
    const emailHtml = renderLowAiQuotaAlertEmail({
      remaining: 95,
      totalToday: 1405,
      dailyLimit: 1500,
      timestamp: "30/08/2026, 07:00:00 pm",
      featureBreakdown: {
        prashna: 600,
        bhavishya: 500,
        diksuchi: 200,
        purvaJanma: 105
      }
    });

    expect(emailHtml).toContain("AI ಕೋಟಾ ಎಚ್ಚರಿಕೆ");
    expect(emailHtml).toContain("Last 95 AI Requests Remaining Today");
    expect(emailHtml).toContain("95 / 1500");
    expect(emailHtml).toContain("1405 Calls");
    expect(emailHtml).toContain("prashna");
    expect(emailHtml).toContain("600 calls");
    expect(emailHtml).toContain("Baggona Panchanga AI Quota Sentinel");
  });
});
