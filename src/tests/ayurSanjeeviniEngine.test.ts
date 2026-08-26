import { describe, it, expect } from "vitest";
import {
  calculateGandanta,
  calculateAyurdaya,
  calculateMarakaBadhaka,
  calculateKarmaVipaka,
  calculateMokshaGati,
  buildSanjeeviniShield,
  executeAyurSanjeeviniCalculation,
  generateAyurSanjeeviniAINarrative
} from "../features/ayursanjeevini/ayurSanjeeviniEngine";
import type { AyurSanjeeviniInput } from "../features/ayursanjeevini/ayurSanjeeviniTypes";

describe("Ayur Sanjeevini & Karma Moksha Engine", () => {
  it("correctly identifies Nakshatra & Lagna Gandanta junction zones", () => {
    const resMula = calculateGandanta("Mula", "Mesha");
    expect(resMula.hasGandanta).toBe(true);
    expect(resMula.type).toBe("sarpa_gandanta");

    const resAshlesha = calculateGandanta("Ashlesha", "Vrishabha");
    expect(resAshlesha.hasGandanta).toBe(true);
    expect(resAshlesha.type).toBe("nakshatra");

    const resRohini = calculateGandanta("Rohini", "Vrishabha");
    expect(resRohini.hasGandanta).toBe(false);
    expect(resRohini.type).toBe("none");
  });

  it("computes authentic Ayurdaya longevity category and vitality score", () => {
    const ayur = calculateAyurdaya("Mesha", "Kataka", "1990-05-15");
    expect(["balarishta", "alpayu", "madhyayu", "deerghayu", "divyayu"]).toContain(ayur.category);
    expect(ayur.vitalityScore).toBeGreaterThanOrEqual(0);
    expect(ayur.vitalityScore).toBeLessThanOrEqual(100);
    expect(ayur.estimatedAgeSpan.length).toBeGreaterThan(5);
    expect(ayur.keyProtectiveYogas.length).toBeGreaterThan(0);
  });

  it("calculates Maraka and Badhaka lords based on Lagna sign mobility", () => {
    // Movable sign: Mesha -> Badhaka is 11th house (Kumbha -> Saturn)
    const marakaMovable = calculateMarakaBadhaka("Mesha");
    expect(marakaMovable.badhakaHouse).toBe(11);
    expect(marakaMovable.marakaPlanets.length).toBe(2);

    // Fixed sign: Vrishabha -> Badhaka is 9th house (Makara -> Saturn)
    const marakaFixed = calculateMarakaBadhaka("Vrishabha");
    expect(marakaFixed.badhakaHouse).toBe(9);

    // Dual sign: Mithuna -> Badhaka is 7th house (Dhanu -> Jupiter)
    const marakaDual = calculateMarakaBadhaka("Mithuna");
    expect(marakaDual.badhakaHouse).toBe(7);
  });

  it("correlates Karma Vipaka root causes and Vedic remedies", () => {
    const vipaka = calculateKarmaVipaka("Mesha", "Kataka");
    expect(vipaka.length).toBeGreaterThanOrEqual(3);
    expect(vipaka[0].karmicCause.length).toBeGreaterThan(10);
    expect(vipaka[0].prescribedMantra.length).toBeGreaterThan(5);
  });

  it("determines Moksha Gati and soul destination accurately", () => {
    const gatiMoksha = calculateMokshaGati("Mesha", "Mula");
    expect(gatiMoksha.soulRealm).toBe("moksha");

    const gatiPitru = calculateMokshaGati("Mesha", "Magha");
    expect(gatiPitru.soulRealm).toBe("pitru");
  });

  it("builds comprehensive Maha Mrityunjaya Sanjeevini shield", () => {
    const shield = buildSanjeeviniShield();
    expect(shield.mrityunjayaMantra).toContain("ತ್ರ್ಯಂಬಕಂ");
    expect(shield.recommendedJapaCount).toBeGreaterThan(0);
    expect(shield.rudrakshaRecommendation.length).toBeGreaterThan(5);
  });

  it("executes full Ayur Sanjeevini calculation for both Janma and Mrityu modes", () => {
    const janmaInput: AyurSanjeeviniInput = {
      mode: "janma",
      personName: "Shreedhar Bhat",
      dob: "1988-11-20",
      tob: "08:15",
      pob: "581326 Gokarna",
      gotra: "Kashyapa",
      lang: "kn"
    };

    const janmaResult = executeAyurSanjeeviniCalculation(janmaInput);
    expect(janmaResult.personName).toBe("Shreedhar Bhat");
    expect(janmaResult.mode).toBe("janma");
    expect(janmaResult.gandanta).toBeDefined();
    expect(janmaResult.longevity).toBeDefined();
    expect(janmaResult.gokarnaSankalpa.priestName).toContain("Shreeram Pandit");

    const mrityuInput: AyurSanjeeviniInput = {
      mode: "mrityu",
      personName: "Late Ramachandra Shastri",
      dob: "2024-03-10",
      tob: "14:30",
      pob: "Gokarna",
      gotra: "Bharadwaja",
      lang: "en"
    };

    const mrityuResult = executeAyurSanjeeviniCalculation(mrityuInput);
    expect(mrityuResult.personName).toBe("Late Ramachandra Shastri");
    expect(mrityuResult.mode).toBe("mrityu");
    expect(mrityuResult.mokshaGati).toBeDefined();
  });

  it("generates 5-language divine AI fallback narratives with zero blanks", async () => {
    const sampleInput: AyurSanjeeviniInput = {
      mode: "janma",
      personName: "Ananya Sharma",
      dob: "1995-07-12",
      tob: "06:45",
      pob: "Gokarna",
      gotra: "Vashistha",
      lang: "kn"
    };
    const result = executeAyurSanjeeviniCalculation(sampleInput);

    const narrativeKn = await generateAyurSanjeeviniAINarrative(result, "kn");
    expect(narrativeKn).toContain("ಆಯುರ್-ಸಂಜೀವಿನಿ");
    expect(narrativeKn).toContain("ಶ್ರೀರಾಮ ಪಂಡಿತ್");

    const narrativeEn = await generateAyurSanjeeviniAINarrative(result, "en");
    expect(narrativeEn).toContain("Ayur Sanjeevini");
    expect(narrativeEn).toContain("Shreeram Pandit");

    const narrativeHi = await generateAyurSanjeeviniAINarrative(result, "hi");
    expect(narrativeHi).toContain("आयुर्-संजीवनी");

    const narrativeTe = await generateAyurSanjeeviniAINarrative(result, "te");
    expect(narrativeTe).toContain("ఆయుర్-సంజీవిని");

    const narrativeTa = await generateAyurSanjeeviniAINarrative(result, "ta");
    expect(narrativeTa).toContain("ஆயுர்-சஞ்சீவினி");
  });
});
