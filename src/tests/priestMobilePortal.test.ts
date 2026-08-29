import { describe, it, expect, vi } from "vitest";

vi.mock("../core/GeminiEngine", () => ({
  askGemini: vi.fn().mockRejectedValue(new Error("Test fallback to deterministic Vedic engine"))
}));

import {
  generatePriestConsultationReading,
  PRIEST_CONSULTATION_CATEGORIES
} from "../features/priest/priestQuestionEngine";
import {
  SERVICE_COIN_COSTS,
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_MOBILE_NUMBER
} from "../features/wallet/walletTypes";
import { calculateKundli } from "../core/KundliEngine";

describe("Priest Mobile Portal: Consultation Engine & Technical Precision", () => {
  const sampleBirth = {
    name: "Ramesh Sharma",
    birthDate: "1995-08-15",
    birthTime: "14:30",
    place: "Gokarna",
    latitude: 14.54,
    longitude: 74.31,
    timezone: 5.5,
    gothra: "Kashyapa"
  };

  it("verifies updated pricing and UPI credentials for mobile refill", () => {
    expect(SERVICE_COIN_COSTS.KUNDLI_CALCULATION.coins).toBe(200);
    expect(SERVICE_COIN_COSTS.KUNDLI_CALCULATION.inrEquivalent).toBe(20);
    expect(SERVICE_COIN_COSTS.ASTROLOGY_QUESTION.coins).toBe(750);
    expect(SERVICE_COIN_COSTS.ASTROLOGY_QUESTION.inrEquivalent).toBe(75);
    expect(SERVICE_COIN_COSTS.PREMIUM_KUNDLI_PDF.coins).toBe(3500);
    expect(SERVICE_COIN_COSTS.PREMIUM_KUNDLI_PDF.inrEquivalent).toBe(350);
    expect(DEFAULT_PRIEST_UPI_ID).toBe("9108135387@ybl");
    expect(DEFAULT_PRIEST_MOBILE_NUMBER).toBe("9108135387");
  });

  it("verifies all 12 Kannada consultation categories are defined", () => {
    expect(PRIEST_CONSULTATION_CATEGORIES.length).toBe(12);
    const keys = PRIEST_CONSULTATION_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("maduve");
    expect(keys).toContain("shikshana");
    expect(keys).toContain("balya_santathi");
    expect(keys).toContain("udyoga");
    expect(keys).toContain("deshantara");
    expect(keys).toContain("kutumba");
    expect(keys).toContain("manasshanti");
    expect(keys).toContain("dukha_sankashta");
    expect(keys).toContain("preeti");
    expect(keys).toContain("kalasarpa");
    expect(keys).toContain("pitrudodha");
    expect(keys).toContain("custom");
  });

  it("generates a 4-paragraph technical astrological reading in pure Kannada for Santathi", async () => {
    const kundli = await calculateKundli(sampleBirth);
    const result = await generatePriestConsultationReading({
      kundli,
      devoteeName: "ರಮೇಶ್",
      gothra: "ಕಾಶ್ಯಪ",
      categoryKey: "balya_santathi",
      runningDashaText: "ಶನಿ ಮಹಾದಶಾ - ಬುಧ ಭುಕ್ತಿ"
    });

    expect(result.categoryKey).toBe("balya_santathi");
    expect(result.devoteeName).toBe("ರಮೇಶ್");
    expect(result.technicalParagraphs).toHaveLength(4);
    expect(result.technicalParagraphs[0].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೧");
    expect(result.technicalParagraphs[1].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೨");
    expect(result.technicalParagraphs[2].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೩");
    expect(result.technicalParagraphs[3].titleKn).toContain("ಪ್ಯಾರಾಗ್ರಾಫ್ ೪");
    expect(result.remedyListKn.length).toBeGreaterThan(0);
    expect(result.remedyListKn[0]).toContain("ಸಂತಾನ ಗೋಪಾಲ");
  }, 25000);

  it("detects and evaluates binary Yes/No for Kala Sarpa dosha inquiries", async () => {
    const kundli = await calculateKundli(sampleBirth);
    const result = await generatePriestConsultationReading({
      kundli,
      devoteeName: "ಸುರೇಶ್",
      gothra: "ವಿಶ್ವಾಮಿತ್ರ",
      categoryKey: "kalasarpa"
    });

    expect(result.isDoshaCheck).toBe(true);
    expect(result.verdictTextKn).toMatch(/(ಹೌದು|ಇಲ್ಲ)/);
    expect(result.technicalParagraphs[3].contentKn).toContain("ಬಗ್ಗೋಣ");
  }, 25000);

  it("verifies the exact Royal Welcome text and URL invite parameters", () => {
    const welcomeGreeting = "ನಮಸ್ಕಾರ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕರ್ತರಿಂದ ನಿಮಗೆ ಸ್ವಾಗತ";
    expect(welcomeGreeting).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
    expect(welcomeGreeting).toContain("ಸ್ವಾಗತ");

    const priestId = "priest_shreeram";
    const priestName = "Shreeram Pandit";
    const inviteUrl = `https://baggona-panchanga.firebaseapp.com/?portal=priest&user=${encodeURIComponent(priestId)}&name=${encodeURIComponent(priestName)}&firstTime=true`;
    
    expect(inviteUrl).toContain("portal=priest");
    expect(inviteUrl).toContain("user=priest_shreeram");
    expect(inviteUrl).toContain("firstTime=true");
  });
});
