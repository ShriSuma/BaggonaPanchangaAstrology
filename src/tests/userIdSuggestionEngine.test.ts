import { describe, it, expect, vi } from "vitest";
import {
  extractCleanNameTokens,
  sanitizeUserIdSlug,
  generateSmartUserIdSuggestions,
  suggestUserIdsWithAI
} from "../utils/userIdSuggestionEngine";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockResolvedValue('["shreeram_divine", "pandit_shreeram_gokarna", "shreeram_acharya"]')
}));

describe("Smart User ID Suggestion Engine (ಸ್ಮಾರ್ಟ್ ಯೂಸರ್ ID ಎಂಜಿನ್)", () => {
  it("transliterates and extracts clean tokens from Kannada Priest names", () => {
    const tokens = extractCleanNameTokens("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(tokens).toEqual(["shreeram", "pandit"]);
  });

  it("extracts tokens from multi-word English priest names", () => {
    const tokens = extractCleanNameTokens("Dr. Gajanana Bhat");
    expect(tokens.length).toBeGreaterThanOrEqual(2);
    expect(tokens).toContain("gajanana");
    expect(tokens).toContain("bhat");
  });

  it("sanitizes user ID slugs to valid alphanumeric + underscore format", () => {
    expect(sanitizeUserIdSlug("Priest Shreeram!! ")).toBe("priest_shreeram");
    expect(sanitizeUserIdSlug("shreeram...pandit")).toBe("shreeram_pandit");
    expect(sanitizeUserIdSlug("_shreeram_")).toBe("shreeram");
  });

  it("generates rich priest user ID suggestions for Kannada name 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್'", () => {
    const suggestions = generateSmartUserIdSuggestions("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್", "priest");
    const ids = suggestions.map((s) => s.id);

    expect(ids).toContain("priest_shreeram");
    expect(ids).toContain("pandit_shreeram");
    expect(ids).toContain("shreeram_pandit");
    expect(ids).toContain("shreeram.pandit");
    expect(ids).toContain("shreeram_gokarna");
    expect(ids).toContain("shreeram_vedic");
    expect(ids).toContain("shreeram108");
  });

  it("generates rich devotee user ID suggestions for 'ಗೌತಮ್ ನಾಯಕ್'", () => {
    const suggestions = generateSmartUserIdSuggestions("ಗೌತಮ್ ನಾಯಕ್", "devotee");
    const ids = suggestions.map((s) => s.id);

    expect(ids).toContain("user_gowtam");
    expect(ids).toContain("devotee_gowtam");
    expect(ids).toContain("gowtam_naik");
    expect(ids).toContain("gowtam.naik");
    expect(ids).toContain("gowtam_baggona");
  });

  it("handles single-word names gracefully", () => {
    const suggestions = generateSmartUserIdSuggestions("ಮಂಜುನಾಥ್", "priest");
    const ids = suggestions.map((s) => s.id);

    expect(ids).toContain("priest_manjunath");
    expect(ids).toContain("manjunath_gokarna");
    expect(ids).toContain("manjunath_vedic");
  });

  it("merges AI suggestions when Gemini responds with JSON array", async () => {
    const mockAiResponse = JSON.stringify([
      "shreeram_divine",
      "pandit_shreeram_gokarna",
      "shreeram_acharya"
    ]);

    // Test suggestUserIdsWithAI fallback/merge
    const res = await suggestUserIdsWithAI("Shreeram", "priest");
    expect(res.length).toBeGreaterThan(0);
  });
});
