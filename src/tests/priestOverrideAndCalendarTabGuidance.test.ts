import { describe, it, expect } from "vitest";
import { getOrComputeDinaBhavishya } from "../features/seva/dinaBhavishyaEngine";
import { getDailyActionableGuidance } from "../features/seva/sevaPresentation";
import { generateSevaICalendarString, generateGoogleCalendarUrl } from "../features/seva/icsCalendarGenerator";
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import { calculateKundli } from "../core/KundliEngine";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import type { SevaLang } from "../features/seva/sevaLocale";

describe("Priest Override Cleanliness, Dina Bhavishya & Calendar Tab Audit", () => {
  const dummyDay: RhythmDay = {
    ymd: "2026-09-21",
    weekday: 1, // Monday
    dayOfMonth: 21,
    monthIndex: 8,
    year: 2026,
    dayLord: "Moon",
    bhuktiLord: null,
    energyScore: 88,
    band: "high",
    arthaScore: 80,
    isMoneyDay: false,
    isChandrashtama: false,
    isJanmaNakshatraDay: false,
    isEkadashi: false,
    isPurnima: false,
    isAmavasya: false,
    isPradosha: false,
    isSankashti: false,
    isPoojaDay: false,
    luckyNumbers: [2, 7],
    luckyColour: "white",
    luckyDirection: "northwest",
    moonRashiIndex: 3, // Kataka
    moonNakshatraIndex: 7, // Pushya
    tithiNumber: 10,
    tithiInPaksha: 10,
    paksha: "shukla",
    tithiGroup: "bhadra",
    tara: {
      tara: 2,
      count: 2,
      score: 90,
      isFavourable: true,
      isDifficult: false
    },
    chandra: {
      house: 11,
      score: 95,
      isChandrashtama: false,
      isFavourable: true
    }
  };

  describe("1. Priest Override Cleanliness in Dina Bhavishya across all 5 languages", () => {
    const overriddenPriest = "ವೆಂಕಟರಮಣ ಪಂಡಿತ್";

    const languages: SevaLang[] = ["kn", "hi", "te", "ta", "en"];

    languages.forEach((lang) => {
      it(`[${lang}] should use overridden priest name and NOT leak 'Shreeram Pandit' / 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್'`, async () => {
        const payload = await getOrComputeDinaBhavishya({
          targetDateRequested: "2026-09-21",
          devoteeName: "Naveen Sharma",
          birthDate: "1990-05-15",
          birthTime: "08:30",
          natalMoonRashi: 3,
          natalNakshatra: 7,
          lang,
          priestName: overriddenPriest,
          forceRegenerate: true
        });

        expect(payload).toBeDefined();
        expect(payload.priestBlessing).toBeDefined();

        // Must NOT leak default priest name
        expect(payload.priestBlessing).not.toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
        expect(payload.priestBlessing).not.toContain("Shreeram Pandit");

        // Must contain the overridden priest's localized or original name
        if (lang === "kn") {
          expect(payload.priestBlessing).toContain("ವೆಂಕಟರಮಣ ಪಂಡಿತ್");
        } else if (lang === "en") {
          expect(payload.priestBlessing).toContain("Venkataramana Pandit");
        }
      });
    });

    it("should default to Shreeram Pandit when no override is passed", async () => {
      const payloadKn = await getOrComputeDinaBhavishya({
        targetDateRequested: "2026-09-21",
        devoteeName: "Naveen Sharma",
        birthDate: "1990-05-15",
        birthTime: "08:30",
        natalMoonRashi: 3,
        natalNakshatra: 7,
        lang: "kn",
        forceRegenerate: true
      });
      expect(payloadKn.priestBlessing).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");

      const payloadEn = await getOrComputeDinaBhavishya({
        targetDateRequested: "2026-09-21",
        devoteeName: "Naveen Sharma",
        birthDate: "1990-05-15",
        birthTime: "08:30",
        natalMoonRashi: 3,
        natalNakshatra: 7,
        lang: "en",
        forceRegenerate: true
      });
      expect(payloadEn.priestBlessing).toContain("Shreeram Pandit");
    });
  });

  describe("2. Universal Devotee Kundli parity for Full DOB+TOB vs Date-Only", () => {
    it("computes Moon Nakshatra & Rashi accurately when only DOB is provided", () => {
      const birthDetails = getUniversalBirthDetails({
        dob: "1992-08-15"
      });

      expect(birthDetails.dob).toBe("1992-08-15");
      expect(birthDetails.isDerived).toBe(false);
      expect(birthDetails.nakshatraIndex).toBeDefined();
      expect(birthDetails.rashiIndex).toBeDefined();
      expect(birthDetails.nakshatraIndex).toBeGreaterThanOrEqual(0);
      expect(birthDetails.nakshatraIndex).toBeLessThanOrEqual(26);
      expect(birthDetails.rashiIndex).toBeGreaterThanOrEqual(0);
      expect(birthDetails.rashiIndex).toBeLessThanOrEqual(11);
    });

    it("computes Lagna, Moon Nakshatra & Rashi when DOB and TOB are provided", () => {
      const birthDetails = getUniversalBirthDetails({
        dob: "1992-08-15",
        tob: "10:30"
      });

      expect(birthDetails.dob).toBe("1992-08-15");
      expect(birthDetails.tob).toBe("10:30");
      expect(birthDetails.isDerived).toBe(false);
      expect(birthDetails.nakshatraIndex).toBeDefined();
      expect(birthDetails.rashiIndex).toBeDefined();
    });
  });

  describe("3. 4-Grid Actionable Guidance authentic Bhava linkages", () => {
    it("synthesizes 4th house (Vahana Bhava) in Card 1 and 2nd/11th houses in Card 2", () => {
      const kundli = calculateKundli({
        birthDate: "1995-10-24",
        birthTime: "06:15",
        latitude: 14.5479,
        longitude: 74.3187,
        name: "Siddhartha"
      });

      const cardsKn = getDailyActionableGuidance(dummyDay, "kn", kundli);
      expect(cardsKn.length).toBeGreaterThanOrEqual(2);

      const vahanaCard = cardsKn.find((c) => c.icon === "🚗");
      const dhanaCard = cardsKn.find((c) => c.icon === "💰");

      expect(vahanaCard).toBeDefined();
      expect(dhanaCard).toBeDefined();

      // Card 1 must link to 4th house Vahana Bhava
      expect(vahanaCard!.text).toMatch(/೪ನೇ ವಾಹನ ಭಾವ/);

      // Card 2 must link to 2nd Dhana & 11th Labha Bhavas
      expect(dhanaCard!.text).toMatch(/೨ನೇ ಧನ ಭಾವ.*೧೧ನೇ ಲಾಭ ಭಾವ/);
    });

    it("works in all 5 languages without English token leakage", () => {
      const kundli = calculateKundli({
        birthDate: "1995-10-24",
        birthTime: "06:15",
        latitude: 14.5479,
        longitude: 74.3187,
        name: "Siddhartha"
      });

      const languages: SevaLang[] = ["kn", "hi", "te", "ta", "en"];
      languages.forEach((lang) => {
        const cards = getDailyActionableGuidance(dummyDay, lang, kundli);
        const vahanaCard = cards.find((c) => c.icon === "🚗");
        const dhanaCard = cards.find((c) => c.icon === "💰");

        expect(vahanaCard).toBeDefined();
        expect(dhanaCard).toBeDefined();
        expect(vahanaCard!.text.trim().length).toBeGreaterThan(10);
        expect(dhanaCard!.text.trim().length).toBeGreaterThan(10);
      });
    });
  });

  describe("4. .ICS & Calendar CTA Button & Redirection", () => {
    it("generates ICS event pointing to &tab=bhavishya and renders CTA button instead of raw URLs", () => {
      const icsString = generateSevaICalendarString({
        days: [dummyDay],
        personName: "Ananya Hegde",
        birthRashiIndex: 3,
        birthNakshatraIndex: 7,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app"
      });

      expect(icsString).toContain("&tab=bhavishya");
      expect(icsString).toContain("🔮 ಇಂದಿನ ದಿನ ಭವಿಷ್ಯವನ್ನು ವೀಕ್ಷಿಸಿ");
    });

    it("generates Google Calendar URL with &tab=bhavishya and CTA button", () => {
      const gcalUrl = generateGoogleCalendarUrl({
        day: dummyDay,
        panditName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        personName: "Ananya Hegde",
        birthRashiIndex: 3,
        birthNakshatraIndex: 7,
        lang: "kn",
        webAppBaseUrl: "https://baggona.app"
      });

      expect(gcalUrl).toContain("tab%3Dbhavishya");
    });
  });
});
