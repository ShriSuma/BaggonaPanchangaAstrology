/**
 * BAGGONA PANCHANGA — SECRET ACCURACY & REVENUE PRODUCTS 6-LANGUAGE LOCALIZATION
 * Strict Rule: ZERO English token leakage in Indic languages (kn, mr, hi, te, ta).
 * Strict Rule: Priest name is strictly "Shreeram Pandit" (+91 99723 39362).
 * Strict Rule: Temple heritage is Sri Kshetra Gokarna Mahabaleshwara.
 */

import { type SixLang } from "../features/fiveYearPrediction/fiveYearLocale";
import { type Planet } from "./jyotishPrecisionGates";

export interface YogiAvayogiLocaleText {
  yogiBadge: string;
  yogiPraise: string;
  duplicateYogiLabel: string;
  avayogiBadge: string;
  avayogiWarning: string;
  luckyColorLabel: string;
  luckyDirectionLabel: string;
  wealthDayLabel: string;
  prescribedGemstoneLabel: string;
}

export const YOGI_AVAYOGI_LOCALE: Record<SixLang, YogiAvayogiLocaleText> = {
  kn: {
    yogiBadge: "🌟 ಯೋಗಿ ಗ್ರಹ (ಅದೃಷ್ಟ & ಧನಕಾರಕ)",
    yogiPraise: "ಈ ಗ್ರಹವು ಜಾತಕನ ಜೀವನದಲ್ಲಿ ಅಪ್ರತಿಮ ಯಶಸ್ಸು, ನಿರಾಯಾಸ ಸಂಪತ್ತು ಹಾಗೂ ಭಾಗ್ಯೋದಯವನ್ನು ತರುವ ಶ್ರೇಷ್ಠ ದೈವಿಕ ಶಕ್ತಿ.",
    duplicateYogiLabel: "ಸಹ-ಯೋಗಿ ಗ್ರಹ (ದ್ವಿಗುಣ ಭಾಗ್ಯ)",
    avayogiBadge: "⚠️ ಅವಯೋಗಿ ಗ್ರಹ (ಅಡೆತಡೆ & ಪರೀಕ್ಷಾಕಾರಕ)",
    avayogiWarning: "ಅವಯೋಗಿ ಗ್ರಹದ ದಶಾ-ಭುಕ್ತಿ ಅಥವಾ ಆ ಗ್ರಹದ ಬಣ್ಣ/ರತ್ನವನ್ನು ಬಳಸುವಾಗ ವಿಶೇಷ ಜಾಗ್ರತೆ ವಹಿಸಿ; ಇದು ಕಾರ್ಯಗಳಲ್ಲಿ ಅನಗತ್ಯ ವಿಳಂಬ ಉಂಟುಮಾಡಬಹುದು.",
    luckyColorLabel: "ಅದೃಷ್ಟ ರೇಖೆಯ ಬಣ್ಣ",
    luckyDirectionLabel: "ಧನ ವೃದ್ಧಿಯ ದಿಕ್ಕು",
    wealthDayLabel: "ಸುವರ್ಣ ಫಲದ ದಿನ",
    prescribedGemstoneLabel: "ಭಾಗ್ಯ ರತ್ನ"
  },
  mr: {
    yogiBadge: "🌟 योगी ग्रह (भाग्य व धनकारक)",
    yogiPraise: "हा ग्रह जातकाच्या जीवनात अद्वितीय यश, विनासायास संपत्ती व भाग्योदय आणणारी श्रेष्ठ ईश्वरी शक्ती आहे.",
    duplicateYogiLabel: "सह-योगी ग्रह (दुप्पट भाग्य)",
    avayogiBadge: "⚠️ अवयोगी ग्रह (अडथळा व परीक्षा कारक)",
    avayogiWarning: "अवयोगी ग्रहाच्या दशा-अंतर्दशेत किंवा त्या ग्रहाचा रंग/रत्न वापरताना सावध राहावे; यामुळे कामात अनपेक्षित अडथळे येऊ शकतात.",
    luckyColorLabel: "भाग्यवर्धक रंग",
    luckyDirectionLabel: "धनवृद्धीची दिशा",
    wealthDayLabel: "सुवर्ण लाभाचा वार",
    prescribedGemstoneLabel: "भाग्य रत्न"
  },
  hi: {
    yogiBadge: "🌟 योगी ग्रह (भाग्य एवं धनकारक)",
    yogiPraise: "यह ग्रह जातक के जीवन में अप्रतिम सफलता, अनायास धन प्राप्ति एवं भाग्योदय प्रदान करने वाली सर्वोच्च शक्ति है।",
    duplicateYogiLabel: "सह-योगी ग्रह (द्विगुणित सौभाग्य)",
    avayogiBadge: "⚠️ अवयोगी ग्रह (बाधा एवं परीक्षा कारक)",
    avayogiWarning: "अवयोगी ग्रह की दशा-अंतर्दशा अथवा उसके रंग/रत्न के प्रयोग में विशेष सतर्कता बरतें; यह कार्यों में अनावश्यक विलंब उत्पन्न कर सकता है।",
    luckyColorLabel: "भाग्यशाली रंग",
    luckyDirectionLabel: "धन वृद्धि की दिशा",
    wealthDayLabel: "स्वर्णिम सिद्धि दिवस",
    prescribedGemstoneLabel: "भाग्य रत्न"
  },
  te: {
    yogiBadge: "🌟 యోగి గ్రహం (భాగ్య & ధనకారకం)",
    yogiPraise: "ఈ గ్రహం జాతకుడి జీవితంలో అద్భుతమైన విజయం, అనూహ్య సంపద మరియు భాగ్యోదయాన్ని కలిగించే పరమ పవిత్ర దైవిక శక్తి.",
    duplicateYogiLabel: "సహ-యోగి గ్రహం (రెట్టింపు భాగ్యం)",
    avayogiBadge: "⚠️ అవయోగి గ్రహం (ఆటంక & పరీక్షాకారకం)",
    avayogiWarning: "అవయోగి గ్రహం యొక్క దశ-అంతర్దశలో లేదా ఆ గ్రహపు రంగు/రత్నం ధరించేటప్పుడు జాగ్రత్త వహించండి; ఇది పనులలో అనవసర జాప్యాన్ని కలిగిస్తుంది.",
    luckyColorLabel: "అదృష్ట రంగు",
    luckyDirectionLabel: "ధన వృద్ధి దిశ",
    wealthDayLabel: "స్వర్ణ ఫలిత దినం",
    prescribedGemstoneLabel: "భాగ్య రత్నం"
  },
  ta: {
    yogiBadge: "🌟 யோகி கிரகம் (பாக்கியம் & தனகாரகன்)",
    yogiPraise: "இந்த கிரகம் ஜாதகரின் வாழ்வில் அளப்பரிய வெற்றி, தடையில்லா செல்வம் மற்றும் பெரும் பாக்கியோதயத்தை அருளும் உன்னத தெய்வீக சக்தி.",
    duplicateYogiLabel: "துணை யோகி கிரகம் (இரட்டிப்பு அதிர்ஷ்டம்)",
    avayogiBadge: "⚠️ அவயோகி கிரகம் (தடை & சோதனைக் காரகம்)",
    avayogiWarning: "அவயோகி கிரகத்தின் தசா-புக்தி அல்லது அதன் நிறம்/ரத்தினத்தை பயன்படுத்தும் போது எச்சரிக்கை தேவை; இது காரியங்களில் தேவையற்ற தாமதத்தை தரும்.",
    luckyColorLabel: "அதிர்ஷ்ட நிறம்",
    luckyDirectionLabel: "தன விருத்தி திசை",
    wealthDayLabel: "பொற்கால நாள்",
    prescribedGemstoneLabel: "பாக்கிய ரத்தினம்"
  },
  en: {
    yogiBadge: "🌟 Yogi Planet (Wealth & Destiny Catalyst)",
    yogiPraise: "The celestial catalyst conferring effortless prosperity, sudden breakthroughs, and sovereign fortune in your chart.",
    duplicateYogiLabel: "Duplicate Yogi (Co-Catalyst of Fortune)",
    avayogiBadge: "⚠️ Avayogi Planet (Hidden Friction Trap)",
    avayogiWarning: "Exercise heightened caution during Avayogi Dasha/Antardasha; avoid wearing its associated gemstone or dominant color.",
    luckyColorLabel: "Auspicious Yogi Hue",
    luckyDirectionLabel: "Wealth Expansion Direction",
    wealthDayLabel: "Sovereign Inflow Day",
    prescribedGemstoneLabel: "Auspicious Gemstone"
  }
};

export const BHRIGU_BINDU_LOCALE: Record<
  SixLang,
  {
    title: string;
    description: string;
    breakthroughNotice: string;
    karmicTestNotice: string;
  }
> = {
  kn: {
    title: "⚡ ಭೃಗು ಬಿಂದು (ಭಾಗ್ಯ ಪರಿವರ್ತನಾ ಕೇಂದ್ರ ಬಿಂದು)",
    description: "ರಾಹು ಮತ್ತು ಚಂದ್ರನ ನಡುವಿನ ಪರಮ ಸೂಕ್ಷ್ಮ ಗಣಿತ ಬಿಂದು. ಗೋಚಾರ ಗುರು ಅಥವಾ ಶನಿ ಈ ಬಿಂದುವನ್ನು ಪ್ರವೇಶಿಸಿದಾಗ ಜೀವನದ ಮಹಾ ತಿರುವು ಸಂಭವಿಸುತ್ತದೆ.",
    breakthroughNotice: "ಗುರು ಗ್ರಹದ ಸಂಚಾರ ಪ್ರಭಾವದಿಂದ ಜೀವನದಲ್ಲಿ ಮಹಾ ತಿರುವು, ವಿವಾಹ, ಸಂತಾನ, ಉದ್ಯೋಗ ಬಡ್ತಿ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಧನಾಗಮನ ಖಚಿತ.",
    karmicTestNotice: "ಶನಿ ಅಥವಾ ರಾಹು ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಕಠಿಣ ಪರಿಶ್ರಮ, ಸ್ಥಳಾಂತರ, ಜವಾಬ್ದಾರಿಗಳ ಹೆಚ್ಚಳ ಹಾಗೂ ಕರ್ಮ ಪರೀಕ್ಷೆಯ ಕಾಲ."
  },
  mr: {
    title: "⚡ भृगू बिंदू (भाग्य परिवर्तन बिंदू)",
    description: "राहू व चंद्राच्या मधील अत्यंत सूक्ष्म गणितीय बिंदू. जेव्हा गोचर गुरु किंवा शनी या बिंदूवर येतात, तेव्हा जीवनाला मोठे वळण मिळते.",
    breakthroughNotice: "गुरु ग्रहाच्या शुभ परिभ्रमणामुळे मोठे यश, विवाह, संतती, पदोन्नती किंवा आकस्मिक धनलाभाचा योग.",
    karmicTestNotice: "शनी अथवा राहूच्या प्रभावामुळे कठीण परिश्रम, स्थानबदल, वाढत्या जबाबदाऱ्या व कर्म परीक्षेचा काळ."
  },
  hi: {
    title: "⚡ भृगु बिंदु (भाग्य परिवर्तन का केंद्र बिंदु)",
    description: "राहु एवं चंद्रमा के मध्य स्थित परम सूक्ष्म गणितीय बिंदु। जब गोचर में गुरु अथवा शनि इस बिंदु को स्पर्श करते हैं, तो जीवन में युगांतरकारी मोड़ आता है।",
    breakthroughNotice: "बृहस्पति के शुभ गोचर प्रभाव से जीवन में स्वर्णिम मोड़, विवाह, संतान, पदोन्नति अथवा अप्रत्याशित धन लाभ सुनिश्चित होता है।",
    karmicTestNotice: "शनि अथवा राहु के प्रभाव से कठिन परिश्रम, स्थानांतरण, उत्तरदायित्वों में वृद्धि एवं कर्म परीक्षा का काल।"
  },
  te: {
    title: "⚡ భృగు బిందువు (భాగ్య పరివర్తన కేంద్రం)",
    description: "రాహు మరియు చంద్రుల మధ్య గల పరమ సూక్ష్మ గణిత బిందువు. గోచార గురుడు లేదా శని ఈ బిందువును తాకినప్పుడు జీవితంలో కీలక మలుపు సంభవిస్తుంది.",
    breakthroughNotice: "గురు గ్రహ శుభ గోచారం వలన జీవితంలో గొప్ప విజయం, వివాహం, సంతానం, ఉద్యోగ ఉన్నతి లేదా ధనలాభం కలుగుతుంది.",
    karmicTestNotice: "శని లేదా రాహు గ్రహ ప్రభావం వల్ల కఠిన శ్రమ, స్థాన చలనం, బాధ్యతల పెరుగుదల మరియు కర్మ పరీక్షా కాలం."
  },
  ta: {
    title: "⚡ பிருகு பிந்து (விதி மாற்றத்தின் மையம்)",
    description: "ராகு மற்றும் சந்திரனுக்கு இடையே உள்ள மிகத் துல்லியமான கணிதப் புள்ளி. கோச்சார குரு அல்லது சனி இந்த புள்ளியை கடக்கும் போது வாழ்வில் மாபெரும் திருப்புமுனை நிகழ்கிறது.",
    breakthroughNotice: "குரு பகவானின் சுப கோச்சாரத்தால் வாழ்வில் பொற்கால மாற்றம், திருமணம், குழந்தை பாக்கியம், பதவி உயர்வு அல்லது திடீர் தன லாபம் உறுதி.",
    karmicTestNotice: "சனி அல்லது ராகுவின் தாக்கத்தால் கடுமையான உழைப்பு, இடமாற்றம், பொறுப்புகள் கூடுதல் மற்றும் கர்ம சோதனை காலம்."
  },
  en: {
    title: "⚡ Bhrigu Bindu (The Destiny Trigger Point)",
    description: "The exact mathematical midpoint between Rahu and Moon. Transits across this point trigger inescapable life milestones with ~95% precision.",
    breakthroughNotice: "Jupiter transit across Bhrigu Bindu triggers auspicious breakthroughs, executive ascension, matrimonial alliances, or windfall gains.",
    karmicTestNotice: "Saturn or Rahu transit across Bhrigu Bindu initiates intense karmic recalibration, relocation, restructuring, and profound endurance tests."
  }
};

export const PUSHKARA_LOCALE: Record<
  SixLang,
  {
    title: string;
    tagline: string;
    explanation: string;
  }
> = {
  kn: {
    title: "🛡️ ಪುಷ್ಕರ ನವಾಂಶ ರಕ್ಷೆ (ಅಜೇಯ ಗ್ರಹ ಶಕ್ತಿ)",
    tagline: "ದೈವಿಕ ಸಂರಕ್ಷಣೆ ಪಡೆದ ಪರಮ ಶುಭ ಗ್ರಹಗಳು",
    explanation: "ಈ ಗ್ರಹಗಳು ಎಷ್ಟೇ ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲೂ ಜಾತಕನನ್ನು ಬೀಳಲು ಬಿಡದೆ ಕೈಹಿಡಿದು ರಕ್ಷಿಸುವ ದೈವಿಕ ಸಂಕಲ್ಪವನ್ನು ಹೊಂದಿವೆ."
  },
  mr: {
    title: "🛡️ पुष्कर नवांश रक्षा (अजिंक्य ग्रह शक्ती)",
    tagline: "ईश्वरी कृपा लाभलेले परम शुभ ग्रह",
    explanation: "हे ग्रह कितीही कठीण संकटाच्या प्रसंगी जातकाला पूर्ण संरक्षण देऊन संकटातून सहीसलामत बाहेर काढतात."
  },
  hi: {
    title: "🛡️ पुष्कर नवांश रक्षा (अजेय ग्रह शक्ति)",
    tagline: "दैवीय अनुकंपा से अभिमंत्रित परम शुभ ग्रह",
    explanation: "ये ग्रह जीवन के विकट संकटों में भी जातक को अडिग रक्षा कवच प्रदान करते हैं और सुरक्षा सुनिश्चित करते हैं।"
  },
  te: {
    title: "🛡️ పుష్కర నవాంశ రక్షణ (అజేయ గ్రహ శక్తి)",
    tagline: "దైవానుగ్రహం పొందిన పరమ శుభ గ్రహాలు",
    explanation: "ఈ గ్రహాలు ఎంతటి కష్టకాలంలోనైనా జాతకుడిని రక్షించి, ఆపదల నుండి గట్టెక్కించే అద్భుత రక్షణ కవచం."
  },
  ta: {
    title: "🛡️ புஷ்கர நவாம்ச பாதுகாப்பு (வெல்ல முடியாத கிரகம்)",
    tagline: "தெய்வீக அருள் பெற்ற பரம சுப கிரகங்கள்",
    explanation: "இந்த கிரகங்கள் எத்தகைய சோதனையான காலத்திலும் ஜாதகருக்கு ஆபத்து நேராமல் காக்கும் தெய்வீக அரணாக திகழ்கின்றன."
  },
  en: {
    title: "🛡️ Pushkara Navamsha Blessing (The Invincible Grahas)",
    tagline: "Divinely Fortified Planetary Sanctuary",
    explanation: "Planets falling in sacred Pushkara degrees confer unassailable resilience, acting as divine life-jackets during acute karmic storms."
  }
};

// ----------------------------------------------------------------------------
// PRODUCT D: ORDER BUMP CHECKOUT LOCALIZATION (₹199 Add-on)
// ----------------------------------------------------------------------------
export const ORDER_BUMP_LOCALE: Record<
  SixLang,
  {
    headline: string;
    priceTag: string;
    checkboxLabel: string;
    pitchBullet1: string;
    pitchBullet2: string;
    pitchBullet3: string;
    guaranteeText: string;
  }
> = {
  kn: {
    headline: "✨ ವಿಶೇಷ ರಿಯಾಯಿತಿ: ನಿಮ್ಮ ಹೆಸರು, ಬ್ರ್ಯಾಂಡ್ & ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯ 'ಯೋಗಿ ಲೆಕ್ಕಾಚಾರ'",
    priceTag: "ಕೇವಲ ₹ ೧೯೯ (ಸಾಮಾನ್ಯ ದರ ₹ ೯೯೯)",
    checkboxLabel: "ಹೌದು! ನನ್ನ ಹೆಸರು ಹಾಗೂ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಯೋಗಿ ಗ್ರಹಕ್ಕೆ ಹೊಂದಿಸಿ ಕೊಡಿ (₹ ೧೯೯ ಮಾತ್ರ)",
    pitchBullet1: "ನಿಮ್ಮ ಹೆಸರು ಹಾಗೂ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯು ಯೋಗಿ ಗ್ರಹದ ಅದೃಷ್ಟ ತರಂಗಗಳಲ್ಲಿದೆಯೇ ಅಥವಾ ಅವಯೋಗಿ ಗ್ರಹದ ನಷ್ಟ ತರಂಗಗಳಲ್ಲಿದೆಯೇ ಎಂಬುದರ ನಿಖರ ಪರಿಶೀಲನೆ.",
    pitchBullet2: "ವ್ಯಾಪಾರ, ಬ್ಯಾಂಕಿಂಗ್ ಹಾಗೂ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಧನ ನಷ್ಟ ತಪ್ಪಿಸಲು ಕೇವಲ ೧ ಅಕ್ಷರ ಬದಲಾವಣೆಯ ಸೂಕ್ಷ್ಮ ಪರಿಹಾರ.",
    pitchBullet3: "ಆರ್ಡರ್ ಜೊತೆಗೆ ತಕ್ಷಣವೇ ೨-ಪುಟಗಳ ನಿಖರ ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ದೃಢೀಕರಣ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಲಭ್ಯ.",
    guaranteeText: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ವೇದ ಪಂಡಿತರ ಶಾಸ್ತ್ರೋಕ್ತ ಲೆಕ್ಕಾಚಾರ."
  },
  mr: {
    headline: "✨ विशेष सवलत: आपले नाव, ब्रँड व मोबाईल नंबरचे 'योगी विश्लेषण'",
    priceTag: "फक्त ₹ १९९ (नियमित मूल्य ₹ ९९९)",
    checkboxLabel: "होय! माझे नाव व मोबाईल नंबर योगी ग्रहाशी जुळवून द्या (केवळ ₹ १९९)",
    pitchBullet1: "आपले नाव व मोबाईल नंबर योगी ग्रहाच्या भाग्य लहरींमध्ये आहे की अवयोगी ग्रहाच्या नुकसान लहरींमध्ये, याची अचूक पडताळणी.",
    pitchBullet2: "व्यवसाय व आर्थिक व्यवहारांमध्ये यश मिळवण्यासाठी एका अक्षराच्या बदलाची सूक्ष्म उपाययोजना.",
    pitchBullet3: "ऑर्डरसोबत लगेचच २ पानांचा अचूक अंकशास्त्र अहवाल डाऊनलोडसाठी उपलब्ध.",
    guaranteeText: "श्री गोकर्ण महाबळेश्वर वेद पंडितांचे शास्त्रोक्त मार्गदर्शन."
  },
  hi: {
    headline: "✨ विशेष छूट: अपने नाम, ब्रांड एवं मोबाइल नंबर का 'योगी अंकीय विश्लेषण'",
    priceTag: "मात्र ₹ १९९ (नियमित मूल्य ₹ ९९९)",
    checkboxLabel: "हाँ! मेरे नाम एवं मोबाइल नंबर को योगी ग्रह के अनुकूल बनाएं (केवल ₹ १९९)",
    pitchBullet1: "आपका नाम एवं मोबाइल नंबर योगी ग्रह की भाग्यशाली तरंगों में है अथवा अवयोगी ग्रह की विघ्न तरंगों में, इसका सटीक परीक्षण।",
    pitchBullet2: "व्यापार एवं वित्तीय मामलों में निरंतर लाभ हेतु सूक्ष्म अक्षरीय संशोधन का शास्त्रोक्त परामर्श।",
    pitchBullet3: "ऑर्डर के साथ तुरंत २-पृष्ठीय प्रामाणिक अंकशास्त्र रिपोर्ट डाउनलोड उपलब्ध।",
    guaranteeText: "श्री गोकर्ण महाबलेश्वर वेद पंडितों द्वारा प्रमाणित गणना।"
  },
  te: {
    headline: "✨ ప్రత్యేక ఆఫర్: మీ పేరు, బ్రాండ్ & మొబైల్ నంబర్ 'యోగి గ్రహ విశ్లేషణ'",
    priceTag: "కేవలం ₹ 199 (సాధారణ ధర ₹ 999)",
    checkboxLabel: "అవును! నా పేరు మరియు మొబైల్ నంబర్‌ను యోగి గ్రహానికి అనుకూలంగా సరిచేయండి (₹ 199 మాత్రమే)",
    pitchBullet1: "మీ పేరు & మొబైల్ సంఖ్య యోగి గ్రహ అదృష్ట తరంగాలలో ఉందా లేక అవయోగి గ్రహ ఆటంక తరంగాలలో ఉందా అనే ఖచ్చితమైన విశ్లేషణ.",
    pitchBullet2: "వ్యాపారం మరియు ఆర్థిక రంగాలలో శాశ్వత విజయం కోసం ఒకే అక్షరం మార్పుతో అద్భుత ఫలితం.",
    pitchBullet3: "ఆర్డర్‌తో పాటు తక్షణమే 2 పేజీల ప్రామాణిక సంఖ్యాశాస్త్ర నివేదిక డౌన్‌లోడ్ లభ్యం.",
    guaranteeText: "శ్రీ గోకర్ణ మహాబలేశ్వర వేద పండితుల శాస్త్రోక్త గణన."
  },
  ta: {
    headline: "✨ சிறப்பு சலுகை: உங்கள் பெயர், பிராண்ட் & மொபைல் எண் 'யோகி கிரஹ கணக்கீடு'",
    priceTag: "வெறும் ₹ 199 (வழக்கமான விலை ₹ 999)",
    checkboxLabel: "ஆம்! என் பெயர் மற்றும் மொபைல் எண்ணை யோகி கிரகத்திற்கு ஏற்ப மாற்றித் தாருங்கள் (₹ 199 மட்டும்)",
    pitchBullet1: "உங்கள் பெயர் & மொபைல் எண் யோகி கிரகத்தின் அதிர்ஷ்ட அலைவரிசையில் உள்ளதா அல்லது அவயோகி கிரகத்தின் தடையில் உள்ளதா என துல்லிய ஆய்வு.",
    pitchBullet2: "தொழில் மற்றும் பணப் புழக்கத்தில் வெற்றி பெற ஒற்றை எழுத்து மாற்றத்தின் நுட்பமான பரிகாரம்.",
    pitchBullet3: "ஆர்டருடன் உடனடியாக 2 பக்க எண் கணித அறிக்கை பதிவிறக்கம் செய்ய கிடைக்கும்.",
    guaranteeText: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் வேத பண்டிதர்களின் சாஸ்திரோக்த கணிதம்."
  },
  en: {
    headline: "✨ VIP Order Bump: Name, Brand & Mobile Number Yogi Frequency Audit",
    priceTag: "Only ₹199 (Regular ₹999)",
    checkboxLabel: "YES! Align my Name & Mobile Number with my Yogi Planet for Maximum Wealth (Just ₹199)",
    pitchBullet1: "Determine whether your personal name, business brand, and SIM card vibrate with your Yogi Wealth frequency or Avayogi Friction trap.",
    pitchBullet2: "Receive a single-letter precision spelling calibration to dissolve subconscious financial bottlenecks.",
    pitchBullet3: "Instant 2-Page Numerological Vibration Certificate delivered along with your order.",
    guaranteeText: "Grounded in Authentic Seshadri Iyer Vedic Principles & Sri Kshetra Gokarna Heritage."
  }
};
