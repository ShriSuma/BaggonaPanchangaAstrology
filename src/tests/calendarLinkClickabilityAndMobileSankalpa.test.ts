import { describe, it, expect } from "vitest";
import { generateGoogleCalendarUrl, generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";
import {
  SANKALPA_PRESETS,
  getPresetTitle,
  getPresetDescription,
  getPresetSanskritPhrasing
} from "../features/sankalpa/sankalpaStore";

import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Calendar 1-Click URL Clickability & Multi-Language Sankalpa", () => {
  const mockDay = {
    ymd: "2026-04-14",
    dayLord: "Tue",
    moonRashiIndex: 0,
    moonNakshatraIndex: 0,
    paksha: "Krishna",
    tithiNumber: 12,
    band: "high" as const,
    isChandrashtama: false,
    isAmavasya: false,
    isPurnima: false,
    isSankranti: false,
    energyScore: 88,
    luckyNumbers: [1, 9, 3]
  } as unknown as RhythmDay;

  it("places direct clickable link and isolated URL at the very top of Google Calendar details", () => {
    const gUrlKn = generateGoogleCalendarUrl({
      day: mockDay,
      lang: "kn",
      panditName: "Shreeram Pandit",
      notificationTime: "07:30",
      personName: "Nagaraj Rao"
    });

    // Parse details query param
    const parsed = new URL(gUrlKn);
    const details = parsed.searchParams.get("details") || "";

    // The first few lines must contain the direct click prompt, HTML <a> tag, and isolated bare URL
    const lines = details.split("\n");
    expect(lines[0]).toContain("👉 ನೇರ ಲೈವ್ ದರ್ಶನ ಪಡೆಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಒತ್ತಿ");
    expect(lines[1]).toContain("<a href=\"https://");
    expect(lines[1]).toContain("ಲೈವ್ ದರ್ಶನ ಹಾಗೂ ಇಂದಿನ ಪಂಚಾಂಗ");
    expect(lines[3]).toMatch(/^https:\/\/.*\/daily\?token=/);

    // Bare URL on its own line allows Android/Samsung Linkify parser to make it a 1-click tap
    expect(lines[2]).toBe("");
    expect(lines[4]).toBe("");

    // Details must also include full 90-day ICS import
    expect(details).toContain("action=ics90");
  });

  it("places direct clickable prompt at top in Telugu, Tamil, Hindi, and English", () => {
    const languages = [
      { code: "te", prompt: "👉 ప్రత్యక్ష దర్శనం కొరకు క్రింది లింక్‌పై క్లిక్ చేయండి" },
      { code: "ta", prompt: "👉 நேரடி தரிசனத்திற்கு கீழே உள்ள இணைப்பை கிளிக் செய்யவும்" },
      { code: "hi", prompt: "👉 सीधे लाइव दर्शन के लिए नीचे दिए लिंक पर क्लिक करें" },
      { code: "en", prompt: "👉 Click the link below to enter Live Darshana" }
    ];

    for (const { code, prompt } of languages) {
      const gUrl = generateGoogleCalendarUrl({
        day: mockDay,
        lang: code,
        panditName: "Shreeram Pandit",
        personName: "Devotee"
      });
      const parsed = new URL(gUrl);
      const details = parsed.searchParams.get("details") || "";
      expect(details.startsWith(prompt)).toBe(true);
    }
  });

  it("places clickable URL at top of iCalendar DESCRIPTION and preserves HTML styles in X-ALT-DESC", () => {
    const ics = generateSevaICalendarString({
      days: [mockDay],
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Nagaraj Rao"
    });

    // DESCRIPTION: must have prompt and URL at top
    expect(ics).toMatch(/DESCRIPTION:👉 ನೇರ ಲೈವ್ ದರ್ಶನ ಪಡೆಯಲು ಕೆಳಗಿನ ಲಿಂಕ್ ಒತ್ತಿ/);

    // X-ALT-DESC;FMTTYPE=text/html: must have uncorrupted CSS styles (semicolons NOT escaped to \;)
    expect(ics).toContain("X-ALT-DESC;FMTTYPE=text/html:");
    // Semicolons in style attributes must remain intact (not \;)
    expect(ics).toContain("style=\"font-family:sans-serif; background-color:#1c0a00;");
    expect(ics).not.toContain("font-family:sans-serif\\;");
    expect(ics).toContain("<a href=\"https://");
  });

  it("provides 5-language localization for all Vedic Sankalpa presets", () => {
    const langCodes = ["kn", "te", "ta", "hi", "en"] as const;

    for (const preset of SANKALPA_PRESETS) {
      for (const lang of langCodes) {
        const title = getPresetTitle(preset, lang);
        const desc = getPresetDescription(preset, lang);
        const phr = getPresetSanskritPhrasing(preset, lang);

        expect(title).toBeDefined();
        expect(title.length).toBeGreaterThan(0);
        expect(desc).toBeDefined();
        expect(desc.length).toBeGreaterThan(0);
        expect(phr).toBeDefined();
        expect(phr.length).toBeGreaterThan(0);
      }
    }
  });

  it("supports multi-language custom prayer Sanskrit phrasing across all 5 languages", () => {
    const customPreset = SANKALPA_PRESETS.find((p) => p.category === "custom")!;
    expect(customPreset).toBeDefined();

    const knPhrasing = getPresetSanskritPhrasing(customPreset, "kn");
    expect(knPhrasing).toContain("ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ");

    const tePhrasing = getPresetSanskritPhrasing(customPreset, "te");
    expect(tePhrasing).toContain("సమస్త మనోరథ సిద్ధ్యర్థం");

    const taPhrasing = getPresetSanskritPhrasing(customPreset, "ta");
    expect(taPhrasing.length).toBeGreaterThan(0);

    const hiPhrasing = getPresetSanskritPhrasing(customPreset, "hi");
    expect(hiPhrasing).toContain("समस्त मनोरथ सिद्ध्यर्थं");

    const enPhrasing = getPresetSanskritPhrasing(customPreset, "en");
    expect(enPhrasing.toLowerCase()).toContain("samasta manoratha");
  });
});
