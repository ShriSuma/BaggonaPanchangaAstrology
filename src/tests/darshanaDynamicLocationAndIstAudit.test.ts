import { describe, it, expect } from "vitest";
import {
  getDailyKaalaTimings,
  generateSevaICalendarString,
  generateGoogleCalendarUrl,
  generateQrPayloadByTarget,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import { computePersonalizedDarshanaPayload } from "../features/darshana/dailyDarshanaPersonalizationEngine";
import { calculateKundli } from "../core/KundliEngine";
import { getOrComputeDinaBhavishya } from "../features/seva/dinaBhavishyaEngine";
import { decodeDevoteeToken } from "../utils/tokenCipher";

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

  it("ensures Rahu, Gulika, Yamaganda, Sunrise, Sunset, and Abhijit Muhurtha have seconds precision (hh:mm:ss AM/PM)", () => {
    const targetDate = "2026-09-15";
    const kaala = getDailyKaalaTimings("Tuesday", "kn", targetDate, 14.5479, 74.3187, "581326");

    // Sunrise and Sunset must have hh:mm:ss AM/PM format
    expect(kaala.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    expect(kaala.sunset).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);

    // Rahu, Gulika, Yamaganda windows must have hh:mm:ss AM/PM – hh:mm:ss AM/PM format
    const secondsRangeRegex = /^\d{2}:\d{2}:\d{2} (AM|PM) – \d{2}:\d{2}:\d{2} (AM|PM)$/;
    expect(kaala.rahuWindow).toMatch(secondsRangeRegex);
    expect(kaala.gulikaWindow).toMatch(secondsRangeRegex);
    expect(kaala.yamaWindow).toMatch(secondsRangeRegex);
    expect(kaala.abhijitWindow).toMatch(secondsRangeRegex);

    // Full strings with localized suffixes
    expect(kaala.rahu).toContain(kaala.rahuWindow);
    expect(kaala.gulika).toContain(kaala.gulikaWindow);
    expect(kaala.yamaganda).toContain(kaala.yamaWindow);
    expect(kaala.abhijit).toContain(kaala.abhijitWindow);

    // Short versions without seconds also provided
    expect(kaala.sunriseShort).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    expect(kaala.sunsetShort).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    expect(kaala.rahuWindowShort).toMatch(/^\d{2}:\d{2} (AM|PM) – \d{2}:\d{2} (AM|PM)$/);
  });

  it("ensures different Indian pincodes dynamically recalculate exact timings down to the second", () => {
    const targetDate = "2026-09-20";

    const gokarna = getDailyKaalaTimings("Sunday", "en", targetDate, undefined, undefined, "581326");
    const blr = getDailyKaalaTimings("Sunday", "en", targetDate, undefined, undefined, "560001");
    const mumbai = getDailyKaalaTimings("Sunday", "en", targetDate, undefined, undefined, "400001");
    const delhi = getDailyKaalaTimings("Sunday", "en", targetDate, undefined, undefined, "110001");
    const kolkata = getDailyKaalaTimings("Sunday", "en", targetDate, undefined, undefined, "700001");

    // All should produce valid seconds precision
    expect(gokarna.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    expect(blr.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    expect(mumbai.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    expect(delhi.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);
    expect(kolkata.sunrise).toMatch(/^\d{2}:\d{2}:\d{2} (AM|PM)$/);

    // East India (Kolkata) sunrise is substantially earlier than West India (Gokarna / Mumbai)
    expect(kolkata.sunrise).not.toBe(gokarna.sunrise);
    expect(kolkata.sunrise).not.toBe(mumbai.sunrise);

    // Delhi sunrise is distinct from southern locations
    expect(delhi.sunrise).not.toBe(blr.sunrise);

    // Rahu and Gulika windows differ across locations due to distinct local solar day spans
    expect(kolkata.rahuWindow).not.toBe(mumbai.rahuWindow);
    expect(gokarna.rahuWindow).not.toBe(delhi.rahuWindow);
  });

  it("verifies 100% timing parity and query param preservation between generated Calendar events, Google Calendar URL, and Daily Darshana Page calculations", () => {
    const targetDate = "2026-09-27";
    const userPincode = "560001"; // Bengaluru
    const userLocation = "Bengaluru";

    // 1. Calculate day parameters
    const rhythmDay = calculateDeterministicRhythmDay(targetDate, 18, 8, targetDate);

    // 2. Generate Seva iCalendar string with Bengaluru pincode
    const icsContent = generateSevaICalendarString({
      days: [rhythmDay],
      lang: "kn",
      personName: "Pramod Devotee",
      panditName: "Shreeram Pandit",
      pincode: userPincode,
      locationName: userLocation
    });

    // 3. Expected exact timings that Daily Darshana page computes for 560001
    const expectedKaala = getDailyKaalaTimings(rhythmDay.dayLord, "kn", targetDate, undefined, undefined, userPincode);

    // 4. Verify exact timing match in .ics plain text description
    expect(icsContent).toContain(expectedKaala.sunrise);
    expect(icsContent).toContain(expectedKaala.sunset);
    expect(icsContent).toContain(expectedKaala.rahu);
    expect(icsContent).toContain(expectedKaala.gulika);
    expect(icsContent).toContain(expectedKaala.yamaganda);

    // 5. Verify sanctumUrl inside .ics passes pincode and coordinates for 100% consistent redirection
    const urlMatch = icsContent.match(/https:\/\/[^\s\\]+/);
    expect(urlMatch).not.toBeNull();
    const sanctumUrl = urlMatch![0];
    expect(sanctumUrl).toContain(`pincode=${userPincode}`);
    expect(sanctumUrl).toContain("lat=");
    expect(sanctumUrl).toContain("lng=");

    // 6. Verify Google Calendar URL also contains matching timings and pincode
    const gCalUrl = generateGoogleCalendarUrl({
      day: rhythmDay,
      lang: "kn",
      personName: "Pramod Devotee",
      panditName: "Shreeram Pandit",
      pincode: userPincode,
      locationName: userLocation
    });

    const parsedGCal = new URL(gCalUrl);
    const details = parsedGCal.searchParams.get("details") || "";
    expect(details).toContain(expectedKaala.sunrise);
    expect(details).toContain(expectedKaala.sunset);
    expect(details).toContain(expectedKaala.rahu);
    expect(details).toContain(expectedKaala.gulika);
    expect(details).toContain(expectedKaala.yamaganda);
    expect(details).toContain(`pincode=${userPincode}`);

    // 7. Verify QR code payload passes pincode inside the token
    const qrSanctum = generateQrPayloadByTarget("sanctum", {
      days: [rhythmDay],
      lang: "kn",
      pincode: userPincode,
      locationName: userLocation
    });
    const parsedQrUrl = new URL(qrSanctum);
    const decodedQr = decodeDevoteeToken(parsedQrUrl.searchParams.get("token") || "");
    expect(decodedQr?.pc).toBe(userPincode);
  });
});
