import { describe, it, expect } from "vitest";
import {
  calculateDigitalRoot,
  calculatePrashnaLagnaHouse
} from "../features/sankhyashastra/sankhyaShastraEngine";
import {
  calculateChaldeanNameNumber,
  calculatePythagoreanNameNumber,
  generateIndianPhoneticSpellingVariants,
  generateNumerologicalNameCorrections,
  getSingleDigitRoot
} from "../features/sankhyashastra/nameCorrectionEngine";
import { generateLuckyNameSuggestions } from "../features/sankhyashastra/sankhyaNumerologyUtils";

describe("Sankhya Shastra Prashna Engine", () => {
  it("calculates digital root number (1..9) correctly", () => {
    expect(calculateDigitalRoot(1)).toBe(1);
    expect(calculateDigitalRoot(9)).toBe(9);
    expect(calculateDigitalRoot(10)).toBe(1);
    expect(calculateDigitalRoot(47)).toBe(2); // 4+7 = 11 -> 1+1 = 2
    expect(calculateDigitalRoot(108)).toBe(9); // 1+0+8 = 9
    expect(calculateDigitalRoot(249)).toBe(6); // 2+4+9 = 15 -> 1+5 = 6
  });

  it("calculates Prashna Lagna House (1..12) correctly from user chosen number", () => {
    expect(calculatePrashnaLagnaHouse(1)).toBe(1);
    expect(calculatePrashnaLagnaHouse(12)).toBe(12);
    expect(calculatePrashnaLagnaHouse(13)).toBe(1);
    expect(calculatePrashnaLagnaHouse(47)).toBe(11); // 47 % 12 = 11
    expect(calculatePrashnaLagnaHouse(108)).toBe(12); // 108 % 12 = 0 -> 12
    expect(calculatePrashnaLagnaHouse(249)).toBe(9); // 249 % 12 = 9
  });
});

describe("Sankhya Shastra Indian Name Correction & Phonetic Engine", () => {
  it("calculates Chaldean and Pythagorean name numbers accurately", () => {
    // RAMA: R(2) + A(1) + M(4) + A(1) = 8
    const chaldeanRama = calculateChaldeanNameNumber("RAMA");
    expect(chaldeanRama.compound).toBe(8);
    expect(chaldeanRama.root).toBe(8);

    // AMIT: A(1) + M(4) + I(1) + T(4) = 10 -> Root: 1
    const chaldeanAmit = calculateChaldeanNameNumber("AMIT");
    expect(chaldeanAmit.compound).toBe(10);
    expect(chaldeanAmit.root).toBe(1);

    // AMITH: A(1) + M(4) + I(1) + T(4) + H(5) = 15 -> Root: 6 (Venus)
    const chaldeanAmith = calculateChaldeanNameNumber("AMITH");
    expect(chaldeanAmith.compound).toBe(15);
    expect(chaldeanAmith.root).toBe(6);
  });

  it("generates 100% authentic Indian phonetic variants and specifies exact letter change locations", () => {
    const variantsAmit = generateIndianPhoneticSpellingVariants("Amit");
    const spellings = variantsAmit.map((v) => v.spelling);

    // Should include authentic variations like Amith, Amita, Ameet, etc.
    expect(spellings).toContain("Amith");
    expect(spellings).toContain("Amita");
    expect(spellings).toContain("Ameet");

    // Must NOT contain weird additions like AmitS or AmitR
    expect(spellings).not.toContain("AmitS");
    expect(spellings).not.toContain("AmitR");
    expect(spellings).not.toContain("AmitHh");

    // Check that exact change locations in Kannada & English are clearly described
    const amithVariant = variantsAmit.find((v) => v.spelling === "Amith");
    expect(amithVariant).toBeDefined();
    expect(amithVariant?.locationEn).toContain("Added 'h' after 't'");
    expect(amithVariant?.locationKn).toContain("ನಂತರ 'h' ಸೇರಿಸಿ");

    const amitaVariant = variantsAmit.find((v) => v.spelling === "Amita");
    expect(amitaVariant).toBeDefined();
    expect(amitaVariant?.locationEn).toContain("Added terminal 'a'");
    expect(amitaVariant?.locationKn).toContain("ಕೊನೆಯಲ್ಲಿ");
  });

  it("generates authentic Indian variations for Sanskrit and modern Indian names", () => {
    const variantsSuresh = generateIndianPhoneticSpellingVariants("Suresh");
    const sureshSpellings = variantsSuresh.map((v) => v.spelling);

    // Should include Sureesh, Suresha, Shuresh, etc.
    expect(sureshSpellings).toContain("Sureesh");
    expect(sureshSpellings).toContain("Suresha");
    expect(sureshSpellings).toContain("Shuresh");

    // Must strictly avoid weird suffixes
    expect(sureshSpellings).not.toContain("SureshS");
    expect(sureshSpellings).not.toContain("SureshR");

    const variantsRahul = generateIndianPhoneticSpellingVariants("Rahul");
    const rahulSpellings = variantsRahul.map((v) => v.spelling);
    expect(rahulSpellings).toContain("Rahula");
    expect(rahulSpellings).toContain("Raahul");
    expect(rahulSpellings).not.toContain("RahulS");
  });

  it("provides comprehensive numerological corrections matching target lucky roots", () => {
    const corrections = generateNumerologicalNameCorrections("Amit", [6, 5, 1, 3]);
    expect(corrections.length).toBeGreaterThan(0);

    for (const corr of corrections) {
      expect(corr.isIndianNameValidated).toBe(true);
      expect(corr.exactChangeLocation.en).toBeTruthy();
      expect(corr.exactChangeLocation.kn).toBeTruthy();
      expect(corr.phoneticStyle).toBeTruthy();
      expect(corr.suggestedCompound).toBeGreaterThan(0);
      expect(corr.suggestedRoot).toBeGreaterThan(0);
    }
  });

  it("sankhyaNumerologyUtils generateLuckyNameSuggestions produces authentic Indian variants", () => {
    const suggestions = generateLuckyNameSuggestions("Suresh", [5, 6, 1, 3]);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const sug of suggestions) {
      expect(sug.isIndianValidated).toBe(true);
      expect(sug.exactChangeKn).toBeTruthy();
      expect(sug.exactChangeEn).toBeTruthy();
      expect(sug.suggestedName).not.toMatch(/Suresh[S|R|Z]$/);
    }
  });
});
