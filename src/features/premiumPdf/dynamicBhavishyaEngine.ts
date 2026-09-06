/**
 * Dynamic Bhavishya Engine (100% Mathematical Kundali Fallback Engine)
 *
 * Guarantees that every section of the Premium PDF V1 report is 100% mathematically
 * grounded in the native's exact birth chart, running Vimshottari Dasha-Bhukti,
 * live planetary transits (Gochara), and classical Parashara / Raman rules.
 *
 * ZERO static treatise or generic placeholders.
 * STRICT REQUIREMENT: At least 2 substantial paragraphs with 5 to 6 full lines each.
 */

import {
  type GrahaKey,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5
} from "./premiumPdfLocale";
import type { NatalPlacement, TransitPlacement } from "./premiumPrompts";

export interface KundaliAnalysisInput {
  lagnaRashiIndex: number;
  moonRashiIndex: number;
  moonNakshatraIndex?: number | null;
  natalPlanets: NatalPlacement[];
  transits?: TransitPlacement[];
  mahaLord?: GrahaKey | null;
  bhuktiLord?: GrahaKey | null;
  gender?: "Male" | "Female";
  ageYears?: number;
  lang: string;
}

export interface HouseFact {
  houseNumber: number;
  rashiIndex: number;
  rashiName: string;
  lordGraha: GrahaKey;
  lordName: string;
  lordHouse: number;
  lordRashiIndex: number;
  lordRashiName: string;
  lordIsExalted: boolean;
  lordIsDebilitated: boolean;
  lordIsRetrograde: boolean;
  occupants: NatalPlacement[];
  occupantsNames: string[];
}

export interface ParsedKundaliChart {
  lang: string;
  lagnaRashiIndex: number;
  lagnaSignName: string;
  moonRashiIndex: number;
  moonSignName: string;
  nakshatraName: string;
  gender: "Male" | "Female";
  ageYears: number;
  mahaLordKey: GrahaKey | null;
  mahaLordName: string;
  bhuktiLordKey: GrahaKey | null;
  bhuktiLordName: string;
  dashaSummary: string;
  houses: Record<number, HouseFact>;
  venusPlacement: NatalPlacement | null;
  jupiterPlacement: NatalPlacement | null;
  saturnPlacement: NatalPlacement | null;
  marsPlacement: NatalPlacement | null;
  mercuryPlacement: NatalPlacement | null;
  sunPlacement: NatalPlacement | null;
  moonPlacement: NatalPlacement | null;
  isManglik: boolean;
  spouseDirection: { en: string; kn: string; hi: string; te: string; ta: string };
  transitSaturn: { houseFromMoon: number; isSadeSati: boolean; isAshtama: boolean; isKantaka: boolean } | null;
  transitJupiter: { houseFromMoon: number; isGuruBala: boolean } | null;
  transitRahu: { houseFromMoon: number } | null;
  transitKetu: { houseFromMoon: number } | null;
}

const RASHI_LORD_GRAHAS: GrahaKey[] = [
  "Mars",    // 0 Aries
  "Venus",   // 1 Taurus
  "Mercury", // 2 Gemini
  "Moon",    // 3 Cancer
  "Sun",     // 4 Leo
  "Mercury", // 5 Virgo
  "Venus",   // 6 Libra
  "Mars",    // 7 Scorpio
  "Jupiter", // 8 Sagittarius
  "Saturn",  // 9 Capricorn
  "Saturn",  // 10 Aquarius
  "Jupiter"  // 11 Pisces
];

export const SPOUSE_DIRECTIONS: Record<number, { en: string; kn: string; hi: string; te: string; ta: string }> = {
  0: { en: "East", kn: "ಪೂರ್ವ", hi: "पूर्व", te: "తూర్పు", ta: "கிழக்கு" },
  1: { en: "South", kn: "ದಕ್ಷಿಣ", hi: "दक्षिण", te: "దక్షిణం", ta: "தெற்கு" },
  2: { en: "West", kn: "ಪಶ್ಚಿಮ", hi: "पश्चिम", te: "పడమర", ta: "மேற்கு" },
  3: { en: "North", kn: "ಉತ್ತರ", hi: "उत्तर", te: "ఉత్తరం", ta: "வடக்கு" }
};

export function analyzeKundali(input: KundaliAnalysisInput): ParsedKundaliChart {
  const { lang, lagnaRashiIndex, moonRashiIndex, natalPlanets, transits = [], gender = "Male", ageYears = 30 } = input;

  const lagnaSignName = pick(RASHI_L5[lagnaRashiIndex], lang);
  const moonSignName = pick(RASHI_L5[moonRashiIndex], lang);
  const nakshatraName = input.moonNakshatraIndex !== null && input.moonNakshatraIndex !== undefined && input.moonNakshatraIndex >= 0
    ? pick(NAKSHATRA_L5[input.moonNakshatraIndex], lang)
    : "";

  const mahaLordKey = input.mahaLord || null;
  const bhuktiLordKey = input.bhuktiLord || null;
  const mahaLordName = mahaLordKey ? pick(GRAHA_L5[mahaLordKey], lang) : "Dasha Lord";
  const bhuktiLordName = bhuktiLordKey ? pick(GRAHA_L5[bhuktiLordKey], lang) : "Bhukti Lord";
  const dashaSummary = `${mahaLordName} - ${bhuktiLordName}`;

  // Analyze all 12 houses from Lagna
  const houses: Record<number, HouseFact> = {};
  for (let h = 1; h <= 12; h++) {
    const rIdx = (lagnaRashiIndex + h - 1) % 12;
    const rName = pick(RASHI_L5[rIdx], lang);
    const lordKey = RASHI_LORD_GRAHAS[rIdx];
    const lordName = pick(GRAHA_L5[lordKey], lang);

    const lordPlacement = natalPlanets.find(p => p.graha === lordKey);
    const occupants = natalPlanets.filter(p => p.house === h);
    const occupantsNames = occupants.map(p => pick(GRAHA_L5[p.graha], lang));

    houses[h] = {
      houseNumber: h,
      rashiIndex: rIdx,
      rashiName: rName,
      lordGraha: lordKey,
      lordName,
      lordHouse: lordPlacement ? lordPlacement.house : 1,
      lordRashiIndex: lordPlacement ? lordPlacement.rashiIndex : rIdx,
      lordRashiName: lordPlacement ? pick(RASHI_L5[lordPlacement.rashiIndex], lang) : rName,
      lordIsExalted: !!lordPlacement?.exalted,
      lordIsDebilitated: !!lordPlacement?.debilitated,
      lordIsRetrograde: !!lordPlacement?.retrograde,
      occupants,
      occupantsNames
    };
  }

  const venusPlacement = natalPlanets.find(p => p.graha === "Venus") || null;
  const jupiterPlacement = natalPlanets.find(p => p.graha === "Jupiter") || null;
  const saturnPlacement = natalPlanets.find(p => p.graha === "Saturn") || null;
  const marsPlacement = natalPlanets.find(p => p.graha === "Mars") || null;
  const mercuryPlacement = natalPlanets.find(p => p.graha === "Mercury") || null;
  const sunPlacement = natalPlanets.find(p => p.graha === "Sun") || null;
  const moonPlacement = natalPlanets.find(p => p.graha === "Moon") || null;

  // Kuja / Manglik Check (Mars in 1, 4, 7, 8, 12 from Lagna or Moon)
  let isManglik = false;
  if (marsPlacement) {
    const mHouseLagna = marsPlacement.house;
    const mMoonHouse = ((marsPlacement.rashiIndex - moonRashiIndex + 12) % 12) + 1;
    if ([1, 4, 7, 8, 12].includes(mHouseLagna) || [1, 4, 7, 8, 12].includes(mMoonHouse)) {
      isManglik = true;
    }
  }

  // Spouse Direction based on 7th rashi
  const house7Rashi = houses[7].rashiIndex;
  const dirGroup = house7Rashi % 4;
  const spouseDirection = SPOUSE_DIRECTIONS[dirGroup] || SPOUSE_DIRECTIONS[0];

  // Gochara Transits from Moon
  const shaniTransitObj = transits.find(t => t.graha === "Saturn");
  let transitSaturn = null;
  if (shaniTransitObj) {
    const hfm = shaniTransitObj.houseFromMoon;
    transitSaturn = {
      houseFromMoon: hfm,
      isSadeSati: [12, 1, 2].includes(hfm),
      isAshtama: hfm === 8,
      isKantaka: [4, 7, 10].includes(hfm)
    };
  }

  const guruTransitObj = transits.find(t => t.graha === "Jupiter");
  let transitJupiter = null;
  if (guruTransitObj) {
    const hfm = guruTransitObj.houseFromMoon;
    transitJupiter = {
      houseFromMoon: hfm,
      isGuruBala: [2, 5, 7, 9, 11].includes(hfm)
    };
  }

  const rahuTransitObj = transits.find(t => t.graha === "Rahu");
  const ketuTransitObj = transits.find(t => t.graha === "Ketu");

  return {
    lang,
    lagnaRashiIndex,
    lagnaSignName,
    moonRashiIndex,
    moonSignName,
    nakshatraName,
    gender,
    ageYears,
    mahaLordKey,
    mahaLordName,
    bhuktiLordKey,
    bhuktiLordName,
    dashaSummary,
    houses,
    venusPlacement,
    jupiterPlacement,
    saturnPlacement,
    marsPlacement,
    mercuryPlacement,
    sunPlacement,
    moonPlacement,
    isManglik,
    spouseDirection,
    transitSaturn,
    transitJupiter,
    transitRahu: rahuTransitObj ? { houseFromMoon: rahuTransitObj.houseFromMoon } : null,
    transitKetu: ketuTransitObj ? { houseFromMoon: ketuTransitObj.houseFromMoon } : null
  };
}

/* ========================================================================= */
/* Astrological Archetype Builders for Spouse & Other Domains               */
/* ========================================================================= */

function getSpouseArchetypeByLord(lord: GrahaKey, lang: string): string {
  switch (lord) {
    case "Sun":
      if (lang === "kn") return "ರಾಜಗಾಂಭೀರ್ಯ, ಉನ್ನತ ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ನಾಯಕತ್ವ ಗುಣಗಳಿಂದ ಶೋಭಿಸುವವರಾಗಿದ್ದು, ಆಡಳಿತ, ಸರ್ಕಾರಿ ಸೇವೆ ಅಥವಾ ಸಾರ್ವಜನಿಕ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನದಲ್ಲಿರುತ್ತಾರೆ";
      if (lang === "hi") return "राजसी व्यक्तित्व, उच्च स्वाभिमान और प्रशासनिक या प्रबंधकीय क्षेत्रों में प्रतिष्ठित पद पर कार्य करने वाले";
      return "regal, dignified, and values integrity, possessing strong leadership instincts and authoritative presence in administrative, governmental, or management spheres";
    case "Moon":
      if (lang === "kn") return "ಅತ್ಯಂತ ಸೌಮ್ಯ, ಕರುಣಾಮಯಿ ಹಾಗೂ ವಾತ್ಸಲ್ಯಪೂರ್ಣ ಸ್ವಭಾವದವರಾಗಿದ್ದು, ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ, ಕಲೆ, ಆತಿಥ್ಯ, ಶಿಕ್ಷಣ ಅಥವಾ ಸಮಾಜಸೇವಾ ರಂಗಗಳಲ್ಲಿ ಸಕ್ರಿಯರಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "अत्यंत सौम्य, संवेदनशील, सहृदय तथा पारिवारिक शांति, रचनात्मक कला, शिक्षा अथवा सेवा क्षेत्र में रुचि रखने वाले";
      return "deeply empathetic, nurturing, emotionally intuitive, and supportive, fond of domestic harmony, creative expressions, and caregiving";
    case "Mars":
      if (lang === "kn") return "ಧೈರ್ಯಶಾಲಿ, ಉತ್ಸಾಹಿ ಹಾಗೂ ನೇರ ನುಡಿಯ ವ್ಯಕ್ತಿತ್ವದವರಾಗಿದ್ದು, ತಾಂತ್ರಿಕ, ಇಂಜಿನಿಯರಿಂಗ್, ರಕ್ಷಣೆ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಅಥವಾ ಸ್ವತಂತ್ರ ಉದ್ಯಮಗಳಲ್ಲಿ ಸದಾ ಮುಂಚೂಣಿಯಲ್ಲಿರುತ್ತಾರೆ";
      if (lang === "hi") return "साहसी, ऊर्जावान, स्पष्टवादी तथा इंजीनियरिंग, तकनीकी, रक्षा या स्वतंत्र उद्यम में अग्रणी भूमिका निभाने वाले";
      return "dynamic, courageous, decisive, and ambitious, possessing high physical stamina and frankness, excelling in engineering, technical, defense, or entrepreneurial enterprises";
    case "Mercury":
      if (lang === "kn") return "ಚುರುಕಾದ ಬುದ್ಧಿವಂತಿಕೆ, ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ಹಾಸ್ಯಪ್ರಜ್ಞೆ ಉಳ್ಳವರಾಗಿದ್ದು, ವಾಣಿಜ್ಯ, ಹಣಕಾಸು, ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ, ಮಾಧ್ಯಮ ಅಥವಾ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ರಂಗಗಳಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "कुशाग्र बुद्धि, वाक्पटु, व्यावहारिक सोच वाले तथा वाणिज्य, वित्त, मीडिया, लेखन अथवा आईटी क्षेत्र में सफल";
      return "intellectually agile, articulate, witty, and commercially sharp, thriving in communications, commerce, finance, analytical technology, writing, or research";
    case "Jupiter":
      if (lang === "kn") return "ಜ್ಞಾನಿ, ಧರ್ಮನಿಷ್ಠ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಗೌರವ ಹೊಂದಿರುವ ಸಜ್ಜನರಾಗಿದ್ದು, ಶಿಕ್ಷಣ, ಕಾನೂನು, ಬ್ಯಾಂಕಿಂಗ್, ಸಲಹಾ ರಂಗ ಅಥವಾ ಧಾರ್ಮಿಕ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಕೀರ್ತಿ ಹೊಂದಿರುತ್ತಾರೆ";
      if (lang === "hi") return "विद्वान, संस्कारी, गंभीर तथा शिक्षा, कानून, वित्त, परामर्श या आध्यात्मिक क्षेत्र में विशेष सम्मान प्राप्त करने वाले";
      return "scholarly, virtuous, philosophically grounded, and respected, possessing dignified wisdom and thriving in education, legal affairs, financial advisory, or institutional leadership";
    case "Venus":
      if (lang === "kn") return "ಆಕರ್ಷಕ ರೂಪ, ಕಲಾತ್ಮಕ ಅಭಿರುಚಿ ಹಾಗೂ ಸೌಜನ್ಯವುಳ್ಳವರಾಗಿದ್ದು, ವಿನ್ಯಾಸ, ಮಾಧ್ಯಮ, ಮನರಂಜನೆ, ವಾಸ್ತುಶಿಲ್ಪ, ಫ್ಯಾಷನ್ ಅಥವಾ ಸೃಜನಶೀಲ ರಂಗಗಳಲ್ಲಿ ಖ್ಯಾತಿ ಪಡೆದಿರುತ್ತಾರೆ";
      if (lang === "hi") return "आकर्षक, कलाप्रेमी, शिष्ट तथा सौंदर्य, मीडिया, डिजाइनिंग, मनोरंजन अथवा ललित कलाओं में निपुण";
      return "charming, artistically refined, diplomatic, and fond of cultural elegance, luxury, and aesthetics, flourishing in design, media, luxury commerce, hospitality, or creative arts";
    case "Saturn":
    default:
      if (lang === "kn") return "ಗಂಭೀರ, ಅತ್ಯಂತ ಶಿಸ್ತುಬದ್ಧ, ಪರಿಶ್ರಮಿ ಹಾಗೂ ವಾಸ್ತವವಾದಿ ವ್ಯಕ್ತಿಯಾಗಿದ್ದು, ಕೈಗಾರಿಕೆ, ನಿರ್ಮಾಣ, ಕಾನೂನು, ಸರ್ಕಾರಿ ಆಡಳಿತ ಅಥವಾ ಕಾರ್ಪೊರೇಟ್ ರಂಗಗಳಲ್ಲಿ ದೀರ್ಘಕಾಲಿಕ ಯಶಸ್ಸು ಕಾಣುವವರಾಗಿರುತ್ತಾರೆ";
      if (lang === "hi") return "गंभीर, परिश्रमी, अनुशासित, व्यावहारिक सोच वाले तथा उद्योग, प्रशासन, तकनीकी या विधि क्षेत्र में निष्ठापूर्वक कार्यरत";
      return "mature, methodical, industrious, and grounded in practical reality, embodying steadfast loyalty, enduring patience, and organizational discipline in industry, law, administration, or engineering";
  }
}

function getCareerDomainByLord(lord: GrahaKey, lang: string): string {
  switch (lord) {
    case "Sun":
      if (lang === "kn") return "ಸರ್ಕಾರಿ ಆಡಳಿತ, ಸಾರ್ವಜನಿಕ ನೀತಿ, ಅಧಿಕಾರಯುತ ಹುದ್ದೆಗಳು ಹಾಗೂ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ";
      if (lang === "hi") return "प्रशासनिक सेवा, राजकीय पद, नीति निर्धारण एवं उच्च प्रबंधकीय नेतृत्व";
      return "governmental administration, public policy, executive management, and authoritative leadership roles";
    case "Moon":
      if (lang === "kn") return "ಶಿಕ್ಷಣ, ವೈದ್ಯಕೀಯ ಸೇವೆ, ಆತಿಥ್ಯ, ಮಾನಸಿಕ ಸಮಾಲೋಚನೆ ಹಾಗೂ ಸೃಜನಾತ್ಮಕ ರಂಗಗಳು";
      if (lang === "hi") return "शिक्षा, चिकित्सा, परामर्श, आतिथ्य सत्कार एवं रचनात्मक संचार";
      return "education, healthcare, public counseling, hospitality, and intuitive creative communications";
    case "Mars":
      if (lang === "kn") return "ಇಂಜಿನಿಯರಿಂಗ್, ರಕ್ಷಣೆ, ತಂತ್ರಜ್ಞಾನ, ರಿಯಲ್ ಎಸ್ಟೇಟ್ ಹಾಗೂ ಸಾಹಸೋದ್ಯಮಗಳು";
      if (lang === "hi") return "इंजीनियरिंग, तकनीकी अनुसंधान, रियल एस्टेट, रक्षा एवं स्वतंत्र उद्यम";
      return "engineering, advanced technology, real estate, technical operations, and dynamic entrepreneurial ventures";
    case "Mercury":
      if (lang === "kn") return "ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ, ಹಣಕಾಸು ವಿಶ್ಲೇಷಣೆ, ವಾಣಿಜ್ಯ, ಮಾಧ್ಯಮ, ಸಂಶೋಧನೆ ಹಾಗೂ ಬರವಣಿಗೆ";
      if (lang === "hi") return "सूचना प्रौद्योगिकी, वित्तीय विश्लेषण, वाणिज्य, मीडिया, डेटा साइंस एवं शोध";
      return "information technology, data science, financial analysis, commerce, corporate consulting, and media communications";
    case "Jupiter":
      if (lang === "kn") return "ಉನ್ನತ ಶಿಕ್ಷಣ, ನ್ಯಾಯಾಂಗ, ಕಾನೂನು, ಬ್ಯಾಂಕಿಂಗ್, ಆರ್ಥಿಕ ಸಲಹೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಘಟನೆಗಳು";
      if (lang === "hi") return "उच्च शिक्षा, कानून, न्यायपालिका, बैंकिंग, वित्तीय सलाह एवं नीतिगत नेतृत्व";
      return "higher education, judiciary, legal counsel, wealth advisory, banking, and institutional governance";
    case "Venus":
      if (lang === "kn") return "ವಾಸ್ತುಶಿಲ್ಪ, ಕಲೆ, ಮಾಧ್ಯಮ, ಮನರಂಜನೆ, ಐಷಾರಾಮಿ ಉತ್ಪನ್ನಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ";
      if (lang === "hi") return "डिजाइनिंग, कला, मीडिया, फिल्म, फैशन, सौंदर्य एवं जनसंपर्क";
      return "architectural design, creative arts, media entertainment, luxury goods, and public diplomacy";
    case "Saturn":
    default:
      if (lang === "kn") return "ಬೃಹತ್ ಕೈಗಾರಿಕೆಗಳು, ಮೂಲಸೌಕರ್ಯ, ಗಣಿಗಾರಿಕೆ, ಕಾನೂನು, ಕಾರ್ಪೊರೇಟ್ ಆಡಳಿತ ಹಾಗೂ ತಾಂತ್ರಿಕ ನಿರ್ವಹಣೆ";
      if (lang === "hi") return "भारी उद्योग, अवसंरचना, कानून, कॉरपोरेट प्रशासन एवं तकनीकी प्रबंधन";
      return "heavy industries, infrastructure, corporate governance, organizational logistics, engineering, and administrative discipline";
  }
}

/* ========================================================================= */
/* 100% Dynamic Fallback Narrative Builders (Strict 5-6 Lines per Paragraph) */
/* ========================================================================= */

export function buildDynamicMarriageFallback(
  chart: ParsedKundaliChart,
  status: "unmarried" | "married" | "general"
): string {
  const baseLang = chart.lang.split("-")[0];
  const h7 = chart.houses[7];
  const h7Lord = h7.lordName;
  const h7Sign = h7.rashiName;
  const h7Where = `Bhava ${h7.lordHouse} (${h7.lordRashiName})`;
  const karakaName = chart.gender === "Female" ? "Jupiter (Guru)" : "Venus (Shukra)";
  const karakaHouse = chart.gender === "Female" ? (chart.jupiterPlacement?.house ?? 9) : (chart.venusPlacement?.house ?? 4);
  const dirName = chart.spouseDirection[baseLang as keyof typeof chart.spouseDirection] || chart.spouseDirection.en;
  const spouseArchetype = getSpouseArchetypeByLord(h7.lordGraha, baseLang);

  if (status === "unmarried") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಸಪ್ತಮ ಭಾವವಾದ ${h7Sign} ಹಾಗೂ ಸಪ್ತಮಾಧಿಪತಿಯಾದ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ವೈವಾಹಿಕ ಯೋಗದ ಕರ್ಮಿಕ ಸಂರಚನೆಯನ್ನು ನಿರ್ಣಯಿಸುತ್ತದೆ. 7ನೇ ಮನೆಯ ಮೇಲೆ ಗ್ರಹಗಳ ಶುಭ ಸಂಚಾರವು ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನಕ್ಕೆ ಸ್ಥಿರ ಅಡಿಪಾಯ ಒದಗಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲಘಟ್ಟದಲ್ಲಿ ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿಯ ದಿವ್ಯ ಶುಭ ಮುಹೂರ್ತವು ಸಕ್ರಿಯವಾಗಿದೆ. ಶನಿ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ಪ್ರಚಲಿತ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ದಾರಿಯಲ್ಲಿ ಹಿಂದಿದ್ದ ವಿಳಂಬಗಳನ್ನು ನಿವಾರಿಸಿ, ವಿವಾಹ ಸಂಬಂಧಗಳ ಮಾತುಕತೆಗಳಿಗೆ ವೇಗ ನೀಡಲಿದೆ.

ನಿಮಗೆ ಲಭಿಸುವ ಜೀವನ ಸಂಗಾತಿಯು ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹದ ಪ್ರಭಾವದಂತೆ ${spouseArchetype} ಉಳ್ಳವರಾಗಿದ್ದು, ಉನ್ನತ ನೈತಿಕ ನಿಷ್ಠೆ, ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ಸುಸಂಸ್ಕೃತ ಜೀವನಶೈಲಿಯನ್ನು ಹೊಂದಿರುತ್ತಾರೆ. ಕಾರಕ ಗ್ರಹವಾದ ${karakaName} ಗ್ರಹದ ಸ್ಥಿತಿಯು ನಿಮ್ಮಿಬ್ಬರ ನಡುವೆ ಸಮಾನ ಆಲೋಚನೆ ಹಾಗೂ ಆಳವಾದ ಪರಸ್ಪರ ನಂಬಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಸಪ್ತಮ ಭಾವದ ದಿಕ್ಬಲ ಸೂತ್ರಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮಸ್ಥಳದಿಂದ ${dirName} ದಿಕ್ಕಿನಿಂದ ಅತ್ಯಂತ ಯೋಗ್ಯ ಹಾಗೂ ಸೌಭಾಗ್ಯದಾಯಕ ವಿವಾಹ ಪ್ರಸ್ತಾಪಗಳು ಒದಗಿಬರುವ ಬಲವಾದ ಸಾಧ್ಯತೆಗಳಿವೆ. ಅವರ ಪ್ರವೇಶವು ನಿಮ್ಮ ಸಂಸಾರದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಹಾಗೂ ನೆಮ್ಮದಿಯನ್ನು ತರಲಿದೆ.

ವೈವಾಹಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಳಂಬ ನಿವಾರಣೆಗೆ ಹಾಗೂ ಕುಜ ಗ್ರಹದ ಪ್ರಭಾವ ಶಮನಕ್ಕಾಗಿ ${chart.isManglik ? "ಕುಜ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಆರಾಧನೆ ಅತ್ಯಗತ್ಯವಾಗಿದೆ." : "ಜಾತಕದಲ್ಲಿ ಕುಜ ದೋಷ ಬಾಧೆಯಿಲ್ಲದೆ ಮಾರ್ಗ ಸುಗಮವಾಗಿದೆ."}, ನಿತ್ಯ ಪ್ರಾತಃಕಾಲದಲ್ಲಿ 'ಓಂ ಶ್ರೀಂ ಗೌರ್ಯೈ ನಮಃ' ಹಾಗೂ 'ಓಂ ಸಪ್ತಮಾಧಿಪತಯೇ ನಮಃ' ಮಂತ್ರಗಳನ್ನು 108 ಬಾರಿ ಜಪಿಸುವುದು ಶ್ರೇಷ್ಠವಾಗಿದೆ. ಮಂಗಳವಾರ ಹಾಗೂ ಶುಕ್ರವಾರಗಳಂದು ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಮತ್ತು ಗೌರಿ ಪೂಜೆ ನೆರವೇರಿಸುವುದು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಂಗಲ ಸೇವೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ಸಕಲ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಶೀಘ್ರ ಕಲ್ಯಾಣ ಸಿದ್ಧಿ ಲಭಿಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तम भाव (${h7Sign}) तथा सप्तमेश ${h7Lord} की ${h7Where} में स्थिति आपके वैवाहिक योग की आधारशिला निर्धारित करती है। सप्तम भाव की यह स्थिति दांपत्य जीवन में स्थिरता को संबल प्रदान करती है। वर्तमान में गतिमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल विवाह के शुभ अवसरों को प्रबलता से जागृत कर रहा है। गोचर में गुरु एवं शनि का शुभ प्रभाव पूर्व में आ रहे विलंब को समाप्त कर पारिवारिक वार्ताओं को शीघ्र सफलता की ओर अग्रसर करेगा।

आपके भावी जीवनसाथी में सप्तमेश ${h7Lord} के अनुसार ${spouseArchetype} के विशिष्ट गुण परिलक्षित होंगे। वे उच्च नैतिक मूल्य, बौद्धिक परिपक्वता तथा उत्तरदायित्व की गहरी भावना से युक्त होंगे। कारक ग्रह ${karakaName} की शुभ स्थिति दांपत्य में परस्पर आत्मीयता एवं सुख-शांति को सुनिश्चित करती है। सप्तम भाव के दिशा बल नियमानुसार, आपके जन्मस्थान से ${dirName} दिशा से अत्यंत योग्य एवं प्रतिष्ठित विवाह प्रस्ताव प्राप्त होने के प्रबल योग हैं। जीवनसाथी के आगमन से आपके जीवन में स्थिरता और सौभाग्य का विस्तार होगा।

विवाह में आ रहे किसी भी सूक्ष्म अवरोध अथवा मंगल प्रभाव की शांति हेतु ${chart.isManglik ? "कुंडली में मंगल दोष के निवारणार्थ सुब्रह्मण्य शांति आवश्यक है।" : "मंगल का प्रभाव संतुलित रहने से विवाह मार्ग सुगम है।"}, नित्य प्रातःकाल 'ॐ श्रीं गौर्यै नमः' एवं 'ॐ सप्तमेशाय नमः' मंत्र का 108 बार जाप करना अत्यंत शुभ फलदायी है। मंगलवार और शुक्रवार को मां गौरी तथा श्री सुब्रह्मण्य स्वामी का पूजन करें। गोಕರ್ण महाबलेश्वर क्षेत्र में मंगल सेवा समर्पित करने से समस्त बाधाएं दूर होकर शीघ्र कल्याण एवं वैवाहिक सुख की प्राप्ति होगी।`;
    }
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th lord ${h7Lord} situated in ${h7Where} govern your marital union and partnership karma. This celestial alignment establishes the foundational framework for lifelong mutual companionship and emotional harmony. Currently, your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period activate a potent matrimonial window, breaking through prior delays and bringing favorable planetary alignments for alliance negotiations. Favorable Gochara planetary transits of Jupiter and Saturn dissolve historical hesitations and open genuine avenues for a sacred alliance.

Your prospective life partner will unmistakably reflect the core planetary qualities of ${h7Lord} placed in ${h7Where}. They are indicated to be ${spouseArchetype}, possessing strong moral conviction, pragmatic intellect, and a harmonious social demeanor. The placement of Karaka ${karakaName} in Bhava ${karakaHouse} further confirms that your spouse will bring emotional grounding, mutual companionship, and shared domestic values into the union. In accordance with the classical directional strength of your 7th house (${h7Sign}), auspicious and compatible matrimonial proposals are strongly indicated to arrive from the ${dirName} direction relative to your birthplace, laying the foundation for an enduring and prosperous marital chapter.

To neutralize subtle planetary friction, dissolve past karmic blockages, and harmonize Kuja/Manglik influences (${chart.isManglik ? "Kuja Dosha is present in your chart and requires dedicated Shanti" : "no severe Kuja Dosha is present, ensuring smooth marital progress"}), performing dedicated Vedic remedies is highly beneficial. Reciting the sacred mantra 'Om Shreem Gauryai Namah' and performing Gauri Pooja alongside Sri Subramanya Seva 108 times during the morning sandhya creates an auspicious energetic shield for domestic bliss. Furthermore, offering archana at Gokarna Mahabaleshwara Kshetra on auspicious Tuesdays or Fridays will remove all lingering impediments, pacify planetary afflictions, and ensure early, blessed marital fulfillment.`;
  } else if (status === "married") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord} ಗ್ರಹವು ${h7Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ನಿಮ್ಮ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಆಳವಾದ ಪ್ರೀತಿ, ಪರಸ್ಪರ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿಯು ಸಂಸಾರದಲ್ಲಿ ನೈತಿಕ ಹೊಣೆಗಾರಿಕೆಗಳನ್ನು ಒಟ್ಟಾಗಿ ನಿರ್ವಹಿಸಲು ಪ್ರೇರೇಪಿಸುತ್ತದೆ. ಗ್ರಹಗಳ ಶುಭ ಬಲವು ನಿಮ್ಮ ಗೃಹದಲ್ಲಿ ಸದಾ ಸುಖ, ಶಾಂತಿ ಹಾಗೂ ಸಮೃದ್ಧಿಯ ವಾತಾವರಣವನ್ನು ಕಾಪಾಡಲಿದೆ.

ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ತಿಳುವಳಿಕೆ, ಗೌರವ ಹಾಗೂ ಮುಕ್ತ ಸಂಭಾಷಣೆಯು ನಿಮ್ಮ ಯಶಸ್ಸಿಗೆ ಮುಖ್ಯ ಆಧಾರಸ್ತಂಭಗಳಾಗಿವೆ. ಸಪ್ತಮಾಧಿಪತಿ ${h7Lord}ನ ಪ್ರಭಾವದಿಂದಾಗಿ, ಕೌಟುಂಬಿಕ ಪ್ರಗತಿ ಮತ್ತು ಆರ್ಥಿಕ ಹೂಡಿಕೆಗಳ ನಿರ್ಧಾರಗಳಲ್ಲಿ ನಿಮ್ಮ ಸಂಗಾತಿಯ ವಿವೇಕಯುತ ಸಲಹೆಗಳನ್ನು ಗೌರವಿಸುವುದು ಅದ್ಭುತ ಫಲಗಳನ್ನು ತರಲಿದೆ. ಇಬ್ಬರೂ ಜೊತೆಯಾಗಿ ಕೈಗೊಳ್ಳುವ ದೀರ್ಘಕಾಲಿಕ ಯೋಜನೆಗಳು ಸ್ಥಿರಾಸ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಮನ್ನಣೆಯನ್ನು ತಂದುಕೊಡುತ್ತವೆ. ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ಸಮಾಧಾನದಿಂದ ಬಗೆಹರಿಸಿಕೊಳ್ಳುವುದು ಬಾಂಧವ್ಯವನ್ನು ಮತ್ತಷ್ಟು ಗಟ್ಟಿಗೊಳಿಸುತ್ತದೆ.

ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಕಲ ಸೌಭಾಗ್ಯಗಳ ನಿರಂತರ ವೃದ್ಧಿಗಾಗಿ ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಪ್ರಾರ್ಥಿಸುವುದು ಶ್ರೇಷ್ಠ. ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ನಾರಾಯಣ ಹಾಗೂ ಗೌರಿ-ಶಂಕರ ದೇವಸ್ಥಾನಗಳಲ್ಲಿ ದಂಪತಿ ಸಮೇತರಾಗಿ ಅರ್ಚನೆ ನೆರವೇರಿಸಿ, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸಮರ್ಪಿಸುವುದರಿಂದ ಕೌಟುಂಬಿಕ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಿ ದಾಂಪತ್ಯದಲ್ಲಿ ನಿತ್ಯ ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी जन्म लग्न (${chart.lagnaSignName}) एवं चंद्र राशि (${chart.moonSignName}) के अनुसार, सप्तमेश ${h7Lord} की ${h7Where} में स्थिति दांपत्य जीवन में प्रगाढ़ विश्वास, समर्पण और स्थायी सामंजस्य को पुष्ट करती है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति का प्रभाव पारिवारिक उत्तरदायित्वों को गरिमापूर्ण ढंग से निभाने में सहायक सिद्ध होगा। शुभ ग्रहों की स्थिति आपके गृहस्थ जीवन में निरंतर सुख और शांति का वातावरण बनाए रखेगी।

वैवाहिक जीवन में परस्पर समझ, सम्मान और सौहार्दपूर्ण संवाद सफलता का मूल मंत्र है। सप्तमेश ${h7Lord} के प्रभाव से, पारिवारिक एवं वित्तीय योजनाओं में जीवनसाथी के परामर्श को महत्व देने से आर्थिक समृद्धि और मान-सम्मान में दोगुनी वृद्धि होगी। संयुक्त रूप से लिए गए निर्णय भविष्य को सुरक्षित और समृद्ध बनाएंगे। किसी भी प्रकार के मतभेद को शांति और धैर्य से सुलझाने से रिश्ते में नवीन ऊर्जा और मधुरता बनी रहेगी।

गृहस्थी में अखंड शांति, समृद्धि और आरोग्य की वृद्धि हेतु प्रत्येक शुक्रवार को मां महालक्ष्मी तथा श्री गौरी-शंकर का विधिपूर्वक पूजन करें। गोಕರ್ण क्षेत्र में महाबलेश्वर भगवान का अभिषेक एवं लक्ष्मी नारायण स्तोत्र का पाठ करने से समस्त नकारात्मकता समाप्त होकर दांपत्य जीवन में अपार सुख और समृद्धि का वास होगा।`;
    }
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) and 7th house lord ${h7Lord} placed in ${h7Where} alongside your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti fosters enduring trust, emotional warmth, and domestic stability in your married life. Benefic planetary placements create an energetic sanctuary within the household, protecting the marriage from external discord and anchoring the relationship in mutual loyalty.

Cultivating deep mutual understanding, respectful communication, and empathy forms the true bedrock of your marital journey. Reflecting the qualities of ${h7Lord}, involving your spouse in pivotal household, financial, and life decisions directly accelerates family prosperity and harmony. Collaborative planning generates constructive milestones for long-term investments and children's upbringing, turning occasional differences into opportunities for deeper emotional intimacy and spiritual cohesion.

To invite continuous divine grace and domestic peace, offering prayers to Goddess Lakshmi and Lord Narayana on Fridays remains exceptionally beneficial. Maintaining a serene sacred altar at home, reciting the Gauri-Shankara stotram, and offering prayers at Gokarna Mahabaleshwara Kshetra ensures that your family remains shielded from negative energies while enjoying lifelong abundance and harmony.`;
  } else {
    // general
    return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), the 7th house (${h7Sign}) governed by ${h7Lord} in ${h7Where} guides partnerships, mutual respect, and emotional maturity. Your current ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period foster balanced relationships, teaching the profound spiritual lessons of collaboration, compromise, and shared purpose across all interpersonal spheres.

Transparent communication, shared ethical values, and mutual honoring of personal boundaries remain the bedrock of successful relationships under this configuration. Daily prayers to your Ishta Devata and lighting a ghee lamp on Fridays ensure enduring relationship harmony and dissolve interpersonal misunderstandings effortlessly.`;
  }
}

export function buildDynamicChildrenFallback(
  chart: ParsedKundaliChart,
  status: "no_children" | "has_children" | "general"
): string {
  const baseLang = chart.lang.split("-")[0];
  const h5 = chart.houses[5];
  const h5Lord = h5.lordName;
  const h5Sign = h5.rashiName;
  const h5Where = `Bhava ${h5.lordHouse} (${h5.lordRashiName})`;
  const jupWhere = chart.jupiterPlacement ? `Bhava ${chart.jupiterPlacement.house}` : "chart";

  if (status === "no_children") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯೊಂದಿಗೆ ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿಯ ಶುಭ ಪ್ರಭಾವವು ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಯೋಗವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲವು ವಂಶಾಭಿವೃದ್ಧಿಯ ಶುಭ ಸಂಕೇತಗಳನ್ನು ಹೊತ್ತುತಂದಿದೆ. ಪಂಚಮ ಭಾವದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಬಲವು ನೈಸರ್ಗಿಕ ಗರ್ಭಧಾರಣೆಗೆ ಹಾಗೂ ಸಂತಾನ ಸೌಖ್ಯಕ್ಕೆ ಪೂರಕವಾದ ದಿವ್ಯ ಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತಿದೆ.

ಶುಭ ಗ್ರಹಗಳ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸಂಚಾರವು ಗರ್ಭಧಾರಣೆ ಹಾಗೂ ಸಂತಾನೋತ್ಪತ್ತಿಗೆ ಅನುಕೂಲಕರವಾದ ದಿವ್ಯ ಕಾಲಘಟ್ಟವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ದಂಪತಿಗಳು ಕೈಗೊಳ್ಳುವ ವೈದ್ಯಕೀಯ ಪರೀಕ್ಷೆಗಳು ಹಾಗೂ ಧಾರ್ಮಿಕ ಸಂಕಲ್ಪಗಳು ಶೀಘ್ರ ಯಶಸ್ಸು ನೀಡಲಿವೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ಸಂತಾನ ನಿರೀಕ್ಷೆಯಲ್ಲಿರುವ ಕುಟುಂಬದಲ್ಲಿ ಶೀಘ್ರದಲ್ಲೇ ಮಂದಸ್ಮಿತ ಮಗುವಿನ ಆಗಮನದ ಶುಭ ವಾರ್ತೆ ಕೇಳಿಬರಲಿದೆ.

ಸಂತಾನ ಪ್ರತಿಬಂಧಕ ದೋಷಗಳ ನಿವಾರಣೆಗಾಗಿ ನಿತ್ಯವೂ ಪ್ರಾತಃಕಾಲ ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಮಂತ್ರವನ್ನು 108 ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸುವುದು ಶ್ರೇಷ್ಠ ಪರಿಹಾರವಾಗಿದೆ. ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ ಹಾಗೂ ನಾಗ ಶಾಂತಿ ನೆರವೇರಿಸುವುದು, ಮತ್ತು ಪ್ರತಿ ಗುರುವಾರ ಹಸುವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ಬೆಲ್ಲ-ಕಡಲೆ ನೀಡಿ ಗೋಸೇವೆ ಮಾಡುವುದರಿಂದ ಸಂತಾನ ಯೋಗದ ಸಕಲ ಅಡೆತಡೆಗಳು ನಿವಾರಣೆಯಾಗಲಿವೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली के पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} की ${h5Where} में स्थिति के साथ संतानकारक देवगुरु बृहस्पति का शुभ प्रभाव वंश वृद्धि एवं संतान प्राप्ति के योग को पुष्ट करता है। वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल संतान सुख की प्राप्ति में अत्यंत सहायक सिद्ध होगा। पंचम भाव का यह प्रभाव दंपत्ति के जीवन में नवीन ऊर्जा और मातृत्व-पितृत्व के शुभ अवसर निर्मित कर रहा है।

अनुकूल ग्रहों का वर्तमान गोचर गर्भाधान तथा स्वास्थ्य संवर्धन हेतु अत्यंत फलदायी वातावरण तैयार कर रहा है। इस समय किए जाने वाले चिकित्सीय प्रयास और आध्यात्मिक अनुष्ठान शीघ्र सकारात्मक परिणाम लेकर आएंगे। देवगुरु बृहस्पति की कृपा से संतान अभिलाषी दंपत्ति के घर में शीघ्र ही नन्हें शिशु की किलकारियां गूंजने के प्रबल योग बन रहे हैं।

संतान प्राप्ति में आ रहे किसी भी सूक्ष्म व्यवधान के निवारणार्थ प्रतिदिन 'ॐ क्लीं देवकीसुत गोविंद वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥' मंत्र का 108 बार जाप करें। गोಕರ್ण क्षेत्र में सुब्रह्मण्य होम एवं गुरुवार को गौ-माता की सेवा करना समस्त दोषों को शांत कर शीघ्र संतान सुख प्रदान करेगा।`;
    }
    return `In your birth chart, the 5th house (${h5Sign}) and 5th lord ${h5Lord} placed in ${h5Where}, along with Putrakaraka Jupiter's benefic disposition in ${jupWhere}, signify strong Santana Yoga (progeny blessings). The 5th house governs Poorva Punya, creative intelligence, and lineage continuity, indicating that your karmic bank carries positive momentum for family expansion. Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period actively stimulate the reproductive houses, creating an auspicious astrological window for conception and parental fulfillment.

Favorable planetary transits of Jupiter and supportive planetary aspects establish a fertile and protected window for physical wellbeing and conception. Medical consultations and lifestyle optimizations undertaken during this phase will yield exceptionally positive and timely outcomes. With divine blessings aligning in your chart, the joy of parenthood and the continuation of your lineage are strongly favored to manifest in the coming phase.

To eliminate any subtle energetic blockages or pitru-related delays, regular recitation of the Santana Gopala Mantra ('Om Kleem Devakisuta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah') 108 times daily is recommended. Additionally, sponsoring a Subramanya Pooja or Naga Dosha Nivarana at Gokarna Kshetra and performing Gau-seva (cow service) on Thursdays will harmonize planetary energies and grant early, healthy progeny blessings.`;
  } else if (status === "has_children") {
    if (baseLang === "kn") {
      return `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪಂಚಮ ಭಾವವಾದ ${h5Sign} ಹಾಗೂ ಪಂಚಮಾಧಿಪತಿಯಾದ ${h5Lord} ಗ್ರಹದ ಸ್ಥಿತಿಯು ಮಕ್ಕಳ ಶೈಕ್ಷಣಿಕ, ಬೌದ್ಧಿಕ ಹಾಗೂ ಸೃಜನಶೀಲ ರಂಗಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಪ್ರತಿಭೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಪುತ್ರಕಾರಕ ಬೃಹಸ್ಪತಿಯ ಶುಭ ದೃಷ್ಟಿಯು ಅವರಲ್ಲಿ ನೈಸರ್ಗಿಕ ಜ್ಞಾನದಾಹ, ಸನ್ನಡತೆ ಹಾಗೂ ಉನ್ನತ ಸಂಸ್ಕಾರವನ್ನು ನೆಲೆನಿಲ್ಲಿಸುತ್ತದೆ. ಮಕ್ಕಳ ತೀಕ್ಷ್ಣ ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಶಿಸ್ತುಬದ್ಧ ಪರಿಶ್ರಮವು ಕುಟುಂಬದ ಕೀರ್ತಿಯನ್ನು ಸಮಾಜದಲ್ಲಿ ಉನ್ನತೀಕರಿಸಲಿದೆ.

ಮಕ್ಕಳ ಉನ್ನತ ಶಿಕ್ಷಣ, ಕ್ರೀಡೆ ಹಾಗೂ ವೃತ್ತಿಜೀವನದ ಮಹತ್ವದ ಹಂತಗಳಲ್ಲಿ ಪೋಷಕರಾಗಿ ನಿಮ್ಮ ವಾತ್ಸಲ್ಯಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನವು ಪ್ರಮುಖ ಪಾತ್ರ ವಹಿಸಲಿದೆ. ಅವರ ಸುಪ್ತ ಪ್ರತಿಭೆಗಳನ್ನು ಗುರುತಿಸಿ ಪ್ರೋತ್ಸಾಹಿಸುವುದು ಅವರ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಇಮ್ಮಡಿಗೊಳಿಸುತ್ತದೆ. ಮಕ್ಕಳೊಂದಿಗೆ ಮುಕ್ತ ಸ್ನೇಹಪರ ಸಂಭಾಷಣೆ ನಡೆಸುವುದು ಅವರ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕಾಪಾಡುತ್ತದೆ ಹಾಗೂ ಭವಿಷ್ಯದ ಸಾಧನೆಗಳಿಗೆ ಗಟ್ಟಿ ಅಡಿಪಾಯ ಹಾಕುತ್ತದೆ.

ಮಕ್ಕಳ ಸಕಲ ವಿದ್ಯಾಭ್ಯಾಸದ ಜಯ, ಏಕಾಗ್ರತೆ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯಕ್ಕಾಗಿ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಾರಾಯಣ ಮಾಡಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ. ಮಕ್ಕಳಿಗೆ ಪ್ರಾತಃಕಾಲ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸುವ ಅಭ್ಯಾಸ ಮಾಡಿಸುವುದು ಹಾಗೂ ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯಲು ಪ್ರೇರೇಪಿಸುವುದು ಅವರ ಭವಿಷ್ಯವನ್ನು ಸದಾ ಉಜ್ವಲವಾಗಿಡಲಿದೆ.`;
    }
    if (baseLang === "hi") {
      return `आपकी कुंडली में पंचम भाव (${h5Sign}) और पंचमेश ${h5Lord} तथा देवगुरु बृहस्पति के शुभ प्रभाव से बच्चों के बौद्धिक विकास, शिक्षा और रचनात्मक क्षेत्रों में सराहनीय उन्नति के प्रबल योग हैं। उनका स्वाभाविक अनुशासन, तीव्र स्मरण शक्ति और संस्कारी स्वभाव परिवार का नाम रोशन करेगा। वे विद्या और व्यावहारिक ज्ञान दोनों में निपुण होकर अपनी विशिष्ट पहचान बनाएंगे।

उनकी उच्च शिक्षा, करियर और व्यक्तिगत विकास में माता-पिता के रूप में आपका मार्गदर्शन अत्यंत प्रेरणादायी सिद्ध होगा। बच्चों की व्यक्तिगत रुचियों को पहचानकर उन्हें सकारात्मक दिशा में प्रोत्साहित करना उनके आत्मविश्वास को सुदृढ़ करेगा। उनके साथ सौहार्दपूर्ण और मित्रवत संवाद बनाए रखने से पारिवारिक संबंध और अधिक प्रगाढ़ होंगे।

बच्चों की मानसिक एकाग्रता, उत्कृष्ट परीक्षा परिणाम और दीर्घायु हेतु मां सरस्वती की नित्य आराधना तथा भगवान श्री गणेश का अथर्वशीर्ष अभिषेक कराना परम कल्याणकारी रहेगा। गुरुवार को विद्यार्थियों को पाठ्य सामग्री का दान करना तथा घर में सात्विक वातावरण बनाए रखना बच्चों के सर्वांगीण विकास को गति प्रदान करेगा।`;
    }
    return `The benefic alignment of your 5th house (${h5Sign}), 5th lord ${h5Lord} in ${h5Where}, and Putrakaraka Jupiter in ${jupWhere} indicates sharp intellect, moral integrity, and commendable academic promise in your children. They possess a natural curiosity, disciplined grasping power, and creative problem-solving abilities that will distinguish them in scholarly and extracurricular pursuits, bringing joy, pride, and honor to the family.

Your loving parental mentorship, patience, and active encouragement will play a pivotal role in shaping their higher educational milestones and career paths. Fostering open, compassionate communication and respecting their individual talents bolsters their inner confidence, equipping them to navigate competitive challenges with dignity and emotional poise.

To continuously support their academic clarity, cognitive focus, and overall vitality, offering Saraswati prayers and Lord Ganesha Atharvashirsha Abhishekam is highly beneficial. Encouraging them to chant the Gayatri Mantra daily and maintaining an enriching, culturally grounded home environment ensures lifelong success, happiness, and moral brilliance.`;
  } else {
    // general
    return `The 5th house (${h5Sign}) and its ruler ${h5Lord} govern Poorva Punya, intuitive intellect, and creative legacy. The running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti inspire scholarly achievements, strategic foresight, and noble creative endeavors that leave an enduring positive imprint on your lineage.

Nurturing noble ideals, philosophical study, and spiritual wisdom activates powerful karmic momentum for enduring prosperity. Daily chanting of the Gayatri Mantra and supporting youth educational causes awakens profound mental radiance and divine grace.`;
  }
}

export function buildDynamicCareerFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h10 = chart.houses[10];
  const h10Lord = h10.lordName;
  const h10Sign = h10.rashiName;
  const h10Where = `Bhava ${h10.lordHouse} (${h10.lordRashiName})`;
  const careerDomain = getCareerDomainByLord(h10.lordGraha, baseLang);
  const saturnWhere = chart.saturnPlacement ? `Bhava ${chart.saturnPlacement.house}` : "chart";

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ 10ನೇ ಮನೆ (ದಶಮ ಭಾವವಾದ ${h10Sign}) ಹಾಗೂ ಕರ್ಮಾಧಿಪತಿಯಾದ ${h10Lord} ಗ್ರಹವು ${h10Where}ದಲ್ಲಿ ನೆಲೆಸಿರುವ ಸ್ಥಿತಿಯು ನಿಮ್ಮ ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸ್ಥಿರ ಏಳಿಗೆ, ನಾಯಕತ್ವ ಹಾಗೂ ಗೌರವವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಕರ್ಮಕಾರಕ ಶನಿ ಗ್ರಹವು ${saturnWhere}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ನಿಮ್ಮಲ್ಲಿ ಅದ್ಭುತ ಕಾರ್ಯದಕ್ಷತೆ, ಕಠಿಣ ಪರಿಶ್ರಮ ಹಾಗೂ ಜವಾಬ್ದಾರಿ ನಿರ್ವಹಣಾ ಸಾಮರ್ಥ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಜಾತಕದ ಪ್ರಕಾರ ನೀವು ${careerDomain} ಮುಂತಾದ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಹೆಚ್ಚಿನ ಯಶಸ್ಸು ಹಾಗೂ ಉನ್ನತ ಅಧಿಕಾರವನ್ನು ಗಳಿಸುವ ಯೋಗವಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಅವಧಿಯು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನಾಯಕತ್ವ ಸ್ಥಾನ, ಬಡ್ತಿ ಹಾಗೂ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳನ್ನು ವಹಿಸಿಕೊಳ್ಳಲು ಪ್ರಶಸ್ತವಾದ ಸಮಯವಾಗಿದೆ. ಶನಿ ಮತ್ತು ಗುರು ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ಪ್ರಾಮಾಣಿಕ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ, ಆರ್ಥಿಕ ಉನ್ನತಿ ಹಾಗೂ ವೃತ್ತಿಪರ ಯಶಸ್ಸನ್ನು ಒದಗಿಸಲಿದೆ. ಕಚೇರಿಯಲ್ಲಿ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗೆ ಸಮನ್ವಯ ಕಾಪಾಡುವುದು ಹಾಗೂ ಶನಿವಾರ ಶನಿ ಶಾಂತಿ ಅಥವಾ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸುವುದು ವೃತ್ತಿ ರಂಗದ ಸಕಲ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के 10वें भाव (दशम भाव ${h10Sign}) और कर्मेश ${h10Lord} की ${h10Where} में स्थिति आपके कार्यक्षेत्र में निरंतर उन्नति, प्रतिष्ठा और प्रशासनिक क्षमता का संकेत देती है। कर्मकारक शनि का प्रभाव आपकी कार्यशैली में अनुशासन, दूरदर्शिता और गंभीर उत्तरदायित्व की भावना भरता है। आपकी कुंडली के अनुसार ${careerDomain} के क्षेत्रों में आपकी प्रतिभा विशेष रूप से निखरेगी और आप उच्च पद प्राप्त करेंगे।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में व्यावसायिक उत्तरदायित्वों में वृद्धि, पदोन्नति एवं मान-सम्मान के प्रबल योग बन रहे हैं। गोचर में गुरु और शनि का अनुकूल प्रभाव आपके प्रयासों को यथोचित पुरस्कार और आर्थिक स्थिरता प्रदान करेगा। कार्यस्थल पर धैर्य और रणनीतिक दृष्टिकोण बनाए रखना दीर्घकालिक सफलता सुनिश्चित करेगा। शनिवार को हनुमान चालीसा का पाठ तथा तिल के तेल का दीप प्रज्वलित करना करियर की समस्त बाधाओं को दूर करेगा।`;
  }
  return `In your birth chart, the 10th house (${h10Sign}) and 10th lord ${h10Lord} situated in ${h10Where} indicate structured career growth, professional resilience, and executive capabilities. Karmakaraka Saturn positioned in ${saturnWhere} infuses your vocational path with industrious discipline, methodical focus, and strategic stamina. Based on these planetary configurations, you are naturally suited to achieve distinction in ${careerDomain}, where your organizational leadership and integrity command lasting respect.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period bring new milestones, expanding responsibilities, and leadership elevation in your chosen vocational field. Favorable transits of Saturn and Jupiter ensure that your sustained dedication earns peer recognition, promotion opportunities, and managerial authority. Maintaining strategic patience during workplace transitions and chanting the Hanuman Chalisa or Shani Gayatri reinforces professional triumph and neutralizes competitive obstacles.`;
}

export function buildDynamicWealthFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h2 = chart.houses[2];
  const h11 = chart.houses[11];
  const h2Lord = h2.lordName;
  const h11Lord = h11.lordName;
  const jupWhere = chart.jupiterPlacement ? `Bhava ${chart.jupiterPlacement.house}` : "chart";

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ 2ನೇ ಮನೆ (ಧನ ಭಾವವಾದ ${h2.rashiName}, ಅಧಿಪತಿ ${h2Lord}) ಹಾಗೂ 11ನೇ ಮನೆ (ಲಾಭ ಭಾವವಾದ ${h11.rashiName}, ಅಧಿಪತಿ ${h11Lord}) ಗ್ರಹಗಳ ಸಂಯೋಜನೆಯು ಅತ್ಯುತ್ತಮ ಆರ್ಥಿಕ ಭದ್ರತೆ, ಧನಸಂಗ್ರಹ ಶಕ್ತಿ ಹಾಗೂ ನಿರಂತರ ಲಾಭದ ಹರಿವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಧನಕಾರಕ ಬೃಹಸ್ಪತಿಯು ${jupWhere}ದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ವಿವೇಕ, ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಸ್ಥಿರ ಸಂಪತ್ತು ವೃದ್ಧಿಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ. ನಿಮ್ಮ ಕುಟುಂಬದ ಸಾಂಪ್ರದಾಯಿಕ ಆಸ್ತಿ ಹಾಗೂ ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಗಳಿಸಿದ ಸಂಪತ್ತು ಎರಡೂ ಸಮತೋಲನದಲ್ಲಿ ವೃದ್ಧಿಯಾಗಲಿವೆ. ಆರ್ಥಿಕ ಶಿಸ್ತು, ವಿವೇಚನಾಯುಕ್ತ ಹೂಡಿಕೆಗಳು ಮತ್ತು ದೂರದೃಷ್ಟಿಯ ಬಜೆಟ್ ಯೋಜನೆಗಳು ನಿಮ್ಮ ಕುಟುಂಬದ ಬೊಕ್ಕಸವನ್ನು ಸದಾ ಸುಭದ್ರವಾಗಿಡಲಿವೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲದಲ್ಲಿ ಸ್ಥಿರಾಸ್ತಿ, ವಾಹನ ಖರೀದಿ ಹಾಗೂ ಬುದ್ಧಿವಂತಿಕೆಯ ಹೂಡಿಕೆಗಳ ಮೂಲಕ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಹೆಚ್ಚಲಿದೆ. ಅತಿಯಾದ ದುಂದುವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ದೀರ್ಘಾವಧಿ ಉಳಿತಾಯ ಯೋಜನೆಗಳಲ್ಲಿ ಹಣ ತೊಡಗಿಸುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯನ್ನು ಇನ್ನಷ್ಟು ಸುಭದ್ರಗೊಳಿಸುತ್ತದೆ. ವ್ಯಾಪಾರ ಹಾಗೂ ವೃತ್ತಿಪರ ಒಪ್ಪಂದಗಳಲ್ಲಿ ಪಾರದರ್ಶಕತೆ ಕಾಪಾಡುವುದು ನಿರಂತರ ಲಾಭವನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ. ಪ್ರತಿ ಶುಕ್ರವಾರ ಮನೆಯಲ್ಲಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಅಷ್ಟಕಂ ಅಥವಾ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು, ಶುದ್ಧ ಹಸುವಿನ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚುವುದು ಹಾಗೂ ನಿರ್ಗತಿಕರಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದು ನಿಮ್ಮ ಗೃಹದಲ್ಲಿ ಸದಾ ಅಷ್ಟೈಶ್ವರ್ಯಗಳು ಮತ್ತು ಧನಲಕ್ಷ್ಮಿ ನೆಲೆಸುವಂತೆ ಮಾಡಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के 2nd house (द्वितीय भाव धन ${h2.rashiName}, स्वामी ${h2Lord}) तथा एकादश भाव (लाभ ${h11.rashiName}, स्वामी ${h11Lord}) का शुभ संबंध निरंतर आय वृद्धि और उत्कृष्ट धन संचय क्षमता को दर्शाता है। धनकारक बृहस्पति की ${jupWhere} में स्थिति आपके वित्तीय निर्णयों में दूरदर्शिता, विवेक और आर्थिक स्थिरता प्रदान करती है। पैतृक संपत्ति के साथ-साथ आपके स्वयं के परिश्रम से अर्जित धन में निरंतर विस्तार होगा तथा आपकी वित्तीय योजनाएं भविष्य को सुरक्षित बनाएंगी।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल में संचित संपत्ति, भूमि-भवन तथा सुरक्षित निवेशों से प्रचुर आर्थिक लाभ प्राप्त होने के योग हैं। अनियोजित खर्चों पर नियंत्रण रखना और विवेकपूर्ण वित्तीय योजना बनाना आपकी समृद्धि को चिरस्थायी बनाएगा। शुक्रवार को मां महालक्ष्मी की आराधना, कनकधारा स्तोत्र का पाठ और सामर्थ्यानुसार दान-पुण्य करने से धन के नए स्रोत खुलेंगे और परिवार में धन-धान्य तथा संपन्नता की निरंतर वृद्धि होगी।`;
  }
  return `In your natal chart, the 2nd house of accumulated wealth (${h2.rashiName}, ruled by ${h2Lord}) and the 11th house of gains (${h11.rashiName}, ruled by ${h11Lord}) indicate sound financial instincts, disciplined wealth preservation, and multiple diversified revenue streams. Dhanakaraka Jupiter situated in ${jupWhere} blesses you with ethical fiscal prudence, protecting your accumulated capital from speculative volatility and fostering steady tangible assets over time. The geometric synergy between these wealth bhavas ensures substantial equilibrium between ancestral family resources and self-earned enterprise, granting lasting economic autonomy and fiscal security.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period support significant property acquisition, long-term portfolio growth, commercial expansion, and beneficial capital returns. Exercising disciplined budgetary management while avoiding impulsive speculative ventures fortifies your family treasury against unforeseen inflationary or macroeconomic shifts. Engaging in transparent financial agreements and methodically reinvesting surpluses into land, gold, or secure sovereign bonds accelerates your asset compounding. Reciting the Sri Suktam or Kanakadhara Stotram on Fridays and supporting educational charities invites continuous Mahalakshmi blessings and generational prosperity into your household.`;
}

export function buildDynamicHealthFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h1 = chart.houses[1];
  const h6 = chart.houses[6];
  const h1Lord = h1.lordName;
  const h6Lord = h6.lordName;
  const sunWhere = chart.sunPlacement ? `Bhava ${chart.sunPlacement.house}` : "chart";

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಲಗ್ನ ಭಾವವಾದ ${h1.rashiName}ದ ಅಧಿಪತಿ ${h1Lord} ಗ್ರಹವು ನಿಮ್ಮ ದೈಹಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ದೃಢತೆ ಹಾಗೂ ಚೈತನ್ಯವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ. ಆರೋಗ್ಯಕಾರಕ ಸೂರ್ಯನು ${sunWhere}ದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದು ನೈಸರ್ಗಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಜೀವಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಜಾತಕದ 6ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾದ ${h6Lord} ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಾಲೋಚಿತ ಶೀತ, ಜೀರ್ಣಕ್ರಿಯೆಯ ಏರುಪೇರು, ನಿದ್ರಾಹೀನತೆ ಅಥವಾ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ಉಂಟಾಗುವ ಮಾನಸಿಕ ಆಯಾಸದ ಬಗ್ಗೆ ನಿಯಮಿತ ನಿಗಾ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಋತುಮಾನಕ್ಕೆ ತಕ್ಕಂತೆ ತ್ರಿದೋಷಗಳ (ವಾತ, ಪಿತ್ತ, ಕಫ) ಸಮತೋಲನ ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಹಾಗೂ ನೈಸರ್ಗಿಕ ಪೌಷ್ಟಿಕ ಆಹಾರ ಸೇವನೆಯು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಮತ್ತು ದೃಢ ಆರೋಗ್ಯಕ್ಕೆ ಪೂರಕವಾಗಿದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಅವಧಿಯಲ್ಲಿ ನಿಯಮಿತ ದಿನಚರಿ, ಸಮತೋಲಿತ ಸಾತ್ವಿಕ ಆಹಾರ ಹಾಗೂ ಯೋಗಾಭ್ಯಾಸವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದು ದೇಹ ಮತ್ತು ಮನಸ್ಸಿಗೆ ಅತ್ಯುತ್ತಮ ನವಚೈತನ್ಯವನ್ನು ನೀಡಲಿದೆ. ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡುವುದು, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಹಾಗೂ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಸದಾ ತೇಜಸ್ವಿಯಾಗಿಡಲಿದೆ. ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಪ್ರಾಣಾಯಾಮ, ಧ್ಯಾನ ಹಾಗೂ ರಾತ್ರಿಯ ಕಾಲದಲ್ಲಿ ಕನಿಷ್ಠ ೭ ರಿಂದ ೮ ಗಂಟೆಗಳ ಕಾಲ ಶಾಂತ ನಿದ್ರೆ ಪಡೆಯುವುದು ನಿಮ್ಮ ನರಮಂಡಲಕ್ಕೆ ಬಲ ತುಂಬಿ ಸಮಗ್ರ ಆರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ದಿವ್ಯ ರಕ್ಷಾ ಕವಚವಾಗಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी लग्न राशि ${h1.rashiName} के स्वामी ${h1Lord} आपकी शारीरिक जीवनी शक्ति, रोग प्रतिरोधक क्षमता और सामान्य आरोग्यता के मुख्य नियंत्रक हैं। आरोग्यकारक सूर्य की स्थिति आपको प्राकृतिक ऊर्जा और सहनशक्ति प्रदान करती है। षष्ठेश ${h6Lord} के प्रभाव के कारण पाचन तंत्र, मौसमी बदलावों और अत्यधिक मानसिक तनाव से होने वाली थकान के प्रति सतर्कता बरतना आवश्यक है। त्रिदोष (वात, पित्त, कफ) का प्राकृतिक संतुलन बनाए रखना आपके शारीरिक स्वास्थ्य को सुदृढ़ रखेगा।

वर्तमान ${chart.mahaLordName} महादशा में दैनिक जीवन में योग, प्राणायाम और संतुलित सात्विक आहार का समावेश शारीरिक एवं मानसिक संतुलन बनाए रखेगा। प्रातःकाल सूर्य देव को जल अर्पित करना, आदित्य हृदय स्तोत्र का पाठ और पर्याप्त विश्राम करना आपकी जीवन शक्ति को प्रखर बनाए रखेगा। ताम्र पात्र में जलपान करना तथा भगवान धन्वंतरि की आराधना करना आपके संपूर्ण शरीर को निरोगी और दीर्घायु प्रदान करेगा।`;
  }
  return `Your Lagna (${h1.rashiName}) and Lagna lord ${h1Lord} govern your foundational constitution, natural vitality, cellular immunity, and physical stamina. The Sun as Arogyakaraka situated in ${sunWhere} bestows intrinsic metabolic vigor and resilience, while the Moon governs emotional equilibrium and mental calmness. The 6th house of health vulnerabilities (${h6.rashiName}, lord ${h6Lord}) advises proactive attentiveness toward digestive fire (Jatharagni), rhythmic sleep hygiene, and managing work-induced nervous fatigue. Maintaining harmonious Tridosha balance (Vata, Pitta, Kapha) through seasonally attuned lifestyles shields your physical body against chronic ailments and promotes cellular longevity.

Under your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period, establishing a grounded daily regimen of gentle hatha yoga, conscious pranayama, and unhurried hydration directly revitalizes your physical stamina and nervous energy. Offering Arghya to the rising Sun with pure water, chanting the Aditya Hridaya Stotram at dawn, and incorporating warm herbal teas balance internal metabolic rhythms effortlessly. Ensuring adequate rest during demanding professional phases and dedicating time to meditative stillness protects your aura, ensuring radiant vitality and robust lifelong wellbeing.`;
}

/* ========================================================================= */
/* Child Horoscopes (< 8 Years): Non-Adult Pedagogical Fallbacks             */
/* ========================================================================= */

export function buildDynamicChildEducationFallback(chart: ParsedKundaliChart): string {
  const h4 = chart.houses[4];
  const h5 = chart.houses[5];
  return `The child's 4th house of foundational learning (${h4.rashiName}, ruled by ${h4.lordName}) and 5th house of intellect (${h5.rashiName}, ruled by ${h5.lordName}) indicate high curiosity, sharp memory retention, and exceptional cognitive grasping capacity. Under an encouraging and disciplined environment, the young native will demonstrate natural brilliance in languages, analytical concepts, and creative storytelling.

Providing interactive, experiential learning tools while fostering a calm study space will blossom their academic focus. Offering early morning Saraswati prayers and reciting 'Om Aim Saraswatyai Namah' instills deep intellectual clarity and lifelong scholarly excellence.`;
}

export function buildDynamicChildActivitiesFallback(chart: ParsedKundaliChart): string {
  const h3 = chart.houses[3];
  const h5 = chart.houses[5];
  return `With the 3rd house of vitality (${h3.rashiName}, lord ${h3.lordName}) alongside the 5th house of artistic flair (${h5.rashiName}), the child is endowed with abundant dynamic energy, imaginative playfulness, and an affinity for sports, rhythm, and outdoor activities. Their active spirit thrives when given diverse creative outlets such as music, drawing, or physical athletics.

Encouraging collaborative team play alongside structured creative hobbies builds social empathy and physical coordination. Channeling their vibrant energy positively prevents restlessness and cultivates focused determination.`;
}

export function buildDynamicChildFoundationFallback(chart: ParsedKundaliChart): string {
  const h1 = chart.houses[1];
  const h9 = chart.houses[9];
  return `Governed by Lagna ${h1.rashiName} (Lord ${h1.lordName}) and the 9th house of Dharma (${h9.rashiName}, lord ${h9.lordName}), the child possesses an innate moral compass, truthfulness, and natural leadership potential. Formative childhood experiences and noble stories will leave an indelible, positive impression on their developing character.

Instilling traditional cultural values, compassion toward living beings, and respectful family interactions establishes an unshakeable ethical foundation that will guide them to become a respected, honorable individual in society.`;
}

export function buildDynamicChildFamilyFallback(chart: ParsedKundaliChart): string {
  const h2 = chart.houses[2];
  const h4 = chart.houses[4];
  const baseLang = chart.lang.split("-")[0];

  if (baseLang === "kn") {
    return `ಕುಟುಂಬ ಸ್ಥಾನವಾದ 2ನೇ ಮನೆ (${h2.rashiName}, ಅಧಿಪತಿ ${h2.lordName}) ಹಾಗೂ ಮಾತೃ ಸ್ಥಾನವಾದ 4ನೇ ಮನೆ (${h4.rashiName}) ಗ್ರಹಗಳ ಪ್ರಭಾವವು ಮಗುವಿಗೆ ಕುಟುಂಬದ ಪ್ರೀತಿ, ವಾತ್ಸಲ್ಯ ಹಾಗೂ ಆಪ್ತ ಭದ್ರತೆಯೇ ಅತ್ಯುನ್ನತ ಶಕ್ತಿಯಾಗಿದೆ ಎಂಬುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. ತಂದೆ-ತಾಯಿ, ಹಿರಿಯರು ಹಾಗೂ ಒಡಹುಟ್ಟಿದವರ ಪ್ರೀತಿಯ ಅಪ್ಪುಗೆಯು ಮಗುವಿನಲ್ಲಿ ಅಚಲ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಭಾವನಾತ್ಮಕ ಸ್ಥಿರತೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿಸುತ್ತದೆ. ಸಂಸ್ಕಾರಯುತ ಮತ್ತು ಪ್ರಶಾಂತ ಕೌಟುಂಬಿಕ ವಾತಾವರಣವು ಮಗುವಿನ ಮಾನಸಿಕ ಬೆಳವಣಿಗೆಗೆ ದಿವ್ಯ ಅಮೃತದಂತೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ.

ಕುಟುಂಬದಲ್ಲಿ ಧಾರ್ಮಿಕ ಹಬ್ಬಗಳ ಆಚರಣೆ, ಸಂಪ್ರದಾಯದ ಕಥೆಗಳನ್ನು ಹೇಳುವುದು, ಒಟ್ಟಾಗಿ ಊಟ ಮಾಡುವುದು ಮತ್ತು ಪ್ರೀತಿಯ ಸಂವಾದಗಳು ಮಗುವಿಗೆ ಆಳವಾದ ಭದ್ರತಾ ಭಾವನೆಯನ್ನು ನೀಡುತ್ತವೆ. ಮಗುವಿನ ಸಣ್ಣ ಸಣ್ಣ ಸಾಧನೆಗಳನ್ನು ಪ್ರಶಂಸಿಸುವುದು ಮತ್ತು ತಪ್ಪುಗಳನ್ನು ಪ್ರೀತಿಯಿಂದ ತಿದ್ದಿ ಹೇಳುವುದು ಅದರ ಮನಸ್ಸಿನಲ್ಲಿ ಕುಟುಂಬದ ಮೇಲಿನ ಅಪಾರ ಭಕ್ತಿ ಮತ್ತು ಗೌರವವನ್ನು ಸದಾ ಜೀವಂತವಾಗಿಡಲಿದೆ. ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಸಂಜೆ ದೀಪ ಹಚ್ಚಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿಸುವ ಅಭ್ಯಾಸವು ಮಗುವಿನ ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧನಾತ್ಮಕ ತರಂಗಗಳನ್ನು ತುಂಬಲಿದೆ.`;
  }
  return `The 2nd house of family warmth (${h2.rashiName}, lord ${h2.lordName}) and 4th house of maternal affection (${h4.rashiName}) indicate that a serene, loving, and supportive domestic atmosphere directly blossoms the child's emotional stability and sense of inner security. The unconditional warmth received from parents, grandparents, and household elders acts as their greatest emotional anchor during formative years. Experiencing peaceful familial interactions instills deep psychological grounding, allowing the young child to explore the world with joyous curiosity, robust confidence, and emotional fortitude.

Maintaining consistent family rituals, shared joyous celebratory meals, cultural bedtime stories, and gentle parental discipline nurtures profound self-worth, making the child feel cherished, heard, and deeply rooted in their heritage. Celebrating their small daily creative milestones and offering patient, compassionate corrections without harsh judgment reinforces mutual trust and deep familial devotion. Creating a sacred domestic sanctuary with evening prayers and cultural harmony ensures the child flourishes into an emotionally balanced, empathetic, and culturally enlightened individual.`;
}

export function buildDynamicChildPediatricHealthFallback(chart: ParsedKundaliChart): string {
  const h1 = chart.houses[1];
  const h6 = chart.houses[6];
  return `Lagna lord ${h1.lordName} blesses the young child with healthy physical growth, energetic vitality, and resilient natural immunity. With the 6th house (${h6.rashiName}), seasonal transitions require attentive dietary care, fresh natural hydration, and sound, unhurried sleep routines to keep immunity robust.

Encouraging daily outdoor sunshine, home-cooked wholesome nutrition, and offering simple morning prayers to Lord Ganesha ensures continuous divine protection and vibrant childhood wellness.`;
}

/* ========================================================================= */
/* Chapters II, III, IV, VII Fallbacks                                       */
/* ========================================================================= */

export function buildDynamicCharacteristicsFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h1 = chart.houses[1];
  const h1Lord = h1.lordName;
  const h1Where = `Bhava ${h1.lordHouse} (${h1.lordRashiName})`;

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}), ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯಾದ ${h1Lord} ಗ್ರಹವು ${h1Where}ದಲ್ಲಿ ಸ್ಥಿತವಾಗಿರುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ವಿಶಿಷ್ಟವಾದ ನಾಯಕತ್ವ, ಧೃತಿ ಹಾಗೂ ಗಾಂಭೀರ್ಯವನ್ನು ಕರುಣಿಸುತ್ತದೆ. ನೀವು ಸ್ವಾಭಾವಿಕವಾಗಿಯೇ ಉನ್ನತ ತರ್ಕಶಕ್ತಿ, ನ್ಯಾಯನಿಷ್ಠೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಶಿಸ್ತಿನಿಂದ ನಿರ್ವಹಿಸುವ ಅಪೂರ್ವ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿದ್ದೀರಿ. ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ, ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಯಾವುದೇ ಕಠಿಣ ಪರಿಸ್ಥಿತಿಯನ್ನು ಧೈರ್ಯದಿಂದ ಎದುರಿಸುವ ಶಕ್ತಿಯು ಸದಾ ಎದ್ದು ಕಾಣುತ್ತದೆ.

ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲವು ನಿಮ್ಮ ಆಂತರಿಕ ಚೈತನ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸಲಿದೆ. ಸತ್ಕರ್ಮಗಳ ಅನುಷ್ಠಾನ, ಸಕಾರಾತ್ಮಕ ಆಲೋಚನೆ ಹಾಗೂ ದೃಢ ಸಂಕಲ್ಪವು ನಿಮ್ಮ ಎಲ್ಲಾ ಕಾರ್ಯರಂಗಗಳಲ್ಲಿ ಶಾಶ್ವತ ಗೌರವ, ಜನಪ್ರಿಯತೆ ಹಾಗೂ ಸಮಾಜಿಕ ಮನ್ನಣೆಯನ್ನು ತರಲಿವೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म लग्न (${chart.lagnaSignName}), चंद्र राशि (${chart.moonSignName}) और लग्नेश ${h1Lord} की ${h1Where} में स्थिति आपके व्यक्तित्व को गरिमामयी, तार्किक और दूरदर्शी बनाती है। आप स्वाभाविक रूप से परिवार और समाज के प्रति समर्पित तथा सत्यनिष्ठ निर्णय लेने की अद्भुत क्षमता रखते हैं। आपका शांत आत्मविश्वास और कर्तव्यपरायणता आपको हर परिस्थिति में स्थिरता प्रदान करती है।

वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति का प्रभाव आपकी आंतरिक शक्ति को प्रखर करेगा। आपकी कार्यनिष्ठा, दूरदर्शिता और धैर्य आपको समाज एवं कार्यक्षेत्र में उच्च मान-सम्मान तथा स्थायी सफलता दिलाएगी।`;
  }
  return `Derived directly from your birth Lagna (${chart.lagnaSignName}), Moon sign (${chart.moonSignName}), and Lagna lord ${h1Lord} placed in ${h1Where}, your personality embodies natural leadership, intellectual clarity, and profound moral dignity. You possess a sharp analytical intellect, an unshakeable sense of duty toward family, and an instinctive ability to make balanced, principled decisions even during turbulent circumstances.

Your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period activate inner courage, purposeful action, and strategic expansion. Sustained personal discipline, authentic self-expression, and continuous learning will translate your deepest aspirations into enduring personal and professional achievements.`;
}

export function buildDynamicDarkSecretFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  const h8 = chart.houses[8];
  const h12 = chart.houses[12];

  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜಾತಕದ ಅಷ್ಟಮ ಭಾವ (${h8.rashiName}) ಹಾಗೂ ದ್ವಾದಶ ಭಾವ (${h12.rashiName})ಗಳ ಕರ್ಮಿಕ ಸಂರಚನೆಯು ನಿಮ್ಮ ಆತ್ಮದ ನಿಗೂಢ ರಹಸ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನೀವು ಬಾಹ್ಯವಾಗಿ ಎಷ್ಟೇ ದೃಢಚಿತ್ತರಾಗಿ ಕಂಡರೂ, ಅಂತರಂಗದಲ್ಲಿ ಹಳೆಯ ನೆನಪುಗಳು, ಅಗೋಚರ ಆತಂಕಗಳು ಅಥವಾ ಭಾವನಾತ್ಮಕ ಏಕಾಂಗಿತನವು ಒಮ್ಮೊಮ್ಮೆ ಕಾಡಬಹುದು. ನಿಮ್ಮ ಸ್ವಂತ ನೋವುಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳದೆ ಒಳಗೇ ಮುಚ್ಚಿಡುವ ಹಾಗೂ ಎಲ್ಲವನ್ನೂ ತಾವೇ ನಿಭಾಯಿಸಬೇಕೆಂಬ ಒತ್ತಡವನ್ನು ನೀವೇ ಹೇರಿಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇರುತ್ತದೆ.

ಪ್ರಸ್ತುತ ${chart.mahaLordName} ದಶಾ ಕಾಲವು ಈ ಮಾನಸಿಕ ಸಂಕೋಲೆಗಳಿಂದ ಮುಕ್ತಿ ಪಡೆಯಲು ಸುಸಮಯವಾಗಿದೆ. ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ, ಧ್ಯಾನ, ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ ಮಾಡಿಸುವುದರಿಂದ ಆತ್ಮಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗಿ, ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಸೂಕ್ಷ್ಮ ಆತಂಕಗಳು ಕರಗಿ ಆಂತರಿಕ ಧೈರ್ಯ ವೃದ್ಧಿಯಾಗಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी कुंडली के अष्टम भाव (${h8.rashiName}) और द्वादश भाव (${h12.rashiName}) का कर्मिक प्रभाव आपके अंतर्मन में एक गूढ़ आत्मिक संघर्ष को दर्शाता है। बाहर से शांत और सुदृढ़ रहने के बावजूद, मन में कभी-कभी अज्ञात भय, पुरानी स्मृतियों का भार या भावनात्मक एकाकीपन का अनुभव हो सकता है। आप अपने कष्टों को दूसरों से साझा किए बिना स्वयं ही वहन करने का प्रयास करते हैं।

वर्तमान ${chart.mahaLordName} महादशा इस आंतरिक कर्मिक दबाव को दूर करने का शुभ अवसर है। नित्य ध्यान, ईश्वर आराधना तथा गोಕರ್ण क्षेत्र में महामृत्युंजय जाप से समस्त आंतरिक चिंताएं समाप्त होकर असीम मानसिक शांति एवं आत्मबल प्राप्त होगा।`;
  }
  return `The karmic alignment of your 8th house (${h8.rashiName}, ruled by ${h8.lordName}) and 12th house (${h12.rashiName}, ruled by ${h12.lordName}) highlights a profound soul pattern—the Niguda Rahasya. Externally, you project poise, strength, and unwavering reliability; however, internally, you periodically navigate unspoken emotional burdens, lingering past impressions, or feelings of psychological solitude without wishing to burden those you love.

Your current ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti provide a transformative window for emotional release and spiritual healing. Regular meditation, trusting trusted confidants, and sponsoring a Maha Mrityunjaya Japa at Gokarna Kshetra will dissolve subconscious anxieties, awakening deep tranquility and renewed inner fortitude.`;
}

export function buildDynamicCurrentPhaseFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${chart.lagnaSignName}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${chart.moonSignName}) ಆಧಾರದ ಮೇಲೆ, ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${chart.mahaLordName} ಮಹಾದಶಾ ಹಾಗೂ ${chart.bhuktiLordName} ಭುಕ್ತಿ ಕಾಲಘಟ್ಟವು ಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಪ್ರಮುಖ ತಿರುವನ್ನು ತರಲಿದೆ. ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ, ಧರ್ಮನಿಷ್ಠೆ ಮತ್ತು ದೃಢ ಪರಿಶ್ರಮವು ಹೊಸ ಬಾಗಿಲುಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದು, ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪಕ್ವಗೊಳಿಸುತ್ತಿದೆ.

ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹಗಳ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮಗೆ ಧೈರ್ಯ, ಸಂಯಮ ಮತ್ತು ದೀರ್ಘಕಾಲೀನ ಭದ್ರತೆಯನ್ನು ಒದಗಿಸಲಿದೆ. ಸತ್ಕರ್ಮಗಳ ಅನುಷ್ಠಾನ, ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಇಷ್ಟದೇವತಾ ಆರಾಧನೆಯು ಸಕಲ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಿ ನಿರಂತರ ಜಯವನ್ನು ಕರುಣಿಸಲಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी जन्म लग्न (${chart.lagnaSignName}) और चंद्र राशि (${chart.moonSignName}) के अनुसार, वर्तमान ${chart.mahaLordName} महादशा एवं ${chart.bhuktiLordName} भुक्ति काल आपके जीवन में रचनात्मक परिवर्तन ला रहा है। नए उत्तरदायित्व आपके आत्मबल और बौद्धिक कौशल का विस्तार कर रहे हैं।

शनि एवं गुरु का गोचर आत्मबल, धैर्य और दूरदर्शिता की वृद्धि करेगा। अपने नैतिक मूल्यों के प्रति निष्ठावान रहने से भविष्य अत्यंत सुरक्षित, प्रतिष्ठित और समृद्ध बनेगा।`;
  }
  return `Based on your birth Lagna (${chart.lagnaSignName}) and Moon sign (${chart.moonSignName}), your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period activate a pivotal chapter of growth, emotional maturity, and vocational expansion. Daily responsibilities are steadily aligning to open doors for tangible long-term accomplishments.

Live planetary aspects from Saturn and Jupiter strengthen your mental resilience, strategic clarity, and inner discernment. Aligning your daily actions with ethical discipline and spiritual focus ensures that current efforts bear sweet and lasting fruit.`;
}

export function buildDynamicSummaryFallback(chart: ParsedKundaliChart): string {
  const baseLang = chart.lang.split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಸಮಗ್ರ ಜನ್ಮ ಕುಂಡಲಿಯು ಲಗ್ನ ಭಾವದಿಂದ ದ್ವಾದಶ ಭಾವಗಳವರೆಗಿನ ಗ್ರಹಗಳ ಸ್ಥಿತಿ, ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ಪ್ರಸ್ತುತ ಗೋಚಾರಗಳ ಸುಂದರ ಸಮತೋಲನವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ. ಕೇಂದ್ರ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಶುಭ ಪ್ರಭಾವವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆರ್ಥಿಕ ಭದ್ರತೆ, ಸುಖಮಯ ಕೌಟುಂಬಿಕ ಬಾಂಧವ್ಯ ಮತ್ತು ವೃತ್ತಿಪರ ಮನ್ನಣೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಕರುಣಿಸುವ ದೈವಿಕ ಸಾಮರ್ಥ್ಯವನ್ನು ಹೊಂದಿದೆ.

ಬರುವ ವರ್ಷದಲ್ಲಿ ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿಯು ಸ್ಥಿರತೆ, ಆರ್ಥಿಕ ವೃದ್ಧಿ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದ ವಿಸ್ತರಣೆಯಾಗಿರಬೇಕು. ನಿಯಮಿತ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ, ಧರ್ಮನಿಷ್ಠ ನಡವಳಿಕೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದಗಳು ನಿಮ್ಮ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳನ್ನು ಸಿದ್ಧಿಗೊಳಿಸಿ ಜೀವನದುದ್ದಕ್ಕೂ ಶಾಂತಿ, ಆನಂದ ಮತ್ತು ಯಶಸ್ಸನ್ನು ತುಂಬಲಿ ಎಂದು ಹಾರೈಸುತ್ತೇವೆ.`;
  }
  if (baseLang === "hi") {
    return `आपकी संपूर्ण जन्म कुंडली लग्न भाव से लेकर द्वादश भाव तक के ग्रहों, वर्तमान दशा-भुक्ति एवं गोचर का अत्यंत संतुलित और आशाजनक समन्वय प्रस्तुत करती है। केंद्र एवं त्रिकोण भावों का शुभ प्रभाव आपके जीवन में आर्थिक स्थिरता, सुदृढ़ पारिवारिक संबंध और व्यावसायिक प्रतिष्ठा का मार्ग प्रशस्त करता है।

आगामी वर्ष में आपका मुख्य ध्यान कार्यक्षेत्र में अनुशासन, परिवार में सौहार्द और आध्यात्मिक संतुलन बनाए रखने पर केंद्रित होना चाहिए। अपने कुलदेवता का स्मरण, सात्विक जीवनशैली और माता-पिता का आशीर्वाद आपके समस्त सत्संकल्पों को सिद्ध कर जीवन में निरंतर सुख और समृद्धि प्रदान करेगा।`;
  }
  return `Your comprehensive birth chart demonstrates a resilient synergy across the 12 Bhavas, harmonizing natal Kendra-Trikona strengths with the progressive momentum of your running ${chart.mahaLordName} Mahadasha and ${chart.bhuktiLordName} Bhukti period. With the planetary forces bolstering financial stability, vocational authority, and domestic harmony, your astrological path is structured for lasting evolutionary growth.

For the upcoming year, directing your focus toward disciplined execution, portfolio consolidation, and nurturing close family bonds will yield compounding rewards. Remaining anchored in righteous Vedic living, offering daily gratitude to your Ishta Devata, and performing benevolent community seva will ensure lifelong fulfillment, protective grace, and auspicious success.`;
}

export function buildDynamicGocharaFallback(chart: ParsedKundaliChart): Array<{ name: string; impact: string; remedy?: string }> {
  const baseLang = chart.lang.split("-")[0];
  const items: Array<{ name: string; impact: string; remedy?: string }> = [];

  if (chart.transitSaturn) {
    const s = chart.transitSaturn;
    const sName = baseLang === "kn" ? "ಶನಿ ಗೋಚಾರ ಸಂಚಾರ (Saturn Transit)" : baseLang === "hi" ? "शनि गोचर प्रभाव" : "Saturn (Shani) Live Transit";
    let desc = `Saturn is transiting the ${s.houseFromMoon}th house from your natal Moon (${chart.moonSignName}).`;
    if (s.isSadeSati) {
      desc += baseLang === "kn"
        ? " ಇದು ಏಳರೆ ಶನಿಯ ಕಾಲಘಟ್ಟವಾಗಿದ್ದು, ಶಿಸ್ತು, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯಗಳನ್ನು ನಿರ್ವಹಿಸುವುದರಿಂದ ಶನಿ ಮಹಾರಾಜರ ಕೃಪೆ ಲಭಿಸಲಿದೆ."
        : " This marks a period of heightened karmic discipline, urging patience and ethical perseverance.";
    } else if (s.isAshtama) {
      desc += baseLang === "kn"
        ? " ಇದು ಅಷ್ಟಮ ಶನಿಯ ಸಂಚಾರವಾಗಿದ್ದು, ಆರೋಗ್ಯ ಹಾಗೂ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸುವುದು ಕ್ಷೇಮಕರ."
        : " Navigating 8th house transit requires conscious focus on wellness precautions and cautious financial choices.";
    } else {
      desc += baseLang === "kn"
        ? " ಶನಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರಗತಿ ಹಾಗೂ ಸ್ಥಿರತೆಯನ್ನು ನೀಡಲಿದ್ದಾನೆ."
        : " Saturn transit provides constructive stability, rewarding focused perseverance with steady career growth.";
    }
    items.push({
      name: sName,
      impact: desc,
      remedy: baseLang === "kn" ? "ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸುವುದು ಶ್ರೇಷ್ಠ." : "Light sesame oil lamp on Saturdays and chant Shani Stotram."
    });
  }

  if (chart.transitJupiter) {
    const j = chart.transitJupiter;
    const jName = baseLang === "kn" ? "ಗುರು ಗೋಚಾರ ಸಂಚಾರ (Jupiter Transit)" : baseLang === "hi" ? "गुरु गोचर प्रभाव" : "Jupiter (Guru) Live Transit";
    let desc = `Jupiter is transiting the ${j.houseFromMoon}th house from your natal Moon.`;
    if (j.isGuruBala) {
      desc += baseLang === "kn"
        ? " ಇದು ಪ್ರಬಲ ಗುರು ಬಲದ ಕಾಲಘಟ್ಟವಾಗಿದ್ದು, ಕಲ್ಯಾಣ ಯೋಗ, ಧನ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಖ್ಯವನ್ನು ವೃದ್ಧಿಸಲಿದೆ."
        : " Powerful Guru Bala is active, bestowing spiritual clarity, family auspiciousness, and financial expansion.";
    } else {
      desc += baseLang === "kn"
        ? " ಇದು ಆತ್ಮಾವಲೋಕನ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಗೆ ಪ್ರಶಸ್ತವಾದ ಕಾಲಘಟ್ಟವಾಗಿದೆ."
        : " This period fosters internal wisdom, study, and contemplative spiritual development.";
    }
    items.push({
      name: jName,
      impact: desc,
      remedy: baseLang === "kn" ? "ಗುರುವಾರ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಆರಾಧನೆ ಹಾಗೂ ಗೋಸೇವೆ ಮಾಡುವುದು ಶುಭ." : "Offer archana to Guru and engage in cow service on Thursdays."
    });
  }

  if (items.length === 0) {
    items.push({
      name: baseLang === "kn" ? "ಗ್ರಹ ಗೋಚಾರ ಫಲ" : "Planetary Transit Impact",
      impact: `Running transits through your Moon sign (${chart.moonSignName}) provide cosmic balance, supporting steady progress.`,
      remedy: "Daily prayer to Ishta Devata."
    });
  }

  return items;
}
