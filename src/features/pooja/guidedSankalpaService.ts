/**
 * Baggona Panchanga - Authentic Vedic Sankalpa Engine (ವೈದಿಕ ದೇಶ-ಕಾಲ ಸಂಕಲ್ಪ ಎಂಜಿನ್)
 * 
 * Generates personalized, authentic Smartha & Vedic Sankalpas with 50-year priest tradition:
 * Supports specific devotee purposes:
 * - ವಿವಾಹ ಪ್ರಾಪ್ತಿ (Marriage delay / finding life partner)
 * - ಕುಟುಂಬ ಶ್ರೇಯಸ್ಸು (Family peace & abundance)
 * - ವಿದ್ಯಾಭ್ಯಾಸ & ಪರೀಕ್ಷಾ ಯಶಸ್ಸು (Exams, education & intelligence)
 * - ಉದ್ಯೋಗ ಲಾಭ & ವೃತ್ತಿ ಉನ್ನತಿ (Job, career promotion & business growth)
 * - ಆರೋಗ್ಯ ಪ್ರಾಪ್ತಿ & ದೀರ್ಘಾಯುಷ್ಯ (Health, healing & longevity)
 * - ಸಂತಾನ ಪ್ರಾಪ್ತಿ (Progeny & family continuation)
 * - ಋಣಮುಕ್ತಿ & ಆರ್ಥಿಕ ಸಂಕಷ್ಟ ನಿವಾರಣೆ (Debt relief & financial freedom)
 */

import type { SevaLang } from "../seva/sevaLocale";

export type SankalpaPurposeKey =
  | "vivaha"
  | "kutumba"
  | "vidya"
  | "udyoga"
  | "arogya"
  | "santana"
  | "runamukti"
  | "custom";

export interface SankalpaPurposeOption {
  key: SankalpaPurposeKey;
  labelKn: string;
  labelEn: string;
  icon: string;
  descriptionKn: string;
  descriptionEn: string;
  sanskritPhala: string;
}

export const SANKALPA_PURPOSES: Record<SankalpaPurposeKey, SankalpaPurposeOption> = {
  vivaha: {
    key: "vivaha",
    labelKn: "ವಿವಾಹ ಪ್ರಾಪ್ತಿ (ಶೀಘ್ರ ಕಲ್ಯಾಣ)",
    labelEn: "Marriage & Soulmate Union",
    icon: "💍",
    descriptionKn: "ವಿವಾಹ ವಿಳಂಬ ನಿವಾರಣೆ, ಸುಯೋಗ್ಯ ವಧು/ವರ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಮಂಗಲ ಭಾಗ್ಯ",
    descriptionEn: "Resolving marriage delay, attracting ideal life partner & marital harmony",
    sanskritPhala: "मम सकल विवाह विघ्न निवारणपूर्वक त्वरित शुभ विवाह सिद्ध्यर्थं, सुयोग्य वर/वधू प्राप्त्यर्थं"
  },
  kutumba: {
    key: "kutumba",
    labelKn: "ಕುಟುಂಬ ಶ್ರೇಯಸ್ಸು & ಸುಖ ಶಾಂತಿ",
    labelEn: "Family Harmony & Well-being",
    icon: "🏡",
    descriptionKn: "ಕುಟುಂಬದ ಸದಸ್ಯರೆಲ್ಲರಿಗೂ ಕ್ಷೇಮ, ಸ್ಥೈರ್ಯ, ಶಾಂತಿ ಹಾಗೂ ಐಶ್ವರ್ಯ ವೃದ್ಧಿ",
    descriptionEn: "Peace, unity, auspiciousness and prosperity for the entire family",
    sanskritPhala: "अस्माकं सहकुटुम्बानां क्षेम-स्थैर्य-धैर्य-विजय-अभय-आयुष्यारोग्य-ऐश्वर्याभिवृद्ध्यर्थं"
  },
  vidya: {
    key: "vidya",
    labelKn: "ವಿದ್ಯಾಭ್ಯಾಸ & ಪರೀಕ್ಷಾ ಯಶಸ್ಸು",
    labelEn: "Education & Exam Success",
    icon: "📚",
    descriptionKn: "ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು, ಏಕಾಗ್ರತೆ, ಸ್ಮರಣಶಕ್ತಿ ಹಾಗೂ ಜ್ಞಾನ ವೃದ್ಧಿ",
    descriptionEn: "Excellence in competitive exams, sharp memory, concentration & intellect",
    sanskritPhala: "सकल विद्या पारङ्गतत्व सिद्ध्यर्थं, परीक्षासु उत्तमोत्तम विजय सिद्ध्यर्थं, मेधा-बुद्धि-विकासार्थं"
  },
  udyoga: {
    key: "udyoga",
    labelKn: "ಉದ್ಯೋಗ ಲಾಭ & ವೃತ್ತಿ ಉನ್ನತಿ",
    labelEn: "Career Success & Promotion",
    icon: "💼",
    descriptionKn: "ಉತ್ತಮ ಉದ್ಯೋಗ ಪ್ರಾಪ್ತಿ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ ಹಾಗೂ ಆದಾಯ ಹೆಚ್ಚಳ",
    descriptionEn: "Landing a desirable job, career promotions, business growth & financial lift",
    sanskritPhala: "मनोवाञ्छित उत्तम उद्योग प्राप्त्यर्थं, वृत्ति-व्यापार अभिवृद्ध्यर्थं, पदोन्नति सिद्ध्यर्थं"
  },
  arogya: {
    key: "arogya",
    labelKn: "ಆರೋಗ್ಯ ಪ್ರಾಪ್ತಿ & ದೀರ್ಘಾಯುಷ್ಯ",
    labelEn: "Health, Healing & Longevity",
    icon: "🌿",
    descriptionKn: "ದೀರ್ಘಕಾಲದ ರೋಗ ನಿವಾರಣೆ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ದೈಹಿಕ ಶಕ್ತಿ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ",
    descriptionEn: "Relief from chronic illnesses, vibrant vitality, mental peace & longevity",
    sanskritPhala: "मम अपमृत्यु-अकालमृत्यु-दोष निवारणार्थं, सर्व व्याधि परिहारपूर्वक दीर्घायुष्यारोग्य सिद्ध्यर्थं"
  },
  santana: {
    key: "santana",
    labelKn: "ಸಂತಾನ ಪ್ರಾಪ್ತಿ & ವಂಶೋದ್ಧಾರ",
    labelEn: "Progeny & Child Blessings",
    icon: "👶",
    descriptionKn: "ಸದ್ಗುಣ ಸಂಪನ್ನ ಸಂತಾನ ಭಾಗ್ಯ, ಗರ್ಭರಕ್ಷಣೆ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ",
    descriptionEn: "Blessings of virtuous children, safe pregnancy and family lineage growth",
    sanskritPhala: "सकल गर्भदोष निवारणपूर्वक सत्सन्तान-पुत्र-पौत्र अभिवृद्ध्यर्थं, वंशोद्धारार्थं"
  },
  runamukti: {
    key: "runamukti",
    labelKn: "ಋಣಮುಕ್ತಿ & ಆರ್ಥಿಕ ಅಭಿವೃದ್ಧಿ",
    labelEn: "Debt Relief & Abundance",
    icon: "💰",
    descriptionKn: "ಸಾಲಬಾಧೆ ಮುಕ್ತಿ, ಆರ್ಥಿಕ ಸ್ಥಿರತೆ, ಮಹಾಲಕ್ಷ್ಮಿ ಕಟಾಕ್ಷ ಹಾಗೂ ಸಂಪತ್ತು",
    descriptionEn: "Total clearance of debts, financial stability, wealth and Lakshmi's grace",
    sanskritPhala: "समस्त ऋण-बाधा विमुक्तिपूर्वक दारिद्र्य नाशनार्थं, स्थिर धन-धान्य समृद्धि सिद्ध्यर्थं"
  },
  custom: {
    key: "custom",
    labelKn: "ವಿಶೇಷ ಮನೋಕಾಮನೆ (ಕಸ್ಟಮ್)",
    labelEn: "Custom Sacred Wish",
    icon: "✨",
    descriptionKn: "ಭಕ್ತರ ನಿರ್ದಿಷ್ಟ ಇಷ್ಟಾರ್ಥ ಅಥವಾ ಸಂಕಲ್ಪ",
    descriptionEn: "Devotee's custom written prayer and intention",
    sanskritPhala: "मम मनोगत विशेष सङ्कल्प सिद्ध्यर्थं, श्री परमेश्वर प्रीत्यर्थं"
  }
};

export interface SankalpaConfig {
  devoteeName: string;
  gotra: string;
  nakshatra?: string;
  rashi?: string;
  purposeKey: SankalpaPurposeKey;
  customGoal?: string;
  priestName?: string;
}

/**
 * Builds authentic Vedic Sankalpa in pure Sanskrit (Devanagari) for audio recitation
 */
export function buildSanskritSankalpaMantra(cfg: SankalpaConfig): string {
  const purpose = SANKALPA_PURPOSES[cfg.purposeKey] || SANKALPA_PURPOSES.kutumba;
  const devotee = cfg.devoteeName && cfg.devoteeName.trim() ? cfg.devoteeName.trim() : "भक्तः";
  const gotra = cfg.gotra && cfg.gotra.trim() ? cfg.gotra.trim() : "काश्यप";

  const goalPhala = (cfg.purposeKey === "custom" && cfg.customGoal && cfg.customGoal.trim())
    ? `मम मनोगत ${cfg.customGoal.trim()} सिद्ध्यर्थं`
    : purpose.sanskritPhala;

  return `ॐ अस्य श्री मन्महाविष्णोराज्ञया प्रवर्तमानस्य अद्य ब्रह्मणो द्वितीये परार्धे श्वेतवराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे प्रथमपादे जम्बूद्वीपे भरतवर्षे भरतखण्डे मेरोः दक्षिणदिग्भागे शुभे शोभने मुहूर्ते...

${gotra} गोत्रोत्पन्नस्य, ${devotee} नामधेयस्य (मम सहकुटुम्बस्य),

${goalPhala},

धर्मार्थ-काम-मोक्ष चतुर्विध पुरुषार्थ फल सिद्ध्यर्थं,
श्री परमेश्वर प्रीत्यर्थं, एतत् पूजा/व्रत कर्म अहं करिष्ये॥`;
}

/**
 * Builds localized Sankalpa explanation for reading on screen
 */
export function buildLocalizedSankalpaText(cfg: SankalpaConfig, lang: SevaLang = "kn"): {
  title: string;
  summary: string;
  intentionText: string;
} {
  const purpose = SANKALPA_PURPOSES[cfg.purposeKey] || SANKALPA_PURPOSES.kutumba;
  const devotee = cfg.devoteeName || "ಭಕ್ತರು";
  const gotra = cfg.gotra || "ಕಾಶ್ಯಪ";

  if (lang === "en") {
    return {
      title: "Sacred Personal Sankalpa (Divine Intention)",
      summary: `Praying on behalf of devotee ${devotee} (${gotra} Gotra).`,
      intentionText: `For the supreme fulfillment of: "${purpose.labelEn}". ${purpose.descriptionEn}. May Lord Almighty bless this spiritual endeavor with victory and peace.`
    };
  }

  return {
    title: "ವೈದಿಕ ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪ (ಪವಿತ್ರ ಮನೋಕಾಮನೆ)",
    summary: `ಭಕ್ತರು: ${devotee} · ಗೋತ್ರ: ${gotra}`,
    intentionText: `ಸಂಕಲ್ಪದ ಉದ್ದೇಶ: "${purpose.labelKn}". ${purpose.descriptionKn}. ಸರ್ವ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಭಗವಂತನ ಕೃಪೆಯಿಂದ ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳು ಶೀಘ್ರವೇ ನೆರವೇರಲಿ.`
  };
}
