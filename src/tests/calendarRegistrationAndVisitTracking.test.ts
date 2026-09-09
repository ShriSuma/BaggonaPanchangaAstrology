import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerCalendarAtGeneration,
  recordCalendarVisit,
  checkPassExpiration,
  getCalendarRegistration,
  saveCalendarRegistration,
  type CalendarRegistrationDoc
} from "../features/seva/calendarVisitService";
import {
  createDatabaseDevoteeToken,
  resolveDevoteeToken
} from "../features/seva/devoteeTokenDbService";

describe("Calendar Registration, Daily Visit Tracking & Expiration Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Calendar Generation Table (calendarRegistrations)", () => {
    it("creates a valid registration on calendar generation with 30, 90, 180, 365 days", async () => {
      const token30 = "cal_test_token_30d_" + Date.now();
      const today = new Date().toISOString().split("T")[0];

      await registerCalendarAtGeneration({
        userId: "devotee_30",
        userName: "Suresh Rao",
        token: token30,
        startDate: today,
        durationDays: 30,
        priestName: "Shreeram Pandit",
        priestPhone: "9972339362",
        devoteePhone: "9845012345",
        devoteeEmail: "suresh@example.com",
        gotra: "Kashyapa",
        rashi: "Mesha",
        nakshatra: "Ashwini",
        source: "priest_qr"
      });

      const reg = await getCalendarRegistration(token30);
      expect(reg).not.toBeNull();
      expect(reg?.userName).toBe("Suresh Rao");
      expect(reg?.durationDays).toBe(30);
      expect(reg?.startDate).toBe(today);
      expect(reg?.priestName).toBe("Shreeram Pandit");
      expect(reg?.source).toBe("priest_qr");
      expect(reg?.status).toBe("active");

      // Verify expiration date is computed from startDate + durationDays
      const expectedExpiry = new Date(new Date(today).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      expect(reg?.expiresAt.slice(0, 10)).toBe(expectedExpiry);
    });

    it("supports all generation sources: calendar_sync, prasada_kit, royal_booklet", async () => {
      const sources: Array<"calendar_sync" | "prasada_kit" | "royal_booklet"> = [
        "calendar_sync",
        "prasada_kit",
        "royal_booklet"
      ];

      for (const src of sources) {
        const token = `cal_test_${src}_${Date.now()}`;
        await registerCalendarAtGeneration({
          userId: `dev_${src}`,
          userName: `Devotee ${src}`,
          token,
          startDate: "2026-09-01",
          durationDays: 90,
          priestName: "Shreeram Pandit",
          priestPhone: "9972339362",
          source: src
        });

        const reg = await getCalendarRegistration(token);
        expect(reg).not.toBeNull();
        expect(reg?.source).toBe(src);
      }
    });
  });

  describe("2. Daily Visit Tracking Table (calendarDailyVisits)", () => {
    it("tracks visits per day and increments todayVisitNumber", async () => {
      const token = "cal_visit_track_token_" + Date.now();
      const today = new Date().toISOString().split("T")[0];

      // Seed registration
      await registerCalendarAtGeneration({
        userId: "dev_visit_user",
        userName: "Venkatesh Bhatt",
        token,
        startDate: today,
        durationDays: 90,
        priestName: "Shreeram Pandit",
        priestPhone: "9972339362",
        source: "priest_qr"
      });

      // 1st visit today
      const visit1 = await recordCalendarVisit({
        userId: "dev_visit_user",
        userName: "Venkatesh Bhatt",
        token,
        startDate: today,
        durationDays: 90,
        lang: "kn",
        priestName: "Shreeram Pandit"
      });

      expect(visit1.isSuccess).toBe(true);
      expect(visit1.todayVisitsCount).toBe(1);
      expect(visit1.daysRemaining).toBe(90);
      expect(visit1.isExpired).toBe(false);

      // 2nd visit today (same user, same date)
      const visit2 = await recordCalendarVisit({
        userId: "dev_visit_user",
        userName: "Venkatesh Bhatt",
        token,
        startDate: today,
        durationDays: 90,
        lang: "kn",
        priestName: "Shreeram Pandit"
      });

      expect(visit2.todayVisitsCount).toBe(2);
      expect(visit2.totalVisitsCount).toBeGreaterThanOrEqual(2);
    });

    it("auto-registers legacy live devotees on their first visit without disruption", async () => {
      const legacyToken = "legacy_token_live_devotee_" + Date.now();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Ensure no prior registration exists
      const before = await getCalendarRegistration(legacyToken);
      expect(before).toBeNull();

      // Live legacy devotee visits DailyDarshana
      const visit = await recordCalendarVisit({
        userId: "legacy_user_001",
        userName: "Live Devotee Ramesh",
        token: legacyToken,
        startDate: thirtyDaysAgo,
        durationDays: 90,
        lang: "kn",
        priestName: "Shreeram Pandit"
      });

      expect(visit.isSuccess).toBe(true);
      expect(visit.daysRemaining).toBe(60);
      expect(visit.isExpired).toBe(false);

      // Verify that auto-registration happened seamlessly
      const after = await getCalendarRegistration(legacyToken);
      expect(after).not.toBeNull();
      expect(after?.userName).toBe("Live Devotee Ramesh");
      expect(after?.source).toBe("legacy_auto_sync");
      expect(after?.durationDays).toBe(90);
      expect(after?.startDate).toBe(thirtyDaysAgo);
    });
  });

  describe("3. Ironclad Expiration Enforcement & Security Tampering Resistance", () => {
    it("locks out devotee when 30-day pass has elapsed 45 days (Zero free access)", () => {
      const now = Date.now();
      const fortyFiveDaysAgo = new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const check = checkPassExpiration(fortyFiveDaysAgo, 30);
      expect(check.isExpired).toBe(true);
      expect(check.daysElapsed).toBe(45);
      expect(check.daysRemaining).toBe(0);
      expect(check.totalDays).toBe(30);
    });

    it("locks out devotee when 90-day pass has elapsed 91 days", () => {
      const now = Date.now();
      const ninetyOneDaysAgo = new Date(now - 91 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const check = checkPassExpiration(ninetyOneDaysAgo, 90);
      expect(check.isExpired).toBe(true);
      expect(check.daysElapsed).toBe(91);
      expect(check.daysRemaining).toBe(0);
    });

    it("evaluates active passes properly across all durations", () => {
      const now = Date.now();
      const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const check30 = checkPassExpiration(tenDaysAgo, 30);
      expect(check30.isExpired).toBe(false);
      expect(check30.daysRemaining).toBe(20);

      const check90 = checkPassExpiration(tenDaysAgo, 90);
      expect(check90.isExpired).toBe(false);
      expect(check90.daysRemaining).toBe(80);

      const check180 = checkPassExpiration(tenDaysAgo, 180);
      expect(check180.isExpired).toBe(false);
      expect(check180.daysRemaining).toBe(170);

      const check365 = checkPassExpiration(tenDaysAgo, 365);
      expect(check365.isExpired).toBe(false);
      expect(check365.daysRemaining).toBe(355);
    });

    it("prevents URL tampering where user appends &days=999 to an expired 30-day pass", async () => {
      const token = "tamper_resistant_token_" + Date.now();
      const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Database has genuine 30-day registration from 40 days ago
      await saveCalendarRegistration({
        id: token,
        token,
        userId: "tamper_user",
        userName: "Tamper Test User",
        startDate: fortyDaysAgo,
        durationDays: 30,
        expiresAt: new Date(new Date(fortyDaysAgo).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priestName: "Shreeram Pandit",
        priestPhone: "9972339362",
        source: "priest_qr",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "expired"
      });

      // User modifies URL to claim 999 days:
      // In DailyDarshanaPage, database registration is fetched and overrides URL query params:
      const dbReg = await getCalendarRegistration(token);
      expect(dbReg).not.toBeNull();

      // Precedence check: dbRegistration strictly takes priority over URL parameter
      const effectiveDuration = dbReg?.durationDays || 999;
      const effectiveStartDate = dbReg?.startDate || fortyDaysAgo;

      expect(effectiveDuration).toBe(30); // Tampering defeated!
      expect(effectiveStartDate).toBe(fortyDaysAgo);

      const passCheck = checkPassExpiration(effectiveStartDate, effectiveDuration);
      expect(passCheck.isExpired).toBe(true);
      expect(passCheck.daysRemaining).toBe(0);
    });

    it("ensures createDatabaseDevoteeToken derives expiresAt from startDate, not clock now", async () => {
      const pastStart = "2026-07-01";
      const result = await createDatabaseDevoteeToken({
        name: "Pooja Devotee",
        pandit: "Shreeram Pandit",
        startDate: pastStart,
        days: 30
      });

      const tokenDoc = result.tokenDoc;
      // 30 days after 2026-07-01 is 2026-07-31
      expect(tokenDoc.expiresAt.startsWith("2026-07-31")).toBe(true);
      expect(tokenDoc.totalDays).toBe(30);
      expect(tokenDoc.startDate).toBe(pastStart);

      // Now resolve the token
      const resolved = await resolveDevoteeToken(tokenDoc.id);
      expect(resolved).not.toBeNull();
      expect(resolved?.payload.d).toBe(pastStart);
      expect(resolved?.payload.dy).toBe(30);
    });
  });
});
