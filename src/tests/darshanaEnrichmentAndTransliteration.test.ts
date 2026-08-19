import { describe, expect, it } from "vitest";
import { transliterateName } from "../utils/transliterator";
import { calculateKundli } from "../core/KundliEngine";
import { findBhuktiAtAge } from "../core/DashaBhuktiEngine";

describe("Daily Darshana Enrichment & Devotee Name Transliteration Engine", () => {
  it("transliterates devotee names accurately across all 5 languages", () => {
    // Manoj
    expect(transliterateName("Manoj", "kn")).toBe("ಮನೋಜ್");
    expect(transliterateName("Manoj", "hi")).toBe("मनोज");
    expect(transliterateName("Manoj", "te")).toBe("మనోజ్");
    expect(transliterateName("Manoj", "ta")).toBe("மனோஜ்");
    expect(transliterateName("Manoj", "en")).toBe("Manoj");

    // Dilip
    expect(transliterateName("Dilip", "kn")).toBe("ದಿಲೀಪ್");
    expect(transliterateName("Dilip", "hi")).toBe("दिलीप");
    expect(transliterateName("Dilip", "te")).toBe("దిలీప్");
    expect(transliterateName("Dilip", "ta")).toBe("தில்லீப்");

    // Pramod
    expect(transliterateName("Pramod", "kn")).toBe("ಪ್ರಮೋದ್");
    expect(transliterateName("Pramod", "hi")).toBe("प्रमोद");
  });

  it("calculates authentic Vimshottari Dasha-Bhukti periods for birth profiles", () => {
    const manojKundli = calculateKundli({
      name: "Manoj Poornamatha",
      birthDate: "1993-03-16",
      birthTime: "01:40",
      latitude: 14.54,
      longitude: 74.31
    });

    // Age in 2026 for birth 1993-03-16 (~33.4 years)
    const bhukti = findBhuktiAtAge(manojKundli, 33.4);
    expect(bhukti).toBeDefined();
    expect(bhukti?.maha.planet).toBeDefined();
    expect(bhukti?.bhukti).toBeDefined();
    expect(bhukti?.bhuktiEndAge).toBeGreaterThan(bhukti?.bhuktiStartAge || 0);
  });
});
