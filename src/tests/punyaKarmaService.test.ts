import { describe, it, expect, beforeEach } from "vitest";
import {
  shouldShowDailySatkarmaCard,
  recordSatkarmaAction,
  getPunyaKarmaSummary
} from "../features/darshana/punyaKarmaService";
import { db } from "../db/indexedDb";

describe("PunyaKarmaService - Punya & Karma Butte DB Ledger and Snooze Timer", () => {
  const testYmd = "2026-09-01";

  beforeEach(async () => {
    localStorage.clear();
    try {
      if (db && db.isOpen()) {
        await db.punyaKarmaLedger.clear();
        await db.punyaKarmaSummary.clear();
      }
    } catch {}
  });

  it("should initially allow showing daily satkarma card if not answered", async () => {
    const shouldShow = await shouldShowDailySatkarmaCard(testYmd, "user_initial");
    expect(shouldShow).toBe(true);
  });

  it("records 'done' action, increases Punya Butte by +1, and dismisses for whole day", async () => {
    const res = await recordSatkarmaAction("done", "Surya Vandane", testYmd, "user_done");
    expect(res.success).toBe(true);
    expect(res.punyaTotal).toBe(1);
    expect(res.karmaTotal).toBe(0);

    const summary = await getPunyaKarmaSummary("user_done");
    expect(summary.totalPunya).toBe(1);
    expect(summary.totalKarma).toBe(0);

    // Card should now be hidden for the entire day
    const shouldShow = await shouldShowDailySatkarmaCard(testYmd, "user_done");
    expect(shouldShow).toBe(false);
  });

  it("records 'no' action, increases Karma Butte by +1, and dismisses for whole day", async () => {
    const res = await recordSatkarmaAction("no", "Feed Birds", testYmd, "user_no");
    expect(res.success).toBe(true);
    expect(res.punyaTotal).toBe(0);
    expect(res.karmaTotal).toBe(1);

    const summary = await getPunyaKarmaSummary("user_no");
    expect(summary.totalPunya).toBe(0);
    expect(summary.totalKarma).toBe(1);

    // Card should be dismissed for the entire day
    const shouldShow = await shouldShowDailySatkarmaCard(testYmd, "user_no");
    expect(shouldShow).toBe(false);
  });

  it("records 'maybe_later' action and snoozes for 3 hours", async () => {
    const res = await recordSatkarmaAction("maybe_later", "Help Workers", testYmd, "user_maybe");
    expect(res.success).toBe(true);
    expect(res.punyaTotal).toBe(0);
    expect(res.karmaTotal).toBe(0);

    // Within 3 hours, shouldShow should return false
    const shouldShowSoon = await shouldShowDailySatkarmaCard(testYmd, "user_maybe");
    expect(shouldShowSoon).toBe(false);

    // Simulate 3 hours passing (clock ticking in DB)
    const localKey = `baggona_punya_karma_user_maybe_${testYmd}`;
    const stored = JSON.parse(localStorage.getItem(localKey)!);
    stored.remindAfter = Date.now() - 1000; // 1 second in the past
    localStorage.setItem(localKey, JSON.stringify(stored));

    // After 3 hours have passed, it should show again!
    const shouldShowAfter3Hours = await shouldShowDailySatkarmaCard(testYmd, "user_maybe");
    expect(shouldShowAfter3Hours).toBe(true);
  });
});
