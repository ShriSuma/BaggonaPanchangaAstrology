import { describe, it, expect } from "vitest";
import { detectSpecialVrata, get90DaySpecialVratas } from "../features/seva/specialVrataAlertEngine";
import {
  generateSevaICalendarString,
  calculateDeterministicRhythmDay,
  generateGoogleCalendarUrl
} from "../features/seva/icsCalendarGenerator";
import { getParabhavaDayDetails, PARABHAVA_ANNUAL_FESTIVALS } from "../core/ParabhavaBookEngine";

describe("Dasara, Amavasya and Festival Deduplication & Alert Guard Audit", () => {
  it("verifies Dasara (Vijayadashami) falls on 2026-10-20 and NOT on 2026-10-19 morning", () => {
    // 2026-10-19: Mahanavami / Ayudha Pooja
    const vOct19 = detectSpecialVrata("2026-10-19", "kn");
    expect(vOct19.vrataName).toContain("ಮಹಾನವಮೀ");
    expect(vOct19.vrataName).not.toContain("ವಿಜಯದಶಮೀ");

    // 2026-10-20: Vijayadashami (Dasara Mahotsava)
    const vOct20 = detectSpecialVrata("2026-10-20", "kn");
    expect(vOct20.vrataName).toContain("ವಿಜಯದಶಮೀ");
    expect(vOct20.vrataName).toContain("ದಸರಾ");

    // Parabhava Book Engine parity
    const bOct19 = getParabhavaDayDetails("2026-10-19");
    const bOct20 = getParabhavaDayDetails("2026-10-20");
    expect(bOct19?.festivalsAndVratas.some(f => f.includes("ಆಯುಧ ಪೂಜೆ") || f.includes("ಮಹಾನವಮಿ"))).toBe(true);
    expect(bOct20?.festivalsAndVratas.some(f => f.includes("ವಿಜಯದಶಮಿ") || f.includes("ದಸರಾ"))).toBe(true);
  });

  it("verifies ICS calendar contains prominent festival morning titles and proper eve alert prefixing for Dasara", () => {
    // Generate 7-day window around Dasara (2026-10-17 to 2026-10-23)
    const ics = generateSevaICalendarString({
      startDateStr: "2026-10-17",
      daysCount: 7,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Suma",
      birthNakshatraIndex: 12,
      birthRashiIndex: 5
    });

    const lines = ics.split("\r\n");

    // Check morning event for 2026-10-20 (Dasara Day)
    // Should have summary with Vijayadashami / Dasara prefix
    const oct20Events = lines.filter(l => l.startsWith("SUMMARY:") && l.includes("ವಿಜಯದಶಮೀ"));
    expect(oct20Events.length).toBeGreaterThanOrEqual(1);
    expect(oct20Events.some(s => s.startsWith("SUMMARY:🚩 ವಿಜಯದಶಮೀ"))).toBe(true);

    // Check eve alert on 2026-10-19 at 20:00
    const eveAlerts = lines.filter(l => l.startsWith("SUMMARY:🔔 ನಾಳೆ:"));
    expect(eveAlerts.some(s => s.includes("ವಿಜಯದಶಮೀ"))).toBe(true);

    // Ensure on 2026-10-20 evening there is NO eve alert for Vijayadashami
    const oct20EveAlerts = lines.filter(l => l.startsWith("UID:baggona-eve-20261020"));
    expect(oct20EveAlerts.every(uid => !uid.includes("festival"))).toBe(true);
  });

  it("verifies Amavasya in September 2026 falls on 2026-09-11 and NOT on 2026-09-10", () => {
    const vSep10 = detectSpecialVrata("2026-09-10", "kn");
    const vSep11 = detectSpecialVrata("2026-09-11", "kn");

    // 2026-09-10 is Bhadrapada Krishna Chaturdashi
    expect(vSep10.category).not.toBe("AMAVASYA");

    // 2026-09-11 is Bhadrapada Amavasya
    expect(vSep11.category).toBe("AMAVASYA");
    expect(vSep11.vrataName).toContain("ಅಮಾವಾಸ್ಯೆ");

    // Verify 90-day vrata list has only ONE Amavasya in September 2026
    const vratas = get90DaySpecialVratas("2026-09-01", "kn");
    const sepAmavasyas = vratas.filter(v => v.category === "AMAVASYA" && v.ymd.startsWith("2026-09"));
    expect(sepAmavasyas.length).toBe(1);
    expect(sepAmavasyas[0].ymd).toBe("2026-09-11");
  });

  it("verifies Mahalaya Amavasya falls on 2026-10-10 with zero duplication", () => {
    const vOct09 = detectSpecialVrata("2026-10-09", "kn");
    const vOct10 = detectSpecialVrata("2026-10-10", "kn");

    expect(vOct09.vrataName).not.toContain("ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ");
    expect(vOct10.vrataName).toContain("ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ");

    const vratas = get90DaySpecialVratas("2026-10-01", "kn");
    const octAmavasyas = vratas.filter(v => v.vrataName.includes("ಅಮಾವಾಸ್ಯೆ") && v.ymd.startsWith("2026-10"));
    expect(octAmavasyas.length).toBe(1);
    expect(octAmavasyas[0].ymd).toBe("2026-10-10");
  });

  it("verifies zero consecutive duplicate Amavasyas, Purnimas, or Ekadashis across the 385 days of Parabhava Samvatsara", () => {
    // Generate dates for entire Parabhava Samvatsara (2026-03-20 to 2027-04-06)
    const startDate = new Date("2026-03-20");
    const endDate = new Date("2027-04-07");
    const allVratas: Array<{ ymd: string; category: string; vrataName: string }> = [];

    const cur = new Date(startDate);
    while (cur <= endDate) {
      const ymd = cur.toISOString().slice(0, 10);
      const v = detectSpecialVrata(ymd, "kn");
      if (v.isSpecial) {
        allVratas.push({ ymd, category: v.category, vrataName: v.vrataName });
      }
      cur.setDate(cur.getDate() + 1);
    }

    expect(allVratas.length).toBeGreaterThan(50);

    // Ensure no consecutive days share the same vrata category (for monthly observances)
    for (let i = 0; i < allVratas.length - 1; i++) {
      const v1 = allVratas[i];
      const v2 = allVratas[i + 1];

      if (["AMAVASYA", "PURNIMA", "EKADASHI", "SANKASHTI", "PRADOSHAM"].includes(v1.category)) {
        if (v1.category === v2.category) {
          const d1 = new Date(v1.ymd).getTime();
          const d2 = new Date(v2.ymd).getTime();
          const diffDays = Math.round((d2 - d1) / 86400000);
          expect(diffDays, `Duplicate ${v1.category} on consecutive days: ${v1.ymd} and ${v2.ymd}`).toBeGreaterThan(1);
        }
      }
    }
  });

  it("verifies Google Calendar URL summary contains festival name on festival days", () => {
    const dayOct20 = calculateDeterministicRhythmDay("2026-10-20", 12, 5);
    const gUrl = generateGoogleCalendarUrl({
      day: dayOct20,
      panditName: "Shreeram Pandit",
      personName: "Suma",
      lang: "kn"
    });

    // The title in the URL should contain Vijayadashami / Dasara
    expect(decodeURIComponent(gUrl)).toContain("ವಿಜಯದಶಮೀ");
  });
});
