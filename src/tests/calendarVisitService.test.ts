import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkPassExpiration,
  recordCalendarVisit,
  extendSubscriptionValidity,
  deleteDevoteeSubscription,
  purgeAllCalendarSubscriptionsAndVisits
} from "../features/seva/calendarVisitService";

describe("Calendar Visit & Devotee Subscription CRM Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates active 90-day pass correctly when within 90 days", () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const result = checkPassExpiration(tenDaysAgo, 90);
    expect(result.isExpired).toBe(false);
    expect(result.daysElapsed).toBe(10);
    expect(result.daysRemaining).toBe(80);
    expect(result.totalDays).toBe(90);
  });

  it("evaluates expired pass correctly when 90 days have elapsed", () => {
    const now = new Date();
    const ninetyFiveDaysAgo = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const result = checkPassExpiration(ninetyFiveDaysAgo, 90);
    expect(result.isExpired).toBe(true);
    expect(result.daysElapsed).toBe(95);
    expect(result.daysRemaining).toBe(0);
  });

  it("evaluates custom duration passes (30, 180, 365 days) correctly", () => {
    const now = new Date();
    const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const res30 = checkPassExpiration(twentyDaysAgo, 30);
    expect(res30.isExpired).toBe(false);
    expect(res30.daysRemaining).toBe(10);

    const res180 = checkPassExpiration(twentyDaysAgo, 180);
    expect(res180.isExpired).toBe(false);
    expect(res180.daysRemaining).toBe(160);

    const res365 = checkPassExpiration(twentyDaysAgo, 365);
    expect(res365.isExpired).toBe(false);
    expect(res365.daysRemaining).toBe(345);
  });

  it("handles fallback and future start dates gracefully", () => {
    const today = new Date().toISOString().split("T")[0];
    const result = checkPassExpiration(today, 90);
    expect(result.isExpired).toBe(false);
    expect(result.daysElapsed).toBe(0);
    expect(result.daysRemaining).toBe(90);
  });

  it("records calendar visit with Kundli and contact parameters without errors", async () => {
    const today = new Date().toISOString().split("T")[0];
    await expect(
      recordCalendarVisit({
        devoteeName: "Narayana Bhat",
        tokenIdentifier: "test_token_12345",
        dateClicked: today,
        actualDate: today,
        lang: "kn",
        tabVisited: "muhurtha",
        priestName: "Shreeram Pandit",
        dob: "1990-05-15",
        tob: "10:30",
        gotra: "Kashyapa",
        rashi: "Mesha",
        nakshatra: "Ashwini",
        lagnaRashi: "Dhanu",
        sunSign: "Vrishabha",
        phone: "9876543210",
        email: "narayana.bhat@example.com",
        durationDays: 90,
        startDate: today
      })
    ).resolves.not.toThrow();
  });

  it("extends and deletes devotee subscription cleanly", async () => {
    const extendOk = await extendSubscriptionValidity("test_token_12345", 30);
    expect(typeof extendOk).toBe("boolean");

    const deleteOk = await deleteDevoteeSubscription("test_token_12345");
    expect(typeof deleteOk).toBe("boolean");
  });

  it("purges all calendar subscriptions and visits for a clean start", async () => {
    const purgeResult = await purgeAllCalendarSubscriptionsAndVisits();
    expect(purgeResult).toHaveProperty("removedCount");
    expect(typeof purgeResult.removedCount).toBe("number");
  }, 10000);
});
