import { describe, it, expect } from "vitest";
import { encodeDevoteeToken, decodeDevoteeToken } from "../utils/tokenCipher";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";
import { signLord } from "../core/KundliInsightsEngine";
import { GRAHA_L5, RASHI_L5, NAKSHATRA_L5 } from "../features/seva/sevaLocale";

describe("DailyDarshana Dynamic Token & Astro Calculation", () => {
  it("should encode and decode devotee token with full birth parameters accurately", () => {
    const payload = {
      n: "Ramesh Sharma",
      d: "1988-03-25",
      tm: "14:30",
      nk: 7,
      r: 3,
      p: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      l: "kn",
      lt: 12.9716,
      lg: 77.5946,
      pc: "560001"
    };

    const token = encodeDevoteeToken(payload);
    expect(token).toBeDefined();
    expect(token.startsWith("bgn_v1_")).toBe(true);

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Ramesh Sharma");
    expect(decoded?.d).toBe("1988-03-25");
    expect(decoded?.tm).toBe("14:30");
    expect(decoded?.lt).toBe(12.9716);
    expect(decoded?.lg).toBe(77.5946);
    expect(decoded?.pc).toBe("560001");
  });

  it("should calculate dynamic Kundli, Gochara, and Dasha-Bhukti for any user token", () => {
    // User 1: Born 1988-03-25 14:30 at Bengaluru (12.9716, 77.5946)
    const user1Kundli = calculateKundli({
      name: "Ramesh Sharma",
      birthDate: "1988-03-25",
      birthTime: "14:30",
      latitude: 12.9716,
      longitude: 77.5946
    });

    expect(user1Kundli).toBeDefined();
    expect(user1Kundli.planets.length).toBeGreaterThanOrEqual(9);

    const moon1 = user1Kundli.planets.find(p => p.name === "Moon");
    expect(moon1).toBeDefined();

    // User 2: Born 2000-11-12 07:15 at Mumbai (19.0760, 72.8777)
    const user2Kundli = calculateKundli({
      name: "Priya Patel",
      birthDate: "2000-11-12",
      birthTime: "07:15",
      latitude: 19.0760,
      longitude: 72.8777
    });

    expect(user2Kundli).toBeDefined();
    const moon2 = user2Kundli.planets.find(p => p.name === "Moon");
    expect(moon2).toBeDefined();

    // Verify distinct positions calculated dynamically for User 1 vs User 2
    expect(user1Kundli.ascendant).not.toEqual(user2Kundli.ascendant);
    expect(moon1?.degree).not.toEqual(moon2?.degree);

    // Verify Dasha calculation for User 1 at age 36
    const bhukti1 = findBhuktiAtAge(user1Kundli, 36);
    expect(bhukti1).toBeDefined();
    expect(bhukti1?.maha.planet).toBeDefined();
    expect(bhukti1?.bhukti).toBeDefined();

    // Verify Dasha calculation for User 2 at age 24
    const bhukti2 = findBhuktiAtAge(user2Kundli, 24);
    expect(bhukti2).toBeDefined();
    expect(bhukti2?.maha.planet).toBeDefined();
    expect(bhukti2?.bhukti).toBeDefined();
  });
});
