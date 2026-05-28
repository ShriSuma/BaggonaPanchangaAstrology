import { describe, expect, it, vi, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { initDatabase } from "../db/indexedDb";
import { calculateKundli } from "../core/KundliEngine";
import { generateJayashreePredictionBase, generateJayashreePrediction } from "../core/JayashreePredictionEngine";

describe("JayashreePredictionEngine", () => {
  const birth = {
    name: "Abhiram",
    birthDate: "2005-06-12",
    birthTime: "15:30",
    latitude: 14.5479,
    longitude: 74.3187
  };

  beforeEach(async () => {
    await initDatabase();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as { texts: string[] };
        return {
          ok: true,
          text: async () =>
            JSON.stringify({
              translations: body.texts.map((t) => `[hi]${t}`)
            })
        };
      })
    );
  });

  it("generates base readings in Kannada matching the tone of Jayashree Pandit", () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const pred = generateJayashreePredictionBase(k, birth, "kn");

    expect(pred.intro).toContain("Abhiram");
    expect(pred.intro).toContain("ಆಶ್ಲೇಷಾ");
    expect(pred.dashaContext).toContain("ವರ್ಷ");
    expect(pred.education).toBeDefined();
    expect(pred.career).toBeDefined();
    expect(pred.health).toBeDefined();
    expect(pred.finance).toBeDefined();
    expect(pred.housing).toBeDefined();

    // Check motherly/predictive tone keyphrases
    expect(pred.intro).toContain("ಜಯಶ್ರೀ ಪಂಡಿತ್");
    expect(pred.finance).toContain("ಆದಾಯಕ್ಕೆ ತಕ್ಕಂತೆ ಅಷ್ಟೇ ಖರ್ಚು");
    expect(pred.housing).toContain("ಸ್ವಂತ ಮನೆಯಲ್ಲಿದ್ದರೆ");
  });

  it("generates base readings in English", () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const pred = generateJayashreePredictionBase(k, birth, "en");

    expect(pred.intro).toContain("Abhiram");
    expect(pred.intro).toContain("Ashlesha");
    expect(pred.intro).toContain("Jayashree Pandit");
    expect(pred.dashaContext).toContain("Mahadasha");
    expect(pred.finance).toContain("match your expenses to your income");
    expect(pred.housing).toContain("living in your own home");
  });

  it("translates base readings to Hindi and other target languages asynchronously", async () => {
    const k = calculateKundli(birth, { ayanamsaModel: "lahiri" });
    const pred = await generateJayashreePrediction(k, birth, "hi");

    expect(pred.intro).toContain("[hi]");
    expect(pred.dashaContext).toContain("[hi]");
    expect(pred.education).toContain("[hi]");
    expect(pred.career).toContain("[hi]");
    expect(pred.health).toContain("[hi]");
    expect(pred.finance).toContain("[hi]");
    expect(pred.housing).toContain("[hi]");
  });
});
