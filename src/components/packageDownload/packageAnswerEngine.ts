import { askGemini } from "../../core/GeminiEngine";
import type { KundliOutput } from "../../core/AstroTypes";
import { PlanetName } from "../../core/AstroTypes";
import { generateSmartQuestionHeader } from "../RamanBhavishya/BhavishyaView";
import type { PackageQuestionItem } from "./DivyaBhavishyaQnaPdfTemplate";
import type { PackageLang } from "./packageDownloadLocale";

/**
 * Builds localized prompt context for astrological question answering.
 */
function buildAstrologicalContext(
  kundli: KundliOutput,
  devoteeName: string,
  birthDate: string,
  birthTime: string,
  placeLabel: string,
  lang: PackageLang
): string {
  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const lagna = kundli.lagnaRashi?.sanskrit || "Mesha";
  const moon = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const nakshatra = moonPlanet?.nakshatra?.sanskrit || "Ashwini";
  const pada = kundli.moonPada || 1;

  const planetPlacements = kundli.planets
    .map((p) => `${p.name} in ${p.rashi.sanskrit} (House ${p.house}${p.isExalted ? ", Exalted" : p.isDebilitated ? ", Debilitated" : ""}${p.isRetrograde ? ", Retrograde" : ""})`)
    .join("; ");

  return `
Devotee Profile:
Name: ${devoteeName}
Birth Date: ${birthDate}
Birth Time: ${birthTime}
Place: ${placeLabel}
Ascendant (Lagna): ${lagna}
Moon Sign (Rashi): ${moon}
Birth Star (Nakshatra): ${nakshatra} (Pada ${pada})
Planetary Placements: ${planetPlacements}

Instruction:
You are an expert, compassionate Vedic Astrologer following classical Parashari and Baggona Panchanga principles.
Provide a strictly authentic 4-paragraph answer formatted as JSON:
{
  "paragraph1": "House & Natal Chart Analysis: Analyze which house governs this question, the house lord's dignity and planetary aspects.",
  "paragraph2": "Dasha & Transits: Analyze the current Vimshottari Dasha period and live transits (Guru, Shani, Rahu).",
  "paragraph3": "Prediction & Timing Window: Give clear, comforting, realistic timing and outcome for the question.",
  "paragraph4": "Vedic Remedies: Prescribe specific deity prayers, mantras (Gayatri/Beeja), temple visits (e.g. Gokarna Mahabaleshwara), and charity."
}
Language Requirement: Output pure native text in ${lang === "kn" ? "Kannada (ಕನ್ನಡ)" : lang === "hi" ? "Hindi (हिन्दी)" : lang === "te" ? "Telugu (తెలుగు)" : lang === "ta" ? "Tamil (தமிழ்)" : "English"}.
`;
}

/**
 * Robust fallback generator when Gemini API key is unavailable or during rate limits.
 */
function buildFallbackAnswer(
  topicId: string,
  questionText: string,
  kundli: KundliOutput,
  devoteeName: string,
  lang: PackageLang
): { paragraph1: string; paragraph2: string; paragraph3: string; paragraph4: string } {
  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  const moonPlanet = kundli.planets.find((p) => p.name === PlanetName.Moon);
  const moonRashi = kundli.moonSign?.sanskrit || moonPlanet?.rashi?.sanskrit || "Mesha";
  const lagna = kundli.lagnaRashi?.sanskrit || "Mesha";

  if (topicId === "career" || questionText.toLowerCase().includes("job") || questionText.toLowerCase().includes("career")) {
    if (isKn) {
      return {
        paragraph1: `ಜಾತಕರ ಕುಂಡಲಿಯಲ್ಲಿ ${lagna} ಲಗ್ನದಿಂದ ೧೦ನೇ ಭಾವವು ಕರ್ಮ ಹಾಗೂ ಉದ್ಯೋಗ ಸ್ಥಾನವಾಗಿದ್ದು, ೧೦ನೇ ಅಧಿಪತಿ ಮತ್ತು ರವಿ-ಬುಧರ ಸ್ಥಿತಿಯು ವೃತ್ತಿ ಬಲವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ದಶಮಾಧಿಪತಿಯು ಅನುಕೂಲಕರ ಸ್ಥಾನದಲ್ಲಿದ್ದು, ನಿಮ್ಮ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಗೌರವ ಹಾಗೂ ನಾಯಕತ್ವದ ಸಾಮರ್ಥ್ಯವಿದೆ.`,
        paragraph2: `ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾಕಾಲ ಹಾಗೂ ಗೋಚಾರ ಗುರು-ಶನಿಯರ ಪ್ರಭಾವವು ವೃತ್ತಿಪರ ಹೊಸ ಜವಾಬ್ದಾರಿಗಳಿಗೆ ಪೂರಕವಾಗಿದೆ. ಶನಿ ಗೋಚಾರವು ಶ್ರಮವನ್ನು ಪರೀಕ್ಷಿಸಿದರೂ, ಅಂತಿಮವಾಗಿ ಸ್ಥಿರ ಪ್ರಗತಿಯನ್ನು ಕರುಣಿಸಲಿದೆ.`,
        paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೩ ರಿಂದ ೮ ತಿಂಗಳ ಅವಧಿಯಲ್ಲಿ ಉದ್ಯೋಗದಲ್ಲಿ ಬಡ್ತಿ, ಉತ್ತಮ ಸಂಬಳ ಏರಿಕೆ ಅಥವಾ ಅಪೇಕ್ಷಿತ ಸ್ಥಾನ ಬದಲಾವಣೆಯ ಬಲವಾದ ಯೋಗ ಕಂಡುಬರುತ್ತದೆ.`,
        paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಭಾನುವಾರ ಸೂರ್ಯನಾರಾಯಣನಿಗೆ ಅರ್ಘ್ಯ ಸಮರ್ಪಿಸಿ ಮತ್ತು ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆ ಸಲ್ಲಿಸಿ.`
      };
    }
    if (isHi) {
      return {
        paragraph1: `जातक की कुंडली में ${lagna} लग्न से १०वां भाव कर्म एवं करियर का सूचक है। दशमेश की स्थिति कार्यक्षेत्र में अधिकार एवं मान-सम्मान की वृद्धि दर्शाती है।`,
        paragraph2: `वर्तमान दशा एवं गुरु-शनि का गोचर प्रभाव कार्यक्षेत्र में नए दायित्वों एवं आर्थिक लाभ के अनुकूल है।`,
        paragraph3: `सटीक समय सिद्धि: आगामी ३ से ८ माह के अंतराल में पदोन्नति एवं वेतन वृद्धि का प्रबल योग परिलक्षित होता है।`,
        paragraph4: `दैविक उपाय: प्रतिदिन आदित्य हृदय स्तोत्र का पाठ करें तथा गोकर्ण क्षेत्र में रुद्राभिषेक कराएं।`
      };
    }
    if (isTe) {
      return {
        paragraph1: `జాతకుని కుండలిలో ${lagna} లగ్నం నుండి 10వ భావం కర్మ మరియు ఉద్యోగ స్థానం కాగా, 10వ అధిపతి మరియు రవి-బుధుల స్థితి వృత్తి బలాన్ని సూచిస్తుంది. దశమాధిపతి అనుకూలమైన స్థానంలో ఉండి, మీ వృత్తి రంగంలో గౌరవం మరియు నాయకత్వ సామర్థ్యాన్ని ప్రసాదిస్తారు.`,
        paragraph2: `ప్రస్తుతం నడుస్తున్న దశాకాలం మరియు గురు-శనుల గోచార ప్రభావం నూతన ఉద్యోగ బాధ్యతలకు మరియు ఆర్థిక లాభాలకు ఎంతో అనుకూలంగా ఉన్నాయి.`,
        paragraph3: `ఖచ్చితమైన సమయ సిద్ధి: రాబోయే 3 నుండి 8 నెలల కాలంలో ఉద్యోగంలో పదోన్నతి, వేతన పెరుగుదల లేదా కోరుకున్న స్థాన చలనం కలిగే బలమైన యోగం ఉంది.`,
        paragraph4: `దైవిక పరిహారం: ఆదివారం నాడు సూర్య భగవానునికి అర్ఘ్యం సమర్పించండి మరియు శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధిలో రుద్రాభిషేక సేవ ఆచరించండి.`
      };
    }
    if (isTa) {
      return {
        paragraph1: `ஜாதகரின் பிறப்பு அமைப்பில் ${lagna} லக்னத்திலிருந்து 10ஆம் இடம் தொழில் மற்றும் ஜீவன ஸ்தானமாகும். பத்தாம் அதிபதியின் நற்பலனால் தொழில் மேன்மையும் நன்மதிப்பும் கிட்டும்.`,
        paragraph2: `தற்போது நடக்கும் தசா காலம் மற்றும் குரு-சனி சஞ்சார தாக்கம் புதிய பொறுப்புகள் மற்றும் பொருளாதார முன்னேற்றத்திற்கு சாதகமாக உள்ளது.`,
        paragraph3: `துல்லியமான கால நிர்ணயம்: அடுத்த 3 முதல் 8 மாதங்களுக்குள் வேலையில் பதவி உயர்வு, ஊதிய உயர்வு அல்லது விரும்பிய இடமாற்றம் உண்டாகும்.`,
        paragraph4: `தெய்விக பரிகாரம்: ஞாயிற்றுக்கிழமைகளில் சூரிய பகவானை வணங்கி ஆதித்ய ஹிருதய ஸ்தோத்திரம் படிக்கவும்; கோகர்ண மகாபலேஸ்வரர் ஆலயத்தில் ருத்ராபிஷேகம் செய்யவும்.`
      };
    }
    return {
      paragraph1: `In your natal chart with ${lagna} Ascendant, the 10th house governs profession, authority, and status. The placement of the 10th lord indicates strong potential for professional leadership and respect.`,
      paragraph2: `The current operating Vimshottari Dasha and transits of Jupiter and Saturn support taking on higher responsibilities and structured advancement.`,
      paragraph3: `Prediction & Timing: The upcoming 3 to 8 months present a highly promising window for promotion, salary enhancement, or desired career transition.`,
      paragraph4: `Vedic Remedies: Chant Aditya Hridaya Stotra on Sundays and offer prayers at Gokarna Mahabaleshwara temple for career stability.`
    };
  }

  if (topicId === "marriage" || questionText.toLowerCase().includes("marri")) {
    if (isKn) {
      return {
        paragraph1: `ಜಾತಕರ ಕುಂಡಲಿಯಲ್ಲಿ ೭ನೇ ಭಾವವು ಕಳತ್ರ ಹಾಗೂ ವಿವಾಹ ಸ್ಥಾನವಾಗಿದೆ. ಶುಕ್ರ ಮತ್ತು ಗುರು ಗ್ರಹಗಳ ದೃಷ್ಟಿಯು ಸಂಗಾತಿಯ ಸೌಮ್ಯ ಸ್ವಭಾವ, ಸಂಸ್ಕಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಪ್ರೀತಿಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
        paragraph2: `ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾ ಕಾಲವು ಸಪ್ತಮಾಧಿಪತಿಗೆ ಅನುಕೂಲಕರವಾಗಿದ್ದು, ಗುರು ಬಲವು ವಿವಾಹ ಮಾತುಕತೆಗಳಿಗೆ ಸಕಾಲಿಕ ಶಕ್ತಿಯನ್ನು ಒದಗಿಸುತ್ತಿದೆ.`,
        paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೪ ರಿಂದ ೯ ತಿಂಗಳ ಒಳಗೆ ಯೋಗ್ಯ ಸಂಬಂಧ ಕೂಡಿಬರಲಿದ್ದು, ಮದುವೆ ನಿಶ್ಚಯವಾಗುವ ಸುವರ್ಣ ಕಾಲವಿದೆ.`,
        paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಶುಕ್ರವಾರ ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿಯ ಆರಾಧನೆ ಮಾಡಿ ಮತ್ತು ತುಳಸಿ ಪೂಜೆ ನಿಯಮಿತವಾಗಿ ಆಚರಿಸಿ.`
      };
    }
    if (isHi) {
      return {
        paragraph1: `जातक की कुंडली में ७वां भाव दांपत्य एवं विवाह का स्थान है। शुक्र एवं गुरु की शुभ दृष्टि सुयोग्य एवं संस्कारी जीवनसाथी की प्राप्ति दर्शाती है।`,
        paragraph2: `वर्तमान दशा काल सप्तमेश के अनुकूल है तथा गुरु गोचर विवाह वार्ता को सफल बनाने में सहायक है।`,
        paragraph3: `सटीक समय सिद्धि: आगामी ४ से ९ माह के भीतर विवाह का उत्तम योग एवं संबंध तय होने का स्वर्णिम समय है।`,
        paragraph4: `दैविक उपाय: शुक्रवार को माता महालक्ष्मी की आराधना करें तथा नित्य तुलसी पूजन संपन्न करें।`
      };
    }
    if (isTe) {
      return {
        paragraph1: `జాతకుని కుండలిలో 7వ భావం కళత్ర మరియు వివాహ స్థానం. శుక్ర మరియు గురు గ్రహాల శుభ దృష్టి సుగుణవంతుడైన జీవిత భాగస్వామిని సూచిస్తుంది.`,
        paragraph2: `ప్రస్తుతం నడుస్తున్న దశా కాలం సప్తమాధిపతికి అనుకూలంగా ఉండి, వివాహ సంబంధాలు కుదరడానికి మార్గం సుగమం చేస్తోంది.`,
        paragraph3: `ఖచ్చితమైన సమయ సిద్ధి: రాబోయే 4 నుండి 9 నెలలలోపు మంచి సంబంధం కుదిరి, వివాహం నిశ్చయమయ్యే శుభ కాలం ఉంది.`,
        paragraph4: `దైవిక పరిహారం: శుక్రవారం శ్రీ లక్ష్మీ వేంకటేశ్వర స్వామిని ఆరాధించండి మరియు తులసి పూజ క్రమం తప్పకుండా చేయండి.`
      };
    }
    if (isTa) {
      return {
        paragraph1: `ஜாதகரின் அமைப்பில் 7ஆம் இடம் களத்திரம் மற்றும் திருமண ஸ்தானமாகும். சுக்கிரன் மற்றும் குருவின் சுப பார்வை நற்குணமிக்க வாழ்க்கைத்துணையை அமைத்துத் தரும்.`,
        paragraph2: `நடப்பு தசா காலம் ஏழாம் அதிபதிக்கு சாதகமாக உள்ளதால் திருமணத் தடைகள் நீங்கி நல்ல வரன் அமையும்.`,
        paragraph3: `துல்லியமான கால நிர்ணயம்: அடுத்த 4 முதல் 9 மாதங்களுக்குள் திருமணப் பேச்சுவார்த்தைகள் சுபமாக முடிந்து திருமணம் நிச்சயமாகும்.`,
        paragraph4: `தெய்விக பரிகாரம்: வெள்ளிக்கிழமைகளில் மகாலட்சுமிக்கு நெய் தீபமிட்டு சுயம்வர பார்வதி மந்திரத்தை ஜபிக்கவும்.`
      };
    }
    return {
      paragraph1: `In your chart, the 7th house and its lord govern marital harmony and spouse nature. Benefic influences of Jupiter and Venus indicate a cultured and supportive life partner.`,
      paragraph2: `The active dasha sub-period activates the 7th house axis, harmonizing with current Jupiterian transits to remove hurdles.`,
      paragraph3: `Prediction & Timing: A very auspicious window for marriage finalization and alliance settlement manifests within the next 4 to 9 months.`,
      paragraph4: `Vedic Remedies: Light a ghee lamp before Goddess Mahalakshmi on Fridays and recite the Swayamvara Parvathi mantra.`
    };
  }

  // General fallback
  if (isKn) {
    return {
      paragraph1: `ಜಾತಕರ ${lagna} ಲಗ್ನ ಮತ್ತು ${moonRashi} ರಾಶಿಯ ಆಧಾರದ ಮೇಲೆ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಭಾವಾಧಿಪತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಗ್ರಹಗಳ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಸಂಕಷ್ಟಗಳಿಗೆ ಶೀಘ್ರ ಪರಿಹಾರವನ್ನು ಸೂಚಿಸುತ್ತದೆ.`,
      paragraph2: `ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ದಶಾ-ಭುಕ್ತಿಯು ಜಾತಕರ ಆಂತರಿಕ ಆತ್ಮಬಲ ಹಾಗೂ ದೃಢತೆಯನ್ನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲೇ ಧನಾತ್ಮಕ ತಿರುವು ಕಂಡುಬರಲಿದೆ.`,
      paragraph3: `ನಿಖರ ಸಮಯ ಸಿದ್ಧಿ: ಮುಂದಿನ ೩ ರಿಂದ ೬ ತಿಂಗಳ ಒಳಗೆ ನಿಮ್ಮ ಸಂಕಲ್ಪವು ಈಡೇರಲಿದ್ದು, ಪರಿಸ್ಥಿತಿಯು ನಿಮ್ಮ ಪರವಾಗಿ ಬದಲಾಗಲಿದೆ.`,
      paragraph4: `ದೈವಿಕ ಪರಿಹಾರ: ಪ್ರತಿದಿನ ೧೧ ಬಾರಿ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಜಪಿಸಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ.`
    };
  }

  if (isHi) {
    return {
      paragraph1: `जातक के ${lagna} लग्न एवं ${moonRashi} चंद्र राशि के आधार पर संबंधित भावेश का परीक्षण किया गया है। शुभ ग्रहों की दृष्टि संकटों के शीघ्र निवारण का संकेत देती है।`,
      paragraph2: `वर्तमान दशा-भुक्ति जातक के मनोबल को सुदृढ़ कर रही है तथा शीघ्र ही सकारात्मक मोड़ आने वाला है।`,
      paragraph3: `सटीक समय सिद्धि: आगामी ३ से ६ माह के भीतर आपका संकल्प सिद्ध होगा तथा परिस्थितियां आपके अनुकूल होंगी।`,
      paragraph4: `दैविक उपाय: नित्य ११ बार महामृत्युंजय मंत्र का जप करें तथा श्री गोकर्ण महाबलेश्वर सन्निधि में संकल्प सेवा करें।`
    };
  }

  if (isTe) {
    return {
      paragraph1: `జాతకుని ${lagna} లగ్నం మరియు ${moonRashi} చంద్ర రాశి ఆధారంగా సంబంధిత భావాధిపతిని విశ్లేషించడమైనది. శుభ గ్రహాల దృష్టి కష్టాల నుండి శీఘ్ర ఉపశమనాన్ని సూచిస్తుంది.`,
      paragraph2: `ప్రస్తుతం నడుస్తున్న దశా-భుక్తి జాతకుని ఆత్మబలాన్ని పెంచుతూ, త్వరలోనే అనుకూలమైన మలుపును తీసుకురానుంది.`,
      paragraph3: `ఖచ్చితమైన సమయ సిద్ధి: రాబోయే 3 నుండి 6 నెలలలోపు మీ సంకల్పం నెరవేరి పరిస్థితులు మీకు అనుకూలంగా మారతాయి.`,
      paragraph4: `దైవిక పరిహారం: ప్రతిరోజూ 11 సార్లు మహామృత్యుంజయ మంత్రం జపించండి మరియు శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధిలో సంకల్ప పూజ చేయించండి.`
    };
  }

  if (isTa) {
    return {
      paragraph1: `ஜாதகரின் ${lagna} லக்னம் மற்றும் ${moonRashi} சந்திர ராசியின் அடிப்படையில் தொடர்புடைய ஸ்தானாதிபதி ஆராயப்பட்டார். சுப கிரகங்களின் பார்வை தடைகளை நீக்கும்.`,
      paragraph2: `தற்போது நடக்கும் தசா-புத்தி ஜாதகரின் மன உறுதியை வளர்த்து, விரைவில் நல்ல திருப்பத்தை ஏற்படுத்தும்.`,
      paragraph3: `துல்லியமான கால நிர்ணயம்: அடுத்த 3 முதல் 6 மாதங்களுக்குள் உங்களது எண்ணங்கள் ஈடேறி சூழ்நிலைகள் சாதகமாகும்.`,
      paragraph4: `தெய்விக பரிகாரம்: தினமும் 11 முறை மகா மிருத்யுஞ்சய மந்திரத்தை ஜபித்து, ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் சங்கல்ப அர்ச்சனை செய்யவும்.`
    };
  }

  return {
    paragraph1: `Analyzing your natal chart with ${lagna} Ascendant and ${moonRashi} Moon sign, the ruling planets show resilience and divine support for this inquiry.`,
    paragraph2: `The current dasha-bhukti phase is building inner strength and resolving past karmic obstacles steadily.`,
    paragraph3: `Prediction & Timing: A positive turning point and clarity will unfold prominently within the next 3 to 6 months.`,
    paragraph4: `Vedic Remedies: Recite the Maha Mrityunjaya Mantra 11 times daily and seek the divine grace of Lord Mahabaleshwara.`
  };
}

/**
 * Generates structured 4-paragraph answer for a single question.
 */
export async function generateAnswerForQuestion(
  item: PackageQuestionItem,
  kundli: KundliOutput,
  devoteeName: string,
  birthDate: string,
  birthTime: string,
  placeLabel: string,
  lang: PackageLang,
  apiKey: string
): Promise<PackageQuestionItem> {
  const smartHeader = generateSmartQuestionHeader(item.questionText || item.topicLabel, lang);

  try {
    if (apiKey && apiKey.trim().length > 0) {
      const context = buildAstrologicalContext(kundli, devoteeName, birthDate, birthTime, placeLabel, lang);
      const prompt = `Devotee Question: "${item.questionText}". Provide the authentic 4-paragraph Vedic prediction answer in JSON format as instructed.`;
      const responseText = await askGemini(prompt, context, apiKey, lang, { raw: true, retries: 3 });

      // Clean JSON formatting
      const cleaned = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.paragraph1 && parsed.paragraph2 && parsed.paragraph3 && parsed.paragraph4) {
        return {
          ...item,
          smartHeader,
          answer: {
            paragraph1: parsed.paragraph1,
            paragraph2: parsed.paragraph2,
            paragraph3: parsed.paragraph3,
            paragraph4: parsed.paragraph4
          }
        };
      }
    }
  } catch (err) {
    console.warn("[packageAnswerEngine] Gemini API response fallback triggered:", err);
  }

  // Deterministic local dynamic fallback
  const fallback = buildFallbackAnswer(item.topicId, item.questionText, kundli, devoteeName, lang);
  return {
    ...item,
    smartHeader,
    answer: fallback
  };
}
