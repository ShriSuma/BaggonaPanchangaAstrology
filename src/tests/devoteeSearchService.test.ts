import { describe, it, expect } from "vitest";
import { filterDevoteesCrossLanguage, type DevoteeProfile } from "../services/devoteeSearchService";

describe("devoteeSearchService - Bi-directional Cross-Language Search", () => {
  const mockDevotees: DevoteeProfile[] = [
    {
      id: "1",
      name: "Ramesh Bhat",
      birthDate: "1985-04-12",
      birthTime: "10:30",
      latitude: 14.5479,
      longitude: 74.3188,
      placeName: "Gokarna",
      pincode: "581326",
      gothra: "Vasishtha",
      gender: "Male",
      rashi: "Tula",
      rashiSanskrit: "ತುಲಾ",
      nakshatra: "Swati",
      nakshatraSanskrit: "ಸ್ವಾತಿ",
      source: "local",
      createdAt: "2026-09-20T10:00:00.000Z"
    },
    {
      id: "2",
      name: "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ",
      birthDate: "1990-08-15",
      birthTime: "06:45",
      latitude: 14.5200,
      longitude: 74.3500,
      placeName: "Baggona",
      pincode: "581326",
      gothra: "Kashyapa",
      gender: "Male",
      rashi: "Kanya",
      rashiSanskrit: "ಕನ್ಯಾ",
      nakshatra: "Hasta",
      nakshatraSanskrit: "ಹಸ್ತ",
      source: "cloud",
      createdAt: "2026-09-21T09:00:00.000Z"
    },
    {
      id: "3",
      name: "Shreeram Pandit",
      birthDate: "1993-05-31",
      birthTime: "09:25",
      latitude: 14.5479,
      longitude: 74.3188,
      placeName: "Gokarna",
      pincode: "581326",
      gothra: "Vasishtha",
      gender: "Male",
      rashi: "Kanya",
      rashiSanskrit: "ಕನ್ಯಾ",
      nakshatra: "Hasta",
      nakshatraSanskrit: "ಹಸ್ತ",
      source: "local",
      createdAt: "2026-09-21T11:00:00.000Z"
    },
    {
      id: "4",
      name: "ವಿನಾಯಕ ಶಾಂತಿ",
      birthDate: "1988-12-05",
      birthTime: "14:15",
      latitude: 14.5479,
      longitude: 74.3188,
      placeName: "Gokarna",
      pincode: "581326",
      gothra: "Bharadwaja",
      gender: "Male",
      rashi: "Vrishika",
      rashiSanskrit: "ವೃಶ್ಚಿಕ",
      nakshatra: "Anuradha",
      nakshatraSanskrit: "ಅನುರಾಧಾ",
      source: "cloud",
      createdAt: "2026-09-19T08:00:00.000Z"
    }
  ];

  it("returns all devotees when query is empty", () => {
    const results = filterDevoteesCrossLanguage(mockDevotees, "");
    expect(results.length).toBe(4);
  });

  it("finds English record 'Ramesh Bhat' when searched in Kannada 'ರಮೇಶ' or 'ರ'", () => {
    const results = filterDevoteesCrossLanguage(mockDevotees, "ರಮೇಶ");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("Ramesh Bhat");

    const singleLetterResults = filterDevoteesCrossLanguage(mockDevotees, "ರ");
    expect(singleLetterResults.some(d => d.name === "Ramesh Bhat")).toBe(true);
  });

  it("finds Kannada record 'ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ' when searched in English 'Pramod' or 'pra'", () => {
    const results = filterDevoteesCrossLanguage(mockDevotees, "Pramod");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ");

    const prefixResults = filterDevoteesCrossLanguage(mockDevotees, "pra");
    expect(prefixResults.some(d => d.name === "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ")).toBe(true);
  });

  it("finds Kannada record 'ವಿನಾಯಕ ಶಾಂತಿ' when searched in English 'vinayak'", () => {
    const results = filterDevoteesCrossLanguage(mockDevotees, "vinayak");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("ವಿನಾಯಕ ಶಾಂತಿ");
  });

  it("finds 'Shreeram Pandit' when searched by word boundary 'Pandit' or 'ಶ್ರೀರಾಮ'", () => {
    const resultsKn = filterDevoteesCrossLanguage(mockDevotees, "ಶ್ರೀರಾಮ");
    expect(resultsKn.some(d => d.name === "Shreeram Pandit")).toBe(true);

    const resultsPandit = filterDevoteesCrossLanguage(mockDevotees, "Pandit");
    expect(resultsPandit.some(d => d.name === "Shreeram Pandit")).toBe(true);
  });

  it("matches place or gotra if searched", () => {
    const resultsGothra = filterDevoteesCrossLanguage(mockDevotees, "Bharadwaja");
    expect(resultsGothra.some(d => d.name === "ವಿನಾಯಕ ಶಾಂತಿ")).toBe(true);
  });
});
