import { describe, it, expect } from "vitest";
import {
  calculateDigitalRoot,
  calculatePrashnaLagnaHouse
} from "../features/sankhyashastra/sankhyaShastraEngine";

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
