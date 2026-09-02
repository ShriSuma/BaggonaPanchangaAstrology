import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import {
  executeMaranottaraCalculation,
  getTithiFromUtc,
  computeDayAparahnaWindow,
  TITHIS_5LANG,
  NAKSHATRAS_5LANG,
  PAKSHAS_5LANG
} from "../features/maranottara/maranottaraEngine";
import { T_MARANOTTARA } from "../features/maranottara/maranottaraLocale";
import { generateMaranottaraICalendar } from "../features/maranottara/maranottaraIcsGenerator";
import { MaranottaraPdfTemplate } from "../components/maranottara/MaranottaraPdfTemplate";

describe("Maranottara Shraddha Masika & Pitru Samskara Dynamic Baggona Audit", () => {
  const sampleInput = {
    personName: "ಶ್ರೀ ರಾಮಕೃಷ್ಣ ಭಟ್",
    demiseDate: "2026-03-20",
    demiseTime: "10:30",
    location: "Gokarna, Karnataka",
    yearsCount: 1 as const,
    lat: 14.5479,
    lng: 74.3188
  };

  it("locale dictionary has complete 5-language coverage for all UI labels", () => {
    const langs = ["kn", "en", "hi", "te", "ta"] as const;

    for (const [key, trans] of Object.entries(T_MARANOTTARA)) {
      for (const l of langs) {
        expect(trans[l], `Missing translation for [${key}][${l}]`).toBeDefined();
        expect(trans[l].trim().length, `Empty string for [${key}][${l}]`).toBeGreaterThan(0);
      }
    }
  });

  it("calculates authentic demise Tithi, Nakshatra, and Paksha without hardcoded strings", () => {
    const res = executeMaranottaraCalculation(sampleInput);

    expect(res.personName).toBe("ಶ್ರೀ ರಾಮಕೃಷ್ಣ ಭಟ್");
    expect(res.demiseDate).toBe("2026-03-20");

    // Check 5 languages for Demise Tithi
    expect(res.demiseTithi.kn).toBeDefined();
    expect(res.demiseTithi.en).toBeDefined();
    expect(res.demiseTithi.hi).toBeDefined();
    expect(res.demiseTithi.te).toBeDefined();
    expect(res.demiseTithi.ta).toBeDefined();

    // Verify Hindi, Telugu, and Tamil are not blindly copying Kannada script
    expect(res.demiseTithi.hi).not.toBe(res.demiseTithi.kn);
    expect(res.demiseTithi.te).not.toBe(res.demiseTithi.kn);
    expect(res.demiseTithi.ta).not.toBe(res.demiseTithi.kn);

    // Check 5 languages for Demise Nakshatra
    expect(res.demiseNakshatra.kn).toBeDefined();
    expect(res.demiseNakshatra.en).toBeDefined();
    expect(res.demiseNakshatra.hi).toBeDefined();
    expect(res.demiseNakshatra.te).toBeDefined();
    expect(res.demiseNakshatra.ta).toBeDefined();

    // Check 5 languages for Paksha
    expect(res.demisePaksha.kn).toContain("ಪಕ್ಷ");
    expect(res.demisePaksha.en).toContain("Paksha");
    expect(res.demisePaksha.hi).toContain("पक्ष");
    expect(res.demisePaksha.te).toContain("పక్షం");
    expect(res.demisePaksha.ta).toContain("பக்ஷம்");
  });

  it("calculates accurate Aparahna Kaala window for daytime Shraddha determination", () => {
    const aparahna = computeDayAparahnaWindow("2026-03-20", 14.5479, 74.3188);

    expect(aparahna.windowLabel).toContain("IST");
    expect(aparahna.aparahnaStartUtc.getTime()).toBeLessThan(aparahna.aparahnaEndUtc.getTime());
    expect(aparahna.aparahnaMidUtc.getTime()).toBeGreaterThan(aparahna.aparahnaStartUtc.getTime());
    expect(aparahna.aparahnaMidUtc.getTime()).toBeLessThan(aparahna.aparahnaEndUtc.getTime());
  });

  it("generates exactly 12 months for 1-year duration with Month 12 as Varshika Shraddha", () => {
    const res = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 1 });

    expect(res.masikaSchedule).toHaveLength(12);

    // Month 1 should be Prathama Masika
    expect(res.masikaSchedule[0].masikaName.kn).toContain("೧ನೇ");
    expect(res.masikaSchedule[0].isVarshikaShraddha).toBe(false);

    // Month 12 must be Varshika Shraddha
    expect(res.masikaSchedule[11].monthIndex).toBe(12);
    expect(res.masikaSchedule[11].isVarshikaShraddha).toBe(true);
    expect(res.masikaSchedule[11].masikaName.kn).toContain("ವಾರ್ಷಿಕ");
    expect(res.masikaSchedule[11].masikaName.en).toContain("Annual Varshika");

    // All months must have populated Aparahna windows
    res.masikaSchedule.forEach((item) => {
      expect(item.aparahnaWindow).toBeDefined();
      expect(item.aparahnaWindow).toContain("IST");
      expect(item.gregorianDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("generates exactly 60 months for 5-year duration with all annual Varshika markers", () => {
    const res = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 5 });

    expect(res.masikaSchedule).toHaveLength(60);

    const varshikaMonths = res.masikaSchedule.filter((m) => m.isVarshikaShraddha);
    expect(varshikaMonths).toHaveLength(5);
    expect(varshikaMonths.map((m) => m.monthIndex)).toEqual([12, 24, 36, 48, 60]);

    // Check multilingual masikaName for Month 60
    const m60 = res.masikaSchedule[59];
    expect(m60.monthIndex).toBe(60);
    expect(m60.isVarshikaShraddha).toBe(true);
    expect(m60.masikaName.kn).toContain("೫ನೇ ವರ್ಷದ ವಾರ್ಷಿಕ");
    expect(m60.masikaName.en).toContain("Year 5 Annual Varshika");
    expect(m60.masikaName.hi).toContain("5वें वर्ष का वार्षिक");
    expect(m60.masikaName.te).toContain("5వ సంవత్సర వార్షిక");
    expect(m60.masikaName.ta).toContain("5ம் ஆண்டு வருடாந்திர");
  }, 30000);

  it("provides complete 13-day Antyesti roadmap with 5 languages and no gaps", () => {
    const res = executeMaranottaraCalculation(sampleInput);

    expect(res.antyestiRoadmap).toHaveLength(13);

    res.antyestiRoadmap.forEach((day, idx) => {
      expect(day.dayNumber).toBe(idx + 1);
      expect(day.dayTitle.kn).toBeDefined();
      expect(day.dayTitle.en).toBeDefined();
      expect(day.dayTitle.hi).toBeDefined();
      expect(day.dayTitle.te).toBeDefined();
      expect(day.dayTitle.ta).toBeDefined();

      expect(day.rituals.kn).toBeDefined();
      expect(day.rituals.en).toBeDefined();
      expect(day.rituals.hi).toBeDefined();
      expect(day.rituals.te).toBeDefined();
      expect(day.rituals.ta).toBeDefined();
    });

    // Day 10 is Kshoura & Asoucha end
    expect(res.antyestiRoadmap[9].dayTitle.kn).toContain("ದಶಮ ಪಿಂಡ");
    // Day 12 is Sapindikarana
    expect(res.antyestiRoadmap[11].dayTitle.kn).toContain("ಸಪಿಂಡೀಕರಣ");
    // Day 13 is Shubha Sweekara
    expect(res.antyestiRoadmap[12].dayTitle.kn).toContain("ಶುಭ ಸ್ವೀಕಾರ");
  });

  it("identifies Demise Doshas, Panchaka and provides Gokarna Shanti remedies", () => {
    const res = executeMaranottaraCalculation(sampleInput);

    expect(res.doshaAnalysis).toBeDefined();
    expect(res.doshaAnalysis.doshaSummary.kn.length).toBeGreaterThan(10);
    expect(res.doshaAnalysis.doshaSummary.en.length).toBeGreaterThan(10);
    expect(res.doshaAnalysis.doshaSummary.hi.length).toBeGreaterThan(10);
    expect(res.doshaAnalysis.doshaSummary.te.length).toBeGreaterThan(10);
    expect(res.doshaAnalysis.doshaSummary.ta.length).toBeGreaterThan(10);

    expect(res.doshaAnalysis.recommendedPoojas.length).toBeGreaterThan(0);
    res.doshaAnalysis.recommendedPoojas.forEach((p) => {
      expect(p.title.kn).toBeDefined();
      expect(p.title.en).toBeDefined();
      expect(p.title.hi).toBeDefined();
      expect(p.title.te).toBeDefined();
      expect(p.title.ta).toBeDefined();
    });
  });

  it("generates compliant .ICS iCalendar with Priest Shreeram Pandit and Aparahna Kaala", () => {
    const res = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 1 });
    const icsKn = generateMaranottaraICalendar(res, "kn");

    // Standard RFC 5545 Headers
    expect(icsKn).toContain("BEGIN:VCALENDAR");
    expect(icsKn).toContain("VERSION:2.0");
    expect(icsKn).toContain("PRODID:-//Baggona Panchanga Astrology//NONSGML Pitru Samskara v3.0//EN");
    expect(icsKn).toContain("X-WR-TIMEZONE:Asia/Kolkata");
    expect(icsKn).toContain("END:VCALENDAR");

    // Contains Priest Sri Shreeram Pandit and phone number
    expect(icsKn).toContain("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
    expect(icsKn).toContain("+91 99723 39362");

    // Contains 13 Antyesti Day events
    expect(icsKn).toContain("UID:antyesti-d1-");
    expect(icsKn).toContain("UID:antyesti-d13-");

    // Contains all 12 Masika events
    expect(icsKn).toContain("UID:masika-m1-");
    expect(icsKn).toContain("UID:masika-m12-");

    // Contains 24-hour advance alarm
    expect(icsKn).toContain("BEGIN:VALARM");
    expect(icsKn).toContain("TRIGGER:-P1D");

    // Test English generation as well
    const icsEn = generateMaranottaraICalendar(res, "en");
    expect(icsEn).toContain("Baggona Panchanga — Shraddha & Pitru Samskara");
    expect(icsEn).toContain("+91 99723 39362");
  });

  it("renders MaranottaraPdfTemplate with zero month truncation for 1, 3, and 5-year calculations", () => {
    // 1 Year test (2 pages)
    const res1 = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 1 });
    const { container: c1 } = render(<MaranottaraPdfTemplate result={res1} lang="kn" />);
    const pages1 = c1.querySelectorAll(".pdf-page-a4");
    expect(pages1.length).toBe(2);

    // 3 Year test (3 pages, up to 36 months)
    const res3 = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 3 });
    const { container: c3 } = render(<MaranottaraPdfTemplate result={res3} lang="kn" />);
    const pages3 = c3.querySelectorAll(".pdf-page-a4");
    expect(pages3.length).toBe(3);

    // 5 Year test (4 pages, up to 60 months)
    const res5 = executeMaranottaraCalculation({ ...sampleInput, yearsCount: 5 });
    const { container: c5 } = render(<MaranottaraPdfTemplate result={res5} lang="kn" />);
    const pages5 = c5.querySelectorAll(".pdf-page-a4");
    expect(pages5.length).toBe(4);
  }, 60000);
});
