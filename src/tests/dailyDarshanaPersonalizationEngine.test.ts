import { describe, it, expect } from "vitest";
import { computePersonalizedDarshanaPayload } from "../features/darshana/dailyDarshanaPersonalizationEngine";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";
import { computeGocharaMoonForDate } from "../features/seva/dinaBhavishyaEngine";

describe("Daily Darshana Personalization Engine (Tab 1 & Tab 2)", () => {
  it("computes dynamic live Panchanga, Deity, Shloka and Karma Navigation across 5 languages", () => {
    const payload = computePersonalizedDarshanaPayload({
      devoteeName: "Pramod Kodagi",
      gotra: "Kashyapa",
      birthDate: "1990-05-15",
      birthTime: "08:30",
      targetDate: "2026-09-01",
      natalMoonRashi: 8, // Dhanu
      natalNakshatra: 18, // Mula
      natalLagnaRashi: 0, // Mesha
      lang: "kn"
    });

    // 1. Live Panchanga
    expect(payload.panchanga.samvatsara).toBeDefined();
    expect(payload.panchanga.masa).toBeDefined();
    expect(payload.panchanga.paksha).toBeDefined();
    expect(payload.panchanga.tithi).toBeDefined();

    // 2. Dynamic Presiding Deity & Sacred Vedic Shloka
    expect(payload.deity.name.kn).toBeDefined();
    expect(payload.deity.sanskritShloka.length).toBeGreaterThan(20);
    expect(payload.deity.beejaMantra.kn).toContain("ॐ");
    expect(payload.deity.meaning.kn.length).toBeGreaterThan(20);
    expect(payload.deity.spiritualSignificance.kn.length).toBeGreaterThan(20);

    // 3. Dynamic Priest Benediction
    expect(payload.priestBenediction.kn).toContain("ಪ್ರಧಾನ ಅರ್ಚಕ");
    expect(payload.priestBenediction.kn).toContain("Pramod Kodagi");

    // 4. Karma Navigator (Do's, Don'ts & Micro-Parihara in all 5 languages)
    expect(payload.karmaNavigator.dos.kn.length).toBe(3);
    expect(payload.karmaNavigator.donts.kn.length).toBe(3);
    expect(payload.karmaNavigator.dos.en.length).toBe(3);
    expect(payload.karmaNavigator.dos.hi.length).toBe(3);
    expect(payload.karmaNavigator.dos.te.length).toBe(3);
    expect(payload.karmaNavigator.dos.ta.length).toBe(3);
    expect(payload.karmaNavigator.microPariharaDesc.kn.length).toBeGreaterThan(10);

    // 5. Power Metrics
    expect(payload.powerMetrics.luckyColor.hex).toMatch(/^#/);
    expect(payload.powerMetrics.luckyDigit).toBeGreaterThanOrEqual(1);
    expect(payload.powerMetrics.luckyDigit).toBeLessThanOrEqual(9);
    expect(payload.powerMetrics.goldenHour.startTimeStr).toMatch(/(AM|PM)/);
    expect(payload.powerMetrics.goldenHour.endTimeStr).toMatch(/(AM|PM)/);
  });

  it("triggers Lord Shiva Mrityunjaya Shloka & protective vigilance on Chandrashtama", () => {
    const todayYmd = "2026-09-01";
    const gochara = computeGocharaMoonForDate(todayYmd);

    // Set natal Moon 8 signs away so transit Moon lands on 8th house
    const chandrashtamaNatalRashi = (gochara.transitMoonRashi - 7 + 12) % 12;

    const payload = computePersonalizedDarshanaPayload({
      devoteeName: "Suresh Sharma",
      gotra: "Vashishta",
      birthDate: "1988-11-20",
      targetDate: todayYmd,
      natalMoonRashi: chandrashtamaNatalRashi,
      natalNakshatra: 0,
      lang: "kn"
    });

    expect(payload.astrologyMeta.isChandrashtama).toBe(true);
    expect(payload.astrologyMeta.chandraBalaHouse).toBe(8);
    expect(payload.deity.key).toBe("shiva");
    expect(payload.deity.sanskritShloka).toContain("ತ್ರಯಂಬಕಂ");
    expect(payload.priestBenediction.kn).toContain("ಚಂದ್ರಾಷ್ಟಮ");
    expect(payload.karmaNavigator.microPariharaDesc.kn).toContain("ಶಿವ");
  });

  it("dynamically tailors Deity & Shloka based on running Dasha-Bhukti", () => {
    // Mock birth Kundli with known Moon position for Dasha calculation
    const mockKundli: Partial<KundliOutput> = {
      planets: {
        [PlanetName.Moon]: {
          planet: PlanetName.Moon,
          degree: 130.0, // Makha nakshatra -> Ketu starts
          longitude: 130.0,
          house: 5,
          rashi: "Simha",
          rashiLord: PlanetName.Sun,
          nakshatra: "Magha",
          nakshatraLord: PlanetName.Ketu,
          pada: 1,
          isRetrograde: false,
          isCombust: false,
          dignity: "neutral",
          navamshaRashi: "Mesha"
        } as any
      } as any,
      houses: [],
      ascendant: { rashi: "Mesha", degree: 15 } as any
    };

    const payload = computePersonalizedDarshanaPayload({
      birthKundli: mockKundli as KundliOutput,
      devoteeName: "Ananya Rao",
      birthDate: "1995-06-15",
      targetDate: "2026-09-01",
      natalMoonRashi: 4,
      natalNakshatra: 9,
      lang: "en"
    });

    expect(payload.deity.name.en).toBeDefined();
    expect(payload.deity.sanskritShloka).toBeDefined();
    expect(payload.astrologyMeta.runningDashaSummary).toBeDefined();
  });
});
