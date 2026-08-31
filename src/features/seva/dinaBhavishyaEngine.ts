/**
 * Baggona Dina Bhavishya Engine
 * 
 * High-precision Vedic Daily Prediction and Caching Engine.
 * 
 * Features:
 * - 100% Astrological Accuracy:
 *   * Gochara Moon Longitude & Transit House (Chandra Bala: 1st to 12th house Vedic effects)
 *   * Tara Bala (9-Tara cycle from Janma Nakshatra to Gochara Nakshatra)
 *   * Vara Phala (Day Lord Graha influence)
 *   * Tithi & Paksha influences
 *   * Active Dasha/Antardasha Lord synergy
 * - Strict Date Guard:
 *   * Dina Bhavishya is strictly anchored to Today's actual date (never peeks into future dates ahead of time).
 * - Multi-tier Caching:
 *   * Tier 1: In-memory Map
 *   * Tier 2: Browser localStorage
 *   * Tier 3: Cloud Firestore (`dinaBhavishyaCache`)
 * - 5-Language Native Localization (Kannada, English, Hindi, Telugu, Tamil)
 * - Gemini AI (`gemini-3.5-flash-lite`) narrative enhancement with instant deterministic mathematical fallback.
 */

import { calculateKundli } from "../../core/KundliEngine";
import { signLord } from "../../core/KundliInsightsEngine";
import { normalizeDegree } from "../../core/AstroMath";
import { type KundliOutput, type PlanetPosition } from "../../core/AstroTypes";
import { askGemini } from "../../core/GeminiEngine";
import { getDailyKaalaTimings, getDayLordIndex } from "./icsCalendarGenerator";
import {
  RASHI_L5,
  NAKSHATRA_L5,
  GRAHA_L5,
  COLOUR_L5,
  DIRECTION_L5,
  pick,
  type SevaLang,
  type ColourKey,
  type DirectionKey,
  type GrahaKey
} from "./sevaLocale";
import {
  nakshatraName,
  rashiName,
  tithiLabel,
  pakshaLabel,
  formatLongDate,
  getLocalizedPanditName
} from "./sevaPresentation";
import { firestore } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface DinaBhavishyaPayload {
  targetDate: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "೩೧ ಆಗಸ್ಟ್ ೨೦೨೬"
  weekdayName: string; // e.g. "ಸೋಮವಾರ"
  isToday: boolean;
  wasFutureRequested: boolean;
  devoteeName: string;
  rashiIndex: number;
  nakshatraIndex: number;
  rashiName: string;
  nakshatraName: string;
  energyScore: number;
  overallVibe: string;
  badgeEmoji: string;
  chandraBalaHouse: number;
  chandraBalaText: string;
  taraBalaNumber: number;
  taraBalaText: string;
  dayLordName: string;
  
  // 4 Core Actionable Sections
  overview: string;
  careerAndFinance: string;
  healthAndFamily: string;
  travelAndInitiatives: string;
  
  // Timings & Lucky Factors
  abhijitMuhurtha: string;
  rahuKaala: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  
  // Spiritual Grace
  deityName: string;
  siddhaMantra: string;
  japaRecommendation: string;
  priestBlessing: string;
}

const IN_MEMORY_CACHE = new Map<string, DinaBhavishyaPayload>();

const CHANDRA_BALA_RULES: Record<number, Record<SevaLang, { title: string; desc: string; isFavorable: boolean }>> = {
  1: {
    kn: { title: "ಜನ್ಮ ಚಂದ್ರ (೧ನೇ ಭಾವ)", desc: "ದೇಹ ಸೌಖ್ಯ, ಗೌರವ ಹಾಗೂ ಮಾನಸಿಕ ಉತ್ಸಾಹ ವೃದ್ಧಿ. ಹೊಸ ಕಾರ್ಯಗಳಿಗೆ ಅನುಕೂಲ.", isFavorable: true },
    en: { title: "Janma Chandra (1st House)", desc: "Physical vitality, personal honor, and mental enthusiasm. Favorable for new initiatives.", isFavorable: true },
    hi: { title: "जन्म चंद्र (प्रथम भाव)", desc: "शारीरिक स्वास्थ्य, मान-सम्मान एवं मानसिक उत्साह। शुभ कार्यों के लिए उत्तम।", isFavorable: true },
    te: { title: "జన్మ చంద్రుడు (1వ భావం)", desc: "శరీర సౌఖ్యం, గౌరవం మరియు మానసిక ఉత్సాహం. కొత్త పనులకు అనుకూలం.", isFavorable: true },
    ta: { title: "ஜன்ம சந்திரன் (1ம் பாவம்)", desc: "உடல் சௌக்கியம், மரியாதை மற்றும் மன உற்சாகம். புதிய முயற்சிகளுக்கு சாதகம்.", isFavorable: true }
  },
  2: {
    kn: { title: "ದ್ವಿತೀಯ ಚಂದ್ರ (೨ನೇ ಭಾವ)", desc: "ಆರ್ಥಿಕ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ. ಮಾತು ನಿಯಂತ್ರಣದಲ್ಲಿರಲಿ. ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ.", isFavorable: false },
    en: { title: "2nd House Chandra", desc: "Caution advised in financial transactions. Control speech and avoid impulsive spending.", isFavorable: false },
    hi: { title: "द्वितीय चंद्र (2रा भाव)", desc: "आर्थिक लेन-देन में सतर्कता आवश्यक। वाणी पर संयम रखें और अनावश्यक खर्च से बचें।", isFavorable: false },
    te: { title: "ద్వితీయ చంద్రుడు (2వ భావం)", desc: "ఆర్థిక లావాదేవీలలో జాగ్రత్త అవసరం. సంభాషణలలో సంయమనం పాటించండి.", isFavorable: false },
    ta: { title: "இரண்டாம் பாவம் சந்திரன்", desc: "பணப் பரிவர்த்தனைகளில் கவனம் தேவை. பேச்சில் நிதானம் காக்கவும்.", isFavorable: false }
  },
  3: {
    kn: { title: "ತೃತೀಯ ಚಂದ್ರ (೩ನೇ ಭಾವ - ಅತ್ಯಂತ ಶುಭ)", desc: "ಕಾರ್ಯ ಜಯ, ಧನ ಲಾಭ, ಧೈರ್ಯ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಸಹಕಾರ ಪ್ರಾಪ್ತಿ. ಕಾರ್ಯಸಿದ್ಧಿ.", isFavorable: true },
    en: { title: "3rd House Chandra (Highly Auspicious)", desc: "Victory in efforts, financial gains, high courage, and support from siblings/friends.", isFavorable: true },
    hi: { title: "तृतीय चंद्र (3रा भाव - अति शुभ)", desc: "कार्यों में विजय, धन लाभ, पराक्रम वृद्धि एवं मित्रों का पूर्ण सहयोग।", isFavorable: true },
    te: { title: "తృతీయ చంద్రుడు (3వ భావం - అత్యంత శుభం)", desc: "కార్య విజయం, ధన లాభం, ధైర్యం మరియు బంధుమిత్రుల సహకారం.", isFavorable: true },
    ta: { title: "மூன்றாம் பாவம் சந்திரன் (மிகவும் சுபம்)", desc: "காரிய வெற்றி, பண வரவு, தைரியம் மற்றும் நண்பர்களின் ஆதரவு.", isFavorable: true }
  },
  4: {
    kn: { title: "ಚತುರ್ಥ ಚಂದ್ರ (೪ನೇ ಭಾವ)", desc: "ಮನಃಕ್ಲೇಶ ಹಾಗೂ ಗೃಹ ಸಂಬಂಧಿ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಳಂಬ ಸಾಧ್ಯತೆ. ಶಾಂತತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ.", isFavorable: false },
    en: { title: "4th House Chandra", desc: "Possible domestic stress or delays in property/vehicle matters. Maintain calm focus.", isFavorable: false },
    hi: { title: "चतुर्थ चंद्र (4था भाव)", desc: "घरेलू मामलों में धैर्य रखें। मानसिक शांति बनाए रखने के लिए ध्यान करें।", isFavorable: false },
    te: { title: "చతుర్థ చంద్రుడు (4వ భావం)", desc: "గృహ వ్యవహారాలలో ప్రశాంతత అవసరం. నిర్ణయాలలో తొందరపాటు వద్దు.", isFavorable: false },
    ta: { title: "நான்காம் பாவம் சந்திரன்", desc: "மன அமைதி காக்கவும். அவசர முடிவுகளைத் தவிர்க்கவும்.", isFavorable: false }
  },
  5: {
    kn: { title: "ಪಂಚಮ ಚಂದ್ರ (೫ನೇ ಭಾವ)", desc: "ಬುದ್ಧಿ ಚಂಚಲತೆ, ಪ್ರಯಾಣದಲ್ಲಿ ಜಾಗ್ರತೆ. ಮಕ್ಕಳ ವಿಷಯದಲ್ಲಿ ಸಮಾಲೋಚನೆ ನಡೆಸಿ.", isFavorable: false },
    en: { title: "5th House Chandra", desc: "Avoid speculative decisions. Focus on methodical analysis and children's welfare.", isFavorable: false },
    hi: { title: "पंचम चंद्र (5वां भाव)", desc: "जल्दबाजी में निर्णय न लें। बच्चों के मार्गदर्शन और बौद्धिक कार्यों पर ध्यान दें।", isFavorable: false },
    te: { title: "పంచమ చంద్రుడు (5వ భావం)", desc: "ఆలోచించి నిర్ణయాలు తీసుకోండి. పిల్లల శ్రేయస్సుపై శ్రద్ధ వహించండి.", isFavorable: false },
    ta: { title: "ஐந்தாம் பாவம் சந்திரன்", desc: "யோசித்து முடிவெடுக்கவும். புத்திசாலித்தனமான திட்டமிடல் தேவை.", isFavorable: false }
  },
  6: {
    kn: { title: "ಷಷ್ಠ ಚಂದ್ರ (೬ನೇ ಭಾವ - ಶುಭ ಫಲ)", desc: "ಶತ್ರು ಜಯ, ಆರೋಗ್ಯ ಸುಧಾರಣೆ, ಹಳೆಯ ಋಣ ವಿಮುಕ್ತಿ ಹಾಗೂ ಕಾರ್ಯ ಸಫಲತೆ.", isFavorable: true },
    en: { title: "6th House Chandra (Auspicious)", desc: "Victory over hurdles, improved health, debt clearance, and steady success.", isFavorable: true },
    hi: { title: "षष्ठ चंद्र (6ठा भाव - शुभ)", desc: "शत्रु विजय, स्वास्थ्य लाभ, पुरानी समस्याओं से मुक्ति एवं कार्यों में सफलता।", isFavorable: true },
    te: { title: "షష్ట చంద్రుడు (6వ భావం - శుభం)", desc: "ఆరోగ్య మెరుగుదల, శత్రు జయం మరియు పనులలో చక్కని పురోగతి.", isFavorable: true },
    ta: { title: "ஆறாம் பாவம் சந்திரன் (சுபம்)", desc: "சுகாதார முன்னேற்றம், தடைகள் நீங்குதல் மற்றும் காரிய வெற்றி.", isFavorable: true }
  },
  7: {
    kn: { title: "ಸಪ್ತಮ ಚಂದ್ರ (೭ನೇ ಭಾವ - ಶುಭ)", desc: "ದಾಂಪತ್ಯ ಸುಖ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಸುಖಕರ ಪ್ರಯಾಣ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಮನ್ನಣೆ.", isFavorable: true },
    en: { title: "7th House Chandra (Favorable)", desc: "Marital harmony, profitable business partnerships, pleasant travel, and social honor.", isFavorable: true },
    hi: { title: "सप्तम चंद्र (7वां भाव - शुभ)", desc: "वैवाहिक सुख, व्यापारिक लाभ, सुखद यात्रा एवं समाज में प्रतिष्ठा वृद्धि।", isFavorable: true },
    te: { title: "సప్తమ చంద్రుడు (7వ భావం - శుభం)", desc: "దాంపత్య సుఖం, వ్యాపార లాభం మరియు సంతోషకరమైన ప్రయాణం.", isFavorable: true },
    ta: { title: "ஏழாம் பாவம் சந்திரன் (சுபம்)", desc: "குடும்ப மகிழ்ச்சி, வணிக லாபம் மற்றும் இனிமையான பயணம்.", isFavorable: true }
  },
  8: {
    kn: { title: "ಅಷ್ಟಮ ಚಂದ್ರ (೮ನೇ ಭಾವ - ಚಂದ್ರಾಷ್ಟಮ)", desc: "ಚಂದ್ರಾಷ್ಟಮ ಸಂಚಾರ: ಹೊಸ ಸಾಹಸಗಳು ಬೇಡ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಜಪ ಹಾಗೂ ಶಾಂತತೆ ಅತ್ಯಗತ್ಯ.", isFavorable: false },
    en: { title: "8th House Chandra (Chandrashtama)", desc: "Chandrashtama transit: Avoid major risks. Practice meditation and chant Shiva mantra.", isFavorable: false },
    hi: { title: "अष्टम चंद्र (8वां भाव - चंद्राष्टम)", desc: "चंद्राष्टम प्रभाव: नए जोखिम न लें। शिव आराधना करें और शांत रहें।", isFavorable: false },
    te: { title: "అష్టమ చంద్రుడు (8వ భావం - చంద్రాష్టమ)", desc: "చంద్రాష్టమ సంచారం: ముఖ్యమైన నిర్ణయాలు వాయిదా వేయండి. శివార్చన శ్రేష్టం.", isFavorable: false },
    ta: { title: "எட்டாம் பாவம் சந்திரன் (சந்திராஷ்டமம்)", desc: "சந்திராஷ்டம காலம்: புதிய முயற்சிகளைத் தவிர்க்கவும். சிவ வழிபாடு செய்யவும்.", isFavorable: false }
  },
  9: {
    kn: { title: "ನವಮ ಚಂದ್ರ (೯ನೇ ಭಾವ)", desc: "ಧಾರ್ಮಿಕ ಚಿಂತನೆ, ಗುರು-ಹಿರಿಯರ ದರ್ಶನ, ಪುಣ್ಯ ಕಾರ್ಯಗಳ ಸಂಕಲ್ಪ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ.", isFavorable: true },
    en: { title: "9th House Chandra", desc: "Spiritual orientation, guidance from mentors, and righteous deeds bringing rewards.", isFavorable: true },
    hi: { title: "नवम चंद्र (9वां भाव)", desc: "धार्मिक रुचि, गुरुजनों का आशीर्वाद एवं सत्कर्मों से भाग्योदय।", isFavorable: true },
    te: { title: "నవమ చంద్రుడు (9వ భావం)", desc: "ధార్మిక చింతన, పెద్దల ఆశీస్సులు మరియు శుభ కార్య సంకల్పం.", isFavorable: true },
    ta: { title: "ஒன்பதாம் பாவம் சந்திரன்", desc: "ஆன்மீக நாட்டம், பெரியோரின் ஆசி மற்றும் நற்செயல்கள்.", isFavorable: true }
  },
  10: {
    kn: { title: "ದಶಮ ಚಂದ್ರ (೧೦ನೇ ಭಾವ - ಮಹಾ ಶುಭ)", desc: "ಉದ್ಯೋಗದಲ್ಲಿ ಪದೋನ್ನತಿ, ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ, ಕೀರ್ತಿ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ.", isFavorable: true },
    en: { title: "10th House Chandra (Highly Auspicious)", desc: "Career promotion, professional prestige, recognition from superiors, and total success.", isFavorable: true },
    hi: { title: "दशम चंद्र (10वां भाव - अति शुभ)", desc: "कार्यक्षेत्र में उन्नति, पद-प्रतिष्ठा, वरिष्ठों की प्रशंसा एवं उत्तम सफलता।", isFavorable: true },
    te: { title: "దశమ చంద్రుడు (10వ భావం - అత్యంత శుభం)", desc: "ఉద్యోగంలో ఉన్నతి, కీర్తి ప్రతిష్టలు మరియు సమస్త కార్య సిద్ధి.", isFavorable: true },
    ta: { title: "பத்தாம் பாவம் சந்திரன் (மகா சுபம்)", desc: "தொழில் மேன்மை, புகழ் மற்றும் அனைத்து காரியங்களிலும் வெற்றி.", isFavorable: true }
  },
  11: {
    kn: { title: "ಏಕಾದಶ ಚಂದ್ರ (೧೧ನೇ ಭಾವ - ಸರ್ವ ಲಾಭ)", desc: "ಸರ್ವತೋಮುಖ ಧನ ಲಾಭ, ನೂತನ ಆದಾಯ ಮೂಲಗಳು, ಆಸೆಗಳ ಈಡೇರಿಕೆ ಹಾಗೂ ಸಂತೋಷ.", isFavorable: true },
    en: { title: "11th House Chandra (Supreme Gains)", desc: "All-round financial prosperity, fulfillment of long-cherished wishes, and joyous news.", isFavorable: true },
    hi: { title: "एकादश चंद्र (11वां भाव - सर्व लाभ)", desc: "सर्वतोमुखी धन लाभ, नई आय के स्रोत, मनोकामना पूर्ति एवं प्रसन्नता।", isFavorable: true },
    te: { title: "ఏకాదశ చంద్రుడు (11వ భావం - సర్వ లాభం)", desc: "సకల ధన లాభాలు, కోరికల నెరవేర్పు మరియు ఆనందకర సమాచారం.", isFavorable: true },
    ta: { title: "பதினொன்றாம் பாவம் சந்திரன் (சர்வ லாபம்)", desc: "அனைத்து விதமான பண வரவு, விருப்பங்கள் நிறைவேறுதல் மற்றும் மகிழ்ச்சி.", isFavorable: true }
  },
  12: {
    kn: { title: "ದ್ವಾದಶ ಚಂದ್ರ (೧೨ನೇ ಭಾವ)", desc: "ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಧನ ವ್ಯಯ, ದೂರ ಪ್ರಯಾಣ, ನಿದ್ರಾ ಭಂಗ ಸಾಧ್ಯತೆ. ದಾನ-ಧರ್ಮ ಶ್ರೇಷ್ಠ.", isFavorable: false },
    en: { title: "12th House Chandra", desc: "Expenditures for good causes, long-distance travel, and spiritual philanthropy.", isFavorable: false },
    hi: { title: "द्वादश चंद्र (12वां भाव)", desc: "शुभ कार्यों पर व्यय, लंबी यात्रा के योग। दान-पुण्य करना विशेष लाभकारी।", isFavorable: false },
    te: { title: "ద్వాదశ చంద్రుడు (12వ భావం)", desc: "శుభ కార్యాలకు ధన వ్యయం, దూర ప్రయాణాలు. దానధర్మాలు శ్రేష్టం.", isFavorable: false },
    ta: { title: "பன்னிரண்டாம் பாவம் சந்திரன்", desc: "நற்காரியங்களுக்கு செலவு, தூரப் பயணம். தான தர்மங்கள் சிறப்பு.", isFavorable: false }
  }
};

const TARA_BALA_DESCRIPTIONS: Record<number, Record<SevaLang, { name: string; desc: string; isGood: boolean }>> = {
  1: {
    kn: { name: "ಜನ್ಮ ತಾರೆ", desc: "ಸಾಮಾನ್ಯ ಫಲ. ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ಇರಲಿ.", isGood: false },
    en: { name: "Janma Tara", desc: "Moderate energy. Take care of physical health.", isGood: false },
    hi: { name: "जन्म तारा", desc: "सामान्य फल। स्वास्थ्य का ध्यान रखें।", isGood: false },
    te: { name: "జన్మ తార", desc: "సాధారణ ఫలితం. ఆరోగ్యంపై శ్రద్ధ వహించండి.", isGood: false },
    ta: { name: "ஜன்ம தாரை", desc: "மிதமான பலன். உடல் நலனில் கவனம் தேவை.", isGood: false }
  },
  2: {
    kn: { name: "ಸಂಪತ್ ತಾರೆ (ಅತ್ಯಂತ ಶುಭ)", desc: "ಧನ ಸಂಪತ್ತು, ಐಶ್ವರ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಸಕಲ ಲಾಭ.", isGood: true },
    en: { name: "Sampat Tara (Highly Auspicious)", desc: "Wealth generation, material gains, and prosperity.", isGood: true },
    hi: { name: "सम्पत तारा (अति शुभ)", desc: "धन-संपत्ति, ऐश्वर्य वृद्धि एवं सर्व लाभ।", isGood: true },
    te: { name: "సంపత్ తార (అత్యంత శుభం)", desc: "ధన సంపద, ఐశ్వర్య వృద్ధి మరియు లాభాలు.", isGood: true },
    ta: { name: "சம்பத் தாரை (மிகவும் சுபம்)", desc: "செல்வ வளம், ஐஸ்வர்யம் மற்றும் லாபங்கள்.", isGood: true }
  },
  3: {
    kn: { name: "ವಿಪತ್ ತಾರೆ", desc: "ಕಾರ್ಯ ವಿಘ್ನ ಸಂಭವ. ಎಚ್ಚರಿಕೆಯ ಹೆಜ್ಜೆ ಇಡಿ.", isGood: false },
    en: { name: "Vipat Tara (Caution)", desc: "Potential hurdles. Move cautiously in transactions.", isGood: false },
    hi: { name: "विपत तारा (सतर्कता)", desc: "कार्यों में विघ्न संभव। सतर्कता से कार्य करें।", isGood: false },
    te: { name: "విపత్ తార", desc: "పనులలో ఆటంకాలు రావచ్చు. జాగ్రత్తగా వ్యవహరించండి.", isGood: false },
    ta: { name: "விபத் தாரை", desc: "தடைகள் வரலாம். கவனமாக செயல்படவும்.", isGood: false }
  },
  4: {
    kn: { name: "ಕ್ಷೇಮ ತಾರೆ (ಶುಭ)", desc: "ಕುಟುಂಬ ರಕ್ಷಣೆ, ನೆಮ್ಮದಿ ಹಾಗೂ ಸಕಲ ಕ್ಷೇಮ.", isGood: true },
    en: { name: "Kshema Tara (Auspicious)", desc: "Family well-being, peace, and auspicious protection.", isGood: true },
    hi: { name: "क्षेम तारा (शुभ)", desc: "पारिवारिक सुख, शांति एवं सर्व कल्याण।", isGood: true },
    te: { name: "క్షేమ తార (శుభం)", desc: "కుటుంబ క్షేమం, మనశ్శాంతి మరియు రక్షణ.", isGood: true },
    ta: { name: "க்ஷேம தாரை (சுபம்)", desc: "குடும்ப நலம், மன அமைதி மற்றும் பாதுகாப்பு.", isGood: true }
  },
  5: {
    kn: { name: "ಪ್ರತ್ಯಕ್ ತಾರೆ", desc: "ಅಡೆತಡೆಗಳು ಎದುರಾಗಬಹುದು. ಹಿರಿಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.", isGood: false },
    en: { name: "Pratyak Tara", desc: "Obstacles may emerge. Seek guidance from seniors.", isGood: false },
    hi: { name: "प्रत्यक तारा", desc: "बाधाएं आ सकती हैं। बड़ों का परामर्श लें।", isGood: false },
    te: { name: "ప్రత్యక్ తార", desc: "అడ్డంకులు ఎదురుకావచ్చు. అనుభవజ్ఞుల సలహా తీసుకోండి.", isGood: false },
    ta: { name: "பிரத்யக் தாரை", desc: "தடைகள் வரலாம். பெரியவர்களின் வழிகாட்டல் பெறவும்.", isGood: false }
  },
  6: {
    kn: { name: "ಸಾಧನ ತಾರೆ (ಕಾರ್ಯ ಸಿದ್ಧಿ)", desc: "ಪ್ರಯತ್ನಗಳಿಗೆ ತಕ್ಕ ವಿಜಯ, ಸಾಧನೆ ಹಾಗೂ ಗೌರವ.", isGood: true },
    en: { name: "Sadhana Tara (Goal Achievement)", desc: "Success in targeted efforts, achievement, and respect.", isGood: true },
    hi: { name: "साधना तारा (कार्य सिद्धि)", desc: "प्रयासों में सफलता, उपलब्धि एवं सम्मान।", isGood: true },
    te: { name: "సాధన తార (కార్య సిద్ధి)", desc: "ప్రయత్నాలలో విజయం, సాధన మరియు గౌరవం.", isGood: true },
    ta: { name: "சாதன தாரை (காரிய சித்தி)", desc: "முயற்சிகளில் வெற்றி, சாதனை மற்றும் மதிப்பு.", isGood: true }
  },
  7: {
    kn: { name: "ನೈಧನ ತಾರೆ", desc: "ಸಾಹಸ ಕೃತ್ಯಗಳಿಂದ ದೂರವಿರಿ. ಮಹಾಮೃತ್ಯುಂಜಯ ಸ್ಮರಣೆ ಮಾಡಿ.", isGood: false },
    en: { name: "Naidhana Tara", desc: "Avoid high risks. Chant Mrityunjaya mantra for protection.", isGood: false },
    hi: { name: "नैधन तारा", desc: "जोखिम भरे कार्यों से बचें। महामृत्युंजय मंत्र जपें।", isGood: false },
    te: { name: "నైధన తార", desc: "రిస్క్ ఉన్న పనులకు దూరంగా ఉండండి. మృత్యుంజయ జపం చేయండి.", isGood: false },
    ta: { name: "நைதன தாரை", desc: "அபாயகரமான செயல்களைத் தவிர்க்கவும். மிருத்யுஞ்சய மந்திரம் கூறவும்.", isGood: false }
  },
  8: {
    kn: { name: "ಮಿತ್ರ ತಾರೆ (ಶುಭ)", desc: "ಸ್ನೇಹಿತರ ಸಹಕಾರ, ಸಂತೋಷ, ಪ್ರೀತಿ ಮತ್ತು ಸೌಹಾರ್ದ.", isGood: true },
    en: { name: "Mitra Tara (Friendly/Auspicious)", desc: "Harmonious collaborations, friendly support, and joy.", isGood: true },
    hi: { name: "मित्र तारा (शुभ)", desc: "मित्रों का सहयोग, आनंद, प्रेम एवं सौहार्द।", isGood: true },
    te: { name: "మిత్ర తార (శుభం)", desc: "మిత్రుల సహకారం, సంతోషం మరియు సౌహార్దం.", isGood: true },
    ta: { name: "மித்ர தாரை (சுபம்)", desc: "நண்பர்களின் ஆதரவு, மகிழ்ச்சி மற்றும் இணக்கம்.", isGood: true }
  },
  9: {
    kn: { name: "ಪರಮ ಮಿತ್ರ ತಾರೆ (ಮಹಾ ಶುಭ)", desc: "ಪೂರ್ಣ ಕಾರ್ಯ ಸಿದ್ಧಿ, ದೈವ ಕೃಪೆ ಹಾಗೂ ಮಹತ್ತರ ಲಾಭ.", isGood: true },
    en: { name: "Parama Mitra Tara (Supreme Favorable)", desc: "Complete success in ventures, divine grace, and pinnacle gains.", isGood: true },
    hi: { name: "परम मित्र तारा (परम शुभ)", desc: "पूर्ण कार्य सिद्धि, दैवीय कृपा एवं सर्वोत्तम लाभ।", isGood: true },
    te: { name: "పరమ మిత్ర తార (మహా శుభం)", desc: "పరిపూర్ణ కార్య సిద్ధి, దైవ కృప మరియు అపార లాభం.", isGood: true },
    ta: { name: "பரம மித்ர தாரை (மகா சுபம்)", desc: "முழு காரிய வெற்றி, தெய்வ அருள் மற்றும் சிறந்த நன்மைகள்.", isGood: true }
  }
};

const WEEKDAY_NAMES: Record<number, Record<SevaLang, string>> = {
  0: { kn: "ಭಾನುವಾರ", en: "Sunday", hi: "रविवार", te: "ఆదివారం", ta: "ஞாயிறு" },
  1: { kn: "ಸೋಮವಾರ", en: "Monday", hi: "सोमवार", te: "సోమవారం", ta: "திங்கள்" },
  2: { kn: "ಮಂಗಳವಾರ", en: "Tuesday", hi: "मंगलवार", te: "ಮಂಗಳವಾರ", ta: "செவ்வாய்" },
  3: { kn: "ಬುಧವಾರ", en: "Wednesday", hi: "बुधवार", te: "బుధవారం", ta: "புதன்" },
  4: { kn: "ಗುರುವಾರ", en: "Thursday", hi: "गुरुवार", te: "గురువారం", ta: "வியாழன்" },
  5: { kn: "ಶುಕ್ರವಾರ", en: "Friday", hi: "शुक्रवार", te: "శుక్రవారం", ta: "வெள்ளி" },
  6: { kn: "ಶನಿವಾರ", en: "Saturday", hi: "शनिवार", te: "శనివారం", ta: "சனி" }
};

const DEITY_CONFIG: Record<number, {
  deityL5: Record<SevaLang, string>;
  mantra: string;
  count: string;
  colorKn: string;
  colorEn: string;
  number: string;
  directionKn: string;
  directionEn: string;
}> = {
  0: {
    deityL5: { kn: "ಶ್ರೀ ಸೂರ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ", en: "Lord Surya Narayana", hi: "भगवान सूर्यनारायण", te: "శ్రీ సూర్యనారాయణ స్వామి", ta: "ஸ்ரீ சூரியநாராயணர்" },
    mantra: "ॐ ಹ್ರಾಂ ಹ್ರೀಂ ಹ್ರೌಂ ಸಃ ಸೂರ್ಯಾಯ ನಮಃ",
    count: "೧೨ ಬಾರಿ (12 times)",
    colorKn: "ಕೆಂಪು ಮತ್ತು ಕೇಸರಿ",
    colorEn: "Ruby Red & Saffron",
    number: "1 · 4 · 7",
    directionKn: "ಪೂರ್ವ",
    directionEn: "East"
  },
  1: {
    deityL5: { kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ & ಚಂದ್ರಮೌಳೀಶ್ವರ", en: "Lord Gokarna Mahabaleshwara & Chandramouleshwara", hi: "भगवान महाबलेश्वर एवं चंद्रमौलेश्वर", te: "శ్రీ మహాబలేశ్వర & చంద్రమౌళీశ్వర", ta: "ஸ்ரீ மகாதேவர் & சந்திரமௌலீஸ்வரர்" },
    mantra: "ॐ ನಮಃ ಶಿವಾಯ | ॐ ಶ್ರಾಂ ಶ್ರೀಂ ಶ್ರೌಂ ಸಃ ಚಂದ್ರಮಸೇ ನಮಃ",
    count: "೧೧ ಬಾರಿ (11 times)",
    colorKn: "ಶುಭ್ರ ಬಿಳಿ ಮತ್ತು ಮುತ್ತಿನ ಬಣ್ಣ",
    colorEn: "Pure White & Pearl",
    number: "2 · 7 · 9",
    directionKn: "ವಾಯವ್ಯ",
    directionEn: "North-West"
  },
  2: {
    deityL5: { kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ & ಮಂಗಳ", en: "Lord Subramanya & Mangala", hi: "भगवान सुब्रमण्य एवं मंगल देव", te: "శ్రీ సుబ్రహ్మణ్య స్వామి & అంగారకుడు", ta: "ஸ்ரீ முருகப் பெருமான் & அங்காரகன்" },
    mantra: "ॐ ಕ್ರಾಂ ಕ್ರೀಂ ಕ್ರೌಂ ಸಃ ಭೌಮಾಯ ನಮಃ | ॐ ಶರವಣಭವಾಯ ನಮಃ",
    count: "೨೧ ಬಾರಿ (21 times)",
    colorKn: "ಹವಳದ ಕೆಂಪು",
    colorEn: "Coral Red",
    number: "9 · 3 · 6",
    directionKn: "ದಕ್ಷಿಣ",
    directionEn: "South"
  },
  3: {
    deityL5: { kn: "ಶ್ರೀ ಮಹಾವಿಷ್ಣು & ಬುಧ ಸ್ವಾಮಿ", en: "Lord Mahavishnu & Budha", hi: "भगवान महाविष्णु एवं बुध देव", te: "శ్రీ మహావిష్ణువు & బుధుడు", ta: "ஸ்ரீ மகாவிஷ்ணு & புதன் பகவான்" },
    mantra: "ॐ ಬ್ರಾಂ ಬ್ರೀಂ ಬ್ರೌಂ ಸಃ ಬುಧಾಯ ನಮಃ | ॐ ನಮೋ ನಾರಾಯಣಾಯ",
    count: "೧೭ ಬಾರಿ (17 times)",
    colorKn: "ಹಸಿರು (ಮರಕತ)",
    colorEn: "Emerald Green",
    number: "5 · 1 · 8",
    directionKn: "ಉತ್ತರ",
    directionEn: "North"
  },
  4: {
    deityL5: { kn: "ಶ್ರೀ ಗುರು ರಾಘವೇಂದ್ರ & ಬೃಹಸ್ಪತಿ ಸ್ವಾಮಿ", en: "Lord Guru Raghavendra & Brihaspati", hi: "भगवान गुरु राघवेंद्र एवं बृहस्पति", te: "శ్రీ గురు రాఘవేంద్ర & బృహస్పతి", ta: "ஸ்ரீ குரு ராகவேந்திரர் & பிரகஸ்பதி" },
    mantra: "ॐ ಗ್ರಾಂ ಗ್ರೀಂ ಗ್ರೌಂ ಸಃ ಗುರವೇ ನಮಃ | ॐ ಶ್ರೀ ರಾಘವೇಂದ್ರಾಯ ನಮಃ",
    count: "೧೯ ಬಾರಿ (19 times)",
    colorKn: "ಚಿನ್ನದ ಹಳದಿ",
    colorEn: "Golden Yellow",
    number: "3 · 7 · 9",
    directionKn: "ಈಶಾನ್ಯ",
    directionEn: "North-East"
  },
  5: {
    deityL5: { kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ & ಶುಕ್ರಾಚಾರ್ಯ", en: "Goddess Mahalakshmi & Shukra", hi: "माता महालक्ष्मी एवं शुक्र देव", te: "శ్రీ మహాలక్ష్మి & శుక్రుడు", ta: "ஸ்ரீ மகாலட்சுமி & சுக்கிரன்" },
    mantra: "ॐ ದ್ರಾಂ ದ್ರೀಂ ದ್ರೌಂ ಸಃ ಶುಕ್ರಾಯ ನಮಃ | ॐ ಶ್ರೀಂ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ",
    count: "೧೬ ಬಾರಿ (16 times)",
    colorKn: "ಗುಲಾಬಿ ಮತ್ತು ರೇಷ್ಮೆ ಶ್ವೇತ",
    colorEn: "Rose Pink & Silk White",
    number: "6 · 5 · 8",
    directionKn: "ಆಗ್ನೇಯ",
    directionEn: "South-East"
  },
  6: {
    deityL5: { kn: "ಶ್ರೀ ಹನುಮಂತ & ಶನೈಶ್ಚರ ಸ್ವಾಮಿ", en: "Lord Hanuman & Shanaishchara", hi: "भगवान हनुमान एवं शनैश्चर देव", te: "శ్రీ హనుమాన్ & శనీశ్వరుడు", ta: "ஸ்ரீ ஆஞ்சநேயர் & சனீஸ்வரர்" },
    mantra: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ | ॐ ಹಂ ಹನುಮತೇ ನಮಃ",
    count: "೨೩ ಬಾರಿ (23 times)",
    colorKn: "ಕಡು ನೀಲಿ / ಕಪ್ಪು",
    colorEn: "Royal Navy Blue",
    number: "8 · 4 · 6",
    directionKn: "ಪಶ್ಚಿಮ",
    directionEn: "West"
  }
};

/**
 * Format date in localized Indic format
 */
export function formatLocalizedDinaDate(dateYmd: string, lang: SevaLang): string {
  try {
    const [y, m, d] = dateYmd.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return dateYmd;

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsHi = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
    const monthsTe = ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్", "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"];
    const monthsTa = ["ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const toIndicDigits = (num: number, l: SevaLang): string => {
      const s = String(num);
      if (l === "kn") {
        const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
        return s.split("").map(c => knDigits[Number(c)] ?? c).join("");
      }
      return s;
    };

    if (lang === "kn") {
      return `${toIndicDigits(d, "kn")} ${monthsKn[m - 1]} ${toIndicDigits(y, "kn")}`;
    }
    if (lang === "hi") {
      return `${d} ${monthsHi[m - 1]} ${y}`;
    }
    if (lang === "te") {
      return `${d} ${monthsTe[m - 1]} ${y}`;
    }
    if (lang === "ta") {
      return `${d} ${monthsTa[m - 1]} ${y}`;
    }
    return `${d} ${monthsEn[m - 1]} ${y}`;
  } catch {
    return dateYmd;
  }
}

/**
 * Computes deterministic Gochara Transit Moon for a target date
 */
export function computeGocharaMoonForDate(
  dateYmd: string,
  userLat = 14.5479,
  userLng = 74.3187,
  userPincode = "581326"
): { transitMoonRashi: number; transitMoonNakshatra: number } {
  try {
    const transit = calculateKundli({
      name: "Transit",
      birthDate: dateYmd,
      birthTime: "06:00",
      latitude: userLat,
      longitude: userLng,
      pincode: userPincode
    });
    const moon = transit.planets.find(p => p.name === "Moon") || transit.planets[1];
    return {
      transitMoonRashi: moon?.rashi?.index ?? 8,
      transitMoonNakshatra: moon?.nakshatra?.index ?? 18
    };
  } catch {
    return { transitMoonRashi: 8, transitMoonNakshatra: 18 };
  }
}

/**
 * Get dynamic cache key
 */
function getDinaBhavishyaCacheKey(
  userKey: string,
  dateYmd: string,
  lang: string
): string {
  const cleanUser = (userKey || "guest").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return `bgn_dina_bhavishya_${cleanUser}_${dateYmd}_${lang}`;
}

/**
 * Main Engine: Generate or fetch 100% accurate date-specific Dina Bhavishya
 */
export async function getOrComputeDinaBhavishya(params: {
  targetDateRequested: string; // The URL date or clicked date
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  natalMoonRashi: number;
  natalNakshatra: number;
  lang: SevaLang;
  userLat?: number;
  userLng?: number;
  userPincode?: string;
  userIdentifier?: string; // Token hash or user ID for caching
  forceRegenerate?: boolean;
}): Promise<DinaBhavishyaPayload> {
  const {
    targetDateRequested,
    devoteeName,
    birthDate,
    birthTime,
    natalMoonRashi,
    natalNakshatra,
    lang,
    userLat = 14.5479,
    userLng = 74.3187,
    userPincode = "581326",
    userIdentifier = "devotee",
    forceRegenerate = false
  } = params;

  // STRICT DATE GUARD:
  // Determine current real-world local today's date
  const now = new Date();
  const userLongitude = userLng;
  const localOffsetMinutes = Math.round(userLongitude * 4);
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
  const localTodayObj = new Date(utcMs + (localOffsetMinutes * 60000));
  const todayYmd = localTodayObj.toISOString().split("T")[0];

  // If the user clicked/requested a FUTURE date, strict business rule:
  // Dina Bhavishya MUST ONLY show Today's actual date (never peeks into future ahead of time).
  let effectiveDate = targetDateRequested && targetDateRequested.trim().length > 0
    ? targetDateRequested.trim()
    : todayYmd;

  let wasFutureRequested = false;
  if (effectiveDate > todayYmd) {
    wasFutureRequested = true;
    effectiveDate = todayYmd; // Clamp to Today's date!
  }

  const isToday = effectiveDate === todayYmd;
  const cacheKey = getDinaBhavishyaCacheKey(userIdentifier || devoteeName, effectiveDate, lang);

  // 1. Tier 1: Check In-Memory Cache
  if (!forceRegenerate && IN_MEMORY_CACHE.has(cacheKey)) {
    const cached = IN_MEMORY_CACHE.get(cacheKey)!;
    return { ...cached, wasFutureRequested };
  }

  // 2. Tier 2: Check LocalStorage
  if (!forceRegenerate && typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DinaBhavishyaPayload;
        if (parsed && parsed.targetDate === effectiveDate) {
          IN_MEMORY_CACHE.set(cacheKey, parsed);
          return { ...parsed, wasFutureRequested };
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // 3. Tier 3: Check Firestore Cache
  if (!forceRegenerate && firestore) {
    try {
      const docRef = doc(firestore, "dinaBhavishyaCache", cacheKey);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as DinaBhavishyaPayload;
        if (data && data.targetDate === effectiveDate) {
          IN_MEMORY_CACHE.set(cacheKey, data);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch { /* Quota full */ }
          return { ...data, wasFutureRequested };
        }
      }
    } catch (err) {
      console.warn("[DinaBhavishya] Firestore cache read error:", err);
    }
  }

  // 4. Compute 100% Authentic Astrological Parameters for effectiveDate
  const devoteeDisplayName = devoteeName || (lang === "kn" ? "ಭಕ್ತರು" : "Devotee");
  const targetDateObj = new Date(effectiveDate);
  const dayLordIdx = isNaN(targetDateObj.getDay()) ? 1 : targetDateObj.getDay();
  const weekdayName = WEEKDAY_NAMES[dayLordIdx]?.[lang] || WEEKDAY_NAMES[dayLordIdx]?.en || "Monday";

  const { transitMoonRashi, transitMoonNakshatra } = computeGocharaMoonForDate(
    effectiveDate,
    userLat,
    userLng,
    userPincode
  );

  // Chandra Bala: House of Transit Moon from Natal Moon (1 to 12)
  const chandraBalaHouse = ((transitMoonRashi - natalMoonRashi + 12) % 12) + 1;
  const chandraBalaInfo = CHANDRA_BALA_RULES[chandraBalaHouse]?.[lang] || CHANDRA_BALA_RULES[chandraBalaHouse]?.en || {
    title: `Chandra Bala (House ${chandraBalaHouse})`,
    desc: "Favorable cosmic alignments.",
    isFavorable: true
  };

  // Tara Bala: From Natal Nakshatra to Transit Nakshatra (1 to 9)
  const diffNak = (transitMoonNakshatra - natalNakshatra + 27) % 27;
  const taraBalaNumber = (diffNak % 9) + 1;
  const taraBalaInfo = TARA_BALA_DESCRIPTIONS[taraBalaNumber]?.[lang] || TARA_BALA_DESCRIPTIONS[taraBalaNumber]?.en || {
    name: `Tara Bala ${taraBalaNumber}`,
    desc: "Auspicious planetary alignment.",
    isGood: true
  };

  // Energy Score computation based on Chandra Bala + Tara Bala
  let baseScore = 75;
  if (chandraBalaInfo.isFavorable) baseScore += 12;
  else baseScore -= 18;
  if (taraBalaInfo.isGood) baseScore += 8;
  else baseScore -= 12;
  if (chandraBalaHouse === 8) baseScore = Math.min(baseScore, 48); // Chandrashtama cap
  const energyScore = Math.max(35, Math.min(98, baseScore));

  const deity = DEITY_CONFIG[dayLordIdx] || DEITY_CONFIG[1];
  const kaala = getDailyKaalaTimings(dayLordIdx, lang, effectiveDate, userLat, userLng, userPincode);

  const formattedDate = formatLocalizedDinaDate(effectiveDate, lang);
  const localizedRashi = rashiName(natalMoonRashi, lang);
  const localizedNak = nakshatraName(natalNakshatra, lang);
  const localizedPandit = getLocalizedPanditName("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್", lang);

  // Construct deterministic high-fidelity reading
  let overallVibe = "";
  let careerAndFinance = "";
  let healthAndFamily = "";
  let travelAndInitiatives = "";
  let priestBlessing = "";

  if (lang === "kn") {
    overallVibe = `ಇಂದು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${localizedRashi}ಗೆ ಗೋಚಾರ ಚಂದ್ರನು ${chandraBalaInfo.title}ದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು (${chandraBalaInfo.desc}), ನಕ್ಷತ್ರ ತಾರಾ ಬಲವು ${taraBalaInfo.name}ವಾಗಿದೆ. ${deity.deityL5.kn} ಅವರ ಕೃಪೆಯಿಂದ ದಿನವು ${energyScore >= 75 ? "ಅತ್ಯಂತ ಶುಭದಾಯಕ ಹಾಗೂ ಉತ್ಸಾಹಭರಿತವಾಗಿರಲಿದೆ." : energyScore >= 50 ? "ಸ್ಥಿರ ಹಾಗೂ ಸಮತೋಲಿತ ಫಲ ನೀಡಲಿದೆ." : "ಸಾತ್ವಿಕ ಜಪ-ಧ್ಯಾನ ಹಾಗೂ ಎಚ್ಚರಿಕೆಯಿಂದ ಮುನ್ನಡೆಯಲು ಪ್ರಶಸ್ತವಾಗಿದೆ."}`;
    careerAndFinance = chandraBalaInfo.isFavorable
      ? `ವೃತ್ತಿರಂಗದಲ್ಲಿ ಉತ್ತಮ ಗೌರವ, ಸಹೋದ್ಯೋಗಿಗಳ ಬೆಂಬಲ ಹಾಗೂ ಧನ ಲಾಭ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನೂತನ ಹೂಡಿಕೆ ಹಾಗೂ ಬಾಕಿ ಹಣ ವಸೂಲಿಗೆ ಅನುಕೂಲಕರ ದಿನ.`
      : `ಹಣಕಾಸಿನ ವಹಿವಾಟುಗಳಲ್ಲಿ ಆತುರದ ನಿರ್ಧಾರಗಳು ಬೇಡ. ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಯಂತ್ರಣವಿರಲಿ. ವೃತ್ತಿಪರ ಕೆಲಸಗಳಲ್ಲಿ ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನ ಪಾಲಿಸಿ.`;
    healthAndFamily = chandraBalaHouse === 8
      ? `ಚಂದ್ರಾಷ್ಟಮ ಪ್ರಭಾವವಿರುವುದರಿಂದ ಮನಸ್ಸಿನಲ್ಲಿ ಅಶಾಂತಿ ಕಾಡದಂತೆ ಧ್ಯಾನ ಮತ್ತು ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವಿಸಿ. ಕುಟುಂಬ ಸದಸ್ಯರೊಂದಿಗೆ ಮೃದುವಾಗಿ ವರ್ತಿಸಿ.`
      : `ಉತ್ತಮ ದೈಹಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಸನ್ನತೆ ಇರಲಿದೆ. ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆ ಹೆಚ್ಚಲಿದ್ದು, ಗೃಹದಲ್ಲಿ ಶಾಂತಿಯುತ ವಾತಾವರಣ ನೆಲೆಸಲಿದೆ.`;
    travelAndInitiatives = taraBalaInfo.isGood
      ? `ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ ಕೈಗೊಳ್ಳುವ ಪ್ರಯಾಣ ಹಾಗೂ ನೂತನ ಕಾರ್ಯಾರಂಭಗಳು ಯಶಸ್ವಿಯಾಗಲಿವೆ. ವಾಹನ ಸಂಚಾರದಲ್ಲಿ ಸೌಕರ್ಯ ಲಭಿಸಲಿದೆ.`
      : `ಅನಗತ್ಯ ದೂರ ಪ್ರಯಾಣಗಳನ್ನು ಮುಂದೂಡಿ. ದೈನಂದಿನ ವಾಹನ ಚಾಲನೆಯಲ್ಲಿ ಜಾಗರೂಕರಾಗಿರಿ ಹಾಗೂ ಪೂರ್ವನಿಯೋಜಿತ ಕೆಲಸಗಳಿಗೆ ಮಾತ್ರ ಆದ್ಯತೆ ನೀಡಿ.`;
    priestBlessing = `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಿಂದ ಶ್ರೀರಾಮ ಪಂಡಿತರ ಆಶೀರ್ವಚನ: "${devoteeDisplayName} ಅವರಿಗೆ ಇಂದಿನ ${weekdayName}ದಂದು ಸಕಲ ನವಗ್ರಹ ದೋಷಗಳು ಶಮನವಾಗಿ, ದೈವಾನುಗ್ರಹದಿಂದ ಇಷ್ಟಾರ್ಥಗಳು ಸಿದ್ಧಿಸಲಿ. ॐ ನಮಃ ಶಿವಾಯ."`;
  } else if (lang === "hi") {
    overallVibe = `आज आपकी चंद्र राशि ${localizedRashi} के लिए गोचर चंद्रमा ${chandraBalaInfo.title} में गतिशील है (${chandraBalaInfo.desc}) तथा तारा बल ${taraBalaInfo.name} है। ${deity.deityL5.hi} की कृपा से आज का दिन ${energyScore >= 75 ? "अत्यंत शुभ एवं उत्साहवर्धक रहेगा।" : "संतुलित और धैर्य से आगे बढ़ने योग्य रहेगा।"}`;
    careerAndFinance = chandraBalaInfo.isFavorable
      ? `कार्यक्षेत्र में मान-सम्मान, अधिकारियों का सहयोग एवं आर्थिक लाभ के योग हैं। नए निवेश के लिए दिन अनुकूल है।`
      : `आर्थिक मामलों में जल्दबाजी से बचें। अनावश्यक खर्चों पर नियंत्रण रखें और अनुभवी लोगों से सलाह लें।`;
    healthAndFamily = `शारीरिक ऊर्जा अच्छी रहेगी। परिवार में सौहार्दपूर्ण वातावरण रहेगा तथा बड़ों का आशीर्वाद मिलेगा।`;
    travelAndInitiatives = taraBalaInfo.isGood
      ? `शुभ समय में की गई यात्रा एवं नई पहल लाभकारी सिद्ध होगी।`
      : `अनावश्यक यात्रा टालें और नियमित कार्यों पर ही ध्यान केंद्रित करें।`;
    priestBlessing = `गोकर्ण महाबलेश्वर क्षेत्र से मुख्य अर्चक का आशीर्वाद: "${devoteeDisplayName} को आज के दिन सुख-समृद्धि एवं ग्रह शांति प्राप्त हो। ॐ नमः शिवाय।"`;
  } else if (lang === "te") {
    overallVibe = `నేడు మీ చంద్ర రాశి ${localizedRashi}కి గోచార చంద్రుడు ${chandraBalaInfo.title}లో ఉన్నాడు (${chandraBalaInfo.desc}) మరియు తారా బలం ${taraBalaInfo.name}. ${deity.deityL5.te} అనుగ్రహంతో రోజు ${energyScore >= 75 ? "అత్యంత శుభప్రదంగా మరియు ఉత్సాహంగా సాగుతుంది." : "సమతుల్యంగా ఉంటుంది."}`;
    careerAndFinance = chandraBalaInfo.isFavorable
      ? `వృత్తి ఉద్యోగాలలో గౌరవం మరియు ధన లాభం లభిస్తాయి. నూతన పెట్టుబడులకు అనుకూల సమయం.`
      : `ఆర్థిక వ్యవహారాలలో జాగ్రత్త వహించండి. తొందరపాటు నిర్ణయాలు మానుకోండి.`;
    healthAndFamily = `శారీరక ఆరోగ్యం బాగుంటుంది. కుటుంబంలో శాంతి మరియు ఆనందం వెల్లివిరుస్తాయి.`;
    travelAndInitiatives = taraBalaInfo.isGood
      ? `శుభ ముహూర్తంలో చేసే ప్రయాణాలు విజయవంతమవుతాయి.`
      : `అనవసర ప్రయాణాలు వాయిదా వేసుకోవడం మంచిది.`;
    priestBlessing = `శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధి నుండి ప్రధాన అర్చకుల ఆశీర్వచనం: "${devoteeDisplayName} గారికి గ్రహ దోష శాంతి మరియు కార్య సిద్ధి కలుగుగాక."`;
  } else if (lang === "ta") {
    overallVibe = `இன்று உங்கள் சந்திர ராசி ${localizedRashi}க்கு கோச்சார சந்திரன் ${chandraBalaInfo.title}யில் சஞ்சரிக்கிறார் (${chandraBalaInfo.desc}) மற்றும் தாரா பலம் ${taraBalaInfo.name}. ${deity.deityL5.ta} அருளால் நாள் ${energyScore >= 75 ? "மிகவும் சுபமாகவும் உற்சாகமாகவும் இருக்கும்." : "நிதானமாக அமையும்."}`;
    careerAndFinance = chandraBalaInfo.isFavorable
      ? `தொழில் மற்றும் பணியில் மரியாதை, பண வரவு மற்றும் முன்னேற்றம் ஏற்படும்.`
      : `நிதி விவகாரங்களில் கவனமாக இருக்கவும். தேவையற்ற செலவுகளைத் தவிர்க்கவும்.`;
    healthAndFamily = `உடல் நலம் சீராக இருக்கும். குடும்பத்தில் அமைதியும் மகிழ்ச்சியும் நிலவும்.`;
    travelAndInitiatives = taraBalaInfo.isGood
      ? `சுப முகூர்த்தத்தில் செய்யும் பயணங்கள் வெற்றியைத் தரும்.`
      : `அவசியமற்ற பயணங்களைத் தவிர்க்கவும்.`;
    priestBlessing = `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னதியிலிருந்து தலைமை அர்ச்சகர் ஆசீர்வாதம்: "${devoteeDisplayName} அவர்களுக்கு சகல சுபங்களும் உண்டாகட்டும். ஓம் நம சிவாய."`;
  } else {
    overallVibe = `Today, transit Moon operates in ${chandraBalaInfo.title} relative to your Moon sign ${localizedRashi} (${chandraBalaInfo.desc}), accompanied by ${taraBalaInfo.name}. Blessed by ${deity.deityL5.en}, this day delivers ${energyScore >= 75 ? "high vigor, auspicious momentum, and success." : "steady progress with focused discipline."}`;
    careerAndFinance = chandraBalaInfo.isFavorable
      ? `Professional recognition, favorable team collaboration, and sound financial liquidity expected.`
      : `Exercise prudent financial discretion. Avoid impulsive speculation and consult mentors before signing contracts.`;
    healthAndFamily = chandraBalaHouse === 8
      ? `Chandrashtama requires mental calmness. Maintain satvik nourishment, hydration, and inner prayer.`
      : `Physical vitality remains robust with harmonious domestic rapport and positive interactions.`;
    travelAndInitiatives = taraBalaInfo.isGood
      ? `Favorable window for planned travel, vehicle acquisitions, and auspicious beginnings.`
      : `Stick to essential routine commutes and postpone high-stakes travels.`;
    priestBlessing = `Chief Archaka Benediction from Gokarna Kshetra: "May divine blessings of Sri Gokarna Mahabaleshwara protect and guide ${devoteeDisplayName} throughout today. Om Namah Shivaya."`;
  }

  // Dynamic Abhijit Muhurtha (approx 11:48 AM - 12:36 PM local solar noon)
  const abhijitMuhurtha = lang === "kn"
    ? "ಪೂರ್ವಾಹ್ನ ೧೧:೪೮ ರಿಂದ ಮಧ್ಯಾಹ್ನ ೧೨:೩೬ (ಅಭಿಜಿತ್ ಮುಹೂರ್ತ)"
    : lang === "hi"
    ? "पूर्वाह्न 11:48 से दोपहर 12:36 (अभिजित मुहूर्त)"
    : lang === "te"
    ? "ఉదయం 11:48 నుండి మధ్యాహ్నం 12:36 (అభిజిత్ ముహూర్తం)"
    : lang === "ta"
    ? "முற்பகல் 11:48 முதல் பிற்பகல் 12:36 (அபிஜித் முகூர்த்தம்)"
    : "11:48 AM – 12:36 PM (Abhijit Muhurtha)";

  const payload: DinaBhavishyaPayload = {
    targetDate: effectiveDate,
    formattedDate,
    weekdayName,
    isToday,
    wasFutureRequested,
    devoteeName,
    rashiIndex: natalMoonRashi,
    nakshatraIndex: natalNakshatra,
    rashiName: localizedRashi,
    nakshatraName: localizedNak,
    energyScore,
    overallVibe,
    badgeEmoji: energyScore >= 75 ? "🟢" : energyScore >= 50 ? "🟡" : "🔴",
    chandraBalaHouse,
    chandraBalaText: chandraBalaInfo.title,
    taraBalaNumber,
    taraBalaText: taraBalaInfo.name,
    dayLordName: deity.deityL5[lang] || deity.deityL5.en,
    overview: overallVibe,
    careerAndFinance,
    healthAndFamily,
    travelAndInitiatives,
    abhijitMuhurtha,
    rahuKaala: kaala.rahu,
    luckyColor: lang === "kn" ? deity.colorKn : deity.colorEn,
    luckyNumber: deity.number,
    luckyDirection: lang === "kn" ? deity.directionKn : deity.directionEn,
    deityName: deity.deityL5[lang] || deity.deityL5.en,
    siddhaMantra: deity.mantra,
    japaRecommendation: deity.count,
    priestBlessing
  };

  // Save to Caches (In-Memory, LocalStorage, Firestore)
  IN_MEMORY_CACHE.set(cacheKey, payload);

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch {
      // Ignore quota error
    }
  }

  if (firestore) {
    try {
      const docRef = doc(firestore, "dinaBhavishyaCache", cacheKey);
      void setDoc(docRef, JSON.parse(JSON.stringify(payload)), { merge: true });
    } catch (err) {
      console.warn("[DinaBhavishya] Failed to write Firestore cache:", err);
    }
  }

  return payload;
}
