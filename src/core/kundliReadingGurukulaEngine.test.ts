import { describe, it, expect } from "vitest";
import { PlanetName, type KundliOutput, RASHIS, NAKSHATRAS } from "./AstroTypes";
import { calculateGurukulaMasterclass } from "./kundliReadingGurukulaEngine";

describe("Kundli Reading Gurukula Engine (ಕುಂಡಲಿ ವಾಚನ ಗುರು)", () => {
  const mockKundli: KundliOutput = {
    ascendant: 15.5,
    lagnaRashi: RASHIS[1]!, // Vrishabha (Taurus)
    moonSign: RASHIS[3]!, // Karka (Cancer)
    sunSign: RASHIS[9]!, // Makara (Capricorn)
    moonPada: 2,
    houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    planets: [
      {
        name: PlanetName.Sun,
        house: 9,
        rashi: RASHIS[9]!, // Makara
        degree: 285.5,
        nakshatra: NAKSHATRAS[20]!
      },
      {
        name: PlanetName.Moon,
        house: 3,
        rashi: RASHIS[3]!, // Karka (Own sign)
        degree: 105.2,
        nakshatra: NAKSHATRAS[7]!
      },
      {
        name: PlanetName.Mars,
        house: 10,
        rashi: RASHIS[10]!, // Kumbha
        degree: 312.0,
        nakshatra: NAKSHATRAS[23]!
      },
      {
        name: PlanetName.Mercury,
        house: 9,
        rashi: RASHIS[9]!, // Makara
        degree: 280.1,
        nakshatra: NAKSHATRAS[20]!
      },
      {
        name: PlanetName.Jupiter,
        house: 4,
        rashi: RASHIS[4]!, // Simha
        degree: 130.4,
        nakshatra: NAKSHATRAS[9]!
      },
      {
        name: PlanetName.Venus,
        house: 10,
        rashi: RASHIS[10]!, // Kumbha
        degree: 320.8,
        nakshatra: NAKSHATRAS[24]!
      },
      {
        name: PlanetName.Saturn,
        house: 6,
        rashi: RASHIS[6]!, // Tula (Exalted)
        degree: 200.0,
        nakshatra: NAKSHATRAS[14]!
      },
      {
        name: PlanetName.Rahu,
        house: 1,
        rashi: RASHIS[1]!, // Vrishabha (Exalted)
        degree: 45.0,
        nakshatra: NAKSHATRAS[3]!
      },
      {
        name: PlanetName.Ketu,
        house: 7,
        rashi: RASHIS[7]!, // Vrischika (Exalted)
        degree: 225.0,
        nakshatra: NAKSHATRAS[16]!
      }
    ],
    maandi: {
      degree: 195.4,
      rashi: RASHIS[6]!,
      windowLabel: "Gulika Window"
    }
  };

  it("calculates exactly 11 progressive pedagogical steps", () => {
    const report = calculateGurukulaMasterclass(
      mockKundli,
      "1990-05-15",
      "08:30",
      "ರಾಮಚಂದ್ರ ಶರ್ಮ"
    );

    expect(report.totalSteps).toBe(11);
    expect(report.steps.length).toBe(11);
    expect(report.nativeName).toBe("ರಾಮಚಂದ್ರ ಶರ್ಮ");
    expect(report.lagnaRashiKn).toBe("ವೃಷಭ");
    expect(report.lagnaLordKn).toBe("ಶುಕ್ರ");
    expect(report.moonSignKn).toBe("ಕರ್ಕಾಟಕ");
  });

  it("calculates live Gochara snapshot relative to Moon and Lagna", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    expect(report.gochara).toBeDefined();
    expect(report.gochara.saturnRashiKn).toBeTruthy();
    expect(report.gochara.jupiterRashiKn).toBeTruthy();
    expect(typeof report.gochara.hasGuruBala).toBe("boolean");
    expect(typeof report.gochara.isSadeSati).toBe("boolean");
  });

  it("calculates interactive Q&A combining Kundli + Dasha + Gochara", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    expect(report.questions.length).toBeGreaterThanOrEqual(4);

    const careerQ = report.questions.find((q) => q.id === "career_promotion");
    expect(careerQ).toBeDefined();
    expect(careerQ?.whereToLookKn.primaryHousesKn).toContain("೧೦ನೇ ಮನೆ");
    expect(careerQ?.pillar1KundliKn.titleKn).toContain("ಜನ್ಮ ಕುಂಡಲಿ");
    expect(careerQ?.pillar2DashaKn.titleKn).toContain("ದಶಾ-ಭುಕ್ತಿ");
    expect(careerQ?.pillar3GocharaKn.titleKn).toContain("ಗೋಚಾರ");
    expect(careerQ?.synthesisKn.howToCombineKn).toBeTruthy();
    expect(careerQ?.spokenScriptKn).toBeTruthy();

    const marriageQ = report.questions.find((q) => q.id === "marriage_timing");
    expect(marriageQ).toBeDefined();
    expect(marriageQ?.whereToLookKn.primaryHousesKn).toContain("೭ನೇ ಮನೆ");
  });

  it("evaluates Doshas, Gandantharas, Fears, Secrets and Temperament diagnostics", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const diag = report.diagnostics;

    expect(diag.doshas.length).toBeGreaterThanOrEqual(5);
    const maandiDosha = diag.doshas.find((d) => d.id === "maandi_dosha");
    expect(maandiDosha?.isPresent).toBe(true);

    expect(diag.gandantharas.length).toBeGreaterThanOrEqual(4);
    expect(diag.fears.length).toBeGreaterThanOrEqual(5);
    expect(diag.innerSecrets.length).toBeGreaterThanOrEqual(2);

    expect(diag.temperament).toBeDefined();
    expect(["gentle", "cruel_assertive", "mixed"]).toContain(diag.temperament.disposition);
    expect(diag.temperament.titleKn).toBeTruthy();
    expect(diag.temperament.shastricRuleKn).toBeTruthy();
    expect(diag.temperament.spokenAdviceKn).toBeTruthy();
  });

  it("calculates comprehensive Panchanga Angas, Nakshatra, Yoga, Karana, Navatara and Upagrahas", () => {
    const report = calculateGurukulaMasterclass(mockKundli, "1990-05-15", "08:30");
    const pAngas = report.panchangaAngas;

    expect(pAngas).toBeDefined();

    // 1. Tithi & Dagdha Rashis
    expect(pAngas.tithi.index).toBeGreaterThanOrEqual(1);
    expect(pAngas.tithi.index).toBeLessThanOrEqual(30);
    expect(pAngas.tithi.nameKn).toBeTruthy();
    expect(pAngas.tithi.pakshaKn).toMatch(/ಶುಕ್ಲ|ಕೃಷ್ಣ/);
    expect(Array.isArray(pAngas.tithi.dagdhaRashisKn)).toBe(true);

    // 2. Vaara
    expect(pAngas.vaara.weekdayKn).toBeTruthy();
    expect(pAngas.vaara.lordKn).toBeTruthy();

    // 3. Nakshatra Deep Dive
    expect(pAngas.nakshatra.nameKn).toBeTruthy();
    expect(pAngas.nakshatra.pada).toBeGreaterThanOrEqual(1);
    expect(pAngas.nakshatra.pada).toBeLessThanOrEqual(4);
    expect(pAngas.nakshatra.devataKn).toBeTruthy();
    expect(pAngas.nakshatra.ganaKn).toBeTruthy();
    expect(pAngas.nakshatra.yoniKn).toBeTruthy();
    expect(pAngas.nakshatra.nadiKn).toBeTruthy();
    expect(pAngas.nakshatra.howNakshatraHelpsKn).toBeTruthy();

    // 4. Yoga
    expect(pAngas.yoga.nameKn).toBeTruthy();
    expect(typeof pAngas.yoga.isAuspicious).toBe("boolean");
    expect(pAngas.yoga.healthImmunityKn).toBeTruthy();

    // 5. Karana
    expect(pAngas.karana.nameKn).toBeTruthy();
    expect(typeof pAngas.karana.isVishtiBhadra).toBe("boolean");
    expect(pAngas.karana.careerActionStaminaKn).toBeTruthy();

    // 6. Navatara Chakra Matrix (9 Taras)
    expect(pAngas.navataraChakra.length).toBe(9);
    const vipatTara = pAngas.navataraChakra.find((t) => t.taraIndex === 2);
    expect(vipatTara?.taraNameKn).toContain("ವಿಪತ್");

    // 7. Upagrahas (10 Upagrahas)
    expect(pAngas.upagrahas.length).toBe(10);
    const dhuma = pAngas.upagrahas.find((u) => u.id === "dhuma");
    expect(dhuma).toBeDefined();
    expect(dhuma?.nakshatraKn).toBeTruthy();

    // 8. Pushkara Navamshas
    expect(Array.isArray(pAngas.pushkaraPlacements)).toBe(true);
  });
});
