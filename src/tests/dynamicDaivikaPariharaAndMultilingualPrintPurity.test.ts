import { describe, it, expect } from "vitest";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { calculateKundli } from "../core/KundliEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";
import {
  getTithiName,
  getYogaName,
  getKaranaName,
  getTatvaName,
  getNakshatraDeityName
} from "../components/instantReading/instantReadingPdfLocale";

describe("Dynamic Daivika Parihara & Multilingual Print Purity Audit", () => {
  const mockBaseKundli: KundliOutput = {
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

  it("1. Student Academic Native: generates Vidya Ganapati & Saraswati protocol, mantra, and book donation", () => {
    const studentInput: KundliInput = {
      name: "Aditya Hegde",
      birthDate: "2008-04-10",
      birthTime: "07:15",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male",
      gothra: "Vasishtha",
      primaryConcern: "student_academic"
    };

    const report = generateKundliRemedyReport(mockBaseKundli, studentInput);
    expect(report.primaryStruggle.category).toBe("student_academic");
    expect(report.instantCalmingProtocol.title.kn).toContain("ವಿದ್ಯಾ ಗಣಪತಿ");
    expect(report.instantCalmingProtocol.title.en).toContain("Vidya Ganapati");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.kannada).toContain("ಸರಸ್ವತ್ಯೈ ನಮಃ");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.hindi).toContain("सरस्वत्यै नमः");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.telugu).toContain("సరస్వత్యై నమః");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.tamil).toContain("சரஸ்வத்யை நமஹ");

    expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಸರಸ್ವತೀ ವಿದ್ಯಾಪೂಜೆ");
    expect(report.gokarnaTempleRemedies.prescribedSeva.name.en).toContain("Saraswati Vidya Pooja");
    expect(report.gokarnaTempleRemedies.donationDaana.item.kn).toContain("ಪುಸ್ತಕಗಳು");
  });

  it("2. Marriage Delay Native: generates Swayamvara Parvati & Kankana Bala protocol, mantra, and bridal dāna", () => {
    const marriageInput: KundliInput = {
      name: "Sneha Bhat",
      birthDate: "1994-06-20",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Female",
      gothra: "Kashyapa",
      maritalStatus: "unmarried",
      primaryConcern: "marriage_delay"
    };

    const report = generateKundliRemedyReport(mockBaseKundli, marriageInput);
    expect(report.primaryStruggle.category).toBe("marriage_delay");
    expect(report.instantCalmingProtocol.title.kn).toContain("ಸ್ವಯಂವರ ಪಾರ್ವತಿ");
    expect(report.instantCalmingProtocol.title.en).toContain("Swayamvara Parvati");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.kannada).toContain("ಯೋಗಿನಿ");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.hindi).toContain("योगिनि");
    expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಕಲ್ಯಾಣೋತ್ಸವ");
    expect(report.gokarnaTempleRemedies.donationDaana.item.kn).toContain("ಅರಿಶಿನ");
  });

  it("3. Debt & Financial Native: generates Runa Vimochana Angaraka & Kanakadhara protocol, mantra, and food dāna", () => {
    const debtInput: KundliInput = {
      name: "Ganesh Pai",
      birthDate: "1982-11-12",
      birthTime: "15:45",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male",
      gothra: "Bharadwaja",
      primaryConcern: "debt_financial"
    };

    const report = generateKundliRemedyReport(mockBaseKundli, debtInput);
    expect(report.primaryStruggle.category).toBe("debt_financial");
    expect(report.instantCalmingProtocol.title.kn).toContain("ಋಣವಿಮೋಚನ");
    expect(report.instantCalmingProtocol.title.en).toContain("Runa Vimochana");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.kannada).toContain("ಋಣಹರ್ತಾ");
    expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಋಣವಿಮೋಚನ");
    expect(report.gokarnaTempleRemedies.donationDaana.item.kn).toContain("ಗೋಧಿ");
  });

  it("4. Health & Vitality Native: generates Mahamrityunjaya Sanjeevini protocol, mantra, and medicine dāna", () => {
    const healthInput: KundliInput = {
      name: "Sumanth Joshi",
      birthDate: "1975-02-18",
      birthTime: "06:00",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male",
      gothra: "Jamadagni",
      primaryConcern: "health_vitality"
    };

    const report = generateKundliRemedyReport(mockBaseKundli, healthInput);
    expect(report.primaryStruggle.category).toBe("health_vitality");
    expect(report.instantCalmingProtocol.title.kn).toContain("ಮಹಾಮೃತ್ಯುಂಜಯ");
    expect(report.instantCalmingProtocol.title.en).toContain("Mahamrityunjaya");
    expect(report.instantCalmingProtocol.emergencyBeejaMantra.kannada).toContain("ತ್ರ್ಯಂಬಕಂ");
    expect(report.gokarnaTempleRemedies.prescribedSeva.name.kn).toContain("ಮಹಾಮೃತ್ಯುಂಜಯ");
    expect(report.gokarnaTempleRemedies.donationDaana.item.kn).toContain("ಔಷಧ");
  });

  it("5. Devotee Name and Gotra are woven into Chief Priest Ashirvada in all 5 languages", () => {
    const devoteeInput: KundliInput = {
      name: "Ramesh Sharma",
      birthDate: "1990-05-15",
      birthTime: "12:00",
      latitude: 14.5479,
      longitude: 74.3188,
      gender: "Male",
      gothra: "Kashyapa"
    };

    const report = generateKundliRemedyReport(mockBaseKundli, devoteeInput);
    expect(report.chiefPriestBlessing.ashirvadaMeaning.kn).toContain("Kashyapa ಗೋತ್ರದ");
    expect(report.chiefPriestBlessing.ashirvadaMeaning.kn).toContain("Ramesh Sharma");
    expect(report.chiefPriestBlessing.ashirvadaMeaning.en).toContain("Ramesh Sharma of Kashyapa Gotra");
    expect(report.chiefPriestBlessing.ashirvadaMeaning.hi).toContain("Ramesh Sharma (Kashyapa गोत्र)");
    expect(report.chiefPriestBlessing.ashirvadaMeaning.te).toContain("Kashyapa గోత్రోద్భవులైన");
    expect(report.chiefPriestBlessing.ashirvadaMeaning.ta).toContain("Kashyapa கோத்திர");
  });

  it("6. Panchanga 5-Angas helpers return ZERO Kannada characters for Hindi, Telugu, Tamil, and English", () => {
    const kannadaCharRegex = /[\u0C80-\u0CFF]/;

    // Tithi
    expect(kannadaCharRegex.test(getTithiName("ಪಾಡ್ಯ", "hi"))).toBe(false);
    expect(kannadaCharRegex.test(getTithiName("ಏಕಾದಶಿ", "te"))).toBe(false);
    expect(kannadaCharRegex.test(getTithiName("ಹುಣ್ಣಿಮೆ", "ta"))).toBe(false);
    expect(kannadaCharRegex.test(getTithiName("ಚತುರ್ದಶಿ", "en"))).toBe(false);

    // Yoga
    expect(kannadaCharRegex.test(getYogaName("ವಿಷ್ಕಂಭ", "hi"))).toBe(false);
    expect(kannadaCharRegex.test(getYogaName("ಸಿದ್ಧಿ", "te"))).toBe(false);
    expect(kannadaCharRegex.test(getYogaName("ಶುಭ", "en"))).toBe(false);

    // Karana
    expect(kannadaCharRegex.test(getKaranaName("ಬವ", "hi"))).toBe(false);
    expect(kannadaCharRegex.test(getKaranaName("ಬಾಲವ", "te"))).toBe(false);
    expect(kannadaCharRegex.test(getKaranaName("ವಿಷ್ಟಿ", "en"))).toBe(false);

    // Tatva
    expect(kannadaCharRegex.test(getTatvaName("ಅಗ್ನಿ", "hi"))).toBe(false);
    expect(kannadaCharRegex.test(getTatvaName("ಜಲ ತತ್ತ್ವ", "te"))).toBe(false);
    expect(kannadaCharRegex.test(getTatvaName("ವಾಯು", "en"))).toBe(false);

    // Presiding Deity
    expect(kannadaCharRegex.test(getNakshatraDeityName("ಅಶ್ವಿನಿ ಕುಮಾರ", "hi"))).toBe(false);
    expect(kannadaCharRegex.test(getNakshatraDeityName("ಯಮ", "te"))).toBe(false);
    expect(kannadaCharRegex.test(getNakshatraDeityName("ಬ್ರಹ್ಮ", "en"))).toBe(false);
  });
});
