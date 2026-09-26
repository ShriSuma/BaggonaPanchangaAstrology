import { describe, it, expect } from "vitest";
import {
  MULTI_DAY_FESTIVALS,
  MASTER_ANNUAL_FESTIVALS,
  searchBaggonaFestivals,
  getBaggonaFestivalForDate,
  getActiveMultiDayFestivalForDate
} from "../core/BaggonaFestivalRegistry";
import { generatePriestDayDossier } from "../core/PriestCalendarEngine";

describe("Baggona Calendar Festival & Voice Engine Audit", () => {
  it("1. Navaratri / Dasara multi-day group contains all 10 consecutive days with full astrological details", () => {
    const dasaraGroup = MULTI_DAY_FESTIVALS.find((g) => g.id === "navaratri_dasara");
    expect(dasaraGroup).toBeDefined();
    expect(dasaraGroup?.totalDays).toBe(10);
    expect(dasaraGroup?.days).toHaveLength(10);

    // Verify Day 1 is Ghatasthapana on 2026-10-11
    const day1 = dasaraGroup?.days[0];
    expect(day1?.dayNumber).toBe(1);
    expect(day1?.date).toBe("2026-10-11");
    expect(day1?.titleKn).toContain("ಘಟಸ್ಥಾಪನೆ");
    expect(day1?.tithiKn).toContain("ಪಾಡ್ಯ");
    expect(day1?.pujaWindowKn).toContain("06:38 AM");

    // Verify Day 9 is Mahanavami & Ayudha Puja on 2026-10-19
    const day9 = dasaraGroup?.days[8];
    expect(day9?.dayNumber).toBe(9);
    expect(day9?.date).toBe("2026-10-19");
    expect(day9?.titleKn).toContain("ಆಯುಧ ಪೂಜೆ");
    expect(day9?.tithiKn).toContain("ನವಮಿ");

    // Verify Day 10 is Vijayadashami on 2026-10-20
    const day10 = dasaraGroup?.days[9];
    expect(day10?.dayNumber).toBe(10);
    expect(day10?.date).toBe("2026-10-20");
    expect(day10?.titleKn).toContain("ವಿಜಯದಶಮಿ");
    expect(day10?.tithiKn).toContain("ದಶಮಿ");
    expect(day10?.pujaWindowKn).toContain("01:45 PM - 03:15 PM");
  });

  it("2. Deepavali multi-day festival contains all 4 consecutive days with exact puja windows", () => {
    const deepavaliGroup = MULTI_DAY_FESTIVALS.find((g) => g.id === "deepavali_parva");
    expect(deepavaliGroup).toBeDefined();
    expect(deepavaliGroup?.totalDays).toBe(4);
    expect(deepavaliGroup?.days).toHaveLength(4);

    // Day 1: Dhanteras / Water filling (2026-11-07)
    expect(deepavaliGroup?.days[0].date).toBe("2026-11-07");
    expect(deepavaliGroup?.days[0].titleKn).toContain("ಧನತ್ರಯೋದಶಿ");

    // Day 2: Naraka Chaturdashi (2026-11-08)
    expect(deepavaliGroup?.days[1].date).toBe("2026-11-08");
    expect(deepavaliGroup?.days[1].titleKn).toContain("ನರಕ ಚತುರ್ದಶಿ");
    expect(deepavaliGroup?.days[1].pujaWindowKn).toContain("04:45 AM - 06:15 AM");

    // Day 3: Lakshmi Puja on Diwali Amavasya (2026-11-09)
    expect(deepavaliGroup?.days[2].date).toBe("2026-11-09");
    expect(deepavaliGroup?.days[2].titleKn).toContain("ಲಕ್ಷ್ಮೀ ಪೂಜೆ");
    expect(deepavaliGroup?.days[2].pujaWindowKn).toContain("06:15 PM - 08:35 PM");

    // Day 4: Bali Padyami / Go Puja (2026-11-10)
    expect(deepavaliGroup?.days[3].date).toBe("2026-11-10");
    expect(deepavaliGroup?.days[3].titleKn).toContain("ಬಲಿಪಾಡ್ಯಮಿ");
  });

  it("3. Bilingual Voice & Text Search resolves spoken terms accurately in Kannada and English", () => {
    // English 'Dasara' -> resolves 10-day Dasara group
    const res1 = searchBaggonaFestivals("Dasara");
    expect(res1.matchedMultiDayGroup?.id).toBe("navaratri_dasara");

    // Kannada 'ದಸರಾ' -> resolves 10-day Dasara group
    const res2 = searchBaggonaFestivals("ದಸರಾ");
    expect(res2.matchedMultiDayGroup?.id).toBe("navaratri_dasara");

    // English 'Deepavali' -> resolves 4-day Deepavali group
    const res3 = searchBaggonaFestivals("Deepavali");
    expect(res3.matchedMultiDayGroup?.id).toBe("deepavali_parva");

    // Kannada 'ದೀಪಾವಳಿ' -> resolves 4-day Deepavali group
    const res4 = searchBaggonaFestivals("ದೀಪಾವಳಿ");
    expect(res4.matchedMultiDayGroup?.id).toBe("deepavali_parva");

    // 'Rama Navami'
    const res5 = searchBaggonaFestivals("Rama Navami");
    expect(res5.matchedMultiDayGroup?.id).toBe("vasanta_navaratri_ramonavami");
    expect(res5.exactMatch?.date).toBe("2026-03-27");

    // 'Ganesha'
    const res6 = searchBaggonaFestivals("Ganesha");
    expect(res6.matchedMultiDayGroup?.id).toBe("ganesha_gowri_parva");
    expect(res6.exactMatch?.nameKn).toContain("ವಿನಾಯಕ");

    // 'Shivaratri' / 'ಶಿವರಾತ್ರಿ'
    const res7 = searchBaggonaFestivals("ಶಿವರಾತ್ರಿ");
    expect(res7.exactMatch?.date).toBe("2027-03-06");
    expect(res7.exactMatch?.nameKn).toContain("ಮಹಾಶಿವರಾತ್ರಿ");
  });

  it("4. Master Annual Festivals registry covers all months and major observances", () => {
    expect(MASTER_ANNUAL_FESTIVALS.length).toBeGreaterThanOrEqual(30);

    // Verify key canonical dates
    const yugadi = getBaggonaFestivalForDate("2026-03-19");
    expect(yugadi).toBeDefined();
    expect(yugadi?.nameKn).toContain("ಯುಗಾದಿ");

    const varamahalakshmi = getBaggonaFestivalForDate("2026-08-21");
    expect(varamahalakshmi).toBeDefined();
    expect(varamahalakshmi?.nameKn).toContain("ವರಮಹಾಲಕ್ಷ್ಮೀ");

    const gokulashtami = getBaggonaFestivalForDate("2026-09-04");
    expect(gokulashtami).toBeDefined();
    expect(gokulashtami?.nameKn).toContain("ಜನ್ಮಾಷ್ಟಮೀ");

    const sankranti = getBaggonaFestivalForDate("2027-01-14");
    expect(sankranti).toBeDefined();
    expect(sankranti?.nameKn).toContain("ಮಕರ ಸಂಕ್ರಾಂತಿ");

    const shivaratri = getBaggonaFestivalForDate("2027-03-06");
    expect(shivaratri).toBeDefined();
    expect(shivaratri?.nameKn).toContain("ಮಹಾಶಿವರಾತ್ರಿ");
  });

  it("5. Daily Panchanga Dossier for any selected date provides complete astrological data", () => {
    const testDate = "2026-10-19"; // Mahanavami / Ayudha Puja
    const dossier = generatePriestDayDossier(testDate, 14.5479, 74.3187, "581326");

    expect(dossier.dateStr).toBe(testDate);
    expect(dossier.samvatsaraKn).toBe("ಪರಾಭವ");
    expect(dossier.chandramanaMasaKn).toBe("ಆಶ್ವಯುಜ");
    expect(dossier.pakshaKn).toBe("ಶುಕ್ಲ");
    expect(dossier.tithiKn).toBe("ನವಮಿ");
    expect(dossier.tithiEndTime).toBeTruthy();
    expect(dossier.nakshatraKn).toBeTruthy();
    expect(dossier.suryodaya).toBeTruthy();
    expect(dossier.suryasta).toBeTruthy();
    expect(dossier.rahuKaala).toBeTruthy();
    expect(dossier.shraddhaTithi).toBeTruthy();

    // 12 Dina Lagna Ending Times
    expect(dossier.lagnaEndingTimes.mesha).toBeTruthy();
    expect(dossier.lagnaEndingTimes.meena).toBeTruthy();

    // Gochara 4x4 chart mapping
    expect(Object.keys(dossier.gocharaHouseMap).length).toBeGreaterThan(0);
    expect(dossier.gocharaPlacements.length).toBe(9); // 9 Navagrahas
  });

  it("6. BaggonaCalendarPage contains strict mobile containment and responsive classes", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const pageCode = fs.readFileSync(
      path.resolve(__dirname, "../pages/BaggonaCalendarPage.tsx"),
      "utf-8"
    );

    // Mobile header compactness
    expect(pageCode).toContain("backdrop-blur-md");
    expect(pageCode).toContain("truncate");

    // Horizontal scrolling chips without vertical line wrap clutter
    expect(pageCode).toContain("overflow-x-auto no-scrollbar");

    // Mobile stepper equal 3-column distribution
    expect(pageCode).toContain("grid grid-cols-3 gap-1.5 sm:flex");

    // 5 Angas 2-column mobile card balance with Vara spanning full width
    expect(pageCode).toContain("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5");
    expect(pageCode).toContain("col-span-2 lg:col-span-1");

    // Gochara 4x4 Kundali aspect-square scaling
    expect(pageCode).toContain("aspect-square");

    // Table horizontal protection on small screens
    expect(pageCode).toContain("min-w-[360px]");
    expect(pageCode).toContain("overflow-x-auto");
  });
});
