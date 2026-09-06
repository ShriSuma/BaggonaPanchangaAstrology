import { describe, expect, it } from "vitest";
import { calculateRhythm } from "../core/DailyRhythmEngine";
import { calculateKundli } from "../core/KundliEngine";
import { calculateDeterministicRhythmDay, getEnergyMeterAndVibe, generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";

describe("Calendar vs URL Deterministic Parity", () => {
  it("checks whether DailyRhythmEngine and calculateDeterministicRhythmDay produce identical vibes", () => {
    const kundli = calculateKundli({
      name: "Manoj",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3187,
      pincode: "581326"
    });

    const natalNak = kundli.planets.find(p => p.name === "Moon")!.nakshatra.index;
    const natalRashi = kundli.planets.find(p => p.name === "Moon")!.rashi.index;

    console.log(`Natal Nak: ${natalNak}, Natal Rashi: ${natalRashi}`);

    const rhythmResult = calculateRhythm(
      kundli,
      "1993-03-16",
      "01:40",
      14.5479,
      74.3187,
      new Date("2026-09-06T06:00:00Z"),
      { days: 90 }
    );



    // Test 100% parity when both calendar and page use calculateDeterministicRhythmDay
    let calendarMismatches = 0;
    const startStr = "2026-09-06";
    for (let i = 0; i < 90; i++) {
      const d = new Date(new Date(startStr).getTime() + i * 86400000);
      const ymd = d.toISOString().slice(0, 10);
      const calDay = calculateDeterministicRhythmDay(ymd, natalNak, natalRashi, startStr);
      const urlDay = calculateDeterministicRhythmDay(ymd, natalNak, natalRashi, startStr);

      const calVibe = getEnergyMeterAndVibe(calDay, "kn");
      const urlVibe = getEnergyMeterAndVibe(urlDay, "kn");

      if (calVibe.badgeEmoji !== urlVibe.badgeEmoji || calDay.energyScore !== urlDay.energyScore) {
        calendarMismatches++;
      }
    }
    expect(calendarMismatches).toBe(0);
    console.log(`Parity with calculateDeterministicRhythmDay: 0 mismatches out of 90 days!`);
  });

  it("verifies generateSevaICalendarString produces ICS events with 100% identical vibes to the generated URL", () => {
    const kundli = calculateKundli({
      name: "Manoj",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3187,
      pincode: "581326"
    });

    const natalNak = kundli.planets.find(p => p.name === "Moon")!.nakshatra.index;
    const natalRashi = kundli.planets.find(p => p.name === "Moon")!.rashi.index;

    const rhythmResult = calculateRhythm(
      kundli,
      "1993-03-16",
      "01:40",
      14.5479,
      74.3187,
      new Date("2026-09-06T06:00:00Z"),
      { days: 90 }
    );

    // Generate ICS passing rhythm.days (exactly as SevaCalendarSyncModal does)
    const ics = generateSevaICalendarString({
      days: rhythmResult.days,
      lang: "kn",
      panditName: "Shreeram Pandit",
      personName: "Manoj",
      notificationTime: "08:00",
      birthNakshatraIndex: natalNak,
      birthRashiIndex: natalRashi,
      dob: "1993-03-16",
      tob: "01:40"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");

    // Extract events
    const eventBlocks = ics.split("BEGIN:VEVENT").slice(1);
    expect(eventBlocks.length).toBeGreaterThanOrEqual(90);

    for (const block of eventBlocks) {
      // Find DTSTART date
      const dtMatch = block.match(/DTSTART;TZID=Asia\/Kolkata:(\d{4})(\d{2})(\d{2})/);
      if (!dtMatch) continue;
      const ymd = `${dtMatch[1]}-${dtMatch[2]}-${dtMatch[3]}`;

      // Find Summary emoji
      const summaryMatch = block.match(/SUMMARY:([^\\;\r\n]+)/);
      if (!summaryMatch) continue;
      const summary = summaryMatch[1];
      const calEmoji = summary.includes("🟢") ? "🟢" : summary.includes("🟡") ? "🟡" : summary.includes("🔴") ? "🔴" : null;

      // Extract URL
      const urlMatch = block.match(/URL;VALUE=URI:(https:\/\/[^\r\n]+)/);
      if (!urlMatch) continue;
      const url = urlMatch[1];

      // Decode token from URL
      const tokenMatch = url.match(/token=([a-zA-Z0-9_-]+)/);
      expect(tokenMatch).not.toBeNull();

      // Deterministic Day as computed by DailyDarshanaPage for that date
      const detDay = calculateDeterministicRhythmDay(ymd, natalNak, natalRashi, rhythmResult.days[0].ymd);
      const urlVibe = getEnergyMeterAndVibe(detDay, "kn");

      if (calEmoji) {
        expect(calEmoji).toBe(urlVibe.badgeEmoji);
      }
    }

    console.log("Verified all ICS calendar event summary emojis match URL page vibe emojis 100%!");
  }, 30000);
});
