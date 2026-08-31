import { describe, it, expect, beforeEach } from "vitest";
import {
  getActiveEngineMode,
  updateActiveEngineMode,
  calculateUnifiedBaggona
} from "../core/PanchangaCalculationDispatcher";
import {
  getPanchangaEngineConfig,
  savePanchangaEngineConfig
} from "../db/firestoreDb";

describe("PanchangaCalculationDispatcher (ಪಂಚಾಂಗ ಗಣನೆ ನಿಯಂತ್ರಕ & Super Admin Toggle)", () => {
  beforeEach(async () => {
    // Reset to official Baggona Book mode before each test
    await updateActiveEngineMode("baggona_book", "test_admin");
  });

  it("defaults to Baggona Panchanga Book Engine (baggona_book)", () => {
    const mode = getActiveEngineMode();
    expect(mode).toBe("baggona_book");
  });

  it("calculates authentic Baggona Panchanga data when engineMode is baggona_book for Yugadi 2026-03-19", () => {
    const panchang = calculateUnifiedBaggona("2026-03-19", "06:38", 14.5479, 74.3188);

    expect(panchang.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(panchang.shakaYear).toBe(1948);
    expect(panchang.masaKn).toBe("ಚೈತ್ರ");
    expect(panchang.pakshaKn).toBe("ಶುಕ್ಲ");
    expect(panchang.tithiKn).toBe("ಪಾಡ್ಯ");
    expect(panchang.tithiGhati).toBe(46);
    expect(panchang.tithiVighati).toBe(30);
    expect(panchang.moonNakshatraKn).toBe("ಉತ್ತರಾಭಾದ್ರಾ");
    expect(panchang.sankrantiGataDina).toBe(5);
  });

  it("dynamically switches to mathematical Drik-Ganita engine when toggled in database", async () => {
    await updateActiveEngineMode("mathematical", "superadmin");
    expect(getActiveEngineMode()).toBe("mathematical");

    const panchang = calculateUnifiedBaggona("2026-03-19", "06:38", 14.5479, 74.3188);
    expect(panchang).toBeDefined();
    expect(panchang.tithiKn).toBeTruthy();
    expect(panchang.moonNakshatraKn).toBeTruthy();

    const configInDb = await getPanchangaEngineConfig();
    expect(configInDb.engineMode).toBe("mathematical");
  });

  it("persists toggle changes to Firestore DB with audit metadata", async () => {
    const saved = await savePanchangaEngineConfig("baggona_book", "shreeram_pandit");

    expect(saved.engineMode).toBe("baggona_book");
    expect(saved.updatedBy).toBe("shreeram_pandit");
    expect(saved.bookYear).toContain("Parabhava");
    expect(saved.updatedAt).toBeTruthy();
  });
});
