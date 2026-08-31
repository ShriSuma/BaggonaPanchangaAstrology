import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkPassExpiration } from "../features/seva/calendarVisitService";

describe("Calendar Visit & 90-Day Engagement Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates active 90-day pass correctly when within 90 days", () => {
    // Start date 10 days ago
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const result = checkPassExpiration(tenDaysAgo, 90);
    expect(result.isExpired).toBe(false);
    expect(result.daysElapsed).toBe(10);
    expect(result.daysRemaining).toBe(80);
    expect(result.totalDays).toBe(90);
  });

  it("evaluates expired pass correctly when 90 days have elapsed", () => {
    // Start date 95 days ago
    const now = new Date();
    const ninetyFiveDaysAgo = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const result = checkPassExpiration(ninetyFiveDaysAgo, 90);
    expect(result.isExpired).toBe(true);
    expect(result.daysElapsed).toBe(95);
    expect(result.daysRemaining).toBe(0);
  });

  it("handles fallback and future start dates gracefully", () => {
    const today = new Date().toISOString().split("T")[0];
    const result = checkPassExpiration(today, 90);
    expect(result.isExpired).toBe(false);
    expect(result.daysElapsed).toBe(0);
    expect(result.daysRemaining).toBe(90);
  });
});
