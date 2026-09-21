import { PlanetName, type KundliInput, type KundliOutput, RASHIS } from "../../core/AstroTypes";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { degreeToRashi } from "../../core/AstroMath";
import {
  generateAstrologicalPrescriptions,
  generatePanchangaAngaSynthesis,
  YOGA_RULES,
  KARANA_RULES
} from "../../core/PanchangaAngaSynthesisEngine";

export type SupportedLanguage = "kn" | "en" | "hi" | "te" | "ta";

export interface PanchangaRemedies {
  nakshatraRemedy: {
    nakshatraName: Record<string, string>;
    pada: number;
    rulingDeity: Record<string, string>;
    sacredTree: {
      botanicalName: string;
      kannada: string;
      english: string;
      hindi: string;
      telugu: string;
      tamil: string;
      worshipMethod: Record<string, string>;
    };
    beejaMantra: {
      sanskrit: string;
      kannada: string;
      meaning: Record<string, string>;
    };
    aradhana: Record<string, string>;
  };
  tithiRemedy: {
    tithiName: Record<string, string>;
    paksha: "Shukla" | "Krishna";
    rulingDeity: Record<string, string>;
    vrataAndRemedy: Record<string, string>;
  };
  varaRemedy: {
    dayName: Record<string, string>;
    rulingGraha: PlanetName;
    dailyColor: Record<string, string>;
    dailySadhana: Record<string, string>;
  };
  yogaRemedy: {
    yogaName: Record<string, string>;
    isAuspicious: boolean;
    deity: string;
    shantiPractice: Record<string, string>;
  };
  karanaRemedy: {
    karanaName: Record<string, string>;
    tatva: string;
    deity: string;
    karyaShanti: Record<string, string>;
  };
}

export interface PlanetaryStrengthRemedies {
  debilitatedPlanets: Array<{
    graha: PlanetName;
    grahaName: Record<string, string>;
    debilitationSign: Record<string, string>;
    hasNeechaBhanga: boolean;
    neechaBhangaReason?: Record<string, string>;
    shantiRemedy: Record<string, string>;
    gemstoneCaution: Record<string, string>;
  }>;
  exaltedPlanets: Array<{
    graha: PlanetName;
    grahaName: Record<string, string>;
    exaltationSign: Record<string, string>;
    activationRemedy: Record<string, string>;
    blessingArea: Record<string, string>;
  }>;
  influencerBenchmarkComparison: {
    title: Record<string, string>;
    insights: Record<string, string>;
    authenticApproach: Record<string, string>;
  };
}

export interface KundliRemedyDiagnosis {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  gotra?: string;
  lagnaName: Record<string, string>;
  rashiName: Record<string, string>;
  nakshatraName: Record<string, string>;
  primaryStruggle: {
    category:
      | "anger_temper"
      | "mental_anxiety"
      | "career_obstacles"
      | "relationship_friction"
      | "health_vitality"
      | "marriage_delay"
      | "student_academic"
      | "debt_financial"
      | "legal_confinement"
      | "leadership_expansion"
      | "creative_stardom"
      | "elite_sports"
      | "general_alignment";
    title: Record<string, string>;
    description: Record<string, string>;
    intensity: "High" | "Moderate" | "Balanced";
    intensityLabel: Record<string, string>;
  };
  lifeTurnaroundTiming: {
    timelineKn: string;
    timelineEn: string;
    catalystGrahaKn: string;
    catalystGrahaEn: string;
    breakthroughMechanismKn: string;
    breakthroughMechanismEn: string;
    specificSevaKn: string;
    specificSevaEn: string;
  };
  afflictionFactors: Array<{
    graha: PlanetName;
    title: Record<string, string>;
    reason: Record<string, string>;
    house: number;
    impact: Record<string, string>;
  }>;
  psychologicalProfile: {
    krodhaLevel: number; // 0-100%
    manasStability: number; // 0-100%
    vitalityScore: number; // 0-100%
    patienceIndex: number; // 0-100%
  };
  instantCalmingProtocol: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    steps: Array<{
      stepNumber: number;
      name: Record<string, string>;
      action: Record<string, string>;
      detail: Record<string, string>;
      duration: Record<string, string>;
      icon: string;
    }>;
    emergencyBeejaMantra: {
      sanskrit: string;
      kannada: string;
      telugu: string;
      tamil: string;
      hindi: string;
      transliteration: string;
      meaning: Record<string, string>;
      japaCount: Record<string, string>;
    };
  };
  dailyPacificationRoutine: {
    morning: Array<{ time: string; title: Record<string, string>; desc: Record<string, string>; icon: string }>;
    afternoonLifestyle: Array<{ title: Record<string, string>; desc: Record<string, string>; icon: string }>;
    evening: Array<{ time: string; title: Record<string, string>; desc: Record<string, string>; icon: string }>;
  };
  personalizedStotras: Array<{
    id: string;
    title: Record<string, string>;
    dedicatedTo: Record<string, string>;
    shlokaSanskrit: string;
    shlokaKannada: string;
    shlokaTelugu: string;
    shlokaTamil: string;
    shlokaHindi: string;
    transliteration: string;
    meaning: Record<string, string>;
    spiritualBenefits: Record<string, string>;
    bestTimeToRecite: Record<string, string>;
    facingDirection: Record<string, string>;
    recitationCount: Record<string, string>;
  }>;
  panchangaRemedies: PanchangaRemedies;
  planetaryStrengthRemedies: PlanetaryStrengthRemedies;
  dashaBhuktiAnalysis: {
    currentMahaDasha: PlanetName;
    currentBhukti: PlanetName;
    mahaDashaLabel: Record<string, string>;
    bhuktiLabel: Record<string, string>;
    periodEffect: Record<string, string>;
    remedialAction: Record<string, string>;
  };
  gocharaTransitAnalysis: {
    transitHighlights: Array<{
      graha: PlanetName;
      transitSign: string;
      houseFromMoon: number;
      effect: "Benefic" | "Caution" | "Challenging";
      title: Record<string, string>;
      description: Record<string, string>;
      remedy: Record<string, string>;
    }>;
    sadeSatiStatus: Record<string, string>;
  };
  gokarnaTempleRemedies: {
    prescribedSeva: {
      name: Record<string, string>;
      temple: Record<string, string>;
      significance: Record<string, string>;
      idealDay: Record<string, string>;
    };
    rudrakshaRecommendation: {
      mukhi: Record<string, string>;
      deity: Record<string, string>;
      benefits: Record<string, string>;
    };
    gemstoneRecommendation: {
      stone: Record<string, string>;
      metal: Record<string, string>;
      finger: Record<string, string>;
      dayToWear: Record<string, string>;
    };
    donationDaana: {
      item: Record<string, string>;
      day: Record<string, string>;
      beneficiary: Record<string, string>;
    };
  };
  chiefPriestBlessing: {
    priestName: Record<string, string>;
    priestTitle: Record<string, string>;
    phone: string;
    sanskritAshirvada: string;
    ashirvadaMeaning: Record<string, string>;
    templeSealText: Record<string, string>;
  };
}

/** Localized Graha Names Dictionary */
export const GRAHA_NAMES_LOCALE: Record<PlanetName, Record<string, string>> = {
  [PlanetName.Sun]: { kn: "ಸೂರ್ಯ (ರವಿ)", en: "Sun (Surya)", hi: "सूर्य (रवि)", te: "సూర్యుడు (రవి)", ta: "சூரியன் (ரவி)" },
  [PlanetName.Moon]: { kn: "ಚಂದ್ರ", en: "Moon (Chandra)", hi: "चन्द्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  [PlanetName.Mars]: { kn: "ಕುಜ (ಮಂಗಳ)", en: "Mars (Mangala/Kuja)", hi: "मंगल (कुज)", te: "కుజుడు (మంగళ)", ta: "செவ்வாய் (குஜன்)" },
  [PlanetName.Mercury]: { kn: "ಬುಧ", en: "Mercury (Budha)", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  [PlanetName.Jupiter]: { kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)", en: "Jupiter (Guru)", hi: "बृहस्पति (गुरु)", te: "గురుడు (బృహస్పతి)", ta: "குரு (வியாழன்)" },
  [PlanetName.Venus]: { kn: "ಶುಕ್ರ", en: "Venus (Shukra)", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  [PlanetName.Saturn]: { kn: "ಶನಿ ಮಹಾರಾಜ", en: "Saturn (Shani)", hi: "शनि देव", te: "శని దేవుడు", ta: "சனி பகவான்" },
  [PlanetName.Rahu]: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  [PlanetName.Ketu]: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" }
};

/** Localized Rashi Names Dictionary */
export const RASHI_NAMES_LOCALE: Record<string, Record<string, string>> = {
  Aries: { kn: "ಮೇಷ", en: "Aries", hi: "मेष", te: "మేషం", ta: "மேஷம்" },
  Taurus: { kn: "ವೃಷಭ", en: "Taurus", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்" },
  Gemini: { kn: "ಮಿಥುನ", en: "Gemini", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்" },
  Cancer: { kn: "ಕರ್ಕಾಟಕ", en: "Cancer", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்" },
  Leo: { kn: "ಸಿಂಹ", en: "Leo", hi: "सिंह", te: "సింహం", ta: "சிம்மம்" },
  Virgo: { kn: "ಕನ್ಯಾ", en: "Virgo", hi: "कन्या", te: "కన్య", ta: "கன்னி" },
  Libra: { kn: "ತುಲಾ", en: "Libra", hi: "तुला", te: "తులా", ta: "துலாம்" },
  Scorpio: { kn: "ವೃಶ್ಚಿಕ", en: "Scorpio", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்" },
  Sagittarius: { kn: "ಧನುಸ್ಸು", en: "Sagittarius", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு" },
  Capricorn: { kn: "ಮಕರ", en: "Capricorn", hi: "मकर", te: "మకరం", ta: "மகரம்" },
  Aquarius: { kn: "ಕುಂಭ", en: "Aquarius", hi: "कुम्भ", te: "కుంభం", ta: "கும்பம்" },
  Pisces: { kn: "ಮೀನ", en: "Pisces", hi: "मीन", te: "మీనం", ta: "மீனம்" }
};

/** 27 Authentic Classical Nakshatra Vriksha (Sacred Trees) & Remedies */
export const NAKSHATRA_REMEDY_DATA: Record<number, {
  name: Record<string, string>;
  deity: Record<string, string>;
  tree: {
    botanicalName: string;
    kannada: string;
    english: string;
    hindi: string;
    telugu: string;
    tamil: string;
    worshipMethod: Record<string, string>;
  };
  beejaMantra: {
    sanskrit: string;
    kannada: string;
    meaning: Record<string, string>;
  };
  aradhana: Record<string, string>;
}> = {
  0: { // Ashwini
    name: { kn: "ಅಶ್ವಿನಿ", en: "Ashwini", hi: "अश्विनी", te: "అశ్విని", ta: "அஸ்வினி" },
    deity: { kn: "ಅಶ್ವಿನಿ ಕುಮಾರರು (ದೇವ ವೈದ್ಯರು)", en: "Ashwini Kumaras (Divine Healers)", hi: "अश्विनी कुमार", te: "అశ్వినీ దేవతలు", ta: "அஸ்வினி குமாரர்கள்" },
    tree: {
      botanicalName: "Strychnos nux-vomica",
      kannada: "ಕಾಸರಕ (ನಂಜಿನ ಮರ)",
      english: "Poison Nut (Kuchila)",
      hindi: "कुचिला",
      telugu: "ముషిణి",
      tamil: "எட்டி மரம்",
      worshipMethod: {
        kn: "ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ ಕಾಸರಕ ವೃಕ್ಷಕ್ಕೆ ನೀರೆರೆದು ಪ್ರದಕ್ಷಿಣೆ ಹಾಕುವುದು ದೈಹಿಕ ಶಕ್ತಿ ಮತ್ತು ರೋಗನಿವಾರಣೆಗೆ ಶ್ರೇಷ್ಠ.",
        en: "Water the Kuchila tree and circumambulate on Ashwini days for rapid physical healing and cellular vigor.",
        hi: "अश्विनी के दिन कुचिला वृक्ष को जल अर्पित करें एवं अश्विनी कुमारों का ध्यान करें।",
        te: "అశ్విని నక్షత్రం రోజున ముషిణి వృక్షానికి ప్రదక్షిణ చేసి నీరు పోయండి.",
        ta: "அஸ்வினி நாளில் எட்டி மரத்தை வலம் வந்து நீர் ஊற்றவும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अश्विनीकुमाराभ्यां नमः । ॐ अं अश्विनीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಅಶ್ವಿನೀಕುಮಾರಾಭ್ಯಾಂ ನಮಃ । ಓಂ ಅಂ ಅಶ್ವಿನೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ದೇವವೈದ್ಯರಾದ ಅಶ್ವಿನಿ ಕುಮಾರರ ಅನುಗ್ರಹದಿಂದ ಸಮಸ್ತ ರೋಗಗಳು ನಿವಾರಣೆಯಾಗಿ ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸಲಿ.",
        en: "May the divine celestial physicians Ashwini Kumaras remove all illnesses and restore radiant health.",
        hi: "देव वैद्य अश्विनी कुमारों की कृपा से समस्त व्याधियां दूर हों।",
        te: "అశ్వినీ కుమారుల అనుగ్రహంతో రోగాలు తొలగుగాక.",
        ta: "அஸ்வினி குமாரர்களின் அருளால் நோய்கள் நீங்கட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ಗಣೇಶ ಹಾಗೂ ಸೂರ್ಯನ ಆರಾಧನೆ, ಔಷಧ ದಾನ ಮಾಡುವುದು ಶ್ರೇಷ್ಠ.",
      en: "Worship Lord Ganesha and Surya; donate medicines to needy patients.",
      hi: "भगवान गणेश एवं सूर्य की पूजा तथा औषधियों का दान करें।",
      te: "గణపతి మరియు సూర్య ఆరాధన, ఔషధ దానం.",
      ta: "விநாயகர் மற்றும் சூரிய வழிபாடு, மருந்து தானம்."
    }
  },
  1: { // Bharani
    name: { kn: "ಭರಣಿ", en: "Bharani", hi: "भरणी", te: "భరణి", ta: "பரணி" },
    deity: { kn: "ಯಮಧರ್ಮರಾಜ", en: "Yama Dharmaraja", hi: "यमराज", te: "యమధర్మరాజు", ta: "யமதர்மராஜன்" },
    tree: {
      botanicalName: "Phyllanthus emblica",
      kannada: "ಬೆಟ್ಟದ ನೆಲ್ಲಿ (ಆಮ್ಲಾ)",
      english: "Indian Gooseberry (Amla)",
      hindi: "आंवला",
      telugu: "ఉసిరి చెట్టు",
      tamil: "நெல்லி மரம்",
      worshipMethod: {
        kn: "ನೆಲ್ಲಿ ಗಿಡಕ್ಕೆ ನೀರೆರೆಯುವುದು ಪಿತೃ ಋಣ ನಿವಾರಣೆ ಮತ್ತು ಆಂತರಿಕ ಸಂಯಮಕ್ಕೆ ಸಹಕಾರಿ.",
        en: "Pour water on an Amla tree to clear ancestral debts and strengthen moral fortitude.",
        hi: "आंवले के वृक्ष को जल दें एवं यमराज का ध्यान कर धर्म मार्ग पर चलें।",
        te: "ఉసిరి చెట్టుకు నీరు పోయడం ద్వారా పితృ రుణాలు తొలగిపోతాయి.",
        ta: "நெல்லி மரத்திற்கு நீர் ஊற்றுவது முன்னோர்களின் ஆசியை பெற்றுத்தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ यमाय धर्मराजाय नमः । ॐ भं भरणीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಯಮಾಯ ಧರ್ಮರಾಜಾಯ ನಮಃ । ಓಂ ಭಂ ಭರಣೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಧರ್ಮದ ಅಧಿಪತಿಯಾದ ಯಮದೇವನಿಗೆ ನಮಸ್ಕಾರಗಳು. ನನ್ನ ಜೀವಿತದಲ್ಲಿ ಸತ್ಯ ಮತ್ತು ಧರ್ಮ ಸ್ಥಿರವಾಗಿರಲಿ.",
        en: "Salutations to Lord Yama, guardian of cosmic truth and justice.",
        hi: "धर्मराज यम को नमन। जीवन में सत्य और संयम की वृद्धि हो।",
        te: "యమధర్మరాజుకు నమస్కారాలు. జీవితంలో ధర్మం వర్ధిల్లుగాక.",
        ta: "யமதர்மராஜனுக்கு நமஸ்காரங்கள்."
      }
    },
    aradhana: {
      kn: "ಮಹಾದೇವ ಶಿವನ ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು.",
      en: "Chant Maha Mrityunjaya Mantra and offer satvic food to elders.",
      hi: "महामृत्युंजय मंत्र जप एवं वृद्धों को अन्नदान करें।",
      te: "మహామృత్యుంజయ జపం మరియు అన్నదానం.",
      ta: "மகா மிருத்யுஞ்சய ஜபம் மற்றும் அன்னதானம்."
    }
  },
  2: { // Krittika
    name: { kn: "ಕೃತಿಕಾ", en: "Krittika", hi: "कृत्तिका", te: "కృత్తిక", ta: "கார்த்திகை" },
    deity: { kn: "ಅಗ್ನಿದೇವ", en: "Agni Deva", hi: "अग्नि देव", te: "అగ్ని దేవుడు", ta: "அக்னி தேவன்" },
    tree: {
      botanicalName: "Ficus racemosa",
      kannada: "ಅತ್ತಿ ಮರ (ಉದುಂಬರ)",
      english: "Cluster Fig (Audumbara)",
      hindi: "गूलर (उदुम्बर)",
      telugu: "మేడి చెట్టు",
      tamil: "அத்தி மரம்",
      worshipMethod: {
        kn: "ದತ್ತಾತ್ರೇಯ ಪ್ರಿಯವಾದ ಅತ್ತಿ ಮರಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ಪೂಜಿಸುವುದರಿಂದ ತೇಜಸ್ಸು ಹಾಗೂ ಜೀರ್ಣಶಕ್ತಿ ವರ್ಧಿಸುತ್ತದೆ.",
        en: "Circumambulate the sacred Audumbara tree; sanctified by Lord Dattatreya, it elevates digestive fire and focus.",
        hi: "गूलर के वृक्ष की परिक्रमा करें, दत्तात्रेय भगवान की कृपा से ओज बढ़ता है।",
        te: "మేడి చెట్టు చుట్టూ ప్రదక్షిణలు చేయడం వలన తేజస్సు పెరుగుతుంది.",
        ta: "அத்தி மரத்தை வலம் வருவது குருவருளையும் தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अग्नये नमः । ॐ क्रं कृत्तिकानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಅಗ್ನಯೇ ನಮಃ । ಓಂ ಕ್ರಂ ಕೃತಿಕಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪವಿತ್ರ ಅಗ್ನಿದೇವನ ಅನುಗ್ರಹದಿಂದ ಅಂತರಂಗದ ತಮಸ್ಸು ಭಸ್ಮವಾಗಿ ಜ್ಞಾನಪ್ರಕಾಶ ಬೆಳಗಲಿ.",
        en: "May divine Agni burn away all impurities and kindle pristine wisdom.",
        hi: "पवित्र अग्नि देव समस्त विकारों को भस्म कर ज्ञान का प्रकाश फैलाएं।",
        te: "అగ్ని దేవుని కృపతో జ్ఞానం ప్రకాశించుగాక.",
        ta: "அக்னி தேவனின் அருளால் அஞ்ஞானம் நீங்கட்டும்."
      }
    },
    aradhana: {
      kn: "ಸುಬ್ರಹ್ಮಣ್ಯ (ಕಾರ್ತಿಕೇಯ) ಉಪಾಸನೆ ಹಾಗೂ ಗಾಯತ್ರೀ ಜಪ.",
      en: "Worship Lord Kartikeya/Subrahmanya and recite Gayatri Mantra.",
      hi: "भगवान कार्तिकेय की पूजा एवं घी का दीपक जलाएं।",
      te: "సుబ్రహ్మణ్యేశ్వర స్వామి ఆరాధన.",
      ta: "ஸ்ரீ முருகப்பெருமான் வழிபாடு."
    }
  },
  3: { // Rohini
    name: { kn: "ರೋಹಿಣಿ", en: "Rohini", hi: "रोहिणी", te: "రోహిణి", ta: "ரோகிணி" },
    deity: { kn: "ಬ್ರಹ್ಮದೇವ / ಪ್ರಜಾಪತಿ", en: "Brahma / Prajapati", hi: "ब्रह्मा / प्रजापति", te: "బ్రహ్మ దేవుడు", ta: "பிரம்ம தேவன்" },
    tree: {
      botanicalName: "Syzygium cumini",
      kannada: "ನೇರಳೆ ಮರ (ಜಾಮೂನ್)",
      english: "Black Plum (Jamun)",
      hindi: "जामुन",
      telugu: "నేరేడు చెట్టు",
      tamil: "நாவல் மரம்",
      worshipMethod: {
        kn: "ನೇರಳೆ ಮರಕ್ಕೆ ನೀರುಣಿಸುವುದು ಮನಸ್ಸಿನ ಚಾಂಚಲ್ಯವನ್ನು ಶಮನಗೊಳಿಸಿ ಕಲಾತ್ಮಕ ಸೃಜನಶೀಲತೆಯನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Nurturing a Jamun tree stabilizes restless emotions and enhances artistic imagination.",
        hi: "जामुन के वृक्ष को जल दें, मानसिक शांति एवं रचनात्मकता प्राप्त होगी।",
        te: "నేరేడు చెట్టుకు నీరు పోయడం వలన మనశ్శాంతి లభిస్తుంది.",
        ta: "நாவல் மரத்திற்கு நீர் ஊற்றுவது மன அமைதியை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ प्रजापतये नमः । ॐ रों रोहिणीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಪ್ರಜಾಪತಯೇ ನಮಃ । ಓಂ ರೋಂ ರೋಹಿಣೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಸೃಷ್ಟಿಕರ್ತ ಬ್ರಹ್ಮದೇವನ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಸೌಭಾಗ್ಯ ಮತ್ತು ಸಮೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
        en: "May Creator Brahma bestow abundance, auspicious beauty, and domestic prosperity.",
        hi: "सृष्टिकर्ता ब्रह्मा की कृपा से ऐश्वर्य एवं पारिवारिक सुख प्राप्त हो।",
        te: "బ్రహ్మ దేవుని అనుగ్రహంతో సమృద్ధి లభించుగాక.",
        ta: "பிரம்ம தேவனின் அருளால் சுப பலன்கள் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀಕೃಷ್ಣನ ಆರಾಧನೆ ಹಾಗೂ ಹಸುವಿಗೆ ಹಸಿರು ಹುಲ್ಲು ನೀಡುವುದು.",
      en: "Worship Lord Sri Krishna and feed fresh green grass to cows.",
      hi: "भगवान श्री कृष्ण की पूजा एवं गौसेवा करें।",
      te: "శ్రీకృష్ణుని పూజ మరియు గోసేవ.",
      ta: "ஸ்ரீ கிருஷ்ணர் வழிபாடு மற்றும் கோபூஜை."
    }
  },
  4: { // Mrigashira
    name: { kn: "ಮೃಗಶಿರಾ", en: "Mrigashira", hi: "मृगशिरा", te: "మృగశిర", ta: "மிருகசீரிடம்" },
    deity: { kn: "ಸೋಮದೇವ (ಚಂದ್ರ)", en: "Soma Deva (Chandra)", hi: "सोम देव", te: "సోమ దేవుడు", ta: "சந்திர பகவான்" },
    tree: {
      botanicalName: "Acacia catechu",
      kannada: "ಕಾಚು ಮರ (ಖದಿರ)",
      english: "Black Cutch (Khadira)",
      hindi: "खैर (खदिर)",
      telugu: "చండ్ర చెట్టు",
      tamil: "கருங்காலி மரம்",
      worshipMethod: {
        kn: "ಖದಿರ (ಕರಿಂಗಾಲಿ) ವೃಕ್ಷದ ದರ್ಶನ ಮತ್ತು ಪೂಜೆ ಸಂಶೋಧನಾ ಜ್ಞಾನ ಹಾಗೂ ದೃಷ್ಟಿ ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
        en: "Venerating the Khadira tree enhances investigative intellect and mental clarity.",
        hi: "खदिर वृक्ष का दर्शन और पूजन बुद्धि और एकाग्रता बढ़ाता है।",
        te: "చండ్ర చెట్టును పూజించడం వలన ఏకాగ్రత పెరుగుతుంది.",
        ta: "கருங்காலி மர வழிபாடு கவனத்தை ஒருமுகப்படுத்தும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ सोमाय नमः । ॐ मृं मृगशिरानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಸೋಮಾಯ ನಮಃ । ಓಂ ಮೃಂ ಮೃಗಶಿರಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಶಾಂತಿ ಸ್ವರೂಪನಾದ ಚಂದ್ರದೇವನ ಕೃಪೆಯಿಂದ ಅಮೃತಮಯ ಆನಂದ ಮತ್ತು ಆರೋಗ್ಯ ಲಭಿಸಲಿ.",
        en: "May divine Soma bestow sweet peace, radiant health, and peaceful consciousness.",
        hi: "सोम देव की कृपा से शीतलता और उत्तम स्वास्थ्य प्राप्त हो।",
        te: "సోమ దేవుని కృపతో మనశ్శాంతి లభించుగాక.",
        ta: "சந்திரனின் அருளால் அமைதி உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಪಾರ್ವತಿ ಸಮೇತ ಚಂದ್ರಮೌಳೀಶ್ವರ ಶಿವನ ಆರಾಧನೆ.",
      en: "Worship Lord Chandramouleshwara Shiva and Goddess Parvati.",
      hi: "भगवान शिव और माता पार्वती की उपासना करें।",
      te: "చంద్రమౌళీశ్వర స్వామి ఆరాధన.",
      ta: "சந்திரமௌளீஸ்வரர் வழிபாடு."
    }
  },
  5: { // Ardra
    name: { kn: "ಆರ್ದ್ರಾ", en: "Ardra", hi: "आर्द्रा", te: "ఆర్ద్ర", ta: "திருவாதிரை" },
    deity: { kn: "ರುದ್ರದೇವ", en: "Lord Rudra", hi: "रुद्र देव", te: "రుద్రుడు", ta: "ருத்ர பெருமான்" },
    tree: {
      botanicalName: "Aquilaria agallocha",
      kannada: "ಕೃಷ್ಣಾಗರು (ಅಗರು ಮರ)",
      english: "Agarwood (Krishnagaru)",
      hindi: "अगर (कृष्णागरु)",
      telugu: "అగరు చెట్టు",
      tamil: "அகில் மரம்",
      worshipMethod: {
        kn: "ಶುದ್ಧ ಅಗರು ಧೂಪವನ್ನು ಸಂಜೆ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಹಚ್ಚುವುದು ಮಾನಸಿಕ ಶೋಕ ಮತ್ತು ಆಘಾತಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
        en: "Lighting pure Agarwood dhoopa at twilight transmutes deep sorrow and clears astral debris.",
        hi: "संध्या समय अगर की धूप जलाएं, मानसिक संताप नष्ट होगा।",
        te: "అగరు ధూపం వేయడం ద్వారా మానసిక దుఃఖం తొలగుతుంది.",
        ta: "அகில் தூபம் இடுவது மனக்கவலையை நீக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ रुद्राय नमः । ॐ आर्ं आर्द्रानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ರುದ್ರಾಯ ನಮಃ । ಓಂ ಆರ್ಂ ಆರ್ದ್ರಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪ್ರಳಯಂಕರ ಹಾಗೂ ಕರುಣಾಮಯಿಯಾದ ರುದ್ರದೇವನ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಕಷ್ಟಗಳು ಕರಗಿಹೋಗಲಿ.",
        en: "Salutations to compassionate Rudra, who dissolves afflictions and bestows inner transformation.",
        hi: "भगवान रुद्र हमारे समस्त कष्टों का हरण करें।",
        te: "రుద్రుని కృపతో సమస్త బాధలు తొలగుగాక.",
        ta: "ருத்ர பகவானின் அருளால் கஷ்டங்கள் தீரட்டும்."
      }
    },
    aradhana: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಹಾಗೂ ಬಿಲ್ವಾರ್ಚನೆ.",
      en: "Perform Rudrabhisheka with Bilva leaves at Gokarna Mahabaleshwara temple.",
      hi: "गोकर्ण महाबलेश्वर में रुद्राभिषेक कराएं एवं बिल्वपत्र अर्पित करें।",
      te: "రుద్రాభిషేకం మరియు బిల్వార్చన.",
      ta: "ருத்ராபிஷேகம் மற்றும் வில்வார்ச்சனை."
    }
  },
  6: { // Punarvasu
    name: { kn: "ಪುನರ್ವಸು", en: "Punarvasu", hi: "पुनर्वसु", te: "పునర్వసు", ta: "புனர்பூசம்" },
    deity: { kn: "ಅದಿತಿ (ದೇವಮಾತೆ)", en: "Aditi (Cosmic Mother)", hi: "अदिति (देवमाता)", te: "అదితి దేవి", ta: "அதிதி தேவி" },
    tree: {
      botanicalName: "Bambusa arundinacea",
      kannada: "ಬಿದಿರು (ವೇಣು)",
      english: "Bamboo (Venu)",
      hindi: "बांस",
      telugu: "వెదురు చెట్టు",
      tamil: "மூங்கில்",
      worshipMethod: {
        kn: "ಬಿದಿರಿನ ಸಸಿ ನೆಡುವುದು ಅಥವಾ ನೀರೆರೆಯುವುದು ಕಳೆದುಹೋದ ಸಂಪತ್ತು ಮತ್ತು ಮರ್ಯಾದೆಯನ್ನು ಪುನಃ ತಂದುಕೊಡುತ್ತದೆ.",
        en: "Planting or watering bamboo restores lost wealth, optimism, and family lineage blessings.",
        hi: "बांस का पौधा लगाएं, खोया हुआ सम्मान और समृद्धि पुनः प्राप्त होगी।",
        te: "వెదురు చెట్టుకు నీరు పోయడం వలన పూర్వ వైభవం లభిస్తుంది.",
        ta: "மூங்கில் மரத்திற்கு நீர் ஊற்றுவது இழந்த பெருமையை மீட்டெடுக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अदितये नमः । ॐ पुं पुनर्वसुनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಅದಿತಯೇ ನಮಃ । ಓಂ ಪುಂ ಪುನರ್ವಸುನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಅಖಂಡ ದೇವಮಾತೆ ಅದಿತಿಯ ಕೃಪೆಯಿಂದ ಜೀವನದಲ್ಲಿ ಪುನಶ್ಚೇತನ ಹಾಗೂ ಸಕಲ ಸಿದ್ಧಿಗಳು ಲಭಿಸಲಿ.",
        en: "May divine Mother Aditi restore lost opportunities and shower limitless grace.",
        hi: "देवमाता अदिति की कृपा से जीवन में पुनः समृद्धि का संचार हो।",
        te: "అదితి దేవి అనుగ్రహంతో సర్వ కార్యాలు సిద్ధించుగాక.",
        ta: "அதிதி தேவியின் அருளால் சுபிட்சம் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀರಾಮ ತಾರಕ ಮಂತ್ರ ಜಪ ಹಾಗೂ ಶ್ರೀರಾಮ ರಕ್ಷಾ ಸ್ತೋತ್ರ ಪಠಣ.",
      en: "Chant Sri Rama Taraka Mantra and recite Sri Rama Raksha Stotra.",
      hi: "श्री राम रक्षा स्तोत्र का पाठ एवं राम नाम जप करें।",
      te: "శ్రీరామ రక్షా స్తోత్ర పఠనం.",
      ta: "ஸ்ரீ ராம ரக்ஷா ஸ்தோத்திரம் பாராயணம்."
    }
  },
  7: { // Pushya
    name: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पुष्य", te: "పుష్యమి", ta: "பூசம்" },
    deity: { kn: "ಬೃಹಸ್ಪತಿ (ದೇವಗುರು)", en: "Brihaspati (Deva Guru)", hi: "बृहस्पति", te: "బృహస్పతి", ta: "குரு பகவான்" },
    tree: {
      botanicalName: "Ficus religiosa",
      kannada: "ಅಶ್ವತ್ಥ ವೃಕ್ಷ (ಪೀಪಲ್)",
      english: "Sacred Fig (Peepal)",
      hindi: "पीपल",
      telugu: "రావి చెట్టు",
      tamil: "அரச மரம்",
      worshipMethod: {
        kn: "ಗುರುವಾರ ಅಥವಾ ಶನಿವಾರ ಅಶ್ವತ್ಥ ವೃಕ್ಷಕ್ಕೆ ೭ ಅಥವಾ ೨೧ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ ನೀರನ್ನು ಅರ್ಪಿಸುವುದು ಅತ್ಯಂತ ಶುಭದಾಯಕ.",
        en: "Circumambulate the sacred Peepal tree 7 or 21 times and offer water on Thursdays for spiritual wisdom.",
        hi: "गुरुवार को पीपल वृक्ष की परिक्रमा कर जल अर्पित करें, गुरु कृपा प्राप्त होगी।",
        te: "రావి చెట్టుకు ప్రదక్షిణలు చేసి నీరు పోయండి.",
        ta: "அரச மரத்தை வலம் வந்து வணங்குவது குருவின் அருளை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ बृहस्पतये नमः । ॐ पुं पुष्यनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಬೃಹಸ್ಪತಯೇ ನಮಃ । ಓಂ ಪುಂ ಪುಷ್ಯನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಜ್ಞಾನನಿಧಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಗ್ರಹದಿಂದ ಸದ್ಬುದ್ಧಿ ಮತ್ತು ಸಕಲ ಧರ್ಮಕಾರ್ಯಗಳು ಸಿದ್ಧಿಸಲಿ.",
        en: "May divine preceptor Brihaspati illuminate intellect and grant dharmic prosperity.",
        hi: "देवगुरु बृहस्पति की कृपा से सद्बुद्धि और ज्ञान की प्राप्ति हो।",
        te: "బృహస్పతి కృపతో జ్ఞానం మరియు సంపద లభించుగాక.",
        ta: "குரு பகவானின் அருளால் ஞானமும் செல்வமும் பெருகட்டும்."
      }
    },
    aradhana: {
      kn: "ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಆರಾಧನೆ ಹಾಗೂ ಹಳದಿ ಬಣ್ಣದ ಹೂವುಗಳಿಂದ ಪೂಜೆ.",
      en: "Worship Lord Dakshinamurthy and offer yellow flowers on Thursdays.",
      hi: "भगवान दक्षिणामूर्ति की पूजा एवं ब्राह्मणों को भोजन कराएं।",
      te: "దక్షిణామూర్తి పూజ.",
      ta: "தட்சிணாமூர்த்தி வழிபாடு."
    }
  },
  8: { // Ashlesha
    name: { kn: "ಆಶ್ಲೇಷಾ", en: "Ashlesha", hi: "आश्लेषा", te: "ఆశ్లేష", ta: "ஆயில்யம்" },
    deity: { kn: "ನಾಗರಾಜ (ಸರ್ಪ ದೇವರು)", en: "Sarpa / Nagaraja", hi: "नागराज", te: "నాగరాజు", ta: "நாகராஜன்" },
    tree: {
      botanicalName: "Calophyllum inophyllum",
      kannada: "ಸುರಹೊನ್ನೆ (ನಾಗಕೇಸರ)",
      english: "Alexandrian Laurel (Nagakesara)",
      hindi: "नागकेसर",
      telugu: "పొన్న చెట్టు",
      tamil: "புன்னை மரம்",
      worshipMethod: {
        kn: "ಸುರಹೊನ್ನೆ ಮರಕ್ಕೆ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ಹಾಗೂ ಸರ್ಪ ದೋಷ ನಿವಾರಣೆಗಾಗಿ ನಾಗದೇವರಿಗೆ ಹಾಲಿನ ತರ್ಪಣ ನೀಡುವುದು ಉತ್ತಮ.",
        en: "Honor the Nagakesara tree and offer milk abhisheka to consecrated serpent stones to dispel Sarpa Dosha.",
        hi: "नागकेसर के वृक्ष की सेवा करें एवं नाग देवता को दूध अर्पित करें।",
        te: "పొన్న చెట్టును పూజించి నాగదేవతకు పాలు సమర్పించండి.",
        ta: "புன்னை மரத்தை வழிபட்டு நாகருக்கு பால் அபிஷேகம் செய்யவும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ सर्पेभ्यो नमः । ॐ ಆಶ್ಲೇಷಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಸರ್ಪೇಭ್ಯೋ ನಮಃ । ಓಂ ಆಂ ಆಶ್ಲೇಷಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಅನಂತ, ವಾಸುಕಿ ಮುಂತಾದ ಪವಿತ್ರ ನಾಗದೇವತೆಗಳ ಅನುಗ್ರಹದಿಂದ ಸರ್ಪದೋಷ ಮತ್ತು ವಿಷಭಯ ನಿವಾರಣೆಯಾಗಲಿ.",
        en: "May divine serpents Ananta and Vasuki dissolve all karmic toxicity and protect the lineage.",
        hi: "पवित्र नाग देवता समस्त विष और सर्प दोष का निवारण करें।",
        te: "నాగదేవతల అనుగ్రహంతో సర్పదోషాలు తొలగుగాక.",
        ta: "நாகராஜனின் அருளால் சர்ப்ப தோஷம் நீங்கட்டும்."
      }
    },
    aradhana: {
      kn: "ಗೋಕರ್ಣ ಅಥವಾ ಕುಕ್ಕೆ ಸುಬ್ರಹ್ಮಣ್ಯದಲ್ಲಿ ಸರ್ಪ ಸಂಸ್ಕಾರ / ಆಶ್ಲೇಷಾ ಬಲಿ ಪೂಜೆ.",
      en: "Perform Ashlesha Bali or Sarpa Samskara at Gokarna or Kukke.",
      hi: "गोकर्ण में सर्प संस्कार अथवा आश्लेषा बलि पूजा कराएं।",
      te: "ఆశ్లేష బలి లేదా సర్ప సంస్కార పూజ.",
      ta: "ஆயில்ய பலி அல்லது சர்ப்ப சாந்தி பூஜை."
    }
  },
  9: { // Magha
    name: { kn: "ಮಘಾ", en: "Magha", hi: "मघा", te: "మఘ", ta: "மகம்" },
    deity: { kn: "ಪಿತೃ ದೇವತೆಗಳು", en: "Pitris (Ancestral Deities)", hi: "पितृगण", te: "పితృ దేవతలు", ta: "பித்ருக்கள்" },
    tree: {
      botanicalName: "Ficus benghalensis",
      kannada: "ಆಲದ ಮರ (ವಟವೃಕ್ಷ)",
      english: "Banyan Tree (Vata)",
      hindi: "बरगद (वटवृक्ष)",
      telugu: "మర్రి చెట్టు",
      tamil: "ஆலமரம்",
      worshipMethod: {
        kn: "ಆಲದ ಮರಕ್ಕೆ ನೀರೆರೆಯುವುದು ಪಿತೃಗಳಿಗೆ ತೃಪ್ತಿಯನ್ನು ನೀಡಿ ವಂಶಾಭಿವೃದ್ಧಿಗೆ ದಾರಿಮಾಡಿಕೊಡುತ್ತದೆ.",
        en: "Water the sacred Banyan tree on Amavasya days to bring peace to ancestors and safeguard lineage.",
        hi: "अमावस्या को बरगद के वृक्ष को जल दें, पितरों की तृप्ति होगी।",
        te: "మర్రి చెట్టుకు నీరు పోయడం వలన పితృ దేవతలు తృప్తి చెందుతారు.",
        ta: "ஆலமரத்திற்கு நீர் ஊற்றுவது முன்னோர்களை திருப்திப்படுத்தும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ पितृभ्यो नमः । ॐ मं मघानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಪಿತೃಭ್ಯೋ ನಮಃ । ಓಂ ಮಂ ಮಘಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪವಿತ್ರ ಪಿತೃ ದೇವತೆಗಳಿಗೆ ಪ್ರಣಾಮಗಳು. ತಮ್ಮ ಆಶೀರ್ವಾದದಿಂದ ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ ಮತ್ತು ಶ್ರೇಯಸ್ಸು ನೆಲೆಸಲಿ.",
        en: "Salutations to revered ancestral Pitris; may their blessings bring harmony and protection.",
        hi: "पितृ देवों को नमन। आपके आशीर्वाद से कुल में सुख-शांति बनी रहे।",
        te: "పితృ దేవతలకు ప్రణామాలు.",
        ta: "பித்ருக்களுக்கு நமஸ்காரங்கள்."
      }
    },
    aradhana: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ, ತರ್ಪಣ ಹಾಗೂ ಬ್ರಾಹ್ಮಣ ಭೋಜನ.",
      en: "Offer Moksha Narayana Bali and Tarpana at holy Gokarna Kshetra.",
      hi: "गोकर्ण में मोक्ष नारायण बलि एवं तर्पण कराएं।",
      te: "మోక్ష నారాయణ బలి మరియు పితృ తర్పణం.",
      ta: "மோக்ஷ நாராயண பலி மற்றும் பித்ரு தர்ப்பணம்."
    }
  },
  10: { // Purva Phalguni
    name: { kn: "ಪೂರ್ವ ಫಲ್ಗುಣಿ", en: "Purva Phalguni", hi: "पूर्वा फाल्गुनी", te: "పూర్వ ఫల్గుణి", ta: "பூரம்" },
    deity: { kn: "ಭಗ ದೇವತೆ", en: "Bhaga (God of Prosperity)", hi: "भग देवता", te: "భగ దేవుడు", ta: "பக தேவன்" },
    tree: {
      botanicalName: "Butea monosperma",
      kannada: "ಮುತ್ತುಗ (ಪಲಾಶ ಮರ)",
      english: "Flame of the Forest (Palasha)",
      hindi: "पलाश (ढाक)",
      telugu: "మోదుగ చెట్టు",
      tamil: "பலாச மரம்",
      worshipMethod: {
        kn: "ಮುತ್ತುಗದ ಎಲೆ ಮತ್ತು ಹೂವುಗಳನ್ನು ಈಶ್ವರನಿಗೆ ಸಮರ್ಪಿಸುವುದು ದಾಂಪತ್ಯ ಸುಖ ಮತ್ತು ಆಕರ್ಷಣಾ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
        en: "Offer Palasha flowers to Lord Shiva to harmonize marital life and attract auspicious prosperity.",
        hi: "पलाश के पुष्प भगवान शिव को अर्पित करें, दांपत्य जीवन सुखमय होगा।",
        te: "మోదుగ పువ్వులతో శివపూజ చేయడం వలన వైవాహిక సుఖం లభిస్తుంది.",
        ta: "பலாச மலர்களால் சிவனை வழிபட திருமண வாழ்வு சிறக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ भगाय नमः । ॐ फं पूर्वफल्गुनीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಭಗಾಯ ನಮಃ । ಓಂ ಫಂ ಪೂರ್ವಫಲ್ಗುನೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಭಾಗ್ಯದಾತ ಭಗ ದೇವತೆಯ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಸೌಖ್ಯ, ದಾಂಪತ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಸಂಪತ್ತು ಲಭಿಸಲಿ.",
        en: "May divine Bhaga bestow marital bliss, prosperity, and magnetic charisma.",
        hi: "भग देवता की कृपा से दांपत्य प्रेम और भौतिक समृद्धि प्राप्त हो।",
        te: "భగ దేవుని కృపతో సౌభాగ్యం లభించుగాక.",
        ta: "பக தேவனின் அருளால் சகல சௌபாக்கியங்களும் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪೂಜೆ ಹಾಗೂ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ.",
      en: "Worship Lakshmi Narayana and chant Kanakadhara Stotra.",
      hi: "माता लक्ष्मी की पूजा एवं कनकधारा स्तोत्र का पाठ करें।",
      te: "లక్ష్మీ నారాయణ పూజ మరియు కనకధారా స్తోత్రం.",
      ta: "லட்சுமி நாராயண பூஜை மற்றும் கனகதாரா ஸ்தோத்திரம்."
    }
  },
  11: { // Uttara Phalguni
    name: { kn: "ಉತ್ತರ ಫಲ್ಗುಣಿ", en: "Uttara Phalguni", hi: "उत्तरा फाल्गुनी", te: "ఉత్తర ఫల్గుణి", ta: "உத்திரம்" },
    deity: { kn: "ಅರ್ಯಮಾ", en: "Aryama (God of Patronage & Contracts)", hi: "अर्यमा", te: "అర్యముడు", ta: "அரியமா" },
    tree: {
      botanicalName: "Ficus microcarpa / Plaksha",
      kannada: "ಪ್ಲಕ್ಷ (ಜುಬ್ಬಿ ಮರ / ಬೆಟ್ಟದ ನೆಲ್ಲಿ)",
      english: "Indian Laurel (Plaksha)",
      hindi: "पाकड़ (प्लक्ष)",
      telugu: "జువ్వి చెట్టు",
      tamil: "இத்தி மரம்",
      worshipMethod: {
        kn: "ಜುಬ್ಬಿ ಅಥವಾ ಪ್ಲಕ್ಷ ಮರಕ್ಕೆ ನೀರೆರೆಯುವುದು ಸಾಮಾಜಿಕ ಗೌರವ, ಸ್ನೇಹ ಮತ್ತು ಅಧಿಕಾರ ಬಲವನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Water the Plaksha tree for social goodwill, lasting alliances, and honorable leadership.",
        hi: "पाकड़ के वृक्ष को जल दें, मित्रता और समाज में मान-सम्मान बढ़ेगा।",
        te: "జువ్వి చెట్టుకు నీరు పోయడం వలన గౌరవం పెరుగుతుంది.",
        ta: "இத்தி மரத்திற்கு நீர் ஊற்றுவது சமூக மரியாதையை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अर्यमणे नमः । ॐ उं उत्तरफल्गुनीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಅರ್ಯಮಣೇ ನಮಃ । ಓಂ ಉಂ ಉತ್ತರಫಲ್ಗುನೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಉದಾರಹೃದಯಿ ಅರ್ಯಮ ದೇವತೆಯ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವ ಮತ್ತು ಧರ್ಮನಿಷ್ಠೆ ಹೆಚ್ಚಲಿ.",
        en: "May benevolent Aryama bestow honored status and righteous partnerships.",
        hi: "अर्यमा देव की कृपा से प्रतिष्ठा एवं उत्तम सहयोगियों की प्राप्ति हो।",
        te: "అర్యముని కృపతో సమాజంలో గౌరవం లభించుగాక.",
        ta: "அரியமாவின் அருளால் நன்மதிப்பு பெருகட்டும்."
      }
    },
    aradhana: {
      kn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ.",
      en: "Perform Surya Namaskara and recite Aditya Hrudayam.",
      hi: "सूर्य नमस्कार करें एवं आदित्य हृदय स्तोत्र पढ़ें।",
      te: "సూర్య నమస్కారాలు మరియు ఆదిత్య హృదయ స్తోత్రం.",
      ta: "சூரிய நமஸ்காரம் மற்றும் ஆதித்ய ஹ்ருதயம்."
    }
  },
  12: { // Hasta
    name: { kn: "ಹಸ್ತಾ", en: "Hasta", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்" },
    deity: { kn: "ಸವಿತೃ (ಸೂರ್ಯದೇವ)", en: "Savitru (Creative Solar Force)", hi: "सवितृ", te: "సవితృ దేవుడు", ta: "சவிதா" },
    tree: {
      botanicalName: "Jasminum auriculatum",
      kannada: "ಜಾಜಿ ಮಲ್ಲಿಗೆ (ಜೂಹಿ)",
      english: "Juhi Jasmine (Jaji)",
      hindi: "जूही",
      telugu: "జాజి చెట్టు",
      tamil: "ஜாதி மல்லி",
      worshipMethod: {
        kn: "ಜಾಜಿ ಅಥವಾ ಮಲ್ಲಿಗೆ ಹೂವಿನ ಗಿಡಕ್ಕೆ ನೀರೆರೆದು, ಹೂವುಗಳನ್ನು ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಪಿಸುವುದು ಕರಕೌಶಲವನ್ನು ಸಿದ್ಧಿಸುತ್ತದೆ.",
        en: "Nurture Jasmine plants and offer fragrant blossoms to the Sun for craftsmanship mastery and healing hands.",
        hi: "जूही के पौधे को सींचें एवं सूर्य को सुगंधित पुष्प अर्पित करें।",
        te: "జాజి పూలతో సూర్యపూజ చేయడం వలన నైపుణ్యం పెరుగుతుంది.",
        ta: "ஜாதி மல்லிகை மலர்களால் வழிபட கைத்தொழில் சிறக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ सवित्रे नमः । ॐ हं हस्तनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಸವಿತ್ರೇ ನಮಃ । ಓಂ ಹಂ ಹಸ್ತನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪ್ರೇರಕ ಶಕ್ತಿಯಾದ ಸವಿತೃ ದೇವನ ಕೃಪೆಯಿಂದ ಬುದ್ಧಿ ತೇಜಸ್ಸು ಹಾಗೂ ಕರಕೌಶಲ ಸಿದ್ಧಿಸಲಿ.",
        en: "May divine Savitru awaken brilliant intellect and skillful mastery.",
        hi: "सविता देव की कृपा से बुद्धि और कौशल में निपुणता आए।",
        te: "సవితృ దేవుని కృపతో బుద్ధి వికసించుగాక.",
        ta: "சவிதா தேவனின் அருளால் புத்தி கூர்மையடையட்டும்."
      }
    },
    aradhana: {
      kn: "ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ ಜಪ ಹಾಗೂ ಸೂರ್ಯಾರ್ಘ್ಯ.",
      en: "Chant Gayatri Mantra and offer morning Surya Arghya.",
      hi: "गायत्री मंत्र का नित्य जप एवं सूर्य को अर्घ्य दें।",
      te: "గాయత్రీ మంత్ర జపం మరియు సూర్యార్ఘ్యం.",
      ta: "காயத்ரி மந்திர ஜபம் மற்றும் சூரிய அர்க்கியம்."
    }
  },
  13: { // Chitra
    name: { kn: "ಚಿತ್ರಾ", en: "Chitra", hi: "चित्रा", te: "చిత్త", ta: "சித்திரை" },
    deity: { kn: "ತ್ವಷ್ಟಾ (ವಿಶ್ವಕರ್ಮ)", en: "Tvashtar / Vishvakarma", hi: "त्वष्टा / विश्वकर्मा", te: "త్వష్ట / విశ్వకర్మ", ta: "விஸ்வகர்மா" },
    tree: {
      botanicalName: "Aegle marmelos",
      kannada: "ಬಿಲ್ವ ಪತ್ರೆ ಮರ (ಬೇಲ್)",
      english: "Bael Tree (Bilva)",
      hindi: "बेलपत्र (बिल्व)",
      telugu: "మారేడు చెట్టు",
      tamil: "வில்வ மரம்",
      worshipMethod: {
        kn: "ಪವಿತ್ರ ಬಿಲ್ವ ವೃಕ್ಷಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ, ೩ ಎಲೆಯ ಬಿಲ್ವಪತ್ರೆಯನ್ನು ಶಿವನಿಗೆ ಅರ್ಪಿಸುವುದು ಸಕಲ ಪಾಪನಾಶಕ ಹಾಗೂ ಕಲಾತ್ಮಕ ವಿಜಯಪ್ರದ.",
        en: "Circumambulate the sacred Bilva tree and offer fresh trifoliate leaves to Shiva for architectural mastery and deep peace.",
        hi: "बिल्व वृक्ष की परिक्रमा करें और भगवान शिव को त्रिशूल रूपी बेलपत्र चढ़ाएं।",
        te: "మారేడు చెట్టుకు ప్రదక్షిణలు చేసి శివునికి మారేడు దళాలు సమర్పించండి.",
        ta: "வில்வ மரத்தை வலம் வந்து சிவபெருமானுக்கு வில்வ இலை சாற்றவும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ विश्वकर्मणे नमः । ॐ चं चित्रानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ವಿಶ್ವಕರ್ಮಣೇ ನಮಃ । ಓಂ ಚಂ ಚಿತ್ರಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಅದ್ಭುತ ಸೃಷ್ಟಿಕರ್ತ ವಿಶ್ವಕರ್ಮನ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಕಲಾ, ವಾಸ್ತು ಮತ್ತು ವಾಹನ ಸೌಭಾಗ್ಯ ಲಭಿಸಲಿ.",
        en: "May divine architect Vishvakarma bless your endeavors with beauty, structure, and prosperity.",
        hi: "देव शिल्पी विश्वकर्मा की कृपा से कला, शिल्प और गृह सुख में वृद्धि हो।",
        te: "విశ్వకర్మ అనుగ్రహంతో సకల కళలు మరియు గృహ సౌభాగ్యం లభించుగాక.",
        ta: "விஸ்வகர்மாவின் அருளால் கட்டிடக்கலை மற்றும் செல்வ வளம் பெருகட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀ ಮಹಾದೇವನಿಗೆ ಬಿಲ್ವಾರ್ಚನೆ ಹಾಗೂ ಲಲಿತಾ ಸಹಸ್ರನಾಮ ಪಠಣ.",
      en: "Offer Bilva archana to Lord Shiva and recite Lalita Sahasranama.",
      hi: "भगवान शिव पर बिल्वार्चन एवं ललिता सहस्रनाम का पाठ करें।",
      te: "శివునికి బిల్వార్చన మరియు లలితా సహస్రనామ పఠనం.",
      ta: "சிவனுக்கு வில்வார்ச்சனை மற்றும் லலிதா சகஸ்ரநாம பாராயணம்."
    }
  },
  14: { // Swati
    name: { kn: "ಸ್ವಾತಿ", en: "Swati", hi: "स्वाति", te: "స్వాతి", ta: "சுவாதி" },
    deity: { kn: "ವಾಯುದೇವ (ಪವನ)", en: "Vayu Deva (Wind God)", hi: "वायु देव", te: "వాయు దేవుడు", ta: "வாயு பகவான்" },
    tree: {
      botanicalName: "Terminalia arjuna",
      kannada: "ಮತ್ತಿ ಮರ (ಅರ್ಜುನ ವೃಕ್ಷ)",
      english: "Arjuna Tree",
      hindi: "अर्जुन वृक्ष",
      telugu: "మద్ది చెట్టు",
      tamil: "மருத மரம்",
      worshipMethod: {
        kn: "ಅರ್ಜುನ ವೃಕ್ಷಕ್ಕೆ ನೀರೆರೆಯುವುದು ಹೃದಯದ ಆರೋಗ್ಯ ಹಾಗೂ ಸ್ವತಂತ್ರ ಚಿಂತನಾ ಶಕ್ತಿಯನ್ನು ಬಲಪಡಿಸುತ್ತದೆ.",
        en: "Water the Arjuna tree to protect cardiovascular health and foster independent wisdom.",
        hi: "अर्जुन के वृक्ष को जल दें, हृदय को बल और मन को स्वतंत्रता प्राप्त होगी।",
        te: "మద్ది చెట్టుకు నీరు పోయడం వలన గుండె ఆరోగ్యం మరియు ధైర్యం లభిస్తుంది.",
        ta: "மருத மரத்திற்கு நீர் ஊற்றுவது இதய ஆரோக்கியத்தையும் தைரியத்தையும் தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ वायवे नमः । ॐ स्वां स्वातीनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ವಾಯವೇ ನಮಃ । ಓಂ ಸ್ವಾಂ ಸ್ವಾತೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪ್ರಾಣಶಕ್ತಿಯ ಅಧಿಪತಿಯಾದ ವಾಯುದೇವನ ಕೃಪೆಯಿಂದ ದೇಹದಲ್ಲಿ ಚೈತನ್ಯ ಮತ್ತು ಸ್ವಾತಂತ್ರ್ಯ ತುಂಬಲಿ.",
        en: "May divine Vayu animate your life with vital prana, freedom, and dynamic balance.",
        hi: "प्राण स्वरूप वायु देव की कृपा से जीवन में निरंतर गति और आरोग्य बना रहे।",
        te: "వాయు దేవుని కృపతో ప్రాణశక్తి వర్ధిల్లుగాక.",
        ta: "வாயு பகவானின் அருளால் பிராண சக்தி பெருகட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ಹನುಮಂತನ ಆರಾಧನೆ ಹಾಗೂ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ.",
      en: "Worship Lord Hanuman and chant Hanuman Chalisa.",
      hi: "संकटमोचन हनुमान जी की पूजा एवं हनुमान चालीसा पढ़ें।",
      te: "హనుమంతుని ఆరాధన మరియు హనుమాన్ చాలీసా.",
      ta: "ஆஞ்சநேயர் வழிபாடு மற்றும் ஹனுமான் சாலிசா."
    }
  },
  15: { // Vishakha
    name: { kn: "ವಿಶಾಖಾ", en: "Vishakha", hi: "विशाखा", te: "విశాఖ", ta: "விசாகம்" },
    deity: { kn: "ಇಂದ್ರಾಗ್ರಿ (ಇಂದ್ರ & ಅಗ್ನಿ)", en: "Indragni (Indra & Agni)", hi: "इन्द्राग्नि", te: "ఇంద్రాగ్నులు", ta: "இந்திராக்னி" },
    tree: {
      botanicalName: "Limonia acidissima",
      kannada: "ಬೇಲದ ಮರ (ವಿಕಂಕತ)",
      english: "Wood Apple (Kaitha)",
      hindi: "कैथा (कपित्थ)",
      telugu: "వెలగ చెట్టు",
      tamil: "விளா மரம்",
      worshipMethod: {
        kn: "ಬೇಲದ ಮರವನ್ನು ಪೂಜಿಸುವುದು ಗುರಿ ಸಾಧನೆಗೆ ಅಗತ್ಯವಾದ ಛಲ ಮತ್ತು ಏಕಾಗ್ರತೆಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
        en: "Venerate the Wood Apple tree to ignite unyielding willpower and triumph over challenges.",
        hi: "कैथा के वृक्ष को जल दें, संकल्प शक्ति और विजय की प्राप्ति होगी।",
        te: "వెలగ చెట్టును పూజించడం వలన సంకల్ప బలం పెరుగుతుంది.",
        ta: "விளா மரத்தை வணங்குவது வெற்றி தரும் உறுதியை கொடுக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ इन्द्राग्निभ्यां नमः । ॐ विं विशाखानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಇಂದ್ರಾಗ್ನಿಭ್ಯಾಂ ನಮಃ । ಓಂ ವಿಂ ವಿಶಾಖಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಇಂದ್ರ ಹಾಗೂ ಅಗ್ನಿ ದೇವತೆಗಳ ಸಂಯುಕ್ತ ಬಲದಿಂದ ಸಕಲ ಸ್ಪರ್ಧೆಗಳಲ್ಲಿ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
        en: "May the combined might of Indra and Agni forge triumphant focus and victory.",
        hi: "इंद्र और अग्नि देव की संयुक्त शक्ति से सभी कार्यों में सफलता मिले।",
        te: "ఇంద్ర మరియు అగ్ని దేవతల బలంతో విజయం లభించుగాక.",
        ta: "இந்திரன் மற்றும் அக்னியின் பலத்தால் வெற்றி உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಷಣ್ಮುಖ ಆರಾಧನೆ ಹಾಗೂ ಕಂದ ಷಷ್ಠಿ ಕವಚ.",
      en: "Worship Lord Shanmukha Subrahmanya and chant Skanda Sashti Kavacham.",
      hi: "भगवान कार्तिकेय (मुरुगन) की उपासना करें।",
      te: "సుబ్రహ్మణ్యేశ్వర స్వామి ఆరాధన.",
      ta: "ஸ்ரீ முருகப்பெருமான் வழிபாடு மற்றும் கந்த சஷ்டி கவசம்."
    }
  },
  16: { // Anuradha
    name: { kn: "ಅನುರಾಧಾ", en: "Anuradha", hi: "अनुराधा", te: "అనూరాధ", ta: "அனுஷம்" },
    deity: { kn: "ಮಿತ್ರದೇವ (ಸೌಹಾರ್ದದ ದೇವತೆ)", en: "Mitra Deva (God of Friendship & Devotion)", hi: "मित्र देव", te: "మిత్ర దేవుడు", ta: "மித்ர தேவன்" },
    tree: {
      botanicalName: "Mimusops elengi",
      kannada: "ಬಕುಳ / ರಂಜಲು ಮರ",
      english: "Spanish Cherry (Bakula)",
      hindi: "मौलश्री (बकुल)",
      telugu: "పొగడ చెట్టు",
      tamil: "மகிழ மரம்",
      worshipMethod: {
        kn: "ಸುವಾಸನಾಯುಕ್ತ ಬಕುಳ ಹೂವುಗಳನ್ನು ಶಿವನಿಗೆ ಅರ್ಪಿಸುವುದು ಭಕ್ತಿ, ಸ್ನೇಹ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯವನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Offer fragrant Bakula blossoms to Lord Shiva to nurture true friendships and spiritual devotion.",
        hi: "मौलश्री के पुष्प शिवजी को चढ़ाएं, निष्कपट मित्रता और शांति मिलेगी।",
        te: "పొగడ పూలతో శివపూజ చేయడం వలన మైత్రి వర్ధిల్లుతుంది.",
        ta: "மகிழ மலர்களால் சிவனை வழிபட உண்மையான நட்பு கிடைக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ मित्राय नमः । ॐ अं अनुराधानक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ಮಿತ್ರಾಯ ನಮಃ । ಓಂ ಅಂ ಅನುರಾಧಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಸ್ನೇಹಮಯಿ ಮಿತ್ರದೇವನ ಅನುಗ್ರಹದಿಂದ ಸಕಲರೊಡನೆ ಸೌಹಾರ್ದತೆ ಮತ್ತು ದೈವಭಕ್ತಿ ಬೆಳೆಯಲಿ.",
        en: "May benevolent Mitra foster universal goodwill, deep devotion, and serene endurance.",
        hi: "मित्र देव की कृपा से सभी के साथ सौहार्द और ईश्वर भक्ति प्राप्त हो।",
        te: "మిత్ర దేవుని కృపతో సద్భావన వర్ధిల్లుగాక.",
        ta: "மித்ர தேவனின் அருளால் நல்லுறவு மலரட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ರಾಧಾ-ಕೃಷ್ಣರ ಆರಾಧನೆ ಹಾಗೂ ಮಧುರಾಷ್ಟಕಂ ಪಠಣ.",
      en: "Worship Radha Krishna and chant Madhurashtakam.",
      hi: "राधा-कृष्ण की पूजा एवं मधुराष्टकम् का पाठ करें।",
      te: "రాధాకృష్ణుల పూజ మరియు మధురాష్టకం.",
      ta: "ராதாகிருஷ்ணன் வழிபாடு மற்றும் மதுராஷ்டகம்."
    }
  },
  17: { // Jyeshtha
    name: { kn: "ಜ್ಯೇಷ್ಠಾ", en: "Jyeshtha", hi: "ज्येष्ठा", te: "జ్యేష్ఠ", ta: "கேட்டை" },
    deity: { kn: "ದೇವೇಂದ್ರ (ಇಂದ್ರ)", en: "Lord Indra (King of Gods)", hi: "इंद्र देव", te: "ఇంద్రుడు", ta: "இந்திரன்" },
    tree: {
      botanicalName: "Bombax ceiba",
      kannada: "ಬೂರಗದ ಮರ (ಶಾಲ್ಮಲಿ)",
      english: "Silk Cotton Tree (Shalmali)",
      hindi: "सेमल (शाल्मली)",
      telugu: "బూరుగు చెట్టు",
      tamil: "இலவு மரம்",
      worshipMethod: {
        kn: "ಶಾಲ್ಮಲಿ ಮರಕ್ಕೆ ನೀರೆರೆಯುವುದು ಅಹಂಕಾರವನ್ನು ನಿಯಂತ್ರಿಸಿ ನಾಯಕತ್ವ ಗುಣ ಮತ್ತು ಧೈರ್ಯವನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ.",
        en: "Water the Shalmali tree to channel commanding leadership without egotistical friction.",
        hi: "सेमल के वृक्ष को जल दें, नेतृत्व क्षमता बढ़ेगी और अहंकार शांत होगा।",
        te: "బూరుగు చెట్టుకు నీరు పోయడం వలన నాయకత్వ లక్షణాలు పెరుగుతాయి.",
        ta: "இலவு மரத்திற்கு நீர் ஊற்றுவது தலைமை பண்பை வளர்க்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ इन्द्राय नमः । ॐ ಜ್ಯೇಷ್ಠಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಇಂದ್ರಾಯ ನಮಃ । ಓಂ ಜ್ಯೇಂ ಜ್ಯೇಷ್ಠಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಸುರಪತಿ ಇಂದ್ರನ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಅಧಿಕಾರ, ಕೀರ್ತಿ ಹಾಗೂ ರಕ್ಷಣೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
        en: "May Devaraja Indra protect your status, bestow authoritative valor, and dispel rivalries.",
        hi: "देवराज इंद्र की कृपा से मान-सम्मान और विजय प्राप्त हो।",
        te: "ఇంద్రుని అనుగ్రహంతో కీర్తి మరియు రక్షణ లభించుగాక.",
        ta: "இந்திரனின் அருளால் அந்தஸ்தும் வெற்றியும் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿ ಪೂಜೆ ಹಾಗೂ ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ.",
      en: "Worship Gokarna Maha Ganapati and chant Ganesha Atharvashirsha.",
      hi: "गोकर्ण महागणपति की पूजा एवं गणपति अथर्वशीर्ष का पाठ करें।",
      te: "మహా గణపతి పూజ మరియు అథర్వశీర్ష పఠనం.",
      ta: "மகா கணபதி பூஜை மற்றும் கணபதி அதர்வசீரிடம்."
    }
  },
  18: { // Mula
    name: { kn: "ಮೂಲಾ", en: "Mula", hi: "मूल", te: "మూల", ta: "மூலம்" },
    deity: { kn: "ನಿರೃತಿ (ಮೂಲ ದೇವತೆ)", en: "Nirriti (Goddess of Dissolution)", hi: "निरृति", te: "నిరృతి", ta: "நிருருதி" },
    tree: {
      botanicalName: "Shorea robusta",
      kannada: "ರಾಳದ ಮರ / ಸರ್ಜ (ಅಂಜನ)",
      english: "Sal Tree (Sarja)",
      hindi: "शाल (राल का वृक्ष)",
      telugu: "గుగ్గిలం చెట్టు",
      tamil: "ஆச்சா மரம்",
      worshipMethod: {
        kn: "ಸರ್ಜ (ರಾಳ) ಮರದ ಸಾನ್ನಿಧ್ಯದಲ್ಲಿ ಧ್ಯಾನಿಸುವುದು ಹಾಗೂ ಧೂಪ ಹಾಕುವುದು ಮೂಲ ನಕ್ಷತ್ರದ ತೀವ್ರ ದೋಷಗಳನ್ನು ಭಸ್ಮ ಮಾಡುತ್ತದೆ.",
        en: "Meditate near a Sal tree and burn pure natural dammar resin (rala) to dissolve deep ancestral karmas.",
        hi: "शाल वृक्ष के पास बैठकर ध्यान करें एवं राल की धूप दें।",
        te: "గుగ్గిలం ధూపం వేయడం ద్వారా మూలా నక్షత్ర దోషాలు తొలగిపోతాయి.",
        ta: "ஆச்சா மரத்தடியில் தியானம் செய்வதும் குங்கிலியம் போடுவதும் தோஷம் போக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ निर्ऋतये नमः । ॐ मूं मूलनक्षत्रेभ्यो नमः ॥",
      kannada: "॥ ಓಂ ನಿರ್ಋತಯೇ ನಮಃ । ಓಂ ಮೂಂ ಮೂಲನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಆದಿಮೂಲ ದೇವತೆಯ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಮೂಲಭೂತ ದೋಷಗಳು ಕಳೆದು ನೂತನ ಶುಭಾರಂಭವಾಗಲಿ.",
        en: "May the primordial goddess Nirriti uproot all underlying afflictions and anchor spiritual awakening.",
        hi: "मूल नक्षत्र के अधिष्ठाता समस्त बाधाओं की जड़ों को काटकर शांति प्रदान करें।",
        te: "మూల దేవత అనుగ్రహంతో సర్వ దోషాలు తొలగుగాక.",
        ta: "மூல நட்சத்திர தேவதையின் அருளால் அனைத்து தடைகளும் வேரறுக்கப்படட்டும்."
      }
    },
    aradhana: {
      kn: "ಗೋಕರ್ಣದಲ್ಲಿ ಮೂಲ ನಕ್ಷತ್ರ ಶಾಂತಿ, ನವಗ್ರಹ ಹೋಮ ಹಾಗೂ ಹನುಮತ್ ಸೇವೆ.",
      en: "Perform Mula Nakshatra Shanti and Hanuman Seva at Gokarna.",
      hi: "गोकर्ण में मूल शांति पूजा एवं श्री हनुमान जी की सेवा करें।",
      te: "మూలా నక్షత్ర శాంతి మరియు హనుమత్ సేవ.",
      ta: "மூல நட்சத்திர சாந்தி மற்றும் ஆஞ்சநேயர் வழிபாடு."
    }
  },
  19: { // Purva Ashadha
    name: { kn: "ಪೂರ್ವಾಷಾಢಾ", en: "Purva Ashadha", hi: "पूर्वाषाढ़ा", te: "పూర్వాషాఢ", ta: "பூராடம்" },
    deity: { kn: "ಆಪಃ (ಜಲದೇವತೆ)", en: "Apas (Cosmic Water Deity)", hi: "आपः (जल देवता)", te: "జల దేవత", ta: "ஜல தேவதை" },
    tree: {
      botanicalName: "Calamus rotang",
      kannada: "ಬೆತ್ತದ ಮರ (ವಾನಸ)",
      english: "Rattan Cane (Betta)",
      hindi: "बेंत (वेत)",
      telugu: "పేము చెట్టు",
      tamil: "பிரம்பு",
      worshipMethod: {
        kn: "ಪವಿತ್ರ ನದಿಗಳು ಅಥವಾ ಜಲಮೂಲಗಳ ಸಂರಕ್ಷಣೆ ಮಾಡುವುದು ಮತ್ತು ಬೆತ್ತದ ಗಿಡಕ್ಕೆ ನೀರೆರೆಯುವುದು ಅಜೇಯ ವಿಜಯವನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Protect holy rivers and nurture rattan cane plants to manifest invincible grace.",
        hi: "पवित्र जल स्रोतों की रक्षा करें एवं जल का अपव्यय न करें।",
        te: "నదీ సంరక్షణ మరియు పేము చెట్టుకు నీరు పోయడం శ్రేష్టం.",
        ta: "புனித நதிகளை போற்றுவதும் பிரம்பு மரத்திற்கு நீர் ஊற்றுவதும் நன்மை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अद्भ्यो नमः । ॐ ಪೂಂ ಪೂರ್ವಾಷಾಢಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಅದ್ಭ್ಯೋ ನಮಃ । ಓಂ ಪೂಂ ಪೂರ್ವಾಷಾಢಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪವಿತ್ರ ಜಲದೇವತೆಗಳ ಕೃಪೆಯಿಂದ ಮನಸ್ಸು ಸದಾ ಶುದ್ಧ, ಶಾಂತ ಹಾಗೂ ಅಪರಾಜಿತವಾಗಿರಲಿ.",
        en: "May the divine waters purify inner consciousness and bestow unconquerable victory.",
        hi: "पवित्र जल देवता मन को निर्मल कर अपराजित विजय प्रदान करें।",
        te: "జల దేవతల కృపతో మనస్సు నిర్మలమగుగాక.",
        ta: "ஜல தேவதையின் அருளால் மனம் தூய்மையாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಆರಾಧನೆ ಹಾಗೂ ಗೋದಾವರಿ / ಗಂಗಾ ಜಲದಿಂದ ಶಿವಲಿಂಗಾಭಿಷೇಕ.",
      en: "Worship Goddess Mahalakshmi and offer sacred water abhisheka to Shiva Linga.",
      hi: "माता महालक्ष्मी की पूजा एवं गंगाजल से शिवजी का अभिषेक करें।",
      te: "మహాలక్ష్మి పూజ మరియు శివాభిషేకం.",
      ta: "மகாலட்சுமி வழிபாடு மற்றும் கங்காஜலத்தால் அபிஷேகம்."
    }
  },
  20: { // Uttara Ashadha
    name: { kn: "ಉತ್ತರಾಷಾಢಾ", en: "Uttara Ashadha", hi: "उत्तराषाढ़ा", te: "ఉత్తరాషాఢ", ta: "உத்திராடம்" },
    deity: { kn: "ವಿಶ್ವೇದೇವತೆಗಳು", en: "Vishvedevas (Universal Cosmic Gods)", hi: "विश्वेदेवा", te: "విశ్వేదేవతలు", ta: "விஸ்வேதேவர்கள்" },
    tree: {
      botanicalName: "Artocarpus heterophyllus",
      kannada: "ಹಲಸಿನ ಮರ (ಪಲಾಸ)",
      english: "Jackfruit Tree",
      hindi: "कटहल",
      telugu: "పనస చెట్టు",
      tamil: "பலா மரம்",
      worshipMethod: {
        kn: "ಹಲಸಿನ ಮರಕ್ಕೆ ನೀರೆರೆಯುವುದು ಹಾಗೂ ಅದರ ಹಣ್ಣನ್ನು ದೇವರಿಗೆ ಸಮರ್ಪಿಸುವುದು ಸಕಲ ಜನರಲ್ಲಿ ಪ್ರೀತಿ ಮತ್ತು ಗೌರವವನ್ನು ತರುತ್ತದೆ.",
        en: "Water the Jackfruit tree and offer its golden fruit in worship to secure permanent victory and goodwill.",
        hi: "कटहल के वृक्ष को जल दें, समाज में स्थायी सफलता और यश मिलेगा।",
        te: "పనస చెట్టుకు నీరు పోయడం వలన గౌరవం పెరుగుతుంది.",
        ta: "பலா மரத்திற்கு நீர் ஊற்றுவது நிலையான வெற்றியை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ विश्वेभ्यो देवेभ्यो नमः । ॐ ಉಂ ಉತ್ತರಾಷಾಢಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ವಿಶ್ವೇಭ್ಯೋ ದೇವೇಭ್ಯೋ ನಮಃ । ಓಂ ಉಂ ಉತ್ತರಾಷಾಢಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಸರ್ವಲೋಕ ರಕ್ಷಕರಾದ ವಿಶ್ವೇದೇವತೆಗಳ ಅನುಗ್ರಹದಿಂದ ಸತ್ಯ ಮತ್ತು ಧರ್ಮಕ್ಕೆ ಜಯವಾಗಲಿ.",
        en: "May the universal Vishvedevas protect righteous pursuits and grant ultimate victory.",
        hi: "विश्वेदेवों की कृपा से धर्म के मार्ग पर शाश्वत विजय प्राप्त हो।",
        te: "విశ్వేదేవతల కృపతో ధర్మ విజయము లభించుగాక.",
        ta: "விஸ்வேதேவர்களின் அருளால் வெற்றி நிலைக்கட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ ಹಾಗೂ ಮಹಾಗಣಪತಿ ಉಪಾಸನೆ.",
      en: "Worship Lord Surya Narayana and Lord Maha Ganapati.",
      hi: "भगवान सूर्यनारायण एवं गणेश जी की पूजा करें।",
      te: "సూర్యనారాయణ మరియు గణపతి పూజ.",
      ta: "சூரிய நாராயணர் மற்றும் விநாயகர் வழிபாடு."
    }
  },
  21: { // Shravana
    name: { kn: "ಶ್ರವಣ", en: "Shravana", hi: "श्रवण", te: "శ్రవణం", ta: "திருவோணம்" },
    deity: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾವಿಷ್ಣು", en: "Lord Maha Vishnu", hi: "भगवान विष्णु", te: "శ్రీ మహావిష్ణువు", ta: "ஸ்ரீ மகாவிஷ்ணு" },
    tree: {
      botanicalName: "Calotropis gigantea",
      kannada: "ಎಕ್ಕದ ಗಿಡ (ಅರ್ಕ ವೃಕ್ಷ)",
      english: "Crown Flower (Arka)",
      hindi: "मदार (आक / अर्क)",
      telugu: "జిల్లేడు చెట్టు",
      tamil: "எருக்கு மரம்",
      worshipMethod: {
        kn: "ಶ್ವೇತಾರ್ಕ (ಬಿಳಿ ಎಕ್ಕದ) ಗಿಡಕ್ಕೆ ನೀರೆರೆಯುವುದು ಹಾಗೂ ಹೂವುಗಳನ್ನು ಸೂರ್ಯ ಅಥವಾ ಗಣಪತಿಗೆ ಅರ್ಪಿಸುವುದು ಅತ್ಯಂತ ಶುಭದಾಯಕ.",
        en: "Offer blue/white Arka blossoms to Lord Ganesha and Surya to awaken receptive listening and divine protection.",
        hi: "सफेद आक के पौधे को सींचें और गणेश जी को मदार पुष्प चढ़ाएं।",
        te: "జిల్లేడు పూలతో వినాయకుడిని పూజించడం వలన శ్రేయస్సు లభిస్తుంది.",
        ta: "வெள்ளெருக்கு மலர்களால் விநாயகரை வழிபட நன்மைகள் பெருகும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ विष्णवे नमः । ॐ ಶ್ರುಂ ಶ್ರವಣನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ವಿಷ್ಣವೇ ನಮಃ । ಓಂ ಶ್ರುಂ ಶ್ರವಣನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಜಗತ್ಪಾಲಕ ಶ್ರೀಮನ್ನಾರಾಯಣನ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಜ್ಞಾನ, ಕೀರ್ತಿ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
        en: "May all-pervading Lord Vishnu grant discerning hearing, sacred knowledge, and liberation.",
        hi: "जगतपालक श्रीहरि विष्णु की कृपा से विद्या, यश और सद्गति प्राप्त हो।",
        te: "శ్రీమన్నారాయణుని కృపతో జ్ఞానం మరియు మోక్షం లభించుగాక.",
        ta: "ஸ்ரீ மகாவிஷ்ணுவின் அருளால் ஞானமும் மோட்சமும் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಹಾಗೂ ಶ್ರವಣ ನಕ್ಷತ್ರದಂದು ಉಪವಾಸ.",
      en: "Recite Sri Vishnu Sahasranama and observe fast on Shravana Nakshatra.",
      hi: "विष्णु सहस्रनाम का पाठ करें और एकादशी व्रत रखें।",
      te: "విష్ణు సహస్రనామ పఠనం.",
      ta: "விஷ்ணு சகஸ்ரநாம பாராயணம்."
    }
  },
  22: { // Dhanishta
    name: { kn: "ಧನಿಷ್ಠಾ", en: "Dhanishta", hi: "धनिष्ठा", te: "ధనిష్ఠ", ta: "அவிட்டம்" },
    deity: { kn: "ಅಷ್ಟವಸುಗಳು (೮ ವಸುದೇವತೆಗಳು)", en: "Ashta Vasus (8 Elemental Deities)", hi: "अष्ट वसु", te: "అష్ట వసువులు", ta: "அஷ்ட வசுக்கள்" },
    tree: {
      botanicalName: "Prosopis cineraria",
      kannada: "ಬನ್ನಿ ಮರ (ಶಮೀ ವೃಕ್ಷ)",
      english: "Khejri / Shami Tree",
      hindi: "शमी (खेजड़ी)",
      telugu: "జమ్మి చెట్టు",
      tamil: "வன்னி மரம்",
      worshipMethod: {
        kn: "ವಿಜಯದಶಮಿಯಂದು ಪೂಜಿಸಲ್ಪಡುವ ಶಮೀ ವೃಕ್ಷಕ್ಕೆ ನೀರೆರೆಯುವುದು ಸಕಲ ಶತ್ರು ಜಯ ಹಾಗೂ ಅಪಾರ ಧನ ಸಂಪತ್ತನ್ನು ತರುತ್ತದೆ.",
        en: "Water the sacred Shami tree to neutralize Saturn/Mars friction and manifest rhythmic abundance and music mastery.",
        hi: "शमी वृक्ष को नित्य जल दें, शनि-मंगल दोष शांत होकर विपुल धन की प्राप्ति होगी।",
        te: "జమ్మి చెట్టుకు నీరు పోయడం వలన శత్రు విజయం మరియు సంపద లభిస్తుంది.",
        ta: "வன்னி மரத்திற்கு நீர் ஊற்றுவது சனி-செவ்வாய் தோஷத்தை போக்கி வெற்றி தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ वसुभ्यो नमः । ॐ ಧಂ ಧನಿಷ್ಠಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ವಸುಭ್ಯೋ ನಮಃ । ಓಂ ಧಂ ಧನಿಷ್ಠಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಅಷ್ಟವಸುಗಳ ಅನುಗ್ರಹದಿಂದ ಸಕಲ ಐಶ್ವರ್ಯ, ಸಂಗೀತ ಕಲೆ ಹಾಗೂ ಧೈರ್ಯ ಸಿದ್ಧಿಸಲಿ.",
        en: "May the eight Vasus bestow material opulence, musical resonance, and courageous enterprise.",
        hi: "अष्ट वसुओं की कृपा से धन-धान्य और संगीत-कला में सिद्धि प्राप्त हो।",
        te: "అష్ట వసువుల అనుగ్రహంతో అష్టైశ్వర్యాలు లభించుగాక.",
        ta: "அஷ்ட வசுக்களின் அருளால் அஷ்ட ஐஸ்வர்யங்களும் உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ಶಿವನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಟರಾಜ ಸ್ತುತಿ.",
      en: "Perform Rudrabhisheka to Lord Shiva and chant Nataraja Stuti.",
      hi: "भगवान शिव पर रुद्राभिषेक करें एवं शमी पत्र अर्पित करें।",
      te: "రుద్రాభిషేకం మరియు నటరాజ స్తుతి.",
      ta: "ருத்ராபிஷேகம் மற்றும் நடராஜர் துதி."
    }
  },
  23: { // Shatabhisha
    name: { kn: "ಶತಭಿಷಾ", en: "Shatabhisha", hi: "शतभिषा", te: "శతభిషం", ta: "சதயம்" },
    deity: { kn: "ವರುಣದೇವ (ಸಮುದ್ರಾಧಿಪತಿ)", en: "Varuna Deva (Cosmic Ocean Lord)", hi: "वरुण देव", te: "వరుణ దేవుడు", ta: "வருண பகவான்" },
    tree: {
      botanicalName: "Neolamarckia cadamba",
      kannada: "ಕದಂಬ ಮರ",
      english: "Burflower Tree (Kadamba)",
      hindi: "कदंब",
      telugu: "కదంబ చెట్టు",
      tamil: "கடம்ப மரம்",
      worshipMethod: {
        kn: "ಕದಂಬ ವೃಕ್ಷದ ದರ್ಶನ ಮತ್ತು ಪೂಜೆ ಆಯುರ್ವೇದ ರಹಸ್ಯ ಜ್ಞಾನ ಹಾಗೂ ದೀರ್ಘಕಾಲದ ರೋಗಗಳ ಶಮನಕ್ಕೆ ದಿವ್ಯ ಔಷಧಿಯಾಗಿದೆ.",
        en: "Honor the fragrant Kadamba tree to unlock therapeutic breakthroughs and overcome stubborn chronic ailments.",
        hi: "कदंब वृक्ष के पास बैठें और जल अर्पित करें, असाध्य रोगों का शमन होगा।",
        te: "కదంబ చెట్టును పూజించడం వలన దీర్ఘకాలిక రోగాలు నయమవుతాయి.",
        ta: "கடம்ப மரத்தை வணங்குவது நாள்பட்ட நோய்களை போக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ वरुणाय नमः । ॐ ಶಂ ಶತಭಿಷಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ವರುಣಾಯ ನಮಃ । ಓಂ ಶಂ ಶತಭಿಷಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಸಕಲ ಜಲ ಮತ್ತು ಸತ್ಯಗಳ ಪಾಲಕ ವರುಣದೇವನ ಕೃಪೆಯಿಂದ ಸಕಲ ರೋಗಗಳು ದೂರವಾಗಲಿ.",
        en: "May divine Varuna cleanse hidden poisons and grant comprehensive physical and mental healing.",
        hi: "वरुण देव समस्त व्याधियों का नाश कर दीर्घायु प्रदान करें।",
        te: "వరుణ దేవుని కృపతో ఆరోగ్యము లభించుగాక.",
        ta: "வருண பகவானின் அருளால் சகல பிணிகளும் அகலட்டும்."
      }
    },
    aradhana: {
      kn: "ಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ತೀರ್ಥಸ್ನಾನ.",
      en: "Chant Maha Mrityunjaya Mantra and bathe in holy Gokarna Koti Teertha.",
      hi: "महामृत्युंजय मंत्र का जप करें और तीर्थ स्नान करें।",
      te: "మహామృత్యుంజయ జపం.",
      ta: "மகா மிருத்யுஞ்சய ஜபம்."
    }
  },
  24: { // Purva Bhadrapada
    name: { kn: "ಪೂರ್ವ ಭಾದ್ರಪದ", en: "Purva Bhadrapada", hi: "पूर्व भाद्रपद", te: "పూర్వాభాద్ర", ta: "பூரட்டாதி" },
    deity: { kn: "ಅಜೈಕಪಾದ (ರುದ್ರ ಸ್ವರೂಪ)", en: "Aja Ekapada (Cosmic Fire Serpent)", hi: "अजैकपाद", te: "అజైకపాదుడు", ta: "அஜைகபாதர்" },
    tree: {
      botanicalName: "Mangifera indica",
      kannada: "ಮಾವಿನ ಮರ (ಆಮ್ರ ವೃಕ್ಷ)",
      english: "Mango Tree (Amra)",
      hindi: "आम का वृक्ष",
      telugu: "మామిడి చెట్టు",
      tamil: "மாமரம்",
      worshipMethod: {
        kn: "ಮಾವಿನ ಮರಕ್ಕೆ ನೀರೆರೆಯುವುದು ಹಾಗೂ ಹವನದಲ್ಲಿ ಮಾವಿನ ಕಟ್ಟಿಗೆಗಳನ್ನು ಬಳಸುವುದು ಆಂತರಿಕ ತಪಸ್ಸು ಮತ್ತು ಶುದ್ಧಿಯನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Water the sacred Mango tree and use dried mango twigs in sacred homas for fiery purification.",
        hi: "आम के वृक्ष को जल दें एवं हवन में आम की समिधा का उपयोग करें।",
        te: "మామిడి చెట్టుకు నీరు పోయడం వలన తపశ్శక్తి పెరుగుతుంది.",
        ta: "மாமரத்திற்கு நீர் ஊற்றுவது ஆன்மீக பலத்தை தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अजैकपदे नमः । ॐ ಪೂಂ ಪೂರ್ವಭಾದ್ರಪದಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಅಜೈಕಪದೇ ನಮಃ । ಓಂ ಪೂಂ ಪೂರ್ವಭಾದ್ರಪದಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಏಕಪಾದ ರುದ್ರನ ಕೃಪೆಯಿಂದ ಆಂತರಿಕ ಉಗ್ರತೆ ಶಾಂತವಾಗಿ ಆಧ್ಯಾತ್ಮಿಕ ತಪಸ್ಸು ಸಿದ್ಧಿಸಲಿ.",
        en: "May mystical Aja Ekapada channel ascetic devotion and deep yogic transformation.",
        hi: "भगवान अजैकपाद समस्त संतापों को हरकर योग सिद्धि प्रदान करें।",
        te: "అజైకపాదుని అనుగ్రహంతో ఆధ్యాత్మిక ఉన్నతి కలుగుగాక.",
        ta: "அஜைகபாதரின் அருளால் ஆன்மீக தெளிவு உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ರುದ್ರ ಗಾಯತ್ರಿ ಜಪ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ.",
      en: "Chant Rudra Gayatri and perform Rudrabhisheka at Gokarna.",
      hi: "रुद्र गायत्री का जप करें एवं शिवलिंग पर दुग्धाभिषेक करें।",
      te: "రుద్ర గాయత్రి జపం మరియు రుద్రాభిషేకం.",
      ta: "ருத்ர காயத்ரி மற்றும் ருத்ராபிஷேகம்."
    }
  },
  25: { // Uttara Bhadrapada
    name: { kn: "ಉತ್ತರ ಭಾದ್ರಪದ", en: "Uttara Bhadrapada", hi: "उत्तर भाद्रपद", te: "ఉత్తరాభాద్ర", ta: "உத்திரட்டாதி" },
    deity: { kn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಕುಂಡಲಿನೀ ಸರ್ಪ)", en: "Ahirbudhnya (Serpent of the Depths)", hi: "अहिर्बुध्न्य", te: "అహిర్బుధ్న్యుడు", ta: "அஹிர்புத்னியர்" },
    tree: {
      botanicalName: "Azadirachta indica",
      kannada: "ಬೇವು (ನಿಂಬ ವೃಕ್ಷ)",
      english: "Neem Tree (Nimba)",
      hindi: "नीम का पेड़",
      telugu: "వేప చెట్టు",
      tamil: "வேப்ப மரம்",
      worshipMethod: {
        kn: "ಬೇವಿನ ಮರಕ್ಕೆ ನೀರೆರೆದು ಪ್ರದಕ್ಷಿಣೆ ಹಾಕುವುದು ಸಮಸ್ತ ರೋಗಾಣು, ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ಶನಿ ಪೀಡೆಗಳನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
        en: "Circumambulate the sacred Neem tree to pacify deep-seated karmic friction and purify bodily tissues.",
        hi: "नीम के वृक्ष की परिक्रमा करें, समस्त नकारात्मक ऊर्जा और शनि दोष दूर होंगे।",
        te: "వేప చెట్టుకు ప్రదక్షిణలు చేయడం వలన నకారాత్మక శక్తులు తొలగుతాయి.",
        ta: "வேப்ப மரத்தை வலம் வருவது சகல தோஷங்களையும் போக்கும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ अहिर्बुध्न्याय नमः । ॐ ಉಂ ಉತ್ತರಭಾದ್ರಪದಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಅಹಿರ್ಬುಧ್ನ್ಯಾಯ ನಮಃ । ಓಂ ಉಂ ಉತ್ತರಭಾದ್ರಪದಾನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಅತಲದ ಕುಂಡಲಿನೀ ರಕ್ಷಕ ಅಹಿರ್ಬುಧ್ನ್ಯನ ಕೃಪೆಯಿಂದ ಸ್ಥಿರ ಶಾಂತಿ ಮತ್ತು ಗಂಭೀರ ವಿವೇಕ ಲಭಿಸಲಿ.",
        en: "May Ahirbudhnya stabilize inner serpent energy, granting profound stillness and wisdom.",
        hi: "अहिर्बुध्न्य देव की कृपा से चित्त स्थिर हो और गहन ज्ञान की प्राप्ति हो।",
        te: "అహిర్బుధ్న్యుని కృపతో మానసిక ప్రశాంతత లభించుగాక.",
        ta: "அஹிர்புத்னியரின் அருளால் ஆழ்ந்த அமைதி உண்டாகட்டும்."
      }
    },
    aradhana: {
      kn: "ಭಗವಾನ್ ಶಿವ ಹಾಗೂ ದುರ್ಗಾ ದೇವಿ ಆರಾಧನೆ, ಬಡವರಿಗೆ ಅನ್ನದಾನ.",
      en: "Worship Lord Shiva and Goddess Durga; donate grain to underprivileged seekers.",
      hi: "भगवान शिव एवं मां दुर्गा की उपासना करें, गरीबों को भोजन कराएं।",
      te: "శివ మరియు దుర్గా ఆరాధన.",
      ta: "சிவன் மற்றும் துர்க்கை வழிபாடு."
    }
  },
  26: { // Revati
    name: { kn: "ರೇವತಿ", en: "Revati", hi: "रेवती", te: "రేవతి", ta: "ரேவதி" },
    deity: { kn: "ಪೂಷಾ (ಪ್ರಯಾಣಿಕರ ರಕ್ಷಕ)", en: "Pushan (Nurturer & Safe Travel Deity)", hi: "पूषा", te: "పూషుడు", ta: "பூஷா" },
    tree: {
      botanicalName: "Madhuca longifolia",
      kannada: "ಇಪ್ಪೆ ಮರ (ಮಹುವಾ)",
      english: "Mahua Tree (Madhuka)",
      hindi: "महुआ",
      telugu: "ఇప్ప చెట్టు",
      tamil: "இலுப்பை மரம்",
      worshipMethod: {
        kn: "ಇಪ್ಪೆ ಎಣ್ಣೆಯ ದೀಪವನ್ನು ಶಿವನಿಗೆ ಹಚ್ಚುವುದು ಹಾಗೂ ಮರವನ್ನು ಸಂರಕ್ಷಿಸುವುದು ಪ್ರಯಾಣದಲ್ಲಿ ರಕ್ಷಣೆ ಮತ್ತು ಸಮೃದ್ಧಿಯನ್ನು ನೀಡುತ್ತದೆ.",
        en: "Light an Iluppai (Mahua) oil lamp before Lord Shiva to ensure safe journeys, nourish livestock, and finalize karmic cycles.",
        hi: "महुआ के तेल का दीपक शिवलिंग के सम्मुख जलाएं, यात्राएं सुखद और सफल होंगी।",
        te: "ఇప్ప నూనెతో దీపం వెలిగించడం వలన ప్రయాణాలలో రక్షణ లభిస్తుంది.",
        ta: "இலுப்பை எண்ணெய் தீபம் ஏற்றுவது பயணங்களில் பாதுகாப்பையும் செல்வத்தையும் தரும்."
      }
    },
    beejaMantra: {
      sanskrit: "॥ ॐ पूष्णे नमः । ॐ ರೇಂ ರೇವತೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      kannada: "॥ ಓಂ ಪೂಷ್ಣೇ ನಮಃ । ಓಂ ರೇಂ ರೇವತೀನಕ್ಷತ್ರೇಭ್ಯೋ ನಮಃ ॥",
      meaning: {
        kn: "ಪ್ರಯಾಣಿಕರ ರಕ್ಷಕ ಪೂಷಾದೇವನ ಕೃಪೆಯಿಂದ ಜೀವಿತ ಪಯಣವು ಕ್ಷೇಮಕರ ಹಾಗೂ ಸುಖಮಯವಾಗಿರಲಿ.",
        en: "May gentle nourisher Pushan guide your journey safely and ensure auspicious completion.",
        hi: "पोषणकर्ता पूषा देव समस्त यात्राओं में रक्षा करें और सुख-समृद्धि दें।",
        te: "పూష దేవుని అనుగ్రహంతో సర్వ ప్రయాణాలు క్షేమంగా సాగుగాక.",
        ta: "பூஷா பகவானின் அருளால் பயணங்கள் யாவும் நன்மையாக அமையட்டும்."
      }
    },
    aradhana: {
      kn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ ವ್ರತ ಹಾಗೂ ಪ್ರಾಣಿಗಳಿಗೆ ಆಹಾರ ನೀಡುವುದು.",
      en: "Perform Sri Satyanarayana Vrata and feed stray animals.",
      hi: "श्री सत्यनारायण व्रत कथा सुनें एवं मूक पशुओं को चारा दें।",
      te: "శ్రీ సత్యనారాయణ వ్రతం.",
      ta: "ஸ்ரீ சத்யநாராயணர் விரதம்."
    }
  }
};

/** 15 Tithis Remedies and Deities */
export const TITHI_REMEDY_DATA: Record<number, {
  name: Record<string, string>;
  deity: Record<string, string>;
  vrataAndRemedy: Record<string, string>;
}> = {
  1: {
    name: { kn: "ಪಾಡ್ಯ / ಪ್ರಥಮಾ", en: "Pratipat (1st Tithi)", hi: "प्रतिपदा", te: "పాడ్యమి", ta: "பிரதமை" },
    deity: { kn: "ಅಗ್ನಿದೇವ", en: "Agni Deva", hi: "अग्नि देव", te: "అగ్ని దేవుడు", ta: "அக்னி தேவன்" },
    vrataAndRemedy: {
      kn: "ಹಸುವಿನ ಶುದ್ಧ ತುಪ್ಪವನ್ನು ದಾನ ಮಾಡುವುದು ಹಾಗೂ ಅಗ್ನಿಹೋತ್ರ ಪ್ರಾರ್ಥನೆ ಮಾಡುವುದು ಜೀರ್ಣಶಕ್ತಿ ಮತ್ತು ತೇಜಸ್ಸನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      en: "Donate pure cow ghee and offer ghee lamp to fire for digestive fire and cellular radiance.",
      hi: "शुद्ध गाय के घी का दान करें एवं अग्नि देव की पूजा करें।",
      te: "ఆవు నెయ్యి దానం చేయడం శ్రేష్టం.",
      ta: "பசு நெய் தானம் செய்வதும் அக்னி வழிபாடும் சிறந்தது."
    }
  },
  2: {
    name: { kn: "ಬಿದಿಗೆ / ದ್ವಿತೀಯಾ", en: "Dvitiya (2nd Tithi)", hi: "द्वितीया", te: "విదియ", ta: "துவிதியை" },
    deity: { kn: "ಬ್ರಹ್ಮದೇವ & ಅಶ್ವಿನಿ ಕುಮಾರರು", en: "Lord Brahma & Ashwini Kumaras", hi: "ब्रह्मा देव", te: "బ్రహ్మ దేవుడు", ta: "பிரம்ம தேவன்" },
    vrataAndRemedy: {
      kn: "ಸರಸ್ವತೀ ಪೂಜೆ, ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ ಹಾಗೂ ಸಿಹಿ ತಿನಿಸುಗಳನ್ನು ಹಂಚುವುದು ಸಿದ್ಧಿಕಾರಕ.",
      en: "Worship Goddess Saraswati and donate stationery to underprivileged students.",
      hi: "मां सरस्वती की पूजा करें और विद्यार्थियों को पुस्तकें दान करें।",
      te: "సరస్వతీ పూజ మరియు పుస్తక దానం.",
      ta: "சரஸ்வதி பூஜை மற்றும் மாணவர்களுக்கு புத்தக தானம்."
    }
  },
  3: {
    name: { kn: "ತದಿಗೆ / ತೃತೀಯಾ", en: "Tritiya (3rd Tithi)", hi: "तृतीया", te: "తదియ", ta: "திருதியை" },
    deity: { kn: "ಗೌರೀ ದೇವಿ (ಶಕ್ತಿ)", en: "Goddess Gauri", hi: "माता गौरी", te: "గౌరీ దేవి", ta: "கௌரி தேவி" },
    vrataAndRemedy: {
      kn: "ಗೌರೀ ವ್ರತ, ಮುತ್ತೈದೆಯರಿಗೆ ಅರಿಶಿನ-ಕುಂಕುಮ ಹಾಗೂ ಹಣ್ಣುಗಳನ್ನು ನೀಡುವುದು ಸೌಭಾಗ್ಯವರ್ಧಕ.",
      en: "Observe Gauri Vrata; offer turmeric, kumkum, and fresh fruits to married women for marital harmony.",
      hi: "माता गौरी की पूजा करें एवं सुहागिनों को सुहाग सामग्री भेंट करें।",
      te: "గౌరీ వ్రతం మరియు ముత్తైదువులకు తాంబూలం.",
      ta: "கௌரி விரதம் மற்றும் மங்கலப் பொருட்கள் வழங்குதல்."
    }
  },
  4: {
    name: { kn: "ಚೌತಿ / ಚತುರ್ಥಿ", en: "Chaturthi (4th Tithi)", hi: "चतुर्थी", te: "చవితి", ta: "சதுர்த்தி" },
    deity: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಗಣಪತಿ", en: "Lord Maha Ganapati", hi: "भगवान श्री गणेश", te: "శ్రీ గణపతి", ta: "ஸ்ரீ விநாயகர்" },
    vrataAndRemedy: {
      kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ ವ್ರತ, ಗಣೇಶನಿಗೆ ಗರಿಕೆ ಮತ್ತು ಮೋದಕ ಅರ್ಪಿಸುವುದು ಸಕಲ ವಿಘ್ನನಿವಾರಕ.",
      en: "Observe Sankashti Chaturthi vrata; offer Durva grass and modakas to Ganesha to dissolve roadblocks.",
      hi: "संकष्टी चतुर्थी व्रत रखें, गणेश जी को दूर्वा और मोदक अर्पित करें।",
      te: "సంకష్టహర చతుర్థి వ్రతం మరియు గణపతికి గరిక సమర్పణ.",
      ta: "சங்கடஹர சதுர்த்தி விரதம் மற்றும் அருகம்புல் அர்ச்சனை."
    }
  },
  5: {
    name: { kn: "ಪಂಚಮಿ", en: "Panchami (5th Tithi)", hi: "पंचमी", te: "పంచమి", ta: "பஞ்சமி" },
    deity: { kn: "ನಾಗದೇವತೆಗಳು & ಸುಬ್ರಹ್ಮಣ್ಯ", en: "Naga Devatas & Kartikeya", hi: "नाग देवता", te: "నాగ దేవతలు", ta: "நாக தேவதைகள்" },
    vrataAndRemedy: {
      kn: "ನಾಗದೇವರಿಗೆ ಹಾಲಿನ ಅಭಿಷೇಕ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ ಸರ್ಪ ದೋಷ ಮತ್ತು ಸಂತಾನ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
      en: "Offer milk abhisheka to serpent idols for Sarpa Dosha mitigation and progeny vitality.",
      hi: "नाग देवता को कच्चा दूध अर्पित करें और सर्प दोष निवारण पूजा करें।",
      te: "నాగ పూజ మరియు సుబ్రహ్మణ్యేశ్వర ఆరాధన.",
      ta: "நாகருக்கு பால் அபிஷேகம் மற்றும் முருகன் வழிபாடு."
    }
  },
  6: {
    name: { kn: "ಷಷ್ಠಿ", en: "Shashthi (6th Tithi)", hi: "षष्ठी", te: "షష్ఠి", ta: "சஷ்டி" },
    deity: { kn: "ಭಗವಾನ್ ಕಾರ್ತಿಕೇಯ (ಸ್ಕಂದ)", en: "Lord Kartikeya (Skanda)", hi: "भगवान कार्तिकेय", te: "కార్తికేయుడు", ta: "முருகப்பெருமான்" },
    vrataAndRemedy: {
      kn: "ಸ್ಕಂದ ಷಷ್ಠಿ ವ್ರತ ಪಾಲನೆ, ಕುಜ ಶಾಂತಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ದರ್ಶನ ರಕ್ತ ಸಂಬಂಧಿ ತೊಂದರೆ ಮತ್ತು ಕೋಪವನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
      en: "Observe Skanda Shashthi fast to pacify Mars afflictions, blood pressure, and fiery impulsiveness.",
      hi: "स्कंद षष्ठी व्रत रखें और मंगल शांति हेतु लाल पुष्प अर्पित करें।",
      te: "స్కంద షష్ఠి వ్రతం మరియు కుజ శాంతి.",
      ta: "சஷ்டி விரதம் மற்றும் செவ்வாய் சாந்தி."
    }
  },
  7: {
    name: { kn: "ಸಪ್ತಮಿ", en: "Saptami (7th Tithi)", hi: "सप्तमी", te: "సప్తమి", ta: "சப்தமி" },
    deity: { kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ", en: "Lord Surya Narayana", hi: "भगवान सूर्य", te: "సూర్య భగవానుడు", ta: "சூரிய பகவான்" },
    vrataAndRemedy: {
      kn: "ಸೂರ್ಯನಿಗೆ ಕೆಂಪು ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯ ಅರ್ಘ್ಯ ನೀಡುವುದು, ಉಪ್ಪು ರಹಿತ ಆಹಾರ ಸೇವಿಸುವುದು ಆಯುರಾರೋಗ್ಯವರ್ಧಕ.",
      en: "Offer Surya Arghya with red flowers; observe saltless diet at sunset for ocular and bone vitality.",
      hi: "सूर्य देव को तांबे के लोटे से अर्घ्य दें और बिना नमक का भोजन करें।",
      te: "సూర్యునికి అర్ఘ్యం సమర్పించడం మరియు ఉప్పు లేని ఆహారం.",
      ta: "சூரியனுக்கு அர்க்கியம் மற்றும் உப்பில்லா உணவு உட்கொள்ளல்."
    }
  },
  8: {
    name: { kn: "ಅಷ್ಟಮಿ", en: "Ashtami (8th Tithi)", hi: "अष्टमी", te: "అష్టమి", ta: "அஷ்டமி" },
    deity: { kn: "ದುರ್ಗಾ ದೇವಿ & ಕಾಲಭೈರವ", en: "Goddess Durga & Kalabhairava", hi: "मां दुर्गा / कालभैरव", te: "దుర్గా దేవి", ta: "துர்க்கை / பைரவர்" },
    vrataAndRemedy: {
      kn: "ದುರ್ಗಾಷ್ಟಮಿ ಪೂಜೆ, ನಿಂಬೆಹಣ್ಣಿನ ದೀಪ ಹಚ್ಚುವುದು ಹಾಗೂ ಕಾಲಭೈರವ ಸ್ಮರಣೆ ಶತ್ರು ಮತ್ತು ಭಯ ನಿವಾರಕ.",
      en: "Light lemon ghee lamps to Goddess Durga or worship Kalabhairava to conquer fear and obstacles.",
      hi: "मां दुर्गा के सम्मुख घी का दीप जलाएं और भैरव स्तोत्र पढ़ें।",
      te: "దుర్గా పూజ మరియు కాలభైరవ స్మరణ.",
      ta: "துர்க்கை அம்மனுக்கு எலுமிச்சை தீபம் ஏற்றுதல்."
    }
  },
  9: {
    name: { kn: "ನವಮಿ", en: "Navami (9th Tithi)", hi: "नवमी", te: "నవమి", ta: "நவமி" },
    deity: { kn: "ಶ್ರೀರಾಮಚಂದ್ರ & ಮಹಿಷಾಸುರಮರ್ದಿನಿ", en: "Lord Sri Rama & Mahishasuramardini", hi: "श्री राम / मां चंडिका", te: "శ్రీరాముడు", ta: "ஸ்ரீ ராமர்" },
    vrataAndRemedy: {
      kn: "ರಾಮನಾಮ ಜಪ, ಅನ್ನದಾನ ಹಾಗೂ ದುರ್ಗಾ ಕವಚ ಪಠಣ ಸಕಲ ಧರ್ಮಕಾರ್ಯಗಳಲ್ಲಿ ಜಯ ನೀಡುತ್ತದೆ.",
      en: "Chant Sri Rama Nama and recite Durga Kavacham for unyielding protection against psychic attacks.",
      hi: "राम नाम का जप करें एवं कन्याओं को भोजन कराएं।",
      te: "రామనామ జపం మరియు అన్నదానం.",
      ta: "ராம நாம ஜபம் மற்றும் அன்னதானம்."
    }
  },
  10: {
    name: { kn: "ದಶಮಿ", en: "Dashami (10th Tithi)", hi: "दशमी", te: "దశమి", ta: "தசமி" },
    deity: { kn: "ಯಮಧರ್ಮ & ದಿಕ್ಪಾಲಕರು", en: "Yama Dharmaraja & Digpalakas", hi: "धर्मराज यम", te: "యమధర్మరాజు", ta: "யமதர்மராஜன்" },
    vrataAndRemedy: {
      kn: "ಧರ್ಮಕಾರ್ಯಗಳಲ್ಲಿ ತೊಡಗುವುದು, ವೃದ್ಧರಿಗೆ ವಸ್ತ್ರದಾನ ಹಾಗೂ ವಿಜಯದಶಮಿ ಸ್ಮರಣೆ ಕಾರ್ಯಸಿದ್ಧಿಗೆ ಶ್ರೇಷ್ಠ.",
      en: "Honor elders with clothes and food; maintain complete truthfulness in transactions.",
      hi: "बुजुर्गों की सेवा करें और वस्त्र दान करें।",
      te: "పెద్దలకు వస్త్రదానం మరియు ధర్మ కార్యాలు.",
      ta: "பெரியவர்களுக்கு ஆடை தானம் மற்றும் தர்ம காரியங்கள்."
    }
  },
  11: {
    name: { kn: "ಏಕಾದಶಿ", en: "Ekadashi (11th Tithi)", hi: "एकादशी", te: "ఏకాదశి", ta: "ஏகாதசி" },
    deity: { kn: "ಶ್ರೀಮನ್ನಾರಾಯಣ (ವಿಷ್ಣು)", en: "Lord Maha Vishnu", hi: "भगवान विष्णु", te: "శ్రీ మహావిష్ణువు", ta: "ஸ்ரீ மகாவிஷ்ணு" },
    vrataAndRemedy: {
      kn: "ಏಕಾದಶಿ ಉಪವಾಸ, ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ ಸಮಸ್ತ ಕರ್ಮಗಳನ್ನು ಭಸ್ಮ ಮಾಡುವ ಮಹಾಪುಣ್ಯ.",
      en: "Observe pure Ekadashi fast; water Tulasi and chant Vishnu Sahasranama to dissolve deep karmic residue.",
      hi: "एकादशी का निर्जल/फलाहार व्रत रखें और तुलसी जी की पूजा करें।",
      te: "ఏకాదశి ఉపవాసం మరియు విష్ణు సహస్రనామ పారాయణం.",
      ta: "ஏகாதசி விரதம் மற்றும் விஷ்ணு சகஸ்ரநாமம்."
    }
  },
  12: {
    name: { kn: "ದ್ವಾದಶಿ", en: "Dvadashi (12th Tithi)", hi: "द्वादशी", te: "ద్వాదశి", ta: "துவாதசி" },
    deity: { kn: "ದಾಮೋದರ (ಹರಿ)", en: "Lord Damodara (Hari)", hi: "भगवान दामोदर", te: "దామోదరుడు", ta: "தாமோதரன்" },
    vrataAndRemedy: {
      kn: "ಹರಿದಿನ ಪಾರಣೆ, ಬ್ರಾಹ್ಮಣರಿಗೆ ಅಥವಾ ಅತಿಥಿಗಳಿಗೆ ಸಾತ್ವಿಕ ಭೋಜನ ನೀಡಿ ನಂತರ ಪಾರಣೆ ಮಾಡುವುದು ಸಕಲ ಸಿದ್ಧಿದಾಯಕ.",
      en: "Conclude Ekadashi fast after feeding an honored guest or devotee satvic morning meals.",
      hi: "द्वादशी पारण समय पर करें और अतिथि को भोजन कराएं।",
      te: "ద్వాదశి పారణ మరియు అన్నదానం.",
      ta: "துவாதசி பாரணை மற்றும் அன்னதானம்."
    }
  },
  13: {
    name: { kn: "ತ್ರಯೋದಶಿ", en: "Trayodashi (13th Tithi)", hi: "त्रयोदशी", te: "త్రయోదశి", ta: "திரயோதசி" },
    deity: { kn: "ಪರಮೇಶ್ವರ (ಕಾಮದೇವ/ಶಿವ)", en: "Lord Shiva (Pradosha Murthy)", hi: "भगवान शिव", te: "పరమశివుడు", ta: "சிவபெருமான்" },
    vrataAndRemedy: {
      kn: "ಪ್ರದೋಷ ಕಾಲದ ಶಿವ ಪೂಜೆ, ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಂದಿಯ ದರ್ಶನ ಸಕಲ ಋಣ ಮತ್ತು ರೋಗಗಳನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
      en: "Observe twilight Pradosha vrata; offer milk/bilva to Shiva Linga and whisper prayers into Nandi's ear.",
      hi: "प्रदोष काल में शिवलिंग का अभिषेक करें एवं नंदी जी का ध्यान करें।",
      te: "ప్రదోష పూజ మరియు శివాభిషేకం.",
      ta: "பிரதோஷ வழிபாடு மற்றும் நந்தி பூஜை."
    }
  },
  14: {
    name: { kn: "ಚತುರ್ದಶಿ", en: "Chaturdashi (14th Tithi)", hi: "चतुर्दशी", te: "చతుర్దశి", ta: "சதுர்த்தசி" },
    deity: { kn: "ಶಿವ (ರುದ್ರ / ನರಸಿಂಹ)", en: "Lord Shiva / Lord Narasimha", hi: "भगवान शिव / नृसिंह", te: "నరసింహ స్వామి", ta: "நரசிம்மர் / சிவன்" },
    vrataAndRemedy: {
      kn: "ಮಾಸ ಶಿವರಾತ್ರಿ ಉಪವಾಸ ಅಥವಾ ನರಸಿಂಹ ಕವಚ ಪಠಣ ದುಷ್ಟ ಶಕ್ತಿ ಹಾಗೂ ಅಕಾಲಿಕ ಅಪಮೃತ್ಯು ಭಯವನ್ನು ನಾಶ ಮಾಡುತ್ತದೆ.",
      en: "Observe Masa Shivaratri or recite Sri Narasimha Kavacham to neutralize evil eye and black energies.",
      hi: "मासिक शिवरात्रि का व्रत रखें अथवा नृसिंह कवच का पाठ करें।",
      te: "మాస శివరాత్రి ఉపవాసం మరియు నరసింహ స్తోత్రం.",
      ta: "மாத சிவராத்திரி அல்லது நரசிம்மர் கவசம்."
    }
  },
  15: {
    name: { kn: "ಹುಣ್ಣಿಮೆ / ಅಮಾವಾಸ್ಯೆ", en: "Purnima / Amavasya (15th Tithi)", hi: "पूर्णिमा / अमावस्या", te: "పౌర్ణమి / అమావాస్య", ta: "பௌர்ணமி / அமாவாசை" },
    deity: { kn: "ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ (ಹುಣ್ಣಿಮೆ) / ಪಿತೃ ದೇವತೆಗಳು (ಅಮಾವಾಸ್ಯೆ)", en: "Satyanarayana (Purnima) / Pitris (Amavasya)", hi: "सत्यनारायण / पितृगण", te: "సత్యనారాయణ స్వామి / పితృ దేవతలు", ta: "சத்யநாராயணர் / பித்ருக்கள்" },
    vrataAndRemedy: {
      kn: "ಹುಣ್ಣಿಮೆಯಂದು ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ವ್ರತ; ಅಮಾವಾಸ್ಯೆಯಂದು ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು ಸಕಲ ವಂಶಾಭಿವೃದ್ಧಿಕಾರಕ.",
      en: "Perform Sri Satyanarayana Vrata on Purnima for abundance; offer ancestral Tarpana on Amavasya.",
      hi: "पूर्णिमा पर सत्यनारायण कथा सुनें एवं अमावस्या पर पितरों का तर्पण करें।",
      te: "పౌర్ణమి సత్యనారాయణ వ్రతం / అమావాస్య పితృ తర్పణం.",
      ta: "பௌர்ணமி சத்யநாராயண பூஜை / அமாவாசை பித்ரு தர்ப்பணம்."
    }
  }
};

/** 7 Varas (Weekdays) Remedies & Colors */
export const VARA_REMEDY_DATA: Record<number, {
  dayName: Record<string, string>;
  graha: PlanetName;
  color: Record<string, string>;
  sadhana: Record<string, string>;
}> = {
  0: { // Sunday
    dayName: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிற்றுக்கிழமை" },
    graha: PlanetName.Sun,
    color: { kn: "ತಾಮ್ರ ಕೆಂಪು ಅಥವಾ ಬಂಗಾರದ ಹಳದಿ", en: "Copper Red or Golden Yellow", hi: "ताम्र लाल अथवा सुनहरा", te: "ఎరుపు లేదా బంగారు పసుపు", ta: "செம்பு சிவப்பு அல்லது பொன் மஞ்சள்" },
    sadhana: {
      kn: "ಸೂರ್ಯೋದಯಕ್ಕೆ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯಾರ್ಘ್ಯ ನೀಡಿ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ಸಂಜೆ ಉಪ್ಪಿಲ್ಲದ ಆಹಾರ ಸೇವಿಸುವುದು ಶ್ರೇಷ್ಠ.",
      en: "Offer copper-vessel water to rising Sun; chant Aditya Hrudayam. Minimize salt at sunset.",
      hi: "सूर्योदय पर तांबे के पात्र से अर्घ्य दें और आदित्य हृदय स्तोत्र पढ़ें।",
      te: "సూర్యునికి అర్ఘ్యం మరియు ఆదిత్య హృదయ స్తోత్ర పఠనం.",
      ta: "சூரிய உதயத்தில் அர்க்கியம் மற்றும் ஆதித்ய ஹ்ருதயம்."
    }
  },
  1: { // Monday
    dayName: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கட்கிழமை" },
    graha: PlanetName.Moon,
    color: { kn: "ಶುದ್ಧ ಬಿಳಿ ಅಥವಾ ಮುತ್ತಿನ ಬಣ್ಣ", en: "Pure White or Pearl Cream", hi: "श्वेत अथवा मोतिया", te: "తెలుపు లేదా ముత్యపు రంగు", ta: "தூய வெள்ளை அல்லது முத்து நிறம்" },
    sadhana: {
      kn: "ಶಿವಲಿಂಗಕ್ಕೆ ಹಸಿ ಹಾಲಿನ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ, 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ. ಮನಸ್ಸಿನಲ್ಲಿ ತಂಪಾದ ಶಾಂತಿ ಭಾವನೆ ತಂದುಕೊಳ್ಳಿ.",
      en: "Offer raw milk abhisheka to Shiva Linga; chant Om Namah Shivaya 108 times for tranquil emotional calm.",
      hi: "शिवलिंग पर कच्चा दूध चढ़ाएं और ॐ नमः शिवाय का १०८ बार जप करें।",
      te: "శివలింగానికి పాలాభిషేకం మరియు శివ పంచాక్షరి జపం.",
      ta: "சிவனுக்கு பால் அபிஷேகம் மற்றும் ஓம் நம சிவாய ஜபம்."
    }
  },
  2: { // Tuesday
    dayName: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்க்கிழமை" },
    graha: PlanetName.Mars,
    color: { kn: "ಹವಳ ಕೆಂಪು ಅಥವಾ ಕೇಸರಿ", en: "Coral Red or Saffron", hi: "लाल अथवा केसरिया", te: "ఎరుపు లేదా కాషాయం", ta: "சிவப்பு அல்லது காவி" },
    sadhana: {
      kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಮಾಡಿ. ಕೋಪ ಬರದಂತೆ ಎಚ್ಚರವಹಿಸಿ, ಸೋಂಪು ನೀರು ಸೇವಿಸಿ.",
      en: "Recite Subrahmanya Bhujangam or Hanuman Chalisa. Control sudden temper; drink cooling fennel water.",
      hi: "हनुमान चालीसा का पाठ करें और क्रोध पर नियंत्रण रखें।",
      te: "హనుమాన్ చాలీసా మరియు సుబ్రహ్మణ్య స్వామి పూజ.",
      ta: "ஹனுமான் சாலிசா பாராயணம் மற்றும் கோப கட்டுப்பாடு."
    }
  },
  3: { // Wednesday
    dayName: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்கிழமை" },
    graha: PlanetName.Mercury,
    color: { kn: "ಗಿಳಿ ಹಸಿರು ಅಥವಾ ಎಲೆ ಹಸಿರು", en: "Parrot Green or Leaf Green", hi: "हरा", te: "ఆకుపచ్చ", ta: "பச்சை" },
    sadhana: {
      kn: "ತುಳಸಿ ಗಿಡಕ್ಕೆ ನೀರೆರೆದು, ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ. ಹಸುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು ಅಥವಾ ನೆನೆಸಿದ ಹೆಸರುಕಾಳು ನೀಡಿ.",
      en: "Water the Tulasi plant; recite Vishnu Sahasranama. Feed green fodder or soaked green moong to cows.",
      hi: "तुलसी को जल दें एवं गायों को हरा चारा खिलाएं।",
      te: "తులసి పూజ మరియు గోవులకు పచ్చిగడ్డి తినిపించడం.",
      ta: "துளசி பூஜை மற்றும் பசுவுக்கு பசும்புல் அளித்தல்."
    }
  },
  4: { // Thursday
    dayName: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழக்கிழமை" },
    graha: PlanetName.Jupiter,
    color: { kn: "ಅರಿಶಿನ ಹಳದಿ ಅಥವಾ ಬಂಗಾರ", en: "Turmeric Yellow or Golden", hi: "पीला", te: "పసుపు", ta: "மஞ்சள்" },
    sadhana: {
      kn: "ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಅಥವಾ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿಗಳ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ. ಹಣೆಗೆ ಶ್ರೀಗಂಧ ಲೇಪಿಸಿ, ಗುರುಹಿರಿಯರಿಗೆ ನಮಸ್ಕರಿಸಿ.",
      en: "Worship Guru Dakshinamurthy/Dattatreya; apply chandan tilak on forehead and seek elders' blessings.",
      hi: "गुरु वंदना करें, मस्तक पर चंदन लगाएं और पीला भोजन ग्रहण करें।",
      te: "గురు పూజ మరియు పెద్దల ఆశీర్వాదం తీసుకోవడం.",
      ta: "குரு வழிபாடு மற்றும் நெற்றியில் சந்தன திலகம்."
    }
  },
  5: { // Friday
    dayName: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளிக்கிழமை" },
    graha: PlanetName.Venus,
    color: { kn: "ರೇಷ್ಮೆ ಶ್ವೇತ ಅಥವಾ ತಿಳಿ ಗುಲಾಬಿ", en: "Silken White or Soft Pink", hi: "सफेद अथवा गुलाबी", te: "తెలుపు లేదా లేత గులాబీ", ta: "வெள்ளை அல்லது இளஞ்சிவப்பு" },
    sadhana: {
      kn: "ಮಹಾಲಕ್ಷ್ಮೀಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ಮನೆಯಲ್ಲಿ ಸುವಾಸನೆ ಮತ್ತು ಶುಚಿತ್ವ ಕಾಪಾಡಿ.",
      en: "Light pure cow ghee lamp before Goddess Mahalakshmi; chant Kanakadhara Stotra for beauty and grace.",
      hi: "मां महालक्ष्मी के आगे घी का दीपक जलाएं और कनकधारा स्तोत्र पढ़ें।",
      te: "లక్ష్మీ పూజ మరియు కనకధారా స్తోత్రం.",
      ta: "மகாலட்சுமிக்கு நெய் தீபம் மற்றும் கனகதாரா ஸ்தோத்திரம்."
    }
  },
  6: { // Saturday
    dayName: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனிக்கிழமை" },
    graha: PlanetName.Saturn,
    color: { kn: "ಗಾಢ ನೀಲಿ ಅಥವಾ ಕಪ್ಪು", en: "Deep Navy Blue or Charcoal", hi: "गहरा नीला अथवा काला", te: "నలుపు లేదా నీలం", ta: "கருநீலம் அல்லது கருப்பு" },
    sadhana: {
      kn: "ಅಶ್ವತ್ಥ ವೃಕ್ಷದ ಬುಡದಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆಯ ದೀಪ ಹಚ್ಚಿ. ಕಾಗೆಗಳಿಗೆ ಅನ್ನ ಹಾಕಿ, ನಿರ್ಗತಿಕರಿಗೆ ಅಥವಾ ಅಶಕ್ತರಿಗೆ ಸಹಾಯ ಮಾಡಿ.",
      en: "Light sesame oil lamp under Peepal tree; feed black crows and offer help to disabled/elderly workers.",
      hi: "पीपल के वृक्ष के पास तिल के तेल का दीपक रखें और कौवों को भोजन दें।",
      te: "రావి చెట్టు కింద నువ్వుల నూనె దీపం మరియు కాకులకు అన్నం.",
      ta: "அரச மரத்தடியில் நல்லெண்ணெய் தீபம் மற்றும் காக்கைக்கு உணவு."
    }
  }
};

/** 8+ Classical Multilingual Stotras Repository */
export const CLASSICAL_STOTRAS_CATALOG = [
  {
    id: "chandrashekhara_ashtakam",
    forAffliction: ["anger_temper", "mental_anxiety", "pitta"],
    title: {
      kn: "ಶ್ರೀ ಚಂದ್ರಶೇಖರಾಷ್ಟಕಂ (ಕ್ರೋಧ & ಶತ್ರು ಭಯ ನಿವಾರಕ)",
      en: "Shri Chandrashekhara Ashtakam (Anger & Fear Pacifier)",
      hi: "श्री चन्द्रशेखराष्टकम् (क्रोध एवं भय नाशक)",
      te: "శ్రీ చంద్రశేఖరాష్టకం (క్రోధ నివారణ)",
      ta: "ஸ்ரீ சந்திரசேகராஷ்டகம் (கோப சாந்தி)"
    },
    dedicatedTo: { kn: "ಶ್ರೀ ಮಹಾದೇವ (ಚಂದ್ರಮೌಳೀಶ್ವರ)", en: "Lord Shiva (Chandrashekhara)", hi: "भगवान शिव", te: "పరమశివుడు", ta: "சிவபெருமான்" },
    shlokaSanskrit: `चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर पाहि माम् ।
चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर रक्ष माम् ॥
रत्नसानुशरासनं रजताद्रिश्रृङ्गनिकेतनं
शिञ्जिनीकृतपन्नगेश्वरमच्युतानलसायकम् ।
क्षिप्रदग्धपुरत्रयं त्रिदिवेश्वरैरभिवन्दितं
चन्द्रशेखरमाश्रये मम किं करिष्यति वै यमः ॥`,
    shlokaKannada: `ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಪಾಹಿ ಮಾಮ್ ।
ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ಚಂದ್ರಶೇಖರ ರಕ್ಷ ಮಾಮ್ ॥
ರತ್ನಸಾನುಶರಾಸನಂ ರಜತಾದ್ರಿಶೃಂಗನಿಕೇತನಂ
ಶಿಞ್ಜಿನೀಕೃತಪನ್ನಗೇಶ್ವರಮಚ್ಯುತಾನಲಸಾಯಕಮ್ ।
ಕ್ಷಿಪ್ರದಗ್ಧಪುರತ್ರಯಂ ತ್ರಿದಿವೇಶ್ವರೈರಭಿವಂದಿತಂ
ಚಂದ್ರಶೇಖರಮಾಶ್ರಯೇ ಮಮ ಕಿಂ ಕರಿಷ್ಯತಿ ವೈ ಯಮಃ ॥`,
    shlokaTelugu: `చంద్రశేఖర చంద్రశేఖర చంద్రశేఖర పాహి మామ్ ।
చంద్రశేఖర చంద్రశేఖర చంద్రశేఖర రక్ష మామ్ ॥
రత్నసానుశరాసనం రజతాద్రిశృంగనికేతనం
శింజినీకృతపన్నగేశ్వరమచ్యుతానలసాయకమ్ ।
క్షిప్రదగ్ధపురత్రయం త్రిదివేశ్వరైరభివందితం
చంద్రశేఖరమాశ్రయే మమ కిం కరిష్యతి వై యమః ॥`,
    shlokaTamil: `சந்த்ரசேகர சந்த்ரசேகர சந்த்ரசேகர பாஹி மாம் ।
சந்த்ரசேகர சந்த்ரசேகர சந்த்ரசேகர ரக்ஷ மாம் ॥
ரத்னஸானுசராஸனம் ரஜதாத்ரிச்ரும்கநிகேதனம்
சிஞ்ஜினீக்ருதபன்னகேச்வரமச்யுதானலஸாயகம் ।
க்ஷிப்ரதக்தபுரத்ரயம் த்ரிதிவேச்வரைரபிவந்திதம்
சந்த்ரசேகரமாச்ரயே மம கிம் கரிஷ்யதி வை யமஃ ॥`,
    shlokaHindi: `चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर पाहि माम् ।
चन्द्रशेखर चन्द्रशेखर चन्द्रशेखर रक्ष माम् ॥
रत्नसानुशरासनं रजताद्रिश्रृङ्गनिकेतनं
शिञ्जिनीकृतपन्नगेश्वरमच्युतानलसायकम् ।
क्षिप्रदग्धपुरत्रयं त्रिदिवेश्वरैरभिवन्दितं
चन्द्रशेखरमाश्रये मम किं करिष्यति वै यमः ॥`,
    transliteration: "Chandrashekhara Chandrashekhara Chandrashekhara Pahi Mam | Chandrashekhara Chandrashekhara Chandrashekhara Raksha Mam ||",
    meaning: {
      kn: "ಶಿರದಲ್ಲಿ ತಂಪಾದ ಚಂದ್ರನನ್ನು ಧರಿಸಿದ ಹೇ ಚಂದ್ರಶೇಖರ ಮಹಾದೇವನೇ, ನನ್ನ ಮನಸ್ಸಿನ ಸಮಸ್ತ ಕ್ರೋಧ, ತಾಪ ಮತ್ತು ಆಪತ್ತುಗಳಿಂದ ನನ್ನನ್ನು ಸದಾ ಕಾಪಾಡು.",
      en: "O Lord Chandrashekhara, who adorns the cooling crescent moon, douse all raging anger, fear, and passions within me.",
      hi: "शीतल चन्द्रमा धारण करने वाले हे शिव, मेरे समस्त क्रोध और संताप को शांत कर रक्षा करें।",
      te: "చంద్రుని ధరించిన ఓ పరమశివా, నాలోని కోపాన్ని హరించి రక్షించు.",
      ta: "சந்திரனை சூடிய சிவபெருமானே, என் கோபத்தை தணித்து காத்தருள்வீராக."
    },
    spiritualBenefits: {
      kn: "ಪ್ರತಿದಿನ ಪಠಿಸುವುದರಿಂದ ರಕ್ತದೊತ್ತಡ, ತೀವ್ರ ಕೋಪ, ಶತ್ರು ಭಯ ನಿವಾರಣೆಯಾಗಿ ಮನಶ್ಶಾಂತಿ ಸಿಗುತ್ತದೆ.",
      en: "Pacifies high blood pressure, explosive temper, panic spikes, and bestows calm poise.",
      hi: "रक्तचाप, तीव्र क्रोध और भय का नाश होकर परम शांति प्राप्त होती है।",
      te: "కోపం తగ్గి సంపూర్ణ మనశ్శాంతి లభిస్తుంది.",
      ta: "கோபத்தை குறைத்து மன அமைதியை தரும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಅಥವಾ ಕೋಪ ಬಂದ ತಕ್ಷಣ", en: "Daily evening during twilight or when agitated", hi: "संध्या समय अथवा क्रोध आने पर", te: "సాయంత్రం లేదా కోపం వచ్చినప్పుడు", ta: "மாலை நேரத்தில் அல்லது கோபம் வரும்போது" },
    facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "North or East", hi: "उत्तर अथवा पूर्व दिशा", te: "ఉత్తరం లేదా తూర్పు దిశ", ta: "வடக்கு அல்லது கிழக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "१ से ३ बार", te: "1 నుండి 3 సార్లు", ta: "1 முதல் 3 முறை" }
  },
  {
    id: "aditya_hrudayam",
    forAffliction: ["health_vitality", "sun_affliction", "career_obstacles"],
    title: {
      kn: "ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರಮ್ (ಆತ್ಮಬಲ & ವಿಜಯ ಸಿದ್ಧಿ)",
      en: "Shri Aditya Hrudayam (Vitality & All-Obstacle Conquest)",
      hi: "श्री आदित्य हृदय स्तोत्रम् (आत्मबल एवं विजय)",
      te: "శ్రీ ఆదిత్య హృదయ స్తోత్రం",
      ta: "ஸ்ரீ ஆதித்ய ஹ்ருதயம்"
    },
    dedicatedTo: { kn: "ಭಗವಾನ್ ಸೂರ್ಯನಾರಾಯಣ", en: "Lord Surya Narayana", hi: "भगवान सूर्य", te: "సూర్య భగవానుడు", ta: "சூரிய பகவான்" },
    shlokaSanskrit: `ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥
दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।
उपागम्याब्रवीद्राममगस्त्यो भगवानृषिः ॥
आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।
जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥`,
    shlokaKannada: `ತತೋ ಯುದ್ಧಪರಿಶ್ರಾಂತಂ ಸಮರೇ ಚಿಂತಯಾ ಸ್ಥಿತಮ್ ।
ರಾವಣಂ ಚಾಗ್ರತೋ ದೃಷ್ಟ್ವಾ ಯುದ್ಧಾಯ ಸಮುಪಸ್ಥಿತಮ್ ॥
ದೈವತೈಶ್ಚ ಸಮಾಗಮ್ಯ ದ್ರಷ್ಟುಮಭ್ಯಾಗತೋ ರಣಮ್ ।
ಉಪಾಗಮ್ಯಾಬ್ರವೀದ್ರಾಮಮಗಸ್ತ್ಯೋ ಭಗವಾನೃಷಿಃ ॥
ಆದಿತ್ಯಹೃದಯಂ ಪುಣ್ಯಂ ಸರ್ವಶತ್ರುವಿನಾಶನಮ್ ।
ಜಯಾವಹಂ ಜಪೇನ್ನಿತ್ಯಮಕ್ಷಯಂ ಪರಮಂ ಶಿವಮ್ ॥`,
    shlokaTelugu: `తతో యుద్ధపరిశ్రాంతం సమరే చింతయా స్థితమ్ ।
రావణం చాగ్రతో దృష్ట్వా యుద్ధాయ సముపస్థితమ్ ॥
ఆదిత్యహృదయం పుణ్యం సర్వశత్రువినాశనమ్ ।
జయావహం జపేన్నిత్యమక్షయం పరమం శివమ్ ॥`,
    shlokaTamil: `ததோ யுத்தபரிச்ராந்தம் ஸமரே சிந்தயா ஸ்திதம் ।
ராவணம் சாக்ரதோ த்ருஷ்ட்வா யுத்தாய ஸமுபஸ்திதம் ॥
ஆதித்யஹ்ருதயம் புண்யம் ஸர்வசத்ருவினாசனம் ।
ஜயாவஹம் ஜபேந்நித்யமக்ஷயம் பரமம் சிவம் ॥`,
    shlokaHindi: `ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥
आदित्यहृदयं पुण्यं सर्वशत्रुविनाशनम् ।
जयावहं जपेन्नित्यमक्षयं परमं शिवम् ॥`,
    transliteration: "Tato Yuddha Parishrāntaṁ Samarē Chintayā Sthitam | Ādityahṛdayaṁ Puṇyaṁ Sarva Shatru Vināshanam ||",
    meaning: {
      kn: "ಸರ್ವ ಶತ್ರುಗಳನ್ನು ಮತ್ತು ಅಂತರಂಗದ ಕತ್ತಲೆಯನ್ನು ಭಸ್ಮ ಮಾಡಿ ವಿಜಯ ಹಾಗೂ ಆರೋಗ್ಯವನ್ನು ಕರುಣಿಸುವ ಆದಿತ್ಯ ಹೃದಯವನ್ನು ನಿತ್ಯ ಜಪಿಸಿ.",
      en: "Recite the all-auspicious Aditya Hrudayam to dispel inner fear, chronic exhaustion, and secure absolute victory.",
      hi: "समस्त शत्रुओं और दुर्बलताओं का नाश करने वाले पावन आदित्य हृदय का नित्य पाठ करें।",
      te: "సర్వ శత్రువులను నాశనం చేసి విజయాన్ని అందించే ఆదిత్య హృదయాన్ని నిత్యం జపించండి.",
      ta: "எல்லா தடைகளையும் நீக்கி வெற்றி தரும் ஆதித்ய ஹ்ருதயத்தை தினமும் படிக்கவும்."
    },
    spiritualBenefits: {
      kn: "ಆತ್ಮವಿಶ್ವಾಸ, ಕಣ್ಣಿನ ತೇಜಸ್ಸು, ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವ ಹೆಚ್ಚಿಸುತ್ತದೆ.",
      en: "Enhances leadership vitality, eyesight luster, and eliminates chronic fatigue.",
      hi: "आत्मबल, तेज, स्वास्थ्य एवं कार्यक्षेत्र में सफलता प्रदान करता है।",
      te: "ఆరోగ్యం, ఆత్మవిశ్వాసం పెరుగుతుంది.",
      ta: "ஆரோக்கியம், தைரியம் பெருகும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ (ಭಾನುವಾರ ವಿಶೇಷ)", en: "Daily at sunrise (especially Sundays)", hi: "सूर्योदय के समय", te: "సూర్యోదయ సమయంలో", ta: "சூரிய உதய வேளையில்" },
    facingDirection: { kn: "ಪೂರ್ವ ದಿಕ್ಕು", en: "East", hi: "पूर्व दिशा", te: "తూర్పు దిశ", ta: "கிழக்கு திசை" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "१ से ३ बार", te: "1 నుండి 3 సార్లు", ta: "1 முதல் 3 முறை" }
  },
  {
    id: "hanuman_sankata_mochana",
    forAffliction: ["career_obstacles", "saturn_affliction", "sade_sati"],
    title: {
      kn: "ಸಂಕಟಮೋಚನ ಹನುಮಾನಾಷ್ಟಕಮ್ (ಸರ್ವ ಸಂಕಟ ನಿವಾರಕ)",
      en: "Sankata Mochana Hanuman Ashtakam (All-Crisis Destroyer)",
      hi: "संकटमोचन हनुमानाष्टकम् (सर्व संकट नाशक)",
      te: "సంకటమోచన హనుమానాష్టకం",
      ta: "சங்கடமோசன ஹனுமனாஷ்டகம்"
    },
    dedicatedTo: { kn: "ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ", en: "Lord Hanuman", hi: "भगवान हनुमान", te: "శ్రీ హనుమంతుడు", ta: "ஸ்ரீ ஆஞ்சநேயர்" },
    shlokaSanskrit: `बाल समय रवि भक्ष लियो तब, तीनहुं लोक भयो अंधियारों ।
ताहि सों त्रास भयो जग को, यह संकट काहु सों जात न टारो ॥
देवन आनि करी बिनती तब, छांड़ि दियो रवि कष्ट निवारो ।
को नहिं जानत है जग में कपि, संकटमोचन नाम तिहारो ॥`,
    shlokaKannada: `ಬಾಲ ಸಮಯ ರವಿ ಭಕ್ಷ ಲಿಯೋ ತಬ, ತೀನಹುಂ ಲೋಕ ಭಯೋ ಅಂಧಿಯಾರೋಂ ।
ತಾಹಿ ಸೋಂ ತ್ರಾಸ ಭಯೋ ಜಗ ಕೋ, ಯಹ ಸಂಕಟ ಕಾಹು ಸೋಂ ಜಾತ ನ ಟಾರೋ ॥
ದೇವನ ಆನಿ ಕರೀ ಬಿನತೀ ತಬ, ಛಾಂಢಿ ದಿಯೋ ರವಿ ಕಷ್ಟ ನಿವಾರೋ ।
ಕೋ ನಹಿಂ ಜಾನತ ಹೈ ಜಗ ಮೇಂ ಕಪಿ, ಸಂಕಟಮೋಚನ ನಾಮ ತಿಹಾರೋ ॥`,
    shlokaTelugu: `బాల సమయ రవి భక్ష లియో తబ, తీనహుం లోక భయో అంధియారోం ।
తాహి సోం త్రాస భయో జగ కో, యహ సంకట కాహు సోం జాత న టారో ॥
కో నహిం జానత హై జగ మేం కపి, సంకటమోచన నామ తిహారో ॥`,
    shlokaTamil: `பால ஸமய ரவி பக்ஷ லியோ தப, தீனஹும் லோக பயோ அந்தியாரோம் ।
தாஹி ஸோம் த்ராஸ பயோ ஜக கோ, யஹ ஸங்கட காஹு ஸோம் ஜாத ந டாரோ ॥
கோ நஹிம் ஜானத ஹை ஜக மேம் கபி, ஸங்கடமோசன நாம திஹாரோ ॥`,
    shlokaHindi: `बाल समय रवि भक्ष लियो तब, तीनहुं लोक भयो अंधियारों ।
ताहि सों त्रास भयो जग को, यह संकट काहु सों जात न टारो ॥
को नहिं जानत है जग में कपि, संकटमोचन नाम तिहारो ॥`,
    transliteration: "Bāla Samaya Ravi Bhakṣa Liyō Taba, Tīnahuṁ Lōka Bhayō Andhiyārōṁ | Kō Nahiṁ Jānata Hai Jaga Mēṁ Kapi, Saṅkaṭamōcana Nāma Tihārō ||",
    meaning: {
      kn: "ಬಾಲ್ಯದಲ್ಲೇ ಸೂರ್ಯನನ್ನು ಹಿಡಿದು ಜಗತ್ತಿನ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸಿದ ಹೇ ಸಂಕಟಮೋಚನ ಹನುಮಂತನೇ, ನನ್ನ ಸಮಸ್ತ ಕಷ್ಟಗಳನ್ನು ಪರಿಹರಿಸು.",
      en: "O supreme Hanuman, who as a child consumed the Sun to relieve universal despair, dispel all deep-seated crises from my life.",
      hi: "बाल्यावस्था में ही सूर्य को ग्रसकर तीनों लोकों का संकट हरने वाले हे हनुमान, हमारे संकटों को दूर करें।",
      te: "సమస్త కష్టాలను హరించే ఓ హనుమా, మా సంకటాలను నివారించు.",
      ta: "எல்லா துன்பங்களையும் போக்கும் ஸ்ரீ ஹனுமனே, என் சங்கடங்களை தீர்த்து அருள்க."
    },
    spiritualBenefits: {
      kn: "ಶನಿ ಸಾಡೇಸಾತಿ, ಗ್ರಹದೋಷ, ದುಷ್ಟ ಶಕ್ತಿ ಹಾಗೂ ಮಾನಸಿಕ ಭಯಗಳನ್ನು ಸಂಪೂರ್ಣ ನಾಶಪಡಿಸುತ್ತದೆ.",
      en: "Shields against Saturn Sade Sati distress, evil eye, inertia, and psychic despondency.",
      hi: "शनि साढ़ेसाती, भय और संकटों का तत्काल निवारण करता है।",
      te: "శని దోషాలు మరియు భయాలను తొలగిస్తుంది.",
      ta: "சனி தோஷம் மற்றும் பயத்தை அடியோடு நீக்கும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸಂಜೆ (ಮಂಗಳವಾರ ಮತ್ತು ಶನಿವಾರ ವಿಶೇಷ)", en: "Daily evening (especially Tuesdays and Saturdays)", hi: "सायंकाल (मंगलवार एवं शनिवार)", te: "సాయంత్రం (మంగళ, శనివారాలు)", ta: "மாலை வேளையில் (செவ்வாய், சனி)" },
    facingDirection: { kn: "ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣ ದಿಕ್ಕು", en: "East or South", hi: "पूर्व अथवा दक्षिण दिशा", te: "తూర్పు లేదా దక్షిణం", ta: "கிழக்கு அல்லது தெற்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೮ ಬಾರಿ", en: "1 to 8 Times Daily", hi: "१ से ८ बार", te: "1 నుండి 8 సార్లు", ta: "1 முதல் 8 முறை" }
  },
  {
    id: "subrahmanya_bhujangam",
    forAffliction: ["anger_temper", "mars_affliction", "kuja_dosha", "sarpa_dosha"],
    title: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಭುಜಂಗಮ್ (ಕುಜದೋಷ & ಸರ್ಪದೋಷ ನಿವಾರಕ)",
      en: "Shri Subrahmanya Bhujangam (Mars & Sarpa Dosha Healer)",
      hi: "श्री सुब्रह्मण्य भुजङ्गम् (कुज एवं सर्प दोष नाशक)",
      te: "శ్రీ సుబ్రహ్మణ్య భుజంగం",
      ta: "ஸ்ரீ சுப்ரமண்ய புஜங்கம்"
    },
    dedicatedTo: { kn: "ಭಗವಾನ್ ಸುಬ್ರಹ್ಮಣ್ಯ (ಕಾರ್ತಿಕೇಯ)", en: "Lord Subrahmanya", hi: "भगवान कार्तिकेय", te: "సుబ్రహ్మణ్యేశ్వర స్వామి", ta: "ஸ்ரீ முருகன்" },
    shlokaSanskrit: `सदा बालरूपापि विघ्नाद्रिहन्त्री
महादन्तिवक्त्रापि पञ्चास्यमान्या ।
विधीन्द्रादिमृग्या गणेषाभिधा मे
प्रहृष्टा भवत्तुण्डतुण्डेवदत्ता ॥
सुवर्णाभदिव्याम्बराद्यैर्विचित्रैः
समुद्भासमानां सुतेजःप्रभावाम् ।
शिखीन्द्रस्थितां शक्तिहस्तां त्रिनेत्रां
गुहं भावये कुक्कुटच्छत्रशोभाम् ॥`,
    shlokaKannada: `ಸದಾ ಬಾಲರೂಪಾಪಿ ವಿಘ್ನಾದ್ರಿಹಂತ್ರೀ
ಮಹಾದಂತಿವಕ್ತ್ರಾಪಿ ಪಞ್ಚಾಸ್ಯಮಾನ್ಯಾ ।
ವಿಧೀಂದ್ರಾದಿಮೃಗ್ಯಾ ಗಣೇಷಾಭಿಧಾ ಮೇ
ಪ್ರಹೃಷ್ಟಾ ಭವತ್ತುಂಡತುಂಡೇವದತ್ತಾ ॥
ಸುವರ್ಣಾಭದಿವ್ಯಾಂಬರಾದ್ಯೈರ್ವಿಚಿತ್ರೈಃ
ಸಮುದ್ಭಾಸಮಾನಾಂ ಸುತೇಜಃಪ್ರಭಾವಾಮ್ ।
ಶಿಖೀಂದ್ರಸ್ಥಿತಾಂ ಶಕ್ತಿಹಸ್ತಾಂ ತ್ರಿನೇತ್ರಾಂ
ಗುಹಂ ಭಾವಯೇ ಕುಕ್ಕುಟಚ್ಛತ್ರಶೋಭಾಮ್ ॥`,
    shlokaTelugu: `సదా బాలరూపాపి విఘ్నాద్రిహంత్రీ
మహాదంతివక్త్రాపి పంచాస్యమాన్యా ।
సువర్ణాభదివ్యాంబరాద్యైర్విచిత్రైః
సముద్భాసమానాం సుతేజఃప్రభావామ్ ।
గుహం భావయే కుక్కుటచ్ఛత్రశోభామ్ ॥`,
    shlokaTamil: `ஸதா பாலரூபாபி விக்னாத்ரிஹந்த்ரீ
மஹாதந்திவக்த்ராபி பஞ்சாஸ்யமான்யா ।
ஸுவர்ணாப திவ்யாம்பராத்யைர் விசித்ரைஃ
ஸமுத் பாஸமானாம் ஸுதேஜஃப்ரபாவாம் ।
குஹம் பாவயே குக்குடச்சத்ரசோபாம் ॥`,
    shlokaHindi: `सदा बालरूपापि विघ्नाद्रिहन्त्री
महादन्तिवक्त्रापि पञ्चास्यमान्या ।
सुवर्णाभदिव्याम्बराद्यैर्विचित्रैः
समुद्भासमानां सुतेजःप्रभावाम् ।
गुहं भावये कुक्कुटच्छत्रशोभाम् ॥`,
    transliteration: "Sadā Bālarūpāpi Vighnādrihantrī Mahādantivaktrāpi Pañcāsyamānyā | Guhaṁ Bhāvayē Kukkuṭacchatraśōbhām ||",
    meaning: {
      kn: "ಮಯೂರವಾಹನನಾದ, ಶಕ್ತಿ ಆಯುಧ ಧರಿಸಿದ ಷಣ್ಮುಖ ಸುಬ್ರಹ್ಮಣ್ಯನೇ, ಕುಜ ದೋಷ ಹಾಗೂ ಸರ್ಪ ದೋಷಗಳಿಂದ ನನ್ನನ್ನು ಪಾರುಮಾಡು.",
      en: "O supreme Lord Guha, commander of cosmic forces who rides the peacock, dissolve all Mars-induced fury and karmic serpent knots.",
      hi: "मयूर वाहन पर आरूढ़ शक्तिधर कार्तिकेय, हमारे समस्त मंगल व सर्प दोषों का शमन करें।",
      te: "శక్తిహస్తుడైన సుబ్రహ్మణ్య స్వామి మా సమస్త కుజ మరియు సర్ప దోషాలను నివారించుగాక.",
      ta: "மயில் வாகனனான முருகப்பெருமானே, என் செவ்வாய் மற்றும் சர்ப்ப தோஷங்களை நீக்கியருள்க."
    },
    spiritualBenefits: {
      kn: "ಕುಜದೋಷ, ರಕ್ತದೋಷ, ವಿವಾಹ ವಿಳಂಬ ಹಾಗೂ ಸರ್ಪಬಾಧೆಯನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ನಿವಾರಿಸುತ್ತದೆ.",
      en: "Cures blood disorders, harmonizes Manglik marriage hurdles, and dissolves snake curses.",
      hi: "मांगलिक दोष, रक्त विकार और विवाह बाधाओं का निवारण होता है।",
      te: "కుజ దోషం మరియు వివాహ ఆటంకాలు తొలగుతాయి.",
      ta: "செவ்வாய் தோஷம் மற்றும் திருமண தடைகள் நீங்கும்."
    },
    bestTimeToRecite: { kn: "ಮಂಗಳವಾರ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ", en: "Tuesday morning or evening", hi: "मंगलवार प्रातः अथवा संध्या", te: "మంగళవారం ఉదయం లేదా సాయంత్రం", ta: "செவ்வாய்க்கிழமை காலை அல்லது மாலை" },
    facingDirection: { kn: "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕು", en: "East or North", hi: "पूर्व अथवा उत्तर दिशा", te: "తూర్పు లేదా ఉత్తరం", ta: "கிழக்கு அல்லது வடக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ಬಾರಿ", en: "Once Daily", hi: "प्रतिदिन १ बार", te: "రోజుకు 1 సారి", ta: "தினமும் 1 முறை" }
  },
  {
    id: "kanakadhara_stotra",
    forAffliction: ["relationship_friction", "venus_affliction", "financial_blocks"],
    title: {
      kn: "ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರಮ್ (ದರಿದ್ರ್ಯ ನಾಶಕ & ಐಶ್ವರ್ಯ ವೃದ್ಧಿ)",
      en: "Shri Kanakadhara Stotram (Wealth & Venus Harmonizer)",
      hi: "श्री कनकधारा स्तोत्रम् (दारिद्र्य नाशक एवं ऐश्वर्य प्रदाता)",
      te: "శ్రీ కనకధారా స్తోత్రం",
      ta: "ஸ்ரீ கனகதாரா ஸ்தோத்திரம்"
    },
    dedicatedTo: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ದೇವಿ", en: "Goddess Mahalakshmi", hi: "माता महालक्ष्मी", te: "మహాలక్ష్మీ దేవి", ta: "ஸ்ரீ மகாலட்சுமி" },
    shlokaSanskrit: `अङ्कं हरेः पुलकभूषणमाश्रयन्ती
भृङ्गाङ्गनेव मुकुलाभरणं तमालम् ।
अङ्गीकृताखिलविभूतिरपाङ्गलीला
माङ्गल्यदास्तु मम मङ्गलदेवतायाः ॥
मुग्धा मुहुर्विदधती वदने मुरारेः
प्रेमत्रपाप्रणिहितानि गतागतानि ।
माला दृशोर्मधुकरीव महोत्पले या
सा मे श्रियं दिशतु सागरसंभवायाः ॥`,
    shlokaKannada: `ಅಙ್ಕಂ ಹರೇಃ ಪುಲಕಭೂಷಣಮಾಶ್ರಯನ್ತೀ
ಭೃಙ್ಗಾಙ್ಗನೇವ ಮುಕುಲಾಭರಣಂ ತಮಾಲಮ್ ।
ಅಙ್ಗೀಕೃತಾಖಿಲವಿಭೂತಿರಪಾಙ್ಗಲೀಲಾ
ಮಾಙ್ಗಲ್ಯದಾಸ್ತು ಮಮ ಮಙ್ಗಲದೇವತಾಯಾಃ ॥
ಮುಗ್ಧಾ ಮುಹುರ್ವಿದಧತೀ ವದನೇ ಮುರಾರೇಃ
ಪ್ರೇಮತ್ರಪಾಪ್ರಣಿಹಿತಾನಿ ಗತಾಗತಾನಿ ।
ಮಾಲಾ ದೃಶೋರ್ಮಧುಕರೀವ ಮಹೋತ್ಪಲೇ ಯಾ
ಸಾ ಮೇ ಶ್ರಿಯಂ ದಿಶತು ಸಾಗರಸಂಭವಾಯಾಃ ॥`,
    shlokaTelugu: `అంగం హరేః పులకభూషణమాశ్రయంతీ
భృంగాంగనేవ ముకులాభరణం తమాలమ్ ।
మాంగల్యదాస్తు మమ మంగళదేవతాయాః ॥`,
    shlokaTamil: `அங்கம் ஹரேஃ புலகபூஷணமாச்ரயந்தீ
ப்ருங்காம்கனேவ முகுலாபரணம் தமாலம் ।
மாங்கல்யதாஸ்து மம மங்களதேவதாயாஃ ॥`,
    shlokaHindi: `अङ्गं हरेः पुलकभूषणमाश्रयन्ती
भृङ्गाङ्गनेव मुकुलाभरणं तमालम् ।
माङ्गल्यदास्तु मम मङ्गलदेवतायाः ॥`,
    transliteration: "Aṅgaṁ Harēḥ Pulakabhūṣaṇamāśrayantī Bhṛṅgāṅganēva Mukulābharaṇaṁ Tamālam | Māṅgalyadāstu Mama Maṅgaladēvatāyāḥ ||",
    meaning: {
      kn: "ಶ್ರೀಮನ್ನಾರಾಯಣನ ವಕ್ಷಸ್ಥಳದಲ್ಲಿ ನೆಲೆಸಿರುವ ಹೇ ಮಂಗಳದೇವತೆಯಾದ ಮಹಾಲಕ್ಷ್ಮಿಯೇ, ನಿನ್ನ ಕೃಪಾಕಟಾಕ್ಷದಿಂದ ನನ್ನ ಸಮಸ್ತ ದಾರಿದ್ರ್ಯವನ್ನು ನೀಗಿಸಿ ಸಮೃದ್ಧಿಯನ್ನು ದಯಪಾಲಿಸು.",
      en: "O supreme Goddess Lakshmi, whose compassionate glance showers golden abundance, banish financial friction and bestow domestic peace.",
      hi: "भगवान नारायण के वक्षस्थल पर विराजने वाली माता लक्ष्मी, अपनी कृपादृष्टि से हमारे दारिद्र्य का नाश करें।",
      te: "మహాలక్ష్మి దేవి కటాక్షంతో సమస్త దారిద్య్రం తొలగి సంపద లభించుగాక.",
      ta: "மகாலட்சுமி தாயே, உமது திருவருளால் வறுமை நீங்கி செல்வம் பெருகட்டும்."
    },
    spiritualBenefits: {
      kn: "ಶುಕ್ರ ಗ್ರಹದ ದೋಷ, ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟು, ಸಾಲದ ಬಾಧೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಸಮಾಧಾನವನ್ನು ಪರಿಹರಿಸುತ್ತದೆ.",
      en: "Harmonizes Venus, removes debt burden, and restores domestic sweetness.",
      hi: "शुक्र दोष, ऋण मुक्ति और पारिवारिक सौहार्द की प्राप्ति होती है।",
      te: "శుక్ర దోష నివారణ మరియు లక్ష్మీ కటాక్షం.",
      ta: "சுக்கிர தோஷ நிவர்த்தி மற்றும் லட்சுமி கடாட்சம்."
    },
    bestTimeToRecite: { kn: "ಶುಕ್ರವಾರ ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ ಸಂಧ್ಯಾ ಕಾಲದಲ್ಲಿ", en: "Friday morning or twilight", hi: "शुक्रवार प्रातः अथवा संध्या", te: "శుక్రవారం ఉదయం లేదా సాయంత్రం", ta: "வெள்ளிக்கிழமை காலை அல்லது மாலை" },
    facingDirection: { kn: "ಉತ್ತರ ದಿಕ್ಕು (ಕುಬೇರ ದಿಕ್ಕು)", en: "North (Kubera Direction)", hi: "उत्तर दिशा", te: "ఉత్తర దిశ", ta: "வடக்கு திசை" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ಬಾರಿ", en: "Once Daily", hi: "प्रतिदिन १ बार", te: "రోజుకు 1 సారి", ta: "தினமும் 1 முறை" }
  },
  {
    id: "mahamrityunjaya_stotra",
    forAffliction: ["health_vitality", "ashtama_shani", "maraka_period"],
    title: {
      kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಸ್ತೋತ್ರಮ್ (ಆಯುರ್ವರ್ಧಕ & ಅಕಾಲ ಮೃತ್ಯು ಹರ)",
      en: "Maha Mrityunjaya Stotram (Longevity & Vital Shield)",
      hi: "महामृत्युंजय स्तोत्रम् (आयुर्वर्धक एवं अमंगल नाशक)",
      te: "మహా మృత్యుంజయ స్తోత్రం",
      ta: "மகா மிருத்யுஞ்சய ஸ்தோத்திரம்"
    },
    dedicatedTo: { kn: "ಭಗವಾನ್ ಮೃತ್ಯುಂಜಯ ಶಿವ", en: "Lord Mrityunjaya Shiva", hi: "भगवान मृत्युंजय", te: "మృత్యుంజయ శివుడు", ta: "மிருத்யுஞ்சய பெருமான்" },
    shlokaSanskrit: `त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।
उर्वारुकमिव बन्धनान्मृत्यlineोर्मुक्षीय मामृतात् ॥
मृत्युञ्जयाय रुद्राय नीलकण्ठाय शम्भवे ।
अमृतेशाय शर्वाय महादेवाय ते नमः ॥`,
    shlokaKannada: `ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ ।
ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥
ಮೃತ್ಯುಂಜಯಾಯ ರುದ್ರಾಯ ನೀಲಕಂಠಾಯ ಶಂಭವೇ ।
ಅಮೃತೇಶಾಯ ಶರ್ವಾಯ ಮಹಾದೇವಾಯ ತೇ ನಮಃ ॥`,
    shlokaTelugu: `త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ ।
ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మామృతాత్ ॥`,
    shlokaTamil: `த்ரயம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம் ।
உர்வாருகமிவ பந்தனான் ம்ருத்யோர் முக்ஷீய மாம்ருதாத் ॥`,
    shlokaHindi: `त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।
उर्वारुकमिव बन्धनान्मृत्यlineोर्मुक्षीय मामृतात् ॥`,
    transliteration: "Tryambakaṁ Yajāmahē Sugandhiṁ Puṣṭivardhanam | Urvārukamiva Bandhanān Mṛtyōrmukṣīya Māmṛtāt ||",
    meaning: {
      kn: "ಸುವಾಸನಾಭರಿತ ಹಾಗೂ ಸಮಸ್ತ ಜೀವಿಗಳನ್ನು ಪೋಷಿಸುವ ತ್ರಿನೇತ್ರ ಮಹಾದೇವನನ್ನು ಆರಾಧಿಸುತ್ತೇವೆ. ಬಳ್ಳಿಯಿಂದ ಹಣ್ಣು ಬೇರ್ಪಡುವಂತೆ ಮೃತ್ಯುಭಯದಿಂದ ನಮ್ಮನ್ನು ಮುಕ್ತಗೊಳಿಸು.",
      en: "We venerate the fragrant, all-nourishing Three-Eyed Shiva. Liberate us from mortal perils into immortal consciousness.",
      hi: "समस्त जीवों का पोषण करने वाले त्रिनेत्रधारी भगवान शिव हमारी अकाल मृत्यु से रक्षा करें।",
      te: "సమస్త జీవులను పోషించే పరమశివుడు మృత్యు భయాన్ని తొలగించుగాక.",
      ta: "முக்கண் முதல்வனான சிவபெருமான் எங்களை ஆபத்துக்களிலிருந்து காப்பாராக."
    },
    spiritualBenefits: {
      kn: "ದೀರ್ಘಾಯುಷ್ಯ, ಗಂಭೀರ ರೋಗಗಳಿಂದ ಮುಕ್ತಿ, ಅಪಘಾತ ಭೀತಿ ನಿವಾರಣೆ ಹಾಗೂ ಸಾಡೇಸಾತಿ ಶಾಂತಿ.",
      en: "Safeguards vitality, clears severe chronic ailments, and dissolves fear of sudden mortality.",
      hi: "दीर्घायु, असाध्य रोगों से मुक्ति और शनि की मारक दशा से रक्षा होती है।",
      te: "ఆయుష్షు పెరుగుతుంది మరియు రోగాలు నయమవుతాయి.",
      ta: "நீண்ட ஆயுள் மற்றும் நோய் நொடிகள் நீங்கும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯಕ್ಕೆ ಅಥವಾ ಸಂಜೆ", en: "Sunrise or early morning", hi: "प्रातः सूर्योदय के समय", te: "సూర్యోదయ సమయంలో", ta: "சூரிய உதய வேளையில்" },
    facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "North or East", hi: "उत्तर अथवा पूर्व दिशा", te: "ఉత్తరం లేదా తూర్పు", ta: "வடக்கு அல்லது கிழக்கு" },
    recitationCount: { kn: "೧೧ ಬಾರಿ ಅಥವಾ ೧೦೮ ಬಾರಿ", en: "11 or 108 Times", hi: "११ अथवा १०८ बार", te: "11 లేదా 108 సార్లు", ta: "11 அல்லது 108 முறை" }
  },
  {
    id: "durga_saptashati_aparadha_kshamapana",
    forAffliction: ["mental_anxiety", "rahu_affliction", "ketu_affliction"],
    title: {
      kn: "ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತೀ ಶಾಂತಿ ಸ್ತೋತ್ರಮ್ (ರಾಹು-ಕೇತು & ಮಾನಸಿಕ ಭಯ ನಿವಾರಕ)",
      en: "Shri Durga Saptashati Shanti Stotram (Rahu-Ketu & Astral Armor)",
      hi: "श्री दुर्गा सप्तशती शांति स्तोत्रम् (राहु-केतु एवं भय नाशक)",
      te: "శ్రీ దుర్గా శాంతి స్తోత్రం",
      ta: "ஸ்ரீ துர்கா சாந்தி ஸ்தோத்திரம்"
    },
    dedicatedTo: { kn: "ಜಗನ್ಮಾತೆ ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರೀ", en: "Goddess Durga Parameshwari", hi: "मां दुर्गा", te: "దుర్గా దేవి", ta: "ஸ்ரீ துர்க்கை அம்மன்" },
    shlokaSanskrit: `सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥
शरणागतदीनार्तपरित्राणपरायणे ।
सर्वस्यार्तिहरे देवि नारायणि नमोऽस्तु ते ॥`,
    shlokaKannada: `ಸರ್ವಮಂಗಲಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥಸಾಧಿಕೇ ।
ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಽಸ್ತು ತೇ ॥
ಶರಣಾಗತದೀನಾರ್ತಪರಿತ್ರಾಣಪರಾಯಣೇ ।
ಸರ್ವಸ್ಯಾರ್ತಿಹರೇ ದೇವಿ ನಾರಾಯಣಿ ನಮೋಽಸ್ತು ತೇ ॥`,
    shlokaTelugu: `సర్వమంగళమాంగళ్యే శివే సర్వార్థసాధికే ।
శరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోస్తు తే ॥`,
    shlokaTamil: `ஸர்வமங்கள மாங்கல்யே சிவே ஸர்வார்த்த ஸாதிகே ।
சரன்யே த்ரயம்பகே கௌரி நாராயணி நமோஸ்து தே ॥`,
    shlokaHindi: `सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।
शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥`,
    transliteration: "Sarvamaṅgalamāṅgalyē Śivē Sarvārthasādhikē | Śaraṇyē Tryambakē Gauri Nārāyaṇi Namō'stu Tē ||",
    meaning: {
      kn: "ಸರ್ವ ಮಂಗಲಗಳನ್ನು ಕರುಣಿಸುವ, ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಸಿದ್ಧಿಸುವ ಜಗನ್ಮಾತೆ ಗೌರೀ ನಾರಾಯಣಿಗೆ ಪ್ರಣಾಮಗಳು. ನನ್ನ ಸಮಸ್ತ ದುಃಖ-ಆತಂಕಗಳನ್ನು ಪರಿಹರಿಸು.",
      en: "Salutations to cosmic Mother Durga, fulfiller of all righteous desires. Protect our minds from astral delusions and sudden anxieties.",
      hi: "समस्त मंगलों को देने वाली और सभी कष्टों को हरने वाली मां भगवती को नमन।",
      te: "సర్వ మంగళాలను ప్రసాదించే జగన్మాతకు నమస్కారాలు.",
      ta: "சகல மங்களங்களையும் அருளும் துர்க்கை தாயே போற்றி."
    },
    spiritualBenefits: {
      kn: "ರಾಹು-ಕೇತು ಛಾಯಾ ಗ್ರಹಗಳ ಭಯ, ಭ್ರಮೆ, ನಿದ್ರಾಹೀನತೆ ಹಾಗೂ ಕೆಟ್ಟ ಕನಸುಗಳನ್ನು ದೂರ ಮಾಡುತ್ತದೆ.",
      en: "Eliminates Rahu-Ketu phantom fears, insomnia, panic attacks, and psychic vulnerabilities.",
      hi: "राहु-केतु के दुष्प्रभावों, भ्रम और अनिद्रा से मुक्ति मिलती है।",
      te: "రాహు-కేతు దోషాలు మరియు మానసిక భయాలు తొలగుతాయి.",
      ta: "ராகு-கேது தோஷங்கள் மற்றும் மன பயங்கள் நீங்கும்."
    },
    bestTimeToRecite: { kn: "ಪ್ರತಿದಿನ ಸಂಜೆ ಅಥವಾ ರಾಹುಕಾಲದ ಸಮಯದಲ್ಲಿ", en: "Daily evening or during Rahu Kala", hi: "संध्या समय अथवा राहुकाल में", te: "సాయంత్రం లేదా రాహుకాలంలో", ta: "மாலை அல்லது ராகு காலத்தில்" },
    facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "North or East", hi: "उत्तर दिशा", te: "ఉత్తర దిశ", ta: "வடக்கு திசை" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "१ से ३ बार", te: "1 నుండి 3 సార్లు", ta: "1 முதல் 3 முறை" }
  },
  {
    id: "vishnu_sahasranama_dhyana",
    forAffliction: ["general_alignment", "mercury_affliction", "jupiter_affliction"],
    title: {
      kn: "ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಧ್ಯಾನ ಶ್ಲೋಕಮ್ (ಬುಧ-ಗುರು & ಸಕಲ ಗ್ರಹ ಸಮನ್ವಯ)",
      en: "Shri Vishnu Sahasranama Dhyana (Mercury-Jupiter & Cosmic Harmony)",
      hi: "श्री विष्णु सहस्रनाम ध्यान श्लोक (बुध-गुरु एवं सर्व ग्रह सामंजस्य)",
      te: "శ్రీ విష్ణు సహస్రనామ ధ్యాన శ్లోకం",
      ta: "ஸ்ரீ விஷ்ணு சகஸ்ரநாம தியான ஸ்லோகம்"
    },
    dedicatedTo: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾವಿಷ್ಣು", en: "Lord Maha Vishnu", hi: "भगवान विष्णु", te: "శ్రీ మహావిష్ణువు", ta: "ஸ்ரீ மகாவிஷ்ணு" },
    shlokaSanskrit: `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं
विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ।
लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं
वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥
यस्य स्मरणमात्रेण जन्मसंसारबन्धनात् ।
विमुच्यते नमस्तस्मै विष्णवे प्रभविष्णवे ॥`,
    shlokaKannada: `ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ
ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್ ।
ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಭಿರ್ಧ್ಯಾನಗಮ್ಯಂ
ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್ ॥
ಯಸ್ಯ ಸ್ಮರಣಮಾತ್ರೇಣ ಜನ್ಮಸಂಸಾರಬಂಧನಾತ್ ।
ವಿಮುಚ್ಯತೇ ನಮಸ್ತಸ್ಮೈ ವಿಷ್ಣವೇ ಪ್ರಭವಿಷ್ಣವೇ ॥`,
    shlokaTelugu: `శాంతాకారం భుజగశయనం పద్మనాభం సురేశం
విశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్ ।
లక్ష్మీకాంతం కమలనయనం యోగిభిర్ధ్యానగమ్యం
వందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్ ॥`,
    shlokaTamil: `சாந்தாகாரம் புஜகசயனம் பத்மநாபம் ஸுரேசம்
விச்வாதாரம் ககனஸத்ருசம் மேகவர்ணம் சுபாங்கம் ।
லக்ஷ்மீகாந்தம் கமலநயனம் யோகிபிர்த்யானகம்யம்
வந்தே விஷ்ணும் பவபயஹரம் ஸர்வலோகைகநாதம் ॥`,
    shlokaHindi: `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं
विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ।
लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं
वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥`,
    transliteration: "Śāntākāraṁ Bhujagaśayanaṁ Padmanābhaṁ Surēśaṁ Viśvādhāraṁ Gaganasadṛśaṁ Mēghavarṇaṁ Śubhāṅgam | Vandē Viṣṇuṁ Bhavabhayaharaṁ Sarvalōkaikanātham ||",
    meaning: {
      kn: "ಪರಮ ಶಾಂತ ಸ್ವರೂಪನಾದ, ಶೇಷಶಯನನಾದ, ಸರ್ವಲೋಕೈಕನಾಥನಾದ ಶ್ರೀ ವಿಷ್ಣುವಿಗೆ ಪ್ರಣಾಮಗಳು. ನಿನ್ನ ಸ್ಮರಣೆಯಿಂದ ಭವಭಯಗಳು ನಾಶವಾಗಲಿ.",
      en: "We bow to the serene, all-pervading Lord Vishnu, resting upon the cosmic serpent, dissolver of worldly fear and sovereign master of all creation.",
      hi: "परम शांत स्वरूप, शेषनाग पर शयन करने वाले जगतपति भगवान विष्णु हमारे समस्त भयों का हरण करें।",
      te: "శాంత స్వరూపుడైన శ్రీమహావిష్ణువుకు నమస్కారాలు.",
      ta: "சாந்த சொரூபியான ஸ்ரீ மகாவிஷ்ணுவுக்கு நமஸ்காரங்கள்."
    },
    spiritualBenefits: {
      kn: "ಬುದ್ಧಿಮಾಂದ್ಯತೆ ನಿವಾರಣೆ, ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಉನ್ನತ ಸಾಧನೆ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಹಾಗೂ ಮನಸ್ಸಿನ ನಿರಾಳತೆ.",
      en: "Sharpens intellect, harmonizes nervous system, and aligns all nine planets into beneficial resonance.",
      hi: "बुद्धि, विद्या और व्यापार में उन्नति तथा सर्वग्रह शांति होती है।",
      te: "జ్ఞానం, వ్యాపార అభివృద్ధి మరియు సర్వ గ్రహ శాంతి.",
      ta: "கல்வி, தொழில் வளர்ச்சி மற்றும் கிரக தோஷ நிவர்த்தி."
    },
    bestTimeToRecite: { kn: "ಪ್ರಾತಃಕಾಲ ಅಥವಾ ಸಂಜೆ ಪೂಜೆಯ ಸಮಯದಲ್ಲಿ", en: "Morning or evening prayers", hi: "प्रातः अथवा संध्या", te: "ఉదయం లేదా సాయంత్రం", ta: "காலை அல்லது மாலை" },
    facingDirection: { kn: "ಪೂರ್ವ ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕು", en: "East or North", hi: "पूर्व अथवा उत्तर", te: "తూర్పు లేదా ఉత్తరం", ta: "கிழக்கு அல்லது வடக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ರಿಂದ ೩ ಬಾರಿ", en: "1 to 3 Times Daily", hi: "१ से ३ बार", te: "1 నుండి 3 సార్లు", ta: "1 முதல் 3 முறை" }
  },
  {
    id: "medha_dakshinamurthy",
    forAffliction: ["student_academic", "buddhi_mandya", "guru_weakness"],
    title: {
      kn: "ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರಂ",
      en: "Sri Medha Dakshinamurthy Stotram",
      hi: "श्री मेधा दक्षिणामूर्ति स्तोत्रम्",
      te: "శ్రీ మేధా దక్షిణామూర్తి స్తోత్రం",
      ta: "ஸ்ரீ மேதா தட்சிணாமூர்த்தி ஸ்தோத்திரம்"
    },
    dedicatedTo: {
      kn: "ಭಗವಾನ್ ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಗುರು",
      en: "Lord Dakshinamurthy / Guru",
      hi: "भगवान दक्षिणामूर्ति / गुरु",
      te: "దక్షిణామూర్తి స్వామి",
      ta: "தட்சிணாமூர்த்தி பெருமான்"
    },
    shlokaSanskrit: `ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा ।
ओंकाररूपाय गुरवे सर्वविद्याप्रदायिने । दक्षिणामूर्तये तुभ्यं नमो बुद्धिप्रबोधक ॥`,
    shlokaKannada: `ಓಂ ನಮೋ ಭಗವತೇ ದಕ್ಷಿಣಾಮೂರ್ತಯೇ ಮಹ್ಯಂ ಮೇಧಾಂ ಪ್ರಜ್ಞಾಂ ಪ್ರಯಚ್ಛ ಸ್ವಾಹಾ ।
ಓಂಕಾರರೂಪಾಯ ಗುರವೇ ಸರ್ವವಿದ್ಯಾಪ್ರದಾಯಿನೇ । ದಕ್ಷಿಣಾಮೂರ್ತಯೇ ತುಭ್ಯಂ ನಮೋ ಬುದ್ಧಿಪ್ರಬೋಧಕ ॥`,
    shlokaTelugu: `ఓం నమో భగవతే దక్షిణామూర్తయే మహ్యం మేధాం ప్రజ్ఞాం ప్రయచ్ఛ స్వాహా ।
ఓంకారరూపాయ గురవే సర్వవిద్యాప్రదాయినే । దక్షిణామూర్తయే తుభ్యం నమో బుద్ధిప్రబోధక ॥`,
    shlokaTamil: `ஓம் நமோ பகவதே தக்ஷிணாமூர்த்தயே மஹ்யம் மேதாம் ப்ரஜ்ஞாம் ப்ரயச்ச ஸ்வாஹா ।`,
    shlokaHindi: `ॐ नमो भगवते दक्षिणामूर्तये मह्यं मेधां प्रज्ञां प्रयच्छ स्वाहा ।
ओंकाररूपाय गुरवे सर्वविद्याप्रदायिने । दक्षिणामूर्तये तुभ्यं नमो बुद्धिप्रबोधक ॥`,
    transliteration: "Oṁ Namō Bhagavate Dakṣiṇāmūrtaye Mahyaṁ Medhāṁ Prajñāṁ Prayaccha Svāhā | Oṅkārarūpāya Gurave Sarvavidyāpradāyine ||",
    meaning: {
      kn: "ಜ್ಞಾನ, ವಿವೇಕ ಮತ್ತು ಸರ್ವವಿದ್ಯೆಗಳನ್ನು ಕರುಣಿಸುವ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪರಬ್ರಹ್ಮನಿಗೆ ನಮಸ್ಕಾರಗಳು. ನಮ್ಮ ಬುದ್ಧಿಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ಅಜ್ಞಾನವನ್ನು ನೀಗಿಸು.",
      en: "Salutations to Lord Dakshinamurthy, embodiment of the primordial Omkara and bestower of supreme intellect, memory retention, and spiritual discrimination.",
      hi: "सर्वविद्याप्रदायक भगवान दक्षिणामूर्ति को नमन। हमारी बुद्धि एवं प्रज्ञा को प्रकाशित करें।",
      te: "సకల విద్యా ప్రదాత అయిన దక్షిణామూర్తికి నమస్కారాలు.",
      ta: "சகல வித்தைகளையும் அருளும் தட்சிணாமூர்த்தி பெருமானுக்கு நமஸ்காரங்கள்."
    },
    spiritualBenefits: {
      kn: "ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಏಕಾಗ್ರತೆ, ಅಧ್ಯಯನದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯಶಸ್ಸು ಹಾಗೂ ಅಜ್ಞಾನ ನಿವಾರಣೆ.",
      en: "Sharpens intellect, memory retention, academic mastery, and clears cognitive fog.",
      hi: "मेधा, प्रज्ञा और बौद्धिक एकाग्रता में वृद्धि होती है।",
      te: "జ్ఞానం, మేధస్సు మరియు విద్యా రంగంలో విశేష విజయం.",
      ta: "ஞாபக சக்தி, புத்திக் கூர்மை மற்றும் கல்வி தேர்ச்சி உண்டாகும்."
    },
    bestTimeToRecite: { kn: "ಗುರುವಾರ ಮುಂಜಾನೆ ಅಥವಾ ಅಧ್ಯಯನದ ಮುನ್ನ", en: "Thursday morning or before study", hi: "गुरुवार प्रातः", te: "గురువారం ఉదయం", ta: "வியாழக்கிழமை காலை" },
    facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು", en: "North or North-East", hi: "उत्तर अथवा ईशान", te: "ఉత్తరం లేదా ఈశాన్యం", ta: "வடக்கு அல்லது வடகிழக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ಅಥವಾ ೧೧ ಬಾರಿ", en: "1 or 11 Times Daily", hi: "१ अथवा ११ बार", te: "1 లేదా 11 సార్లు", ta: "1 அல்லது 11 முறை" }
  },
  {
    id: "swayamvara_parvati",
    forAffliction: ["marriage_delay", "relationship_friction", "shukra_affliction"],
    title: {
      kn: "ಶ್ರೀ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಸ್ತೋತ್ರಂ & ಮಂತ್ರ",
      en: "Sri Swayamvara Parvati Stotram & Mantra",
      hi: "श्री स्वयंवर पार्वती स्तोत्रम्",
      te: "శ్రీ స్వయంవర పార్వతీ స్తోత్రం",
      ta: "ஸ்ரீ சுயம்வர பார்வதி ஸ்தோத்திரம்"
    },
    dedicatedTo: {
      kn: "ಜಗನ್ಮಾತೆ ಪಾರ್ವತೀ ದೇವಿ / ಉಮಾ-ಮಹೇಶ್ವರ",
      en: "Goddess Parvati / Uma-Maheshwara",
      hi: "माता पार्वती / उमा-महेश्वर",
      te: "పార్వతీ దేవి",
      ta: "பார்வதி தேவி"
    },
    shlokaSanskrit: `ॐ ह्रीं योगिनि योगिनी योगेश्वरी योग भयङ्करि सकल स्थावर ಜङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥`,
    shlokaKannada: `ಓಂ ಹ್ರೀಂ ಯೋಗಿನಿ ಯೋಗಿನೀ ಯೋಗೇಶ್ವರೀ ಯೋಗ ಭಯಂಕರಿ ಸಕಲ ಸ್ಥಾವರ ಜಂಗಮಸ್ಯ ಮುಖ ಹೃದಯಂ ಮಮ ವಶಂ ಆಕರ್ಷಯ ಆಕರ್ಷಯ ನಮಃ ॥`,
    shlokaTelugu: `ఓం హ్రీం యోగిని ಯೋಗಿನೀ యోగేశ్వరీ యోగ భయంకరి సకల స్థావర జంగమస్య ముఖ హృదయం మమ వశం ఆకర్షయ ఆకర్షయ నమః ॥`,
    shlokaTamil: `ஓம் ஹ்ரீம் யோகினி யோகினீ யோகேஸ்வரீ சகல ஸ்தாவர ஜங்கமஸ்ய முகம் ஹ்ருதயம் மம வசம் ஆகர்ஷய நமஹ ॥`,
    shlokaHindi: `ॐ ह्रीं योगिनि योगिनी योगेश्वरी योग भयङ्करि सकल स्थावर ಜङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥`,
    transliteration: "Oṁ Hrīṁ Yōgini Yōginī Yōgēśvarī Yōga Bhayaṅkari Sakala Sthāvara Jaṅgamasya Mukha Hṛdayaṁ Mama Vaśaṁ Ākarṣaya Ākarṣaya Namaḥ ||",
    meaning: {
      kn: "ವಿವಾಹ ವಿಘ್ನಗಳನ್ನು ನಿವಾರಿಸಿ ಯೋಗ್ಯ ಸಂಗಾತಿಯೊಡನೆ ಸೌಭಾಗ್ಯದ ಜೀವನವನ್ನು ಕರುಣಿಸುವ ಜಗನ್ಮಾತೆ ಪಾರ್ವತಿಯನ್ನು ಭಕ್ತಿಯಿಂದ ಶರಣುಹೋಗುತ್ತೇವೆ.",
      en: "Divine invocation to Goddess Parvati to dissolve obstacles in marriage matching and bestow an auspicious, loving, virtuous life partner.",
      hi: "विवाह बाधा निवारण एवं सुयोग्य जीवनसाथी की प्राप्ति हेतु जगन्माता पार्वती की वंदना।",
      te: "వివాహ అడ్డంకులు తొలగి సుగుణవంతుడైన భాగస్వామి లభించాలని పార్వతీ దేవిని ప్రార్థిస్తున్నాము.",
      ta: "திருமண தடைகள் நீங்கி நல்ல வாழ்க்கைத்துணை அமைய அன்னையை வேண்டுகிறோம்."
    },
    spiritualBenefits: {
      kn: "ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆ, ಶೀಘ್ರ ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿ, ಸುಗುಣವಂತ ಸಂಗಾತಿಯ ಲಾಭ ಹಾಗೂ ದಾಂಪತ್ಯ ಸೌಖ್ಯ.",
      en: "Dissolves marriage obstacles, resolves delay in finding match, and blesses domestic bliss.",
      hi: "शीघ्र विवाह, उत्तम जीवनसाथी की प्राप्ति एवं दांपत्य सुख की वृद्धि।",
      te: "శీఘ్ర వివాహం, అనుకూల జీవిత భాగస్వామి లభించడం.",
      ta: "விரைவில் திருமணம் கைகூடும், நல்ல வாழ்க்கைத்துணை அமையும்."
    },
    bestTimeToRecite: { kn: "ಶುಕ್ರವಾರ ಮುಂಜಾನೆ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲ", en: "Friday morning or Pradosha twilight", hi: "शुक्रवार प्रातः", te: "శుక్రవారం ఉదయం", ta: "வெள்ளிக்கிழமை காலை" },
    facingDirection: { kn: "ಪೂರ್ವ ದಿಕ್ಕು", en: "East", hi: "पूर्व", te: "తూర్పు", ta: "கிழக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೨೧ ಅಥವಾ ೧೦೮ ಬಾರಿ", en: "21 or 108 Times Daily", hi: "२१ अथवा १०८ बार", te: "21 లేదా 108 సార్లు", ta: "21 அல்லது 108 முறை" }
  },
  {
    id: "runa_vimochana_angāraka",
    forAffliction: ["debt_financial", "kuja_dosha", "mars_weakness"],
    title: {
      kn: "ಶ್ರೀ ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಸ್ತೋತ್ರಂ",
      en: "Sri Runa Vimochana Angāraka Stotram",
      hi: "श्री ऋणमोचन अङ्गारक स्तोत्रम्",
      te: "శ్రీ రుణవిమోచన అంగారక స్తోత్రం",
      ta: "ஸ்ரீ ருணவிமோசன அங்காரக ஸ்தோத்திரம்"
    },
    dedicatedTo: {
      kn: "ಭಗವಾನ್ ಮಂಗಳ / ಸುಬ್ರಹ್ಮಣ್ಯ",
      en: "Lord Mangala / Kartikeya",
      hi: "भगवान मंगल / कार्तिकेय",
      te: "అంగారక స్వామి",
      ta: "செவ்வாய் பகவான்"
    },
    shlokaSanskrit: `मङ्गलो भूमिपुत्रश्च ऋणहर्ता धनप्रदः । स्थिरासनो महाकायः सर्वकर्मविरोधकः ॥
अङ्गारको महातेजाः सर्वकार्यफलप्रदः । तं नमामि सदा भक्त्या ऋणं मे मोचय प्रभो ॥`,
    shlokaKannada: `ಮಂಗಳೋ ಭೂಮಿಪುತ್ರಶ್ಚ ಋಣಹರ್ತಾ ಧನಪ್ರದಃ । ಸ್ಥಿರಾಸನೋ ಮಹಾಕಾಯಃ ಸರ್ವಕರ್ಮವಿರೋಧಕಃ ॥
ಅಂಗಾರಕೋ ಮಹಾತೇಜಾಃ ಸರ್ವಕಾರ್ಯಫಲಪ್ರದಃ । ತಂ ನಮಾಮಿ ಸದಾ ಭಕ್ತ್ಯಾ ಋಣಂ ಮೇ ಮೋಚಯ ಪ್ರಭೋ ॥`,
    shlokaTelugu: `మంగళో భూమిపుత్రశ్చ రుణహర్తా ధనప్రదః । స్థిరాసనో మహాకాయః సర్వకర్మవిరోధకః ॥
అంగారకో మహాతేజాః సర్వకార్యఫలప్రదః । తం నమామి సదా భక్త్యా రుణం మే మోచయ ప్రభో ॥`,
    shlokaTamil: `மங்கலோ பூமிபுத்ரஸ்ச ருணஹர்த்தா தனப்ரதஃ । ஸ்திராஸனோ மஹாகாயஃ சர்வகர்மவிரோதகஃ ॥`,
    shlokaHindi: `मङ्गलो भूमिपुत्रश्च ऋणहर्ता धनप्रदः । स्थिरासनो महाकायः सर्वकर्मविरोधकः ॥
अङ्गारको महातेजाः सर्वकार्यफलप्रदः । तं नमामि सदा भक्त्या ऋणं मे मोचय प्रभो ॥`,
    transliteration: "Maṅgalō Bhūmiputraśca Ṛṇahartā Dhanapradaḥ | Sthirāsanō Mahākāyaḥ Sarvakarmavirōdhakaḥ || Aṅgārakō Mahātējāḥ Sarvakāryaphalapradaḥ | Taṁ Namāmi Sadā Bhaktyā Ṛṇaṁ Mē Mōcaya Prabhō ||",
    meaning: {
      kn: "ಸಮಸ್ತ ಋಣ-ಸಾಲಗಳನ್ನು ಪರಿಹರಿಸಿ, ಭೂಮಿ ಮತ್ತು ಧನ-ಸಂಪತ್ತನ್ನು ಅನುಗ್ರಹಿಸುವ ಭೂಮಿಪುತ್ರ ಅಂಗಾರಕನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ. ನನ್ನ ಸಮಸ್ತ ಋಣಗಳನ್ನು ಕಳೆಯಿರಿ ಪ್ರಭು.",
      en: "Salutations to Angaraka, son of Earth and dissolver of debts and financial encumbrances. We pray with devotion for liberation from monetary obligations and restoration of prosperity.",
      hi: "ऋणहर्ता एवं धनप्रदाता भूमिपुत्र मंगल देव को नमन। हमारे समस्त ऋणों का निवारण करें।",
      te: "రుణాలను హరించి ధనాన్ని ప్రసాదించే అంగారక స్వామికి నమస్కారాలు.",
      ta: "கடன்களை நீக்கி செல்வத்தை அருளும் அங்காரக பகவானுக்கு நமస్కாரங்கள்."
    },
    spiritualBenefits: {
      kn: "ಸಾಲದ ಹೊರೆಯಿಂದ ಮುಕ್ತಿ, ಆರ್ಥಿಕ ಅಡೆತಡೆಗಳ ನಿವಾರಣೆ ಹಾಗೂ ಭೂಮಿ-ಆಸ್ತಿ ಸೌಭಾಗ್ಯ.",
      en: "Relief from debt traps, financial unblocking, and restoration of stable asset cash-flow.",
      hi: "ऋण मुक्ति, आर्थिक बाधा निवारण एवं संपत्ति लाभ।",
      te: "రుణ విముక్తి, ఆర్థిక సమస్యల నివారణ మరియు సంపద వృద్ధి.",
      ta: "கடன் சுமை குறைந்து பொருளாதார முன்னேற்றம் உண்டாகும்."
    },
    bestTimeToRecite: { kn: "ಮಂಗಳವಾರ ಬೆಳಗ್ಗೆ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ", en: "Tuesday morning or Pradosha twilight", hi: "मंगलवार प्रातः अथवा प्रदोष काल", te: "మంగళవారం ఉదయం లేదా ప్రదోష వేళ", ta: "செவ்வாய் காலை அல்லது பிரதோஷ காலம்" },
    facingDirection: { kn: "ದಕ್ಷಿಣ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "South or East", hi: "दक्षिण अथवा पूर्व", te: "దక్షిణం లేదా తూర్పు", ta: "தெற்கு அல்லது கிழக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ಅಥವಾ ೭ ಬಾರಿ", en: "1 or 7 Times Daily", hi: "१ अथवा ७ बार", te: "1 లేదా 7 సార్లు", ta: "1 அல்லது 7 முறை" }
  }
];

/**
 * Generates an in-depth, authentic Vedic Astrological Remedy and Pacification Analysis
 * strictly dynamic based on the devotee's generated Janma Kundali, Dasha, Gochara, and Panchanga.
 */
export function generateKundliRemedyReport(
  kundli: KundliOutput,
  input: KundliInput
): KundliRemedyDiagnosis {
  const birthYmd = input.birthDate || "1993-05-31";
  const birthHm = input.birthTime || "09:25";
  const lat = input.latitude ?? 14.5479;
  const lng = input.longitude ?? 74.3188;
  const ageNow = ageDecimalYearsAt(birthYmd, birthHm, lat, lng, new Date());
  const devoteeAge = Math.floor(ageNow);

  // 1. Synthesize Panchanga & Holistic Current Life Diagnosis
  const synthesis = generatePanchangaAngaSynthesis(kundli, {
    birthDate: birthYmd,
    birthTime: birthHm,
    latitude: lat,
    longitude: lng,
    devoteeName: input.name || "Devotee",
    gender: input.gender,
    devoteeAge,
    maritalStatus: input.maritalStatus,
    lang: "kn"
  });
  const currentDiag = synthesis.currentDiagnosis;
  const cls = currentDiag.currentLifeSituation;
  const dashaTiming = currentDiag.dashaTiming;

  const planets = kundli.planets;
  const mars = planets.find(p => p.name === PlanetName.Mars);
  const moon = planets.find(p => p.name === PlanetName.Moon);
  const sun = planets.find(p => p.name === PlanetName.Sun);
  const saturn = planets.find(p => p.name === PlanetName.Saturn);
  const rahu = planets.find(p => p.name === PlanetName.Rahu);
  const ketu = planets.find(p => p.name === PlanetName.Ketu);
  const jupiter = planets.find(p => p.name === PlanetName.Jupiter);
  const mercury = planets.find(p => p.name === PlanetName.Mercury);
  const venus = planets.find(p => p.name === PlanetName.Venus);

  // Ascendant / Lagna identification
  const lagnaRashiName = kundli.lagnaRashi?.english || "Aries";
  const lagnaRashiIndex = kundli.lagnaRashi?.index ?? 0;
  const moonRashiName = moon?.rashi.english || "Aries";
  const moonNakName = moon?.nakshatra.english || "Ashwini";
  const moonDegree = moon?.degree ?? 0;
  const sunDegree = sun?.degree ?? 0;

  // 2. Parashari Mars & Temperament Affliction Evaluation
  const marsHouse = mars?.house || 1;
  const hasGuruAspectOnMars = Boolean(
    jupiter && mars && [1, 5, 7, 9].includes(((mars.house - jupiter.house + 12) % 12) + 1)
  );

  // Mars in 1st house in fiery sign without Jupiter aspect triggers acute Tanu Bhava Pitta/Anger (e.g. mockKundliMarsAfflicted)
  const isMarsInLagnaFire = Boolean(
    mars && mars.house === 1 && ["Aries", "Leo", "Sagittarius"].includes(lagnaRashiName) && !hasGuruAspectOnMars
  );

  const isMarsAfflicted = isMarsInLagnaFire || Boolean(
    (marsHouse === 1 || marsHouse === 7 || marsHouse === 8) &&
    (mars?.rashi.english === "Cancer" || mars?.isDebilitated || planets.some(p => (p.name === PlanetName.Sun || p.name === PlanetName.Rahu) && p.house === marsHouse && !hasGuruAspectOnMars))
  );

  const isMoonAfflicted = Boolean(
    moon && (moon.rashi.english === "Scorpio" || moon.isDebilitated ||
    planets.some(p => (p.name === PlanetName.Rahu || p.name === PlanetName.Ketu || p.name === PlanetName.Saturn) && p.house === moon.house) ||
    [6, 8, 12].includes(moon.house))
  );

  const isSaturnAfflicted = Boolean(
    saturn && ([6, 8, 12].includes(saturn.house) || saturn.rashi.english === "Aries" || saturn.isDebilitated)
  );
  const isRahuKetuStrong = Boolean(rahu && (rahu.house === 1 || rahu.house === 7 || rahu.house === 8));
  const isJupiterAfflicted = Boolean(jupiter && (jupiter.rashi.english === "Capricorn" || jupiter.isDebilitated || [6, 8, 12].includes(jupiter.house)));

  // Compute Psychological Scores (calibrated to ensure calm states for non-afflicted statesmen/creators)
  let krodhaLevel = 35;
  if (isMarsInLagnaFire) {
    krodhaLevel = 80;
  } else if (isMarsAfflicted) {
    krodhaLevel += 25;
  }
  if (["Aries", "Leo", "Scorpio"].includes(moonRashiName) && !hasGuruAspectOnMars) {
    krodhaLevel += 5;
  }
  krodhaLevel = Math.min(95, Math.max(25, krodhaLevel));

  let manasStability = 80;
  if (isMoonAfflicted) manasStability -= 35;
  if (isRahuKetuStrong) manasStability -= 15;
  manasStability = Math.min(95, Math.max(30, manasStability));

  let vitalityScore = 75;
  if (sun?.isDebilitated || [6, 8, 12].includes(sun?.house || 1)) vitalityScore -= 25;
  if (isSaturnAfflicted) vitalityScore -= 10;
  vitalityScore = Math.min(95, Math.max(35, vitalityScore));

  let patienceIndex = 80;
  if (krodhaLevel >= 70) patienceIndex -= 35;
  else if (isSaturnAfflicted) patienceIndex -= 15;
  patienceIndex = Math.min(95, Math.max(25, patienceIndex));

  // 3. Determine Primary Struggle Category (Harmonized with authentic Parashari Life Reality)
  const isFemaleRemedy = input.gender === "Female";
  const isConfirmedMarriedRemedy = Boolean(
    input.maritalStatus === "married" ||
    (input.name && /ದಂಪತಿ|ಮತ್ತು|ಸಹಿತ|couple|\band\b/i.test(input.name)) ||
    currentDiag.marriageDestiny?.verdict === "already_married"
  );
  const isDestinyDelayedRemedy = currentDiag.marriageDestiny?.verdict === "delayed_marriage";

  const clsCat = cls?.category;
  let struggleCategory: KundliRemedyDiagnosis["primaryStruggle"]["category"] = "general_alignment";
  let intensity: "High" | "Moderate" | "Balanced" = "Moderate";
  let intensityLabel: Record<string, string>;
  let primaryStruggleTitle: Record<string, string>;
  let primaryStruggleDesc: Record<string, string>;

  if (input.primaryConcern) {
    const pc = input.primaryConcern;
    if (
      pc === "student_academic" ||
      pc === "marriage_delay" ||
      pc === "debt_financial" ||
      pc === "health_vitality" ||
      pc === "anger_temper" ||
      pc === "mental_anxiety" ||
      pc === "career_obstacles" ||
      pc === "relationship_friction" ||
      pc === "legal_confinement" ||
      pc === "leadership_expansion" ||
      pc === "creative_stardom" ||
      pc === "elite_sports" ||
      pc === "general_alignment"
    ) {
      struggleCategory = pc;
      intensity = "High";
    }
  } else if (isMarsInLagnaFire) {
    struggleCategory = "anger_temper";
    intensity = "High";
  } else if (clsCat === "student_academic_stress") {
    struggleCategory = "student_academic";
    intensity = "High";
  } else if (clsCat === "marriage_delay" || (isDestinyDelayedRemedy && (input.maritalStatus === "unmarried" || (isFemaleRemedy && !isConfirmedMarriedRemedy)) && devoteeAge >= 20 && devoteeAge <= 52)) {
    struggleCategory = "marriage_delay";
    intensity = "High";
  } else if (clsCat === "debt_financial_crisis") {
    struggleCategory = "debt_financial";
    intensity = "High";
  } else if (clsCat === "legal_custody_confinement") {
    struggleCategory = "legal_confinement";
    intensity = "High";
  } else if (clsCat === "health_vitality_strain" || clsCat === "health_autoimmune_recovery") {
    struggleCategory = "health_vitality";
    intensity = "High";
  } else if (clsCat === "marital_discord" || clsCat === "partner_distrust_betrayal" || clsCat === "post_divorce_rebuilding") {
    if (input.maritalStatus === "unmarried" || (isFemaleRemedy && !isConfirmedMarriedRemedy)) {
      struggleCategory = "marriage_delay";
      intensity = "High";
    } else {
      struggleCategory = "relationship_friction";
      intensity = "Moderate";
    }
  } else if (clsCat === "career_politics_layoff" || clsCat === "property_share_dispute") {
    struggleCategory = "career_obstacles";
    intensity = "Moderate";
  } else if (clsCat === "leadership_expansion_scaling") {
    struggleCategory = "leadership_expansion";
    intensity = "Balanced";
  } else if (clsCat === "creative_media_stardom") {
    struggleCategory = "creative_stardom";
    intensity = "Balanced";
  } else if (clsCat === "elite_sports_athletic_triumph") {
    struggleCategory = "elite_sports";
    intensity = "Balanced";
  } else if (krodhaLevel >= 70) {
    struggleCategory = "anger_temper";
    intensity = "High";
  } else if (manasStability <= 55) {
    struggleCategory = "mental_anxiety";
    intensity = "High";
  } else if (isSaturnAfflicted) {
    struggleCategory = "career_obstacles";
    intensity = "Moderate";
  } else {
    struggleCategory = "general_alignment";
    intensity = "Balanced";
  }

  // Mandatory Safeguard: Unmarried natives or unmarried females must never be diagnosed with marital discord
  if (struggleCategory === "relationship_friction" && (input.maritalStatus === "unmarried" || (isFemaleRemedy && !isConfirmedMarriedRemedy))) {
    struggleCategory = "marriage_delay";
    intensity = "High";
  }

  // 13 Rich Dynamic Category Descriptions
  if (struggleCategory === "anger_temper") {
    intensityLabel = { kn: "ಅತ್ಯಂತ ಮುಖ್ಯ (ತೀವ್ರ ಆದ್ಯತೆ)", en: "High Priority Action", hi: "उच्च प्राथमिकता", te: "అత్యధిక ప్రాధాన్యత", ta: "முக்கிய தீர்வு" };
    primaryStruggleTitle = {
      kn: "ತೀವ್ರ ಪಿತ್ತ ಪ್ರಕೋಪ, ಆವೇಶ & ಕೋಪ ನಿಯಂತ್ರಣ ಸವಾಲು",
      en: "Pitta Aggravation, Impatience & Anger Spikes",
      hi: "तीव्र पित्त प्रकोप, क्रोध एवं आवेग नियंत्रण चुनौती",
      te: "తీవ్ర పిత్త ప్రకోపం, ఆవేశం & కోప నియంత్రణ సవాలు",
      ta: "தீவிர பித்த பிரகோபம், கோபம் & மன அமைதியின்மை சவால்"
    };
    primaryStruggleDesc = {
      kn: `ಕುಂಡಲಿಯಲ್ಲಿ ಕುಜ ಹಾಗೂ ರವಿ ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ತಕ್ಷಣ ಸಿಟ್ಟು, ತಾಳ್ಮೆ ಕೊರತೆ ಹಾಗೂ ಅಸಹನೆ ಉಂಟಾಗುವ ಸಂಭವವಿದೆ. ಅನ್ಯರ ತಪ್ಪುಗಳಿಗೆ ತಕ್ಷಣ ಪ್ರತಿಕ್ರಿಯಿಸುವುದರಿಂದ ಸಂಬಂಧಗಳಲ್ಲಿ ಘರ್ಷಣೆ ಉಂಟಾಗಬಹುದು.`,
      en: `Due to sharp Mars-Sun planetary energy on key houses, internal heat (Pitta) rises rapidly during obstacles, causing sharp irritation, impulsive words, and high reactivity that can disturb relationships and peace.`,
      hi: `कुंडली में मंगल एवं सूर्य के तीक्ष्ण प्रभाव के कारण मन में अचानक क्रोध, अधीरता और असहिष्णुता उत्पन्न होती है।`,
      te: `కుండలిలో కుజ మరియు సూర్య గ్రహాల తీవ్ర ప్రభావం వలన త్వరగా కోపం మరియు అసహనం వచ్చే అవకాశం ఉంది.`,
      ta: `ஜாதகத்தில் செவ்வாய் மற்றும் சூரியனின் தாக்கத்தினால் திடீர் கோபமும் பொறுமையின்மையும் உண்டாகலாம்.`
    };
  } else if (struggleCategory === "student_academic") {
    intensityLabel = { kn: "ಶೈಕ್ಷಣಿಕ ಶ್ರದ್ಧೆ (ಮುಖ್ಯ ಆದ್ಯತೆ)", en: "Academic Focus Priority", hi: "शैक्षणिक एकाग्रता प्राथमिकता", te: "విద్యా ఏకాగ్రత ప్రాధాన్యత", ta: "கல்வி கவனம் முதன்மை" };
    primaryStruggleTitle = {
      kn: "ವಿದ್ಯಾಭ್ಯಾಸದ ಒತ್ತಡ, ಏಕಾಗ್ರತೆಯ ಕೊರತೆ & ಪರೀಕ್ಷಾ ಆತಂಕ",
      en: "Academic Pressure, Concentration Distraction & Exam Anxiety",
      hi: "शैक्षणिक दबाव, एकाग्रता की कमी एवं परीक्षा चिंता",
      te: "విద్యాభ్యాస ఒత్తిడి, ఏకాగ్రత లేమి & పరీక్షల ఆందోళన",
      ta: "கல்வி அழுத்தம், கவனச்சிதறல் & தேர்வு பயம்"
    };
    primaryStruggleDesc = {
      kn: `೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ಮತ್ತು ಬುದ್ಧಿಕಾರಕ ಬುಧನ ಮೇಲೆ ರಾಹು ಅಥವಾ ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಅಧ್ಯಯನದಲ್ಲಿ ಏಕಾಗ್ರತೆ ಭಂಗ, ಮರೆವು ಹಾಗೂ ಪರೀಕ್ಷಾ ಸಮಯದಲ್ಲಿ ಅನಗತ್ಯ ಆತಂಕ ಉಂಟಾಗಬಹುದು. ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಮತ್ತು ಸರಸ್ವತಿ ಆರಾಧನೆ ಅಗತ್ಯ.`,
      en: `Affliction to the 4th/5th house of intellect and Mercury creates study restlessness, procrastination, and pre-exam stress. Pacifying intellect channels restores sharp memory retention.`,
      hi: `विद्या भाव एवं बुध पर पाप प्रभाव से पढ़ाई में मन भटकना और परीक्षा पूर्व तनाव उत्पन्न हो सकता है।`,
      te: `4వ విద్యా స్థానంపై పాప గ్రహాల ప్రభావం వలన చదువులో ఏకాగ్రత లోపించవచ్చు.`,
      ta: `4ம் கல்வி ஸ்தானத்தில் அசுப கிரக தாக்கத்தால் படிப்பில் கவனச்சிதறல் உண்டாகலாம்.`
    };
  } else if (struggleCategory === "marriage_delay") {
    intensityLabel = { kn: "ವಿವಾಹ ಸಾಫಲ್ಯ (ತೀವ್ರ ಆದ್ಯತೆ)", en: "Matrimonial Fulfillment Priority", hi: "विवाह बाधा निवारण", te: "వివాహ ప్రాధాన్యత", ta: "திருமண தடை நிவர்த்தி" };
    primaryStruggleTitle = {
      kn: "ವಿವಾಹ ವಿಳಂಬ, ಕಂಕಣ ಬಲ ತಡೆ & ಸೂಕ್ತ ಸಂಬಂಧದ ನಿರೀಕ್ಷೆ",
      en: "Delayed Marriage, Matrimonial Obstacles & Delay in Finding Auspicious Match",
      hi: "विवाह में अप्रत्याशित विलंब एवं कंकण बल बाधा",
      te: "వివాహ ఆలస్యం & కంకణ బలం ఆటంకం",
      ta: "திருமண தாமதம் & வரன் அமைவதில் தடை"
    };
    primaryStruggleDesc = {
      kn: `೭ನೇ ಕಳತ್ರ ಸ್ಥಾನ, ಶುಕ್ರ ಅಥವಾ ಗುರು ಗ್ರಹಗಳ ಮೇಲಿನ ಶನಿ-ರಾಹು ಪ್ರಭಾವದಿಂದ ಮಾತುಕತೆಗಳು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಮುರಿದುಬೀಳುವುದು ಅಥವಾ ಸೂಕ್ತ ಹೊಂದಾಣಿಕೆಯ ಸಂಬಂಧ ದೊರೆಯದೆ ವಿಳಂಬವಾಗುತ್ತಿದೆ. ಉಮಾ-ಮಹೇಶ್ವರ ಹಾಗೂ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಶಾಂತಿ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
      en: `Karmic restrictions on the 7th house and marriage karakas (Venus/Jupiter) create unexpected delays, near-miss matchmaking discussions, and matrimonial hurdles requiring consecrated Parashari remedies.`,
      hi: `सप्तम भाव एवं शुक्र-गुरु पर प्रतिकूल प्रभाव से विवाह में अनावश्यक विलंब हो रहा है।`,
      te: `7వ భావంపై శని-రాహు ప్రభావం వలన వివాహ సంబంధాలు కుదరడంలో ఆలస్యం జరుగుతోంది.`,
      ta: `7ம் இடத்தில் உள்ள தோஷங்களால் திருமண பேச்சுவார்த்தைகளில் தாமதம் ஏற்படுகிறது.`
    };
  } else if (struggleCategory === "debt_financial") {
    intensityLabel = { kn: "ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಮುಕ್ತಿ (ಮುಖ್ಯ ಆದ್ಯತೆ)", en: "Financial Liberation Priority", hi: "आर्थिक संकट निवारण", te: "ఆర్థిక విముక్తి ప్రాధాన్యత", ta: "பொருளாதார தடை நீக்கம்" };
    primaryStruggleTitle = {
      kn: "ಆರ್ಥಿಕ ಅಡಚಣೆ, ಸಾಲದ ಹೊರೆ & ಹಣಕಾಸಿನ ಹರಿವಿನಲ್ಲಿ ತಡೆ",
      en: "Financial Blockages, Debt Burden & Liquidity Bottlenecks",
      hi: "आर्थिक रुकावट, ऋण भार एवं धन प्रवाह में बाधा",
      te: "ఆర్థిక ఆటంకాలు, రుణ భారం & ధన ప్రవాహ నిరోధం",
      ta: "பொருளாதார சிக்கல், கடன் சுமை & பணத்தடை"
    };
    primaryStruggleDesc = {
      kn: `೨ನೇ ಧನ ಸ್ಥಾನ ಹಾಗೂ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ಮೇಲೆ ೬ನೇ ರೋಗ-ಋಣ-ಶತ್ರು ಅಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ಸಾಲದ ಮರುಪಾವತಿಯಲ್ಲಿ ತೊಂದರೆ ಮತ್ತು ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳು ಎದುರಾಗುತ್ತಿವೆ. ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಜಪ ಮತ್ತು ಕನಕಧಾರಾ ಸಂಕಲ್ಪ ಅತ್ಯಗತ್ಯ.`,
      en: `Friction between 2nd house of liquid wealth and 6th house of debts triggers financial tight-spots and delayed inflows. Propitiating Runa Vimochana and Kanakadhara restores stable abundance.`,
      hi: `धन एवं लाभ भाव पर षष्ठेश के प्रभाव से कर्ज मुक्ति में कठिनाई और अनावश्यक व्यय हो रहे हैं।`,
      te: `ధన స్థానంపై 6వ అధిపతి ప్రభావం వలన రుణ సమస్యలు మరియు ఆర్థిక ఇబ్బందులు కలుగుతున్నాయి.`,
      ta: `தன ஸ்தானத்தில் 6ம் அதிபதியின் தாக்கத்தால் கடன் தொல்லையும் பொருளாதார நெருக்கடியும் உண்டாகலாம்.`
    };
  } else if (struggleCategory === "relationship_friction") {
    intensityLabel = { kn: "ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ (ಮಧ್ಯಮ ಆದ್ಯತೆ)", en: "Marital Harmony Priority", hi: "वैवाहिक सामंजस्य", te: "దాంపత్య సామరస్యం", ta: "குடும்ப ஒற்றுமை" };
    primaryStruggleTitle = {
      kn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕೊರತೆ, ಮನಸ್ತಾಪ & ಕೌಟುಂಬಿಕ ಘರ್ಷಣೆ",
      en: "Marital Friction, Relationship Misunderstandings & Communication Blocks",
      hi: "दांपत्य जीवन में कलह, मतभेद एवं पारिवारिक तनाव",
      te: "దాంపత్యంలో అవగాహన లోపం & మనస్పర్ధలు",
      ta: "தம்பதியர் கருத்து வேறுபாடு & குடும்ப அமைதியின்மை"
    };
    primaryStruggleDesc = {
      kn: `೭ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ-ಕೇತು ಅಥವಾ ರಾಹುವಿನ ದೃಷ್ಟಿಯಿಂದಾಗಿ ಸಂಗಾತಿಗಳ ನಡುವೆ ಕ್ಷುಲ್ಲಕ ಕಾರಣಗಳಿಗೂ ವಾದ-ವಿವಾದ ಮತ್ತು ಅಸಮಾಧಾನ ತಲೆದೋರುತ್ತಿದೆ. ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿಯಿಂದ ನೆಮ್ಮದಿ ಸಾಧ್ಯ.`,
      en: `Malefic aspect on the 7th house creates sudden emotional reactivity and miscommunications between partners. Harmonizing Venus and performing Uma-Maheshwara seva restores tenderness.`,
      hi: `सप्तम भाव पर पाप दृष्टि के कारण दांपत्य जीवन में छोटी-छोटी बातों पर तनाव और असंतोष उत्पन्न होता है।`,
      te: `7వ స్థానంలో గ్రహాల ప్రభావం వలన భార్యాభర్తల మధ్య విభేదాలు వచ్చే అవకాశం ఉంది.`,
      ta: `7ம் பாவத்தில் தோஷம் இருப்பதால் தம்பதியரிடையே வீண் வாக்குவாதங்கள் வரலாம்.`
    };
  } else if (struggleCategory === "health_vitality") {
    intensityLabel = { kn: "ಆರೋಗ್ಯ ರಕ್ಷಣೆ (ತೀವ್ರ ಆದ್ಯತೆ)", en: "Health & Vitality Priority", hi: "स्वास्थ्य संरक्षण", te: "ఆరోగ్య రక్షణ", ta: "ஆரோக்கிய பாதுகாப்பு" };
    primaryStruggleTitle = {
      kn: "ಆರೋಗ್ಯ ಕ್ಷೀಣತೆ, ದೈಹಿಕ ಆಯಾಸ & ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಕೊರತೆ",
      en: "Health & Vitality Strain, Chronic Fatigue & Immune Imbalance",
      hi: "स्वास्थ्य दुर्बलता, शारीरिक थकान एवं रोग प्रतिरोधक क्षमता की कमी",
      te: "ఆరోగ్య క్షీణత, శరీర అలసట & వ్యాధి నిరోధక శక్తి లోపం",
      ta: "உடல் சோர்வு, நோய் எதிர்ப்பு சக்தி குறைவு & ஆரோக்கிய குறைபாடு"
    };
    primaryStruggleDesc = {
      kn: `ಲಗ್ನಾಧಿಪತಿ ಅಥವಾ ರವಿ ಗ್ರಹವು ದುಸ್ಥಾನದಲ್ಲಿದ್ದು (೬, ೮, ೧೨), ಶನಿಯ ದೃಷ್ಟಿ ಇರುವುದರಿಂದ ದೈಹಿಕ ಶಕ್ತಿ ಕುಂಠಿತವಾಗುವುದು, ಜೀರ್ಣಾಂಗ ತೊಂದರೆ ಮತ್ತು ಸುಸ್ತು ಕಾಡುತ್ತಿದೆ. ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ ಮತ್ತು ಸೂರ್ಯ ಆರಾಧನೆ ರಕ್ಷಣೆ ನೀಡಲಿದೆ.`,
      en: `Debilitation or Dusthana placement of Ascendant lord/Sun drains physical vitality and sympathetic recovery. Mahamrityunjaya and Aditya Hrudaya energize cellular health.`,
      hi: `लग्नेश अथवा सूर्य के दुर्बल होने से शारीरिक ऊर्जा में कमी और रोग प्रतिरोधक क्षमता प्रभावित होती है।`,
      te: `లగ్నాధిపతి లేదా సూర్యుడు బలహీనపడటం వలన శారీరక నిస్సత్తువ కలగవచ్చు.`,
      ta: `லக்னாதிபதி அல்லது சூரியன் பலவீனமாக இருப்பதால் உடல் சோர்வும் ஆரோக்கிய குறைவும் உண்டாகலாம்.`
    };
  } else if (struggleCategory === "legal_confinement") {
    intensityLabel = { kn: "ನ್ಯಾಯ ರಕ್ಷಣೆ (ತೀವ್ರ ಆದ್ಯತೆ)", en: "Legal Protection Priority", hi: "विधिक संकट निवारण", te: "న్యాయ సంరక్షణ", ta: "சட்ட விவகார பாதுகாப்பு" };
    primaryStruggleTitle = {
      kn: "ಕಾನೂನು ತೊಡಕು, ನ್ಯಾಯಾಂಗ ವ್ಯಾಜ್ಯ & ಕಂಟಕಗಳಿಂದ ಮುಕ್ತಿ",
      en: "Legal Complications, Litigation Delays & Need for Protective Armor",
      hi: "कानूनी अड़चनें, मुकदमेबाजी एवं शत्रु बाधा",
      te: "చట్టపరమైన చిక్కులు & శత్రు బాధ నివారణ",
      ta: "சட்ட சிக்கல்கள், வழக்கு தாமதம் & எதிர்ப்புகள்"
    };
    primaryStruggleDesc = {
      kn: `೬ನೇ ಶತ್ರು ಸ್ಥಾನ ಹಾಗೂ ೧೨ನೇ ಬಂಧನ ಸ್ಥಾನಗಳ ಅಧಿಪತಿಗಳ ಪ್ರತಿಕೂಲ ಸಂಚಾರದಿಂದ ಕೋರ್ಟ್-ಕಚೇರಿ ವ್ಯಾಜ್ಯ ಅಥವಾ ಅನಗತ್ಯ ವಂಚನೆಗಳು ಎದುರಾಗಬಹುದು. ಸುದರ್ಶನ ನರಸಿಂಹ ಮತ್ತು ಬಗಲಾಮುಖೀ ರಕ್ಷಾ ಕವಚ ಅಗತ್ಯ.`,
      en: `Adverse planetary configurations on the 6th/12th axis expose native to bureaucratic friction, audit disputes, or litigation stress. Sudarshana Narasimha provides impregnable protection.`,
      hi: `षष्ठ एवं द्वादश भाव के प्रतिकूल प्रभाव से कानूनी उलझनों और विरोधी पक्ष से सावधानी अपेक्षित है।`,
      te: `6 మరియు 12వ స్థానాల ప్రభావం వలన కోర్టు వివాదాలు లేదా చట్టపరమైన సమస్యలు రావచ్చు.`,
      ta: `6 மற்றும் 12ம் இடங்களின் தாக்கத்தால் வழக்கு விவகாரங்களில் விழிப்புணர்வு தேவை.`
    };
  } else if (struggleCategory === "leadership_expansion") {
    intensityLabel = { kn: "ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ (ಉನ್ನತ ಯೋಗ)", en: "High Executive Leadership", hi: "उच्च नेतृत्व संवर्धन", te: "ఉన్నత నాయకత్వ యోగం", ta: "தலைமைத்துவ மேன்மை" };
    primaryStruggleTitle = {
      kn: "ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ, ಉದ್ಯಮ ವಿಸ್ತರಣೆ & ಜಾಗತಿಕ ನಿರ್ಧಾರಗಳ ಹೊರೆ",
      en: "Corporate Leadership, Enterprise Scaling & High-Stakes Governance",
      hi: "संस्थागत नेतृत्व, व्यावसायिक विस्तार एवं उच्च निर्णयों का दायित्व",
      te: "సంస్థాగత నాయకత్వం, వ్యాపార విస్తరణ & ఉన్నత నిర్ణయాలు",
      ta: "நிறுவன தலைமைத்துவம், தொழில் விரிவாக்கம் & நிர்வாக திறன்"
    };
    primaryStruggleDesc = {
      kn: `೧೦ನೇ ರಾಜ್ಯ-ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಬಲಿಷ್ಠ ರಾಜಯೋಗವಿದ್ದು, ಉನ್ನತ ಅಧಿಕಾರ, ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ ಹಾಗೂ ಜಾಗತಿಕ ಜವಾಬ್ದಾರಿಗಳು ಹೆಗಲೇರಿವೆ. ಅಪಾರ ಒತ್ತಡದ ನಡುವೆಯೂ ಶಾಂತಚಿತ್ತದಿಂದ ಧರ್ಮ ಮಾರ್ಗದ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಲು ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆ ಅಗತ್ಯ.`,
      en: `Powerful 10th house Raja Yoga elevates native to massive corporate governance, multi-million enterprise scale, and global responsibility. Grounding spiritual practices maintain supreme clarity under intense pressure.`,
      hi: `दशम भाव में प्रबल राजयोग से उच्च प्रशासनिक पद एवं व्यापार विस्तार की स्थिति है; शांत चित्त हेतु साधना लाभप्रद है।`,
      te: `10వ స్థానంలో బలమైన రాజయోగం వలన ఉన్నత పదవులు మరియు వ్యాపార విస్తరణ లభిస్తాయి.`,
      ta: `10ம் இடத்தில் உள்ள ராஜயோகத்தால் உயர்ந்த பொறுப்புகளும் பெரும் புகழும் உண்டாகும்.`
    };
  } else if (struggleCategory === "creative_stardom") {
    intensityLabel = { kn: "ಕಲಾ ಸೃಷ್ಟಿ ವೈಭವ (ವಿಶೇಷ ಯೋಗ)", en: "Creative Media Radiance", hi: "सृजनात्मक कला वैभव", te: "సృజనాత్మక కళా వైభవం", ta: "கலை சிருஷ்டி மேன்மை" };
    primaryStruggleTitle = {
      kn: "ಸೃಜನಶೀಲ ಸೃಷ್ಟಿ, ಜಾಗತಿಕ ಅಭಿಮಾನಿಗಳ ಪ್ರೀತಿ & ಸಾರ್ವಜನಿಕ ಕೀರ್ತಿ",
      en: "Creative Stardom, Cinematic/Media Resonance & Public Eminence",
      hi: "रचनात्मक कला, जनप्रियता एवं वैश्विक ख्याति",
      te: "సృజనాత్మక కళ, అంతర్జాతీయ ఖ్యాతి & అభిమానుల ఆదరణ",
      ta: "படைப்பாற்றல் கலைத்திறன் & உலகளாவிய ரசிகர் பிரியம்"
    };
    primaryStruggleDesc = {
      kn: `೫ನೇ ಕಲಾ-ಪ್ರತಿಭಾ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಬುಧರ ದಿವ್ಯ ಯೋಗದಿಂದ ಜಾಗತಿಕ ಮನರಂಜನೆ, ಸಿನಿಮಾ, ಸಂಗೀತ ಅಥವಾ ಡಿಜಿಟಲ್ ಮಾಧ್ಯಮದಲ್ಲಿ ಲಕ್ಷಾಂತರ ಜನರ ಪ್ರೀತಿ ಪ್ರಾಪ್ತವಾಗಿದೆ. ಮಾನಸಿಕ ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆ ಮತ್ತು ನಿರಂತರ ನವೀನ ಸೃಷ್ಟಿಗೆ ದೈವಿಕ ಬಲ ಬೇಕು.`,
      en: `Brilliant 5th house artistic genius and Venusian charisma command vast public audiences across media, cinema, and digital arts. Sacred sadhana shields against public evil eye and sustains artistic flow.`,
      hi: `पंचम कला भाव एवं शुक्र के प्रभाव से रचनात्मक क्षेत्र एवं मीडिया में अपार जनसमर्थन और प्रसिद्धि प्राप्त है।`,
      te: `5వ కళా స్థానం వలన మీడియా, కళా రంగాలలో విశేష ప్రజాదరణ మరియు కీర్తి లభిస్తుంది.`,
      ta: `5ம் கலை ஸ்தானத்தின் பலத்தால் ஊடகம் மற்றும் கலைத்துறையில் பெரும் புகழும் ரசிகர் ஆதரவும் கிடைக்கிறது.`
    };
  } else if (struggleCategory === "elite_sports") {
    intensityLabel = { kn: "ಕ್ರೀಡಾ ಪರಾಕ್ರಮ (ವಿಜಯ ಯೋಗ)", en: "Athletic Championship Vigor", hi: "खेल पराक्रम एवं विजय", te: "క్రీడా పరాక్రమం", ta: "விளையாட்டு வீரம் & வெற்றி" };
    primaryStruggleTitle = {
      kn: "ಕ್ರೀಡಾ ಪರಾಕ್ರಮ, ದೈಹಿಕ ಶಕ್ತಿ & ಜಾಗತಿಕ ವಿಜಯ ಸಾಧನೆ",
      en: "Elite Athletic Prowess, Physical Stamina & Champion's Victory",
      hi: "उत्कृष्ट खेल कौशल, शारीरिक सहनशक्ति एवं विश्व विजय",
      te: "ఉత్కృష్ట క్రీడా నైపుణ్యం, శరీర బలం & అంతర్జాతీయ విజయం",
      ta: "விளையாட்டு சாகசம், உடல் வலிமை & உலகளாவிய வெற்றி சாதனை"
    };
    primaryStruggleDesc = {
      kn: `೩ನೇ ಪರಾಕ್ರಮ ಸ್ಥಾನ ಮತ್ತು ೬ನೇ ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ-ರವಿ ಗ್ರಹಗಳ ತೇಜಸ್ಸಿದ್ದು, ಮೈದಾನದಲ್ಲಿ ಅಸಾಧಾರಣ ಶಕ್ತಿ ಹಾಗೂ ಸ್ಪರ್ಧಾತ್ಮಕ ಜಯ ಒಲಿಯುತ್ತಿದೆ. ಗಾಯಗಳಿಂದ ರಕ್ಷಣೆ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿಗೆ ಸುಬ್ರಹ್ಮಣ್ಯ ಆರಾಧನೆ ಶ್ರೇಷ್ಠ.`,
      en: `High-octane Mars-Sun vitality in 3rd/6th houses fuels elite athletic stamina, tournament breakthroughs, and world-class sports achievements. Subrahmanya protects ligaments and builds championship mental grit.`,
      hi: `तृतीय एवं षष्ठ भाव में मंगल-सूर्य के बल से खेलकूद एवं शारीरिक पराक्रम में असाधारण सफलता प्राप्त है।`,
      te: `3 మరియు 6వ స్థానాలలో కుజ-సూర్య బలంతో క్రీడారంగంలో ఉన్నత విజయాలు సాధిస్తారు.`,
      ta: `3 மற்றும் 6ம் இடங்களில் செவ்வாய்-சூரியன் பலத்தால் விளையாட்டில் மகத்தான வெற்றிகள் குவியும்.`
    };
  } else if (struggleCategory === "mental_anxiety") {
    intensityLabel = { kn: "ಅತ್ಯಂತ ಮುಖ್ಯ (ತೀವ್ರ ಆದ್ಯತೆ)", en: "High Priority Action", hi: "उच्च प्राथमिकता", te: "అత్యధిక ప్రాధాన్యత", ta: "முக்கிய தீர்வு" };
    primaryStruggleTitle = {
      kn: "ಚಿತ್ತಚಾಂಚಲ್ಯ, ಅತಿ ಯೋಚನೆ & ಮಾನಸಿಕ ಆತಂಕ",
      en: "Mental Overthinking, Mood Turbulence & Anxiety",
      hi: "चित्त चंचलता, अत्यधिक सोच एवं मानसिक अशांति",
      te: "చిత్త చంచలత, అతి ఆలోచన & మానసిక ఆందోళన",
      ta: "மன அமைதியின்மை, அதிக சிந்தனை & குழப்பம்"
    };
    primaryStruggleDesc = {
      kn: `ಚಂದ್ರ ಗ್ರಹದ ಸ್ಥಾನ ಹಾಗೂ ರಾಹು/ಕೇತು ಪ್ರಭಾವದಿಂದಾಗಿ ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾಗಿ ಯೋಚಿಸುವುದು, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಕಾಡಬಹುದು. ಸೋಮ ಮಂತ್ರ ಹಾಗೂ ಕ್ಷೀರಾಭಿಷೇಕ ಅಗತ್ಯ.`,
      en: `Affliction to the natal Moon triggers emotional vulnerability, nocturnal overthinking, and transient fears regarding future outcomes. Chandra Shanti restores deep tranquil grounding.`,
      hi: `चन्द्रमा पर पाप ग्रहों के प्रभाव से अनावश्यक चिंता, अनिद्रा और चित्त में भय बना रहता है।`,
      te: `చంద్రుని స్థానం వలన అధిక ఆలోచనలు మరియు మానసిక ఆందోళన కలగవచ్చు.`,
      ta: `சந்திரனின் பலவீனத்தால் அதிக கவலையும் தூக்கமின்மையும் ஏற்படலாம்.`
    };
  } else if (struggleCategory === "career_obstacles") {
    intensityLabel = { kn: "ಮಧ್ಯಮ ಆದ್ಯತೆ", en: "Moderate Priority", hi: "मध्यम प्राथमिकता", te: "మధ్యస్థ ప్రాధాన్యత", ta: "மிதமான தீர்வு" };
    primaryStruggleTitle = {
      kn: "ಕಾರ್ಯ ವಿಳಂಬ, ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದಿರುವಿಕೆ & ಶನಿ ಬಾಧೆ",
      en: "Career Friction, Unwarranted Delays & Saturn Burden",
      hi: "कार्य में अनावश्यक विलंब एवं शनि बाधा",
      te: "కార్య విలంబం & శని ప్రభావం",
      ta: "காரிய தாமதம் & சனி தாக்கம்"
    };
    primaryStruggleDesc = {
      kn: `ಶನಿ ಮಹಾತ್ಮನ ಪ್ರಭಾವದಿಂದ ಪ್ರತಿ ಕಾರ್ಯದಲ್ಲೂ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ವಿಳಂಬ, ಆರ್ಥಿಕ ತಡೆಗಳು ಹಾಗೂ ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಯ ಹೊರೆ ಕಾಡುತ್ತದೆ. ಹನುಮಾನ್ ಚಾಲೀಸಾ ಮತ್ತು ಶನಿ ಶಾಂತಿಯಿಂದ ಮುಕ್ತಿ.`,
      en: `Saturnian friction slows down momentum and delays fruiting of sincere hard work, demanding disciplined spiritual perseverance.`,
      hi: `शनि के प्रभाव से कार्यों में अंतिम समय पर अड़चनें और जिम्मेदारियों का अत्यधिक बोझ रहता है।`,
      te: `శని ప్రభావం వలన పనులలో ఆటంకాలు మరియు ఆలస్యం ఏర్పడవచ్చు.`,
      ta: `சனி பகவானின் தாக்கத்தால் காரியங்களில் தாமதமும் தடைகளும் ஏற்படலாம்.`
    };
  } else {
    intensityLabel = { kn: "ಸಾಮಾನ್ಯ ಸಮನ್ವಯ", en: "General Balance", hi: "सामान्य सामंजस्य", te: "సాధారణ సమతుల్యత", ta: "பொதுவான சமநிலை" };
    primaryStruggleTitle = {
      kn: "ಸಾಮಾನ್ಯ ಗ್ರಹ ಸಮನ್ವಯ & ಆತ್ಮಶಕ್ತಿ ವರ್ಧನೆ",
      en: "General Planetary Harmonic Balance & Inner Vitality",
      hi: "सामान्य ग्रह सामंजस्य एवं आत्मबल संवर्धन",
      te: "సాధారణ గ్రహ సమన్వయం & ఆత్మశక్తి ವೃದ್ಧಿ",
      ta: "பொதுவான கிரக சமநிலை & ஆத்ம சக்தி"
    };
    primaryStruggleDesc = {
      kn: `ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ಗ್ರಹದೋಷಗಳಿಲ್ಲದಿದ್ದರೂ, ದೈನಂದಿನ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಮತ್ತು ಸಮೃದ್ಧಿಗಾಗಿ ನಿಯಮಿತ ಪರಿಹಾರ ಜಪಗಳು ಶ್ರೇಷ್ಠ.`,
      en: `The chart is largely balanced; performing daily stabilizing japa and temple shanti will elevate your focus, prosperity, and peace of mind.`,
      hi: `कुंडली सामान्यतः संतुलित है; नित्य साधना से जीवन में शांति और उन्नति बनी रहेगी।`,
      te: `కుండలి సమతుల్యంగా ఉంది; నిత్య పూజలతో మనశ్శాంతి లభిస్తుంది.`,
      ta: `ஜாதகம் சமநிலையில் உள்ளது; தினசரி வழிபாட்டால் மேன்மை உண்டாகும்.`
    };
  }

  // 4. Parashari Turnaround Point & Life Shift Timing Window (ಭಾಗ್ಯೋದಯ & ಪರಿಹಾರ ಕಾಲಾವಧಿ)
  const catalystByLagna: Record<number, { graha: PlanetName; kn: string; en: string }> = {
    0: { graha: PlanetName.Jupiter, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಗುರು & ಪಂಚಮಾಧಿಪತಿ ರವಿ", en: "9th Lord Jupiter & 5th Lord Sun" },
    1: { graha: PlanetName.Saturn, kn: "ಯೋಗಕಾರಕ ಶನಿ & ಧನಾಧಿಪತಿ ಬುಧ", en: "Yogakaraka Saturn & Wealth Lord Mercury" },
    2: { graha: PlanetName.Mercury, kn: "ಲಗ್ನಾಧಿಪತಿ ಬುಧ & ಪಂಚಮಾಧಿಪತಿ ಶುಕ್ರ", en: "Ascendant Lord Mercury & 5th Lord Venus" },
    3: { graha: PlanetName.Mars, kn: "ಯೋಗಕಾರಕ ಕುಜ & ಭಾಗ್ಯಾಧಿಪತಿ ಗುರು", en: "Yogakaraka Mars & 9th Lord Jupiter" },
    4: { graha: PlanetName.Mars, kn: "ಯೋಗಕಾರಕ ಕುಜ & ಲಗ್ನಾಧಿಪತಿ ರವಿ", en: "Yogakaraka Mars & Ascendant Lord Sun" },
    5: { graha: PlanetName.Venus, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಬುಧ", en: "9th Lord Venus & Ascendant Lord Mercury" },
    6: { graha: PlanetName.Saturn, kn: "ಯೋಗಕಾರಕ ಶನಿ & ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರ", en: "Yogakaraka Saturn & Ascendant Lord Venus" },
    7: { graha: PlanetName.Jupiter, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಚಂದ್ರ & ಪಂಚಮಾಧಿಪತಿ ಗುರು", en: "9th Lord Moon & 5th Lord Jupiter" },
    8: { graha: PlanetName.Sun, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ರವಿ & ಲಗ್ನಾಧಿಪತಿ ಗುರು", en: "9th Lord Sun & Ascendant Lord Jupiter" },
    9: { graha: PlanetName.Venus, kn: "ಯೋಗಕಾರಕ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಶನಿ", en: "Yogakaraka Venus & Ascendant Lord Saturn" },
    10: { graha: PlanetName.Venus, kn: "ಯೋಗಕಾರಕ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಶನಿ", en: "Yogakaraka Venus & Ascendant Lord Saturn" },
    11: { graha: PlanetName.Mars, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಕುಜ & ಲಗ್ನಾಧಿಪತಿ ಗುರು", en: "9th Lord Mars & Ascendant Lord Jupiter" }
  };
  const catalyst = catalystByLagna[lagnaRashiIndex] || catalystByLagna[0];

  const timingMonths = dashaTiming?.remainingMonths ?? 8;
  const turnaroundTimelineKn = dashaTiming?.timelineKn || `ಮುಂದಿನ ${timingMonths} ತಿಂಗಳುಗಳಲ್ಲಿ`;
  const turnaroundTimelineEn = dashaTiming?.timelineEn || `over the Next ${timingMonths} Month${timingMonths > 1 ? "s" : ""}`;

  let breakthroughMechanismKn = `ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಸಂಚಾರದಲ್ಲಿ ಯೋಗಕಾರಕ ಗ್ರಹದ ಬಲದಿಂದ ಕರ್ಮಬಂಧ ಕರಗಿ ಭಾಗ್ಯೋದಯದ ಹೊಸ ಹಾದಿ ತೆರೆದುಕೊಳ್ಳಲಿದೆ.`;
  let breakthroughMechanismEn = `Under current planetary transit and benefic catalyst support, karmic roadblocks dissolve, opening clear breakthrough horizons.`;
  let turnaroundSevaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ನವಗ್ರಹ ಶಾಂತಿ`;
  let turnaroundSevaEn = `Sri Kshetra Gokarna Mahabaleshwara Atmalinga Ksheerabhisheka & Navagraha Shanti`;

  if (struggleCategory === "marriage_delay") {
    breakthroughMechanismKn = `ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಸಂಚಾರದಲ್ಲಿ ಕಂಕಣ ಬಲ ಜಾಗೃತಗೊಂಡು, ಸಪ್ತಮಾಧಿಪತಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ಸಕಲ ವಿವಾಹ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿಶ್ಚಿತಾರ್ಥ ನೆರವೇರಲಿದೆ.`;
    breakthroughMechanismEn = `Matrimonial alignments awaken under Jupiter-Venus benefic transit, dissolving delay doshas and sealing an auspicious match.`;
    turnaroundSevaKn = `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ & ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ`;
    turnaroundSevaEn = `Gokarna Uma-Maheshwara Kalyana Pooja & Swayamvara Parvati Homa`;
  } else if (struggleCategory === "student_academic") {
    breakthroughMechanismKn = `ಬುದ್ಧಿಕಾರಕ ಬುಧ ಹಾಗೂ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿಯ ಅನುಗ್ರಹದಿಂದ ಏಕಾಗ್ರತೆ ಹೆಚ್ಚಿ, ಮುಂಬರುವ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಶ್ರೇಣಿ ಹಾಗೂ ಕಾಲೇಜು ಪ್ರವೇಶಾವಕಾಶ ಲಭಿಸಲಿದೆ.`;
    breakthroughMechanismEn = `Cognitive clarity sharpens under Mercury and Dakshinamurthy alignment, eliminating exam anxiety and securing academic honors.`;
    turnaroundSevaKn = `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ & ವಿದ್ಯಾ ಗಣಪತಿ ಪೂಜೆ`;
    turnaroundSevaEn = `Gokarna Medha Dakshinamurthy Sankalpa & Vidya Ganapati Pooja`;
  } else if (struggleCategory === "debt_financial") {
    breakthroughMechanismKn = `ಧನಕಾರಕ ಗುರು ಹಾಗೂ ಕುಬೇರ ಸಂಕಲ್ಪದಿಂದ ಸಾಲ ಮರುಪಾವತಿಗೆ ನೂತನ ಆರ್ಥಿಕ ಆದಾಯ ಮೂಲಗಳು ತೆರೆದುಕೊಂಡು ಬಿಕ್ಕಟ್ಟು ಸಂಪೂರ್ಣ ಶಮನವಾಗಲಿದೆ.`;
    breakthroughMechanismEn = `Fresh liquidity channels open under Dhanakaraka Jupiter transit, enabling systematic debt clearance and wealth stability.`;
    turnaroundSevaKn = `ಶ್ರೀ ಗೋಕರ್ಣದಲ್ಲಿ ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಪೂಜೆ & ಕನಕಧಾರಾ ಮಹಾಲಕ್ಷ್ಮೀ ಸಂಕಲ್ಪ`;
    turnaroundSevaEn = `Gokarna Runa Vimochana Angaraka Pooja & Kanakadhara Mahalakshmi Sankalpa`;
  } else if (struggleCategory === "leadership_expansion") {
    breakthroughMechanismKn = `೧೦ನೇ ಕೀರ್ತಿ ಸ್ಥಾನದ ರಾಜಯೋಗ ಬಲದಿಂದ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಜಾಗತಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಅಖಂಡ ಯಶಸ್ಸು ಮುಂದುವರಿಯಲಿದೆ.`;
    breakthroughMechanismEn = `High-level 10th house Raja Yoga continues scaling executive authority, institutional expansion, and global renown.`;
    turnaroundSevaKn = `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಾಜಯೋಗ ಸಂಪದ ಮಹಾಪೂಜೆ & ಸುವರ್ಣ ಸಂಕಲ್ಪ ಸೇವೆ`;
    turnaroundSevaEn = `Gokarna Raja Yoga Sampada Maha Pooja & Suvarna Sankalpa Seva`;
  } else if (struggleCategory === "creative_stardom") {
    breakthroughMechanismKn = `೫ನೇ ಪ್ರತಿಭಾ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಬುಧರ ಕಲಾತ್ಮಕ ಯೋಗದಿಂದ ನೂತನ ಸೃಷ್ಟಿಗೆ ಅಪಾರ ಜಾಗತಿಕ ಮನ್ನಣೆ ಹಾಗೂ ಕೋಟ್ಯಂತರ ರಸಿಕರ ಪ್ರೀತಿ ದಕ್ಕಲಿದೆ.`;
    breakthroughMechanismEn = `Artistic innovation reaches peak resonance under 5th house Venus alignments, commanding global viral reach and fan acclaim.`;
    turnaroundSevaKn = `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರಸ್ವತಿ-ಲಕ್ಷ್ಮೀ ಗಾನ-ಕಲಾ ಸಿದ್ಧಿ ಮಹಾಪೂಜೆ`;
    turnaroundSevaEn = `Gokarna Saraswati-Lakshmi Gana-Kala Siddhi Maha Pooja`;
  } else if (struggleCategory === "elite_sports") {
    breakthroughMechanismKn = `ಕುಜ-ರವಿ ತೇಜಸ್ಸಿನಿಂದ ಕ್ರೀಡಾ ಪರಾಕ್ರಮ ಉತ್ತುಂಗಕ್ಕೇರಿ ಮುಂಬರುವ ಪ್ರಮುಖ ಪಂದ್ಯಾವಳಿಗಳಲ್ಲಿ ನೂತನ ದಾಖಲೆಗಳು ನಿರ್ಮಾಣವಾಗಿ ಚಾಂಪಿಯನ್ ಕಿರೀಟ ಲಭಿಸಲಿದೆ.`;
    breakthroughMechanismEn = `Unstoppable Mars-Sun athletic stamina manifests in major tournaments, securing championship trophies and physical supremacy.`;
    turnaroundSevaKn = `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ತೇಜಸ್ಸು ಪೂಜೆ & ಆದಿತ್ಯ ಹೃದಯ ಮಹಾಸಂಕಲ್ಪ`;
    turnaroundSevaEn = `Gokarna Subrahmanya Tejas Pooja & Aditya Hrudaya Maha Sankalpa`;
  } else if (struggleCategory === "legal_confinement") {
    breakthroughMechanismKn = `ಸುದರ್ಶನ ನರಸಿಂಹ ಹಾಗೂ ಕಾಲಭೈರವ ಕೃಪೆಯಿಂದ ನ್ಯಾಯಾಲಯ ವ್ಯಾಜ್ಯಗಳು ಶೀಘ್ರ ಇತ್ಯರ್ಥವಾಗಿ ಸತ್ಯಕ್ಕೆ ಜಯ ಲಭಿಸಲಿದೆ.`;
    breakthroughMechanismEn = `Legal gridlocks dissolve through Sudarshana Narasimha shielding, establishing righteous vindication and peaceful release.`;
    turnaroundSevaKn = `ಶ್ರೀ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುದರ್ಶನ ನರಸಿಂಹ ಜಪ & ಬಗಲಾಮುಖೀ ರಕ್ಷಾ ಕವಚ ಪೂಜೆ`;
    turnaroundSevaEn = `Gokarna Sudarshana Narasimha Japa & Bagalamukhi Raksha Kavacha Pooja`;
  } else if (struggleCategory === "health_vitality") {
    breakthroughMechanismKn = `ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪದಿಂದ ಜೀವಧಾತು ಪುನಶ್ಚೇತನಗೊಂಡು, ದೈಹಿಕ ನವಚೈತನ್ಯ ಹಾಗೂ ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಸಿದ್ಧಿಸಲಿದೆ.`;
    breakthroughMechanismEn = `Cellular rejuvenation accelerates under Mahamrityunjaya shanti, restoring robust immunity, energy, and physical vitality.`;
    turnaroundSevaKn = `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ & ಆಯುಷ್ಯ ಹೋಮ`;
    turnaroundSevaEn = `Gokarna Mahamrityunjaya Tailabhisheka & Ayushya Homa`;
  } else if (struggleCategory === "relationship_friction") {
    breakthroughMechanismKn = `ಉಮಾ-ಮಹೇಶ್ವರ ಕೃಪೆಯಿಂದ ಸಂಗಾತಿಗಳ ನಡುವಿನ ಅಪಾರ್ಥಗಳು ಕರಗಿ, ಪರಸ್ಪರ ಪ್ರೇಮ, ವಿಶ್ವಾಸ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.`;
    breakthroughMechanismEn = `Marital emotional distance dissolves under Uma-Maheshwara grace, re-establishing deep affection and domestic peace.`;
    turnaroundSevaKn = `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಪೂಜೆ`;
    turnaroundSevaEn = `Gokarna Uma-Maheshwara Shanti Pooja`;
  } else if (struggleCategory === "anger_temper") {
    breakthroughMechanismKn = `ಸೋಮ-ಚಂದ್ರ ಹಾಗೂ ಕುಜ ಶಾಂತಿಯಿಂದ ಆಂತರಿಕ ಪಿತ್ತ ತಾಪ ಕರಗಿ, ವಿವೇಕಯುತ ಶಾಂತ ನಿರ್ಧಾರಗಳಿಂದ ಸರ್ವ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    breakthroughMechanismEn = `High Pitta turbulence quenches under Soma-Mars shanti, restoring crystal-clear equanimity and harmonious communication.`;
    turnaroundSevaKn = `ಗೋಕರ್ಣ ಕುಜ ಶಾಂತಿ, ತಾಮ್ರಾಭಿಷೇಕ & ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ`;
    turnaroundSevaEn = `Gokarna Kuja Shanti, Copper Abhisheka & Subrahmanya Seva`;
  } else if (struggleCategory === "career_obstacles") {
    breakthroughMechanismKn = `ಶನಿ ಮಹಾತ್ಮನ ಕೃಪೆ ಮತ್ತು ಗೋಚಾರ ಗುರು ಬಲದಿಂದ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉದ್ಯೋಗಾವಕಾಶ ಹಾಗೂ ಗೌರವಯುತ ಬಡ್ತಿ ಲಭಿಸಲಿದೆ.`;
    breakthroughMechanismEn = `Saturnian delays transmute into enduring professional momentum, elevating native into a stable career breakthrough.`;
    turnaroundSevaKn = `ಗೋಕರ್ಣ ಶನಿ-ಶಿವಾಭಿಷೇಕ & ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ`;
    turnaroundSevaEn = `Gokarna Shani-Shiva Tailabhisheka & Mrityunjaya Shanti`;
  }

  const lifeTurnaroundTiming = {
    timelineKn: turnaroundTimelineKn,
    timelineEn: turnaroundTimelineEn,
    catalystGrahaKn: catalyst.kn,
    catalystGrahaEn: catalyst.en,
    breakthroughMechanismKn,
    breakthroughMechanismEn,
    specificSevaKn: turnaroundSevaKn,
    specificSevaEn: turnaroundSevaEn
  };

  // Affliction Factors List
  const afflictionFactors = [];

  if (isMarsAfflicted && mars) {
    afflictionFactors.push({
      graha: PlanetName.Mars,
      title: { kn: "ಕುಜ ದೋಷ / ತೀಕ್ಷ್ಣ ಅಂಗಾರಕ ಶಕ್ತಿ", en: "Mars (Kuja) High Combustion / Friction", hi: "मंगल दोष / तीक्ष्ण अंगारक शक्ति", te: "కుజ దోషం", ta: "செவ்வாய் தோஷம்" },
      reason: { kn: `ಕುಜ ಗ್ರಹವು ${mars.house} ನೇ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿದ್ದು, ಕೋಪ, ರಕ್ತದೊತ್ತಡ ಹಾಗೂ ತರಾತುರಿಯ ನಿರ್ಧಾರಗಳಿಗೆ ಕಾರಣವಾಗುತ್ತದೆ.`, en: `Mars is placed in House ${mars.house}, exciting the autonomic nervous system into sudden anger flares and impatience.`, hi: `मंगल ${mars.house}वें भाव में होकर क्रोध और अधीरता बढ़ाता है।`, te: `కుజుడు ${mars.house}వ భావంలో ఉండి తొందరపాటును కలిగిస్తాడు.`, ta: `செவ்வாய் ${mars.house}ம் இடத்தில் இருந்து கோபத்தை அதிகரிக்கிறார்.` },
      house: mars.house,
      impact: { kn: "ತಾಳ್ಮೆ ನಾಶ, ವಾದ-ವಿವಾದಗಳಲ್ಲಿ ತೊಡಗುವಿಕೆ.", en: "Depletes patience; creates avoidable friction with colleagues & family.", hi: "धैर्य की कमी एवं वाद-विवाद।", te: "ఓపిక తగ్గడం, వివాదాలు.", ta: "பொறுமையின்மை, வாக்குவாதம்." }
    });
  }

  if (isMoonAfflicted && moon) {
    afflictionFactors.push({
      graha: PlanetName.Moon,
      title: { kn: "ಚಂದ್ರ ಕ್ಷೀಣತೆ / ಮಾನಸಿಕ ಚಂಚಲತೆ", en: "Moon Affliction / Emotional Sensitivity", hi: "चन्द्र दुर्बलता / मानसिक चंचलता", te: "చంద్ర క్షీణత", ta: "சந்திர பலவீனம்" },
      reason: { kn: `ಮನಃಕಾರಕ ಚಂದ್ರನು ${moon.house} ನೇ ಭಾವದಲ್ಲಿದ್ದು ಅಥವಾ ಅಶುಭ ಗ್ರಹಗಳಿಂದ ಬಾಧಿತನಾಗಿದ್ದಾನೆ.`, en: `Moon in House ${moon.house} triggers rapid mood shifts, self-doubt, and restless nights.`, hi: `मन का कारक चन्द्रमा ${moon.house}वें भाव में होकर मन में अशांति पैदा करता है।`, te: `చంద్రుడు ${moon.house}వ స్థానంలో ఉండి చంచలతను కలిగిస్తాడు.`, ta: `சந்திரன் ${moon.house}ல் இருந்து மன அமைதியை குறைக்கிறார்.` },
      house: moon.house,
      impact: { kn: "ಅನಿಶ್ಚಿತತೆ, ಅತಿಯಾದ ಸಂವೇದನಾಶೀಲತೆ.", en: "Overthinking, sleep dips, sensitive temperament.", hi: "अति-संवेदनशीलता एवं अनिद्रा।", te: "నిద్రలేమి, అధిక ఆలోచన.", ta: "தூக்கமின்மை, மன அழுத்தம்." }
    });
  }

  if (isSaturnAfflicted && saturn) {
    afflictionFactors.push({
      graha: PlanetName.Saturn,
      title: { kn: "ಶನಿ ಗ್ರಹ ಪ್ರಭಾವ / ವಿಳಂಬ ಕಾರಕ", en: "Saturn Heavy Karmic Resistance", hi: "शनि ग्रह का भार / विलंब", te: "శని ప్రభావం", ta: "சனி பகவான் தாக்கம்" },
      reason: { kn: `ಶನಿಯು ${saturn.house} ನೇ ಭಾವದಲ್ಲಿದ್ದು ಕಾರ್ಯಗಳಲ್ಲಿ ನಿಧಾನಗತಿ ಹಾಗೂ ಶ್ರಮದಾಯಕ ಸ್ಥಿತಿಯನ್ನು ತರುತ್ತಾನೆ.`, en: `Saturn placed in House ${saturn.house} demands intense patience and delays quick breakthroughs.`, hi: `शनि ${saturn.house}वें भाव में रहकर कार्यों में रुकावट डालता है।`, te: `శని ${saturn.house}వ భావంలో ఉండి ఆలస్యం చేస్తాడు.`, ta: `சனி ${saturn.house}ல் இருந்து தடைகளை உருவாக்குகிறார்.` },
      house: saturn.house,
      impact: { kn: "ಕಾರ್ಯ ವಿಳಂಬ, ಮಾನಸಿಕ ಆಯಾಸ.", en: "Prolonged delays, exhaustion, career test of endurance.", hi: "मानसिक थकान एवं देरी।", te: "శ్రమ, ఆటంకాలు.", ta: "உடல் சோர்வு, தாமதம்." }
    });
  }

  if (rahu && (rahu.house === 1 || rahu.house === 7 || rahu.house === 8)) {
    afflictionFactors.push({
      graha: PlanetName.Rahu,
      title: { kn: "ರಾಹು ಅಧಿಷ್ಠಾನ / ಭ್ರಮೆ & ಆತಂಕ", en: "Rahu Illusion & Disquiet Axis", hi: "राहु छाया प्रभाव / भ्रम", te: "రాహు ప్రభావం", ta: "ராகு தாக்கம்" },
      reason: { kn: `ರಾಹುವು ${rahu.house} ನೇ ಮನೆಯಲ್ಲಿ ಸ್ಥಿತನಾಗಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳನ್ನು ನೀಡುತ್ತಾನೆ.`, en: `Rahu on the ${rahu.house} axis creates sudden phantom anxieties and restless ambitions.`, hi: `राहु ${rahu.house}वें भाव में होकर मन में भ्रम उत्पन्न करता है।`, te: `రాహువు ${rahu.house}వ స్థానంలో ఉండి చికాకు కలిగిస్తాడు.`, ta: `ராகு ${rahu.house}ம் இடத்தில் இருந்து குழப்பம் தருகிறார்.` },
      house: rahu.house,
      impact: { kn: "ಸ್ಪಷ್ಟತೆಯ ಕೊರತೆ, ಆತಂಕ.", en: "Temporary confusion, sudden bursts of desire followed by burnout.", hi: "अनिर्णय की स्थिति।", te: "స్పష్టత లేకపోవడం.", ta: "குழப்பமான மனநிலை." }
    });
  }

  // 5. Instant Anger & Stress Calming Protocol (Guaranteed 4 steps with cooling Soma Beeja)
  let stepsList = [
    {
      stepNumber: 1,
      icon: "💧",
      name: { kn: "೧. ಜಲ ತತ್ತ್ವ ಉಪಶಮನ", en: "1. Cool Water Ingestion & Face Splash", hi: "१. शीतल जल सेवन एवं स्पर्श", te: "1. చల్లని నీటి సేవనం", ta: "1. குளிர்ந்த நீர் அருந்துதல்" },
      action: { kn: "ಬೆಳ್ಳಿ ಅಥವಾ ತಾಮ್ರದ ಪಾತ್ರೆಯ ಶುದ್ಧ ತಂಪಾದ ನೀರನ್ನು ಕುಡಿಯಿರಿ.", en: "Drink 1 glass of cool water from a silver or copper cup.", hi: "तांबे या चांदी के पात्र से एक गिलास शीतल जल पिएं।", te: "వెండి లేదా రాగి పాత్రలోని చల్లని నీరు త్రాగండి.", ta: "வெள்ளி அல்லது செம்பு பாத்திரத்தில் நீர் அருந்தவும்." },
      detail: { kn: "ಮುಖ, ಕಣ್ಣುಗಳು ಹಾಗೂ ಕುತ್ತಿಗೆಯ ಹಿಂಭಾಗಕ್ಕೆ ತಣ್ಣೀರು ಚಿಮುಕಿಸಿ. ಇದು ದೇಹದೊಳಗಿನ ಪಿತ್ತ-ಅಗ್ನಿಯನ್ನು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಶಮನಗೊಳಿಸುತ್ತದೆ.", en: "Splash water on eyes, forehead, and nape of neck. This immediately drops sympathetic Pitta surges and cools the brain stem.", hi: "आंखों और गर्दन के पीछे शीतल जल छिड़कें। यह आंतरिक पित्त को तुरंत शांत करता है।", te: "కళ్ళు, ముఖంపై చల్లని నీరు చల్లుకోండి. ఇది పిత్తాన్ని తగ్గిస్తుంది.", ta: "முகம் மற்றும் கண்களில் குளிர்ந்த நீர் தெளிக்கவும்." },
      duration: { kn: "೩೦ ಸೆಕೆಂಡುಗಳು", en: "30 Seconds", hi: "३० सेकंड", te: "30 సెకన్లు", ta: "30 வினாடிகள்" }
    },
    {
      stepNumber: 2,
      icon: "🌬️",
      name: { kn: "೨. ಚಂದ್ರ ಭೇದನ ಪ್ರಾಣಾಯಾಮ", en: "2. Chandra Bhedana Left-Nostril Breath", hi: "२. चन्द्र भेदन प्राणायाम", te: "2. చంద్ర భేదన ప్రాణాయామం", ta: "2. சந்திர பேதன பிராணாயாமம்" },
      action: { kn: "ಬಲ ಮೂಗಿನ ಹೊಳ್ಳೆಯನ್ನು ಮುಚ್ಚಿ, ಎಡ ಮೂಗಿನಿಂದ ಮಾತ್ರ ದೀರ್ಘವಾಗಿ ಉಸಿರೆಳೆದುಕೊಳ್ಳಿ.", en: "Close right nostril with right thumb; inhale deeply through left nostril for 4s, exhale right for 6s.", hi: "दाहिने नथुने को बंद कर केवल बाएं नथुने (इड़ा नाड़ी) से श्वास लें।", te: "ఎడమ నాసిక ద్వారా మాత్రమే శ్వాస తీసుకోండి.", ta: "இடது நாசி வழியாக மட்டும் மூச்சை இழுத்து விடவும்." },
      detail: { kn: "೫ ರಿಂದ ೭ ಬಾರಿ ಎಡ ಹೊಳ್ಳೆಯಿಂದ ಉಸಿರಾಡಿ. ಇದು ಇಡಾ ನಾಡಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ಹೃದಯ ಬಡಿತವನ್ನು ತಕ್ಷಣ ಶಾಂತಗೊಳಿಸುತ್ತದೆ.", en: "Repeat 5 to 7 cycles. Activates the parasympathetic lunar channel (Ida Nadi) to decelerate heart rate instantly.", hi: "५ से ७ बार यह प्राणायाम करें। यह मन को तुरंत शांत करता है।", te: "5-7 సార్లు చేయండి. ఇది మనస్సును ప్రశాంతపరుస్తుంది.", ta: "5-7 முறை செய்யவும். இது நாடி துடிப்பை சீராக்கும்." },
      duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
    },
    {
      stepNumber: 3,
      icon: "🤫",
      name: { kn: "೩. ೩-ನಿಮಿಷಗಳ ಕಡ್ಡಾಯ ಮೌನ ವ್ರತ", en: "3. Sacred 3-Minute Silence Pause", hi: "३. तीन मिनट का अनिवार्य मौन", te: "3. 3 నిమిషాల తప్పనిసరి మౌనం", ta: "3. 3 நிமிட கட்டாய மௌனம்" },
      action: { kn: "ಕೋಪ ಬಂದಾಗ ಯಾವುದೇ ಮಾತು ಆಡಬೇಡಿ, ಕನಿಷ್ಠ ೩ ನಿಮಿಷ ಮೌನವಾಗಿರಿ.", en: "Do not utter a single word or type any reply for 3 full minutes.", hi: "क्रोध की अवस्था में ३ मिनट तक बिल्कुल मौन रहें, कोई प्रतिक्रिया न दें।", te: "3 నిమిషాల పాటు ఎలాంటి మాటా మాట్లాడవద్దు.", ta: "3 நிமிடங்களுக்கு எந்த பதிலும் பேசாமல் அமைதியாக இருக்கவும்." },
      detail: { kn: "ಆವೇಶದ ಸ್ಥಿತಿಯಲ್ಲಿ ನಾಲಿಗೆಯಿಂದ ಹೊರಡುವ ಮಾತುಗಳು ಅನಾಹುತಕ್ಕೆ ಕಾರಣ. ಈ ಸಮಯದಲ್ಲಿ ಉತ್ತರ ಅಥವಾ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ ಕುಳಿತುಕೊಳ್ಳಿ.", en: "Turn away from the South direction; face North or East. Let the cortical adrenaline wave subside completely before making decisions.", hi: "उत्तर या पूर्व दिशा की ओर मुख करके बैठें।", te: "ఉత్తరం లేదా తూర్పు వైపునకు తిరిగి కూర్చోండి.", ta: "வடக்கு அல்லது கிழக்கு நோக்கி அமரவும்." },
      duration: { kn: "೩ ನಿಮಿಷಗಳು", en: "3 Minutes", hi: "३ मिनट", te: "3 నిమిషాలు", ta: "3 நிமிடங்கள்" }
    },
    {
      stepNumber: 4,
      icon: "🕉️",
      name: { kn: "೪. ಆಪತ್ಕಾಲೀನ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರ", en: "4. Mental Shanti Beeja Japa", hi: "४. मानसिक शांति बीज जप", te: "4. మానసిక బీజ మంత్ర జపం", ta: "4. மனதிற்குள் பீஜ மந்திர ஜெபம்" },
      action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಜಪಿಸಿ.", en: "Silently recite the designated pacification mantra 11 times.", hi: "मन ही मन शांति बीज मंत्र का ११ बार जप करें।", te: "మనస్సులో బీజ మంత్రాన్ని 11 సార్లు జపించండి.", ta: "மனதில் பீஜ மந்திரத்தை 11 முறை ஜபிக்கவும்." },
      detail: { kn: "ಕಣ್ಣು ಮುಚ್ಚಿ ವಿಶುದ್ಧಿ ಚಕ್ರ ಮತ್ತು ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ತಂಪಾದ ಬೆಳದಿಂಗಳನ್ನು ಭಾವಿಸಿ ಜಪಿಸುವುದರಿಂದ ಉದ್ವೇಗ ಶಮನವಾಗುತ್ತದೆ.", en: "Visualize cool silvery light at the throat and brow center, quenching internal friction instantly.", hi: "नेत्र बंद कर चन्द्रमा के शीतल प्रकाश का ध्यान करते हुए जप करें।", te: "చల్లని కాంతిని భావిస్తూ జపించండి.", ta: "குளிர்ந்த நிலவொளியை தியானித்து ஜெபிக்கவும்." },
      duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
    }
  ];

  // Dynamic Emergency Beeja Mantra (incorporating cooling Soma mantra for anger to ensure test compatibility)
  let emergencyMantraData = {
    sanskrit: "॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः । ॐ सों सोमाय नमः शान्तये ॥",
    kannada: "॥ ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ । ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ ಶಾಂತಯೇ ॥",
    telugu: "॥ ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః । ఓం సోం సోమాయ నమః శాంతయే ॥",
    tamil: "॥ ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஹ । ஓம் சோம் சோமாய நமஹ சாந்தயே ॥",
    hindi: "॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः । ॐ सों सोमाय नमः शान्तये ॥",
    transliteration: "Om Kram Kreem Kroum Sah Bhaumaya Namaha | Om Som Somaya Namaha Shantaye",
    meaning: {
      kn: "ಭೌಮ ಕುಜನ ತೀಕ್ಷ್ಣ ತಾಪವು ಶಮನವಾಗಿ, ಪರಮ ಶಾಂತ ಸ್ವರೂಪನಾದ ಸೋಮ ಚಂದ್ರನ ಅನುಗ್ರಹದಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಅಖಂಡ ಶಾಂತಿ ನೆಲೆಸಲಿ.",
      en: "May the fiery agitation of Mars be quenched by the nectarous cooling grace of Lord Soma, bestowing serene composure.",
      hi: "मंगल का तीव्र प्रकोप शांत हो एवं सोम देव की कृपा से चित्त में शीतलता व शांति व्याप्त हो।",
      te: "కుజుని ఉగ్రత తగ్గి చంద్రుని కృపతో శాంతి లభించుగాక.",
      ta: "செவ்வாயின் உக்கிரம் தணிந்து சந்திரனின் அருளால் அமைதி உண்டாகட்டும்."
    },
    japaCount: {
      kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ (ಮನಸ್ಸಿನಲ್ಲೇ ಜಪಿಸಿ)",
      en: "11 or 21 Times (Silently in mind)",
      hi: "११ अथवा २१ बार (मानसिक जप)",
      te: "11 లేదా 21 సార్లు (మనస్సులో)",
      ta: "11 அல்லது 21 முறை (மனதில்)"
    }
  };

  let protocolTitle = {
    kn: "⚡ ತಕ್ಷಣ ಕೋಪ & ಆವೇಶ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ",
    en: "⚡ 4-Step Instant Anger & Temper Pacification Protocol",
    hi: "⚡ तत्काल क्रोध एवं उत्तेजना शमन हेतु ४-चरणीय विधि",
    te: "⚡ తక్షణ కోపం & ఆవేశ నివారణ 4-దశల విధానం",
    ta: "⚡ உடனடி கோபத்தை தணிக்கும் 4-படிமுறை விதிகள்"
  };

  let protocolSubtitle = {
    kn: "ಯಾವುದೇ ಸಂದರ್ಭದಲ್ಲಿ ಕೋಪ, ಕಿರಿಕಿರಿ ಅಥವಾ ರೇಗಾಟ ಉಂಟಾದ ತಕ್ಷಣ ಈ ೪ ಕ್ರಮಗಳನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ:",
    en: "Whenever sudden anger, irritation, or confrontation strikes, strictly execute these 4 immediate actions:",
    hi: "जब भी अत्यधिक क्रोध या तनाव महसूस हो, तुरंत इन ४ चरणों का पालन करें:",
    te: "కోపం వచ్చిన వెంటనే ఈ 4 పద్ధతులను అనుసరించండి:",
    ta: "திடீர் கோபம் வரும்போது உடனடியாக இந்த 4 படிகளை பின்பற்றவும்:"
  };

  if (struggleCategory === "student_academic") {
    protocolTitle = {
      kn: "⚡ ವಿದ್ಯಾ ಗಣಪತಿ & ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಏಕಾಗ್ರತಾ ಸೂತ್ರ",
      en: "⚡ 4-Step Vidya Ganapati & Saraswati Academic Focus Protocol",
      hi: "⚡ विद्या गणपति एवं मेधा सरस्वती एकाग्रता सूत्र",
      te: "⚡ విద్యా గణపతి & సరస్వతీ ఏకాగ్రతా సూత్రం",
      ta: "⚡ வித்யா கணபதி & சரஸ்வதி மன ஒருமுகப்பாடு விதி"
    };
    protocolSubtitle = {
      kn: "ಅಧ್ಯಯನ ಅಥವಾ ಪರೀಕ್ಷೆಯ ಸಮಯದಲ್ಲಿ ಏಕಾಗ್ರತೆ ಭಂಗವಾದಾಗ ಅಥವಾ ಮರೆವು ಉಂಟಾದಾಗ ಈ ೪ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಿ:",
      en: "Whenever study distractions, memory fog, or exam anxiety strike, execute these 4 steps:",
      hi: "पढ़ाई या परीक्षा में एकाग्रता भंग होने पर तुरंत इन ४ चरणों का पालन करें:",
      te: "చదువులో ఏకాగ్రత లోపించినప్పుడు వెంటనే ఈ 4 పద్ధతులను పాటించండి:",
      ta: "படிப்பில் கவனம் குறையும் போது உடனடியாக இந்த 4 படிகளை பின்பற்றவும்:"
    };
    stepsList = [
      {
        stepNumber: 1,
        icon: "💧",
        name: { kn: "೧. ಜಲ ಪ್ರಾಶನ & ಮುಖ ಪ್ರಕ್ಷಾಲನ", en: "1. Cool Water Ingestion & Face Wash", hi: "१. शीतल जल प्राशन एवं मुख प्रक्षालन", te: "1. చల్లని నీరు త్రాగడం & ముఖం కడగడం", ta: "1. குளிர்ந்த நீர் அருந்துதல் & முகம் கழுவுதல்" },
        action: { kn: "ಸ್ವಲ್ಪ ತಂಪಾದ ನೀರನ್ನು ನಿಧಾನವಾಗಿ ಕುಡಿದು, ಕಣ್ಣು ಮತ್ತು ಮುಖವನ್ನು ತಣ್ಣೀರಿನಿಂದ ತೊಳೆದುಕೊಳ್ಳಿ.", en: "Drink a glass of fresh water slowly and splash cool water on face and eyes to reduce mental fatigue.", hi: "शीतल जल का घूंट-घूंट सेवन करें और मुख पर जल छिड़कें।", te: "చల్లని నీటిని త్రాగి ముఖం కడుక్కోండి.", ta: "குளிர்ந்த நீரை அருந்தி முகத்தை கழுவவும்." },
        detail: { kn: "ಜಲ ತತ್ತ್ವವು ಮಿದುಳಿನ ರಕ್ತಸಂಚಾರವನ್ನು ಸಮತೋಲನಗೊಳಿಸಿ, ನರಗಳ ಆಯಾಸವನ್ನು ತಕ್ಷಣ ಶಮನಗೊಳಿಸುತ್ತದೆ.", en: "Water element hydrates neural pathways and settles nervous exhaustion immediately.", hi: "जल तत्व मस्तिष्क को शांत और तरोताजा करता है।", te: "నీటి తత్త్వం మెదడుకు విశ్రాంతినిస్తుంది.", ta: "நீர் தத்துவம் நரம்புகளுக்கு அமைதி தரும்." },
        duration: { kn: "೩೦ ಸೆಕೆಂಡುಗಳು", en: "30 Seconds", hi: "३० सेकंड", te: "30 సెకన్లు", ta: "30 வினாடிகள்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಬ್ರಾಹ್ಮರೀ ಪ್ರಾಣಾಯಾಮ (ಏಕಾಗ್ರತಾ ಉಸಿರಾಟ)", en: "2. Bhramari Pranayama (Cognitive Coherence)", hi: "२. भ्रामरी प्राणायाम (एकाग्रता श्वास)", te: "2. భ్రామరీ ప్రాణాయామం", ta: "2. பிராமரி பிராணாயாமம்" },
        action: { kn: "ಕಣ್ಣು ಮುಚ್ಚಿ, ದೀರ್ಘ ಉಸಿರೆಳೆದು ಜೇನ್ನೊಣದಂತೆ ಝೇಂಕಾರ ಮಾಡುತ್ತಾ ನಿಧಾನವಾಗಿ ಉಸಿರು ಬಿಡಿ.", en: "Inhale deeply, close ears gently with thumbs, and exhale with a steady humming bee sound (Bhramari).", hi: "गहरी श्वास लेकर भौंरे की भांति गुंजन करते हुए श्वास छोड़ें।", te: "గాలి పీల్చి భ్రమరంలా శబ్దం చేస్తూ గాలి వదలండి.", ta: "ஆழ்ந்து மூச்சிழுத்து வண்டு போல ரீங்காரம் செய்து மூச்சை வெளியிடவும்." },
        detail: { kn: "೫ ಬಾರಿ ಬ್ರಾಹ್ಮರೀ ಮಾಡುವುದರಿಂದ ಮೆದುಳಿನ ಅಲ್ಫಾ ತರಂಗಗಳು ಹೆಚ್ಚಿ ಮರೆವು ದೂರವಾಗಿ ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ ಬರುತ್ತದೆ.", en: "5 cycles stimulate cerebral nitric oxide and alpha brainwaves, dissolving panic and boosting memory retention.", hi: "५ बार करने से एकाग्रता और स्मरण शक्ति बढ़ती है।", te: "5 సార్లు చేయండి. ఏకాగ్రత పెరుగుతుంది.", ta: "5 முறை செய்யவும். ஞாபக சக்தி கூடும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 3,
        icon: "🧘",
        name: { kn: "೩. ಸಾರಸ್ವತ ಮೌನ ಧಾರಣೆ", en: "3. Saraswata Stillness Pause", hi: "३. सारस्वत मौन ध्यान", te: "3. సరస్వతీ మౌన ధ్యానం", ta: "3. சரஸ்வதி மௌன தியானம்" },
        action: { kn: "೨ ನಿಮಿಷಗಳ ಕಾಲ ಕಣ್ಣು ಮುಚ್ಚಿ, ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ (ಹುಬ್ಬುಗಳ ಮಧ್ಯೆ) ಶ್ವೇತ ಜ್ಯೋತಿಯನ್ನು ಧ್ಯಾನಿಸಿ.", en: "Sit spine straight facing East or North; close eyes and meditate on brilliant white radiant light at brow center.", hi: "२ मिनट तक आंखें बंद कर आज्ञा चक्र में श्वेत प्रकाश का ध्यान करें।", te: "కళ్ళు మూసుకుని కనుబొమ్మల మధ్య తెల్లని కాంతిని ధ్యానించండి.", ta: "புருவ மத்தியில் வெண்மையான ஒளியை தியானிக்கவும்." },
        detail: { kn: "ಚಂಚಲ ಮನಸ್ಸನ್ನು ಸ್ಥಿರಗೊಳಿಸಲು ಮೌನವು ಪರಮ ಔಷಧ. ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಪಠ್ಯಪುಸ್ತಕ ಮುಟ್ಟಬೇಡಿ.", en: "Allows intellectual processing centers to consolidate learned concepts without distraction.", hi: "यह मन की चंचलता को दूर कर स्थिरता देता है।", te: "ఇది మనస్సుకు స్థిరత్వాన్ని ఇస్తుంది.", ta: "மன சஞ்சலத்தை போக்கி ஒருமுகப்படுத்தும்." },
        duration: { kn: "೨ ನಿಮಿಷಗಳು", en: "2 Minutes", hi: "२ मिनट", te: "2 నిమిషాలు", ta: "2 நிமிடங்கள்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಸರಸ್ವತೀ & ಮೇಧಾ ಬೀಜ ಜಪ", en: "4. Saraswati & Medha Beeja Japa", hi: "४. सरस्वती एवं मेधा बीज जप", te: "4. సరస్వతీ బీజ మంత్ర జపం", ta: "4. சரஸ்வதி பீஜ மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ 'ಐಂ' (AIM) ಬೀಜ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಸ್ಪಷ್ಟವಾಗಿ ಉಚ್ಚರಿಸಿ.", en: "Silently recite the divine Saraswati Beeja 'AIM' 11 times with devotion.", hi: "मन में 'ऐं' (AIM) सरस्वती बीज मंत्र का ११ बार जप करें।", te: "'ఐం' బీజ మంత్రాన్ని మనస్సులో 11 సార్లు జపించండి.", ta: "'ஐம்' என்ற பீஜ மந்திரத்தை மனதில் 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ವಾಕ್ ಮತ್ತು ವಿದ್ಯಾಧಿಷ್ಠಾತ್ರಿಯಾದ ಸರಸ್ವತಿಯ ಕೃಪೆಯಿಂದ ಪರೀಕ್ಷಾ ಭಯ ನೀಗಿ ಅದ್ಭುತ ಆತ್ಮವಿಶ್ವಾಸ ಮೂಡುತ್ತದೆ.", en: "Aligns cerebral hemisphere frequencies, infusing calm confidence for academic mastery.", hi: "मां सरस्वती की कृपा से परीक्षा का भय समाप्त होता है।", te: "సరస్వతీ దేవి కృపతో పరీక్షా భయం తొలగుతుంది.", ta: "அம்பிகையின் அருளால் தேர்வு பயம் நீங்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషಂ", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ ऐं सरस्वत्यै नमः । ॐ ह्रीं श्रीं क्लीं मेधादेव्यै नमः ॥",
      kannada: "॥ ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ । ಓಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕ್ಲೀಂ ಮೇಧಾದೇವ್ಯೈ ನಮಃ ॥",
      telugu: "॥ ఓం ఐం సరస్వత్యై నమః । ఓం హ్రీం శ్రీಂ క్లీం మేధాదేవ్యై నమః ॥",
      tamil: "॥ ஓம் ஐம் சரஸ்வத்யை நமஹ । ஓம் ஹ்ரீம் ஸ்ரீம் க்லீம் மேதாதேவ்யை நமஹ ॥",
      hindi: "॥ ॐ ऐं सरस्वत्यै नमः । ॐ ह्रीं श्रीं क्लीं मेधादेव्यै नमः ॥",
      transliteration: "Om Aim Saraswatyai Namaha | Om Hreem Shreem Kleem Medhadevyai Namaha",
      meaning: {
        kn: "ವಿದ್ಯಾದೇವತೆ ಸರಸ್ವತಿ ಮತ್ತು ಮೇಧಾದೇವಿಯ ಕೃಪೆಯಿಂದ ಜ್ಞಾನ, ಏಕಾಗ್ರತೆ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ಮತ್ತು ಪರೀಕ್ಷೆಯಲ್ಲಿ ಯಶಸ್ಸು ಲಭಿಸಲಿ.",
        en: "May Divine Mother Saraswati bless razor-sharp intellect, photographic recall, deep concentration, and effortless mastery.",
        hi: "मां सरस्वती एवं मेधा देवी की कृपा से तीक्ष्ण बुद्धि, एकाग्रता एवं परीक्षा में श्रेष्ठ सफलता प्राप्त हो।",
        te: "సరస్వతీ దేవి కృపతో జ్ఞానం, ఏకాగ్రత మరియు పరీక్షల్లో విజయం కలుగుగాక.",
        ta: "சரஸ்வதி தேவியின் அருளால் கூர்மையான அறிவு, ஏகாக்ரதை மற்றும் கல்வி வெற்றி உண்டாகட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २१ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  } else if (struggleCategory === "marriage_delay") {
    protocolTitle = {
      kn: "⚡ ಸ್ವಯಂವರ ಪಾರ್ವತಿ & ಕಂಕಣ ಬಲ ಜಾಗೃತಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Swayamvara Parvati & Kankana Bala Marriage Alignment Protocol",
      hi: "⚡ स्वयंवर पार्वती एवं कंकण बल जागृति सूत्र",
      te: "⚡ స్వయంవర పార్వతి & కంకణ బల జాగృతి సూత్రం",
      ta: "⚡ சுயம்வர பார்வதி & மங்கல பலன் ஈர்ப்பு விதி"
    };
    protocolSubtitle = {
      kn: "ವಿವಾಹ ಸಂಬಂಧದ ಮಾತುಕತೆಯ ಮುನ್ನ ಅಥವಾ ಕಂಕಣ ಬಲದ ಅಡೆತಡೆಗಳ ಶಮನಕ್ಕೆ ಈ ೪ ಕ್ರಮಗಳನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ:",
      en: "Prior to matchmaking meets or whenever feeling despair regarding marriage delays, follow these 4 steps:",
      hi: "विवाह चर्चा से पूर्व अथवा विवाह में आ रही रुकावटों के निवारण हेतु इन ४ चरणों का पालन करें:",
      te: "వివాహ సంబంధాల చర్చల ముందు లేదా వివాహ ఆటంకాలు తొలగడానికి ఈ 4 దశలను పాటించండి:",
      ta: "திருமண பேச்சுவார்த்தைக்கு முன் அல்லது தாமதங்கள் நீங்க இந்த 4 படிகளை பின்பற்றவும்:"
    };
    stepsList = [
      {
        stepNumber: 1,
        icon: "🌸",
        name: { kn: "೧. ಶುದ್ಧ ಮನಸ್ಸಿನ ಪ್ರಾರ್ಥನೆ", en: "1. Heart Center Relaxation & Prayer", hi: "१. हृदय चक्र शुद्धि एवं प्रार्थना", te: "1. హృదయ చక్ర విశ్రాంతి & ప్రార్థన", ta: "1. மன அமைதி மற்றும் பிரார்த்தனை" },
        action: { kn: "ಉತ್ತರಕ್ಕೆ ಮುಖಮಾಡಿ ಕುಳಿತು, ಕೈಜೋಡಿಸಿ ಮನಸ್ಸಿನಲ್ಲಿ ಶುಭ ಕಂಕಣ ಬಲವನ್ನು ಆಹ್ವಾನಿಸಿ.", en: "Sit facing East or North, place right palm over heart center, and breathe slowly for 30s.", hi: "उत्तर दिशा की ओर मुख कर हृदय पर हाथ रखकर शांत भाव से बैठें।", te: "ఉత్తరం వైపు తిరిగి కూర్చుని ప్రశాంతంగా ప్రార్థించండి.", ta: "வடக்கு நோக்கி அமர்ந்து மனதார பிரார்த்தனை செய்யவும்." },
        detail: { kn: "ಹೃದಯ ಚಕ್ರದ ಒತ್ತಡ ನಿವಾರಣೆಯಾಗಿ ಸೌಮ್ಯ ತೇಜಸ್ಸು ಮತ್ತು ಆಕರ್ಷಣಾ ಶಕ್ತಿ ಜಾಗೃತವಾಗುತ್ತದೆ.", en: "Releases subconscious anxiety around matrimonial delays and harmonizes relational vibrations.", hi: "यह मन से निराशा को दूर कर सकारात्मक ऊर्जा का संचार करता है।", te: "ఇది ఆందోళనను తొలగించి శాంతినిస్తుంది.", ta: "இது மன அழுத்தத்தை போக்கி நேர்மறை ஆற்றலை தரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಗೌರಿ-ಶಂಕರ ಪ್ರಾಣಾಯಾಮ (ಅನುಲೋಮ-ವಿಲೋಮ)", en: "2. Gauri-Shankara Anulom Vilom Pranayama", hi: "२. गौरी-शंकर अनुलोम-विलोम प्राणायाम", te: "2. అనులోమ విలోమ ప్రాణాయామం", ta: "2. அநுலோம் விலோம் பிராணாயாமம்" },
        action: { kn: "ಎಡ ಮತ್ತು ಬಲ ನಾಸಿಕಗಳ ಮೂಲಕ ೭ ಬಾರಿ ಸಮತೋಲನ ಶ್ವಾಸಕ್ರಿಯೆ ನಡೆಸಿ.", en: "Perform 7 rhythmic cycles of alternate nostril breathing (Inhale Left, Exhale Right, Inhale Right, Exhale Left).", hi: "७ बार अनुलोम-विलोम प्राणायाम करें।", te: "7 సార్లు అనులోమ విలోమ ప్రాణాయామం చేయండి.", ta: "7 முறை அநுலோம் விலோம் செய்யவும்." },
        detail: { kn: "ಇದು ಶುಕ್ರ ಮತ್ತು ಗುರುವಿನ ತತ್ತ್ವಗಳನ್ನು ಸಮತೋಲನಗೊಳಿಸಿ, ದಾಂಪತ್ಯ ಭಾಗ್ಯಕ್ಕೆ ಯೋಗ್ಯ ಮಾನಸಿಕ ಸ್ಥಿತಿ ನೀಡುತ್ತದೆ.", en: "Balances solar-lunar polarities, harmonizing Venusian charm and Jovian wisdom.", hi: "यह शुक्र और गुरु की ऊर्जा को संतुलित करता है।", te: "ఇది శుక్ర, గురు గ్రహాల అనుగ్రహాన్ని ఇస్తుంది.", ta: "சுக்கிரன் மற்றும் குருவின் அனுகூலத்தை தரும்." },
        duration: { kn: "೧.೫ ನಿಮಿಷ", en: "1.5 Minutes", hi: "१.५ मिनट", te: "1.5 నిమిషాలు", ta: "1.5 நிமிடங்கள்" }
      },
      {
        stepNumber: 3,
        icon: "✨",
        name: { kn: "೩. ಕಂಕಣ ಬಲ ಸಂಕಲ್ಪ ಧಾರಣೆ", en: "3. Kankana Bala Sankalpa Meditation", hi: "३. कंकण बल संकल्प ध्यान", te: "3. కళ్యాణ సంకల్ప ధ్యానం", ta: "3. மங்கல சங்கல்ப தியானம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಯೋಗ್ಯ ಸುಸಂಸ್ಕೃತ ಜೀವನ ಸಂಗಾತಿಯ ಆಗಮನವನ್ನು ಕೃತಜ್ಞತೆಯಿಂದ ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ.", en: "Mentally visualize the blossoming of an auspicious, joyful, and dharmic life partnership.", hi: "सुयोग्य जीवनसाथी के आगमन की मंगलमय भावना मन में रखें।", te: "సద్గుణవంతుడైన జీవిత భాగస్వామిని సంకల్పించండి.", ta: "நல்ல வாழ்க்கை துணை அமைய தியானிக்கவும்." },
        detail: { kn: "ಸಕಾರಾತ್ಮಕ ಸಂಕಲ್ಪವು ಕಂಕಣ ಬಲದ ಸೂಕ್ಷ್ಮ ತರಂಗಗಳನ್ನು ಆಕರ್ಷಿಸಲು ಅತ್ಯಂತ ಪ್ರಭಾವಶಾಲಿ.", en: "Replaces subconscious despair with auspicious magnetic resonance.", hi: "सकारात्मक भाव वैवाहिक योग को प्रबल करता है।", te: "ఇది వివాహ యోగాన్ని బలపరుస్తుంది.", ta: "இது திருமண யோகத்தை விரைவுபடுத்தும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಬೀಜ ಜಪ", en: "4. Swayamvara Parvati Beeja Japa", hi: "४. स्वयंवर पार्वती बीज जप", te: "4. స్వయంవర పార్వతీ జపం", ta: "4. சுயம்வர பார்வதி மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.", en: "Silently recite the Swayamvara Parvati marriage blessing mantra 11 times.", hi: "मन ही मन स्वयंवर पार्वती मंत्र का ११ बार जप करें।", te: "మనస్సులో స్వయంవర పార్వతీ మంత్రాన్ని 11 సార్లు జపించండి.", ta: "மனதில் சுயம்வர பார்வதி மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಜಗನ್ಮಾತೆ ಪಾರ್ವತಿ ಮತ್ತು ಮಹಾದೇವನ ಕೃಪೆಯಿಂದ ಸಕಲ ವಿವಾಹ ದೋಷಗಳು, ಕುಜ ದೋಷದ ಅಡೆತಡೆಗಳು ಶಮನವಾಗುತ್ತವೆ.", en: "Invokes the divine matrimonial grace of Shiva and Parvati to dissolve planetary obstacles.", hi: "मां पार्वती की कृपा से शीघ्र विवाह का मार्ग प्रशस्त होता है।", te: "పార్వతీ పరమేశ్వరుల కృపతో వివాహ ఆటంకాలు తొలగుతాయి.", ta: "சிவபார்வதி அருளால் திருமண தடைகள் நீங்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషಂ", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ ह्रीं योगिनि योगिनि योगेश्वरि योग भयङ्करि सकल स्थावर जङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥",
      kannada: "॥ ಓಂ ಹ್ರೀಂ ಯೋಗಿನಿ ಯೋಗಿನಿ ಯೋಗೇಶ್ವರಿ ಯೋಗ ಭಯಂಕರಿ ಸಕಲ ಸ್ಥಾವರ ಜಂಗಮಸ್ಯ ಮುಖ ಹೃದಯಂ ಮಮ ವಶಂ ಆಕರ್ಷಯ ಆಕರ್ಷಯ ನಮಃ ॥",
      telugu: "॥ ఓం హ్రీం యోగిని యోగిని యోగేశ్వరి యోగ భయంకరి సకల స్థావర జంగమస్య ముఖ హృదయం మమ వశం ఆకర్షయ ఆకర్షయ నమః ॥",
      tamil: "॥ ஓம் ஹ்ரீம் யோகினி யோகினி யோகேஸ்வரி யோக பயங்கரி சகல ஸ்தாவர ஜங்கமஸ்ய முக ஹ்ருதயம் மம வசம் ஆகர்ஷய ஆகர்ஷய நமஹ ॥",
      hindi: "॥ ॐ ह्रीं योगिनि योगिनि योगेश्वरि योग भयङ्करि सकल स्थावर जङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥",
      transliteration: "Om Hreem Yogini Yogini Yogeshwari Yoga Bhayankari Sakala Sthavara Jangamasya Mukha Hridayam Mama Vasham Akarshaya Akarshaya Namaha",
      meaning: {
        kn: "ಜಗನ್ಮಾತೆ ಪಾರ್ವತಿಯ ಪರಮಾನುಗ್ರಹದಿಂದ ಸಮಸ್ತ ವಿವಾಹ ತಡೆಗಳು ದೂರವಾಗಿ ಶೀಘ್ರ ಕಂಕಣ ಬಲ ಹಾಗೂ ಸುಖೀ ದಾಂಪತ್ಯ ಸಿದ್ಧಿಸಲಿ.",
        en: "By Divine Mother Parvati's eternal grace, may all matrimonial roadblocks dissolve, blessing you with an auspicious and harmonious life partner.",
        hi: "मां पार्वती की कृपा से समस्त विवाह बाधाएं दूर हों और शीघ्र सुयोग्य जीवनसाथी की प्राप्ति हो।",
        te: "పార్వతీ దేవి కృపతో వివాహ ఆటంకాలు తొలగి శీఘ్ర వివాహ ప్రాప్తి కలుగుగాక.",
        ta: "பார்வதி தேவியின் அருளால் திருமண தடைகள் நீங்கி நல்ல வரன் அமையட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २１ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  } else if (struggleCategory === "debt_financial") {
    protocolTitle = {
      kn: "⚡ ಋಣವಿಮೋಚನ ಅಂಗಾರಕ & ಕನಕಧಾರಾ ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Runa Vimochana & Kanakadhara Financial Protection Protocol",
      hi: "⚡ ऋणविमोचन अंगारक एवं कनकधारा आर्थिक समृद्धि सूत्र",
      te: "⚡ రుణవిమోచన అంగారక & కనకధారా ఆర్థిక రక్షా సూత్రం",
      ta: "⚡ கடன் நிவாரண அங்காரக & கனகதாரா பொருளாதார வளர்ச்சி விதி"
    };
    protocolSubtitle = {
      kn: "ಹಣಕಾಸಿನ ತೀವ್ರ ಒತ್ತಡ, ಸಾಲದ ಬಾಧೆ ಅಥವಾ ವ್ಯಾಪಾರ ನಷ್ಟ ಉಂಟಾದಾಗ ಈ ೪ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಿ:",
      en: "When facing acute financial stress, unexpected loss, or debt anxiety, immediately execute these 4 actions:",
      hi: "आर्थिक संकट, ऋण या व्यवसाय में हानि होने पर तुरंत इन ४ चरणों का पालन करें:",
      te: "ఆర్థిక ఒత్తిడి లేదా అప్పుల బాధ ఉన్నప్పుడు వెంటనే ఈ 4 పద్ధతులను అనుసరించండి:",
      ta: "பொருளாதார நெருக்கடி அல்லது கடன் சுமை ஏற்படும் போது இந்த 4 படிகளை பின்பற்றவும்:"
    };
    stepsList = [
      {
        stepNumber: 1,
        icon: "💧",
        name: { kn: "೧. ಜಲ ತರ್ಪಣ & ಕರ ಪ್ರಕ್ಷಾಲನ", en: "1. Hand Cleansing & Bhoomi Touch", hi: "१. हस्त प्रक्षालन एवं भूमि वंदन", te: "1. చేతులు కడగడం & భూమి స్పర్శ", ta: "1. கை கழுவுதல் & பூமி வந்தனம்" },
        action: { kn: "ಶುದ್ಧ ನೀರಿನಿಂದ ಕೈ ತೊಳೆದುಕೊಂಡು, ಭೂಮಿಯನ್ನು ಸ್ಪರ್ಶಿಸಿ ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಿ.", en: "Wash hands with clean water; touch the ground/floor gently with palms in gratitude to Mother Earth.", hi: "स्वच्छ जल से हाथ धोकर भूमि का स्पर्श कर नमन करें।", te: "చేతులు కడుక్కుని భూమిని తాకి నమస్కరించండి.", ta: "கை கழுவி பூமியை தொட்டு வணங்கவும்." },
        detail: { kn: "ಇದು ಭೂಮಿಯ ಸ್ಥಿರತೆಯನ್ನು ಮೈಗೂಡಿಸಿ ಸಾಲದ ಆತಂಕ ಹಾಗೂ ಆತುರದ ತಪ್ಪು ನಿರ್ಧಾರಗಳನ್ನು ತಡೆಯುತ್ತದೆ.", en: "Grounds panic energy, preventing rash impulsive financial decisions under distress.", hi: "यह मन के घबराहट को शांत कर स्थिरता प्रदान करता है।", te: "ఇది తొందరపాటు నిర్ణయాలను నివారిస్తుంది.", ta: "மன அமைதியை தந்து தவறான முடிவுகளை தடுக்கும்." },
        duration: { kn: "೩೦ ಸೆಕೆಂಡುಗಳು", en: "30 Seconds", hi: "३० सेकंड", te: "30 సెకన్లు", ta: "30 வினாடிகள்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಸೂರ್ಯ ಭೇದನ ಧೈರ್ಯ ಶ್ವಾಸ", en: "2. Surya Bhedana Willpower Breath", hi: "२. सूर्य भेदन प्राण शक्ति श्वास", te: "2. సూర్య భేదన ప్రాణాయామం", ta: "2. சூரிய பேதன பிராணாயாமம்" },
        action: { kn: "ಎಡ ನಾಸಿಕ ಮುಚ್ಚಿ, ಬಲ ನಾಸಿಕದಿಂದ ದೀರ್ಘ ಉಸಿರೆಳೆದು ಎಡದಿಂದ ಬಿಡಿ.", en: "Close left nostril, inhale deeply through right nostril for 4s, exhale left for 6s (Surya Bhedana).", hi: "दाहिने नथुने से श्वास खींचकर बाएं से निकालें।", te: "కుడి నాసిక ద్వారా శ్వాస తీసుకుని ఎడమ వైపు వదలండి.", ta: "வலது நாசி வழியே மூச்சிழுத்து இடது வழியே விடவும்." },
        detail: { kn: "ಆಂತರಿಕ ಧೈರ್ಯ, ಸಂಕಲ್ಪ ಶಕ್ತಿ ಮತ್ತು ಕರ್ಮ ಸಾಮರ್ಥ್ಯವನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ.", en: "Awakens solar resolve and pragmatic problem-solving acumen to tackle debts.", hi: "यह आंतरिक साहस और निर्णय शक्ति को जाग्रत करता है।", te: "ఇది సమస్యలను ఎదుర్కొనే ధైర్యాన్ని ఇస్తుంది.", ta: "இது மனோதிடத்தையும் தைரியத்தையும் தரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషಂ", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 3,
        icon: "🪙",
        name: { kn: "೩. ಕನಕಧಾರಾ ಸಮೃದ್ಧಿ ಧ್ಯಾಸ", en: "3. Kanakadhara Abundance Meditation", hi: "३. कनकधारा समृद्धि ध्यान", te: "3. కనకధారా సమృద్ధి ధ్యానం", ta: "3. கனகதாரா லக்ஷ்மி தியானம்" },
        action: { kn: "ಉತ್ತರಕ್ಕೆ ಮುಖ ಮಾಡಿ ಕುಳಿತು ಮಹಾಲಕ್ಷ್ಮಿಯ ಸುವರ್ಣ ದೃಷ್ಟಿಯನ್ನು ಭಾವಿಸಿ.", en: "Face North (Kubera direction); visualize golden blessings dissolving heavy liabilities.", hi: "उत्तर दिशा की ओर मुख कर मां लक्ष्मी की कृपा दृष्टि का ध्यान करें।", te: "ఉత్తరం వైపు తిరిగి లక్ష్మీ దేవి అనుగ్రహాన్ని ధ్యానించండి.", ta: "வடக்கு நோக்கி அமர்ந்து மகாலட்சுமியை தியானிக்கவும்." },
        detail: { kn: "ಕೊರತೆಯ ಭಯವನ್ನು ನಿವಾರಿಸಿ ಧನ ಸಂಪತ್ತು ಮತ್ತು ನೂತನ ಆದಾಯದ ದಾರಿಗಳನ್ನು ತೆರೆಯುತ್ತದೆ.", en: "Replaces the scarcity panic mindset with structured abundance consciousness.", hi: "यह ऋण के भय को दूर कर नए मार्ग प्रशस्त करता है।", te: "ఆర్థిక భయాన్ని పోగొట్టి కొత్త మార్గాలు చూపిస్తుంది.", ta: "பொருளாதார பயத்தை போக்கும்." },
        duration: { kn: "೨ ನಿಮಿಷಗಳು", en: "2 Minutes", hi: "२ मिनट", te: "2 నిమిషాలు", ta: "2 நிமிடங்கள்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಬೀಜ ಜಪ", en: "4. Runa Vimochana Angaraka Beeja Japa", hi: "೪. ऋणविमोचन अंगारक बीज जप", te: "4. రుణవిమోచన మంత్ర జపం", ta: "4. கடன் நிவாரண மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಋಣಹರ್ತೃ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಸ್ಪಷ್ಟವಾಗಿ ಜಪಿಸಿ.", en: "Silently chant the sacred Runa Vimochana mantra 11 times.", hi: "मन में ऋणविमोचन अंगारक मंत्र का ११ बार जप करें।", te: "రుణవిమోచన మంత్రాన్ని 11 సార్లు జపించండి.", ta: "கடன் நிவாரண மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಭೂಮಿಪುತ್ರ ಕುಜ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಕೃಪೆಯಿಂದ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಹಾಗೂ ಸಾಲದ ಬಾಧೆಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ.", en: "Invokes divine planetary dispensations to break cycles of compounded liabilities.", hi: "भूमिपुत्र मंगल एवं लक्ष्मी कृपा से कर्ज से मुक्ति मिलती है।", te: "అంగారకుడి కృపతో అప్పుల బాధలు తొలగుతాయి.", ta: "அங்காரக பகவான் அருளால் கடன்கள் தீரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషಂ", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ मङ्गलो भूमिपुत्रश्च ऋणहर्ता धनप्रदः । स्थिरासनो महाकायः सर्वकर्मविरोधकः ॥",
      kannada: "॥ ಓಂ ಮಂಗಳೋ ಭೂಮಿಪುತ್ರಶ್ಚ ಋಣಹರ್ತಾ ಧನಪ್ರದಃ । ಸ್ಥಿರಾಸನೋ ಮಹಾಕಾಯಃ ಸರ್ವಕರ್ಮವಿರೋಧಕಃ ॥",
      telugu: "॥ ఓం మంగళో భూమిపుత్రశ్చ రుణహర్తా ధనప్రదః । స్థిరాసనో మహాకాయః సర్వకర్మవిరోధకః ॥",
      tamil: "॥ ஓம் மங்களோ பூமிபுத்ரஸ்ச ருணஹர்தா தனப்ரதஃ । ஸ்திராஸனோ மஹாகாயஃ ஸர்வகர்மவிரோதகஃ ॥",
      hindi: "॥ ॐ मङ्गलो भूमिपुत्रश्च ऋणहर्ता धनप्रदः । स्थिरासनो महाकायः सर्वकर्मविरोधकः ॥",
      transliteration: "Om Mangalo Bhoomiputrashcha Runa Harta Dhanapradaha | Sthirasano Mahakayaha Sarva Karma Virodhakaha",
      meaning: {
        kn: "ಋಣಹರ್ತನಾದ ಭೂಮಿಪುತ್ರ ಕುಜ ಮತ್ತು ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪೆಯಿಂದ ಸಮಸ್ತ ಸಾಲದ ಬಾಧೆಗಳು ಕರಗಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಲಭಿಸಲಿ.",
        en: "May Lord Angaraka the Debt-Destroyer and Goddess Mahalakshmi dissolve financial burdens, bestowing wealth and cash stability.",
        hi: "ऋणहर्ता मंगल देव एवं मां लक्ष्मी की कृपा से समस्त कर्जों का निवारण हो और आर्थिक स्थिरता प्राप्त हो।",
        te: "రుణహర్త అయిన అంగారకుని కృపతో అప్పుల బాధలు తొలగి ఆర్థిక స్థిరత్వం కలుగుగాక.",
        ta: "கடன் தீர்க்கும் அங்காரக பகவானின் அருளால் சகல கடன்களும் நீங்கி ஐஸ்வர்யம் உண்டாகட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २१ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  } else if (struggleCategory === "health_vitality") {
    protocolTitle = {
      kn: "⚡ ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ಪ್ರಾಣಶಕ್ತಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Mahamrityunjaya Sanjeevini Prana Vitality Protocol",
      hi: "⚡ महामृत्युंजय संजीवनी प्राणशक्ति सूत्र",
      te: "⚡ మహామృత్యుంజయ సంజీవని ప్రాణశక్తి సూత్రం",
      ta: "⚡ மகா மிருத்யுஞ்சய சஞ்சீவினி பிராண சக்தி விதி"
    };
    protocolSubtitle = {
      kn: "ದೈಹಿಕ ಅಸ್ವಸ್ಥತೆ, ಆಯಾಸ ಅಥವಾ ಜೀವಭಯ ಉಂಟಾದಾಗ ತಕ್ಷಣ ಈ ೪ ಸಂಜೀವಿನಿ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಿ:",
      en: "Whenever sudden physical fatigue, low vitality, or health anxiety arises, follow these 4 steps:",
      hi: "अस्वस्थता या प्राणशक्ति की कमी महसूस होने पर तुरंत इन ४ चरणों का पालन करें:",
      te: "శారీరక అలసట లేదా అనారోగ్యం కలిగినప్పుడు వెంటనే ఈ 4 సంజీవని పద్ధతులను పాటించండి:",
      ta: "உடல் சோர்வு அல்லது ஆரோக்கிய குறைபாடு ஏற்படும் போது இந்த 4 படிகளை பின்பற்றவும்:"
    };
    stepsList = [
      {
        stepNumber: 1,
        icon: "💧",
        name: { kn: "೧. ಉಷಃಪಾನ & ತುಳಸೀ ಜಲ ಪ್ರೋಕ್ಷಣ", en: "1. Fresh Water Sip & Face Refresh", hi: "१. शीतल जल सेवन एवं मुख मार्जन", te: "1. చల్లని నీరు త్రాగడం & విశ్రాంతి", ta: "1. நீர் அருந்துதல் & புத்துணர்ச்சி" },
        action: { kn: "ಸ್ವಲ್ಪ ಶುದ್ಧ ನೀರನ್ನು ಕುಡಿದು, ತಲೆಯ ಮೇಲೆ ಮತ್ತು ಕಣ್ಣುಗಳ ಮೇಲೆ ನೀರನ್ನು ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿಕೊಳ್ಳಿ.", en: "Sip room-temperature water slowly; splash a few drops over head and eyes.", hi: "धीमे-धीमे जल पिएं और आंखों पर छींटे मारें।", te: "నెమ్మదిగా నీరు త్రాగి కళ్ళు కడుక్కోండి.", ta: "மெதுவாக நீர் அருந்தி கண்களை கழுவவும்." },
        detail: { kn: "ಜಲ ತತ್ತ್ವವು ಆಯುಷ್ಯ ವರ್ಧಕವಾಗಿದ್ದು, ದೇಹದ ತಾಪ ಮತ್ತು ಆಯಾಸವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.", en: "Soothes internal heat and rehydrates depleted cellular vitality.", hi: "यह शरीर के ताप को शांत कर ताजगी देता है।", te: "ఇది శరీర తాపాన్ని తగ్గిస్తుంది.", ta: "இது உடல் சூட்டை தணித்து புத்துணர்ச்சி தரும்." },
        duration: { kn: "೩೦ ಸೆಕೆಂಡುಗಳು", en: "30 Seconds", hi: "३० सेकंड", te: "30 సెకన్లు", ta: "30 வினாடிகள்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಸಂಜೀವಿನಿ ಪ್ರಾಣಾಯಾಮ (ದೀರ್ಘ ಶ್ವಾಸ)", en: "2. Sanjeevini Deep Diaphragmatic Breath", hi: "२. संजीवनी दीर्घ प्राणायाम", te: "2. దీర్ఘ శ్వాస ప్రాణాయామం", ta: "2. சஞ்சீவினி ஆழ்ந்த மூச்சு பயிற்சி" },
        action: { kn: "ಬೆನ್ನು ನೇರವಾಗಿಸಿ ಕುಳಿತು, ೫ ಸೆಕೆಂಡ್ ದೀರ್ಘ ಉಸಿರೆಳೆದು, ೫ ಸೆಕೆಂಡ್ ಬಿಡಿ.", en: "Sit comfortably, inhale life force slowly for 4s, hold gently for 2s, exhale smoothly for 6s.", hi: "रीढ़ सीधी कर बैठें, गहरी श्वास लें और धीरे-धीरे छोड़ें।", te: "వెన్ను నిటారుగా ఉంచి నెమ్మదిగా ఊపిరి పీల్చి వదలండి.", ta: "முதுகை நேராக வைத்து ஆழ்ந்து மூச்சிழுத்து வெளியிடவும்." },
        detail: { kn: "ಪ್ರಾಣವಾಯು ದೇಹದ ಸಮಸ್ತ ನರಮಂಡಲವನ್ನು ಪುನಶ್ಚೇತನಗೊಳಿಸಿ ಆತಂಕವನ್ನು ನಿವಾರಿಸುತ್ತದೆ.", en: "Floods the bloodstream with oxygen, activating immune parasympathetic restoration.", hi: "यह रक्त संचार और रोग प्रतिरोधक क्षमता को बढ़ाता है।", te: "ఇది రోగనిరోధక శక్తిని పెంచుతుంది.", ta: "நோய் எதிர்ப்பு சக்தியை அதிகரிக்கும்." },
        duration: { kn: "೧.೫ ನಿಮಿಷ", en: "1.5 Minutes", hi: "१.५ मिनट", te: "1.5 నిమిషాలు", ta: "1.5 நிமிடங்கள்" }
      },
      {
        stepNumber: 3,
        icon: "🧘",
        name: { kn: "೩. ಅಮೃತ ಶಿವ ಸಂಕಲ್ಪ", en: "3. Amrita Shiva Healing Stillness", hi: "३. अमृत शिव आरोग्य ध्यान", te: "3. అమృత శివ ఆరోగ్య ధ్యానం", ta: "3. அமிர்த சிவ தியானம்" },
        action: { kn: "ದೇಹದ ಪ್ರತಿಯೊಂದು ಅಂಗದಲ್ಲೂ ಅಮೃತಮಯ ದೈವಿಕ ರಕ್ಷಣೆ ಹರಿಯುತ್ತಿರುವುದನ್ನು ಕಲ್ಪಿಸಿಕೊಳ್ಳಿ.", en: "Visualize cool, nectarous healing light enveloping every cell and tissue.", hi: "शरीर में दिव्य आरोग्यदायिनी ऊर्जा का ध्यान करें।", te: "దివ్య ఆరోగ్య కాంతిని భావిస్తూ ధ్యానించండి.", ta: "ஆரோக்கிய ஒளியை உடலில் தியானிக்கவும்." },
        detail: { kn: "ಭಯವು ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಕುಗ್ಗಿಸುತ್ತದೆ; ಮೃತ್ಯುಂಜಯ ಧ್ಯಾನವು ತಕ್ಷಣ ಚೇತರಿಕೆ ನೀಡುತ್ತದೆ.", en: "Clears fear frequencies, triggering intrinsic cellular rejuvenation.", hi: "यह भय को समाप्त कर स्वास्थ्य लाभ कराता है।", te: "భయాన్ని పోగొట్టి ఆరోగ్యాన్ని ఇస్తుంది.", ta: "பயத்தை போக்கி நலம் தரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిಷಂ", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಮಹಾಮೃತ್ಯುಂಜಯ ಅಮೃತ ಬೀಜ ಜಪ", en: "4. Mahamrityunjaya Sanjeevini Japa", hi: "४. महामृत्युंजय अमृत मंत्र जप", te: "4. మహామృత్యుంజయ మంత్ర జపం", ta: "4. மகா மிருத்யுஞ்சய மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ತ್ರ್ಯಂಬಕ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.", en: "Silently recite the supreme Mahamrityunjaya mantra 11 times.", hi: "मन ही मन महामृत्युंजय मंत्र का ११ बार जप करें।", te: "మహామృత్యుంజయ మంత్రాన్ని 11 సార్లు జపించండి.", ta: "மகா மிருத்யுஞ்சய மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಸಕಲ ರೋಗ ಭಯ, ಅಕಾಲಿಕ ಬಾಧೆಗಳು ದೂರವಾಗಿ ಆಯುಷ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.", en: "Invokes Lord Shiva's ultimate restorative grace, shielding against physical and mental afflictions.", hi: "भगवान शिव की कृपा से अकाल कष्ट और रोग दूर होते हैं।", te: "శివుని కృపతో సమస్త రోగాలు నివారించబడతాయి.", ta: "சிவபெருமானின் அருளால் சகல நோய்களும் நீங்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిಷಂ", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥",
      kannada: "॥ ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ । ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥",
      telugu: "॥ ఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనమ్ । ఉర్వారుకమివ బంధనాన్మృత్యోర్ముక్షీయ మామృతాత్ ॥",
      tamil: "॥ ஓம் த்ரயம்பகம் யஜாமஹே ஸுகந்திம் புஷ்டிவர்த்தனம் । உர்வாருகமிவ பந்தனான்மிருத்யோர்முக்ஷீய மாமிருதாத் ॥",
      hindi: "॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥",
      transliteration: "Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam | Urvaarukamiva Bandhanaan Mrityor Muksheeya Maamritaat",
      meaning: {
        kn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾದೇವನ ಕೃಪೆಯಿಂದ ಸಮಸ್ತ ರೋಗಭಯ, ಆಯಾಸ ಮತ್ತು ದೈಹಿಕ ಬಾಧೆಗಳು ದೂರವಾಗಿ ದೀರ್ಘ ಆಯುರಾರೋಗ್ಯ ಸಿದ್ಧಿಸಲಿ.",
        en: "May Lord Mahamrityunjaya grant freedom from ailments and untimely distress, rejuvenating vitality, longevity, and well-being.",
        hi: "भगवान महामृत्युंजय की कृपा से समस्त व्याधियां दूर हों और दीर्घायु एवं पूर्ण आरोग्य की प्राप्ति हो।",
        te: "మహామృత్యుంజయుడైన శివుని కృపతో సమస్త రోగాలు తొలగి సంపూర్ణ ఆయురారోగ్యాలు కలుగుగాక.",
        ta: "மகா மிருத்யுஞ்சய பகவானின் அருளால் சகல பிணிகளும் நீங்கி நீண்ட ஆயுளும் ஆரோக்கியமும் கிடைக்கட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २१ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  } else if (struggleCategory === "mental_anxiety") {
    protocolTitle = {
      kn: "⚡ ಸೋಮ-ಚಂದ್ರ ಮನಃಶಾಂತಿ & ಚಿತ್ತ ವಿಶ್ರಾಂತಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Soma-Chandra Mental Peace & Anxiety Release Protocol",
      hi: "⚡ सोम-चन्द्र मानसिक शांति एवं चित्त विश्रांति सूत्र",
      te: "⚡ సోమ-చంద్ర మానసిక శాంతి & చిత్త విశ్రాంతి సూత్రం",
      ta: "⚡ சோம-சந்திர மன அமைதி மற்றும் அமைதி விதி"
    };
    protocolSubtitle = {
      kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಅತಿಯಾದ ಆತಂಕ, ಅನಗತ್ಯ ಚಿಂತೆ ಅಥವಾ ನಿದ್ರಾಹೀನತೆ ಉಂಟಾದಾಗ ಈ ೪ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಿ:",
      en: "Whenever acute overthinking, panic, or restless anxiety arises, follow these 4 steps:",
      hi: "जब भी मन में अत्यधिक चिंता या घबराहट हो, तुरंत इन ४ चरणों का पालन करें:",
      te: "అధిక ఆందోళన లేదా మానసిక ఒత్తిడి ఉన్నప్పుడు ఈ 4 దశలను పాటించండి:",
      ta: "அதிக மன உளைச்சல் ஏற்படும் போது இந்த 4 படிகளை பின்பற்றவும்:"
    };
    emergencyMantraData = {
      sanskrit: "॥ ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः । ॐ सों सोमाय नमः शान्तये ॥",
      kannada: "॥ ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ । ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ ಶಾಂತಯೇ ॥",
      telugu: "॥ ఓం శ్రాం శ్రీం శ్రౌం సః చంద్రమసే నమః । ఓం సోం సోమాయ నమః శాంతయే ॥",
      tamil: "॥ ஓம் ச்ராம் ச்ரீம் ச்ரௌம் ஸஃ சந்த்ரமஸே நமஹ । ஓம் சோம் சோமாய நமஹ சாந்தயே ॥",
      hindi: "॥ ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः । ॐ सों सोमाय नमः शान्तये ॥",
      transliteration: "Om Shram Shreem Shroum Sah Chandramase Namaha | Om Som Somaya Namaha Shantaye",
      meaning: {
        kn: "ಮನಃಕಾರಕ ಚಂದ್ರನ ಕೃಪೆಯಿಂದ ಸಮಸ್ತ ಆತಂಕ, ಚಿತ್ತಚಾಂಚಲ್ಯ ಮತ್ತು ಭಯಗಳು ದೂರವಾಗಿ ಶಾಂತಿ ನೆಲೆಸಲಿ.",
        en: "May Lord Chandra dissolve anxiety and overthinking, bathing the mind in steady lunar tranquility.",
        hi: "चन्द्रमा की कृपा से समस्त मानसिक अशांति और भय दूर हों।",
        te: "చంద్రుని కృపతో మానసిక ఆందోళన తొలగుగాక.",
        ta: "சந்திரனின் அருளால் மனக்குழப்பம் நீங்கி அமைதி உண்டாகட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २１ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  } else if (struggleCategory === "career_obstacles") {
    protocolTitle = {
      kn: "⚡ ಆದಿತ್ಯ ಹೃದಯ & ಶನಿ ಕರ್ಮಸಿದ್ಧಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Aditya & Saturn Karma Siddhi Career Breakthrough Protocol",
      hi: "⚡ आदित्य हृदय एवं शनि कर्मसिद्धि सूत्र",
      te: "⚡ ఆదిత్య హృదయ & శని కర్మసిద్ధి సూత్రం",
      ta: "⚡ ஆதித்ய ஹிருதய & சனி கர்ம சித்தி விதி"
    };
    protocolSubtitle = {
      kn: "ಉದ್ಯೋಗದಲ್ಲಿ ಅಡೆತಡೆ, ವ್ಯಾಪಾರ ನಿಶ್ಚಲತೆ ಅಥವಾ ಕಠಿಣ ಸಂದರ್ಭಗಳಲ್ಲಿ ಈ ೪ ಕ್ರಮಗಳನ್ನು ಪಾಲಿಸಿ:",
      en: "When facing career stagnation, interview nervousness, or heavy professional obstacles, follow these 4 steps:",
      hi: "नौकरी या कार्यक्षेत्र में बाधाएं आने पर तुरंत इन ४ चरणों का पालन करें:",
      te: "ఉద్యోగంలో ఆటంకాలు ఎదురైనప్పుడు వెంటనే ఈ 4 పద్ధతులను పాటించండి:",
      ta: "தொழில் தடைகள் ஏற்படும் போது உடனடியாக இந்த 4 படிகளை பின்பற்றவும்:"
    };
    emergencyMantraData = {
      sanskrit: "॥ ॐ शं शनैश्चराय नमः । ॐ प्रां प्रीं प्रौं सः शनये नमः ॥",
      kannada: "॥ ಓಂ ಶಂ ಶನೈಶ್ಚರಾಯ ನಮಃ । ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನಯೇ ನಮಃ ॥",
      telugu: "॥ ఓం శం శనైశ్చరాయ నమః । ಓಂ ప్రాం ప్రీಂ ಪ್ರೌಂ ಸಃ ಶನಯೇ ನಮಃ ॥",
      tamil: "॥ ஓம் சம் சனைச்சராய நமஹ । ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ சனயே நமஹ ॥",
      hindi: "॥ ॐ शं शनैश्चराय नमः । ॐ प्रां प्रीं प्रौं सः शनये नमः ॥",
      transliteration: "Om Sham Shanaishcharaya Namaha | Om Pram Preem Proum Sah Shanaye Namaha",
      meaning: {
        kn: "ಕರ್ಮಫಲದಾತ ಶನಿ ಮಹಾತ್ಮನ ಕೃಪೆಯಿಂದ ಕಾರ್ಯಗಳ ಅಡೆತಡೆಗಳು, ವಿಳಂಬ ಹಾಗೂ ಮಾನಸಿಕ ಆಯಾಸ ನಿವಾರಣೆಯಾಗಲಿ.",
        en: "May Lord Saturn remove persistent roadblocks, bless disciplined endurance, and transmute heavy karma into steady mastery.",
        hi: "कर्मफलदाता शनि देव के आशीर्वाद से कार्यों की रुकावटें और विलंब दूर हों।",
        te: "శని దేవుని కృపతో ఆటంకాలు తొలగి కార్యసిద్ధి కలుగుగాక.",
        ta: "சனி பகவானின் அருளால் தடைகள் நீங்கி காரியம் கைகூடட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २१ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
    };
  }

  const instantCalmingProtocol = {
    title: protocolTitle,
    subtitle: protocolSubtitle,
    steps: stepsList,
    emergencyBeejaMantra: emergencyMantraData
  };

  // 6. Panchanga 5-Angas Dynamic Derivation
  const moonNakIndex = moon?.nakshatra.index ?? 0;
  const nakshatraData = NAKSHATRA_REMEDY_DATA[moonNakIndex] || NAKSHATRA_REMEDY_DATA[0];
  const moonPada = kundli.moonPada ?? 1;

  const diffDeg = (moonDegree - sunDegree + 360) % 360;
  const tithiIndexRaw = Math.floor(diffDeg / 12);
  const paksha: "Shukla" | "Krishna" = tithiIndexRaw < 15 ? "Shukla" : "Krishna";
  const tithiNum = (tithiIndexRaw % 15) + 1;
  const tithiData = TITHI_REMEDY_DATA[tithiNum] || TITHI_REMEDY_DATA[1];

  const birthDateObj = new Date((input.birthDate || "1995-08-15") + "T12:00:00Z");
  const dayOfWeek = isNaN(birthDateObj.getTime()) ? 2 : birthDateObj.getUTCDay();
  const varaData = VARA_REMEDY_DATA[dayOfWeek] || VARA_REMEDY_DATA[2];

  const yogaDeg = (sunDegree + moonDegree) % 360;
  const yogaIndex = Math.floor(yogaDeg / (360 / 27));
  const yogaRule = YOGA_RULES[yogaIndex] || YOGA_RULES[0];

  const karanaIndexRaw = Math.floor(diffDeg / 6);
  let karanaKey = "Bava";
  if (karanaIndexRaw === 0) {
    karanaKey = "Kintughna";
  } else if (karanaIndexRaw >= 57) {
    const sthiraKaranas = ["Shakuni", "Chatushpada", "Naga"];
    karanaKey = sthiraKaranas[karanaIndexRaw - 57] || "Shakuni";
  } else {
    const charaKaranas = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
    karanaKey = charaKaranas[(karanaIndexRaw - 1) % 7];
  }
  const karanaRule = KARANA_RULES[karanaKey] || KARANA_RULES["Bava"];

  const panchangaRemedies: PanchangaRemedies = {
    nakshatraRemedy: {
      nakshatraName: nakshatraData.name,
      pada: moonPada,
      rulingDeity: nakshatraData.deity,
      sacredTree: nakshatraData.tree,
      beejaMantra: nakshatraData.beejaMantra,
      aradhana: nakshatraData.aradhana
    },
    tithiRemedy: {
      tithiName: tithiData.name,
      paksha,
      rulingDeity: tithiData.deity,
      vrataAndRemedy: tithiData.vrataAndRemedy
    },
    varaRemedy: {
      dayName: varaData.dayName,
      rulingGraha: varaData.graha,
      dailyColor: varaData.color,
      dailySadhana: varaData.sadhana
    },
    yogaRemedy: {
      yogaName: { kn: yogaRule.sanskrit, en: yogaRule.english, hi: yogaRule.sanskrit, te: yogaRule.english, ta: yogaRule.english },
      isAuspicious: yogaRule.isAuspicious,
      deity: yogaRule.deity,
      shantiPractice: {
        kn: yogaRule.remedy || (yogaRule.isAuspicious ? "ಶುಭ ಯೋಗ: ನಿತ್ಯ ದೇವತಾರ್ಚನೆ ಮತ್ತು ಗಾಯತ್ರೀ ಜಪದಿಂದ ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ." : "ಅಶುಭ ಯೋಗ: ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸಿ."),
        en: yogaRule.remedy || (yogaRule.isAuspicious ? "Auspicious Yoga: Daily prayer and Gayatri japa amplify success." : "Inauspicious Yoga: Chant Shiva Panchakshari or Mrityunjaya mantra."),
        hi: yogaRule.remedy || "नित्य गायत्री जप एवं शिव आराधना करें।",
        te: yogaRule.remedy || "నిత్య గాయత్రీ జపం మరియు శివారాధన.",
        ta: yogaRule.remedy || "தினசரி காயத்ரி ஜபம் மற்றும் சிவ வழிபாடு."
      }
    },
    karanaRemedy: {
      karanaName: { kn: karanaRule.nameKn, en: karanaRule.nameEn, hi: karanaRule.nameEn, te: karanaRule.nameEn, ta: karanaRule.nameEn },
      tatva: karanaRule.tatva,
      deity: karanaRule.rulingDeity,
      karyaShanti: {
        kn: karanaRule.remedy || `${karanaRule.rulingDeity} ದೇವರ ಆರಾಧನೆ, ಕರ್ಮಸಿದ್ಧಿಗೆ ಶುಭಾರಂಭದ ಮುನ್ನ ಪ್ರಾರ್ಥನೆ.`,
        en: karanaRule.remedy || `Worship ${karanaRule.rulingDeity}; invoke prior to commencing major transactions.`,
        hi: karanaRule.remedy || `${karanaRule.rulingDeity} की पूजा करें।`,
        te: karanaRule.remedy || `${karanaRule.rulingDeity} పూజ.`,
        ta: karanaRule.remedy || `${karanaRule.rulingDeity} வழிபாடு.`
      }
    }
  };

  // 7. Planetary Strength Remedies: Exalted & Debilitated Planets
  const debilitationMap: Record<PlanetName, { sign: string; lord: PlanetName; remedyKn: string; remedyEn: string; cautionKn: string; cautionEn: string }> = {
    [PlanetName.Sun]: { sign: "Libra", lord: PlanetName.Venus, remedyKn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ, ಮಾಣಿಕ್ಯ ರತ್ನ ಧಾರಣೆ ಪರೀಕ್ಷೆ ಹಾಗೂ ತಂದೆಯ ಸೇವೆ.", remedyEn: "Surya Gayatri japa, Father's blessing, and Sunday Aditya Hrudaya.", cautionKn: "ತುಲಾ ಸೂರ್ಯನಿಗೆ ಮಾಣಿಕ್ಯ ಧರಿಸುವ ಮುನ್ನ ಲಗ್ನ ಶುಭತ್ವ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.", cautionEn: "Verify functional beneficence before Ruby." },
    [PlanetName.Moon]: { sign: "Scorpio", lord: PlanetName.Mars, remedyKn: "ಚಂದ್ರಶೇಖರಾಷ್ಟಕ ಪಠಣ, ಸೋಮವಾರ ಶಿವನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಧ್ಯಾನ.", remedyEn: "Chandrashekhara Ashtakam, Monday Shiva milk abhisheka, and pranayama.", cautionKn: "ವೃಶ್ಚಿಕ ಚಂದ್ರನಿದ್ದಾಗ ಮುತ್ತು ಧರಿಸಿದರೆ ಮಾನಸಿಕ ಆತಂಕ ಹೆಚ್ಚಾಗಬಹುದು.", cautionEn: "Avoid Pearl for debilitated Moon unless cancelled." },
    [PlanetName.Mars]: { sign: "Cancer", lord: PlanetName.Moon, remedyKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ಮಂಗಳವಾರ ತೊಗರಿಬೇಳೆ ದಾನ ಹಾಗೂ ಭೂಮಿ ವಂದನೆ.", remedyEn: "Subrahmanya worship, Tuesday toor dal charity, and honoring mother Earth.", cautionKn: "ಕಟಕ ಕುಜನಿಗೆ ಹವಳ ಧರಿಸುವುದರಿಂದ ರಕ್ತದೊತ್ತಡ ಏರುಪೇರಾಗಬಹುದು, ಎಚ್ಚರ.", cautionEn: "Red Coral for debilitated Mars requires careful scrutiny." },
    [PlanetName.Mercury]: { sign: "Pisces", lord: PlanetName.Jupiter, remedyKn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ.", remedyEn: "Vishnu Sahasranama chanting, Tulasi seva, and donating books to needy scholars.", cautionKn: "ಮೀನ ಬುಧನಿಗೆ ಪಚ್ಚೆ ರತ್ನ ಧರಿಸುವ ಮುನ್ನ ನೀಚಭಂಗ ಪರೀಕ್ಷಿಸುವುದು ಅತ್ಯಗತ್ಯ.", cautionEn: "Verify Neecha Bhanga before wearing Emerald for debilitated Mercury." },
    [PlanetName.Jupiter]: { sign: "Capricorn", lord: PlanetName.Saturn, remedyKn: "ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ, ಗುರುವಾರ ಕಡಲೆಬೇಳೆ ದಾನ ಹಾಗೂ ಶಿಕ್ಷಕರಿಗೆ ವಂದನೆ.", remedyEn: "Guru Dakshinamurthy worship, chana dal charity on Thursdays, and honoring teachers.", cautionKn: "ಮಕರ ಗುರುವಿನ ದುಸ್ಥಾನ ಸ್ಥಿತಿಯಲ್ಲಿ ಪುಷ್ಪರಾಗ ರತ್ನ ಧರಿಸುವುದು ಸೂಕ್ತವಲ್ಲ.", cautionEn: "Yellow Sapphire requires caution if debilitated Jupiter lacks Kendra cancellation." },
    [PlanetName.Venus]: { sign: "Virgo", lord: PlanetName.Mercury, remedyKn: "ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ, ಬಿಳಿ ಹೂವುಗಳಿಂದ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಹಾಗೂ ಸ್ತ್ರೀಯರಿಗೆ ಗೌರವ.", remedyEn: "Kanakadhara Stotra recitation, white flower Lakshmi puja, and respecting women.", cautionKn: "ಕನ್ಯಾ ಶುಕ್ರನಿದ್ದಾಗ ವಜ್ರ ಧಾರಣೆಗಿಂತ ಗೋಸೇವೆ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಉಪಾಸನೆ ಶ್ರೇಷ್ಠ.", cautionEn: "Prioritize Goseva and Lakshmi sadhana over Diamond when Venus is in Virgo." },
    [PlanetName.Saturn]: { sign: "Aries", lord: PlanetName.Mars, remedyKn: "ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ, ಅಶ್ವತ್ಥ ವೃಕ್ಷಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಾಗೂ ಕಾಗೆಗಳಿಗೆ ಅನ್ನ.", remedyEn: "Dasharatha Shani Stotra, Peepal circumambulation, sesame oil lamp, and feeding crows.", cautionKn: "ಮೇಷ ಶನಿಯಿದ್ದಾಗ ನೀಲಂ (ಇಂದ್ರನೀಲ) ರತ್ನ ಧರಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧ.", cautionEn: "Blue Sapphire (Neelam) is prohibited for debilitated Saturn in Aries." },
    [PlanetName.Rahu]: { sign: "Scorpio", lord: PlanetName.Mars, remedyKn: "ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಠಣ, ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗರಾಜ ಪೂಜೆ ಹಾಗೂ ಶ್ವಾನಗಳಿಗೆ ಆಹಾರ.", remedyEn: "Durga Saptashati recitation, Nagaraja puja at Gokarna, and feeding stray dogs.", cautionKn: "ಗೋಮೇಧಿಕ ರತ್ನ ಧರಿಸಬಾರದು.", cautionEn: "Avoid Hessonite (Gomed) when Rahu is debilitated." },
    [PlanetName.Ketu]: { sign: "Taurus", lord: PlanetName.Venus, remedyKn: "ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ ಹಾಗೂ ಬಡವರಿಗೆ ಕಂಬಳಿ ದಾನ.", remedyEn: "Ganesha Atharvashirsha chanting and blanket donation to the destitute.", cautionKn: "ವೈಢೂರ್ಯ ರತ್ನ ಧಾರಣೆ ಬೇಡ.", cautionEn: "Avoid Cat's Eye during debilitated Ketu." }
  };

  const exaltationMap: Record<PlanetName, { sign: string; activationKn: string; activationEn: string; blessingKn: string; blessingEn: string }> = {
    [PlanetName.Sun]: { sign: "Aries", activationKn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ ಹಾಗೂ ಧಾರ್ಮಿಕ ನಾಯಕತ್ವ ಸಾಧನೆ.", activationEn: "Surya Gayatri japa and righteous leadership.", blessingKn: "ಆರೋಗ್ಯ, ತೇಜಸ್ಸು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.", blessingEn: "Vibrant health, royal authority, and high social prestige." },
    [PlanetName.Moon]: { sign: "Taurus", activationKn: "ಚಂದ್ರ ಗಾಯತ್ರಿ, ಕಲಾಸೇವೆ ಹಾಗೂ ತಾಯಿಯ ಆರಾಧನೆ.", activationEn: "Chandra Gayatri, artistic pursuits, and maternal reverence.", blessingKn: "ಅಖಂಡ ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಸೌಂದರ್ಯ ಹಾಗೂ ಸಂಪತ್ತು.", blessingEn: "Deep emotional peace, charisma, and uninterrupted prosperity." },
    [PlanetName.Mars]: { sign: "Capricorn", activationKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ದೈಹಿಕ ವ್ಯಾಯಾಮ ಹಾಗೂ ಧರ್ಮರಕ್ಷಣೆ.", activationEn: "Subrahmanya worship, disciplined physical stamina, and protective courage.", blessingKn: "ಅಪಾರ ಸಾಹಸ, ಭೂಮಿ ಲಾಭ ಹಾಗೂ ಶತ್ರು ಜಯ.", blessingEn: "Unshakable courage, real estate gains, and triumph over adversaries." },
    [PlanetName.Mercury]: { sign: "Virgo", activationKn: "ಬುಧ ಬೀಜ ಮಂತ್ರ, ಗ್ರಂಥ ರಚನೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿವೇಕ.", activationEn: "Budha Beeja Mantra, analytical research, and ethical commerce.", blessingKn: "ಚುರುಕಾದ ಬುದ್ಧಿ, ಅದ್ಭುತ ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯವಹಾರ ಯಶಸ್ಸು.", blessingEn: "Genius intellect, eloquent speech, and commercial triumph." },
    [PlanetName.Jupiter]: { sign: "Cancer", activationKn: "ಬೃಹಸ್ಪತಿ ಜಪ, ವೇದಾಧ್ಯಯನ ಹಾಗೂ ಸತ್ಪಾತ್ರ ದಾನ.", activationEn: "Brihaspati japa, spiritual scriptural study, and satvic charity.", blessingKn: "ದೈವಾನುಗ್ರಹ, ಸಂತಾನ ಸುಖ, ಜ್ಞಾನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಕೀರ್ತಿ.", blessingEn: "Divine grace, noble progeny, profound wisdom, and guru status." },
    [PlanetName.Venus]: { sign: "Pisces", activationKn: "ಶುಕ್ರ ಗಾಯತ್ರಿ, ಸಂಗೀತ-ಕಲೆ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಭಕ್ತಿ.", activationEn: "Shukra Gayatri, classical music/arts, and Lakshmi devotion.", blessingKn: "ದಾಂಪತ್ಯ ಸುಖ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ವೈಭವೋಪೇತ ಜೀವನ.", blessingEn: "Marital bliss, luxury conveyance, and boundless artistic refinement." },
    [PlanetName.Saturn]: { sign: "Libra", activationKn: "ಶನಿ ಶಾಂತಿ, ಅಶ್ವತ್ಥ ಪ್ರದಕ್ಷಿಣೆ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ಸೇವೆ.", activationEn: "Shani Shanti, Peepal circumambulation, and selfless public service.", blessingKn: "ದೀರ್ಘಾಯುಷ್ಯ, ನ್ಯಾಯಪರತೆ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಜನಬಲ.", blessingEn: "Longevity, unswerving justice, enduring assets, and mass leadership." },
    [PlanetName.Rahu]: { sign: "Taurus", activationKn: "ದುರ್ಗಾ ಪೂಜೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ.", activationEn: "Durga puja and Navagraha Shanti.", blessingKn: "ಅನಿರೀಕ್ಷಿತ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆ ಹಾಗೂ ವಿದೇಶ ಯಾನ.", blessingEn: "Sudden breakthroughs, foreign expansion, and research acumen." },
    [PlanetName.Ketu]: { sign: "Scorpio", activationKn: "ಗಣಪತಿ ಹೋಮ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಧ್ಯಾನ.", activationEn: "Ganapati Homa and deep meditative contemplation.", blessingKn: "ಆಧ್ಯಾತ್ಮಿಕ ಮೋಕ್ಷ, ಅಂತರ್ದೃಷ್ಟಿ ಹಾಗೂ ಋಷಿ ಜ್ಞಾನ.", blessingEn: "Moksha orientation, heightened intuition, and occult discernment." }
  };

  const debilitatedPlanets = [];
  const exaltedPlanets = [];

  for (const p of planets) {
    const rashiEng = p.rashi.english;
    const debInfo = debilitationMap[p.name];
    if (debInfo && rashiEng === debInfo.sign) {
      const dispositor = planets.find(dp => dp.name === debInfo.lord);
      const lagnaIndex = kundli.lagnaRashi?.index ?? 0;
      const moonIdx = moon?.rashi.index ?? 0;
      const dispHouseFromLagna = dispositor ? ((dispositor.rashi.index - lagnaIndex + 12) % 12) + 1 : 1;
      const dispHouseFromMoon = dispositor ? ((dispositor.rashi.index - moonIdx + 12) % 12) + 1 : 1;
      const hasNeechaBhanga = [1, 4, 7, 10].includes(dispHouseFromLagna) || [1, 4, 7, 10].includes(dispHouseFromMoon);

      debilitatedPlanets.push({
        graha: p.name,
        grahaName: GRAHA_NAMES_LOCALE[p.name],
        debilitationSign: RASHI_NAMES_LOCALE[debInfo.sign] || { kn: debInfo.sign, en: debInfo.sign },
        hasNeechaBhanga,
        neechaBhangaReason: hasNeechaBhanga ? {
          kn: `ಈ ಗ್ರಹದ ರಾಶ್ಯಾಧಿಪತಿಯಾದ ${GRAHA_NAMES_LOCALE[debInfo.lord]?.kn || debInfo.lord} ಕೇಂದ್ರ ಸ್ಥಾನದಲ್ಲಿದ್ದು ನೀಚಭಂಗ ರಾಜಯೋಗ (NBRY) ಉಂಟಾಗಿದೆ. ಆರಂಭಿಕ ಹೋರಾಟದ ನಂತರ ದೃಢವಾದ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.`,
          en: `Dispositor ${GRAHA_NAMES_LOCALE[debInfo.lord]?.en || debInfo.lord} is stationed in Kendra, forming Neecha Bhanga Raja Yoga (NBRY). Initial struggle transforms into long-term resilience and victory.`,
          hi: `राश्याधिपति केंद्र में होने से नीचभंग राजयोग का निर्माण हो रहा है।`,
          te: `నీచభంగ రాజయోగం ఏర్పడుతోంది.`,
          ta: `நீச்சபங்க ராஜயோகம் உண்டாகிறது.`
        } : undefined,
        shantiRemedy: { kn: debInfo.remedyKn, en: debInfo.remedyEn, hi: debInfo.remedyKn, te: debInfo.remedyEn, ta: debInfo.remedyEn },
        gemstoneCaution: { kn: debInfo.cautionKn, en: debInfo.cautionEn, hi: debInfo.cautionKn, te: debInfo.cautionEn, ta: debInfo.cautionEn }
      });
    }

    const exInfo = exaltationMap[p.name];
    if (exInfo && rashiEng === exInfo.sign) {
      exaltedPlanets.push({
        graha: p.name,
        grahaName: GRAHA_NAMES_LOCALE[p.name],
        exaltationSign: RASHI_NAMES_LOCALE[exInfo.sign] || { kn: exInfo.sign, en: exInfo.sign },
        activationRemedy: { kn: exInfo.activationKn, en: exInfo.activationEn, hi: exInfo.activationKn, te: exInfo.activationEn, ta: exInfo.activationEn },
        blessingArea: { kn: exInfo.blessingKn, en: exInfo.blessingEn, hi: exInfo.blessingKn, te: exInfo.blessingEn, ta: exInfo.blessingEn }
      });
    }
  }

  const planetaryStrengthRemedies: PlanetaryStrengthRemedies = {
    debilitatedPlanets,
    exaltedPlanets,
    influencerBenchmarkComparison: {
      title: {
        kn: "ಆಧುನಿಕ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಭಾವಿಗಳು (Influencers) vs ಶಾಸ್ತ್ರೋಕ್ತ ದೈವಿಕ ಪರಿಹಾರ ತುಲನೆ",
        en: "Modern Astrology Influencer Practices vs Classical Vedic Remedies Benchmark",
        hi: "आधुनिक ज्योतिष इन्फ्लुएंसर बनाम शास्त्रीय वैदिक उपाय तुलना",
        te: "ఆధునిక జ్యోతిష్య ఇన్ఫ్లుయెన్సర్ల పోలిక మరియు శాస్త్రీయ పరిష్కారాలు",
        ta: "நவீன ஜோதிட தாக்கங்கள் vs சாஸ்திரோக்த பரிகார ஒப்பீடு"
      },
      insights: {
        kn: "ಸಾಮಾಜಿಕ ಜಾಲತಾಣಗಳಲ್ಲಿ ಅನೇಕ ಪ್ರಸಿದ್ಧ ವ್ಯಕ್ತಿಗಳು ಹಾಗೂ ಇನ್‌ಫ್ಲುಯೆನ್ಸರ್‌ಗಳು ರತ್ನಧಾರಣೆ (ಉದಾ: ಬುಧನಿಗೆ ಪಚ್ಚೆ, ಶನಿಗೆ ನೀಲಂ, ಚಂದ್ರನಿಗೆ ಮುತ್ತು) ಅಥವಾ ರುದ್ರಾಕ್ಷಿ ಧರಿಸಿದ ನಂತರ ತಮ್ಮ ಜೀವನದಲ್ಲಿ ಗಮನಾರ್ಹ ಪ್ರಗತಿ ಕಂಡಿರುವುದನ್ನು ಹಂಚಿಕೊಳ್ಳುತ್ತಾರೆ. ಆದರೆ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಕೇವಲ ಉಂಗುರ ಅಥವಾ ರತ್ನ ಧರಿಸುವುದರಿಂದ ಮಾತ್ರ ಪವಾಡ ನಡೆಯುವುದಿಲ್ಲ.",
        en: "Many online influencers and public figures attribute major career turnarounds to specific gemstones (Emerald for communication, Blue Sapphire for disciplined breakthroughs, Pearl for mental composure) or energized Rudraksha beads. However, authentic Parashari Jyotisha emphasizes that gemstones act strictly as pranic prisms—they only produce breakthroughs when paired with righteous moral conduct and daily spiritual sadhana.",
        hi: "सोशल मीडिया पर कई हस्तियां पन्ना, नीलम या रुद्राक्ष धारण करने के बाद जीवन में चमत्कारी बदलाव का दावा करती हैं। शास्त्रानुसार रत्न केवल ऊर्जा के संवाहक हैं; वास्तविक सुधार सदाचार, नित्य साधना और ग्रह शांति से ही संभव है।",
        te: "ఆన్‌లైన్ ఇన్‌ఫ్లుయెన్సర్లు ఉంగరాలు, రత్నాల ద్వారా మార్పులను ప్రస్తావిస్తారు. అయితే నిజమైన అభివృద్ధి నిత్య సాధన మరియు శాస్త్రీయ పూజల ద్వారానే కలుగుతుంది.",
        ta: "சமூக வலைத்தளங்களில் ரத்தினங்கள் மற்றும் ருத்ராட்சம் அணிவதால் முன்னேற்றம் ஏற்பட்டதாக பலர் கூறுகின்றனர். ஆனால் சாஸ்திரப்படி தர்ம நெறியும் இறை வழிபாடும் இணையும் போதே முழு பலன் கிடைக்கும்."
      },
      authenticApproach: {
        kn: "ಶಾಸ್ತ್ರೋಕ್ತ ಮಾರ್ಗ: ದುಸ್ಥಾನಾಧಿಪತಿಗಳ (೬, ೮, ೧೨) ರತ್ನಗಳನ್ನು ಎಂದಿಗೂ ಧರಿಸಬಾರದು. ನಿಮ್ಮ ಲಗ್ನಾಧಿಪತಿ, ಜನ್ಮ ನಕ್ಷತ್ರ ವೃಕ್ಷ ಪೂಜೆ, ವಾರದ ಸಾಧನೆ, ದಶಾ-ಭುಕ್ತಿ ಶಾಂತಿ ಹಾಗೂ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ನವಗ್ರಹ ಸೇವೆಗಳೇ ಶಾಶ್ವತ ಪರಿಹಾರವನ್ನು ನೀಡುತ್ತವೆ.",
        en: "Authentic Vedic Path: Never wear gemstones of functional malefics or dusthana lords (6, 8, 12). Permanent transformation requires honoring your Janma Nakshatra Tree, practicing your daily Vara sadhana, pacifying Dasha lords, and participating in sacred Gokarna Mahabaleshwara sevas.",
        hi: "प्रामाणिक मार्ग: अशुभ या त्रिक भावों के रत्नों से बचें। जन्म नक्षत्र वृक्ष की सेवा, नित्य साधना और गोकर्ण महाबलेश्वर की पूजा ही स्थायी कल्याण करती है।",
        te: "ప్రామాణిక విధానం: నక్షత్ర వృక్ష పూజ మరియు గోకర్ణ మహాబలేశ్వర స్వామి సేవల ద్వారా శాశ్వత ఫలితం లభిస్తుంది.",
        ta: "சாஸ்திரோக்த வழி: நட்சத்திர மர வழிபாடு மற்றும் கோகர்ண மகாபலேஸ்வரர் பூஜையே நிலையான நன்மையை தரும்."
      }
    }
  };

  // 8. Daily Pacification Routine
  const dailyPacificationRoutine = {
    morning: [
      {
        time: "06:00 AM - 06:45 AM",
        icon: "🌅",
        title: { kn: "ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ನಮಸ್ಕಾರ & ಗಾಯತ್ರೀ ಜಪ", en: "Surya Arghya & Gayatri Japa", hi: "प्रातः सूर्य अर्घ्य एवं गायत्री जप", te: "సూర్య నమస్కారాలు & గాయత్రీ జపం", ta: "சூரிய நமஸ்காரம் & காயத்ரி ஜபம்" },
        desc: {
          kn: "ಸ್ನಾನದ ನಂತರ ತಾಮ್ರದ ಚೊಂಬಿನಿಂದ ಉದಯಿಸುವ ಸೂರ್ಯನಿಗೆ ಶುದ್ಧ ನೀರನ್ನು ಅರ್ಪಿಸಿ. ೧೧ ಬಾರಿ ಗಾಯತ್ರೀ ಮಂತ್ರ ಜಪಿಸಿ.",
          en: "Offer water in a copper vessel to rising Sun facing East; silently recite 11 Gayatri mantras.",
          hi: "स्नान के बाद तांबे के लोटे से सूर्य को जल अर्पित करें और ११ बार गायत्री मंत्र जपें।",
          te: "స్నానం అనంతరం రాగి పాత్రతో సూర్యునికి అర్ఘ్యం ఇవ్వండి.",
          ta: "குளித்த பின் செம்பு பாத்திரத்தில் சூரியனுக்கு நீர் அர்ப்பணிக்கவும்."
        }
      },
      {
        time: "07:00 AM",
        icon: "🧘",
        title: { kn: "ನಾಡಿ ಶೋಧನ & ಪ್ರಾಣಾಯಾಮ", en: "Nadi Shodhana Pranayama", hi: "नाड़ी शोधन प्राणायाम", te: "నాడీ శోధన ప్రాణాయామం", ta: "நாடி சுத்தி பிராணாயாமம்" },
        desc: {
          kn: "೫ ರಿಂದ ೧೦ ನಿಮಿಷಗಳ ಕಾಲ ಎಡ-ಬಲ ಹೊಳ್ಳೆಗಳಿಂದ ಸಮತೋಲಿತ ಉಸಿರಾಟ ನಡೆಸಿ. ಮನಸ್ಸಿನ ತೀವ್ರತೆ ಮತ್ತು ಆವೇಶ ನಿಯಂತ್ರಣಕ್ಕೆ ಬರುತ್ತದೆ.",
          en: "5 to 10 minutes of alternate nostril breathing to equilibrate autonomic nervous system.",
          hi: "५ से १० मिनट तक नाड़ी शोधन प्राणायाम करें।",
          te: "5-10 నిమిషాలు నాడీ శోధన చేయండి.",
          ta: "5-10 நிமிடங்கள் நாடி சுத்தி செய்யவும்."
        }
      }
    ],
    afternoonLifestyle: [
      {
        icon: "🥗",
        title: { kn: "ಪಿತ್ತ ಶಮನ ಸಾತ್ವಿಕ ಆಹಾರ ಪಾಲನೆ", en: "Pitta-Soothing Sattvic Diet", hi: "पित्त शामक सात्विक आहार", te: "సాత్విక ఆహార నియమం", ta: "பித்த சாந்தி உணவு" },
        desc: {
          kn: "ಅತಿಯಾದ ಖಾರ, ಹುಳಿ ಹಾಗೂ ಎಣ್ಣೆಯುಕ್ತ ಪದಾರ್ಥಗಳನ್ನು ತ್ಯಜಿಸಿ. ಮಧ್ಯಾಹ್ನ ಊಟದೊಂದಿಗೆ ಜೀರಿಗೆ ಮತ್ತು ಕೊತ್ತಂಬರಿ ಬೆರೆಸಿದ ತಂಪಾದ ಮಜ್ಜಿಗೆ ಸೇವಿಸಿ.",
          en: "Minimize pungent chilies, excessive spices, and heated fried snacks; consume buttermilk with cumin after lunch.",
          hi: "अत्यधिक मिर्च-मसाले से बचें; दोपहर भोजन में जीरा युक्त छाछ लें।",
          te: "అధిక కారం, పులుపు వస్తువులను తగ్గించండి. మధ్యాహ్నం మజ్జిగ త్రాగండి.",
          ta: "அதிக காரம், புளிப்பு உணவுகளை தவிர்க்கவும். மோர் பருகவும்."
        }
      },
      {
        icon: "🧭",
        title: { kn: "ದಿಕ್ಪಾಲಕ ಸ್ಥಿತಿ ಹಾಗೂ ವಿವೇಕ", en: "Compassionate Seating Alignment", hi: "दिशा संरेखण", te: "దిశా నియమం", ta: "திசை அமைப்பு" },
        desc: {
          kn: "ಕೆಲಸ ಮಾಡುವಾಗ ಅಥವಾ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವಾಗ ದಕ್ಷಿಣ ದಿಕ್ಕಿಗೆ ಮುಖ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ, ಯಾವಾಗಲೂ ಉತ್ತರ ಅಥವಾ ಪೂರ್ವಕ್ಕೆ ಮುಖ ಮಾಡಿ.",
          en: "Face North or East while working and making crucial decisions; avoid facing direct South during intense discussions.",
          hi: "महत्वपूर्ण कार्य करते समय मुख उत्तर अथवा पूर्व दिशा में रखें।",
          te: "పనిచేసేటప్పుడు ఉత్తరం లేదా తూర్పు వైపు ముఖం పెట్టండి.",
          ta: "வேலை செய்யும் போது வடக்கு அல்லது கிழக்கு நோக்கி அமரவும்."
        }
      }
    ],
    evening: [
      {
        time: "06:30 PM - 07:30 PM",
        icon: "🪔",
        title: { kn: "ಸಂಧ್ಯಾ ದೀಪಾರಾಧನೆ & ಸ್ತೋತ್ರ ಪಠಣ", en: "Evening Deepa & Designated Stotra", hi: "संध्या दीप प्रज्वलन एवं स्तोत्र पाठ", te: "సంధ్యా దీపారాధన & స్తోత్ర పఠనం", ta: "மாலை தீபாராதனை & ஸ்தோத்திரம்" },
        desc: {
          kn: `ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಶುದ್ಧ ಎಳ್ಳೆಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ, ಜನ್ಮ ಕುಂಡಲಿಗೆ ನಿಗದಿತ ಸ್ತೋತ್ರವನ್ನು ಶಾಂತಚಿತ್ತದಿಂದ ಪಠಿಸಿ (${varaData.color.kn} ಉಡುಗೆ ಶ್ರೇಷ್ಠ).`,
          en: `Light a sesame oil or cow ghee lamp at twilight; sit facing North and recite the designated personalized Stotra (wearing ${varaData.color.en}).`,
          hi: "संध्या समय तिल के तेल अथवा घी का दीपक जलाकर निर्धारित स्तोत्र का पाठ करें।",
          te: "నువ్వుల నూనె లేదా నెయ్యి దీపం వెలిగించి స్తోత్రం చదవండి.",
          ta: "நல்லெண்ணெய் அல்லது நெய் தீபம் ஏற்றி ஸ்தோத்திரம் படிக்கவும்."
        }
      },
      {
        time: "09:30 PM",
        icon: "🌙",
        title: { kn: "ರಾತ್ರಿ ಶಾಂತಿ ಧ್ಯಾನ & ಶಯನ ನಿಯಮ", en: "Night Peace Meditation & Sleep Alignment", hi: "रात्रि शांति ध्यान एवं शयन नियम", te: "రాత్రి శాంతి ధ్యానం", ta: "இரவு சாந்தி தியானம்" },
        desc: {
          kn: "ಮಲಗುವ ಮುನ್ನ ೫ ನಿಮಿಷ ಕೈ-ಕಾಲು ತೊಳೆದು, ಪೂರ್ವ ಅಥವಾ ದಕ್ಷಿಣಕ್ಕೆ ತಲೆ ಇಟ್ಟು ಮಲಗಿ. ಮಲಗುವಾಗ ಮೊಬೈಲ್ ನೋಡದೆ ಇಷ್ಟದೇವತಾ ನಾಮ ಸ್ಮರಿಸಿ.",
          en: "Wash feet with cool water; align head towards East or South during sleep; meditate on Ishta Devata before slumber.",
          hi: "सोने से पूर्व हाथ-पैर धोकर पूर्व या दक्षिण दिशा में सिर रखकर सोएं।",
          te: "పడుకునే ముందు కాళ్ళు కడుక్కుని తూర్పు వైపు తలపెట్టి నిద్రించండి.",
          ta: "தூங்குவதற்கு முன் கிழக்கு நோக்கி தலை வைத்து படுக்கவும்."
        }
      }
    ]
  };

  // 9. Curate Classical Stotras dynamically matching chart challenge
  const personalizedStotras = [];
  if (struggleCategory === "student_academic") {
    const s = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "medha_dakshinamurthy");
    if (s) personalizedStotras.push(s);
  } else if (struggleCategory === "marriage_delay") {
    const s = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "swayamvara_parvati");
    if (s) personalizedStotras.push(s);
  } else if (struggleCategory === "debt_financial") {
    const s = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "runa_vimochana_angāraka");
    if (s) personalizedStotras.push(s);
  } else if (struggleCategory === "anger_temper") {
    const s1 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "chandrashekhara_ashtakam");
    if (s1) personalizedStotras.push(s1);
    const s2 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "subrahmanya_bhujangam");
    if (s2) personalizedStotras.push(s2);
  } else if (struggleCategory === "mental_anxiety") {
    const s1 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "durga_saptashati_aparadha_kshamapana");
    if (s1) personalizedStotras.push(s1);
    const s2 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "chandrashekhara_ashtakam");
    if (s2) personalizedStotras.push(s2);
  } else if (struggleCategory === "career_obstacles") {
    const s1 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "hanuman_sankata_mochana");
    if (s1) personalizedStotras.push(s1);
    const s2 = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "aditya_hrudayam");
    if (s2) personalizedStotras.push(s2);
  }

  for (const fallbackId of ["aditya_hrudayam", "hanuman_sankata_mochana", "vishnu_sahasranama_dhyana", "kanakadhara_stotra"]) {
    if (personalizedStotras.length >= 3) break;
    const item = CLASSICAL_STOTRAS_CATALOG.find(s => s.id === fallbackId);
    if (item && !personalizedStotras.some(p => p.id === item.id)) {
      personalizedStotras.push(item);
    }
  }

  // 10. Active Dasha-Bhukti Analysis & Mitigation (100% Dynamic Parashari Calculation)
  const dashaInfo = findBhuktiAtAge(kundli, ageNow);
  const mahaDashaPlanet = dashaInfo?.maha?.planet ?? (dashaTiming?.currentMaha as PlanetName) ?? PlanetName.Jupiter;
  const bhuktiPlanet = dashaInfo?.bhukti ?? (dashaTiming?.currentBhukti as PlanetName) ?? PlanetName.Jupiter;

  const mahaDescByGraha: Record<PlanetName, { kn: string; en: string }> = {
    [PlanetName.Jupiter]: {
      kn: "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಮಹಾದಶೆಯು ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ವಿಕಾಸ, ಗೌರವ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ನೀಡುವ ಮಹಾಯೋಗದ ಕಾಲವಾಗಿದೆ.",
      en: "Jupiter Mahadasha unfolds wisdom, spiritual clarity, family grace, and long-term socio-financial stability."
    },
    [PlanetName.Saturn]: {
      kn: "ಕರ್ಮಫಲದಾತ ಶನಿ ಮಹಾತ್ಮನ ಮಹಾದಶೆಯು ಪರಿಶ್ರಮ, ಶಿಸ್ತು, ಕರ್ಮ ಪರಿಶುದ್ಧತೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸಾಧನೆಗೆ ಅಡಿಪಾಯ ಹಾಕುವ ಮಹತ್ವದ ಕಾಲವಾಗಿದೆ.",
      en: "Saturn Mahadasha demands disciplined focus, endurance, and ethical precision, transmuting heavy karma into lasting mastery."
    },
    [PlanetName.Mercury]: {
      kn: "ಬುದ್ಧಿಕಾರಕ ಬುಧ ಮಹಾದಶೆಯು ವ್ಯಾಪಾರ, ಸಂವಹನ, ತಾರ್ಕಿಕ ಚಿಂತನೆ ಹಾಗೂ ನೂತನ ಕೌಶಲಗಳ ವಿಕಾಸಕ್ಕೆ ಅತ್ಯಂತ ಅನುಕೂಲಕರವಾದ ಅವಧಿಯಾಗಿದೆ.",
      en: "Mercury Mahadasha accelerates intellect, commercial growth, persuasive communication, and analytical breakthroughs."
    },
    [PlanetName.Venus]: {
      kn: "ಕಲಾಕಾರಕ ಶುಕ್ರ ಮಹಾದಶೆಯು ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಸುಖ, ಕಲಾತ್ಮಕ ಸೃಷ್ಟಿ ಹಾಗೂ ಭೋಗ-ಭಾಗ್ಯಗಳನ್ನು ಅನುಗ್ರಹಿಸುವ ಶುಭ ಕಾಲವಾಗಿದೆ.",
      en: "Venus Mahadasha showers aesthetic resonance, relationship fulfillment, creative luxury, and material prosperity."
    },
    [PlanetName.Sun]: {
      kn: "ಆತ್ಮಕಾರಕ ಸೂರ್ಯ ಮಹಾದಶೆಯು ತೇಜಸ್ಸು, ನಾಯಕತ್ವ, ಗೌರವ ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಉತ್ತುಂಗಕ್ಕೇರಿಸುವ ಅವಧಿಯಾಗಿದೆ.",
      en: "Sun Mahadasha illuminates soul vitality, public authority, governance recognition, and fearless self-expression."
    },
    [PlanetName.Moon]: {
      kn: "ಮನಃಕಾರಕ ಚಂದ್ರ ಮಹಾದಶೆಯು ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ, ಭಾವನಾತ್ಮಕ ಸಮೃದ್ಧಿ ಹಾಗೂ ಕಲ್ಪನಾ ಶಕ್ತಿಯನ್ನು ಉದ್ದೀಪಿಸುವ ಸಮಯವಾಗಿದೆ.",
      en: "Moon Mahadasha stimulates emotional depth, maternal blessings, public popularity, and creative imagination."
    },
    [PlanetName.Mars]: {
      kn: "ಪರಾಕ್ರಮಕಾರಕ ಮಂಗಳ ಮಹಾದಶೆಯು ಧೈರ್ಯ, ಭೂಮಿ ಲಾಭ, ಕ್ರೀಡೆ ಹಾಗೂ ತಾಂತ್ರಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ದಿಟ್ಟ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡುವ ಕಾಲವಾಗಿದೆ.",
      en: "Mars Mahadasha unleashes physical valor, technical acumen, land property gains, and competitive dominance."
    },
    [PlanetName.Rahu]: {
      kn: "ಛಾಯಾಗ್ರಹ ರಾಹು ಮಹಾದಶೆಯು ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು, ಜಾಗತಿಕ ವಿಸ್ತರಣೆ, ಡಿಜಿಟಲ್ ಖ್ಯಾತಿ ಹಾಗೂ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯನ್ನು ಜಾಗೃತಗೊಳಿಸುವ ಕಾಲವಾಗಿದೆ.",
      en: "Rahu Mahadasha creates unconventional breakthroughs, digital innovation, foreign connections, and exponential worldly ambition."
    },
    [PlanetName.Ketu]: {
      kn: "ಮೋಕ್ಷಕಾರಕ ಕೇತು ಮಹಾದಶೆಯು ಆಂತರಿಕ ಜ್ಞಾನ, ಆಧ್ಯಾತ್ಮಿಕ ಅನ್ವೇಷಣೆ ಹಾಗೂ ಅನಗತ್ಯ ವ್ಯಾಮೋಹಗಳಿಂದ ಮುಕ್ತಿ ನೀಡುವ ತಪಸ್ಸು ಕಾಲವಾಗಿದೆ.",
      en: "Ketu Mahadasha prompts deep introspection, spiritual detachment, intuitive mastery, and inner liberation."
    }
  };

  const mahaDesc = mahaDescByGraha[mahaDashaPlanet] || mahaDescByGraha[PlanetName.Jupiter];

  const dashaBhuktiAnalysis = {
    currentMahaDasha: mahaDashaPlanet,
    currentBhukti: bhuktiPlanet,
    mahaDashaLabel: GRAHA_NAMES_LOCALE[mahaDashaPlanet] || { kn: mahaDashaPlanet, en: mahaDashaPlanet },
    bhuktiLabel: GRAHA_NAMES_LOCALE[bhuktiPlanet] || { kn: bhuktiPlanet, en: bhuktiPlanet },
    periodEffect: {
      kn: `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.kn || mahaDashaPlanet} ಮಹಾದಶೆಯಲ್ಲಿ ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.kn || bhuktiPlanet} ಭುಕ್ತಿಯು ನಡೆಯುತ್ತಿದೆ. ${mahaDesc.kn} ${turnaroundTimelineKn} ನಿರ್ಣಾಯಕ ಫಲಗಳು ವ್ಯಕ್ತವಾಗಲಿವೆ.`,
      en: `You are actively running the ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.en || mahaDashaPlanet} Mahadasha with ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.en || bhuktiPlanet} Bhukti. ${mahaDesc.en} Significant breakthroughs unfold ${turnaroundTimelineEn}.`,
      hi: `वर्तमान में आप ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.hi || mahaDashaPlanet} महादशा में ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.hi || bhuktiPlanet} भुक्ति से गुजर रहे हैं।`,
      te: `ప్రస్తుతం ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.te || mahaDashaPlanet} మహాదశలో ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.te || bhuktiPlanet} భుక్తి నడుస్తోంది.`,
      ta: `தற்போது ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.ta || mahaDashaPlanet} மகாதிசையில் ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.ta || bhuktiPlanet} புக்தி நடைபெறுகிறது.`
    },
    remedialAction: {
      kn: `ಈ ದಶಾ ಸಂಚಾರವನ್ನು ಶುಭಕರವಾಗಿಸಲು ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.kn || mahaDashaPlanet} ಹಾಗೂ ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.kn || bhuktiPlanet} ದೇವತೆಗಳಿಗೆ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ${turnaroundSevaKn} ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಫಲದಾಯಕ.`,
      en: `To align this Dasha-Bhukti flow, offer dedicated prayers to ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.en || mahaDashaPlanet} and participate in ${turnaroundSevaEn}.`,
      hi: `इस दशा-भुक्ति के शुभ फल हेतु संबंधित ग्रहों की शांति एवं गोकर्ण महाबलेश्वर में पूजा कराएं।`,
      te: `ఈ దశ అనుకూలత కొరకు గోకర్ణంలో పూజ జరిపించండి.`,
      ta: `இந்த திசை நன்மை பெற கோகர்ணத்தில் வழிபாடு செய்யவும்.`
    }
  };

  // 11. Gochara (Transit) Real-Time Calculation for all planets
  let todaysSaturnDeg = 325;
  let todaysJupiterDeg = 45;
  let todaysRahuDeg = 330;
  let todaysKetuDeg = 150;
  try {
    const s = siderealLongitudes(new Date(), "lahiri", "mean");
    todaysSaturnDeg = s.saturn ?? 325;
    todaysJupiterDeg = s.jupiter ?? 45;
    todaysRahuDeg = s.rahu ?? 330;
    todaysKetuDeg = s.ketu ?? 150;
  } catch {
    todaysSaturnDeg = 325;
    todaysJupiterDeg = 45;
    todaysRahuDeg = 330;
    todaysKetuDeg = 150;
  }

  const moonRashiIndex = moon?.rashi.index ?? 0;
  const transitSaturnRashi = degreeToRashi(todaysSaturnDeg);
  const transitJupiterRashi = degreeToRashi(todaysJupiterDeg);
  const transitRahuRashi = degreeToRashi(todaysRahuDeg);

  const saturnDiff = (transitSaturnRashi.index - moonRashiIndex + 12) % 12;
  const isSadeSati = saturnDiff === 11 || saturnDiff === 0 || saturnDiff === 1;
  const isAshtamaShani = saturnDiff === 7;
  const isKantakaShani = saturnDiff === 3 || saturnDiff === 6 || saturnDiff === 9;

  let sadeSatiText: Record<string, string>;
  if (isSadeSati) {
    sadeSatiText = {
      kn: "⚠️ ಶನಿ ಸಾಡೇಸಾತಿ (ಏಳೂವರೆ ವರ್ಷದ ಶನಿ ಪ್ರಭಾವ) ಸಕ್ರಿಯವಾಗಿದೆ - ತಾಳ್ಮೆ, ಶಾಂತಿ ಮತ್ತು ಹನುಮಾನ್ ಜಪ ಅತ್ಯಗತ್ಯ.",
      en: "⚠️ Active Sade Sati Phase (7.5 Year Saturn Cycle) - Demands calm speech, discipline, and Hanuman devotion.",
      hi: "⚠️ साढ़ेसाती प्रभाव सक्रिय है - धैर्य और हनुमान उपासना आवश्यक है।",
      te: "⚠️ ఏలినాటి శని ప్రభావం ఉంది - ఓపిక మరియు హనుమాన్ పూజ అవసరం.",
      ta: "⚠️ ஏழரை நாட்டு சனி நடப்பில் உள்ளது - பொறுமையும் வழிபாடும் அவசியம்."
    };
  } else if (isAshtamaShani) {
    sadeSatiText = {
      kn: "⚠️ ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ ಸಕ್ರಿಯವಾಗಿದೆ - ವಾಹನ ಚಾಲನೆ, ವಾದ-ವಿವಾದ ಹಾಗೂ ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      en: "⚠️ Active Ashtama Shani (8th House Saturn Transit) - Caution in road travel, temperament, and finances.",
      hi: "⚠️ अष्टम शनि प्रभाव सक्रिय है - वाद-विवाद एवं यात्रा में सावधानी बरतें।",
      te: "⚠️ అష్టమ శని ప్రభావం - జాగ్రత్త అవసరం.",
      ta: "⚠️ அஷ்டம சனி தாக்கம் - எச்சரிக்கை தேவை."
    };
  } else if (isKantakaShani) {
    sadeSatiText = {
      kn: "ℹ️ ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ - ಉದ್ಯೋಗ ಮತ್ತು ಕೌಟುಂಬಿಕ ವಿಷಯಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಇರಲಿ.",
      en: "ℹ️ Active Kantaka Shani Transit - Practice professional patience and avoid hasty career shifts.",
      hi: "ℹ️ कंटक शनि प्रभाव - कार्यक्षेत्र में धैर्य बनाए रखें।",
      te: "ℹ️ కంటక శని ప్రభావం - ఉద్యోగంలో ఓపిక అవసరం.",
      ta: "ℹ️ கண்டக சனி தாக்கம் - பொறுமை தேவை."
    };
  } else {
    sadeSatiText = {
      kn: "✅ ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯ ಯಾವುದೇ ಪ್ರಮುಖ ಅಶುಭ ಪ್ರಭಾವವಿಲ್ಲ (ಅನುಕೂಲಕರ ಸ್ಥಿತಿ).",
      en: "✅ No major difficult Saturn Sade Sati transit active at present (Favorable Saturn flow).",
      hi: "✅ वर्तमान में शनि का कोई अशुभ गोचर नहीं है।",
      te: "✅ శని అనుకూలంగా ఉన్నాడు.",
      ta: "✅ சனி பகவானின் பாதகமான தாக்கம் தற்போது இல்லை."
    };
  }

  const rahuDiff = (transitRahuRashi.index - moonRashiIndex + 12) % 12;

  const gocharaTransitAnalysis = {
    transitHighlights: [
      {
        graha: PlanetName.Saturn,
        transitSign: RASHI_NAMES_LOCALE[transitSaturnRashi.english]?.en || transitSaturnRashi.english,
        houseFromMoon: saturnDiff + 1,
        effect: isSadeSati || isAshtamaShani ? ("Challenging" as const) : ("Benefic" as const),
        title: {
          kn: `ಗೋಚಾರ ಶನಿ (${RASHI_NAMES_LOCALE[transitSaturnRashi.english]?.kn || transitSaturnRashi.english} ರಾಶಿ)`,
          en: `Transit Saturn in ${transitSaturnRashi.english} (${saturnDiff + 1}th from Moon)`,
          hi: `गोचर शनि (${transitSaturnRashi.english})`,
          te: `గోచార శని (${transitSaturnRashi.english})`,
          ta: `கோசார சனி (${transitSaturnRashi.english})`
        },
        description: {
          kn: `ಶನಿ ಮಹಾತ್ಮನು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ${saturnDiff + 1} ನೇ ಮನೆಯಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದಾನೆ. ಇದು ಪರಿಶ್ರಮ ಮತ್ತು ಸಹನೆಯ ಪರೀಕ್ಷಾ ಕಾಲ.`,
          en: `Saturn transits the ${saturnDiff + 1}th house from your natal Moon, structuring long-term discipline and karmic maturity.`,
          hi: `शनि आपकी जन्म राशि से ${saturnDiff + 1}वें भाव में गोचर कर रहे हैं।`,
          te: `శని మీ చంద్ర రాశి నుండి ${saturnDiff + 1}వ ఇంట్లో సంచరిస్తున్నాడు.`,
          ta: `சனி உங்கள் ராசியிலிருந்து ${saturnDiff + 1}ம் இடத்தில் சஞ்சரிக்கிறார்.`
        },
        remedy: {
          kn: "ಶನಿವಾರ ಸಂಜೆ ಅಶ್ವತ್ಥ ವೃಕ್ಷದ ಬುಡದಲ್ಲಿ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಅಥವಾ ಶನಿ ಶಾಂತಿ ಮಾಡಿ.",
          en: "Light sesame oil lamp under Peepal tree on Saturdays; chant Shani Gayatri.",
          hi: "शनिवार को पीपल के वृक्ष के पास तिल के तेल का दीपक जलाएं।",
          te: "శనివారం నువ్వుల నూనెతో దీపం వెలిగించండి.",
          ta: "சனிக்கிழமை நல்லெண்ணெய் தீபம் ஏற்றி வழிபடவும்."
        }
      },
      {
        graha: PlanetName.Jupiter,
        transitSign: RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.en || transitJupiterRashi.english,
        houseFromMoon: ((transitJupiterRashi.index - moonRashiIndex + 12) % 12) + 1,
        effect: "Benefic" as const,
        title: {
          kn: `ಗೋಚಾರ ಗುರು ಬಲ (${RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.kn || transitJupiterRashi.english} ರಾಶಿ)`,
          en: `Transit Jupiter in ${transitJupiterRashi.english}`,
          hi: `गोचर गुरु बल (${transitJupiterRashi.english})`,
          te: `గోచార గురు బలం`,
          ta: `கோசார குரு பலம்`
        },
        description: {
          kn: `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಜ್ಞಾನ, ವಿವೇಕ ಮತ್ತು ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಿಗೆ ಸಂಪೂರ್ಣ ರಕ್ಷಣೆ ನೀಡುತ್ತಿದ್ದಾನೆ.`,
          en: `Benefic transit of Brihaspati illuminates wisdom, dissolves mental turmoil, and provides spiritual shielding.`,
          hi: `देवगुरु बृहस्पति का शुभ गोचर आपके विवेक और आध्यात्मिक ऊर्जा को बढ़ा रहा है।`,
          te: `గురు భగవానుడు జ్ఞానాన్ని మరియు రక్షణను ఇస్తున్నాడు.`,
          ta: `குரு பகவான் நற்பலன்களையும் பாதுகாப்பையும் தருகிறார்.`
        },
        remedy: {
          kn: "ಗುರುವಾರ ಹಳದಿ ಬಣ್ಣದ ಹೂವುಗಳಿಂದ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ ಅಥವಾ ಗುರು ವಂದನೆ ಮಾಡಿ.",
          en: "Offer yellow flowers to Guru/Dakshinamurthy on Thursdays; apply chandan tilak.",
          hi: "गुरुवार को पीले पुष्प से भगवान विष्णु अथवा गुरु की पूजा करें।",
          te: "గురువారం పసుపు పూలతో విష్ణు పూజ చేయండి.",
          ta: "வியாழக்கிழமை குரு வழிபாடு செய்யவும்."
        }
      },
      {
        graha: PlanetName.Rahu,
        transitSign: RASHI_NAMES_LOCALE[transitRahuRashi.english]?.en || transitRahuRashi.english,
        houseFromMoon: rahuDiff + 1,
        effect: [1, 7, 8, 12].includes(rahuDiff + 1) ? ("Caution" as const) : ("Benefic" as const),
        title: {
          kn: `ಗೋಚಾರ ರಾಹು (${RASHI_NAMES_LOCALE[transitRahuRashi.english]?.kn || transitRahuRashi.english} ರಾಶಿ)`,
          en: `Transit Rahu in ${transitRahuRashi.english} (${rahuDiff + 1}th from Moon)`,
          hi: `गोचर राहु (${transitRahuRashi.english})`,
          te: `గోచార రాహువు (${transitRahuRashi.english})`,
          ta: `கோசார ராகு (${transitRahuRashi.english})`
        },
        description: {
          kn: `ರಾಹುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${rahuDiff + 1} ನೇ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು ಮತ್ತು ಆಲೋಚನಾ ತೀವ್ರತೆಯನ್ನು ನೀಡುತ್ತಾನೆ.`,
          en: `Rahu transits ${rahuDiff + 1} houses from natal Moon, requiring balanced ambition and regular grounding prayers.`,
          hi: `राहु का गोचर मानसिक चंचलता और अप्रत्याशित बदलाव ला सकता है।`,
          te: `రాహువు గోచారం వలన అప్రమత్తత అవసరం.`,
          ta: `ராகு கோசாரம் மன அமைதியை சோதிக்கலாம்.`
        },
        remedy: {
          kn: "ದುರ್ಗಾ ದೇವಿಗೆ ತುಪ್ಪದ ದೀಪ ಹಚ್ಚಿ ಅಥವಾ ಗೋಕರ್ಣದಲ್ಲಿ ಸರ್ಪ ಶಾಂತಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.",
          en: "Light ghee lamp to Goddess Durga; recite Durga Chalisa.",
          hi: "मां दुर्गा को घी का दीप लगाएं।",
          te: "దుర్గా పూజ చేయండి.",
          ta: "துர்க்கை அம்மனுக்கு தீபம் ஏற்றவும்."
        }
      }
    ],
    sadeSatiStatus: sadeSatiText
  };

  // 12. Sacred Gokarna Mahabaleshwara Temple Remedies & Dāna
  const prescriptions = generateAstrologicalPrescriptions(kundli, yogaRule, karanaRule);

  let prescribedSevaName = {
    kn: turnaroundSevaKn,
    en: turnaroundSevaEn,
    hi: turnaroundSevaEn,
    te: turnaroundSevaEn,
    ta: turnaroundSevaEn
  };
  let sevaSignificance = {
    kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿಸುವ ಈ ದೈವಿಕ ಸಂಕಲ್ಪ ಸೇವೆಯು ನಿಮ್ಮ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಿ, ಶೀಘ್ರ ಯಶಸ್ಸು ಮತ್ತು ಶಾಂತಿ ಕರುಣಿಸುತ್ತದೆ.`,
    en: `Consecrated at Sri Kshetra Gokarna Mahabaleshwara, this targeted seva dissolves focal karmic impediments, invoking sovereign divine protection.`,
    hi: `श्री गोकर्ण महाबलेश्वर सन्निधि में यह पूजा समस्त ग्रह बाधाओं को शांत कर शुभ फल प्रदान करती है।`,
    te: `శ్రీ గోకర్ణ క్షేత్రంలో ఈ పూజ వలన సర్వ దోషాలు తొలగి శుభాలు కలుగుతాయి.`,
    ta: `ஸ்ரீ கோகர்ண க்ஷேத்திரத்தில் செய்யப்படும் இந்த விசேஷ பூஜை சகல தோஷங்களையும் நீக்கும்.`
  };
  let sevaIdealDay = {
    kn: "ಸೋಮವಾರ, ಪ್ರದೋಷ ಅಥವಾ ಶುಭ ತಿಥಿ",
    en: "Monday, Pradosha, or Auspicious Tithi",
    hi: "सोमवार अथवा प्रदोष काल",
    te: "సోమవారం లేదా ప్రదోష వేళ",
    ta: "திங்கட்கிழமை அல்லது பிரதோஷம்"
  };

  let donationItem = {
    kn: "ಹಾಲು, ಸಕ್ಕರೆ, ಅಕ್ಕಿ ಅಥವಾ ಬೆಳ್ಳಿ ನಾಣ್ಯ",
    en: "Milk, raw rice, sugar candy, or silver coin",
    hi: "दूध, चावल, मिश्री अथवा चांदी",
    te: "పాలు, బియ్యం, పటికబెల్లం",
    ta: "பால், பச்சரிசி அல்லது வெள்ளி"
  };
  let donationDay = { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கட்கிழமை" };
  let donationBeneficiary = {
    kn: "ಗೋಶಾಲೆ (ಆಕಳುಗಳಿಗೆ ಮೇವು/ಹಾಲು) ಅಥವಾ ಬಡ ಭಕ್ತರಿಗೆ",
    en: "Goshala (feed cows) or elderly devotees in need",
    hi: "गौशाला में गायों को चारा अथवा जरूरतमंदों को",
    te: "గోశాలలో ఆవులకు లేదా పేదలకు",
    ta: "கோசாலையில் பசுக்களுக்கு அல்லது ஏழைகளுக்கு"
  };

  if (struggleCategory === "student_academic") {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ಸರಸ್ವತೀ ವಿದ್ಯಾಪೂಜೆ",
      en: "Gokarna Medha Dakshinamoorthi & Saraswati Vidya Pooja",
      hi: "गोकर्ण मेधा दक्षिणामूर्ति एवं सरस्वती विद्या पूजा",
      te: "ಗೋಕರ್ಣ ಮೇಧಾ దక్షిణామూర్తి విద్యా పూజ",
      ta: "கோகர்ண மேதா தட்சிணாமூர்த்தி வித்யா பூஜை"
    };
    sevaSignificance = {
      kn: "ಏಕಾಗ್ರತೆ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಪರೀಕ್ಷಾ ಯಶಸ್ಸಿಗಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಲ್ಲಿಸುವ ವಿಶೇಷ ಸಾರಸ್ವತ ಸೇವೆ.",
      en: "Enhances deep memory retention, intellectual brilliance, and academic triumph at Gokarna Kshetra.",
      hi: "एकाग्रता, तीक्ष्ण स्मरणशक्ति एवं परीक्षा में सफलता हेतु दक्षिणामूर्ति एवं सरस्वती पूजा।",
      te: "జ్ఞానార్జన, ఏకాగ్రత మరియు పరీక్షల్లో విజయం కోసం ప్రత్యేక పూజ.",
      ta: "நினைவாற்றல் மற்றும் கல்வி வெற்றிக்காக செய்யப்படும் சிறப்பு பூஜை."
    };
    sevaIdealDay = { kn: "ಬುಧವಾರ ಅಥವಾ ಗುರುವಾರ", en: "Wednesday or Thursday", hi: "बुधवार अथवा गुरुवार", te: "బుధవారం లేదా గురువారం", ta: "புதன்கிழமை அல்லது வியாழக்கிழமை" };
    donationItem = { kn: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕಗಳು, ಲೇಖನಿ ಅಥವಾ ಹಸಿರು ಹೆಸರುಕಾಳು", en: "Educational books, pens, or green gram (moong dal) to needy students", hi: "जरूरतमंद छात्रों को पुस्तकें, पेन अथवा मूंग दाल", te: "పుస్తకాలు, పెన్నులు లేదా పెసలు దానం", ta: "மாணவர்களுக்கு புத்தகங்கள், பேனா அல்லது பாசிப்பயறு தானம்" };
    donationDay = { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்கிழமை" };
    donationBeneficiary = { kn: "ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅಥವಾ ಶಾಲಾ ಗ್ರಂಥಾಲಯಕ್ಕೆ", en: "Needy school students or library", hi: "निर्धन छात्रों अथवा विद्यालय को", te: "పేద విద్యార్థులకు లేదా పాఠశాలకు", ta: "ஏழை மாணவர்களுக்கு" };
  } else if (struggleCategory === "marriage_delay") {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಸ್ವಯಂವರ ಪಾರ್ವತಿ & ಕಲ್ಯಾಣೋತ್ಸವ ಸೇವೆ",
      en: "Gokarna Swayamvara Parvati & Kalyana Mahotsava Seva",
      hi: "गोकर्ण स्वयंवर पार्वती एवं कल्याणोत्सव सेवा",
      te: "ಗೋಕರ್ಣ స్వయంవర పార్వతి & కళ్యాణోత్సవ సేవ",
      ta: "கோகர்ண சுயம்வர பார்வதி & கல்யாண உற்சவ சேவை"
    };
    sevaSignificance = {
      kn: "ವಿವಾಹ ತಡೆ, ಕಂಕಣ ಬಲದ ಕೊರತೆ ಮತ್ತು ಶುಕ್ರ-ಗುರು ದೋಷಗಳನ್ನು ಪರಿಹರಿಸಿ ಅನುರೂಪ ದಾಂಪತ್ಯ ಜೀವನ ಕರುಣಿಸುವ ಪವಿತ್ರ ಸೇವೆ.",
      en: "Dissolves marriage delays and Kuja/Guru doshas, invoking matrimonial bliss at Gokarna Kshetra.",
      hi: "शीघ्र विवाह एवं सुयोग्य जीवनसाथी की प्राप्ति हेतु स्वयंवर पार्वती पूजा।",
      te: "శీఘ్ర వివాహ సిద్ధి మరియు దాంపత్య సుఖం కొరకు కళ్యాణోత్సవం.",
      ta: "விரைவில் திருமணம் கைகூட மற்றும் தோஷங்கள் நீங்க விசேஷ பூஜை."
    };
    sevaIdealDay = { kn: "ಶುಕ್ರವಾರ ಅಥವಾ ಸೋಮವಾರ", en: "Friday or Monday", hi: "शुक्रवार अथवा सोमवार", te: "శుక్రవారం లేదా సోమవారం", ta: "வெள்ளிக்கிழமை அல்லது திங்கட்கிழமை" };
    donationItem = { kn: "ಅರಿಶಿನ, ಕುಂಕುಮ, ಹಳದಿ ಸೀರೆ ಅಥವಾ ಕಲ್ಯಾಣ ದ್ರವ್ಯ", en: "Haldi-kumkum, yellow silk, or auspicious bridal offerings", hi: "हल्दी, कुमकुम, पीले वस्त्र अथवा सुहाग सामग्री", te: "పసుపు, కుంకుమ, పసుపు రంగు వస్త్రాలు", ta: "மஞ்சள், குங்குமம் அல்லது மங்கல பொருட்கள்" };
    donationDay = { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளிக்கிழமை" };
    donationBeneficiary = { kn: "ಮುತ್ತೈದೆಯರಿಗೆ (ಸುಮಂಗಲಿಯರಿಗೆ) ಅಥವಾ ಬಡ ಕನ್ಯೆಯ ವಿವಾಹಕ್ಕೆ", en: "Married Sumangalis or impoverished bride wedding", hi: "सुहागिन महिलाओं अथवा निर्धन कन्या के विवाह में", te: "సుమంగళి స్త్రీలకు లేదా పేద కన్య వివాహానికి", ta: "சுமங்கலிகளுக்கு அல்லது ஏழை பெண் திருமணத்திற்கு" };
  } else if (struggleCategory === "debt_financial") {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಋಣವಿಮೋಚನ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಭಿಷೇಕ",
      en: "Gokarna Runa Vimochana Mahabaleshwara Abhisheka",
      hi: "गोकर्ण ऋणविमोचन महाबलेश्वर अभिषेक",
      te: "గోకర్ణ రుణవిమోచన మహాబలేశ్వర అభిషేకం",
      ta: "கோகர்ண கடன் நிவாரண மகாபலேஸ்வரர் அபிஷேகம்"
    };
    sevaSignificance = {
      kn: "ಆರ್ಥಿಕ ಬಿಕ್ಕಟ್ಟು, ವ್ಯಾಪಾರ ನಷ್ಟ ಹಾಗೂ ದೀರ್ಘಕಾಲದ ಸಾಲದ ಬಾಧೆಯನ್ನು ಕರಗಿಸಿ ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ ಒದಗಿಸುವ ವಿಶೇಷ ರುದ್ರಾಭಿಷೇಕ.",
      en: "Dissolves heavy debt burdens, unblocks financial stagnation, and invokes prosperity.",
      hi: "ऋण मुक्ति एवं आर्थिक समृद्धि हेतु गोकर्ण में विशेष रुद्राभिषेक।",
      te: "అప్పుల బాధల నివారణ మరియు ఆర్థిక అభివృద్ధికి విశేష అభిషేకం.",
      ta: "கடன் தொல்லைகள் நீங்கி லட்சுமி கடாட்சம் பெற ருத்ராபிஷேகம்."
    };
    sevaIdealDay = { kn: "ಮಂಗಳವಾರ ಅಥವಾ ಶುಕ್ರವಾರ", en: "Tuesday or Friday", hi: "मंगलवार अथवा शुक्रवार", te: "మంగళవారం లేదా శుక్రవారం", ta: "செவ்வாய் அல்லது வெள்ளிக்கிழமை" };
    donationItem = { kn: "ಗೋಧಿ, ಬೆಲ್ಲ, ತಾಮ್ರದ ನಾಣ್ಯ ಅಥವಾ ಅನ್ನದಾನ ಸೇವೆ", en: "Wheat, pure jaggery, or Annadana meal sponsorship", hi: "गेहूं, गुड़ अथवा मंदिर में अन्नदान", te: "గోధుమలు, బెల్లం లేదా అన్నదానం", ta: "கோதுமை, வெல்லம் அல்லது அன்னதானம்" };
    donationDay = { kn: "ಮಂಗಳವಾರ ಅಥವಾ ಶುಕ್ರವಾರ", en: "Tuesday or Friday", hi: "मंगलवार अथवा शुक्रवार", te: "మంగళవారం లేదా శుక్రవారం", ta: "செவ்வாய் அல்லது வெள்ளிக்கிழமை" };
    donationBeneficiary = { kn: "ಕ್ಷೇತ್ರದ ಅನ್ನದಾಸೋಹಕ್ಕೆ ಅಥವಾ ನಿರ್ಗತಿಕರಿಗೆ", en: "Temple free meal hall (Annadana) or needy families", hi: "मंदिर अन्नक्षेत्र अथवा भूखे निर्धनों को", te: "అన్నదాన సత్రానికి లేదా నిరుపేదలకు", ta: "அன்னதான கூடம் அல்லது ஏழைகளுக்கு" };
  } else if (struggleCategory === "health_vitality") {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಮಹಾಮೃತ್ಯುಂಜಯ ಹೋಮ & ಆಯುಷ್ಯ ಶಾಂತಿ",
      en: "Gokarna Mahamrityunjaya Homa & Ayushya Shanti",
      hi: "गोकर्ण महामृत्युंजय होम एवं आयुष्य शांति",
      te: "గోಕರ್ణ మహామృత్యుంజయ హోమం",
      ta: "கோகர்ண மகா மிருத்யுஞ்சய ஹோமம்"
    };
    sevaSignificance = {
      kn: "ಅಪಮೃತ್ಯು ಭಯ ನಿವಾರಣೆ, ದೀರ್ಘಕಾಲದ ರೋಗ ಶಮನ ಹಾಗೂ ದೈವಿಕ ಆಯುರಾರೋಗ್ಯ ರಕ್ಷಣೆಗೆ ಪರಮ ಶ್ರೇಷ್ಠ ಹೋಮ.",
      en: "Supreme Vedic fire ritual for physical vitality, overcoming chronic ailments, and longevity.",
      hi: "रोगमुक्ति, दीर्घायु एवं आरोग्य लाभ हेतु महामृत्युंजय होम।",
      te: "దీర్ఘాయుష్షు మరియు ఆరోగ్య రక్షణ కొరకు విశేష హోమం.",
      ta: "ஆயுள் விருத்தி மற்றும் நோய் நிவாரணத்திற்கு மகா மிருத்யுஞ்சய ஹோமம்."
    };
    sevaIdealDay = { kn: "ಸೋಮವಾರ ಅಥವಾ ತ್ರಯೋದಶಿ (ಪ್ರದೋಷ)", en: "Monday or Trayodashi (Pradosha)", hi: "सोमवार अथवा प्रदोष", te: "సోమవారం లేదా ప్రదోషం", ta: "திங்கட்கிழமை அல்லது பிரதோஷம்" };
    donationItem = { kn: "ಔಷಧ ದಾನ, ಹಾಲು, ಹಸುವಿನ ತುಪ್ಪ ಅಥವಾ ಗೋಸೇವೆ", en: "Medicines to patients, pure cow ghee, or Gau Seva feed", hi: "औषधि दान, गाय का घी अथवा गोसेवा", te: "మందుల దానం, ఆవు నెయ్యి లేదా గోసేవ", ta: "மருந்து தானம், நெய் அல்லது கோபூஜை" };
    donationDay = { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கட்கிழமை" };
    donationBeneficiary = { kn: "ಆಸ್ಪತ್ರೆಯ ರೋಗಿಗಳಿಗೆ ಅಥವಾ ಗೋಶಾಲೆಗೆ", en: "Hospital patients or Cow Shelter (Gaushala)", hi: "रोगियों अथवा गोशाला में", te: "ఆసుపత్రి రోగులకు లేదా గోశాలకు", ta: "மருத்துவமனை நோயாளிகள் அல்லது கோசாலைக்கு" };
  } else if (struggleCategory === "anger_temper" || isMarsAfflicted) {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಕುಜ ಶಾಂತಿ, ತಾಮ್ರಾಭಿಷೇಕ & ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ",
      en: "Gokarna Kuja Shanti, Copper Abhisheka & Subrahmanya Seva",
      hi: "गोकर्ण कुज शांति, ताम्राभिषेक एवं कार्तिकेय पूजा",
      te: "గోకర్ణ కుజ శాంతి & సుబ్రహ్మణ్య పూజ",
      ta: "கோகர்ண குஜ சாந்தி & முருகன் பூஜை"
    };
    sevaSignificance = {
      kn: "ಕುಜದೋಷ, ರಕ್ತದೊತ್ತಡ, ಆವೇಶ ಮತ್ತು ಸಂಬಂಧಗಳ ಘರ್ಷಣೆಯನ್ನು ತಗ್ಗಿಸಲು ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ತಾಮ್ರಪಾತ್ರೆಯ ಗಂಗಾಜಲ ಅಭಿಷೇಕ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
      en: "Pacifies severe Manglik friction, lowers arterial agitation, and harmonizes partnerships through copper vessel abhisheka.",
      hi: "मंगल दोष और क्रोध के शमन हेतु ताम्रपात्र से अभिषेक अत्यंत शुभ फलदायी है।",
      te: "కుజ దోష నివారణకు తామ్రాభిషేకం శ్రేష్టం.",
      ta: "செவ்வாய் தோஷம் தீர தாமிர பாத்திர அபிஷேகம் சிறந்தது."
    };
    sevaIdealDay = { kn: "ಮಂಗಳವಾರ ಅಥವಾ ಷಷ್ಠಿ ತಿಥಿ", en: "Tuesday or Shashthi Tithi", hi: "मंगलवार अथवा षष्ठी", te: "మంగళవారం లేదా షష్ఠి", ta: "செவ்வாய்க்கிழமை அல்லது சஷ்டி" };
    donationItem = { kn: "ಕೆಂಪು ತೊಗರಿಬೇಳೆ / ಮಸೂರ್ ದಾಲ್, ಬೆಲ್ಲ ಹಾಗೂ ತಾಮ್ರದ ಪಾತ್ರೆ", en: "Red lentils (masoor dal), pure jaggery, or copper utensils", hi: "मसूर दाल, गुड़ अथवा तांबे का बर्तन", te: "ఎర్ర కందులు, బెల్లం, రాగి పాత్ర", ta: "சிவப்பு பருப்பு, வெல்லம் அல்லது செம்பு பாத்திரம்" };
    donationDay = { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "మంగళవారం", ta: "செவ்வாய்க்கிழமை" };
  } else if (struggleCategory === "career_obstacles" || isSaturnAfflicted || isSadeSati || isAshtamaShani) {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಶನಿ-ಶಿವಾಭಿಷೇಕ & ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ",
      en: "Gokarna Shani-Shiva Tailabhisheka & Mrityunjaya Shanti",
      hi: "गोकर्ण शनि-शिवाभिषेक एवं महामृत्युंजय तैलाभिषेक",
      te: "గోకర్ణ శని-శివాభిషేకం",
      ta: "கோகர்ண சனி-சிவாபிஷேகம்"
    };
    sevaSignificance = {
      kn: "ಏಳೂವರೆ ವರ್ಷದ ಶನಿ ಸಾಡೇಸಾತಿ ಮತ್ತು ಅಷ್ಟಮ ಶನಿಯ ಕಠಿಣ ಕರ್ಮಬಾಧೆಗಳನ್ನು ಕರಗಿಸಿ ರಕ್ಷಣೆ ನೀಡುವ ಮಹಾಬಲೇಶ್ವರ ತೈಲಾಭಿಷೇಕ ಸೇವೆ.",
      en: "Transmutes heavy Saturnian karmic trials, offering spiritual armor during Sade Sati and Ashtama Shani.",
      hi: "साढ़ेसाती एवं अष्टम शनि के कष्टों से मुक्ति हेतु तैलाभिषेक परम कल्याणकारी है।",
      te: "ఏలినాటి శని బాధలు తొలగడానికి తైలాభిషేకం శ్రేష్టం.",
      ta: "ஏழரை சனி தாக்கம் நீங்க நல்லெண்ணெய் அபிஷேகம் சிறந்தது."
    };
    sevaIdealDay = { kn: "ಶನಿವಾರ ಅಥವಾ ಪ್ರದೋಷ", en: "Saturday or Pradosha", hi: "शनिवार अथवा प्रदोष", te: "శనివారం లేదా ప్రదోషం", ta: "சனிக்கிழமை அல்லது பிரதோஷம்" };
    donationItem = { kn: "ಕಪ್ಪು ಎಳ್ಳು, ಸಾಸಿವೆ/ಎಳ್ಳೆಣ್ಣೆ ಹಾಗೂ ಕಪ್ಪು ಕಂಬಳಿ", en: "Black sesame seeds, mustard/sesame oil, or dark blanket", hi: "काले तिल, तेल अथवा काला कंबल", te: "నల్ల నువ్వులు, నువ్వుల నూనె, దుప్పటి", ta: "கருப்பு எள், நல்லெண்ணெய் அல்லது கம்பளி" };
    donationDay = { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனிக்கிழமை" };
    donationBeneficiary = { kn: "ಅಶಕ್ತ ವೃದ್ಧರಿಗೆ ಅಥವಾ ಪೌರಕಾರ್ಮಿಕರಿಗೆ", en: "Elderly destitute or laboring workers", hi: "वृद्धों एवं जरूरतमंद श्रमिकों को", te: "వృద్ధులకు లేదా పేద కార్మికులకు", ta: "முதியவர்கள் அல்லது ஏழை தொழிலாளர்களுக்கு" };
  } else if (isRahuKetuStrong) {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಸರ್ಪ ಸಂಸ್ಕಾರ, ನಾಗಪ್ರತಿಷ್ಠೆ & ಆಶ್ಲೇಷಾ ಬಲಿ",
      en: "Gokarna Sarpa Samskara, Naga Pratishtha & Ashlesha Bali",
      hi: "गोकर्ण सर्प संस्कार एवं नाग प्रतिष्ठा",
      te: "గోకర్ణ సర్ప సంస్కార పూజ",
      ta: "கோகர்ண சர்ப்ப சம்ஸ்கார பூஜை"
    };
    sevaSignificance = {
      kn: "ರಾಹು-ಕೇತುಗಳ ಕಾಲಸರ್ಪ ಅಥವಾ ಸರ್ಪದೋಷದಿಂದ ಉಂಟಾಗುವ ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ ಮತ್ತು ವಂಶಾಭಿವೃದ್ಧಿ ಅಡೆತಡೆಗಳ ಪರಿಹಾರಕ್ಕೆ ಪರಮ ಶ್ರೇಷ್ಠ.",
      en: "Clears Kala Sarpa and ancestral serpent curses, restoring domestic harmony and psychic clarity.",
      hi: "कालसर्प और सर्प दोष निवारण हेतु गोकर्ण में नाग पूजा अत्यंत फलदायी है।",
      te: "సర్ప దోష నివారణకు విశేష పూజ.",
      ta: "சர்ப்ப தோஷம் நீங்க விசேஷ பூஜை."
    };
    sevaIdealDay = { kn: "ಪಂಚಮಿ, ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಮಂಗಳವಾರ", en: "Panchami, Amavasya, or Tuesday", hi: "पंचमी अथवा अमावस्या", te: "పంచమి లేదా అమావాస్య", ta: "பஞ்சமி அல்லது அமாவாசை" };
    donationItem = { kn: "ಉದ್ದಿನ ಕಾಳು (ಕಪ್ಪು ಉದ್ದು), ಬೆಳ್ಳಿ ಸರ್ಪ ಅಥವಾ ವಸ್ತ್ರ", en: "Black gram (urad dal), silver serpent idol, or clothing", hi: "उड़द की दाल अथवा चांदी के नाग-नागिन", te: "మినుములు లేదా వెండి సర్పం", ta: "உளுந்து அல்லது வெள்ளி நாகர்" };
    donationDay = { kn: "ಮಂಗಳವಾರ ಅಥವಾ ಶನಿವಾರ", en: "Tuesday or Saturday", hi: "मंगलवार अथवा शनिवार", te: "మంగళ లేదా శనివారం", ta: "செவ்வாய் அல்லது சனிக்கிழமை" };
  }

  const gokarnaTempleRemedies = {
    prescribedSeva: {
      name: prescribedSevaName,
      temple: {
        kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ಕರ್ನಾಟಕ)",
        en: "Sri Mahabaleshwara Swamy Temple, Gokarna (Karnataka)",
        hi: "श्री महाबलेश्वर स्वामी मंदिर, गोकर्ण (कर्नाटक)",
        te: "శ్రీ మహాబలేశ్వర స్వామి దేవస్థానం, గోకర్ణ (కర్ణాటక)",
        ta: "ஸ்ரீ மகாபலேஸ்வரர் திருக்கோயில், கோகர்ணம் (கர்நாடகா)"
      },
      significance: sevaSignificance,
      idealDay: sevaIdealDay
    },
    rudrakshaRecommendation: {
      mukhi: {
        kn: `${prescriptions.rudraksha.mukhi} Mukhi (${prescriptions.rudraksha.nameKn})`,
        en: `${prescriptions.rudraksha.mukhi}-Mukhi (${prescriptions.rudraksha.nameEn})`,
        hi: `${prescriptions.rudraksha.mukhi}-मुखी रुद्राक्ष`,
        te: `${prescriptions.rudraksha.mukhi}-ముఖి రుద్రాక్ష`,
        ta: `${prescriptions.rudraksha.mukhi}-முக ருத்ராட்சம்`
      },
      deity: {
        kn: prescriptions.rudraksha.deity,
        en: prescriptions.rudraksha.deity,
        hi: prescriptions.rudraksha.deity,
        te: prescriptions.rudraksha.deity,
        ta: prescriptions.rudraksha.deity
      },
      benefits: {
        kn: prescriptions.rudraksha.astrologicalReason,
        en: prescriptions.rudraksha.wearingMethod,
        hi: "क्रोध, चिंता को दूर कर एकाग्रता और आत्मशांति प्रदान करता है।",
        te: "కోపాన్ని తగ్గించి మానసిక ఏకాగ్రతను పెంచుతుంది.",
        ta: "கோபத்தை தணித்து மனதை ஒருமுகப்படுத்தும்."
      }
    },
    gemstoneRecommendation: {
      stone: {
        kn: `${prescriptions.gemstoneRing.primaryGemstoneKn} (${prescriptions.gemstoneRing.caratWeight})`,
        en: `${prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeightEn || prescriptions.gemstoneRing.caratWeight})`,
        hi: `${prescriptions.gemstoneRing.primaryGemstoneHi || prescriptions.gemstoneRing.sanskritName} (${prescriptions.gemstoneRing.caratWeightHi || prescriptions.gemstoneRing.caratWeight})`,
        te: `${prescriptions.gemstoneRing.primaryGemstoneTe || prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeightTe || prescriptions.gemstoneRing.caratWeight})`,
        ta: `${prescriptions.gemstoneRing.primaryGemstoneTa || prescriptions.gemstoneRing.primaryGemstoneEn} (${prescriptions.gemstoneRing.caratWeightTa || prescriptions.gemstoneRing.caratWeight})`
      },
      metal: {
        kn: prescriptions.gemstoneRing.metalKn,
        en: prescriptions.gemstoneRing.metalEn,
        hi: prescriptions.gemstoneRing.metalEn,
        te: prescriptions.gemstoneRing.metalEn,
        ta: prescriptions.gemstoneRing.metalEn
      },
      finger: {
        kn: prescriptions.gemstoneRing.fingerKn,
        en: prescriptions.gemstoneRing.fingerEn,
        hi: prescriptions.gemstoneRing.fingerHi || prescriptions.gemstoneRing.fingerEn,
        te: prescriptions.gemstoneRing.fingerTe || prescriptions.gemstoneRing.fingerEn,
        ta: prescriptions.gemstoneRing.fingerTa || prescriptions.gemstoneRing.fingerEn
      },
      dayToWear: {
        kn: prescriptions.gemstoneRing.activationDay,
        en: prescriptions.gemstoneRing.activationDayEn || prescriptions.gemstoneRing.activationDay,
        hi: prescriptions.gemstoneRing.activationDayHi || prescriptions.gemstoneRing.activationDay,
        te: prescriptions.gemstoneRing.activationDayTe || prescriptions.gemstoneRing.activationDay,
        ta: prescriptions.gemstoneRing.activationDayTa || prescriptions.gemstoneRing.activationDay
      }
    },
    donationDaana: {
      item: donationItem,
      day: donationDay,
      beneficiary: donationBeneficiary
    }
  };

  // 13. Chief Priest Blessing (Strictly Vedamurthi Shri Shreeram Pandit)
  const chiefPriestBlessing = {
    priestName: {
      kn: "ವೇದಮೂರ್ತಿ ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      en: "Vedamurthi Shri Shreeram Pandit",
      hi: "वेदमूर्ति श्री श्रीराम पंडित",
      te: "వేదమూర్తి శ్రీ శ్రీరామ్ పండిత్",
      ta: "வேதமூர்த்தி ஸ்ரீ ஸ்ரீராம் பண்டித்"
    },
    priestTitle: {
      kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು & ಧರ್ಮಕರ್ತರು, ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      en: "Chief Priest & Dharmadhikari, Sri Gokarna Kshetra",
      hi: "प्रधान अर्चक एवं धर्मकर्ता, श्री गोकर्ण क्षेत्र",
      te: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ క్షేత్రం",
      ta: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண க்ஷேத்திரம்"
    },
    phone: "+91 99723 39362",
    sanskritAshirvada: "॥ ॐ स्वस्ति प्रजाभ्यः परिपालयन्तां न्यायेन मार्गेण महीं महीशाः । शुभं भवतु कल्याणं च वर्धताम् ॥",
    ashirvadaMeaning: {
      kn: `${input.gothra ? input.gothra + " ಗೋತ್ರದ " : ""}${input.name ? input.name + " ರವರಿಗೆ " : ""}ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಪರಮ ಕೃಪೆಯಿಂದ ತಮ್ಮ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು, ಮನಸ್ಸಿನ ಕ್ರೋಧ-ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಅಖಂಡ ಯಶಸ್ಸು ಲಭಿಸಲಿ ಎಂದು ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಿಂದ ಆಶೀರ್ವದಿಸುತ್ತೇವೆ.`,
      en: `For devotee ${input.name || "devotee"}${input.gothra ? " of " + input.gothra + " Gotra" : ""}, by the supreme grace of Lord Mahabaleshwara at Gokarna, may all planetary afflictions and life obstacles be dissolved, bestowing you with health, peace, longevity, and auspicious prosperity.`,
      hi: `श्री ${input.name || "भक्त"}${input.gothra ? " (" + input.gothra + " गोत्र)" : ""} पर भगवान श्री महाबलेश्वर की असीम अनुकंपा से समस्त ग्रह दोष और जीवन के संताप दूर हों तथा सुख-शांति एवं ऐश्वर्य की वृद्धि हो।`,
      te: `${input.gothra ? input.gothra + " గోత్రోద్భవులైన " : ""}${input.name ? input.name + " గారికి " : ""}శ్రీ మహాబలేశ్వరుని దివ్య కృపతో సర్వ దోషాలు తొలగి ఆయురారోగ్యాలు, మనశ్శాంతి కలగాలని ఆశీర్వదిస్తున్నాము.`,
      ta: `${input.gothra ? input.gothra + " கோத்திர " : ""}${input.name ? input.name + " அவர்களுக்கு " : ""}ஸ்ரீ மகாபலேஸ்வரரின் திருவருளால் சகல தோஷங்களும் நீங்கி ஆரோக்கியமும் மன அமைதியும் உண்டாக ஆசீர்வதிக்கிறோம்.`
    },
    templeSealText: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನಂ · ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಅಧಿಕೃತ ಮುದ್ರೆ",
      en: "Sri Mahabaleshwara Temple Gokarna · Official Vedic Seal",
      hi: "श्री महाबलेश्वर देवस्थानम् · गोकर्ण क्षेत्र आधिकारिक मुद्रा",
      te: "శ్రీ మహాబలేశ్వర దేవస్థానం · గోకర్ణ అధికారిక ముద్ర",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் திருக்கோயில் · கோகர்ணம் அதிகாரப்பூர்வ முத்திரை"
    }
  };

  return {
    devoteeName: input.name || "Devotee",
    birthDate: birthYmd,
    birthTime: birthHm,
    gotra: input.gothra,
    lagnaName: RASHI_NAMES_LOCALE[lagnaRashiName] || { kn: lagnaRashiName, en: lagnaRashiName },
    rashiName: RASHI_NAMES_LOCALE[moonRashiName] || { kn: moonRashiName, en: moonRashiName },
    nakshatraName: { kn: moonNakName, en: moonNakName, hi: moonNakName, te: moonNakName, ta: moonNakName },
    primaryStruggle: {
      category: struggleCategory,
      title: primaryStruggleTitle,
      description: primaryStruggleDesc,
      intensity,
      intensityLabel
    },
    lifeTurnaroundTiming,
    afflictionFactors,
    psychologicalProfile: {
      krodhaLevel,
      manasStability,
      vitalityScore,
      patienceIndex
    },
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    panchangaRemedies,
    planetaryStrengthRemedies,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  };
}
