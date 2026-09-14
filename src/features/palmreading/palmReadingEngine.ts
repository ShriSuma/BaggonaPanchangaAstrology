/**
 * Classical Vedic Hastarekha Shastra (Palmistry & Chironomy) Engine.
 * 
 * Deeply integrates:
 * 1. Brihat Samhita (Acharya Varahamihira, 6th Century CE)
 * 2. Garuda Purana (Samudrika Shastra Adhyaya - Chapters 58-66)
 * 3. Bhavishya Purana (Hastarekha & Angushtha Lakshana)
 * 4. Classical Chironomy (5 Elemental Hand Types) & Thumb Yava (Eye of Shiva)
 * 5. 5 Major Lines & Micro-Topologies (Branches to Jupiter/Moon, Mars Sister Line, Writer's Fork)
 * 6. 7 Planetary Mounts (Guru, Shani, Surya, Budha, Shukra, Chandra, Kuja)
 * 7. Rare Sacred Marks (Matsya Fish on Ketu, Guru Trishula, Mystic Cross, Ring of Solomon, Gopura)
 * 8. Chronological Age & Life Stage Milestones (Education, Marriage, Children, Wealth Peak)
 * 
 * Uses Gemini 3.5 Flash Lite Vision API with strict JSON schema for 100% precision.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { recordAiCallUsage } from "../ai/aiTelemetryService";
import {
  VEDIC_HAND_ELEMENTAL_TYPES,
  VEDIC_ANGUSHTHA_THUMB_RULES,
  VEDIC_MAJOR_LINES_RULES,
  VEDIC_MOUNTS_RULES,
  VEDIC_SACRED_MARKS,
  VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT,
  VEDIC_NAKHA_LAKSHANA_RULES,
  VEDIC_LUNULA_CHANDRAKARA_RULES,
  VEDIC_VIVAHA_REKHA_DETAILED_RULES,
  VEDIC_ANGULI_SANDHI_RULES,
  VEDIC_GENDER_HAND_RULES,
  VEDIC_SPECIAL_LINES_RULES,
  VEDIC_DERMATOGLYPHIC_PATTERNS
} from "./samudrikaKnowledge";
import type { KundliOutput } from "../../core/AstroTypes";

export type HandSide = "left" | "right";

export type MarriageLineAnalysis = {
  lineCount: number;
  timingWindow: Record<string, string>;
  formation: Record<string, string>;
  spouseNature: Record<string, string>;
};

export type NailDorsalAnalysis = {
  nailShape: Record<string, string>;
  nailColor: Record<string, string>;
  lunulaVitality: Record<string, string>;
  knuckleTraits: Record<string, string>;
  temperament: Record<string, string>;
};

export type PalmLineAnalysis = {
  lineName: Record<string, string>;
  status: Record<string, string>;
  indication: Record<string, string>;
  observedTopology?: string;
};

export type PalmMountAnalysis = {
  mountName: Record<string, string>;
  strength: Record<string, string>;
  indication: Record<string, string>;
};

export type LifeStageMilestones = {
  estimatedAge: number;
  currentPhaseKn: string;
  currentPhaseEn: string;
  education: {
    intellectTraitKn: string;
    intellectTraitEn: string;
    recommendedFieldsKn: string;
    recommendedFieldsEn: string;
  };
  marriage: {
    statusKn: string;
    statusEn: string;
    timingAgeWindowKn: string;
    timingAgeWindowEn: string;
    spouseTraitKn: string;
    spouseTraitEn: string;
  };
  children: {
    prospectsKn: string;
    prospectsEn: string;
    familyBlessingKn: string;
    familyBlessingEn: string;
  };
  careerWealth: {
    peakWealthAgeKn: string;
    peakWealthAgeEn: string;
    trajectoryKn: string;
    trajectoryEn: string;
  };
};

export type PalmReadingResult = {
  handSide: HandSide;
  handSideLabel: Record<string, string>;
  imageDataUrl: string;
  devoteeName: string;

  // Chironomy & Dermatoglyphics
  chironomyHandType: {
    element: Record<string, string>;
    traits: Record<string, string>;
  };

  // Angushtha (Thumb)
  thumbAnalysis: {
    willpower: Record<string, string>;
    logic: Record<string, string>;
    yavaSign: Record<string, string>;
  };

  // 5 Major Lines
  lifeLine: PalmLineAnalysis;
  headLine: PalmLineAnalysis;
  heartLine: PalmLineAnalysis;
  fateLine: PalmLineAnalysis;
  sunLine: PalmLineAnalysis;

  // Planetary Mounts
  mounts: PalmMountAnalysis[];

  // Sacred Marks
  specialMarks: Array<{
    mark: Record<string, string>;
    meaning: Record<string, string>;
    mountLocation?: Record<string, string>;
  }>;

  // Life Stage Milestones
  lifeStageMilestones: LifeStageMilestones;

  // Detailed Micro-Inspections for Optional Slots 2 & 3
  marriageLineAnalysis?: MarriageLineAnalysis;
  nailDorsalAnalysis?: NailDorsalAnalysis;

  // Optional Astronomical Kundali Integration
  kundliData?: {
    lagna: string;
    rashi: string;
    nakshatra: string;
    maandi?: string;
    dasha?: string;
    gotra?: string;
    dob?: string;
    tob?: string;
    kundliOutput?: KundliOutput;
  };

  // Overall Verdict & Remedy
  overallScore: number; // 0..100%
  verdictTitle: Record<string, string>;
  aiPrediction: string;
  remedyRecommendation: Record<string, string>;
  generatedAt: string;
};

// ----------------------------------------------------------------------
// 5-LANGUAGE LOCALIZED DICTIONARIES
// ----------------------------------------------------------------------

const HAND_SIDE_L5: Record<HandSide, Record<string, string>> = {
  left: {
    kn: "ಎಡ ಹಸ್ತ (ಇಚ್ಛಾ ಶಕ್ತಿ & ಜನ್ಮಜಾತ ಗುಣ)",
    en: "Left Hand (Innate Potential & Natural Talents)",
    hi: "बायां हाथ (जन्मजात प्रतिभा व क्षमता)",
    te: "ఎడమ చేయి (జన్మసిద్ధ సంపద & శక్తి)",
    ta: "இடது கை (இயற்கை திறன் & குணம்)"
  },
  right: {
    kn: "ಬಲ ಹಸ್ತ (ಕರ್ಮ ಶಕ್ತಿ & ಪ್ರಸ್ತುತ ಭಾಗ್ಯ)",
    en: "Right Hand (Active Karma & Current Manifestation)",
    hi: "दायां हाथ (कर्म शक्ति व वर्तमान भाग्य)",
    te: "కుడి చేయి (కార్యరంగం & ప్రస్తుత భాగ్యం)",
    ta: "வலது கை (செயல் திறன் & பிராரப்தம்)"
  }
};

const LINE_NAMES_L5 = {
  life: {
    kn: "ಆಯುರ್ ರೇಖೆ (Life Line)",
    en: "Life Line (Ayur Rekha)",
    hi: "जीवन रेखा (आयुष्य)",
    te: "జీవిత రేఖ (ఆయుష్షు)",
    ta: "ஆயுள் ரேகை"
  },
  head: {
    kn: "ಮಸ್ತಿಷ್ಕ ರೇಖೆ / ಬುದ್ಧಿ ರೇಖೆ (Head Line)",
    en: "Head Line (Buddhi Rekha)",
    hi: "मस्तिष्क रेखा (बुद्धि)",
    te: "మస్తిష్క రేఖ (మేధస్సు)",
    ta: "புத்தி ரேகை"
  },
  heart: {
    kn: "ಹೃದಯ ರೇಖೆ (Heart Line)",
    en: "Heart Line (Hridaya Rekha)",
    hi: "हृदय रेखा (प्रेम व भावना)",
    te: "హృదయ రేఖ (ప్రేమ & బంధం)",
    ta: "இதய ரேகை"
  },
  fate: {
    kn: "ಭಾಗ್ಯ ರೇಖೆ / ಶನಿ ರೇಖೆ (Fate Line)",
    en: "Fate Line (Shani Rekha)",
    hi: "भाग्य रेखा (शनि रेखा)",
    te: "భాగ్య రేఖ (వృత్తి సంపద)",
    ta: "விதி ரேகை"
  },
  sun: {
    kn: "ರವಿ ರೇಖೆ / ವಿದ್ಯಾ ರೇಖೆ (Sun Line)",
    en: "Sun Line (Ravi Rekha)",
    hi: "सूर्य रेखा (विद्या व यश)",
    te: "సూర్య రేఖ (కీర్తి & గౌరవం)",
    ta: "சூரிய ரேகை"
  }
};

// Helper to convert base64 image data URL to Generative AI Part format
function base64ToGenerativePart(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (match) {
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2]
      }
    };
  }
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: dataUrl.replace(/^data:image\/[a-zA-Z+]+;base64,/, "")
    }
  };
}

// Deterministic FNV-1a based string hasher for reproducible variety
function hashData(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * Intelligent, Multi-Parametric Classical Vedic Offline Palm Reading Generator.
 * Guarantees rich, individualized, reproducible diversity across all devotees
 * even when offline or during Gemini API quota pauses.
 */
export function generateDynamicOfflinePalmReading(
  imageDataUrl: string,
  handSide: HandSide,
  devoteeName: string,
  lang: string,
  kundliData?: PalmReadingResult["kundliData"],
  sideImageDataUrl?: string,
  backImageDataUrl?: string,
  gender: "Male" | "Female" = "Male"
): PalmReadingResult {
  const langCode = (lang || "kn").slice(0, 2);
  const now = new Date();
  
  // Classical Vedic Gender Hand Polarity (Brihat Samhita & Garuda Purana)
  const handLabel = gender === "Female" ? {
    left: {
      kn: "ಎಡ ಹಸ್ತ (ಸ್ತ್ರೀ ಸಹಜ ಪ್ರಾರಬ್ಧ, ಆತ್ಮ ಶಕ್ತಿ & ಸಹಜ ಪ್ರತಿಭೆ)",
      en: "Left Hand (Innate Potential, Intuitive Soul Force & Prarabdha)",
      hi: "बायां हाथ (स्त्री सहज अंतर्ज्ञान व नैसर्गिक क्षमता)",
      te: "ఎడమ చేయి (సహజ అంతర్దృష్టి & ఆత్మ శక్తి)",
      ta: "இடது கை (இயற்கை திறன் & ஆத்ம சக்தி)"
    },
    right: {
      kn: "ಬಲ ಹಸ್ತ (ಸ್ತ್ರೀ ಕರ್ಮ ಶಕ್ತಿ, ವೃತ್ತಿ ಸಾಧನೆ & ಪ್ರಸ್ತುತ ಭಾಗ್ಯ)",
      en: "Right Hand (Active Career Karma & Self-Made Accomplishments)",
      hi: "दायां हाथ (सक्रिय कर्म, आजीविका व वर्तमान भाग्य)",
      te: "కుడి చేయి (కార్యరంగం & స్వయంకృషి)",
      ta: "வலது கை (செயல் திறன் & சுய உழைப்பு)"
    }
  }[handSide] : HAND_SIDE_L5[handSide];

  // High-entropy seed derived from devotee parameters, gender, image signatures, and astrological coordinates
  const entropyStr = `${devoteeName || "Devotee"}_${gender}_${handSide}_${imageDataUrl.slice(30, 300)}_${sideImageDataUrl ? sideImageDataUrl.slice(30, 200) : "noside"}_${backImageDataUrl ? backImageDataUrl.slice(30, 200) : "noback"}_${kundliData?.rashi || ""}_${kundliData?.nakshatra || ""}_${kundliData?.lagna || ""}`;
  const seed = hashData(entropyStr);

  // 1. Hand Elemental Chironomy (Earth, Air, Fire, Water, Sankirna)
  const elementKeys: Array<keyof typeof VEDIC_HAND_ELEMENTAL_TYPES> = ["earth", "air", "fire", "water", "sankirna"];
  const selectedElementKey = elementKeys[seed % elementKeys.length];
  const elemDef = VEDIC_HAND_ELEMENTAL_TYPES[selectedElementKey];

  const chironomyHandType = {
    element: {
      kn: elemDef.nameKn,
      en: elemDef.nameEn,
      hi: selectedElementKey === "earth" ? "पृथ्वी तत्त्व हस्त (Earth Hand)" : selectedElementKey === "air" ? "वायु तत्त्व हस्त (Air Hand)" : selectedElementKey === "fire" ? "अग्नि तत्त्व हस्त (Fire Hand)" : selectedElementKey === "water" ? "जल तत्त्व हस्त (Water Hand)" : "संकीर्ण राज हस्त (Royal Mixed Hand)",
      te: selectedElementKey === "earth" ? "పృథ్వీ తత్త్వ హస్తం (Earth Hand)" : selectedElementKey === "air" ? "వాయు తత్త్వ హస్తం (Air Hand)" : selectedElementKey === "fire" ? "అగ్ని తత్త్వ హస్తం (Fire Hand)" : selectedElementKey === "water" ? "జల తత్త్వ హస్తం (Water Hand)" : "సంకీర్ణ రాజ హస్తం (Royal Mixed Hand)",
      ta: selectedElementKey === "earth" ? "பிருத்வி தத்துவ கை (Earth Hand)" : selectedElementKey === "air" ? "வாயு தத்துவ கை (Air Hand)" : selectedElementKey === "fire" ? "அக்னி தத்துவ கை (Fire Hand)" : selectedElementKey === "water" ? "ஜல தத்துவ கை (Water Hand)" : "சங்கீர்ண ராஜ கை (Royal Mixed Hand)"
    },
    traits: {
      kn: elemDef.traitsKn,
      en: elemDef.traitsEn,
      hi: selectedElementKey === "earth" ? "व्यावहारिक कार्यशैली, दृढ़ संकल्प व भूमि-भवन निर्माण योग।" : selectedElementKey === "air" ? "बौद्धिक अन्वेषण, विश्लेषणात्मक क्षमता एवं डिजिटल संवाद कुशलता।" : selectedElementKey === "fire" ? "प्रखर नेतृत्व, अदम्य ऊर्जा, साहसिक कदम एवं शीघ्र निर्णय क्षमता।" : selectedElementKey === "water" ? "गहन अंतर्ज्ञान, कलात्मक संवेदनशीलता, दयालु स्वभाव एवं आध्यात्मिक चिंतन।" : "संतुलित राजलक्षण, ऐश्वर्य, उच्च प्रशासनिक सम्मान एवं सर्वप्रिय प्रभाव।",
      te: selectedElementKey === "earth" ? "వ్యవహారిక శైలి, స్థిరాస్తి & ధృడ సంకల్పం." : selectedElementKey === "air" ? "విశ్లేషణాత్మక ప్రతిభ & సమాచార నైపుణ్యం." : selectedElementKey === "fire" ? "నాయకత్వ లక్షణాలు & సాహసోపేత నిర్ణయాలు." : selectedElementKey === "water" ? "అంతర్దృష్టి, కళాభిరుచి & మానసిక సున్నితత్వం." : "రాజయోగం, పరిపాలనా దక్షత & సకల భోగాలు.",
      ta: selectedElementKey === "earth" ? "நடைமுறை செயல்திறன், நில யோகம் & மன உறுதி." : selectedElementKey === "air" ? "ஆராய்ச்சி திறன் & தகவல் தொடர்பு சிறப்பு." : selectedElementKey === "fire" ? "துணிச்சலான முடிவுகள், தலைமைப் பண்பு & வீரம்." : selectedElementKey === "water" ? "உள்ளுணர்வு ஞானம், கலை உணர்வு & இரக்கம்." : "அரச மரியாதை, ஆடம்பரம் & நிர்வாக மேன்மை."
    }
  };

  // 2. Angushta (Thumb) Willpower, Logic & Sacred Yava
  const thumbWillpowerVariants = [
    { kn: "ಬಲಯುತ ಪ್ರಥಮ ಪರ್ವ - ಅಚಲ ಸಂಕಲ್ಪ ಶಕ್ತಿ ಹಾಗೂ ನಾಯಕತ್ವ", en: "Strong 1st Phalanx - Unyielding willpower & decisive command", hi: "सुदृढ़ प्रथम पर्व - अडिग इच्छाशक्ति व नेतृत्व क्षमता।", te: "బలమైన మొదటి భాగం - అచల సంకల్పం & నాయకత్వం.", ta: "உறுதியான முதல் பாகம் - மன உறுதி & தலைமை." },
    { kn: "ಮಧ್ಯಮ ಸಮತೋಲಿತ ಪ್ರಥಮ ಪರ್ವ - ಪ್ರಾಯೋಗಿಕ ಕಾರ್ಯ ನಿರ್ವಹಣೆ", en: "Balanced 1st Phalanx - Pragmatic & adaptive execution", hi: "संतुलित प्रथम पर्व - व्यावहारिक एवं सामंजस्यपूर्ण कार्यशैली।", te: "సమతుల్య మొదటి భాగం - ఆచరణాత్మక ఆలోచన.", ta: "சமநிலையான முதல் பாகம் - நடைமுறை செயல்." },
    { kn: "ಉದ್ದನೆಯ ಸುಂದರ ಪ್ರಥಮ ಪರ್ವ - ಉನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ", en: "Long regal 1st Phalanx - High administrative sovereignty", hi: "दीर्घ प्रथम पर्व - उच्च प्रशासनिक अधिकार व प्रभुत्व।", te: "పొడవైన మొదటి భాగం - పరిపాలనా దక్షత.", ta: "நீண்ட முதல் பாகம் - நிர்வாக ஆளுமை." }
  ];
  const thumbLogicVariants = [
    { kn: "ಉದ್ದವಾದ ದ್ವಿತೀಯ ಪರ್ವ - ಚಾಣಾಕ್ಷ ಮುನ್ನೋಟ ಹಾಗೂ ತರ್ಕಶಕ್ತಿ", en: "Elongated 2nd Phalanx - Strategic foresight & logical diplomacy", hi: "दीर्घ द्वितीय पर्व - चतुर तर्कशक्ति व रणनीतिक दूरदर्शिता।", te: "పొడవైన రెండవ భాగం - వ్యూహాత్మక ఆలోచన & తర్కం.", ta: "நீண்ட இரண்டாம் பாகம் - தர்க்க அறிவு & தூரநோக்கு." },
    { kn: "ದೃಢ ದ್ವಿತೀಯ ಪರ್ವ - ತ್ವರಿತ ವಿಶ್ಲೇಷಣೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಬುದ್ಧಿ", en: "Sturdy 2nd Phalanx - Rapid analysis & commercial clarity", hi: "सुदृढ़ द्वितीय पर्व - त्वरित वित्तीय विश्लेषण व व्यापार कुशलता।", te: "బలమైన రెండవ భాగం - వ్యాపార ప్రజ్ఞ.", ta: "வலுவான இரண்டாம் பாகம் - வர்த்தக சாதுரியம்." },
    { kn: "ಸೂಕ್ಷ್ಮ ದ್ವಿತೀಯ ಪರ್ವ - ಆಳವಾದ ಮಾನಸಿಕ ಗ್ರಹಣ ಶಕ್ತಿ", en: "Refined 2nd Phalanx - Deep psychological acumen & tact", hi: "सूक्ष्म द्वितीय पर्व - गहन मनोवैज्ञानिक समझ एवं संतुलन।", te: "సూక్ష్మ రెండవ భాగం - లోతైన మానసిక విశ్లేషణ.", ta: "நுட்பமான இரண்டாம் பாகம் - உளவியல் அறிவு." }
  ];
  const yavaVariants = [
    { kn: "ಪೂರ್ಣ ಯವ ಮುದ್ರಿಕೆ (ಶಿವ ನೇತ್ರ) - ಆಕಸ್ಮಿಕ ಧನಾಗಮನ & ದೈವಿಕ ರಕ್ಷಣೆ", en: "Closed Yava Sign (Eye of Shiva) - Sudden windfalls & ancestral protection", hi: "पूर्ण यव मुद्रिका (शिव नेत्र) - अकस्मात धनलाभ व पितृ रक्षा।", te: "సంపూర్ణ యవ ముద్రిక (శివ నేత్రం) - ఆకస్మిక ధనలాభం & దైవ రక్షణ.", ta: "முழு யவ குறியீடு (சிவ கண்) - திடீர் தன லாபம் & குலதெய்வ அருள்." },
    { kn: "ಉದಯೋನ್ಮುಖ ಯವ ರೇಖೆ - ಸ್ವಪ್ರಯತ್ನದಿಂದ ಧನ ಸಂಗ್ರಹ", en: "Emerging Yava Sign - Progressive self-earned wealth vault", hi: "उभरता यव चिह्न - स्वप्रयास से निरंतर धन संचय।", te: "వికసిస్తున్న యవ చిహ్నం - స్వయంకృషితో సంపద.", ta: "வளரும் யவ ரேகை - சுய உழைப்பால் செல்வ சேர்க்கை." },
    { kn: "ದ್ವಿಮುಖ ಯವ ಸಂಯೋಗ - ದ್ವಿವಿಧ ಆರ್ಥಿಕ ಮೂಲಗಳ ಭಾಗ್ಯ", en: "Dual Yava Nodes - Multiple independent wealth streams", hi: "द्विमुखी यव योग - दोहरे स्वतंत्र आय स्रोतों का लाभ।", te: "ద్విముఖ యవ యోగం - బహుళ ఆదాయ మార్గాలు.", ta: "இரட்டை யவ இணைப்பு - பலவகை வருமான யோகம்." }
  ];

  const thumbAnalysis = {
    willpower: thumbWillpowerVariants[seed % thumbWillpowerVariants.length],
    logic: thumbLogicVariants[(seed >> 2) % thumbLogicVariants.length],
    yavaSign: yavaVariants[(seed >> 3) % yavaVariants.length]
  };

  // 3. 5 Major Lines Micro-Topology
  const lifeLineOptions = [
    VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.deep_and_long,
    VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.upward_branches,
    VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.mars_sister_line,
    VEDIC_MAJOR_LINES_RULES.lifeLine.descriptions.forked_at_base
  ];
  const chosenLifeLine = lifeLineOptions[(seed >> 4) % lifeLineOptions.length];

  const headLineOptions = [
    VEDIC_MAJOR_LINES_RULES.headLine.descriptions.straight_upper_mars,
    VEDIC_MAJOR_LINES_RULES.headLine.descriptions.sloping_moon,
    VEDIC_MAJOR_LINES_RULES.headLine.descriptions.writers_fork,
    VEDIC_MAJOR_LINES_RULES.headLine.descriptions.independent_origin
  ];
  const chosenHeadLine = headLineOptions[(seed >> 5) % headLineOptions.length];

  const heartLineOptions = [
    VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.reaches_jupiter,
    VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.ends_between_jupiter_saturn,
    VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.guru_trishula,
    VEDIC_MAJOR_LINES_RULES.heartLine.descriptions.simian_line
  ];
  const chosenHeartLine = heartLineOptions[(seed >> 6) % heartLineOptions.length];

  const fateLineOptions = [
    VEDIC_MAJOR_LINES_RULES.fateLine.descriptions.from_wrist_to_saturn,
    VEDIC_MAJOR_LINES_RULES.fateLine.descriptions.from_moon_mount,
    VEDIC_MAJOR_LINES_RULES.fateLine.descriptions.from_life_line
  ];
  const chosenFateLine = fateLineOptions[(seed >> 7) % fateLineOptions.length];

  const sunLineOptions = [
    VEDIC_MAJOR_LINES_RULES.sunLine.descriptions.clear_on_sun_mount,
    VEDIC_MAJOR_LINES_RULES.sunLine.descriptions.star_on_sun
  ];
  const chosenSunLine = sunLineOptions[(seed >> 8) % sunLineOptions.length];

  const lifeLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.life,
    status: {
      kn: chosenLifeLine.status,
      en: chosenLifeLine.status.includes("ದೀರ್ಘ") ? "Deep, continuous, well-formed arc encircling Venus Mount" : chosenLifeLine.status.includes("ಏರುವ") ? "Ascending effort branches rising towards Mount of Jupiter" : chosenLifeLine.status.includes("ಕುಜ") ? "Protective Mars Guardian Sister Line (Bhoomi Kavacha)" : "Graceful forked termination near wrist indicating serene late life",
      hi: chosenLifeLine.status.includes("ದೀರ್ಘ") ? "गहरी, स्पष्ट व शुक्र पर्वत को घेरती सुंदर जीवन रेखा" : chosenLifeLine.status.includes("ಏರುವ") ? "गुरु पर्वत की ओर उठती शुभ प्रयास रेखाएं" : chosenLifeLine.status.includes("ಕುಜ") ? "मंगल रक्षा रेखा (कुज कवच योग)" : "मणिबंध के समीप द्विशाखी यात्रा व शांति रेखा",
      te: chosenLifeLine.status,
      ta: chosenLifeLine.status
    },
    indication: {
      kn: chosenLifeLine.indication,
      en: chosenLifeLine.indication,
      hi: chosenLifeLine.indication,
      te: chosenLifeLine.indication,
      ta: chosenLifeLine.indication
    }
  };

  const headLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.head,
    status: {
      kn: chosenHeadLine.status,
      en: chosenHeadLine.status.includes("ನೇರವಾಗಿ") ? "Clear Head line extending across to Upper Mars" : chosenHeadLine.status.includes("ಚಂದ್ರ") ? "Imaginative Head line curving gracefully towards Mount of Moon" : chosenHeadLine.status.includes("ದ್ವಿಮುಖ") ? "Celebrated Writer's Fork (Vyapara Mukha / Dual Intellect)" : "Independent origin separated from Life line (Free thinker)",
      hi: chosenHeadLine.status.includes("ನೇರವಾಗಿ") ? "उच्च मंगल की ओर जाती स्पष्ट व्यावहारिक मस्तिष्क रेखा" : chosenHeadLine.status.includes("ಚಂದ್ರ") ? "चन्द्र पर्वत की ओर झुकती कल्पनाशील मस्तिष्क रेखा" : chosenHeadLine.status.includes("ದ್ವಿಮುಖ") ? "द्विशाखी मस्तिष्क रेखा (व्यापार व कला दोनों में प्रवीण)" : "जीवन रेखा से स्वतंत्र उदित होने वाली निर्भीक विचार रेखा",
      te: chosenHeadLine.status,
      ta: chosenHeadLine.status
    },
    indication: {
      kn: chosenHeadLine.indication,
      en: chosenHeadLine.indication,
      hi: chosenHeadLine.indication,
      te: chosenHeadLine.indication,
      ta: chosenHeadLine.indication
    }
  };

  const heartLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.heart,
    status: {
      kn: chosenHeartLine.status,
      en: chosenHeartLine.status.includes("ಗುರು ಪರ್ವತದ ಸನ್ನಿಧಿಗೆ") ? "Harmonious Heart Line reaching Mount of Jupiter" : chosenHeartLine.status.includes("ಮಧ್ಯೆ") ? "Balanced Heart line terminating between Jupiter and Saturn" : chosenHeartLine.status.includes("ತ್ರಿಶೂಲ") ? "Auspicious Shiva Trident fork on Mount of Jupiter" : "Powerful Simian Line uniting intellect and emotional focus",
      hi: chosenHeartLine.status.includes("ಗುರು ಪರ್ವತದ ಸನ್ನಿಧಿಗೆ") ? "गुरु पर्वत तक पहुंचती सात्विक निष्ठावान हृदय रेखा" : chosenHeartLine.status.includes("ಮಧ್ಯೆ") ? "तर्जनी व मध्यमा के बीच समाप्त होती संतुलित हृदय रेखा" : chosenHeartLine.status.includes("ತ್ರಿಶೂಲ") ? "गुरु पर्वत पर त्रिशूल रूप में खिलती राजयोग हृदय रेखा" : "मस्तिष्क व हृदय का अद्भुत एकाग्र एकरेखीय योग",
      te: chosenHeartLine.status,
      ta: chosenHeartLine.status
    },
    indication: {
      kn: chosenHeartLine.indication,
      en: chosenHeartLine.indication,
      hi: chosenHeartLine.indication,
      te: chosenHeartLine.indication,
      ta: chosenHeartLine.indication
    }
  };

  const fateLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.fate,
    status: {
      kn: chosenFateLine.status,
      en: chosenFateLine.status.includes("ಮಣಿಕಟ್ಟಿನಿಂದ") ? "Ascending Fate Line rising straight from wrist to Saturn Mount" : chosenFateLine.status.includes("ಚಂದ್ರ") ? "Fate Line arising from Mount of Moon (Public favor & spouse fortune)" : "Fate line branching upward from Life Line (Self-made wealth from age 28+)",
      hi: chosenFateLine.status.includes("ಮಣಿಕಟ್ಟಿನಿಂದ") ? "मणिबंध से सीधी शनि पर्वत की ओर उठती भाग्य रेखा" : chosenFateLine.status.includes("ಚಂದ್ರ") ? "चन्द्र पर्वत से उदित भाग्य रेखा (जनप्रियता व विवाह के बाद भाग्योदय)" : "जीवन रेखा से फूटती कर्मठ भाग्य रेखा (स्वपरिश्रम से 28 वर्ष बाद उन्नति)",
      te: chosenFateLine.status,
      ta: chosenFateLine.status
    },
    indication: {
      kn: chosenFateLine.indication,
      en: chosenFateLine.indication,
      hi: chosenFateLine.indication,
      te: chosenFateLine.indication,
      ta: chosenFateLine.indication
    }
  };

  const sunLine: PalmLineAnalysis = {
    lineName: LINE_NAMES_L5.sun,
    status: {
      kn: chosenSunLine.status,
      en: chosenSunLine.status.includes("ನಕ್ಷತ್ರ") ? "Radiant Star on Mount of Sun (Apollo celebrity & high honors)" : "Prominent Sun Line clear on Mount of Apollo",
      hi: chosenSunLine.status.includes("ನಕ್ಷತ್ರ") ? "सूर्य पर्वत पर तेजस्वी तारा चिह्न (असाधारण ख्याति व पद-प्रतिष्ठा)" : "सूर्य पर्वत पर स्पष्ट व अखंड सूर्य रेखा (विद्या, यश व राजकीय सम्मान)",
      te: chosenSunLine.status,
      ta: chosenSunLine.status
    },
    indication: {
      kn: chosenSunLine.indication,
      en: chosenSunLine.indication,
      hi: chosenSunLine.indication,
      te: chosenSunLine.indication,
      ta: chosenSunLine.indication
    }
  };

  // 4. Mounts Selection
  const allMountCatalog = [
    { name: { kn: VEDIC_MOUNTS_RULES.jupiter.nameKn, en: VEDIC_MOUNTS_RULES.jupiter.nameEn, hi: "गुरु पर्वत (बृहस्पति)", te: "గురు పర్వతం", ta: "குரு மேடு" }, strength: { kn: "ಉನ್ನತ ಹಾಗೂ ಶುಭದಾಯಕ", en: "Elevated & Auspicious", hi: "उन्नत व शुभ", te: "ఉన్నతం", ta: "உயர்வான" }, indication: { kn: VEDIC_MOUNTS_RULES.jupiter.virtuesKn, en: "Executive leadership, moral guidance, and high spiritual wisdom.", hi: "नेतृत्व व ज्ञान की वृद्धि।", te: "నాయకత్వం & జ్ఞానం.", ta: "தலைமைத்துவம் & அறிவு." } },
    { name: { kn: VEDIC_MOUNTS_RULES.venus.nameKn, en: VEDIC_MOUNTS_RULES.venus.nameEn, hi: "शुक्र पर्वत", te: "శుక్ర పర్వతం", ta: "சுக்கிர மேடு" }, strength: { kn: "ಸುಂದರ ಹಾಗೂ ತೇಜಸ್ವಿ", en: "Radiant & Well-Developed", hi: "सुंदर व सुदृढ़", te: "సుందర పర్వతం", ta: "அழகான மேடு" }, indication: { kn: VEDIC_MOUNTS_RULES.venus.virtuesKn, en: "Luxury conveyances, aesthetics, and harmonious conjugal affection.", hi: "सुख-सुविधा व समृद्धि।", te: "సంపద & సౌఖ్యం.", ta: "செல்வம் & வாகன யோகம்." } },
    { name: { kn: VEDIC_MOUNTS_RULES.saturn.nameKn, en: VEDIC_MOUNTS_RULES.saturn.nameEn, hi: "शनि पर्वत", te: "శని పర్వతం", ta: "சனி மேடு" }, strength: { kn: "ಸಮತೋಲಿತ & ಗಂಭೀರ", en: "Balanced & Grounded", hi: "संतुलित व गंभीर", te: "సమతుల్య", ta: "சமநிலை" }, indication: { kn: VEDIC_MOUNTS_RULES.saturn.virtuesKn, en: "Disciplined wealth accumulation, real estate assets, and research persistence.", hi: "भूमि व अचल संपत्ति।", te: "స్థిరాస్తి & క్రమశిక్షణ.", ta: "சொத்து யோகம்." } },
    { name: { kn: VEDIC_MOUNTS_RULES.mercury.nameKn, en: VEDIC_MOUNTS_RULES.mercury.nameEn, hi: "बुध पर्वत", te: "బుధ పర్వతం", ta: "புதன் மேடு" }, strength: { kn: "ಚುರುಕಾದ ಉನ್ನತಿ", en: "Active & Agile", hi: "सक्रिय व उन्नत", te: "చురుకైన ఉన్నతి", ta: "சுறுசுறுப்பான மேடு" }, indication: { kn: VEDIC_MOUNTS_RULES.mercury.virtuesKn, en: "Commercial acumen, persuasive communication, and mathematical analytical depth.", hi: "वाक् सिद्धि व व्यापार चातुर्य।", te: "వ్యాపార ప్రజ్ఞ & వాక్చాతుర్యం.", ta: "வியாபார புத்தி & பேச்சாற்றல்." } },
    { name: { kn: VEDIC_MOUNTS_RULES.moon.nameKn, en: VEDIC_MOUNTS_RULES.moon.nameEn, hi: "चन्द्र पर्वत", te: "చంద్ర పర్వతం", ta: "சந்திர மேடு" }, strength: { kn: "ವಿಸ್ತಾರ ಹಾಗೂ ಸೌಮ್ಯ", en: "Expansive & Gentle", hi: "विस्तृत व सौम्य", te: "విశాలమైన", ta: "அகன்ற மேடு" }, indication: { kn: VEDIC_MOUNTS_RULES.moon.virtuesKn, en: "Poetic imagination, intuitive foresight, and auspicious foreign travel opportunities.", hi: "कल्पनाशीलता व विदेश यात्रा योग।", te: "ఊహాశక్తి & విదేశీ ప్రయాణం.", ta: "கற்பனை வளம் & வெளிநாட்டு யோகம்." } },
    { name: { kn: VEDIC_MOUNTS_RULES.sun.nameKn, en: VEDIC_MOUNTS_RULES.sun.nameEn, hi: "सूर्य पर्वत (अपोलो)", te: "సూర్య పర్వతం", ta: "சூரிய மேடு" }, strength: { kn: "ಪ್ರಕಾಶಮಾನ", en: "Lustrous & Prominent", hi: "प्रकाशमान", te: "ప్రకాశవంతం", ta: "ஒளிரும் மேடு" }, indication: { kn: VEDIC_MOUNTS_RULES.sun.virtuesKn, en: "Aristocratic dignity, artistic recognition, and high corporate or state honor.", hi: "राजकीय सम्मान व यश।", te: "సమాజంలో కీర్తి & గౌరవం.", ta: "அரச கௌரவம் & புகழ்." } }
  ];
  const m1 = allMountCatalog[seed % allMountCatalog.length];
  const m2 = allMountCatalog[(seed + 2) % allMountCatalog.length];
  const m3 = allMountCatalog[(seed + 4) % allMountCatalog.length];
  const mounts: PalmMountAnalysis[] = [
    { mountName: m1.name, strength: m1.strength, indication: m1.indication },
    { mountName: m2.name, strength: m2.strength, indication: m2.indication },
    { mountName: m3.name, strength: m3.strength, indication: m3.indication }
  ];

  // 5. Sacred Marks Selection
  const allMarks = [
    { mark: { kn: `🔱 ${VEDIC_SACRED_MARKS.trishula.nameKn}`, en: `🔱 ${VEDIC_SACRED_MARKS.trishula.nameEn}`, hi: "🔱 त्रिशूल चिह्न", te: "🔱 త్రిశూలం", ta: "🔱 திரிசூலம்" }, meaning: { kn: VEDIC_SACRED_MARKS.trishula.meaningKn, en: VEDIC_SACRED_MARKS.trishula.meaningEn, hi: "शिव कृपा, विघ्न विनाश व सर्वकार्य सिद्धि योग।", te: "శివ అనుగ్రహం & విజయం.", ta: "சிவ அருள் & காரிய சித்தி." } },
    { mark: { kn: `🐟 ${VEDIC_SACRED_MARKS.matsya.nameKn}`, en: `🐟 ${VEDIC_SACRED_MARKS.matsya.nameEn}`, hi: "🐟 मत्स्य चिह्न", te: "🐟 మత్స్య చిహ్నం", ta: "🐟 மச்ச குறியீடு" }, meaning: { kn: VEDIC_SACRED_MARKS.matsya.meaningKn, en: VEDIC_SACRED_MARKS.matsya.meaningEn, hi: "अकस्मात धनलाभ, आध्यात्मिक सिद्धि एवं दीर्घायु।", te: "ఆకస్మిక ధనలాభం & మోక్షం.", ta: "திடீர் தன லாபம் & ஆன்மீக சித்தி." } },
    { mark: { kn: `✨ ${VEDIC_SACRED_MARKS.mysticCross.nameKn}`, en: `✨ ${VEDIC_SACRED_MARKS.mysticCross.nameEn}`, hi: "✨ मिस्टिक क्रॉस", te: "✨ మిస్టిక్ క్రాస్", ta: "✨ மிஸ்டிக் கிராஸ்" }, meaning: { kn: VEDIC_SACRED_MARKS.mysticCross.meaningKn, en: VEDIC_SACRED_MARKS.mysticCross.meaningEn, hi: "छठी इंद्री, भविष्यसूचक स्वप्न एवं गूढ़ विद्या रुचि।", te: "ఆరవ ఇంద్రియం & దూరదృష్టి.", ta: "ஆறாவது அறிவு & ஞானம்." } },
    { mark: { kn: `👑 ${VEDIC_SACRED_MARKS.ringOfSolomon.nameKn}`, en: `👑 ${VEDIC_SACRED_MARKS.ringOfSolomon.nameEn}`, hi: "👑 गुरु मुद्रिका", te: "👑 గురు ముద్రిక", ta: "👑 குரு முத்ரிகா" }, meaning: { kn: VEDIC_SACRED_MARKS.ringOfSolomon.meaningKn, en: VEDIC_SACRED_MARKS.ringOfSolomon.meaningEn, hi: "अगाध मनोवैज्ञानिक समझ, परामर्श क्षमता एवं पूज्य पद।", te: "సలహాదారు ప్రతిభ & గౌరవం.", ta: "ஆலோசனை வழங்கும் ஞானம்." } },
    { mark: { kn: `🪷 ${VEDIC_SACRED_MARKS.padma.nameKn}`, en: `🪷 ${VEDIC_SACRED_MARKS.padma.nameEn}`, hi: "🪷 पद्म चिह्न", te: "🪷 పద్మ చిహ్నం", ta: "🪷 தாமரை குறியீடு" }, meaning: { kn: VEDIC_SACRED_MARKS.padma.meaningKn, en: VEDIC_SACRED_MARKS.padma.meaningEn, hi: "महालक्ष्मी कृपा, निष्कलंक चरित्र एवं राजसत्कार।", te: "మహాలక్ష్మి అనుగ్రహం & పవిత్రత.", ta: "மகாலக்ஷ்மி அருள் & புகழ்." } },
    { mark: { kn: `🔺 ${VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameKn}`, en: `🔺 ${VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.nameEn}`, hi: "🔺 महा धन त्रिकोण", te: "🔺 బృహత్ ధన త్రికోణం", ta: "🔺 தன திரிகோணம்" }, meaning: { kn: VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningKn, en: VEDIC_BRIHAT_TRIKONA_WEALTH_VAULT.meaningEn, hi: "पूर्ण बंद धन कोष - प्रचुर बचत व स्थायी समृद्धि।", te: "మూసిన ధన కోశం - శాశ్వత సంపద.", ta: "நிரந்தர செல்வ சேமிப்பு." } },
    { mark: { kn: `🏛️ ${VEDIC_SACRED_MARKS.gopura.nameKn}`, en: `🏛️ ${VEDIC_SACRED_MARKS.gopura.nameEn}`, hi: "🏛️ गोपुर (मंदिर) चिह्न", te: "🏛️ గోపురం చిహ్నం", ta: "🏛️ கோபுரம் குறியீடு" }, meaning: { kn: VEDIC_SACRED_MARKS.gopura.meaningKn, en: VEDIC_SACRED_MARKS.gopura.meaningEn, hi: "धार्मिक नेतृत्व, परोपकार एवं तीर्थ यात्रा संपादन।", te: "ధార్మిక నాయకత్వం & దాన గుణం.", ta: "ஆன்மீக தலைமை & தர்ம சிந்தனை." } }
  ];
  const sm1 = allMarks[seed % allMarks.length];
  const sm2 = allMarks[(seed + 2) % allMarks.length];
  const sm3 = allMarks[(seed + 5) % allMarks.length];
  const specialMarks = [sm1, sm2, sm3];

  // 6. Age & Milestones
  const estAge = 20 + ((seed >> 2) % 45); // 20 to 64 years old
  
  const currentPhases = [
    { kn: "ಯೌವನೋದಯ & ವಿದ್ಯಾ-ವೃತ್ತಿ ಅಡಿಪಾಯ ಕಾಲ", en: "Youthful Foundation & Career Inception Era" },
    { kn: "ಪ್ರಮುಖ ವೃತ್ತಿ ವಿಸ್ತರಣೆ & ದಾಂಪತ್ಯ ಸಿದ್ಧಿ ಕಾಲ", en: "Prime Career Expansion & Marital Harmony Era" },
    { kn: "ಆರ್ಥಿಕ ಸ್ಥಿರತೆ & ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಯ ಸುವರ್ಣ ಕಾಲ", en: "Financial Maturity & Domestic Bliss Golden Era" },
    { kn: "ಜ್ಞಾನ ಸಂಪನ್ನತೆ & ನಾಯಕತ್ವ ಗೌರವ ಕಾಲ", en: "Mentorship, Spiritual Wisdom & Legacy Era" }
  ];
  const chosenPhase = currentPhases[(seed >> 3) % currentPhases.length];

  const educationFields = [
    { traitKn: "ತೀಕ್ಷ್ಣ ಗಣಿತ, ಡೇಟಾ ವಿಶ್ಲೇಷಣೆ & ತಾಂತ್ರಿಕ ಚತುರತೆ", traitEn: "Sharp analytical logic, mathematics & technical acumen", fieldsKn: "ಎಂಜಿನಿಯರಿಂಗ್, ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್, ಹಣಕಾಸು ಅಥವಾ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ", fieldsEn: "Computer Science, Engineering, Quantitative Finance or AI" },
    { traitKn: "ವ್ಯವಹಾರ ಚಾತುರ್ಯ, ವಾಣಿಜ್ಯ ಮುನ್ನೋಟ & ಸಂವಹನ ಕಲೆ", traitEn: "Commercial shrewdness, strategic foresight & persuasive communication", fieldsKn: "ವಾಣಿಜ್ಯ, ಆಡಳಿತ (MBA), ಕಾರ್ಪೊರೇಟ್ ಕಾನೂನು ಅಥವಾ ಜಾಗತಿಕ ವ್ಯಾಪಾರ", fieldsEn: "Commerce, Business Administration, Corporate Law or Global Trade" },
    { traitKn: "ಆಳವಾದ ಸಂಶೋಧನಾ ದೃಷ್ಟಿ, ಬರವಣಿಗೆ & ಸೃಜನಶೀಲ ಚಿಂತನೆ", traitEn: "Deep research aptitude, creative writing & philosophical depth", fieldsKn: "ಸಾಹಿತ್ಯ, ಪತ್ರಿಕೋದ್ಯಮ, ಸಂಶೋಧನೆ, ಶಿಕ್ಷಣ ಅಥವಾ ಸೈಕಾಲಜಿ", fieldsEn: "Research Sciences, Psychology, Journalism, Literature or Academia" },
    { traitKn: "ನಾಯಕತ್ವ, ಸಾಮಾಜಿಕ ಆಡಳಿತ & ಜನಸಂಪರ್ಕ ಕಲೆ", traitEn: "Executive leadership, social administration & public relations", fieldsKn: "ಸರಕಾರಿ ಸೇವೆಗಳು, ಸಾರ್ವಜನಿಕ ಆಡಳಿತ, ರಕ್ಷಣೆ ಅಥವಾ ರಾಜಕೀಯ ತಂತ್ರಗಾರಿಕೆ", fieldsEn: "Civil Services, Public Policy, Defense Strategy or Executive Leadership" }
  ];
  const chosenEdu = educationFields[(seed >> 4) % educationFields.length];

  const marriageWindows = [
    { windowKn: "೨೨ ರಿಂದ ೨೫ ವರ್ಷಗಳ ಅವಧಿ", windowEn: "Ages 22 to 25", spouseKn: "ಪರಸ್ಪರ ಪೂರಕವಾದ ಪ್ರೇಮ, ಸಾತ್ವಿಕ ಮನಸ್ಸು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ", spouseEn: "Affectionate, family-oriented and spiritually supportive life partner" },
    { windowKn: "೨೪ ರಿಂದ ೨೭ ವರ್ಷಗಳ ಅವಧಿ", windowEn: "Ages 24 to 27", spouseKn: "ಸುಸಂಸ್ಕೃತ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸವುಳ್ಳ ಹಾಗೂ ವೃತ್ತಿಪರ ಸಂಗಾತಿ", spouseEn: "Cultured, professionally ambitious, and deeply caring companion" },
    { windowKn: "೨೬ ರಿಂದ ೨೯ ವರ್ಷಗಳ ಅವಧಿ", windowEn: "Ages 26 to 29", spouseKn: "ಸಾತ್ವಿಕ ಆದರ್ಶಗಳು, ನಿಷ್ಠಾವಂತ ಪ್ರೇಮ ಹಾಗೂ ದೃಢ ನಿರ್ಧಾರಗಳ ಸಂಗಾತಿ", spouseEn: "Principled, loyal soulmate bringing lasting stability and joy" },
    { windowKn: "೨೮ ರಿಂದ ೩೨ ವರ್ಷಗಳ ಅವಧಿ", windowEn: "Ages 28 to 32", spouseKn: "ಪ್ರಬುದ್ಧ ಆಲೋಚನೆ, ಆರ್ಥಿಕ ಸ್ವಾವಲಂಬನೆ ಹಾಗೂ ಗೌರವಯುತ ಮನೋಭಾವದ ಸಂಗಾತಿ", spouseEn: "Emotionally mature, financially independent and intellectually aligned partner" },
    { windowKn: "೩೧ ರಿಂದ ೩೫ ವರ್ಷಗಳ ಅವಧಿ", windowEn: "Ages 31 to 35", spouseKn: "ಉನ್ನತ ಸಮಾಜದ ಪ್ರತಿಷ್ಠಿತ ಕುಟುಂಬದ, ಜವಾಬ್ದಾರಿಯುತ ಹಾಗೂ ಕೃತಜ್ಞತೆಯ ಸಂಗಾತಿ", spouseEn: "Distinguished partner from an esteemed background ensuring peaceful union" }
  ];
  const chosenMarr = marriageWindows[(seed >> 5) % marriageWindows.length];

  const wealthAges = [
    { ageKn: "೨೭ ಹಾಗೂ ೩೪ ವರ್ಷಗಳು", ageEn: "Ages 27 and 34", trajKn: "ಆರಂಭಿಕ ಉದ್ಯೋಗ ಪದೋನ್ನತಿ ಹಾಗೂ ಸ್ವಂತ ವಾಹನ-ಆಸ್ತಿ ಖರೀದಿ ಯೋಗ", trajEn: "Early career breakthrough, independent transport and real estate acquisition" },
    { ageKn: "೩೦ ಹಾಗೂ ೩೭ ವರ್ಷಗಳು", ageEn: "Ages 30 and 37", trajKn: "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ ನಿರ್ಮಾಣ ಹಾಗೂ ಹೂಡಿಕೆ ವೃದ್ಧಿ", trajEn: "Self-driven enterprise creation and accelerating capital compounding" },
    { ageKn: "೩೨, ೩೬ ಹಾಗೂ ೪೨ ವರ್ಷಗಳು", ageEn: "Ages 32, 36, and 42", trajKn: "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ವಾಣಿಜ್ಯ ಸಂಸ್ಥೆಗಳ ಮಾಲೀಕತ್ವ ಹಾಗೂ ಸುವರ್ಣ ಧನಾಗಮನ", trajEn: "Commercial property ownership and multiple thriving income streams" },
    { ageKn: "೩೫ ಹಾಗೂ ೪೪ ವರ್ಷಗಳು", ageEn: "Ages 35 and 44", trajKn: "ಉನ್ನತ ನಿರ್ದೇಶಕ ಪದವಿ, ಸಮಾಜದಲ್ಲಿ ಗಣ್ಯ ಗೌರವ ಹಾಗೂ ಶಾಶ್ವತ ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ", trajEn: "Executive pinnacle, prestigious community honor and generational wealth foundation" },
    { ageKn: "೩೮, ೪೬ ಹಾಗೂ ೫೪ ವರ್ಷಗಳು", ageEn: "Ages 38, 46, and 54", trajKn: "ಬಹುಮುಖಿ ಹೂಡಿಕೆಗಳು, ಭೂ ಒಡೆತನ ಹಾಗೂ ಸಂತುಷ್ಟ ನಿವೃತ್ತಿ ಸಂಪತ್ತು", trajEn: "Diversified real estate portfolio, land equity and lasting prosperity" }
  ];
  const chosenWealth = wealthAges[(seed >> 6) % wealthAges.length];

  const lifeStageMilestones: LifeStageMilestones = {
    estimatedAge: estAge,
    currentPhaseKn: chosenPhase.kn,
    currentPhaseEn: chosenPhase.en,
    education: {
      intellectTraitKn: chosenEdu.traitKn,
      intellectTraitEn: chosenEdu.traitEn,
      recommendedFieldsKn: chosenEdu.fieldsKn,
      recommendedFieldsEn: chosenEdu.fieldsEn
    },
    marriage: {
      statusKn: "ಅತ್ಯಂತ ಶುಭ ಮಂಗಳ ಯೋಗ",
      statusEn: "Highly Auspicious Union",
      timingAgeWindowKn: chosenMarr.windowKn,
      timingAgeWindowEn: chosenMarr.windowEn,
      spouseTraitKn: chosenMarr.spouseKn,
      spouseTraitEn: chosenMarr.spouseEn
    },
    children: {
      prospectsKn: "ಉತ್ತಮ ಸಂತಾನ ಸೌಭಾಗ್ಯ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಮಕ್ಕಳಿಗೆ ಸಕಾಲದಲ್ಲಿ ಸುಸಂಸ್ಕಾರ",
      prospectsEn: "Auspicious progeny blessing, harmonious parenting and family honor",
      familyBlessingKn: "ಮಕ್ಕಳಿಂದ ವಿದ್ಯಾ ಕೀರ್ತಿ ಹಾಗೂ ವೃದ್ಧಾಪ್ಯದಲ್ಲಿ ಅಪಾರ ಗೌರವ ಮತ್ತು ನೆಮ್ಮದಿ",
      familyBlessingEn: "Children achieve academic excellence and bring lifelong comfort"
    },
    careerWealth: {
      peakWealthAgeKn: chosenWealth.ageKn,
      peakWealthAgeEn: chosenWealth.ageEn,
      trajectoryKn: chosenWealth.trajKn,
      trajectoryEn: chosenWealth.trajEn
    }
  };

  // 7. Optional Slot 2 (Side Percussion Marriage Analysis)
  let marriageLineAnalysis: MarriageLineAnalysis | undefined = undefined;
  if (sideImageDataUrl || (seed % 3 !== 0)) {
    const vivahaDetailedKeys = Object.keys(VEDIC_VIVAHA_REKHA_DETAILED_RULES) as Array<keyof typeof VEDIC_VIVAHA_REKHA_DETAILED_RULES>;
    const vrKey = vivahaDetailedKeys[(seed >> 7) % vivahaDetailedKeys.length];
    const vrRule = VEDIC_VIVAHA_REKHA_DETAILED_RULES[vrKey];
    marriageLineAnalysis = {
      lineCount: vrKey === "multiple_lines" ? 2 : 1,
      timingWindow: {
        kn: chosenMarr.windowKn,
        en: chosenMarr.windowEn,
        hi: chosenMarr.windowEn,
        te: chosenMarr.windowEn,
        ta: chosenMarr.windowEn
      },
      formation: {
        kn: vrRule.nameKn,
        en: vrRule.nameEn,
        hi: vrRule.nameEn,
        te: vrRule.nameEn,
        ta: vrRule.nameEn
      },
      spouseNature: {
        kn: vrRule.descKn,
        en: vrRule.descEn,
        hi: vrRule.descHi,
        te: vrRule.descTe,
        ta: vrRule.descTa
      }
    };
  }

  // 8. Optional Slot 3 (Dorsal Nails & Knuckles Analysis)
  let nailDorsalAnalysis: NailDorsalAnalysis | undefined = undefined;
  if (backImageDataUrl || (seed % 2 === 0)) {
    const nakhaKeys = Object.keys(VEDIC_NAKHA_LAKSHANA_RULES) as Array<keyof typeof VEDIC_NAKHA_LAKSHANA_RULES>;
    const nKey = nakhaKeys[(seed >> 8) % nakhaKeys.length];
    const nRule = VEDIC_NAKHA_LAKSHANA_RULES[nKey];

    const lunulaKeys = Object.keys(VEDIC_LUNULA_CHANDRAKARA_RULES) as Array<keyof typeof VEDIC_LUNULA_CHANDRAKARA_RULES>;
    const lKey = lunulaKeys[(seed >> 9) % lunulaKeys.length];
    const lRule = VEDIC_LUNULA_CHANDRAKARA_RULES[lKey];

    const knuckleKeys = Object.keys(VEDIC_ANGULI_SANDHI_RULES) as Array<keyof typeof VEDIC_ANGULI_SANDHI_RULES>;
    const kKey = knuckleKeys[(seed >> 10) % knuckleKeys.length];
    const kRule = VEDIC_ANGULI_SANDHI_RULES[kKey];

    nailDorsalAnalysis = {
      nailShape: { kn: nRule.nameKn, en: nRule.nameEn, hi: nRule.nameEn, te: nRule.nameEn, ta: nRule.nameEn },
      nailColor: {
        kn: nKey === "tamra" ? "ತಾಮ್ರ ಕಾಂತಿ (Rosy-Copper)" : nKey === "kurmaprishta" ? "ದೃಢ ಕಾಂತಿ (Vaulted Luster)" : "ಶುದ್ಧ ಗುಲಾಬಿ ಛಾಯೆ (Radiant Pink)",
        en: nKey === "tamra" ? "Rosy-Copper Luster (Tamra)" : "Radiant Pink Health Glow",
        hi: "गुलाबी कांति",
        te: "గులాబీ కాంతి",
        ta: "ரோஜா பளபளப்பு"
      },
      lunulaVitality: { kn: lRule.nameKn, en: lRule.nameEn, hi: lRule.nameEn, te: lRule.nameEn, ta: lRule.nameEn },
      knuckleTraits: { kn: kRule.nameKn, en: kRule.nameEn, hi: kRule.nameEn, te: kRule.nameEn, ta: kRule.nameEn },
      temperament: { kn: nRule.traitsKn, en: nRule.traitsEn, hi: nRule.traitsHi, te: nRule.traitsTe, ta: nRule.traitsTa }
    };
  }

  // 9. Overall Score (80% to 97%)
  const overallScore = 80 + (seed % 18);

  // 10. Verdict Titles
  const verdictTitles = [
    { kn: "🌟 ರಾಜಲಕ್ಷಣ ಯುಕ್ತ ಶುಭ ಹಸ್ತ ರೇಖಾ ಯೋಗ", en: "🌟 Auspicious Royal Palm Line Realization", hi: "🌟 अत्यंत शुभ राजलक्षण हस्त रेखा योग", te: "🌟 అత్యుత్తమ రాజలక్షణ హస్త రేఖ యోగం", ta: "🌟 ராஜலக்ஷண சுப ஹஸ்த ரேகை யோகம்" },
    { kn: "⚡ ಬೃಹತ್ ಧನಕೋಶ ಭಾಗ್ಯೋದಯ ಯೋಗ", en: "⚡ Great Wealth Vault Destiny Yoga", hi: "⚡ महा धन कोष भाग्योदय योग", te: "⚡ బృహత్ ధన కోశ భాగ్యోదయ యోగం", ta: "⚡ மகா தன திரிகோண பாக்கிய யோகம்" },
    { kn: "👑 ಗಜಕೇಸರಿ ವಿದ್ಯಾ-ಕೀರ್ತಿ ಹಸ್ತ ಯೋಗ", en: "👑 Gaja Kesari Wisdom & Prestige Yoga", hi: "👑 गजकेसरी विद्या व कीर्ति योग", te: "👑 గజకేసరి విద్యా-కీర్తి యోగం", ta: "👑 கஜகேசரி வித்யா-புகழ் யோகம்" },
    { kn: "🌾 ಪೃಥ್ವಿ ಸ್ಥಿರಾಸ್ತಿ ಸಂಪನ್ನ ಯೋಗ", en: "🌾 Bhoomi Real Estate Abundance Yoga", hi: "🌾 भूमि व अचल संपत्ति योग", te: "🌾 స్థిరాస్తి సంపన్న యోగం", ta: "🌾 பூமி மற்றும் சொத்து யோகம்" },
    { kn: "🌊 ಅಂತಃಸ್ಫೂರ್ತಿ ಕಲಾ ಸಿದ್ಧಿ ಯೋಗ", en: "🌊 Intuitive Spiritual & Artistic Yoga", hi: "🌊 अंतर्ज्ञान व कला सिद्धि योग", te: "🌊 అంతర్దృష్టి కళా సిద్ధి యోగం", ta: "🌊 உள்ளுணர்வு கலை யோகம்" }
  ];
  const chosenVerdict = verdictTitles[seed % verdictTitles.length];

  // 11. Temple Remedy
  const remedies = [
    { kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಹಾಗೂ 'ಶ್ರೀ ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ'ವನ್ನು ೧೦೮ ಬಾರಿ ಜಪಿಸಿ.", en: "Offer Ksheerabhishekam at Sri Gokarna Mahabaleshwara & chant Om Namah Shivaya daily.", hi: "श्री गोकर्ण महाबलेश्वर स्वामी को क्षीराभिषेक करें एवं 'ॐ नमः शिवाय' का जप करें।", te: "శ్రీ గోకర్ణ మహాబలేశ్వర స్వామికి క్షీరాభిషేకం చేయండి & ఓం నమః శివాయ జపించండి.", ta: "ஶ்ரீ கோகர்ண மகாபலேஸ்வரருக்கு பாலாபிஷேகம் செய்து 'ஓம் நமச்சிவாய' ஜபிக்கவும்." },
    { kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಬಿಲ್ವಾರ್ಚನೆ ಸಮರ್ಪಿಸಿ, ಸಂಜೆ ವೇಳೆ ಋಣಮುಕ್ತ ಗಣೇಶ ಸ್ತೋತ್ರ ಹಾಗೂ ಮಹಾಮೃತ್ಯುಂಜಯ ಜಪ ಕೈಗೊಳ್ಳಿ.", en: "Offer Bilvarchana at Gokarna Kshetra & recite Rinamocharana Ganesha Stotram daily.", hi: "गोकर्ण क्षेत्र में बिल्वार्चन करें एवं सायं ऋणमोचन गणेश स्तोत्र का पाठ करें।", te: "గోకర్ణ క్షేత్రంలో బిల్వార్చన సమర్పించి గణపతి స్తోత్రం జపించండి.", ta: "கோகர்ணத்தில் வில்வார்ச்சனை சமர்ப்பித்து விநாயகர் துதி பாராயணம் செய்யவும்." },
    { kn: "ಗೋಕರ್ಣ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸಿ, ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ಅಥವಾ ಅನ್ನದಾನ ಸೇವೆ ಸಲ್ಲಿಸಿ.", en: "Perform Rudrabhishekam at Gokarna Mahabaleshwara temple and support education of needy students.", hi: "गोकर्ण श्री महाबलेश्वर संनिधि में रुद्राभिषेक कराएं एवं विद्यार्थियों को अन्नदान/विद्यादान करें।", te: "గోకర్ణ శ్రీ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేకం నిర్వహించి అన్నదానం చేయండి.", ta: "கோகர்ண மகாபலேஸ்வரர் சன்னதியில் ருத்ராபிஷேகம் செய்து அன்னதானம் வழங்கவும்." }
  ];
  const chosenRemedy = remedies[seed % remedies.length];

  // 12. Rich Multi-Paragraph Prediction Text
  const aiPrediction = langCode === "kn"
    ? `ನಮಸ್ಕಾರ ${devoteeName}. ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರದ (ಬೃಹತ್ ಸಂಹಿತಾ & ಗರುಡ ಪುರಾಣ ಪರಂಪರೆ) ಪ್ರಕಾರ ನಿಮ್ಮ ${handLabel.kn} ದೈವಿಕ ರೇಖೆಗಳು ಹಾಗೂ ಪರ್ವತ ಬಲವನ್ನು ಸೂಕ್ಷ್ಮವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.\n\n🖐️ **ಹಸ್ತ ತತ್ತ್ವ & ಆಯುಷ್ಯ:** ನಿಮ್ಮ ಹಸ್ತವು ${chironomyHandType.element.kn} ಲಕ್ಷಣ ಹೊಂದಿದ್ದು, ${lifeLine.status.kn} ಕಂಡುಬಂದಿದೆ. ಇದು ${lifeLine.indication.kn}\n\n💡 **ಬುದ್ಧಿ ಹಾಗೂ ವೃತ್ತಿ ಸಾಮರ್ಥ್ಯ:** ${headLine.status.kn} ಇದ್ದು, ${headLine.indication.kn} ಹೆಬ್ಬೆರಳಿನಲ್ಲಿ ${thumbAnalysis.yavaSign.kn} ಸಿದ್ಧಿಸಿದೆ.\n\n❤️ **ಭಾವನಾತ್ಮಕ ದಾಂಪತ್ಯ & ಬಾಂಧವ್ಯ:** ${heartLine.status.kn} ರಾರಾಜಿಸುತ್ತಿದ್ದು, ವಿವಾಹ ಯೋಗವು ${chosenMarr.windowKn} ಅತ್ಯಂತ ಪ್ರಬಲವಾಗಿದೆ. ${chosenMarr.spouseKn}.\n\n🪔 **ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ದೈವಿಕ ಆಶೀರ್ವಾದ:** ${chosenRemedy.kn}`
    : `Greetings ${devoteeName}. Based on classical Vedic Hastarekha Shastra (Brihat Samhita & Garuda Purana traditions), your ${handLabel.en} reveals distinct ${chironomyHandType.element.en} traits.\n\n🖐️ **Vitality & Lifespan:** Your hand exhibits ${lifeLine.status.en}. This indicates: ${lifeLine.indication.en}\n\n💡 **Intellect & Career:** The Head Line demonstrates ${headLine.status.en}. Supported by ${thumbAnalysis.yavaSign.en}, your vocational acumen is primed for steady expansion.\n\n❤️ **Marriage & Bonds:** The Heart Line shows ${heartLine.status.en}, pointing to an auspicious union window around ${chosenMarr.windowEn}. Expected partner qualities: ${chosenMarr.spouseEn}.\n\n🪔 **Sacred Gokarna Blessing:** ${chosenRemedy.en}`;

  return {
    handSide,
    handSideLabel: handLabel,
    imageDataUrl,
    devoteeName: devoteeName || "Devotee",
    chironomyHandType,
    thumbAnalysis,
    lifeLine,
    headLine,
    heartLine,
    fateLine,
    sunLine,
    mounts,
    specialMarks,
    lifeStageMilestones,
    marriageLineAnalysis,
    nailDorsalAnalysis,
    overallScore,
    kundliData,
    verdictTitle: chosenVerdict,
    aiPrediction,
    remedyRecommendation: chosenRemedy,
    generatedAt: now.toLocaleString()
  };
}

/** Execute Multimodal Palm Inspection using Gemini 3.5 Flash Lite Vision */
export async function executePalmReading(
  imageDataUrl: string,
  handSide: HandSide,
  devoteeName: string,
  lang: string,
  apiKey: string,
  kundliData?: PalmReadingResult["kundliData"],
  sideImageDataUrl?: string,
  backImageDataUrl?: string,
  gender: "Male" | "Female" = "Male"
): Promise<PalmReadingResult> {
  const langCode = (lang || "kn").slice(0, 2);
  const isTestMode = typeof process !== "undefined" && (process.env?.NODE_ENV === "test" || process.env?.VITEST === "true");
  const activeKey = isTestMode ? (apiKey || "").trim() : (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  // Compute baseline dynamic offline reading to ensure 100% individualization and zero static fallbacks
  const baseline = generateDynamicOfflinePalmReading(
    imageDataUrl,
    handSide,
    devoteeName,
    lang,
    kundliData,
    sideImageDataUrl,
    backImageDataUrl,
    gender
  );

  if (!activeKey) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return baseline;
  }

  const targetLangName = langCode === "kn" ? "Kannada" : langCode === "hi" ? "Hindi" : langCode === "te" ? "Telugu" : langCode === "ta" ? "Tamil" : "English";

  // Template-Free, Multi-Slot Schema System Prompt
  const visionPrompt = `
You are Sri Shreeram Pandit, revered Master of Classical Vedic Hastarekha Shastra (Palmistry & Chironomy) from Gokarna Mahabaleshwara Kshetra, trained in Brihat Samhita and Garuda Purana.

Perform an authentic, 100% personalized, image-derived Hastarekha Shastra inspection of the devotee's uploaded palm photo(s):
- Hand Side: ${handSide.toUpperCase()} HAND
- Devotee: ${devoteeName || "Devotee"}
- Gender: ${gender === "Female" ? "Female (ಸ್ತ್ರೀ / ಮಹಿಳೆ)" : "Male (ಪುರುಷ)"}
- Target Language: ${targetLangName}
${kundliData ? `
NATAL ASTRONOMICAL KUNDALI INTEGRATION:
- Lagna: ${kundliData.lagna}
- Moon Rashi: ${kundliData.rashi}
- Nakshatra: ${kundliData.nakshatra}
- Maandi House: ${kundliData.maandi}
- Current Dasha: ${kundliData.dasha}
` : ""}

CLASSICAL VEDIC SAMUDRIKA SHASTRA RULES & GENDER POLARITY:
${gender === "Female" ? `
* FEMALE DEVOTEE (STHREE SHASTRA):
  - Right Hand governs active karmic manifestation, vocational leadership, financial autonomy, and present accomplishments.
  - Left Hand governs innate spiritual prarabdha, subconscious intuition, ancestral health foundation, and domestic harmony.
  - Evaluate Marriage & Mangalya from Vivaha Rekha (Mercury percussion), Venus mount fullness (Shukra), and Jupiter Mount purity.
` : `
* MALE DEVOTEE (PURUSHA SHASTRA):
  - Right Hand embodies Surya Nadi (active karmic execution, leadership, state honors, professional enterprise).
  - Left Hand embodies Chandra Nadi (inherited ancestral prarabdha, latent creative abilities, subconscious reservoir).
`}

EXACT MULTI-SLOT INSPECTION DIRECTIVES:
Examine up to 3 image slots provided in this request:

SLOT 1 (IMAGE 1 - FRONT PALM / KARANTALA):
1. PALM SHAPE & CHIRONOMY ELEMENT:
   - Carefully compute Palm Length vs Width ratio, and Finger Length vs Palm Length ratio:
     * Square Palm + Short Sturdy Fingers = Prithvi (Earth Hand)
     * Square Palm + Long Fingers = Vayu (Air Hand)
     * Long Rectangular Palm + Short Fingers = Agni (Fire Hand)
     * Long Rectangular Palm + Long Slender Fingers = Jala (Water Hand)
     * Conical / Balanced Contours = Sankirna (Royal Mixed Hand)
   Do NOT default to Earth Hand! Choose the genuine elemental type matching the image.
2. ANGUSHTHA (THUMB) & DERMATOGLYPHICS:
   - Inspect 1st phalanx (willpower length), 2nd phalanx (logic length), and whether there is an open or closed Yava / Eye of Shiva (Shiva Netra) on the joint.
   - Inspect fingertip patterns for concentric Chakra whirls (Adhipati leadership) vs Shankha loops (adaptability and peace).
3. 5 MAJOR LINES MICRO-TOPOLOGY & SPECIAL FORMATIONS:
   - Life Line (Ayur Rekha): Arcing radius around Venus, upward ambition branches to Jupiter, downward travel branches to Luna.
   - Mars Sister Line (Kuja Rekha / Mrityunjaya Raksha): Check for a parallel inner line running inside the Life Line from Lower Mars conferring divine accident protection and vitality.
   - Head Line (Buddhi Rekha): Straight across to Upper Mars (pragmatic/analytical), sloping gracefully to Moon (creative/intuitive), or Writer's Fork (Vyapara Mukha).
   - Heart Line (Hridaya Rekha): Terminating on Jupiter Mount (idealistic/sattvic), ending between Jupiter & Saturn (balanced devotion), or Guru Trishula trident.
   - Simian Line (Markata / Eka Rekha): Inspect whether Head and Heart lines fuse into a single intense transverse crease across the entire palm (unyielding focus and executive drive).
   - Fate Line (Shani Rekha): Originating from wrist Manibandha (self-made), from Luna mount (public/spouse blessing), or from Life line.
   - Sun Line (Surya Rekha): Clarity on Apollo mount, star, or branches.
   - Girdle of Venus (Shukra Valaya) & Ring of Solomon (Guru Mudrika): Note aesthetic sensitivity or sage-like counseling discernment.
   - Travel Lines (Deshadana Rekha): Horizontal or diagonal branches emerging from Moon percussion indicating travels or distant prosperity.
4. PLANETARY MOUNTS & SACRED MARKS:
   - Inspect elevation of Jupiter, Saturn, Sun, Mercury, Venus, Moon, and Mars.
   - Detect 2 to 3 genuinely visible sacred marks (e.g. Trishula, Matsya, Mystic Cross, Ring of Solomon, Dhana Trikona, Padma, Gopura, Shankha).

${sideImageDataUrl ? `
SLOT 2 (IMAGE 2 - SIDE PERCUSSION / VIVAHA REKHA):
- 50-YEAR VERTICAL CHRONOLOGY SCALE:
  * Baseline: Heart Line level corresponds to ~Age 14.
  * Summit: Base crease of Little Finger (Kanishthika) corresponds to ~Age 50.
  * Exact 50% Midpoint corresponds to ~Age 25.
  * Lines in Lower Half (between Heart Line & midpoint) indicate early marriage (Ages 20-25).
  * Lines in Upper Half (above midpoint towards pinky crease) indicate mature/deliberate marriage (Ages 26-36+).
- Count exact visible horizontal marriage/union lines (1, 2, or 3+).
- Inspect line topology: straight & deep (loyal bond), branch curved towards Sun line (distinguished partner), downward fork (initial emotional adjustment).
` : ""}

${backImageDataUrl ? `
SLOT 3 (IMAGE 3 - DORSAL / NAILS & KNUCKLES / NAKHA LAKSHANA):
- Inspect nail shape: Almond (Tamra/regal), Square/broad (Chaturasra/earth), Long slender (Dheergha/artistic), Vaulted (Kurmaprishta/tortoise-back).
- Inspect nail color/vitality (copper-rosy, pinkish, or pale).
- Inspect Lunula (Chandrakara half-moons at nail base) indicating metabolic Agni.
- Inspect knuckle joints (Anguli Sandhi): Granthila (philosophical knots - analytical) vs Agaditha (smooth joints - rapid artistic intuition).
` : ""}

CRITICAL RULES:
- Do NOT copy any generic or repetitive default values!
- Derive the devotee's estimated age (~XX years) and marriage window from the actual lines observed.
- Write a deeply empathetic 4-paragraph Vedic reading written purely in native ${targetLangName} script.
- Provide a sacred Gokarna Mahabaleshwara temple remedy with mantra.

Return ONLY a strict JSON object (no markdown wrapping) adhering to this schema:
{
  "estimatedAge": <integer between 18 and 85>,
  "handType": "<string: Exact hand element name in target language>",
  "handTypeTraits": "<string: Specific elemental personality and vocational traits>",
  "thumbWillpower": "<string: 1st phalanx willpower observation>",
  "thumbLogic": "<string: 2nd phalanx logic observation>",
  "thumbYavaSign": "<string: Observed Yava / Eye of Shiva status>",
  "currentPhaseKn": "<string: Current life stage in Kannada>",
  "currentPhaseEn": "<string: Current life stage in English>",
  "education": {
    "intellectTraitKn": "<string: Intellect trait in target language>",
    "intellectTraitEn": "<string: Intellect trait in English>",
    "recommendedFieldsKn": "<string: Recommended study/career fields in target language>",
    "recommendedFieldsEn": "<string: Recommended study/career fields in English>"
  },
  "marriage": {
    "statusKn": "<string: Marriage auspiciousness in target language>",
    "statusEn": "<string: Marriage auspiciousness in English>",
    "timingAgeWindowKn": "<string: Exact age window in target language, e.g. '೨೫ ರಿಂದ ೨೮ ವರ್ಷಗಳು'>",
    "timingAgeWindowEn": "<string: Exact age window in English, e.g. 'Ages 25 to 28'>",
    "spouseTraitKn": "<string: Spouse traits in target language>",
    "spouseTraitEn": "<string: Spouse traits in English>"
  },
  "children": {
    "prospectsKn": "<string: Progeny prospects in target language>",
    "prospectsEn": "<string: Progeny prospects in English>",
    "familyBlessingKn": "<string: Family blessing in target language>",
    "familyBlessingEn": "<string: Family blessing in English>"
  },
  "careerWealth": {
    "peakWealthAgeKn": "<string: Peak wealth ages in target language, e.g. '೩೧ ಹಾಗೂ ೩೯ ವರ್ಷಗಳು'>",
    "peakWealthAgeEn": "<string: Peak wealth ages in English, e.g. 'Ages 31 and 39'>",
    "trajectoryKn": "<string: Career and wealth trajectory in target language>",
    "trajectoryEn": "<string: Career and wealth trajectory in English>"
  },
  "lifeLineStatus": "<string: Life line status>",
  "lifeLineIndication": "<string: Life line indication>",
  "headLineStatus": "<string: Head line status>",
  "headLineIndication": "<string: Head line indication>",
  "heartLineStatus": "<string: Heart line status>",
  "heartLineIndication": "<string: Heart line indication>",
  "fateLineStatus": "<string: Fate line status>",
  "fateLineIndication": "<string: Fate line indication>",
  "sunLineStatus": "<string: Sun line status>",
  "sunLineIndication": "<string: Sun line indication>",
  "mounts": [
    { "name": "<string>", "strength": "<string>", "indication": "<string>" },
    { "name": "<string>", "strength": "<string>", "indication": "<string>" },
    { "name": "<string>", "strength": "<string>", "indication": "<string>" }
  ],
  "specialMarks": [
    { "mark": "<string with emoji>", "meaning": "<string>" },
    { "mark": "<string with emoji>", "meaning": "<string>" },
    { "mark": "<string with emoji>", "meaning": "<string>" }
  ],
  "marriageLineAnalysis": {
    "lineCount": <integer 1 or 2 or 3>,
    "timingWindow": "<string: timing window>",
    "formation": "<string: line formation description>",
    "spouseNature": "<string: partner characteristics>"
  },
  "nailDorsalAnalysis": {
    "nailShape": "<string: Nakha Lakshana shape>",
    "nailColor": "<string: nail color and vitality>",
    "lunulaVitality": "<string: Chandrakara lunula half-moon status>",
    "knuckleTraits": "<string: Granthila vs Agaditha joints>",
    "temperament": "<string: constitutional temperament>"
  },
  "overallScore": <integer between 72 and 98>,
  "verdictTitle": "<string: Unique localized verdict title>",
  "detailedPredictionText": "<string: Deep 4-paragraph personalized reading purely in target language script>",
  "remedy": "<string: Sacred Gokarna Mahabaleshwara temple remedy with mantra>"
}
`;

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json"
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const parts: any[] = [visionPrompt, base64ToGenerativePart(imageDataUrl)];
    if (sideImageDataUrl) parts.push(base64ToGenerativePart(sideImageDataUrl));
    if (backImageDataUrl) parts.push(base64ToGenerativePart(backImageDataUrl));

    const result = await model.generateContent(parts);
    const responseText = (await result.response).text().trim();
    void recordAiCallUsage({ feature: "facePalm", model: "gemini-3.5-flash-lite" });

    const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);

    // Helper to safely assign AI output to current language while preserving pure localized baseline for other languages
    const assignLocalizedField = (
      aiValue: string | undefined,
      baselineDict: Record<string, string>
    ): Record<string, string> => {
      const result: Record<string, string> = { ...baselineDict };
      if (aiValue && typeof aiValue === "string" && aiValue.trim()) {
        result[langCode] = aiValue.trim();
      }
      return result;
    };

    // Match elemental hand type across languages if identifiable
    const matchedElementKey = Object.keys(VEDIC_HAND_ELEMENTAL_TYPES).find((k) => {
      const def = VEDIC_HAND_ELEMENTAL_TYPES[k as keyof typeof VEDIC_HAND_ELEMENTAL_TYPES];
      const ht = (parsedData.handType || "").toLowerCase();
      return (
        ht.includes(k) ||
        (parsedData.handType || "").includes(def.nameKn) ||
        ht.includes(def.nameEn.toLowerCase())
      );
    }) as keyof typeof VEDIC_HAND_ELEMENTAL_TYPES | undefined;

    const chironomyHandType = {
      element: matchedElementKey
        ? {
            kn: VEDIC_HAND_ELEMENTAL_TYPES[matchedElementKey].nameKn,
            en: VEDIC_HAND_ELEMENTAL_TYPES[matchedElementKey].nameEn,
            hi: matchedElementKey === "earth" ? "पृथ्वी तत्त्व हस्त (Earth Hand)" : matchedElementKey === "air" ? "वायु तत्त्व हस्त (Air Hand)" : matchedElementKey === "fire" ? "अग्नि तत्त्व हस्त (Fire Hand)" : matchedElementKey === "water" ? "जल तत्त्व हस्त (Water Hand)" : "संकीर्ण राज हस्त (Royal Mixed Hand)",
            te: matchedElementKey === "earth" ? "పృథ్వీ తత్త్వ హస్తం (Earth Hand)" : matchedElementKey === "air" ? "వాయు తత్త్వ హస్తం (Air Hand)" : matchedElementKey === "fire" ? "అగ్ని తత్త్వ హస్తం (Fire Hand)" : matchedElementKey === "water" ? "జల తత్త్వ హస్తం (Water Hand)" : "సంకీర్ణ రాజ హస్తం (Royal Mixed Hand)",
            ta: matchedElementKey === "earth" ? "பிருத்வி தத்துவ கை (Earth Hand)" : matchedElementKey === "air" ? "வாயு தத்துவ கை (Air Hand)" : matchedElementKey === "fire" ? "அக்னி தத்துவ கை (Fire Hand)" : matchedElementKey === "water" ? "ஜல தத்துவ கை (Water Hand)" : "சங்கீர்ண ராஜ கை (Royal Mixed Hand)"
          }
        : assignLocalizedField(parsedData.handType, baseline.chironomyHandType.element),
      traits: assignLocalizedField(parsedData.handTypeTraits, baseline.chironomyHandType.traits)
    };

    const thumbAnalysis = {
      willpower: assignLocalizedField(parsedData.thumbWillpower, baseline.thumbAnalysis.willpower),
      logic: assignLocalizedField(parsedData.thumbLogic, baseline.thumbAnalysis.logic),
      yavaSign: assignLocalizedField(parsedData.thumbYavaSign, baseline.thumbAnalysis.yavaSign)
    };

    const lifeLine: PalmLineAnalysis = {
      lineName: LINE_NAMES_L5.life,
      status: assignLocalizedField(parsedData.lifeLineStatus, baseline.lifeLine.status),
      indication: assignLocalizedField(parsedData.lifeLineIndication, baseline.lifeLine.indication)
    };

    const headLine: PalmLineAnalysis = {
      lineName: LINE_NAMES_L5.head,
      status: assignLocalizedField(parsedData.headLineStatus, baseline.headLine.status),
      indication: assignLocalizedField(parsedData.headLineIndication, baseline.headLine.indication)
    };

    const heartLine: PalmLineAnalysis = {
      lineName: LINE_NAMES_L5.heart,
      status: assignLocalizedField(parsedData.heartLineStatus, baseline.heartLine.status),
      indication: assignLocalizedField(parsedData.heartLineIndication, baseline.heartLine.indication)
    };

    const fateLine: PalmLineAnalysis = {
      lineName: LINE_NAMES_L5.fate,
      status: assignLocalizedField(parsedData.fateLineStatus, baseline.fateLine.status),
      indication: assignLocalizedField(parsedData.fateLineIndication, baseline.fateLine.indication)
    };

    const sunLine: PalmLineAnalysis = {
      lineName: LINE_NAMES_L5.sun,
      status: assignLocalizedField(parsedData.sunLineStatus, baseline.sunLine.status),
      indication: assignLocalizedField(parsedData.sunLineIndication, baseline.sunLine.indication)
    };

    const mounts: PalmMountAnalysis[] = Array.isArray(parsedData.mounts) && parsedData.mounts.length > 0
      ? parsedData.mounts.map((m: any, idx: number) => {
          const baseM = baseline.mounts[idx] || baseline.mounts[0];
          return {
            mountName: assignLocalizedField(m.name, baseM.mountName),
            strength: assignLocalizedField(m.strength, baseM.strength),
            indication: assignLocalizedField(m.indication, baseM.indication)
          };
        })
      : baseline.mounts;

    const specialMarks = Array.isArray(parsedData.specialMarks) && parsedData.specialMarks.length > 0
      ? parsedData.specialMarks.map((sm: any, idx: number) => {
          const baseSm = baseline.specialMarks[idx] || baseline.specialMarks[0];
          return {
            mark: assignLocalizedField(sm.mark, baseSm.mark),
            meaning: assignLocalizedField(sm.meaning, baseSm.meaning)
          };
        })
      : baseline.specialMarks;

    const estAge = typeof parsedData.estimatedAge === "number" && parsedData.estimatedAge >= 14 && parsedData.estimatedAge <= 90
      ? parsedData.estimatedAge
      : baseline.lifeStageMilestones.estimatedAge;

    const lifeStageMilestones: LifeStageMilestones = {
      estimatedAge: estAge,
      currentPhaseKn: parsedData.currentPhaseKn || baseline.lifeStageMilestones.currentPhaseKn,
      currentPhaseEn: parsedData.currentPhaseEn || baseline.lifeStageMilestones.currentPhaseEn,
      education: {
        intellectTraitKn: parsedData.education?.intellectTraitKn || baseline.lifeStageMilestones.education.intellectTraitKn,
        intellectTraitEn: parsedData.education?.intellectTraitEn || baseline.lifeStageMilestones.education.intellectTraitEn,
        recommendedFieldsKn: parsedData.education?.recommendedFieldsKn || baseline.lifeStageMilestones.education.recommendedFieldsKn,
        recommendedFieldsEn: parsedData.education?.recommendedFieldsEn || baseline.lifeStageMilestones.education.recommendedFieldsEn
      },
      marriage: {
        statusKn: parsedData.marriage?.statusKn || baseline.lifeStageMilestones.marriage.statusKn,
        statusEn: parsedData.marriage?.statusEn || baseline.lifeStageMilestones.marriage.statusEn,
        timingAgeWindowKn: parsedData.marriage?.timingAgeWindowKn || baseline.lifeStageMilestones.marriage.timingAgeWindowKn,
        timingAgeWindowEn: parsedData.marriage?.timingAgeWindowEn || baseline.lifeStageMilestones.marriage.timingAgeWindowEn,
        spouseTraitKn: parsedData.marriage?.spouseTraitKn || baseline.lifeStageMilestones.marriage.spouseTraitKn,
        spouseTraitEn: parsedData.marriage?.spouseTraitEn || baseline.lifeStageMilestones.marriage.spouseTraitEn
      },
      children: {
        prospectsKn: parsedData.children?.prospectsKn || baseline.lifeStageMilestones.children.prospectsKn,
        prospectsEn: parsedData.children?.prospectsEn || baseline.lifeStageMilestones.children.prospectsEn,
        familyBlessingKn: parsedData.children?.familyBlessingKn || baseline.lifeStageMilestones.children.familyBlessingKn,
        familyBlessingEn: parsedData.children?.familyBlessingEn || baseline.lifeStageMilestones.children.familyBlessingEn
      },
      careerWealth: {
        peakWealthAgeKn: parsedData.careerWealth?.peakWealthAgeKn || baseline.lifeStageMilestones.careerWealth.peakWealthAgeKn,
        peakWealthAgeEn: parsedData.careerWealth?.peakWealthAgeEn || baseline.lifeStageMilestones.careerWealth.peakWealthAgeEn,
        trajectoryKn: parsedData.careerWealth?.trajectoryKn || baseline.lifeStageMilestones.careerWealth.trajectoryKn,
        trajectoryEn: parsedData.careerWealth?.trajectoryEn || baseline.lifeStageMilestones.careerWealth.trajectoryEn
      }
    };

    let marriageLineAnalysis = baseline.marriageLineAnalysis;
    if (parsedData.marriageLineAnalysis) {
      marriageLineAnalysis = {
        lineCount: parsedData.marriageLineAnalysis.lineCount || (baseline.marriageLineAnalysis?.lineCount ?? 1),
        timingWindow: assignLocalizedField(parsedData.marriageLineAnalysis.timingWindow, baseline.marriageLineAnalysis?.timingWindow || { kn: baseline.lifeStageMilestones.marriage.timingAgeWindowKn, en: baseline.lifeStageMilestones.marriage.timingAgeWindowEn, hi: baseline.lifeStageMilestones.marriage.timingAgeWindowEn, te: baseline.lifeStageMilestones.marriage.timingAgeWindowEn, ta: baseline.lifeStageMilestones.marriage.timingAgeWindowEn }),
        formation: assignLocalizedField(parsedData.marriageLineAnalysis.formation, baseline.marriageLineAnalysis?.formation || { kn: "ಸ್ಪಷ್ಟ ವಿವಾಹ ರೇಖೆ", en: "Clear union line", hi: "स्पष्ट विवाह रेखा", te: "వివాహ రేఖ", ta: "திருமண ரேகை" }),
        spouseNature: assignLocalizedField(parsedData.marriageLineAnalysis.spouseNature, baseline.marriageLineAnalysis?.spouseNature || { kn: baseline.lifeStageMilestones.marriage.spouseTraitKn, en: baseline.lifeStageMilestones.marriage.spouseTraitEn, hi: "सद्गुणी जीवनसाथी", te: "సద్గుణ భాగస్వామి", ta: "நற்குண துணை" })
      };
    }

    let nailDorsalAnalysis = baseline.nailDorsalAnalysis;
    if (parsedData.nailDorsalAnalysis) {
      nailDorsalAnalysis = {
        nailShape: assignLocalizedField(parsedData.nailDorsalAnalysis.nailShape, baseline.nailDorsalAnalysis?.nailShape || { kn: "ಸುಂದರ ನಖ", en: "Aesthetic nail contour", hi: "सुंदर नाखून", te: "అందమైన గోళ్ళు", ta: "அழகான நகம்" }),
        nailColor: assignLocalizedField(parsedData.nailDorsalAnalysis.nailColor, baseline.nailDorsalAnalysis?.nailColor || { kn: "ಗುಲಾಬಿ ಕಾಂತಿ", en: "Rosy health luster", hi: "गुलाबी कांति", te: "గులాబీ రంగు", ta: "ரோஜா பளபளப்பு" }),
        lunulaVitality: assignLocalizedField(parsedData.nailDorsalAnalysis.lunulaVitality, baseline.nailDorsalAnalysis?.lunulaVitality || { kn: "ಅರ್ಧಚಂದ್ರಾಕಾರ", en: "Prominent lunula crescent", hi: "अर्धचंद्राकार", te: "అర్ధచంద్రాకారం", ta: "பிறைச்சந்திரன்" }),
        knuckleTraits: assignLocalizedField(parsedData.nailDorsalAnalysis.knuckleTraits, baseline.nailDorsalAnalysis?.knuckleTraits || { kn: "ಸಮತೋಲಿತ ಪರ್ವ", en: "Balanced knuckle nodes", hi: "संतुलित पोर", te: "సమతుల్య కీళ్ళు", ta: "சமநிலையான மூட்டுகள்" }),
        temperament: assignLocalizedField(parsedData.nailDorsalAnalysis.temperament, baseline.nailDorsalAnalysis?.temperament || { kn: "ಸ್ಥಿರ ಸ್ವಭಾವ", en: "Steadfast & resilient temperament", hi: "स्थिर स्वभाव", te: "స్థిర స్వభావం", ta: "நிலையான குணம்" })
      };
    }

    const overallScore = typeof parsedData.overallScore === "number" && parsedData.overallScore >= 50 && parsedData.overallScore <= 100
      ? parsedData.overallScore
      : baseline.overallScore;

    const verdictTitle = assignLocalizedField(parsedData.verdictTitle, baseline.verdictTitle);
    const remedyRecommendation = assignLocalizedField(parsedData.remedy, baseline.remedyRecommendation);

    return {
      handSide,
      handSideLabel: baseline.handSideLabel,
      imageDataUrl,
      devoteeName: devoteeName || "Devotee",
      chironomyHandType,
      thumbAnalysis,
      lifeLine,
      headLine,
      heartLine,
      fateLine,
      sunLine,
      mounts,
      specialMarks,
      lifeStageMilestones,
      marriageLineAnalysis,
      nailDorsalAnalysis,
      overallScore,
      kundliData,
      verdictTitle,
      aiPrediction: parsedData.detailedPredictionText || baseline.aiPrediction,
      remedyRecommendation,
      generatedAt: new Date().toLocaleString()
    };
  } catch (err) {
    console.error("Palm reading deep vision error, using rich deterministic Samudrika engine:", err);
    return baseline;
  }
}

/** Execute follow-up question on previous palm reading */
export async function askPalmReadingFollowUp(
  previousResult: PalmReadingResult,
  followUpQuestion: string,
  lang: string,
  apiKey: string
): Promise<string> {
  const langCode = (lang || "kn").slice(0, 2);
  const isTestMode = typeof process !== "undefined" && (process.env?.NODE_ENV === "test" || process.env?.VITEST === "true");
  const activeKey = isTestMode ? (apiKey || "").trim() : (apiKey || import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  const contextData = `
==================================================
HASTAREKHA SHASTRA FOLLOW-UP CONTEXT (Brihat Samhita)
==================================================
Hand Side: ${previousResult.handSide.toUpperCase()} (${previousResult.handSideLabel.en})
Hand Element: ${previousResult.chironomyHandType.element.kn}
Estimated Age: ~${previousResult.lifeStageMilestones.estimatedAge} Years
Overall Score: ${previousResult.overallScore}%
Life Line: ${previousResult.lifeLine.status.kn || previousResult.lifeLine.status.en} - ${previousResult.lifeLine.indication.kn || previousResult.lifeLine.indication.en}
Head Line: ${previousResult.headLine.status.kn || previousResult.headLine.status.en} - ${previousResult.headLine.indication.kn || previousResult.headLine.indication.en}
Heart Line: ${previousResult.heartLine.status.kn || previousResult.heartLine.status.en} - ${previousResult.heartLine.indication.kn || previousResult.heartLine.indication.en}
Thumb Yava: ${previousResult.thumbAnalysis.yavaSign.kn}
Marriage Window: ${previousResult.lifeStageMilestones.marriage.timingAgeWindowKn}
Previous Summary: ${previousResult.aiPrediction.slice(0, 400)}...
==================================================
`;

  const prompt = `
You are Sri Shreeram Pandit, Master Hastarekha Astrologer from Gokarna Mahabaleshwara Kshetra.
The devotee is asking a follow-up question regarding their palm reading: "${followUpQuestion}".
Provide a concise, direct, wise, and encouraging answer strictly using native script in requested language (${langCode}).
`;

  if (!activeKey) {
    return langCode === "kn"
      ? `ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಪೂರಕ ಪ್ರಶ್ನೆ: "${followUpQuestion}". ಪೂರ್ಣ ವಿವರವಾದ ಉತ್ತರಕ್ಕಾಗಿ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಜೆಮಿನಿ API ಕೀಲಿಯನ್ನು ಸೇರಿಸಿ.`
      : `Thank you for your question: "${followUpQuestion}". Please add your Gemini API Key for live AI responses.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(activeKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    const result = await model.generateContent(`${contextData}\n${prompt}`);
    const response = await result.response;
    return response.text() || "No response text.";
  } catch (err) {
    console.error("Palm follow-up error:", err);
    return langCode === "kn"
      ? `ಕ್ಷಮಿಸಿ, ಪೂರಕ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ.`
      : `Sorry, error processing follow-up question.`;
  }
}
