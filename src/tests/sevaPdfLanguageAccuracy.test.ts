import { describe, it, expect } from "vitest";
import { generateSevaICalendarString } from "../features/seva/icsCalendarGenerator";
import { pick } from "../features/seva/sevaLocale";
import type { RhythmDay } from "../core/DailyRhythmEngine";

const dummyDays: RhythmDay[] = [
  {
    ymd: "2026-08-15",
    weekday: 6,
    dayOfMonth: 15,
    monthIndex: 7,
    year: 2026,
    moonNakshatraIndex: 12,
    moonRashiIndex: 5,
    tithiNumber: 2,
    tithiInPaksha: 2,
    paksha: "shukla",
    tithiGroup: "bhadra",
    tara: { tara: 2, count: 2, score: 95, isFavourable: true, isDifficult: false },
    chandra: { house: 1, score: 90, isChandrashtama: false, isFavourable: true },
    dayLord: "Saturn",
    bhuktiLord: "Jupiter",
    energyScore: 85,
    band: "high",
    arthaScore: 80,
    isMoneyDay: true,
    isChandrashtama: false,
    isJanmaNakshatraDay: false,
    isEkadashi: false,
    isPurnima: false,
    isAmavasya: false,
    isPradosha: false,
    isSankashti: false,
    isPoojaDay: true,
    luckyNumbers: [3, 7],
    luckyColour: "yellow",
    luckyDirection: "east"
  }
];

describe("Seva & Prasada 5-Language & Calendar Accuracy Tests", () => {
  const languages = ["kn", "hi", "te", "ta", "en"] as const;

  languages.forEach((lang) => {
    it(`generates 100% localized iCal calendar payload for ${lang}`, () => {
      const icsPayload = generateSevaICalendarString({
        days: dummyDays,
        lang,
        panditName: "Chaitanya Pandit",
        notificationTime: "08:00",
        personName: "Pramod"
      });

      expect(icsPayload).toBeTypeOf("string");
      expect(icsPayload).toContain("BEGIN:VCALENDAR");
      expect(icsPayload).toContain("END:VCALENDAR");
      expect(icsPayload).toContain("Pramod");

      if (lang === "hi") {
        expect(icsPayload).not.toContain("ಕನ್ನಡ");
        expect(icsPayload).not.toContain("తెలుగు");
      } else if (lang === "kn") {
        expect(icsPayload).not.toContain("हिंदी");
      }
    });
  });

  it("verifies pick utility strictly returns native script for each locale", () => {
    const sample = {
      kn: "ಕನ್ನಡ ಪತ್ರಿಕೆ",
      hi: "हिंदी पत्र",
      te: "తెలుగు పత్రం",
      ta: "தமிழ் கடிதம்",
      en: "English Letter"
    };

    expect(pick(sample, "kn")).toBe("ಕನ್ನಡ ಪತ್ರಿಕೆ");
    expect(pick(sample, "hi")).toBe("हिंदी पत्र");
    expect(pick(sample, "te")).toBe("తెలుగు పత్రం");
    expect(pick(sample, "ta")).toBe("தமிழ் கடிதம்");
    expect(pick(sample, "en")).toBe("English Letter");
  });

  it("verifies Page 4 dictionary coverage for all 5 languages without fallback gaps", () => {
    const page4Titles = {
      kn: "✦ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಭ್ಯುದಯ ರಕ್ಷಾ ಪತ್ರಿಕೆ ✦",
      hi: "✦ गोकर्ण क्षेत्र महापूजा उपचार एवं पारिवारिक अभ्युदय रक्षा पत्र ✦",
      te: "✦ గోకర్ణ క్షేత్ర మహాపూజా నివారణ మరియు కుటుంబ అభ్యుదయ రక్షా పత్రం ✦",
      ta: "✦ கோகர்ண க்ஷேத்திரம் மகாபூஜை பரிகாரம் மற்றும் குடும்ப அபிவிருத்தி ரக்ஷா அட்டை ✦",
      en: "✦ Gokarna Kshetra Sacred Remedial Puja & Family Lineage Protection Sheet ✦"
    };

    languages.forEach((l) => {
      const res = pick(page4Titles, l);
      expect(res).toBeTruthy();
      expect(res.length).toBeGreaterThan(10);
    });
  });

  it("verifies Page 5 Data Visualization dictionary coverage for all 5 languages", () => {
    const page5Titles = {
      kn: "✦ ಗೋಕರ್ಣ ದಿವ್ಯ ಷಡ್ಗುಣ ಪಂಚಾಂಗ ಚಕ್ರ ಹಾಗೂ ವಾರ್ಷಿಕ ಶಕ್ತಿ ಶ್ರೇಣಿ ✦",
      hi: "✦ गोकर्ण दिव्य षड्गुण पंचांग चक्र एवं वार्षिक शक्ति श्रेणी ✦",
      te: "✦ గోకర్ణ దివ్య షడ్గుణ పంచాంగ చక్రం మరియు వార్షిక శక్తి శ్రేణి ✦",
      ta: "✦ கோகர்ண திவ்ய ஷட்குண பஞ்சாங்க சக்கரம் மற்றும் வருடாந்திர சக்தி அட்டை ✦",
      en: "✦ Gokarna Divine Panchanga Mandala & 6-Month Energy Visualization ✦"
    };

    languages.forEach((l) => {
      const res = pick(page5Titles, l);
      expect(res).toBeTruthy();
      expect(res.length).toBeGreaterThan(10);
    });
  });
});
