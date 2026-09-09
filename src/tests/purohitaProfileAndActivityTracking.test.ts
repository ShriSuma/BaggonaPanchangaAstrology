import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  is30DayDevotee,
  recordCalendarVisit,
  getCalendarRegistration,
  saveCalendarRegistration,
  type CalendarRegistrationDoc
} from "../features/seva/calendarVisitService";
import {
  canonicalPurohitaId,
  ensurePurohitaProfile,
  trackPurohitaPageView,
  trackPurohitaKundliGenerated,
  trackPurohitaQuestionAsked
} from "../features/priest/purohitaActivityService";
import {
  savePurohitaProfile,
  getPurohitaProfile,
  deletePurohitaProfile,
  recordPurohitaActivity,
  subscribeAllPurohitaProfiles,
  subscribePurohitaActivities,
  subscribePurohitaDailySummaries
} from "../db/firestoreDb";

describe("Purohita Profile Registration, Activity Tracking & Devotee Pass Duration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------------------- */
  /* 1. DEVOTEE 30 VS 90 DAYS DETECTION (RAMANATHA & LEGACY PASSES)            */
  /* -------------------------------------------------------------------------- */
  describe("1. Devotee Pass Duration Auto-Detection (is30DayDevotee)", () => {
    it("identifies Ramanatha and variations as 30-day devotees", () => {
      expect(is30DayDevotee("Ramanatha")).toBe(true);
      expect(is30DayDevotee("Ramanatha Bhat")).toBe(true);
      expect(is30DayDevotee("Ramanath Hegde")).toBe(true);
      expect(is30DayDevotee("ರಾಮನಾಥ")).toBe(true);
      expect(is30DayDevotee("ರಾಮನಾಥ ಭಟ್")).toBe(true);
      expect(is30DayDevotee("Ramnath Sharma")).toBe(true);
    });

    it("identifies tokens with 30d flag as 30-day devotees", () => {
      expect(is30DayDevotee("Devotee", "token_30d_xyz")).toBe(true);
      expect(is30DayDevotee("Devotee", "token_30_day_abc")).toBe(true);
      expect(is30DayDevotee("Devotee", "pass_30days_123")).toBe(true);
    });

    it("defaults standard devotees to 90 days (returns false for is30DayDevotee)", () => {
      expect(is30DayDevotee("Suresh Kumar")).toBe(false);
      expect(is30DayDevotee("Ganesh Shastri")).toBe(false);
      expect(is30DayDevotee("Vijayalaxmi")).toBe(false);
      expect(is30DayDevotee("Shreesuma")).toBe(false);
      expect(is30DayDevotee("")).toBe(false);
    });

    it("recovers authentic historical start date and calibrates Ramanatha to 30 days on visit", async () => {
      const legacyToken = "legacy_ramnath_token_" + Date.now();
      const historicalStartDate = "2026-08-01";

      // Simulate a legacy registration without explicit sd that was erroneously given 90 days
      await saveCalendarRegistration({
        id: legacyToken,
        token: legacyToken,
        userId: "ramanatha_legacy",
        userName: "Ramanatha",
        startDate: historicalStartDate,
        durationDays: 90,
        expiresAt: "2026-10-30T00:00:00.000Z",
        priestName: "Shreeram Pandit",
        priestPhone: "9972339362",
        source: "priest_qr",
        status: "active",
        createdAt: "2026-08-01T10:00:00.000Z",
        updatedAt: "2026-08-01T10:00:00.000Z"
      });

      // Record visit for Ramanatha
      const visitResult = await recordCalendarVisit({
        token: legacyToken,
        devoteeName: "Ramanatha",
        tabVisited: "panchanga"
      });

      expect(visitResult.isSuccess).toBe(true);
      // Registration should be auto-calibrated to 30 days
      const updatedReg = await getCalendarRegistration(legacyToken);
      expect(updatedReg?.durationDays).toBe(30);
      expect(updatedReg?.startDate).toBe(historicalStartDate);
      // 30 days from 2026-08-01 is 2026-08-31
      expect(updatedReg?.expiresAt.slice(0, 10)).toBe("2026-08-31");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. CANONICAL PUROHITA ID NORMALIZATION                                     */
  /* -------------------------------------------------------------------------- */
  describe("2. Canonical Purohita ID Normalization", () => {
    it("normalizes various priest inputs into canonical format priest_<slug>", () => {
      expect(canonicalPurohitaId("shreeram")).toBe("priest_shreeram");
      expect(canonicalPurohitaId("Shreeram Pandit")).toBe("priest_shreeram_pandit");
      expect(canonicalPurohitaId("priest_shreeram")).toBe("priest_shreeram");
      expect(canonicalPurohitaId("priest_venkataramana")).toBe("priest_venkataramana");
      expect(canonicalPurohitaId("  Venkataramana Bhat  ")).toBe("priest_venkataramana_bhat");
      expect(canonicalPurohitaId("")).toBe("priest_unknown");
      expect(canonicalPurohitaId(undefined as any)).toBe("priest_unknown");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. PUROHITA PROFILE CRUD (firestoreDb)                                     */
  /* -------------------------------------------------------------------------- */
  describe("3. Purohita Profile Database Operations", () => {
    const testPriestId = "priest_test_shreeram_" + Date.now();

    it("saves and retrieves a complete Purohita profile", async () => {
      const saved = await savePurohitaProfile({
        id: testPriestId,
        purohitaId: testPriestId,
        priestName: "Shreeram Pandit",
        name: "Shreeram Pandit",
        mobileNumber: "9972339362",
        mobile: "9972339362",
        email: "shreeram.pandit@baggona.org",
        coinBalance: 5000,
        allowedModules: ["panchanga", "sankhyashastra", "diksuchi", "purva_janma"],
        status: "active",
        isVerified: true,
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      expect(saved).toBeDefined();
      expect(saved.purohitaId).toBe(testPriestId);

      const profile = await getPurohitaProfile(testPriestId);
      expect(profile).not.toBeNull();
      expect(profile?.purohitaId).toBe(testPriestId);
      expect(profile?.priestName).toBe("Shreeram Pandit");
      expect(profile?.mobileNumber).toBe("9972339362");
      expect(profile?.email).toBe("shreeram.pandit@baggona.org");
      expect(profile?.coinBalance).toBe(5000);
      expect(profile?.isVerified).toBe(true);
    });

    it("deletes a Purohita profile cleanly", async () => {
      const tempId = "priest_to_delete_" + Date.now();
      await savePurohitaProfile({
        id: tempId,
        purohitaId: tempId,
        priestName: "Temp Priest",
        mobileNumber: "9876543210",
        email: "temp@example.com",
        coinBalance: 100,
        allowedModules: ["panchanga"],
        status: "active",
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const beforeDelete = await getPurohitaProfile(tempId);
      expect(beforeDelete).not.toBeNull();

      await deletePurohitaProfile(tempId);
      const afterDelete = await getPurohitaProfile(tempId);
      expect(afterDelete).toBeNull();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. ACTIVITY RECORDING & DAILY SUMMARY AGGREGATION                          */
  /* -------------------------------------------------------------------------- */
  describe("4. Purohita Activity Recording & Daily Summary Aggregation", () => {
    const priestId = "priest_tracking_test_" + Date.now();
    const today = new Date().toISOString().split("T")[0];

    it("records page_view activity and increments page count in daily summary", async () => {
      const act = await recordPurohitaActivity({
        purohitaId: priestId,
        priestName: "Gokarna Priest",
        activityType: "page_view",
        page: "panchanga",
        details: "ಪಂಚಾಂಗ ಪುಟ ವೀಕ್ಷಣೆ",
        date: today
      });

      expect(act).toBeDefined();
      expect(act.purohitaId).toBe(priestId);
      expect(act.activityType).toBe("page_view");
      expect(act.page).toBe("panchanga");
    });

    it("records kundli_generated and question_asked with correct counters", async () => {
      // Record kundli generated
      const kundliAct = await recordPurohitaActivity({
        purohitaId: priestId,
        priestName: "Gokarna Priest",
        activityType: "kundli_generated",
        page: "kundli",
        details: "ಜನನ ಕುಂಡಲಿ ರಚನೆ: Suresh Kumar",
        date: today
      });
      expect(kundliAct.activityType).toBe("kundli_generated");

      // Record question asked
      const questionAct = await recordPurohitaActivity({
        purohitaId: priestId,
        priestName: "Gokarna Priest",
        activityType: "question_asked",
        page: "sankhyashastra",
        details: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಪ್ರಶ್ನೆ: ಶುಭ ದಿನಾಂಕ",
        date: today
      });
      expect(questionAct.activityType).toBe("question_asked");

      // Record coin offer
      const coinAct = await recordPurohitaActivity({
        purohitaId: priestId,
        priestName: "Gokarna Priest",
        activityType: "coins_offered",
        page: "dashboard",
        details: "1000 ನಾಣ್ಯಗಳ ಕೊಡುಗೆ",
        coinsImpact: 1000,
        date: today
      });
      expect(coinAct.coinsImpact).toBe(1000);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. PUROHITA ACTIVITY SERVICE DEBOUNCE & HIGH-LEVEL TRACKERS               */
  /* -------------------------------------------------------------------------- */
  describe("5. Purohita Activity Service High-Level Trackers & Debounce", () => {
    const priestId = "priest_debounce_" + Date.now();

    it("trackPurohitaPageView debounces consecutive visits to the same page within 5 seconds", async () => {
      // First visit: should execute
      const res1 = await trackPurohitaPageView(priestId, "Shreeram Pandit", "dashboard");
      expect(res1).toBeDefined();

      // Immediate second visit to same page: should be debounced and return null
      const res2 = await trackPurohitaPageView(priestId, "Shreeram Pandit", "dashboard");
      expect(res2).toBeNull();

      // Different page: should execute immediately
      const res3 = await trackPurohitaPageView(priestId, "Shreeram Pandit", "kundli");
      expect(res3).toBeDefined();
    });

    it("trackPurohitaKundliGenerated records successfully", async () => {
      const res = await trackPurohitaKundliGenerated(priestId, "Shreeram Pandit", "Devotee Ramesh", "Mesha");
      expect(res).toBeDefined();
      expect(res.activityType).toBe("kundli_generated");
      expect(res.details).toContain("Ramesh");
    });

    it("trackPurohitaQuestionAsked records successfully", async () => {
      const res = await trackPurohitaQuestionAsked(priestId, "Shreeram Pandit", "sankhyashastra", "ವಿವಾಹ ಮುಹೂರ್ತ");
      expect(res).toBeDefined();
      expect(res.activityType).toBe("question_asked");
      expect(res.details).toContain("ವಿವಾಹ ಮುಹೂರ್ತ");
    });

    it("ensurePurohitaProfile creates profile if missing without overwriting existing data", async () => {
      const newPriestId = "priest_ensure_test_" + Date.now();
      const profile1 = await ensurePurohitaProfile(newPriestId, "Venkataramana Bhat");
      expect(profile1).toBeDefined();
      expect(profile1.priestName).toBe("Venkataramana Bhat");

      // Calling again should return existing profile
      const profile2 = await ensurePurohitaProfile(newPriestId, "Venkataramana Bhat");
      expect(profile2.purohitaId).toBe(profile1.purohitaId);
    });
  });
});
