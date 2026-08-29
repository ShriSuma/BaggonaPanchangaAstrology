import { describe, it, expect } from "vitest";
import {
  issueAshirvadaPass,
  extendPassValidity,
  logPassDownload
} from "../features/seva/ashirvadaPassService";
import { renderAshirvadaPassIssuedEmail } from "../features/notifications/emailTemplates";
import { type KundliHistoryDoc } from "../db/firestoreDb";
import { PlanetName } from "../core/AstroTypes";

describe("Discrete Kundli Database Schema & Discrete Columns", () => {
  it("creates a well-formed KundliHistoryDoc with individual Rashi, Nakshatra, and Pada fields", () => {
    const doc: KundliHistoryDoc = {
      id: "kundli_test_123",
      userId: "priest_shreeram",
      priestName: "Shreeram Pandit",
      name: "Ramesh Sharma",
      gothra: "Kashyapa",
      birthDate: "1995-08-15",
      birthTime: "14:30",
      placeName: "Gokarna, Karnataka",
      latitude: 14.54,
      longitude: 74.31,
      pincode: "581326",
      rashi: "Mesha",
      rashiSanskrit: "ಮೇಷ",
      nakshatra: "Ashwini",
      nakshatraSanskrit: "ಅಶ್ವಿನಿ",
      pada: 1,
      lagnaRashi: "Vrischika",
      sunSign: "Simha",
      planetsSummary: [
        { name: "Sun", degree: 120.5, rashi: "Leo", house: 5, isRetrograde: false },
        { name: "Moon", degree: 15.2, rashi: "Aries", house: 1, isRetrograde: false },
        { name: "Mars", degree: 210.8, rashi: "Scorpio", house: 8, isRetrograde: false }
      ],
      kundliData: {
        ascendant: 215.2,
        planets: [],
        houses: [],
        moonSign: { index: 0, english: "Aries", sanskrit: "Mesha" },
        sunSign: { index: 4, english: "Leo", sanskrit: "Simha" },
        lagnaRashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" },
        moonPada: 1
      },
      createdAt: new Date().toISOString()
    };

    expect(doc.name).toBe("Ramesh Sharma");
    expect(doc.gothra).toBe("Kashyapa");
    expect(doc.rashi).toBe("Mesha");
    expect(doc.nakshatra).toBe("Ashwini");
    expect(doc.pada).toBe(1);
    expect(doc.lagnaRashi).toBe("Vrischika");
    expect(doc.sunSign).toBe("Simha");
    expect(doc.planetsSummary).toHaveLength(3);
  });
});

describe("Ashirvada QR Code Pass Lifecycle & 90-Day Countdown", () => {
  it("issues an Ashirvada QR pass with exactly 90 days validity window", async () => {
    const pass = await issueAshirvadaPass({
      userId: "priest_shreeram",
      priestName: "Shreeram Pandit",
      devoteeName: "Narayana Hegde",
      sevaName: "Mahapooja & Sankalpa",
      totalDays: 90
    });

    expect(pass.id).toBeDefined();
    expect(pass.devoteeName).toBe("Narayana Hegde");
    expect(pass.sevaName).toBe("Mahapooja & Sankalpa");
    expect(pass.totalDays).toBe(90);
    expect(pass.daysRemaining).toBe(90);

    const issuedTime = new Date(pass.issuedAt).getTime();
    const expiresTime = new Date(pass.expiresAt).getTime();
    const diffDays = Math.round((expiresTime - issuedTime) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(90);
  });

  it("renders luxury Ashirvada Pass notification email", () => {
    const html = renderAshirvadaPassIssuedEmail({
      passId: "pass_12345",
      priestName: "Shreeram Pandit",
      devoteeName: "Narayana Hegde",
      sevaName: "Sri Varamahalakshmi Vratha Seva",
      totalDays: 90,
      expiresAt: "27/11/2026"
    });

    expect(html).toContain("ಆಶೀರ್ವಾದ ಪತ್ರ & QR Pass Issued");
    expect(html).toContain("Narayana Hegde");
    expect(html).toContain("Sri Varamahalakshmi Vratha Seva");
    expect(html).toContain("90 Days (Expires 27/11/2026)");
    expect(html).toContain("Shreeram Pandit");
  });
});
