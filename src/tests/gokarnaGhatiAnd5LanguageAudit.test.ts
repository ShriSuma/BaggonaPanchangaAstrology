import { describe, expect, it } from "vitest";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { localTranslations, getLocalAstrologyTerm } from "../utils/localTranslations";
import { formatChartHouseNumber } from "../core/localeNumbers";

describe("Gokarna 581326 Traditional Ghati and 5-Language Audit", () => {
  const LANGUAGES = ["kn", "hi", "te", "ta", "en"] as const;

  it("calculates exact Diva Ghati and Nishe Ghati for Gokarna (581326)", () => {
    // Birth in Gokarna with pincode 581326
    const res = calculateTraditionalBaggona("1993-05-31", "09:25", 0, 0, "lahiri", "581326");

    expect(res).toBeDefined();
    // Verify Diva Ghati + Nishe Ghati equals 60 Ghatis (3600 Vighatis)
    const dayVighatis = res.divaGhati.ghati * 60 + res.divaGhati.vighati;
    expect(res.nisheGhati).toBeDefined();
    const nightVighatis = res.nisheGhati!.ghati * 60 + res.nisheGhati!.vighati;
    expect(dayVighatis + nightVighatis).toBe(3600);

    // Diva Ghati should be ~32 Ghatis in late May
    expect(res.divaGhati.ghati).toBe(32);
    expect(res.divaGhati.vighati).toBe(3);
    expect(res.nisheGhati!.ghati).toBe(27);
    expect(res.nisheGhati!.vighati).toBe(57);

    // Suryodayadi Ishta Ghati (Birth 09:25 AM, Sunrise 06:07 AM = 3h 18m = 198 mins / 24 mins = 8 Ghatis 15 Vighatis)
    expect(res.suryodhayadgata.ghati).toBe(8);
    expect(res.suryodhayadgata.vighati).toBe(14);

    // Parama Ghati, Ashaya Ghati, Gata Ghati
    expect(res.paramaGhati.ghati).toBeGreaterThan(50);
    expect(res.ashayaGhati.ghati).toBeGreaterThan(0);
    expect(res.ghatadina.ghati).toBeGreaterThan(0);
    // Gata + Ashaya should equal Parama Ghati (+/- 1 vighati due to rounding)
    const sumNakVighati = (res.ghatadina.ghati + res.ashayaGhati.ghati) * 60 + (res.ghatadina.vighati + res.ashayaGhati.vighati);
    const paramaVighati = res.paramaGhati.ghati * 60 + res.paramaGhati.vighati;
    expect(Math.abs(sumNakVighati - paramaVighati)).toBeLessThanOrEqual(1);
  });

  it("handles night birth for Gokarna with accurate Suryodayadi Ishta Ghati", () => {
    // Vidyashree 24-Oct-1997 20:15 (08:15 PM)
    const res = calculateTraditionalBaggona("1997-10-24", "20:15", 14.5479, 74.3188, "lahiri", "581326");

    expect(res.divaGhati.ghati).toBe(29);
    expect(res.divaGhati.vighati).toBe(0);
    expect(res.nisheGhati!.ghati).toBe(31);
    expect(res.nisheGhati!.vighati).toBe(0);

    // 08:15 PM is 13h 46m after sunrise (06:29 AM) = 826 minutes / 24 = 34.416 Ghatis = 34 Ghatis 22 Vighatis
    expect(res.suryodhayadgata.ghati).toBe(34);
    expect(res.suryodhayadgata.vighati).toBe(22);
  });

  it("provides pure 5-language localization for all Panchanga items without English leakage in Indic languages", () => {
    const res = calculateTraditionalBaggona("1993-05-31", "09:25", 14.5479, 74.3188, "lahiri", "581326");

    expect(res.samvatsara5L).toBeDefined();
    expect(res.samvatsara5L!.kn).toBe("ಶ್ರೀಮುಖ");
    expect(res.samvatsara5L!.hi).toBe("श्रीमुख");
    expect(res.samvatsara5L!.te).toBe("శ్రీముఖ");
    expect(res.samvatsara5L!.ta).toBe("ஸ்ரீமுக");
    expect(res.samvatsara5L!.en).toBe("Shrimukha");

    expect(res.masa5L).toBeDefined();
    expect(res.masa5L!.kn).toBe("ಜ್ಯೇಷ್ಠ");
    expect(res.masa5L!.hi).toBe("ज्येष्ठ");
    expect(res.masa5L!.te).toBe("జ్యేష్ఠ");
    expect(res.masa5L!.ta).toBe("ஜ்யேஷ்ட");
    expect(res.masa5L!.en).toBe("Jyeshtha");

    expect(res.paksha5L).toBeDefined();
    expect(res.paksha5L!.kn).toBe("ಶುಕ್ಲ");
    expect(res.paksha5L!.hi).toBe("शुक्ल");
    expect(res.paksha5L!.te).toBe("శుక్ల");
    expect(res.paksha5L!.ta).toBe("சுக்ல");

    expect(res.weekday5L).toBeDefined();
    expect(res.weekday5L!.kn).toBe("ಚಂದ್ರ ವಾಸರೇ");
    expect(res.weekday5L!.hi).toBe("चन्द्र वासरे");
    expect(res.weekday5L!.te).toBe("చంద్ర వాసరే");
    expect(res.weekday5L!.ta).toBe("சந்திர வாசரே");

    expect(res.moonNakshatra5L).toBeDefined();
    expect(res.moonNakshatra5L!.kn).toBe("ಹಸ್ತಾ");
    expect(res.moonNakshatra5L!.hi).toBe("हस्त");
    expect(res.moonNakshatra5L!.te).toBe("హస్త");
    expect(res.moonNakshatra5L!.ta).toBe("அஸ்தம்");

    expect(res.yoga5L).toBeDefined();
    expect(res.yoga5L!.kn).toBe("ಸಿದ್ಧಿ");
    expect(res.yoga5L!.hi).toBe("सिद्धि");
    expect(res.yoga5L!.te).toBe("సిద్ధి");
    expect(res.yoga5L!.ta).toBe("சித்தி");

    expect(res.karana5L).toBeDefined();
    expect(res.karana5L!.kn).toBe("ವಣಿಜ");
    expect(res.karana5L!.hi).toBe("वणिज");
    expect(res.karana5L!.te).toBe("వణిజ");
    expect(res.karana5L!.ta).toBe("வணிசை");

    expect(res.sankrantiSign5L).toBeDefined();
    expect(res.sankrantiSign5L!.kn).toBe("ವೃಷಭ");
    expect(res.sankrantiSign5L!.hi).toBe("वृषभ");
    expect(res.sankrantiSign5L!.te).toBe("వృషభ");
    expect(res.sankrantiSign5L!.ta).toBe("ரிஷபம்");
  });

  it("verifies all essential localTranslations keys exist for all 5 languages", () => {
    const essentialKeys = [
      "Sunrise",
      "Sunset",
      "Ghati",
      "Pale",
      "Hour",
      "Min",
      "Ravi Nakshatra",
      "Chandra Nakshatra",
      "Shloka 1",
      "Shloka 2",
      "Baggona Patrika Title",
      "Lagna",
      "Maandi",
      "Om",
      "Retrograde",
      "Diva Ghati",
      "Nishe Ghati",
      "Parama Ghati",
      "Aishya Ghati",
      "Gata Ghati",
      "Suryodayadi",
      "Visha Ghati",
      "Amruta Ghati",
      "Gotra",
      "Rashi",
      "Pada",
      "Shaka Varsha",
      "Samvatsara",
      "Masa",
      "Paksha",
      "Tithi",
      "Vasara",
      "Yoga",
      "Karana",
      "Sankranti",
      "Janma Kala",
      "Dasha Bhukti",
      "Dina",
      "Gata Dina",
      "Yoni",
      "Gana",
      "Nadi",
      "Panchanga Kartaru"
    ];

    for (const lang of LANGUAGES) {
      for (const key of essentialKeys) {
        const val = getLocalAstrologyTerm(key, lang);
        expect(val, `Missing translation for [${key}] in language [${lang}]`).toBeDefined();
        expect(val.length, `Empty translation for [${key}] in language [${lang}]`).toBeGreaterThan(0);
        // Indic languages should not have untranslated key fallback
        if (lang !== "en") {
          expect(val).not.toBe(key);
        }
      }
    }
  });

  it("formats chart house numbers accurately in all 5 languages", () => {
    expect(formatChartHouseNumber(1, "kn")).toBe("೧");
    expect(formatChartHouseNumber(1, "hi")).toBe("१");
    expect(formatChartHouseNumber(1, "te")).toBe("౧");
    expect(formatChartHouseNumber(1, "ta")).toBe("௧");
    expect(formatChartHouseNumber(1, "en")).toBe("1");
  });

  it("dynamically computes location coordinates for custom Indian pincodes (e.g. Bengaluru 560001, Vijayawada 520001)", () => {
    const resBlr = calculateTraditionalBaggona("1993-05-31", "09:25", 0, 0, "lahiri", "560001");
    expect(resBlr).toBeDefined();
    // Bengaluru sunrise is 05:56 AM, 11 minutes earlier than Gokarna 06:07 AM
    expect(resBlr.sunrise).toBe("05:56");

    const resVjw = calculateTraditionalBaggona("1993-05-31", "09:25", 0, 0, "lahiri", "520001");
    expect(resVjw).toBeDefined();
    // Vijayawada sunrise is 05:38 AM
    expect(resVjw.sunrise).toBe("05:38");
  });
});
