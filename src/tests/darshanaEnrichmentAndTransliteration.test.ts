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

  it("encodes and decodes Swayam Naik token safely with exact DOB (05-Feb-2006) and TOB (14:04)", () => {
    const swayamDob = "2006-02-05";
    const swayamTob = "14:04";
    const kundli = calculateKundli({
      name: "Swayam Naik",
      birthDate: swayamDob,
      birthTime: swayamTob,
      latitude: 14.54,
      longitude: 74.31
    });

    const moon = kundli.planets.find(p => p.name === "Moon");
    const token = encodeDevoteeToken({
      name: "Swayam Naik",
      nakshatra: moon?.nakshatra.index,
      rashi: moon?.rashi.index,
      pandit: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      date: "2026-08-19",
      dob: swayamDob,
      tob: swayamTob,
      lang: "kn"
    });

    const decoded = decodeDevoteeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.n).toBe("Swayam Naik");
    expect(decoded?.dob).toBe("2006-02-05");
    expect(decoded?.tob).toBe("14:04");

    const ageYears = (new Date("2026-08-19").getTime() - new Date(swayamDob).getTime()) / (365.2425 * 86400 * 1000);
    const bhukti = findBhuktiAtAge(kundli, ageYears);

    expect(bhukti).not.toBeNull();
    expect(bhukti?.maha.planet).toBe("Moon");
    expect(bhukti?.bhukti).toBe("Sun");
  });
});
