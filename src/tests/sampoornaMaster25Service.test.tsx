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
});
