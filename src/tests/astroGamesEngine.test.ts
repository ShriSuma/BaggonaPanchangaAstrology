import { describe, it, expect } from "vitest";

describe("Vedic Astro Gaming Suite Logic Tests", () => {
  // 1. Vedic Mind Reader binary matrix test
  it("Vedic Mind Reader uniquely resolves all integers from 1 to 63 via 6-bit binary matrix", () => {
    const bitCount = 6;
    const maxVal = 63;
    const cards: number[][] = [];

    for (let bit = 0; bit < bitCount; bit++) {
      const card: number[] = [];
      const bitWeight = 1 << bit;
      for (let n = 1; n <= maxVal; n++) {
        if ((n & bitWeight) !== 0) {
          card.push(n);
        }
      }
      cards.push(card);
    }

    // Verify each integer from 1 to 63 is uniquely reconstructible
    for (let target = 1; target <= 63; target++) {
      let reconstructed = 0;
      for (let bit = 0; bit < bitCount; bit++) {
        if (cards[bit].includes(target)) {
          reconstructed += 1 << bit;
        }
      }
      expect(reconstructed).toBe(target);
    }
  });

  // 2. Navagraha Board Ladder & Snake boundary test
  it("Navagraha Board ladders elevate player position and snakes demote within valid bounds", () => {
    const LADDERS: Record<number, number> = {
      5: 14,
      18: 37,
      28: 52,
      43: 61
    };

    const SNAKES: Record<number, number> = {
      22: 7,
      44: 25,
      58: 33,
      62: 19
    };

    // Ladders always move forward
    Object.entries(LADDERS).forEach(([from, to]) => {
      expect(to).toBeGreaterThan(Number(from));
      expect(to).toBeLessThanOrEqual(64);
    });

    // Snakes always move backward
    Object.entries(SNAKES).forEach(([from, to]) => {
      expect(to).toBeLessThan(Number(from));
      expect(to).toBeGreaterThanOrEqual(1);
    });
  });

  // 3. Sankhya Duel Driver calculation
  it("Sankhya Duel reduces any birth date (1..31) to 1..9 Driver Number accurately", () => {
    const calculateDriver = (d: number): number => {
      let sum = d;
      while (sum > 9) {
        sum = sum.toString().split("").map(Number).reduce((a, b) => a + b, 0);
      }
      return sum;
    };

    expect(calculateDriver(1)).toBe(1); // Surya
    expect(calculateDriver(15)).toBe(6); // 1+5 = 6 (Shukra)
    expect(calculateDriver(28)).toBe(1); // 2+8 = 10 -> 1+0 = 1 (Surya)
    expect(calculateDriver(29)).toBe(2); // 2+9 = 11 -> 1+1 = 2 (Chandra)
    expect(calculateDriver(31)).toBe(4); // 3+1 = 4 (Rahu)
  });
});
