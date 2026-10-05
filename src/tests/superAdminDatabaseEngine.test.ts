import { describe, it, expect, beforeEach } from "vitest";
import {
  executeSuperAdminPetQuery,
  type SuperAdminPetContext
} from "../services/superAdminPetEngine";
import {
  isSuperAdminDatabaseIntent,
  handleDailyPanchangVisitors,
  handleUserBalanceSearch,
  handleAddUserCoins,
  handleUserActivityToday,
  handleDatabaseSummary
} from "../services/superAdminDatabaseEngine";
import {
  memoryWallets,
  memoryCalendarDailyVisits,
  memoryPurohitaActivities,
  getDefaultGokarnaWalletDocs
} from "../db/firestoreDb";
import { getIndianStandardDateStr } from "../core/placeTime";

describe("SuperAdminDatabaseEngine - Autonomous Database Intelligence Suite", () => {
  const baseContext: SuperAdminPetContext = {
    activePage: "superadmindashboard",
    selectedLanguage: "en",
    currentUser: "superadmin"
  };

  beforeEach(() => {
    // Reset or seed test state
    getDefaultGokarnaWalletDocs();
  });

  describe("Intent Detection", () => {
    it("detects daily panchang visitor queries", () => {
      expect(isSuperAdminDatabaseIntent("today how many users visited the daily panchang")).toBe(true);
      expect(isSuperAdminDatabaseIntent("who visited daily panchang today")).toBe(true);
      expect(isSuperAdminDatabaseIntent("daily panchang visits today")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ಇಂದು ದೈನಂದಿನ ಪಂಚಾಂಗವನ್ನು ಎಷ್ಟು ಬಳಕೆದಾರರು ಭೇಟಿ ನೀಡಿದ್ದಾರೆ")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ಪಂಚಾಂಗ ನೋಡಿದವರು ಎಷ್ಟು ಜನ")).toBe(true);
    });

    it("detects user search and balance queries", () => {
      expect(
        isSuperAdminDatabaseIntent(
          "go and check how many Venkataramana users are there and show me their name and their amount currently what amount they have"
        )
      ).toBe(true);
      expect(isSuperAdminDatabaseIntent("check how many Venkataramana users are there")).toBe(true);
      expect(isSuperAdminDatabaseIntent("show me Venkataramana users and their amount")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ವೆಂಕಟರಮಣ ಬಳಕೆದಾರರು ಎಷ್ಟು ಜನ ಇದ್ದಾರೆ")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ವೆಂಕಟರಮಣ ಬಳಕೆದಾರರ ಹೆಸರು ಮತ್ತು ನಾಣ್ಯಗಳ ವಿವರ ತೋರಿಸು")).toBe(true);
    });

    it("detects coin credit and adjustment commands", () => {
      expect(isSuperAdminDatabaseIntent("go and add for Venkataramana V user 2500 coins")).toBe(true);
      expect(isSuperAdminDatabaseIntent("add for Venkataramana V user 2500 coins")).toBe(true);
      expect(isSuperAdminDatabaseIntent("for the username venkataramana_pandit add 2500 coins")).toBe(true);
      expect(isSuperAdminDatabaseIntent("for username shreerampandit add 5000 coins")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ವೆಂಕಟರಮಣ ವಿ ಬಳಕೆದಾರರಿಗೆ ೨೫೦೦ ನಾಣ್ಯಗಳನ್ನು ಸೇರಿಸು")).toBe(true);
    });

    it("detects user activity queries", () => {
      expect(isSuperAdminDatabaseIntent("for new user what and all they have done today")).toBe(true);
      expect(isSuperAdminDatabaseIntent("show user activity today")).toBe(true);
      expect(isSuperAdminDatabaseIntent("what did new user do today")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ಇಂದು ಹೊಸ ಬಳಕೆದಾರರು ಏನು ಮಾಡಿದ್ದಾರೆ")).toBe(true);
    });

    it("detects database summary queries", () => {
      expect(isSuperAdminDatabaseIntent("show database summary")).toBe(true);
      expect(isSuperAdminDatabaseIntent("ಡೇಟಾಬೇಸ್ ಸಾರಾಂಶ ತೋರಿಸು")).toBe(true);
    });
  });

  describe("Query 1: Daily Panchang Visitors", () => {
    it("reports daily panchang visitors accurately in English and Kannada", async () => {
      const todayYmd = getIndianStandardDateStr(new Date());

      // Seed sample visit
      memoryCalendarDailyVisits.set("test_visit_1", {
        id: "test_visit_1",
        userId: "devotee_shriram",
        userName: "Shriram Devotee",
        token: "tok_shriram",
        visitDate: todayYmd,
        visitTimestamp: new Date().toISOString(),
        todayVisitNumber: 1,
        daysRemaining: 88,
        isExpired: false,
        durationDays: 90,
        startDate: todayYmd,
        expiryDate: "2026-12-31"
      });

      const resp = await executeSuperAdminPetQuery(
        "today how many users visited the daily panchang",
        baseContext
      );

      expect(resp.category).toBe("admin");
      expect(resp.text.en).toContain("Baggona Daily Panchanga Visitor Analytics Today");
      expect(resp.text.en).toContain("Unique Devotees");
      expect(resp.spokenText.en).toMatch(/unique devotees/i);
      expect(resp.spokenText.kn).toMatch(/ವಿಶಿಷ್ಟ ಭಕ್ತರು.*ದೈನಂದಿನ ಪಂಚಾಂಗ/);
      expect(resp.actions.some((a) => a.id === "open_calendar_visits")).toBe(true);
    });

    it("handles Kannada visitor inquiry", async () => {
      const resp = await executeSuperAdminPetQuery(
        "ಇಂದು ದೈನಂದಿನ ಪಂಚಾಂಗವನ್ನು ಎಷ್ಟು ಬಳಕೆದಾರರು ಭೇಟಿ ನೀಡಿದ್ದಾರೆ",
        { ...baseContext, selectedLanguage: "kn" }
      );

      expect(resp.category).toBe("admin");
      expect(resp.text.kn).toContain("ಇಂದಿನ ಬಗ್ಗೋಣ ದೈನಂದಿನ ಪಂಚಾಂಗ ವೀಕ್ಷಕರ ವಿವರ");
      expect(resp.spokenText.kn).toContain("ಭಕ್ತರು ಬಗ್ಗೋಣ ದೈನಂದಿನ ಪಂಚಾಂಗವನ್ನು ಸಂದರ್ಶಿಸಿದ್ದಾರೆ");
    });
  });

  describe("Query 2: Check Users & Balances", () => {
    it("finds Venkataramana users, their names, and their amounts", async () => {
      const query = "go and check how many Venkataramana users are there and show me their name and their amount currently what amount they have";
      const resp = await executeSuperAdminPetQuery(query, baseContext);

      expect(resp.category).toBe("admin");
      expect(resp.text.en).toContain("Venkataramana Users & Wallet Balances");
      expect(resp.text.en).toContain("venkataramana_pandit");
      expect(resp.text.en).toContain("Coins");
      expect(resp.spokenText.en).toMatch(/user\(s\) matching Venkataramana/i);
      expect(resp.spokenText.en).toMatch(/coins/i);
      expect(resp.actions.length).toBeGreaterThanOrEqual(1);
    });

    it("handles Kannada query for user search and balances", async () => {
      const query = "ವೆಂಕಟರಮಣ ಬಳಕೆದಾರರು ಎಷ್ಟು ಜನ ಇದ್ದಾರೆ ಅವರ ಹೆಸರು ಮತ್ತು ನಾಣ್ಯಗಳ ವಿವರ ತೋರಿಸು";
      const resp = await executeSuperAdminPetQuery(query, { ...baseContext, selectedLanguage: "kn" });

      expect(resp.category).toBe("admin");
      expect(resp.text.kn).toContain("ಬಳಕೆದಾರರ ನಾಣ್ಯ ಶಿಲ್ಕು ವರದಿ");
      expect(resp.spokenText.kn).toMatch(/ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿದ್ದಾರೆ/);
    });
  });

  describe("Query 3: Direct Coin Crediting", () => {
    it("credits 2500 coins to Venkataramana V user and returns updated balance", async () => {
      // Ensure starting wallet state
      const targetId = "venkataramana_v";
      const startBalance = memoryWallets.get(targetId)?.coinBalance || 2000;

      const query = "go and add for Venkataramana V user 2500 coins";
      const resp = await executeSuperAdminPetQuery(query, baseContext);

      expect(resp.category).toBe("admin");
      expect(resp.emotion).toBe("excited");
      expect(resp.text.en).toContain("Coins Successfully Credited");
      expect(resp.text.en).toContain("2,500 Coins");
      expect(resp.spokenText.en).toMatch(/2,500 coins have been successfully credited/i);

      // Verify in-memory database balance was actually increased
      const updatedWallet = memoryWallets.get(targetId);
      expect(updatedWallet).toBeDefined();
      expect(updatedWallet!.coinBalance).toBe(startBalance + 2500);
    });

    it("credits coins using 'for the username [userId] add [amount]' format", async () => {
      const targetId = "venkataramana_pandit";
      const startBalance = memoryWallets.get(targetId)?.coinBalance || 2000;

      const query = "for the username venkataramana_pandit add 1000 coins";
      const resp = await executeSuperAdminPetQuery(query, baseContext);

      expect(resp.category).toBe("admin");
      expect(resp.text.en).toContain("1,000 Coins");
      expect(resp.spokenText.en).toMatch(/1,000 coins/i);

      const updatedWallet = memoryWallets.get(targetId);
      expect(updatedWallet!.coinBalance).toBe(startBalance + 1000);
    });

    it("handles Kannada numerals and credit phrasing", async () => {
      const targetId = "shreerampandit";
      const startBalance = memoryWallets.get(targetId)?.coinBalance || 5000;

      const query = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಖಾತೆಗೆ ೨೫೦೦ ನಾಣ್ಯಗಳನ್ನು ಸೇರಿಸು";
      const resp = await executeSuperAdminPetQuery(query, { ...baseContext, selectedLanguage: "kn" });

      expect(resp.category).toBe("admin");
      expect(resp.text.kn).toContain("ನಾಣ್ಯಗಳು ಯಶಸ್ವಿಯಾಗಿ ಜಮೆಯಾಗಿವೆ");
      expect(resp.spokenText.kn).toMatch(/(?:2,500|೨,೫೦೦) ನಾಣ್ಯಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಜಮೆ ಮಾಡಲಾಗಿದೆ/);

      const updatedWallet = memoryWallets.get(targetId);
      expect(updatedWallet!.coinBalance).toBe(startBalance + 2500);
    });
  });

  describe("Query 4: User Activity Today", () => {
    it("reports user activity and actions taken today", async () => {
      const todayYmd = getIndianStandardDateStr(new Date());

      // Seed an activity
      memoryPurohitaActivities.set("test_act_1", {
        id: "test_act_1",
        purohitaId: "priest_shreeram",
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        activityType: "kundli_generated",
        page: "kundli",
        details: "Kundli generated for Shriram",
        date: todayYmd,
        timestamp: new Date().toISOString()
      });

      const query = "for new user what and all they have done today";
      const resp = await executeSuperAdminPetQuery(query, baseContext);

      expect(resp.category).toBe("admin");
      expect(resp.text.en).toContain("Today's User Activity & Audit Report");
      expect(resp.text.en).toContain("Total Actions");
      expect(resp.spokenText.en).toMatch(/user activity includes/i);
      expect(resp.spokenText.kn).toMatch(/ಚಟುವಟಿಕೆ/);
      expect(resp.actions.some((a) => a.id === "open_audit_tab")).toBe(true);
    });
  });

  describe("Query 5: Database Summary", () => {
    it("provides complete database status and circulation summary", async () => {
      const resp = await executeSuperAdminPetQuery("show database summary", baseContext);

      expect(resp.category).toBe("admin");
      expect(resp.text.en).toContain("Baggona Panchanga Database Status & Telemetry");
      expect(resp.text.en).toContain("Total Coins in Circulation");
      expect(resp.spokenText.en).toMatch(/Baggona Panchanga database is fully operational/i);
    });
  });
});
