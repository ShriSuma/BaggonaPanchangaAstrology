import { describe, it, expect } from "vitest";
import { GERMAN_MAJOR_CITIES, findGermanCity, resolvePlaceOrPincode, getCoordinates } from "../services/locationApi";
import { inferBirthTimezoneIana, wallClockBirthToUtc } from "../core/birthTime";
import { calculateKundli } from "../core/KundliEngine";
import { type KundliInput, PlanetName } from "../core/AstroTypes";

describe("German Jataka & International Kundli Calculation Suite", () => {
  it("bundles all major German cities with high-precision coordinates", () => {
    expect(GERMAN_MAJOR_CITIES.length).toBeGreaterThanOrEqual(25);

    const berlin = GERMAN_MAJOR_CITIES.find((c) => c.name === "Berlin");
    expect(berlin).toBeDefined();
    expect(berlin?.lat).toBeCloseTo(52.5200, 2);
    expect(berlin?.lng).toBeCloseTo(13.4050, 2);
    expect(berlin?.postalCode).toBe("10115");

    const munich = GERMAN_MAJOR_CITIES.find((c) => c.name === "Munich");
    expect(munich).toBeDefined();
    expect(munich?.nameDe).toBe("München");
    expect(munich?.lat).toBeCloseTo(48.1371, 2);
    expect(munich?.lng).toBeCloseTo(11.5754, 2);

    const frankfurt = GERMAN_MAJOR_CITIES.find((c) => c.name === "Frankfurt");
    expect(frankfurt).toBeDefined();
    expect(frankfurt?.lat).toBeCloseTo(50.1109, 2);
    expect(frankfurt?.lng).toBeCloseTo(8.6821, 2);
  });

  it("findGermanCity matches city names, German aliases, and German postal codes", () => {
    expect(findGermanCity("Berlin")?.name).toBe("Berlin");
    expect(findGermanCity("berlin")?.name).toBe("Berlin");
    expect(findGermanCity("München")?.name).toBe("Munich");
    expect(findGermanCity("Munich")?.name).toBe("Munich");
    expect(findGermanCity("Frankfurt")?.name).toBe("Frankfurt");
    expect(findGermanCity("Köln")?.name).toBe("Cologne");
    expect(findGermanCity("Cologne")?.name).toBe("Cologne");
    expect(findGermanCity("10115")?.name).toBe("Berlin");
    expect(findGermanCity("80331")?.name).toBe("Munich");
  });

  it("infers Europe/Berlin timezone for German geographic coordinates", () => {
    // Berlin (52.5200 N, 13.4050 E)
    const berlinTz = inferBirthTimezoneIana(52.5200, 13.4050);
    expect(berlinTz).toBe("Europe/Berlin");

    // Munich (48.1371 N, 11.5754 E)
    const munichTz = inferBirthTimezoneIana(48.1371, 11.5754);
    expect(munichTz).toBe("Europe/Berlin");

    // Frankfurt (50.1109 N, 8.6821 E)
    const frankfurtTz = inferBirthTimezoneIana(50.1109, 8.6821);
    expect(frankfurtTz).toBe("Europe/Berlin");
  });

  it("wallClockBirthToUtc accurately converts German local birth time to UTC with DST", () => {
    // Berlin Summer birth: 1990-07-15 at 14:30 German local time (CEST = UTC+2)
    // 14:30 CEST -> 12:30 UTC -> 18:00 IST
    const summerUtc = wallClockBirthToUtc("1990-07-15", "14:30", 52.5200, 13.4050);
    expect(summerUtc.toISOString()).toBe("1990-07-15T12:30:00.000Z");

    // Berlin Winter birth: 1990-12-15 at 14:30 German local time (CET = UTC+1)
    // 14:30 CET -> 13:30 UTC -> 19:00 IST
    const winterUtc = wallClockBirthToUtc("1990-12-15", "14:30", 52.5200, 13.4050);
    expect(winterUtc.toISOString()).toBe("1990-12-15T13:30:00.000Z");
  });

  it("calculates authentic Vedic Kundli for a German birth with precise Ascendant (Janma Lagna)", () => {
    const germanInput: KundliInput = {
      name: "Hans Mueller",
      birthDate: "1990-07-15",
      birthTime: "14:30",
      latitude: 52.5200,
      longitude: 13.4050,
      pincode: "10115",
      gender: "Male"
    };

    const chart = calculateKundli(germanInput);

    // Verified: Lagna calculated with Berlin coordinates and sidereal time
    expect(typeof chart.ascendant).toBe("number");
    expect(chart.ascendant).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant).toBeLessThan(360);
    expect(chart.lagnaRashi).toBeDefined();
    expect(chart.lagnaRashi.english).toBe("Libra"); // Tula Lagna for 1990-07-15 14:30 Berlin

    // Planetary positions
    expect(chart.planets.length).toBeGreaterThanOrEqual(7);
    const sun = chart.planets.find((p) => p.name === PlanetName.Sun);
    const moon = chart.planets.find((p) => p.name === PlanetName.Moon);
    expect(sun).toBeDefined();
    expect(moon).toBeDefined();

    // 12 houses intact
    expect(chart.houses.length).toBe(12);
    expect(chart.moonSign).toBeDefined();
    expect(chart.sunSign).toBeDefined();
  });
});
