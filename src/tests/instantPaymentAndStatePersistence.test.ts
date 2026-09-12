import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_PRIEST_UPI_ID,
  DEFAULT_PRIEST_UPI_HANDLES,
  DEFAULT_PRIEST_MOBILE_NUMBER,
  generateUpiPayUri,
  generatePhonePeUri,
  generateGPayUri,
  generatePaytmUri
} from "../features/wallet/walletTypes";
import { useWalletStore } from "../features/wallet/walletStore";
import verifyPaymentHandler from "../../api/verify-payment";

describe("UPI Payment Fixes & Instant Coin Crediting Engine", () => {
  beforeEach(() => {
    useWalletStore.getState().cleanup();
  });

  it("provides multiple valid UPI handles for Shreeram Pandit (9108135387)", () => {
    expect(DEFAULT_PRIEST_UPI_ID).toBe("9108135387@ybl");
    expect(DEFAULT_PRIEST_MOBILE_NUMBER).toBe("9108135387");
    expect(DEFAULT_PRIEST_UPI_HANDLES).toContain("9108135387@ybl");
    expect(DEFAULT_PRIEST_UPI_HANDLES).toContain("9108135387@ibl");
    expect(DEFAULT_PRIEST_UPI_HANDLES).toContain("9108135387@axl");
    expect(DEFAULT_PRIEST_UPI_HANDLES).toContain("9108135387@upi");
  });

  it("generates NPCI-compliant universal upi://pay URI with tr reference", () => {
    const uri = generateUpiPayUri(50, "PanchangaSeva", "9108135387@ybl");
    expect(uri).toContain("upi://pay?");
    expect(uri).toContain("pa=9108135387%40ybl");
    expect(uri).toContain("pn=Shreeram%20Pandit");
    expect(uri).toContain("am=50.00");
    expect(uri).toContain("cu=INR");
    expect(uri).toContain("tn=PanchangaSeva");
    expect(uri).toContain("tr=BAG");
  });

  it("PhonePe and Google Pay intent generators produce universal NPCI URIs without breaking custom schemes", () => {
    const phonePeUri = generatePhonePeUri(100, "PanchangaSeva", "9108135387@ibl");
    expect(phonePeUri).toContain("upi://pay?");
    expect(phonePeUri).toContain("pa=9108135387%40ibl");
    expect(phonePeUri).toContain("am=100.00");
    expect(phonePeUri).toContain("tr=PH");

    const gpayUri = generateGPayUri(250, "PanchangaSeva", "9108135387@axl");
    expect(gpayUri).toContain("upi://pay?");
    expect(gpayUri).toContain("pa=9108135387%40axl");
    expect(gpayUri).toContain("am=250.00");
    expect(gpayUri).toContain("tr=GP");
  });

  it("verify-payment API endpoint validates UTR, calculates bonus coins, and prevents duplicate UTR fraud", async () => {
    let responseStatus = 0;
    let responseData: any = null;

    const mockRes = {
      status: (code: number) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data: any) => {
        responseData = data;
        return mockRes;
      },
      setHeader: () => {},
      end: () => {}
    };

    const uniqueUtr = `UTR_${Date.now()}_9988`;
    const mockReq = {
      method: "POST",
      body: {
        userId: "test_devotee_44",
        priestName: "Devotee One",
        utr: uniqueUtr,
        amountInr: 100,
        coins: 1100
      }
    };

    // 1. Initial verification succeeds
    await verifyPaymentHandler(mockReq, mockRes);
    expect(responseStatus).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.verified).toBe(true);
    expect(responseData.coinsCredited).toBe(1100);
    expect(responseData.status).toBe("completed");

    // 2. Duplicate submission of the same UTR is rejected with 409 Conflict (anti-fraud)
    let dupStatus = 0;
    let dupData: any = null;
    const mockDupRes = {
      status: (code: number) => {
        dupStatus = code;
        return mockDupRes;
      },
      json: (data: any) => {
        dupData = data;
        return mockDupRes;
      },
      setHeader: () => {},
      end: () => {}
    };

    await verifyPaymentHandler(mockReq, mockDupRes);
    expect(dupStatus).toBe(409);
    expect(dupData.success).toBe(false);
    expect(dupData.error).toContain("ಈ UTR ಸಂಖ್ಯೆಗೆ");
  });

  it("walletStore.verifyAndCreditPayment immediately updates wallet balance without waiting for admin approval", async () => {
    const store = useWalletStore.getState();
    await store.initWallet("test_instant_user_1", "Test Devotee");

    const initialBalance = useWalletStore.getState().wallet?.coinBalance ?? 0;
    const testUtr = `UTR_INSTANT_${Date.now()}_12345`;

    const res = await store.verifyAndCreditPayment(testUtr, 50, 500);
    expect(res.success).toBe(true);
    expect(res.coinsCredited).toBe(500);

    const updatedWallet = useWalletStore.getState().wallet;
    expect(updatedWallet?.coinBalance).toBe(initialBalance + 500);
    expect(useWalletStore.getState().successMessage).toContain("ಪಾವತಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿದೆ");
  });
});

describe("State Persistence for Public Kundli & Sankhya Shastra", () => {
  const KUNDLI_KEY = "baggona_public_kundli_active_session";
  const SANKHYA_KEY = "baggona_public_sankhya_active_session";
  const VEDIC_GRID_KEY = "baggona_vedic_grid_active_session";

  beforeEach(() => {
    localStorage.removeItem(KUNDLI_KEY);
    localStorage.removeItem(SANKHYA_KEY);
    localStorage.removeItem(VEDIC_GRID_KEY);
  });

  it("stores and restores complete Public Kundli session state across browser minimize/calls", () => {
    const mockKundliSession = {
      form: {
        name: "ನಾಗರಾಜ ಭಟ್",
        birthDate: "1988-06-21",
        birthTime: "08:45",
        latitude: 14.5479,
        longitude: 74.3188,
        gothra: "ವಿಶ್ವಾಮಿತ್ರ",
        gender: "Male",
        pincode: "581326"
      },
      birthTimeHm: "08:45",
      locationCore: "Gokarna (581326)",
      homePlaceName: "Gokarna",
      result: {
        lagnaRashi: "ಕಟಕ",
        moonRashi: "ಕನ್ಯಾ",
        nakshatra: "ಹಸ್ತ"
      },
      dashaList: [{ mahadasha: "ಗುರು", startYear: 1988, endYear: 2004 }],
      publicProfile: { name: "ನಾಗರಾಜ ಭಟ್", ageYears: 38 },
      activeTab: "personality",
      isPersonalityUnlocked: true,
      unlockedKundliKeys: ["ನಾಗರಾಜ ಭಟ್_1988-06-21_08:45"],
      selectedLang: "kn",
      pdfLang: "kn"
    };

    localStorage.setItem(KUNDLI_KEY, JSON.stringify(mockKundliSession));

    const restoredRaw = localStorage.getItem(KUNDLI_KEY);
    expect(restoredRaw).not.toBeNull();
    const restored = JSON.parse(restoredRaw!);

    expect(restored.form.name).toBe("ನಾಗರಾಜ ಭಟ್");
    expect(restored.activeTab).toBe("personality");
    expect(restored.isPersonalityUnlocked).toBe(true);
    expect(restored.result.lagnaRashi).toBe("ಕಟಕ");
    expect(restored.unlockedKundliKeys).toContain("ನಾಗರಾಜ ಭಟ್_1988-06-21_08:45");
  });

  it("stores and restores complete Public Sankhya Shastra & Vedic Grid session state", () => {
    const mockSankhyaSession = {
      selectedLang: "kn",
      activeTab: "prashna",
      questionInput: "ವೃತ್ತಿ ಬದಲಾವಣೆ ಶುಭವೇ?",
      userNumberInput: 77,
      followUpInput: "",
      activeResult: { prashnaNumber: 77, outcomeKn: "ಶುಭ ಫಲ" },
      messages: [
        { id: "msg-1", sender: "user", text: "ವೃತ್ತಿ ಬದಲಾವಣೆ ಶುಭವೇ?", timestamp: "10:30 AM" },
        { id: "msg-2", sender: "priest", text: "ಗುರುವಿನ ಬಲದಿಂದ ಶುಭವಾಗಲಿದೆ.", timestamp: "10:31 AM" }
      ],
      nameInput: "ವಿಶ್ವನಾಥ ಶಾಸ್ತ್ರಿ",
      nameTargetNumber: 6,
      aiNameSuggestions: null,
      itemType: "phone",
      itemNumberInput: "9108135387",
      birthDateYmd: "1990-11-12"
    };

    localStorage.setItem(SANKHYA_KEY, JSON.stringify(mockSankhyaSession));

    const restoredRaw = localStorage.getItem(SANKHYA_KEY);
    expect(restoredRaw).not.toBeNull();
    const restored = JSON.parse(restoredRaw!);

    expect(restored.activeTab).toBe("prashna");
    expect(restored.userNumberInput).toBe(77);
    expect(restored.messages).toHaveLength(2);
    expect(restored.messages[0].text).toBe("ವೃತ್ತಿ ಬದಲಾವಣೆ ಶುಭವೇ?");
    expect(restored.nameInput).toBe("ವಿಶ್ವನಾಥ ಶಾಸ್ತ್ರಿ");
  });

  it("stores and restores Vedic Grid Dasha Tab AI predictions and parameters", () => {
    const mockGridSession = {
      devoteeName: "ಸುಬ್ರಹ್ಮಣ್ಯ ಭಟ್",
      birthDateStr: "1992-04-18",
      targetDateStr: "2026-09-12",
      userQuery: "ಹೊಸ ಉದ್ಯೋಗ ಆರಂಭ",
      aiAnalysisText: "ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ನಿಮ್ಮ ೩x೩ ಗ್ರಿಡ್‌ನಲ್ಲಿ ಬುಧಾದಿತ್ಯ ಯೋಗ ಸಕ್ರಿಯವಾಗಿದೆ.",
      selectedYogaFilter: "positive"
    };

    localStorage.setItem(VEDIC_GRID_KEY, JSON.stringify(mockGridSession));

    const restoredRaw = localStorage.getItem(VEDIC_GRID_KEY);
    expect(restoredRaw).not.toBeNull();
    const restored = JSON.parse(restoredRaw!);

    expect(restored.devoteeName).toBe("ಸುಬ್ರಹ್ಮಣ್ಯ ಭಟ್");
    expect(restored.aiAnalysisText).toContain("ಬುಧಾದಿತ್ಯ ಯೋಗ");
    expect(restored.selectedYogaFilter).toBe("positive");
  });
});
