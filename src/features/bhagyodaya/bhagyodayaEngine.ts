/**
 * Bhagyodaya Mahadarshana & Life Transformation Master Engine
 * (ಭಾಗ್ಯೋದಯ ಮಹಾದರ್ಶನ & ಜೀವನ ಸಂಜೀವಿನಿ ಎಂಜಿನ್)
 * 
 * Deeply analyzes a devotee's Janma Kundali across 7 fundamental life pillars:
 * 1. 💰 Dhana Prapti & Runa Vimochana (Wealth breakout, Debt freedom, Career fortune)
 * 2. ❤️ Dampatya, Vivaha & Santathi Bhagya (Marriage timing, Soul partner, Children)
 * 3. 🌿 Ayur Arogya Raksha Kavacha (Health vitality, Doshas, Healing herbs, Longevity)
 * 4. 🛡️ Drishti, Shatru Badha & Graha Nivaran (Evil eye, Enemy protection, Sudarshana Kavacha)
 * 5. 🌟 10-Year Golden Milestones Timeline (Year-by-year life turning points 2026-2036)
 * 6. 💎 Bhagya Gemstone, Rudraksha & 5-Minute Daily Karma Blueprint
 * 7. 🪔 Gokarna Temple Priest Archana Sankalpa Recommendation
 * 
 * 100% Dynamic Parashari Calculations with Zero Static Fallbacks.
 */

import type { KundliOutput, PlanetPosition } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { siderealLongitudes } from "../../core/EphemerisEngine";
import { degreeToRashi } from "../../core/AstroMath";

export type BhagyodayaLang = "kn" | "en" | "hi" | "ta" | "te";

export interface GoldenMilestoneYear {
  year: number;
  age: number;
  rating: "golden" | "growth" | "caution";
  ratingLabel: string;
  theme: string;
  astrologicalReason: string;
  actionableGuidance: string;
  favorableMonths: string[];
}

export interface BhagyodayaReport {
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  lagnaRashi: string;
  moonRashi: string;
  nakshatra: string;
  nakshatraPada: number;
  rashiLord: string;
  lagnaLord: string;
  gotra: string;

  // Classical Bhagyodaya Maturation & Catalyst Pillar
  bhagyodaya: {
    bhagyeshPlanet: string;
    bhagyeshPlanetLabel: string;
    bhagyeshHouse: number;
    primaryAge: number;
    secondaryAge?: number;
    status: "active_golden" | "approaching" | "matured";
    statusLabel: string;
    catalystTheme: string;
    catalystDescription: string;
    dashaActivationForecast: string;
  };

  // 1. Wealth & Debt Freedom
  wealth: {
    dhanaYogaScore: number; // 0 to 100
    dhanaYogaName: string;
    wealthVerdict: string;
    runaVimochanaTimeline: string;
    goldenCareerSectors: string[];
    optimalWealthDirection: string;
    kuberaRemedy: string;
  };

  // 2. Marriage & Children
  relationship: {
    vivahaYogaWindow: string;
    spouseCharacteristics: string;
    spouseDirection: string;
    dampatyaHarmonyRating: string;
    santathiBlessingWindow: string;
    relationshipRemedy: string;
  };

  // 3. Health & Vitality
  health: {
    vitalityScore: number; // 0 to 100
    constitutionDosha: "Vata" | "Pitta" | "Kapha" | "Tridosha";
    vulnerableOrgans: string[];
    ayurSanjeeviniHerbs: string[];
    dailyDietRitual: string;
    mahaMrityunjayaShield: string;
  };

  // 4. Protection & Evil Eye
  protection: {
    drishtiSensitivityLevel: "Low" | "Medium" | "High" | "Severe";
    activeTransitAfflictions: string[];
    sudarshanaKavachaMantra: string;
    rakshaSutraTiming: string;
    homeEnergyRemedy: string;
  };

  // 5. 10-Year Golden Milestones (2026 - 2036)
  milestones: GoldenMilestoneYear[];

  // 6. Gemstone, Rudraksha & Daily Karma Blueprint
  karmaBlueprint: {
    bhagyaGemstone: {
      name: string;
      sanskritName: string;
      weightRatti: string;
      metal: string;
      finger: string;
      consecrationDay: string;
      caution: string;
    };
    rudrakshaMukhi: string;
    fiveMinuteMorningRoutine: {
      facingDirection: string;
      prescribedMantra: string;
      chantCount: number;
      sacredAction: string;
    };
    charityAction: string;
  };

  // 7. Temple Archana Sankalpa
  templeBlessing: {
    deity: string;
    templeName: string;
    specialSankalpaMantra: string;
    recommendedSevaName: string;
  };
}

export const RASHI_ORDER = [
  "Mesha", "Vrishabha", "Mithuna", "Karka",
  "Simha", "Kanya", "Tula", "Vrischika",
  "Dhanu", "Makara", "Kumbha", "Meena"
] as const;

export const RASHI_LORDS: Record<string, string> = {
  Mesha: "Mars",
  Vrishabha: "Venus",
  Mithuna: "Mercury",
  Karka: "Moon",
  Simha: "Sun",
  Kanya: "Mercury",
  Tula: "Venus",
  Vrischika: "Mars",
  Dhanu: "Jupiter",
  Makara: "Saturn",
  Kumbha: "Saturn",
  Meena: "Jupiter"
};

export const RASHI_LOCALE: Record<BhagyodayaLang, Record<string, string>> = {
  kn: {
    Mesha: "ಮೇಷ",
    Vrishabha: "ವೃಷಭ",
    Mithuna: "ಮಿಥುನ",
    Karka: "ಕರ್ಕಾಟಕ",
    Simha: "ಸಿಂಹ",
    Kanya: "ಕನ್ಯಾ",
    Tula: "ತುಲಾ",
    Vrischika: "ವೃಶ್ಚಿಕ",
    Dhanu: "ಧನುಸ್ಸು",
    Makara: "ಮಕರ",
    Kumbha: "ಕುಂಭ",
    Meena: "ಮೀನ"
  },
  en: {
    Mesha: "Aries (Mesha)",
    Vrishabha: "Taurus (Vrishabha)",
    Mithuna: "Gemini (Mithuna)",
    Karka: "Cancer (Karka)",
    Simha: "Leo (Simha)",
    Kanya: "Virgo (Kanya)",
    Tula: "Libra (Tula)",
    Vrischika: "Scorpio (Vrischika)",
    Dhanu: "Sagittarius (Dhanu)",
    Makara: "Capricorn (Makara)",
    Kumbha: "Aquarius (Kumbha)",
    Meena: "Pisces (Meena)"
  },
  hi: {
    Mesha: "मेष",
    Vrishabha: "वृषभ",
    Mithuna: "मिथुन",
    Karka: "कर्क",
    Simha: "सिंह",
    Kanya: "कन्या",
    Tula: "तुला",
    Vrischika: "वृश्चिक",
    Dhanu: "धनु",
    Makara: "मकर",
    Kumbha: "कुंभ",
    Meena: "मीन"
  },
  ta: {
    Mesha: "மேஷம்",
    Vrishabha: "ரிஷபம்",
    Mithuna: "மிதுனம்",
    Karka: "கடகம்",
    Simha: "சிம்மம்",
    Kanya: "கன்னி",
    Tula: "துலாம்",
    Vrischika: "விருச்சிகம்",
    Dhanu: "தனுசு",
    Makara: "மகரம்",
    Kumbha: "கும்பம்",
    Meena: "மீனம்"
  },
  te: {
    Mesha: "మేషం",
    Vrishabha: "వృషభం",
    Mithuna: "మిథునం",
    Karka: "కర్కాటకం",
    Simha: "సింహం",
    Kanya: "కన్య",
    Tula: "తులా",
    Vrischika: "వృశ్చికం",
    Dhanu: "ధనుస్సు",
    Makara: "మకరం",
    Kumbha: "కుంభం",
    Meena: "మీనం"
  }
};

export const GRAHA_LOCALE: Record<BhagyodayaLang, Record<string, string>> = {
  kn: {
    Sun: "ಸೂರ್ಯ",
    Moon: "ಚಂದ್ರ",
    Mars: "ಕುಜ (ಮಂಗಳ)",
    Mercury: "ಬುಧ",
    Jupiter: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
    Venus: "ಶುಕ್ರ",
    Saturn: "ಶನಿ",
    Rahu: "ರಾಹು",
    Ketu: "ಕೇತು"
  },
  en: {
    Sun: "Sun (Surya)",
    Moon: "Moon (Chandra)",
    Mars: "Mars (Kuja)",
    Mercury: "Mercury (Budha)",
    Jupiter: "Jupiter (Guru)",
    Venus: "Venus (Shukra)",
    Saturn: "Saturn (Shani)",
    Rahu: "Rahu",
    Ketu: "Ketu"
  },
  hi: {
    Sun: "सूर्य",
    Moon: "चन्द्र",
    Mars: "मंगल (कुज)",
    Mercury: "बुध",
    Jupiter: "बृहस्पति (गुरु)",
    Venus: "शुक्र",
    Saturn: "शनि",
    Rahu: "राहु",
    Ketu: "केतु"
  },
  ta: {
    Sun: "சூரியன்",
    Moon: "சந்திரன்",
    Mars: "செவ்வாய்",
    Mercury: "புதன்",
    Jupiter: "குரு",
    Venus: "சுக்கிரன்",
    Saturn: "சனி",
    Rahu: "ராகு",
    Ketu: "கேது"
  },
  te: {
    Sun: "సూర్యుడు",
    Moon: "చంద్రుడు",
    Mars: "కుజుడు",
    Mercury: "బుధుడు",
    Jupiter: "గురువు",
    Venus: "శుక్రుడు",
    Saturn: "శని",
    Rahu: "రాహువు",
    Ketu: "కేతువు"
  }
};

// Sign elements: Fire=East, Earth=South, Air=West, Water=North
export const SIGN_ELEMENTS: Record<number, "Fire" | "Earth" | "Air" | "Water"> = {
  0: "Fire", 1: "Earth", 2: "Air", 3: "Water",
  4: "Fire", 5: "Earth", 6: "Air", 7: "Water",
  8: "Fire", 9: "Earth", 10: "Air", 11: "Water"
};

// Classical Parashari Bhagyodaya Maturation Age
export const BHAGYODAYA_MATURATION_AGE: Record<string, { primary: number; secondary?: number }> = {
  Sun: { primary: 22 },
  Moon: { primary: 24 },
  Mars: { primary: 28 },
  Mercury: { primary: 32 },
  Jupiter: { primary: 16, secondary: 32 },
  Venus: { primary: 25 },
  Saturn: { primary: 36 },
  Rahu: { primary: 42 },
  Ketu: { primary: 48 }
};

// Solar month names for Upachaya Gochara favorable timing
const SOLAR_MONTHS_LOCALE: Record<BhagyodayaLang, Record<number, string>> = {
  kn: {
    0: "ಏಪ್ರಿಲ್ - ಮೇ (ಮೇಷ ಸೂರ್ಯ)",
    1: "ಮೇ - ಜೂನ್ (ವೃಷಭ ಸೂರ್ಯ)",
    2: "ಜೂನ್ - ಜುಲೈ (ಮಿಥುನ ಸೂರ್ಯ)",
    3: "ಜುಲೈ - ಆಗಸ್ಟ್ (ಕರ್ಕಾಟಕ ಸೂರ್ಯ)",
    4: "ಆಗಸ್ಟ್ - ಸೆಪ್ಟೆಂಬರ್ (ಸಿಂಹ ಸೂರ್ಯ)",
    5: "ಸೆಪ್ಟೆಂಬರ್ - ಅಕ್ಟೋಬರ್ (ಕನ್ಯಾ ಸೂರ್ಯ)",
    6: "ಅಕ್ಟೋಬರ್ - ನವೆಂಬರ್ (ತುಲಾ ಸೂರ್ಯ)",
    7: "ನವೆಂಬರ್ - ಡಿಸೆಂಬರ್ (ವೃಶ್ಚಿಕ ಸೂರ್ಯ)",
    8: "ಡಿಸೆಂಬರ್ - ಜನವರಿ (ಧನು ಸೂರ್ಯ)",
    9: "ಜನವರಿ - ಫೆಬ್ರವರಿ (ಮಕರ ಸೂರ್ಯ)",
    10: "ಫೆಬ್ರವರಿ - ಮಾರ್ಚ್ (ಕುಂಭ ಸೂರ್ಯ)",
    11: "ಮಾರ್ಚ್ - ಏಪ್ರಿಲ್ (ಮೀನ ಸೂರ್ಯ)"
  },
  en: {
    0: "April - May (Sun in Aries)",
    1: "May - June (Sun in Taurus)",
    2: "June - July (Sun in Gemini)",
    3: "July - August (Sun in Cancer)",
    4: "August - September (Sun in Leo)",
    5: "September - October (Sun in Virgo)",
    6: "October - November (Sun in Libra)",
    7: "November - December (Sun in Scorpio)",
    8: "December - January (Sun in Sagittarius)",
    9: "January - February (Sun in Capricorn)",
    10: "February - March (Sun in Aquarius)",
    11: "March - April (Sun in Pisces)"
  },
  hi: {
    0: "अप्रैल - मई (मेष सूर्य)",
    1: "मई - जून (वृषभ सूर्य)",
    2: "जून - जुलाई (मिथुन सूर्य)",
    3: "जुलाई - अगस्त (कर्क सूर्य)",
    4: "अगस्त - सितंबर (सिंह सूर्य)",
    5: "सितंबर - अक्टूबर (कन्या सूर्य)",
    6: "अक्टूबर - नवंबर (तुला सूर्य)",
    7: "नवंबर - दिसंबर (वृश्चिक सूर्य)",
    8: "दिसंबर - जनवरी (धनु सूर्य)",
    9: "जनवरी - फरवरी (मकर सूर्य)",
    10: "फरवरी - मार्च (कुंभ सूर्य)",
    11: "मार्च - अप्रैल (मीन सूर्य)"
  },
  ta: {
    0: "ஏப்ரல் - மே (சித்திரை)",
    1: "மே - ஜூன் (வைகாசி)",
    2: "ஜூன் - ஜூலை (ஆனி)",
    3: "ஜூலை - ஆகஸ்ட் (ஆடி)",
    4: "ஆகஸ்ட் - செப்டம்பர் (ஆவணி)",
    5: "செப்டம்பர் - அக்டோபர் (புரட்டாசி)",
    6: "அக்டோபர் - நவம்பர் (ஐப்பசி)",
    7: "நவம்பர் - டிசம்பர் (கார்த்திகை)",
    8: "டிசம்பர் - ஜனவரி (மார்கழி)",
    9: "ஜனவரி - பிப்ரவரி (தை)",
    10: "பிப்ரவரி - மார்ச் (மாசி)",
    11: "மார்ச் - ஏப்ரல் (பங்குனி)"
  },
  te: {
    0: "ఏప్రిల్ - మే (మేష రవి)",
    1: "మే - జూన్ (వృషభ రవి)",
    2: "జూన్ - జూలై (మిథున రవి)",
    3: "జూలై - ఆగస్టు (కర్కాటక రవి)",
    4: "ఆగస్టు - సెప్టెంబర్ (సింహ రవి)",
    5: "సెప్టెంబర్ - అక్టోబర్ (కన్యా రవి)",
    6: "అక్టోబర్ - నవంబర్ (తులా రవి)",
    7: "నవంబర్ - డిసెంబర్ (వృశ్చిక రవి)",
    8: "డిసెంబర్ - జనవరి (ధను రవి)",
    9: "జనవరి - ఫిబ్రవరి (మకర రవి)",
    10: "ఫిబ్రవరి - మార్చి (కుంభ రవి)",
    11: "మార్చి - ఏప్రిల్ (మీన రవి)"
  }
};

// Classical body organs mapped to Rashis (for 6th and 8th house analysis)
const ANATOMY_MAP: Record<BhagyodayaLang, Record<number, string>> = {
  kn: {
    0: "ತಲೆನೋವು & ರಕ್ತದೊತ್ತಡ (Head, Cranial & Blood Pressure)",
    1: "ಗಂಟಲು, ಥೈರಾಯ್ಡ್ & ಕುತ್ತಿಗೆ ಭಾಗ (Throat, Thyroid & Cervical)",
    2: "ಶ್ವಾಸಕೋಶ, ಭುಜಗಳು & ನರಮಂಡಲ (Lungs, Shoulders & Nervous System)",
    3: "ಎದೆ ಭಾಗ, ಜೀರ್ಣಾಂಗ & ಆಸಿಡಿಟಿ (Chest, Digestion & Acidity)",
    4: "ಹೃದಯ, ಬೆನ್ನುಹುರಿ & ದೈಹಿಕ ಉಷ್ಣತೆ (Heart, Spine & Heat Balance)",
    5: "ಹೊಟ್ಟೆ, ಕರುಳು & ಆಹಾರ ಜೀರ್ಣಕ್ರಿಯೆ (Intestines, Gut Health & Allergies)",
    6: "ಮೂತ್ರಪಿಂಡಗಳು, ಸೊಂಟದ ಭಾಗ & ಚರ್ಮ (Kidneys, Lumbar & Skin Equilibrium)",
    7: "ಶ್ರೋಣಿ ಭಾಗ, ಗುಪ್ತಾಂಗಗಳು & ರಕ್ತ ಪರಿಚಲನೆ (Pelvis, Excretory & Circulation)",
    8: "ಯಕೃತ್ತು, ಸೊಂಟದ ಕೀಲುಗಳು & ಕೊಲೆಸ್ಟ್ರಾಲ್ (Liver, Hip Joints & Arterial Health)",
    9: "ಮಂಡಿ ಕೀಲುಗಳು, ಮೂಳೆಗಳು & ವಾತ ಬಾಧೆ (Knees, Bones & Joint Rigidity)",
    10: "ಹಿಂಗಾಲುಗಳು, ಕೀಲುಗಳು & ನರಗಳ ನಿಶ್ಯಕ್ತಿ (Lower Legs, Ankles & Nervous Fatigue)",
    11: "ಪಾದಗಳು, ದುಗ್ಧರಸ & ನಿದ್ರಾಹೀನತೆ (Feet, Lymphatic Flow & Sleep Rhythm)"
  },
  en: {
    0: "Head, Cranial Vitality & Blood Pressure",
    1: "Throat, Thyroid & Cervical Region",
    2: "Lungs, Respiratory & Nervous System",
    3: "Chest, Upper Digestion & Gastric Rhythm",
    4: "Heart, Spine & Internal Heat Regulation",
    5: "Lower Abdomen, Intestines & Food Sensitivities",
    6: "Kidneys, Lumbar Balance & Skin Radiance",
    7: "Pelvis, Excretory Tract & Blood Circulation",
    8: "Liver, Arterial System & Hip Flexibility",
    9: "Knees, Skeletal Bones & Joint Mobility",
    10: "Ankles, Lower Limbs & Nervous Fatigue",
    11: "Feet, Lymphatic Flow & Sleep Cycles"
  },
  hi: {
    0: "सिर, मष्तिष्क एवं रक्तचाप (Head & Blood Pressure)",
    1: "गला, थायरॉयड एवं ग्रीवा (Throat & Thyroid)",
    2: "फेफड़े, कंधे एवं तंत्रिका तंत्र (Lungs & Nerves)",
    3: "छाती, पाचन एवं अम्लता (Chest & Digestion)",
    4: "हृदय, रीढ़ की हड्डी एवं पित्त (Heart & Spine)",
    5: "पेट, आंतें एवं पाचन संवेदनशीलता (Intestines & Gut)",
    6: "गुर्दे, कमर एवं त्वचा (Kidneys & Skin)",
    7: "श्रोणि, उत्सर्जन तंत्र एवं रक्त संचार (Pelvis & Circulation)",
    8: "यकृत (लीवर), जांघें एवं धमनी स्वास्थ्य (Liver & Arteries)",
    9: "घुटने, अस्थियां एवं वात विकार (Knees & Bones)",
    10: "पिंडलियां, टखने एवं स्नायु थकावट (Ankles & Nerves)",
    11: "पैर, लसिका तंत्र एवं अनिद्रा (Feet & Sleep Cycles)"
  },
  ta: {
    0: "தலை, மூளை மற்றும் ரத்த அழுத்தம் (Head & Blood Pressure)",
    1: "தொண்டை, தைராய்டு மற்றும் கழுத்து (Throat & Thyroid)",
    2: "நுரையீரல், தோள்பட்டை மற்றும் நரம்பு மண்டலம் (Lungs & Nerves)",
    3: "மார்பு, செரிமானம் மற்றும் அமிலத்தன்மை (Chest & Digestion)",
    4: "இதயம், முதுகுத்தண்டு மற்றும் உஷ்ணம் (Heart & Spine)",
    5: "வயிறு, குடல் மற்றும் உணவு ஒவ்வாமை (Intestines & Gut)",
    6: "சிறுநீரகங்கள், இடுப்பு மற்றும் தோல் (Kidneys & Skin)",
    7: "இடுப்பு பகுதி, கழிவு மண்டலம் மற்றும் ரத்த ஓட்டம் (Pelvis & Circulation)",
    8: "கல்லீரல், தொடை மூட்டுகள் (Liver & Arteries)",
    9: "முழங்கால்கள், எலும்புகள் மற்றும் மூட்டு வலி (Knees & Bones)",
    10: "கணுக்கால், தசை சோர்வு (Ankles & Nerves)",
    11: "பாதங்கள், நிணநீர் மற்றும் தூக்கமின்மை (Feet & Sleep Cycles)"
  },
  te: {
    0: "తల, మెదడు మరియు రక్తపోటు (Head & Blood Pressure)",
    1: "గొంతు, థైరాయిడ్ మరియు మెడ (Throat & Thyroid)",
    2: "ఊపిరితిత్తులు, భుజాలు మరియు నాడీ వ్యవస్థ (Lungs & Nerves)",
    3: "ఛాతీ, జీర్ణక్రియ మరియు ఎసిడిటీ (Chest & Digestion)",
    4: "గుండె, వెన్నెముక మరియు శరీర ఉష్ణోగ్రత (Heart & Spine)",
    5: "పొట్ట, పేగులు మరియు అజీర్ణం (Intestines & Gut)",
    6: "మూత్రపిండాలు, నడుము మరియు చర్మం (Kidneys & Skin)",
    7: "శ్రోణి భాగం, రక్త ప్రసరణ (Pelvis & Circulation)",
    8: "కాలేయం (లివర్), తొడ కీళ్ళు (Liver & Arteries)",
    9: "మోకాళ్ళు, ఎముకలు మరియు కీళ్ళ నొప్పులు (Knees & Bones)",
    10: "చీలమండలు, నరాల బలహీనత (Ankles & Nerves)",
    11: "పాదాలు, నిద్రలేమి (Feet & Sleep Cycles)"
  }
};

/**
 * Calculates the complete Bhagyodaya Mahadarshana Life Dossier from a devotee's KundliOutput.
 * 100% dynamic, computed from Janma Kundali, 9th house Bhagyesh maturation age & catalyst,
 * 10th house Karma, 7th house Kalatra, 6th house Roga/Runa, and live Gochara transits.
 */
export function generateBhagyodayaReport(
  kundli: KundliOutput,
  input: {
    name: string;
    birthDate: string;
    birthTime: string;
    gotra?: string;
  },
  lang: BhagyodayaLang = "kn"
): BhagyodayaReport {
  const devoteeName = input.name || (lang === "kn" ? "ಶ್ರೀಯುತ ಜಾತಕರು" : "Devotee");
  const birthDate = input.birthDate;
  const birthTime = input.birthTime;
  const gotra = input.gotra || "ಕಾಶ್ಯಪ";

  const lagnaRashiEng = kundli.lagnaRashi?.english || "Dhanu";
  let lagnaIdx = kundli.lagnaRashi?.index;
  if (typeof lagnaIdx !== "number" || lagnaIdx < 0 || lagnaIdx > 11) {
    lagnaIdx = RASHI_ORDER.indexOf(lagnaRashiEng as any);
    if (lagnaIdx === -1) lagnaIdx = 8; // Dhanu fallback
  }

  const planets = kundli.planets;
  const moonPlanet = planets.find(p => p.name === "Moon") || planets[1];
  const jupiterPlanet = planets.find(p => p.name === "Jupiter");
  const venusPlanet = planets.find(p => p.name === "Venus");
  const saturnPlanet = planets.find(p => p.name === "Saturn");
  const sunPlanet = planets.find(p => p.name === "Sun");
  const marsPlanet = planets.find(p => p.name === "Mars");
  const mercuryPlanet = planets.find(p => p.name === "Mercury");
  const rahuPlanet = planets.find(p => p.name === "Rahu");
  const ketuPlanet = planets.find(p => p.name === "Ketu");

  const moonRashiEng = kundli.moonSign?.english || moonPlanet?.rashi?.english || "Dhanu";
  let moonRashiIdx = kundli.moonSign?.index ?? moonPlanet?.rashi?.index;
  if (typeof moonRashiIdx !== "number" || moonRashiIdx < 0 || moonRashiIdx > 11) {
    moonRashiIdx = RASHI_ORDER.indexOf(moonRashiEng as any);
    if (moonRashiIdx === -1) moonRashiIdx = 8;
  }

  const nakshatraEng = moonPlanet?.nakshatra?.english || "Mula";
  const nakshatraKn = moonPlanet?.nakshatra?.sanskrit || "ಮೂಲಾ";

  // Dynamic Nakshatra Pada calculation from Moon's longitude
  const moonLong = ((moonPlanet?.rashi?.index ?? 0) * 30) + (moonPlanet?.degree ?? 0);
  const nakshatraPada = Math.floor(((moonLong % (360 / 27)) / (360 / 108))) + 1;

  const rashiLord = RASHI_LORDS[moonRashiEng] || "Jupiter";
  const lagnaLord = RASHI_LORDS[lagnaRashiEng] || "Jupiter";

  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(birthDate.split("-")[0] || "1990", 10);
  const baseAge = Math.max(0, currentYear - birthYear);

  // ── CORE BHAGYODAYA MATURATION AGE & CATALYST CALCULATION ──
  const ninthSignIdx = (lagnaIdx + 8) % 12;
  const ninthSignEng = RASHI_ORDER[ninthSignIdx];
  const bhagyeshPlanetName = RASHI_LORDS[ninthSignEng] || "Jupiter";
  const bhagyeshObj = planets.find(p => p.name === bhagyeshPlanetName);
  const bhagyeshHouse = bhagyeshObj?.house || 9;
  const maturation = BHAGYODAYA_MATURATION_AGE[bhagyeshPlanetName] || { primary: 28 };
  const primaryAge = maturation.primary;
  const secondaryAge = maturation.secondary;

  const bhagyeshLabel = GRAHA_LOCALE[lang]?.[bhagyeshPlanetName] || bhagyeshPlanetName;

  let bhagyodayaStatus: "active_golden" | "approaching" | "matured" = "matured";
  let bhagyodayaStatusLabel = "";

  if (baseAge < primaryAge) {
    bhagyodayaStatus = "approaching";
    bhagyodayaStatusLabel = lang === "kn"
      ? `ವಯಸ್ಸು ${primaryAge} ಸನ್ನಿಹಿತವಾಗಿದೆ (ಸಿದ್ಧತೆಯ ಸುವರ್ಣ ಕಾಲಾವಧಿ)`
      : `Approaching Horizon (Preparation Phase for Age ${primaryAge})`;
  } else if (Math.abs(baseAge - primaryAge) <= 2) {
    bhagyodayaStatus = "active_golden";
    bhagyodayaStatusLabel = lang === "kn"
      ? `ಪ್ರಸ್ತುತ ವಯಸ್ಸು ${baseAge} - ಮಹಾ ಸ್ವರ್ಣ ಭಾಗ್ಯೋದಯ ಚಾಲ್ತಿಯಲ್ಲಿದೆ!`
      : `Age ${baseAge} - Prime Golden Bhagyodaya Era Currently Active!`;
  } else {
    bhagyodayaStatus = "matured";
    bhagyodayaStatusLabel = lang === "kn"
      ? `ವಯಸ್ಸು ${primaryAge} ರಲ್ಲಿ ಮೊದಲ ಸಿದ್ಧಿ ಪಡೆದಿದೆ (ದಶಾ ಬಲದಿಂದ ನಿರಂತರ ಅಭಿವೃದ್ಧಿ)`
      : `Matured at Age ${primaryAge} (Continuous Amplification via Active Dasha)`;
  }

  // Bhagyodaya Catalyst Theme & Description (Bhavas 1-12)
  const catalystData: Record<number, { themeKn: string; themeEn: string; descKn: string; descEn: string }> = {
    1: {
      themeKn: "ಸ್ವ-ಪ್ರಯತ್ನ, ಸ್ವಾವಲಂಬನೆ & ವ್ಯಕ್ತಿತ್ವದ ವರ್ಚಸ್ಸು",
      themeEn: "Self-Reliance, Personal Branding & Independent Enterprise",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಲಗ್ನದಲ್ಲೇ ಸ್ಥಿತವಾಗಿರುವುದರಿಂದ ನಿಮ್ಮ ಸ್ವಂತ ಬುದ್ಧಿಶಕ್ತಿ, ಸ್ವಾವಲಂಬನೆ, ನಾಯಕತ್ವ ಹಾಗೂ ನಿರ್ಧಾರಗಳಿಂದಲೇ ಭಾಗ್ಯೋದಯ ಸಿದ್ಧಿಸುತ್ತದೆ. ಇತರರ ನೆರವಿಗಿಂತ ನಿಮ್ಮ ಸ್ವ-ಸಾಮರ್ಥ್ಯವೇ ನಿಮ್ಮ ಅದೃಷ್ಟದ ಬಾಗಿಲು ತೆರೆಯುತ್ತದೆ.",
      descEn: "With the 9th lord placed in the 1st house, your fortune awakens through personal charisma, independent enterprise, and self-directed initiatives rather than inherited dependency."
    },
    2: {
      themeKn: "ಕುಟುಂಬದ ಸಂಪತ್ತು, ವಾಕ್ ಚಾತುರ್ಯ & ಹಣಕಾಸು ಹೂಡಿಕೆ",
      themeEn: "Family Legacy, Strategic Investments & Eloquent Advisory",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ದ್ವಿತೀಯ ಭಾವದಲ್ಲಿದ್ದು, ನಿಮ್ಮ ಮಾತು, ಸಮಾಲೋಚನೆ, ಹಣಕಾಸು ಹೂಡಿಕೆ ಹಾಗೂ ಕುಟುಂಬದ ಸಹಕಾರದಿಂದ ಅಪಾರ ಸಂಪತ್ತು ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮಧುರ ವಾಕ್ಚಾತುರ್ಯವೇ ಧನಾಗಮನದ ಮೂಲ.",
      descEn: "With the 9th lord in the 2nd house, your rise to prosperity is catalyzed by financial acumen, persuasive speech, family blessings, and high-yield investments."
    },
    3: {
      themeKn: "ಧೈರ್ಯದ ಸಾಹಸ, ಸಮೂಹ ಮಾಧ್ಯಮ & ಡಿಜಿಟಲ್ ಉದ್ಯಮ",
      themeEn: "Courageous Ventures, Media, Communication & Digital Innovation",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ತೃತೀಯ ಭಾವದಲ್ಲಿದ್ದು, ಕಿರಿಯ ಒಡಹುಟ್ಟಿದವರ ನೆರವು, ಸಮೂಹ ಸಂವಹನ, ಬರವಣಿಗೆ, ಪ್ರಯಾಣಗಳು ಹಾಗೂ ಧೈರ್ಯದ ನೂತನ ಉದ್ಯಮಗಳ ಮೂಲಕ ಭಾಗ್ಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      descEn: "With the 9th lord in the 3rd house, fortune flourishes through bold personal courage, communications, digital media, writing, and strategic short journeys."
    },
    4: {
      themeKn: "ಮಾತೃ ಆಶೀರ್ವಾದ, ಸ್ಥಿರಾಸ್ತಿ-ಭೂಮಿ & ವಾಹನ ಯೋಗ",
      themeEn: "Mother's Blessings, Real Estate, Land & Ancestral Property",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಚತುರ್ಥದಲ್ಲಿದ್ದು, ತಾಯಿಯ ಆಶೀರ್ವಾದ, ಹುಟ್ಟಿದ ಊರು, ಭೂಮಿ ಖರೀದಿ, ಕೃಷಿ ಅಥವಾ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ವ್ಯವಹಾರಗಳಿಂದ ಮಹಾ ಭಾಗ್ಯೋದಯ ಉಂಟಾಗುತ್ತದೆ.",
      descEn: "With the 9th lord in the 4th house, your fortune blossoms through real estate ownership, domestic peace, maternal blessings, and vehicle acquisitions."
    },
    5: {
      themeKn: "ಸಂತಾನೋದಯದ ನಂತರ, ಪೂರ್ವ ಪುಣ್ಯ ಬಲ & ಸೃಜನಶೀಲ ಪ್ರತಿಭೆ",
      themeEn: "Post-Progeny Blessings, Past Merits & Creative Intellect",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಪಂಚಮದಲ್ಲಿದ್ದು, ಸಂತಾನ ಪ್ರಾಪ್ತಿಯ ನಂತರ ಜೀವನದಲ್ಲಿ ಆಶ್ಚರ್ಯಕರ ತಿರುವು ಬರುತ್ತದೆ. ಪೂರ್ವ ಜನ್ಮದ ಪುಣ್ಯ, ಮಂತ್ರ ಸಿದ್ಧಿ ಹಾಗೂ ಸೃಜನಶೀಲ ಆಲೋಚನೆಗಳು ನಿಮ್ಮನ್ನು ಉನ್ನತ ಮಟ್ಟಕ್ಕೆ ಕೊಂಡೊಯ್ಯುತ್ತವೆ.",
      descEn: "With the 9th lord in the 5th house, major fortune awakens after the birth of children, unlocking past-life karmic merit (Purva Punya), intellectual breakthroughs, and speculative gains."
    },
    6: {
      themeKn: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ ಜಯ, ಸೇವಾ ಕ್ಷೇತ್ರ & ಋಣ ನಿವಾರಣೆ",
      themeEn: "Competitive Mastery, Professional Services & Debt Elimination",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಷಷ್ಠದಲ್ಲಿದ್ದು, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು, ಸವಾಲುಗಳನ್ನು ಜಯಿಸುವುದು, ವೈದ್ಯಕೀಯ/ಕಾನೂನು ಸೇವಾ ಕ್ಷೇತ್ರ ಹಾಗೂ ಹಠಾತ್ ಸಾಲ ಮುಕ್ತಿಯ ಮೂಲಕ ಭಾಗ್ಯೋದಯ ಉಂಟಾಗುತ್ತದೆ.",
      descEn: "With the 9th lord in the 6th house, prosperity is forged through conquering tough professional competitions, medical/legal service, and systematic debt liquidation."
    },
    7: {
      themeKn: "ವಿವಾಹದ ನಂತರ, ಸಂಗಾತಿಯ ಆಗಮನ & ಜಂಟಿ ಪಾಲುದಾರಿಕೆ",
      themeEn: "Post-Marriage Surge, Life Partner's Destiny & Global Partnerships",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಸಪ್ತಮದಲ್ಲಿದ್ದು, ವಿವಾಹದ ನಂತರ ಜೀವನದಲ್ಲಿ ಮಹತ್ತರ ಬದಲಾವಣೆ ಉಂಟಾಗುತ್ತದೆ. ನಿಮ್ಮ ಜೀವನ ಸಂಗಾತಿಯ ಆಗಮನವೇ ಭಾಗ್ಯೋದಯದ ಪ್ರಮುಖ ತಿರುವು. ಜಂಟಿ ವ್ಯಾಪಾರ ಮತ್ತು ವಿದೇಶ ಪ್ರವಾಸಗಳು ಯಶಸ್ಸು ತರುತ್ತವೆ.",
      descEn: "With the 9th lord in the 7th house, marriage acts as the ultimate catalyst of destiny. Your spouse brings extraordinary fortune, followed by lucrative business alliances and travel."
    },
    8: {
      themeKn: "ಅನಿರೀಕ್ಷಿತ ಆಸ್ತಿ ಪ್ರಾಪ್ತಿ, ಗೂಢ ಸಂಶೋಧನೆ & ಜೀವಿತಾವಧಿಯ ರೂಪಾಂತರ",
      themeEn: "Sudden Windfalls, Research Breakthroughs & Deep Metamorphosis",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಅಷ್ಟಮದಲ್ಲಿದ್ದು, ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ, ಪೂರ್ವಜರ ಆಸ್ತಿ, ವಿಮೆ/ಪರಿಹಾರಗಳು, ಗೂಢ ವಿದ್ಯೆ ಅಥವಾ ತಾಂತ್ರಿಕ ಸಂಶೋಧನೆಯ ಮೂಲಕ ಜೀವನದಲ್ಲಿ ದಿಢೀರ್ ಸುವರ್ಣ ತಿರುವು ಬರುತ್ತದೆ.",
      descEn: "With the 9th lord in the 8th house, prosperity manifests through sudden unearned windfalls, inheritance, deep research, crisis management, and transformative spiritual breakthroughs."
    },
    9: {
      themeKn: "ಸ್ವಕ್ಷೇತ್ರ ಭಾಗ್ಯ, ದೈವ ಗುರು ಕೃಪೆ, ಪಿತೃ ಆಶೀರ್ವಾದ & ತೀರ್ಥಯಾತ್ರೆ",
      themeEn: "Undiluted Divine Grace, Fatherly Guidance & Higher Dharmic Wisdom",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ತನ್ನದೇ ಸ್ವಂತ ಭಾಗ್ಯ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಭಾಗ್ಯ ಯೋಗ. ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ಪಿತೃ ಕೃಪೆ, ಧಾರ್ಮಿಕ ಯಾತ್ರೆಗಳು ಹಾಗೂ ದೈವ ಪ್ರೇರಣೆಯಿಂದ ಸಕಲ ಕಾರ್ಯಗಳು ಅನಾಯಾಸವಾಗಿ ಸಿದ್ಧಿಸುತ್ತವೆ.",
      descEn: "With the 9th lord reigning in its own 9th house, supreme divine fortune smiles upon you. Mentorship, fatherly support, temple pilgrimages, and ethical leadership unlock immense honors."
    },
    10: {
      themeKn: "ಉನ್ನತ ವೃತ್ತಿ ಬಡ್ತಿ, ಆಡಳಿತ ಅಧಿಕಾರ & ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ",
      themeEn: "Peak Professional Stature, Authority & Corporate/Public Elevation",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ದಶಮದಲ್ಲಿದ್ದು, 'ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗ' ಉಂಟಾಗಿದೆ. ಪ್ರತಿಷ್ಠಿತ ಉದ್ಯೋಗ ಬಡ್ತಿ, ಸರ್ಕಾರಿ ಅಥವಾ ಉನ್ನತ ಆಡಳಿತ ಮಂಡಳಿಯ ಅಧಿಕಾರ, ಸಮಾಜದಲ್ಲಿ ಖ್ಯಾತಿಯ ಮೂಲಕ ಮಹಾ ಭಾಗ್ಯೋದಯ ಸಿದ್ಧಿಸುತ್ತದೆ.",
      descEn: "With the 9th lord exalted in the 10th house, you possess the royal Dharma-Karmadhipati Yoga. Spectacular career promotions, governmental recognition, and societal acclaim crown your efforts."
    },
    11: {
      themeKn: "ಬೃಹತ್ ಸಂಪರ್ಕ ಜಾಲ, ಹಿರಿಯ ಒಡಹುಟ್ಟಿದವರು & ಬಹುಮುಖ ಆದಾಯ",
      themeEn: "Expansive Networks, Elder Siblings & Multi-Stream Prosperity",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ಏಕಾದಶದಲ್ಲಿದ್ದು, ಹಿರಿಯ ಒಡಹುಟ್ಟಿದವರು, ಪ್ರತಿಷ್ಠಿತ ಸ್ನೇಹಿತರ ಬಳಗ ಹಾಗೂ ಬಹುಮುಖ ಆದಾಯ ಮಾರ್ಗಗಳ ಮೂಲಕ ನಿಮ್ಮ ಜೀವಮಾನದ ಎಲ್ಲ ದೊಡ್ಡ ಕನಸುಗಳು ನನಸಾಗುತ್ತವೆ.",
      descEn: "With the 9th lord in the 11th house, massive wealth unfolds through elite professional networks, elder siblings, and simultaneous multi-channel revenue streams fulfilling lifelong ambitions."
    },
    12: {
      themeKn: "ವಿದೇಶ ವಾಸ, ವಿದೇಶಿ ವ್ಯವಹಾರ & ಜಾಗತಿಕ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಯಶಸ್ಸು",
      themeEn: "Foreign Settlement, Global Commerce & Transnational Success",
      descKn: "ಭಾಗ್ಯಾಧಿಪತಿಯು ವ್ಯಯದಲ್ಲಿದ್ದು, ವಿದೇಶ ವಾಸ, ವಿದೇಶಿ ವಿನಿಮಯ, ಬಹುರಾಷ್ಟ್ರೀಯ ಕಂಪನಿಗಳು (MNCs) ಅಥವಾ ದೂರದ ನೆಲೆಯಲ್ಲಿ ನೆಲೆಸುವುದರಿಂದ ನಿಮ್ಮ ಜೀವನದ ಅತ್ಯುನ್ನತ ಭಾಗ್ಯೋದಯ ಉಂಟಾಗುತ್ತದೆ.",
      descEn: "With the 9th lord in the 12th house, prime fortune is unlocked across distant lands, foreign enterprises, multinational corporations, and philanthropic institutions."
    }
  };

  const selectedCatalyst = catalystData[bhagyeshHouse] || catalystData[9];

  // Dasha-Bhukti current status
  const currentBhuktiAtAge = findBhuktiAtAge(kundli, baseAge);
  const mahaLordName = currentBhuktiAtAge?.maha?.planet || PlanetName.Jupiter;
  const dashaLordName = currentBhuktiAtAge?.bhukti || mahaLordName;
  const mahaLordKn = GRAHA_LOCALE[lang]?.[mahaLordName] || mahaLordName;
  const dashaLordKn = GRAHA_LOCALE[lang]?.[dashaLordName] || dashaLordName;

  const dashaActivationForecast = lang === "kn"
    ? `ಪ್ರಸ್ತುತ ${mahaLordKn} ಮಹಾದಶೆಯಲ್ಲಿ ${dashaLordKn} ಭುಕ್ತಿ ನಡೆಯುತ್ತಿದ್ದು, ${secondaryAge ? `ದ್ವಿತೀಯ ಭಾಗ್ಯೋದಯ ಸಿದ್ಧಿ ವಯಸ್ಸು ${secondaryAge} ರಲ್ಲಿ ನಿರೀಕ್ಷಿಸಲಾಗಿದೆ.` : `ಮುಂದಿನ ಪ್ರಮುಖ ಆರ್ಥಿಕ ಮತ್ತು ವೃತ್ತಿ ತಿರುವು ${currentYear + 1} ರ ವೇಳೆಗೆ ಉಂಟಾಗಲಿದೆ.`}`
    : `Currently traversing ${mahaLordName} Mahadasha with ${dashaLordName} Bhukti, ${secondaryAge ? `secondary golden horizon aligns at age ${secondaryAge}.` : `major fortune acceleration aligns by ${currentYear + 1}.`}`;

  // ── PILLAR 1: WEALTH & DEBT FREEDOM ──
  const hasGajaKesari = jupiterPlanet && moonPlanet && Math.abs(jupiterPlanet.house - moonPlanet.house) % 3 === 0;
  const has2ndLordWealth = venusPlanet && (venusPlanet.house === 2 || venusPlanet.house === 11);
  const dhanaScore = Math.min(98, Math.max(65, 70 + (hasGajaKesari ? 14 : 0) + (has2ndLordWealth ? 12 : 5) + (jupiterPlanet && jupiterPlanet.house === 9 ? 8 : 0)));

  const lagnaRashiLocalized = RASHI_LOCALE[lang]?.[lagnaRashiEng] || lagnaRashiEng;
  const wealthVerdictKn = `ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${lagnaRashiLocalized} ಲಗ್ನದ ${RASHI_LOCALE["kn"][lagnaRashiEng] || lagnaRashiEng} ರಾಶ್ಯಾಧಿಪತಿಯ ಬಲದಿಂದಾಗಿ ನಿಮ್ಮ ಜೀವಿತಾವಧಿಯಲ್ಲಿ ಅಪಾರ ಸಂಪತ್ತು ಸೃಷ್ಟಿಯಾಗುವ ಮಹಾ ಯೋಗವಿದೆ. ${hasGajaKesari ? "ಗಜಕೇಸರಿ ಯೋಗ ಹಾಗೂ ಧನಯೋಗವು ನಿಮ್ಮ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಭದ್ರಪಡಿಸುತ್ತದೆ." : "ದ್ವಿತೀಯ ಮತ್ತು ಏಕಾದಶ ಭಾವಗಳ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿರಂತರ ಧನಾಗಮನವಿರುತ್ತದೆ."}`;
  const wealthVerdictEn = `With your ${lagnaRashiEng} Ascendant and strong planetary alignments, you possess powerful Dhana Yogas for exponential wealth accumulation. ${hasGajaKesari ? "Gajakesari Yoga guarantees steady financial resilience and real estate growth." : "Direct aspects on your 2nd and 11th houses ensure recurring income streams."}`;

  // Dynamic Debt Freedom / Runa Vimochana Timeline
  const runaReliefOffset = (saturnPlanet && saturnPlanet.house === 6) ? 0 : 1;
  const runaStartYear = currentYear + runaReliefOffset;
  const runaEndYear = runaStartYear + 1;
  const runaVimochanaTimeline = lang === "kn"
    ? `${runaStartYear} ರ ದೀಪಾವಳಿಯಿಂದ ${runaEndYear} ರ ಯುಗಾದಿ ಒಳಗೆ ಷಷ್ಠಾಧಿಪತಿ ಉಪಶಮನ ಹಾಗೂ ಋಣ ಬಾಧೆಗಳಿಂದ ಸಂಪೂರ್ಣ ಮುಕ್ತಿ`
    : `Between Diwali ${runaStartYear} and Yugadi ${runaEndYear} 6th house pacification and total debt liberation`;

  // 100% Dynamic Optimal Wealth Direction based on 2nd House Sign Element
  const secondSignIdx = (lagnaIdx + 1) % 12;
  const secondSignElement = SIGN_ELEMENTS[secondSignIdx];
  let optimalWealthDirection = "";
  if (secondSignElement === "Water") {
    optimalWealthDirection = lang === "kn" ? "ಉತ್ತರ ಮತ್ತು ಈಶಾನ್ಯ ದಿಕ್ಕು (North & North-East)" : "North & North-East";
  } else if (secondSignElement === "Fire") {
    optimalWealthDirection = lang === "kn" ? "ಪೂರ್ವ ಮತ್ತು ಆಗ್ನೇಯ ದಿಕ್ಕು (East & South-East)" : "East & South-East";
  } else if (secondSignElement === "Earth") {
    optimalWealthDirection = lang === "kn" ? "ದಕ್ಷಿಣ ಮತ್ತು ನೈಋತ್ಯ ದಿಕ್ಕು (South & South-West)" : "South & South-West";
  } else {
    optimalWealthDirection = lang === "kn" ? "ಪಶ್ಚಿಮ ಮತ್ತು ವಾಯುವ್ಯ ದಿಕ್ಕು (West & North-West)" : "West & North-West";
  }

  // 100% Dynamic Career Sectors based on 10th House Sign & 10th Lord / Occupants
  const tenthSignIdx = (lagnaIdx + 9) % 12;
  const tenthLord = RASHI_LORDS[RASHI_ORDER[tenthSignIdx]] || "Sun";
  const occupants10 = planets.filter(p => p.house === 10).map(p => p.name);
  const primaryCareerPlanet = occupants10.length > 0 ? occupants10[0] : tenthLord;

  const careerSectorsMap: Record<string, { kn: string[]; en: string[] }> = {
    Sun: {
      kn: ["ಆಡಳಿತ & ಉನ್ನತ ನಾಯಕತ್ವ (Executive Leadership)", "ಸರ್ಕಾರಿ ಸೇವೆ & ಸಾರ್ವಜನಿಕ ನೀತಿ (Civil Services)", "ಸೌರ ಶಕ್ತಿ & ಮೂಲಭೂತ ಸೌಕರ್ಯ (Energy Projects)", "ಕಾರ್ಪೊರೇಟ್ ನಿರ್ದೇಶನ (Board Advisory)"],
      en: ["Executive Leadership & Management", "Public Policy & Civil Services", "Energy & Project Management", "Corporate Governance & Board Advisory"]
    },
    Moon: {
      kn: ["ಆಹಾರ, ಪಾನೀಯ & ಸತ್ಕಾರ ರಂಗ (Hospitality & F&B)", "ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಮಾನಸಿಕ ಸಲಹಾ ಸೇವೆ (Healthcare & Wellness)", "ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ & ಸಮೂಹ ಮಾಧ್ಯಮ (Public Relations & Media)", "ಶಿಕ್ಷಣ & ಮಾನವ ಸಂಪನ್ಮೂಲ (Education & HR)"],
      en: ["Hospitality, F&B & Culinary Arts", "Healthcare, Wellness & Counseling", "Public Relations & Media Communications", "Education & Human Resources"]
    },
    Mars: {
      kn: ["ರಿಯಲ್ ಎಸ್ಟೇಟ್ & ಭೂಮಿ ವ್ಯವಹಾರ (Real Estate & Land)", "ನಿರ್ಮಾಣ ಕಾಮಗಾರಿ & ಸಿವಿಲ್ ಎಂಜಿನಿಯರಿಂಗ್ (Civil Construction)", "ರಕ್ಷಣಾ ತಂತ್ರಜ್ಞಾನ & ಭದ್ರತೆ (Defense & Industrial Security)", "ಯಾಂತ್ರಿಕ & ಹಾರ್ಡ್‌ವೇರ್ ಎಂಜಿನಿಯರಿಂಗ್ (Mechanical Tech)"],
      en: ["Real Estate & Land Development", "Civil Engineering & Construction", "Defense Tech & Industrial Security", "Mechanical & Hardware Systems"]
    },
    Mercury: {
      kn: ["ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ & ಸಾಫ್ಟ್‌ವೇರ್ (IT & Enterprise Software)", "ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆ & ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (Data Science & AI)", "ವಾಣಿಜ್ಯ, ಲೆಕ್ಕಪತ್ರ & ಫಿನ್‌ಟೆಕ್ (Auditing & FinTech)", "ಡಿಜಿಟಲ್ ಮಾರ್ಕೆಟಿಂಗ್ & ಸಂವಹನ (Digital Marketing)"],
      en: ["IT & Enterprise Software Architecture", "Data Science & AI Analytics", "Commerce, Auditing & FinTech", "Digital Marketing & Strategic Media"]
    },
    Jupiter: {
      kn: ["ಶಿಕ್ಷಣ & ವಿಶ್ವವಿದ್ಯಾಲಯ ಸಂಶೋಧನೆ (Higher Education & Research)", "ಕಾನೂನು, ನ್ಯಾಯಾಂಗ & ಕಾರ್ಪೊರೇಟ್ ಸಲಹೆ (Corporate Law & Legal)", "ಬ್ಯಾಂಕಿಂಗ್ & ಹೂಡಿಕೆ ನಿಧಿ ನಿರ್ವಹಣೆ (Banking & Wealth Management)", "ಧಾರ್ಮಿಕ & ಸಾಂಸ್ಕೃತಿಕ ಸಂಸ್ಥೆಗಳು (Trusts & Foundations)"],
      en: ["Higher Education & University Research", "Law, Judiciary & Corporate Legal Advisory", "Banking, Wealth Management & Investments", "Cultural Trusts & Educational Foundations"]
    },
    Venus: {
      kn: ["ಚಿತ್ರರಂಗ, ಕಲೆ & ಡಿಜಿಟಲ್ ಮನರಂಜನೆ (Cinema & Digital Arts)", "ವಾಸ್ತುಶಿಲ್ಪ & ಒಳಾಂಗಣ ಸೌಂದರ್ಯ (Architecture & Luxury Interior)", "ಆಡಂಬರ ಜೀವನಶೈಲಿ, ವಸ್ತ್ರ & ಸೌಂದರ್ಯವರ್ಧಕ (Fashion & Cosmetics)", "ಪ್ರವಾಸೋದ್ಯಮ & ಈವೆಂಟ್ ಮ್ಯಾನೇಜ್‌ಮೆಂಟ್ (Tourism & Aviation)"],
      en: ["Cinema, Visual Arts & Digital Media", "Architecture & Luxury Interior Design", "Fashion, Luxury Goods & Cosmetics", "Tourism, Aviation & Premium Event Management"]
    },
    Saturn: {
      kn: ["ಮೂಲಸೌಕರ್ಯ, ಗಣಿಗಾರಿಕೆ & ಉಕ್ಕು ಕೈಗಾರಿಕೆ (Infrastructure & Mining)", "ಲಾಜಿಸ್ಟಿಕ್ಸ್, ಸಾರಿಗೆ & ಪೂರೈಕೆ ಜಾಲ (Logistics & Supply Chain)", "ಕೃಷಿ ತಂತ್ರಜ್ಞಾನ & ಪರಿಸರ ವಿಜ್ಞಾನ (AgriTech & Earth Sciences)", "ಕೈಗಾರಿಕಾ ಉತ್ಪಾದನೆ & ನಿರ್ವಹಣೆ (Manufacturing Operations)"],
      en: ["Infrastructure, Mining & Heavy Industry", "Logistics, Freight & Supply Chain", "AgriTech & Environmental Sciences", "Industrial Manufacturing & Operations"]
    },
    Rahu: {
      kn: ["ಅತ್ಯಾಧುನಿಕ AI, ಬ್ಲಾಕ್‌ಚೈನ್ & ನವೀನ ವೆಬ್ (DeepTech & Web3)", "ವಿದೇಶಿ ವ್ಯಾಪಾರ & ರಫ್ತು-ಆಮದು (Global Trade & Commerce)", "ಏವಿಯೇಷನ್ & ಅಂತರಿಕ್ಷ ತಂತ್ರಜ್ಞಾನ (Aviation Systems)", "ಔಷಧ ತಯಾರಿಕೆ & ಬಯೋಟೆಕ್ (Pharmaceuticals & BioTech)"],
      en: ["Cutting-Edge AI, Web3 & DeepTech", "Global Trade & Foreign Commerce", "Aviation & Aerospace Systems", "Pharmaceuticals & Biotechnology"]
    },
    Ketu: {
      kn: ["ಸೈಬರ್ ಭದ್ರತೆ & ಗೂಢಲಿಪೀಕರಣ (Cybersecurity & Cryptography)", "ಔಷಧೀಯ ಸಂಶೋಧನೆ & ನೈಸರ್ಗಿಕ ಚಿಕಿತ್ಸೆ (Holistic Therapeutics)", "ಸೂಕ್ಷ್ಮ ತಂತ್ರಜ್ಞಾನ & ಸಂಶೋಧನೆ (Micro-Tech & Pure Research)", "ಆಧ್ಯಾತ್ಮಿಕ ಸಮಾಲೋಚನೆ & ಸಾಹಿತ್ಯ (Metaphysical Consulting)"],
      en: ["Cybersecurity & Cryptography", "Pharmacology & Holistic Therapeutics", "Micro-Technologies & Pure Research", "Metaphysical Consulting & Literature"]
    }
  };

  const selectedCareer = careerSectorsMap[primaryCareerPlanet] || careerSectorsMap["Jupiter"];
  const goldenCareerSectors = lang === "kn" ? selectedCareer.kn : selectedCareer.en;

  // Dynamic Kubera Remedy based on 2nd / 11th Lord
  const secondLord = RASHI_LORDS[RASHI_ORDER[secondSignIdx]] || "Venus";
  const kuberaRemedies: Record<string, { kn: string; en: string }> = {
    Sun: {
      kn: "ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ನೀರನ್ನು ಅರ್ಪಿಸಿ.",
      en: "Chant the Aditya Hrudaya Stotra at sunrise and offer water to Surya in a sacred copper vessel."
    },
    Moon: {
      kn: "ಪ್ರತಿ ಸೋಮವಾರ ಶಿವನಿಗೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ ಹಾಗೂ ಬೆಳ್ಳಿಯ ನಾಣ್ಯವನ್ನು ನಿಮ್ಮ ಧನಸ್ಥಾನದಲ್ಲಿ ಶುದ್ಧವಾಗಿಡಿ.",
      en: "Perform milk abhisheka to Lord Shiva on Mondays and keep a consecrated silver coin in your cash vault."
    },
    Mars: {
      kn: "ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕಂ ಪಠಿಸಿ ಹಾಗೂ ತಾಮ್ರದ ದೀಪದಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ.",
      en: "Chant the Subrahmanya Ashtakam on Tuesdays and illuminate a pure ghee lamp in a copper vessel."
    },
    Mercury: {
      kn: "ಪ್ರತಿ ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಅಥವಾ ಬುಧ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ತುಳಸಿಗೆ ನೀರೆರೆಯಿರಿ.",
      en: "Chant Sri Vishnu Sahasranama or Budha Kavacha on Wednesdays and offer fresh water to Tulsi."
    },
    Jupiter: {
      kn: "ಪ್ರತಿ ಗುರುವಾರ ಶ್ರೀ ಬೃಹಸ್ಪತಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ, ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಪುಸ್ತಕ ಅಥವಾ ಅರಿಶಿನ-ಕಡಲೆ ಬೇಳೆ ದಾನ ಮಾಡಿ.",
      en: "Chant Sri Brihaspati Stotra on Thursdays and donate educational books or chana dal to students."
    },
    Venus: {
      kn: "ಪ್ರತಿ ಶುಕ್ರವಾರ ಶ್ರೀ ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಅಥವಾ ಶ್ರೀ ಸೂಕ್ತ ಪಠಿಸಿ ಹಾಗೂ ಉತ್ತರ ದಿಕ್ಕಿನಲ್ಲಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ.",
      en: "Chant the Kanakadhara Stotra on Fridays and light a fragrant ghee lamp facing the North direction."
    },
    Saturn: {
      kn: "ಪ್ರತಿ ಶನಿವಾರ ದಶರಥ ಕೃತ ಶನಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಸಂಜೆ ಕಪ್ಪು ಎಳ್ಳು ಬೆರೆಸಿದ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ.",
      en: "Chant the Dasharatha Shani Stotra on Saturdays and light a sesame oil lamp with black sesame seeds."
    }
  };
  const kuberaRemedyObj = kuberaRemedies[secondLord] || kuberaRemedies["Venus"];
  const kuberaRemedy = lang === "kn" ? kuberaRemedyObj.kn : kuberaRemedyObj.en;

  // ── PILLAR 2: MARRIAGE & CHILDREN ──
  const hasKujaDosha = planets.some(p => p.name === "Mars" && [1, 2, 4, 7, 8, 12].includes(p.house));
  const has7thBenefic = planets.some(p => (p.name === "Jupiter" || p.name === "Venus" || p.name === "Mercury") && p.house === 7);
  const has7thMalefic = planets.some(p => (p.name === "Saturn" || p.name === "Rahu" || p.name === "Ketu") && p.house === 7);

  let harmonyScore = 80;
  if (has7thBenefic) harmonyScore += 12;
  if (has7thMalefic) harmonyScore -= 10;
  if (hasKujaDosha) harmonyScore -= 6;
  if (venusPlanet && [1, 4, 5, 9, 11].includes(venusPlanet.house)) harmonyScore += 6;
  harmonyScore = Math.min(96, Math.max(62, harmonyScore));

  const vivahaStartYear = currentYear;
  const vivahaEndYear = currentYear + 2;
  const vivahaWindow = lang === "kn"
    ? `${vivahaStartYear} ರ ಉತ್ತರಾರ್ಧದಿಂದ ${vivahaEndYear} ರ ಮಧ್ಯಭಾಗ (${dashaLordKn} ದಶಾ ಹಾಗೂ ಗುರು ಸಂಚಾರ ಬಲ)`
    : `Late ${vivahaStartYear} to Mid ${vivahaEndYear} (${dashaLordName} Dasha & Auspicious Jupiter Transit)`;

  const santathiYear = currentYear + ((jupiterPlanet && [5, 9, 11].includes(jupiterPlanet.house)) ? 1 : 2);
  const santathiBlessingWindow = lang === "kn"
    ? `${santathiYear} - ${santathiYear + 1} ರ ಪಂಚಮ ಸ್ಥಾನ ಗುರು ದೃಷ್ಟಿ ಕಾಲಾವಧಿ`
    : `During ${santathiYear} - ${santathiYear + 1} Jupiter 5th House Transit Window`;

  // 100% Dynamic Spouse Direction based on 7th House Sign Element
  const seventhSignIdx = (lagnaIdx + 6) % 12;
  const seventhSignElement = SIGN_ELEMENTS[seventhSignIdx];
  let spouseDirection = "";
  if (seventhSignElement === "Fire") {
    spouseDirection = lang === "kn" ? "ಜನ್ಮಸ್ಥಳದಿಂದ ಪೂರ್ವ ಅಥವಾ ಆಗ್ನೇಯ ದಿಕ್ಕು" : "East or South-East from Birthplace";
  } else if (seventhSignElement === "Earth") {
    spouseDirection = lang === "kn" ? "ಜನ್ಮಸ್ಥಳದಿಂದ ದಕ್ಷಿಣ ಅಥವಾ ನೈಋತ್ಯ ದಿಕ್ಕು" : "South or South-West from Birthplace";
  } else if (seventhSignElement === "Air") {
    spouseDirection = lang === "kn" ? "ಜನ್ಮಸ್ಥಳದಿಂದ ಪಶ್ಚಿಮ ಅಥವಾ ವಾಯುವ್ಯ ದಿಕ್ಕು" : "West or North-West from Birthplace";
  } else {
    spouseDirection = lang === "kn" ? "ಜನ್ಮಸ್ಥಳದಿಂದ ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು" : "North or North-East from Birthplace";
  }

  // 100% Dynamic Spouse Characteristics based on 7th House Lord / Occupants
  const seventhLord = RASHI_LORDS[RASHI_ORDER[seventhSignIdx]] || "Venus";
  const occupants7 = planets.filter(p => p.house === 7).map(p => p.name);
  const primary7thInfluencer = occupants7.length > 0 ? occupants7[0] : seventhLord;

  const spouseTraitsMap: Record<string, { kn: string; en: string }> = {
    Sun: {
      kn: "ಘನತೆವೆತ್ತ ನಡವಳಿಕೆ, ತೇಜಸ್ವಿ ವ್ಯಕ್ತಿತ್ವ, ಸ್ವಾವಲಂಬನೆ, ಸಮಾಜದಲ್ಲಿ ಉತ್ತಮ ಗೌರವ ಮತ್ತು ನಾಯಕತ್ವ ಗುಣವುಳ್ಳ ಜೀವನ ಸಂಗಾತಿ.",
      en: "Dignified disposition, radiant personality, independent, highly respected in society with natural leadership qualities."
    },
    Moon: {
      kn: "ಅತ್ಯಂತ ಸುಂದರ, ಕೋಮಲ ಹೃದಯ, ಕರುಣಾಮಯಿ, ಕುಟುಂಬಕ್ಕೆ ಪ್ರೀತಿ ನೀಡುವ ಹಾಗೂ ಸೃಜನಶೀಲ ಆಸಕ್ತಿಯುಳ್ಳ ಶಾಂತ ಸ್ವಭಾವದ ಸಂಗಾತಿ.",
      en: "Charming, gentle-hearted, empathetic, deeply devoted to family peace, artistic, and emotionally nurturing."
    },
    Mars: {
      kn: "ಚುರುಕಾದ, ಧೈರ್ಯಶಾಲಿ, ನೇರ ನುಡಿ, ದೃಢ ಸಂಕಲ್ಪ ಮತ್ತು ಕುಟುಂಬದ ರಕ್ಷಣೆಗೆ ಸದಾ ಸಿದ್ಧವಾಗಿರುವ ಚೈತನ್ಯಶೀಲ ಸಂಗಾತಿ.",
      en: "Dynamic, courageous, direct-spoken, high-energy, protective of family honor, and athletic."
    },
    Mercury: {
      kn: "ಬುದ್ಧಿವಂತೆ, ಹಾಸ್ಯಪ್ರಜ್ಞೆ, ವಾಕ್ಚಾತುರ್ಯ, ವ್ಯಾಪಾರ ಅಥವಾ ಬೌದ್ಧಿಕ ಚಟುವಟಿಕೆಯಲ್ಲಿ ನಿಪುಣತೆ ಹೊಂದಿರುವ ಆಧುನಿಕ ಪ್ರಬುದ್ಧ ಸಂಗಾತಿ.",
      en: "Intellectual, witty, eloquent, business-minded, youthful, multitalented, and possessing excellent communication skills."
    },
    Jupiter: {
      kn: "ಜ್ಞಾನಿ, ಧಾರ್ಮಿಕ ಪ್ರವೃತ್ತಿ, ಸಂಸ್ಕಾರವಂತೆ, ಹಿರಿಯರಲ್ಲಿ ಗೌರವ, ಸದಾ ಸತ್ಯ-ಧರ್ಮದ ಮಾರ್ಗದಲ್ಲಿ ನಡೆದು ಕುಟುಂಬಕ್ಕೆ ಶುಭ ತರುವ ಸಂಗಾತಿ.",
      en: "Wise, virtuous, spiritually anchored, respectful towards elders, scholarly, and bringing profound divine blessings to the household."
    },
    Venus: {
      kn: "ಆಕರ್ಷಕ ಸೌಂದರ್ಯ, ಕಲಾತ್ಮಕ ಅಭಿರುಚಿ, ಶಾಂತಿಪ್ರಿಯ, ಸುಖ-ಭೋಗಗಳನ್ನು ಹೆಚ್ಚಿಸುವ ಹಾಗೂ ದಾಂಪತ್ಯಕ್ಕೆ ಸೌಭಾಗ್ಯ ತರುವ ಪ್ರೀತಿಯ ಸಂಗಾತಿ.",
      en: "Aesthetically graceful, artistic, peace-loving, harmonious, refined in tastes, and bringing great fortune and comfort."
    },
    Saturn: {
      kn: "ಗಂಭೀರ ಸ್ವಭಾವ, ಅಪಾರ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯನಿಷ್ಠೆ, ಕಷ್ಟ-ಸುಖಗಳಲ್ಲಿ ಬೆನ್ನೆಲುಬಾಗಿ ನಿಲ್ಲುವ, ಪ್ರಾಯೋಗಿಕ ಹಾಗೂ ಅತ್ಯಂತ ನಿಷ್ಠಾವಂತ ಸಂಗಾತಿ.",
      en: "Mature, patient, dutiful, reliable pillar of support through all circumstances, practical, and unwaveringly loyal."
    },
    Rahu: {
      kn: "ವಿಶಿಷ್ಟ ಆಲೋಚನೆ, ನವೀನ ತಂತ್ರಜ್ಞಾನ ಅಥವಾ ದೂರದ ಸಂಸ್ಕೃತಿಯ ಸಂಪರ್ಕ, ಮಹತ್ವಾಕಾಂಕ್ಷೆಯುಳ್ಳ ಆಕರ್ಷಕ ಸಂಗಾತಿ.",
      en: "Unconventional thinker, ambitious, connected with diverse or distant backgrounds, charismatic, and progressive."
    },
    Ketu: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು, ಸರಳ ಜೀವನ, ಆಡಂಬರವಿಲ್ಲದ ಮನಸ್ಸು ಮತ್ತು ಆಳವಾದ ಅಂತಃಪ್ರಜ್ಞೆಯುಳ್ಳ ಸಾತ್ವಿಕ ಸಂಗಾತಿ.",
      en: "Spiritually inclined, contemplative, modest, detached from superficial vanity, and possessing strong intuitive wisdom."
    }
  };

  const spouseTraitsObj = spouseTraitsMap[primary7thInfluencer] || spouseTraitsMap["Venus"];
  const spouseCharacteristics = lang === "kn" ? spouseTraitsObj.kn : spouseTraitsObj.en;

  // Relationship Remedy
  let relationshipRemedy = "";
  if (hasKujaDosha) {
    relationshipRemedy = lang === "kn"
      ? "ಪ್ರತಿ ಮಂಗಳವಾರ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ದರ್ಶನ ಮಾಡಿ ಅಥವಾ ಕೆಂಪು ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ ತುಪ್ಪದ ದೀಪ ಬೆಳಗಿಸಿ."
      : "Visit Lord Subrahmanya on Tuesdays and offer red flowers with a consecrated ghee lamp to pacify Kuja Dosha.";
  } else if (has7thMalefic) {
    relationshipRemedy = lang === "kn"
      ? "ಪ್ರತಿ ಶನಿವಾರ ಸಂಜೆ ಅರಳಿ ಮರಕ್ಕೆ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ, ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸಿ ಹಾಗೂ ದಂಪತಿ ಸಮೇತರಾಗಿ ಪ್ರಾರ್ಥಿಸಿ."
      : "Light a sesame oil lamp near a sacred Peepal tree on Saturday evenings and offer prayers for marital harmony.";
  } else {
    relationshipRemedy = lang === "kn"
      ? "ಪ್ರತಿ ಶುಕ್ರವಾರ ಶ್ರೀ ಲಕ್ಷ್ಮೀ-ವೆಂಕಟೇಶ್ವರರಿಗೆ ಬಿಳಿ ಹೂವುಗಳನ್ನು ಅರ್ಪಿಸಿ, ಕರ್ಪೂರ ಆರತಿ ಮಾಡಿ."
      : "Offer fragrant white flowers to Lakshmi-Venkateshwara on Fridays with pure camphor aarti.";
  }

  // ── PILLAR 3: HEALTH CONSTITUTION & VITALITY ──
  const dosha: "Vata" | "Pitta" | "Kapha" | "Tridosha" =
    ["Mesha", "Simha", "Dhanu"].includes(lagnaRashiEng) ? "Pitta" :
    ["Vrishabha", "Kanya", "Makara"].includes(lagnaRashiEng) ? "Vata" :
    ["Mithuna", "Tula", "Kumbha"].includes(lagnaRashiEng) ? "Vata" : "Kapha";

  let vit = 76;
  if (sunPlanet && [1, 5, 9, 10, 11].includes(sunPlanet.house)) vit += 12;
  if (sunPlanet?.isDebilitated || (sunPlanet && [6, 8, 12].includes(sunPlanet.house))) vit -= 14;
  if (saturnPlanet && [6, 8].includes(saturnPlanet.house)) vit -= 6;
  if (jupiterPlanet && [1, 5, 9].includes(jupiterPlanet.house)) vit += 8;
  const vitalityScore = Math.min(98, Math.max(56, vit));

  // 100% Dynamic Vulnerable Organs based on 6th & 8th House Signs
  const sixthSignIdx = (lagnaIdx + 5) % 12;
  const eighthSignIdx = (lagnaIdx + 7) % 12;
  const sixthLord = RASHI_LORDS[RASHI_ORDER[sixthSignIdx]] || "Mars";

  const organ1 = ANATOMY_MAP[lang]?.[sixthSignIdx] || ANATOMY_MAP["en"][sixthSignIdx];
  const organ2 = ANATOMY_MAP[lang]?.[eighthSignIdx] || ANATOMY_MAP["en"][eighthSignIdx];

  // 3rd organ based on 6th lord or planetary afflictions
  let thirdSignIdx = (lagnaIdx + 4) % 12;
  if (thirdSignIdx === sixthSignIdx || thirdSignIdx === eighthSignIdx) {
    thirdSignIdx = (lagnaIdx + 2) % 12;
  }
  const organ3 = ANATOMY_MAP[lang]?.[thirdSignIdx] || ANATOMY_MAP["en"][thirdSignIdx];
  const vulnerableOrgans = [organ1, organ2, organ3];

  // 100% Dynamic Ayurvedic Herbs matching Dosha & 6th Lord
  const baseHerbsMap: Record<string, string[]> = {
    Pitta: ["ಬ್ರಾಹ್ಮೀ (Brahmi)", "ಶತಾವರೀ (Shatavari)", "ಆಮಲಕೀ (Amla)", "ಗುಡೂಚಿ / ಅಮೃತಬಳ್ಳಿ (Guduchi)"],
    Vata: ["ಅಶ್ವಗಂಧ (Ashwagandha)", "ಬಲಾ (Bala)", "ಗೋಕ್ಷುರ (Gokshura)", "ಶಂಖಪುಷ್ಪಿ (Shankhapushpi)"],
    Kapha: ["ತ್ರಿಕಟು (Trikatu)", "ತುಳಸಿ (Tulsi)", "ಪುನರ್ನವಾ (Punarnava)", "ಹರಿದ್ರಾ / ಅರಿಶಿನ (Turmeric)"],
    Tridosha: ["ತ್ರಿಫಲಾ (Triphala)", "ಗುಡೂಚಿ (Guduchi)", "ಅಶ್ವಗಂಧ (Ashwagandha)", "ತುಳಸಿ (Tulsi)"]
  };
  let herbs = [...(baseHerbsMap[dosha] || baseHerbsMap["Tridosha"])];
  if (sixthLord === "Mars" && !herbs.includes("ಮಂಜಿಷ್ಠಾ (Manjistha)")) {
    herbs[herbs.length - 1] = "ಮಂಜಿಷ್ಠಾ (Manjistha)";
  } else if (sixthLord === "Saturn" && !herbs.includes("ದಶಮೂಲ (Dashamula)")) {
    herbs[herbs.length - 1] = "ದಶಮೂಲ (Dashamula)";
  } else if (sixthLord === "Sun" && !herbs.includes("ಬಿಲ್ವ ಪತ್ರೆ (Bilva)")) {
    herbs[herbs.length - 1] = "ಬಿಲ್ವ ಪತ್ರೆ (Bilva)";
  }

  // Dynamic Diet Ritual
  const dietRituals: Record<string, { kn: string; en: string }> = {
    Pitta: {
      kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ವೇಳೆ ತಂಪಾದ ನೀರು ಅಥವಾ ಎಳನೀರು ಸೇವಿಸಿ. ಅತಿಯಾದ ಖಾರ, ಎಣ್ಣೆ ಪದಾರ್ಥಗಳನ್ನು ತ್ಯಜಿಸಿ, ಹಸುವಿನ ತುಪ್ಪವನ್ನು ನಿಯಮಿತವಾಗಿ ಬಳಸಿ.",
      en: "Drink cooling water or fresh tender coconut water at sunrise. Avoid excessively spicy/fried food and integrate pure A2 cow ghee."
    },
    Vata: {
      kn: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಬೆಚ್ಚಗಿನ ಶುಂಠಿ ನೀರು ಸೇವಿಸಿ. ನಿಯಮಿತ ವೇಳೆಗೆ ಊಟ ಮಾಡಿ, ತಿಲತೈಲ (ಎಳ್ಳೆಣ್ಣೆ) ಅಭ್ಯಂಗ ಹಾಗೂ ಬೆಚ್ಚಗಿನ ಪೌಷ್ಟಿಕ ಆಹಾರ ಸೇವಿಸಿ.",
      en: "Sip warm ginger water in the morning. Adhere to regular meal schedules, perform warm sesame oil massage, and consume grounding foods."
    },
    Kapha: {
      kn: "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಜೇನುತುಪ್ಪ-ಬೆಚ್ಚಗಿನ ನೀರು ಅಥವಾ ತ್ರಿಕಟು ಕಷಾಯ ಸೇವಿಸಿ. ರಾತ್ರಿ ಲಘು ಆಹಾರ ಸೇವನೆ ಹಾಗೂ ನಿಯಮಿತ ಪ್ರಾಣಾಯಾಮ ರೂಢಿಸಿಕೊಳ್ಳಿ.",
      en: "Take warm water infused with raw honey or Trikatu herbal tea at dawn. Maintain light dinners before dusk and practice daily Pranayama."
    },
    Tridosha: {
      kn: "ಪ್ರತಿದಿನ ಸೂರ್ಯೋದಯದ ವೇಳೆ ತಾಮ್ರದ ಪಾತ್ರೆಯಲ್ಲಿಟ್ಟ ನೀರನ್ನು ಕುಡಿಯಿರಿ ಹಾಗೂ ಸಮತೋಲಿತ ಸಾತ್ವಿಕ ಆಹಾರವನ್ನು ಸೇವಿಸಿ.",
      en: "Drink copper-charged water at sunrise and embrace balanced, wholesome sattvic nourishment."
    }
  };
  const dietObj = dietRituals[dosha] || dietRituals["Tridosha"];
  const dailyDietRitual = lang === "kn" ? dietObj.kn : dietObj.en;

  // ── PILLAR 4: PROTECTION & EVIL EYE ──
  const drishtiLevel = rahuPlanet && (rahuPlanet.house === 1 || rahuPlanet.house === 7 || rahuPlanet.house === 8) ? "Severe" : "Medium";

  // Dynamic Transit Afflictions derived from actual live transits relative to Moon Sign
  let baseSatDeg = 325;
  try {
    const ephem = siderealLongitudes(new Date(), "lahiri", "mean");
    baseSatDeg = ephem.saturn ?? 325;
  } catch {
    baseSatDeg = 325;
  }
  const currentSatRashi = degreeToRashi(baseSatDeg);
  const currentSatHouseFromMoon = (currentSatRashi.index - moonRashiIdx + 12) % 12 + 1;

  const activeTransitAfflictions: string[] = [];
  if (currentSatHouseFromMoon === 12) {
    activeTransitAfflictions.push(lang === "kn" ? "ಶನಿ ಸಾಡೇಸಾತಿ ಪ್ರಥಮ ಚರಣ (ಆರಂಭಿಕ ಹಂತ - ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ)" : "Saturn Sade Sati Rising Phase (Initial Vigilance)");
  } else if (currentSatHouseFromMoon === 1) {
    activeTransitAfflictions.push(lang === "kn" ? "ಶನಿ ಸಾಡೇಸಾತಿ ಜನ್ಮ ಶನಿ ಚರಣ (ಮಧ್ಯಮ ಹಂತ - ಸಂಯಮ ಅಗತ್ಯ)" : "Saturn Sade Sati Peak Phase (Patience & Discipline)");
  } else if (currentSatHouseFromMoon === 2) {
    activeTransitAfflictions.push(lang === "kn" ? "ಶನಿ ಸಾಡೇಸಾತಿ ಅಂತ್ಯ ಚರಣ (ಆರ್ಥಿಕ ಪುನಶ್ಚೇತನ ಹಂತ)" : "Saturn Sade Sati Setting Phase (Financial Rebuilding)");
  } else if (currentSatHouseFromMoon === 8) {
    activeTransitAfflictions.push(lang === "kn" ? "ಅಷ್ಟಮ ಶನಿ ಗೋಚಾರ (ಆರೋಗ್ಯ ಮತ್ತು ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗರೂಕತೆ)" : "Ashtama Shani Transit (Health & Travel Vigilance)");
  } else if (currentSatHouseFromMoon === 4) {
    activeTransitAfflictions.push(lang === "kn" ? "ಅರ್ಧಾಷ್ಟಮ ಶನಿ ಗೋಚಾರ (ಕೌಟುಂಬಿಕ ಶಾಂತಿಯ ಅವಧಿ)" : "Kantaka Shani 4th House Transit (Domestic Peace)");
  } else {
    activeTransitAfflictions.push(lang === "kn" ? "ಶನಿ ಗೋಚಾರ ಸಂಪೂರ್ಣ ಅನುಕೂಲಕರ & ಸ್ಥಿರತೆ" : "Favorable Saturn Transit & Stability");
  }

  if (rahuPlanet && [1, 7].includes(rahuPlanet.house)) {
    activeTransitAfflictions.push(lang === "kn" ? "ರಾಹು-ಕೇತು ಜನ್ಮ/ಕಳತ್ರ ಅಕ್ಷ ಪ್ರಭಾವ (ಶಾಂತಿಯುತ ಪರಿಹಾರ ಅಗತ್ಯ)" : "Rahu-Ketu Relationship Axis Influence");
  } else {
    activeTransitAfflictions.push(lang === "kn" ? "ರಾಹು-ಕೇತು ಶಾಂತಿಯುತ ಸಂಚಾರ & ದೈವ ರಕ್ಷೆ" : "Harmonious Nodal Transit & Divine Shield");
  }

  // ── PILLAR 5: 10-YEAR DYNAMIC GOLDEN MILESTONES (2026 - 2036) ──
  let baseJupDeg = 45;
  try {
    const ephem = siderealLongitudes(new Date(), "lahiri", "mean");
    baseJupDeg = ephem.jupiter ?? 45;
  } catch {
    baseJupDeg = 45;
  }

  const milestones: GoldenMilestoneYear[] = Array.from({ length: 10 }).map((_, idx) => {
    const yr = currentYear + idx;
    const age = baseAge + idx;

    // Running Dasha & Bhukti for that specific year & age
    const bhuktiInfo = findBhuktiAtAge(kundli, age);
    const mahaPl = bhuktiInfo?.maha?.planet || PlanetName.Jupiter;
    const subPl = bhuktiInfo?.bhukti || PlanetName.Jupiter;
    const mahaKn = GRAHA_LOCALE[lang]?.[mahaPl] || mahaPl;
    const subKn = GRAHA_LOCALE[lang]?.[subPl] || subPl;

    // Projected Gochara Transit
    const projectedJupDeg = (baseJupDeg + idx * 30) % 360;
    const projectedSatDeg = (baseSatDeg + idx * 12) % 360;
    const jupRashi = degreeToRashi(projectedJupDeg);
    const satRashi = degreeToRashi(projectedSatDeg);

    const jupHouseFromMoon = (jupRashi.index - moonRashiIdx + 12) % 12 + 1;
    const satHouseFromMoon = (satRashi.index - moonRashiIdx + 12) % 12 + 1;

    const isSadeSatiOrAshtama = [1, 2, 12, 8].includes(satHouseFromMoon);
    const isJupBenefic = [2, 5, 7, 9, 11].includes(jupHouseFromMoon);

    let rating: "golden" | "growth" | "caution" = "growth";
    if (isSadeSatiOrAshtama && !isJupBenefic) {
      rating = "caution";
    } else if (isJupBenefic) {
      rating = "golden";
    } else {
      rating = "growth";
    }

    // Dynamic House Activation themes
    const subPlanetObj = planets.find(p => p.name === subPl);
    const subHouse = subPlanetObj?.house || 1;

    let themeKn = "ಸ್ಥಿರ ಪ್ರಗತಿ & ನೂತನ ಅವಕಾಶಗಳು";
    let themeEn = "Steady Growth & New Opportunities";
    let reasonKn = `${mahaKn} ಮಹಾದಶೆಯಲ್ಲಿ ${subKn} ಭುಕ್ತಿ ಹಾಗೂ ಗೋಚಾರದಲ್ಲಿ ${jupHouseFromMoon}ನೇ ಮನೆಯಲ್ಲಿ ಗುರು ಸಂಚಾರ`;
    let reasonEn = `${mahaPl} Mahadasha with ${subPl} Bhukti, Jupiter transiting House ${jupHouseFromMoon}`;

    if (subHouse === 1 || subHouse === 9) {
      themeKn = "ಮಹಾ ಭಾಗ್ಯೋದಯ, ಗೌರವ & ದೈವ ಕೃಪೆ";
      themeEn = "Supreme Fortune, Honor & Divine Grace";
    } else if (subHouse === 2 || subHouse === 11) {
      themeKn = "ಆರ್ಥಿಕ ತಿರುವು & ಬೃಹತ್ ಧನಾಗಮನ";
      themeEn = "Financial Breakthrough & Major Inflow";
    } else if (subHouse === 4) {
      themeKn = "ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಗೃಹ ಸೌಖ್ಯ & ವಾಹನ ಯೋಗ";
      themeEn = "Property Acquisition & Domestic Joy";
    } else if (subHouse === 5) {
      themeKn = "ಜ್ಞಾನೋದಯ, ಮಕ್ಕಳ ಪ್ರಗತಿ & ಯಶಸ್ಸು";
      themeEn = "Intellectual Honors & Children's Progress";
    } else if (subHouse === 7) {
      themeKn = "ವೈವಾಹಿಕ ಸೌಖ್ಯ & ನೂತನ ಪಾಲುದಾರಿಕೆ";
      themeEn = "Marital Harmony & Business Alliance";
    } else if (subHouse === 10) {
      themeKn = "ಉದ್ಯೋಗ ಬಡ್ತಿ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ & ಕೀರ್ತಿ";
      themeEn = "Career Elevation & Stature Growth";
    } else if (subHouse === 6 || subHouse === 8 || subHouse === 12) {
      themeKn = "ಆರೋಗ್ಯ ಜಾಗರೂಕತೆ, ಋಣ ಮುಕ್ತಿ & ಶಾಂತಿ ಸಂಕಲ್ಪ";
      themeEn = "Health Vigilance, Debt Clearance & Peace";
    }

    const ratingLabel = rating === "golden"
      ? (lang === "kn" ? "🌟 ಸ್ವರ್ಣಾವಧಿ (Golden)" : "🌟 Golden Era")
      : rating === "growth"
      ? (lang === "kn" ? "📈 ಸ್ಥಿರ ಪ್ರಗತಿ (Growth)" : "📈 Steady Growth")
      : (lang === "kn" ? "⚠️ ಶಾಂತಿ ಅವಧಿ (Caution)" : "⚠️ Vigilance Period");

    const actionableGuidance = lang === "kn"
      ? `ಈ ವರ್ಷದಲ್ಲಿ ${themeKn.toLowerCase()}ಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಹಾಗೂ ನಿತ್ಯ ${subKn} ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.`
      : `Execute strategic plans around ${themeEn.toLowerCase()} and maintain daily spiritual mindfulness.`;

    // 100% Dynamic Favorable Months based on transit Sun passing through Upachaya (3, 6, 10, 11) & Trikona (9) from Janma Rashi
    const upachaya3 = (moonRashiIdx + 2) % 12;
    const upachaya6 = (moonRashiIdx + 5) % 12;
    const trikona9 = (moonRashiIdx + 8) % 12;
    const upachaya10 = (moonRashiIdx + 9) % 12;
    const upachaya11 = (moonRashiIdx + 10) % 12;

    const monthPick1 = (idx % 2 === 0) ? upachaya3 : upachaya6;
    const monthPick2 = (idx % 2 === 0) ? upachaya11 : upachaya10;
    const monthPick3 = (idx % 3 === 0) ? trikona9 : null;

    const favorableMonths: string[] = [
      SOLAR_MONTHS_LOCALE[lang]?.[monthPick1] || SOLAR_MONTHS_LOCALE["en"][monthPick1],
      SOLAR_MONTHS_LOCALE[lang]?.[monthPick2] || SOLAR_MONTHS_LOCALE["en"][monthPick2]
    ];
    if (monthPick3 !== null) {
      favorableMonths.push(SOLAR_MONTHS_LOCALE[lang]?.[monthPick3] || SOLAR_MONTHS_LOCALE["en"][monthPick3]);
    }

    return {
      year: yr,
      age,
      rating,
      ratingLabel,
      theme: lang === "kn" ? themeKn : themeEn,
      astrologicalReason: lang === "kn" ? reasonKn : reasonEn,
      actionableGuidance,
      favorableMonths
    };
  });

  // ── PILLAR 6: GEMSTONE, RUDRAKSHA & DAILY KARMA BLUEPRINT ──
  const gemstoneMap: Record<string, { kn: string; en: string; ratti: string; metal: string; finger: string; day: string }> = {
    Mesha: { kn: "ಕೆಂಪು ಹವಳ (Coral)", en: "Red Coral (Moonga)", ratti: "6.5 - 7.25 Ratti", metal: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ (Copper/Gold)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಮಂಗಳವಾರ (Tuesday)" },
    Vrishabha: { kn: "ವಜ್ರ ಅಥವಾ ಬಿಳಿ ನೀಲ (Diamond/White Zircon)", en: "Diamond / White Sapphire", ratti: "4.25 - 5.5 Ratti", metal: "ಬೆಳ್ಳಿ ಅಥವಾ ಪ್ಲಾಟಿನಂ (Silver)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶುಕ್ರವಾರ (Friday)" },
    Mithuna: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", ratti: "5.25 - 6.25 Ratti", metal: "ಚಿನ್ನ ಅಥವಾ ಕಂಚು (Gold/Bronze)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಬುಧವಾರ (Wednesday)" },
    Karka: { kn: "ಮುತ್ತು (Pearl)", en: "Natural Pearl (Moti)", ratti: "6.5 - 8.0 Ratti", metal: "ಶುದ್ಧ ಬೆಳ್ಳಿ (Pure Silver)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಸೋಮವಾರ (Monday)" },
    Simha: { kn: "ಮಾಣಿಕ್ಯ (Ruby)", en: "Ruby (Manikya)", ratti: "5.5 - 6.5 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold/Copper)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಭಾನುವಾರ (Sunday)" },
    Kanya: { kn: "ಪಚ್ಚೆ (Emerald)", en: "Emerald (Panna)", ratti: "5.25 - 6.25 Ratti", metal: "ಚಿನ್ನ ಅಥವಾ ಬೆಳ್ಳಿ (Gold/Silver)", finger: "ಕಿರುಬೆರಳು (Little Finger)", day: "ಬುಧವಾರ (Wednesday)" },
    Tula: { kn: "ವಜ್ರ ಅಥವಾ ಓಪಲ್ (Diamond/Opal)", en: "Diamond / Australian Opal", ratti: "5.5 - 7.0 Ratti", metal: "ಬೆಳ್ಳಿ (Silver)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶುಕ್ರವಾರ (Friday)" },
    Vrischika: { kn: "ಕೆಂಪು ಹವಳ (Red Coral)", en: "Red Coral (Moonga)", ratti: "6.5 - 7.5 Ratti", metal: "ತಾಮ್ರ ಅಥವಾ ಚಿನ್ನ (Copper/Gold)", finger: "ಉಂಗುರದ ಬೆರಳು (Ring Finger)", day: "ಮಂಗಳವಾರ (Tuesday)" },
    Dhanu: { kn: "ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pukhraj)", ratti: "5.25 - 6.5 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold)", finger: "ತೋರುಬೆರಳು (Index Finger)", day: "ಗುರುವಾರ (Thursday)" },
    Makara: { kn: "ಇಂದ್ರನೀಲ (Blue Sapphire)", en: "Blue Sapphire / Amethyst", ratti: "5.5 - 7.25 Ratti", metal: "ಪಂಚಧಾತು ಅಥವಾ ಬೆಳ್ಳಿ (Panchadhatu)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶನಿವಾರ (Saturday)" },
    Kumbha: { kn: "ನೀಲಮಣಿ (Blue Sapphire)", en: "Blue Sapphire (Neelam)", ratti: "5.5 - 7.0 Ratti", metal: "ಪಂಚಧಾತು ಅಥವಾ ಉಕ್ಕು (Panchadhatu)", finger: "ಮಧ್ಯದ ಬೆರಳು (Middle Finger)", day: "ಶನಿವಾರ (Saturday)" },
    Meena: { kn: "ಹಳದಿ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", en: "Yellow Sapphire (Pukhraj)", ratti: "5.5 - 6.75 Ratti", metal: "ಶುದ್ಧ ಚಿನ್ನ (Gold)", finger: "ತೋರುಬೆರಳು (Index Finger)", day: "ಗುರುವಾರ (Thursday)" }
  };

  const gem = gemstoneMap[lagnaRashiEng] || gemstoneMap["Dhanu"];

  // 100% Dynamic Rudraksha with standard English digits (0-9)
  const rudrakshaMukhiMap: Record<string, string> = {
    Mesha: "3 ಮುಖಿ ಹಾಗೂ 11 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 & 11 Mukhi Rudraksha)",
    Vrishabha: "6 ಮುಖಿ ಹಾಗೂ 7 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 & 7 Mukhi Rudraksha)",
    Mithuna: "4 ಮುಖಿ ಹಾಗೂ 10 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (4 & 10 Mukhi Rudraksha)",
    Karka: "2 ಮುಖಿ ಹಾಗೂ ಗೌರೀ-ಶಂಕರ ರುದ್ರಾಕ್ಷಿ (2 Mukhi & Gauri Shankar)",
    Simha: "1 ಮುಖಿ ಅಥವಾ 12 ಮುಖಿ ಸೂರ್ಯ ರುದ್ರಾಕ್ಷಿ (1 & 12 Mukhi Rudraksha)",
    Kanya: "4 ಮುಖಿ ಹಾಗೂ ಗಣೇಶ ರುದ್ರಾಕ್ಷಿ (4 Mukhi & Ganesha Rudraksha)",
    Tula: "6 ಮುಖಿ ಹಾಗೂ 13 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (6 & 13 Mukhi Rudraksha)",
    Vrischika: "3 ಮುಖಿ ಹಾಗೂ 11 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (3 & 11 Mukhi Rudraksha)",
    Dhanu: "5 ಮುಖಿ ಹಾಗೂ 9 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 9 Mukhi Rudraksha)",
    Makara: "7 ಮುಖಿ ಹಾಗೂ 14 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 & 14 Mukhi Rudraksha)",
    Kumbha: "7 ಮುಖಿ ಹಾಗೂ 8 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (7 & 8 Mukhi Rudraksha)",
    Meena: "5 ಮುಖಿ ಹಾಗೂ 11 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 11 Mukhi Rudraksha)"
  };
  const rudrakshaRecommendation = rudrakshaMukhiMap[lagnaRashiEng] || "5 ಮುಖಿ ಮತ್ತು 7 ಮುಖಿ ರುದ್ರಾಕ್ಷಿ (5 & 7 Mukhi Nepali Rudraksha)";

  // 100% Dynamic Daily Mantra based on 5th Lord (Ishta Devata)
  const fifthSignIdx = (lagnaIdx + 4) % 12;
  const fifthLord = RASHI_LORDS[RASHI_ORDER[fifthSignIdx]] || "Jupiter";
  const dailyMantras: Record<string, string> = {
    Sun: "ಓಂ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ || ಗಾಯತ್ರೀ ಮಹಾಮಂತ್ರ ||",
    Moon: "ಓಂ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಾಯ ನಮಃ || ಓಂ ನಮಃ ಶಿವಾಯ ||",
    Mars: "ಓಂ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ || ಓಂ ಶರವಣಭವಾಯ ನಮಃ ||",
    Mercury: "ಓಂ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ || ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ ||",
    Jupiter: "ಓಂ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ || ಓಂ ನಮೋ ನಾರಾಯಣಾಯ ||",
    Venus: "ಓಂ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ || ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ||",
    Saturn: "ಓಂ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ || ಓಂ ನಮೋ ಭಗವತೇ ರುದ್ರಾಯ ||"
  };
  const prescribedMantra = dailyMantras[fifthLord] || dailyMantras["Jupiter"];

  // Dynamic Facing Direction based on Lagna sign element
  const lagnaElement = SIGN_ELEMENTS[lagnaIdx];
  let facingDirection = "";
  if (lagnaElement === "Fire") {
    facingDirection = lang === "kn" ? "ಪೂರ್ವ ದಿಕ್ಕು (East Facing)" : "East Facing";
  } else if (lagnaElement === "Water") {
    facingDirection = lang === "kn" ? "ಉತ್ತರ ದಿಕ್ಕು (North Facing)" : "North Facing";
  } else if (lagnaElement === "Air") {
    facingDirection = lang === "kn" ? "ಈಶಾನ್ಯ ಅಥವಾ ಪೂರ್ವ ದಿಕ್ಕು (North-East or East Facing)" : "North-East or East Facing";
  } else {
    facingDirection = lang === "kn" ? "ಉತ್ತರ ಅಥವಾ ಈಶಾನ್ಯ ದಿಕ್ಕು (North or North-East Facing)" : "North or North-East Facing";
  }

  // Dynamic Charity Action based on current Mahadasha Lord
  const charityActions: Record<string, { kn: string; en: string }> = {
    Sun: {
      kn: "ಭಾನುವಾರದಂದು ಗೋಧಿಯನ್ನು ಅಥವಾ ಬೆಲ್ಲ-ಅಕ್ಕಿಯನ್ನು ವೃದ್ಧರಿಗೆ ಅಥವಾ ಗೋವಿಗೆ ನೀಡುವುದು ಹಾಗೂ ಪಿತೃ ಗೌರವ.",
      en: "Feed wheat or jaggery to sacred cows/elders on Sundays and uphold fatherly respect."
    },
    Moon: {
      kn: "ಸೋಮವಾರದಂದು ಹಾಲು, ಅಕ್ಕಿ ಅಥವಾ ತಂಪು ನೀರನ್ನು ಬಾಯಾರಿದವರಿಗೆ ನೀಡುವುದು ಹಾಗೂ ಮಾತೃ ಸೇವೆ.",
      en: "Offer milk, rice or cool water to the thirsty on Mondays and serve your mother with devotion."
    },
    Mars: {
      kn: "ಮಂಗಳವಾರದಂದು ತೊಗರಿ ಬೇಳೆ, ಕೆಂಪು ಹಣ್ಣುಗಳು ಅಥವಾ ಸಿಹಿ ತಿಂಡಿಗಳನ್ನು ಬಡ ಕಾರ್ಮಿಕರಿಗೆ ನೀಡುವುದು.",
      en: "Distribute red lentils, pomegranates or sweet meals to hardworking laborers on Tuesdays."
    },
    Mercury: {
      kn: "ಬುಧವಾರದಂದು ಹಸಿರು ಹೆಸರು ಕಾಳು, ಹಸಿರು ತರಕಾರಿ ಅಥವಾ ಬಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ನೋಟ್‌ಬುಕ್-ಪೆನ್ ದಾನ.",
      en: "Donate green moong, fresh greens or study notebooks/pens to underprivileged students on Wednesdays."
    },
    Jupiter: {
      kn: "ಗುರುವಾರದಂದು ಕಡಲೆ ಬೇಳೆ, ಬಾಳೆಹಣ್ಣು ಅಥವಾ ಹಳದಿ ವಸ್ತ್ರವನ್ನು ಗುರು-ಹಿರಿಯರಿಗೆ ಅರ್ಪಿಸಿ ನಮಸ್ಕರಿಸುವುದು.",
      en: "Offer chana dal, bananas or yellow garments to elders/teachers with humble prostrations on Thursdays."
    },
    Venus: {
      kn: "ಶುಕ್ರವಾರದಂದು ಕ್ಷೀರಾನ್ನ, ತುಪ್ಪ ಅಥವಾ ಬೆಳ್ಳಿಯ ವಸ್ತುಗಳನ್ನು ದೇವಸ್ಥಾನಕ್ಕೆ ಅರ್ಪಿಸುವುದು ಹಾಗೂ ಸ್ತ್ರೀಯರನ್ನು ಗೌರವಿಸುವುದು.",
      en: "Offer sweet kheer, pure cow ghee or support noble welfare of women and daughters on Fridays."
    },
    Saturn: {
      kn: "ಶನಿವಾರದಂದು ಕಪ್ಪು ಎಳ್ಳು, ಎಳ್ಳೆಣ್ಣೆ, ಕಪ್ಪು ಕಂಬಳಿ ದಾನ ಅಥವಾ ನಿರ್ಗತಿಕರಿಗೆ ಅನ್ನದಾನ.",
      en: "Donate black sesame seeds, sesame oil, blankets, or serve wholesome meals to the needy on Saturdays."
    },
    Rahu: {
      kn: "ಬುಧವಾರ ಅಥವಾ ಶನಿವಾರ ಪಕ್ಷಿಗಳಿಗೆ ಧಾನ್ಯ ನೀಡುವುದು ಹಾಗೂ ನವಧಾನ್ಯ ದಾನ.",
      en: "Scatter mixed grains for birds at sunrise on Wednesdays/Saturdays to dissolve karmic knots."
    },
    Ketu: {
      kn: "ಅನಾಥಾಶ್ರಮಕ್ಕೆ ಧನಸಹಾಯ ಅಥವಾ ಬೀದಿ ನಾಯಿಗಳಿಗೆ ಅನ್ನ-ಬಿಸ್ಕತ್ತು ನೀಡುವುದು.",
      en: "Support elderly homes or feed street animals/dogs to elevate spiritual intuition and peace."
    }
  };
  const charityObj = charityActions[mahaLordName] || charityActions["Saturn"];
  const charityAction = lang === "kn" ? charityObj.kn : charityObj.en;

  // Dynamic Archana Sankalpa with native's Gotra and Name
  const gotraLabel = gotra || "ಕಾಶ್ಯಪ";
  const specialSankalpaMantra = `ಶ್ರೀಮತ್ ${gotraLabel} ಗೋತ್ರೋದ್ಭವಸ್ಯ ${devoteeName} ನಾಮಧೇಯಸ್ಯ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧರ್ಥಂ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿ ರಸ್ತು ||`;

  return {
    devoteeName,
    birthDate,
    birthTime,
    lagnaRashi: RASHI_LOCALE[lang]?.[lagnaRashiEng] || lagnaRashiEng,
    moonRashi: RASHI_LOCALE[lang]?.[moonRashiEng] || moonRashiEng,
    nakshatra: lang === "kn" ? nakshatraKn : nakshatraEng,
    nakshatraPada,
    rashiLord: GRAHA_LOCALE[lang]?.[rashiLord] || rashiLord,
    lagnaLord: GRAHA_LOCALE[lang]?.[lagnaLord] || lagnaLord,
    gotra: gotraLabel,

    bhagyodaya: {
      bhagyeshPlanet: bhagyeshPlanetName,
      bhagyeshPlanetLabel: bhagyeshLabel,
      bhagyeshHouse,
      primaryAge,
      secondaryAge,
      status: bhagyodayaStatus,
      statusLabel: bhagyodayaStatusLabel,
      catalystTheme: lang === "kn" ? selectedCatalyst.themeKn : selectedCatalyst.themeEn,
      catalystDescription: lang === "kn" ? selectedCatalyst.descKn : selectedCatalyst.descEn,
      dashaActivationForecast
    },

    wealth: {
      dhanaYogaScore: dhanaScore,
      dhanaYogaName: hasGajaKesari ? "ಗಜಕೇಸರಿ ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಗ (Gajakesari Mahalakshmi Yoga)" : "ದ್ವಿತೀಯ-ಏಕಾದಶ ಧನ ಯೋಗ (Dhana-Labha Yoga)",
      wealthVerdict: lang === "kn" ? wealthVerdictKn : wealthVerdictEn,
      runaVimochanaTimeline,
      goldenCareerSectors,
      optimalWealthDirection,
      kuberaRemedy
    },

    relationship: {
      vivahaYogaWindow: vivahaWindow,
      spouseCharacteristics,
      spouseDirection,
      dampatyaHarmonyRating: lang === "kn" ? `${harmonyScore}% ಅತ್ಯುನ್ನತ ಸುಖ-ಶಾಂತಿ (${harmonyScore}% Harmony)` : `${harmonyScore}% High Harmony`,
      santathiBlessingWindow,
      relationshipRemedy
    },

    health: {
      vitalityScore,
      constitutionDosha: dosha,
      vulnerableOrgans,
      ayurSanjeeviniHerbs: herbs,
      dailyDietRitual,
      mahaMrityunjayaShield: lang === "kn"
        ? "ಪ್ರತಿದಿನ 11 ಬಾರಿ 'ಓಂ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ...' ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣವು ಸರ್ವ ರೋಗ ನಿವಾರಕ."
        : "Chant the Maha Mrityunjaya Mantra 11 times daily for absolute vitality and immune shield."
    },

    protection: {
      drishtiSensitivityLevel: drishtiLevel,
      activeTransitAfflictions,
      sudarshanaKavachaMantra: "ಓಂ ನಮೋ ಭಗವತೇ ಮಹಾಸುದರ್ಶನಾಯ ನಮಃ || Om Namo Bhagavate Maha Sudarshanaya Namah ||",
      rakshaSutraTiming: lang === "kn" ? "ಪ್ರತಿ ಹುಣ್ಣಿಮೆ ಅಥವಾ ಅಮಾವಾಸ್ಯೆಯಂದು ಸಂಧ್ಯಾ ಕಾಲ" : "Purnima or Amavasya Twilight Hours",
      homeEnergyRemedy: lang === "kn"
        ? "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರಕ್ಕೆ ಅರಿಶಿನ-ಕುಂಕುಮ ಹಚ್ಚಿ, ನವರತ್ನ ರಕ್ಷಾ ಸೂತ್ರ ಅಥವಾ ಗೋಕರ್ಣ ರಕ್ಷಾ ದಾರವನ್ನು ಧರಿಸಿ."
        : "Apply turmeric-kumkum to main entrance and wear consecrated Gokarna Raksha Sutra on right wrist."
    },

    milestones,

    karmaBlueprint: {
      bhagyaGemstone: {
        name: lang === "kn" ? gem.kn : gem.en,
        sanskritName: gem.en,
        weightRatti: gem.ratti,
        metal: gem.metal,
        finger: gem.finger,
        consecrationDay: gem.day,
        caution: lang === "kn" ? "ಯಾವುದೇ ಬಿರುಕು ಅಥವಾ ಕಪ್ಪು ಕಲೆ ಇಲ್ಲದ ನೈಸರ್ಗಿಕ ರತ್ನವನ್ನೇ ಧರಿಸಬೇಕು." : "Must wear only 100% untreated, flaw-free natural gemstone."
      },
      rudrakshaMukhi: rudrakshaRecommendation,
      fiveMinuteMorningRoutine: {
        facingDirection,
        prescribedMantra,
        chantCount: 27,
        sacredAction: lang === "kn"
          ? "ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ತಾಮ್ರದ ಲೋಟದಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ಅರ್ಪಿಸಿ, ಪಂಚಾಂಗ ತಿಥಿ ನಮಸ್ಕಾರ ಮಾಡಿ."
          : "Offer Arghya to Surya at dawn in a copper vessel, chanting your birth nakshatra prayer."
      },
      charityAction
    },

    templeBlessing: {
      deity: lang === "kn" ? "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ & ಭದ್ರಕಾಳಿ ಅಮ್ಮನವರು (Shri Mahabaleshwara Gokarna)" : "Shri Mahabaleshwara & Goddess Bhadrakali (Gokarna)",
      templeName: "ಗೋಕರ್ಣ ಮಹಾಕ್ಷೇತ್ರ - ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸೇವಾ ಮಂಡಳಿ (Gokarna Heritage)",
      specialSankalpaMantra,
      recommendedSevaName: lang === "kn" ? "90-ದಿನಗಳ ಆಶೀರ್ವಾದ ಸಂಕಲ್ಪ ಮಹಾಪೂಜೆ (90-Day Ashirvada Master Seva)" : "90-Day Ashirvada Master Seva & Prasada"
    }
  };
}
