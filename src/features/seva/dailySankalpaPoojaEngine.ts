/**
 * Authentic 3-to-5 Minute Daily Vedic Sankalpa & Deva Pooja Engine (ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜಾ ವಿಧಿ)
 * 
 * Rooted in the sacred Smartha & Vedic Gokarna Kshetra tradition:
 * 1. Deepa Prajwalane & Achamana (Lighting the Sanctum Lamp & Inner Purification)
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
    // ── STEP 1: DEEPA PRAJWALANE & ACHAMANA (~45s) ──
    {
      step: 1,
      key: "deepa_achamana",
      titleKn: "೧. ದೀಪ ಪ್ರಜ್ವಲನೆ & ಆಚಮನ ಶುದ್ಧಿ",
      titleEn: "1. Lighting Sacred Lamp & Inner Purification",
      titleHi: "१. दीप प्रज्वलन एवं आचमन शुद्धि",
      titleTe: "1. దీప ప్రజ్వలన & ఆచమన శుద్ధి",
      titleTa: "1. திருவிளக்கு ஏற்றுதல் & ஆசமன சுத்தி",
      icon: "🪔",
      approxSeconds: 45,
      visualEffect: "deepa",
      sanskritMantra: `ದೀಪಜ್ಯೋತಿಃ ಪರಬ್ರಹ್ಮ ದೀಪಜ್ಯೋತಿರ್ಜನಾರ್ದನಃ ।
ದೀಪೋ ಹರತು ಮೇ ಪಾಪಂ ದೀಪಜ್ಯೋತಿರ್ನಮೋಸ್ತು ತೇ ॥
ಓಂ ಕೇಶವಾಯ ಸ್ವಾಹಾ, ಓಂ ನಾರಾಯಣಾಯ ಸ್ವಾಹಾ, ಓಂ ಮಾಧವಾಯ ಸ್ವಾಹಾ ॥
ಓಂ ಗೋವಿಂದಾಯ ನಮಃ, ವಿಷ್ಣವೇ ನಮಃ, ಮಧುಸೂದನಾಯ ನಮಃ ॥`,
      narrationText: {
        kn: `ಹರಿ ಓಂ. ಮುಂಜಾನೆಯ ಪವಿತ್ರ ನಿತ್ಯ ಸಂಕಲ್ಪ ಮತ್ತು ದೇವ ಪೂಜೆಗೆ ಸುಸ್ವಾಗತ. ದೇವರ ಮುಂದೆ ಶುದ್ಧ ಎಣ್ಣೆ ಅಥವಾ ತುಪ್ಪದ ದೀಪವನ್ನು ಭಕ್ತಿಯಿಂದ ಬೆಳಗಿಸಿ. ನಂತರ ಆಚಮನ ಪಾತ್ರೆಯಿಂದ ಮೂರು ಬಾರಿ ಪವಿತ್ರ ಜಲವನ್ನು ಸ್ವೀಕರಿಸಿ ಅಂಗೈ ಶುದ್ಧಿ ಮಾಡಿಕೊಳ್ಳಿ.`,
        hi: `हरि ॐ। प्रातःकालीन पावन नित्य संकल्प एवं देव पूजा में आपका स्वागत है। सर्वप्रथम मंदिर में शुद्ध घी या तेल का पावन दीप प्रज्वलित करें। फिर आचमनी से तीन बार जल ग्रहण कर अंतःकरण व हस्त शुद्धि करें।`,
        te: `హరి ఓం. ఉదయపు పవిత్ర నిత్య సంకల్పం మరియు దేవ పూజకు స్వాగతం. ఆలయంలో స్వచ్ఛమైన నెయ్యి లేదా నూనెతో దీపాన్ని వెలిగించండి. తరువాత మూడుసార్లు పవిత్ర జలాన్ని స్వీకరించి ఆచమనం చేసి చేతులు శుద్ధి చేసుకోండి.`,
        ta: `ஹரி ஓம். காலை புனித நித்ய சங்கல்பம் மற்றும் இறை பூஜைக்கு நல்வரவு. முதலில் பூஜை அறையில் தூய நெய் அல்லது நல்லெண்ணெய் தீபம் ஏற்றவும். பின்னர் மூன்று முறை புனித நீர் அருந்தி ஆசமனம் செய்து கைகளைத் தூய்மைப்படுத்தவும்.`,
        en: `Hari Om. Welcome to the sacred 3-5 minute Vedic Daily Sankalpa & Pooja. Light the sanctum lamp with pure oil or cow's ghee. Take three sips of pure water for inner purification (Achamana) and cleanse your hands.`
      },
      actionGuide: {
        kn: "ದೇವರ ಮಂಟಪದಲ್ಲಿ ದೀಪ ಬೆಳಗಿಸಿ, ಉದ್ಧರಣೆಯಿಂದ ಬಲ ಅಂಗೈಗೆ ಮೂರು ಬಾರಿ ನೀರನ್ನು ಹಾಕಿಕೊಂಡು ಆಚಮನ ಮಾಡಿ, ಕೈ ತೊಳೆದುಕೊಳ್ಳಿ.",
        hi: "पूजा स्थल में दीप जलाएं, दाहिनी हथेली में तीन बार जल लेकर आचमन करें और हाथ धोएं।",
        te: "పూజా స్థలంలో దీపం వెలిగించండి, కుడి అరచేతిలో మూడుసార్లు నీటిని తీసుకొని ఆచమనం చేసి చేతులు కడుక్కోండి.",
        ta: "பூஜை இடத்தில் விளக்கேற்றி, வலது உள்ளங்கையில் மூன்று முறை நீர் எடுத்து அருந்தி ஆசமனம் செய்து கைகளைக் கழுவவும்.",
        en: "Light the altar lamp, take 3 drops of pure water in your right palm using the spoon, sip softly, and cleanse hands."
      },
      spiritualSignificance: {
        kn: "ಅಜ್ಞಾನವನ್ನು ಕಳೆದು ಜ್ಞಾನಜ್ಯೋತಿಯನ್ನು ಬೆಳಗಿಸುವುದು ಮತ್ತು ತ್ರಿದೋಷ ನಿವಾರಣೆಯೊಂದಿಗೆ ದೇಹ-ಮನಸ್ಸಿನ ಪಾವಿತ್ರ್ಯತೆ.",
        hi: "अज्ञान रूपी अंधकार को दूर कर ज्ञानज्योति का जागरण एवं काया-मन की त्रिकरण शुद्धि।",
        te: "అజ్ఞానాన్ని తొలగించి జ్ఞానజ్యోతిని వెలిగించడం మరియు మనస్సు-శరీరాల త్రికరణ పవిత్రత.",
        ta: "அறியாமை நீக்கி ஞானஜோதி ஏற்றுதல் மற்றும் மனம்-உடல் பவித்திர சுத்தி.",
        en: "Dispels darkness, ignites inner spiritual light, and purifies mind and body for cosmic connection."
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
        ta: "சிறிது அட்சதை மற்றும் பூவை வலது உள்ளங்கையில் வைத்து, இடது கையை கீழே தாங்கி நெஞ்சுக்கு நேராக பயபக்தியுடன் ஏந்தவும்.",
        en: "Place sacred Akshata and a flower in your right palm, support with your left hand, and hold reverently near your heart."
      },
      spiritualSignificance: {
        kn: "ದೈವಿಕ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಸರ್ವ ಸಂಕಲ್ಪಗಳ ವಿಘ್ನ ನಿವಾರಣೆ ಮತ್ತು ಗುರುಕೃಪಾ ಪ್ರಾಪ್ತಿ.",
        hi: "सर्व विघ्नों का समूल निवारण और सद्गुरु की अमोघ कृपा प्राप्ति।",
        te: "సర్వ విఘ్నాల నివారణ మరియు సద్గురు కృపా ప్రాప్తి.",
        ta: "சகல தடைகளும் நீங்கி குருவருளும் திருவருளும் நிறைவேறுதல்.",
        en: "Brings total obstacle removal, divine protection, and alignment with the lineage of spiritual masters."
      }
    },

    // ── STEP 3: VEDIC DESHA-KAALA & DYNAMIC PERSONAL SANKALPA (~90s) ──
    {
      step: 3,
      key: "maha_sankalpa",
      titleKn: "೩. ಪಂಚಾಂಗ ಸಹಿತ ಮಹಾ ದೈವಿಕ ಸಂಕಲ್ಪ",
      titleEn: "3. Sacred Vedic Desha-Kaala & Personal Sankalpa",
      titleHi: "३. पञ्चाङ्ग सहित महा वैदिक संकल्प",
      titleTe: "3. పంచాంగ సహిత మహా వైదిక సంకల్పం",
      titleTa: "3. பஞ்சாங்க சகித மகா வைதீக சங்கல்பம்",
      icon: "📜",
      approxSeconds: 90,
      visualEffect: "sankalpa",
      sanskritMantra: `ಶ್ರೀಮದ್ ಭಗವತೋ ಮಹಾಪುರುಷಸ್ಯ ವಿಷ್ಣೋರಾಜ್ಞಯಾ ಪ್ರವರ್ತಮಾನಸ್ಯ ಅದ್ಯ ಬ್ರಹ್ಮಣಃ ದ್ವಿತೀಯ ಪರಾರ್ಧೇ, ಶ್ವೇತವರಾಹ ಕಲ್ಪೇ, ವೈವಸ್ವತ ಮನ್ವಂತರೇ, ಕಲಿಯುಗೇ, ಪ್ರಥಮ ಪಾದೇ, ಜಂಬೂದ್ವೀಪೇ, ಭರತವರ್ಷೇ, ಭರತಖಂಡೇ, ದಂಡಕಾರಣ್ಯೇ ಪುಣ್ಯಪ್ರದೇಶೇ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸನ್ನಿಧೌ...
ಅಸ್ಮಿನ್ ವರ್ತಮಾನೇ ${samvatsara} ನಾಮ ಸಂವತ್ಸರೇ, ${ayana}, ${ritu}, ${masa}, ${paksha}, ${tithi} ತಿಥೌ, ${vasara} ವಾಸರೇ, ${nakshatra} ನಕ್ಷತ್ರೇ...
ಮಮೋಪಾತ್ತ ಸಮಸ್ತ ದುರಿತಕ್ಷಯದ್ವಾರಾ ಶ್ರೀ ಪರಮೇಶ್ವರ-ಮಹಾಲಕ್ಷ್ಮೀ-ದೇವತಾ ಪ್ರೀತ್ಯರ್ಥಂ...
${gotra} ಗೋತ್ರೋತ್ಪನ್ನಸ್ಯ, ${rashiName} ರಾಶೌ ಜಾತಸ್ಯ, ${nakshatraName} ನಕ್ಷತ್ರಸ್ಥಸ್ಯ, ${devoteeName} ನಾಮಧೇಯಸ್ಯ...
${activePhrasesSanskrit}
ಸಿದ್ಧ್ಯರ್ಥಂ, ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರಸ್ಥ ಪರಮಪಾವನ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಗಣಪತಿ ಸನ್ನಿಧೌ ನಿತ್ಯ ಸಂಕಲ್ಪ ಪೂಜಾಂ ಕರಿಷ್ಯೇ ॥`,
      narrationText: {
        kn: `ಓಂ. ಇಂದಿನ ಪವಿತ್ರ ದೇಶ-ಕಾಲ ಪಂಚಾಂಗದಲ್ಲಿ ${samvatsara} ಸಂವತ್ಸರ, ${masa}, ${paksha}, ${tithi} ತಿಥಿ, ${vasara}ದ ಈ ಪುಣ್ಯ ಮುಹೂರ್ತದಲ್ಲಿ... ${gotra} ಗೋತ್ರದ, ${rashiName} ರಾಶಿ, ${nakshatraName} ನಕ್ಷತ್ರದ ಶ್ರೀ ${devoteeName} ಅವರ ಸಕಲ ಅಭೀಷ್ಟ ಸಿದ್ಧಿಗಾಗಿ: "${activePhrasesKannada}" ಎಂಬ ಸಂಕಲ್ಪವನ್ನು ದೇವರೆದುರು ಭಕ್ತಿಯಿಂದ ಸ್ಮರಿಸಿ.`,
        hi: `ॐ। आज के पावन पञ्चाङ्ग देश-काल में ${samvatsara} संवत्सर, ${masa}, ${paksha}, ${tithi} तिथि, ${vasara} के इस शुभ वेला में... ${gotra} गोत्र, ${rashiName} राशि, ${nakshatraName} नक्षत्र के भक्त श्री ${devoteeName} के सर्व अभीष्ट मनोरथों: "${activePhrasesKannada}" की सिद्धि हेतु परमेश्वर के सम्मुख संकल्प करें।`,
        te: `ఓం. నేటి పవిత్ర పంచాంగ దేశ-కాలంలో ${samvatsara} సంవత్సరం, ${masa}, ${paksha}, ${tithi} తిథి, ${vasara} శుభ సమయంలో... ${gotra} గోత్రం, ${rashiName} రాశి, ${nakshatraName} నక్షత్రం కల శ్రీ ${devoteeName} వారి సర్వ అభీష్ట సిద్ధి కొరకు: "${activePhrasesKannada}" సంకల్పాన్ని భక్తితో ధ్యానించండి.`,
        ta: `ஓம். இன்றைய திவ்ய பஞ்சாங்க தேச-காலத்தில் ${samvatsara} வருடம், ${masa}, ${paksha}, ${tithi} திதி, ${vasara} புண்ணிய வேளையில்... ${gotra} கோத்திரம், ${rashiName} ராசி, ${nakshatraName} நட்சத்திரம் கொண்ட திரு/திருமதி ${devoteeName} அவர்களின் சகல நன்மைகளுக்கும்: "${activePhrasesKannada}" சங்கல்பத்தை மனமார இறைவனிடம் பிரார்த்திக்கவும்.`,
        en: `Om. In today's sacred cosmic space and time (${samvatsara} Samvatsara, ${masa}, ${paksha}, ${tithi}, ${vasara})... for devotee ${devoteeName} of ${gotra} Gotra, ${rashiName} Rashi, ${nakshatraName} Nakshatra: Meditate with utmost devotion on your sacred intentions: "${activePhrasesKannada}".`
      },
      actionGuide: {
        kn: "ಕಣ್ಣು ಮುಚ್ಚಿ, ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಹಿಡಿದುಕೊಂಡೇ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಂಕಲ್ಪಗಳು ದೇವರ ಅನುಗ್ರಹದಿಂದ ಶೀಘ್ರ ಈಡೇರಲೆಂದು ಪ್ರಾರ್ಥಿಸಿ.",
        hi: "नेत्र बंद कर, हाथ में अक्षत धारण किए हुए ही अपने व्यक्तिगत संकल्पों की पूर्णता हेतु भगवान से मन ही मन प्रार्थना करें।",
        te: "కళ్ళు మూసుకొని, చేతిలోని అక్షతలను పట్టుకొని మీ వ్యక్తిగత సంకల్పాలు నెరవేరాలని మనసారా ప్రార్థించండి.",
        ta: "கண்களை மூடி, கையில் அட்சதை ஏந்தியவாறே உங்கள் சங்கல்பங்கள் யாவும் ஈடேற மனதார வேண்டிக் கொள்ளுங்கள்.",
        en: "Close your eyes, hold the Akshata steadily near your heart, and softly internalize your prayers before God."
      },
      spiritualSignificance: {
        kn: "ಬ್ರಹ್ಮಾಂಡದ ಪಂಚಾಂಗ ಶಕ್ತಿ ಮತ್ತು ಭಕ್ತನ ಆಂತರಿಕ ಇಷ್ಟಾರ್ಥಗಳ ದೈವಿಕ ಸಂಯೋಗ.",
        hi: "ब्रह्मांडीय पञ्चाङ्ग चेतना एवं भक्त के पावन मनोरथों का दिव्य एकात्म भाव।",
        te: "విశ్వ పంచాంగ శక్తి మరియు భక్తుని ఆంతరంగిక సంకల్పాల పవిత్ర సంయోగం.",
        ta: "பிரபஞ்ச பஞ்சாங்க சக்தியும் பக்தனின் ஆழ்மன பிரார்த்தனையும் இணையும் தெய்வீக சங்கல்பம்.",
        en: "Connects your individual consciousness with cosmic time (Desha-Kaala) to materialize noble prayers."
      }
    },

    // ── STEP 4: SANKALPA SAMARPANAM TO GOD'S LOTUS FEET (~45s) ──
    {
      step: 4,
      key: "sankalpa_samarpana",
      titleKn: "೪. ದೇವತಾ ಪಾದಾರವಿಂದಕ್ಕೆ ಸಂಕಲ್ಪ ಸಮರ್ಪಣೆ",
      titleEn: "4. Offering Sacred Akshata to God's Lotus Feet",
      titleHi: "४. देव चरणारविंद में संकल्प अक्षत समर्पण",
      titleTe: "4. దేవతా చరణారవిందాలకు సంకల్ప అక్షతల సమర్పణ",
      titleTa: "4. இறைவனின் திருவடிகளில் சங்கல்ப அட்சதை சமர்ப்பித்தல்",
      icon: "✨",
      approxSeconds: 45,
      visualEffect: "akshata",
      sanskritMantra: `ಅನಯಾ ಪೂಜಯಾ ಚ ಸಂಕಲ್ಪ ಕರ್ಮಣಾ ಶ್ರೀ ಮಹಾಗಣಪತಿ-ಪರಮೇಶ್ವರ-ಮಹಾಲಕ್ಷ್ಮೀ ದೇವತಾ ಪ್ರೀಯತಾಂ ಪ್ರೀತಾ ವರದಾ ಭವತು ॥
ಶ್ರೀ ದೇವತಾ ಚರಣಾರವಿಂದೇಷು ಸಂಕಲ್ಪ ಅಕ್ಷತಾಂ ಪುಷ್ಪಾಣಿ ಚ ಸಮರ್ಪಯಾಮಿ ॥
ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು, ಸರ್ವೇ ಸಂತು ನಿರಾಮಯಾಃ ।
ಸರ್ವೇ ಭದ್ರಾಣಿ ಪಶ್ಯಂತು ಮಾ ಕಶ್ಚಿದ್ ದುಃಖಭಾಗ್ ಭವೇತ್ ॥`,
      narrationText: {
        kn: `ಈಗ ಕೈಯಲ್ಲಿ ಹಿಡಿದಿರುವ ಪವಿತ್ರ ಅಕ್ಷತೆ ಮತ್ತು ಹೂಗಳನ್ನು ದೇವತಾ ವಿಗ್ರಹ ಅಥವಾ ಚಿತ್ರಪಟದ ಪಾದಾರವಿಂದಗಳಿಗೆ ಅತ್ಯಂತ ಶ್ರದ್ಧಾ-ಭಕ್ತಿಯಿಂದ ಅರ್ಪಿಸಿ. ನಿಮ್ಮ ಸಂಕಲ್ಪವನ್ನು ಭಗವಂತನ ಚರಣಗಳಲ್ಲಿ ಸಮರ್ಪಿಸಿ ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಿ.`,
        hi: `अब हाथ में धारण किए हुए पावन अक्षत एवं पुष्पों को अत्यंत श्रद्धा एवं समर्पण भाव से भगवान के श्रीचरणों में अर्पित करें। अपने संपूर्ण संकल्प को परमात्मा के चरणों में समर्पित कर कृतज्ञता व्यक्त करें।`,
        te: `ఇప్పుడు చేతిలోని పవిత్ర అక్షతలు మరియు పూలను అత్యంత భక్తి ప్రపత్తులతో భగవంతుని పాదాల చెంత సమర్పించండి. మీ సంకల్పాన్ని పరమాత్ముని చరణాలకు అర్పించి కృతజ్ఞతలు తెలుపుకోండి.`,
        ta: `இப்போது கையில் ஏந்தியுள்ள புனித அட்சதை மற்றும் மலர்களை மிகுந்த பக்தியோடு இறைவனின் திருவடிகளில் மென்மையாக சமர்ப்பிக்கவும். உங்கள் சங்கல்பத்தை இறைவனடி சமர்ப்பித்து சரணடையுங்கள்.`,
        en: `Now, with deep surrender, gently offer the sacred Akshata and flowers from your hands onto the lotus feet of the deity at your altar. Offer your entire Sankalpa at the lotus feet of Almighty.`
      },
      actionGuide: {
        kn: "ಬಲಗೈಯಿಂದ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ದೇವತಾ ಪಾದಗಳಿಗೆ ಸಮರ್ಪಿಸಿ, ಸ್ವಲ್ಪ ನೀರನ್ನು ಬಿಟ್ಟು ಕೈ ಮುಗಿಯಿರಿ.",
        hi: "दाहिने हाथ से अक्षत एवं फूल भगवान के चरणों में अर्पित करें और हाथ जोड़कर प्रणाम करें।",
        te: "కుడి చేతితో అక్షతలు, పూలను భగవంతుని పాదాల వద్ద సమర్పించి నమస్కరించండి.",
        ta: "வலது கையால் அட்சதை மற்றும் பூக்களை இறைவன் திருவடிகளில் சமர்ப்பித்து இருகரம் கூப்பி வணங்கவும்.",
        en: "Gently place the Akshata and flowers at the deity's feet, sprinkle a drop of water, and fold your hands."
      },
      spiritualSignificance: {
        kn: "ಅಹಂಕಾರ ತ್ಯಾಗ, ಈಶ್ವರಾರ್ಪಣ ಭಾವ ಮತ್ತು ಫಲಪ್ರಾಪ್ತಿಯ ಅಚಲ ವಿಶ್ವಾಸ.",
        hi: "अहंकार का विसर्जन, ईश्वरार्पण बुद्धि एवं मनोरथ सिद्धि का परम विश्वास।",
        te: "అహంకార త్యాగం, ఈశ్వరార్పణ భావన మరియు సత్ఫల ప్రాప్తి విశ్వాసం.",
        ta: "ஆணவம் நீங்கி இறைவனிடம் சரணாகதி அடைந்து பலன் பெறும் பக்தி நிலை.",
        en: "Complete surrender of human ego to the Supreme Divinity, guaranteeing peaceful fulfillment."
      }
    },

    // ── STEP 5: DEEPARADHANA, SASHTANGA NAMASKARA & SHANTI (~60s) ──
    {
      step: 5,
      key: "deeparadhana_namaskara",
      titleKn: "೫. ದೀಪಾರಾಧನೆ (ಆರತಿ), ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ & ಶಾಂತಿ",
      titleEn: "5. Deeparadhana (Arati), Namaskara & Peace",
      titleHi: "५. दीपाराधना (आरती), साष्टांग नमस्कार एवं शांति",
      titleTe: "5. దీపారాధన (హారతి), సాష్టాంగ నమస్కారం & శాంతి",
      titleTa: "5. தீபாராதனை (ஆரத்தி), சாஷ்டாங்க நமஸ்காரம் & சாந்தி",
      icon: "🔔",
      approxSeconds: 60,
      visualEffect: "arathi",
      sanskritMantra: `ಕರ್ಪೂರ ಗೌರಂ ಕರುಣಾವತಾರಂ ಸಂಸಾರ ಸಾರಂ ಭುಜಗೇಂದ್ರ ಹಾರಮ್ ।
ಸದಾ ವಸಂತಂ ಹೃದಯಾರವಿಂದೇ ಭವಂ ಭವಾನೀ ಸಹಿತಂ ನಮಾಮಿ ॥
ಕಾಯೇನ ವಾಚಾ ಮನಸೇಂದ್ರಿಯೈರ್ವಾ ಬುದ್ಧ್ಯಾತ್ಮನಾ ವಾ ಪ್ರಕೃತಿಸ್ಸ್ವಭಾವಾತ್ ।
ಕರೋಮಿ ಯದ್ಯತ್ ಸಕಲಂ ಪರಸ್ಮೈ ನಾರಾಯಣಾಯೇತಿ ಸಮರ್ಪಯಾಮಿ ॥
ಓಂ ದ್ಯೌಃ ಶಾಂತಿಃ ಅಂತರಿಕ್ಷಂ ಶಾಂತಿಃ ಪೃಥಿವೀ ಶಾಂತಿಃ ಆಪಃ ಶಾಂತಿಃ ಓಷಧಯಃ ಶಾಂತಿಃ ।
ವನಸ್ಪತಯಃ ಶಾಂತಿಃ ವಿಶ್ವೇದೇವಾಃ ಶಾಂತಿಃ ಬ್ರಹ್ಮ ಶಾಂತಿಃ ಸರ್ವಂ ಶಾಂತಿಃ ಶಾಂತಿರೇವ ಶಾಂತಿಃ ಸಾ ಮಾ ಶಾಂತಿರೆಧಿ ॥
ಓಂ ಶಾಂತಿಃ ಶಾಂತಿಃ ಶಾಂತಿಃ ॥`,
      narrationText: {
        kn: `ಈಗ ಕರ್ಪೂರ ಅಥವಾ ತುಪ್ಪದ ದೀಪದಿಂದ ಭಗವಂತನಿಗೆ ಮಂಗಳಾರತಿ ಎತ್ತಿ. ಭಕ್ತಿಯಿಂದ ದೇವರಿಗೆ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ, ಆರತಿಯ ಪವಿತ್ರ ಜ್ಯೋತಿಯನ್ನು ಕಣ್ಣುಗಳಿಗೆ ಮುಟ್ಟಿಸಿಕೊಂಡು ಪ್ರಸಾದವನ್ನು ಸ್ವೀಕರಿಸಿ. ಇಂದಿನ ನಿಮ್ಮ ದಿನವು ಶಾಂತಿ, ಧೈರ್ಯ ಮತ್ತು ಯಶಸ್ಸಿನಿಂದ ಕೂಡಿರಲಿ. ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ.`,
        hi: `अब कपूर या घी के दीप से भगवान की मंगल आरती करें। श्रद्धा से साष्टांग प्रणाम कर आरती की पावन ज्योति को नयनों से स्पर्श कराएं। आपका आज का संपूर्ण दिन मंगलमय, शांत और सिद्धियों से युक्त रहे। श्री महाबलेश्वर प्रसन्न।`,
        te: `ఇప్పుడు కర్పూరం లేదా నెయ్యి దీపంతో భగవంతునికి మంగళ హారతి ఇవ్వండి. భక్తితో సాష్టాంగ నమస్కారం చేసి హారతి జ్యోతిని కళ్ళకు అద్దుకోండి. మీ నేటి దినమంతా సుఖశాంతులు, విజయాలతో విలసిల్లుగాక. శ్రీ మహాబలేశ్వర ప్రసన్నం.`,
        ta: `இப்போது கற்பூரம் அல்லது நெய் தீபத்தால் இறைவனுக்கு மங்கள தீபாராதனை காட்டவும். பயபக்தியோடு சாஷ்டாங்கமாக நமஸ்கரித்து தீப ஒளியை கண்களில் ஒற்றிக் கொள்ளுங்கள். உங்கள் இன்றைய நாள் முழுவதும் அமைதியும் மங்களமும் நிறையட்டும். ஸ்ரீ மகாபலேஸ்வர பிரசன்னம்.`,
        en: `Perform the auspicious Mangalarati with camphor or ghee lamp. Bow down in humble Sashtanga Namaskara, take the sacred light to your eyes, and receive divine grace. May your entire day be filled with peace, courage, and auspicious accomplishments. Shri Mahabaleshwara Prasanna.`
      },
      actionGuide: {
        kn: "ಆರತಿಯನ್ನು ದೇವರಿಗೆ ವೃತ್ತಾಕಾರದಲ್ಲಿ ಬೆಳಗಿಸಿ, ಮೂರು ಬಾರಿ ಪ್ರದಕ್ಷಿಣೆ ಅಥವಾ ನಮಸ್ಕಾರ ಮಾಡಿ, ಕಣ್ಣಿಗೆ ಆರತಿ ತೆಗೆದುಕೊಂಡು ಕೈ ಮುಗಿಯಿರಿ.",
        hi: "भगवान के सम्मुख आरती को गोलाकार घुमाएं, साष्टांग प्रणाम करें और आरती की ज्योति नयनों से स्पर्श कर आशीर्वाद लें।",
        te: "హారతిని భగవంతునికి గుండ్రంగా చూపించి, సాష్టాంగ ప్రణామం చేసి హారతి వెలుగును కళ్ళకు అద్దుకోండి.",
        ta: "ஆரத்தியை இறைவனுக்கு வட்டமாக சுழற்றி காட்டி, சாஷ்டாங்க நமஸ்காரம் செய்து தீப ஒளியை கண்களில் ஒற்றிக் கொள்ளவும்.",
        en: "Wave the Arati lamp in gentle clockwise circles, prostrate in humble Namaskara, and take the sacred flame to your eyes."
      },
      spiritualSignificance: {
        kn: "ಪೂಜಾ ಫಲ ಸಂಪೂರ್ಣತೆ, ಪರಮ ಶಾಂತಿ ಮತ್ತು ದೇವತಾ ಆಶೀರ್ವಾದ ಸಿದ್ಧಿ.",
        hi: "पूजा की संपूर्ण सिद्धि, परम शांति एवं भगवत्कृपा की प्राप्ति।",
        te: "పూజా ఫల పరిపూర్ణత, పరమ శాంతి మరియు దైవానుగ్రహ ప్రాప్తి.",
        ta: "பூஜை நிறைவுற்று பரிபூரண சாந்தியும் தெய்வ அருளும் சித்தித்தல்.",
        en: "Culmination of worship, radiating eternal peace, divine protective armor, and auspicious vitality."
      }
    }
  ];
}
