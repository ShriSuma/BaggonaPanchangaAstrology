import React from "react";
import type { KundliRemedyDiagnosis, SupportedLanguage } from "../../features/remedies/kundliRemedyEngine";

export type KundliRemedyPdfTemplateProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang?: string;
};

// UI Localization Dictionary for PDF (5 Languages)
const PDF_I18N: Record<SupportedLanguage, Record<string, string>> = {
  kn: {
    templeBanner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    mainTitle: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ",
    page2Title: "ಮನಃಶಾಂತಿ ಸಾಧನೆ, ದೈನಂದಿನ ಶಾಂತಿ ದಿನಚರ್ಯೆ & ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ",
    page3Title: "ದಶಾ-ಭುಕ್ತಿ ಫಲ, ಗೋಚಾರ ಪರಿಹಾರ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು & ಅರ್ಚಕರ ಆಶೀರ್ವಾದ",
    dhyanaShloka: "॥ ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ । ಚಂದ್ರಶೇಖರಂ ಪ್ರಣಮಾಮಿ ಸರ್ವ ಶಾಂತಿ ಪ್ರದಾಯಕಮ್ ॥",
    devotee: "ಜಾತಕರು:",
    gotraSuffix: "ಗೋತ್ರ",
    lagna: "ಲಗ್ನ:",
    rashi: "ರಾಶಿ:",
    nakshatra: "ನಕ್ಷತ್ರ:",
    birthDetails: "ಜನನ ವಿವರ:",
    panchangaTithiVara: "ತಿಥಿ & ವಾರ:",
    sec1Title: "೧. ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ & ಮುಖ್ಯ ಸವಾಲು",
    krodhaLabel: "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ",
    manasLabel: "ಮನೋ ಶಾಂತಿ",
    vitalityLabel: "ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ",
    patienceLabel: "ತಾಳ್ಮೆ / ಧೃತಿ",
    sec2Title: "೨. ಪಂಚಾಂಗ ೫-ಅಂಗ ದೈವಿಕ ಸಾಧನೆ & ನಕ್ಷತ್ರ ವೃಕ್ಷ",
    sec3Title: "೩. ತಕ್ಷಣ ಕೋಪ, ಆವೇಶ & ಆತಂಕ ಶಮನಗೊಳಿಸುವ ೪-ಹಂತದ ತತ್ತ್ವ",
    emergencyMantraTitle: "ಆಪತ್ಕಾಲೀನ ಮನಃಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಮನಸ್ಸಿನಲ್ಲೇ ೧೧ ಬಾರಿ ಜಪಿಸಿ):",
    sec4Title: "೪. ದೈನಂದಿನ ಪ್ರಾತಃಕಾಲ, ಮಧ್ಯಾಹ್ನ & ಸಂಧ್ಯಾಕಾಲದ ಶಾಂತಿ ನಿಯಮಾವಳಿ",
    morningTab: "🌅 ಮುಂಜಾನೆ (06:00 - 07:30)",
    afternoonTab: "🥗 ಮಧ್ಯಾಹ್ನ & ಸಾತ್ವಿಕ ಆಹಾರ",
    eveningTab: "🪔 ಮುಸ್ಸಂಜೆ & ರಾತ್ರಿ ಶಯನ",
    sec5Title: "೫. ಜನ್ಮ ಕುಂಡಲಿಗೆ ನಿಗದಿತ ದೈನಂದಿನ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ತೋತ್ರ",
    stotraRules: "ಪಠಣ ನಿಯಮ:",
    stotraTiming: "ಸಮಯ:",
    stotraDirection: "ದಿಕ್ಕು:",
    stotraCount: "ಆವರ್ತನೆ:",
    stotraBenefits: "ಫಲಶೃತಿ:",
    sec6Title: "೬. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಲೈವ್ ಗೋಚಾರ ಗ್ರಹಫಲ ಪರಿಹಾರ",
    currentDasha: "ಪ್ರಸ್ತುತ ಮಹಾದಶೆ & ಭುಕ್ತಿ:",
    activeKarmicFlow: "ದಶಾ ಪ್ರಭಾವ:",
    remedialStep: "ಪರಿಹಾರ ಕ್ರಮ:",
    sec7Title: "೭. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪವಿತ್ರ ಪರಿಹಾರಗಳು & ದಾನ",
    prescribedSeva: "ವಿಶೇಷ ಸೇವೆ:",
    rudraksha: "ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ:",
    gemstone: "ರತ್ನ / ಲೋಹ:",
    daana: "ದಾನ & ಗೋಸೇವೆ:",
    sec8Title: "೮. ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ",
    templeSealLabel: "ಅಧಿಕೃತ ಮುದ್ರೆ",
    priestContact: "ದೂರವಾಣಿ:",
    page1Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೧/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page2Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೨/೩ (ಮುಂದುವರಿದಿದೆ...)",
    page3Footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ · ಪುಟ ೩/೩ (ಸಂಪೂರ್ಣ)"
  },
  en: {
    templeBanner: "॥ SRI GOKARNA MAHABALESHWARA TEMPLE · BAGGONA PANCHANGA ASTROLOGY ॥",
    mainTitle: "Personalized Kundali Astrological Remedy & Pacification Report",
    page2Title: "Daily Mind Pacification Protocol & Classical Vedic Stotra",
    page3Title: "Dasha-Bhukti, Live Transits, Gokarna Temple Sevas & Priest Blessing",
    dhyanaShloka: "॥ Shantakaram Bhujagashayanam Padmanabham Suresham | Chandrashekharam Pranamami Sarva Shanti Pradayakam ॥",
    devotee: "Devotee:",
    gotraSuffix: "Gotra",
    lagna: "Lagna:",
    rashi: "Rashi:",
    nakshatra: "Nakshatra:",
    birthDetails: "Birth Details:",
    panchangaTithiVara: "Tithi & Vara:",
    sec1Title: "1. Kundali Root Cause & Struggle Diagnosis",
    krodhaLabel: "Pitta / Anger Surge",
    manasLabel: "Mental Stability",
    vitalityLabel: "Vitality / Prana Force",
    patienceLabel: "Patience Index",
    sec2Title: "2. Panchanga 5-Anga Sacred Alignment & Astral Tree",
    sec3Title: "3. 4-Step Instant Anger & Stress Pacification Protocol",
    emergencyMantraTitle: "Emergency Mind Pacification Mantra (Chant 11 times in mind):",
    sec4Title: "4. Daily Morning & Evening Pacification Routine",
    morningTab: "🌅 Morning (06:00 - 07:30)",
    afternoonTab: "🥗 Afternoon & Sattvic Diet",
    eveningTab: "🪔 Twilight & Restful Sleep",
    sec5Title: "5. Designated Daily Classical Vedic Stotra",
    stotraRules: "Recitation Rules:",
    stotraTiming: "Best Time:",
    stotraDirection: "Direction:",
    stotraCount: "Count:",
    stotraBenefits: "Spiritual Benefits:",
    sec6Title: "6. Active Dasha-Bhukti & Gochara (Transit) Shanti",
    currentDasha: "Active Dasha-Bhukti:",
    activeKarmicFlow: "Karmic Effect:",
    remedialStep: "Remedial Action:",
    sec7Title: "7. Sacred Sri Gokarna Mahabaleshwara Temple Remedies & Daana",
    prescribedSeva: "Prescribed Seva:",
    rudraksha: "Rudraksha:",
    gemstone: "Gemstone / Metal:",
    daana: "Daana & Goseva:",
    sec8Title: "8. Chief Priest Vedic Blessing & Official Temple Seal",
    templeSealLabel: "Official Temple Seal",
    priestContact: "Contact:",
    page1Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 1 of 3 (Continued...)",
    page2Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 2 of 3 (Continued...)",
    page3Footer: "Sri Gokarna Kshetra · Baggona Panchanga Astrology · Page 3 of 3 (Complete)"
  },
  hi: {
    templeBanner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    mainTitle: "जन्म कुंडली आधारित वैदिक ज्योतिषीय उपाय एवं मनःशांति रिपोर्ट",
    page2Title: "मनःशांति साधना, दैनिक शांति नियमावली एवं शास्त्रीय स्तोत्र",
    page3Title: "दशा-भुक्ति फल, गोचर शांति, गोकर्ण क्षेत्र सेवाएं एवं अर्चक आशीर्वाद",
    dhyanaShloka: "॥ शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं । चन्द्रशेखरं प्रणमामि सर्व शान्ति प्रदायकम् ॥",
    devotee: "जातक:",
    gotraSuffix: "गोत्र",
    lagna: "लग्न:",
    rashi: "राशि:",
    nakshatra: "नक्षत्र:",
    birthDetails: "जन्म विवरण:",
    panchangaTithiVara: "तिथि एवं वार:",
    sec1Title: "१. कुंडली ग्रहदोष विश्लेषण एवं मुख्य चुनौती",
    krodhaLabel: "क्रोध / पित्त स्तर",
    manasLabel: "मानसिक शांति",
    vitalityLabel: "आत्मबल / प्राणशक्ति",
    patienceLabel: "धैर्य सूचकांक",
    sec2Title: "२. पंचांग ५-अंग दैवीय साधना एवं नक्षत्र वृक्ष",
    sec3Title: "३. तत्काल क्रोध एवं आवेग शमन हेतु ४-चरणीय विधि",
    emergencyMantraTitle: "आपत्कालीन मनःशांति बीज मंत्र (मन ही मन ११ बार जपें):",
    sec4Title: "४. दैनिक प्रातःकालीन एवं संध्याकालीन शांति नियमावली",
    morningTab: "🌅 प्रातःकाल (06:00 - 07:30)",
    afternoonTab: "🥗 दोपहर एवं सात्विक आहार",
    eveningTab: "🪔 सायंकाल एवं शयन",
    sec5Title: "५. कुंडली अनुसार निर्धारित दैनिक शास्त्रीय स्तोत्र",
    stotraRules: "पठन नियम:",
    stotraTiming: "समय:",
    stotraDirection: "दिशा:",
    stotraCount: "आवृत्ति:",
    stotraBenefits: "फलश्रुति:",
    sec6Title: "६. वर्तमान दशा-भुक्ति एवं गोचर ग्रहफल शांति",
    currentDasha: "वर्तमान महादशा एवं भुक्ति:",
    activeKarmicFlow: "दशा प्रभाव:",
    remedialStep: "उपाय क्रम:",
    sec7Title: "७. श्री गोकर्ण महाबलेश्वर सन्निधि के पावन उपाय एवं दान",
    prescribedSeva: "विशेष सेवा:",
    rudraksha: "रुद्राक्ष धारण:",
    gemstone: "रत्न / धातु:",
    daana: "दान एवं गौसेवा:",
    sec8Title: "८. प्रधान अर्चक का आशीर्वचन एवं गोकर्ण मुद्रा",
    templeSealLabel: "आधिकारिक मुद्रा",
    priestContact: "संपर्क:",
    page1Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ १/३ (आगे जारी...)",
    page2Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ २/३ (आगे जारी...)",
    page3Footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष · पृष्ठ ३/३ (संपूर्ण)"
  },
  te: {
    templeBanner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    mainTitle: "జన్మ కుండలి ఆధారిత దైవిక జ్యోతిష్య పరిహార & మనశ్శాంతి నివేదిక",
    page2Title: "మనశ్శాంతి సాధన, దైనందిన నియమావళి & జన్మ నక్షత్ర స్తోత్రం",
    page3Title: "దశా-భుక్తి ఫలం, గోచార పరిహారం, గోకర్ణ క్షేత్ర సేవలు & అర్చకుల ఆశీర్వచనం",
    dhyanaShloka: "॥ శాంతాకారం భుజగశయనం పద్మనాభం సురేశం । చంద్రశేఖరం ప్రణమామి సర్వ శాంతి ప్రదాయకమ్ ॥",
    devotee: "జాతకుడు:",
    gotraSuffix: "గోత్రం",
    lagna: "లగ్నం:",
    rashi: "రాశి:",
    nakshatra: "నక్షత్రం:",
    birthDetails: "జన్మ వివరాలు:",
    panchangaTithiVara: "తిథి & వారం:",
    sec1Title: "1. కుండలి గ్రహదోష విశ్లేషణ & ప్రధాన సవాలు",
    krodhaLabel: "క్రోధం / పిత్తం",
    manasLabel: "మనశ్శాంతి",
    vitalityLabel: "ఆత్మబలం",
    patienceLabel: "ఓపిక",
    sec2Title: "2. పంచాంగ 5-అంగ దైవిక సాధన & నక్షత్ర వృక్షం",
    sec3Title: "3. తక్షణ కోపం & ఆవేశ నివారణ 4-దశల విధానం",
    emergencyMantraTitle: "ఆపత్కాలీన మనశ్శాంతి బీజ మంత్రం (మనస్సులో 11 సార్లు జపించండి):",
    sec4Title: "4. దైనందిన ప్రాతఃకాల & సంధ్యా సమయ నియమావళి",
    morningTab: "🌅 ఉదయం (06:00 - 07:30)",
    afternoonTab: "🥗 మధ్యాహ్నం & సాత్విక ఆహారం",
    eveningTab: "🪔 సాయంత్రం & ప్రశాంత నిద్ర",
    sec5Title: "5. జన్మ కుండలికి నిర్దేశించిన నిత్య స్తోత్రం",
    stotraRules: "పఠన నియమం:",
    stotraTiming: "సమయం:",
    stotraDirection: "దిశ:",
    stotraCount: "సంఖ్య:",
    stotraBenefits: "ఫలితం:",
    sec6Title: "6. ప్రస్తుత దశా-భుక్తి & గోచార గ్రహ పరిహారాలు",
    currentDasha: "ప్రస్తుత మహాదశ & భుక్తి:",
    activeKarmicFlow: "దశా ప్రభావం:",
    remedialStep: "పరిహార మార్గం:",
    sec7Title: "7. శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్ర పవిత్ర పరిహారాలు & దానం",
    prescribedSeva: "విశేష సేవ:",
    rudraksha: "రుద్రాక్ష ధారణ:",
    gemstone: "రత్నం / లోహం:",
    daana: "దానం & గోసేవ:",
    sec8Title: "8. ప్రధాన అర్చకుల ఆశీర్వచనం & గోకర్ణ ముద్ర",
    templeSealLabel: "అధికారిక ముద్ర",
    priestContact: "ఫోన్:",
    page1Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 1/3 (కొనసాగింపు...)",
    page2Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 2/3 (కొనసాగింపు...)",
    page3Footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం · పేజీ 3/3 (సంపూర్ణం)"
  },
  ta: {
    templeBanner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்ககோண பஞ்சாங்க ஜோதிடம் ॥",
    mainTitle: "ஜாதக அடிப்படையிலான தெய்வீக பரிகாரம் & மன அமைதி அறிக்கை",
    page2Title: "மன அமைதி சாதனை, தினசரி வழிபாட்டு முறை & ஸ்தோத்திரம்",
    page3Title: "திசை-புக்தி பலன், கோசார பரிகாரம், ஆலய பூஜைகள் & அர்ச்சகர் ஆசி",
    dhyanaShloka: "॥ சாந்தாகாரம் புஜகசயனம் பத்மநாபம் ஸுரேசம் । சந்த்ரசேகரம் ப்ரணமாமி ஸர்வ சாந்தி ப்ரதாயகம் ॥",
    devotee: "ஜாதகர்:",
    gotraSuffix: "கோத்திரம்",
    lagna: "லக்னம்:",
    rashi: "ராசி:",
    nakshatra: "நட்சத்திரம்:",
    birthDetails: "பிறப்பு விவரம்:",
    panchangaTithiVara: "திதி & வாரம்:",
    sec1Title: "1. ஜாதக கிரக தோஷ பகுப்பாய்வு & முக்கிய சவால்",
    krodhaLabel: "கோபம் / பித்தம்",
    manasLabel: "மன அமைதி",
    vitalityLabel: "ஆத்ம பலம்",
    patienceLabel: "பொறுமை",
    sec2Title: "2. பஞ்சாங்க 5-அங்க தெய்வீக சாதனை & நட்சத்திர மரம்",
    sec3Title: "3. உடனடி கோபத்தை தணிக்கும் 4-படிமுறை விதிகள்",
    emergencyMantraTitle: "அவசர மன அமைதி பீஜ மந்திரம் (மனதில் 11 முறை ஜபிக்கவும்):",
    sec4Title: "4. தினசரி காலை மற்றும் மாலை வழிபாட்டு முறைகள்",
    morningTab: "🌅 காலை (06:00 - 07:30)",
    afternoonTab: "🥗 மதியம் & சாத்வீக உணவு",
    eveningTab: "🪔 மாலை & அமைதியான உறக்கம்",
    sec5Title: "5. ஜாதகத்திற்குரிய தினசரி ஸ்தோத்திரம்",
    stotraRules: "வழிபாட்டு விதி:",
    stotraTiming: "நேரம்:",
    stotraDirection: "திசை:",
    stotraCount: "எண்ணிக்கை:",
    stotraBenefits: "பலன்கள்:",
    sec6Title: "6. நடப்பு திசை-புக்தி & கோசார கிரக பரிகாரங்கள்",
    currentDasha: "நடப்பு மகாதிசை & புக்தி:",
    activeKarmicFlow: "திசை பலன்:",
    remedialStep: "பரிகாரம்:",
    sec7Title: "7. ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலய வழிபாடுகள் & தானம்",
    prescribedSeva: "சிறப்பு பூஜை:",
    rudraksha: "ருத்ராட்சம்:",
    gemstone: "ரத்தினம் / உலோகம்:",
    daana: "தானம் & கோபூஜை:",
    sec8Title: "8. தலைமை அர்ச்சகரின் ஆசி & ஆலய முத்திரை",
    templeSealLabel: "அங்கீகரிக்கப்பட்ட முத்திரை",
    priestContact: "தொலைபேசி:",
    page1Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 1/3 (தொடர்கிறது...)",
    page2Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 2/3 (தொடர்கிறது...)",
    page3Footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சன்னிதானம் · பக்கம் 3/3 (முழுமை)"
  }
};

export const KundliRemedyPdfTemplate: React.FC<KundliRemedyPdfTemplateProps> = ({
  diagnosis,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2) as SupportedLanguage;
  const isKn = code === "kn";
  const isHi = code === "hi";
  const isTe = code === "te";
  const isTa = code === "ta";
  const i18n = PDF_I18N[code] || PDF_I18N.kn;

  const {
    devoteeName,
    birthDate,
    birthTime,
    gotra,
    lagnaName,
    rashiName,
    nakshatraName,
    primaryStruggle,
    lifeTurnaroundTiming,
    afflictionFactors,
    psychologicalProfile,
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    panchangaRemedies,
    planetaryStrengthRemedies,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  } = diagnosis;

  const stotra = personalizedStotras[0] || personalizedStotras[1];

  const getShlokaByLang = (st: typeof stotra) => {
    if (!st) return "";
    if (code === "te") return st.shlokaTelugu;
    if (code === "ta") return st.shlokaTamil;
    if (code === "hi") return st.shlokaHindi;
    if (code === "en") return st.shlokaSanskrit;
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (code === "te") return bm.telugu;
    if (code === "ta") return bm.tamil;
    if (code === "hi") return bm.hindi;
    if (code === "en") return bm.sanskrit;
    return bm.kannada;
  };

  // Robust Indic font stack with zero-broken vattaksharas
  const fontFamily = isKn
    ? "'Noto Serif Kannada', 'Tiro Kannada', 'Kaveri', 'Segoe UI', serif, sans-serif"
    : code === "te"
    ? "'Noto Serif Telugu', 'Tiro Telugu', serif, sans-serif"
    : code === "ta"
    ? "'Noto Serif Tamil', 'Tiro Tamil', serif, sans-serif"
    : code === "hi"
    ? "'Noto Serif Devanagari', 'Tiro Devanagari Hindi', serif, sans-serif"
    : "'Cinzel', 'Noto Serif', 'Georgia', serif, sans-serif";

  return (
    <div
      id="kundli-remedy-pdf-container"
      style={{
        width: "794px",
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF7",
        fontFamily,
        color: "#261605",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: JANANA KUNDALI, PANCHANGA 5-ANGAS & ROOT STRUGGLE DIAGNOSIS    */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "10px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "17.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "3px", lineHeight: 1.35 }}>
              {i18n.mainTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#FEF08A", marginTop: "2px", fontStyle: "italic", lineHeight: 1.4 }}>
              {i18n.dhyanaShloka}
            </div>
          </div>

          {/* Devotee Info Matrix: 6-item comprehensive birth coordinates */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "9px 14px",
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: "8px",
              fontSize: "12px",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
            }}
          >
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>👤 {i18n.devotee}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 900 }}>{devoteeName}</span>
              {gotra && <span style={{ color: "#92400E", fontSize: "11px", display: "inline-block", marginLeft: "4px" }}>({gotra} {i18n.gotraSuffix})</span>}
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🏛️ {i18n.lagna}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 900 }}>{lagnaName[code] || lagnaName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌙 {i18n.rashi}</span>{" "}
              <span style={{ color: "#92400E", fontWeight: 900 }}>{rashiName[code] || rashiName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>⭐ {i18n.nakshatra}</span>{" "}
              <span style={{ color: "#1E3A8A", fontWeight: 900 }}>{nakshatraName[code] || nakshatraName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>📅 {i18n.birthDetails}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 700 }}>{birthDate} {birthTime}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌿 {i18n.panchangaTithiVara}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 700 }}>
                {panchangaRemedies ? `${panchangaRemedies.tithiRemedy.tithiName[code] || panchangaRemedies.tithiRemedy.tithiName.kn}, ${panchangaRemedies.varaRemedy.dayName[code] || panchangaRemedies.varaRemedy.dayName.kn}` : "ಶುಭ ದಿನ"}
              </span>
            </div>
          </div>

          {/* AI Narration or 10-Retry Fallback Warning Banner */}
          {diagnosis.isAiGenerated && diagnosis.aiNarrationText?.[code] ? (
            <div
              style={{
                background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
                border: "1.5px solid #818CF8",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#FFFFFF",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  paddingBottom: "2px"
                }}
              >
                <span style={{ fontSize: "11.5px", fontWeight: 900, color: "#FDE68A" }}>
                  ✨ {code === "kn"
                    ? "AI ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ನಿರೂಪಣೆ (Gemini 3.5 Flash Lite)"
                    : code === "hi"
                    ? "AI दैविक ज्योतिष विवरण (Gemini 3.5 Flash Lite)"
                    : code === "te"
                    ? "AI దైవిక జ్యోతిష్య వివరణ (Gemini 3.5 Flash Lite)"
                    : code === "ta"
                    ? "AI தெய்வீக ஜோதிட உரை (Gemini 3.5 Flash Lite)"
                    : "AI Divine Astrological Narration (Gemini 3.5 Flash Lite)"}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    background: "rgba(16, 185, 129, 0.25)",
                    color: "#6EE7B7",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    fontWeight: 800
                  }}
                >
                  {code === "kn" ? "ಖಚಿತ ಜಾತಕ ವಿಶ್ಲೇಷಣೆ" : "Accurate Analysis"}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: "#E0E7FF", lineHeight: 1.4, whiteSpace: "pre-line" }}>
                {diagnosis.aiNarrationText[code]}
              </div>
            </div>
          ) : null}

          {/* Section 1: Astrological Diagnosis & Struggle Identification */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🔍 {i18n.sec1Title}</span>
              <span
                style={{
                  background: primaryStruggle.intensity === "High" ? "#FEE2E2" : "#FEF3C7",
                  color: primaryStruggle.intensity === "High" ? "#991B1B" : "#92400E",
                  border: `1px solid ${primaryStruggle.intensity === "High" ? "#F87171" : "#FBBF24"}`,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 800
                }}
              >
                {primaryStruggle.intensityLabel[code] || primaryStruggle.intensityLabel.kn}
              </span>
            </div>

            <div style={{ fontSize: "12px", color: "#451A03", lineHeight: 1.55, fontWeight: 700 }}>
              <span style={{ color: "#991B1B" }}>• {primaryStruggle.title[code] || primaryStruggle.title.kn}:</span>{" "}
              <span style={{ color: "#27272A", fontWeight: 500 }}>{primaryStruggle.description[code] || primaryStruggle.description.kn}</span>
            </div>

            {/* Affliction Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
              {afflictionFactors.slice(0, 2).map((af, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11.5px",
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E" }}>🔥 {af.title[code] || af.title.kn}</div>
                  <div style={{ color: "#451A03", marginTop: "2px" }}>{af.reason[code] || af.reason.kn}</div>
                </div>
              ))}
            </div>

            {/* Psychological & Temperament Meters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px dashed #E5E7EB",
                textAlign: "center"
              }}
            >
              <div style={{ background: "#FEF2F2", padding: "6px 4px", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ color: "#991B1B", fontWeight: 800, fontSize: "11px" }}>{i18n.krodhaLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#B91C1C", marginTop: "1px" }}>{psychologicalProfile.krodhaLevel}%</div>
              </div>
              <div style={{ background: "#F0FDF4", padding: "6px 4px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ color: "#166534", fontWeight: 800, fontSize: "11px" }}>{i18n.manasLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#15803D", marginTop: "1px" }}>{psychologicalProfile.manasStability}%</div>
              </div>
              <div style={{ background: "#EFF6FF", padding: "6px 4px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ color: "#1E40AF", fontWeight: 800, fontSize: "11px" }}>{i18n.vitalityLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#1D4ED8", marginTop: "1px" }}>{psychologicalProfile.vitalityScore}%</div>
              </div>
              <div style={{ background: "#FAF5FF", padding: "6px 4px", borderRadius: "6px", border: "1px solid #E9D5FF" }}>
                <div style={{ color: "#6B21A8", fontWeight: 800, fontSize: "11px" }}>{i18n.patienceLabel}</div>
                <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#7E22CE", marginTop: "1px" }}>{psychologicalProfile.patienceIndex}%</div>
              </div>
            </div>
          </div>

          {/* Section 2: Panchanga 5-Angas Divine Anchor & Sacred Tree */}
          {panchangaRemedies && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #D97706",
                borderRadius: "9px",
                padding: "10px 14px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 900,
                  color: "#78350F",
                  borderBottom: "1.5px solid #FDE68A",
                  paddingBottom: "5px",
                  marginBottom: "7px"
                }}
              >
                🌿 {i18n.sec2Title}
              </div>

              {/* Nakshatra & Sacred Tree */}
              <div
                style={{
                  background: "#F0FDF4",
                  border: "1px solid #86EFAC",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  fontSize: "11.5px",
                  lineHeight: 1.5,
                  marginBottom: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#166534" }}>
                  <span>⭐ {isKn ? "ಜನ್ಮ ನಕ್ಷತ್ರ & ಪವಿತ್ರ ನಕ್ಷತ್ರ ವೃಕ್ಷ:" : isHi ? "जन्म नक्षत्र एवं पवित्र नक्षत्र वृक्ष:" : isTe ? "జన్మ నక్షత్రం & పవిత్ర వృక్షం:" : isTa ? "ஜன்ம நட்சத்திரம் & புனித மரம்:" : "Birth Nakshatra & Sacred Astral Tree:"} {panchangaRemedies.nakshatraRemedy.nakshatraName[code] || panchangaRemedies.nakshatraRemedy.nakshatraName.en || panchangaRemedies.nakshatraRemedy.nakshatraName.kn} ({isKn ? "ಪಾದ" : isHi ? "चरण" : isTe ? "పాద" : isTa ? "பாதம்" : "Pada"} {panchangaRemedies.nakshatraRemedy.pada})</span>
                  <span style={{ background: "#DCFCE7", color: "#14532D", padding: "1px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 800 }}>
                    {isKn ? "ದೇವತೆ: " : isHi ? "देवता: " : isTe ? "దేవత: " : isTa ? "தெய்வம்: " : "Deity: "}{panchangaRemedies.nakshatraRemedy.rulingDeity[code] || panchangaRemedies.nakshatraRemedy.rulingDeity.kn}
                  </span>
                </div>
                <div style={{ color: "#14532D", marginTop: "3px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ಪವಿತ್ರ ವೃಕ್ಷ: " : isHi ? "• पवित्र वृक्ष: " : isTe ? "• పవిత్ర వృక్షం: " : isTa ? "• புனித மரம்: " : "• Sacred Tree: "}</span>
                  <span style={{ fontWeight: 900, color: "#166534" }}>{panchangaRemedies.nakshatraRemedy.sacredTree.kannada}</span> ({panchangaRemedies.nakshatraRemedy.sacredTree.botanicalName}) — {panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod[code] || panchangaRemedies.nakshatraRemedy.sacredTree.worshipMethod.kn}
                </div>
                <div style={{ color: "#166534", marginTop: "2px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ನಕ್ಷತ್ರ ಬೀಜ ಮಂತ್ರ: " : isHi ? "• नक्षत्र बीज मंत्र: " : isTe ? "• నక్షత్ర బీజ మంత్రం: " : isTa ? "• நட்சத்திர பீஜ மந்திரம்: " : "• Beeja Mantra: "}</span>
                  <span style={{ fontWeight: 900, color: "#065F46" }}>{panchangaRemedies.nakshatraRemedy.beejaMantra.kannada || panchangaRemedies.nakshatraRemedy.beejaMantra.sanskrit}</span> ({panchangaRemedies.nakshatraRemedy.beejaMantra.meaning[code] || panchangaRemedies.nakshatraRemedy.beejaMantra.meaning.kn})
                </div>
              </div>

              {/* 4 Angas Grid: Tithi, Vara, Yoga, Karana */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {/* Tithi */}
                <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "7px 10px", fontSize: "11px", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    🌕 {isKn ? "ತಿಥಿ & ಪಕ್ಷ ದೈವಿಕ ಸಾಧನೆ" : isHi ? "तिथि एवं पक्ष दैवीय साधना" : isTe ? "తిథి & పక్ష దైవిక సాధన" : isTa ? "திதி & பட்ச வழிபாட்டு முறை" : "Tithi & Paksha Alignment"}
                  </div>
                  <div style={{ color: "#451A03", fontWeight: 700, marginTop: "2px" }}>
                    {panchangaRemedies.tithiRemedy.tithiName[code] || panchangaRemedies.tithiRemedy.tithiName.en || panchangaRemedies.tithiRemedy.tithiName.kn} ({panchangaRemedies.tithiRemedy.paksha === "Shukla" ? (isKn ? "ಶುಕ್ಲ ಪಕ್ಷ" : isHi ? "शुक्ल पक्ष" : isTe ? "శుక్ల పక్షం" : isTa ? "சுக்ல பட்சம்" : "Shukla Paksha") : (isKn ? "ಕೃಷ್ಣ ಪಕ್ಷ" : isHi ? "कृष्ण पक्ष" : isTe ? "కృష్ణ పక్షం" : isTa ? "கிருஷ்ண பட்சம்" : "Krishna Paksha")})
                  </div>
                  <div style={{ color: "#78350F", marginTop: "2px" }}>
                    {panchangaRemedies.tithiRemedy.vrataAndRemedy[code] || panchangaRemedies.tithiRemedy.vrataAndRemedy.kn}
                  </div>
                </div>

                {/* Vara */}
                <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "7px 10px", fontSize: "11px", lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    ☀️ {isKn ? "ಜನ್ಮ ವಾರ & ಗ್ರಹಾಧಿಪತಿ ಸಾಧನೆ" : isHi ? "जन्म वार एवं ग्रह साधना" : isTe ? "జన్మ వారం & గ్రహ సాధన" : isTa ? "ஜன்ம வாரம் & கிரக வழிபாடு" : "Weekday & Planetary Ruler"}
                  </div>
                  <div style={{ color: "#451A03", fontWeight: 700, marginTop: "2px" }}>
                    {panchangaRemedies.varaRemedy.dayName[code] || panchangaRemedies.varaRemedy.dayName.en || panchangaRemedies.varaRemedy.dayName.kn} · {isKn ? "ಶುಭ ಬಣ್ಣ: " : isHi ? "शुभ रंग: " : isTe ? "శుభ రంగు: " : isTa ? "சுப வண்ணம்: " : "Color: "}<span style={{ color: "#B45309", fontWeight: 900 }}>{panchangaRemedies.varaRemedy.dailyColor[code] || panchangaRemedies.varaRemedy.dailyColor.en || panchangaRemedies.varaRemedy.dailyColor.kn}</span>
                  </div>
                  <div style={{ color: "#78350F", marginTop: "2px" }}>
                    {panchangaRemedies.varaRemedy.dailySadhana[code] || panchangaRemedies.varaRemedy.dailySadhana.kn}
                  </div>
                </div>

                {/* Yoga */}
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "7px 10px", fontSize: "11px", lineHeight: 1.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#166534" }}>
                    <span>🧘 {isKn ? "ಜನ್ಮ ಯೋಗ: " : isHi ? "जन्म योग: " : isTe ? "జన్మ యోగం: " : isTa ? "ஜன்ம யோகம்: " : "Birth Yoga: "}{panchangaRemedies.yogaRemedy.yogaName[code] || panchangaRemedies.yogaRemedy.yogaName.kn}</span>
                    <span style={{ fontSize: "10px", background: panchangaRemedies.yogaRemedy.isAuspicious ? "#DCFCE7" : "#FEE2E2", color: panchangaRemedies.yogaRemedy.isAuspicious ? "#15803D" : "#991B1B", padding: "1px 6px", borderRadius: "6px", fontWeight: 800 }}>
                      {panchangaRemedies.yogaRemedy.isAuspicious ? (isKn ? "ಶುಭ ಯೋಗ" : isHi ? "शुभ योग" : isTe ? "శుభ యోగం" : isTa ? "சுப யோகம்" : "Auspicious") : (isKn ? "ಶಾಂತಿ ಅಗತ್ಯ" : isHi ? "शांति आवश्यक" : isTe ? "శాంతి అవసరం" : isTa ? "சாந்தி தேவை" : "Shanti Needed")}
                    </span>
                  </div>
                  <div style={{ color: "#14532D", marginTop: "2px" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "• ದೇವತೆ: " : isHi ? "• देवता: " : isTe ? "• దేవత: " : isTa ? "• தெய்வம்: " : "• Deity: "}</span>{panchangaRemedies.yogaRemedy.deity}
                  </div>
                  <div style={{ color: "#166534", marginTop: "2px" }}>
                    {panchangaRemedies.yogaRemedy.shantiPractice[code] || panchangaRemedies.yogaRemedy.shantiPractice.kn}
                  </div>
                </div>

                {/* Karana */}
                <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "6px", padding: "7px 10px", fontSize: "11px", lineHeight: 1.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#1E40AF" }}>
                    <span>⚡ {isKn ? "ಜನ್ಮ ಕರಣ: " : isHi ? "जन्म करण: " : isTe ? "జన్మ కరణం: " : isTa ? "ஜன்ம கரணம்: " : "Birth Karana: "}{panchangaRemedies.karanaRemedy.karanaName[code] || panchangaRemedies.karanaRemedy.karanaName.kn}</span>
                    <span style={{ fontSize: "10px", background: "#DBEAFE", color: "#1D4ED8", padding: "1px 6px", borderRadius: "6px", fontWeight: 800 }}>
                      {isKn ? "ತತ್ತ್ವ: " : isHi ? "तत्व: " : isTe ? "తత్త్వం: " : isTa ? "தத்துவம்: " : "Element: "}{panchangaRemedies.karanaRemedy.tatva}
                    </span>
                  </div>
                  <div style={{ color: "#1E3A8A", marginTop: "2px" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "• ಅಧಿದೇವತೆ: " : isHi ? "• अधिदेवता: " : isTe ? "• అధిదేవత: " : isTa ? "• அதிதேவதை: " : "• Presiding Deity: "}</span>{panchangaRemedies.karanaRemedy.deity}
                  </div>
                  <div style={{ color: "#1E40AF", marginTop: "2px" }}>
                    {panchangaRemedies.karanaRemedy.karyaShanti[code] || panchangaRemedies.karanaRemedy.karyaShanti.kn}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page 1 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            {i18n.page1Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: INSTANT ANGER PACIFICATION, DAILY ROUTINE & DESIGNATED STOTRA  */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "9px 16px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "16.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.35 }}>
              {i18n.page2Title}
            </div>
          </div>

          {/* Section 3: 4-Step Instant Anger Calming Protocol */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "6px"
              }}
            >
              ⚡ {i18n.sec3Title}
            </div>
            <div style={{ fontSize: "11.5px", color: "#92400E", marginBottom: "7px", fontWeight: 700, lineHeight: 1.45 }}>
              {instantCalmingProtocol.subtitle[code] || instantCalmingProtocol.subtitle.kn}
            </div>

            {/* 4-Step Action Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {instantCalmingProtocol.steps.map(step => (
                <div
                  key={step.stepNumber}
                  style={{
                    background: "#FEFCE8",
                    border: "1px solid #FDE047",
                    borderRadius: "6px",
                    padding: "7px 10px",
                    fontSize: "11.5px",
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, color: "#92400E" }}>
                    <span>{step.icon} {step.name[code] || step.name.kn}</span>
                    <span style={{ fontSize: "10.5px", background: "#FEF08A", padding: "1px 6px", borderRadius: "8px", color: "#854D0E" }}>
                      {typeof step.duration === "object" ? step.duration[code] || step.duration.kn : step.duration}
                    </span>
                  </div>
                  <div style={{ color: "#451A03", marginTop: "3px", fontWeight: 700 }}>
                    {step.action[code] || step.action.kn}
                  </div>
                  <div style={{ color: "#713F12", marginTop: "2px", fontSize: "11px", lineHeight: 1.45 }}>
                    {step.detail[code] || step.detail.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Beeja Japa Box */}
            <div
              style={{
                marginTop: "8px",
                background: "linear-gradient(135deg, #451A03 0%, #78350F 100%)",
                borderRadius: "7px",
                padding: "8px 12px",
                color: "#FFFFFF",
                border: "1.5px solid #F59E0B",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 800, marginBottom: "2px" }}>
                🕉️ {i18n.emergencyMantraTitle}
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#FFFFFF", letterSpacing: "normal", lineHeight: 1.6 }}>
                {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
              </div>
              <div style={{ fontSize: "11px", color: "#FEF08A", marginTop: "2px", lineHeight: 1.45 }}>
                {instantCalmingProtocol.emergencyBeejaMantra.meaning[code] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}
              </div>
            </div>
          </div>

          {/* Section 4: Daily Morning & Evening Pacification Routine */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "9px",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "5px",
                marginBottom: "7px"
              }}
            >
              🗓️ {i18n.sec4Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {/* Morning */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#92400E", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.morningTab}
                </div>
                {dailyPacificationRoutine.morning.map((m, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#451A03" }}>{m.icon} {m.title[code] || m.title.kn}:</span>{" "}
                    <span style={{ color: "#78350F" }}>{m.desc[code] || m.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Afternoon / Diet */}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#166534", borderBottom: "1px dashed #86EFAC", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.afternoonTab}
                </div>
                {dailyPacificationRoutine.afternoonLifestyle.map((a, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#14532D" }}>{a.icon} {a.title[code] || a.title.kn}:</span>{" "}
                    <span style={{ color: "#166534" }}>{a.desc[code] || a.desc.kn}</span>
                  </div>
                ))}
              </div>

              {/* Evening / Night */}
              <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: "6px", padding: "7px 9px", fontSize: "11.5px", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: "#6B21A8", borderBottom: "1px dashed #D8B4FE", paddingBottom: "3px", marginBottom: "4px" }}>
                  {i18n.eveningTab}
                </div>
                {dailyPacificationRoutine.evening.map((e, idx) => (
                  <div key={idx} style={{ marginTop: idx === 0 ? "0px" : "5px" }}>
                    <span style={{ fontWeight: 800, color: "#581C87" }}>{e.icon} {e.title[code] || e.title.kn}:</span>{" "}
                    <span style={{ color: "#6B21A8" }}>{e.desc[code] || e.desc.kn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Personalized Daily Classical Stotra */}
          {stotra && (
            <div
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #D97706",
                borderRadius: "9px",
                padding: "10px 14px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  fontSize: "13.5px",
                  fontWeight: 900,
                  color: "#78350F",
                  borderBottom: "1.5px solid #FDE68A",
                  paddingBottom: "5px",
                  marginBottom: "7px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>📜 {i18n.sec5Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", fontWeight: 800, background: "#FEF08A", padding: "2px 8px", borderRadius: "10px" }}>
                  {stotra.dedicatedTo[code] || stotra.dedicatedTo.kn}
                </span>
              </div>

              <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", marginBottom: "5px" }}>
                ✨ {stotra.title[code] || stotra.title.kn}
              </div>

              {/* Shloka Box with pristine vattaksharas */}
              <div
                style={{
                  background: "#FFFBEB",
                  border: "1px solid #FCD34D",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  textAlign: "center",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#451A03",
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                  letterSpacing: "normal"
                }}
              >
                {getShlokaByLang(stotra)}
              </div>

              <div style={{ fontSize: "11.5px", color: "#78350F", marginTop: "6px", lineHeight: 1.55 }}>
                <span style={{ fontWeight: 800, color: "#92400E" }}>{isKn ? "• ಅರ್ಥ: " : isHi ? "• अर्थ: " : isTe ? "• భావం: " : isTa ? "• பொருள்: " : "• Meaning: "}</span> {stotra.meaning[code] || stotra.meaning.kn}
              </div>

              {/* Stotra Metadata Rules */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1.3fr",
                  gap: "6px",
                  marginTop: "6px",
                  paddingTop: "5px",
                  borderTop: "1px dashed #FDE68A",
                  fontSize: "11px"
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>⏰ {i18n.stotraTiming}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.bestTimeToRecite[code] || stotra.bestTimeToRecite.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>🧭 {i18n.stotraDirection}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.facingDirection[code] || stotra.facingDirection.kn}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: "#78350F" }}>📿 {i18n.stotraCount}</span>{" "}
                  <span style={{ color: "#451A03" }}>{stotra.recitationCount[code] || stotra.recitationCount.kn}</span>
                </div>
              </div>

              <div style={{ fontSize: "11.5px", color: "#065F46", marginTop: "4px", fontWeight: 700, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 800 }}>🌿 {i18n.stotraBenefits} </span>
                {stotra.spiritualBenefits[code] || stotra.spiritualBenefits.kn}
              </div>
            </div>
          )}

          {/* Page 2 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            {i18n.page2Footer}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 3: DASHA/GOCHARA SHANTI, GOKARNA SEVAS & PRIEST ASHIRVADA & SEAL  */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            maxHeight: "1091px",
            border: "3px double #92400E",
            outline: "1.5px solid #D97706",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "12px 14px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "8px",
              padding: "7px 14px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A", letterSpacing: "normal" }}>
              {i18n.templeBanner}
            </div>
            <div style={{ fontSize: "14.5px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px", lineHeight: 1.3 }}>
              {i18n.page3Title}
            </div>
          </div>

          {/* Section 6: Dasha-Bhukti & Gochara Transits */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "5px"
              }}
            >
              🪐 {i18n.sec6Title}
            </div>

            {/* Dasha Card */}
            <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", lineHeight: 1.4 }}>
              <div style={{ fontWeight: 800, color: "#92400E" }}>
                <span>⏳ {i18n.currentDasha} </span>
                <span style={{ color: "#B45309", fontWeight: 900 }}>
                  {isKn
                    ? `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en || dashaBhuktiAnalysis.mahaDashaLabel.kn}${isKn ? " ಮಹಾದಶೆ — " : isHi ? " महादशा — " : isTe ? " మహర్దశ — " : isTa ? " மகாதிசை — " : " Mahadasha — "}${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en || dashaBhuktiAnalysis.bhuktiLabel.kn}${isKn ? " ಭುಕ್ತಿ" : isHi ? " भुक्ति" : isTe ? " భుక్తి" : isTa ? " புக்தி" : " Bhukti"}`
                    : `${dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.en} Dasha — ${dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.en} Bhukti`}
                </span>
              </div>
              <div style={{ color: "#451A03", marginTop: "2px" }}>
                <span style={{ fontWeight: 800 }}>• {i18n.activeKarmicFlow} </span>
                {dashaBhuktiAnalysis.periodEffect[code] || dashaBhuktiAnalysis.periodEffect.kn}
              </div>
              <div style={{ color: "#065F46", marginTop: "2px", fontWeight: 700 }}>
                <span style={{ fontWeight: 800 }}>• {i18n.remedialStep} </span>
                {dashaBhuktiAnalysis.remedialAction[code] || dashaBhuktiAnalysis.remedialAction.kn}
              </div>
            </div>

            {/* Turnaround Timing Box (ಭಾಗ್ಯೋದಯ ಕಾಲಾವಧಿ) */}
            {lifeTurnaroundTiming && (
              <div style={{ marginTop: "5px", background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", lineHeight: 1.4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 900, color: "#78350F" }}>
                  <span>🌟 {isKn ? "ಭಾಗ್ಯೋದಯ & ಪರಿಹಾರ ಕಾಲಾವಧಿ:" : isHi ? "भाग्योदय एवं परिहार समयावधि:" : isTe ? "భాగ్యోదయ & పరిహార సమయం:" : isTa ? "வாழ்வு திருப்பம் & பரிகார காலம்:" : "Turnaround Point & Timing Window:"}</span>
                  <span style={{ background: "#D97706", color: "#FFFFFF", padding: "1px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: 800 }}>
                    {isKn ? lifeTurnaroundTiming.timelineKn : (lifeTurnaroundTiming.timelineEn || "Upcoming 3 to 6 months")}
                  </span>
                </div>
                <div style={{ color: "#451A03", marginTop: "2px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ಪ್ರೇರಕ ಗ್ರಹ & ಗೋಕರ್ಣ ಸೇವೆ: " : isHi ? "• प्रेरक ग्रह एवं गोकर्ण सेवा: " : isTe ? "• ప్రేరక గ్రహం & గోకర్ణ సేవ: " : isTa ? "• தூண்டுதல் கிரகம் & கோகர்ண சேவை: " : "• Catalyst & Recommended Seva: "}</span>
                  <span style={{ fontWeight: 700, color: "#92400E" }}>
                    {isKn
                      ? `${lifeTurnaroundTiming.catalystGrahaKn} · ${lifeTurnaroundTiming.specificSevaKn}`
                      : `${lifeTurnaroundTiming.catalystGrahaEn || "Catalyst Planet"} · ${lifeTurnaroundTiming.specificSevaEn || "Gokarna Seva"}`}
                  </span>
                </div>
                <div style={{ color: "#78350F", marginTop: "1px", fontSize: "10px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "• ಜ್ಯೋತಿಷ್ಯ ಪ್ರಕ್ರಿಯೆ: " : isHi ? "• ज्योतिषीय प्रक्रिया: " : isTe ? "• జ్యోతిష్య ప్రక్రియ: " : isTa ? "• ஜோதிட திருப்ப முறை: " : "• Breakthrough Mechanism: "}</span>
                  {isKn ? lifeTurnaroundTiming.breakthroughMechanismKn : (lifeTurnaroundTiming.breakthroughMechanismEn || "Astrological planetary alignment facilitates breakthroughs.")}
                </div>
              </div>
            )}

            {/* Gochara Grid - 3-column row to eliminate vertical wrapping */}
            <div style={{ display: "grid", gridTemplateColumns: gocharaTransitAnalysis.transitHighlights.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr", gap: "6px", marginTop: "5px" }}>
              {gocharaTransitAnalysis.transitHighlights.map((gh, idx) => (
                <div
                  key={idx}
                  style={{
                    background: gh.effect === "Challenging" ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${gh.effect === "Challenging" ? "#FECACA" : "#BBF7D0"}`,
                    borderRadius: "6px",
                    padding: "5px 7px",
                    fontSize: "10.5px",
                    lineHeight: 1.35
                  }}
                >
                  <div style={{ fontWeight: 800, color: gh.effect === "Challenging" ? "#991B1B" : "#166534" }}>
                    {gh.effect === "Challenging" ? "⚠️" : "✨"} {gh.title[code] || gh.title.kn}
                  </div>
                  <div style={{ color: "#451A03", marginTop: "1px" }}>
                    {gh.description[code] || gh.description.kn}
                  </div>
                  <div style={{ color: gh.effect === "Challenging" ? "#B91C1C" : "#15803D", marginTop: "1px", fontWeight: 700 }}>
                    {gh.remedy[code] || gh.remedy.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Sade Sati Status Alert */}
            <div
              style={{
                marginTop: "5px",
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                color: "#92400E",
                fontWeight: 800,
                lineHeight: 1.35
              }}
            >
              {gocharaTransitAnalysis.sadeSatiStatus[code] || gocharaTransitAnalysis.sadeSatiStatus.kn}
            </div>

            {/* Planetary Strength, Exaltation/Debilitation & Influencer Benchmark */}
            {planetaryStrengthRemedies && (
              <div
                style={{
                  marginTop: "5px",
                  background: "#F8FAFC",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  padding: "5px 8px",
                  fontSize: "10.5px",
                  lineHeight: 1.35
                }}
              >
                <div style={{ fontWeight: 800, color: "#0F172A", marginBottom: "2px" }}>
                  💎 {isKn ? "ಗ್ರಹಗಳ ಉಚ್ಚ / ನೀಚ ಬಲ, ನೀಚಭಂಗ ರಾಜಯೋಗ & ರತ್ನ ಮಾರ್ಗದರ್ಶನ:" : isHi ? "ग्रहों का उच्च/नीच बल, नीचभंग राजयोग एवं रत्न मार्गदर्शन:" : isTe ? "గ్రహాల ఉచ్ఛ/నీచ బలం, నీచభంగ రాజయోగం & రత్న మార్గదర్శనం:" : isTa ? "கிரகங்களின் உச்ச/நீச பலம், நீசபங்க ராஜயோகம் & ரத்தின வழிகாட்டல்:" : "Planetary Strength (Exaltation/Debilitation) & Gemstone Discipline:"}
                </div>
                {planetaryStrengthRemedies.debilitatedPlanets.length > 0 && (
                  <div style={{ color: "#991B1B" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "⚠️ ನೀಚ ಗ್ರಹ: " : isHi ? "⚠️ नीच ग्रह: " : isTe ? "⚠️ నీచ గ్రహం: " : isTa ? "⚠️ நீச கிரகம்: " : "⚠️ Debilitated Planet: "}</span>
                    {planetaryStrengthRemedies.debilitatedPlanets.map(dp => `${dp.grahaName[code] || dp.grahaName.kn} (${dp.hasNeechaBhanga ? (isKn ? "ನೀಚಭಂಗ ರಾಜಯೋಗ" : isHi ? "नीचभंग राजयोग" : isTe ? "ನೀಚభంగ రాజయోగం" : isTa ? "நீசபங்க ராஜயோகம்" : "Neecha Bhanga Raja Yoga") : (isKn ? "ನೀಚ" : isHi ? "नीच" : isTe ? "ನೀచ" : isTa ? "நீசம்" : "Debilitated")}) - ${dp.gemstoneCaution[code] || dp.gemstoneCaution.kn}`).join("; ")}
                  </div>
                )}
                {planetaryStrengthRemedies.exaltedPlanets.length > 0 && (
                  <div style={{ color: "#166534", marginTop: "1px" }}>
                    <span style={{ fontWeight: 800 }}>{isKn ? "⭐ ಉಚ್ಚ ಗ್ರಹ: " : isHi ? "⭐ उच्च ग्रह: " : isTe ? "⭐ ఉచ్ఛ గ్రహం: " : isTa ? "⭐ உச்ச கிரகம்: " : "⭐ Exalted Planet: "}</span>
                    {planetaryStrengthRemedies.exaltedPlanets.map(ep => `${ep.grahaName[code] || ep.grahaName.kn} (${ep.exaltationSign[code] || ep.exaltationSign.kn}) - ${ep.blessingArea[code] || ep.blessingArea.kn}`).join("; ")}
                  </div>
                )}
                <div style={{ color: "#334155", marginTop: "1px", fontSize: "10px" }}>
                  <span style={{ fontWeight: 800 }}>{isKn ? "🌐 ಇನ್‌ಫ್ಲುಯೆನ್ಸರ್ vs ಶಾಸ್ತ್ರೋಕ್ತ ತುಲನೆ: " : isHi ? "🌐 मिथक बनाम शास्त्रोक्त सत्य: " : isTe ? "🌐 మూఢనమ్మకం vs శాస్త్రోక్త విశ్లేషణ: " : isTa ? "🌐 கட்டுக்கதை vs சாஸ்திர உண்மை: " : "🌐 Social Media Myths vs Shastric Truth: "}</span>
                  {planetaryStrengthRemedies.influencerBenchmarkComparison.authenticApproach[code] || planetaryStrengthRemedies.influencerBenchmarkComparison.authenticApproach.kn}
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Sacred Gokarna Mahabaleshwara Remedies */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "5px"
              }}
            >
              🪔 {i18n.sec7Title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {/* Prescribed Seva */}
              <div style={{ background: "#FEFCE8", border: "1px solid #FDE047", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", lineHeight: 1.4 }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🔱 {i18n.prescribedSeva}</div>
                <div style={{ color: "#451A03", fontWeight: 800, marginTop: "1px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.name[code] || gokarnaTempleRemedies.prescribedSeva.name.kn}
                </div>
                <div style={{ color: "#78350F", fontSize: "10px", marginTop: "1px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.temple[code] || gokarnaTempleRemedies.prescribedSeva.temple.kn}
                </div>
                <div style={{ color: "#065F46", fontSize: "10px", marginTop: "1px", fontWeight: 700 }}>
                  📅 {gokarnaTempleRemedies.prescribedSeva.idealDay[code] || gokarnaTempleRemedies.prescribedSeva.idealDay.kn}
                </div>
              </div>

              {/* Rudraksha, Gemstone, Daana */}
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", lineHeight: 1.4 }}>
                <div>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>📿 {i18n.rudraksha}</span>{" "}
                  <span style={{ color: "#451A03", fontWeight: 700 }}>
                    {gokarnaTempleRemedies.rudrakshaRecommendation.mukhi[code] || gokarnaTempleRemedies.rudrakshaRecommendation.mukhi.kn}
                  </span>
                </div>
                <div style={{ marginTop: "2px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>💎 {i18n.gemstone}</span>{" "}
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.gemstoneRecommendation.stone[code] || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn} ({gokarnaTempleRemedies.gemstoneRecommendation.metal[code] || gokarnaTempleRemedies.gemstoneRecommendation.metal.kn})
                  </span>
                </div>
                <div style={{ marginTop: "2px" }}>
                  <span style={{ fontWeight: 800, color: "#92400E" }}>🌾 {i18n.daana}</span>{" "}
                  <span style={{ color: "#451A03" }}>
                    {gokarnaTempleRemedies.donationDaana.item[code] || gokarnaTempleRemedies.donationDaana.item.kn} — {gokarnaTempleRemedies.donationDaana.beneficiary[code] || gokarnaTempleRemedies.donationDaana.beneficiary.kn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Chief Priest Shreeram Pandit Blessing & Seal */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "7px 11px",
              boxShadow: "0 1.5px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1.5px solid #FDE68A",
                paddingBottom: "3px",
                marginBottom: "5px"
              }}
            >
              🙏 {i18n.sec8Title}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 75px",
                gap: "10px",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 900, color: "#78350F" }}>
                  {chiefPriestBlessing.priestName[code] || chiefPriestBlessing.priestName.kn}
                </div>
                <div style={{ fontSize: "10.5px", color: "#92400E", fontWeight: 700 }}>
                  {chiefPriestBlessing.priestTitle[code] || chiefPriestBlessing.priestTitle.kn} · {i18n.priestContact} {chiefPriestBlessing.phone}
                </div>
                <div style={{ fontSize: "11px", color: "#991B1B", fontWeight: 800, marginTop: "2px", lineHeight: 1.4 }}>
                  {chiefPriestBlessing.sanskritAshirvada}
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", marginTop: "2px", lineHeight: 1.35, fontStyle: "italic" }}>
                  {chiefPriestBlessing.ashirvadaMeaning[code] || chiefPriestBlessing.ashirvadaMeaning.kn}
                </div>
              </div>

              {/* Official Temple Seal Graphic */}
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  border: "2px double #B45309",
                  background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "3px",
                  boxSizing: "border-box",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontSize: "14px" }}>🪔</div>
                <div style={{ fontSize: "6.5px", fontWeight: 900, color: "#78350F", lineHeight: 1.1, marginTop: "1px" }}>
                  {isKn ? "॥ ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ॥" : isHi ? "॥ गोकर्ण सन्निधि ॥" : isTe ? "॥ గోకర్ణ సన్నిధి ॥" : isTa ? "॥ கோகர்ண சந்நிதி ॥" : "॥ Sri Gokarna Kshetra ॥"}
                </div>
                <div style={{ fontSize: "6px", color: "#92400E", fontWeight: 800 }}>
                  {i18n.templeSealLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "#78350F",
              fontWeight: 800,
              borderTop: "1px dashed #D97706",
              paddingTop: "3px"
            }}
          >
            {i18n.page3Footer}
          </div>
        </div>
      </div>
    </div>
  );
};
