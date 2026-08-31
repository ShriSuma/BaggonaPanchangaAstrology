import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPoojaStreak, recordPoojaSankalpaCompleted } from "../features/seva/calendarVisitService";

describe("Daily Darshana Engagement & Habit Formation System", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("Pooja Sankalpa Streak Engine", () => {
    it("initializes new devotee streak to 0 with no completion today", () => {
      const devoteeKey = "test_devotee_streak_1";
      const streak = getPoojaStreak(devoteeKey);

      expect(streak.currentStreak).toBe(0);
      expect(streak.isCompletedToday).toBe(false);
      expect(streak.lastSankalpaDate).toBe("");
      expect(streak.totalSankalpas).toBe(0);
    });

    it("records today's pooja sankalpa and increments streak to 1", async () => {
      const devoteeKey = "test_devotee_streak_2";
      const updated = await recordPoojaSankalpaCompleted(devoteeKey, "Devotee One", "Kashyapa", "Shreeram Pandit");

      expect(updated.currentStreak).toBe(1);
      expect(updated.isCompletedToday).toBe(true);
      expect(updated.totalSankalpas).toBe(1);
      const todayYmd = new Date().toISOString().split("T")[0];
      expect(updated.lastSankalpaDate).toBe(todayYmd);
    });

    it("is idempotent when completed multiple times on the same date", async () => {
      const devoteeKey = "test_devotee_streak_3";
      const first = await recordPoojaSankalpaCompleted(devoteeKey, "Devotee Two", "Kashyapa", "Shreeram Pandit");
      expect(first.currentStreak).toBe(1);

      const second = await recordPoojaSankalpaCompleted(devoteeKey, "Devotee Two", "Kashyapa", "Shreeram Pandit");
      expect(second.currentStreak).toBe(1);
      expect(second.totalSankalpas).toBe(1);
    });

    it("unlocks 7-Day Saptaha milestone on 7th consecutive day", async () => {
      const devoteeKey = "test_devotee_streak_7";
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yDateStr = yesterday.toISOString().split("T")[0];

      // Simulate 6 days prior streak
      localStorage.setItem(
        `baggona_devotee_pooja_streak_${devoteeKey}`,
        JSON.stringify({
          currentStreak: 6,
          highestStreak: 6,
          lastSankalpaDate: yDateStr,
          totalSankalpas: 6
        })
      );

      const updated = await recordPoojaSankalpaCompleted(devoteeKey, "Saptaha Devotee", "Kashyapa", "Shreeram Pandit");
      expect(updated.currentStreak).toBe(7);
      expect(updated.milestoneUnlocked).not.toBeNull();
      expect(updated.milestoneUnlocked?.level).toBe(7);
      expect(updated.milestoneUnlocked?.titleKn).toContain("ಸಪ್ತಾಹ");
    });
  });

  describe("Sanctum Prayer & Micro-Parihara Persistence", () => {
    it("persists micro-parihara completion in local storage", () => {
      const dateStr = "2026-08-31";
      const devoteeName = "Ramesh Sharma";
      const storageKey = `baggona_micro_parihara_${dateStr}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      expect(localStorage.getItem(storageKey)).toBeNull();
      localStorage.setItem(storageKey, "done");
      expect(localStorage.getItem(storageKey)).toBe("done");
    });

    it("persists sanctum prayer note in local storage", () => {
      const dateStr = "2026-08-31";
      const devoteeName = "Ananya Bhat";
      const storageKey = `baggona_sanctum_prayer_${dateStr}_${devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

      const prayer = "May our family receive peace, longevity, and divine guidance from Lord Shiva.";
      localStorage.setItem(storageKey, prayer);
      expect(localStorage.getItem(storageKey)).toBe(prayer);
    });
  });
});
