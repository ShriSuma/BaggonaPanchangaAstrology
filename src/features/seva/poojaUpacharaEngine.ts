/**
 * 16-Upachara Comprehensive Daily Deva Pooja Engine (ಷೋಡಶೋಪಚಾರ ನಿತ್ಯ ಮಹಾಪೂಜಾ ವಿಧಿ)
 * 
 * Provides an authentic, interactive 20-minute guided morning pooja ritual for devotees
 * to perform directly in front of their home altar / deity shrine (ದೇವರ ಮಂಟಪ).
 * 
 * Features:
 * - 16 Classical Vedic Upacharas with precise Sanskrit Mantras and 5-language native script
 * - Real-time Voice Guidance recited in the Priest's Cloned Voice
 * - Devotee Janma Kundali personalization (Name, Gotra, Rashi, Nakshatra) in Maha Sankalpa
 * - Interactive step progression ("ಮುಂದಿನ ಉಪಚಾರ") & Auto-Play 20-minute flow
 * - Interactive altar animations (Deepa flame, Ghantanada, Pushparchana, Dhoopa, Mangalarathi)
 * - Integration with Streak Engine, Ashirvada Pass, and WhatsApp blessing share
 */

import type { SevaLang } from "./sevaLocale";

export interface PoojaUpacharaStep {
  step: number;
  key: string;
  titleKn: string;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  titleTa: string;
  icon: string;
  sanskritMantra: string;
  narrationText: Record<SevaLang, string>;
  actionGuide: Record<SevaLang, string>;
  spiritualSignificance: Record<SevaLang, string>;
  visualEffect: "achamana" | "deepa" | "bell" | "ganesha" | "sankalpa" | "kalasha" | "aavahana" | "aasana" | "snana" | "vastra" | "gandha" | "akshata" | "dhoopa" | "naivedya" | "arathi" | "namaskara";
}

export interface BuildPoojaParams {
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  priestName?: string;
  lang?: SevaLang;
}

export const POOJA_16_UPACHARES: (params: BuildPoojaParams) => PoojaUpacharaStep[] = ({
  devoteeName,
  gotra = "ಕಾಶ್ಯಪ",
  rashiName = "ಧನು",
  nakshatraName = "ಮೂಲ",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => [
  {
    step: 1,
    key: "achamana",
    titleKn: "೧. ಆಚಮನ & ಪ್ರಾಣಾಯಾಮ",
    titleEn: "1. Achamana & Inner Purification",
    titleHi: "१. आचमन एवं प्राणायाम",
    titleTe: "1. ఆచమనం & ప్రాణాయామం",
    titleTa: "1. ஆசமனம் & பிராணாயாமம்",
    icon: "💧",
    visualEffect: "achamana",
    sanskritMantra: "ಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ, ಓಂ ನಾರಾಯಣಾಯ ಸ್ವಾಹಾ, ಓಂ ಮಾಧವಾಯ ಸ್ವಾಹಾ । ಓಂ ಗೋವಿಂದಾಯ ನಮಃ, ವಿಷ್ಣವೇ ನಮಃ, ಮಧುಸೂದನಾಯ ನಮಃ ॥",
    narrationText: {
      kn: `ಹರಿ ಓಂ. ಮುಂಜಾನೆಯ ಪವಿತ್ರ ದೇವತಾ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ಮೊದಲು ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಪವಿತ್ರ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ, ಅಂಗೈ ಶುದ್ಧಿ ಮಾಡಿ ಪ್ರಾಣಾಯಾಮವನ್ನು ಕೈಗೊಳ್ಳಿ.`,
      hi: `हरि ॐ। प्रातःकालीन पावन देव पूजा में आपका स्वागत है। सर्वप्रथम आचमनी से तीन बार जल ग्रहण कर आचमन करें और हाथ शुद्ध कर प्राणायाम करें।`,
      te: `హరి ఓం. ఉదయపు పవిత్ర దేవ పూజకు స్వాగతం. మొదట ఆచమన పాత్ర నుండి మూడుసార్లు పవిత్ర జలాన్ని స్వీకరించి, చేతులు శుద్ధి చేసుకొని ప్రాణాయామం చేయండి.`,
      ta: `ஹரி ஓம். காலை புனித இறை பூஜைக்கு நல்வரவு. முதலில் ஆசமன பாத்திரத்திலிருந்து மூன்று முறை புனித நீர் அருந்தி, கைகளைத் தூய்மை செய்து பிராணாயாமம் செய்யவும்.`,
      en: `Hari Om. Welcome to the sacred morning Deva Pooja. Take three sips of holy water from the spoon for inner purification (Achamana), wash your palms, and perform gentle Pranayama.`
    },
    actionGuide: {
      kn: "ಉದ್ಧರಣೆಯಿಂದ ಬಲ ಅಂಗೈಗೆ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಹಾಕಿಕೊಂಡು ಆಚಮನ ಮಾಡಿ, ಕೈ ತೊಳೆದುಕೊಳ್ಳಿ.",
      hi: "आचमनी से दाहिनी हथेली में तीन बार जल लेकर आचमन करें और हाथ धोएं।",
      te: "ఉద్ధరణితో కుడి అరచేతిలో మూడుసార్లు నీటిని తీసుకొని ఆచమనం చేసి, చేతులు కడుక్కోండి.",
      ta: "உத்தரணியால் வலது உள்ளங்கையில் மூன்று முறை நீர் எடுத்து அருந்தி, கைகளைக் கழுவவும்.",
      en: "Take 3 drops of pure water in your right palm using the spoon, sip softly, and cleanse hands."
    },
    spiritualSignificance: {
      kn: "ದೇಹ, ವಾಕ್ ಮತ್ತು ಮನಸ್ಸಿನ ತ್ರಿದೋಷ ನಿವಾರಣೆ ಮತ್ತು ಆಂತರಿಕ ಪಾವಿತ್ರ್ಯತೆ.",
      hi: "मन, वाणी और काया की शुद्धि एवं अंतःकरण का पावन जागरण।",
      te: "మనస్సు, వాక్కు మరియు శరీరం యొక్క త్రికరణ శుద్ధి.",
      ta: "மனம், வாக்கு மற்றும் உடலின் மும்மல சுத்தி.",
      en: "Purifies mind, speech, and body for receiving divine cosmic grace."
    }
  },
  {
    step: 2,
    key: "deepa",
    titleKn: "೨. ದೀಪ ಪ್ರಜ್ವಲನೆ",
    titleEn: "2. Lighting the Sanctum Lamp",
    titleHi: "२. दीप प्रज्वलन",
    titleTe: "2. దీప ప్రజ్వలన",
    titleTa: "2. திருவிளக்கு ஏற்றுதல்",
    icon: "🪔",
    visualEffect: "deepa",
    sanskritMantra: "ಶುಭಂ ಕರೋತಿ ಕಲ್ಯಾಣಂ ಆರೋಗ್ಯಂ ಧನಸಂಪದಃ । ಶತ್ರುಬುದ್ಧಿ ವಿನಾಶಾಯ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥ ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ ॥",
    narrationText: {
      kn: `ಈಗ ದೇವರ ಮಂಟಪದಲ್ಲಿ ಶುದ್ಧ ಎಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಬೆಳಗಿಸಿ. ಜ್ಞಾನಜ್ಯೋತಿಯು ಅಜ್ಞಾನವನ್ನು ಕಳೆದು ಸರ್ವ ಶುಭವನ್ನು ತರಲಿ.`,
      hi: `अब पूजा मण्डप में शुद्ध तेल या गाय के घी का पावन दीप प्रज्वलित करें। यह ज्ञानज्योति अज्ञान को दूर कर सर्वत्र शुभता लाए।`,
      te: `ఇప్పుడు పూజా మంటపంలో స్వచ్ఛమైన నూనె లేదా ఆవు నెయ్యితో దీపాన్ని వెలిగించండి. ఈ జ్ఞానజ్యోతి సర్వ శుభాలను ప్రసాదించుగాక.`,
      ta: `இப்போது பூஜை மண்டபத்தில் தூய நல்லெண்ணெய் அல்லது நெய் தீபம் ஏற்றவும். ஞானஜோதி இருள் நீக்கி சகல மங்களங்களையும் அருளட்டும்.`,
      en: `Light the auspicious sanctum lamp with pure oil or cow's ghee. May this sacred flame dispel all darkness and illuminate divine wisdom in your home.`
    },
    actionGuide: {
      kn: "ದೀಪಕ್ಕೆ ಅರಿಶಿಣ-ಕುಂಕುಮ ಅಕ್ಷತೆ ಇಟ್ಟು, ದೀಪದ ಜ್ಯೋತಿಯನ್ನು ಬೆಳಗಿಸಿ ನಮಸ್ಕರಿಸಿ.",
      hi: "दीपक को हल्दी-कुमकुम एवं अक्षत लगाकर प्रज्वलित करें और हाथ जोड़ें।",
      te: "దీపానికి పసుపు-కుంకుమ అక్షతలు పెట్టి, దీపం వెలిగించి నమస్కరించండి.",
      ta: "விளக்கிற்கு மஞ்சள், குங்குமம், அட்சதை இட்டு தீபம் ஏற்றி வணங்கவும்.",
      en: "Apply a dot of Chandana & Kumkuma to the brass lamp, light the cotton wick, and fold hands."
    },
    spiritualSignificance: {
      kn: "ಅಜ್ಞಾನಾಂಧಕಾರ ನಾಶ, ಗೃಹ ಶಾಂತಿ ಹಾಗೂ ಲಕ್ಷ್ಮೀ ಪ್ರವೇಶ.",
      hi: "अज्ञान का नाश, गृह में सुख-शांति एवं महालक्ष्मी का वास।",
      te: "గృహ శాంతి, అజ్ఞాన నాశనం మరియు మహాలక్ష్మీ ప్రవేశం.",
      ta: "இல்லத்தில் அமைதி, இருள் நீக்கம் மற்றும் மகாலட்சுமி வாசம்.",
      en: "Invokes Goddess Mahalakshmi, bestows peace, and dispels obstacles."
    }
  },
  {
    step: 3,
    key: "bell",
    titleKn: "೩. ಘಂಟಾನಾದ & ಶಂಖ ಪೂಜೆ",
    titleEn: "3. Sacred Bell & Shankha Invocation",
    titleHi: "३. घण्टानाद एवं शंख पूजा",
    titleTe: "3. ఘంటానాదం & శంఖ పూజ",
    titleTa: "3. மணி ஒலித்தல் & சங்கு பூஜை",
    icon: "🔔",
    visualEffect: "bell",
    sanskritMantra: "ಆಗಮಾರ್ಥಂ ತು ದೇವಾನಾಂ ಗಮನಾರ್ಥಂ ತು ರಾಕ್ಷಸಾಮ್ । ಕುರ್ವೇ ಘಂಟಾರವಂ ತತ್ರ ದೇವತಾಹ್ವಾನ ಲಕ್ಷಣಮ್ ॥",
    narrationText: {
      kn: `ದೇವತಾ ಸಾನ್ನಿಧ್ಯವನ್ನು ಆಹ್ವಾನಿಸಲು ಮತ್ತು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳನ್ನು ನಿವಾರಿಸಲು ಭಕ್ತಿಯಿಂದ ಪೂಜಾ ಘಂಟೆಯನ್ನು ಮೊಳಗಿಸಿ.`,
      hi: `देवताओं के आगमन एवं नकारात्मक ऊर्जा के निवारण हेतु श्रद्धापूर्वक मन्दिर की पावन घण्टी बजाएं।`,
      te: `దేవతల సాన్నిధ్యాన్ని ఆహ్వానించడానికి మరియు ప్రతికూల శక్తులను పారద్రోలడానికి భక్తితో పూజా గంటను మ్రోగించండి.`,
      ta: `தெய்வீக சந்நிதியை வரவேற்கவும் எதிர்மறை சக்திகளை விலக்கவும் பக்தியுடன் பூஜை மணியை ஒலிக்கவும்.`,
      en: `Ring the consecrated temple bell to welcome divine deities and purify your home from all negative vibrations.`
    },
    actionGuide: {
      kn: "ಘಂಟೆಯನ್ನು ಎಡ ಅಥವಾ ಬಲಗೈಯಿಂದ ಲಯಬದ್ಧವಾಗಿ ನುಡಿಸಿ, ದೇವರನ್ನು ಆಹ್ವಾನಿಸಿ.",
      hi: "घण्टी को मधुर ध्वनि में बजाएं और भगवान का आवाहन करें।",
      te: "గంటను మధుర నాదంతో మ్రోగిస్తూ భగవంతుడిని ఆహ్వానించండి.",
      ta: "மணியை இனிய ஓசையுடன் ஒலித்து இறைவனை ஆவாஹனம் செய்யவும்.",
      en: "Gently ring the pooja bell with rhythmic chimes to set the sacred temple ambience."
    },
    spiritualSignificance: {
      kn: "ಓಂಕಾರ ಧ್ವನಿ ತರಂಗಗಳ ಉತ್ಪತ್ತಿ ಹಾಗೂ ವಾಸ್ತು ಶುದ್ಧೀಕರಣ.",
      hi: "दिव्य ओंकार ध्वनि तरंगों का संचार एवं वास्तु शुद्धि।",
      te: "ఓంకార నాద తరంగాలు మరియు వాస్తు శుద్ధి.",
      ta: "ஓம் எனும் பிரணவ ஒலி அலைகள் மற்றும் வாஸ்து சுத்தி.",
      en: "Generates pure Omkara frequencies, energizing the sacred sanctum."
    }
  },
  {
    step: 4,
    key: "ganesha",
    titleKn: "೪. ಗುರು & ಮಹಾಗಣಪತಿ ಧ್ಯಾನ",
    titleEn: "4. Guru & Maha Ganapati Dhyana",
    titleHi: "४. गुरु एवं महागणपति ध्यान",
    titleTe: "4. గురు & మహాగణపతి ధ్యానం",
    titleTa: "4. குரு & கணபதி தியானம்",
    icon: "🐘",
    visualEffect: "ganesha",
    sanskritMantra: "ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ । ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ॥ ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ ॥",
    narrationText: {
      kn: `ಪೂಜೆಯಲ್ಲಿ ಯಾವುದೇ ವಿಘ್ನಗಳು ಬಾರದಂತೆ ಪ್ರಥಮ ಪೂಜಿತ ಶ್ರೀ ಮಹಾಗಣಪತಿಯನ್ನು ಹಾಗೂ ಗುರು ಪರಂಪರೆಯನ್ನು ಸ್ಮರಿಸಿ ನಮಸ್ಕರಿಸಿ.`,
      hi: `पूजा में सर्व विघ्न निवारण हेतु प्रथम पूज्य श्री गणेश एवं सद्गुरु देव का स्मरण कर नमन करें।`,
      te: `పూజలో ఎలాంటి విఘ్నాలు రాకుండా ప్రథమ పూజితుడైన శ్రీ మహాగణపతిని మరియు గురు పరంపరను స్మరించి నమస్కరించండి.`,
      ta: `பூஜையில் எவ்வித தடைகளும் இன்றி நிறைவேற முதற்கடவுள் விநாயகரையும் குரு பரம்பரையையும் தியானித்து வணங்கவும்.`,
      en: `Meditate upon Lord Maha Ganapati and your spiritual Guru to remove all obstacles and bless the pooja with seamless completion.`
    },
    actionGuide: {
      kn: "ಕೈಮುಗಿದು ಗಣಪತಿಗೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ, ಕುಂಭಕ ನಮಸ್ಕಾರ ಮಾಡಿ.",
      hi: "हाथ जोड़कर गणपति जी को अक्षत अर्पित करें और प्रणाम करें।",
      te: "చేతులు జోడించి గణపతికి అక్షతలు సమర్పించి నమస్కరించండి.",
      ta: "கை கூப்பி கணபதிக்கு அட்சதை சமர்ப்பித்து வணங்கவும்.",
      en: "Fold your hands, offer unbroken akshata grains to Lord Ganesha, and bow with reverence."
    },
    spiritualSignificance: {
      kn: "ಸರ್ವ ಕಾರ್ಯ ಸಿದ್ಧಿ ಮತ್ತು ವಿಘ್ನ ನಿವಾರಣೆ.",
      hi: "सर्व कार्य सिद्धि एवं बाधाओं का शमन।",
      te: "సర్వ కార్య సిద్ధి మరియు విఘ్న నివారణ.",
      ta: "சகல காரிய சித்தி மற்றும் தடைகள் நீங்குதல்.",
      en: "Guarantees success, clarity of mind, and impediment removal."
    }
  },
  {
    step: 5,
    key: "sankalpa",
    titleKn: "೫. ಜನ್ಮ ಕುಂಡಲಿ ಮಹಾಸಂಕಲ್ಪ",
    titleEn: "5. Personalized Janma Kundali Maha Sankalpa",
    titleHi: "५. जन्म कुंडली महासंकल्प",
    titleTe: "5. జన్మ జాతక మహా సంకల్పం",
    titleTa: "5. ஜாதக மகா சங்கல்பம்",
    icon: "📜",
    visualEffect: "sankalpa",
    sanskritMantra: `ಅದ್ಯ ಪೂರ್ವೋಕ್ತ ಶುಭ ಪುಣ್ಯ ತಿಥೌ, ${devoteeName} ಶರ್ಮಣಃ, ${gotra} ಗೋತ್ರೋದ್ಭವಸ್ಯ, ${rashiName} ರಾಶೌ, ${nakshatraName} ನಕ್ಷತ್ರ ಜಾತಸ್ಯ, ಮಮ ಕುಟುಂಬಸ್ಯ ಸಕಲ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ, ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧರ್ಥಂ, ಇಷ್ಟದೇವತಾ ಪ್ರೀತ್ಯರ್ಥಂ ನಿತ್ಯ ದೇವತಾ ಪೂಜಾ ಕರ್ಮ ಕರಿಷ್ಯೇ ॥`,
    narrationText: {
      kn: `ಪೂಜ್ಯ ${devoteeName} ಅವರೇ, ನಿಮ್ಮ ${gotra} ಗೋತ್ರ, ${rashiName} ರಾಶಿ ಹಾಗೂ ${nakshatraName} ನಕ್ಷತ್ರವನ್ನು ಉಲ್ಲೇಖಿಸಿ, ಇಂದಿನ ಶುಭ ಪುಣ್ಯ ತಿಥಿಯಲ್ಲಿ ನಿಮ್ಮ ಮತ್ತು ಕುಟುಂಬದ ಸರ್ವತೋಮುಖ ಕ್ಷೇಮಕ್ಕಾಗಿ ಈ ಮಹಾಸಂಕಲ್ಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಿ.`,
      hi: `श्रद्धेय ${devoteeName} जी, आपके ${gotra} गोत्र, ${rashiName} राशि एवं ${nakshatraName} नक्षत्र के साथ आज की पावन तिथि में पारिवारिक सुख, आरोग्य एवं सर्व मनोकामना पूर्ति हेतु यह महासंकल्प अर्पित करें।`,
      te: `భక్తులు ${devoteeName} గారు, మీ ${gotra} గోత్రం, ${rashiName} రాశి మరియు ${nakshatraName} నక్షత్రంతో నేటి శుభ తిథిలో కుటుంబ ఆయురారోగ్యాల కొరకు ఈ మహా సంకల్పాన్ని సమర్పించండి.`,
      ta: `பக்தர் ${devoteeName} அவர்களே, உங்கள் ${gotra} கோத்திரம், ${rashiName} ராசி மற்றும் ${nakshatraName} நட்சத்திரத்துடன் குடும்ப நலனுக்காக இந்த மகா சங்கல்பத்தை அர்ப்பணிக்கவும்.`,
      en: `Respected ${devoteeName}, recite this personalized Vedic Sankalpa with ${gotra} Gotra, ${rashiName} Rashi, and ${nakshatraName} Nakshatra for the health, prosperity, and fulfillment of your entire family.`
    },
    actionGuide: {
      kn: "ಬಲಗೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಪವಿತ್ರ ಜಲವನ್ನು ಹಿಡಿದುಕೊಂಡು ಸಂಕಲ್ಪವನ್ನು ಸ್ಮರಿಸಿ, ತಟ್ಟೆಗೆ ಬಿಡಿ.",
      hi: "दाहिने हाथ में अक्षत और जल लेकर संकल्प का उच्चारण करें और पात्र में छोड़ें।",
      te: "కుడి చేతిలో అక్షతలు మరియు జలాన్ని పట్టుకొని సంకల్పాన్ని స్మరిస్తూ పాత్రలో విడవండి.",
      ta: "வலது கையில் அட்சதை மற்றும் தீர்த்தம் ஏந்தி சங்கல்பம் கூறி தட்டில் விடவும்.",
      en: "Hold unbroken akshata grains and pure water in your right palm, chant the sankalpa, and release into the arghya plate."
    },
    spiritualSignificance: {
      kn: "ವೈಯಕ್ತಿಕ ಗ್ರಹದೋಷ ಶಾಂತಿ, ಸಂಕಲ್ಪ ಸಿದ್ಧಿ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ.",
      hi: "ग्रहदोष शांति, मनोकामना सिद्धि एवं वंश कल्याण।",
      te: "గ్రహదోష నివారణ, సంకల్ప సిద్ధి మరియు వంశాభివృద్ధి.",
      ta: "கிரகதோஷ சாந்தி, சங்கல்ப சித்தி மற்றும் வம்ச விருத்தி.",
      en: "Aligns personal Janma Kundali energies with celestial divine grace."
    }
  },
  {
    step: 6,
    key: "kalasha",
    titleKn: "೬. ಕಲಶ & ವರುಣ ಪೂಜೆ (ಜಲ ಪ್ರೋಕ್ಷಣೆ)",
    titleEn: "6. Kalasha & Sacred Water Sanctification",
    titleHi: "६. कलश एवं वरुण पूजा",
    titleTe: "6. కలశ & వరుణ పూజ",
    titleTa: "6. கலச & வருண பூஜை",
    icon: "🏺",
    visualEffect: "kalasha",
    sanskritMantra: "ಗಂಗೇ ಚ ಯಮುನೇ ಚೈವ ಗೋದಾವರಿ ಸರಸ್ವತಿ । ನರ್ಮದೇ ಸಿಂಧು ಕಾವೇರಿ ಜಲೇಸ್ಮಿನ್ ಸನ್ನಿಧಿಂ ಕುರು ॥ ಕಲಶಾಯ ನಮಃ, ವರುಣಾಯ ನಮಃ ॥",
    narrationText: {
      kn: `ಪೂಜಾ ಜಲಕ್ಕೆ ಗಂಗಾ, ಯಮುನಾ, ಗೋದಾವರಿ, ಕಾವೇರಿ ಮುಂತಾದ ಸಪ್ತ ನದಿಗಳ ಪವಿತ್ರ ಶಕ್ತಿಯನ್ನು ಆಹ್ವಾನಿಸಿ, ಕಲಶ ಜಲವನ್ನು ಪೂಜಾ ವಸ್ತುಗಳ ಮೇಲೆ ಪ್ರೋಕ್ಷಣೆ ಮಾಡಿಕೊಳ್ಳಿ.`,
      hi: `पूजा जल में गंगा, यमुना, गोदावरी, कावेरी सहित सप्त पावन नदियों का आवाहन करें और जल को पूजा सामग्री एवं स्वयं पर छिड़कें।`,
      te: `పూజా జలంలో గంగా, యమునా, గోదావరి, కావేరి మొదలైన సప్త నదుల పవిత్ర శక్తిని ఆహ్వానించి, ఆ జలాన్ని పూజా వస్తువులపై ప్రోక్షించండి.`,
      ta: `பூஜை நீரில் கங்கை, யமுனை, கோதாவரி, காவேரி முதலான சப்த நதிகளின் சக்தியை ஆவாஹனம் செய்து தீர்த்தத்தை தெளிக்கவும்.`,
      en: `Invoke the seven holy rivers (Ganga, Yamuna, Godavari, Saraswati, Narmada, Sindhu, Kaveri) into the water vessel, consecrating the water.`
    },
    actionGuide: {
      kn: "ಕಲಶ ಪಾತ್ರೆಗೆ ಹೂವು ಮತ್ತು ಅಕ್ಷತೆ ಹಾಕಿ, ತುಳಸಿ ಅಥವಾ ಹೂವಿನಿಂದ ಎಲ್ಲ ವಸ್ತುಗಳ ಮೇಲೆ ನೀರು ಪ್ರೋಕ್ಷಿಸಿ.",
      hi: "कलश पात्र में पुष्प-अक्षत अर्पित करें और तुलसी/पुष्प से सभी सामग्रियों पर जल छिड़कें।",
      te: "కలశ పాత్రలో పుష్పం-అక్షతలు వేసి, తులసి లేదా పువ్వుతో అన్నింటిపై నీటిని ప్రోక్షించండి.",
      ta: "கலச பாத்திரத்தில் புஷ்பம் இட்டு, துளசி அல்லது மலரால் அனைத்துப் பொருட்களின் மீதும் நீர் தெளிக்கவும்.",
      en: "Touch the water pot with a flower/tulasi leaf and gently sprinkle drops over the altar."
    },
    spiritualSignificance: {
      kn: "ಸಪ್ತ ತೀರ್ಥಗಳ ಪಾವಿತ್ರ್ಯತೆ ಮತ್ತು ಸರ್ವ ದ್ರವ್ಯ ಶುದ್ಧೀಕರಣ.",
      hi: "सप्त तीर्थों की दिव्यता एवं सर्व सामग्रियों का पवित्रीकरण।",
      te: "సప్త తీర్థాల పావిత్ర్యం మరియు సర్వ సామగ్రి శుద్ధి.",
      ta: "சப்த தீர்த்தங்களின் புனிதம் மற்றும் பொருட்கள் சுத்தி.",
      en: "Infuses the altar with the purifying resonance of India's 7 sacred rivers."
    }
  },
  {
    step: 7,
    key: "aavahana",
    titleKn: "೭. ದೇವತಾ ಆವಾಹನೆ & ಪ್ರಾಣಪ್ರತಿಷ್ಠೆ",
    titleEn: "7. Deity Invocation & Prana Pratishtha",
    titleHi: "७. देवता आवाहन एवं ध्यान",
    titleTe: "7. దేవతా ఆవాహన & ధ్యానం",
    titleTa: "7. இறை ஆவாஹனம் & தியானம்",
    icon: "🛕",
    visualEffect: "aavahana",
    sanskritMantra: "ಓಂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪರಮೇಶ್ವರಾಯ ನಮಃ । ಧ್ಯಾಯಾಮಿ, ಆವಾಹಯಾಮಿ, ಸ್ಥಾಪಯಾಮಿ, ಪೂಜಯಾಮಿ ॥",
    narrationText: {
      kn: `ಪರಮಾತ್ಮನನ್ನು ನಿಮ್ಮ ಮಂಟಪದಲ್ಲಿ ಆವಾಹಿಸಿ, ಭಕ್ತಿಭಾವದಿಂದ ಸನ್ನಿಧಿಯನ್ನು ನಮಸ್ಕರಿಸಿ ಪ್ರಾರ್ಥಿಸಿ.`,
      hi: `परमपिता परमेश्वर श्री महाबलेश्वर को अपने पूजा मण्डप में भक्तिभाव से स्थापित एवं आमंत्रित करें।`,
      te: `భగవంతుడైన శ్రీ మహాబలేశ్వరుడిని మీ పూజా మంటపంలో భక్తిభావంతో ఆవాహన చేయండి.`,
      ta: `இறைவன் ஸ்ரீ மகாபலேஸ்வரரை உங்கள் பூஜை மண்டபத்தில் பக்தியுடன் எழுந்தருளச் செய்யுங்கள்.`,
      en: `Welcome Lord Mahabaleshwara and your Ishta Devata into your sacred altar with loving devotion.`
    },
    actionGuide: {
      kn: "ದೇವತಾ ವಿಗ್ರಹ ಅಥವಾ ಫೋಟೋಗೆ ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ಅರ್ಪಿಸಿ, ಕೈಮುಗಿದು ಆವಾಹನೆ ಮಾಡಿ.",
      hi: "मूर्ति या चित्र पर पुष्प-अक्षत अर्पित कर भगवान का हृदय से आवाहन करें।",
      te: "విగ్రహం లేదా చిత్రపటానికి పుష్పం-అక్షతలు సమర్పించి ఆవాహన చేయండి.",
      ta: "திருவுருவச் சிலைக்கு அல்லது படத்திற்கு மலர் மற்றும் அட்சதை சமர்ப்பித்து வழிபடவும்.",
      en: "Offer fresh flowers and akshata to the idol/photo, welcoming the Divine into your shrine."
    },
    spiritualSignificance: {
      kn: "ಭಕ್ತ ಮತ್ತು ಭಗವಂತನ ನಡುವಿನ ಪ್ರತ್ಯಕ್ಷ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಬಂಧ.",
      hi: "भक्त और भगवान के मध्य प्रत्यक्ष दिव्य संबंध की स्थापना।",
      te: "భక్తుడు మరియు భగవంతుని మధ్య ప్రత్యక్ష అనుసంధానం.",
      ta: "பக்தனுக்கும் இறைவனுக்கும் இடையிலான நேரடி ஆன்மீகத் தொடர்பு.",
      en: "Awakens the living divine consciousness in your home."
    }
  },
  {
    step: 8,
    key: "aasana",
    titleKn: "೮. ಆಸನ, ಪಾದ್ಯ, ಅರ್ಘ್ಯ, ಆಚಮನೀಯ",
    titleEn: "8. Aasana, Paadya, Arghya & Aachamaneeya",
    titleHi: "८. आसन, पाद्य, अर्घ्य एवं आचमनीय",
    titleTe: "8. ఆసనం, పాద్యం, అర్ఘ్యం & ఆచమనీయం",
    titleTa: "8. ஆசனம், பாத்யம், அர்க்யம் & ஆசமனீயம்",
    icon: "🪷",
    visualEffect: "aasana",
    sanskritMantra: "ಆಸನಾರ್ಥಂ ಪುಷ್ಪಾಣಿ ಸಮರ್ಪಯಾಮಿ । ಪಾದಯೋಃ ಪಾದ್ಯಂ ಸಮರ್ಪಯಾಮಿ । ಹಸ್ತಯೋಃ ಅರ್ಘ್ಯಂ ಸಮರ್ಪಯಾಮಿ । ಮುಖೇ ಆಚಮನೀಯಂ ಸಮರ್ಪಯಾಮಿ ॥",
    narrationText: {
      kn: `ದೇವರಿಗೆ ಆಸನವಾಗಿ ಹೂವುಗಳನ್ನು ಮತ್ತು ಪಾದ ಪ್ರಕ್ಷಾಲನೆಗಾಗಿ ಅರ್ಘ್ಯ-ಪಾದ್ಯ-ಆಚಮನ ಜಲವನ್ನು ಸಮರ್ಪಿಸಿ.`,
      hi: `भगवान को दिव्य आसन हेतु पुष्प एवं चरण प्रक्षालन हेतु पाद्य, अर्घ्य एवं आचमन जल अर्पित करें।`,
      te: `స్వామికి ఆసనంగా పుష్పాలను మరియు పాద ప్రక్షాళనకు పాద్యం, అర్ఘ్యం, ఆచమనీయ జలాన్ని సమర్పించండి.`,
      ta: `இறைவனுக்கு ஆசனமாக மலர்களையும் பாத பூஜைக்கு பாத்யம், அர்க்யம், ஆசமன தீர்த்தத்தை சமர்ப்பிக்கவும்.`,
      en: `Offer sacred flowers as a divine throne (Aasana), and offer sacred water for washing holy feet (Paadya), hands (Arghya), and sipping (Aachamaneeya).`
    },
    actionGuide: {
      kn: "ಉದ್ಧರಣೆಯಿಂದ ೩ ಬಾರಿ ನೀರನ್ನು ಅರ್ಘ್ಯ ಪಾತ್ರೆಗೆ ಬಿಡಿ ಮತ್ತು ಹೂವನ್ನು ಸಮರ್ಪಿಸಿ.",
      hi: "आचमनी से तीन बार जल अर्घ्य पात्र में छोड़ें और पुष्प अर्पित करें।",
      te: "ఉద్ధరణితో మూడుసార్లు నీటిని అర్ఘ్య పాత్రలో విడిచి పువ్వును సమర్పించండి.",
      ta: "உத்தரணியால் 3 முறை தீர்த்தத்தை அர்க்ய பாத்திரத்தில் விட்டு மலரை அர்ப்பணிக்கவும்.",
      en: "Spoon a few drops of consecrated water into the offering bowl and offer a flower at the base."
    },
    spiritualSignificance: {
      kn: "ದೈವಿಕ ಅತಿಥಿ ಸತ್ಕಾರ ಹಾಗೂ ಶರಣಾಗತಿ ಭಾವ.",
      hi: "परमात्मा के प्रति परम आदर, सत्कार एवं शरणागति।",
      te: "భగవత్ సత్కారం మరియు శరణాగతి భావం.",
      ta: "இறைவனுக்குரிய விருந்தோம்பல் மற்றும் சரணாகதி.",
      en: "Expresses humble hospitality and total surrender to the Divine."
    }
  },
  {
    step: 9,
    key: "snana",
    titleKn: "೯. ಪಂಚಾಮೃತ & ಶುದ್ಧೋದಕ ಸ್ನಾನ",
    titleEn: "9. Panchamrita & Shuddhodaka Abhisheka",
    titleHi: "९. पंचामृत एवं शुद्धोदक स्नान",
    titleTe: "9. పంచామృత & శుద్ధోదక స్నానం",
    titleTa: "9. பஞ்சாமிர்த & தீர்த்த அபிஷேகம்",
    icon: "🥛",
    visualEffect: "snana",
    sanskritMantra: "ಓಂ ನಮಃ ಶಿವಾಯ । ಪಯೋದಧಿ ಘೃತೈಃ ಯುಕ್ತಂ ಶರ್ಕರಾಯಾ ಮಧುಶ್ರಿತಮ್ । ಪಂಚಾಮೃತೇನ ಸ್ನಪನಂ ಕಾರಯಾಮಿ ಸುರೇಶ್ವರ ॥ ಶುದ್ಧೋದಕ ಸ್ನಾನಂ ಸಮರ್ಪಯಾಮಿ ॥",
    narrationText: {
      kn: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರರಿಗೆ ಹಾಗೂ ಇಷ್ಟದೇವತೆಗೆ ಶುದ್ಧೋದಕ ಹಾಗೂ ಪಂಚಾಮೃತ ಸ್ನಾನವನ್ನು ಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಿ.`,
      hi: `भगवान श्री महाबलेश्वर एवं इष्टदेव को दूध, दही, घी, शहद एवं गंगाजल से पावन पंचामृत व शुद्धोदक स्नान कराएं।`,
      te: `శ్రీ మహాబలేశ్వరునికి మరియు ఇష్టదైవానికి పంచామృత మరియు శుద్ధ జల స్నానాన్ని భక్తితో సమర్పించండి.`,
      ta: `ஸ்ரீ மகாபலேஸ்வரருக்கு பஞ்சாமிர்தம் மற்றும் தூய தீர்த்த அபிஷேகத்தை பக்தியுடன் சமர்ப்பிக்கவும்.`,
      en: `Offer sacred Panchamrita (milk, curd, ghee, honey, sugar) and holy water bath (Abhisheka) to the deity.`
    },
    actionGuide: {
      kn: "ವಿಗ್ರಹವಿದ್ದರೆ ಜಲ ಪ್ರೋಕ್ಷಿಸಿ ಅಥವಾ ತುಳಸಿ/ಹೂವಿನಿಂದ ಸಾಂಕೇತಿಕವಾಗಿ ನೀರನ್ನು ಚಿಮುಕಿಸಿ.",
      hi: "मूर्ति पर जल अर्पित करें अथवा पुष्प से सांकेतिक स्नान कराएं।",
      te: "విగ్రహంపై జలాన్ని ప్రోక్షించండి లేదా పుష్పంతో అభిషేకం సమర్పించండి.",
      ta: "சிலை இருந்தால் தீர்த்தம் விடவும், அல்லது மலரால் நீரினைத் தெளிக்கவும்.",
      en: "Gently sprinkle holy water with a flower or tulasi leaf onto the idol/yantra."
    },
    spiritualSignificance: {
      kn: "ಆತ್ಮ ಶುದ್ಧಿ, ಮನಃ ಶಾಂತಿ ಮತ್ತು ಸರ್ವ ಪಾಪ ನಿವಾರಣೆ.",
      hi: "आत्म शुद्धि, मानसिक शांति एवं समस्त पापों का प्रक्षालन।",
      te: "ఆత్మ శుద్ధి, మనశ్శాంతి మరియు పాప నివారణ.",
      ta: "ஆத்ம சுத்தி, மன அமைதி மற்றும் பாப விமோசனம்.",
      en: "Washes away karmic burdens and brings immense spiritual tranquility."
    }
  },
  {
    step: 10,
    key: "vastra",
    titleKn: "೧೦. ವಸ್ತ್ರ & ಯಜ್ಞೋಪವೀತ ಸಮರ್ಪಣೆ",
    titleEn: "10. Vastra & Sacred Thread Offering",
    titleHi: "१०. वस्त्र एवं यज्ञोपवीत समर्पण",
    titleTe: "10. వస్త్ర & యజ్ఞోపవీత సమర్పణ",
    titleTa: "10. வஸ்திரம் & பூணூல் சமர்ப்பணம்",
    icon: "🧣",
    visualEffect: "vastra",
    sanskritMantra: "ಸರ್ವಭೂಷಾಧಿಕೇ ಸೌಮ್ಯೇ ಲೋಕಲಜ್ಜಾ ನಿವಾರಣೇ । ಮಯೋಪಪಾದಿತೇ ತುಭ್ಯಂ ಗೃಹಾಣ ವಸನೇ ಶುಭೇ ॥ ವಸ್ತ್ರೋಪವಸ್ತ್ರಾರ್ಥಂ ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ ॥",
    narrationText: {
      kn: `ದೇವರಿಗೆ ಪವಿತ್ರ ವಸ್ತ್ರ, ಗೆಜ್ಜೆವಸ್ತ್ರ ಹಾಗೂ ಯಜ್ಞೋಪವೀತವನ್ನು ಸಮರ್ಪಿಸಿ.`,
      hi: `भगवान को दिव्य वस्त्र, मौली एवं पवित्र यज्ञोपवीत (जनेऊ) श्रद्धापूर्वक अर्पित करें।`,
      te: `స్వామికి పవిత్ర వస్త్రం, గజ్జెల వస్త్రం మరియు యజ్ఞోపవీతాన్ని సమర్పించండి.`,
      ta: `இறைவனுக்குப் புனித வஸ்திரம், பருத்தி ஆடை மற்றும் பூணூல் சமர்ப்பிக்கவும்.`,
      en: `Offer sacred cotton vastra, ornamental vastra, and the holy thread (Yajnopavita) to the deity.`
    },
    actionGuide: {
      kn: "ಹತ್ತಿಯ ಗೆಜ್ಜೆವಸ್ತ್ರ ಅಥವಾ ಕೆಂಪು/ಹಳದಿ ಅಕ್ಷತೆಯನ್ನು ವಸ್ತ್ರರೂಪದಲ್ಲಿ ದೇವರಿಗೆ ಹಾಕಿ.",
      hi: "कपास का वस्त्र अथवा रोली-अक्षत को वस्त्र स्वरूप में भगवान को अर्पित करें।",
      te: "పత్తి గజ్జెల వస్త్రం లేదా అక్షతలను వస్త్ర రూపంలో స్వామికి సమర్పించండి.",
      ta: "பருத்தி ஆடை அல்லது அட்சதையை ஆடை வடிவில் இறைவனுக்குச் சார்த்தவும்.",
      en: "Place cotton vastra or consecrated akshata as an offering of divine garments."
    },
    spiritualSignificance: {
      kn: "ಮಾನ, ಗೌರವ, ಐಶ್ವರ್ಯ ಹಾಗೂ ಲೌಕಿಕ-ಆಧ್ಯಾತ್ಮಿಕ ರಕ್ಷಣೆ.",
      hi: "सम्मान, प्रतिष्ठा, ऐश्वर्य एवं आध्यात्मिक सुरक्षा।",
      te: "గౌరవం, ఐశ్వర్యం మరియు ఆధ్యాత్మిక రక్షణ.",
      ta: "மரியாதை, ஐஸ்வர்யம் மற்றும் ஆன்மீகப் பாதுகாப்பு.",
      en: "Bestows dignity, honor, prosperity, and divine spiritual protection."
    }
  },
  {
    step: 11,
    key: "gandha",
    titleKn: "೧೧. ಗಂಧ, ಚಂದನ, ಕುಂಕುಮ ಲೇಪನ",
    titleEn: "11. Gandha, Chandana, Haridra & Kumkuma",
    titleHi: "११. गंध, चन्दन, हरिद्रा एवं कुमकुम",
    titleTe: "11. గంధం, చందనం, పసుపు & కుంకుమ",
    titleTa: "11. சந்தனம், மஞ்சள் & குங்குமக் காப்பு",
    icon: "🟡",
    visualEffect: "gandha",
    sanskritMantra: "ಶ್ರೀಖಂಡಂ ಚಂದನಂ ದಿವ್ಯಂ ಗಂಧಾಢ್ಯಂ ಸುಮನೋಹರಮ್ । ವಿಲೇಪನಂ ಸುರಶ್ರೇಷ್ಠ ಚಂದನಂ ಪ್ರತಿಗೃಹ್ಯತಾಮ್ ॥ ಗಂಧದ್ವಾರಾಂ ದುರಾಧರ್ಷಾಂ ನಿತ್ಯಪುಷ್ಟಾಂ ಕರೀಷಿಣೀಮ್ ॥",
    narrationText: {
      kn: `ಪವಿತ್ರ ಶ್ರೀಗಂಧ, ಅರಿಶಿಣ ಹಾಗೂ ಕುಂಕುಮವನ್ನು ದೇವರಿಗೆ ಭಕ್ತಿಪೂರ್ವಕವಾಗಿ ಲೇಪಿಸಿ.`,
      hi: `भगवान के श्रीचरणों एवं मस्तक पर सुगन्धित चन्दन, हरिद्रा एवं पावन कुमकुम का तिलक लगाएं।`,
      te: `స్వామివారికి పరిమళభరిత చందనం, పసుపు మరియు కుంకుమను భక్తితో లేపనం చేయండి.`,
      ta: `இறைவனுக்கு நறுமண சந்தனம், மஞ்சள் மற்றும் குங்குமத் திலகம் இட்டு வழிபடவும்.`,
      en: `Apply fragrant Sandalwood paste (Chandana), auspicious Turmeric (Haridra), and Vermilion (Kumkuma) to the deity.`
    },
    actionGuide: {
      kn: "ಬಲಗೈ ಉಂಗುರದ ಬೆರಳಿನಿಂದ ಗಂಧ ಮತ್ತು ಕುಂಕುಮದ ತಿಲಕವನ್ನು ದೇವರಿಗೆ ಇಡಿ.",
      hi: "अनामिका अंगुली से भगवान को चन्दन और कुमकुम का तिलक लगाएं।",
      te: "ఉంగరపు వేలితో గంధం మరియు కుంకుమ తిలకాన్ని స్వామికి పెట్టండి.",
      ta: "மோதிர விரலால் சந்தனம் மற்றும் குங்குமப் பொட்டு வைக்கவும்.",
      en: "Apply holy Chandana and Kumkuma to the deity using your ring finger."
    },
    spiritualSignificance: {
      kn: "ಆಜ್ಞಾ ಚಕ್ರ ಜಾಗೃತಿ, ಸೌಭಾಗ್ಯ ಹಾಗೂ ತಂಪಾದ ಶಾಂತಿ ಮನೋಭಾವ.",
      hi: "आज्ञा चक्र का जागरण, सौभाग्य वृद्धि एवं मन की शीतलता।",
      te: "సౌభాగ్య వృద్ధి, ఆజ్ఞా చక్ర జాగృతి మరియు ప్రశాంతత.",
      ta: "சௌபாக்ய விருத்தி, ஆக்ஞா சக்கர விழிப்புணர்வு மற்றும் அமைதி.",
      en: "Cools the mind, activates the third-eye chakra, and invites auspicious luck."
    }
  },
  {
    step: 12,
    key: "akshata",
    titleKn: "೧೨. ಅಕ್ಷತೆ, ಪುಷ್ಪಾರ್ಚನೆ & ಅಷ್ಟೋತ್ತರ ಜಪ",
    titleEn: "12. Akshataradhana, Pushparchana & Ashtottara",
    titleHi: "१२. अक्षत, पुष्पार्चन एवं अष्टोत्तर जप",
    titleTe: "12. అక్షతలు, పుష్పార్చన & అష్టోత్తర జపం",
    titleTa: "12. அட்சதை, புஷ்பார்ச்சனை & அஷ்டோத்திரம்",
    icon: "🌸",
    visualEffect: "akshata",
    sanskritMantra: "ಮಾಲ್ಯಾದೀನಿ ಸುಗಂಧೀನಿ ಮಾಲತ್ಯಾದೀನಿ ವೈ ಪ್ರಭೋ । ಮಯಾಹೃತಾನಿ ಪೂಜಾರ್ಥಂ ಪುಷ್ಪಾಣಿ ಪ್ರತಿಗೃಹ್ಯತಾಮ್ ॥ ನಾನಾವಿಧ ಪರಿಮಳ ಪತ್ರ ಪುಷ್ಪಾಣಿ ಮಂಗಳಾಕ್ಷತಾಂ ಸಮರ್ಪಯಾಮಿ ॥",
    narrationText: {
      kn: `ಪರಿಮಳಯುಕ್ತ ಪುಷ್ಪಗಳು, ಬಿಲ್ವಪತ್ರೆ ಹಾಗೂ ಮಂಗಳಾಕ್ಷತೆಯನ್ನು ದೇವರಿಗೆ ಒಂದೊಂದಾಗಿ ಅರ್ಪಿಸುತ್ತಾ ಇಷ್ಟದೇವತಾ ನಾಮಾವಳಿಯನ್ನು ಜಪಿಸಿ.`,
      hi: `सुगन्धित ताजे पुष्प, बिल्वपत्र एवं अक्षत भगवान के चरणों में समर्पित करते हुए दिव्य नाम-जप करें।`,
      te: `సుగంధ పుష్పాలు, బిల్వపత్రాలు మరియు అక్షతలను స్వామివారి పాదాలకు అర్పిస్తూ దివ్య నామావళిని జపించండి.`,
      ta: `நறுமண மலர்கள், வில்வ இலைகள் மற்றும் அட்சதையை இறைவனின் பாதங்களில் சமர்ப்பித்து நாம ஜபம் செய்யவும்.`,
      en: `Offer fragrant fresh flowers, sacred Bilva/Tulasi leaves, and akshata at the deity's feet while chanting divine names.`
    },
    actionGuide: {
      kn: "ಹೂವು ಮತ್ತು ಅಕ್ಷತೆಯನ್ನು ದೇವತಾ ಮೂರ್ತಿಯ ಪಾದಗಳಿಗೆ ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ.",
      hi: "पुष्प और अक्षत को भगवान के चरणों में श्रद्धा से अर्पित करें।",
      te: "పువ్వులు మరియు అక్షతలను స్వామివారి పాదాల వద్ద భక్తితో సమర్పించండి.",
      ta: "மலர்கள் மற்றும் அட்சதையை இறைவனின் திருவடிகளில் அர்ப்பணிக்கவும்.",
      en: "Gently place fresh fragrant flowers and akshata grains at the feet of the Lord."
    },
    spiritualSignificance: {
      kn: "ಹೃದಯ ಕಮಲ ವಿಕಸನ, ಭಕ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಇಷ್ಟಾರ್ಥ ಪ್ರಾಪ್ತಿ.",
      hi: "हृदय कमल का प्रफुल्लन, अनन्य भक्ति एवं समस्त मनोकामना पूर्ति।",
      te: "భక్తి భావం, హృదయ వికాసం మరియు సకల మనోరథ ప్రాప్తి.",
      ta: "பக்தி உணர்வு, இதய மலர்ச்சி மற்றும் சகல காரிய வெற்றி.",
      en: "Blossoms the spiritual heart center and connects deeply with divine grace."
    }
  },
  {
    step: 13,
    key: "dhoopa",
    titleKn: "೧೩. ಧೂಪ & ದೀಪ ದರ್ಶನ",
    titleEn: "13. Dhoopa & Deepa Darshana",
    titleHi: "१३. धूप एवं दीप दर्शन",
    titleTe: "13. ధూప & దీప దర్శనం",
    titleTa: "13. தூப & தீப தரிசனம்",
    icon: "💨",
    visualEffect: "dhoopa",
    sanskritMantra: "ವನಸ್ಪತಿ ರಸೋತ್ಪನ್ನೋ ಗಂಧಾಢ್ಯೋ ಗಂಧ ಉತ್ತಮಃ । ಆಘ್ರೇಯಃ ಸರ್ವದೇವಾನಾಂ ಧೂಪೋಯಂ ಪ್ರತಿಗೃಹ್ಯತಾಮ್ ॥ ಸಾಕ್ಷಾತ್ ದೀಪಂ ದರ್ಶಯಾಮಿ ॥",
    narrationText: {
      kn: `ಸುಗಂಧಭರಿತ ಧೂಪವನ್ನು ಮತ್ತು ಬೆಳಗುತ್ತಿರುವ ದೀಪವನ್ನು ದೇವರ ಸಮ್ಮುಖದಲ್ಲಿ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಬೆಳಗಿಸಿ ತೋರಿಸಿ.`,
      hi: `सुगन्धित धूप-अगरबत्ती एवं प्रज्वलित दीप को भगवान के सम्मुख प्रदक्षिणा भाव से घुमाकर दर्शन कराएं।`,
      te: `పరిమళ ధూపాన్ని మరియు వెలుగుతున్న దీపాన్ని స్వామి సముఖంలో ప్రదక్షిణాకారంగా చూపి దర్శనం చేయించండి.`,
      ta: `நறுமண தூபத்தையும் தீபத்தையும் இறைவனின் திருமுன்னே வலஞ்சுழியாக காட்டி வழிபடவும்.`,
      en: `Wave the fragrant incense (Dhoopa) and radiant oil lamp (Deepa) in clockwise circles before the deity.`
    },
    actionGuide: {
      kn: "ಧೂಪದ ಕಡ್ಡಿ ಅಥವಾ ಧೂಪಾರತಿಯನ್ನು ದೇವರ ಮುಂದೆ ೩ ಬಾರಿ ಪ್ರದಕ್ಷಿಣಾಕಾರವಾಗಿ ಬೆಳಗಿಸಿ.",
      hi: "धूपबत्ती को भगवान के आगे ३ बार वृत्ताकार घुमाएं।",
      te: "ధూపపు కడ్డీలను స్వామి ముందు 3 సార్లు వలయాకారంగా తిప్పండి.",
      ta: "தூபக் குச்சிகளை இறைவனின் திருமுன் 3 முறை சுழற்றிக் காட்டவும்.",
      en: "Wave the incense sticks in three gentle clockwise circles in front of the altar."
    },
    spiritualSignificance: {
      kn: "ಪ್ರಾಣ ಶಕ್ತಿ ಶುದ್ಧೀಕರಣ ಹಾಗೂ ವಾಯು ಮಂಡಲ ದೈವೀಕರಣ.",
      hi: "प्राण शक्ति की शुद्धि एवं वातावरण में सकारात्मक ऊर्जा का संचार।",
      te: "ప్రాణ శక్తి శుద్ధి మరియు వాతావరణంలో దైవిక శక్తి ప్రసారం.",
      ta: "பிராண சக்தி சுத்தி மற்றும் தெய்வீக ஆற்றல் பரவுதல்.",
      en: "Cleanses the atmospheric prana and infuses the home with fragrant holiness."
    }
  },
  {
    step: 14,
    key: "naivedya",
    titleKn: "೧೪. ಮಹಾ ನೈವೇದ್ಯ, ತಾಂಬೂಲ & ಫಲ ಸಮರ್ಪಣೆ",
    titleEn: "14. Maha Naivedya, Phala & Tamboola",
    titleHi: "१४. महा नैवेद्य, फल एवं ताम्बूल समर्पण",
    titleTe: "14. మహా నైవేద్యం, పండ్లు & తాంబూలం",
    titleTa: "14. மகா நைவேத்யம், பழம் & தாம்பூலம்",
    icon: "🍎",
    visualEffect: "naivedya",
    sanskritMantra: "ಓಂ ಭೂರ್ಭುವಸ್ಸ್ವಃ । ತತ್ಸವಿತುರ್ವರೇಣ್ಯಂ ಭರ್ಗೋ ದೇವಸ್ಯ ಧೀಮಹಿ । ಧಿಯೋ ಯೋ ನಃ ಪ್ರಚೋದಯಾತ್ ॥ ಸತ್ಯಂ ತ್ವರ್ತೇನ ಪರಿಷಿಂಚಾಮಿ । ಅಮೃತೋಪಸ್ತರಣಮಸಿ ಸ್ವಾಹಾ । ಪ್ರಾಣಾಯ ಸ್ವಾಹಾ, ಅಪಾನಾಯ ಸ್ವಾಹಾ, ವ್ಯಾನಾಯ ಸ್ವಾಹಾ, ಉದಾನಾಯ ಸ್ವಾಹಾ, ಸಮಾನಾಯ ಸ್ವಾಹಾ, ಬ್ರಹ್ಮಣೇ ಸ್ವಾಹಾ ॥ ಮಹಾ ನೈವೇದ್ಯಂ ನಿವೇದಯಾಮಿ ॥",
    narrationText: {
      kn: `ಪವಿತ್ರ ಹಣ್ಣು-ಹಂಪಲು, ಹಾಲು, ಬೆಲ್ಲ ಅಥವಾ ಶುದ್ಧ ನೈವೇದ್ಯವನ್ನು ದೇವರಿಗೆ ಪ್ರೀತಿಯಿಂದ ಸಮರ್ಪಿಸಿ, ತೃಪ್ತಿ ಪಡಿಸಿ.`,
      hi: `पवित्र फल, दूध, मिष्ठान्न, नैवेद्य एवं ताम्बूल (पान-सुपारी) भगवान को प्रेमपूर्वक भोग लगाएं।`,
      te: `పవిత్ర ఫలాలు, పాలు, బెల్లం లేదా నైవేద్యాన్ని భగవంతునికి ప్రీతిపూర్వకంగా సమర్పించండి.`,
      ta: `புனித கனிகள், பால், நிவேதனப் பொருட்கள் மற்றும் தாம்பூலத்தை இறைவனுக்கு அன்புடன் அர்ப்பணிக்கவும்.`,
      en: `Offer pure satvik food, fruits, milk/jaggery, and betel leaves (Tamboola) as sacred Maha Naivedya.`
    },
    actionGuide: {
      kn: "ನೈವೇದ್ಯದ ಸುತ್ತ ಉದ್ಧರಣೆಯಿಂದ ನೀರನ್ನು ೩ ಬಾರಿ ಪ್ರದಕ್ಷಿಣವಾಗಿ ಸುತ್ತಿಸಿ, ದೇವರಿಗೆ ತೋರಿಸಿ.",
      hi: "नैवेद्य की थाली के चारों ओर तीन बार जल घुमाकर भगवान को अर्पित करें।",
      te: "నైవేద్యం చుట్టూ ఉద్ధరణితో నీటిని 3 సార్లు తిప్పి స్వామికి చూపించండి.",
      ta: "நைவேத்யத் தட்டைச் சுற்றி 3 முறை தீர்த்தம் சுற்றி இறைவனுக்கு நிவேதனம் செய்யவும்.",
      en: "Circle a spoon of holy water 3 times clockwise around the food plate while offering."
    },
    spiritualSignificance: {
      kn: "ಅನ್ನಪೂರ್ಣಾ ಸಿದ್ಧಿ, ದಾರಿದ್ರ್ಯ ನಾಶ ಹಾಗೂ ಕುಟುಂಬ ತೃಪ್ತಿ.",
      hi: "अन्नपूर्णा कृपा, दरिद्रता का नाश एवं परिवार में पोषण-तृप्ति।",
      te: "అన్నపూర్ణా దేవి అనుగ్రహం మరియు దారిద్ర్య నాశనం.",
      ta: "அன்னபூரணியின் அருள், வறுமை நீக்கம் மற்றும் மனநிறைவு.",
      en: "Blesses the home with inexhaustible nourishment, health, and satisfaction."
    }
  },
  {
    step: 15,
    key: "arathi",
    titleKn: "೧೫. ಮಹಾ ಮಂಗಳಾರತಿ & ಕರ್ಪೂರ ನೀರಾಜನ",
    titleEn: "15. Maha Mangalarathi & Karpoora Neerajana",
    titleHi: "१५. महा मंगलारती एवं कर्पूर नीराजन",
    titleTe: "15. మహా మంగళారతి & కర్పూర నీరాజనం",
    titleTa: "15. மகா மங்களாரத்தி & கற்பூர தீபம்",
    icon: "🔥",
    visualEffect: "arathi",
    sanskritMantra: "ಕರ್ಪೂರ ಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರ ಸಾರಂ ಭುಜಗೇಂದ್ರ ಹಾರಮ್ । ಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀ ಸಹಿತಂ ನಮಾಮಿ ॥ ಓಂ ರಾಜಾಧಿರಾಜಾಯ ಪ್ರಸಹ್ಯ ಸಾಹಿನೇ ನಮೋ ವಯಂ ವೈಶ್ರವಣಾಯ ಕುರ್ಮಹೇ ॥ ಮಹಾ ಮಂಗಳಾರತಿಂ ಸಮರ್ಪಯಾಮಿ ॥",
    narrationText: {
      kn: `ಮಹಾ ಮಂಗಳಾರತಿ ಮತ್ತು ಕರ್ಪೂರ ನೀರಾಜನವನ್ನು ಘಂಟಾನಾದದೊಂದಿಗೆ ದೇವರಿಗೆ ಬೆಳಗಿಸಿ, ಕಣ್ತುಂಬಿ ದರ್ಶನ ಪಡೆಯಿರಿ.`,
      hi: `घण्टानाद एवं जयघोष के साथ भगवान की दिव्य कर्पूर आरती एवं मंगलारती कर दर्शन करें।`,
      te: `ఘంటానాదంతో స్వామివారికి దివ్య కర్పూర ఆరతి మరియు మహా మంగళారతి ఇచ్చి దర్శించుకోండి.`,
      ta: `மணி ஓசையுடன் இறைவனுக்கு மகா மங்களாரத்தி மற்றும் கற்பூர தீபாராதனை காட்டி கண்குளிரத் தரிசிக்கவும்.`,
      en: `Perform the grand camphor Mangalarathi (Neerajana) with jubilant bell chimes, taking in the radiant divine glow.`
    },
    actionGuide: {
      kn: "ಕರ್ಪೂರ ಹಚ್ಚಿ ಆರತಿ ತಟ್ಟೆಯನ್ನು ಘಂಟೆ ಬಾರಿಸುತ್ತಾ ದೇವರ ಮುಂದೆ ಭಕ್ತಿಯಿಂದ ೩ ಬಾರಿ ಬೆಳಗಿಸಿ.",
      hi: "कर्पूर जलाकर आरती की थाल को घण्टी बजाते हुए भगवान के सम्मुख घुमाएं।",
      te: "కర్పూరం వెలిగించి గంట మ్రోగిస్తూ ఆరతి పళ్ళేన్ని స్వామి ఎదుట 3 సార్లు తిప్పండి.",
      ta: "கற்பூரம் ஏற்றி மணி அடித்தபடி ஆரத்தித் தட்டை இறைவனின் முன் 3 முறை சுழற்றிக் காட்டவும்.",
      en: "Light the camphor, ring the bell with your left hand, and circle the arathi plate with devotion."
    },
    spiritualSignificance: {
      kn: "ಸರ್ವ ತಮೋ ನಿವಾರಣೆ, ದೈವಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ಮಹಾ ಸಾಕ್ಷಾತ್ಕಾರ.",
      hi: "अंधकार का संपूर्ण शमन, दिव्य तेज एवं आत्मिक साक्षात्कार।",
      te: "చీకటి తొలగింపు, దివ్య తేజస్సు మరియు భగవత్ సాక్షాత్కారం.",
      ta: "இருள் விலகுதல், தெய்வீக ஒளி மற்றும் இறை அருள் பெறுதல்.",
      en: "The supreme highlight of the pooja, eradicating negative auras and filling the soul with light."
    }
  },
  {
    step: 16,
    key: "namaskara",
    titleKn: "೧೬. ಪ್ರದಕ್ಷಿಣ, ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ & ಆಶೀರ್ವಾದ",
    titleEn: "16. Pradakshina, Sashtanga Namaskara & Final Benediction",
    titleHi: "१६. प्रदक्षिणा, साष्टांग प्रणाम एवं आशीर्वाद",
    titleTe: "16. ప్రదక్షిణ, సాష్టాంగ నమస్కారం & ఆశీర్వచనం",
    titleTa: "16. பிரதக்ஷிணம், சாஷ்டாங்க நமஸ்காரம் & ஆசீர்வாதம்",
    icon: "🙏",
    visualEffect: "namaskara",
    sanskritMantra: `ಯಾನಿ ಕಾನಿ ಚ ಪಾಪಾನಿ ಜನ್ಮಾಂತರ ಕೃತಾನಿ ಚ । ತಾನಿ ತಾನಿ ಪ್ರಣಶ್ಯಂತಿ ಪ್ರದಕ್ಷಿಣ ಪದೇ ಪದೇ ॥ ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ । ಕರೋಮಿ ಯದ್ಯತ್ ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥ ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ॥`,
    narrationText: {
      kn: `ಸ್ಥಳದಲ್ಲೇ ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಮಾಡಿ, ಮಂಗಳಾರತಿಯ ಪವಿತ್ರ ಜ್ಯೋತಿಯನ್ನು ಕಣ್ಣುಗಳಿಗೆ ಸ್ಪರ್ಶಿಸಿ, ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕರಿಸಿ. ಮುಖ್ಯ ಅರ್ಚಕ ${priestName} ಅವರಿಂದ ಸನ್ನಿಧಿ ಆಶೀರ್ವಚನ: ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಕೃಪೆಯಿಂದ ನಿಮಗೆ ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಆಯುರಾರೋಗ್ಯ, ಸುಖ-ಶಾಂತಿ ಮತ್ತು ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿ. ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ.`,
      hi: `स्थान पर ही ३ बार प्रदक्षिणा करें, आरती की दिव्य ज्योति को नेत्रों से लगाएं और साष्टांग प्रणाम करें। मुख्य अर्चक ${priestName} जी का आशीर्वाद: भगवान गोकर्ण महाबलेश्वर आपके सम्पूर्ण परिवार को दीर्घायु, स्वास्थ्य, सुख-समृद्धि एवं सर्व कार्य सिद्धि प्रदान करें।`,
      te: `ఉన్న చోటనే 3 సార్లు ప్రదక్షిణ చేసి, హారతిని కళ్ళకు అద్దుకొని సాష్టాంగ నమస్కారం చేయండి. ముఖ్య అర్చకులు ${priestName} గారి ఆశీర్వచనం: శ్రీ మహాబలేశ్వర స్వామి మీ కుటుంబానికి ఆయురారోగ్యాలు, సుఖశాంతులు మరియు సర్వ కార్య సిద్ధిని ప్రసాదించుగాక.`,
      ta: `நின்ற இடத்திலேயே 3 முறை பிரதக்ஷிணம் செய்து, தீப ஒளியைக் கண்களில் ஒற்றிக் கொண்டு சாஷ்டாங்கமாக நமஸ்கரிக்கவும். தலைமை அர்ச்சகர் ${priestName} அவர்களின் ஆசீர்வாதம்: உங்கள் குடும்பத்திற்கு நீண்ட ஆயுள், ஆரோக்கியம், அமைதி மற்றும் சகல நலன்களும் உண்டாகட்டும்.`,
      en: `Perform three self-turns (Pradakshina), accept the sacred arathi warmth to your eyes, and bow down in Sashtanga Namaskara. Divine Benediction by Chief Priest ${priestName}: May Lord Mahabaleshwara bless ${devoteeName} and your entire family with longevity, supreme health, peace, prosperity, and success.`
    },
    actionGuide: {
      kn: "ಸ್ಥಳದಲ್ಲೇ ೩ ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಹಾಕಿ, ಆರತಿ ತೆಗೆದುಕೊಂಡು ಸಾಷ್ಟಾಂಗವಾಗಿ ನಮಸ್ಕರಿಸಿ.",
      hi: "स्थान पर ३ बार परिक्रमा करें, आरती लें और साष्टांग प्रणाम करें।",
      te: "అక్కడే 3 సార్లు ప్రదక్షిణ చేసి, హారతి తీసుకొని సాష్టాంగ నమస్కారం చేయండి.",
      ta: "நின்ற இடத்திலேயே 3 முறை சுற்றி, ஆரத்தி எடுத்து சாஷ்டாங்கமாக வணங்கவும்.",
      en: "Turn around clockwise 3 times, take the warm blessing of the arathi flame to your eyes, and prostrate with deep humility."
    },
    spiritualSignificance: {
      kn: "ಪೂರ್ಣ ಪೂಜಾ ಫಲ ಸಿದ್ಧಿ, ಅಹಂಕಾರ ವಿಸರ್ಜನೆ ಹಾಗೂ ಈಶ್ವರಾನುಗ್ರಹ ಪ್ರಾಪ್ತಿ.",
      hi: "सम्पूर्ण पूजा फल की प्राप्ति, अहंकार का विसर्जन एवं भगवत्कृपा।",
      te: "సంపూర్ణ పూజా ఫల ప్రాప్తి, అహంకార విసర్జన మరియు ఈశ్వరానుగ్రహం.",
      ta: "முழு பூஜை பலன், அகந்தை நீக்கம் மற்றும் இறை அருள் பெறுதல்.",
      en: "Seals the 20-minute pooja with total fulfillment and eternal divine blessing."
    }
  }
];
