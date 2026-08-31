import { describe, it, expect } from "vitest";
import {
  generatePriestDayDossier,
  generatePriestCalendarSchedule,
  generatePriestICalendarString,
  getPreviousDayPreparationAlert
} from "../core/PriestCalendarEngine";

describe("Baggona Panchanga Priest Calendar Engine", () => {
  it("generates authentic zero-hallucination Priest Dossier for Yugadi (19 March 2026)", () => {
    const yugadi = generatePriestDayDossier("2026-03-19", 14.5479, 74.3187, "581326");

    expect(yugadi.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(yugadi.chandramanaMasaKn).toBe("ಚೈತ್ರ");
    expect(yugadi.pakshaKn).toBe("ಶುಕ್ಲ");
    expect(yugadi.tithiKn).toBe("ಪಾಡ್ಯ");
    expect(yugadi.tithiGhati).toBe("46-30");
    expect(yugadi.shraddhaTithi).toBe("ಪಾಡ್ಯ ಶ್ರಾದ್ಧ");
    expect(yugadi.dinapramana).toBe("29-56");
    expect(yugadi.suryodaya).toBe("06:42 AM");
    expect(yugadi.suryasta).toBe("06:41 PM");

    // Right Page: 12 Dina Lagna Ending times
    expect(yugadi.lagnaEndingTimes.meena).toBe("08:06 AM");
    expect(yugadi.lagnaEndingTimes.mesha).toBe("09:53 AM");
    expect(yugadi.lagnaEndingTimes.vrishabha).toBeTruthy();

    // Right Page: Navagraha Spashta & Gochara Placements
    expect(yugadi.grahaSpashta.ravi.rashiKn).toBe("ಮೀನ");
    expect(yugadi.grahaSpashta.guru.rashiKn).toBe("ಮಿಥುನ");
    expect(yugadi.grahaSpashta.shani.rashiKn).toBe("ಮೀನ");
    expect(yugadi.gocharaHouseMap[11]).toEqual(expect.arrayContaining(["ರವಿ", "ಶನಿ"]));
  });

  it("generates authentic Priest Dossier for Shri Rama Navami (27 March 2026)", () => {
    const ramanavami = generatePriestDayDossier("2026-03-27", 14.5479, 74.3187, "581326");

    expect(rashiMatch(ramanavami.tithiKn, "ನವಮಿ")).toBe(true);
    expect(ramanavami.tithiGhati).toBe("08-54");
    expect(ramanavami.shraddhaTithi).toBe("ನವಮಿ ಶ್ರಾದ್ಧ");
    expect(ramanavami.nakshatraKn).toBe("ಪುನರ್ವಸು");
    expect(ramanavami.festivalsAndVratas).toContain("ಶ್ರೀರಾಮನವಮೀ");
    expect(ramanavami.matchedFestival?.nameKn).toBe("ಶ್ರೀರಾಮನವಮೀ");
    expect(ramanavami.matchedFestival?.pujaWindow).toContain("11:15 AM - 01:45 PM");
  });

  it("generates intelligent previous-day preparation alerts for Ekadashi and major festivals", () => {
    // 28 March 2026 is Dashami, day before Kamada Ekadashi (29 March 2026)
    const alertOnDashami = getPreviousDayPreparationAlert("2026-03-28");
    expect(alertOnDashami).toBeDefined();
    expect(alertOnDashami).toContain("ಏಕಾದಶಿ");
    expect(alertOnDashami).toContain("ದಶಮೀ ನಿಯಮ");

    // 05 March 2027 is Trayodashi, day before Maha Shivaratri (06 March 2027)
    const alertBeforeShivaratri = getPreviousDayPreparationAlert("2027-03-05");
    expect(alertBeforeShivaratri).toBeDefined();
    expect(alertBeforeShivaratri).toContain("ಮಹಾಶಿವರಾತ್ರಿ");
  });

  it("generates full 30, 90, and 180-day Priest Calendar schedule with zero blank fields", () => {
    const schedule90 = generatePriestCalendarSchedule("2026-03-19", 90);
    expect(schedule90.length).toBe(90);

    schedule90.forEach((d) => {
      expect(d.dateStr).toBeTruthy();
      expect(d.samvatsaraKn).toBe("ಪರಾಭವ");
      expect(d.tithiKn).toBeTruthy();
      expect(d.shraddhaTithi).toBeTruthy();
      expect(d.suryodaya).toBeTruthy();
      expect(d.suryasta).toBeTruthy();
      expect(d.lagnaEndingTimes.meena).toBeTruthy();
      expect(d.grahaSpashta.ravi.rashiKn).toBeTruthy();
      expect(d.gocharaPlacements.length).toBeGreaterThanOrEqual(7);
    });
  }, 20000);

  it("generates standard RFC 5545 Priest iCalendar (.ics) string with alarms and deep links", () => {
    const ics = generatePriestICalendarString({
      startDateStr: "2026-03-19",
      daysCount: 30,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      pincode: "581326",
      locationName: "Gokarna"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-CALNAME:ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಪುರೋಹಿತ ಕ್ಯಾಲೆಂಡರ್)");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("ACTION:AUDIO");
    expect(ics).toContain("PresetSound#Bells");
    expect(ics).toContain("ghantanada.mp3");
    expect(ics).toContain("TRIGGER:-PT1H");
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("X-ALT-DESC;FMTTYPE=text/html");
    expect(ics).toContain("URL;VALUE=URI:");
    expect(ics).toContain("/priest-panchanga?date=");
    expect(ics).toContain("END:VCALENDAR");
  });
});

function rashiMatch(val: string, expected: string): boolean {
  return val.includes(expected);
}
