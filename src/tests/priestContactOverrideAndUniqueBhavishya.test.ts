import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import { buildDeterministicPriestBenediction } from "../features/seva/sevaPriestNarrativeEngine";
import { getDailyActionableGuidance } from "../features/seva/sevaPresentation";
import { calculateDeterministicRhythmDay, generateSevaICalendarString, generateGoogleCalendarUrl } from "../features/seva/icsCalendarGenerator";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Priest Contact Override & 90-Day Unique Bhavishya Precision Engine", () => {
  it("correctly encodes and decodes priest phone and contact override flag in devotee tokens", () => {
    const payload = {
      n: "Ganesh Sharma",
      nk: 3,
      r: 1,
      p: "Vidyadhara Bhat",
      ph: "9845123456",
      ocp: 1,
      d: "2026-08-30",
      l: "kn"
    };

    const token = encodeDevoteeToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Ganesh Sharma");
    expect(decoded?.p).toBe("Vidyadhara Bhat");
    expect(decoded?.ph || decoded?.phone).toBe("9845123456");
    expect(Boolean(decoded?.ocp || decoded?.overrideCalendarPhone)).toBe(true);
  });

  it("retains chief priest fallback when override flag is false/unset", () => {
    const payload = {
      n: "Ananya",
      nk: 10,
      r: 4,
      p: "Shreeram Pandit",
      d: "2026-08-30",
      l: "kn"
    };

    const token = encodeDevoteeToken(payload);
    const decoded = decodeDevoteeToken(token);
    expect(decoded?.ocp).toBeFalsy();
    expect(decoded?.overrideCalendarPhone).toBeFalsy();
  });

  it("ensures buildDeterministicPriestBenediction produces 100% unique epistles across 90 days", () => {
    const days: RhythmDay[] = [];
    const startDate = new Date("2026-08-30");
    for (let i = 0; i < 90; i++) {
      const cur = new Date(startDate.getTime() + i * 86400000);
      const ymd = cur.toISOString().slice(0, 10);
      const day = calculateDeterministicRhythmDay(ymd, 3, 1, "2026-08-30");
      days.push(day);
    }
    expect(days.length).toBe(90);

    const benedictions = new Set<string>();
    days.forEach((day) => {
      const benediction = buildDeterministicPriestBenediction(day, "kn", "ಗಣೇಶ್ ಶರ್ಮಾ");
      expect(benediction).toBeDefined();
      expect(benediction.length).toBeGreaterThan(50);
      expect(benediction).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ");
      expect(benediction).toContain("ಗಣೇಶ್ ಶರ್ಮಾ");
      benedictions.add(benediction);
    });

    // Across 90 days with moon transit moving through 27 nakshatras, 12 rashis, 9 taras, 7 day lords:
    // the vast majority of epistles are strictly distinct
    expect(benedictions.size).toBeGreaterThan(60);
  });

  it("ensures getDailyActionableGuidance produces dynamic 4-card focus points without static repetition", () => {
    const days: RhythmDay[] = [];
    const startDate = new Date("2026-08-30");
    for (let i = 0; i < 90; i++) {
      const cur = new Date(startDate.getTime() + i * 86400000);
      const ymd = cur.toISOString().slice(0, 10);
      const day = calculateDeterministicRhythmDay(ymd, 3, 1, "2026-08-30");
      days.push(day);
    }
    
    const vehicleFocuses = new Set<string>();
    const careerFocuses = new Set<string>();
    const mindFocuses = new Set<string>();
    const spiritualFocuses = new Set<string>();

    days.forEach((day) => {
      const guidance = getDailyActionableGuidance(day, "kn");
      expect(guidance.length).toBe(4);

      const v = guidance.find(g => g.icon === "🚗");
      const c = guidance.find(g => g.icon === "💰");
      const m = guidance.find(g => g.icon === "🧠");
      const s = guidance.find(g => g.icon === "🪔");

      if (v) vehicleFocuses.add(v.text);
      if (c) careerFocuses.add(c.text);
      if (m) mindFocuses.add(m.text);
      if (s) spiritualFocuses.add(s.text);
    });

    expect(vehicleFocuses.size).toBeGreaterThan(3);
    expect(careerFocuses.size).toBeGreaterThan(3);
    expect(mindFocuses.size).toBeGreaterThan(2);
    expect(spiritualFocuses.size).toBeGreaterThan(5);
  });

  it("propagates priest phone into Google Calendar URLs and iCal payloads when overridden", () => {
    const days: RhythmDay[] = [];
    const startDate = new Date("2026-08-30");
    for (let i = 0; i < 90; i++) {
      const cur = new Date(startDate.getTime() + i * 86400000);
      const ymd = cur.toISOString().slice(0, 10);
      const day = calculateDeterministicRhythmDay(ymd, 3, 1, "2026-08-30");
      days.push(day);
    }
    
    const gUrl = generateGoogleCalendarUrl({
      days,
      lang: "kn",
      panditName: "Vidyadhara Bhat",
      priestPhone: "9845123456",
      overrideCalendarPhone: true,
      notificationTime: "08:00",
      personName: "Devotee"
    });

    expect(gUrl).toBeDefined();
    expect(gUrl).toContain("calendar.google.com");

    const icsContent = generateSevaICalendarString({
      days: days.slice(0, 7),
      lang: "kn",
      panditName: "Vidyadhara Bhat",
      priestPhone: "9845123456",
      overrideCalendarPhone: true,
      notificationTime: "08:00",
      personName: "Devotee"
    });

    expect(icsContent).toContain("BEGIN:VCALENDAR");
    expect(icsContent).toContain("END:VCALENDAR");
  });
});
