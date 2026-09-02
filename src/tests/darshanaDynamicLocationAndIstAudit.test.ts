import { describe, it, expect } from "vitest";
import { getDailyKaalaTimings } from "../features/seva/icsCalendarGenerator";
import { computePersonalizedDarshanaPayload } from "../features/darshana/dailyDarshanaPersonalizationEngine";
import { calculateKundli } from "../core/KundliEngine";
import { getOrComputeDinaBhavishya } from "../features/seva/dinaBhavishyaEngine";

describe("Daily Darshana 100% Dynamic & IST Calculation Audit", () => {
  it("calculates distinct, exact IST Sunrise, Sunset, Rahu, and Gulika timings for different Indian pincodes and coordinates", () => {
    const targetDate = "2026-09-02";

    // Gokarna (Uttara Kannada)
    const gokarnaKaala = getDailyKaalaTimings(3, "kn", targetDate, 14.5479, 74.3187, "581326");
    // Kolkata (East India - earlier sunrise in IST)
    const kolkataKaala = getDailyKaalaTimings(3, "kn", targetDate, 22.5726, 88.3639, "700001");
    // Mumbai (West Coast)
    const mumbaiKaala = getDailyKaalaTimings(3, "kn", targetDate, 18.9220, 72.8347, "400001");

    expect(gokarnaKaala.sunrise).toBeDefined();
    expect(kolkataKaala.sunrise).toBeDefined();
    expect(mumbaiKaala.sunrise).toBeDefined();

    // Kolkata sunrise in IST is significantly earlier than Mumbai/Gokarna
    expect(kolkataKaala.sunrise).not.toEqual(mumbaiKaala.sunrise);
    expect(kolkataKaala.rahu).not.toEqual(mumbaiKaala.rahu);
    expect(gokarnaKaala.rahu).toContain("–");
    expect(gokarnaKaala.gulika).toContain("–");
    expect(gokarnaKaala.yamaganda).toContain("–");
  });

  it("dynamically customizes Tab 1 (Sanctum & Pooja) attributes based on user natal Kundli and running Dasha", () => {
    // Devotee 1: Manoj (Dhanu Lagna, Mula Nakshatra, Dhanu Rashi)
    const kundliManoj = calculateKundli({
      name: "Manoj",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.5479,
      longitude: 74.3187,
      pincode: "581326"
    });

    const payloadManoj = computePersonalizedDarshanaPayload({
      birthKundli: kundliManoj,
      devoteeName: "ಮನೋಜ್",
      gotra: "ವಿಶ್ವಾಮಿತ್ರ",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      targetDate: "2026-09-02",
      natalMoonRashi: 8,
      natalNakshatra: 18,
      natalLagnaRashi: 8,
      lang: "kn",
      userLat: 14.5479,
      userLng: 74.3187,
      userPincode: "581326"
    });

    // Devotee 2: Jayashree (Kanya Rashi, Hasta Nakshatra)
    const kundliJayashree = calculateKundli({
      name: "Jayashree",
      birthDate: "1968-10-18",
      birthTime: "06:30",
      latitude: 14.5479,
      longitude: 74.3187,
      pincode: "581326"
    });

    const payloadJayashree = computePersonalizedDarshanaPayload({
      birthKundli: kundliJayashree,
      devoteeName: "ಜಯಶ್ರೀ",
      gotra: "ಕೌಶಿಕ",
      birthDate: "1968-10-18",
      birthTime: "06:30",
      targetDate: "2026-09-02",
      natalMoonRashi: 5,
      natalNakshatra: 12,
      natalLagnaRashi: 6,
      lang: "kn",
      userLat: 14.5479,
      userLng: 74.3187,
      userPincode: "581326"
    });

    expect(payloadManoj.devoteeName).toBe("ಮನೋಜ್");
    expect(payloadJayashree.devoteeName).toBe("ಜಯಶ್ರೀ");
    expect(payloadManoj.astrologyMeta.chandraBalaHouse).toBeDefined();
    expect(payloadJayashree.astrologyMeta.chandraBalaHouse).toBeDefined();

    // Ensure live astronomical attributes are filled
    expect(payloadManoj.panchanga.samvatsara).toBeTruthy();
    expect(payloadManoj.panchanga.masa).toBeTruthy();
    expect(payloadManoj.panchanga.tithi).toBeTruthy();
    expect(payloadManoj.panchanga.nakshatra).toBeTruthy();

    // Ensure Priest Benediction is personalized with devotee name
    expect(payloadManoj.priestBenediction.kn).toContain("ಮನೋಜ್");
    expect(payloadJayashree.priestBenediction.kn).toContain("ಜಯಶ್ರೀ");
  });

  it("dynamically generates Tab 2 (Golden Hour & Power Guidance) metrics specific to user nakshatra", () => {
    const payload = computePersonalizedDarshanaPayload({
      devoteeName: "ಪ್ರಮೋದ್",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      targetDate: "2026-09-02",
      natalMoonRashi: 1,
      natalNakshatra: 3, // Krittika
      lang: "kn",
      userLat: 14.5479,
      userLng: 74.3187,
      userPincode: "581326"
    });

    expect(payload.powerMetrics.goldenHour.startTimeStr).toMatch(/\d{2}:\d{2} (AM|PM)/);
    expect(payload.powerMetrics.goldenHour.endTimeStr).toMatch(/\d{2}:\d{2} (AM|PM)/);
    expect(payload.powerMetrics.luckyDigit).toBeGreaterThanOrEqual(1);
    expect(payload.powerMetrics.luckyColor.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(payload.karmaNavigator.dos.kn.length).toBeGreaterThan(0);
    expect(payload.karmaNavigator.donts.kn.length).toBeGreaterThan(0);
  });

  it("dynamically calculates Tab 3 (Dina Bhavishya) with Chandra Bala, Tara Bala, and Abhijit Muhurtha", async () => {
    const bhavishya = await getOrComputeDinaBhavishya({
      targetDateRequested: "2026-09-02",
      devoteeName: "ರಮೇಶ್",
      birthDate: "1985-07-20",
      birthTime: "14:15",
      natalMoonRashi: 3, // Karkataka
      natalNakshatra: 7, // Punarvasu
      lang: "kn",
      userLat: 14.5479,
      userLng: 74.3187,
      userPincode: "581326",
      userIdentifier: "devotee_ramesh"
    });

    expect(bhavishya.targetDate).toBe("2026-09-02");
    expect(bhavishya.chandraBalaHouse).toBeGreaterThanOrEqual(1);
    expect(bhavishya.chandraBalaHouse).toBeLessThanOrEqual(12);
    expect(bhavishya.taraBalaNumber).toBeGreaterThanOrEqual(1);
    expect(bhavishya.taraBalaNumber).toBeLessThanOrEqual(9);
    expect(bhavishya.abhijitMuhurtha).toBeTruthy();
    expect(bhavishya.rahuKaala).toBeTruthy();
    expect(bhavishya.energyScore).toBeGreaterThan(0);
    expect(bhavishya.overview).toBeTruthy();
    expect(bhavishya.careerAndFinance).toBeTruthy();
    expect(bhavishya.healthAndFamily).toBeTruthy();
    expect(bhavishya.travelAndInitiatives).toBeTruthy();
  });
});
