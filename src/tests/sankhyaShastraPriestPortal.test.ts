import { describe, it, expect, vi } from "vitest";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockRejectedValue(new Error("Test fallback to deterministic engine"))
}));

import {
  generateSankhyaPrashnaReading,
  generateSankhyaNameSuggestion,
  generateSankhyaMobileVehicleSuggestion,
  calculateNameNumber,
  calculateMulankaBhagyanka
} from "../features/priest/sankhyaShastraPriestEngine";
import { SERVICE_COIN_COSTS } from "../features/wallet/walletTypes";
import { sendSystemTestEmail } from "../features/notifications/notificationService";

describe("Sankhya Shastra Priest Portal & Engine Validation", () => {
  it("verifies accurate pricing for Sankhya Shastra services", () => {
    expect(SERVICE_COIN_COSTS.SANKHYA_PRASHNA.coins).toBe(350);
    expect(SERVICE_COIN_COSTS.SANKHYA_PRASHNA.inrEquivalent).toBe(35);

    expect(SERVICE_COIN_COSTS.SANKHYA_NAME_SUGGESTION.coins).toBe(2000);
    expect(SERVICE_COIN_COSTS.SANKHYA_NAME_SUGGESTION.inrEquivalent).toBe(200);

    expect(SERVICE_COIN_COSTS.SANKHYA_MOBILE_VEHICLE.coins).toBe(2000);
    expect(SERVICE_COIN_COSTS.SANKHYA_MOBILE_VEHICLE.inrEquivalent).toBe(200);
  });

  it("computes Mulanka and Bhagyanka correctly from birth date", () => {
    const { mulanka, bhagyanka } = calculateMulankaBhagyanka("1990-05-15");
    // Day 15 -> 1 + 5 = 6 (Venus)
    expect(mulanka).toBe(6);
    // Total: 1+5 + 0+5 + 1+9+9+0 = 6 + 5 + 19 = 30 -> 3+0 = 3 (Jupiter)
    expect(bhagyanka).toBe(3);
  });

  it("calculates Chaldean name numbers accurately", () => {
    const { total, singleDigit } = calculateNameNumber("SHREERAM");
    expect(total).toBeGreaterThan(0);
    expect(singleDigit).toBeGreaterThanOrEqual(1);
    expect(singleDigit).toBeLessThanOrEqual(9);
  });

  it("generates a 100% technical Prashna reading with Sthira/Chara/Ubhaya and Varna influence in Kannada", async () => {
    const result = await generateSankhyaPrashnaReading({
      number: 108,
      question: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭವಾಗುವುದೇ?",
      devoteeName: "ಗುರುಪ್ರಸಾದ್",
      gothra: "ಕಾಶ್ಯಪ"
    });

    expect(result.number).toBe(108);
    expect(result.devoteeName).toBe("ಗುರುಪ್ರಸಾದ್");
    expect(result.rulingPlanetKn).toBeDefined();
    expect(result.natureKn).toMatch(/(ಸ್ಥಿರ|ಚರ|ಉಭಯ)/);
    expect(result.varnaKn).toMatch(/(ವರ್ಗ|ಅಧಿಕಾರಿಗಳು|ವ್ಯಾಪಾರಿಗಳು|ಶ್ರಮಿಕರು)/);
    expect(result.technicalParagraphs).toHaveLength(4);
    expect(result.technicalParagraphs[0].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೧");
    expect(result.technicalParagraphs[1].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೨");
    expect(result.technicalParagraphs[2].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೩");
    expect(result.technicalParagraphs[3].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೪");
    expect(result.remedyListKn.length).toBeGreaterThan(0);
  });

  it("generates lucky name correction and spelling recommendations", async () => {
    const result = await generateSankhyaNameSuggestion({
      inputName: "ANAND",
      birthDate: "1992-08-20",
      rashi: "ಮೇಷ",
      nakshatra: "ಅಶ್ವಿನಿ"
    });

    expect(result.inputName).toBe("ANAND");
    expect(result.mulanka).toBe(2); // 20 -> 2
    expect(result.recommendedSpellingsKn.length).toBeGreaterThan(0);
    expect(result.luckyLettersKn.length).toBeGreaterThan(0);
    expect(result.harmonyVerdictKn).toBeDefined();
  });

  it("generates auspicious mobile and vehicle registration sum recommendations", async () => {
    const mobileRes = await generateSankhyaMobileVehicleSuggestion({
      birthDate: "1988-11-23",
      targetType: "mobile"
    });

    expect(mobileRes.auspiciousTotals).toContain(5);
    expect(mobileRes.unfavorableTotals).toContain(4);
    expect(mobileRes.unfavorableTotals).toContain(8);

    const vehicleRes = await generateSankhyaMobileVehicleSuggestion({
      birthDate: "1988-11-23",
      targetType: "vehicle"
    });

    expect(vehicleRes.targetType).toBe("vehicle");
    expect(vehicleRes.reasonsKn).toContain("ವಾಹನ");
  });

  it("triggers diagnostic test email dispatch to spshreepandit@gmail.com", async () => {
    const res = await sendSystemTestEmail("spshreepandit@gmail.com");
    expect(res).toBeDefined();
  });
});
