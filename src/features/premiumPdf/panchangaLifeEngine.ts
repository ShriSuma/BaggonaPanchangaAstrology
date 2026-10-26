/**
 * Panchanga Life Engine (ಪಂಚಾಂಗ ಜೀವನ ಸಾರ ಎಂಜಿನ್)
 *
 * Provides comprehensive mathematical calculation and 5-language synthesis of:
 * 1. Janana Panchanga (Birth Tithi, Vaara, Nakshatra, Yoga, Karana, Dagdha Rashis)
 * 2. Running Gochara Panchanga (Current Day Tithi, Vaara, Nakshatra, Yoga, Karana)
 * 3. Tara Bala (Navatara Chakra between Janma Nakshatra and Gochara Moon Nakshatra)
 * 4. Chandra Bala (Gochara Moon house from Janma Moon)
 * 5. Synthesis into all life-related chapters (Characteristics, Nigoodha Rahasya,
 *    Current Phase, Marriage, Children, Career, Wealth, Health, Gochara, Summary)
 *
 * Strict 5-Language Script Purity: Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), English (en).
 * ZERO English token leakage into Indic scripts.
 */

import { type GrahaKey, pick, GRAHA_L5, RASHI_L5, NAKSHATRA_L5 } from "./premiumPdfLocale";
import { WEEKDAY_L5, TITHI_L5, PURNIMA_L5, AMAVASYA_L5, PAKSHA_L5 } from "../seva/sevaLocale";
import type { NatalPlacement, TransitPlacement } from "./premiumPrompts";
import { siderealLongitudes } from "../../core/EphemerisEngine";

export interface JananaPanchangaData {
  tithiIndex: number; // 1-30
  tithiName: string;
  paksha: "Shukla" | "Krishna";
  dagdhaRashiIndices: number[];
  dagdhaRashiNames: string[];
  vaaraIndex: number; // 0-6 (0 Sun .. 6 Sat)
  vaaraName: string;
  vaaraLordGraha: GrahaKey;
  vaaraLordName: string;
  vaaraVitality: string;
  nakshatraIndex: number; // 0-26
  nakshatraName: string;
  nakshatraPada: 1 | 2 | 3 | 4;
  nakshatraLordGraha: GrahaKey;
  nakshatraLordName: string;
  yogaIndex: number; // 0-26
  yogaName: string;
  yogaIsAuspicious: boolean;
  yogaNature: string;
  karanaIndex: number; // 0-10
  karanaName: string;
  karanaType: "chara" | "sthira";
  isVishtiBhadra: boolean;
}

export interface GocharaPanchangaData {
  tithiIndex: number;
  tithiName: string;
  paksha: "Shukla" | "Krishna";
  vaaraIndex: number;
  vaaraName: string;
  vaaraLordGraha: GrahaKey;
  vaaraLordName: string;
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraLordGraha: GrahaKey;
  yogaIndex: number;
  yogaName: string;
  karanaIndex: number;
  karanaName: string;
  isVishtiBhadra: boolean;
  taraBala: {
    taraIndex: number; // 0 to 8
    taraName: string;
    isBenefic: boolean;
    description: string;
  };
  chandraBala: {
    houseFromMoon: number; // 1 to 12
    isAuspicious: boolean;
    description: string;
  };
  transitSaturnHouseFromMoon: number;
  transitJupiterHouseFromMoon: number;
  isGuruBala: boolean;
  isSadeSati: boolean;
  isAshtamaShani: boolean;
  isKantakaShani: boolean;
}

export const DAGDHA_RASHIS_BY_TITHI: Record<number, number[]> = {
  1: [6, 9],    // Tula, Makara
  2: [8, 11],   // Dhanu, Meena
  3: [4, 9],    // Simha, Makara
  4: [1, 10],   // Vrishabha, Kumbha
  5: [2, 5],    // Mithuna, Kanya
  6: [0, 4],    // Mesha, Simha
  7: [8, 3],    // Dhanu, Karka
  8: [2, 5],    // Mithuna, Kanya
  9: [4, 7],    // Simha, Vrischika
  10: [4, 7],   // Simha, Vrischika
  11: [8, 11],  // Dhanu, Meena
  12: [6, 9],   // Tula, Makara
  13: [1, 4],   // Vrishabha, Simha
  14: [2, 5, 8, 11], // Mithuna, Kanya, Dhanu, Meena
  15: [],       // Purnima (None)
  16: [6, 9],
  17: [8, 11],
  18: [4, 9],
  19: [1, 10],
  20: [2, 5],
  21: [0, 4],
  22: [8, 3],
  23: [2, 5],
  24: [4, 7],
  25: [4, 7],
  26: [8, 11],
  27: [6, 9],
  28: [1, 4],
  29: [2, 5, 8, 11],
  30: []        // Amavasya (None)
};

export const VAARA_LORD_GRAHAS: GrahaKey[] = [
  "Sun",     // 0 Sunday
  "Moon",    // 1 Monday
  "Mars",    // 2 Tuesday
  "Mercury", // 3 Wednesday
  "Jupiter", // 4 Thursday
  "Venus",   // 5 Friday
  "Saturn"   // 6 Saturday
];

export const NAKSHATRA_LORD_GRAHAS: GrahaKey[] = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", // 0-8
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", // 9-17
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"  // 18-26
];

export const YOGA_NAMES_L5: Record<number, { en: string; kn: string; hi: string; te: string; ta: string; isAuspicious: boolean }> = {
  0: { en: "Vishkambha", kn: "ವಿಷ್ಕಂಭ", hi: "विष्कम्भ", te: "విష్కంభ", ta: "விஷ்கம்பம்", isAuspicious: false },
  1: { en: "Priti", kn: "ಪ್ರೀತಿ", hi: "प्रीति", te: "ప్రీతి", ta: "பிரீதி", isAuspicious: true },
  2: { en: "Ayushman", kn: "ಆಯುಷ್ಮಾನ್", hi: "आयुष्मान्", te: "ఆయుష్మాన్", ta: "ஆயுஷ்மான்", isAuspicious: true },
  3: { en: "Saubhagya", kn: "ಸೌಭಾಗ್ಯ", hi: "सौभाग्य", te: "సౌభాగ్య", ta: "சௌபாக்கியம்", isAuspicious: true },
  4: { en: "Shobhana", kn: "ಶೋಭನ", hi: "शोभन", te: "శోభన", ta: "சோபனம்", isAuspicious: true },
  5: { en: "Atiganda", kn: "ಅತಿಗಂಡ", hi: "अतिगण्ड", te: "అతిగండ", ta: "அதிகண்டம்", isAuspicious: false },
  6: { en: "Sukarma", kn: "ಸುಕರ್ಮ", hi: "सुकर्मा", te: "సుకర్మ", ta: "சுகர்மம்", isAuspicious: true },
  7: { en: "Dhriti", kn: "ಧೃತಿ", hi: "धृति", te: "ధృతి", ta: "திருதி", isAuspicious: true },
  8: { en: "Shoola", kn: "ಶೂಲ", hi: "शूल", te: "శూల", ta: "சூலம்", isAuspicious: false },
  9: { en: "Ganda", kn: "ಗಂಡ", hi: "गण्ड", te: "గండ", ta: "கண்டம்", isAuspicious: false },
  10: { en: "Vriddhi", kn: "ವೃದ್ಧಿ", hi: "वृद्धि", te: "వృద్ధి", ta: "விருத்தி", isAuspicious: true },
  11: { en: "Dhruva", kn: "ಧ್ರುವ", hi: "ध्रुव", te: "ధ్రువ", ta: "துருவம்", isAuspicious: true },
  12: { en: "Vyaghata", kn: "ವ್ಯಾಘಾತ", hi: "व्याघात", te: "వ్యాఘాత", ta: "வியாகாதம்", isAuspicious: false },
  13: { en: "Harshana", kn: "ಹರ್ಷಣ", hi: "हर्षण", te: "హర్షణ", ta: "ஹர்ஷணம்", isAuspicious: true },
  14: { en: "Vajra", kn: "ವಜ್ರ", hi: "वज्र", te: "వజ్ర", ta: "வஜ்ரம்", isAuspicious: false },
  15: { en: "Siddhi", kn: "ಸಿದ್ಧಿ", hi: "सिद्धि", te: "సిద్ధి", ta: "சித்தி", isAuspicious: true },
  16: { en: "Vyatipata", kn: "ವ್ಯತೀಪಾತ", hi: "व्यतीपात", te: "వ్యతీపాత", ta: "வியதீபாதம்", isAuspicious: false },
  17: { en: "Variyan", kn: "ವರೀಯಾನ್", hi: "वरीयान्", te: "వరీయాన్", ta: "வரியான்", isAuspicious: true },
  18: { en: "Parigha", kn: "ಪರಿಘ", hi: "परिघ", te: "పరిఘ", ta: "பரிகம்", isAuspicious: false },
  19: { en: "Shiva", kn: "ಶಿವ", hi: "शिव", te: "శివ", ta: "சிவம்", isAuspicious: true },
  20: { en: "Siddha", kn: "ಸಿದ್ಧ", hi: "सिद्ध", te: "సిద్ధ", ta: "சித்தம்", isAuspicious: true },
  21: { en: "Sadhya", kn: "ಸಾಧ್ಯ", hi: "साध्य", te: "సాధ్య", ta: "சாத்தியம்", isAuspicious: true },
  22: { en: "Shubha", kn: "ಶುಭ", hi: "शुभ", te: "శుభ", ta: "சுபம்", isAuspicious: true },
  23: { en: "Shukla", kn: "ಶುಕ್ಲ", hi: "शुक्ल", te: "శుక్ల", ta: "சுப்ரம்", isAuspicious: true },
  24: { en: "Brahma", kn: "ಬ್ರಹ್ಮ", hi: "ब्रह्म", te: "బ్రహ్మ", ta: "பிரம்மம்", isAuspicious: true },
  25: { en: "Indra", kn: "ಇಂದ್ರ", hi: "इन्द्र", te: "ఇంద్ర", ta: "இந்திரம்", isAuspicious: true },
  26: { en: "Vaidhriti", kn: "ವೈಧೃತಿ", hi: "वैधृति", te: "వైధృతి", ta: "வைதிருதி", isAuspicious: false }
};

export const KARANA_NAMES_L5: Record<number, { en: string; kn: string; hi: string; te: string; ta: string; type: "chara" | "sthira"; isVishtiBhadra: boolean }> = {
  0: { en: "Bava", kn: "ಬವ", hi: "बव", te: "బవ", ta: "பவம்", type: "chara", isVishtiBhadra: false },
  1: { en: "Balava", kn: "ಬಾಲವ", hi: "बालव", te: "బాలవ", ta: "பாலவம்", type: "chara", isVishtiBhadra: false },
  2: { en: "Kaulava", kn: "ಕೌಲವ", hi: "कौलव", te: "కౌలవ", ta: "கௌலவம்", type: "chara", isVishtiBhadra: false },
  3: { en: "Taitila", kn: "ತೈತಿಲ", hi: "तैतिल", te: "తైతిల", ta: "தைதுலம்", type: "chara", isVishtiBhadra: false },
  4: { en: "Garija", kn: "ಗರಜ", hi: "गर", te: "గరజ", ta: "கரசை", type: "chara", isVishtiBhadra: false },
  5: { en: "Vanija", kn: "ವಣಿಜ", hi: "वणिज", te: "వణిజ", ta: "வனசை", type: "chara", isVishtiBhadra: false },
  6: { en: "Vishti (Bhadra)", kn: "ವಿಷ್ಟಿ (ಭದ್ರಾ)", hi: "विष्टि (भद्रा)", te: "విష్టి (భద్ర)", ta: "பத்திரை (விஷ்டி)", type: "chara", isVishtiBhadra: true },
  7: { en: "Shakuni", kn: "ಶಕುನಿ", hi: "शकुनि", te: "శకుని", ta: "சகுனி", type: "sthira", isVishtiBhadra: false },
  8: { en: "Chatushpada", kn: "ಚತುಷ್ಪದ", hi: "चतुष्पद", te: "చతుష్పాద", ta: "சதுஷ்பாதம்", type: "sthira", isVishtiBhadra: false },
  9: { en: "Naga", kn: "ನಾಗ", hi: "नाग", te: "నాగ", ta: "நாகம்", type: "sthira", isVishtiBhadra: false },
  10: { en: "Kintughna", kn: "ಕಿಂತುಘ್ನ", hi: "किस्तुघ्न", te: "కింస్తుఘ్న", ta: "கிம்துக்கினம்", type: "sthira", isVishtiBhadra: false }
};

export const TARA_BALA_L5: Record<number, { en: string; kn: string; hi: string; te: string; ta: string; isBenefic: boolean }> = {
  0: { en: "Janma Tara", kn: "ಜನ್ಮ ತಾರಾ", hi: "जन्म तारा", te: "జన్మ తార", ta: "ஜென்ம தாரை", isBenefic: true },
  1: { en: "Sampat Tara", kn: "ಸಂಪತ್ ತಾರಾ", hi: "संपत् तारा", te: "సంపత్ తార", ta: "சம்பத் தாரை", isBenefic: true },
  2: { en: "Vipat Tara", kn: "ವಿಪತ್ ತಾರಾ", hi: "विपत् तारा", te: "విపత్ తార", ta: "விபத்து தாரை", isBenefic: false },
  3: { en: "Kshema Tara", kn: "ಕ್ಷೇಮ ತಾರಾ", hi: "क्षेम तारा", te: "క్షేమ తార", ta: "க்ஷேம தாரை", isBenefic: true },
  4: { en: "Pratyak Tara", kn: "ಪ್ರತ್ಯಕ್ ತಾರಾ", hi: "प्रत्यक् तारा", te: "ప్రత్యక్ తార", ta: "பிரத்யக் தாரை", isBenefic: false },
  5: { en: "Sadhana Tara", kn: "ಸಾಧನಾ ತಾರಾ", hi: "साधना तारा", te: "సాధన తార", ta: "சாதனா தாரை", isBenefic: true },
  6: { en: "Naidhana Tara", kn: "ನೈಧನ ತಾರಾ", hi: "नैधन तारा", te: "నైధన తార", ta: "நைதன தாரை", isBenefic: false },
  7: { en: "Mitra Tara", kn: "ಮಿತ್ರ ತಾರಾ", hi: "मित्र तारा", te: "మిత్ర తార", ta: "மித்ர தாரை", isBenefic: true },
  8: { en: "Parama Mitra Tara", kn: "ಪರಮ ಮಿತ್ರ ತಾರಾ", hi: "परम मित्र तारा", te: "పరమ మిత్ర తార", ta: "பரம மித்ர தாரை", isBenefic: true }
};

export const VAARA_VITALITY_L5: Record<number, { en: string; kn: string; hi: string; te: string; ta: string }> = {
  0: {
    en: "Solar radiance, indomitable willpower, and dignified leadership energy",
    kn: "ಸೂರ್ಯನ ಆತ್ಮತೇಜಸ್ಸು, ಅಚಲ ಮನೋಬಲ ಹಾಗೂ ನಾಯಕತ್ವ ಪ್ರಜ್ಞೆ",
    hi: "सूर्य का आत्मतेज, दृढ़ इच्छाशक्ति एवं नैसर्गिक नेतृत्व ऊर्जा",
    te: "సూర్యుని ఆత్మతేజస్సు, స్థిరమైన సంకల్ప బలం మరియు నాయకత్వ శక్తి",
    ta: "சூரியனின் ஆன்ம தேஜஸ், அசைக்க முடியாத மன உறுதி மற்றும் தலைமை ஆற்றல்"
  },
  1: {
    en: "Lunar empathy, intuitive emotional intelligence, and calm mental composure",
    kn: "ಚಂದ್ರನ ಮಾನಸಿಕ ಸಂವೇದನೆ, ಆಳವಾದ ಒಳನೋಟ ಹಾಗೂ ಪ್ರಶಾಂತ ಚಿತ್ತ",
    hi: "चंद्रमा की मानसिक संवेदनशीलता, सहज अंतर्दृष्टि एवं शांत चित्त",
    te: "చంద్రుని మానసిక స్పందన, లోతైన అంతర్దృష్టి మరియు ప్రశాంత మనస్సు",
    ta: "சந்திரனின் உள்ளுணர்வு, ஆழ்ந்த கருணை மற்றும் அமைதியான மனோபாவம்"
  },
  2: {
    en: "Martial courage, executive stamina, and relentless protective drive",
    kn: "ಕುಜನ ಸಾಹಸ ಪ್ರವೃತ್ತಿ, ದೈಹಿಕ ತ್ರಾಣ ಹಾಗೂ ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುವ ಛಲ",
    hi: "मंगल का पराक्रम, कार्यनिष्ठा एवं चुनौतियों से जूझने का दृढ़ संकल्प",
    te: "కుజుని ధైర్య సాహసాలు, శారీరక శక్తి మరియు సవాళ్లను ఎదుర్కొనే పట్టుదల",
    ta: "செவ்வாயின் தீரச் செயல், நிர்வாக வலிமை மற்றும் சவால்களை வெல்லும் உறுதி"
  },
  3: {
    en: "Mercurial eloquence, commercial discernment, and rapid analytical agility",
    kn: "ಬುಧನ ಬುದ್ಧಿಚಾತುರ್ಯ, ವ್ಯಾಪಾರ ಕುಶಲತೆ ಹಾಗೂ ವಾಕ್ಪಟುತ್ವ",
    hi: "बुध का तीक्ष्ण विवेक, व्यापारिक कुशलता एवं वाकपटुता",
    te: "బుధుని బుద్ధికుశలత, వాణిజ్య నైపుణ్యం మరియు సమయస్ఫూర్తిగల సంభాషణ",
    ta: "புதனின் கூர்மையான அறிவுத்திறன், வணிக நுணுக்கம் மற்றும் பேச்சாற்றல்"
  },
  4: {
    en: "Jupiterian wisdom, ethical righteousness, and broad philosophical optimism",
    kn: "ಗುರುವಿನ ದೈವಜ್ಞಾನ, ಸದಾಚಾರ ಸಂಪನ್ನತೆ ಹಾಗೂ ಧಾರ್ಮಿಕ ಮುನ್ನಡೆ",
    hi: "गुरु का आध्यात्मिक ज्ञान, सदाचार एवं दार्शनिक दूरदर्शिता",
    te: "గురువు యొక్క ఆధ్యాత్మిక జ్ఞానం, ధర్మనిష్ఠ మరియు ఉన్నత ఆదర్శాలు",
    ta: "குருவின் மெய்ஞ்ஞானம், அறநெறி வாழ்க்கை மற்றும் உயர்ந்த வழிகாட்டுதல்"
  },
  5: {
    en: "Venusian aesthetic grace, diplomatic tact, and refined cultural taste",
    kn: "ಶುಕ್ರನ ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ, ಕಲಾತ್ಮಕ ಒಲವು ಹಾಗೂ ಸೌಹಾರ್ದಯುತ ನಡವಳಿಕೆ",
    hi: "शुक्र का सौंदर्यबोध, कूटनीतिक समन्वय एवं सुरुचिपूर्ण आकर्षण",
    te: "శుక్రుని సౌందర్య దృష్టి, కళాత్మక అభిరుచి మరియు ఆహ్లాదకరమైన వ్యక్తిత్వం",
    ta: "சுக்கிரனின் கலை நயம், இங்கிதமான அணுகுமுறை மற்றும் கனிவான ஈர்ப்பு"
  },
  6: {
    en: "Saturnine perseverance, methodical discipline, and stoic duty-bound permanence",
    kn: "ಶನಿಯ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲೀನ ಸ್ಥಿರತೆ",
    hi: "शनि का धैर्य, कठोर अनुशासन एवं कर्तव्यनिष्ठ स्थिरता",
    te: "శని యొక్క ఓర్పు, క్రమశిక్షణ మరియు బాధ్యతాయుతమైన కర్తవ్యనిష్ఠ",
    ta: "சனியின் பொறுமை, கடமை உணர்வு மற்றும் விடாமுயற்சியுடன் கூடிய நிலைத்தன்மை"
  }
};

export function getTithiName(tithiNum: number, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  const isShukla = tithiNum <= 15;
  const rem = (tithiNum - 1) % 15;
  const pName = isShukla ? pick(PAKSHA_L5.shukla, baseLang) : pick(PAKSHA_L5.krishna, baseLang);

  if (rem === 14) {
    return isShukla ? pick(PURNIMA_L5, baseLang) : pick(AMAVASYA_L5, baseLang);
  }
  const tObj = TITHI_L5[rem] || TITHI_L5[0];
  return `${pName} ${pick(tObj, baseLang)}`;
}

export function computeJananaPanchanga(
  params: {
    birthDate?: string;
    birthTime?: string;
    moonRashiIndex: number;
    moonNakshatraIndex?: number | null;
    moonPada?: 1 | 2 | 3 | 4;
    natalPlanets?: NatalPlacement[];
  },
  lang: string = "en"
): JananaPanchangaData {
  const baseLang = (lang || "en").split("-")[0];

  // 1. Vaara (Weekday)
  let vaaraIdx = 0;
  if (params.birthDate) {
    try {
      const parts = params.birthDate.split("-");
      if (parts.length === 3) {
        vaaraIdx = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay();
      } else {
        vaaraIdx = new Date(params.birthDate).getDay();
      }
    } catch {
      vaaraIdx = 0;
    }
  }
  const vaaraObj = WEEKDAY_L5[vaaraIdx] || WEEKDAY_L5[0];
  const vaaraLordGraha = VAARA_LORD_GRAHAS[vaaraIdx] || "Sun";
  const vaaraLordName = pick(GRAHA_L5[vaaraLordGraha], baseLang);
  const vaaraVitality = pick(VAARA_VITALITY_L5[vaaraIdx], baseLang);

  // 2. Sun & Moon longitudes
  const natalPlanets = params.natalPlanets || [];
  const sunPlacement = natalPlanets.find(p => p.graha === "Sun");
  const moonPlacement = natalPlanets.find(p => p.graha === "Moon");
  let sunLong = sunPlacement ? (sunPlacement.rashiIndex * 30 + 15) : 30;
  const nakIdx = (params.moonNakshatraIndex !== null && params.moonNakshatraIndex !== undefined && params.moonNakshatraIndex >= 0)
    ? params.moonNakshatraIndex
    : (params.moonRashiIndex * 2);
  let moonLong = moonPlacement ? (moonPlacement.rashiIndex * 30 + 15) : (nakIdx * (360 / 27) + 6);

  if (params.birthDate) {
    try {
      const dtStr = `${params.birthDate}T${params.birthTime || "12:00:00"}Z`;
      const dt = new Date(dtStr);
      if (!isNaN(dt.getTime())) {
        const eph = siderealLongitudes(dt);
        sunLong = eph.sun;
        moonLong = eph.moon;
      }
    } catch {
      // keep fallback
    }
  }

  // 3. Tithi
  const diff = (moonLong - sunLong + 360) % 360;
  const tithiNum = Math.floor(diff / 12) + 1; // 1 to 30
  const paksha: "Shukla" | "Krishna" = tithiNum <= 15 ? "Shukla" : "Krishna";
  const tithiName = getTithiName(tithiNum, baseLang);
  const dagdhaRashiIndices = DAGDHA_RASHIS_BY_TITHI[tithiNum] || [];
  const dagdhaRashiNames = dagdhaRashiIndices.map(idx => pick(RASHI_L5[idx], baseLang));

  // 4. Nakshatra
  const moonNakIdx = Math.max(0, Math.min(26, nakIdx));
  const moonPada = params.moonPada || 1;
  const nakObj = NAKSHATRA_L5[moonNakIdx] || NAKSHATRA_L5[0];
  const nakshatraName = pick(nakObj, baseLang);
  const nakshatraLordGraha = NAKSHATRA_LORD_GRAHAS[moonNakIdx] || "Moon";
  const nakshatraLordName = pick(GRAHA_L5[nakshatraLordGraha], baseLang);

  // 5. 27 Nitya Yogas
  const yogaSum = (sunLong + moonLong) % 360;
  const yogaIdx = Math.floor(yogaSum / (360 / 27)) % 27;
  const yogaObj = YOGA_NAMES_L5[yogaIdx] || YOGA_NAMES_L5[0];
  const yogaName = pick(yogaObj, baseLang);
  const yogaIsAuspicious = yogaObj.isAuspicious;
  const yogaNature = yogaIsAuspicious
    ? (baseLang === "kn" ? "ಶುಭ ಫಲಪ್ರದ ಯೋಗ" : baseLang === "hi" ? "शुभ फलप्रद योग" : baseLang === "te" ? "శుభ యోగం" : baseLang === "ta" ? "சுப யோகம்" : "Auspicious Benefic Yoga")
    : (baseLang === "kn" ? "ಶಾಂತಿ ಅಗತ್ಯವಿರುವ ಯೋಗ" : baseLang === "hi" ? "शांति आवश्यक योग" : baseLang === "te" ? "శాంతి అవసరమైన యోగం" : baseLang === "ta" ? "பரிகாரம் தேவைப்படும் யோகம்" : "Yoga Requiring Remedial Shanti");

  // 6. 11 Karanas
  const halfTithi = Math.floor(diff / 6) % 60;
  let karanaIdx = 0;
  if (halfTithi === 0) {
    karanaIdx = 10; // Kintughna
  } else if (halfTithi >= 57) {
    karanaIdx = halfTithi - 57 + 7; // Shakuni, Chatushpada, Naga
  } else {
    karanaIdx = (halfTithi - 1) % 7;
  }
  const karanaObj = KARANA_NAMES_L5[karanaIdx] || KARANA_NAMES_L5[0];
  const karanaName = pick(karanaObj, baseLang);

  return {
    tithiIndex: tithiNum,
    tithiName,
    paksha,
    dagdhaRashiIndices,
    dagdhaRashiNames,
    vaaraIndex: vaaraIdx,
    vaaraName: pick(vaaraObj, baseLang),
    vaaraLordGraha,
    vaaraLordName,
    vaaraVitality,
    nakshatraIndex: moonNakIdx,
    nakshatraName,
    nakshatraPada: moonPada,
    nakshatraLordGraha,
    nakshatraLordName,
    yogaIndex: yogaIdx,
    yogaName,
    yogaIsAuspicious,
    yogaNature,
    karanaIndex: karanaIdx,
    karanaName,
    karanaType: karanaObj.type,
    isVishtiBhadra: karanaObj.isVishtiBhadra
  };
}

export function computeGocharaPanchanga(
  params: {
    currentDate?: Date;
    moonRashiIndex?: number;
    janmaMoonRashiIndex?: number;
    moonNakshatraIndex?: number | null;
    janmaMoonNakshatraIndex?: number | null;
    transits?: TransitPlacement[];
  },
  lang: string = "en"
): GocharaPanchangaData {
  const baseLang = (lang || "en").split("-")[0];
  const now = params.currentDate || new Date();
  const janmaRashiIndex = params.moonRashiIndex ?? params.janmaMoonRashiIndex ?? 0;

  // 1. Current Vaara
  const vaaraIdx = now.getDay();
  const vaaraObj = WEEKDAY_L5[vaaraIdx] || WEEKDAY_L5[0];
  const vaaraLordGraha = VAARA_LORD_GRAHAS[vaaraIdx] || "Sun";
  const vaaraLordName = pick(GRAHA_L5[vaaraLordGraha], baseLang);

  // 2. Gochara transits
  const transits = params.transits || [];
  const shaniTransit = transits.find(t => t.graha === "Saturn");
  const guruTransit = transits.find(t => t.graha === "Jupiter");

  const shaniHfm = shaniTransit ? shaniTransit.houseFromMoon : 11;
  const guruHfm = guruTransit ? guruTransit.houseFromMoon : 9;

  const isSadeSati = [12, 1, 2].includes(shaniHfm);
  const isAshtamaShani = shaniHfm === 8;
  const isKantakaShani = [4, 7, 10].includes(shaniHfm);
  const isGuruBala = [2, 5, 7, 9, 11].includes(guruHfm);

  // Live astronomical calculation for today's Gochara Panchanga
  let gocharaMoonNakIdx = 0;
  let gocharaMoonRashi = 0;
  let gocharaTithiIdx = 1;
  let yogaIdx = 0;
  let karanaIdx = 0;

  try {
    const eph = siderealLongitudes(now);
    const diff = (eph.moon - eph.sun + 360) % 360;
    gocharaTithiIdx = Math.floor(diff / 12) + 1;
    gocharaMoonNakIdx = Math.floor(eph.moon / (360 / 27)) % 27;
    gocharaMoonRashi = Math.floor(eph.moon / 30) % 12;
    yogaIdx = Math.floor(((eph.sun + eph.moon) % 360) / (360 / 27)) % 27;
    const halfTithi = Math.floor(diff / 6) % 60;
    if (halfTithi === 0) {
      karanaIdx = 10;
    } else if (halfTithi >= 57) {
      karanaIdx = halfTithi - 57 + 7;
    } else {
      karanaIdx = (halfTithi - 1) % 7;
    }
  } catch {
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    gocharaMoonNakIdx = Math.floor((dayOfYear * 13.176) % 27);
    gocharaMoonRashi = Math.floor(gocharaMoonNakIdx / 2.25) % 12;
    gocharaTithiIdx = (Math.floor(dayOfYear * 0.985) % 30) + 1;
    yogaIdx = (gocharaMoonNakIdx + (now.getMonth() * 2)) % 27;
    karanaIdx = (gocharaTithiIdx * 2) % 7;
  }

  const paksha: "Shukla" | "Krishna" = gocharaTithiIdx <= 15 ? "Shukla" : "Krishna";
  const tithiName = getTithiName(gocharaTithiIdx, baseLang);

  const gocharaNakObj = NAKSHATRA_L5[gocharaMoonNakIdx] || NAKSHATRA_L5[0];
  const nakshatraName = pick(gocharaNakObj, baseLang);
  const nakshatraLordGraha = NAKSHATRA_LORD_GRAHAS[gocharaMoonNakIdx] || "Moon";

  const yogaObj = YOGA_NAMES_L5[yogaIdx] || YOGA_NAMES_L5[0];
  const yogaName = pick(yogaObj, baseLang);

  const karanaObj = KARANA_NAMES_L5[karanaIdx] || KARANA_NAMES_L5[0];
  const karanaName = pick(karanaObj, baseLang);

  // 3. Tara Bala
  const janmaNakIdx = (params.moonNakshatraIndex !== null && params.moonNakshatraIndex !== undefined && params.moonNakshatraIndex >= 0)
    ? params.moonNakshatraIndex
    : (params.janmaMoonNakshatraIndex !== null && params.janmaMoonNakshatraIndex !== undefined && params.janmaMoonNakshatraIndex >= 0)
    ? params.janmaMoonNakshatraIndex
    : (janmaRashiIndex * 2);
  const dist = (gocharaMoonNakIdx - janmaNakIdx + 27) % 27;
  const taraIdx = dist % 9;
  const taraObj = TARA_BALA_L5[taraIdx] || TARA_BALA_L5[0];
  const taraName = pick(taraObj, baseLang);
  const isBeneficTara = taraObj.isBenefic;

  const taraDesc = isBeneficTara
    ? (baseLang === "kn" ? "ಅನುಕೂಲಕರ ಶುಭ ತಾರಾಬಲ (ಕಾರ್ಯಸಿದ್ಧಿ ಮತ್ತು ದೈವಬಲ)"
      : baseLang === "hi" ? "अनुकूल शुभ ताराबल (कार्यसिद्धि एवं देवबल)"
      : baseLang === "te" ? "అనుకూల శుభ తారాబలం"
      : baseLang === "ta" ? "அனுகூலமான சுப தாராபலம்"
      : "Auspicious supportive Tara Bala (Goal fruition & divine protection)")
    : (baseLang === "kn" ? "ಎಚ್ಚರಿಕೆ ಅಗತ್ಯವಿರುವ ತಾರಾಬಲ (ಸಹನೆ ಮತ್ತು ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ ಶ್ರೇಷ್ಠ)"
      : baseLang === "hi" ? "सतर्कता आवश्यक ताराबल (धैर्य एवं शांति प्रार्थना श्रेष्ठ)"
      : baseLang === "te" ? "జాగ్రత్త అవసరమైన తారాబలం"
      : baseLang === "ta" ? "கவனம் தேவைப்படும் தாராபலம்"
      : "Sensitive Tara Bala requiring measured patience and prayer");

  // 4. Chandra Bala
  const chandraHouse = ((gocharaMoonRashi - janmaRashiIndex + 12) % 12) + 1;
  const isAuspiciousChandra = [1, 3, 6, 7, 10, 11].includes(chandraHouse);
  const chandraDesc = isAuspiciousChandra
    ? (baseLang === "kn" ? `ಶುಭ ಚಂದ್ರಬಲ (${chandraHouse}ನೇ ಭಾವ - ಮಾನಸಿಕ ಉತ್ಸಾಹ)`
      : baseLang === "hi" ? `शुभ चंद्रबल (${chandraHouse}वां भाव - मानसिक प्रसन्नता)`
      : baseLang === "te" ? `శుభ చంద్రబలం (${chandraHouse}వ స్థానం)`
      : baseLang === "ta" ? `சுப சந்திரபலம் (${chandraHouse}ஆம் இடம்)`
      : `Benefic Chandra Bala (House ${chandraHouse} - Mental clarity & enthusiasm)`)
    : (baseLang === "kn" ? `ಸಾಮಾನ್ಯ ಚಂದ್ರಬಲ (${chandraHouse}ನೇ ಭಾವ - ಶಾಂತಚಿತ್ತದ ಅಗತ್ಯ)`
      : baseLang === "hi" ? `साधारण चंद्रबल (${chandraHouse}वां भाव - संयम आवश्यक)`
      : baseLang === "te" ? `సాధారణ చంద్రబలం (${chandraHouse}వ స్థానం)`
      : baseLang === "ta" ? `சாதாரண சந்திரபலம் (${chandraHouse}ஆம் இடம்)`
      : `Neutral Chandra Bala (House ${chandraHouse} - Inward composure advised)`);

  return {
    tithiIndex: gocharaTithiIdx,
    tithiName,
    paksha,
    vaaraIndex: vaaraIdx,
    vaaraName: pick(vaaraObj, baseLang),
    vaaraLordGraha,
    vaaraLordName,
    nakshatraIndex: gocharaMoonNakIdx,
    nakshatraName,
    nakshatraLordGraha,
    yogaIndex: yogaIdx,
    yogaName,
    karanaIndex: karanaIdx,
    karanaName,
    isVishtiBhadra: karanaObj.isVishtiBhadra,
    taraBala: {
      taraIndex: taraIdx,
      taraName,
      isBenefic: isBeneficTara,
      description: taraDesc
    },
    chandraBala: {
      houseFromMoon: chandraHouse,
      isAuspicious: isAuspiciousChandra,
      description: chandraDesc
    },
    transitSaturnHouseFromMoon: shaniHfm,
    transitJupiterHouseFromMoon: guruHfm,
    isGuruBala,
    isSadeSati,
    isAshtamaShani,
    isKantakaShani
  };
}

/* ------------------------------------------------------------------ *
 * CHAPTER SYNTHESIS ENRICHERS (5 Languages Pure Localized Text)
 * ------------------------------------------------------------------ */

export function getCharacteristicsPanchangaSynthesis(janana: JananaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ನಿಮ್ಮ ಜನನ ಪಂಚಾಂಗದ ಪಂಚಾಂಗ-ಅಂಗಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮ ವಾರವಾದ ${janana.vaaraName} ಮತ್ತು ವಾರಾಧಿಪತಿಯಾದ ${janana.vaaraLordName} ಗ್ರಹವು ನಿಮ್ಮ ಶರೀರಕ್ಕೆ ${janana.vaaraVitality}ಯನ್ನು ಪ್ರಧಾನವಾಗಿ ಧಾರೆ ಎರೆಯುತ್ತದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವಾದ ${janana.nakshatraName} (${janana.nakshatraPada}ನೇ ಪಾದ, ಅಧಿಪತಿ ${janana.nakshatraLordName}) ಮತ್ತು ಜನ್ಮ ಯೋಗವಾದ ${janana.yogaName} (${janana.yogaNature}) ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಸ್ವಾಭಾವಿಕವಾದ ಗೌರವ, ಸತ್ಚಿಂತನೆ ಹಾಗೂ ಧಾರ್ಮಿಕ ಮುನ್ನಡೆಯನ್ನು ನೀಡುತ್ತವೆ.`;
  }
  if (baseLang === "hi") {
    return `आपके जन्म पंचांग के अनुसार, आपका जन्म वार ${janana.vaaraName} और वाराधिपति ${janana.vaaraLordName} आपके शरीर को ${janana.vaaraVitality} प्रदान करते हैं। आपका जन्म नक्षत्र ${janana.nakshatraName} (${janana.nakshatraPada}वां पद, स्वामी ${janana.nakshatraLordName}) एवं जन्म योग ${janana.yogaName} (${janana.yogaNature}) आपके स्वभाव को गरिमामयी, सात्विक एवं आत्मविश्वासी बनाते हैं।`;
  }
  if (baseLang === "te") {
    return `మీ జనన పంచాంగం ప్రకారం, మీ జన్మ వారం ${janana.vaaraName} మరియు వారాధిపతి ${janana.vaaraLordName} మీ శరీరానికి విశేషమైన తేజస్సును మరియు సహజ జీవశక్తిని అందిస్తాయి. మీ జన్మ నక్షత్రం ${janana.nakshatraName} (${janana.nakshatraPada}వ పాదం, అధిపతి ${janana.nakshatraLordName}) మరియు నిత్య యోగం ${janana.yogaName} మీ వ్యక్తిత్వాన్ని గౌరవప్రదంగా మరియు స్థిరచిత్తంతో ముందుకు నడిపిస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `உங்கள் ஜனன பஞ்சாங்க அமைப்பின்படி, நீங்கள் பிறந்த கிழமையான ${janana.vaaraName} மற்றும் அதன் அதிபதியான ${janana.vaaraLordName} உங்கள் உடலுக்கு இயல்பான பிராண ஆற்றலையும் தலைமைப் பண்பையும் தருகின்றன. உங்கள் ஜென்ம நட்சத்திரமான ${janana.nakshatraName} (${janana.nakshatraPada}ஆம் பாதம், அதிபதி ${janana.nakshatraLordName}) மற்றும் நித்ய யோகமான ${janana.yogaName} உங்கள் ஆளுமையை நேர்மையாகவும் மரியாதைக்குரியதாகவும் உருவாக்குகின்றன.`;
  }
  return `According to your Janana Panchanga (natal calendar limbs), your birth weekday of ${janana.vaaraName} governed by ${janana.vaaraLordName} infuses your vital constitution with ${janana.vaaraVitality}. Your birth star ${janana.nakshatraName} (Pada ${janana.nakshatraPada}, ruled by ${janana.nakshatraLordName}) alongside the Nitya Yoga ${janana.yogaName} (${janana.yogaNature}) cultivate innate intellectual dignity, ethical focus, and resilient composure.`;
}

export function getDarkSecretPanchangaSynthesis(janana: JananaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  const dSigns = janana.dagdhaRashiNames.length > 0 ? janana.dagdhaRashiNames.join(", ") : "ಶೂನ್ಯ ರಹಿತ";
  const dSignsHi = janana.dagdhaRashiNames.length > 0 ? janana.dagdhaRashiNames.join(", ") : "दग्ध रहित";
  const dSignsTe = janana.dagdhaRashiNames.length > 0 ? janana.dagdhaRashiNames.join(", ") : "దోష రహితం";
  const dSignsTa = janana.dagdhaRashiNames.length > 0 ? janana.dagdhaRashiNames.join(", ") : "சூன்யமில்லாதவை";
  const dSignsEn = janana.dagdhaRashiNames.length > 0 ? janana.dagdhaRashiNames.join(", ") : "None";

  if (baseLang === "kn") {
    return `ಪಂಚಾಂಗದ ಆಳವಾದ ಗೂಢ ದೃಷ್ಟಿಯಿಂದ, ನಿಮ್ಮ ಜನ್ಮ ತಿಥಿಯಾದ ${janana.tithiName}ಯು ಜಾತಕದಲ್ಲಿ ದಗ್ಧ (ಶೂನ್ಯ) ರಾಶಿಗಳನ್ನು (${dSigns}) ಸೂಚಿಸುತ್ತದೆ. ಈ ರಾಶಿಗಳ ಪ್ರಭಾವ ಮತ್ತು ಜನ್ಮ ಕರಣವಾದ ${janana.karanaName} ನಿಮ್ಮ ಅಂತರಂಗದ ಆಳದಲ್ಲಿ ಭಾವನಾತ್ಮಕ ಒತ್ತಡ, ಸೂಕ್ಷ್ಮ ಅವ್ಯಕ್ತ ಸಂಶಯ ಅಥವಾ ಆಂತರಿಕ ಒಂಟಿತನದ ನೆರಳನ್ನು ಉಂಟುಮಾಡಬಹುದು. ಈ ಕರ್ಮಿಕ ಪ್ರಭಾವವನ್ನು ನಿಯಂತ್ರಿಸಲು ಧ್ಯಾನ ಹಾಗೂ ದೈವಾರಾಧನೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ರಕ್ಷೆಯಾಗಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `पंचांग के गहन ज्योतिषीय विश्लेषण के अनुसार, आपकी जन्म तिथि ${janana.tithiName} से संबंधित दग्ध (शून्य) राशियां (${dSignsHi}) तथा जन्म करण ${janana.karanaName} आपके अवचेतन मन में कभी-कभार भावनात्मक असुरक्षा या आंतरिक एकाकीपन का सूक्ष्म प्रभाव उत्पन्न करते हैं। यह एक कर्मिक संस्कार है जिसे निरंतर साधना और ईश्वर चिंतन से सहज ही संतुलित किया जा सकता है।`;
  }
  if (baseLang === "te") {
    return `పంచాంగ రహస్య విశ్లేషణ ప్రకారం, మీ జన్మ తిథి ${janana.tithiName} కారణంగా ఏర్పడే దగ్ధ (శూన్య) రాశులు (${dSignsTe}) మరియు జన్మ కరణం ${janana.karanaName} మీ అంతరంగంలో మానసిక ఆందోళనలను లేదా అభద్రతా భావాన్ని కలిగించవచ్చు. ఈ కర్మియా ప్రభావాన్ని అధిగమించడానికి నిత్య ధ్యానం మరియు ఆధ్యాత్మిక చింతన గొప్ప రక్షగా నిలుస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `பஞ்சாங்க சூட்சும விதிகளின்படி, உங்கள் ஜென்ம திதியான ${janana.tithiName} குறிக்கும் சூன்ய ராசிகள் (${dSignsTa}) மற்றும் ஜென்ம கரணமான ${janana.karanaName} உங்கள் ஆழ்மனதில் அவ்வப்போது மறைமுகமான கவலைகளையும் தனிமை உணர்வையும் தோற்றுவிக்கலாம். இந்த கர்ம வினையை சமநிலைப்படுத்த தியானமும் வழிபாடும் சிறந்த அருமருந்தாகும்.`;
  }
  return `From an esoteric Panchanga standpoint, your birth Tithi of ${janana.tithiName} generates specific Dagdha (void) signs (${dSignsEn}), which alongside your birth Karana ${janana.karanaName} create subtle subterranean emotional anxieties or lingering fears of vulnerability in moments of high stress. Recognizing this as an ancestral karmic imprint rather than an external obstacle allows conscious self-mastery through contemplative prayer.`;
}

export function getCurrentPhasePanchangaSynthesis(gochara: GocharaPanchangaData, dashaSummary: string, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  const guruStatusKn = gochara.isGuruBala ? "ಅನುಕೂಲಕರ ಗುರುಬಲ ಲಭ್ಯವಿದ್ದು ದೈವಿಕ ಆಶೀರ್ವಾದವಿದೆ" : "ಗುರುಬಲ ಸಾಧಾರಣವಾಗಿದ್ದು ಗುರು ಪೂಜೆ ಶ್ರೇಷ್ಠವಾಗಿದೆ";
  const guruStatusHi = gochara.isGuruBala ? "अनुकूल गुरुबल प्राप्त है जो दैवीय कृपा प्रदान करता है" : "गुरुबल सामान्य है और गुरु उपासना हितकर है";
  const guruStatusTe = gochara.isGuruBala ? "అనుకూల గురుబలం లభిస్తోంది" : "గురుబలం సాధారణంగా ఉంది";
  const guruStatusTa = gochara.isGuruBala ? "அனுகூலமான குருபலம் உள்ளதால் தெய்வ அருள் உண்டு" : "குருபலம் சாதாரணமாக உள்ளது";
  const guruStatusEn = gochara.isGuruBala ? "Benefic Guru Bala (Jupiterian grace) is actively blessing you" : "Guru Bala is neutral, counseling dedicated Brihaspati prayer";

  if (baseLang === "kn") {
    return `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaSummary} ಕಾಲದಲ್ಲಿ, ಇಂದಿನ ಗೋಚಾರ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ${gochara.tithiName}, ವಾರ ${gochara.vaaraName} ಹಾಗೂ ಚಂದ್ರ ನಕ್ಷತ್ರ ${gochara.nakshatraName} ಪ್ರಭಾವವಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ಇಂದಿನ ನಕ್ಷತ್ರವು ${gochara.taraBala.taraName} ಆಗಿದ್ದು, ${gochara.taraBala.description} ನೀಡುತ್ತದೆ. ${gochara.chandraBala.description} ಹಾಗೂ ಗೋಚಾರದಲ್ಲಿ ${guruStatusKn}. ಈ ಗ್ರಹಗಳ ಸಂಚಾರವು ನಿಮ್ಮ ದೈನಂದಿನ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಧೈರ್ಯ ಮತ್ತು ವಿವೇಕವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `वर्तमान ${dashaSummary} कालखंड में, आज के गोचर पंचांग अनुसार ${gochara.tithiName}, वार ${gochara.vaaraName} एवं चंद्रमा का ${gochara.nakshatraName} नक्षत्र में संचरण प्रभावी है। आपके जन्म नक्षत्र से आज का नक्षत्र ${gochara.taraBala.taraName} है, जो ${gochara.taraBala.description} करता है। ${gochara.chandraBala.description} तथा गोचर में ${guruStatusHi}। यह कालखंड संयम और कार्ययोजना से लक्ष्य प्राप्ति के लिए उत्तम है।`;
  }
  if (baseLang === "te") {
    return `ప్రస్తుత ${dashaSummary} సమయంలో, నేటి గోచార పంచాంగం ప్రకారం ${gochara.tithiName}, వారం ${gochara.vaaraName} మరియు చంద్ర నక్షత్రం ${gochara.nakshatraName} ప్రభావం చూపుతున్నాయి. మీ జన్మ నక్షత్రానికి నేటి నక్షత్రం ${gochara.taraBala.taraName} గా ఉండి, ${gochara.taraBala.description} అందిస్తోంది. ${gochara.chandraBala.description} మరియు గోచారంలో ${guruStatusTe}।`;
  }
  if (baseLang === "ta") {
    return `தற்போதைய ${dashaSummary} காலத்தில், இன்றைய கோச்சார பஞ்சாங்கப்படி ${gochara.tithiName}, கிழமை ${gochara.vaaraName} மற்றும் சந்திரன் ${gochara.nakshatraName} நட்சத்திரத்தில் சஞ்சரிக்கிறார். உங்கள் ஜென்ம நட்சத்திரத்திற்கு இது ${gochara.taraBala.taraName} ஆக விளங்கி, ${gochara.taraBala.description} தருகிறது. ${gochara.chandraBala.description} மற்றும் கோச்சாரத்தில் ${guruStatusTa}.`;
  }
  return `Under your running ${dashaSummary} timeline, today's Gochara Panchanga features ${gochara.tithiName}, ${gochara.vaaraName}, and Moon transiting ${gochara.nakshatraName}. Measured from your natal star, this transit forms ${gochara.taraBala.taraName}, delivering ${gochara.taraBala.description}. Concurrently, ${gochara.chandraBala.description} operates, and in planetary transits, ${guruStatusEn}. Aligning important initiatives with these celestial cycles ensures steady advancement.`;
}

export function getMarriagePanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, status: string, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  const guruAspectKn = gochara.isGuruBala ? "ಗೋಚಾರದಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ದೃಷ್ಟಿಯು ದಾಂಪತ್ಯದಲ್ಲಿ ನೆಮ್ಮದಿ ಹಾಗೂ ಸೌಹಾರ್ದತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತಿದೆ" : "ಗೋಚಾರದಲ್ಲಿ ದೇವಗುರುವಿನ ಅನುಗ್ರಹಕ್ಕಾಗಿ ನಿತ್ಯ ಪ್ರಾರ್ಥನೆ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕಾಪಾಡುತ್ತದೆ";
  const guruAspectHi = gochara.isGuruBala ? "गोचर में देवगुरु बृहस्पति की शुभ दृष्टि दांपत्य में सुख एवं सौहार्द में वृद्धि कर रही है" : "गोचर में देवगुरु की शांति हेतु प्रार्थना पारिवारिक सामंजस्य की रक्षा करेगी";
  const guruAspectTe = gochara.isGuruBala ? "గోచారంలో గురు గ్రహ అనుగ్రహం దాంపత్యంలో సంతోషాన్ని మరియు ప్రశాంతతను పెంచుతోంది" : "గోచారంలో గురు ఆరాధన కుటుంబ శాంతికి తోడ్పడుతుంది";
  const guruAspectTa = gochara.isGuruBala ? "கோச்சாரத்தில் குரு பகவானின் சுப பார்வை இல்லறத்தில் அமைதியையும் மகிழ்ச்சியையும் பெருக்குகிறது" : "கோச்சாரத்தில் குரு வழிபாடு குடும்ப அமைதியைப் பாதுகாக்கும்";
  const guruAspectEn = gochara.isGuruBala ? "In planetary transits, Jupiter's auspicious alignment infuses marital bonds with mutual reverence and understanding" : "Harmonizing Jupiterian transit energies through quiet devotional prayer protects domestic equilibrium";

  if (baseLang === "kn") {
    return `ವೈದಿಕ ಪಂಚಾಂಗದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮ ತಿಥಿಯಾದ ${janana.tithiName} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರದ ಮೈತ್ರಿ ಬಲವು ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಧರ್ಮ ಸಹಚಾರ್ಯ ಹಾಗೂ ಮಾನಸಿಕ ಸಮನ್ವಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಸಹಕಾರಿಯಾಗಿದೆ. ${guruAspectKn}. ಜನ್ಮ ಕುಂಡಲಿಯ ಸಪ್ತಮ ಭಾವದ ಸ್ಥಿತಿ ಹಾಗೂ ಪಂಚಾಂಗದ ಅನುಕೂಲತೆಯು ದಾಂಪತ್ಯ ಸಂಬಂಧವನ್ನು ದೀರ್ಘಕಾಲಿಕವಾಗಿ ಭದ್ರಪಡಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `वैदिक पंचांग के अनुसार, आपकी जन्म तिथि ${janana.tithiName} और जन्म नक्षत्र की अनुकूलता दांपत्य जीवन में भावनात्मक सामंजस्य और पारस्परिक आदर को सशक्त बनाती है। ${guruAspectHi}। कुंडली के सप्तम भाव और पंचांगीय शुभता का यह योग वैवाहिक संबंधों में दीर्घकालिक स्थायित्व प्रदान करता है।`;
  }
  if (baseLang === "te") {
    return `వైదిక పంచాంగం ప్రకారం, మీ జన్మ తిథి ${janana.tithiName} మరియు జన్మ నక్షత్ర బలం దాంపత్య జీవితంలో పరస్పర అవగాహనను మరియు ప్రేమను పెంచుతాయి. ${guruAspectTe}। ఏడవ ఇల్లు మరియు పంచాంగ అనుకూలత వైవాహిక బంధాన్ని సుస్థిరం చేస్తాయి.`;
  }
  if (baseLang === "ta") {
    return `வேத பஞ்சாங்க விதிகளின்படி, உங்கள் ஜென்ம திதியான ${janana.tithiName} மற்றும் ஜென்ம நட்சத்திர அமைப்பு இல்லற வாழ்வில் பரஸ்பர அன்பையும் விட்டுக் கொடுக்கும் மனப்பான்மையையும் வளர்க்கிறது. ${guruAspectTa}. 7-ம் பாவகமும் பஞ்சாங்க சுப பலமும் குடும்ப வாழ்வை மகிழ்ச்சியாக மாற்றும்.`;
  }
  return `Under classical Vedic Panchanga laws, your natal Tithi of ${janana.tithiName} and birth star alignment govern interpersonal compatibility and empathetic communication. ${guruAspectEn}. The convergence of 7th house dynamics with these calendar harmonics anchors enduring partnership harmony.`;
}

export function getChildrenPanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, status: string, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  const yogaNoteKn = janana.yogaIsAuspicious ? `ನಿಮ್ಮ ಜನ್ಮ ಯೋಗವಾದ ${janana.yogaName}ವು ಸಂತಾನದ ಸದ್ಬುದ್ಧಿ, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ವಂಶ ಗೌರವವನ್ನು ಸಂರಕ್ಷಿಸುವ ಶುಭ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ` : `ನಿಮ್ಮ ಜನ್ಮ ಯೋಗವಾದ ${janana.yogaName}ದ ಪ್ರಭಾವದಿಂದ ಸಂತಾನದ ಶ್ರೇಯಸ್ಸಿಗಾಗಿ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಾಗಾರಾಧನೆ ಹಾಗೂ ಪ್ರಾರ್ಥನೆ ಶ್ರೇಷ್ಠ`;
  const yogaNoteHi = janana.yogaIsAuspicious ? `आपका जन्म योग ${janana.yogaName} संतान के सद्बुद्धि, संस्कार एवं वंश की प्रतिष्ठा को बढ़ाने वाला है` : `आपके जन्म योग ${janana.yogaName} के प्रभाव से संतान के कल्याणार्थ नियमित पूजा-अर्चना शुभ फल देगी`;
  const yogaNoteTe = janana.yogaIsAuspicious ? `మీ జన్మ యోగం ${janana.yogaName} పిల్లల విద్యాబుద్ధులకు మరియు వంశాభివృద్ధికి ఎంతో అనుకూలమైనది` : `మీ జన్మ యోగం ${janana.yogaName} ప్రభావం వల్ల పిల్లల క్షేమం కొరకు ప్రత్యేక ప్రార్థనలు మంచివి`;
  const yogaNoteTa = janana.yogaIsAuspicious ? `உங்கள் ஜென்ம யோகமான ${janana.yogaName} குழந்தைகளின் நற்பண்புகளையும் கல்வியறிவையும் உயர்த்தும் சுப பலம் கொண்டது` : `உங்கள் ஜென்ம யோகமான ${janana.yogaName} அமைப்பிற்கு குழந்தைகளின் நல்வாழ்விற்காக பிரார்த்தனை செய்வது நலம்`;
  const yogaNoteEn = janana.yogaIsAuspicious ? `Your natal Nitya Yoga ${janana.yogaName} channels natural parental blessings, safeguarding children's intellect and moral character` : `Your natal Nitya Yoga ${janana.yogaName} counsels dedicated spiritual prayers to fortify the lineage and children's welfare`;

  if (baseLang === "kn") {
    return `ಪಂಚಾಂಗ ಸಂರಚನೆಯಲ್ಲಿ ಪಂಚಮ ಭಾವ ಮತ್ತು ಪುತ್ರಕಾರಕ ಗುರುವಿನ ಜೊತೆಗೆ, ${yogaNoteKn}. ಜನ್ಮ ತಿಥಿಯಾದ ${janana.tithiName}ಯ ಪಾವಿತ್ರ್ಯತೆಯು ಕುಟುಂಬದಲ್ಲಿ ಧರ್ಮಪಾಲನೆ ಹಾಗೂ ಮುಂದಿನ ಪೀಳಿಗೆಗೆ ಉನ್ನತ ಸಂಸ್ಕಾರಗಳನ್ನು ಧಾರೆ ಎರೆಯಲು ದೈವಿಕ ಬಲವನ್ನು ಒದಗಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `पंचांग संरचना में पंचम भाव एवं पुत्रकारक गुरु के अतिरिक्त, ${yogaNoteHi}। जन्म तिथि ${janana.tithiName} का प्रभाव परिवार में शुभ संस्कारों के पोषण और भावी पीढ़ी को धर्मपरायण बनाने में सहायक सिद्ध होता है।`;
  }
  if (baseLang === "te") {
    return `పంచాంగ నిర్మాణంలో 5వ ఇల్లు మరియు పుత్రకారక గురువుతో పాటు, ${yogaNoteTe}। జన్మ తిథి ${janana.tithiName} కుటుంబంలో నైతిక విలువలను కాపాడటానికి బలాన్నిస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `பஞ்சாங்க அமைப்பில் 5-ம் பாவகம் மற்றும் புத்திரகாரகன் குருவுடன், ${yogaNoteTa}. ஜென்ம திதியான ${janana.tithiName} குடும்பத்தில் பாரம்பரிய விழுமியங்களையும் நற்பண்புகளையும் தழைக்கச் செய்யும்.`;
  }
  return `Within Panchanga mechanics alongside the 5th house and Putrakaraka Jupiter, ${yogaNoteEn}. The auspicious vibration of your natal Tithi ${janana.tithiName} supports the ethical transmission of family virtues across generations.`;
}

export function getCareerPanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ಪಂಚಾಂಗದ ಕಾರ್ಯಕ್ಷೇತ್ರ ತತ್ವದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮ ವಾರಾಧಿಪತಿಯಾದ ${janana.vaaraLordName} ಗ್ರಹವು ವೃತ್ತಿರಂಗದಲ್ಲಿ ನಿರ್ಣಾಯಕ ಕಾರ್ಯಶಕ್ತಿ ಮತ್ತು ನಾಯಕತ್ವವನ್ನು ರೂಪಿಸುತ್ತದೆ. ಜನ್ಮ ಕರಣವಾದ ${janana.karanaName} ನಿಮ್ಮ ದೈನಂದಿನ ವ್ಯಾಪಾರ ಹಾಗೂ ಉದ್ಯೋಗ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಅಪಾರ ತಾಳ್ಮೆ ಮತ್ತು ಕಾರ್ಯಕುಶಲತೆಯನ್ನು ನೀಡುತ್ತದೆ. ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ಸಂಚಾರವು ನಿಮ್ಮ ದೀರ್ಘಕಾಲೀನ ವೃತ್ತಿಪರ ಪ್ರಯತ್ನಗಳಿಗೆ ತಕ್ಕ ಫಲವನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `पंचांग के कार्यक्षेत्र सिद्धांत के अनुसार, आपके जन्म वाराधिपति ${janana.vaaraLordName} आपके करियर में निर्णय लेने की अचूक क्षमता और नेतृत्व क्षमता का निर्माण करते हैं। आपका जन्म करण ${janana.karanaName} दैनिक व्यावसायिक दायित्वों में गहन धैर्य और कार्यकुशलता प्रदान करता है। वर्तमान गोचर में गुरु-शनि का प्रभाव आपकी व्यावसायिक प्रगति को स्थिरता देगा।`;
  }
  if (baseLang === "te") {
    return `పంచాంగ కార్యక్షేత్ర నియమాల ప్రకారం, మీ జన్మ వారాధిపతి ${janana.vaaraLordName} ఉద్యోగ రంగంలో సరైన నిర్ణయాలు తీసుకునే నాయకత్వ శక్తిని అందిస్తున్నారు. మీ జన్మ కరణం ${janana.karanaName} వ్యాపార మరియు వృత్తి పనుల్లో విశేష నైపుణ్యాన్ని ఇస్తుంది. ప్రస్తుత గోచారంలో గురు, శని సంచారం వృత్తి స్థిరత్వాన్ని చేకూరుస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `பஞ்சாங்க தொழில் விதிகளின்படி, உங்கள் ஜென்ம கிழமை அதிபதியான ${janana.vaaraLordName} பணியிடத்தில் துணிச்சலான முடிவுகளையும் தலைமைப் பொறுப்பையும் தருகிறார். ஜென்ம கரணமான ${janana.karanaName} தொழில் ரீதியான விடாமுயற்சியையும் திறமையையும் வழங்குகிறது. கோச்சார குரு மற்றும் சனியின் பார்வை பணி உயர்வை உறுதி செய்யும்.`;
  }
  return `According to Vedic Panchanga vocational doctrine, your birth weekday ruler ${janana.vaaraLordName} governs your professional initiative and executive stamina. Your natal Karana ${janana.karanaName} bestows operational endurance and commercial execution acumen in daily responsibilities, while planetary transits of Saturn and Jupiter steady your career trajectory.`;
}

export function getWealthPanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ಪಂಚಾಂಗದ ಧನಲಕ್ಷ್ಮೀ ತತ್ವದ ಪ್ರಕಾರ, ನಿಮ್ಮ ಜನ್ಮ ತಿಥಿಯಾದ ${janana.tithiName}ಯು ಧನಾಗಮನದಲ್ಲಿ ಶ್ರೀ-ಕಾರಕ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ಸಂಪತ್-ತಾರಾ ನಕ್ಷತ್ರಗಳ ಅನುಕೂಲಕರ ಸಂಪರ್ಕವು ಧನ ಸಂಗ್ರಹ, ಭೂಮಿ-ಆಸ್ತಿ ಗಳಿಕೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಬಲಪಡಿಸುತ್ತದೆ. ಗೋಚಾರದಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಬೆಂಬಲವು ನಿಮ್ಮ ಆರ್ಥಿಕ ಹೂಡಿಕೆಗಳಿಗೆ ಸುರಕ್ಷತೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `पंचांग के धनलक्ष्मी सिद्धांत अनुसार, आपकी जन्म तिथि ${janana.tithiName} धन प्रवाह में विशेष श्री-कारक ऊर्जा रखती है। आपके जन्म नक्षत्र से संपत-तारा का संबंध धन संचय, संपत्ति निर्माण और वित्तीय सुरक्षा को सशक्त करता है। गोचर में शुभ ग्रहों की अनुकूलता आपके आर्थिक निर्णयों को फलदायी बनाएगी।`;
  }
  if (baseLang === "te") {
    return `పంచాంగ ధనలక్ష్మి సూత్రం ప్రకారం, మీ జన్మ తిథి ${janana.tithiName} ఆర్థిక వనరుల సమకూర్పులో విశేష శక్తిని కలిగి ఉంది. మీ జన్మ నక్షత్రానికి సంపత్-తార అనుకూలత ధన సంపదను, ఆస్తిపాస్తుల పెరుగుదలను బలపరుస్తుంది. గోచారంలో గ్రహాల మద్దతు ఆర్థిక స్థిరత్వాన్ని ఇస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `பஞ்சாங்க தனலட்சுமி விதிகளின்படி, உங்கள் ஜென்ம திதியான ${janana.tithiName} பணவரவில் சிறப்பான ஸ்ரீ-காரக பலத்தைக் கொண்டுள்ளது. ஜென்ம நட்சத்திரத்திற்குரிய சம்பத்-தாரை அமைப்பு நிதிப் பாதுகாப்பு, சொத்துச் சேர்க்கை மற்றும் சேமிப்பை உயர்த்தும். கோச்சார சுப கிரகங்கள் பொருளாதார வளர்ச்சியைத் தரும்.`;
  }
  return `Under Vedic Panchanga financial principles, your birth Tithi ${janana.tithiName} anchors the Sri (prosperity) current in your chart. The resonant connection to your Sampat Tara nakshatra stream promotes asset accumulation and liquidity preservation, while current planetary transits safeguard your financial foundations.`;
}

export function getHealthPanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ಆರೋಗ್ಯ ರಕ್ಷಣೆಯಲ್ಲಿ ಪಂಚಾಂಗದ ವಾರ ಮತ್ತು ಯೋಗಗಳು ಮಹತ್ವದ ಪಾತ್ರ ವಹಿಸುತ್ತವೆ. ನಿಮ್ಮ ಜನ್ಮ ವಾರಾಧಿಪತಿಯಾದ ${janana.vaaraLordName} ಶಾರೀರಿಕ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಗೆ ಕಾರಣನಾಗಿದ್ದರೆ, ಜನ್ಮ ಯೋಗವಾದ ${janana.yogaName} ನಿಮ್ಮ ಆಯುಷ್ಯ ಹಾಗೂ ಚೈತನ್ಯವನ್ನು ಸಂರಕ್ಷಿಸುತ್ತದೆ. ಕಾಲಕಾಲಕ್ಕೆ ಋತುಮಾನಕ್ಕೆ ತಕ್ಕ ಆಹಾರ ಪದ್ಧತಿ ಹಾಗೂ ಪ್ರಾಣಾಯಾಮವನ್ನು ಪಾಲಿಸುವುದು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಪೂರಕವಾಗಿದೆ.`;
  }
  if (baseLang === "hi") {
    return `स्वास्थ्य रक्षा में पंचांग के वार और योग का गहरा महत्व है। आपके जन्म वाराधिपति ${janana.vaaraLordName} शारीरिक रोग प्रतिरोधक क्षमता को नियंत्रित करते हैं, जबकि जन्म योग ${janana.yogaName} दीर्घायु एवं जीवन ऊर्जा का पोषण करता है। ऋतु अनुसार संतुलित आहार और दैनिक प्राणायाम का अभ्यास पूर्ण आरोग्य प्रदान करेगा।`;
  }
  if (baseLang === "te") {
    return `ఆరోగ్య రక్షణలో పంచాంగం ప్రముఖ పాత్ర పోషిస్తుంది. మీ జన్మ వారాధిపతి ${janana.vaaraLordName} శారీరక రోగనిరోధక శక్తిని పెంచితే, జన్మ యోగం ${janana.yogaName} ఆయురారోగ్యాలను కాపాడుతుంది. నిత్యం ప్రాణాయామం మరియు సత్వర ఆహార నియమాలు పాటించడం శ్రేయస్కరం.`;
  }
  if (baseLang === "ta") {
    return `உடல் நலனில் பஞ்சாங்க கிழமையும் யோகமும் முக்கிய பங்கு வகிக்கின்றன. உங்கள் ஜென்ம கிழமை அதிபதி ${janana.vaaraLordName} நோய் எதிர்ப்பு சக்தியைத் தர, ஜென்ம யோகமான ${janana.yogaName} உங்கள் ஆயுளையும் ஆரோக்கியத்தையும் பாதுகாக்கிறது. முறையான உணவுப் பழக்கமும் மூச்சுப் பயிற்சியும் நீண்ட ஆயுளைத் தரும்.`;
  }
  return `In Vedic medical astrology, the weekday ruler ${janana.vaaraLordName} governs prana distribution and physiological immunity, while your natal Nitya Yoga ${janana.yogaName} regulates constitutional stamina and longevity. Synchronizing daily habits with these natural rhythms promotes robust vitality.`;
}

export function getGocharaPanchangaSynthesis(gochara: GocharaPanchangaData, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ಇಂದಿನ ಗೋಚಾರ ಪಂಚಾಂಗದಲ್ಲಿ ${gochara.tithiName}, ವಾರ ${gochara.vaaraName} (ವಾರಾಧಿಪತಿ ${gochara.vaaraLordName}), ನಕ್ಷತ್ರ ${gochara.nakshatraName}, ಯೋಗ ${gochara.yogaName} ಹಾಗೂ ಕರಣ ${gochara.karanaName} ಪ್ರಚಲಿತವಾಗಿವೆ. ನಿಮ್ಮ ಜಾತಕಕ್ಕೆ ಇಂದಿನ ತಾರಾಬಲವು ${gochara.taraBala.taraName} ಆಗಿದ್ದು, ${gochara.taraBala.description} ಒದಗಿಸುತ್ತದೆ. ${gochara.chandraBala.description} ಹಾಗೂ ಗೋಚಾರ ಶನಿ-ಗುರುಗಳ ಸಾಗಣೆಯು ಕರ್ಮಿಕ ಪಕ್ವತೆಯನ್ನು ನಿರ್ದೇಶಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `आज के गोचर पंचांग में ${gochara.tithiName}, वार ${gochara.vaaraName} (स्वामी ${gochara.vaaraLordName}), नक्षत्र ${gochara.nakshatraName}, योग ${gochara.yogaName} एवं करण ${gochara.karanaName} गतिशील हैं। आपकी कुंडली के लिए आज का ताराबल ${gochara.taraBala.taraName} है, जो ${gochara.taraBala.description} करता है। ${gochara.chandraBala.description} के साथ गोचर ग्रह आपकी दिशा निर्धारित करते हैं।`;
  }
  if (baseLang === "te") {
    return `నేటి గోచార పంచాంగంలో ${gochara.tithiName}, వారం ${gochara.vaaraName} (అధిపతి ${gochara.vaaraLordName}), నక్షత్రం ${gochara.nakshatraName}, యోగం ${gochara.yogaName} మరియు కరణం ${gochara.karanaName} నడుస్తున్నాయి. మీ జాతకానికి నేటి తారాబలం ${gochara.taraBala.taraName} గా ఉండి, ${gochara.taraBala.description} ఇస్తోంది. ${gochara.chandraBala.description} తో పాటు గ్రహ సంచారం అనుకూలంగా ఉంది.`;
  }
  if (baseLang === "ta") {
    return `இன்றைய கோச்சார பஞ்சாங்கத்தில் ${gochara.tithiName}, கிழமை ${gochara.vaaraName} (அதிபதி ${gochara.vaaraLordName}), நட்சத்திரம் ${gochara.nakshatraName}, யோகம் ${gochara.yogaName} மற்றும் கரணம் ${gochara.karanaName} நிலவுகின்றன. உங்கள் ஜாதகத்திற்கு இன்றைய தாராபலம் ${gochara.taraBala.taraName} ஆக அமைந்து, ${gochara.taraBala.description} தருகிறது. ${gochara.chandraBala.description} இயங்குகிறது.`;
  }
  return `Under active Gochara Panchanga dynamics, the current celestial window features ${gochara.tithiName}, ${gochara.vaaraName} (ruled by ${gochara.vaaraLordName}), Moon in ${gochara.nakshatraName}, Nitya Yoga ${gochara.yogaName}, and Karana ${gochara.karanaName}. In relationship to your natal star, the operating Tara Bala is ${gochara.taraBala.taraName}, providing ${gochara.taraBala.description}. Concurrently, ${gochara.chandraBala.description} channels focused mental clarity.`;
}

export function getSummaryPanchangaSynthesis(janana: JananaPanchangaData, gochara: GocharaPanchangaData, dashaSummary: string, lang: string): string {
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "kn") {
    return `ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಸಂಶ್ಲೇಷಣೆಯಂತೆ, ನಿಮ್ಮ ಜನನ ಕುಂಡಲಿಯ ಲಗ್ನ-ರಾಶಿ, ಜನನ ಪಂಚಾಂಗದ ಪಂಚಾಂಗ-ಅಂಗಗಳು (${janana.tithiName}, ${janana.vaaraName}, ${janana.nakshatraName}), ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ${dashaSummary} ದಶಾ ಕಾಲಘಟ್ಟ ಹಾಗೂ ಗೋಚಾರದ ಗುರು-ಶನಿಗಳ ಸಾಗಣೆಯು ಪರಸ್ಪರ ಪೂರಕವಾಗಿವೆ. ಸಕಲ ವಿಘ್ನಗಳ ನಿವಾರಣೆಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಗೆ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ ಸದಾ ಧರ್ಮಮಾರ್ಗದಲ್ಲಿ ಮುನ್ನಡೆಯುವುದು ಪರಿಪೂರ್ಣ ಯಶಸ್ಸು ಮತ್ತು ಶಾಂತಿಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.`;
  }
  if (baseLang === "hi") {
    return `समग्र ज्योतिषीय समन्वय के अनुसार, आपकी जन्म कुंडली का लग्न-राशि, जन्म पंचांग के अंग (${janana.tithiName}, ${janana.vaaraName}, ${janana.nakshatraName}), वर्तमान ${dashaSummary} महादशा एवं गोचर में गुरु-शनि की गति एक दूसरे के पूरक हैं। समस्त विघ्नों की शांति हेतु श्री क्षेत्र गोकर्ण महाबलेश्वर की आराधना करते हुए धर्ममार्ग पर अग्रसर रहना पूर्ण सुख और शांति प्रदान करेगा।`;
  }
  if (baseLang === "te") {
    return `సమగ్ర జ్యోతిష విశ్లేషణ ప్రకారం, మీ జన్మ కుండలి లగ్నం, జన్మ పంచాంగం (${janana.tithiName}, ${janana.vaaraName}, ${janana.nakshatraName}), ప్రస్తుత ${dashaSummary} కాలం మరియు గోచార గ్రహ స్థితులు పరస్పరం అనుకూలంగా ఉన్నాయి. సర్వ విఘ్నాలు తొలగిపోవడానికి శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర పూజ చేయడం మరియు ధర్మమార్గంలో నడవడం సంపూర్ణ విజయాన్ని చేకూరుస్తుంది.`;
  }
  if (baseLang === "ta") {
    return `முழுமையான ஜோதிட ஆய்வுப்படி, உங்கள் ஜென்ம லக்னம், ஜென்ம பஞ்சாங்கம் (${janana.tithiName}, ${janana.vaaraName}, ${janana.nakshatraName}), தற்போதைய ${dashaSummary} தசா காலம் மற்றும் கோச்சார கிரக நிலைகள் ஒன்றோடொன்று இணக்கமாக உள்ளன. தடைகள் நீங்கி வெற்றி பெற ஸ்ரீ கோகர்ணம் மகாபலேஸ்வரர் வழிபாடு செய்து தர்ம வழியில் நடப்பது நன்மைகளைத் தரும்.`;
  }
  return `Synthesizing your complete Vedic astrological architecture, your natal Lagna and Moon sign, Janana Panchanga limbs (${janana.tithiName}, ${janana.vaaraName}, ${janana.nakshatraName}), running ${dashaSummary} timeline, and live planetary transits converge in mutual harmony. Anchoring your daily conduct in integrity and seeking divine blessings at sanctified pilgrimage centers like Sri Kshetra Gokarna Mahabaleshwara ensures enduring peace, spiritual elevation, and comprehensive prosperity.`;
}

