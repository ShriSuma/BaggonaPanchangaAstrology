import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";
import { prepareSampoornaMaster25Data, type SevenLang } from "../services/sampoornaMaster25Service";
import type { SixLang } from "../features/fiveYearPrediction/fiveYearLocale";
import { compute5YearMasterPrediction } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import { generateAntarangaSatya, type AntarangaLang } from "../features/hotelSecret/antarangaService";
import { PDF_DICT, YOGA_LOCALES, KARANA_LOCALES, TATVA_LOCALES } from "../components/instantReading/instantReadingPdfLocale";
import { resolveDevoteeDisplayName } from "../utils/transliterator";

const mockInput: KundliInput = {
  name: "Raghavendra Hegde",
  birthDate: "1988-10-24",
  birthTime: "06:45",
  latitude: 14.5479,
  longitude: 74.3188,
  pincode: "581326",
  gender: "Male",
  maritalStatus: "married",
  childrenStatus: "has_children"
};

const computedKundli = calculateKundli(mockInput);

const KANNADA_REGEX = /[\u0C80-\u0CFF]/;
const ENGLISH_PLANETS_RASHIS = /\b(Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn|Rahu|Ketu|Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i;

describe("Cross-Language Token Purity & Script Leak Audit", () => {
  describe("1. SampoornaMaster25 Service Language Purity (7 Languages)", () => {
    const sevenLanguages: SevenLang[] = ["kn", "mr", "hi", "te", "ta", "ml", "en"];

    sevenLanguages.forEach((lang) => {
      it(`verifies pure token localization for ${lang.toUpperCase()}`, async () => {
        const payload = await prepareSampoornaMaster25Data({
          kundli: computedKundli,
          input: {
            ...mockInput,
            gender: "male",
            maritalStatus: "married",
            childrenStatus: "has_children"
          },
          targetLanguage: lang
        });

        expect(payload).toBeDefined();
        expect(payload.chapters.length).toBe(25);
        expect(payload.targetLanguage).toBe(lang);

        if (lang !== "kn") {
          // Non-Kannada must NEVER contain Kannada script
          expect(payload.lagnaName).not.toMatch(KANNADA_REGEX);
          expect(payload.lagnaLord).not.toMatch(KANNADA_REGEX);
          expect(payload.moonRashi).not.toMatch(KANNADA_REGEX);
          expect(payload.moonLord).not.toMatch(KANNADA_REGEX);
          expect(payload.nakshatraName).not.toMatch(KANNADA_REGEX);
          expect(payload.tithiName).not.toMatch(KANNADA_REGEX);
          expect(payload.weekdayName).not.toMatch(KANNADA_REGEX);
          expect(payload.yogaName).not.toMatch(KANNADA_REGEX);
          expect(payload.karanaName).not.toMatch(KANNADA_REGEX);
          expect(payload.ayanamsha).not.toMatch(KANNADA_REGEX);
          expect(payload.currentMahadasha).not.toMatch(KANNADA_REGEX);
          expect(payload.currentBhukti).not.toMatch(KANNADA_REGEX);
        }

        if (lang === "ml") {
          expect(payload.lagnaName).toMatch(/[\u0D00-\u0D7F]/);
          expect(payload.footerText).toMatch(/[\u0D00-\u0D7F]/);
          expect(payload.footerText).not.toMatch(/[\u0900-\u097F॥।ॐ\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF]/);
        }

        if (lang !== "en") {
          // Regional languages must not leak English planets/rashis into card
          expect(payload.lagnaLord).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(payload.moonLord).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(payload.currentMahadasha).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(payload.currentBhukti).not.toMatch(ENGLISH_PLANETS_RASHIS);
        }

        // Chapters inspection
        payload.chapters.forEach((ch) => {
          if (lang !== "kn") {
            expect(ch.title).not.toMatch(KANNADA_REGEX);
            expect(ch.question).not.toMatch(KANNADA_REGEX);
            ch.paragraphs.forEach((p) => {
              expect(p).not.toMatch(KANNADA_REGEX);
            });
          }
          if (lang === "ml") {
            expect(ch.title).toMatch(/[\u0D00-\u0D7F]/);
            expect(ch.title).not.toMatch(/[\u0900-\u097F॥।ॐ]/);
          }
        });
      });
    });
  });

  describe("2. Five-Year Prediction Engine Language Purity", () => {
    const sixLanguages: SixLang[] = ["kn", "mr", "hi", "te", "ta", "en"];

    sixLanguages.forEach((lang) => {
      it(`verifies 5-Year Engine output purity for ${lang.toUpperCase()}`, () => {
        const result = compute5YearMasterPrediction(
          computedKundli,
          "1988-10-24",
          "06:45",
          lang,
          "Raghavendra Hegde",
          2026,
          { ayanamsa: "lahiri" }
        );

        expect(result).toBeDefined();
        expect(result.years.length).toBe(5);

        if (lang !== "kn") {
          // Non-Kannada must not contain Kannada characters in metadata
          expect(result.lagnaRashi).not.toMatch(KANNADA_REGEX);
          expect(result.lagnaLord).not.toMatch(KANNADA_REGEX);
          expect(result.moonRashi).not.toMatch(KANNADA_REGEX);
          expect(result.moonLord).not.toMatch(KANNADA_REGEX);
          expect(result.nakshatra).not.toMatch(KANNADA_REGEX);
          expect(result.jananaPanchanga?.tithi).not.toMatch(KANNADA_REGEX);
          expect(result.jananaPanchanga?.paksha).not.toMatch(KANNADA_REGEX);
          expect(result.jananaPanchanga?.yoga).not.toMatch(KANNADA_REGEX);
          expect(result.jananaPanchanga?.karana).not.toMatch(KANNADA_REGEX);
          expect(result.jananaPanchanga?.ayanamsha).not.toMatch(KANNADA_REGEX);
        }

        if (lang !== "en") {
          expect(result.lagnaLord).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(result.moonLord).not.toMatch(ENGLISH_PLANETS_RASHIS);
        }
      });
    });
  });

  describe("3. Antaranga Service Language Purity (7 Languages)", () => {
    const sevenLanguages: AntarangaLang[] = ["kn", "mr", "hi", "te", "ta", "ml", "en"];

    sevenLanguages.forEach((lang) => {
      it(`verifies Antaranga Satya output purity for ${lang.toUpperCase()}`, () => {
        const result = generateAntarangaSatya(
          computedKundli,
          lang,
          "Raghavendra Hegde",
          "male",
          "1988-10-24",
          "06:45",
          14.5479,
          74.3188
        );

        expect(result).toBeDefined();

        if (lang !== "kn") {
          expect(result.moonSignName).not.toMatch(KANNADA_REGEX);
          expect(result.nakshatraName).not.toMatch(KANNADA_REGEX);
          expect(result.paragraph1).not.toMatch(KANNADA_REGEX);
          expect(result.paragraph2).not.toMatch(KANNADA_REGEX);
          expect(result.luckyElements?.gemstone).not.toMatch(KANNADA_REGEX);
          expect(result.luckyElements?.luckyDay).not.toMatch(KANNADA_REGEX);
          expect(result.luckyElements?.luckyColor).not.toMatch(KANNADA_REGEX);
          expect(result.luckyElements?.luckyDirection).not.toMatch(KANNADA_REGEX);
        }

        if (lang !== "en") {
          expect(result.moonSignName).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(result.nakshatraName).not.toMatch(ENGLISH_PLANETS_RASHIS);
          expect(result.paragraph1).not.toMatch(/\bOverthinking\b/);
          expect(result.paragraph1).not.toContain("NaN");
          expect(result.luckyElements?.gemstone).not.toMatch(
            lang === "ml" ? /[\u0900-\u0CFF]/ : /[\u0D00-\u0D7F]/
          );
        }

        // Verify Vidya Shree transliteration across all 7 languages never yields NaN or foreign script
        const resolved = resolveDevoteeDisplayName("Vidya Shree", lang);
        expect(resolved).not.toContain("NaN");
        if (lang === "ml") {
          expect(resolved).toMatch(/[\u0D00-\u0D7F]/);
          expect(PDF_DICT.labelLord.ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(PDF_DICT.labelCaution.ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(YOGA_LOCALES["ಸೌಭಾಗ್ಯ"].ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(YOGA_LOCALES["ಅತಿಗಂಡ"].ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(KARANA_LOCALES["ವಣಿಜ"].ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(KARANA_LOCALES["ಶಕುನಿ"].ml).not.toMatch(/[\u0B80-\u0CFF]/);
          expect(TATVA_LOCALES["ಜಲ"].ml).not.toMatch(/[\u0B80-\u0CFF]/);
        }
        if (lang === "ta") {
          expect(YOGA_LOCALES["ಬ್ರಹ್ಮ"].ta).not.toMatch(/[a-zA-Z]/);
          expect(PDF_DICT.brandBanner.ta).not.toMatch(/[॥।ॐ]/);
        }
      });
    });
  });
});
