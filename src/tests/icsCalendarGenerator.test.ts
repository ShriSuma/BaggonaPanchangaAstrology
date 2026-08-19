import { describe, expect, it } from "vitest";
import type { RhythmDay } from "../core/DailyRhythmEngine";
import {
  formatPanditGreeting,
  generateGoogleCalendarUrl,
  generateNative90DayQrCalendarPayload,
  generatePlatformSpecificQrPayload,
  generateSevaICalendarString,
  generateQrPayloadByTarget,
  getDailyKaalaTimings,
  getEnergyMeterAndVibe
} from "../features/seva/icsCalendarGenerator";
import {
  buildDeterministicPriestBenediction,
  generatePriestDayNarrative,
  getDevoteeSalutation
} from "../features/seva/sevaPriestNarrativeEngine";
import { decodeDevoteeToken } from "../utils/tokenCipher";

const mockDays: RhythmDay[] = [
  {
    ymd: "2026-08-11",
    year: 2026,
    monthIndex: 7, // August (0-indexed)
    dayOfMonth: 11,
    weekday: 2, // Tuesday
    tithiNumber: 29,
    tithiInPaksha: 14,
    paksha: "krishna",
    tithiGroup: "nanda",
    isAmavasya: false,
    isPurnima: false,
    moonRashiIndex: 3, // Karka
    moonNakshatraIndex: 6, // Punarvasu
    tara: {
      tara: 2,
      count: 2,
      isFavourable: true,
      isDifficult: false,
      score: 90
    },
    chandra: {
      house: 11,
      isChandrashtama: false,
      isFavourable: true,
      score: 85
    },
    dayLord: "Mars",
    bhuktiLord: "Saturn",
    band: "high",
    energyScore: 88,
    arthaScore: 80,
    isChandrashtama: false,
    isMoneyDay: true,
    isJanmaNakshatraDay: false,
    isEkadashi: false,
    isPradosha: false,
    isSankashti: false,
    isPoojaDay: false,
    luckyNumbers: [5, 9],
    luckyColour: "red",
    luckyDirection: "south"
  }
];

describe("icsCalendarGenerator", () => {
  it("calculates accurate daily Kaala timings for Rahu, Gulika, and Yamaganda", () => {
    const kaalaTue = getDailyKaalaTimings("Mars", "en");
    expect(kaalaTue.rahu).toContain("03:00 PM – 04:30 PM");
    expect(kaalaTue.gulika).toContain("12:00 PM – 01:30 PM");
    expect(kaalaTue.yamaganda).toContain("09:00 AM – 10:30 AM");
  });

  it("calculates energy progress bar, color badge, and single-letter vibe tag", () => {
    const vibeHigh = getEnergyMeterAndVibe(mockDays[0]!, "en");
    expect(vibeHigh.badgeEmoji).toBe("🟢");
    expect(vibeHigh.meter).toContain("%");
    expect(vibeHigh.vibeTag).toContain("⚡ A");
    expect(vibeHigh.googleColorId).toBe("10");

    const cautionDay: RhythmDay = {
      ...mockDays[0]!,
      band: "rest",
      isChandrashtama: true,
      energyScore: 30
    };
    const vibeCaution = getEnergyMeterAndVibe(cautionDay, "en");
    expect(vibeCaution.badgeEmoji).toBe("🔴");
    expect(vibeCaution.vibeTag).toContain("🧘 S");
    expect(vibeCaution.googleColorId).toBe("11");

    // Enforce 65% energy score is ALWAYS Yellow 🟡, NEVER Red 🔴
    const yellowDay: RhythmDay = {
      ...mockDays[0]!,
      band: "medium",
      isChandrashtama: false,
      isAmavasya: false,
      energyScore: 65
    };
    const vibeYellow = getEnergyMeterAndVibe(yellowDay, "en");
    expect(vibeYellow.badgeEmoji).toBe("🟡");
    expect(vibeYellow.badgeEmoji).not.toBe("🔴");
  });

  it("generates a luxury RFC 5545 iCalendar payload with royal ASCII framing, deity mantras, and kaala timings", () => {
    const ics = generateSevaICalendarString({
      days: mockDays,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      notificationTime: "08:00",
      personName: "Pramod Kodagi"
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-CALNAME:ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - Pramod Kodagi");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;TZID=Asia/Kolkata:20260811T080000");
    expect(ics).toContain("DTEND;TZID=Asia/Kolkata:20260811T083000");
    expect(ics).toContain("SUMMARY:🟢 [ಕೃಷ್ಣ ಪಕ್ಷ ಚತುರ್ದಶಿ] ಚೈತನ್ಯ ಪಂಡಿತ್ - ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
    expect(ics).toContain("ATTACH;FMTTYPE=image/jpeg");
    expect(ics).toContain("🕉️ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ");
    expect(ics).toContain("Pramod Kodagi");
    expect(ics).toContain("⚡");
    expect(ics).toContain("/daily?token=bgn_v1_");
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("generates a valid Google Calendar Web link with royal ASCII art and RRULE recur parameter", () => {
    const url = generateGoogleCalendarUrl({
      day: mockDays[0]!,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      notificationTime: "08:00",
      personName: "Pramod Kodagi"
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain("ctz=Asia%2FKolkata");
    expect(url).toContain("dates=20260811T080000%2F20260811T083000");
    expect(url).toContain("recur=RRULE%3AFREQ%3DDAILY%3BCOUNT%3D90");
    expect(url).toContain("token%3Dbgn_v1_");
  });

  it("generates platform-specific and multi-target QR code payloads with encrypted tokens", () => {
    const googlePayload = generateQrPayloadByTarget("google", {
      days: mockDays,
      lang: "en",
      panditName: "Pandit Chaitanya",
      notificationTime: "08:00",
      personName: "Pramod Kodagi",
      webAppBaseUrl: "https://baggona.app"
    });
    expect(googlePayload).toContain("/daily?token=bgn_v1_");
    expect(googlePayload).toContain("action=ics90");

    const webcalPayload = generateQrPayloadByTarget("webcal", {
      days: mockDays,
      lang: "en",
      panditName: "Pandit Chaitanya",
      notificationTime: "08:00",
      personName: "Pramod Kodagi",
      webAppBaseUrl: "https://baggona.app"
    });
    expect(webcalPayload).toContain("https://baggona.app/daily?token=bgn_v1_");
    expect(webcalPayload).toContain("action=ics90");

    const sanctumPayload = generateQrPayloadByTarget("sanctum", {
      days: mockDays,
      lang: "en",
      panditName: "Pandit Chaitanya",
      notificationTime: "08:00",
      personName: "Pramod Kodagi",
      webAppBaseUrl: "https://baggona.app"
    });
    expect(sanctumPayload).toContain("https://baggona.app/daily?token=bgn_v1_");

    // Decode token and verify data integrity
    const token = sanctumPayload.split("token=")[1]!;
    const decoded = decodeDevoteeToken(token);
    expect(decoded?.n).toBe("Pramod Kodagi");
    expect(decoded?.p).toBe("Pandit Chaitanya");
    expect(decoded?.d).toBe("2026-08-11");
    expect(decoded?.nk).toBe(6);
    expect(decoded?.r).toBe(3);
  });

  it("formats grammatically correct priest greetings in all 5 languages", () => {
    expect(formatPanditGreeting("Chaitanya Pandit", "kn")).toBe("ಚೈತನ್ಯ ಪಂಡಿತ್ ಅವರಿಂದ ನಮಸ್ಕಾರಗಳು,");
    expect(formatPanditGreeting("Chaitanya Pandit", "hi")).toBe("चैतन्य पंडित जी की ओर से सादर प्रणाम,");
    expect(formatPanditGreeting("Chaitanya Pandit", "te")).toBe("చైతన్య పండిత్ గారి నుండి నమస్కారాలు,");
    expect(formatPanditGreeting("Chaitanya Pandit", "ta")).toBe("சைதன்யா பண்டிட் அவர்களின் அன்பு வணக்கங்கள்,");
    expect(formatPanditGreeting("Chaitanya Pandit", "en")).toBe("With warm greetings from Chaitanya Pandit,");

    expect(formatPanditGreeting("", "kn")).toBe("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಕ್ಷೇತ್ರದಿಂದ ನಮಸ್ಕಾರಗಳು,");
  });
});

describe("sevaPriestNarrativeEngine", () => {
  it("generates 5-language native script Chief Priest salutations", () => {
    expect(getDevoteeSalutation("Pramod", "Chaitanya Pandit", "kn")).toContain("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ Chaitanya Pandit");
    expect(getDevoteeSalutation("Pramod", "Chaitanya Pandit", "hi")).toContain("गोकर्ण महाबलेश्वर क्षेत्र के प्रधान अर्चक");
    expect(getDevoteeSalutation("Pramod", "Chaitanya Pandit", "te")).toContain("గోకర్ణ మహాబలేశ్వర క్షేత్ర ప్రధాన అర్చకులు");
    expect(getDevoteeSalutation("Pramod", "Chaitanya Pandit", "ta")).toContain("கோகர்ண மகாபலேஸ்வரர் ஆலய தலைமை அர்ச்சகர்");
    expect(getDevoteeSalutation("Pramod", "Chaitanya Pandit", "en")).toContain("With divine blessings from Chief Priest");
  });

  it("generates deterministic priest benedictions for high and caution days in all languages", () => {
    const highDay = mockDays[0]!;
    const knText = buildDeterministicPriestBenediction(highDay, "kn", "Pramod");
    expect(knText).toContain("ಶುಭ ಯೋಗ ಕೂಡಿಬಂದಿರುವ ಶುಭದಿನ");

    const cautionDay: RhythmDay = {
      ...highDay,
      band: "rest",
      isChandrashtama: true,
      energyScore: 25
    };
    const cautionKn = buildDeterministicPriestBenediction(cautionDay, "kn", "Pramod");
    expect(cautionKn).toContain("ಶಾಂತ ಹಾಗೂ ಜಾಗರೂಕತೆಯಿಂದ ಇರಬೇಕಾದ ದಿನವಾಗಿದೆ");
    expect(cautionKn).toContain("ಆತ್ಮಲಿಂಗ ಸ್ಮರಣೆ");
  });

  it("generates full Priest narrative bundle including deity mantra and sanctum link", async () => {
    const bundle = await generatePriestDayNarrative({
      day: mockDays[0]!,
      lang: "kn",
      panditName: "Chaitanya Pandit",
      personName: "Pramod",
      webAppBaseUrl: "https://baggona.app"
    });

    expect(bundle.deityMantra).toContain("ಭೌಮಾಯ ನಮಃ");
    expect(bundle.kaalaTimings.rahu).toBeDefined();
    expect(bundle.webSanctumUrl).toBe("https://baggona.app/daily?date=2026-08-11&lang=kn&name=Pramod");
  });
});
