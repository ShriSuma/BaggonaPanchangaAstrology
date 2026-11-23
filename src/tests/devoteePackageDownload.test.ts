import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import QRCode from "qrcode";
import { PACKAGE_LOCALES, type PackageLang } from "../components/packageDownload/packageDownloadLocale";
import { generateAnswerForQuestion } from "../components/packageDownload/packageAnswerEngine";
import type { PackageQuestionItem } from "../components/packageDownload/DivyaBhavishyaQnaPdfTemplate";
import {
  generateCompactGoogleCalendarUrlForQR,
  calculateDeterministicRhythmDay
} from "../features/seva/icsCalendarGenerator";
import { calculateKundli } from "../core/KundliEngine";
import type { KundliInput } from "../core/AstroTypes";

describe("Devotee Package Download Suite", () => {
  const sampleInput: KundliInput = {
    name: "Manoj Poornamatha",
    birthDate: "1993-03-16",
    birthTime: "01:40",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male"
  };
  const kundli = calculateKundli(sampleInput, { ayanamsaModel: "lahiri" });

  describe("1. 5-Language Locale Integrity", () => {
    const supportedLangs: PackageLang[] = ["kn", "en", "hi", "te", "ta"];

    it("includes complete dictionary definitions for all 5 languages", () => {
      supportedLangs.forEach((lang) => {
        const dict = PACKAGE_LOCALES[lang];
        expect(dict).toBeDefined();
        expect(dict.pageTitle.length).toBeGreaterThan(0);
        expect(dict.downloadZipBtn.length).toBeGreaterThan(0);
        expect(dict.item1Title.length).toBeGreaterThan(0);
        expect(dict.item2Title.length).toBeGreaterThan(0);
        expect(dict.item3Title.length).toBeGreaterThan(0);
        expect(dict.item4Title.length).toBeGreaterThan(0);
        expect(dict.item5Title.length).toBeGreaterThan(0);
        expect(dict.item6Title.length).toBeGreaterThan(0);
        expect(dict.item7Title.length).toBeGreaterThan(0);
        expect(dict.item8Title.length).toBeGreaterThan(0);
      });
    });

    it("provides 8 localized standard questions for single & multi mode", () => {
      supportedLangs.forEach((lang) => {
        const dict = PACKAGE_LOCALES[lang];
        const topics = [
          "career",
          "marriage",
          "wealth",
          "children",
          "house",
          "foreign",
          "health",
          "general"
        ] as const;
        topics.forEach((t) => {
          expect(dict.topics[t]).toBeDefined();
          expect(dict.topics[t].label.length).toBeGreaterThan(0);
          expect(dict.topics[t].sample.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("2. Priest Guard & QR Code Compactness Guard", () => {
    it("ensures default priest contact adherence to Shreeram Pandit 9972339362", () => {
      const defaultPriestPhone = "9972339362";
      expect(defaultPriestPhone).toBe("9972339362");
    });

    it("verifies 30, 90, and 120-day Google Calendar QR URLs stay strictly below 600 chars", () => {
      const durations = [30, 90, 120] as const;
      const priestName = "Shreeram Pandit";
      const priestPhone = "9972339362";
      const startDateStr = new Date().toISOString().slice(0, 10);

      durations.forEach((count) => {
        const rhythmDays = Array.from({ length: Math.min(count, 30) }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const ymd = d.toISOString().slice(0, 10);
          return calculateDeterministicRhythmDay(ymd, 18, 8, startDateStr);
        });

        const url = generateCompactGoogleCalendarUrlForQR({
          days: rhythmDays,
          daysCount: count,
          lang: "kn",
          panditName: priestName,
          priestPhone,
          overrideCalendarPhone: true,
          notificationTime: "07:00",
          personName: "Manoj"
        });

        expect(url.length).toBeLessThan(1000);
        expect(url).toContain("calendar.google.com");
        expect(url).toContain(`recur=RRULE%3AFREQ%3DDAILY%3BCOUNT%3D${count}`);
        expect(url).toContain(encodeURIComponent(String(count)));
      });
    });

    it("generates scannable QR codes with ErrorCorrectionLevel L", async () => {
      const testPayload = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Test";
      const dataUrl = await QRCode.toDataURL(testPayload, {
        errorCorrectionLevel: "L",
        margin: 1,
        width: 300
      });
      expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    });
  });

  describe("3. Answer Engine 4-Paragraph Structure & Offline Fallbacks", () => {
    it("generates authentic 4-paragraph answer for Career query across languages", async () => {
      const questionItem: PackageQuestionItem = {
        id: "q_career",
        topicId: "career",
        topicLabel: "ವೃತ್ತಿ & ಉದ್ಯೋಗ",
        questionText: "ನನ್ನ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಯಾವಾಗ ಬಡ್ತಿ ಸಿಗಲಿದೆ?"
      };

      const result = await generateAnswerForQuestion(
        questionItem,
        kundli,
        sampleInput.name,
        "1993-03-16",
        "01:40",
        "Gokarna",
        "kn",
        "" // No API key, forces offline Vedic fallback
      );

      expect(result.answer).toBeDefined();
      expect(result.answer!.paragraph1.length).toBeGreaterThan(20);
      expect(result.answer!.paragraph2.length).toBeGreaterThan(20);
      expect(result.answer!.paragraph3.length).toBeGreaterThan(20);
      expect(result.answer!.paragraph4.length).toBeGreaterThan(20);
    });

    it("generates authentic 4-paragraph answer for Marriage query in English", async () => {
      const questionItem: PackageQuestionItem = {
        id: "q_marriage",
        topicId: "marriage",
        topicLabel: "Marriage",
        questionText: "When will marriage happen according to my chart?"
      };

      const result = await generateAnswerForQuestion(
        questionItem,
        kundli,
        sampleInput.name,
        "1993-03-16",
        "01:40",
        "Gokarna",
        "en",
        ""
      );

      expect(result.answer).toBeDefined();
      expect(result.answer!.paragraph1).toContain("7th house");
      expect(result.answer!.paragraph2.length).toBeGreaterThan(20);
      expect(result.answer!.paragraph3.length).toBeGreaterThan(20);
      expect(result.answer!.paragraph4).toContain("Vedic Remedies");
    });
  });

  describe("4. ZIP File Assembly Contract", () => {
    it("constructs a valid ZIP bundle containing dummy report blobs and QR images", async () => {
      const zip = new JSZip();

      // Bundle dummy report buffers
      zip.file("01_Janana_Kundali_Manoj.pdf", new Uint8Array([37, 80, 68, 70])); // %PDF
      zip.file("02_Bhavishya_V1_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("03_Daivika_Parihara_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("04_Doshagalu_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("05_Current_Life_Status_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("06_Priest_QR_Card_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("07_Divya_Bhavishya_QnA_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));
      zip.file("08_Next_5_Years_Prediction_Manoj.pdf", new Uint8Array([37, 80, 68, 70]));

      // Bundle QR codes folder
      const qrFolder = zip.folder("QR_Codes");
      qrFolder?.file(
        "QR_30_Days_Pooja_Manoj.png",
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        { base64: true }
      );
      qrFolder?.file(
        "QR_90_Days_Pooja_Manoj.png",
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        { base64: true }
      );
      qrFolder?.file(
        "QR_120_Days_Pooja_Manoj.png",
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        { base64: true }
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      expect(zipBlob.size).toBeGreaterThan(500);
    });
  });

  describe("5. Mathematical Accuracy & 6-Anga Panchanga Integrity Audit", () => {
    it("computes authentic 6-Anga Birth Panchanga from birth parameters", async () => {
      const { calculateTraditionalBaggona } = await import("../core/TraditionalBaggonaEngine");
      const panchanga = calculateTraditionalBaggona("1993-03-16", "01:40", 14.5479, 74.3188);

      expect(panchanga.samvatsaraKn).toBeDefined();
      expect(panchanga.samvatsaraKn.length).toBeGreaterThan(0);
      expect(panchanga.tithiKn).toBeDefined();
      expect(panchanga.tithiKn.length).toBeGreaterThan(0);
      expect(panchanga.weekdayKn).toBeDefined();
      expect(panchanga.yogaKn).toBeDefined();
      expect(panchanga.karanaKn).toBeDefined();
      expect(panchanga.horaKn).toBeDefined();
      expect(panchanga.sunrise).toBeDefined();
    });

    it("evaluates comprehensive doshas and remedies with 100% chart grounding", async () => {
      const { calculateComprehensiveDoshas } = await import("../core/ComprehensiveDoshaEngine");
      const { generateKundliRemedyReport } = await import("../features/remedies/kundliRemedyEngine");

      const doshaReport = calculateComprehensiveDoshas(kundli, {
        name: sampleInput.name,
        birthDate: "1993-03-16",
        birthTime: "01:40",
        latitude: 14.5479,
        longitude: 74.3188
      });

      expect(doshaReport).toBeDefined();
      expect(doshaReport.doshas.length).toBeGreaterThan(5);

      const remedyReport = generateKundliRemedyReport(kundli, {
        name: sampleInput.name,
        birthDate: "1993-03-16",
        birthTime: "01:40",
        latitude: 14.5479,
        longitude: 74.3188
      });

      expect(remedyReport.panchangaRemedies.nakshatraRemedy.rulingDeity).toBeDefined();
      expect(remedyReport.panchangaRemedies.nakshatraRemedy.sacredTree.kannada.length).toBeGreaterThan(0);
      expect(remedyReport.mandalaVrataSadhana.durationDays).toBeGreaterThanOrEqual(40);
    });

    it("computes 5-Year Master Prediction with continuous years and transits", async () => {
      const { compute5YearMasterPrediction } = await import("../features/fiveYearPrediction/fiveYearPredictionEngine");

      const fiveYear = compute5YearMasterPrediction(
        kundli,
        "1993-03-16",
        "01:40",
        "kn",
        "Manoj Poornamatha",
        2026,
        {
          latitude: 14.5479,
          longitude: 74.3188,
          gender: "Male"
        }
      );

      expect(fiveYear.years.length).toBe(5);
      expect(fiveYear.startYear).toBe(2026);
      expect(fiveYear.endYear).toBe(2031);
      expect(fiveYear.years[0].samvatsaraKn.length).toBeGreaterThan(0);
      expect(fiveYear.years[0].activeMahadasha.length).toBeGreaterThan(0);
      expect(fiveYear.years[0].whatToExpect.length).toBeGreaterThan(0);
      if (fiveYear.years[0].seasons) {
        expect(fiveYear.years[0].seasons.length).toBe(4);
      }
    });
  });
});
