import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import {
  prepareSampoornaMaster25Data,
  type SampoornaMaster25Payload,
  getAgeCategory25
} from "../services/sampoornaMaster25Service";
import { SampoornaMaster25PdfTemplate } from "../components/sampoornaMaster25/SampoornaMaster25PdfTemplate";
import type { KundliOutput, KundliInput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";

describe("Sampoorna Master 25-Chapter Report & PDF Template Audit", () => {
  beforeEach(() => {
    cleanup();
  });

  const mockAdultKundli: KundliOutput = {
    planets: [
      { name: PlanetName.Sun, degree: 45, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, nakshatra: { index: 3, english: "Rohini", sanskrit: "Rohini", deity: "Brahma" }, house: 1 },
      { name: PlanetName.Moon, degree: 140, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 10, english: "Magha", sanskrit: "Magha", deity: "Pitris" }, house: 4 },
      { name: PlanetName.Mars, degree: 15, rashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, nakshatra: { index: 1, english: "Ashwini", sanskrit: "Ashwini", deity: "Ashwins" }, house: 1 },
      { name: PlanetName.Mercury, degree: 60, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 5, english: "Mrigashira", sanskrit: "Mrigashira", deity: "Soma" }, house: 2 },
      { name: PlanetName.Jupiter, degree: 120, rashi: { index: 3, english: "Cancer", sanskrit: "Karka" }, nakshatra: { index: 8, english: "Pushya", sanskrit: "Pushya", deity: "Brihaspati" }, house: 3 },
      { name: PlanetName.Venus, degree: 90, rashi: { index: 2, english: "Gemini", sanskrit: "Mithuna" }, nakshatra: { index: 6, english: "Ardra", sanskrit: "Ardra", deity: "Rudra" }, house: 2 },
      { name: PlanetName.Saturn, degree: 210, rashi: { index: 7, english: "Scorpio", sanskrit: "Vrischika" }, nakshatra: { index: 16, english: "Vishakha", sanskrit: "Vishakha", deity: "Indragni" }, house: 7 },
      { name: PlanetName.Rahu, degree: 330, rashi: { index: 10, english: "Aquarius", sanskrit: "Kumbha" }, nakshatra: { index: 24, english: "Shatabhisha", sanskrit: "Shatabhisha", deity: "Varuna" }, house: 10 },
      { name: PlanetName.Ketu, degree: 150, rashi: { index: 4, english: "Leo", sanskrit: "Simha" }, nakshatra: { index: 11, english: "Purva Phalguni", sanskrit: "Purva Phalguni", deity: "Bhaga" }, house: 4 }
    ],
    houses: Array.from({ length: 12 }, (_, i) => i * 30),
    ascendant: 15,
    lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" },
    moonSign: { index: 4, english: "Leo", sanskrit: "Simha" },
    sunSign: { index: 1, english: "Taurus", sanskrit: "Vrishabha" },
    moonPada: 4
  };

  const mockAdultDevotee: KundliInput = {
    name: "Shreesuma Upadhyaya",
    birthDate: "1994-06-15",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    maritalStatus: "married",
    childrenStatus: "has_children"
  };

  const mockInfantDevotee: KundliInput = {
    name: "Aarav Sharma",
    birthDate: "2025-06-01",
    birthTime: "08:15",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    maritalStatus: "unmarried",
    childrenStatus: "no_children"
  };

  it("1. Generates exactly 25 chapters with the strict Hook-First structure", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");

    expect(payload.chapters).toHaveLength(25);

    // Section 1: Instant Hook (Ch 1 to 6)
    expect(payload.chapters[0].chapterNumber).toBe(1);
    expect(payload.chapters[0].title).toContain("ಪ್ರಶ್ನ ದೃಷ್ಟಿ"); // Ch 1 Prashna Drishti #1
    expect(payload.chapters[1].chapterNumber).toBe(2);
    expect(payload.chapters[1].title).toContain("ನಿಗೂಢ ರಹಸ್ಯ"); // Ch 2 Nigooda Rahasya
    expect(payload.chapters[2].chapterNumber).toBe(3);
    expect(payload.chapters[2].title).toContain("ಕಳೆದ ೨೪ ತಿಂಗಳುಗಳ ಗಣಿತ ಪರಿಶೀಲನೆ"); // Ch 3 Past 24-Month
    expect(payload.chapters[3].chapterNumber).toBe(4);
    expect(payload.chapters[3].title).toContain("೯೯%"); // Ch 4 Maandi Knot
    expect(payload.chapters[3].title).toContain("ಮಾಂದಿ");
    expect(payload.chapters[4].chapterNumber).toBe(5);
    expect(payload.chapters[4].title).toContain("ಆಂತರಿಕ ೩ ಪರಮ ಸತ್ಯಗಳು"); // Ch 5 Inner 3 Truths
    expect(payload.chapters[4].title).toContain("ಪಂಚಭೂತ");
    expect(payload.chapters[5].chapterNumber).toBe(6);
    expect(payload.chapters[5].title).toContain("ಯೋಗಿ ಗ್ರಹ"); // Ch 6 Yogi & Avayogi
    expect(payload.chapters[5].title).toContain("ಅವಯೋಗಿ");

    // Section 2: What is happening right now (Ch 7 to 11)
    expect(payload.chapters[6].chapterNumber).toBe(7);
    expect(payload.chapters[7].chapterNumber).toBe(8);
    expect(payload.chapters[8].chapterNumber).toBe(9);
    expect(payload.chapters[9].chapterNumber).toBe(10);
    expect(payload.chapters[10].chapterNumber).toBe(11);

    // Section 3: 5 Life Pillars Q&A (Ch 12 to 16)
    expect(payload.chapters[11].chapterNumber).toBe(12);
    expect(payload.chapters[12].chapterNumber).toBe(13);
    expect(payload.chapters[13].chapterNumber).toBe(14);
    expect(payload.chapters[14].chapterNumber).toBe(15);
    expect(payload.chapters[15].chapterNumber).toBe(16);

    // Section 4: Near-Term & 5-Year Horizon (Ch 17 to 22)
    expect(payload.chapters[16].chapterNumber).toBe(17);
    expect(payload.chapters[17].chapterNumber).toBe(18);
    expect(payload.chapters[17].title).toContain("ಬೃಗು ಬಿಂದು"); // Ch 18 Bhrigu Bindu
    expect(payload.chapters[18].chapterNumber).toBe(19);
    expect(payload.chapters[19].chapterNumber).toBe(20);
    expect(payload.chapters[20].chapterNumber).toBe(21);
    expect(payload.chapters[21].chapterNumber).toBe(22);

    // Section 5: Remedies & Benediction (Ch 23 to 25)
    expect(payload.chapters[22].chapterNumber).toBe(23);
    expect(payload.chapters[23].chapterNumber).toBe(24);
    expect(payload.chapters[24].chapterNumber).toBe(25);
    expect(payload.chapters[24].title).toContain("ಗೋಕರ್ಣ");
    expect(payload.chapters[24].title).toContain("ಆಶೀರ್ವಾದ");
  });

  it("2. Verifies ZERO tables in SampoornaMaster25PdfTemplate DOM rendering", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");
    const { container } = render(<SampoornaMaster25PdfTemplate data={payload} />);

    // Must be ZERO tables anywhere in the entire 25 chapters
    const tables = container.querySelectorAll("table");
    expect(tables.length).toBe(0);

    // Verify presence of Q&A ribbons and cards
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs.length).toBeGreaterThan(50);

    // Verify container has correct V1 styling classes
    const pdfContainer = container.querySelector("#sampoorna-master-25-pdf-container");
    expect(pdfContainer).not.toBeNull();
    expect(pdfContainer?.className).toContain("bg-orange-50");
    expect(pdfContainer?.getAttribute("style")).toContain("900px");
  });

  it("3. Verifies strict Age-Bracket Adaptation (Infant vs Adult)", async () => {
    // 1. Infant (~1 year old)
    const infantSession = {
      result: mockAdultKundli,
      input: mockInfantDevotee
    };

    const infantPayload = await prepareSampoornaMaster25Data(infantSession, "kn");
    expect(infantPayload.ageCategory).toBe("infant");

    // Check Chapter 12 (Education/Career pillar):
    const infantCh12 = infantPayload.chapters[11];
    expect(infantCh12.question).toContain("ಶಿಶು");
    expect(infantCh12.paragraphs.join(" ")).toContain("ಬಾಲಾರಿಷ್ಟ");
    // Verify zero adult marriage/career/debt tokens
    expect(infantCh12.paragraphs.join(" ")).not.toContain("ಉದ್ಯೋಗ ಬಡ್ತಿ");
    expect(infantCh12.paragraphs.join(" ")).not.toContain("ವಿವಾಹ ಯೋಗ");
    expect(infantCh12.paragraphs.join(" ")).not.toContain("ಷೇರು ಮಾರುಕಟ್ಟೆ");

    // Check Chapter 14 (Relationships pillar):
    const infantCh14 = infantPayload.chapters[13];
    expect(infantCh14.question).toContain("ಪೋಷಕರ");
    expect(infantCh14.paragraphs.join(" ")).not.toContain("ದಾಂಪತ್ಯ ಸುಖ");
    expect(infantCh14.paragraphs.join(" ")).not.toContain("ಜೀವನ ಸಂಗಾತಿ");

    // 2. Adult (30+ years old)
    const adultSession = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };
    const adultPayload = await prepareSampoornaMaster25Data(adultSession, "kn");
    expect(adultPayload.ageCategory).toBe("adult");

    const adultCh12 = adultPayload.chapters[11];
    expect(adultCh12.paragraphs.join(" ")).toContain("ವೃತ್ತಿ");
    const adultCh14 = adultPayload.chapters[13];
    expect(adultCh14.paragraphs.join(" ")).toContain("ಸಂಗಾತಿ");
  });

  it("4. Verifies deterministic calculations: Yogi, Avayogi, Bhrigu Bindu, Maandi Knot", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");

    // Yogi planet
    expect(payload.yogiPlanet).toBeDefined();
    expect(payload.yogiRashi).toBeDefined();

    // Avayogi planet
    expect(payload.avayogiPlanet).toBeDefined();
    expect(payload.avayogiPlanet).not.toBe(payload.yogiPlanet);

    // Bhrigu Bindu
    expect(payload.bhriguBinduRashi).toBeDefined();
    expect(payload.bhriguBinduDegreeFormatted).toBeDefined();

    // Maandi house
    expect(payload.maandiHouse).toBeGreaterThanOrEqual(1);
    expect(payload.maandiHouse).toBeLessThanOrEqual(12);
    expect(payload.hasMaandiKnot).toBe(true);
    expect(payload.maandiDomainAffected).toBeDefined();
  });

  it("5. Verifies Chapter 25 End-of-PDF Conversion, Family Hook & Chaitanya Pandit Contact", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");

    // Verify Chapter 25 text content
    const ch25 = payload.chapters[24];
    expect(ch25.chapterNumber).toBe(25);

    // Verify Family Hook
    expect(payload.familyProtectionHook).toContain("ಕುಟುಂಬದ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯರ ಗ್ರಹಗಳು");

    // Verify Priest Booking Details
    expect(payload.priestBooking.priestName).toContain("ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(payload.priestBooking.phone).toBe("+91 94821 09844");

    // Render template and verify DOM presence
    const { container } = render(<SampoornaMaster25PdfTemplate data={payload} />);
    const htmlText = container.textContent || "";

    expect(htmlText).toContain("ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(htmlText).toContain("+91 94821 09844");
    expect(htmlText).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ");
  });

  it("6. Verifies multilingual generation across all 6 languages with zero English token leakage in Indic scripts", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const languages = ["kn", "hi", "mr", "te", "ta", "en"] as const;

    for (const lang of languages) {
      const payload = await prepareSampoornaMaster25Data(session, lang);
      expect(payload.chapters).toHaveLength(25);
      expect(payload.targetLanguage).toBe(lang);

      // Verify priest block
      expect(payload.priestBooking.phone).toBe("+91 94821 09844");
      expect(payload.priestBooking.priestName.length).toBeGreaterThan(0);

      if (lang === "kn") {
        // Assert zero English leakage in chapter titles
        payload.chapters.forEach((ch) => {
          expect(/[a-zA-Z]{4,}/.test(ch.title)).toBe(false);
        });
      }
    }
  });

  it("7. Verifies that EVERY SINGLE CHAPTER (1 to 25) contains AT LEAST 3 full paragraphs", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");
    expect(payload.chapters).toHaveLength(25);

    payload.chapters.forEach((ch) => {
      expect(
        ch.paragraphs.length,
        `Chapter ${ch.chapterNumber} (${ch.title}) must have at least 3 paragraphs, but found ${ch.paragraphs.length}`
      ).toBeGreaterThanOrEqual(3);

      // Verify each paragraph has substantial depth (at least 60 characters)
      ch.paragraphs.forEach((p, pIdx) => {
        expect(
          p.trim().length,
          `Chapter ${ch.chapterNumber} paragraph ${pIdx + 1} is too brief: "${p}"`
        ).toBeGreaterThanOrEqual(60);
      });
    });
  });

  it("8. Verifies presence and richness of all Core V1 Chapters (Yogas, Doshas, Dasha, Jyotishya Saramsha)", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");

    // Chapter 7: Current Mahadasha & Bhukti Reality
    const ch7 = payload.chapters.find((c) => c.chapterNumber === 7);
    expect(ch7).toBeDefined();
    expect(ch7?.title).toContain("ಮಹಾದಶೆ");
    expect(ch7?.paragraphs.length).toBeGreaterThanOrEqual(3);

    // Chapter 11: Special Planetary Yogas (Rajayogas, Gajakesari, Budhaditya)
    const ch11 = payload.chapters.find((c) => c.chapterNumber === 11);
    expect(ch11).toBeDefined();
    expect(ch11?.title).toContain("ರಾಜಯೋಗ");
    expect(ch11?.paragraphs.length).toBeGreaterThanOrEqual(3);
    const ch11Text = ch11?.paragraphs.join(" ") || "";
    expect(ch11Text).toContain("ರಾಜಯೋಗ");
    expect(ch11Text).toContain("ಗಜಕೇಸರಿ");
    expect(ch11Text).toContain("ಬುಧಾದಿತ್ಯ");

    // Chapter 23: Comprehensive Dosha Diagnostics (Kuja, Pitru, Sarpa, Maandi)
    const ch23 = payload.chapters.find((c) => c.chapterNumber === 23);
    expect(ch23).toBeDefined();
    expect(ch23?.title).toContain("ದೋಷ");
    expect(ch23?.paragraphs.length).toBeGreaterThanOrEqual(3);
    const ch23Text = ch23?.paragraphs.join(" ") || "";
    expect(ch23Text).toContain("ಕುಜ");
    expect(ch23Text).toContain("ಸರ್ಪ");
    expect(ch23Text).toContain("ಮಾಂದಿ");

    // Chapter 25: Chief Astrologer's Final Summary (Jyotishya Saramsha) & Gokarna Ashirvada
    const ch25 = payload.chapters.find((c) => c.chapterNumber === 25);
    expect(ch25).toBeDefined();
    expect(ch25?.title).toContain("ಜ್ಯೋತಿಷ್ಯ ಸಾರಾಂಶ");
    expect(ch25?.paragraphs.length).toBeGreaterThanOrEqual(3);
    const ch25Text = ch25?.paragraphs.join(" ") || "";
    expect(ch25Text).toContain("ಗೋಕರ್ಣ");
    expect(ch25Text).toContain("ಆಶೀರ್ವಾದ");
  });

  it("9. Verifies 15-Day Daily Darshana Calendar QR Code generation, Chaitanya Pandit branding and DOM rendering before Chapter 25", async () => {
    const session = {
      result: mockAdultKundli,
      input: mockAdultDevotee
    };

    const payload = await prepareSampoornaMaster25Data(session, "kn");

    // 1. Verify calendarQrSection is generated
    expect(payload.calendarQrSection).toBeDefined();
    const qrSec = payload.calendarQrSection!;

    expect(qrSec.title).toContain("೧೫ ದಿನಗಳ");
    expect(qrSec.badge).toContain("೧೫ ದಿನಗಳ");
    expect(qrSec.priestName).toContain("ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(qrSec.priestPhone).toBe("+91 94821 09844");
    expect(qrSec.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(qrSec.googleCalendarUrl).toContain("calendar.google.com");
    expect(decodeURIComponent(qrSec.googleCalendarUrl)).toContain("COUNT=15");

    // Features include Tarabala, Auspicious Muhurta, Rahu Kala, Gulika Kala, Yamaganda Kala
    const allFeaturesText = qrSec.features.join(" ");
    expect(allFeaturesText).toContain("ತಾರಾಬಲ");
    expect(allFeaturesText).toContain("ಮುಹೂರ್ತ");
    expect(allFeaturesText).toContain("ರಾಹು ಕಾಲ");
    expect(allFeaturesText).toContain("ಗುಳಿಕ ಕಾಲ");
    expect(allFeaturesText).toContain("ಯಮಗಂಡ ಕಾಲ");

    // Upsell note for 30-day cash desk
    expect(qrSec.upsellNoticeText).toContain("₹೩೦೦");
    expect(qrSec.upsellNoticeText).toContain("ಕ್ಯಾಶ್ ಡೆಸ್ಕ್");

    // 2. Render Template and verify DOM placement
    const { container } = render(<SampoornaMaster25PdfTemplate data={payload} />);

    // Calendar QR section must be rendered
    const calSectionEl = container.querySelector('[data-section="fifteen-day-calendar-qr"]');
    expect(calSectionEl).not.toBeNull();

    // Verify it is placed before chapter 25
    const ch25El = container.querySelector('[data-section="chapter-25"]');
    expect(ch25El).not.toBeNull();

    // In DOM tree, calSectionEl precedes ch25El
    const position = calSectionEl!.compareDocumentPosition(ch25El!);
    // DOCUMENT_POSITION_FOLLOWING is 4
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const calHtml = calSectionEl!.textContent || "";
    expect(calHtml).toContain("ಚೈತನ್ಯ ಪಂಡಿತ್");
    expect(calHtml).toContain("+91 94821 09844");
    expect(calHtml).toContain("₹೩೦೦");
  });

  it("10. Enforces strict A4 border clearance, proportional scaling (zero vertical squish), and inside-border running footers", async () => {
    const { SAMPOORNA25_A4_LAYOUT, planSampoorna25A4Pages } = await import("../services/sampoornaMaster25Service");

    // 1. Border & Footer Geometry Guards
    expect(SAMPOORNA25_A4_LAYOUT.IMAGE_X_MM).toBeGreaterThan(SAMPOORNA25_A4_LAYOUT.INNER_BORDER_INSET_MM);
    expect(SAMPOORNA25_A4_LAYOUT.IMAGE_X_MM + SAMPOORNA25_A4_LAYOUT.IMAGE_W_MM).toBeLessThan(
      SAMPOORNA25_A4_LAYOUT.A4_WIDTH_MM - SAMPOORNA25_A4_LAYOUT.INNER_BORDER_INSET_MM
    );
    expect(SAMPOORNA25_A4_LAYOUT.CONTENT_BOTTOM_MAX_MM).toBeLessThan(SAMPOORNA25_A4_LAYOUT.FOOTER_LINE_Y_MM);
    expect(SAMPOORNA25_A4_LAYOUT.FOOTER_TEXT_Y_MM).toBeLessThan(
      SAMPOORNA25_A4_LAYOUT.A4_HEIGHT_MM - SAMPOORNA25_A4_LAYOUT.INNER_BORDER_INSET_MM
    );

    // 2. Pagination & Aspect Ratio Preservation
    const pages = planSampoorna25A4Pages([
      { name: "cover", heightMm: 35, imgData: "img-cover" },
      { name: "user-details", heightMm: 78, imgData: "img-details" },
      { name: "executive-index", heightMm: 58, imgData: "img-index" },
      { name: "chapter-1", heightMm: 185, imgData: "img-ch1" },
      { name: "chapter-2", heightMm: 270, imgData: "img-ch2-tall" }, // Slightly > contUsableH (258.4mm)
      { name: "chapter-3", heightMm: 150, imgData: "img-ch3-a", sliceIndex: 0 },
      { name: "chapter-3", heightMm: 110, imgData: "img-ch3-b", sliceIndex: 1 },
    ]);

    expect(pages.length).toBe(5);
    // Page 1 packs cover + user-details + executive-index together cleanly
    expect(pages[0].sections.map((s) => s.name)).toEqual(["cover", "user-details", "executive-index"]);
    expect(pages[0].totalHeightMm).toBeLessThanOrEqual(pages[0].maxUsableHeightMm);

    // Oversized slightly tall chapter scales BOTH width & height proportionally (NO vertical squishing!)
    const ch2Sec = pages[2].sections[0];
    expect(ch2Sec.renderHeightMm).toBeCloseTo(pages[2].maxUsableHeightMm, 2);
    const originalRatio = SAMPOORNA25_A4_LAYOUT.IMAGE_W_MM / 270;
    const renderedRatio = ch2Sec.renderWidthMm / ch2Sec.renderHeightMm;
    expect(renderedRatio).toBeCloseTo(originalRatio, 2);
    expect(ch2Sec.renderXMm).toBeGreaterThan(SAMPOORNA25_A4_LAYOUT.IMAGE_X_MM);

    // Continuation slice starts cleanly on a new page
    expect(pages[4].sections[0].name).toBe("chapter-3");
  });

  it("11. Renders complete 6-Anga Birth Panchanga, Executive Index, Running Header & zero mobile viewport leakage in DOM", async () => {
    const payload = await prepareSampoornaMaster25Data(
      { result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna, Karnataka" },
      "kn"
    );

    expect(payload.pakshaName.length).toBeGreaterThan(0);
    expect(payload.tithiName.length).toBeGreaterThan(0);
    expect(payload.weekdayName.length).toBeGreaterThan(0);
    expect(payload.yogaName.length).toBeGreaterThan(0);
    expect(payload.karanaName.length).toBeGreaterThan(0);
    expect(payload.sunriseTime).toMatch(/:/);
    expect(payload.sunsetTime).toMatch(/:/);
    expect(payload.janmaHora.length).toBeGreaterThan(0);
    expect(payload.sectionIndexTitles.length).toBe(5);

    const { container } = render(<SampoornaMaster25PdfTemplate data={payload} />);
    const detailsText = container.querySelector('[data-section="user-details"]')?.textContent || "";
    expect(detailsText).toContain(payload.tithiName);
    expect(detailsText).toContain(payload.yogaName);
    expect(detailsText).toContain(payload.karanaName);
    expect(detailsText).toContain(payload.janmaHora);
    expect(detailsText).toContain(payload.birthPlace);
    expect(payload.birthPlace).not.toMatch(/[a-zA-Z]/);
    expect(detailsText).not.toContain(`${payload.pakshaName} ${payload.pakshaName}`);

    expect(container.querySelector('[data-section="executive-index"]')).toBeNull();
    expect(container.querySelector("#sampoorna-master-25-running-header")).not.toBeNull();
    expect(container.querySelector("#sampoorna-master-25-running-footer")).not.toBeNull();
    expect(container.querySelector("table")).toBeNull();

    // Verify repeated place strings deduplicate cleanly and Dosha summary has zero "( / )" or "( - )"
    const { resolvePlaceDisplayName } = await import("../services/sampoornaMaster25BookletEngine");
    const dedupedPlace = resolvePlaceDisplayName(
      "Gokarna (581326) · Gokarna (581326) · Gokarna (581326) · Gokarna (581326)",
      "kn"
    );
    expect(dedupedPlace).toBe("ಗೋಕರ್ಣ (೫೮೧೩೨೬)");
    expect(payload.detectedDoshasSummary).not.toMatch(/\(\s*[\/\-–—]+\s*\)/);

    // Ensure ZERO responsive classes or transform-skew glitches exist in rendered markup
    const rawHtml = container.innerHTML;
    expect(rawHtml).not.toMatch(/\b(sm|md|lg|xl):/);
    expect(rawHtml).not.toContain("-skew-x-12");
    expect(rawHtml).not.toContain("tracking-widest");
  });

  it("12. Enforces child-safe Chapter 13/14 guidance and zero Devanagari/Cyrillic script leakage in Tamil reports", async () => {
    const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
    const infantPayload = await prepareSampoornaMaster25Data(
      {
        result: mockAdultKundli,
        input: { ...mockAdultDevotee, name: "Baby Aarav", birthDate: sixMonthsAgo },
      },
      "kn"
    );

    const ch13Kn = infantPayload.chapters.find((c) => c.chapterNumber === 13)!;
    const ch13KnText = `${ch13Kn.title} ${ch13Kn.question} ${ch13Kn.paragraphs.join(" ")} ${ch13Kn.practicalGuidance || ""}`;
    expect(ch13KnText).not.toContain("ಷೇರು ಮಾರುಕಟ್ಟೆ");
    expect(ch13KnText).not.toContain("ಅನಗತ್ಯ ಸಾಲ");

    const ch14Kn = infantPayload.chapters.find((c) => c.chapterNumber === 14)!;
    expect(ch14Kn.practicalGuidance || "").not.toContain("ಸಂಗಾತಿ");

    const tamilPayload = await prepareSampoornaMaster25Data(
      { result: mockAdultKundli, input: mockAdultDevotee },
      "ta"
    );
    const { container } = render(<SampoornaMaster25PdfTemplate data={tamilPayload} />);
    const fullTamilText = [
      container.textContent || "",
      ...tamilPayload.chapters.flatMap((c) => [c.title, c.question, ...c.paragraphs, c.practicalGuidance || ""]),
    ].join(" ");

    // Zero Cyrillic (caught old bug "благоприятமான") and zero Devanagari in Tamil (caught "தன பிரदाता")
    expect(fullTamilText).not.toMatch(/[\u0400-\u04FF]/);
    expect(fullTamilText).not.toMatch(/[\u0900-\u097F]/);
  });

  it("13. Verifies Royal Booklet flow (Cover -> 25-Chapter Page Index -> Details -> Chapters), pure Indic isolation, concise story prose, and dynamic chapter SVG visuals", async () => {
    const languages = ["kn", "mr", "hi", "te", "ta", "en"] as const;
    for (const lang of languages) {
      const payload = await prepareSampoornaMaster25Data(
        { result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna, Karnataka" },
        lang
      );

      // 1. Cover personalization & emotional assurance
      expect(payload.coverPage.brandBannerTitle.length).toBeGreaterThan(5);
      expect(payload.coverPage.personalAssurancePara1).toContain(payload.devoteeName);
      expect(payload.coverPage.personalAssurancePara2.length).toBeGreaterThan(60);
      expect(payload.precisionProfile.liveTarabalaHeadline.length).toBeGreaterThan(3);
      expect(payload.precisionProfile.badhakaSummary.length).toBeGreaterThan(3);

      // 2. Every chapter uses 5-theme shuffled story hooks, Near/Far visual summary, and rich 5-6 line prose
      const themeSet = new Set<string>();
      payload.chapters.forEach((ch) => {
        expect(ch.storyHook && ch.storyHook.length).toBeGreaterThanOrEqual(40);
        expect(ch.visualSummary?.themeKey).toBeTruthy();
        expect(ch.visualSummary?.nearValue.length).toBeGreaterThan(2);
        expect(ch.visualSummary?.farValue.length).toBeGreaterThan(2);
        expect(ch.visualSummary?.glanceVerdict.length).toBeGreaterThan(2);
        if (ch.visualSummary?.themeKey) themeSet.add(ch.visualSummary.themeKey);

        expect(
          ch.paragraphs.length,
          `[${lang}] Chapter ${ch.chapterNumber} must have 3 rich storytelling paragraphs`
        ).toBeGreaterThanOrEqual(3);
        expect(ch.precisionAnchors?.length || 0).toBeGreaterThanOrEqual(2);
        expect(ch.visualType).toBeTruthy();
        const totalChars = ch.paragraphs.join(" ").length;
        expect(
          totalChars,
          `[${lang}] Chapter ${ch.chapterNumber} story must be substantial (>= 420 chars), got ${totalChars}`
        ).toBeGreaterThanOrEqual(420);
      });
      // All 5 themes appear shuffled across the 25 chapters
      expect(themeSet.size).toBe(5);

      // 2b. Verify zero English token mixing inside Indic coverPage / storyHook / visualSummary / doshas
      if (lang !== "en") {
        const coverStrings = Object.values(payload.coverPage).join(" ");
        expect(coverStrings).not.toMatch(/[a-zA-Z]{2,}/);
        expect(payload.detectedDoshasSummary).not.toMatch(/[a-zA-Z]{2,}/);
        expect(payload.detectedYogasSummary).not.toMatch(/[a-zA-Z]{2,}/);
        expect(payload.birthPlace).not.toMatch(/[a-zA-Z]/);
        for (const ch of payload.chapters) {
          expect(ch.storyHook || "").not.toMatch(/[a-zA-Z]{2,}/);
          expect(ch.visualSummary?.nearValue || "").not.toMatch(/[a-zA-Z]{2,}/);
          expect(ch.visualSummary?.farValue || "").not.toMatch(/[a-zA-Z]{2,}/);
        }
        for (const dp of payload.activeDoshaProfiles || []) {
          expect(`${dp.title} ${dp.doingNow} ${dp.affectingArea} ${dp.exactAction}`).not.toMatch(/[a-zA-Z]{2,}/);
        }
      }
    }

    // 3. Verify clean Cover -> Details -> Cosmic Aura -> Chapters flow (index intentionally removed)
    const payloadKn = await prepareSampoornaMaster25Data(
      { result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna (581326) · Gokarna (581326)" },
      "kn"
    );
    const { container } = render(<SampoornaMaster25PdfTemplate data={payloadKn} />);
    const coverEl = container.querySelector('[data-section="cover"]')!;
    const indexEl = container.querySelector('[data-section="executive-index"]');
    const detailsEl = container.querySelector('[data-section="user-details"]')!;
    const ch1El = container.querySelector('[data-section="chapter-1"]')!;

    const cosmicAuraEl = container.querySelector('[data-section="cosmic-aura"]');
    const elBalance = container.querySelector('[data-v1-visual="elemental-balance"]');
    const transitBadges = container.querySelector('[data-v1-visual="gochara-transits"]');
    const yogaHighlight = container.querySelector('[data-v1-visual="yoga-highlight"]');
    const doshaCards = container.querySelector('[data-v1-visual="dosha-remedy-cards"]');

    expect(coverEl).not.toBeNull();
    expect(indexEl).toBeNull();
    expect(detailsEl).not.toBeNull();
    expect(ch1El).not.toBeNull();
    expect(cosmicAuraEl).not.toBeNull();
    expect(elBalance).not.toBeNull();
    expect(transitBadges).not.toBeNull();
    expect(yogaHighlight).not.toBeNull();
    expect(doshaCards).not.toBeNull();
    // Reuses Premium PDF V1's CosmicDashaAuraVisual SVG rather than per-chapter custom chart clutter
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(1);
    expect(payloadKn.chapters[0].paragraphs[0].length).toBeGreaterThanOrEqual(250);

    // Order check: cover -> user-details -> chapter-1
    expect(coverEl.compareDocumentPosition(detailsEl) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(detailsEl.compareDocumentPosition(ch1El) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Cover contains Baggona Panchanga brand, Devotee name, single clean edition line & Pratah Prarthana vignette
    const coverText = coverEl.textContent || "";
    expect(coverText).toContain("ಬಗ್ಗೋಣ ಪಂಚಾಂಗ");
    expect(coverText).toContain(payloadKn.devoteeName);
    expect(coverText).toContain(payloadKn.coverPage.bookletEditionLine);
    expect(coverText).not.toContain(`${payloadKn.pakshaName} ${payloadKn.pakshaName}`);
    const pratahImg = coverEl.querySelector('[data-cover-element="pratah-prarthana"] img');
    expect(pratahImg).not.toBeNull();
    expect(pratahImg?.getAttribute("src")).toContain("/daily_posters/poster_1_shiva.jpg");
    expect((detailsEl.textContent || "").match(/ಗೋಕರ್ಣ/g)?.length || 0).toBeLessThanOrEqual(2);
  });

  it("14. Verifies full-page Cover -> Index -> Details -> 1 Chapter Per Page isolation & Extended Jyotish Precision Gates", async () => {
    const { planSampoorna25A4Pages } = await import("../services/sampoornaMaster25Service");
    const bookletPlan = planSampoorna25A4Pages([
      { name: "cover", heightMm: 222, imgData: "img-cover" },
      { name: "executive-index", heightMm: 215, imgData: "img-index" },
      { name: "user-details", heightMm: 205, imgData: "img-details" },
      { name: "chapter-1", heightMm: 205, imgData: "img-ch1" },
      { name: "chapter-2", heightMm: 210, imgData: "img-ch2" },
    ]);

    expect(bookletPlan.length).toBe(5);
    expect(bookletPlan[0].sections.map((s) => s.name)).toEqual(["cover"]);
    expect(bookletPlan[1].sections.map((s) => s.name)).toEqual(["executive-index"]);
    expect(bookletPlan[2].sections.map((s) => s.name)).toEqual(["user-details"]);
    expect(bookletPlan[3].sections.map((s) => s.name)).toEqual(["chapter-1"]);
    expect(bookletPlan[4].sections.map((s) => s.name)).toEqual(["chapter-2"]);

    // Verify combustion, retrograde, exaltation & Gandanta gates trigger accurately on a test chart
    const testCombustGandantaChart: KundliOutput = {
      ...mockAdultKundli,
      ascendant: 1.5, // Aries 1.5° -> Ashwini Pada 1 Gandanta!
      lagnaRashi: { index: 0, english: "Aries", sanskrit: "Mesha" }, // Movable Lagna -> Badhaka house 11 (Saturn)
      planets: mockAdultKundli.planets.map((p) => {
        if (p.name === PlanetName.Mercury) {
          // Near Sun (Taurus 45° -> 48° -> orb 3° <= 14°) and retrograde
          return { ...p, rashi: { index: 1, english: "Taurus", sanskrit: "Vrishabha" }, degree: 48, isRetrograde: true };
        }
        return p;
      })
    };

    const payload = await prepareSampoornaMaster25Data(
      { result: testCombustGandantaChart, input: mockAdultDevotee },
      "en"
    );

    expect(payload.precisionProfile.badhakaSummary).toContain("House 11");
    expect(payload.precisionProfile.retroCombustSummary).toContain("Retro: Mercury");
    expect(payload.precisionProfile.retroCombustSummary).toContain("Combust: Mercury");
    expect(payload.precisionProfile.gandantaSummary).toContain("Gandanta: Ascendant");
    expect(payload.precisionProfile.dignifiedSummary).toContain("Mars"); // Mars in Aries = Own Sign
    expect(payload.precisionProfile.dignifiedSummary).toContain("Jupiter"); // Jupiter in Cancer = Exalted
  });

  it("15. Enforces compact paragraph rhythm (zero space-evenly), clean single-border design, preserved colons, flex header wrapper, and English 'Page' labels", async () => {
    const payloadKn = await prepareSampoornaMaster25Data(
      { result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna, Karnataka" },
      "kn"
    );
    // Regression guard: word-attached colons in questions/titles must NOT be stripped by cleanEnglishFromRegionalText
    expect(payloadKn.chapters[0].question).toContain("ಪ್ರಶ್ನೆ:");
    expect(payloadKn.chapters[2].question).toContain("ಪ್ರಶ್ನೆ:");

    const { container } = render(<SampoornaMaster25PdfTemplate data={payloadKn} />);
    const html = container.innerHTML;
    expect(html).not.toContain("space-evenly");

    // Running header must contain an inner flex space-between wrapper immune to clone.style.display = "block"
    const rhInner = container.querySelector("#sampoorna-master-25-running-header > div") as HTMLElement | null;
    expect(rhInner).not.toBeNull();
    expect(rhInner?.style.display).toBe("flex");
    expect(rhInner?.style.justifyContent).toBe("space-between");

    // Verify English report cleanly omits Executive Index and renders Chapter headings & Pratah Cover cleanly
    cleanup();
    const payloadEn = await prepareSampoornaMaster25Data(
      { result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna, Karnataka" },
      "en"
    );
    const { container: enContainer } = render(<SampoornaMaster25PdfTemplate data={payloadEn} />);
    expect(enContainer.querySelector('[data-section="executive-index"]')).toBeNull();
    expect(enContainer.querySelector('[data-section="chapter-1"] h2')?.textContent).toContain("Chapter 1:");
    expect(enContainer.querySelector('[data-section="cover"] [data-cover-element="pratah-prarthana"]')).not.toBeNull();
  });

  it("16. Ensures per-person Panchanga uniqueness on Cover & Chapters, zero remedy spam in Ch 1-22, and structured Dosha cards in Ch 23", async () => {
    const personBDevotee: KundliInput = {
      name: "Meera Kulkarni",
      birthDate: "1986-11-19",
      birthTime: "21:40",
      latitude: 12.9716,
      longitude: 77.5946,
      gender: "Female",
      maritalStatus: "married",
      childrenStatus: "has_children",
    };
    const personBKundli: KundliOutput = {
      ...mockAdultKundli,
      ascendant: 215,
      lagnaRashi: { index: 7, english: "Scorpio", sanskrit: "Vrishchika" },
      moonSign: { index: 2, english: "Gemini", sanskrit: "Mithuna" },
      moonPada: 3,
      planets: mockAdultKundli.planets.map((p, idx) => ({
        ...p,
        rashi: { index: (idx + 6) % 12, english: "Libra", sanskrit: "Tula" },
        degree: ((p.degree + 170) % 360),
      })),
    };

    const [pAEn, pBEn, pAKn, pBKn] = await Promise.all([
      prepareSampoornaMaster25Data({ result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna" }, "en"),
      prepareSampoornaMaster25Data({ result: personBKundli, input: personBDevotee, placeLabel: "Bengaluru" }, "en"),
      prepareSampoornaMaster25Data({ result: mockAdultKundli, input: mockAdultDevotee, placeLabel: "Gokarna" }, "kn"),
      prepareSampoornaMaster25Data({ result: personBKundli, input: personBDevotee, placeLabel: "Bengaluru" }, "kn"),
    ]);

    // Different people at the same table MUST get distinct Cover sentences and distinct story copy
    expect(pAEn.coverPage.personalAssurancePara1).not.toBe(pBEn.coverPage.personalAssurancePara1);
    expect(pAEn.coverPage.personalAssurancePara2).not.toBe(pBEn.coverPage.personalAssurancePara2);
    expect(pAKn.coverPage.personalAssurancePara1).not.toBe(pBKn.coverPage.personalAssurancePara1);
    expect(pAEn.chapters[0].paragraphs[0]).not.toBe(pBEn.chapters[0].paragraphs[0]);
    expect(pAEn.chapters[4].paragraphs[0]).not.toBe(pBEn.chapters[4].paragraphs[0]);

    // 5 Narrative themes rotate/shuffle without consecutive repeats and differ between charts
    const seqA = pAEn.chapters.map((c) => c.visualSummary?.themeKey);
    const seqB = pBEn.chapters.map((c) => c.visualSummary?.themeKey);
    expect(new Set(seqA).size).toBe(5);
    expect(seqA.join(",")).not.toBe(seqB.join(","));
    for (let i = 1; i < seqA.length; i++) {
      expect(seqA[i]).not.toBe(seqA[i - 1]);
    }

    // Chapters 1-22 must NOT spam temple/puja remedies
    for (let i = 0; i < 22; i++) {
      const chEnText = pAEn.chapters[i].paragraphs.join(" ");
      const chKnText = pAKn.chapters[i].paragraphs.join(" ");
      expect(chEnText).not.toMatch(/Rudrabhisheka|Navagraha Shanti|Tila Homa/i);
      expect(chKnText).not.toMatch(/ರುದ್ರಾಭಿಷೇಕ|ನವಗ್ರಹ ಶಾಂತಿ|ತಿಲ ಹೋಮ/);
    }

    // Chapter 23 consolidated Dosha section must populate activeDoshaProfiles with DoingNow + Area + Action
    expect(pAEn.activeDoshaProfiles && pAEn.activeDoshaProfiles.length).toBeGreaterThanOrEqual(1);
    const firstDosha = pAEn.activeDoshaProfiles![0];
    expect(firstDosha.doingNow.length).toBeGreaterThan(15);
    expect(firstDosha.affectingArea.length).toBeGreaterThan(10);
    expect(firstDosha.exactAction.length).toBeGreaterThan(15);

    const { container } = render(<SampoornaMaster25PdfTemplate data={pAEn} />);
    const ch23El = container.querySelector('[data-section="chapter-23"]');
    expect(ch23El).not.toBeNull();
    expect(ch23El?.textContent).toContain(firstDosha.doingNow);
    expect(ch23El?.textContent).toContain(firstDosha.exactAction);

    // First-person Hero Kundali voice + nearest colleague + Ch 7 Dasha/Bhukti explanation
    expect(pAEn.heroSummary).toBeDefined();
    expect(pBEn.heroSummary).toBeDefined();
    expect(pAEn.heroSummary!.heroPlanetName.length).toBeGreaterThan(2);
    expect(pAEn.heroSummary!.nearestColleagueName.length).toBeGreaterThan(2);
    expect(pAEn.chapters[0].paragraphs[0]).toContain(pAEn.heroSummary!.heroPlanetName);
    expect(pAEn.chapters[6].paragraphs[0]).toMatch(/Mahadasha/i);
    expect(pAEn.chapters[6].paragraphs[0]).toMatch(/Bhukti/i);
    expect(pAKn.chapters[0].paragraphs[0]).toContain(pAKn.heroSummary!.heroPlanetName);
  });
});
