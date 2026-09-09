import { describe, it, expect } from "vitest";
import { checkPassExpiration } from "../features/seva/calendarVisitService";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import { DEFAULT_GOKARNA_PRIESTS, restoreAndSeedDefaultPriests, cleanupAllTestAndMockProfiles } from "../db/firestoreDb";
import { getIndianStandardDateStr } from "../core/placeTime";

describe("Pooja, 90-Day Calendar Days Remaining, & Priest Auto-Healing Verification", () => {
  it("deterministically computes remaining days from authentic startDate instead of resetting to 90 every day", () => {
    const today = new Date();
    // Simulate user who started 45 days ago
    const start45DaysAgo = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000);
    const startYmd = getIndianStandardDateStr(start45DaysAgo);

    const status = checkPassExpiration(startYmd, 90);
    expect(status.isExpired).toBe(false);
    expect(status.daysElapsed).toBe(45);
    expect(status.daysRemaining).toBe(45);
    expect(status.totalDays).toBe(90);
  });

  it("correctly encodes and decodes sd (startDate) in devotee tokens", () => {
    const originalStartDate = "2026-07-20";
    const currentEventDate = "2026-08-30";

    const token = encodeDevoteeToken({
      n: "ಶ್ರೀಧರ್ ಭಟ್",
      nk: 18,
      r: 8,
      p: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      d: currentEventDate,
      startDate: originalStartDate,
      sd: originalStartDate,
      days: 90,
      dy: 90,
      l: "kn"
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sd).toBe(originalStartDate);
    expect(decoded?.startDate).toBe(originalStartDate);
    expect(decoded?.d).toBe(currentEventDate);
    expect(decoded?.dy).toBe(90);
  });

  it("contains 10 authentic Gokarna Kshetra priests in DEFAULT_GOKARNA_PRIESTS with proper names and phones", () => {
    expect(DEFAULT_GOKARNA_PRIESTS.length).toBe(10);
    const chief = DEFAULT_GOKARNA_PRIESTS.find((p) => p.userId === "shreerampandit");
    expect(chief).toBeDefined();
    expect(chief?.name).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(chief?.phone).toBe("9972339362");

    const chaitanya = DEFAULT_GOKARNA_PRIESTS.find((p) => p.userId === "chaitanya_pandit");
    expect(chaitanya).toBeDefined();
    expect(chaitanya?.name).toBe("ಚೈತನ್ಯ ಪಂಡಿತ್");
  });

  it("seeds priests without throwing and protects them from cleanupAllTestAndMockProfiles", async () => {
    const count = await restoreAndSeedDefaultPriests();
    expect(count).toBeGreaterThanOrEqual(0);

    const report = await cleanupAllTestAndMockProfiles();
    expect(report).toBeDefined();
    // Default priests must never be purged
    for (const priest of DEFAULT_GOKARNA_PRIESTS) {
      expect(report.details.some((d) => d.includes(priest.userId))).toBe(false);
    }
  });
});
