/**
 * Hand-authored five-language vocabulary for the Premium PDF.
 *
 * Every string here is written once per language by hand. Nothing on this page
 * goes through a machine translator at runtime, which is what stops a Kannada
 * book from picking up stray English words or oddly translated proper nouns.
 *
 * Graha, rashi, nakshatra and month names are reused from the Seva locale so
 * the whole product speaks with one vocabulary.
 */

import {
  type L5,
  type SevaLang,
  type GrahaKey,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  MONTH_L5
} from "../seva/sevaLocale";
import { transliterateName } from "../../utils/transliterator";

export type { L5, SevaLang, GrahaKey };
export { pick, GRAHA_L5, RASHI_L5, NAKSHATRA_L5, MONTH_L5 };

/* ------------------------------------------------------------------ *
 * Section titles and labels
 * ------------------------------------------------------------------ */

export const PDF_T: Record<string, L5> = {
  title: {
    en: "Baggona Panchanga",
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ",
    te: "బగ్గోణ పంచాంగం",
    ta: "பக்கோண பஞ்சாங்கம்",
    hi: "बग्गोण पंचांग"
  },
  subtitle: {
    en: "Detailed Astrology Reading",
    kn: "ವಿಸ್ತೃತ ಜ್ಯೋತಿಷ್ಯ ಫಲ",
    te: "వివరమైన జ్యోతిష్య ఫలితం",
    ta: "விரிவான ஜோதிட பலன்",
    hi: "विस्तृत ज्योतिष फल"
  },

  nameLabel: { en: "Name", kn: "ಹೆಸರು", te: "పేరు", ta: "பெயர்", hi: "नाम" },
  dobLabel: {
    en: "Birth Details",
    kn: "ಜನ್ಮ ವಿವರ",
    te: "జన్మ వివరాలు",
    ta: "பிறப்பு விவரம்",
    hi: "जन्म विवरण"
  },
  lagnaLabel: {
    en: "Birth Lagna",
    kn: "ಜನ್ಮ ಲಗ್ನ",
    te: "జన్మ లగ్నం",
    ta: "ஜென்ம லக்னம்",
    hi: "जन्म लग्न"
  },
  moonLabel: {
    en: "Moon Sign",
    kn: "ಚಂದ್ರ ರಾಶಿ",
    te: "చంద్ర రాశి",
    ta: "சந்திர ராசி",
    hi: "चंद्र राशि"
  },
  nakshatraLabel: {
    en: "Nakshatra",
    kn: "ನಕ್ಷತ್ರ",
    te: "నక్షత్రం",
    ta: "நட்சத்திரம்",
    hi: "नक्षत्र"
  },
  eraLabel: {
    en: "Current Period",
    kn: "ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲ",
    te: "ప్రస్తుత దశా కాలం",
    ta: "தற்போதைய தசைக் காலம்",
    hi: "वर्तमान दशा काल"
  },
  dashaLabel: {
    en: "Mahadasha",
    kn: "ಮಹಾದಶೆ",
    te: "మహాదశ",
    ta: "மகாதசை",
    hi: "महादशा"
  },
  bhuktiLabel: { en: "Bhukti", kn: "ಭುಕ್ತಿ", te: "భుక్తి", ta: "புக்தி", hi: "भुक्ति" },

  padaLabel: { en: "Pada", kn: "ಪಾದ", te: "పాదం", ta: "பாதம்", hi: "पाद" },
  lagnaLordLabel: { en: "Lagna Lord", kn: "ಲಗ್ನಾಧಿಪತಿ", te: "లగ్నాధిపతి", ta: "லக்னாதிபதி", hi: "लग्नेश" },
  moonLordLabel: { en: "Rashi Lord", kn: "ರಾಶ್ಯಾಧಿಪತಿ", te: "రాశ్యాధిపతి", ta: "ராசியாதிபதி", hi: "राशीश" },
  tithiLabel: { en: "Birth Tithi", kn: "ಜನ್ಮ ತಿಥಿ", te: "జన్మ తిథి", ta: "ஜென்ம திதி", hi: "जन्म तिथि" },
  weekdayLabel: { en: "Birth Day", kn: "ಜನ್ಮ ವಾರ", te: "జన్మ వారం", ta: "ஜென்ம வாரம்", hi: "जन्म वार" },

  prescriptionsTitle: {
    en: "Royal Astro-Vedic Prescriptions & Sacred Alignments",
    kn: "ರಾಜ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ರಕ್ಷೆ ಹಾಗೂ ಪವಿತ್ರ ಶುಭ ಸಾನ್ನಿಧ್ಯಗಳು",
    te: "రాజ వైదిక జ్యోతిష రక్ష మరియు పవిత్ర శుభ సాన్నిధ్యాలు",
    ta: "ராஜ வைதிக ஜோதிட ரக்ஷை மற்றும் புனித சுப தொடர்புகள்",
    hi: "राज वैदिक ज्योतिषीय रक्षा एवं पवित्र शुभ सान्निध्य"
  },
  gemstoneLabel: { en: "Lucky Gemstone", kn: "ಅದೃಷ್ಟ ರತ್ನ", te: "అదృష్ట రత్నం", ta: "அதிர்ஷ்ட ரத்தினம்", hi: "भाग्य रत्न" },
  rudrakshaLabel: { en: "Sacred Rudraksha", kn: "ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ", te: "పవిత్ర రుద్రాక్ష", ta: "புனித ருத்ராட்சம்", hi: "पवित्र रुद्राक्ष" },
  ishtaDevataLabel: { en: "Ishta Devata", kn: "ಇಷ್ಟ ದೇವತೆ", te: "ఇష్ట దైవం", ta: "இஷ்ட தெய்வம்", hi: "इष्ट देवता" },
  luckyColorsLabel: { en: "Auspicious Colors", kn: "ಶುಭ ವರ್ಣಗಳು", te: "శుభ వర్ణాలు", ta: "சுப நிறங்கள்", hi: "शुभ रंग" },
  luckyDaysLabel: { en: "Auspicious Days", kn: "ಶುಭ ವಾರಗಳು", te: "శుభ వారాలు", ta: "சுப கிழமைகள்", hi: "शुभ वार" },
  luckyNumbersLabel: { en: "Auspicious Numbers", kn: "ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು", te: "అదృష్ట సంఖ్యలు", ta: "அதிர்ஷ்ட எண்கள்", hi: "शुभ अंक" },
  luckyDirectionLabel: { en: "Auspicious Direction", kn: "ಶುಭ ದಿಕ್ಕು", te: "శుభ దిశ", ta: "சுப திசை", hi: "शुभ दिशा" },
  neckWearLabel: {
    en: "Janma Nakshatra Neck Wear",
    kn: "ಜನ್ಮ ನಕ್ಷತ್ರದ ಕೊರಳ ಧಾರಣೆ",
    te: "జన్మ నక్షత్ర కంఠ ధారణ",
    ta: "ஜன்ம நட்சத்திர கழுத்து ஆபரணம்",
    hi: "जन्म नक्षत्र कंठ धारण"
  },
  prohibitedGemsLabel: {
    en: "Strict Prohibited Gemstones (Severe Warning)",
    kn: "ಕಟ್ಟುನಿಟ್ಟಾದ ವರ್ಜ್ಯ ರತ್ನಗಳು (ಎಂದಿಗೂ ಧರಿಸಬೇಡಿ!)",
    te: "ఖచ్చితంగా నిషేధించబడిన రత్నాలు (ఎప్పుడూ ధరించవద్దు!)",
    ta: "முற்றிலும் தவிர்க்க வேண்டிய ரத்தினங்கள் (அணியக் கூடாது!)",
    hi: "सख्त वर्जित रत्न (कदापि धारण न करें!)"
  },
  avoidColorsLabel: {
    en: "Strict Avoid Colors",
    kn: "ಕಟ್ಟುನಿಟ್ಟಾಗಿ ವರ್ಜ್ಯ ಮಾಡಬೇಕಾದ ಬಣ್ಣಗಳು",
    te: "ఖచ్చితంగా నివారించవలసిన రంగులు",
    ta: "கட்டாயம் தவிர்க்க வேண்டிய நிறங்கள்",
    hi: "सख्त वर्जित रंग"
  },
  consecrationMuhurthaLabel: {
    en: "Auspicious Consecration Muhurtha",
    kn: "ಪ್ರಾಣ ಪ್ರತಿಷ್ಠಾಪನೆ & ಧಾರಣಾ ಮುಹೂರ್ತ",
    te: "ప్రాణ ప్రతిష్ఠ & ధారణ ముహూర్తం",
    ta: "பிராண பிரதிஷ்டை & அணியும் முகூர்த்தம்",
    hi: "प्राण प्रतिष्ठा एवं धारण मुहूर्त"
  },

  soulMirrorTitle: {
    en: "The Sacred Soul Mirror: Sovereign Truths & Cosmic Vitality",
    kn: "ಅಧ್ಯಾಯ ೧: ಅಂತರಂಗದ ತ್ರಿವಿಧ ಸತ್ಯಗಳು ಹಾಗೂ ಪಂಚಭೂತ ಚೇತನ ಶಕ್ತಿ",
    te: "అధ్యాయం 1: అంతరంగ త్రివిధ సత్యాలు & పంచభూత చేతన శక్తి",
    ta: "அத்தியாயம் 1: அந்தரங்கத்தின் மும்மை உண்மைகள் & பஞ்சபூத ஜீவசக்தி",
    hi: "अध्याय १: अंतर्मन के त्रिविध सत्य एवं पंचभूत चेतना शक्ति"
  },
  elementalBalanceTitle: {
    en: "Cosmic Elemental Balance (Pancha Bhoota)",
    kn: "ಪಂಚಭೂತ ತತ್ವ ಸಮತೋಲನ",
    te: "పంచభూత తత్త్వ సమతుల్యత",
    ta: "பஞ்சபூத தத்துவ சமநிலை",
    hi: "पंचभूत तत्त्व संतुलन"
  },
  cosmicShieldTitle: {
    en: "Cosmic Shield Graha (Protective Guardian)",
    kn: "ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ ಗ್ರಹ",
    te: "జాతక రక్షా కవచ గ్రహం",
    ta: "ஜாதக ரக்ஷா கவச கிரகம்",
    hi: "कुंडली रक्षा कवच ग्रह"
  },
  mindVitalityTitle: {
    en: "Mind Vitality & Lunar Radiance (Chandra Bala)",
    kn: "ಚೇತನ ಶಕ್ತಿ ಹಾಗೂ ಚಂದ್ರ ಬಲ",
    te: "చేతన శక్తి & చంద్ర బలం",
    ta: "ஜீவசக்தி மற்றும் சந்திர பலம்",
    hi: "चेतना शक्ति एवं चंद्र बल"
  },

  characteristicsTitle: {
    en: "Characteristics of the Person",
    kn: "ವ್ಯಕ್ತಿತ್ವದ ಗುಣಲಕ್ಷಣಗಳು",
    te: "వ్యక్తిత్వ లక్షణాలు",
    ta: "ஆளுமைப் பண்புகள்",
    hi: "व्यक्तित्व के लक्षण"
  },
  characteristicsQuestion: {
    en: "Question: What are my core characteristics, innate strengths, and natural conduct based on my Lagna and Nakshatra?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ವ್ಯಕ್ತಿತ್ವದ ನೈಜ ಗುಣಲಕ್ಷಣಗಳು, ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಸ್ವಭಾವ ಹೇಗಿದೆ? ನನ್ನ ಜನ್ಮ ಲಗ್ನ ಮತ್ತು ನಕ್ಷತ್ರದ ನೈಜ ಪ್ರಭಾವವೇನು?",
    te: "ప్రశ్న: నా వ్యక్తిత్వ లక్షణాలు, సామర్థ్యం మరియు అంతర్గత స్వభావం ఎలా ఉన్నాయి? నా జన్మ లగ్నం మరియు నక్షత్ర ప్రభావం ఏమిటి?",
    ta: "கேள்வி: எனது ஆளுமைப் பண்புகள், திறன்கள் மற்றும் உள் சுபாவம் எவ்வாறு உள்ளது? எனது லக்னம் மற்றும் நட்சத்திரத்தின் தாக்கம் என்ன?",
    hi: "प्रश्न: मेरे व्यक्तित्व के वास्तविक लक्षण, सामर्थ्य और आंतरिक स्वभाव कैसा है? मेरे जन्म लग्न और नक्षत्र का वास्तविक प्रभाव क्या है?"
  },
  darkSecretQuestion: {
    en: "Question: What is my deepest hidden truth? What unspoken fears, emotional vulnerabilities, and silent burdens am I concealing from the world?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯವೇನು? ಸುಪ್ತಪ್ರಜ್ಞೆ ಮತ್ತು ಜಾಗೃತ ಮನಸ್ಸಿನಲ್ಲಿ ನಾನು ಎಲ್ಲರಿಂದಲೂ ಮುಚ್ಚಿಡುತ್ತಿರುವ ಕರಾಳ ಸತ್ಯಗಳು, ಆತಂಕಗಳು ಹಾಗೂ ಗುಪ್ತ ವಿಚಾರಗಳು ಯಾವುವು?",
    te: "ప్రశ్న: నా అంతరంగంలోని నిగూఢ రహస్యమేమిటి? నా ఉపచేతన మరియు చేతన మనస్సులో నేను అందరినుంచీ దాస్తున్న రహస్యాలు, భయాలు ఏమిటి?",
    ta: "கேள்வி: எனது ஆழ்மனதின் ரகசியம் என்ன? எனது நனவு மற்றும் ஆழ்மனதில் மற்றவர்களிடமிருந்து நான் மறைத்து வைத்திருக்கும் உண்மைகளும் பயங்களும் யாவை?",
    hi: "प्रश्न: मेरे अंतर्मन का गूढ़ रहस्य क्या है? मेरे अवचेतन और चेतन मन में वे कौन से अनकहे सच और गुप्त भय हैं जिन्हें मैं सभी से छुपा रहा हूँ?"
  },
  currentPhaseQuestion: {
    en: "Question: What is currently happening in my life right now? What is the real impact of my running Dasha-Bhukti, Gochara transits, and Sandhi transition?",
    kn: "ಪ್ರಶ್ನೆ: ಪ್ರಸ್ತುತ ನನ್ನ ಜೀವನದಲ್ಲಿ ನಿಖರವಾಗಿ ಏನಾಗುತ್ತಿದೆ? ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ, ಗೋಚಾರ ಮತ್ತು ಸಂಧಿ ಕಾಲದ ನೈಜ ಸ್ಥಿತಿಗತಿ ಏನು?",
    te: "ప్రశ్న: ప్రస్తుతం నా జీవితంలో ఖచ్చితంగా ఏమి జరుగుతోంది? నా ప్రస్తుత దశా-భుక్తి, గోచార మరియు సంధి కాల స్థితిగతులు ఏమిటి?",
    ta: "கேள்வி: தற்போது என் வாழ்க்கையில் உண்மையில் என்ன நடக்கிறது? எனது நடப்பு தசா-புக்தி, கோச்சாரம் மற்றும் சந்தி காலத்தின் தாக்கம் என்ன?",
    hi: "प्रश्न: वर्तमान में मेरे जीवन में वास्तविक रूप से क्या घटित हो रहा है? मेरी वर्तमान दशा-भुक्ति, गोचर और संधि काल का यथार्थ प्रभाव क्या है?"
  },
  marriageQuestion: {
    en: "Question: What is the status of my marriage and partnership? How are my marital prospects, spousal harmony, and domestic tranquility aligned?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಮದುವೆ / ದಾಂಪತ್ಯ ಜೀವನದ ವಿಷಯ ಹೇಗಿದೆ? ವಿವಾಹ ಭಾಗ್ಯ, ಸಂಗಾತಿ ಯೋಗ ಮತ್ತು ದಾಂಪತ್ಯ ಸುಖ ಹೇಗಿರಲಿದೆ?",
    te: "ప్రశ్న: నా వివాహం మరియు దాంపత్య జీవితం ఎలా ఉండబోతోంది? వివాహ యోగం, జీవిత భాగస్వామి మరియు దాంపత్య సౌఖ్యం ఎలా ఉంటుంది?",
    ta: "கேள்வி: எனது திருமணம் மற்றும் தாம்பத்திய வாழ்க்கை எவ்வாறு அமையவுள்ளது? திருமண யோகம் மற்றும் இல்வாழ்க்கை அமைதி எப்படி இருக்கும்?",
    hi: "प्रश्न: मेरे विवाह और दांपत्य जीवन का विषय कैसा है? विवाह योग, जीवनसाथी का स्वभाव और दांपत्य सुख कैसा रहेगा?"
  },
  childrenQuestion: {
    en: "Question: What is the status of my progeny and education? What are the prospects for children's well-being, intellectual growth, and academic milestones?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಸಂತಾನ ಮತ್ತು ವಿದ್ಯಾ ವಿಷಯ ಹೇಗಿದೆ? ಸಂತಾನ ಭಾಗ್ಯ, ಮಕ್ಕಳ ಶ್ರೇಯಸ್ಸು ಅಥವಾ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದ ಸ್ಥಿತಿ ಹೇಗಿದೆ?",
    te: "ప్రశ్న: నా సంతానం మరియు విద్యా విషయాలు ఎలా ఉన్నాయి? సంతాన ప్రాప్తి, పిల్లల భవిష్యత్తు లేదా విద్యాభ్యాసం ఎలా ఉంటుంది?",
    ta: "கேள்வி: எனது சந்தானம் மற்றும் கல்வி நிலை எவ்வாறு உள்ளது? குழந்தை பாக்கியம், குழந்தைகளின் மேன்மை அல்லது கல்வி வளர்ச்சி எப்படி இருக்கும்?",
    hi: "प्रश्न: मेरी संतान और विद्या का विषय कैसा है? संतान सुख, बच्चों की उन्नति अथवा उच्च शिक्षा की क्या स्थिति है?"
  },
  careerQuestion: {
    en: "Question: What is the status of my career and profession? What are my prospects for vocational growth, promotion, authority, and professional stability?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿಜೀವನದ ವಿಷಯದಲ್ಲಿ ಹೇಗಿದೆ? ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಯಶಸ್ಸು, ಸ್ಥಾನಮಾನ, ಪದೋನ್ನತಿ ಮತ್ತು ಸ್ಥಿರತೆ ಹೇಗಿರಲಿದೆ?",
    te: "ప్రశ్న: నా ఉద్యోగ మరియు వృత్తిపరమైన విషయాలలో పరిస్థితి ఏమిటి? కార్యరంగంలో పదోన్నతి, విజయం, గౌరవం మరియు స్థిరత్వం ఎలా ఉంటాయి?",
    ta: "கேள்வி: எனது தொழில் மற்றும் உத்தியோக வாழ்க்கை எவ்வாறு இருக்கும்? பணித்துறையில் வெற்றி, பதவி உயர்வு, அந்தஸ்து மற்றும் ஸ்திரத்தன்மை எப்படி அமையும்?",
    hi: "प्रश्न: मेरी नौकरी और आजीविका के विषय में क्या स्थिति है? कार्यक्षेत्र में पदोन्नति, सफलता, मान-सम्मान और स्थिरता कैसी रहेगी?"
  },
  wealthQuestion: {
    en: "Question: What is the status of my wealth and finances? What are my prospects for income accumulation, asset acquisition, debt freedom, and material prosperity?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಧನ, ಸಂಪತ್ತು ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿತಿಯ ವಿಷಯ ಹೇಗಿದೆ? ಧನಾಗಮನ, ಉಳಿತಾಯ, ಆಸ್ತಿ ಪಾಸ್ತಿ ಮತ್ತು ಆರ್ಥಿಕ ಸುಭಿಕ್ಷತೆ ಹೇಗಿರಲಿದೆ?",
    te: "ప్రశ్న: నా ధన, సంపద మరియు ఆర్థిక స్థితిగతులు ఎలా ఉండబోతున్నాయి? ధనాగమనం, ఆస్తుల వృద్ధి మరియు ఆర్థిక స్థిరత్వం ఎలా ఉంటుంది?",
    ta: "கேள்வி: எனது தனம், செல்வம் மற்றும் நிதிநிலை எவ்வாறு இருக்கும்? பண வரவு, சேமிப்பு, சொத்து சேர்க்கை மற்றும் பொருளாதார முன்னேற்றம் எப்படி அமையும்?",
    hi: "प्रश्न: मेरे धन, संपत्ति और आर्थिक स्थिति का विषय कैसा है? धनागमन, संचित पूंजी, संपत्ति लाभ और आर्थिक समृद्धि कैसी रहेगी?"
  },
  healthQuestion: {
    en: "Question: What is the status of my health and physical vitality? What are my natural immunity, somatic vulnerabilities, mental equanimity, and longevity indicators?",
    kn: "ಪ್ರಶ್ನೆ: ನನ್ನ ಆರೋಗ್ಯ ಮತ್ತು ದೈಹಿಕ ಸಾಮರ್ಥ್ಯದ ವಿಷಯ ಹೇಗಿದೆ? ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ, ದೈಹಿಕ ಬಾಧೆಗಳು, ಮಾನಸಿಕ ಸಮತೋಲನ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯದ ಸ್ಥಿತಿ ಏನು?",
    te: "ప్రశ్న: నా ఆరోగ్యం మరియు శారీరక దృఢత్వం ఎలా ఉండబోతోంది? రోగ నిరోధక శక్తి, శారీరక రుగ్మతలు, మానసిక ప్రశాంతత మరియు ఆయుర్దాయం ఎలా ఉంటాయి?",
    ta: "கேள்வி: எனது ஆரோக்கியம் மற்றும் உடல் பலம் எவ்வாறு இருக்கும்? நோய் எதிர்ப்பு சக்தி, உடல் உபாதைகள், மன அமைதி மற்றும் நீண்ட ஆயுள் எப்படி அமையும்?",
    hi: "प्रश्न: मेरे स्वास्थ्य और शारीरिक सामर्थ्य का विषय कैसा है? रोग प्रतिरोधक क्षमता, शारीरिक कष्ट, मानसिक संतुलन और दीर्घायु की क्या स्थिति है?"
  },
  darkSecretTitle: {
    en: "The Hidden Truth",
    kn: "ನಿಗೂಢ ರಹಸ್ಯ",
    te: "నిగూఢ రహస్యం",
    ta: "மறைபொருள் ரகசியம்",
    hi: "निगूढ़ रहस्य"
  },
  currentPhaseTitle: {
    en: "Current Mindset & Life Phase (Present Period)",
    kn: "ಪ್ರಸ್ತುತ ಮನಸ್ಥಿತಿ ಮತ್ತು ಜೀವನ (ವರ್ತಮಾನ ಕಾಲ)",
    te: "ప్రస్తుత మనస్థితి మరియు జీవితం (వర్తమాన కాలం)",
    ta: "தற்போதைய மனநிலை மற்றும் வாழ்க்கை கட்டம் (தற்போதைய காலம்)",
    hi: "वर्तमान मनस्थिति एवं जीवन काल (वर्तमान काल)"
  },
  currentPhaseGuidanceTitle: {
    en: "Present Planetary Influence & Divine Guidance",
    kn: "ಪ್ರಸ್ತುತ ಗ್ರಹ ಬಲ ಹಾಗೂ ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ",
    te: "ప్రస్తుత గ్రహ బలం మరియు దైవిక మార్గదర్శకత్వం",
    ta: "தற்போதைய கிரக பலன் மற்றும் தெய்வீக வழிகாட்டுதல்",
    hi: "वर्तमान ग्रह बल एवं दैवीय मार्गदर्शन"
  },
  yogasTitle: {
    en: "Special Planetary Combinations",
    kn: "ವಿಶೇಷ ಗ್ರಹ ಯೋಗಗಳು",
    te: "విశేష గ్రహ యోగాలు",
    ta: "விசேட கிரக யோகங்கள்",
    hi: "विशेष ग्रह योग"
  },
  doshasTitle: {
    en: "Karmic Challenges & Sacred Remedies",
    kn: "ಕರ್ಮ ಸವಾಲುಗಳು ಹಾಗೂ ದೋಷ ಪರಿಹಾರ ಮಾರ್ಗ",
    te: "కర్మ సవాళ్లు మరియు పవిత్ర పరిహారాలు",
    ta: "கர்ம சவால்கள் மற்றும் புனித பரிகாரங்கள்",
    hi: "कर्म चुनौतियां एवं शास्त्रोक्त उपाय"
  },
  remedyTitle: {
    en: "Remedy",
    kn: "ಪರಿಹಾರ",
    te: "పరిహారం",
    ta: "பரிகாரம்",
    hi: "परिहार"
  },
  timelineTitle: {
    en: "The Next Six Months",
    kn: "ಮುಂದಿನ ಆರು ತಿಂಗಳ ಫಲ",
    te: "రాబోయే ఆరు నెలల ఫలితం",
    ta: "அடுத்த ஆறு மாத பலன்",
    hi: "आगामी छह माह का फल"
  },
  gocharaTitle: {
    en: "Current Planetary Transits",
    kn: "ಪ್ರಸ್ತುತ ಗೋಚಾರ ಫಲ",
    te: "ప్రస్తుత గోచార ఫలితం",
    ta: "தற்போதைய கோசார பலன்",
    hi: "वर्तमान गोचर फल"
  },
  summaryTitle: {
    en: "The Astrologer's Summary",
    kn: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ",
    te: "జ్యోతిష్కుని సారాంశం",
    ta: "ஜோதிடரின் சுருக்கம்",
    hi: "ज्योतिषी का सारांश"
  },
  cosmicAuraTitle: {
    en: "Your Active Ruling Mahadasha Planet & Natal Protective Shield",
    kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮನ್ನು ನಡೆಸುತ್ತಿರುವ ದಶಾಧಿಪತಿ ಗ್ರಹ ಹಾಗೂ ಜನ್ಮ ಕುಂಡಲಿ ರಕ್ಷಾ ಕವಚ",
    te: "ప్రస్తుతం మిమ్మల్ని నడిపిస్తున్న దశాధిపతి గ్రహం & జన్మ కుండలి రక్షా కవచం",
    ta: "தற்போது உங்களை வழிநடத்தும் தசாநாத கிரகமும் ஜென்ம ஜாதக பாதுகாப்புக் கவசமும்",
    hi: "वर्तमान में आपका मार्गदर्शन करने वाला दशाधिपति ग्रह एवं जन्म कुंडली रक्षा कवच"
  },
  annualForecastTitle: {
    en: "Next 1-Year Master Forecast & Cosmic Dasha-Gochara Vision",
    kn: "ಮುಂದಿನ ೧ ವರ್ಷದ ಮಹತ್ವದ ಭವಿಷ್ಯ ಹಾಗೂ ಗೋಚಾರ-ದಶಾಫಲ",
    te: "రాబోయే 1 సంవత్సర సమగ్ర భవిష్యత్తు మరియు గోచార-దశాఫలితం",
    ta: "அடுத்த 1 ஆண்டு முக்கிய பலன்கள் மற்றும் கோசார-தசா பலன்",
    hi: "आगामी १ वर्ष का महत्वपूर्ण भविष्यफल एवं गोचर-दशाफल"
  },
  dashaGocharaCompassTitle: {
    en: "Sovereign Dasha-Gochara Synthesis: Shani-Guru Compass & Golden Windows",
    kn: "ದಶಾ-ಗೋಚಾರ ಸುವರ್ಣ ಸಮನ್ವಯ: ಶನಿ-ಗುರು ಗೋಚಾರ ಚಕ್ರ ಹಾಗೂ ಸುವರ್ಣ ಕರ್ಮಾವಧಿ",
    te: "దశా-గోచార సువర్ణ సమన్వయం: శని-గురు గోచార చక్రం & శుభ కర్మ కాలం",
    ta: "திசா-கோச்சார பொன் ஒருங்கிணைப்பு: சனி-குரு கோச்சார சக்கரமும் சுப கர்ம காலமும்",
    hi: "दशा-गोचर स्वर्णिम समन्वय: शनि-गुरु गोचर चक्र एवं शुभ कर्म कालखंड"
  },
  dashaGocharaCompassSubtitle: {
    en: "॥ Gochara-Dasha Samanvayena Sarvakarya Siddhih ॥",
    kn: "॥ ಗೋಚಾರ-ದಶಾ ಸಮನ್ವಯೇನ ಸರ್ವಕಾರ್ಯ ಸಿದ್ಧಿಃ ॥",
    te: "॥ గోచార-దశా సమన్వయేన సర్వకార్య సిద్ధిః ॥",
    ta: "॥ கோச்சார-திசா ஒருங்கிணைப்பால் சர்வகாரிய சித்தி ॥",
    hi: "॥ गोचार-दशा समन्वयेन सर्वकार्य सिद्धिः ॥"
  },
  ashirvadaTitle: {
    en: "Blessing",
    kn: "ಆಶೀರ್ವಾದ",
    te: "ఆశీర్వాదం",
    ta: "ஆசீர்வாதம்",
    hi: "आशीर्वाद"
  },
  introTitle: {
    en: "A Word Before We Begin",
    kn: "ಆರಂಭಕ್ಕೂ ಮೊದಲು ಒಂದು ಮಾತು",
    te: "ప్రారంభానికి ముందు ఒక మాట",
    ta: "தொடங்கும் முன் ஒரு வார்த்தை",
    hi: "आरम्भ से पहले एक बात"
  },
  namaskara: {
    en: "Namaskara",
    kn: "ನಮಸ್ಕಾರ",
    te: "నమస్కారం",
    ta: "வணக்கம்",
    hi: "नमस्कार"
  },
  introPrepared: {
    en: "This reading has been prepared for you alone, from your own birth chart.",
    kn: "ಈ ಫಲವನ್ನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಆಧಾರದ ಮೇಲೆ ನಿಮಗಾಗಿಯೇ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",
    te: "ఈ ఫలితాన్ని మీ జన్మ కుండలి ఆధారంగా మీ కోసమే సిద్ధం చేయడమైనది.",
    ta: "இந்தப் பலன் உங்கள் ஜாதகத்தின் அடிப்படையில் உங்களுக்காகவே தயாரிக்கப்பட்டுள்ளது.",
    hi: "यह फल आपकी जन्म कुंडली के आधार पर केवल आपके लिए तैयार किया गया है।"
  },
  introBegin: {
    en: "Below, your complete reading begins.",
    kn: "ಇನ್ನು ಕೆಳಗೆ ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಫಲ ಆರಂಭವಾಗುತ್ತದೆ.",
    te: "ఇక క్రింద మీ సంపూర్ణ ఫలితం ప్రారంభమవుతుంది.",
    ta: "இனி கீழே உங்கள் முழுமையான பலன் தொடங்குகிறது.",
    hi: "अब नीचे आपका सम्पूर्ण फल आरम्भ होता है।"
  },
  footer: {
    en: "॥ Baggona Panchanga Publication ॥",
    kn: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಕಾಶನ ॥",
    te: "॥ బగ్గోణ పంచాంగ ప్రచురణ ॥",
    ta: "॥ பக்கோண பஞ்சாங்க வெளியீடு ॥",
    hi: "॥ बग्गोण पंचांग प्रकाशन ॥"
  },
  ashirvadaValue: {
    en: "May the divine grace of Sri Mukhyaprana and the Nava Grahas bestow upon you steadfast wisdom, health, prosperity, and peace of mind.",
    kn: "ಶ್ರೀ ಮುಖ್ಯಪ್ರಾಣ ದೇವರ ಹಾಗೂ ನವಗ್ರಹಗಳ ದಿವ್ಯ ಕೃಪಾಕಟಾಕ್ಷದಿಂದ ನಿಮಗೆ ಸನ್ಮತಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಸಕಲ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಶಾಶ್ವತ ಮನಶ್ಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿ.",
    te: "శ్రీ ముఖ్యప్రాణ దేవుని మరియు నవగ్రహాల దివ్య కటాక్షంతో మీకు సద్బుద్ధి, దీర్ఘాయుష్షు, సమస్త శుభాలు మరియు శాశ్వత మనశ్శాంతి కలగాలి.",
    ta: "ஸ்ரீ முக்கியபிராண தேவர் மற்றும் நவக்கிரகங்களின் திவ்ய அருளால் உங்களுக்கு நற்புத்தி, நீண்ட ஆயுள், சகல சௌபாக்கியங்களும் நிலையான மன அமைதியும் உண்டாகட்டும்.",
    hi: "श्री मुख्यप्राण देव एवं नवग्रहों के दिव्य अनुग्रह से आपको सदबुद्धि, दीर्घायु, सर्व सौभाग्य एवं स्थायी मानसिक शांति की प्राप्ति हो।"
  }
};

export const tp = (key: keyof typeof PDF_T | string, lang: string): string => {
  const phrase = PDF_T[key as string];
  return phrase ? pick(phrase, lang) : String(key);
};

/* ------------------------------------------------------------------ *
 * The running-period sentence
 * ------------------------------------------------------------------ */

const RUNNING_SENTENCE: L5 = {
  en: "At this moment you are passing through the Mahadasha of {maha}, and within it the Bhukti of {bhukti}.",
  kn: "ಈ ಸಮಯದಲ್ಲಿ ನೀವು {maha} ಮಹಾದಶೆಯಲ್ಲಿ, ಅದರೊಳಗೆ {bhukti} ಭುಕ್ತಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದೀರಿ.",
  te: "ప్రస్తుతం మీరు {maha} మహాదశలో, దాని లోపల {bhukti} భుక్తిలో నడుస్తున్నారు.",
  ta: "இந்த நேரத்தில் நீங்கள் {maha} மகாதசையிலும், அதற்குள் {bhukti} புக்தியிலும் நடந்து கொண்டிருக்கிறீர்கள்.",
  hi: "इस समय आप {maha} महादशा में और उसके भीतर {bhukti} भुक्ति में चल रहे हैं।"
};

export const runningPeriodSentence = (
  lang: string,
  mahaLord: GrahaKey,
  bhuktiLord: GrahaKey
): string =>
  pick(RUNNING_SENTENCE, lang)
    .replace("{maha}", pick(GRAHA_L5[mahaLord], lang))
    .replace("{bhukti}", pick(GRAHA_L5[bhuktiLord], lang));

/** "Namaskara Ramesh," — the comma placement differs by script; transliterates name if non-English. */
export const greetingLine = (lang: string, name: string): string => {
  const hello = tp("namaskara", lang);
  let trimmed = (name || "").trim();
  if (!trimmed) return `${hello},`;
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang !== "en" && /[a-zA-Z]/.test(trimmed)) {
    trimmed = transliterateName(trimmed, baseLang);
  }
  return baseLang === "hi" ? `${hello} ${trimmed} जी,` : `${hello} ${trimmed},`;
};

/* ------------------------------------------------------------------ *
 * Comprehensive Chart Introduction Sentence (5-Language Templated)
 * ------------------------------------------------------------------ */

export interface ChartIntroDetails {
  name: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  birthWeekday: string;
  birthDateFormatted: string;
  birthTime: string;
  mahaLord?: string;
  bhuktiLord?: string;
}

const COMPREHENSIVE_INTRO_TEMPLATE: L5 = {
  en: "I have carefully analyzed your Janma Kundali. You were born under {lagna} Lagna, {moonSign} Rashi, and {nakshatra} Nakshatra on a {birthWeekday} ({birthDateFormatted} at {birthTime}). Currently, you are passing through {maha} Mahadasha and {bhukti} Bhukti. Based on these precise cosmic alignments, your detailed birth chart analysis is presented below.",
  kn: "ನಾನು ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯನ್ನು ಅತ್ಯಂತ ಶ್ರದ್ಧೆಯಿಂದ ಪರಿಶೀಲಿಸಿದ್ದೇನೆ. ನೀವು {birthWeekday} ({birthDateFormatted} ಸಮಯ {birthTime}) ದಿನದಂದು {lagna} ಲಗ್ನ, {moonSign} ರಾಶಿ ಮತ್ತು {nakshatra} ನಕ್ಷತ್ರದಲ್ಲಿ ಜನಿಸಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನೀವು {maha} ಮಹಾದಶೆಯಲ್ಲಿ {bhukti} ಭುಕ್ತಿಯಲ್ಲಿ ನಡೆಯುತ್ತಿದ್ದೀರಿ. ಈ ಗ್ರಹ ಸ್ಥಿತಿಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಮ್ಮ ಜಾತಕದ ವಿಸ್ತೃತ ಫಲಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.",
  te: "నేను మీ జన్మ కుండలిని అత్యంత శ్రద్ధతో పరిశీలించాను. మీరు {birthWeekday} ({birthDateFormatted} సమయం {birthTime}) రోజున {lagna} లగ్నం, {moonSign} రాశి మరియు {nakshatra} నక్షత్రంలో జన్మించారు. ప్రస్తుతం మీరు {maha} మహాదశలో {bhukti} భుక్తిలో నడుస్తున్నారు. ఈ గ్రహ స్థితుల ఆధారంగా మీ జాతక ఫలితాలు క్రింద వివరించబడ్డాయి.",
  ta: "நான் உங்கள் ஜென்ம ஜாதகத்தை மிகவும் கவனமாக ஆராய்ந்துள்ளேன். நீங்கள் {birthWeekday} ({birthDateFormatted} நேரம் {birthTime}) அன்று {lagna} லக்னம், {moonSign} ராசி மற்றும் {nakshatra} நட்சத்திரத்தில் அவதரித்துள்ளீர்கள். தற்போது நீங்கள் {maha} மகாதசையில் {bhukti} புக்தியில் நடந்து கொண்டிருக்கிறீர்கள். இதன் அடிப்படையில் உங்கள் விரிவான ஜாதக பலன்கள் கீழே வழங்கப்பட்டுள்ளன.",
  hi: "मैंने आपकी जन्म कुंडली का अत्यंत सूक्ष्मता से विश्लेषण किया है। आपका जन्म {birthWeekday} ({birthDateFormatted} समय {birthTime}) को {lagna} लग्न, {moonSign} राशि एवं {nakshatra} नक्षत्र में हुआ था। वर्तमान में आप {maha} महादशा एवं {bhukti} भुक्ति के प्रभाव में हैं। इन ग्रहों के आधार पर आपका विस्तृत फल नीचे प्रस्तुत है।"
};

export const buildComprehensiveIntro = (lang: string, details: ChartIntroDetails): string => {
  return pick(COMPREHENSIVE_INTRO_TEMPLATE, lang)
    .replace("{lagna}", details.lagna || "")
    .replace("{moonSign}", details.moonSign || "")
    .replace("{nakshatra}", details.nakshatra || "")
    .replace("{birthWeekday}", details.birthWeekday || "")
    .replace("{birthDateFormatted}", details.birthDateFormatted || "")
    .replace("{birthTime}", details.birthTime || "")
    .replace("{maha}", details.mahaLord || "")
    .replace("{bhukti}", details.bhuktiLord || "");
};

/**
 * Ensures that Jayashree Pandit self-introduction strings never leak into PDF outputs.
 */
export function stripJayashreeIntro(text: string): string {
  if (!text) return "";
  return text
    .replace(/ನಮಸ್ಕಾರ[\s\S]*?ಧಾರೆ ಎರೆದಿದ್ದೇನೆ[।\.]?/gi, "")
    .replace(/ನಾನು ಜಯಶ್ರೀ ಪಂಡಿತ್[\s\S]*?ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇನೆ[।\.]?/gi, "")
    .replace(/ಕಳೆದ ೬೦ ವರ್ಷಗಳಿಂದ[\s\S]*?ಆರಂಭಿಸೋಣ[।\.]?/gi, "")
    .replace(/Namaskara[\s\S]*?horoscope[.\!]?/gi, "")
    .replace(/I am Jayashree Pandit[\s\S]*?horoscope[.\!]?/gi, "")
    .replace(/With over 60 years of profound experience[\s\S]*?birth chart[.\!]?/gi, "")
    .replace(/Jayashree Pandit/gi, "")
    .replace(/ಜಯಶ್ರೀ ಪಂಡಿತ್/gi, "")
    .replace(/^\s*\n+/gm, "\n")
    .trim();
}

/* ------------------------------------------------------------------ *
 * Birth line — built from the month table instead of a translator,
 * so "25 March 1990, 10:30" never comes back as a mangled phrase.
 * ------------------------------------------------------------------ */

export const formatBirthLine = (
  lang: string,
  birthDateIso: string,
  birthTime: string
): string => {
  const parts = (birthDateIso || "").split("-");
  if (parts.length !== 3) return `${birthDateIso}, ${birthTime}`;

  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  if (!Number.isFinite(year) || !Number.isFinite(day) || monthIndex < 0 || monthIndex > 11) {
    return `${birthDateIso}, ${birthTime}`;
  }

  return `${day} ${pick(MONTH_L5[monthIndex], lang)} ${year}, ${birthTime}`;
};

/* ------------------------------------------------------------------ *
 * Language profiles used to build the AI prompts
 * ------------------------------------------------------------------ */

type LangProfile = {
  englishName: string;
  nativeName: string;
  scriptName: string;
  /** Words the model habitually leaves in English or transliterates. */
  bannedExamples: string;
};

const LANG_PROFILE: Record<SevaLang, LangProfile> = {
  en: {
    englishName: "English",
    nativeName: "English",
    scriptName: "Latin",
    bannedExamples: ""
  },
  kn: {
    englishName: "Kannada",
    nativeName: "ಕನ್ನಡ",
    scriptName: "Kannada",
    bannedExamples: "ಕರಿಯರ್, ಬ್ಯಾಲೆನ್ಸ್, ಎನರ್ಜಿ, ಪಾಸಿಟಿವ್, ಫೋಕಸ್, ಇಂಪ್ಯಾಕ್ಟ್, ರಿಲೇಶನ್‌ಶಿಪ್"
  },
  te: {
    englishName: "Telugu",
    nativeName: "తెలుగు",
    scriptName: "Telugu",
    bannedExamples: "కెరీర్, బ్యాలెన్స్, ఎనర్జీ, పాజిటివ్, ఫోకస్, ఇంపాక్ట్, రిలేషన్‌షిప్"
  },
  ta: {
    englishName: "Tamil",
    nativeName: "தமிழ்",
    scriptName: "Tamil",
    bannedExamples: "கரியர், பேலன்ஸ், எனர்ஜி, பாசிட்டிவ், ஃபோகஸ், இம்பாக்ட், ரிலேஷன்ஷிப்"
  },
  hi: {
    englishName: "Hindi",
    nativeName: "हिन्दी",
    scriptName: "Devanagari",
    bannedExamples: "करियर, बैलेंस, एनर्जी, पॉजिटिव, फोकस, इम्पैक्ट, रिलेशनशिप"
  }
};

export const languageProfile = (lang: string): LangProfile =>
  LANG_PROFILE[(lang || "en").split("-")[0] as SevaLang] ?? LANG_PROFILE.en;

/**
 * The language rule block prepended to every premium prompt.
 *
 * This is deliberately the first thing the model reads and is phrased as a
 * hard contract, because the failure we keep seeing is not a wrong language
 * but a correct language sprinkled with English nouns.
 */
export const languageContract = (lang: string): string => {
  const p = languageProfile(lang);

  if (p.englishName === "English") {
    return [
      "LANGUAGE RULE",
      "Write everything in plain, warm English. Short sentences. No Sanskrit or Kannada words",
      "except the traditional astrological terms that have no English equivalent.",
      "Keep the JSON keys exactly as given."
    ].join("\n");
  }

  return [
    "LANGUAGE RULE — THIS OUTRANKS EVERY OTHER INSTRUCTION",
    `Write every single word in ${p.nativeName} (${p.englishName}), in ${p.scriptName} script only.`,
    "",
    `1. No English words anywhere, including inside JSON string values, headings and names.`,
    `2. No Latin letters at all in the values.`,
    `3. Do not spell English words in ${p.scriptName} letters. These are forbidden: ${p.bannedExamples}.`,
    `   Use real ${p.nativeName} vocabulary that an elder at home would actually say.`,
    `4. Translate the names of yogas, doshas and transits into ${p.nativeName} as well.`,
    `   Traditional Sanskrit terms already common in ${p.nativeName} are fine.`,
    `5. Keep the JSON keys exactly as written in this prompt. Only the values change language.`,
    `6. Ordinary digits (1, 2, 3) and years are fine.`,
    `7. STRICT SINGLE-SCRIPT & SINGLE-LANGUAGE PURITY:`,
    `   Write purely in ${p.scriptName} script. Absolutely ZERO foreign, Asian, Japanese, Chinese, Latin, or cross-Indic characters from other scripts (e.g. if writing in Kannada, NEVER output Tamil, Telugu, Hindi, Malayalam, or CJK characters).`,
    `   Use authentic regional honorifics only (e.g., in Kannada: "${p.nativeName}" with "ಅವರೇ", "ನಿಮ್ಮ", "ನೀವು" — NEVER use Tamil suffixes like "ಅವರ‍್ಗಳೇ", "ಅವರ್ಗಳೇ", "ಅವರಗಳೇ", "ಅವರುಗಳೇ", and NEVER use Telugu "ಗಾರು/ಕರು", and NEVER use "ಅಭಿಮಾನಿ").`,
    `8. CANONICAL NAME FIDELITY & RESPECTFUL ADDRESS:`,
    `   When addressing the devotee, use ONLY the canonical name provided in the chart facts. NEVER alter, misspell, or corrupt it into phonetic variants. Greet them once at the beginning of the section/chapter, and then address them naturally as second person ("ನೀವು/ನಿಮ್ಮ", "आप/आपका", "మీరు/మీ", "நீங்கள்/உங்கள்"). DO NOT repeat the name mechanically in every paragraph.`,
    "",
    `Write the way a village astrologer speaks to a family sitting in front of him:`,
    `simple, warm, direct ${p.nativeName}. Not a textbook, not a translation.`
  ].join("\n");
};

/**
 * 100% Mathematical & Classical Jyotish Accuracy Contract.
 * This outranks all generalities and mandates 100% mathematical fidelity to the computed chart.
 * Strictly forbids generic horoscope filler, vague generalities, or out-of-context life-stage claims.
 */
export const accuracyContract = (input?: {
  name?: string;
  ageYears?: number;
  gender?: string;
  maritalStatus?: string;
  hasChildren?: string;
  lang?: string;
}): string => {
  const name = input?.name || "The Native";
  const age = typeof input?.ageYears === "number" ? Math.floor(input.ageYears) : null;
  const ageNotice =
    age !== null
      ? `Age: ${age} years (${
          age < 12 ? "Child/Infant" : age < 22 ? "Youth/Student" : age >= 60 ? "Senior Elder" : "Adult"
        })`
      : "";
  return [
    "100% MATHEMATICAL & SHASTRIYA ACCURACY CONTRACT — THIS OUTRANKS ALL GENERALITIES",
    `You are generating an authentic, 100% mathematically and scripturally accurate Vedic astrology chapter for ${name}.`,
    ...(ageNotice ? [ageNotice] : []),
    "",
    "1. ABSOLUTE COMPUTATIONAL FIDELITY: Every single observation, strength, challenge, and timing window MUST be 100% mathematically grounded in the computed planetary facts above (exact Janma Lagna, Chandra Rashi, Nakshatra Pada, Bhava lords, planetary dignities, running Dasha-Bhukti, and live Gochara transits). Never invent or contradict computed facts.",
    "2. STRICT ZERO-TOLERANCE FOR GENERIC HOROSCOPES: Absolutely FORBIDDEN to write vague newspaper horoscopes, generic sun-sign generalities, or boilerplate filler that could apply to any person (e.g. 'You are hardworking and desire success', 'Keep positive thoughts'). Every statement must explicitly tie back to a specific named graha, house lord, or transit in THIS person's chart.",
    "3. INTIMATE LIVING REALITY & PSYCHOLOGICAL RESONANCE: Speak directly and intimately to the native as 'you'. Address their unspoken inner world, silent burdens, daily thoughts, domestic atmosphere, and immediate timeline. The devotee must experience an immediate shock of 100% accuracy: 'This astrologer knows my exact heart, my private dilemmas, and my exact life circumstances with astonishing precision!'",
    "4. MANDATORY LIFE-STAGE & STATUS FIDELITY:",
    "   - Children/Infants (< 12 years): Focus 100% on early cognitive development, learning rhythm, creative play, character building, and pediatric vitality. ABSOLUTELY ZERO adult romance, marriage proposals, career rat-race, or financial investments.",
    "   - Youth/Students (12-21 years): Focus 100% on education, focus against distractions, exam preparation, and career foundations. ZERO marriage proposals.",
    "   - Senior Elders (60+ years): Focus 100% on domestic serenity, lifelong companionship, grandchildren, mentorship, and peaceful spiritual fulfillment. ZERO corporate job searches or beginner marriage matchmaking.",
    "   - If Married: Strictly interpret 7th house matters as domestic harmony, mutual emotional anchor, and marital partnership. NEVER diagnose 'delay in marriage' or 'difficulty finding a groom/bride'.",
    "   - If Unmarried: Focus on matrimonial discernment, partner alignment, and auspicious timing.",
    "   - If 'no_children': Focus on mutual emotional sanctuary, standing united, and private hopes for family expansion.",
    "5. SACRED GOKARNA MAHABALESHWARA REMEDIES: Prescribe authentic Vedic remedies rooted in Sri Kshetra Gokarna Mahabaleshwara (sacred Atma Linga) and Lord Mukhyaprana. Remedies must inspire 100% spiritual confidence, peace, and divine protection, never fear or doom.",
    "6. ZERO CONFUSING PERCENTAGE DISCLOSURES: Never output self-limiting or ambiguous phrases that sound like low accuracy or partial results (e.g. 'only 40% accuracy' or 'yields only 40%'). Affirm the native's 100% spiritual potential and divine timing.",
    "7. STRICT ZERO-DEGREE RULE (CRITICAL MANDATE): NEVER output technical numerical degrees, minutes, or degree symbols (e.g., NEVER say '15°', '22 degrees', '23°14\''). Common devotees and families cannot understand degrees. Instead, refer exclusively to the Bhava (House 1 to 12), Rashi name, Navamsha position, or planetary dignity.",
    "8. CLASSICAL DIGNITY & VARGOTTAMA INTEGRATION: Deeply weave the planetary dignities from the chart facts into the narrative: exalted planets bring royal authority, debilitated planets represent sacred karmic refining opportunities, and Vargottama planets bestow unshakable spiritual fortitude.",
    "9. STRICT ZERO-BRACKET & ZERO-STATIC-CODE MANDATE: Absolutely NEVER output technical brackets or static labels like '(7th house)', '(Bhava 7)', '(Scorpio)', '(Mesha)', or English words inside regional text. Devotees and families find brackets jarring and mechanical. All astrological placements must be seamlessly woven into natural, sacred, flowing narrative sentences in the target script (e.g. write 'your 7th house in Scorpio ruled by Mars' or 'ನಿಮ್ಮ ಸಪ್ತಮ ಸ್ಥಾನವಾದ ವೃಶ್ಚಿಕ ರಾಶಿಯ ಅಧಿಪತಿ ಕುಜ ಗ್ರಹವು' — NEVER '7ನೇ ಮನೆ (ವೃಶ್ಚಿಕ)')."
  ].join("\n");
};

/* ------------------------------------------------------------------ *
 * Repetition control
 * ------------------------------------------------------------------ */

const CHAPTER_MAP: Record<string, string> = {
  characteristics: "the person's nature and character",
  darkSecret: "the one hidden karmic truth of the chart",
  yogas: "the auspicious planetary combinations",
  doshas: "the karmic afflictions and their remedies",
  gochara: "the transits running right now",
  timeline: "a month-by-month outlook for the next six months",
  summary: "a short closing summary"
};

/**
 * Each chapter is generated by a separate model call, so without this block
 * the model has no idea the other chapters exist and re-uses the same opening
 * lines and the same three metaphors in all seven of them.
 */
export const noRepeatContract = (sectionKey: string, runId: string): string => {
  const mine = CHAPTER_MAP[sectionKey] ?? sectionKey;
  const others = Object.entries(CHAPTER_MAP)
    .filter(([key]) => key !== sectionKey)
    .map(([, label]) => label)
    .join("; ");

  return [
    "SCOPE AND REPETITION RULE",
    `This book has seven chapters, each written separately. You are writing ONLY the chapter on ${mine}.`,
    `Other chapters already cover: ${others}.`,
    "Do not summarise, preview or restate those chapters. Stay strictly inside your own chapter.",
    "",
    "Do not open with a generic line about planets shaping destiny, about the cosmos, or about",
    "the stars guiding a path. Begin immediately with something true of THIS chart.",
    "No two paragraphs may begin with the same word. Vary sentence length.",
    "",
    `Reading reference: ${runId}. If this person prints the book again, the wording must come out`,
    "differently while the astrological facts stay identical. Change the phrasing, never the facts."
  ].join("\n");
};

/** Short random id so repeated downloads are visibly different documents. */
export const newRunId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function cleanEnglishFromRegionalText(text: string, lang: string): string {
  if (!text || lang === "en") return text;
  let cleaned = text;

  // 1. Language-specific word replacements
  if (lang.startsWith("kn")) {
    cleaned = cleaned
      .replace(/ಮೂanaditude/gi, "ಮನಸ್ಥಿತಿ")
      .replace(/\b(attitude|manattitude|moanattitude|mindset)\b/gi, "ಮನಸ್ಥಿತಿ")
      .replace(/\b(career)\b/gi, "ಉದ್ಯೋಗ")
      .replace(/\b(health)\b/gi, "ಆರೋಗ್ಯ")
      .replace(/\b(wealth|finance)\b/gi, "ಸಂಪತ್ತು")
      .replace(/\b(marriage)\b/gi, "ವಿವಾಹ")
      .replace(/\b(children|progeny)\b/gi, "ಸಂತಾನ");
  } else if (lang.startsWith("hi")) {
    cleaned = cleaned
      .replace(/\b(attitude|mindset)\b/gi, "मनोवृत्ति")
      .replace(/\b(career)\b/gi, "करियर")
      .replace(/\b(health)\b/gi, "स्वास्थ्य")
      .replace(/\b(wealth|finance)\b/gi, "धन")
      .replace(/\b(marriage)\b/gi, "विवाह")
      .replace(/\b(children|progeny)\b/gi, "संतान");
  } else if (lang.startsWith("te")) {
    cleaned = cleaned
      .replace(/\b(attitude|mindset)\b/gi, "మనోభావం")
      .replace(/\b(career)\b/gi, "వృత్తి")
      .replace(/\b(health)\b/gi, "ఆరోగ్యం")
      .replace(/\b(wealth|finance)\b/gi, "సంపద")
      .replace(/\b(marriage)\b/gi, "వివాహం")
      .replace(/\b(children|progeny)\b/gi, "సంతానం");
  } else if (lang.startsWith("ta")) {
    cleaned = cleaned
      .replace(/\b(attitude|mindset)\b/gi, "மனப்பான்மை")
      .replace(/\b(career)\b/gi, "தொழில்")
      .replace(/\b(health)\b/gi, "உடல்நலம்")
      .replace(/\b(wealth|finance)\b/gi, "செல்வம்")
      .replace(/\b(marriage)\b/gi, "திருமணம்")
      .replace(/\b(children|progeny)\b/gi, "சந்தானம்");
  }

  // Common transit English phrases removal from regional text
  cleaned = cleaned
    .replace(/\b(Saturn\s*Transit|Jupiter\s*Transit|Rahu[\s\-]Ketu\s*Transit)\b/gi, "")
    .replace(/\b(Transit|Impact|Phase|Remedy)\b/gi, "");

  // 2. Strip all remaining Latin/English alphabets for all regional languages
  cleaned = cleaned.replace(/[a-zA-Z]+/g, "");

  // 3. Remove empty or orphan parentheses left behind, e.g. "()", "( )", "( , )"
  cleaned = cleaned.replace(/\(\s*[\.,;:]*\s*\)/g, "");
  cleaned = cleaned.replace(/（\s*）/g, "");
  cleaned = cleaned.replace(/【\s*】/g, "");

  // 4. Strip stray non-Indic/non-ASCII characters (e.g. CJK/Chinese/Japanese characters, Hiragana, Katakana, Hangul while preserving sacred 【】 brackets)
  cleaned = cleaned.replace(/[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\uac00-\ud7af]/gu, "");

  // 4a. Cross-script isolation: enforce 100% single-script purity per language
  if (lang.startsWith("kn")) {
    // Strip non-Kannada Indic scripts: Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu (\u0900-\u0C7F) and Malayalam (\u0D00-\u0D7F)
    cleaned = cleaned.replace(/[\u0900-\u0C7F\u0D00-\u0D7F]/gu, "");
    // Clean transliterated Tamil honorifics in Kannada (including ZWJ/virama forms and plural forms like ಅವರುಗಳೇ)
    cleaned = cleaned
      .replace(/ಅವರ?ು?[\u200C\u200D\u0CCD]*ಗಳೇ/gu, "ಅವರೇ")
      .replace(/ಅವರ?ು?[\u200C\u200D\u0CCD]*ಗಳಿಗೆ/gu, "ಅವರಿಗೆ")
      .replace(/ಅವರ?ು?[\u200C\u200D\u0CCD]*ಗಳ/gu, "ಅವರ")
      .replace(/(?:ಮನೋಜ್|ಮನೋಜ(?!್)|ಮನುಜ್|ಮಂಜು)\s*(?:ಕರು|ಗಾರು|ಅವರುಗಳೇ)?\s*(?:ಅವರೇ)?/gu, "ಮನೋಜ್ ಅವರೇ")
      .replace(/(?:^|[- \t\r\n,.(–—])(?:ಕರು|ಗಾರು)\s*(?:ಅವರೇ)?(?=[- \t\r\n,.(–—!]|$)/gu, " ಅವರೇ")
      .replace(/(?:^|[- \t\r\n,.(–—])(?:ಅಭಿಮಾನಿ|ಅಭಿಮಾನಿಯಾದ)\s*(?:ಶ್ರೀಯುತ|ಶ್ರೀ)?\s*/gu, "")
      .replace(/(?:ಅವರೇ\s*){2,}/gu, "ಅವರೇ ");
  } else if (lang.startsWith("hi")) {
    // Strip non-Devanagari Indic scripts: Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam (\u0980-\u0D7F)
    cleaned = cleaned.replace(/[\u0980-\u0D7F]/gu, "");
  } else if (lang.startsWith("te")) {
    // Strip non-Telugu Indic scripts: Devanagari, Tamil (\u0900-\u0BFF), Kannada, Malayalam (\u0C80-\u0D7F)
    cleaned = cleaned.replace(/[\u0900-\u0BFF\u0C80-\u0D7F]/gu, "");
  } else if (lang.startsWith("ta")) {
    // Strip non-Tamil Indic scripts: Devanagari (\u0900-\u0B7F), Telugu, Kannada, Malayalam (\u0C00-\u0D7F)
    cleaned = cleaned.replace(/[\u0900-\u0B7F\u0C00-\u0D7F]/gu, "");
  }

  // 4b. Strip orphan colons, solitary numbers with colons/crosses/dots left behind after Latin removal (e.g. ": 7 × ..")
  cleaned = cleaned
    .replace(/:\s*\d+\s*[×x*•]?\s*[\.]*/g, "")
    .replace(/[×x*•]\s*[\.]*/g, "")
    .replace(/\s*:\s*(?=[\s,.\-×*•]|$)/g, "")
    .replace(/^[ \t:,\.\-–—×*•~|]+(?=[^ \t\r\n:,\.\-–—×*•~|])/gm, "")
    .replace(/[ \t:,\-–—×*•~|]+$/gm, "")
    .replace(/^[ \t:,\.\-–—×*•~|]+$/gm, "");

  // 4c. Clean dangling trailing conjunctions/pronouns from incomplete sentences
  if (lang.startsWith("kn")) {
    cleaned = cleaned.replace(/(?:[.,;!?|।॥]\s*)?(?:ನಿಮ್ಮ|ಮತ್ತು|ಹಾಗೂ|ಅಥವಾ|ಆದರೆ|ಏಕೆಂದರೆ|ಎಂದು|ಈ|ಆ|ಒಂದು|ಕೂಡ|ಇಂದ)\s*$/gu, "");
  } else if (lang.startsWith("hi")) {
    cleaned = cleaned.replace(/(?:[.,;!?|।॥]\s*)?(?:आपका|आपकी|आपके|और|तथा|एवं|किंतु|परंतु|क्योंकि|कि|यह|वह|एक)\s*$/gu, "");
  } else if (lang.startsWith("te")) {
    cleaned = cleaned.replace(/(?:[.,;!?|।॥]\s*)?(?:మీ|మరియు|కాని|ఎందుకంటే|ఈ|ಆ)\s*$/gu, "");
  } else if (lang.startsWith("ta")) {
    cleaned = cleaned.replace(/(?:[.,;!?|।॥]\s*)?(?:உங்கள்|மற்றும்|ஆனால்|ஏனெனில்|இந்த|அந்த)\s*$/gu, "");
  }

  // 5. Clean whitespace & punctuation spacing
  cleaned = cleaned
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \./g, ".")
    .replace(/ ,/g, ",")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^[\s:,\.\-–—×*•~|]+/gu, "")
    .replace(/[\s:,\-–—×*•~|]+$/gu, "")
    .trim();

  return cleaned;
}

export function getDevoteeQuestionForCategory(
  categoryKey: string,
  lang: string,
  ageYears?: number
): string {
  const baseLang = (lang || "en").split("-")[0];
  const age = ageYears ?? 30;
  const isChild = age < 12;
  const isSenior = age >= 60;
  const isYouth = age >= 12 && age < 22;

  const keyLower = categoryKey.toLowerCase();

  // 1. Marriage / Companionship / Focus
  if (
    keyLower.includes("marriage") ||
    keyLower.includes("relationship") ||
    keyLower.includes("companionship") ||
    keyLower.includes("ಮದುವೆ") ||
    keyLower.includes("ವಿವಾಹ") ||
    keyLower.includes("ಸಹಚಾರ್ಯ") ||
    keyLower.includes("विवाह") ||
    keyLower.includes("सौहार्द") ||
    keyLower.includes("దాంపత్య") ||
    keyLower.includes("திருமணம்")
  ) {
    if (isChild) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಮಗುವಿನ ಆರಂಭಿಕ ವಿದ್ಯಾಭ್ಯಾಸ, ಗ್ರಹಣ ಶಕ್ತಿ ಮತ್ತು ಶಾಲಾ ಏಕಾಗ್ರತೆಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: बच्चे की प्राथमिक शिक्षा, ग्रहण क्षमता एवं एकाग्रता का विषय कैसा है?";
      if (baseLang === "te") return "ప్రశ్న: పిల్లల ప్రాథమిక విద్యాభ్యాసం, గ్రహణ శక్తి మరియు ఏకాగ్రత ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: குழந்தையின் ஆரம்பக் கல்வி, கற்கும் திறன் மற்றும் கவனிப்பு நிலை எவ்வாறு உள்ளது?";
      return "Question: What is the status of the child's early education, grasping power, and study focus?";
    }
    if (isYouth) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಯೌವನಾವಸ್ಥೆಯಲ್ಲಿ ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ, ಮಾನಸಿಕ ಏಕಾಗ್ರತೆ ಮತ್ತು ನಡವಳಿಕೆಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: युवावस्था में चरित्र निर्माण, मानसिक एकाग्रता एवं अध्ययन अनुशासन की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: యవ్వనంలో వ్యక్తిత్వ నిర్మాణం, మానసిక ఏకాగ్రత మరియు ప్రవర్తన ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: இளமைப் பருவத்தில் ஆளுமை உருவாக்கம், மன உறுதி மற்றும் ஒழுக்கம் எவ்வாறு அமையும்?";
      return "Question: What is the status of character formation, mental focus, and academic discipline in youth?";
    }
    if (isSenior) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಹಿರಿಯ ವಯಸ್ಸಿನಲ್ಲಿ ದಾಂಪತ್ಯ ಸಹಚಾರ್ಯ, ಪರಸ್ಪರ ಕಾಳಜಿ ಮತ್ತು ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: वरिष्ठ आयु में जीवनसाथी का सान्निध्य, परस्पर देखभाल एवं पारिवारिक शांति कैसी रहेगी?";
      if (baseLang === "te") return "ప్రశ్న: వృద్ధాప్యంలో దాంపత్య సహచర్యం, పరస్పర ఆదరణ మరియు కుటుంబ ప్రశాంతత ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: முதிய வயதில் தம்பதியர் அன்யோன்யம், பரஸ்பர கவனிப்பு மற்றும் குடும்ப அமைதி எப்படி இருக்கும்?";
      return "Question: What is the status of marital companionship, mutual care, and domestic serenity in senior years?";
    }
    return tp("marriageQuestion", lang);
  }

  // 2. Children / Legacy / Studies / Activities
  if (
    keyLower.includes("children") ||
    keyLower.includes("progeny") ||
    keyLower.includes("legacy") ||
    keyLower.includes("grandchildren") ||
    keyLower.includes("ಸಂತಾನ") ||
    keyLower.includes("ಮಕ್ಕಳು") ||
    keyLower.includes("ವಂಶಾಭಿವೃದ್ಧಿ") ||
    keyLower.includes("संतान") ||
    keyLower.includes("पौत्र") ||
    keyLower.includes("సంతానం") ||
    keyLower.includes("వంశాభివృద్ధి") ||
    keyLower.includes("சந்ததி") ||
    keyLower.includes("பேரப்பிள்ளைகள்")
  ) {
    if (isChild) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಮಗುವಿನ ಕಲಾಭಿರುಚಿ, ಆಟೋಟಗಳು, ಕ್ರೀಡೆ ಮತ್ತು ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆಯ ವಿಕಾಸ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: बच्चे की कलात्मक रुचि, खेलकूद एवं स्वाभाविक प्रतिभा का विकास कैसा रहेगा?";
      if (baseLang === "te") return "ప్రశ్న: పిల్లల కళాభిరుచి, ఆటపాటలు, క్రీడలు మరియు ప్రతిభా వికాసం ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: குழந்தையின் கலை ஆர்வம், விளையாட்டு மற்றும் தனித்திறமை வளர்ச்சி எவ்வாறு அமையும்?";
      return "Question: What is the status of the child's extracurricular talents, sports stamina, and creative expression?";
    }
    if (isYouth) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಉನ್ನತ ಶಿಕ್ಷಣ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳು ಮತ್ತು ಜ್ಞಾನಾರ್ಜನೆಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: उच्च शिक्षा, प्रतियोगी परीक्षाएं एवं बौद्धिक ज्ञानार्जन की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: ఉన్నత విద్య, పోటీ పరీక్షలు మరియు జ్ఞానార్జన ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: உயர்கல்வி, போட்டித் தேர்வுகள் மற்றும் கல்வி மேன்மை எவ்வாறு அமையும்?";
      return "Question: What is the status of higher education, competitive exams, and intellectual achievements?";
    }
    if (isSenior) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ವಂಶಾಭಿವೃದ್ಧಿ, ಮೊಮ್ಮಕ್ಕಳ ಸೌಖ್ಯ ಮತ್ತು ಪಾರಂಪರಿಕ ಆಶೀರ್ವಾದದ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: वंश वृद्धि, पौत्र-पौत्री सुख एवं पारिवारिक प्रतिष्ठा की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: వంశాభివృద్ధి, మనవలు-మనవరాళ్ల సుఖం మరియు కుటుంబ గౌరవం ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: சந்ததி வளர்ச்சி, பேரப்பிள்ளைகள் நலம் மற்றும் வம்ச பெருமை எவ்வாறு இருக்கும்?";
      return "Question: What is the status of generational lineage, grandchildren's joy, and ancestral fulfillment?";
    }
    return tp("childrenQuestion", lang);
  }

  // 3. Career / Mentorship / Foundation
  if (
    keyLower.includes("career") ||
    keyLower.includes("profession") ||
    keyLower.includes("job") ||
    keyLower.includes("leadership") ||
    keyLower.includes("foundation") ||
    keyLower.includes("ಉದ್ಯೋಗ") ||
    keyLower.includes("ವೃತ್ತಿ") ||
    keyLower.includes("ಸಂಸ್ಕಾರ") ||
    keyLower.includes("ಧರ್ಮ ಕಾರ್ಯ") ||
    keyLower.includes("करियर") ||
    keyLower.includes("आजीविका") ||
    keyLower.includes("संस्कार") ||
    keyLower.includes("ఉద్యోగం") ||
    keyLower.includes("தொழில்") ||
    keyLower.includes("உத்தியோகம்")
  ) {
    if (isChild) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಮಗುವಿನ ನೈತಿಕ ಸಂಸ್ಕಾರ, ನಡವಳಿಕೆ, ಸತ್ಯನಿಷ್ಠೆ ಮತ್ತು ಭವಿಷ್ಯದ ಅಡಿಪಾಯ ಹೇಗಿರಲಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: बच्चे के नैतिक संस्कार, आचरण, सत्यनिष्ठा एवं भविष्य की नींव कैसी बनेगी?";
      if (baseLang === "te") return "ప్రశ్న: పిల్లల నైతిక విలువలు, సంస్కారం మరియు భవిష్యత్ పునాది ఎలా ఉండబోతోంది?";
      if (baseLang === "ta") return "கேள்வி: குழந்தையின் நற்பண்புகள், ஆளுமை மற்றும் எதிர்கால அடித்தளம் எவ்வாறு அமையும்?";
      return "Question: What is the status of foundational samskaras, truthfulness, and character formation?";
    }
    if (isYouth) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಭವಿಷ್ಯದ ವೃತ್ತಿ ಅಡಿಪಾಯ, ಕೌಶಲ್ಯ ವೃದ್ಧಿ ಮತ್ತು ಉದ್ಯೋಗದ ದಿಕ್ಕಿನ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: भावी करियर की नींव, व्यावसायिक कौशल एवं आजीविका की दिशा कैसी रहेगी?";
      if (baseLang === "te") return "ప్రశ్న: భవిష్యత్ కెరీర్ పునాది, నైపుణ్యాల వృద్ధి మరియు ఉద్యోగ దిశ ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: எதிர்கால தொழில் அடித்தளம், தொழிற்திறன் மற்றும் வேலைவாய்ப்பு திசை எப்படி அமையும்?";
      return "Question: What is the status of future vocational direction, skillset acquisition, and career foundation?";
    }
    if (isSenior) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಸಮಾಜದಲ್ಲಿ ಗೌರವ, ಧಾರ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಜೀವಮಾನದ ಕೀರ್ತಿಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: समाज में मान-प्रतिष्ठा, धर्मार्थ मार्गदर्शन एवं जीवन पर्यन्त यश की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: సమాజంలో గౌరవం, ధార్మిక మార్గదర్శకత్వం మరియు జీవిత కీర్తి ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: சமூகத்தில் மதிப்பு, தர்ம வழிகாட்டுதல் மற்றும் வாழ்நாள் புகழ் எவ்வாறு நிலைக்கும்?";
      return "Question: What is the status of societal respect, dharmic mentorship, and lifelong reputation?";
    }
    return tp("careerQuestion", lang);
  }

  // 4. Wealth / Family Environment / Financial Discipline
  if (
    keyLower.includes("wealth") ||
    keyLower.includes("finance") ||
    keyLower.includes("estate") ||
    keyLower.includes("family") ||
    keyLower.includes("discipline") ||
    keyLower.includes("ಧನ") ||
    keyLower.includes("ಸಂಪತ್ತು") ||
    keyLower.includes("ಆರ್ಥಿಕ") ||
    keyLower.includes("ಪೋಷಣೆ") ||
    keyLower.includes("धन") ||
    keyLower.includes("संपत्ति") ||
    keyLower.includes("సంపద") ||
    keyLower.includes("ఆర్థిక") ||
    keyLower.includes("தனம்") ||
    keyLower.includes("செல்வம்")
  ) {
    if (isChild) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಮಗುವಿನ ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ, ವಾತ್ಸಲ್ಯ, ಮನೆಯ ನೆಮ್ಮದಿ ಮತ್ತು ಬೆಳವಣಿಗೆಯ ವಾತಾವರಣ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: बच्चे के लिए पारिवारिक वात्सल्य, घर का शांत वातावरण एवं उचित पोषण कैसा रहेगा?";
      if (baseLang === "te") return "ప్రశ్న: పిల్లలకు కుటుంబ ప్రేమ, వాత్సల్యం మరియు గృహ వాతావరణం ఎలా ఉంటుంది?";
      if (baseLang === "ta") return "கேள்வி: குழந்தைக்கு குடும்ப பாசம், வீட்டில் அமைதி மற்றும் அன்பான வளர்ப்புச் சூழல் எவ்வாறு அமையும்?";
      return "Question: What is the status of family warmth, parental affection, and emotional security at home?";
    }
    if (isYouth) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಯೌವನದಲ್ಲಿ ಆರ್ಥಿಕ ಶಿಸ್ತು, ಹಣದ ಸದ್ಬಳಕೆ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳ ನಿರ್ವಹಣೆಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: युवावस्था में वित्तीय अनुशासन, धन का सदुपयोग एवं संसाधनों के प्रबंधन की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: యవ్వనంలో ఆర్థిక క్రమశిక్షణ, పొదుపు మరియు వనరుల నిర్వహణ ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: இளமையில் நிதி ஒழுக்கம், பணத்தின் மதிப்பு மற்றும் சேமிப்பு சுபாவம் எவ்வாறு அமையும்?";
      return "Question: What is the status of financial discipline, budgeting habits, and resource stewardship?";
    }
    if (isSenior) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಸಂಚಿತ ಆಸ್ತಿ ಸಂರಕ್ಷಣೆ, ಕುಟುಂಬ ಸುಭಿಕ್ಷತೆ ಮತ್ತು ಆರ್ಥಿಕ ನಿಶ್ಚಿಂತೆಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: संचित संपत्ति की सुरक्षा, पारिवारिक समृद्धि एवं आर्थिक निश्चिंतता की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: సంపద పరిరక్షణ, కుటుంబ సుఖం మరియు ఆర్థిక భరోసా ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: பூர்வீக சொத்துப் பாதுகாப்பு, குடும்ப சுபிட்சம் மற்றும் நிதி அமைதி எவ்வாறு இருக்கும்?";
      return "Question: What is the status of asset preservation, family security, and financial serenity?";
    }
    return tp("wealthQuestion", lang);
  }

  // 5. Health / Vitality / Longevity
  if (
    keyLower.includes("health") ||
    keyLower.includes("vitality") ||
    keyLower.includes("longevity") ||
    keyLower.includes("fitness") ||
    keyLower.includes("pediatric") ||
    keyLower.includes("ಆರೋಗ್ಯ") ||
    keyLower.includes("ಚೈತನ್ಯ") ||
    keyLower.includes("ದೀರ್ಘಾಯುಷ್ಯ") ||
    keyLower.includes("ಬಾಲ ಆರೋಗ್ಯ") ||
    keyLower.includes("स्वास्थ्य") ||
    keyLower.includes("आरोग्य") ||
    keyLower.includes("दीर्घायु") ||
    keyLower.includes("ఆరోగ్యం") ||
    keyLower.includes("ఆరోగ్య")
  ) {
    if (isChild) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಮಗುವಿನ ಬಾಲ ಆರೋಗ್ಯ, ನೈಸರ್ಗಿಕ ರೋಗ ನಿರೋಧಕ ಶಕ್ತಿ ಮತ್ತು ಚೈತನ್ಯದ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: बच्चे का बाल स्वास्थ्य, प्राकृतिक रोग प्रतिरोधक क्षमता एवं शारीरिक स्फूर्ति कैसी रहेगी?";
      if (baseLang === "te") return "ప్రశ్న: పిల్లల బాల ఆరోగ్యం, రోగ నిరోధక శక్తి మరియు ఉత్సాహం ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: குழந்தையின் உடல் ஆரோக்கியம், நோய் எதிர்ப்பு சக்தி மற்றும் சுறுசுறுப்பு எவ்வாறு இருக்கும்?";
      return "Question: What is the status of pediatric vitality, natural immunity, and physical stamina?";
    }
    if (isYouth) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ಯುವ ಚೈತನ್ಯ, ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ, ಕ್ರೀಡಾ ಶಕ್ತಿ ಮತ್ತು ಜೀವನಶೈಲಿಯ ಸಮತೋಲನದ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: युवा ऊर्जा, शारीरिक सामर्थ्य, खेलकूद स्फूर्ति एवं जीवनशैली संतुलन की क्या स्थिति है?";
      if (baseLang === "te") return "ప్రశ్న: యువ చైతన్యం, శారీరక దృఢత్వం మరియు సమతుల్య జీవనశైలి ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: இளமைத் துடிப்பு, உடல் வலிமை, உடற்பயிற்சி மற்றும் ஆரோக்கிய வாழ்க்கை முறை எப்படி அமையும்?";
      return "Question: What is the status of youth fitness, physical stamina, and balanced lifestyle habits?";
    }
    if (isSenior) {
      if (baseLang === "kn") return "ಪ್ರಶ್ನೆ: ದೀರ್ಘಾಯುಷ್ಯ, ವೃದ್ಧಾಪ್ಯದ ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಣೆ ಮತ್ತು ದೈಹಿಕ ನೆಮ್ಮದಿಯ ವಿಷಯ ಹೇಗಿದೆ?";
      if (baseLang === "hi") return "प्रश्न: दीर्घायु, वृद्धावस्था में स्वास्थ्य रक्षा एवं शारीरिक सुख-शांति कैसी रहेगी?";
      if (baseLang === "te") return "ప్రశ్న: దీర్ఘాయుష్షు, వృద్ధాప్య ఆరోగ్య పరిరక్షణ మరియు శారీరక ప్రశాంతత ఎలా ఉంటాయి?";
      if (baseLang === "ta") return "கேள்வி: நீண்ட ஆயுள், முதுமைக்கால ஆரோக்கியப் பாதுகாப்பு மற்றும் உடல் நலன் எவ்வாறு அமையும்?";
      return "Question: What is the status of longevity, geriatric wellness preservation, and physical comfort?";
    }
    return tp("healthQuestion", lang);
  }

  return tp(categoryKey + "Question", lang) || "";
}

