/**
 * Dynamic Vedic Darshana & Personalization Engine (ನಿತ್ಯ ದರ್ಶನ, ಶ್ಲೋಕ & ಮಾರ್ಗದರ್ಶನ ಸಂಶ್ಲೇಷಣಾ ಎಂಜಿನ್)
 * 
 * Computes 100% dynamic, astrologically-grounded payloads for Tab 1 (Darshana & Pooja) 
 * and Tab 2 (Golden Hour & Power Guidance) in DailyDarshanaPage:
 * 
 * 1. Dynamic Presiding Deity & Sanskrit Vedic Shloka + Beeja Mantra based on (Janma Kundali + Gochara + Dasha-Bhukti).
 * 2. Dynamic Chief Priest Benediction (ಆಶೀರ್ವಚನ) woven with running Dasha & Chandra Bala.
 * 3. Dynamic 5-Language Astrological Karma Navigator (Do's, Don'ts & 1-Minute Micro-Parihara).
 * 4. Astrologically-Aligned Power Metrics (Lucky Color, Lucky Number, Lucky Direction, Golden Hour Window).
 * 5. Live Astronomical Panchanga Attributes for the Daily Pooja Maha Sankalpa.
 * 
 * Fully localized across Kannada (kn), English (en), Hindi (hi), Telugu (te), and Tamil (ta).
 */

import { PlanetName, type KundliOutput } from "../../core/AstroTypes";
import type { SevaLang } from "../seva/sevaLocale";
import { computeGocharaMoonForDate } from "../seva/dinaBhavishyaEngine";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { calculatePanchang } from "../../core/PanchangEngine";
import { getLunarMonthAndYear, getLocalizedSamvatsara, getLocalizedMasa } from "../../core/VedicCalculations";

export interface PersonalizedDarshanaPayload {
  targetDate: string; // YYYY-MM-DD
  devoteeName: string;
  
  // Astronomical Live Panchanga Attributes for Sankalpa
  panchanga: {
    samvatsara: string;
    ayana: string;
    ritu: string;
    masa: string;
    paksha: string;
    tithi: string;
    vasara: string;
    nakshatra: string;
    yoga: string;
    karana: string;
  };

  // 1. Dynamic Presiding Deity & Sacred Vedic Shloka
  deity: {
    key: string;
    name: Record<SevaLang, string>;
    primaryColor: string;
    sanskritShloka: string;
    transliteration: string;
    beejaMantra: Record<SevaLang, string>;
    meaning: Record<SevaLang, string>;
    spiritualSignificance: Record<SevaLang, string>;
    selectionReason: Record<SevaLang, string>;
  };

  // 2. Dynamic Chief Priest Benediction (Spoken Narration)
  priestBenediction: Record<SevaLang, string>;

  // 3. Dynamic Astrological Karma Navigator (Do's, Don'ts & 1-Minute Micro-Parihara)
  karmaNavigator: {
    dos: Record<SevaLang, string[]>;
    donts: Record<SevaLang, string[]>;
    microPariharaTitle: Record<SevaLang, string>;
    microPariharaDesc: Record<SevaLang, string>;
  };

  // 4. Power Metrics & Lucky Alignments
  powerMetrics: {
    luckyColor: {
      name: Record<SevaLang, string>;
      hex: string;
      borderClass: string;
    };
    luckyDigit: number;
    luckyDirection: {
      name: Record<SevaLang, string>;
      degrees: string;
    };
    goldenHour: {
      startMinutes: number;
      endMinutes: number;
      startTimeStr: string;
      endTimeStr: string;
      windowLabel: Record<SevaLang, string>;
    };
  };

  // Astrological Metadata
  astrologyMeta: {
    runningDashaSummary: string;
    chandraBalaHouse: number;
    taraBalaNumber: number;
    isChandrashtama: boolean;
    energyScore: number;
  };
}

export interface PersonalizeDarshanaParams {
  birthKundli?: KundliOutput | null;
  devoteeName: string;
  gotra?: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  targetDate: string; // YYYY-MM-DD
  natalMoonRashi: number; // 0-11
  natalNakshatra: number; // 0-26
  natalLagnaRashi?: number; // 0-11
  lang: SevaLang;
  userLat?: number;
  userLng?: number;
  userPincode?: string;
  priestName?: string;
}

// ── SACRED DEITY & VEDIC SHLOKA REPOSITORY ──
interface DeityVedicShlokaRecord {
  key: string;
  name: Record<SevaLang, string>;
  primaryColor: string;
  sanskritShloka: string;
  transliteration: string;
  beejaMantra: Record<SevaLang, string>;
  meaning: Record<SevaLang, string>;
  spiritualSignificance: Record<SevaLang, string>;
}

const DEITY_SHLOKA_DATABASE: Record<string, DeityVedicShlokaRecord> = {
  // 1. Lord Mahabaleshwara (Shiva) - Supreme Gokarna Atmalinga & Chandrashtama/Rahu-Ketu Shield
  shiva: {
    key: "shiva",
    name: {
      kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ (ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ)",
      en: "Lord Mahabaleshwara (Gokarna Atmalinga)",
      hi: "श्री महाबलेश्वर स्वामी (गोकर्ण आत्मलिंग)",
      te: "శ్రీ మహాబలేశ్వర స్వామి (గోకర్ణ ఆత్మలింగం)",
      ta: "ஸ்ரீ மகாபலேஸ்வர சுவாமி (கோகர்ண ஆத்மலிங்கம்)"
    },
    primaryColor: "#0284C7",
    sanskritShloka: `ತ್ರಯಂಬಕಂ ಯಜಾಮಹೇ ಸುಗಂಧಿಂ ಪುಷ್ಟಿವರ್ಧನಮ್ ।
ಉರ್ವಾರುಕಮಿವ ಬಂಧನಾನ್ ಮೃತ್ಯೋರ್ಮುಕ್ಷೀಯ ಮಾಮೃತಾತ್ ॥
ಓಂ ನಮಃ ಶಿವಾಯ ॥`,
    transliteration: "Tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam | Urvārukamiva bandhanān mṛtyormukṣīya māmṛtāt || Om Namaḥ Śivāya ||",
    beejaMantra: {
      kn: "ॐ ಹೌಂ ಜೂಂ ಸಃ ॐ ಭೂರ್ಭುವಃ ಸ್ವಃ ॐ ತ್ರ್ಯಂಬಕಂ ಯಜಾಮಹೇ ॐ ನಮಃ ಶಿವಾಯ",
      en: "Om Houm Joom Sah Om Bhur Bhuvaḥ Svaḥ Om Tryambakam Yajāmahe Om Namaḥ Śivāya",
      hi: "ॐ हौं जूं सः ॐ भूर्भुवः स्वः ॐ त्र्यम्बकं यजामहे ॐ नमः शिवाय",
      te: "ఓం హౌం జూం సః ఓం భూర్భువః స్వః ఓం త్ర్యంబకం యజామహే ఓం నమః శివాయ",
      ta: "ஓம் ஹௌம் ஜூம் ஸஃ ஓம் பூர்புவஃ ஸ்வஃ ஓம் த்ரயம்பகம் யஜாமஹே ஓம் நமஃ சிவாய"
    },
    meaning: {
      kn: "ಮೂರು ನೇತ್ರಗಳುಳ್ಳ, ದಿವ್ಯ ಸುಗಂಧಭರಿತನಾದ ಹಾಗೂ ಸಮಸ್ತ ಜೀವರಾಶಿಗಳನ್ನು ಪೋಷಿಸುವ ಪರಮೇಶ್ವರನನ್ನು ಪೂಜಿಸುತ್ತೇವೆ. ಹಣ್ಣಾದ ಸೌತೆಕಾಯಿಯು ಬಳ್ಳಿಯಿಂದ ಮುಕ್ತವಾಗುವಂತೆ, ಸಂಸಾರ ಬಂಧನ ಹಾಗೂ ಮೃತ್ಯುಭಯದಿಂದ ನಮ್ಮನ್ನು ಮುಕ್ತಗೊಳಿಸಿ ಅಮೃತತ್ವವನ್ನು ಕರುಣಿಸು.",
      en: "We worship the Three-Eyed Lord Shiva, fragrant and nourishment of all beings. As a ripe cucumber is effortlessly liberated from its vine, may He liberate us from worldly fear and mortality into spiritual immortality.",
      hi: "हम त्रिनेत्रधारी, सुगंधित एवं पुष्टि के संवर्धक भगवान शिव की उपासना करते हैं। जिस प्रकार पका हुआ ककड़ी बेल से मुक्त हो जाता है, उसी प्रकार हमें मृत्यु के भय से मुक्त कर अमृतत्व प्रदान करें।",
      te: "ముక్కంటి, సుగంధభరితుడు, సమస్త జీవులను పోషించే పరమశివుని పూజిస్తున్నాము. దోసపండు తొడిమ నుంచి వేరైనట్లు సంసార బంధాల నుండి విముక్తిని ప్రసాదించు.",
      ta: "முக்கண்ணனும், நறுமணம் மிக்கவரும், உலகை காப்பவருமான சிவபெருமானை வணங்குகிறோம். பழுத்த வெள்ளரி பழம் கொடியிலிருந்து விடுபடுவது போல, எங்களை மரண பயத்திலிருந்து விடுவித்து முக்தி அருள்க."
    },
    spiritualSignificance: {
      kn: "ಮಾನಸಿಕ ಆತಂಕ, ಚಂದ್ರಾಷ್ಟಮ ದೋಷ, ಭಯ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಿ ದೃಢ ಮನಶ್ಶಾಂತಿ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯ ಕರುಣಿಸುತ್ತದೆ.",
      en: "Shields against mental anxiety, Chandrashtama friction, fears, infusing absolute calmness and vitality.",
      hi: "मानसिक चिंता, चंद्राष्टम दोष और भय का निवारण कर गहन शांति एवं दीर्घायु प्रदान करता है।",
      te: "మానసిక ఆందోళన, చంద్రాష్టమ దోషం తొలగించి ప్రశాంతత మరియు దీర్ఘాయుష్షు చేకూరుస్తుంది.",
      ta: "மன பயம், சந்திராஷ்டம தோஷம் நீங்கி அமைதியும் பூரண ஆரோக்கியமும் கிட்டும்."
    }
  },

  // 2. Sri Maha Ganapati - Obstacle Breaker & Ketu/Rahu Pacifier
  ganapati: {
    key: "ganapati",
    name: {
      kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ (ವಿಘ್ನವಿನಾಶಕ)",
      en: "Lord Maha Ganapati (Remover of Obstacles)",
      hi: "श्री महागणपति (विघ्नहर्ता)",
      te: "శ్రీ మహాగణపతి (విఘ్నవినాశకుడు)",
      ta: "ஸ்ரீ மகா கணபதி (விக்ன விநாயகர்)"
    },
    primaryColor: "#DC2626",
    sanskritShloka: `ಗಜಾನನಂ ಭೂತಗಣಾದಿಸೇವಿತಂ ಕಪಿತ್ಥಜಂಬೂಫಲಸಾರಭಕ್ಷಿತಮ್ ।
ಉಮಾಸುತಂ ಶೋಕವಿನಾಶಕಾರಣಂ ನಮಾಮಿ ವಿಘ್ನೇಶ್ವರ ಪಾದಪಂಕಜಮ್ ॥
ಓಂ ಗಂ ಗಣಪತಯೇ ನಮಃ ॥`,
    transliteration: "Gajānanaṁ bhūtagaṇādisevitaṁ kapitthajambūphalasārabhakṣitam | Umāsutaṁ śokavināśakāraṇaṁ namāmi vighneśvara pādapaṅkajam || Om Gaṁ Gaṇapataye Namaḥ ||",
    beejaMantra: {
      kn: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಗ್ಲೌಂ ಗಂ ಗಣಪತಯೇ ವರವರದ ಸರ್ವಜನಂ ಮೇ ವಶಮಾನಯ ಸ್ವಾಹಾ",
      en: "Om Shreem Hreem Kleem Glaum Gam Ganapataye Vara Varada Sarvajanam Me Vashamanaya Svaha",
      hi: "ॐ श्रीं ह्रीं क्लीं ग्लौं गं गणपतये वरवरद सर्वजनं मे वशमानय स्वाहा",
      te: "ఓం శ్రీం హ్రీం క్లీం గ్లౌం గం గణపతయే వరవరద సర్వజనం మే వశమానయ స్వాహా",
      ta: "ஓம் ஸ்ரீம் ஹ்ரீம் க்லீம் க்லௌம் கம் கணபதயே வரவரத சர்வஜனம் மே வசமானய ஸ்வாஹா"
    },
    meaning: {
      kn: "ಗಜಮುಖನಾದ, ಪ್ರಮಥಗಣಗಳಿಂದ ಸೇವಿಸಲ್ಪಡುವ, ಬೇಲದಹಣ್ಣು ಮತ್ತು ನೇರಳೆ ಹಣ್ಣಿನ ರಸವನ್ನು ಆಸ್ವಾದಿಸುವ, ಪಾರ್ವತೀದೇವಿಯ ಪುತ್ರನಾದ ಹಾಗೂ ಸರ್ವ ಶೋಕಗಳನ್ನು ವಿನಾಶ ಮಾಡುವ ಶ್ರೀ ವಿಘ್ನೇಶ್ವರನ ಪಾದಕಮಲಗಳಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      en: "Salutations to the elephant-faced Lord Ganesha, served by divine attendants, who partakes in sacred fruits, son of Goddess Uma, the destroyer of all grief and remover of obstacles.",
      hi: "गजमुख वाले, प्रमथ गणों द्वारा पूजित, कैथ और जामुन फल का रसपान करने वाले, पार्वतीपुत्र एवं सभी दुखों का नाश करने वाले श्री विघ्नेश्वर के चरण कमलों में नमन।",
      te: "గజముఖం కలవాడు, గణాల చేత సేవింపబడువాడు, పార్వతీసుతుడు, సర్వ దుఃఖాలను నశింపజేసే విఘ్నేశ్వరుని పాదపద్మములకు నమస్కారములు.",
      ta: "யானை முகத்தோனும், கணங்களால் தொழப்படுபவரும், பார்வதி மைந்தனும், தடைகளை நீக்குபவருமான விநாயகப் பெருமானின் திருப்பாதங்களைப் பணிகிறேன்."
    },
    spiritualSignificance: {
      kn: "ಸರ್ವ ಕಾರ್ಯಗಳಲ್ಲಿ ಎದುರಾಗುವ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಿ ವಿಜಯ, ಜ್ಞಾನ ಹಾಗೂ ಗೃಹಶಾಂತಿಯನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
      en: "Eliminates roadblocks in daily initiatives, bestowing wisdom, auspicious beginnings, and triumph.",
      hi: "कार्य में आने वाली समस्त बाधाओं को दूर कर विजय, बुद्धि एवं सफलता प्रदान करता है।",
      te: "పనులలోని ఆటంకాలను తొలగించి విజయం, జ్ఞానం మరియు సౌభాగ్యాన్ని చేకూరుస్తుంది.",
      ta: "தொழில் மற்றும் காரிய தடைகள் நீங்கி வெற்றி, ஞானம் மற்றும் சுபிட்சம் உண்டாகும்."
    }
  },

  // 3. Sri Mahalakshmi - Goddess of Abundance, Grace & Venus/Dhana Strength
  mahalakshmi: {
    key: "mahalakshmi",
    name: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೇವಿ (ಧನಧಾನ್ಯ ಸೌಭಾಗ್ಯದಾಯಿನಿ)",
      en: "Goddess Mahalakshmi (Abundance & Grace)",
      hi: "श्री महालक्ष्मी देवी (धनधान्य सौभाग्यदायिनी)",
      te: "శ్రీ మహాలక్ష్మీ దేవి (ధనధాన్య సౌభాగ్యదాయిని)",
      ta: "ஸ்ரீ மகாலட்சுமி தேவி (தனதான்ய சௌபாக்யதாயினி)"
    },
    primaryColor: "#D97706",
    sanskritShloka: `ನಮಸ್ತೇಽಸ್ತು ಮಹಾಮಾಯೇ ಶ್ರೀಪೀಠೇ ಸುರಪೂಜಿತೇ ।
ಶಂಖಚಕ್ರಗದಾಹಸ್ತೇ ಮಹಾಲಕ್ಷ್ಮಿ ನಮೋಽಸ್ತು ತೇ ॥
ಸರ್ವಜ್ಞೇ ಸರ್ವವರದೇ ಸರ್ವದುಷ್ಟಭಯಂಕರಿ ।
ಸರ್ವದುಃಖಹರೇ ದೇವಿ ಮಹಾಲಕ್ಷ್ಮಿ ನಮೋಽಸ್ತು ತೇ ॥`,
    transliteration: "Namaste'stu mahāmāye śrīpīṭhe surapūjite | Śaṅkhacakragadāhaste mahālakṣmi namo'stu te || Sarvajñe sarvavarade sarvaduṣṭabhayaṅkari | Sarvaduḥkhahare devi mahālakṣmi namo'stu te ||",
    beejaMantra: {
      kn: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ",
      en: "Om Shreem Hreem Kleem Shreem Mahalakshmyai Namah",
      hi: "ॐ श्रीं ह्रीं क्लीं श्रीं महालक्ष्म्यै नमः",
      te: "ఓం శ్రీం హ్రీం క్లీం శ్రీం మహాలక్ష్మ్యై నమః",
      ta: "ஓம் ஸ்ரீம் ஹ்ரீம் க்லீம் ஸ்ரீம் மஹாலக்ஷ்ம்யை நமஃ"
    },
    meaning: {
      kn: "ಮಹಾಮಾಯೆಯೂ, ಶ್ರೀಪೀಠದಲ್ಲಿ ನೆಲೆಸಿ ದೇವತೆಗಳಿಂದ ಪೂಜಿಸಲ್ಪಡುವವಳೂ, ಶಂಖ-ಚಕ್ರ-ಗದೆಯನ್ನು ಧರಿಸಿದವಳೂ, ಸರ್ವಜ್ಞೆಯೂ, ಸಕಲ ವರಗಳನ್ನು ಕರುಣಿಸುವವಳೂ ಹಾಗೂ ಸಕಲ ದುಃಖಗಳನ್ನು ಪರಿಹರಿಸುವ ಮಹಾಲಕ್ಷ್ಮಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      en: "Salutations to Goddess Mahalakshmi, the Divine Mother seated on the sacred throne, worshipped by gods, holding the conch, discus and mace, all-knowing bestower of boons and remover of sorrows.",
      hi: "महामाया, श्रीपीठ पर प्रतिष्ठित, देवपूजिता, शंख-चक्र-गदाधारिणी, सर्वज्ञा एवं सभी वरदान प्रदान करने वाली तथा समस्त दुखों का हरण करने वाली महालक्ष्मी को नमन।",
      te: "మహామాయా స్వరూపిణి, దేవతలచే పూజింపబడు శ్రీపీఠ నివాసిని, సమస్త వరములిచ్చే మహాలక్ష్మీ దేవికి నమస్కారములు.",
      ta: "தேவர்களால் போற்றப்படும் ஸ்ரீபீட நாயகி, சங்கு-சக்கரம் ஏந்தியவள், அனைத்து வரங்களையும் அருளும் மகாலட்சுமியை பணிகிறேன்."
    },
    spiritualSignificance: {
      kn: "ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ, ವ್ಯಾಪಾರ ವೃದ್ಧಿ, ನೂತನ ಹೂಡಿಕೆಯಲ್ಲಿ ಲಾಭ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸುವಂತೆ ಮಾಡುತ್ತದೆ.",
      en: "Attracts financial stability, business prosperity, domestic harmony, and boundless auspiciousness.",
      hi: "आर्थिक संपन्नता, व्यापार में उन्नति, नए निवेश में लाभ एवं पारिवारिक सुख-समृद्धि प्रदान करती है।",
      te: "ఆర్థికాభివృద్ధి, వ్యాపార లాభాలు మరియు గృహంలో శాంతి-సౌభాగ్యాలు నింపుతుంది.",
      ta: "தன லாபம், தொழில் முன்னேற்றம் மற்றும் குடும்பத்தில் மகிழ்ச்சியை அருளும்."
    }
  },

  // 4. Lord Hanuman (Anjaneya) - Courage, Health & Saturn (Shani/Mangala) Shield
  hanuman: {
    key: "hanuman",
    name: {
      kn: "ಶ್ರೀ ವೀರ ಆಂಜನೇಯ (ಧೈರ್ಯ & ರಕ್ಷಾ ಕವಚ)",
      en: "Lord Veera Hanuman (Courage & Protection)",
      hi: "श्री वीर हनुमान (धैर्य एवं रक्षा कवच)",
      te: "శ్రీ వీర హనుమాన్ (ధైర్యం & రక్షా కవచం)",
      ta: "ஸ்ரீ வீர ஆஞ்சநேயர் (தைரியம் & ரக்ஷா கவசம்)"
    },
    primaryColor: "#EA580C",
    sanskritShloka: `ಮನೋಜವಂ ಮಾರುತತುಲ್ಯವೇಗಂ ಜಿತೇಂದ್ರಿಯಂ ಬುದ್ಧಿಮತಾಂ ವರಿಷ್ಠಮ್ ।
ವಾತಾತ್ಮಜಂ ವಾನರಯೂಥಮುಖ್ಯಂ ಶ್ರೀರಾಮದೂತಂ ಶಿರಸಾ ನಮಾಮಿ ॥
ಓಂ ಹಂ ಹನುಮತೇ ನಮಃ ॥`,
    transliteration: "Manojavaṁ mārutatulyavegaṁ jitendriyaṁ buddhimatāṁ variṣṭham | Vātātmajaṁ vānarayūthamukhyaṁ śrīrāmadūtaṁ śirasā namāmi || Om Haṁ Hanumate Namaḥ ||",
    beejaMantra: {
      kn: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಹನುಮತೇ ರುದ್ರಾವತಾರಾಯ ನಮಃ",
      en: "Om Hram Hreem Hroum Sah Hanumate Rudravataraya Namah",
      hi: "ॐ ह्रां ह्रीं ह्रौं सः हनुमते रुद्रावताराय नमः",
      te: "ఓం హ్రాం హ్రీం హ్రౌం సః హనుమతే రుద్రావతారాయ నమః",
      ta: "ஓம் ஹ்ராம் ஹ்ரீம் ஹ்ரௌம் ஸஃ ஹனுமதே ருத்ராவதாராய நமஃ"
    },
    meaning: {
      kn: "ಮನಸ್ಸಿನಷ್ಟೇ ವೇಗವುಳ್ಳ, ವಾಯುದೇವನಿಗೆ ಸಮಾನವಾದ ವೇಗ ಹೊಂದಿದ, ಇಂದ್ರಿಯಗಳನ್ನು ಗೆದ್ದ, ಜ್ಞಾನಿಗಳಲ್ಲಿ ಶ್ರೇಷ್ಠನಾದ, ವಾಯುಪುತ್ರನೂ ವಾನರ ಸೇನಾಪತಿಯೂ ಆದ ಶ್ರೀರಾಮದೂತ ಹನುಮಂತನಿಗೆ ತಲೆಬಾಗಿ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      en: "I bow with deep reverence to Lord Hanuman, swift as the mind, fast as the wind, master of the senses, foremost among the wise, son of Vayu and supreme emissary of Lord Sri Rama.",
      hi: "मन के समान वेगवान, वायु के समान पराक्रमी, जितेंद्रिय, बुद्धिमानों में श्रेष्ठ, पवनपुत्र एवं श्री रामदूत हनुमान जी को सिर झुकाकर प्रणाम।",
      te: "మనోవేగం కలవాడు, వాయుదేవుని సమాన వేగం కలవాడు, జితేంద్రియుడు, బుద్ధిమంతులలో శ్రేష్ఠుడైన శ్రీరామదూత హనుమంతునికి నమస్కారములు.",
      ta: "மனோவேகம் கொண்டவரும், இந்திரியங்களை வென்றவரும், அறிவில் சிறந்தவரும், ராமதூதனுமான அனுமனை வணங்குகிறேன்."
    },
    spiritualSignificance: {
      kn: "ಶನಿ ದೋಷ, ಕುಜ ದೋಷ ಹಾಗೂ ಭಯ-ಆತಂಕಗಳನ್ನು ನಿವಾರಿಸಿ ಅಪ್ರತಿಮ ಧೈರ್ಯ, ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ಕಾರ್ಯಸಿದ್ಧಿ ನೀಡುತ್ತದೆ.",
      en: "Dispels fear, fatigue, Saturn/Mars afflictions, granting unyielding courage, health, and victory.",
      hi: "शनि दोष, भय, आलस्य का नाश कर असीम साहस, स्वास्थ्य एवं कार्यसिद्धि प्रदान करता है।",
      te: "భయం, బలహీనతలను పోగొట్టి అపారమైన ధైర్యం, ఆరోగ్యం మరియు రక్షణ కల్పిస్తుంది.",
      ta: "சனி தோஷம் மற்றும் பயம் நீங்கி தைரியம், தேக பலம் மற்றும் வெற்றி உண்டாகும்."
    }
  },

  // 5. Sri Guru Raghavendra / Brihaspati - Wisdom, Education & Jupiter/Guru Grace
  guru: {
    key: "guru",
    name: {
      kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ & ಬೃಹಸ್ಪತಿ (ಜ್ಞಾನ & ಗುರುಕೃಪೆ)",
      en: "Sri Guru Raghavendra & Brihaspati (Wisdom & Grace)",
      hi: "श्री गुरु राघवेंद्र स्वामी एवं बृहस्पति (ज्ञान एवं गुरु कृपा)",
      te: "శ్రీ గురు రాఘవేంద్ర స్వామి & బృహస్పతి (జ్ఞానం & గురుకృప)",
      ta: "ஸ்ரீ குரு ராகவேந்திரர் & பிரகஸ்பதி (ஞானம் & குரு அருள்)"
    },
    primaryColor: "#CA8A04",
    sanskritShloka: `ಪೂಜ್ಯಾಯ ರಾಘವೇಂದ್ರಾಯ ಸತ್ಯಧರ್ಮರತಾಯ ಚ ।
ಭಜತಾಂ ಕಲ್ಪವೃಕ್ಷಾಯ ನಮತಾಂ ಕಾಮಧೇನವೇ ॥
ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ ।
ಗುರುಸ್ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀ ಗುರವೇ ನಮಃ ॥`,
    transliteration: "Pūjyāya rāghavendrāya satyadharmaratāya ca | Bhajatāṁ kalpavṛkṣāya namatāṁ kāmadhenave || Gururbrahmā gururviṣṇuḥ gururdevo maheśvaraḥ | Gurussākṣāt parabrahma tasmai śrī gurave namaḥ ||",
    beejaMantra: {
      kn: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ · ॐ ಶ್ರೀ ರಾಘವೇಂದ್ರಾಯ ನಮಃ",
      en: "Om Graam Greem Graum Sah Gurave Namah · Om Sri Raghavendraya Namah",
      hi: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः · ॐ श्री राघवेंद्राय नमः",
      te: "ఓం గ్రాం గ్రీం గ్రౌం సః గురవే నమః · ఓం శ్రీ రాఘవేంద్రాయ నమః",
      ta: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ குரவே நமஃ · ஓம் ஸ்ரீ ராகவேந்திராய நமஃ"
    },
    meaning: {
      kn: "ಸತ್ಯ ಮತ್ತು ಧರ್ಮದಲ್ಲಿ ಸದಾ ನಿರತರಾದ, ಆಶ್ರಯಿಸಿದ ಭಕ್ತರಿಗೆ ಕಲ್ಪವೃಕ್ಷದಂತೆಯೂ, ನಮಸ್ಕರಿಸಿದವರಿಗೆ ಕಾಮಧೇನುವಿನಂತೆಯೂ ಇಷ್ಟಾರ್ಥಗಳನ್ನು ಈಡೇರಿಸುವ ಪೂಜ್ಯ ಗುರು ರಾಘವೇಂದ್ರರಿಗೆ ಮತ್ತು ಜಗದ್ಗುರುವಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      en: "Salutations to the venerable Guru Raghavendra, steadfast in truth and righteousness, who stands as the wish-fulfilling Kalpavriksha and Kamadhenu to all surrendered devotees.",
      hi: "सत्य और धर्म में निरंतर लीन, भक्तों के लिए कल्पवृक्ष एवं कामधेनु के समान मनोकामना पूर्ण करने वाले पूज्य गुरु राघवेंद्र तथा सद्गुरु को नमन।",
      te: "సత్యధర్మ పరాయణులు, భక్తులకు కల్పవృక్షం మరియు కామధేనువు సమానులైన శ్రీ గురు రాఘవేంద్రులకు నమస్కారములు.",
      ta: "சத்திய தர்மத்தில் நிலைத்தவரும், பக்தர்களுக்கு கற்பக விருட்சமாகவும் காமதேனுவாகவும் விளங்கும் ஸ்ரீ ராகவேந்திர குருவை வணங்குகிறேன்."
    },
    spiritualSignificance: {
      kn: "ಬುದ್ಧಿಶಕ್ತಿ, ವಿದ್ಯಾಭ್ಯಾಸ, ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಸದ್ಬುದ್ಧಿ ಹಾಗೂ ಗುರುಬಲದ ಪರಮಾನುಗ್ರಹವನ್ನು ಒದಗಿಸುತ್ತದೆ.",
      en: "Bestows divine intellect, success in education, career promotion, guidance, and spiritual clarity.",
      hi: "बुद्धि, विद्या, नौकरी में उन्नति, सही निर्णय क्षमता एवं गुरु कृपा प्रदान करता है।",
      te: "సద్బుద్ధి, ఉన్నత విద్య, ఉద్యోగ ఉన్నతి మరియు గురుబల అనుగ్రహాన్ని అందిస్తుంది.",
      ta: "கல்வி ஞானம், உத்தியோக உயர்வு, நற்புத்தி மற்றும் குரு பகவானின் பூரண அருளைத் தரும்."
    }
  },

  // 6. Sri Surya Narayana - Vitality, Health, Leadership & Sun/Atma Strength
  surya: {
    key: "surya",
    name: {
      kn: "ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣ (ತೇಜಸ್ಸು & ಆರೋಗ್ಯ ಪ್ರದಾತ)",
      en: "Lord Surya Narayana (Radiance, Vitality & Health)",
      hi: "श्री सूर्य नारायण (तेज एवं आरोग्य प्रदाता)",
      te: "శ్రీ సూర్య నారాయణ (తేజస్సు & ఆరోగ్యం)",
      ta: "ஸ்ரீ சூர்ய நாராயணர் (ஆரோக்கியம் & தேஜஸ்)"
    },
    primaryColor: "#B45309",
    sanskritShloka: `ನಮಃ ಸವಿತ್ರೇ ಜಗದೇಕಚಕ್ಷುಷೇ ಜಗತ್ಪ್ರಸೂತಿಸ್ಥಿತಿನಾಶಹೇತವೇ ।
ತ್ರಯೀಮಯಾಯ ತ್ರಿಗುಣಾತ್ಮಧಾರಿಣೇ ವಿರಿಂಚಿನಾರಾಯಣಶಂಕರಾತ್ಮನೇ ॥
ಓಂ ಸೂರ್ಯಾಯ ನಮಃ ॥`,
    transliteration: "Namaḥ savitre jagadekachakṣuṣe jagatprasūtisthitināśahetave | Trayīmayāya triguṇātmadhāriṇe viriñcinārāyaṇaśaṅkarātmane || Om Sūryāya Namaḥ ||",
    beejaMantra: {
      kn: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
      en: "Om Hram Hreem Hroum Sah Suryaya Namah",
      hi: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
      te: "ఓం హ్రాం హ్రీం హ్రౌಂ సః సూర్యాయ నమః",
      ta: "ஓம் ஹ்ராம் ஹ்ரீம் ஹ்ரௌம் ஸஃ சூர்யாய நமஃ"
    },
    meaning: {
      kn: "ಸಮಸ್ತ ಜಗತ್ತಿಗೆ ಏಕೈಕ ನೇತ್ರನಾದ, ಸೃಷ್ಟಿ-ಸ್ಥಿತಿ-ಲಯಗಳಿಗೆ ಕಾರಣನಾದ, ತ್ರಿವೇದ ಸ್ವರೂಪನಾದ ಹಾಗೂ ಬ್ರಹ್ಮ-ವಿಷ್ಣು-ಮಹೇಶ್ವರರ ತೇಜೋಮಯ ಮೂರ್ತಿಯಾದ ಭಗವಾನ್ ಸೂರ್ಯದೇವನಿಗೆ ನಮಸ್ಕರಿಸುತ್ತೇನೆ.",
      en: "Salutations to the Sun God, the supreme cosmic eye of the universe, the cause of creation, sustenance, and dissolution, embodiment of the Vedas and the sacred Trinity of Brahma, Vishnu, and Shiva.",
      hi: "संसार के एकमात्र नेत्र, सृष्टि के उत्पत्ति, पालन एवं संहार के कारण, त्रिवेदमय तथा ब्रह्मा-विष्णु-महेश रूपी भगवान सूर्य को नमन।",
      te: "జగానికి ఏకైక నేత్రము, సృష్టి స్థితి లయ కారకుడు, త్రిమూర్తి స్వరూపుడైన సూర్య భగవానునికి నమస్కారములు.",
      ta: "உலகிற்கே கண் போன்றவரும், படைத்தல் காத்தல் அழித்தலுக்கு காரணமானவரும், மும்மூர்த்தி வடிவினருமான சூரிய தேவனை பணிகிறேன்."
    },
    spiritualSignificance: {
      kn: "ದೈಹಿಕ ತೇಜಸ್ಸು, ಕಣ್ಣಿನ ಆರೋಗ್ಯ, ನಾಯಕತ್ವ ಗುಣ, ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ಕೀರ್ತಿಯನ್ನು ವೃದ್ಧಿಸುತ್ತದೆ.",
      en: "Amplifies physical vitality, leadership aura, mental vigor, self-confidence, and renown.",
      hi: "शारीरिक ओज, उत्तम स्वास्थ्य, नेतृत्व क्षमता, आत्मविश्वास और यश में वृद्धि करता है।",
      te: "శరీర తేజస్సు, ఆత్మవిశ్వాసం, నాయకత్వ లక్షణాలు మరియు కీర్తిని పెంపొందిస్తుంది.",
      ta: "உடல் நலம், தேஜஸ், தலைமைப் பண்பு, தன்னம்பிக்கை மற்றும் புகழைத் தரும்."
    }
  },

  // 7. Sri Maha Vishnu / Narayana - Protection, Balance & Mercury/Budha Grace
  vishnu: {
    key: "vishnu",
    name: {
      kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು / ನಾರಾಯಣ (ಶಾಂತಿ & ಸರ್ವ ರಕ್ಷಕ)",
      en: "Lord Maha Vishnu / Narayana (Sustainer & Preserver)",
      hi: "श्री महाविष्णु / नारायण (शांति एवं सर्व रक्षक)",
      te: "శ్రీ మహావిష్ణువు / నారాయణ (సర్వ రక్షకుడు)",
      ta: "ஸ்ரீ மகாவிஷ்ணு / நாராயணன் (சர்வ ரட்சகர்)"
    },
    primaryColor: "#059669",
    sanskritShloka: `ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ
ವಿಶ್ವಾಧಾರಂ ಗಗನಸದೃಶಂ ಮೇಘವರ್ಣಂ ಶುಭಾಂಗಮ್ ।
ಲಕ್ಷ್ಮೀಕಾಂತಂ ಕಮಲನಯನಂ ಯೋಗಿಹೃರ್ದ್ಧ್ಯಾನಗಮ್ಯಂ
ವಂದೇ ವಿಷ್ಣುಂ ಭವಭಯಹರಂ ಸರ್ವಲೋಕೈಕನಾಥಮ್ ॥`,
    transliteration: "Śāntākāraṁ bhujagaśayanaṁ padmanābhaṁ sureśaṁ viśvādhāraṁ gaganasadṛśaṁ meghavarṇaṁ śubhāṅgam | Lakṣmīkāntaṁ kamalanayanaṁ yogihṛddhyānagamyaṁ vande viṣṇuṁ bhavabhayaharaṁ sarvalokaikanātham ||",
    beejaMantra: {
      kn: "ॐ ನಮೋ ಭಗವತೇ ವಾಸುದೇವಾಯ · ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ",
      en: "Om Namo Bhagavate Vasudevaya · Om Bram Breem Braum Sah Budhaya Namah",
      hi: "ॐ नमो भगवते वासुदेवाय · ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
      te: "ఓం నమో భగవతే వాసుదేవాయ · ఓం బ్రాం బ్రీం బ్రౌం సః బుధాయ నమః",
      ta: "ஓம் நமோ பகவதே வாசுதேவாய · ஓம் ப்ராம் ப்ரீம் ப்ரௌம் ஸஃ புதாய நமஃ"
    },
    meaning: {
      kn: "ಪರಮ ಶಾಂತ ಸ್ವರೂಪಿಯಾದ, ಶೇಷನಾಗನ ಮೇಲೆ ಶಯನಿಸಿರುವ, ನಾಭಿಯಲ್ಲಿ ಕಮಲವುಳ್ಳ, ದೇವತೆಗಳ ಈಶ್ವರನಾದ, ವಿಶ್ವಕ್ಕೆ ಆಧಾರನಾದ, ಆಕಾಶದಂತೆ ವ್ಯಾಪಕನಾದ, ಕಮಲನಯನನೂ ಹಾಗೂ ಸಂಸಾರ ಭಯವನ್ನು ನಾಶಮಾಡುವ ಶ್ರೀ ಮಹಾವಿಷ್ಣುವನ್ನು ವಂದಿಸುತ್ತೇನೆ.",
      en: "I revere Lord Vishnu, the embodiment of serenity, resting upon the serpent Adisesha, with a lotus navel, Lord of the gods, the substratum of the universe, beloved of Lakshmi, who dispels the fear of worldly existence.",
      hi: "परम शांत स्वरूप, शेषनाग पर शयन करने वाले, नाभिकमलधारी, देवताओं के ईश, विश्व के आधार एवं संसार भय को हरने वाले भगवान विष्णु की वंदना करते हैं।",
      te: "ప్రశాంత స్వరూపుడు, శేషశయనుడు, విశ్వాధారుడు, సంసార భయాలను హరించే లోకనాథుడైన శ్రీ మహావిష్ణువునకు నమస్కారములు.",
      ta: "சாந்த சொரூபியான, பாம்பணையில் துயில்பவரும், உலகை காப்பவருமான ஸ்ரீ மகாவிஷ்ணுவை சரணடைகிறேன்."
    },
    spiritualSignificance: {
      kn: "ವ್ಯಾಪಾರ, ಬುದ್ಧಿವಂತಿಕೆ, ಸುಗಮ ಸಂವಹನ, ಕುಟುಂಬದ ರಕ್ಷಣೆ ಹಾಗೂ ಸರ್ವತೋಮುಖ ನೆಮ್ಮದಿಯನ್ನು ನೀಡುತ್ತದೆ.",
      en: "Infuses sharp intellect, analytical clarity, diplomatic communication, and supreme household protection.",
      hi: "बुद्धि, व्यापारिक सूझबूझ, वाणी में मधुरता, पारिवारिक सुरक्षा एवं शांति प्रदान करता है।",
      te: "వ్యాపార వృద్ధి, వాక్ చాతుర్యం, కుటుంబ రక్షణ మరియు ప్రశాంతతను అనుగ్రహిస్తుంది.",
      ta: "வியாபார மேன்மை, சிறந்த பேச்சுத்திறன், குடும்ப அமைதி மற்றும் பாதுகாப்பைத் தரும்."
    }
  },

  // 8. Sri Subrahmanya (Karthikeya) - Victory, Property & Mars/Kuja Grace
  subrahmanya: {
    key: "subrahmanya",
    name: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ (ಕಾರ್ತಿಕೇಯ - ವಿಜಯ ಪ್ರದಾತ)",
      en: "Lord Subrahmanya (Karthikeya - Victorious Protector)",
      hi: "श्री सुब्रह्मण्य स्वामी (कार्तिकेय - विजय प्रदाता)",
      te: "శ్రీ సుబ్రహ్మణ్య స్వామి (కార్తికేయ - విజయ ప్రదాత)",
      ta: "ஸ்ரீ சுப்பிரமணிய சுவாமி (முருகப் பெருமான் - வெற்றி வடிவேலன்)"
    },
    primaryColor: "#E11D48",
    sanskritShloka: `ಷಡಾನನಂ ಚಂದನಲೇಪಿತಾಂಗಂ ಮಹೋರಸಂ ದಿವ್ಯಮಯೂರವಾಹನಮ್ ।
ರುದ್ರಸ್ಯ ಸೂನುಂ ಸುರಸೈನ್ಯನಾಥಂ ಗುಹಂ ಸದಾ ಶರಣಮಹಂ ಪ್ರಪದ್ಯೇ ॥
ಓಂ ಶರವಣಭವಾಯ ನಮಃ ॥`,
    transliteration: "Ṣaḍānanaṁ candanalepitāṅgaṁ mahorasaṁ divyamayūravāhanam | Rudrasya sūnuṁ surasainyanāthaṁ guhaṁ sadā śaraṇamahaṁ prapadye || Om Śaravaṇabhavāya Namaḥ ||",
    beejaMantra: {
      kn: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ · ॐ ಶರವಣಭವಾಯ ನಮಃ",
      en: "Om Kraam Kreem Kraum Sah Bhaumaya Namah · Om Saravanabhavaya Namah",
      hi: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः · ॐ शरवणभवाय नमः",
      te: "ఓం క్రాం క్రీం క్రౌం సః భౌమాయ నమః · ఓం శరవణభవాయ నమః",
      ta: "ஓம் க்ராம் க்ரீம் க்ரௌம் ஸஃ பௌமாய நமஃ · ஓம் சரவணபவாய நமஃ"
    },
    meaning: {
      kn: "ಆರು ಮುಖಗಳುಳ್ಳ, ಶ್ರೀಗಂಧ ಲೇಪಿತ ದೇಹವುಳ್ಳ, ದಿವ್ಯ ನವಿಲು ವಾಹನದಲ್ಲಿ ವಿರಾಜಮಾನನಾದ, ರುದ್ರದೇವರ ಪುತ್ರನೂ ದೇವಸೇನಾಧಿಪತಿಯೂ ಆದ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯನ್ನು ಸದಾ ಶರಣು ಹೊಂದುತ್ತೇನೆ.",
      en: "I seek refuge in Lord Guha (Subrahmanya), the six-faced Lord adorned with fragrant sandalwood, commander of the celestial armies, son of Lord Shiva, riding upon the radiant peacock.",
      hi: "छह मुखों वाले, चंदन से सुशोभित, दिव्य मयूर वाहन पर आरूढ़, भगवान शिव के पुत्र एवं देवसेनापति श्री सुब्रह्मण्य की शरण में जाते हैं।",
      te: "ఆరు ముఖాలు కలవాడు, నెమలి వాహనారూఢుడు, పరమశివుని పుత్రుడు, దేవసేనాధిపతి అయిన సుబ్రహ్మణ్యుని శరణు వేడుచున్నాను.",
      ta: "ஆறுமுகங்கள் கொண்டவரும், சந்தனம் பூசிய மேனியரும், மயில் வாகனத்தில் வீற்றிருக்கும் சிவமைந்தன் முருகப் பெருமானை சரணடைகிறேன்."
    },
    spiritualSignificance: {
      kn: "ಭೂಮಿ, ಆಸ್ತಿ ವಿವಾದ ನಿವಾರಣೆ, ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಣ, ಶತ್ರುನಾಶ ಹಾಗೂ ಧೈರ್ಯ-ಪರಾಕ್ರಮಗಳನ್ನು ಕರುಣಿಸುತ್ತದೆ.",
      en: "Resolves land and property matters, quells conflicts, dispels anger, and grants resolute victory.",
      hi: "भूमि-संपत्ति विवादों का समाधान, शत्रु बाधा निवारण एवं अदम्य साहस प्रदान करता है।",
      te: "భూమి, ఆస్తి వివాదాలు తొలగి ధైర్యం, ఉత్సాహం మరియు విజయాన్ని ప్రసాదిస్తుంది.",
      ta: "பூமி-சொத்து லாபம், தைரியம் மற்றும் காரிய வெற்றி உண்டாகும்."
    }
  }
};

// ── ASTROLOGICAL COLOR & DIRECTION HARMONIZERS ──
const PLANET_POWER_PALETTES: Record<string, { colorKn: string; colorEn: string; colorHi: string; colorTe: string; colorTa: string; hex: string; borderClass: string; dirKn: string; dirEn: string; dirHi: string; dirTe: string; dirTa: string; degrees: string }> = {
  Sun: {
    colorKn: "ಕಿತ್ತಳೆ & ಬಂಗಾರದ ವರ್ಣ (Orange/Gold)",
    colorEn: "Radiant Saffron & Gold",
    colorHi: "केसरिया एवं स्वर्ण रंग",
    colorTe: "కాషాయం & బంగారు వర్ణం",
    colorTa: "செம்மஞ்சள் & தங்க நிறம்",
    hex: "#EA580C",
    borderClass: "border-amber-400",
    dirKn: "ಪೂರ್ವ ದಿಕ್ಕು (East - ಸೂರ್ಯ ಸನ್ನಿಧಿ)",
    dirEn: "East Direction (Surya Vibe)",
    dirHi: "पूर्व दिशा (सूर्य ऊर्जा)",
    dirTe: "తూర్పు దిశ (సూర్య కాంతి)",
    dirTa: "கிழக்கு திசை (சூர்ய பலம்)",
    degrees: "90° East"
  },
  Moon: {
    colorKn: "ಮುತ್ತಿನ ಬಿಳಿ & ತಿಳಿ ಬೆಳ್ಳಿ (Pearl White)",
    colorEn: "Pristine Pearl White",
    colorHi: "मोती श्वेत एवं रजत रंग",
    colorTe: "ముత్యపు తెలుపు వర్ణం",
    colorTa: "முத்து வெள்ளை & வெள்ளி நிறம்",
    hex: "#F8FAFC",
    borderClass: "border-slate-300",
    dirKn: "ವಾಯುವ್ಯ ದಿಕ್ಕು (North-West - ಚಂದ್ರ ದಿಕ್ಕು)",
    dirEn: "North-West Direction (Chandra Energy)",
    dirHi: "वायव्य दिशा (चंद्र प्रभाव)",
    dirTe: "వాయువ్య దిశ (చంద్ర దిశ)",
    dirTa: "வடமேற்கு திசை (சந்திர பலம்)",
    degrees: "315° North-West"
  },
  Mars: {
    colorKn: "ಸಿಂಧೂರ ಕೆಂಪು & ಹವಳ ವರ್ಣ (Coral Red)",
    colorEn: "Deep Coral Red & Crimson",
    colorHi: "सिंदूरी लाल एवं मूँगा रंग",
    colorTe: "సిందూర ఎరుపు వర్ణం",
    colorTa: "பவள சிவப்பு நிறம்",
    hex: "#E11D48",
    borderClass: "border-rose-400",
    dirKn: "ದಕ್ಷಿಣ ದಿಕ್ಕು (South - ಕುಜ ದಿಕ್ಕು)",
    dirEn: "South Direction (Mangala Energy)",
    dirHi: "दक्षिण दिशा (मंगल प्रभाव)",
    dirTe: "దక్షిణ దిశ (కుజ దిశ)",
    dirTa: "தெற்கு திசை (செவ்வாய் பலம்)",
    degrees: "180° South"
  },
  Mercury: {
    colorKn: "ಪಚ್ಚೆ ಹಸಿರು (Emerald Green)",
    colorEn: "Vibrant Emerald Green",
    colorHi: "पन्ना हरा रंग",
    colorTe: "పచ్చని పచ్చ వర్ణం (Emerald)",
    colorTa: "மரகத பச்சை நிறம்",
    hex: "#10B981",
    borderClass: "border-emerald-400",
    dirKn: "ಉತ್ತರ ದಿಕ್ಕು (North - ಬುಧ ಸನ್ನಿಧಿ)",
    dirEn: "North Direction (Budha Vibe)",
    dirHi: "उत्तर दिशा (बुध प्रभाव)",
    dirTe: "ఉత్తర దిశ (బుధ దిశ)",
    dirTa: "வடக்கு திசை (புதன் பலம்)",
    degrees: "0° North"
  },
  Jupiter: {
    colorKn: "ಪೀತಾಂಬರ ಹಳದಿ (Saffron/Golden Yellow)",
    colorEn: "Golden Pitambara Yellow",
    colorHi: "पीतांबर पीला रंग",
    colorTe: "పీతాంబర పసుపు వర్ణం",
    colorTa: "பொன் மஞ்சள் நிறம்",
    hex: "#F59E0B",
    borderClass: "border-yellow-400",
    dirKn: "ಈಶಾನ್ಯ ದಿಕ್ಕು (North-East - ಈಶಾನ/ಗುರು ಮೂಲೆ)",
    dirEn: "North-East Direction (Ishanya / Guru)",
    dirHi: "ईशान कोण / उत्तर-पूर्व (गुरु ऊर्जा)",
    dirTe: "ఈశాన్య దిశ (గురు స్థానం)",
    dirTa: "ஈசான்ய / வடகிழக்கு திசை",
    degrees: "45° North-East"
  },
  Venus: {
    colorKn: "ರೇಷ್ಮೆ ಬಿಳಿ & ತಿಳಿ ಗುಲಾಬಿ (Silk White/Rose)",
    colorEn: "Silk White & Soft Rose",
    colorHi: "रेशमी श्वेत एवं गुलाबी रंग",
    colorTe: "పట్టు తెలుపు & గులాబీ వర్ణం",
    colorTa: "பட்டு வெள்ளை & ரோஸ் நிறம்",
    hex: "#EC4899",
    borderClass: "border-pink-400",
    dirKn: "ಆಗ್ನೇಯ ದಿಕ್ಕು (South-East - ಶುಕ್ರ ದಿಕ್ಕು)",
    dirEn: "South-East Direction (Shukra Vibe)",
    dirHi: "आग्नेय दिशा (शुक्र प्रभाव)",
    dirTe: "ఆగ్నేయ దిశ (శుక్ర దిశ)",
    dirTa: "தென்கிழக்கு திசை (சுக்கிர பலம்)",
    degrees: "135° South-East"
  },
  Saturn: {
    colorKn: "ನೀಲಮಣಿ ನೀಲಿ & ಕಡು ಕಪ್ಪು (Royal/Navy Blue)",
    colorEn: "Deep Sapphire Navy Blue",
    colorHi: "नीलम नीला एवं गहरा रंग",
    colorTe: "నీలమణి నీలం వర్ణం",
    colorTa: "நீல வண்ண மேனி நிறம்",
    hex: "#1E3A8A",
    borderClass: "border-blue-400",
    dirKn: "ಪಶ್ಚಿಮ ದಿಕ್ಕು (West - ಶನಿ ದಿಕ್ಕು)",
    dirEn: "West Direction (Shani Energy)",
    dirHi: "पश्चिम दिशा (शनि प्रभाव)",
    dirTe: "పశ్చిమ దిశ (శని దిశ)",
    dirTa: "மேற்கு திசை (சனி பலம்)",
    degrees: "270° West"
  },
  Rahu: {
    colorKn: "ಕಡು ಬೂದು & ಹೊಗೆ ವರ್ಣ (Smoky Grey)",
    colorEn: "Smoky Charcoal Grey",
    colorHi: "धूम्र वर्ण / गहरा स्लेटी",
    colorTe: "పొగ బూడిద వర్ణం",
    colorTa: "சாம்பல் நிறம்",
    hex: "#475569",
    borderClass: "border-slate-500",
    dirKn: "ನೈಋತ್ಯ ದಿಕ್ಕು (South-West - ರಾಹು ದಿಕ್ಕು)",
    dirEn: "South-West Direction (Rahu Vibe)",
    dirHi: "नैऋत्य दिशा (राहु प्रभाव)",
    dirTe: "నైరుతి దిశ (రాహు దిశ)",
    dirTa: "தென்மேற்கு திசை (ரஹு பலம்)",
    degrees: "225° South-West"
  },
  Ketu: {
    colorKn: "ಕಂದು & ಬಹುಬಣ್ಣ (Multi-Tone Earth)",
    colorEn: "Tawny Brown & Multi-Tone",
    colorHi: "चितकबरा एवं भूरा रंग",
    colorTe: "గోధుమ & బహుళ వర్ణం",
    colorTa: "பலவண்ண பழுப்பு நிறம்",
    hex: "#78350F",
    borderClass: "border-amber-600",
    dirKn: "ಈಶಾನ್ಯ-ಉತ್ತರ ದಿಕ್ಕು (North-East Transcendental)",
    dirEn: "North-East Higher Spiritual Axis",
    dirHi: "ईशान आध्यात्मिक अक्ष",
    dirTe: "ఈశాన్య ఆధ్యాత్మిక దిశ",
    dirTa: "வடகிழக்கு ஆன்மீக திசை",
    degrees: "45° North-East"
  }
};

/**
 * Main Dynamic Resolution Function for Tab 1 & Tab 2
 */
export function computePersonalizedDarshanaPayload(params: PersonalizeDarshanaParams): PersonalizedDarshanaPayload {
  const {
    birthKundli,
    devoteeName = "ಭಕ್ತರು",
    gotra = "ಕಾಶ್ಯಪ",
    birthDate = "1990-01-01",
    birthTime = "12:00",
    targetDate,
    natalMoonRashi = 8,
    natalNakshatra = 18,
    natalLagnaRashi = 0,
    lang = "kn",
    userLat = 14.5479,
    userLng = 74.3187,
    userPincode = "581326",
    priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
  } = params;

  // 1. Compute Live Astronomical Gochara Moon
  const gochara = computeGocharaMoonForDate(targetDate, userLat, userLng, userPincode);
  const chandraBalaHouse = ((gochara.transitMoonRashi - natalMoonRashi + 12) % 12) + 1;
  const isChandrashtama = (chandraBalaHouse === 8);
  const taraBalaNumber = (((gochara.transitMoonNakshatra - natalNakshatra + 27) % 27) % 9) + 1;

  // 2. Compute Running Dasha-Bhukti
  let runningMahadashaLord = PlanetName.Saturn;
  let runningAntardashaLord = PlanetName.Jupiter;
  let runningDashaSummary = "ಶನಿ ಮಹಾದಶಾ · ಗುರು ಭುಕ್ತಿ";

  if (birthKundli && birthDate) {
    try {
      // Normalize kundli format (array vs object planets)
      const normalizedKundli: KundliOutput = {
        ...birthKundli,
        planets: Array.isArray(birthKundli.planets)
          ? birthKundli.planets
          : Object.values(birthKundli.planets || {})
      };

      const birthY = new Date(birthDate).getFullYear();
      const targetY = new Date(targetDate).getFullYear();
      const ageYears = Math.max(0, targetY - birthY);
      const bhuktiInfo = findBhuktiAtAge(normalizedKundli, ageYears);
      if (bhuktiInfo) {
        runningMahadashaLord = bhuktiInfo.maha.planet;
        runningAntardashaLord = bhuktiInfo.bhukti;
        runningDashaSummary = `${bhuktiInfo.maha.planet} ಮಹಾದಶಾ · ${bhuktiInfo.bhukti} ಭುಕ್ತಿ`;
      }
    } catch (e) {
      console.warn("[dailyDarshanaPersonalizationEngine] Dasha calculation fallback:", e);
    }
  }

  // 3. Compute Live Astronomical Panchanga
  const KN_RITUS = [
    "ವಸಂತ ಋತು", "ವಸಂತ ಋತು",
    "ಗ್ರೀಷ್ಮ ಋತು", "ಗ್ರೀಷ್ಮ ಋತು",
    "ವರ್ಷ ಋತು", "ವರ್ಷ ಋತು",
    "ಶರದ್ ಋತು", "ಶರದ್ ಋತು",
    "ಹೇಮಂತ ಋತು", "ಹೇಮಂತ ಋತು",
    "ಶಿಶಿರ ಋತು", "ಶಿಶಿರ ಋತು"
  ];
  const KN_VASARAS = ["ಭಾನುವಾಸರ", "ಸೋಮವಾಸರ", "ಮಂಗಳವಾಸರ", "ಬುಧವಾಸರ", "ಗುರುವಾಸರ", "ಭೃಗುವಾಸರ", "ಸ್ಥಿರವಾಸರ"];

  let livePanchanga = {
    samvatsara: "ಕ್ರೋಧೀ",
    ayana: "ದಕ್ಷಿಣಾಯನ",
    ritu: "ವರ್ಷ ಋತು",
    masa: "ಶ್ರಾವಣ ಮಾಸ",
    paksha: "ಶುಕ್ಲ ಪಕ್ಷ",
    tithi: "ಏಕಾದಶೀ",
    vasara: "ಭೃಗುವಾಸರ",
    nakshatra: "ಮೂಲಾ",
    yoga: "ಸಿದ್ಧಿ",
    karana: "ಬವ"
  };

  try {
    const pDate = new Date(targetDate);
    const pResult = calculatePanchang(pDate, userLat, userLng);
    const { monthIndex, isAdhika, samvatsaraIndex } = getLunarMonthAndYear(pDate, "lahiri");

    const samvatsaraKn = getLocalizedSamvatsara("kn", samvatsaraIndex);
    const masaKn = getLocalizedMasa("kn", monthIndex, isAdhika);
    const ayanaKn = (monthIndex >= 3 && monthIndex <= 8) ? "ದಕ್ಷಿಣಾಯನ" : "ಉತ್ತರಾಯಣ";
    const rituKn = KN_RITUS[monthIndex] || "ವರ್ಷ ಋತು";
    const vasaraKn = KN_VASARAS[pDate.getDay()] || "ಸೌಮ್ಯವಾಸರ";

    livePanchanga = {
      samvatsara: samvatsaraKn,
      ayana: ayanaKn,
      ritu: rituKn,
      masa: masaKn,
      paksha: pResult?.paksha === "Krishna" ? "ಕೃಷ್ಣ ಪಕ್ಷ" : "ಶುಕ್ಲ ಪಕ್ಷ",
      tithi: pResult?.tithiKn || pResult?.tithi || "ತ್ರಯೋದಶೀ",
      vasara: vasaraKn,
      nakshatra: pResult?.nakshatra || "ಅನುರಾಧಾ",
      yoga: pResult?.yoga || "ಸಿದ್ಧಿ",
      karana: pResult?.karana || "ಬವ"
    };
  } catch (e) {
    console.warn("[dailyDarshanaPersonalizationEngine] Panchanga engine fallback:", e);
  }

  // 4. Dynamic Deity & Sacred Shloka Selection Algorithm
  let chosenDeityKey = "shiva";
  let selectionReason: Record<SevaLang, string> = {
    kn: "ಇಂದಿನ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಗೆ ಸಕಲ ಸೌಖ್ಯ ನೀಡುವ ಪರಮೇಶ್ವರನ ಆರಾಧನೆ.",
    en: "Auspicious invocation of Lord Shiva to bless your daily endeavors with profound peace.",
    hi: "आपके गोचर एवं जन्म कुंडली के अनुकूल भगवान शिव की पावन आराधना।",
    te: "మీ గోచారం మరియు జన్మ జాతకానికి అనుకూలంగా పరమశివుని దివ్య ఆరాధన.",
    ta: "உங்கள் ஜாதகம் மற்றும் கோச்சாரத்திற்கு ஏற்ப சிவபெருமானின் புனித வழிபாடு."
  };

  if (isChandrashtama) {
    // Top Priority: Chandrashtama Protection
    chosenDeityKey = "shiva";
    selectionReason = {
      kn: "ಇಂದು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ೮ನೇ ಮನೆಯ ಚಂದ್ರಾಷ್ಟಮ ಸಂಚಾರವಿರುವುದರಿಂದ, ಮಾನಸಿಕ ಶಾಂತಿ ಹಾಗೂ ರಕ್ಷಣೆಗಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪ ಅತ್ಯಂತ ಪ್ರಶಸ್ತ.",
      en: "Due to 8th house Chandrashtama transit today, chanting Lord Mahabaleshwara's Mrityunjaya shloka grants immediate mental shielding and calm.",
      hi: "आज आपकी राशि से ८वें भाव में चंद्राष्टम गोचर होने के कारण मानसिक शांति एवं रक्षा हेतु श्री महाबलेश्वर मृत्युंजय जप अत्यंत लाभकारी है।",
      te: "నేడు 8వ స్థానంలో చంద్రాష్టమ సంచారం ఉన్నందున, మానసిక ప్రశాంతత కొరకు శ్రీ మహాబలేశ్వర మృత్యుంజయ జపం అత్యంత శ్రేష్టం.",
      ta: "இன்று சந்திராஷ்டம தினமாக இருப்பதால் மன அமைதி மற்றும் பாதுகாப்பிற்கு மகாபலேஸ்வரரின் மிருத்யுஞ்சய ஜபம் சிறந்தது."
    };
  } else {
    // Align with running Mahadasha/Antardasha Lord
    const targetLord = runningAntardashaLord || runningMahadashaLord;
    switch (targetLord) {
      case PlanetName.Sun:
        chosenDeityKey = "surya";
        selectionReason = {
          kn: `ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಸೂರ್ಯನ ದಶಾ ಪ್ರಭಾವದಿಂದ ನಾಯಕತ್ವ, ಆತ್ಮಸ್ಥೈರ್ಯ ಹಾಗೂ ಆರೋಗ್ಯ ವೃದ್ಧಿಗಾಗಿ ಶ್ರೀ ಸೂರ್ಯ ನಾರಾಯಣನ ಉಪಾಸನೆ.`,
          en: `Harmonizing active Sun planetary cycle for peak vitality, leadership aura, and glowing health.`,
          hi: `सक्रिय सूर्य दशा प्रभाव से आरोग्य, आत्मविश्वास एवं तेज वृद्धि हेतु श्री सूर्य नारायण की आराधना।`,
          te: `సూర్య దశా ప్రభావంతో ఆరోగ్యం, ఆత్మస్థైర్యం పెంపొందించుటకు శ్రీ సూర్య నారాయణ ఆరాధన.`,
          ta: `சூரிய திசை பலத்தால் ஆரோக்கியம் மற்றும் தலைமைப் பண்பு பெற சூர்ய நாராயணர் வழிபாடு.`
        };
        break;
      case PlanetName.Moon:
        chosenDeityKey = "shiva";
        selectionReason = {
          kn: `ನಿಮ್ಮ ಚಂದ್ರನ ದಶಾ ಪ್ರಭಾವ ಹಾಗೂ ಮನಸ್ಸಿನ ಪ್ರಸನ್ನತೆಗಾಗಿ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರನ ಧ್ಯಾನ.`,
          en: `Strengthening natal Moon for emotional serenity, family warmth, and clarity through Lord Shiva.`,
          hi: `चंद्रमा के शुभ प्रभाव एवं मानसिक शांति हेतु गोकर्ण महाबलेश्वर का ध्यान।`,
          te: `చంద్రుని అనుగ్రహం మరియు మానసిక ప్రశాంతత కోసం శ్రీ మహాబలేశ్వర ధ్యానం.`,
          ta: `சந்திரனின் சுப பார்வை மற்றும் மன அமைதிக்காக கோகர்ண மகாபலேஸ்வரர் தியானம்.`
        };
        break;
      case PlanetName.Mars:
        chosenDeityKey = "subrahmanya";
        selectionReason = {
          kn: `ಕುಜ ಗ್ರಹದ ದಶಾ ಬಲದಿಂದ ಆಸ್ತಿ-ಕಾರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಧೈರ್ಯಕ್ಕಾಗಿ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಆರಾಧನೆ.`,
          en: `Channeling dynamic Mars energy for victory in property, courage, and removing obstacles.`,
          hi: `मंगल ग्रह के शुभ प्रभाव से साहस, संपत्ति एवं विजय प्राप्ति हेतु श्री सुब्रह्मण्य आराधना।`,
          te: `కుజ గ్రహ అనుగ్రహంతో ధైర్యం, ఆస్తి వివాదాల పరిష్కారం కొరకు సుబ్రహ్మణ్య స్వామి ఆరాధన.`,
          ta: `செவ்வாய் பகவானின் பலத்தால் நிலம், தைரியம் மற்றும் காரிய வெற்றி பெற முருகப் பெருமான் வழிபாடு.`
        };
        break;
      case PlanetName.Mercury:
        chosenDeityKey = "vishnu";
        selectionReason = {
          kn: `ಬುಧ ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ವ್ಯಾಪಾರ, ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಹಣಕಾಸು ಪ್ರಗತಿಗಾಗಿ ಶ್ರೀ ಮಹಾವಿಷ್ಣುವಿನ ಆರಾಧನೆ.`,
          en: `Enhancing Mercury intellect, business negotiations, and smooth wealth generation through Lord Vishnu.`,
          hi: `बुध ग्रह के प्रभाव से व्यापार, बुद्धि एवं धन वृद्धि हेतु भगवान विष्णु की आराधना।`,
          te: `బుధ గ్రహ ప్రభావంతో వ్యాపార వృద్ధి, విద్యా వికాసం కోసం శ్రీ మహావిష్ణు ఆరాధన.`,
          ta: `புதன் பகவானின் அருளால் வியாபார லாபம், கல்வி மேம்பாட்டிற்கு மகாவிஷ்ணு வழிபாடு.`
        };
        break;
      case PlanetName.Jupiter:
        chosenDeityKey = "guru";
        selectionReason = {
          kn: `ಗುರು ಗ್ರಹದ ದಶಾ ಪ್ರಭಾವದಿಂದ ಜ್ಞಾನ, ಕೌಟುಂಬಿಕ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಉದ್ಯೋಗ ಬಡ್ತಿಗಾಗಿ ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರರ ಉಪಾಸನೆ.`,
          en: `Invoking Guru Jupiter's divine wisdom, spiritual elevation, and career progression through Sri Guru Raghavendra.`,
          hi: `गुरु ग्रह के पावन प्रभाव से ज्ञान, सुख-समृद्धि एवं कार्योन्नति हेतु श्री गुरु राघवेंद्र की उपासना।`,
          te: `గురు గ్రహ దివ్య ప్రభావంతో జ్ఞానం, కుటుంబ సౌభాగ్యం కోసం శ్రీ గురు రాఘవేంద్రుల ఉపాసన.`,
          ta: `குரு பகவானின் ஆசியால் கல்வி, உத்தியோக உயர்வு பெற ஸ்ரீ ராகவேந்திரர் வழிபாடு.`
        };
        break;
      case PlanetName.Venus:
        chosenDeityKey = "mahalakshmi";
        selectionReason = {
          kn: `ಶುಕ್ರ ಗ್ರಹದ ದಶಾ ಬಲದಿಂದ ಐಶ್ವರ್ಯ, ಗೃಹ ಸೌಖ್ಯ ಹಾಗೂ ಧನಲಾಭಕ್ಕಾಗಿ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿಯ ಆರಾಧನೆ.`,
          en: `Amplifying Venus abundance, domestic luxury, and joyful investments through Goddess Mahalakshmi.`,
          hi: `शुक्र ग्रह के प्रभाव से धन, समृद्धि एवं पारिवारिक सुख हेतु श्री महालक्ष्मी की आराधना।`,
          te: `శుక్ర గ్రహ అనుగ్రహంతో ఐశ్వర్యం, గృహ శాంతి మరియు ధనలాభం కోసం మహాలక్ష్మీ ఆరాధన.`,
          ta: `சுக்கிர பலத்தால் தன லாபம் மற்றும் குடும்ப மகிழ்ச்சிக்கு ஸ்ரீ மகாலட்சுமி வழிபாடு.`
        };
        break;
      case PlanetName.Saturn:
        chosenDeityKey = "hanuman";
        selectionReason = {
          kn: `ಶನಿ ಗ್ರಹದ ದಶಾ ಪ್ರಭಾವದಿಂದ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ, ಕಾರ್ಯಸಿದ್ಧಿ ಹಾಗೂ ರಕ್ಷಣೆಗಾಗಿ ಶ್ರೀ ವೀರ ಆಂಜನೇಯನ ಸ್ಮರಣೆ.`,
          en: `Pacifying Saturn transit with unwavering fortitude, protection, and endurance through Lord Hanuman.`,
          hi: `शनि ग्रह के प्रभाव से कार्यसिद्धि, धैर्य एवं संकट निवारण हेतु श्री वीर हनुमान जी का स्मरण।`,
          te: `శని గ్రహ ప్రభావంతో ధైర్యం, రక్షణ మరియు విజయానికి శ్రీ వీర హనుమాన్ స్మరణ.`,
          ta: `சனி பகவானின் தாக்கத்தை வென்று தைரியமும் வெற்றியும் பெற வீர ஆஞ்சநேயர் வழிபாடு.`
        };
        break;
      case PlanetName.Rahu:
        chosenDeityKey = "ganapati";
        selectionReason = {
          kn: `ರಾಹು ಗ್ರಹದ ದಶಾ ಪ್ರಭಾವದಿಂದ ಅನಿರೀಕ್ಷಿತ ಅಡೆತಡೆ ನಿವಾರಣೆ ಹಾಗೂ ಯಶಸ್ಸಿಗಾಗಿ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಆರಾಧನೆ.`,
          en: `Clearing illusionary obstacles and granting sharp decision-making through Lord Ganesha.`,
          hi: `राहु के प्रभाव से अप्रत्याशित बाधाओं के निवारण एवं सफलता हेतु श्री महागणपति की आराधना।`,
          te: `రాహు గ్రహ ఆటంకాలను తొలగించి సత్వర విజయానికై శ్రీ మహాగణపతి ఆరాధన.`,
          ta: `ரஹு தோஷம் நீங்கி தடையில்லா வெற்றி பெற விநாயகர் வழிபாடு.`
        };
        break;
      case PlanetName.Ketu:
        chosenDeityKey = "ganapati";
        selectionReason = {
          kn: `ಕೇತು ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ಉನ್ನತಿ ಹಾಗೂ ಸಕಲ ಸಿದ್ಧಿಗಾಗಿ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಉಪಾಸನೆ.`,
          en: `Elevating spiritual intuition and peaceful focus through Lord Maha Ganapati.`,
          hi: `केतु के प्रभाव से आत्मिक शांति एवं सफलता हेतु श्री महागणपति की उपासना।`,
          te: `కేతు గ్రహ ప్రభావంతో ఆధ్యాత్మిక ప్రశాంతత కోసం శ్రీ మహాగణపతి ఉపాసన.`,
          ta: `கேதுவின் தாக்கத்தை கடந்து ஞானமும் அமைதியும் பெற விநாயகர் வழிபாடு.`
        };
        break;
      default:
        chosenDeityKey = "shiva";
    }
  }

  const chosenDeity = DEITY_SHLOKA_DATABASE[chosenDeityKey] || DEITY_SHLOKA_DATABASE.shiva;

  // 5. Dynamic Chief Priest Benediction
  const priestBenediction: Record<SevaLang, string> = {
    kn: `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಿಂದ ಪ್ರಧಾನ ಅರ್ಚಕ ${priestName} ಅವರ ಸತ್ಯ ಆಶೀರ್ವಚನ: ${devoteeName} ಅವರೇ, ಇಂದು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಗೆ ${chandraBalaHouse}ನೇ ಭಾವದ ಗೋಚಾರ ಚಂದ್ರ ಸಂಚಾರ ಹಾಗೂ ${runningDashaSummary} ನಡೆಯುತ್ತಿದೆ. ${isChandrashtama ? "ಇಂದು ಚಂದ್ರಾಷ್ಟಮವಿರುವುದರಿಂದ ಶಾಂತಚಿತ್ತದಿಂದ ಶಿವಸ್ಮರಣೆ ಮಾಡಿ ದಿನವನ್ನು ಶುಭವಾಗಿಸಿಕೊಳ್ಳಿ." : "ಇಂದು ನವಗ್ರಹಗಳ ಪೂರ್ಣ ಕೃಪೆಯಿಂದ ಕೈಗೊಂಡ ಸತ್ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು ಲಭಿಸಲಿ."} ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮತ್ತು ${chosenDeity.name.kn} ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯ ಕರುಣಿಸಲಿ.`,
    en: `Chief Priest ${priestName} from Sri Gokarna Kshetra blesses ${devoteeName}: Today, your transit Moon is in house ${chandraBalaHouse} with active ${runningDashaSummary}. ${isChandrashtama ? "Maintain mindful calm with Lord Shiva's prayers during Chandrashtama." : "May your noble endeavors prosper under auspicious planetary alignments."} May Sri Mahabaleshwara and ${chosenDeity.name.en} bless your home with health, peace, and abundance.`,
    hi: `श्री गोकर्ण महाबलेश्वर सन्निधि से मुख्य अर्चक ${priestName} का पावन आशीर्वाद: ${devoteeName} जी, आज आपके लिए ${chandraBalaHouse}वें भाव का गोचर चंद्र एवं ${runningDashaSummary} प्रभावी है। ${isChandrashtama ? "चंद्राष्टम के कारण शांत मन से शिव स्मरण करें।" : "नवग्रहों की पावन कृपा से आपके सभी कार्य सफल हों।"} श्री महाबलेश्वर एवं ${chosenDeity.name.hi} आपके परिवार को आरोग्यता और समृद्धि प्रदान करें।`,
    te: `శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి నుండి ప్రధాన అర్చకులు ${priestName} గారి దివ్య ఆశీస్సులు: ${devoteeName} గారూ, నేడు మీకు ${chandraBalaHouse}వ భావ గోచార చంద్రుడు మరియు ${runningDashaSummary} నడుస్తున్నది. ${isChandrashtama ? "చంద్రాష్టమం కారణంగా ప్రశాంతంగా శివస్మరణ చేయండి." : "నవగ్రహాల శుభ అనుగ్రహంతో మీ సత్కార్యాలు విజయవంతమగుగాక."} శ్రీ మహాబలేశ్వరుడు మరియు ${chosenDeity.name.te} మీకు ఆయురారోగ్య ఐశ్వర్యములు ప్రసాదించుగాక.`,
    ta: `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதியிலிருந்து முதன்மை அர்ச்சகர் ${priestName} அவர்களின் ஆசி: ${devoteeName} அவர்களே, இன்று உங்கள் ராசிக்கு ${chandraBalaHouse}ஆம் இடத்து சந்திரனும் ${runningDashaSummary}வும் நடப்பில் உள்ளது. ${isChandrashtama ? "சந்திராஷ்டம தினத்தில் அமைதியுடன் சிவதியானம் செய்யவும்." : "நவகிரக சுப அருளால் அனைத்து நல்ல முயற்சிகளும் வெற்றியடையட்டும்."} மகாபலேஸ்வரர் மற்றும் ${chosenDeity.name.ta} உங்கள் குடும்பத்திற்கு சகல சௌபாக்கியங்களையும் அருளட்டும்.`
  };

  // 6. Dynamic Astrological Karma Navigator (Do's, Don'ts & Micro-Parihara)
  const dos: Record<SevaLang, string[]> = isChandrashtama ? {
    kn: ["ದೇವಸ್ಥಾನ ದರ್ಶನ, ಶಿವ ಜಪ ಹಾಗೂ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ", "ಕುಟುಂಬದಲ್ಲಿ ಹಿರಿಯರ ಮಾತಿಗೆ ಗೌರವ ನೀಡುವುದು", "ಶಾಂತಿಯುತ ಅಧ್ಯಯನ ಮತ್ತು ಧ್ಯಾನಾಭ್ಯಾಸ"],
    en: ["Temple darshana, Shiva japa, and satvik diet", "Respecting elders and maintaining serene communication", "Peaceful study, meditation, and introspection"],
    hi: ["मंदिर दर्शन, शिव जप एवं सात्विक भोजन", "पारिवारिक मामलों में बड़ों का आदर एवं शांति बनाए रखना", "ध्यान, प्राणायाम एवं आत्म-चिंतन"],
    te: ["దేవాలయ దర్శనం, శివ జపం మరియు సాత్విక ఆహారం", "కుటుంబంలో పెద్దల సలహాలను గౌరవించడం", "ధ్యానం మరియు ప్రశాంత ఆలోచనలు"],
    ta: ["கோவில் தரிசனம், சிவ ஜபம் மற்றும் சாத்வீக உணவு", "பெரியவர்களின் ஆசியைப் பெறுதல்", "தியானம் மற்றும் மன அமைதி காத்தல்"]
  } : {
    kn: ["ನೂತನ ಯೋಜನೆಗಳ ಪ್ರಾರಂಭ ಹಾಗೂ ಶುಭ ಮಾತುಕತೆ", "ದಾನ-ಧರ್ಮ ಹಾಗೂ ಅಗತ್ಯವಿರುವವರಿಗೆ ಪ್ರೀತಿಯ ನೆರವು", "ಧನ ಹೂಡಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣಾ ಚಿಂತನೆ"],
    en: ["Initiating planned goals and auspicious dialogues", "Acts of charity, helping those in genuine need", "Financial planning, savings, and fruitful enterprise"],
    hi: ["नए कार्यों का शुभारंभ एवं महत्वपूर्ण बातचीत", "दान-पुण्य एवं जरूरतमंदों की सहायता", "धन निवेश एवं व्यावसायिक प्रगति की योजना"],
    te: ["నూతన కార్యాల ప్రారంభం మరియు శుభ చర్చలు", "దానధర్మాలు మరియు అవసరమైన వారికి సహాయం", "ఆర్థిక ప్రణాళికలు మరియు వ్యాపార విస్తరణ"],
    ta: ["புதிய முயற்சிகள் தொடங்குதல் மற்றும் சுப பேச்சுவார்த்தை", "தான தர்மங்கள் மற்றும் உதவிகள் புரிதல்", "தன முதலீடு மற்றும் தொழில் முன்னேற்றம்"]
  };

  const donts: Record<SevaLang, string[]> = isChandrashtama ? {
    kn: ["ಯಾರೊಂದಿಗೂ ಆತುರದ ವಾದ-ವಿವಾದ ಹಾಗೂ ಕೋಪದ ನಿರ್ಧಾರಗಳು", "ಅತಿಯಾದ ಪ್ರಯಾಣ ಹಾಗೂ ಅತಿಯಾದ ವೇಗದ ವಾಹನ ಚಾಲನೆ", "ನೂತನ ದೊಡ್ಡ ಹೂಡಿಕೆ ಹಾಗೂ ಸಾಲದ ಒಪ್ಪಂದಗಳು"],
    en: ["Hasty arguments, emotional confrontation, or anger", "Excessive long travel or aggressive vehicle driving", "Major risky investments or signing large debt agreements"],
    hi: ["क्रोध में निर्णय लेना या किसी से व्यर्थ वाद-विवाद", "अनावश्यक लंबी यात्रा या तीव्र गति से वाहन चलाना", "बड़ा जोखिम भरा आर्थिक निवेश या नया कर्ज लेना"],
    te: ["ఆవేశపూరిత వాదనలు మరియు కోపంతో కూడిన నిర్ణయాలు", "అతి వేగంగా వాహనాలు నడపడం మరియు అలసట కలిగించే ప్రయాణాలు", "పెద్ద ఎత్తున రిస్క్ కూడిన పెట్టుబడులు"],
    ta: ["கோபத்தில் முடிவெடுத்தல் மற்றும் வாக்குவாதங்கள்", "அதிக வேகம் மற்றும் தேவையற்ற நீண்ட பயணம்", "அதிக ஆபத்துள்ள பண முதலீடுகள்"]
  } : {
    kn: ["ಋಣಾತ್ಮಕ ಚಿಂತನೆಗಳಲ್ಲಿ ಸಮಯ ವ್ಯರ್ಥ ಮಾಡುವುದು", "ಆಲಸ್ಯ ಹಾಗೂ ಕೆಲಸಗಳನ್ನು ಮುಂದೂಡುವ ಪ್ರವೃತ್ತಿ", "ಅನ್ಯರ ದೋಷಗಳನ್ನು ಎಣಿಸಿ ಮನಸ್ಸನ್ನು ಕೆಡಿಸಿಕೊಳ್ಳುವುದು"],
    en: ["Dwelling in negative self-doubt or cynicism", "Procrastination and delaying crucial commitments", "Finding faults in others and creating friction"],
    hi: ["नकारात्मक विचारों में समय व्यर्थ करना", "आलस्य एवं कार्यों को टालने की प्रवृत्ति", "दूसरों के दोष देखकर मन अशांत करना"],
    te: ["నిరాశావాద ఆలోచనలతో కాలం వృథా చేయడం", "బద్ధకం మరియు ముఖ్యమైన పనులను వాయిదా వేయడం", "ఇతరులలో లోపాలు వెతకడం"],
    ta: ["எதிர்மறை எண்ணங்களில் நேரத்தை வீணடித்தல்", "சோம்பல் மற்றும் கடமைகளை தள்ளிப்போடுதல்", "மற்றவர்கள் மீது குறை கூறுதல்"]
  };

  const microPariharaTitle: Record<SevaLang, string> = {
    kn: "೧ ನಿಮಿಷದ ಪುಣ್ಯ ಪರಿಹಾರ (Daily Micro-Parihara)",
    en: "1-Minute Daily Micro-Parihara",
    hi: "१ मिनट का पावन सूक्ष्म परिहार",
    te: "1 నిమిషం పుణ్య పరిహారం",
    ta: "1 நிமிட புண்ணிய பரிகாரம்"
  };

  const microPariharaDesc: Record<SevaLang, string> = isChandrashtama ? {
    kn: "ಶಿವಲಿಂಗಕ್ಕೆ ಅಥವಾ ಮನೆಯ ದೇವರ ಮುಂದೆ ಶುದ್ಧ ಜಲವನ್ನು ಅರ್ಪಿಸಿ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಎಂದು ೧೧ ಬಾರಿ ಜಪಿಸಿ.",
    en: "Offer pure water at the altar and chant 'Om Namah Shivaya' 11 times for serene mental harmony.",
    hi: "शिवलिंग अथवा पूजा स्थान में शुद्ध जल अर्पित कर 'ॐ नमः शिवाय' का ११ बार जप करें।",
    te: "శివలింగానికి లేదా పూజా మందిరంలో స్వచ్ఛమైన జలం సమర్పించి 'ఓం నమః శివాయ' 11 సార్లు జపించండి.",
    ta: "சிவபெருமானுக்கு அல்லது வீட்டில் தூய நீர் சமர்ப்பித்து 'ஓம் நம சிவாய' 11 முறை ஜபிக்கவும்."
  } : {
    kn: "ಮನೆಯ ಮುಂದಿನ ಪಕ್ಷಿಗಳಿಗೆ ಕಾಳು/ನೀರು ನೀಡಿ ಅಥವಾ ತುಳಸಿ ಗಿಡಕ್ಕೆ ನಮಸ್ಕರಿಸಿ.",
    en: "Feed birds/street animals with pure grains or water, or offer prayers to the sacred Tulasi.",
    hi: "पक्षियों को दाना-पानी दें अथवा पवित्र तुलसी जी को प्रणाम कर जल अर्पित करें।",
    te: "పక్షులకు ఆహారం/నీరు అందించండి లేదా పవిత్ర తులసి మొక్కకు నమస్కరించండి.",
    ta: "பறவைகளுக்கு தானியம்/தண்ணீர் வைக்கவும் அல்லது புனித துளசியை வழிபடவும்."
  };

  // 7. Power Metrics & Lucky Alignments
  const planetKey = runningAntardashaLord || runningMahadashaLord || "Jupiter";
  const palette = PLANET_POWER_PALETTES[planetKey] || PLANET_POWER_PALETTES.Jupiter;

  const dObj = new Date(targetDate);
  const luckyDigit = (((dObj.getDate() + natalMoonRashi + natalNakshatra + chandraBalaHouse) % 9) + 1);

  // Golden Hour Calculation (Aligned with Abhijit Muhurtha / Tara Bala)
  const baseStart = 10 * 60 + 48; // 10:48 AM
  const offsetMinutes = (taraBalaNumber * 7) % 60;
  const startMinutes = baseStart + (taraBalaNumber % 2 === 0 ? offsetMinutes : -offsetMinutes);
  const endMinutes = startMinutes + 48; // 48-minute Muhurtha window

  const startH = Math.floor(startMinutes / 60);
  const startM = startMinutes % 60;
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;

  const formatTime = (h: number, m: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const startTimeStr = formatTime(startH, startM);
  const endTimeStr = formatTime(endH, endM);

  return {
    targetDate,
    devoteeName,
    panchanga: livePanchanga,
    deity: {
      ...chosenDeity,
      selectionReason
    },
    priestBenediction,
    karmaNavigator: {
      dos,
      donts,
      microPariharaTitle,
      microPariharaDesc
    },
    powerMetrics: {
      luckyColor: {
        name: {
          kn: palette.colorKn,
          en: palette.colorEn,
          hi: palette.colorHi,
          te: palette.colorTe,
          ta: palette.colorTa
        },
        hex: palette.hex,
        borderClass: palette.borderClass
      },
      luckyDigit,
      luckyDirection: {
        name: {
          kn: palette.dirKn,
          en: palette.dirEn,
          hi: palette.dirHi,
          te: palette.dirTe,
          ta: palette.dirTa
        },
        degrees: palette.degrees
      },
      goldenHour: {
        startMinutes,
        endMinutes,
        startTimeStr,
        endTimeStr,
        windowLabel: {
          kn: `${startTimeStr} ರಿಂದ ${endTimeStr}`,
          en: `${startTimeStr} - ${endTimeStr}`,
          hi: `${startTimeStr} से ${endTimeStr}`,
          te: `${startTimeStr} నుండి ${endTimeStr}`,
          ta: `${startTimeStr} முதல் ${endTimeStr}`
        }
      }
    },
    astrologyMeta: {
      runningDashaSummary,
      chandraBalaHouse,
      taraBalaNumber,
      isChandrashtama,
      energyScore: isChandrashtama ? 44 : Math.min(96, 68 + taraBalaNumber * 3)
    }
  };
}
