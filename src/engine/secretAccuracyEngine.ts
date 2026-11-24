/**
 * BAGGONA PANCHANGA — SECRET ACCURACY ENGINES & NEW REVENUE PRODUCTS
 *
 * Part 1: South Indian Secret Accuracy Engines
 *   1. The Yogi & Avayogi Planet Engine (Seshadri Iyer System)
 *   2. The Bhrigu Bindu (Destiny Trigger Point - Rahu-Moon Midpoint)
 *   3. Pushkara Navamsha & Pushkara Bhaga (Invincible Planet Detector)
 *
 * Part 2: High-Margin Revenue Products
 *   Product A: Gokarna Pitru & Karma Dosha Audit (₹199 entry / ₹2,100–₹11,000 Seva)
 *   Product B: Gokarna Monthly Sankalpa & Gochara Shield (₹501/month MRR)
 *   Product C: Vyapara & Wealth Muhurta Radar (₹1,499/year for Business Owners & Traders)
 *   Product D: Checkout Order Bump — Name, Brand & Mobile Number Yogi Audit (₹199)
 */

import {
  type Planet,
  type RashiIndex,
  type PlanetPosition,
  normalizePlanetName
} from "./jyotishPrecisionGates";
import { type SixLang, formatNumber6L, pick6 } from "../features/fiveYearPrediction/fiveYearLocale";

// ============================================================================
// 1. CONSTANTS & VIMSHOTTARI NAKSHATRA LORD MAP
// ============================================================================

export const VIMSHOTTARI_CYCLE: Planet[] = [
  "Ketu",    // 0: Ashwini, Magha, Mula
  "Venus",   // 1: Bharani, Purva Phalguni, Purva Ashadha
  "Sun",     // 2: Krittika, Uttara Phalguni, Uttara Ashadha
  "Moon",    // 3: Rohini, Hasta, Shravana
  "Mars",    // 4: Mrigashirsha, Chitra, Dhanishta
  "Rahu",    // 5: Ardra, Swati, Shatabhisha
  "Jupiter", // 6: Punarvasu, Vishakha, Purva Bhadrapada
  "Saturn",  // 7: Pushya, Anuradha, Uttara Bhadrapada
  "Mercury"  // 8: Ashlesha, Jyeshtha, Revati
];

export function getVimshottariLordByNakshatra(nakIndex: number): Planet {
  const normIdx = ((Math.floor(nakIndex) % 27) + 27) % 27;
  return VIMSHOTTARI_CYCLE[normIdx % 9];
}

export const RASHI_DISPOSITORS: Record<RashiIndex, Planet> = {
  0: "Mars",    // Aries
  1: "Venus",   // Taurus
  2: "Mercury", // Gemini
  3: "Moon",    // Cancer
  4: "Sun",     // Leo
  5: "Mercury", // Virgo
  6: "Venus",   // Libra
  7: "Mars",    // Scorpio
  8: "Jupiter", // Sagittarius
  9: "Saturn",  // Capricorn
  10: "Saturn", // Aquarius
  11: "Jupiter" // Pisces
};

export const PLANETARY_YOGI_ATTRIBUTES: Record<
  Planet,
  {
    colorEn: string;
    colorKn: string;
    directionEn: string;
    directionKn: string;
    wealthDayEn: string;
    wealthDayKn: string;
    gemstoneEn: string;
    gemstoneKn: string;
    deityEn: string;
    deityKn: string;
  }
> = {
  Sun: {
    colorEn: "Ruby Red / Copper Gold",
    colorKn: "ಮಾಣಿಕ್ಯದ ಕೆಂಪು / ತಾಮ್ರದ ಬಣ್ಣ",
    directionEn: "East",
    directionKn: "ಪೂರ್ವ",
    wealthDayEn: "Sunday",
    wealthDayKn: "ಭಾನುವಾರ",
    gemstoneEn: "Natural Ruby (Manikya)",
    gemstoneKn: "ಮಾಣಿಕ್ಯ",
    deityEn: "Surya Narayana",
    deityKn: "ಸೂರ್ಯ ನಾರಾಯಣ"
  },
  Moon: {
    colorEn: "Milky White / Pearl Silver",
    colorKn: "ಹಾಲು ಬಿಳುಪು / ಮುತ್ತಿನ ಬೆಳ್ಳಿ ಬಣ್ಣ",
    directionEn: "North-West",
    directionKn: "ವಾಯವ್ಯ",
    wealthDayEn: "Monday",
    wealthDayKn: "ಸೋಮವಾರ",
    gemstoneEn: "Natural Basra Pearl (Muthu)",
    gemstoneKn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು",
    deityEn: "Gauri Parvati",
    deityKn: "ಗೌರಿ ಪಾರ್ವತಿ"
  },
  Mars: {
    colorEn: "Coral Scarlet / Sindoor Red",
    colorKn: "ಹವಳದ ಕೆಂಪು / ಸಿಂಧೂರ ಕೆಂಪು",
    directionEn: "South",
    directionKn: "ದಕ್ಷಿಣ",
    wealthDayEn: "Tuesday",
    wealthDayKn: "ಮಂಗಳವಾರ",
    gemstoneEn: "Red Coral (Povala / Moonga)",
    gemstoneKn: "ಕೆಂಪು ಹವಳ",
    deityEn: "Lord Kartikeya / Subrahmanya",
    deityKn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ"
  },
  Mercury: {
    colorEn: "Emerald Green / Parrot Green",
    colorKn: "ಮರಕತ ಹಸಿರು / ಗಿಳಿ ಹಸಿರು",
    directionEn: "North",
    directionKn: "ಉತ್ತರ",
    wealthDayEn: "Wednesday",
    wealthDayKn: "ಬುಧವಾರ",
    gemstoneEn: "Natural Emerald (Panna)",
    gemstoneKn: "ಪಚ್ಚೆ (ಮರಕತ)",
    deityEn: "Lord Vishnu / Mahaganapati",
    deityKn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಮಹಾಗಣಪತಿ"
  },
  Jupiter: {
    colorEn: "Golden Yellow / Saffron",
    colorKn: "ಕನಕ ಹಳದಿ / ಕೇಸರಿ",
    directionEn: "North-East (Ishanya)",
    directionKn: "ಈಶಾನ್ಯ",
    wealthDayEn: "Thursday",
    wealthDayKn: "ಗುರುವಾರ",
    gemstoneEn: "Yellow Sapphire (Pushparaja)",
    gemstoneKn: "ಪುಷ್ಯರಾಗ",
    deityEn: "Lord Shiva / Brihaspati / Dattatreya",
    deityKn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ / ದತ್ತಾತ್ರೇಯ"
  },
  Venus: {
    colorEn: "Diamond Sparkle / Pure Cream",
    colorKn: "ವಜ್ರದ ಹೊಳಪು / ಶುದ್ಧ ಕೆನೆ ಬಿಳುಪು",
    directionEn: "South-East (Agneya)",
    directionKn: "ಆಗ್ನೇಯ",
    wealthDayEn: "Friday",
    wealthDayKn: "ಶುಕ್ರವಾರ",
    gemstoneEn: "Diamond / White Zircon",
    gemstoneKn: "ವಜ್ರ / ಶ್ವೇತ ಜಿರ್ಕಾನ್",
    deityEn: "Maha Lakshmi",
    deityKn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ"
  },
  Saturn: {
    colorEn: "Deep Indigo / Royal Navy Blue",
    colorKn: "ಕಡು ನೀಲಿ / ಇಂದ್ರನೀಲ",
    directionEn: "West",
    directionKn: "ಪಶ್ಚಿಮ",
    wealthDayEn: "Saturday",
    wealthDayKn: "ಶನಿವಾರ",
    gemstoneEn: "Blue Sapphire (Neelam / Amethyst)",
    gemstoneKn: "ಇಂದ್ರನೀಲ / ಜಾಂಬೂವಂತ ರತ್ನ",
    deityEn: "Lord Mahabaleshwara / Hanuman",
    deityKn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ / ಆಂಜನೇಯ"
  },
  Rahu: {
    colorEn: "Smoky Grey / Steel Blue",
    colorKn: "ಧೂಮ್ರ ಬಣ್ಣ / ಕಂದು ಬೂದು",
    directionEn: "South-West (Nairutya)",
    directionKn: "ನೈಋತ್ಯ",
    wealthDayEn: "Saturday (Evening)",
    wealthDayKn: "ಶನಿವಾರ ಸಂಜೆ",
    gemstoneEn: "Hessonite Garnet (Gomedha)",
    gemstoneKn: "ಗೋಮೇಧಿಕ",
    deityEn: "Maa Durga / Sharadamba",
    deityKn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ"
  },
  Ketu: {
    colorEn: "Multi-color / Earthy Ochre",
    colorKn: "ಮಿಶ್ರಿತ ಕಾವಿ / ಕಂದು ಕಿತ್ತಳೆ",
    directionEn: "Centre / Upward",
    directionKn: "ಮಧ್ಯ / ಬ್ರಹ್ಮ ಸ್ಥಾನ",
    wealthDayEn: "Tuesday",
    wealthDayKn: "ಮಂಗಳವಾರ",
    gemstoneEn: "Cat's Eye (Vaidurya)",
    gemstoneKn: "ವೈಡೂರ್ಯ",
    deityEn: "Lord Ganesha / Ketu Graha",
    deityKn: "ಶ್ರೀ ಗಣೇಶ / ರುದ್ರ ಪೀಠ"
  }
};

export interface YogiAttributeSet6L {
  color: Record<SixLang, string>;
  direction: Record<SixLang, string>;
  wealthDay: Record<SixLang, string>;
  gemstone: Record<SixLang, string>;
  deity: Record<SixLang, string>;
}

export const YOGI_ATTRIBUTES_6L: Record<Planet, YogiAttributeSet6L> = {
  Sun: {
    color: {
      kn: "ಮಾಣಿಕ್ಯದ ಕೆಂಪು / ತಾಮ್ರದ ಬಣ್ಣ",
      mr: "तांबूस लाल / सोनेरी रंग",
      hi: "माणिक्य लाल / तांबे का रंग",
      te: "ఎరుపు / రాగి రంగు",
      ta: "சிவப்பு / தாமிர நிறம்",
      en: "Ruby Red / Copper Gold"
    },
    direction: {
      kn: "ಪೂರ್ವ",
      mr: "पूर्व",
      hi: "पूर्व",
      te: "తూర్పు",
      ta: "கிழக்கு",
      en: "East"
    },
    wealthDay: {
      kn: "ಭಾನುವಾರ",
      mr: "रविवार",
      hi: "रविवार",
      te: "ఆదివారం",
      ta: "ஞாயிறு",
      en: "Sunday"
    },
    gemstone: {
      kn: "ಮಾಣಿಕ್ಯ",
      mr: "माणिक",
      hi: "माणिक्य",
      te: "మాణిక్యం",
      ta: "மாணிக்கம்",
      en: "Natural Ruby (Manikya)"
    },
    deity: {
      kn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ",
      mr: "श्री सूर्यनारायण",
      hi: "श्री सूर्य नारायण",
      te: "సూర్యనారాయణ స్వామి",
      ta: "சூரிய நாராயணர்",
      en: "Surya Narayana"
    }
  },
  Moon: {
    color: {
      kn: "ಹಾಲು ಬಿಳುಪು / ಮುತ್ತಿನ ಬೆಳ್ಳಿ ಬಣ್ಣ",
      mr: "दुधाळ पांढरा / मोत्याचा रंग",
      hi: "दुग्ध धवल / मोती श्वेत",
      te: "పాల తెలుపు / ముత్యపు రంగు",
      ta: "பால் வெள்ளை / முத்து நிறம்",
      en: "Milky White / Pearl Silver"
    },
    direction: {
      kn: "ವಾಯವ್ಯ",
      mr: "वायव्य",
      hi: "वायव्य",
      te: "వాయువ్యం",
      ta: "வடமேற்கு",
      en: "North-West"
    },
    wealthDay: {
      kn: "ಸೋಮವಾರ",
      mr: "सोमवार",
      hi: "सोमवार",
      te: "సోమవారం",
      ta: "திங்கள்",
      en: "Monday"
    },
    gemstone: {
      kn: "ನೈಸರ್ಗಿಕ ಮುತ್ತು",
      mr: "नैसर्गिक मोती",
      hi: "प्राकृतिक मोती",
      te: "సహజ ముత్యం",
      ta: "இயற்கை முத்து",
      en: "Natural Pearl"
    },
    deity: {
      kn: "ಶ್ರೀ ಗೌರಿ ಪಾರ್ವತಿ",
      mr: "माता पार्वती / गौरी",
      hi: "माता पार्वती / गौरी",
      te: "గౌరీ పార్వతి",
      ta: "கௌரி பார்வதி",
      en: "Gauri Parvati"
    }
  },
  Mars: {
    color: {
      kn: "ಹವಳದ ಕೆಂಪು / ಸಿಂಧೂರ ಕೆಂಪು",
      mr: "पोवळा लाल / सिंदूरी लाल",
      hi: "मूंगा लाल / सिंदूरी लाल",
      te: "పగడపు ఎరుపు / సింధూరం",
      ta: "பவள சிவப்பு / குங்கும நிறம்",
      en: "Coral Scarlet / Sindoor Red"
    },
    direction: {
      kn: "ದಕ್ಷಿಣ",
      mr: "दक्षिण",
      hi: "दक्षिण",
      te: "దక్షిణం",
      ta: "தெற்கு",
      en: "South"
    },
    wealthDay: {
      kn: "ಮಂಗಳವಾರ",
      mr: "मंगळवार",
      hi: "मंगलवार",
      te: "మంగళవారం",
      ta: "செவ்வாய்",
      en: "Tuesday"
    },
    gemstone: {
      kn: "ಕೆಂಪು ಹವಳ",
      mr: "लाल पोवळे",
      hi: "लाल मूंगा",
      te: "ఎరుపు పగడం",
      ta: "சிவப்பு பவளம்",
      en: "Red Coral (Moonga)"
    },
    deity: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ",
      mr: "श्री कार्तिकेय / सुब्रह्मण्य",
      hi: "श्री कार्तिकेय / सुब्रह्मण्य स्वामी",
      te: "సుబ్రహ్మణ్య స్వామి",
      ta: "முருகப்பெருமான்",
      en: "Lord Kartikeya / Subrahmanya"
    }
  },
  Mercury: {
    color: {
      kn: "ಮರಕತ ಹಸಿರು / ಗಿಳಿ ಹಸಿರು",
      mr: "पाचू हिरवा / पोपटी हिरवा",
      hi: "पन्ना हरा / तोते का रंग",
      te: "పచ్చ / చిలుక పచ్చ",
      ta: "மரகத பச்சை / கிளி பச்சை",
      en: "Emerald Green / Parrot Green"
    },
    direction: {
      kn: "ಉತ್ತರ",
      mr: "उत्तर",
      hi: "उत्तर",
      te: "ఉత్తరం",
      ta: "வடக்கு",
      en: "North"
    },
    wealthDay: {
      kn: "ಬುಧವಾರ",
      mr: "बुधवार",
      hi: "बुधवार",
      te: "బుధవారం",
      ta: "புதன்",
      en: "Wednesday"
    },
    gemstone: {
      kn: "ಪಚ್ಚೆ (ಮರಕತ)",
      mr: "पाचू",
      hi: "पन्ना (मरकत)",
      te: "పచ్చ (మరకతం)",
      ta: "மரகதம்",
      en: "Natural Emerald (Panna)"
    },
    deity: {
      kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ಮಹಾಗಣಪತಿ",
      mr: "श्री महाविष्णू / महागणपती",
      hi: "श्री महाविष्णु / महागणपति",
      te: "మహావిష్ణువు / మహాగణపతి",
      ta: "மகாவிஷ்ணு / மகாகணபதி",
      en: "Lord Vishnu / Mahaganapati"
    }
  },
  Jupiter: {
    color: {
      kn: "ಕನಕ ಹಳದಿ / ಕೇಸರಿ",
      mr: "सुवर्णी पिवळा / केशरी",
      hi: "स्वर्णिम पीला / केसरिया",
      te: "బంగారు పసుపు / కాషాయం",
      ta: "தங்க மஞ்சள் / காவி",
      en: "Golden Yellow / Saffron"
    },
    direction: {
      kn: "ಈಶಾನ್ಯ",
      mr: "ईशान्य",
      hi: "ईशान",
      te: "ఈశాన్యం",
      ta: "வடகிழக்கு",
      en: "North-East (Ishanya)"
    },
    wealthDay: {
      kn: "ಗುರುವಾರ",
      mr: "गुरुवार",
      hi: "गुरुवार",
      te: "గురువారం",
      ta: "வியாழன்",
      en: "Thursday"
    },
    gemstone: {
      kn: "ಪುಷ್ಯರಾಗ",
      mr: "पुष्कराज",
      hi: "पुखराज",
      te: "పుష్యరాగం",
      ta: "புஷ்பராகம்",
      en: "Yellow Sapphire (Pushparaja)"
    },
    deity: {
      kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ / ದತ್ತಾತ್ರೇಯ",
      mr: "श्री गुरु दत्तात्रेय / बृहस्पती",
      hi: "श्री गुरु दत्तात्रेय / बृहस्पति",
      te: "గురు రాఘవేంద్ర / దత్తాత్రేయ",
      ta: "குரு தட்சிணாமூர்த்தி",
      en: "Lord Shiva / Brihaspati / Dattatreya"
    }
  },
  Venus: {
    color: {
      kn: "ವಜ್ರದ ಹೊಳಪು / ಶುದ್ಧ ಕೆನೆ ಬಿಳುಪು",
      mr: "शुभ्र पांढरा / चंदेरी",
      hi: "शुभ्र श्वेत / रेशमी आभा",
      te: "శుద్ధ తెలుపు / మెరుపు",
      ta: "பளபளப்பான வெள்ளை / கிரீம்",
      en: "Diamond Sparkle / Pure Cream"
    },
    direction: {
      kn: "ಆಗ್ನೇಯ",
      mr: "आग्नेय",
      hi: "आग्नेय",
      te: "ఆగ్నేయం",
      ta: "தென்கிழக்கு",
      en: "South-East (Agneya)"
    },
    wealthDay: {
      kn: "ಶುಕ್ರವಾರ",
      mr: "शुक्रवार",
      hi: "शुक्रवार",
      te: "శుక్రవారం",
      ta: "வெள்ளி",
      en: "Friday"
    },
    gemstone: {
      kn: "ವಜ್ರ / ಶ್ವೇತ ಜಿರ್ಕಾನ್",
      mr: "हिरा / पांढरा झिरकॉन",
      hi: "हीरा / श्वेत जरकन",
      te: "వజ్రం / శ్వేత జిర్కాన్",
      ta: "வைரம் / வெள்ளை ஜிர்கான்",
      en: "Diamond / White Zircon"
    },
    deity: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ",
      mr: "श्री महालक्ष्मी",
      hi: "श्री महालक्ष्मी",
      te: "శ్రీ మహాలక్ష్మి",
      ta: "ஸ்ரீ மகாலட்சுமி",
      en: "Maha Lakshmi"
    }
  },
  Saturn: {
    color: {
      kn: "ಕಡು ನೀಲಿ / ಇಂದ್ರನೀಲ",
      mr: "गडद निळा / जांभळा",
      hi: "गहरा नीला / जामुनी",
      te: "ముదురు నీలం / ఇంద్రనీలం",
      ta: "அடர் நீலம் / கருநீலம்",
      en: "Deep Indigo / Royal Navy Blue"
    },
    direction: {
      kn: "ಪಶ್ಚಿಮ",
      mr: "पश्चिम",
      hi: "पश्चिम",
      te: "పడమర",
      ta: "மேற்கு",
      en: "West"
    },
    wealthDay: {
      kn: "ಶನಿವಾರ",
      mr: "शनिवार",
      hi: "शनिवार",
      te: "శనివారం",
      ta: "சனி",
      en: "Saturday"
    },
    gemstone: {
      kn: "ಇಂದ್ರನೀಲ / ಜಾಂಬೂವಂತ ರತ್ನ",
      mr: "नीलम",
      hi: "नीलम / जामुनिया",
      te: "నీలం",
      ta: "நீலக்கல்",
      en: "Blue Sapphire (Neelam)"
    },
    deity: {
      kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ / ಆಂಜನೇಯ",
      mr: "श्री महाबळेश्वर / मारुती",
      hi: "श्री गोकर्ण महाबलेश्वर / हनुमान",
      te: "గోకర్ణ మహాబలేశ్వర / ఆంజనేయ",
      ta: "ஸ்ரீ மகாபலேஸ்வரர் / அனுமன்",
      en: "Lord Mahabaleshwara / Hanuman"
    }
  },
  Rahu: {
    color: {
      kn: "ಧೂಮ್ರ ಬಣ್ಣ / ಕಂದು ಬೂದು",
      mr: "धुरकट / राखाडी",
      hi: "धूम्र वर्ण / स्लेटी",
      te: "పొగ రంగు / బూడిద",
      ta: "புகை நிறம் / சாம்பல்",
      en: "Smoky Grey / Steel Blue"
    },
    direction: {
      kn: "ನೈಋತ್ಯ",
      mr: "नैऋत्य",
      hi: "नैऋत्य",
      te: "నైరుతి",
      ta: "தென்மேற்கு",
      en: "South-West (Nairutya)"
    },
    wealthDay: {
      kn: "ಶನಿವಾರ ಸಂಜೆ",
      mr: "शनिवार संध्याकाळ",
      hi: "शनिवार सायंकाल",
      te: "శనివారం సాయంత్రం",
      ta: "சனிக்கிழமை மாலை",
      en: "Saturday (Evening)"
    },
    gemstone: {
      kn: "ಗೋಮೇಧಿಕ",
      mr: "गोमेद",
      hi: "गोमेद",
      te: "గోమేధికం",
      ta: "கோமேதகம்",
      en: "Hessonite Garnet (Gomedha)"
    },
    deity: {
      kn: "ಶ್ರೀ ದುರ್ಗಾ ಪರಮೇಶ್ವರಿ",
      mr: "श्री दुर्गा माता",
      hi: "माँ दुर्गा",
      te: "దుర్గా దేవి",
      ta: "துர்க்கை அம்மன்",
      en: "Maa Durga / Sharadamba"
    }
  },
  Ketu: {
    color: {
      kn: "ಮಿಶ್ರಿತ ಕಾವಿ / ಕಂದು ಕಿತ್ತಳೆ",
      mr: "तपकिरी / भगवा",
      hi: "मिश्रित गेरुआ / कत्थई",
      te: "కాషాయం / గోధుమ రంగు",
      ta: "கலப்பு காவி / பழுப்பு",
      en: "Multi-color / Earthy Ochre"
    },
    direction: {
      kn: "ಮಧ್ಯ / ಬ್ರಹ್ಮ ಸ್ಥಾನ",
      mr: "मध्य / ईशान्य",
      hi: "मध्य / ब्रह्म स्थान",
      te: "మధ్య స్థానం",
      ta: "மையம்",
      en: "Centre / Upward"
    },
    wealthDay: {
      kn: "ಮಂಗಳವಾರ",
      mr: "मंगळवार",
      hi: "मंगलवार",
      te: "మంగళవారం",
      ta: "செவ்வாய்",
      en: "Tuesday"
    },
    gemstone: {
      kn: "ವೈಡೂರ್ಯ",
      mr: "लहसुनिया",
      hi: "लहसुनिया (वैडूर्य)",
      te: "వైడూర్యం",
      ta: "வைடூரியம்",
      en: "Cat's Eye (Vaidurya)"
    },
    deity: {
      kn: "ಶ್ರೀ ಗಣೇಶ / ಕೇತು ಗ್ರಹ",
      mr: "श्री गणपती",
      hi: "श्री गणेश",
      te: "వినాయకుడు",
      ta: "விநாயகர்",
      en: "Lord Ganesha / Ketu Graha"
    }
  }
};

export function getYogiAttributes6L(
  planet: Planet | string,
  lang: SixLang
): {
  color: string;
  direction: string;
  wealthDay: string;
  gemstone: string;
  deity: string;
} {
  const normPlanet = normalizePlanetName(planet);
  const p = YOGI_ATTRIBUTES_6L[normPlanet] || YOGI_ATTRIBUTES_6L.Jupiter;
  return {
    color: p.color[lang] || p.color.en,
    direction: p.direction[lang] || p.direction.en,
    wealthDay: p.wealthDay[lang] || p.wealthDay.en,
    gemstone: p.gemstone[lang] || p.gemstone.en,
    deity: p.deity[lang] || p.deity.en
  };
}

// ============================================================================
// PART 1: SECRET ACCURACY CALCULATIONS
// ============================================================================

export interface SecretAccuracyProfile {
  // 1. Yogi & Avayogi
  yogiPoint: number;
  yogiRashi: RashiIndex;
  yogiDegree: number;
  yogiNakshatraIndex: number;
  yogiPlanet: Planet;
  duplicateYogiPlanet: Planet;
  yogiAttributes: (typeof PLANETARY_YOGI_ATTRIBUTES)[Planet];

  avayogiPoint: number;
  avayogiRashi: RashiIndex;
  avayogiDegree: number;
  avayogiNakshatraIndex: number;
  avayogiPlanet: Planet;
  avayogiAttributes: (typeof PLANETARY_YOGI_ATTRIBUTES)[Planet];

  // 2. Bhrigu Bindu
  bhriguBindu: number;
  bhriguBinduRashi: RashiIndex;
  bhriguBinduDegree: number;
  bhriguBinduOpposite: number;
  bhriguBinduOppositeRashi: RashiIndex;

  // 3. Pushkara Navamsha
  pushkaraBlessedPlanets: Array<{
    planet: Planet;
    rashi: RashiIndex;
    degreeInSign: number;
    navamshaSign: RashiIndex;
    protectionDomain: string;
  }>;
}

/**
 * Checks if a planetary degree falls in a classical Pushkara Navamsha zone
 */
export function isPushkaraNavamsha(rashi: number, deg: number): boolean {
  const normRashi = (((Math.floor(rashi) % 12) + 12) % 12);
  const normDeg = Math.max(0, Math.min(29.9999, deg % 30));
  const elem = normRashi % 4; // 0=Fire, 1=Earth, 2=Air, 3=Water

  if (elem === 0) {
    // Fire signs (Aries, Leo, Sagittarius): 20°00'–23°20' (Libra Navamsha) or 26°40'–30°00' (Sagittarius Navamsha)
    return (normDeg >= 20.0 && normDeg <= 23.333333) || (normDeg >= 26.666667 && normDeg <= 30.0);
  }
  if (elem === 1) {
    // Earth signs (Taurus, Virgo, Capricorn): 6°40'–10°00' (Pisces Navamsha) or 13°20'–16°40' (Taurus Navamsha)
    return (normDeg >= 6.666667 && normDeg <= 10.0) || (normDeg >= 13.333333 && normDeg <= 16.666667);
  }
  if (elem === 2) {
    // Air signs (Gemini, Libra, Aquarius): 16°40'–20°00' (Pisces Navamsha) or 23°20'–26°40' (Taurus Navamsha)
    return (normDeg >= 16.666667 && normDeg <= 20.0) || (normDeg >= 23.333333 && normDeg <= 26.666667);
  }
  // Water signs (Cancer, Scorpio, Pisces): 0°00'–3°20' (Cancer Navamsha) or 6°40'–10°00' (Virgo Navamsha)
  return (normDeg >= 0.0 && normDeg <= 3.333333) || (normDeg >= 6.666667 && normDeg <= 10.0);
}

/**
 * Computes the complete Secret Accuracy Profile:
 * Yogi, Avayogi, Duplicate Yogi, Bhrigu Bindu, and Pushkara Blessed Grahas.
 */
export function calculateSecretAccuracyProfile(
  sunLon: number,
  moonLon: number,
  rahuLon: number,
  allPlanets: PlanetPosition[] = []
): SecretAccuracyProfile {
  // 1. Seshadri Iyer Yogi & Avayogi System
  const yogiPoint = (((sunLon + moonLon + 93.333333) % 360) + 360) % 360;
  const yogiRashi = (Math.floor(yogiPoint / 30) % 12) as RashiIndex;
  const yogiDegree = yogiPoint % 30;
  const yogiNak = Math.floor(yogiPoint / 13.333333) % 27;
  const yogiPlanet = getVimshottariLordByNakshatra(yogiNak);
  const duplicateYogiPlanet = RASHI_DISPOSITORS[yogiRashi];

  const avayogiPoint = (((yogiPoint + 186.666667) % 360) + 360) % 360;
  const avayogiRashi = (Math.floor(avayogiPoint / 30) % 12) as RashiIndex;
  const avayogiDegree = avayogiPoint % 30;
  const avayogiNak = Math.floor(avayogiPoint / 13.333333) % 27;
  const avayogiPlanet = getVimshottariLordByNakshatra(avayogiNak);

  // 2. Bhrigu Bindu (Shortest Arc Midpoint between Rahu and Moon)
  const arcDiff = (((moonLon - rahuLon) % 360) + 360) % 360;
  const bhriguBindu = (((rahuLon + arcDiff / 2) % 360) + 360) % 360;
  const bhriguBinduRashi = (Math.floor(bhriguBindu / 30) % 12) as RashiIndex;
  const bhriguBinduDegree = bhriguBindu % 30;

  const bhriguBinduOpposite = (bhriguBindu + 180) % 360;
  const bhriguBinduOppositeRashi = (Math.floor(bhriguBinduOpposite / 30) % 12) as RashiIndex;

  // 3. Pushkara Navamsha Blessing Check
  const pushkaraBlessedPlanets: SecretAccuracyProfile["pushkaraBlessedPlanets"] = [];
  for (const p of allPlanets) {
    if (isPushkaraNavamsha(p.rashi, p.degreeInSign)) {
      const absLong = p.rashi * 30 + p.degreeInSign;
      const navSign = (Math.floor((absLong * 3) / 10) % 12) as RashiIndex;
      const domainMap: Record<Planet, string> = {
        Sun: "Divine Authority, Sovereign Vitality & Government Honor",
        Moon: "Emotional Equanimity, Mental Resilience & Unshakable Intuition",
        Mars: "Invincible Courage, Real Estate Shield & Decisive Leadership",
        Mercury: "Genius Analytical Intellect, Commercial Fortitude & Eloquence",
        Jupiter: "Divine Fortune, Guru Protection & Generational Wisdom",
        Venus: "Enduring Wealth Preservation, Spousal Harmony & Artistic Grace",
        Saturn: "Iron Discipline, Karma Purification & Enduring Lifespan",
        Rahu: "Unconventional Breakthroughs, Sudden Global Rise & Astuteness",
        Ketu: "Mystic Intuition, Moksha Elevation & Total Protection from Deceit"
      };

      pushkaraBlessedPlanets.push({
        planet: p.planet,
        rashi: p.rashi,
        degreeInSign: p.degreeInSign,
        navamshaSign: navSign,
        protectionDomain: domainMap[p.planet] || "Divine Sanctioned Auspiciousness"
      });
    }
  }

  return {
    yogiPoint,
    yogiRashi,
    yogiDegree,
    yogiNakshatraIndex: yogiNak,
    yogiPlanet,
    duplicateYogiPlanet,
    yogiAttributes: PLANETARY_YOGI_ATTRIBUTES[yogiPlanet],

    avayogiPoint,
    avayogiRashi,
    avayogiDegree,
    avayogiNakshatraIndex: avayogiNak,
    avayogiPlanet,
    avayogiAttributes: PLANETARY_YOGI_ATTRIBUTES[avayogiPlanet],

    bhriguBindu,
    bhriguBinduRashi,
    bhriguBinduDegree,
    bhriguBinduOpposite,
    bhriguBinduOppositeRashi,

    pushkaraBlessedPlanets
  };
}

/**
 * Checks if a transiting planet crosses within ±3° of Bhrigu Bindu or its 7th aspect
 */
export function checkBhriguBinduTransitTrigger(
  bhriguBinduLongitude: number,
  transitPlanets: Array<{ planet: Planet; longitude: number }>
): Array<{
  planet: Planet;
  aspect: "CONJUNCTION_1ST" | "OPPOSITION_7TH";
  orbDegrees: number;
  isTriggered: boolean;
  eventNature: "AUSPICIOUS_BREAKTHROUGH" | "KARMIC_TRANSFORMATION";
  estimatedWindowDays: number;
}> {
  const triggers: ReturnType<typeof checkBhriguBinduTransitTrigger> = [];
  const oppLongitude = (bhriguBinduLongitude + 180) % 360;

  for (const t of transitPlanets) {
    if (t.planet !== "Jupiter" && t.planet !== "Saturn" && t.planet !== "Rahu") continue;

    const diff1st = Math.abs((((t.longitude - bhriguBinduLongitude + 180) % 360) + 360) % 360 - 180);
    const diff7th = Math.abs((((t.longitude - oppLongitude + 180) % 360) + 360) % 360 - 180);

    const isTrigger1st = diff1st <= 3.0;
    const isTrigger7th = diff7th <= 3.0;

    if (isTrigger1st || isTrigger7th) {
      const isJupiter = t.planet === "Jupiter";
      triggers.push({
        planet: t.planet,
        aspect: isTrigger1st ? "CONJUNCTION_1ST" : "OPPOSITION_7TH",
        orbDegrees: Math.min(diff1st, diff7th),
        isTriggered: true,
        eventNature: isJupiter ? "AUSPICIOUS_BREAKTHROUGH" : "KARMIC_TRANSFORMATION",
        estimatedWindowDays: isJupiter ? 21 : 45
      });
    }
  }

  return triggers;
}

// ============================================================================
// PART 2: 4 NEW HIGH-MARGIN REVENUE PRODUCTS ENGINES
// ============================================================================

// ----------------------------------------------------------------------------
// Product A: Gokarna Pitru & Karma Dosha Audit (₹199 Report / ₹2,100–₹11,000 Seva)
// ----------------------------------------------------------------------------

export interface PitruKarmaAuditReport {
  hasPitruDosha: boolean;
  pitruDoshaSeverity: "NONE" | "MILD" | "MODERATE" | "SEVERE";
  pitruDoshaReasons: string[];

  hasMaandi99Knot: boolean;
  maandiHouse: number;
  maandiDomainAffected: string;

  hasSarpaAxis: boolean;
  sarpaKarmicNature: string;

  overallKarmicObstacleScore: number; // 0 to 100
  recommendedGokarnaSeva: {
    sevaId: string;
    sevaNameKn: string;
    sevaNameEn: string;
    descriptionKn: string;
    descriptionEn: string;
    suggestedDakshina: string;
    priestName: string;
    priestPhone: string;
  };
}

export function evaluatePitruAndKarmaDosha(
  kundliPlanets: PlanetPosition[],
  maandiHouse: number = 1
): PitruKarmaAuditReport {
  const sun = kundliPlanets.find(p => p.planet === "Sun");
  const moon = kundliPlanets.find(p => p.planet === "Moon");
  const rahu = kundliPlanets.find(p => p.planet === "Rahu");
  const ketu = kundliPlanets.find(p => p.planet === "Ketu");
  const saturn = kundliPlanets.find(p => p.planet === "Saturn");

  const ninthHousePlanets = kundliPlanets.filter(p => p.rashiHouse === 9);
  const pitruReasons: string[] = [];
  let severityScore = 0;

  // 1. Sun afflicted by Rahu/Ketu/Saturn
  if (sun && rahu && sun.rashiHouse === rahu.rashiHouse) {
    pitruReasons.push("Sun conjunct Rahu (Surya Grahana Pitru Bandhana)");
    severityScore += 35;
  }
  if (sun && ketu && sun.rashiHouse === ketu.rashiHouse) {
    pitruReasons.push("Sun conjunct Ketu (Karmic Fatherly Disconnect)");
    severityScore += 30;
  }
  if (sun && saturn && (sun.rashiHouse === saturn.rashiHouse || ((saturn.rashiHouse - sun.rashiHouse + 12) % 12 === 6))) {
    pitruReasons.push("Sun-Saturn severe mutual tension across Dharma axis");
    severityScore += 25;
  }

  // 2. 9th house affliction
  const has9thAffliction = ninthHousePlanets.some(p => p.planet === "Rahu" || p.planet === "Ketu" || p.planet === "Saturn");
  if (has9thAffliction) {
    pitruReasons.push("9th House of Ancestral Dharma occupied by Malefic/Nodal node");
    severityScore += 30;
  }

  // 3. Maandi 99% Last-Mile Knot
  const maandiDomainMap: Record<number, string> = {
    1: "Physical Vitality, Self-Confidence & Energy Drain at Checkpoint",
    2: "Wealth Accumulation, Stalled Savings & Family Cohesion Glitch",
    3: "Sibling Harmony, Enterprise Initiative & Communication Blocks",
    4: "Mother's Wellbeing, Domestic Peace, Land & Vehicle Paperwork Delay",
    5: "Progeny Blessings, Creative Expression & Academic Completion Block",
    6: "Debt Clearance, Litigation Friction & Lingering Health Recovery",
    7: "Matrimonial Alliances, Spousal Rapport & Deal Finalization Glitch",
    8: "Sudden Unexpected Obstacles, Midnight Anxiety & Inherited Liabilities",
    9: "Higher Fortune, Father's Auspiciousness & Dharma Fruition Delay",
    10: "Career Promotions, 99% Done Contract Cancellation & Public Prestige Knot",
    11: "Pending Payments, Delayed Liquid Gains & Fraternal Support Blocks",
    12: "Uncontrolled Expenditures, Sleep Disruption & Relocation Obstacles"
  };

  const hasMaandiKnot = [1, 2, 4, 5, 7, 8, 10, 11].includes(maandiHouse);

  // 4. Sarpa Axis
  const hasSarpa = Boolean(rahu && ketu && (rahu.rashiHouse === 1 || rahu.rashiHouse === 5 || rahu.rashiHouse === 8 || rahu.rashiHouse === 9));

  const totalScore = Math.min(100, severityScore + (hasMaandiKnot ? 20 : 0) + (hasSarpa ? 20 : 0));
  const hasPitruDosha = pitruReasons.length > 0;

  const severity: PitruKarmaAuditReport["pitruDoshaSeverity"] =
    totalScore >= 75 ? "SEVERE" : totalScore >= 45 ? "MODERATE" : totalScore >= 20 ? "MILD" : "NONE";

  return {
    hasPitruDosha,
    pitruDoshaSeverity: severity,
    pitruDoshaReasons: pitruReasons,
    hasMaandi99Knot: hasMaandiKnot,
    maandiHouse,
    maandiDomainAffected: maandiDomainMap[maandiHouse] || "Checkpoint Friction",
    hasSarpaAxis: hasSarpa,
    sarpaKarmicNature: hasSarpa ? "Rahu-Ketu Ancestral Serpent Knot (Kala Sarpa / Naga Bandhana)" : "Clean Axis",
    overallKarmicObstacleScore: totalScore,
    recommendedGokarnaSeva: {
      sevaId: totalScore >= 70 ? "gokarna_narayana_bali" : hasMaandiKnot ? "gokarna_tripindi_shraddha" : "gokarna_rudrabhisheka_sankalpa",
      sevaNameKn: totalScore >= 70 ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ನಾರಾಯಣ ಬಲಿ & ಸರ್ಪ ಶಾಂತಿ" : "ಶ್ರೀ ಗೋಕರ್ಣ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ಮಾಂದಿ ನಿವಾರಣಾ ಸಂಕಲ್ಪ",
      sevaNameEn: totalScore >= 70 ? "Sri Kshetra Gokarna Narayana Bali & Sarpa Shanti" : "Sri Kshetra Gokarna Tripindi Shraddha & Maandi Shanti",
      descriptionKn: "ಪಿತೃ ದೋಷ, ಕರ್ಮಬಂಧ ಹಾಗೂ ೯೯% ಕೆಲಸ ನಿಲ್ಲುವ ಮಾಂದಿ ಗಂಟಿನ ಸಂಪೂರ್ಣ ಶಾಂತಿಗಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ನಡೆಯುವ ಪರಮ ಪವಿತ್ರ ಶಾಸ್ತ್ರೋಕ್ತ ಸೇವೆ.",
      descriptionEn: "Complete Shastric pacification performed directly at Sri Kshetra Gokarna Mahabaleshwara Atma Linga sanctum for ancestral liberation and unblocking 99% stalled life milestones.",
      suggestedDakshina: totalScore >= 70 ? "₹ ೪,೫೦೦ / ₹ ೧೧,೦೦೦" : "₹ ೨,೧೦೦ / ₹ ೫,೧೦೦",
      priestName: "Shreeram Pandit (ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್)",
      priestPhone: "+91 99723 39362"
    }
  };
}

// ----------------------------------------------------------------------------
// Product B: Gokarna Monthly Sankalpa & Gochara Shield (₹501/month MRR)
// ----------------------------------------------------------------------------

export interface MonthlyPowerCalendarDay {
  dateYmd: string;
  dayOfMonth: number;
  weekdayKn: string;
  weekdayEn: string;
  tithiKn: string;
  status: "GREEN_POWER" | "YELLOW_NEUTRAL" | "RED_CAUTION";
  tarabalaCategory: string;
  chandrabalaFavorable: boolean;
  isBhriguBinduTriggerDay: boolean;
  recommendedActionKn: string;
  recommendedActionEn: string;
}

export function generateNext30DaysPowerCalendar(
  baseDate: Date,
  yogiPlanet: Planet,
  avayogiPlanet: Planet,
  bhriguBinduRashi: RashiIndex,
  janmaMoonRashi: RashiIndex,
  janmaNakshatraIdx: number,
  lang: SixLang = "kn"
): MonthlyPowerCalendarDay[] {
  const days: MonthlyPowerCalendarDay[] = [];
  const weekdaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdaysKn = ["ಭಾನುವಾರ", "ಸೋಮವಾರ", "ಮಂಗಳವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"];

  const TARA_NAMES = [
    "Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhaka", "Naidhana", "Mitra", "Parama Mitra"
  ];

  for (let i = 0; i < 30; i++) {
    const curDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = curDate.getDay();
    const approxMoonRashi = (janmaMoonRashi + Math.floor(i / 2.25)) % 12;
    const approxMoonNak = (janmaNakshatraIdx + i) % 27;

    const taraDiff = ((approxMoonNak - janmaNakshatraIdx + 27) % 27) % 9;
    const taraName = TARA_NAMES[taraDiff];
    const isTaraFavorable = [1, 3, 5, 7, 8].includes(taraDiff); // Sampat, Kshema, Sadhaka, Mitra, Parama Mitra
    const isChandrashtama = ((approxMoonRashi - janmaMoonRashi + 12) % 12) + 1 === 8;

    const isBhriguDay = approxMoonRashi === bhriguBinduRashi;

    let status: MonthlyPowerCalendarDay["status"] = "YELLOW_NEUTRAL";
    if (isChandrashtama || taraName === "Naidhana" || taraName === "Vipat") {
      status = "RED_CAUTION";
    } else if (isTaraFavorable && !isChandrashtama) {
      status = "GREEN_POWER";
    }

    const dateYmd = curDate.toISOString().split("T")[0];

    days.push({
      dateYmd,
      dayOfMonth: curDate.getDate(),
      weekdayKn: weekdaysKn[dayOfWeek],
      weekdayEn: weekdaysEn[dayOfWeek],
      tithiKn: `ಶುಕ್ಲ/ಕೃಷ್ಣ ಪಕ್ಷ`,
      status,
      tarabalaCategory: taraName,
      chandrabalaFavorable: !isChandrashtama,
      isBhriguBinduTriggerDay: isBhriguDay,
      recommendedActionKn: status === "GREEN_POWER"
        ? "ಮಹತ್ವದ ಕಾರ್ಯಾರಂಭ, ಒಪ್ಪಂದಗಳಿಗೆ ಸಹಿ, ಹೂಡಿಕೆ ಹಾಗೂ ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಶ್ರೇಷ್ಠ."
        : status === "RED_CAUTION"
          ? "ಹಣಕಾಸಿನ ಸಾಲ ನೀಡಬೇಡಿ, ವಿವಾದಗಳಿಂದ ದೂರವಿರಿ; ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಧ್ಯಾನ ರಕ್ಷೆ."
          : "ದೈನಂದಿನ ಸಾಧಾರಣ ಕಾರ್ಯಗಳಿಗೆ ಹಾಗೂ ಅಧ್ಯಯನಕ್ಕೆ ಸೂಕ್ತ ದಿನ.",
      recommendedActionEn: status === "GREEN_POWER"
        ? "Super-aligned for major agreements, financial commitments, and high-stakes launches."
        : status === "RED_CAUTION"
          ? "Avoid lending, postpone major litigation or aggressive confrontations; invoke Lord Mahabaleshwara."
          : "Favorable for routine continuity, research, and preparatory milestones."
    });
  }

  return days;
}

// ----------------------------------------------------------------------------
// Product C: Vyapara & Wealth Muhurta Radar (₹1,499/year for Traders & Owners)
// ----------------------------------------------------------------------------

export interface VyaparaRadarMetrics {
  yogiPlanetWealthPotential: string;
  yogiHoraGoldWindow: string;
  avayogiHoraDangerWindow: string;
  traderMonthlyGuidelineKn: string;
  traderMonthlyGuidelineEn: string;
  bestInvestmentDaysKn: string[];
  bestInvestmentDaysEn: string[];
  yogiWealthDayKn: string;
  yogiWealthDayEn: string;
  avayogiCautionDayKn: string;
  avayogiCautionDayEn: string;
  bestVyaparaDirectionKn: string;
  bestVyaparaDirectionEn: string;
}

export function computeVyaparaRadarMetrics(
  yogiPlanet: Planet,
  avayogiPlanet: Planet,
  lang: SixLang = "kn"
): VyaparaRadarMetrics {
  const yogiAttrs = PLANETARY_YOGI_ATTRIBUTES[yogiPlanet];
  const avayogiAttrs = PLANETARY_YOGI_ATTRIBUTES[avayogiPlanet];

  return {
    yogiPlanetWealthPotential: `Highest Sovereign Wealth Generator: ${yogiPlanet} (${yogiAttrs.gemstoneEn} & ${yogiAttrs.wealthDayEn})`,
    yogiHoraGoldWindow: `Daily ${yogiPlanet} Hora: Apex window for trading entries, closing commercial contracts, signing deeds, and banking collections.`,
    avayogiHoraDangerWindow: `Daily ${avayogiPlanet} Hora: Toxic financial drain window. Never lend capital, sign loan agreements, or inaugurate machinery during this hour.`,
    traderMonthlyGuidelineKn: `ನಿಮ್ಮ ಯೋಗಿ ಗ್ರಹ ${yogiPlanet} ಆಗಿರುವುದರಿಂದ ${yogiAttrs.wealthDayKn} ದಿನಗಳು ಹಾಗೂ ${yogiAttrs.directionKn} ದಿಕ್ಕು ವ್ಯಾಪಾರ ವೃದ್ಧಿಗೆ ಪರಮ ಶ್ರೇಷ್ಠ. ಅವಯೋಗಿ ಗ್ರಹ ${avayogiPlanet} ಸಂಬಂಧಿಸಿದ ಸಮಯದಲ್ಲಿ ಸಾಲ ನೀಡುವುದು ನಷ್ಟಕ್ಕೆ ಕಾರಣವಾಗಬಹುದು.`,
    traderMonthlyGuidelineEn: `Your Yogi Graha is ${yogiPlanet}. Operating along the ${yogiAttrs.directionEn} direction and timing major financial moves on ${yogiAttrs.wealthDayEn} compounds luck. Avoid capital deployment during ${avayogiPlanet} Avayogi planetary hours.`,
    bestInvestmentDaysKn: [
      `${yogiAttrs.wealthDayKn} (ಯೋಗಿ ಗ್ರಹ ದಿನ - ಧನಲಾಭ)`,
      "ಗುರುವಾರ (ಬೃಹಸ್ಪತಿ ಅಮೃತ ಯೋಗ)",
      "ಶುಕ್ರವಾರ (ಮಹಾಲಕ್ಷ್ಮಿ ಧನ ಸಮೃದ್ಧಿ)"
    ],
    bestInvestmentDaysEn: [
      `${yogiAttrs.wealthDayEn} (Yogi Planet Auspicious Inflow)`,
      "Thursday (Brihaspati Prosperity Confluence)",
      "Friday (Maha Lakshmi Dhana Samriddhi)"
    ],
    yogiWealthDayKn: yogiAttrs.wealthDayKn,
    yogiWealthDayEn: yogiAttrs.wealthDayEn,
    avayogiCautionDayKn: avayogiAttrs.wealthDayKn,
    avayogiCautionDayEn: avayogiAttrs.wealthDayEn,
    bestVyaparaDirectionKn: yogiAttrs.directionKn,
    bestVyaparaDirectionEn: yogiAttrs.directionEn
  };
}

// ----------------------------------------------------------------------------
// Product D: Checkout Order Bump — Name, Brand & Mobile Number Yogi Audit (₹199)
// ----------------------------------------------------------------------------

export interface NameAndMobileYogiAudit {
  inputName: string;
  inputMobile: string;

  nameCompoundNumber: number;
  nameSingleDigit: number;
  nameRulingPlanet: Planet;
  nameHarmonyStatus: "PERFECT_YOGI_HARMONY" | "NEUTRAL_COMPATIBLE" | "AVAYOGI_FRICTION_CLASH";
  nameRecommendationKn: string;
  nameRecommendationEn: string;

  mobileSum: number;
  mobileSingleDigit: number;
  mobileRulingPlanet: Planet;
  mobileHarmonyStatus: "PERFECT_YOGI_HARMONY" | "NEUTRAL_COMPATIBLE" | "AVAYOGI_FRICTION_CLASH";
  mobileRecommendationKn: string;
  mobileRecommendationEn: string;
}

// Classical Chaldean Numerology letter mapping
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const NUMEROLOGY_PLANET_MAP: Record<number, Planet> = {
  1: "Sun",
  2: "Moon",
  3: "Jupiter",
  4: "Rahu",
  5: "Mercury",
  6: "Venus",
  7: "Ketu",
  8: "Saturn",
  9: "Mars"
};

export function auditNameAndMobileWithYogi(
  rawName: string,
  rawMobile: string,
  yogiPlanet: Planet,
  avayogiPlanet: Planet
): NameAndMobileYogiAudit {
  // 1. Calculate Name Vibration
  const cleanName = (rawName || "").toUpperCase().replace(/[^A-Z]/g, "");
  let nameCompound = 0;
  for (let i = 0; i < cleanName.length; i++) {
    nameCompound += CHALDEAN_MAP[cleanName[i]] || 0;
  }
  if (nameCompound === 0) nameCompound = 14;

  const reduceSingle = (n: number): number => {
    while (n > 9) {
      n = String(n).split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    return n || 1;
  };

  const nameSingle = reduceSingle(nameCompound);
  const nameRuling = NUMEROLOGY_PLANET_MAP[nameSingle] || "Jupiter";

  let nameStatus: NameAndMobileYogiAudit["nameHarmonyStatus"] = "NEUTRAL_COMPATIBLE";
  if (nameRuling === yogiPlanet) {
    nameStatus = "PERFECT_YOGI_HARMONY";
  } else if (nameRuling === avayogiPlanet) {
    nameStatus = "AVAYOGI_FRICTION_CLASH";
  }

  // 2. Calculate Mobile Number Vibration
  const cleanMobile = (rawMobile || "").replace(/\D/g, "");
  let mobileSum = 0;
  for (let i = 0; i < cleanMobile.length; i++) {
    mobileSum += parseInt(cleanMobile[i], 10);
  }
  if (mobileSum === 0) mobileSum = 45;

  const mobileSingle = reduceSingle(mobileSum);
  const mobileRuling = NUMEROLOGY_PLANET_MAP[mobileSingle] || "Sun";

  let mobileStatus: NameAndMobileYogiAudit["mobileHarmonyStatus"] = "NEUTRAL_COMPATIBLE";
  if (mobileRuling === yogiPlanet) {
    mobileStatus = "PERFECT_YOGI_HARMONY";
  } else if (mobileRuling === avayogiPlanet) {
    mobileStatus = "AVAYOGI_FRICTION_CLASH";
  }

  return {
    inputName: rawName,
    inputMobile: rawMobile,

    nameCompoundNumber: nameCompound,
    nameSingleDigit: nameSingle,
    nameRulingPlanet: nameRuling,
    nameHarmonyStatus: nameStatus,
    nameRecommendationKn: nameStatus === "PERFECT_YOGI_HARMONY"
      ? `ಅತ್ಯುತ್ತಮ ಯೋಗ! ನಿಮ್ಮ ಹೆಸರು ನೇರವಾಗಿ ನಿಮ್ಮ ಯೋಗಿ ಗ್ರಹ ${yogiPlanet} ಗೆ ಸಂಪರ್ಕ ಹೊಂದಿದೆ. ಯಶಸ್ಸು ಮತ್ತು ಮನ್ನಣೆ ಖಚಿತ.`
      : nameStatus === "AVAYOGI_FRICTION_CLASH"
        ? `ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಹೆಸರು ಅವಯೋಗಿ ಗ್ರಹ ${avayogiPlanet} ಕಂಪನದಲ್ಲಿದೆ. ಸಣ್ಣ ಅಕ್ಷರ ಸೇರ್ಪಡೆಯಿಂದ ಯೋಗಿ ಗ್ರಹ ${yogiPlanet} ಗೆ ಬದಲಾಯಿಸುವುದು ಒಳಿತು.`
        : `ಹೆಸರಿನ ಕಂಪನ ಸಮತೋಲನದಲ್ಲಿದೆ (${nameRuling}). ಯಾವುದೇ ದೊಡ್ಡ ಅಡೆತಡೆಗಳಿಲ್ಲ.`,
    nameRecommendationEn: nameStatus === "PERFECT_YOGI_HARMONY"
      ? `Golden Alignment! Your name vibrates with your Yogi planet ${yogiPlanet}, magnifying wealth and personal authority.`
      : nameStatus === "AVAYOGI_FRICTION_CLASH"
        ? `Friction Alert: Your name vibrates with your Avayogi planet ${avayogiPlanet}. A minor letter calibration to align with ${yogiPlanet} dissolves subconscious roadblocks.`
        : `Name vibration is balanced (${nameRuling}), producing neutral and stable life outcomes.`,

    mobileSum,
    mobileSingleDigit: mobileSingle,
    mobileRulingPlanet: mobileRuling,
    mobileHarmonyStatus: mobileStatus,
    mobileRecommendationKn: mobileStatus === "PERFECT_YOGI_HARMONY"
      ? `ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯು ಯೋಗಿ ಗ್ರಹ ${yogiPlanet} ಸಂಖ್ಯೆಗೆ ಕೂಡುತ್ತದೆ. ವ್ಯಾಪಾರ ಹಾಗೂ ಹಣಕಾಸಿನ ಕರೆಗಳಿಗೆ ಪರಮ ಶುಭ.`
      : mobileStatus === "AVAYOGI_FRICTION_CLASH"
        ? `ಮೊಬೈಲ್ ಮೊತ್ತವು ಅವಯೋಗಿ ಗ್ರಹ ${avayogiPlanet} ಗೆ ಕೂಡುತ್ತದೆ. ಪ್ರಮುಖ ವ್ಯಾಪಾರ ಕರೆಗಳು ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್‌ಗಾಗಿ ಪರ್ಯಾಯ ಸಂಖ್ಯೆ ಬಳಸುವುದು ಸೂಕ್ತ.`
        : `ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯು ಅನುಕೂಲಕರ ಗ್ರಹಸ್ಥಿತಿಯಲ್ಲಿದೆ (${mobileRuling}).`,
    mobileRecommendationEn: mobileStatus === "PERFECT_YOGI_HARMONY"
      ? `Your mobile total reduces to your Yogi planet ${yogiPlanet}. Attracts productive incoming commercial calls and opportunities.`
      : mobileStatus === "AVAYOGI_FRICTION_CLASH"
        ? `Your mobile total reduces to your Avayogi planet ${avayogiPlanet}. Important deals or financial discussions on this SIM may experience last-minute misunderstandings.`
        : `Mobile number frequency is compatible and stable (${mobileRuling}).`
  };
}
