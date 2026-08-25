import { describe, it, expect } from "vitest";
import { calculateBalaVidya } from "../features/balavidya/balaVidyaEngine";
import { PlanetName, type KundliOutput } from "../core/AstroTypes";

describe("Bala Vidya & Saraswati Learning Intelligence Engine", () => {
  const mockKundli: KundliOutput = {
    ascendant: 15,
    lagnaRashi: {
      index: 1,
      sanskrit: "Mesha",
      english: "Aries"
    },
    moonSign: {
      index: 1,
      sanskrit: "Mesha",
      english: "Aries"
    },
    sunSign: {
      index: 10,
      sanskrit: "Makara",
      english: "Capricorn"
    },
    moonPada: 2,
    planets: [
      {
        name: PlanetName.Sun,
        house: 10,
        rashi: { index: 10, sanskrit: "Makara", english: "Capricorn" },
        degree: 15,
        nakshatra: { index: 21, sanskrit: "Uttara Ashadha", english: "Uttara Ashadha", deity: "Vishvadevas" }
      },
      {
        name: PlanetName.Moon,
        house: 1,
        rashi: { index: 1, sanskrit: "Mesha", english: "Aries" },
        degree: 10,
        nakshatra: { index: 1, sanskrit: "Ashwini", english: "Ashwini", deity: "Ashwini Kumaras" }
      },
      {
        name: PlanetName.Mercury,
        house: 5, // 5th house Buddhi Sthana -> STEM / Analytical
        rashi: { index: 5, sanskrit: "Simha", english: "Leo" },
        degree: 8,
        nakshatra: { index: 10, sanskrit: "Magha", english: "Magha", deity: "Pitrus" }
      },
      {
        name: PlanetName.Jupiter,
        house: 9,
        rashi: { index: 9, sanskrit: "Dhanu", english: "Sagittarius" },
        degree: 20,
        nakshatra: { index: 19, sanskrit: "Mula", english: "Mula", deity: "Nirriti" }
      }
    ],
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  };

  it("calculates accurate Nakshatra Pada syllables and animal mascot for Ashwini Pada 2", () => {
    const result = calculateBalaVidya(mockKundli, "Chiranjivi Anand", "2018-05-14", "10:30", "Male");
    expect(result.nakshatraNameKn).toBe("Ashwini");
    expect(result.nakshatraPada).toBe(2);
    expect(result.padaInfo.syllablesKn[0]).toContain("ಚೇ (Che)");
    expect(result.padaInfo.animalMascotKn).toContain("ಅಶ್ವ");
    expect(result.padaInfo.mascotEmoji).toBe("🐎");
  });

  it("identifies STEM / Analytical cognitive learning style when Mercury occupies 5th house", () => {
    const result = calculateBalaVidya(mockKundli, "Chiranjivi Anand", "2018-05-14", "10:30", "Male");
    expect(result.learningStyle.styleKey).toBe("analytical_stem");
    expect(result.learningStyle.recommendedFieldsKn.length).toBeGreaterThan(2);
  });

  it("calculates accurate Driver and Conductor numbers in child numerology", () => {
    const result = calculateBalaVidya(mockKundli, "Chiranjivi Anand", "2018-05-14", "10:30", "Male");
    // Day 14 -> 1+4 = 5 (Mercury driver)
    expect(result.sankhya.driverNumber).toBe(5);
    expect(result.sankhya.concentrationColorKn).toContain("ಹಸಿರು");
  });

  it("provides authentic Samskara guides and protection score", () => {
    const result = calculateBalaVidya(mockKundli, "Chiranjivi Anand", "2018-05-14", "10:30", "Male");
    expect(result.samskaras.length).toBe(4);
    expect(result.balaRishta.protectionScore).toBeGreaterThanOrEqual(80);
    expect(result.balaRishta.protectiveMantrasKn.length).toBe(3);
  });
});
