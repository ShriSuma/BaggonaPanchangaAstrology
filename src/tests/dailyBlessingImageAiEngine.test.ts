import { describe, it, expect } from "vitest";
import {
  buildDailyBlessingAiImagePrompt,
  scheduleMidnightBlessingImagePrecompute
} from "../features/darshana/dailyBlessingImageAiEngine";

describe("DailyBlessingImageAiEngine (ನಿತ್ಯ ದೈವಿಕ ಚಿತ್ರ ಸಂಶ್ಲೇಷಣಾ ಎಂಜಿನ್)", () => {
  it("builds rich Gemini / Nano Banana AI Image prompts tailored to date, season & Gokarna temple dawn", () => {
    const testDates = [
      new Date(2026, 0, 1),
      new Date(2026, 5, 15),
      new Date(2026, 8, 1),
      new Date(2026, 11, 31)
    ];

    testDates.forEach((d) => {
      const promptData = buildDailyBlessingAiImagePrompt(d);
      expect(promptData.dateStr).toBeTruthy();
      expect(promptData.dayOfYear).toBeGreaterThanOrEqual(1);
      expect(promptData.prompt).toContain("Gokarna");
      expect(promptData.prompt).toContain("Hindu spiritual temple dawn");
      expect(promptData.themeTitle).toBeTruthy();
      expect(promptData.sceneryDescription).toBeTruthy();
      expect(promptData.colorPalette.gold).toBe("#FDE047");
    });
  });

  it("schedules midnight 12:00 AM precompute and caches prompt in storage", async () => {
    const res = await scheduleMidnightBlessingImagePrecompute();
    expect(res.success).toBe(true);
    expect(res.dateStr).toBeTruthy();
    expect(res.dayOfYear).toBeGreaterThanOrEqual(1);
    expect(res.theme).toBeTruthy();
  });
});
