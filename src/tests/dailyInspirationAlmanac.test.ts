import { describe, it, expect } from "vitest";
import {
  getDayOfYear,
  getDailyInspiration,
  buildCleanDailyWhatsAppShareText,
  type SupportedLang
} from "../features/darshana/dailyInspirationAlmanac";

describe("365-Day Daily Inspiration & Clean WhatsApp Share Almanac", () => {
  it("computes deterministic day of year across different dates", () => {
    const jan1 = new Date(2026, 0, 1);
    const midYear = new Date(2026, 5, 15);
    const dec31 = new Date(2026, 11, 31);

    expect(getDayOfYear(jan1)).toBe(1);
    expect(getDayOfYear(midYear)).toBeGreaterThan(150);
    expect(getDayOfYear(dec31)).toBe(365);
  });

  it("returns distinct rich inspiration, shlokas, good deeds and themes for 365 days", () => {
    const dates = [
      new Date(2026, 0, 1),
      new Date(2026, 1, 14),
      new Date(2026, 2, 21),
      new Date(2026, 7, 15),
      new Date(2026, 11, 25)
    ];

    dates.forEach((d) => {
      const insp = getDailyInspiration(d);
      expect(insp.deitySource).toBeTruthy();
      expect(insp.shlokaText.kn).toBeTruthy();
      expect(insp.shlokaText.sa).toBeTruthy();
      expect(insp.theme.bgGradient).toBeTruthy();
      expect(insp.theme.borderGold).toBeTruthy();

      // Check 5 languages
      (["kn", "en", "hi", "te", "ta"] as SupportedLang[]).forEach((lang) => {
        expect(insp.goodMorningVibe[lang]).toBeTruthy();
        expect(insp.shlokaMeaning[lang]).toBeTruthy();
        expect(insp.goodDeedOfTheDay[lang]).toBeTruthy();
        expect(insp.motivationalQuote[lang]).toBeTruthy();
      });
    });
  });

  it("builds clean WhatsApp share text WITHOUT leaking private URLs or user tokens", () => {
    const textKn = buildCleanDailyWhatsAppShareText("2026-09-01", "kn", "ಶುಕ್ಲ ಪಂಚಮಿ", "ಅನುರಾಧ");
    const textEn = buildCleanDailyWhatsAppShareText("2026-09-01", "en", "Shukla Panchami", "Anuradha");

    // Must have Baggona Panchanga branding
    expect(textKn).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
    expect(textKn).toContain("ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ");
    expect(textKn).toContain("ಇಂದಿನ ಪುಣ್ಯ ಸಂಕಲ್ಪ");
    expect(textEn).toContain("Baggona Panchanga");
    expect(textEn).toContain("Sacred Shloka");

    // Must NOT contain sensitive URL schemes, localhost, or query tokens
    expect(textKn).not.toContain("http://");
    expect(textKn).not.toContain("https://");
    expect(textKn).not.toContain("token=");
    expect(textKn).not.toContain("bhaktaru=");
    expect(textEn).not.toContain("http://");
    expect(textEn).not.toContain("https://");
  });
});
