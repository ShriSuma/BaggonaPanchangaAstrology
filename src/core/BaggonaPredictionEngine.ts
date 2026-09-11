import type { KundliOutput, PlanetName, Rashi } from "./AstroTypes";
import { PlanetName as PN, RASHIS } from "./AstroTypes";
import type { TraditionalBaggonaPanchanga } from "./TraditionalBaggonaEngine";
import { translateTexts } from "../services/translationService";
import { generateBhuktiTimeline } from "./DashaBhuktiEngine";
import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToRashi } from "./AstroMath";
import { planetHouseScore, houseLordPlacementScore, lordOfHouse } from "./ChartPredictionKnowledge";
import { signLord } from "./KundliInsightsEngine";

export interface BaggonaPredictionSection {
  title: string;
  description: string;
  score?: number;
  status?: "positive" | "neutral" | "caution";
  whatIsGood?: string;
  whatIsWrong?: string;
  remedy?: string;
  worstPlanet?: string;
  houseLord?: string;
  occupants?: string;
}

export interface BaggonaPredictions {
  overview: BaggonaPredictionSection[];
  planets: BaggonaPredictionSection[];
  houses: BaggonaPredictionSection[];
  yogas: BaggonaPredictionSection[];
  longevity: BaggonaPredictionSection[];
  doshas: BaggonaPredictionSection[];
}

export interface PersonalReadingSection {
  title: string;
  description: string;
}

export interface PersonalReadingOutput {
  cosmicProfile: PersonalReadingSection[];
  todaysTransits: PersonalReadingSection[];
  currentLifeChapter: {
    cycle: string;
    description: string;
    activeUntilAge: string;
  };
  upcomingChapters: {
    chapter1: {
      cycle: string;
      ages: string;
      description: string;
    };
    chapter2: {
      cycle: string;
      ages: string;
      description: string;
    };
  };
  monthlySummary?: PersonalReadingSection[];
  progenyAnalysis?: {
    status: string;
    details: string;
  };
}

// 1. Planetary Exaltation / Debilitation details
export const EXALTATION_SIGNS: Record<PlanetName, number> = {
  [PN.Sun]: 0,        // Mesha (Aries)
  [PN.Moon]: 1,       // Vrishabha (Taurus)
  [PN.Mars]: 9,       // Makara (Capricorn)
  [PN.Mercury]: 5,    // Kanya (Virgo)
  [PN.Jupiter]: 3,    // Karka (Cancer)
  [PN.Venus]: 11,     // Meena (Pisces)
  [PN.Saturn]: 6,     // Tula (Libra)
  [PN.Rahu]: 1,       // Vrishabha
  [PN.Ketu]: 7        // Vrischika
};

export const DEBILITATION_SIGNS: Record<PlanetName, number> = {
  [PN.Sun]: 6,        // Tula (Libra)
  [PN.Moon]: 7,       // Vrischika (Scorpio)
  [PN.Mars]: 3,       // Karka (Cancer)
  [PN.Mercury]: 11,   // Meena (Pisces)
  [PN.Jupiter]: 9,    // Makara (Capricorn)
  [PN.Venus]: 5,      // Kanya (Virgo)
  [PN.Saturn]: 0,     // Mesha (Aries)
  [PN.Rahu]: 7,       // Vrischika
  [PN.Ketu]: 1        // Vrishabha
};

export const HOUSE_KARAKAS: Record<number, PlanetName[]> = {
  1: [PN.Sun],
  2: [PN.Jupiter],
  3: [PN.Mars],
  4: [PN.Moon, PN.Mercury],
  5: [PN.Jupiter],
  6: [PN.Saturn, PN.Mars],
  7: [PN.Venus],
  8: [PN.Saturn],
  9: [PN.Sun, PN.Jupiter],
  10: [PN.Jupiter, PN.Sun, PN.Mercury, PN.Saturn],
  11: [PN.Jupiter],
  12: [PN.Saturn]
};

export const BENEFIC_LORDS_BY_LAGNA: Record<number, PlanetName[]> = {
  0: [PN.Jupiter, PN.Sun], // Aries (Mesha)
  1: [PN.Saturn, PN.Sun], // Taurus (Vrishabha)
  2: [PN.Venus, PN.Mercury], // Gemini (Mithuna)
  3: [PN.Jupiter, PN.Mars], // Cancer (Karka)
  4: [PN.Mars], // Leo (Simha)
  5: [PN.Venus, PN.Mercury], // Virgo (Kanya)
  6: [PN.Saturn, PN.Mercury], // Libra (Tula)
  7: [PN.Jupiter, PN.Sun, PN.Moon], // Scorpio (Vrischika)
  8: [PN.Mars, PN.Sun], // Sagittarius (Dhanus)
  9: [PN.Venus, PN.Mercury], // Capricorn (Makara)
  10: [PN.Venus], // Aquarius (Kumbha)
  11: [PN.Mars, PN.Moon] // Pisces (Meena)
};

export const MALEFIC_LORDS_BY_LAGNA: Record<number, PlanetName[]> = {
  0: [PN.Saturn, PN.Mercury, PN.Venus], // Aries
  1: [PN.Jupiter, PN.Venus, PN.Moon], // Taurus
  2: [PN.Mars, PN.Jupiter, PN.Sun], // Gemini
  3: [PN.Venus, PN.Saturn, PN.Mercury], // Cancer
  4: [PN.Saturn, PN.Mercury, PN.Venus], // Leo
  5: [PN.Mars, PN.Jupiter, PN.Moon], // Virgo
  6: [PN.Jupiter, PN.Sun, PN.Mars], // Libra
  7: [PN.Mercury, PN.Venus, PN.Saturn], // Scorpio
  8: [PN.Venus], // Sagittarius
  9: [PN.Mars, PN.Jupiter, PN.Moon], // Capricorn
  10: [PN.Mars, PN.Jupiter, PN.Moon], // Aquarius
  11: [PN.Saturn, PN.Venus, PN.Mercury, PN.Sun] // Pisces
};

// 2. Graha Castes & Genders
export const GRAHA_CASTES: Record<PlanetName, string> = {
  [PN.Sun]: "Kshatriya (Warrior)",
  [PN.Moon]: "Vaishya (Merchant)",
  [PN.Mars]: "Kshatriya (Warrior)",
  [PN.Mercury]: "Vaishya (Merchant)",
  [PN.Jupiter]: "Brahmana (Priest/Intellectual)",
  [PN.Venus]: "Brahmana (Priest/Intellectual)",
  [PN.Saturn]: "Shudra (Worker/Service)",
  [PN.Rahu]: "Chandala (Outcaste/Unorthodox)",
  [PN.Ketu]: "Chandala (Outcaste/Unorthodox)"
};

export const GRAHA_GENDERS: Record<PlanetName, string> = {
  [PN.Sun]: "Male (Purusha)",
  [PN.Moon]: "Female (Stri)",
  [PN.Mars]: "Male (Purusha)",
  [PN.Mercury]: "Neuter (Napumsaka)",
  [PN.Jupiter]: "Male (Purusha)",
  [PN.Venus]: "Female (Stri)",
  [PN.Saturn]: "Neuter (Napumsaka)",
  [PN.Rahu]: "Female (Stri)",
  [PN.Ketu]: "Male (Purusha)"
};

// 3. Graha Temples
export const GRAHA_TEMPLE: Record<PlanetName, string> = {
  [PN.Sun]: "Shiva",
  [PN.Moon]: "Durga",
  [PN.Mars]: "Subramanya",
  [PN.Mercury]: "Vishnu",
  [PN.Jupiter]: "Shiva (Guru)",
  [PN.Venus]: "Lakshmi",
  [PN.Saturn]: "Yama / Shani Dev",
  [PN.Rahu]: "Durga / Snake Shrine",
  [PN.Ketu]: "Ganesha"
};

// --- Native Translation Lexicons ---
const RASHIS_EN = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
];
const RASHIS_KN = [
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
];
const RASHIS_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"
];

const PLANETS_EN: Record<PlanetName, string> = {
  [PN.Sun]: "Sun",
  [PN.Moon]: "Moon",
  [PN.Mars]: "Mars",
  [PN.Mercury]: "Mercury",
  [PN.Jupiter]: "Jupiter",
  [PN.Venus]: "Venus",
  [PN.Saturn]: "Saturn",
  [PN.Rahu]: "Rahu",
  [PN.Ketu]: "Ketu"
};

const PLANETS_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ರವಿ",
  [PN.Moon]: "ಚಂದ್ರ",
  [PN.Mars]: "ಮಂಗಳ",
  [PN.Mercury]: "ಬುಧ",
  [PN.Jupiter]: "ಗುರು",
  [PN.Venus]: "ಶುಕ್ರ",
  [PN.Saturn]: "ಶನಿ",
  [PN.Rahu]: "ರಾಹು",
  [PN.Ketu]: "ಕೇತು"
};

const PLANETS_HI: Record<PlanetName, string> = {
  [PN.Sun]: "सूर्य",
  [PN.Moon]: "चन्द्र",
  [PN.Mars]: "मंगल",
  [PN.Mercury]: "बुध",
  [PN.Jupiter]: "गुरु",
  [PN.Venus]: "शुक्र",
  [PN.Saturn]: "शनि",
  [PN.Rahu]: "राहु",
  [PN.Ketu]: "केतु"
};

const CASTES_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ಕ್ಷತ್ರಿಯ (ಧೀರ ಯೋಧ)",
  [PN.Moon]: "ವೈಶ್ಯ (ವ್ಯಾಪಾರಿ/ಸಂಘಟಕ)",
  [PN.Mars]: "ಕ್ಷತ್ರಿಯ (ಧೀರ ಯೋಧ)",
  [PN.Mercury]: "ವೈಶ್ಯ (ವ್ಯಾಪಾರಿ/ಸಂಘಟಕ)",
  [PN.Jupiter]: "ಬ್ರಾಹ್ಮಣ (ಜ್ಞಾನಿ/ಚಿಂತಕ)",
  [PN.Venus]: "ಬ್ರಾಹ್ಮಣ (ಜ್ಞಾನಿ/ಚಿಂತಕ)",
  [PN.Saturn]: "ಶೂದ್ರ (ಸೇವಾ ತತ್ಪರ/ಕಾರ್ಮಿಕ)",
  [PN.Rahu]: "ಚಂಡಾಲ (ಅಸಾಂಪ್ರದಾಯಿಕ/ನಿಗೂಢ)",
  [PN.Ketu]: "ಚಂಡಾಲ (ಅಸಾಂಪ್ರದಾಯಿಕ/ನಿಗೂಢ)"
};

const CASTES_HI: Record<PlanetName, string> = {
  [PN.Sun]: "क्षत्रिय (योद्धा)",
  [PN.Moon]: "वैश्य (व्यापारी)",
  [PN.Mars]: "क्षत्रिय (योद्धा)",
  [PN.Mercury]: "वैश्य (व्यापारी)",
  [PN.Jupiter]: "ब्राह्मण (बुद्धिजीवी)",
  [PN.Venus]: "ब्राह्मण (बुद्धिजीवी)",
  [PN.Saturn]: "शूद्र (सेवाभावी)",
  [PN.Rahu]: "चांडाल (अपरंपरागत)",
  [PN.Ketu]: "चांडाल (अपरंपरागत)"
};

const GENDERS_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ಪುರುಷ ತತ್ವ",
  [PN.Moon]: "ಸ್ತ್ರೀ ತತ್ವ",
  [PN.Mars]: "ಪುರುಷ ತತ್ವ",
  [PN.Mercury]: "ನಪುಂಸಕ (ಸಮತೋಲನ)",
  [PN.Jupiter]: "ಪುರುಷ ತತ್ವ",
  [PN.Venus]: "ಸ್ತ್ರೀ ತತ್ವ",
  [PN.Saturn]: "ನಪುಂಸಕ (ಸಮತೋಲನ)",
  [PN.Rahu]: "ಸ್ತ್ರೀ ತತ್ವ",
  [PN.Ketu]: "ಪುರುಷ ತತ್ವ"
};

const GENDERS_HI: Record<PlanetName, string> = {
  [PN.Sun]: "पुरुष तत्व",
  [PN.Moon]: "स्त्री तत्व",
  [PN.Mars]: "पुरुष तत्व",
  [PN.Mercury]: "नपुंसक तत्व",
  [PN.Jupiter]: "पुरुष तत्व",
  [PN.Venus]: "स्त्री तत्व",
  [PN.Saturn]: "नपुंसक तत्व",
  [PN.Rahu]: "स्त्री तत्व",
  [PN.Ketu]: "पुरुष तत्व"
};

const TEMPLES_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ಶ್ರೀ ಶಿವನಿಗೆ",
  [PN.Moon]: "ಶ್ರೀ ದುರ್ಗಾದೇವಿಗೆ",
  [PN.Mars]: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯನಿಗೆ",
  [PN.Mercury]: "ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿಗೆ",
  [PN.Jupiter]: "ಶ್ರೀ ದಕ್ಷಿಣಾಮೂರ್ತಿಗೆ (ಶಿವ)",
  [PN.Venus]: "ಶ್ರೀ ಲಕ್ಷ್ಮಿದೇವಿಗೆ",
  [PN.Saturn]: "ಶ್ರೀ ಶನೈಶ್ಚರನಿಗೆ",
  [PN.Rahu]: "ನಾಗದೇವತೆಗೆ (ರಾಹು ದೇವಸ್ಥಾನ)",
  [PN.Ketu]: "ಶ್ರೀ ಮಹಾಗಣಪತಿಗೆ"
};

const TEMPLES_HI: Record<PlanetName, string> = {
  [PN.Sun]: "भगवान शिव को",
  [PN.Moon]: "मां दुर्गा को",
  [PN.Mars]: "भगवान कार्तिकेय (सुब्रमण्य) को",
  [PN.Mercury]: "भगवान विष्णु को",
  [PN.Jupiter]: "गुरु शिव (दक्षिणामूर्ति) को",
  [PN.Venus]: "मां लक्ष्मी को",
  [PN.Saturn]: "शनि देव को",
  [PN.Rahu]: "नाग देवता को",
  [PN.Ketu]: "भगवान गणेश को"
};

const APPEARANCES_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ತೇಜಸ್ವಿ ಸ್ವಭಾವ, ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ, ತಾಮ್ರ ವರ್ಣದ ಕಣ್ಣುಗಳು ಮತ್ತು ಧೀರ ನಡಿಗೆ",
  [PN.Moon]: "ಸುಂದರವಾದ ಕಣ್ಣುಗಳು, ಮೃದುವಾದ ಮಾತು, ಸೂಕ್ಷ್ಮ ಮನಸ್ಸು ಮತ್ತು ಶಾಂತ ಸ್ವಭಾವ",
  [PN.Mars]: "ಯೌವನಯುತ ದೃಢ ದೇಹ, ಕೆಂಪಾದ ಕಾಂತಿ, ಅಪಾರ ಧೈರ್ಯ ಮತ್ತು ತೀಕ್ಷ್ಣ ಕಣ್ಣುಗಳು",
  [PN.Mercury]: "ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಕೋಮಲ ಚರ್ಮ ಮತ್ತು ಚತುರ ಮಾತುಗಾರಿಕೆ",
  [PN.Jupiter]: "ಗಂಭೀರವಾದ ಆಕರ್ಷಕ ದೇಹ, ಚಿನ್ನದಂತಹ ವರ್ಚಸ್ಸು, ಅಪಾರ ಜ್ಞಾನ ಮತ್ತು ಗಂಭೀರ ಧ್ವನಿ",
  [PN.Venus]: "ಆಕರ್ಷಕ ಮುಖಭಾವ, ಸುರುಳಿ ಕೂದಲು, ಕಲಾತ್ಮಕ ಮನೋಭಾವ ಮತ್ತು ಆಕರ್ಷಕ ಕಣ್ಣುಗಳು",
  [PN.Saturn]: "ಎತ್ತರದ ನಿಲುವು, ಗಂಭೀರ ಹಾಗೂ ಪ್ರೌಢ ನೋಟ ಮತ್ತು ಶಿಸ್ತುಬದ್ಧ ಜೀವನ ವಿಧಾನ",
  [PN.Rahu]: "ಆಕರ್ಷಕ ನಿಗೂಢ ವ್ಯಕ್ತಿತ್ವ, ಹೊಗೆಯಂತಹ ವರ್ಣ ಮತ್ತು ತೀಕ್ಷ್ಣವಾದ ಸಂಶೋಧನಾತ್ಮಕ ಬುದ್ಧಿಶಕ್ತಿ",
  [PN.Ketu]: "ಆಳವಾದ ಆಧ್ಯಾತ್ಮಿಕ ದೃಷ್ಟಿ, ತತ್ವಚಿಂತನೆಯ ಮನೋಭಾವ ಮತ್ತು ನಿಗೂಢ ಸತ್ಯಗಳನ್ನು ಅರಿಯುವ ಒಲವು"
};

const APPEARANCES_HI: Record<PlanetName, string> = {
  [PN.Sun]: "तेजस्वी स्वभाव, तीक्ष्ण दृष्टि, ताम्र वर्ण के नेत्र और साहसी व्यक्तित्व",
  [PN.Moon]: "सुंदर और सौम्य आंखें, मधुर वाणी, संवेदनशील मन और शांत स्वभाव",
  [PN.Mars]: "ऊर्जावान शरीर, लालिमा युक्त कांति, अद्भुत साहस और ओजस्वी नेत्र",
  [PN.Mercury]: "हास्यप्रिय स्वभाव, कुशाग्र बुद्धि, कोमल त्वचा और चतुर वक्तृत्व कला",
  [PN.Jupiter]: "भव्य और विशाल शरीर, स्वर्ण जैसी कांति, गंभीर ज्ञान और प्रभावशाली वाणी",
  [PN.Venus]: "आकर्षक कांति, घुंघराले बाल, कलात्मक अभिरुचि और सम्मोहक आंखें",
  [PN.Saturn]: "लंबा कद, गंभीर और परिपक्व दृष्टि, और अत्यंत धैर्यपूर्ण जीवन शैली",
  [PN.Rahu]: "रहस्यमयी व्यक्तित्व, सांवली कांति और अत्यंत कुशाग्र तथा खोजी बुद्धि",
  [PN.Ketu]: "गहन आध्यात्मिक दृष्टि, दार्शनिक दृष्टिकोण और आंतरिक सत्यों को जानने की तीव्र इच्छा"
};

const BHAVA_NAMES_EN = [
  "Tanu Bhava (Self & Personality)",
  "Dhana Bhava (Wealth, Family & Speech)",
  "Sahaja Bhava (Courage & Siblings)",
  "Matri Bhava (Mother, Home & Comforts)",
  "Putra Bhava (Children, Intellect & Talents)",
  "Shatru Bhava (Challenges, Health & Resilience)",
  "Kalatra Bhava (Spouse & Partnerships)",
  "Ayur Bhava (Longevity & Transformation)",
  "Bhagya Bhava (Fortune, Father & Wisdom)",
  "Karma Bhava (Profession & Public Image)",
  "Labha Bhava (Gains & Social Circle)",
  "Vyaya Bhava (Expenditure & Spiritual Release)"
];

const BHAVA_NAMES_KN = [
  "ತನು ಭಾವ (ಶಾರೀರಿಕ ಉನ್ನತಿ ಹಾಗೂ ವ್ಯಕ್ತಿತ್ವ)",
  "ಧನ ಭಾವ (ಆರ್ಥಿಕತೆ, ಕುಟುಂಬ ಹಾಗೂ ವಾಕ್ಚತುರತೆ)",
  "ಸಹಜ ಭಾವ (ಸಹೋದರರು, ಧೈರ್ಯ ಹಾಗೂ ಸಂವಹನ)",
  "ಮಾತೃ ಭಾವ (ತಾಯಿ, ಸುಖ, ಆಸ್ತಿ ಹಾಗೂ ವಾಹನ)",
  "ಪುತ್ರ ಭಾವ (ಸಂತತಿ, ಬುದ್ಧಿಶಕ್ತಿ ಹಾಗೂ ಪೂರ್ವಪುಣ್ಯ)",
  "ಶತ್ರು ಭಾವ (ಋಣ, ರೋಗ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ)",
  "ಕಳತ್ರ ಭಾವ (ಜೀವನ ಸಂಗಾತಿ ಹಾಗೂ ಪಾಲುದಾರಿಕೆ)",
  "ಆಯುರ್ ಭಾವ (ಆಯಸ್ಸು, ನಿಗೂಢ ಧನ ಹಾಗೂ ಅಡೆತಡೆಗಳು)",
  "ಭಾಗ್ಯ ಭಾವ (ಅದೃಷ್ಟ, ತಂದೆ ಹಾಗೂ ಧರ್ಮಚಿಂತನೆ)",
  "ಕರ್ಮ ಭಾವ (ಉದ್ಯೋಗ, ಗೌರವ ಹಾಗೂ ಯಶಸ್ಸು)",
  "ಲಾಭ ಭಾವ (ಲಾಭಗಳು, ಆದಾಯ ಹಾಗೂ ಆಸೆಗಳ ಈಡೇರಿಕೆ)",
  "ವ್ಯಯ ಭಾವ (ಖರ್ಚುಗಳು, ವಿದೇಶ ಪ್ರಯಾಣ ಹಾಗೂ ವಿಶ್ರಾಂತಿ)"
];

const BHAVA_NAMES_HI = [
  "तनु भाव (शरीर, रूप और व्यक्तित्व)",
  "धन भाव (संपत्ति, परिवार और वाणी)",
  "सहज भाव (भाई-बहन, साहस और संचार)",
  "मातृ भाव (माता, सुख, संपत्ति और वाहन)",
  "पुत्र भाव (संतान, बुद्धि और पूर्व पुण्य)",
  "शत्रु भाव (ऋण, रोग और बाधाओं पर विजय)",
  "कलत्र भाव (जीवनसाथी, विवाह और साझेदारी)",
  "आयु भाव (दीर्घायु, गुप्त धन और परिवर्तन)",
  "भाग्य भाव (भाग्य, पिता और धर्म)",
  "कर्म भाव (करियर, पद-प्रतिष्ठा और कर्म)",
  "लाभ भाव (आय, लाभ और इच्छा पूर्ति)",
  "व्यय भाव (खर्च, विदेश यात्रा और मोक्ष)"
];

const BHAVA_SIGNIFICATIONS_EN = [
  "body condition, shape, health, head, progress, and personality",
  "family, wealth, speech, right eye, and especially Occult Sciences",
  "courage, younger siblings, prowess, and ear health",
  "mother, house, land, vehicles, and education",
  "children, intellect, talent, and poorvapunya",
  "disease, debt, enemies, and maternal uncle's relation",
  "spouse, marriage, partnership, and foreign travel",
  "longevity, death mode, hidden diseases, and sudden losses",
  "fortune, dharma, father, and gurus",
  "career, fame, authority, and status",
  "income, gains, elder siblings, and wishes",
  "expense, loss, imprisonment, and moksha"
];

const BHAVA_SIGNIFICATIONS_KN = [
  "ದೇಹದ ಸ್ಥಿತಿ, ರೂಪ, ಆರೋಗ್ಯ, ತಲೆ, ಪ್ರಗತಿ ಮತ್ತು ವ್ಯಕ್ತಿತ್ವ",
  "ಕುಟುಂಬ, ಸಂಪತ್ತು, ಮಾತು, ಬಲಗಣ್ಣು ಮತ್ತು ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿ ಗೂಢವಿದ್ಯೆ (Occult Sciences)",
  "ಧೈರ್ಯ, ಕಿರು ಸಹೋದರರು, ಪರಾಕ್ರಮ ಮತ್ತು ಕಿವಿ",
  "ತಾಯಿ, ಮನೆ, ಭೂಮಿ, ವಾಹನ ಸುಖ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸ",
  "ಸಂತಾನ, ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರತಿಭೆ ಮತ್ತು ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ",
  "ರೋಗ, ಸಾಲ, ಶತ್ರುಗಳು ಮತ್ತು ಸೋದರಮಾವ (Maternal Uncle)",
  "ಸಂಗಾತಿ, ವಿವಾಹ, ಪಾಲುದಾರಿಕೆ ಮತ್ತು ವಿದೇಶ ಪ್ರಯಾಣ",
  "ಆಯುಷ್ಯ, ಮರಣದ ರೀತಿ, ಗುಪ್ತ ರೋಗಗಳು ಮತ್ತು ಆಕಸ್ಮಿಕ ನಷ್ಟ",
  "ಅದೃಷ್ಟ, ಧರ್ಮ, ತಂದೆ ಮತ್ತು ಗುರುಗಳು",
  "ವೃತ್ತಿ, ಕೀರ್ತಿ, ಅಧಿಕಾರ ಮತ್ತು ಸಾಮಾಜಿಕ ಅಂತಸ್ತು",
  "ಆದಾಯ, ಲಾಭ, ಹಿರಿಯ ಸಹೋದರರು ಮತ್ತು ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ",
  "ಖರ್ಚು, ನಷ್ಟ, ಜೈಲು ವಾಸ ಮತ್ತು ಮೋಕ್ಷ"
];

const BHAVA_SIGNIFICATIONS_HI = [
  "आपके शारीरिक स्वास्थ्य, आत्म-विश्वास, रूप और संपूर्ण व्यक्तित्व को",
  "पारिवारिक सुख, संचित धन, आपकी वाणी और प्रारंभिक शिक्षा को",
  "भाई-बहनों से संबंध, आपका आंतरिक साहस, छोटी यात्राएं और पुरुषार्थ को",
  "माता का स्नेह, घरेलू सुख-शांति, वाहन सुख और अचल संपत्ति को",
  "आपकी बुद्धि, संतान सुख, रचनात्मकता और पूर्व जन्म के शुभ कर्मों को",
  "स्वास्थ्य की देखभाल, ऋणों से मुक्ति और जीवन के संघर्षों पर विजय को",
  "विवाह, जीवनसाथी के साथ संबंध और व्यावसायिक साझेदारी को",
  "दीर्घायु, अचानक होने वाले बदलाव, पैतृक संपत्ति और आध्यात्मिक रहस्यों को",
  "भाग्य का उदय, पिता का सहयोग, उच्च शिक्षा और धार्मिक मान्यताओं को",
  "आपके करियर, समाज में मान-प्रतिष्ठा, पद और आजीविका के साधनों को",
  "आय के स्रोत, मनोकामनाओं की पूर्ति, बड़े भाई-बहनों का सहयोग और लाभ को",
  "व्यय, आध्यात्मिक शांति, विदेश यात्रा और उत्तम निद्रा सुख को"
];

// Helper to determine natural friendship
export const naturalRelation = (planet: PlanetName, other: PlanetName): "mitra" | "shatru" | "sama" => {
  const friends: Record<PlanetName, PlanetName[]> = {
    [PN.Sun]: [PN.Moon, PN.Mars, PN.Jupiter],
    [PN.Moon]: [PN.Sun, PN.Mercury],
    [PN.Mars]: [PN.Sun, PN.Moon, PN.Jupiter],
    [PN.Mercury]: [PN.Sun, PN.Venus, PN.Rahu],
    [PN.Jupiter]: [PN.Sun, PN.Moon, PN.Mars],
    [PN.Venus]: [PN.Mercury, PN.Saturn, PN.Rahu],
    [PN.Saturn]: [PN.Mercury, PN.Venus, PN.Rahu],
    [PN.Rahu]: [PN.Mercury, PN.Venus, PN.Saturn],
    [PN.Ketu]: [PN.Venus, PN.Saturn]
  };

  const enemies: Record<PlanetName, PlanetName[]> = {
    [PN.Sun]: [PN.Venus, PN.Saturn, PN.Rahu],
    [PN.Moon]: [PN.Rahu],
    [PN.Mars]: [PN.Mercury, PN.Rahu] as any,
    [PN.Mercury]: [PN.Moon],
    [PN.Jupiter]: [PN.Mercury, PN.Venus],
    [PN.Venus]: [PN.Sun, PN.Moon, PN.Ketu],
    [PN.Saturn]: [PN.Sun, PN.Moon, PN.Mars, PN.Ketu],
    [PN.Rahu]: [PN.Sun, PN.Moon, PN.Mars],
    [PN.Ketu]: [PN.Sun, PN.Moon]
  };

  const fList = friends[planet] ?? [];
  const eList = enemies[planet] ?? [];

  if (fList.includes(other)) return "mitra";
  if (eList.includes(other)) return "shatru";
  return "sama";
};

export const getPlanetAppearance = (p: PlanetName): string => {
  switch (p) {
    case PN.Sun: return "Hot constitution, sharp vision, copper-colored eyes, sparse hair, and courageous.";
    case PN.Moon: return "Beautiful eyes, soft-spoken, white constitution, sensitive mind, and cold nature.";
    case PN.Mars: return "Youthful body, red complexion, courageous, hot constitution, and angry eyes.";
    case PN.Mercury: return "Humorous nature, highly intellectual, soft skin, green/dark complexion, and clever speech.";
    case PN.Jupiter: return "Large/stately body, yellow complexion, broad chest, wise demeanor, and deep voice.";
    case PN.Venus: return "Beautiful, attractive body, curly hair, artistic inclination, and lovely eyes.";
    case PN.Saturn: return "Tall body, dark complexion, coarse hair, slow-moving nature, and serious expression.";
    case PN.Rahu: return "Intimidating appearance, smoky complexion, skin diseases tendency, and speculative mind.";
    case PN.Ketu: return "Intense look, philosophical demeanor, interested in spiritual matters, and healing skills.";
  }
};

export function housesRuledByPlanet(planet: PlanetName, lagnaIdx: number): number[] {
  const ruledRashis: Record<PlanetName, number[]> = {
    [PN.Sun]: [4],
    [PN.Moon]: [3],
    [PN.Mars]: [0, 7],
    [PN.Mercury]: [2, 5],
    [PN.Jupiter]: [8, 11],
    [PN.Venus]: [1, 6],
    [PN.Saturn]: [9, 10],
    [PN.Rahu]: [],
    [PN.Ketu]: []
  };
  const rashis = ruledRashis[planet] || [];
  return rashis.map(r => ((r - lagnaIdx + 12) % 12) + 1);
}

interface LagnaRule {
  beneficsEn: string;
  beneficsKn: string;
  maleficsEn: string;
  maleficsKn: string;
  yogasEn: string;
  yogasKn: string;
}

const LAGNA_RULES: Record<number, LagnaRule> = {
  0: { // Mesha
    beneficsEn: "Sun and Moon are highly benefic.",
    beneficsKn: "ರವಿ ಮತ್ತು ಚಂದ್ರ ಶುಭರು.",
    maleficsEn: "Saturn, Mercury, and Jupiter yield inauspicious results.",
    maleficsKn: "ಶನಿ, ಬುಧ ಮತ್ತು ಗುರು ಅಶುಭ ಫಲ ನೀಡುತ್ತಾರೆ.",
    yogasEn: "Sun and Moon conjunction brings auspicious growth.",
    yogasKn: "ರವಿ ಮತ್ತು ಚಂದ್ರನ ಜೋಡಣೆಯು ಉತ್ತಮ ಯಶಸ್ಸನ್ನು ನೀಡುತ್ತದೆ."
  },
  1: { // Vrishabha
    beneficsEn: "Saturn and Mercury are the key benefics. Saturn acts as a powerful benefic for this Lagna.",
    beneficsKn: "ಶನಿ ಮತ್ತು ಬುಧರು ಪ್ರಮುಖ ಶುಭರು. ಶನಿಯು ಈ ಲಗ್ನಕ್ಕೆ ಪ್ರಬಲ ಶುಭ ಗ್ರಹ.",
    maleficsEn: "Jupiter, Venus, and Moon are malefic.",
    maleficsKn: "ಗುರು, ಶುಕ್ರ ಮತ್ತು ಚಂದ್ರರು ಅಶುಭರು.",
    yogasEn: "Saturn and Mercury conjunction is Rajayogakaraka, bringing wealth and status.",
    yogasKn: "ಶನಿ ಮತ್ತು ಬುಧ ರಾಜಯೋಗಕಾರಕರು. ಇದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಕೀರ್ತಿ ಮತ್ತು ಗೌರವ ನೀಡುತ್ತದೆ."
  },
  2: { // Mithuna
    beneficsEn: "Saturn and Mercury are benefic.",
    beneficsKn: "ಶನಿ ಮತ್ತು ಬುಧನ ಯೋಗ ಶುಭ ಫಲ ನೀಡುತ್ತದೆ.",
    maleficsEn: "Mars, Jupiter, and Sun are malefic.",
    maleficsKn: "ಕುಜ, ಗುರು ಮತ್ತು ರವಿ ಅಶುಭರು.",
    yogasEn: "Saturn (9th lord) and Mercury yield auspicious results. However, if Saturn and Jupiter (10th lord) associate, it causes a Raja Yoga Bhanga because Jupiter rules the 7th house (Maraka).",
    yogasKn: "ಶನಿ (9ನೇ ಅಧಿಪತಿ) ಮತ್ತು ಗುರು (10ನೇ ಅಧಿಪತಿ) संबंधವಿದ್ದಲ್ಲಿ ರಾಜಯೋಗ ಭಂಗವಾಗುತ್ತದೆ; ಏಕೆಂದರೆ ಗುರುವು ಇಲ್ಲಿ 7ನೇ ಮನೆಯ (ಮಾರಕ) ಅಧಿಪತ್ಯದ ದೋಷವನ್ನೂ ಹೊಂದಿರುತ್ತಾನೆ."
  },
  3: { // Karka
    beneficsEn: "Jupiter and Mars are functional benefics and Rajayogakarakas.",
    beneficsKn: "ಗುರು ಮತ್ತು ಮಂಗಳರು ಶುಭರು ಹಾಗೂ ರಾಜಯೋಗಕಾರಕರು.",
    maleficsEn: "Venus, Saturn, and Mercury are malefic.",
    maleficsKn: "ಶುಕ್ರ, ಶನಿ ಮತ್ತು ಬುಧ ಅಶುಭರು.",
    yogasEn: "Jupiter and Mars conjunction/mutual aspect creates a powerful Raja Yoga.",
    yogasKn: "ಗುರು ಮತ್ತು ಮಂಗಳ ಗ್ರಹಗಳ ಯುತಿ ಅಥವಾ ಪರಸ್ಪರ ದೃಷ್ಟಿಯು ಅತ್ಯಂತ ಪ್ರಬಲ ರಾಜಯೋಗವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ."
  },
  4: { // Simha
    beneficsEn: "Sun and Mars are benefic.",
    beneficsKn: "ರವಿ ಮತ್ತು ಮಂಗಳರು ಶುಭರು.",
    maleficsEn: "Saturn, Mercury, and Venus are malefic.",
    maleficsKn: "ಶನಿ, ಬುಧ ಮತ್ತು ಶುಕ್ರ ಅಶುಭರು.",
    yogasEn: "Sun and Mars association is a powerful Rajayogakaraka, yielding power and authority.",
    yogasKn: "ರವಿ ಮತ್ತು ಮಂಗಳನ ಸಂಬಂಧ ರಾಜಯೋಗಕಾರಕವಾಗಿದ್ದು, ಅಧಿಕಾರ ನೀಡುತ್ತದೆ."
  },
  5: { // Kanya
    beneficsEn: "Mercury and Venus are Rajayogakarakas.",
    beneficsKn: "ಬುಧ ಮತ್ತು ಶುಕ್ರರು ರಾಜಯೋಗಕಾರಕರು.",
    maleficsEn: "Mars, Jupiter, and Moon are malefic.",
    maleficsKn: "ಕುಜ, ಗುರು ಮತ್ತು ಚಂದ್ರ ಅಶುಭರು.",
    yogasEn: "Mercury and Venus conjunction is Rajayogakaraka, bringing high intelligence and wealth.",
    yogasKn: "ಬುಧ ಮತ್ತು ಶುಕ್ರನ ಯೋಗ ರಾಜಯೋಗಕಾರಕವಾಗಿದ್ದು, ಬುದ್ಧಿಶಕ್ತಿ ಹಾಗೂ ಐಶ್ವರ್ಯ ನೀಡುತ್ತದೆ."
  },
  6: { // Tula
    beneficsEn: "Saturn and Mercury are key benefics.",
    beneficsKn: "ಶನಿ ಮತ್ತು ಬುಧರು ಅತ್ಯಂತ ಶುಭ ಗ್ರಹಗಳು.",
    maleficsEn: "Jupiter, Sun, and Mars are malefic.",
    maleficsKn: "ಗುರು, ರವಿ ಮತ್ತು ಕುಜ ಅಶುಭರು.",
    yogasEn: "Saturn and Mercury conjunction yields amazing Raja Yoga.",
    yogasKn: "ಶನಿ ಮತ್ತು ಬುಧನ ಸಂಯೋಜನೆ ಅದ್ಭುತ ರಾಜಯೋಗ ನೀಡುತ್ತದೆ."
  },
  7: { // Vrischika
    beneficsEn: "Jupiter and Sun are benefic.",
    beneficsKn: "ಗುರು ಮತ್ತು ರವಿ ಶುಭ ಫಲ ನೀಡುತ್ತಾರೆ.",
    maleficsEn: "Mercury, Venus, and Saturn are malefic.",
    maleficsKn: "ಬುಧ, ಶುಕ್ರ ಮತ್ತು ಶನಿ ಅಶುಭರು.",
    yogasEn: "Sun and Jupiter conjunction yields progress and status.",
    yogasKn: "ರವಿ ಮತ್ತು ಗುರುವಿನ ಸಂಯೋಗವು ಪ್ರಗತಿ ಹಾಗೂ ಜ್ಞಾನವನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ."
  },
  8: { // Dhanu
    beneficsEn: "Sun, Mars, and Mercury are benefic.",
    beneficsKn: "ರವಿ, ಕುಜ ಮತ್ತು ಬುಧರು ಶುಭರು.",
    maleficsEn: "Venus is malefic.",
    maleficsKn: "ಶುಕ್ರ ಅಶುಭ ಫಲ ನೀಡುತ್ತಾನೆ.",
    yogasEn: "Sun and Mercury conjunction, or Sun and Mars association yields strong Raja Yoga.",
    yogasKn: "ರವಿ ಮತ್ತು ಬುಧನ ಯೋಗ ಅಥವಾ ರವಿ ಮತ್ತು ಕುಜನ ಸಂಯೋಜನೆ ರಾಜಯೋಗ ನೀಡುತ್ತದೆ."
  },
  9: { // Makara
    beneficsEn: "Venus and Mercury are Rajayogakarakas. Saturn is benefic as Lagna Lord.",
    beneficsKn: "ಶುಕ್ರ ಮತ್ತು ಬುಧ ರಾಜಯೋಗಕಾರಕರು. ಶನಿಯು ಲಗ್ನಾಧಿಪತಿಯಾಗಿ ಶುಭ ಫಲ ನೀಡುತ್ತಾನೆ.",
    maleficsEn: "Mars, Jupiter, and Moon are malefic.",
    maleficsKn: "ಕುಜ, ಗುರು ಮತ್ತು ಚಂದ್ರ ಅಶುಭರು.",
    yogasEn: "Venus and Mercury conjunction creates standard luxury and comfort yogas.",
    yogasKn: "ಶುಕ್ರ ಮತ್ತು ಬುಧನ ಯುತಿಯು ವಾಹನ ಹಾಗೂ ಆಸ್ತಿ ಸುಖ ನೀಡುತ್ತದೆ."
  },
  10: { // Kumbha
    beneficsEn: "Venus and Saturn are benefic.",
    beneficsKn: "ಶುಕ್ರ ಮತ್ತು ಶನಿಯು ಶುಭ ಫಲ ನೀಡುತ್ತಾರೆ.",
    maleficsEn: "Jupiter, Mars, and Moon are malefic.",
    maleficsKn: "ಗುರು, ಕುಜ ಮತ್ತು ಚಂದ್ರ ಅಶುಭರು.",
    yogasEn: "Venus and Saturn association creates a powerful Raja Yoga.",
    yogasKn: "ಶುಕ್ರ ಮತ್ತು ಶನಿಯ ಸಂಬಂಧವು ಪ್ರಬಲ ರಾಜಯೋಗವನ್ನು ಸೃಷ್ಟಿಸುತ್ತದೆ."
  },
  11: { // Meena
    beneficsEn: "Mars and Moon are benefic.",
    beneficsKn: "ಕುಜ ಮತ್ತು ಚಂದ್ರರು ಶುಭರು.",
    maleficsEn: "Saturn, Venus, Mercury, and Sun are malefic.",
    maleficsKn: "ಶನಿ, ಶುಕ್ರ, ಬುಧ ಮತ್ತು ರವಿ ಅಶುಭರು.",
    yogasEn: "Mars and Moon association is highly auspicious (Chandra-Mangala Yoga).",
    yogasKn: "ಕುಜ ಮತ್ತು ಚಂದ್ರನ ಯೋಗವು ಶುಭಪ್ರದವಾಗಿದ್ದು, ಆರ್ಥಿಕ ಉನ್ನತಿ ನೀಡುತ್ತದೆ."
  }
};

const PLANET_DISEASES_EN: Record<PlanetName, string> = {
  [PN.Sun]: "Heart disease, bone (asthi) defects, and stomach ailments.",
  [PN.Moon]: "Mental anxiety, blood disorders, and cold-related infections.",
  [PN.Mars]: "High blood pressure, surgical interventions, burns, and high fever.",
  [PN.Mercury]: "Nervous weakness, skin diseases, and communication or speech disorders.",
  [PN.Jupiter]: "Digestive issues, ear aches, and memory weakness.",
  [PN.Venus]: "Venereal or genital diseases, and vision/eye defects.",
  [PN.Saturn]: "Vata-related ailments, chronic leg pain, joint issues, and risk of paralysis.",
  [PN.Rahu]: "Fear of poisoning, foot/ankle issues, and undiagnosed or mysterious diseases.",
  [PN.Ketu]: "Mental distress, severe lack of immunity, and viral infections."
};

const PLANET_DISEASES_KN: Record<PlanetName, string> = {
  [PN.Sun]: "ಹೃದಯ ಸಂಬಂಧಿ ಕಾಯಿಲೆ, ಅಸ್ಥಿ (ಮೂಳೆ) ದೋಷ ಮತ್ತು ಉದರ ವ್ಯಾಧಿ.",
  [PN.Moon]: "ಮಾನಸಿಕ ಅಶಾಂತಿ, ರಕ್ತದ ದೋಷ ಮತ್ತು ಶೀತ ಸಂಬಂಧಿತ ಸಮಸ್ಯೆಗಳು.",
  [PN.Mars]: "ಅಧಿಕ ರಕ್ತದೊತ್ತಡ, ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು, ಸುಟ್ಟ ಗಾಯಗಳು ಮತ್ತು ಜ್ವರ.",
  [PN.Mercury]: "ನರಗಳ ದೌರ್ಬಲ್ಯ, ಚರ್ಮ ರೋಗ ಮತ್ತು ಸಂವಹನ ದೋಷಗಳು.",
  [PN.Jupiter]: "ಜೀರ್ಣಕ್ರಿಯೆ ಅಡೆತಡೆ, ಕಿವಿ ನೋವು ಮತ್ತು ನೆನಪಿನ ಶಕ್ತಿ ಕುಂದುವುದು.",
  [PN.Venus]: "ಗುಹ್ಯ ರೋಗಗಳು ಮತ್ತು ಕಣ್ಣಿನ ದೃಷ್ಟಿ ದೋಷ.",
  [PN.Saturn]: "ವಾತ ರೋಗ, ದೀರ್ಘಕಾಲದ ಕಾಲು ನೋವು ಮತ್ತು ಪಾರ್ಶ್ವವಾಯು.",
  [PN.Rahu]: "ವಿಷಭಯ, ಪಾದಗಳ ಸಮಸ್ಯೆ ಮತ್ತು ಗುರುತಿಸಲಾಗದ ರೋಗಗಳು.",
  [PN.Ketu]: "ಮಾನಸಿಕ ಕ್ಲೇಶ ಮತ್ತು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ತೀವ್ರ ಕೊರತೆ."
};

export function getDetailedPlanetInsight(
  planet: PlanetName,
  house: number,
  rashiIdx: number,
  lagnaIdx: number,
  isOwnSign: boolean,
  isExalted: boolean,
  isDebilitated: boolean,
  isKn: boolean
): string {
  let text = "";

  // 1. Ashtamadhipatya rules
  const ruledHouses = housesRuledByPlanet(planet, lagnaIdx);
  const rules8 = ruledHouses.includes(8);
  if (rules8) {
    if (lagnaIdx === 0 && planet === PN.Mars) {
      text += isKn
        ? "\n\nಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ: ಮೇಷ ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿಯಾದ ಮಂಗಳನೇ ಅಷ್ಟಮಕ್ಕೂ ಅಧಿಪತಿಯಾಗುವುದರಿಂದ, ಇಲ್ಲಿ ಮಂಗಳನಿಗೆ ಅಷ್ಟಮಾದಿಪತ್ಯದ ದೋಷವು ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಮಂಗಳನು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತಾನೆ ಮತ್ತು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತಾನೆ."
        : "\n\n[Ashtamadhipatya Rule]: For Aries Lagna, the Lagna Lord Mars is also the 8th Lord. Therefore, Mars does not suffer from Ashtamadhipatya dosha; it protects you and yields auspicious results.";
    } else if (lagnaIdx === 6 && planet === PN.Venus) {
      text += isKn
        ? "\n\nಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿಯಾದ ಶುಕ್ರನೇ ಅಷ್ಟಮಕ್ಕೂ ಅಧಿಪತಿಯಾಗುವುದರಿಂದ, ಇಲ್ಲಿ ಶುಕ್ರನಿಗೆ ಅಷ್ಟಮಾದಿಪತ್ಯದ ದೋಷವು ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಶುಕ್ರನು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತಾನೆ ಮತ್ತು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತಾನೆ."
        : "\n\n[Ashtamadhipatya Rule]: For Libra Lagna, the Lagna Lord Venus is also the 8th Lord. Therefore, Venus does not suffer from Ashtamadhipatya dosha; it protects you and yields auspicious results.";
    } else if (planet === PN.Sun || planet === PN.Moon) {
      text += isKn
        ? "\n\nಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ: ಶಾಸ್ತ್ರದ ನಿಯಮದಂತೆ ರವಿ ಮತ್ತು ಚಂದ್ರ ಗ್ರಹಗಳಿಗೆ ಅಷ್ಟಮ ಸ್ಥಾನದ ಅಧಿಪತ್ಯದ ದೋಷವಿರುವುದಿಲ್ಲ."
        : "\n\n[Ashtamadhipatya Rule]: As per astrological texts, the Sun and Moon are completely exempt from Ashtamadhipatya dosha.";
    } else {
      text += isKn
        ? "\n\nಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ: ಈ ಗ್ರಹವು ೮ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾಗಿರುವುದರಿಂದ ಸಾಧಾರಣವಾಗಿ ಫಲನಿರ್ಣಯದಲ್ಲಿ ಅಶುಭ ನೀಡುವ ಪ್ರವೃತ್ತಿ ಹೊಂದಿರುತ್ತದೆ. ಇದು ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಅಥವಾ ಆಯುಷ್ಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಿಚಾರಗಳಲ್ಲಿ ತಾಳ್ಮೆಯನ್ನು ಬಯಸುತ್ತದೆ."
        : "\n\n[Ashtamadhipatya Rule]: Ruling the 8th house, this planet generally tends to bring challenges, unexpected delays, or health fluctuations.";
    }
  }

  // 2. Trishadaya rules (3, 6, 11)
  const rulesTrishadaya = ruledHouses.some(h => [3, 6, 11].includes(h));
  if (rulesTrishadaya) {
    text += isKn
      ? "\n\n[ತ್ರಿಷಡಾಯ ಅಧಿಪತಿ ಪ್ರಭಾವ]: ಈ ಗ್ರಹವು ೩, ೬ ಅಥವಾ ೧೧ನೇ ಮನೆಯ (ತ್ರಿಷಡಾಯ) ಅಧಿಪತಿಯಾಗಿದ್ದು, ತನ್ನ ದಶಾ-ಭುಕ್ತಿಗಳಲ್ಲಿ ಸಂಘರ್ಷ, ರೋಗ ಮತ್ತು ಅಡೆತಡೆಗಳನ್ನು ಉಂಟುಮಾಡುವ ಪ್ರವೃತ್ತಿ ಹೊಂದಿರುತ್ತದೆ."
      : "\n\n[Trishadaya Lord Influence]: This planet rules a Trishadaya house (3rd, 6th, or 11th). Consequently, in its Dasha-Bhukti, it is prone to bring struggles, conflicts, obstacles, or health challenges.";
  }

  // 3. Raja Yoga & Bhanga
  const rulesLagna = LAGNA_RULES[lagnaIdx];
  if (rulesLagna) {
    if (lagnaIdx === 2) {
      if (planet === PN.Jupiter || planet === PN.Saturn) {
        text += isKn
          ? "\n\n[ರಾಜಯೋಗ ಭಂಗ ವಿಚಾರ]: ಮಿಥುನ ಲಗ್ನಕ್ಕೆ ಶನಿ (೯ನೇ ಅಧಿಪತಿ) ಮತ್ತು ಗುರು (೧೦ನೇ ಅಧಿಪತಿ) ಸಂಬಂಧವಿದ್ದಲ್ಲಿ ರಾಜಯೋಗ ಭಂಗವಾಗುತ್ತದೆ; ಏಕೆಂದರೆ ಗುರುವು ಇಲ್ಲಿ ೭ನೇ ಮನೆಯ (ಮಾರಕ) ಅಧಿಪತ್ಯದ ದೋಷವನ್ನೂ ಹೊಂದಿರುತ್ತಾನೆ."
          : "\n\n[Raja Yoga Bhanga Subtlety]: For Gemini Lagna, while Saturn (9L) and Jupiter (10L) rule auspicious houses, their conjunction/aspect causes Raja Yoga Bhanga because Jupiter also holds the 7th house (Maraka) lordship.";
      }
    } else if (lagnaIdx === 3) {
      if (planet === PN.Mars || planet === PN.Saturn) {
        text += isKn
          ? "\n\n[ರಾಜಯೋಗ ಭಂಗ ವಿಚಾರ]: ಕರ್ಕ ಲಗ್ನಕ್ಕೆ ಮಂಗಳನು ಯೋಗಕಾರಕನಾಗಿದ್ದರೂ, ೮ನೇ ಅಧಿಪತಿಯಾದ ಶನಿಯೊಂದಿಗಿನ ದೃಷ್ಟಿ/ಯುತಿ ಸಂಬಂಧದಿಂದಾಗಿ ರಾಜಯೋಗ ಭಂಗ ಉಂಟಾಗಬಹುದು. ಇದು ನಿಮ್ಮ ಕೆಲಸಗಳಲ್ಲಿ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಅಡೆತಡೆಗಳನ್ನು ತರಬಹುದು."
          : "\n\n[Raja Yoga Bhanga Subtlety]: For Cancer Lagna, while Mars is the primary Yogakaraka, its association or aspect with the 8th lord Saturn triggers a Raja Yoga Bhanga, which might introduce sudden hurdles or delays near completion.";
      }
    }
  }

  // 4. Medical Astrology
  const disease = isKn ? PLANET_DISEASES_KN[planet] : PLANET_DISEASES_EN[planet];
  if (disease) {
    text += isKn
      ? `\n\n[ವೈದ್ಯಕೀಯ ಜ್ಯೋತಿಷ್ಯ (Roga Vichara)]: ಕಾಲಪುರುಷನ ಅಂಗವಿಭಾಗದಲ್ಲಿ ಈ ಗ್ರಹವು ಪ್ರಭಾವ ಬೀರುತ್ತದೆ. ಇದು ಮುಖ್ಯವಾಗಿ ${disease}`
      : `\n\n[Medical Astrology (Roga Vichara)]: In the Kalapurusha body division, this planet affects specific functions. It is associated with: ${disease}`;
  }

  return text;
}

const HOUSE_KARAKAS_INFO: Record<number, { en: string; kn: string; hi: string }> = {
  1: { en: "Sun (represents soul, vitality, self-confidence, and identity)", kn: "ರವಿ (ಆತ್ಮಕಾರಕ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ದೈಹಿಕ ಶಕ್ತಿ)", hi: "सूर्य (आत्मा, आत्मविश्वास और शारीरिक ऊर्जा)" },
  2: { en: "Jupiter (represents wealth, family, speech, and wisdom)", kn: "ಗುರು (ಧನಕಾರಕ, ಕೌಟುಂಬಿಕ ಅಭಿವೃದ್ಧಿ, ವಿದ್ಯಾಭ್ಯಾಸ)", hi: "गुरु (धन, वाणी और पारिवारिक समृद्धि)" },
  3: { en: "Mars (represents courage, physical strength, and younger siblings)", kn: "ಮಂಗಳ (ಧೈರ್ಯ, ಸಾಹಸ ಮತ್ತು ಒಡಹುಟ್ಟಿದವರು)", hi: "मंगल (साहस, पुरुषार्थ और छोटे भाई-बहन)" },
  4: { en: "Moon and Mercury (represent mother, mental happiness, and education)", kn: "ಚಂದ್ರ ಮತ್ತು ಬುಧ (ಮಾತೃ ಕಾರಕ, ಮನಸ್ಸು, ಸುಖ ಮತ್ತು ವಿದ್ಯೆ)", hi: "चंद्र और बुध (माता, मानसिक सुख और विद्या)" },
  5: { en: "Jupiter (represents children, intellect, and memory)", kn: "ಗುರು (ಪುತ್ರಕಾರಕ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಜ್ಞಾನ)", hi: "गुरु (संतान, बुद्धि और ज्ञान)" },
  6: { en: "Mars and Saturn (represent obstacles, service, and debt control)", kn: "ಮಂಗಳ ಮತ್ತು ಶನಿ (ರೋಗ, ಶತ್ರು ನಿಯಂತ್ರಣ, ಸೇವಾ ಮನೋಭಾವ)", hi: "मंगल और शनि (ऋण, शत्रु और सेवा)" },
  7: { en: "Venus (represents marriage, spouse, and partnership relations)", kn: "ಶುಕ್ರ (ಕಲತ್ರಕಾರಕ, ದಾಂಪತ್ಯ ಸುಖ, ಪಾಲುದಾರಿಕೆ)", hi: "शुक्र (विवाह, जीवनसाथी और साझेदारी)" },
  8: { en: "Saturn (represents longevity, transformations, and deep secrets)", kn: "ಶನಿ (ಆಯುಷ್ಯಕಾರಕ, ಗೂಢ ವಿಷಯಗಳು, ಆಕಸ್ಮಿಕಗಳು)", hi: "शनि (आयु, गुप्त विद्या और अचानक बदलाव)" },
  9: { en: "Jupiter and Sun (represent fortune, higher education, father, and dharma)", kn: "ಗುರು ಮತ್ತು ರವಿ (ಭಾಗ್ಯಕಾರಕ, ತಂದೆಯ ಮಾರ್ಗದರ್ಶನ, ಧರ್ಮ ಶ್ರದ್ಧೆ)", hi: "गुरु और सूर्य (भाग्य, पिता और धर्म)" },
  10: { en: "Sun, Mercury, Jupiter, and Saturn (represent career, public image, authority, and karma)", kn: "ರವಿ, ಬುಧ, ಗುರು ಮತ್ತು ಶನಿ (ಕರ್ಮಕಾರಕರು, ವೃತ್ತಿ ಗೌರವ, ಕೀರ್ತಿ)", hi: "सूर्य, बुध, गुरु और शनि (आजीविका, पद-प्रतिष्ठा और कर्म)" },
  11: { en: "Jupiter (represents income streams, gains, and fulfillment of desires)", kn: "ಗುರು (ಲಾಭಕಾರಕ, ಆರ್ಥಿಕ ಪ್ರಗತಿ, ಸಕಲ ಸಂಪತ್ತು)", hi: "गुरु (लाभ, इच्छा पूर्ति और आय के स्रोत)" },
  12: { en: "Saturn (represents expenditure, liberation, and foreign connections)", kn: "ಶನಿ (ಮೋಕ್ಷಕಾರಕ, ವ್ಯಯ ನಿಯಂತ್ರಣ, ವಿಶ್ರಾಂತಿ)", hi: "शनि (मोक्ष, व्यय और विदेश संबंध)" }
};

function arePlanetsAssociated(p1Name: PlanetName, p2Name: PlanetName, kundli: KundliOutput): boolean {
  const p1 = kundli.planets.find(p => p.name === p1Name);
  const p2 = kundli.planets.find(p => p.name === p2Name);
  if (!p1 || !p2) return false;

  if (p1.house === p2.house) return true;

  const p1House = p1.house;
  const p2House = p2.house;
  const p1Aspects = [(p1House + 6 - 1) % 12 + 1];
  if (p1Name === PN.Saturn) {
    p1Aspects.push((p1House + 2 - 1) % 12 + 1);
    p1Aspects.push((p1House + 9 - 1) % 12 + 1);
  } else if (p1Name === PN.Mars) {
    p1Aspects.push((p1House + 3 - 1) % 12 + 1);
    p1Aspects.push((p1House + 7 - 1) % 12 + 1);
  } else if (p1Name === PN.Jupiter) {
    p1Aspects.push((p1House + 4 - 1) % 12 + 1);
    p1Aspects.push((p1House + 8 - 1) % 12 + 1);
  }
  if (p1Aspects.includes(p2House)) return true;

  const p2Aspects = [(p2House + 6 - 1) % 12 + 1];
  if (p2Name === PN.Saturn) {
    p2Aspects.push((p2House + 2 - 1) % 12 + 1);
    p2Aspects.push((p2House + 9 - 1) % 12 + 1);
  } else if (p2Name === PN.Mars) {
    p2Aspects.push((p2House + 3 - 1) % 12 + 1);
    p2Aspects.push((p2House + 7 - 1) % 12 + 1);
  } else if (p2Name === PN.Jupiter) {
    p2Aspects.push((p2House + 4 - 1) % 12 + 1);
    p2Aspects.push((p2House + 8 - 1) % 12 + 1);
  }
  if (p2Aspects.includes(p1House)) return true;

  return false;
}

/**
 * Generate predictions based on the Traditional Baggona PDF Rules
 */
export function generateBaggonaPredictions(
  kundli: KundliOutput,
  panchanga: TraditionalBaggonaPanchanga,
  lang: string = "en",
  birth?: { birthDate: string }
): BaggonaPredictions {
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  const getRashiName = (idx: number): string => {
    if (isKn) return RASHIS_KN[idx] ?? "";
    if (isHi) return RASHIS_HI[idx] ?? "";
    return RASHIS_EN[idx] ?? "";
  };

  const getPlanetName = (p: PlanetName): string => {
    if (isKn) return PLANETS_KN[p] ?? p;
    if (isHi) return PLANETS_HI[p] ?? p;
    return PLANETS_EN[p] ?? p;
  };

  const getCasteName = (p: PlanetName): string => {
    if (isKn) return CASTES_KN[p] ?? "";
    if (isHi) return CASTES_HI[p] ?? "";
    return GRAHA_CASTES[p] ?? "";
  };

  const getGenderName = (p: PlanetName): string => {
    if (isKn) return GENDERS_KN[p] ?? "";
    if (isHi) return GENDERS_HI[p] ?? "";
    return GRAHA_GENDERS[p] ?? "";
  };

  const getTempleName = (p: PlanetName): string => {
    if (isKn) return TEMPLES_KN[p] ?? "";
    if (isHi) return TEMPLES_HI[p] ?? "";
    return GRAHA_TEMPLE[p] ?? "";
  };

  const getAppearanceName = (p: PlanetName): string => {
    if (isKn) return APPEARANCES_KN[p] ?? "";
    if (isHi) return APPEARANCES_HI[p] ?? "";
    return getPlanetAppearance(p);
  };

  // --- 1. OVERVIEW & PANCHANGA ---
  const overview: BaggonaPredictionSection[] = [];
  
  const elementEn = kundli.moonSign.index % 4 === 0 ? "Fire (Agni)" : kundli.moonSign.index % 4 === 1 ? "Earth (Bhoomi)" : kundli.moonSign.index % 4 === 2 ? "Air (Vayu)" : "Water (Jala)";
  const elementKn = kundli.moonSign.index % 4 === 0 ? "ಅಗ್ನಿ ತತ್ವ" : kundli.moonSign.index % 4 === 1 ? "ಭೂಮಿ ತತ್ವ" : kundli.moonSign.index % 4 === 2 ? "ವಾಯು ತತ್ವ" : "ಜಲ ತತ್ವ";
  const elementHi = kundli.moonSign.index % 4 === 0 ? "अग्नि तत्व" : kundli.moonSign.index % 4 === 1 ? "पृथ्वी तत्व" : kundli.moonSign.index % 4 === 2 ? "वायु तत्व" : "जल तत्व";

  const natureEn = kundli.moonSign.index % 4 === 0 ? "courage, enthusiasm, and leadership" : kundli.moonSign.index % 4 === 1 ? "stability, patience, and realistic outlook" : kundli.moonSign.index % 4 === 2 ? "intellect, social connection, and clear communication" : "deep intuition, sensitivity, and protective care";
  const natureKn = kundli.moonSign.index % 4 === 0 ? "ಸಾಹಸ, ಕ್ರಿಯಾಶೀಲತೆ ಮತ್ತು ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು" : kundli.moonSign.index % 4 === 1 ? "ಸ್ಥಿರತೆ, ತಾಳ್ಮೆ ಮತ್ತು ಸದಾ ಪ್ರಾಯೋಗಿಕ ಚಿಂತನೆಗಳನ್ನು" : kundli.moonSign.index % 4 === 2 ? "ಬುದ್ಧಿಶಕ್ತಿ, ಸಂವಹನ ಕಲೆ ಮತ್ತು ಉತ್ತಮ ಆಲೋಚನೆಗಳನ್ನು" : "ಆಳವಾದ ಅಂತಃಪ್ರಜ್ಞೆ, ಸೂಕ್ಷ್ಮ ಮನಸ್ಸು ಮತ್ತು ಸದಾ ರಕ್ಷಣಾತ್ಮಕ ಭಾವಗಳನ್ನು";
  const natureHi = kundli.moonSign.index % 4 === 0 ? "अद्भुत साहस, उत्साह और नेतृत्व क्षमता" : kundli.moonSign.index % 4 === 1 ? "स्थिरता, धैर्य और व्यावहारिक सोच" : kundli.moonSign.index % 4 === 2 ? "बुद्धिमानी, कुशल संचार और सामाजिक जुड़ाव" : "गहन संवेदनशीलता, अंतर्ज्ञान और सुरक्षात्मक स्वभाव";

  let ovTitle1 = "Lagna (Ascendant) & Chandra Rashi Overview";
  let ovDesc1 = `Your Ascendant is placed in ${getRashiName(kundli.lagnaRashi.index)} and your Moon sign is in ${getRashiName(kundli.moonSign.index)}. The Moon is in a ${elementEn} sign, which brings a natural temperament of ${natureEn}. This provides a beautiful balance between your active personality and your emotional inner world.`;

  if (isKn) {
    ovTitle1 = "ಲಗ್ನ ಮತ್ತು ಚಂದ್ರ ರಾಶಿಯ ಮುಖ್ಯಾಂಶಗಳು";
    ovDesc1 = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${getRashiName(kundli.lagnaRashi.index)} ಆಗಿದ್ದು, ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯು ${getRashiName(kundli.moonSign.index)} ಆಗಿದೆ. ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯು ${elementKn}ಕ್ಕೆ ಸೇರಿದ್ದು, ಇದು ನಿಮಗೆ ಸಹಜವಾಗಿಯೇ ${natureKn} ಕರುಣಿಸುತ್ತದೆ. ಇದು ನಿಮ್ಮ ಬಾಹ್ಯ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ಒಳಗಿನ ಭಾವನಾತ್ಮಕ ಜಗತ್ತಿಗೆ ಒಂದು ಸುಂದರ ಸಮತೋಲನವನ್ನು ನೀಡುತ್ತದೆ.`;
  } else if (isHi) {
    ovTitle1 = "लग्न और चंद्र राशि का संक्षिप्त विवरण";
    ovDesc1 = `आपका जन्म लग्न ${getRashiName(kundli.lagnaRashi.index)} है और आपकी चंद्र राशि ${getRashiName(kundli.moonSign.index)} है। चंद्रमा ${elementHi} की राशि में स्थित हैं, जो आपके स्वभाव में ${natureHi} का संचार करते हैं। यह स्थिति आपके बाहरी व्यक्तित्व और आंतरिक भावनात्मक जगत के बीच एक सुंदर सामंजस्य स्थापित करती है।`;
  }

  overview.push({ title: ovTitle1, description: ovDesc1 });

  let ovTitle2 = "Vedic Panchanga Parameters";
  let ovDesc2 = `You were born under the auspicious flow of ${panchanga.samvatsara} Samvatsara, in ${panchanga.masa} Masa during ${panchanga.paksha} Paksha. Your birth took place on ${panchanga.tithi} Tithi (${panchanga.tithiGhati} Ghati, ${panchanga.tithiVighati} Vighati). The birth star ruling your path is ${panchanga.moonNakshatra} Nakshatra (${panchanga.moonNakshatraGhati} Ghati, ${panchanga.moonNakshatraVighati} Vighati). Guided by ${panchanga.yoga} Yoga and ${panchanga.karana} Karana, these traditional parameters lay the foundational strength and purpose of your life journey.`;

  if (isKn) {
    ovTitle2 = "ವೈದಿಕ ಪಂಚಾಂಗದ ಶುಭ ವಿವರಗಳು";
    ovDesc2 = `ನಿಮ್ಮ ಜನ್ಮವು ${panchanga.samvatsaraKn} ಸಂವತ್ಸರದಲ್ಲಿ, ${panchanga.masaKn} ಮಾಸದಲ್ಲಿ ಹಾಗೂ ${panchanga.pakshaKn} ಪಕ್ಷದಲ್ಲಿ ನಡೆದಿದೆ. ನಿಮ್ಮ ಹುಟ್ಟಿದ ತಿಥಿಯು ${panchanga.tithiKn} (${panchanga.tithiGhati} ಘಟಿ, ${panchanga.tithiVighati} ವಿಘಟಿ) ಆಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರವು ${panchanga.moonNakshatraKn} ನಕ್ಷತ್ರವಾಗಿದ್ದು (${panchanga.moonNakshatraGhati} ಘಟಿ, ${panchanga.moonNakshatraVighati} ವಿಘಟಿ), ${panchanga.yogaKn} ಯೋಗ ಮತ್ತು ${panchanga.karanaKn} ಕರಣದ ಅಧೀನದಲ್ಲಿದೆ. ಈ ಸಾಂಪ್ರದಾಯಿಕ ಪಂಚಾಂಗದ ಮೌಲ್ಯಗಳು ನಿಮ್ಮ ಜೀವನದ ಯಶಸ್ಸಿನ ಹಾದಿಗೆ ಭದ್ರ ಬುನಾದಿಯನ್ನು ಹಾಕುತ್ತವೆ.`;
  } else if (isHi) {
    ovTitle2 = "वैदिक पंचांग के शुभ प्रभाव";
    ovDesc2 = `आपका जन्म ${panchanga.samvatsara} संवत्सर, ${panchanga.masa} मास और ${panchanga.paksha} पक्ष के शुभ समय में हुआ है। आपकी जन्म तिथि ${panchanga.tithi} (${panchanga.tithiGhati} घटी, ${panchanga.tithiVighati} विघाटी) है। आपका जन्म नक्षत्र ${panchanga.moonNakshatra} है जो कि (${panchanga.moonNakshatraGhati} घटी, ${panchanga.moonNakshatraVighati} विघाटी) पर समाप्त होता है। ${panchanga.yoga} योग और ${panchanga.karana} करण की छत्रछाया में जन्म होने से ये पंचांगीय कारक आपके जीवन पथ को स्थायित्व प्रदान करते हैं।`;
  }

  overview.push({ title: ovTitle2, description: ovDesc2 });

  // --- 2. PLANETARY ANALYSIS (GRAHABALA) ---
  const planets: BaggonaPredictionSection[] = [];
  let exaltedCount = 0;
  let debilitatedCount = 0;

  for (const p of kundli.planets) {
    const rIdx = p.rashi.index;
    const isExalted = EXALTATION_SIGNS[p.name] === rIdx;
    const isDebilitated = DEBILITATION_SIGNS[p.name] === rIdx;

    if (isExalted) exaltedCount++;
    if (isDebilitated) debilitatedCount++;

    const pName = getPlanetName(p.name);
    const rName = getRashiName(rIdx);
    const caste = getCasteName(p.name);
    const gender = getGenderName(p.name);
    const temple = getTempleName(p.name);
    const appearance = getAppearanceName(p.name);

    let title = `${pName} - The Cosmic Guide`;
    let description = "";

    const lord = signLord(rIdx);
    const isOwnSign = lord === p.name;
    const rel = isOwnSign ? null : naturalRelation(p.name, lord);

    let baseScore = 60;
    if (isExalted) {
      baseScore += 30;
    } else if (isDebilitated) {
      baseScore -= 30;
    } else if (isOwnSign) {
      baseScore += 20;
    } else if (rel === "mitra") {
      baseScore += 10;
    } else if (rel === "shatru") {
      baseScore -= 15;
    }

    const lagnaIdx = kundli.lagnaRashi.index;
    const beneficsForLagna = BENEFIC_LORDS_BY_LAGNA[lagnaIdx] || [];
    const maleficsForLagna = MALEFIC_LORDS_BY_LAGNA[lagnaIdx] || [];
    if (beneficsForLagna.includes(p.name)) {
      baseScore += 10;
    } else if (maleficsForLagna.includes(p.name)) {
      baseScore -= 10;
    }

    const house = p.house;
    if ([1, 4, 7, 10].includes(house)) {
      baseScore += 10;
    } else if ([5, 9].includes(house)) {
      baseScore += 10;
    } else if ([6, 8, 12].includes(house)) {
      if (!isExalted && !isOwnSign) {
        baseScore -= 15;
      }
    }

    const planetScore = Math.max(15, Math.min(98, baseScore));
    const planetStatus = planetScore >= 70 ? "positive" : planetScore < 50 ? "caution" : "neutral";

    if (isKn) {
      title = `${pName} - ಆತ್ಮದ ಪ್ರೇರಕಶಕ್ತಿ`;
      if (isExalted) {
        description = `${pName} ಗ್ರಹವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${rName} ರಾಶಿಯಲ್ಲಿ ಉಚ್ಛ (ಬಲಶಾಲಿ) ಸ್ಥಾನದಲ್ಲಿದೆ. ಇದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಈ ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಅತ್ಯಂತ ಸಕಾರಾತ್ಮಕ ಗುಣಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಈ ಗ್ರಹವು ${caste} ವರ್ಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ ಮತ್ತು ${gender} ತತ್ವದ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ರವಿಯ ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸಲು ಹಾಗೂ ಜೀವನದ ಶುಭಫಲಗಳಿಗಾಗಿ ${temple} ಭಕ್ತಿಯಿಂದ ಆರಾಧಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ. ಈ ಸ್ಥಾನವು ನಿಮ್ಮಲ್ಲಿ ${appearance} ಗುಣಗಳನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`;
      } else if (isDebilitated) {
        description = `${pName} ಗ್ರಹವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${rName} ರಾಶಿಯಲ್ಲಿ ನೀಚ (ದುರ್ಬಲ) ಸ್ಥಾನದಲ್ಲಿದೆ. ಇದು ಜೀವನದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಸಹನೆಯನ್ನು ಕಲಿಸುವ ಕಾಲವಾಗಿದೆ. ಈ ಗ್ರಹವು ${caste} ವರ್ಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ ಮತ್ತು ${gender} ತತ್ವದ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ಈ ಗ್ರಹದ ನಕಾರಾತ್ಮಕ ಪರಿಣಾಮಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಹಾಗೂ ಒಳಗಿನ ಆತ್ಮಬಲವನ್ನು ಹೆಚ್ಚಿಸಲು ${temple} ಭಕ್ತಿಯಿಂದ ಆರಾಧಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ. ಈ ಸ್ಥಾನದಿಂದಾಗಿ ನಿಮ್ಮಲ್ಲಿ ${appearance} ಸ್ವಭಾವಗಳು ಗೋಚರಿಸುತ್ತವೆ.`;
      } else {
        description = `${pName} ಗ್ರಹವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${rName} ರಾಶಿಯಲ್ಲಿ (ಭಾವ ${p.house} ರಲ್ಲಿ) ಸ್ಥಿರವಾಗಿ ನೆಲೆಸಿದೆ. ಇದು ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಉತ್ತಮ ಸಮತೋಲನವನ್ನು ತರುತ್ತದೆ. ಈ ಗ್ರಹವು ${caste} ವರ್ಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ ಮತ್ತು ${gender} ತತ್ವದ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದ ಶುಭಫಲಗಳಿಗಾಗಿ ${temple} ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸುವುದು ನಿಮಗೆ ಸದಾ ಪ್ರಗತಿಯನ್ನು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಸ್ವಭಾವವು ${appearance} ಯಿಂದ ಕೂಡಿರಲಿದೆ.`;
      }
    } else if (isHi) {
      title = `${pName} - कॉस्मिक मार्गदर्शक`;
      if (isExalted) {
        description = `${pName} आपकी कुंडली में ${rName} राशि में उच्च के होकर बलवान स्थिति में विराजमान हैं। यह ग्रह आपके जीवन में अपने सबसे उत्तम और सकारात्मक फल प्रदान करेगा। यह ${caste} वर्ण से संबंधित हैं और इसमें ${gender} की ऊर्जा समाहित है। इस शुभ ग्रह के पूर्ण आशीर्वाद के लिए ${temple} पूजा अर्चना करना कल्याणकारी है। यह स्थिति आपके स्वभाव में ${appearance} का संचार करती है।`;
      } else if (isDebilitated) {
        description = `${pName} आपकी कुंडली में ${rName} राशि में नीच के होकर कमजोर स्थिति में हैं। यह स्थिति आपको जीवन में कड़ी मेहनत, अनुशासन और धैर्य बनाए रखने की सीख देती है। यह ${caste} वर्ण से संबंधित हैं और इसमें ${gender} की ऊर्जा है। इस ग्रह के विपरीत प्रभावों से मुक्ति और आत्मबल की वृद्धि के लिए ${temple} आराधना करना विशेष रूप से लाभकारी है। यह स्थिति स्वभाव में ${appearance} के रूप में दिखाई देती है।`;
      } else {
        description = `${pName} आपकी कुंडली के ${rName} राशि (भाव ${p.house}) में स्थित हैं। यह आपके जीवन पथ पर एक सकारात्मक संतुलन बनाए रखेंगे। यह ${caste} वर्ण से संबंधित हैं और इनमें ${gender} की ऊर्जा विद्यमान है। दैनिक जीवन में सुख और उन्नति की प्राप्ति के लिए ${temple} पूजा-प्रार्थना करना शुभ फलदायी रहेगा। आपका स्वभाव ${appearance} से प्रभावित रहेगा।`;
      }
    } else {
      let statusPhrase = `placed in ${rName} Rashi (House ${p.house}).`;
      if (isExalted) {
        statusPhrase = `placed in ${rName} Rashi, where it is EXALTED (Uchcha). This planet acts as a powerful source of strength and positive qualities.`;
      } else if (isDebilitated) {
        statusPhrase = `placed in ${rName} Rashi, where it is DEBILITATED (Neecha). This points to valuable lessons of discipline, patience, and persistence.`;
      }

      description = `${pName} is ${statusPhrase} It belongs to the ${caste} caste, exhibits ${gender} energy, and represents the temple of Lord ${temple}. Physical and behavioral traits include: ${appearance}`;
    }

    if (p.name === PN.Saturn) {
      const saturnRashi = p.rashi.index;
      let strengthEn = "";
      let strengthKn = "";
      let strengthHi = "";
      if (saturnRashi === 6) {
        strengthEn = "Saturn is EXALTED in Libra, giving great patience, authority, and status. ";
        strengthKn = "ಶನಿಯು ತುಲಾ ರಾಶಿಯಲ್ಲಿ ಉಚ್ಛನಾಗಿದ್ದು, ಅಪಾರ ತಾಳ್ಮೆ, ಅಧಿಕಾರ ಮತ್ತು ಗೌರವವನ್ನು ನೀಡುತ್ತಾನೆ. ";
        strengthHi = "शनि तुला राशि में उच्च के हैं, जो अत्यधिक धैर्य, अधिकार और सम्मान प्रदान करते हैं। ";
      } else if (saturnRashi === 9 || saturnRashi === 10) {
        strengthEn = "Saturn is in its OWN sign, providing stability, discipline, and solid foundations. ";
        strengthKn = "ಶನಿಯು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು (ಮಕರ/ಕುಂಭ), ಜೀವನದಲ್ಲಿ ಸ್ಥಿರತೆ, ಶಿಸ್ತು ಮತ್ತು ಭದ್ರ ಬುನಾದಿಯನ್ನು ನೀಡುತ್ತಾನೆ. ";
        strengthHi = "शनि अपने स्वराशि (मकर/कुंभ) में हैं, जो स्थिरता, अनुशासन और मजबूत आधार प्रदान करते हैं। ";
      } else if ([1, 2, 5].includes(saturnRashi)) {
        strengthEn = "Saturn is in a FRIEND'S sign, making its challenges smoother and easier to navigate. ";
        strengthKn = "ಶನಿಯು ಮಿತ್ರಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು, ಸವಾಲುಗಳನ್ನು ಸುಲಭವಾಗಿ ಎದುರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತಾನೆ. ";
        strengthHi = "शनि मित्र राशि में हैं, जिससे आने वाली चुनौतियाँ अपेक्षाकृत सरल और अनुकूल हो जाती हैं। ";
      } else if (saturnRashi === 0) {
        strengthEn = "Saturn is DEBILITATED in Aries, indicating that heavy labor, obstacles, and intense life lessons will shape your path. ";
        strengthKn = "ಶನಿಯು ಮೇಷ ರಾಶಿಯಲ್ಲಿ ನೀಚನಾಗಿದ್ದು, ಬದುಕಿನಲ್ಲಿ ಶ್ರಮ, ತೀವ್ರ ಅಡೆತಡೆಗಳು ಹಾಗೂ ಪಾಠಗಳು ಹೆಚ್ಚು ಪ್ರಭಾವ ಬೀರುತ್ತವೆ. ";
        strengthHi = "शनि मेष राशि में नीच के हैं, जो इंगित करते हैं कि आपके जीवन में कड़ा संघर्ष, बाधाएं और महत्वपूर्ण सबक प्रभाव डालेंगे। ";
      } else {
        strengthEn = "Saturn is in a challenging/enemy sign, requiring dedication and discipline. ";
        strengthKn = "ಶನಿಯು ಶತ್ರು ರಾಶಿಯಲ್ಲಿದ್ದು, ಜೀವನದಲ್ಲಿ ಸದಾ ಶಿಸ್ತು ಮತ್ತು ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆಯನ್ನು ಬಯಸುತ್ತಾನೆ. ";
        strengthHi = "शनि शत्रु राशि में हैं, जो जीवन में निरंतर अनुशासन और समर्पण की मांग करते हैं। ";
      }

      const careersEn: Record<number, string> = {
        0: "A career path involving engineering, technical sectors, hard physical labor, or the working-class sector.",
        1: "A career path in banking, finance, LIC, or the food industry.",
        2: "A career path in media, publication, writing, logistics, or transport/travel.",
        3: "Vocation related to cooking service, food industry, housing/real estate, with a focus on resolving mother-related pending karma.",
        4: "Vocation in politics, education, biological sciences, or government service/administration.",
        5: "Vocation in accounting, auditing, legal litigation, or medicine.",
        6: "Career in partnership businesses, banking, marketing, or judicial/court services.",
        7: "A path in secret service, CID, cyber security, astrology, or geology/underground research.",
        8: "Vocation in temples, religious institutions, trusts, or as a judge/legal advisor.",
        9: "A leadership role, company management, administrative head, or social service.",
        10: "Vocation in network administration, finance, income tax, or revenue departments.",
        11: "A path as a doctor, lecturer, manager of ashrams, or charitable trusts."
      };
      const careersKn: Record<number, string> = {
        0: "ಎಂಜಿನಿಯರಿಂಗ್, ತಾಂತ್ರಿಕ ವಲಯ, ಕಠಿಣ ದೈಹಿಕ ಶ್ರಮ ಅಥವಾ ಕಾರ್ಮಿಕ ವಲಯದ ಕೆಲಸ.",
        1: "ಬ್ಯಾಂಕಿಂಗ್, ಹಣಕಾಸು (Finance), LIC ಅಥವಾ ಆಹಾರ ಉದ್ಯಮ.",
        2: "ಮಾಧ್ಯಮ, ಪ್ರಕಾಶನ, ಬರವಣಿಗೆ, ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಅಥವಾ ಸಾರಿಗೆ/ಪ್ರಯಾಣ.",
        3: "ಅಡುಗೆ ಸೇವೆ, ಆಹಾರ ಉದ್ಯಮ, ಮನೆ/ಸ್ಥಿರ ಆಸ್ತಿಗೆ ಸಂಬಂಧಿಸಿದ ಕೆಲಸ ಮತ್ತು ತಾಯಿಗೆ ಸಂಬಂಧಪಟ್ಟ ಬಾಕಿ ಕರ್ಮದ ಪರಿಹಾರ.",
        4: "ರಾಜಕೀಯ, ಶಿಕ್ಷಣ, ಜೀವಶಾಸ್ತ್ರ ಅಥವಾ ಸರ್ಕಾರಿ ಸೇವೆ/ಆಡಳಿತ.",
        5: "ಅಕೌಂಟಿಂಗ್, ಆಡಿಟಿಂಗ್, ಕಾನೂನು ಮೊಕದ್ದಮೆ (Litigation) ಅಥವಾ ವೈದ್ಯಕೀಯ ಕ್ಷೇತ್ರ.",
        6: "ಪಾಲುದಾರಿಕೆ ವ್ಯವಹಾರ, ಬ್ಯಾಂಕ್, ಮಾರ್ಕೆಟಿಂಗ್ ಅಥವಾ ನ್ಯಾಯಾಲಯದ ಕೆಲಸ.",
        7: "ರಹಸ್ಯ ಸೇವೆ, ಸಿಐಡಿ, ಸೈಬರ್ ಭದ್ರತೆ, ಜ್ಯೋತಿಷ್ಯ ಅಥವಾ ಭೂಗರ್ಭ ಶಾಸ್ತ್ರ/ಸಂಶೋಧನೆ.",
        8: "ದೇವಸ್ಥಾನ, ಧಾರ್ಮಿಕ ಸಂಸ್ಥೆಗಳು, ಟ್ರಸ್ಟ್‌ಗಳು ಅಥವಾ ನ್ಯಾಯಾಧೀಶ/ಕಾನೂನು ಸಲಹೆಗಾರ.",
        9: "ನಾಯಕತ್ವದ ಪಾತ್ರ, ಕಂಪನಿ ನಿರ್ವಹಣೆ, ಆಡಳಿತ ಮುಖ್ಯಸ್ಥ ಅಥವಾ ಸಮಾಜ ಸೇವೆ.",
        10: "ನೆಟ್‌ವರ್ಕ್ ಆಡಳಿತ, ಹಣಕಾಸು, ಆದಾಯ ತೆರಿಗೆ ಅಥವಾ ಕಂದಾಯ ಇಲಾಖೆ.",
        11: "ವೈದ್ಯರು, ಉಪನ್ಯಾಸಕರು, ಆಶ್ರಮಗಳ ನಿರ್ವಹಣೆ ಅಥವಾ ಚಾರಿಟೇಬಲ್ ಟ್ರಸ್ಟ್‌ಗಳು."
      };
      const careersHi: Record<number, string> = {
        0: "इंजीनियरिंग, तकनीकी क्षेत्र, कठिन शारीरिक श्रम या श्रमिक क्षेत्र का कार्य।",
        1: "बैंकिंग, वित्त (फाइनेंस), एलआईसी (LIC) या खाद्य उद्योग।",
        2: "मीडिया, प्रकाशन, लेखन, लॉजिस्टिक्स या परिवहन/यात्रा क्षेत्र।",
        3: "पाक कला/रसोई सेवा, खाद्य उद्योग, आवास/रियल एस्टेट, और माता से संबंधित लंबित कर्मों का निवारण।",
        4: "राजनीति, शिक्षा, जीव विज्ञान या सरकारी सेवा/प्रशासन।",
        5: "अकाउंटिंग, ऑडिटिंग, कानूनी मुकदमेबाजी या चिकित्सा क्षेत्र।",
        6: "साझेदारी व्यवसाय, बैंक, मार्केटिंग या अदालती/न्यायिक सेवा।",
        7: "खुफिया सेवा (CID), साइबर सुरक्षा, ज्योतिष या भूविज्ञान/भूमिगत अनुसंधान।",
        8: "मंदिर, धार्मिक संस्थान, ट्रस्ट या न्यायाधीश/कानूनी सलाहकार।",
        9: "नेतৃত্ব भूमिका, कंपनी प्रबंधन, प्रशासनिक प्रमुख या समाज सेवा।",
        10: "नेटवर्क प्रशासन, वित्त, आयकर या राजस्व विभाग।",
        11: "डॉक्टर, व्याख्याता (लेक्चरर), आश्रमों का प्रबंधन या धर्मार्थ ट्रस्ट।"
      };

      const careerEn = careersEn[saturnRashi] || "";
      const careerKn = careersKn[saturnRashi] || "";
      const careerHi = careersHi[saturnRashi] || "";

      const conjoined = kundli.planets.filter(other => other.name !== PN.Saturn && other.house === p.house);
      let conjEn = "";
      let conjKn = "";
      let conjHi = "";

      for (const other of conjoined) {
        if (other.name === PN.Sun) {
          conjEn += "Saturn is conjoined with the Sun, indicating potential health delays or administrative trials. ";
          conjKn += "ಶನಿಯು ರವಿಯೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದು, ಆರೋಗ್ಯದ ಏರುಪೇರು ಅಥವಾ ಅಧಿಕಾರಿಗಳಿಂದ ಸವಾಲುಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ. ";
          conjHi += "शनि सूर्य के साथ युति में हैं, जो स्वास्थ्य संबंधी चिंताओं या प्रशासनिक बाधाओं को दर्शाता है। ";
        } else if (other.name === PN.Moon) {
          conjEn += "Saturn is conjoined with the Moon, representing public service inclination or mother's focus. ";
          conjKn += "ಶನಿಯು ಚಂದ್ರನೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದು, ಸಾರ್ವಜನಿಕ ಸೇವೆ ಅಥವಾ ತಾಯಿಯ ಕಡೆಯ ಕಾಳಜಿಯನ್ನು ತೋರಿಸುತ್ತದೆ. ";
          conjHi += "शनि चंद्रमा के साथ युति में हैं, जो माता के कार्यक्षेत्र, जनसेवा या समाज सेवा को इंगित करता है। ";
        } else if (other.name === PN.Mercury) {
          conjEn += "Saturn is conjoined with Mercury, pointing to traveler, communicator, logistics, or social worker roles. ";
          conjKn += "ಶನಿಯು ಬುಧನೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದು, ನಿರಂತರ ಪ್ರಯಾಣ, ಸಂವಹನ, ಸಾಗಣೆ (Logistics) ಅಥವಾ ಸಮಾಜ ಸೇವೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ";
          conjHi += "शनि बुध के साथ युति में हैं, जो निरंतर यात्रा, संचार, लॉजिस्टिक्स या समाज सेवा को दर्शाता है। ";
        } else if (other.name === PN.Rahu || other.name === PN.Ketu) {
          conjEn += "Saturn is conjoined with Rahu/Ketu, indicating pending karma and tasks carried over from past births. ";
          conjKn += "ಶನಿಯು ರಾಹು/ಕೇತುಗಳೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದು, ಹಿಂದಿನ ಜನ್ಮದ ಬಾಕಿ ಇರುವ ಕರ್ಮಗಳನ್ನು ಹಾಗೂ ಸಾಲಗಳನ್ನು ತೀರಿಸಲು ಬಂದಿರುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. ";
          conjHi += "शनि राहु/केतु के साथ युति में हैं, जो पिछले जन्म के लंबित कर्मों (Pending Karma) और दायित्वों को दर्शाता है। ";
        }
      }

      const positiveDashaHouses = [2, 4, 5, 7, 9, 10];
      const isDashaPositive = positiveDashaHouses.includes(p.house);
      const dashaEn = isDashaPositive
        ? `Since Saturn is in your ${p.house}th house, Saturn Dasha (major period) will yield highly positive results, stability, and growth. `
        : `Since Saturn is in your ${p.house}th house, Saturn Dasha may require extra patience, discipline, and hard work. `;
      const dashaKn = isDashaPositive
        ? `ಶನಿಯು ನಿಮ್ಮ ಜಾತಕದ ${p.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಶನಿ ದಶೆಯು ನಿಮಗೆ ಉತ್ತಮ ಫಲಗಳು, ಸ್ಥಿರತೆ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ನೀಡುತ್ತದೆ. `
        : `ಶನಿಯು ನಿಮ್ಮ ಜಾತಕದ ${p.house}ನೇ ಮನೆಯಲ್ಲಿರುವುದರಿಂದ, ಶನಿ ದಶೆಯಲ್ಲಿ ಹೆಚ್ಚಿನ ತಾಳ್ಮೆ, ಶಿಸ್ತು ಮತ್ತು ಶ್ರಮ ಬೇಕಾಗುತ್ತದೆ. `;
      const dashaHi = isDashaPositive
        ? `चूंकि शनि आपकी कुंडली के ${p.house}वें भाव में हैं, इसलिए शनि की महादशा आपको उत्तम फल, स्थिरता और उन्नति प्रदान करेगी। `
        : `चूंकि शनि आपकी कुंडली के ${p.house}वें भाव में हैं, इसलिए शनि की महादशा में आपको अधिक धैर्य, अनुशासन और कड़े परिश्रम की आवश्यकता होगी। `;

      const adviceEn = "Saturn expects dedicated service to parents. Remedial actions include Shiva worship, chanting Hanuman Chalisa, and performing acts of charity.";
      const adviceKn = "ಶನಿಯು ತಂದೆ-ತಾಯಿಯ ಸೇವೆಯನ್ನು ಬಯಸುತ್ತಾನೆ. ಪರಿಹಾರಕ್ಕಾಗಿ ಪ್ರತಿದಿನ ಶಿವನ ಆರಾಧನೆ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮತ್ತು ಬಡವರಿಗೆ ಸಹಾಯ ಮಾಡುವುದು ಶ್ರೇಯಸ್ಕರ.";
      const adviceHi = "शनि माता-पिता की सेवा की अपेक्षा करते हैं। शनिवार को कष्टों के निवारण हेतु शिव आराधना, हनुमान चालीसा पाठ और दान-पुण्य करना चाहिए।";

      const extraSaturnTextEn = `\n\n[Saturn Strength]: ${strengthEn}\n[Saturn Dasha]: ${dashaEn}\n[Saturn Career Path]: ${careerEn}\n${conjEn ? `[Saturn Conjunctions]: ${conjEn}\n` : ""}[Saturn Guidance]: ${adviceEn}`;
      const extraSaturnTextKn = `\n\n[ಶನಿ ಬಲ]: ${strengthKn}\n[ಶನಿ ದಶಾ]: ${dashaKn}\n[ಶನಿ ಕರ್ಮ ಮತ್ತು ವೃತ್ತಿ]: ${careerKn}\n${conjKn ? `[ಶನಿ ಯುತಿಗಳು]: ${conjKn}\n` : ""}[ಶನಿ ಪರಿಹಾರಗಳು]: ${adviceKn}`;
      const extraSaturnTextHi = `\n\n[शनि बल]: ${strengthHi}\n[शनि महादशा]: ${dashaHi}\n[शनि करियर पथ]: ${careerHi}\n${conjHi ? `[शनि युति]: ${conjHi}\n` : ""}[शनि उपाय]: ${adviceHi}`;

      if (isKn) {
        description += extraSaturnTextKn;
      } else if (isHi) {
        description += extraSaturnTextHi;
      } else {
        description += extraSaturnTextEn;
      }
    }

    const extraInsight = getDetailedPlanetInsight(
      p.name,
      p.house,
      rIdx,
      lagnaIdx,
      isOwnSign,
      isExalted,
      isDebilitated,
      isKn
    );
    description += extraInsight;

    const lagnaLord = signLord(lagnaIdx);
    if (p.name === lagnaLord && [6, 8, 12].includes(p.house)) {
      description += isKn
        ? "\n\n[ಲಗ್ನಾಧಿಪತಿಯ ದೌರ್ಬಲ್ಯ]: ಲಗ್ನಾಧಿಪತಿಯು ಜಾತಕದ ದುಸ್ಥಾನಗಳಲ್ಲಿ (೬, ೮ ಅಥವಾ ೧೨ನೇ ಭಾವ) ನೆಲೆಸಿರುವುದರಿಂದ ನಿಮ್ಮ ಒಟ್ಟಾರೆ ಆರೋಗ್ಯ ಹಾಗೂ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯು ಕ್ಷೀಣಿಸುವ ಸಾಧ್ಯತೆಯಿರುತ್ತದೆ. ಸೂಕ್ತ ಕಾಳಜಿ ಮತ್ತು ಶಿವಾರಾಧನೆ ಅತ್ಯಗತ್ಯ."
        : "\n\n[Lagna Lord Weakness]: Since your Lagna Lord is posited in a dusthana (6th, 8th, or 12th house), your overall health and immunity might be compromised. Extra care, a disciplined lifestyle, and spiritual practices are recommended.";
    }

    planets.push({ title, description, score: planetScore, status: planetStatus });
  }

  // --- 3. 12 BHAVAS (DVADASHA BHAVA) ---
  const houses: BaggonaPredictionSection[] = [];
  for (let h = 1; h <= 12; h++) {
    const occupants = kundli.planets.filter((p) => p.house === h);
    const occupantsStr = occupants.length > 0
      ? occupants.map((p) => getPlanetName(p.name)).join(", ")
      : "";

    const lord = lordOfHouse(kundli, h);
    const lordName = getPlanetName(lord);
    const lordPl = kundli.planets.find(p => p.name === lord);
    const lordRashiName = lordPl ? getRashiName(lordPl.rashi.index) : "";
    const lordHouse = lordPl ? lordPl.house : 1;

    let score = houseLordPlacementScore(kundli, h);
    for (const p of occupants) {
      score += planetHouseScore(p.name, p.house, p.rashi.index);
    }
    score = Math.max(-4, Math.min(4, score));
    const status = score >= 1 ? "positive" : score <= -1 ? "caution" : "neutral";

    // 100-point mapping
    const getHouseScore100 = (s: number): number => {
      if (s === -4) return 15;
      if (s === -3) return 25;
      if (s === -2) return 35;
      if (s === -1) return 45;
      if (s === 0) return 60;
      if (s === 1) return 72;
      if (s === 2) return 80;
      if (s === 3) return 88;
      return 96; // 4
    };
    const houseScore100 = getHouseScore100(score);

    // Identify worst planet
    let worstPlanetName = "";
    let lowestPlanetScore = 100;
    for (const p of occupants) {
      const pScore = planetHouseScore(p.name, p.house, p.rashi.index);
      if (pScore < lowestPlanetScore) {
        lowestPlanetScore = pScore;
        worstPlanetName = getPlanetName(p.name);
      }
    }
    if (occupants.length === 0 && houseLordPlacementScore(kundli, h) <= -1) {
      worstPlanetName = getPlanetName(lord);
    }

    let whatIsGood = "";
    let whatIsWrong = "";
    let remedy = "";

    if (isKn) {
      const knGoods = [
        "ಉತ್ತಮ ದೈಹಿಕ ಆರೋಗ್ಯ, ಉನ್ನತ ಆತ್ಮವಿಶ್ವಾಸ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಮತ್ತು ದೃಢ ನಿರ್ಧಾರಗಳು.",
        "ಸ್ಥಿರವಾದ ಹಣಕಾಸಿನ ಆದಾಯ, ಆಕರ್ಷಕ ಮಾತುಗಾರಿಕೆ ಕಲೆ, ಕೌಟುಂಬಿಕ ಸುಖ ಮತ್ತು ಆಸ್ತಿಯ ಲಾಭ.",
        "ಅಸಾಧಾರಣ ಧೈರ್ಯ, ಉತ್ತಮ ಸಂವಹನ ಕಲೆ, ಸಹೋದರರಿಂದ ಸಹಾಯ ಮತ್ತು ಸ್ವಯಂ ಪ್ರಯತ್ನದಲ್ಲಿ ಯಶಸ್ಸು.",
        "ತಾಯಿಯೊಂದಿಗೆ ಉತ್ತಮ ಬಾಂಧವ್ಯ, ಸ್ವಂತ ಮನೆ ಮತ್ತು ಸುಖಕರ ವಾಹನ ಯೋಗ, ನೆಮ್ಮದಿಯ ಜೀವನ.",
        "ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಕಲಾತ್ಮಕ ಪ್ರತಿಭೆ, ಮಕ್ಕಳಿಂದ ಸಂತೋಷ ಮತ್ತು ಅದೃಷ್ಟದ ಒಲವು.",
        "ಶತ್ರುಗಳು ಹಾಗೂ ಸ್ಪರ್ಧಿಗಳ ಮೇಲೆ ವಿಜಯ, ಸಾಲಮುಕ್ತ ಜೀವನ ಮತ್ತು ಉತ್ತಮ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ.",
        "ಉತ್ತಮ ಗುಣದ ಸಂಗಾತಿ, ಸುಖಕರ ವೈವಾಹಿಕ ಜೀವನ, ವ್ಯಾಪಾರ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಲಾಭ ಮತ್ತು ಸಾಮಾಜಿಕ ಗೌರವ.",
        "ದೀರ್ಘಾಯುಷ್ಯ, ಅನಿರೀಕ್ಷಿತ ಧನಲಾಭ, ಆಧ್ಯಾತ್ಮಿಕ ಹಾಗೂ ಸಂಶೋಧನಾ ಜ್ಞಾನದ ವೃದ್ಧಿ.",
        "ಉತ್ತಮ ಅದೃಷ್ಟ, ತಂದೆಯ ಸಂಪೂರ್ಣ ಬೆಂಬಲ, ಧರ್ಮ ಹಾಗೂ ಆಧ್ಯಾತ್ಮದಲ್ಲಿ ಆಸಕ್ತಿ, ಯಾತ್ರೆಯ ಸುಯೋಗ.",
        "ಉದ್ಯೋಗದಲ್ಲಿ ತೇಜಸ್ಸು, ಪ್ರಮೋಷನ್ ಮತ್ತು ನಾಯಕತ್ವದ ಗುಣಗಳು, ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಹಾಗೂ ಗೌರವ.",
        "ಹಲವಾರು ಮೂಲಗಳಿಂದ ಆದಾಯ, ಹಿರಿಯ ಸಹೋದರರಿಂದ ಲಾಭ, ಆಸೆಗಳ ಈಡೇರಿಕೆ ಮತ್ತು ಒಳ್ಳೆ ಸ್ನೇಹಿತರ ವಲಯ.",
        "ಆಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿ, ವಿದೇಶ ಪ್ರಯಾಣದ ಯೋಗ, ಉತ್ತಮ ನಿದ್ರೆ ಹಾಗೂ ದಾನ-ಧರ್ಮಗಳಿಗೆ ಸದ್ವ್ಯಯ."
      ];
      const knWrongs = [
        "ಪದೇ ಪದೇ ದೈಹಿಕ ಆಯಾಸ, ಸಣ್ಣಪುಟ್ಟ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು, ನಂಬಿಕೆಯ ಕೊರತೆ ಮತ್ತು ಗೊಂದಲಮಯ ನಿರ್ಧಾರಗಳು.",
        "ಆರ್ಥಿಕ ಹಿನ್ನಡೆಗಳು, ಕುಟುಂಬದಲ್ಲಿ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮತ್ತು ಕಣ್ಣಿನ ದೃಷ್ಟಿ ಅಥವಾ ಹಲ್ಲುಗಳ ತೊಂದರೆ.",
        "ಸಹೋದರರೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು, ಮಾನಸಿಕ ಅಂಜಿಕೆ, ನಿಷ್ಪ್ರಯೋಜಕ ಪ್ರಯಾಣಗಳು ಮತ್ತು ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ವಿಳಂಬ ಫಲ.",
        "ತಾಯಿಯ ಆರೋಗ್ಯದ ಏರುಪೇರು, ಮನೆ ಅಥವಾ ಆಸ್ತಿಗೆ ಸಂಬಂಧಿಸಿದ ವಿವಾದಗಳು, ಮಾನಸಿಕ ನೆಮ್ಮದಿಯ ಕೊರತೆ.",
        "ಸಂತಾನ ಭಾಗ್ಯದಲ್ಲಿ ವಿಳಂಬ ಅಥವಾ ಮಕ್ಕಳ ಆರೋಗ್ಯದ ಕಾಳಜಿ, ಶಿಕ್ಷಣದಲ್ಲಿ ಏಕಾಗ್ರತೆಯ ಕೊರತೆ, ಜೂಜಾಟದಲ್ಲಿ ನಷ್ಟ.",
        "ಸಾಲಬಾಧೆ ಹೆಚ್ಚಾಗುವುದು, ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ समस्याಗಳು, ನಂಬಿದವರಿಂದ ಮೋಸ ಹಾಗೂ ಕೋರ್ಟ್ ವ್ಯವಹಾರಗಳ ಚಿಂತೆ.",
        "ವೈವಾಹಿಕ ಜೀವನದಲ್ಲಿ ಸಾಮರಸ್ಯದ ಕೊರತೆ, ಮದುವೆಯಲ್ಲಿ ವಿಳಂಬ, ವ್ಯಾಪಾರಸ್ಥರಲ್ಲಿ ಗೊಂದಲಗಳು.",
        "ಅನಿರೀಕ್ಷಿತ ಸವಾಲುಗಳು, ಅಪಘಾತಗಳ ಭಯ, ದೀರ್ಘಕಾಲದ ದೈಹಿಕ ಅಸ್ವಸ್ಥತೆ ಮತ್ತು ವಿಪರೀತ ಮಾನಸಿಕ ಬೇಸರ.",
        "ಅವಕಾಶಗಳು ಕೈತಪ್ಪುವುದು, ತಂದೆಯೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು, ಉನ್ನತ ಶಿಕ್ಷಣದಲ್ಲಿ ಅಡೆತಡೆಗಳು.",
        "ಉದ್ಯೋಗದಲ್ಲಿ ಅಸ್ಥಿರತೆ, ಉದ್ಯೋಗ ನಷ್ಟದ ಭೀತಿ, ಕಠಿಣ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಸಿಗದಿರುವುದು.",
        "ಆದಾಯದಲ್ಲಿ ಏರಿಳಿತಗಳು, ಧನ ನಷ್ಟದ ಮುನ್ಸೂಚನೆ, ನಂಬಿದ ಸ್ನೇಹಿತರಿಂದ ವಂಚನೆ.",
        "ಅತಿಯಾದ ಹಣಕಾಸಿನ ಖರ್ಚು, ಆಸ್ಪತ್ರೆ ವೆಚ್ಚಗಳು, ನಿದ್ರಾಹೀನತೆ ಮತ್ತು ಒಂಟಿತನದ ಭಾವನೆ."
      ];
      const knRemedies = [
        "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ರವಿಗೆ ತರ್ಪಣ ನೀಡಿ ಅಥವಾ ಶಿವನಿಗೆ ಜಲಾಭಿಷೇಕ ಮಾಡಿ.",
        "ಶುಕ್ರವಾರದಂದು ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿಗೆ ಪ್ರಾರ್ಥನೆ ಸಲ್ಲಿಸಿ ಹಾಗೂ ಹಸುವಿಗೆ ಹುಲ್ಲು ನೀಡಿ.",
        "ಮಂಗಳವಾರದಂದು ಆಂಜನೇಯ ಸ್ವಾಮಿ ದೇವಸ್ಥಾನಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ಪ್ರಾರ್ಥಿಸಿ.",
        "ತಾಯಿಯ ಆಶೀರ್ವಾದ ಪಡೆಯಿರಿ ಮತ್ತು ಸೋಮವಾರದಂದು ದುರ್ಗಾ ದೇವಿಯನ್ನು ಆರಾಧಿಸಿ.",
        "ಪ್ರತಿದಿನ ಗಣಪತಿಗೆ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ ಹಾಗೂ ಗಾಯತ್ರಿ ಮಂತ್ರ ಜಪಿಸಿ.",
        "ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಆರಾಧನೆ ಮಾಡಿ ಹಾಗೂ ಶನಿವಾರದಂದು ಬೀದಿ ನಾಯಿಗಳಿಗೆ ಆಹಾರ ನೀಡಿ.",
        "ಶಿವ-ಪಾರ್ವತಿ ಕಲ್ಯಾಣ ಆರಾಧನೆ ಮಾಡಿ ಹಾಗೂ ಶುಕ್ರವಾರ ದೇವಸ್ಥಾನಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.",
        "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರವನ್ನು ಜಪಿಸಿ ಅಥವಾ ಕಾಲಭೈರವನ ಆರಾಧನೆ ಮಾಡಿ.",
        "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಗುರು ಹಿರಿಯರನ್ನು ಗೌರವಿಸಿ.",
        "ಶನಿವಾರ ಶನಿದೇವನಿಗೆ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಹಾಗೂ ಬಡವರಿಗೆ ಸಹಾಯ ಮಾಡಿ.",
        "ಪಕ್ಷಿಗಳಿಗೆ ಧಾನ್ಯಗಳನ್ನು ಹಾಕಿ ಹಾಗೂ ದಾನ ಧರ್ಮಗಳನ್ನು ಮಾಡಿ.",
        "ದಾನ ಶಾಲೆಗಳಿಗೆ ಅಥವಾ ಅನಾಥಾಲಯಕ್ಕೆ ಸಹಾಯ ಮಾಡಿ ಹಾಗೂ ಮಲಗುವ ಮುನ್ನ ಧ್ಯಾನ ಮಾಡಿ."
      ];

      whatIsGood = knGoods[h - 1]!;
      whatIsWrong = knWrongs[h - 1]!;
      remedy = knRemedies[h - 1]!;
    } else if (isHi) {
      const hiGoods = [
        "उत्कृष्ट शारीरिक स्वास्थ्य, मजबूत इच्छाशक्ति, आत्मविश्वास से भरपूर दृष्टिकोण और आकर्षक व्यक्तित्व।",
        "स्थिर धन संचय, मधुर और प्रभावशाली वाणी, पारिवारिक सुख और संपत्ति का लाभ।",
        "अदम्य साहस, उत्कृष्ट संचार कौशल, छोटे भाई-बहनों का सहयोग और आत्म-प्रयासों में सफलता।",
        "माता के साथ गहरा प्रेम, सुखद वाहन और गृह सुख, मानसिक शांति।",
        "तेज बुद्धि, कलात्मक प्रतिभा, बच्चों से सुख और पूर्व जन्म के पुण्यों से भाग्य का साथ।",
        "शत्रुओं पर विजय, मजबूत रोग प्रतिरोधक क्षमता, ऋणमुक्ति और व्यावसायिक उत्कृष्टता।",
        "प्यारा और सहयोगी जीवनसाथी, सुखी वैवाहिक जीवन, साझेदारी के व्यवसाय में लाभ और सामाजिक मान-सम्मान।",
        "दीर्घायु, अचानक धन लाभ या पैतृक संपत्ति, गहन अनुसंधान या गुप्त विधाओं में रुचि।",
        "उत्कृष्ट भाग्य, पिता का सहयोग, धर्म और अध्यात्म में रुचि, तीर्थयात्रा का योग।",
        "करियर में तीव्र प्रगति, व्यावसायिक नेतृत्व, समाज में उच्च पद-प्रतिष्ठा और मान-सम्मान।",
        "आय के एक से अधिक स्रोत, बड़े भाई-बहनों से लाभ, इच्छाओं की पूर्ति और अच्छा मित्र मंडली।",
        "आद्यात्मिक उन्नति, विदेश यात्रा या प्रवास के योग, गहरी नींद और पुण्य कार्यों में व्यय।"
      ];
      const hiWrongs = [
        "शारीरिक कमजोरी, थकान, आत्मविश्वास की कमी और जीवन में सही दिशा का अभाव।",
        "अचानक वित्तीय नुकसान, पारिवारिक विवाद, वाणी दोष या नेत्र/दंत पीड़ा।",
        "भाई-बहनों से वैचारिक मतभेद, मानसिक भय, व्यर्थ की यात्राएं और प्रयासों के फल में देरी।",
        "माता के स्वास्थ्य में उतार-चढ़ाव, संपत्ति या भूमि विवाद, घरेलू कलह और मानसिक चिंता।",
        "संतान पक्ष को लेकर चिंता, शिक्षा में बाधा, सट्टा या शेयर बाजार में अप्रत्याशित नुकसान।",
        "सजा या ऋण का बढ़ना, पुरानी बीमारियां, कानूनी विवाद और गुप्त शत्रुओं की परेशानी।",
        "दांपत्य जीवन में तनाव, विवाह में देरी, व्यापारिक साझेदार से मतभेद।",
        "अचानक आने वाली बाधाएं, दुर्घटना का भय, दीर्घकालिक बीमारियां और मानसिक अवसाद।",
        "महत्वपूर्ण समय पर भाग्य का साथ न मिलना, पिता से अनबन, उच्च शिक्षा में रुकावटें।",
        "नौकरी में अस्थिरता, पद खोने का भय, वरिष्ठ अधिकारियों से मतभेद और असंतोष।",
        "आय में अनिश्चितता, महत्वाकांक्षाओं का पूरा न होना, मित्रों से विश्वासघात।",
        "अनावश्यक रूप से अत्यधिक खर्च, अस्पताल का व्यय, अनिद्रा और अकेलापन।"
      ];
      const hiRemedies = [
        "रोज सुबह सूर्य को अर्घ्य दें या भगवान शिव का जलाभिषेक करें।",
        "शुक्रवार को देवी लक्ष्मी की पूजा करें और गाय को हरी घास खिलाएं।",
        "मंगलवार को हनुमान चालीसा का पाठ करें और भाई-बहनों की मदद करें।",
        "माता का आशीर्वाद लें और सोमवार को मां दुर्गा की पूजा करें।",
        "भगवान गणेश की आराधना करें और गायत्री मंत्र का जाप करें।",
        "भगवान कार्तिकेय की पूजा करें और शनिवार को कुत्ते को भोजन दें।",
        "शिव-पार्वती की संयुक्त पूजा करें और शुक्रवार को मिठाई का दान करें।",
        "महामृत्युंजय मंत्र का जाप करें या काल भैरव की आराधना करें।",
        "विष्णु सहस्रनाम का पाठ करें और गुरुजनों का आदर करें।",
        "शनिवार को शनि देव के मंदिर में सरसों के तेल का दीपक जलाएं।",
        "पक्षियों को दाना डालें और गरीबों की सहायता करें।",
        "अनाथालय में दान दें और सोने से पहले ध्यान (मेडिटेशन) करें।"
      ];

      whatIsGood = hiGoods[h - 1]!;
      whatIsWrong = hiWrongs[h - 1]!;
      remedy = hiRemedies[h - 1]!;
    } else {
      const enGoods = [
        "Excellent physical health, strong self-confidence, magnetic personality, and clear determination.",
        "Steady wealth accumulation, persuasive and sweet speech, family harmony, and ancestral asset gains.",
        "Exceptional courage, clear communication skills, support from siblings, and success in self-efforts.",
        "Deep emotional bond with mother, luxury vehicles, comfortable real estate assets, and mental peace.",
        "Sharp intellect, creative talents, success/happiness from children, and past-life luck support.",
        "Victory over rivals, robust immunity, capability to clear debts, and dedicated work service.",
        "Loving and supportive spouse, happy marriage, highly profitable partnerships, and respect in society.",
        "Long lifespan, sudden financial gains/inheritance, interest in deep research or occult sciences.",
        "Strong fortune, active support from father, spiritual/dharmic inclination, and travel success.",
        "Rapid career growth, professional leadership, high status in society, and honors.",
        "Multiple streams of income, gains from elder siblings, fulfillment of long-term desires, and good friends.",
        "Spiritual progress, foreign travel/settlement success, peaceful sleep, and charity expenditures."
      ];
      const enWrongs = [
        "Physical fatigue, minor health issues, lack of self-confidence, and feeling of confusion.",
        "Unexpected financial delays, disputes within family, speech challenges, and eye/teeth concerns.",
        "Friction with siblings, sudden anxiety, fruitlessness of travels, and delayed outcomes of hard work.",
        "Mother's weak health, property or land disputes, vehicle maintenance issues, and domestic stress.",
        "Delay or concerns about children, academic setbacks, and financial losses in speculative actions.",
        "Mounting debts, chronic health issues, legal worries, and hidden enemies causing stress.",
        "Marital friction, delay in marriage, partnership trust issues, and public misunderstandings.",
        "Sudden obstacles, risk of minor accidents, prolonged health concerns, and emotional blockages.",
        "Lack of luck at critical times, differences with father, delayed higher studies, or travel fatigue.",
        "Career instability, job loss worries, lack of professional appreciation, and friction with superiors.",
        "Income fluctuations, delays in dream fulfillment, betrayal by friends, or sibling disputes.",
        "High hospital expenses, uncontrolled waste of money, sleep disorders, and isolation."
      ];
      const enRemedies = [
        "Offer Arghya to the Sun at sunrise or perform water offering to Lord Shiva.",
        "Worship Goddess Lakshmi on Fridays and feed green grass to cows.",
        "Recite Hanuman Chalisa on Tuesdays and assist younger siblings.",
        "Respect your mother daily and worship Goddess Durga on Mondays.",
        "Pray to Lord Ganesha daily and chant the Gayatri Mantra.",
        "Worship Lord Subramanya (Kartikeya) and feed stray dogs on Saturdays.",
        "Worship Lord Shiva and Goddess Parvati together, and donate sweets on Fridays.",
        "Chant the Mahamrityunjaya Mantra or worship Lord Kala Bhairava.",
        "Recite Sri Vishnu Sahasranama and respect your teachers/elders.",
        "Light a sesame oil lamp for Lord Saturn on Saturdays and perform selfless service.",
        "Feed birds with grains and contribute to charitable causes.",
        "Donate to orphanages or shelter homes, and practice meditation before sleep."
      ];

      whatIsGood = enGoods[h - 1]!;
      whatIsWrong = enWrongs[h - 1]!;
      remedy = enRemedies[h - 1]!;
    }
    
    // DYNAMIC RULE ENGINE: Apply Baggona Panchanga rules based on generated Kundali (occupants)
    let dynamicGood = whatIsGood;
    let dynamicWrong = whatIsWrong;
    
    for (const p of occupants) {
      if (isKn) {
        if (p.name === PN.Jupiter) dynamicGood += " ಗುರು ಗ್ರಹದ ಉಪಸ್ಥಿತಿಯಿಂದಾಗಿ ಜ್ಞಾನ, ಸಂಪತ್ತು ಮತ್ತು ಶುಭ ಫಲಗಳು ಹೆಚ್ಚಾಗುತ್ತವೆ.";
        if (p.name === PN.Venus) dynamicGood += " ಶುಕ್ರನ ಪ್ರಭಾವದಿಂದ ಕಲೆ, ಸೌಂದರ್ಯ ಮತ್ತು ಐಷಾರಾಮಿ ಜೀವನ ಸುಗಮವಾಗುತ್ತದೆ.";
        if (p.name === PN.Saturn) dynamicWrong += " ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಳಂಬ ಮತ್ತು ಹೆಚ್ಚಿನ ಶ್ರಮದ ಅಗತ್ಯವಿರುತ್ತದೆ.";
        if (p.name === PN.Mars) dynamicWrong += " ಮಂಗಳನ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೋಪ, ಆತುರ ಮತ್ತು ವಿವಾದಗಳು ಎದುರಾಗಬಹುದು.";
        if (p.name === PN.Rahu) dynamicWrong += " ರಾಹುವಿನಿಂದಾಗಿ ಗೊಂದಲ, ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಭ್ರಮೆ ಮೂಡಬಹುದು.";
        if (p.name === PN.Ketu) dynamicWrong += " ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದ ವಿರಕ್ತಿ, ಅಸಡ್ಡೆ ಮತ್ತು ಒಂಟಿತನ ಕಾಡಬಹುದು.";
        if (p.name === PN.Moon) dynamicGood += " ಚಂದ್ರನಿಂದಾಗಿ ಮನಸ್ಸಿಗೆ ಶಾಂತಿ, ಭಾವನಾತ್ಮಕ ಬೆಂಬಲ ಮತ್ತು ಸೌಮ್ಯತೆ ದೊರೆಯುತ್ತದೆ.";
        if (p.name === PN.Sun) dynamicGood += " ರವಿಯಿಂದಾಗಿ ನಾಯಕತ್ವ, ತೇಜಸ್ಸು ಮತ್ತು ಸರ್ಕಾರಿ/ಅಧಿಕೃತ ಕೆಲಸಗಳಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗುತ್ತದೆ.";
        if (p.name === PN.Mercury) dynamicGood += " ಬುಧನ ಪ್ರಭಾವದಿಂದ ಬುದ್ಧಿವಂತಿಕೆ, ವ್ಯಾಪಾರ ಕೌಶಲ್ಯ ಮತ್ತು ಸಂವಹನ ಶಕ್ತಿ ವೃದ್ಧಿಸುತ್ತದೆ.";
      } else if (isHi) {
        if (p.name === PN.Jupiter) dynamicGood += " गुरु ग्रह की उपस्थिति से ज्ञान, धन और शुभ फलों में वृद्धि होती है।";
        if (p.name === PN.Venus) dynamicGood += " शुक्र के प्रभाव से कला, सौंदर्य और विलासितापूर्ण जीवन सुगम होता है।";
        if (p.name === PN.Saturn) dynamicWrong += " शनि के प्रभाव से कार्यों में देरी और अधिक परिश्रम की आवश्यकता होती है।";
        if (p.name === PN.Mars) dynamicWrong += " मंगल के प्रभाव से क्रोध, जल्दबाजी और विवादों का सामना करना पड़ सकता है।";
        if (p.name === PN.Rahu) dynamicWrong += " राहु के कारण भ्रम, अप्रत्याशित बदलाव और मानसिक उलझन हो सकती है।";
        if (p.name === PN.Ketu) dynamicWrong += " केतु के प्रभाव से वैराग्य, अलगाव और अकेलेपन की भावना आ सकती है।";
        if (p.name === PN.Moon) dynamicGood += " चंद्रमा के कारण मन को शांति, भावनात्मक समर्थन और सौम्यता मिलती है।";
        if (p.name === PN.Sun) dynamicGood += " सूर्य के कारण नेतृत्व, तेज और सरकारी/आधिकारिक कार्यों में सफलता मिलती है।";
        if (p.name === PN.Mercury) dynamicGood += " बुध के प्रभाव से बुद्धिमत्ता, व्यापारिक कौशल और संचार शक्ति बढ़ती है।";
      } else {
        if (p.name === PN.Jupiter) dynamicGood += " Jupiter's presence enhances wisdom, wealth, and highly auspicious results.";
        if (p.name === PN.Venus) dynamicGood += " Venus brings comfort, artistic inclination, and luxury into this area.";
        if (p.name === PN.Saturn) dynamicWrong += " Saturn causes delays, demanding extra hard work and extreme patience.";
        if (p.name === PN.Mars) dynamicWrong += " Mars may trigger sudden anger, impulsive actions, and conflicts here.";
        if (p.name === PN.Rahu) dynamicWrong += " Rahu induces confusion, unexpected twists, and illusions in this domain.";
        if (p.name === PN.Ketu) dynamicWrong += " Ketu brings a sense of detachment, isolation, and lack of worldly interest.";
        if (p.name === PN.Moon) dynamicGood += " The Moon provides emotional support, mental peace, and gentleness.";
        if (p.name === PN.Sun) dynamicGood += " The Sun brings leadership, vitality, and success in authoritative matters.";
        if (p.name === PN.Mercury) dynamicGood += " Mercury significantly boosts intelligence, business acumen, and communication skills.";
      }
    }
    
    // Also append Lord rules if the house is empty
    if (occupants.length === 0) {
      if (isKn) {
        dynamicGood += ` ಈ ಭಾವದ ಅಧಿಪತಿ ${lordName} ಆಗಿರುವುದರಿಂದ, ಇವರ ಅನುಗ್ರಹದಿಂದ ಸ್ಥಿರತೆ ಲಭಿಸುತ್ತದೆ.`;
        dynamicWrong += ` ಆದಾಗ್ಯೂ, ${lordName}ನ ಸ್ಥಾನಮಾನದ ಆಧಾರದ ಮೇಲೆ ಫಲಿತಾಂಶಗಳು ಬದಲಾಗುತ್ತವೆ.`;
      } else if (isHi) {
        dynamicGood += ` इस भाव के स्वामी ${lordName} होने के कारण, उनकी कृपा से स्थिरता मिलती है।`;
        dynamicWrong += ` हालांकि, ${lordName} की स्थिति के आधार पर परिणाम बदल सकते हैं।`;
      } else {
        dynamicGood += ` Being ruled by ${lordName}, this house inherently carries its stabilizing grace.`;
        dynamicWrong += ` However, the outcomes heavily rely on ${lordName}'s placement elsewhere.`;
      }
    }

    whatIsGood = dynamicGood;
    whatIsWrong = dynamicWrong;

    let title = "";
    let description = "";

    if (isKn) {
      title = BHAVA_NAMES_KN[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_KN[h - 1]!;
      let lordText = `ಈ ಭಾವದ ಅಧಿಪತಿ ${lordName} ಗ್ರಹವಾಗಿದ್ದು, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lordHouse}ನೇ ಮನೆಯಲ್ಲಿ (${lordRashiName} ರಾಶಿಯಲ್ಲಿ) ನೆಲೆಸಿದ್ದಾರೆ. `;
      let occupantText = occupants.length > 0
        ? `ಈ ಭಾವದಲ್ಲಿ ${occupantsStr} ರವರ ಉಪಸ್ಥಿತಿಯಿದೆ. `
        : `ಈ ಭಾವದಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹಗಳು ನೆಲೆಸಿಲ್ಲ, ಇದು ಶಾಂತವಾಗಿದೆ. `;
      let analysisText = "";
      if (status === "positive") {
        analysisText = `ಇದು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಅತ್ಯಂತ ಬಲಶಾಲಿ ಹಾಗೂ ಶುಭದಾಯಕವಾದ ಭಾವವಾಗಿದೆ. ಈ ಸ್ಥಾನದಲ್ಲಿರುವ ಗ್ರಹಗಳ ಅನುಕೂಲಕರ ಜೋಡಣೆಯು ನಿಮಗೆ ${sigs} ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಸುಲಭ ಯಶಸ್ಸು, ಶೀಘ್ರ ಪ್ರಗತಿ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಫಲಿತಾಂಶಗಳನ್ನು ನೀಡುತ್ತದೆ. ಈ ವಿಷಯಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳು ಯಶಸ್ವಿಯಾಗುತ್ತವೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ತರುತ್ತವೆ.`;
      } else if (status === "caution") {
        analysisText = `ಈ ಭಾವವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಕೆಲವು ಸವಾಲುಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಿಮಗೆ ${sigs} ವಿಷಯಗಳಲ್ಲಿ ಹಠಾತ್ ಅಡೆತಡೆಗಳು, ನಿಧಾನಗತಿಯ ಪ್ರಗತಿ ಅಥವಾ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಎದುರಾಗಬಹುದು. ಇದನ್ನು ಒಂದು ಕಲಿಕೆಯ ಹಂತವೆಂದು ಪರಿಗಣಿಸಿ, ಅವಸರದ ನಿರ್ಧಾರಗಳನ್ನು ತಡೆದು ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಹಿತಕರ.`;
      } else {
        analysisText = `ಈ ಭಾವವು ಮಧ್ಯಮ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದ್ದು ಅತ್ಯಂತ ಸಮತೋಲಿತವಾಗಿದೆ. ${sigs} ಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಿಷಯಗಳು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಯತ್ನಗಳು, ಪರಿಶ್ರಮ ಮತ್ತು ಶಿಸ್ತಿನ ಆಧಾರದ ಮೇಲೆ ಹಂತಹಂತವಾಗಿ ಸುಧಾರಿಸುತ್ತವೆ. ಇಲ್ಲಿ ಹಠಾತ್ ಏರಿಳಿತಗಳಿಲ್ಲದೆ ಸ್ಥಿರವಾದ ಫಲಗಳು ಲಭಿಸುತ್ತವೆ.`;
      }
      const karakaText = `\n\nಭಾವ ಕಾರಕ: ಈ ಮನೆಗೆ ನೈಸರ್ಗಿಕ ಕಾರಕ ಗ್ರಹ ${HOUSE_KARAKAS_INFO[h].kn} ಆಗಿದೆ. ಜಾತಕದಲ್ಲಿ ಈ ಕಾರಕ ಗ್ರಹದ ಬಲವನ್ನು ನೋಡುವುದು ಈ ಭಾವದ ಪೂರ್ಣ ಫಲಗಳನ್ನು ಅರಿಯಲು ಅಗತ್ಯವಾಗಿರುತ್ತದೆ.`;
      const lordPlacementText = `\n\nಭಾವಾಧಿಪತಿ ಸ್ಥಿತಿ ವಿವರಣೆ: ಈ ಭಾವದ ಅಧಿಪತಿಯಾದ ${lordName} ಜಾತಕದ ${lordHouse}ನೇ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿರುವುದು ನಿಮ್ಮ ಜೀವನದ ಪ್ರಮುಖ ಶಕ್ತಿಯನ್ನು ${lordHouse}ನೇ ಮನೆಗೆ ಸಂಬಂಧಿಸಿದ ವಿಷಯಗಳ ಕಡೆಗೆ ತಿರುಗಿಸುತ್ತದೆ. ಇದು ಆ ಭಾವದ ಕಾರಕತ್ವಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸುತ್ತದೆ.`;
      description = `ಭಾವ ವಿವರಣೆ: ಈ ಭಾವವು ${sigs} ಸೂಚಿಸುತ್ತದೆ. ${lordText}${occupantText}${analysisText}${karakaText}${lordPlacementText}`;
    } else if (isHi) {
      title = BHAVA_NAMES_HI[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_HI[h - 1]!;
      let lordText = `इस भाव के स्वामी ${lordName} हैं, जो आपकी कुंडली के ${lordHouse}वें भाव (${lordRashiName} राशि) में स्थित हैं। `;
      let occupantText = occupants.length > 0
        ? `इस भाव में ${occupantsStr} विराजमान हैं। `
        : `यह भाव वर्तमान में रिक्त है। `;
      let analysisText = "";
      if (status === "positive") {
        analysisText = `यह आपकी जन्म कुंडली में अत्यंत बलवान और शुभ फल देने वाला भाव है। ग्रहों की अनुकूल स्थिति के कारण आपको ${sigs} के क्षेत्रों में विशेष सफलता, प्रगति और लाभ प्राप्त होंगे। आपके प्रयास सही दिशा में आगे बढ़ेंगे और सकारात्मक परिणाम सामने आएंगे।`;
      } else if (status === "caution") {
        analysisText = `यह भाव आपकी कुंडली में कुछ संघर्ष या चुनौतियों को दर्शाता है। आपको ${sigs} से संबंधित मामलों में उतार-चढ़ाव, कार्यों में देरी या वैचारिक मतभेद का सामना करना पड़ सकता है। कोई भी बड़ा निर्णय लेने में जल्दबाजी न करें और धैर्य से काम लें।`;
      } else {
        analysisText = `यह भाव सामान्य और संतुलित प्रभाव देने वाला है। ${sigs} से जुड़े मामलों में प्रगति आपके व्यक्तिगत प्रयासों और निरंतरता पर निर्भर करेगी। इसमें कोई बड़ा नकारात्मक प्रभाव नहीं है, अतः मेहनत से आप अच्छे परिणाम पा सकते हैं।`;
      }
      const karakaText = `\n\nभाव कारक: इस भाव के नैसर्गिक कारक ${HOUSE_KARAKAS_INFO[h].hi} हैं। आपकी कुंडली में इस कारक ग्रह की स्थिति इस भाव के फलों को मुख्य रूप से प्रभावित करती है।`;
      const lordPlacementText = `\n\nभावेष स्थिति फल: इस भाव के स्वामी (${lordName}) कुंडली के ${lordHouse}वें भाव में स्थित हैं। यह संयोजन आपके जीवन के मुख्य उद्देश्यों और अनुभवों को ${lordHouse}वें भाव के विषयों से जोड़ता है।`;
      description = `भाव फल: यह भाव ${sigs} को दर्शाता है। ${lordText}${occupantText}${analysisText}${karakaText}${lordPlacementText}`;
    } else {
      title = BHAVA_NAMES_EN[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_EN[h - 1]!;
      let lordText = `The lord of this house is ${lordName}, placed in House ${lordHouse} (${lordRashiName} Rashi). `;
      let occupantText = occupants.length > 0
        ? `It is occupied by ${occupantsStr}. `
        : `It is unoccupied. `;
      let analysisText = "";
      if (status === "positive") {
        analysisText = `This indicates an exceptionally strong, robust, and highly auspicious house in your birth chart. The cosmic alignment here promises substantial ease, rapid progress, and outstanding success in matters related to ${sigs.toLowerCase()}. You will find that opportunities in these spheres arrive naturally, and your efforts are magnified with positive outcomes.`;
      } else if (status === "caution") {
        analysisText = `This indicates a challenging, afflicted, or sensitive house in your chart. You are likely to face temporary hurdles, slow progress, or recurring friction in matters related to ${sigs.toLowerCase()}. Astrologically, this is a karmic classroom prompting you to act with extra prudence, avoid hasty decisions, and cultivate persistent patience to transform these obstacles into growth.`;
      } else {
        analysisText = `This house is moderately placed, exhibiting a balanced, average strength. Matters governed by ${sigs.toLowerCase()} will progress steadily but will depend primarily on your conscious effort, self-discipline, and dedicated actions. It is a stable area of life where neither major sudden losses nor effortless fortunes are indicated.`;
      }
      const karakaText = `\n\nNatural House Karaka: The natural significator for this house is ${HOUSE_KARAKAS_INFO[h].en}. Analyzing this Karaka's position in your chart is essential to unlock the full potential of this bhava.`;
      const lordPlacementText = `\n\nLord Placement Detail: The ruler of this house (${lordName}) is posited in House ${lordHouse}. This links the core themes of the ${h}th house to the experiences governed by the ${lordHouse}th house, driving your life focus and actions towards those areas.`;
      description = `Signification: This house governs ${sigs}. ${lordText}${occupantText}${analysisText}${karakaText}${lordPlacementText}`;
    }

    // Adjust score if Saturn is posited or aspecting
    const saturnPl = kundli.planets.find(p => p.name === PN.Saturn);
    let finalScore = score;
    if (saturnPl) {
      const saturnHouse = saturnPl.house;
      const h3 = (saturnHouse + 2) > 12 ? (saturnHouse + 2) - 12 : saturnHouse + 2;
      const h7 = (saturnHouse + 6) > 12 ? (saturnHouse + 6) - 12 : saturnHouse + 6;
      const h10 = (saturnHouse + 9) > 12 ? (saturnHouse + 9) - 12 : saturnHouse + 9;
      if ([saturnHouse, h3, h7, h10].includes(h)) {
        finalScore -= 1;
      }
    }
    const finalScore100 = getHouseScore100(Math.max(-4, Math.min(4, finalScore)));

    if (saturnPl) {
      const saturnHouse = saturnPl.house;
      const h3 = (saturnHouse + 2) > 12 ? (saturnHouse + 2) - 12 : saturnHouse + 2;
      const h7 = (saturnHouse + 6) > 12 ? (saturnHouse + 6) - 12 : saturnHouse + 6;
      const h10 = (saturnHouse + 9) > 12 ? (saturnHouse + 9) - 12 : saturnHouse + 9;

      if (h === saturnHouse) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿದ್ದು, ಶಿಸ್ತು ಮತ್ತು ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆಯನ್ನು ನೀಡುತ್ತಾನೆ.";
        } else if (isHi) {
          description += " शनि इस भाव में स्थित हैं, जो अनुशासन और जिम्मेदारी लाते हैं।";
        } else {
          description += " Saturn is posited in this house, bringing discipline and structural delays.";
        }
      } else if (h === h3) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೩ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ.";
        } else if (isHi) {
          description += " शनि की ३वीं दृष्टि इस भाव पर पड़ रही है।";
        } else {
          description += " Saturn casts its 3rd aspect on this house, demanding extra efforts.";
        }
      } else if (h === h7) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೭ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ.";
        } else if (isHi) {
          description += " शनि की ७वीं दृष्टि इस भाव पर पड़ रही है।";
        } else {
          description += " Saturn casts its 7th aspect on this house, requiring patience.";
        }
      } else if (h === h10) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೧೦ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ.";
        } else if (isHi) {
          description += " शनि की १०वीं दृष्टि इस भाव पर पड़ रही है।";
        } else {
          description += " Saturn casts its 10th aspect on this house, indicating duty and focus.";
        }
      }
    }

    const karakas = HOUSE_KARAKAS[h] || [];
    const karakaNames = karakas.map(k => getPlanetName(k)).join(", ");
    if (isKn) {
      description += `\n\nಭಾವ ಕಾರಕತ್ವ: ಈ ಭಾವಕ್ಕೆ ಕಾರಕ ಗ್ರಹಗಳು: ${karakaNames}.`;
    } else if (isHi) {
      description += `\n\nभाव कारकत्व: इस भाव के कारक ग्रह हैं: ${karakaNames}।`;
    } else {
      description += `\n\nHouse Karakas (Significators): Significator planets for this house: ${karakaNames}.`;
    }

    houses.push({
      title,
      description,
      score: finalScore100,
      status,
      whatIsGood,
      whatIsWrong,
      remedy,
      worstPlanet: worstPlanetName,
      houseLord: lordName,
      occupants: occupantsStr
    });
  }

  // --- 4. YOGAS & AYUSH ---
  const yogas: BaggonaPredictionSection[] = [];
  
  if (debilitatedCount > 0 && exaltedCount > 0) {
    let title = "Neechabhanga Rajayoga";
    let description = "You have a beautiful combination of both exalted and debilitated planets. Under traditional rules, the weaknesses of debilitated planets are naturally transformed and cancelled, granting you profound growth and success after initial learning periods.";

    if (isKn) {
      title = "ನೀಚಭಂಗ ರಾಜಯೋಗ";
      description = "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಉಚ್ಛ ಹಾಗೂ ನೀಚ ಗ್ರಹಗಳೆರಡರ ಮಿಶ್ರಣವಿದೆ. ಸಾಂಪ್ರದಾಯಿಕ ವೈದಿಕ ನಿಯಮಗಳ ಪ್ರಕಾರ, ನೀಚ ಗ್ರಹದ ದೌರ್ಬಲ್ಯಗಳು ಇಲ್ಲವಾಗಿ ರಾಜಯೋಗವಾಗಿ ಬದಲಾಗುತ್ತವೆ. ಆರಂಭಿಕ ಅಡೆತಡೆಗಳ ನಂತರ ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಉತ್ತಮ ಅಧಿಕಾರ ಹಾಗೂ ದೊಡ್ಡ ಮಟ್ಟದ ಯಶಸ್ಸನ್ನು ಇದು ತರುತ್ತದೆ.";
    } else if (isHi) {
      title = "नीचभंग राजयोग";
      description = "आपकी कुंडली में उच्च और नीच दोनों प्रकार के ग्रहों का एक दुर्लभ योग बन रहा है। ज्योतिषीय नियमों के अनुसार, नीच ग्रहों की दुर्बलता स्वतः समाप्त होकर राजयोग में बदल जाती है, जिससे जीवन के संघर्षों के बाद आपको बड़ी सफलता और कीर्ति प्राप्त होगी।";
    }
    yogas.push({ title, description });
  }

  const upachayaMalefics: string[] = [];
  for (const p of kundli.planets) {
    const isMalefic = p.name === PN.Saturn || p.name === PN.Mars || p.name === PN.Sun || p.name === PN.Rahu || p.name === PN.Ketu;
    const isUpachaya = p.house === 3 || p.house === 6 || p.house === 11;
    if (isMalefic && isUpachaya) {
      upachayaMalefics.push(getPlanetName(p.name));
    }
  }

  if (upachayaMalefics.length > 0) {
    const pNames = upachayaMalefics.join(", ");
    let title = "Courageous Planets in Growth Houses (Upachaya)";
    let description = `The planets ${pNames} are placed in the growth-oriented houses (3rd, 6th, or 11th). In traditional Vedic astrology, active planets in these houses represent great courage, high ambition, victory over competing forces, and excellent gains over time.`;

    if (isKn) {
      title = "ಉಪಚಯ ಸ್ಥಾನಗಳಲ್ಲಿ ಕ್ರಿಯಾಶೀಲ ಗ್ರಹಗಳು";
      description = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${pNames} ಗ್ರಹಗಳು ಪ್ರಗತಿಶೀಲ ಉಪಚಯ ಸ್ಥಾನಗಳಲ್ಲಿ (೩, ೬ ಅಥವಾ ೧೧ ನೇ ಭಾವ) ನೆಲೆಸಿವೆ. ಸಾಂಪ್ರದಾಯಿಕ ನಂಬಿಕೆಗಳ ಪ್ರಕಾರ, ಈ ಗ್ರಹಗಳು ನಿಮ್ಮಲ್ಲಿ ಅದ್ಭುತ ಧೈರ್ಯ, ಕಠಿಣ ಸವಾಲುಗಳನ್ನು ಗೆಲ್ಲುವ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಉತ್ತಮ ಆದಾಯವನ್ನು ನೀಡುತ್ತವೆ.`;
    } else if (isHi) {
      title = "उपचय भावों में साहसी ग्रह";
      description = `आपकी कुंडली के वृद्धि कारक उपचय भावों (3, 6 या 11) में ${pNames} ग्रह स्थित हैं। ज्योतिष शास्त्र के अनुसार, इन भावों में ग्रहों की यह स्थिति आपके साहस, प्रतियोगिता में विजय और समय के साथ निरंतर बढ़ती हुई आय की ओर संकेत करती है।`;
    }
    yogas.push({ title, description });
  }

  const kendraBenefics: string[] = [];
  for (const p of kundli.planets) {
    const isBenefic = p.name === PN.Jupiter || p.name === PN.Venus || p.name === PN.Mercury || p.name === PN.Moon;
    const isKendraOrTrikona = p.house === 1 || p.house === 4 || p.house === 7 || p.house === 10 || p.house === 5 || p.house === 9;
    if (isBenefic && isKendraOrTrikona) {
      kendraBenefics.push(getPlanetName(p.name));
    }
  }

  if (kendraBenefics.length > 0) {
    const pNames = kendraBenefics.join(", ");
    let title = "Benefics in Auspicious Centers (Kendra/Trikona)";
    let description = `Auspicious planets (${pNames}) are situated in the core pillars of your chart (Kendra or Trikona houses). This brings mental peace, gentle protective armor, good health, and an innate sense of righteousness to your personality.`;

    if (isKn) {
      title = "ಕೇಂದ್ರ/ತ್ರಿಕೋಣಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳು";
      description = `ನಿಮ್ಮ ಜಾತಕದ ಪ್ರಮುಖ ಕೋನಗಳಾದ ಕೇಂದ್ರ (೧, ೪, ೭, ೧೦) ಅಥವಾ ತ್ರಿಕೋಣ (೫, ೯) ಸ್ಥಾನಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳಾದ (${pNames}) ನೆಲೆಸಿದ್ದಾರೆ. ಇದು ನಿಮಗೆ ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಉತ್ತಮ ಆರೋಗ್ಯ, ಉದಾತ್ತ ಸ್ವಭಾವ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.`;
    } else if (isHi) {
      title = "केंद्र या त्रिकोण में शुभ ग्रह";
      description = `आपकी कुंडली के सबसे महत्वपूर्ण भावों - केंद्र (1, 4, 7, 10) या त्रिकोण (5, 9) में शुभ ग्रह (${pNames}) स्थित हैं। यह स्थिति आपको उत्तम स्वास्थ्य, मानसिक शांति, परोपकारी स्वभाव और जीवन में दैवीय सुरक्षा प्रदान करती है।`;
    }
    yogas.push({ title, description });
  }

  if (yogas.length === 0) {
    let title = "Bhava Raja Combinations";
    let description = "Your planetary placements suggest a balanced layout, with main house lords supporting standard life milestones across marriage, career, and finance.";

    if (isKn) {
      title = "ಭಾವ ರಾಜ ಯೋಗಗಳ ಸಮತೋಲನ";
      description = "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಗ್ರಹಗಳ ಜೋಡಣೆಯು ಅತ್ಯಂತ ಸಮತೋಲನದಲ್ಲಿದೆ. ಪ್ರಮುಖ ಭಾವಾಧಿಪತಿಗಳು ಉತ್ತಮ ಸ್ಥಾನಗಳಲ್ಲಿದ್ದು, ನಿಮ್ಮ ಮದುವೆ, ವೃತ್ತಿಜೀವನ ಹಾಗೂ ಆರ್ಥಿಕ ಮೈಲಿಗಲ್ಲುಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬೆಂಬಲಿಸುತ್ತಾರೆ.";
    } else if (isHi) {
      title = "भाव राज योगों का संतुलन";
      description = "आपकी कुंडली में ग्रहों की स्थिति अत्यंत संतुलित है। प्रमुख भावों के स्वामी अनुकूल स्थानों में होकर आपके करियर, विवाह और आर्थिक समृद्धि के लिए मजबूत आधार तैयार करते हैं।";
    }
    yogas.push({ title, description });
  }

  // --- 5. LONGEVITY (AYUSH) ---
  const longevity: BaggonaPredictionSection[] = [];
  let longevityScore = 3;
  
  const lagnaLord = kundli.planets.find(p => p.name === PN.Jupiter) ? PN.Jupiter : PN.Sun; // placeholder detection
  const lagnaLordExalted = EXALTATION_SIGNS[lagnaLord] === (kundli.planets.find(p => p.name === lagnaLord)?.rashi.index ?? -1);
  const shaniStrong = (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) >= 1 && (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) !== 6 && (kundli.planets.find(p => p.name === PN.Saturn)?.house ?? 0) !== 8;

  if (lagnaLordExalted) longevityScore += 1;
  if (shaniStrong) longevityScore += 1;

  let title = "Ayush (Longevity) Evaluation";
  let description = "";

  const lifespanType = longevityScore >= 4 ? "LONG (Purna Ayus)" : longevityScore === 3 ? "MEDIUM (Madhya Ayus)" : "VARIABLE (Alpa Ayus)";
  const strengthsEn = `${lagnaLordExalted ? "Strong Lagna Lord ensures robust health." : "Standard Lagna Lord health."} ${shaniStrong ? "Saturn in a non-dusthana house acts as a protective shield for longevity." : "Standard Saturn placement."}`;

  description = `An evaluation of the Lagna, the Lagna Lord, the 8th house, the 3rd house, and Saturn (Ayush Karaka) indicates parameters corresponding to a ${lifespanType} lifespan. ${strengthsEn}`;

  if (isKn) {
    title = "ಆಯುಷ್ಯ ಬಲದ ವಿಶ್ಲೇಷಣೆ";
    const lifespanTypeKn = longevityScore >= 4 ? "ದೀರ್ಘಾಯುಷ್ಯ (ಪೂರ್ಣ ಆಯುಸ್ಸು)" : longevityScore === 3 ? "ಮಧ್ಯಮ ಆಯುಸ್ಸು" : "ಸಾಮಾನ್ಯ ಆಯುಸ್ಸು";
    const strengthsKn = `${lagnaLordExalted ? "ಬಲಶಾಲಿಯಾದ ಲಗ್ನಾಧಿಪತಿಯು ಉತ್ತಮ ಶಾರೀರಿಕ ದೃಢತೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತಾನೆ." : "ಸ್ಥಿರವಾದ ಲಗ್ನಾಧಿಪತಿಯು ಸಕಾರಾತ್ಮಕ ಆರೋಗ್ಯವನ್ನು ನೀಡುತ್ತಾನೆ."} ${shaniStrong ? "ಶನಿಯು ಜಾತಕದಲ್ಲಿ ಶುಭ ಸ್ಥಾನದಲ್ಲಿರುವುದು ದೀರ್ಘಾಯುಷ್ಯಕ್ಕೆ ಶ್ರೀರಕ್ಷೆಯಾಗಿ ನಿಲ್ಲುತ್ತದೆ." : "ಶನಿಯ ಸಾಮಾನ್ಯ ಸ್ಥಾನವು ಸಾಮಾನ್ಯ ಆಯುಷ್ಯ ಫಲಗಳನ್ನು ನೀಡುತ್ತದೆ."}`;
    description = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ, ಲಗ್ನಾಧಿಪತಿ, ೮ ಮತ್ತು ೩ ನೇ ಭಾವಗಳು ಹಾಗೂ ಆಯುಷ್ಯ ಕಾರಕನಾದ ಶನಿಯ ಬಲವನ್ನು ವಿಶ್ಲೇಷಿಸಿದಾಗ, ಜಾತಕದಲ್ಲಿ ${lifespanTypeKn} ಸೂತ್ರಗಳು ಕಂಡುಬರುತ್ತವೆ. ${strengthsKn}`;
  } else if (isHi) {
    title = "आयु और स्वास्थ्य का विश्लेषण";
    const lifespanTypeHi = longevityScore >= 4 ? "दीर्घायु (पूर्ण आयु)" : longevityScore === 3 ? "मध्यम आयु" : "सामान्य आयु";
    const strengthsHi = `${lagnaLordExalted ? "बलवान लग्नेश शारीरिक तंदुरुस्ती और आरोग्यता सुनिश्चित करता है।" : "लग्नेश की अनुकूल स्थिति उत्तम स्वास्थ्य प्रदान करती है।"} ${shaniStrong ? "शनि देव का कुंडली में शुभ भाव में होना आपकी दीर्घायु के लिए एक सुरक्षा कवच का कार्य करता है।" : "शनि की सामान्य स्थिति औसत स्वास्थ्य फल देती है।"}`;
    description = `आपके लग्न, लग्नेश, अष्टम व तृतीय भाव और आयु कारक शनि देव की स्थिति का विश्लेषण करने पर कुंडली में ${lifespanTypeHi} के संकेत मिलते हैं। ${strengthsHi}`;
  }

  longevity.push({ title, description });

  // --- 5. DOSHA CHECK (KUJA DOSHA & SHANI DOSHA) ---
  const doshas: BaggonaPredictionSection[] = [];

  const mars = kundli.planets.find((p) => p.name === PN.Mars);
  const moon = kundli.planets.find((p) => p.name === PN.Moon);
  const venus = kundli.planets.find((p) => p.name === PN.Venus);
  const saturn = kundli.planets.find((p) => p.name === PN.Saturn);

  if (mars) {
    const marsLagnaHouse = mars.house;
    const marsMoonHouse = moon ? ((mars.rashi.index - moon.rashi.index + 12) % 12 + 1) : 1;
    const marsVenusHouse = venus ? ((mars.rashi.index - venus.rashi.index + 12) % 12 + 1) : 1;

    const fromLagna = [1, 2, 4, 7, 8, 12].includes(marsLagnaHouse);
    const fromMoon = [1, 2, 4, 7, 8, 12].includes(marsMoonHouse);
    const fromVenus = [1, 2, 4, 7, 8, 12].includes(marsVenusHouse);

    const hasKujaDosha = fromLagna || fromMoon || fromVenus;

    let kujaTitle = isKn ? "ಮಂಗಳ ದೋಷ (ಕುಜ ದೋಷ) ವಿಶ್ಲೇಷಣೆ" : isHi ? "मंगल दोष (कुज दोष) विश्लेषण" : "Kuja Dosha (Manglik) Analysis";
    let kujaDesc = "";
    let kujaStatus: "positive" | "neutral" | "caution" = "neutral";
    let kujaScore = 100;

    if (hasKujaDosha) {
      kujaStatus = "caution";
      kujaScore = 35; // Red status

      const detailsEn = [];
      const detailsKn = [];
      const detailsHi = [];
      if (fromLagna) { detailsEn.push(`Lagna (House ${marsLagnaHouse})`); detailsKn.push(`ಲಗ್ನದಿಂದ (${marsLagnaHouse}ನೇ ಮನೆ)`); detailsHi.push(`लग्न से (${marsLagnaHouse}वां भाव)`); }
      if (fromMoon) { detailsEn.push(`Moon (House ${marsMoonHouse})`); detailsKn.push(`ಚಂದ್ರನಿಂದ (${marsMoonHouse}ನೇ ಮನೆ)`); detailsHi.push(`चंद्र से (${marsMoonHouse}वां भाव)`); }
      if (fromVenus) { detailsEn.push(`Venus (House ${marsVenusHouse})`); detailsKn.push(`ಶುಕ್ರನಿಂದ (${marsVenusHouse}ನೇ ಮನೆ)`); detailsHi.push(`शुक्र से (${marsVenusHouse}वां भाव)`); }

      if (isKn) {
        kujaDesc = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಮಂಗಳ ಗ್ರಹದ ಪ್ರಭಾವದಿಂದಾಗಿ ಕುಜ ದೋಷ ಕಂಡುಬರುತ್ತದೆ. ಇದು ${detailsKn.join(", ")} ರೂಪುಗೊಂಡಿದೆ. ಸಾಂಪ್ರದಾಯಿಕ ವೈದಿಕ ನಿಯಮಗಳ ಪ್ರಕಾರ, ಕುಜ ದೋಷವು ಮದುವೆಯಲ್ಲಿ ವಿಳಂಬ, ಸಂಗಾತಿಯೊಂದಿಗೆ ಸಣ್ಣಪುಟ್ಟ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಅಥವಾ ಕೋಪದ ಪ್ರವೃತ್ತಿಯನ್ನು ತರಬಹುದು. ಪರಿಹಾರಕ್ಕಾಗಿ ಪ್ರತಿದಿನ ಆಂಜನೇಯ ಸ್ವಾಮಿಯನ್ನು ಪ್ರಾರ್ಥಿಸಿ, ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಗೆ ಪೂಜೆ ಸಲ್ಲಿಸಿ ಮತ್ತು ಕೆಂಪು ಮಸೂರ ಬೇಳೆಯನ್ನು ದಾನ ಮಾಡಿ.`;
      } else if (isHi) {
        kujaDesc = `आपकी कुंडली में मंगल के प्रभाव के कारण कुज दोष (मांगलिक दोष) पाया गया है। यह स्थिति ${detailsHi.join(", ")} बनी है। ज्योतिष शास्त्र के अनुसार, इसके प्रभाव से विवाह में देरी, वैचारिक मतभेद या अधिक क्रोध आ सकता है। निवारण के लिए हनुमान चालीसा का पाठ करें, मंगलवार को कार्तिकेय जी की आराधना करें और मसूर दाल का दान करें।`;
      } else {
        kujaDesc = `Kuja Dosha (Manglik Dosha) is observed in your chart due to the placement of Mars from ${detailsEn.join(", ")}. In Vedic astrology, this can bring intensity to relationships, potential marriage delays, or sudden disagreements. Remedies include worshipping Lord Hanuman daily, performing Kartikeya pooja on Tuesdays, and donating red lentils.`;
      }
    } else {
      kujaStatus = "positive";
      kujaScore = 95; // Green status
      if (isKn) {
        kujaDesc = `ಶುಭ ಸುದ್ದಿ! ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಯಾವುದೇ ಮಂಗಳ ದೋಷ (ಕುಜ ದೋಷ) ಕಂಡುಬರುವುದಿಲ್ಲ. ನಿಮ್ಮ ಜಾತಕವು ಈ ಸವಾಲುಗಳಿಂದ ಮುಕ್ತವಾಗಿದ್ದು, ವೈವಾಹಿಕ ಮತ್ತು ಸಾಮಾಜಿಕ ಜೀವನದಲ್ಲಿ ಉತ್ತಮ ಸಮತೋಲನವನ್ನು ತರುತ್ತದೆ.`;
      } else if (isHi) {
        kujaDesc = `शुभ समाचार! आपकी कुंडली में कोई भी मंगल दोष (कुज दोष) नहीं पाया गया है। आपकी कुंडली इस प्रभाव से पूर्णतः मुक्त है, जो आपके वैवाहिक और सामाजिक जीवन के लिए अत्यंत अनुकूल है।`;
      } else {
        kujaDesc = `Excellent news! No Kuja Dosha (Manglik Dosha) is detected in your birth chart. Your chart is free from these astrological afflictions, ensuring smooth relationship energy and marital harmony.`;
      }
    }

    doshas.push({
      title: kujaTitle,
      description: kujaDesc,
      status: kujaStatus,
      score: kujaScore,
      whatIsGood: !hasKujaDosha ? (isKn ? "ಸಂಬಂಧಗಳಲ್ಲಿ ಮಧುರತೆ ಮತ್ತು ಸೌಹಾರ್ದತೆ ಇರುತ್ತದೆ." : isHi ? "रिश्तों में मधुरता और सामंजस्य बना रहेगा।" : "Ensures harmony, emotional stability, and relationship dynamics.") : "",
      whatIsWrong: hasKujaDosha ? (isKn ? "ಕೋಪದ ಪ್ರವೃತ್ತಿ ಮತ್ತು ಸಂಬಂಧಗಳಲ್ಲಿ ಅನಾವಶ್ಯಕ ಉದ್ವೇಗ." : isHi ? "क्रोध की प्रवृत्ति और संबंधों में तनाव।" : "Potential delays in marriage and sudden arguments.") : "",
      remedy: hasKujaDosha ? (isKn ? "ಮಂಗಳವಾರ ಕೆಂಪು ಬಟ್ಟೆಯನ್ನು ಧರಿಸಿ ಅಥವಾ ಹನುಮಾನ್ ಚಾಲೀಸಾವನ್ನು ಜಪಿಸಿ." : isHi ? "मंगलवार को हनुमान चालीसा का पाठ करें।" : "Recite Hanuman Chalisa or worship Lord Subramanya.") : ""
    });
  }

  if (saturn) {
    const saturnLagnaHouse = saturn.house;
    const hasSaturnDosha = [1, 4, 7, 8, 10].includes(saturnLagnaHouse);

    let shaniTitle = isKn ? "ಶನಿ ದೋಷ (ಬಲ ವಿಶ್ಲೇಷಣೆ)" : isHi ? "शनि दोष (बल विश्लेषण)" : "Saturn (Shani) Influence & Dosha Check";
    let shaniDesc = "";
    let shaniStatus: "positive" | "neutral" | "caution" = "neutral";
    let shaniScore = 100;

    if (hasSaturnDosha) {
      shaniStatus = "caution";
      shaniScore = 45; // Red/Yellow status

      if (isKn) {
        shaniDesc = `ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ಶನಿಯು ${saturnLagnaHouse}ನೇ ಭಾವದಲ್ಲಿದೆ. ಇದು ಜಾತಕದಲ್ಲಿ ಶನಿ ಪ್ರಭಾವವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಶನಿಯು ಈ ಸ್ಥಾನಗಳಲ್ಲಿ ಶಿಸ್ತು, ಕರ್ತವ್ಯದ ಪ್ರಜ್ಞೆ ಮತ್ತು ನಿಧಾನಗತಿಯ ಪ್ರಗತಿಯನ್ನು ನೀಡುತ್ತಾನೆ. ಸವಾಲುಗಳನ್ನು ಎದುರಿಸಲು ತಾಳ್ಮೆ ಅಗತ್ಯವಾಗಿದೆ. ಶನಿವಾರದಂದು ಶನಿದೇವನಿಗೆ ಎಳ್ಳೆಣ್ಣೆ ದೀಪವನ್ನು ಹಚ್ಚಿ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಮತ್ತು ನಿರ್ಗತಿಕರಿಗೆ ಸಹಾಯ ಮಾಡಿ.`;
      } else if (isHi) {
        shaniDesc = `आपकी कुंडली में शनि देव ${saturnLagnaHouse}वें भाव में स्थित हैं, जो एक विशेष प्रभाव (शनि दोष/प्रभाव) को दर्शाता है। यह स्थिति आपको जीवन में कड़ी मेहनत, अनुशासन और धैर्य बनाए रखने की सीख देती है। शनिवार को पीपल के पेड़ के नीचे सरसों के तेल का दीपक जलाएं और गरीब लोगों की सहायता करें।`;
      } else {
        shaniDesc = `Saturn is placed in the ${saturnLagnaHouse}th house of your natal chart. In Vedic astrology, this creates a strong Saturnian learning curve. It demands discipline, absolute patience, and constant hard work before rewarding you. Remedies include lighting a sesame oil lamp on Saturdays, reciting Shani Chalisa, and aiding the poor.`;
      }
    } else {
      shaniStatus = "positive";
      shaniScore = 85; // Green status
      if (isKn) {
        shaniDesc = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶನಿಯು ಯಾವುದೇ ದೋಷಕಾರಕ ಭಾವದಲ್ಲಿಲ್ಲ. ಶನಿಯು ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಆರ್ಥಿಕ ಶಿಸ್ತನ್ನು ಬೆಂಬಲಿಸುತ್ತಾನೆ.`;
      } else if (isHi) {
        shaniDesc = `आपकी कुंडली में शनि देव किसी भी नकारात्मक या दोषपूर्ण भाव में नहीं हैं। शनि की यह स्थिति आपके करियर में स्थिरता और वित्तीय अनुशासन को बढ़ावा देने वाली है।`;
      } else {
        shaniDesc = `No negative Shani Dosha is active in your natal chart. Saturn is in a balanced position, providing structure, discipline, and steady professional growth without major delays.`;
      }
    }

    doshas.push({
      title: shaniTitle,
      description: shaniDesc,
      status: shaniStatus,
      score: shaniScore,
      whatIsGood: !hasSaturnDosha ? (isKn ? "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಸುಗಮ ಯಶಸ್ಸು ಮತ್ತು ಹಣಕಾಸಿನ ಸ್ಥಿರತೆ." : isHi ? "करियर में सुचारू सफलता और वित्तीय स्थिरता।" : "Smooth career progress and steady financial discipline.") : "",
      whatIsWrong: hasSaturnDosha ? (isKn ? "ಪ್ರತಿ ಕೆಲಸದಲ್ಲಿ ವಿಳಂಬ ಮತ್ತು ಮಾನಸಿಕ ಅಸಮಾಧಾನ." : isHi ? "कार्यों में देरी और मानसिक असंतोष।" : "Delayed results and heavy workload pressures.") : "",
      remedy: hasSaturnDosha ? (isKn ? "ಶನಿವಾರ ಸಾಸಿವೆ ಅಥವಾ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪ ಹಚ್ಚಿ." : isHi ? "शनिवार को पीपल के वृक्ष के नीचे तेल का दीपक जलाएं।" : "Light a sesame oil lamp on Saturday evenings.") : ""
    });
  }

  // --- Kendra-Trikona Raja Yoga and Raja Yoga Bhanga detection ---
  const lagnaIdx = kundli.lagnaRashi.index;
  const planetsList: PlanetName[] = [
    PN.Sun, PN.Moon, PN.Mars, PN.Mercury, PN.Jupiter, PN.Venus, PN.Saturn
  ];
  const kendraLords: Record<PlanetName, number[]> = {} as any;
  const trikonaLords: Record<PlanetName, number[]> = {} as any;
  let lordOf8: PlanetName | null = null;

  for (const p of planetsList) {
    const ruled = housesRuledByPlanet(p, lagnaIdx);
    const kendras = ruled.filter(h => [1, 4, 7, 10].includes(h));
    const trikonas = ruled.filter(h => [1, 5, 9].includes(h));
    if (kendras.length > 0) kendraLords[p] = kendras;
    if (trikonas.length > 0) trikonaLords[p] = trikonas;
    if (ruled.includes(8)) {
      lordOf8 = p;
    }
  }

  const yogakarakas: PlanetName[] = [];
  for (const p of planetsList) {
    const ruled = housesRuledByPlanet(p, lagnaIdx);
    const rulesKendra = ruled.some(h => [1, 4, 7, 10].includes(h));
    const rulesTrikona = ruled.some(h => [1, 5, 9].includes(h));
    if (rulesKendra && rulesTrikona) {
      yogakarakas.push(p);
    }
  }

  const activeYogas: Array<{ p1: PlanetName; p2: PlanetName; houses1: number[]; houses2: number[] }> = [];
  for (let i = 0; i < planetsList.length; i++) {
    for (let j = i + 1; j < planetsList.length; j++) {
      const p1 = planetsList[i];
      const p2 = planetsList[j];
      
      const p1RulesKendra = kendraLords[p1] !== undefined;
      const p2RulesTrikona = trikonaLords[p2] !== undefined;
      
      const p2RulesKendra = kendraLords[p2] !== undefined;
      const p1RulesTrikona = trikonaLords[p1] !== undefined;

      if ((p1RulesKendra && p2RulesTrikona) || (p2RulesKendra && p1RulesTrikona)) {
        if (arePlanetsAssociated(p1, p2, kundli)) {
          activeYogas.push({
            p1,
            p2,
            houses1: housesRuledByPlanet(p1, lagnaIdx),
            houses2: housesRuledByPlanet(p2, lagnaIdx)
          });
        }
      }
    }
  }

  let bhangaTriggered = false;
  const bhangaDetails: string[] = [];
  
  if (lordOf8) {
    for (const yk of yogakarakas) {
      if (arePlanetsAssociated(yk, lordOf8, kundli)) {
        bhangaTriggered = true;
        bhangaDetails.push(
          isKn
            ? `ಯೋಗಕಾರಕ ಗ್ರಹವಾದ ${getPlanetName(yk)} ಗ್ರಹವು ೮ನೇ ಭಾವಾಧಿಪತಿಯಾದ ${getPlanetName(lordOf8)}ನೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿದ್ದು ರಾಜಯೋಗ ಭಂಗವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.`
            : `The Rajayogakaraka planet ${getPlanetName(yk)} is associated with the 8th house lord ${getPlanetName(lordOf8)}, causing a Raja Yoga Bhanga.`
        );
      }
    }

    for (const yoga of activeYogas) {
      if (arePlanetsAssociated(yoga.p1, lordOf8, kundli) || arePlanetsAssociated(yoga.p2, lordOf8, kundli)) {
        bhangaTriggered = true;
        bhangaDetails.push(
          isKn
            ? `ರಾಜಯೋಗವನ್ನು ರೂಪಿಸುವ ${getPlanetName(yoga.p1)} ಮತ್ತು ${getPlanetName(yoga.p2)} ಗ್ರಹಗಳ ಜೋಡಿಯು ೮ನೇ ಭಾವಾಧಿಪತಿಯಾದ ${getPlanetName(lordOf8)}ನೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿದ್ದು, ಇದರಿಂದ ರಾಜಯೋಗ ಭಂಗವು ಉಂಟಾಗುತ್ತದೆ.`
            : `The Raja Yoga forming pair ${getPlanetName(yoga.p1)} & ${getPlanetName(yoga.p2)} is associated with the 8th house lord ${getPlanetName(lordOf8)}, causing a Raja Yoga Bhanga.`
        );
      }
    }
  }

  for (const yoga of activeYogas) {
    const p1Name = getPlanetName(yoga.p1);
    const p2Name = getPlanetName(yoga.p2);
    const h1List = yoga.houses1.join(", ");
    const h2List = yoga.houses2.join(", ");
    
    const title = isKn 
      ? `ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ರಾಜಯೋಗ (${p1Name} ಮತ್ತು ${p2Name})`
      : `Kendra-Trikona Raja Yoga (${p1Name} and ${p2Name})`;
      
    const description = isKn
      ? `ಅದ್ಭುತ ಯೋಗ! ಕೇಂದ್ರದ ಅಧಿಪತಿಯಾದ ${p1Name} (ಮನೆಗಳು: ${h1List}) ಮತ್ತು ತ್ರಿಕೋಣದ ಅಧಿಪತಿಯಾದ ${p2Name} (ಮನೆಗಳು: ${h2List}) ಜಾತಕದಲ್ಲಿ ಯುತಿ ಅಥವಾ ದೃಷ್ಟಿ ಸಂಬಂಧವನ್ನು ಹೊಂದಿದ್ದಾರೆ. ಇದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಯಶಸ್ಸು, ಸೌಭಾಗ್ಯ, ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಮತ್ತು ಉನ್ನತ ಅಂತಸ್ತನ್ನು ತರಲಿದೆ.`
      : `Highly auspicious yoga! The Kendra lord ${p1Name} (houses: ${h1List}) and the Trikona lord ${p2Name} (houses: ${h2List}) are conjoined or aspecting each other. This combination promises success, name and fame, social status, and overall prosperity.`;
      
    yogas.push({ title, description });
  }

  for (const yk of yogakarakas) {
    const ykName = getPlanetName(yk);
    const ruled = housesRuledByPlanet(yk, lagnaIdx).join(", ");
    const title = isKn ? `ಲಗ್ನ ಯೋಗಕಾರಕ ಗ್ರಹ ಬಲ (${ykName})` : `Lagna Yogakaraka Power (${ykName})`;
    const description = isKn
      ? `ನಿಮ್ಮ ಲಗ್ನಕ್ಕೆ ಅತ್ಯಂತ ಪ್ರಮುಖವಾದ ಯೋಗಕಾರಕ ಗ್ರಹ ${ykName} (ಮನೆಗಳು: ${ruled}) ಆಗಿದೆ. ಇದು ಕೇಂದ್ರ ಹಾಗೂ ತ್ರಿಕೋಣ ಎರಡೂ ಮನೆಗಳ ಆಧಿಪತ್ಯವನ್ನು ಹೊಂದಿದ್ದು, ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಬಲ ಪ್ರಗತಿ ಮತ್ತು ಯಶಸ್ಸನ್ನು ತರುವ ಅದ್ಭುತ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ.`
      : `The planet ${ykName} (houses: ${ruled}) acts as the key Yogakaraka for your Lagna. Ruling both a Kendra and a Trikona, it acts as a powerhouse of progress, status, and material success in your life chart.`;
    yogas.push({ title, description });
  }

  if (bhangaTriggered) {
    const title = isKn ? "ರಾಜಯೋಗ ಭಂಗ ದೋಷ (Raja Yoga Bhanga)" : "Raja Yoga Bhanga Dosha (Nullification of Yoga)";
    const description = isKn
      ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಶುಭ ರಾಜಯೋಗಗಳಿದ್ದರೂ, ೮ನೇ ಮನೆಯ (ಆಯುಷ್ಯ/ರಂಧ್ರ ಭಾವ) ಅಧಿಪತಿಯಾದ ${getPlanetName(lordOf8!)}ನೊಂದಿಗಿನ ಸಂಬಂಧದಿಂದಾಗಿ ರಾಜಯೋಗದ ಪೂರ್ಣ ಫಲಗಳು ಲಭಿಸಲು ಅಡೆತಡೆಗಳು ಉಂಟಾಗಬಹುದು. ಇದು ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದಿರುವುದು ಅಥವಾ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಯಶಸ್ಸು ತಪ್ಪುವುದನ್ನು ಸೂಚಿಸುತ್ತದೆ. (${bhangaDetails.join(" ")})`
      : `Although your chart forms auspicious Raja Yogas, their association with the 8th lord ${getPlanetName(lordOf8!)} triggers a Raja Yoga Bhanga. This indicates that while opportunities will come, there may be obstacles, sudden delays, or a feeling that success is slipping away at the last moment. (${bhangaDetails.join(" ")})`;
      
    doshas.push({
      title,
      description,
      status: "caution",
      score: 55,
      whatIsGood: isKn ? "ನಿರಂತರ ಪ್ರಯತ್ನದಿಂದ ಯಶಸ್ಸು ಸಾಧ್ಯ." : "Encourages perseverance and deep spiritual grounding.",
      whatIsWrong: isKn ? "ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಯಶಸ್ಸು ತಪ್ಪುವುದು ಮತ್ತು ಅಡೆತಡೆಗಳು." : "Sudden hurdles or delays in enjoying the fruits of success.",
      remedy: isKn 
        ? "ಶನಿವಾರದಂದು ದೇವಸ್ಥಾನದಲ್ಲಿ ದೀಪ ಹಚ್ಚಿ ಹಾಗೂ ಬಡವರಿಗೆ ಸಹಾಯ ಮಾಡಿ." 
        : "Perform charity on Saturdays and worship Lord Shiva or Lord Ganesha to remove obstacles."
    });
  }

  let currentAge = 0;
  if (birth && birth.birthDate) {
    const birthDate = new Date(birth.birthDate);
    const today = new Date();
    const diffMs = today.getTime() - birthDate.getTime();
    currentAge = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  if (currentAge > 0) {
    const timeline = generateBhuktiTimeline(kundli, 100);
    let venusSunTransitionAge: number | null = null;
    let marsRahuTransitionAge: number | null = null;
    let rahuJupiterTransitionAge: number | null = null;

    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];
      if (current.maha !== next.maha) {
        const transitionAge = current.endAge;
        if (current.maha === PN.Venus && next.maha === PN.Sun) {
          venusSunTransitionAge = transitionAge;
        } else if (current.maha === PN.Mars && next.maha === PN.Rahu) {
          marsRahuTransitionAge = transitionAge;
        } else if (current.maha === PN.Rahu && next.maha === PN.Jupiter) {
          rahuJupiterTransitionAge = transitionAge;
        }
      }
    }

    let activeSandhi: { nameEn: string; nameKn: string; transitionAge: number } | null = null;
    if (venusSunTransitionAge !== null && Math.abs(currentAge - venusSunTransitionAge) <= 1.0) {
      activeSandhi = { nameEn: "Venus to Sun", nameKn: "ಶುಕ್ರ ದೆಸೆಯಿಂದ ರವಿ ದೆಸೆ", transitionAge: venusSunTransitionAge };
    } else if (marsRahuTransitionAge !== null && Math.abs(currentAge - marsRahuTransitionAge) <= 1.0) {
      activeSandhi = { nameEn: "Mars to Rahu", nameKn: "ಮಂಗಳ ದೆಸೆಯಿಂದ ರಾಹು ದೆಸೆ", transitionAge: marsRahuTransitionAge };
    } else if (rahuJupiterTransitionAge !== null && Math.abs(currentAge - rahuJupiterTransitionAge) <= 1.0) {
      activeSandhi = { nameEn: "Rahu to Jupiter", nameKn: "ರಾಹು ದೆಸೆಯಿಂದ ಗುರು ದೆಸೆ", transitionAge: rahuJupiterTransitionAge };
    }

    if (activeSandhi) {
      const ageStr = activeSandhi.transitionAge.toFixed(1);
      const title = isKn ? "ದೆಶಾ ಸಂಧಿ ಕಾಲ (ಮಹಾದೆಸೆ ಬದಲಾವಣೆ)" : "Dasha Sandhi (Mahadasha Transition)";
      const description = isKn
        ? `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಪ್ರಸ್ತುತ ${activeSandhi.nameKn} ಪರಿವರ್ತನೆಯ ಹಂತವು ಕಂಡುಬಂದಿದೆ (ವಯಸ್ಸು ${ageStr} ರ ಸುಮಾರಿಗೆ ±೧ ವರ್ಷದ ದೆಶಾ ಸಂಧಿ ಕಾಲ). ಈ ಅವಧಿಯಲ್ಲಿ ಗ್ರಹಗಳ ಶಕ್ತಿಯು ಬದಲಾಗುವುದರಿಂದ ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ, ಆಕಸ್ಮಿಕ ಬದಲಾವಣೆಗಳು ಅಥವಾ ದೈಹಿಕ ಆಯಾಸ ಉಂಟಾಗಬಹುದು. ತಾಳ್ಮೆ ಮತ್ತು ಪ್ರಾರ್ಥನೆ ಅತ್ಯಗತ್ಯ.`
        : `You are currently within a crucial transition phase of your life (within ±1 year of the ${activeSandhi.nameEn} Mahadasha transition at age ${ageStr}). Astrologically, this period is known as Dasha Sandhi, where the life energy shifts from one planet to another, often bringing emotional turbulence, sudden life shifts, or unsettled health. Maintaining patience and routine is highly advised.`;

      doshas.push({
        title,
        description,
        status: "caution",
        score: 50,
        whatIsGood: isKn ? "ಹೊಸ ಸಕಾರಾತ್ಮಕ ಬದಲಾವಣೆಗಳಿಗೆ ನಾಂದಿ." : "Prepares you for a new long-term chapter of life.",
        whatIsWrong: isKn ? "ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ ಮತ್ತು ನಿರ್ಧಾರಗಳಲ್ಲಿ ಗೊಂದಲ." : "Emotional turbulence and unsettled energy during the transition.",
        remedy: isKn 
          ? "ಪ್ರತಿದಿನ ಶಿವ ಪಂಚಾಕ್ಷರಿ ಮಂತ್ರ ಜಪಿಸಿ ಅಥವಾ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಕೇಳಿ." 
          : "Chant Shiva Panchakshari Mantra or listen to Vishnu Sahasranama daily to ground your energy."
      });
    }
  }

  return {
    overview,
    planets,
    houses,
    yogas,
    longevity,
    doshas
  };
}

export function getTransitsForDate(
  moonSignIdx: number,
  date: Date,
  ayanamsaModel: any = "lahiri"
): Record<PlanetName, { rashiIndex: number; house: number }> {
  const longs = siderealLongitudes(date, ayanamsaModel);
  const out = {} as Record<PlanetName, { rashiIndex: number; house: number }>;
  
  const planetsList: PlanetName[] = [
    PN.Sun, PN.Moon, PN.Mars, PN.Mercury, PN.Jupiter, PN.Venus, PN.Saturn, PN.Rahu, PN.Ketu
  ];
  
  for (const name of planetsList) {
    const deg = longs[name.toLowerCase() as keyof typeof longs] ?? 0;
    const rIndex = degreeToRashi(deg).index;
    const house = ((rIndex - moonSignIdx + 12) % 12) + 1;
    out[name] = { rashiIndex: rIndex, house };
  }
  return out;
}

export function buildMonthlyPredictionText(
  kundli: KundliOutput,
  transits: Record<PlanetName, { rashiIndex: number; house: number }>,
  lang: string
): string {
  const isKn = lang === "kn";
  const getPlanetName = (p: PlanetName): string => {
    if (isKn) return PLANETS_KN[p] ?? p;
    return PLANETS_EN[p] ?? p;
  };

  let text = "";

  const targetPlanets = [PN.Saturn, PN.Sun, PN.Mars, PN.Jupiter];
  const challenges: string[] = [];
  const supportives: string[] = [];

  for (const pl of targetPlanets) {
    const tData = transits[pl];
    if (!tData) continue;
    const tHouse = tData.house;
    const rIdx = tData.rashiIndex;

    const isDebilitated = DEBILITATION_SIGNS[pl] === rIdx;
    const isEnemy = naturalRelation(pl, signLord(rIdx)) === "shatru";

    if ([1, 8, 12].includes(tHouse)) {
      let impact = "";
      if (pl === PN.Saturn) {
        impact = isKn 
          ? "ಅಪಜಯ, ದೀರ್ಘಕಾಲದ ಆಲಸ್ಯ, ಮಾನಸಿಕ ತೊಂದರೆಗಳು ಮತ್ತು ಅನಾವಶ್ಯಕ ಶಾರೀರಿಕ-ಮಾನಸಿಕ ಒತ್ತಡ (Sade Sati ಅಥವಾ Ashtama Shani ಪ್ರಭಾವ). ಪ್ರತಿಯೊಂದು ಕೆಲಸದಲ್ಲೂ ಅಡೆತಡೆಗಳು ಎದುರಾಗಬಹುದು, ತಾಳ್ಮೆಯಿಂದ ಪ್ರಯತ್ನ ಮುಂದುವರಿಸಿ." 
          : "setbacks, physical-mental stress, and prolonged delays in your plans (Sade Sati or Ashtama Shani influence). Daily tasks might demand twice the energy, requiring high perseverance.";
      } else if (pl === PN.Sun) {
        impact = isKn 
          ? "ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ, ಉದ್ಯೋಗದಲ್ಲಿ ಕಿರಿಕಿರಿ, ಅನಾವಶ್ಯಕ ವಾದಗಳು ಮತ್ತು ಕೀರ್ತಿ ನಷ್ಟ. ಸರ್ಕಾರದ ಕೆಲಸಗಳಲ್ಲಿ ವಿಳಂಬವಾಗಬಹುದು, ತಾಳ್ಮೆಯಿಂದ ವರ್ತಿಸುವುದು ಉತ್ತಮ." 
          : "friction with superiors, career disturbances, unnecessary arguments, and potential loss of reputation. Government or legal matters could face unexpected delays.";
      } else if (pl === PN.Mars) {
        impact = isKn 
          ? "ಕೋಪದ ಪ್ರವೃತ್ತಿ ಹೆಚ್ಚಾಗುವುದು, ವಾದ-ವಿವಾದಗಳು, ಆಕಸ್ಮಿಕ ಅಪಘಾತಗಳು ಅಥವಾ ಗಾಯಗಳ ಭಯ, ಹಣಕಾಸಿನ ನಷ್ಟ ಮತ್ತು ತಲೆನೋವು/ರಕ್ತದೊತ್ತಡದ ತೊಂದರೆಗಳು. ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿರಿ." 
          : "increased aggression, disputes, risk of minor injuries or accidents, sudden financial losses, and physical discomforts like high blood pressure or headaches. Practice self-control.";
      } else if (pl === PN.Jupiter) {
        impact = isKn 
          ? "ಬುದ್ಧಿಭ್ರಮಣೆ, ಜ್ಞಾನನಾಶ, ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುವಲ್ಲಿ ತೀವ್ರ ಗೊಂದಲ, ಕೌಟುಂಬಿಕ ಸುಖದಲ್ಲಿ ಕೊರತೆ ಮತ್ತು ಧನಸಹಾಯ ದೊರೆಯುವಲ್ಲಿ ವಿಳಂಬ. ದೈವಿಕ ಆರಾಧನೆ ಮತ್ತು ಗುರುಗಳ ಮಾರ್ಗದರ್ಶನ ಅಗತ್ಯ." 
          : "temporary confusion, errors in judgement, delays in financial inflow, and minor domestic worries. Worshipping your spiritual guide or teacher will clear the path.";
      }

      if (isDebilitated) {
        impact += isKn 
          ? " (ಗ್ರಹವು ಗೋಚಾರದಲ್ಲಿ ನೀಚ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ಇದರ ಅಶುಭ ಫಲಗಳು ಹತ್ತಾರು ಪಟ್ಟು ಹೆಚ್ಚಾಗುತ್ತವೆ!)" 
          : " (as the planet is debilitated in transit, its negative effects are multiplied tenfold!)";
      } else if (isEnemy) {
        impact += isKn 
          ? " (ಗ್ರಹವು ಶತ್ರು ಕ್ಷೇತ್ರದಲ್ಲಿದೆ)" 
          : " (planet is transiting an enemy field)";
      }

      challenges.push(`${getPlanetName(pl)} (${tHouse}ನೇ ಮನೆ): ${impact}`);
    } else {
      let goodImpact = "";
      if (pl === PN.Jupiter && [2, 5, 7, 9, 11].includes(tHouse)) {
        goodImpact = isKn 
          ? "ಗುರು ಗ್ರಹವು ೨, ೫, ೭, ೯ ಅಥವಾ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿರುವುದು ದೈವಿಕ ಅನುಗ್ರಹವನ್ನು ತರುತ್ತದೆ. ಕೌಟುಂಬಿಕ ಶಾಂತಿ, ಮದುವೆಯ ಯೋಗ, ಉನ್ನತ ಜ್ಞಾನಾರ್ಜನೆ ಮತ್ತು ಆಕಸ್ಮಿಕ ಧನಲಾಭ ಉಂಟಾಗಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಕೀರ್ತಿ ಹೆಚ್ಚುತ್ತದೆ." 
          : "Jupiter transiting the auspicious 2nd, 5th, 7th, 9th, or 11th house marks a highly favorable cycle of prosperity, wisdom, and overall harmony. It brings relationship ease, family support, intellectual breakthroughs, and successful outcomes in your endeavours.";
      } else if (pl === PN.Sun && [3, 6, 10, 11].includes(tHouse)) {
        goodImpact = isKn 
          ? "ರವಿ ೩, ೬, ೧೦ ಅಥವಾ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಚಲಿಸುತ್ತಿರುವುದು ನಿಮ್ಮ ನಾಯಕತ್ವ ಗುಣವನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಗೌರವವನ್ನು ತರುತ್ತದೆ. ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಪ್ರಮೋಷನ್ ಸಿಗುವ ಸಾಧ್ಯತೆಯಿರುತ್ತದೆ. ಸರ್ಕಾರಿ ಕೆಲಸಗಳು ಯಶಸ್ವಿಯಾಗುತ್ತವೆ." 
          : "The Sun's transit through auspicious houses (3rd, 6th, 10th, or 11th) boosts your confidence, leadership capabilities, and career prospects. You are likely to receive support from superiors, governmental agencies, or gain a prominent status in your professional circle.";
      } else if (pl === PN.Mars && [3, 6, 11].includes(tHouse)) {
        goodImpact = isKn 
          ? "ಮಂಗಳ ೩, ೬ ಅಥವಾ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಚಲಿಸುತ್ತಿರುವುದು ನಿಮಗೆ ಅದ್ಭುತ ಧೈರ್ಯ ಹಾಗೂ ಸಾಹಸ ಪ್ರವೃತ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಕ್ರೀಡೆ, ಸೈನ್ಯ ಅಥವಾ ತಾಂತ್ರಿಕ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಕೆಲಸ ಮಾಡುವವರಿಗೆ ಯಶಸ್ಸು ಸಿಗಲಿದೆ. ಶತ್ರುಗಳ ಸಂಚು ವಿಫಲವಾಗುತ್ತದೆ." 
          : "Mars transiting through the 3rd, 6th, or 11th house fills you with high courage, competitive energy, and victory over adversaries. It is an excellent transit for taking initiatives, starting new projects, and solving long-pending issues.";
      } else if (pl === PN.Saturn && [3, 6, 11].includes(tHouse)) {
        goodImpact = isKn 
          ? "ಶನಿಯು ೩, ೬ ಅಥವಾ ೧೧ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿರುವುದು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿತಿಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ ಮತ್ತು ಶತ್ರುಗಳ ಮೇಲೆ ಜಯ ನೀಡುತ್ತದೆ. ದೀರ್ಘಕಾಲದ ಪ್ರಯತ್ನಗಳಿಗೆ ಅಂತಿಮವಾಗಿ ಯಶಸ್ಸು ದೊರೆಯಲಿದೆ. ಉದ್ಯೋಗದಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಸ್ತಿಯ ಲಾಭ ಉಂಟಾಗಲಿದೆ." 
          : "Saturn's transit through the growth houses (3rd, 6th, or 11th) brings professional stability, victory over competitors, and steady financial growth. Your structured efforts over the past months will now start showing concrete progress and recognition in your field.";
      }

      if (goodImpact) {
        if (isDebilitated) {
          goodImpact += isKn 
            ? " (ಆದರೆ ಗ್ರಹವು ನೀಚನಾಗಿರುವುದರಿಂದ ಶುಭ ಫಲಗಳು ತೀವ್ರವಾಗಿ ಕ್ಷೀಣಿಸುತ್ತವೆ)" 
            : " (but since the planet is debilitated, its benefic results are highly diminished)";
        } else if (isEnemy) {
          goodImpact += isKn 
            ? " (ಗ್ರಹವು ಶತ್ರು ಕ್ಷೇತ್ರದಲ್ಲಿದ್ದು ಶುಭ ಫಲ ಕಡಿಮೆಯಾಗಬಹುದು)" 
            : " (planet is in an enemy field, slightly reducing its benefic effects)";
        }
        supportives.push(`${getPlanetName(pl)} (${tHouse}ನೇ ಮನೆ): ${goodImpact}`);
      }
    }
  }

  const lagnaIdx = kundli.lagnaRashi.index;
  const lagnaLord = signLord(lagnaIdx);
  const natalLagnaLordPl = kundli.planets.find(p => p.name === lagnaLord);
  const lagnaLordHouse = natalLagnaLordPl ? natalLagnaLordPl.house : 1;
  const isLagnaLordWeak = [6, 8, 12].includes(lagnaLordHouse);

  let natalContext = "";
  if (isLagnaLordWeak) {
    natalContext = isKn
      ? `ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿಯಾದ ${getPlanetName(lagnaLord)} ದುಸ್ಥಾನದಲ್ಲಿದ್ದು (${lagnaLordHouse}ನೇ ಮನೆ) ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಕಡಿಮೆ ಮಾಡುವುದರಿಂದ, ಗೋಚಾರದ ಸವಾಲುಗಳನ್ನು ಎದುರಿಸಲು ಶಿವಾರಾಧನೆ ಹಾಗೂ ಹೆಚ್ಚಿನ ಆತ್ಮಬಲ ಅತ್ಯಗತ್ಯ.`
      : `Since your natal Lagna Lord (${getPlanetName(lagnaLord)}) is placed in a dusthana (${lagnaLordHouse} house), your overall immunity and resistance are weaker; hence, you must handle transit challenges with caution and spiritual discipline.`;
  } else {
    natalContext = isKn
      ? `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನಾಧಿಪತಿಯು ಬಲಶಾಲಿಯಾಗಿದ್ದು, ಗೋಚಾರದ ಅಶುಭ ಪ್ರಭಾವಗಳಿಂದ ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸಲು ಶ್ರೀರಕ್ಷೆಯಾಗಿ ನಿಲ್ಲುತ್ತಾನೆ.`
      : `Your natal Lagna Lord is well-placed and strong, providing a protective shield that buffers you against negative transit influences.`;
  }

  if (isKn) {
    text += `ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಗೋಚಾರ ಸಮನ್ವಯ:\n${natalContext}\n\n`;
    if (supportives.length > 0) {
      text += `ಶುಭ ಗೋಚಾರ ಪ್ರಭಾವಗಳು:\n` + supportives.map(s => `• ${s}`).join("\n") + `\n\n`;
    }
    if (challenges.length > 0) {
      text += `ಸವಾಲುಗಳು ಮತ್ತು ಗೋಚಾರ ದೋಷಗಳು:\n` + challenges.map(c => `• ${c}`).join("\n") + `\n\n`;
      text += `ಪರಿಹಾರಗಳು: ಶನಿ ಮತ್ತು ಇತರ ದೋಷಗಳ ನಿವಾರಣೆಗೆ ಶಿವ ದರ್ಶನ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮತ್ತು ಬಡವರಿಗೆ ಆಹಾರ ದಾನ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರ ಮಾರ್ಗಗಳಾಗಿವೆ.`;
    } else {
      text += `ಈ ತಿಂಗಳಿನಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಗೋಚಾರ ದೋಷಗಳಿಲ್ಲ. ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳುವುದು ಮತ್ತು ದಾನ-ಧರ್ಮ ಮಾಡುವುದು ನಿಮಗೆ ಸರ್ವತೋಮುಖ ಏಳಿಗೆ ತರುತ್ತದೆ.`;
    }
  } else {
    text += `Natal & Transit Synthesis:\n${natalContext}\n\n`;
    if (supportives.length > 0) {
      text += `Auspicious Transits:\n` + supportives.map(s => `• ${s}`).join("\n") + `\n\n`;
    }
    if (challenges.length > 0) {
      text += `Transit Challenges:\n` + challenges.map(c => `• ${c}`).join("\n") + `\n\n`;
      text += `Remedies & Precautions:\nWorship Lord Shiva, chant Hanuman Chalisa daily for physical and mental protection, and help the weaker sections of society to ease the karmic flow.`;
    } else {
      text += `No major negative transits are active. Cultivating discipline and engaging in charity will bring peace and prosperity.`;
    }
  }

  return text;
}

/**
 * Calculate transits relative to Moon sign (clockwise)
 */
export function getClockwiseTransits(
  moonSignIdx: number,
  ayanamsaModel: any = "lahiri"
): Record<PlanetName, { rashiIndex: number; house: number }> {
  const now = new Date();
  const longs = siderealLongitudes(now, ayanamsaModel);
  const out = {} as Record<PlanetName, { rashiIndex: number; house: number }>;
  
  const planetsList: PlanetName[] = [
    PN.Sun, PN.Moon, PN.Mars, PN.Mercury, PN.Jupiter, PN.Venus, PN.Saturn, PN.Rahu, PN.Ketu
  ];
  
  for (const name of planetsList) {
    // lowercase lookup to resolve case-sensitivity bug
    const deg = longs[name.toLowerCase() as keyof typeof longs] ?? 0;
    const rIndex = degreeToRashi(deg).index;
    const house = ((rIndex - moonSignIdx + 12) % 12) + 1;
    out[name] = { rashiIndex: rIndex, house };
  }
  return out;
}

/**
 * Generate personalized empathy-rich readings
 */
export function generatePersonalReading(
  kundli: KundliOutput,
  birth: { birthDate: string; birthTime: string; [key: string]: any },
  lang: string = "en"
): PersonalReadingOutput {
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  const getRashiName = (idx: number): string => {
    if (isKn) return RASHIS_KN[idx] ?? "";
    if (isHi) return RASHIS_HI[idx] ?? "";
    return RASHIS_EN[idx] ?? "";
  };

  const getPlanetName = (p: PlanetName): string => {
    if (isKn) return PLANETS_KN[p] ?? p;
    if (isHi) return PLANETS_HI[p] ?? p;
    return PLANETS_EN[p] ?? p;
  };

  // --- 1. Cosmic Profile ---
  const lagnaIdx = kundli.lagnaRashi.index;
  const moonIdx = kundli.moonSign.index;

  const lagnaDescsEn = [
    `Aries Ascendant is an assertive, fiery, cardinal sign governed by Mars, endowing you with dynamic vitality, pioneering initiative, and a courageous approach toward all life hurdles. You naturally take charge in moments of uncertainty, displaying an innate drive to forge new paths rather than following conventional routes. The energetic influence of Mars bestows sharp instincts, physical resilience, and an unwavering ambition to achieve victory in your chosen field. Your commanding presence inspires confidence in others, establishing you as an active trailblazer who turns concepts into decisive action.\n\nOn an emotional and psychological plane, you possess an intensely independent nature that thrives when granted autonomy and freedom of expression. You have little patience for deceit or procrastination, preferring transparent honesty and swift resolutions in personal and professional relationships. While your spirited enthusiasm moves mountains, learning to temper occasional impulsiveness with calm reflection ensures long-lasting stability. By cultivating inner patience and aligning your fierce passion with steady perseverance, you transform raw energy into enduring wisdom, leadership, and remarkable accomplishments.`,

    `Taurus Ascendant is a grounded, fixed earth sign ruled by Venus, granting you extraordinary patience, unwavering reliability, and an innate appreciation for stability and beauty. You possess a calm and composed demeanor that reassures everyone around you, approaching life with measured caution, common sense, and enduring stamina. The benefic influence of Venus blesses you with refined taste, an eye for aesthetics, and a natural ability to build material and emotional security over time. You value tangible progress and prefer laying solid, immovable foundations before taking major life steps.\n\nPsychologically, you seek lasting peace, harmonious environments, and dependable relationships built on mutual loyalty and deep trust. You possess immense inner fortitude and the rare ability to endure prolonged hardships without wavering, steadily working toward your goals with unshakeable determination. While your steadfast loyalty makes you an invaluable ally, guarding against rigid stubbornness and resistance to necessary change allows for richer personal evolution. Embracing flexibility while preserving your core values empowers you to enjoy life's finest blessings, financial abundance, and domestic contentment.`,

    `Gemini Ascendant is an intellectually vibrant, dual air sign ruled by Mercury, bestowing exceptional versatility, quick wit, and superior communicative prowess. Your mind operates at rapid speed, processing diverse streams of information simultaneously and adapting effortlessly to shifting circumstances and diverse social environments. The agile grace of Mercury gives you a natural curiosity about the world, making you a lifelong learner who excels in networking, writing, and intellectual discourse. Your lively conversation, youthful enthusiasm, and keen analytical perception ensure you remain a captivating presence in any circle.\n\nAt an emotional and mental level, you require continuous intellectual stimulation to stay engaged, often juggling multiple interests, creative projects, and social connections at once. While your versatility enables you to thrive across varied domains, learning to focus your mental energy on singular long-term objectives prevents restlessness and scattered focus. You possess a lighthearted charm that defuses tension easily, though developing deeper emotional stillness enriches your closest bonds. Channeling your brilliant intellect into purposeful pursuits allows you to leave a lasting impact through knowledge, innovative ideas, and meaningful collaboration.`,

    `Cancer Ascendant is a deeply intuitive, cardinal water sign ruled by the Moon, filling your persona with profound empathy, emotional intelligence, and protective maternal warmth. You possess an innate sensitivity that allows you to read the unspoken emotional currents of any room, instinctively understanding what others need before they voice it. The gentle yet powerful guardianship of the Moon makes you fiercely protective of your family, home sanctuary, and ancestral traditions. Your nurturing instincts and genuine kindness create a safe haven for loved ones, establishing you as an indispensable pillar of emotional support.\n\nPsychologically, your internal landscape is guided by shifting emotional tides, requiring a secure and peaceful domestic environment to maintain spiritual and mental equilibrium. You possess remarkable emotional memory and profound loyalty, though learning to establish healthy emotional boundaries prevents you from absorbing external anxieties and negativity. When you feel respected and emotionally secure, your creative imagination, intuitive foresight, and business acumen shine with extraordinary brilliance. Embracing emotional stability while letting go of past grievances empowers you to manifest profound inner tranquility, lasting prosperity, and heartfelt fulfillment.`,

    `Leo Ascendant is a majestic, fixed fire sign ruled by the radiant Sun, endowing you with charismatic authority, noble dignity, and a generous, warm-hearted personality. You possess a commanding presence that naturally draws the spotlight, inspiring others through your self-confidence, creative flair, and innate sense of honor. The solar energy running through your chart fills you with boundless vitality, a deep sense of purpose, and an instinctive desire to protect and uplift those under your care. You approach life with regal optimism, striving for excellence and refusing to compromise your core integrity for temporary gains.\n\nOn an emotional level, you are driven by a profound need for authentic self-expression, respect, and mutual loyalty in all personal and professional associations. Your heart is immensely generous, often going out of your way to support others, though you can be sensitive to perceived disrespect or unacknowledged efforts. Cultivating humility alongside your natural magnanimity transforms your leadership into an inspiring source of genuine empowerment for everyone around you. By balancing your fierce personal pride with collaborative empathy, you command enduring admiration, build a lasting legacy, and enjoy radiant success.`,

    `Virgo Ascendant is a meticulously observant, dual earth sign ruled by Mercury, blessing you with analytical brilliance, practical wisdom, and an extraordinary eye for detail. You approach daily life with methodical precision, striving for efficiency, cleanliness, and order in both professional workflows and personal environments. The intellectual grounding of Mercury grants you sharp discernment, making you an exceptional problem solver who can diagnose systemic flaws and implement realistic, working remedies. Your pragmatic mindset and spirit of selfless service make you a dependable cornerstone in any organization or community.\n\nPsychologically, you are motivated by a heartfelt desire to be useful, productive, and continually refining your skills and understanding. Your analytical mind constantly seeks perfection, which can occasionally induce mental fatigue or unwarranted self-criticism if expectations are placed unrealistically high. Learning to appreciate the natural beauty of imperfection and treating yourself with the same compassion you extend to others brings profound peace of mind. By integrating mindful relaxation with your sharp organizational abilities, you achieve intellectual mastery, professional acclaim, and radiant holistic well-being.`,

    `Libra Ascendant is a graceful, cardinal air sign ruled by Venus, gracing you with natural diplomacy, an innate aesthetic sense, and an unwavering commitment to justice and harmony. You possess refined social charm and an appealing conversational style, effortlessly bridging differences between opposing viewpoints and creating balance wherever friction exists. The artistic influence of Venus instills a deep appreciation for culture, elegance, and fair play, inspiring you to cultivate visually harmonious and mentally peaceful environments. You excel in partnerships and collaborative teamwork, valuing mutual respect and intellectual equality.\n\nAt an inner psychological level, you seek emotional serenity through balanced relationships and peaceful social dynamics, often feeling unsettled by harsh conflict or vulgarity. Your desire to see every side of an argument makes you a fair arbiter, though learning to make firm, timely decisions without second-guessing yourself strengthens your personal sovereignty. True fulfillment comes when you honor your own emotional needs as deeply as you accommodate the wishes of others. By anchoring your life in decisive inner truth and artistic grace, you attract enduring love, social prestige, and prosperous relationships.`,

    `Scorpio Ascendant is an intense, fixed water sign co-ruled by Mars and Ketu, endowing you with magnetic charisma, profound psychological insight, and extraordinary resilience. You possess a penetrating gaze and a quiet, dignified aura that suggests vast hidden depths, instinctively discerning the underlying truth behind superficial appearances. The transformative power of Mars and Ketu grants you the courage to confront life's deepest mysteries and emerge stronger from adversity like a phoenix. Your determination is relentless, enabling you to master complex challenges that would overwhelm ordinary minds.\n\nPsychologically, your emotional world is profound, intensely private, and fiercely protective of those who have earned your sacred trust and loyalty. You experience life with visceral depth, forging unbreakable bonds while guarding your innermost vulnerabilities behind a composed, stoic exterior. Learning to release past grievances and trusting the flow of life allows your tremendous healing and intuitive powers to awaken fully. By directing your immense willpower toward constructive transformation and spiritual wisdom, you command universal respect, overcome all obstacles, and attain mastery over your destiny.`,

    `Sagittarius Ascendant is an expansive, dual fire sign ruled by Jupiter, bestowing radiant optimism, philosophical wisdom, and an insatiable thirst for truth and adventure. You possess an open-minded, jovial demeanor that uplifts spirits wherever you go, viewing life as a grand quest for higher knowledge, spiritual evolution, and universal understanding. The divine grace of Jupiter inspires you with righteous ideals, generosity of spirit, and an innate faith that cosmic justice ultimately prevails. You thrive in wide-open intellectual horizons, higher education, philosophical inquiry, and cultural exploration.\n\nOn an emotional plane, you value freedom and authenticity above all else, feeling constrained by petty dogmas, rigid routines, or manipulative emotional games. Your direct honesty is refreshing and transparent, though tempering candor with mindful tact ensures your wisdom is received with the warmth it was intended. You possess a natural resilience that bounces back effortlessly from setbacks, viewing every challenge as a valuable life lesson. By grounding your expansive visions in disciplined daily execution, you achieve profound spiritual enlightenment, academic or judicial prominence, and widespread honor.`,

    `Capricorn Ascendant is a disciplined, cardinal earth sign ruled by Saturn, granting you formidable perseverance, pragmatic realism, and an unshakeable sense of duty. You understand the value of patience and sustained labor, approaching your long-term ambitions with strategic planning, self-control, and structured foresight. The stern guidance of Saturn tempers your character into iron clad integrity, ensuring you build enduring success step by step without succumbing to shortcuts. Your calm composure and reliability during crises make you a natural authority figure whom others turn to for guidance.\n\nPsychologically, you carry a mature sense of responsibility from an early age, often placing your obligations and duty ahead of personal comfort or leisure. Beneath your reserved, cautious exterior lies a deeply loyal heart that honors commitments with absolute fidelity and provides unwavering security for loved ones. Learning to celebrate intermediate milestones and allowing yourself room for spontaneity and joyous relaxation balances your serious disposition. By combining your relentless work ethic with compassionate self-care, you rise steadily to positions of enduring influence, financial stability, and universal respect.`,

    `Aquarius Ascendant is an innovative, fixed air sign co-ruled by Saturn and Rahu, bestowing an egalitarian mindset, visionary intellect, and deep humanitarian ideals. You possess a unique and independent individuality, refusing to be bound by outdated dogmas and constantly envisioning progressive systems that uplift society. The combined energies of Saturn and Rahu grant you the ability to grasp abstract concepts, technological breakthroughs, and collective social patterns with remarkable clarity. Your friendly, democratic demeanor makes you comfortable interacting with people from every walk of life.\n\nAt an inner emotional level, you approach feelings with thoughtful objectivity, often analyzing emotional dynamics intellectually before allowing yourself to feel them fully. While your broad-minded worldview makes you an exceptional ally for progressive causes, nurturing warm, personal intimacies alongside your grand ideals brings emotional richness to your private life. You value authentic friendships and intellectual camaraderie, flourishing when collaborating on projects that serve the greater good. By uniting your visionary brilliance with grounded compassion, you leave an indelible mark of positive change upon the world.`,

    `Pisces Ascendant is a compassionate, dual water sign ruled by Jupiter, blessing you with boundless empathy, profound spiritual intuition, and a rich artistic imagination. You possess a gentle and soulful aura that immediately puts others at ease, sensing the subtle vibrations and emotional currents of your environment with oceanic depth. The expansive benevolence of Jupiter fills your heart with universal goodwill, selfless devotion, and a natural affinity for mystical, artistic, and philosophical pursuits. You see the divine spark in all beings, navigating the material world with poetic grace and faith.\n\nPsychologically, your emotional sensitivity is exceptionally vast, absorbing the joys and sorrows of the world, which requires regular periods of quiet solitude and spiritual retreat to recharge your Prana. Learning to maintain firm energetic boundaries and grounding your spiritual ideals in practical daily realities protects your gentle soul from burnout. Your creative and healing potentials are limitless when channelled through music, writing, spirituality, or healing professions. By surrendering to divine guidance while maintaining healthy discernment, you embody enlightened wisdom, transcendent peace, and profound fulfillment.`
  ];

  const lagnaDescsKn = [
    `ಮೇಷ ಲಗ್ನವು ಕುಜ ಗ್ರಹದ ಅಧಿಪತ್ಯಕ್ಕೆ ಸೇರಿದ ಚರ ಹಾಗೂ ಅಗ್ನಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮಲ್ಲಿ ಅದ್ಭುತ ಚೈತನ್ಯ, ಅಚಲ ಧೈರ್ಯ ಮತ್ತು ಹುಟ್ಟು ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ತುಂಬುತ್ತದೆ. ನೀವು ಯಾವುದೇ ಕಾರ್ಯವನ್ನು ಕೈಗೆತ್ತಿಕೊಂಡರೂ ಅಳುಕಿಲ್ಲದೆ ಮುನ್ನುಗ್ಗುವ ಸಾಹಸಪ್ರವೃತ್ತಿಯನ್ನು ಹೊಂದಿದ್ದು, ಸವಾಲುಗಳನ್ನು ನೇರವಾಗಿ ಎದುರಿಸಿ ಜಯಿಸುವ ಅದಮ್ಯ ಇಚ್ಛಾಶಕ್ತಿಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತೀರಿ. ಕುಜನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ನಿರ್ಧಾರಗಳು ವೇಗವಾಗಿದ್ದು, ಹೊಸ ಯೋಜನೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸುವುದರಲ್ಲಿ ನೀವು ಸದಾ ಮುಂಚೂಣಿಯಲ್ಲಿರುತ್ತೀರಿ. ನಿಮ್ಮ ನೇರ ನಡವಳಿಕೆ, ತೇಜಸ್ವಿ ಮಾತು ಮತ್ತು ಕರ್ತವ್ಯನಿಷ್ಠೆಯು ಸಮಾಜದಲ್ಲಿ ನಿಮಗೆ ವಿಶೇಷ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವವನ್ನು ತಂದುಕೊಡುತ್ತದೆ.\n\nಭಾವನಾತ್ಮಕ ಹಾಗೂ ಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಸಂಪೂರ್ಣ ಸ್ವಾವಲಂಬನೆಯನ್ನು ಬಯಸುವ ವ್ಯಕ್ತಿಯಾಗಿದ್ದು, ಇತರರ ಅನಗತ್ಯ ನಿಯಂತ್ರಣ ಅಥವಾ ಹಸ್ತಕ್ಷೇಪವನ್ನು ಸಹಿಸುವುದಿಲ್ಲ. ನಿಮ್ಮ ಮನಸ್ಸು ಅತ್ಯಂತ ಪ್ರಾಮಾಣಿಕವಾಗಿದ್ದು, ಕಪಟವಿಲ್ಲದ ನೇರ ಸತ್ಯವನ್ನು ನುಡಿಯುವ ಗುಣ ನಿಮ್ಮದಾಗಿದೆ; ಆದರೆ ಹಠಾತ್ ಆವೇಶ ಹಾಗೂ ಅಸಹನೆಯನ್ನು ನಿಯಂತ್ರಿಸಿ ಸಮಾಧಾನದಿಂದ ಆಲೋಚಿಸುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಇನ್ನಷ್ಟು ಉನ್ನತಗೊಳಿಸುತ್ತದೆ. ಸಂಬಂಧಗಳಲ್ಲಿ ನಿಮ್ಮ ನಿಷ್ಠೆಯು ಅತ್ಯಂತ ಪವಿತ್ರವಾಗಿದ್ದು, ಪ್ರೀತಿಪಾತ್ರರನ್ನು ರಕ್ಷಿಸಲು ನೀವು ಸದಾ ಸಿದ್ಧರಿರುತ್ತೀರಿ. ದೈನಂದಿನ ಧ್ಯಾನ ಮತ್ತು ಸಂಯಮದ ಮೂಲಕ ನಿಮ್ಮ ಅಗ್ನಿ ಶಕ್ತಿಯನ್ನು ಸಕಾರಾತ್ಮಕ ಹಾದಿಯಲ್ಲಿ ಬಳಸಿದರೆ ಜೀವನದಲ್ಲಿ ಅಪ್ರತಿಮ ಯಶಸ್ಸು ನಿಮ್ಮದಾಗುತ್ತದೆ.`,

    `ವೃಷಭ ಲಗ್ನವು ಶುಕ್ರ ಗ್ರಹದ ಆಡಳಿತಕ್ಕೆ ಒಳಪಟ್ಟ ಸ್ಥಿರ ಹಾಗೂ ಭೂಮಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ಅಪಾರ ತಾಳ್ಮೆ, ದೃಢ ಮನಸ್ಸು ಮತ್ತು ಸೌಂದರ್ಯಪ್ರಜ್ಞೆಯನ್ನು ಕರುಣಿಸುತ್ತದೆ. ನೀವು ಪ್ರತಿಯೊಂದು ಹೆಜ್ಜೆಯನ್ನೂ ಎಚ್ಚರಿಕೆಯಿಂದ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ದೃಷ್ಟಿಕೋನದಿಂದ ಇಡುತ್ತೀರಿ; ಯಾವುದೇ ಕೆಲಸದಲ್ಲೂ ತರಾತುರಿ ಮಾಡದೆ ವ್ಯವಸ್ಥಿತವಾಗಿ ಮುನ್ನಡೆಯುವುದು ನಿಮ್ಮ ಕಾರ್ಯವೈಖರಿಯಾಗಿದೆ. ಶುಕ್ರನ ಶುಭ ಪ್ರಭಾವದಿಂದಾಗಿ ಕಲೆ, ಸಂಸ್ಕೃತಿ, ಆಕರ್ಷಕ ವಾತಾವರಣ ಮತ್ತು ಲೌಕಿಕ ಸುಖ-ಸಂಪತ್ತುಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಸಹಜ ಒಲವಿರುತ್ತದೆ. ನೀವು ಸ್ಥಾಪಿಸುವ ಅಡಿಪಾಯವು ಶಾಶ್ವತವಾಗಿದ್ದು, ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಸಾಧಿಸುವಲ್ಲಿ ನೀವು ನೈಪುಣ್ಯತೆಯನ್ನು ಹೊಂದಿರುತ್ತೀರಿ.\n\nಮಾನಸಿಕವಾಗಿ ನೀವು ಶಾಂತಿಯುತ ಬದುಕನ್ನು ಹಾಗೂ ಭದ್ರವಾದ ಕುಟುಂಬ ಸಂಬಂಧಗಳನ್ನು ಸದಾ ಬಯಸುತ್ತೀರಿ. ನಿಮ್ಮ ಮಾತು ಮೃದುವಾಗಿದ್ದು, ನಂಬಿಕಸ್ಥ ನಡವಳಿಕೆಯಿಂದ ನೀವು ಎಲ್ಲರ ಪ್ರೀತಿ-ವಿಶ್ವಾಸವನ್ನು ಗಳಿಸುತ್ತೀರಿ. ಆದರೆ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅತಿಯಾದ ಹಠಮಾರಿ ಸ್ವಭಾವ ಹಾಗೂ ಬದಲಾವಣೆಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳದ ಬಿಗು ನಿಲುವು ಹೊಸ ಅವಕಾಶಗಳಿಗೆ ತಡೆಯಾಗಬಹುದು; ಆದ್ದರಿಂದ ಕಾಲಕ್ಕೆ ತಕ್ಕಂತೆ ಹೊಂದಿಕೊಳ್ಳುವ ಗುಣವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ. ನಿಮ್ಮ ಅಚಲ ಪರಿಶ್ರಮ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ನಿಷ್ಠೆಯು ಸಂಸಾರದಲ್ಲಿ ಸಂತೃಪ್ತಿಯನ್ನು, ಸಮಾಜದಲ್ಲಿ ಸದಾಚಾರದ ಕೀರ್ತಿಯನ್ನು ಹಾಗೂ ಸಮೃದ್ಧ ಧನಯೋಗವನ್ನು ಖಂಡಿತವಾಗಿ ತಂದುಕೊಡುತ್ತದೆ.`,

    `ಮಿಥುನ ಲಗ್ನವು ಬುಧ ಗ್ರಹದ ಒಡೆತನಕ್ಕೆ ಸೇರಿದ ದ್ವಿಸ್ವಭಾವ ಹಾಗೂ ವಾಯು ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ಅಪ್ರತಿಮ ಬುದ್ಧಿವಂತಿಕೆ, ಚುರುಕುತನ ಮತ್ತು ಅದ್ಭುತ ಸಂವಹನ ಕಲೆಯನ್ನು ದಯಪಾಲಿಸುತ್ತದೆ. ನಿಮ್ಮ ಮಿದುಳು ಸದಾ ಸಕ್ರಿಯವಾಗಿದ್ದು, ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವುದು, ಜ್ಞಾನ ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ಯಾವುದೇ ಪರಿಸ್ಥಿತಿಗೆ ಸಲೀಸಾಗಿ ಹೊಂದಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಸ್ವಾಭಾವಿಕ ಶಕ್ತಿಯಾಗಿದೆ. ಬುಧನ ಅನುಗ್ರಹದಿಂದಾಗಿ ಮಾತುಗಾರಿಕೆ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ ಮತ್ತು ಬರವಣಿಗೆಯಲ್ಲಿ ನೀವು ನಿಪುಣರಾಗಿದ್ದು, ಸಾಮಾಜಿಕ ವಲಯದಲ್ಲಿ ಎಲ್ಲರನ್ನೂ ಆಕರ್ಷಿಸುವ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಹೊಂದಿರುತ್ತೀರಿ.\n\nಆಂತರಿಕವಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸು ಹೊಸ ಅನುಭವಗಳನ್ನು ಸದಾ ಹುಡುಕುತ್ತಿರುತ್ತದೆ; ಇದರಿಂದಾಗಿ ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹಲವು ವಿಷಯಗಳತ್ತ ಗಮನ ಹರಿಸಿ ಮಾನಸಿಕ ಚಂಚಲತೆ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆಯಿರುತ್ತದೆ. ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಒಂದು ನಿರ್ದಿಷ್ಟ ಗುರಿಯತ್ತ ಕೇಂದ್ರೀಕರಿಸಿ, ತಾಳ್ಮೆಯಿಂದ ಒಂದೊಂದೇ ಕೆಲಸವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದರೆ ನೀವು ಮಹತ್ತರವಾದ ಸಾಧನೆಯನ್ನು ಮಾಡಬಹುದು. ಸಂಬಂಧಗಳಲ್ಲಿ ಮುಕ್ತ ಮನಸ್ಸಿನಿಂದ ಒಡನಾಡುತ್ತೀರಿ, ಆದರೆ ಭಾವನಾತ್ಮಕ ಆಳವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ಸೃಜನಶೀಲ ಜ್ಞಾನ ಹಾಗೂ ತಾರ್ಕಿಕ ಬುದ್ಧಿಯನ್ನು ಸಮಾಜೋಪಯೋಗಿ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿನಿಯೋಗಿಸಿದರೆ ನಿಮಗೆ ಅಪಾರ ಕೀರ್ತಿ ದೊರೆಯುತ್ತದೆ.`,

    `ಕರ್ಕ ಲಗ್ನವು ಚಂದ್ರ ಗ್ರಹದ ಅಧಿಪತ್ಯದ ಚರ ಹಾಗೂ ಜಲ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮಲ್ಲಿ ತಾಯಿಯಂತಹ ವಾತ್ಸಲ್ಯ, ಆಳವಾದ ಕರುಣೆ ಮತ್ತು ಸೂಕ್ಷ್ಮ ಅಂತಃಪ್ರಜ್ಞೆಯನ್ನು ತುಂಬುತ್ತದೆ. ಇತರರ ಮನಸ್ಸಿನ ನೋವು ಮತ್ತು ಭಾವನೆಗಳನ್ನು ಅವರು ಹೇಳದೆಯೇ ಗ್ರಹಿಸುವ ಅಪೂರ್ವ ಶಕ್ತಿ ನಿಮಗಿರುತ್ತದೆ. ಚಂದ್ರನ ಪೋಷಣೆಯು ನಿಮ್ಮನ್ನು ಕುಟುಂಬದ ರಕ್ಷಕರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ; ನಿಮ್ಮ ಮನೆ ಹಾಗೂ ಪ್ರೀತಿಪಾತ್ರರ ಸುಖ-ಶಾಂತಿಯೇ ನಿಮ್ಮ ಪ್ರಥಮ ಆದ್ಯತೆಯಾಗಿರುತ್ತದೆ. ನಿಮ್ಮ ದಯಾಗುಣ, ಮೃದು ಸ್ವಭಾವ ಮತ್ತು ಆತಿಥ್ಯ ಮನೋಭಾವವು ಎಲ್ಲರ ಮನದಲ್ಲೂ ನಿಮಗೆ ಪೂಜ್ಯ ಭಾವನೆಯನ್ನು ಮೂಡಿಸುತ್ತದೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ಚಂದ್ರನ ಕಲೆಗಳಂತೆ ನಿಮ್ಮ ಭಾವನೆಗಳೂ ಆಗಾಗ ಏರಿಳಿತ ಕಾಣಬಹುದು; ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾಗಿ ಮರುಗುವುದು ಅಥವಾ ಹಳೆಯ ಕಹಿ ಘಟನೆಗಳನ್ನು ನೆನೆದು ಕೊರಗುವುದು ನಿಮ್ಮ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ಕೆಡಿಸಬಹುದು. ಭಾವನಾತ್ಮಕ ಸಮತೋಲನವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಲು ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಮತ್ತು ದೃಢ ಮನಸ್ಸಿನಿಂದ ವರ್ತಿಸುವುದು ಅತ್ಯಗತ್ಯ. ನಿಮ್ಮ ಅಪಾರ ಕಲ್ಪನಾಶಕ್ತಿ ಹಾಗೂ ಅಂತಃಪ್ರೇರಣೆಯು ಕಲೆ, ಸಾಹಿತ್ಯ ಮತ್ತು ಸಮಾಜ ಸೇವೆಯಲ್ಲಿ ಅದ್ಭುತ ಯಶಸ್ಸನ್ನು ತರಬಲ್ಲದು. ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿಯನ್ನು ಕಾಪಾಡಿಕೊಂಡರೆ ನಿಮ್ಮ ಜೀವನವು ಪ್ರೀತಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಆನಂದದಿಂದ ತುಂಬಿರುತ್ತದೆ.`,

    `ಸಿಂಹ ಲಗ್ನವು ಸಾಕ್ಷಾತ್ ಸೂರ್ಯ ದೇವನ ಅಧಿಪತ್ಯದ ಸ್ಥಿರ ಹಾಗೂ ಅಗ್ನಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವದಲ್ಲಿ ರಾಜಗಾಂಭೀರ್ಯ, ಉನ್ನತ ಆತ್ಮಗೌರವ ಮತ್ತು ನೈಸರ್ಗಿಕ ಅಧಿಕಾರ ಶಕ್ತಿಯನ್ನು ತುಂಬುತ್ತದೆ. ನೀವು ಎಲ್ಲೇ ಇದ್ದರೂ ನಿಮ್ಮ ತೇಜಸ್ಸು ಮತ್ತು ನಾಯಕತ್ವ ಗುಣಗಳು ಎದ್ದು ಕಾಣುತ್ತವೆ; ಕೀಳರಿಮೆಗೆ ಒಳಗಾಗದೆ ಉನ್ನತ ಆದರ್ಶಗಳನ್ನು ಪಾಲಿಸುವುದು ನಿಮ್ಮ ರಕ್ತದಲ್ಲೇ ಬಂದಿರುತ್ತದೆ. ಸೂರ್ಯನ ತೇಜಸ್ಸಿನಿಂದಾಗಿ ನೀವು ವಿಶಾಲ ಹೃದಯಿಗಳು, ನಿಸ್ವಾರ್ಥವಾಗಿ ಇತರರಿಗೆ ಆಸರೆಯಾಗುವವರು ಮತ್ತು ಅನ್ಯಾಯವನ್ನು ಎಂದಿಗೂ ಸಹಿಸದ ನ್ಯಾಯಪ್ರಿಯ ವ್ಯಕ್ತಿಗಳಾಗಿ ಬಾಳುತ್ತೀರಿ.\n\nನಿಮ್ಮ ಅಂತಃಕರಣವು ಅತ್ಯಂತ ಉದಾರವಾಗಿದ್ದು, ನಿಮ್ಮನ್ನು ನಂಬಿ ಬಂದವರನ್ನು ಪ್ರಾಣಕೊಟ್ಟಾದರೂ ರಕ್ಷಿಸುವ ಗುಣ ನಿಮ್ಮಲ್ಲಿದೆ. ಆದರೆ ನಿಮ್ಮ ಸ್ವಾಭಿಮಾನವು ಕೆಲವೊಮ್ಮೆ ಅಹಂಕಾರವಾಗಿ ಬದಲಾಗದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಮುಖ್ಯವಾಗಿದೆ; ಇತರರ ಸಣ್ಣ ತಪ್ಪುಗಳನ್ನು ಕ್ಷಮಿಸಿ, ಎಲ್ಲರ ಸಲಹೆಗಳನ್ನೂ ಸಮಾಧಾನದಿಂದ ಕೇಳಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಘನತೆಯನ್ನು ಇನ್ನಷ್ಟು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಸಾರ್ವಜನಿಕ ಜೀವನ, ಆಡಳಿತ ಹಾಗೂ ಉದ್ಯಮಗಳಲ್ಲಿ ನೀವು ಅದ್ಭುತವಾಗಿ ಮಿಂಚಬಲ್ಲ ಸಾಮರ್ಥ್ಯ ಹೊಂದಿದ್ದೀರಿ. ನಿಮ್ಮ ಅಂತರ್ಯದ ಪ್ರಕಾಶವನ್ನು ಧರ್ಮಮಾರ್ಗದಲ್ಲಿ ನಡೆಸಿದರೆ ನೀವು ಜನಮನ್ನಣೆ ಪಡೆದು ಚಿರಕಾಲ ನೆನಪಿನಲ್ಲಿ ಉಳಿಯುವ ಸಾಧನೆ ಮಾಡುತ್ತೀರಿ.`,

    `ಕನ್ಯಾ ಲಗ್ನವು ಬುಧ ಗ್ರಹದ ಆಡಳಿತಕ್ಕೆ ಸೇರಿದ ದ್ವಿಸ್ವಭಾವ ಹಾಗೂ ಭೂಮಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ಸೂಕ್ಷ್ಮ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಬುದ್ಧಿ, ಶಿಸ್ತುಬದ್ಧ ಜೀವನ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಜಾಣ್ಮೆಯನ್ನು ನೀಡುತ್ತದೆ. ಯಾವುದೇ ಸಮಸ್ಯೆಯ ಆಳಕ್ಕಿಳಿದು ಅದರ ನೈಜ ಕಾರಣವನ್ನು ಪತ್ತೆಹಚ್ಚುವಲ್ಲಿ ನೀವು ನಿಸ್ಸೀಮರು. ಪ್ರತಿಯೊಂದು ಕೆಲಸವನ್ನೂ ಪರಿಪೂರ್ಣವಾಗಿ, ಅಚ್ಚುಕಟ್ಟಾಗಿ ಮಾಡಬೇಕೆಂಬ ನಿಮ್ಮ ಧ್ಯೇಯವು ನಿಮ್ಮನ್ನು ವೃತ್ತಿರಂಗದಲ್ಲಿ ಅತ್ಯಂತ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಕ್ತಿಯನ್ನಾಗಿ ಮಾಡುತ್ತದೆ. ಬುಧನ ಪ್ರಭಾವದಿಂದಾಗಿ ಕರಾರುವಾಕ್ಕಾದ ಲೆಕ್ಕಾಚಾರ, ಸಂಶೋಧನೆ ಮತ್ತು ಸೇವಾ ಮನೋಭಾವವು ನಿಮ್ಮಲ್ಲಿ ಸಹಜವಾಗಿಯೇ ಇರುತ್ತದೆ.\n\nಮಾನಸಿಕವಾಗಿ ನೀವು ಸದಾ ಕೆಲಸದಲ್ಲಿ ನಿರತರಾಗಿರಲು ಬಯಸುತ್ತೀರಿ; ಆದರೆ ಪ್ರತಿಯೊಂದರಲ್ಲೂ ದೋಷ ಹುಡುಕುವ ಅಥವಾ ಅತಿಯಾದ ಪರಿಪೂರ್ಣತೆಯನ್ನು ನಿರೀಕ್ಷಿಸುವ ಪ್ರವೃತ್ತಿಯು ನಿಮ್ಮಲ್ಲಿ ಮಾನಸಿಕ ಒತ್ತಡ ಹಾಗೂ ಆತಂಕವನ್ನು ಹೆಚ್ಚಿಸಬಹುದು. ಜೀವನದ ಸಣ್ಣ ನ್ಯೂನತೆಗಳನ್ನು ಸಹಜವೆಂದು ಒಪ್ಪಿಕೊಂಡು ಮನಸ್ಸನ್ನು ವಿಶ್ರಾಂತವಾಗಿಡುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ನಿಸ್ವಾರ್ಥ ಸೇವೆ ಹಾಗೂ ಪ್ರಾಮಾಣಿಕ ದುಡಿಮೆಯು ನಿಮಗೆ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನವನ್ನು ತಂದುಕೊಡುತ್ತದೆ. ತಾರ್ಕಿಕ ಬುದ್ಧಿಯ ಜೊತೆಗೆ ದಯಾಭಾವವನ್ನು ಬೆಳೆಸಿಕೊಂಡರೆ ನಿಮ್ಮ ಬಾಳು ಅತ್ಯಂತ ಯಶಸ್ವಿ ಹಾಗೂ ಶಾಂತಿಯುತವಾಗಿರುತ್ತದೆ.`,

    `ತುಲಾ ಲಗ್ನವು ಶುಕ್ರ ಗ್ರಹದ ಒಡೆತನಕ್ಕೆ ಸೇರಿದ ಚರ ಹಾಗೂ ವಾಯು ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮಲ್ಲಿ ಸಮಚಿತ್ತ, ಆಕರ್ಷಕ ನಡವಳಿಕೆ ಮತ್ತು ಸಾಟಿಯಿಲ್ಲದ ನ್ಯಾಯನಿಷ್ಠೆಯನ್ನು ಬೆಳೆಸುತ್ತದೆ. ಸಮಾಜದಲ್ಲಿ ಶಾಂತಿ, ಸಾಮರಸ್ಯ ಮತ್ತು ಸೌಹಾರ್ದತೆಯನ್ನು ಕಾಪಾಡುವುದು ನಿಮ್ಮ ಪ್ರಮುಖ ಧ್ಯೇಯವಾಗಿರುತ್ತದೆ. ಶುಕ್ರನ ಸೌಂದರ್ಯ ಲಕ್ಷಣಗಳು ನಿಮ್ಮ ನಡೆನುಡಿಯಲ್ಲಿ ಪ್ರತಿಬಿಂಬಿತವಾಗುತ್ತವೆ; ಕಲೆ, ಸಾಹಿತ್ಯ, ಸಂಗೀತ ಹಾಗೂ ಆಕರ್ಷಕ ಜೀವನಶೈಲಿಯಲ್ಲಿ ನೀವು ಆನಂದವನ್ನು ಕಾಣುತ್ತೀರಿ. ಯಾವುದೇ ವಿವಾದಗಳನ್ನು ಶಾಂತಿಯುತ ಸಂಧಾನದ ಮೂಲಕ ಬಗೆಹರಿಸುವ ಅದ್ಭುತ ಕಲೆ ನಿಮ್ಮ ಕರಗತವಾಗಿರುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಸದಾ ಮಾನಸಿಕ ಸಮತೋಲನವನ್ನು ಹುಡುಕುತ್ತೀರಿ; ಎರಡೂ ಕಡೆಯ ವಾದಗಳನ್ನು ತೂಗಿ ನೋಡುವ ನಿಮ್ಮ ಸ್ವಭಾವದಿಂದಾಗಿ ಕೆಲವೊಮ್ಮೆ ಸ್ಪಷ್ಟ ನಿರ್ಧಾರಗಳನ್ನು ಸಕಾಲದಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಲು ಹಿಂಜರಿಯಬಹುದು. ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವಾಗ ಅತಿಯಾಗಿ ಆಲೋಚಿಸದೆ ದೃಢ ಸಂಕಲ್ಪದಿಂದ ಮುನ್ನಡೆಯುವುದು ನಿಮ್ಮ ಪ್ರಗತಿಗೆ ಅವಶ್ಯಕವಾಗಿದೆ. ಸಂಬಂಧಗಳಲ್ಲಿ ನೀವು ಅಪಾರ ಪ್ರೀತಿ ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ನೀಡುತ್ತೀರಿ ಹಾಗೂ ಅಷ್ಟೇ ಗೌರವವನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತೀರಿ. ನಿಮ್ಮ ರಾಜತಾಂತ್ರಿಕ ಜಾಣ್ಮೆ ಮತ್ತು ಪ್ರಾಮಾಣಿಕ ಧರ್ಮನಿಷ್ಠೆಯು ನಿಮ್ಮನ್ನು ಎಲ್ಲರ ಮೆಚ್ಚಿನ ಮಾರ್ಗದರ್ಶಕರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.`,

    `ವೃಶ್ಚಿಕ ಲಗ್ನವು ಕುಜ ಮತ್ತು ಕೇತು ಗ್ರಹಗಳ ಆಧಿಪತ್ಯಕ್ಕೆ ಸೇರಿದ ಸ್ಥಿರ ಹಾಗೂ ಜಲ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮಲ್ಲಿ ನಿಗೂಢ ಶಕ್ತಿ, ಆಳವಾದ ಸಂಕಲ್ಪ ಮತ್ತು ಅದಮ್ಯ ಸಹಿಷ್ಣುತೆಯನ್ನು ತುಂಬುತ್ತದೆ. ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವು ಅತ್ಯಂತ ಆಕರ್ಷಕ ಹಾಗೂ ಗಂಭೀರವಾಗಿದ್ದು, ಮೇಲ್ನೋಟಕ್ಕೆ ಶಾಂತವಾಗಿ ಕಂಡರೂ ಒಳಗೆ ಅಪಾರ ಶಕ್ತಿಯ ಸಾಗರವೇ ಅಡಗಿರುತ್ತದೆ. ಯಾವುದೇ ಆಘಾತ ಅಥವಾ ಸವಾಲುಗಳು ಎದುರಾದರೂ ಧೃತಿಗೆಡದೆ ಪುನಃ ಶಕ್ತಿಯುತವಾಗಿ ಎದ್ದು ನಿಲ್ಲುವ ಚೇತರಿಕೆ ನಿಮ್ಮಲ್ಲಿದೆ. ಸತ್ಯವನ್ನು ಭೇದಿಸುವ ಮತ್ತು ರಹಸ್ಯಗಳನ್ನು ಅರಿಯುವ ನಿಮ್ಮ ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿಯು ಅದ್ಭುತವಾಗಿದೆ.\n\nಭಾವನಾತ್ಮಕವಾಗಿ ನೀವು ಅತೀವ ನಿಷ್ಠಾವಂತರು; ಯಾರನ್ನಾದರೂ ಪ್ರೀತಿಸಿದರೆ ಅಥವಾ ನಂಬಿದರೆ ಅವರ ಪರವಾಗಿ ಜೀವವನ್ನೇ ಮುಡಿಪಾಗಿಡುತ್ತೀರಿ, ಆದರೆ ದ್ರೋಹ ಅಥವಾ ಮೋಸವನ್ನು ಎಂದಿಗೂ ಕ್ಷಮಿಸುವುದಿಲ್ಲ. ಮನಸ್ಸಿನಲ್ಲಿ ಹಳೆಯ ನೋವುಗಳನ್ನು ಇಟ್ಟುಕೊಳ್ಳದೆ ಕ್ಷಮಾಗುಣವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ಆತ್ಮೋನ್ನತಿಗೆ ಅತಿ ಶ್ರೇಷ್ಠ ಹಾದಿಯಾಗಿದೆ. ನಿಮ್ಮ ಅಗಾಧ ಇಚ್ಛಾಶಕ್ತಿ ಹಾಗೂ ಸಂಶೋಧನಾತ್ಮಕ ಮನೋಭಾವವನ್ನು ಸತ್ಕಾರ್ಯಗಳಿಗೆ ಬಳಸಿದರೆ ನೀವು ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಸ್ಥಾನವನ್ನು ಅಲಂಕರಿಸುತ್ತೀರಿ. ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯಿಂದ ನಿಮ್ಮ ಆಂತರಿಕ ಚೈತನ್ಯವು ದಿವ್ಯ ಬೆಳಕಾಗಿ ಪ್ರಕಾಶಿಸುತ್ತದೆ.`,

    `ಧನುರ್ ಲಗ್ನವು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಆಡಳಿತಕ್ಕೆ ಸೇರಿದ ದ್ವಿಸ್ವಭಾವ ಹಾಗೂ ಅಗ್ನಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ವಿಶಾಲ ಹೃದಯ, ಧಾರ್ಮಿಕ ಚಿಂತನೆ ಮತ್ತು ಅಚಲ ಆಶಾವಾದವನ್ನು ಕರುಣಿಸುತ್ತದೆ. ನೀವು ಸತ್ಯ, ಧರ್ಮ ಮತ್ತು ನ್ಯಾಯದ ಪರವಾಗಿ ಸದಾ ನಿಲ್ಲುವ ಆದರ್ಶವಾದಿಯಾಗಿದ್ದು, ಬದುಕನ್ನು ಒಂದು ಪವಿತ್ರ ಜ್ಞಾನಯಜ್ಞದಂತೆ ಕಾಣುತ್ತೀರಿ. ಗುರುವಿನ ಕೃಪೆಯಿಂದಾಗಿ ಉನ್ನತ ಶಿಕ್ಷಣ, ತತ್ವಶಾಸ್ತ್ರ, ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಸಮಾಜ ಸುಧಾರಣೆಯ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ಸಹಜವಾದ ಆಸಕ್ತಿ ಇರುತ್ತದೆ. ನಿಮ್ಮ ಉತ್ಸಾಹಭರಿತ ಮಾತುಗಳು ಇತರರಿಗೆ ಪ್ರೇರಣೆ ನೀಡುತ್ತವೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಸಂಪೂರ್ಣ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಪ್ರೀತಿಸುತ್ತೀರಿ; ಸಂಕುಚಿತ ಆಲೋಚನೆಗಳು ಅಥವಾ ಕಟ್ಟುಪಾಡುಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಒಗ್ಗುವುದಿಲ್ಲ. ನಿಮ್ಮ ನೇರವಾದ ಮಾತುಗಳು ಕೆಲವೊಮ್ಮೆ ಇತರರ ಮನಸ್ಸನ್ನು ನೋಯಿಸದಂತೆ ಎಚ್ಚರವಹಿಸಿ, ಮೃದುವಾಗಿ ಬೋಧಿಸುವುದು ನಿಮ್ಮ ಘನತೆಗೆ ಶೋಭೆ ತರುತ್ತದೆ. ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ಏರಿಳಿತಗಳು ಬಂದರೂ ದೈವಕೃಪೆಯ ಮೇಲೆ ನಿಮಗೆ ಅಚಲ ನಂಬಿಕೆಯಿರುತ್ತದೆ. ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ವಿಶಾಲ ದೃಷ್ಟಿಕೋನ ಮತ್ತು ಸದಾಚಾರವು ನಿಮಗೆ ಸಮಾಜದಲ್ಲಿ ಪರಮ ಗೌರವ ಹಾಗೂ ಶ್ರೇಷ್ಠ ಯಶಸ್ಸನ್ನು ಖಂಡಿತವಾಗಿ ತಂದುಕೊಡುತ್ತದೆ.`,

    `ಮಕರ ಲಗ್ನವು ನ್ಯಾಯದೇವತೆ ಶನೀಶ್ವರನ ಅಧಿಪತ್ಯಕ್ಕೆ ಸೇರಿದ ಚರ ಹಾಗೂ ಭೂಮಿ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ಅಪಾರ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯನಿಷ್ಠೆ ಮತ್ತು ಅಚಲ ಶ್ರಮಶೀಲತೆಯನ್ನು ದಯಪಾಲಿಸುತ್ತದೆ. ನೀವು ಯಾವುದೇ ಶಾರ್ಟ್‌ಕಟ್ ಅಥವಾ ಅಡ್ಡದಾರಿಗಳನ್ನು ನಂಬದೆ, ಕಠಿಣ ಪರಿಶ್ರಮದಿಂದ ಹಂತಹಂತವಾಗಿ ಯಶಸ್ಸಿನ ಶಿಖರವನ್ನು ಏರುವ ಛಲಗಾರರು. ಶನಿಯ ಕಠಿಣ ಶಿಸ್ತು ನಿಮ್ಮನ್ನು ಪ್ರಬುದ್ಧರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ; ಎಂತಹ ಬಿಕ್ಕಟ್ಟಿನ ಪರಿಸ್ಥಿತಿಯಲ್ಲೂ ಧೈರ್ಯಗುಂದದೆ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಹೊತ್ತು ಮುನ್ನಡೆಸುವ ನಾಯಕತ್ವ ನಿಮ್ಮದಾಗಿರುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಭಾವನೆಗಳನ್ನು ಸುಲಭವಾಗಿ ವ್ಯಕ್ತಪಡಿಸುವುದಿಲ್ಲ; ಬಾಹ್ಯವಾಗಿ ಗಂಭೀರವಾಗಿ ಕಂಡರೂ ಒಳಗೆ ಅಪಾರ ಕಳಕಳಿ ಮತ್ತು ಮೃದು ಹೃದಯವನ್ನು ಹೊಂದಿರುತ್ತೀರಿ. ಸದಾ ಕೆಲಸ ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳಲ್ಲೇ ಮುಳುಗಿರದೆ, ಜೀವನದ ಆನಂದವನ್ನು ಅನುಭವಿಸಲು ಹಾಗೂ ಕುಟುಂಬದೊಂದಿಗೆ ನಗುನಗುತ್ತಾ ಸಮಯ ಕಳೆಯಲು ಕಲಿಯುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ನಿಮ್ಮ ಅಪಾರ ಸಹನೆ, ನೈತಿಕ ಶಕ್ತಿ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯು ನಿಮಗೆ ಕಾಲಕ್ರಮೇಣ ಅಖಂಡ ಕೀರ್ತಿ, ಸ್ಥಿರ ಆಸ್ತಿ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಅತಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನವನ್ನು ತಂದುಕೊಡುತ್ತದೆ.`,

    `ಕುಂಭ ಲಗ್ನವು ಶನಿ ಮತ್ತು ರಾಹು ಗ್ರಹಗಳ ಒಡೆತನಕ್ಕೆ ಸೇರಿದ ಸ್ಥಿರ ಹಾಗೂ ವಾಯು ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮಗೆ ಅದ್ಭುತ ದೂರದೃಷ್ಟಿ, ಸ್ವತಂತ್ರ ಆಲೋಚನೆ ಮತ್ತು ಮಾನವೀಯ ಕಾಳಜಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ. ನೀವು ಸಮಾಜದ ಮೂಢನಂಬಿಕೆಗಳು ಅಥವಾ ಹಳೆಯ ಕಟ್ಟುಪಾಡುಗಳನ್ನು ಮೀರಿ, ಪ್ರಗತಿಪರ ಹಾಗೂ ಕ್ರಾಂತಿಕಾರಿ ವಿಚಾರಗಳನ್ನು ಹೊಂದಿರುವ ನವಯುಗದ ಚಿಂತಕರಾಗಿದ್ದೀರಿ. ಶನಿ ಮತ್ತು ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ ವಿಜ್ಞಾನ, ತಂತ್ರಜ್ಞಾನ, ಸಂಶೋಧನೆ ಮತ್ತು ಸಮಾಜ ಸುಧಾರಣೆಯಲ್ಲಿ ನೀವು ಅದ್ಭುತ ಆಸಕ್ತಿ ಹಾಗೂ ಪ್ರತಿಭೆಯನ್ನು ಹೊಂದಿರುತ್ತೀರಿ.\n\nಮಾನಸಿಕವಾಗಿ ನೀವು ಎಲ್ಲರನ್ನೂ ಸಮಾನವಾಗಿ ಕಾಣುವ ವಿಶಾಲ ಮನೋಭಾವವನ್ನು ಹೊಂದಿದ್ದೀರಿ; ಆದರೆ ವೈಯಕ್ತಿಕ ಸಂಬಂಧಗಳಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅತಿಯಾದ ನಿರ್ಲಿಪ್ತತೆ ಅಥವಾ ಭಾವನಾತ್ಮಕ ಅಂತರವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುವುದು ಇತರರಿಗೆ ಬೇಸರ ತರಿಸಬಹುದು. ನಿಮ್ಮ ಉನ್ನತ ಆದರ್ಶಗಳ ಜೊತೆಗೆ ಪ್ರೀತಿಪಾತ್ರರ ಸೂಕ್ಷ್ಮ ಭಾವನೆಗಳಿಗೂ ಬೆಲೆ ನೀಡುವುದು ಬದುಕಿಗೆ ಮಾಧುರ್ಯ ತರುತ್ತದೆ. ನಿಸ್ವಾರ್ಥ ಸಮಾಜ ಸೇವೆ ಹಾಗೂ ನವೀನ ಆವಿಷ್ಕಾರಗಳ ಮೂಲಕ ನೀವು ಜಗತ್ತಿಗೆ ಬೆಳಕಾಗಬಲ್ಲಿರಿ. ನಿಮ್ಮ ಸೃಜನಶೀಲ ಪ್ರತಿಭೆಯು ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಯುವಂತಹ ಶಾಶ್ವತ ಬದಲಾವಣೆಯನ್ನು ತರಬಲ್ಲದು.`,

    `ಮೀನ ಲಗ್ನವು ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಆಡಳಿತಕ್ಕೆ ಸೇರಿದ ದ್ವಿಸ್ವಭಾವ ಹಾಗೂ ಜಲ ತತ್ವದ ರಾಶಿಯಾಗಿದ್ದು, ನಿಮ್ಮಲ್ಲಿ ಅಪಾರ ಕರುಣೆ, ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು ಮತ್ತು ದೈವಿಕ ಕಲ್ಪನಾಶಕ್ತಿಯನ್ನು ತುಂಬುತ್ತದೆ. ನಿಮ್ಮ ಮನಸ್ಸು ಸಾಗರದಂತೆ ವಿಶಾಲವಾಗಿದ್ದು, ಸಕಲ ಜೀವರಾಶಿಗಳ ಮೇಲೂ ಪ್ರೀತಿ ಹಾಗೂ ಅನುಕಂಪವನ್ನು ಹೊಂದಿರುತ್ತೀರಿ. ಗುರುವಿನ ಪರಮ ಕೃಪೆಯಿಂದಾಗಿ ನಿಮಗೆ ದೈವಿಕ ಜ್ಞಾನ, ಧ್ಯಾನ, ಸಂಗೀತ ಮತ್ತು ಕಲೆಗಳಲ್ಲಿ ಸ್ವಾಭಾವಿಕ ಒಲವಿರುತ್ತದೆ. ಭೌತಿಕ ಪ್ರಪಂಚದ ಮೋಹಕ್ಕಿಂತ ಆತ್ಮತೃಪ್ತಿ ಮತ್ತು ಶಾಂತಿಗೆ ನೀವು ಸದಾ ಹೆಚ್ಚಿನ ಪ್ರಾಧಾನ್ಯ ನೀಡುತ್ತೀರಿ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಮನಸ್ಕರಾಗಿದ್ದು, ಇತರರ ನೋವನ್ನು ತಾವೇ ಅನುಭವಿಸುವಷ್ಟು ಕರುಣಾಳುಗಳಾಗಿದ್ದೀರಿ; ಆದರೆ ಕೆಲವೊಮ್ಮೆ ಭ್ರಮಾಲೋಕದಲ್ಲಿ ವಿಹರಿಸದೆ ವಾಸ್ತವಿಕ ಸತ್ಯಗಳನ್ನು ಧೈರ್ಯವಾಗಿ ಎದುರಿಸುವುದು ಮುಖ್ಯವಾಗಿದೆ. ಪ್ರಾಯೋಗಿಕ ಶಿಸ್ತನ್ನು ಮೈಗೂಡಿಸಿಕೊಂಡು, ನಿಮ್ಮ ಅದ್ಭುತ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿಯನ್ನು ಧರ್ಮಮಾರ್ಗದಲ್ಲಿ ನಡೆಸಿದರೆ ನೀವು ಜಗತ್ತಿಗೆ ಶಾಂತಿಯ ಸಂದೇಶ ನೀಡುವ ಶ್ರೇಷ್ಠ ವ್ಯಕ್ತಿಯಾಗುತ್ತೀರಿ. ನಿಮ್ಮ ಪವಿತ್ರ ಹೃದಯ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ಪ್ರಾರ್ಥನೆಗಳು ನಿಮಗೆ ಸಕಲ ಸೌಭಾಗ್ಯಗಳನ್ನು ತಂದುಕೊಡುತ್ತವೆ.`
  ];

  const lagnaDescsHi = [
    `मेष लग्न एक चर एवं अग्नि तत्व की राशि है जिसके स्वामी ऊर्जा और साहस के कारक मंगल ग्रह हैं। यह लग्न आपके व्यक्तित्व में अपार जीवन शक्ति, निडर नेतृत्व क्षमता और नई शुरुआत करने का अद्भुत उत्साह भरता है। आप जीवन के प्रत्येक क्षेत्र में प्रत्यक्ष और पारदर्शी दृष्टिकोण अपनाते हैं, तथा किसी भी कठिन चुनौती के सामने झुकने के बजाय अपनी दृढ़ इच्छाशक्ति से उसका सामना करते हैं। मंगल का प्रभाव आपको अत्यधिक सक्रिय और आत्मविश्वासी बनाता है, जिससे आप कठिन परिस्थितियों में भी दूसरों का सफल मार्गदर्शन करने में सक्षम होते हैं।\n\nमानसिक और भावनात्मक स्तर पर आप पूर्ण स्वतंत्रता के पक्षधर हैं और अपने निर्णयों में किसी भी प्रकार का अनावश्यक हस्तक्षेप पसंद नहीं करते हैं। आपका स्वभाव निष्कपट और स्पष्टवादी है, किंतु कभी-कभी जल्दबाजी और उग्रता से बचना आपके लिए अत्यंत आवश्यक हो जाता है। रिश्तों और पारिवारिक जीवन में आप अत्यंत निष्ठावान और सुरक्षात्मक भूमिका निभाते हैं, तथा अपने प्रियजनों के सम्मान के लिए सदैव खड़े रहते हैं। यदि आप नियमित संयम और धैर्य का अभ्यास करते हैं, तो आपकी यह असीम ऊर्जा आपको सामाजिक प्रतिष्ठा और दीर्घकालिक सफलता के उच्चतम शिखर पर पहुंचाएगी।`,

    `वृषभ लग्न एक स्थिर एवं पृथ्वी तत्व की राशि है जिसके स्वामी सौंदर्य, प्रेम और ऐश्वर्य के कारक शुक्र ग्रह हैं। यह लग्न आपको अद्वितीय धैर्य, व्यावहारिक सोच और जीवन में स्थिरता स्थापित करने की अद्भुत क्षमता प्रदान करता है। आप कोई भी निर्णय जल्दबाजी में लेने के बजाय पूरी सावधानी और जमीनी हकीकत को समझकर लेते हैं। शुक्र के शुभ प्रभाव से आपको कला, संगीत, सुरुचिपूर्ण वातावरण और भौतिक सुख-समृद्धि के प्रति स्वाभाविक आकर्षण होता है, जिससे आप अपने जीवन में स्थायी संपत्ति और सुख-साधन जुटाने में सफल रहते हैं।\n\nमानसिक रूप से आप शांतिपूर्ण और सामंजस्यपूर्ण जीवन को प्राथमिकता देते हैं तथा अपने पारिवारिक दायित्वों को पूरी निष्ठा के साथ निभाते हैं। आपकी वाणी में सौम्यता और व्यवहार में विश्वसनीयता होती है, जिससे लोग आप पर सहज ही भरोसा करते हैं। हालांकि, कभी-कभी आपका अत्यधिक हठ और बदलाव के प्रति अनिच्छा आपके विकास में रुकावट बन सकती है; अतः समय की मांग के अनुसार लचीलापन अपनाना हितकर होगा। आपका अटूट परिश्रम और निष्ठा आपको समाज में प्रतिष्ठित स्थान, पारिवारिक सुख और प्रचुर धन-संपदा अवश्य दिलाएगा।`,

    `मिथुन लग्न एक द्विस्वभाव एवं वायु तत्व की राशि है जिसके स्वामी बुद्धि और वाणी के कारक बुध ग्रह हैं। यह लग्न आपको विलक्षण तार्किक क्षमता, बहुमुखी प्रतिभा और उत्कृष्ट संचार कौशल प्रदान करता है। आपका मस्तिष्क सदैव नवीन जानकारियों को ग्रहण करने और नई विधाओं को सीखने के लिए तत्पर रहता है। बुध की कृपा से आप किसी भी परिस्थिति में बहुत जल्दी ढल जाते हैं और अपनी हाजिरजवाबी तथा मिलनसार स्वभाव से सामाजिक दायरे में सभी को सहज ही आकर्षित कर लेते हैं।\n\nभावनात्मक धरातल पर आप लगातार बौद्धिक सक्रियता की तलाश में रहते हैं, जिससे कई बार एक साथ कई कार्यों में हाथ डालने पर मानसिक भटकाव की स्थिति बन सकती है। यदि आप अपनी ऊर्जा को एक निश्चित लक्ष्य पर केंद्रित करके धैर्यपूर्वक आगे बढ़ें, तो आप अभूतपूर्व बौद्धिक और व्यावसायिक सफलता प्राप्त कर सकते हैं। रिश्तों में आप खुले विचारों वाले होते हैं, किंतु आत्मिक गहराई बनाए रखना आवश्यक है। अपने ज्ञान और रचनात्मक विचारों को सकारात्मक दिशा में लगाकर आप समाज में अत्यधिक सम्मान और कीर्ति अर्जित करेंगे।`,

    `कर्क लग्न एक चर एवं जल तत्व की राशि है जिसके स्वामी मन और भावनाओं के अधिपति चंद्र देव हैं। यह लग्न आपको अगाध संवेदनशीलता, मातृत्ववत वात्सल्य और गहरी अंतर्दृष्टि प्रदान करता है। आप दूसरों के आंतरिक मनोभावों और दुखों को बिना कहे ही समझ लेने की ईश्वरीय क्षमता रखते हैं। चंद्रमा का पोषणकारी प्रभाव आपको अपने परिवार और गृहस्थी का सच्चा संरक्षक बनाता है; अपनों की सुरक्षा और प्रसन्नता ही आपका सबसे बड़ा धर्म होता है। आपकी दयालुता और आत्मीयता सभी के मन में आपके प्रति आदर जगाती है।\n\nमानसिक रूप से चंद्रमा की घटती-बढ़ती कलाओं की भांति आपकी भावनाओं में भी उतार-चढ़ाव आते रहते हैं; अतः छोटी-छोटी बातों पर अत्यधिक भावुक होना या पुरानी पीड़ाओं को याद करना आपके मानसिक संतुलन को प्रभावित कर सकता है। आत्म-विश्वास को सुदृढ़ रखना और व्यावहारिक दृष्टिकोण अपनाना आपके व्यक्तित्व को निखारेगा। आपकी कल्पनाशीलता और अंतःप्रेरणा कला, लेखन और सेवा के क्षेत्र में आपको बहुत आगे ले जा सकती है। मन में शांति बनाए रखने से आपका जीवन प्रेम, संतोष और आध्यात्मिक आनंद से परिपूर्ण रहेगा।`,

    `सिंह लग्न एक स्थिर एवं अग्नि तत्व की राशि है जिसके स्वामी प्रत्यक्ष देवता भगवान सूर्य नारायण हैं। यह लग्न आपके व्यक्तित्व में स्वाभाविक राजसी आभा, अदम्य आत्मविश्वास और उच्च आत्मसम्मान का संचार करता है। आप जहां भी उपस्थित होते हैं, आपका नेतृत्व और प्रभाव स्वतः ही स्पष्ट दिखाई देता है। सूर्य के तेज के कारण आप एक उदार, निष्पक्ष और अन्याय का डटकर विरोध करने वाले सत्यनिष्ठ व्यक्ति के रूप में जाने जाते हैं। आपकी दृढ़ संकल्प शक्ति आपको कठिन से कठिन लक्ष्य को प्राप्त करने का हौसला देती है।\n\nआपका हृदय अत्यंत विशाल होता है और आप अपने आश्रितों की रक्षा के लिए सदैव तत्पर रहते हैं। हालांकि, अपने आत्मसम्मान को कभी अहंकार में न बदलने देना आपके लिए आवश्यक है; दूसरों की भावनाओं का सम्मान करना और उनकी बात धैर्यपूर्वक सुनना आपकी गरिमा को और बढ़ाएगा। प्रशासनिक कार्यों, व्यवसाय और नेतृत्व के क्षेत्रों में आप उत्कृष्ट सफलता पाने की क्षमता रखते हैं। अपनी आंतरिक ऊर्जा को धर्म और परोपकार के मार्ग पर लगाकर आप जन-जन के प्रिय बनेंगे और चिरस्थायी यश प्राप्त करेंगे।`,

    `कन्या लग्न एक द्विस्वभाव एवं पृथ्वी तत्व की राशि है जिसके स्वामी बुद्धि के प्रदाता बुध ग्रह हैं। यह लग्न आपको सूक्ष्म विश्लेषणात्मक बुद्धि, अनुशासित जीवनशैली और व्यावहारिक कुशलता प्रदान करता है। आप प्रत्येक कार्य को अत्यंत बारीकी, स्वच्छता और पूर्णता के साथ संपन्न करने में विश्वास रखते हैं। बुध का प्रभाव आपको जटिल से जटिल समस्याओं की तह तक पहुंचकर उनका सटीक समाधान निकालने की अद्भुत क्षमता देता है। आपकी तार्किक सोच और निस्वार्थ सेवाभाव आपको कार्यक्षेत्र में अपरिहार्य बना देता है।\n\nमानसिक रूप से आप सदैव कुछ न कुछ रचनात्मक और उपयोगी करने में व्यस्त रहना पसंद करते हैं। हालांकि, हर चीज में परफेक्शन ढूंढने की आदत कभी-कभी आपके भीतर अनावश्यक तनाव या चिंता को जन्म दे सकती है; अतः जीवन की छोटी-मोटी कमियों को सहजता से स्वीकार करना सीखें। आपका समर्पित परिश्रम और निष्कपट स्वभाव आपको समाज में अत्यंत आदरणीय स्थान दिलाएगा। अपनी तीक्ष्ण बुद्धि के साथ दया और करुणा का समन्वय करके आप जीवन में निरंतर प्रगति और आंतरिक शांति का अनुभव करेंगे।`,

    `तुला लग्न एक चर एवं वायु तत्व की राशि है जिसके स्वामी सौंदर्य, न्याय और कला के कारक शुक्र ग्रह हैं। यह लग्न आपके व्यक्तित्व में संतुलन, कूटनीतिक कुशलता और अद्भुत सौहार्द्र भरता है। आप हर परिस्थिति में शांति और न्याय की स्थापना के पक्षधर होते हैं तथा विवादों को सुलझाने में माहिर माने जाते हैं। शुक्र की कृपा से आपका दृष्टिकोण परिष्कृत होता है; आप कला, संस्कृति, सुरुचिपूर्ण जीवन और संतुलित संबंधों में वास्तविक आनंद का अनुभव करते हैं। आपका शिष्ट आचरण सभी को प्रभावित करता है।\n\nभावनात्मक धरातल पर आप सदैव मानसिक समरसता की खोज में रहते हैं, किंतु दोनों पक्षों को संतुलित करने के प्रयास में कई बार आप त्वरित निर्णय लेने में असमंजस की स्थिति में पड़ सकते हैं। अपने आत्मिक संकल्प को मजबूत करके दृढ़ता से निर्णय लेना आपकी सफलता की कुंजी है। आप रिश्तों को अत्यधिक महत्व देते हैं और सच्चे प्रेम तथा परस्पर सम्मान के भूखे होते हैं। अपनी स्वाभाविक निष्पक्षता और कलात्मक प्रतिभा से आप समाज में एक सम्मानित मार्गदर्शक और सफल व्यक्तित्व के रूप में उभरेंगे।`,

    `वृश्चिक लग्न एक स्थिर एवं जल तत्व की राशि है जिसके स्वामी पराक्रम के कारक मंगल और मोक्ष के कारक केतु हैं। यह लग्न आपको चुंबकीय आकर्षण, अगाध संकल्प शक्ति और गहन मानसिक गहराई प्रदान करता है। आपका व्यक्तित्व अत्यंत प्रभावशाली और रहस्यमयी होता है; आप बाहर से चाहे कितने भी शांत दिखें, भीतर से असीम ऊर्जा का भंडार होते हैं। जीवन की बड़ी से बड़ी विपत्तियों से भी आप बिना विचलित हुए फीनिक्स पक्षी की भांति पुनः उठ खड़े होने का अद्भुत सामर्थ्य रखते हैं।\n\nभावनात्मक रूप से आप अत्यधिक निष्ठावान होते हैं और जिन पर विश्वास करते हैं, उनके लिए अपना सर्वस्व न्योछावर कर सकते हैं; किंतु विश्वासघात को आप कभी भुला नहीं पाते। अपने भीतर बदले की भावना या पुरानी कड़वाहट को स्थान न देकर क्षमाशीलता अपनाना आपकी आध्यात्मिक उन्नति के लिए सर्वोत्तम मार्ग है। अपनी असीम इच्छाशक्ति और अनुसंधानपरक सोच को यदि आप समाज कल्याण में लगाएं, तो आप असाधारण उपलब्धियां हासिल करेंगे। आपकी आंतरिक शक्ति आपको जीवन के हर युद्ध में विजयी बनाएगी।`,

    `धनु लग्न एक द्विस्वभाव एवं अग्नि तत्व की राशि है जिसके स्वामी ज्ञान और धर्म के अधिष्ठाता देवगुरु बृहस्पति हैं। यह लग्न आपको विशाल दृष्टिकोण, उच्च आदर्श, धार्मिक अभिरुचि और जीवन के प्रति अगाध आशावाद प्रदान करता है। आप सत्य और धर्म के मार्ग पर अडिग रहने वाले व्यक्ति हैं और संपूर्ण जीवन को एक महान आध्यात्मिक यात्रा के रूप में देखते हैं। गुरु की कृपा से आपकी रुचि उच्च ज्ञान, दर्शन, न्याय और समाज सुधार के कार्यों में स्वाभाविक रूप से रहती है। आपकी प्रेरक बातें दूसरों का मार्गदर्शन करती हैं।\n\nमानसिक धरातल पर आप पूर्ण व्यक्तिगत स्वतंत्रता के आकांक्षी होते हैं और संकीर्ण विचारों में बंधना आपको कतई स्वीकार नहीं होता। आपकी स्पष्टवादिता कभी-कभी दूसरों को कठोर लग सकती है, इसलिए अपने वचनों में सौम्यता और मिठास बनाए रखना आपके यश को द्विगुणित करेगा। जीवन में आने वाले उतार-चढ़ावों के बीच भी ईश्वर पर आपका अटूट विश्वास बना रहता है। आपका दार्शनिक ज्ञान, परोपकारी स्वभाव और सदाचार आपको समाज में पूजनीय स्थान और जीवन में दिव्य सफलता अवश्य दिलाएगा।`,

    `मकर लग्न एक चर एवं पृथ्वी तत्व की राशि है जिसके स्वामी कर्मफलदाता भगवान शनिदेव हैं। यह लग्न आपको अटूट धैर्य, कर्तव्यपरायणता और अथक परिश्रम करने का संकल्प प्रदान करता है। आप किसी भी शॉर्टकट में विश्वास नहीं करते, बल्कि अपनी कठोर मेहनत और निरंतरता से सफलता की सीढ़ियां चढ़ते हैं। शनि का अनुशासित प्रभाव आपके चरित्र को अत्यंत सुदृढ़ और विश्वसनीय बनाता है। संकट के समय में आपका शांत चित्त और व्यावहारिक दृष्टिकोण आपको एक स्वाभाविक और दृढ़ नेतृत्वकर्ता के रूप में स्थापित करता है।\n\nआंतरिक रूप से आप अपनी भावनाओं को सरलता से प्रकट नहीं करते; आपकी बाह्य गंभीरता के पीछे एक अत्यंत जिम्मेदार और संवेदनशील हृदय छिपा होता है। जीवन में केवल काम और जिम्मेदारियों के बोझ तले दबने के बजाय, परिवार के साथ आनंदपूर्वक समय बिताना और खुशियां बांटना भी सीखें। आपकी ईमानदारी, सहनशीलता और नैतिक मूल्य आपको जीवन के उत्तरार्ध में अपार मान-सम्मान, स्थायी संपत्ति और समाज में सर्वोच्च प्रतिष्ठा का अधिकारी बनाएंगे।`,

    `कुंभ लग्न एक स्थिर एवं वायु तत्व की राशि है जिसके स्वामी कर्मठ शनि और नवीनता के कारक राहु हैं। यह लग्न आपको दूरदर्शी सोच, क्रांतिकारी विचार और गहरी मानवतावादी दृष्टि प्रदान करता है। आप समाज की पुरानी रूढ़ियों और संकीर्ण मान्यताओं से ऊपर उठकर एक समतामूलक और प्रगतिशील भविष्य का निर्माण करने की आकांक्षा रखते हैं। शनि और राहु का यह संयोजन आपको वैज्ञानिक सोच, तकनीकी समझ और सामाजिक बदलाव की गहरी अंतर्दृष्टि प्रदान करता है। आपका व्यक्तित्व स्वतंत्र और अनोखा होता है।\n\nमानसिक रूप से आप सभी प्राणियों के कल्याण के प्रति समर्पित रहते हैं, किंतु व्यक्तिगत संबंधों में कभी-कभी आपका अत्यधिक अनासक्त व्यवहार दूसरों को दूरी का अहसास करा सकता है। अपने महान आदर्शों के साथ-साथ अपनों की सूक्ष्म भावनाओं को समझना और स्नेह प्रकट करना आपके पारिवारिक जीवन में मधुरता लाएगा। आपकी बौद्धिक क्षमता और निस्वार्थ समाज सेवा आपको एक युगांतरकारी व्यक्तित्व बना सकती है। आपकी रचनात्मक सोच समाज को एक नई और सुंदर दिशा देने में पूर्णतः समर्थ है।`,

    `मीन लग्न एक द्विस्वभाव एवं जल तत्व की राशि है जिसके स्वामी ज्ञान और मुक्ति के दाता देवगुरु बृहस्पति हैं। यह लग्न आपको असीम करुणा, आध्यात्मिक झुकाव और दिव्य कल्पनाशीलता का वरदान देता है। आपका हृदय सागर की भांति विशाल है, जिसमें प्रत्येक दुखी आत्मा के लिए सांत्वना और प्रेम का स्थान होता है। गुरुदेव की असीम कृपा से आपको ध्यान, योग, संगीत, साहित्य और रहस्यवादी विद्याओं के प्रति स्वाभाविक रुझान प्राप्त होता है। आप भौतिक चकाचौंध की तुलना में आत्मिक शांति को अधिक महत्व देते हैं।\n\nभावनात्मक धरातल पर आप अत्यंत संवेदनशील और दूसरों के दर्दों को अपने भीतर महसूस करने वाले होते हैं; इसलिए कभी-कभी अत्यधिक भावुकता या पलायनवादी सोच से बचकर यथार्थ की भूमि पर टिके रहना आवश्यक है। अपनी दिनचर्या में अनुशासन शामिल करके अपनी इस दिव्य आध्यात्मिक ऊर्जा को यदि आप रचनात्मक दिशा दें, तो आप समाज के लिए एक महान मार्गदर्शक सिद्ध होंगे। आपका निर्मल हृदय और परोपकारी स्वभाव आपको ईश्वर की असीम कृपा और मोक्ष का मार्ग प्रशस्त करेगा।`
  ];

  const moonDescsEn = [
    `With the Moon in Aries, your emotional nature is spirited, courageous, and instinctively proactive, reacting to life's events with swift decisiveness and authentic passion. You find emotional fulfillment in taking the lead, tackling fresh challenges head-on, and maintaining complete personal independence. The fiery energy of Mars influences your emotional core, giving you a dynamic inner drive that dislikes complacency or stagnant routines. When inspiration strikes, your enthusiasm is contagious, propelling you into immediate action and filling you with vitality.\n\nPsychologically, your emotional processing is direct, transparent, and devoid of hidden pretenses, preferring immediate clarity over simmering ambiguities. While your spontaneous instincts protect you from hesitation, learning to pause and breathe during intense emotional moments brings immense stability and peace of mind. You possess a protective loyalty toward your loved ones, defending their honor with fierce devotion. By grounding your quick emotional fire with mindful reflection and patient self-awareness, you cultivate unshakeable inner confidence and resilient emotional serenity.`,

    `With the Moon exalted in Taurus, your emotional foundation is exceptionally grounded, serene, and deeply rooted in steady stability and comfort. You possess a peaceful inner sanctuary that remains unshakeable even amidst external chaos, offering an aura of calming reassurance to everyone around you. Governed by Venus, your emotional well-being is closely tied to domestic harmony, aesthetic beauty, wholesome nourishment, and tangible security. You process feelings with measured patience, building enduring bonds that withstand the test of time.\n\nOn a psychological level, you derive profound happiness from loyalty, consistency, and predictable routines, finding reassurance in trusted relationships and well-ordered surroundings. You are remarkably resilient in the face of adversity, capable of enduring prolonged stress with patient grace and quiet determination. Guarding against a tendency to hold on stubbornly to outdated habits or fear of sudden change will enrich your emotional growth. By embracing life's natural flow while honoring your loyal heart, you cultivate deep contentment, domestic bliss, and lasting peace.`,

    `With the Moon in Gemini, your emotional world is lively, inquisitive, and intimately connected with intellectual curiosity, conversation, and mental stimulation. Ruled by Mercury, your feelings are processed through communication, humor, and active contemplation, making you an expressive soul who needs to articulate thoughts to understand emotions. You thrive in varied social circles and love exploring diverse ideas, reading, writing, and engaging with fascinating people. Your youthful adaptability allows you to bounce back swiftly from disappointment.\n\nPsychologically, your mind is constantly active, processing multiple streams of thoughts simultaneously, which can occasionally create emotional restlessness or nervous tension. Learning to quiet the analytical chatter of the mind through meditation and grounding physical activities restores emotional harmony. You possess an innate charm that defuses interpersonal conflicts effortlessly, bringing levity and lighthearted warmth to those in distress. By anchoring your versatile curiosity in mindful presence, you discover profound emotional depth and intellectual clarity.`,

    `With the Moon in its own domicile of Cancer, your emotional sensitivity, intuition, and capacity for unconditional love reach their fullest, most sacred expression. Your heart is an ocean of empathy, deeply attuned to the unspoken needs and shifting moods of everyone who enters your sphere. You are instinctively nurturing, finding profound joy in creating a secure, warm domestic sanctuary where family and loved ones can flourish in comfort. Your psychic intuition is extraordinarily accurate, guiding your life decisions through profound gut feelings.\n\nOn an emotional and psychological plane, you form deep, sentimental attachments to memories, ancestral heritage, and close relationships, cherishing emotional security above all else. Because your emotional tides ebb and flow with the lunar cycles, learning to establish healthy emotional boundaries prevents you from absorbing the pain and anxieties of others. When you feel genuinely cherished and protected, your creative imagination and compassionate warmth blossom radiantly. Trusting your inner intuition while cultivating emotional self-reliance brings lifelong serenity and emotional fulfillment.`,

    `With the Moon in Leo, your emotional nature is warm-hearted, noble, and infused with radiant generosity, creative flair, and dignified self-respect. Ruled by the Sun, your heart seeks to shine like a beacon of encouragement, uplifting those around you through genuine affection, loyalty, and magnanimous care. You find deep emotional fulfillment in expressing your creative talents, being appreciated for your authentic worth, and creating joyful celebrations for loved ones. You carry yourself with a natural emotional nobility that commands affection.\n\nPsychologically, you possess a vulnerable and tender heart beneath your confident exterior, longing for sincere appreciation, loyalty, and heartfelt validation from those you love. While your pride can be easily wounded by perceived indifference, your capacity to forgive and shower unconditional warmth is truly boundless. Cultivating humility and recognizing your innate inner worth without depending on external applause brings true emotional peace. By leading with your generous heart, you inspire devotion, spread joy, and build enduring, affectionate bonds.`,

    `With the Moon in Virgo, your emotional security is anchored in practical service, organization, cleanliness, and thoughtful attention to the well-being of others. Ruled by Mercury, your feelings are analyzed with clarity and discernment, prompting you to show affection through tangible acts of helpfulness, advice, and problem-solving. You find emotional calm when your daily routine is orderly, your environment is tidy, and your responsibilities are efficiently managed. Your observant mind quickly notices what needs improvement.\n\nPsychologically, you possess a deeply conscientious spirit that strives for excellence, which can occasionally manifest as internal self-criticism or anxiety over minor imperfections. Learning to quiet the inner perfectionist and embracing life's beautiful messiness with gentle self-compassion is vital for your emotional wellness. You are an invaluable confidant and healer whose practical wisdom eases the burdens of loved ones effortlessly. By balancing your keen analytical mind with heart-centered acceptance, you achieve profound emotional tranquility and holistic health.`,

    `With the Moon in Libra, your emotional equilibrium thrives on harmony, aesthetic elegance, mutual fairness, and loving, cooperative partnerships. Governed by Venus, your inner nature is gentle, refined, and deeply uncomfortable with conflict, discord, or emotional harshness. You find peace in balanced relationships where both partners communicate with tact, respect, and emotional parity. Your artistic sensibility appreciates peaceful music, pleasant surroundings, and graceful living that soothe the senses.\n\nPsychologically, your desire to maintain peace can sometimes lead you to suppress your own emotional needs or delay difficult decisions to avoid rocking the boat. Developing the courage to voice your authentic boundaries and trusting your own independent judgment strengthens your emotional resilience immensely. In love, you are an attentive, romantic, and devoted companion who flourishes in mutually supportive unions. By finding emotional harmony within yourself before seeking it in others, you manifest joyful relationships and serene peace of mind.`,

    `With the Moon in Scorpio, your emotional landscape is intensely profound, passionate, and characterized by immense psychological depth and spiritual resilience. While traditionally considered debilitated, this placement transforms raw emotion into extraordinary intuitive power, psychological insight, and unshakeable willpower. You possess a sixth sense for hidden motives, effortlessly seeing beneath facades and connecting with the profound mysteries of existence. You process feelings with immense depth, rarely taking anything lightly.\n\nPsychologically, your emotional world is fiercely private, sharing your deepest feelings only with those who have proven their absolute loyalty and trustworthiness. You possess an incredible capacity to undergo emotional transformation, emerging from personal crises with renewed strength and spiritual wisdom like a phoenix. Learning to release past hurts through forgiveness and surrendering the need for emotional control brings liberating tranquility. By harnessing your emotional intensity for healing and spiritual evolution, you attain mastery over your inner universe.`,

    `With the Moon in Sagittarius, your emotional core is buoyant, optimistic, and fueled by a love for philosophical truth, higher wisdom, and boundless freedom. Ruled by expansive Jupiter, your heart rejects gloomy pessimism, instinctively seeking the silver lining and spiritual meaning behind every life event. You find emotional vitality in wide-open spaces, travel, intellectual exploration, and meaningful philosophical dialogues that expand your horizons. Your joyful, benevolent nature spreads positivity wherever you go.\n\nPsychologically, you require personal independence and freedom of thought to maintain your emotional well-being, feeling suffocated by rigid routines or petty emotional demands. Your candid honesty is refreshingly genuine, though pairing your frankness with gentle empathy ensures your wisdom is received with love. You possess an innate faith in the universe that allows you to overcome setbacks with graceful resilience and humor. By grounding your grand ideals in compassionate daily actions, you cultivate enduring inner peace, joy, and spiritual enlightenment.`,

    `With the Moon in Capricorn, your emotional nature is characterized by serious maturity, pragmatic endurance, and an unshakeable sense of duty and responsibility. Governed by Saturn, you handle emotional crises with stoic composure and practical competence, becoming a rock of dependability for family and colleagues. You find emotional satisfaction in tangible achievements, long-term stability, and fulfilling your obligations with integrity. You respect tradition, honor, and earned respect above fleeting pleasures.\n\nPsychologically, you tend to guard your vulnerabilities behind a reserved, cautious exterior, often carrying heavy emotional burdens in silence rather than asking for help. Learning that expressing tenderness and vulnerability is a profound sign of strength will soften your emotional world and deepen your closest relationships. You are fiercely loyal to those you love, showing your care through steady protection and tireless labor. By allowing yourself moments of playful relaxation and self-compassion, you cultivate deep emotional peace, contentment, and enduring respect.`,

    `With the Moon in Aquarius, your emotional nature is independent, broad-minded, and deeply attuned to humanitarian ideals, friendship, and progressive visions. Co-ruled by Saturn and Rahu, your inner world is unconventional and intellectually oriented, viewing emotional situations with objective fairness and detachment. You find emotional fulfillment in belonging to meaningful communities, fighting for social justice, and connecting with forward-thinking minds. You celebrate individuality and embrace people for who they truly are.\n\nPsychologically, you process feelings through an intellectual framework, sometimes feeling detached from intense personal passions or finding it challenging to navigate messy emotional vulnerability. Learning to connect with the raw warmth of the heart alongside your brilliant intellect creates a harmonious bridge to your loved ones. You are a steadfast, loyal friend who champions the underdog and envisions a better world for all. By honoring your unique emotional rhythm while staying rooted in heartfelt empathy, you find profound peace and purpose.`,

    `With the Moon in Pisces, your emotional essence is boundlessly compassionate, imaginative, and intimately connected to the subtle spiritual rhythms of the cosmos. Governed by benevolent Jupiter, your heart is a sanctuary of unconditional kindness, poetic beauty, and mystical receptivity. You possess an innate psychic empathy that absorbs the emotions of your environment, instinctively offering comfort and solace to those who are suffering. Your artistic and spiritual imagination creates worlds of sublime beauty and inspiration.\n\nPsychologically, your emotional sensitivity is so vast and porous that you require regular periods of quiet solitude, nature immersion, and prayer to cleanse and restore your Prana. Learning to maintain gentle yet firm emotional boundaries prevents you from becoming overwhelmed by the chaotic energies of the material world. When your spiritual ideals are anchored in practical daily routines, your healing and artistic gifts shine with luminous grace. By trusting in divine grace and nurturing your tender soul, you experience transcendent peace, divine love, and spiritual liberation.`
  ];

  const moonDescsKn = [
    `ಮೇಷ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಮನಸ್ಸು ಅತ್ಯಂತ ಚುರುಕು, ಸಾಹಸಪ್ರಿಯ ಮತ್ತು ನವೋತ್ಸಾಹದಿಂದ ಕೂಡಿರುತ್ತದೆ. ಕುಜನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಭಾವನೆಗಳು ತಕ್ಷಣವೇ ವ್ಯಕ್ತವಾಗುತ್ತವೆ; ಯಾವುದೇ ಸವಾಲುಗಳು ಎದುರಾದರೂ ಧೃತಿಗೆಡದೆ ನೇರವಾಗಿ ಮುನ್ನುಗ್ಗಿ ಪರಿಹರಿಸುವ ಅದ್ಭುತ ಧೈರ್ಯ ನಿಮ್ಮಲ್ಲಿರುತ್ತದೆ. ನೀವು ಸ್ವತಂತ್ರವಾಗಿರಲು ಇಷ್ಟಪಡುತ್ತೀರಿ ಮತ್ತು ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಯತ್ನಗಳಿಂದ ಸಾಧನೆ ಮಾಡಿದಾಗ ಅಪಾರವಾದ ಮಾನಸಿಕ ಸಂತೃಪ್ತಿಯನ್ನು ಕಾಣುತ್ತೀರಿ. ನಿಮ್ಮ ಉತ್ಸಾಹಭರಿತ ನಡವಳಿಕೆಯು ಎಲ್ಲರಿಗೂ ಚೈತನ್ಯವನ್ನು ತುಂಬುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಕಪಟವಿಲ್ಲದ ಶುದ್ಧ ಮನಸ್ಸನ್ನು ಹೊಂದಿದ್ದು, ಸತ್ಯವನ್ನು ನೇರವಾಗಿ ನುಡಿಯುವ ಪ್ರಾಮಾಣಿಕತೆ ನಿಮ್ಮದಾಗಿದೆ. ಆದರೆ ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಹಠಾತ್ ಕೋಪ ಅಥವಾ ಅಸಹನೆ ತೋರದೆ, ಶಾಂತಚಿತ್ತದಿಂದ ಆಲೋಚಿಸುವುದನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿಕೊಂಡರೆ ನಿಮ್ಮ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹೆಚ್ಚುತ್ತದೆ. ನಿಮ್ಮ ಪ್ರೀತಿಪಾತ್ರರಿಗೆ ಯಾವುದೇ ಆಪತ್ತು ಬಾರದಂತೆ ರಕ್ಷಿಸುವ ಅದಮ್ಯ ಕಳಕಳಿ ನಿಮ್ಮಲ್ಲಿದೆ. ದೈನಂದಿನ ಪ್ರಾಣಾಯಾಮ ಮತ್ತು ಧ್ಯಾನದ ಮೂಲಕ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಸಮತೋಲನದಲ್ಲಿರಿಸಿಕೊಂಡರೆ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅಚಲ ಶಾಂತಿ ಮತ್ತು ಯಶಸ್ಸು ನೆಲೆಸುತ್ತದೆ.`,

    `ವೃಷಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನು ಉಚ್ಛಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಅಪಾರ ಶಾಂತಿ, ಸ್ಥಿರತೆ ಮತ್ತು ಮಧುರ ಭಾವನೆಗಳಿಂದ ಕೂಡಿರುತ್ತದೆ. ಶುಕ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಆನಂದ, ಸೌಂದರ್ಯ ಮತ್ತು ಪ್ರೀತಿಯನ್ನು ಹುಡುಕುತ್ತದೆ. ಜೀವನದ ಕಷ್ಟಕಾಲದಲ್ಲೂ ಧೃತಿಗೆಡದೆ ತಾಳ್ಮೆಯಿಂದ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿಭಾಯಿಸುವ ಅದ್ಭುತ ಸಹಿಷ್ಣುತೆ ನಿಮ್ಮದಾಗಿದೆ. ನಿಮ್ಮ ಸೌಮ್ಯವಾದ ಮಾತುಗಳು ಮತ್ತು ಪ್ರೀತಿಯ ನಡವಳಿಕೆಯು ಕುಟುಂಬದಲ್ಲಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಎಲ್ಲರಿಗೂ ಸಾಂತ್ವನ ಮತ್ತು ಭರವಸೆಯನ್ನು ನೀಡುತ್ತದೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಸ್ಥಿರವಾದ ಸಂಬಂಧಗಳು ಮತ್ತು ಭದ್ರವಾದ ಜೀವನಶೈಲಿಯಲ್ಲಿ ಅತ್ಯಂತ ನೆಮ್ಮದಿಯನ್ನು ಕಾಣುತ್ತೀರಿ. ಆದರೆ ಕೆಲವೊಮ್ಮೆ ನಿಮ್ಮ ಅತಿಯಾದ ಹಠ ಅಥವಾ ಹೊಸ ಬದಲಾವಣೆಗಳಿಗೆ ಹೊಂದಿಕೊಳ್ಳಲು ಹಿಂಜರಿಯುವ ಪ್ರವೃತ್ತಿಯನ್ನು ಸಡಿಲಿಸುವುದು ನಿಮ್ಮ ಪ್ರಗತಿಗೆ ಒಳ್ಳೆಯದು. ಪ್ರೀತಿಪಾತ್ರರ ಬಗ್ಗೆ ನಿಮ್ಮ ನಿಷ್ಠೆಯು ಅಚಲವಾಗಿದ್ದು, ಅವರನ್ನು ಸಂತೋಷವಾಗಿಡಲು ನೀವು ಸದಾ ಶ್ರಮಿಸುತ್ತೀರಿ. ಕಲೆ, ಸಂಗೀತ ಅಥವಾ ಪ್ರಕೃತಿಯ ಒಡನಾಟದಲ್ಲಿ ಕಾಲ ಕಳೆಯುವುದರಿಂದ ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೆಮ್ಮದಿಯು ಇನ್ನಷ್ಟು ಹೆಚ್ಚಾಗಿ, ಜೀವನವು ಸದಾ ಸೌಭಾಗ್ಯಮಯವಾಗಿರುತ್ತದೆ.`,

    `ಮಿಥುನ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಚುರುಕಾಗಿದ್ದು, ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿಯುವ ಅದಮ್ಯ ಕುತೂಹಲದಿಂದ ಕೂಡಿರುತ್ತದೆ. ಬುಧನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಅತ್ಯಂತ ವೇಗವಾಗಿದ್ದು, ಉತ್ತಮ ಸಂವಹನ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ ಮತ್ತು ಬುದ್ಧಿವಂತಿಕೆಯ ಮೂಲಕ ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಸುಲಭವಾಗಿ ವ್ಯಕ್ತಪಡಿಸುತ್ತೀರಿ. ನೀವು ಜನರೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಬೆರೆಯುತ್ತೀರಿ ಮತ್ತು ಜ್ಞಾನ ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳುವುದರಲ್ಲಿ ಅಪಾರ ಸಂತೋಷವನ್ನು ಕಾಣುತ್ತೀರಿ. ನಿಮ್ಮ ಹೊಂದಿಕೊಳ್ಳುವ ಸ್ವಭಾವವು ಯಾವುದೇ ವಾತಾವರಣದಲ್ಲೂ ನಿಮಗೆ ಗೆಲುವು ತಂದುಕೊಡುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹತ್ತಾರು ಯೋಚನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಸುಳಿದಾಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ಮಾನಸಿಕ ದಣಿವು ಅಥವಾ ಚಂಚಲತೆ ಉಂಟಾಗುವ ಸಾಧ್ಯತೆಯಿರುತ್ತದೆ. ಆಲೋಚನೆಗಳನ್ನು ಒಂದು ನಿರ್ದಿಷ್ಟ ಗುರಿಯತ್ತ ಕೇಂದ್ರೀಕರಿಸಿ, ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತವಾಗಿಡುವುದು ನಿಮ್ಮ ಏಳಿಗೆಗೆ ಅಗತ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ಮಾತುಗಾರಿಕೆ ಮತ್ತು ಸ್ನೇಹಪರತೆಯು ಎಲ್ಲರನ್ನೂ ಆಕರ್ಷಿಸುತ್ತದೆ. ದಿನನಿತ್ಯದ ಜೀವನದಲ್ಲಿ ಸ್ವಲ್ಪ ಸಮಯ ಮೌನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆಗೆ ಮೀಸಲಿಟ್ಟರೆ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಸಮತೋಲನವು ಅತ್ಯಂತ ಸುಂದರವಾಗಿ ವೃದ್ಧಿಸುತ್ತದೆ.`,

    `ಕರ್ಕ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನು ಸ್ವಕ್ಷೇತ್ರದಲ್ಲಿ ನೆಲೆಸಿರುವುದರಿಂದ ನಿಮ್ಮ ಹೃದಯವು ಮಾತೃವಾತ್ಸಲ್ಯ, ಅಪಾರ ಕರುಣೆ ಮತ್ತು ಪವಿತ್ರ ಪ್ರೀತಿಯ ಸಾಗರವಾಗಿರುತ್ತದೆ. ಇತರರ ಭಾವನೆಗಳನ್ನು ಅವರ ಮುಖ ನೋಡಿದ ತಕ್ಷಣವೇ ಅರಿಯುವ ದೈವಿಕ ಅಂತಃಪ್ರಜ್ಞೆ ನಿಮಗಿರುತ್ತದೆ. ನಿಮ್ಮ ಕುಟುಂಬ ಮತ್ತು ಮನೆಯ ಶಾಂತಿಯೇ ನಿಮ್ಮ ಜೀವನದ ಸರ್ವಸ್ವವಾಗಿರುತ್ತದೆ; ಪ್ರೀತಿಪಾತ್ರರ ಸುಖಕ್ಕಾಗಿ ನೀವು ಯಾವುದೇ ತ್ಯಾಗಕ್ಕೂ ಸದಾ ಸಿದ್ಧರಿರುತ್ತೀರಿ. ನಿಮ್ಮ ಮೃದು ಮಾತು ಮತ್ತು ಆಪ್ತ ಕಾಳಜಿಯು ಎಲ್ಲರ ಮನದಲ್ಲೂ ನಿಮಗೆ ಪೂಜ್ಯ ಭಾವನೆಯನ್ನು ತಂದುಕೊಡುತ್ತದೆ.\n\nಮಾನಸಿಕವಾಗಿ ಚಂದ್ರನ ಚಲನೆಯಂತೆ ನಿಮ್ಮ ಭಾವನೆಗಳು ಅತಿ ಸೂಕ್ಷ್ಮವಾಗಿದ್ದು, ಸಣ್ಣ ಅಪಸ್ವರ ಅಥವಾ ನಿರ್ಲಕ್ಷ್ಯವೂ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತೀವ್ರ ನೋವನ್ನುಂಟುಮಾಡಬಹುದು. ಹಳೆಯ ಕಹಿ ನೆನಪುಗಳನ್ನು ಮರೆತು, ಇತರರ ದುಃಖಗಳನ್ನು ಅತಿಯಾಗಿ ತಮ್ಮ ತಲೆಯ ಮೇಲೆ ಹಾಕಿಕೊಳ್ಳದೆ ಮಾನಸಿಕ ರಕ್ಷಾಕವಚವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವುದು ಅಗತ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ಸೃಜನಶೀಲತೆ ಮತ್ತು ಕಲ್ಪನಾಶಕ್ತಿಯು ಅಪಾರವಾಗಿದ್ದು, ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆಯಲ್ಲಿ ನಿಮಗೆ ಪರಮ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ. ದೈವಭಕ್ತಿಯಿಂದ ನಿಮ್ಮ ಜೀವನವು ಸದಾ ಪ್ರೇಮಮಯವಾಗಿರುತ್ತದೆ.`,

    `ಸಿಂಹ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಸ್ವಭಾವವು ಉದಾರ, ರಾಜಗಾಂಭೀರ್ಯ ಮತ್ತು ಅಪ್ರತಿಮ ಸ್ವಾಭಿಮಾನದಿಂದ ಕೂಡಿರುತ್ತದೆ. ಸೂರ್ಯನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಹೃದಯವು ಸದಾ ದೊಡ್ಡದಾಗಿದ್ದು, ಇತರರಿಗೆ ಪ್ರೀತಿಯಿಂದ ಸಹಾಯ ಮಾಡಲು ಮತ್ತು ಎಲ್ಲರನ್ನೂ ಗೌರವದಿಂದ ನಡೆಸಿಕೊಳ್ಳಲು ಇಷ್ಟಪಡುತ್ತೀರಿ. ನೀವು ಎಲ್ಲೇ ಹೋದರೂ ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಪ್ರಕಾಶಮಾನವಾದ ನಗು ಎಲ್ಲರ ಗಮನ ಸೆಳೆಯುತ್ತದೆ. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಪ್ರಯತ್ನಗಳಿಗೆ ಮನ್ನಣೆ ಮತ್ತು ಗೌರವ ಸಿಕ್ಕಾಗ ನಿಮ್ಮ ಮನಸ್ಸು ಸಂತಸದಿಂದ ಅರಳುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಪ್ರೀತಿಪಾತ್ರರಿಂದ ಅಪಾರ ಗೌರವ ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತೀರಿ; ಯಾರಾದರೂ ನಿಮ್ಮನ್ನು ಕಡೆಗಣಿಸಿದರೆ ಅಥವಾ ಅವಮಾನಿಸಿದರೆ ನಿಮ್ಮ ಮನಸ್ಸು ತೀವ್ರವಾಗಿ ನೊಂದರೂ ಅದನ್ನು ಸುಲಭವಾಗಿ ಹೊರಹಾಕುವುದಿಲ್ಲ. ಸ್ವಾಭಿಮಾನದ ಜೊತೆಗೆ ವಿನಯವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಮತ್ತಷ್ಟು ಮೆರುಗು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಸ್ನೇಹಿತರು ಮತ್ತು ಕುಟುಂಬಕ್ಕೆ ನೀವು ಸದಾ ಆಸರೆಯಾಗಿ ನಿಲ್ಲುತ್ತೀರಿ. ನಿಮ್ಮ ಉದಾರ ಹೃದಯದಿಂದ ಎಲ್ಲರನ್ನೂ ಪ್ರೀತಿಸಿ ಹರಸಿದರೆ ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಕೀರ್ತಿಯು ಚಂದ್ರನಂತೆ ಬೆಳಗುತ್ತದೆ.`,

    `ಕನ್ಯಾ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಮನಸ್ಸು ಪ್ರಾಯೋಗಿಕತೆ, ವ್ಯವಸ್ಥಿತ ಚಿಂತನೆ ಮತ್ತು ನಿಸ್ವಾರ್ಥ ಸೇವಾ ಮನೋಭಾವದಿಂದ ಕೂಡಿರುತ್ತದೆ. ಬುಧನ ಅನುಗ್ರಹದಿಂದಾಗಿ ಪ್ರತಿಯೊಂದು ವಿಷಯವನ್ನೂ ಆಳವಾಗಿ ವಿಶ್ಲೇಷಿಸಿ, ಇತರರ ಸಮಸ್ಯೆಗಳಿಗೆ ಸೂಕ್ತ ಪರಿಹಾರ ಸೂಚಿಸುವ ಜಾಣ್ಮೆ ನಿಮ್ಮಲ್ಲಿರುತ್ತದೆ. ನಿಮ್ಮ ಮನೆ, ಕೆಲಸದ ಜಾಗ ಮತ್ತು ದಿನಚರಿಯು ಅತ್ಯಂತ ಶಿಸ್ತುಬದ್ಧವಾಗಿದ್ದಾಗ ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಪರಮ ತೃಪ್ತಿ ಸಿಗುತ್ತದೆ. ನಿಮ್ಮ ಕರುಣೆಯು ಬರೀ ಮಾತಿನಲ್ಲಿರದೆ, ಅಗತ್ಯವಿರುವವರಿಗೆ ಪ್ರಾಯೋಗಿಕವಾಗಿ ಸಹಾಯ ಮಾಡುವ ರೂಪದಲ್ಲಿ ವ್ಯಕ್ತವಾಗುತ್ತದೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಪ್ರತಿಯೊಂದರಲ್ಲೂ ಪರಿಪೂರ್ಣತೆಯನ್ನು ಬಯಸುವುದರಿಂದ, ಸಣ್ಣ ತಪ್ಪುಗಳಿಗೂ ನಿಮ್ಮನ್ನು ನೀವೇ ಅತಿಯಾಗಿ ಟೀಕಿಸಿಕೊಳ್ಳುವ ಅಥವಾ ಆತಂಕಪಡುವ ಪ್ರವೃತ್ತಿ ಇರಬಹುದು. ಎಲ್ಲವೂ ನಮ್ಮ ಇಚ್ಛೆಯಂತೆಯೇ ನಡೆಯಬೇಕೆಂಬ ಹಠವನ್ನು ಬಿಟ್ಟು, ಜೀವನದ ಏರಿಳಿತಗಳನ್ನು ಸಹಜವಾಗಿ ಸ್ವೀಕರಿಸಲು ಕಲಿಯುವುದು ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ವಿವೇಕಯುತ ಸಲಹೆಗಳು ಅನೇಕರ ಬಾಳಿಗೆ ದಾರಿದೀಪವಾಗುತ್ತವೆ. ನಿಯಮಿತ ಧ್ಯಾನ ಮತ್ತು ಸಕಾರಾತ್ಮಕ ಚಿಂತನೆಗಳಿಂದ ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಶಾಂತವಾಗಿರುತ್ತದೆ.`,

    `ತುಲಾ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೆಮ್ಮದಿಗೆ ಶಾಂತಿ, ಸೌಹಾರ್ದತೆ ಮತ್ತು ಸುಂದರವಾದ ಸಂಬಂಧಗಳು ಅತ್ಯಂತ ಅಗತ್ಯವಾಗಿರುತ್ತವೆ. ಶುಕ್ರನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಭಾವನೆಗಳು ಅತ್ಯಂತ ಮೃದುವಾಗಿದ್ದು, ಯಾರೊಂದಿಗೂ ಕಲಹ ಅಥವಾ ಅಸಮಾಧಾನವನ್ನು ನೀವು ಸಹಿಸುವುದಿಲ್ಲ. ಎಲ್ಲರೊಂದಿಗೂ ಪ್ರೀತಿಯಿಂದ ಒಡನಾಡುತ್ತಾ, ನ್ಯಾಯ ಮತ್ತು ಸಮಾನತೆಯನ್ನು ಕಾಪಾಡುವುದು ನಿಮ್ಮ ಜಾಯಮಾನವಾಗಿರುತ್ತದೆ. ಕಲೆ, ಸಂಗೀತ ಮತ್ತು ಪ್ರಶಾಂತ ವಾತಾವರಣವು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ತಕ್ಷಣವೇ ಮುದ ನೀಡುತ್ತದೆ.\n\nಆಂತರಿಕವಾಗಿ ವಿವಾದಗಳನ್ನು ತಪ್ಪಿಸಲು ಹೋಗಿ ನಿಮ್ಮ ಸ್ವಂತ ಭಾವನೆಗಳು ಅಥವಾ ಇಷ್ಟಗಳನ್ನು ಬಲಿಕೊಡುವ ಸಂದರ್ಭಗಳು ಬರಬಹುದು; ನಿಮ್ಮ ಸ್ವಂತ ನಿರ್ಧಾರಗಳ ಮೇಲೆ ಅಚಲ ನಂಬಿಕೆಯಿಟ್ಟು ದೃಢವಾಗಿ ನಿಲ್ಲುವುದನ್ನು ಕಲಿಯುವುದು ಅತಿ ಮುಖ್ಯವಾಗಿದೆ. ಬಾಂಧವ್ಯಗಳಲ್ಲಿ ನೀವು ಅಪಾರ ಪ್ರೀತಿ ಮತ್ತು ನಿಷ್ಠೆಯನ್ನು ನೀಡುತ್ತೀರಿ ಹಾಗೂ ಅಷ್ಟೇ ಪ್ರಾಮಾಣಿಕತೆಯನ್ನು ಎದುರುನೋಡುತ್ತೀರಿ. ಮನಸ್ಸಿನ ತಕ್ಕಡಿಯನ್ನು ಸದಾ ಸಮತೋಲನದಲ್ಲಿಟ್ಟುಕೊಂಡು ಮುನ್ನಡೆದರೆ ನಿಮ್ಮ ಜೀವನವು ಪ್ರೀತಿ ಮತ್ತು ಸುಖ-ಸಂಪತ್ತಿನಿಂದ ಕಂಗೊಳಿಸುತ್ತದೆ.`,

    `ವೃಶ್ಚಿಕ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಭಾವನೆಗಳು ಅತಿ ತೀವ್ರ, ಆಳ ಮತ್ತು ನಿಗೂಢ ಆಧ್ಯಾತ್ಮಿಕ ಶಕ್ತಿಯಿಂದ ಕೂಡಿರುತ್ತವೆ. ಕುಜ ಮತ್ತು ಕೇತುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಮನಸ್ಸು ಯಾವುದೇ ಸವಾಲನ್ನು ಎದುರಿಸುವ ಅಸಾಧಾರಣ ಆಂತರಿಕ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿರುತ್ತದೆ. ಮೇಲ್ನೋಟಕ್ಕೆ ನೀವು ಎಷ್ಟೇ ಶಾಂತರಾಗಿ ಕಂಡರೂ, ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಭಾವನೆಗಳ ಅಗಾಧ ಸಾಗರವೇ ಇರುತ್ತದೆ. ಇತರರ ಗುಪ್ತ ಆಲೋಚನೆಗಳು ಮತ್ತು ಸತ್ಯಾಸತ್ಯತೆಗಳನ್ನು ಗ್ರಹಿಸುವ ಅದ್ಭುತ ಅಂತಃಪ್ರಜ್ಞೆ ನಿಮಗೆ ನೈಸರ್ಗಿಕವಾಗಿಯೇ ಇರುತ್ತದೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಎಲ್ಲರನ್ನೂ ಸುಲಭವಾಗಿ ನಂಬುವುದಿಲ್ಲ, ಆದರೆ ಒಮ್ಮೆ ನಂಬಿದರೆ ಅವರ ಪರವಾಗಿ ಜೀವವನ್ನೇ ತ್ಯಾಗ ಮಾಡುವಷ್ಟು ನಿಷ್ಠಾವಂತರಾಗಿರುತ್ತೀರಿ. ಮನಸ್ಸಿನಲ್ಲಿ ಹಳೆಯ ನೋವು ಅಥವಾ ಮುನಿಸುಗಳನ್ನು ದೀರ್ಘಕಾಲ ಇಟ್ಟುಕೊಳ್ಳದೆ, ಎಲ್ಲವನ್ನೂ ಈಶ್ವರಾರ್ಪಣ ಮಾಡಿ ಕ್ಷಮಿಸುವುದನ್ನು ಕಲಿತರೆ ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ದಿವ್ಯ ಶಾಂತಿ ದೊರೆಯುತ್ತದೆ. ನಿಮ್ಮ ಅಗಾಧ ಸಂಕಲ್ಪ ಶಕ್ತಿಯು ಅಸಾಧ್ಯವಾದುದನ್ನೂ ಸಾಧಿಸಬಲ್ಲದು. ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನಾರ್ಜನೆಯಿಂದ ನಿಮ್ಮ ಭಾವನೆಗಳು ಪವಿತ್ರ ಗಂಗೆಯಂತೆ ಶುದ್ಧವಾಗಿ ಬೆಳಗುತ್ತವೆ.`,

    `ಧನುರ್ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಆಶಾವಾದ, ಧಾರ್ಮಿಕ ನಂಬಿಕೆ ಮತ್ತು ಸತ್ಯದ ಅನ್ವೇಷಣೆಯಲ್ಲಿ ಸಂತೋಷವನ್ನು ಕಾಣುತ್ತದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದಾಗಿ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಅತ್ಯಂತ ಉನ್ನತವಾಗಿದ್ದು, ವಿಶಾಲ ಜಗತ್ತನ್ನು ಪ್ರೀತಿಯಿಂದ ನೋಡುವ ಗುಣ ನಿಮ್ಮದಾಗಿರುತ್ತದೆ. ಹೊಸ ಜ್ಞಾನವನ್ನು ಕಲಿಯುವುದು, ತೀರ್ಥಯಾತ್ರೆಗಳು ಮತ್ತು ಸಜ್ಜನರ ಒಡನಾಟವು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ದಿವ್ಯ ಶಾಂತಿಯನ್ನು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಮುಖದಲ್ಲಿನ ನಗು ಮತ್ತು ಸಕಾರಾತ್ಮಕ ಮಾತುಗಳು ಇತರರ ದುಃಖವನ್ನು ಕರಗಿಸುತ್ತವೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಮಾನಸಿಕ ಹಾಗೂ ವೈಯಕ್ತಿಕ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಅತ್ಯಂತ ಹೆಚ್ಚಾಗಿ ಬಯಸುತ್ತೀರಿ; ಸಂಕುಚಿತ ಆಲೋಚನೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ಉಸಿರುಗಟ್ಟಿಸಿದಂತಾಗಬಹುದು. ನಿಮ್ಮ ನೇರ ಮಾತುಗಳು ಇತರರಿಗೆ ನೋವುಂಟುಮಾಡದಂತೆ ಸೌಮ್ಯತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಒಳಿತು. ಜೀವನದ ಸವಾಲುಗಳನ್ನು ಕೇವಲ ದೈವಿಕ ಪರೀಕ್ಷೆಗಳೆಂದು ಭಾವಿಸಿ ನಗುನಗುತ್ತಾ ಎದುರಿಸುವ ಶಕ್ತಿ ನಿಮಗಿದೆ. ನಿಮ್ಮ ಜ್ಞಾನ ಮತ್ತು ಧರ್ಮನಿಷ್ಠೆಯು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಹಾಗೂ ಸಮಾಜಕ್ಕೆ ಶಾಶ್ವತ ಬೆಳಕನ್ನು ನೀಡುತ್ತದೆ.`,

    `ಮಕರ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಸ್ವಭಾವವು ಗಂಭೀರ, ಪ್ರಬುದ್ಧ ಮತ್ತು ಕರ್ತವ್ಯಪ್ರಜ್ಞೆಯಿಂದ ಕೂಡಿರುತ್ತದೆ. ಶನೀಶ್ವರನ ಪ್ರಭಾವದಿಂದಾಗಿ ನೀವು ಕಷ್ಟ-ಸುಖಗಳನ್ನು ಸಮಚಿತ್ತದಿಂದ ಸ್ವೀಕರಿಸುತ್ತೀರಿ ಮತ್ತು ಯಾವುದೇ ಕಠಿಣ ಪರಿಸ್ಥಿತಿಯಲ್ಲೂ ಜವಾಬ್ದಾರಿಯಿಂದ ಹಿಂದೆ ಸರಿಯುವುದಿಲ್ಲ. ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಆಡಂಬರವಿಲ್ಲದೆ ನಿಯಂತ್ರಣದಲ್ಲಿಟ್ಟುಕೊಳ್ಳುವ ಅಪರೂಪದ ಶಕ್ತಿ ನಿಮಗಿದೆ. ಕುಟುಂಬದ ಹಿರಿಯರಿಗೆ ಗೌರವ ನೀಡುವುದು ಮತ್ತು ಮನೆತನದ ಸಂಪ್ರದಾಯಗಳನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುವುದರಲ್ಲಿ ನಿಮಗೆ ಅಪಾರ ಹೆಮ್ಮೆಯಿರುತ್ತದೆ.\n\nಮಾನಸಿಕವಾಗಿ ನೀವು ನಿಮ್ಮ ನೋವು ಅಥವಾ ಭಾವನೆಗಳನ್ನು ಇತರರ ಮುಂದೆ ಸುಲಭವಾಗಿ ಹಂಚಿಕೊಳ್ಳದೆ ಒಳಗೊಳಗೇ ಕೊರಗುವ ಸಾಧ್ಯತೆಯಿರುತ್ತದೆ; ಪ್ರೀತಿಪಾತ್ರರೊಂದಿಗೆ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ ಹಗುರಾಗುವುದನ್ನು ಕಲಿಯುವುದು ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯಕ್ಕೆ ಹಿತಕರ. ನಿಮ್ಮ ನಿಷ್ಠಾವಂತ ಪರಿಶ್ರಮ ಮತ್ತು ತ್ಯಾಗ ಮನೋಭಾವವು ಎಲ್ಲರಿಗೂ ಮಾದರಿಯಾಗಿದೆ. ಕೆಲಸದ ಜೊತೆಗೆ ವಿಶ್ರಾಂತಿಗೂ ಪ್ರಾಮುಖ್ಯತೆ ನೀಡಿದರೆ ನಿಮ್ಮ ಜೀವನವು ದೀರ್ಘಕಾಲದ ಶಾಂತಿ ಮತ್ತು ಗೌರವದಿಂದ ಶೋಭಿಸುತ್ತದೆ.`,

    `ಕುಂಭ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಮನಸ್ಸು ಸ್ವತಂತ್ರ ಚಿಂತನೆಗಳು, ಆದರ್ಶ ಮೌಲ್ಯಗಳು ಮತ್ತು ಮಾನವೀಯ ಕಳಕಳಿಯಿಂದ ತುಂಬಿರುತ್ತದೆ. ಶನಿ ಮತ್ತು ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದಾಗಿ ನಿಮ್ಮ ಆಲೋಚನೆಗಳು ಸಮಾಜದ ಸಾಮಾನ್ಯ ಕಟ್ಟುಪಾಡುಗಳನ್ನು ಮೀರಿ ನವೀನ ದಾರಿಯಲ್ಲಿ ಸಾಗುತ್ತವೆ. ಎಲ್ಲರನ್ನೂ ಸಮಾನವಾಗಿ ಕಾಣುವ ಮತ್ತು ದೀನದಲಿತರಿಗೆ ನೆರವಾಗುವ ನಿಸ್ವಾರ್ಥ ಭಾವನೆ ನಿಮ್ಮಲ್ಲಿರುತ್ತದೆ. ಉತ್ತಮ ಸ್ನೇಹಿತರ ಒಡನಾಟ ಮತ್ತು ಸಮಾಜ ಸುಧಾರಣೆಯ ಚಟುವಟಿಕೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿಯನ್ನು ನೀಡುತ್ತವೆ.\n\nಆಂತರಿಕವಾಗಿ ನೀವು ಭಾವನೆಗಳನ್ನು ತಾರ್ಕಿಕವಾಗಿ ವಿಶ್ಲೇಷಿಸಲು ಪ್ರಯತ್ನಿಸುವುದರಿಂದ, ಕೆಲವೊಮ್ಮೆ ಸಂಬಂಧಗಳಲ್ಲಿ ಒಂದು ರೀತಿಯ ನಿರ್ಲಿಪ್ತತೆ ಅಥವಾ ಅಂತರ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಬಾಂಧವ್ಯಗಳಲ್ಲಿ ಆಪ್ತತೆ ಮತ್ತು ಪ್ರೀತಿಯನ್ನು ವ್ಯಕ್ತಪಡಿಸುವುದು ನಿಮ್ಮ ಕೌಟುಂಬಿಕ ಬದುಕನ್ನು ಇನ್ನಷ್ಟು ಮಧುರವಾಗಿಸುತ್ತದೆ. ನಿಮ್ಮ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ನವೀನ ಆಲೋಚನೆಗಳು ಸಮಾಜಕ್ಕೆ ದೊಡ್ಡ ಕೊಡುಗೆಯಾಗಬಲ್ಲವು. ದೈವಚಿಂತನೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಮಾನವೀಯ ಗುಣಗಳನ್ನು ಬೆಳೆಸಿಕೊಂಡರೆ ನಿಮ್ಮ ಜೀವನವು ಸಾರ್ಥಕವಾಗುತ್ತದೆ.`,

    `ಮೀನ ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರನಿರುವಾಗ ನಿಮ್ಮ ಹೃದಯವು ಸಾಕ್ಷಾತ್ ಕರುಣೆ, ನಿಸ್ವಾರ್ಥ ಪ್ರೇಮ ಮತ್ತು ಆಳವಾದ ಆಧ್ಯಾತ್ಮಿಕತೆಯ ತಾಣವಾಗಿರುತ್ತದೆ. ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಕೃಪೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಕಲ್ಪನಾಶಕ್ತಿಯು ದೈವಿಕವಾಗಿದ್ದು, ಪ್ರಕೃತಿ, ಸಂಗೀತ ಮತ್ತು ಈಶ್ವರನ ಆರಾಧನೆಯಲ್ಲಿ ನೀವು ಪರಮಾನಂದವನ್ನು ಅನುಭವಿಸುತ್ತೀರಿ. ಇತರರ ಸಂಕಟಗಳನ್ನು ಕಂಡು ನಿಮ್ಮ ಕಣ್ಣುಗಳು ತೇವವಾಗುತ್ತವೆ; ಯಾರಿಗೂ ನೋವು ಮಾಡದ ನಿಮ್ಮ ಮುಗ್ಧ ಸ್ವಭಾವವು ಎಲ್ಲರ ಪ್ರೀತಿಯನ್ನು ಸೆಳೆಯುತ್ತದೆ.\n\nಮಾನಸಿಕ ನೆಲೆಯಲ್ಲಿ ನೀವು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಮನಸ್ಕರಾಗಿದ್ದು, ಲೌಕಿಕ ಜಗತ್ತಿನ ಕಠಿಣ ವಾಸ್ತವಗಳು ಅಥವಾ ಸ್ವಾರ್ಥ ನಡವಳಿಕೆಗಳು ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಬೇಗನೆ ನೋಯಿಸಬಹುದು. ಆಧ್ಯಾತ್ಮಿಕ ಸಾಧನೆ, ಧ್ಯಾನ ಮತ್ತು ಸತ್ಸಂಗಗಳ ಮೂಲಕ ನಿಮ್ಮ ಮನಸ್ಸನ್ನು ಸದಾ ಜಾಗೃತವಾಗಿರಿಸಿಕೊಳ್ಳುವುದು ಅಗತ್ಯವಾಗಿದೆ. ನಿಮ್ಮ ದೈವಭಕ್ತಿ ಮತ್ತು ಶುದ್ಧ ಅಂತಃಕರಣವೇ ನಿಮ್ಮ ನಿಜವಾದ ರಕ್ಷಾಕವಚವಾಗಿದೆ. ಭಗವಂತನ ಮೇಲಿನ ನಿಮ್ಮ ನಂಬಿಕೆಯು ನಿಮ್ಮನ್ನು ಎಲ್ಲಾ ಸಂಕಷ್ಟಗಳಿಂದ ಪಾರುಮಾಡಿ ಶಾಶ್ವತ ಮುಕ್ತಿಯತ್ತ ಮುನ್ನಡೆಸುತ್ತದೆ.`
  ];

  const moonDescsHi = [
    `मेष राशि में चंद्रमा के स्थित होने से आपका मन अत्यंत उत्साही, साहसी और ऊर्जावान बना रहता है। मंगल के प्रभाव से आपकी भावनाएं बहुत तीव्र होती हैं और आप किसी भी कार्य को तुरंत क्रियान्वित करने के लिए तत्पर रहते हैं। आप स्वतंत्र विचारों वाले व्यक्ति हैं और नई चुनौतियों का सामना करने में विशेष आनंद का अनुभव करते हैं। आपकी निडरता और स्पष्टवादिता आपके व्यक्तित्व को सबसे अलग बनाती है।\n\nभावनात्मक स्तर पर आपका हृदय पूरी तरह से निष्कपट और पारदर्शी होता है; आप अपने मन की बात बिना किसी लाग-लपेट के सीधे कह देते हैं। हालांकि, कभी-कभी अत्यधिक उतावलेपन या क्षणिक क्रोध से बचना आपके मानसिक सुकून के लिए बहुत आवश्यक है। अपने प्रियजनों के प्रति आपका स्नेह अत्यंत गहरा और सुरक्षात्मक होता है। नियमित ध्यान और धैर्य के अभ्यास से आपका मानसिक संतुलन सुदृढ़ रहेगा और जीवन में सुख-शांति बनी रहेगी।`,

    `वृषभ राशि में चंद्रमा उच्च का होने के कारण आपका मन अत्यंत शांत, स्थिर और प्रसन्नचित्त रहता है। शुक्र के प्रभाव से आपको सुंदर, सुरुचिपूर्ण और सुव्यवस्थित वातावरण में रहना बहुत पसंद होता है। कठिन से कठिन परिस्थिति में भी आपका धैर्य नहीं डगमगाता और आप बहुत सोच-समझकर निर्णय लेते हैं। आपके मधुर स्वभाव और सहनशीलता के कारण लोग आपके सानिध्य में मानसिक शांति का अनुभव करते हैं।\n\nमानसिक धरातल पर आप पारिवारिक सुरक्षा और स्थायी संबंधों को सर्वोपरि मानते हैं। आप अपनों के प्रति पूर्ण निष्ठावान रहते हैं, किंतु कभी-कभी आपका अत्यधिक हठ आपके व्यक्तिगत विकास में बाधक बन सकता है; अतः परिस्थितियों के अनुसार समझौता करना भी सीखें। कला, संगीत और प्राकृतिक सौंदर्य आपके मन को त्वरित शांति प्रदान करते हैं। आपकी यह भावनात्मक स्थिरता आपके जीवन को सुख, समृद्धि और संतोष से भर देगी।`,

    `मिथुन राशि में चंद्रमा के होने से आपका मन अत्यंत जिज्ञासु, चंचल और नई जानकारियां प्राप्त करने के लिए सदा उत्सुक रहता है। बुध की कृपा से आपकी वाकपटुता, तार्किक बुद्धि और हास्य-विनोद की क्षमता अद्भुत होती है। आप लोगों से बहुत जल्दी घुल-मिल जाते हैं और विचारों के आदान-प्रदान में आपको अत्यधिक मानसिक संतोष मिलता है। आपका मिलनसार स्वभाव सभी को आकर्षित करता है।\n\nआंतरिक रूप से एक ही समय में अनेक विषयों पर विचार करने के कारण कभी-कभी मानसिक थकान या एकाग्रता की कमी महसूस हो सकती है। अपने विचारों को किसी एक लक्ष्य पर केंद्रित करना और आत्म-चिंतन के लिए समय निकालना आपके लिए लाभकारी होगा। रिश्तों में आप बौद्धिक सामंजस्य को अधिक महत्व देते हैं। नियमित प्राणायाम से अपने मन को शांत रखकर आप अपनी प्रतिभा का पूर्ण उपयोग कर सकते हैं।`,

    `कर्क राशि में चंद्रमा स्वग्रही होकर आपके हृदय को असीम ममता, करुणा और संवेदनशीलता से भर देता है। आप दूसरों के आंतरिक दुखों और भावनाओं को बिना कहे ही समझ लेने की ईश्वरीय शक्ति रखते हैं। आपका परिवार, घर और प्रियजन ही आपकी दुनिया होते हैं; उनकी खुशी और सुरक्षा के लिए आप अपना सर्वस्व न्योछावर करने को तैयार रहते हैं। आपका स्नेहपूर्ण व्यवहार सभी के मन को छू लेता है।\n\nभावनात्मक रूप से चंद्रमा की भांति आपके मूड में भी उतार-चढ़ाव आते रहते हैं; अतः पुरानी बातों को याद करके दुखी होना या अत्यधिक भावुकता में बह जाना आपके स्वास्थ्य के लिए ठीक नहीं है। दूसरों के नकारात्मक प्रभावों से स्वयं को सुरक्षित रखने के लिए आत्म-विश्वास का कवच धारण करें। आपकी कल्पनाशीलता और अंतर्दृष्टि आपको रचनात्मक कार्यों में महान सफलता दिलाएगी। ईश्वर भक्ति से आपके मन को असीम शांति प्राप्त होगी।`,

    `सिंह राशि में चंद्रमा के स्थित होने से आपका भावनात्मक स्वभाव उदार, तेजस्वी और स्वाभिमानी बनता है। सूर्य के प्रभाव से आपका हृदय बहुत बड़ा होता है और आप दूसरों की सहायता करने तथा उन्हें सम्मान देने में गर्व महसूस करते हैं। आप जहां भी जाते हैं, आपका आत्मविश्वास और नेतृत्व क्षमता स्वतः ही प्रकट हो जाती है। आपकी नेकदिली और निष्पक्षता आपके प्रति लोगों का विश्वास बढ़ाती है।\n\nआंतरिक रूप से आप अपने प्रियजनों से आदर और सच्ची निष्ठा की अपेक्षा रखते हैं; उपेक्षा या अनादर आपके मन को बहुत गहराई से चोट पहुंचा सकता है। अपने आत्मसम्मान के साथ-साथ दूसरों की भावनाओं का आदर करना आपकी प्रतिष्ठा को और अधिक बढ़ाएगा। आप एक सच्चे और निष्ठावान मित्र सिद्ध होते हैं। अपने उदार हृदय से सभी को प्रेम बांटते हुए आप समाज में आदरणीय स्थान प्राप्त करेंगे।`,

    `कन्या राशि में चंद्रमा के होने से आपका मन अत्यंत व्यावहारिक, विश्लेषणात्मक और सेवाभावी बनता है। बुध के प्रभाव से आप प्रत्येक कार्य को बहुत बारीकी, स्वच्छता और अनुशासन के साथ करने में विश्वास रखते हैं। जब आपकी दिनचर्या व्यवस्थित होती है और आपके सभी दायित्व समय पर पूरे होते हैं, तब आपके मन को गहरी शांति मिलती है। आपकी सहायता हमेशा व्यावहारिक और उपयोगी होती है।\n\nमानसिक स्तर पर हर बात में अत्यधिक पूर्णता की चाह कई बार आपके भीतर व्यर्थ की चिंता या आत्म-आलोचना को जन्म दे सकती है; अतः जीवन की छोटी-मोटी कमियों को सहजता से स्वीकार करना सीखें। आपका समर्पित परिश्रम और निष्कपट स्वभाव आपको समाज में अत्यंत आदरणीय स्थान दिलाएगा। सकारात्मक दृष्टिकोण अपनाने से आपका जीवन अत्यंत सफल और संतुलित रहेगा।`,

    `तुला राशि में चंद्रमा के स्थित होने से आपके मन को शांति, सौहार्द्र और कलात्मक वातावरण की सबसे अधिक आवश्यकता होती है। शुक्र के प्रभाव से आपकी भावनाएं अत्यंत कोमल और शिष्ट होती हैं; किसी भी प्रकार का विवाद या कटुता आपको विचलित कर देती है। आप सदैव संबंधों में संतुलन, परस्पर सम्मान और न्याय की स्थापना का प्रयास करते हैं। आपका सौम्य व्यवहार सभी का दिल जीत लेता है।\n\nआंतरिक रूप से शांति बनाए रखने के प्रयास में कभी-कभी आप अपने स्वयं के सुखों और इच्छाओं का त्याग कर देते हैं; अपने आत्म-सम्मान और निर्णयों के प्रति दृढ़ रहना भी आवश्यक है। प्रेम संबंधों में आप अत्यधिक समर्पित और रोमांटिक साथी सिद्ध होते हैं। अपने मन को संतुलित रखकर और कलात्मक रुचियों को समय देकर आप जीवन में वास्तविक सुख और शांति का अनुभव करेंगे।`,

    `वृश्चिक राशि में चंद्रमा के होने से आपकी भावनाएं अत्यंत गहन, रहस्यमयी और आध्यात्मिक गहराई से युक्त होती हैं। यद्यपि ज्योतिष में इसे नीच का चंद्रमा माना जाता है, किंतु यह आपको असीम आंतरिक शक्ति, तीव्र अंतर्ज्ञान और किसी भी संकट से उबरने का अद्भुत सामर्थ्य प्रदान करता है। आप लोगों के असली इरादों को तुरंत भांप लेते हैं। आपकी भावनात्मक निष्ठा अद्वितीय होती है।\n\nमानसिक धरातल पर आप हर किसी पर सहज विश्वास नहीं करते, किंतु जिस पर भरोसा करते हैं, उसके लिए जान भी दे सकते हैं। मन में पुरानी कड़वाहट या प्रतिशोध की भावना को न रखकर क्षमाशीलता अपनाना आपकी आत्मा को परम शांति देगा। अपनी असीम मानसिक शक्ति को यदि आप ध्यान और अध्यात्म में लगाएं, तो आप जीवन के सर्वोच्च रहस्यों को जानकर परम पद प्राप्त कर सकते हैं।`,

    `धनु राशि में चंद्रमा के स्थित होने से आपका मन सदैव आशावादी, धर्मपरायण और ज्ञान की खोज में लगा रहता है। देवगुरु बृहस्पति के प्रभाव से आपकी सोच बहुत विशाल होती है और आप जीवन की प्रत्येक घटना को एक सकारात्मक दृष्टिकोण से देखते हैं। नई जगहों पर भ्रमण करना, उच्च ज्ञान प्राप्त करना और सत्संग में भाग लेना आपके मन को परम आनंदित करता है। आपका उत्साह संक्रामक होता है।\n\nआंतरिक रूप से आप पूर्ण स्वतंत्रता के पक्षधर होते हैं और संकीर्ण विचारधारा में बंधना आपको कतई रास नहीं आता। आपकी निष्कपट और सच्ची बातें कई बार दूसरों को सीधी लग सकती हैं, इसलिए वाणी में मधुरता बनाए रखें। जीवन की कठिन परिस्थितियों में भी ईश्वर पर आपका विश्वास कभी नहीं डगमगाता। आपका यह आध्यात्मिक ज्ञान और सदाचार आपको समाज में सम्मान और आत्मिक संतोष दिलाएगा।`,

    `मकर राशि में चंद्रमा के होने से आपका भावनात्मक स्वभाव गंभीर, परिपक्व और कर्तव्यनिष्ठ बनता है। शनि के प्रभाव से आप अपने सुख-दुख को सहजता से किसी पर प्रकट नहीं करते और अत्यंत धैर्यपूर्वक अपने उत्तरदायित्वों का निर्वहन करते हैं। संकट के समय आपका शांत चित्त और व्यावहारिक सोच सभी को संबल प्रदान करती है। अपने परिवार और कुल की प्रतिष्ठा आपके लिए सर्वोपरि होती है।\n\nमानसिक स्तर पर अत्यधिक जिम्मेदारियों का बोझ उठाने के कारण कभी-कभी आप भीतर ही भीतर अकेलापन महसूस कर सकते हैं; अपनों के साथ अपनी भावनाएं साझा करना और खुशियां बांटना आपके लिए बहुत आवश्यक है। आपकी निष्ठा और त्याग भावना वंदनीय है। कठोर परिश्रम के साथ-साथ स्वयं के लिए भी समय निकालें, जिससे आपका जीवन शांति और पारिवारिक आनंद से महकता रहे।`,

    `कुम्भ राशि में चंद्रमा के स्थित होने से आपका मन स्वतंत्र विचारों वाला, मानवीय मूल्यों से युक्त और दूरदर्शी बनता है। शनि और राहु के प्रभाव से आपकी सोच पारंपरिक सीमाओं से परे जाकर समाज कल्याण के नूतन मार्गों की तलाश करती है। आप सभी प्राणियों को एक समान दृष्टि से देखते हैं और जरूरतमंदों की सेवा में तत्पर रहते हैं। अच्छे मित्रों का साथ आपको मानसिक संतुष्टि देता है।\n\nआंतरिक रूप से भावनाओं को अत्यधिक तार्किक तराजू पर तौलने के कारण कभी-कभी आप रिश्तों में भावनात्मक रूप से थोड़े विरक्त दिखाई दे सकते हैं। अपनों के प्रति खुलकर प्रेम और स्नेह प्रकट करना आपके पारिवारिक जीवन को और अधिक सुंदर बनाएगा। आपकी अद्वितीय सोच और समाज सेवा की भावना आपको अमर कीर्ति दिला सकती है। ईश्वर के प्रति समर्पण से आपको असीम शांति मिलेगी।`,

    `मीन राशि में चंद्रमा के होने से आपका हृदय असीम करुणा, निस्वार्थ प्रेम और दिव्य कल्पनाशीलता का धाम बनता है। देवगुरु बृहस्पति की कृपा से आपकी आध्यात्मिक अंतर्दृष्टि बहुत प्रबल होती है और आप प्राकृतिक रूप से ईश्वर की उपस्थिति का अनुभव करते हैं। दूसरों के दुखों को देखकर आपका हृदय द्रवित हो उठता है और आप सभी का कल्याण चाहने वाले सच्चे संत हृदय व्यक्ति हैं।\n\nभावनात्मक धरातल पर आप अत्यंत कोमल और संवेदनशील हैं, जिससे संसार की स्वार्थी बातें आपको कभी-कभी दुखी कर सकती हैं। स्वयं को मजबूत बनाए रखने के लिए नियमित ध्यान, एकांत और साधना का आश्रय लें। आपकी सच्ची भक्ति और निर्मल अंतःकरण ही आपकी सबसे बड़ी शक्ति है। ईश्वर पर आपका अटूट विश्वास आपको जीवन के प्रत्येक संकट से पार लगाकर मोक्ष का मार्ग प्रशस्त करेगा।`
  ];

  const lagnaName = getRashiName(lagnaIdx);
  const moonName = getRashiName(moonIdx);

  let profileTitle1 = `Ascendant in ${lagnaName}`;
  let profileDesc1 = lagnaDescsEn[lagnaIdx] ?? "";
  let profileTitle2 = `Moon in ${moonName} (Chandra Rashi)`;
  let profileDesc2 = moonDescsEn[moonIdx] ?? "";

  if (isKn) {
    profileTitle1 = `${lagnaName} ಲಗ್ನ ಪ್ರೊಫೈಲ್`;
    profileDesc1 = lagnaDescsKn[lagnaIdx] ?? "";
    profileTitle2 = `ಚಂದ್ರ ರಾಶಿ ${moonName} ಪ್ರೊಫೈಲ್`;
    profileDesc2 = moonDescsKn[moonIdx] ?? "";
  } else if (isHi) {
    profileTitle1 = `${lagnaName} लग्न विश्लेषण`;
    profileDesc1 = lagnaDescsHi[lagnaIdx] ?? "";
    profileTitle2 = `चंद्र राशि ${moonName} विश्लेषण`;
    profileDesc2 = moonDescsHi[moonIdx] ?? "";
  }

  const cosmicProfile: PersonalReadingSection[] = [
    { title: profileTitle1, description: profileDesc1 },
    { title: profileTitle2, description: profileDesc2 }
  ];

  // --- 2. Today's Transits ---
  const transits = getClockwiseTransits(moonIdx, "lahiri");
  const todaysTransits: PersonalReadingSection[] = [];

  const houseFocusEn: Record<number, string> = {
    1: "your personal identity, physical well-being, and mental clarity",
    2: "finances, savings, speech, and family harmony",
    3: "courage, efforts, communication, and sibling bonds",
    4: "domestic comfort, inner peace, and maternal support",
    5: "creative expression, learning, and future opportunities",
    6: "health, daily routines, and conquering challenges",
    7: "partnerships, relational harmony, and public life",
    8: "deep reflection, unexpected insights, and inner strength",
    9: "fortune, higher knowledge, and spiritual connection",
    10: "career development, status, and professional achievements",
    11: "financial gains, social circles, and fulfilling wishes",
    12: "rest, spiritual release, and managing expenditures"
  };

  const houseFocusKn: Record<number, string> = {
    1: "ನಿಮ್ಮ ಸ್ವಂತ ವ್ಯಕ್ತಿತ್ವ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ದೈಹಿಕ ಶಕ್ತಿ",
    2: "ಕುಟುಂಬದ ಸುಖ, ಧನ ಸಂಗ್ರಹ ಮತ್ತು ಮಧುರ ಸಂವಹನ",
    3: "ನಿಮ್ಮ ಧೈರ್ಯ, ದೃಢ ಪ್ರಯತ್ನಗಳು ಮತ್ತು ಸಂವಹನ ಕಲೆ",
    4: "ಮನೆಯ ನೆಮ್ಮದಿ, ತಾಯಿಯ ಆರೋಗ್ಯ ಮತ್ತು ಮಾನಸಿಕ ಸುಖ",
    5: "ಬುದ್ಧಿಶಕ್ತಿ, ಹೊಸ ಆಲೋಚನೆಗಳು ಮತ್ತು ಸೃಜನಶೀಲತೆ",
    6: "ಆರೋಗ್ಯ ಸುಧಾರಣೆ, ದೈನಂದಿನ ಕೆಲಸಗಳು ಮತ್ತು ಜಯ",
    7: "ಸಂಗಾತಿಯೊಂದಿಗಿನ ಸಂಬಂಧ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಒಡನಾಟ",
    8: "ಆಳವಾದ ಆತ್ಮಾವಲೋಕನ ಮತ್ತು ಅನಿರೀಕ್ಷಿತ ಬದಲಾವಣೆಗಳು",
    9: "ಅದೃಷ್ಟ, ಧಾರ್ಮಿಕ ನಂಬಿಕೆ ಮತ್ತು ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ",
    10: "ಉದ್ಯೋಗದಲ್ಲಿ ಯಶಸ್ಸು, ಗೌರವ ಮತ್ತು ಹೊಸ ಜವಾಬ್ದಾರಿಗಳು",
    11: "ಹಣಕಾಸಿನ ಲಾಭಗಳು, ಆಸೆಗಳ ಈಡೇರಿಕೆ ಮತ್ತು ಸ್ನೇಹಿತರು",
    12: "ಶಾಂತಿಯುತ ನಿದ್ರೆ, ವೆಚ್ಚಗಳ ನಿಯಂತ್ರಣ ಮತ್ತು ಧ್ಯಾನ"
  };

  const houseFocusHi: Record<number, string> = {
    1: "आपके मानसिक स्वास्थ्य, आत्म-विश्वास और शारीरिक ऊर्जा",
    2: "संचित धन, पारिवारिक सद्भाव और वाणी",
    3: "आपके साहस, संचार कौशल और व्यक्तिगत प्रयासों",
    4: "घरेलू सुख-शांति, वाहन और माता के सुख",
    5: "बुद्धि, संतान और नए रचनात्मक विचारों",
    6: "स्वास्थ्य सुधार, ऋण-रोग पर विजय और दिनचर्या",
    7: "वैवाहिक जीवन, साझेदारी और सामाजिक संबंधों",
    8: "गहन चिंतन, आत्म-मंथन और अकस्मात बदलावों",
    9: "भाग्य की उन्नति, उच्च शिक्षा और धार्मिक कार्यों",
    10: "करियर में सफलता, मान-प्रतिष्ठा और आजीविका",
    11: "वित्तीय लाभ, महत्वाकांक्षाओं की पूर्ति और मित्रों",
    12: "मानसिक शांति, विश्राम और खर्चों के नियंत्रण"
  };

  const activeFocusEn: Record<PlanetName, string> = {
    [PN.Sun]: "career success, taking charge, and standing out",
    [PN.Moon]: "emotional balance, reflection, and inner calm",
    [PN.Mars]: "taking decisive action, starting projects, and channeling energy",
    [PN.Mercury]: "learning, writing, sharing ideas, and business planning",
    [PN.Jupiter]: "seeking wisdom, positive growth, and welcoming blessings",
    [PN.Venus]: "nurturing love, art, creative harmony, and comforts",
    [PN.Saturn]: "building discipline, hard work, and patience",
    [PN.Rahu]: "exploring unconventional ideas and material ambition",
    [PN.Ketu]: "meditation, letting go of attachments, and inner truth"
  };

  const activeFocusKn: Record<PlanetName, string> = {
    [PN.Sun]: "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಯಶಸ್ಸು, ನೇತೃತ್ವ ವಹಿಸುವುದು ಮತ್ತು ಗೌರವ",
    [PN.Moon]: "ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಪ್ರೀತಿಪಾತ್ರರ ಕಾಳಜಿ ಮತ್ತು ಶಾಂತಿ",
    [PN.Mars]: "ಧೀರ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವುದು, ಹೊಸ ಕೆಲಸಗಳ ಆರಂಭ ಮತ್ತು ಚೈತನ್ಯ",
    [PN.Mercury]: "ಜ್ಞಾನಾರ್ಜನೆ, ಹೊಸ ಆಲೋಚನೆಗಳ ವಿನಿಮಯ ಮತ್ತು ಚತುರ ಯೋಜನೆ",
    [PN.Jupiter]: "ಜ್ಞಾನದ ವಿಸ್ತರಣೆ, ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು ಮತ್ತು ಸೌಭಾಗ್ಯ",
    [PN.Venus]: "ಸಂಗಾತಿಯ ಒಲವು, ಸೃಜನಶೀಲ ಹವ್ಯಾಸಗಳು ಮತ್ತು ಸುಖ ಜೀವನ",
    [PN.Saturn]: "ತಾಳ್ಮೆ, ಶಿಸ್ತಿನ ನಡವಳಿಕೆ ಮತ್ತು ಸತತ ಪರಿಶ್ರಮ",
    [PN.Rahu]: "ನವೀನ ಸಂಶೋಧನೆಗಳು, ಲೌಕಿಕ ಆಸೆಗಳು ಮತ್ತು ಯಶಸ್ಸು",
    [PN.Ketu]: "ವ್ಯಾಮೋಹಗಳಿಂದ ಮುಕ್ತಿ, ಧ್ಯಾನ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ"
  };

  const activeFocusHi: Record<PlanetName, string> = {
    [PN.Sun]: "कार्यक्षेत्र में सफलता, मान-सम्मान और नेतृत्व क्षमता",
    [PN.Moon]: "मानसिक शांति, भावनात्मक संतुलन और पारिवारिक स्नेह",
    [PN.Mars]: "निर्णायक कदम उठाने, नई योजनाएं शुरू करने और ऊर्जा के सदुपयोग",
    [PN.Mercury]: "ज्ञान, संचार कौशल में सुधार और तार्किक योजनाएं बनाने",
    [PN.Jupiter]: "ज्ञान के विस्तार, धार्मिक विश्वास और जीवन में शुभता",
    [PN.Venus]: "प्रेम संबंधों को मधुर बनाने, सुख-साधनों और कलात्मक कार्यों",
    [PN.Saturn]: "अनुशासन, कड़ी मेहनत और धैर्य से काम लेने",
    [PN.Rahu]: "नई महत्वाकांक्षाओं, लीक से हटकर सोचने और भौतिक प्रगति",
    [PN.Ketu]: "आंतरिक शांति, सांसारिक मोह से मुक्ति और ध्यान"
  };

  // Select key transiting planets to keep layout visually stunning
  const keyTransits = [PN.Sun, PN.Jupiter, PN.Saturn, PN.Mars, PN.Venus];
  for (const pl of keyTransits) {
    const tData = transits[pl];
    if (!tData) continue;

    const pName = getPlanetName(pl);
    const houseNum = tData.house;
    
    let title = `${pName} in your ${houseNum} House`;
    let description = `Currently, transiting ${pName} is moving through your ${houseNum} house (relative to your Moon sign). This influence shines a light on ${houseFocusEn[houseNum]}. You will feel a strong desire to focus on ${activeFocusEn[pl]}.`;

    if (isKn) {
      title = `${pName} ಗ್ರಹದ ಗೋಚಾರ ಫಲ (${houseNum} ನೇ ಭಾವ)`;
      description = `ಪ್ರಸ್ತುತ, ಗೋಚಾರ ${pName} ಗ್ರಹವು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ${houseNum} ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದೆ. ಈ ಪ್ರಭಾವವು ${houseFocusKn[houseNum]} ಮೇಲೆ ಬೆಳಕು ಚೆಲ್ಲುತ್ತದೆ. ಈ ಅವಧಿಯಲ್ಲಿ ${activeFocusKn[pl]} ಕಡೆಗೆ ನಿಮ್ಮ ಗಮನ ಹೆಚ್ಚಾಗಲಿದೆ.`;
    } else if (isHi) {
      title = `गोचर में ${pName} आपके ${houseNum} भाव में`;
      description = `वर्तमान में, गोचर के ${pName} आपकी चंद्र राशि से ${houseNum} भाव में गोचर कर रहे हैं। यह प्रभाव मुख्य रूप से ${houseFocusHi[houseNum]} को प्रभावित करेगा। इस समय आपको ${activeFocusHi[pl]} पर विशेष ध्यान देना चाहिए।`;
    }

    todaysTransits.push({ title, description });
  }

  // --- 3 & 4. Dasha-Bhukthi Timelines ---
  const today = new Date();
  const birthDate = new Date(birth.birthDate);
  const diffTime = Math.max(0, today.getTime() - birthDate.getTime());
  const preciseAge = diffTime / (365.25 * 24 * 60 * 60 * 1000);

  const timeline = generateBhuktiTimeline(kundli);
  let activeIdx = timeline.findIndex(s => preciseAge >= s.startAge && preciseAge < s.endAge);
  if (activeIdx === -1) {
    activeIdx = preciseAge < (timeline[0]?.startAge ?? 0) ? 0 : timeline.length - 1;
  }

  const activeSpan = timeline[activeIdx]!;
  const nextSpan1 = timeline[activeIdx + 1];
  const nextSpan2 = timeline[activeIdx + 2];

  const getDashaLordQualities = (lord: PlanetName): string => {
    if (isKn) return activeFocusKn[lord] || "";
    if (isHi) return activeFocusHi[lord] || "";
    return activeFocusEn[lord] || "";
  };

  // Active Dasha
  const mahaLord = getPlanetName(activeSpan.maha);
  const bhuktiLord = getPlanetName(activeSpan.bhukti);
  const cycle = `${mahaLord} - ${bhuktiLord}`;
  const activeUntilAge = `${activeSpan.endAge.toFixed(1)}`;

  const mahaTheme = getDashaLordQualities(activeSpan.maha);
  const bhuktiTheme = getDashaLordQualities(activeSpan.bhukti);

  let dashaDesc = `You are currently experiencing the major period of ${mahaLord} and sub-period of ${bhuktiLord}. This phase highlights themes of ${mahaTheme} and ${bhuktiTheme}. The main lord sets the long-term tone, while the sub-lord prompts immediate focus, encouraging you to learn and grow in these aspects of life.`;

  if (isKn) {
    dashaDesc = `ನೀವು ಪ್ರಸ್ತುತ ${mahaLord} ಮಹಾದೆಸೆಯಲ್ಲಿ ${bhuktiLord} ಭುಕ್ತಿಯ ಪ್ರಭಾವದಲ್ಲಿದ್ದೀರಿ. ಈ ಹಂತವು ${mahaTheme} ಮತ್ತು ${bhuktiTheme} ಗಳ ಸುಂದರ ಮಿಶ್ರಣವಾಗಿದೆ. ಪ್ರಮುಖ ದೆಸೆಯು ನಿಮ್ಮ ದೀರ್ಘಕಾಲದ ದಾರಿಯನ್ನು ನಿರ್ದೇಶಿಸಿದರೆ, ಈ ಭುಕ್ತಿಯು ತಕ್ಷಣದ ಪ್ರಗತಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.`;
  } else if (isHi) {
    dashaDesc = `आप वर्तमान में ${mahaLord} की महादशा में ${bhuktiLord} की अंतर्दशा के प्रभाव में हैं। यह जीवन चक्र आपके लिए ${mahaTheme} और ${bhuktiTheme} का एक सुंदर मार्ग प्रशस्त करेगा। महादशा का प्रभाव दीर्घकालिक दिशा तय करता है, जबकि अंतर्दशा का प्रभाव वर्तमान में नए अवसर लाता है।`;
  }

  const currentLifeChapter = {
    cycle,
    description: dashaDesc,
    activeUntilAge
  };

  // Next 2 chapters
  let upcomingChapters = {
    chapter1: {
      cycle: "Upcoming Phase",
      ages: "—",
      description: "No further cycles calculated."
    },
    chapter2: {
      cycle: "Upcoming Phase",
      ages: "—",
      description: "No further cycles calculated."
    }
  };

  if (nextSpan1) {
    const nextMaha = getPlanetName(nextSpan1.maha);
    const nextBhukti = getPlanetName(nextSpan1.bhukti);
    const cycle1 = `${nextMaha} - ${nextBhukti}`;
    const ages1 = `Ages ${nextSpan1.startAge.toFixed(1)} to ${nextSpan1.endAge.toFixed(1)}`;
    const theme1 = getDashaLordQualities(nextSpan1.bhukti);

    let desc1 = `Following the current phase, you will transition into the sub-period of ${nextBhukti} (under ${nextMaha} Mahadasha). This chapter will focus on ${theme1}, prompting you to build on your past accomplishments.`;
    if (isKn) {
      desc1 = `ಪ್ರಸ್ತುತ ಹಂತ ಮುಗಿದ ನಂತರ, ನೀವು ${nextMaha} ಮಹಾದೆಸೆಯಲ್ಲಿ ${nextBhukti} ಭುಕ್ತಿಗೆ ಪ್ರವೇಶಿಸುತ್ತೀರಿ. ಈ ಅಧ್ಯಾಯವು ಪ್ರಮುಖವಾಗಿ ${theme1} ಗೆ ಸಂಬಂಧಿಸಿದ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ನಿಮ್ಮನ್ನು ಮುನ್ನಡೆಸುತ್ತದೆ.`;
    } else if (isHi) {
      desc1 = `वर्तमान समय के बाद, आप ${nextMaha} महादशा में ${nextBhukti} भुक्ति में प्रवेश करेंगे। यह समय मुख्य रूप से ${theme1} से जुड़े कार्यों में आपको सफलता प्रदान करेगा।`;
    }

    upcomingChapters.chapter1 = {
      cycle: cycle1,
      ages: ages1,
      description: desc1
    };
  }

  if (nextSpan2) {
    const nextMaha = getPlanetName(nextSpan2.maha);
    const nextBhukti = getPlanetName(nextSpan2.bhukti);
    const cycle2 = `${nextMaha} - ${nextBhukti}`;
    const ages2 = `Ages ${nextSpan2.startAge.toFixed(1)} to ${nextSpan2.endAge.toFixed(1)}`;
    const theme2 = getDashaLordQualities(nextSpan2.bhukti);

    let desc2 = `Next, the sub-period of ${nextBhukti} will activate (under ${nextMaha} Mahadasha). This phase will focus on ${theme2}, inviting you to refine your goals and bring peace into your life.`;
    if (isKn) {
      desc2 = `ತದನಂತರ, ನೀವು ${nextMaha} ಮಹಾದೆಸೆಯಲ್ಲಿ ${nextBhukti} ಭುಕ್ತಿಯ ಪ್ರಭಾವಕ್ಕೆ ಒಳಪಡುತ್ತೀರಿ. ಈ ಅವಧಿಯು ${theme2} ಕಡೆಗೆ ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ವಿಸ್ತರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`;
    } else if (isHi) {
      desc2 = `तत्पश्चात, आप ${nextMaha} महादशा में ${nextBhukti} भुक्ति में प्रवेश करेंगे। यह समय आपके जीवन में ${theme2} के साथ नई सुख-शांति लेकर आएगा।`;
    }

    upcomingChapters.chapter2 = {
      cycle: cycle2,
      ages: ages2,
      description: desc2
    };
  }

  const monthlySummary: PersonalReadingSection[] = [];
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const thisMonthName = today.toLocaleString(lang === "kn" ? "kn-IN" : "en-US", { month: "long" });
  const nextMonthName = nextMonth.toLocaleString(lang === "kn" ? "kn-IN" : "en-US", { month: "long" });

  const thisTransits = getTransitsForDate(moonIdx, today, "lahiri");
  const nextTransits = getTransitsForDate(moonIdx, nextMonth, "lahiri");

  const thisMonthDesc = buildMonthlyPredictionText(kundli, thisTransits, lang);
  const nextMonthDesc = buildMonthlyPredictionText(kundli, nextTransits, lang);

  const thisMonthTitle = isKn 
    ? `${thisMonthName} ${today.getFullYear()} ರ ಫಲ ಮುನ್ಸೂಚನೆ` 
    : `Forecast for ${thisMonthName} ${today.getFullYear()}`;
  const nextMonthTitle = isKn 
    ? `${nextMonthName} ${nextMonth.getFullYear()} ರ ಫಲ ಮುನ್ಸೂಚನೆ` 
    : `Forecast for ${nextMonthName} ${nextMonth.getFullYear()}`;

  monthlySummary.push({ title: thisMonthTitle, description: thisMonthDesc });
  monthlySummary.push({ title: nextMonthTitle, description: nextMonthDesc });

  // --- Progeny (Children) Analysis ---
  let progenyAnalysis = undefined;
  if (preciseAge >= 25) {
    const jupiter = kundli.planets.find(p => p.name === PN.Jupiter);
    const jupiterHouse = jupiter?.house || 1;
    const planetsInFifth = kundli.planets.filter(p => p.house === 5);
    const maleficsInFifth = planetsInFifth.filter(p => [PN.Saturn, PN.Rahu, PN.Ketu, PN.Mars, PN.Sun].includes(p.name));
    
    let delayFactors = 0;
    if ([6, 8, 12].includes(jupiterHouse)) delayFactors++;
    if (jupiter?.rashi.index === 9) delayFactors++; // Jupiter in Capricorn (Debilitated)
    delayFactors += maleficsInFifth.length;

    if (delayFactors > 0) {
      progenyAnalysis = {
        status: "Delays or Still Trying",
        details: `The chart indicates potential delays or ongoing efforts regarding progeny (childbirth) due to the presence of ${maleficsInFifth.length > 0 ? maleficsInFifth.map(p => p.name).join(", ") + " in the 5th house" : "a challenged Jupiter"}. The individual might currently not have a child or is still trying. Evaluate transits for the right timing and recommend specific planetary remedies.`
      };
    } else {
      progenyAnalysis = {
        status: "Smooth Progeny",
        details: "The 5th house and Jupiter are relatively unafflicted, suggesting smooth childbirth and happiness from children when the time is right."
      };
    }
  }

  return {
    cosmicProfile,
    todaysTransits,
    currentLifeChapter,
    upcomingChapters,
    monthlySummary,
    progenyAnalysis
  };
}

/**
 * Translate predictions (pass directly for EN, KN, HI)
 */
export async function translateBaggonaPredictions(
  pred: BaggonaPredictions,
  targetLang: string
): Promise<BaggonaPredictions> {
  if (targetLang === "en" || targetLang === "kn" || targetLang === "hi") {
    return pred;
  }

  const flatStrings: string[] = [];
  const mappings: { type: keyof BaggonaPredictions; index: number; field: keyof BaggonaPredictionSection }[] = [];

  const addSection = (sectionName: keyof BaggonaPredictions, list: BaggonaPredictionSection[]) => {
    list.forEach((sec, idx) => {
      flatStrings.push(sec.title);
      mappings.push({ type: sectionName, index: idx, field: "title" });
      flatStrings.push(sec.description);
      mappings.push({ type: sectionName, index: idx, field: "description" });
      if (sec.whatIsGood) {
        flatStrings.push(sec.whatIsGood);
        mappings.push({ type: sectionName, index: idx, field: "whatIsGood" });
      }
      if (sec.whatIsWrong) {
        flatStrings.push(sec.whatIsWrong);
        mappings.push({ type: sectionName, index: idx, field: "whatIsWrong" });
      }
      if (sec.remedy) {
        flatStrings.push(sec.remedy);
        mappings.push({ type: sectionName, index: idx, field: "remedy" });
      }
    });
  };

  addSection("overview", pred.overview);
  addSection("planets", pred.planets);
  addSection("houses", pred.houses);
  addSection("yogas", pred.yogas);
  addSection("longevity", pred.longevity);
  addSection("doshas", pred.doshas || []);

  const translated = await translateTexts(flatStrings, targetLang);

  const next: BaggonaPredictions = {
    overview: pred.overview.map(x => ({ ...x })),
    planets: pred.planets.map(x => ({ ...x })),
    houses: pred.houses.map(x => ({ ...x })),
    yogas: pred.yogas.map(x => ({ ...x })),
    longevity: pred.longevity.map(x => ({ ...x })),
    doshas: (pred.doshas || []).map(x => ({ ...x }))
  };

  mappings.forEach((map, i) => {
    const list = next[map.type] as BaggonaPredictionSection[];
    const item = list[map.index]!;
    const field = map.field;
    (item as any)[field] = translated[i] ?? item[field];
  });

  return next;
}

/**
 * Translate personal reading (pass directly for EN, KN, HI)
 */
export async function translatePersonalReading(
  reading: PersonalReadingOutput,
  targetLang: string
): Promise<PersonalReadingOutput> {
  if (targetLang === "en" || targetLang === "kn" || targetLang === "hi") {
    return reading;
  }

  const flatStrings: string[] = [];
  const mappings: { path: string }[] = [];

  reading.cosmicProfile.forEach((sec, idx) => {
    flatStrings.push(sec.title);
    mappings.push({ path: `cosmicProfile.${idx}.title` });
    flatStrings.push(sec.description);
    mappings.push({ path: `cosmicProfile.${idx}.description` });
  });

  reading.todaysTransits.forEach((sec, idx) => {
    flatStrings.push(sec.title);
    mappings.push({ path: `todaysTransits.${idx}.title` });
    flatStrings.push(sec.description);
    mappings.push({ path: `todaysTransits.${idx}.description` });
  });

  if (reading.monthlySummary) {
    reading.monthlySummary.forEach((sec, idx) => {
      flatStrings.push(sec.title);
      mappings.push({ path: `monthlySummary.${idx}.title` });
      flatStrings.push(sec.description);
      mappings.push({ path: `monthlySummary.${idx}.description` });
    });
  }

  flatStrings.push(reading.currentLifeChapter.cycle);
  mappings.push({ path: "currentLifeChapter.cycle" });
  flatStrings.push(reading.currentLifeChapter.description);
  mappings.push({ path: "currentLifeChapter.description" });

  flatStrings.push(reading.upcomingChapters.chapter1.cycle);
  mappings.push({ path: "upcomingChapters.chapter1.cycle" });
  flatStrings.push(reading.upcomingChapters.chapter1.description);
  mappings.push({ path: "upcomingChapters.chapter1.description" });

  flatStrings.push(reading.upcomingChapters.chapter2.cycle);
  mappings.push({ path: "upcomingChapters.chapter2.cycle" });
  flatStrings.push(reading.upcomingChapters.chapter2.description);
  mappings.push({ path: "upcomingChapters.chapter2.description" });

  const translated = await translateTexts(flatStrings, targetLang);

  const next: PersonalReadingOutput = JSON.parse(JSON.stringify(reading));

  mappings.forEach((map, i) => {
    const val = translated[i];
    if (val === undefined) return;

    if (map.path.startsWith("cosmicProfile")) {
      const parts = map.path.split(".");
      const idx = Number(parts[1]);
      const field = parts[2] as "title" | "description";
      next.cosmicProfile[idx]![field] = val;
    } else if (map.path.startsWith("todaysTransits")) {
      const parts = map.path.split(".");
      const idx = Number(parts[1]);
      const field = parts[2] as "title" | "description";
      next.todaysTransits[idx]![field] = val;
    } else if (map.path.startsWith("monthlySummary")) {
      const parts = map.path.split(".");
      const idx = Number(parts[1]);
      const field = parts[2] as "title" | "description";
      if (!next.monthlySummary) next.monthlySummary = [];
      if (!next.monthlySummary[idx]) next.monthlySummary[idx] = { title: "", description: "" };
      next.monthlySummary[idx]![field] = val;
    } else if (map.path === "currentLifeChapter.cycle") {
      next.currentLifeChapter.cycle = val;
    } else if (map.path === "currentLifeChapter.description") {
      next.currentLifeChapter.description = val;
    } else if (map.path === "upcomingChapters.chapter1.cycle") {
      next.upcomingChapters.chapter1.cycle = val;
    } else if (map.path === "upcomingChapters.chapter1.description") {
      next.upcomingChapters.chapter1.description = val;
    } else if (map.path === "upcomingChapters.chapter2.cycle") {
      next.upcomingChapters.chapter2.cycle = val;
    } else if (map.path === "upcomingChapters.chapter2.description") {
      next.upcomingChapters.chapter2.description = val;
    }
  });

  return next;
}

export async function calculateGocharaPredictions(
  k: KundliOutput,
  transitKundli: KundliOutput,
  activeDashaLord: PlanetName,
  activeBhuktiLord: PlanetName,
  lang: string = "en"
): Promise<Array<{
  planet: PlanetName;
  title: string;
  status: "positive" | "caution" | "neutral";
  remedy: string;
  probability: number;
}>> {
  const isKn = lang === "kn";
  const isHi = lang === "hi";

  const result: Array<{
    planet: PlanetName;
    title: string;
    status: "positive" | "caution" | "neutral";
    remedy: string;
    probability: number;
  }> = [];

  for (const p of transitKundli.planets) {
    const house = (p.rashi.index - k.moonSign.index + 12) % 12 + 1;
    let title = `${p.name} Transit`;
    let status: "positive" | "caution" | "neutral" = "neutral";
    let remedy = "";

    if (p.name === PN.Saturn) {
      if ([12, 1, 2].includes(house)) {
        status = "caution";
        const phase = house === 12 ? "1st Phase" : house === 1 ? "Peak Phase" : "3rd Phase";
        title = `Saturn Sade Sati (${phase})`;
        remedy = isKn 
          ? "ಪ್ರತಿದಿನ ಶಿವನ ಆರಾಧನೆ ಮಾಡಿ ಮತ್ತು ಶನಿವಾರ ಬಡವರಿಗೆ ದಾನ ನೀಡಿ." 
          : isHi 
            ? "शनिवार को शनि देव के मंदिर में तेल अर्पित करें और हनुमान चालीसा का पाठ करें।" 
            : "Chant Shiva prayers or Hanuman Chalisa and donate to the needy on Saturdays.";
      } else if (house === 8) {
        status = "caution";
        title = "Ashtama Shani Transit";
        remedy = "Perform prayers to Lord Shiva and practice patience.";
      } else if (house === 4) {
        status = "caution";
        title = "Ardha-Ashtama Shani Transit";
        remedy = "Maintain domestic peace and worship Lord Ganesha.";
      } else if ([3, 6, 11].includes(house)) {
        status = "positive";
        title = "Favorable Saturn Transit";
        remedy = "Perform acts of service to sustain positive energy.";
      } else {
        status = "neutral";
        title = "Neutral Saturn Transit";
        remedy = "Stay disciplined and continue regular work.";
      }
    } else if (p.name === PN.Jupiter) {
      const isGood = [2, 5, 7, 9, 11].includes(house);
      status = isGood ? "positive" : "neutral";
      title = isGood ? "Favorable Jupiter Transit" : "Neutral Jupiter Transit";
      remedy = isGood ? "Worship Lord Shiva or Guru" : "Respect elders and teachers";
    } else {
      const isGood = [3, 6, 11].includes(house);
      status = isGood ? "positive" : "neutral";
      title = `${p.name} Transit in House ${house}`;
      remedy = "Perform standard daily prayers";
    }

    let probability = 75;
    if (p.name === activeDashaLord) {
      probability += 15;
    }
    if (p.name === activeBhuktiLord) {
      probability += 10;
    }

    const lagnaIdx = k.lagnaRashi.index;
    const benefics = BENEFIC_LORDS_BY_LAGNA[lagnaIdx] || [];
    const malefics = MALEFIC_LORDS_BY_LAGNA[lagnaIdx] || [];
    if (benefics.includes(p.name)) {
      probability += 5;
    } else if (malefics.includes(p.name)) {
      probability -= 5;
    }

    probability = Math.max(15, Math.min(98, probability));

    result.push({
      planet: p.name,
      title,
      status,
      remedy,
      probability
    });
  }

  return result;
}

export async function getComprehensiveKundaliPrediction(
  k: KundliOutput,
  transitKundli?: KundliOutput,
  lang: string = "en"
): Promise<import("./AstroTypes").KundaliPrediction> {
  const isKn = lang === "kn";
  const lagnaIdx = k.lagnaRashi.index;

  // 1. Lagna Phal
  const rules = LAGNA_RULES[lagnaIdx];
  const lagnaAnalysis = {
    benefics: rules ? (isKn ? [rules.beneficsKn] : [rules.beneficsEn]) : [],
    malefics: rules ? (isKn ? [rules.maleficsKn] : [rules.maleficsEn]) : [],
    description: isKn ? `ನಿಮ್ಮ ಲಗ್ನ ${RASHIS_KN[lagnaIdx]}` : `Your Lagna is ${RASHIS_EN[lagnaIdx]}`
  };

  // 2. Yogas & Doshas
  const yogas: string[] = [];
  const doshas: string[] = [];

  if (rules) {
    yogas.push(isKn ? rules.yogasKn : rules.yogasEn);
  }

  // Kendradhipati Dosha: For Gemini (2) & Virgo (5) -> Jupiter, For Sagittarius (8) & Pisces (11) -> Mercury
  if ((lagnaIdx === 2 || lagnaIdx === 5) && k.planets.some(p => p.name === PN.Jupiter && [1, 4, 7, 10].includes(p.house))) {
    doshas.push(isKn ? "ಗುರುವಿಗೆ ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷವಿದೆ." : "Jupiter suffers from Kendradhipati Dosha.");
  }
  if ((lagnaIdx === 8 || lagnaIdx === 11) && k.planets.some(p => p.name === PN.Mercury && [1, 4, 7, 10].includes(p.house))) {
    doshas.push(isKn ? "ಬುಧನಿಗೆ ಕೇಂದ್ರಾಧಿಪತ್ಯ ದೋಷವಿದೆ." : "Mercury suffers from Kendradhipati Dosha.");
  }

  // Sade Sati & Chandrashtama
  if (transitKundli) {
    const saturnTransit = transitKundli.planets.find(p => p.name === PN.Saturn);
    if (saturnTransit) {
      const saturnHouseFromMoon = (saturnTransit.rashi.index - k.moonSign.index + 12) % 12 + 1;
      if ([12, 1, 2].includes(saturnHouseFromMoon)) {
        doshas.push(isKn ? "ಏಳರೆ ಶನಿ (ಸಾಡೇ ಸಾತಿ) ನಡೆಯುತ್ತಿದೆ." : "Sade Sati (7.5 years of Saturn) is active.");
      }
    }
    const moonTransit = transitKundli.planets.find(p => p.name === PN.Moon);
    if (moonTransit) {
      const moonHouseFromMoon = (moonTransit.rashi.index - k.moonSign.index + 12) % 12 + 1;
      if (moonHouseFromMoon === 8) {
        doshas.push(isKn ? "ಚಂದ್ರಾಷ್ಟಮ ದೋಷವಿದೆ (ಎಚ್ಚರಿಕೆ ವಹಿಸಿ)." : "Chandrashtama Dosha active (transit Moon in 8th from natal Moon).");
      }
    }
  }

  // 3. Career & Saturn
  const saturn = k.planets.find(p => p.name === PN.Saturn);
  let careerSaturn = "";
  if (saturn) {
    const saturnRashi = saturn.rashi.index;
    if ([1, 6].includes(saturnRashi)) careerSaturn = isKn ? "ಆರ್ಥಿಕ ಅಥವಾ ಆಹಾರ ಉದ್ಯಮದಲ್ಲಿ ಯಶಸ್ಸು." : "Success in finance or food industry.";
    else if ([2, 5].includes(saturnRashi)) careerSaturn = isKn ? "ಬರವಣಿಗೆ, ಲೆಕ್ಕಪತ್ರ ಅಥವಾ ಶಿಕ್ಷಣದಲ್ಲಿ ಯಶಸ್ಸು." : "Success in writing, accounting, or education.";
    else careerSaturn = isKn ? "ಶನಿಯ ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ ವೃತ್ತಿ (ಸಾಧಾರಣ ಫಲ)." : "Career path influenced by Saturn's sign.";
  }

  // 4. Saturn Conjunctions
  const saturnConjunctions: string[] = [];
  if (saturn) {
    const conjunctPlanets = k.planets.filter(p => p.name !== PN.Saturn && p.house === saturn.house);
    for (const cp of conjunctPlanets) {
      if (cp.name === PN.Sun) saturnConjunctions.push(isKn ? "ಶನಿ-ರವಿ ಯುತಿ: ತಂದೆಯೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ." : "Saturn-Sun conjunction: Conflicts with authority or father.");
      if (cp.name === PN.Moon) saturnConjunctions.push(isKn ? "ಶನಿ-ಚಂದ್ರ ಯುತಿ (ಪುನರ್ಫೂ ದೋಷ): ಮಾನಸಿಕ ಒತ್ತಡ." : "Saturn-Moon conjunction (Punaphoo Dosha): Mental stress.");
      if (cp.name === PN.Mercury) saturnConjunctions.push(isKn ? "ಶನಿ-ಬುಧ ಯುತಿ: ತಾಂತ್ರಿಕ ಅಥವಾ ಲೆಕ್ಕಪತ್ರ ವೃತ್ತಿ." : "Saturn-Mercury conjunction: Technical or accounting profession.");
      if (cp.name === PN.Rahu) saturnConjunctions.push(isKn ? "ಶನಿ-ರಾಹು ಯುತಿ (ಶಾಪಿತ ದೋಷ): ಅಡೆತಡೆಗಳು." : "Saturn-Rahu conjunction (Shrapit Dosha): Obstacles.");
      if (cp.name === PN.Ketu) saturnConjunctions.push(isKn ? "ಶನಿ-ಕೇತು ಯುತಿ: ವೈರಾಗ್ಯ ಅಥವಾ ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು." : "Saturn-Ketu conjunction: Detachment or spiritual inclination.");
    }
  }

  // 5. Saturn Aspects & Vipareeta Shani
  const saturnAspects: string[] = [];
  let vipareetaShani: string | null = null;
  if (saturn) {
    const aspect3 = (saturn.house + 2) % 12 || 12;
    const aspect7 = (saturn.house + 6) % 12 || 12;
    const aspect10 = (saturn.house + 9) % 12 || 12;
    saturnAspects.push(isKn ? `${aspect3}ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ (ವಿಳಂಬ).` : `Aspect on ${aspect3}th house (delays).`);
    saturnAspects.push(isKn ? `${aspect7}ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ (ವಿಳಂಬ).` : `Aspect on ${aspect7}th house (delays).`);
    saturnAspects.push(isKn ? `${aspect10}ನೇ ಮನೆಗೆ ದೃಷ್ಟಿ (ವಿಳಂಬ).` : `Aspect on ${aspect10}th house (delays).`);

    if ([2, 4, 5, 7, 9, 10].includes(saturn.house)) {
      vipareetaShani = isKn ? "ವಿಪರೀತ ಶನಿ: ಆರಂಭದಲ್ಲಿ ಕಷ್ಟ, ನಂತರ ಅದ್ಭುತ ಯಶಸ್ಸು." : "Vipareeta Shani: Initial struggles followed by great success.";
    }
  }

  // 6. Health (Roga Vichara)
  const healthVichara: string[] = [];
  for (const p of k.planets) {
    if ([6, 8, 12].includes(p.house)) {
      const disease = isKn ? PLANET_DISEASES_KN[p.name] : PLANET_DISEASES_EN[p.name];
      if (disease) healthVichara.push(`${isKn ? PLANETS_KN[p.name] : PLANETS_EN[p.name]}: ${disease}`);
    }
  }

  // 7. Gochara Alerts
  const gocharaAlerts: string[] = [];
  if (transitKundli) {
    for (const pName of [PN.Saturn, PN.Sun, PN.Mars, PN.Jupiter]) {
      const tp = transitKundli.planets.find(p => p.name === pName);
      if (tp) {
        const houseFromMoon = (tp.rashi.index - k.moonSign.index + 12) % 12 + 1;
        if ([1, 8, 12].includes(houseFromMoon)) {
          gocharaAlerts.push(isKn 
            ? `${PLANETS_KN[pName]} ಗೋಚಾರದಲ್ಲಿ ಚಂದ್ರನಿಂದ ${houseFromMoon}ನೇ ಮನೆಯಲ್ಲಿದೆ (ಎಚ್ಚರಿಕೆ).` 
            : `Transit ${PLANETS_EN[pName]} is in ${houseFromMoon}th from Moon (caution).`);
        }
      }
    }
  }

  return {
    lagnaAnalysis,
    yogasAndDoshas: { yogas, doshas },
    careerSaturn,
    saturnConjunctions,
    saturnAspects,
    vipareetaShani,
    healthVichara,
    gocharaAlerts
  };
}
