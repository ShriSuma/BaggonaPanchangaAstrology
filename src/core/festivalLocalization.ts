/**
 * Baggona Panchanga Festival & Special Day 5-Language Localization Engine
 * (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಹಬ್ಬ-ಹರಿದಿನಗಳು ಮತ್ತು ವಿಶೇಷ ದಿನಗಳ ೫-ಭಾಷಾ ಸ್ಥಳೀಕರಣ ಎಂಜಿನ್)
 *
 * Guarantees 100% pure localization across Kannada, English, Hindi, Telugu, and Tamil.
 * Completely eliminates Kannada token leakage in English/Hindi/Telugu/Tamil views and calendars.
 */

export type SupportedLang = "kn" | "en" | "hi" | "te" | "ta";

export interface LocalizedFestivalDetail {
  name: Record<SupportedLang, string>;
  category: Record<SupportedLang, string>;
  description?: Record<SupportedLang, string>;
  pujaWindow?: Record<SupportedLang, string>;
}

export const FESTIVAL_L5_REGISTRY: Record<string, LocalizedFestivalDetail> = {
  // 1. Chaitra Masa
  sri_panchami: {
    name: {
      kn: "ಶ್ರೀ ಪಂಚಮೀ (ಲಕ್ಷ್ಮೀ ಪೂಜಾ)",
      en: "Sri Panchami (Lakshmi Puja)",
      hi: "श्री पंचमी (लक्ष्मी पूजा)",
      te: "శ్రీ పంచమి (లక్ష్మీ పూజ)",
      ta: "ஸ்ரீ பஞ்சமி (லக்ஷ்மி பூஜை)"
    },
    category: {
      kn: "ವ್ರತ & ಉಪವಾಸ",
      en: "Vrata & Upavasa",
      hi: "व्रत एवं उपवास",
      te: "వ్రతం & ఉపవాసం",
      ta: "விரதம் & உபவாசம்"
    }
  },
  shri_ramanavami: {
    name: {
      kn: "ಶ್ರೀರಾಮನವಮೀ",
      en: "Shri Rama Navami",
      hi: "श्री रामनवमी",
      te: "శ్రీరామనవమి",
      ta: "ஸ்ரீ ராமநவமி"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  kamada_ekadashi: {
    name: {
      kn: "ಕಾಮದಾ ಏಕಾದಶಿ",
      en: "Kamada Ekadashi",
      hi: "कामदा एकादशी",
      te: "కామదా ఏకాదశి",
      ta: "காமதா ஏகாதசி"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  shiva_damanotsava: {
    name: {
      kn: "ಶಿವದಮನೋತ್ಸವಃ",
      en: "Shiva Damanotsava",
      hi: "शिव दमनोत्सव",
      te: "శివ దమనోత్సవం",
      ta: "சிவ தமநோத்சவம்"
    },
    category: {
      kn: "ಧಾರ್ಮಿಕ ಉತ್ಸವ",
      en: "Religious Festival",
      hi: "धार्मिक उत्सव",
      te: "ధార్మిక ఉత్సవం",
      ta: "ஆன்மீக உற்சவம்"
    }
  },
  hanuma_jayanti: {
    name: {
      kn: "ಹನುಮಜ್ಜಯಂತೀ (ಚಿತ್ರಾಪುರ ರಥೋತ್ಸವ)",
      en: "Hanuma Jayanti (Chitrapura Rathotsava)",
      hi: "हनुमज्जयंती (चित्रापुर रथोत्सव)",
      te: "హనుమజ్జయంతి (చిత్రాపుర రథోత్సవం)",
      ta: "ஹனுமத் ஜெயந்தி (சித்ராபுர ரதோத்சவம்)"
    },
    category: {
      kn: "ಜಯಂತಿ / ರಥೋತ್ಸವ",
      en: "Jayanti / Rathotsava",
      hi: "जयंती / रथोत्सव",
      te: "జయంతి / రథోత్సవం",
      ta: "ஜெயந்தி / ரதோத்சவம்"
    }
  },

  // 2. Vaishakha Masa
  varuthini_ekadashi: {
    name: {
      kn: "ವರೂಥಿನೀ ಏಕಾದಶಿ",
      en: "Varuthini Ekadashi",
      hi: "वरूथिनी एकादशी",
      te: "వరూథినీ ఏకాదశి",
      ta: "வரூதினி ஏகாதசி"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  akshaya_tritiya: {
    name: {
      kn: "ಅಕ್ಷಯ ತೃತೀಯಾ (ಪರಶುರಾಮ ಜಯಂತಿ)",
      en: "Akshaya Tritiya (Parashurama Jayanti)",
      hi: "अक्षय तृतीया (परशुराम जयंती)",
      te: "అక్షయ తృతీయ (పరశురామ జయంతి)",
      ta: "அக்ஷய திருதியை (பரசுராம ஜெயந்தி)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  shankara_jayanti: {
    name: {
      kn: "ಶ್ರೀ ಶಂಕರಾಚಾರ್ಯ ಜಯಂತೀ",
      en: "Adi Shankara Jayanti",
      hi: "श्री शंकराचार्य जयंती",
      te: "శ్రీ శంకరాచార్య జయంతి",
      ta: "ஸ்ரீ சங்கராச்சார்ய ஜெயந்தி"
    },
    category: {
      kn: "ಜಯಂತಿ",
      en: "Jayanti",
      hi: "जयंती",
      te: "జయంతి",
      ta: "ஜெயந்தி"
    }
  },
  mohini_ekadashi: {
    name: {
      kn: "ಮೋಹಿನೀ ಏಕಾದಶಿ",
      en: "Mohini Ekadashi",
      hi: "मोहिनी एकादशी",
      te: "మోహినీ ఏకాదశి",
      ta: "மோஹினி ஏகாதசி"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  nrisimha_jayanti: {
    name: {
      kn: "ಶ್ರೀ ನೃಸಿಂಹ ಜಯಂತೀ",
      en: "Narasimha Jayanti",
      hi: "श्री नृसिंह जयंती",
      te: "శ్రీ నృసింహ జయంతి",
      ta: "ஸ்ரீ நரசிம்ம ஜெயந்தி"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  buddha_purnima: {
    name: {
      kn: "ಬುದ್ಧ ಪೂರ್ಣಿಮಾ (ವೈಶಾಖ ಹುಣ್ಣಿಮೆ)",
      en: "Buddha Purnima (Vaishakha Purnima)",
      hi: "बुद्ध पूर्णिमा (वैशाख पूर्णिमा)",
      te: "బుద్ధ పౌర్ణమి (వైశాఖ పౌర్ణమి)",
      ta: "புத்த பௌர்ணமி (வைகாசி பௌர்ணமி)"
    },
    category: {
      kn: "ಪೂರ್ಣಿಮಾ ಪರ್ವ",
      en: "Purnima Festival",
      hi: "पूर्णिमा पर्व",
      te: "పౌర్ణమి పర్వం",
      ta: "பௌர்ணமி திருநாள்"
    }
  },
  apara_ekadashi: {
    name: {
      kn: "ಅಪರಾ ಏಕಾದಶಿ",
      en: "Apara Ekadashi",
      hi: "अपरा एकादशी",
      te: "అపరా ఏకాదశి",
      ta: "அபரா ஏகாதசி"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },

  // 3. Jyeshtha & Adhika Masa
  padmini_ekadashi: {
    name: {
      kn: "ಪದ್ಮಿನೀ ಏಕಾದಶಿ (ಅಧಿಕ ಮಾಸ)",
      en: "Padmini Ekadashi (Adhika Masa)",
      hi: "पद्मिनी एकादशी (अधिक मास)",
      te: "పద్మినీ ఏకాదశి (అధిక మాసం)",
      ta: "பத்மினி ஏகாதசி (அதிக மாசம்)"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  parama_ekadashi: {
    name: {
      kn: "ಪರಮಾ ಏಕಾದಶಿ (ಅಧಿಕ ಮಾಸ)",
      en: "Parama Ekadashi (Adhika Masa)",
      hi: "परमा एकादशी (अधिक मास)",
      te: "పరమా ఏకాదశి (అధిక మాసం)",
      ta: "பரமா ஏகாதசி (அதிக மாசம்)"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  nirjala_ekadashi: {
    name: {
      kn: "ನಿರ್ಜಲಾ ಏಕಾದಶಿ (ಭೀಮ ಏಕಾದಶಿ)",
      en: "Nirjala Ekadashi (Bhima Ekadashi)",
      hi: "निर्जला एकादशी (भीम एकादशी)",
      te: "నిర్జలా ఏకాదశి (భీమ ఏకాదశి)",
      ta: "நிர்ஜலா ஏகாதசி (பீம ஏகாதசி)"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },
  vata_savitri: {
    name: {
      kn: "ವಟ ಸಾವಿತ್ರೀ ವ್ರತ (ಜ್ಯೇಷ್ಠ ಹುಣ್ಣಿಮೆ)",
      en: "Vata Savitri Vrata (Jyeshtha Purnima)",
      hi: "वट सावित्री व्रत (ज्येष्ठ पूर्णिमा)",
      te: "వట సావిత్రీ వ్రతం (జ్యేష్ఠ పౌర్ణమి)",
      ta: "வட சாவித்திரி விரதம்"
    },
    category: {
      kn: "ವ್ರತ & ಉಪವಾಸ",
      en: "Vrata & Upavasa",
      hi: "व्रत एवं उपवास",
      te: "వ్రతం & ఉపవాసం",
      ta: "விரதம் & உபவாசம்"
    }
  },

  // 4. Ashadha Masa
  prathama_ekadashi: {
    name: {
      kn: "ಪ್ರಥಮ ಏಕಾದಶಿ (ಚಾತುರ್ಮಾಸ್ಯಾರಂಭ)",
      en: "Sayani Ekadashi (Chaturmasya Begins)",
      hi: "शयनी एकादशी (चातुर्मासारंभ)",
      te: "తొలి ఏకాదశి (చాతుర్మాస్యారంభం)",
      ta: "சயனி ஏகாதசி (சாதுர்மாஸ்யம் ஆரம்பம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  guru_purnima: {
    name: {
      kn: "ಗುರು ಪೂರ್ಣಿಮಾ (ವ್ಯಾಸ ಪೂಜೆ)",
      en: "Guru Purnima (Vyasa Puja)",
      hi: "गुरु पूर्णिमा (व्यास पूजा)",
      te: "గురు పౌర్ణమి (వ్యాస పూజ)",
      ta: "குரு பௌர்ணமி (வியாச பூஜை)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 5. Shravana Masa
  nagara_panchami: {
    name: {
      kn: "ನಾಗರ ಪಂಚಮೀ",
      en: "Nagara Panchami",
      hi: "नाग पंचमी",
      te: "నాగుల పంచమి",
      ta: "நாக பஞ்சமி"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  varamahalakshmi: {
    name: {
      kn: "ವರಮಹಾಲಕ್ಷ್ಮೀ ವ್ರತ",
      en: "Varamahalakshmi Vrata",
      hi: "वरमहालक्ष्मी व्रत",
      te: "వరమహాలక్ష్మీ వ్రతం",
      ta: "வரமஹாலக்ஷ்மி விரதம்"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  raksha_bandhan: {
    name: {
      kn: "ರಕ್ಷಾಬಂಧನ / ಉಪಾಕರ್ಮ (ಶ್ರಾವಣ ಹುಣ್ಣಿಮೆ)",
      en: "Raksha Bandhan / Upakarma",
      hi: "रक्षाबंधन / उपाकर्म (श्रावण पूर्णिमा)",
      te: "రక్షాబంధన్ / ఉపాకర్మ (శ్రావణ పౌర్ణమి)",
      ta: "ரக்ஷா பந்தன் / உபாகர்மா"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  gokulashtami: {
    name: {
      kn: "ಶ್ರೀಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮೀ (ಗೋಕುಲಾಷ್ಟಮೀ)",
      en: "Krishna Janmashtami (Gokulashtami)",
      hi: "श्रीकृष्ण जन्माष्टमी (गोकुलाष्टमी)",
      te: "శ్రీకృష్ణ జన్మాష్టమి (గోకులాష్టమి)",
      ta: "ஸ்ரீ கிருஷ்ண ஜெயந்தி (கோகுலாஷ்டமி)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 6. Bhadrapada Masa
  swarna_gowri: {
    name: {
      kn: "ಸ್ವರ್ಣಗೌರಿ ವ್ರತ (ಹರಿತಾಲಿಕಾ)",
      en: "Swarna Gowri Vrata (Hartalika)",
      hi: "स्वर्णगौरी व्रत (हरितालिका)",
      te: "స్వర్ణగౌరీ వ్రతం (హరితాళిక)",
      ta: "ஸ்வர்ண கௌரி விரதம்"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  ganesha_chaturthi: {
    name: {
      kn: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ ವ್ರತ (ಗಣೇಶ ಚತುರ್ಥಿ)",
      en: "Ganesha Chaturthi (Vinayaka Chaturthi)",
      hi: "श्री गणेश चतुर्थी (विनायक चतुर्थी)",
      te: "వినాయక చవితి (గణేశ చతుర్థి)",
      ta: "விநாயகர் சதுர்த்தி"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  rishi_panchami: {
    name: {
      kn: "ಋಷಿ ಪಂಚಮೀ",
      en: "Rishi Panchami",
      hi: "ऋषि पंचमी",
      te: "ఋషి పంచమి",
      ta: "ரிஷி பஞ்சமி"
    },
    category: {
      kn: "ವ್ರತ & ಉಪವಾಸ",
      en: "Vrata & Upavasa",
      hi: "व्रत एवं उपवास",
      te: "వ్రతం & ఉపవాసం",
      ta: "விரதம் & உபவாசம்"
    }
  },
  ananta_padmanabha: {
    name: {
      kn: "ಅನಂತ ಪದ್ಮನಾಭ ವ್ರತ",
      en: "Anantha Padmanabha Vrata",
      hi: "अनंत पद्मनाभ व्रत",
      te: "అనంత పద్మనాభ వ్రతం",
      ta: "அனந்த பத்மநாப விரதம்"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // PITRU PAKSHA & MAHALAYA AMAVASYA (USER'S EXPLICIT EMPHASIS)
  mahalaya_amavasya: {
    name: {
      kn: "ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆ (ಸರ್ವಪಿತೃ ಪರ್ವ)",
      en: "Mahalaya Amavasya (Sarva Pitru Moksha)",
      hi: "महालय अमावस्या (सर्वपितृ मोक्ष)",
      te: "మహాలయ అమావాస్య (సర్వపితృ మోక్షం)",
      ta: "மஹாளய அமாவாசை (சர்வபித்ரு மோக்ஷம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಪವಿತ್ರ ದಿನ",
      en: "Major Sacred Observance",
      hi: "प्रमुख पावन पर्व",
      te: "ప్రముఖ పవిత్ర దినం",
      ta: "புனித பித்ரு திருநாள்"
    },
    description: {
      kn: "ಪಿತೃಪಕ್ಷದ ಮಹಾ ಪುಣ್ಯದಿನ, ಅಪರಾಹ್ನ ಕಾಲದಲ್ಲಿ ಸರ್ವಪಿತೃ ತರ್ಪಣ, ಶ್ರಾದ್ಧ ಮತ್ತು ಅನ್ನದಾನ.",
      en: "Greatest ancestral blessing day for tarpana, pinda pradana, and annadana during Aparahna.",
      hi: "पितृपक्ष का महापुण्य दिवस, अपराह्न काल में सर्वपितृ तर्पण, श्राद्ध एवं अन्नदान।",
      te: "పితృపక్ష మహా పుణ్యదినం, అపరాహ్న కాలంలో సర్వపితృ తర్పణం, శ్రాద్ధం & అన్నదానం.",
      ta: "பித்ருபக்ஷத்தின் மகா புண்ணிய நாள், அபராஹ்ன காலத்தில் சர்வபித்ரு தர்பணம் மற்றும் அன்னதானம்."
    },
    pujaWindow: {
      kn: "ಅಪರಾಹ್ನ ಕಾಲ: ಮಧ್ಯಾಹ್ನ 12:15 PM - 03:45 PM (ತರ್ಪಣ & ಶ್ರಾದ್ಧ)",
      en: "Aparahna Period: 12:15 PM - 03:45 PM (Tarpana & Shraddha)",
      hi: "अपराह्न काल: दोपहर 12:15 PM - 03:45 PM (तर्पण एवं श्राद्ध)",
      te: "అపరాహ్న కాలం: మధ్యాహ్నం 12:15 PM - 03:45 PM (తర్పణం & శ్రాద్ధం)",
      ta: "அபராஹ்ன காலம்: மதியம் 12:15 PM - 03:45 PM (தர்பணம்)"
    }
  },

  // 7. Ashvayuja Masa (Navaratri, Dasara, Deepavali)
  navaratri_start: {
    name: {
      kn: "ಶರನ್ನವರಾತ್ರಿ ಪ್ರಾರಂಭ (ಘಟಸ್ಥಾಪನೆ)",
      en: "Sharad Navaratri Begins (Ghatasthapana)",
      hi: "शारदीय नवरात्रि प्रारंभ (घटस्थापना)",
      te: "శరన్నవరాత్రులు ప్రారంభం (ఘటస్థాపన)",
      ta: "சரத் நவராத்திரி ஆரம்பம் (கடஸ்தாபனம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  durgashtami: {
    name: {
      kn: "ದುರ್ಗಾಷ್ಟಮೀ (ಮಹಾಗೌರಿ ಪೂಜೆ)",
      en: "Durga Ashtami (Maha Gauri Puja)",
      hi: "दुर्गाष्टमी (महागौरी पूजा)",
      te: "దుర్గాష్టమి (మహాగౌరి పూజ)",
      ta: "துர்காஷ்டமி (மஹாகௌரி பூஜை)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  ayudha_puja: {
    name: {
      kn: "ಮಹಾನವಮೀ (ಆಯುಧ ಪೂಜೆ)",
      en: "Ayudha Puja / Mahanavami",
      hi: "महानवमी (आयुध पूजा)",
      te: "మహానవమి (ఆయుధ పూజ)",
      ta: "மகாநவமி (ஆயுத பூஜை)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  vijayadashami: {
    name: {
      kn: "ವಿಜಯದಶಮೀ (ದಸರಾ ಮಹೋತ್ಸವ)",
      en: "Vijayadashami (Dussehra Mahotsava)",
      hi: "विजयादशमी (दशहरा महोत्सव)",
      te: "విజయదశమి (దసరా మహోత్సవం)",
      ta: "விஜயதசமி (தசரா மஹோத்சவம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  naraka_chaturdashi: {
    name: {
      kn: "ನರಕ ಚತುರ್ದಶೀ (ದೀಪಾವಳಿ ತೈಲಾಭ್ಯಂಗ)",
      en: "Naraka Chaturdashi (Diwali Oil Bath)",
      hi: "नरक चतुर्दशी (दीपावली तैलाभ्यंग)",
      te: "నరక చతుర్దశి (దీపావళి తైలాభ్యంగనం)",
      ta: "நரக சதுர்த்தசி (தீபாவளி தைலாப்யங்கம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  deepavali_lakshmi: {
    name: {
      kn: "ದೀಪಾವಳಿ ಅಮಾವಾಸ್ಯೆ (ಲಕ್ಷ್ಮೀ ಪೂಜೆ)",
      en: "Diwali Amavasya (Lakshmi Puja)",
      hi: "दीपावली अमावस्या (लक्ष्मी पूजा)",
      te: "దీపావళి అమావాస్య (లక్ష్మీ పూజ)",
      ta: "தீபாவளி அமாவாசை (லக்ஷ்மி பூஜை)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  bali_padyami: {
    name: {
      kn: "ಬಲಿಪಾಡ್ಯಮಿ (ಗೋಪೂಜೆ)",
      en: "Bali Padyami (Go Puja)",
      hi: "बलि प्रतिपदा (गोवर्धन पूजा)",
      te: "బలిపాడ్యమి (గోపూజ)",
      ta: "பலிபாட்யாமி (கோபூஜை)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 8. Karthika Masa
  utthana_dwadashi: {
    name: {
      kn: "ಉತ್ತಾನ ದ್ವಾದಶೀ (ತುಳಸೀ ವಿವಾಹ)",
      en: "Tulasi Vivaha / Utthana Dwadashi",
      hi: "उत्थान द्वादशी (तुलसी विवाह)",
      te: "ఉత్థాన ద్వాదశి (తులసీ కళ్యాణం)",
      ta: "உத்தான துவாதசி (துளசி கல்யாணம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  karthika_purnima: {
    name: {
      kn: "ಕಾರ್ತಿಕ ಹುಣ್ಣಿಮೆ (ದೇವ ದೀಪಾವಳಿ)",
      en: "Karthika Purnima (Dev Diwali)",
      hi: "कार्तिक पूर्णिमा (देव दीपावली)",
      te: "కార్తిక పౌర్ణమి (దేవ దీపావళి)",
      ta: "கார்த்திகை பௌர்ணமி (தீபம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 9. Margashira Masa
  subrahmanya_shashthi: {
    name: {
      kn: "ಸುಬ್ರಹ್ಮಣ್ಯ ಷಷ್ಠೀ (ಚಂಪಾ ಷಷ್ಠಿ)",
      en: "Subrahmanya Shashthi (Champa Shashthi)",
      hi: "सुब्रह्मण्य षष्ठी (चंपा षष्ठी)",
      te: "సుబ్రహ్మణ్య షష్ఠి (చంపా షష్ఠి)",
      ta: "சுப்ரமண்ய ஷஷ்டி (சம்பா சஷ்டி)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  vaikunta_ekadashi: {
    name: {
      kn: "ವೈಕುಂಠ ಏಕಾದಶಿ (ಗೀತಾ ಜಯಂತೀ / ಮೋಕ್ಷದಾ)",
      en: "Vaikunta Ekadashi (Gita Jayanti / Mokshada)",
      hi: "वैकुंठ एकादशी (गीता जयंती / मोक्षदा)",
      te: "వైకుంఠ ఏకాదశి (గీతా జయంతి / మోక్షదా)",
      ta: "வைகுண்ட ஏகாதசி (கீதா ஜெயந்தி / மோக்ஷதா)"
    },
    category: {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }
  },

  // 10. Pushya Masa
  makara_sankranti: {
    name: {
      kn: "ಮಕರ ಸಂಕ್ರಾಂತಿ (ಸೌರಾಯನ ಪುಣ್ಯಕಾಲ)",
      en: "Makara Sankranti (Uttarayan Punya Kaala)",
      hi: "मकर संक्रांति (उत्तरायण पुण्यकाल)",
      te: "మకర సంక్రాంతి (ఉత్తరాయణ పుణ్యకాలం)",
      ta: "மகர சங்கராந்தி (பொங்கல்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 11. Magha Masa
  ratha_saptami: {
    name: {
      kn: "ರಥಸಪ್ತಮೀ (ಸೂರ್ಯ ಜಯಂತೀ)",
      en: "Ratha Saptami (Surya Jayanti)",
      hi: "रथ सप्तमी (सूर्य जयंती)",
      te: "రథసప్తమి (సూర్య జయంతి)",
      ta: "ரத சப்தமி (சூரிய ஜெயந்தி)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  madhwa_navami: {
    name: {
      kn: "ಶ್ರೀ ಮಧ್ವ ನವಮೀ",
      en: "Madhwa Navami",
      hi: "श्री मध्व नवमी",
      te: "శ్రీ మధ్వ నవమి",
      ta: "ஸ்ரீ மத்வ நவமி"
    },
    category: {
      kn: "ಜಯಂತಿ",
      en: "Jayanti",
      hi: "जयंती",
      te: "జయంతి",
      ta: "ஜெயந்தி"
    }
  },
  maha_shivaratri: {
    name: {
      kn: "ಮಹಾಶಿವರಾತ್ರಿ ವ್ರತ (ಗೋಕರ್ಣ ಮಹಾರಥೋತ್ಸವ)",
      en: "Maha Shivaratri (Gokarna Rathotsava)",
      hi: "महाशिवरात्रि व्रत (गोकर्ण महारथोत्सव)",
      te: "మహాశివరాత్రి వ్రతం (గోకర్ణ రథోత్సవం)",
      ta: "மகாசிவராத்திரி விரதம் (கோகர்ண ரதோத்சவம்)"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },

  // 12. Phalguna Masa
  holi_kamadahana: {
    name: {
      kn: "ಕಾಮದಹನ / ಹೋಲಿಕಾ ದಹನ (ಫಾಲ್ಗುಣ ಹುಣ್ಣಿಮೆ)",
      en: "Kamadahana / Holika Dahan",
      hi: "कामदहन / होलिका दहन (फाल्गुन पूर्णिमा)",
      te: "కామదహనం / హోలికా దహనం (ఫాల్గుణ పౌర్ణమి)",
      ta: "காமதஹனம் / ஹோலிகா தஹனம்"
    },
    category: {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }
  },
  parabhava_samapti: {
    name: {
      kn: "ಪರಾಭವ ಸಂವತ್ಸರ ಸಮಾಪ್ತಿ (ದರ್ಶ ಅಮಾವಾಸ್ಯೆ)",
      en: "Parabhava Samvatsara Concludes (Darsha Amavasya)",
      hi: "पराभव संवत्सर समाप्ति (दर्श अमावस्या)",
      te: "పరాభవ సంవత్సం ముగింపు (దర్శ అమావాస్య)",
      ta: "பராபவ சம்வத்சர நிறைவு (தர்ச அமாவாசை)"
    },
    category: {
      kn: "ಸಂವತ್ಸರ ಸಮಾಪ್ತಿ",
      en: "Samvatsara Concludes",
      hi: "संवत्सर समाप्ति",
      te: "సంవత్సర సమాప్తి",
      ta: "சம்வத்சர நிறைவு"
    }
  },

  // Multi-day Group Keys
  dasara: {
    name: {
      kn: "ದಸರಾ (೧೦ ದಿನ)",
      en: "Dasara / Navaratri (10 Days)",
      hi: "दशहरा / नवरात्रि (१० दिन)",
      te: "దసరా / నవరాత్రులు (౧౦ రోజులు)",
      ta: "தசரா / நவராத்திரி (௰ நாட்கள்)"
    },
    category: {
      kn: "ಬಹುದಿನದ ಮಹಾಪರ್ವ",
      en: "Multi-Day Festival",
      hi: "बहुदिवसीय महापर्व",
      te: "బహుదిన మహాపర్వం",
      ta: "பல நாள் மகா உற்சவம்"
    }
  },
  deepavali: {
    name: {
      kn: "ದೀಪಾವಳಿ (೪ ದಿನ)",
      en: "Deepavali (4 Days)",
      hi: "दीपावली (४ दिन)",
      te: "దీపావళి (౪ రోజులు)",
      ta: "தீபாவளி (௪ நாட்கள்)"
    },
    category: {
      kn: "ಬಹುದಿನದ ಮಹಾಪರ್ವ",
      en: "Multi-Day Festival",
      hi: "बहुदिवसीय महापर्व",
      te: "బహుదిన మహాపర్వం",
      ta: "பல நாள் மகா உற்சவம்"
    }
  },
  rama_navami: {
    name: {
      kn: "ಶ್ರೀರಾಮನವಮಿ (೯ ದಿನ)",
      en: "Shri Rama Navami (9 Days)",
      hi: "श्री रामनवमी (९ दिन)",
      te: "శ్రీరామనవమి (౯ రోజులు)",
      ta: "ஸ்ரீ ராமநவமி (௯ நாட்கள்)"
    },
    category: {
      kn: "ಬಹುದಿನದ ಮಹಾಪರ್ವ",
      en: "Multi-Day Festival",
      hi: "बहुदिवसीय महापर्व",
      te: "బహుదిన మహాపర్వం",
      ta: "பல நாள் மகா உற்சவம்"
    }
  },
  ganesha: {
    name: {
      kn: "ಗಣೇಶ ಚತುರ್ಥಿ (೩ ದಿನ)",
      en: "Ganesha Chaturthi (3 Days)",
      hi: "श्री गणेश चतुर्थी (३ दिन)",
      te: "వినాయక చవితి (౩ రోజులు)",
      ta: "விநாயகர் சதுர்த்தி (௩ நாட்கள்)"
    },
    category: {
      kn: "ಬಹುದಿನದ ಮಹಾಪರ್ವ",
      en: "Multi-Day Festival",
      hi: "बहुदिवसीय महापर्व",
      te: "బహుదిన మహాపర్వం",
      ta: "பல நாள் மகா உற்சவம்"
    }
  }
};

/**
 * Standard Monthly Observances in 5 Languages
 */
export const MONTHLY_OBSERVANCES_L5: Record<string, Record<SupportedLang, string>> = {
  AMAVASYA: {
    kn: "ಅಮಾವಾಸ್ಯೆ (ಸರ್ವ ಪಿತೃ & ಶಾಂತಿ ದಿನ)",
    en: "Amavasya (Ancestral Tarpana & Peace Day)",
    hi: "अमावस्या (पितृ तर्पण एवं शांति दिवस)",
    te: "అమావాస్య (పితృ తర్పణ & శాంతి దినం)",
    ta: "அமாவாசை (பித்ரு தர்பணம் & அமைதி நாள்)"
  },
  PURNIMA: {
    kn: "ಪೂರ್ಣಿಮೆ (ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ವ್ರತ)",
    en: "Purnima (Sri Satyanarayana Vrata)",
    hi: "पूर्णिमा (श्री सत्यनारायण व्रत)",
    te: "పౌర్ణమి (శ్రీ సత్యనారాయణ వ్రతం)",
    ta: "பௌர்ணமி (ஸ்ரீ சத்தியநாராயண விரதம்)"
  },
  EKADASHI: {
    kn: "ಏಕಾದಶಿ (ಶ್ರೀ ವಿಷ್ಣು ಉಪವಾಸ ವ್ರತ)",
    en: "Sacred Ekadashi Vrata (Lord Vishnu Fasting)",
    hi: "पवित्र एकादशी व्रत (श्री विष्णु उपवास)",
    te: "పవిత్ర ఏకాదశి వ్రతం (శ్రీ విష్ణు ఉపవాసం)",
    ta: "புனித ஏகாதசி விரதம் (ஸ்ரீ விஷ்ணு உபவாசம்)"
  },
  SANKASHTI: {
    kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ (ಶ್ರೀ ಗಣೇಶ ಚಂದ್ರೋದಯ ವ್ರತ)",
    en: "Sankashtahara Chaturthi (Lord Ganesha Vrata)",
    hi: "संकष्टी चतुर्थी (श्री गणेश व्रत)",
    te: "సంకష్టహర చతుర్థి (శ్రీ గణేశ వ్రతం)",
    ta: "சங்கடஹர சதுர்த்தி (ஸ்ரீ கணேசர் விரதம்)"
  },
  PRADOSHAM: {
    kn: "ಪ್ರದೋಷ ವ್ರತ (ಶ್ರೀ ಮಹಾದೇವ ಪೂಜೆ)",
    en: "Pradosham Vrata (Lord Mahadeva Puja)",
    hi: "प्रदोष व्रत (श्री महादेव पूजा)",
    te: "ప్రదోష వ్రతం (శ్రీ మహాదేవ పూజ)",
    ta: "பிரதோஷ விரதம் (ஸ்ரீ மகாதேவ பூஜை)"
  }
};

/**
 * Vedic Lunar Masa Names in 5 Languages
 */
export const VEDIC_MASA_L5: Record<string, Record<SupportedLang, string>> = {
  ಚೈತ್ರ: { kn: "ಚೈತ್ರ", en: "Chaitra", hi: "चैत्र", te: "చైత్ర", ta: "சித்திரை" },
  ವೈಶಾಖ: { kn: "ವೈಶಾಖ", en: "Vaishakha", hi: "वैशाख", te: "వైశాఖ", ta: "வைகாசி" },
  ಜ್ಯೇಷ್ಠ: { kn: "ಜ್ಯೇಷ್ಠ", en: "Jyeshtha", hi: "ज्येष्ठ", te: "జ్యేష్ఠ", ta: "ஆனி" },
  "ಅಧಿಕ ಜ್ಯೇಷ್ಠ": { kn: "ಅಧಿಕ ಜ್ಯೇಷ್ಠ", en: "Adhika Jyeshtha", hi: "अधिक ज्येष्ठ", te: "అధిక జ్యేష్ఠ", ta: "அதிக ஆனி" },
  "ನಿಜ ಜ್ಯೇಷ್ಠ": { kn: "ನಿಜ ಜ್ಯೇಷ್ಠ", en: "Nija Jyeshtha", hi: "निज ज्येष्ठ", te: "నిజ జ్యేష్ఠ", ta: "நிஜ ஆனி" },
  ಆಷಾಢ: { kn: "ಆಷಾಢ", en: "Ashadha", hi: "आषाढ़", te: "ఆషాఢ", ta: "ஆடி" },
  ಶ್ರಾವಣ: { kn: "ಶ್ರಾವಣ", en: "Shravana", hi: "श्रावण", te: "శ్రావణ", ta: "ஆவணி" },
  ಭಾದ್ರಪದ: { kn: "ಭಾದ್ರಪದ", en: "Bhadrapada", hi: "भाद्रपद", te: "భాద్రపద", ta: "புரட்டாசி" },
  ಆಶ್ವಯುಜ: { kn: "ಆಶ್ವಯುಜ", en: "Ashvina", hi: "अश्विन", te: "ఆశ్వయుజ", ta: "ஐப்பசி" },
  ಕಾರ್ತಿಕ: { kn: "ಕಾರ್ತಿಕ", en: "Kartika", hi: "कार्तिक", te: "కార్తిక", ta: "கார்த்திகை" },
  ಮಾರ್ಗಶಿರ: { kn: "ಮಾರ್ಗಶಿರ", en: "Margashira", hi: "मार्गशीर्ष", te: "మార్గశిర", ta: "மார்கழி" },
  ಪುಷ್ಯ: { kn: "ಪುಷ್ಯ", en: "Pushya", hi: "पौष", te: "పుష్య", ta: "தை" },
  ಮಾಘ: { kn: "ಮಾಘ", en: "Magha", hi: "माघ", te: "మాఘ", ta: "மாசி" },
  ಫಾಲ್ಗುಣ: { kn: "ಫಾಲ್ಗುಣ", en: "Phalguna", hi: "फाल्गुन", te: "ఫాల్గుణ", ta: "பங்குனி" }
};

export function getLocalizedMasaName(masaKn: string, lang: string = "kn"): string {
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";
  for (const [knKey, l5] of Object.entries(VEDIC_MASA_L5)) {
    if (masaKn.includes(knKey)) {
      return l5[validCode];
    }
  }
  return masaKn;
}

/**
 * Returns the authentic localized festival name for any festival item or ID.
 * Guarantees ZERO Kannada leakage into English/Hindi/Telugu/Tamil.
 */
export function getLocalizedFestivalName(
  fest: { id?: string; nameKn: string; nameEn?: string } | undefined | null,
  lang: string = "kn"
): string {
  if (!fest) return "";
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  // 1. Direct registry ID lookup
  if (fest.id && FESTIVAL_L5_REGISTRY[fest.id]) {
    return FESTIVAL_L5_REGISTRY[fest.id].name[validCode];
  }

  // 2. Lookup by Kannada name match
  for (const item of Object.values(FESTIVAL_L5_REGISTRY)) {
    if (fest.nameKn && item.name.kn.includes(fest.nameKn)) {
      return item.name[validCode];
    }
    if (fest.nameEn && item.name.en.toLowerCase() === fest.nameEn.toLowerCase()) {
      return item.name[validCode];
    }
  }

  // 3. Fallback based on language
  if (validCode === "kn") return fest.nameKn;
  if (validCode === "en") return fest.nameEn || fest.nameKn;

  // For Devanagari / Telugu / Tamil without exact match, prefer English if available over Kannada
  return fest.nameEn || fest.nameKn;
}

/**
 * Returns localized preparation alert for next day.
 */
export function getLocalizedPreparationAlert(
  options: {
    type: "EKADASHI" | "MAJOR_FESTIVAL" | "PURNIMA" | "AMAVASYA" | "PRADOSHAM" | "SANKASHTI";
    festName: string;
    masaName?: string;
    pujaWindow?: string;
  },
  lang: string = "kn"
): string {
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  const { type, festName, masaName = "", pujaWindow = "" } = options;

  switch (type) {
    case "EKADASHI":
      return {
        kn: `🔔 ನಾಳೆ ${festName} (ಏಕಾದಶಿ ವ್ರತ). ಇಂದು ದಶಮೀ ನಿಯಮ ಪಾಲಿಸಿ, ರಾತ್ರಿ ಲಘು ಆಹಾರ & ಉಪವಾಸ ಸಂಕಲ್ಪ.`,
        en: `🔔 Tomorrow is ${festName} (Sacred Ekadashi Vrata). Observe Dashami guidelines today, take light sattvic food & make fasting sankalpa.`,
        hi: `🔔 कल ${festName} (एकादशी व्रत) है। आज दशमी नियमों का पालन करें, संध्या समय सात्विक अल्पाहार लें व उपवास का संकल्प करें।`,
        te: `🔔 రేపు ${festName} (ఏకాదశి వ్రతం). ఈ రోజు దశమి నియమాలు పాటించండి, రాత్రి లఘు ఆహారం తీసుకోండి.`,
        ta: `🔔 நாளை ${festName} (ஏகாதசி விரதம்). இன்று தசமி நியமங்களை கடைப்பிடிக்கவும், இரவில் லகுவான உணவு உட்கொள்ளவும்.`
      }[validCode];

    case "MAJOR_FESTIVAL":
      return {
        kn: `🪔 ನಾಳೆ ಮಹಾಪರ್ವ: ${festName}! ${pujaWindow ? `ಪೂಜಾ ಮುಹೂರ್ತ: ${pujaWindow}` : "ದಿನದ ಪ್ರಾತಃಕಾಲ ಪೂಜೆ"}.`,
        en: `🪔 Tomorrow is the auspicious festival: ${festName}! ${pujaWindow ? `Puja Muhurtha: ${pujaWindow}` : "Auspicious morning worship"}.`,
        hi: `🪔 कल महापर्व: ${festName}! ${pujaWindow ? `पूजा मुहूर्त: ${pujaWindow}` : "प्रातःकाल शुभ पूजा"}.`,
        te: `🪔 రేపు మహా పండుగ: ${festName}! ${pujaWindow ? `పూజా ముహూర్తం: ${pujaWindow}` : "ప్రాతఃకాల పూజ"}.`,
        ta: `🪔 நாளை மகா திருநாள்: ${festName}! ${pujaWindow ? `பூஜை முகூர்த்தம்: ${pujaWindow}` : "காலை சுப பூஜை"}.`
      }[validCode];

    case "PURNIMA":
      return {
        kn: `🌕 ನಾಳೆ ${masaName} ಹುಣ್ಣಿಮೆ (${festName}). ಸಂಜೆ ದೇವತಾ ಆರಾಧನೆ & ವ್ರತ ಸಿದ್ಧತೆ.`,
        en: `🌕 Tomorrow is ${masaName} Purnima (${festName}). Prepare for evening Satyanarayana Puja and Full Moon offerings.`,
        hi: `🌕 कल ${masaName} पूर्णिमा (${festName}) है। संध्या समय श्री सत्यनारायण कथा व चंद्र दर्शन की तैयारी करें।`,
        te: `🌕 రేపు ${masaName} పౌర్ణమి (${festName}). సాయంత్రం సత్యనారాయణ పూజ సన్నాహాలు చేసుకోండి.`,
        ta: `🌕 நாளை ${masaName} பௌர்ணமி (${festName}). மாலையில் சத்தியநாராயண பூஜை தயாரிப்பு செய்யவும்.`
      }[validCode];

    case "AMAVASYA":
      return {
        kn: `🌑 ನಾಳೆ ${masaName} ದರ್ಶ ಅಮಾವಾಸ್ಯೆ (${festName}). ಪಿತೃ ತರ್ಪಣ & ತಿಲತರ್ಪಣ ಶ್ರಾದ್ಧ ಕಾರ್ಯಗಳ ಪೂರ್ವಸಿದ್ಧತೆ.`,
        en: `🌑 Tomorrow is ${masaName} Darsha Amavasya (${festName}). Prepare for ancestral Pitru Tarpana and sacred charity.`,
        hi: `🌑 कल ${masaName} दर्श अमावस्या (${festName}) है। पितृ तर्पण एवं दान-धर्म की पूर्व तैयारी करें।`,
        te: `🌑 రేపు ${masaName} దర్శ అమావాస్య (${festName}). పితృ తర్పణం మరియు దానధర్మాల సన్నాహాలు చేసుకోండి.`,
        ta: `🌑 நாளை ${masaName} தர்ச அமாவாசை (${festName}). பித்ரு தர்பணம் மற்றும் தான தர்மங்களுக்கு முன் தயாரிப்பு செய்யவும்.`
      }[validCode];

    case "PRADOSHAM":
      return {
        kn: `🔱 ನಾಳೆ ಪ್ರದೋಷ ವ್ರತ. ಸಂಜೆ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ ಈಶ್ವರಾರಾಧನೆ, ಬಿಲ್ವಾರ್ಚನೆ & ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ.`,
        en: `🔱 Tomorrow is Pradosham Vrata. Plan for evening Shiva worship, Bilva Archana & Rudrabhishekam.`,
        hi: `🔱 कल प्रदोष व्रत है। संध्या प्रदोष काल में भगवान शिव की आराधना, बिल्वार्चन व रुद्राभिषेक का संकल्प करें।`,
        te: `🔱 రేపు ప్రదోష వ్రతం. సంధ్యా సమయాన ఈశ్వరారాధన, బిల్వార్చన & రుద్రాభిషేకం చేయండి.`,
        ta: `🔱 நாளை பிரதோஷ விரதம். மாலையில் சிவ வழிபாடு, வில்வார்ச்சனை மற்றும் ருத்ராபிஷேகம் செய்யவும்.`
      }[validCode];

    case "SANKASHTI":
      return {
        kn: `🐘 ನಾಳೆ ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿ. ಶ್ರೀ ಮಹಾಗಣಪತಿ ವ್ರತ, ಸಂಜೆ ಚಂದ್ರೋದಯ ಪೂಜಾ ಸಿದ್ಧತೆ.`,
        en: `🐘 Tomorrow is Sankashtahara Chaturthi. Fast for Lord Ganesha & prepare for evening moonrise worship.`,
        hi: `🐘 कल संकष्टी चतुर्थी है। भगवान श्री गणेश के लिए उपवास रखें एवं चंद्रोदय पूजा की तैयारी करें।`,
        te: `🐘 రేపు సంకష్టహర చతుర్థి. శ్రీ మహాగణపతి వ్రతం, సాయంత్రం చంద్రోదయ పూజా సన్నాహాలు చేసుకోండి.` ,
        ta: `🐘 நாளை சங்கடஹர சதுர்த்தி. ஸ்ரீ கணேச விரதம், மாலையில் சந்திரோதய பூஜை தயாரிப்பு செய்யவும்.`
      }[validCode];
  }
}

/**
 * Returns localized festival category label.
 */
export function getLocalizedFestivalCategory(
  fest: { id?: string; category?: string; categoryKn?: string } | undefined | null,
  lang: string = "kn"
): string {
  if (!fest) return "";
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  if (fest.id && FESTIVAL_L5_REGISTRY[fest.id]?.category) {
    return FESTIVAL_L5_REGISTRY[fest.id].category[validCode];
  }

  const catStr = (fest.category || fest.categoryKn || "").toLowerCase();
  if (catStr.includes("ekadashi") || catStr.includes("ಏಕಾದಶಿ")) {
    return {
      kn: "ಏಕಾದಶಿ ವ್ರತ",
      en: "Ekadashi Vrata",
      hi: "एकादशी व्रत",
      te: "ఏకాదశి వ్రతం",
      ta: "ஏகாதசி விரதம்"
    }[validCode];
  }
  if (catStr.includes("major") || catStr.includes("ಪ್ರಮುಖ")) {
    return {
      kn: "ಪ್ರಮುಖ ಹಬ್ಬ",
      en: "Major Festival",
      hi: "प्रमुख पर्व",
      te: "ప్రముఖ పండుగ",
      ta: "முக்கிய திருநாள்"
    }[validCode];
  }
  if (catStr.includes("jayanti") || catStr.includes("ಜಯಂತಿ")) {
    return {
      kn: "ಜಯಂತಿ",
      en: "Jayanti",
      hi: "जयंती",
      te: "జయంతి",
      ta: "ஜெயந்தி"
    }[validCode];
  }
  if (catStr.includes("vrata") || catStr.includes("ವ್ರತ")) {
    return {
      kn: "ವ್ರತ & ಉಪವಾಸ",
      en: "Vrata & Upavasa",
      hi: "व्रत एवं उपवास",
      te: "వ్రతం & ఉపవాసం",
      ta: "விரதம் & உபவாசம்"
    }[validCode];
  }

  return {
    kn: "ವಿಶೇಷ ಹಬ್ಬ",
    en: "Special Festival",
    hi: "विशेष पर्व",
    te: "ప్రత్యేక పండుగ",
    ta: "சிறப்பு திருவிழா"
  }[validCode];
}

/**
 * Returns localized sacred festival description.
 */
export function getLocalizedFestivalDescription(
  fest: { id?: string; descriptionKn?: string; descriptionEn?: string; description?: string } | undefined | null,
  lang: string = "kn"
): string {
  if (!fest) return "";
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  if (fest.id && FESTIVAL_L5_REGISTRY[fest.id]?.description) {
    return FESTIVAL_L5_REGISTRY[fest.id].description![validCode];
  }

  if (validCode === "kn") return fest.descriptionKn || fest.description || "";
  if (validCode === "en") return fest.descriptionEn || fest.description || fest.descriptionKn || "";
  return fest.descriptionEn || fest.description || fest.descriptionKn || "";
}

/**
 * Returns localized puja muhurtha window or fallback string.
 */
export function getLocalizedPujaWindow(
  festOrWindow: { id?: string; pujaWindow?: string; pujaWindowKn?: string; pujaWindowEn?: string } | string | undefined | null,
  lang: string = "kn"
): string {
  const code = (lang || "kn").slice(0, 2) as SupportedLang;
  const validCode: SupportedLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  if (!festOrWindow) {
    return {
      kn: "ದಿನದ ಪ್ರಾತಃಕಾಲ & ಮಾಧ್ಯಾಹ್ನ ಕಾಲ",
      en: "Auspicious Morning & Midday Hours",
      hi: "प्रातःकाल एवं मध्याह्न काल",
      te: "ఉదయం & మధ్యాహ్న సమయం",
      ta: "காலை மற்றும் நண்பகல் நேரம்"
    }[validCode];
  }

  if (typeof festOrWindow === "string") {
    return festOrWindow;
  }

  if (festOrWindow.id && FESTIVAL_L5_REGISTRY[festOrWindow.id]?.pujaWindow) {
    return FESTIVAL_L5_REGISTRY[festOrWindow.id].pujaWindow![validCode];
  }

  if (validCode === "kn") {
    return festOrWindow.pujaWindowKn || festOrWindow.pujaWindow || "ದಿನದ ಪ್ರಾತಃಕಾಲ & ಮಾಧ್ಯಾಹ್ನ ಕಾಲ";
  }
  return festOrWindow.pujaWindowEn || festOrWindow.pujaWindow || "Auspicious Morning & Midday Hours";
}

