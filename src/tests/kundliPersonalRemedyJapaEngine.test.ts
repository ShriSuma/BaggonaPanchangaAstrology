import { describe, it, expect } from "vitest";
import { determineKundliPersonalRemedy } from "../features/remedies/kundliPersonalRemedyJapaEngine";
import { PlanetName, type KundliOutput, type PlanetPosition } from "../core/AstroTypes";

describe("Kundli Personal Remedy & 11-Time Japa Engine", () => {
  const baseKundli = {
    planets: [
      { name: PlanetName.Sun, degree: 45, rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" }, house: 1, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Moon, degree: 75, rashi: { index: 2, sanskrit: "Mithuna", english: "Gemini" }, house: 2, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Mars, degree: 120, rashi: { index: 4, sanskrit: "Simha", english: "Leo" }, house: 4, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Mercury, degree: 50, rashi: { index: 1, sanskrit: "Vrishabha", english: "Taurus" }, house: 1, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Jupiter, degree: 200, rashi: { index: 6, sanskrit: "Tula", english: "Libra" }, house: 6, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Venus, degree: 30, rashi: { index: 0, sanskrit: "Mesha", english: "Aries" }, house: 12, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Saturn, degree: 15, rashi: { index: 0, sanskrit: "Mesha", english: "Aries" }, house: 12, isRetrograde: false, isDebilitated: true } as PlanetPosition, // Saturn in Aries (Neecha)
      { name: PlanetName.Rahu, degree: 280, rashi: { index: 9, sanskrit: "Makara", english: "Capricorn" }, house: 9, isRetrograde: false } as PlanetPosition,
      { name: PlanetName.Ketu, degree: 100, rashi: { index: 3, sanskrit: "Karka", english: "Cancer" }, house: 3, isRetrograde: false } as PlanetPosition
    ],
    houses: []
  } as unknown as KundliOutput;

  it("detects Debilitated Saturn in Aries and prescribes Shani/Shiva Shloka for 11 Japas", () => {
    const remedy = determineKundliPersonalRemedy({
      birthKundli: baseKundli,
      devoteeName: "ಶ್ರೀಸುಮಾ",
      lang: "kn"
    });

    expect(remedy.grahaKey).toBe(PlanetName.Saturn);
    expect(remedy.recommendedJapaCount).toBe(11);
    expect(remedy.sanskritShloka).toContain("ನೀಲಾಂಜನ ಸಮಾಭಾಸಂ");
    expect(remedy.sanskritShlokaL5?.ta).toContain("நீலாஞ்ஜன ஸமாபாஸம்");
    expect(remedy.sanskritShlokaL5?.te).toContain("నీలాంజన సమాభాసం");
    expect(remedy.sanskritShlokaL5?.hi).toContain("नीलांजन समाभासं");
    expect(remedy.afflictionTitle.kn).toContain("ಶನಿ ದೋಷ");
    expect(remedy.celebrationHurrayText.kn).toContain("🎉 ಶುಭ ಜಯಸಿದ್ಧಿ!");
    expect(remedy.freshMindBlessingText.kn).toContain("ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ");
  });

  it("detects Ketu affliction and provides authentic 5-language Tamil/Telugu/Hindi/Kannada Shlokas", () => {
    const ketuKundli = {
      planets: [
        { name: PlanetName.Ketu, degree: 15, rashi: { index: 0, sanskrit: "Mesha", english: "Aries" }, house: 1, isRetrograde: false } as PlanetPosition
      ],
      houses: []
    } as unknown as KundliOutput;

    const remedy = determineKundliPersonalRemedy({
      birthKundli: ketuKundli,
      devoteeName: "பக்தர்",
      lang: "ta"
    });

    expect(remedy.grahaKey).toBe(PlanetName.Ketu);
    expect(remedy.sanskritShlokaL5?.ta).toContain("கணானாம் த்வா கணபதிம் ஹவாமஹே");
    expect(remedy.sanskritShlokaL5?.te).toContain("గణానాం త్వా గణపతిం హవామహే");
    expect(remedy.sanskritShlokaL5?.hi).toContain("गणानां त्वा गणपतिं हवामहे");
    expect(remedy.sanskritShlokaL5?.kn).toContain("ಗಣಾನಾಂ ತ್ವಾ ಗಣಪತಿಂ ಹವಾಮಹೇ");
    expect(remedy.deityName.ta).toContain("ஸ்ரீ மஹாகணபதி");
    expect(remedy.meaning.ta).toContain("கணங்களின் தலைவரும்");
  });

  it("detects afflicted Moon in Scorpio and prescribes Moon / Shiva pacification Shloka", () => {
    const moonAfflictedKundli = {
      planets: [
        { name: PlanetName.Moon, degree: 220, rashi: { index: 7, sanskrit: "Vrischika", english: "Scorpio" }, house: 8, isRetrograde: false, isDebilitated: true } as PlanetPosition,
        { name: PlanetName.Saturn, degree: 310, rashi: { index: 10, sanskrit: "Kumbha", english: "Aquarius" }, house: 11, isRetrograde: false } as PlanetPosition
      ],
      houses: []
    } as unknown as KundliOutput;

    const remedy = determineKundliPersonalRemedy({
      birthKundli: moonAfflictedKundli,
      devoteeName: "ಭಕ್ತರು",
      lang: "en"
    });

    expect(remedy.grahaKey).toBe(PlanetName.Moon);
    expect(remedy.recommendedJapaCount).toBe(11);
    expect(remedy.sanskritShloka).toContain("ದಧಿಶಂಖತುಷಾರಾಭಂ");
    expect(remedy.sanskritShlokaL5?.ta).toContain("ததிசங்கதுஷாராபம்");
    expect(remedy.transliteration).toContain("Dadhiśaṅkha");
    expect(remedy.celebrationHurrayText.en).toContain("Hurray");
    expect(remedy.freshMindBlessingText.en).toContain("Today go with a fresh, tranquil heart");
  });

  it("defaults to Lord Shiva Sarvadosha Shanti when no Kundli is provided", () => {
    const remedy = determineKundliPersonalRemedy({
      birthKundli: null,
      devoteeName: "ಶ್ರೀಸುಮಾ",
      lang: "kn"
    });

    expect(remedy.grahaKey).toBe("sarvadosha");
    expect(remedy.recommendedJapaCount).toBe(11);
    expect(remedy.sanskritShloka).toContain("ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ");
    expect(remedy.sanskritShlokaL5?.ta).toContain("ஓம் த்ரியம்பகம் யஜாமஹே");
    expect(remedy.freshMindBlessingText.kn).toContain("ಪ್ರಶಾಂತ ಹಾಗೂ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ");
  });
});
