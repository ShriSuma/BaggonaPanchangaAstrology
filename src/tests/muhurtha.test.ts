import { describe, expect, it } from "vitest";
import { fetchShuddhaMuhurthas } from "../core/MuhurthaEngine";

describe("MuhurthaEngine", () => {
  it("calculates Shuddha Muhurthas for 2026", async () => {
    // Gokarna coords: 14.5479° N, 74.3187° E
    const res = await fetchShuddhaMuhurthas(2026, 14.5479, 74.3187, "lahiri");
    
    // It should find some pure Muhurthas
    expect(res.length).toBeGreaterThan(0);
    
    // Each entry must be valid and classified
    const first = res[0]!;
    expect(first.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(first.types.length).toBeGreaterThan(0);
    expect(first.purityScore).toBeGreaterThanOrEqual(80);
    expect(first.purityScore).toBeLessThanOrEqual(100);
  });
});
