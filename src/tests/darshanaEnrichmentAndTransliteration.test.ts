import { describe, it, expect } from "vitest";
import { transliterateName } from "../utils/transliterator";
import { decodeDevoteeToken, encodeDevoteeToken } from "../utils/tokenCipher";
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";

describe("Daily Darshana Swayam Naik & Token Verification", () => {
  it("transliterates custom devotee name Swayam Naik across all 5 languages", () => {
    expect(transliterateName("Swayam Naik", "kn")).toBe("ಸ್ವಯಂ ನಾಯಕ್");
    expect(transliterateName("Swayam Naik", "hi")).toBe("स्वयं नायक");
    expect(transliterateName("Swayam Naik", "te")).toBe("స్వయం నాయక్");
    expect(transliterateName("Swayam Naik", "ta")).toBe("ஸ்வயம் நாயக்");
    expect(transliterateName("Swayam Naik", "en")).toBe("Swayam Naik");
  });

  it("encodes and decodes token safely with UTF-8 Indic script and full birth parameters", () => {
    const birthDetails = getUniversalBirthDetails({ name: "Swayam Naik", nakshatraIndex: 14, rashiIndex: 6 });
    const token = encodeDevoteeToken({
      name: "Swayam Naik",
      nakshatra: 14,
      rashi: 6,
      pandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      date: "2026-08-19",
      dob: birthDetails.dob,
      tob: birthDetails.tob,
      lang: "kn"
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Swayam Naik");
    expect(decoded?.nk).toBe(14);
    expect(decoded?.r).toBe(6);
    expect(decoded?.p).toBe("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(decoded?.dob).toBe("1994-01-06");
    expect(decoded?.tob).toBe("12:00");
  });

  it("calculates accurate Kundli and Vimshottari Dasha for Swayam Naik", () => {
    const birth = getUniversalBirthDetails({ name: "Swayam Naik", nakshatraIndex: 14 });
    const kundli = calculateKundli({
      name: "Swayam Naik",
      birthDate: birth.dob,
      birthTime: birth.tob,
      latitude: 14.54,
      longitude: 74.31
    });

    const moon = kundli.planets.find(p => p.name === "Moon");
    expect(moon?.rashi.index).toBe(6); // Tula Rashi
    expect(moon?.nakshatra.index).toBe(14); // Swati Nakshatra

    const ageYears = (new Date("2026-08-19").getTime() - new Date(birth.dob).getTime()) / (365.2425 * 86400 * 1000);
    const bhukti = findBhuktiAtAge(kundli, ageYears);

    expect(bhukti).not.toBeNull();
    expect(bhukti?.maha.planet).toBe("Saturn");
    expect(bhukti?.bhukti).toBe("Saturn");
  });
});
