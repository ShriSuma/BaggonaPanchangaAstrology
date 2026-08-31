import { describe, it, expect } from "vitest";
import {
  getParabhavaDayDetails,
  getParabhavaMonthRecords,
  isDateInParabhavaYear,
  getParabhavaAnnualSummary,
  PARABHAVA_MONTH_PAKSHAS
} from "../core/ParabhavaBookEngine";

describe("ParabhavaBookEngine (ಪರಾಭವ ಸಂವತ್ಸರ ಮಾಸ್ಟರ್ ಪಂಚಾಂಗ ಎಂಜಿನ್)", () => {
  it("extracts exact Ugadi / Vatsararambha day (2026-03-19) details from Page 40 & 41", () => {
    const day = getParabhavaDayDetails("2026-03-19");

    expect(day.date).toBe("2026-03-19");
    expect(day.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(day.shakaYear).toBe(1948);
    expect(day.chandramanaMasaKn).toBe("ಚೈತ್ರ");
    expect(day.pakshaKn).toBe("ಶುಕ್ಲ");
    expect(day.sauramanaMasaKn).toBe("ಮೀನ");
    expect(day.sauramanaDina).toBe(5);
    expect(day.weekdayShortKn).toBe("ಗುರು");

    // Left Page assertions
    expect(day.shraddhaTithi).toBe("ಪಾಡ್ಯ ಶ್ರಾದ್ಧ");
    expect(day.festivalsAndVratas).toContain("ವತ್ಸರಪ್ರಾರಂಭಃ (ಯುಗಾದಿ)");
    expect(day.festivalsAndVratas).toContain("ಅಭ್ಯಂಗಸ್ನಾನ");
    expect(day.festivalsAndVratas).toContain("ಧ್ವಜಾರೋಪಣಂ");
    expect(day.specialYogasAndNotes).toContain("ನೂತನ ಪಂಚಾಂಗ ಶ್ರವಣಂ");

    // Right Page assertions (Lagna Ending Times)
    expect(day.lagnaEndingTimes).toBeDefined();
    expect(day.lagnaEndingTimes.meena).toBeDefined();
    expect(day.lagnaEndingTimes.mesha).toBeDefined();
    expect(day.lagnaEndingTimes.vrishabha).toBeDefined();

    // Planetary Coordinates (Graha Spashta)
    expect(day.grahaSpashta.ravi.planetKn).toBe("ರವಿ");
    expect(day.grahaSpashta.ravi.rashiKn).toBe("ಮೀನ");
    expect(day.grahaSpashta.shani.rashiKn).toBe("ಮೀನ");
    expect(day.grahaSpashta.guru.rashiKn).toBe("ಮಿಥುನ");
    expect(day.grahaSpashta.kuja.rashiKn).toBe("ಕುಂಭ");
  });

  it("extracts exact Shri Rama Navami day (2026-03-27) details", () => {
    const day = getParabhavaDayDetails("2026-03-27");

    expect(day.tithiKn).toBe("ನವಮಿ");
    expect(day.shraddhaTithi).toBe("ನವಮಿ ಶ್ರಾದ್ಧ");
    expect(day.festivalsAndVratas.some((f) => f.includes("ಶ್ರೀರಾಮನವಮೀ"))).toBe(true);
    expect(day.festivalsAndVratas.some((f) => f.includes("ವನವಾಸಿ ಸೀತಾರಾಮ ಲಕ್ಷ್ಮಣ"))).toBe(true);
  });

  it("extracts exact Kamada Ekadashi day (2026-03-29) details", () => {
    const day = getParabhavaDayDetails("2026-03-29");

    expect(day.tithiKn).toBe("ಏಕಾದಶಿ");
    expect(day.shraddhaTithi).toBe("ಏಕಾದಶಿ ಶ್ರಾದ್ಧ");
    expect(day.festivalsAndVratas.some((f) => f.includes("ಸರ್ವೇಷಾಮೇಕಾದಶೀ"))).toBe(true);
  });

  it("extracts exact Hanuma Jayanti & Chaitra Purnima (2026-04-02) details", () => {
    const day = getParabhavaDayDetails("2026-04-02");

    expect(day.tithiKn).toBe("ಹುಣ್ಣಿಮೆ");
    expect(day.shraddhaTithi).toBe("ಹುಣ್ಣಿಮೆ ಶ್ರಾದ್ಧ");
    expect(day.festivalsAndVratas.some((f) => f.includes("ಹನುಮಜ್ಜಯಂತೀ"))).toBe(true);
    expect(day.festivalsAndVratas.some((f) => f.includes("ಚಿತ್ರಾಪುರ ರಥೋತ್ಸವಃ"))).toBe(true);
  });

  it("extracts exact Ganesha Chaturthi (2026-09-14) details", () => {
    const day = getParabhavaDayDetails("2026-09-14");

    // Sunrise tithi is Tritiya (3), transitioning into Chaturthi during Madhyahna for Ganesha Pooja
    expect(day.tithiKn).toBe("ತದಿಗೆ");
    expect(day.shraddhaTithi).toBe("ಚೌತಿ ಶ್ರಾದ್ಧ");
    expect(day.festivalsAndVratas.some((f) => f.includes("ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ"))).toBe(true);
    expect(day.festivalsAndVratas.some((f) => f.includes("ಸ್ವರ್ಣಗೌರಿ ವ್ರತ"))).toBe(true);
  });

  it("extracts exact Maha Shivaratri (2027-03-06) details", () => {
    const day = getParabhavaDayDetails("2027-03-06");

    expect(day.festivalsAndVratas.some((f) => f.includes("ಮಹಾಶಿವರಾತ್ರಿ ವ್ರತ"))).toBe(true);
    expect(day.festivalsAndVratas.some((f) => f.includes("ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾರಥೋತ್ಸವ"))).toBe(true);
  });

  it("returns all 15 records for Chaitra Shukla Masa with full Left & Right page data", () => {
    const records = getParabhavaMonthRecords("Chaitra", "Shukla");

    expect(records.length).toBe(15);
    expect(records[0].date).toBe("2026-03-19");
    expect(records[14].date).toBe("2026-04-02");

    // Every record must have all required dual-page fields
    for (const r of records) {
      expect(r.tithiKn).toBeTruthy();
      expect(r.nakshatraKn).toBeTruthy();
      expect(r.yogaKn).toBeTruthy();
      expect(r.karanaKn).toBeTruthy();
      expect(r.suryodaya).toBeTruthy();
      expect(r.suryasta).toBeTruthy();
      expect(r.dinapramana).toBeTruthy();
      expect(r.shraddhaTithi).toBeTruthy();
      expect(r.lagnaEndingTimes.meena).toBeTruthy();
      expect(r.grahaSpashta.ravi.rashiKn).toBeTruthy();
    }
  });

  it("verifies date range boundaries for Parabhava Samvatsara", () => {
    expect(isDateInParabhavaYear("2026-03-19")).toBe(true);
    expect(isDateInParabhavaYear("2026-10-15")).toBe(true);
    expect(isDateInParabhavaYear("2027-04-07")).toBe(true);
    expect(isDateInParabhavaYear("2025-01-01")).toBe(false);
    expect(isDateInParabhavaYear("2028-05-01")).toBe(false);
  });

  it("verifies Parabhava annual summary metadata", () => {
    const summary = getParabhavaAnnualSummary();

    expect(summary.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(summary.shakaYear).toBe(1948);
    expect(summary.raja.planetKn).toContain("ಗುರು");
    expect(summary.mantri.planetKn).toContain("ಕುಜ");
    expect(PARABHAVA_MONTH_PAKSHAS.length).toBe(26);
  });
});
