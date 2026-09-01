import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getOrComputeDinaBhavishya,
  computeGocharaMoonForDate,
  formatLocalizedDinaDate
} from "../features/seva/dinaBhavishyaEngine";

describe("Dina Bhavishya Engine & Date Locking", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("calculates authentic Gochara Moon Rashi and Nakshatra for a date", () => {
    const moon = computeGocharaMoonForDate("2026-08-31");
    expect(moon.transitMoonRashi).toBeGreaterThanOrEqual(0);
    expect(moon.transitMoonRashi).toBeLessThan(12);
    expect(moon.transitMoonNakshatra).toBeGreaterThanOrEqual(0);
    expect(moon.transitMoonNakshatra).toBeLessThan(27);
  });

  it("formats localized dates across all 5 languages without crashing", () => {
    const knDate = formatLocalizedDinaDate("2026-08-31", "kn");
    expect(knDate).toContain("ಆಗಸ್ಟ್");
    expect(knDate).toContain("೨೦೨೬");

    const hiDate = formatLocalizedDinaDate("2026-08-31", "hi");
    expect(hiDate).toContain("अगस्त");

    const teDate = formatLocalizedDinaDate("2026-08-31", "te");
    expect(teDate).toContain("ఆగస్టు");

    const taDate = formatLocalizedDinaDate("2026-08-31", "ta");
    expect(taDate).toContain("ஆகஸ்ட்");

    const enDate = formatLocalizedDinaDate("2026-08-31", "en");
    expect(enDate).toBe("31 August 2026");
  });

  it("90-DAY MULTI-DAY SUPPORT: Computes personalized Dina Bhavishya for requested calendar dates (e.g. 2026-09-20) and flags wasFutureRequested accurately", async () => {
    const result = await getOrComputeDinaBhavishya({
      targetDateRequested: "2026-09-20", // Future date!
      devoteeName: "Pramod Kodagi",
      birthDate: "1990-05-15",
      birthTime: "08:30",
      natalMoonRashi: 8, // Dhanu
      natalNakshatra: 18, // Mula
      lang: "kn",
      userIdentifier: "test_devotee_future"
    });

    expect(result.targetDate).toBe("2026-09-20");
    expect(result.wasFutureRequested).toBe(true);
    expect(result.overview.length).toBeGreaterThan(20);
    expect(result.siddhaMantra).toContain("ॐ");
    expect(result.priestBlessing).toContain("ಆಶೀರ್ವಚನ");
  });

  it("computes accurate today's Dina Bhavishya with Chandra Bala & Tara Bala", async () => {
    const todayYmd = new Date().toISOString().split("T")[0];
    const result = await getOrComputeDinaBhavishya({
      targetDateRequested: todayYmd,
      devoteeName: "Manoj Poornamatha",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      natalMoonRashi: 8, // Dhanu
      natalNakshatra: 18, // Mula
      lang: "en",
      userIdentifier: "test_manoj"
    });

    expect(result.targetDate).toBe(todayYmd);
    expect(result.wasFutureRequested).toBe(false);
    expect(result.isToday).toBe(true);
    expect(result.chandraBalaHouse).toBeGreaterThanOrEqual(1);
    expect(result.chandraBalaHouse).toBeLessThanOrEqual(12);
    expect(result.taraBalaNumber).toBeGreaterThanOrEqual(1);
    expect(result.taraBalaNumber).toBeLessThanOrEqual(9);
    expect(result.energyScore).toBeGreaterThanOrEqual(35);
    expect(result.energyScore).toBeLessThanOrEqual(98);
    expect(result.abhijitMuhurtha).toContain("Abhijit Muhurtha");
  });

  it("caches daily predictions in localStorage and loads instantly from cache on subsequent calls", async () => {
    const todayYmd = new Date().toISOString().split("T")[0];
    const firstCall = await getOrComputeDinaBhavishya({
      targetDateRequested: todayYmd,
      devoteeName: "Devotee User",
      birthDate: "1995-10-20",
      birthTime: "11:15",
      natalMoonRashi: 3, // Karka
      natalNakshatra: 7, // Pushya
      lang: "kn",
      userIdentifier: "cached_user_123"
    });

    expect(firstCall.overview).toBeDefined();

    // Verify localStorage item exists
    const cacheKey = `bgn_dina_bhavishya_cached_user_123_${todayYmd}_kn`;
    const cachedItem = localStorage.getItem(cacheKey);
    expect(cachedItem).not.toBeNull();

    // Second call should return identical cached payload
    const secondCall = await getOrComputeDinaBhavishya({
      targetDateRequested: todayYmd,
      devoteeName: "Devotee User",
      birthDate: "1995-10-20",
      birthTime: "11:15",
      natalMoonRashi: 3,
      natalNakshatra: 7,
      lang: "kn",
      userIdentifier: "cached_user_123"
    });

    expect(secondCall.targetDate).toBe(firstCall.targetDate);
    expect(secondCall.overview).toBe(firstCall.overview);
    expect(secondCall.energyScore).toBe(firstCall.energyScore);
  });

  it("calculates active Dasha-Bhukti and integrates it into daily predictions", async () => {
    const todayYmd = new Date().toISOString().split("T")[0];
    const result = await getOrComputeDinaBhavishya({
      targetDateRequested: todayYmd,
      devoteeName: "Venkatesh Bhat",
      birthDate: "1985-06-12",
      birthTime: "06:30",
      natalMoonRashi: 11, // Meena
      natalNakshatra: 26, // Revati (starts in Mercury Mahadasha)
      lang: "kn",
      userIdentifier: "test_venkatesh_dasha"
    });

    expect(result.activeDashaSummary).toBeDefined();
    expect(result.activeDashaSummary).toContain("ಮಹಾದಶಾ");
    expect(result.careerAndFinance).toBeDefined();
    expect(result.careerAndFinance.length).toBeGreaterThan(30);
  });

  it("identifies Chandrashtama (8th house) transit and caps energy score with protection guidance", async () => {
    const todayYmd = new Date().toISOString().split("T")[0];
    const gochara = computeGocharaMoonForDate(todayYmd);
    
    // Set natal Moon to 8 signs behind transit Moon so transit Moon is exactly in 8th house
    const chandrashtamaNatalRashi = (gochara.transitMoonRashi - 7 + 12) % 12;

    const result = await getOrComputeDinaBhavishya({
      targetDateRequested: todayYmd,
      devoteeName: "Ramesh Sharma",
      birthDate: "1990-01-01",
      birthTime: "10:00",
      natalMoonRashi: chandrashtamaNatalRashi,
      natalNakshatra: 0,
      lang: "kn",
      userIdentifier: "test_chandrashtama_user",
      forceRegenerate: true
    });

    expect(result.chandraBalaHouse).toBe(8);
    expect(result.energyScore).toBeLessThanOrEqual(48);
    expect(result.chandraBalaText).toContain("ಚಂದ್ರಾಷ್ಟಮ");
    expect(result.healthAndFamily).toContain("ಚಂದ್ರಾಷ್ಟಮ");
  });
});

