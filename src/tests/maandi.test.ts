import { describe, expect, it } from "vitest";
import { sunTimesSyncForBirth } from "../core/birthSunTimes";
import { computeMaandi } from "../core/MaandiEngine";
import { rashiAmshaFromDegree } from "../core/localeNumbers";

describe("MaandiEngine", () => {
  it("Gokarna morning birth — Mandi in Kanyā (traditional Mandi Ghati)", () => {
    const birth = new Date("1993-05-31T09:25:00+05:30");
    const sun = sunTimesSyncForBirth(birth, 14.5479, 74.3187, "581326");
    const m = computeMaandi(birth, 14.5479, 74.3187, "581326", "lahiri", sun);
    expect(m.rashi.sanskrit).toBe("Kanya");
    expect(rashiAmshaFromDegree(m.degree)).toBe(12);
    expect(m.navamsha).toBe(6);
  });

  it("handles night birth before sunrise without double weekday subtraction", () => {
    // 2026-06-01 is Monday. 03:30 AM is before sunrise (approx 06:00).
    // Hindu day must be Sunday (wd = 0). MANDI_GHATI_NIGHT[0] = 10.
    const birthPreSunrise = new Date("2026-06-01T03:30:00+05:30");
    const m = computeMaandi(birthPreSunrise, 14.5479, 74.3187, "581326", "lahiri");
    expect(m.degree).toBeGreaterThanOrEqual(0);
    expect(m.degree).toBeLessThan(360);
    expect(m.windowLabel).toContain("10 Gh");
    expect(m.navamsha).toBeGreaterThanOrEqual(1);
    expect(m.navamsha).toBeLessThanOrEqual(12);
  });

  it("handles night birth after sunset", () => {
    // 2026-06-01 Monday 22:30 is after sunset (approx 19:00).
    // Hindu day is Monday (wd = 1). MANDI_GHATI_NIGHT[1] = 6.
    const birthPostSunset = new Date("2026-06-01T22:30:00+05:30");
    const m = computeMaandi(birthPostSunset, 14.5479, 74.3187, "581326", "lahiri");
    expect(m.degree).toBeGreaterThanOrEqual(0);
    expect(m.degree).toBeLessThan(360);
    expect(m.windowLabel).toContain("6 Gh");
    expect(m.navamsha).toBeGreaterThanOrEqual(1);
    expect(m.navamsha).toBeLessThanOrEqual(12);
  });

  it("computes accurately even when sunTimes is omitted (resilient fallback)", () => {
    const birth = new Date("1993-05-31T09:25:00+05:30");
    const m = computeMaandi(birth, 14.5479, 74.3187, "581326", "lahiri");
    expect(m.rashi.sanskrit).toBe("Kanya");
    expect(m.navamsha).toBe(6);
  });

  it("returns degree in range and a non-empty window label", () => {
    const birth = new Date("2026-05-09T14:00:00");
    const sun = sunTimesSyncForBirth(birth, 19.076, 72.8777, "");
    const m = computeMaandi(birth, 19.076, 72.8777, "", "lahiri", sun);
    expect(m.degree).toBeGreaterThanOrEqual(0);
    expect(m.degree).toBeLessThan(360);
    expect(m.windowLabel.length).toBeGreaterThan(3);
    expect(m.rashi.index).toBeGreaterThanOrEqual(0);
    expect(m.rashi.index).toBeLessThanOrEqual(11);
  });
});
