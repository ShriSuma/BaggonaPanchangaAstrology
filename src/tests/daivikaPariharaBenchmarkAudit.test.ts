import { describe, it, expect } from "vitest";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";

describe("Daivika Parihara Dynamic Audit & Influencer Benchmark", () => {
  // Chart 1: Debilitated Mars in Cancer (Neecha Kuja) with Cancer Moon (Pushya Nakshatra)
  const chartDebilitatedMars: KundliOutput = {
    planets: [
      { name: PlanetName.Sun, degree: 110, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 7, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 1 },
      { name: PlanetName.Moon, degree: 105, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 7, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 1 },
      { name: PlanetName.Mars, degree: 118, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Ashlesha", sanskrit: "Ashlesha", deity: "Sarpa" }, house: 1, isDebilitated: true },
      { name: PlanetName.Mercury, degree: 130, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 2 },
      { name: PlanetName.Jupiter, degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 10 },
      { name: PlanetName.Venus, degree: 85, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 12 },
      { name: PlanetName.Saturn, degree: 200, rashi: { index: 6, english: "Libra", sanskrit: "Tula" }, nakshatra: { index: 15, english: "Swati", sanskrit: "Swati", deity: "Vayu" }, house: 4, isExalted: true },
      { name: PlanetName.Rahu, degree: 40, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 11 },
      { name: PlanetName.Ketu, degree: 220, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 5 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => i * 30),
    ascendant: 95,
    lagnaRashi: { index: 3, english: "Cancer", sanskrit: "Karka" },
    moonSign: { index: 3, english: "Cancer", sanskrit: "Karka" },
    sunSign: { index: 3, english: "Cancer", sanskrit: "Karka" },
    moonPada: 2
  };

  const input1: KundliInput = {
    name: "Aaditya Sharma",
    birthDate: "1994-07-26", // Tuesday
    birthTime: "06:15",
    latitude: 12.9716,
    longitude: 77.5946,
    gender: "Male",
    gothra: "Vashishta"
  };

  // Chart 2: Debilitated Moon in Scorpio (Neecha Chandra) & Saturn in Aries (Neecha Shani) with Rohini Sun
  const chartScorpioMoon: KundliOutput = {
    planets: [
      { name: PlanetName.Sun, degree: 48, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
      { name: PlanetName.Moon, degree: 213, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Anuradha", sanskrit: "Anuradha", deity: "Mitra" }, house: 7, isDebilitated: true },
      { name: PlanetName.Mars, degree: 280, rashi: { index: 9, english: "Capricorn", sanskrit: "Makara" }, nakshatra: { index: 21, english: "Uttara Ashadha", sanskrit: "Uttara Ashadha", deity: "Vishvedevas" }, house: 9, isExalted: true },
      { name: PlanetName.Mercury, degree: 350, rashi: { index: 11, english: "Pisces", sanskrit: "Meena" }, nakshatra: { index: 26, english: "Revati", sanskrit: "Revati", deity: "Pushan" }, house: 11, isDebilitated: true },
      { name: PlanetName.Jupiter, degree: 125, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
      { name: PlanetName.Venus, degree: 355, rashi: { index: 11, english: "Pisces", sanskrit: "Meena" }, nakshatra: { index: 26, english: "Revati", sanskrit: "Revati", deity: "Pushan" }, house: 11, isExalted: true },
      { name: PlanetName.Saturn, degree: 20, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Bharani", sanskrit: "Bharani", deity: "Yama" }, house: 12, isDebilitated: true },
      { name: PlanetName.Rahu, degree: 180, rashi: { index: 6, english: "Libra", sanskrit: "Tula" }, nakshatra: { index: 14, english: "Chitra", sanskrit: "Chitra", deity: "Tvashtar" }, house: 6 },
      { name: PlanetName.Ketu, degree: 0, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 0, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 12 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => i * 30),
    ascendant: 45,
    lagnaRashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
    moonSign: { index: 7, english: "Scorpio", sanskrit: "Vrischika" },
    sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
    moonPada: 4
  };

  const input2: KundliInput = {
    name: "Priya Sundaram",
    birthDate: "1998-05-22", // Friday
    birthTime: "18:40",
    latitude: 13.0827,
    longitude: 80.2707,
    gender: "Female",
    gothra: "Kashyapa"
  };

  it("should dynamically derive sacred tree and Panchanga remedies based on Moon nakshatra", () => {
    // Chart 1 Moon is Pushya Nakshatra -> Sacred tree is Peepal (ಅಶ್ವತ್ಥ) / Ficus religiosa
    const rep1 = generateKundliRemedyReport(chartDebilitatedMars, input1);
    expect(rep1.panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName).toBe("Ficus religiosa");
    expect(rep1.panchangaRemedies.nakshatraRemedy.sacredTree.kannada).toContain("ಅಶ್ವತ್ಥ");

    // Chart 2 Moon is Anuradha Nakshatra -> Sacred tree is Bakula (ಬಕುಳ) / Mimusops elengi
    const rep2 = generateKundliRemedyReport(chartScorpioMoon, input2);
    expect(rep2.panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName).toBe("Mimusops elengi");
    expect(rep2.panchangaRemedies.nakshatraRemedy.sacredTree.kannada).toContain("ಬಕುಳ");

    // Two different charts must have distinct trees and distinct mantras
    expect(rep1.panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName)
      .not.toBe(rep2.panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName);
  });

  it("should dynamically assign weekday Vara sadhana, color, and ruling graha", () => {
    const rep1 = generateKundliRemedyReport(chartDebilitatedMars, input1); // Tuesday
    expect(rep1.panchangaRemedies.varaRemedy.dayName.kn).toContain("ಮಂಗಳವಾರ");
    expect(rep1.panchangaRemedies.varaRemedy.rulingGraha).toBe(PlanetName.Mars);

    const rep2 = generateKundliRemedyReport(chartScorpioMoon, input2); // Friday
    expect(rep2.panchangaRemedies.varaRemedy.dayName.kn).toContain("ಶುಕ್ರವಾರ");
    expect(rep2.panchangaRemedies.varaRemedy.rulingGraha).toBe(PlanetName.Venus);
  });

  it("should detect debilitated and exalted planets accurately with Neecha Bhanga and gemstone cautions", () => {
    const rep1 = generateKundliRemedyReport(chartDebilitatedMars, input1);
    // In Chart 1, Mars is debilitated in Cancer, Saturn is exalted in Libra
    expect(rep1.planetaryStrengthRemedies.debilitatedPlanets.some(p => p.graha === PlanetName.Mars)).toBe(true);
    expect(rep1.planetaryStrengthRemedies.exaltedPlanets.some(p => p.graha === PlanetName.Saturn)).toBe(true);

    const debMars = rep1.planetaryStrengthRemedies.debilitatedPlanets.find(p => p.graha === PlanetName.Mars);
    expect(debMars?.gemstoneCaution.kn).toContain("ಹವಳ");

    const rep2 = generateKundliRemedyReport(chartScorpioMoon, input2);
    // In Chart 2, Moon is in Scorpio (debilitated), Saturn in Aries (debilitated), Mercury in Pisces (debilitated)
    // Venus in Pisces (exalted), Mars in Capricorn (exalted)
    expect(rep2.planetaryStrengthRemedies.debilitatedPlanets.some(p => p.graha === PlanetName.Moon)).toBe(true);
    expect(rep2.planetaryStrengthRemedies.debilitatedPlanets.some(p => p.graha === PlanetName.Saturn)).toBe(true);
    expect(rep2.planetaryStrengthRemedies.exaltedPlanets.some(p => p.graha === PlanetName.Mars)).toBe(true);
    expect(rep2.planetaryStrengthRemedies.exaltedPlanets.some(p => p.graha === PlanetName.Venus)).toBe(true);

    const debSaturn = rep2.planetaryStrengthRemedies.debilitatedPlanets.find(p => p.graha === PlanetName.Saturn);
    expect(debSaturn?.gemstoneCaution.kn).toContain("ನೀಲಂ");
  });

  it("should include modern influencer benchmark comparison with authentic Parashari principles", () => {
    const rep = generateKundliRemedyReport(chartDebilitatedMars, input1);
    expect(rep.planetaryStrengthRemedies.influencerBenchmarkComparison).toBeDefined();
    expect(rep.planetaryStrengthRemedies.influencerBenchmarkComparison.title.kn).toContain("ಆಧುನಿಕ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಭಾವಿಗಳು");
    expect(rep.planetaryStrengthRemedies.influencerBenchmarkComparison.insights.en).toContain("pranic prisms");
    expect(rep.planetaryStrengthRemedies.influencerBenchmarkComparison.authenticApproach.kn).toContain("ದುಸ್ಥಾನಾಧಿಪತಿಗಳ");
  });

  it("should dynamically select Gokarna temple seva and dāna based on detected doshas", () => {
    const repMars = generateKundliRemedyReport(chartDebilitatedMars, input1);
    expect(repMars.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಕುಜ ಶಾಂತಿ");
    expect(repMars.gokarnaTempleRemedies.donationDaana.item.kn).toContain("ಮಸೂರ್");

    const repMoon = generateKundliRemedyReport(chartScorpioMoon, input2);
    expect(repMoon.gokarnaTempleRemedies.prescribedSeva.name.kn).toBeDefined();
  });
});
