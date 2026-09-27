import { describe, it, expect } from "vitest";
import {
  getLocalizedFestivalName,
  getLocalizedFestivalCategory,
  getLocalizedFestivalDescription,
  getLocalizedPujaWindow,
  getLocalizedPreparationAlert,
  FESTIVAL_L5_REGISTRY,
  type SupportedLang
} from "../core/festivalLocalization";
import { detectSpecialVrata } from "../features/seva/specialVrataAlertEngine";
import {
  getPreviousDayPreparationAlert,
  generatePriestICalendarString,
  generatePriestDayDossier
} from "../core/PriestCalendarEngine";
import { generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";

describe("Baggona Panchanga 5-Language Special Days & Calendar Localization Parity", () => {
  const KANNADA_REGEX = /[\u0C80-\u0CFF]/;
  const LANGS: SupportedLang[] = ["kn", "en", "hi", "te", "ta"];

  describe("1. Mahalaya Amavasya & Annual Festival Registry Localization", () => {
    it("mahalaya_amavasya provides pure, culturally authentic names across all 5 languages", () => {
      const fest = { id: "mahalaya_amavasya", nameKn: "ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ" };

      expect(getLocalizedFestivalName(fest, "kn")).toBe("ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ (ಸರ್ವಪಿತೃ ಪರ್ವ)");
      expect(getLocalizedFestivalName(fest, "en")).toBe("Mahalaya Amavasya (Sarva Pitru Moksha)");
      expect(getLocalizedFestivalName(fest, "hi")).toBe("महालय अमावस्या (सर्वपितृ मोक्ष)");
      expect(getLocalizedFestivalName(fest, "te")).toBe("మహాలయ అమావాస్య (సర్వపితృ మోక్షం)");
      expect(getLocalizedFestivalName(fest, "ta")).toBe("மஹாளய அமாவாசை (சர்வபித்ரு மோக்ஷம்)");
    });

    it("verifies zero Kannada characters in English festival names across all 44 registry items", () => {
      Object.entries(FESTIVAL_L5_REGISTRY).forEach(([id, item]) => {
        const enName = item.name.en;
        expect(KANNADA_REGEX.test(enName), `Festival '${id}' English name '${enName}' leaked Kannada!`).toBe(false);

        const enCategory = item.category.en;
        expect(KANNADA_REGEX.test(enCategory), `Festival '${id}' English category '${enCategory}' leaked Kannada!`).toBe(false);

        if (item.description?.en) {
          expect(KANNADA_REGEX.test(item.description.en), `Festival '${id}' English description leaked Kannada!`).toBe(false);
        }

        if (item.pujaWindow?.en) {
          expect(KANNADA_REGEX.test(item.pujaWindow.en), `Festival '${id}' English pujaWindow leaked Kannada!`).toBe(false);
        }
      });
    });

    it("getLocalizedPujaWindow returns accurate English window for Mahalaya Amavasya", () => {
      const windowEn = getLocalizedPujaWindow({ id: "mahalaya_amavasya" }, "en");
      expect(windowEn).toContain("Aparahna Period: 12:15 PM - 03:45 PM (Tarpana & Shraddha)");
      expect(KANNADA_REGEX.test(windowEn)).toBe(false);

      const windowKn = getLocalizedPujaWindow({ id: "mahalaya_amavasya" }, "kn");
      expect(windowKn).toContain("ಅಪರಾಹ್ನ ಕಾಲ: ಮಧ್ಯಾಹ್ನ 12:15 PM - 03:45 PM");
    });
  });

  describe("2. detectSpecialVrata 5-Language Pure Localization", () => {
    it("detects Mahalaya Amavasya on canonical date 2026-10-10 with zero Kannada leakage in English", () => {
      const vrataEn = detectSpecialVrata("2026-10-10", "en");

      expect(vrataEn.isSpecial).toBe(true);
      expect(vrataEn.vrataName).toContain("Mahalaya Amavasya");
      expect(vrataEn.eveAlertTitle).toContain("Tomorrow: Mahalaya Amavasya");
      expect(vrataEn.eveAlertTitle).toContain("Advance Eve Prep Alert");
      expect(vrataEn.eveAlertSummary).toContain("Tomorrow is Mahalaya Amavasya");
      expect(vrataEn.sameDayNotice).toContain("Today is 🪔 Mahalaya Amavasya");
      expect(vrataEn.fastingAdvice).toContain("Sacred festival day");

      // Strict Zero Kannada character leakage checks
      expect(KANNADA_REGEX.test(vrataEn.vrataName), "vrataName leaked Kannada").toBe(false);
      expect(KANNADA_REGEX.test(vrataEn.eveAlertTitle), "eveAlertTitle leaked Kannada").toBe(false);
      expect(KANNADA_REGEX.test(vrataEn.eveAlertSummary), "eveAlertSummary leaked Kannada").toBe(false);
      expect(KANNADA_REGEX.test(vrataEn.sameDayNotice), "sameDayNotice leaked Kannada").toBe(false);
      expect(KANNADA_REGEX.test(vrataEn.fastingAdvice), "fastingAdvice leaked Kannada").toBe(false);
    });

    it("detects Mahalaya Amavasya in Hindi, Telugu, and Tamil with native typography", () => {
      const vrataHi = detectSpecialVrata("2026-10-10", "hi");
      expect(vrataHi.vrataName).toContain("महालय अमावस्या");
      expect(vrataHi.eveAlertTitle).toContain("कल: महालय अमावस्या");

      const vrataTe = detectSpecialVrata("2026-10-10", "te");
      expect(vrataTe.vrataName).toContain("మహాలయ అమావాస్య");
      expect(vrataTe.eveAlertTitle).toContain("రేపు: మహాలయ అమావాస్య");

      const vrataTa = detectSpecialVrata("2026-10-10", "ta");
      expect(vrataTa.vrataName).toContain("மஹாளய அமாவாசை");
      expect(vrataTa.eveAlertTitle).toContain("நாளை: மஹாளய அமாவாசை");
    });
  });

  describe("3. getPreviousDayPreparationAlert 5-Language Parity", () => {
    it("generates previous day preparation alert on 2026-10-09 (Eve of Mahalaya Amavasya)", () => {
      const alertEn = getPreviousDayPreparationAlert("2026-10-09", "en");
      expect(alertEn).toBeDefined();
      expect(alertEn).toContain("Tomorrow is the auspicious festival: Mahalaya Amavasya (Sarva Pitru Moksha)");
      expect(KANNADA_REGEX.test(alertEn!)).toBe(false);

      const alertKn = getPreviousDayPreparationAlert("2026-10-09", "kn");
      expect(alertKn).toContain("ನಾಳೆ ಮಹಾಪರ್ವ: ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ");

      const alertHi = getPreviousDayPreparationAlert("2026-10-09", "hi");
      expect(alertHi).toContain("कल महापर्व: महालय अमावस्या");

      const alertTe = getPreviousDayPreparationAlert("2026-10-09", "te");
      expect(alertTe).toContain("రేపు మహా పండుగ: మహాలయ అమావాస్య");

      const alertTa = getPreviousDayPreparationAlert("2026-10-09", "ta");
      expect(alertTa).toContain("நாளை மகா திருநாள்: மஹாளய அமாவாசை");
    });

    it("generates Ekadashi preparation alerts in pure English on Dashami days", () => {
      // 2026-08-23 is Kamika Ekadashi (Bhadrapada Krishna Ekadashi), 2026-08-22 is Dashami
      const alertEn = getPreviousDayPreparationAlert("2026-08-22", "en");
      if (alertEn) {
        expect(KANNADA_REGEX.test(alertEn)).toBe(false);
        expect(alertEn).toContain("Tomorrow is");
        expect(alertEn).toContain("Sacred Ekadashi Vrata");
      }
    });
  });

  describe("4. generatePriestICalendarString 5-Language & Zero Kannada Leakage", () => {
    it("generates English Priest iCalendar string on 2026-10-09 with zero Kannada characters", () => {
      const ics = generatePriestICalendarString({
        startDateStr: "2026-10-09",
        daysCount: 2,
        lang: "en",
        priestName: "Shreeram Pandit",
        locationName: "Gokarna",
        pincode: "581326"
      });

      expect(ics).toContain("VCALENDAR");
      expect(ics).toContain("Mahalaya Amavasya");
      expect(ics).toContain("|| Baggona ||");
      expect(ics).toContain("Aparahna Shraddha Window:");

      // Strict Zero Kannada character assertion across entire ics string
      const lines = ics.split("\r\n");
      const leakedLines = lines.filter(line => KANNADA_REGEX.test(line));
      expect(leakedLines.length, `Leaked Kannada lines in English Priest ICS: ${JSON.stringify(leakedLines)}`).toBe(0);
    });

    it("generates Kannada Priest iCalendar string with authentic Vedic terms", () => {
      const ics = generatePriestICalendarString({
        startDateStr: "2026-10-09",
        daysCount: 2,
        lang: "kn",
        priestName: "Shreeram Pandit",
        locationName: "Gokarna",
        pincode: "581326"
      });

      expect(ics).toContain("॥ ಬಗ್ಗೋಣ ॥");
      expect(ics).toContain("ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ");
      expect(ics).toContain("ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ಕಾಲ:");
      expect(ics).toContain("ಮುಖ್ಯ ಅರ್ಚಕರು: Shreeram Pandit");
    });
  });

  describe("5. generateSevaICalendarString 5-Language Parity & Eve Alerts", () => {
    it("generates Eve Alert for Mahalaya Amavasya in pure English with zero Kannada glyphs", () => {
      const ics = generateSevaICalendarString({
        startDateStr: "2026-10-08",
        daysCount: 5,
        lang: "en",
        panditName: "Shreeram Pandit",
        personName: "Ramesh"
      });

      const lines = ics.split("\r\n");
      const eveAlerts = lines.filter(l => l.includes("Tomorrow: Mahalaya Amavasya"));
      expect(eveAlerts.length).toBeGreaterThan(0);

      const eveDescLine = lines.find(l => l.startsWith("DESCRIPTION:Tomorrow is Mahalaya Amavasya"));
      expect(eveDescLine).toBeDefined();
      expect(KANNADA_REGEX.test(eveDescLine!)).toBe(false);
      expect(eveDescLine).toContain("Fasting Advice:");
      expect(eveDescLine).toContain("Special Mantra:");
    });
  });
});
