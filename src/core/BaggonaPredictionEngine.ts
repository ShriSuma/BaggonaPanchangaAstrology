import type { KundliOutput, PlanetName, Rashi } from "./AstroTypes";
import { PlanetName as PN, RASHIS } from "./AstroTypes";
import type { TraditionalBaggonaPanchanga } from "./TraditionalBaggonaEngine";
import { translateTexts } from "../services/translationService";
import { generateBhuktiTimeline } from "./DashaBhuktiEngine";
import { siderealLongitudes } from "./EphemerisEngine";
import { degreeToRashi } from "./AstroMath";

export interface BaggonaPredictionSection {
  title: string;
  description: string;
}

export interface BaggonaPredictions {
  overview: BaggonaPredictionSection[];
  planets: BaggonaPredictionSection[];
  houses: BaggonaPredictionSection[];
  yogas: BaggonaPredictionSection[];
  longevity: BaggonaPredictionSection[];
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
  "your physical health, self-expression, and general character",
  "family life, wealth accumulation, speech, and early education",
  "your courage, siblings, short travels, and self-efforts",
  "mother, happiness, home, vehicles, and assets",
  "intellect, children, creativity, and past good deeds",
  "handling debts, health concerns, and overcoming enemies",
  "marriage, spouse, partnership, and public life",
  "longevity, inheritance, sudden changes, and secrets",
  "fortune, father, higher learning, and spiritual dharma",
  "career development, social status, and professional efforts",
  "income, gains, elder siblings, and wishes",
  "expenditure, spiritual release, foreign travels, and sleep"
];

const BHAVA_SIGNIFICATIONS_KN = [
  "ನಿಮ್ಮ ದೈಹಿಕ ಆರೋಗ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ, ರೂಪ ಮತ್ತು ಒಟ್ಟಾರೆ ವ್ಯಕ್ತಿತ್ವವನ್ನು",
  "ಕುಟುಂಬದ ಸುಖ, ಸಂಪತ್ತಿನ ಗಳಿಕೆ, ಮಧುರ ಮಾತು ಮತ್ತು ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣವನ್ನು",
  "ನಿಮ್ಮ ಸಹೋದರರ ಬಾಂಧವ್ಯ, ಆಂತರಿಕ ಧೈರ್ಯ, ಕಿರು ಪ್ರಯಾಣಗಳು ಮತ್ತು ಸ್ವಪ್ರಯತ್ನವನ್ನು",
  "ತಾಯಿಯ ವಾತ್ಸಲ್ಯ, ಮನೆಯ ನೆಮ್ಮದಿ, ವಾಹನ ಸುಖ ಮತ್ತು ಸ್ಥಿರ ಆಸ್ತಿಪಾಸ್ತಿಯನ್ನು",
  "ನಿಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿ, ಮಕ್ಕಳ ಯೋಗ, ಸೃಜನಶೀಲತೆ ಮತ್ತು ಪೂರ್ವಜನ್ಮದ ಪುಣ್ಯ ಫಲಗಳನ್ನು",
  "ಆರೋಗ್ಯದ ಕಾಳಜಿ, ಋಣಮುಕ್ತಿ ಮತ್ತು ಸವಾಲುಗಳನ್ನು ಎದುರಿಸುವ ಶಕ್ತಿಯನ್ನು",
  "ವಿವಾಹ ಯೋಗ, ಸಂಗಾತಿಯೊಂದಿಗಿನ ಸಂಬಂಧ, ಒಡನಾಟ ಮತ್ತು ಪಾಲುದಾರಿಕೆಯನ್ನು",
  "ಆಯಸ್ಸು, ಹಠಾತ್ ಬದಲಾವಣೆಗಳು, ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ ಮತ್ತು ನಿಗೂಢ ಜ್ಞಾನವನ್ನು",
  "ಅದೃಷ್ಟದ ಒಲವು, ತಂದೆಯವರ ಮಾರ್ಗದರ್ಶನ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ ಮತ್ತು ಧರ್ಮದ ನಂಬಿಕೆಯನ್ನು",
  "ನಿಮ್ಮ ಉದ್ಯೋಗ, ಸಮಾಜದಲ್ಲಿನ ಕೀರ್ತಿ, ಯಶಸ್ಸು ಮತ್ತು ಕರ್ಮ ಕ್ಷೇತ್ರವನ್ನು",
  "ಆದಾಯದ ಮೂಲಗಳು, ಆಸೆಗಳ ಈಡೇರಿಕೆ, ಹಿರಿಯ ಒಡಹುಟ್ಟಿದವರ ಬೆಂಬಲ ಮತ್ತು ಲಾಭವನ್ನು",
  "ಆರೋಗ್ಯಕರ ವೆಚ್ಚಗಳು, ಆಧ್ಯಾತ್ಮಿಕ ಮುಕ್ತಿ, ವಿದೇಶಿ ಪ್ರವಾಸಗಳು ಮತ್ತು ಶಾಂತಿಯುತ ನಿದ್ರೆಯನ್ನು"
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

    planets.push({ title, description });
  }

  // --- 3. 12 BHAVAS (DVADASHA BHAVA) ---
  const houses: BaggonaPredictionSection[] = [];
  for (let h = 1; h <= 12; h++) {
    const occupants = kundli.planets.filter((p) => p.house === h);
    const occupantsStr = occupants.length > 0
      ? occupants.map((p) => getPlanetName(p.name)).join(", ")
      : "";

    let title = "";
    let description = "";

    if (isKn) {
      title = BHAVA_NAMES_KN[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_KN[h - 1]!;
      if (occupants.length > 0) {
        const hasBenefics = occupants.some(p => p.name === PN.Jupiter || p.name === PN.Venus || p.name === PN.Moon || p.name === PN.Mercury);
        if (hasBenefics) {
          description = `ಈ ಭಾವವು ${sigs} ಸೂಚಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ಈ ಭಾವದಲ್ಲಿ ${occupantsStr} ರವರ ಶುಭ ಪ್ರಭಾವವಿದೆ. ಈ ಶುಭ ಗ್ರಹಗಳ ಇರುವಿಕೆಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಈ ಕ್ಷೇತ್ರಗಳಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಮೃದ್ಧಿ, ಸೌಂದರ್ಯ ಮತ್ತು ಹರ್ಷದಾಯಕ ಪ್ರಗತಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.`;
        } else {
          description = `ಈ ಭಾವವು ${sigs} ಸೂಚಿಸುತ್ತದೆ. ಪ್ರಸ್ತುತ ಇಲ್ಲಿ ${occupantsStr} ರವರ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವಿದೆ. ಇದು ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಈ ಕ್ಷೇತ್ರಗಳಿಗೆ ಹೆಚ್ಚಿನ ಶಿಸ್ತು, ಪರಿಶ್ರಮ ಮತ್ತು ಸವಾಲುಗಳನ್ನು ಜಯಿಸುವ ಅದ್ಭುತ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.`;
        }
      } else {
        description = `ಈ ಭಾವವು ${sigs} ಸೂಚಿಸುತ್ತದೆ. ಈ ಮನೆಯಲ್ಲಿ ಯಾವುದೇ ಗ್ರಹಗಳಿಲ್ಲದ ಕಾರಣ, ಇದು ಪ್ರಶಾಂತವಾಗಿದೆ. ಈ ಭಾವದ ಅಧಿಪತಿಯ ರಕ್ಷಣಾತ್ಮಕ ನೋಟದಿಂದಾಗಿ ಇಲ್ಲಿನ ವಿಷಯಗಳು ಕಾಲಕ್ಕೆ ತಕ್ಕಂತೆ ನೈಸರ್ಗಿಕವಾಗಿ ಮತ್ತು ಸಕಾರಾತ್ಮಕವಾಗಿ ವೃದ್ಧಿಯಾಗಲಿವೆ.`;
      }
    } else if (isHi) {
      title = BHAVA_NAMES_HI[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_HI[h - 1]!;
      if (occupants.length > 0) {
        const hasBenefics = occupants.some(p => p.name === PN.Jupiter || p.name === PN.Venus || p.name === PN.Moon || p.name === PN.Mercury);
        if (hasBenefics) {
          description = `यह भाव ${sigs} दर्शाता है। वर्तमान में इस भाव में ${occupantsStr} की शुभ उपस्थिति है। इन कल्याणकारी ग्रहों की कृपा से आपके जीवन के इस क्षेत्र में सुख, समृद्धि और निरंतर उन्नति का मार्ग प्रशस्त होगा।`;
        } else {
          description = `यह भाव ${sigs} दर्शाता है। वर्तमान में इस भाव में ${occupantsStr} की सक्रिय ऊर्जा का प्रभाव है। यह आपको संबंधित क्षेत्रों में अधिक अनुशासित रहने, संघर्ष करने और अंततः विजय प्राप्त करने की शक्ति प्रदान करेगा।`;
        }
      } else {
        description = `यह भाव ${sigs} दर्शाता है। इस भाव में कोई ग्रह न होने से यह स्थान रिक्त और शांत है। इसके स्वामी ग्रह के अनुकूल प्रभाव से आपके जीवन में इस क्षेत्र का विकास प्राकृतिक, संतुलित और शुभ रहेगा।`;
      }
    } else {
      title = BHAVA_NAMES_EN[h - 1]!;
      const sigs = BHAVA_SIGNIFICATIONS_EN[h - 1]!;
      if (occupants.length > 0) {
        const hasBenefics = occupants.some(p => p.name === PN.Jupiter || p.name === PN.Venus || p.name === PN.Moon || p.name === PN.Mercury);
        if (hasBenefics) {
          description = `This house governs ${sigs}. The gentle presence of ${occupantsStr} here acts as a source of harmony, joy, and growth, encouraging ease and success in these areas of your life.`;
        } else {
          description = `This house governs ${sigs}. The presence of ${occupantsStr} introduces a highly active, challenging energy, prompting you to build resilience, work diligently, and overcome obstacles.`;
        }
      } else {
        description = `This house governs ${sigs}. It is currently unoccupied, indicating a quiet and steady development of these matters under the supportive aspect of the house lord.`;
      }
    }

    houses.push({ title, description });
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

  return {
    overview,
    planets,
    houses,
    yogas,
    longevity
  };
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

  return {
    cosmicProfile,
    todaysTransits,
    currentLifeChapter,
    upcomingChapters
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
  const mappings: { type: keyof BaggonaPredictions; index: number; field: "title" | "description" }[] = [];

  const addSection = (sectionName: keyof BaggonaPredictions, list: BaggonaPredictionSection[]) => {
    list.forEach((sec, idx) => {
      flatStrings.push(sec.title);
      mappings.push({ type: sectionName, index: idx, field: "title" });
      flatStrings.push(sec.description);
      mappings.push({ type: sectionName, index: idx, field: "description" });
    });
  };

  addSection("overview", pred.overview);
  addSection("planets", pred.planets);
  addSection("houses", pred.houses);
  addSection("yogas", pred.yogas);
  addSection("longevity", pred.longevity);

  const translated = await translateTexts(flatStrings, targetLang);

  const next: BaggonaPredictions = {
    overview: pred.overview.map(x => ({ ...x })),
    planets: pred.planets.map(x => ({ ...x })),
    houses: pred.houses.map(x => ({ ...x })),
    yogas: pred.yogas.map(x => ({ ...x })),
    longevity: pred.longevity.map(x => ({ ...x }))
  };

  mappings.forEach((map, i) => {
    const list = next[map.type] as BaggonaPredictionSection[];
    const item = list[map.index]!;
    item[map.field] = translated[i] ?? item[map.field];
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
