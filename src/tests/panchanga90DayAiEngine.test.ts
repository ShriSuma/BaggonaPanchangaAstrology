import { describe, expect, it, vi } from "vitest";
import {
  computeLocalFallback90DayPanchanga,
  fetch90DayAiPanchanga,
  getCached90DayPanchanga
} from "../features/seva/panchanga90DayAiEngine";
import * as GeminiEngine from "../core/GeminiEngine";

describe("panchanga90DayAiEngine", () => {
  it("computes 90 days of location-accurate Panchanga mathematically", () => {
    const map = computeLocalFallback90DayPanchanga(
      "581326",
      "Gokarna",
      "2026-08-19",
      "kn",
      14.54,
      74.31
    );

    const dates = Object.keys(map);
    expect(dates.length).toBe(90);
    expect(dates[0]).toBe("2026-08-19");

    const firstDay = map["2026-08-19"]!;
    expect(firstDay.date).toBe("2026-08-19");
    expect(firstDay.paksha).toBeDefined();
    expect(firstDay.tithi).toBeDefined();
    expect(firstDay.nakshatra).toBeDefined();
    expect(firstDay.suryodaya).toMatch(/\d{2}:\d{2}\s+(AM|PM)/);
    expect(firstDay.suryasta).toMatch(/\d{2}:\d{2}\s+(AM|PM)/);
    expect(firstDay.rahuKaala).toBeDefined();
    expect(firstDay.gulikaKaala).toBeDefined();
    expect(firstDay.yamagandaKaala).toBeDefined();
  });

  it("caches 90-day Panchanga map in memory and localStorage", async () => {
    vi.spyOn(GeminiEngine, "askGeminiBatch").mockResolvedValueOnce([
      {
        date: "2026-08-19",
        paksha: "ಶುಕ್ಲ ಪಕ್ಷ",
        tithi: "ಸಪ್ತಮಿ",
        nakshatra: "ವಿಶಾಖ",
        suryodaya: "06:14 AM",
        suryasta: "06:42 PM",
        rahuKaala: "12:15 PM – 01:48 PM",
        gulikaKaala: "10:42 AM – 12:15 PM",
        yamagandaKaala: "07:47 AM – 09:19 AM"
      }
    ]);

    const map = await fetch90DayAiPanchanga(
      "581326",
      "Gokarna",
      "2026-08-19",
      "kn",
      14.54,
      74.31,
      "dummy-test-key"
    );

    expect(Object.keys(map).length).toBe(90);
    expect(map["2026-08-19"]?.paksha).toBe("ಶುಕ್ಲ ಪಕ್ಷ");

    const cached = getCached90DayPanchanga("581326", "kn", "2026-08-19");
    expect(cached).not.toBeNull();
    expect(cached?.["2026-08-19"]?.date).toBe("2026-08-19");
  });

  it("formats text fields in requested language and numbers in English AM/PM digits", () => {
    const mapEn = computeLocalFallback90DayPanchanga(
      "560001",
      "Bengaluru",
      "2026-08-19",
      "en",
      12.97,
      77.59
    );

    const dayEn = mapEn["2026-08-19"]!;
    expect(dayEn.suryodaya).toMatch(/\d{2}:\d{2}\s+(AM|PM)/);
    expect(dayEn.suryasta).toMatch(/\d{2}:\d{2}\s+(AM|PM)/);

    const mapKn = computeLocalFallback90DayPanchanga(
      "560001",
      "Bengaluru",
      "2026-08-19",
      "kn",
      12.97,
      77.59
    );

    const dayKn = mapKn["2026-08-19"]!;
    // Kannada script check
    expect(/[\u0C80-\u0CFF]/.test(dayKn.paksha)).toBe(true);
    expect(/[\u0C80-\u0CFF]/.test(dayKn.tithi)).toBe(true);
    expect(/[\u0C80-\u0CFF]/.test(dayKn.nakshatra)).toBe(true);
  });

  it("authentically calculates Udaya Tithi at 06:00 AM IST sunrise for 2026-08-26 (Trayodashi, not Chaturdashi)", () => {
    const map = computeLocalFallback90DayPanchanga(
      "581326",
      "Gokarna",
      "2026-08-26",
      "kn",
      14.54,
      74.31
    );

    const today = map["2026-08-26"]!;
    expect(today.paksha).toBe("ಶುಕ್ಲ ಪಕ್ಷ");
    expect(today.tithi).toBe("ತ್ರಯೋದಶಿ");
    expect(today.tithi).not.toBe("ಚತುರ್ದಶಿ");
  });
});
