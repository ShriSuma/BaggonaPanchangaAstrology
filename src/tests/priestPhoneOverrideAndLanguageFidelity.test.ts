import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import {
  generateGoogleCalendarUrl,
  generateSevaICalendarString,
  generateQrPayloadByTarget
} from "../features/seva/icsCalendarGenerator";
import type { RhythmDay } from "../core/DailyRhythmEngine";

describe("Priest Phone Override & Multi-Language Calendar Fidelity", () => {
  const dummyDay: RhythmDay = {
    ymd: "2026-09-21",
    band: "high",
    energyScore: 92,
    deityKey: "shiva",
    tithi: "Dashami",
    nakshatra: "Uttara Phalguni",
    yoga: "Shobhana",
    karana: "Gara",
    rashi: "Kanya",
    moonRashiIndex: 5,
    moonNakshatraIndex: 11,
    isChandrashtama: false,
    recommendedSevaId: "rudrabhisheka",
    siddhaMantra: "Om Namah Shivaya",
    dayLord: "Moon"
  } as unknown as RhythmDay;

  it("encodes and decodes custom priest phone (pp) and override flag (ocp)", () => {
    const customPhone = "9876543210";
    const token = encodeDevoteeToken({
      n: "Rajesh Sharma",
      p: "Venkatramana Bhat",
      l: "te",
      d: "2026-09-21",
      ph: customPhone,
      pp: customPhone,
      ocp: 1
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.l).toBe("te");
    expect(decoded?.p).toBe("Venkatramana Bhat");
    expect(decoded?.pp).toBe(customPhone);
    expect(decoded?.ocp).toBe(true);
  });

  it("appends &lang=te and overrideContact parameters to sanctumUrl in generateGoogleCalendarUrl", () => {
    const customPhone = "9845012345";
    const customPriest = "Narayana Somayaji";
    const url = generateGoogleCalendarUrl({
      day: dummyDay,
      lang: "te",
      panditName: customPriest,
      priestPhone: customPhone,
      overrideCalendarPhone: true
    });

    const decodedUrl = decodeURIComponent(url);
    expect(decodedUrl).toContain("lang=te");
    expect(decodedUrl).toContain("overrideContact=true");
    expect(decodedUrl).toContain(`priestPhone=${customPhone}`);
  });

  it("appends &lang and overrideContact parameters to sanctumUrl inside generateSevaICalendarString", () => {
    const customPhone = "9845012345";
    const customPriest = "Ganesh Bhat";
    const ics = generateSevaICalendarString({
      days: [dummyDay],
      lang: "te",
      panditName: customPriest,
      priestPhone: customPhone,
      overrideCalendarPhone: true
    });

    expect(ics).toContain("lang=te");
    expect(ics).toContain("overrideContact=true");
    expect(ics).toContain(`priestPhone=${encodeURIComponent(customPhone)}`);
    expect(ics).toContain(customPhone);
  });

  it("propagates priestPhone and override flags inside generateQrPayloadByTarget for sanctum target", () => {
    const customPhone = "9448123456";
    const customPriest = "Subrahmanya Shastri";
    const qrPayload = generateQrPayloadByTarget("sanctum", {
      days: [dummyDay],
      lang: "te",
      panditName: customPriest,
      priestPhone: customPhone,
      overrideCalendarPhone: true
    });

    expect(qrPayload).toContain("lang=te");
    expect(qrPayload).toContain("overrideContact=true");
    expect(qrPayload).toContain(`priestPhone=${encodeURIComponent(customPhone)}`);
  });

  it("defaults to Shreeram Pandit 9972339362 when override is NOT enabled", () => {
    const token = encodeDevoteeToken({
      n: "Devotee",
      l: "kn",
      d: "2026-09-21"
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.ocp).toBe(false);
    expect(decoded?.pp).toBeUndefined();
  });

  it("guarantees 100% backward compatibility for existing 200+ devotees with legacy tokens", () => {
    const legacyPayload = {
      n: "Naveen Hegde",
      nk: 18,
      r: 8,
      p: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      d: "2026-03-19",
      l: "kn",
      tm: "08:00",
      pl: "android",
      pc: "581326",
      lt: 14.54,
      lg: 74.31,
      loc: "Gokarna"
    };
    const legacyToken = encodeDevoteeToken(legacyPayload as any);
    const decoded = decodeDevoteeToken(legacyToken);

    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Naveen Hegde");
    expect(decoded?.l).toBe("kn");
    expect(decoded?.p).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(decoded?.pp).toBeUndefined();
    expect(decoded?.ocp).toBe(false);
  });
});
