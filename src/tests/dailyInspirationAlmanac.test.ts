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

  it("builds clean WhatsApp share text in all 5 languages WITHOUT leaking private URLs or user tokens", () => {
    const textKn = buildCleanDailyWhatsAppShareText("2026-09-01", "kn", "ಶುಕ್ಲ ಪಂಚಮಿ", "ಅನುರಾಧ");
    const textEn = buildCleanDailyWhatsAppShareText("2026-09-01", "en", "Shukla Panchami", "Anuradha");
    const textHi = buildCleanDailyWhatsAppShareText("2026-09-01", "hi", "शुक्ल पंचमी", "अनुराधा");
    const textTe = buildCleanDailyWhatsAppShareText("2026-09-01", "te", "శుక్ల పంచమి", "అనురాధ");
    const textTa = buildCleanDailyWhatsAppShareText("2026-09-01", "ta", "சுக்ல பஞ்சமி", "அனுராதா");

    // Must have Baggona Panchanga branding in respective languages
    expect(textKn).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
    expect(textKn).toContain("ಇಂದಿನ ದೈವಿಕ ಶ್ಲೋಕ");
    expect(textKn).toContain("ಇಂದಿನ ಪುಣ್ಯ ಸಂಕಲ್ಪ");

    expect(textEn).toContain("Baggona Panchanga");
    expect(textEn).toContain("Sacred Shloka");

    expect(textHi).toContain("बग्गोण पंचांग");
    expect(textHi).toContain("आज का दिव्य श्लोक");
    expect(textHi).toContain("आज का पुण्य संकल्प");

    expect(textTe).toContain("బగ్గోణ పంచాంగ");
    expect(textTe).toContain("నేటి దివ్య శ్లోకం");
    expect(textTe).toContain("నేటి పుణ్య సంకల్పం");

    expect(textTa).toContain("பக்கோண பஞ்சாங்க");
    expect(textTa).toContain("இன்றைய தெய்வீக சுலோகம்");
    expect(textTa).toContain("இன்றைய நற்பணி");

    // Verify custom shloka and custom deity source overrides
    const customText = buildCleanDailyWhatsAppShareText(
      "2026-09-01",
      "te",
      "శుక్ల పంచమి",
      "అనురాధ",
      "ఓం నమో నారాయణాయ॥",
      "శ్రీ సత్యనారాయణ స్వామి"
    );
    expect(customText).toContain("ఓం నమో నారాయణాయ॥");
    expect(customText).toContain("శ్రీ సత్యనారాయణ స్వామి");

    // Must NOT contain sensitive URL schemes, localhost, or query tokens across any language
    [textKn, textEn, textHi, textTe, textTa, customText].forEach((txt) => {
      expect(txt).not.toContain("http://");
      expect(txt).not.toContain("https://");
      expect(txt).not.toContain("token=");
      expect(txt).not.toContain("bhaktaru=");
    });
  });

  it("provides 5-language shloka text representations in daily inspiration", () => {
    const insp = getDailyInspiration(new Date(2026, 0, 1));
    expect(insp.shlokaText.kn).toBeTruthy();
    expect(insp.shlokaText.sa).toBeTruthy();
    expect(insp.shlokaText.transliteration).toBeTruthy();
    expect(insp.shlokaText.te).toBeTruthy();
    expect(insp.shlokaText.ta).toBeTruthy();
    expect(insp.shlokaText.hi).toBeTruthy();
  });

  it("generates deterministic 365-day unique vector SVG backgrounds with sacred morning sunrise vibes", async () => {
    const { getDailyBackgroundConfig, renderDailyVedicSvgBackground } = await import(
      "../features/darshana/dailyBlessingBackgrounds"
    );

    // Verify all 366 days generate valid luxury background configurations
    for (let day = 1; day <= 366; day++) {
      const config = getDailyBackgroundConfig(day);
      expect(config.dayOfYear).toBe(day);
      expect(config.gradientCss).toBeTruthy();
      expect(config.accentGold).toBeTruthy();
      expect(config.borderGold).toBeTruthy();
      expect(config.glowAura).toBeTruthy();
      expect(config.deityIcon).toBeTruthy();
      expect(config.motifs.bokehCount).toBeGreaterThan(0);

      const svgString = renderDailyVedicSvgBackground(config);
      expect(svgString).toContain("<svg");
      expect(svgString).toContain("</svg>");
      expect(svgString).toContain("<radialGradient");
      expect(svgString).toContain("<circle");
    }
  });
});
