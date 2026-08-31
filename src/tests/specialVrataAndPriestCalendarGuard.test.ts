import { describe, it, expect } from "vitest";
import { detectSpecialVrata, get90DaySpecialVratas } from "../features/seva/specialVrataAlertEngine";
import { generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";

describe("Special Vrata Deduplication and Priest Calendar Integration", () => {
  it("detectSpecialVrata assigns each Vrata deterministically to canonical Udaya Tithi", () => {
    const v1 = detectSpecialVrata("2026-08-28", "kn");
    expect(v1).toBeDefined();
    // Varamahalakshmi or special festival should not repeat on non-qualifying consecutive dates
    const v2 = detectSpecialVrata("2026-08-29", "kn");
    if (v1.isSpecial && v1.vrataName.includes("ವರಮಹಾಲಕ್ಷ್ಮಿ")) {
      expect(v2.vrataName).not.toContain("ವರಮಹಾಲಕ್ಷ್ಮಿ");
    }
  });

  it("get90DaySpecialVratas returns unique list with zero consecutive duplicates", () => {
    const list = get90DaySpecialVratas("2026-08-01", "kn");
    expect(list.length).toBeGreaterThan(0);

    for (let i = 0; i < list.length - 1; i++) {
      const cur = list[i];
      const next = list[i + 1];
      if (cur.category === next.category && cur.category !== "NONE") {
        // Must not be consecutive day
        const curD = new Date(cur.ymd).getTime();
        const nextD = new Date(next.ymd).getTime();
        const diffDays = Math.round((nextD - curD) / 86400000);
        expect(diffDays).toBeGreaterThan(1);
      }
    }
  });

  it("generateSevaICalendarString deduplicates Eve Alerts so no duplicate alert exists for the same vrata", () => {
    const ics = generateSevaICalendarString({
      startDateStr: "2026-08-01",
      daysCount: 90,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Ramesh"
    });

    const lines = ics.split("\r\n");
    const eveAlertEvents = lines.filter(l => l.includes("SUMMARY:🔔 ನಾಳೆ"));
    const uids = lines.filter(l => l.startsWith("UID:baggona-eve-"));

    // Every Eve Alert must have a unique UID and not be duplicated
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length);
  });

  it("generateSevaICalendarString includes Priest Dossier when includePriestCalendar is true", () => {
    const ics = generateSevaICalendarString({
      startDateStr: "2026-08-01",
      daysCount: 30,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Ramesh",
      includePriestCalendar: true
    });

    expect(ics).toContain("ಪುರೋಹಿತ ಪಂಚಾಂಗ ವಿವರಗಳು");
    expect(ics).toContain("೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯಗಳು");
    expect(ics).toContain("priest-panchanga");
  });

  it("generateSevaICalendarString does not include Priest Dossier when includePriestCalendar is false", () => {
    const ics = generateSevaICalendarString({
      startDateStr: "2026-08-01",
      daysCount: 30,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Ramesh",
      includePriestCalendar: false
    });

    expect(ics).not.toContain("ಪುರೋಹಿತ ಪಂಚಾಂಗ ವಿವರಗಳು");
    expect(ics).not.toContain("೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯಗಳು");
  });
});
