import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  encodeDateOnlyDevoteeToken,
  decodeDevoteeToken,
  isDateOnlyToken,
  encodeDevoteeToken
} from "../utils/tokenCipher";
import {
  getChandraBalaInfo,
  generateSevaICalendarString,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import {
  calculateGokarnaPitruRaksha,
  evaluateShraddhaTithiStatus
} from "../features/seva/gokarnaPitruRakshaEngine";
import QuickCalendarPage from "../pages/QuickCalendarPage";
import "../i18n";

describe("Baggona Quick Calendar & 5-Page Ashirvada Patra Suite", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("1. Date-Only Devotee Token Cipher (bgn_dob_)", () => {
    it("encodes date-only token with bgn_dob_ prefix and sets isDateOnly to true", () => {
      const token = encodeDateOnlyDevoteeToken({
        name: "ವೆಂಕಟೇಶ ಶರ್ಮ",
        dob: "1988-06-15",
        // Notice: TOB is completely omitted
        rashi: 3,
        nakshatra: 7,
        gotra: "ಕಾಶ್ಯಪ",
        lang: "kn",
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        priestPhone: "9972339362",
        priestWhatsApp: "9972339362",
        shraddhaTithi: "ದ್ವಾದಶಿ"
      });

      expect(token).toMatch(/^bgn_dob_/);
      expect(isDateOnlyToken(token)).toBe(true);

      const decoded = decodeDevoteeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe("ವೆಂಕಟೇಶ ಶರ್ಮ");
      expect(decoded?.dob).toBe("1988-06-15");
      expect(decoded?.tob).toBeUndefined();
      expect(decoded?.isDateOnly).toBe(true);
      expect(decoded?.rashi).toBe(3);
      expect(decoded?.nakshatra).toBe(7);
      expect(decoded?.gotra).toBe("ಕಾಶ್ಯಪ");
      expect(decoded?.priestPhone).toBe("9972339362");
      expect(decoded?.shraddhaTithi).toBe("ದ್ವಾದಶಿ");
    });

    it("maintains backward compatibility with standard bgn_v1_ tokens", () => {
      const standardToken = encodeDevoteeToken({
        name: "ಸುರೇಶ್ ಭಟ್",
        dob: "1992-11-20",
        tob: "14:30",
        rashi: 8,
        nakshatra: 18,
        gotra: "ವಿಶ್ವಾಮಿತ್ರ",
        lang: "kn"
      });

      expect(standardToken).toMatch(/^bgn_v1_/);
      expect(isDateOnlyToken(standardToken)).toBe(false);

      const decoded = decodeDevoteeToken(standardToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe("ಸುರೇಶ್ ಭಟ್");
      expect(decoded?.tob).toBe("14:30");
      expect(decoded?.isDateOnly).toBe(false);
    });
  });

  describe("2. Chandra Bala 1-Liner Actionable Real-Life Guidance in 5 Languages", () => {
    it("provides rich, actionable 1-liner guidance for all 12 houses in Kannada", () => {
      // House 11 (Labha Bhava)
      const h11 = getChandraBalaInfo(11, false, "kn");
      expect(h11).toContain("ಬಾಕಿ ಹಣ ವಸೂಲಾತಿ");

      // House 1 (Janma Rashi)
      const h1 = getChandraBalaInfo(1, false, "kn");
      expect(h1).toContain("ಆತ್ಮವಿಶ್ವಾಸ");

      // House 7 (Saptama)
      const h7 = getChandraBalaInfo(7, false, "kn");
      expect(h7).toContain("ದಾಂಪತ್ಯ ಪ್ರೀತಿ");

      // House 9 (Bhagya)
      const h9 = getChandraBalaInfo(9, false, "kn");
      expect(h9).toContain("ಗುರುಗಳ ಕೃಪೆ");
    });

    it("provides protective caution for Chandrashtama across languages", () => {
      const knChandrashtama = getChandraBalaInfo(8, true, "kn");
      expect(knChandrashtama).toContain("ವಿಶ್ರಾಂತಿ ಹಾಗೂ ಶಿವನಾಮ ಜಪಿಸಿ");

      const enChandrashtama = getChandraBalaInfo(8, true, "en");
      expect(enChandrashtama).toContain("focus on rest & prayer");

      const hiChandrashtama = getChandraBalaInfo(8, true, "hi");
      expect(hiChandrashtama).toContain("विश्राम व शिव आराधना करें");
    });

    it("verifies Abhijit Muhurtha is strictly omitted from .ics event descriptions for website retention", () => {
      const rhythmDay = calculateDeterministicRhythmDay("2026-09-16", 7, 3, "2026-09-16");
      const icsString = generateSevaICalendarString({
        days: [rhythmDay],
        lang: "kn",
        panditName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        notificationTime: "08:00",
        personName: "ದರ್ಶನ ಭಕ್ತರು",
        dob: "1988-06-15"
      });

      // Crucial Calendar Engagement Rule:
      // Abhijit Muhurtha MUST NOT be inside the .ics event description so devotees visit website!
      expect(icsString).not.toContain("ಅಭಿಜಿತ್");
      expect(icsString).not.toContain("Abhijit");
      expect(icsString).toContain("/daily?token=");
    });
  });

  describe("3. Gokarna Pitru Raksha & Parents' Annual Shraddha Tithi Alert", () => {
    it("computes sacred ancestral protection score and blessings", () => {
      const pitru = calculateGokarnaPitruRaksha(null, "kn");
      expect(pitru.score).toBeGreaterThanOrEqual(86);
      expect(pitru.badgeTitle).toBe("ಗೋಕರ್ಣ ಪಿತೃ ರಕ್ಷಾ & ವಂಶ ವೃದ್ಧಿ ಕವಚ");
      expect(pitru.pitruDevata).toContain("ಅರ್ಯಮಾ");
      expect(pitru.kavachaMantra).toContain("ॐ ಪಿತೃದೇವತಾಭ್ಯೋ ನಮಃ");
      expect(pitru.dailySadhana).toContain("ಸೂರ್ಯನಿಗೆ ಜಲಾರ್ಘ್ಯ");
    });

    it("accurately detects when today matches the registered Shraddha tithi", () => {
      const matchResult = evaluateShraddhaTithiStatus("ದ್ವಾದಶಿ", "ಶುಕ್ಲ ದ್ವಾದಶಿ", "kn");
      expect(matchResult.hasRegisteredTithi).toBe(true);
      expect(matchResult.isToday).toBe(true);
      expect(matchResult.alertText).toContain("ಇಂದು ಪೋಷಕರ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ");

      const nonMatchResult = evaluateShraddhaTithiStatus("ದ್ವಾದಶಿ", "ಶುಕ್ಲ ಅಷ್ಟಮಿ", "kn");
      expect(nonMatchResult.hasRegisteredTithi).toBe(true);
      expect(nonMatchResult.isToday).toBe(false);
      expect(nonMatchResult.alertText).toBe("");
    });
  });

  describe("4. QuickCalendarPage Component & 5-Page Ashirvada Patra Container", () => {
    it("renders QuickCalendarPage with optional Time of Birth indicator and 5-page PDF container", () => {
      const { unmount } = render(<QuickCalendarPage />);

      // Verify title & optional TOB presence
      expect(screen.getByText(/ಜನ್ಮ ದಿನಾಂಕ ಆಧಾರಿತ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್/i)).toBeInTheDocument();
      expect(screen.getAllByText(/ಜನ್ಮ ಸಮಯ/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/ಐಚ್ಛಿಕ \/ Optional/i)).toBeInTheDocument();

      // Verify 5-page PDF container exists with correct ID for vertical stacking
      const pdfContainer = document.getElementById("quick-seva-5page-pdf");
      expect(pdfContainer).not.toBeNull();
      expect(pdfContainer?.style.display).toBe("block");

      unmount();
    });
  });
});
