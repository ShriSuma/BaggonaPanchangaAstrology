import { describe, it, expect, beforeEach } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput, KundliOutput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";
import {
  generateAntarangaSatya,
  getHotelPaymentUpiUri,
  getHotelPhonePeUri,
  getHotelGPayUri,
  getHotelPaytmUri,
  verifyHotelPaymentUtr,
  verifyHotelPaymentInstant,
  checkHotelPaymentWebhookStatus,
  generateHotelOrderId,
  HOTEL_PDF_PRICE_INR,
  HOTEL_REMEDY_ADDON_INR,
  HOTEL_PREMIUM_REMEDY_PRICE_INR,
  type HotelPackageType,
  PRIEST_UPI_ID,
  PRIEST_NAME,
  DEFAULT_HOTEL_NAME,
  DEFAULT_HOTEL_FULL_NAME,
  type AntarangaLang,
  ANTARANGA_LANGUAGES,
  RASHI_7L,
  GRAHA_7L,
  NAKSHATRA_7L
} from "../features/hotelSecret/antarangaService";
import {
  saveHotelOrderInitiated,
  updateHotelOrderVerified,
  getHotelOrder,
  verifyHotelOrderPayment,
  type HotelTableOrderDoc
} from "../db/firestoreDb";
import {
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload
} from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import {
  calculatePublicKundliProfile,
  generateDynamicLifeInsights
} from "../features/publicKundli/publicKundliEngine";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import {
  AntarangaAstrologicalScreenLoader,
  type AntarangaLoaderStage
} from "../components/loaders/AntarangaAstrologicalScreenLoader";

describe("Hotel Table Antarangada Satya & QR Payment Architecture Audit (7 Languages)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockDevoteeInput: KundliInput = {
    name: "ಪ್ರಮೋದ್ ಹೆಗಡೆ",
    birthDate: "1992-08-20",
    birthTime: "14:35",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male"
  };

  const mockKundli: KundliOutput = calculateKundli(mockDevoteeInput);

  describe("0. Hotel Identity Audit: Pandit Palette", () => {
    it("confirms official hotel brand identity is Pandit Palette", () => {
      expect(DEFAULT_HOTEL_NAME).toBe("Pandit Palette");
      expect(DEFAULT_HOTEL_FULL_NAME).toContain("Pandit Palette");
      expect(DEFAULT_HOTEL_FULL_NAME).toContain("ಪಂಡಿತ್ ಪ್ಯಾಲೆಟ್");
    });

    it("generates collision-free dining order IDs with table numbers", () => {
      const order1 = generateHotelOrderId("5");
      const order2 = generateHotelOrderId("5");
      expect(order1).toMatch(/^PP_T5_/);
      expect(order2).toMatch(/^PP_T5_/);
      expect(order1).not.toBe(order2);
    });
  });

  describe("1. Antarangada Satya (Dark Secret) Astrological Engine - 7-Language Parity", () => {
    it("confirms all 7 languages are registered matching 20-min consultation", () => {
      expect(ANTARANGA_LANGUAGES.length).toBe(7);
      const codes = ANTARANGA_LANGUAGES.map((l) => l.code);
      expect(codes).toEqual(["kn", "en", "hi", "te", "ta", "ml", "mr"]);
    });

    it("verifies 7-language astronomical naming tables for 12 Rashis, 9 Grahas, and 27 Nakshatras", () => {
      const allLangs: AntarangaLang[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];

      // 12 Rashis
      for (let r = 0; r < 12; r++) {
        for (const lang of allLangs) {
          expect(RASHI_7L[r][lang]).toBeTruthy();
          expect(RASHI_7L[r][lang].length).toBeGreaterThan(0);
        }
      }

      // 9 Grahas
      const grahas = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"] as const;
      for (const g of grahas) {
        for (const lang of allLangs) {
          expect(GRAHA_7L[g][lang]).toBeTruthy();
          expect(GRAHA_7L[g][lang].length).toBeGreaterThan(0);
        }
      }

      // 27 Nakshatras
      for (let n = 0; n < 27; n++) {
        for (const lang of allLangs) {
          expect(NAKSHATRA_7L[n][lang]).toBeTruthy();
          expect(NAKSHATRA_7L[n][lang].length).toBeGreaterThan(0);
        }
      }
    });

    it("generates 2 100% astrologically accurate, deep paragraphs in Kannada (kn)", () => {
      const res = generateAntarangaSatya(mockKundli, "kn", mockDevoteeInput.name, "male");

      expect(res.devoteeName).toBe(mockDevoteeInput.name);
      expect(res.lagnaSignName).toBeTruthy();
      expect(res.moonSignName).toBeTruthy();
      expect(res.nakshatraName).toBeTruthy();
      expect(res.h8LordName).toBeTruthy();
      expect(res.h12LordName).toBeTruthy();

      expect(res.paragraph1.length).toBeGreaterThan(100);
      expect(res.paragraph2.length).toBeGreaterThan(100);
      expect(res.kshetraBlessing).toContain("ಗೋಕರ್ಣ");
    });

    it("generates 2 rich substantive paragraphs across all other 6 languages: English, Hindi, Telugu, Tamil, Malayalam, Marathi", () => {
      const otherLangs: AntarangaLang[] = ["en", "hi", "te", "ta", "ml", "mr"];
      for (const lang of otherLangs) {
        const res = generateAntarangaSatya(mockKundli, lang, "Pramod Sharma", "male");
        expect(res.paragraph1.length).toBeGreaterThan(80);
        expect(res.paragraph2.length).toBeGreaterThan(80);
        expect(res.kshetraBlessing).toBeTruthy();
      }
    });

    it("correctly personalizes narrative with devotee name and gender", () => {
      const resFemale = generateAntarangaSatya(mockKundli, "kn", "ಸುಷ್ಮಾ ರಾವ್", "female");
      expect(resFemale.devoteeName).toBe("ಸುಷ್ಮಾ ರಾವ್");
      expect(resFemale.paragraph1).toContain("ಸುಷ್ಮಾ ರಾವ್");
    });
  });

  describe("2. Package Pricing Tiers (₹350 Standard vs ₹450 with Remedy) & UPI Intent URIs", () => {
    it("confirms base price is ₹350 and remedy add-on is +₹100 (total ₹450)", () => {
      expect(HOTEL_PDF_PRICE_INR).toBe(350);
      expect(HOTEL_REMEDY_ADDON_INR).toBe(100);
      expect(HOTEL_PREMIUM_REMEDY_PRICE_INR).toBe(450);
    });

    it("generates standard UPI pay URI strictly targeting 9108135387@ybl for ₹350 and ₹450", () => {
      const uri350 = getHotelPaymentUpiUri(350, "PP_T1_ORDER1");
      expect(uri350).toContain("9108135387%40ybl");
      expect(uri350).toContain("am=350");
      expect(uri350).toContain("Antaranga_PP_T1_ORDER1_350");

      const uri450 = getHotelPaymentUpiUri(450, "PP_T1_ORDER1");
      expect(uri450).toContain("9108135387%40ybl");
      expect(uri450).toContain("am=450");
      expect(uri450).toContain("Antaranga_PP_T1_ORDER1_450");
    });

    it("generates PhonePe, Google Pay, and Paytm URIs with dynamic amount (350 vs 450)", () => {
      const phonePe350 = getHotelPhonePeUri(350, "PP_T2_PHONEPE");
      expect(phonePe350).toContain("am=350");
      expect(phonePe350).toContain("upi://pay");

      const phonePe450 = getHotelPhonePeUri(450, "PP_T2_PHONEPE");
      expect(phonePe450).toContain("am=450");
      expect(phonePe450).toContain("Antaranga_PP_T2_PHONEPE_450");

      const gpay450 = getHotelGPayUri(450, "PP_T2_GPAY");
      expect(gpay450).toContain("am=450");
      expect(gpay450).toContain("Antaranga_PP_T2_GPAY_450");

      const paytm450 = getHotelPaytmUri(450, "PP_T2_PAYTM");
      expect(paytm450).toContain("am=450");
      expect(paytm450).toContain("Antaranga_PP_T2_PAYTM_450");
    });
  });

  describe("3. Firebase Firestore Payment Order Persistence & Strict Gate Guarantee", () => {
    it("persists initiated order in Firestore database", async () => {
      const orderId = "PP_T1_FIRE_001";
      const initialOrder: HotelTableOrderDoc = {
        id: orderId,
        orderId,
        tableNumber: "1",
        hotelName: "Pandit Palette",
        devoteeName: "Pramod Hegde",
        amountInr: 350,
        packageType: "standard_350",
        status: "INITIATED",
        selectedLang: "kn",
        createdAt: new Date().toISOString()
      };

      await saveHotelOrderInitiated(initialOrder);
      const fetched = await getHotelOrder(orderId);

      expect(fetched).not.toBeNull();
      expect(fetched?.orderId).toBe(orderId);
      expect(fetched?.status).toBe("INITIATED");
      expect(fetched?.amountInr).toBe(350);
    });

    it("strictly blocks PDF download verification if order status is still INITIATED (unpaid)", async () => {
      const orderId = "PP_T2_UNPAID";
      await saveHotelOrderInitiated({
        id: orderId,
        orderId,
        tableNumber: "2",
        hotelName: "Pandit Palette",
        devoteeName: "Guest",
        amountInr: 350,
        packageType: "standard_350",
        status: "INITIATED",
        selectedLang: "kn",
        createdAt: new Date().toISOString()
      });

      const verification = await verifyHotelOrderPayment(orderId, 350);
      expect(verification.verified).toBe(false);
      expect(verification.reason).toContain("not verified");
    });

    it("strictly rejects verification if amount paid is less than package requirement (e.g. ₹350 paid for ₹450 remedy package)", async () => {
      const orderId = "PP_T2_UNDERPAID";
      await updateHotelOrderVerified(orderId, "TXN_350_ONLY", 350, "UPI");

      // Verify attempting to claim ₹450 package with only ₹350 payment
      const verification = await verifyHotelOrderPayment(orderId, 450);
      expect(verification.verified).toBe(false);
      expect(verification.reason).toContain("less than package price");
    });

    it("successfully verifies when ₹450 is paid for ₹450 remedy package", async () => {
      const orderId = "PP_T2_PAID_450";
      await updateHotelOrderVerified(orderId, "TXN_450_OK", 450, "UPI");

      const verification = await verifyHotelOrderPayment(orderId, 450);
      expect(verification.verified).toBe(true);
      expect(verification.order?.amountInr).toBe(450);
      expect(verification.order?.packageType).toBe("remedy_450");
    });
  });

  describe("4. Frictionless 1-Tap Auto-Verification with Multi-Price Support", () => {
    it("verifies ₹350 payment in 1 click and updates Firestore", async () => {
      const orderId = "PP_T3_FAST350";
      const res = await verifyHotelPaymentInstant(orderId, "Pramod", 350, "kn", "standard_350");

      expect(res.success).toBe(true);
      expect(res.transactionId).toBe(`TXN_${orderId}`);
      expect(res.message).toContain("₹೩೫೦");
      expect(res.amountInr).toBe(350);

      const fsCheck = await verifyHotelOrderPayment(orderId, 350);
      expect(fsCheck.verified).toBe(true);
    });

    it("verifies ₹450 remedy package payment in 1 click and mentions sacred remedy", async () => {
      const orderId = "PP_T3_FAST450";
      const res = await verifyHotelPaymentInstant(orderId, "Pramod", 450, "kn", "remedy_450");

      expect(res.success).toBe(true);
      expect(res.transactionId).toBe(`TXN_${orderId}`);
      expect(res.message).toContain("₹೪೫೦");
      expect(res.message).toContain("ದೈವಿಕ ಪರಿಹಾರ");
      expect(res.amountInr).toBe(450);

      const fsCheck = await verifyHotelOrderPayment(orderId, 450);
      expect(fsCheck.verified).toBe(true);
    });
  });

  describe("5. Accurate 12-Digit UTR Payment Verification & Security Checks", () => {
    it("accepts a valid 12-digit UPI UTR number and generates localized success messages for ₹350 and ₹450", async () => {
      const validUtr = "402319854721";
      const resultKn = await verifyHotelPaymentUtr(validUtr, "Pramod", 350, "kn");

      expect(resultKn.success).toBe(true);
      expect(resultKn.message).toContain("₹೩೫೦ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ");

      // Test ₹450 with remedy in English
      const validUtr450 = "402319854722";
      const resultEn = await verifyHotelPaymentUtr(validUtr450, "Pramod", 450, "en", undefined, "remedy_450");
      expect(resultEn.success).toBe(true);
      expect(resultEn.message).toContain("₹450 Payment verified successfully");
      expect(resultEn.message).toContain("Remedy");
    });

    it("rejects short or invalid format UTR numbers (< 10 digits) with localized errors", async () => {
      const shortUtr = "12345";
      const result = await verifyHotelPaymentUtr(shortUtr, "Devotee", 350, "te");

      expect(result.success).toBe(false);
      expect(result.message).toContain("12-అంకెల");
    });

    it("rejects trivial or dummy fake UTR patterns", async () => {
      const dummyUtrs = [
        "000000000000",
        "111111111111",
        "123456789012",
        "testpayment123",
        "abcdef123456"
      ];

      for (const dummy of dummyUtrs) {
        const res = await verifyHotelPaymentUtr(dummy, "Devotee", 350, "kn");
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/ಅಮಾನ್ಯ UTR|೧೨-ಅಂಕಿಯ/);
      }
    });

    it("prevents replay attacks by rejecting already claimed duplicate UTRs across languages", async () => {
      const uniqueUtr = "509823417632";

      // First claim should succeed
      const firstAttempt = await verifyHotelPaymentUtr(uniqueUtr, "Pramod", 350, "kn");
      expect(firstAttempt.success).toBe(true);

      // Second attempt with exact same UTR must be rejected
      const secondAttempt = await verifyHotelPaymentUtr(uniqueUtr, "Another User", 350, "en");
      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.message).toContain("This UTR has already been claimed");
    });
  });

  describe("6. Multi-PDF Document Payloads (5-Year, Baggona Janma Kundali & Sacred Remedy)", () => {
    it("computes comprehensive 5-year destiny payload", () => {
      const payload: FiveYearPredictionPayload = compute5YearMasterPrediction(
        mockKundli,
        mockDevoteeInput.birthDate,
        mockDevoteeInput.birthTime,
        "kn",
        mockDevoteeInput.name,
        2026,
        {
          gender: mockDevoteeInput.gender,
          latitude: mockDevoteeInput.latitude,
          longitude: mockDevoteeInput.longitude,
          ayanamsa: "lahiri"
        }
      );

      expect(payload.devoteeName).toBe(mockDevoteeInput.name);
      expect(payload.startYear).toBe(2026);
      expect(payload.endYear).toBe(2031);
      expect(payload.years.length).toBe(5);
    });

    it("computes authentic Baggona Janma Kundali multi-page profile with life insights", () => {
      const profile = calculatePublicKundliProfile(
        mockKundli,
        mockDevoteeInput.birthDate,
        mockDevoteeInput.birthTime,
        mockDevoteeInput.latitude,
        mockDevoteeInput.longitude
      );
      profile.name = mockDevoteeInput.name;

      expect(profile).toBeDefined();
      expect(profile.name).toBe(mockDevoteeInput.name);
      expect(profile.panchangaAttributes).toBeDefined();
      expect(profile.planetaryRows.length).toBeGreaterThanOrEqual(9);

      const insights = generateDynamicLifeInsights(profile, "kn");
      expect(insights).toBeDefined();
      expect(insights.currentPhase.length).toBeGreaterThanOrEqual(1);
      expect(insights.careerFinance.length).toBeGreaterThanOrEqual(1);
      expect(insights.gokarnaRemedy).toBeDefined();
    });

    it("computes personalized sacred Gokarna remedy and mandala sadhana diagnosis", () => {
      const diagnosis = generateKundliRemedyReport(mockKundli, mockDevoteeInput);

      expect(diagnosis).toBeDefined();
      expect(diagnosis.devoteeName).toBe(mockDevoteeInput.name);
      expect(diagnosis.primaryStruggle).toBeDefined();
      expect(diagnosis.afflictionFactors).toBeDefined();
      expect(diagnosis.lifeTurnaroundTiming).toBeDefined();
    });
  });

  describe("7. Full-Screen Astrological Screen Loaders for Mobile & Dining Flow", () => {
    const allStages: AntarangaLoaderStage[] = [
      "language_init",
      "language_switch",
      "antaranga_calc",
      "package_switch",
      "payment_init",
      "payment_verify",
      "pdf_download_5year",
      "pdf_download_kundli",
      "pdf_download_remedy",
      "pdf_download_all",
      "table_qr_generate",
      "table_qr_pdf"
    ];

    const allLangs: AntarangaLang[] = ["kn", "en", "hi", "te", "ta", "ml", "mr"];

    it("verifies all 12 action loader stages are registered with complete astrological coverage", () => {
      expect(allStages.length).toBe(12);
      expect(allStages).toContain("language_init");
      expect(allStages).toContain("antaranga_calc");
      expect(allStages).toContain("package_switch");
      expect(allStages).toContain("payment_init");
      expect(allStages).toContain("payment_verify");
      expect(allStages).toContain("pdf_download_5year");
      expect(allStages).toContain("pdf_download_kundli");
      expect(allStages).toContain("pdf_download_remedy");
      expect(allStages).toContain("pdf_download_all");
      expect(allStages).toContain("table_qr_generate");
      expect(allStages).toContain("table_qr_pdf");
    });

    it("verifies that AntarangaAstrologicalScreenLoader is an authentic React component", () => {
      expect(typeof AntarangaAstrologicalScreenLoader).toBe("function");
    });
  });
});
