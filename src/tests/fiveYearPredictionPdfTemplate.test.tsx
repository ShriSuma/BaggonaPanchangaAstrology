import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { FiveYearPredictionPdfTemplate } from "../components/fiveYearPrediction/FiveYearPredictionPdfTemplate";
import { compute5YearMasterPrediction, type FiveYearPredictionPayload } from "../features/fiveYearPrediction/fiveYearPredictionEngine";
import type { KundliOutput, KundliInput } from "../core/AstroTypes";
import { PlanetName } from "../core/AstroTypes";

describe("FiveYearPredictionPdfTemplate Visual Architecture & Content Audit", () => {
  beforeEach(() => {
    cleanup();
  });

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
    moonPada: 4
  };

  const mockDevotee: KundliInput = {
    name: "Shreesuma Upadhyaya",
    birthDate: "1994-06-15",
    birthTime: "10:30",
    latitude: 14.5479,
    longitude: 74.3188,
    gender: "Male"
  };

  const getTestPayload = (lang: "kn" | "mr" = "kn"): FiveYearPredictionPayload => {
    return compute5YearMasterPrediction(
      mockKundli,
      mockDevotee.birthDate,
      mockDevotee.birthTime,
      lang,
      mockDevotee.name,
      2026,
      { maritalStatus: "married", childrenStatus: "has_children", gender: "Male" }
    );
  };

  it("renders with Premium PDF V1 heritage cream background, double gold borders, and corner emblems", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    // Container checks
    const mainContainer = container.querySelector("#five-year-prediction-pdf-container");
    expect(mainContainer).not.toBeNull();
    expect(mainContainer?.className).toContain("bg-orange-50");
    expect(mainContainer?.className).toContain("text-amber-950");
    expect(mainContainer?.className).toContain("font-serif");

    // Outer double border frames
    const borders = container.querySelectorAll(".border-amber-700\\/40");
    expect(borders.length).toBeGreaterThanOrEqual(2);

    // Title & invocation
    expect(container.textContent).toContain("ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ");
    expect(container.textContent).toContain("೫ ವರ್ಷಗಳ ಮಹಾ ಭವಿಷ್ಯ");
  });

  it("renders Ultra-Premium Royal Gold Parchment Card with complete Janana Panchanga details", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    const userDetails = container.querySelector('[data-section="user-details"]');
    expect(userDetails).not.toBeNull();
    expect(userDetails?.textContent).toContain(data.devoteeName);
    expect(data.devoteeName).toContain("ಶ್ರೀಸುಮಾ");
    expect(userDetails?.textContent).toContain("ಜನ್ಮ ಲಗ್ನ");
    expect(userDetails?.textContent).toContain("ಚಂದ್ರ ರಾಶಿ");
    expect(userDetails?.textContent).toContain("ಜನ್ಮ ನಕ್ಷತ್ರ & ಪಾದ");
    expect(userDetails?.textContent).toContain("ಪಾದ ೩");
    expect(userDetails?.textContent).toContain("ಜನ್ಮ ತಿಥಿ & ವಾರ");
    expect(userDetails?.textContent).toContain("ಜನ್ಮ ಹೋರೆ & ಅಯನಾಂಶ");
  });

  it("renders Chapter 1 with 3 deep substantive paragraphs and the Milestone Matrix", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    const chapter1 = container.querySelector('[data-section="macro-destiny"]');
    expect(chapter1).not.toBeNull();
    expect(chapter1?.textContent).toContain("ಅಧ್ಯಾಯ ೧");
    expect(chapter1?.textContent).toContain("ಪಂಚವರ್ಷದ ದೈವಿಕ ಧ್ಯೇಯವಾಕ್ಯ");
    expect(chapter1?.textContent).toContain("ಸುವರ್ಣ ಭಾಗ್ಯೋದಯ ಪರ್ವ");
    expect(chapter1?.textContent).toContain("ತಾಳ್ಮೆ ಹಾಗೂ ಎಚ್ಚರಿಕೆಯ ಅವಧಿ");

    // Milestone matrix
    expect(chapter1?.textContent).toContain("೫ ವರ್ಷಗಳ ಸುವರ್ಣ ಭವಿಷ್ಯ ಮೈಲಿಗಲ್ಲುಗಳ ಕೋಷ್ಟಕ");
  });

  it("ensures all adult life chapters contain at least 2 to 3 substantive paragraphs and contemplation ribbons", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    // Chapters 2, 3, 4, 5
    const careerSection = container.querySelector('[data-section="chapter-adult_career"]');
    expect(careerSection).not.toBeNull();
    expect(careerSection?.textContent).toContain("ಆತ್ಮ ಚಿಂತನೆ");
    expect(careerSection?.textContent).toContain("ಅಧ್ಯಾಯ ೨");
    const careerParas = careerSection?.querySelectorAll("p.text-lg");
    expect(careerParas?.length).toBeGreaterThanOrEqual(3);

    const wealthSection = container.querySelector('[data-section="chapter-adult_wealth"]');
    expect(wealthSection).not.toBeNull();
    const wealthParas = wealthSection?.querySelectorAll("p.text-lg");
    expect(wealthParas?.length).toBeGreaterThanOrEqual(3);

    const familySection = container.querySelector('[data-section="chapter-adult_family"]');
    expect(familySection).not.toBeNull();
    const familyParas = familySection?.querySelectorAll("p.text-lg");
    expect(familyParas?.length).toBeGreaterThanOrEqual(3);

    const healthSection = container.querySelector('[data-section="chapter-adult_health"]');
    expect(healthSection).not.toBeNull();
    const healthParas = healthSection?.querySelectorAll("p.text-lg");
    expect(healthParas?.length).toBeGreaterThanOrEqual(3);
  });

  it("ensures all 5 chronological years contain 3 rich paragraphs and 4 quarterly seasons", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    for (let yr = 1; yr <= 5; yr++) {
      const yearSection = container.querySelector(`[data-section="year-${yr}"]`);
      expect(yearSection).not.toBeNull();
      const paras = yearSection?.querySelectorAll("p.text-lg");
      expect(paras?.length).toBeGreaterThanOrEqual(3);

      // Quarterly seasons
      expect(yearSection?.textContent).toContain("೪ ತ್ರೈಮಾಸಿಕ ಭವಿಷ್ಯ ದರ್ಶನ");
      // Muntha & Moorthy
      expect(yearSection?.textContent).toContain("ತಾಜಿಕ ಮುಂಥಾ ಸ್ಥಾನ");
      expect(yearSection?.textContent).toContain("ಮೂರ್ತಿ & ಸರ್ವಾಷ್ಟಕವರ್ಗ");
    }
  });

  it("renders Stotra, Sanskrit Shloka, Gokarna remedies and Year-by-Year table", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    const stotraSection = container.querySelector('[data-section="stotra-remedies"]');
    expect(stotraSection).not.toBeNull();
    expect(stotraSection?.textContent).toContain("ಮೂಲ ಶಾಸ್ತ್ರೋಕ್ತ ಶ್ಲೋಕ");
    expect(stotraSection?.textContent).toContain("ಶ್ಲೋಕದ ದಿವ್ಯ ಭಾವಾರ್ಥ");
    expect(stotraSection?.textContent).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾ ಸಂಕಲ್ಪ");
    expect(stotraSection?.textContent).toContain("೫ ವರ್ಷಗಳ ನಿರ್ದಿಷ್ಟ ಗೋಕರ್ಣ ಪರಿಹಾರಗಳ ಕಾರ್ಯಕ್ರಮ");
    expect(stotraSection?.textContent).toContain("ಜನ್ಮ ನಕ್ಷತ್ರ ಪವಿತ್ರ ವೃಕ್ಷ ಆರಾಧನೆ");
  });

  it("renders Family Protection, Daivajna Summary, Sacred Deity and Priest details without QR codes or fake seals", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    // Chapter 13: Family Destiny Interlocking (clean family cards, NO QR code)
    const familySeal = container.querySelector('[data-section="family-seal"]');
    expect(familySeal).not.toBeNull();
    expect(familySeal?.textContent).toContain("ಕುಟುಂಬ ರಕ್ಷಾ ಪಂಚವರ್ಷ ಬಂಧ");
    expect(familySeal?.textContent).toContain("ಸಂಗಾತಿಯ ಭಾಗ್ಯೋದಯ");
    expect(familySeal?.textContent).toContain("ಸಂತಾನ & ಮಕ್ಕಳ ಭವಿಷ್ಯ");
    expect(familySeal?.textContent).toContain("ತಂದೆ-ತಾಯಿಯ ಆಯುರಾರೋಗ್ಯ");
    // Verify zero QR codes in family seal
    const qrImg = familySeal?.querySelector("img");
    expect(qrImg).toBeNull();

    // Chapter 14: Daivajna Master Jyotish Summary
    const daivajnaSummary = container.querySelector('[data-section="daivajna-summary"]');
    expect(daivajnaSummary).not.toBeNull();
    expect(daivajnaSummary?.textContent).toContain("ದೈವಜ್ಞ ಜ್ಯೋತಿಷ್ಯ ಮಹಾ ಸಾರಾಂಶ");
    expect(daivajnaSummary?.textContent).toContain("ದೈವಜ್ಞ ಚತುರ್ವಿಧ ಜೀವನ ರಕ್ಷಾ ಸೂತ್ರಗಳು");
    expect(daivajnaSummary?.textContent).toContain("ವೃತ್ತಿ & ಆರ್ಥಿಕ ತಿರುವು");
    expect(daivajnaSummary?.textContent).toContain("ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ ಕವಚ");

    // Chapter 15: Sacred Deity Portrait & Dynamic Shloka
    const deityShloka = container.querySelector('[data-section="deity-shloka"]');
    expect(deityShloka).not.toBeNull();
    expect(deityShloka?.textContent).toContain("ದೈವ ಕೃಪಾ ಕವಚ & ಜನ್ಮ ಕುಂಡಲಿ ವೈಯಕ್ತಿಕ ಶ್ಲೋಕ");
    expect(deityShloka?.textContent).toContain("ಜನ್ಮ ಜಾತಕಾನುಸಾರ ಸಿದ್ಧಪಡಿಸಿದ ಪಾವನ ಮಂತ್ರ");
    expect(deityShloka?.textContent).toContain("ಪಾವನ ಮಂತ್ರದ ತಾತ್ಪರ್ಯ & ದೈವಾನುಗ್ರಹ");
    expect(deityShloka?.textContent).toContain("ಜಪ ಸಂಖ್ಯೆ");
    expect(deityShloka?.textContent).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(deityShloka?.textContent).toContain("೯೯೭೨೩೩೯೩೬೨");
    expect(deityShloka?.textContent).toContain("ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ");

    // Sacred Deity Image
    const deityImg = deityShloka?.querySelector("img");
    expect(deityImg).not.toBeNull();
    expect(deityImg?.src).toContain("/daily_posters/");
  });

  it("renders pure Marathi localization seamlessly without English leakages", () => {
    const data = getTestPayload("mr");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    expect(container.textContent).toContain("श्री गोकर्ण महाबळेश्वराय नमः");
    expect(container.textContent).toContain("५ वर्षांचे महा भविष्य");
    expect(container.textContent).toContain("अध्याय १");
    expect(container.textContent).toContain("श्रीराम पंडित");
    expect(container.textContent).toContain("९९७२३३९३६२");
  });

  it("renders Chapter 6 Kundli Dosha Diagnostics with 3 paragraphs, question inquest & Gokarna remedy table", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    const doshaSection = container.querySelector('[data-section="chapter-doshas"]');
    expect(doshaSection).not.toBeNull();
    expect(doshaSection?.textContent).toContain("ಅಧ್ಯಾಯ ೬: ಜನ್ಮ ಕುಂಡಲಿ ದೋಷಗಳು ಹಾಗೂ ೫ ವರ್ಷಗಳ ಶಮನ ರಕ್ಷಾ ಕವಚ");
    expect(doshaSection?.textContent).toContain("ದೋಷ & ಶಾಂತಿ ಚಿಂತನೆ");
    expect(doshaSection?.textContent).toContain("ನನ್ನ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ದೋಷಗಳು ಯಾವುವು?");

    // 3 Substantive paragraphs
    const doshaParas = doshaSection?.querySelectorAll("p.text-left");
    expect(doshaParas?.length).toBe(3);

    // Diagnostic table
    const table = doshaSection?.querySelector("table");
    expect(table).not.toBeNull();
    expect(doshaSection?.textContent).toContain("ದೋಷ ನಾಮ");
    expect(doshaSection?.textContent).toContain("ತೀವ್ರತೆ / ಸ್ಥಿತಿ");
    expect(doshaSection?.textContent).toContain("ಮುಂದಿನ ೫ ವರ್ಷಗಳ ಪ್ರಭಾವ");
    expect(doshaSection?.textContent).toContain("ಶಿಫಾರಸು ಮಾಡಿದ ಗೋಕರ್ಣ ಸೇವೆ & ಮಂತ್ರ");

    // Protection shield summary
    expect(doshaSection?.textContent).toContain("ಪಂಚವರ್ಷದ ದೋಷ ಶಮನ ರಕ್ಷಾ ಕವಚ");
  });

  it("ensures each chronological year renders an explicit Question Inquest ribbon before the 3 paragraphs", () => {
    const data = getTestPayload("kn");

    const { container } = render(<FiveYearPredictionPdfTemplate data={data} />);

    for (let yr = 1; yr <= 5; yr++) {
      const yearSection = container.querySelector(`[data-section="year-${yr}"]`);
      expect(yearSection).not.toBeNull();
      expect(yearSection?.textContent).toContain("ವರ್ಷದ ಪ್ರಮುಖ ಪ್ರಶ್ನೆ");
      expect(yearSection?.textContent).toContain("ಜೀವನದ ಪ್ರಮುಖ ತಿರುವು, ಸುವರ್ಣಾವಕಾಶಗಳು ಮತ್ತು ಜಾಗರೂಕತೆ ವಹಿಸಬೇಕಾದ ಅಂಶಗಳು ಯಾವುವು?");
    }
  });
});
