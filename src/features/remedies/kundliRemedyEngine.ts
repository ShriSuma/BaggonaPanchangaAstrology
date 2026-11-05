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
import { YOGA_NAMES_L5 } from "../premiumPdf/panchangaLifeEngine";
import { transliterateName } from "../../utils/transliterator";

export type SupportedLanguage = "kn" | "en" | "hi" | "te" | "ta";

export function formatNameForLanguage(name: string | undefined | null, targetLang: string, fallback: string = "Devotee"): string {
  if (!name || !name.trim()) return fallback;
  const trimmed = name.trim();
  const lang = (targetLang || "kn").toLowerCase();

  if (lang === "kn" && /[\u0C80-\u0CFF]/.test(trimmed)) return trimmed;
  if (lang === "hi" && /[\u0900-\u097F]/.test(trimmed)) return trimmed;
  if (lang === "te" && /[\u0C00-\u0C7F]/.test(trimmed)) return trimmed;
  if (lang === "ta" && /[\u0B80-\u0BFF]/.test(trimmed)) return trimmed;
  if (lang === "en" && !/[\u0900-\u0D7F]/.test(trimmed)) return trimmed;

  return transliterateName(trimmed, lang);
}

export interface PanchangaRemedies {
  elementalBalanceReason?: Record<string, string>;
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

export interface MandalaVrataSadhana {
  durationDays: number;
  durationLabel: Record<SupportedLanguage, string>;
  auspiciousStartMuhurtha: {
    taraBalaCategory: Record<SupportedLanguage, string>;
    taraBalaReason: Record<SupportedLanguage, string>;
    auspiciousWeekday: Record<SupportedLanguage, string>;
    tithiPakshaRecommendation: Record<SupportedLanguage, string>;
    idealTimeWindow: Record<SupportedLanguage, string>;
    facingDirection: Record<SupportedLanguage, string>;
    sacredAsana: Record<SupportedLanguage, string>;
  };
  threePhaseRoadmap: {
    phase1: {
      daysRange: Record<SupportedLanguage, string>;
      phaseTitle: Record<SupportedLanguage, string>;
      focusArea: Record<SupportedLanguage, string>;
      experientialRelief: Record<SupportedLanguage, string>;
      subconsciousShift: Record<SupportedLanguage, string>;
    };
    phase2: {
      daysRange: Record<SupportedLanguage, string>;
      phaseTitle: Record<SupportedLanguage, string>;
      focusArea: Record<SupportedLanguage, string>;
      experientialRelief: Record<SupportedLanguage, string>;
      subconsciousShift: Record<SupportedLanguage, string>;
    };
    phase3: {
      daysRange: Record<SupportedLanguage, string>;
      phaseTitle: Record<SupportedLanguage, string>;
      focusArea: Record<SupportedLanguage, string>;
      experientialRelief: Record<SupportedLanguage, string>;
      subconsciousShift: Record<SupportedLanguage, string>;
    };
  };
  japaPurashcharanaFormula: {
    dailyCountFormatted: Record<SupportedLanguage, string>;
    totalMandalaCountFormatted: Record<SupportedLanguage, string>;
    prescribedMala: Record<SupportedLanguage, string>;
    shastricRule: Record<SupportedLanguage, string>;
  };
  sattvicPathyaAndNiyama: {
    aharaRules: Array<Record<SupportedLanguage, string>>;
    acharaRules: Array<Record<SupportedLanguage, string>>;
    weeklyDaana: Record<SupportedLanguage, string>;
  };
  sankalpaDeclaration: Record<SupportedLanguage, string>;
}

export interface BadhakaAnalysis {
  modality: "Chara" | "Sthira" | "Dvisvabhava";
  modalityLabel: Record<SupportedLanguage, string>;
  badhakaHouse: number;
  badhakaSignName: Record<SupportedLanguage, string>;
  badhakeshGraha: PlanetName;
  badhakeshName: Record<SupportedLanguage, string>;
  diagnosisReason: Record<SupportedLanguage, string>;
  shantiRemedy: Record<SupportedLanguage, string>;
}

export interface VedicDoctorPrescription {
  title: Record<SupportedLanguage, string>;
  subtitle: Record<SupportedLanguage, string>;
  nidana: {
    primaryDosha: "Pitta" | "Vata" | "Kapha" | "Tridosha";
    doshaLabel: Record<SupportedLanguage, string>;
    rootCauseDescription: Record<SupportedLanguage, string>;
    affectedNadis: Record<SupportedLanguage, string>;
  };
  aushadha: {
    beejaMantra: {
      mantraSanskrit: string;
      mantraNative: Record<SupportedLanguage, string>;
      transliteration: string;
      dailyDosageCount: Record<SupportedLanguage, string>;
      instructions: Record<SupportedLanguage, string>;
    };
    stotraKavacha: Record<SupportedLanguage, string>;
    sacredSubstance: Record<SupportedLanguage, string>;
  };
  anupana: {
    vehicleName: Record<SupportedLanguage, string>;
    preparationMethod: Record<SupportedLanguage, string>;
    intakeTiming: Record<SupportedLanguage, string>;
  };
  pathyaApathya: {
    pathyaPrescribed: Array<Record<SupportedLanguage, string>>;
    apathyaProhibited: Array<Record<SupportedLanguage, string>>;
  };
  chikitsaKala: {
    idealTimeWindow: Record<SupportedLanguage, string>;
    facingDirection: Record<SupportedLanguage, string>;
    asanaMaterial: Record<SupportedLanguage, string>;
  };
  reliefMilestones: {
    day1To3: {
      stage: Record<SupportedLanguage, string>;
      observation: Record<SupportedLanguage, string>;
    };
    day4To7: {
      stage: Record<SupportedLanguage, string>;
      observation: Record<SupportedLanguage, string>;
    };
    day8To14: {
      stage: Record<SupportedLanguage, string>;
      observation: Record<SupportedLanguage, string>;
    };
    day15To20: {
      stage: Record<SupportedLanguage, string>;
      observation: Record<SupportedLanguage, string>;
    };
    day21To45: {
      stage: Record<SupportedLanguage, string>;
      observation: Record<SupportedLanguage, string>;
    };
  };
}

export interface KundliRemedyDiagnosis {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  gotra?: string;
  maritalStatus?: string;
  isAiGenerated?: boolean;
  aiNarration?: string;
  aiFallbackMessage?: Record<SupportedLanguage, string> | Record<string, string>;
  aiNarrationText?: Record<string, string>;
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
    timeline?: Record<string, string>;
    catalystGraha?: Record<string, string>;
    breakthroughMechanism?: Record<string, string>;
    specificSeva?: Record<string, string>;
    astrologicalReason?: Record<string, string>;
    beforeState?: Record<string, string>;
    afterState?: Record<string, string>;
    day10Expectation?: Record<string, string>;
    day15Expectation?: Record<string, string>;
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
    isSandhiActive?: boolean;
    sandhiAlert?: {
      code: string;
      title: Record<string, string>;
      status: "active" | "upcoming" | "stable";
      description: Record<string, string>;
      remedy: Record<string, string>;
      durationFormatted?: Record<string, string>;
    };
    adhidevata?: {
      adhidevata: Record<SupportedLanguage, string>;
      pratyadhidevata: Record<SupportedLanguage, string>;
      sadhana: Record<SupportedLanguage, string>;
      mahaDashaAdhidevata: Record<SupportedLanguage, string>;
      mahaDashaPratyadhidevata: Record<SupportedLanguage, string>;
      bhuktiAdhidevata: Record<SupportedLanguage, string>;
      bhuktiPratyadhidevata: Record<SupportedLanguage, string>;
      sadhanaAction: Record<SupportedLanguage, string>;
    };
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
    sadeSatiDetailedPhase?: {
      phaseCode: "rising" | "peak" | "setting" | "ashtama" | "ardhashtama" | "kantaka" | "favorable";
      phaseTitle: Record<SupportedLanguage, string>;
      phaseDescription: Record<SupportedLanguage, string>;
      shantiRecommendation: Record<SupportedLanguage, string>;
    };
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
  mandalaVrataSadhana: MandalaVrataSadhana;
  badhakaAnalysis: BadhakaAnalysis;
  vedicDoctorPrescription: VedicDoctorPrescription;
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
      sanskrit: "॥ ॐ सर्पेभ्यो नमः । ॐ आश्लेषानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ इन्द्राय नमः । ॐ ज्येष्ठानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ अद्भ्यो नमः । ॐ पूं पूर्वाषाढानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ विश्वेभ्यो देवेभ्यो नमः । ॐ उं उत्तराषाढानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ विष्णवे नमः । ॐ श्रुं श्रवणनक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ वसुभ्यो नमः । ॐ धं धनिष्ठानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ वरुणाय नमः । ॐ शं शतभिषानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ अजैकपदे नमः । ॐ पूं पूर्वभाद्रपदानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ अहिर्बुध्न्याय नमः । ॐ उं उत्तरभाद्रपदानक्षत्रेभ्यो नमः ॥",
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
      sanskrit: "॥ ॐ पूष्णे नमः । ॐ रें रेवतीनक्षत्रेभ्यो नमः ॥",
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
    id: "uma_maheshwara",
    forAffliction: ["relationship_friction", "marital_discord", "domestic_peace", "shukra_affliction"],
    title: {
      kn: "ಶ್ರೀ ಉಮಾ-ಮಹೇಶ್ವರ ಸ್ತೋತ್ರಂ (ದಾಂಪತ್ಯ ಸೌಹಾರ್ದ)",
      en: "Sri Uma-Maheshwara Stotram (Marital Harmony)",
      hi: "श्री उमा-महेश्वर स्तोत्रम् (दांपत्य सौहार्द)",
      te: "శ్రీ ఉమా-మహేశ్వర స్తోత్రం (దాంపత్య సామరస్యం)",
      ta: "ஸ்ரீ உமா-மஹேஸ்வர ஸ்தோத்திரம் (தாம்பத்ய ஒற்றுமை)"
    },
    dedicatedTo: {
      kn: "ಭಗವಾನ್ ಶಿವ ಮತ್ತು ಜಗನ್ಮಾತೆ ಪಾರ್ವತಿ (ದಾಂಪತ್ಯ ಸೌಹಾರ್ದ)",
      en: "Lord Shiva and Goddess Parvati (Marital Harmony)",
      hi: "भगवान शिव एवं माता पार्वती (दांपत्य सौहार्द)",
      te: "ఉమా-మహేశ్వరులు",
      ta: "உமா-மஹேஸ்வரர்"
    },
    shlokaSanskrit: `नमः शिवाभ्यां नवयौवनाभ्यां परस्पराश्लिष्टवपुर्धराभ्याम् ।
नागेन्द्रकन्यावृषकेतनाभ्यां नमो नमः शङ्करपार्वतीभ्याम् ॥`,
    shlokaKannada: `ನಮಃ ಶಿವಾಭ್ಯಾಂ ನವಯೌವನಾಭ್ಯಾಂ ಪರಸ್ಪರಾಶ್ಲಿಷ್ಟವಪುರ್ಧರಾಭ್ಯಾಮ್ ।
ನಾಗೇಂದ್ರಕನ್ಯಾವೃಷಕೇತನಾಭ್ಯಾಂ ನಮೋ ನಮಃ ಶಂಕರಪಾರ್ವತೀಭ್ಯಾಮ್ ॥`,
    shlokaTelugu: `నమః శివాభ్యాం నవయౌవనాభ్యాం పరస్పరాశ్లిష్టవపుర్ధరాభ్యామ్ ।
నాగేంద్రకన్యావృషకేతనాభ్యాం నమో నమః శంకరపార్వతీభ్యామ్ ॥`,
    shlokaTamil: `நமஃ சிவாப்யாம் நவயௌவனாப்யாம் பரஸ்பராஸ்லிஷ்டவபுர்தராப்யாம் ।
நாகேந்த்ரகன்யாவ்ருஷகேதனாப்யாம் நமோ நமஃ சங்கரபார்வதீப்யாம் ॥`,
    shlokaHindi: `नमः शिवाभ्यां नवयौवनाभ्यां परस्पराश्लिष्टवपुर्धराभ्याम् ।
नागेन्द्रकन्यावृषकेतनाभ्यां नमो नमः शङ्करपार्वतीभ्याम् ॥`,
    transliteration: "Namaḥ Śivābhyāṁ Navayauvanābhyāṁ Parasparāśliṣṭavapurdharābhyām | Nāgendrakanyāvṛṣaketanābhyāṁ Namō Namaḥ Śaṅkarapārvatībhyām ||",
    meaning: {
      kn: "ಪರಸ್ಪರ ಅವಿನಾಭಾವ ಪ್ರೇಮದಿಂದ ಕಂಗೊಳಿಸುವ ಆದಿದಂಪತಿಗಳಾದ ಉಮಾ-ಮಹೇಶ್ವರರಿಗೆ ನಮಸ್ಕಾರಗಳು. ದಾಂಪತ್ಯದಲ್ಲಿ ಅನ್ಯೋನ್ಯತೆ, ಶಾಂತಿ ಮತ್ತು ಸುಖ-ಸೌಹಾರ್ದತೆಯನ್ನು ಕರುಣಿಸಿ.",
      en: "Salutations to the primordial divine couple, Uma and Maheshwara, who abide in eternal mutual love. May they bless married life with harmony, deep understanding, peace, and domestic joy.",
      hi: "परस्पर अगाध प्रेम से युक्त आदिदम्पति उमा-महेश्वर को नमन। दांपत्य जीवन में सामंजस्य, मधुरता और शांति प्रदान करें।",
      te: "పరస్పర ప్రేమతో విలసిల్లే ఉమా-మహేశ్వరులకు నమస్కారాలు. దాంపత్యంలో సామరస్యం మరియు శాంతిని ప్రసాదించండి.",
      ta: "அன்யோன்யமான உமா-மஹேஸ்வர தம்பதியருக்கு நமஸ்காரங்கள். இல்லற வாழ்வில் ஒற்றுமையும் அமைதியும் பெருகட்டும்."
    },
    spiritualBenefits: {
      kn: "ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ, ಪತಿ-ಪತ್ನಿ ಅನ್ಯೋನ್ಯತೆ, ಮನಸ್ತಾಪ ನಿವಾರಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ.",
      en: "Fosters marital harmony, mutual affection between spouses, resolves domestic discord, and blesses peace at home.",
      hi: "दांपत्य सामंजस्य, पति-पत्नी में प्रगाढ़ प्रेम, गृह क्लेश निवारण एवं सुख-शांति।",
      te: "దాంపత్య సామరస్యం, భార్యాభర్తల మధ్య అనురాగం, కుటుంబ శాంతి.",
      ta: "தாம்பத்ய ஒற்றுமை, குடும்ப அமைதி, மனக்கசப்புகள் நீங்கும்."
    },
    bestTimeToRecite: { kn: "ಸೋಮವಾರ ಅಥವಾ ಶುಕ್ರವಾರ ಸಂಜೆ", en: "Monday or Friday evening", hi: "सोमवार अथवा शुक्रवार सायं", te: "సోమవారం లేదా శుక్రవారం సాయంత్రం", ta: "திங்கள் அல்லது வெள்ளி மாலை" },
    facingDirection: { kn: "ಉತ್ತರ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು", en: "North or East", hi: "उत्तर अथवा पूर्व", te: "ఉత్తరం లేదా తూర్పు", ta: "வடக்கு அல்லது கிழக்கு" },
    recitationCount: { kn: "ದಿನಕ್ಕೆ ೧ ಅಥವಾ ೧೧ ಬಾರಿ", en: "1 or 11 Times Daily", hi: "१ अथवा ११ बार", te: "1 లేదా 11 సార్లు", ta: "1 அல்லது 11 முறை" }
  },
  {
    id: "swayamvara_parvati",
    forAffliction: ["marriage_delay"],
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
    shlokaSanskrit: `ॐ ह्रीं योगिनि योगिनी योगेश्वरी योग भयङ्करि सकल स्थावर जङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥`,
    shlokaKannada: `ಓಂ ಹ್ರೀಂ ಯೋಗಿನಿ ಯೋಗಿನೀ ಯೋಗೇಶ್ವರೀ ಯೋಗ ಭಯಂಕರಿ ಸಕಲ ಸ್ಥಾವರ ಜಂಗಮಸ್ಯ ಮುಖ ಹೃದಯಂ ಮಮ ವಶಂ ಆಕರ್ಷಯ ಆಕರ್ಷಯ ನಮಃ ॥`,
    shlokaTelugu: `ఓం హ్రీం యోగిని యోగినీ యోగేశ్వరీ యోగ భయంకరి సకల స్థావర జంగమస్య ముఖ హృదయం మమ వశం ఆకర్షయ ఆకర్షయ నమః ॥`,
    shlokaTamil: `ஓம் ஹ்ரீம் யோகினி யோகினீ யோகேஸ்வரீ சகல ஸ்தாவர ஜங்கமஸ்ய முகம் ஹ்ருதயம் மம வசம் ஆகர்ஷய நமஹ ॥`,
    shlokaHindi: `ॐ ह्रीं योगिनि योगिनी योगेश्वरी योग भयङ्करि सकल स्थावर जङ्गमस्य मुख हृदयं मम वशं आकर्षय आकर्षय नमः ॥`,
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
      ta: "கடன்களை நீக்கி செல்வத்தை அருளும் அங்காரக பகவானுக்கு நமஸ்காரங்கள்."
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
 * Deterministic Shastric 10-Day & 15-Day Practice Milestones, Before vs After & Astrological Reasoning
 * Customized for all 13 primary life struggle categories in 5 languages.
 */
export function getTurnaroundMilestones(category: KundliRemedyDiagnosis["primaryStruggle"]["category"]): {
  astrologicalReason: Record<string, string>;
  beforeState: Record<string, string>;
  afterState: Record<string, string>;
  day10Expectation: Record<string, string>;
  day15Expectation: Record<string, string>;
} {
  switch (category) {
    case "anger_temper":
      return {
        astrologicalReason: {
          kn: "ಕುಜ ಹಾಗೂ ರವಿ ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ಅಗ್ನಿ ತತ್ತ್ವವು ಲಗ್ನ ಅಥವಾ ಮನಃಸ್ಥಾನದ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರುವುದರಿಂದ ಆಂತರಿಕ ಪಿತ್ತ ಹೆಚ್ಚಾಗಿ, ತಕ್ಷಣದ ಆವೇಶ ಹಾಗೂ ಸಿಟ್ಟು ಉಂಟಾಗುತ್ತದೆ. ಸೋಮ ಮಂತ್ರ ಹಾಗೂ ಚಂದ್ರಭೇದನದಿಂದ ಅಗ್ನಿ ತಣಿಯುತ್ತದೆ.",
          en: "Mars and Sun fiery intensity on natal lagna or mental houses aggravates subtle Pitta, causing sudden adrenaline spikes. Soma cooling mantras and breathwork pacify the solar heat.",
          hi: "मंगल और सूर्य के तीक्ष्ण प्रभाव से आंतरिक पित्त में वृद्धि होकर क्रोध और उत्तेजना उत्पन्न होती है। सोम मंत्र से शांति प्राप्त होती है।",
          te: "కుజ, సూర్య గ్రహాల తీవ్ర ప్రభావం వలన పిత్తం పెరిగి కోపం వస్తుంది. సోమ మంత్రంతో శాంతి కలుగుతుంది.",
          ta: "செவ்வாய் மற்றும் சூரியனின் அக்னி தத்துவத்தால் பித்தம் அதிகரித்து கோபம் உண்டாகிறது. சோம மந்திரத்தால் சாந்தி உண்டாகும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಕ್ಷುಲ್ಲಕ ಕಾರಣಗಳಿಗೆ ತಕ್ಷಣ ಸಿಟ್ಟು, ತಾಳ್ಮೆಯ ಕೊರತೆ, ಮಾತಿನಿಂದ ಸಂಬಂಧಗಳಲ್ಲಿ ಘರ್ಷಣೆ & ಆತಂಕ.",
          en: "Before Remedy: Sudden explosive anger, impatience, regrettable reactive speech & relational strain.",
          hi: "उपाय पूर्व: छोटी-छोटी बातों पर तीव्र क्रोध, अधीरता एवं कटु वाणी से संबंधों में तनाव।",
          te: "పరిహారానికి ముందు: త్వరగా కోపం రావడం, ఓపిక లేకపోవడం, వివాదాలు మరియు మానసిక అశాంతి.",
          ta: "பரிகாரத்திற்கு முன்: திடீர் கோபம், பொறுமையின்மை, வாக்குவாதங்கள் மற்றும் மன அமைதியின்மை."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಪರಮ ಶಾಂತ ಮನಸ್ಸು, ಸಾವಧಾನದ ವಿವೇಕಯುತ ನಿರ್ಧಾರ, ಕುಟುಂಬದಲ್ಲಿ ಗೌರವ & ದೈವಿಕ ಸೌಹಾರ್ದತೆ.",
          en: "After Remedy: Serene mental equilibrium, patient discernment, domestic affection & divine grace.",
          hi: "उपाय पश्चात: परम शांत चित्त, विवेकपूर्ण निर्णय, परिवार में सम्मान एवं सौहार्द।",
          te: "పరిహారం తర్వాత: ప్రశాంతమైన మనస్సు, వివేకవంతమైన నిర్ణయాలు, కుటుంబంలో గౌరవం మరియు శాంతి.",
          ta: "பரிகாரத்திற்கு பின்: அமைதியான மனம், நிதானமான முடிவு, குடும்பத்தில் மரியாதை மற்றும் ஒற்றுமை."
        },
        day10Expectation: {
          kn: "ದಿನವೂ ಮುಂಜಾನೆ ಸೋಮ-ಕುಜ ಶಾಂತಿ ಜಪ ಹಾಗೂ ಚಂದ್ರಭೇದನ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದರಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ದೇಹದೊಳಗಿನ ಪಿತ್ತ ತಾಪ ಇಳಿದು, ಅನಗತ್ಯ ಸಿಟ್ಟು-ಉದ್ವೇಗ ಶಮನವಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ತಂಪಾದ ಶಾಂತಿ ಅನುಭವಕ್ಕೆ ಬರುತ್ತದೆ.",
          en: "By observing daily morning Soma-Mars pacification japa and left-nostril breathing, subtle Pitta heat cools within 10 days, visibly silencing sudden anger flares into deep composure.",
          hi: "प्रतिदिन प्रातः सोम-मंगल शांति जप एवं चन्द्रभेदन प्राणायाम से १० दिनों में आंतरिक पित्त शांत होकर क्रोध और उत्तेजना में स्पष्ट कमी आएगी।",
          te: "రోజూ ఉదయం సోమ-కుజ శాంతి జపం మరియు ప్రాణాయామం చేయడం వలన 10 రోజుల్లో పిత్తం తగ్గి కోపం అదుపులోకి వస్తుంది.",
          ta: "தினமும் காலையில் சோம-செவ்வாய் சாந்தி ஜெபம் செய்வதால் 10 நாட்களில் பித்தம் தணிந்து கோபம் கட்டுப்படும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಿರಂತರ ಸಾಧನೆಯ ನಂತರ ಕುಟುಂಬ ಸದಸ್ಯರು ಹಾಗೂ ಸಹೋದ್ಯೋಗಿಗಳೊಂದಿಗಿನ ಹಳೆಯ ಮನಸ್ತಾಪಗಳು ಕರಗಿ, ನಿಮ್ಮ ಶಾಂತ ನಡವಳಿಕೆಗೆ ಮೆಚ್ಚುಗೆ ದೊರೆತು, ಸಂಬಂಧಗಳಲ್ಲಿ ಮಧುರ ಸಾಮರಸ್ಯ ಮರಳಲಿದೆ.",
          en: "After 15 days of continuous practice, relational friction and past misunderstandings dissolve; your calm clarity commands mutual respect and deep domestic harmony.",
          hi: "१५ दिनों की निरंतर साधना से पारिवारिक और कार्यक्षेत्र के मतभेद समाप्त होकर संबंधों में मधुरता और सम्मान पुनः स्थापित होगा।",
          te: "15 రోజుల సాధనతో కుటుంబంలో మరియు ఆఫీసులో విభేదాలు తొలగి సత్సంబంధాలు పునరుద్ధరించబడతాయి.",
          ta: "15 நாட்கள் தொடர் வழிபாட்டால் குடும்பத்திலும் பணியிடத்திலும் உள்ள கருத்து வேறுபாடுகள் நீங்கி நல்லிணக்கம் ஏற்படும்."
        }
      };

    case "student_academic":
      return {
        astrologicalReason: {
          kn: "೪ನೇ ವಿದ್ಯಾ ಸ್ಥಾನ ಮತ್ತು ಬುದ್ಧಿಕಾರಕ ಬುಧನ ಮೇಲೆ ರಾಹು ಅಥವಾ ಶನಿಯ ದೃಷ್ಟಿಯಿರುವುದರಿಂದ ಏಕಾಗ್ರತೆ ಭಂಗ ಹಾಗೂ ಪರೀಕ್ಷಾ ಭಯ ಕಾಡುತ್ತದೆ. ಮೇಧಾ ಸರಸ್ವತಿ ಆರಾಧನೆಯಿಂದ ಜ್ಞಾನನಾಡಿಗಳು ಜಾಗೃತವಾಗುತ್ತವೆ.",
          en: "Afflictions to 4th house of education and Mercury scatter cognitive focus and create exam restlessness. Saraswati-Medha sadhana aligns intellect channels for photographic retention.",
          hi: "विद्या भाव एवं बुध पर पाप प्रभाव से एकाग्रता भंग और परीक्षा भय होता है। मेधा सरस्वती की कृपा से बुद्धि तीक्ष्ण होती है।",
          te: "విద్యా స్థానంపై పాప గ్రహాల ప్రభావం వలన చదువులో శ్రద్ధ తగ్గుతుంది. సరస్వతీ దేవి అనుగ్రహంతో ఏకాగ్రత పెరుగుతుంది.",
          ta: "கல்வி ஸ்தானத்தில் அசுப கிரக தாக்கத்தால் படிப்பில் கவனச்சிதறல் உண்டாகிறது. சரஸ்வதி வழிபாட்டால் கூர்மையான அறிவு கிடைக்கும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಓದಿನಲ್ಲಿ ಅಸ್ಥಿರತೆ, ಸಣ್ಣ ವಿಷಯಗಳಿಗೂ ಗಮನ ಭಂಗ, ಮರೆವು ಹಾಗೂ ಪರೀಕ್ಷೆಯ ಆತಂಕ.",
          en: "Before Remedy: Restless study habits, mental wandering, memory retention dips & pre-exam anxiety.",
          hi: "उपाय पूर्व: पढ़ाई में मन न लगना, ध्यान भटकना, विस्मरण एवं परीक्षा के समय घबराहट।",
          te: "పరిహారానికి ముందు: చదువుపై దృష్టి లేకపోవడం, మతిమరుపు మరియు పరీక్షల భయం.",
          ta: "பரிகாரத்திற்கு முன்: படிப்பில் கவனமின்மை, ஞாபக மறதி மற்றும் தேர்வு பயம்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ತೀಕ್ಷ್ಣ ಗ್ರಹಣಶಕ್ತಿ, ನಿರಂತರ ಏಕಾಗ್ರತೆ, ಪರೀಕ್ಷೆಯಲ್ಲಿ ನಿರ್ಭೀತ ವಿಶ್ವಾಸ & ಉನ್ನತ ಶ್ರೇಣಿ.",
          en: "After Remedy: Razor-sharp cognitive retention, uninterrupted study flow, fearless confidence & academic honors.",
          hi: "उपाय पश्चात: तीक्ष्ण स्मरण शक्ति, अटूट एकाग्रता, निर्भीक आत्मविश्वास एवं उत्कृष्ट परीक्षा परिणाम।",
          te: "పరిహారం తర్వాత: అద్భుతమైన జ్ఞాపకశక్తి, ఏకాగ్రత, పరీక్షల్లో విజయం మరియు ఆత్మవిశ్వాసం.",
          ta: "பரிகாரத்திற்கு பின்: சிறந்த ஞாபக சக்தி, தொடர் கவனம், தேர்வில் வெற்றி மற்றும் தன்னம்பிக்கை."
        },
        day10Expectation: {
          kn: "ದಿನವೂ ಸರಸ್ವತಿ-ಮೇಧಾ ಬೀಜ ಜಪ ಹಾಗೂ ಬ್ರಾಹ್ಮರೀ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದರಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಓದಿನಲ್ಲಿ ಚಂಚಲತೆ ಮಾಯವಾಗಿ, ೨ ಗಂಟೆಗಳ ಕಾಲ ಸತತ ಏಕಾಗ್ರತೆಯಿಂದ ಓದುವ ಸ್ಥಿರತೆ ಸಿದ್ಧಿಸುತ್ತದೆ.",
          en: "Through daily Saraswati-Medha beeja japa and Bhramari breathwork, intellectual restlessness subsides within 10 days, securing 2+ hours of unbroken, deep study flow.",
          hi: "१० दिनों के नियमित जप एवं भ्रामरी प्राणायाम से मन का भटकाव दूर होकर पढ़ाई में २ घंटे की निरंतर एकाग्रता बनेगी।",
          te: "10 రోజుల నిత్య జపంతో చదువులో చంచలత తొలగి ఏకాగ్రత మరియు జ్ఞాపకశక్తి పెరుగుతాయి.",
          ta: "10 நாட்கள் வழிபாட்டால் படிப்பில் கவனச்சிதறல் நீங்கி 2 மணி நேரம் தொடர்ந்து படிக்கும் ஆற்றல் கிடைக்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಪರೀಕ್ಷಾ ಭಯ ಸಂಪೂರ್ಣ ಕರಗಿ, ಕಷ್ಟಕರವಾದ ವಿಷಯಗಳನ್ನು ಸಹ ಸುಲಭವಾಗಿ ಗ್ರಹಿಸಿ ನೆನಪಿಟ್ಟುಕೊಳ್ಳುವ ತೀಕ್ಷ್ಣ ಗ್ರಹಣಶಕ್ತಿ ಹಾಗೂ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಉಕ್ಕಿ ಹರಿಯಲಿದೆ.",
          en: "By day 15, exam dread dissolves completely; complex syllabus concepts are assimilated with clarity, unlocking confident recall and academic victory.",
          hi: "१५ दिनों के उपरांत परीक्षा का भय दूर होकर कठिन विषयों को भी सरलता से याद रखने की तीक्ष्ण मेधा शक्ति जागृत होगी।",
          te: "15 రోజుల తర్వాత పరీక్షా భయం తొలగి క్లిష్టమైన విషయాలు కూడా సులభంగా అర్థమై జ్ఞాపకం ఉంటాయి.",
          ta: "15 நாட்களுக்குப் பிறகு தேர்வு பயம் நீங்கி கடினமான பாடங்களும் எளிதில் மனதில் பதியும்."
        }
      };

    case "marriage_delay":
      return {
        astrologicalReason: {
          kn: "೭ನೇ ಕಳತ್ರ ಸ್ಥಾನ, ಶುಕ್ರ ಅಥವಾ ಗುರು ಗ್ರಹಗಳ ಮೇಲಿನ ಕರ್ಮ ಪ್ರತಿಬಂಧಕಗಳಿಂದ ಕಂಕಣ ಬಲ ವಿಳಂಬವಾಗುತ್ತಿದೆ. ಉಮಾ-ಮಹೇಶ್ವರ ಹಾಗೂ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಶಾಂತಿಯು ವಿವಾಹ ಮಾರ್ಗದ ತಡೆಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
          en: "Karmic restrictions on 7th matrimonial house and Venus/Jupiter delay matchmaking alignment. Uma-Maheshwara and Swayamvara Parvati sadhana dissolve delay doshas.",
          hi: "सप्तम भाव एवं शुक्र-गुरु पर प्रतिकूल प्रभाव से विवाह में बाधा आ रही है। स्वयंवर पार्वती साधना से विवाह योग प्रशस्त होता है।",
          te: "7వ వివాహ భావంపై గ్రహ దోషాల వలన సంబంధాలు ఆలస్యమవుతున్నాయి. స్వయంవర పార్వతీ పూజతో విఘ్నాలు తొలగుతాయి.",
          ta: "7ம் களத்திர ஸ்தானத்தில் உள்ள தோஷங்களால் திருமண பேச்சுவார்த்தை தாமதமாகிறது. சுயம்வர பார்வதி பூஜையால் தடைகள் நீங்கும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಮಾತುಕತೆಗಳು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಮುರಿದುಬೀಳುವುದು, ಸೂಕ್ತ ಹೊಂದಾಣಿಕೆ ಸಿಗದಿರುವುದು ಹಾಗೂ ನಿರಾಶೆ.",
          en: "Before Remedy: Near-miss matrimonial talks, mismatched proposals, recurring delays & emotional despair.",
          hi: "उपाय पूर्व: अंतिम समय पर रिश्ते टूटना, सुयोग्य प्रस्ताव न मिलना एवं मानसिक निराशा।",
          te: "పరిహారానికి ముందు: చివరి క్షణంలో సంబంధాలు కుదరకపోవడం మరియు నిరాశ.",
          ta: "பரிகாரத்திற்கு முன்: இறுதி நேரத்தில் பேச்சுவார்த்தை தடைபடுதல் மற்றும் ஏமாற்றம்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಕಂಕಣ ಬಲ ಜಾಗೃತಿ, ಸುಸಂಸ್ಕೃತ ಅರ್ಹ ಸಂಬಂಧದ ಆಗಮನ, ಶೀಘ್ರ ನಿಶ್ಚಿತಾರ್ಥ & ಸುಖೀ ದಾಂಪತ್ಯ ಪ್ರಾಪ್ತಿ.",
          en: "After Remedy: Auspicious Kankana Bala activation, arrival of virtuous aligned matches & joyful betrothal.",
          hi: "उपाय पश्चात: कंकण बल की प्राप्ति, सुयोग्य जीवनसाथी का आगमन, शीघ्र सगाई एवं सुखी दांपत्य।",
          te: "పరిహారం తర్వాత: శుభ వివాహ ప్రాప్తి, ఉత్తమ జీవిత భాగస్వామి లభించడం మరియు ఆనందమయ వైవాహిక జీవితం.",
          ta: "பரிகாரத்திற்கு பின்: மங்கல யோகம் கூடுதல், சிறந்த வரன் அமைதல் மற்றும் மகிழ்ச்சியான திருமணம்."
        },
        day10Expectation: {
          kn: "ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಬೀಜ ಜಪ ಹಾಗೂ ಗೌರಿ-ಶಂಕರ ಧ್ಯಾನದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ವಿವಾಹ ವಿಳಂಬದ ಬಗ್ಗೆ ಕಾಡುತ್ತಿದ್ದ ಮಾನಸಿಕ ಹತಾಶೆ ಹಾಗೂ ನಿರಾಶೆ ಕರಗಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಆಶಾಭಾವ ಮೂಡುತ್ತದೆ.",
          en: "Through Swayamvara Parvati beeja japa and Gauri-Shankara contemplation, subconscious anxiety around matrimonial delay dissolves within 10 days, instilling deep inner peace.",
          hi: "१० दिनों की साधना से विवाह विलंब को लेकर मन में छाई निराशा दूर होकर सकारात्मक ऊर्जा और आत्मविश्वास का संचार होगा।",
          te: "10 రోజుల స్వయంవర పార్వతీ జపంతో వివాహ ఆలస్యం గురించిన ఆందోళన తొలగి మనస్సుకు ఉత్సాహం లభిస్తుంది.",
          ta: "10 நாட்கள் வழிபாட்டால் திருமண தாமதம் குறித்த மனக்கவலை நீங்கி புதிய நம்பிக்கை பிறக்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಿಷ್ಠಾವಂತ ಸಾಧನೆಯ ನಂತರ ಕಂಕಣ ಬಲ ಜಾಗೃತಗೊಂಡು, ಅರ್ಹ ಸುಸಂಸ್ಕೃತ ಸಂಬಂಧಗಳಿಂದ ಸಕಾರಾತ್ಮಕ ಮಾತುಕತೆಗಳು ಪ್ರಾರಂಭವಾಗಿ, ವಿವಾಹ ನಿಶ್ಚಯಕ್ಕೆ ಮುನ್ನುಡಿ ಬರೆಯಲಿದೆ.",
          en: "By day 15, auspicious Kankana Bala awakens; prospective families initiate positive, dignified matchmaking dialogue leading toward an auspicious confirmed match.",
          hi: "१५ दिनों के बाद अनुकूल कंकण बल जागृत होकर सुयोग्य परिवारों से सकारात्मक विवाह प्रस्ताव आने लगेंगे।",
          te: "15 రోజుల తర్వాత శుభ కంకణ బలం చేకూరి మంచి సంబంధాలు కుదిరే మార్గం సుగమమవుతుంది.",
          ta: "15 நாட்களுக்குப் பிறகு நல்ல வரன் அமையக்கூடிய சுப பேச்சுவார்த்தைகள் சாதகமாக தொடங்கும்."
        }
      };

    case "debt_financial":
      return {
        astrologicalReason: {
          kn: "೨ನೇ ಧನ ಸ್ಥಾನ ಹಾಗೂ ೧೧ನೇ ಲಾಭ ಸ್ಥಾನದ ಮೇಲೆ ೬ನೇ ಋಣಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ದ್ರವ್ಯ ಹರಿವು ಕುಂಠಿತವಾಗಿ ಸಾಲದ ಹೊರೆ ಹೆಚ್ಚಿದೆ. ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಹಾಗೂ ಕನಕಧಾರಾ ಆರಾಧನೆಯು ಧನದ್ವಾರಗಳನ್ನು ತೆರೆಯುತ್ತದೆ.",
          en: "Friction between 2nd house of liquid wealth and 6th lord of debts constricts cash-flow. Runa Vimochana and Kanakadhara sadhana purify financial energy channels.",
          hi: "धन भाव पर षष्ठेश के प्रभाव से कर्ज की समस्या और आर्थिक रुकावटें आ रही हैं। ऋणविमोचन जप से धन प्रवाह सुगम होता है।",
          te: "ధన స్థానంపై 6వ అధిపతి ప్రభావం వలన రుణ సమస్యలు వస్తున్నాయి. ఋణవిమోచన జపంతో ఆర్థిక స్థిరత్వం లభిస్తుంది.",
          ta: "தன ஸ்தானத்தில் 6ம் அதிபதியின் தாக்கத்தால் கடன் சுமை கூடுகிறது. ருணவிமோசன பூஜையால் பணத்தடை நீங்கும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಸಾಲದ ಮರುಪಾವತಿಯಲ್ಲಿ ತಡೆ, ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳು, ಕೈಯಲ್ಲಿ ಹಣ ನಿಲ್ಲದಿರುವಿಕೆ & ಆರ್ಥಿಕ ಅಸಹಾಯಕತೆ.",
          en: "Before Remedy: Debt repayment stress, unpredictable expenses, wealth leaks & liquidity paralysis.",
          hi: "उपाय पूर्व: कर्ज चुकाने में कठिनाई, अप्रत्याशित खर्चे, धन का न टिकना एवं आर्थिक विवशता।",
          te: "పరిహారానికి ముందు: అప్పులు తీర్చడంలో ఇబ్బందులు, ఆకస్మిక ఖర్చులు మరియు ధన నష్టం.",
          ta: "பரிகாரத்திற்கு முன்: கடன் அடைப்பதில் சிரமம், எதிர்பாராத செலவுகள் மற்றும் பொருளாதார நெருக்கடி."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ನೂತನ ಆದಾಯ ಮೂಲಗಳು, ಸಾಲದ ಹೊರೆಯಿಂದ ಮುಕ್ತಿ, ಸ್ಥಿರ ಉಳಿತಾಯ & ಕುಬೇರ ಕೃಪೆಯ ಧನ ಸಮೃದ್ಧಿ.",
          en: "After Remedy: Unblocked receivables, systematic debt liquidation, stable surplus & enduring abundance.",
          hi: "उपाय पश्चात: नवीन आय स्रोत, ऋण मुक्ति, स्थिर बचत एवं धन-समृद्धि की प्राप्ति।",
          te: "పరిహారం తర్వాత: నూతన ఆదాయ వనరులు, రుణ విముక్తి, ధన నిల్వ మరియు సంపద వృద్ధి.",
          ta: "பரிகாரத்திற்கு பின்: புதிய வருமான வழிகள், கடன் தீருதல், நிலையான சேமிப்பு மற்றும் லட்சுமி கடாட்சம்."
        },
        day10Expectation: {
          kn: "ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಜಪ ಹಾಗೂ ಕನಕಧಾರಾ ಸ್ಮರಣೆಯಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಸಾಲದ ಒತ್ತಡದಿಂದ ಉಂಟಾಗಿದ್ದ ಆತಂಕ ಹಾಗೂ ನಿದ್ರಾಭಂಗ ಶಮನವಾಗಿ, ಹಣಕಾಸು ನಿರ್ವಹಣೆಯಲ್ಲಿ ನವ ಸ್ಪಷ್ಟತೆ ದೊರೆಯುತ್ತದೆ.",
          en: "Through Runa Vimochana and Kanakadhara recitations, nocturnal panic regarding debts clears within 10 days, restoring calm clarity in budget management.",
          hi: "१० दिनों की साधना से कर्ज के मानसिक दबाव और अनिद्रा से मुक्ति मिलकर आर्थिक विवेक और स्पष्टता प्राप्त होगी।",
          te: "10 రోజుల సాధనతో రుణాల గురించిన మానసిక ఒత్తిడి తగ్గి ఆర్థిక ప్రణాళికపై స్పష్టత వస్తుంది.",
          ta: "10 நாட்கள் வழிபாட்டால் கடன் தொல்லையால் உண்டான தூக்கமின்மையும் பதற்றமும் நீங்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಬಾಕಿ ಉಳಿದಿದ್ದ ಹಣದ ಹರಿವು, ನೂತನ ಆದಾಯ ಮಾರ್ಗಗಳು ಅಥವಾ ಸಾಲ ಮರುಪಾವತಿಗೆ ಸುಲಭ ಮಾರ್ಗಗಳು ಗೋಚರಿಸಿ, ಆರ್ಥಿಕ ಉಸಿರಾಟಕ್ಕೆ ದಾರಿ ಮಾಡಿಕೊಡಲಿದೆ.",
          en: "By day 15, frozen payments release, fresh commercial revenue streams open, or viable debt relief terms materialize to restore financial breathing room.",
          hi: "१५ दिनों के पश्चात रुका हुआ धन प्राप्त होने लगेगा एवं नए आय के स्रोतों से कर्ज मुक्ति का मार्ग प्रशस्त होगा।",
          te: "15 రోజుల తర్వాత మొండి బకాయిలు వసూలవుతాయి మరియు నూతన ఆదాయ మార్గాలు తెరుచుకుంటాయి.",
          ta: "15 நாட்களுக்குப் பிறகு வரவேண்டிய பாக்கிகள் வசூலாகி புதிய வருமான வழிகள் பிறக்கும்."
        }
      };

    case "relationship_friction":
      return {
        astrologicalReason: {
          kn: "೭ನೇ ಕಳತ್ರ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ-ಕೇತು ಅಥವಾ ರಾಹುವಿನ ದೃಷ್ಟಿಯಿಂದ ಪರಸ್ಪರ ಸಂವಹನದಲ್ಲಿ ಅಪಾರ್ಥ ಹಾಗೂ ಕ್ಷುಲ್ಲಕ ವಾದಗಳು ತಲೆದೋರುತ್ತಿವೆ. ಉಮಾ-ಮಹೇಶ್ವರ ಆರಾಧನೆಯು ಹೃದಯ ಚಕ್ರದ ಸಾಮರಸ್ಯವನ್ನು ಪುನರುಜ್ಜೀವನಗೊಳಿಸುತ್ತದೆ.",
          en: "Malefic aspect on 7th house creates sudden emotional reactivity and miscommunications between partners. Uma-Maheshwara seva revitalizes heart chakra coherence.",
          hi: "सप्तम भाव पर पाप दृष्टि के कारण दांपत्य जीवन में कलह और मतभेद उत्पन्न हो रहे हैं। उमा-महेश्वर पूजा से प्रेम बढ़ता है।",
          te: "7వ స్థానంలో గ్రహాల ప్రభావం వలన భార్యాభర్తల మధ్య విభేదాలు వస్తున్నాయి. ఉమా-మహేశ్వర పూజతో శాంతి లభిస్తుంది.",
          ta: "7ம் இடத்தில் உள்ள தோஷத்தால் தம்பதியரிடையே வாக்குவாதம் வருகிறது. உமா-மஹேஸ்வர வழிபாட்டால் அன்பு பெருகும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಕ್ಷುಲ್ಲಕ ಮಾತುಗಳಿಗೂ ಮನಸ್ತಾಪ, ದಾಂಪತ್ಯದಲ್ಲಿ ಅಂತರ, ಪರಸ್ಪರ ಅನುಮಾನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ.",
          en: "Before Remedy: Sudden misunderstandings over minor matters, emotional distance, resentment & domestic unrest.",
          hi: "उपाय पूर्व: छोटी बातों पर तकरार, दांपत्य में दूरी, अविश्वास एवं पारिवारिक अशांति।",
          te: "పరిహారానికి ముందు: చిన్న విషయాలకే గొడవలు, అనుమానాలు మరియు కుటుంబంలో అశాంతి.",
          ta: "பரிகாரத்திற்கு முன்: சிறு விஷயங்களுக்கும் மனக்கசப்பு, இடைவெளி மற்றும் குடும்பத்தில் நிம்மதியின்மை."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಪರಸ್ಪರ ಪ್ರೇಮ, ವಿಶ್ವಾಸದ ಸಂವಹನ, ದಾಂಪತ್ಯದಲ್ಲಿ ಗಾಢ ಹೊಂದಾಣಿಕೆ & ಸದಾ ನಗುಮೊಗದ ಕುಟುಂಬ ಸೌಖ್ಯ.",
          en: "After Remedy: Deep reciprocal tenderness, transparent communication, empathetic patience & matrimonial bliss.",
          hi: "उपाय पश्चात: प्रगाढ़ प्रेम, विश्वासपूर्ण संवाद, दांपत्य सामंजस्य एवं परिवार में सुख-शांति।",
          te: "పరిహారం తర్వాత: అన్యోన్య దాంపత్యం, పరస్పర గౌరవం మరియు సంతోషకరమైన కుటుంబ జీవనం.",
          ta: "பரிகாரத்திற்கு பின்: தம்பதியரிடையே அன்யோன்யம், பரஸ்பர நம்பிக்கை மற்றும் மகிழ்ச்சியான இல்லறம்."
        },
        day10Expectation: {
          kn: "ಉಮಾ-ಮಹೇಶ್ವರ ಮಂತ್ರ ಪಠಣ ಹಾಗೂ ಕಡ್ಡಾಯ ಮೌನ ಪಾಲನೆಯಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಕ್ಷುಲ್ಲಕ ಕಾರಣಗಳಿಗೆ ರೇಗಾಡುವ ಪ್ರವೃತ್ತಿ ನಿಂತು, ಮನೆಯಲ್ಲಿ ಶಾಂತಿಯ ವಾತಾವರಣ ನೆಲೆಸುತ್ತದೆ.",
          en: "Daily Uma-Maheshwara japa and brief silence pauses defuse reactive emotional flare-ups within 10 days, resetting domestic tranquility.",
          hi: "१० दिनों के नियमित जप एवं मौन अभ्यास से छोटी-छोटी बातों पर होने वाला विवाद रुककर घर में शांति का वातावरण बनेगा।",
          te: "10 రోజుల సాధనతో క్షణికావేశంలో వచ్చే వాదనలు ఆగిపోయి ఇంట్లో ప్రశాంతత నెలకొంటుంది.",
          ta: "10 நாட்கள் வழிபாட்டால் வீண் வாக்குவாதங்கள் நின்று குடும்பத்தில் அமைதி நிலவும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಸಂಗಾತಿಯಲ್ಲಿ ಪೂರ್ವಾಗ್ರಹಗಳು ಕರಗಿ, ಪ್ರೀತಿ ಮತ್ತು ವಿಶ್ವಾಸದಿಂದ ಕೂಡಿದ ಮುಕ್ತ ಸಂಭಾಷಣೆ ಆರಂಭವಾಗಿ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಮಧುರ ನವಚೈತನ್ಯ ಮೂಡಲಿದೆ.",
          en: "By day 15, past resentments evaporate; vulnerable, loving dialogue resumes naturally, rekindling romantic warmth and mutual understanding.",
          hi: "१५ दिनों के उपरांत जीवनसाथी के साथ परस्पर विश्वास और प्रेम पुनः प्रगाढ़ होकर दांपत्य में सुख-शांति लौटेगी।",
          te: "15 రోజుల తర్వాత దంపతుల మధ్య అపార్థాలు తొలగి పరస్పర ప్రేమానురాగాలు బలపడతాయి.",
          ta: "15 நாட்களுக்குப் பிறகு தம்பதியரிடையே பரஸ்பர அன்பும் புரிதலும் மீண்டும் மலரும்."
        }
      };

    case "health_vitality":
      return {
        astrologicalReason: {
          kn: "ಲಗ್ನಾಧಿಪತಿ ಅಥವಾ ರವಿ ಗ್ರಹವು ದುಸ್ಥಾನದಲ್ಲಿದ್ದು ಶನಿ ಪ್ರಭಾವಕ್ಕೆ ಒಳಗಾಗಿರುವುದರಿಂದ ಪ್ರಾಣಶಕ್ತಿ ಕ್ಷೀಣಿಸಿ ಆಯಾಸ ಉಂಟಾಗುತ್ತಿದೆ. ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪವು ಕೋಶ ಮಟ್ಟದಲ್ಲಿ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಪುನರುಜ್ಜೀವನಗೊಳಿಸುತ್ತದೆ.",
          en: "Debilitated or Dusthana placed Ascendant Lord/Sun drains physical vitality. Mahamrityunjaya shanti accelerates cellular cellular rejuvenation and immune defense.",
          hi: "लग्नेश अथवा सूर्य के दुर्बल होने से प्राणशक्ति क्षीण होती है। महामृत्युंजय अनुष्ठान से आरोग्य और दीर्घायु की प्राप्ति होती है।",
          te: "లగ్నాధిపతి లేదా సూర్యుడు బలహీనపడటం వలన శారీరక నీరసం వస్తుంది. మహామృత్యుంజయ జపంతో ఆరోగ్యం చేకూరుతుంది.",
          ta: "லக்னாதிபதி பலவீனமாக இருப்பதால் உடல் சோர்வு உண்டாகிறது. மகா மிருத்யுஞ்சய பூஜையால் ஆரோக்கியம் மேம்படும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಸದಾ ದೈಹಿಕ ಆಯಾಸ, ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯ ಕುಂಠಿತ, ಜೀರ್ಣಾಂಗ ತೊಂದರೆ ಹಾಗೂ ಅತಿಯಾದ ಸುಸ್ತು.",
          en: "Before Remedy: Chronic lethargy, slow convalescence, digestive sluggishness & physical vulnerability.",
          hi: "उपाय पूर्व: निरंतर शारीरिक थकान, दुर्बल रोग प्रतिरोधक क्षमता, पाचन विकार एवं सुस्ती।",
          te: "పరిహారానికి ముందు: శరీర అలసట, రోగ నిరోధక శక్తి లోపం మరియు జీర్ణ సమస్యలు.",
          ta: "பரிகாரத்திற்கு முன்: தொடர் உடல் சோர்வு, குறைந்த நோய் எதிர்ப்பு சக்தி மற்றும் பலவீனம்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಉಕ್ಕಿ ಹರಿಯುವ ನವಚೈತನ್ಯ, ಸದೃಢ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ, ದೀರ್ಘಾಯುಷ್ಯ & ಉತ್ಸಾಹಭರಿತ ದೈನಂದಿನ ಜೀವನ.",
          en: "After Remedy: Radiant cellular vitality, fortified immune resilience, longevity & boundless energy.",
          hi: "उपाय पश्चात: नवचेतना का संचार, सुदृढ़ रोग प्रतिरोधक क्षमता, दीर्घायु एवं स्फूर्तिवान जीवन।",
          te: "పరిహారం తర్వాత: శరీర దృఢత్వం, వ్యాధి నిరోధక శక్తి పెరుగుదల మరియు సంపూర్ణ ఆరోగ్యం.",
          ta: "பரிகாரத்திற்கு பின்: பூரண ஆரோக்கியம், வலிமையான நோய் எதிர்ப்பு சக்தி மற்றும் புத்துணர்ச்சி."
        },
        day10Expectation: {
          kn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ ಹಾಗೂ ಪ್ರಾತಃ ಸೂರ್ಯ ನಮಸ್ಕಾರದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ನಿರಂತರ ಕಾಡುತ್ತಿದ್ದ ದೇಹದ ಆಯಾಸ, ಜಡತ್ವ ಮತ್ತು ತಲೆನೋವು ಶಮನವಾಗಿ ನವಪ್ರಾಣಬಲ ಜಾಗೃತವಾಗುತ್ತದೆ.",
          en: "With daily Mahamrityunjaya chanting and dawn solar salutations, chronic muscular lethargy and mental heaviness lift within 10 days, resetting circadian vigor.",
          hi: "१० दिनों में महामृत्युंजय जप से शारीरिक थकान, सुस्ती और सिरदर्द दूर होकर नई स्फूर्ति का अनुभव होगा।",
          te: "10 రోజుల్లో శరీర అలసట మరియు నిస్సత్తువ తగ్గి నూతన ఉత్సాహం లభిస్తుంది.",
          ta: "10 நாட்களில் உடல் சோர்வு மற்றும் மந்தநிலை நீங்கி புத்துணர்ச்சி உண்டாகும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಗಣನೀಯವಾಗಿ ಹೆಚ್ಚಿ, ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು ಹತೋಟಿಗೆ ಬಂದು, ದಿನಪೂರ್ತಿ ಲವಲವಿಕೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಉತ್ಸಾಹ ಲಭಿಸಲಿದೆ.",
          en: "By day 15, cellular immune resilience rebounds; nagging ailments stabilize into equilibrium, restoring all-day sustained enthusiasm for daily life.",
          hi: "१५ दिनों के बाद रोग प्रतिरोधक क्षमता सुदृढ़ होकर पुरानी व्याधियां नियंत्रित होंगी एवं ऊर्जावान अनुभव होगा।",
          te: "15 రోజుల తర్వాత రోగనిరోధక శక్తి పెరిగి దీర్ఘకాలిక సమస్యలు అదుపులోకి వస్తాయి.",
          ta: "15 நாட்களுக்குப் பிறகு நோய் எதிர்ப்பு சக்தி அதிகரித்து நீண்ட நாள் உபாதைகள் குணமாகும்."
        }
      };

    case "legal_confinement":
      return {
        astrologicalReason: {
          kn: "೬ನೇ ಶತ್ರು ಹಾಗೂ ೧೨ನೇ ಬಂಧನ ಸ್ಥಾನಗಳ ಮೇಲಿನ ಪ್ರತಿಕೂಲ ಗ್ರಹ ಸಂಚಾರದಿಂದ ವ್ಯಾಜ್ಯಗಳು ಕಾಡುತ್ತಿವೆ. ಸುದರ್ಶನ ನರಸಿಂಹ ರಕ್ಷಾ ಕವಚವು ಶತ್ರು ಬಾಧೆಯನ್ನು ಭೇದಿಸಿ ನ್ಯಾಯವನ್ನು ಒದಗಿಸುತ್ತದೆ.",
          en: "Adverse transit on 6th/12th axis creates bureaucratic friction and contentious disputes. Sudarshana Narasimha establishes an impregnable spiritual armor.",
          hi: "षष्ठ एवं द्वादश भाव के प्रतिकूल प्रभाव से कोर्ट-कचहरी और शत्रु बाधा हो रही है। नृसिंह कवच से विजय प्राप्त होती है।",
          te: "6, 12వ స్థానాల ప్రభావం వలన చట్టపరమైన సమస్యలు వస్తున్నాయి. సుదర్శన నరసింహ జపంతో రక్షణ లభిస్తుంది.",
          ta: "6 மற்றும் 12ம் இடங்களின் தாக்கத்தால் வழக்கு விவகாரங்கள் ஏற்படுகின்றன. சுதர்சன நரசிம்மர் வழிபாட்டால் வெற்றி கிட்டும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಕೋರ್ಟ್-ಕಚೇರಿ ಅಲೆದಾಟ, ವಂಚನೆಯ ಭೀತಿ, ಕಂಟಕಗಳು ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಒತ್ತಡ.",
          en: "Before Remedy: Courtroom gridlock, fear of betrayal, hostile audit pressure & sleepless anxiety.",
          hi: "उपाय पूर्व: मुकदमों की चिंता, धोखे का भय, कानूनी अड़चनें एवं प्रशासनिक दबाव।",
          te: "పరిహారానికి ముందు: కోర్టు వివాదాలు, మోసపోయే భయం మరియు తీవ్రమైన ఒత్తిడి.",
          ta: "பரிகாரத்திற்கு முன்: வழக்கு இழுபறி, எதிர்ப்புகள் மற்றும் நிர்வாக ரீதியான மன உளைச்சல்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ನ್ಯಾಯಾಲಯ ವ್ಯಾಜ್ಯಗಳಿಂದ ಮುಕ್ತಿ, ಸತ್ಯಕ್ಕೆ ವಿಜಯ, ಶತ್ರು ದಮನ & ಸಮಾಜದಲ್ಲಿ ನಿರ್ಭಯ ಪ್ರತಿಷ್ಠೆ.",
          en: "After Remedy: Complete legal exoneration, truth vindication, dissolution of hostility & unassailable peace.",
          hi: "उपाय पश्चात: मुकदमों से मुक्ति, सत्य की विजय, शत्रु शमन एवं समाज में निष्कलंक प्रतिष्ठा।",
          te: "పరిహారం తర్వాత: వివాదాల పరిష్కారం, న్యాయ విజయం మరియు శత్రు బాధల నివారణ.",
          ta: "பரிகாரத்திற்கு பின்: வழக்குகளில் வெற்றி, எதிர்ப்புகள் தணிதல் மற்றும் கவுரவமான வாழ்க்கை."
        },
        day10Expectation: {
          kn: "ಸುದರ್ಶನ ನರಸಿಂಹ ಜಪದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ನ್ಯಾಯಾಲಯ ಅಥವಾ ವಿವಾದಗಳಿಂದ ಕಾಡುತ್ತಿದ್ದ ಭಯ, ಅಸುರಕ್ಷತೆ ಮತ್ತು ಗೊಂದಲಗಳು ಶಮನವಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ದೃಢತೆ ಮೂಡುತ್ತದೆ.",
          en: "Daily Sudarshana Narasimha recitation neutralizes subconscious courtroom panic within 10 days, instilling solid internal fortitude.",
          hi: "१० दिनों में सुदर्शन नृसिंह जप से कानूनी विवादों का मानसिक भय और चिंता दूर होकर आत्मबल सुदृढ़ होगा।",
          te: "10 రోజుల్లో సుదర్శన నరసింహ జపంతో వివాదాల గురించిన భయం తగ్గి మనస్సు దృఢపడుతుంది.",
          ta: "10 நாட்களில் சுதர்சன நரசிம்மர் ஜெபத்தால் வழக்கு விவகார பயம் நீங்கி தைரியம் கூடும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ವಿರೋಧಿಗಳ ಕುತಂತ್ರಗಳು ವಿಫಲವಾಗಿ, ವಕೀಲರು ಹಾಗೂ ಅಧಿಕಾರಿಗಳಿಂದ ಅನುಕೂಲಕರ ಬೆಳವಣಿಗೆಗಳು ಕಂಡುಬಂದು ಸತ್ಯಕ್ಕೆ ಜಯ ಲಭಿಸುವ ಸ್ಪಷ್ಟ ಹಾದಿ ಗೋಚರಿಸಲಿದೆ.",
          en: "By day 15, adversary hostility weakens; legal counsel and officials signal favorable proceedings, paving the way for righteous vindication.",
          hi: "१५ दिनों के बाद विरोधी पक्ष का प्रभाव क्षीण होकर न्याय प्रक्रिया में सकारात्मक प्रगति दृष्टिगोचर होगी।",
          te: "15 రోజుల తర్వాత ప్రత్యర్థుల ఒత్తిడి తగ్గి న్యాయపరమైన విషయాలలో అనుకూల ఫలితాలు కనిపిస్తాయి.",
          ta: "15 நாட்களுக்குப் பிறகு எதிர்ப்புகள் தணிந்து நியாயமான தீர்வுக்கான சாதகமான சூழல் உருவாகும்."
        }
      };

    case "leadership_expansion":
      return {
        astrologicalReason: {
          kn: "೧೦ನೇ ರಾಜ್ಯ-ಕರ್ಮ ಸ್ಥಾನದಲ್ಲಿ ಬಲಿಷ್ಠ ರಾಜಯೋಗವಿದ್ದು, ಉನ್ನತ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಬೃಹತ್ ನಿರ್ಧಾರಗಳ ಹೊರೆ ಹೆಗಲೇರಿದೆ. ರಾಜಯೋಗ ಮಹಾಪೂಜೆಯು ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸತ್ಯ-ಧರ್ಮದ ಸ್ಪಷ್ಟತೆ ನೀಡುತ್ತದೆ.",
          en: "Strong 10th house Raja Yoga elevates executive governance and enterprise scale. Grounded spiritual sadhana sustains clarity under massive responsibility.",
          hi: "दशम भाव में राजयोग के कारण उच्च नेतृत्व का दायित्व है। नित्य साधना से निर्णयों में स्पष्टता और यश प्राप्त होता है।",
          te: "10వ స్థానంలో రాజయోగం వలన ఉన్నత నాయకత్వ బాధ్యతలు లభించాయి. పూజలతో వివేకం మరియు విజయం చేకూరుతాయి.",
          ta: "10ம் இடத்தில் உள்ள ராஜயோகத்தால் உயர்ந்த தலைமை பொறுப்பு கிடைத்துள்ளது. வழிபாட்டால் நிர்வாக தெளிவு உண்டாகும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಅತಿಯಾದ ಜವಾಬ್ದಾರಿಗಳ ಒತ್ತಡ, ನಿರ್ಧಾರಗಳಲ್ಲಿ ಆಯಾಸ, ಸಾರ್ವಜನಿಕ ನಿರೀಕ್ಷೆಗಳ ಹೊರೆ.",
          en: "Before Remedy: Executive burnout, high-stakes decision fatigue & overwhelming public expectations.",
          hi: "उपाय पूर्व: अत्यधिक उत्तरदायित्वों का बोझ, निर्णय लेने में मानसिक थकान एवं तनाव।",
          te: "పరిహారానికి ముందు: బాధ్యతల భారం, నిర్ణయాల్లో అలసట మరియు తీవ్రమైన ఒత్తిడి.",
          ta: "பரிகாரத்திற்கு முன்: பொறுப்புகளின் அழுத்தம், முடிவெடுப்பதில் தயக்கம் மற்றும் மன சோர்வு."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಅಪ್ರತಿಹತ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ, ಜಾಗತಿಕ ವಿಸ್ತರಣೆ, ಧರ್ಮ ಮಾರ್ಗದ ನಿರ್ಧಾರ & ಅಖಂಡ ಯಶಸ್ಸು.",
          en: "After Remedy: Visionary enterprise leadership, institutional expansion, dharmic clarity & global acclaim.",
          hi: "उपाय पश्चात: प्रभावशाली नेतृत्व, संस्थागत विस्तार, धर्मसम्मत निर्णय एवं सर्वतोमुखी ख्याति।",
          te: "పరిహారం తర్వాత: అద్భుతమైన నాయకత్వ పటిమ, వ్యాపార విస్తరణ మరియు ఉన్నత కీర్తి.",
          ta: "பரிகாரத்திற்கு பின்: சிறந்த தலைமைத்துவ பண்பு, தொழில் மேன்மை மற்றும் உலகளாவிய புகழ்."
        },
        day10Expectation: {
          kn: "ರಾಜಯೋಗ ಸಂಪದ ಧ್ಯಾನದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಅಪಾರ ಜವಾಬ್ದಾರಿಗಳ ಒತ್ತಡ ಕಡಿಮೆಯಾಗಿ, ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವಲ್ಲಿ ಅದ್ಭುತ ಸ್ಪಷ್ಟತೆ ಮತ್ತು ದೈವಿಕ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
          en: "Through Raja Yoga meditation, executive mental overload clears within 10 days, restoring sharp tactical decision clarity under pressure.",
          hi: "१० दिनों में उच्च निर्णयों का तनाव कम होकर नेतृत्व क्षमता में अपूर्व स्पष्टता और शांति का संचार होगा।",
          te: "10 రోజుల్లో అధిక బాధ్యతల ఒత్తిడి తగ్గి సరైన నిర్ణయాలు తీసుకునే వివేకం కలుగుతుంది.",
          ta: "10 நாட்களில் அதிக பொறுப்புகளின் மன அழுத்தம் குறைந்து தெளிவான நிர்வாக முடிவு எடுக்க இயலும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಸಾಂಸ್ಥಿಕ ವಿಸ್ತರಣೆ, ಬೃಹತ್ ಯೋಜನೆಗಳು ಅಥವಾ ಹೂಡಿಕೆಗಳಿಗೆ ನೂತನ ದಾರಿಗಳು ತೆರೆದುಕೊಂಡು, ತಂಡದ ನಂಬಿಕೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ ಉತ್ತುಂಗಕ್ಕೇರಲಿದೆ.",
          en: "By day 15, high-stakes enterprise ventures unlock positive traction; stakeholder trust deepens, scaling organizational influence.",
          hi: "१५ दिनों के उपरांत संस्थागत विस्तार एवं बड़े निवेशों के मार्ग प्रशस्त होकर सर्वत्र मान-सम्मान बढ़ेगा।",
          te: "15 రోజుల తర్వాత వ్యాపార విస్తరణకు నూతన అవకాశాలు లభించి సమాజంలో గౌరవం పెరుగుతుంది.",
          ta: "15 நாட்களுக்குப் பிறகு தொழில் விரிவாக்க வாய்ப்புகள் மலர்ந்து நற்பெயரும் புகழும் உயரும்."
        }
      };

    case "creative_stardom":
      return {
        astrologicalReason: {
          kn: "೫ನೇ ಕಲಾ-ಪ್ರತಿಭಾ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಬುಧರ ಯೋಗವು ಲಕ್ಷಾಂತರ ಅಭಿಮಾನಿಗಳನ್ನು ಆಕರ್ಷಿಸುತ್ತಿದೆ. ಸರಸ್ವತಿ-ಲಕ್ಷ್ಮೀ ಗಾನ-ಕಲಾ ಆರಾಧನೆಯು ದೃಷ್ಟಿದೋಷ ನಿವಾರಿಸಿ ನಿರಂತರ ಸೃಜನಶೀಲ ಹರಿವನ್ನು ನೀಡುತ್ತದೆ.",
          en: "Brilliant 5th house Venus-Mercury creativity commands mass public love. Sacred sadhana shields against public evil eye and sustains artistic genius.",
          hi: "पंचम कला भाव एवं शुक्र के प्रभाव से जनप्रियता प्राप्त है। साधना से दृष्टि दोष निवारण एवं कलात्मक उन्नति होती है।",
          te: "5వ కళా స్థానం వలన విశేష ప్రజాదరణ లభించింది. పూజలతో దిష్టి దోషాలు తొలగి నూతన సృజన సాధ్యమవుతుంది.",
          ta: "5ம் கலை ஸ்தானத்தின் பலத்தால் பெரும் புகழ் கிடைத்துள்ளது. வழிபாட்டால் திருஷ்டி தோஷங்கள் நீங்கி திறமை ஒளிரும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಸೃಜನಶೀಲತೆಯ ಮಂಕು (Creative Block), ದೃಷ್ಟಿದೋಷ, ಸಾರ್ವಜನಿಕ ಟೀಕೆಗಳ ಆತಂಕ.",
          en: "Before Remedy: Creative creative blocks, vulnerability to public envy, performance apprehension.",
          hi: "उपाय पूर्व: रचनात्मक अवरोध, नजर दोष एवं जनआलोचना का मानसिक भय।",
          te: "పరిహారానికి ముందు: సృజనాత్మకత తగ్గడం, దిష్టి దోషాలు మరియు విమర్శల భయం.",
          ta: "பரிகாரத்திற்கு முன்: கற்பனை வறட்சி, கண் திருஷ்டி மற்றும் விமர்சன பயம்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ನವನವೀನ ಕಲಾ ಸೃಷ್ಟಿ, ಜಾಗತಿಕ ರಸಿಕರ ಅಖಂಡ ಪ್ರೀತಿ, ದೈವಿಕ ರಕ್ಷೆ & ಸಾರ್ವಕಾಲಿಕ ಕೀರ್ತಿ.",
          en: "After Remedy: Effortless artistic breakthroughs, deep audience resonance, psychic armor & enduring eminence.",
          hi: "उपाय पश्चात: नवीन कलात्मक सजन, जनप्रियता का विस्तार, दैवीय रक्षा एवं चिरस्थायी कीर्ति।",
          te: "పరిహారం తర్వాత: అద్భుతమైన కళా సృష్టి, ప్రేక్షకుల విశేష ఆదరణ మరియు చిరకాల కీర్తి.",
          ta: "பரிகாரத்திற்கு பின்: புதுமையான கலைப்படைப்பு, மக்கள் செல்வாக்கு மற்றும் நீடித்த புகழ்."
        },
        day10Expectation: {
          kn: "ಸರಸ್ವತಿ-ಲಕ್ಷ್ಮೀ ಧ್ಯಾನದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಕಲ್ಪನಾ ಶಕ್ತಿಯ ಮಂಕು ದೂರವಾಗಿ, ಸೃಜನಶೀಲ ನವೀನ ಚಿಂತನೆಗಳು ಸರಾಗವಾಗಿ ಹರಿಯಲು ಪ್ರಾರಂಭಿಸುತ್ತವೆ.",
          en: "Through Saraswati-Lakshmi contemplation, creative mental friction clears within 10 days, releasing fresh, joyful imaginative momentum.",
          hi: "१० दिनों में रचनात्मक अवरोध दूर होकर कला और लेखन में नवीन विचारों का सहज प्रवाह होगा।",
          te: "10 రోజుల్లో సృజనాత్మక ఆలోచనలు పెరిగి కళారంగంలో నూతన ఉత్సాహం లభిస్తుంది.",
          ta: "10 நாட்களில் கற்பனை வளம் பெருகி புதிய கலைப்படைப்புகளை உருவாக்கும் திறன் வளரும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ನಿಮ್ಮ ಸೃಷ್ಟಿಗೆ ಅಪಾರ ಪ್ರಶಂಸೆ, ನೂತನ ಅವಕಾಶಗಳು ಅಥವಾ ಸಾರ್ವಜನಿಕ ಮಾಧ್ಯಮಗಳಲ್ಲಿ ಅಗಾಧ ಜನಪ್ರಿಯತೆ ಒಲಿಯಲಿದೆ.",
          en: "By day 15, your creative expressions gain widespread acclaim; lucrative contracts and prestigious opportunities open effortlessly.",
          hi: "१५ दिनों के बाद आपकी रचनाओं को अपार जनसमर्थन, पुरस्कार एवं नवीन कलात्मक अवसर प्राप्त होंगे।",
          te: "15 రోజుల తర్వాత మీ సృజనలకు విశేష ప్రజాదరణ మరియు నూతన అవకాశాలు లభిస్తాయి.",
          ta: "15 நாட்களுக்குப் பிறகு உங்களது படைப்புகளுக்கு பெரும் பாராட்டும் புதிய வாய்ப்புகளும் குவியும்."
        }
      };

    case "elite_sports":
      return {
        astrologicalReason: {
          kn: "೩ನೇ ಪರಾಕ್ರಮ ಹಾಗೂ ೬ನೇ ಸ್ಪರ್ಧಾತ್ಮಕ ವಿಜಯ ಸ್ಥಾನದಲ್ಲಿ ಕುಜ-ರವಿ ಗ್ರಹಗಳ ತೇಜಸ್ಸಿದ್ದು, ಮೈದಾನದಲ್ಲಿ ಅಸಾಧಾರಣ ಶಕ್ತಿ ಒಲಿಯುತ್ತಿದೆ. ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆಯು ಸ್ನಾಯುಗಳ ಗಾಯಗಳಿಂದ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.",
          en: "Vigorous Mars-Sun configurations in 3rd/6th houses fuel competitive athletic stamina. Subrahmanya sadhana protects muscles and seals victory.",
          hi: "तृतीय एवं षष्ठ भाव में मंगल-सूर्य के बल से खेलकूद में पराक्रम प्राप्त है। सुब्रह्मण्य साधना से विजय एवं आरोग्य मिलता है।",
          te: "3, 6వ స్థానాలలో కుజ-సూర్య బలంతో క్రీడల్లో అద్భుత ప్రతిభ లభిస్తుంది. సుబ్రహ్మణ్య పూజతో రక్షణ చేకూరుతుంది.",
          ta: "3 மற்றும் 6ம் இடங்களில் செவ்வாய்-சூரியன் பலத்தால் விளையாட்டில் வெற்றி கிட்டும். சுப்பிரமணியர் வழிபாடு காக்கும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಸ್ನಾಯುಗಳ ಆಯಾಸ, ಪಂದ್ಯಾವಳಿಯ ಮುನ್ನ ನಡುಕ, ಗಾಯಗಳ ಭಯ ಹಾಗೂ ದೈಹಿಕ ದಣಿವು.",
          en: "Before Remedy: Muscle stiffness, pre-match nervous tension, injury vulnerability & physical exhaustion.",
          hi: "उपाय पूर्व: मांसपेशियों में खिंचाव, मैच पूर्व घबराहट, चोट का भय एवं शारीरिक थकान।",
          te: "పరిహారానికి ముందు: కండరాల నొప్పులు, పోటీల భయం మరియు శారీరక అలసట.",
          ta: "பரிகாரத்திற்கு முன்: தசை பிடிப்பு, போட்டிகளுக்கு முன் பதற்றம் மற்றும் காயம் ஏற்படும் பயம்."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಅದಮ್ಯ ದೈಹಿಕ ಶಕ್ತಿ, ಮೈದಾನದಲ್ಲಿ ಅಸಾಧಾರಣ ಚುರುಕುತನ, ಚಾಂಪಿಯನ್ ಕಿರೀಟ & ಅಖಂಡ ವಿಜಯ.",
          en: "After Remedy: Unshakable physical endurance, lightning reflexes, championship victory & physical invincibility.",
          hi: "उपाय पश्चात: अद्वितीय शारीरिक सहनशक्ति, तीव्र सजगता, चैंपियनशिप विजय एवं अटूट पराक्रम।",
          te: "పరిహారం తర్వాత: అమోఘమైన శరీర బలం, చురుకుదనం మరియు క్రీడల్లో ఛాంపియన్ విజయాలు.",
          ta: "பரிகாரத்திற்கு பின்: அபார உடல் வலிமை, சுறுசுறுப்பு, சாம்பியன் பட்டம் மற்றும் தொடர் வெற்றிகள்."
        },
        day10Expectation: {
          kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ತೇಜಸ್ಸು ಧ್ಯಾನದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ದೈಹಿಕ ಸ್ನಾಯುಗಳ ಬಿಗಿತ, ಆಯಾಸ ಹಾಗೂ ಸ್ಪರ್ಧಾ ಆತಂಕ ಶಮನವಾಗಿ ದೇಹದಲ್ಲಿ ಸಮತೋಲಿತ ಲವಲವಿಕೆ ಮರಳುತ್ತದೆ.",
          en: "Through Subrahmanya Tejas focus, athletic muscle recovery accelerates within 10 days, clearing pre-tournament nervous adrenaline.",
          hi: "१० दिनों में मांसपेशियों की थकान और प्रतियोगिता का तनाव दूर होकर शरीर में स्फूर्ति का संचार होगा।",
          te: "10 రోజుల్లో కండరాల అలసట మరియు పోటీ భయం తగ్గి శరీరంలో చురుకుదనం పెరుగుతుంది.",
          ta: "10 நாட்களில் தசை சோர்வு நீங்கி போட்டிகளில் பங்கேற்கும் புது வேகம் பிறக்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಮೈದಾನದಲ್ಲಿ ಅಸಾಧಾರಣ ಸಹಿಷ್ಣುತೆ ಮತ್ತು ಗಮನಾರ್ಹ ಕೌಶಲ್ಯ ಪ್ರದರ್ಶನ ಕಂಡುಬಂದು, ಮುಂಬರುವ ಪಂದ್ಯಾವಳಿಗಳಲ್ಲಿ ಜಯಭೇರಿ ಬಾರಿಸುವ ಆತ್ಮವಿಶ್ವಾಸ ಸ್ಥಾಪನೆಯಾಗಲಿದೆ.",
          en: "By day 15, physical stamina aligns for peak performance; tactical instincts ignite, securing match-winning tournament triumphs.",
          hi: "१५ दिनों के पश्चात खेल के मैदान में अद्वितीय सहनशक्ति और कौशल के साथ विजय का मार्ग प्रशस्त होगा।",
          te: "15 రోజుల తర్వాత ఆటల్లో విశేష నైపుణ్యం కనబరచి విజయాలు సాధించే ధైర్యం చేకూరుతుంది.",
          ta: "15 நாட்களுக்குப் பிறகு விளையாட்டில் அசாதாரண திறமையை வெளிப்படுத்தி வெற்றி பெறும் நிலை உண்டாகும்."
        }
      };

    case "mental_anxiety":
      return {
        astrologicalReason: {
          kn: "ಮನಃಕಾರಕ ಚಂದ್ರನ ಕ್ಷೀಣತೆ ಹಾಗೂ ರಾಹು/ಕೇತು ಪ್ರಭಾವದಿಂದಾಗಿ ಅತಿಯಾದ ಯೋಚನೆಗಳು ಮತ್ತು ನಿದ್ರಾಭಂಗ ಉಂಟಾಗುತ್ತಿದೆ. ಚಂದ್ರಶೇಖರ ಅಷ್ಟಕ ಹಾಗೂ ಕ್ಷೀರಾರ್ಪಣೆಯಿಂದ ಮಾನಸಿಕ ಅಲೆಗಳು ತಂಪಾಗಿ ಶಾಂತವಾಗುತ್ತವೆ.",
          en: "Afflicted Moon and Rahu nodal turbulence destabilize emotional currents, causing overthinking and sleep dips. Chandrashekhara shanti anchors mental tranquility.",
          hi: "चन्द्रमा पर राहु-केतु के प्रभाव से अत्यधिक सोच एवं अनिद्रा होती है। चन्द्रशेखर अष्टक से मानसिक शांति प्राप्त होती है।",
          te: "చంద్రుని బలహీనత వలన అధిక ఆలోచనలు మరియు నిద్రలేమి వస్తాయి. చంద్రశేఖర అష్టకంతో మనశ్శాంతి లభిస్తుంది.",
          ta: "சந்திரனின் பலவீனத்தால் அதிக கவலையும் தூக்கமின்மையும் ஏற்படுகிறது. சந்திரசேகர அஷ்டகத்தால் மன அமைதி உண்டாகும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ನಡುರಾತ್ರಿಯ ಅತಿಯಾದ ಯೋಚನೆ, ಭವಿಷ್ಯದ ಅನಿಶ್ಚಿತತೆಯ ಭಯ, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ಆತಂಕ.",
          en: "Before Remedy: Nocturnal racing thoughts, existential dread, broken sleep & chronic nervous anxiety.",
          hi: "उपाय पूर्व: रात में अत्यधिक विचार, भविष्य की चिंता, अनिद्रा एवं चित्त की अशांति।",
          te: "పరిహారానికి ముందు: రాత్రి వేళల్లో ఆలోచనలు, భవిష్యత్తు భయం మరియు నిద్రలేమి.",
          ta: "பரிகாரத்திற்கு முன்: இரவு நேர அதிக சிந்தனை, எதிர்கால பயம் மற்றும் தூக்கமின்மை."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಗಾಢವಾದ ಪ್ರಶಾಂತ ನಿದ್ರೆ, ಸ್ಥಿರಚಿತ್ತ, ಆಂತರಿಕ ದೃಢತೆ & ದೈವಿಕ ಆನಂದದ ನೆಮ್ಮದಿ.",
          en: "After Remedy: Deep restorative sleep, unshakeable mental stillness, emotional resilience & peaceful joy.",
          hi: "उपाय पश्चात: गहरी शांतिदायक नींद, स्थिर मन, आंतरिक दृढ़ता एवं दैवीय आनंद की अनुभूति।",
          te: "పరిహారం తర్వాత: ప్రశాంతమైన నిద్ర, స్థిరమైన మనస్సు మరియు దైవానుగ్రహంతో కూడిన ఆనందం.",
          ta: "பரிகாரத்திற்கு பின்: ஆழ்ந்த நிம்மதியான உறக்கம், தெளிவான மனம் மற்றும் உள்ளத்தில் அமைதி."
        },
        day10Expectation: {
          kn: "ಚಂದ್ರಶೇಖರ ಅಷ್ಟಕ ಹಾಗೂ ರಾತ್ರಿ ಕ್ಷೀರ ಧ್ಯಾನದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ನಡುರಾತ್ರಿಯ ಅತಿಯಾದ ಯೋಚನೆಗಳು ನಿಂತು, ಗಾಢವಾದ ನಿದ್ರೆ ಹಾಗೂ ಮಾನಸಿಕ ನೆಮ್ಮದಿ ದೊರೆಯುತ್ತದೆ.",
          en: "Through Chandrashekhara Ashtakam and evening cooling sadhana, nocturnal racing thoughts cease within 10 days, securing sound, restorative sleep.",
          hi: "१० दिनों में रात के समय अत्यधिक सोच और घबराहट रुककर गहरी शांतिदायक नींद आने लगेगी।",
          te: "10 రోజుల్లో రాత్రి వేళల్లో అధిక ఆలోచనలు ఆగిపోయి ప్రశాంతమైన నిద్ర పడుతుంది.",
          ta: "10 நாட்களில் இரவு நேர அதிக சிந்தனை நீங்கி ஆழ்ந்த உறக்கம் கிடைக்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಭವಿಷ್ಯದ ಬಗೆಗಿನ ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಸಂಪೂರ್ಣ ಮಾಯವಾಗಿ, ಯಾವುದೇ ಕಠಿಣ ಪರಿಸ್ಥಿತಿಯಲ್ಲೂ ಸ್ಥಿರವಾಗಿ ನಿಲ್ಲುವ ಅಖಂಡ ಆತ್ಮವಿಶ್ವಾಸ ಕೈಗೂಡಲಿದೆ.",
          en: "By day 15, future uncertainty dread dissolves completely; a calm, centered composure grounds every decision with clarity.",
          hi: "१५ दिनों के बाद भविष्य की अनिश्चितता का भय समाप्त होकर जीवन में आत्मविश्वास और स्पष्टता लौटेगी।",
          te: "15 రోజుల తర్వాత భవిష్యత్తు గురించిన భయాలు తొలగి ఆత్మవిశ్వాసం రెట్టింపు అవుతుంది.",
          ta: "15 நாட்களுக்குப் பிறகு எதிர்கால பயம் நீங்கி அசைக்க முடியாத தன்னம்பிக்கை உண்டாகும்."
        }
      };

    case "career_obstacles":
      return {
        astrologicalReason: {
          kn: "೧೦ನೇ ಕರ್ಮ ಸ್ಥಾನದ ಮೇಲೆ ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗದೆ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ವಿಳಂಬ ಕಾಡುತ್ತಿದೆ. ಹನುಮಾನ್ ಸಂಕಟಮೋಚನ ಹಾಗೂ ಶನಿ ಶಾಂತಿಯು ಕಾರ್ಯವಿಘ್ನಗಳನ್ನು ಕರಗಿಸುತ್ತದೆ.",
          en: "Saturnian resistance on 10th career house slows down hard-earned momentum. Hanuman Sankata Mochana and Saturn shanti dissolve workplace roadblocks.",
          hi: "दशम भाव पर शनि के प्रभाव से परिश्रम के अनुरूप फल मिलने में विलंब हो रहा है। हनुमान आराधना से विघ्न दूर होते हैं।",
          te: "10వ ఉద్యోగ స్థానంపై శని ప్రభావం వలన పనుల్లో ఆలస్యం జరుగుతోంది. హనుమాన్ పూజతో ఆటంకాలు తొలగుతాయి.",
          ta: "10ம் தொழில் ஸ்தானத்தில் சனியின் தாக்கத்தால் காரிய தாமதம் உண்டாகிறது. அனுமன் வழிபாட்டால் தடைகள் நீங்கும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೂ ಫಲ ಸಿಗದಿರುವಿಕೆ, ಕಚೇರಿಯಲ್ಲಿ ಕಿರಿಕಿರಿ, ಬಡ್ತಿ ವಿಳಂಬ ಹಾಗೂ ಹತಾಶೆ.",
          en: "Before Remedy: Stagnant promotion timelines, unacknowledged toil, workplace politics & frustration.",
          hi: "उपाय पूर्व: कठिन परिश्रम का उचित फल न मिलना, पदोन्नति में विलंब एवं कार्यक्षेत्र में निराशा।",
          te: "పరిహారానికి ముందు: శ్రమకు తగిన గుర్తింపు లేకపోవడం, ఉద్యోగంలో ఒత్తిడి మరియు అసంతృప్తి.",
          ta: "பரிகாரத்திற்கு முன்: கடின உழைப்பிற்கு பலனின்மை, பதவி உயர்வு தாமதம் மற்றும் பணியிட விரக்தி."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಗೌರವಯುತ ಬಡ್ತಿ, ನೂತನ ಉದ್ಯೋಗಾವಕಾಶಗಳು, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಮನ್ನಣೆ & ಸ್ಥಿರ ಆರ್ಥಿಕ ಪ್ರಗತಿ.",
          en: "After Remedy: Deserved career breakthroughs, prestigious leadership roles, management acclaim & prosperity.",
          hi: "उपाय पश्चात: पदोन्नति, नवीन आजीविका अवसर, कार्यक्षेत्र में प्रशंसा एवं स्थायी उन्नति।",
          te: "పరిహారం తర్వాత: ఉద్యోగోన్నతి, నూతన అవకాశాలు, అధికారుల ప్రశంసలు మరియు స్థిరమైన ప్రగతి.",
          ta: "பரிகாரத்திற்கு பின்: பதவி உயர்வு, புதிய வேலை வாய்ப்புகள், உயர் அதிகாரிகளின் பாராட்டு மற்றும் மேன்மை."
        },
        day10Expectation: {
          kn: "ಹನುಮಾನ್ ಸಂಕಟಮೋಚನ ಜಪ ಹಾಗೂ ಶನಿ ಶಾಂತಿಯಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಕಚೇರಿಯ ಒತ್ತಡ ಮತ್ತು ನಿರಾಶೆ ಕಡಿಮೆಯಾಗಿ, ಕಾರ್ಯಗಳಲ್ಲಿ ಗೊಂದಲವಿಲ್ಲದ ಸ್ಪಷ್ಟತೆ ಮೂಡುತ್ತದೆ.",
          en: "Through Hanuman Sankata Mochana and Saturn shanti, office burnout and disillusionment dissolve within 10 days, sharpening task execution.",
          hi: "१० दिनों में कार्यक्षेत्र का मानसिक तनाव और हताशा कम होकर कार्यों में स्पष्टता और ऊर्जा आएगी।",
          te: "10 రోజుల్లో ఉద్యోగంలో ఒత్తిడి తగ్గి పనులపై స్పష్టమైన దృష్టి కలుగుతుంది.",
          ta: "10 நாட்களில் வேலைப்பளுவின் மன அழுத்தம் குறைந்து தெளிவான முடிவு எடுக்க முடியும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ಮೇಲಧಿಕಾರಿಗಳೊಂದಿಗೆ ಸೌಹಾರ್ದತೆ ಹೆಚ್ಚಿ, ಹಲವು ದಿನಗಳಿಂದ ನೆನೆಗುದಿಗೆ ಬಿದ್ದಿದ್ದ ಬಡ್ತಿ, ನೂತನ ಜವಾಬ್ದಾರಿ ಅಥವಾ ಹೊಸ ಉದ್ಯೋಗಾವಕಾಶಗಳ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ.",
          en: "By day 15, workplace gridlocks loosen; superiors acknowledge your steadfast contribution, unlocking stalled promotions, responsibilities, or interviews.",
          hi: "१५ दिनों के बाद वरिष्ठ अधिकारियों से सहयोग मिलेगा एवं पदोन्नति या नए कार्य के रुके हुए मार्ग खुलेंगे।",
          te: "15 రోజుల తర్వాత అధికారుల నుంచి ప్రశంసలు లభించి ప్రమోషన్ లేదా నూతన ఉద్యోగ అవకాశాలు లభిస్తాయి.",
          ta: "15 நாட்களுக்குப் பிறகு உயர் அதிகாரிகளின் ஆதரவு கிடைத்து பதவி உயர்வு அல்லது புதிய வேலை வாய்ப்புகள் அமையும்."
        }
      };

    default: // general_alignment
      return {
        astrologicalReason: {
          kn: "ಜಾತಕದಲ್ಲಿ ಗ್ರಹಗಳು ಸಮತೋಲನದಲ್ಲಿದ್ದರೂ, ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲು ಹಾಗೂ ನವಗ್ರಹ ದೋಷಗಳನ್ನು ಶಮನಗೊಳಿಸಲು ನಿಯಮಿತ ಪಂಚಾಂಗ ಸಾಧನೆ ಅಗತ್ಯವಾಗಿದೆ.",
          en: "Planetary positions are largely harmonic; regular Panchanga and Navagraha alignment reinforces life vitality, spiritual focus, and all-round auspiciousness.",
          hi: "कुंडली में ग्रह सामंजस्य में हैं; नित्य पंचांग एवं नवग्रह साधना से जीवन में सकारात्मक ऊर्जा एवं सर्वतोमुखी उन्नति बनी रहती है।",
          te: "కుండలి సమతుల్యంగా ఉంది; నిత్య నవగ్రహ పూజలతో ఆధ్యాత్మిక శక్తి మరియు సర్వతోముఖాభివృద్ధి లభిస్తాయి.",
          ta: "ஜாதகம் சமநிலையில் உள்ளது; தினசரி பஞ்சாங்க மற்றும் நவக்கிரக வழிபாட்டால் ஆத்ம பலமும் சுப காரிய வெற்றியும் உண்டாகும்."
        },
        beforeState: {
          kn: "ಪರಿಹಾರ ಪೂರ್ವ: ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಜಡತ್ವ, ಮಾನಸಿಕ ಅಸ್ಥಿರತೆ, ಸಣ್ಣಪುಟ್ಟ ಅಡೆತಡೆಗಳು.",
          en: "Before Remedy: Ambient lethargy, occasional decision fog & sporadic daily friction.",
          hi: "उपाय पूर्व: दैनिक कार्यों में सुस्ती, कभी-कभार मानसिक भटकाव एवं सामान्य अड़चनें।",
          te: "పరిహారానికి ముందు: పనులలో అలసట, స్వల్ప ఆటంకాలు మరియు ఏకాగ్రత లోపం.",
          ta: "பரிகாரத்திற்கு முன்: அன்றாட பணிகளில் மந்தநிலை, சிறு தடைகள் மற்றும் சோர்வு."
        },
        afterState: {
          kn: "ಪರಿಹಾರೋತ್ತರ ಫಲ: ಅಖಂಡ ಆಂತರಿಕ ಶಾಂತಿ, ಸರ್ವಕಾರ್ಯ ಸಿದ್ಧಿ, ಕುಟುಂಬದಲ್ಲಿ ಸಮೃದ್ಧಿ & ದೈವಿಕ ರಕ್ಷೆ.",
          en: "After Remedy: Unshakable inner peace, effortless task manifestation, domestic abundance & divine protection.",
          hi: "उपाय पश्चात: अखंड आंतरिक शांति, सर्वकार्य सिद्धि, परिवार में समृद्धि एवं दैवीय रक्षा।",
          te: "పరిహారం తర్వాత: అఖండ శాంతి, సర్వకార్య సిద్ధి, కుటుంబ సౌభాగ్యం మరియు దైవ రక్షణ.",
          ta: "பரிகாரத்திற்கு பின்: பூரண மன அமைதி, சகல காரிய வெற்றி, குடும்ப சுபிட்சம் மற்றும் தெய்வ அருள்."
        },
        day10Expectation: {
          kn: "ದೈನಂದಿನ ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಸ್ತೋತ್ರ ಪಠಣದಿಂದ, ೧೦ ದಿನಗಳಲ್ಲಿ ಮನಸ್ಸಿನ ಒತ್ತಡ ಕರಗಿ, ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಹಾಗೂ ಶುದ್ಧ ಭಾವನೆಗಳು ಜಾಗೃತವಾಗುತ್ತವೆ.",
          en: "Daily Navagraha pacification and stotra chanting clear ambient mental clutter within 10 days, establishing deep inner stillness.",
          hi: "१० दिनों में नित्य नवग्रह शांति एवं स्तोत्र पाठ से मानसिक तनाव दूर होकर आंतरिक शांति का अनुभव होगा।",
          te: "10 రోజుల్లో నిత్య నవగ్రహ పూజతో మానసిక ఒత్తిడి తగ్గి ప్రశాంతత లభిస్తుంది.",
          ta: "10 நாட்களில் தினசரி வழிபாட்டால் மன அழுத்தம் நீங்கி உள்ளத்தில் அமைதி பிறக்கும்."
        },
        day15Expectation: {
          kn: "೧೫ ದಿನಗಳ ನಂತರ ದೈನಂದಿನ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಉತ್ಸಾಹ, ಕುಟುಂಬದಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಎಲ್ಲ ಕ್ಷೇತ್ರಗಳಲ್ಲೂ ಸುಗಮ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದೆ.",
          en: "By day 15, harmonious momentum permeates daily tasks; family relationships blossom with warmth and all undertakings proceed smoothly.",
          hi: "१५ दिनों के बाद सभी कार्यों में उत्साह, पारिवारिक सौहार्द एवं जीवन में सुचारु उन्नति दृष्टिगोचर होगी।",
          te: "15 రోజుల తర్వాత అన్ని పనుల్లో అనుకూలత, కుటుంబంలో ఆనందం మరియు స్థిరమైన ప్రగతి కనిపిస్తాయి.",
          ta: "15 நாட்களுக்குப் பிறகு செய்யும் காரியங்களில் வெற்றி, குடும்பத்தில் ஒற்றுமை மற்றும் சுப முன்னேற்றம் உண்டாகும்."
        }
      };
  }
}

/** Classical Rashi Ruling Lords (Parashari System) */
export const RASHI_LORDS: Record<number, PlanetName> = {
  0: PlanetName.Mars,     // Aries
  1: PlanetName.Venus,    // Taurus
  2: PlanetName.Mercury,  // Gemini
  3: PlanetName.Moon,     // Cancer
  4: PlanetName.Sun,      // Leo
  5: PlanetName.Mercury,  // Virgo
  6: PlanetName.Venus,    // Libra
  7: PlanetName.Mars,     // Scorpio
  8: PlanetName.Jupiter,  // Sagittarius
  9: PlanetName.Saturn,   // Capricorn
  10: PlanetName.Saturn,  // Aquarius
  11: PlanetName.Jupiter  // Pisces
};

/**
 * Classical Parashara Badhaka Graha & House Computation
 * Chara Lagna (0, 3, 6, 9) -> 11th House is Badhaka
 * Sthira Lagna (1, 4, 7, 10) -> 9th House is Badhaka
 * Dvisvabhava Lagna (2, 5, 8, 11) -> 7th House is Badhaka
 */
export function computeBadhakaAnalysis(lagnaRashiIndex: number): BadhakaAnalysis {
  const norm = ((lagnaRashiIndex % 12) + 12) % 12;
  const isChara = [0, 3, 6, 9].includes(norm);
  const isSthira = [1, 4, 7, 10].includes(norm);

  let modality: "Chara" | "Sthira" | "Dvisvabhava";
  let modalityLabel: Record<SupportedLanguage, string>;
  let badhakaHouse: number;
  let badhakaSignIndex: number;

  if (isChara) {
    modality = "Chara";
    modalityLabel = {
      kn: "ಚರ ಲಗ್ನ (ಚಲನಶೀಲ ತತ್ತ್ವ)",
      en: "Movable (Chara) Ascendant",
      hi: "चर लग्न (गतिशील तत्व)",
      te: "చర లగ్నం (చలనశీల తత్త్వం)",
      ta: "சர லக்னம் (இயங்கும் தன்மை)"
    };
    badhakaHouse = 11;
    badhakaSignIndex = (norm + 10) % 12;
  } else if (isSthira) {
    modality = "Sthira";
    modalityLabel = {
      kn: "ಸ್ಥಿರ ಲಗ್ನ (ಸ್ಥಿರ ತತ್ತ್ವ)",
      en: "Fixed (Sthira) Ascendant",
      hi: "स्थिर लग्न (अडिग तत्व)",
      te: "స్థిర లగ్నం (స్థిర తత్త్వం)",
      ta: "ஸ்திர லக்னம் (நிலையான தன்மை)"
    };
    badhakaHouse = 9;
    badhakaSignIndex = (norm + 8) % 12;
  } else {
    modality = "Dvisvabhava";
    modalityLabel = {
      kn: "ದ್ವಿಸ್ವಭಾವ ಲಗ್ನ (ಉಭಯ ತತ್ತ್ವ)",
      en: "Dual (Dvisvabhava) Ascendant",
      hi: "द्विस्वभाव लग्न (उभय तत्व)",
      te: "ద్విస్వభావ లగ్నం (ఉభయ తత్త్వం)",
      ta: "உபய லக்னம் (இருமை தன்மை)"
    };
    badhakaHouse = 7;
    badhakaSignIndex = (norm + 6) % 12;
  }

  const badhakeshGraha = RASHI_LORDS[badhakaSignIndex];
  const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const signKey = signNames[badhakaSignIndex];
  const badhakaSignName: Record<SupportedLanguage, string> = {
    kn: RASHI_NAMES_LOCALE[signKey]?.kn || signKey,
    en: RASHI_NAMES_LOCALE[signKey]?.en || signKey,
    hi: RASHI_NAMES_LOCALE[signKey]?.hi || signKey,
    te: RASHI_NAMES_LOCALE[signKey]?.te || signKey,
    ta: RASHI_NAMES_LOCALE[signKey]?.ta || signKey
  };

  const badhakeshName: Record<SupportedLanguage, string> = {
    kn: GRAHA_NAMES_LOCALE[badhakeshGraha]?.kn || badhakeshGraha,
    en: GRAHA_NAMES_LOCALE[badhakeshGraha]?.en || badhakeshGraha,
    hi: GRAHA_NAMES_LOCALE[badhakeshGraha]?.hi || badhakeshGraha,
    te: GRAHA_NAMES_LOCALE[badhakeshGraha]?.te || badhakeshGraha,
    ta: GRAHA_NAMES_LOCALE[badhakeshGraha]?.ta || badhakeshGraha
  };

  const diagnosisReason: Record<SupportedLanguage, string> = {
    kn: `ಪರಾಶರ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ನಿಮ್ಮ ${modalityLabel.kn}ಕ್ಕೆ ${badhakaHouse}ನೇ ಸ್ಥಾನವು ಬಾಧಕ ಸ್ಥಾನವಾಗಿದ್ದು, ${badhakaSignName.kn} ರಾಶಿಯ ಅಧಿಪತಿ ${badhakeshName.kn} ಬಾಧಕಾಧಿಪತಿಯಾಗಿದ್ದಾನೆ. ಈ ಗ್ರಹದ ಅಶಾಂತಿಯಿಂದಾಗಿ ಮಹತ್ವದ ಕಾರ್ಯಗಳು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ವಿಳಂಬವಾಗುತ್ತವೆ.`,
    en: `According to Brihat Parashara Hora Shastra, for your ${modalityLabel.en}, the ${badhakaHouse}th house is the Badhakhana (Obstruction Zone) and ${badhakeshName.en} governing ${badhakaSignName.en} acts as Badhakesh. An unpropitiated Badhaka triggers unexplained bottlenecks right before culmination.`,
    hi: `बृहत् पराशर होरा शास्त्रानुसार आपके ${modalityLabel.hi} हेतु ${badhakaHouse}वां भाव बाधक स्थान है तथा ${badhakaSignName.hi} के स्वामी ${badhakeshName.hi} बाधकेश हैं। बाधक प्रभाव से महत्वपूर्ण कार्य अंतिम क्षणों में अटकते हैं।`,
    te: `పరాశర హోరా శాస్త్రం ప్రకారం మీ ${modalityLabel.te}కు ${badhakaHouse}వ స్థానం బాధక స్థానం మరియు ${badhakeshName.te} బాధకాధిపతి. దీనివలన పనులలో చివరి నిమిషంలో ఆటంకాలు ఎదురవుతాయి.`,
    ta: `பராசர சாஸ்திரப்படி உங்கள் ${modalityLabel.ta}க்கு ${badhakaHouse}ம் இடம் பாதக ஸ்தானம் மற்றும் ${badhakeshName.ta} பாதகாதிபதி ஆவார். இதனால் முக்கிய காரியங்களில் திடீர் தாமதங்கள் ஏற்படலாம்.`
  };

  const shantiRemedy: Record<SupportedLanguage, string> = {
    kn: `ಬಾಧಕಾಧಿಪತಿಯಾದ ${badhakeshName.kn}ನ ಪ್ರತ್ಯಧಿದೇವತೆಯ ಆರಾಧನೆ, ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯಿಂದ ಈ ಅಗೋಚರ ವಿಘ್ನ ಸಂಪೂರ್ಣ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.`,
    en: `Propitiating the Pratyadhidevata of Badhakesh ${badhakeshName.en}, making a dedicated sankalpa at Gokarna Mahabaleshwara, and honoring your Kula Devata completely dissolves these invisible roadblocks.`,
    hi: `बाधकेश ${badhakeshName.hi} के प्रत्याधिदेवता की उपासना, गोकर्ण क्षेत्र में विशेष संकल्प एवं कुलदेवता की अर्चना से यह अदृश्य बाधा शांत होती है।`,
    te: `బాధకాధిపతి ${badhakeshName.te} యొక్క ప్రత్యధిదేవత పూజ మరియు గోకర్ణంలో విశేష సంకల్పంతో ఈ ఆటంకాలు తొలగుతాయి.`,
    ta: `பாதகாதிபதி ${badhakeshName.ta}யின் பிரத்யதிதேவதை வழிபாடு மற்றும் கோகர்ண க்ஷேத்திர சங்கல்பத்தால் தடைகள் யாவும் விலகும்.`
  };

  return {
    modality,
    modalityLabel,
    badhakaHouse,
    badhakaSignName,
    badhakeshGraha,
    badhakeshName,
    diagnosisReason,
    shantiRemedy
  };
}

/**
 * Authentic Classical Parashara Adhidevata & Pratyadhidevata Directory
 * Every Graha is governed by an Adhidevata (Higher deity) and Pratyadhidevata (Inner regulatory deity).
 */
export const GRAHA_DEVATA_PAIRS: Record<PlanetName, {
  adhidevata: Record<SupportedLanguage, string>;
  pratyadhidevata: Record<SupportedLanguage, string>;
  sadhana: Record<SupportedLanguage, string>;
}> = {
  [PlanetName.Sun]: {
    adhidevata: { kn: "ಅಗ್ನಿ / ಪರಮಶಿವ", en: "Agni / Shiva", hi: "अग्नि / शिव", te: "అగ్ని / శివుడు", ta: "அக்னி / சிவன்" },
    pratyadhidevata: { kn: "ರುದ್ರ / ಶ್ರೀರಾಮಚಂದ್ರ", en: "Rudra / Sri Rama", hi: "रुद्र / श्रीराम", te: "రుద్రుడు / శ్రీరాముడు", ta: "ருத்ரன் / ஸ்ரீராமர்" },
    sadhana: {
      kn: "ಸೂರ್ಯ ನಮಸ್ಕಾರ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಹಾಗೂ ಶ್ರೀರಾಮ ನಾಮ ಸ್ಮರಣೆ.",
      en: "Surya Namaskara at dawn, Aditya Hrudaya Stotra, and Sri Rama Taraka Japa.",
      hi: "प्रातः सूर्य नमस्कार, आदित्य हृदय स्तोत्र एवं श्रीराम नाम जप।",
      te: "సూర్య నమస్కారాలు, ఆదిత్య హృదయ స్తోత్రం మరియు శ్రీరామ నామ జపం.",
      ta: "சூரிய நமஸ்காரம், ஆதித்ய ஹிருதய ஸ்தோத்திரம் மற்றும் ஸ்ரீராம நாம ஜெபம்."
    }
  },
  [PlanetName.Moon]: {
    adhidevata: { kn: "ವರುಣ (ಜಲ ತತ್ತ್ವ) / ಗೌರೀ ದೇವಿ", en: "Varuna / Gauri Devi", hi: "वरुण / गौरी देवी", te: "వరుణుడు / గౌరీ దేవి", ta: "வருணன் / கௌரி தேவி" },
    pratyadhidevata: { kn: "ಉಮಾ / ಪಾರ್ವತಿ ದೇವಿ", en: "Uma / Parvati Devi", hi: "उमा / पार्वती देवी", te: "ఉమ / పార్వతీ దేవి", ta: "உமை / பார்வதி தேவி" },
    sadhana: {
      kn: "ಚಂದ್ರ ಶಾಂತಿ, ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಶ್ರೀ ಲಲಿತಾ ಅಷ್ಟೋತ್ತರ ಪಠಣ.",
      en: "Chandra Shanti, pure milk abhisheka to Shiva Linga, and Lalita Ashtottara.",
      hi: "चन्द्र शांति, शिवलिंग पर दुग्धाभिषेक एवं ललिता अष्टोत्तर पाठ।",
      te: "చంద్ర శాంతి, శివలింగానికి క్షీరాభిషేకం మరియు లలితా అష్టోత్తర పఠనం.",
      ta: "சந்திர சாந்தி, சிவலிங்கத்திற்கு பாலாபிஷேகம் மற்றும் லலிதா அஷ்டோத்திரம்."
    }
  },
  [PlanetName.Mars]: {
    adhidevata: { kn: "ಕ್ಷೇತ್ರಪಾಲ / ಭೂಮಿ ದೇವಿ", en: "Kshetrapala / Bhoomi Devi", hi: "क्षेत्रपाल / भूमि देवी", te: "క్షేత్రపాలకుడు / భూదేవి", ta: "க்ஷேத்ரபாலகர் / பூமிதேவி" },
    pratyadhidevata: { kn: "ಸುಬ್ರಹ್ಮಣ್ಯ / ಸ್ಕಂದ", en: "Subrahmanya / Skanda", hi: "सुब्रह्मण्य / कार्तिकेय", te: "సుబ్రహ్మణ్య స్వామి / స్కందుడు", ta: "சுப்பிரமணியர் / முருகன்" },
    sadhana: {
      kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಭುಜಂಗ ಸ್ತೋತ್ರ, ತಾಮ್ರ ಪಾತ್ರೆಯ ಜಲಾರ್ಪಣೆ ಹಾಗೂ ಅಂಗಾರಕ ಶಾಂತಿ.",
      en: "Subrahmanya Bhujanga Stotra, copper vessel water offering, and Angaraka Shanti.",
      hi: "सुब्रह्मण्य भुजंग स्तोत्र, ताम्रपात्र से जलार्पण एवं अंगारक शांति।",
      te: "సుబ్రహ్మణ్య భుజంగ స్తోత్రం మరియు అంగారక శాంతి.",
      ta: "சுப்பிரமணிய புஜங்கம் மற்றும் அங்காரக சாந்தி."
    }
  },
  [PlanetName.Mercury]: {
    adhidevata: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು", en: "Sri Maha Vishnu", hi: "श्री महाविष्णु", te: "శ్రీ మహావిష్ణువు", ta: "ஸ்ரீ மகாவிஷ்ணு" },
    pratyadhidevata: { kn: "ನಾರಾಯಣ / ಶ್ರೀಕೃಷ್ಣ", en: "Narayana / Sri Krishna", hi: "नारायण / श्रीकृष्ण", te: "నారాయణుడు / శ్రీకృష్ణుడు", ta: "நாராயணர் / ஸ்ரீகிருஷ்ணர்" },
    sadhana: {
      kn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ತುಳಸೀ ಅರ್ಚನೆ ಹಾಗೂ ಹಸಿರು ಹೆಸರುಕಾಳು ದಾನ.",
      en: "Vishnu Sahasranama recitation, Tulasi archana, and moong dal charity.",
      hi: "विष्णु सहस्रनाम पाठ, तुलसी अर्चन एवं मूंग दाल दान।",
      te: "విష్ణు సహస్రనామ పఠనం మరియు తులసీ పూజ.",
      ta: "விஷ்ணு சஹஸ்ரநாம பாராயணம் மற்றும் துளசி அர்ச்சனை."
    }
  },
  [PlanetName.Jupiter]: {
    adhidevata: { kn: "ಇಂದ್ರ / ಬ್ರಹ್ಮದೇವ", en: "Indra / Brahma Deva", hi: "इन्द्र / ब्रह्मा", te: "ఇంద్రుడు / బ్రహ్మదేవుడు", ta: "இந்திரன் / பிரம்மன்" },
    pratyadhidevata: { kn: "ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ / ಸದಾಶಿವ", en: "Medha Dakshinamurthy / Sadashiva", hi: "मेधा दक्षिणामूर्ति / सदाशिव", te: "మేధా దక్షిణామూర్తి / సదాశివుడు", ta: "மேதா தட்சிணாமூர்த்தி / சதாசிவன்" },
    sadhana: {
      kn: "ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರ, ಗುರು ಚರಿತ್ರೆ ಶ್ರವಣ ಹಾಗೂ ಹಳದಿ ಕಡಲೆಕಾಳು ದಾನ.",
      en: "Dakshinamurthy Stotra, Guru Charitra listening, and yellow chana daana.",
      hi: "दक्षिणामूर्ति स्तोत्र, गुरु उपासना एवं चने की दाल का दान।",
      te: "దక్షిణామూర్తి స్తోత్రం మరియు గురు పూజ.",
      ta: "தட்சிணாமூர்த்தி ஸ்தோத்திரம் மற்றும் குரு வழிபாடு."
    }
  },
  [PlanetName.Venus]: {
    adhidevata: { kn: "ಇಂದ್ರಾಣಿ / ಶಚೀ ದೇವಿ", en: "Indrani / Shachi Devi", hi: "इन्द्राणी / शची देवी", te: "ఇంద్రాణి / శచీ దేవి", ta: "இந்திராணி / சசி தேவி" },
    pratyadhidevata: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ", en: "Sri Mahalakshmi", hi: "श्री महालक्ष्मी", te: "శ్రీ మహాలక్ష్మి", ta: "ஸ்ரீ மகாலட்சுமி" },
    sadhana: {
      kn: "ಕನಕಧಾರಾ ಸ್ತೋತ್ರ, ಶ್ರೀ ಸೂಕ್ತ ಪಠಣ ಹಾಗೂ ಗೋವಿಗೆ ಬೆಲ್ಲ-ಹುಲ್ಲು ಸಮರ್ಪಣೆ.",
      en: "Kanakadhara Stotra, Sri Sukta recitation, and feeding grass-jaggery to cow.",
      hi: "कनकधारा स्तोत्र, श्री सूक्त पाठ एवं गौमाता को गुड़-चारा समर्पण।",
      te: "కనకధారా స్తోత్రం, శ్రీ సూక్తం మరియు గోసేవ.",
      ta: "கனகதாரா ஸ்தோத்திரம், ஸ்ரீ சூக்தம் மற்றும் கோபூஜை."
    }
  },
  [PlanetName.Saturn]: {
    adhidevata: { kn: "ಯಮಧರ್ಮ ರಾಜ", en: "Yama Dharma Raja", hi: "यमराज / धर्म", te: "యమధర్మరాజు", ta: "எமதர்ம ராஜன்" },
    pratyadhidevata: { kn: "ಪ್ರಜಾಪತಿ / ಕಾಲಭೈರವ", en: "Prajapati / Kaal Bhairava", hi: "प्रजापति / कालभैरव", te: "ప్రజాపతి / కాలభైరవుడు", ta: "பிரஜாபதி / காலபைரவர்" },
    sadhana: {
      kn: "ಕಾಲಭೈರವಾಷ್ಟಕ, ಶನಿ ಚಾಲೀಸಾ, ಕಪ್ಪು ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಾಗೂ ವೃದ್ಧರ ಸೇವೆ.",
      en: "Kala Bhairavashtakam, Shani Chalisa, sesame oil lamp, and serving elderly destitute.",
      hi: "कालभैरवाष्टक, शनि चालीसा, तिल के तेल का दीपक एवं असहायों की सेवा।",
      te: "కాలభైరవాష్టకం, శని చాలీసా మరియు నువ్వుల నూనె దీపం.",
      ta: "காலபைரவாஷ்டகம், சனி சாலிசா மற்றும் நல்லெண்ணெய் தீபம்."
    }
  },
  [PlanetName.Rahu]: {
    adhidevata: { kn: "ದುರ್ಗಾ ದೇವಿ", en: "Durga Devi", hi: "दुर्गा देवी", te: "దుర్గా దేవి", ta: "துர்க்கை அம்மன்" },
    pratyadhidevata: { kn: "ನಾಗರಾಜ / ಸರ್ಪ ದೇವತೆ", en: "Nagaraja / Sarpa Devata", hi: "नागराज / सर्प देव", te: "నాగరాజు / సర్ప దేవత", ta: "நாகராஜர் / சர்ப்ப தேவதை" },
    sadhana: {
      kn: "ದುರ್ಗಾ ಸಪ್ತಶತೀ, ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ ಹಾಗೂ ಉದ್ದಿನ ಕಾಳು ದಾನ.",
      en: "Durga Saptashati, Subrahmanya Kavacha, and urad dal daana.",
      hi: "दुर्गा सप्तशती, सुब्रह्मण्य कवच एवं उड़द दाल का दान।",
      te: "దుర్గా సప్తశతి, సుబ్రహ్మణ్య కవచం మరియు మినుముల దానం.",
      ta: "துர்க்கா சப்தசதி, சுப்பிரமணிய கவசம் மற்றும் உளுந்து தானம்."
    }
  },
  [PlanetName.Ketu]: {
    adhidevata: { kn: "ಚಿತ್ರಗುಪ್ತ ಮಹಾರಾಜ", en: "Chitragupta Maharaja", hi: "चित्रगुप्त", te: "చిత్రగుప్తుడు", ta: "சித்ரகுப்தர்" },
    pratyadhidevata: { kn: "ಮಹಾ ಗಣಪತಿ", en: "Maha Ganapati", hi: "महागणपति", te: "మహా గణపతి", ta: "மகா கணபதி" },
    sadhana: {
      kn: "ಸಂಕಷ್ಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರ, ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಹಾಗೂ ಕಪ್ಪು-ಬಿಳಿ ಕಂಬಳಿ ದಾನ.",
      en: "Sankata Nashana Ganesha Stotra, Ganapati Atharvashirsha, and dual-color blanket daana.",
      hi: "संकटनाशन गणेश स्तोत्र, गणपति अथर्वशीर्ष एवं कंबल दान।",
      te: "సంకటనాశన గణేశ స్తోత్రం మరియు గణపతి అథర్వశీర్షం.",
      ta: "சங்கட நாசன கணேச ஸ்தோத்திரம் மற்றும் கணபதி அதர்வசீரிடம்."
    }
  }
};

/**
 * Medical-Grade Astrological Prescription Engine (ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಚಿಕಿತ್ಸಾ ಪತ್ರ)
 * Formulates clinical-grade Ayurvedic/Vedic diagnosis (Nidana), Divine Medicine (Aushadha),
 * Sacred Ingestion Vehicle (Anupana), Dietary/Lifestyle Protocol (Pathya & Apathya),
 * Chronobiology (Chikitsa Kala), and 15-to-20 Day Measurable Relief Progression.
 */
export function computeVedicDoctorPrescription(
  struggleCategory: KundliRemedyDiagnosis["primaryStruggle"]["category"],
  catalystGraha: PlanetName,
  lagnaRashiIndex: number,
  devoteeName: string,
  gotra?: string,
  badhakaInfo?: BadhakaAnalysis
): VedicDoctorPrescription {
  // 1. Nidana (Dosha & Subtle Channel Imbalance)
  let primaryDosha: "Pitta" | "Vata" | "Kapha" | "Tridosha" = "Pitta";
  let doshaLabel: Record<SupportedLanguage, string>;
  let rootCauseDescription: Record<SupportedLanguage, string>;
  let affectedNadis: Record<SupportedLanguage, string>;

  if (struggleCategory === "anger_temper" || struggleCategory === "elite_sports") {
    primaryDosha = "Pitta";
    doshaLabel = {
      kn: "ತೀವ್ರ ಪಿತ್ತ ಪ್ರಕೋಪ (ರಕ್ತ & ಅಗ್ನಿ ತತ್ತ್ವ ಅಸಮತೋಲನ)",
      en: "Severe Pitta Surge (Blood & Fire Element Agitation)",
      hi: "तीव्र पित्त प्रकोप (रक्त एवं अग्नि तत्व असंतुलन)",
      te: "తీవ్ర పిత్త ప్రకోపం (రక్త & అగ్ని తత్త్వ అసమతుల్యత)",
      ta: "தீவிர பித்த பிரகோபம் (ரத்தம் மற்றும் அக்னி தத்துவ சீர்குலைவு)"
    };
    rootCauseDescription = {
      kn: "ಕುಜ ಹಾಗೂ ರವಿ ಗ್ರಹಗಳ ತೀಕ್ಷ್ಣ ತೇಜಸ್ಸು ಮಿದುಳಿನ ರಕ್ತನಾಳಗಳನ್ನು ಪ್ರಚೋದಿಸಿ, ಪಿತ್ತ ದೋಷವನ್ನು ಉಲ್ಬಣಗೊಳಿಸುತ್ತದೆ. ಇದರಿಂದ ಅತಿ-ಆವೇಶ, ಅಸಹನೆ ಮತ್ತು ತಕ್ಷಣ ಸಿಟ್ಟು ಉಂಟಾಗುತ್ತದೆ.",
      en: "Piercing Mars-Sun astral rays agitate autonomic sympathetic channels and cerebral bloodflow, spiking Pitta and triggering reactive anger and impatience.",
      hi: "मंगल एवं सूर्य के तीक्ष्ण प्रभाव से नाड़ियों में पित्त बढ़ता है, जिससे तुरंत क्रोध और अधीरता उत्पन्न होती है।",
      te: "కుజ మరియు సూర్యుల తీవ్ర ప్రభావం వలన నాడీ వ్యవస్థలో పిత్తం పెరిగి కోపం మరియు అసహనం కలుగుతాయి.",
      ta: "செவ்வாய் மற்றும் சூரியனின் உக்கிரத்தால் பித்தம் அதிகரித்து திடீர் கோபமும் பொறுமையின்மையும் உண்டாகிறது."
    };
    affectedNadis = {
      kn: "ಪಿಂಗಳಾ ನಾಡಿ (ಸೂರ್ಯ ನಾಡಿ) & ವಿಶುದ್ಧಿ ಚಕ್ರ",
      en: "Pingala Nadi (Solar Channel) & Vishuddha Throat Chakra",
      hi: "पिंगला नाड़ी (सूर्य नाड़ी) एवं विशुद्धि चक्र",
      te: "పింగళా నాడి (సూర్య నాడి) & విశుద్ధి చక్రం",
      ta: "பிங்கலா நாடி (சூரிய நாடி) & விசுத்தி சக்கரம்"
    };
  } else if (struggleCategory === "career_obstacles" || struggleCategory === "debt_financial" || struggleCategory === "legal_confinement") {
    primaryDosha = "Vata";
    doshaLabel = {
      kn: "ವಾತ ಪ್ರಕೋಪ & ಕರ್ಮಿಕ ಸ್ತಂಭನ (ವಾಯು ತತ್ತ್ವ ಅಸಮತೋಲನ)",
      en: "Vata Aggravation & Karmic Stagnation (Air Element Obstruction)",
      hi: "वात प्रकोप एवं कर्मिक अवरोध (वायु तत्व असंतुलन)",
      te: "వాత ప్రకోపం & కర్మిక స్తంభన (వాయు తత్త్వ లోపం)",
      ta: "வாத பிரகோபம் & கர்ம தடை (வாயு தத்துவ கோளாறு)"
    };
    rootCauseDescription = {
      kn: "ಶನಿ ಹಾಗೂ ರಾಹು ಗ್ರಹಗಳ ಕರ್ಮಿಕ ಭಾರದಿಂದ ವಾತ ನಾಡಿಗಳು ಸಂಕೋಚನಗೊಂಡು, ಪ್ರತಿಯೊಂದು ಕಾರ್ಯದಲ್ಲೂ ಕೊನೆ ಕ್ಷಣದ ವಿಳಂಬ, ಆರ್ಥಿಕ ತಡೆ ಮತ್ತು ಅತಿಯಾದ ಶ್ರಮ ಎದುರಾಗುತ್ತದೆ.",
      en: "Saturnian karmic pressure and Rahu's etheric drag restrict vital Vata currents, freezing momentum and producing prolonged bottlenecks.",
      hi: "शनि एवं राहु के प्रभाव से वात नाड़ियां संकुचित होती हैं, जिससे कार्यों में विलंब और भारी श्रम का बोझ रहता है।",
      te: "శని మరియు రాహువుల ప్రభావం వల్ల వాత దోషం ఏర్పడి పనుల్లో జాప్యం మరియు శ్రమ కలుగుతాయి.",
      ta: "சனி மற்றும் ராகுவின் தாக்கத்தால் காரியங்களில் தேக்கமும் கடன்/பொருளாதார நெருக்கடியும் உண்டாகிறது."
    };
    affectedNadis = {
      kn: "ಅಪಾನ ವಾಯು & ಮೂಲಾಧಾರ ಚಕ್ರ",
      en: "Apana Vayu & Muladhara Root Chakra",
      hi: "अपान वायु एवं मूलाधार चक्र",
      te: "అపాన వాయువు & మూలాధార చక్రం",
      ta: "அபான வாயு & மூலாதார சக்கரம்"
    };
  } else if (struggleCategory === "mental_anxiety" || struggleCategory === "health_vitality") {
    primaryDosha = "Vata";
    doshaLabel = {
      kn: "ವಾತ-ಪಿತ್ತ ಮಿಶ್ರಿತ ದೋಷ (ಮನಸ್ಸಿನ ಚಾಂಚಲ್ಯ & ಪ್ರಾಣ ಕ್ಷೀಣತೆ)",
      en: "Vata-Pitta Mixed Doshic Strain (Manas Turbulence & Prana Dip)",
      hi: "वात-पित्त मिश्रित दोष (चित्त चंचलता एवं प्राण दुर्बलता)",
      te: "వాత-పిత్త మిశ్రమ దోషం (మానసిక చంచలత)",
      ta: "வாத-பித்த கலப்பு தோஷம் (மன சஞ்சலம் & பிராண பலவீனம்)"
    };
    rootCauseDescription = {
      kn: "ಮನಃಕಾರಕ ಚಂದ್ರನ ಮೇಲಿನ ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ ಇಡಾ ನಾಡಿ ದುರ್ಬಲಗೊಂಡು, ರಾತ್ರಿಯ ಅತಿಯಾದ ಯೋಚನೆ, ನಿದ್ರಾಭಂಗ ಹಾಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ಅಕಾರಣ ಭಯ ಕಾಡುತ್ತದೆ.",
      en: "Afflictions to lunar and solar luminaries destabilize the parasympathetic Ida Nadi, producing nocturnal rumination, shallow sleep, and phantom fears.",
      hi: "चन्द्रमा पर पाप दृष्टि से इड़ा नाड़ी दुर्बल होती है, जिससे अनिद्रा, अधिक चिंता और भय की स्थिति बनती है।",
      te: "చంద్రునిపై పాప దృష్టి వలన ఇడా నాడి బలహీనపడి నిద్రలేమి మరియు మానసిక ఆందోళన కలుగుతాయి.",
      ta: "சந்திரன் பலவீனத்தால் இடா நாடி பாதிக்கப்பட்டு தூக்கமின்மையும் வீண் பயமும் உண்டாகிறது."
    };
    affectedNadis = {
      kn: "ಇಡಾ ನಾಡಿ (ಚಂದ್ರ ನಾಡಿ) & ಅನಾಹತ ಹೃದಯ ಚಕ್ರ",
      en: "Ida Nadi (Lunar Channel) & Anahata Heart Chakra",
      hi: "इड़ा नाड़ी (चन्द्र नाड़ी) एवं अनाहत चक्र",
      te: "ఇడా నాడి (చంద్ర నాడి) & అనాహత చక్రం",
      ta: "இடா நாடி (சந்திர நாடி) & அனாகத சக்கரம்"
    };
  } else if (struggleCategory === "student_academic" || struggleCategory === "creative_stardom") {
    primaryDosha = "Kapha";
    doshaLabel = {
      kn: "ಕಫ-ವಾತ ಮಂದತೆ (ಬುದ್ಧಿ ಭ್ರಮಣೆ & ಏಕಾಗ್ರತಾ ಭಂಗ)",
      en: "Kapha-Vata Cognitive Sluggishness (Intellectual Distraction)",
      hi: "कफ-वात मंदता (एकाग्रता भंग एवं स्मृति भ्रम)",
      te: "కఫ-వాత మందగమనం (ఏకాగ్రత లోపం)",
      ta: "கப-வாத மந்தநிலை (கவனச்சிதறல் & நினைவாற்றல் சவால்)"
    };
    rootCauseDescription = {
      kn: "ಬುದ್ಧಿಕಾರಕ ಬುಧನ ಮೇಲೆ ರಾಹುವಿನ ಪ್ರಭಾವದಿಂದ ಮಿದುಳಿನ ಗ್ರಾಹಕ ಶಕ್ತಿ ಮಂದಗೊಂಡು, ಓದಿದ ವಿಷಯ ಮರೆತುಹೋಗುವುದು ಮತ್ತು ಪರೀಕ್ಷಾ ಭಯ ಉಂಟಾಗುತ್ತದೆ.",
      en: "Mercurial cognitive pathways experience clouding under shadowy Rahu, inducing study restlessness, conceptual fog, and recall hesitancy.",
      hi: "बुध पर राहु के प्रभाव से एकाग्रता भंग होती है और परीक्षा के समय स्मरणशक्ति दुर्बल महसूस होती है।",
      te: "బుధునిపై రాహు ప్రభావం వల్ల చదువులో ఏకాగ్రత మరియు జ్ఞాపకశక్తి లోపిస్తాయి.",
      ta: "புதன் மீது ராகு தாக்கத்தால் படிப்பில் கவனச்சிதறலும் தேர்வு பயமும் உண்டாகிறது."
    };
    affectedNadis = {
      kn: "ಮೇಧಾ ನಾಡಿ & ಆಜ್ಞಾ ಚಕ್ರ (ಭ್ರೂಮಧ್ಯ)",
      en: "Medha Nadi & Ajna Brow Center Chakra",
      hi: "मेधा नाड़ी एवं आज्ञा चक्र (भ्रूमध्य)",
      te: "మేధా నాడి & ఆజ్ఞా చక్రం",
      ta: "மேதா நாடி & ஆக்ஞா சக்கரம்"
    };
  } else {
    primaryDosha = "Tridosha";
    doshaLabel = {
      kn: "ತ್ರಿದೋಷ ಸಾಮ್ಯತೆ & ಸಪ್ತಧಾತು ಸಂವರ್ಧನೆ",
      en: "Tridoshic Re-alignment & Sapta Dhatu Rejuvenation",
      hi: "त्रिदोष साम्य एवं सप्तधातु संवर्धन",
      te: "త్రిదోష సమన్వయం & సప్తధాతు సంవర్ధన",
      ta: "திரிதோஷ சமநிலை & சப்த தாது புத்துணர்ச்சி"
    };
    rootCauseDescription = {
      kn: "ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಭಾಗ್ಯಾಧಿಪತಿಯ ಬಲವನ್ನು ವರ್ಧಿಸಿ, ಜೀವನದಲ್ಲಿ ನಿರಂತರ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಪ್ರೇಮ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ ನೆಲೆಸುವಂತೆ ಮಾಡಲು ನಿಯಮಿತ ಚಿಕಿತ್ಸಾ ಪಾಲನೆ ಅಗತ್ಯ.",
      en: "Harmonizing primary ascendant and catalytic yogakaraka planetary rays fortifies cellular immunity, domestic tenderness, and lasting prosperity.",
      hi: "लग्नेश एवं भाग्येश को सशक्त कर जीवन में अखंड शांति, पारिवारिक सुख और दैवीय सुरक्षा स्थापित करने हेतु साधना आवश्यक है।",
      te: "లగ్నాధిపతి మరియు భాగ్యాధిపతిని బలపరచడం ద్వారా జీవితంలో శాంతి మరియు అభివృద్ధి లభిస్తాయి.",
      ta: "லக்னாதிபதி மற்றும் பாக்கியாதிபதியை பலப்படுத்தி வாழ்க்கையில் நிரந்தர சுபிட்சம் பெற நல்வழிபாடு அவசியம்."
    };
    affectedNadis = {
      kn: "ಸುಷುಮ್ನಾ ನಾಡಿ & ಸಹಸ್ರಾರ ಚಕ್ರ",
      en: "Sushumna Central Channel & Sahasrara Crown Chakra",
      hi: "सुषुम्ना नाड़ी एवं सहस्रार चक्र",
      te: "సుషుమ్నా నాడి & సహస్రార చక్రం",
      ta: "சுஷும்னா நாடி & சஹஸ்ரார சக்கரம்"
    };
  }

  // 2. Aushadha (Divine Prescribed Medicine)
  let mantraSanskrit = "॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः । ॐ सों सोमाय नमः शान्तये ॥";
  let mantraNative: Record<SupportedLanguage, string> = {
    kn: "॥ ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ । ಓಂ ಸೋಂ ಸೋಮಾಯ ನಮಃ ಶಾಂತಯೇ ॥",
    en: "Om Kram Kreem Kroum Sah Bhaumaya Namaha | Om Som Somaya Namaha Shantaye",
    hi: "॥ ॐ क्रां क्रीं क्रौं सः भौमाय नमः । ॐ सों सोमाय नमः शान्तये ॥",
    te: "॥ ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః । ఓం సోం సోమాయ నమః శాంతయే ॥",
    ta: "॥ ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஹ । ஓம் சோம் சோமாய நமஹ சாந்தயே ॥"
  };
  let transliteration = "Om Kram Kreem Kroum Sah Bhaumaya Namaha | Om Som Somaya Namaha Shantaye";
  let dailyDosageCount: Record<SupportedLanguage, string> = {
    kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ೧೦೮ ಬಾರಿ (ಏಕ ಮಾಲಾ ಜಪ)",
    en: "108 Recitations Daily at Dawn (1 Full Mala)",
    hi: "प्रतिदिन प्रातःकाल १०८ बार (एक माला जप)",
    te: "ప్రతిరోజూ ఉదయం 108 సార్లు (ఒక మాల జపం)",
    ta: "தினசரி காலையில் 108 முறை (ஒரு மாலை ஜெபம்)"
  };
  let instructions: Record<SupportedLanguage, string> = {
    kn: "ಸ್ಪಷ್ಟ ಉಚ್ಚಾರಣೆಯೊಂದಿಗೆ ತುಳಸಿ ಅಥವಾ ರುದ್ರಾಕ್ಷಿ ಮಾಲೆಯಿಂದ ಮೇರು ಮಣಿಯನ್ನು ದಾಟದೆ ಜಪಿಸುವುದು.",
    en: "Chant with clear phonetic rhythm using Tulasi or Rudraksha beads without crossing the Meru bead.",
    hi: "तुलसी अथवा रुद्राक्ष माला से बिना मेरु का उल्लंघन किए शुद्ध उच्चारण के साथ जप करें।",
    te: "తులసి లేదా రుద్రాక్ష మాలతో స్పష్టంగా జపించండి.",
    ta: "துளசி அல்லது ருத்ராட்ச மாலையால் சுமேருவை தாண்டாமல் தெளிவாக ஜெபிக்கவும்."
  };
  let stotraKavacha: Record<SupportedLanguage, string> = {
    kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಕವಚ & ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ",
    en: "Sri Subrahmanya Kavacha & Aditya Hrudaya Stotra",
    hi: "श्री सुब्रह्मण्य कवच एवं आदित्य हृदय स्तोत्र",
    te: "శ్రీ సుబ్రహ్మణ్య కవచం & ఆదిత్య హృదయ స్తోత్రం",
    ta: "ஸ்ரீ சுப்பிரமணிய கவசம் & ஆதித்ய ஹிருதய ஸ்தோத்திரம்"
  };
  let sacredSubstance: Record<SupportedLanguage, string> = {
    kn: "ಶುದ್ಧ ರಕ್ತ ಚಂದನ ಅಥವಾ ವಿಭೂತಿ ತಿಲಕ",
    en: "Pure Red Sandalwood (Rakta Chandan) or Bhasma Tilak",
    hi: "शुद्ध रक्त चंदन अथवा भस्म तिलक",
    te: "రక్త చందనం లేదా విభూతి తిలకం",
    ta: "சிவப்பு சந்தனம் அல்லது விபூதி திலகம்"
  };

  if (struggleCategory === "career_obstacles" || struggleCategory === "debt_financial") {
    mantraSanskrit = "॥ ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः । ॐ ह्रीं श्रीं क्लीं महालक्ष्म्यै नमः ॥";
    mantraNative = {
      kn: "॥ ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ । ಓಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕ್ಲೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ॥",
      en: "Om Pram Preem Proum Sah Shanaishcharaya Namaha | Om Hreem Shreem Kleem Mahalakshmyai Namaha",
      hi: "॥ ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः । ॐ ह्रीं श्रीं क्लीं महालक्ष्म्यै नमः ॥",
      te: "॥ ఓం ప్రాం ప్రీం ప్రౌం సః శనైశ్చరాయ నమః । ఓం హ్రీం శ్రీం క్లీం మహాలక్ష్మ్యై నమః ॥",
      ta: "॥ ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ சனைச்சராய நமஹ । ஓம் ஹ்ரீம் ஸ்ரீம் க்லீம் மகாலட்சுமியை நமஹ ॥"
    };
    transliteration = "Om Pram Preem Proum Sah Shanaishcharaya Namaha | Om Hreem Shreem Kleem Mahalakshmyai Namaha";
    stotraKavacha = {
      kn: "ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ & ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರ",
      en: "Sri Kanakadhara Stotra & Dasharatha Shani Stotra",
      hi: "श्री कनकधारा स्तोत्र एवं दशरथ कृत शनि स्तोत्र",
      te: "శ్రీ కనకధారా స్తోత్రం & శని స్తోత్రం",
      ta: "ஸ்ரீ கனகதாரா ஸ்தோத்திரம் & தசரத சனி ஸ்தோத்திரம்"
    };
    sacredSubstance = {
      kn: "ಕಪ್ಪು ಎಳ್ಳೆಣ್ಣೆ ದೀಪದ ರಕ್ಷೆ & ಬಿಲ್ವಪತ್ರೆ ಭಸ್ಮ",
      en: "Sesame Lamp Soot Raksha & Bilva Bhasma",
      hi: "तिल दीप की रक्षा एवं बिल्व भस्म",
      te: "నువ్వుల నూనె దీప రక్ష & బిల్వ భస్మం",
      ta: "நல்லெண்ணெய் தீப ரக்ஷை & வில்வ பஸ்மம்"
    };
  } else if (struggleCategory === "student_academic") {
    mantraSanskrit = "॥ ॐ ऐं सरस्वत्यै नमः । ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥";
    mantraNative = {
      kn: "॥ ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ । ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ ॥",
      en: "Om Aim Saraswatyai Namaha | Om Bram Breem Broum Sah Budhaya Namaha",
      hi: "॥ ॐ ऐं सरस्वत्यै नमः । ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥",
      te: "॥ ఓం ఐం సరస్వత్యై నమః । ఓం బ్రాం బ్రీం బ్రౌం సః బుధాయ నమః ॥",
      ta: "॥ ஓம் ஐம் சரஸ்வத்யை நமஹ । ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ புதாய நமஹ ॥"
    };
    transliteration = "Om Aim Saraswatyai Namaha | Om Bram Breem Broum Sah Budhaya Namaha";
    stotraKavacha = {
      kn: "ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಕವಚ & ಸರಸ್ವತೀ ದ್ವಾದಶನಾಮ ಸ್ತೋತ್ರ",
      en: "Sri Medha Dakshinamurthy Kavacha & Saraswati Dwadashanama",
      hi: "श्री मेधा दक्षिणामूर्ति कवच एवं सरस्वती द्वादशनाम स्तोत्र",
      te: "శ్రీ మేధా దక్షిణామూర్తి కవచం & సరస్వతీ ద్వాదశనామ స్తోత్రం",
      ta: "ஸ்ரீ மேதா தட்சிணாமூர்த்தி கவசம் & சரஸ்வதி துவாதசநாம ஸ்தோத்திரம்"
    };
    sacredSubstance = {
      kn: "ಹರಿದ್ರಾ (ಶುದ್ಧ ಅರಿಶಿನ) ತಿಲಕ",
      en: "Pure Organic Turmeric (Haridra) Tilak",
      hi: "शुद्ध हरिद्रा (हल्दी) तिलक",
      te: "పరిశుద్ధ పసుపు తిలకం",
      ta: "தூய மஞ்சள் திலகம்"
    };
  } else if (struggleCategory === "marriage_delay" || struggleCategory === "relationship_friction") {
    mantraSanskrit = "॥ ॐ द्रां द्रीं द्रौं सः शुक्राय नमः । ॐ उमा-महेश्वराभ्यां नमः ॥";
    mantraNative = {
      kn: "॥ ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ । ಓಂ ಉಮಾ-ಮಹೇಶ್ವರಾಭ್ಯಾಂ ನಮಃ ॥",
      en: "Om Dram Dreem Droum Sah Shukraya Namaha | Om Uma-Maheshwarabhyam Namaha",
      hi: "॥ ॐ द्रां द्रीं द्रौं सः शुक्राय नमः । ॐ उमा-महेश्वराभ्यां नमः ॥",
      te: "॥ ఓం ద్రాం ద్రీం ద్రౌం సః శుక్రాయ నమః । ఓం ఉమా-మహేశ్వరాభ్యాం నమః ॥",
      ta: "॥ ஓம் த்ராம் த்ரீம் த்ரௌம் ஸஃ சுக்கிராய நமஹ । ஓம் உமா-மஹேஸ்வரப்யாம் நமஹ ॥"
    };
    transliteration = "Om Dram Dreem Droum Sah Shukraya Namaha | Om Uma-Maheshwarabhyam Namaha";
    stotraKavacha = {
      kn: "ಶ್ರೀ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಸ್ತೋತ್ರ & ಉಮಾ-ಮಹೇಶ್ವರ ಅಷ್ಟಕ",
      en: "Sri Swayamvara Parvati Stotra & Uma-Maheshwara Ashtakam",
      hi: "श्री स्वयंवर पार्वती स्तोत्र एवं उमा-महेश्वर अष्टक",
      te: "శ్రీ స్వయంవర పార్వతీ స్తోత్రం & ఉమా-మహేశ్వర అష్టకం",
      ta: "ஸ்ரீ சுயம்வர பார்வதி ஸ்தோத்திரம் & உமா-மஹேஸ்வர அஷ்டகம்"
    };
    sacredSubstance = {
      kn: "ಕುಂಕುಮ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರಕ್ಷಾ ಭಸ್ಮ",
      en: "Kumkum & Gokarna Mahabaleshwara Sacred Bhasma",
      hi: "कुमकुम एवं गोकर्ण महाबलेश्वर रक्षा भस्म",
      te: "కుంకుమ & గోకర్ణ మహాబలేశ్వర రక్షా భస్మం",
      ta: "குங்குமம் & கோகர்ண மகாபலேஸ்வரர் ரக்ஷா பஸ்மம்"
    };
  }

  // 3. Anupana (Sacred Vehicle & Medium of Consumption)
  let anupanaVehicleName: Record<SupportedLanguage, string>;
  let anupanaPrep: Record<SupportedLanguage, string>;
  let anupanaTiming: Record<SupportedLanguage, string>;

  if (struggleCategory === "anger_temper" || struggleCategory === "elite_sports") {
    anupanaVehicleName = {
      kn: "ತಾಮ್ರೋದಕ (ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ರಾತ್ರಿ ಇರಿಸಿದ ಶುದ್ಧ ಜಲ)",
      en: "Tamra Jala (Overnight Copper Energized Water)",
      hi: "ताम्रोदक (तांबे के पात्र में रातभर रखा शीतल जल)",
      te: "తామ్రోదకం (రాగి పాత్రలో రాత్రంతా ఉంచిన శుద్ధ జలం)",
      ta: "தாம்பிர ஜலம் (செம்பு பாத்திரத்தில் இரவு முழுவதும் வைக்கப்பட்ட நீர்)"
    };
    anupanaPrep = {
      kn: "ರಾತ್ರಿ ತಾಮ್ರದ ಲೋಟ ಅಥವಾ ಪಾತ್ರೆಯಲ್ಲಿ ಶುದ್ಧ ಕುಡಿಯುವ ನೀರನ್ನು ಇರಿಸಿ. ಮುಂಜಾನೆ ಪೂರ್ವಕ್ಕೆ ಮುಖಮಾಡಿ ಜಪದ ನಂತರ ೧ ಲೋಟ ನೀರನ್ನು ನಿಧಾನವಾಗಿ ಸೇವಿಸಿ. ಇದು ದೇಹದೊಳಗಿನ ಪಿತ್ತ-ಅಗ್ನಿಯನ್ನು ತಕ್ಷಣ ಶಮನಗೊಳಿಸುತ್ತದೆ.",
      en: "Store pure drinking water in a copper cup overnight. At sunrise, facing East after japa, sip 1 glass slowly to pacify gastric and neural Pitta immediately.",
      hi: "रात में तांबे के पात्र में जल रखें। प्रातः पूर्व मुख होकर जप के पश्चात एक गिलास जल घूंट-घूंट पिएं। यह आंतरिक पित्त को तुरंत शांत करता है।",
      te: "రాగి పాత్రలో నీటిని ఉంచి ఉదయం తూర్పు ముఖంగా కూర్చుని తాగండి. ఇది పిత్తాన్ని తగ్గిస్తుంది.",
      ta: "செம்பு பாத்திரத்தில் வைத்த நீரை காலையில் கிழக்கு நோக்கி அமர்ந்து அருந்தவும். இது பித்தத்தை தணிக்கும்."
    };
    anupanaTiming = {
      kn: "ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯದ ಸಮಯದಲ್ಲಿ (ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ)",
      en: "At Sunrise during Brahma Muhurtha (Empty Stomach)",
      hi: "प्रातः सूर्योदय वेला में (खाली पेट)",
      te: "సూర్యోదయ వేళలో (ఖాళీ కడుపుతో)",
      ta: "சூரியோதய வேளையில் (வெறும் வயிற்றில்)"
    };
  } else if (struggleCategory === "mental_anxiety" || struggleCategory === "health_vitality") {
    anupanaVehicleName = {
      kn: "ರಜತೋದಕ / ಕ್ಷೀರ ತೀರ್ಥ (ಬೆಳ್ಳಿ ಪಾತ್ರೆಯ ಶುದ್ಧ ನೀರು ಅಥವಾ ಹಾಲು)",
      en: "Rajata Jala / Ksheera Theertha (Silver Energized Water or Warm Milk)",
      hi: "रजतोदक / क्षीर तीर्थ (चांदी के पात्र में रखा जल अथवा दुग्ध)",
      te: "రజతోదకం (వెండి పాత్రలోని పాలు లేదా నీరు)",
      ta: "ரஜத ஜலம் (வெள்ளி பாத்திரத்தில் வைக்கப்பட்ட பால் அல்லது நீர்)"
    };
    anupanaPrep = {
      kn: "ಬೆಳ್ಳಿಯ ಪಾತ್ರೆಯಲ್ಲಿ ಶುದ್ಧ ನೀರು ಅಥವಾ ಆಕಳ ಹಾಲನ್ನು ೩ ಗಂಟೆಗಳ ಕಾಲ ಇರಿಸಿ. ಸಂಧ್ಯಾಕಾಲದಲ್ಲಿ ಅಥವಾ ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಉತ್ತರಕ್ಕೆ ಮುಖಮಾಡಿ ಸೇವಿಸುವುದರಿಂದ ಮನಸ್ಸು ಶಾಂತವಾಗಿ ಗಾಢ ನಿದ್ರೆ ಬರುತ್ತದೆ.",
      en: "Infuse water or boiled pure cow milk in a pure silver tumbler for 3 hours. Consume at twilight or bedtime facing North to induce deep restorative sleep and settle autonomic turbulence.",
      hi: "चांदी के पात्र में जल अथवा गाय का दूध ३ घंटे रखें। सायंकाल उत्तर मुख होकर इसका सेवन करें; यह अनिद्रा व मानसिक चंचलता को दूर करता है।",
      te: "వెండి పాత్రలోని నీరు లేదా పాలను సాయంత్రం సేవించండి. ఇది మానసిక శాంతిని ఇస్తుంది.",
      ta: "வெள்ளி பாத்திரத்தில் வைத்த நீரை மாலையில் அருந்தவும். இது மன அமைதியையும் தூக்கத்தையும் தரும்."
    };
    anupanaTiming = {
      kn: "ಸಂಧ್ಯಾಕಾಲ (ಸೂರ್ಯಾಸ್ತದ ನಂತರ) ಅಥವಾ ರಾತ್ರಿ ಶಯನ ಪೂರ್ವ",
      en: "Twilight Sandhya (Post-Sunset) or 30 Mins Before Sleep",
      hi: "सायं संध्याकाल अथवा रात्रि शयन से पूर्व",
      te: "సాయంత్రం లేదా పడుకునే ముందు",
      ta: "சாயங்காலம் அல்லது தூங்குவதற்கு முன்"
    };
  } else if (struggleCategory === "student_academic") {
    anupanaVehicleName = {
      kn: "ತುಳಸೀ ತೀರ್ಥ (ಶುದ್ಧ ತುಳಸೀ ದಳ ಯುಕ್ತ ಜಲ)",
      en: "Tulasi Theertha (Sacred Tulasi Infused Water)",
      hi: "तुलसी तीर्थ (पवित्र तुलसी दल युक्त जल)",
      te: "తులసీ తీర్థం (తులసి దళాలతో కూడిన జలం)",
      ta: "துளசி தீர்த்தம் (துளசி இலை கலந்த புனித நீர்)"
    };
    anupanaPrep = {
      kn: "ತಾಮ್ರದ ಪಾತ್ರೆಯ ಶುದ್ಧ ನೀರಿನಲ್ಲಿ ೩ ತಾಜಾ ತುಳಸೀ ದಳಗಳನ್ನು ಹಾಕಿ. 'ಐಂ' ಬೀಜ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಉಚ್ಚರಿಸಿ ಆ ತೀರ್ಥವನ್ನು ಪ್ರಾತಃ ಅಧ್ಯಯನಕ್ಕೆ ಮುನ್ನ ಸೇವಿಸಿ. ಇದು ನೆನಪಿನ ಶಕ್ತಿ ಮತ್ತು ಏಕಾಗ್ರತೆಯನ್ನು ದುಪ್ಪಟ್ಟುಗೊಳಿಸುತ್ತದೆ.",
      en: "Place 3 freshly washed Tulasi leaves into a copper cup of fresh water. Chant the Saraswati Beeja 'AIM' 11 times and sip before morning study to stimulate neuro-cognitive plasticity and photographic recall.",
      hi: "तांबे के पात्र में ३ तुलसी दल डालें। 'ऐं' बीज मंत्र का ११ बार उच्चारण कर अध्ययन से पूर्व ग्रहण करें। यह एकाग्रता और स्मरणशक्ति बढ़ाता है।",
      te: "నీటిలో 3 తులసి ఆకులు వేసి 'ఐం' మంత్రం జపించి తాగండి. జ్ఞాపకశక్తి పెరుగుతుంది.",
      ta: "துளசி இலைகளை நீரில் இட்டு 'ஐம்' மந்திரம் ஜெபித்து அருந்தவும். நினைவாற்றல் கூடும்."
    };
    anupanaTiming = {
      kn: "ಮುಂಜಾನೆ ಅಧ್ಯಯನ ಆರಂಭಿಸುವ ಮುನ್ನ (06:00 - 07:00)",
      en: "Dawn Before Morning Study (06:00 - 07:00 AM)",
      hi: "प्रातः अध्ययन प्रारंभ करने से पूर्व",
      te: "ఉదయం చదువు ప్రారంభించే ముందు",
      ta: "காலை படிப்பு தொடங்கும் முன்"
    };
  } else {
    anupanaVehicleName = {
      kn: "ಹರಿದ್ರೋದಕ & ಗಂಗಾತೀರ್ಥ (ಸ್ವಲ್ಪ ಅರಿಶಿನ & ಗಂಗಾಜಲ ಯುಕ್ತ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರು)",
      en: "Haridra & Ganga Theertha (Turmeric & Ganga Infused Luke-Warm Water)",
      hi: "हरिद्रोदक एवं गंगातीर्थ (हल्दी एवं गंगाजल युक्त गुनगुना जल)",
      te: "హరిద్రోదకం (పసుపు & గంగాజలం కలిపిన గోరువెచ్చని నీరు)",
      ta: "ஹரித்ரோதகம் (மஞ்சள் மற்றும் கங்காதீர்த்தம் கலந்த நீர்)"
    };
    anupanaPrep = {
      kn: "ಒಂದು ಲೋಟ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿಗೆ ಒಂದು ಚಿಟಿಕೆ ಶುದ್ಧ ಅರಿಶಿನ ಹಾಗೂ ಕೆಲವು ಹನಿ ಗಂಗಾಜಲ ಸೇರಿಸಿ. ಪ್ರಾತಃಕಾಲ ಪೂರ್ವಾಭಿಮುಖವಾಗಿ ಕುಳಿತು ಜಪದ ನಂತರ ಸೇವಿಸುವುದರಿಂದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ಶಮನವಾಗಿ ಭಾಗ್ಯೋದಯವಾಗುತ್ತದೆ.",
      en: "Blend a pinch of organic turmeric and a few drops of holy Ganga water into luke-warm water. Sip after dawn japa facing East to harmonize all 9 planetary rays and unblock fortune.",
      hi: "गुनगुने जल में एक चुटकी हल्दी एवं गंगाजल की कुछ बूंदें मिलाएं। प्रातः जप के उपरांत पूर्व मुख होकर पिएं।",
      te: "గోరువెచ్చని నీటిలో కొద్దిగా పసుపు, గంగాజలం కలిపి ఉదయం జపం తర్వాత తాగండి.",
      ta: "வெதுவெதுப்பான நீரில் சிறிதளவு மஞ்சள், கங்கா தீர்த்தம் கலந்து ஜெபத்திற்குப் பின் அருந்தவும்."
    };
    anupanaTiming = {
      kn: "ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ (05:30 - 06:30 AM)",
      en: "Brahma Muhurtha (05:30 - 06:30 AM)",
      hi: "ब्राह्म मुहूर्त वेला (05:30 - 06:30)",
      te: "బ్రాహ్మీ ముహూర్తం (05:30 - 06:30)",
      ta: "பிரம்ம முகூர்த்தம் (05:30 - 06:30)"
    };
  }

  // 4. Pathya & Apathya (Dietary & Behavioral Protocol)
  const pathyaPrescribed: Array<Record<SupportedLanguage, string>> = [
    {
      kn: "ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಹಸುವಿನ ಹಾಲು, ಹಸಿ ಹೆಸರುಕಾಳು, ದಾಳಿಂಬೆ ಅಥವಾ ಸಿಹಿ ಹಣ್ಣುಗಳ ಸೇವನೆ.",
      en: "Daily intake of fresh cow milk, green moong, sweet pomegranate, and seasonal fruits.",
      hi: "प्रतिदिन प्रातः देशी गाय का दूध, मूंग दाल, अनार अथवा मीठे फलों का सेवन।",
      te: "ఆవు పాలు, పెసలు, దానిమ్మ మరియు తీపి పండ్ల సేవనం.",
      ta: "பசும்பால், பாசிப்பயறு, மாதுளை மற்றும் இனிப்பு பழங்கள் உட்கொள்ளுதல்."
    },
    {
      kn: "ದಿನವಿಡೀ ಶಾಂತ, ಮಿತ ಹಾಗೂ ಹಿತಕರ ಮಾತು; ಸೂರ್ಯಾಸ್ತ ಸಮಯದಲ್ಲಿ ಕನಿಷ್ಠ ೧೫ ನಿಮಿಷ ಮೌನ ಧಾರಣೆ.",
      en: "Speaking softly and truth-bound; observing at least 15 minutes of sacred silence at sunset.",
      hi: "शांत एवं मधुर वाणी; सायंकाल गोधूलि वेला में १५ मिनट मौन धारण।",
      te: "శాంతమైన మాటలు; సూర్యాస్తమయ సమయంలో 15 నిమిషాల మౌనం.",
      ta: "அமைதியான பேச்சு; சூரிய அஸ்தமன வேளையில் 15 நிமிடம் மௌனம் காத்தல்."
    },
    {
      kn: "ಪ್ರತಿದಿನ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಹಾಗೂ ಕುಲದೇವತೆಗೆ ನಮಸ್ಕರಿಸುವುದು.",
      en: "Lighting a pure cow ghee lamp daily and bowing to Lord Mahabaleshwara and Kula Devata.",
      hi: "नित्य गोघृत का दीपक जलाकर भगवान महाबलेश्वर एवं कुलदेवता का स्मरण।",
      te: "నిత్యం నేతి దీపం వెలిగించి కులదేవతను పూజించడం.",
      ta: "தினசரி நெய் தீபம் ஏற்றி மகாபலேஸ்வரரையும் குலதெய்வத்தையும் வணங்குதல்."
    }
  ];

  const apathyaProhibited: Array<Record<SupportedLanguage, string>> = [
    {
      kn: "೧೫-೨೦ ದಿನಗಳ ಕಾಲ ಅತಿಯಾದ ಖಾರ, ಮಸಾಲೆ, ಎಣ್ಣೆ ಜಿಡ್ಡಿನ ತಿಂಡಿ, ಹಳಸಿದ ಆಹಾರ ಹಾಗೂ ಮಾಂಸಾಹಾರ ಸೇವನೆ ಸಂಪೂರ್ಣ ನಿಷಿದ್ಧ.",
      en: "Strictly prohibit stale, overly spicy, deep-fried, tamasic foods and non-vegetarian diet for 15-20 days.",
      hi: "१५-२० दिनों तक अत्यधिक तीखा, बासी, तामसिक भोजन एवं मांसाहार का पूर्ण त्याग।",
      te: "15-20 రోజుల పాటు కారం, మసాలా, తామసిక ఆహారం మరియు మాంసాహారం నిషేధం.",
      ta: "15-20 நாட்களுக்கு அதிக காரம், பழைய உணவு மற்றும் அசைவ உணவுகளை முற்றிலும் தவிர்க்கவும்."
    },
    {
      kn: "ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಆವೇಶದ ವಾದ-ವಿವಾದ, ಕೋಪದ ಬೈಗುಳ, ಸುಳ್ಳು ಹೇಳುವುದು ಹಾಗೂ ಅನ್ಯರ ದೂಷಣೆಯಲ್ಲಿ ತೊಡಗಬಾರದು.",
      en: "Strictly avoid impulsive arguments, harsh outbursts, falsehood, or criticising others.",
      hi: "क्रोध, कटु वचन, मिथ्या भाषण एवं दूसरों की निंदा से पूर्णतः बचें।",
      te: "కోపం, అసత్యం మరియు ఇతరులను నిందించడం పూర్తిగా మానాలి.",
      ta: "வீண் வாக்குவாதம், கோபமான சொற்கள் மற்றும் பொய் பேசுவதை தவிர்க்கவும்."
    },
    {
      kn: "ಸೂರ್ಯೋದಯದ ನಂತರ ನಿದ್ರೆ ಮಾಡುವುದು ಹಾಗೂ ರಾತ್ರಿ ತಡವಾಗಿ ಊಟ ಮಾಡುವುದು ವರ್ಜ್ಯ.",
      en: "Sleeping past sunrise and late-night heavy dinners must be strictly avoided.",
      hi: "सूर्योदय के पश्चात सोना एवं देर रात भोजन करना पूर्ण वर्जित है।",
      te: "సూర్యోదయం తర్వాత నిద్రించడం మరియు రాత్రి ఆలస్యంగా భోజనం చేయడం నిషిద్ధం.",
      ta: "சூரியோதயத்திற்குப் பின் தூங்குவதும் இரவு தாமதமாக உண்பதும் கூடாது."
    }
  ];

  // 5. Chikitsa Kala & Direction
  const chikitsaKala = {
    idealTimeWindow: {
      kn: "ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ (05:30 - 06:45 AM) ಅಥವಾ ಪ್ರದೋಷ ಕಾಲ (18:00 - 19:15)",
      en: "Brahma Muhurtha (05:30 - 06:45 AM) or Pradosha Sandhya (18:00 - 19:15)",
      hi: "ब्राह्म मुहूर्त (05:30 - 06:45) अथवा प्रदोष काल (18:00 - 19:15)",
      te: "బ్రాహ్మీ ముహూర్తం (05:30 - 06:45) లేదా ప్రదోష వేళ (18:00 - 19:15)",
      ta: "பிரம்ம முகூர்த்தம் (05:30 - 06:45) அல்லது பிரதோஷ காலம் (18:00 - 19:15)"
    },
    facingDirection: {
      kn: "ಪೂರ್ವ (ಆರೋಗ್ಯ & ತೇಜಸ್ಸು) ಅಥವಾ ಉತ್ತರ (ಶಾಂತಿ & ಸಮೃದ್ಧಿ)",
      en: "East (for Vitality & Cognition) or North (for Wealth & Peace)",
      hi: "पूर्व (आरोग्य एवं तेज) अथवा उत्तर (शांति एवं समृद्धि)",
      te: "తూర్పు (ఆరోగ్యం) లేదా ఉత్తరం (శాంతి & సంపద)",
      ta: "கிழக்கு (ஆரோக்கியம்) அல்லது வடக்கு (சாந்தி & செல்வம்)"
    },
    asanaMaterial: {
      kn: "ಶುದ್ಧ ಬಿಳಿ ಹತ್ತಿ ಅಥವಾ ಉಣ್ಣೆಯ ಆಸನ (ಕುಶಾಸನ ಶ್ರೇಷ್ಠ)",
      en: "Pure white cotton or woolen asana (Kushasana preferred)",
      hi: "श्वेत सूती अथवा ऊनी आसन (कुशासन सर्वोत्तम)",
      te: "తెల్లని నూలు లేదా ఉన్ని ఆసనం (కుశాసనం శ్రేష్టం)",
      ta: "தூய பருத்தி அல்லது கம்பளி ஆசனம் (தர்பை ஆசனம் சிறந்தது)"
    }
  };

  // 6. 15-to-20 Day Measurable Relief Progression (ಅನುಭವಕ್ಕೆ ಬರುವ ಚಿಕಿತ್ಸಾ ಫಲಶ್ರುತಿ)
  const reliefMilestones = {
    day1To3: {
      stage: {
        kn: "ಹಂತ ೧ (ದಿನ ೧ - ೩): ಪ್ರಾಥಮಿಕ ಉಪಶಮನ (Acute Crisis Calming)",
        en: "Stage 1 (Days 1 - 3): Acute Crisis Calming",
        hi: "चरण १ (दिन १ - ३): प्राथमिक उपशमन",
        te: "దశ 1 (రోజులు 1 - 3): ప్రాథమిక ఉపశమనం",
        ta: "படி 1 (நாட்கள் 1 - 3): ஆரம்ப நிவாரணம்"
      },
      observation: {
        kn: "ಹೃದಯ ಬಡಿತ ಮತ್ತು ರಕ್ತದೊತ್ತಡ ಸಹಜ ಸ್ಥಿತಿಗೆ ಮರಳುವುದು; ತೀವ್ರ ಆವೇಶ, ಆತಂಕ ಮತ್ತು ಹತಾಶೆಯ ಭಾವನೆಗಳು ತಕ್ಷಣ ಶಮನಗೊಳ್ಳಲು ಆರಂಭವಾಗುತ್ತವೆ.",
        en: "Autonomic heart rate and neural reactivity settle; acute spikes of panic, frustration, and reactive anger subside markedly.",
        hi: "हृदय गति एवं रक्तचाप सामान्य होता है; तीव्र क्रोध, भय और निराशा के आवेग शांत होने लगते हैं।",
        te: "గుండె వేగం మరియు రక్తపోటు స్థిరపడతాయి; తీవ్ర ఆవేశం మరియు భయం తగ్గడం మొదలవుతుంది.",
        ta: "இதய துடிப்பு மற்றும் ரத்த அழுத்தம் சீராகும்; தீவிர கோபம் மற்றும் பய உணர்வுகள் தணிய தொடங்கும்."
      }
    },
    day4To7: {
      stage: {
        kn: "ಹಂತ ೨ (ದಿನ ೪ - ೭): ಮಾನಸಿಕ ಸ್ಥಿರತೆ & ಗಾಢ ನಿದ್ರೆ (Subconscious Grounding)",
        en: "Stage 2 (Days 4 - 7): Subconscious Grounding & Restorative Sleep",
        hi: "चरण २ (दिन ४ - ७): मानसिक स्थिरता एवं सुखद निद्रा",
        te: "దశ 2 (రోజులు 4 - 7): మానసిక స్థిరత్వం & నిద్ర",
        ta: "படி 2 (நாட்கள் 4 - 7): மன அமைதி & ஆழ்ந்த தூக்கம்"
      },
      observation: {
        kn: "ಗಾಢವಾದ ವಿಶ್ರಾಂತಿ ನಿದ್ರೆ ಲಭಿಸುತ್ತದೆ; ರಾತ್ರಿಯ ವೇಳೆ ಕಾಡುವ ಅತಿಯಾದ ಯೋಚನೆಗಳು ೪೦-೫೦% ರಷ್ಟು ಕಡಿಮೆಯಾಗಿ ಮುಂಜಾನೆ ಹೊಸ ಉಲ್ಲಾಸ ಮೂಡುತ್ತದೆ.",
        en: "Deep restorative REM sleep returns; repetitive nocturnal overthinking and irritability decline by 40-50%, infusing tranquil resilience.",
        hi: "गहरी व शांत निद्रा प्राप्त होती है; रात की बेचैनी एवं अत्यधिक सोच में ४०-५०% कमी आकर मन में उत्साह जगता है।",
        te: "గాఢ నిద్ర పడుతుంది; రాత్రివేళ అధిక ఆలోచనలు 40-50% తగ్గి ఉదయం ప్రశాంతత కలుగుతుంది.",
        ta: "ஆழ்ந்த அமைதியான உறக்கம் கிட்டும்; இரவில் அதிக சிந்தனை 40-50% குறைந்து உள்ளத்தில் புதுத்தெம்பு பிறக்கும்."
      }
    },
    day8To14: {
      stage: {
        kn: "ಹಂತ ೩ (ದಿನ ೮ - ೧೪): ಕರ್ಮಿಕ ಮಾರ್ಗಭೇದನ & ಅಡೆತಡೆ ನಿವಾರಣೆ (Karmic Unblocking)",
        en: "Stage 3 (Days 8 - 14): Karmic Roadblock Dissolution",
        hi: "चरण ३ (दिन ८ - १४): कर्मिक अवरोध निवारण",
        te: "దశ 3 (రోజులు 8 - 14): కర్మిక ఆటంకాల తొలగింపు",
        ta: "படி 3 (நாட்கள் 8 - 14): கர்ம தடைகள் விலகுதல்"
      },
      observation: {
        kn: "ದೀರ್ಘಕಾಲದಿಂದ ನಿಂತುಹೋಗಿದ್ದ ಕೆಲಸಗಳಲ್ಲಿ ಚಲನೆ ಕಂಡುಬರುತ್ತದೆ; ನಿರೀಕ್ಷಿತ ಸಕಾರಾತ್ಮಕ ಕರೆಗಳು, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಹಣಕಾಸಿನ ಮುಗ್ಗಟ್ಟು ಸಡಿಲಗೊಳ್ಳುತ್ತದೆ.",
        en: "Stalled endeavors resume motion; long-awaited positive messages arrive, communication barriers dissolve, and financial/relationship gridlocks loosen up.",
        hi: "लंबे समय से रुके हुए कार्यों में गति आती है; शुभ समाचार मिलते हैं और आर्थिक अथवा पारिवारिक तनाव शिथिल होता है।",
        te: "నిలిచిపోయిన పనులలో కదలిక వస్తుంది; శుభ వార్తలు అందుతాయి మరియు ఆర్థిక సమస్యలు తగ్గుముఖం పడతాయి.",
        ta: "நீண்ட நாட்களாக தடைபட்ட காரியங்கள் நகர தொடங்கும்; நற்செய்திகள் வரும் மற்றும் பொருளாதார நெருக்கடி குறையும்."
      }
    },
    day15To20: {
      stage: {
        kn: "ಹಂತ ೪ (ದಿನ ೧೫ - ೨೦): ಪ್ರತ್ಯಕ್ಷ ಫಲಸಿದ್ಧಿ & ಪರಿಹಾರದ ಅನುಭವ (Tangible Breakthrough & Relief)",
        en: "Stage 4 (Days 15 - 20): Tangible Breakthrough & Palpable Relief",
        hi: "चरण ४ (दिन १५ - २०): प्रत्यक्ष फलसिद्धि एवं राहत का अनुभव",
        te: "దశ 4 (రోజులు 15 - 20): ప్రత్యక్ష ఫలితం & ఉపశమనం",
        ta: "படி 4 (நாட்கள் 15 - 20): கண்கூடான வெற்றி & நிம்மதி"
      },
      observation: {
        kn: "ಮುಖ್ಯ ಸಮಸ್ಯೆಯಿಂದ ಕಣ್ಣಿಗೆ ಕಾಣುವ ಸ್ಪಷ್ಟ ಮುಕ್ತಿ; ಕಣ್ಣೆದುರೇ ದೈವಿಕ ರಕ್ಷಣೆ, ನವಚೈತನ್ಯ ಮತ್ತು ಜೀವನದಲ್ಲಿ ಸ್ಪಷ್ಟ ಭರವಸೆಯ ತಿರುವು ಗೋಚರವಾಗುತ್ತದೆ.",
        en: "A palpable, tangible breakthrough in your primary struggle manifests; an unmistakable sense of divine protection, renewed enthusiasm, and clear direction replaces helplessness.",
        hi: "मुख्य समस्या से स्पष्ट मुक्ति व राहत का अनुभव; स्पष्ट मानसिक शांति, दैवीय संरक्षण की अनुभूति और जीवन में नई दिशा प्राप्त होती है।",
        te: "ప్రధాన సమస్య నుండి స్పష్టమైన ఉపశమనం లభిస్తుంది; దైవిక రక్షణ భావన మరియు మనస్సులో అఖండ శాంతి కలుగుతాయి.",
        ta: "முக்கிய பிரச்சனையிலிருந்து கண்கூடாக விடுதலை கிடைக்கும்; தெய்வீக பாதுகாப்பு உணர்வும் மனதில் புது நம்பிக்கையும் மலரும்."
      }
    },
    day21To45: {
      stage: {
        kn: "ಹಂತ ೫ (ದಿನ ೨೧ - ೪೫): ಮಂಡಲ ಪೂರ್ಣತಾ & ಶಾಶ್ವತ ರಕ್ಷಾ ಕವಚ (Mandala Poornata & Permanent Armor)",
        en: "Stage 5 (Days 21 - 45): Mandala Poornata & Permanent Spiritual Armor",
        hi: "चरण ५ (दिन २१ - ४५): मंडल पूर्णता एवं स्थायी रक्षा कवच",
        te: "దశ 5 (రోజులు 21 - 45): మండల పూర్ణత & రక్షణ కవచం",
        ta: "படி 5 (நாட்கள் 21 - 45): மண்டல பூர்த்தி & நிரந்தர பாதுகாப்பு"
      },
      observation: {
        kn: "ಏಕ ಮಂಡಲ ಸಾಧನೆಯಿಂದ ಜಾತಕದ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣ ಭಸ್ಮವಾಗಿ, ಕುಟುಂಬದಲ್ಲಿ ಶಾಶ್ವತ ನೆಮ್ಮದಿ, ಅಭೀಷ್ಟ ಸಿದ್ಧಿ ಮತ್ತು ದೈವಾನುಗ್ರಹ ಸ್ಥಿರಗೊಳ್ಳುತ್ತದೆ.",
        en: "Completing 45 days of consecrated sadhana incinerates deep-rooted karmic debts, establishing permanent spiritual immunity, domestic bliss, and lasting prosperity.",
        hi: "एक मंडल साधना से ग्रहदोष भस्म होकर परिवार में स्थायी सुख-शांति, अभीष्ट सिद्धि और अखंड समृद्धि स्थापित होती है।",
        te: "ఒక మండల సాధనతో గ్రహదోషాలు తొలగి కుటుంబంలో శాశ్వత శాంతి, సంపద మరియు దైవానుగ్రహం స్థిరపడతాయి.",
        ta: "ஒரு மண்டல வழிபாட்டால் கிரக தோஷங்கள் நீங்கி குடும்பத்தில் நிரந்தர அமைதி, விருப்பங்கள் நிறைவேறுதல் மற்றும் சுபிட்சம் உண்டாகும்."
      }
    }
  };

  return {
    title: {
      kn: "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಚಿಕಿತ್ಸಾ ಪತ್ರ (Medical-Grade Astrological Prescription)",
      en: "Medical-Grade Astrological Prescription (Vedic Chikitsa Patra)",
      hi: "वैदिक ज्योतिषीय चिकित्सा पत्र (Medical-Grade Astrological Prescription)",
      te: "వైదిక జ్యోతిష్య చికిత్సా పత్రం (Medical-Grade Astrological Prescription)",
      ta: "வைதீக ஜோதிட மருத்துவ சீட்டு (Medical-Grade Astrological Prescription)"
    },
    subtitle: {
      kn: "ಆಯುರ್ವೇದೀಯ ನಿಧಾನ, ದಿವ್ಯ ಮಂತ್ರ ಔಷಧ, ಪವಿತ್ರ ಅನುಪಾನ ಸೇವನೆ, ಪಥ್ಯ-ಅಪಥ್ಯ ಹಾಗೂ ೧೫-೨೦ ದಿನಗಳ ಚಿಕಿತ್ಸಾ ಫಲಶ್ರುತಿ.",
      en: "Shastric Nidana diagnosis, Divine Mantra medicine, Sacred Anupana carrier, Strict Pathya regimen & 15-to-20 Day Relief Progression.",
      hi: "आयुर्वेदिक निदान, दिव्य मंत्र औषधि, पवित्र अनुपान सेवन, पथ्य-अपथ्य एवं १५-२० दिवसीय प्रत्यक्ष फलश्रुति।",
      te: "ఆయుర్వేద నిదానం, దివ్య మంత్ర ఔషధం, పవిత్ర అనుపానం, పథ్య నియమాలు & 15-20 రోజుల ప్రత్యక్ష ఫలితం.",
      ta: "ஆயுர்வேத சிகிச்சை முறை, மந்திர மருந்து, புனித அனுபானம், பத்திய உணவு முறை & 15-20 நாள் நிவாரண பலன்."
    },
    nidana: {
      primaryDosha,
      doshaLabel,
      rootCauseDescription,
      affectedNadis
    },
    aushadha: {
      beejaMantra: {
        mantraSanskrit,
        mantraNative,
        transliteration,
        dailyDosageCount,
        instructions
      },
      stotraKavacha,
      sacredSubstance
    },
    anupana: {
      vehicleName: anupanaVehicleName,
      preparationMethod: anupanaPrep,
      intakeTiming: anupanaTiming
    },
    pathyaApathya: {
      pathyaPrescribed,
      apathyaProhibited
    },
    chikitsaKala,
    reliefMilestones
  };
}

export function computeMandalaVrataSadhana(
  struggleCategory: KundliRemedyDiagnosis["primaryStruggle"]["category"],
  catalystGraha: PlanetName,
  moonNakshatraIndex: number,
  devoteeName: string,
  gotra?: string
): MandalaVrataSadhana {
  // 1. Tara Bala Category Determination
  let taraBalaCategory: Record<SupportedLanguage, string>;
  let taraBalaReason: Record<SupportedLanguage, string>;

  if (["anger_temper", "mental_anxiety", "health_vitality"].includes(struggleCategory)) {
    taraBalaCategory = {
      kn: "ಕ್ಷೇಮ ತಾರೆ (ಆರೋಗ್ಯ, ರಕ್ಷಣೆ & ಪರಮ ಮನಃಶಾಂತಿ ತಾರೆ)",
      en: "Kshema Tara (Well-being, Protection & Peace Star)",
      hi: "क्षेम तारा (आरोग्य, सुरक्षा एवं मानसिक शांति तारा)",
      te: "క్షేమ తార (ఆరోగ్యం, రక్షణ & మానసిక శాంతి తార)",
      ta: "க்ஷேம தாரை (ஆரோக்கியம், பாதுகாப்பு & மன அமைதி நட்சத்திரம்)"
    };
    taraBalaReason = {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ೪, ೧೩ ಅಥವಾ ೨೨ನೇ ಕ್ಷೇಮ ತಾರೆಯಲ್ಲಿ ಈ ಮಂಡಲ ಸಾಧನೆ ಆರಂಭಿಸುವುದರಿಂದ ದೇಹ-ಮನಸ್ಸಿನ ದೋಷಗಳು ತಕ್ಷಣ ಶಮನವಾಗಿ ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಶಾಂತಿ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      en: "Commencing this Mandala sadhana on 4th, 13th or 22nd Kshema Tara pacifies physiological and mental afflictions, securing peace, health, and psychic shielding.",
      hi: "जन्म नक्षत्र से ४, १३ या २२वें क्षेम तारे में साधना आरंभ करने से दैहिक एवं मानसिक संताप शांत होकर आरोग्य एवं शांति की सिद्धि होती है।",
      te: "జన్మ నక్షత్రం నుండి 4, 13 లేదా 22వ క్షేమ తారలో ఈ సాధన ప్రారంభించడం వలన శారీరక, మానసిక దోషాలు తొలగి శాంతి లభిస్తుంది.",
      ta: "ஜன்ம நட்சத்திரத்திலிருந்து 4, 13 அல்லது 22வது க்ஷேம தாரையில் தொடங்கினால் உடல், மன உபாதைகள் நீங்கி ஆரோக்கியமும் அமைதியும் உண்டாகும்."
    };
  } else if (["debt_financial", "leadership_expansion"].includes(struggleCategory)) {
    taraBalaCategory = {
      kn: "ಸಂಪತ್ ತಾರೆ (ಧನ ಸಮೃದ್ಧಿ, ಸೌಭಾಗ್ಯ & ಅಭಿವೃದ್ಧಿ ತಾರೆ)",
      en: "Sampat Tara (Wealth, Prosperity & Growth Star)",
      hi: "सम्पत् तारा (धन समृद्धि, सौभाग्य एवं वृद्धि तारा)",
      te: "సంపత్ తార (ధన సమృద్ధి, సౌభాగ్యం & అభివృద్ధి తార)",
      ta: "சம்பத் தாரை (செல்வம், செழிப்பு & வளர்ச்சி நட்சத்திரம்)"
    };
    taraBalaReason = {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ೨, ೧೧ ಅಥವಾ ೨೦ನೇ ಸಂಪತ್ ತಾರೆಯಲ್ಲಿ ವ್ರತ ಕೈಗೊಳ್ಳುವುದರಿಂದ ಕುಬೇರ-ಲಕ್ಷ್ಮೀ ಕೃಪೆ ಉಂಟಾಗಿ ಸಾಲ ಬಾಧೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಧನ ಸಮೃದ್ಧಿ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      en: "Initiating on 2nd, 11th, or 20th Sampat Tara invokes Kubera-Lakshmi grace, dissolving debt constraints and unlocking enduring wealth channels.",
      hi: "जन्म नक्षत्र से २, ११ या २०वें सम्पत् तारे में व्रत करने से कुबेर-लक्ष्मी कृपा से ऋण मुक्ति होकर अक्षय धन समृद्धि की प्राप्ति होती है।",
      te: "జన్మ నక్షత్రం నుండి 2, 11 లేదా 20వ సంపత్ తారలో వ్రతం ప్రారంభించడం వల్ల లక్ష్మీ కటాక్షంతో రుణ విముక్తి కలిగి ధన సమృద్ధి కలుగుతుంది.",
      ta: "ஜன்ம நட்சத்திரத்திலிருந்து 2, 11 அல்லது 20வது சம்பத் தாரையில் ஆரம்பித்தால் லட்சுமி அருளால் கடன் நீங்கி செல்வம் பெருகும்."
    };
  } else if (["relationship_friction", "marriage_delay", "creative_stardom"].includes(struggleCategory)) {
    taraBalaCategory = {
      kn: "ಮಿತ್ರ / ಪರಮ ಮಿತ್ರ ತಾರೆ (ಸೌಹಾರ್ದತೆ, ಪ್ರೇಮ & ದೈವಾನುಗ್ರಹ ತಾರೆ)",
      en: "Mitra / Parama Mitra Tara (Harmony, Divine Grace & Love Star)",
      hi: "मित्र / परम मित्र तारा (सौहार्द, प्रेम एवं दैवानुग्रह तारा)",
      te: "మిత్ర / పరమ మిత్ర తార (సౌహార్దం, ప్రేమ & దైవానుగ్రహ తార)",
      ta: "மித்ர / பரம மித்ர தாரை (நல்லிணக்கம், அன்பு & தெய்வ அருள் நட்சத்திரம்)"
    };
    taraBalaReason = {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ೮, ೯, ೧೭, ೧೮, ೨೬ ಅಥವಾ ೨೭ನೇ ಮಿತ್ರ-ಪರಮಮಿತ್ರ ತಾರೆಯಲ್ಲಿ ಸಾಧನೆ ಆರಂಭಿಸುವುದರಿಂದ ವಿವಾಹ ವಿಘ್ನಗಳು ಕರಗಿ, ಕಲ್ಯಾಣ ಸೌಭಾಗ್ಯ ಮತ್ತು ಕೌಟುಂಬಿಕ ಸಾಮರಸ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      en: "Beginning on 8th, 9th, 17th, 18th, 26th, or 27th Mitra/Parama Mitra Tara resolves matrimonial obstacles and fosters deep familial affection.",
      hi: "जन्म नक्षत्र से मित्र या परम मित्र तारे में साधना आरंभ करने से विवाह बाधाएं दूर होकर गृहस्थ सुख एवं दांपत्य सौहार्द प्राप्त होता है।",
      te: "జన్మ నక్షత్రం నుండి మిత్ర లేదా పరమ మిత్ర తారలో సాధన ఆరంభిస్తే వివాహ విఘ్నాలు తొలగి దాంపత్య సౌభాగ్యం లభిస్తుంది.",
      ta: "ஜன்ம நட்சத்திரத்திலிருந்து மித்ர அல்லது பரம மித்ர தாரையில் தொடங்கினால் திருமண தடைகள் நீங்கி குடும்ப ஒற்றுமை உண்டாகும்."
    };
  } else {
    taraBalaCategory = {
      kn: "ಸಾಧನಾ ತಾರೆ (ಕಾರ್ಯ ಸಿದ್ಧಿ, ಜಯ & ಸಂಕಲ್ಪ ಪೂರ್ತಿ ತಾರೆ)",
      en: "Sadhana Tara (Accomplishment, Victory & Goal Fulfillment Star)",
      hi: "साधना तारा (कार्य सिद्धि, विजय एवं संकल्प पूर्ति तारा)",
      te: "సాధనా తార (కార్య సిద్ధి, విజయం & సంకల్ప పూర్తి తార)",
      ta: "சாதனா தாரை (காரிய சித்தி, வெற்றி & சங்கல்ப பூர்த்தி நட்சத்திரம்)"
    };
    taraBalaReason = {
      kn: "ಜನ್ಮ ನಕ್ಷತ್ರದಿಂದ ೬, ೧೫ ಅಥವಾ ೨೪ನೇ ಸಾಧನಾ ತಾರೆಯಲ್ಲಿ ಈ ಮಂಡಲ ವ್ರತ ಕೈಗೊಳ್ಳುವುದರಿಂದ ಉದ್ಯೋಗ, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಸಕಲ ಸತ್ಸಂಕಲ್ಪಗಳು ನಿರಾತಂಕವಾಗಿ ಸಿದ್ಧಿಸುತ್ತವೆ.",
      en: "Commencing on 6th, 15th, or 24th Sadhana Tara aligns your intentionality with cosmic cosmic rhythm, assuring success in career, study, and noble ventures.",
      hi: "जन्म नक्षत्र से ६, १५ या २४वें साधना तारे में यह मंडल व्रत आरंभ करने से कार्यक्षेत्र, विद्या एवं समस्त संकल्पों में निर्विघ्न सफलता प्राप्त होती है।",
      te: "జన్మ నక్షత్రం నుండి 6, 15 లేదా 24వ సాధనా తారలో ఈ వ్రతం ఆరంభిస్తే ఉద్యోగం, విద్య మరియు సర్వ సంకల్పాలు నెరవేరుతాయి.",
      ta: "ஜன்ம நட்சத்திரத்திலிருந்து 6, 15 அல்லது 24வது சாதனா தாரையில் தொடங்கினால் தொழில், கல்வி மற்றும் சகல சங்கல்பங்களும் நிறைவேறும்."
    };
  }

  // 2. Weekday matching Catalyst Graha
  const weekdayMap: Record<PlanetName, Record<SupportedLanguage, string>> = {
    [PlanetName.Sun]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಭಾನುವಾರ (ಸೂರ್ಯನ ತೇಜಸ್ಸಿನ ದಿನ)",
      en: "Shukla Paksha Sunday (Day of Surya / Vitality)",
      hi: "शुक्ल पक्ष का रविवार (सूर्य देव का पावन दिन)",
      te: "శుక్ల పక్ష ఆదివారం (సూర్య తేజస్సు దినం)",
      ta: "சுக்ல பட்ச ஞாயிற்றுக்கிழமை (சூரியனின் சுப நாள்)"
    },
    [PlanetName.Moon]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಸೋಮವಾರ (ಚಂದ್ರನ ಪ್ರಶಾಂತ ದಿನ)",
      en: "Shukla Paksha Monday (Day of Chandra / Peace)",
      hi: "शुक्ल पक्ष का सोमवार (चन्द्र देव का शुभ दिन)",
      te: "శుక్ల పక్ష సోమవారం (చంద్రుని ప్రశాంత దినం)",
      ta: "சுக்ல பட்ச திங்கட்கிழமை (சந்திரனின் சாந்தி நாள்)"
    },
    [PlanetName.Mars]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ (ಕುಜನ ಧೈರ್ಯ & ಮಂಗಳ ದಿನ)",
      en: "Shukla Paksha Tuesday (Day of Mangala / Courage)",
      hi: "शुक्ल पक्ष का मंगलवार (मंगल देव का शौर्य दिन)",
      te: "శుక్ల పక్ష మంగళవారం (కుజుని ధైర్య దినం)",
      ta: "சுக்ல பட்ச செவ்வாய்க்கிழமை (செவ்வாயின் மங்கல நாள்)"
    },
    [PlanetName.Mercury]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಬುಧವಾರ (ಬುಧನ ಜ್ಞಾನ & ವಿವೇಕದ ದಿನ)",
      en: "Shukla Paksha Wednesday (Day of Budha / Intellect)",
      hi: "शुक्ल पक्ष का बुधवार (बुध देव का ज्ञान दिन)",
      te: "శుక్ల పక్ష బుధవారం (బుధుని వివేక దినం)",
      ta: "சுக்ல பட்ச புதன்கிழமை (புதனின் ஞான நாள்)"
    },
    [PlanetName.Jupiter]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಗುರುವಾರ (ಬೃಹಸ್ಪತಿಯ ದೈವಿಕ ದಿನ)",
      en: "Shukla Paksha Thursday (Day of Brihaspati / Grace)",
      hi: "शुक्ल पक्ष का गुरुवार (बृहस्पति देव का पावन दिन)",
      te: "శుక్ల పక్ష గురువారం (బృహస్పతి దైవిక దినం)",
      ta: "சுக்ல பட்ச வியாழக்கிழமை (குருவின் தெய்வீக நாள்)"
    },
    [PlanetName.Venus]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಶುಕ್ರವಾರ (ಮಹಾಲಕ್ಷ್ಮಿ & ಶುಕ್ರನ ಸೌಭಾಗ್ಯ ದಿನ)",
      en: "Shukla Paksha Friday (Day of Mahalakshmi & Shukra)",
      hi: "शुक्ल पक्ष का शुक्रवार (महालक्ष्मी एवं शुक्र का शुभ दिन)",
      te: "శుక్ల పక్ష శుక్రవారం (మహాలక్ష్మి & శుక్రుని శుభ దినం)",
      ta: "சுக்ல பட்ச வெள்ளிக்கிழமை (மகாலட்சுமி & சுக்கிரனின் சுப நாள்)"
    },
    [PlanetName.Saturn]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಶನಿವಾರ (ಶನೈಶ್ಚರನ ಕರ್ಮ ಶುದ್ಧಿಯ ದಿನ)",
      en: "Shukla Paksha Saturday (Day of Shanaishchara / Discipline)",
      hi: "शुक्ल पक्ष का शनिवार (शनि देव का कर्म शुद्धि दिन)",
      te: "శుక్ల పక్ష శనివారం (శని దేవుని కర్మ శుద్ధి దినం)",
      ta: "சுக்ல பட்ச சனிக்கிழமை (சனி பகவானின் கர்ம சுத்தி நாள்)"
    },
    [PlanetName.Rahu]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಶನಿವಾರ ಮುಸ್ಸಂಜೆ ಅಥವಾ ಬುಧವಾರ",
      en: "Shukla Paksha Saturday Twilight or Wednesday",
      hi: "शुक्ल पक्ष का शनिवार सायं अथवा बुधवार",
      te: "శుక్ల పక్ష శనివారం సాయంత్రం లేదా బుధవారం",
      ta: "சுக்ல பட்ச சனிக்கிழமை அந்தி அல்லது புதன்கிழமை"
    },
    [PlanetName.Ketu]: {
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಅಥವಾ ಗುರುವಾರ",
      en: "Shukla Paksha Tuesday or Thursday",
      hi: "शुक्ल पक्ष का मंगलवार अथवा गुरुवार",
      te: "శుక్ల పక్ష మంగళవారం లేదా గురువారం",
      ta: "சுக்ல பட்ச செவ்வாய்க்கிழமை அல்லது வியாழக்கிழமை"
    }
  };

  const auspiciousWeekday = weekdayMap[catalystGraha] || weekdayMap[PlanetName.Jupiter];

  // 3. Mala Recommendation
  let prescribedMala: Record<SupportedLanguage, string>;
  if ([PlanetName.Saturn, PlanetName.Rahu, PlanetName.Ketu].includes(catalystGraha)) {
    prescribedMala = {
      kn: "ಪವಿತ್ರ ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ ಮಾಲೆ (೧೦೮ ಮಣಿಗಳು)",
      en: "Sacred 5-Mukhi Rudraksha Mala (108 beads)",
      hi: "पवित्र पंचमुखी रुद्राक्ष माला (१०८ मनके)",
      te: "పవిత్ర పంచముఖి రుద్రాక్ష మాల (108 పూసలు)",
      ta: "புனித பஞ்சமுக ருத்ராட்ச மாலை (108 மணிகள்)"
    };
  } else if ([PlanetName.Moon, PlanetName.Venus, PlanetName.Mercury].includes(catalystGraha)) {
    prescribedMala = {
      kn: "ಶುದ್ಧ ಸ್ಫಟಿಕ ಮಾಲೆ ಅಥವಾ ಬಿಳಿ ಚಂದನದ ಮಾಲೆ (೧೦೮ ಮಣಿಗಳು)",
      en: "Pure Spatika (Quartz) or White Sandalwood Mala (108 beads)",
      hi: "शुद्ध स्फटिक माला अथवा श्वेत चन्दन माला (१०८ मनके)",
      te: "శుద్ధ స్పటిక మాల లేదా తెల్ల చందనం మాల (108 పూసలు)",
      ta: "தூய ஸ்படிக மாலை அல்லது வெண் சந்தன மாலை (108 மணிகள்)"
    };
  } else {
    prescribedMala = {
      kn: "ರಕ್ತ ಚಂದನ ಅಥವಾ ಶುದ್ಧ ತುಳಸಿ ಮಾಲೆ (೧೦೮ ಮಣಿಗಳು)",
      en: "Red Sandalwood or Sacred Tulasi Mala (108 beads)",
      hi: "रक्त चन्दन अथवा शुद्ध तुलसी माला (१०८ मनके)",
      te: "రక్త చందనం లేదా తులసి మాల (108 పూసలు)",
      ta: "ரத்த சந்தனம் அல்லது துளசி மாலை (108 மணிகள்)"
    };
  }

  // 4. 3-Phase Transformation Roadmap Content based on primary struggle
  interface PhaseDetail {
    daysRange: Record<SupportedLanguage, string>;
    phaseTitle: Record<SupportedLanguage, string>;
    focusArea: Record<SupportedLanguage, string>;
    experientialRelief: Record<SupportedLanguage, string>;
    subconsciousShift: Record<SupportedLanguage, string>;
  }

  let phase1: PhaseDetail;
  let phase2: PhaseDetail;
  let phase3: PhaseDetail;

  if (struggleCategory === "career_obstacles") {
    phase1 = {
      daysRange: { kn: "ದಿನ ೧ - ೧೫", en: "Days 1 - 15", hi: "दिन १ - १५", te: "రోజులు 1 - 15", ta: "நாட்கள் 1 - 15" },
      phaseTitle: {
        kn: "ಪ್ರಥಮ ಹಂತ: ಕರ್ಮ ಪ್ರತಿಬಂಧಕ ನಿವಾರಣೆ & ಕಾರ್ಯಕ್ಷೇತ್ರದ ಗೊಂದಲ ಶಮನ",
        en: "Phase 1: Karmic Block Dissolution & Workplace De-escalation",
        hi: "प्रथम चरण: कर्म बाधा निवारण एवं कार्यक्षेत्र तनाव शमन",
        te: "మొదటి దశ: కర్మ దోష నివారణ & పని ప్రదేశంలో ఒత్తిడి శమనం",
        ta: "முதல் படி: கர்ம தடை நீக்கம் & பணியிட அமைதி"
      },
      focusArea: {
        kn: "ಕಾರ್ಯಸ್ಥಳದಲ್ಲಿನ ಹಠಾತ್ ಅಡೆತಡೆಗಳು, ಅಧಿಕಾರಿಗಳ ಅಪಸ್ವರ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಶಮನ.",
        en: "Pacifying sudden workplace bottlenecks, superior friction, and ambient career anxiety.",
        hi: "कार्यस्थल की अचानक रुकावटों, अधिकारियों के मतभेद एवं मानसिक अशांति का शमन।",
        te: "పని ప్రదేశంలో ఆకస్మిక అడ్డంకులు, అధికారులతో విభేదాలు మరియు ఆందోళనల శమనం.",
        ta: "பணியிடத்தில் ஏற்படும் திடீர் தடைகள், உயரதிகாரிகளுடன் கருத்து வேறுபாடுகள் தணிதல்."
      },
      experientialRelief: {
        kn: "೧೫ ದಿನಗಳ ಸಾಧನೆಯಿಂದ ನಿರಂತರ ಒತ್ತಡ ಇಳಿದು, ದಿನನಿತ್ಯದ ಕೆಲಸಗಳಲ್ಲಿ ಸ್ಪಷ್ಟ ಏಕಾಗ್ರತೆ ಮರಳುತ್ತದೆ.",
        en: "Within 15 days, ambient work panic recedes; daily duties regain calm, organized focus.",
        hi: "१५ दिनों की साधना से निरंतर तनाव कम होकर कार्य में स्पष्ट एकाग्रता लौटती है।",
        te: "15 రోజుల సాధనతో నిరంతర ఒత్తిడి తగ్గి, పనుల్లో స్పష్టమైన ఏకాగ్రత చేకూరుతుంది.",
        ta: "15 நாள் வழிபாட்டால் மன அழுத்தம் குறைந்து, பணிகளில் தெளிவான கவனம் திரும்பும்."
      },
      subconsciousShift: {
        kn: "ಅಂತಃಪ್ರಜ್ಞೆಯಲ್ಲಿ ಕೀಳರಿಮೆ ಕರಗಿ ವೃತ್ತಿಪರ ಆತ್ಮವಿಶ್ವಾಸ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ.",
        en: "Dissolution of professional self-doubt into grounded career confidence.",
        hi: "आत्मसंदेह दूर होकर कार्यक्षेत्र में दृढ़ आत्मविश्वास जागृत होता है।",
        te: "ఆత్మవిశ్వాసం పెరిగి వృత్తిలో స్థిరమైన ఆలోచనలు కలుగుతాయి.",
        ta: "சுய சந்தேகம் நீங்கி தொழில் துறையில் உறுதியான நம்பிக்கை பிறக்கும்."
      }
    };
    phase2 = {
      daysRange: { kn: "ದಿನ ೧೬ - ೩೦", en: "Days 16 - 30", hi: "दिन १६ - ३०", te: "రోజులు 16 - 30", ta: "நாட்கள் 16 - 30" },
      phaseTitle: {
        kn: "ದ್ವಿತೀಯ ಹಂತ: ಬುಧ-ಗುರು ತೇಜಸ್ಸು ಜಾಗೃತಿ & ನೂತನ ಅವಕಾಶಗಳ ಪ್ರಕಾಶ",
        en: "Phase 2: Budha-Guru Tejas Activation & Horizon Expansion",
        hi: "द्वितीय चरण: बुध-गुरु तेज जागृति एवं नवीन अवसर प्रकाश",
        te: "రెండవ దశ: బుధ-గురు తేజస్సు జాగృతి & నూతన అవకాశాల వెలుగు",
        ta: "இரண்டாம் படி: புதன்-குரு தேஜஸ் விழிப்புணர்வு & புதிய வாய்ப்புகள்"
      },
      focusArea: {
        kn: "ಕುಂಠಿತಗೊಂಡಿದ್ದ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳ ಪುನಶ್ಚೇತನ, ಪ್ರಮುಖ ವ್ಯಕ್ತಿಗಳ ಬೆಂಬಲ ಹಾಗೂ ಕೌಶಲ್ಯ ವೃದ್ಧಿ.",
        en: "Revival of stalled projects, recognition from mentors, and sharp intellectual discernment.",
        hi: "रुके हुए कार्यों का पुनः आरंभ, वरिष्ठों का सहयोग एवं बौद्धिक कुशाग्रता।",
        te: "ఆగిపోయిన పనులు పునఃప్రారంభం, అధికారుల మద్దతు మరియు నైపుణ్యాల వృద్ధి.",
        ta: "முடங்கிய பணிகள் மீண்டும் தொடங்குதல், உயர் அதிகாரிகளின் ஆதரவு மற்றும் அறிவு கூர்மை."
      },
      experientialRelief: {
        kn: "ಹಳೆಯ ವಿರೋಧಗಳು ಕರಗಿ, ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಗೆ ಮೇಲಧಿಕಾರಿಗಳ ಮೆಚ್ಚುಗೆ ಲಭಿಸಲಾರಂಭಿಸುತ್ತದೆ.",
        en: "Colleague resistance dissolves; your consistent contributions gain overt appreciation.",
        hi: "सहकर्मियों का विरोध शांत होता है और आपकी कार्यकुशलता की प्रशंसा होने लगती है।",
        te: "సహోద్యోగుల వ్యతిరేకత తగ్గి, మీ పనితీరుకు ప్రశంసలు లభించడం ప్రారంభమవుతుంది.",
        ta: "சக ஊழியர்களின் எதிர்ப்பு நீங்கி, உங்கள் உழைப்பிற்கு பாராட்டு கிடைக்கத் தொடங்கும்."
      },
      subconsciousShift: {
        kn: "ಕಾರ್ಯತಂತ್ರದಲ್ಲಿ ದೈವಿಕ ವಿವೇಕ ಮತ್ತು ಕಾಲಜ್ಞಾನ ಸಿದ್ಧಿಸುತ್ತದೆ.",
        en: "Alignment with sharp strategic timing and professional discernment.",
        hi: "रणनीतिक निर्णय क्षमता एवं समयबद्ध कार्य कुशलता की सिद्धि।",
        te: "వ్యూహాత్మక నిర్ణయాలు తీసుకునే వివేకం మరియు సమయస్ఫూర్తి కలుగుతాయి.",
        ta: "சரியான நேரத்தில் சரியான முடிவெடுக்கும் விவேகம் உண்டாகும்."
      }
    };
    phase3 = {
      daysRange: { kn: "ದಿನ ೩೧ - ೪೫", en: "Days 31 - 45", hi: "दिन ३१ - ४५", te: "రోజులు 31 - 45", ta: "நாட்கள் 31 - 45" },
      phaseTitle: {
        kn: "ತೃತೀಯ ಹಂತ: ಸಂಕಲ್ಪ ಸಿದ್ಧಿ, ಉದ್ಯೋಗ ಬಡ್ತಿ & ಆದಾಯ ವೃದ್ಧಿ",
        en: "Phase 3: Sankalpa Siddhi, Promotion & Material Breakthrough",
        hi: "तृतीय चरण: संकल्प सिद्धि, पदोन्नति एवं स्थायी समृद्धि",
        te: "మూడవ దశ: సంకల్ప సిద్ధి, పదోన్నతి & స్థిర ఆదాయ వృద్ధి",
        ta: "மூன்றாம் படி: சங்கல்ப சித்தி, பதவி உயர்வு & நிரந்தர செல்வம்"
      },
      focusArea: {
        kn: "ಉದ್ಯೋಗದಲ್ಲಿ ಅಪೇಕ್ಷಿತ ಬಡ್ತಿ, ನೂತನ ವೇತನ ಶ್ರೇಣಿ, ಯಶಸ್ವಿ ಒಪ್ಪಂದಗಳು & ಸ್ಥಿರ ಗೌರವ.",
        en: "Manifestation of coveted promotion, higher remuneration, lucrative contracts, and dignity.",
        hi: "वांछित पदोन्नति, वेतन वृद्धि, व्यापारिक विस्तार एवं समाज में प्रतिष्ठा।",
        te: "కోరుకున్న ప్రమోషన్, జీతభత్యాల పెంపు, వ్యాపార విస్తరణ మరియు గౌరవం.",
        ta: "விரும்பிய பதவி உயர்வு, ஊதிய உயர்வு, வியாபார வளர்ச்சி மற்றும் நற்பெயர்."
      },
      experientialRelief: {
        kn: "೪೫ ದಿನಗಳ ಪೂರ್ಣ ಮಂಡಲದಿಂದ ಉದ್ಯೋಗ ಸಂಕಲ್ಪ ಸಿದ್ಧಿಯಾಗಿ ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ ನೆಲೆಸುತ್ತದೆ.",
        en: "Culmination of 45-day discipline crowns your career resolve with solid financial stability.",
        hi: "४५ दिवसीय पूर्ण मंडल से आजीविका का संकल्प सिद्ध होकर आर्थिक निश्चिंतता आती है।",
        te: "45 రోజుల సాధనతో ఉద్యోగ సంకల్పం నెరవేరి ఆర్థిక భద్రత చేకూరుతుంది.",
        ta: "45 நாள் முழு மண்டல வழிபாட்டால் உத்தியோக சங்கல்பம் நிறைவேறுவதுடன் நிதி அமைதி உண்டாகும்."
      },
      subconsciousShift: {
        kn: "ಅಧಿಕಾರ, ಸ್ಥಿರತೆ ಮತ್ತು ದೈವಿಕ ಯಶಸ್ಸಿನ ಪರಿಪೂರ್ಣ ಸಾಕ್ಷಾತ್ಕಾರ.",
        en: "Attainment of rightful authority, abundance, and divine professional fulfillment.",
        hi: "अधिकार, स्थिरता एवं दैवीय सफलता का पूर्ण साक्षात्कार।",
        te: "అధికారం, స్థిరత్వం మరియు దైవిక సాఫల్యత సాక్షాత్కారం.",
        ta: "அதிகாரம், நிலைத்தன்மை மற்றும் தெய்வீக வெற்றியின் முழு அனுபவம்."
      }
    };
  } else if (struggleCategory === "debt_financial") {
    phase1 = {
      daysRange: { kn: "ದಿನ ೧ - ೧೫", en: "Days 1 - 15", hi: "दिन १ - १५", te: "రోజులు 1 - 15", ta: "நாட்கள் 1 - 15" },
      phaseTitle: {
        kn: "ಪ್ರಥಮ ಹಂತ: ಅನಗತ್ಯ ಧನವ್ಯಯ ತಡೆ & ಆರ್ಥಿಕ ಆತಂಕ ನಿವಾರಣೆ",
        en: "Phase 1: Financial Leak Containment & Panic Dissolution",
        hi: "प्रथम चरण: अनियंत्रित धन हानि पर रोक एवं चिंता निवारण",
        te: "మొదటి దశ: అనవసర ఖర్చుల నియంత్రణ & ఆర్థిక ఆందోళన నివారణ",
        ta: "முதல் படி: வீண் விரயங்கள் தடுப்பு & பணக்கவலை நீக்கம்"
      },
      focusArea: {
        kn: "ಅನಿರೀಕ್ಷಿತ ನಷ್ಟಗಳು, ಸಾಲಗಾರರ ಒತ್ತಡ ಹಾಗೂ ಆರ್ಥಿಕ ಅಸ್ಥಿರತೆಯ ಶಮನ.",
        en: "Halting sudden expenditures, creditor friction, and money-related panic.",
        hi: "अप्रत्याशित हानियों पर रोक, ऋणदाताओं के दबाव एवं आर्थिक भय का शमन।",
        te: "అనుకోని నష్టాలు, అప్పుల వారి ఒత్తిడి మరియు ఆర్థిక భయాల నివారణ.",
        ta: "எதிர்பாராத இழப்புகள், கடன்காரர்களின் அழுத்தம் மற்றும் நிதி பயம் தணிதல்."
      },
      experientialRelief: {
        kn: "೧೫ ದಿನಗಳಲ್ಲಿ ಹಣ ವ್ಯರ್ಥವಾಗಿ ಖರ್ಚಾಗುವುದು ನಿಂತು, ಆರ್ಥಿಕ ನಿರ್ವಹಣೆಯಲ್ಲಿ ಸ್ಪಷ್ಟತೆ ಬರುತ್ತದೆ.",
        en: "Wasteful outflows halt within 15 days; composure returns to money management.",
        hi: "१५ दिनों में अनावश्यक खर्च रुकते हैं और आर्थिक संतुलन में सुधार आता है।",
        te: "15 రోజుల్లో ధన నష్టం ఆగిపోయి, ఆర్థిక నిర్వహణలో స్థిరత్వం వస్తుంది.",
        ta: "15 நாட்களில் வீண் செலவுகள் நின்று, பண நிர்வாகத்தில் தெளிவு பிறக்கும்."
      },
      subconsciousShift: {
        kn: "ಬಡತನದ ಆತಂಕ ಕರಗಿ ಸಮೃದ್ಧಿಯ ಪ್ರಜ್ಞೆ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ.",
        en: "Poverty trauma dissolves, anchoring subconscious in steady abundance.",
        hi: "आर्थिक असुरक्षा की भावना समाप्त होकर संबल का उदय होता है।",
        te: "ఆర్థిక అభద్రతా భావం తొలగి స్థిరమైన నమ్మకం ఏర్పడుతుంది.",
        ta: "பணப் பற்றாக்குறை பயம் நீங்கி தன்னம்பிக்கை உண்டாகும்."
      }
    };
    phase2 = {
      daysRange: { kn: "ದಿನ ೧೬ - ೩೦", en: "Days 16 - 30", hi: "दिन १६ - ३०", te: "రోజులు 16 - 30", ta: "நாட்கள் 16 - 30" },
      phaseTitle: {
        kn: "ದ್ವಿತೀಯ ಹಂತ: ಕುಬೇರ-ಲಕ್ಷ್ಮೀ ಆಕರ್ಷಣೆ & ನೂತನ ಆದಾಯ ಮಾರ್ಗಗಳು",
        en: "Phase 2: Kubera-Lakshmi Inflow & Revenue Channel Awakening",
        hi: "द्वितीय चरण: कुबेर-लक्ष्मी कृपा एवं नवीन आय स्रोत",
        te: "రెండవ దశ: కుబేర-లక్ష్మీ కటాక్షం & నూతన ఆదాయ మార్గాలు",
        ta: "இரண்டாம் படி: குபேர-லட்சுமி அருள் & புதிய வருமான வழிகள்"
      },
      focusArea: {
        kn: "ಹಿಂದೆ ಸಿಲುಕಿದ್ದ ಹಣ ವಾಪಸಾತಿ, ನೂತನ ಗ್ರಾಹಕರು ಹಾಗೂ ವ್ಯಾಪಾರ ವೃದ್ಧಿ.",
        en: "Recovery of blocked capital, onboarding new clients, and trade expansion.",
        hi: "फंसे हुए धन की वापसी, नए ग्राहकों का जुड़ाव एवं व्यापार वृद्धि।",
        te: "నిలిచిపోయిన ధనం తిరిగి రావడం, నూతన వ్యాపార అవకాశాలు లభించడం.",
        ta: "நிலுவையில் இருந்த பணம் வசூலாதல், புதிய வியாபார வாய்ப்புகள் வருதல்."
      },
      experientialRelief: {
        kn: "ಸ್ಥಗಿತಗೊಂಡ ಧನಪರಿಚಲನೆ ಪುನಾರಂಭವಾಗಿ, ಸಾಲ ತೀರಿಸಲು ಸುಲಭ ಹಾದಿಗಳು ಗೋಚರಿಸುತ್ತವೆ.",
        en: "Blocked cashflow resumes; practical avenues for systematic debt clearance open up.",
        hi: "धन का प्रवाह सुचारु होता है और कर्ज चुकाने के स्पष्ट रास्ते दिखाई देते हैं।",
        te: "ఆర్థిక రాబడి పెరిగి, అప్పులు తీర్చడానికి మార్గాలు సుగమమవుతాయి.",
        ta: "பணப்புழக்கம் சீராகி, கடன்களை அடைப்பதற்கான வழிகள் தென்படும்."
      },
      subconsciousShift: {
        kn: "ಅಖಂಡ ಐಶ್ವರ್ಯದ ದೈವಿಕ ಶಕ್ತಿಯೊಂದಿಗೆ ಮರುಸಂಪರ್ಕ.",
        en: "Reconnection with divine abundance and resource dignity.",
        hi: "लक्ष्मी की कृपा से सकारात्मक वित्तीय सामर्थ्य का जागरण।",
        te: "లక్ష్మీదేవి అనుగ్రహంతో ఆర్థిక వివేకం మరియు స్థిరత్వం.",
        ta: "மகாலட்சுமி அருளால் நிலையான செல்வ வளம் பெறும் தெளிவு."
      }
    };
    phase3 = {
      daysRange: { kn: "ದಿನ ೩೧ - ೪೫", en: "Days 31 - 45", hi: "दिन ३१ - ४५", te: "రోజులు 31 - 45", ta: "நாட்கள் 31 - 45" },
      phaseTitle: {
        kn: "ತೃತೀಯ ಹಂತ: ಸಂಪೂರ್ಣ ಋಣಮುಕ್ತಿ & ಶಾಶ್ವತ ಸಂಪತ್ ಸಿದ್ಧಿ",
        en: "Phase 3: Debt Liquidation, Lasting Abundance & Financial Peace",
        hi: "तृतीय चरण: संपूर्ण ऋणमुक्ति एवं स्थायी समृद्धि सिद्धि",
        te: "మూడవ దశ: సంపూర్ణ రుణ విముక్తి & శాశ్వత సంపత్ సిద్ధి",
        ta: "மூன்றாம் படி: பூரண கடன் நிவர்த்தி & நிலையான செல்வ சித்தி"
      },
      focusArea: {
        kn: "ಸಾಲಗಳ ಸಂಪೂರ್ಣ ಇತ್ಯರ್ಥ, ಉಳಿತಾಯ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಆರ್ಥಿಕ ನೆಮ್ಮದಿ.",
        en: "Decisive debt settlement, wealth accumulation, and domestic financial peace.",
        hi: "कर्ज का पूर्ण निपटान, बचत में वृद्धि एवं पारिवारिक आर्थिक सुरक्षा।",
        te: "అప్పులన్నీ తీరిపోవడం, పొదుపు పెరగడం మరియు కుటుంబ ఆర్థిక భద్రత.",
        ta: "கடன்கள் யாவும் அடைபடுதல், சேமிப்பு பெருகுதல் மற்றும் குடும்ப நிம்மதி."
      },
      experientialRelief: {
        kn: "೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತದಿಂದ ಋಣಬಂಧನ ಕಳಚಿ, ಗೌರವಾನ್ವಿತ ಸಂಪತ್ ಸಿದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
        en: "45-day Mandala resolve dissolves debt bondage, instating lasting prosperity.",
        hi: "४५ दिवसीय व्रत से ऋण के समस्त बंधन कटकर आत्मसम्मान एवं समृद्धि प्राप्त होती है।",
        te: "45 రోజుల వ్రతంతో రుణ బంధాలు తొలగి, గౌరవప్రదమైన సంపద సమకూరుతుంది.",
        ta: "45 நாள் விரதத்தால் கடன் சுமை அகன்று, கௌரவமான செல்வ நிலை உண்டாகும்."
      },
      subconsciousShift: {
        kn: "ಅಖಂಡ ಧನ ಸಮೃದ್ಧಿ ಮತ್ತು ಕೃತಜ್ಞತೆಯ ದೈವಿಕ ಅನುಭವ.",
        en: "Permanent embodiment of financial freedom and grateful abundance.",
        hi: "शाश्वत आर्थिक स्वतंत्रता एवं कृतज्ञता का अनुभव।",
        te: "శాశ్వత ఆర్థిక స్వాతంత్ర్యం మరియు కృతజ్ఞతా భావం.",
        ta: "நிரந்தர நிதி சுதந்திரம் மற்றும் பூரண திருப்தி."
      }
    };
  } else if (struggleCategory === "marriage_delay") {
    phase1 = {
      daysRange: { kn: "ದಿನ ೧ - ೧೫", en: "Days 1 - 15", hi: "दिन १ - १५", te: "రోజులు 1 - 15", ta: "நாட்கள் 1 - 15" },
      phaseTitle: {
        kn: "ಪ್ರಥಮ ಹಂತ: ಕಳತ್ರ ದೋಷ ಶಮನ & ಮಾನಸಿಕ ನಿರಾಶೆಯ ನಿವಾರಣೆ",
        en: "Phase 1: Kalatra Dosha Pacification & Hopelessness Release",
        hi: "प्रथम चरण: कलत्र दोष शमन एवं मानसिक निराशा निवारण",
        te: "మొదటి దశ: కళత్ర దోష శమనం & నైరాశ్య నివారణ",
        ta: "முதல் படி: களத்திர தோஷ சாந்தி & மனக்கவலை நீக்கம்"
      },
      focusArea: {
        kn: "ವಿವಾಹ ವಿಳಂಬ ಉಂಟುಮಾಡುತ್ತಿದ್ದ ಕರ್ಮ ದೋಷಗಳು, ಮನಸ್ಸಿನ ಕೀಳರಿಮೆ ಹಾಗೂ ಆತಂಕ ಶಮನ.",
        en: "Clearing karmic impediments to alliance and releasing feelings of fatigue.",
        hi: "विवाह में विलंब उत्पन्न करने वाले ग्रह दोषों एवं मानसिक हीनभावना का शमन।",
        te: "వివాహ ఆలస్యానికి కారణమైన దోషాలు మరియు మానసిక ఆందోళనల నివారణ.",
        ta: "திருமண தாமதத்தை ஏற்படுத்திய கிரக தோஷங்கள் மற்றும் தாழ்வு மனப்பான்மை நீங்குதல்."
      },
      experientialRelief: {
        kn: "ಮನಸ್ಸಿನ ಭಾರ ಇಳಿದು, ಮುಖದಲ್ಲಿ ಸಾತ್ವಿಕ ಕಾಂತಿ ಹಾಗೂ ನವ ವಿಶ್ವಾಸ ಮೂಡುತ್ತದೆ.",
        en: "Heavy heart lifts within 15 days, replaced by a radiant, cheerful aura.",
        hi: "हृदय का बोझ हल्का होकर मुखमंडल पर सात्विक तेज एवं नवीन आशा का संचार होता है।",
        te: "మనస్సు ప్రశాంతమై, ముఖంలో తేజస్సు మరియు నూతన ఉత్సాహం కనిపిస్తాయి.",
        ta: "மனபாரம் நீங்கி, முகத்தில் புதுப்பொலிவும் நம்பிக்கையும் உண்டாகும்."
      },
      subconsciousShift: {
        kn: "ದಾಂಪತ್ಯ ಸುಖದ ಮೇಲಿನ ದೃಢ ವಿಶ್ವಾಸ ಮತ್ತು ಆಂತರಿಕ ಆಕರ್ಷಣಾ ಶಕ್ತಿ ಜಾಗೃತಿ.",
        en: "Re-awakening of subconscious magnetic openness for an aligned partner.",
        hi: "दांपत्य सुख के प्रति दृढ़ विश्वास एवं आकर्षण शक्ति का जागरण।",
        te: "దాంపత్య సుఖంపై నమ్మకం మరియు ఆకర్షణ శక్తి జాగృతమవుతాయి.",
        ta: "திருமண வாழ்வின் மீதான நம்பிக்கை மற்றும் ஈர்ப்பு சக்தி விழித்தெழும்."
      }
    };
    phase2 = {
      daysRange: { kn: "ದಿನ ೧೬ - ೩೦", en: "Days 16 - 30", hi: "दिन १६ - ३०", te: "రోజులు 16 - 30", ta: "நாட்கள் 16 - 30" },
      phaseTitle: {
        kn: "ದ್ವಿತೀಯ ಹಂತ: ಶುಕ್ರ-ಗುರು ಕೃಪೆ & ಯೋಗ್ಯ ವಿವಾಹ ಸಂಬಂಧಗಳ ಆಗಮನ",
        en: "Phase 2: Shukra-Guru Grace & Arrival of Aligned Alliances",
        hi: "द्वितीय चरण: शुक्र-गुरु कृपा एवं योग्य विवाह प्रस्ताव",
        te: "రెండవ దశ: శుక్ర-గురు అనుగ్రహం & యోగ్యమైన సంబంధాల రాక",
        ta: "இரண்டாம் படி: சுக்கிர-குரு அருள் & நல்ல வரன்கள் அமைதல்"
      },
      focusArea: {
        kn: "ಸಂಸ್ಕಾರಯುತ ಮತ್ತು ಅನುರೂಪ ಕುಟುಂಬಗಳಿಂದ ಪ್ರಸ್ತಾವನೆಗಳು, ಮಾತುಕತೆಗಳಲ್ಲಿ ಸೌಹಾರ್ದತೆ.",
        en: "Arrival of noble matrimonial matches and cordial, respectful family dialogues.",
        hi: "सभ्य एवं सुसंस्कृत परिवारों से उत्तम प्रस्ताव एवं अनुकूल बातचीत।",
        te: "మంచి కుటుంబాల నుండి సంబంధాలు రావడం, చర్చలు సానుకూలంగా సాగడం.",
        ta: "நல்ல குடும்பங்களிலிருந்து வரன்கள் வருதல் மற்றும் பேச்சுவார்த்தைகள் சுமுகமாதல்."
      },
      experientialRelief: {
        kn: "ಹಿಂದಿನ ಎಲ್ಲ ಅಪಾರ್ಥಗಳು ನಿವಾರಣೆಯಾಗಿ, ವಿವಾಹ ಮಾತುಕತೆಗಳಲ್ಲಿ ಪ್ರಗತಿ ಕಂಡುಬರುತ್ತದೆ.",
        en: "Past misunderstandings dissolve; matchmaking conversations advance smoothly.",
        hi: "विवाह वार्ता में निरंतर प्रगति होती है और शुभ संकेत प्राप्त होते हैं।",
        te: "గతంలో వచ్చిన అడ్డంకులు తొలగి, పెళ్లి మాటలు ముందుకు సాగుతాయి.",
        ta: "முந்தைய தடைகள் விலகி, திருமண பேச்சுவார்த்தை சாதகமாக முன்னேறும்."
      },
      subconsciousShift: {
        kn: "ಪವಿತ್ರ ದಾಂಪತ್ಯ ಸಂಯೋಗದ ದೈವಿಕ ಅನುಮೋದನೆ.",
        en: "Subconscious alignment with sacred marital partnership.",
        hi: "पवित्र गृहस्थ धर्म की स्थापना हेतु आत्मिक तत्परता।",
        te: "పవిత్ర దాంపత్య బంధానికి మానసిక సంసిద్ధత ఏర్పడుతుంది.",
        ta: "புனித இல்லற வாழ்விற்கான ஆத்மார்த்தமான பக்குவம் உண்டாகும்."
      }
    };
    phase3 = {
      daysRange: { kn: "ದಿನ ೩೧ - ೪೫", en: "Days 31 - 45", hi: "दिन ३१ - ۴५", te: "రోజులు 31 - 45", ta: "நாட்கள் 31 - 45" },
      phaseTitle: {
        kn: "ತೃತೀಯ ಹಂತ: ಕಲ್ಯಾಣ ಸಿದ್ಧಿ, ವಿವಾಹ ನಿಶ್ಚಯ & ಮಂಗಳ ಸೌಭಾಗ್ಯ",
        en: "Phase 3: Kalyana Siddhi, Engagement & Auspicious Harmony",
        hi: "तृतीय चरण: कल्याण सिद्धि, विवाह निश्चय एवं मंगल सौभाग्य",
        te: "మూడవ దశ: కళ్యాణ సిద్ధి, వివాహ నిశ్చయం & మంగళ సౌభాగ్యం",
        ta: "மூன்றாம் படி: கல்யாண சித்தி, திருமண நிச்சயம் & மங்கல வாழ்வு"
      },
      focusArea: {
        kn: "ಮನಮೆಚ್ಚುವ ಸಂಗಾತಿಯೊಂದಿಗೆ ವಿವಾಹ ನಿಶ್ಚಿತಾರ್ಥ, ಶಾಶ್ವತ ಪ್ರೀತಿ & ದಾಂಪತ್ಯ ಆನಂದ.",
        en: "Joyous engagement to a cherished soulmate, lifelong affection, and harmony.",
        hi: "मनोनुकूल जीवनसाथी के साथ विवाह तय होना, दांपत्य प्रेम एवं अखंड सौभाग्य।",
        te: "మనసుకు నచ్చిన భాగస్వామితో నిశ్చితార్థం, శాశ్వత ప్రేమ మరియు కుటుంబ ఆనందం.",
        ta: "மனதிற்கினிய துணையுடன் நிச்சயம், ஆழமான அன்பு மற்றும் மங்கல வாழ்வு."
      },
      experientialRelief: {
        kn: "೪೫ ದಿನಗಳ ಮಂಡಲ ಸಿದ್ಧಿಯಿಂದ ವಿವಾಹ ಕಂಕಣ ಬಲ ಕೂಡಿಬಂದು ಶುಭ ಮಂಗಳ ಕಾರ್ಯ ನಿಶ್ಚಯವಾಗುತ್ತದೆ.",
        en: "45-day Mandala fruition seals the auspicious knot with familial joy and grace.",
        hi: "४५ दिवसीय साधना के पूर्ण होने पर विवाह की समस्त बाधाएं समाप्त होकर मंगल कार्य संपन्न होता है।",
        te: "45 రోజుల వ్రత ఫలంగా కళ్యాణ ఘడియలు సమీపించి శుభకార్యం ఖాయమవుతుంది.",
        ta: "45 நாள் விரத பலனாக திருமண யோகம் கூடிவந்து மங்கல நிகழ்ச்சி உறுதியாகும்."
      },
      subconsciousShift: {
        kn: "ಸಂಪೂರ್ಣ ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಮತ್ತು ಪರಸ್ಪರ ಸಮರ್ಪಣಾ ಭಾವ.",
        en: "Radiant fulfillment of domestic bliss and devoted togetherness.",
        hi: "अखंड सौभाग्य, सुखी दांपत्य एवं पारिवारिक आनंद का साक्षात्कार।",
        te: "అఖండ సౌభాగ్యం మరియు సుఖీ దాంపత్య జీవిత అనుభవం.",
        ta: "பூரண தம்பதி சுகம் மற்றும் இணைபிரியா குடும்ப அமைதி."
      }
    };
  } else {
    // General Alignment / Anger / Mental / Health default robust phases
    phase1 = {
      daysRange: { kn: "ದಿನ ೧ - ೧೫", en: "Days 1 - 15", hi: "दिन १ - १५", te: "రోజులు 1 - 15", ta: "நாட்கள் 1 - 15" },
      phaseTitle: {
        kn: "ಪ್ರಥಮ ಹಂತ: ಕಲ್ಮಷ ಶಮನ, ಪಿತ್ತ ತಾಪ ನಿವಾರಣೆ & ಆಂತರಿಕ ಶಾಂತಿ",
        en: "Phase 1: Karmic De-escalation & Nervous System Reset",
        hi: "प्रथम चरण: कर्मदोष शमन, पित्त शांति एवं आंतरिक स्थिरता",
        te: "మొదటి దశ: కల్మష శమనం, పిత్త నివారణ & అంతర్గత శాంతి",
        ta: "முதல் படி: கர்ம தோஷ சாந்தி, பித்த தணிவு & மன அமைதி"
      },
      focusArea: {
        kn: "ಮನಸ್ಸಿನ ಚಂಚಲತೆ, ಅನಗತ್ಯ ಸಿಡುಕು, ಆತಂಕ, ಶಾರೀರಿಕ ಉಷ್ಣತೆ ಹಾಗೂ ರಜೋಗುಣದ ಶಮನ.",
        en: "Dissolving mental agitation, sudden anger surges, physical heat, and restlessness.",
        hi: "चित्त की चंचलता, अकारण क्रोध, मानसिक संताप एवं शारीरिक दाह का शमन।",
        te: "మనశ్చాంచల్యం, ఆకస్మిక కోపం, ఆందోళన మరియు శారీరక ఉష్ణోగ్రత శమనం.",
        ta: "மன அலைபாய்தல், திடீர் கோபம், பதட்டம் மற்றும் உடல் உஷ்ணம் தணிதல்."
      },
      experientialRelief: {
        kn: "೧೫ ದಿನಗಳ ಸಾಧನೆಯಿಂದ ಗಾಢ ನಿದ್ರೆ, ಶಾಂತ ಮನೋಭಾವ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದಲ್ಲಿ ಸಮತೋಲನ ಕಂಡುಬರುತ್ತದೆ.",
        en: "Deep restorative sleep returns; blood pressure stabilizes, anchoring calm patience.",
        hi: "१५ दिनों की साधना से गहरी निद्रा, चित्त में शांति एवं स्वभाव में सौम्यता आती है।",
        te: "15 రోజుల సాధనతో ప్రశాంత నిద్ర, రక్తపోటు అదుపులోకి వచ్చి మనస్సు కుదుటపడుతుంది.",
        ta: "15 நாள் சாதனையில் ஆழ்ந்த உறக்கம், இரத்த அழுத்தம் சீராகி அமைதி உண்டாகும்."
      },
      subconsciousShift: {
        kn: "ಅಂತಃಪ್ರಜ್ಞೆಯಲ್ಲಿ ಸಾವಧಾನತೆಯ ಅರಿವು ಮತ್ತು ನಕಾರಾತ್ಮಕತೆಯ ನಿವಾರಣೆ.",
        en: "Emergence of deep inner stillness and clearing of toxic thought loops.",
        hi: "अंतश्चेतना में स्थिरता एवं नकारात्मक विचारों का शमन।",
        te: "అంతఃచేతనలో ప్రశాంతత మరియు ప్రతికూల ఆలోచనల తొలగింపు.",
        ta: "உள்ளுணர்வில் அமைதியும் எதிர்மறை எண்ணங்கள் நீங்குதலும் நிகழும்."
      }
    };
    phase2 = {
      daysRange: { kn: "ದಿನ ೧೬ - ೩೦", en: "Days 16 - 30", hi: "दिन १६ - ३०", te: "రోజులు 16 - 30", ta: "நாட்கள் 16 - 30" },
      phaseTitle: {
        kn: "ದ್ವಿತೀಯ ಹಂತ: ಪ್ರಾಣ ತೇಜಸ್ಸು ಜಾಗೃತಿ, ಓಜಸ್ಸು & ಸಂಬಂಧಗಳ ಸಾಮರಸ್ಯ",
        en: "Phase 2: Prana Tejas & Relational Harmony Awakening",
        hi: "द्वितीय चरण: प्राण तेज जागृति, ओज संवर्धन एवं संबंध सौहार्द",
        te: "రెండవ దశ: ప్రాణ తేజస్సు జాగృతి, ఓజస్సు & సంబంధాల సామరస్యం",
        ta: "இரண்டாம் படி: பிராண தேஜஸ் விழிப்புணர்வு & உறவு நல்லிணக்கம்"
      },
      focusArea: {
        kn: "ಕುಟುಂಬದ ಸದಸ್ಯರೊಂದಿಗೆ ಮಧುರ ಸಂವಹನ, ಆಂತರಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಬುದ್ಧಿಯಲ್ಲಿ ಸ್ಪಷ್ಟತೆ.",
        en: "Restoring warmth in family interactions, cellular vigor, and clear decision-making.",
        hi: "पारिवारिक सदस्यों से मधुर संवाद, शारीरिक स्फूर्ति एवं बुद्धि में स्पष्टता।",
        te: "కుటుంబంలో ఆప్యాయత, శారీరక ఉల్లాసం మరియు నిర్ణయాల్లో స్పష్టత.",
        ta: "குடும்பத்தினரிடம் பாசமான பேச்சு, உடல் சுறுசுறுப்பு மற்றும் தெளிவான அறிவு."
      },
      experientialRelief: {
        kn: "ಹಳೆಯ ಕಲಹಗಳು ಕರಗಿ, ನಿಮ್ಮ ಶಾಂತ ನಡವಳಿಕೆಗೆ ಕುಟುಂಬದಲ್ಲಿ ಗೌರವ ಮತ್ತು ಪ್ರೀತಿ ಮರಳುತ್ತದೆ.",
        en: "Past domestic frictions dissolve; your composed presence commands warmth and esteem.",
        hi: "पारिवारिक मतभेद समाप्त होकर आपके शांत व्यवहार से सम्मान एवं प्रेम में वृद्धि होती है।",
        te: "పాత వివాదాలు సమసిపోయి, మీ ప్రశాంత ప్రవర్తనతో ఇంట్లో గౌరవం పెరుగుతుంది.",
        ta: "பழைய கருத்து வேறுபாடுகள் மறைந்து, உங்கள் அமைதியான குணத்திற்கு மதிப்பு கூடும்."
      },
      subconsciousShift: {
        kn: "ಭಾವನಾತ್ಮಕ ಪಕ್ವತೆ ಮತ್ತು ನಿರ್ಧಾರಗಳಲ್ಲಿ ದೈವಿಕ ವಿವೇಕದ ಪ್ರಕಾಶ.",
        en: "Emotional poise and intuitive illumination in everyday decisions.",
        hi: "भावनात्मक परिपक्वता एवं निर्णयों में विवेक का प्रकाश।",
        te: "భావోద్వేగ స్థిరత్వం మరియు ఆధ్యాత్మిక వివేకం కలుగుతాయి.",
        ta: "உணர்ச்சிவசப்படாத மனப்பக்குவமும் தெய்வீக விவேகமும் உண்டாகும்."
      }
    };
    phase3 = {
      daysRange: { kn: "ದಿನ ೩೧ - ೪೫", en: "Days 31 - 45", hi: "दिन ३१ - ۴۵", te: "రోజులు 31 - 45", ta: "நாட்கள் 31 - 45" },
      phaseTitle: {
        kn: "ತೃತೀಯ ಹಂತ: ಸಂಕಲ್ಪ ಸಿದ್ಧಿ, ಸರ್ವಾರ್ಥ ಸೌಭಾಗ್ಯ & ಪರಮ ಮನಃಶಾಂತಿ",
        en: "Phase 3: Sankalpa Siddhi, All-Round Prosperity & Abiding Peace",
        hi: "तृतीय चरण: संकल्प सिद्धि, सर्वार्थ सौभाग्य एवं परम मानसिक शांति",
        te: "మూడవ దశ: సంకల్ప సిద్ధి, సర్వార్థ సౌభాగ్యం & పరమ మనశ్శాంతి",
        ta: "மூன்றாம் படி: சங்கல்ப சித்தி, சர்வ சௌபாக்கியம் & பூரண மன அமைதி"
      },
      focusArea: {
        kn: "ಸಂಕಲ್ಪಿಸಿದ ಸಕಲ ಕಾರ್ಯಗಳ ಪೂರ್ಣ ಸಿದ್ಧಿ, ದೈವಾನುಗ್ರಹ ಸ್ಥಿರತೆ & ಅಖಂಡ ನೆಮ್ಮದಿ.",
        en: "Total fruition of noble desires, divine protection, and unshakeable contentment.",
        hi: "अभीष्ट संकल्पों की पूर्ण सिद्धि, ईश्वरीय कृपा का स्थायित्व एवं अखंड आनंद।",
        te: "కోరుకున్న పనులన్నీ విజయవంతం కావడం, దైవానుగ్రహం మరియు పరిపూర్ణ ప్రశాంతత.",
        ta: "நினைத்த காரியங்கள் யாவும் வெற்றி பெறுதல், தெய்வ கடாட்சம் மற்றும் பூரண அமைதி."
      },
      experientialRelief: {
        kn: "೪೫ ದಿನಗಳ ಪೂರ್ಣ ಮಂಡಲ ವ್ರತದಿಂದ ಸಮಸ್ತ ಗ್ರಹದೋಷಗಳು ಭಸ್ಮವಾಗಿ ಪರಮ ಶಾಂತಿ ಸಿದ್ಧಿಯಾಗುತ್ತದೆ.",
        en: "45-day Mandala completion burns away chart afflictions, securing lasting serenity.",
        hi: "४५ दिवसीय पूर्ण मंडल व्रत से समस्त ग्रह दोष शांत होकर जीवन में सुख-शांति प्रतिष्ठित होती है।",
        te: "45 రోజుల మండల వ్రతంతో గ్రహ దోషాలన్నీ తొలగి, జీవితంలో శాశ్వత శాంతి నెలకొంటుంది.",
        ta: "45 நாள் மண்டல விரதத்தால் சகல கிரக தோஷங்களும் நீங்கி, வாழ்வில் அமைதியும் சுபமும் நிறையும்."
      },
      subconsciousShift: {
        kn: "ಪರಮ ಶಾಂತಿ ಮತ್ತು ದೈವಿಕ ಸಂಕಲ್ಪ ಸಾಕ್ಷಾತ್ಕಾರದ ಪರಿಪೂರ್ಣ ಅನುಭವ.",
        en: "Unshakeable realization of inner peace and cosmic grace.",
        hi: "परम शांति एवं ईश्वरीय कृपा का अखंड साक्षात्कार।",
        te: "పరమ శాంతి మరియు దైవిక సంకల్ప సాక్షాత్కార పరిపూర్ణత.",
        ta: "பூரண மன அமைதி மற்றும் தெய்வீக சங்கல்ப சித்தியின் நிறைவு."
      }
    };
  }

  // 5. Dietary Disciplines (Ahara Rules)
  const aharaRules: Array<Record<SupportedLanguage, string>> = [
    {
      kn: "೪೫ ದಿನಗಳ ಮಂಡಲ ಅವಧಿಯಲ್ಲಿ ಸಂಪೂರ್ಣ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ: ಈರುಳ್ಳಿ, ಬೆಳ್ಳುಳ್ಳಿ, ತೀಕ್ಷ್ಣ ಮಸಾಲೆ, ಮಾಂಸಾಹಾರ ಹಾಗೂ ಮದ್ಯಪಾನವನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ತ್ಯಜಿಸಬೇಕು.",
      en: "Strictly Sattvic Diet: Completely renounce onion, garlic, pungent spices, non-vegetarian food, and alcohol during these 45 days.",
      hi: "४५ दिनों में पूर्ण सात्विक आहार: प्याज, लहसुन, तामसिक भोजन, मांसाहार एवं मदिरा का कड़ाई से त्याग करें।",
      te: "45 రోజులు సంపూర్ణ సాత్విక ఆహారం: ఉల్లిపాయ, వెల్లుల్లి, ఘాటైన మసాలాలు, మాంసాహారం మరియు మద్యం పూర్తిగా విసర్జించాలి.",
      ta: "45 நாட்கள் முழுமையான சாத்வீக உணவு: வெங்காயம், பூண்டு, காரமான உணவு, அசைவம் மற்றும் மதுவை கண்டிப்பாக தவிர்க்க வேண்டும்."
    },
    {
      kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯಾಸ್ತಕ್ಕೆ ಮುನ್ನ ಶುದ್ಧ ಬಿಸಿ ಆಹಾರ ಸೇವನೆ; ರಾತ್ರಿಯ ವೇಳೆ ಲಘು ಆಹಾರ ಅಥವಾ ದೇಶಿ ಹಸುವಿನ ಹಾಲು-ಹಣ್ಣುಗಳನ್ನು ಮಾತ್ರ ಸೇವಿಸುವುದು ಶ್ರೇಷ್ಠ.",
      en: "Consume fresh, warm meals before sunset; opt for light sustenance or pure cow's milk with fresh fruits at night.",
      hi: "सूर्यास्त पूर्व ताजा एवं गर्म भोजन ग्रहण करें; रात्रि में केवल हल्का आहार अथवा देशी गाय का दूध एवं फल लें।",
      te: "సూర్యాస్తమయానికి ముందే తాజా ఆహారం తీసుకోవాలి; రాత్రి వేళ తేలికపాటి ఆహారం లేదా ఆవు పాలు, పండ్లు శ్రేష్ఠం.",
      ta: "சூரிய அஸ்தமனத்திற்கு முன் சூடான உணவு அருந்தவும்; இரவில் எளிய உணவு அல்லது பசும்பால்-பழங்கள் சிறந்தது."
    },
    {
      kn: "ಅತಿ ಹುಳಿ, ಹೆಚ್ಚು ಉಪ್ಪು, ಹಳಸಿದ ಆಹಾರ ಹಾಗೂ ಕೃತಕ ತಂಪು ಪಾನೀಯಗಳನ್ನು ತ್ಯಜಿಸಿ, ಜೀರ್ಣಾಂಗದಲ್ಲಿ ಪಿತ್ತ-ಅಗ್ನಿ ಸಮತೋಲನ ಕಾಪಾಡಿಕೊಳ್ಳುವುದು.",
      en: "Avoid excessively sour, salty, stale, or packaged cold foods to maintain subtle Pitta-Agni metabolic equilibrium.",
      hi: "अत्यधिक खट्टा, खारा, बासी अथवा पैकेज्ड खाद्य पदार्थों से बचें ताकि पाचन में पित्त-अग्नि का संतुलन बना रहे।",
      te: "అధిక పులుపు, ఉప్పు, చల్లని మరియు నిల్వ ఆహారాలు మాని పిత్త-అగ్ని సమతుల్యతను కాపాడుకోవాలి.",
      ta: "அதிக புளிப்பு, உப்பு, பழைய உணவு மற்றும் குளிர்பானங்களை தவிர்த்து பித்த-அக்னி சமநிலையை காக்கவும்."
    }
  ];

  // 6. Behavioral Conduct (Achara Rules)
  const acharaRules: Array<Record<SupportedLanguage, string>> = [
    {
      kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯಕ್ಕೆ ಮುನ್ನ ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತದಲ್ಲಿ ಶೌಚ-ಸ್ನಾನ ಮುಗಿಸಿ, ಶುಭ್ರವಾದ ಹತ್ತಿ ವಸ್ತ್ರವನ್ನು ಧರಿಸಿ ಪೂಜಾ ಕೋಣೆಯಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳುವುದು.",
      en: "Bathe before sunrise during Brahma Muhurtha, don fresh, clean cotton clothing, and sit in your sanctified puja space.",
      hi: "सूर्योदय से पूर्व ब्रह्म मुहूर्त में स्नान कर स्वच्छ सूती वस्त्र धारण करें और पूजा स्थान में बैठें।",
      te: "సూర్యోదయానికి ముందే బ్రాహ్మీ ముహూర్తంలో స్నానం చేసి, శుభ్రమైన నూలు దుస్తులు ధరించి పూజా స్థలంలో కూర్చోవాలి.",
      ta: "சூரியோதயத்திற்கு முன் பிரம்ம முகூர்த்தத்தில் நீராடி, தூய பருத்தி ஆடை அணிந்து பூஜை அறையில் அமரவும்."
    },
    {
      kn: "೪೫ ದಿನಗಳ ಕಾಲ ಪೂರ್ಣ ಬ್ರಹ್ಮಚರ್ಯ ಪಾಲನೆ; ಕ್ರೋಧ, ಆವೇಶ, ಸುಳ್ಳು ನುಡಿಯುವುದು, ಇತರರ ಚಾಡಿ ಅಥವಾ ನಿಂದನೆಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವರ್ಜಿಸುವುದು.",
      en: "Observe Brahmacharya (sensory purity) for all 45 days; strictly avoid anger, untruths, slander, and harsh speech.",
      hi: "४५ दिनों तक ब्रह्मचर्य का पालन करें; क्रोध, मिथ्या भाषण, निंदा एवं कटु वाणी का पूर्णतः त्याग करें।",
      te: "45 రోజుల పాటు సంపూర్ణ బ్రహ్మచర్యం పాటించాలి; కోపం, అబద్ధాలు, ఇతరులను నిందించడం పూర్తిగా మానాలి.",
      ta: "45 நாட்கள் பிரம்மச்சரியம் காக்கவும்; கோபம், பொய், பிறரை நிந்தித்தல் போன்றவற்றை முழுமையாக தவிர்க்கவும்."
    },
    {
      kn: "ಜಪದ ಮುನ್ನ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ, ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಶುದ್ಧ ಜಲವನ್ನಿಟ್ಟು ಸಂಕಲ್ಪ ಮಾಡುವುದು; ಜಪ ಮುಗಿದ ನಂತರ ಆ ಜಲವನ್ನು ಸೇವಿಸಿ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು.",
      en: "Light a pure cow ghee lamp, place clean water in a copper/silver vessel, make the resolve, and sip the energized water after japa.",
      hi: "जप से पूर्व गाय के घी का दीपक जलाएं, तांबे के पात्र में जल रखकर संकल्प करें और जप उपरांत चरणामृत रूप में जल ग्रहण करें।",
      te: "జపానికి ముందు ఆవు నెయ్యి దీపం వెలిగించి, రాగి పాత్రలో నీరుంచి సంకల్పం చేయాలి; జపం తర్వాత ఆ జలాన్ని తీర్థంగా స్వీకరించాలి.",
      ta: "ஜபத்திற்கு முன் நெய் தீபம் ஏற்றி, செம்பு பாத்திரத்தில் நீர் வைத்து சங்கல்பம் செய்து, ஜபத்திற்கு பின் அத்தீர்த்தத்தை பருகவும்."
    }
  ];

  // 7. Weekly Daana & Goseva Duty
  const weeklyDaana: Record<SupportedLanguage, string> = {
    kn: "ವಾರಕ್ಕೊಮ್ಮೆ ಪ್ರೇರಕ ಗ್ರಹದ ಶುಭ ವಾರದಂದು ಗೋವಿಗೆ ಹಸಿರು ಹುಲ್ಲು, ಬೆಲ್ಲ ಮತ್ತು ಬಾಳೆಹಣ್ಣು ನೀಡುವುದು (ಗೋ-ಗ್ರಾಸ) ಅಥವಾ ಸನ್ನಿಧಾನದ ಹೆಸರಿನಲ್ಲಿ ಬಡವರಿಗೆ ಅನ್ನದಾನ ಅರ್ಪಿಸುವುದು.",
    en: "Weekly Seva: Offer green fodder, jaggery and bananas to cows (Go-Grasa) or sponsor Annadaana to the needy on your catalyst weekday.",
    hi: "साप्ताहिक सेवा: प्रति सप्ताह प्रेरक ग्रह के दिन गाय को हरा चारा, गुड़ व केला खिलाएं (गौ-ग्रास) अथवा अन्नदान करें।",
    te: "వారపు సేవ: ప్రతి వారం ప్రేరక గ్రహం రోజున ఆవుకు గడ్డి, బెల్లం తినిపించాలి (గో-గ్రాసం) లేదా పేదలకు అన్నదానం చేయాలి.",
    ta: "வாராந்திர சேவை: ஒவ்வொரு வாரமும் தூண்டுதல் கிரக நாளில் பசுவிற்கு அகத்திக்கீரை, வெல்லம் அளிக்கவும் (கோ-பூஜை) அல்லது அன்னதானம் செய்யவும்."
  };

  // 8. Sacred Sankalpa Declaration
  const nameKn = formatNameForLanguage(devoteeName, "kn", "ಭಕ್ತ");
  const nameEn = formatNameForLanguage(devoteeName, "en", "Devotee");
  const nameHi = formatNameForLanguage(devoteeName, "hi", "भक्त");
  const nameTe = formatNameForLanguage(devoteeName, "te", "భక్తులు");
  const nameTa = formatNameForLanguage(devoteeName, "ta", "பக்தர்");

  const gotraKn = gotra ? formatNameForLanguage(gotra, "kn", "") : "";
  const gotraEn = gotra ? formatNameForLanguage(gotra, "en", "") : "";
  const gotraHi = gotra ? formatNameForLanguage(gotra, "hi", "") : "";
  const gotraTe = gotra ? formatNameForLanguage(gotra, "te", "") : "";
  const gotraTa = gotra ? formatNameForLanguage(gotra, "ta", "") : "";

  const sankalpaDeclaration: Record<SupportedLanguage, string> = {
    kn: `${gotraKn ? gotraKn + " ಗೋತ್ರೋದ್ಭವಸ್ಯ " : ""}${nameKn} ರವರಾದ ನಾನು, ಮಮ ಸಮಸ್ತ ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹ ಪೀಡಾ ನಿವಾರಣಾರ್ಥಂ, ಸರ್ವ ಸಂಕಲ್ಪ ಸಿದ್ಧರ್ಥಂ, ಭಗವಾನ್ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಸನ್ನಿಧಿಯ ಕೃಪೆಯಿಂದ ಈ ೪೫-ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಾಧನೆಯನ್ನು ಶ್ರದ್ಧಾ-ಭಕ್ತಿಗಳಿಂದ ಕೈಗೊಳ್ಳುತ್ತಿದ್ದೇನೆ.`,
    en: `I, devotee ${nameEn}${gotraEn ? " of " + gotraEn + " Gotra" : ""}, for the dissolution of all natal chart planetary afflictions and the fulfillment of my sacred Sankalpa, by the divine grace of Lord Mahabaleshwara at Gokarna Kshetra, solemnly undertake this 45-day Mandala Vrata Sadhana with devotion and unwavering faith.`,
    hi: `मैं, ${nameHi}${gotraHi ? " (" + gotraHi + " गोत्र)" : ""}, अपनी जन्म कुंडली के समस्त ग्रह दोषों के निवारण एवं अपने संकल्प की पूर्ण सिद्धि हेतु, भगवान श्री गोकर्ण महाबलेश्वर की कृपा से इस ४५-दिवसीय मंडल व्रत साधना को श्रद्धापूर्वक स्वीकार करता/करती हूँ।`,
    te: `${gotraTe ? gotraTe + " గోత్రోద్భవులైన " : ""}${nameTe} అను నేను, నా జన్మ కుండలిలోని సమస్త గ్రహ దోషాల నివారణార్థం, సంకల్ప సిద్ధ్యర్థం, శ్రీ గోకర్ణ మహాబలేశ్వరుని దివ్య కృపతో ఈ 45-రోజుల మండల వ్రత సాధనను శ్రద్ధాభక్తులతో ఆచరిస్తున్నాను.`,
    ta: `${gotraTa ? gotraTa + " கோத்திரத்தை சேர்ந்த " : ""}${nameTa} ஆகிய நான், எனது ஜாதக கிரக தோஷங்கள் நீங்கி சங்கல்ப சித்தி அடைவதற்காக, ஸ்ரீ கோகர்ண மகாபலேஸ்வரரின் திருவருளால் இந்த 45-நாள் மண்டல விரத சாதனையை பக்தியுடன் மேற்கொள்கிறேன்.`
  };

  return {
    durationDays: 45,
    durationLabel: {
      kn: "೪೫ ದಿನಗಳ ಮಂಡಲ ವ್ರತ ಸಂಕಲ್ಪ ಸಾಧನಾ ಪತ್ರಿಕೆ",
      en: "45-Day Sacred Mandala Vrata Sadhana Guide",
      hi: "४५-दिवसीय पवित्र मंडल व्रत साधना पत्रिका",
      te: "45-రోజుల పవిత్ర మండల వ్రత సాధనా పత్రిక",
      ta: "45-நாள் புனித மண்டல விரத சாதனை வழிகாட்டி"
    },
    auspiciousStartMuhurtha: {
      taraBalaCategory,
      taraBalaReason,
      auspiciousWeekday,
      tithiPakshaRecommendation: {
        kn: "ಶುಕ್ಲ ಪಕ್ಷದ ತೃತೀಯ, ಪಂಚಮಿ, ಸಪ್ತಮಿ ಅಥವಾ ಶುಭ ಏಕಾದಶಿ",
        en: "Shukla Paksha Tritiya, Panchami, Saptami, or Auspicious Ekadashi",
        hi: "शुक्ल पक्ष की तृतीया, पंचमी, सप्तमी अथवा शुभ एकादशी",
        te: "శుక్ల పక్ష తదియ, పంచమి, సప్తమి లేదా శుభ ఏకాదశి",
        ta: "சுக்ல பட்ச திருதியை, பஞ்சமி, சப்தமி அல்லது சுப ஏகாதசி"
      },
      idealTimeWindow: {
        kn: "ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ (ಮುಂಜಾನೆ 05:15 ರಿಂದ 06:15) ಅಥವಾ ಸೂರ್ಯೋದಯ ಕಾಲ",
        en: "Brahma Muhurtha (Dawn 05:15 to 06:15 AM) or Sunrise Phase",
        hi: "ब्राह्म मुहूर्त (प्रातः 05:15 से 06:15) अथवा सूर्योदय काल",
        te: "బ్రాహ్మీ ముహూర్తం (ఉదయం 05:15 నుండి 06:15) లేదా సూర్యోదయ సమయం",
        ta: "பிரம்மி முகூர்த்தம் (காலை 05:15 முதல் 06:15) அல்லது சூரியோதய காலம்"
      },
      facingDirection: {
        kn: "ಪೂರ್ವ ದಿಕ್ಕು (ಜ್ಞಾನ & ತೇಜಸ್ಸಿಗೆ) ಅಥವಾ ಉತ್ತರ ದಿಕ್ಕು (ಧನ & ಶಾಂತಿಗೆ)",
        en: "East (for Wisdom & Vitality) or North (for Wealth & Peace)",
        hi: "पूर्व दिशा (ज्ञान एवं तेज हेतु) अथवा उत्तर दिशा (धन एवं शांति हेतु)",
        te: "తూర్పు దిశ (జ్ఞానం & తేజస్సు కోసం) లేదా ఉత్తర దిశ (ధనం & శాంతి కోసం)",
        ta: "கிழக்கு திசை (ஞானம் & தேஜஸ்) அல்லது வடக்கு திசை (செல்வம் & அமைதி)"
      },
      sacredAsana: {
        kn: "ಶುದ್ಧ ಉಣ್ಣೆಯ ಕಂಬಳಿ (ಕಂಬಳ) ಅಥವಾ ದರ್ಭೆಯ ಆಸನ (ನೆಲದ ಸಂಪರ್ಕವಿಲ್ಲದೆ)",
        en: "Pure Woolen Blanket (Kambala) or Kusha Grass Mat (insulated from bare floor)",
        hi: "शुद्ध ऊनी कम्बल अथवा कुशा का आसन (भूमि स्पर्श रहित)",
        te: "శుద్ధ ఉన్ని ఆసనం లేదా దర్భాసనం (నేలను తాకకుండా)",
        ta: "தூய கம்பளி அல்லது தர்பை ஆசனம் (தரை தொடுதல் இன்றி)"
      }
    },
    threePhaseRoadmap: {
      phase1,
      phase2,
      phase3
    },
    japaPurashcharanaFormula: {
      dailyCountFormatted: {
        kn: "ದಿನಕ್ಕೆ ೧೦೮ ಬಾರಿ (೧ ಪವಿತ್ರ ಮಾಲೆ ನಿತ್ಯ ಜಪ)",
        en: "108 Counts Daily (1 Sacred Mala per day)",
        hi: "प्रतिदिन १०८ बार (१ पवित्र माला नित्य जप)",
        te: "రోజుకు 108 సార్లు (1 పవిత్ర మాల నిత్య జపం)",
        ta: "தினமும் 108 முறை (1 புனித மாலை தினசரி ஜபம்)"
      },
      totalMandalaCountFormatted: {
        kn: "೪೫ ದಿನಗಳಲ್ಲಿ ಒಟ್ಟು ೪,೮೬೦ ಜಪಗಳು (ಶಾಸ್ತ್ರೋಕ್ತ ಲಘು ಪುರಶ್ಚರಣ ಸಿದ್ಧಿ)",
        en: "4,860 Total Japas across 45 Days (Laghu Purashcharana Siddhi)",
        hi: "४५ दिनों में कुल ४,८६० जप (शास्त्रोक्त लघु पुरश्चरण सिद्धि)",
        te: "45 రోజుల్లో మొత్తం 4,860 జపాలు (శాస్త్రోక్త లఘు పురశ్చరణ సిద్ధి)",
        ta: "45 நாட்களில் மொத்தம் 4,860 ஜபங்கள் (சாஸ்திர லகு புரச்சரண சித்தி)"
      },
      prescribedMala,
      shastricRule: {
        kn: "ಮಂತ್ರ ಜಪದ ವೇಳೆ ತೋರುಬೆರಳನ್ನು (ತರ್ಜನಿ) ಮಾಲೆಗೆ ತಾಗಿಸಬಾರದು; ಮಧ್ಯದ ಬೆರಳು ಮತ್ತು ಹೆಬ್ಬೆರಳಿನಿಂದ ಮಾತ್ರ ಮಾಲೆಯನ್ನು ತಿರುಗಿಸಬೇಕು. ಮೇರು ಮಣಿಯನ್ನು ದಾಟದೆ ಹಿಮ್ಮುಖವಾಗಿ ತಿರುಗಿಸುವುದು ಶಾಸ್ತ್ರ ನಿಯಮ.",
        en: "Never touch the mala with the index finger (Tarjani); rotate solely using middle finger and thumb. Reverse direction without crossing the Meru bead.",
        hi: "माला जपते समय तर्जनी उंगली का स्पर्श न करें; मध्यमा एवं अंगूठे से ही माला फेरें। मेरु मणि को लांघना वर्जित है।",
        te: "మాల జపించేటప్పుడు చూపుడు వేలిని తాకించరాదు; మధ్య వేలు మరియు బొటనవేలితో మాత్రమే మాల తిప్పాలి. మేరు మణిని దాటకూడదు.",
        ta: "மந்திர ஜபத்தின் போது ஆள்காட்டி விரலை தொடக்கூடாது; நடுவிரல் மற்றும் கட்டைவிரலால் மட்டுமே மாலையை திருப்ப வேண்டும். மேரு மணியை தாண்டக்கூடாது."
      }
    },
    sattvicPathyaAndNiyama: {
      aharaRules,
      acharaRules,
      weeklyDaana
    },
    sankalpaDeclaration
  };
}


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
    (!isFemaleRemedy && input.maritalStatus !== "unmarried" && currentDiag.marriageDestiny?.verdict === "already_married")
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
  } else if (clsCat === "student_academic_stress" || clsCat === "early_childhood_play_milestones" || clsCat === "youth_artistic_or_sports_prodigy" || (devoteeAge >= 4 && devoteeAge <= 18)) {
    struggleCategory = "student_academic";
    intensity = "High";
  } else if (clsCat === "marriage_delay" || (isDestinyDelayedRemedy && (input.maritalStatus === "unmarried" || (isFemaleRemedy && !isConfirmedMarriedRemedy)) && devoteeAge >= 20 && devoteeAge <= 52)) {
    if (isConfirmedMarriedRemedy || input.maritalStatus === "married") {
      struggleCategory = "relationship_friction";
      intensity = "Moderate";
    } else {
      struggleCategory = "marriage_delay";
      intensity = "High";
    }
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

  // MANDATORY SAFEGUARD: Married natives MUST never be diagnosed with marriage delay or finding a partner!
  if ((isConfirmedMarriedRemedy || input.maritalStatus === "married") && struggleCategory === "marriage_delay") {
    struggleCategory = "relationship_friction";
    intensity = "Moderate";
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
      te: "సాధారణ గ్రహ సమన్వయం & ఆత్మశక్తి వృద్ధి",
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
  const catalystByLagna: Record<number, { graha: PlanetName; kn: string; en: string; hi: string; te: string; ta: string }> = {
    0: { graha: PlanetName.Jupiter, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಗುರು & ಪಂಚಮಾಧಿಪತಿ ರವಿ", en: "9th Lord Jupiter & 5th Lord Sun", hi: "भाग्येश गुरु एवं पंचमेश सूर्य", te: "భాగ్యాధిపతి గురుడు & పంచమాధిపతి సూర్యుడు", ta: "பாக்யாதிபதி குரு & பஞ்சமாதிபதி சூரியன்" },
    1: { graha: PlanetName.Saturn, kn: "ಯೋಗಕಾರಕ ಶನಿ & ಧನಾಧಿಪತಿ ಬುಧ", en: "Yogakaraka Saturn & Wealth Lord Mercury", hi: "योगकारक शनि एवं धनेश बुध", te: "యోగకారక శని & ధనాధిపతి బుధుడు", ta: "யோககாரக சனி & தனாதிபதி புதன்" },
    2: { graha: PlanetName.Mercury, kn: "ಲಗ್ನಾಧಿಪತಿ ಬುಧ & ಪಂಚಮಾಧಿಪತಿ ಶುಕ್ರ", en: "Ascendant Lord Mercury & 5th Lord Venus", hi: "लग्नेश बुध एवं पंचमेश शुक्र", te: "లగ్నాధిపతి బుధుడు & పంచమాధిపతి శుక్రుడు", ta: "லக்னாதிபதி புதன் & பஞ்சமாதிபதி சுக்கிரன்" },
    3: { graha: PlanetName.Mars, kn: "ಯೋಗಕಾರಕ ಕುಜ & ಭಾಗ್ಯಾಧಿಪತಿ ಗುರು", en: "Yogakaraka Mars & 9th Lord Jupiter", hi: "योगकारक मंगल एवं भाग्येश गुरु", te: "యోగకారక కుజుడు & భాగ్యాధిపతి గురుడు", ta: "யோககாரக செவ்வாய் & பாக்யாதிபதி குரு" },
    4: { graha: PlanetName.Mars, kn: "ಯೋಗಕಾರಕ ಕುಜ & ಲಗ್ನಾಧಿಪತಿ ರವಿ", en: "Yogakaraka Mars & Ascendant Lord Sun", hi: "योगकारक मंगल एवं लग्नेश सूर्य", te: "యోగకారక కుజుడు & లగ్నాధిపతి సూర్యుడు", ta: "யோககாரக செவ்வாய் & லக்னாதிபதி சூரியன்" },
    5: { graha: PlanetName.Venus, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಬುಧ", en: "9th Lord Venus & Ascendant Lord Mercury", hi: "भाग्येश शुक्र एवं लग्नेश बुध", te: "భాగ్యాధిపతి శుక్రుడు & లగ్నాధిపతి బుధుడు", ta: "பாக்யாதிபதி சுக்கிரன் & லக்னாதிபதி புதன்" },
    6: { graha: PlanetName.Saturn, kn: "ಯೋಗಕಾರಕ ಶನಿ & ಲಗ್ನಾಧಿಪತಿ ಶುಕ್ರ", en: "Yogakaraka Saturn & Ascendant Lord Venus", hi: "योगकारक शनि एवं लग्नेश शुक्र", te: "యోగకారక శని & లగ్నాధిపతి శుక్రుడు", ta: "யோககாரக சனி & லக்னாதிபதி சுக்கிரன்" },
    7: { graha: PlanetName.Jupiter, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಚಂದ್ರ & ಪಂಚಮಾಧಿಪತಿ ಗುರು", en: "9th Lord Moon & 5th Lord Jupiter", hi: "भाग्येश चन्द्र एवं पंचमेश गुरु", te: "భాగ్యాధిపతి చంద్రుడు & పంచమాధిపతి గురుడు", ta: "பாக்யாதிபதி சந்திரன் & பஞ்சமாதிபதி குரு" },
    8: { graha: PlanetName.Sun, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ರವಿ & ಲಗ್ನಾಧಿಪತಿ ಗುರು", en: "9th Lord Sun & Ascendant Lord Jupiter", hi: "भाग्येश सूर्य एवं लग्नेश गुरु", te: "భాగ్యాధిపతి సూర్యుడు & లగ్నాధిపతి గురుడు", ta: "பாக்யாதிபதி சூரியன் & லக்னாதிபதி குரு" },
    9: { graha: PlanetName.Venus, kn: "ಯೋಗಕಾರಕ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಶನಿ", en: "Yogakaraka Venus & Ascendant Lord Saturn", hi: "योगकारक शुक्र एवं लग्नेश शनि", te: "యోగకారక శుక్రుడు & లగ్నాధిపతి శని", ta: "யோககாரக சுக்கிரன் & லக்னாதிபதி சனி" },
    10: { graha: PlanetName.Venus, kn: "ಯೋಗಕಾರಕ ಶುಕ್ರ & ಲಗ್ನಾಧಿಪತಿ ಶನಿ", en: "Yogakaraka Venus & Ascendant Lord Saturn", hi: "योगकारक शुक्र एवं लग्नेश शनि", te: "యోగకారక శుక్రుడు & లగ్నాధిపతి శని", ta: "யோககாரக சுக்கிரன் & லக்னாதிபதி சனி" },
    11: { graha: PlanetName.Mars, kn: "ಭಾಗ್ಯಾಧಿಪತಿ ಕುಜ & ಲಗ್ನಾಧಿಪತಿ ಗುರು", en: "9th Lord Mars & Ascendant Lord Jupiter", hi: "भाग्येश मंगल एवं लग्नेश गुरु", te: "భాగ్యాధిపతి కుజుడు & లగ్నాధిపతి గురుడు", ta: "பாக்யாதிபதி செவ்வாய் & லக்னாதிபதி குரு" }
  };
  const catalyst = catalystByLagna[lagnaRashiIndex] || catalystByLagna[0];

  const timingMonths = dashaTiming?.remainingMonths ?? 8;
  const turnaroundTimelineKn = dashaTiming?.timelineKn || `ಮುಂದಿನ ${timingMonths} ತಿಂಗಳುಗಳಲ್ಲಿ`;
  const turnaroundTimelineEn = dashaTiming?.timelineEn || `over the Next ${timingMonths} Month${timingMonths > 1 ? "s" : ""}`;

  const timeline5L: Record<string, string> = {
    kn: turnaroundTimelineKn,
    en: turnaroundTimelineEn,
    hi: `आगामी ${timingMonths} महीनों में`,
    te: `రాబోయే ${timingMonths} నెలల్లో`,
    ta: `அடுத்த ${timingMonths} மாதங்களில்`
  };

  const catalystGraha5L: Record<string, string> = {
    kn: catalyst.kn,
    en: catalyst.en,
    hi: catalyst.hi || catalyst.en,
    te: catalyst.te || catalyst.en,
    ta: catalyst.ta || catalyst.en
  };

  const breakthroughMechanism5L: Record<string, Record<string, string>> = {
    general_alignment: {
      kn: `ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಸಂಚಾರದಲ್ಲಿ ಯೋಗಕಾರಕ ಗ್ರಹದ ಬಲದಿಂದ ಕರ್ಮಬಂಧ ಕರಗಿ ಭಾಗ್ಯೋದಯದ ಹೊಸ ಹಾದಿ ತೆರೆದುಕೊಳ್ಳಲಿದೆ.`,
      en: `Under current planetary transit and benefic catalyst support, karmic roadblocks dissolve, opening clear breakthrough horizons.`,
      hi: `वर्तमान दशा-भुक्ति एवं योगकारक ग्रह के प्रभाव से समस्त कर्म बंधन शांत होकर भाग्योदय का मार्ग प्रशस्त होगा।`,
      te: `ప్రస్తుత దశా-భుక్తి ప్రభావం మరియు యోగకారక గ్రహ బలం వల్ల కర్మ బంధాలు తొలగి భాగ్యోదయ మార్గం సుగమమవుతుంది.`,
      ta: `நடப்பு திசா-புக்தி மற்றும் யோககாரக கிரக பலத்தால் தடைகள் நீங்கி சுப யோகமும் பாக்கியமும் கூடும்.`
    },
    marriage_delay: {
      kn: `ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಸಂಚಾರದಲ್ಲಿ ಕಂಕಣ ಬಲ ಜಾಗೃತಗೊಂಡು, ಸಪ್ತಮಾಧಿಪತಿ ಹಾಗೂ ಗುರು ಕೃಪೆಯಿಂದ ಸಕಲ ವಿವಾಹ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿಶ್ಚಿತಾರ್ಥ ನೆರವೇರಲಿದೆ.`,
      en: `Matrimonial alignments awaken under Jupiter-Venus benefic transit, dissolving delay doshas and sealing an auspicious match.`,
      hi: `वर्तमान दशा क्रम में कंकण बल जागृत होकर गुरु-शुक्र कृपा से विवाह की बाधाएं शांत होंगी एवं शीघ्र सगाई होगी।`,
      te: `ప్రస్తుత దశా కాలంలో కంకణ బలం చేకూరి గురు-శుక్రుల అనుగ్రహంతో వివాహ విఘ్నాలు తొలగి శుభకార్యం జరుగుతుంది.`,
      ta: `நடப்பு திசா காலத்தில் மங்கல யோகம் கூடி, குரு-சுக்கிரன் அருளால் திருமண தடைகள் விலகி திருமணம் நிச்சயிக்கப்படும்.`
    },
    student_academic: {
      kn: `ಬುದ್ಧಿಕಾರಕ ಬುಧ ಹಾಗೂ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿಯ ಅನುಗ್ರಹದಿಂದ ಏಕಾಗ್ರತೆ ಹೆಚ್ಚಿ, ಮುಂಬರುವ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಶ್ರೇಣಿ ಹಾಗೂ ಕಾಲೇಜು ಪ್ರವೇಶಾವಕಾಶ ಲಭಿಸಲಿದೆ.`,
      en: `Cognitive clarity sharpens under Mercury and Dakshinamurthy alignment, eliminating exam anxiety and securing academic honors.`,
      hi: `बुद्धि कारक बुध एवं मेधा दक्षिणामूर्ति कृपा से एकाग्रता बढ़कर आगामी परीक्षाओं में उत्कृष्ट सफलता प्राप्त होगी।`,
      te: `బుద్ధి కారక బుధుడు మరియు మేధా దక్షిణామూర్తి అనుగ్రహంతో ఏకాగ్రత పెరిగి పరీక్షలలో ఉత్తమ ఫలితాలు లభిస్తాయి.`,
      ta: `புதன் மற்றும் மேதா தட்சிணாமூர்த்தி அருளால் ஏகாக்கிரதை கூடி தேர்வுகளில் சிறந்த மதிப்பெண்கள் மற்றும் உயர்கல்வி வாய்ப்பு கிட்டும்.`
    },
    debt_financial: {
      kn: `ಧನಕಾರಕ ಗುರು ಹಾಗೂ ಕುಬೇರ ಸಂಕಲ್ಪದಿಂದ ಸಾಲ ಮರುಪಾವತಿಗೆ ನೂತನ ಆರ್ಥಿಕ ಆದಾಯ ಮೂಲಗಳು ತೆರೆದುಕೊಂಡು ಬಿಕ್ಕಟ್ಟು ಸಂಪೂರ್ಣ ಶಮನವಾಗಲಿದೆ.`,
      en: `Fresh liquidity channels open under Dhanakaraka Jupiter transit, enabling systematic debt clearance and wealth stability.`,
      hi: `धनकारक गुरु एवं कुबेर कृपा से ऋणमुक्ति के नए आय स्रोत खुलेंगे तथा आर्थिक संकट समाप्त होगा।`,
      te: `ధనకారక గురు మరియు కుబేర అనుగ్రహంతో రుణాలు తీర్చడానికి నూతన ఆదాయ మార్గాలు ఏర్పడి ఆర్థిక సమస్యలు తీరుతాయి.`,
      ta: `தனகாரக குரு மற்றும் குபேர அருளால் கடன் அடைக்க புதிய வருமான வழிகள் பிறந்து பொருளாதார நெருக்கடி நீங்கும்.`
    },
    leadership_expansion: {
      kn: `೧೦ನೇ ಕೀರ್ತಿ ಸ್ಥಾನದ ರಾಜಯೋಗ ಬಲದಿಂದ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ ಹಾಗೂ ಜಾಗತಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಅಖಂಡ ಯಶಸ್ಸು ಮುಂದುವರಿಯಲಿದೆ.`,
      en: `High-level 10th house Raja Yoga continues scaling executive authority, institutional expansion, and global renown.`,
      hi: `दशम भाव के राजयोग से नेतृत्व क्षमता और बड़े निर्णयों में अभूतपूर्व सफलता प्राप्त होगी।`,
      te: `10వ భావ రాజయోగ బలం వల్ల సంస్థాగత నాయకత్వంలో మరియు కీలక నిర్ణయాలలో సంపూర్ణ విజయం లభిస్తుంది.`,
      ta: `10ம் இடத்து ராஜயோகத்தால் தலைமைத்துவமும் நிர்வாக முடிவுகளில் பெரும் வெற்றியும் புகழும் கிட்டும்.`
    },
    creative_stardom: {
      kn: `೫ನೇ ಪ್ರತಿಭಾ ಸ್ಥಾನ ಹಾಗೂ ಶುಕ್ರ-ಬುಧರ ಕಲಾತ್ಮಕ ಯೋಗದಿಂದ ನೂತನ ಸೃಷ್ಟಿಗೆ ಅಪಾರ ಜಾಗತಿಕ ಮನ್ನಣೆ ಹಾಗೂ ಕೋಟ್ಯಂತರ ರಸಿಕರ ಪ್ರೀತಿ ದಕ್ಕಲಿದೆ.`,
      en: `Artistic innovation reaches peak resonance under 5th house Venus alignments, commanding global viral reach and fan acclaim.`,
      hi: `पंचम कला भाव एवं शुक्र-बुध योग से नवीन सृजन को अंतरराष्ट्रीय ख्याति एवं अपार जनसमर्थन मिलेगा।`,
      te: `5వ కళా భావం మరియు శుక్ర-బుధుల యోగంతో నూతన సృష్టికి విశేష ప్రజాదరణ మరియు కీర్తి లభిస్తాయి.`,
      ta: `5ம் கலை ஸ்தானம் மற்றும் சுக்கிர-புதன் சேர்க்கையால் புதிய படைப்புகளுக்கு உலகளாவிய பாராட்டும் மக்கள் செல்வாக்கும் கூடும்.`
    },
    elite_sports: {
      kn: `ಕುಜ-ರವಿ ತೇಜಸ್ಸಿನಿಂದ ಕ್ರೀಡಾ ಪರಾಕ್ರಮ ಉತ್ತುಂಗಕ್ಕೇರಿ ಮುಂಬರುವ ಪ್ರಮುಖ ಪಂದ್ಯಾವಳಿಗಳಲ್ಲಿ ನೂತನ ದಾಖಲೆಗಳು ನಿರ್ಮಾಣವಾಗಿ ಚಾಂಪಿಯನ್ ಕಿರೀಟ ಲಭಿಸಲಿದೆ.`,
      en: `Unstoppable Mars-Sun athletic stamina manifests in major tournaments, securing championship trophies and physical supremacy.`,
      hi: `मंगल-सूर्य के तेज से खेलकूद में पराक्रम बढ़कर आगामी प्रतियोगिताओं में कीर्तिमान और विजय प्राप्त होगी।`,
      te: `కుజ-సూర్య బలంతో క్రీడల్లో అద్భుత ప్రతిభ కనబరచి చాంపియన్ విజయాలు సాధిస్తారు.`,
      ta: `செவ்வாய்-சூரியன் தேஜஸால் விளையாட்டில் அசுர பலமும் புதிய சாதனைகளும் சாம்பியன் பட்டமும் கிட்டும்.`
    },
    legal_confinement: {
      kn: `ಸುದರ್ಶನ ನರಸಿಂಹ ಹಾಗೂ ಕಾಲಭೈರವ ಕೃಪೆಯಿಂದ ನ್ಯಾಯಾಲಯ ವ್ಯಾಜ್ಯಗಳು ಶೀಘ್ರ ಇತ್ಯರ್ಥವಾಗಿ ಸತ್ಯಕ್ಕೆ ಜಯ ಲಭಿಸಲಿದೆ.`,
      en: `Legal gridlocks dissolve through Sudarshana Narasimha shielding, establishing righteous vindication and peaceful release.`,
      hi: `सुदर्शन नृसिंह एवं कालभैरव कृपा से कानूनी विवाद शीघ्र सुलझेंगे और सत्य की विजय होगी।`,
      te: `సుదర్శన నరసింహ మరియు కాలభైరవ అనుగ్రహంతో న్యాయ వివాదాలు పరిష్కారమై సత్యానికి విజయం లభిస్తుంది.`,
      ta: `சுதர்சன நரசிம்மர் மற்றும் காலபைரவர் அருளால் வழக்குகள் சாதகமாக முடிந்து சத்தியத்திற்கு வெற்றி கிட்டும்.`
    },
    health_vitality: {
      kn: `ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪದಿಂದ ಜೀವಧಾತು ಪುನಶ್ಚೇತನಗೊಂಡು, ದೈಹಿಕ ನವಚೈತನ್ಯ ಹಾಗೂ ಸಂಪೂರ್ಣ ಆರೋಗ್ಯ ಸಿದ್ಧಿಸಲಿದೆ.`,
      en: `Cellular rejuvenation accelerates under Mahamrityunjaya shanti, restoring robust immunity, energy, and physical vitality.`,
      hi: `महामृत्युंजय अनुष्ठान से प्राण ऊर्जा पुनः जाग्रत होकर उत्तम स्वास्थ्य एवं दीर्घायु की प्राप्ति होगी।`,
      te: `మహామృత్యుంజయ సంకల్పంతో శరీరంలో నూతన చైతన్యం పెరిగి సంపూర్ణ ఆరోగ్యం చేకూరుతుంది.`,
      ta: `மகா மிருத்யுஞ்சய பூஜையால் நோய் எதிர்ப்பு சக்தி அதிகரித்து பூரண ஆரோக்கியமும் புத்துணர்ச்சியும் உண்டாகும்.`
    },
    relationship_friction: {
      kn: `ಉಮಾ-ಮಹೇಶ್ವರ ಕೃಪೆಯಿಂದ ಸಂಗಾತಿಗಳ ನಡುವಿನ ಅಪಾರ್ಥಗಳು ಕರಗಿ, ಪರಸ್ಪರ ಪ್ರೇಮ, ವಿಶ್ವಾಸ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಮರಳಲಿದೆ.`,
      en: `Marital emotional distance dissolves under Uma-Maheshwara grace, re-establishing deep affection and domestic peace.`,
      hi: `उमा-महेश्वर कृपा से दांपत्य के मतभेद समाप्त होकर परस्पर प्रेम और सुख-शांति लौटेगी।`,
      te: `ఉమా-మహేశ్వర అనుగ్రహంతో దంపతుల మధ్య అపార్థాలు తొలగి పరస్పర ప్రేమ మరియు కుటుంబ శాంతి లభిస్తాయి.`,
      ta: `உமா-மஹேஸ்வரர் அருளால் தம்பதியரிடையே உள்ள கருத்து வேறுபாடுகள் நீங்கி அன்பும் அமைதியும் நிலவும்.`
    },
    anger_temper: {
      kn: `ಸೋಮ-ಚಂದ್ರ ಹಾಗೂ ಕುಜ ಶಾಂತಿಯಿಂದ ಆಂತರಿಕ ಪಿತ್ತ ತಾಪ ಕರಗಿ, ವಿವೇಕಯುತ ಶಾಂತ ನಿರ್ಧಾರಗಳಿಂದ ಸರ್ವ ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`,
      en: `High Pitta turbulence quenches under Soma-Mars shanti, restoring crystal-clear equanimity and harmonious communication.`,
      hi: `सोम-मंगल शांति से आंतरिक पित्त शांत होकर विवेकपूर्ण निर्णयों से सफलता मिलेगी।`,
      te: `సోమ-కుజ శాంతితో కోపం తగ్గి వివేకవంతమైన నిర్ణయాలతో విజయం సాధిస్తారు.`,
      ta: `சோம-செவ்வாய் சாந்தியால் கோபம் தணிந்து நிதானமான முடிவுகளால் காரிய வெற்றி கிட்டும்.`
    },
    career_obstacles: {
      kn: `ಶನಿ ಮಹಾತ್ಮನ ಕೃಪೆ ಮತ್ತು ಗೋಚಾರ ಗುರು ಬಲದಿಂದ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉದ್ಯೋಗಾವಕಾಶ ಹಾಗೂ ಗೌರವಯುತ ಬಡ್ತಿ ಲಭಿಸಲಿದೆ.`,
      en: `Saturnian delays transmute into enduring professional momentum, elevating native into a stable career breakthrough.`,
      hi: `शनि देव की कृपा एवं गुरु बल से कार्यक्षेत्र में पदोन्नति एवं नवीन आजीविका अवसर प्राप्त होंगे।`,
      te: `శని దేవుని కృప మరియు గురు బలంతో ఉద్యోగంలో పదోన్నతి మరియు నూతన అవకాశాలు లభిస్తాయి.`,
      ta: `சனி பகவான் அருள் மற்றும் குரு பலத்தால் பணியிடத்தில் பதவி உயர்வு மற்றும் புதிய வேலை வாய்ப்புகள் அமையும்.`
    }
  };

  const turnaroundSeva5L: Record<string, Record<string, string>> = {
    general_alignment: {
      kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ & ನವಗ್ರಹ ಶಾಂತಿ`,
      en: `Sri Kshetra Gokarna Mahabaleshwara Atmalinga Ksheerabhisheka & Navagraha Shanti`,
      hi: `श्री क्षेत्र गोकर्ण महाबलेश्वर सन्निधि में आत्मलिंग क्षीराभिषेक एवं नवग्रह शांति`,
      te: `శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో ఆత్మలింగ క్షీరాభిషేకం & నవగ్రహ శాంతి`,
      ta: `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் ஆத்மலிங்க பாலாபிஷேகம் & நவக்கிரக சாந்தி`
    },
    marriage_delay: {
      kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಕಲ್ಯಾಣ ಪೂಜೆ & ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ`,
      en: `Gokarna Uma-Maheshwara Kalyana Pooja & Swayamvara Parvati Homa`,
      hi: `गोकर्ण महाबलेश्वर सन्निधि में उमा-महेश्वर कल्याण पूजा एवं स्वयंवर पार्वती होम`,
      te: `గోకర్ణ మహాబలేశ్వర సన్నిధిలో ఉమా-మహేశ్వర కళ్యాణ పూజ & స్వయంవర పార్వతీ హోమం`,
      ta: `கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் உமா-மஹேஸ்வரர் கல்யாண பூஜை & சுயம்வர பார்வதி ஹோமம்`
    },
    student_academic: {
      kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ & ವಿದ್ಯಾ ಗಣಪತಿ ಪೂಜೆ`,
      en: `Gokarna Medha Dakshinamurthy Sankalpa & Vidya Ganapati Pooja`,
      hi: `गोकर्ण क्षेत्र में मेधा दक्षिणामूर्ति संकल्प एवं विद्या गणपति पूजा`,
      te: `గోకర్ణంలో మేధా దక్షిణామూర్తి సంకల్పం & విద్యా గణపతి పూజ`,
      ta: `கோகர்ணத்தில் மேதா தட்சிணாமூர்த்தி சங்கல்பம் & வித்யா கணபதி பூஜை`
    },
    debt_financial: {
      kn: `ಶ್ರೀ ಗೋಕರ್ಣದಲ್ಲಿ ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಪೂಜೆ & ಕನಕಧಾರಾ ಮಹಾಲಕ್ಷ್ಮೀ ಸಂಕಲ್ಪ`,
      en: `Gokarna Runa Vimochana Angaraka Pooja & Kanakadhara Mahalakshmi Sankalpa`,
      hi: `गोकर्ण में ऋणविमोचन अंगारक पूजा एवं कनकधारा महालक्ष्मी संकल्प`,
      te: `గోకర్ణంలో ఋణవిమోచన అంగారక పూజ & కనకధారా మహాలక్ష్మీ సంకల్పం`,
      ta: `கோகர்ணத்தில் ருணவிமோசன அங்காரக பூஜை & கனகதாரா மகாலட்சுமி சங்கல்பம்`
    },
    leadership_expansion: {
      kn: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರಾಜಯೋಗ ಸಂಪದ ಮಹಾಪೂಜೆ & ಸುವರ್ಣ ಸಂಕಲ್ಪ ಸೇವೆ`,
      en: `Gokarna Raja Yoga Sampada Maha Pooja & Suvarna Sankalpa Seva`,
      hi: `महाबलेश्वर सन्निधि में राजयोग संपदा महापूजा एवं सुवर्ण संकल्प सेवा`,
      te: `మహాబలేశ్వర సన్నిధిలో రాజయోగ సంపద మహాపూజ & సువర్ణ సంకల్ప సేవ`,
      ta: `மகாபலேஸ்வரர் சந்நிதியில் ராஜயோக சம்பத மகாபூஜை & சுவர்ண சங்கல்ப சேவை`
    },
    creative_stardom: {
      kn: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರಸ್ವತಿ-ಲಕ್ಷ್ಮೀ ಗಾನ-ಕಲಾ ಸಿದ್ಧಿ ಮಹಾಪೂಜೆ`,
      en: `Gokarna Saraswati-Lakshmi Gana-Kala Siddhi Maha Pooja`,
      hi: `महाबलेश्वर सन्निधि में सरस्वती-लक्ष्मी गान-कला सिद्धि महापूजा`,
      te: `మహాబలేశ్వర సన్నిధిలో సరస్వతి-లక్ష్మీ గాన-కళా సిద్ధి మహాపూజ`,
      ta: `மகாபலேஸ்வரர் சந்நிதியில் சரஸ்வதி-லட்சுமி கான-கலா சித்தி மகாபூஜை`
    },
    elite_sports: {
      kn: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ತೇಜಸ್ಸು ಪೂಜೆ & ಆದಿತ್ಯ ಹೃದಯ ಮಹಾಸಂಕಲ್ಪ`,
      en: `Gokarna Subrahmanya Tejas Pooja & Aditya Hrudaya Maha Sankalpa`,
      hi: `महाबलेश्वर सन्निधि में सुब्रह्मण्य तेजस पूजा एवं आदित्य हृदय महासंकल्प`,
      te: `మహాబలేశ్వర సన్నిధిలో సుబ్రహ్మణ్య తేజస్సు పూజ & ఆదిత్య హృదయ మహాసంకల్పం`,
      ta: `மகாபலேஸ்வரர் சந்நிதியில் சுப்பிரமணிய தேஜஸ் பூஜை & ஆதித்ய ஹிருதய மகாசங்கல்பம்`
    },
    legal_confinement: {
      kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುದರ್ಶನ ನರಸಿಂಹ ಜಪ & ಬಗಲಾಮುಖೀ ರಕ್ಷಾ ಕವಚ ಪೂಜೆ`,
      en: `Gokarna Sudarshana Narasimha Japa & Bagalamukhi Raksha Kavacha Pooja`,
      hi: `गोकर्ण सन्निधि में सुदर्शन नृसिंह जप एवं बगलामुखी रक्षा कवच पूजा`,
      te: `గోకర్ణ సన్నిధిలో సుదర్శన నరసింహ జపం & బగలాముఖీ రక్షా కవచ పూజ`,
      ta: `கோகர்ண சந்நிதியில் சுதர்சன நரசிம்மர் ஜெபம் & பகளாமுகி ரக்ஷா கவச பூஜை`
    },
    health_vitality: {
      kn: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ & ಆಯುಷ್ಯ ಹೋಮ`,
      en: `Gokarna Mahamrityunjaya Tailabhisheka & Ayushya Homa`,
      hi: `महाबलेश्वर सन्निधि में महामृत्युंजय तैलाभिषेक एवं आयुष्य होम`,
      te: `మహాబలేశ్వర సన్నిధిలో మహామృత్యుంజయ తైలాభిషేకం & ఆయుష్య హోమం`,
      ta: `மகாபலேஸ்வரர் சந்நிதியில் மகா மிருத்யுஞ்சய தைலாபிஷேகம் & ஆயுஷ்ய ஹோமம்`
    },
    relationship_friction: {
      kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಪೂಜೆ`,
      en: `Gokarna Uma-Maheshwara Shanti Pooja`,
      hi: `गोकर्ण महाबलेश्वर सन्निधि में उमा-महेश्वर शांति पूजा`,
      te: `గోకర్ణ మహాబలేశ్వర సన్నిధిలో ఉమా-మహేశ్వర శాంతి పూజ`,
      ta: `கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் உமா-மஹேஸ்வரர் சாந்தி பூஜை`
    },
    anger_temper: {
      kn: `ಗೋಕರ್ಣ ಕುಜ ಶಾಂತಿ, ತಾಮ್ರಾಭಿಷೇಕ & ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ`,
      en: `Gokarna Kuja Shanti, Copper Abhisheka & Subrahmanya Seva`,
      hi: `गोकर्ण में मंगल शांति, ताम्राभिषेक एवं सुब्रह्मण्य सेवा`,
      te: `గోకర్ణంలో కుజ శాంతి, తామ్రాభిషేకం & సుబ్రహ్మణ్య సేవ`,
      ta: `கோகர்ணத்தில் செவ்வாய் சாந்தி, தாம்பிராபிஷேகம் & சுப்பிரமணியர் பூஜை`
    },
    career_obstacles: {
      kn: `ಗೋಕರ್ಣ ಶನಿ-ಶಿವಾಭಿಷೇಕ & ಮಹಾಮೃತ್ಯುಂಜಯ ತೈಲಾಭಿಷೇಕ`,
      en: `Gokarna Shani-Shiva Tailabhisheka & Mrityunjaya Shanti`,
      hi: `गोकर्ण में शनि-शिवाभिषेक एवं महामृत्युंजय तैलाभिषेक`,
      te: `గోకర్ణంలో శని-శివాభిషేకం & మహామృత్యుంజయ తైలాభిషేకం`,
      ta: `கோகர்ணத்தில் சனி-சிவாபிஷேகம் & மகா மிருத்யுஞ்சய தைலாபிஷேகம்`
    }
  };

  const mech5L = breakthroughMechanism5L[struggleCategory] || breakthroughMechanism5L.general_alignment;
  const seva5L = turnaroundSeva5L[struggleCategory] || turnaroundSeva5L.general_alignment;

  const milestones = getTurnaroundMilestones(struggleCategory);

  const lifeTurnaroundTiming = {
    timelineKn: turnaroundTimelineKn,
    timelineEn: turnaroundTimelineEn,
    catalystGrahaKn: catalyst.kn,
    catalystGrahaEn: catalyst.en,
    breakthroughMechanismKn: mech5L.kn,
    breakthroughMechanismEn: mech5L.en,
    specificSevaKn: seva5L.kn,
    specificSevaEn: seva5L.en,
    timeline: timeline5L,
    catalystGraha: catalystGraha5L,
    breakthroughMechanism: mech5L,
    specificSeva: seva5L,
    astrologicalReason: milestones.astrologicalReason,
    beforeState: milestones.beforeState,
    afterState: milestones.afterState,
    day10Expectation: milestones.day10Expectation,
    day15Expectation: milestones.day15Expectation
  };

  // Affliction Factors List
  const afflictionFactors = [];

  // Badhaka Graha Analysis (Parashara Obstruction Sthana)
  const badhakaInfo = computeBadhakaAnalysis(lagnaRashiIndex);
  const badhakaPlanetObj = planets.find(p => p.name === badhakaInfo.badhakeshGraha);

  if (badhakaPlanetObj && ([1, 6, 7, 8, 11, 12].includes(badhakaPlanetObj.house) || badhakaPlanetObj.isDebilitated)) {
    afflictionFactors.push({
      graha: badhakaInfo.badhakeshGraha,
      title: {
        kn: `ಬಾಧಕಾಧಿಪತಿ ದೋಷ (${badhakaInfo.badhakeshName.kn})`,
        en: `Badhakesh Obstruction (${badhakaInfo.badhakeshName.en})`,
        hi: `बाधकेश दोष (${badhakaInfo.badhakeshName.hi})`,
        te: `బాధకాధిపతి దోషం (${badhakaInfo.badhakeshName.te})`,
        ta: `பாதகாதிபதி தோஷம் (${badhakaInfo.badhakeshName.ta})`
      },
      reason: badhakaInfo.diagnosisReason,
      house: badhakaPlanetObj.house,
      impact: {
        kn: "ಮಹತ್ವದ ಕಾರ್ಯಗಳು ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ವಿಳಂಬವಾಗುವುದು.",
        en: "Unforeseen bottlenecks occurring just as endeavors reach final culmination.",
        hi: "महत्वपूर्ण कार्यों में अंतिम क्षणों में अप्रत्याशित विलंब होना।",
        te: "పనులు చివరి దశకు చేరుకున్నప్పుడు ఆటంకాలు రావడం.",
        ta: "முக்கிய காரியங்கள் முடியும் தருவாயில் எதிர்பாராத தடைகள் ஏற்படுதல்."
      }
    });
  }

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

  if (sun && (sun.isDebilitated || sun.rashi.english === "Libra" || [6, 8, 12].includes(sun.house))) {
    afflictionFactors.push({
      graha: PlanetName.Sun,
      title: { kn: "ರವಿ ಕ್ಷೀಣತೆ / ಆತ್ಮಬಲ ಕೊರತೆ", en: "Sun Affliction / Low Vitality & Identity Strain", hi: "सूर्य दुर्बलता / आत्मबल क्षीणता", te: "సూర్య క్షీణత / ఆత్మబలం లోపం", ta: "சூரிய பலவீனம் / ஆன்ம பல குறைவு" },
      reason: { kn: `ರವಿ ಗ್ರಹವು ${sun.house} ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಅಥವಾ ನೀಚ ಸ್ಥಿತಿಯಲ್ಲಿದ್ದು, ದೈಹಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ಆತ್ಮವಿಶ್ವಾಸದಲ್ಲಿ ಏರಿಳಿತ ತರುತ್ತದೆ.`, en: `Sun placed in House ${sun.house} or debilitated affects sympathetic energy and vitality.`, hi: `सूर्य ${sun.house}वें भाव में अथवा नीच राशि में होकर आत्मविश्वास और ऊर्जा को प्रभावित करता है।`, te: `సూర్యుడు ${sun.house}వ స్థానంలో లేదా నీచంలో ఉండి ఆత్మవిశ్వాసాన్ని తగ్గిస్తాడు.`, ta: `சூரியன் ${sun.house}ம் இடத்தில் அல்லது நீசமாக இருந்து ஆத்ம பலத்தை பாதிக்கிறார்.` },
      house: sun.house,
      impact: { kn: "ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ, ತಂದೆಯವರ ಸಹಕಾರದಲ್ಲಿ ಅಡಚಣೆ.", en: "Low confidence, fatherly friction, energy fatigue.", hi: "आत्मविश्वास की कमी एवं थकान।", te: "ఆత్మవిశ్వాసం లోపించడం, అలసట.", ta: "நம்பிக்கையின்மை, உடல் சோர்வு." }
    });
  }

  if (jupiter && (jupiter.isDebilitated || jupiter.rashi.english === "Capricorn" || [6, 8, 12].includes(jupiter.house))) {
    afflictionFactors.push({
      graha: PlanetName.Jupiter,
      title: { kn: "ಗುರು ದೌರ್ಬಲ್ಯ / ವಿವೇಕ-ಧನ ಭಾಗ್ಯ ತಡೆ", en: "Jupiter Affliction / Wisdom & Fortune Slump", hi: "गुरु दुर्बलता / भाग्य एवं धन बाधा", te: "గురు దౌర్బల్యం / భాగ్య లోపం", ta: "குரு பலவீனம் / பாக்கிய தடை" },
      reason: { kn: `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ${jupiter.house} ನೇ ಭಾವದಲ್ಲಿ ನೆಲೆಸಿದ್ದು, ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಆರ್ಥಿಕ ವೃದ್ಧಿಯಲ್ಲಿ ಅಡೆತಡೆ ತರುತ್ತಾನೆ.`, en: `Jupiter in House ${jupiter.house} demands dedicated Guru propitiation to unblock higher guidance.`, hi: `बृहस्पति ${jupiter.house}वें भाव में होकर भाग्य और धन वृद्धि में विलंब करते हैं।`, te: `గురుడు ${jupiter.house}వ స్థానంలో ఉండి ధన, భాగ్యాలలో ఆటంకాలు కలిగిస్తాడు.`, ta: `குரு ${jupiter.house}ம் இடத்தில் இருந்து சுப காரியங்களில் தாமதம் ஏற்படுத்துகிறார்.` },
      house: jupiter.house,
      impact: { kn: "ಹಿರಿಯರ ಆಶೀರ್ವಾದದ ಕೊರತೆ, ನಿರ್ಧಾರಗಳಲ್ಲಿ ಗೊಂದಲ.", en: "Lack of mentorship, hesitation in big decisions.", hi: "निर्णय में असमंजस एवं रुकावट।", te: "నిర్ణయాలలో సందిగ్ధత.", ta: "முடிவெடுப்பதில் குழப்பம்." }
    });
  }

  if (mercury && (mercury.isDebilitated || mercury.rashi.english === "Pisces" || [6, 8, 12].includes(mercury.house))) {
    afflictionFactors.push({
      graha: PlanetName.Mercury,
      title: { kn: "ಬುಧ ಮಂದತೆ / ಏಕಾಗ್ರತೆ & ಸಂವಹನ ಭಂಗ", en: "Mercury Affliction / Communication Slump", hi: "बुध मंदता / एकाग्रता एवं संवाद बाधा", te: "బుధ బలహీనత / ఏకాగ్రత లోపం", ta: "புதன் பலவீனம் / தகவல் தொடர்பு தடை" },
      reason: { kn: `ಬುದ್ಧಿಕಾರಕ ಬುಧನು ${mercury.house} ನೇ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿದ್ದು, ವ್ಯಾಪಾರ, ಮಾತುಕತೆ ಮತ್ತು ಅಧ್ಯಯನದಲ್ಲಿ ಗೊಂದಲ ಉಂಟುಮಾಡಬಹುದು.`, en: `Mercury in House ${mercury.house} or debilitated triggers hesitation in negotiations and scattered thoughts.`, hi: `बुध ${mercury.house}वें भाव में होकर वाणी और व्यवसाय में उतार-चढ़ाव लाता है।`, te: `బుధుడు ${mercury.house}వ స్థానంలో ఉండి వ్యాపారంలో ఒడిదుడుకులు తెస్తాడు.`, ta: `புதன் ${mercury.house}ம் இடத்தில் இருந்து பேச்சிலும் வணிகத்திலும் தடைகளை தருகிறார்.` },
      house: mercury.house,
      impact: { kn: "ಸಂವಹನದಲ್ಲಿ ಅಪಾರ್ಥ, ನೆನಪಿನ ಶಕ್ತಿಯಲ್ಲಿ ಏರಿಳಿತ.", en: "Misunderstandings in communication, memory fatigue.", hi: "संवाद में गलतफहमियां।", te: "సమస్యలు, స్పష్టత లేకపోవడం.", ta: "தவறான புரிதல்கள், மறதி." }
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
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ ऐं सरस्वत्यै नमः । ॐ ह्रीं श्रीं क्लीं मेधादेव्यै नमः ॥",
      kannada: "॥ ಓಂ ಐಂ ಸರಸ್ವತ್ಯೈ ನಮಃ । ಓಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕ್ಲೀಂ ಮೇಧಾದೇವ್ಯೈ ನಮಃ ॥",
      telugu: "॥ ఓం ఐం సరస్వత్యై నమః । ఓం హ్రీం శ్రీం క్లీం మేధాదేవ్యై నమః ॥",
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
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
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
  } else if (struggleCategory === "relationship_friction") {
    protocolTitle = {
      kn: "⚡ ಉಮಾ-ಮಹೇಶ್ವರ ದಾಂಪತ್ಯ ಸಾಮರಸ್ಯ & ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಸೂತ್ರ",
      en: "⚡ 4-Step Uma-Maheshwara Marital Harmony & Domestic Peace Protocol",
      hi: "⚡ उमा-महेश्वर दांपत्य सामंजस्य एवं पारिवारिक शांति सूत्र",
      te: "⚡ ఉమా-మహేశ్వర దాంపత్య సామరస్య & కుటుంబ శాంతి సూత్రం",
      ta: "⚡ உமா-மஹேஸ்வர தாம்பத்ய ஒற்றுமை மற்றும் குடும்ப அமைதி விதி"
    };
    protocolSubtitle = {
      kn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಕೊರತೆ, ವಾದ-ವಿವಾದ ಅಥವಾ ಮನಸ್ತಾಪ ಉಂಟಾದಾಗ ಪರಸ್ಪರ ಶಾಂತಿಗಾಗಿ ಈ ೪ ಕ್ರಮಗಳನ್ನು ತಪ್ಪದೇ ಪಾಲಿಸಿ:",
      en: "Whenever marital friction, misunderstandings, or domestic disagreements arise, execute these 4 harmony steps:",
      hi: "दांपत्य जीवन में कलह, मतभेद या गलतफहमी उत्पन्न होने पर तुरंत इन ४ चरणों का पालन करें:",
      te: "భార్యాభర్తల మధ్య అభిప్రాయ భేదాలు లేదా మనస్పర్ధలు వచ్చినప్పుడు ఈ 4 దశలను పాటించండి:",
      ta: "தம்பதியரிடையே கருத்து வேறுபாடு அல்லது மனக்கசப்பு ஏற்படும் போது இந்த 4 படிகளை பின்பற்றவும்:"
    };
    stepsList = [
      {
        stepNumber: 1,
        icon: "💧",
        name: { kn: "೧. ಸೌಮ್ಯ ಮೌನ & ಶೀತಲ ಜಲ ಪ್ರಾಶನ", en: "1. Silence Pause & Cool Water Sip", hi: "१. मौन धारण एवं शीतल जल प्राशन", te: "1. మౌన ధారణ & చల్లని నీరు", ta: "1. மௌனம் & குளிர்ந்த நீர்" },
        action: { kn: "ವಾದ-ವಿವಾದದ ಸಮಯದಲ್ಲಿ ತಕ್ಷಣ ಮಾತನಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ, ಒಂದು ಲೋಟ ತಣ್ಣೀರನ್ನು ನಿಧಾನವಾಗಿ ಕುಡಿಯಿರಿ.", en: "Halt reactive speech immediately; sip a glass of cool room-temperature water slowly to lower emotional arousal.", hi: "विवाद के समय तुरंत बोलना बंद कर एक घूंट शीतल जल पिएं।", te: "వాదోపవాదాల సమయంలో మాట్లాడటం ఆపి చల్లని నీరు త్రాగండి.", ta: "வாக்குவாதத்தின் போது உடனே பேசுவதை நிறுத்தி நீர் அருந்தவும்." },
        detail: { kn: "ಕೋಪದ ಸಮಯದಲ್ಲಿ ಆಡುವ ಕಟು ಮಾತುಗಳು ಸಂಬಂಧಗಳನ್ನು ಹಾಳುಮಾಡುತ್ತವೆ; ಮೌನವು ಶಾಂತಿಗೆ ಮೊದಲ ಹೆಜ್ಜೆ.", en: "Prevents sharp reactive words that cause long-term relational damage, grounding the nervous system.", hi: "यह कटु शब्दों से बचाकर चित्त को शांत करता है।", te: "ఇది కఠినమైన మాటలను నివారించి మనస్సుకు ప్రశాంతతనిస్తుంది.", ta: "கடுஞ்சொற்களை தவிர்த்து அமைதியை தரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 2,
        icon: "🌬️",
        name: { kn: "೨. ಉಮಾ-ಮಹೇಶ್ವರ ಹೃದಯ ಶ್ವಾಸ", en: "2. Heart-Centered Coherent Breathing", hi: "२. हृदय चक्र अनुलोम श्वास", te: "2. హృదయ చక్ర ధ్యాన శ్వాస", ta: "2. இதய சக்கர பிராணாயாமம்" },
        action: { kn: "ಎದೆಯ ಮೇಲೆ ಬಲಗೈ ಇಟ್ಟು, ೫ ಸೆಕೆಂಡ್ ದೀರ್ಘ ಉಸಿರೆಳೆದು ೫ ಸೆಕೆಂಡ್ ನಿಧಾನವಾಗಿ ಹೊರಬಿಡಿ (೭ ಆವರ್ತನೆ).", en: "Place right palm over the heart center; inhale gently for 5s, exhale for 5s, practicing 7 rhythmic cycles.", hi: "हृदय पर हाथ रखकर ५ सेकंड श्वास लें और ५ सेकंड में छोड़ें।", te: "గుండెలపై చేయి ఉంచి 7 సార్లు దీర్ఘ శ్వాస తీసుకోండి.", ta: "இதயத்தில் கை வைத்து 7 முறை சீரான மூச்சு விடவும்." },
        detail: { kn: "ಇದು ಹೃದಯ ಚಕ್ರದಲ್ಲಿ ಅನುಕಂಪ ಮತ್ತು ಸಹನೆಯ ತರಂಗಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸಿ ಅಹಂಕಾರವನ್ನು ಕರಗಿಸುತ್ತದೆ.", en: "Activates vagal brake and heart coherence, replacing defensive ego rigidity with emotional empathy.", hi: "यह अहंकार को शांत कर प्रेम और करुणा का संचार करता है।", te: "ఇది సహనాన్ని పెంచి అహంకారాన్ని తగ్గిస్తుంది.", ta: "இது அகந்தையை போக்கி அன்பை வளர்க்கும்." },
        duration: { kn: "೧.೫ ನಿಮಿಷ", en: "1.5 Minutes", hi: "१.५ मिनट", te: "1.5 నిమిషాలు", ta: "1.5 நிமிடங்கள்" }
      },
      {
        stepNumber: 3,
        icon: "🌸",
        name: { kn: "೩. ಆದಿದಂಪತಿ ಸೌಹಾರ್ದ ಧ್ಯಾನ", en: "3. Uma-Maheshwara Harmony Contemplation", hi: "३. उमा-महेश्वर सामंजस्य ध्यान", te: "3. ఉమా-మహేశ్వర సౌహార్ద ధ్యానం", ta: "3. உமா-மஹேஸ்வர தியானம்" },
        action: { kn: "ಆದಿದಂಪತಿಗಳಾದ ಶಿವ-ಪಾರ್ವತಿಯರ ಪರಸ್ಪರ ಗೌರವ ಹಾಗೂ ಅನ್ಯೋನ್ಯತೆಯನ್ನು ಮನಸ್ಸಿನಲ್ಲಿ ಧ್ಯಾನಿಸಿ ಸಂಗಾತಿಯ ಶುಭ ಗುಣಗಳನ್ನು ಸ್ಮರಿಸಿ.", en: "Visualize Lord Shiva and Mother Parvati in eternal loving union; recall 3 virtues and past kindness of your spouse.", hi: "शिव-पार्वती के अगाध प्रेम का ध्यान करते हुए जीवनसाथी के गुणों का स्मरण करें।", te: "శివపార్వతుల అనురాగాన్ని ధ్యానిస్తూ జీవిత భాగస్వామి మంచి గుణాలను తలచుకోండి.", ta: "சிவபார்வதி அன்யோன்யத்தை தியானித்து துணையின் நற்குணங்களை நினையுங்கள்." },
        detail: { kn: "ತಪ್ಪುಗಳನ್ನು ಕ್ಷಮಿಸುವ ದೊಡ್ಡ ಗುಣವು ದಾಂಪತ್ಯವನ್ನು ಭದ್ರಗೊಳಿಸುತ್ತದೆ ಮತ್ತು ನಕಾರಾತ್ಮಕತೆಯನ್ನು ಅಳಿಸುತ್ತದೆ.", en: "Dissolves hyper-focus on partner's flaws and anchors perspective in gratitude and sacred partnership.", hi: "यह क्षमाशीलता को बढ़ाकर दांपत्य को सुदृढ़ बनाता है।", te: "ఇది క్షమాగుణాన్ని పెంపొందిస్తుంది.", ta: "இது மன்னிக்கும் குணத்தை தந்து வாழ்வை காக்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಬೀಜ ಜಪ", en: "4. Uma-Maheshwara Shanti Mantra Japa", hi: "४. उमा-महेश्वर शांति मंत्र जप", te: "4. ఉమా-మహేశ్వర శాంతి మంత్ర జపం", ta: "4. உமா-மஹேஸ்வர சாந்தி மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಉಮಾ-ಮಹೇಶ್ವರ ಶಾಂತಿ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಶ್ರದ್ಧೆಯಿಂದ ಜಪಿಸಿ.", en: "Silently recite the sacred Uma-Maheshwara marital peace mantra 11 times.", hi: "मन ही मन उमा-महेश्वर शांति मंत्र का ११ बार जप करें।", te: "మనస్సులో ఉమా-మహేశ్వర శాంతి మంత్రాన్ని 11 సార్లు జపించండి.", ta: "மனதில் உமா-மஹேஸ்வர சாந்தி மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಪಾರ್ವತಿ-ಪರಮೇಶ್ವರರ ಕೃಪೆಯಿಂದ ಮನೆಯಲ್ಲಿ ಕಲಹ ನಿವಾರಣೆಯಾಗಿ ಪ್ರೇಮ, ಶಾಂತಿ ಮತ್ತು ಸೌಭಾಗ್ಯ ನೆಲೆಸುತ್ತದೆ.", en: "Invokes divine marital dispensations, cleansing astral toxicity and restoring sweet affection.", hi: "मां पार्वती और भगवान शिव की कृपा से गृह क्लेश दूर होकर शांति स्थापित होती है।", te: "శివపార్వతుల కృపతో కుటుంబంలో శాంతి వెల్లివిరుస్తుంది.", ta: "சிவபார்வதி அருளால் குடும்பத்தில் மகிழ்ச்சி நிலவும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      }
    ];
    emergencyMantraData = {
      sanskrit: "॥ ॐ नमः शिवाभ्यां शङ्करपार्वतीभ्यां नमः । ॐ उमामहेश्वराभ्यां नमः शान्तये ॥",
      kannada: "॥ ಓಂ ನಮಃ ಶಿವಾಭ್ಯಾಂ ಶಂಕರಪಾರ್ವತೀಭ್ಯಾಂ ನಮಃ । ಓಂ ಉಮಾಮಹೇಶ್ವರಾಭ್ಯಾಂ ನಮಃ ಶಾಂತಯೇ ॥",
      telugu: "॥ ఓం నమః శివాభ్యాం శంకరపార్వతీభ్యాం నమః । ఓం ఉమామహేశ్వరాభ్యాం నమః శాంతయే ॥",
      tamil: "॥ ஓம் நமஃ சிவாப்யாம் சங்கரபார்வதீப்யாம் நமஹ । ஓம் உமாமஹேஸ்வராப்யாம் நமஹ சாந்தயே ॥",
      hindi: "॥ ॐ नमः शिवाभ्यां शङ्करपार्वतीभ्यां नमः । ॐ उमामहेश्वराभ्यां नमः शान्तये ॥",
      transliteration: "Om Namah Shivabhyam Shankara Parvatibhyam Namaha | Om Uma Maheshwarabhyam Namaha Shantaye",
      meaning: {
        kn: "ಆದಿದಂಪತಿಗಳಾದ ಶಿವ-ಪಾರ್ವತಿಯರ ಕೃಪೆಯಿಂದ ಮನಸ್ತಾಪಗಳು ದೂರವಾಗಿ, ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೇಮ, ವಿಶ್ವಾಸ ಹಾಗೂ ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ನೆಲೆಸಲಿ.",
        en: "By the grace of the primordial couple Shiva and Parvati, may misunderstandings dissolve, restoring deep mutual affection, trust, and domestic peace.",
        hi: "आदिदम्पति शिव-पार्वती की कृपा से समस्त मतभेद दूर हों एवं दांपत्य में अगाध प्रेम व शांति बनी रहे।",
        te: "పార్వతీ పరమేశ్వరుల కృపతో విభేదాలు తొలగి దాంపత్యంలో అనురాగం, శాంతి కలుగుగాక.",
        ta: "சிவபார்வதி அருளால் கருத்து வேறுபாடுகள் நீங்கி தாம்பத்தியத்தில் அன்பும் அமைதியும் நிலவட்டும்."
      },
      japaCount: { kn: "೧೧ ಅಥವಾ ೨೧ ಬಾರಿ", en: "11 or 21 Times", hi: "११ अथवा २१ बार", te: "11 లేదా 21 సార్లు", ta: "11 அல்லது 21 முறை" }
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
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
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
        name: { kn: "೪. ಋಣವಿಮೋಚನ ಅಂಗಾರಕ ಬೀಜ ಜಪ", en: "4. Runa Vimochana Angaraka Beeja Japa", hi: "४. ऋणविमोचन अंगारक बीज जप", te: "4. రుణవిమోచన మంత్ర జపం", ta: "4. கடன் நிவாரண மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ಋಣಹರ್ತೃ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಸ್ಪಷ್ಟವಾಗಿ ಜಪಿಸಿ.", en: "Silently chant the sacred Runa Vimochana mantra 11 times.", hi: "मन में ऋणविमोचन अंगारक मंत्र का ११ बार जप करें।", te: "రుణవిమోచన మంత్రాన్ని 11 సార్లు జపించండి.", ta: "கடன் நிவாரண மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಭೂಮಿಪುತ್ರ ಕುಜ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಕೃಪೆಯಿಂದ ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ಹಾಗೂ ಸಾಲದ ಬಾಧೆಗಳು ಪರಿಹಾರವಾಗುತ್ತವೆ.", en: "Invokes divine planetary dispensations to break cycles of compounded liabilities.", hi: "भूमिपुत्र मंगल एवं लक्ष्मी कृपा से कर्ज से मुक्ति मिलती है।", te: "అంగారకుడి కృపతో అప్పుల బాధలు తొలగుతాయి.", ta: "அங்காரக பகவான் அருளால் கடன்கள் தீரும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
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
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
      },
      {
        stepNumber: 4,
        icon: "🕉️",
        name: { kn: "೪. ಮಹಾಮೃತ್ಯುಂಜಯ ಅಮೃತ ಬೀಜ ಜಪ", en: "4. Mahamrityunjaya Sanjeevini Japa", hi: "४. महामृत्युंजय अमृत मंत्र जप", te: "4. మహామృత్యుంజయ మంత్ర జపం", ta: "4. மகா மிருத்யுஞ்சய மந்திர ஜெபம்" },
        action: { kn: "ಮನಸ್ಸಿನಲ್ಲಿ ತ್ರ್ಯಂಬಕ ಮಂತ್ರವನ್ನು ೧೧ ಬಾರಿ ಭಕ್ತಿಯಿಂದ ಜಪಿಸಿ.", en: "Silently recite the supreme Mahamrityunjaya mantra 11 times.", hi: "मन ही मन महामृत्युंजय मंत्र का ११ बार जप करें।", te: "మహామృత్యుంజయ మంత్రాన్ని 11 సార్లు జపించండి.", ta: "மகா மிருத்யுஞ்சய மந்திரத்தை 11 முறை ஜபிக்கவும்." },
        detail: { kn: "ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಕೃಪೆಯಿಂದ ಸಕಲ ರೋಗ ಭಯ, ಅಕಾಲಿಕ ಬಾಧೆಗಳು ದೂರವಾಗಿ ಆಯುಷ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.", en: "Invokes Lord Shiva's ultimate restorative grace, shielding against physical and mental afflictions.", hi: "भगवान शिव की कृपा से अकाल कष्ट और रोग दूर होते हैं।", te: "శివుని కృపతో సమస్త రోగాలు నివారించబడతాయి.", ta: "சிவபெருமானின் அருளால் சகல நோய்களும் நீங்கும்." },
        duration: { kn: "೧ ನಿಮಿಷ", en: "1 Minute", hi: "१ मिनट", te: "1 నిమిషం", ta: "1 நிமிடம்" }
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
      telugu: "॥ ఓం శం శనైశ్చరాయ నమః । ఓం ప్రాం ప్రీం ప్రౌం సః శనయే నమః ॥",
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

  const KARANA_NAMES_L5_BY_KEY: Record<string, { kn: string; en: string; hi: string; te: string; ta: string }> = {
    Bava: { kn: "ಬವ", en: "Bava", hi: "बव", te: "బవ", ta: "பவம்" },
    Balava: { kn: "ಬಾಲವ", en: "Balava", hi: "बालव", te: "బాలవ", ta: "பாலவம்" },
    Kaulava: { kn: "ಕೌಲವ", en: "Kaulava", hi: "कौलव", te: "కౌలవ", ta: "கௌலவம்" },
    Taitila: { kn: "ತೈತಿಲ", en: "Taitila", hi: "तैतिल", te: "తైతిల", ta: "தைதுலம்" },
    Garaja: { kn: "ಗರಜ", en: "Garaja", hi: "गरज", te: "గరజ", ta: "கரசை" },
    Vanija: { kn: "ವಣಿಜ", en: "Vanija", hi: "वणिज", te: "వణిజ", ta: "வனசை" },
    Vishti: { kn: "ವಿಷ್ಟಿ (ಭದ್ರಾ)", en: "Vishti (Bhadra)", hi: "विष्टि (भद्रा)", te: "విష్టి (భద్ర)", ta: "பத்திரை (விஷ்டி)" },
    Shakuni: { kn: "ಶಕುನಿ", en: "Shakuni", hi: "शकुनि", te: "శకుని", ta: "சகுனி" },
    Chatushpada: { kn: "ಚತುಷ್ಪಾದ", en: "Chatushpada", hi: "चतुष्पद", te: "చతుష్పాద", ta: "சதுஷ்பாதம்" },
    Naga: { kn: "ನಾಗ", en: "Naga", hi: "नाग", te: "నాగ", ta: "நாகம்" },
    Kintughna: { kn: "ಕಿಂತುಘ್ನ", en: "Kintughna", hi: "किस्तुघ्न", te: "కింస్తుఘ్న", ta: "கிம்துக்கினம்" }
  };

  const panchangaRemedies: PanchangaRemedies = {
    elementalBalanceReason: {
      kn: "ಪಂಚಾಂಗದ ೫ ಅಂಗಗಳು ಮಾನವನ ಪಂಚ ಮಹಾಭೂತಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತವೆ: ತಿಥಿ (ಜಲ/ಭಾವನೆ), ವಾರ (ಅಗ್ನಿ/ಪ್ರಾಣ), ನಕ್ಷತ್ರ (ವಾಯು/ಮನಸ್ಸು), ಯೋಗ (ಆಕಾಶ/ಸೌಹಾರ್ದತೆ) ಮತ್ತು ಕರಣ (ಪೃಥ್ವಿ/ಕಾರ್ಯಸಿದ್ಧಿ). ಈ ಪಂಚಾಂಗ ಆರಾಧನೆಯಿಂದ ಜಾತಕದ ಸಮಸ್ತ ಅಶಾಂತಿ ಮೂಲದಿಂದಲೇ ಶಾಂತವಾಗುತ್ತದೆ.",
      en: "The 5 Panchanga Angas govern the five cosmic elements in the native: Tithi (Water/Emotions), Vara (Fire/Vitality), Nakshatra (Air/Mind), Yoga (Ether/Harmony), and Karana (Earth/Execution). Aligning these five anchors dissolves karmic afflictions at their very root.",
      hi: "पंचांग के ५ अंग पंचतत्वों को नियंत्रित करते हैं: तिथि (जल), वार (अग्नि), नक्षत्र (वायु), योग (आकाश), करण (पृथ्वी)। इनकी साधना से ग्रहदोष जड़ से शांत होते हैं।",
      te: "పంచాంగం యొక్క 5 అంగాలు పంచభూతాలను శాంతింపజేస్తాయి: తిథి (జలం), వారం (అగ్ని), నక్షత్రం (వాయువు), యోగం (ఆకాశం), కరణం (పృథ్వి).",
      ta: "பஞ்சாங்கத்தின் 5 அங்கங்கள் பஞ்சபூதங்களை சமநிலைப்படுத்துகின்றன: திதி (நீர்), வாரம் (நெருப்பு), நட்சத்திரம் (காற்று), யோகம் (ஆகாயம்), கரணம் (நிலம்)."
    },
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
      yogaName: YOGA_NAMES_L5[yogaIndex] ? {
        kn: YOGA_NAMES_L5[yogaIndex].kn,
        en: YOGA_NAMES_L5[yogaIndex].en,
        hi: YOGA_NAMES_L5[yogaIndex].hi,
        te: YOGA_NAMES_L5[yogaIndex].te,
        ta: YOGA_NAMES_L5[yogaIndex].ta
      } : { kn: yogaRule.sanskrit, en: yogaRule.english, hi: yogaRule.english, te: yogaRule.english, ta: yogaRule.english },
      isAuspicious: yogaRule.isAuspicious,
      deity: yogaRule.deity,
      shantiPractice: {
        kn: yogaRule.isAuspicious ? "ಶುಭ ಯೋಗ: ನಿತ್ಯ ದೇವತಾರ್ಚನೆ ಮತ್ತು ಗಾಯತ್ರೀ ಜಪದಿಂದ ಸೌಭಾಗ್ಯ ವೃದ್ಧಿ." : "ಅಶುಭ ಯೋಗ: ಶಿವ ಪಂಚಾಕ್ಷರಿ ಜಪ ಅಥವಾ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸಿ.",
        en: yogaRule.remedy || (yogaRule.isAuspicious ? "Auspicious Yoga: Daily prayer and Gayatri japa amplify success." : "Inauspicious Yoga: Chant Shiva Panchakshari or Mrityunjaya mantra."),
        hi: yogaRule.isAuspicious ? "शुभ योग: नित्य देवपूजन एवं गायत्री जप से सौभाग्य वृद्धि होती है।" : "अशुभ योग शांति: शिव पंचाक्षरी जप अथवा महामृत्युंजय मंत्र का पाठ करें।",
        te: yogaRule.isAuspicious ? "శుభ యోగం: నిత్య దేవతార్చన మరియు గాయత్రీ జపంతో సౌభాగ్య వృద్ధి." : "అశుభ యోగ శాంతి: శివ పంచాక్షరీ జపం లేదా మహామృత్యుంజయ మంత్ర పఠనం.",
        ta: yogaRule.isAuspicious ? "சுப யோகம்: தினசரி தேவ பூஜை மற்றும் காயத்ரி ஜபம் நற்பலன் தரும்." : "அசுப யோக சாந்தி: சிவ பஞ்சாட்சர ஜபம் அல்லது மகாமிருத்யுஞ்சய மந்திரம் பாராயணம் செய்யவும்."
      }
    },
    karanaRemedy: {
      karanaName: KARANA_NAMES_L5_BY_KEY[karanaKey] || { kn: karanaRule.nameKn, en: karanaRule.nameEn, hi: karanaRule.nameEn, te: karanaRule.nameEn, ta: karanaRule.nameEn },
      tatva: karanaRule.tatva,
      deity: karanaRule.rulingDeity,
      karyaShanti: {
        kn: `${formatNameForLanguage(karanaRule.rulingDeity, "kn", "ಇಂದ್ರ")} ದೇವರ ಆರಾಧನೆ, ಕರ್ಮಸಿದ್ಧಿಗೆ ಶುಭಾರಂಭದ ಮುನ್ನ ಪ್ರಾರ್ಥನೆ.`,
        en: `Worship ${formatNameForLanguage(karanaRule.rulingDeity, "en", "Indra")}; invoke prior to commencing major transactions.`,
        hi: `${formatNameForLanguage(karanaRule.rulingDeity, "hi", "इंद्र")} देव की आराधना करें।`,
        te: `${formatNameForLanguage(karanaRule.rulingDeity, "te", "ఇంద్ర")} దేవతారాధన.`,
        ta: `${formatNameForLanguage(karanaRule.rulingDeity, "ta", "இந்திரன்")} வழிபாடு.`
      }
    }
  };

  // 7. Planetary Strength Remedies: Exalted & Debilitated Planets
  const debilitationMap: Record<PlanetName, {
    sign: string;
    lord: PlanetName;
    remedy: Record<string, string>;
    caution: Record<string, string>;
    remedyKn: string;
    remedyEn: string;
    cautionKn: string;
    cautionEn: string;
  }> = {
    [PlanetName.Sun]: {
      sign: "Libra",
      lord: PlanetName.Venus,
      remedy: {
        kn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ, ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ತಂದೆಯ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು.",
        en: "Surya Gayatri japa, Sunday Aditya Hrudaya recitation, and honoring father's blessings.",
        hi: "सूर्य गायत्री जप, रविवार को आदित्य हृदय स्तोत्र पाठ एवं पिता की सेवा व आशीर्वाद।",
        te: "సూర్య గాయత్రీ జపం, ఆదిత్య హృదయ స్తోత్ర పఠనం మరియు తండ్రి ఆశీస్సులు పొందడం.",
        ta: "சூரிய காயத்ரி ஜெபம், ஆதித்ய ஹிருதய ஸ்தோத்திரம் மற்றும் தந்தையின் ஆசி பெறுதல்."
      },
      caution: {
        kn: "ತುಲಾ ಸೂರ್ಯನಿಗೆ ಮಾಣಿಕ್ಯ ಧರಿಸುವ ಮುನ್ನ ಲಗ್ನ ಶುಭತ್ವ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
        en: "Verify functional beneficence before wearing Ruby for debilitated Sun.",
        hi: "तुला राशि के नीच सूर्य में माणिक्य धारण करने से पूर्व लग्न शुद्धि अवश्य जांचें।",
        te: "తుల సూర్యుడికి మాణిక్యం ధరించే ముందు లగ్న శుభత్వాన్ని తప్పక పరిశీలించాలి.",
        ta: "துலாம் சூரியனுக்கு மாணிக்கம் அணியும் முன் லக்ன சுபத்துவத்தை உறுதிப்படுத்தவும்."
      },
      remedyKn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ, ಮಾಣಿಕ್ಯ ರತ್ನ ಧಾರಣೆ ಪರೀಕ್ಷೆ ಹಾಗೂ ತಂದೆಯ ಸೇವೆ.",
      remedyEn: "Surya Gayatri japa, Father's blessing, and Sunday Aditya Hrudaya.",
      cautionKn: "ತುಲಾ ಸೂರ್ಯನಿಗೆ ಮಾಣಿಕ್ಯ ಧರಿಸುವ ಮುನ್ನ ಲಗ್ನ ಶುಭತ್ವ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      cautionEn: "Verify functional beneficence before Ruby."
    },
    [PlanetName.Moon]: {
      sign: "Scorpio",
      lord: PlanetName.Mars,
      remedy: {
        kn: "ಚಂದ್ರಶೇಖರಾಷ್ಟಕ ಪಠಣ, ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಪ್ರಾಣಾಯಾಮ.",
        en: "Chandrashekhara Ashtakam, Monday Shiva milk abhisheka, and soothing pranayama.",
        hi: "चन्द्रशेखराष्टक पाठ, सोमवार को शिवलिंग पर दुग्धाभिषेक एवं शांतिदायक प्राणायाम।",
        te: "చంద్రశేఖరాష్టక పఠనం, సోమవారం శివునికి క్షీరాభిషేకం మరియు ధ్యానం.",
        ta: "சந்திரசேகராஷ்டகம் பாராயணம், திங்கட்கிழமை சிவனுக்கு பாலாபிஷேகம் மற்றும் தியானம்."
      },
      caution: {
        kn: "ವೃಶ್ಚಿಕ ಚಂದ್ರನಿದ್ದಾಗ ಮುತ್ತು ಧರಿಸಿದರೆ ಮಾನಸಿಕ ಆತಂಕ ಹೆಚ್ಚಾಗಬಹುದು, ಎಚ್ಚರ.",
        en: "Avoid Pearl for debilitated Moon unless cancelled by strong Kendra lord.",
        hi: "वृश्चिक चंद्र होने पर मोती धारण करने से मानसिक तनाव बढ़ सकता है, अतः बचें।",
        te: "వృశ్చిక చంద్రుడికి ముత్యం ధరిస్తే మానసిక ఒత్తిడి పెరిగే అవకాశం ఉంది, జాగ్రత్త.",
        ta: "விருச்சிக சந்திரனுக்கு முத்து அணிவது மனக்கவலையை அதிகரிக்கலாம், தவிர்க்கவும்."
      },
      remedyKn: "ಚಂದ್ರಶೇಖರಾಷ್ಟಕ ಪಠಣ, ಸೋಮವಾರ ಶಿವನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಹಾಗೂ ಧ್ಯಾನ.",
      remedyEn: "Chandrashekhara Ashtakam, Monday Shiva milk abhisheka, and pranayama.",
      cautionKn: "ವೃಶ್ಚಿಕ ಚಂದ್ರನಿದ್ದಾಗ ಮುತ್ತು ಧರಿಸಿದರೆ ಮಾನಸಿಕ ಆತಂಕ ಹೆಚ್ಚಾಗಬಹುದು.",
      cautionEn: "Avoid Pearl for debilitated Moon unless cancelled."
    },
    [PlanetName.Mars]: {
      sign: "Cancer",
      lord: PlanetName.Moon,
      remedy: {
        kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ಮಂಗಳವಾರ ತೊಗರಿಬೇಳೆ ದಾನ ಹಾಗೂ ಭೂಮಿ ವಂದನೆ.",
        en: "Subrahmanya worship, Tuesday toor dal charity, and honoring mother Earth.",
        hi: "भगवान सुब्रह्मण्य की पूजा, मंगलवार को तुअर दाल दान एवं भूमि वंदना।",
        te: "సుబ్రహ్మణ్య స్వామి పూజ, మంగళవారం కందిపప్పు దానం మరియు భూమి పూజ.",
        ta: "முருகப்பெருமான் வழிபாடு, செவ்வாய்க்கிழமை துவரம்பருப்பு தானம் மற்றும் பூமி வழிபாடு."
      },
      caution: {
        kn: "ಕಟಕ ಕುಜನಿಗೆ ಹವಳ ಧರಿಸುವುದರಿಂದ ರಕ್ತದೊತ್ತಡ ಏರುಪೇರಾಗಬಹುದು, ಎಚ್ಚರ.",
        en: "Red Coral for debilitated Mars requires careful astrological scrutiny.",
        hi: "कर्क राशि के मंगल हेतु मूंगा धारण करने से रक्तचाप प्रभावित हो सकता है, सावधानी रखें।",
        te: "కర్కాటక కుజుడికి పగడం ధరిస్తే రక్తపోటు సమస్యలు రావచ్చు, జాగ్రత్త వహించండి.",
        ta: "கடக செவ்வாய்க்கு பவளம் அணிவதால் இரத்த அழுத்தம் அதிகரிக்கலாம், எச்சரிக்கை."
      },
      remedyKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ಮಂಗಳವಾರ ತೊಗರಿಬೇಳೆ ದಾನ ಹಾಗೂ ಭೂಮಿ ವಂದನೆ.",
      remedyEn: "Subrahmanya worship, Tuesday toor dal charity, and honoring mother Earth.",
      cautionKn: "ಕಟಕ ಕುಜನಿಗೆ ಹವಳ ಧರಿಸುವುದರಿಂದ ರಕ್ತದೊತ್ತಡ ಏರುಪೇರಾಗಬಹುದು, ಎಚ್ಚರ.",
      cautionEn: "Red Coral for debilitated Mars requires careful scrutiny."
    },
    [PlanetName.Mercury]: {
      sign: "Pisces",
      lord: PlanetName.Jupiter,
      remedy: {
        kn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ.",
        en: "Vishnu Sahasranama chanting, Tulasi seva, and donating books to needy scholars.",
        hi: "विष्णु सहस्रनाम पाठ, तुलसी पूजन एवं निर्धन विद्यार्थियों को पुस्तक दान।",
        te: "విష్ణు సహస్రనామ పారాయణం, తులసి పూజ మరియు విద్యార్థులకు పుస్తక దానం.",
        ta: "விஷ்ணு சஹஸ்ரநாம பாராயணம், துளசி பூஜை மற்றும் ஏழை மாணவர்களுக்கு புத்தக தானம்."
      },
      caution: {
        kn: "ಮೀನ ಬುಧನಿಗೆ ಪಚ್ಚೆ ರತ್ನ ಧರಿಸುವ ಮುನ್ನ ನೀಚಭಂಗ ಪರೀಕ್ಷಿಸುವುದು ಅತ್ಯಗತ್ಯ.",
        en: "Verify Neecha Bhanga before wearing Emerald for debilitated Mercury.",
        hi: "मीन राशि के बुध में पन्ना धारण करने से पूर्व नीचभंग की पुष्टि अनिवार्य है।",
        te: "మీన బుధుడికి పచ్చ రత్నం ధరించే ముందు నీచభంగాన్ని తప్పక పరిశీలించాలి.",
        ta: "மீன புதனுக்கு மரகதம் அணியும் முன் நீச்சபங்கத்தை பரிசீலிப்பது அவசியம்."
      },
      remedyKn: "ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಣ, ತುಳಸಿ ಪೂಜೆ ಹಾಗೂ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ದಾನ.",
      remedyEn: "Vishnu Sahasranama chanting, Tulasi seva, and donating books to needy scholars.",
      cautionKn: "ಮೀನ ಬುಧನಿಗೆ ಪಚ್ಚೆ ರತ್ನ ಧರಿಸುವ ಮುನ್ನ ನೀಚಭಂಗ ಪರೀಕ್ಷಿಸುವುದು ಅತ್ಯಗತ್ಯ.",
      cautionEn: "Verify Neecha Bhanga before wearing Emerald for debilitated Mercury."
    },
    [PlanetName.Jupiter]: {
      sign: "Capricorn",
      lord: PlanetName.Saturn,
      remedy: {
        kn: "ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ, ಗುರುವಾರ ಕಡಲೆಬೇಳೆ ದಾನ ಹಾಗೂ ಶಿಕ್ಷಕರಿಗೆ ವಂದನೆ.",
        en: "Guru Dakshinamurthy worship, chana dal charity on Thursdays, and honoring teachers.",
        hi: "गुरु दक्षिणामूर्ति पूजन, गुरुवार को चना दाल दान एवं गुरुजनों का सम्मान।",
        te: "గురు దక్షిణామూర్తి పూజ, గురువారం శనగపప్పు దానం మరియు గురువులకు వందనం.",
        ta: "குரு தட்சிணாமூர்த்தி வழிபாடு, வியாழக்கிழமை கடலைப்பருப்பு தானம் மற்றும் குரு வணக்கம்."
      },
      caution: {
        kn: "ಮಕರ ಗುರುವಿನ ದುಸ್ಥಾನ ಸ್ಥಿತಿಯಲ್ಲಿ ಪುಷ್ಪರಾಗ ರತ್ನ ಧರಿಸುವುದು ಸೂಕ್ತವಲ್ಲ.",
        en: "Yellow Sapphire requires caution if debilitated Jupiter lacks Kendra cancellation.",
        hi: "मकर राशि के गुरु में पुखराज धारण करने में सावधानी रखें जब तक केंद्र बल न हो।",
        te: "మకర గురువునకు పుష్యరాగం ధరించడంలో జాగ్రత్త వహించాలి.",
        ta: "மகர குருவுக்கு புஷ்பராகம் அணிவதை தவிர்ப்பது நல்லது."
      },
      remedyKn: "ಗುರು ದಕ್ಷಿಣಾಮೂರ್ತಿ ಪೂಜೆ, ಗುರುವಾರ ಕಡಲೆಬೇಳೆ ದಾನ ಹಾಗೂ ಶಿಕ್ಷಕರಿಗೆ ವಂದನೆ.",
      remedyEn: "Guru Dakshinamurthy worship, chana dal charity on Thursdays, and honoring teachers.",
      cautionKn: "ಮಕರ ಗುರುವಿನ ದುಸ್ಥಾನ ಸ್ಥಿತಿಯಲ್ಲಿ ಪುಷ್ಪರಾಗ ರತ್ನ ಧರಿಸುವುದು ಸೂಕ್ತವಲ್ಲ.",
      cautionEn: "Yellow Sapphire requires caution if debilitated Jupiter lacks Kendra cancellation."
    },
    [PlanetName.Venus]: {
      sign: "Virgo",
      lord: PlanetName.Mercury,
      remedy: {
        kn: "ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ, ಬಿಳಿ ಹೂವುಗಳಿಂದ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಹಾಗೂ ಸ್ತ್ರೀಯರಿಗೆ ಗೌರವ.",
        en: "Kanakadhara Stotra recitation, white flower Lakshmi puja, and respecting women.",
        hi: "कनकधारा स्तोत्र पाठ, श्वेत पुष्पों से महालक्ष्मी पूजन एवं मातृशक्ति का आदर।",
        te: "కనకధారా స్తోత్ర పఠనం, తెల్లని పూలతో లక్ష్మీ పూజ మరియు స్త్రీలను గౌరవించడం.",
        ta: "கனகதாரா ஸ்தோத்திரம், வெள்ளை மலர்களால் லட்சுமி பூஜை மற்றும் பெண்களை மதித்தல்."
      },
      caution: {
        kn: "ಕನ್ಯಾ ಶುಕ್ರನಿದ್ದಾಗ ವಜ್ರ ಧಾರಣೆಗಿಂತ ಗೋಸೇವೆ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಉಪಾಸನೆ ಶ್ರೇಷ್ಠ.",
        en: "Prioritize Goseva and Lakshmi sadhana over Diamond when Venus is in Virgo.",
        hi: "कन्या राशि के शुक्र में हीरा धारण की तुलना में गौसेवा और लक्ष्मी उपासना श्रेष्ठ है।",
        te: "కన్య శుక్రుడికి వజ్రం ధరించడం కంటే గోసేవ మరియు లక్ష్మీ పూజ శ్రేష్టం.",
        ta: "கன்னி சுக்கிரனுக்கு வைரம் அணிவதை விட பசு சேவையும் லட்சுமி வழிபாடும் சிறந்தது."
      },
      remedyKn: "ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಣ, ಬಿಳಿ ಹೂವುಗಳಿಂದ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಹಾಗೂ ಸ್ತ್ರೀಯರಿಗೆ ಗೌರವ.",
      remedyEn: "Kanakadhara Stotra recitation, white flower Lakshmi puja, and respecting women.",
      cautionKn: "ಕನ್ಯಾ ಶುಕ್ರನಿದ್ದಾಗ ವಜ್ರ ಧಾರಣೆಗಿಂತ ಗೋಸೇವೆ ಮತ್ತು ಲಕ್ಷ್ಮೀ ಉಪಾಸನೆ ಶ್ರೇಷ್ಠ.",
      cautionEn: "Prioritize Goseva and Lakshmi sadhana over Diamond when Venus is in Virgo."
    },
    [PlanetName.Saturn]: {
      sign: "Aries",
      lord: PlanetName.Mars,
      remedy: {
        kn: "ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ, ಅಶ್ವತ್ಥ ವೃಕ್ಷಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಾಗೂ ಕಾಗೆಗಳಿಗೆ ಅನ್ನ.",
        en: "Dasharatha Shani Stotra, Peepal circumambulation, sesame oil lamp, and feeding crows.",
        hi: "दशरथ कृत शनि स्तोत्र, पीपल की परिक्रमा, तिल के तेल का दीपक एवं कौवों को अन्न।",
        te: "దశరథ శని స్తోత్రం, రావి చెట్టు ప్రదక్షిణ, నువ్వుల నూనె దీపం మరియు కాకులకు ఆహారం.",
        ta: "தசரத சனி ஸ்தோத்திரம், அரசமர பிரதக்ஷிணம், நல்லெண்ணெய் தீபம் மற்றும் காகத்திற்கு அன்னம்."
      },
      caution: {
        kn: "ಮೇಷ ಶನಿಯಿದ್ದಾಗ ನೀಲಂ (ಇಂದ್ರನೀಲ) ರತ್ನ ಧರಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧ.",
        en: "Blue Sapphire (Neelam) is prohibited for debilitated Saturn in Aries.",
        hi: "मेष राशि के नीच शनि में नीलम धारण करना वर्जित है।",
        te: "మేష శనికి నీలం రత్నం ధరించడం పూర్తిగా నిషిద్ధం.",
        ta: "மேஷ சனிக்கு நீலக்கல் (நீலம்) அணிவது முற்றிலும் தவிர்க்கப்பட வேண்டும்."
      },
      remedyKn: "ದಶರಥ ಶನಿ ಸ್ತೋತ್ರ, ಅಶ್ವತ್ಥ ವೃಕ್ಷಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಹಾಗೂ ಕಾಗೆಗಳಿಗೆ ಅನ್ನ.",
      remedyEn: "Dasharatha Shani Stotra, Peepal circumambulation, sesame oil lamp, and feeding crows.",
      cautionKn: "ಮೇಷ ಶನಿಯಿದ್ದಾಗ ನೀಲಂ (ಇಂದ್ರನೀಲ) ರತ್ನ ಧರಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿ ನಿಷೇಧ.",
      cautionEn: "Blue Sapphire (Neelam) is prohibited for debilitated Saturn in Aries."
    },
    [PlanetName.Rahu]: {
      sign: "Scorpio",
      lord: PlanetName.Mars,
      remedy: {
        kn: "ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಠಣ, ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗರಾಜ ಪೂಜೆ ಹಾಗೂ ಶ್ವಾನಗಳಿಗೆ ಆಹಾರ.",
        en: "Durga Saptashati recitation, Nagaraja puja at Gokarna, and feeding stray dogs.",
        hi: "दुर्गा सप्तशती पाठ, गोकर्ण में नागराज पूजा एवं श्वानों को भोजन।",
        te: "దుర్గా సప్తశతి పారాయణం, గోకర్ణంలో నాగరాజ పూజ మరియు శునకాలకు ఆహారం.",
        ta: "துர்கா சப்தசதி பாராயணம், கோகர்ணத்தில் நாகராஜ பூஜை மற்றும் நாய்களுக்கு உணவு."
      },
      caution: {
        kn: "ಗೋಮೇಧಿಕ ರತ್ನ ಧರಿಸಬಾರದು.",
        en: "Avoid Hessonite (Gomed) when Rahu is debilitated.",
        hi: "गोमेद रत्न धारण न करें।",
        te: "గోమేధికం ధరించరాదు.",
        ta: "கோமேதகம் அணியக்கூடாது."
      },
      remedyKn: "ದುರ್ಗಾ ಸಪ್ತಶತೀ ಪಠಣ, ಗೋಕರ್ಣದಲ್ಲಿ ನಾಗರಾಜ ಪೂಜೆ ಹಾಗೂ ಶ್ವಾನಗಳಿಗೆ ಆಹಾರ.",
      remedyEn: "Durga Saptashati recitation, Nagaraja puja at Gokarna, and feeding stray dogs.",
      cautionKn: "ಗೋಮೇಧಿಕ ರತ್ನ ಧರಿಸಬಾರದು.",
      cautionEn: "Avoid Hessonite (Gomed) when Rahu is debilitated."
    },
    [PlanetName.Ketu]: {
      sign: "Taurus",
      lord: PlanetName.Venus,
      remedy: {
        kn: "ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ ಹಾಗೂ ಬಡವರಿಗೆ ಕಂಬಳಿ ದಾನ.",
        en: "Ganesha Atharvashirsha chanting and blanket donation to the destitute.",
        hi: "गणेश अथर्वशीर्ष पाठ एवं निर्धनों को कंबल दान।",
        te: "గణేశ అధర్వశీర్ష పఠనం మరియు పేదలకు దుప్పట్లు దానం.",
        ta: "கணேச அதர்வசீரிஷம் மற்றும் ஏழைகளுக்கு போர்வை தானம்."
      },
      caution: {
        kn: "ವೈಢೂರ್ಯ ರತ್ನ ಧಾರಣೆ ಬೇಡ.",
        en: "Avoid Cat's Eye during debilitated Ketu.",
        hi: "लहसुनिया (वैडूर्य) रत्न न पहनें।",
        te: "వైడూర్యం ధరించకూడదు.",
        ta: "வைடூரியம் அணிய வேண்டாம்."
      },
      remedyKn: "ಗಣೇಶ ಅಥರ್ವಶೀರ್ಷ ಪಠಣ ಹಾಗೂ ಬಡವರಿಗೆ ಕಂಬಳಿ ದಾನ.",
      remedyEn: "Ganesha Atharvashirsha chanting and blanket donation to the destitute.",
      cautionKn: "ವೈಢೂರ್ಯ ರತ್ನ ಧಾರಣೆ ಬೇಡ.",
      cautionEn: "Avoid Cat's Eye during debilitated Ketu."
    }
  };

  const exaltationMap: Record<PlanetName, {
    sign: string;
    activation: Record<string, string>;
    blessing: Record<string, string>;
    activationKn: string;
    activationEn: string;
    blessingKn: string;
    blessingEn: string;
  }> = {
    [PlanetName.Sun]: {
      sign: "Aries",
      activation: {
        kn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ ಹಾಗೂ ಧಾರ್ಮಿಕ ನಾಯಕತ್ವ ಸಾಧನೆ.",
        en: "Surya Gayatri japa and righteous leadership.",
        hi: "सूर्य गायत्री जप एवं धार्मिक नेतृत्व का आचरण।",
        te: "సూర్య గాయత్రీ జపం మరియు నాయకత్వ సాధన.",
        ta: "சூரிய காயத்ரி ஜெபம் மற்றும் தர்ம தலைமைத்துவ நெறி."
      },
      blessing: {
        kn: "ಆರೋಗ್ಯ, ತೇಜಸ್ಸು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.",
        en: "Vibrant health, royal authority, and high social prestige.",
        hi: "आरोग्य, तेजस्विता एवं सार्वजनिक मान-सम्मान।",
        te: "ఆరోగ్యం, తేజస్సు మరియు సమాజంలో ఉన్నత గౌరవం.",
        ta: "பூரண ஆரோக்கியம், தேஜஸ் மற்றும் சமுதாய மரியாதை."
      },
      activationKn: "ಸೂರ್ಯ ಗಾಯತ್ರೀ ಜಪ ಹಾಗೂ ಧಾರ್ಮಿಕ ನಾಯಕತ್ವ ಸಾಧನೆ.",
      activationEn: "Surya Gayatri japa and righteous leadership.",
      blessingKn: "ಆರೋಗ್ಯ, ತೇಜಸ್ಸು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.",
      blessingEn: "Vibrant health, royal authority, and high social prestige."
    },
    [PlanetName.Moon]: {
      sign: "Taurus",
      activation: {
        kn: "ಚಂದ್ರ ಗಾಯತ್ರಿ, ಕಲಾಸೇವೆ ಹಾಗೂ ತಾಯಿಯ ಆರಾಧನೆ.",
        en: "Chandra Gayatri, artistic pursuits, and maternal reverence.",
        hi: "चन्द्र गायत्री, कलात्मक सेवा एवं मातृ वंदना।",
        te: "చంద్ర గాయత్రి, కళా సేవ మరియు తల్లి పూజ.",
        ta: "சந்திர காயத்ரி, கலைப்பணி மற்றும் தாய் வழிபாடு."
      },
      blessing: {
        kn: "ಅಖಂಡ ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಸೌಂದರ್ಯ ಹಾಗೂ ಸಂಪತ್ತು.",
        en: "Deep emotional peace, charisma, and uninterrupted prosperity.",
        hi: "अखंड मानसिक शांति, आकर्षण एवं निरंतर समृद्धि।",
        te: "సంపూర్ణ మనశ్శాంతి, సౌందర్యం మరియు సంపద.",
        ta: "நீடித்த மன அமைதி, வசீகரம் மற்றும் தொடர் செல்வம்."
      },
      activationKn: "ಚಂದ್ರ ಗಾಯತ್ರಿ, ಕಲಾಸೇವೆ ಹಾಗೂ ತಾಯಿಯ ಆರಾಧನೆ.",
      activationEn: "Chandra Gayatri, artistic pursuits, and maternal reverence.",
      blessingKn: "ಅಖಂಡ ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಸೌಂದರ್ಯ ಹಾಗೂ ಸಂಪತ್ತು.",
      blessingEn: "Deep emotional peace, charisma, and uninterrupted prosperity."
    },
    [PlanetName.Mars]: {
      sign: "Capricorn",
      activation: {
        kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ದೈಹಿಕ ವ್ಯಾಯಾಮ ಹಾಗೂ ಧರ್ಮರಕ್ಷಣೆ.",
        en: "Subrahmanya worship, disciplined physical stamina, and protective courage.",
        hi: "सुब्रह्मण्य पूजन, नियमित व्यायाम एवं धर्मरक्षा।",
        te: "సుబ్రహ్మణ్య పూజ, వ్యాయామం మరియు ధర్మ రక్షణ.",
        ta: "சுப்பிரமணியர் பூஜை, உடற்பயிற்சி மற்றும் தர்ம பாதுகாப்பு."
      },
      blessing: {
        kn: "ಅಪಾರ ಸಾಹಸ, ಭೂಮಿ ಲಾಭ ಹಾಗೂ ಶತ್ರು ಜಯ.",
        en: "Unshakable courage, real estate gains, and triumph over adversaries.",
        hi: "अदम्य साहस, भूमि लाभ एवं शत्रुओं पर विजय।",
        te: "అపార ధైర్యం, భూ లాభం మరియు శత్రు జయం.",
        ta: "அபார தைரியம், பூமி லாபம் மற்றும் எதிரிகள் மீது வெற்றி."
      },
      activationKn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ, ದೈಹಿಕ ವ್ಯಾಯಾಮ ಹಾಗೂ ಧರ್ಮರಕ್ಷಣೆ.",
      activationEn: "Subrahmanya worship, disciplined physical stamina, and protective courage.",
      blessingKn: "ಅಪಾರ ಸಾಹಸ, ಭೂಮಿ ಲಾಭ ಹಾಗೂ ಶತ್ರು ಜಯ.",
      blessingEn: "Unshakable courage, real estate gains, and triumph over adversaries."
    },
    [PlanetName.Mercury]: {
      sign: "Virgo",
      activation: {
        kn: "ಬುಧ ಬೀಜ ಮಂತ್ರ, ಗ್ರಂಥ ರಚನೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿವೇಕ.",
        en: "Budha Beeja Mantra, analytical research, and ethical commerce.",
        hi: "बुध बीज मंत्र, शोध कार्य एवं व्यापारिक विवेक।",
        te: "బుధ బీజ మంత్రం, పరిశోధన మరియు వ్యాపార వివేకం.",
        ta: "புதன் பீஜ மந்திரம், ஆராய்ச்சி மற்றும் வணிக விவேகம்."
      },
      blessing: {
        kn: "ಚುರುಕಾದ ಬುದ್ಧಿ, ಅದ್ಭುತ ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯವಹಾರ ಯಶಸ್ಸು.",
        en: "Genius intellect, eloquent speech, and commercial triumph.",
        hi: "कुशाग्र बुद्धि, वाक्पटुता एवं व्यापारिक सफलता।",
        te: "తీక్షణమైన బుద్ధి, వాక్చాతుర్యం మరియు వ్యాపార విజయం.",
        ta: "கூர்மையான அறிவு, வாக்குவன்மை மற்றும் வியாபார வெற்றி."
      },
      activationKn: "ಬುಧ ಬೀಜ ಮಂತ್ರ, ಗ್ರಂಥ ರಚನೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿವೇಕ.",
      activationEn: "Budha Beeja Mantra, analytical research, and ethical commerce.",
      blessingKn: "ಚುರುಕಾದ ಬುದ್ಧಿ, ಅದ್ಭುತ ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ವ್ಯವಹಾರ ಯಶಸ್ಸು.",
      blessingEn: "Genius intellect, eloquent speech, and commercial triumph."
    },
    [PlanetName.Jupiter]: {
      sign: "Cancer",
      activation: {
        kn: "ಬೃಹಸ್ಪತಿ ಜಪ, ವೇದಾಧ್ಯಯನ ಹಾಗೂ ಸತ್ಪಾತ್ರ ದಾನ.",
        en: "Brihaspati japa, spiritual scriptural study, and satvic charity.",
        hi: "बृहस्पति जप, स्वाध्याय एवं सुपात्र दान।",
        te: "బృహస్పతి జపం, వేదాధ్యయనం మరియు సత్పాత్ర దానం.",
        ta: "பிருஹஸ்பதி ஜெபம், வேத பாராயணம் மற்றும் தகுதியான தானம்."
      },
      blessing: {
        kn: "ದೈವಾನುಗ್ರಹ, ಸಂತಾನ ಸುಖ, ಜ್ಞಾನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಕೀರ್ತಿ.",
        en: "Divine grace, noble progeny, profound wisdom, and guru status.",
        hi: "ईश्वरीय कृपा, उत्तम संतान, ब्रह्मज्ञान एवं धार्मिक ख्याति।",
        te: "దైవానుగ్రహం, సంతాన సౌఖ్యం, జ్ఞానం మరియు కీర్తి.",
        ta: "தெய்வீக அருள், நன்மக்கள் பேறு, பேரறிவு மற்றும் ஆன்மீகப் புகழ்."
      },
      activationKn: "ಬೃಹಸ್ಪತಿ ಜಪ, ವೇದಾಧ್ಯಯನ ಹಾಗೂ ಸತ್ಪಾತ್ರ ದಾನ.",
      activationEn: "Brihaspati japa, spiritual scriptural study, and satvic charity.",
      blessingKn: "ದೈವಾನುಗ್ರಹ, ಸಂತಾನ ಸುಖ, ಜ್ಞಾನ ಹಾಗೂ ಧಾರ್ಮಿಕ ಕೀರ್ತಿ.",
      blessingEn: "Divine grace, noble progeny, profound wisdom, and guru status."
    },
    [PlanetName.Venus]: {
      sign: "Pisces",
      activation: {
        kn: "ಶುಕ್ರ ಗಾಯತ್ರಿ, ಸಂಗೀತ-ಕಲೆ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಭಕ್ತಿ.",
        en: "Shukra Gayatri, classical music/arts, and Lakshmi devotion.",
        hi: "शुक्र गायत्री, संगीत-कला एवं महालक्ष्मी भक्ति।",
        te: "శుక్ర గాయత్రి, సంగీత కళలు మరియు లక్ష్మీ భక్తి.",
        ta: "சுக்கிர காயத்ரி, சங்கீதம்-கலை மற்றும் லட்சுமி பக்தி."
      },
      blessing: {
        kn: "ದಾಂಪತ್ಯ ಸುಖ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ವೈಭವೋಪೇತ ಜೀವನ.",
        en: "Marital bliss, luxury conveyance, and boundless artistic refinement.",
        hi: "दांपत्य सुख, वाहन वैभव एवं कलात्मक जीवन शैली।",
        te: "దాంపత్య సుఖం, వాహన సౌభాగ్యం మరియు వైభవ జీవనం.",
        ta: "இல்வாழ்க்கை இன்பம், வாகன யோகம் மற்றும் வளமான வாழ்வு."
      },
      activationKn: "ಶುಕ್ರ ಗಾಯತ್ರಿ, ಸಂಗೀತ-ಕಲೆ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಭಕ್ತಿ.",
      activationEn: "Shukra Gayatri, classical music/arts, and Lakshmi devotion.",
      blessingKn: "ದಾಂಪತ್ಯ ಸುಖ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ವೈಭವೋಪೇತ ಜೀವನ.",
      blessingEn: "Marital bliss, luxury conveyance, and boundless artistic refinement."
    },
    [PlanetName.Saturn]: {
      sign: "Libra",
      activation: {
        kn: "ಶನಿ ಶಾಂತಿ, ಅಶ್ವತ್ಥ ಪ್ರದಕ್ಷಿಣೆ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ಸೇವೆ.",
        en: "Shani Shanti, Peepal circumambulation, and selfless public service.",
        hi: "शनि शांति, पीपल परिक्रमा एवं निःस्वार्थ लोकसेवा।",
        te: "శని శాంతి, రావి చెట్టు ప్రదక్షిణ మరియు నిస్వార్థ సేవ.",
        ta: "சனி சாந்தி, அரசமர பிரதக்ஷிணம் மற்றும் பொது சேவை."
      },
      blessing: {
        kn: "ದೀರ್ಘಾಯುಷ್ಯ, ನ್ಯಾಯಪರತೆ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಜನಬಲ.",
        en: "Longevity, unswerving justice, enduring assets, and mass leadership.",
        hi: "दीर्घायु, न्यायप्रियता, स्थायी संपत्ति एवं जनसमर्थन।",
        te: "దీర్ఘాయువు, న్యాయం, స్థిరాస్తి మరియు ప్రజాబలం.",
        ta: "நீண்ட ஆயுள், நீதி நெறி, நிலையான சொத்து மற்றும் மக்கள் ஆதரவு."
      },
      activationKn: "ಶನಿ ಶಾಂತಿ, ಅಶ್ವತ್ಥ ಪ್ರದಕ್ಷಿಣೆ ಹಾಗೂ ನಿಸ್ವಾರ್ಥ ಸೇವೆ.",
      activationEn: "Shani Shanti, Peepal circumambulation, and selfless public service.",
      blessingKn: "ದೀರ್ಘಾಯುಷ್ಯ, ನ್ಯಾಯಪರತೆ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಜನಬಲ.",
      blessingEn: "ದೀರ್ಘಾಯುಷ್ಯ, ನ್ಯಾಯಪರತೆ, ಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಜನಬಲ."
    },
    [PlanetName.Rahu]: {
      sign: "Taurus",
      activation: {
        kn: "ದುರ್ಗಾ ಪೂಜೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ.",
        en: "Durga puja and Navagraha Shanti.",
        hi: "भगवती दुर्गा पूजन एवं नवग्रह शांति।",
        te: "దుర్గా పూజ మరియు నవగ్రహ శాంతి.",
        ta: "துர்க்கை பூஜை மற்றும் நவக்கிரக சாந்தி."
      },
      blessing: {
        kn: "ಅನಿರೀಕ್ಷಿತ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆ ಹಾಗೂ ವಿದೇಶ ಯಾನ.",
        en: "Sudden breakthroughs, foreign expansion, and research acumen.",
        hi: "आकस्मिक धन लाभ, विदेश यात्रा एवं अनुसंधान में सफलता।",
        te: "ఆకస్మిక ధన లాభం మరియు విదేశీ ప్రయాణాలు.",
        ta: "திடீர் பண வரவு, வெளிநாட்டு பயணம் மற்றும் புதிய வாய்ப்புகள்."
      },
      activationKn: "ದುರ್ಗಾ ಪೂಜೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ.",
      activationEn: "Durga puja and Navagraha Shanti.",
      blessingKn: "ಅನಿರೀಕ್ಷಿತ ಆರ್ಥಿಕ ಬೆಳವಣಿಗೆ ಹಾಗೂ ವಿದೇಶ ಯಾನ.",
      blessingEn: "Sudden breakthroughs, foreign expansion, and research acumen."
    },
    [PlanetName.Ketu]: {
      sign: "Scorpio",
      activation: {
        kn: "ಗಣಪತಿ ಹೋಮ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಧ್ಯಾನ.",
        en: "Ganapati Homa and deep meditative contemplation.",
        hi: "गणपति होम एवं गहन आध्यात्मिक साधना।",
        te: "గణపతి హోమం మరియు ఆధ్యాత్మిక ధ్యానం.",
        ta: "கணபதி ஹோமம் மற்றும் ஆழ்ந்த தியானம்."
      },
      blessing: {
        kn: "ಆಧ್ಯಾತ್ಮಿಕ ಮೋಕ್ಷ, ಅಂತರ್ದೃಷ್ಟಿ ಹಾಗೂ ಋಷಿ ಜ್ಞಾನ.",
        en: "Moksha orientation, heightened intuition, and occult discernment.",
        hi: "मोक्ष मार्ग, सूक्ष्म अंतर्दृष्टि एवं तत्वज्ञान।",
        te: "మోక్ష మార్గం, అంతర్దృష్టి మరియు దివ్య జ్ఞానం.",
        ta: "மோட்ச சாதனை, உள்ளுணர்வு மற்றும் மெய்ஞானம்."
      },
      activationKn: "ಗಣಪತಿ ಹೋಮ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಧ್ಯಾನ.",
      activationEn: "Ganapati Homa and deep meditative contemplation.",
      blessingKn: "ಆಧ್ಯಾತ್ಮಿಕ ಮೋಕ್ಷ, ಅಂತರ್ದೃಷ್ಟಿ ಹಾಗೂ ಋಷಿ ಜ್ಞಾನ.",
      blessingEn: "Moksha orientation, heightened intuition, and occult discernment."
    }
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
          hi: `राश्याधिपति केंद्र में होने से नीचभंग राजयोग का निर्माण हो रहा है। संघर्ष के बाद स्थायित्व मिलेगा।`,
          te: `రాశ్యాధిపతి కేంద్రంలో ఉండటం వలన నీచభంగ రాజయోగం ఏర్పడుతోంది. ప్రారంభ ఇబ్బందుల తర్వాత విజయం లభిస్తుంది.`,
          ta: `ராசியாதிபதி கேந்திரத்தில் இருப்பதால் நீச்சபங்க ராஜயோகம் உண்டாகிறது. ஆரம்பப் போராட்டத்திற்குப் பின் வெற்றி கிட்டும்.`
        } : undefined,
        shantiRemedy: debInfo.remedy,
        gemstoneCaution: debInfo.caution
      });
    }

    const exInfo = exaltationMap[p.name];
    if (exInfo && rashiEng === exInfo.sign) {
      exaltedPlanets.push({
        graha: p.name,
        grahaName: GRAHA_NAMES_LOCALE[p.name],
        exaltationSign: RASHI_NAMES_LOCALE[exInfo.sign] || { kn: exInfo.sign, en: exInfo.sign },
        activationRemedy: exInfo.activation,
        blessingArea: exInfo.blessing
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
  } else if (struggleCategory === "relationship_friction") {
    const s = CLASSICAL_STOTRAS_CATALOG.find(st => st.id === "uma_maheshwara");
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

  const sandhiData = currentDiag.dashaSandhiAndRoadmap;
  const activeAlert = sandhiData?.activeSandhiAlert;
  const upcomingAlert = sandhiData?.upcomingSandhiAlert;

  let isSandhiActive = false;
  let sandhiAlertObj: KundliRemedyDiagnosis["dashaBhuktiAnalysis"]["sandhiAlert"];

  if (activeAlert) {
    isSandhiActive = true;
    sandhiAlertObj = {
      code: activeAlert.sandhiCode,
      status: "active",
      title: {
        kn: activeAlert.titleKn,
        en: activeAlert.titleEn,
        hi: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.hi || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.hi || bhuktiPlanet} संधिकाल`,
        te: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.te || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.te || bhuktiPlanet} సంధి కాలం`,
        ta: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.ta || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.ta || bhuktiPlanet} சந்தி காலம்`
      },
      durationFormatted: {
        kn: activeAlert.durationFormattedKn,
        en: activeAlert.durationFormattedEn,
        hi: "सक्रिय दशा संधिकाल",
        te: "సక్రియ దశా సంధి కాలం",
        ta: "செயலில் உள்ள திசை சந்தி"
      },
      description: {
        kn: activeAlert.descriptionKn,
        en: activeAlert.descriptionEn,
        hi: activeAlert.descriptionEn,
        te: activeAlert.descriptionEn,
        ta: activeAlert.descriptionEn
      },
      remedy: {
        kn: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ${activeAlert.gokarnaSevaKn || "ವಿಶೇಷ ಸಂಧಿ ಶಾಂತಿ ಸೇವೆ"}`,
        en: `Sri Kshetra Gokarna ${activeAlert.gokarnaSevaEn || "Special Sandhi Shanti Seva"}`,
        hi: "श्री गोकर्ण क्षेत्र में विशेष दशा संधि शांति सेवा एवं नवग्रह शांति पूजा",
        te: "శ్రీ గోకర్ణ క్షేత్రంలో విశేష దశా సంధి శాంతి పూజ మరియు నవగ్రహ శాంతి",
        ta: "ஸ்ரீ கோகர்ணத்தில் விசேஷ திசை சந்தி சாந்தி பூஜை மற்றும் நவக்கிரக சாந்தி"
      }
    };
  } else if (upcomingAlert) {
    isSandhiActive = false;
    sandhiAlertObj = {
      code: upcomingAlert.sandhiCode,
      status: "upcoming",
      title: {
        kn: upcomingAlert.titleKn,
        en: upcomingAlert.titleEn,
        hi: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.hi || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.hi || bhuktiPlanet} आगामी संधिकाल`,
        te: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.te || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.te || bhuktiPlanet} రాబోవు సంధి`,
        ta: `${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.ta || mahaDashaPlanet} - ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.ta || bhuktiPlanet} வரவிருக்கும் சந்தி`
      },
      durationFormatted: {
        kn: upcomingAlert.durationFormattedKn,
        en: upcomingAlert.durationFormattedEn,
        hi: "आगामी दशा संधिकाल",
        te: "రాబోవు దశా సంధి కాలం",
        ta: "வரவிருக்கும் திசை சந்தி"
      },
      description: {
        kn: upcomingAlert.descriptionKn,
        en: upcomingAlert.descriptionEn,
        hi: upcomingAlert.descriptionEn,
        te: upcomingAlert.descriptionEn,
        ta: upcomingAlert.descriptionEn
      },
      remedy: {
        kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ${upcomingAlert.gokarnaSevaKn || "ಸಂಧಿ ಪೂರ್ವ ಶಾಂತಿ ಸಂಕಲ್ಪ"}`,
        en: `Sri Gokarna Sannidhana ${upcomingAlert.gokarnaSevaEn || "Pre-Sandhi Shanti Sankalpa"}`,
        hi: "श्री गोकर्ण सन्निधि में दशा संधि पूर्व शांति संकल्प एवं नवग्रह अभिषेक",
        te: "శ్రీ గోకర్ణ సన్నిధిలో దశా సంధి పూర్వ శాంతి సంకల్పం మరియు నవగ్రహ అభిషేకం",
        ta: "ஸ்ரீ கோகர்ண சந்நிதியில் திசை சந்தி முன் சாந்தி சங்கல்பம் மற்றும் அபிஷேகம்"
      }
    };
  } else {
    isSandhiActive = false;
    sandhiAlertObj = {
      code: "stable",
      status: "stable",
      title: {
        kn: "ಸ್ಥಿರ ದಶಾ ಕಾಲಾವಧಿ (ಸಂಧಿದೋಷ ಮುಕ್ತ)",
        en: "Stable Dasha Period (No Adverse Sandhi)",
        hi: "स्थिर दशा काल (संधि दोष मुक्त)",
        te: "స్థిర దశా కాలం (సంధి రహిత)",
        ta: "நிலையான திசை காலம் (சந்தி தோஷமற்றது)"
      },
      durationFormatted: {
        kn: "ಪ್ರಸ್ತುತ ಸ್ಥಿರ ಪ್ರಗತಿ",
        en: "Currently Stable Progress",
        hi: "वर्तमान में स्थिर प्रगति",
        te: "ప్రస్తుతం స్థిర ప్రగతి",
        ta: "தற்போது சீரான முன்னேற்றம்"
      },
      description: {
        kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಯಾವುದೇ ತೀವ್ರ ದಶಾ-ಸಂಧಿ ಬಾಧೆ ಇಲ್ಲ. ಗ್ರಹಗಳ ಶಕ್ತಿಯು ಸ್ಥಿರವಾಗಿದ್ದು, ದೈನಂದಿನ ನಿಯಮಿತ ಸಾಧನೆಯಿಂದ ನಿರಂತರ ಶುಭಫಲಗಳು ಸಿದ್ಧಿಸಲಿವೆ.",
        en: "No volatile Dasha Sandhi is currently active in your chart. Planetary energies are stable; consistent daily sadhana yields steady progress.",
        hi: "वर्तमान में आपकी कुंडली में कोई प्रतिकूल दशा-संधि नहीं है। ग्रह ऊर्जा स्थिर है और नित्य साधना से निरंतर शुभ फल प्राप्त होंगे।",
        te: "ప్రస్తుతం ఎలాంటి ప్రతికూల దశా-సంధి ప్రభావం లేదు. గ్రహ బలం స్థిరంగా ఉంది; నిత్య పూజలతో నిరంతర అభివృద్ధి లభిస్తుంది.",
        ta: "தற்போது எவ்வித பாதகமான திசை-சந்தி தோஷமும் இல்லை. கிரக நிலை சீராக இருப்பதால் தினசரி வழிபாட்டால் சுப பலன்கள் கிடைக்கும்."
      },
      remedy: {
        kn: "ದೈನಂದಿನ ಸ್ತೋತ್ರ ಪಠಣ ಹಾಗೂ ಶುಭ ಕರ್ಮಗಳ ಆಚರಣೆ.",
        en: "Daily Vedic stotra recitation and righteous conduct.",
        hi: "नित्य स्तोत्र पाठ एवं धर्मपरायण आचरण।",
        te: "నిత్య స్తోత్ర పఠనం మరియు సదాచారం.",
        ta: "தினசரி ஸ்தோத்திர பாராயணம் மற்றும் நல்லொழுக்கம்."
      }
    };
  }

  const mahaDevata = GRAHA_DEVATA_PAIRS[mahaDashaPlanet] || GRAHA_DEVATA_PAIRS[PlanetName.Jupiter];
  const bhuktiDevata = GRAHA_DEVATA_PAIRS[bhuktiPlanet] || GRAHA_DEVATA_PAIRS[PlanetName.Jupiter];

  const adhidevataObj = {
    adhidevata: mahaDevata.adhidevata,
    pratyadhidevata: mahaDevata.pratyadhidevata,
    sadhana: {
      kn: `ದಶಾನಾಥ ${mahaDevata.adhidevata.kn} ಹಾಗೂ ಭುಕ್ತಿನಾಥ ${bhuktiDevata.pratyadhidevata.kn} ಆರಾಧನೆಯಿಂದ ಈ ದಶಾಕಾಲವು ಪರಮ ಶುಭಕರವಾಗಲಿದೆ.`,
      en: `Propitiating Dasha Lord's Adhidevata (${mahaDevata.adhidevata.en}) and Bhukti Lord's Pratyadhidevata (${bhuktiDevata.pratyadhidevata.en}) unlocks harmonious karmic flow.`,
      hi: `दशेश अधिदेवता (${mahaDevata.adhidevata.hi}) एवं भुक्ति प्रत्याधिदेवता (${bhuktiDevata.pratyadhidevata.hi}) की आराधना से यह दशा अत्यंत शुभ फलदायी होगी।`,
      te: `దశా అధిదేవత మరియు భుక్తి ప్రత్యధిదేవత పూజలతో ఈ కాలం శుభప్రదమవుతుంది.`,
      ta: `திசா அதிதேவதை மற்றும் புக்தி பிரத்யதிதேவதை வழிபாட்டால் நற்பலன்கள் கிட்டும்.`
    },
    mahaDashaAdhidevata: mahaDevata.adhidevata,
    mahaDashaPratyadhidevata: mahaDevata.pratyadhidevata,
    bhuktiAdhidevata: bhuktiDevata.adhidevata,
    bhuktiPratyadhidevata: bhuktiDevata.pratyadhidevata,
    sadhanaAction: {
      kn: `ದಶಾನಾಥ ${mahaDevata.adhidevata.kn} ಹಾಗೂ ಭುಕ್ತಿನಾಥ ${bhuktiDevata.pratyadhidevata.kn} ಆರಾಧನೆಯಿಂದ ಈ ದಶಾಕಾಲವು ಪರಮ ಶುಭಕರವಾಗಲಿದೆ.`,
      en: `Propitiating Dasha Lord's Adhidevata (${mahaDevata.adhidevata.en}) and Bhukti Lord's Pratyadhidevata (${bhuktiDevata.pratyadhidevata.en}) unlocks harmonious karmic flow.`,
      hi: `दशेश अधिदेवता (${mahaDevata.adhidevata.hi}) एवं भुक्ति प्रत्याधिदेवता (${bhuktiDevata.pratyadhidevata.hi}) की आराधना से यह दशा अत्यंत शुभ फलदायी होगी।`,
      te: `దశా అధిదేవత మరియు భుక్తి ప్రత్యధిదేవత పూజలతో ఈ కాలం శుభప్రదమవుతుంది.`,
      ta: `திசா அதிதேவதை மற்றும் புக்தி பிரத்யதிதேவதை வழிபாட்டால் நற்பலன்கள் கிட்டும்.`
    }
  };

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
      kn: `ಈ ದಶಾ ಸಂಚಾರವನ್ನು ಶುಭಕರವಾಗಿಸಲು ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.kn || mahaDashaPlanet} ಹಾಗೂ ${GRAHA_NAMES_LOCALE[bhuktiPlanet]?.kn || bhuktiPlanet} ದೇವತೆಗಳಿಗೆ ವಿಶೇಷ ಪ್ರಾರ್ಥನೆ ಮತ್ತು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ${lifeTurnaroundTiming.specificSevaKn} ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಫಲದಾಯಕ.`,
      en: `To align this Dasha-Bhukti flow, offer dedicated prayers to ${GRAHA_NAMES_LOCALE[mahaDashaPlanet]?.en || mahaDashaPlanet} and participate in ${lifeTurnaroundTiming.specificSevaEn}.`,
      hi: `इस दशा-भुक्ति के शुभ फल हेतु संबंधित ग्रहों की शांति एवं गोकर्ण महाबलेश्वर में पूजा कराएं।`,
      te: `ఈ దశ అనుకూలత కొరకు గోకర్ణంలో పూజ జరిపించండి.`,
      ta: `இந்த திசை நன்மை பெற கோகர்ணத்தில் வழிபாடு செய்யவும்.`
    },
    isSandhiActive,
    sandhiAlert: sandhiAlertObj,
    adhidevata: adhidevataObj
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
  let sadeSatiDetailedPhase: KundliRemedyDiagnosis["gocharaTransitAnalysis"]["sadeSatiDetailedPhase"];

  if (saturnDiff === 11) {
    sadeSatiText = {
      kn: "⚠️ ಶನಿ ಸಾಡೇಸಾತಿ ಪ್ರಥಮ ಚರಣ (ಆರೋಹಣ ಹಂತ - ವ್ಯಯ ಶನಿ) ಸಕ್ರಿಯವಾಗಿದೆ - ತಾಳ್ಮೆ, ಶಾಂತಿ ಮತ್ತು ಹನುಮಾನ್ ಜಪ ಅತ್ಯಗತ್ಯ.",
      en: "⚠️ Active Sade Sati 1st Phase (Rising Phase - 12th from Moon) - Demands calm speech, discipline, and Hanuman devotion.",
      hi: "⚠️ साढ़ेसाती प्रथम चरण (उदय काल - द्वादश शनि) सक्रिय है - धैर्य और हनुमान उपासना आवश्यक है।",
      te: "⚠️ ఏలినాటి శని మొదటి దశ (ప్రారంభ దశ) - ఓపిక మరియు హనుమాన్ పూజ అవసరం.",
      ta: "⚠️ ஏழரை நாட்டு சனி முதல் சுற்று (விரய சனி) நடப்பில் உள்ளது - பொறுமையும் வழிபாடும் அவசியம்."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "rising",
      phaseTitle: {
        kn: "ಶನಿ ಸಾಡೇಸಾತಿ ಪ್ರಥಮ ಚರಣ (ಆರೋಹಣ ಹಂತ - ವ್ಯಯ ಶನಿ)",
        en: "Sade Sati 1st Phase (Rising Phase - 12th from Moon)",
        hi: "साढ़ेसाती प्रथम चरण (उदय काल - द्वादश शनि)",
        te: "ఏలినాటి శని మొదటి దశ (ప్రారంభ దశ)",
        ta: "ஏழரை சனி முதல் சுற்று (விரய சனி)"
      },
      phaseDescription: {
        kn: "ಶನಿಯು ಜನ್ಮ ರಾಶಿಯ ಹಿಂದಿನ ಮನೆಯಲ್ಲಿದ್ದು (೧೨ನೇ ಭಾವ), ನಿದ್ರಾಭಂಗ, ಅನಿರೀಕ್ಷಿತ ಖರ್ಚುಗಳು ಹಾಗೂ ಪ್ರಯಾಣದ ಶ್ರಮವನ್ನು ತರಬಹುದು. ತಾಳ್ಮೆ ಮತ್ತು ಹನುಮಾನ್ ಚಾಲೀಸಾ ಅತ್ಯಗತ್ಯ.",
        en: "Saturn transits the 12th house from natal Moon, testing financial budgeting, sleep hygiene, and travel stamina. Requires calm persistence.",
        hi: "शनि चंद्र से द्वादश भाव में हैं, जिससे व्यय और अनिद्रा की स्थिति बन सकती है।",
        te: "శని చంద్రుని నుండి 12వ ఇంట్లో ఉండి అనవసర ఖర్చులు తెస్తాడు.",
        ta: "சனி சந்திரன் முன் வீட்டில் இருந்து வீண் செலவுகளை தரலாம்."
      },
      shantiRecommendation: {
        kn: "ಶನಿವಾರ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ, ಸುಂದರಕಾಂಡ ಪಠಣ ಹಾಗೂ ಗೋಕರ್ಣ ಶನಿ ಶಾಂತಿ.",
        en: "Light sesame oil lamp on Saturdays, recite Sundarakanda, and Gokarna Shani Shanti.",
        hi: "शनिवार को पीपल पर तिल के तेल का दीपक एवं सुंदरकांड पाठ।",
        te: "శనివారం నువ్వుల నూనె దీపం మరియు సుందరకాండ పారాయణ.",
        ta: "சனிக்கிழமை நல்லெண்ணெய் தீபம் மற்றும் சுந்தரகாண்ட பாராயணம்."
      }
    };
  } else if (saturnDiff === 0) {
    sadeSatiText = {
      kn: "⚠️ ಶನಿ ಸಾಡೇಸಾತಿ ದ್ವಿತೀಯ ಚರಣ (ಶಿಖರ ಹಂತ - ಜನ್ಮ ಶನಿ) ಸಕ್ರಿಯವಾಗಿದೆ - ಪರಮ ಶ್ರದ್ಧೆ, ಅಹಂಕಾರ ತ್ಯಾಗ ಹಾಗೂ ತೈಲಾಭಿಷೇಕ ರಕ್ಷಣೆ.",
      en: "⚠️ Active Sade Sati 2nd Phase (Peak Phase - Janma Shani) - Purifying ego, demanding supreme discipline and Tailabhisheka armor.",
      hi: "⚠️ साढ़ेसाती द्वितीय चरण (मध्य/शिखर काल - जन्म शनि) सक्रिय है - आत्म-अनुशासन एवं तैलाभिषेक आवश्यक है।",
      te: "⚠️ ఏలినాటి శని రెండవ దశ (జన్మ శని) - క్రమశిక్షణ మరియు తైలాభిషేకం అవసరం.",
      ta: "⚠️ ஏழரை சனி இரண்டாம் சுற்று (ஜன்ம சனி) - சுய கட்டுப்பாடு மற்றும் நல்லெண்ணெய் அபிஷேகம் அவசியம்."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "peak",
      phaseTitle: {
        kn: "ಶನಿ ಸಾಡೇಸಾತಿ ದ್ವಿತೀಯ ಚರಣ (ಶಿಖರ ಹಂತ - ಜನ್ಮ ಶನಿ)",
        en: "Sade Sati 2nd Phase (Peak Phase - Janma Shani)",
        hi: "साढ़ेसाती द्वितीय चरण (मध्य/शिखर काल - जन्म शनि)",
        te: "ఏలినాటి శని రెండవ దశ (జన్మ శని)",
        ta: "ஏழரை சனி இரண்டாம் சுற்று (ஜன்ம சனி)"
      },
      phaseDescription: {
        kn: "ಶನಿಯು ಜನ್ಮ ರಾಶಿಯ ಮೇಲೆಯೇ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಮಾನಸಿಕ ಧೃತಿ, ಅಹಂಕಾರ ತ್ಯಾಗ ಹಾಗೂ ಕಠಿಣ ಪರಿಶ್ರಮವನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಾನೆ. ತೈಲಾಭಿಷೇಕ ಪರಮ ರಕ್ಷಣೆ.",
        en: "Saturn is directly conjoined your natal Moon sign (Janma Shani), purifying ego and demanding supreme self-discipline. Tailabhisheka provides supreme armor.",
        hi: "शनि सीधे चंद्र राशि पर गोचर कर रहे हैं; यह धैर्य और आत्म-अनुशासन की परीक्षा का समय है।",
        te: "శని చంద్రునిపైనే సంచరిస్తూ కఠిన క్రమశిక్షణను కోరతాడు.",
        ta: "சனி ராசியிலேயே சஞ்சரித்து மனோபலத்தை சோதிப்பார்."
      },
      shantiRecommendation: {
        kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಶನಿ-ಶಿವಾಭಿಷೇಕ & ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ.",
        en: "Gokarna Shani-Shiva Tailabhisheka & Mahamrityunjaya Japa.",
        hi: "गोकर्ण में शनि-शिवाभिषेक एवं महामृत्युंजय जप।",
        te: "గోకర్ణంలో శని-శివాభిషేకం మరియు మహామృత్యుంజయ జపం.",
        ta: "கோகர்ணத்தில் சனி-சிவாபிஷேகம் மற்றும் மகா மிருத்யுஞ்சய ஜெபம்."
      }
    };
  } else if (saturnDiff === 1) {
    sadeSatiText = {
      kn: "⚠️ ಶನಿ ಸಾಡೇಸಾತಿ ತೃತೀಯ ಚರಣ (ಅವರೋಹಣ ಹಂತ - ಧನ ಶನಿ) ಸಕ್ರಿಯವಾಗಿದೆ - ಮೃದು ಮಾತು, ಆರ್ಥಿಕ ಶಿಸ್ತು ಹಾಗೂ ಧರ್ಮ ಪಾಲನೆ.",
      en: "⚠️ Active Sade Sati 3rd Phase (Setting Phase - 2nd from Moon) - Prudent financial budgeting and gentle speech facilitate turnaround.",
      hi: "⚠️ साढ़ेसाती तृतीय चरण (उतरती साढ़ेसाती - धन शनि) सक्रिय है - वाणी में मधुरता एवं आर्थिक अनुशासन आवश्यक है।",
      te: "⚠️ ఏలినాటి శని మూడవ దశ (ముగింపు దశ) - ఆర్థిక క్రమశిక్షణ అవసరం.",
      ta: "⚠️ ஏழரை சனி மூன்றாம் சுற்று (பாத சனி) - பேச்சில் நிதானமும் பொருளாதார விவேகமும் தேவை."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "setting",
      phaseTitle: {
        kn: "ಶನಿ ಸಾಡೇಸಾತಿ ತೃತೀಯ ಚರಣ (ಅವರೋಹಣ ಹಂತ - ಧನ ಶನಿ)",
        en: "Sade Sati 3rd Phase (Setting Phase - 2nd from Moon)",
        hi: "साढ़ेसाती तृतीय चरण (उतरती साढ़ेसाती - धन शनि)",
        te: "ఏలినాటి శని మూడవ దశ (ముగింపు దశ)",
        ta: "ஏழரை சனி மூன்றாம் சுற்று (பாத சனி)"
      },
      phaseDescription: {
        kn: "ಶನಿಯು ೨ನೇ ಮನೆಯಲ್ಲಿದ್ದು ಸಾಡೇಸಾತಿಯ ಕೊನೆಯ ಹಂತದಲ್ಲಿದ್ದಾನೆ. ಕೌಟುಂಬಿಕ ಮಾತುಕತೆಯಲ್ಲಿ ಮೃದುತ್ವ ಮತ್ತು ಆರ್ಥಿಕ ಶಿಸ್ತು ಕಾಪಾಡಿಕೊಂಡರೆ ಭಾಗ್ಯೋದಯ ಸುಲಭ.",
        en: "Saturn is in the 2nd house from Moon, concluding Sade Sati. Gentle speech and prudent budgeting facilitate a smooth turnaround.",
        hi: "शनि चंद्र से द्वितीय भाव में होकर साढ़ेसाती के समापन काल में हैं। वाणी में मधुरता रखें।",
        te: "శని చంద్రుని నుండి 2వ స్థానంలో ఉండి ముగింపు దశలో ఉన్నాడు.",
        ta: "சனி 2ம் இடத்தில் இருந்து ஏழரை சனியை நிறைவு செய்கிறார்."
      },
      shantiRecommendation: {
        kn: "ಕಪ್ಪು ಎಳ್ಳು ದಾನ, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಹಾಗೂ ಧರ್ಮ ಕರ್ಮಗಳ ಆಚರಣೆ.",
        en: "Black sesame donation, Hanuman Chalisa, and righteous financial conduct.",
        hi: "काले तिल का दान एवं हनुमान चालीसा का नित्य पाठ।",
        te: "నల్ల నువ్వుల దానం మరియు హనుమాన్ చాలీసా పఠనం.",
        ta: "கருப்பு எள் தானம் மற்றும் அனுமன் சாலிசா பாராயணம்."
      }
    };
  } else if (isAshtamaShani) {
    sadeSatiText = {
      kn: "⚠️ ಅಷ್ಟಮ ಶನಿ ಪ್ರಭಾವ ಸಕ್ರಿಯವಾಗಿದೆ - ವಾಹನ ಚಾಲನೆ, ವಾದ-ವಿವಾದ ಹಾಗೂ ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆ ವಹಿಸಿ.",
      en: "⚠️ Active Ashtama Shani (8th House Saturn Transit) - Caution in road travel, temperament, and finances.",
      hi: "⚠️ अष्टम शनि प्रभाव सक्रिय है - वाद-विवाद एवं यात्रा में सावधानी बरतें।",
      te: "⚠️ అష్టమ శని ప్రభావం - జాగ్రత్త అవసరం.",
      ta: "⚠️ அஷ்டம சனி தாக்கம் - எச்சரிக்கை தேவை."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "ashtama",
      phaseTitle: {
        kn: "ಅಷ್ಟಮ ಶನಿ ಗೋಚಾರ (೮ನೇ ಭಾವದ ಕಠಿಣ ಸಂಚಾರ)",
        en: "Ashtama Shani (8th House Saturn Transit)",
        hi: "अष्टम शनि गोचर (८वें भाव का प्रभाव)",
        te: "అష్టమ శని గోచారం (8వ స్థానం)",
        ta: "அஷ்டம சனி கோசாரம் (8ம் இடம்)"
      },
      phaseDescription: {
        kn: "ಜನ್ಮ ರಾಶಿಯಿಂದ ೮ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಸಂಚಾರವು ಅನಿರೀಕ್ಷಿತ ಸವಾಲುಗಳನ್ನು ತರಬಹುದು. ವಾಹನ ಚಾಲನೆ ಹಾಗೂ ಆತುರದ ತೀರ್ಮಾನಗಳಿಂದ ದೂರವಿರಿ.",
        en: "Saturn in 8th from Moon brings sudden tests. Avoid rash driving, speculative risks, and abrupt career exits.",
        hi: "चंद्र से आठवें भाव में शनि गोचर से अचानक चुनौतियां आ सकती हैं; सतर्कता आवश्यक है।",
        te: "8వ స్థానంలో శని సంచారం వలన జాగ్రత్తగా ఉండాలి.",
        ta: "8ம் இடத்து சனி திடீர் சவால்களை தரலாம்; எச்சரிக்கை தேவை."
      },
      shantiRecommendation: {
        kn: "ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ, ಕಾಲಭೈರವ ಆರಾಧನೆ ಹಾಗೂ ಗೋಕರ್ಣ ತೈಲಾಭಿಷೇಕ.",
        en: "Mahamrityunjaya Japa, Kala Bhairava Aradhana, and Gokarna Tailabhisheka.",
        hi: "महामृत्युंजय जप, कालभैरव साधना एवं गोकर्ण में तैलाभिषेक।",
        te: "మహామృత్యుంజయ జపం మరియు కాలభైరవ పూజ.",
        ta: "மகா மிருத்யுஞ்சய ஜெபம் மற்றும் காலபைரவர் வழிபாடு."
      }
    };
  } else if (isKantakaShani) {
    sadeSatiText = {
      kn: "ℹ️ ಕಂಟಕ ಶನಿ ಪ್ರಭಾವ - ಉದ್ಯೋಗ ಮತ್ತು ಕೌಟುಂಬಿಕ ವಿಷಯಗಳಲ್ಲಿ ತಾಳ್ಮೆ ಇರಲಿ.",
      en: "ℹ️ Active Kantaka Shani Transit - Practice professional patience and avoid hasty career shifts.",
      hi: "ℹ️ कंटक शनि प्रभाव - कार्यक्षेत्र में धैर्य बनाए रखें।",
      te: "ℹ️ కంటక శని ప్రభావం - ఉద్యోగంలో ఓపిక అవసరం.",
      ta: "ℹ️ கண்டக சனி தாக்கம் - பொறுமை தேவை."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "kantaka",
      phaseTitle: {
        kn: "ಕಂಟಕ ಶನಿ ಗೋಚಾರ",
        en: "Kantaka Shani Transit",
        hi: "कंटक शनि गोचर",
        te: "కంటక శని గోచారం",
        ta: "கண்டக சனி கோசாரம்"
      },
      phaseDescription: {
        kn: "ಉದ್ಯೋಗ ಹಾಗೂ ವ್ಯಾಪಾರದಲ್ಲಿ ತಾಳ್ಮೆಯಿಂದ ಇರಬೇಕು; ಹಿರಿಯರೊಂದಿಗೆ ವಾದ ಬೇಡ.",
        en: "Exercise discipline in career matters and avoid unnecessary confrontations with superiors.",
        hi: "कार्यक्षेत्र में धैर्य रखें एवं वरिष्ठों से वाद-विवाद से बचें।",
        te: "ఉద్యోగంలో ఓపిక పాటించండి.",
        ta: "பணியிடத்தில் பொறுமையுடன் செயல்படவும்."
      },
      shantiRecommendation: {
        kn: "ಶನಿ ಶಾಂತಿ ಜಪ & ಅಶ್ವತ್ಥ ಪ್ರದಕ್ಷಿಣೆ.",
        en: "Shani Shanti Japa & Peepal circumambulation.",
        hi: "शनि शांति जप एवं पीपल की परिक्रमा।",
        te: "శని శాంతి జపం.",
        ta: "சனி சாந்தி ஜெபம்."
      }
    };
  } else {
    sadeSatiText = {
      kn: "✅ ಪ್ರಸ್ತುತ ಗೋಚಾರದಲ್ಲಿ ಶನಿಯ ಯಾವುದೇ ಪ್ರಮುಖ ಅಶುಭ ಪ್ರಭಾವವಿಲ್ಲ (ಅನುಕೂಲಕರ ಸ್ಥಿತಿ).",
      en: "✅ No major difficult Saturn Sade Sati transit active at present (Favorable Saturn flow).",
      hi: "✅ वर्तमान में शनि का कोई अशुभ गोचर नहीं है।",
      te: "✅ శని అనుకూలంగా ఉన్నాడు.",
      ta: "✅ சனி பகவானின் பாதகமான தாக்கம் தற்போது இல்லை."
    };
    sadeSatiDetailedPhase = {
      phaseCode: "favorable",
      phaseTitle: {
        kn: "ಅನುಕೂಲಕರ ಶನಿ ಗೋಚಾರ (ಸಾಡೇಸಾತಿ ಮುಕ್ತ)",
        en: "Favorable Saturn Transit (Free of Sade Sati)",
        hi: "शुभ शनि गोचर (साढ़ेसाती मुक्त)",
        te: "అనుకూల శని గోచారం",
        ta: "சாதகமான சனி கோசாரம்"
      },
      phaseDescription: {
        kn: "ಪ್ರಸ್ತುತ ಶನಿಯು ನಿಮ್ಮ ರಾಶಿಗೆ ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಸ್ಥಿರ ಶ್ರಮಕ್ಕೆ ಶುಭಫಲಗಳನ್ನು ನೀಡಲಿದ್ದಾನೆ.",
        en: "Saturn is transiting a favorable angle from your natal Moon, rewarding persistent disciplined efforts.",
        hi: "शनि का गोचर आपके लिए शुभ है; सतत परिश्रम से सफलता मिलेगी।",
        te: "శని అనుకూలంగా ఉన్నాడు; నిరంతర శ్రమతో విజయం లభిస్తుంది.",
        ta: "சனி சாதகமாக உள்ளதால் முயற்சிக்கு தகுந்த வெற்றி கிட்டும்."
      },
      shantiRecommendation: {
        kn: "ದೈನಂದಿನ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ.",
        en: "Daily Hanuman Chalisa recitation.",
        hi: "नित्य हनुमान चालीसा पाठ।",
        te: "నిత్య హనుమాన్ చాలీసా పఠనం.",
        ta: "தினசரி அனுமன் சாலிசா பாராயணம்."
      }
    };
  }

  const rahuDiff = (transitRahuRashi.index - moonRashiIndex + 12) % 12;
  const jupiterHouseFromMoon = ((transitJupiterRashi.index - moonRashiIndex + 12) % 12) + 1;
  const isGuruBalaAuspicious = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

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
        houseFromMoon: jupiterHouseFromMoon,
        effect: isGuruBalaAuspicious ? ("Benefic" as const) : ("Caution" as const),
        title: {
          kn: isGuruBalaAuspicious
            ? `ಗೋಚಾರ ಗುರು ಬಲ (${RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.kn || transitJupiterRashi.english} ರಾಶಿ - ${jupiterHouseFromMoon}ನೇ ಮನೆ)`
            : `ಗೋಚಾರ ಗುರು ಶಾಂತಿ ಅಗತ್ಯ (${RASHI_NAMES_LOCALE[transitJupiterRashi.english]?.kn || transitJupiterRashi.english} ರಾಶಿ - ${jupiterHouseFromMoon}ನೇ ಮನೆ)`,
          en: isGuruBalaAuspicious
            ? `Auspicious Guru Bala in ${transitJupiterRashi.english} (${jupiterHouseFromMoon}th from Moon)`
            : `Guru Shanti Needed in ${transitJupiterRashi.english} (${jupiterHouseFromMoon}th from Moon)`,
          hi: isGuruBalaAuspicious
            ? `गोचर गुरु बल (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}वां भाव)`
            : `गोचर गुरु शांति आवश्यक (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}वां भाव)`,
          te: isGuruBalaAuspicious
            ? `గోచార గురు బలం (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}వ స్థానం)`
            : `గోచార గురు శాంతి అవసరం (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}వ స్థానం)`,
          ta: isGuruBalaAuspicious
            ? `கோசார குரு பலம் (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}ம் இடம்)`
            : `கோசார குரு சாந்தி தேவை (${transitJupiterRashi.english} - ${jupiterHouseFromMoon}ம் இடம்)`
        },
        description: {
          kn: isGuruBalaAuspicious
            ? `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ನಿಮ್ಮ ಜನ್ಮ ರಾಶಿಯಿಂದ ${jupiterHouseFromMoon}ನೇ ಶುಭ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಅದ್ಭುತ ಗುರು ಬಲ, ಭಾಗ್ಯೋದಯ ಮತ್ತು ದೈವಿಕ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತಿದ್ದಾನೆ.`
            : `ಗುರುವು ಜನ್ಮ ರಾಶಿಯಿಂದ ${jupiterHouseFromMoon}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಗುರು ಬಲದ ಕೊರತೆಯಿದೆ. ಶುಭ ಕಾರ್ಯಗಳು ಹಾಗೂ ಆರ್ಥಿಕ ವಿಷಯಗಳಲ್ಲಿ ಗುರು ಶಾಂತಿ ಪೂಜೆ ಅತ್ಯಗತ್ಯ.`,
          en: isGuruBalaAuspicious
            ? `Benefic transit of Brihaspati in ${jupiterHouseFromMoon}th house illuminates wisdom, dissolves mental turmoil, and provides spiritual shielding.`
            : `Jupiter transits ${jupiterHouseFromMoon}th house from natal Moon, requiring dedicated Brihaspati propitiation to unlock blocked momentum.`,
          hi: isGuruBalaAuspicious
            ? `देवगुरु बृहस्पति का शुभ गोचर आपके विवेक और आध्यात्मिक ऊर्जा को बढ़ा रहा है।`
            : `गुरु ${jupiterHouseFromMoon}वें भाव में होकर शांति की अपेक्षा रखते हैं; गुरु अर्चना फलदायी होगी।`,
          te: isGuruBalaAuspicious
            ? `గురు భగవానుడు జ్ఞానాన్ని మరియు రక్షణను ఇస్తున్నాడు.`
            : `గురుడు ${jupiterHouseFromMoon}వ స్థానంలో ఉన్నందున గురు శాంతి పూజ అవసరం.`,
          ta: isGuruBalaAuspicious
            ? `குரு பகவான் நற்பலன்களையும் பாதுகாப்பையும் தருகிறார்.`
            : `குரு ${jupiterHouseFromMoon}ம் இடத்தில் இருப்பதால் குரு சாந்தி வழிபாடு தேவை.`
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
    sadeSatiStatus: sadeSatiText,
    sadeSatiDetailedPhase
  };

  // 12. Sacred Gokarna Mahabaleshwara Temple Remedies & Dāna
  const prescriptions = generateAstrologicalPrescriptions(kundli, yogaRule, karanaRule);

  let prescribedSevaName = {
    kn: lifeTurnaroundTiming.specificSevaKn,
    en: lifeTurnaroundTiming.specificSevaEn,
    hi: lifeTurnaroundTiming.specificSeva?.hi || lifeTurnaroundTiming.specificSevaEn,
    te: lifeTurnaroundTiming.specificSeva?.te || lifeTurnaroundTiming.specificSevaEn,
    ta: lifeTurnaroundTiming.specificSeva?.ta || lifeTurnaroundTiming.specificSevaEn
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
      te: "గోకర్ణ మేధా దక్షిణామూర్తి విద్యా పూజ",
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
      te: "గోకర్ణ స్వయంవర పార్వతి & కళ్యాణోత్సవ సేవ",
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
  } else if (struggleCategory === "relationship_friction") {
    prescribedSevaName = {
      kn: "ಗೋಕರ್ಣ ಉಮಾ-ಮಹೇಶ್ವರ ದಾಂಪತ್ಯ ಶಾಂತಿ ಪೂಜೆ & ಕ್ಷೀರಾಭಿಷೇಕ",
      en: "Gokarna Uma-Maheshwara Marital Harmony Pooja & Ksheerabhisheka",
      hi: "गोकर्ण उमा-महेश्वर दांपत्य शांति पूजा एवं क्षीराभिषेक",
      te: "గోకర్ణ ఉమా-మహేశ్వర దాంపత్య శాంతి పూజ & క్షీరాభిషేకం",
      ta: "கோகர்ண உமா-மஹேஸ்வர தாம்பத்ய சாந்தி பூஜை"
    };
    sevaSignificance = {
      kn: "ದಾಂಪತ್ಯದಲ್ಲಿ ಅನ್ಯೋನ್ಯತೆ, ಮನಸ್ತಾಪ ನಿವಾರಣೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ಆದಿದಂಪತಿಗಳಾದ ಶಿವ-ಪಾರ್ವತಿಯರ ವಿಶೇಷ ಆರಾಧನೆ.",
      en: "Special worship of Shiva-Parvati to dissolve misunderstandings, restore mutual trust, and bless deep marital harmony.",
      hi: "दांपत्य जीवन में मधुरता, आपसी समझ एवं पारिवारिक शांति हेतु उमा-महेश्वर की विशेष पूजा।",
      te: "భార్యాభర్తల మధ్య అనురాగం మరియు కుటుంబ శాంతి కొరకు ఉమా-మహేశ్వర పూజ.",
      ta: "தம்பதியரிடையே ஒற்றுமை மற்றும் குடும்ப அமைதி உண்டாக உமா-மஹேஸ்வர பூஜை."
    };
    sevaIdealDay = { kn: "ಸೋಮವಾರ ಅಥವಾ ಶುಕ್ರವಾರ (ಪ್ರದೋಷ ಕಾಲ)", en: "Monday or Friday (Pradosha twilight)", hi: "सोमवार अथवा शुक्रवार (प्रदोष काल)", te: "సోమవారం లేదా శుక్రవారం", ta: "திங்கள் அல்லது வெள்ளிக்கிழமை" };
    donationItem = { kn: "ಹಾಲಿನ ಪಾಯಸ, ಸಕ್ಕರೆ, ಬಿಳಿ ಹೂವುಗಳು ಅಥವಾ ಸುಮಂಗಲಿಯರಿಗೆ ವಸ್ತ್ರ ದಾನ", en: "Sweet milk kheer, sugar, white fragrant flowers, or clothes to a married couple", hi: "खीर, सफेद पुष्प अथवा दंपति को वस्त्र दान", te: "పాయసం, తెల్లని పూలు లేదా వస్త్ర దానం", ta: "பால் பாயாசம், வெள்ளை பூக்கள் அல்லது வஸ்திர தானம்" };
    donationDay = { kn: "ಶುಕ್ರವಾರ ಅಥವಾ ಸೋಮವಾರ", en: "Friday or Monday", hi: "शुक्रवार अथवा सोमवार", te: "శుక్రవారం లేదా సోమవారం", ta: "வெள்ளி அல்லது திங்கட்கிழமை" };
    donationBeneficiary = { kn: "ಆದರ್ಶ ವೃದ್ಧ ದಂಪತಿಗಳಿಗೆ ಅಥವಾ ಸುಮಂಗಲಿಯರಿಗೆ", en: "Venerable elderly married couple or Sumangali", hi: "आदर्श वृद्ध दंपति अथवा सुहागिन स्त्री को", te: "వృద్ధ దంపతులకు లేదా సుమంగళికి", ta: "முதிய தம்பதியருக்கு அல்லது சுமங்கலிக்கு" };
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
      te: "గోకర్ణ మహామృత్యుంజయ హోమం",
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

  // Synchronize Rudraksha recommendations with Premium PDF V1 (Lagna-Lord Mukhi + Nakshatra Mukhi)
  const hasNakRudraksha = Boolean(
    prescriptions.rudraksha.nakshatraMukhi &&
    prescriptions.rudraksha.nakshatraMukhi !== prescriptions.rudraksha.mukhi
  );
  const rudrakshaMukhiKn = hasNakRudraksha
    ? `${prescriptions.rudraksha.nameKn} (ಲಗ್ನ) + ${prescriptions.rudraksha.nakshatraRudrakshaKn} (ನಕ್ಷತ್ರ)`
    : prescriptions.rudraksha.nameKn;
  const rudrakshaMukhiEn = hasNakRudraksha
    ? `${prescriptions.rudraksha.mukhi}-Mukhi (${prescriptions.rudraksha.nameEn}) [Lagna] + ${prescriptions.rudraksha.nakshatraMukhi}-Mukhi [Nakshatra]`
    : `${prescriptions.rudraksha.mukhi}-Mukhi (${prescriptions.rudraksha.nameEn})`;
  const rudrakshaMukhiHi = hasNakRudraksha
    ? `${prescriptions.rudraksha.nameHi || (prescriptions.rudraksha.mukhi + " मुखी रुद्राक्ष")} (लग्न) + ${prescriptions.rudraksha.nakshatraRudrakshaHi || (prescriptions.rudraksha.nakshatraMukhi + " मुखी रुद्राक्ष")} (नक्षत्र)`
    : (prescriptions.rudraksha.nameHi || `${prescriptions.rudraksha.mukhi}-मुखी रुद्राक्ष`);
  const rudrakshaMukhiTe = hasNakRudraksha
    ? `${prescriptions.rudraksha.nameTe || (prescriptions.rudraksha.mukhi + " ముఖి రుద్రాక్ష")} (లగ్నం) + ${prescriptions.rudraksha.nakshatraRudrakshaTe || (prescriptions.rudraksha.nakshatraMukhi + " ముఖి రుద్రాక్ష")} (నక్షత్రం)`
    : (prescriptions.rudraksha.nameTe || `${prescriptions.rudraksha.mukhi}-ముఖి రుద్రాక్ష`);
  const rudrakshaMukhiTa = hasNakRudraksha
    ? `${prescriptions.rudraksha.nameTa || (prescriptions.rudraksha.mukhi + " முக ருத்ராட்சம்")} (லக்னம்) + ${prescriptions.rudraksha.nakshatraRudrakshaTa || (prescriptions.rudraksha.nakshatraMukhi + " முக ருத்ராட்சம்")} (நட்சத்திரம்)`
    : (prescriptions.rudraksha.nameTa || `${prescriptions.rudraksha.mukhi}-முக ருத்ராட்சம்`);

  const rudrakshaDeityMap: Record<PlanetName, { kn: string; en: string; hi: string; te: string; ta: string }> = {
    [PlanetName.Sun]: { kn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ / ಶಿವ (ಸೂರ್ಯ ತತ್ತ್ವ)", en: "Lord Shiva (Surya Tatva)", hi: "भगवान शिव / सूर्य नारायण (सूर्य तत्व)", te: "భగవాన్ శివుడు / సూర్య నారాయణ (సూర్య తత్వము)", ta: "சிவபெருமான் / சூரிய நாராயணன் (சூரிய தத்துவம்)" },
    [PlanetName.Moon]: { kn: "ಶ್ರೀ ಅರ್ಧನಾರೀಶ್ವರ (ಚಂದ್ರ ತತ್ತ್ವ)", en: "Ardhanarishvara (Chandra Tatva)", hi: "भगवान अर्धनारीश्वर (चंद्र तत्व)", te: "భగవాన్ అర్ధనారీశ్వరుడు (చంద్ర తత్వము)", ta: "அர்த்தநாரீஸ்வரர் (சந்திர தத்துவம்)" },
    [PlanetName.Mars]: { kn: "ಅಗ್ನಿ ದೇವ / ಸುಬ್ರಹ್ಮಣ್ಯ (ಮಂಗಳ ತತ್ತ್ವ)", en: "Lord Agni / Kartikeya (Mangala Tatva)", hi: "अग्नि देव / कार्तिकेय (मंगल तत्व)", te: "అగ్ని దేవుడు / సుబ్రహ్మణ్య (మంగళ తత్వము)", ta: "அக்னி தேவன் / சுப்ரமண்யர் (செவ்வாய் தத்துவம்)" },
    [PlanetName.Mercury]: { kn: "ಬ್ರಹ್ಮ ದೇವ / ಮಹಾಗಣಪತಿ (ಬುಧ ತತ್ತ್ವ)", en: "Lord Brahma / Ganapati (Budha Tatva)", hi: "ब्रह्मा देव / गणपति (बुध तत्व)", te: "బ్రహ్మ దేవుడు / మహాగణపతి (బుధ తత్వము)", ta: "பிரம்ம தேவன் / மகா கணபதி (புதன் தத்துவம்)" },
    [PlanetName.Jupiter]: { kn: "ಶ್ರೀ ಕಾಲಾಗ್ನಿ ರುದ್ರ (ಗುರು ತತ್ತ್ವ)", en: "Lord Kalagni Rudra (Guru Tatva)", hi: "भगवान कालाग्नि रुद्र (गुरु तत्व)", te: "భగవాన్ కాలాగ్ని రుద్రుడు (గురు తత్వము)", ta: "காலாக்னி ருத்ரர் (குரு தத்துவம்)" },
    [PlanetName.Venus]: { kn: "ಶ್ರೀ ಷಣ್ಮುಖ ಕಾರ್ತಿಕೇಯ (ಶುಕ್ರ ತತ್ತ್ವ)", en: "Lord Kartikeya (Shukra Tatva)", hi: "भगवान कार्तिकेय (शुक्र तत्व)", te: "భగవాన్ కార్తికేయుడు (శుక్ర తత్వము)", ta: "கார்த்திகேயப் பெருமான் (சுக்கிர தத்துவம்)" },
    [PlanetName.Saturn]: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ (ಶನಿ ತತ್ತ್ವ)", en: "Goddess Mahalakshmi (Shani Tatva)", hi: "भगवती महालक्ष्मी (शनि तत्व)", te: "శ్రీ మహాలక్ష్మి (శని తత్వము)", ta: "மகாலட்சுமி தாயார் (சனி தத்துவம்)" },
    [PlanetName.Rahu]: { kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ (ರಾಹು ತತ್ತ್ವ)", en: "Lord Ganesha (Rahu Tatva)", hi: "भगवान श्री गणेश (राहु तत्व)", te: "శ్రీ మహాగణపతి (రాహు తత్వము)", ta: "மகா கணபதி (ராகு தத்துவம்)" },
    [PlanetName.Ketu]: { kn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ (ಕೇತು ತತ್ತ್ವ)", en: "Goddess Durga (Ketu Tatva)", hi: "भगवती दुर्गा (केतु तत्व)", te: "శ్రీ దుర్గా పరమేశ్వరి (కేతు తత్వము)", ta: "துர்க்கா பரமேஸ்வரி (கேது தத்துவம்)" }
  };
  const resolvedRudrakshaDeity = rudrakshaDeityMap[prescriptions.rudraksha.planet as PlanetName] || {
    kn: prescriptions.rudraksha.deity,
    en: prescriptions.rudraksha.deity,
    hi: prescriptions.rudraksha.deity,
    te: prescriptions.rudraksha.deity,
    ta: prescriptions.rudraksha.deity
  };

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
        kn: rudrakshaMukhiKn,
        en: rudrakshaMukhiEn,
        hi: rudrakshaMukhiHi,
        te: rudrakshaMukhiTe,
        ta: rudrakshaMukhiTa
      },
      deity: {
        kn: resolvedRudrakshaDeity.kn,
        en: resolvedRudrakshaDeity.en,
        hi: resolvedRudrakshaDeity.hi,
        te: resolvedRudrakshaDeity.te,
        ta: resolvedRudrakshaDeity.ta
      },
      benefits: {
        kn: prescriptions.rudraksha.astrologicalReason || "ಗ್ರಹದೋಷ ನಿವಾರಣೆ, ಮನಃಶಾಂತಿ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆ ಒದಗಿಸುತ್ತದೆ.",
        en: "Harmonizes planetary vibrations, enhances vitality, and dissolves astrological afflictions.",
        hi: "ग्रहदोष शांति, मानसिक एकाग्रता एवं दैवीय सुरक्षा प्रदान करता है।",
        te: "గ్రహదోష నివారణ, మానసిక ఏకాగ్రత మరియు దైవిక రక్షణ కలిగిస్తుంది.",
        ta: "கிரக தோஷ நிவர்த்தி, மன அமைதி மற்றும் தெய்வீக பாதுகாப்பு தரும்."
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
        hi: prescriptions.gemstoneRing.metalHi || prescriptions.gemstoneRing.metalEn,
        te: prescriptions.gemstoneRing.metalTe || prescriptions.gemstoneRing.metalEn,
        ta: prescriptions.gemstoneRing.metalTa || prescriptions.gemstoneRing.metalEn
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

  // 13. Chief Priest Blessing (Strictly Veda Moorthy Chaitanya Pandit)
  const chiefPriestBlessing = {
    priestName: {
      kn: "ವೇದಮೂರ್ತಿ ಚೈತನ್ಯ ಪಂಡಿತ್",
      en: "Veda Moorthy Chaitanya Pandit",
      hi: "वेदमूर्ति चैतन्य पंडित",
      te: "వేదమూర్తి చైతన్య పండిట్",
      ta: "வேதமூர்த்தி சைதன்ய பண்டிதர்"
    },
    priestTitle: {
      kn: "ಪ್ರಧಾನ ಅರ್ಚಕರು & ಧರ್ಮಕರ್ತರು, ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ",
      en: "Chief Priest & Dharmadhikari, Sri Gokarna Kshetra",
      hi: "प्रधान अर्चक एवं धर्मकर्ता, श्री गोकर्ण क्षेत्र",
      te: "ప్రధాన అర్చకులు, శ్రీ గోకర్ణ క్షేత్రం",
      ta: "தலைமை அர்ச்சகர், ஸ்ரீ கோகர்ண க்ஷேத்திரம்"
    },
    phone: "+91 94821 09844",
    sanskritAshirvada: "॥ ॐ स्वस्ति प्रजाभ्यः परिपालयन्तां न्यायेन मार्गेण महीं महीशाः । शुभं भवतु कल्याणं च वर्धताम् ॥",
    ashirvadaMeaning: {
      kn: `${input.gothra ? formatNameForLanguage(input.gothra, "kn", "") + " ಗೋತ್ರದ " : ""}${input.name ? formatNameForLanguage(input.name, "kn", "ಭಕ್ತ") + " ರವರಿಗೆ " : ""}ಭಗವಾನ್ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಪರಮ ಕೃಪೆಯಿಂದ ತಮ್ಮ ಸಮಸ್ತ ಗ್ರಹ ದೋಷಗಳು, ಮನಸ್ಸಿನ ಕ್ರೋಧ-ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗಿ, ಆಯುರಾರೋಗ್ಯ, ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಅಖಂಡ ಯಶಸ್ಸು ಲಭಿಸಲಿ ಎಂದು ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಿಂದ ಆಶೀರ್ವದಿಸುತ್ತೇವೆ.`,
      en: `For devotee ${formatNameForLanguage(input.name, "en", "devotee")}${input.gothra ? " of " + formatNameForLanguage(input.gothra, "en", "") + " Gotra" : ""}, by the supreme grace of Lord Mahabaleshwara at Gokarna, may all planetary afflictions and life obstacles be dissolved, bestowing you with health, peace, longevity, and auspicious prosperity.`,
      hi: `श्री ${formatNameForLanguage(input.name, "hi", "भक्त")}${input.gothra ? " (" + formatNameForLanguage(input.gothra, "hi", "") + " गोत्र)" : ""} पर भगवान श्री महाबलेश्वर की असीम अनुकंपा से समस्त ग्रह दोष और जीवन के संताप दूर हों तथा सुख-शांति एवं ऐश्वर्य की वृद्धि हो।`,
      te: `${input.gothra ? formatNameForLanguage(input.gothra, "te", "") + " గోత్రోద్భవులైన " : ""}${input.name ? formatNameForLanguage(input.name, "te", "భక్తులు") + " గారికి " : ""}శ్రీ మహాబలేశ్వరుని దివ్య కృపతో సర్వ దోషాలు తొలగి ఆయురారోగ్యాలు, మనశ్శాంతి కలగాలని ఆశీర్వదిస్తున్నాము.`,
      ta: `${input.gothra ? formatNameForLanguage(input.gothra, "ta", "") + " கோத்திர " : ""}${input.name ? formatNameForLanguage(input.name, "ta", "பக்தர்") + " அவர்களுக்கு " : ""}ஸ்ரீ மகாபலேஸ்வரரின் திருவருளால் சகல தோஷங்களும் நீங்கி ஆரோக்கியமும் மன அமைதியும் உண்டாக ஆசீர்வதிக்கிறோம்.`
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
    maritalStatus: input.maritalStatus,
    lagnaName: RASHI_NAMES_LOCALE[lagnaRashiName] || { kn: lagnaRashiName, en: lagnaRashiName },
    rashiName: RASHI_NAMES_LOCALE[moonRashiName] || { kn: moonRashiName, en: moonRashiName },
    nakshatraName: nakshatraData.name,
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
    chiefPriestBlessing,
    mandalaVrataSadhana: computeMandalaVrataSadhana(
      struggleCategory,
      catalyst.graha,
      moon?.nakshatra?.index ?? 0,
      input.name || "Devotee",
      input.gothra
    ),
    badhakaAnalysis: badhakaInfo,
    vedicDoctorPrescription: computeVedicDoctorPrescription(
      struggleCategory,
      catalyst.graha,
      lagnaRashiIndex,
      input.name || "Devotee",
      input.gothra,
      badhakaInfo
    )
  };
}
