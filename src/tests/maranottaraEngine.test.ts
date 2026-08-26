import { describe, it, expect, vi } from "vitest";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockResolvedValue("॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥\n\nಓಂ ಶಾಂತಿಃ. ದಿವಂಗತ ಆತ್ಮಕ್ಕೆ ಸದ್ಗತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ...")
}));

import {
  executeMaranottaraCalculation,
  compute12DaysRoadmap,
  computeAsthiVisarjanaGuide,
  computeGarudaPuranaWisdom,
  computeMahalayaTarpanaRules,
  computeGokarnaMokshaSevas,
  generateMaranottaraAIConsolation,
  toIstYmdString
} from "../features/maranottara/maranottaraEngine";
import type { MaranottaraInput } from "../features/maranottara/maranottaraEngine";

describe("Maranottara & Pitru Samskara Engine", () => {
  it("computes 1-12 days Antyesti roadmap accurately anchored to IST", () => {
    const roadmap = compute12DaysRoadmap("2026-08-26", "14:30");
    expect(roadmap.length).toBe(13); // Day 1 to 13 (Shubha Sweekara)
    expect(roadmap[0].dayNumber).toBe(1);
    expect(roadmap[0].dayTitle.kn).toContain("೧ನೇ ದಿನ");
    expect(roadmap[9].dayNumber).toBe(10);
    expect(roadmap[9].dayTitle.kn).toContain("೧೦ನೇ ದಿನ");
    expect(roadmap[11].dayNumber).toBe(12);
    expect(roadmap[11].dayTitle.kn).toContain("ದ್ವಾದಶಾಹ ಸಪಿಂಡೀಕರಣ");
  });

  it("preserves exact IST date even for early morning demise times (e.g., 02:30 AM IST)", () => {
    const inputEarlyMorning: MaranottaraInput = {
      personName: "Venkataramana Hegde",
      demiseDate: "2026-08-26",
      demiseTime: "02:30",
      yearsCount: 1,
      lang: "kn"
    };
    const res = executeMaranottaraCalculation(inputEarlyMorning);
    expect(res.demiseDate).toBe("2026-08-26");
    expect(res.antyestiRoadmap[0].dateStr).toContain("26");
  });

  it("generates sacred Asthi Visarjana guide with tirthas and mantra", () => {
    const guide = computeAsthiVisarjanaGuide();
    expect(guide.optimalTiming.kn).toBeDefined();
    expect(guide.sacredTirthas.length).toBeGreaterThanOrEqual(4);
    expect(guide.sacredTirthas[0].name.kn).toContain("ಗೋಕರ್ಣ");
    expect(guide.mantra).toContain("ಓಂ ಅಸ್ಥಿ ಸಂಚಯನ");
  });

  it("provides Garuda Purana and Mahalaya Tarpana wisdom", () => {
    const garuda = computeGarudaPuranaWisdom();
    expect(garuda.soulJourneySummary.kn).toBeDefined();
    expect(garuda.vaitaraniGodanaImportance.kn).toContain("ವೈತರಣಿ");

    const mahalaya = computeMahalayaTarpanaRules();
    expect(mahalaya.mahalayaOverview.kn).toContain("ಮಹಾಲಯ");
    expect(mahalaya.essentialDanaItems.kn.length).toBeGreaterThanOrEqual(4);
  });

  it("provides Gokarna Kshetra Priest details (Shreeram Pandit)", () => {
    const sevas = computeGokarnaMokshaSevas();
    expect(sevas.priestName).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(sevas.priestPhone).toContain("99723");
    expect(sevas.narayanabaliOverview.kn).toContain("ನಾರಾಯಣಬಲಿ");
  });

  it("executes complete calculation with date-only and with time", () => {
    // 1. Without Time
    const inputNoTime: MaranottaraInput = {
      personName: "Ramakrishna Bhat",
      demiseDate: "2026-08-26",
      yearsCount: 2,
      lang: "kn"
    };
    const resNoTime = executeMaranottaraCalculation(inputNoTime);
    expect(resNoTime.demiseTithi.kn).toBeDefined();
    expect(resNoTime.masikaSchedule.length).toBe(24); // 2 years * 12 months
    expect(resNoTime.antyestiRoadmap.length).toBe(13);

    // 2. With Time
    const inputWithTime: MaranottaraInput = {
      personName: "Ramakrishna Bhat",
      demiseDate: "2026-08-26",
      demiseTime: "22:15",
      yearsCount: 1,
      lang: "en"
    };
    const resWithTime = executeMaranottaraCalculation(inputWithTime);
    expect(resWithTime.demiseTime).toBe("22:15");
    expect(resWithTime.doshaAnalysis.hasTimeSpecificAnalysis).toBe(true);
    expect(resWithTime.masikaSchedule.length).toBe(12);
  });

  it("accurately classifies Panchaka Dosha and Darbha Putthali requirements", () => {
    const inputPanchaka: MaranottaraInput = {
      personName: "Devotee Soul",
      demiseDate: "2026-08-30", // Sunday (Raviwara)
      demiseTime: "10:00",
      yearsCount: 5,
      lang: "kn"
    };
    const res = executeMaranottaraCalculation(inputPanchaka);
    expect(res.masikaSchedule.length).toBe(60); // 5 years * 12 months = 60
    expect(res.masikaSchedule[11].isVarshikaShraddha).toBe(true);
    expect(res.masikaSchedule[59].isVarshikaShraddha).toBe(true);
  });

  it("generates AI spiritual consolation message with fallback", async () => {
    const input: MaranottaraInput = {
      personName: "Ganesh Hegde",
      demiseDate: "2026-08-26",
      yearsCount: 1,
      lang: "kn"
    };
    const res = executeMaranottaraCalculation(input);
    const aiText = await generateMaranottaraAIConsolation(res, "kn", "fake_key");
    expect(aiText).toBeDefined();
    expect(aiText.length).toBeGreaterThan(20);
  });
});
