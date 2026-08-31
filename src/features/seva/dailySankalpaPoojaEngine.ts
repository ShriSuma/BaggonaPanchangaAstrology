/**
 * Authentic 3-to-5 Minute Daily Vedic Sankalpa & Deva Pooja Engine (ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜಾ ವಿಧಿ)
 * 
 * Rooted in the sacred Smartha & Vedic Gokarna Kshetra tradition:
 * 1. Deepa Prajwalane & Mindful Prayer (Lighting the Sanctum Lamp & Reverence to the Divine Light)
 * 2. Guru & Ganapati Invocation (Taking Sacred Akshata in Hand)
 * 3. Maha Vedic Sankalpa (Live Desha-Kaala + Devotee Janma Details + Personal Active Sankalpas)
 * 4. Sankalpa Samarpanam (Offering Sacred Akshata & Flowers to God's Lotus Feet)
 * 5. Deeparadhana (Mangalarati), Sashtanga Namaskara & Shanti Prayer
 * 
 * Perfect 3 to 5 minute Satvik morning worship flow for devotees with active priest voice recitation.
 */

import type { SevaLang } from "./sevaLocale";
import type { UserSankalpaRecord } from "../../db/indexedDb";

export interface DailyPoojaStep {
  step: number;
  key: "deepa_achamana" | "guru_ganapati" | "maha_sankalpa" | "sankalpa_samarpana" | "deeparadhana_namaskara";
  titleKn: string;
  titleEn: string;
  titleHi: string;
  titleTe: string;
  titleTa: string;
  icon: string;
  approxSeconds: number;
  sanskritMantra: string;
  narrationText: Record<SevaLang, string>;
  actionGuide: Record<SevaLang, string>;
  spiritualSignificance: Record<SevaLang, string>;
  visualEffect: "deepa" | "ganesha" | "sankalpa" | "akshata" | "arathi";
}

export interface BuildDailyPoojaParams {
  devoteeName: string;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  priestName?: string;
  lang?: SevaLang;
  samvatsara?: string;
  ayana?: string;
  ritu?: string;
  masa?: string;
  paksha?: string;
  tithi?: string;
  vasara?: string;
  nakshatra?: string;
  activeSankalpas?: UserSankalpaRecord[];
}

export function buildDailyPoojaSteps(params: BuildDailyPoojaParams): DailyPoojaStep[] {
  const {
    devoteeName = "ಭಕ್ತ",
    gotra = "ಕಾಶ್ಯಪ",
    rashiName = "ಧನು",
    nakshatraName = "ಮೂಲ",
    priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
    samvatsara = "ಪರಾಭವ",
    ayana = "ದಕ್ಷಿಣಾಯನ",
    ritu = "ವರ್ಷ ಋತು",
    masa = "ಶ್ರಾವಣ ಮಾಸ",
    paksha = "ಶುಕ್ಲ ಪಕ್ಷ",
    tithi = "ಏಕಾದಶೀ",
    vasara = "ಭೃಗುವಾಸರ",
    nakshatra = "ಮೂಲಾ",
    activeSankalpas = []
  } = params;

  // Compile user's active personal sankalpa phrases for dynamic mantra insertion
  const activePhrasesSanskrit = activeSankalpas.length > 0
    ? activeSankalpas.filter((s) => s.isActive).map((s) => s.sanskritPhrasing || s.title).join(", ")
    : "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ, ಸರ್ವಾಭೀಷ್ಟ ಸಿದ್ಧ್ಯರ್ಥಂ";

  const activePhrasesKannada = activeSankalpas.length > 0
    ? activeSankalpas.filter((s) => s.isActive).map((s) => s.title).join(" · ")
    : "ಕುಟುಂಬದ ಸಕಲ ಆರೋಗ್ಯ, ಮನಶ್ಶಾಂತಿ ಹಾಗೂ ಸಕಲ ಸತ್ಕಾರ್ಯ ಸಿದ್ಧಿ";

  return [
    // ── STEP 1: DEEPA PRAJWALANE & MINDFUL PRAYER (~45s) ──
    {
      step: 1,
      key: "deepa_achamana",
      titleKn: "೧. ದೀಪ ಪ್ರಜ್ವಲನೆ & ಭಕ್ತಿಪೂರ್ವಕ ಪ್ರಾರ್ಥನೆ",
      titleEn: "1. Lighting Sacred Lamp & Mindful Prayer",
      titleHi: "१. दीप प्रज्वलन एवं पावन प्रार्थना",
      titleTe: "1. దీప ప్రజ్వలన & భక్తి ప్రార్థన",
      titleTa: "1. திருவிளக்கு ஏற்றுதல் & பக்தி பிரார்த்தனை",
      icon: "🪔",
      approxSeconds: 45,
      visualEffect: "deepa",
      sanskritMantra: `ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ ।
ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥
ಶುಭಂ ಕರೋತಿ ಕಲ್ಯಾಣಂ ಆರೋಗ್ಯಂ ಧನಸಂಪದಃ ।
ಶತ್ರುಬುದ್ಧಿ ವಿನಾಶಾಯ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥`,
      narrationText: {
        kn: `ಹರಿ ಓಂ. ಮುಂಜಾನೆಯ ಪವಿತ್ರ ನಿತ್ಯ ಸಂಕಲ್ಪ ಮತ್ತು ದೇವ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ದೇವರ ಮುಂದೆ ಶುದ್ಧ ಎಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಬೆಳಗಿಸಿ. ಎರಡು ಕೈಗಳನ್ನು ಮುಗಿದು ದೀಪಜ್ಯೋತಿಗೆ ನಮಸ್ಕರಿಸಿ ಶಾಂತ ಮನಸ್ಸಿನಿಂದ ಕುಳಿತುಕೊಳ್ಳಿ.`,
        hi: `हरि ॐ। प्रातःकालीन पावन नित्य संकल्प एवं देव पूजा में आपका स्वागत है। सर्वप्रथम पूजा स्थान में शुद्ध घी या तेल का पावन दीप प्रज्वलित करें। हाथ जोड़कर दीपज्योति को श्रद्धापूर्वक नमन करें।`,
        te: `హరి ఓం. ఉదయపు పవిత్ర నిత్య సంకల్పం మరియు దేవ పూజకు స్వాగతం. పూజా మందిరంలో స్వచ్ఛమైన నెయ్యి లేదా నూనెతో దీపాన్ని వెలిగించండి. చేతులు జోడించి దీపజ్యోతికి నమస్కరించండి.`,
        ta: `ஹரி ஓம். காலை புனித நித்ய சங்கல்பம் மற்றும் இறை பூஜைக்கு நல்வரவு. முதலில் பூஜை அறையில் தூய நெய் அல்லது நல்லெண்ணெய் தீபம் ஏற்றவும். இரு கைகூப்பி தீபஜோதியை வணங்கவும்.`,
        en: `Hari Om. Welcome to the sacred 3-5 minute Daily Vedic Sankalpa & Pooja. Light the altar lamp with pure oil or cow's ghee, fold your hands in reverence to the Divine Light, and sit with a peaceful, focused mind.`
      },
      actionGuide: {
        kn: "ದೇವರ ಮಂಟಪದಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸಿ, ಎರಡು ಕೈಗಳನ್ನು ಮುಗಿದು ಭಕ್ತಿಯಿಂದ ನಮಸ್ಕರಿಸಿ.",
        hi: "पूजा स्थल में दीप प्रज्वलित करें, हाथ जोड़कर श्रद्धापूर्वक नमन करें।",
        te: "పూజా మందిరంలో దీపం వెలిగించి, రెండు చేతులు జోడించి భక్తితో నమస్కరించండి.",
        ta: "பூஜை அறையில் விளக்கேற்றி, இரு கைகூப்பி பக்தியுடன் வணங்கவும்.",
        en: "Light the altar lamp and fold both hands in prayer with reverence and peace."
      },
      spiritualSignificance: {
        kn: "ಅಜ್ಞಾನದ ಕತ್ತಲೆಯನ್ನು ನೀಗಿಸಿ ಜ್ಞಾನ, ಶಾಂತಿ, ಶುಭ ಮತ್ತು ಆರೋಗ್ಯವನ್ನು ಮನೆಯಲ್ಲಿ ನೆಲೆಗೊಳಿಸುವುದು.",
        hi: "अज्ञान रूपी अंधकार को दूर कर ज्ञान, शांति एवं आरोग्यता का संचार करना।",
        te: "అజ్ఞానాన్ని తొలగించి జ్ఞానం, శాంతి, ఆరోగ్యం మరియు శుభాన్ని నింపడం.",
        ta: "அறியாமை நீக்கி ஞானம், அமைதி, ஆரோக்கியம் மற்றும் சுபத்தை நிலைநிறுத்துதல்.",
        en: "Dispels darkness, invokes wisdom, peace, vitality, and fills the home with auspicious cosmic energies."
      }
    },

    // ── STEP 2: GURU & GANAPATI SMARANE & AKSHATA IN HAND (~45s) ──
    {
      step: 2,
      key: "guru_ganapati",
      titleKn: "೨. ಗುರು-ಗಣಪತಿ ಸ್ಮರಣೆ & ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಧಾರಣೆ",
      titleEn: "2. Guru & Ganapati Invocation with Akshata",
      titleHi: "२. गुरु-गणपति स्मरण एवं हाथ में अक्षत धारण",
      titleTe: "2. గురు-గణపతి స్మరణ & చేతిలో అక్షతలు ధారణ",
      titleTa: "2. குரு-கணபதி தியானம் & கையில் அட்சதை ஏந்துதல்",
      icon: "🌺",
      approxSeconds: 45,
      visualEffect: "ganesha",
      sanskritMantra: `ಶುಕ್ಲಾಂಬರಧರಂ ವಿಷ್ಣುಂ ಶಶಿವರ್ಣಂ ಚತುರ್ಭುಜಮ್ ।
ಪ್ರಸನ್ನವದನಂ ಧ್ಯಾಯೇತ್ ಸರ್ವವಿಘ್ನೋಪಶಾಂತಯೇ ॥
ಗುರುರ್ಬ್ರಹ್ಮಾ ಗುರುರ್ವಿಷ್ಣುಃ ಗುರುರ್ದೇವೋ ಮಹೇಶ್ವರಃ ।
ಗುರುಸ್ಸಾಕ್ಷಾತ್ ಪರಬ್ರಹ್ಮ ತಸ್ಮೈ ಶ್ರೀ ಗುರವೇ ನಮಃ ॥
ಅಗಜಾನನ ಪದ್ಮಾರ್ಕಂ ಗಜಾನನಮಹರ್ನಿಶಮ್ ।
ಅನೇಕದಂತಂ ಭಕ್ತಾನಾಂ ಏಕದಂತಮುಪಾಸ್ಮಹೇ ॥`,
      narrationText: {
        kn: `ಈಗ ಬಲಗೈಯಲ್ಲಿ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ತಾಜಾ ಪುಷ್ಪಗಳನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ. ಸಮಸ್ತ ವಿಘ್ನನಿವಾರಕ ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹಾಗೂ ಜ್ಞಾನದಾತೃ ಶ್ರೀ ಸದ್ಗುರುಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ಸ್ಮರಿಸಿ. ಕೈಯಲ್ಲಿ ಹಿಡಿದ ಅಕ್ಷತೆಯೊಂದಿಗೆ ಸಂಕಲ್ಪಕ್ಕೆ ಸಿದ್ಧರಾಗಿ.`,
        hi: `अब दाहिने हाथ में पावन अक्षत एवं ताजे पुष्प धारण करें। विघ्नहर्ता श्री महागणपति एवं ज्ञानदाता श्री सद्गुरु का हृदय से ध्यान करें और पावन संकल्प हेतु सज्ज हों।`,
        te: `ఇప్పుడు కుడి చేతిలో పవిత్ర అక్షతలు మరియు తాజా పువ్వులను తీసుకోండి. సర్వ విఘ్నాలను తొలగించే శ్రీ మహాగణపతిని మరియు శ్రీ సద్గురువులను భక్తితో స్మరించండి.`,
        ta: `இப்போது வலது கையில் புனித அட்சதை மற்றும் மலர்களை ஏந்திக் கொள்ளுங்கள். விக்னங்களை நீக்கும் ஸ்ரீ மஹாகணபதி மற்றும் ஞான குருவை மனதில் தியானித்து சங்கல்பத்திற்கு தயாராகுங்கள்.`,
        en: `Take sacred Akshata (consecrated rice) and fresh flowers into your right hand. Meditate upon Lord Ganesha for obstacle removal and the Guru for divine wisdom. Hold the Akshata in your hand for the sacred Sankalpa.`
      },
      actionGuide: {
        kn: "ಸ್ವಲ್ಪ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಬಲ ಅಂಗೈಯಲ್ಲಿ ಇಟ್ಟುಕೊಂಡು, ಎಡಗೈಯನ್ನು ಕೆಳಗೆ ಆಸರೆಯಾಗಿಟ್ಟು ಎದೆಯ ಹತ್ತಿರ ಗೌರವದಿಂದ ಹಿಡಿಯಿರಿ.",
        hi: "थोड़ा अक्षत और फूल दाहिनी हथेली में रखकर, बाएं हाथ का सहारा देकर हृदय के समीप श्रद्धा से धारण करें।",
        te: "కొన్ని అక్షతలు మరియు పూలను కుడి అరచేతిలో ఉంచి, ఎడమ చేతిని కింద ఆసరాగా ఉంచి హృదయం వద్ద భక్తితో పట్టుకోండి.",
        ta: "சிறிது அட்சதை மற்றும் மலரை வலது உள்ளங்கையில் வைத்து, இடது கையை அடியில் தாங்கி இதயத்திற்கு அருகில் பக்தியுடன் பிடிக்கவும்.",
        en: "Hold a pinch of sacred Akshata and a flower in your right palm, resting gently over the left palm near your heart."
      },
      spiritualSignificance: {
        kn: "ಪ್ರಾರಂಭಿಸುವ ಪೂಜೆ ಹಾಗೂ ದಿನದ ಎಲ್ಲಾ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಘ್ನಗಳು ಪರಿಹಾರವಾಗಿ ಗುರು-ಗಣಪತಿಯ ಸಾಕ್ಷಾತ್ ಅನುಗ್ರಹ ಪ್ರಾಪ್ತಿ.",
        hi: "दिन के समस्त कार्यों में विघ्न निवारण एवं गुरु-गणपति की साक्षात कृपा प्राप्ति।",
        te: "దినచర్యలో సర్వ విఘ్నాలు తొలగి గురు-గణపతుల సాక్షాత్ అనుగ్రహం లభించడం.",
        ta: "அனைத்து காரியங்களிலும் தடைகள் நீங்கி குரு-கணபதியின் அருள் பெறுதல்.",
        en: "Removes all unseen obstacles and connects consciousness to the lineage of wisdom and divine guidance."
      }
    },

    // ── STEP 3: VEDIC MAHA SANKALPA WITH LIVE DESHA-KAALA & USER SANKALPAS (~90s) ──
    {
      step: 3,
      key: "maha_sankalpa",
      titleKn: "೩. ಪಂಚಾಂಗ ಸಹಿತ ಮಹಾ ದೈವಿಕ ಸಂಕಲ್ಪ",
      titleEn: "3. Vedic Desha-Kaala & Devotee Maha Sankalpa",
      titleHi: "३. पंचांग युक्त महा वैदिक संकल्प",
      titleTe: "3. పంచాంగ సహిత మహా వైదిక సంకల్పం",
      titleTa: "3. பஞ்சாங்க சகித மகா வைதீக சங்கல்பம்",
      icon: "📜",
      approxSeconds: 90,
      visualEffect: "sankalpa",
      sanskritMantra: `ಓಂ ಶ್ರೀಮದ್ ಭಗವತೋ ಮಹಾಪುರುಷಸ್ಯ ವಿಷ್ಣೋರಾಜ್ಞಯಾ ಪ್ರವರ್ತಮಾನಸ್ಯ ಆದ್ಯ ಬ್ರಹ್ಮಣಃ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ ಶ್ವೇತವರಾಹ ಕಲ್ಪೇ ವೈವಸ್ವತ ಮನ್ವಂತರೇ ಅಷ್ಟಾವಿಂಶತಿತಮೇ ಕಲಿಯುಗೇ ಪ್ರಥಮಪಾದೇ ಜಂಬೂದ್ವೀಪೇ ಭಾರತವರ್ಷೇ ಭರತಖಂಡೇ ದಂಡಕಾರಣ್ಯೇ ಗೋದಾವರ್ಯಾಃ ದಕ್ಷಿಣೇ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ...
${samvatsara} ನಾಮ ಸಂವತ್ಸರೇ, ${ayana}, ${ritu}, ${masa}, ${paksha}, ${tithi} ತಿಥೌ, ${vasara} ವಾಸರೇ, ${nakshatra} ನಕ್ಷತ್ರೇ, ಶುಭಯೋಗ ಶುಭಕರಣ ಏವಂಗುಣ ವಿಶೇಷಣ ವಿಶಿಷ್ಟಾಯಾಂ ಶುಭಪುಣ್ಯತಿಥೌ ...
ಮಮ ಉಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ ಪ್ರೀತ್ಯರ್ಥಂ, ${gotra} ಗೋತ್ರೋತ್ಪನ್ನಸ್ಯ ${rashiName} ರಾಶೌ ${nakshatraName} ನಕ್ಷತ್ರೇ ಜಾತಸ್ಯ ${devoteeName} ಶರ್ಮಣಃ / ನಾಮ್ನ್ಯಾಃ ...
${activePhrasesSanskrit} ...
ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ, ಶ್ರೀ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧೌ ಯಥಾಶಕ್ತಿ ನಿತ್ಯ ಪೂಜಾಂ ಸಂಕಲ್ಪಂ ಚ ಕರಿಷ್ಯೇ ॥`,
      narrationText: {
        kn: `ಈ ಮಂಗಳಕರ ದಿನದಂದು ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪ್ರಧಾನ ವೇದ ವಿದ್ವಾಂಸರಾದ ${priestName} ಅವರ ಧ್ವನಿ ಸಮ್ಮುಖದಲ್ಲಿ: ${samvatsara} ಸಂವತ್ಸರದ, ${masa}, ${tithi} ತಿಥಿಯಂದು, ${gotra} ಗೋತ್ರದ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರದ ಶ್ರೀ ${devoteeName} ಅವರ ಸಕಲ ಇಷ್ಟಾರ್ಥಗಳಾದ — "${activePhrasesKannada}" — ಇವುಗಳ ಸಿದ್ಧಿಗಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಮರ್ಪಿತ ನಿತ್ಯ ಮಹಾ ಸಂಕಲ್ಪ.`,
        hi: `इस पावन बेला में गोकर्ण क्षेत्र के मुख्य वेद पंडित ${priestName} के सान्निध्य में: ${samvatsara} संवत्सर, ${masa}, ${tithi} तिथि, ${gotra} गोत्र, ${rashiName} राशि, ${nakshatraName} नक्षत्र के भक्त ${devoteeName} के मनोकामनाओं — "${activePhrasesKannada}" — की सिद्धि हेतु भगवान महाबलेश्वर के पावन चरणों में नित्य महासंकल्प।`,
        te: `ఈ పవిత్ర ముహూర్తంలో గోకర్ణ క్షేత్ర ప్రధాన వేద పండితులు ${priestName} గారి దివ్య సమక్షంలో: ${samvatsara} సంవత్సరం, ${masa}, ${tithi} తిథి, ${gotra} గోత్రం, ${rashiName} రాశి, ${nakshatraName} నక్షత్ర భక్తులు ${devoteeName} గారి సంకల్పాలు — "${activePhrasesKannada}" — నెరవేరాలని సమర్పించే నిత్య మహా సంకల్పం.`,
        ta: `இப்புனித வேளையில் கோகர்ண க்ஷேத்திரத்தின் முதன்மை வேத பண்டிதர் ${priestName} அவர்களின் திவ்ய முன்னிலையில்: ${samvatsara} வருடம், ${masa}, ${tithi} திதி, ${gotra} கோத்திரம், ${rashiName} ராசி, ${nakshatraName} நட்சத்திர பக்தர் ${devoteeName} அவர்களின் வேண்டுதல்கள் — "${activePhrasesKannada}" — நிறைவேற சமர்ப்பிக்கப்படும் நித்ய மகா சங்கல்பம்.`,
        en: `In the sanctum of Gokarna Kshetra guided by Priest ${priestName}: On this holy day of ${samvatsara} Samvatsara, ${masa}, ${tithi}, for devotee ${devoteeName} of ${gotra} Gotra, ${rashiName} Rashi, ${nakshatraName} Nakshatra, offering prayers for — "${activePhrasesKannada}" — at the Lotus Feet of Lord Mahabaleshwara.`
      },
      actionGuide: {
        kn: "ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಬಿಗಿಯಾಗಿ ಹಿಡಿದುಕೊಂಡು, ಪಂಡಿತರ ಮಂತ್ರೋಚ್ಚಾರಣೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಮನಸ್ಸಿನ ಸಂಕಲ್ಪಗಳನ್ನು ಭಕ್ತಿಯಿಂದ ಪ್ರಾರ್ಥಿಸಿಕೊಳ್ಳಿ.",
        hi: "हाथ में अक्षत श्रद्धापूर्वक रखकर, पंडित जी के मंत्रोच्चार के साथ अपनी आंतरिक मनोकामनाओं का शांत मन से स्मरण करें।",
        te: "చేతిలోని అక్షతలను భక్తితో పట్టుకొని, పండితుల మంత్రోచ్చారణతో మీ మనోభీష్టాలను స్మరించుకోండి.",
        ta: "கையில் உள்ள அட்சதையை பக்தியுடன் பற்றி, பண்டிதரின் மந்திர உச்சாடனையுடன் உங்கள் மனதின் சங்கல்பங்களை வேண்டிக் கொள்ளுங்கள்.",
        en: "Hold the consecrated Akshata close to your heart, silently affirming your prayers as the Vedic Priest chants the Desha-Kaala Sankalpa."
      },
      spiritualSignificance: {
        kn: "ದೇಶ-ಕಾಲ ಹಾಗೂ ಭಕ್ತನ ಜನ್ಮ ನಕ್ಷತ್ರದೊಂದಿಗೆ ವಿಶ್ವ ಬ್ರಹ್ಮಾಂಡ ಚೈತನ್ಯಕ್ಕೆ ನೇರ ಸಂಕಲ್ಪ ಸ್ಪಂದನ.",
        hi: "देश-काल एवं जन्म नक्षत्र के साथ ब्रह्मांडीय चेतना से सीधा आत्मिक संपर्क।",
        te: "దేశ-కాలాలు మరియు జన్మ నక్షత్రంతో విశ్వ చైతన్యానికి సంకల్ప అనుసంధానం.",
        ta: "தேச-காலம் மற்றும் பிறந்த நட்சத்திரத்துடன் பிரபஞ்ச சக்தியோடு சங்கல்ப இணைப்பு.",
        en: "Aligns your personal soul vibration with the cosmic planetary coordinates of the universe."
      }
    },

    // ── STEP 4: SANKALPA SAMARPANAM TO GOD'S LOTUS FEET (~45s) ──
    {
      step: 4,
      key: "sankalpa_samarpana",
      titleKn: "೪. ದೇವತಾ ಪಾದಾರವಿಂದಕ್ಕೆ ಸಂಕಲ್ಪ ಸಮರ್ಪಣೆ",
      titleEn: "4. Offering Sankalpa & Akshata to God's Lotus Feet",
      titleHi: "४. प्रभु के चरण कमलों में संकल्प समर्पण",
      titleTe: "4. భగవంతుని పాదపద్మాలకు సంకల్ప సమర్పణ",
      titleTa: "4. இறைவனின் பாதாரவிந்தங்களில் சங்கல்ப சமர்ப்பணம்",
      icon: "✨",
      approxSeconds: 45,
      visualEffect: "akshata",
      sanskritMantra: `ಅನೇನ ಕೃತೇನ ಯಥಾಶಕ್ತಿ ನಿತ್ಯ ಪೂಜಾ ಸಂಕಲ್ಪ ಕರ್ಮಣಾ ।
ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ, ಶ್ರೀ ಮಹಾಗಣಪತಿ ದೇವತಾಃ ಸುಪ್ರೀತಾಃ ಸುಪ್ರಸನ್ನಾಃ ವರದಾಃ ಭವಂತು ॥
ಸರ್ವೇ ಭವಂತು ಸುಖಿನಃ ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ।
ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿತ್ ದುಃಖಭಾಗ್ಭವತ್ ॥
ಶ್ರೀಕೃಷ್ಣಾರ್ಪಣಮಸ್ತು, ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು ॥`,
      narrationText: {
        kn: `ಈಗ ಕೈಯಲ್ಲಿ ಹಿಡಿದಿರುವ ಪವಿತ್ರ ಮಂತ್ರಾಕ್ಷತೆ ಮತ್ತು ಪುಷ್ಪಗಳನ್ನು ಶ್ರೀ ದೇವರ ಪಾದಾರವಿಂದಗಳಿಗೆ ಭಕ್ತಿಯಿಂದ ಸಮರ್ಪಿಸಿ. "ಶ್ರೀ ಸಾಂಬಸದಾಶಿವಾರ್ಪಣಮಸ್ತು" ಎಂದು ನುಡಿದು ಮನಸ್ಸಿನ ಎಲ್ಲಾ ಭಾರವನ್ನು ಈಶ್ವರನಿಗೆ ಅರ್ಪಿಸಿ.`,
        hi: `अब हाथ में रखे पावन अक्षत एवं पुष्पों को प्रभु के श्री चरण कमलों में श्रद्धा से अर्पित करें। "श्री सांबसदाशिवार्पणमस्तु" कहकर अपनी समस्त चिंताओं को प्रभु के चरणों में समर्पित करें।`,
        te: `ఇప్పుడు చేతిలోని పవిత్ర అక్షతలు మరియు పూలను స్వామివారి పాదపద్మాలకు భక్తితో సమర్పించండి. "శ్రీ సాంబసదాశివార్పణమస్తు" అని ప్రార్థించండి.`,
        ta: `இப்போது கையில் உள்ள புனித அட்சதை மற்றும் மலர்களை இறைவனின் திருப்பாதங்களில் பக்தியுடன் சமர்ப்பியுங்கள். "ஸ்ரீ சாம்பசதாசிவார்ப்பணமஸ்து" என்று கூறி வழிபடவும்.`,
        en: `Now tenderly offer the consecrated Akshata and flowers from your hands unto the Lotus Feet of the Lord. Chant 'Shri Samba Sadashivarpanamastu' and surrender your heart's wishes to the Divine.`
      },
      actionGuide: {
        kn: "ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ದೇವರ ಮಂಟಪದಲ್ಲಿರುವ ದೇವರ ಮೂರ್ತಿ ಅಥವಾ ಫೋಟೋದ ಪಾದಗಳಿಗೆ ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ.",
        hi: "हाथ के अक्षत और पुष्प को पूजा स्थल में भगवान की मूर्ति या चित्र के श्रीचरणों में श्रद्धा से अर्पित करें।",
        te: "చేతిలోని అక్షతలు మరియు పువ్వులను పూజా మందిరంలోని దేవుని పాదాల వద్ద భక్తితో సమర్పించండి.",
        ta: "கையில் உள்ள அட்சதை மற்றும் மலர்களை இறைவனின் பாதங்களில் பவ்யமாக சமர்ப்பிக்கவும்.",
        en: "Gently offer the Akshata and flower onto the Lotus Feet of the Deity at your altar with humble devotion."
      },
      spiritualSignificance: {
        kn: "ಸಂಕಲ್ಪದ ಸಂಪೂರ್ಣ ಫಲವು ದೇವರ ಚರಣಗಳಲ್ಲಿ ಅರ್ಪಿತವಾಗಿ ದೈವಿಕ ರಕ್ಷಣೆ ಮತ್ತು ಆಶೀರ್ವಾದ ಸಿಗುವುದು.",
        hi: "संकल्प का संपूर्ण फल प्रभु चरणों में समर्पित होकर ईश्वरीय सुरक्षा व मंगल की प्राप्ति।",
        te: "సంకల్ప ఫలం భగవత్ పాదాలకు చేరి దైవిక రక్షణ మరియు అనుగ్రహం లభించడం.",
        ta: "சங்கல்பத்தின் பூரண பலன் இறைவன் பாதங்களில் சேர்ந்து தெய்வீக அருளும் பாதுகாப்பும் அருளப்படுதல்.",
        en: "Total surrender (Samarpanam) transforms worldly desires into spiritually blessed reality."
      }
    },

    // ── STEP 5: DEEPARADHANA (ARATI), SASHTANGA NAMASKARA & SHANTI (~60s) ──
    {
      step: 5,
      key: "deeparadhana_namaskara",
      titleKn: "೫. ದೀಪಾರಾಧನೆ (ಆರತಿ), ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ & ಶಾಂತಿ",
      titleEn: "5. Mangalarati, Sashtanga Namaskara & Peace",
      titleHi: "५. दीपाराधना (आरती), साष्टांग नमन एवं शांति",
      titleTe: "5. దీపారాధన (హారతి), సాష్టాంగ నమస్కారం & శాంతి",
      titleTa: "5. தீபாராதனை (ஆரத்தி), சாஷ்டாங்க நமஸ்காரம் & சாந்தி",
      icon: "🔥",
      approxSeconds: 60,
      visualEffect: "arathi",
      sanskritMantra: `ಕರ್ಪೂರಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರಸಾರಂ ಭುಜಗೇಂದ್ರಹಾರಮ್ ।
ಸದಾವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀಸಹಿತಂ ನಮಾಮಿ ॥
ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತೇಃ ಸ್ವಭಾವಾತ್ ।
ಕರೋಮಿ ಯದ್ಯತ್ ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥
ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ ॥`,
      narrationText: {
        kn: `ಕರ್ಪೂರ ಅಥವಾ ಆರತಿ ದೀಪದಿಂದ ಮಂಗಳಾರತಿಯನ್ನು ಬೆಳಗಿಸಿ. ದೇವರಿಗೆ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ. ಆಶೀರ್ವಾದವನ್ನು ಕಣ್ಣುಗಳಿಗೆ ಮುಟ್ಟಿಸಿಕೊಂಡು, ಕುಟುಂಬದ ಸುಖ, ಶಾಂತಿ ಮತ್ತು ಸಮೃದ್ಧಿಗಾಗಿ ಶಾಂತಿ ಮಂತ್ರ ಪಠಿಸಿ. ಇಂದಿನ ಪವಿತ್ರ ಪೂಜೆ ಸಂಪನ್ನವಾಯಿತು.`,
        hi: `कर्पूर अथवा आरती दीप से मंगल आरती करें। भगवान को साष्टांग नमन करें। आरती की पावन ज्योति को नयनों से स्पर्श कर सुख, शांति एवं समृद्धि की प्रार्थना करें। आज की पावन पूजा संपन्न हुई।`,
        te: `కర్పూరం లేదా హారతి దీపంతో మంగళ హారతి ఇవ్వండి. స్వామికి సాష్టాంగ నమస్కారం చేయండి. హారతి వెలుగును కళ్ళకు అద్దుకొని కుటుంబ శాంతి కోసం ప్రార్థించండి. నేటి పవిత్ర పూజ సంపూర్ణమైనది.`,
        ta: `கற்பூரம் அல்லது தீபத்தால் மங்கள ஆரத்தி எடுக்கவும். இறைவனை சாஷ்டாங்கமாக வணங்கி, ஆரத்தி ஒளியை கண்களில் ஒற்றிக் கொண்டு குடும்ப நலனுக்காக பிரார்த்தியுங்கள். இன்றைய புனித பூஜை இனிதே நிறைவடைந்தது.`,
        en: `Wave the sacred Mangalarati (flame of illumination) clockwise before the Lord. Prostrate in humble Sashtanga Namaskara, receive the divine warmth on your eyes, and pray for universal peace. Today's sacred worship is complete.`
      },
      actionGuide: {
        kn: "ಆರತಿ ತಟ್ಟೆಯನ್ನು ಗಡಿಯಾರದ ದಿಕ್ಕಿನಲ್ಲಿ ಮೂರು ಬಾರಿ ತಿರುಗಿಸಿ, ತಲೆಬಾಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕರಿಸಿ, ಕೈಗಳಿಗೆ ಆರತಿಯ ಬೆಚ್ಚನೆಯ ಶಾಖವನ್ನು ಕಣ್ಣಿಗೆ ಮುಟ್ಟಿಸಿಕೊಳ್ಳಿ.",
        hi: "आरती की थाली को दक्षिणावर्त तीन बार घुमाएं, साष्टांग प्रणाम करें और आरती की पावन ज्योति को नयनों से स्पर्श करें।",
        te: "హారతి పళ్లెంను ప్రదక్షిణ దిశలో మూడుసార్లు తిప్పండి, సాష్టాంగ నమస్కారం చేసి హారతిని కళ్ళకు అద్దుకోండి.",
        ta: "ஆரத்தி தட்டை வலஞ்சுழியாக மூன்று முறை சுற்றி, சாஷ்டாங்க நமஸ்காரம் செய்து ஆரத்தியை கண்களில் ஒற்றிக் கொள்ளவும்.",
        en: "Wave the Arati tray 3 times clockwise, bow down in reverence, and gently touch the warm blessings to your eyes."
      },
      spiritualSignificance: {
        kn: "ದೈವಿಕ ತೇಜಸ್ಸಿನ ಸಂಪೂರ್ಣ ಆವಾಹನೆ ಮತ್ತು ತ್ರಿವಿಧ ಶಾಂತಿಯೊಂದಿಗೆ ಮನಸ್ಸಿಗೆ ಅಪಾರ ನೆಮ್ಮದಿ.",
        hi: "दिव्य तेज का साक्षात्कार एवं त्रिविध शांति से असीम आत्मिक आनंद।",
        te: "దివ్య తేజస్సు ఆవాహన మరియు త్రివిధ శాంతులతో సంపూర్ణ ప్రశాంతత.",
        ta: "தெய்வீக பேரொளியின் தரிசனம் மற்றும் மன அமைதி.",
        en: "Infuses the soul with divine radiance, dissolving all stress and granting profound inner peace."
      }
    }
  ];
}
