import React, { useState, useEffect } from "react";
import { calculateInstantPrashnaClock } from "../core/instantPrashnaEngine";
import { generateUpiPayUri } from "../features/wallet/walletTypes";

export type SixLang = "kn" | "mr" | "hi" | "te" | "ta" | "en";

interface QuestionCategory {
  id: string;
  labels: Record<SixLang, string>;
  karaka: string;
  targetBhava: number;
}

const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    id: "job",
    labels: {
      kn: "ಉದ್ಯೋಗ / ಬಡ್ತಿ / ಹೊಸ ವ್ಯವಹಾರ (Job / Career)",
      mr: "नोकरी / पदोन्नती / नवीन व्यवसाय (Job / Career)",
      hi: "नौकरी / पदोन्नति / नया व्यापार (Job / Career)",
      te: "ఉద్యోగం / పదోన్నతి / వ్యాపార ఒప్పందం (Job / Career)",
      ta: "வேலை / பதவி உயர்வு / தொழில் ஒப்பந்தம் (Job / Career)",
      en: "Job / Promotion / Career / Business Deal",
    },
    karaka: "Sun & Saturn",
    targetBhava: 10,
  },
  {
    id: "marriage",
    labels: {
      kn: "ವಿವಾಹ / ಪ್ರೇಮ / ಕಲ್ಯಾಣ ಯೋಗ (Marriage / Alliance)",
      mr: "विवाह / प्रेम / संबंध जुळणे (Marriage / Alliance)",
      hi: "विवाह / प्रेम / संबंध योग (Marriage / Alliance)",
      te: "వివాహం / ప్రేమ / సంబంధం కుదరడం (Marriage / Alliance)",
      ta: "திருமணம் / காதல் / வரன் அமைதல் (Marriage / Alliance)",
      en: "Marriage / Love / Relationship Alliance",
    },
    karaka: "Venus & Jupiter",
    targetBhava: 7,
  },
  {
    id: "property",
    labels: {
      kn: "ಭೂಮಿ / ಮನೆ / ವಾಹನ ಖರೀದಿ (Land / House / Vehicle)",
      mr: "जमीन / घर / वाहन खरेदी (Land / Property / Vehicle)",
      hi: "भूमि / मकान / वाहन क्रय (Land / Property / Vehicle)",
      te: "భూమి / ఇల్లు / వాహన కొనుగోలు (Land / Property / Vehicle)",
      ta: "நிலம் / வீடு / வாகனம் வாங்குதல் (Land / Property / Vehicle)",
      en: "Land / House / Vehicle Purchase",
    },
    karaka: "Mars & Venus",
    targetBhava: 4,
  },
  {
    id: "money",
    labels: {
      kn: "ಬಾಕಿ ಹಣ ವಸೂಲಿ / ಸಾಲ ಮುಕ್ತಿ / ಧನಲಾಭ (Stuck Money / Wealth)",
      mr: "अडकलेले पैसे / कर्जमुक्ती / धनलाभ (Stuck Money / Wealth)",
      hi: "रुका हुआ धन / ऋण मुक्ति / धन लाभ (Stuck Money / Wealth)",
      te: "నిలిచిపోయిన ధనం / రుణ విముక్తి / ఆర్థిక లాభం (Stuck Money / Wealth)",
      ta: "வராக்கடன் வசூல் / கடன் நிவாரணம் / பண வரவு (Stuck Money / Wealth)",
      en: "Stuck Money / Loan Clearance / Financial Relief",
    },
    karaka: "Jupiter & Mercury",
    targetBhava: 11,
  },
  {
    id: "court",
    labels: {
      kn: "ನ್ಯಾಯಾಲಯ ಕೇಸ್ / ವಿವಾದ ಜಯ / ಆರೋಗ್ಯ ಸುಧಾರಣೆ (Legal / Health)",
      mr: "न्यायालयीन खटला / विवाद विजय / आरोग्य सुधारणा (Legal / Health)",
      hi: "न्यायालय विवाद / कानूनी विजय / स्वास्थ्य सुधार (Legal / Health)",
      te: "కోర్టు వివాదం / విజయం / ఆరోగ్య స్వస్థత (Legal / Health)",
      ta: "நீதிமன்ற வழக்கு / வெற்றி / உடல்நலக் குணம் (Legal / Health)",
      en: "Legal Dispute / Court Case / Health Recovery",
    },
    karaka: "Mars & Sun",
    targetBhava: 6,
  },
];

const RASHI_NAMES: { [key: number]: Record<SixLang, string> } = {
  0: { kn: "ಮೇಷ", mr: "मेष", hi: "मेष", te: "మేషం", ta: "மேஷம்", en: "Aries (Mesha)" },
  1: { kn: "ವೃಷಭ", mr: "वृषभ", hi: "वृषभ", te: "వృషభం", ta: "ரிஷபம்", en: "Taurus (Vrishabha)" },
  2: { kn: "ಮಿಥುನ", mr: "मिथुन", hi: "मिथुन", te: "మిథునం", ta: "மிதுனம்", en: "Gemini (Mithuna)" },
  3: { kn: "ಕರ್ಕಾಟಕ", mr: "कर्क", hi: "कर्क", te: "కర్కాటకం", ta: "கடகம்", en: "Cancer (Karka)" },
  4: { kn: "ಸಿಂಹ", mr: "सिंह", hi: "सिंह", te: "సింహం", ta: "சிம்மம்", en: "Leo (Simha)" },
  5: { kn: "ಕನ್ಯಾ", mr: "कन्या", hi: "कन्या", te: "కన్య", ta: "கன்னி", en: "Virgo (Kanya)" },
  6: { kn: "ತುಲಾ", mr: "तूळ", hi: "तुला", te: "తుల", ta: "துலாம்", en: "Libra (Tula)" },
  7: { kn: "ವೃಶ್ಚಿಕ", mr: "वृश्चिक", hi: "वृश्चिक", te: "వృశ్చికం", ta: "விருச்சிகம்", en: "Scorpio (Vrischika)" },
  8: { kn: "ಧನು", mr: "धनु", hi: "धनु", te: "ధనుస్సు", ta: "தனுசு", en: "Sagittarius (Dhanu)" },
  9: { kn: "ಮಕರ", mr: "मकर", hi: "मकर", te: "మకరం", ta: "மகரம்", en: "Capricorn (Makara)" },
  10: { kn: "ಕುಂಭ", mr: "कुंभ", hi: "कुंभ", te: "కుంభం", ta: "கும்பம்", en: "Aquarius (Kumbha)" },
  11: { kn: "ಮೀನ", mr: "मीन", hi: "मीन", te: "మీనం", ta: "மீனம்", en: "Pisces (Meena)" },
};

const RASHI_LORDS = [
  "Mars", "Venus", "Mercury", "Moon",
  "Sun", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Saturn", "Jupiter",
];

const UI_TEXT: Record<SixLang, {
  badge: string;
  title: string;
  subtitle: string;
  step1: string;
  step2: string;
  step3: string;
  qPlaceholder: string;
  btnCalculate: string;
  verdictTitle: string;
  timingLabel: string;
  unlockBtn: string;
  unlockedTitle: string;
  remedyTitle: string;
  priestNote: string;
  btnWhatsAppConsult: string;
  statusFavorable: string;
  statusDelayed: string;
  statusCaution: string;
}> = {
  kn: {
    badge: "ಜನನ ಸಮಯ ಅಗತ್ಯವಿಲ್ಲ • ಲೈವ್ ಪ್ರಶ್ನಾ ಶಾಸ್ತ್ರ ಆರೇಕಲ್",
    title: "1 ತುರ್ತು ಪ್ರಶ್ನೆ ಕೇಳಿ — ತಕ್ಷಣದ ಶಾಸ್ತ್ರೀಯ ಉತ್ತರ & ಕಾಲನಿರ್ಣಯ ಪಡೆಯಿರಿ",
    subtitle: "ಭಕ್ತಿ ಶ್ರದ್ಧೆಯಿಂದ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಧ್ಯಾನಿಸಿ, 1 ರಿಂದ 108 ರ ನಡುವೆ ಒಂದು ದೈವಿಕ ಸಂಖ್ಯೆಯನ್ನು ಆರಿಸಿ. ಪ್ರಸ್ತುತ ಗ್ರಹ ಹೋರೆಯು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯ ಫಲವನ್ನು ತಿಳಿಸುತ್ತದೆ.",
    step1: "1. ಜೀವನದ ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    step2: "2. ನಿಮ್ಮ ನಿಖರ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ",
    step3: "3. ದೈವಿಕ ಪ್ರಶ್ನಾ ಸಂಖ್ಯೆ (1 ರಿಂದ 108):",
    qPlaceholder: "ಉದಾ: ನನ್ನ ಹೊಸ ಉದ್ಯೋಗ ಅಥವಾ ಬಡ್ತಿ ಈ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ ಖಚಿತವಾಗುವುದೇ?",
    btnCalculate: "ಲೈವ್ ಪ್ರಶ್ನಾ ಫಲಿತಾಂಶ ಗಣನೆ ಮಾಡಿ →",
    verdictTitle: "ಶಾಸ್ತ್ರೀಯ ಪ್ರಶ್ನಾ ಫಲಿತಾಂಶ",
    timingLabel: "ನಿರೀಕ್ಷಿತ ಕಾಲಾವಧಿ (ಫಲ ಸಿದ್ಧಿಯ ಸಮಯ):",
    unlockBtn: "ಸಂಪೂರ್ಣ ಪ್ರಶ್ನಾ ವಿವರ & ಪರಿಹಾರ ಅನ್‌ಲಾಕ್ ಮಾಡಿ (₹149)",
    unlockedTitle: "ಸಂಪೂರ್ಣ ದೈವಿಕ ಪ್ರಶ್ನಾ ವಿಶ್ಲೇಷಣೆ & ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರ",
    remedyTitle: "ಪುರೋಹಿತ ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ಅಧಿಕೃತ ಪರಿಹಾರ & ಸಂಕಲ್ಪ:",
    priestNote: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಸೇವೆಯ ಮಾರ್ಗದರ್ಶನ.",
    btnWhatsAppConsult: "ಶ್ರೀರಾಮ್ ಪಂಡಿತರೊಂದಿಗೆ ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಚರ್ಚಿಸಿ",
    statusFavorable: "ಶುಭ ಸಿದ್ಧಿ ಯೋಗ (FAVORABLE)",
    statusDelayed: "ವಿಳಂಬ ನಂತರ ಸಿದ್ಧಿ (DELAYED WITH REMEDY)",
    statusCaution: "ಎಚ್ಚರಿಕೆ & ಶಾಂತಿ ಅಗತ್ಯ (CAUTION)",
  },
  mr: {
    badge: "जन्मवेळेची गरज नाही • लाईव्ह प्रश्न शास्त्र ओरॅकल",
    title: "१ तातडीचा प्रश्न विचारा — तत्काळ शास्त्रीय उत्तर व कालनिर्णय मिळवा",
    subtitle: "श्रद्धेने आपल्या प्रश्नाचे स्मरण करा, १ ते १०८ दरम्यान एक दैवी अंक निवडा. चालू ग्रह होरा आपल्या प्रश्नाचे फळ दर्शवेल.",
    step1: "१. जीवनातील विषय निवडा",
    step2: "२. आपला नेमका प्रश्न लिहा",
    step3: "३. दैवी प्रश्न संख्या (१ ते १०८):",
    qPlaceholder: "उदा. माझी नवीन नोकरी किंवा पदोन्नती या तिमाहीत निश्चित होईल का?",
    btnCalculate: "लाईव्ह प्रश्न फळ मोजा →",
    verdictTitle: "शास्त्रीय प्रश्न निकाल",
    timingLabel: "अपेक्षित कालावधी (कार्यसिद्धीची वेळ):",
    unlockBtn: "संपूर्ण प्रश्न विवरण व उपाय अनलॉक करा (₹149)",
    unlockedTitle: "संपूर्ण दैवी प्रश्न विश्लेषण व शास्त्रीय उपाय",
    remedyTitle: "पुरोहित श्रीराम पंडितांचे अधिकृत मार्गदर्शन व संकल्प:",
    priestNote: "गोकर्ण महाबळेश्वर सान्निध्यात विशेष संकल्प सेवेचे मार्गदर्शन.",
    btnWhatsAppConsult: "श्रीराम पंडितांशी व्हॉट्सॲपवर चर्चा करा",
    statusFavorable: "शुभ सिद्धी योग (FAVORABLE)",
    statusDelayed: "विलंबानंतर सिद्धी (DELAYED WITH REMEDY)",
    statusCaution: "सावधानता व शांती आवश्यक (CAUTION)",
  },
  hi: {
    badge: "जन्म समय की आवश्यकता नहीं • लाइव प्रश्न शास्त्र ऑरेकल",
    title: "1 अति-महत्वपूर्ण प्रश्न पूछें — तत्काल शास्त्रीय निर्णय एवं समय-सीमा पाएं",
    subtitle: "श्रद्धापूर्वक अपने प्रश्न का ध्यान करें, 1 से 108 के बीच एक दिव्य संख्या चुनें। वर्तमान ग्रह होरा आपके प्रश्न का सटीक परिणाम प्रकट करेगी।",
    step1: "1. जीवन का क्षेत्र चुनें",
    step2: "2. अपना सटीक प्रश्न लिखें",
    step3: "3. दिव्य प्रश्न संख्या (1 से 108):",
    qPlaceholder: "उदा. क्या मेरी नई नौकरी या पदोन्नति इस तिमाही में पक्की होगी?",
    btnCalculate: "लाइव प्रश्न परिणाम की गणना करें →",
    verdictTitle: "शास्त्रीय प्रश्न निर्णय",
    timingLabel: "अपेक्षित समयावधि (कार्यसिद्धि काल):",
    unlockBtn: "संपूर्ण प्रश्न उत्तर एवं अचूक उपाय अनलॉक करें (₹149)",
    unlockedTitle: "विस्तृत दैवीय प्रश्न विश्लेषण एवं शास्त्रीय उपाय",
    remedyTitle: "पुरोहित श्रीराम पंडित जी का अधिकृत उपाय एवं संकल्प:",
    priestNote: "गोकर्ण महाबलेश्वर सान्निध्य में विशेष संकल्प पूजा का मार्गदर्शन।",
    btnWhatsAppConsult: "श्रीराम पंडित जी से व्हाट्सएप पर चर्चा करें",
    statusFavorable: "शुभ सिद्धि योग (FAVORABLE)",
    statusDelayed: "विलंब पश्चात सिद्धि (DELAYED WITH REMEDY)",
    statusCaution: "सावधानी एवं शांति आवश्यक (CAUTION)",
  },
  te: {
    badge: "జన్మ సమయం అవసరం లేదు • లైవ్ ప్రశ్న శాస్త్ర ఒరాకిల్",
    title: "1 ముఖ్యమైన ప్రశ్న అడగండి — తక్షణ శాస్త్రీయ సమాధానం & కాల నిర్ణయం పొందండి",
    subtitle: "భక్తితో మీ ప్రశ్నను ధ్యానించండి, 1 నుండి 108 మధ్య ఒక దివ్య సంఖ్యను ఎంచుకోండి. ప్రస్తుత గ్రహ హోర మీ ప్రశ్నకు ఖచ్చితమైన ఫలితాన్ని చూపుతుంది.",
    step1: "1. జీవిత రంగాన్ని ఎంచుకోండి",
    step2: "2. మీ ఖచ్చితమైన ప్రశ్నను రాయండి",
    step3: "3. దివ్య ప్రశ్న సంఖ్య (1 నుండి 108):",
    qPlaceholder: "ఉదా: నా కొత్త ఉద్యోగం లేదా పదోన్నతి ఈ త్రైమాసికంలో ఖరారవుతుందా?",
    btnCalculate: "లైవ్ ప్రశ్న ఫలితాన్ని లెక్కించండి →",
    verdictTitle: "శాస్త్రీయ ప్రశ్న ఫలితం",
    timingLabel: "ఆశించిన కాలపరిమితి (కార్యసిద్ధి సమయం):",
    unlockBtn: "పూర్తి ప్రశ్న వివరాలు & నివారణ అన్‌లాక్ చేయండి (₹149)",
    unlockedTitle: "సమగ్ర దివ్య ప్రశ్న విశ్లేషణ & శాస్త్రీయ నివారణ",
    remedyTitle: "పురోహితులు శ్రీరామ్ పండిట్ గారి అధికారిక పరిహారం & సంకల్పం:",
    priestNote: "గోకర్ణ మహాబలేశ్వర సన్నిధిలో విశేష సంకల్ప సేవా మార్గదర్శనం.",
    btnWhatsAppConsult: "శ్రీరామ్ పండిట్ గారితో వాట్సాప్‌లో సంప్రదించండి",
    statusFavorable: "శుభ సిద్ధి యోగం (FAVORABLE)",
    statusDelayed: "ఆలస్యం తర్వాత సిద్ధి (DELAYED WITH REMEDY)",
    statusCaution: "జాగ్రత్త & శాంతి అవసరం (CAUTION)",
  },
  ta: {
    badge: "பிறந்த நேரம் தேவையில்லை • நேரலை பிரஸ்ன ஆரக்கிள்",
    title: "1 அவசர கேள்வியைக் கேளுங்கள் — உடனடி சாஸ்திர தீர்ப்பு & கால நிர்ணயம் பெறுங்கள்",
    subtitle: "பக்தியுடன் உங்கள் கேள்வியை தியானித்து, 1 முதல் 108 வரை ஒரு தெய்வீக எண்ணைத் தேர்வு செய்யுங்கள். நடப்பு கிரக ஹோரை உங்கள் காரியத்தின் பலனைக் கூறும்.",
    step1: "1. வாழ்க்கை பகுதியைத் தேர்வு செய்க",
    step2: "2. உங்கள் சரியான கேள்வியை எழுதுங்கள்",
    step3: "3. தெய்வீக பிரஸ்ன எண் (1 முதல் 108):",
    qPlaceholder: "எ.கா: எனது புதிய வேலை அல்லது பதவி உயர்வு இந்த காலாண்டில் உறுதியாகுமா?",
    btnCalculate: "நேரலை பிரஸ்ன பலனைக் கணக்கிடுக →",
    verdictTitle: "சாஸ்திர பிரஸ்ன தீர்ப்பு",
    timingLabel: "எதிர்பார்க்கப்படும் கால அவகாசம் (காரிய சித்தி நேரம்):",
    unlockBtn: "முழு பிரஸ்ன பதில் & பரிகாரத்தை திறக்க (₹149)",
    unlockedTitle: "முழு தெய்வீக பிரஸ்ன பகுப்பாய்வு & சாஸ்திர பரிகாரம்",
    remedyTitle: "புரோகிதர் ஸ்ரீராம் பண்டிதரின் அதிகாரப்பூர்வ பரிகாரம் & சங்கல்பம்:",
    priestNote: "கோகர்ணா மகாபலேஸ்வரர் சன்னதியில் சிறப்பு சங்கல்ப பூஜை வழிகாட்டல்.",
    btnWhatsAppConsult: "ஸ்ரீராம் பண்டிதரிடம் வாட்ஸ்அப்பில் பேசவும்",
    statusFavorable: "சுப சித்தி யோகம் (FAVORABLE)",
    statusDelayed: "தாமதத்திற்குப் பின் சித்தி (DELAYED WITH REMEDY)",
    statusCaution: "எச்சரிக்கை & சாந்தி அவசியம் (CAUTION)",
  },
  en: {
    badge: "No Birth Time Needed • Live Horary Prashna Oracle",
    title: "Ask 1 Urgent Question — Get Instant Shastriya Verdict",
    subtitle: "Focus on your question with devotion, select a sacred number between 1 and 108 (Classical Prashna Arudha), and let the live planetary Hora reveal the outcome.",
    step1: "1. Select Life Area",
    step2: "2. Type Your Exact Question",
    step3: "3. Divine Prashna Number (1 to 108):",
    qPlaceholder: "e.g., Will my promotion or new job offer close smoothly this quarter?",
    btnCalculate: "Calculate Live Prashna Verdict →",
    verdictTitle: "Shastriya Horary Verdict",
    timingLabel: "Expected Timing Window (Fulfillment Period):",
    unlockBtn: "Unlock Full Prashna Answer + Exact Remedy (₹149)",
    unlockedTitle: "Comprehensive Horary Analysis & Consecrated Remedy",
    remedyTitle: "Chief Priest Shreeram Pandit's Prescribed Remedy & Sankalpa:",
    priestNote: "Sri Kshetra Gokarna Mahabaleshwara sanctified Sankalpa guidance.",
    btnWhatsAppConsult: "Discuss with Shreeram Pandit on WhatsApp",
    statusFavorable: "FAVORABLE (Subha Siddhi)",
    statusDelayed: "DELAYED WITH REMEDY (Vilamba Siddhi)",
    statusCaution: "CAUTION (Shanti Required)",
  },
};

export const LivePrashnaOraclePage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<SixLang>("kn");
  const [category, setCategory] = useState("job");
  const [question, setQuestion] = useState("");
  const [prashnaNumber, setPrashnaNumber] = useState<number>(27);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  const [verdict, setVerdict] = useState<{
    status: "FAVORABLE" | "DELAYED_REMEDY" | "CAUTION";
    horaLord: string;
    arudhaSign: string;
    navamshaPada: number;
    shortAnswer: string;
    exactTiming: string;
    deepAnalysis: string;
    remedy: string;
  } | null>(null);

  const t = UI_TEXT[selectedLang];

  // Arudha calculation: 108 numbers mapped to 12 signs x 9 navamshas
  const signIndex = Math.floor((prashnaNumber - 1) / 9);
  const navamshaIndex = ((prashnaNumber - 1) % 9) + 1;
  const arudhaSignName = RASHI_NAMES[signIndex]?.[selectedLang] || RASHI_NAMES[0][selectedLang];

  const calculatePrashna = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calculate Real-Time Horary Clock
    const clock = calculateInstantPrashnaClock(0, new Date());
    const horaLord = clock.horaLordEn;
    const arudhaLord = RASHI_LORDS[signIndex] || "Jupiter";

    // 2. Friendship & Compatibility Matrix
    const FRIENDLY_GRAHAS: Record<string, string[]> = {
      Sun: ["Moon", "Mars", "Jupiter"],
      Moon: ["Sun", "Mercury"],
      Mars: ["Sun", "Moon", "Jupiter"],
      Mercury: ["Sun", "Venus"],
      Jupiter: ["Sun", "Moon", "Mars"],
      Venus: ["Mercury", "Saturn"],
      Saturn: ["Mercury", "Venus"],
    };

    const isSameLord = horaLord === arudhaLord;
    const isFriend = FRIENDLY_GRAHAS[horaLord]?.includes(arudhaLord);
    const isHoraBenefic = clock.isHoraAuspicious;

    let status: "FAVORABLE" | "DELAYED_REMEDY" | "CAUTION" = "DELAYED_REMEDY";
    let timingStr = "";
    let shortAnswer = "";
    let deepAnalysis = "";
    let remedy = "";

    if (isSameLord || (isFriend && isHoraBenefic)) {
      status = "FAVORABLE";
      timingStr =
        selectedLang === "kn"
          ? "ಇಂದಿನಿಂದ 21 ರಿಂದ 45 ದಿನಗಳ ಒಳಗಾಗಿ"
          : selectedLang === "mr"
          ? "आजपासून २१ ते ४५ दिवसांच्या आत"
          : selectedLang === "hi"
          ? "आज से 21 से 45 दिनों के भीतर"
          : selectedLang === "te"
          ? "నేటి నుండి 21 నుండి 45 రోజుల లోపు"
          : selectedLang === "ta"
          ? "இன்றிலிருந்து 21 முதல் 45 நாட்களுக்குள்"
          : "Within 21 to 45 Days from today";

      shortAnswer =
        selectedLang === "kn"
          ? `ಪ್ರಶ್ನಾ ಆರೂಢ ಲಗ್ನ ${arudhaSignName} ಹಾಗೂ ಪ್ರಸ್ತುತ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ${clock.horaLordKn} ಹೋರೆಯು ಪರಸ್ಪರ ಮಿತ್ರ ಭಾವದಲ್ಲಿದ್ದು, ನಿಮ್ಮ ಕಾರ್ಯದಲ್ಲಿ ದೈವಾನುಗ್ರಹ ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿದೆ. ಯಾವುದೇ ಅಡೆತಡೆಗಳಿಲ್ಲದೆ ಫಲ ಸಿದ್ಧಿಯಾಗಲಿದೆ.`
          : selectedLang === "mr"
          ? `प्रश्न आरूढ राशी ${arudhaSignName} व सध्या सुरू असलेली ${horaLord} होरा परस्परांना अत्यंत अनुकूल असून दैवी आशीर्वाद पूर्ण आहे. आपले कार्य विनाअडथळा सिद्धीस जाईल.`
          : selectedLang === "hi"
          ? `प्रश्न आरूढ़ लग्न ${arudhaSignName} एवं वर्तमान में सक्रिय ${horaLord} होरा में पूर्ण सामंजस्य है। ईश्वरीय कृपा से आपका अभीष्ट कार्य निर्विघ्न रूप से सफल होगा।`
          : selectedLang === "te"
          ? `ప్రశ్న ఆరూఢ లగ్నం ${arudhaSignName} మరియు ప్రస్తుత ${horaLord} హోర మధ్య శుభ యోగం ఉంది. దైవానుగ్రహంతో మీ కార్యం సులభంగా నెరవేరుతుంది.`
          : selectedLang === "ta"
          ? `பிரஸ்ன ஆருட லக்னம் ${arudhaSignName} மற்றும் நடப்பு ${horaLord} ஹோரை ஆகியன மிகவும் சாதகமாக உள்ளன. தெய்வ அனுகூலத்தால் காரியம் தடையின்றி கைகூடும்.`
          : `The Prashna Arudha (${arudhaSignName}) and active ${horaLord} Hora are in harmonious mutual dignity, indicating high divine alignment and swift positive resolution.`;

      deepAnalysis =
        selectedLang === "kn"
          ? `ಆರೂಢಾಧಿಪತಿ ${arudhaLord} ಹಾಗೂ ಪ್ರಸ್ತುತ ಹೋರಾಧಿಪತಿ ${clock.horaLordKn} ಇವರ ಸಂಯೋಗವು 10ನೇ ಹಾಗೂ 11ನೇ ಸ್ಥಾನಗಳ ಧನ-ಕೀರ್ತಿ ಯೋಗವನ್ನು ಸೃಷ್ಟಿಸುತ್ತಿದೆ. ಈ ಸಮಯದಲ್ಲಿ ಹೊಸ ನಿರ್ಧಾರಗಳನ್ನು ಕೈಗೊಳ್ಳುವುದು ಅತ್ಯಂತ ಶ್ರೇಯಸ್ಕರ.`
          : `Arudha Lord ${arudhaLord} in resonance with Hora Lord ${horaLord} activates supportive 10th and 11th Bhava matrix, ensuring steady progress with authoritative backing.`;

      remedy =
        selectedLang === "kn"
          ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಪೂಜೆ, ಗಣಪತಿ ಅಥರ್ವಶೀರ್ಷ ಪಾರಾಯಣ ಹಾಗೂ ಮಂಗಳವಾರ ಸಂಕಲ್ಪ."
          : "Sri Gokarna Mahabaleshwara Sankalpa Puja & Ganapati Atharvashirsha Parayana.";
    } else if (isFriend || isHoraBenefic) {
      status = "DELAYED_REMEDY";
      timingStr =
        selectedLang === "kn"
          ? "ಇಂದಿನಿಂದ 42 ರಿಂದ 68 ದಿನಗಳು (ಪರಿಹಾರದ ನಂತರ)"
          : selectedLang === "mr"
          ? "आजपासून ४२ ते ६८ दिवस (उपाय केल्यावर)"
          : selectedLang === "hi"
          ? "आज से 42 से 68 दिन (उपाय के उपरांत)"
          : selectedLang === "te"
          ? "నేటి నుండి 42 నుండి 68 రోజులు (పరిహారం అనంతరం)"
          : selectedLang === "ta"
          ? "இன்றிலிருந்து 42 முதல் 68 நாட்கள் (பரிகாரத்திற்குப் பின்)"
          : "Within 42 to 68 Days from today (after specified remedy)";

      shortAnswer =
        selectedLang === "kn"
          ? `ಪ್ರಶ್ನಾ ಆರೂಢವು ಕಾರ್ಯ ಸಾಧ್ಯತೆಯನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ, ಆದರೆ 99% ಹಂತದಲ್ಲಿ ಒಂದು ಕೊನೆಯ ಕ್ಷಣದ ಸಣ್ಣ ಕರ್ಮ ಅಡೆತಡೆ ಗೋಚರಿಸುತ್ತಿದೆ. ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರದಿಂದ ಈ ವಿಳಂಬ ನಿವಾರಣೆಯಾಗಿ ಯಶಸ್ಸು ಲಭಿಸುತ್ತದೆ.`
          : selectedLang === "mr"
          ? `प्रश्न आरूढ कार्यातील यश दर्शवतो, परंतु ९९% टप्प्यावर एक शेवटचा अडथळा दिसत आहे. योग्य उपायाने हा विलंब दूर होऊन कार्य सिद्धीस जाईल.`
          : selectedLang === "hi"
          ? `प्रश्न आरूढ़ कार्यसिद्धि की पुष्टि करता है, किंतु 99% स्तर पर एक अंतिम कर्मावरोध उपस्थित है। शास्त्रीय शांति अनुष्ठान से यह बाधा दूर होगी।`
          : selectedLang === "te"
          ? `ప్రశ్న ఆరూఢం కార్యం నెరవేరుతుందని చెబుతోంది, కానీ చివరి క్షణంలో చిన్న అడ్డంకి కనిపిస్తోంది. శాంతి పూజ ద్వారా ఈ ఆటంకం తొలగిపోతుంది.`
          : selectedLang === "ta"
          ? `காரியம் நடக்கும் என்பதை ஆருடம் உறுதி செய்கிறது, ஆனால் இறுதி தருணத்தில் ஒரு சிறு கர்மா தடை உள்ளது. சாஸ்திர பரிகாரத்தால் காரியம் வெற்றியாகும்.`
          : `The Prashna Arudha confirms ultimate success, but a minor last-mile karmic impediment creates a 42-68 day delay. Consecrated remediation clears the obstacle.`;

      deepAnalysis =
        selectedLang === "kn"
          ? `ಪ್ರಸ್ತುತ ಚಂದ್ರ ಬಲ ಹಾಗೂ ಆರೂಢದ 4ನೇ/7ನೇ ಭಾವಗಳಲ್ಲಿ ಮಧ್ಯಮ ಕರ್ಮ ಒತ್ತಡವಿದೆ. ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಫಲ ಸಿಗಲು ಸಕಾಲಿಕ ದೈವಿಕ ಸಂಕಲ್ಪ ಅವಶ್ಯಕ.`
          : `Chandra Bala and Arudha nodal alignment indicate karmic resistance that yields positively upon performing the designated propitiation.`;

      remedy =
        selectedLang === "kn"
          ? "ಶ್ರೀಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಆತ್ಮಲಿಂಗ ಕ್ಷೀರಾಭಿಷೇಕ, ಸುಬ್ರಹ್ಮಣ್ಯ ಅರ್ಚನೆ ಹಾಗೂ ನವಗ್ರಹ ಶಾಂತಿ ಸಂಕಲ್ಪ."
          : "Sri Kshetra Gokarna Atma Linga Kshirabhisheka & Subramanya Shanti Sankalpa.";
    } else {
      status = "CAUTION";
      timingStr =
        selectedLang === "kn"
          ? "90 ರಿಂದ 120 ದಿನಗಳವರೆಗೆ ಸಂಯಮ & ಶಾಂತಿ ಅಗತ್ಯ"
          : selectedLang === "mr"
          ? "९० ते १२० दिवस संयम व शांती आवश्यक"
          : selectedLang === "hi"
          ? "90 से 120 दिन संयम एवं शांति आवश्यक"
          : selectedLang === "te"
          ? "90 నుండి 120 రోజుల వరకు ఓపిక & శాంతి అవసరం"
          : selectedLang === "ta"
          ? "90 முதல் 120 நாட்கள் வரை பொறுமை & சாந்தி அவசியம்"
          : "Requires 90 to 120 Days patience & Gokarna Seva";

      shortAnswer =
        selectedLang === "kn"
          ? `ಪ್ರಸ್ತುತ ಹೋರಾಧಿಪತಿಯು ಆರೂಢಕ್ಕೆ ಶತ್ರು ಭಾವದಲ್ಲಿದ್ದು, ಆತುರದ ನಿರ್ಧಾರಗಳಿಂದ ನಷ್ಟದ ಸಂಭವವಿದೆ. ಸದ್ಯಕ್ಕೆ ಹೊಸ ಒಪ್ಪಂದಗಳನ್ನು ಮುಂದೂಡಿ, ದೈವಿಕ ರಕ್ಷಣೆಗೆ ಪ್ರಾರ್ಥಿಸುವುದು ಕ್ಷೇಮಕರ.`
          : selectedLang === "mr"
          ? `चालू होरा आरूढ राशीशी प्रतिकूल असल्याने घाईघाईत घेतलेल्या निर्णयाने नुकसान होऊ शकते. थोडे दिवस थांबून ईश्वरी आराधना करावी.`
          : selectedLang === "hi"
          ? `वर्तमान होरा आरूढ़ के प्रतिकूल है, अतः जल्दबाजी में कोई भी बड़ा निर्णय लेने से बचें। धैर्य रखें और शांति अनुष्ठान करें।`
          : selectedLang === "te"
          ? `ప్రస్తుత హోరాధిపతి ఆరూఢానికి ప్రతికూలంగా ఉన్నందున తొందరపాటు నిర్ణయాలు వద్దు. కొద్ది రోజులు సంయమనం పాటించండి.`
          : selectedLang === "ta"
          ? `தற்போதைய ஹோரை ஆருடத்திற்கு பாதகமாக உள்ளதால் அவசர முடிவுகளைத் தவிர்க்கவும். பொறுமையுடன் தெய்வப் பரிகாரம் செய்யவும்.`
          : `Adverse Hora and Arudha friction advise against immediate hasty commitments. Patience of 90-120 days and Shiva propitiation ensure protection.`;

      deepAnalysis =
        selectedLang === "kn"
          ? `ಆರೂಢದ 6ನೇ ಅಥವಾ 8ನೇ ಭಾವದಲ್ಲಿ ಗ್ರಹ ಒತ್ತಡವಿದ್ದು, ಪಿತೃ ಅಥವಾ ಮಾಂದಿ ಶಾಂತಿ ಮಾಡಿಸುವುದು ತಕ್ಷಣದ ಶಮನ ನೀಡುತ್ತದೆ.`
          : `6th/8th Bhava activation suggests underlying karmic stress; Sri Kshetra Gokarna Rudrabhisheka removes vulnerability.`;

      remedy =
        selectedLang === "kn"
          ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಜಪ, ತಿಲ ತರ್ಪಣ & ಸೋಮವಾರ ಶಿವಾರ್ಚನೆ."
          : "Sri Gokarna Mahabaleshwara Maha Mrityunjaya Japa & Tila Tarpanam.";
    }

    setVerdict({
      status,
      horaLord: `${horaLord} (${clock.horaLordKn})`,
      arudhaSign: `${arudhaSignName}`,
      navamshaPada: navamshaIndex,
      shortAnswer,
      exactTiming: timingStr,
      deepAnalysis,
      remedy,
    });
  };

  // ₹149 Razorpay & UPI Handler
  const handlePayment = () => {
    // 1. Check if window.Razorpay is available
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      try {
        const rzp = new (window as any).Razorpay({
          key: (window as any).VITE_RAZORPAY_KEY || "rzp_live_baggona",
          amount: 14900, // ₹149 in paise
          currency: "INR",
          name: "Baggona Live Prashna Oracle",
          description: `Prashna Oracle: ${question || category}`,
          handler: () => {
            setIsUnlocked(true);
            setPaymentPending(false);
          },
          prefill: {
            name: "Devotee",
            contact: "9972339362",
          },
          theme: { color: "#D97706" },
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn("[PrashnaOracle] Razorpay direct open fallback:", err);
      }
    }

    // 2. Fallback: Show instant unlock and UPI links
    setPaymentPending(true);
  };

  const confirmUpiPaid = () => {
    setIsUnlocked(true);
    setPaymentPending(false);
  };

  const upiUri = generateUpiPayUri(149, "LivePrashnaOracle", "9108135387@ybl");

  const openWhatsAppPriest = () => {
    if (!verdict) return;
    const msg = encodeURIComponent(
      `🙏 *Namaste Shreeram Pandit Ji*\n` +
      `*Baggona Live Prashna Consultation*\n\n` +
      `• *Question:* ${question || category}\n` +
      `• *Arudha Number:* ${prashnaNumber} (${verdict.arudhaSign}, Navamsha ${verdict.navamshaPada})\n` +
      `• *Hora Lord:* ${verdict.horaLord}\n` +
      `• *Verdict:* ${verdict.status}\n` +
      `• *Timing Window:* ${verdict.exactTiming}\n\n` +
      `I would like to book the recommended Sankalpa Seva for early fulfillment.`
    );
    window.open(`https://wa.me/919972339362?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0D0A14] text-[#F5F0FF] py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Language Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-400/20 pb-3">
          <div className="text-xs text-amber-300 font-bold tracking-wider uppercase">
            Language / ಭಾಷೆ / भाषा
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "mr", label: "मराठी" },
                { code: "hi", label: "हिंदी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" },
                { code: "en", label: "English" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedLang === lang.code
                    ? "bg-amber-400 text-black font-bold shadow-md"
                    : "bg-[#1E1630] text-slate-300 hover:text-white hover:bg-[#2A1E42]"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-400/30">
            {t.badge}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-3 leading-tight">
            {t.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Input Form Card */}
        <form
          onSubmit={calculatePrashna}
          className="bg-[#171224] border border-amber-400/25 rounded-2xl p-5 md:p-7 space-y-5 shadow-2xl"
        >
          <div>
            <label className="block text-xs uppercase font-bold text-amber-300 mb-2">
              {t.step1}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0D0A14] border border-white/15 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400 text-sm"
            >
              {QUESTION_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.labels[selectedLang]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-amber-300 mb-2">
              {t.step2}
            </label>
            <input
              type="text"
              required
              placeholder={t.qPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-[#0D0A14] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase font-bold text-amber-300">
                {t.step3}{" "}
                <span className="text-white text-base font-bold underline ml-1">
                  {prashnaNumber}
                </span>
              </label>
              <span className="text-xs text-amber-200/80 bg-amber-900/30 px-2 py-0.5 rounded border border-amber-400/20">
                {arudhaSignName} • Pada {navamshaIndex}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={108}
              value={prashnaNumber}
              onChange={(e) => setPrashnaNumber(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 (Mesha)</span>
              <span>54 (Tula)</span>
              <span>108 (Meena)</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black hover:brightness-110 active:scale-[0.99] transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            {t.btnCalculate}
          </button>
        </form>

        {/* Verdict Box */}
        {verdict && (
          <div className="bg-[#171224] border border-amber-400/40 rounded-2xl p-5 md:p-6 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-amber-300">
                  {t.verdictTitle}
                </span>
                <div className="text-xs text-slate-400 mt-0.5">
                  Arudha: <strong className="text-white">{verdict.arudhaSign}</strong> (Pada {verdict.navamshaPada}) • Hora: <strong className="text-white">{verdict.horaLord}</strong>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                  verdict.status === "FAVORABLE"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : verdict.status === "DELAYED_REMEDY"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {verdict.status === "FAVORABLE"
                  ? t.statusFavorable
                  : verdict.status === "DELAYED_REMEDY"
                  ? t.statusDelayed
                  : t.statusCaution}
              </span>
            </div>

            <p className="text-sm md:text-base text-white font-medium leading-relaxed">
              {verdict.shortAnswer}
            </p>

            <div className="p-3.5 rounded-xl bg-[#0D0A14] border border-amber-400/20 text-xs md:text-sm">
              <span className="text-amber-300 font-bold">{t.timingLabel} </span>
              <span className="text-white font-semibold">{verdict.exactTiming}</span>
            </div>

            {!isUnlocked ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl font-bold text-sm md:text-base bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:brightness-110 active:scale-[0.99] transition cursor-pointer shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <span>🔓</span>
                  <span>{t.unlockBtn}</span>
                </button>

                {paymentPending && (
                  <div className="p-4 rounded-xl bg-[#1E1630] border border-amber-400/30 space-y-3">
                    <div className="text-xs text-amber-200 font-bold uppercase tracking-wider text-center">
                      Instant UPI Payment (₹149)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <a
                        href={upiUri}
                        className="py-2.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 text-center font-bold"
                      >
                        ⚡ Pay via UPI / GPay
                      </a>
                      <button
                        type="button"
                        onClick={confirmUpiPaid}
                        className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-center font-bold"
                      >
                        ✓ I Have Paid — Unlock Now
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 text-center">
                      Official Priest UPI: <strong className="text-white">9108135387@ybl</strong> (Shreeram Pandit)
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-3 border-t border-white/10 space-y-4">
                <div className="p-4 rounded-xl bg-[#110B1C] border border-emerald-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span>✓</span>
                    <span>{t.unlockedTitle}</span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                    {verdict.deepAnalysis}
                  </p>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                    <div className="text-xs font-bold text-amber-300">
                      {t.remedyTitle}
                    </div>
                    <p className="text-xs text-white">
                      {verdict.remedy}
                    </p>
                    <p className="text-[11px] text-[#C7B3A3] mt-1">
                      {t.priestNote}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openWhatsAppPriest}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>📲</span>
                  <span>{t.btnWhatsAppConsult}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePrashnaOraclePage;
