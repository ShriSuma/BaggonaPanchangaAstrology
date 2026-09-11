import { describe, it, expect } from 'vitest';
import {
  analyzeKundali,
  buildDynamicGocharaFallback,
  type KundaliAnalysisInput
} from '../features/premiumPdf/dynamicBhavishyaEngine';
import { cleanEnglishFromRegionalText } from '../features/premiumPdf/premiumPdfLocale';

const createMockInput = (lang: string, saturnHouse: number = 7, jupiterHouse: number = 11): KundaliAnalysisInput => ({
  lang,
  name: "Devotee",
  gender: "Male",
  ageYears: 32,
  lagnaRashiIndex: 3, // Cancer
  moonRashiIndex: 5,  // Virgo (Kanya)
  moonNakshatraIndex: 12, // Hasta
  natalPlanets: [
    { graha: "Moon", rashiIndex: 5, house: 3, retrograde: false, debilitated: false, exalted: false },
    { graha: "Jupiter", rashiIndex: 2, house: 12, retrograde: false, debilitated: false, exalted: false },
    { graha: "Saturn", rashiIndex: 11, house: 9, retrograde: false, debilitated: false, exalted: false },
    { graha: "Sun", rashiIndex: 4, house: 2, retrograde: false, debilitated: false, exalted: false },
    { graha: "Mars", rashiIndex: 0, house: 10, retrograde: false, debilitated: false, exalted: false },
    { graha: "Mercury", rashiIndex: 4, house: 2, retrograde: false, debilitated: false, exalted: false },
    { graha: "Venus", rashiIndex: 3, house: 1, retrograde: false, debilitated: false, exalted: false },
    { graha: "Rahu", rashiIndex: 11, house: 9, retrograde: false, debilitated: false, exalted: false },
    { graha: "Ketu", rashiIndex: 5, house: 3, retrograde: false, debilitated: false, exalted: false }
  ],
  transits: [
    { graha: "Saturn", rashiIndex: (5 + saturnHouse - 1) % 12, houseFromMoon: saturnHouse },
    { graha: "Jupiter", rashiIndex: (5 + jupiterHouse - 1) % 12, houseFromMoon: jupiterHouse },
    { graha: "Rahu", rashiIndex: 11, houseFromMoon: 7 },
    { graha: "Ketu", rashiIndex: 5, houseFromMoon: 1 }
  ],
  mahaLord: "Jupiter",
  bhuktiLord: "Saturn"
});

describe('Gochara Language Purity and Depth Verification', () => {
  it('Kannada (kn) Gochara produces 3 rich cards with zero English letters or parentheticals', () => {
    const chart = analyzeKundali(createMockInput('kn', 7, 11));
    const items = buildDynamicGocharaFallback(chart);

    expect(items.length).toBe(3);

    items.forEach((item, idx) => {
      // 1. Zero English letters in title, impact, and remedy
      expect(/[a-zA-Z]/.test(item.name), `Item ${idx} name "${item.name}" must not contain English characters`).toBe(false);
      expect(/[a-zA-Z]/.test(item.impact), `Item ${idx} impact must not contain English characters`).toBe(false);
      if (item.remedy) {
        expect(/[a-zA-Z]/.test(item.remedy), `Item ${idx} remedy must not contain English characters`).toBe(false);
      }

      // 2. Substantial depth: at least 2 distinct paragraphs and > 200 chars
      const paragraphs = item.impact.split(/\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length, `Item ${idx} must contain at least 2 substantial paragraphs`).toBeGreaterThanOrEqual(2);
      expect(item.impact.trim().length, `Item ${idx} impact length must be > 200 chars`).toBeGreaterThan(200);

      // 3. Remedy must be present with actionable guidance
      expect(item.remedy).toBeDefined();
      expect(item.remedy!.trim().length).toBeGreaterThan(50);
    });

    // Check specific title names in Kannada
    expect(items[0].name).toBe("ಶನಿ ಭಗವಾನರ ಗೋಚಾರ ಫಲ");
    expect(items[1].name).toBe("ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಗೋಚಾರ ಫಲ");
    expect(items[2].name).toBe("ರಾಹು ಹಾಗೂ ಕೇತು ಛಾಯಾಗ್ರಹಗಳ ಗೋಚಾರ ಫಲ");
  });

  it('Hindi (hi) Gochara produces 3 rich cards with zero English letters', () => {
    const chart = analyzeKundali(createMockInput('hi', 8, 9));
    const items = buildDynamicGocharaFallback(chart);

    expect(items.length).toBe(3);

    items.forEach((item, idx) => {
      expect(/[a-zA-Z]/.test(item.name), `Item ${idx} name must not contain English characters`).toBe(false);
      expect(/[a-zA-Z]/.test(item.impact), `Item ${idx} impact must not contain English characters`).toBe(false);
      if (item.remedy) {
        expect(/[a-zA-Z]/.test(item.remedy), `Item ${idx} remedy must not contain English characters`).toBe(false);
      }

      const paragraphs = item.impact.split(/\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(item.impact.trim().length).toBeGreaterThan(200);
    });
  });

  it('Telugu (te) Gochara produces 3 rich cards with zero English letters', () => {
    const chart = analyzeKundali(createMockInput('te', 1, 5));
    const items = buildDynamicGocharaFallback(chart);

    expect(items.length).toBe(3);

    items.forEach((item, idx) => {
      expect(/[a-zA-Z]/.test(item.name)).toBe(false);
      expect(/[a-zA-Z]/.test(item.impact)).toBe(false);
      if (item.remedy) {
        expect(/[a-zA-Z]/.test(item.remedy)).toBe(false);
      }
      expect(item.impact.trim().length).toBeGreaterThan(200);
    });
  });

  it('Tamil (ta) Gochara produces 3 rich cards with zero English letters', () => {
    const chart = analyzeKundali(createMockInput('ta', 4, 2));
    const items = buildDynamicGocharaFallback(chart);

    expect(items.length).toBe(3);

    items.forEach((item, idx) => {
      expect(/[a-zA-Z]/.test(item.name)).toBe(false);
      expect(/[a-zA-Z]/.test(item.impact)).toBe(false);
      if (item.remedy) {
        expect(/[a-zA-Z]/.test(item.remedy)).toBe(false);
      }
      expect(item.impact.trim().length).toBeGreaterThan(200);
    });
  });

  it('English (en) retains test contract phrases and deep structure', () => {
    // Test with Saturn in 2nd (Sade Sati) and Jupiter in 11th (Guru Bala)
    const chart = analyzeKundali(createMockInput('en', 2, 11));
    const items = buildDynamicGocharaFallback(chart);

    expect(items.length).toBe(3);
    // Preserves contract for Guru Bala
    expect(items[1].impact).toContain("Guru Bala is active");
    // Preserves contract for Saturn Sade Sati
    expect(items[0].impact).toContain("heightened karmic discipline");

    items.forEach((item, idx) => {
      const paragraphs = item.impact.split(/\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(item.impact.trim().length).toBeGreaterThan(200);
    });

    // Also test Kantaka Shani in English (house 7)
    const chartKantaka = analyzeKundali(createMockInput('en', 7, 5));
    const kantakaItems = buildDynamicGocharaFallback(chartKantaka);
    expect(kantakaItems[0].impact).toContain("Kantaka Shani");
    expect(kantakaItems[1].impact).toContain("Guru Bala is active");
  });

  it('cleanEnglishFromRegionalText strips transit headers, brackets, and Latin artifacts in Indic mode', () => {
    const dirtyKn = "ಶನಿ ಗೋಚಾರ ಸಂಚಾರ (Saturn Transit) Saturn is transiting the 7th house. ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ.";
    const cleanedKn = cleanEnglishFromRegionalText(dirtyKn, 'kn');
    expect(/[a-zA-Z]/.test(cleanedKn)).toBe(false);
    expect(cleanedKn).not.toContain("Saturn Transit");
    expect(cleanedKn).toContain("ಶನಿ ಗೋಚಾರ ಸಂಚಾರ");
    expect(cleanedKn).toContain("ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದಾನೆ");

    const dirtyHi = "गुरु गोचर संचार (Jupiter Transit) देवगुरु बृहस्पति की कृपा बनी रहेगी।";
    const cleanedHi = cleanEnglishFromRegionalText(dirtyHi, 'hi');
    expect(/[a-zA-Z]/.test(cleanedHi)).toBe(false);
    expect(cleanedHi).not.toContain("Jupiter Transit");
    expect(cleanedHi).toContain("गुरु गोचर संचार");
  });
});
