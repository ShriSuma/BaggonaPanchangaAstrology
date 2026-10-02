import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import { generateKundliRemedyReport } from "../features/remedies/kundliRemedyEngine";
import { PlanetName, type KundliInput, type KundliOutput } from "../core/AstroTypes";

describe("Daivika Parihara 3-Page PDF Contract & Border Containment Audit", () => {
  const mockKundli: KundliOutput = {
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
    moonPada: 1
  };

  const devoteeInput: KundliInput = {
    name: "Shreeram Hegde",
    birthDate: "1988-10-24",
    birthTime: "06:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male",
    gothra: "Vasishtha",
    primaryConcern: "career_obstacles"
  };

  it("1. Renders exactly 3 .pdf-page A4 containers with strict 1273px height conforming to baggona-pdf-layout-guard", () => {
    const diagnosis = generateKundliRemedyReport(mockKundli, devoteeInput);
    const { container } = render(<KundliRemedyPdfTemplate diagnosis={diagnosis} lang="kn" />);

    const pages = container.querySelectorAll(".pdf-page");
    expect(pages.length).toBe(3);

    pages.forEach((page, idx) => {
      const el = page as HTMLElement;
      expect(el.style.width).toBe("900px");
      expect(el.style.height).toBe("1273px");
      expect(el.style.overflow).toBe("hidden");

      // Verify the inner double-bordered container exists and is bounded to 1241px
      const innerBorderDiv = el.firstElementChild as HTMLElement;
      expect(innerBorderDiv).toBeTruthy();
      expect(innerBorderDiv.style.height).toBe("1241px");
      expect(innerBorderDiv.style.maxHeight).toBe("1241px");
      expect(innerBorderDiv.style.overflow).toBe("hidden");
      expect(innerBorderDiv.style.border).toContain("3px double");
    });
  });

  it("2. Page 1 contains Devotee Info, Root Cause Diagnosis & Panchanga 5-Angas Alignment", () => {
    const diagnosis = generateKundliRemedyReport(mockKundli, devoteeInput);
    const { container } = render(<KundliRemedyPdfTemplate diagnosis={diagnosis} lang="kn" />);

    const pages = container.querySelectorAll(".pdf-page");
    const page1 = pages[0] as HTMLElement;

    // Devotee Info
    expect(page1.textContent).toContain("Shreeram Hegde");
    expect(page1.textContent).toContain("Vasishtha");
    expect(page1.textContent).toContain("ಮೇಷ"); // Lagna
    expect(page1.textContent).toContain("ಸಿಂಹ"); // Moon Sign
    expect(page1.textContent).toContain("ಪೂರ್ವ ಫಲ್ಗುಣಿ"); // Nakshatra (Index 10 = Purva Phalguni)

    // Section 1: Diagnosis & Psychological Meters
    expect(page1.textContent).toContain("೧. ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ");
    expect(page1.textContent).toContain("ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ");
    expect(page1.textContent).toContain("ಮನೋ ಶಾಂತಿ");
    expect(page1.textContent).toContain("ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ");
    expect(page1.textContent).toContain("ತಾಳ್ಮೆ / ಧೃತಿ");

    // Section 2: Panchanga 5-Angas Alignment
    expect(page1.textContent).toContain("೨. ಪಂಚಾಂಗ ೫-ಅಂಗ ದೈವಿಕ ಸಾಧನೆ & ನಕ್ಷತ್ರ ವೃಕ್ಷ");
    expect(page1.textContent).toContain("ಪವಿತ್ರ ವೃಕ್ಷ");
    expect(page1.textContent).toContain("ತಿಥಿ & ಪಕ್ಷ");
    expect(page1.textContent).toContain("ಜನ್ಮ ವಾರ");
    expect(page1.textContent).toContain("ಜನ್ಮ ಯೋಗ");
    expect(page1.textContent).toContain("ಜನ್ಮ ಕರಣ");

    // Page 1 Footer
    expect(page1.textContent).toContain("ಪುಟ ೧/೩ (ಮುಂದುವರಿದಿದೆ...)");
  });

  it("3. Page 2 contains 4-Step Instant Pacification, 3-Phase Daily Routine & Classical Stotra", () => {
    const diagnosis = generateKundliRemedyReport(mockKundli, devoteeInput);
    const { container } = render(<KundliRemedyPdfTemplate diagnosis={diagnosis} lang="kn" />);

    const pages = container.querySelectorAll(".pdf-page");
    const page2 = pages[1] as HTMLElement;

    // Section 3: 4-Step Instant Pacification Protocol & Emergency Mantra
    expect(page2.textContent).toContain("೩. ತಕ್ಷಣ ಕೋಪ, ಆವೇಶ & ಆತಂಕ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ");
    expect(page2.textContent).toContain("ಆಪತ್ಕಾಲೀನ ಮನಃಶಾಂತಿ ಬೀಜ ಮಂತ್ರ");

    // Section 4: Daily 3-Phase Pacification Routine
    expect(page2.textContent).toContain("೪. ದೈನಂದಿನ ಪ್ರಾತಃಕಾಲ, ಮಧ್ಯಾಹ್ನ & ಸಂಧ್ಯಾಕಾಲದ ಶಾಂತಿ ನಿಯಮಾವಳಿ");
    expect(page2.textContent).toContain("ಮುಂಜಾನೆ");
    expect(page2.textContent).toContain("ಮಧ್ಯಾಹ್ನ");
    expect(page2.textContent).toContain("ಮುಸ್ಸಂಜೆ");

    // Section 5: Personalized Daily Classical Stotra
    expect(page2.textContent).toContain("೫. ಜನ್ಮ ಕುಂಡಲಿಗೆ ನಿಗದಿತ ದೈನಂದಿನ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ");
    expect(page2.textContent).toContain("ಸಮಯ");
    expect(page2.textContent).toContain("ಫಲಶೃತಿ");

    // Page 2 Footer
    expect(page2.textContent).toContain("ಪುಟ ೨/೩ (ಮುಂದುವರಿದಿದೆ...)");
  });

  it("4. Page 3 contains Dasha-Bhukti, Gochara, Temple Sevas & Chief Priest Shreeram Pandit Seal", () => {
    const diagnosis = generateKundliRemedyReport(mockKundli, devoteeInput);
    const { container } = render(<KundliRemedyPdfTemplate diagnosis={diagnosis} lang="kn" />);

    const pages = container.querySelectorAll(".pdf-page");
    const page3 = pages[2] as HTMLElement;

    // Section 6: Dasha-Bhukti & Gochara Shanti
    expect(page3.textContent).toContain("೬. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಫಲ ಪರಿಹಾರ");
    expect(page3.textContent).toContain("ಭಾಗ್ಯೋದಯ & ಪರಿಹಾರ ಕಾಲಾವಧಿ");
    expect(page3.textContent).toContain("ದಶಾ ಪ್ರಭಾವ");

    // Section 7: Gokarna Temple Sevas & Daana
    expect(page3.textContent).toContain("೭. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪವಿತ್ರ ಪರಿಹಾರಗಳು & ದಾನ");
    expect(page3.textContent).toContain("ವಿಶೇಷ ಸೇವೆ");
    expect(page3.textContent).toContain("ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ");
    expect(page3.textContent).toContain("ರತ್ನ / ಲೋಹ");
    expect(page3.textContent).toContain("ದಾನ & ಗೋಸೇವೆ");

    // Section 8: Chief Priest Shreeram Pandit Blessing & Seal
    expect(page3.textContent).toContain("೮. ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ");
    expect(page3.textContent).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(page3.textContent).toContain("+91 99723 39362");
    expect(page3.textContent).toContain("॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥");
    expect(page3.textContent).toContain("ಅಧಿಕೃತ ಮುದ್ರೆ");

    // Page 3 Footer
    expect(page3.textContent).toContain("ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)");
  });

  it("5. Supports 5-language localization with authentic 3-page footers in all languages", () => {
    const diagnosis = generateKundliRemedyReport(mockKundli, devoteeInput);

    const langFooters: Record<string, { p1: string; p2: string; p3: string }> = {
      kn: { p1: "ಪುಟ ೧/೩ (ಮುಂದುವರಿದಿದೆ...)", p2: "ಪುಟ ೨/೩ (ಮುಂದುವರಿದಿದೆ...)", p3: "ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)" },
      en: { p1: "Page 1 of 3 (Continued...)", p2: "Page 2 of 3 (Continued...)", p3: "Page 3 of 3 (Complete)" },
      hi: { p1: "पृष्ठ १/३ (आगे जारी...)", p2: "पृष्ठ २/३ (आगे जारी...)", p3: "पृष्ठ ३/३ (संपूर्ण)" },
      te: { p1: "పేజీ 1/3 (కొనసాగింపు...)", p2: "పేజీ 2/3 (కొనసాగింపు...)", p3: "పేజీ 3/3 (సంపూర్ణం)" },
      ta: { p1: "பக்கம் 1/3 (தொடர்கிறது...)", p2: "பக்கம் 2/3 (தொடர்கிறது...)", p3: "பக்கம் 3/3 (முழுமை)" }
    };

    for (const [lCode, expected] of Object.entries(langFooters)) {
      const { container } = render(<KundliRemedyPdfTemplate diagnosis={diagnosis} lang={lCode} />);
      const pages = container.querySelectorAll(".pdf-page");
      expect(pages.length).toBe(3);

      expect((pages[0] as HTMLElement).textContent).toContain(expected.p1);
      expect((pages[1] as HTMLElement).textContent).toContain(expected.p2);
      expect((pages[2] as HTMLElement).textContent).toContain(expected.p3);
    }
  });
});
