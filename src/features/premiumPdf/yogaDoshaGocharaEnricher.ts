/**
 * Yoga, Dosha & Gochara Content Enrichment Engine
 *
 * Guarantees that every Yoga, Dosha, and Gochara card in Premium PDF V1 contains:
 * 1. EXACTLY TWO (2) PARAGRAPHS separated by \n\n.
 * 2. EACH PARAGRAPH contains AT LEAST 4 TO 5 SUBSTANTIAL LINES OF TEXT (220-450+ chars).
 * 3. Paragraph 1: Explains what that Yoga/Dosha/Gochara is (classical Vedic definition, grahas, houses).
 * 4. Paragraph 2: Explains what this Yoga/Dosha/Gochara is currently doing in their life (real-world daily impact: career, decisions, mental state, prosperity).
 *
 * Fully localized across 5 languages: Kannada (kn), Hindi (hi), Telugu (te), Tamil (ta), English (en).
 */

import { cleanEnglishFromRegionalText } from "./premiumPdfLocale";
import { transliterateName } from "../../utils/transliterator";

export interface EnrichmentContext {
  lang: string;
  lagnaStr?: string;
  moonStr?: string;
  ageYears?: number;
  dashaName?: string;
  bhuktiName?: string;
}

/**
 * Checks if a given text already has at least 2 paragraphs with substantial length (at least ~180 chars each).
 */
export function hasTwoSubstantialParagraphs(text: string | undefined, minCharsPerPara: number = 180): boolean {
  if (!text) return false;
  const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  if (paras.length < 2) return false;
  return paras[0].length >= minCharsPerPara && paras[1].length >= minCharsPerPara;
}

/**
 * Formats exactly two paragraphs separated by \n\n.
 * If a prior short text exists, it is merged into Paragraph 1 (what it is), ensuring the 2-paragraph contract is never broken.
 */
function formatTwoParagraphs(p1: string, p2: string, cleanImpact?: string): string {
  const shortText = (cleanImpact || "").replace(/[\r\n]+/g, " ").trim();
  const para1 = shortText && !p1.includes(shortText) ? `${shortText} ${p1}` : p1;
  return `${para1}\n\n${p2}`;
}

/**
 * Enriches any Yoga description into exactly 2 full paragraphs (4-5 lines each).
 * Para 1: Explains what the Yoga is.
 * Para 2: Explains what this Yoga is currently doing in their life.
 */
export function enrichYogaDescription(
  name: string,
  impact: string,
  lang: string,
  lagnaStr: string = "Lagna",
  moonStr: string = "Moon Sign",
  ageYears?: number,
  dashaName: string = "Dasha",
  bhuktiName: string = "Bhukti"
): string {
  const cleanImpact = (impact || "").trim();
  const baseLang = (lang || "en").split("-")[0];
  const lowerName = (name || "").toLowerCase();

  // If text already has 2 generous paragraphs with at least 180 chars each, preserve it
  if (hasTwoSubstantialParagraphs(cleanImpact, 180)) {
    return baseLang === "en" ? cleanImpact : cleanEnglishFromRegionalText(cleanImpact, baseLang);
  }

  // 1. GAJAKESARI YOGA
  if (
    lowerName.includes("gajakesari") ||
    lowerName.includes("ಗಜಕೇಸರಿ") ||
    lowerName.includes("गजकेसरी") ||
    lowerName.includes("గజకేసరి") ||
    lowerName.includes("கஜகேசரி")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಮನಃಕಾರಕ ಚಂದ್ರರ ಪರಸ್ಪರ ಕೇಂದ್ರ ಸ್ಥಿತಿಯಿಂದ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾದ ಶ್ರೀ ಗಜಕೇಸರಿ ಮಹಾರಾಜಯೋಗವು ನಿರ್ಮಾಣಗೊಂಡಿದೆ. ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ ಗುರುವು ದೈವಿಕ ಜ್ಞಾನ, ಸದ್ಬುದ್ಧಿ ಮತ್ತು ಭಾಗ್ಯದ ಸಂಕೇತವಾಗಿದ್ದರೆ, ಚಂದ್ರನು ಮಾನಸಿಕ ಸ್ಥೈರ್ಯ ಹಾಗೂ ಭಾವನಾತ್ಮಕ ಸಮತೋಲನದ ಅಧಿಪತಿಯಾಗಿದ್ದಾನೆ. ಈ ಎರಡು ಶುಭ ಗ್ರಹಗಳ ಪರಸ್ಪರ ಸಮನ್ವಯವು ಜಾತಕನಿಗೆ ಸಹಜವಾದ ಉದಾತ್ತ ವ್ಯಕ್ತಿತ್ವ, ಧರ್ಮನಿಷ್ಠ ನಡವಳಿಕೆ, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವದ ಗುಣಗಳನ್ನು ಪ್ರದಾನ ಮಾಡುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ಗಜಕೇಸರಿ ಯೋಗವು ನಿಮ್ಮ ದೈನಂದಿನ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ರಕ್ಷಣಾ ಕವಚವಾಗಿ ಸಕ್ರಿಯವಾಗಿದೆ. ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಎದುರಾಗುವ ಜಟಿಲ ಸವಾಲುಗಳನ್ನು ಶಾಂತಚಿತ್ತದಿಂದ ಪರಿಹರಿಸಲು, ಕೌಟುಂಬಿಕ ನಿರ್ಧಾರಗಳಲ್ಲಿ ನಿಮ್ಮ ಮಾತಿಗೆ ಹಿರಿಯರು ಹಾಗೂ ಆಪ್ತರು ಮನ್ನಣೆ ನೀಡುವಂತೆ ಮಾಡಲು ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯನ್ನು ಸಂರಕ್ಷಿಸಲು ಈ ಯೋಗವು ನೆರವಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ಸತ್ಯನಿಷ್ಠೆ ಮತ್ತು ಸಮಾಧಾನದ ನಡವಳಿಕೆಯು ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲದಲ್ಲಿ ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ಗೌರವ ಹಾಗೂ ಪ್ರತಿಷ್ಠೆಯನ್ನು ನಿರಂತರವಾಗಿ ವೃದ್ಧಿಸುತ್ತಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में देवगुरु बृहस्पति एवं मनःकारक चंद्रमा की परस्पर केंद्र स्थिति से अत्यंत शुभ गजकेसरी राजयोग का निर्माण हुआ है। वैदिक फलित ज्योतिष के अनुसार जब ज्ञान के अधिपति गुरु और मानसिक चेतना के स्वामी चंद्र एक-दूसरे से केंद्र में होते हैं, तो जातक को असाधारण मेधा शक्ति, सदाचार, गंभीर व्यक्तित्व और समाज में प्रतिष्ठित स्थान प्राप्त होता है। यह पावन योग जन्मजात विवेक, धर्मनिष्ठा और किसी भी विषम परिस्थिति में संतुलन बनाए रखने की अद्भुत आत्मिक शक्ति प्रदान करता है।`;
      const p2 = `वर्तमान समय में आपकी आयु एवं ग्रह दशा के इस दौर में यह गजकेसरी योग आपके दैनिक जीवन और कार्यक्षेत्र में सक्रिय रूप से शुभ फल प्रदान कर रहा है। यह आपके कार्यक्षेत्र में आने वाली अनपेक्षित बाधाओं को दूर करने, वरिष्ठों और सहयोगियों के बीच आपके निर्णयों को मान्यता दिलाने तथा आर्थिक स्थिरता बनाए रखने में सुरक्षा कवच का कार्य कर रहा है। आपकी सूझबूझ और शांत स्वभाव के कारण वर्तमान कालखंड में आपकी सामाजिक प्रतिष्ठा और पारिवारिक सम्मान में निरंतर वृद्धि हो रही है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో దేవగురువైన బృహస్పతి మరియు మనఃకారకుడైన చంద్రుడు పరస్పరం కేంద్ర స్థానాలలో స్థితి చెందడం వల్ల అత్యంత శుభప్రదమైన గజకేసరి మహారాజయోగం ఏర్పడింది. జ్యోతిష శాస్త్ర ప్రకారం గురుడు జ్ఞానానికి, ధర్మానికి ప్రతీక కాగా, చంద్రుడు మనశ్శాంతికి, ఆలోచనలకు అధిపతి. ఈ రెండు శుభ గ్రహాల కలయిక జాతకుడికి సహజమైన బుద్ధికుశలతను, సదాచార సంపన్నతను, నాయకత్వ లక్షణాలను మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తుంది.`;
      const p2 = `ప్రస్తుతం మీ జీవితంలో ఈ గజకేసరి యోగం మీ దైనందిన వృత్తి మరియు వ్యక్తిగత రంగాలలో ఒక రక్షణా కవచంలా పనిచేస్తోంది. ఉద్యోగ వ్యాపారాలలో ఎదురయ్యే క్లిష్ట సమస్యలను సంయమనంతో పరిష్కరించుకోవడానికి, కుటుంబ నిర్ణయాలలో మీ మాటకు తగిన విలువ లభించడానికి మరియు ఆర్థిక భద్రతను కాపాడుకోవడానికి ఈ యోగం తోడ్పడుతోంది. మీ నిజాయితీ మరియు ప్రశాంత ఆలోచనా విధానం ప్రస్తుత దశా కాలంలో సమాజంలో మీ కీర్తి ప్రతిష్టలను స్థిరంగా పెంచుతోంది.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் தேவகுரு பிரகஸ்பதியும் மனோகாரகரான சந்திரனும் பரஸ்பரம் கேந்திர ஸ்தானங்களில் அமைந்திருப்பதால் மிகவும் போற்றத்தக்க கஜகேசரி யோகம் உண்டாகியுள்ளது. ஜோதிட சாஸ்திர விதிகளின்படி குரு பகவான் தெய்வீக ஞானத்தையும் தர்மத்தையும் குறிக்கிறார்; சந்திரன் மன அமைதியையும் உள்ளுணர்வையும் ஆளுகிறார். இவ்விரு சுப கிரகங்களின் இணைவு ஜாதகருக்கு இயல்பான புத்திக்கூர்மை, உயர்ந்த நற்குணங்கள், தலைமை தாங்கும் தகுதி மற்றும் சமூகத்தில் நன்மதிப்பைத் தருகிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையிலும் தொழில் துறையிலும் இந்த கஜகேசரி யோகம் ஒரு பாதுகாப்பு அரணாகச் செயல்பட்டு வருகிறது. பணிச்சூழலில் ஏற்படும் சவால்களை நிதானமாக எதிர்கொள்ளவும், குடும்ப முடிவுகளில் உங்கள் வார்த்தைகளுக்கு உரிய மதிப்பைப் பெற்றுத் தரவும், பொருளாதார ரீதியான ஸ்திரத்தன்மையைப் பாதுகாக்கவும் இந்த யோகம் உதவுகிறது. உங்களின் நேர்மையும் அமைதியான அணுகுமுறையும் தற்போதைய திசா காலத்தில் சமூகத்தில் உங்கள் கௌரவத்தை உயர்த்துகிறது.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The auspicious mutual angular placement between divine preceptor Jupiter and the natal Moon forms the celebrated Gajakesari Maha Raja Yoga in your birth chart. Classical Vedic scriptures establish that Jupiter governs higher wisdom, spiritual discernment, and expansion, while the Moon presides over mental perception and emotional poise. The harmonious resonance between these two supreme benefics bestows noble character, intellectual brilliance, philosophical resilience, and natural leadership that commands innate societal respect.`;
    const p2 = `In your current life phase, this Gajakesari Yoga is actively operating as a dynamic protective shield across your vocational responsibilities and daily decisions. It sharpens your strategic foresight, enabling you to resolve intricate workplace challenges with calm authority and secure the trust of mentors and peers. Even during stressful periods, this planetary alignment preserves your financial equilibrium, protects your family's honorable reputation, and opens doors to lasting ethical accomplishments.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 2. OBHAYACHARI / UBHAYACHARI / VASI / VESI YOGA
  if (
    lowerName.includes("obhayachari") ||
    lowerName.includes("ubhaya") ||
    lowerName.includes("vasi") ||
    lowerName.includes("vesi") ||
    lowerName.includes("ಉಭಯಚಾರಿ") ||
    lowerName.includes("उभयचारी") ||
    lowerName.includes("ఉభయచారి") ||
    lowerName.includes("உபயசாரி")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಆತ್ಮಕಾರಕ ಸೂರ್ಯನ ಎರಡೂ ಪಾರ್ಶ್ವಗಳಲ್ಲಿ (೨ನೇ ಹಾಗೂ ೧೨ನೇ ಭಾವಗಳಲ್ಲಿ) ಶುಭ ಗ್ರಹಗಳು ನೆಲೆಸಿರುವುದರಿಂದ ಶಕ್ತಿಶಾಲಿ ಉಭಯಚಾರಿ ಯೋಗವು ಸಿದ್ಧಿಸಿದೆ. ಸೂರ್ಯನು ಆತ್ಮಸ್ಥೈರ್ಯ, ರಾಜತೇಜಸ್ಸು ಹಾಗೂ ಕೀರ್ತಿಯ ಕಾರಕನಾಗಿದ್ದು, ಅವನ ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಶುಭ ಗ್ರಹಗಳ ಬೆಂಬಲವಿರುವುದು ವ್ಯಕ್ತಿಯ ಜೀವನದಲ್ಲಿ ಸ್ಥಿರವಾದ ಸಮತೋಲನ, ವಾಕ್ಚಾತುರ್ಯ, ಉದಾರ ಮನೋಭಾವ ಹಾಗೂ ಯಾವುದೇ ಕಷ್ಟದಲ್ಲೂ ಧೃತಿಗೆಡದ ಅದ್ಭುತ ಧೈರ್ಯವನ್ನು ರೂಪಿಸುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ಉಭಯಚಾರಿ ಯೋಗವು ನಿಮ್ಮ ಆಂತರಿಕ ಆತ್ಮವಿಶ್ವಾಸವನ್ನು ಗಟ್ಟಿಗೊಳಿಸುತ್ತಿದೆ. ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕಗಳಲ್ಲಿ ನಿಮ್ಮ ಮಾತಿಗೆ ತೂಕ ತಂದುಕೊಡಲು, ಅಧಿಕಾರಿಗಳು ಹಾಗೂ ಪ್ರಭಾವಿ ವ್ಯಕ್ತಿಗಳಿಂದ ಸಕಾಲಿಕ ಸಹಾಯ ದೊರೆಯುವಂತೆ ಮಾಡಲು ಮತ್ತು ಕುಟುಂಬದ ಹಿತಾಸಕ್ತಿಗಳನ್ನು ಸಮರ್ಥವಾಗಿ ರಕ್ಷಿಸಲು ಈ ಯೋಗವು ಸಕ್ರಿಯವಾಗಿದೆ. ನಿಮ್ಮ ಮುತ್ಸದ್ದಿತನ ಹಾಗೂ ನ್ಯಾಯಪರ ನಿಲುವುಗಳು ನಿಮ್ಮ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ನೂತನ ಪ್ರಗತಿಯ ಅವಕಾಶಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿವೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी कुंडली में आत्मा के कारक सूर्य देव के दोनों ओर (द्वितीय एवं द्वादश भाव में) शुभ ग्रहों की उपस्थिति से अत्यंत प्रभावशाली उभयचारी योग का निर्माण हुआ है। सूर्य तेज, नेतृत्व और मान-सम्मान के अधिपति हैं, और उनके दोनों पार्श्वों में शुभ ग्रहों की स्थिति जातक को राजा के समान निर्भीक स्वभाव, आकर्षक वाकपटुता, परोपकारी दृष्टि और समाज में सम्मानित स्थिति प्रदान करती है। यह योग विपरीत परिस्थितियों में भी आत्मबल को बनाए रखता है।`;
      const p2 = `वर्तमान समय में आपके दैनिक जीवन और निर्णयों में यह उभयचारी योग आत्मिक दृढ़ता और स्पष्ट दिशा प्रदान कर रहा है। कार्यक्षेत्र में अधिकारियों के साथ तालमेल बिठाने, सामाजिक संपर्कों का लाभ प्राप्त करने तथा महत्वपूर्ण बैठकों और वार्ताओं में अपने पक्ष को प्रभावशाली ढंग से प्रस्तुत करने में यह ऊर्जा आपकी सहायता कर रही है। आपकी निष्पक्षता और उदार दृष्टिकोण से परिवार एवं समाज में आपका प्रभाव और विश्वसनीयता लगातार बढ़ रही है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జాతక చక్రంలో ఆత్మకారకుడైన సూర్య భగవానునికి ఇరువైపులా (2వ మరియు 12వ స్థానాలలో) శుభ గ్రహాలు సమస్థితిలో ఉండటం వల్ల బలమైన ఉభయచారి యోగం ఏర్పడింది. సూర్యుడు తేజస్సు, ఆత్మవిశ్వాసం మరియు నాయకత్వానికి ప్రతీక. ఆయనకు ఇరువైపులా శుభ గ్రహాల రక్షణ ఉండటం వల్ల జాతకుడికి అద్భుతమైన వాక్చాతుర్యం, ఉదార స్వభావం, ధైర్యసాహసాలు మరియు సమాజంలో గొప్ప ప్రతిష్ట సహజంగానే లభిస్తాయి.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవితంలో ఈ ఉభయచారి యోగం మీ ఆత్మవిశ్వాసాన్ని మరియు నాయకత్వ పటిమను బలపరుస్తోంది. ఉద్యోగ రంగంలో ఉన్నతాధికారుల మద్దతు లభించడానికి, ముఖ్యమైన చర్చలలో మీ మాటకు గుర్తింపు దక్కడానికి మరియు కుటుంబ ప్రతిష్టను కాపాడటానికి ఈ యోగం ఎంతగానో తోడ్పడుతోంది. మీ న్యాయబద్ధమైన ఆలోచనలు మరియు స్థిరమైన నిర్ణయాలు భవిష్యత్తుకు బలమైన పునాదిని వేస్తున్నాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் ஆத்மகாரகரான சூரிய பகவானின் இருபுறமும் (2 மற்றும் 12 ஆம் வீடுகளில்) சுப கிரகங்கள் சஞ்சரிப்பதால் சக்திவாய்ந்த உபயசாரி யோகம் உண்டாகியுள்ளது. சூரியன் தலைமைப் பண்பு, கௌரவம் மற்றும் ஆன்ம பலத்தின் அதிபதி ஆவார். அவரது இருபுறமும் சுப கிரகங்கள் அணிவகுத்து நிற்பது ஜாதகருக்கு வசீகரமான பேச்சுத்திறன், தாராள குணம், அஞ்சா நெஞ்சம் மற்றும் அரசருக்கு நிகரான நன்மதிப்பைத் தரும்.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையிலும் முடிவெடுக்கும் திறனிலும் இந்த உபயசாரி யோகம் சிறந்த வழிகாட்டுதலை வழங்குகிறது. பணியிடத்தில் அதிகாரிகளின் ஆதரவைப் பெறவும், பொதுத் தொடர்புகளில் உங்கள் கருத்துக்கு மதிப்புக் கூடவும், குடும்ப கௌரவத்தைப் பாதுகாக்கவும் இது உதவுகிறது. உங்கள் நடுநிலையான சிந்தனையும் நேர்மையான அணுகுமுறையும் தொழில் வாழ்க்கையில் புதிய வாய்ப்புகளை உருவாக்கித் தருகிறது.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The positioning of benefic planets flanking the Sun in the 2nd and 12th houses from it forms the illustrious Obhayachari Yoga in your natal chart. The Sun represents the vital soul force, sovereignty, and dignified self-worth. When guarded on both flanks by auspicious planetary influences, the native is endowed with eloquent speech, unshakeable courage, philosophical benevolence, and natural charisma that flourishes across competitive environments.`;
    const p2 = `In your living reality today, this Obhayachari Yoga actively reinforces your inner conviction and public standing. It empowers you to articulate complex ideas with calm persuasion, secures goodwill from superiors and mentors, and protects you against professional isolation or exhaustion. Your fair-minded principles and steady temperament ensure that your initiatives gain steady momentum, turning vocational challenges into enduring achievements.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 3. MAHALAKSHMI / LAKSHMI YOGA
  if (
    lowerName.includes("lakshmi") ||
    lowerName.includes("ಲಕ್ಷ್ಮಿ") ||
    lowerName.includes("लक्ष्मी") ||
    lowerName.includes("లక్ష్మి") ||
    lowerName.includes("லக்ஷ்மி")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಭಾಗ್ಯಸ್ಥಾನವಾದ ೯ನೇ ಅಥವಾ ೫ನೇ ಭಾವಾಧಿಪತಿಯರ ಪರಸ್ಪರ ಶುಭ ದೃಷ್ಟಿ ಅಥವಾ ಸಂಯೋಗದಿಂದ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಗವು ಸಿದ್ಧಿಸಿದೆ. ಈ ಪವಿತ್ರ ಯೋಗವು ಸಾಕ್ಷಾತ್ ಧನದೇವತೆ ಲಕ್ಷ್ಮಿಯ ಅನುಗ್ರಹವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ ಇದು ವ್ಯಕ್ತಿಗೆ ಸಹಜ ಧನಲಾಭ, ಸೌಂದರ್ಯಪ್ರಜ್ಞೆ, ಆಸ್ತಿ-ವಾಹನ ಸುಖ, ಸತ್ಸಂತಾನ ಹಾಗೂ ಸಜ್ಜನರ ಸೌಹಾರ್ದತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಕರುಣಿಸುವ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಯೋಗವಾಗಿದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ಮಹಾಲಕ್ಷ್ಮಿ ಯೋಗವು ನಿಮ್ಮ ಆರ್ಥಿಕ ಯೋಜನೆಗಳು ಹಾಗೂ ಕುಟುಂಬದ ಸೌಖ್ಯದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಫಲಗಳನ್ನು ನೀಡುತ್ತಿದೆ. ನಿರೀಕ್ಷಿತ ಧನಾಗಮನದಲ್ಲಿ ಬರುವ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಲು, ಅನಿವಾರ್ಯ ಖರ್ಚುಗಳನ್ನು ಸಮತೋಲನದಲ್ಲಿ ಇರಿಸಲು ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಮತ್ತು ಉಳಿತಾಯದ ಮೂಲಗಳನ್ನು ಬಲಪಡಿಸಲು ಈ ಯೋಗದ ಬಲವು ನೆರವಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ಧರ್ಮಶ್ರದ್ಧೆಯು ಭವಿಷ್ಯದಲ್ಲಿ ಸುಸ್ಥಿರ ಸಂಪತ್ತು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿಯನ್ನು ಖಾತರಿಪಡಿಸುತ್ತದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में लग्नेश और नवमेश (अथवा पंचमेश) के परस्पर शुभ संबंध से अत्यंत पावन महालक्ष्मी योग का सृजन हुआ है। यह योग साक्षात धन की अधिष्ठात्री देवी महालक्ष्मी की कृपा का प्रतीक है। वैदिक ज्योतिष के अनुसार यह योग जातक को सहज धन-धान्य, वाहन एवं भूमि सुख, सौम्य स्वभाव और समाज में कुलीन जनों की मित्रता प्रदान करता है। यह जीवन के कठिन दौर में भी आर्थिक सुरक्षा बनाए रखता है।`;
      const p2 = `वर्तमान समय में आपकी जीवन यात्रा में यह महालक्ष्मी योग आपकी आर्थिक योजनाओं और पारिवारिक समृद्धि में प्रत्यक्ष योगदान दे रहा है। यह अनावश्यक व्ययों पर नियंत्रण रखने, धन के नए स्रोतों को सुदृढ़ करने तथा परिवार के लिए सुख-सुविधाओं की वृद्धि में सहायक सिद्ध हो रहा है। आपकी धर्मपरायणता और ईमानदारी से किए गए निवेश वर्तमान ग्रह गोचर में आपके लिए निरंतर स्थिरता और शांति का निर्माण कर रहे हैं।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జాతకంలో లగ్నాధిపతి మరియు భాగ్యాధిపతుల (9వ లేదా 5వ అధిపతుల) శుభ దృష్టి లేదా సంయోగం వల్ల మహాలక్ష్మి రాజయోగం సిద్ధించింది. ఈ పవిత్ర యోగం సాక్షాత్ లక్ష్మీదేవి కటాక్షాన్ని సూచిస్తుంది. శాస్త్రోక్తంగా ఇది జాతకుడికి నిరంతర ధనలాభం, గృహ వాహన సౌఖ్యాలు, ఆకర్షణీయమైన వ్యక్తిత్వం మరియు ఉన్నత వ్యక్తుల మైత్రిని ప్రసాదించే అత్యంత శ్రేష్ఠమైన ధన యోగాలలో ఒకటి.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవితంలో ఈ మహాలక్ష్మి యోగం మీ ఆర్థిక ప్రణాళికలను మరియు కుటుంబ సంక్షేమాన్ని పటిష్టం చేస్తోంది. ఊహించని ఖర్చులను సమర్థవంతంగా అధిగమించడానికి, స్థిరాస్తి అభివృద్ధికి మరియు నూతన ఆదాయ మార్గాలను పెంపొందించుకోవడానికి ఈ యోగం తోడ్పడుతోంది. మీ ధర్మబద్ధమైన శ్రమ మరియు దైవభక్తి ప్రస్తుత కాలంలో కుటుంబానికి శాశ్వత సుఖసంతోషాలను చేకూరుస్తున్నాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் லக்னாதிபதியும் பாக்கியாதிபதியும் (9 அல்லது 5 ஆம் அதிபதிகள்) சுப பார்வையில் அல்லது சேர்க்கையில் அமைந்திருப்பதால் மகாலக்ஷ்மி யோகம் உருவாகியுள்ளது. இது அன்னை மகாலக்ஷ்மியின் பரிபூரண அருட்கொடையைக் குறிக்கிறது. சாஸ்திரங்களின்படி இது ஜாதகருக்குத் தடையற்ற தன லாபம், நிலம் மற்றும் வாகன யோகம், நேர்த்தியான குணம் மற்றும் செல்வந்தர்களின் நன்மதிப்பைப் பெற்றுத் தரும் சிறந்த யோகமாகும்.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் குடும்ப நல்வாழ்விலும் நிதித் திட்டங்களிலும் இந்த மகாலக்ஷ்மி யோகம் சாதகமான மாற்றங்களை வழங்கி வருகிறது. தேவையற்ற செலவுகளைக் கட்டுக்குள் வைத்திருக்கவும், புதிய சேமிப்பு மற்றும் சொத்து வழிகளை உருவாக்கவும் இது உறுதுணையாக உள்ளது. உங்கள் தர்மசிந்தனையும் கடின உழைப்பும் குடும்பத்தில் பொருளாதார நிலைத்தன்மையையும் மன அமைதியையும் உறுதி செய்கிறது.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The harmonious relationship between the Ascendant lord and the auspicious 9th or 5th house lords produces the celebrated Mahalakshmi Yoga in your birth chart. Symbolizing the benevolent grace of Goddess Lakshmi, this classical formation blesses the native with organic financial growth, property and conveyance comforts, aesthetic refinement, and high-standing alliances that withstand seasonal adversities.`;
    const p2 = `In your present day-to-day life, this Mahalakshmi Yoga is actively strengthening your financial foundation and domestic comfort. It shields your resources against volatile expenditures, guides prudent capital stewardship, and aligns vocational opportunities with stable rewards. Grounded in ethical perseverance, this auspicious resonance ensures continuous family prosperity and peace of mind.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 4. DHARMA-KARMA ADHIPATI YOGA
  if (
    lowerName.includes("dharma-karma") ||
    lowerName.includes("dharmakarma") ||
    lowerName.includes("ಧರ್ಮ-ಕರ್ಮ") ||
    lowerName.includes("धर्म-कर्म") ||
    lowerName.includes("ధర్మ-కర్మ") ||
    lowerName.includes("தர்ம-கர்மா")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಭಾಗ್ಯಸ್ಥಾನವಾದ ೯ನೇ ಮನೆಯ ಅಧಿಪತಿ ಹಾಗೂ ಕರ್ಮಸ್ಥಾನವಾದ ೧೦ನೇ ಮನೆಯ ಅಧಿಪತಿಯರ ಪವಿತ್ರ ಸಂಯೋಗ ಅಥವಾ ಪರಸ್ಪರ ದೃಷ್ಟಿಯಿಂದ ಧರ್ಮ-ಕರ್ಮಾಧಿಪತಿ ರಾಜಯೋಗವು ನಿರ್ಮಾಣವಾಗಿದೆ. ೯ನೇ ಮನೆಯು ಧರ್ಮ, ಭಾಗ್ಯ ಹಾಗೂ ದೈವಕೃಪೆಯನ್ನು ಪ್ರತಿನಿಧಿಸಿದರೆ, ೧೦ನೇ ಮನೆಯು ಉದ್ಯೋಗ, ಕರ್ತವ್ಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ಇವೆರಡರ ಮಧುರ ಮಿಲನವು ಜೀವನದಲ್ಲಿ ಉನ್ನತ ಅಧಿಕಾರ, ಸತ್ಕರ್ಮಗಳ ಆಚರಣೆ ಹಾಗೂ ಸಮಾಜಕ್ಕೆ ಮಾದರಿಯಾಗುವ ಯಶಸ್ಸನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ವೃತ್ತಿಜೀವನ ಮತ್ತು ಕರ್ತವ್ಯ ಪಾಲನೆಯಲ್ಲಿ ಈ ಯೋಗವು ಸಕ್ರಿಯ ಮಾರ್ಗದರ್ಶಕನಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ. ಉದ್ಯೋಗದಲ್ಲಿ ಬರುವ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನಿಭಾಯಿಸಲು, ಹೊಸ ಯೋಜನೆಗಳನ್ನು ಸಾಕಾರಗೊಳಿಸಲು ಮತ್ತು ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ಹಾಗೂ ಬಡ್ತಿ ಲಭಿಸುವಂತೆ ಮಾಡಲು ಇದು ಸಹಕಾರಿಯಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಾಮಾಣಿಕ ಕರ್ತವ್ಯನಿಷ್ಠೆಯು ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮನ್ನು ಪ್ರಭಾವಿ ಹಾಗೂ ನಂಬಿಕಸ್ಥ ವ್ಯಕ್ತಿಯನ್ನಾಗಿ ರೂಪಿಸುತ್ತಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी कुंडली में नवम भाव (भाग्य) और दशम भाव (कर्म) के स्वामियों के परस्पर पावन संबंध से धर्म-कर्माधिपति महा राजयोग का निर्माण हुआ है। नवम भाव धर्म, ईश्वरीय कृपा और पूर्व संचित पुण्यों का प्रतीक है, जबकि दशम भाव कर्मक्षेत्र, अधिकार और सामाजिक प्रभाव का प्रतिनिधित्व करता है। इन दोनों का समन्वय जातक को कार्यक्षेत्र में उच्च पद, नैतिक नेतृत्व और जीवन में स्थायी सफलता प्रदान करता है।`;
      const p2 = `वर्तमान समय में यह राजयोग आपके कार्यक्षेत्र और दैनिक जिम्मेदारियों में स्पष्ट प्रगति का मार्ग प्रशस्त कर रहा है। यह आपको जटिल व्यावसायिक निर्णयों में सही दिशा प्रदान करने, वरिष्ठों का विश्वास जीतने तथा समाज में अपनी साख मजबूत करने में सहायक सिद्ध हो रहा है। आपके द्वारा किए जा रहे निष्ठावान प्रयास आने वाले समय में आपको प्रतिष्ठित मुकाम और वित्तीय सुरक्षा दिलाने में पूर्ण समर्थ हैं।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో భాగ్యస్థానమైన 9వ అధిపతి మరియు కర్మస్థానమైన 10వ అధిపతుల పరస్పర శుభ దృష్టి లేదా సంయోగం వల్ల అత్యున్నత ధర్మ-కర్మాధిపతి రాజయోగం ఏర్పడింది. 9వ స్థానం ధర్మం, దైవానుగ్రహం మరియు పూర్వపుణ్యానికి ప్రతీక కాగా, 10వ స్థానం వృత్తి, అధికారం మరియు ప్రజా గౌరవానికి కేంద్రం. ఈ రెండు శుభ స్థానాధిపతుల కలయిక జాతకుడికి సమాజంలో ఉన్నత హోదా, సదాచార ప్రవర్తన మరియు నైతిక విలువలతో కూడిన శాశ్వత విజయాన్ని ప్రసాదిస్తుంది.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన వృత్తి జీవితంలో ఈ రాజయోగం ఒక మార్గదర్శిగా నిలుస్తోంది. కార్యాలయంలో ఎదురయ్యే సంక్లిష్టమైన బాధ్యతలను సమర్థవంతంగా నిర్వహించడానికి, ఉన్నతాధికారుల మరియు సహోద్యోగుల మన్ననలను పొందడానికి మరియు సకాలంలో పదోన్నతులు సాధించడానికి ఇది ఎంతగానో తోడ్పడుతోంది. మీ నిజాయితీతో కూడిన కృషి మీ వృత్తి రంగంలో మిమ్మల్ని నమ్మదగిన మరియు ప్రభావవంతమైన నాయకుడిగా తీర్చిదిద్దుతోంది.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் பாக்கிய ஸ்தானமான 9 ஆம் அதிபதியும், கர்ம ஸ்தானமான 10 ஆம் அதிபதியும் இணைந்து அல்லது சுப பார்வையில் அமைந்திருப்பதால் மிகச் சிறந்த தர்ம-கர்மாதிபதி ராஜயோகம் உண்டாகியுள்ளது. 9 ஆம் வீடு தர்மம், தெய்வ அருள் மற்றும் பாக்கியத்தைக் குறிக்கிறது; 10 ஆம் வீடு தொழில், அதிகாரம் மற்றும் சமூக அந்தஸ்தைக் குறிக்கிறது. இவ்விரு அதிபதிகளின் மங்களகரமான சேர்க்கை ஜாதகருக்கு நேர்மையான தலைமைப் பண்பு, கௌரவமான பதவி மற்றும் நீடித்த புகழை வழங்குகிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட தொழில் வாழ்க்கையிலும் முடிவுகளிலும் இந்த யோகம் சிறந்த வழிகாட்டியாகச் செயல்பட்டு வருகிறது. பணிச்சுமைகளை எளிதாகக் கையாளவும், உயர் அதிகாரிகளின் நன்மதிப்பைப் பெறவும், உழைப்பிற்கு ஏற்ற அங்கீகாரம் மற்றும் பதவி உயர்வை அடையவும் இது உறுதுணையாக உள்ளது. உங்கள் தர்மவழியான உழைப்பு தொழில் துறையில் உங்களை ஒரு நம்பகமான மற்றும் மதிப்புமிக்க ஆளுமையாக உருவாக்குகிறது.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The divine relationship connecting the 9th lord of fortune (Dharma) with the 10th lord of profession (Karma) establishes the premier Dharma-Karma Adhipati Raja Yoga in your horoscope. The 9th house embodies divine grace and righteous purpose, while the 10th house governs vocational authority and worldly impact. Their sacred union ensures that your career ambitions remain anchored in profound ethics, elevating your societal stature.`;
    const p2 = `In your living reality right now, this Raja Yoga actively channels divine momentum into your daily career duties. It helps you navigate professional turning points with clarity, aligns your daily efforts with long-term recognition, and earns the respect of superiors and colleagues. Your dedication to duty transforms everyday labor into honorable, lasting achievements.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 5. BUDHADITYA YOGA
  if (
    lowerName.includes("budhaditya") ||
    lowerName.includes("ಬುಧಾದಿತ್ಯ") ||
    lowerName.includes("बुधादित्य") ||
    lowerName.includes("బుధాదిత్య") ||
    lowerName.includes("புதாதித்ய")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ಸೂರ್ಯ ಹಾಗೂ ಬುಧ ಗ್ರಹಗಳ ಪವಿತ್ರ ಸಂಯೋಗದಿಂದ ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾದ ಬುಧಾದಿತ್ಯ ಯೋಗವು ಉಂಟಾಗಿದೆ. ಸೂರ್ಯನು ಆತ್ಮಬಲ ಮತ್ತು ತೇಜಸ್ಸನ್ನು ನೀಡಿದರೆ, ಬುಧನು ಬುದ್ಧಿಶಕ್ತಿ, ತಾರ್ಕಿಕ ಜ್ಞಾನ, ಗಣಿತ ಮತ್ತು ಸಂವಹನ ಕಲೆಗೆ ಅಧಿಪತಿಯಾಗಿದ್ದಾನೆ. ಇವರಿಬ್ಬರ ಸಮ್ಮಿಲನವು ವ್ಯಕ್ತಿಗೆ ಶ್ರೇಷ್ಠ ಕಲಿಕಾ ಸಾಮರ್ಥ್ಯ, ಕರಾರುವಾಕ್ಕಾದ ನಿರ್ಧಾರ ಶಕ್ತಿ ಹಾಗೂ ಸಾರ್ವಜನಿಕವಾಗಿ ಗೌರವಿಸಲ್ಪಡುವ ಬೌದ್ಧಿಕ ಪ್ರೌಢಿಮೆಯನ್ನು ದಯಪಾಲಿಸುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಬುಧಾದಿತ್ಯ ಯೋಗವು ನಿಮ್ಮ ಬೌದ್ಧಿಕ ಚಟುವಟಿಕೆಗಳು ಹಾಗೂ ದೈನಂದಿನ ಸಂವಹನದಲ್ಲಿ ಅದ್ಭುತ ಸ್ಪಷ್ಟತೆಯನ್ನು ತರುತ್ತಿದೆ. ಕಠಿಣ ಸಮಸ್ಯೆಗಳನ್ನು ಸುಲಭವಾಗಿ ವಿಶ್ಲೇಷಿಸಲು, ಆರ್ಥಿಕ ಹಾಗೂ ತಾಂತ್ರಿಕ ವಿಷಯಗಳಲ್ಲಿ ಜಾಣ್ಮೆಯ ಹೆಜ್ಜೆಗಳನ್ನಿಡಲು ಮತ್ತು ಸಮಾಲೋಚನೆಗಳಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಭಾವವನ್ನು ಉಳಿಸಿಕೊಳ್ಳಲು ಈ ಯೋಗವು ನೆರವಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ಚುರುಕಾದ ಆಲೋಚನೆಗಳು ನಿಮ್ಮ ವೃತ್ತಿ ಮತ್ತು ವ್ಯಾಪಾರದಲ್ಲಿ ಹೊಸ ಯಶಸ್ಸಿನ ಬಾಗಿಲುಗಳನ್ನು ತೆರೆಯುತ್ತಿವೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में सूर्य एवं बुध ग्रह की शुभ युति से प्रखर बुधादित्य योग का निर्माण हुआ है। सूर्य आत्मा, तेज और आत्मविश्वास के कारक हैं, जबकि बुध बुद्धि, तर्कशक्ति, संचार और वाणिज्य के स्वामी हैं। इन दोनों ग्रहों का मिलन जातक को तीव्र मेधा शक्ति, रणनीतिक दृष्टिकोण, स्पष्ट वाक्पटुता और कठिन विषयों को सहजता से समझने की असाधारण क्षमता प्रदान करता है।`;
      const p2 = `वर्तमान समय में यह बुधादित्य योग आपकी बौद्धिक कार्यप्रणाली और दैनिक निर्णयों में विशेष रूप से सहायक सिद्ध हो रहा है। यह आपको कार्यक्षेत्र में विश्लेषणात्मक कार्यों को कुशलता से पूर्ण करने, वित्तीय बातचीत में अपना प्रभाव बनाए रखने तथा जटिल मामलों में त्वरित समाधान खोजने की क्षमता दे रहा है। आपकी स्पष्ट दृष्टि आपके करियर को नवीन दिशा और सम्मान प्रदान कर रही है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో ఆత్మకారకుడైన సూర్యుడు మరియు బుద్ధి కారకుడైన బుధుడు కలసి స్థితి చెందడం వల్ల అత్యంత ప్రశస్తమైన బుధాదిత్య యోగం సిద్ధించింది. సూర్యుడు ఆత్మబలం, తేజస్సు మరియు పరిపాలనా దక్షతను ప్రసాదించగా, బుధుడు విశ్లేషణాత్మక బుద్ధి, గణితం, తార్కిక ఆలోచన మరియు సంభాషణ చాతుర్యానికి అధిపతి. ఈ ఉభయ గ్రహాల కలయిక జాతకుడికి అపారమైన మేధాశక్తిని, నిర్ణయాధికారాన్ని మరియు సమాజంలో మేధావిగా పేరు ప్రఖ్యాతులను చేకూరుస్తుంది.`;
      const p2 = `ప్రస్తుత మీ జీవన దశలో ఈ బుధాదిత్య యోగం మీ మేధో కార్యకలాపాలలో మరియు నిత్య సంభాషణలలో విశేష స్పష్టతను నింపుతోంది. సంక్లిష్టమైన సమస్యలను త్వరితగతిన విశ్లేషించడానికి, ఆర్థిక మరియు వాణిజ్య వ్యవహారాలలో సరైన ప్రణాళికతో ముందడుగు వేయడానికి మరియు చర్చలలో మీ ప్రభావాన్ని చూపించడానికి ఇది సహాయపడుతోంది. మీ చురుకైన ఆలోచనలు వృత్తి మరియు వ్యాపారాలలో నూతన విజయాలకు ద్వారాలు తెరుస్తున్నాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் சூரிய பகவானும் புதன் பகவானும் இணைந்து சஞ்சரிப்பதால் மிகச் சிறந்த புதாதித்ய யோகம் உருவாகியுள்ளது. சூரியன் ஆன்ம பலம், தலைமை மற்றும் தன்னம்பிக்கையைக் குறிக்கிறார்; புதன் அறிவுத்திறன், தர்க்க சிந்தனை, கணிதம் மற்றும் சாதுரியமான பேச்சுத்திறனுக்கு அதிபதி ஆவார். இந்த இரு கிரகங்களின் பாக்கிய சேர்க்கை ஜாதகருக்குக் கூரிய மதிநுட்பம், ஆழமான கற்றல் திறன் மற்றும் சபைகளில் போற்றப்படும் அறிவாற்றலை வழங்குகிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட சிந்தனைகளிலும் தகவல் தொடர்புகளிலும் இந்த புதாதித்ய யோகம் வியக்கத்தக்க தெளிவைத் தருகிறது. கடினமான சவால்களை எளிதில் பகுத்தாய்ந்து தீர்வு காணவும், வணிகம் மற்றும் நிதி விவகாரங்களில் சாதுரியமான முடிவுகளை எடுக்கவும், பேச்சுவார்த்தைகளில் உங்கள் செல்வாக்கை நிலைநாட்டவும் இது உதவுகிறது. உங்கள் அறிவுக்கூர்மையான அணுகுமுறை தொழில் வாழ்க்கையில் புதிய வாய்ப்புகளையும் கௌரவத்தையும் ஈட்டித் தருகிறது.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The conjunction of the illuminating Sun and intellectual Mercury forms the sharp Budhaditya Yoga in your birth chart. While the Sun bestows vital authority, willpower, and executive clarity, Mercury governs logical deduction, analytical prowess, and communication mastery. Their conjunction awakens profound mental focus, administrative acumen, and the capacity to articulate complex strategies with commanding precision.`;
    const p2 = `In your current life phase, this Budhaditya Yoga is actively refining your daily problem-solving and communicative endeavors. It sharpens your cognitive discernment during negotiations, aids commercial and financial planning, and prevents mental fog under deadlines. Your articulate approach secures respect among colleagues and unlocks progressive vocational opportunities.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 6. GENERIC / UNIVERSAL YOGA FALLBACK (Strictly 2 paragraphs, 4-5 lines each)
  if (baseLang === "kn") {
    const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ (${lagnaStr}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿ (${moonStr}) ಆಧಾರದ ಮೇಲೆ ರಚಿತವಾಗಿರುವ ಈ ಶುಭ ಯೋಗವು ಜಾತಕದ ಪ್ರಮುಖ ಕೇಂದ್ರ ಮತ್ತು ತ್ರಿಕೋಣ ಸ್ಥಾನಗಳ ಬಲದಿಂದ ಪೋಷಿಸಲ್ಪಟ್ಟಿದೆ. ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳಂತೆ ಈ ಗ್ರಹ ಸಂಯೋಜನೆಯು ಜಾತಕನ ಆಂತರಿಕ ಶಕ್ತಿ, ಸದ್ಗುಣಗಳು ಹಾಗೂ ನೈತಿಕ ನಿಷ್ಠೆಯನ್ನು ಜಾಗೃತಗೊಳಿಸುತ್ತದೆ. ಇದು ಜೀವನದ ಮುಖ್ಯ ಹಂತಗಳಲ್ಲಿ ಕಷ್ಟಗಳನ್ನು ಹಿಮ್ಮೆಟ್ಟಿಸುವ ದೈವಿಕ ಶಕ್ತಿಯಾಗಿದ್ದು, ಸತತ ಪರಿಶ್ರಮಕ್ಕೆ ಯೋಗ್ಯ ಫಲ ದೊರೆಯುವಂತೆ ಮಾಡುವ ಮಂಗಳಕರ ಶಕ್ತಿಯನ್ನು ಹೊಂದಿದೆ.`;
    const p2 = `ಪ್ರಸ್ತುತ ${dashaName} ದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿಯ ಈ ಮಹತ್ವದ ಕಾಲಘಟ್ಟದಲ್ಲಿ, ಈ ಯೋಗವು ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದ ಪ್ರಮುಖ ತೀರ್ಮಾನಗಳಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಪ್ರಭಾವ ಬೀರುತ್ತಿದೆ. ಕೆಲಸದ ಸ್ಥಳದಲ್ಲಿ ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಮನ್ನಣೆ ತಂದುಕೊಡಲು, ಕೌಟುಂಬಿಕ ವಾತಾವರಣದಲ್ಲಿ ನೆಮ್ಮದಿಯನ್ನು ಕಾಪಾಡಲು ಮತ್ತು ಆರ್ಥಿಕ ಏರಿಳಿತಗಳನ್ನು ಸಮರ್ಥವಾಗಿ ನಿಭಾಯಿಸಲು ಈ ಯೋಗವು ಶ್ರೀರಕ್ಷೆಯಾಗಿದೆ. ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಧರ್ಮಶ್ರದ್ಧೆಯು ಪ್ರಸ್ತುತ ಕಾಲದಲ್ಲಿ ಯಶಸ್ಸಿನ ಹಾದಿಯನ್ನು ಸುಗಮಗೊಳಿಸುತ್ತಿದೆ.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "hi") {
    const p1 = `आपकी जन्म लग्न (${lagnaStr}) एवं चंद्र राशि (${moonStr}) के आधार पर निर्मित यह शुभ ग्रह योग कुंडली के प्रमुख केंद्र एवं त्रिकोण भावों के दिव्य प्रभाव से पुष्ट है। वैदिक फलित सूत्रों के अनुसार यह ग्रह विन्यास जातक में आत्मिक शक्ति, कर्तव्यनिष्ठा और सद्गुणों का विकास करता है। यह जीवन के महत्वपूर्ण मोड़ों पर आने वाली बाधाओं को दूर करने तथा कठिन परिश्रम को वास्तविक सफलता में बदलने की क्षमता प्रदान करता है।`;
    const p2 = `वर्तमान में चल रही ${dashaName} महादशा एवं ${bhuktiName} भुक्ति के इस दौर में यह योग आपके दैनिक जीवन और कार्यक्षेत्र में सकारात्मक प्रभाव उत्पन्न कर रहा है। यह आपके आत्मविश्वास को बनाए रखने, व्यावसायिक क्षेत्र में मान-सम्मान की वृद्धि करने तथा पारिवारिक सामंजस्य को सुदृढ़ करने में सहायक सिद्ध हो रहा है। आपकी धैर्यपूर्ण कार्यशैली और नीतिवान आचरण से आने वाले दिनों में शुभ फलों की निरंतर प्राप्ति होगी।`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "te") {
    const p1 = `మీ జన్మ లగ్నం (${lagnaStr}) మరియు చంద్ర రాశి (${moonStr}) ఆధారంగా ఏర్పడిన ఈ శుభ గ్రహ యోగం కుండలిలోని కేంద్ర మరియు త్రికోణ స్థానాల బలాన్ని ప్రతిబింబిస్తోంది. శాస్త్ర నియమాల ప్రకారం ఈ యోగం జాతకుడిలో ఆత్మబలం, సత్ప్రవర్తన మరియు లక్ష్యసాధన పట్ల అంకితభావాన్ని పెంపొందిస్తుంది. జీవితంలో ఎదురయ్యే అవరోధాలను అధిగమించి నిజాయితీతో కూడిన కష్టానికి తగిన ప్రతిఫలాన్ని సాధించడంలో ఇది ఎంతగానో తోడ్పడుతుంది.`;
    const p2 = `ప్రస్తుతం నడుస్తున్న ${dashaName} దశ మరియు ${bhuktiName} భుక్తి కాలంలో ఈ గ్రహ యోగం మీ దైనందిన నిర్ణయాలపై శుభ ప్రభావాన్ని చూపుతోంది. ఉద్యోగ రంగంలో మీ శ్రమకు గుర్తింపు లభించడానికి, కుటుంబంలో శాంతిని నెలకొల్పడానికి మరియు ఆర్థిక ఒడుదొడుకులను సమతుల్యం చేసుకోవడానికి ఇది రక్షణగా నిలుస్తోంది. మీ ధైర్యం మరియు ధర్మనిష్ఠ ప్రస్తుత కాలంలో విజయపథాన్ని సుగమం చేస్తున్నాయి.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "ta") {
    const p1 = `உங்கள் லக்னம் (${lagnaStr}) மற்றும் சந்திர ராசி (${moonStr}) அடிப்படையில் அமைந்துள்ள இந்த சுப யோகம் ஜாதகத்தின் கேந்திர, திரிகோண ஸ்தானங்களின் ஆசியுடன் பலமடைந்துள்ளது. சாஸ்திர விதிகளின்படி இந்த கிரக அமைப்பு ஜாதகருக்கு மனோபலம், நற்பண்புகள் மற்றும் கடமை உணர்வை வளர்க்கிறது. வாழ்வின் முக்கிய கட்டங்களில் ஏற்படும் தடைகளை உடைத்து, நேர்மையான உழைப்பிற்கு ஏற்ற நற்பலன்களைப் பெற்றுத் தரும் சக்தியைக் கொண்டுள்ளது.`;
    const p2 = `தற்பொழுது நடைபெறும் ${dashaName} திசை மற்றும் ${bhuktiName} புக்தி காலத்தில் இந்த யோகம் உங்களின் அன்றாட நடவடிக்கைகளில் சாதகமான தாக்கத்தை ஏற்படுத்துகிறது. பணிச்சூழலில் உங்கள் உழைப்பிற்கு உரிய மதிப்பைப் பெற்றுத் தரவும், குடும்பத்தில் அமைதியை நிலைநாட்டவும், நிதி விவகாரங்களைச் சமநிலையில் கையாளவும் இது பாதுகாப்பாக உள்ளது. உங்களின் தன்னம்பிக்கை தற்போதைய காலகட்டத்தில் வெற்றியை உறுதி செய்கிறது.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  const p1 = `Grounded in the foundational symmetry of your Ascendant (${lagnaStr}) and natal Moon (${moonStr}), this auspicious planetary yoga draws vitality from pivotal Kendra and Trikona houses. Classical Parashara tenets dictate that such harmonious configurations cultivate deep character resilience, ethical fortitude, and enduring resourcefulness, transforming latent talents into realized worldly accomplishments.`;
  const p2 = `Operating under your current ${dashaName} Mahadasha and ${bhuktiName} Bhukti timeline, this yoga actively harmonizes your everyday decisions and professional challenges. It shields your mental composure during sudden obstacles, bolsters executive stamina, and safeguards family dignity while ensuring that sincere perseverance yields tangible financial and relational stability.`;
  return formatTwoParagraphs(p1, p2, cleanImpact);
}

/**
 * Enriches any Dosha description into exactly 2 full paragraphs (4-5 lines each).
 * Para 1: Explains what the Dosha is (affliction definition, planets/houses involved).
 * Para 2: Explains what this Dosha is currently doing in their life (real-world effects, remedies).
 */
export function enrichDoshaDescription(
  name: string,
  impact: string,
  lang: string,
  lagnaStr: string = "Lagna",
  moonStr: string = "Moon Sign",
  ageYears?: number,
  dashaName: string = "Dasha",
  bhuktiName: string = "Bhukti",
  maritalStatus: string = "general"
): string {
  const cleanImpact = (impact || "").trim();
  const baseLang = (lang || "en").split("-")[0];
  const lowerName = (name || "").toLowerCase();
  const isMarried = maritalStatus === "married";
  const hasMarriageDelayLeak = /delay.*marriage|വിവാഹ|ವಿವಾಹ.*ವಿಳಂಬ|विवाह.*विलंब|వివాహ.*ఆలస్యం|திருமண.*தாமதம்/i.test(cleanImpact);

  // If text already has 2 generous paragraphs with at least 180 chars each, preserve it ONLY IF it doesn't violate maritalStatus
  if (hasTwoSubstantialParagraphs(cleanImpact, 180) && !(isMarried && hasMarriageDelayLeak)) {
    return baseLang === "en" ? cleanImpact : cleanEnglishFromRegionalText(cleanImpact, baseLang);
  }

  // 1. KUJA DOSHA / MANGLIK DOSHA
  if (
    lowerName.includes("kuja") ||
    lowerName.includes("manglik") ||
    lowerName.includes("mangal") ||
    lowerName.includes("ಕುಜ") ||
    lowerName.includes("ಮಾಂಗಲಿಕ") ||
    lowerName.includes("कुज") ||
    lowerName.includes("मांगलिक") ||
    lowerName.includes("కుజ") ||
    lowerName.includes("మాంగ్లిక్") ||
    lowerName.includes("செவ்வாய்")
  ) {
    if (isMarried) {
      if (baseLang === "kn") {
        const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಅಂಗಾರಕನಾದ ಕುಜ ಗ್ರಹವು ${lagnaStr ? lagnaStr + " ಆಧಾರಿತ " : ""}ಪ್ರಮುಖ ಕೇಂದ್ರ ಅಥವಾ ತ್ರಿಕ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ಕುಜ (ಮಾಂಗಲಿಕ) ಪ್ರಭಾವವು ಗೋಚರಿಸುತ್ತದೆ. ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಕುಜನು ಅಗ್ನಿತತ್ತ್ವ, ಶೌರ್ಯ, ತೀಕ್ಷ್ಣತೆ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದ ಕಾರಕನಾಗಿದ್ದಾನೆ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಈ ಗ್ರಹದ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವು ವ್ಯಕ್ತಿಯಲ್ಲಿ ಅದಮ್ಯ ಕಾರ್ಯೋತ್ಸಾಹ ಹಾಗೂ ಕುಟುಂಬ ರಕ್ಷಣೆಯ ಛಲವನ್ನು ತುಂಬಿದರೂ, ದೈನಂದಿನ ಮಾತುಕತೆಗಳಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅನಗತ್ಯ ಆತುರ ಮತ್ತು ಸಣ್ಣಪುಟ್ಟ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳಿಗೆ ಕಾರಣವಾಗಬಹುದು.`;
        const p2 = `ಪ್ರಸ್ತುತ ದಾಂಪತ್ಯ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ಕುಜ ಶಕ್ತಿಯನ್ನು ಶಾಂತಿಯುತವಾಗಿ ಸಮನ್ವಯಗೊಳಿಸುವುದು ಅತ್ಯಂತ ಮುಖ್ಯವಾಗಿದೆ. ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾದ ಆವೇಶಕ್ಕೊಳಗಾಗದೆ, ಸಂಗಾತಿಯ ಅಭಿಪ್ರಾಯಗಳಿಗೆ ಪರಸ್ಪರ ಗೌರವ ನೀಡುವುದು ಮತ್ತು ಶಾಂತಚಿತ್ತದಿಂದ ಸಂಭಾಷಣೆ ನಡೆಸುವುದು ವೈವಾಹಿಕ ಸೌಖ್ಯವನ್ನು ರಕ್ಷಿಸುತ್ತದೆ. ನಿತ್ಯ ಸಂಯಮವನ್ನು ಅಭ್ಯಾಸ ಮಾಡುವುದು, ತರಾತುರಿಯ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸುವುದು ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಅಥವಾ ಮಂಗಳ ಗೌರಿಯ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ಈ ತೀಕ್ಷ್ಣ ಶಕ್ತಿಯು ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯಾಗಿ ಬದಲಾಗಿ ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಶ್ವತ ನೆಮ್ಮದಿ ಮತ್ತು ಪರಸ್ಪರ ಅನ್ಯೋನ್ಯತೆಯನ್ನು ತರಲಿದೆ.`;
        return formatTwoParagraphs(p1, p2, cleanImpact);
      }
      if (baseLang === "hi") {
        const p1 = `आपकी जन्म कुंडली में अग्नितत्व के स्वामी मंगल ग्रह की विशेष भाव स्थिति के कारण कुज (मांगलिक) ऊर्जा का प्रभाव उपस्थित है। वैदिक ज्योतिष के अनुसार मंगल साहस, ऊर्जा, पराक्रम और रक्त के कारक हैं। वैवाहिक जीवन में मंगल का प्रभाव जातक में अत्यधिक निष्ठा और पारिवारिक दायित्व निभाने का दृढ़ संकल्प देता है, परंतु कभी-कभी स्वभाव में उग्रता, जल्दबाजी और दांपत्य चर्चाओं में वैचारिक मतभेद का कारण बन सकता है।`;
        const p2 = `वर्तमान दांपत्य जीवन में इस मंगल ऊर्जा को धैर्यपूर्वक संतुलित करना अत्यंत आवश्यक है। दैनिक दिनचर्या में जीवनसाथी के दृष्टिकोण का सम्मान करना, क्रोध के क्षणों में मौन रहना तथा शांत मन से संवाद करना दांपत्य में मधुरता बनाए रखेगा। नियमित रूप से हनुमान चालीसा का पाठ, धैर्यपूर्वक सुनने की आदत तथा मां मंगला गौरी की उपासना करने से यह ऊर्जा दांपत्य में सुदृढ़ विश्वास और सुरक्षात्मक प्रेम में परिवर्तित हो जाती है।`;
        return formatTwoParagraphs(p1, p2, cleanImpact);
      }
      if (baseLang === "te") {
        const p1 = `మీ జన్మ కుండలిలో అంగారకుడైన కుజ గ్రహం కీలకమైన కేంద్ర లేదా త్రిక భావాలలో స్థితి చెందడం వల్ల కుజ (మాంగ్లిక్) ప్రభావం ఏర్పడింది. జ్యోతిష శాస్త్ర ప్రకారం కుజుడు అగ్నితత్త్వం, శౌర్యం, పరాక్రమం మరియు రక్షణ భావనకు కారకుడు. దాంపత్య జీవితంలో ఈ గ్రహ ప్రభావం వ్యక్తిలో కుటుంబం పట్ల అంకితభావాన్ని నింపినప్పటికీ, వ్యక్తిగత సంభాషణలలో అప్పుడప్పుడు తొందరపాటు మరియు తీవ్రమైన అభిప్రాయాలకు దారితీయవచ్చు.`;
        const p2 = `ప్రస్తుత దాంపత్య జీవితంలో ఈ కుజ శక్తిని సంయమనంతో నడిపించడం చాలా ముఖ్యం. భాగస్వామి అభిప్రాయాలను గౌరవించడం, ఆవేశాన్ని నియంత్రించుకోవడంలో శ్రద్ధ పెట్టడం మరియు ప్రశాంతంగా మాట్లాడటం వల్ల దాంపత్య సౌఖ్యం నిరంతరం వర్ధిల్లుతుంది. ప్రతిరోజూ సుబ్రహ్మణ్య స్వామిని లేదా మంగళ గౌరీ దేవిని ఆరాధించడం వల్ల ఈ తీక్షణ శక్తి కుటుంబంలో శాంతి మరియు అనురాగాలుగా మారుతుంది.`;
        return formatTwoParagraphs(p1, p2, cleanImpact);
      }
      if (baseLang === "ta") {
        const p1 = `உங்கள் ஜாதகத்தில் அக்னித் தத்துவத்தின் நாயகனான செவ்வாய் பகவான் கேந்திரம் அல்லது திரிக ஸ்தானங்களில் சஞ்சரிப்பதால் செவ்வாய் (மங்களிக) தாக்கம் உண்டாகியுள்ளது. ஜோதிட விதிகளின்படி செவ்வாய் வீரம், ஆளுமை, வேகம் மற்றும் பாதுகாப்பின் காரகர் ஆவார். திருமண வாழ்வில் இந்த கிரக அமைப்பு குடும்பப் பொறுப்புகளில் அசைக்க முடியாத உறுதியை அளித்தாலும், கணவன்-மனைவி விவாதங்களில் சிறு கருத்து வேறுபாடுகளையும் அவசர முடிவுகளையும் ஏற்படுத்தக்கூடும்.`;
        const p2 = `தற்போதைய இல்லற வாழ்வில் இந்த செவ்வாயின் உக்கிரத்தை அன்புடன் நிதானப்படுத்துவது அவசியமாகும். துணையின் உணர்வுகளுக்கு மதிப்பு அளிப்பது, கோபத்தைத் தவிர்ப்பது மற்றும் அமைதியான உரையாடலைக் கடைப்பிடிப்பது குடும்பத்தில் மகிழ்ச்சியைப் பெருக்கும். தினசரி சுப்பிரமணியர் அல்லது மங்கள கௌரி வழிபாடு செய்வதன் மூலம் இந்த உக்கிர ஆற்றல் குடும்பத்தில் நீடித்த அமைதியையும் பரஸ்பர அன்பையும் வழங்கும்.`;
        return formatTwoParagraphs(p1, p2, cleanImpact);
      }
      const p1 = `The placement of fiery Mars (Kuja) across sensitive angular or dusthana houses creates the classical Kuja (Manglik) influence in your birth chart. Mars governs primal vitality, leadership drive, and dynamic impulse. In married life, this martial vigor bestows deep protective devotion towards family, yet calls for emotional moderation to prevent heated arguments, reactive speech, or unnecessary domestic friction.`;
      const p2 = `In your current married life, channeling this martial energy through calm dialogue, mutual respect for your spouse's choices, and patient compromise guarantees domestic serenity. Avoiding hasty reactions during stressful moments and practicing mindful listening transforms reactive heat into enduring devotion and protective companionship.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಅಂಗಾರಕನಾದ ಕುಜ ಗ್ರಹವು ಪ್ರಮುಖ ಕೇಂದ್ರ ಅಥವಾ ತ್ರಿಕ ಭಾವದಲ್ಲಿ ಸ್ಥಿತನಾಗಿರುವುದರಿಂದ ಕುಜ (ಮಾಂಗಲಿಕ) ಪ್ರಭಾವವು ಗೋಚರಿಸುತ್ತದೆ. ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಕುಜನು ಅಗ್ನಿತತ್ತ್ವ, ಶೌರ್ಯ, ತೀಕ್ಷ್ಣತೆ ಹಾಗೂ ರಕ್ತದೊತ್ತಡದ ಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಗ್ರಹದ ತೀಕ್ಷ್ಣ ಪ್ರಭಾವವು ವ್ಯಕ್ತಿಯಲ್ಲಿ ಅದಮ್ಯ ಕಾರ್ಯೋತ್ಸಾಹವನ್ನು ತುಂಬಿದರೂ, ಸಂಬಂಧಗಳು, ದಾಂಪತ್ಯ ವಿಚಾರಗಳು ಹಾಗೂ ಸಹವರ್ತಿಗಳೊಂದಿಗಿನ ಮಾತುಕತೆಯಲ್ಲಿ ಕೆಲವೊಮ್ಮೆ ಅನಗತ್ಯ ಆತುರ ಮತ್ತು ತೀಕ್ಷ್ಣ ನಿಲುವುಗಳಿಗೆ ಕಾರಣವಾಗಬಹುದು.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ಕುಜ ಪ್ರಭಾವವು ನಿಮ್ಮ ದೈನಂದಿನ ನಡವಳಿಕೆ ಹಾಗೂ ಮನಸ್ಥಿತಿಯಲ್ಲಿ ನೇರ ಪರಿಣಾಮ ಬೀರುತ್ತಿದೆ. ಸಣ್ಣಪುಟ್ಟ ವಿಷಯಗಳಿಗೂ ಅತಿಯಾದ ಆವೇಶಕ್ಕೊಳಗಾಗುವುದು, ಕಾರ್ಯ ವಿಳಂಬವಾದಾಗ ಅಸಹನೆ ಹೊಂದುವುದು ಅಥವಾ ಸಂಗಾತಿಯೊಂದಿಗೆ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳು ಮೂಡುವುದು ಇದರ ಮುಖ್ಯ ಲಕ್ಷಣವಾಗಿದೆ. ನಿತ್ಯ ಸಂಯಮವನ್ನು ಅಭ್ಯಾಸ ಮಾಡುವುದು, ತರಾತುರಿಯ ನಿರ್ಧಾರಗಳನ್ನು ತಪ್ಪಿಸುವುದು ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿಯ ಸ್ಮರಣೆ ಮಾಡುವುದರಿಂದ ಈ ತೀಕ್ಷ್ಣ ಶಕ್ತಿಯು ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿಯಾಗಿ ಬದಲಾಗಲಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में अग्नितत्व के स्वामी मंगल ग्रह की विशेष भाव स्थिति के कारण कुज (मांगलिक) प्रभाव का निर्माण होता है। वैदिक ज्योतिष के अनुसार मंगल साहस, ऊर्जा, पराक्रम और रक्त के कारक हैं। जब मंगल का प्रभाव वैवाहिक अथवा संवेदनशील भावों पर पड़ता है, तो यह जातक में अत्यधिक महत्वाकांक्षा उत्पन्न करने के साथ-साथ स्वभाव में उग्रता, जल्दबाजी और साझेदारी के मामलों में वैचारिक मतभेद का कारण बन सकता है।`;
      const p2 = `वर्तमान समय में आपकी जीवनशैली और व्यक्तिगत संबंधों में यह मंगल ऊर्जा सक्रिय रूप से परिलक्षित हो रही है। दैनिक दिनचर्या में कार्यों के धीमे चलने पर अचानक अधीरता अनुभव होना, क्रोध पर नियंत्रण में कठिनाई तथा परिजनों के साथ बातचीत में तल्खी आना इसके सामान्य प्रभाव हैं। नियमित रूप से हनुमान चालीसा का पाठ, धैर्यपूर्वक सुनने की आदत तथा शांत मन से संवाद करने से यह ऊर्जा रचनात्मक पराक्रम में परिवर्तित हो जाती है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో అంగారకుడైన కుజ గ్రహం కీలకమైన కేంద్ర లేదా త్రిక భావాలలో స్థితి చెందడం వల్ల కుజ (మాంగ్లిక్) ప్రభావం ఏర్పడింది. జ్యోతిష శాస్త్ర ప్రకారం కుజుడు అగ్నితత్త్వం, శౌర్యం, పరాక్రమం మరియు రక్తానికి కారకుడు. ఈ గ్రహ ప్రభావం వ్యక్తిలో అపారమైన కార్యాచరణ మరియు ఉత్సాహాన్ని నింపినప్పటికీ, వ్యక్తిగత సంబంధాలు, దాంపత్య వ్యవహారాలు మరియు భాగస్వామ్యాలలో అప్పుడప్పుడు తొందరపాటు మరియు తీవ్రమైన ఆలోచనలకు దారితీయవచ్చు.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవితంలో ఈ కుజ శక్తి ప్రవర్తనలో మరియు ఆలోచనలలో ప్రత్యక్ష ప్రభావాన్ని చూపుతోంది. పనులలో చిన్నపాటి ఆలస్యం జరిగినా అసహనం కలగడం, కోపాన్ని నియంత్రించుకోవడంలో ఇబ్బంది లేదా ఆత్మీయులతో మాట్లాడేటప్పుడు కఠినత్వం రావడం దీని సహజ లక్షణాలు. ప్రతిరోజూ సుబ్రహ్మణ్య స్వామిని ఆరాధించడం, ధ్యానం చేయడం మరియు ఓర్పుతో కూడిన సంభాషణను అలవర్చుకోవడం వల్ల ఈ తీక్షణ శక్తి నిర్మాణాత్మక విజయాలుగా మారుతుంది.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் அக்னித் தத்துவத்தின் நாயகனான செவ்வாய் பகவான் கேந்திரம் அல்லது திரிக ஸ்தானங்களில் சஞ்சரிப்பதால் செவ்வாய் (மங்களிக) தாக்கம் உண்டாகியுள்ளது. ஜோதிட விதிகளின்படி செவ்வாய் வீரம், ஆளுமை, வேகம் மற்றும் ஆற்றலின் காரகர் ஆவார். இந்த கிரக அமைப்பு ஜாதகருக்குத் தளராத தைரியத்தையும் வேகத்தையும் அளித்தாலும், குடும்ப உறவுகள், திருமண வாழ்க்கை மற்றும் கூட்டுத் தொழில்களில் சிறு விவாதங்களையும் அவசர முடிவுகளையும் ஏற்படுத்தக்கூடும்.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட நடவடிக்கைகளிலும் மனநிலையிலும் இந்த செவ்வாயின் உக்கிரம் நேரடித் தாக்கத்தை ஏற்படுத்துகிறது. காரியங்களில் தாமதம் ஏற்படும்போது பொறுமையின்மை அடைவது, உணர்ச்சிவசப்பட்டு பேசுவது அல்லது நெருக்கமானவர்களிடம் கருத்து வேறுபாடுகள் தோன்றுவது இதன் அறிகுறிகளாகும். தினசரி சுப்பிரமணியர் வழிபாடு, தியானம் மற்றும் நிதானமான அணுகுமுறையைக் கடைப்பிடிப்பதன் மூலம் இந்த உக்கிர ஆற்றல் மகத்தான வெற்றிகளாக உருவெடுக்கும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The placement of fiery Mars (Kuja) across sensitive angular or dusthana houses creates the classical Kuja (Manglik) influence in your birth chart. Mars governs primal vitality, aggressive drive, and executive impulse. In astrological doctrine, this concentrated martial heat endows the native with immense courage and dynamic willpower, yet demands conscious moderation to prevent interpersonal friction, impulsive speech, or domestic strain.`;
    const p2 = `In your living reality right now, this martial energy manifests as occasional surges of restlessness, frustration with procedural delays, or sharp interactions with intimate partners and associates. Left unchannelled, it generates friction in collaborative endeavors. Channelling this energy through daily physical discipline, patient listening, and devotional remedies transforms reactive heat into focused, constructive leadership.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 2. KALA SARPA DOSHA / RAHU-KETU AFFLICTION
  if (
    lowerName.includes("kala sarpa") ||
    lowerName.includes("kalasarpa") ||
    lowerName.includes("sarpa") ||
    lowerName.includes("ಕಾಳ ಸರ್ಪ") ||
    lowerName.includes("ಸರ್ಪ") ||
    lowerName.includes("काल सर्प") ||
    lowerName.includes("కాల సర్ప") ||
    lowerName.includes("கால சர்ப்ப")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಕಲ ಗ್ರಹಗಳು ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು ಮತ್ತು ಕೇತುಗಳ ಅಕ್ಷದ ಮಧ್ಯದಲ್ಲಿ ಬಂಧಿತವಾಗಿರುವುದರಿಂದ ಕಾಳಸರ್ಪ ಅಥವಾ ತೀವ್ರ ಛಾಯಾಗ್ರಹ ದೋಷವು ಸೃಷ್ಟಿಯಾಗಿದೆ. ರಾಹುವು ಲೌಕಿಕ ಆಸೆ, ಭ್ರಮೆ ಮತ್ತು ಅನ್ವೇಷಣೆಯನ್ನು ಸೂಚಿಸಿದರೆ, ಕೇತುವು ಮೋಕ್ಷ, ವೈರಾಗ್ಯ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಅನ್ವೇಷಣೆಯನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತಾನೆ. ಈ ಸಂಯೋಜನೆಯು ಜೀವನದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತಿರುವುಗಳು, ಅಡೆತಡೆಗಳ ನಂತರದ ಜಯ ಹಾಗೂ ಗಹನವಾದ ಕರ್ಮಿಕ ಪರೀಕ್ಷೆಗಳನ್ನು ತರುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲವು ತಕ್ಷಣ ಸಿಗದೆ ಕೊನೆ ಕ್ಷಣದಲ್ಲಿ ವಿಳಂಬವಾಗುವ ಭಾವನೆ ಮೂಡಬಹುದು. ಕಠಿಣ ಪರಿಶ್ರಮ ಪಟ್ಟರೂ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ದೀರ್ಘಕಾಲ ಕಾಯಬೇಕಾದ ಪರಿಸ್ಥಿತಿ ಅಥವಾ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅಜ್ಞಾತ ಆತಂಕಗಳು ಕಾಡಬಹುದು. ಶ್ರೀ ಮಹಾದೇವನಿಗೆ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು, ಸತ್ಯನಿಷ್ಠೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸುವುದು ಹಾಗೂ ಯಾವುದೇ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗೆ ಮರುಳಾಗದಿರುವುದು ಈ ದೋಷದ ನಕಾರಾತ್ಮಕತೆಯನ್ನು ಸಂಪೂರ್ಣ ನಾಶಪಡಿಸುತ್ತದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में अधिकांश ग्रहों का छायाग्रह राहु और केतु की धुरी के एक ओर स्थित होना कालसर्प योग का निर्माण करता है। राहु भौतिक इच्छाओं, भ्रम और अप्रत्याशित परिवर्तनों के कारक हैं, जबकि केतु वैराग्य, मोक्ष और आध्यात्मिक गहराई का प्रतिनिधित्व करते हैं। यह खगोलीय संयोजन जीवन में अचानक उतार-चढ़ाव, कड़ी मेहनत के बाद विलंब से सफलता तथा गहरे कर्मिक पाठों का अनुभव कराता है।`;
      const p2 = `वर्तमान समय में आपके दैनिक जीवन में यह प्रभाव अनपेक्षित देरी, बनते कार्यों में अंतिम क्षणों में व्यवधान तथा आंतरिक असुरक्षा के रूप में सामने आ सकता है। कभी-कभी अत्यधिक प्रयास के उपरांत भी यथोचित प्रतिफल न मिलने से मानसिक खिन्नता हो सकती है। भगवान शिव की नियमित उपासना, महामृत्युंजय मंत्र का जप तथा धैर्यपूर्ण आचरण से यह दोष निष्प्रभावी होकर जातक को असाधारण आध्यात्मिक एवं सांसारिक उत्थान प्रदान करता है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో సమస్త గ్రహాలు ఛాయాగ్రహాలైన రాహువు మరియు కేతువుల అక్షం మధ్యలో బంధీగా ఉండటం వల్ల కాలసర్ప ప్రభావం ఏర్పడింది. రాహువు లౌకిక వాంఛలు, భ్రమలు మరియు నూతన అన్వేషణలను సూచించగా, కేతువు మోక్షం, వైరాగ్యం మరియు అంతర్దృష్టిని సూచిస్తాడు. ఈ ఖగోళ కలయిక జీవితంలో ఆకస్మిక మలుపులు, తీవ్రమైన శ్రమ అనంతరం లభించే విజయాలు మరియు లోతైన కర్మిక పరీక్షలను అనుభవింపజేస్తుంది.`;
      const p2 = `ప్రస్తుతం మీ నిత్య జీవితంలో ఈ ప్రభావం వలన శ్రమకు తగిన ఫలితం వెంటనే లభించక చివరి క్షణంలో ఆలస్యమయ్యే భావన కలగవచ్చు. ఎంతో కృషి చేసినప్పటికీ లక్ష్యసాధనకు ఎదురుచూడాల్సి రావడం లేదా భవిష్యత్తు గురించి అకారణ ఆందోళనలు రావడం దీని ప్రభావం. ప్రతిరోజూ శివారాధన చేయడం, మహా మృత్యుంజయ మంత్రం జపించడం మరియు ధర్మమార్గంలో స్థిరంగా ముందడుగు వేయడం వల్ల ఈ సవాళ్లు తొలగి అపారమైన ఆత్మవికాసం లభిస్తుంది.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் அனைத்து கிரகங்களும் நிழல் கிரகங்களான ராகு மற்றும் கேதுவின் பிடிக்குள் அமைந்திருப்பதால் காலசர்ப்ப யோகம்/தோஷம் உருவாகியுள்ளது. ராகு உலகியல் ஆசைகள், தீவிர இலக்குகள் மற்றும் புதிய பரிமாணங்களைக் குறிக்கிறார்; கேது ஆன்மீக விடுதலை, பற்றற்ற நிலை மற்றும் உள்நோக்கிய பயணத்தைக் குறிக்கிறார். இந்த கிரக அமைப்பு வாழ்வில் எதிர்பாராத திருப்பங்கள், கடும் உழைப்பிற்குப் பின் கிட்டும் வெற்றிகள் மற்றும் ஆன்ம பக்குவத்தை அளிக்கிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையில் இந்த தாக்கத்தால் முயற்சிகள் இறுதி நேரத்தில் சற்று தாமதமாவது போன்ற உணர்வு ஏற்படலாம். கடினமாக உழைத்தாலும் பலனை அடைய காத்திருக்க வேண்டிய சூழல் அல்லது எதிர்காலம் குறித்த வீண் கவலைகள் எழக்கூடும். சிவபெருமானுக்கு ருத்ராபிஷேகம் செய்வதும், மகா மிருத்யுஞ்சய மந்திரம் ஜெபிப்பதும், குறுக்குவழிகளைத் தவிர்த்து நேர்மையுடன் வாழ்வதும் இந்த தடைகளை நீக்கி அளப்பரிய ஆன்மீக மற்றும் லௌகீக உயர்வை வழங்கும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The containment of planets within the serpentine nodal axis of Rahu and Ketu forms the profound Kala Sarpa karmic configuration in your horoscope. Rahu personifies insatiable worldly desire and uncharted frontiers, while Ketu embodies spiritual detachment and ancestral reckoning. This celestial tension subjects the native to non-linear life cycles, sudden paradigm shifts, and rigorous karmic endurance tests.`;
    const p2 = `In your present day-to-day reality, this nodal pressure manifests as unexpected delays at the threshold of completion, requiring multiple attempts before efforts bear fruit. It can induce ungrounded anxiety or a feeling of carrying solitary burdens. By cultivating unwavering ethical discipline, avoiding speculative shortcuts, and embracing meditative grounding, you convert these karmic tests into profound spiritual mastery.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 3. GURU CHANDALA DOSHA
  if (
    lowerName.includes("chandala") ||
    lowerName.includes("ಚಂಡಾಲ") ||
    lowerName.includes("चांडाल") ||
    lowerName.includes("చండాల") ||
    lowerName.includes("சண்டாள")
  ) {
    if (baseLang === "kn") {
      const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದಲ್ಲಿ ಧರ್ಮಕಾರಕ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಭ್ರಮಾಕಾರಕ ರಾಹುವಿನ ಸಂಯೋಗದಿಂದ ಗುರು ಚಂಡಾಲ ದೋಷವು ಸೃಷ್ಟಿಯಾಗಿದೆ. ಗುರುವು ಶುದ್ಧ ನೈತಿಕತೆ, ಪರಂಪರೆ ಮತ್ತು ಜ್ಞಾನದ ಸಂಕೇತವಾಗಿದ್ದರೆ, ರಾಹುವು ಸನಾತನ ಸಂಪ್ರದಾಯಗಳನ್ನು ಮುರಿಯುವ ಭಂಡ ಶಕ್ತಿಯಾಗಿದೆ. ಈ ಸಂಯೋಜನೆಯು ವ್ಯಕ್ತಿಯ ಆಲೋಚನೆಗಳಲ್ಲಿ ಅಸಾಂಪ್ರದಾಯಿಕ ನಿಲುವುಗಳು, ಹಿರಿಯರೊಂದಿಗೆ ಸೈದ್ಧಾಂತಿಕ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಹಾಗೂ ನಂಬಿಕೆ-ಅಪನಂಬಿಕೆಗಳ ನಡುವಿನ ಮಾನಸಿಕ ತೊಳಲಾಟಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಈ ದೋಷವು ನಿಮ್ಮ ನಿರ್ಧಾರಗಳಲ್ಲಿ ಗೊಂದಲ ಮತ್ತು ಹಿರಿಯರ ಸಲಹೆಗಳನ್ನು ಕಡೆಗಣಿಸುವ ಪ್ರವೃತ್ತಿಯನ್ನು ಉಂಟುಮಾಡಬಹುದು. ಹಠಾತ್ ಶ್ರೀಮಂತರಾಗುವ ಆಸೆಗೆ ಬಿದ್ದು ತಪ್ಪು ಹೂಡಿಕೆ ಮಾಡುವುದು ಅಥವಾ ನಂಬಿದವರಿಂದಲೇ ವಂಚನೆಗೊಳಗಾಗುವ ಅಪಾಯವಿರುತ್ತದೆ. ಗುರು ಚರಿತ್ರೆ ಪಠಣ ಮಾಡುವುದು, ಗುರು-ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಪಡೆಯುವುದು ಹಾಗೂ ಯಾವುದೇ ಪ್ರಮುಖ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳುವ ಮುನ್ನ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯುವುದು ಈ ದೋಷವನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `आपकी जन्म कुंडली में देवगुरु बृहस्पति एवं छायाग्रह राहु की युति अथवा दृष्टि संबंध से गुरु चांडाल योग का निर्माण होता है। गुरु विशुद्ध धर्म, सदाचार, ज्ञान और गुरुजनों के आशीर्वाद के प्रतीक हैं, जबकि राहु परंपराओं से परे जाने वाली विद्रोही और भ्रमकारी ऊर्जा है। इन दोनों का सम्मिश्रण जातक के विचारों में परंपरा और आधुनिकता के बीच अंतर्द्वंद्व तथा कभी-कभी स्थापित मान्यताओं के प्रति संशय उत्पन्न करता है।`;
      const p2 = `वर्तमान समय में आपके दैनिक जीवन और निर्णयों में यह दोष कभी-कभी वरिष्ठों की सलाह की उपेक्षा अथवा जल्दी लाभ कमाने के चक्कर में अनुचित निर्णयों के रूप में प्रकट हो सकता है। किसी भी अनुबंध या बड़े वित्तीय निवेश से पूर्व भली-भांति जांच-पड़ताल करना आवश्यक है। नियमित रूप से गुरु मंत्र का जप करने, शिक्षकों एवं माता-पिता का चरण स्पर्श कर आशीर्वाद लेने तथा सात्विक आचरण रखने से राहु की नकारात्मकता शांत होकर बुद्धि प्रखर बनती है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `మీ జన్మ కుండలిలో ధర్మకారకుడైన దేవగురు బృహస్పతి మరియు భ్రమకారకుడైన రాహువు కలయిక వల్ల గురు చండాల దోషం ఏర్పడింది. గురుడు సంప్రదాయ విజ్ఞానం, నైతిక విలువలు మరియు దైవభక్తికి ప్రతీక కాగా, రాహువు సంప్రదాయాలను ప్రశ్నించే వినూత్న శక్తులకు మూలం. ఈ సంయోగం ఆలోచనలలో అసాంప్రదాయిక దృక్పథాన్ని, అంతర్గత సందేహాలను మరియు పెద్దలతో వైचारिक విభేదాలను కలుగజేసే అవకాశముంది.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవితంలో ఈ దోష ప్రభావం వలన నిర్ణయాలలో తికమక కలగడం లేదా అనుభవజ్ఞుల సలహాలను పక్కనబెట్టే ధోరణి కనిపించవచ్చు. త్వరగా సంపాదించాలనే ఆలోచనతో తొందరపడి పెట్టుబడులు పెట్టడం శ్రేయస్కరం కాదు. రోజూ గురు చరిత్ర పారాయణం చేయడం, గురువులను గౌరవించడం మరియు ముఖ్యమైన నిర్ణయాలలో పెద్దల ఆశీస్సులు తీసుకోవడం వల్ల ఈ ప్రతికూలతలు తొలగి ఆలోచనలలో దివ్యమైన వివేకం కలుగుతుంది.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `உங்கள் ஜாதகத்தில் தர்மகாரகரான குரு பகவானும் நிழல் கிரகமான ராகுவும் இணைந்து சஞ்சரிப்பதால் குரு சண்டாள தோஷம் உருவாகியுள்ளது. குரு பகவான் தூய ஒழுக்கம், சாஸ்திர ஞானம் மற்றும் ஆசிரியர்களின் வழிகாட்டுதலைக் குறிக்கிறார்; ராகு மரபுகளை உடைக்கும் புதுமையான மற்றும் மாயையான எண்ணங்களின் காரகர் ஆவார். இவ்விரு கிரகங்களின் சேர்க்கை பாரம்பரியத்திற்கும் நவீன சிந்தனைகளுக்கும் இடையே மனப் போராட்டத்தை உருவாக்கக்கூடும்.`
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையில் பெரியோர்களின் ஆலோசனைகளைப் புறக்கணிக்கும் மனநிலையோ அல்லது விரைவான முன்னேற்றத்திற்காக அவசர முடிவுகளை எடுக்கும் போக்கோ தோன்றலாம். ஒப்பந்தங்கள் மற்றும் முதலீடுகளில் கூடுதல் எச்சரிக்கையுடன் செயல்படுவது அவசியம். தினசரி குரு வழிபாடு செய்வதும், ஆன்றோர்களின் ஆசிகளைப் பெறுவதும், தியானம் செய்வதும் ராகுவின் மாயையை விலக்கி குருவின் உண்மையான ஞானத்தை வழங்கி நல்வழிப்படுத்தும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The conjunction of divine preceptor Jupiter with the shadow node Rahu establishes Guru Chandala Dosha in your birth chart. Jupiter represents orthodox wisdom, dharmic integrity, and sacred counsel, whereas Rahu introduces unconventional impulses, skepticism, and radical departures from tradition. This creates an internal dialectic between traditional ethics and rebellious ambition.`;
    const p2 = `In your current life phase, this dosha manifests as cognitive doubt regarding long-term paths, occasional conflicts with mentors or authorities, and susceptibility to speculative mirages. Maintaining humility before seasoned preceptors, conducting thorough due diligence before signing contracts, and chanting Brihaspati mantras ensures that Rahu's innovative brilliance serves Jupiter's dharmic wisdom.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 4. GENERAL / UNIVERSAL DOSHA FALLBACK (Strictly 2 paragraphs, 4-5 lines each)
  if (baseLang === "kn") {
    const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ, ಚಂದ್ರ ಅಥವಾ ಪ್ರಮುಖ ಭಾವಗಳು ಪಾಪಗ್ರಹಗಳ ದೃಷ್ಟಿ ಅಥವಾ ಸಂಯೋಗಕ್ಕೆ ಒಳಗಾಗಿರುವುದರಿಂದ ಈ ಕರ್ಮಿಕ ಸವಾಲು ಉಂಟಾಗಿದೆ. ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದ ಪ್ರಕಾರ ಜಾತಕದಲ್ಲಿ ಕಂಡುಬರುವ ಪ್ರತಿಯೊಂದು ದೋಷವೂ ಹಿಂದಿನ ಜನ್ಮದ ಕರ್ಮಶೇಷವನ್ನು ತೀರಿಸಲು ಒದಗಿಬರುವ ತರಬೇತಿಯಾಗಿದೆ. ಇದು ಜಾತಕನಿಗೆ ಜೀವನದ ಮಹತ್ವವನ್ನು ಕಲಿಸಲು, ಅಹಂಕಾರವನ್ನು ಕರಗಿಸಲು ಮತ್ತು ನೈಜ ಆತ್ಮಶಕ್ತಿಯನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ಎದುರಾಗುವ ದೈವಿಕ ಪರೀಕ್ಷೆಯಾಗಿದೆ.`;
    const p2 = `ಪ್ರಸ್ತುತ ${dashaName} ದಶಾ ಹಾಗೂ ${bhuktiName} ಭುಕ್ತಿಯ ಅವಧಿಯಲ್ಲಿ ಈ ದೋಷದ ಪ್ರಭಾವದಿಂದಾಗಿ ಮನಸ್ಸಿನಲ್ಲಿ ಅನಾವಶ್ಯಕ ಗೊಂದಲ, ಕಾರ್ಯಗಳಲ್ಲಿ ಮಂದಗತಿ ಅಥವಾ ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಕೊರತೆಗಳು ಕಾಡಬಹುದು. ನಿಮ್ಮ ದಿನಚರಿಯಲ್ಲಿ ಶಿಸ್ತುಬದ್ಧ ಪ್ರಾರ್ಥನೆ, ಸಾತ್ತ್ವಿಕ ಆಹಾರ ಪದ್ಧತಿ ಹಾಗೂ ದೈವ ಸಂಕಲ್ಪವನ್ನು ರೂಢಿಸಿಕೊಳ್ಳುವುದರಿಂದ ಈ ಸವಾಲುಗಳು ನಿವಾರಣೆಯಾಗಿ, ನಿಮ್ಮ ಮನೋಬಲವು ದುಪ್ಪಟ್ಟಾಗಲಿದೆ.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "hi") {
    const p1 = `आपकी जन्म कुंडली में चंद्र अथवा प्रमुख भावों पर पाप ग्रहों के प्रतिकूल प्रभाव से यह कर्मिक दोष परिलक्षित हो रहा है। वैदिक दर्शन के अनुसार कुंडली का कोई भी दोष अभिशाप नहीं, अपितु आत्मा के परिष्कार और पूर्व संचित कर्मों के निवारण का दिव्य माध्यम होता है। यह जातक को जीवन के वास्तविक मूल्यों को समझने, अहंकार से मुक्त होने तथा आत्म-संयम की शक्ति विकसित करने की प्रेरणा देता है।`;
    const p2 = `वर्तमान में चल रही ${dashaName} महादशा एवं ${bhuktiName} भुक्ति के प्रभाव से दैनिक जीवन में कभी-कभी मानसिक बेचैनी, कार्यों में अनावश्यक रुकावट अथवा संबंधों में संवेदनशीलता का अनुभव हो सकता है। प्रतिदिन नियमित ध्यान, सात्विक आचरण तथा भगवान शिव अथवा कुलदेवता की आराधना करने से इस दोष की प्रतिकूलता समाप्त होती है और जातक को जीवन में आत्मिक शांति एवं सफलता प्राप्त होती है।`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "te") {
    const p1 = `మీ జన్మ జాతకంలో కీలక భావాలు లేదా గ్రహాలపై పాప గ్రహాల దృష్టి లేదా సంయోగం వల్ల ఈ కర్మిక దోషం ఏర్పడింది. జ్యోతిష శాస్త్ర దృక్కోణంలో జాతకంలోని దోషాలు కేవలం పూర్వజన్మ కర్మల పరిహారార్థం ఏర్పడే సాధనలు మాత్రమే. అవి జాతకుడిని పరిపక్వత వైపు నడిపించడానికి, సహనాన్ని పరీక్షించడానికి మరియు అంతర్గత మనోబలాన్ని పెంచడానికి ప్రకృతి కల్పించే దివ్య పాఠాలుగా భావించాలి.`;
    const p2 = `ప్రస్తుతం నడుస్తున్న ${dashaName} దశ మరియు ${bhuktiName} భుక్తి ప్రభావంతో దైనందిన వ్యవహారాలలో అప్పుడప్పుడు ఆలస్యం జరగడం, ఆలోచనలలో అస్థిరత లేదా నిర్ణయాలలో తడబాటు కలగవచ్చు. ప్రతిరోజూ క్రమశిక్షణతో కూడిన దైవారాధన చేయడం, సంయమనంతో వ్యవహరించడం మరియు సత్కర్మలు ఆచరించడం ద్వారా ఈ సవాళ్లు తొలగిపోయి మీ జీవితంలో శాంతి, సమృద్ధి స్థిరపడతాయి.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "ta") {
    const p1 = `உங்கள் ஜாதகத்தில் முக்கிய ஸ்தானங்கள் அல்லது கிரகங்கள் மீது பாப கிரகங்களின் தாக்கம் ஏற்படுவதால் இந்த கர்ம வினைக் குறைபாடு உருவாகியுள்ளது. ஜோதிட தத்துவத்தின்படி எந்தவொரு தோஷமும் சாபம் அல்ல; மாறாக முற்பிறவி கர்ம வினைகளைக் கழித்து ஆன்மாவைத் தூய்மைப்படுத்தும் தெய்வீகப் பாதையாகும். இது மனிதனைப் பொறுமையுள்ளவனாகவும் பக்குவமுள்ளவனாகவும் மாற்ற இயற்கை தரும் பயிற்சியாகும்.`;
    const p2 = `தற்போதைய ${dashaName} திசை மற்றும் ${bhuktiName} புக்தி காலக்கட்டத்தில் இந்த தோஷத்தின் தாக்கத்தால் பணிகளில் சிறு தாமதங்கள், மனதில் தேவையற்ற குழப்பங்கள் அல்லது உடல் சோர்வு ஏற்பட வாய்ப்புள்ளது. தினசரி இறைவழிபாடு, தியானம் மற்றும் சாத்வீக வாழ்க்கை முறையைக் கடைப்பிடிப்பதன் மூலம் இந்த தடைகள் யாவும் தகர்ந்து, உங்களின் தன்னம்பிக்கையும் நல்வாழ்வும் மேலோங்கும்.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  const p1 = `The afflictive aspect or conjunction of functional malefics upon sensitive angles in your birth chart creates this specific karmic configuration. In classical Vedic doctrine, planetary afflictions are never fatalistic curses; rather, they signify karmic debt requiring conscious purification. They function as profound spiritual crucibles designed to strip away illusions, cultivate deep patience, and forge authentic self-mastery.`;
  const p2 = `Operating under your running ${dashaName} Mahadasha and ${bhuktiName} Bhukti, this karmic friction manifests as occasional mental fatigue, delays in critical outcomes, or emotional hypersensitivity in interpersonal dynamics. Grounding your routine in daily contemplation, maintaining ethical transparency in transactions, and observing prescribed Vedic pacifications effectively dissolves this negative pull and restores clarity.`;
  return formatTwoParagraphs(p1, p2, cleanImpact);
}

/**
 * Enriches any Gochara (Transit) description into exactly 2 full paragraphs (4-5 lines each).
 * Para 1: Explains what the celestial transit is (astronomical motion from natal Moon).
 * Para 2: Explains what this transit is currently doing in their life (real-world daily impact).
 */
export function enrichGocharaDescription(
  name: string,
  impact: string,
  lang: string,
  moonStr: string = "Moon Sign",
  ageYears?: number,
  dashaName: string = "Dasha",
  bhuktiName: string = "Bhukti"
): string {
  const cleanImpact = (impact || "").trim();
  const baseLang = (lang || "en").split("-")[0];
  const lowerName = (name || "").toLowerCase();

  // If text already has 2 generous paragraphs with at least 180 chars each, preserve it
  if (hasTwoSubstantialParagraphs(cleanImpact, 180)) {
    return baseLang === "en" ? cleanImpact : cleanEnglishFromRegionalText(cleanImpact, baseLang);
  }

  // 1. SATURN (Shani) TRANSIT
  if (
    lowerName.includes("saturn") ||
    lowerName.includes("shani") ||
    lowerName.includes("ಶನಿ") ||
    lowerName.includes("शनि") ||
    lowerName.includes("శని") ||
    lowerName.includes("சனி")
  ) {
    if (baseLang === "kn") {
      const p1 = `ಕರ್ಮಕಾರಕನಾದ ಶನಿ ಭಗವಾನರು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ಪ್ರಮುಖ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಇದು ಆಂತರಿಕ ಶಿಸ್ತು ಹಾಗೂ ನೈತಿಕ ಕರ್ತವ್ಯಗಳನ್ನು ಪರೀಕ್ಷಿಸುವ ಮಹತ್ವದ ಕಾಲಘಟ್ಟವಾಗಿದೆ. ಶಾಸ್ತ್ರಗಳ ಪ್ರಕಾರ ಶನಿಯು ವ್ಯಕ್ತಿಯ ಸತ್ಯನಿಷ್ಠೆ, ತಾಳ್ಮೆ, ಪರಿಶ್ರಮ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಾನೆ. ಈ ಸಂಚಾರವು ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ, ಜೀವನದ ಆದ್ಯತೆಗಳನ್ನು ಪುನರ್ರಚಿಸಲು ಹಾಗೂ ಸುದೀರ್ಘಾವಧಿಯ ಸ್ಥಿರತೆಗೆ ಅಡಿಪಾಯ ಹಾಕಲು ಪ್ರೇರೇಪಿಸುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಶನಿಯ ಈ ಗೋಚಾರವು ಕೆಲಸದ ಹೊರೆ ಹೆಚ್ಚಳ, ಕಾರ್ಯಗಳಲ್ಲಿ ಮಂದಗತಿ ಅಥವಾ ಜವಾಬ್ದಾರಿಗಳ ಒತ್ತಡದ ರೂಪದಲ್ಲಿ ಗೋಚರಿಸುತ್ತಿದೆ. ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ತಕ್ಷಣದ ಪ್ರಶಂಸೆ ಸಿಗದಿದ್ದರೂ, ನಿರಂತರವಾಗಿ ಕರ್ತವ್ಯ ನಿಭಾಯಿಸುವುದು ಅತ್ಯಗತ್ಯವಾಗಿದೆ. ಹಿರಿಯರ ಮಾರ್ಗದರ್ಶನವನ್ನು ಗೌರವಿಸುವುದು, ನಿರ್ಗತಿಕರಿಗೆ ಸಹಾಯ ಮಾಡುವುದು ಹಾಗೂ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಬೆಳಗಿಸುವುದರಿಂದ ಶನಿ ಮಹಾತ್ಮನ ಕೃಪೆಯು ನಿಮ್ಮ ಪರಿಶ್ರಮಕ್ಕೆ ಯೋಗ್ಯ ಶಾಶ್ವತ ಯಶಸ್ಸನ್ನು ಕರುಣಿಸಲಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `कर्मफलदाता शनि देव वर्तमान में आपकी जन्म चंद्र राशि से महत्वपूर्ण भाव में गोचर कर रहे हैं, जो जीवन में अनुशासन, धैर्य और कर्तव्यपरायणता की कठोर परीक्षा का समय है। वैदिक ज्योतिष के अनुसार शनि का गोचर किसी भी प्रकार के दिखावे को समाप्त कर व्यक्ति को यथार्थ के धरातल पर लाता है। यह समयावधि उथले फैसलों से बचकर जीवन की प्राथमिकताओं को नए सिरे से निर्धारित करने की प्रेरणा देती है।`;
      const p2 = `वर्तमान समय में आपके दैनिक जीवन पर इस गोचर का सीधा प्रभाव कार्यभार में वृद्धि, कार्यों के धीमे निष्पादन तथा अत्यधिक जिम्मेदारियों के दबाव के रूप में दिखाई दे रहा है। त्वरित लाभ की अपेक्षा किए बिना सतत परिश्रम करना ही इस समय की सर्वोत्तम रणनीति है। शनिवार को तिल के तेल का दीपक जलाना, निर्धनों की सेवा करना तथा संयमित दिनचर्या का पालन करना शनि देव के आशीर्वाद से स्थायी समृद्धि प्रदान करेगा।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `కర్మ ప్రదాత మరియు న్యాయాధిపతి అయిన శని భగవానుడు ప్రస్తుతం మీ జన్మ చంద్ర రాశి నుండి కీలక భావంలో సంచరిస్తూ కఠినమైన క్రమశిక్షణ మరియు బాధ్యతలను గుర్తుచేస్తున్నారు. శాస్త్ర నియమాల ప్రకారం శని దేవుడు ఆడంబరాలను తొలగించి నిజాయితీ, ఓర్పు మరియు నిరంతర శ్రమను పరీక్షిస్తారు. ఈ గోచారం జీవితంలో అనాలోచిత నిర్ణయాలను అరికట్టి, దీర్ఘకాలిక భవిష్యత్తు కోసం పటిష్టమైన పునాదులను నిర్మించే దివ్య అవకాశాన్ని అందిస్తుంది.`;
      const p2 = `ప్రస్తుతం మీ నిత్య జీవితంలో ఈ శని గోచారం పని ఒత్తిడి పెరగడం, పనులలో స్వల్ప జాప్యం మరియు కుటుంబ బాధ్యతల రూపంలో గోచరిస్తోంది. తక్షణ ప్రశంసలను ఆశించకుండా కర్తవ్య నిర్వహణలో నిమగ్నమవ్వడం ఈ సమయానికి ఎంతో అవసరం. శనివారం నాడు నువ్వుల నూనెతో దీపం వెలిగించడం, దశరథ ప్రోక్త శని స్తోత్రం పఠించడం మరియు నిరుపేదలకు అన్నదానం చేయడం ద్వారా శని దేవుని అనుగ్రహం లభించి శాశ్వతమైన విజయం మరియు గౌరవం సిద్ధస్తాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `கர்ம வினைகளைத் தீர்க்கும் நீதிமானான சனி பகவான் தற்பொழுது உங்கள் சந்திர ராசியிலிருந்து முக்கிய ஸ்தானத்தில் சஞ்சரித்து, ஒழுக்கத்தையும் கடமை உணர்வையும் சோதிக்கும் காலத்தை ஏற்படுத்தியுள்ளார். சாஸ்திரங்களின்படி சனி பகவான் போலியான மாயைகளை அகற்றி உண்மை, பொறுமை மற்றும் தளராத உழைப்பை நிலைநிறுத்துகிறார். இந்த கிரக சஞ்சாரம் அவசர முடிவுகளைக் கட்டுப்படுத்தி, எதிர்காலத்திற்கான உறுதியான அடித்தளத்தை அமைக்க வழிகாட்டுகிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையில் பணிச்சுமை அதிகரிப்பது, காரியங்களில் சிறு தாமதங்கள் ஏற்படுவது மற்றும் கூடுதல் பொறுப்புகள் சுமக்க நேரிடுவது இதன் வெளிப்பாடாகும். உடனடிப் பாராட்டை எதிர்பாராமல் கடமைகளைச் செவ்வனே செய்து வருவது அவசியம். சனிக்கிழமைகளில் நல்லெண்ணெய் தீபம் ஏற்றி தசரத சனி ஸ்தோத்திரம் பாராயணம் செய்வதும், எளியோருக்கு அன்னதானம் செய்வதும் சனி பகவானின் அருளைப் பெற்றுத் தந்து நிலையான நற்பலன்களைத் தரும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `Saturn, the supreme arbiter of karma and cosmic justice, is currently transiting a critical house relative to your natal Moon sign. Classical Vedic tenets establish that Saturn's slow, deliberate transit strips away complacency, demanding absolute integrity, patience, and meticulous endurance. It obliges the native to restructure long-term priorities, temper hasty impulses, and lay bedrock foundations for enduring maturity.`;
    const p2 = `In your living reality right now, this Saturn transit manifests as heightened workplace duties, heavier domestic accountability, and occasional procedural delays that test your stamina. Rather than seeking quick gratification, committing to methodical persistence is essential. Lighting sesame oil lamps on Saturdays and maintaining unshakeable ethics converts these testing pressures into unbreakable professional security.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 2. JUPITER (Guru) TRANSIT
  if (
    lowerName.includes("jupiter") ||
    lowerName.includes("guru") ||
    lowerName.includes("ಗುರು") ||
    lowerName.includes("बृहस्पति") ||
    lowerName.includes("గురు") ||
    lowerName.includes("குரு")
  ) {
    if (baseLang === "kn") {
      const p1 = `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ ಪವಿತ್ರ ಭಾವದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಶುಭ ದೈವಿಕ ತರಂಗಗಳನ್ನು ಪ್ರಸರಿಸುತ್ತಿದ್ದಾನೆ. ಗುರುವು ಜ್ಞಾನ, ಕಲ್ಯಾಣ, ಸಂತಾನ, ಆರ್ಥಿಕ ವೃದ್ಧಿ ಹಾಗೂ ಸದ್ಬುದ್ಧಿಯ ಕಾರಕನಾಗಿದ್ದಾನೆ. ಈ ಗೋಚಾರವು ಜಾತಕನ ಆಲೋಚನೆಗಳಲ್ಲಿ ವಿಶಾಲ ದೃಷ್ಟಿಕೋನವನ್ನು ತಂದುಕೊಡುವುದಲ್ಲದೆ, ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಲ್ಲಿ ಆಸಕ್ತಿ ಹಾಗೂ ಸತ್ಸಂಕಲ್ಪಗಳ ಈಡೇರಿಕೆಗೆ ಅಗತ್ಯವಿರುವ ದೈವಿಕ ಬೆಂಬಲವನ್ನು ಪ್ರಧಾನವಾಗಿ ಒದಗಿಸುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಬದುಕಿನಲ್ಲಿ ಈ ಗುರು ಗೋಚಾರವು ಆಶಾಭಾವನೆ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಹೊಸ ಅವಕಾಶಗಳ ಸೃಷ್ಟಿಯಲ್ಲಿ ಮಹತ್ತರ ಪಾತ್ರ ವಹಿಸುತ್ತಿದೆ. ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೌರವಯುತ ಸ್ಥಾನಮಾನ ಲಭಿಸಲು, ಕೌಟುಂಬಿಕ ಮಂಗಳ ಕಾರ್ಯಗಳು ನೆರವೇರಲು ಹಾಗೂ ಆರ್ಥಿಕ ಮುಗ್ಗಟ್ಟುಗಳು ಸರಾಗವಾಗಿ ಪರಿಹಾರವಾಗಲು ಗುರು ಬಲವು ಸಕ್ರಿಯವಾಗಿದೆ. ಗುರು-ಹಿರಿಯರನ್ನು ಗೌರವಿಸುವುದು ಮತ್ತು ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸುವುದು ಈ ಶುಭ ಫಲಗಳನ್ನು ಮತ್ತಷ್ಟು ಇಮ್ಮಡಿಗೊಳಿಸಲಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `देवगुरु बृहस्पति वर्तमान में आपकी जन्म चंद्र राशि से शुभ भाव में गोचर कर रहे हैं, जो आपके जीवन में ईश्वरीय अनुग्रह और सकारात्मक ऊर्जा का संचार कर रहा है। गुरु ज्ञान, विवेक, आर्थिक समृद्धि, मांगलिक कार्यों और आध्यात्मिक प्रगति के प्रमुख कारक हैं। उनका यह पावन गोचर आपकी सोच को विस्तार देने तथा धर्म और नीति के मार्ग पर अग्रसर होने के लिए आवश्यक आत्मिक संबल प्रदान करता है।`;
      const p2 = `वर्तमान समय में यह गुरु गोचर आपके दैनिक जीवन में आशावादिता, मानसिक शांति तथा रुके हुए कार्यों को पुनः गति देने में सहायक हो रहा है। कार्यक्षेत्र में नए और सम्मानजनक अवसरों की प्राप्ति, पारिवारिक वातावरण में सौहार्द तथा वित्तीय निर्णयों में दूरदर्शिता का विकास इसके स्पष्ट फल हैं। गुरुवार को श्री विष्णु की आराधना करने तथा शिक्षकों और गुरुजनों का आदर करने से यह गोचर भाग्योदय को त्वरित करता है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `దేవగురు బృహస్పతి ప్రస్తుతం మీ జన్మ చంద్ర రాశి నుండి అత్యంత పవిత్రమైన స్థానంలో సంచరిస్తూ మీ జీవితంలోకి దివ్యమైన ఆశీస్సులను ప్రసరింపజేస్తున్నారు. గురుడు విజ్ఞానం, సదాచారం, ధన సంపద, సంతాన సౌఖ్యం మరియు ఆధ్యాత్మిక మార్గదర్శకత్వానికి అధిపతి. ఈ గోచార సంచారం మీ ఆలోచనలకు విశాల దృక్పథాన్ని అందించడమే కాకుండా, ధర్మబద్ధమైన సంకల్పాలు నెరవేరడానికి అవసరమైన దైవిక సహాయాన్ని సంపూర్ణంగా చేకూరుస్తుంది.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవనంలో ఈ గురు గోచారం నూతన ఆశలను, మనశ్శాంతిని మరియు ఉన్నతమైన అవకాశాలను కల్పిస్తోంది. వృత్తిలో గౌరవప్రదమైన స్థానం పొందడానికి, కుటుంబంలో శుభకార్యాల నిర్వహణకు మరియు ఆర్థిక సమస్యలను సమర్థవంతంగా పరిష్కరించుకోవడానికి గురు బలం తోడ్పడుతోంది. ప్రతి గురువారం విష్ణు సహస్రనామ పారాయణం చేయడం మరియు గురువులను సత్కరించడం ద్వారా ఈ శుభ ఫలితాలు మరింతగా వృద్ధి చెందుతాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `தேவகுரு பிரகஸ்பதி தற்பொழுது உங்கள் சந்திர ராசியிலிருந்து மங்களகரமான ஸ்தானத்தில் சஞ்சரித்து, உங்கள் வாழ்வில் தெய்வ அனுகூலத்தையும் சுப அதிர்வுகளையும் வழங்கி வருகிறார். குரு பகவான் ஞானம், தர்மசிந்தனை, தன விருத்தி, சுப நிகழ்ச்சிகள் மற்றும் குடும்ப மகிழ்ச்சிக்கு காரகர் ஆவார். இவரது இந்த புனிதமான கோசாரம் உங்கள் சிந்தனைகளை விசாலமாக்குவதுடன், நற்செயல்கள் தடையின்றி நிறைவேறுவதற்குத் தேவையான தெய்வ பலத்தை அளிக்கிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையில் இந்த குருவின் கோசாரம் மன அமைதியையும், புத்துணர்ச்சியையும், புதிய நல்வாய்ப்புகளையும் வழங்கி வருகிறது. தொழில் துறையில் உரிய மரியாதையைப் பெறவும், குடும்பத்தில் மங்களகரமான நிகழ்வுகள் அரங்கேறவும், நிதி நெருக்கடிகள் சுமுகமாகத் தீரவும் குரு பலம் துணைநிற்கிறது. வியாழக்கிழமைகளில் விஷ்ணு சகஸ்ரநாமம் பாராயணம் செய்வதும், பெரியோர்களை வணங்கி ஆசி பெறுவதும் இந்த சுப பலன்களை இரட்டிப்பாக்கும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `Jupiter, the cosmic preceptor and supreme dispenser of divine benevolence, is transiting a potent house relative to your natal Moon sign. Governing wisdom, philosophical expansion, progeny, and material fortune, Jupiter casts an uplifting aura upon your consciousness. This transit elevates your ethical vision, dissolves psychological cynicism, and aligns your daily endeavors with higher universal harmony.`;
    const p2 = `In your current everyday life, this Jupiter transit is actively infusing optimism, relational goodwill, and constructive breakthroughs into your vocational landscape. It inspires sound financial judgment, facilitates auspicious family milestones, and earns the respect of mentors and colleagues. Cultivating sincere gratitude and honoring spiritual teachers magnifies this benevolent current into lasting prosperity.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 3. RAHU & KETU TRANSIT
  if (
    lowerName.includes("rahu") ||
    lowerName.includes("ketu") ||
    lowerName.includes("ರಾಹು") ||
    lowerName.includes("ಕೇತು") ||
    lowerName.includes("राहु") ||
    lowerName.includes("केतु") ||
    lowerName.includes("రాహు") ||
    lowerName.includes("కేతు") ||
    lowerName.includes("ராகு") ||
    lowerName.includes("கேது")
  ) {
    if (baseLang === "kn") {
      const p1 = `ಛಾಯಾಗ್ರಹಗಳಾದ ರಾಹು ಮತ್ತು ಕೇತುಗಳು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರನಿಂದ ಪ್ರಮುಖ ನಕ್ಷತ್ರ ಅಕ್ಷದಲ್ಲಿ ಸಂಚರಿಸುತ್ತಿದ್ದು, ಇದು ಆಳವಾದ ಕರ್ಮಿಕ ಪರಿವರ್ತನೆಯ ಸಂಕೇತವಾಗಿದೆ. ರಾಹುವು ಹೊಸ ಮಹತ್ವಾಕಾಂಕ್ಷೆಗಳು, ಲೌಕಿಕ ಸಂಪರ್ಕಗಳು ಹಾಗೂ ಅಪರಿಚಿತ ಕ್ಷೇತ್ರಗಳತ್ತ ಸೆಳೆಯುವ ಶಕ್ತಿಯಾದರೆ, ಕೇತುವು ಆಂತರಿಕ ವೈರಾಗ್ಯ, ಆತ್ಮಶೋಧನೆ ಹಾಗೂ ಭ್ರಮೆಗಳ ಕಳಚುವಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತಾನೆ. ಈ ಗೋಚಾರವು ಜೀವನದ ನಿತ್ಯ ಹಾದಿಯಲ್ಲಿ ನೂತನ ಆಯಾಮಗಳನ್ನು ತೆರೆಯುತ್ತದೆ.`;
      const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಬದುಕಿನಲ್ಲಿ ಈ ಛಾಯಾಗ್ರಹಗಳ ಸಂಚಾರವು ಹಠಾತ್ ಬದಲಾವಣೆಗಳು ಅಥವಾ ಹೊಸ ಯೋಜನೆಗಳ ಕುರಿತು ಅತಿಯಾದ ಯೋಚನೆಗೆ ದಾರಿ ಮಾಡಿಕೊಡಬಹುದು. ಈ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಆತುರದ ಅಥವಾ ಅನೈತಿಕ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳನ್ನು ನಂಬದೆ, ವಾಸ್ತವ ನೆಲೆಗಟ್ಟಿನಲ್ಲಿ ಹೆಜ್ಜೆ ಇಡುವುದು ಅತ್ಯಗತ್ಯವಾಗಿದೆ. ದುರ್ಗಾ ದೇವಿಯ ಉಪಾಸನೆ ಮಾಡುವುದು ಹಾಗೂ ಪಕ್ಷಿಗಳಿಗೆ ಕಾಳು ನೀಡುವುದು ಈ ಗೋಚಾರದ ಋಣಾತ್ಮಕತೆಯನ್ನು ತಡೆದು ಅದ್ಭುತ ಒಳನೋಟವನ್ನು ನೀಡಲಿದೆ.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "hi") {
      const p1 = `छायाग्रह राहु और केतु वर्तमान में आपकी जन्म चंद्र राशि से प्रमुख अक्ष पर गोचर कर रहे हैं, जो गहन कर्मिक पुनर्गठन का समय है। राहु सांसारिक महत्वाकांक्षाओं, नए संपर्कों और अन्वेषण को प्रेरित करते हैं, जबकि केतु आत्म-चिंतन, अनासक्ति और आंतरिक शांति की ओर अग्रसर करते हैं। यह दोहरा गोचर जीवन के स्थापित ढर्रे को तोड़कर नए दृष्टिकोण और अभूतपूर्व अनुभव प्रदान करता है।`;
      const p2 = `वर्तमान समय में यह छायाग्रह गोचर आपके दैनिक जीवन में अचानक निर्णयों की इच्छा अथवा भविष्य को लेकर अत्यधिक विचारशीलता उत्पन्न कर सकता है। इस अवधि में किसी भी प्रकार के काल्पनिक प्रलोभनों से बचते हुए व्यावहारिक सच्चाई पर अडिग रहना अत्यंत महत्वपूर्ण है। मां दुर्गा की आराधना करने और पक्षियों को दाना खिलाने से राहु-केतु की ऊर्जा शांत होकर तीक्ष्ण अंतर्दृष्टि और सफलता में परिवर्तित होती है।`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "te") {
      const p1 = `ఛాయాగ్రహాలైన రాహువు మరియు కేతువులు ప్రస్తుతం మీ జన్మ చంద్రుని ఆధారంగా కీలకమైన నక్షత్ర అక్షంలో సంచరిస్తూ లోతైన కర్మిక మార్పులను సూచిస్తున్నారు. రాహువు లౌకిక విజయాలు, నూతన పరిచయాలు మరియు ఆధునిక రంగాల పట్ల ఆకర్షణను కలిగిస్తుండగా, కేతువు అంతర్గత వైరాగ్యం, ఆధ్యాత్మిక సాధన మరియు అంతర్దృష్టిని ప్రసాదిస్తున్నాడు. ఈ గోచారం జీవితంలో పాత అలవాట్లను మార్చి సరికొత్త మార్గాలను చూపిస్తోంది.`;
      const p2 = `ప్రస్తుతం మీ దైనందిన జీవితంలో ఈ ఛాయాగ్రహాల సంచారం ఆకస్మిక ఆలోచనలు లేదా భవిష్యత్తు ప్రణాళికల పట్ల మితిమీరిన ఉత్సాహాన్ని కలిగించవచ్చు. ఈ సమయంలో ఎలాంటి భ్రమలకు లోనుకాకుండా వాస్తవ పరిమితులను గమనిస్తూ అడుగులు వేయడం చాలా ముఖ్యం. ప్రతి మంగళ లేదా శుక్రవారాల్లో దుర్గాదేవిని ఆరాధించడం మరియు పక్షులకు దాణా వేయడం వల్ల రాహు-కేతువుల ప్రతికూలతలు తొలగి అద్భుతమైన అంతర్దృష్టి మరియు విజయం లభిస్తాయి.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    if (baseLang === "ta") {
      const p1 = `சாயாகிரகங்களான ராகு மற்றும் கேது பகவான்கள் தற்பொழுது உங்கள் சந்திர ராசிக்குரிய முக்கிய அச்சில் சஞ்சரித்து, ஆழமான கர்ம வினைகளின் மாற்றங்களை உணர்த்தி வருகின்றனர். ராகு புதிய இலக்குகள், உலகியல் தொடர்புகள் மற்றும் நவீன முயற்சிகளைத் தூண்டுகிறார்; கேது ஆன்மீக நாட்டம், உள்ளார்ந்த ஞானம் மற்றும் உலகப் பற்றுகளை நீக்கும் சக்தியை அளிக்கிறார். இந்த இரட்டை கோசாரம் உங்கள் வாழ்வின் போக்கில் புதிய அத்தியாயங்களைத் திறந்து வைக்கிறது.`;
      const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையில் எதிர்பாராத சிந்தனைகளும் புதிய திட்டங்களை நோக்கிய தீவிர ஈர்ப்பும் உருவாகலாம். இக்காலத்தில் பேராசைக்கோ மாயைகளுக்கோ ஆட்படாமல் எதார்த்தமான உண்மைகளை உணர்ந்து செயல்படுவது அவசியமாகும். செவ்வாய் அல்லது வெள்ளிக்கிழமைகளில் துர்க்கை அம்மனுக்கு நெய் தீபம் ஏற்றி வழிபடுவதும், பறவைகளுக்குத் தானியமிடுவதும் நிழல் கிரகங்களின் தோஷங்களை விலக்கி கூரிய விவேகத்தையும் வெற்றிகளையும் தரும்.`;
      return formatTwoParagraphs(p1, p2, cleanImpact);
    }
    const p1 = `The karmic lunar nodes, Rahu and Ketu, are navigating an impactful axis counted from your natal Moon sign. Rahu drives worldly ambition, unconventional networks, and accelerated expansion into uncharted territories, while Ketu instills spiritual detachment, psychological introspection, and the dissolution of superficial attachments. This nodal transit initiates an intense phase of karmic recalibration.`;
    const p2 = `In your living reality right now, this nodal movement can trigger unexpected shifts in daily focus, sudden professional openings, or moments of philosophical questioning. Remaining anchored in disciplined transparency and rejecting speculative illusions is paramount. Observing devotional propitiation to the Divine Mother harmonizes these shadow currents into razor-sharp intuitive clarity and breakthrough achievements.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  // 4. GENERAL / UNIVERSAL TRANSIT CARD FALLBACK
  if (baseLang === "kn") {
    const p1 = `ನಿಮ್ಮ ಜನ್ಮ ಚಂದ್ರ ರಾಶಿಯಿಂದ ಪ್ರಸ್ತುತ ಸಂಚರಿಸುತ್ತಿರುವ ಈ ಗ್ರಹದ ಗೋಚಾರವು ಜಾತಕದ ಪ್ರಮುಖ ಭಾವದ ಮೇಲೆ ತನ್ನ ನೇರ ಶಕ್ತಿಯನ್ನು ಬೀರಲಾರಂಭಿಸಿದೆ. ಜ್ಯೋತಿಷ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಗೋಚಾರ ಗ್ರಹಗಳು ದಿನನಿತ್ಯದ ಘಟನೆಗಳು, ಮನಸ್ಸಿನ ಭಾವನೆಗಳು ಹಾಗೂ ಪರಿಸರದ ಅನುಕೂಲ-ಅನನುಕೂಲಗಳನ್ನು ನಿರ್ಧರಿಸುತ್ತವೆ. ಈ ಸಂಚಾರವು ನಿಮ್ಮ ಹಿಂದಿನ ಸತ್ಕರ್ಮಗಳನ್ನು ಜಾಗೃತಗೊಳಿಸಲು ಹಾಗೂ ಜೀವನದಲ್ಲಿ ಹೊಸ ಅನುಭವಗಳನ್ನು ನೀಡಲು ಒದಗಿಬಂದಿದೆ.`;
    const p2 = `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ದಿನನಿತ್ಯದ ಬದುಕಿನಲ್ಲಿ ಈ ಗೋಚಾರ ಫಲವು ನಿಮ್ಮ ಚಿಂತನೆಗಳು ಮತ್ತು ನಿರ್ಧಾರಗಳಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ. ಉದ್ಯೋಗದಲ್ಲಿ ಸಮಚಿತ್ತ ಕಾಪಾಡಿಕೊಳ್ಳಲು, ಆರ್ಥಿಕ ಲೆಕ್ಕಾಚಾರಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಲು ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಇದು ಮಾರ್ಗದರ್ಶಿಯಾಗಿದೆ. ನಿಯಮಿತ ದೈವ ಸ್ಮರಣೆ ಮತ್ತು ಸತ್ಕಾರ್ಯಗಳ ಆಚರಣೆಯು ಈ ಗೋಚಾರದ ಸತ್ಫಲಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿಮ್ಮ ಪರವಾಗಿ ಪರಿವರ್ತಿಸಲಿದೆ.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "hi") {
    const p1 = `आपकी जन्म चंद्र राशि से वर्तमान में हो रहा यह ग्रह गोचर आपके जीवन के महत्वपूर्ण भाव पर अपना प्रत्यक्ष प्रभाव डाल रहा है। वैदिक ज्योतिष के अनुसार गोचर ग्रह दैनिक जीवन की परिस्थितियों, मानसिक विचारों और तात्कालिक अवसरों का निर्धारण करते हैं। यह खगोलीय संचरण आपको कर्म के प्रति निष्ठावान बनाने तथा नवीन अनुभवों से समृद्ध करने के लिए अत्यंत महत्वपूर्ण है।`;
    const p2 = `वर्तमान समय में यह गोचर आपके दैनिक निर्णयों और कार्यशैली पर सक्रिय रूप से प्रभाव डाल रहा है। यह आपको कार्यक्षेत्र में सतर्क रहने, वित्तीय मामलों को समझदारी से संभालने तथा पारिवारिक सौहार्द बनाए रखने में सहायता कर रहा है। प्रतिदिन सात्विक दिनचर्या का पालन और अपने इष्टदेव का स्मरण करने से इस गोचर के समस्त नकारात्मक प्रभाव समाप्त होकर शुभ फल प्राप्त होते हैं।`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "te") {
    const p1 = `మీ జన్మ చంద్ర రాశి నుండి ప్రస్తుతం జరుగుతున్న ఈ గ్రహ గోచారం మీ జీవితంలోని కీలక భావంపై తన ప్రభావాన్ని చూపుతోంది. జ్యోతిష శాస్త్ర ప్రకారం గోచార గ్రహాలు దైనందిన సంఘటనలను, మానసిక ఉల్లాసాన్ని మరియు పరిసరాల అనుకూలతలను నిర్దేశిస్తాయి. ఈ సంచారం మీలో కార్యాచరణను పెంపొందించడానికి మరియు భవిష్యత్ ప్రణాళికలను తీర్చిదిద్దడానికి తోడ్పడుతుంది.`;
    const p2 = `ప్రస్తుతం మీ నిత్య జీవితంలో ఈ గ్రహ సంచారం మీ ఆలోచనలు మరియు నిర్ణయాలలో చురుగ్గా పనిచేస్తోంది. వృత్తిలో సంయమనం పాటించడానికి, ఆర్థిక విషయాలలో జాగ్రత్తగా ఉండటానికి మరియు కుటుంబ శాంతిని కాపాడుకోవడానికి ఇది మార్గదర్శకంగా నిలుస్తుంది. క్రమం తప్పకుండా దైవారాధన చేయడం వల్ల ఈ గోచారం మీకు సంపూర్ణ శుభ ఫలితాలను ప్రసాదిస్తుంది.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }
  if (baseLang === "ta") {
    const p1 = `உங்கள் சந்திர ராசியிலிருந்து தற்பொழுது நடைபெறும் இந்த கிரக கோசாரம் உங்கள் வாழ்வின் முக்கிய ஸ்தானத்தில் நேரடி ஆதிக்கத்தைச் செலுத்துகிறது. ஜோதிட விதிகளின்படி கோசார கிரகங்கள் அன்றாட நிகழ்வுகள், மனநிலைகள் மற்றும் உடனடி வாய்ப்புகளைத் தீர்மானிக்கின்றன. இந்த கிரகப் பெயர்ச்சி உங்களை உற்சாகத்துடனும் விழிப்புணர்வுடனும் வழிநடத்த உதவுகிறது.`;
    const p2 = `தற்போதைய காலகட்டத்தில் உங்கள் அன்றாட வாழ்க்கையிலும் முடிவுகளிலும் இந்த கோசாரம் முக்கியமான பங்கை வகிக்கிறது. தொழிலில் நிதானத்தைக் கடைப்பிடிக்கவும், நிதி விவகாரங்களை விவேகத்துடன் கையாளவும், குடும்ப நிம்மதியைப் பாதுகாக்கவும் இது வழிகாட்டுகிறது. தினசரி பிரார்த்தனையும் நல்லெண்ணமும் இந்த கோசாரத்தின் சுப பலன்களை முழுமையாகப் பெற்றுத் தரும்.`;
    return formatTwoParagraphs(p1, p2, cleanImpact);
  }

  const p1 = `The present celestial transit across pivotal houses counted from your natal Moon sign introduces significant planetary currents into your consciousness. Classical astrological principles dictate that transiting planets modulate daily environmental circumstances, mood fluctuations, and immediate opportunities, providing the timing mechanism that awakens dormant natal promises.`;
  const p2 = `In your living reality right now, this planetary transit is actively guiding your daily thoughts and executive choices. It advises steady equilibrium in career duties, vigilant stewardship over finances, and domestic patience. Aligning your daily routine with mindful contemplation ensures that this transit yields its highest constructive blessings.`;
  return formatTwoParagraphs(p1, p2, cleanImpact);
}

/**
 * Localizes any Yoga title into pure Indic script for kn, hi, te, ta, and en.
 * Guarantees zero Latin / English letter leakage into regional language reports.
 */
export function localizeYogaName(name: string, lang: string): string {
  if (!name) return "";
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "en") return name;
  const lower = name.toLowerCase();

  if (lower.includes("gajakesari") || lower.includes("ಗಜಕೇಸರಿ") || lower.includes("गजकेसरी") || lower.includes("గజకేసరి") || lower.includes("கஜகேசரி")) {
    if (baseLang === "kn") return "ಗಜಕೇಸರಿ ಮಹಾರಾಜಯೋಗ";
    if (baseLang === "hi") return "गजकेसरी राजयोग";
    if (baseLang === "te") return "గజకేసరి రాజయోగం";
    if (baseLang === "ta") return "கஜகேசரி ராஜயோகம்";
  }

  if (lower.includes("budhaditya") || lower.includes("ಬುಧಾದಿತ್ಯ") || lower.includes("बुधादित्य") || lower.includes("బుధాదిత్య") || lower.includes("புதாதித்ய")) {
    if (baseLang === "kn") return "ಬುಧಾದಿತ್ಯ ಜ್ಞಾನ ಯೋಗ";
    if (baseLang === "hi") return "बुधादित्य योग";
    if (baseLang === "te") return "బుధాదిత్య యోగం";
    if (baseLang === "ta") return "புதாதித்ய யோகம்";
  }

  if (lower.includes("amala") || lower.includes("ಅಮಲ") || lower.includes("अमल") || lower.includes("అమల") || lower.includes("அமல")) {
    if (baseLang === "kn") return "ಅಮಲ ಕೀರ್ತಿ ಯೋಗ";
    if (baseLang === "hi") return "अमल कीर्ति योग";
    if (baseLang === "te") return "అమల కీర్తి యోగం";
    if (baseLang === "ta") return "அமல கீர்த்தி யோகம்";
  }

  if (lower.includes("ruchaka") || lower.includes("ರುಚಕ") || lower.includes("रुचक") || lower.includes("రుచక") || lower.includes("ருசக")) {
    if (baseLang === "kn") return "ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ";
    if (baseLang === "hi") return "रुचक महापुरुष योग";
    if (baseLang === "te") return "రుచక మహాపురుష యోగం";
    if (baseLang === "ta") return "ருசக மகாபுருஷ யோகம்";
  }

  if (lower.includes("bhadra") || lower.includes("ಭದ್ರ") || lower.includes("भद्र") || lower.includes("భద్ర") || lower.includes("பத்ர")) {
    if (baseLang === "kn") return "ಭದ್ರ ಮಹಾಪುರುಷ ಯೋಗ";
    if (baseLang === "hi") return "भद्र महापुरुष योग";
    if (baseLang === "te") return "భద్ర మహాపురుష యోగం";
    if (baseLang === "ta") return "பத்ர மகாபுருஷ யோகம்";
  }

  if (lower.includes("hamsa") || lower.includes("ಹಂಸ") || lower.includes("हंस") || lower.includes("హంస") || lower.includes("ஹம்ச")) {
    if (baseLang === "kn") return "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ";
    if (baseLang === "hi") return "हंस महापुरुष योग";
    if (baseLang === "te") return "హంస మహాపురుష యోగం";
    if (baseLang === "ta") return "ஹம்ச மகாபுருஷ யோகம்";
  }

  if (lower.includes("malavya") || lower.includes("ಮಾಲವ್ಯ") || lower.includes("मालव्य") || lower.includes("మాలవ్య") || lower.includes("மாளவ்ய")) {
    if (baseLang === "kn") return "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ";
    if (baseLang === "hi") return "मालव्य महापुरुष योग";
    if (baseLang === "te") return "మాలవ్య మహాపురుష యోగం";
    if (baseLang === "ta") return "மாளவ்ய மகாபுருஷ யோகம்";
  }

  if (lower.includes("shasha") || lower.includes("sasa") || lower.includes("ಶಶ") || lower.includes("शश") || lower.includes("శశ") || lower.includes("சச")) {
    if (baseLang === "kn") return "ಶಶ ಮಹಾಪುರುಷ ಯೋಗ";
    if (baseLang === "hi") return "शश महापुरुष योग";
    if (baseLang === "te") return "శశ మహాపురుష యోగం";
    if (baseLang === "ta") return "சச மகாபுருஷ யோகம்";
  }

  if (lower.includes("chandra mangala") || lower.includes("ಚಂದ್ರ ಮಂಗಳ") || lower.includes("चंद्र मंगल") || lower.includes("చంద్ర మంగళ") || lower.includes("சந்திர மங்கள")) {
    if (baseLang === "kn") return "ಚಂದ್ರ ಮಂಗಳ ಧನಯೋಗ";
    if (baseLang === "hi") return "चंद्र मंगल धनयोग";
    if (baseLang === "te") return "చంద్ర మంగళ ధనయోగం";
    if (baseLang === "ta") return "சந்திர மங்கள தனயோகம்";
  }

  if (lower.includes("lakshmi") || lower.includes("ಲಕ್ಷ್ಮೀ") || lower.includes("लक्ष्मी") || lower.includes("లక్ష్మీ") || lower.includes("லட்சுமி")) {
    if (baseLang === "kn") return "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಯೋಗ";
    if (baseLang === "hi") return "श्री महालक्ष्मी योग";
    if (baseLang === "te") return "శ్రీ మహాలక్ష్మీ యోగం";
    if (baseLang === "ta") return "ஸ்ரீ மகாலட்சுமி யோகம்";
  }

  if (lower.includes("saraswati") || lower.includes("ಸರಸ್ವತೀ") || lower.includes("सरस्वती") || lower.includes("సరస్వతీ") || lower.includes("சரஸ்வதி")) {
    if (baseLang === "kn") return "ಸರಸ್ವತೀ ಜ್ಞಾನ ಯೋಗ";
    if (baseLang === "hi") return "सरस्वती ज्ञान योग";
    if (baseLang === "te") return "సరస్వతీ జ్ఞాన యోగం";
    if (baseLang === "ta") return "சரஸ்வதி ஞான யோகம்";
  }

  if (lower.includes("obhayachari") || lower.includes("ubhayachari") || lower.includes("ಉಭಯಚಾರಿ") || lower.includes("उभयचारी") || lower.includes("ఉభయచారి") || lower.includes("உபயசாரி")) {
    if (baseLang === "kn") return "ಉಭಯಚಾರಿ ಶುಭ ಯೋಗ";
    if (baseLang === "hi") return "उभयचारी शुभ योग";
    if (baseLang === "te") return "ఉభయచారి శుభ యోగం";
    if (baseLang === "ta") return "உபயசாரி சுப யோகம்";
  }

  if (lower.includes("vasi") || lower.includes("ವಾಸಿ") || lower.includes("वासी") || lower.includes("వాసి") || lower.includes("வாசி")) {
    if (baseLang === "kn") return "ವಾಸಿ ಶುಭ ಯೋಗ";
    if (baseLang === "hi") return "वासी शुभ योग";
    if (baseLang === "te") return "వాసి శుభ యోగం";
    if (baseLang === "ta") return "வாசி சுப யோகம்";
  }

  if (lower.includes("vesi") || lower.includes("ವೇಸಿ") || lower.includes("वेसी") || lower.includes("వేసి") || lower.includes("வேசி")) {
    if (baseLang === "kn") return "ವೇಸಿ ಶುಭ ಯೋಗ";
    if (baseLang === "hi") return "वेसी शुभ योग";
    if (baseLang === "te") return "వేసి శుభ యోగం";
    if (baseLang === "ta") return "வேசி சுப யோகம்";
  }

  if (lower.includes("sunapha") || lower.includes("ಸುನಫಾ") || lower.includes("सुनफा") || lower.includes("సునఫా") || lower.includes("சுனபா")) {
    if (baseLang === "kn") return "ಸುನಫಾ ಶುಭ ಯೋಗ";
    if (baseLang === "hi") return "सुनफा शुभ योग";
    if (baseLang === "te") return "సునఫా శుభ యోగం";
    if (baseLang === "ta") return "சுனபா சுப யோகம்";
  }

  if (lower.includes("anapha") || lower.includes("ಅನಫಾ") || lower.includes("अनफा") || lower.includes("అనఫా") || lower.includes("அனபா")) {
    if (baseLang === "kn") return "ಅನಫಾ ಶುಭ ಯೋಗ";
    if (baseLang === "hi") return "अनफा शुभ योग";
    if (baseLang === "te") return "అనఫా శుభ యోగం";
    if (baseLang === "ta") return "அனபா சுப யோகம்";
  }

  if (lower.includes("viparita") || lower.includes("ವಿಪರೀತ") || lower.includes("विपरीत") || lower.includes("విపరీత") || lower.includes("விபரீத")) {
    if (baseLang === "kn") return "ವಿಪರೀತ ರಾಜಯೋಗ";
    if (baseLang === "hi") return "विपरीत राजयोग";
    if (baseLang === "te") return "విపరీత రాజయోగం";
    if (baseLang === "ta") return "விபரீத ராஜயோகம்";
  }

  if (lower.includes("dhana") || lower.includes("ಧನ") || lower.includes("धन") || lower.includes("ధన") || lower.includes("தன")) {
    if (baseLang === "kn") return "ಧನ ಸಮೃದ್ಧಿ ಯೋಗ";
    if (baseLang === "hi") return "धन समृद्धि योग";
    if (baseLang === "te") return "ధన సమృద్ధి యోగం";
    if (baseLang === "ta") return "தன சுபிட்ச யோகம்";
  }

  if (lower.includes("raja") || lower.includes("ರಾಜ") || lower.includes("राज") || lower.includes("రాజ") || lower.includes("ராஜ")) {
    if (baseLang === "kn") return "ಶ್ರೇಷ್ಠ ರಾಜಯೋಗ";
    if (baseLang === "hi") return "श्रेष्ठ राजयोग";
    if (baseLang === "te") return "శ్రేష్ఠ రాజయోగం";
    if (baseLang === "ta") return "உன்னத ராஜயோகம்";
  }

  if (lower.includes("dasha") || lower.includes("ದಶಾ") || lower.includes("दशा") || lower.includes("దశ") || lower.includes("தசை")) {
    if (baseLang === "kn") return "ದಶಾ ಅನುಕೂಲ ಯೋಗ";
    if (baseLang === "hi") return "दशा अनुकूल योग";
    if (baseLang === "te") return "దశా అనుకూల యోగం";
    if (baseLang === "ta") return "தசா சாதக யோகம்";
  }

  if (/[\u0900-\u0D7F]/.test(name)) {
    return cleanEnglishFromRegionalText(name, baseLang);
  }

  if (/[a-zA-Z]/.test(name)) {
    return transliterateName(name, baseLang);
  }

  if (baseLang === "kn") return "ವಿಶೇಷ ಗ್ರಹ ಯೋಗ";
  if (baseLang === "hi") return "विशेष ग्रह योग";
  if (baseLang === "te") return "విశేష గ్రహ యోగం";
  if (baseLang === "ta") return "விசேட கிரக யோகம்";
  return name;
}

/**
 * Localizes any Dosha title into pure Indic script for kn, hi, te, ta, and en.
 * Guarantees zero Latin / English letter leakage into regional language reports.
 */
export function localizeDoshaName(name: string, lang: string): string {
  if (!name) return "";
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "en") return name;
  const lower = name.toLowerCase();

  if (lower.includes("kuja") || lower.includes("manglik") || lower.includes("ಕುಜ") || lower.includes("कुज") || lower.includes("మాంగ్లిక") || lower.includes("செவ்வாய்") || lower.includes("குஜ")) {
    if (baseLang === "kn") return "ಕುಜ (ಮಂಗಳ) ದೋಷ";
    if (baseLang === "hi") return "कुज (मांगलिक) दोष";
    if (baseLang === "te") return "కుజ (మాంగ్లిక) దోషం";
    if (baseLang === "ta") return "செவ்வாய் (குஜ) தோஷம்";
  }

  if (lower.includes("kemadruma") || lower.includes("ಕೇಮದ್ರುಮ") || lower.includes("केमद्रुम") || lower.includes("కేమద్రుమ") || lower.includes("கேமத்ரும")) {
    if (baseLang === "kn") return "ಕೇಮದ್ರುಮ ದೋಷ";
    if (baseLang === "hi") return "केमद्रुम दोष";
    if (baseLang === "te") return "కేమద్రుమ దోషం";
    if (baseLang === "ta") return "கேமத்ரும தோஷம்";
  }

  if (lower.includes("kala sarpa") || lower.includes("kalasarpa") || lower.includes("sarpa") || lower.includes("ಸರ್ಪ") || lower.includes("सर्प") || lower.includes("సర్ప") || lower.includes("சர்ப்ப")) {
    if (baseLang === "kn") return "ಕಾಲಸರ್ಪ / ಸರ್ಪ ದೋಷ";
    if (baseLang === "hi") return "कालसर्प / सर्प दोष";
    if (baseLang === "te") return "కాలసర్ప / సర్ప దోషం";
    if (baseLang === "ta") return "காலசர்ப்ப / சர்ப்ப தோஷம்";
  }

  if (lower.includes("rahu") || lower.includes("ketu") || lower.includes("ರಾಹು") || lower.includes("ಕೇತು") || lower.includes("राहु") || lower.includes("केतु") || lower.includes("రాహు") || lower.includes("కేతు") || lower.includes("ராகு") || lower.includes("கேது")) {
    if (baseLang === "kn") return "ರಾಹು-ಕೇತು ಪೀಡಾ ದೋಷ";
    if (baseLang === "hi") return "राहु-केतु पीड़ा दोष";
    if (baseLang === "te") return "రాహు-కేతు పీడా దోషం";
    if (baseLang === "ta") return "ராகு-கேது பீடை தோஷம்";
  }

  if (lower.includes("pitru") || lower.includes("ಪಿತೃ") || lower.includes("पितृ") || lower.includes("పితృ") || lower.includes("பித்ரு")) {
    if (baseLang === "kn") return "ಪಿತೃ ದೋಷ";
    if (baseLang === "hi") return "पितृ दोष";
    if (baseLang === "te") return "పితృ దోషం";
    if (baseLang === "ta") return "பித்ரு தோஷம்";
  }

  if (lower.includes("guru chandal") || lower.includes("chandal") || lower.includes("ಚಾಂಡಾಲ") || lower.includes("चांडाल") || lower.includes("చాండాల") || lower.includes("சண்டாள")) {
    if (baseLang === "kn") return "ಗುರು ಚಾಂಡಾಲ ದೋಷ";
    if (baseLang === "hi") return "गुरु चांडाल दोष";
    if (baseLang === "te") return "గురు చాండాల దోషం";
    if (baseLang === "ta") return "குரு சண்டாள தோஷம்";
  }

  if (lower.includes("grahan") || lower.includes("ಗ್ರಹಣ") || lower.includes("ग्रहण") || lower.includes("గ్రహణ") || lower.includes("கிரகண")) {
    if (baseLang === "kn") return "ಗ್ರಹಣ ದೋಷ";
    if (baseLang === "hi") return "ग्रहण दोष";
    if (baseLang === "te") return "గ్రహణ దోషం";
    if (baseLang === "ta") return "கிரகண தோஷம்";
  }

  if (lower.includes("sade sati") || lower.includes("kantaka") || lower.includes("shani") || lower.includes("ಶನಿ") || lower.includes("शनि") || lower.includes("శని") || lower.includes("சனி")) {
    if (baseLang === "kn") return "ಶನಿ ಸಾಡೇಸಾತಿ ಪ್ರಭಾವ";
    if (baseLang === "hi") return "शनि साढ़ेसाती प्रभाव";
    if (baseLang === "te") return "శని సాడేసాతి ప్రభావం";
    if (baseLang === "ta") return "சனி ஏழரைச் சனி தாக்கம்";
  }

  if (/[\u0900-\u0D7F]/.test(name)) {
    return cleanEnglishFromRegionalText(name, baseLang);
  }

  if (/[a-zA-Z]/.test(name)) {
    return transliterateName(name, baseLang);
  }

  if (baseLang === "kn") return "ಕರ್ಮಿಕ ಸವಾಲು ಹಾಗೂ ಪರಿಹಾರ";
  if (baseLang === "hi") return "कर्मिक चुनौती एवं परिहार";
  if (baseLang === "te") return "కర్మిక సవాలు మరియు పరిహారం";
  if (baseLang === "ta") return "கர்ம சவால் மற்றும் பரிகாரம்";
  return name;
}

/**
 * Localizes any Gochara title into pure Indic script for kn, hi, te, ta, and en.
 * Guarantees zero Latin / English letter leakage into regional language reports.
 */
export function localizeGocharaName(name: string, lang: string): string {
  if (!name) return "";
  const baseLang = (lang || "en").split("-")[0];
  if (baseLang === "en") return name;
  const lower = name.toLowerCase();

  if (lower.includes("saturn") || lower.includes("shani") || lower.includes("ಶನಿ") || lower.includes("शनि") || lower.includes("శని") || lower.includes("சனி")) {
    if (baseLang === "kn") return "ಶನಿ ಭಗವಾನರ ಗೋಚಾರ ಫಲ";
    if (baseLang === "hi") return "शनि देव का गोचर फल";
    if (baseLang === "te") return "శని భగవానుని గోచార ఫలితం";
    if (baseLang === "ta") return "சனி பகவானின் கோசார பலன்";
  }

  if (lower.includes("jupiter") || lower.includes("guru") || lower.includes("ಗುರು") || lower.includes("ಬೃಹಸ್ಪತಿ") || lower.includes("बृहस्पति") || lower.includes("బృహస్పతి") || lower.includes("பிரகஸ்பதி") || lower.includes("குரு")) {
    if (baseLang === "kn") return "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಗೋಚಾರ ಫಲ";
    if (baseLang === "hi") return "देवगुरु बृहस्पति गोचर फल";
    if (baseLang === "te") return "దేవగురు బృహస్పతి గోచార ఫలితం";
    if (baseLang === "ta") return "தேவகுரு பிரகஸ்பதி கோசார பலன்";
  }

  if (lower.includes("rahu") || lower.includes("ketu") || lower.includes("ರಾಹು") || lower.includes("ಕೇತು") || lower.includes("राहु") || lower.includes("केतु") || lower.includes("రాహు") || lower.includes("కేతు") || lower.includes("ராகு") || lower.includes("கேது")) {
    if (baseLang === "kn") return "ರಾಹು-ಕೇತು ಛಾಯಾಗ್ರಹ ಗೋಚಾರ ಫಲ";
    if (baseLang === "hi") return "राहु-केतु छायाग्रह गोचर फल";
    if (baseLang === "te") return "రాహు-కేతు ఛాయాగ్రహ గోచార ఫలితం";
    if (baseLang === "ta") return "ராகு-கேது நிழல் கிரக கோசார பலன்";
  }

  if (/[\u0900-\u0D7F]/.test(name)) {
    return cleanEnglishFromRegionalText(name, baseLang);
  }

  if (/[a-zA-Z]/.test(name)) {
    return transliterateName(name, baseLang);
  }

  if (baseLang === "kn") return "ಪ್ರಮುಖ ಗ್ರಹ ಗೋಚಾರ ಫಲ";
  if (baseLang === "hi") return "प्रमुख ग्रह गोचर फल";
  if (baseLang === "te") return "ప్రముఖ గ్రహ గోచార ఫలితం";
  if (baseLang === "ta") return "முக்கிய கிரக கோசார பலன்";
  return name;
}

/**
 * Localizes any Dosha Remedy into pure, authentic classical Vedic Parihara.
 * Guarantees zero Latin/English leak, avoids any stripped ": 7 × .." garble,
 * and tailors remedies accurately for married vs unmarried status.
 */
export function localizeDoshaRemedy(
  doshaName: string,
  rawRemedy: string | undefined,
  lang: string,
  maritalStatus: string = "general"
): string {
  const baseLang = (lang || "en").split("-")[0];
  const lower = (doshaName || "").toLowerCase();
  const isMarried = maritalStatus === "married";

  if (baseLang === "en") {
    if (rawRemedy && rawRemedy.trim().length > 15 && !rawRemedy.includes("Sorry, I encountered") && !rawRemedy.includes("undefined")) {
      return rawRemedy.trim();
    }
    if (lower.includes("kuja") || lower.includes("manglik") || lower.includes("mangal")) {
      return isMarried
        ? "To maintain marital harmony and pacify Mars energy, recite Sri Subramanya Ashtaka on Tuesdays. Perform Mangala Gowri Pooja or offer archana at Kukke Subramanya or Gokarna Mahabaleshwara Kshetra during Shukla Paksha Sashti for domestic tranquility."
        : "To pacify Kuja Dosha and remove marriage alliance obstacles, chant 'Om Shreem Gauryai Namah' 108 times daily. Performing Subramanya Homa or visiting Kukke Subramanya Temple on Tuesdays during Shukla Paksha brings auspicious alliance blessings.";
    }
    if (lower.includes("kala sarpa") || lower.includes("kalasarpa") || lower.includes("sarpa") || lower.includes("rahu") || lower.includes("ketu")) {
      return "Chant the Maha Mrityunjaya Mantra 108 times daily during morning sandhya. Sponsoring Kala Sarpa Shanti or Sarpa Samskara at Gokarna Kotiteertha or Sri Kalahasti pacifies nodal distress and unblocks major life endeavors.";
    }
    if (lower.includes("kemadruma")) {
      return "Perform milk abhishekam to Lord Shiva on Mondays to strengthen Chandra. Observing Sri Satyanarayana Vratha on Poornima (Full Moon) and donating white grains or milk promotes emotional tranquility and financial stability.";
    }
    if (lower.includes("guru") || lower.includes("chandal") || lower.includes("chandala")) {
      return "Recite Sri Dakshinamurthy Stotram on Thursday mornings and offer yellow chana dal to elders or temple deities. Seeking blessings of preceptors and practicing ethical clarity transforms planetary adversity into wisdom.";
    }
    return "Perform Navagraha Shanti Homa once a year on your Janma Nakshatra day, and light sesame oil lamps for Lord Shiva or Sri Mahabaleshwara on Saturdays.";
  }

  // If rawRemedy already has substantial native Indic text (at least 25 Indic chars) and no English letters
  if (rawRemedy && rawRemedy.trim().length > 25 && /[\u0900-\u0D7F]/.test(rawRemedy) && !/[a-zA-Z]{2,}/.test(rawRemedy)) {
    const cleaned = cleanEnglishFromRegionalText(rawRemedy, baseLang);
    if (cleaned.length > 20) return cleaned;
  }

  // Pure Classical Localized Vedic Remedies
  if (lower.includes("kuja") || lower.includes("manglik") || lower.includes("mangal") || lower.includes("ಕುಜ") || lower.includes("कुज") || lower.includes("మాంగ్లిక") || lower.includes("செவ்வாய்")) {
    if (isMarried) {
      if (baseLang === "kn") return "ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ಕುಜ ದೋಷ ಶಾಂತಿಗಾಗಿ ಪ್ರತಿ ಮಂಗಳವಾರ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಷ್ಟಕ ಅಥವಾ ಮಂಗಳ ಗೌರಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ. ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಕುಕ್ಕೆ ಸುಬ್ರಹ್ಮಣ್ಯ ಅಥವಾ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಕ್ಷೀರಾಭಿಷೇಕ ಮತ್ತು ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸುವುದು ದಾಂಪತ್ಯದಲ್ಲಿ ಶಾಶ್ವತ ಪ್ರೀತಿ ಮತ್ತು ಸೌಹಾರ್ದತೆಯನ್ನು ಕಾಪಾಡುತ್ತದೆ.";
      if (baseLang === "hi") return "दांपत्य सौहार्द एवं कुज दोष शांति हेतु प्रति मंगलवार श्री सुब्रह्मण्य अष्टक अथवा हनुमान चालीसा का पाठ करें। शुक्ल पक्ष के मंगलवार को कुक्के सुब्रह्मण्य अथवा गोकर्ण महाबलेश्वर क्षेत्र में मंगला गौरी पूजन एवं अभिषेक कराने से वैवाहिक जीवन में सुख, शांति और परस्पर विश्वास सुदृढ़ होता है।";
      if (baseLang === "te") return "దాంపత్య సౌఖ్యం మరియు కుజ దోష నివారణ కొరకు ప్రతి మంగళవారం శ్రీ సుబ్రహ్మణ్య అష్టకం లేదా మంగళ గౌరీ స్తోత్రం పఠించండి. కుక్కే సుబ్రహ్మణ్య లేదా గోకర్ణ క్షేత్రంలో క్షీరాభిషేకం నిర్వహించడం వల్ల దాంపత్య బంధంలో శాంతి, అన్యోన్యత వృద్ధి చెందుతాయి.";
      if (baseLang === "ta") return "குடும்ப ஒற்றுமை மற்றும் செவ்வாய் தோஷ நிவர்த்திக்காக ஒவ்வொரு செவ்வாய்க்கிழமையும் ஸ்ரீ சுப்பிரமணியர் அஷ்டகம் பாராயணம் செய்யுங்கள். சுப தினங்களில் குக்கே சுப்பிரமணியா அல்லது கோகர்ணம் திருத்தலத்தில் மங்கள கௌரி பூஜை மற்றும் அபிஷேகம் செய்வது தம்பதியரிடையே அன்பையும் அமைதியையும் நிலைநிறுத்தும்.";
    } else {
      if (baseLang === "kn") return "ಶೀಘ್ರ ಕಲ್ಯಾಣ ಪ್ರಾಪ್ತಿ ಹಾಗೂ ಕುಜ ದೋಷ ಶಾಂತಿಗಾಗಿ ಪ್ರತಿ ಮಂಗಳವಾರ 'ಓಂ ಶ್ರೀಂ ಗೌರ್ಯೈ ನಮಃ' ಮಂತ್ರ ಜಪಿಸಿ. ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಕುಕ್ಕೆ ಸುಬ್ರಹ್ಮಣ್ಯ ಕ್ಷೇತ್ರ ಅಥವಾ ಸಮೀಪದ ಸುಬ್ರಹ್ಮಣ್ಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸುಬ್ರಹ್ಮಣ್ಯ ಹೋಮ ಅಥವಾ ಮೃತ್ತಿಕಾ ಸೇವೆ ಮಾಡಿಸುವುದು ಕಲ್ಯಾಣ ಕಾರ್ಯಗಳ ವಿಳಂಬವನ್ನು ನಿವಾರಿಸುತ್ತದೆ.";
      if (baseLang === "hi") return "शीघ्र विवाह योग एवं मंगल दोष शांति हेतु प्रति मंगलवार 'ॐ श्रीं गौर्यै नमः' का जप करें। शुक्ल पक्ष के मंगलवार को कुक्के सुब्रह्मण्य अथवा कार्तिकेय मंदिर में सुब्रह्मण्य होम कराने से विवाह में आने वाली बाधाएं समाप्त होती हैं।";
      if (baseLang === "te") return "శీఘ్ర వివాహ ప్రాప్తి కొరకు ప్రతి మంగళవారం 'ఓం శ్రీం గౌర్యై నమః' జపించండి. కుక్కే సుబ్రహ్మణ్య లేదా ఘాటీ సుబ్రహ్మణ్య క్షేత్రంలో సుబ్రహ్మణ్య హోమం చేయించడం వల్ల వివాహ యోగం త్వరగా సిద్ధిస్తుంది.";
      if (baseLang === "ta") return "விரைவில் திருமண வரம் பெற ஒவ்வொரு செவ்வாய்க்கிழமையும் 'ஓம் ஸ்ரீம் கௌர்யை நமஹ' ஜெபியுங்கள். குக்கே சுப்பிரமணியா அல்லது திருச்செந்தூர் முருகன் சந்நிதியில் சுப்பிரமணிய ஹோமம் செய்வது சகல தடைகளையும் போக்கும்.";
    }
  }

  if (lower.includes("kala sarpa") || lower.includes("kalasarpa") || lower.includes("sarpa") || lower.includes("ಸರ್ಪ") || lower.includes("सर्प") || lower.includes("సర్ప") || lower.includes("சர்ப்ப") || lower.includes("rahu") || lower.includes("ketu") || lower.includes("ರಾಹು") || lower.includes("ಕೇತು")) {
    if (baseLang === "kn") return "ರಾಹು-ಕೇತು ಹಾಗೂ ಸರ್ಪ ದೋಷ ಶಾಂತಿಗಾಗಿ ನಿತ್ಯ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಿಸಿ. ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಅಥವಾ ಶ್ರೀಕಾಳಹಸ್ತಿ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸರ್ಪ ಸಂಸ್ಕಾರ ಅಥವಾ ನಾಗ ಪ್ರತಿಷ್ಠಾಪನೆ ನೆರವೇರಿಸುವುದು ಜೀವನದ ಸಕಲ ಅಡೆತಡೆಗಳನ್ನು ನಿವಾರಿಸಿ ಅಭಿವೃದ್ಧಿ ತರುತ್ತದೆ.";
    if (baseLang === "hi") return "राहु-केतु एवं सर्प दोष शांति हेतु प्रतिदिन महामृत्युंजय मंत्र का जप करें। गोकर्ण के कोटितीर्थ अथवा कालहस्ती क्षेत्र में कालसर्प शांति एवं रुद्राभिषेक संपन्न कराने से जीवन के सभी अवरोध समाप्त होकर मार्ग प्रशस्त होता है।";
    if (baseLang === "te") return "రాహు-కేతు దోష నివారణకు రోజూ మహా మృత్యుంజయ మంత్రం జపించండి. గోకర్ణ కోటితీర్థం లేదా శ్రీకాళహస్తి క్షేత్రంలో కాలసర్ప శాంతి మరియు రుద్రాభిషేకం నిర్వహించడం సర్వశుభకరం.";
    if (baseLang === "ta") return "ராகு-கேது தோஷ நிவர்த்திக்கு தினமும் மகா மிருத்யுஞ்சய மந்திரம் ஜெபியுங்கள். கோகர்ணம் அல்லது காளஹஸ்தி திருத்தலத்தில் சர்ப்ப சாந்தி மற்றும் ருத்ராபிஷேகம் செய்வது தடைகளை நீக்கி வெற்றியைத் தரும்.";
  }

  if (lower.includes("kemadruma") || lower.includes("ಕೇಮದ್ರುಮ") || lower.includes("केमद्रुम") || lower.includes("కేమద్రుమ") || lower.includes("கேமத்ரும")) {
    if (baseLang === "kn") return "ಚಂದ್ರ ಬಲ ವೃದ್ಧಿಗಾಗಿ ಪ್ರತಿ ಸೋಮವಾರ ಶಿವಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಮಾಡಿ. ಪೌರ್ಣಮಿಯಂದು ಸತ್ಯನಾರಾಯಣ ವ್ರತ ಆಚರಿಸುವುದು ಹಾಗೂ ಬಿಳಿ ಬಣ್ಣದ ವಸ್ತುಗಳು, ಹಾಲು ಅಥವಾ ಅಕ್ಕಿಯನ್ನು ದಾನ ಮಾಡುವುದು ಆರ್ಥಿಕ ಸ್ಥಿರತೆ ಮತ್ತು ಮನಸ್ಸಿಗೆ ನೆಮ್ಮದಿ ನೀಡುತ್ತದೆ.";
    if (baseLang === "hi") return "चंद्रमा को बलवान करने हेतु प्रत्येक सोमवार शिवलिंग पर कच्चा दूध अर्पित करें। पूर्णिमा के दिन सत्यनारायण कथा का श्रवण एवं श्वेत वस्तुओं का दान करने से आर्थिक समृद्धि और मानसिक शांति प्राप्त होती है।";
    if (baseLang === "te") return "చంద్ర బలాన్ని పెంపొందించుకోవడానికి సోమవారం శివునికి క్షీరాభిషేకం చేయండి. పౌర్ణమి నాడు శ్రీ సత్యనారాయణ వ్రతం ఆచరించడం మరియు తెలుపు రంగు వస్తువులను దానం చేయడం ఉత్తమ ఫలితాలను ఇస్తుంది.";
    if (baseLang === "ta") return "சந்திர பலம் பெற திங்கட்கிழமைகளில் சிவபெருமானுக்கு பாலாபிஷேகம் செய்யுங்கள். பௌர்ணமி தினத்தில் சத்யநாராயண பூஜை செய்வதும், வெண்ணிறப் பொருட்களை தானம் செய்வதும் மன அமைதியையும் செல்வ வளத்தையும் தரும்.";
  }

  if (lower.includes("guru") || lower.includes("chandal") || lower.includes("chandala") || lower.includes("ಗುರು") || lower.includes("चांडाल") || lower.includes("చాండాల") || lower.includes("சண்டாள")) {
    if (baseLang === "kn") return "ಗುರು ಕೃಪೆ ಪ್ರಾಪ್ತಿಗಾಗಿ ಪ್ರತಿ ಗುರುವಾರ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಅಥವಾ ಗುರು ಚರಿತ್ರೆ ಅಧ್ಯಯನ ಮಾಡಿ. ಶೃಂಗೇರಿ ಶಾರದಾ ಪೀಠ ಅಥವಾ ಸಮೀಪದ ಗುರು ಸನ್ನಿಧಿಯಲ್ಲಿ ಗುರು ಶಾಂತಿ ಸೇವೆ ಸಲ್ಲಿಸಿ ಕಡಲೆಕಾಳು ಹಾಗೂ ಹಳದಿ ಹೂವುಗಳನ್ನು ಸಮರ್ಪಿಸುವುದು ಸಕಲ ಸನ್ಮಂಗಳವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.";
    if (baseLang === "hi") return "गुरु ग्रह के शुभ प्रभाव हेतु प्रति गुरुवार श्री गुरु पादुका स्तोत्र का पाठ करें तथा पीले पुष्प व चने की दाल भगवान विष्णु को अर्पित करें। गुरुजनों एवं माता-पिता का सम्मान करने से भाग्य में वृद्धि होती है।";
    if (baseLang === "te") return "గురు అనుగ్రహం కొరకు గురువారం దక్షణామూర్తి స్తోత్రం పఠించండి. శృంగేరి శారదా పీఠం లేదా గురు రాఘవేంద్ర స్వామి సన్నిధిలో గురు శాంతి పూజ నిర్వహించడం జ్ఞానాన్ని, ఉన్నత అభివృద్ధిని కలిగిస్తుంది.";
    if (baseLang === "ta") return "குரு பகவானின் அருள் பெற வியாழக்கிழமைகளில் தட்சிணாமூர்த்தி வழிபாடு செய்யுங்கள். மஞ்சள் நிற மலர்கள் மற்றும் கொண்டைக்கடலை சமர்ப்பித்து வழிபடுவது குடும்பத்தில் அமைதியையும் அறிவையும் பெருக்கும்.";
  }

  // Default Universal Vedic Upasana
  if (baseLang === "kn") return "ದೋಷ ಶಾಂತಿ ಹಾಗೂ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿಗಾಗಿ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನದಂದು ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅಥವಾ ಕುಲದೇವತಾ ಸನ್ನಿಧಿಯಲ್ಲಿ ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ. ನಿತ್ಯ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಹಾಗೂ ಗಾಯತ್ರಿ ಜಪವು ಸರ್ವರೀತಿಯ ಗ್ರಹ ಪೀಡೆಗಳನ್ನು ಪರಿಹರಿಸುತ್ತದೆ.";
  if (baseLang === "hi") return "दोष शांति एवं मनोकामना सिद्धि हेतु जन्म नक्षत्र के दिन गोकर्ण महाबलेश्वर अथवा कुलदेवता मंदिर में नवग्रह शांति एवं रुद्राभिषेक कराएं। नित्य सूर्य नमस्कार एवं गायत्री जप से सभी प्रकार की ग्रह पीड़ाएं शांत होती हैं।";
  if (baseLang === "te") return "దోష శాంతి కొరకు జన్మ నక్షత్రం నాడు గోకర్ణ మహాబలేశ్వర లేదా కులదైవ సన్నిధిలో నవగ్రహ శాంతి మరియు రుద్రాభిషేకం నిర్వహించండి. రోజూ సూర్య నమస్కారాలు చేయడం వల్ల గ్రహ దోషాలు తొలగిపోతాయి.";
  if (baseLang === "ta") return "தோஷ நிவர்த்திக்கு உங்கள் ஜென்ம நட்சத்திர நாளில் கோகர்ணம் அல்லது குலதெய்வ கோவிலில் நவக்கிரக சாந்தி மற்றும் ருத்ராபிஷேகம் செய்யுங்கள். தினமும் சூரிய நமஸ்காரம் செய்வது சகல கிரக தோஷங்களையும் போக்கும்.";
  return "Perform Navagraha Shanti and Rudrabhishekam on your Janma Nakshatra day at a sacred kshetra, and practice daily morning prayer.";
}
