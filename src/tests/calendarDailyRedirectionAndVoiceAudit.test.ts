import { describe, it, expect } from "vitest";
import { getUniversalBirthDetails, NAKSHATRA_UNIVERSAL_BIRTH_TABLE } from "../utils/universalDevoteeKundli";
import { transliterateName, detectScript } from "../utils/transliterator";
import {
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  generateCompactGoogleCalendarUrlForQR,
  getDailyKaalaTimings,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import { encodeDevoteeToken, decodeDevoteeToken, encodeDateOnlyDevoteeToken } from "../utils/tokenCipher";
import { calculateKundli } from "../core/KundliEngine";

describe("Calendar Daily Redirection, Token Universal Kundli, and Multi-Language Audit", () => {
  describe("1. Universal Devotee Birth Ephemeris Resolution", () => {
    it("preserves devotee DOB when TOB is missing, anchoring TOB to 12:00 (Madhyahna Kaala)", () => {
      const result = getUniversalBirthDetails({
        dob: "1988-11-20",
        tob: undefined,
        name: "Devotee Unknown Time"
      });

      expect(result.dob).toBe("1988-11-20");
      expect(result.tob).toBe("12:00");
      expect(result.isDerived).toBe(false);
    });

    it("preserves devotee DOB when TOB is empty string", () => {
      const result = getUniversalBirthDetails({
        dob: "1975-04-12",
        tob: "   ",
        name: "Another Devotee"
      });

      expect(result.dob).toBe("1975-04-12");
      expect(result.tob).toBe("12:00");
      expect(result.isDerived).toBe(false);
    });

    it("resolves exact DOB and TOB when both are provided", () => {
      const result = getUniversalBirthDetails({
        dob: "2000-01-01",
        tob: "07:15",
        name: "Exact Devotee"
      });

      expect(result.dob).toBe("2000-01-01");
      expect(result.tob).toBe("07:15");
      expect(result.isDerived).toBe(false);
    });

    it("resolves birth parameters from Nakshatra index when neither DOB nor TOB is provided", () => {
      // Test across multiple nakshatras: Rohini (3), Hasta (12), Mula (18), Revati (26)
      for (const nakIdx of [3, 12, 18, 26]) {
        const result = getUniversalBirthDetails({
          dob: undefined,
          tob: undefined,
          nakshatraIndex: nakIdx
        });

        expect(result.isDerived).toBe(true);
        expect(result.nakshatraIndex).toBe(nakIdx);
        expect(result.dob).toBe(NAKSHATRA_UNIVERSAL_BIRTH_TABLE[nakIdx].dob);
        expect(result.tob).toBe(NAKSHATRA_UNIVERSAL_BIRTH_TABLE[nakIdx].tob);

        // Verify that calculateKundli for this derived date lands the Moon on that exact Nakshatra!
        const kundli = calculateKundli({
          name: "Star Devotee",
          birthDate: result.dob,
          birthTime: result.tob,
          latitude: 14.54,
          longitude: 74.31,
          pincode: "581326"
        });
        const moon = kundli.planets.find(p => p.name === "Moon");
        expect(moon).toBeDefined();
        expect(moon?.nakshatra?.index).toBe(nakIdx);
      }
    });

    it("resolves birth parameters from Rashi index when DOB and Nakshatra are unknown", () => {
      const result = getUniversalBirthDetails({
        dob: undefined,
        tob: undefined,
        nakshatraIndex: undefined,
        rashiIndex: 3 // Karka
      });

      expect(result.isDerived).toBe(true);
      expect(result.rashiIndex).toBe(3);
      expect(result.dob).toBeDefined();
      expect(result.tob).toBeDefined();
    });
  });

  describe("2. 5-Language Cross-Script Transliteration", () => {
    it("detects scripts accurately", () => {
      expect(detectScript("ಶ್ರೀರಾಮ ಪಂಡಿತ್")).toBe("kn");
      expect(detectScript("श्रीराम पंडित")).toBe("hi");
      expect(detectScript("శ్రీరామ్ పండిట్")).toBe("te");
      expect(detectScript("ஸ்ரீராம் பண்டிட்")).toBe("ta");
      expect(detectScript("Shreeram Pandit")).toBe("en");
    });

    it("transliterates Priest Name across all 5 languages without corruption", () => {
      const knPriest = "ಶ್ರೀರಾಮ ಪಂಡಿತ್";
      expect(transliterateName(knPriest, "kn")).toBe("ಶ್ರೀರಾಮ ಪಂಡಿತ್");
      expect(transliterateName(knPriest, "hi")).toBe("श्रीराम पंडित");
      expect(transliterateName(knPriest, "te")).toBe("శ్రీరామ్ పండిట్");
      expect(transliterateName(knPriest, "ta")).toBe("ஸ்ரீராம் பண்டிட்");
      expect(transliterateName(knPriest, "en")).toBe("Shreeram Pandit");
    });

    it("transliterates Seva titles (Narayana Bali, Tripindi, Rudrabhisheka) accurately", () => {
      expect(transliterateName("ನಾರಾಯಣ ಬಲಿ", "ta")).toBe("நாராயண பலி");
      expect(transliterateName("ನಾರಾಯಣ ಬಲಿ", "te")).toBe("నారాయణ బలి");
      expect(transliterateName("ನಾರಾಯಣ ಬಲಿ", "hi")).toBe("नारायण बलि");
      expect(transliterateName("ನಾರಾಯಣ ಬಲಿ", "en")).toBe("Narayana Bali");

      expect(transliterateName("ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", "ta")).toBe("திரிபிண்டி ஸ்ராத்தம்");
      expect(transliterateName("ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", "en")).toBe("Tripindi Shradha");

      expect(transliterateName("ರುದ್ರಾಭಿಷೇಕ", "ta")).toBe("ருத்ராபிஷேகம்");
      expect(transliterateName("ರುದ್ರಾಭಿಷೇಕ", "en")).toBe("Rudrabhisheka");
    });

    it("transliterates custom devotee name from Kannada to Tamil and Telugu via phonetic fallback", () => {
      const customName = "ವೆಂಕಟೇಶ";
      const tamilName = transliterateName(customName, "ta");
      expect(tamilName).toBeDefined();
      expect(tamilName.length).toBeGreaterThan(0);
      expect(detectScript(tamilName)).toBe("ta");

      const teluguName = transliterateName(customName, "te");
      expect(teluguName).toBeDefined();
      expect(detectScript(teluguName)).toBe("te");
    });
  });

  describe("3. Calendar Deduplication & Mobile URL Clickability", () => {
    it("deduplicates duplicate date entries in ics generation", () => {
      const sampleDays = [
        calculateDeterministicRhythmDay("2026-09-21", 18, 8, "2026-09-21"),
        calculateDeterministicRhythmDay("2026-09-21", 18, 8, "2026-09-21"), // duplicate day!
        calculateDeterministicRhythmDay("2026-09-22", 18, 8, "2026-09-21")
      ];

      const icsString = generateSevaICalendarString({
        days: sampleDays,
        lang: "kn",
        personName: "Devotee Test",
        priestName: "Shreeram Pandit"
      });

      // Count occurrences of daily VEVENT (identified by UID:baggona-day-)
      const dayEventMatches = icsString.match(/UID:baggona-day-/g);
      expect(dayEventMatches).toHaveLength(2); // Only 2 unique daily events, duplicate removed!
    });

    it("formats sanctum URL with clean isolated lines in .ics description for 100% clickability", () => {
      const sampleDays = [
        calculateDeterministicRhythmDay("2026-09-21", 18, 8, "2026-09-21")
      ];

      const icsString = generateSevaICalendarString({
        days: sampleDays,
        lang: "kn",
        personName: "Devotee Test",
        priestName: "Shreeram Pandit"
      });

      // Check for standalone URL and LOCATION
      expect(icsString).toContain("URL;VALUE=URI:https://");
      expect(icsString).toContain("LOCATION:https://");
      // Check for clean double-newline isolation in DESCRIPTION
      expect(icsString).toMatch(/DESCRIPTION:.*\\n\\nhttps:\/\/.*\\n\\n/);
    });

    it("generates Google Calendar Web Intent with location param and isolated URL", () => {
      const sampleDay = calculateDeterministicRhythmDay("2026-09-21", 18, 8, "2026-09-21");
      const url = generateGoogleCalendarUrl({
        day: sampleDay,
        lang: "kn",
        panditName: "Shreeram Pandit",
        notificationTime: "08:00",
        personName: "Devotee Test"
      });

      expect(url).toContain("https://calendar.google.com/calendar/render");
      expect(url).toContain("action=TEMPLATE");
      expect(url).toContain("location=https%3A%2F%2F"); // location parameter present!
      expect(url).toContain("details=");
    });

    it("generates compact QR Google Calendar URL with details param under 600 char limit", () => {
      const sampleDay = calculateDeterministicRhythmDay("2026-09-21", 18, 8, "2026-09-21");
      const url = generateCompactGoogleCalendarUrlForQR({
        day: sampleDay,
        lang: "kn",
        panditName: "Shreeram Pandit",
        notificationTime: "08:00",
        personName: "Devotee Test"
      });

      expect(url).toContain("details=https%3A%2F%2F");
      expect(url.length).toBeLessThan(600);
    });
  });

  describe("4. Token Decoding & Dynamic Ephemeris Compatibility", () => {
    it("encodes and decodes devotee token for devotee without TOB cleanly", () => {
      const payload = {
        n: "Gowtam Naik",
        nk: 18,
        r: 8,
        g: "ಕಾಶ್ಯಪ",
        p: "Shreeram Pandit",
        d: "2026-09-21",
        dob: "1990-07-15",
        tob: undefined, // Unknown birth time
        l: "kn",
        tm: "08:00",
        pc: "581326",
        lt: 14.54,
        lg: 74.31,
        loc: "Gokarna",
        ph: "9972339362"
      };

      const token = encodeDateOnlyDevoteeToken(payload);
      const decoded = decodeDevoteeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.n).toBe("Gowtam Naik");
      expect(decoded?.nk).toBe(18);
      expect(decoded?.r).toBe(8);
      expect(decoded?.dob).toBe("1990-07-15");

      // Verify that getUniversalBirthDetails retains the exact DOB
      const birth = getUniversalBirthDetails({
        dob: decoded?.dob,
        tob: (decoded as any)?.tob,
        name: decoded?.n,
        nakshatraIndex: decoded?.nk,
        rashiIndex: decoded?.r
      });
      expect(birth.dob).toBe("1990-07-15");
      expect(birth.tob).toBe("12:00");
    });

    it("encodes and decodes token for devotee with unknown DOB and TOB (using Nakshatra/Rashi)", () => {
      const payload = {
        n: "Unknown Star Devotee",
        nk: 3, // Rohini
        r: 1,  // Vrishabha
        g: "ವಿಶ್ವಾಮಿತ್ರ",
        p: "Shreeram Pandit",
        d: "2026-09-21",
        dob: undefined,
        tob: undefined,
        l: "ta",
        tm: "08:00",
        pc: "600001",
        lt: 13.08,
        lg: 80.27,
        loc: "Chennai",
        ph: "9972339362"
      };

      const token = encodeDevoteeToken(payload);
      const decoded = decodeDevoteeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.n).toBe("Unknown Star Devotee");
      expect(decoded?.nk).toBe(3);
      expect(decoded?.r).toBe(1);

      // Verify universal birth resolution accurately reproduces Rohini nakshatra
      const birth = getUniversalBirthDetails({
        dob: decoded?.dob,
        tob: (decoded as any)?.tob,
        name: decoded?.n,
        nakshatraIndex: decoded?.nk,
        rashiIndex: decoded?.r
      });
      expect(birth.nakshatraIndex).toBe(3);
      expect(birth.dob).toBe("1994-01-23");
      expect(birth.isDerived).toBe(true);

      // Verify astronomical timings dynamically computed for Chennai pincode
      const kaala = getDailyKaalaTimings("Sun", "ta", "2026-09-21", 13.08, 80.27, "600001");
      expect(kaala.sunrise).toBeDefined();
      expect(kaala.sunset).toBeDefined();
      expect(kaala.rahu).toBeDefined();
    });
  });
});
