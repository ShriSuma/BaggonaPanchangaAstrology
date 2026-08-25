import { describe, it, expect } from "vitest";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";

describe("Kundli Remedy Engine", () => {
  const mockKundliMarsAfflicted: KundliOutput = {
    planets: [
      { name: PlanetName.Sun, degree: 45, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
      { name: PlanetName.Moon, degree: 140, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
      { name: PlanetName.Mars, degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 1 },
      { name: PlanetName.Mercury, degree: 60, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 2 },
      { name: PlanetName.Jupiter, degree: 120, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 3 },
      { name: PlanetName.Venus, degree: 90, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 6, english: "Ardra", sanskrit: "Ardra", deity: "Rudra" }, house: 2 },
      { name: PlanetName.Saturn, degree: 210, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 7 },
      { name: PlanetName.Rahu, degree: 330, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, nakshatra: { index: 24, english: "Shatabhisha", sanskrit: "Shatabhisha", deity: "Varuna" }, house: 10 },
      { name: PlanetName.Ketu, degree: 150, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 11, english: "Purva Phalguni", sanskrit: "Purva Phalguni", deity: "Bhaga" }, house: 4 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => i * 30),
    ascendant: 15,
    lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" },
    moonSign: { index: 4, english: "Leo", sanskrit: "Simha" },
    sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
    moonPada: 1
  };

  const mockInput: KundliInput = {
    name: "Shree Rama Bhakta",
    birthDate: "1995-08-15",
    birthTime: "08:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    gothra: "Kashyapa"
  };

  it("should diagnose anger and Pitta affliction when Mars is in 1st house", () => {
    const report = generateKundliRemedyReport(mockKundliMarsAfflicted, mockInput);

    expect(report.devoteeName).toBe("Shree Rama Bhakta");
    expect(report.primaryStruggle.category).toBe("anger_temper");
    expect(report.psychologicalProfile.krodhaLevel).toBeGreaterThanOrEqual(70);
    expect(report.afflictionFactors.some((f) => f.graha === PlanetName.Mars)).toBe(true);
  });

  it("should generate the 4-step instant anger calming protocol with emergency Beeja mantra", () => {
    const report = generateKundliRemedyReport(mockKundliMarsAfflicted, mockInput);

    expect(report.instantCalmingProtocol.steps).toHaveLength(4);
    expect(report.instantCalmingProtocol.steps[0].name.kn).toContain("ಜಲ ತತ್ತ್ವ");
    expect(report.instantCalmingProtocol.steps[1].name.kn).toContain("ಚಂದ್ರ ಭೇದನ");
    expect(report.instantCalmingProtocol.steps[2].name.kn).toContain("ಮೌನ");
    expect(report.instantCalmingProtocol.steps[3].name.kn).toContain("ಬೀಜ ಮಂತ್ರ");

    expect(report.instantCalmingProtocol.emergencyBeejaMantra.kannada).toContain("ಸೋಮಾಯ ನಮಃ");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.telugu).toContain("సోమాయ నమః");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.tamil).toContain("சோமாய நமஹ");
  });

  it("should generate personalized classical stotras with Sanskrit and Indic text", () => {
    const report = generateKundliRemedyReport(mockKundliMarsAfflicted, mockInput);

    expect(report.personalizedStotras.length).toBeGreaterThanOrEqual(1);
    const stotra = report.personalizedStotras[0];
    expect(stotra.shlokaSanskrit).toBeDefined();
    expect(stotra.shlokaKannada).toBeDefined();
    expect(stotra.shlokaTelugu).toBeDefined();
    expect(stotra.shlokaTamil).toBeDefined();
    expect(stotra.spiritualBenefits).toBeDefined();
  });

  it("should calculate active Dasha-Bhukti and Gochara transits", () => {
    const report = generateKundliRemedyReport(mockKundliMarsAfflicted, mockInput);

    expect(report.dashaBhuktiAnalysis.currentMahaDasha).toBeDefined();
    expect(report.dashaBhuktiAnalysis.currentBhukti).toBeDefined();
    expect(report.gocharaTransitAnalysis.transitHighlights.length).toBeGreaterThanOrEqual(2);
    expect(report.gocharaTransitAnalysis.sadeSatiStatus).toBeDefined();
  });

  it("should contain authentic Gokarna Mahabaleshwara temple prescriptions and Priest Shreeram Pandit blessings", () => {
    const report = generateKundliRemedyReport(mockKundliMarsAfflicted, mockInput);

    expect(report.gokarnaTempleRemedies.prescribedSeva.temple).toContain("Gokarna");
    expect(report.gokarnaTempleRemedies.rudrakshaRecommendation.mukhi).toBeDefined();
    expect(report.chiefPriestBlessing.priestName.kn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(report.chiefPriestBlessing.phone).toBe("+91 99723 39362");
    expect(report.chiefPriestBlessing.sanskritAshirvada).toContain("स्वस्ति");
  });
});
