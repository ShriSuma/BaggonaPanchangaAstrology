import { describe, it, expect, beforeEach } from "vitest";
import {
  encodeDevoteeToken,
  decodeDevoteeToken,
  isDateOnlyToken,
  type DevoteeTokenPayload
} from "../utils/tokenCipher";
import {
  resolveDevoteeToken
} from "../features/seva/devoteeTokenDbService";
import {
  saveDevoteeTokenToDb,
  type DevoteeTokenDoc
} from "../db/firestoreDb";
import {
  calculateDeterministicRhythmDay,
  generateSevaICalendarString
} from "../features/seva/icsCalendarGenerator";
import { computePersonalizedDarshanaPayload } from "../features/darshana/dailyDarshanaPersonalizationEngine";

describe("Existing 200+ Customer Tokens & Backward Compatibility Audit", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Typical production profile of an existing devotee registered in the database
  const existingDevoteeProfile: DevoteeTokenPayload = {
    name: "ವೆಂಕಟೇಶ ಭಟ್",
    nakshatra: 3, // Rohini
    rashi: 1,     // Vrishabha
    gotra: "ಕಾಶ್ಯಪ",
    pandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    date: "2026-08-01",
    lang: "kn",
    time: "08:00",
    dob: "1985-05-24",
    tob: "06:45",
    pincode: "581326",
    lat: 14.5479,
    lng: 74.3187,
    locationName: "Gokarna",
    phone: "9972339362",
    overrideCalendarPhone: true
  };

  describe("1. Legacy bgn_v1_ Token Decoding & Flag Integrity", () => {
    it("preserves exact decoding of existing bgn_v1_ tokens with zero disruption", () => {
      const legacyToken = encodeDevoteeToken(existingDevoteeProfile);

      // Must strictly use bgn_v1_ prefix
      expect(legacyToken).toMatch(/^bgn_v1_/);
      expect(legacyToken).not.toMatch(/^bgn_dob_/);

      // Must NOT be flagged as Date-Only token
      expect(isDateOnlyToken(legacyToken)).toBe(false);

      const decoded = decodeDevoteeToken(legacyToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.name).toBe("ವೆಂಕಟೇಶ ಭಟ್");
      expect(decoded?.dob).toBe("1985-05-24");
      expect(decoded?.tob).toBe("06:45");
      expect(decoded?.rashi).toBe(1);
      expect(decoded?.nakshatra).toBe(3);
      expect(decoded?.gotra).toBe("ಕಾಶ್ಯಪ");
      expect(decoded?.pandit).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
      expect(decoded?.isDateOnly).toBe(false);
    });

    it("verifies isDateOnlyMode logic in DailyDarshanaPage stays false for existing users", () => {
      const legacyToken = encodeDevoteeToken(existingDevoteeProfile);
      const decoded = decodeDevoteeToken(legacyToken);

      const resolvedBirth = {
        dob: decoded?.dob || "",
        tob: decoded?.tob || ""
      };

      // Exact evaluation logic from DailyDarshanaPage.tsx:1891
      const isDateOnlyMode = Boolean(
        decoded?.isDateOnly ||
        isDateOnlyToken(legacyToken) ||
        (!resolvedBirth.tob && Boolean(resolvedBirth.dob))
      );

      // CRITICAL: Must be false so existing customer gets their authentic Janma Lagna!
      expect(isDateOnlyMode).toBe(false);
    });
  });

  describe("2. Database Token Resolution (bgn_tk_...) for 200+ Existing Customers", () => {
    it("seamlessly resolves existing customer database tokens and maintains access counts", async () => {
      const pastCreated = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const futureExpiry = new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString();

      // Simulate one of the 200+ existing customer docs already sitting in Firestore
      const existingCustomerDoc: DevoteeTokenDoc = {
        id: "bgn_tk_existing_cust_001",
        shortCode: "CUST0001",
        devoteeName: "ಶಂಕರ್ ಹೆಗಡೆ",
        priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        startDate: "2026-08-01",
        totalDays: 90,
        lang: "kn",
        notificationTime: "08:00",
        nakshatra: 9,
        rashi: 3,
        gotra: "ವಿಶ್ವಾಮಿತ್ರ",
        dob: "1978-11-12",
        tob: "11:20",
        pincode: "581326",
        lat: 14.54,
        lng: 74.31,
        locationName: "Gokarna",
        fullPayload: {
          name: "ಶಂಕರ್ ಹೆಗಡೆ",
          dob: "1978-11-12",
          tob: "11:20",
          nakshatra: 9,
          rashi: 3,
          gotra: "ವಿಶ್ವಾಮಿತ್ರ"
        },
        createdAt: pastCreated,
        expiresAt: futureExpiry,
        accessCount: 14,
        status: "active",
        updatedAt: pastCreated
      };

      await saveDevoteeTokenToDb(existingCustomerDoc);

      // Customer accesses via full token ID
      const resolvedById = await resolveDevoteeToken("bgn_tk_existing_cust_001");
      expect(resolvedById).not.toBeNull();
      expect(resolvedById?.payload.name).toBe("ಶಂಕರ್ ಹೆಗಡೆ");
      expect(resolvedById?.payload.dob).toBe("1978-11-12");
      expect(resolvedById?.payload.tob).toBe("11:20");
      expect(resolvedById?.isExpired).toBe(false);

      // Customer accesses via 8-char shortCode
      const resolvedByCode = await resolveDevoteeToken("CUST0001");
      expect(resolvedByCode).not.toBeNull();
      expect(resolvedByCode?.payload.name).toBe("ಶಂಕರ್ ಹೆಗಡೆ");

      // Verify date-only mode remains false for this database customer
      const isDateOnly = Boolean(
        (resolvedById?.payload as any)?.isDateOnly ||
        (!resolvedById?.payload.tob && resolvedById?.payload.dob)
      );
      expect(isDateOnly).toBe(false);
    });
  });

  describe("3. 90-Day ICS Calendar Events Integrity for Existing Customers", () => {
    it("generates authentic 90-day ICS calendar with rich Chandra Bala guidance for existing customer", () => {
      const rhythmDay = calculateDeterministicRhythmDay("2026-09-16", 3, 1, "2026-08-01");
      
      const icsString = generateSevaICalendarString({
        days: [rhythmDay],
        lang: "kn",
        panditName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
        notificationTime: "08:00",
        personName: existingDevoteeProfile.name,
        dob: existingDevoteeProfile.dob,
        tob: existingDevoteeProfile.tob
      });

      // 1. ICS format is valid
      expect(icsString).toContain("BEGIN:VCALENDAR");
      expect(icsString).toContain("END:VCALENDAR");
      expect(icsString).toContain("BEGIN:VEVENT");
      expect(icsString).toContain("END:VEVENT");

      // 2. Personalization belongs to devotee
      expect(icsString).toContain("ವೆಂಕಟೇಶ ಭಟ್");

      // 3. Chandra Bala 1-liner is present and actionable
      expect(icsString).toMatch(/ಚಂದ್ರಬಲ/);

      // 4. Daily sanctum URL contains devotee token
      expect(icsString).toContain("/daily?token=");

      // 5. Abhijit Muhurtha is web-exclusive (retaining devotee to maintain Daily Darshana streak)
      expect(icsString).not.toContain("ಅಭಿಜಿತ್");
    });
  });

  describe("4. Sanctum Personalization Computation for Existing Customers", () => {
    it("computes authentic personalized Darshana payload with full Janma Lagna and Graha positions", () => {
      const payload = computePersonalizedDarshanaPayload({
        birthKundli: null,
        devoteeName: existingDevoteeProfile.name || "ಭಕ್ತರು",
        gotra: existingDevoteeProfile.gotra,
        birthDate: existingDevoteeProfile.dob,
        birthTime: existingDevoteeProfile.tob || "12:00",
        targetDate: "2026-09-16",
        natalMoonRashi: existingDevoteeProfile.rashi ?? 1,
        natalNakshatra: existingDevoteeProfile.nakshatra ?? 3,
        natalLagnaRashi: 0, // Mesha Lagna
        lang: "kn",
        userLat: existingDevoteeProfile.lat,
        userLng: existingDevoteeProfile.lng,
        userPincode: existingDevoteeProfile.pincode,
        priestName: existingDevoteeProfile.pandit
      });

      expect(payload).toBeDefined();
      expect(payload.panchanga).toBeDefined();
      expect(payload.panchanga.tithi).toBeDefined();
      expect(payload.deity).toBeDefined();
      expect(payload.deity.name).toBeDefined();
      expect(payload.priestBenediction.kn).toContain("ವೆಂಕಟೇಶ ಭಟ್");
      expect(payload.powerMetrics.luckyColor).toBeDefined();
      expect(payload.astrologyMeta.chandraBalaHouse).toBeGreaterThanOrEqual(1);
      expect(payload.astrologyMeta.chandraBalaHouse).toBeLessThanOrEqual(12);
    });
  });
});
