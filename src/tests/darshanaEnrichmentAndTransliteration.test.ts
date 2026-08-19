import { describe, it, expect } from "vitest";
import { transliterateName } from "../utils/transliterator";
import { decodeDevoteeToken, encodeDevoteeToken } from "../utils/tokenCipher";
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";

describe("Daily Darshana Roja & Swayam Naik Token Verification", () => {
  it("transliterates custom devotee name Roja across all 5 languages", () => {
    expect(transliterateName("Roja", "kn")).toBe("ರೋಜಾ");
    expect(transliterateName("Roja", "hi")).toBe("रोजा");
    expect(transliterateName("Roja", "te")).toBe("రోజా");
    expect(transliterateName("Roja", "ta")).toBe("ரோஜா");
    expect(transliterateName("Roja", "en")).toBe("Roja");
  });

  it("encodes and decodes Roja token safely with exact DOB (13-Apr-1998) and TOB (12:45 PM)", () => {
    const rojaDob = "1998-04-13";
    const rojaTob = "12:45";
    const kundli = calculateKundli({
      name: "Roja",
      birthDate: rojaDob,
      birthTime: rojaTob,
      latitude: 14.54,
      longitude: 74.31
    });

    const moon = kundli.planets.find(p => p.name === "Moon");
    expect(moon?.rashi.index).toBe(6); // Tula Rashi
    expect(moon?.nakshatra.index).toBe(14); // Swati Nakshatra

    const token = encodeDevoteeToken({
      name: "Roja",
      nakshatra: moon?.nakshatra.index,
      rashi: moon?.rashi.index,
      pandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      date: "2026-08-19",
      dob: rojaDob,
      tob: rojaTob,
      lang: "kn"
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Roja");
    expect(decoded?.dob).toBe("1998-04-13");
    expect(decoded?.tob).toBe("12:45");

    const ageYears = (new Date("2026-08-19").getTime() - new Date(rojaDob).getTime()) / (365.2425 * 86400 * 1000);
    const bhukti = findBhuktiAtAge(kundli, ageYears);

    expect(bhukti).not.toBeNull();
    expect(bhukti?.maha.planet).toBe("Saturn");
    expect(bhukti?.bhukti).toBe("Mercury");
  });
});
