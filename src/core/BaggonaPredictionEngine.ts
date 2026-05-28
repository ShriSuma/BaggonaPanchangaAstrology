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
  3: [PN.Jupiter, PN.Mars], // Cancer (Kataka)
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
  "ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕಟಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನುಸ್ಸು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"
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
  [PN.Sun]: "ಸೂರ್ಯ",
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
    beneficsEn: "Jupiter and Sun are benefic.",
    beneficsKn: "ಗುರು ಮತ್ತು ರವಿ ಅತ್ಯಂತ ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತಾರೆ.",
    maleficsEn: "Venus, Saturn, and Mercury are malefic. Saturn and Moon association can yield inauspicious results.",
    maleficsKn: "ಶುಕ್ರ, ಶನಿ ಮತ್ತು ಬುಧ ಅಶುಭರು. ಶನಿ ಮತ್ತು ಚಂದ್ರನ ಸಂಬಂಧವು ಅಶುಭ ಫಲ ನೀಡಬಹುದು.",
    yogasEn: "Jupiter and Sun conjunction creates strong professional growth.",
    yogasKn: "ಗುರು ಮತ್ತು ರವಿಯ ಯುತಿಯು ಆಡಳಿತ ಹಾಗೂ ಉನ್ನತ ಅಧಿಕಾರ ನೀಡುತ್ತದೆ."
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
        ? "\n\n[ಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ]: ಮೇಷ ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿಯಾದ ಮಂಗಳನೇ ಅಷ್ಟಮಕ್ಕೂ ಅಧಿಪತಿಯಾಗುವುದರಿಂದ, ಇಲ್ಲಿ ಮಂಗಳನಿಗೆ ಅಷ್ಟಮಾದಿಪತ್ಯದ ದೋಷವು ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಮಂಗಳನು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತಾನೆ ಮತ್ತು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತಾನೆ."
        : "\n\n[Ashtamadhipatya Rule]: For Aries Lagna, the Lagna Lord Mars is also the 8th Lord. Therefore, Mars does not suffer from Ashtamadhipatya dosha; it protects you and yields auspicious results.";
    } else if (lagnaIdx === 6 && planet === PN.Venus) {
      text += isKn
        ? "\n\n[ಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ]: ತುಲಾ ಲಗ್ನಕ್ಕೆ ಲಗ್ನಾಧಿಪತಿಯಾದ ಶುಕ್ರನೇ ಅಷ್ಟಮಕ್ಕೂ ಅಧಿಪತಿಯಾಗುವುದರಿಂದ, ಇಲ್ಲಿ ಶುಕ್ರನಿಗೆ ಅಷ್ಟಮಾದಿಪತ್ಯದ ದೋಷವು ಅನ್ವಯಿಸುವುದಿಲ್ಲ. ಶುಕ್ರನು ನಿಮ್ಮನ್ನು ರಕ್ಷಿಸುತ್ತಾನೆ ಮತ್ತು ಶುಭ ಫಲಗಳನ್ನು ನೀಡುತ್ತಾನೆ."
        : "\n\n[Ashtamadhipatya Rule]: For Libra Lagna, the Lagna Lord Venus is also the 8th Lord. Therefore, Venus does not suffer from Ashtamadhipatya dosha; it protects you and yields auspicious results.";
    } else if (planet === PN.Sun || planet === PN.Moon) {
      text += isKn
        ? "\n\n[ಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ]: ಶಾಸ್ತ್ರದ ನಿಯಮದಂತೆ ಸೂರ್ಯ ಮತ್ತು ಚಂದ್ರ ಗ್ರಹಗಳಿಗೆ ಅಷ್ಟಮ ಸ್ಥಾನದ ಅಧಿಪತ್ಯದ ದೋಷವಿರುವುದಿಲ್ಲ."
        : "\n\n[Ashtamadhipatya Rule]: As per astrological texts, the Sun and Moon are completely exempt from Ashtamadhipatya dosha.";
    } else {
      text += isKn
        ? "\n\n[ಅಷ್ಟಮಾದಿಪತ್ಯ ವಿಚಾರ]: ಈ ಗ್ರಹವು ೮ನೇ ಮನೆಯ ಅಧಿಪತಿಯಾಗಿರುವುದರಿಂದ ಸಾಧಾರಣವಾಗಿ ಫಲನಿರ್ಣಯದಲ್ಲಿ ಅಶುಭ ನೀಡುವ ಪ್ರವೃತ್ತಿ ಹೊಂದಿರುತ್ತದೆ. ಇದು ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆಗಳು ಅಥವಾ ಆಯುಷ್ಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಿಚಾರಗಳಲ್ಲಿ ತಾಳ್ಮೆಯನ್ನು ಬಯಸುತ್ತದೆ."
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

/**
 * Generate predictions based on the Traditional Baggona PDF Rules
 */
export function generateBaggonaPredictions(
  kundli: KundliOutput,
  panchanga: TraditionalBaggonaPanchanga,
  lang: string = "en"
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
        description = `${pName} ಗ್ರಹವು ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${rName} ರಾಶಿಯಲ್ಲಿ ಉಚ್ಛ (ಬಲಶಾಲಿ) ಸ್ಥಾನದಲ್ಲಿದೆ. ಇದು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಈ ಗ್ರಹಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಅತ್ಯಂತ ಸಕಾರಾತ್ಮಕ ಗುಣಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಈ ಗ್ರಹವು ${caste} ವರ್ಣವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ ಮತ್ತು ${gender} ತತ್ವದ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ. ಸೂರ್ಯನ ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸಲು ಹಾಗೂ ಜೀವನದ ಶುಭಫಲಗಳಿಗಾಗಿ ${temple} ಭಕ್ತಿಯಿಂದ ಆರಾಧಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರವಾಗಿದೆ. ಈ ಸ್ಥಾನವು ನಿಮ್ಮಲ್ಲಿ ${appearance} ಗುಣಗಳನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.`;
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
          conjKn += "ಶನಿಯು ಸೂರ್ಯನೊಂದಿಗೆ ಯುತಿಯಾಗಿದ್ದು, ಆರೋಗ್ಯದ ಏರುಪೇರು ಅಥವಾ ಅಧಿಕಾರಿಗಳಿಂದ ಸವಾಲುಗಳನ್ನು ಸೂಚಿಸುತ್ತದೆ. ";
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
        "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಸೂರ್ಯನಿಗೆ ತರ್ಪಣ ನೀಡಿ ಅಥವಾ ಶಿವನಿಗೆ ಜಲಾಭಿಷೇಕ ಮಾಡಿ.",
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
        analysisText = `ಇದು ಅತ್ಯಂತ ಬಲಶಾಲಿ ಭಾವವಾಗಿದ್ದು, ಜಾತಕದ ಈ ಭಾಗಕ್ಕೆ ಹೆಚ್ಚಿನ ಶುಭ ಫಲಗಳನ್ನು ತರುತ್ತದೆ. ನಿಮಗೆ ${sigs} ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಯಶಸ್ಸು, ಸಂಪತ್ತು ಮತ್ತು ಸಂತೋಷ ಸಿಗಲಿದೆ.`;
      } else if (status === "caution") {
        analysisText = `ಈ ಭಾವವು ಸವಾಲುಗಳು ಮತ್ತು ಶ್ರಮವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ${sigs} ವಿಷಯಗಳಲ್ಲಿ ಅಡೆತಡೆಗಳು, ಖರ್ಚುಗಳು ಅಥವಾ ಕಳವಳಗಳು ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು. ಪರಿಹಾರಕ್ಕಾಗಿ ಸೂಕ್ತ ದೈವಾರಾಧನೆ ಮತ್ತು ತಾಳ್ಮೆ ಅತ್ಯಗತ್ಯ.`;
      } else {
        analysisText = `ಈ ಭಾವವು ಮಧ್ಯಮ ಹಾಗೂ ಸಮತೋಲಿತವಾಗಿದೆ. ${sigs} ವಿಷಯಗಳು ನಿಮ್ಮ ಸ್ವಂತ ಪ್ರಯತ್ನದಿಂದ ಹಂತಹಂತವಾಗಿ ಸುಧಾರಿಸುತ್ತವೆ. ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ನಿಯಮಿತ ದಿನಚರಿ ಸಕಾರಾತ್ಮಕತೆಯನ್ನು ತರುತ್ತದೆ.`;
      }
      description = `ಭಾವ ವಿವರಣೆ: ಈ ಭಾವವು ${sigs} ಸೂಚಿಸುತ್ತದೆ. ${lordText}${occupantText}${analysisText}`;
    } else if (isHi) {
      title = BHAVA_NAMES_HI[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_HI[h - 1]!;
      let lordText = `इस भाव के स्वामी ${lordName} हैं, जो आपकी कुंडली के ${lordHouse}वें भाव (${lordRashiName} राशि) में स्थित हैं। `;
      let occupantText = occupants.length > 0
        ? `इस भाव में ${occupantsStr} विराजमान हैं। `
        : `यह भाव वर्तमान में रिक्त है। `;
      let analysisText = "";
      if (status === "positive") {
        analysisText = `यह अत्यंत शुभ और मजबूत भाव है। आपको ${sigs} के क्षेत्रों में सफलता, धन और अनुकूल परिणाम प्राप्त होंगे।`;
      } else if (status === "caution") {
        analysisText = `यह भाव कुछ चुनौतियों को दर्शाता है। ${sigs} से संबंधित मामलों में संघर्ष, व्यय या विलंब देखने को मिल सकता है।`;
      } else {
        analysisText = `यह भाव सामान्य और संतुलित है। ${sigs} के मामले आपके व्यक्तिगत प्रयासों से धीरे-धीरे सुधरेंगे।`;
      }
      description = `भाव फल: यह भाव ${sigs} को दर्शाता है। ${lordText}${occupantText}${analysisText}`;
    } else {
      title = BHAVA_NAMES_EN[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_EN[h - 1]!;
      let lordText = `The lord of this house is ${lordName}, placed in House ${lordHouse} (${lordRashiName} Rashi). `;
      let occupantText = occupants.length > 0
        ? `It is occupied by ${occupantsStr}. `
        : `It is unoccupied. `;
      let analysisText = "";
      if (status === "positive") {
        analysisText = `This indicates a very strong and auspicious house. You will experience significant ease, progress, and success in matters related to ${sigs.toLowerCase()}.`;
      } else if (status === "caution") {
        analysisText = `This indicates a challenging or afflicted house. You may face obstacles, delayed results, or friction in matters related to ${sigs.toLowerCase()}. Guard against rash decisions and practice patience.`;
      } else {
        analysisText = `This house has average, balanced strength. Matters of ${sigs.toLowerCase()} will progress steadily based on your personal effort and continuous application.`;
      }
      description = `Signification: This house governs ${sigs}. ${lordText}${occupantText}${analysisText}`;
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
          description += " ಶನಿಯು ಈ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿದ್ದು, ಶಿಸ್ತು ಮತ್ತು ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆಯನ್ನು ನೀಡುತ್ತಾನೆ (Saturn is posited).";
        } else if (isHi) {
          description += " शनि इस भाव में स्थित हैं, जो अनुशासन और जिम्मेदारी लाते हैं (Saturn is posited)।";
        } else {
          description += " Saturn is posited in this house, bringing discipline and structural delays.";
        }
      } else if (h === h3) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೩ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ (Saturn casts its 3rd aspect).";
        } else if (isHi) {
          description += " शनि की ३वीं दृष्टि इस भाव पर पड़ रही है (Saturn casts its 3rd aspect)।";
        } else {
          description += " Saturn casts its 3rd aspect on this house, demanding extra efforts.";
        }
      } else if (h === h7) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೭ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ (Saturn casts its 7th aspect).";
        } else if (isHi) {
          description += " शनि की ७वीं दृष्टि इस भाव पर पड़ रही है (Saturn casts its 7th aspect)।";
        } else {
          description += " Saturn casts its 7th aspect on this house, requiring patience.";
        }
      } else if (h === h10) {
        if (isKn) {
          description += " ಶನಿಯು ಈ ಭಾವದ ಮೇಲೆ ತನ್ನ ೧೦ನೇ ದೃಷ್ಟಿಯನ್ನು ಬೀರಿದ್ದಾನೆ (Saturn casts its 10th aspect).";
        } else if (isHi) {
          description += " शनि की १०वीं दृष्टि इस भाव पर पड़ रही है (Saturn casts its 10th aspect)।";
        } else {
          description += " Saturn casts its 10th aspect on this house, indicating duty and focus.";
        }
      }
    }

    const karakas = HOUSE_KARAKAS[h] || [];
    const karakaNames = karakas.map(k => getPlanetName(k)).join(", ");
    if (isKn) {
      description += `\n\n[ಭಾವ ಕಾರಕತ್ವ (Significators)]: ಈ ಭಾವಕ್ಕೆ ಕಾರಕ ಗ್ರಹಗಳು: ${karakaNames}.`;
    } else if (isHi) {
      description += `\n\n[भाव कारकत्व (Significators)]: इस भाव के कारक ग्रह हैं: ${karakaNames}।`;
    } else {
      description += `\n\n[House Karakas (Significators)]: Significator planets for this house: ${karakaNames}.`;
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
          ? "ಅಪಜಯ ಮತ್ತು ಮಾನಸಿಕ-ದೈಹಿಕ ಒತ್ತಡ (Sade Sati/Ashtama Shani)" 
          : "setbacks and physical-mental stress (Sade Sati/Ashtama Shani)";
      } else if (pl === PN.Sun) {
        impact = isKn ? "ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಮತ್ತು ಕೀರ್ತಿ ನಷ್ಟ" : "friction with authorities and loss of reputation";
      } else if (pl === PN.Mars) {
        impact = isKn ? "ವಾದ-ವಿವಾದಗಳು, ಆಕಸ್ಮಿಕ ನಷ್ಟ ಮತ್ತು ದೈಹಿಕ ತೊಂದರೆಗಳು" : "disputes, sudden losses, and physical discomforts";
      } else if (pl === PN.Jupiter) {
        impact = isKn ? "ಜ್ಞಾನನಾಶ, ನಿರ್ಧಾರಗಳಲ್ಲಿ ಗೊಂದಲ ಮತ್ತು ಧನಹಾನಿ" : "temporary confusion, bad decisions, and wealth delays";
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
        goodImpact = isKn ? "ದೈವಿಕ ಆಶೀರ್ವಾದ, ಧನಯೋಗ ಮತ್ತು ಶುಭ ಕಾರ್ಯಗಳು" : "divine blessings, wealth inflow, and auspicious events";
      } else if (pl === PN.Sun && [3, 6, 10, 11].includes(tHouse)) {
        goodImpact = isKn ? "ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಉನ್ನತಿ ಮತ್ತು ಸಮಾಜದಲ್ಲಿ ಮನ್ನಣೆ" : "career growth and social recognition";
      } else if (pl === PN.Mars && [3, 6, 11].includes(tHouse)) {
        goodImpact = isKn ? "ಧೈರ್ಯ, ಸಾಹಸಗಳು ಮತ್ತು ಶತ್ರುಗಳ ಮೇಲೆ ವಿಜಯ" : "courage, dynamic action, and victory over obstacles";
      } else if (pl === PN.Saturn && [3, 6, 11].includes(tHouse)) {
        goodImpact = isKn ? "ದೀರ್ಘಕಾಲದ ಯಶಸ್ಸು, ಶಿಸ್ತು ಮತ್ತು ಆರ್ಥಿಕ ಪ್ರಗತಿ" : "long-term success, discipline, and steady financial growth";
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
    text += `【ಜನ್ಮ ಕುಂಡಲಿ ಮತ್ತು ಗೋಚಾರ ಸಮನ್ವಯ】\n${natalContext}\n\n`;
    if (supportives.length > 0) {
      text += `【ಶುಭ ಗೋಚಾರ ಪ್ರಭಾವಗಳು】:\n` + supportives.map(s => `• ${s}`).join("\n") + `\n\n`;
    }
    if (challenges.length > 0) {
      text += `【ಸವಾಲುಗಳು ಮತ್ತು ಗೋಚಾರ ದೋಷಗಳು】:\n` + challenges.map(c => `• ${c}`).join("\n") + `\n\n`;
      text += `【ಪರಿಹಾರಗಳು】: ಶನಿ ಮತ್ತು ಇತರ ದೋಷಗಳ ನಿವಾರಣೆಗೆ ಶಿವ ದರ್ಶನ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮತ್ತು ಬಡವರಿಗೆ ಆಹಾರ ದಾನ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರ ಮಾರ್ಗಗಳಾಗಿವೆ.`;
    } else {
      text += `ಈ ತಿಂಗಳಿನಲ್ಲಿ ಯಾವುದೇ ಪ್ರಮುಖ ಗೋಚಾರ ದೋಷಗಳಿಲ್ಲ. ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗಿಕೊಳ್ಳುವುದು ಮತ್ತು ದಾನ-ಧರ್ಮ ಮಾಡುವುದು ನಿಮಗೆ ಸರ್ವತೋಮುಖ ಏಳಿಗೆ ತರುತ್ತದೆ.`;
    }
  } else {
    text += `[Natal & Transit Synthesis]\n${natalContext}\n\n`;
    if (supportives.length > 0) {
      text += `[Auspicious Transits]:\n` + supportives.map(s => `• ${s}`).join("\n") + `\n\n`;
    }
    if (challenges.length > 0) {
      text += `[Transit Challenges]:\n` + challenges.map(c => `• ${c}`).join("\n") + `\n\n`;
      text += `[Remedies & Precautions]: Worship Lord Shiva, chant Hanuman Chalisa daily for physical and mental protection, and help the weaker sections of society to ease the karmic flow.`;
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
    "Aries Ascendant makes you dynamic, pioneering, and courageous.",
    "Taurus Ascendant gives you a steady, patient, and reliable nature.",
    "Gemini Ascendant bestows versatility, intellect, and excellent communication skills.",
    "Cancer Ascendant fills you with deep empathy, intuition, and protective care.",
    "Leo Ascendant grants a majestic presence, leadership qualities, and a warm heart.",
    "Virgo Ascendant provides an analytical mind, attention to detail, and a desire to be helpful.",
    "Libra Ascendant brings a deep love for harmony, beauty, diplomacy, and relationships.",
    "Scorpio Ascendant infuses intense passion, research abilities, and magnetic resilience.",
    "Sagittarius Ascendant brings optimism, a love for freedom, wisdom, and truth.",
    "Capricorn Ascendant gives strong discipline, practicality, ambition, and persistence.",
    "Aquarius Ascendant makes you unique, humanitarian, intellectual, and forward-thinking.",
    "Pisces Ascendant bestows deep imagination, spirituality, sensitivity, and compassion."
  ];

  const lagnaDescsKn = [
    "ಮೇಷ ಲಗ್ನವು ನಿಮ್ಮನ್ನು ಕ್ರಿಯಾಶೀಲರನ್ನಾಗಿ, ಸಾಹಸಪ್ರಿಯರನ್ನಾಗಿ ಮತ್ತು ಸ್ವಾಭಿಮಾನಿಗಳನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.",
    "ವೃಷಭ ಲಗ್ನವು ನಿಮಗೆ ಸ್ಥಿರತೆ, ತಾಳ್ಮೆ ಮತ್ತು ಅತ್ಯಂತ ನಂಬಿಕಸ್ಥ ಸ್ವಭಾವವನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    "ಮಿಥುನ ಲಗ್ನವು ನಿಮಗೆ ಬುದ್ಧಿವಂತಿಕೆ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ ಮತ್ತು ಅತ್ಯುತ್ತಮ ಸಂವಹನ ಕಲೆಗಳನ್ನು ನೀಡುತ್ತದೆ.",
    "ಕಟಕ ಲಗ್ನವು ನಿಮ್ಮಲ್ಲಿ ಆಳವಾದ ಸಹಾನುಭೂತಿ, ಅಂತಃಪ್ರಜ್ಞೆ ಮತ್ತು ತಾಯಿಯಂತಹ ಕಾಳಜಿಯನ್ನು ತುಂಬುತ್ತದೆ.",
    "ಸಿಂಹ ಲಗ್ನವು ನಿಮಗೆ ನಾಯಕತ್ವ ಗುಣಗಳು, ತೇಜಸ್ವಿ ನಡೆ ಮತ್ತು ಉದಾರ ಮನಸ್ಸನ್ನು ನೀಡುತ್ತದೆ.",
    "ಕನ್ಯಾ ಲಗ್ನವು ನಿಮಗೆ ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಬುದ್ಧಿ, ಶಿಸ್ತು ಮತ್ತು ಇತರರಿಗೆ ಸಹಾಯ ಮಾಡುವ ಒಲವನ್ನು ನೀಡುತ್ತದೆ.",
    "ತುಲಾ ಲಗ್ನವು ನಿಮ್ಮಲ್ಲಿ ಶಾಂತಿ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ, ರಾಜತಾಂತ್ರಿಕತೆ ಮತ್ತು ಸಂಬಂಧಗಳ ಮೇಲಿನ ಪ್ರೀತಿಯನ್ನು ತುಂಬುತ್ತದೆ.",
    "ವೃಶ್ಚಿಕ ಲಗ್ನವು ನಿಮ್ಮಲ್ಲಿ ತೀವ್ರವಾದ ಸಂಕಲ್ಪ ಶಕ್ತಿ, ನಿಗೂಢ ವಿಷಯಗಳ ಮೇಲಿನ ಆಸಕ್ತಿ ಮತ್ತು ಅದ್ಭುತ ಸಹಿಷ್ಣುತೆಯನ್ನು ತರುತ್ತದೆ.",
    "ಧನುರ್ ಲಗ್ನವು ನಿಮ್ಮಲ್ಲಿ ಆಶಾವಾದ, ಸ್ವತಂತ್ರ ಚಿಂತನೆ, ಜ್ಞಾನ ಮತ್ತು ಧರ್ಮನಿಷ್ಠೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    "ಮಕರ ಲಗ್ನವು ನಿಮಗೆ ಕಠಿಣ ಶಿಸ್ತು, ಪ್ರಾಯೋಗಿಕ ಜ್ಞಾನ, ಮಹತ್ವಾಕಾಂಕ್ಷೆ ಮತ್ತು ಸಹನೆಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
    "ಕುಂಭ ಲಗ್ನವು ನಿಮ್ಮನ್ನು ವಿಶಿಷ್ಟರನ್ನಾಗಿ, ಮಾನವೀಯ ಮೌಲ್ಯವುಳ್ಳವರನ್ನಾಗಿ ಮತ್ತು ಸೃಜನಶೀಲ ಚಿಂತಕರನ್ನಾಗಿ ಮಾಡುತ್ತದೆ.",
    "ಮೀನ ಲಗ್ನವು ನಿಮಗೆ ಆಳವಾದ ಸೃಜನಶೀಲ ಕಲ್ಪನೆ, ಆಧ್ಯಾತ್ಮಿಕತೆ ಮತ್ತು ಕರುಣಾಭಾವವನ್ನು ಕರುಣಿಸುತ್ತದೆ."
  ];

  const lagnaDescsHi = [
    "मेष लग्न आपको ऊर्जावान, साहसी और स्वतंत्र विचारों वाला बनाता है।",
    "वृषभ लग्न आपको धैर्यवान, व्यावहारिक और विश्वसनीय स्वभाव प्रदान करता है।",
    "मिथुन लग्न आपको बहुमुखी प्रतिभा, कुशाग्र बुद्धि और कुशल संचार कौशल प्रदान करता है।",
    "कर्क लग्न आपको अत्यंत संवेदनशील, संवेदनशील और सुरक्षात्मक स्वभाव देता है।",
    "सिंह लग्न आपको राजसी व्यक्तित्व, नेतृत्व क्षमता और उदार हृदय प्रदान करता है।",
    "कन्या लग्न आपको विश्लेषणात्मक बुद्धि, व्यावहारिक दृष्टिकोण और सेवाभाव प्रदान करता है।",
    "तुला लग्न आपके भीतर शांति, सौंदर्यप्रियता, कूटनीति और मधुर संबंधों की भावना भरता है।",
    "वृश्चिक लग्न आपको गहन संकल्प शक्ति, खोजी प्रवृत्ति और विपरीत परिस्थितियों से उबरने की क्षमता देता है।",
    "धनु लग्न आपको आशावादी स्वभाव, ज्ञान की खोज और धार्मिक दृष्टिकोण प्रदान करता है।",
    "मकर लग्न आपको व्यावहारिक बुद्धि, अनुशासित जीवन और महत्वाकांक्षा प्रदान करता है।",
    "कंभ लग्न आपको मानवतावादी, बुद्धिजीवी और लीक से हटकर सोचने वाला बनाता है।",
    "मीन लग्न आपको गहरी कल्पनाशीलता, दयालुता और आध्यात्मिक झुकाव प्रदान करता है।"
  ];

  const moonDescsEn = [
    "Your emotional nature is spirited, courageous, and ready to embrace new beginnings.",
    "You find emotional security in stability, comfort, and steady, reliable bonds.",
    "You process feelings through expression, curiosity, and continuous learning.",
    "Your heart is exceptionally intuitive, deeply caring, and protective of your loved ones.",
    "You possess a warm-hearted, generous emotional nature that seeks to shine and protect.",
    "You feel most secure when organizing, helping others, and analyzing situations clearly.",
    "You seek peace, harmony, and balanced relationships to maintain mental calm.",
    "Your emotions are intense, deeply private, resilient, and spiritually profound.",
    "Your mind is optimistic, seeking freedom, truth, and philosophical growth.",
    "You express feelings with caution, strong self-control, and a sense of duty.",
    "Your emotional landscape is independent, progressive, and values friendship.",
    "You possess a deeply compassionate, imaginative, and spiritually receptive heart."
  ];

  const moonDescsKn = [
    "ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಮನಸ್ಸು ಚುರುಕಾಗಿದ್ದು, ಧೈರ್ಯಶಾಲಿ ಮತ್ತು ಹೊಸ ಸವಾಲುಗಳಿಗೆ ಸಿದ್ಧವಿರುತ್ತದೆ.",
    "ನೀವು ಸ್ಥಿರತೆ, ಆರಾಮದಾಯಕ ಪರಿಸರ ಮತ್ತು ಶಾಶ್ವತ ಬಾಂಧವ್ಯದಲ್ಲಿ ನೆಮ್ಮದಿಯನ್ನು ಕಾಣುತ್ತೀರಿ.",
    "ನಿಮ್ಮ ಭಾವನೆಗಳು ಕುತೂಹಲ, ಮಾತುಕತೆ ಮತ್ತು ಸದಾ ಹೊಸದನ್ನು ಕಲಿಯುವ ಬಯಕೆಯಿಂದ ಕೂಡಿರುತ್ತವೆ.",
    "ನಿಮ್ಮ ಹೃದಯವು ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮವಾಗಿದ್ದು, ಪ್ರೀತಿಪಾತ್ರರ ಬಗ್ಗೆ ಅಪಾರ ಕಾಳಜಿ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಭಾವವನ್ನು ಹೊಂದಿರುತ್ತದೆ.",
    "ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಸ್ವಭಾವವು ಮುಕ್ತವಾಗಿದ್ದು, ಎಲ್ಲರನ್ನು ಪ್ರೀತಿಯಿಂದ ಬೆಳೆಸಲು ಬಯಸುತ್ತದೆ.",
    "ನೀವು ವಿಷಯಗಳನ್ನು ವ್ಯವಸ್ಥಿತಗೊಳಿಸುವುದರಲ್ಲಿ, ಇತರರಿಗೆ ನೆರವಾಗುವುದರಲ್ಲಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸುವುದರಲ್ಲಿ ನೆಮ್ಮದಿ ಕಾಣುತ್ತೀರಿ.",
    "ನಿಮ್ಮ ಮನಸ್ಸಿನ ನೆಮ್ಮದಿಗೆ ಶಾಂತಿ, ಸೌಂದರ್ಯ ಮತ್ತು ಸುಂದರವಾದ ಬಾಂಧವ್ಯಗಳು ಅತಿ ಮುಖ್ಯವಾಗಿವೆ.",
    "ನಿಮ್ಮ ಭಾವನೆಗಳು ನಿಗೂಢವಾಗಿದ್ದು, ಅದ್ಭುತ ಆಂತರಿಕ ಶಕ್ತಿ ಮತ್ತು ತತ್ವಚಿಂತನೆಯಿಂದ ಕೂಡಿರುತ್ತವೆ.",
    "ನಿಮ್ಮ ಮನಸ್ಸು ಸದಾ ಆಶಾವಾದಿಯಾಗಿರುತ್ತದೆ, ಸ್ವತಂತ್ರ ನಡಿಗೆ ಮತ್ತು ಜ್ಞಾನದ ಅನ್ವೇಷಣೆಯನ್ನು ಬಯಸುತ್ತದೆ.",
    "ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ನೀವು ನಿಯಂತ್ರಣದಲ್ಲಿಡುತ್ತೀರಿ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ನಡವಳಿಕೆಯನ್ನು ಹೊಂದಿದ್ದೀರಿ.",
    "ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಚಿಂತನೆಗಳು ಸ್ವತಂತ್ರವಾಗಿದ್ದು, ಸ್ನೇಹಿತರು ಮತ್ತು ಆದರ್ಶ ಮೌಲ್ಯಗಳನ್ನು ಗೌರವಿಸುತ್ತವೆ.",
    "ನಿಮ್ಮ ಹೃದಯವು ಅತ್ಯಂತ ದಯಾಳು, ಕಲ್ಪನಾಶೀಲ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆಗಳಿಂದ ಕೂಡಿರುತ್ತದೆ."
  ];

  const moonDescsHi = [
    "आपका मन अत्यंत उत्साही, साहसी और नई शुरुआत करने के लिए हमेशा तत्पर रहता है।",
    "आप अपने जीवन में स्थिरता, सुरक्षा और गहरे संबंधों में मानसिक शांति महसूस करते हैं।",
    "आप अपनी भावनाओं को बातचीत, जिज्ञासा और नई जानकारियों के माध्यम से व्यक्त करते हैं।",
    "आपका हृदय अत्यंत भावुक, दूसरों की चिंता करने वाला और सुरक्षात्मक होता है।",
    "आपका स्वभाव उदार, स्नेही और दूसरों का मार्गदर्शन करने वाला होता है।",
    "आप व्यावहारिक रूप से मदद करने और परिस्थितियों का तार्किक विश्लेषण करने में शांति पाते हैं।",
    "आप अपने जीवन में शांति, सामंजस्य और आपसी रिश्तों में संतुलन बनाए रखना चाहते हैं।",
    "आपकी भावनाएं बहुत गहरी, रहस्यमयी और मानसिक रूप से मजबूत होती हैं।",
    "आपका दृष्टिकोण आशावादी होता है, जो ज्ञान, स्वतंत्रता और सत्य की खोज में रमता है।",
    "आप अपनी भावनाओं पर संयम रखते हैं और अपने कर्तव्यों के प्रति समर्पित रहते हैं।",
    "आपका मन स्वतंत्र विचारों वाला होता है, जो सामाजिक कल्याण और मित्रता को महत्व देता है।",
    "आपके पास एक संवेदनशील, कल्पनाशील और दयालु हृदय है, जो आध्यात्मिक शांति खोजता है।"
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

  return {
    cosmicProfile,
    todaysTransits,
    currentLifeChapter,
    upcomingChapters,
    monthlySummary
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

