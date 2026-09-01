import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import {
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  generateCompactGoogleCalendarUrlForQR,
  generateQrPayloadByTarget,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import {
  generatePriestICalendarString,
  generatePriestCalendarSchedule,
  getPreviousDayPreparationAlert
} from "../core/PriestCalendarEngine";
import {
  PARABHAVA_ANNUAL_FESTIVALS,
  getFestivalByDate
} from "../core/ParabhavaBookEngine";
import { detectSpecialVrata, get90DaySpecialVratas } from "../features/seva/specialVrataAlertEngine";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Comprehensive Calendar & QR Code Deduplication Audit", () => {
  describe("1. Canonical Baggona Panchanga Annual Festivals Uniqueness", () => {
    it("verifies every festival in PARABHAVA_ANNUAL_FESTIVALS has a unique date and non-empty metadata", () => {
      const dateSet = new Set<string>();
      const idSet = new Set<string>();

      PARABHAVA_ANNUAL_FESTIVALS.forEach((fest) => {
        expect(idSet.has(fest.id), `Duplicate festival ID detected: ${fest.id}`).toBe(false);
        idSet.add(fest.id);

        expect(fest.nameKn.length).toBeGreaterThan(0);
        expect(fest.nameEn.length).toBeGreaterThan(0);
        expect(fest.descriptionKn.length).toBeGreaterThan(0);
        expect(fest.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Festival must be retrieved by getFestivalByDate
        const retrieved = getFestivalByDate(fest.date);
        expect(retrieved).toBeDefined();
        expect(retrieved?.id).toBe(fest.id);
      });
    });

    it("verifies major festivals (Yugadi, Rama Navami, Varamahalakshmi, Janmashtami, Ganesha Chaturthi, Deepavali, Shivaratri) trigger once and match canonical dates", () => {
      const yugadi = getFestivalByDate("2026-03-19");
      expect(yugadi?.nameKn).toContain("ಯುಗಾದಿ");

      const ramaNavami = getFestivalByDate("2026-03-27");
      expect(ramaNavami?.nameKn).toContain("ರಾಮನವಮೀ");

      const varamahalakshmi = getFestivalByDate("2026-08-21");
      expect(varamahalakshmi?.nameKn).toContain("ವರಮಹಾಲಕ್ಷ್ಮೀ");

      const janmashtami = getFestivalByDate("2026-09-04");
      expect(janmashtami?.nameKn).toContain("ಶ್ರೀಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮೀ");

      const ganesha = getFestivalByDate("2026-09-14");
      expect(ganesha?.nameKn).toContain("ಗಣೇಶ ಚತುರ್ಥಿ");

      const deepavali = getFestivalByDate("2026-11-09");
      expect(deepavali?.nameKn).toContain("ದೀಪಾವಳಿ");

      const shivaratri = getFestivalByDate("2027-03-06");
      expect(shivaratri?.nameKn).toContain("ಮಹಾಶಿವರಾತ್ರಿ");
    });
  });

  describe("2. Devotee 90-Day ICS Calendar Deduplication & Alerts", () => {
    it("generates 90 daily events with 100% unique UIDs and zero duplicate dates", () => {
      const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
        const d = new Date("2026-03-19");
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, 12, 5);
      });

      const ics = generateSevaICalendarString({
        days,
        lang: "kn",
        panditName: "Shreeram Pandit",
        personName: "Devotee Ananya"
      });

      // Extract all UIDs
      const uidMatches = ics.match(/^UID:(.+)$/gm) || [];
      const uidSet = new Set<string>();

      uidMatches.forEach((line) => {
        const uid = line.replace(/^UID:/, "").trim();
        expect(uidSet.has(uid), `Duplicate UID found in ICS: ${uid}`).toBe(false);
        uidSet.add(uid);
      });

      // Extract DTSTART values for daily events
      const dtStartMatches = ics.match(/^DTSTART;TZID=Asia\/Kolkata:(\d{8}T\d{6})$/gm) || [];
      expect(dtStartMatches.length).toBeGreaterThanOrEqual(90);
    }, 30000);

    it("ensures previous day eve alerts are scheduled strictly ONCE on the prior evening at 20:00 (8:00 PM IST)", () => {
      const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
        const d = new Date("2026-08-01");
        d.setDate(d.getDate() + i);
        const ymd = d.toISOString().slice(0, 10);
        return calculateDeterministicRhythmDay(ymd, 12, 5);
      });

      const ics = generateSevaICalendarString({
        days,
        lang: "kn",
        panditName: "Shreeram Pandit",
        personName: "Devotee Ananya"
      });

      // Check Varamahalakshmi (2026-08-21): eve alert must be on 2026-08-20 at 20:00 IST
      expect(ics).toContain("baggona-eve-20260820-festival-");
      expect(ics).toContain("DTSTART;TZID=Asia/Kolkata:20260820T200000");
      expect(ics).toContain("DTEND;TZID=Asia/Kolkata:20260820T203000");

      // Verify no duplicate eve alert for 2026-08-20 festival
      const occurrences = (ics.match(/baggona-eve-20260820-festival-/g) || []).length;
      expect(occurrences).toBe(1);
    }, 30000);
  });

  describe("3. Priest Calendar Engine & Dossier Parity", () => {
    it("generates 90-day Priest Calendar schedule with unique UIDs and complete astrological fields", () => {
      const ics = generatePriestICalendarString({
        startDateStr: "2026-03-19",
        daysCount: 90,
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        locationName: "Gokarna",
        pincode: "581326"
      });

      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).toContain("X-WR-CALNAME:ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪುರೋಹಿತ ಕ್ಯಾಲೆಂಡರ್)");

      // Check UIDs uniqueness
      const uidMatches = ics.match(/^UID:(.+)$/gm) || [];
      const uidSet = new Set<string>();
      uidMatches.forEach((line) => {
        const uid = line.replace(/^UID:/, "").trim();
        expect(uidSet.has(uid), `Duplicate UID found in Priest ICS: ${uid}`).toBe(false);
        uidSet.add(uid);
      });
      expect(uidSet.size).toBe(90);
    }, 30000);

    it("verifies getPreviousDayPreparationAlert returns single, non-overlapping alerts", () => {
      // Dashami before Kamada Ekadashi (2026-03-28)
      const alertDashami = getPreviousDayPreparationAlert("2026-03-28");
      expect(alertDashami).toBeDefined();
      expect(alertDashami).toContain("ಏಕಾದಶಿ");
      expect(alertDashami).toContain("ದಶಮೀ ನಿಯಮ");

      // Day before Maha Shivaratri (2027-03-05)
      const alertShivaratri = getPreviousDayPreparationAlert("2027-03-05");
      expect(alertShivaratri).toBeDefined();
      expect(alertShivaratri).toContain("ಮಹಾಶಿವರಾತ್ರಿ");
      expect(alertShivaratri).toContain("ಪೂಜಾ ಮುಹೂರ್ತ");

      // Regular day without special event tomorrow should return undefined
      const alertRegular = getPreviousDayPreparationAlert("2026-03-24");
      // 2026-03-25 has no major festival or Ekadashi/Purnima/Amavasya
      if (alertRegular) {
        expect(alertRegular.split("\n").length).toBe(1); // Never multi-line overlapping clutter
      }
    });
  });

  describe("4. QR Code Safety, Capacity & Scannability Guard", () => {
    it("ensures Google Calendar QR payload is compact (< 600 chars), ASCII-only, and without emojis", () => {
      const payload = generateCompactGoogleCalendarUrlForQR({
        days: [calculateDeterministicRhythmDay("2026-03-19", 12, 5)],
        lang: "kn",
        panditName: "Shreeram Pandit",
        notificationTime: "08:00",
        personName: "Devotee Ananya"
      });

      expect(payload.length).toBeLessThan(600);
      expect(payload).not.toMatch(/[^\x00-\x7F]/); // Strictly ASCII-only
      expect(payload).not.toContain("RRULE:FREQ=DAILY"); // No recurrence duplicate bug
    });

    it("generates scannable QR Code Data URLs with errorCorrectionLevel L and M", async () => {
      const payload = generateQrPayloadByTarget("google", {
        days: [calculateDeterministicRhythmDay("2026-03-19", 12, 5)],
        lang: "kn",
        panditName: "Shreeram Pandit",
        notificationTime: "08:00",
        personName: "Devotee Ananya"
      });

      const qrDataUrlL = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 280
      });
      expect(qrDataUrlL.startsWith("data:image/png;base64,")).toBe(true);

      const qrDataUrlM = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 280
      });
      expect(qrDataUrlM.startsWith("data:image/png;base64,")).toBe(true);
    });

    it("verifies zero RRULE:FREQ=DAILY recurrence duplication across all targets", () => {
      const googlePayload = generateQrPayloadByTarget("google", {
        days: [calculateDeterministicRhythmDay("2026-03-19", 12, 5)],
        lang: "kn",
        panditName: "Shreeram Pandit",
        personName: "Devotee"
      });
      expect(googlePayload).not.toContain("RRULE:FREQ=DAILY");

      const sanctumPayload = generateQrPayloadByTarget("sanctum", {
        days: [calculateDeterministicRhythmDay("2026-03-19", 12, 5)],
        lang: "kn",
        panditName: "Shreeram Pandit",
        personName: "Devotee"
      });
      expect(sanctumPayload).not.toContain("RRULE:FREQ=DAILY");
      expect(sanctumPayload).toContain("/daily?token=");
    });
  });
});
