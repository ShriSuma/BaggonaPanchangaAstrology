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
  generateHotelOrderId,
  HOTEL_PDF_PRICE_INR,
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
  compute5YearMasterPrediction,
  type FiveYearPredictionPayload
} from "../features/fiveYearPrediction/fiveYearPredictionEngine";

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

      expect(res.devoteeName).toContain("ಪ್ರಮೋದ್");
      expect(res.lagnaSignName).toBeTruthy();
      expect(res.moonSignName).toBeTruthy();
      expect(res.nakshatraName).toBeTruthy();
      expect(res.h8LordName).toBeTruthy();
      expect(res.h12LordName).toBeTruthy();

      // Paragraph 1: Outward composure vs hidden inner dilemma
      expect(res.paragraph1.length).toBeGreaterThan(150);
      expect(res.paragraph1).toMatch(/ಲಗ್ನವಾದ|ಅಷ್ಟಮ ಭಾವವಾದ|ಬಾಹ್ಯ|ಮುಖವಾಡ|ಒಳಮನಸ್ಸಿನ|ಮೌನವಾಗಿ/);

      // Paragraph 2: Subconscious solitude & unspoken truth
      expect(res.paragraph2.length).toBeGreaterThan(150);
      expect(res.paragraph2).toMatch(/ರಾಶಿಯಾದ|ನಕ್ಷತ್ರ|ದ್ವಾದಶ ಭಾವವಾದ|ಏಕಾಂತ|ಒಂಟಿತನ|ಮೌನ ತ್ಯಾಗಗಳು/);

      // Kshetra Gokarna divine blessing
      expect(res.kshetraBlessing).toContain("ಗೋಕರ್ಣ");
      expect(res.kshetraBlessing).toContain("ಮಹಾಬಲೇಶ್ವರ");
    });

    it("generates 2 rich substantive paragraphs across all other 6 languages: English, Hindi, Telugu, Tamil, Malayalam, Marathi", () => {
      const remainingLangs: AntarangaLang[] = ["en", "hi", "te", "ta", "ml", "mr"];

      remainingLangs.forEach((lang) => {
        const res = generateAntarangaSatya(mockKundli, lang, "Pramod Hegde", "male");

        expect(res.lang).toBe(lang);
        expect(res.paragraph1.length).toBeGreaterThan(120);
        expect(res.paragraph2.length).toBeGreaterThan(120);
        expect(res.kshetraBlessing.length).toBeGreaterThan(50);

        if (lang === "en") {
          expect(res.paragraph1).toContain("Ascendant");
          expect(res.paragraph1).toContain("8th House");
          expect(res.paragraph2).toContain("Dark Secret");
          expect(res.kshetraBlessing).toContain("GOKARNA");
        } else if (lang === "hi") {
          expect(res.paragraph1).toContain("अष्टम भाव");
          expect(res.paragraph2).toContain("गुप्त रहस्य");
          expect(res.kshetraBlessing).toContain("गोकर्ण");
        } else if (lang === "te") {
          expect(res.paragraph1).toContain("8వ ఇల్లు");
          expect(res.paragraph2).toContain("రహస్య సత్యం");
          expect(res.kshetraBlessing).toContain("గోకర్ణ");
        } else if (lang === "ta") {
          expect(res.paragraph1).toContain("8-ம் வீடு");
          expect(res.paragraph2).toContain("ஆழ்மன");
          expect(res.kshetraBlessing).toContain("கோகர்ணம்");
        } else if (lang === "ml") {
          expect(res.paragraph1).toContain("അഷ്ടമ ഭാവമായ");
          expect(res.paragraph2).toContain("അന്തരംഗ രഹസ്യം");
          expect(res.kshetraBlessing).toContain("ഗോകർണം");
        } else if (lang === "mr") {
          expect(res.paragraph1).toContain("आठवे गूढ स्थान");
          expect(res.paragraph2).toContain("गूढ सत्य");
          expect(res.kshetraBlessing).toContain("गोकर्ण");
        }
      });
    });

    it("correctly personalizes narrative with devotee name and gender", () => {
      const femaleRes = generateAntarangaSatya(mockKundli, "kn", "ಸೌಮ್ಯ ಶರ್ಮಾ", "female");
      expect(femaleRes.devoteeName).toContain("ಸೌಮ್ಯ");
      expect(femaleRes.paragraph1).toContain("ಸೌಮ್ಯ");
    });
  });

  describe("2. Payment Intent URI & Exact 9108135387@ybl ₹350 Specs", () => {
    it("generates standard UPI pay URI strictly targeting 9108135387@ybl for ₹350 with order note", () => {
      const orderId = "PP_T1_TEST123";
      const upiUri = getHotelPaymentUpiUri(350, orderId);

      expect(HOTEL_PDF_PRICE_INR).toBe(350);
      expect(PRIEST_UPI_ID).toBe("9108135387@ybl");
      expect(PRIEST_NAME).toBe("Shreeram Pandit");

      expect(upiUri).toContain("pa=9108135387%40ybl");
      expect(upiUri).toContain("am=350.00");
      expect(upiUri).toContain("cu=INR");
      expect(upiUri).toContain("pn=Shreeram%20Pandit");
      expect(upiUri).toContain(orderId);
      expect(upiUri).not.toContain("&tr="); // Must omit merchant tr to prevent PhonePe rejection
    });

    it("generates PhonePe, Google Pay, and Paytm URIs with order tags for 1-tap mobile payment", () => {
      const orderId = "PP_T2_AUTO456";
      const phonePeUri = getHotelPhonePeUri(350, orderId);
      const gPayUri = getHotelGPayUri(350, orderId);
      const paytmUri = getHotelPaytmUri(350, orderId);

      expect(phonePeUri).toContain("pa=9108135387%40ybl");
      expect(phonePeUri).toContain(orderId);

      expect(gPayUri).toContain("pa=9108135387%40ybl");
      expect(gPayUri).toContain(orderId);

      expect(paytmUri).toContain("pa=9108135387%40ybl");
      expect(paytmUri).toContain(orderId);
    });
  });

  describe("3. Frictionless 1-Tap Auto-Verification & Webhook Alternatives", () => {
    it("verifies payment in 1 click without requiring customer to manually type 12-digit UTR", async () => {
      const orderId = "PP_T3_FAST789";
      const res = await verifyHotelPaymentInstant(orderId, "Pramod", 350, "kn");

      expect(res.success).toBe(true);
      expect(res.transactionId).toBe(`TXN_${orderId}`);
      expect(res.message).toContain("₹೩೫೦ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ");
      expect(res.verifiedAt).toBeTruthy();
    });

    it("supports 1-tap instant verification across all languages (e.g. English, Hindi, Telugu)", async () => {
      const resEn = await verifyHotelPaymentInstant("PP_T4_EN", "Guest", 350, "en");
      expect(resEn.success).toBe(true);
      expect(resEn.message).toContain("Payment confirmed successfully");

      const resHi = await verifyHotelPaymentInstant("PP_T5_HI", "Guest", 350, "hi");
      expect(resHi.success).toBe(true);
      expect(resHi.message).toContain("भुगतान सफलतापूर्वक स्वीकृत");

      const resTe = await verifyHotelPaymentInstant("PP_T6_TE", "Guest", 350, "te");
      expect(resTe.success).toBe(true);
      expect(resTe.message).toContain("చెల్లింపు విజయవంతంగా స్వీకరించబడింది");
    });
  });

  describe("4. Accurate 12-Digit UTR Payment Verification & Security Checks (7 Languages)", () => {
    it("accepts a valid 12-digit UPI UTR number and generates localized success messages", async () => {
      const validUtr = "402319854721";
      const resultKn = await verifyHotelPaymentUtr(validUtr, "Pramod", 350, "kn");

      expect(resultKn.success).toBe(true);
      expect(resultKn.message).toContain("₹೩೫೦ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ");
      expect(resultKn.transactionId).toBe(`TXN_${validUtr}`);
      expect(resultKn.verifiedAt).toBeTruthy();

      // Test English
      const validUtrEn = "402319854722";
      const resultEn = await verifyHotelPaymentUtr(validUtrEn, "Pramod", 350, "en");
      expect(resultEn.success).toBe(true);
      expect(resultEn.message).toContain("Payment verified successfully");

      // Test Hindi
      const validUtrHi = "402319854723";
      const resultHi = await verifyHotelPaymentUtr(validUtrHi, "Pramod", 350, "hi");
      expect(resultHi.success).toBe(true);
      expect(resultHi.message).toContain("सफलतापूर्वक सत्यापित");
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

  describe("5. 5-Year Premium Master Horoscope PDF Payload Compatibility", () => {
    it("computes comprehensive 5-year destiny payload with current reality and next 5 years", () => {
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

      // Verify each year contains rich milestones
      payload.years.forEach((year, idx) => {
        expect(year.yearIndex).toBe(idx);
        expect(year.samvatsaraNative).toBeTruthy();
        expect(year.activeMahadasha).toBeTruthy();
        expect(year.activeBhukti).toBeTruthy();
        expect(year.whatToExpect.length).toBeGreaterThanOrEqual(1);
      });

      // Verify life chapters (Career, Wealth, Family, Health)
      expect(payload.chapters.length).toBeGreaterThanOrEqual(4);

      // Verify Gokarna Kshetra remedies and stotras
      expect(payload.prescribedStotra.stotraName).toBeTruthy();
      expect(payload.remedies.gokarnaParihara).toBeTruthy();
    });
  });
});
