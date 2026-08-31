import { describe, it, expect, beforeEach } from "vitest";
import {
  getDevoteeStreakData,
  recordDevoteeJapaCompleted,
  hasPrashnaShastraVipAccess,
  DEVOTEE_MILESTONES
} from "../features/seva/devoteeStreakService";

describe("Devotee Cloud Firestore Streak & Milestone Rewards Engine", () => {
  const testDevoteeKey = "test_devotee_streak_1";

  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(`baggona_devotee_streak_${testDevoteeKey}`);
    }
  });

  it("initializes default streak record accurately", async () => {
    const key = `test_devotee_streak_init_${Date.now()}`;
    const data = await getDevoteeStreakData(key);
    expect(data.devoteeKey).toBe(key);
    expect(data.currentStreak).toBe(1);
    expect(data.totalJapas).toBe(0);
  });

  it("increments total japas and records completed japa accurately", async () => {
    const key = `test_devotee_streak_increment_${Date.now()}`;
    const { updatedStreak } = await recordDevoteeJapaCompleted(
      key,
      "ಶ್ರೀಸುಮಾ",
      "ಕಾಶ್ಯಪ"
    );

    expect(updatedStreak.totalJapas).toBe(1);
    expect(updatedStreak.lastJapaDate).toBe(new Date().toISOString().split("T")[0]);
  });

  it("contains the 200-Day Grand Milestone for Unlimited Prashna Shastra access", () => {
    const milestone200 = DEVOTEE_MILESTONES.find((m) => m.days === 200);
    expect(milestone200).toBeDefined();
    expect(milestone200?.perkType).toBe("prashna_shastra_unlimited");
    expect(milestone200?.isGrandReward).toBe(true);
    expect(milestone200?.rewardTitle.kn).toContain("ಅನ್ಲಿಮಿಟೆಡ್ ಪ್ರಶ್ನಶಾಸ್ತ್ರ");
  });

  it("evaluates hasPrashnaShastraVipAccess correctly for 200+ days streak", () => {
    expect(hasPrashnaShastraVipAccess({
      devoteeKey: "test",
      devoteeName: "test",
      gotra: "kashyapa",
      currentStreak: 50,
      highestStreak: 50,
      totalPoojas: 50,
      totalJapas: 50,
      lastPoojaDate: "2026-08-31",
      lastJapaDate: "2026-08-31",
      unlockedMilestones: [3, 7, 21, 48]
    })).toBe(false);

    expect(hasPrashnaShastraVipAccess({
      devoteeKey: "test",
      devoteeName: "test",
      gotra: "kashyapa",
      currentStreak: 200,
      highestStreak: 200,
      totalPoojas: 200,
      totalJapas: 200,
      lastPoojaDate: "2026-08-31",
      lastJapaDate: "2026-08-31",
      unlockedMilestones: [3, 7, 21, 48, 108, 200]
    })).toBe(true);
  });
});
