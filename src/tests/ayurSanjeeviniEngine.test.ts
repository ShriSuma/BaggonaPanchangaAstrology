import { describe, it, expect } from "vitest";
import {
  calculateGandanta,
  calculateAyurdaya,
  calculateMarakaBadhaka,
  calculateKarmaVipaka,
  calculateTransitionDosha,
  calculateMokshaGati,
  executeAyurSanjeeviniCalculation
} from "../features/ayursanjeevini/ayurSanjeeviniEngine";
import type { AyurSanjeeviniInput } from "../features/ayursanjeevini/ayurSanjeeviniTypes";

describe("Ayur Sanjeevini & Karma Moksha Engine", () => {
  it("accurately identifies Nakshatra and Lagna Gandanta in Janana mode", () => {
    const gandantaResult = calculateGandanta("Ashwini", "Mesha");
    expect(gandantaResult.hasGandanta).toBe(true);
    expect(gandantaResult.type).toBe("sarpa_gandanta");
  });

  it("calculates accurate Ayurdaya category and positive vitality score", () => {
    const ayurdaya = calculateAyurdaya("Mesha", "Kataka", "1992-06-15");
    expect(ayurdaya.vitalityScore).toBeGreaterThanOrEqual(70);
    expect(ayurdaya.category).toBeDefined();
  });

  it("determines correct Maraka and Badhaka planets for Mesha Lagna", () => {
    const maraka = calculateMarakaBadhaka("Mesha");
    expect(maraka.marakaHouses).toContain("2ನೇ ಭಾವ (Dhana Sthana)");
    expect(maraka.badhakaHouse).toBe(11);
  });

  it("provides authentic Karma Vipaka remedies and root causes", () => {
    const vipaka = calculateKarmaVipaka("Mesha", "Kataka");
    expect(vipaka.length).toBeGreaterThanOrEqual(2);
    expect(vipaka[0].recommendedDaana).toBeDefined();
  });

  it("detects Panchaka transition in Marana mode", () => {
    const panchaka = calculateTransitionDosha("Dhanishta");
    expect(panchaka.isPanchaka).toBe(true);
    expect(panchaka.panchakaType).toContain("ಪಂಚಕ");
  });

  it("determines Moksha Gati realm based on 12th house and Karakamsa Ketu", () => {
    const gati = calculateMokshaGati("Dhanu", "Revati");
    expect(gati.soulRealm).toBe("moksha");
  });

  it("executes complete Janana calculation with zero marana confusion", () => {
    const input: AyurSanjeeviniInput = {
      mode: "janma",
      personName: "Narayana Bhat",
      dob: "1988-04-12",
      tob: "08:15",
      pob: "581326 Gokarna",
      gotra: "Kashyapa",
      lang: "kn"
    };

    const result = executeAyurSanjeeviniCalculation(input);
    expect(result.mode).toBe("janma");
    expect(result.longevity.vitalityScore).toBeGreaterThan(0);
    expect(result.gokarnaSankalpa.priestName).toBe("ಶ್ರೀರಾಮ ಪಂಡಿತ್ (Shreeram Pandit)");
  });

  it("executes complete Marana calculation with accurate Transition and Pitru guidance", () => {
    const input: AyurSanjeeviniInput = {
      mode: "mrityu",
      personName: "Late Ramachandra Bhat",
      dob: "2024-02-10",
      tob: "14:30",
      pob: "581326 Gokarna",
      gotra: "Vashishta",
      lang: "kn"
    };

    const result = executeAyurSanjeeviniCalculation(input);
    expect(result.mode).toBe("mrityu");
    expect(result.transitionDosha).toBeDefined();
    expect(result.mokshaGati.soulRealm).toBeDefined();
    expect(result.vamshaShield.vamshaProtectionMantra).toBeDefined();
  });
});
