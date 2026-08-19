import { siderealLongitudes } from "../../core/EphemerisEngine";
import { normalizeDegree } from "../../core/AstroMath";
import { pick, type SevaLang } from "./sevaLocale";

export type SpecialVrataCategory =
  | "AMAVASYA"
  | "PURNIMA"
  | "EKADASHI"
  | "SANKASHTI"
  | "PRADOSHAM"
  | "FESTIVAL"
  | "NONE";

export interface SpecialVrataInfo {
  ymd: string;
  isSpecial: boolean;
  category: SpecialVrataCategory;
  vrataName: string;
  eveAlertTitle: string;
  eveAlertSummary: string;
  sameDayNotice: string;
  fastingAdvice: string;
  deity: string;
  mantra: string;
}

const CATEGORY_NAMES_L5: Record<SpecialVrataCategory, Record<SevaLang, string>> = {
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
  },
  FESTIVAL: {
    kn: "ಪವಿತ್ರ ಹಬ್ಬ / ಧಾರ್ಮಿಕ ಉತ್ಸವ",
    en: "Sacred Vedic Festival Day",
    hi: "पवित्र वैदिक त्यौहार दिवस",
    te: "పవిత్ర వైదిక పండుగ దినం",
    ta: "புனித வைதீக திருநாள்"
  },
  NONE: {
    kn: "",
    en: "",
    hi: "",
    te: "",
    ta: ""
  }
};

const FASTING_ADVICE_L5: Record<SpecialVrataCategory, Record<SevaLang, string>> = {
  AMAVASYA: {
    kn: "ಇಂದು ತರ್ಪಣ, ದಾನ & ಶಿವ ಸ್ಮರಣೆ ಶ್ರೇಷ್ಠ. ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ, ಸಂಜೆ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಧ್ಯಾನ ಮಾಡಿ.",
    en: "Perform ancestral tarpana & charity. Observe sattvic diet & offer evening Mahabaleshwara prayers.",
    hi: "आज तर्पण, दान एवं शिव स्मरण श्रेष्ठ है। सात्विक आहार लें और संध्या समय भगवान शिव का ध्यान करें।",
    te: "ఈ రోజు తర్పణం, దానం & శివ స్మరణ శ్రేష్టం. సాత్విక ఆహారం తీసుకోండి.",
    ta: "இன்று தர்பணம், தானம் மற்றும் சிவ தியானம் சிறப்பு. சாத்விக உணவு உட்கொள்ளவும்."
  },
  PURNIMA: {
    kn: "ಇಂದು ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ ಪೂಜೆ & ಚಂದ್ರ ದರ್ಶನ ಶ್ರೇಷ್ಠ. ಸಂಜೆ ಕ್ಷೀರ ನೈವೇದ್ಯ ಸಲ್ಲಿಸಿ.",
    en: "Perform Satyanarayana Vrata & offer milk nivedyam to the Full Moon this evening.",
    hi: "आज श्री सत्यनारायण कथा एवं चंद्र दर्शन श्रेष्ठ है। संध्या समय खीर का भोग लगाएं।",
    te: "ఈ రోజు శ్రీ సత్యనారాయణ స్వామి పూజ & చంద్ర దర్శనం శ్రేష్టం.",
    ta: "இன்று ஸ்ரீ சத்தியநாராயண பூஜை மற்றும் பௌர்ணமி நிலவு தரிசனம் சிறப்பு."
  },
  EKADASHI: {
    kn: "ಇಂದು ಧಾನ್ಯ ರಹಿತ ಸಂಪೂರ್ಣ/ಫಲಾಹಾರ ಉಪವಾಸ ಶ್ರೇಷ್ಠ. ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಜಪಿಸಿ.",
    en: "Observe grain-free fasting today. Recite Vishnu Sahasranama & maintain spiritual awareness.",
    hi: "आज अन्न-रहित उपवास रखें। श्री विष्णु सहस्रनाम का जप करें।",
    te: "ఈ రోజు ధాన్య రహిత ఉపవాసం ఉండండి. శ్రీ విష్ణు సహస్రనామ జపం చేయండి.",
    ta: "இன்று தானியமில்லா உபவாசம் இருக்கவும். ஸ்ரீ விஷ்ணு சகஸ்ரநாமம் ஜபிக்கவும்."
  },
  SANKASHTI: {
    kn: "ಇಂದು ಶ್ರೀ ಗಣೇಶ ಉಪವಾಸ ಶ್ರೇಷ್ಠ. ಸಂಜೆ ಚಂದ್ರೋದಯದ ನಂತರ ಸಂಕಷ್ಟನಾಶನ ಗಣೇಶ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಅರ್ಘ್ಯ ನೀಡಿ.",
    en: "Observe fast for Lord Ganesha. After moonrise this evening, offer Arghya & recite Sankashtanashana Stotra.",
    hi: "आज श्री गणेश उपवास रखें। संध्या चंद्रोदय के बाद अर्घ्य देकर व्रत खोलें।",
    te: "ఈ రోజు శ్రీ గణేశ ఉపవాసం ఉండండి. సంధ్యా సమయాన చంద్రోదయానంతరం అర్ఘ్యం ఇవ్వండి.",
    ta: "இன்று ஸ்ரீ கணேசர் உபவாசம் இருக்கவும். மாலையில் நிலவு உதித்த பின் அர்க்கியம் அளிக்கவும்."
  },
  PRADOSHAM: {
    kn: "ಸಂಜೆ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ (ಸೂರ್ಯಾಸ್ತಕ್ಕೆ 45 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ) ಶ್ರೀ ಪ್ರದೋಷ ನಂದೀಶ್ವರ & ಶಿವ ಪೂಜೆ ಮಾಡಿ.",
    en: "Perform Pradosha Kaala Shiva Puja 45 mins before sunset. Recite Om Namah Shivaya.",
    hi: "संध्या प्रदोष काल में भगवान शिव एवं नंदीश्वर की पूजा करें।",
    te: "సంధ్యా ప్రదోష కాలంలో శ్రీ శివ పూజ చేయండి.",
    ta: "மாலையில் பிரதோஷ காலத்தில் ஸ்ரீ சிவ பூஜை செய்யவும்."
  },
  FESTIVAL: {
    kn: "ಇಂದು ಪವಿತ್ರ ಉತ್ಸವ ದಿನ. ಕುಟುಂಬ ಸಮೇತ ದೇವತಾ ಪೂಜೆ, ಮಂಗಳ ದೀಪಾರಾಧನೆ & ಪ್ರಸಾದ ಸ್ವೀಕರಿಸಿ.",
    en: "Sacred festival day. Offer prayers with family, light auspicious lamps & partake prasada.",
    hi: "आज पवित्र उत्सव दिवस है। परिवार सहित पूजा करें एवं प्रसाद ग्रहण करें।",
    te: "ఈ రోజు పవిత్ర పండుగ దినం. కుటుంబంతో పూజ చేయండి.",
    ta: "இன்று புனித திருநாள். குடும்பத்துடன் பூஜை செய்து பிரசாதம் ஏற்கவும்."
  },
  NONE: { kn: "", en: "", hi: "", te: "", ta: "" }
};

const MANTRAS_L5: Record<SpecialVrataCategory, Record<SevaLang, string>> = {
  AMAVASYA: {
    kn: "ॐ नमः शिवाय ॥ ॐ पितृभ्यो नमः ॥",
    en: "Om Namah Shivaya || Om Pitribhyo Namah ||",
    hi: "ॐ नमः शिवाय ॥ ॐ पितृभ्यो नमः ॥",
    te: "ఓం నమః శివాయ ॥ ఓం పితృభ్యో నమః ॥",
    ta: "ஓம் நம சிவாய || ஓம் பித்ருப்யோ நம ||"
  },
  PURNIMA: {
    kn: "ॐ नमो भगवते वासुदेवाय ॥ ॐ सोमाय नमः ॥",
    en: "Om Namo Bhagavate Vasudevaya || Om Somaya Namah ||",
    hi: "ॐ नमो भगवते वासुदेवाय ॥ ॐ सोमाय नमः ॥",
    te: "ఓం నమో భగవతే వాసుదేవాయ ॥ ఓం సోమాయ నమః ॥",
    ta: "ஓம் நமோ பகவதே வாசுதேவாய || ஓம் சோமாய நம ||"
  },
  EKADASHI: {
    kn: "ॐ नमो नारायणाय ॥ ॐ क्लीं कृष्णाय नमः ॥",
    en: "Om Namo Narayanaya || Om Kleem Krishnaya Namah ||",
    hi: "ॐ नमो नारायणाय ॥ ॐ क्लीं कृष्णाय नमः ॥",
    te: "ఓం నమో నారాయణాయ ॥ ఓం క్లీం కృష్ణాయ నమః ॥",
    ta: "ஓம் நமோ நாராயணாய || ஓம் க்லீம் கிருஷ்ணாய நம ||"
  },
  SANKASHTI: {
    kn: "ॐ गं गणपतये नमः ॥ ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि ॥",
    en: "Om Gam Ganapataye Namah || Om Ekadantaya Vidmahe Vakratundaya Dheemahi ||",
    hi: "ॐ गं गणपतये नमः ॥ ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि ॥",
    te: "ఓం గం గణపతయే నమః ॥ ఓం ఏకదంతాయ విద్మహే వక్రతుండాయ ధీమహి ॥",
    ta: "ஓம் கம் கணபதயே நம || ஓம் ஏகதந்தாய வித்மஹே வக்ரதுண்டாய தீமஹி ||"
  },
  PRADOSHAM: {
    kn: "ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात् ॥",
    en: "Om Tatpurushaya Vidmahe Mahadevaya Dheemahi Tanno Rudrah Prachodayat ||",
    hi: "ॐ तत्पुरुषाय विद्महे महादेवाय धीमहि तन्नो रुद्रः प्रचोदयात् ॥",
    te: "ఓం తత్పురుషాయ విద్మహే మహాదేవాయ ధీమహి తన్నో రుద్రః ప్రచోదయాత్ ॥",
    ta: "ஓம் தத்புருஷாய வித்மஹே மஹாதேவாய தீமஹி தந்நோ ருத்ரஃ ப்ரசோதயாத் ||"
  },
  FESTIVAL: {
    kn: "ॐ श्री महाकाली महालक्ष्मी महासरस्वती देवैभ्यो नमः ॥",
    en: "Om Shri Mahakali Mahalakshmi Mahasaraswati Devaibhyo Namah ||",
    hi: "ॐ श्री महाकाली महालक्ष्मी महासरस्वती देवैभ्यो नमः ॥",
    te: "ఓం శ్రీ మహాకాళీ మహాలక్ష్మీ మహాసరస్వతీ దేవైభ్యో నమః ॥",
    ta: "ஓம் ஸ்ரீ மஹாகாளி மஹாலக்ஷ்மி மஹாசரஸ்வதி தேவப்யோ நம ||"
  },
  NONE: { kn: "", en: "", hi: "", te: "", ta: "" }
};

/**
 * Detects whether a date corresponds to a Special Vrata (Amavasya, Ekadashi, Sankashti, Purnima, Pradosham, or Festival).
 */
export function detectSpecialVrata(ymd: string, lang = "kn"): SpecialVrataInfo {
  const code = (lang || "kn").slice(0, 2) as SevaLang;
  const validCode: SevaLang = ["kn", "en", "hi", "te", "ta"].includes(code) ? code : "kn";

  const dateObj = new Date(ymd);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const dayOfMonth = dateObj.getDate();

  const noonUtc = new Date(Date.UTC(year, month, dayOfMonth, 12, 0, 0));
  const coords = siderealLongitudes(noonUtc);
  const diff = normalizeDegree(coords.moon - coords.sun);
  const tithiVal = Math.floor(diff / 12); // 0..29
  const isShukla = tithiVal < 15;
  const tithiInPaksha = (tithiVal % 15) + 1; // 1..15

  let category: SpecialVrataCategory = "NONE";
  let festivalTitle = "";

  // 1. Check Tithi Categories
  if (tithiVal === 29) {
    category = "AMAVASYA";
  } else if (tithiVal === 14) {
    category = "PURNIMA";
  } else if (tithiInPaksha === 11) {
    category = "EKADASHI";
  } else if (!isShukla && tithiInPaksha === 4) {
    category = "SANKASHTI";
  } else if (tithiInPaksha === 13) {
    category = "PRADOSHAM";
  }

  // 2. Ephemeris & Seasonal Festival Overrides
  // Bhadrapada Shukla Chaturthi (Ganesha Chaturthi)
  if (isShukla && tithiInPaksha === 4 && (month === 7 || month === 8)) {
    category = "FESTIVAL";
    festivalTitle = validCode === "kn" ? "🐘 ಶ್ರೀ ಗಣೇಶ ಚತುರ್ಥಿ ಮಹೋತ್ಸವ" : "🐘 Sri Ganesha Chaturthi Festival";
  }
  // Sravana Varamahalakshmi Vratha (Friday August 21, 2026 / 2nd Friday of Shravana Masa)
  else if ((dateObj.getDay() === 5 && month === 7 && dayOfMonth >= 15 && dayOfMonth <= 22) || ymd === "2026-08-21") {
    category = "FESTIVAL";
    festivalTitle = validCode === "kn" ? "🌸 ಶ್ರೀ ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ ಮಹೋತ್ಸವ" :
                    validCode === "hi" ? "🌸 श्री वरमहालक्ष्मी व्रत महोत्सव" :
                    validCode === "te" ? "🌸 శ్రీ వరమహాలక్ష్మి వ్రత మహోత్సవం" :
                    validCode === "ta" ? "🌸 ஸ்ரீ வரமகாலக்ஷ்மி விரத திருவிழா" :
                    "🌸 Sri Varamahalakshmi Vrata Festival";
  }
  // Sravana Krishna Ashtami (Janmashtami)
  else if (!isShukla && tithiInPaksha === 8 && (month === 7 || month === 8)) {
    category = "FESTIVAL";
    festivalTitle = validCode === "kn" ? "🪈 ಶ್ರೀ ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ" : "🪈 Sri Krishna Janmashtami";
  }
  // Ashvin Shukla Navami / Dashami (Mahanavami / Vijayadashami)
  else if (isShukla && (tithiInPaksha === 9 || tithiInPaksha === 10) && (month === 8 || month === 9)) {
    category = "FESTIVAL";
    festivalTitle = validCode === "kn" ? "⚔️ ಶ್ರೀ ವಿಜಯದಶಮಿ & ಮಹಾನವಮಿ" : "⚔️ Sri Vijayadashami & Mahanavami";
  }

  if (category === "NONE") {
    return {
      ymd,
      isSpecial: false,
      category: "NONE",
      vrataName: "",
      eveAlertTitle: "",
      eveAlertSummary: "",
      sameDayNotice: "",
      fastingAdvice: "",
      deity: "",
      mantra: ""
    };
  }

  const categoryLabel = CATEGORY_NAMES_L5[category][validCode];
  const vrataName = festivalTitle ? festivalTitle : categoryLabel;

  const eveTitleMap: Record<SevaLang, string> = {
    kn: `🔔 [ನಾಳೆ ಪವಿತ್ರ ದಿನ] ನಾಳೆ ${vrataName} - 1-Day Prior Prep Alert`,
    en: `🔔 [Tomorrow Eve Alert] Tomorrow is ${vrataName} - Advance Prep Notice`,
    hi: `🔔 [कल पवित्र दिन] कल ${vrataName} है - पूर्व तैयारी सूचना`,
    te: `🔔 [రేపు పవిత్ర దినం] రేపు ${vrataName} - ముందస్తు సమాచారం`,
    ta: `🔔 [நாளை புனித நாள்] நாளை ${vrataName} - முன் தயாரிப்பு`
  };

  const eveSummaryMap: Record<SevaLang, string> = {
    kn: `ನಾಳೆ ${vrataName} ಇರುವ ಕಾರಣ, ಇಂದು ಸಂಜೆಯೇ ಪೂಜಾ ಸಾಮಗ್ರಿ, ಹಾಲು, ಹಣ್ಣುಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿಕೊಳ್ಳಿ.`,
    en: `Tomorrow is ${vrataName}. Please arrange flowers, fruits, milk & puja items this evening.`,
    hi: `कल ${vrataName} है। कृपया आज संध्या ही पूजा सामग्री एवं फलाहार की व्यवस्था कर लें।`,
    te: `రేపు ${vrataName} ఉన్నందున, ఈ రోజు సాయంత్రమే పూజా సామాగ్రి సిద్ధం చేసుకోండి.`,
    ta: `நாளை ${vrataName} என்பதால், இன்று மாலையே பூஜை பொருட்களை தயார் செய்யவும்.`
  };

  const sameDayMap: Record<SevaLang, string> = {
    kn: `🕉️ ಇಂದು ${vrataName}. ಸೂರ್ಯೋದಯದಿಂದ ಸಂಜೆಯವರೆಗೆ ಧರ್ಮಸೂತ್ರ ಪಾಲಿಸಿ ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸಿ.`,
    en: `🕉️ Today is ${vrataName}. Observe sacred guidelines & offer heartfelt prayers today.`,
    hi: `🕉️ आज ${vrataName} है। आज भक्तिभाव से पूजा करें।`,
    te: `🕉️ ఈ రోజు ${vrataName}. భక్తితో పూజ చేయండి.`,
    ta: `🕉️ இன்று ${vrataName}. பக்தியுடன் பூஜை செய்யவும்.`
  };

  return {
    ymd,
    isSpecial: true,
    category,
    vrataName,
    eveAlertTitle: eveTitleMap[validCode],
    eveAlertSummary: eveSummaryMap[validCode],
    sameDayNotice: sameDayMap[validCode],
    fastingAdvice: FASTING_ADVICE_L5[category][validCode],
    deity: category === "SANKASHTI" ? "Lord Ganesha" : category === "EKADASHI" ? "Lord Vishnu" : "Lord Mahabaleshwara",
    mantra: MANTRAS_L5[category][validCode]
  };
}

/**
 * Returns all Special Vratas / Festivals occurring within a 90-day period.
 */
export function get90DaySpecialVratas(
  startDateYmd: string,
  lang = "kn"
): SpecialVrataInfo[] {
  const specialList: SpecialVrataInfo[] = [];
  const start = new Date(startDateYmd);
  const validStart = isNaN(start.getTime()) ? new Date() : start;

  for (let i = 0; i < 90; i++) {
    const d = new Date(validStart);
    d.setDate(d.getDate() + i);
    const ymd = d.toISOString().slice(0, 10);
    const info = detectSpecialVrata(ymd, lang);
    if (info.isSpecial) {
      specialList.push(info);
    }
  }

  return specialList;
}
