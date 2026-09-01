import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSarvamQuotaTelemetry,
  recordSarvamAudioUsage,
  updateSarvamTotalQuota,
  DEFAULT_SARVAM_TOTAL_QUOTA
} from "../features/audio/sarvamQuotaService";
import {
  recordCalendarVisit
} from "../features/seva/calendarVisitService";
import {
  isTestEnvironment,
  isMockDevotee
} from "../utils/testEnvGuard";
import { renderSarvamCriticalQuotaEmail } from "../features/notifications/emailTemplates";

describe("Sarvam AI Voice Quota & Telemetry Sentinel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getSarvamQuotaTelemetry returns default healthy quota if empty", async () => {
    const telemetry = await getSarvamQuotaTelemetry();
    expect(telemetry.totalQuota).toBe(DEFAULT_SARVAM_TOTAL_QUOTA);
    expect(telemetry.consumed).toBe(0);
    expect(telemetry.remaining).toBe(DEFAULT_SARVAM_TOTAL_QUOTA);
    expect(telemetry.remainingPercentage).toBe(100);
    expect(telemetry.status).toBe("healthy");
  });

  it("recordSarvamAudioUsage increments character count and updates remaining percentage", async () => {
    const updated = await recordSarvamAudioUsage(50000, "ಶ್ರೀ ಗಾಯತ್ರಿ ಮಂತ್ರ ಪಠಣ");
    expect(updated.consumed).toBe(50000);
    expect(updated.remaining).toBe(450000);
    expect(updated.remainingPercentage).toBe(90);
    expect(updated.totalCalls).toBe(1);
    expect(updated.status).toBe("healthy");
  });

  it("classifies status as warning when remaining quota is between 10% and 25%", async () => {
    // Consume 400k of 500k -> 20% remaining
    const updated = await recordSarvamAudioUsage(400000, "ದೀರ್ಘ ಪೂಜಾ ಸಂಕಲ್ಪ");
    expect(updated.remainingPercentage).toBe(20);
    expect(updated.status).toBe("warning");
  });

  it("classifies status as critical and triggers alert state when remaining quota <= 10%", async () => {
    // Consume 460k of 500k -> 8% remaining (below 10% critical threshold)
    const updated = await recordSarvamAudioUsage(460000, "ಅಖಂಡ ರುದ್ರಾಭಿಷೇಕ ಮಂತ್ರ");
    expect(updated.remainingPercentage).toBe(8);
    expect(updated.status).toBe("critical");
    expect(updated.lastCriticalAlertSentAt).toBeDefined();
  });

  it("renderSarvamCriticalQuotaEmail generates high-urgency Kannada alert email with metrics", () => {
    const html = renderSarvamCriticalQuotaEmail({
      totalQuota: 500000,
      consumed: 460000,
      remaining: 40000,
      remainingPercentage: 8.0,
      totalCalls: 342,
      lastSnippet: "ಓಂ ನಮಃ ಶಿವಾಯ",
      timestamp: "01/09/2026, 09:30 AM"
    });

    expect(html).toContain("CRITICAL ALERT");
    expect(html).toContain("8.0%");
    expect(html).toContain("40,000 chars");
    expect(html).toContain("dashboard.sarvam.ai");
    expect(html).toContain("Bulbul:v1");
  });

  it("updateSarvamTotalQuota allows super admin to increase total characters upon recharge", async () => {
    const updated = await updateSarvamTotalQuota(1000000);
    expect(updated.totalQuota).toBe(1000000);
    expect(updated.remaining).toBe(1000000);
    expect(updated.remainingPercentage).toBe(100);
    expect(updated.status).toBe("healthy");
  });
});

describe("Calendar Visit & Seva Database Deduplication & Test Isolation Guard", () => {
  it("isTestEnvironment correctly identifies active test runner", () => {
    expect(isTestEnvironment()).toBe(true);
  });

  it("isMockDevotee identifies test, dummy and mock identifiers", () => {
    expect(isMockDevotee("test_devotee")).toBe(true);
    expect(isMockDevotee("dummy_user_123")).toBe(true);
    expect(isMockDevotee("mock_visitor")).toBe(true);
    expect(isMockDevotee("guest_test_token")).toBe(true);
    expect(isMockDevotee("Suresh Sharma")).toBe(false);
  });

  it("recordCalendarVisit safely exits without Firestore writes during test environment", async () => {
    await expect(
      recordCalendarVisit({
        devoteeName: "Test Devotee",
        tokenIdentifier: "test_token_abc",
        dateClicked: "2026-08-31",
        actualDate: "2026-08-31",
        lang: "kn",
        tabVisited: "darshana"
      })
    ).resolves.not.toThrow();
  });
});
