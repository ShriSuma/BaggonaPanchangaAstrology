import { describe, it, expect } from "vitest";
import {
  calculateYearlyAstodaya,
  calculateYearlyEclipses,
  calculateAnnualAstroReport,
  LOCATION_PRESETS
} from "../core/AstodayaGrahanaEngine";

describe("AstodayaGrahanaEngine Parashari & Astronomical Precision Audit", () => {
  it("calculates Guru & Shukra Astodaya and Moudhya windows for 2026", () => {
    const { events, periods } = calculateYearlyAstodaya(2026);

    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(periods.length).toBeGreaterThanOrEqual(1);

    // Verify Jupiter combustion
    const jupAsta = events.find((e) => e.planet === "Jupiter" && e.eventType === "asta");
    const jupUdaya = events.find((e) => e.planet === "Jupiter" && e.eventType === "udaya");

    expect(jupAsta).toBeDefined();
    expect(jupUdaya).toBeDefined();
    expect(jupAsta!.dateStr).toContain("2026-07");
    expect(jupUdaya!.dateStr).toContain("2026-08");
    expect(jupUdaya!.direction).toBe("East"); // Outer planet rises in East after conjunction

    // Verify 5-language localization
    expect(jupAsta!.rashi.kn).toBeDefined();
    expect(jupAsta!.nakshatra.kn).toBeDefined();
    expect(jupAsta!.significance.kn).toContain("ಮೌಢ್ಯ");
    expect(jupAsta!.significance.en).toContain("combustion");

    // Verify Venus events
    const venEvents = events.filter((e) => e.planet === "Venus");
    expect(venEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("calculates all global eclipses for 2026 with exact Rashi and Nakshatra", () => {
    const globalEclipses = calculateYearlyEclipses(2026, "world");

    expect(globalEclipses.length).toBe(4); // 2 Solar, 2 Lunar in 2026

    const solars = globalEclipses.filter((e) => e.type === "surya");
    const lunars = globalEclipses.filter((e) => e.type === "chandra");

    expect(solars.length).toBe(2);
    expect(lunars.length).toBe(2);

    for (const e of globalEclipses) {
      expect(e.peakDateStr).toBeDefined();
      expect(e.peakTimeIst).toContain("IST");
      expect(e.peakTimeUtc).toContain("UTC");
      expect(e.rashi.kn.length).toBeGreaterThan(1);
      expect(e.nakshatra.kn.length).toBeGreaterThan(1);
      expect(e.impact.rashiSummary.length).toBe(12);

      // Verify 12-Rashi Phala breakdown
      const shubha = e.impact.rashiSummary.filter((r) => r.effect === "shubha");
      const ashubha = e.impact.rashiSummary.filter((r) => r.effect === "ashubha");
      expect(shubha.length).toBe(4); // 3, 6, 10, 11
      expect(ashubha.length).toBe(4); // 1, 4, 8, 12
    }
  });

  it("evaluates location-based visibility and Sutaka rules for Karnataka vs. World", () => {
    const worldReport = calculateAnnualAstroReport(2026, "world");
    const karnatakaReport = calculateAnnualAstroReport(2026, "karnataka");

    expect(worldReport.totalGlobalEclipsesCount).toBe(4);
    expect(karnatakaReport.totalGlobalEclipsesCount).toBe(4);

    // Some eclipses invisible in Karnataka should be marked invisible with no Sutaka
    const invisibleInKarnataka = karnatakaReport.eclipses.filter((e) => !e.visibility.isVisibleInSelected);
    expect(invisibleInKarnataka.length).toBeGreaterThanOrEqual(1);

    for (const inv of invisibleInKarnataka) {
      expect(inv.visibility.sutakaApplicable).toBe(false);
      expect(inv.visibility.statusBadge.kn).toContain("ಅದೃಶ್ಯ");
      expect(inv.visibility.visibilityDetails.kn).toContain("ಯಾವುದೇ ಸೂತಕ");
    }
  });

  it("computes accurately for historical past (1999) and distant future (2050)", () => {
    const pastReport = calculateAnnualAstroReport(1999, "india");
    const futureReport = calculateAnnualAstroReport(2050, "india");

    expect(pastReport.eclipses.length).toBeGreaterThanOrEqual(2);
    expect(pastReport.astodayaEvents.length).toBeGreaterThanOrEqual(1);

    expect(futureReport.eclipses.length).toBeGreaterThanOrEqual(2);
    expect(futureReport.astodayaEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("provides location presets including World, India, Karnataka and major states", () => {
    const ids = LOCATION_PRESETS.map((p) => p.id);
    expect(ids).toContain("world");
    expect(ids).toContain("india");
    expect(ids).toContain("karnataka");
    expect(ids).toContain("maharashtra");
    expect(ids).toContain("tamilnadu");
  });

  it("computes authentic 8-point Dikku contact directions (Sparsha, Madhya, Moksha) for 2026 eclipses", () => {
    const eclipses = calculateYearlyEclipses(2026, "karnataka");
    expect(eclipses.length).toBe(4);

    for (const e of eclipses) {
      expect(e.contactDirections).toBeDefined();
      const cd = e.contactDirections!;
      expect(cd.sparshaDikku.code).toBeDefined();
      expect(cd.sparshaDikku.label.kn).toBeDefined();
      expect(cd.sparshaDikku.label.en).toBeDefined();
      expect(cd.mokshaDikku.code).toBeDefined();
      expect(cd.mokshaDikku.label.kn).toBeDefined();
      expect(cd.mokshaDikku.label.en).toBeDefined();
      expect(cd.madhyaDirection.label.kn).toBeDefined();
      expect(cd.pathDescription.kn).toBeDefined();
    }

    // In 2026-03-03 total lunar eclipse, lunar eclipse starts from East/SE and exits towards West/NW
    const marchLunar = eclipses.find((e) => e.peakDateStr.includes("2026-03"));
    expect(marchLunar).toBeDefined();
    expect(marchLunar!.contactDirections!.sparshaDikku.code).toBe("SE");
    expect(marchLunar!.contactDirections!.sparshaDikku.label.kn).toContain("ಆಗ್ನೇಯ");
    expect(marchLunar!.contactDirections!.mokshaDikku.code).toBe("NW");
    expect(marchLunar!.contactDirections!.mokshaDikku.label.kn).toContain("ವಾಯವ್ಯ");
  });

  it("verifies accurate 2026 Venus Asta start date in October using Arcus Visionis & Drik standards", () => {
    const { events, periods } = calculateYearlyAstodaya(2026);
    const venOctPeriod = periods.find(
      (p) => p.planet === "Venus" && p.astaDateStr.includes("2026-10")
    );

    expect(venOctPeriod).toBeDefined();
    // Venus Asta starts October 12, 2026 and Udaya October 29, 2026 (inferior conjunction), matching Drik Panchang
    expect(venOctPeriod!.astaDateStr).toBe("2026-10-12");
    expect(venOctPeriod!.udayaDateStr).toBe("2026-10-29");
    expect([16, 17]).toContain(venOctPeriod!.durationDays);
  });

  it("verifies accurate 2027 Guru Astha/Udaya and Shukra Astha/Udaya requested by user", () => {
    const { events, periods } = calculateYearlyAstodaya(2027);

    // Guru (Jupiter) 2027
    const guruPeriod = periods.find((p) => p.planet === "Jupiter" && p.astaDateStr.includes("2027-08"));
    expect(guruPeriod).toBeDefined();
    // Jupiter Asta on Aug 17, 2027; Udaya on Sep 13/14, 2027 (matching Drik Panchang)
    expect(guruPeriod!.astaDateStr).toBe("2027-08-17");
    expect(["2027-09-13", "2027-09-14"]).toContain(guruPeriod!.udayaDateStr);
    expect(guruPeriod!.direction.en).toContain("East");

    // Shukra (Venus) 2027
    const shukraPeriod = periods.find((p) => p.planet === "Venus" && p.astaDateStr.includes("2027-07"));
    expect(shukraPeriod).toBeDefined();
    // Venus Asta on July 21/22, 2027; Udaya on Sep 09, 2027 (Superior conjunction, Udaya in West)
    expect(["2027-07-21", "2027-07-22"]).toContain(shukraPeriod!.astaDateStr);
    expect(shukraPeriod!.udayaDateStr).toBe("2027-09-09");
    expect(shukraPeriod!.direction.en).toContain("West");
  });
});
