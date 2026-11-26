/**
 * ============================================================================
 * BAGGONA PANCHANGA — 20-MINUTE CONSULTATION SESSION PDF TEMPLATE
 * ============================================================================
 * Modeled directly after Premium PDF V1 & Sampoorna 25-Chapter Master Design:
 *  - Fixed 900px width, clean open ivory parchment (#FFF7ED / #FFFDF9)
 *  - ZERO <table>, <tr>, <td>, <th> tags (Pure CSS Grid / Flexbox layout)
 *  - letterSpacing: "normal" across all Indic scripts (zero glyph collision)
 *  - Highlights "BAGGONA PANCHANGA" branding prominently on every section
 *  - Complete 7-language native localization (kn, en, hi, te, ta, ml, mr)
 * ============================================================================
 */

import React, { forwardRef } from "react";
import type {
  ConsultationSession,
  ConsultationChatMessage,
  ConsultationLanguage
} from "../../features/consultation/consultationTypes";
import type { DevoteePanchangaProfile } from "../../features/consultation/consultationPanchangaService";

export interface ConsultationSessionPdfProps {
  session: ConsultationSession;
  panchangaProfile: DevoteePanchangaProfile | null;
  messages: ConsultationChatMessage[];
}

interface QaBlockItem {
  questionIndex: number;
  questionMsg?: ConsultationChatMessage;
  answerMsg: ConsultationChatMessage;
  showDoshaCard: boolean;
}

const PDF_I18N: Record<
  ConsultationLanguage,
  {
    brandNative: string;
    brandEnSub: string;
    invocation: string;
    runningFolio: string;
    reportTitle: string;
    reportSubtitle: string;
    patrikaHeading: string;
    nameLabel: string;
    dobLabel: string;
    tobLabel: string;
    placeLabel: string;
    vaaraLabel: string;
    horaLabel: string;
    tithiLabel: string;
    nakshatraLabel: string;
    rashiLabel: string;
    lagnaLabel: string;
    yogaLabel: string;
    karanaLabel: string;
    dashaLabel: string;
    priestSealLine: string;
    questionWord: string;
    openingBlessingLabel: string;
    keyVerdictPill: string;
    oracleAnswerHeading: string;
    doshaBoxHeading: string;
    doshaAffliction: string;
    doshaCause: string;
    doshaImpact: string;
    doshaRemedy: string;
    verifiedFooter: string;
    conclusionHeading: string;
    conclusionBody: string;
    familyReferralHeading: string;
    familyReferralBody: string;
    familyContactLine: string;
    generatedOnLabel: string;
    questionsCountLabel: string;
  }
> = {
  kn: {
    brandNative: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "॥ ಓಂ ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥",
    runningFolio: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥  •  BAGGONA PANCHANGA  •  ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
    reportTitle: "ವೈಯಕ್ತಿಕ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ & ಜಾತಕ ಮಾರ್ಗದರ್ಶನ ಪತ್ರ",
    reportSubtitle: "ಶತಮಾನದ ವೈದಿಕ ಪಂಚಾಂಗ ಪರಂಪರೆಯ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪರಿಹಾರ ಸಂಹಿತೆ",
    patrikaHeading: "ಜಾತಕರ ಜನ್ಮ ಪಂಚಾಂಗ ಪತ್ರಿಕೆ & ಗ್ರಹ ಸ್ಥಿತಿ",
    nameLabel: "ಭಕ್ತರ ಹೆಸರು",
    dobLabel: "ಜನ್ಮ ದಿನಾಂಕ",
    tobLabel: "ಜನ್ಮ ಸಮಯ",
    placeLabel: "ಜನ್ಮ ಸ್ಥಳ",
    vaaraLabel: "ಜನ್ಮ ವಾರ",
    horaLabel: "ಜನ್ಮ ಹೋರಾ",
    tithiLabel: "ತಿಥಿ",
    nakshatraLabel: "ನಕ್ಷತ್ರ",
    rashiLabel: "ಚಂದ್ರ ರಾಶಿ",
    lagnaLabel: "ಜನ್ಮ ಲಗ್ನ",
    yogaLabel: "ನಿತ್ಯ ಯೋಗ",
    karanaLabel: "ಕರಣ",
    dashaLabel: "ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ",
    priestSealLine: "ಮುಖ್ಯ ದೈವಜ್ಞರು: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ • ದೂರವಾಣಿ: +91 9972339362",
    questionWord: "ಪ್ರಶ್ನೆ",
    openingBlessingLabel: "ದೈವಜ್ಞರ ಆಶೀರ್ವಚನ ಹಾಗೂ ಪ್ರಾರಂಭಿಕ ಸಂದೇಶ",
    keyVerdictPill: "ಮುಖ್ಯ ತೀರ್ಮಾನ",
    oracleAnswerHeading: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ವಚನ",
    doshaBoxHeading: "॥ ವಿಶೇಷ ಜಾತಕ ದೋಷ ಮತ್ತು ಗೋಕರ್ಣ ಪರಿಹಾರ ವಿವರ ॥",
    doshaAffliction: "ದೋಷ / ಬಾಧೆ",
    doshaCause: "ಗ್ರಹ ಸಂಯೋಗ",
    doshaImpact: "ಪ್ರಸ್ತುತ ಪರಿಣಾಮ",
    doshaRemedy: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಪರಿಹಾರ",
    verifiedFooter: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಪ್ರಮಾಣಿತ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 9972339362)",
    conclusionHeading: "॥ ಶುಭ ಮಂಗಳ ಆಶೀರ್ವಾದ ॥",
    conclusionBody:
      "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮಹಾಗಣಪತಿ ಮತ್ತು ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಕೃಪೆಯು ಸದಾ ನಿಮ್ಮ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದ ಮೇಲಿರಲಿ. ಶ್ರದ್ಧೆ, ಸತ್ಕರ್ಮ ಮತ್ತು ಧರ್ಮದ ಹಾದಿಯಲ್ಲಿ ಮುನ್ನಡೆಯಿರಿ; ಸಕಲ ಶುಭ ಫಲಗಳು ಲಭಿಸಲಿವೆ.",
    familyReferralHeading: "ಕುಟುಂಬ ಸದಸ್ಯರು ಹಾಗೂ ಆಪ್ತರಿಗಾಗಿ ಪ್ರತ್ಯೇಕ ಜಾತಕ ಸಮಾಲೋಚನೆ",
    familyReferralBody:
      "ಶಾಸ್ತ್ರೋಕ್ತ ನಿಯಮ: ಪ್ರತಿಯೊಬ್ಬ ವ್ಯಕ್ತಿಯ ಜನ್ಮ ಲಗ್ನ, ನಕ್ಷತ್ರ ಹಾಗೂ ದಶಾ-ಭುಕ್ತಿಗಳು ಸಂಪೂರ್ಣ ವಿಭಿನ್ನವಾಗಿರುತ್ತವೆ. ನಿಮ್ಮ ಸಂಗಾತಿ, ಮಕ್ಕಳು, ಪೋಷಕರು ಅಥವಾ ಸ್ನೇಹಿತರಿಗಾಗಿ ಪ್ರತ್ಯೇಕ ೧೦೦% ನಿಖರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಪಡೆಯಲು ಮುಖ್ಯ ದೈವಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    familyContactLine: "ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ • ನೇರ ಸಂಪರ್ಕ / ವಾಟ್ಸಾಪ್: +91 9972339362",
    generatedOnLabel: "ಸಿದ್ಧಪಡಿಸಿದ ದಿನಾಂಕ",
    questionsCountLabel: "ಉತ್ತರಿಸಿದ ಪ್ರಶ್ನೆಗಳು"
  },
  en: {
    brandNative: "BAGGONA PANCHANGA",
    brandEnSub: "SACRED VEDIC JYOTISHA SANSTHANA • SRI KSHETRA GOKARNA",
    invocation: "OM SRI GANESHAYA NAMAHA • SRI KSHETRA GOKARNA MAHABALESHWARA BLESSINGS",
    runningFolio: "BAGGONA PANCHANGA  •  SRI KSHETRA GOKARNA  •  AUTHENTIC VEDIC ORACLE",
    reportTitle: "Personal Vedic Consultation & Dasha Guidance Samhita",
    reportSubtitle: "Centenary Lineage Jyotisha Insights, Planetary Analysis & Sacred Gokarna Counsel",
    patrikaHeading: "Devotee Birth Panchanga Patrika & Horoscope Baseline",
    nameLabel: "Devotee Name",
    dobLabel: "Date of Birth",
    tobLabel: "Time of Birth",
    placeLabel: "Birth Place",
    vaaraLabel: "Vedic Vaara",
    horaLabel: "Janma Hora",
    tithiLabel: "Birth Tithi",
    nakshatraLabel: "Nakshatra",
    rashiLabel: "Moon Rashi",
    lagnaLabel: "Ascendant (Lagna)",
    yogaLabel: "Nitya Yoga",
    karanaLabel: "Karana",
    dashaLabel: "Active Vimshottari Dasha",
    priestSealLine: "Chief Astrologer: Sri Shreeram Pandit • Sri Kshetra Gokarna • Ph: +91 9972339362",
    questionWord: "Question",
    openingBlessingLabel: "Priest's Opening Benediction & Horoscope Welcome",
    keyVerdictPill: "Key Verdict",
    oracleAnswerHeading: "Baggona Panchanga Master Counsel",
    doshaBoxHeading: "॥ Identified Horoscope Dosha & Gokarna Parihara ॥",
    doshaAffliction: "Dosha / Affliction",
    doshaCause: "Planetary Basis",
    doshaImpact: "Current Impact",
    doshaRemedy: "Gokarna Parihara",
    verifiedFooter: "Baggona Panchanga Verified Consultation • Sri Shreeram Pandit (+91 9972339362)",
    conclusionHeading: "॥ Sacred Gokarna Benediction ॥",
    conclusionBody:
      "May Lord Mahaganapati and Lord Mahabaleshwara of Sri Kshetra Gokarna shower boundless peace, clarity, and protection upon you and your family. Walk with patience, steady dharma, and joyful faith.",
    familyReferralHeading: "Dedicated Consultation Links for Family & Loved Ones",
    familyReferralBody:
      "Vedic Principle: Every person carries a unique Lagna, Nakshatra, and Dasha cycle. To gift an authentic 100% chart-grounded Baggona Panchanga consultation to your spouse, children, parents, or friends, contact Chief Priest Sri Shreeram Pandit directly.",
    familyContactLine: "Baggona Panchanga • Sri Shreeram Pandit • Call / WhatsApp: +91 9972339362",
    generatedOnLabel: "Document Date",
    questionsCountLabel: "Questions Answered"
  },
  hi: {
    brandNative: "॥ बग्गोण पंचांग ॥",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबलेश्वर प्रसन्न ॥",
    runningFolio: "॥ बग्गोण पंचांग ॥  •  BAGGONA PANCHANGA  •  श्री क्षेत्र गोकर्ण",
    reportTitle: "व्यक्तिगत वैदिक ज्योतिष परामर्श एवं दशा मार्गदर्शन पत्र",
    reportSubtitle: "शताब्दी वैदिक पंचांग परंपरा पर आधारित सटीक फलित एवं आध्यात्मिक संहिता",
    patrikaHeading: "जातक जन्म पंचांग पत्रिका एवं ग्रह आधार",
    nameLabel: "भक्त का नाम",
    dobLabel: "जन्म तिथि",
    tobLabel: "जन्म समय",
    placeLabel: "जन्म स्थान",
    vaaraLabel: "जन्म वार",
    horaLabel: "जन्म होरा",
    tithiLabel: "तिथि",
    nakshatraLabel: "नक्षत्र",
    rashiLabel: "चंद्र राशि",
    lagnaLabel: "जन्म लग्न",
    yogaLabel: "नित्य योग",
    karanaLabel: "करण",
    dashaLabel: "वर्तमान विंशोत्तरी दशा",
    priestSealLine: "मुख्य दैवज्ञ: श्रीराम पंडित • श्री क्षेत्र गोकर्ण • दूरभाष: +91 9972339362",
    questionWord: "प्रश्न",
    openingBlessingLabel: "दैवज्ञ आशीर्वाद एवं प्रारंभिक मार्गदर्शन",
    keyVerdictPill: "मुख्य निर्णय",
    oracleAnswerHeading: "बग्गोण पंचांग दैवज्ञ वाणी",
    doshaBoxHeading: "॥ कुंडली दोष एवं श्री क्षेत्र गोकर्ण परिहार ॥",
    doshaAffliction: "दोष / बाधा",
    doshaCause: "ग्रह संयोग",
    doshaImpact: "वर्तमान प्रभाव",
    doshaRemedy: "गोकर्ण परिहार संकल्प",
    verifiedFooter: "बग्गोण पंचांग प्रमाणित ज्योतिष परामर्श • श्रीराम पंडित (+91 9972339362)",
    conclusionHeading: "॥ श्री गोकर्ण महाबलेश्वर आशीर्वाद ॥",
    conclusionBody:
      "श्री क्षेत्र गोकर्ण के महागणपति एवं भगवान महाबलेश्वर की असीम कृपा आप और आपके परिवार पर सदा बनी रहे। धैर्य, सद्कर्म और श्रद्धा के पथ पर अग्रसर रहें; सर्वत्र मंगल होगा।",
    familyReferralHeading: "परिवार के सदस्यों एवं प्रियजनों हेतु पृथक परामर्श लिंक",
    familyReferralBody:
      "शास्त्रोक्त नियम: प्रत्येक व्यक्ति की जन्म लग्न, नक्षत्र और दशा-भुक्ति पूर्णतः भिन्न होती है। अपने जीवनसाथी, संतान, माता-पिता या मित्रों के लिए १००% सटीक बग्गोण पंचांग परामर्श लिंक प्राप्त करने हेतु मुख्य पुरोहित से संपर्क करें।",
    familyContactLine: "बग्गोण पंचांग • श्रीराम पंडित • कॉल / व्हाट्सएप: +91 9972339362",
    generatedOnLabel: "तैयार तिथि",
    questionsCountLabel: "उत्तरित प्रश्न"
  },
  te: {
    brandNative: "॥ బగ్గోణ పంచాంగం ॥",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "॥ ఓం శ్రీ గణేశాయ నమః • శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర ప్రసన్న ॥",
    runningFolio: "॥ బగ్గోణ పంచాంగం ॥  •  BAGGONA PANCHANGA  •  శ్రీ క్షేత్ర గోకర్ణ",
    reportTitle: "వ్యక్తిగత వైదిక జ్యోతిష సంప్రదింపు మరియు దశా మార్గదర్శక పత్రం",
    reportSubtitle: "శతాబ్దాల వైదిక పంచాంగ పరంపర ఆధారిత ఖచ్చితమైన జ్యోతిష విశ్లేషణ",
    patrikaHeading: "భక్తుని జన్మ పంచాంగ పత్రిక & గ్రహ వివరాలు",
    nameLabel: "భక్తుని పేరు",
    dobLabel: "పుట్టిన తేదీ",
    tobLabel: "పుట్టిన సమయం",
    placeLabel: "పుట్టిన స్థలం",
    vaaraLabel: "జన్మ వారం",
    horaLabel: "జన్మ హోర",
    tithiLabel: "తిథి",
    nakshatraLabel: "నక్షత్రం",
    rashiLabel: "చంద్ర రాశి",
    lagnaLabel: "జన్మ లగ్నం",
    yogaLabel: "నిత్య యోగం",
    karanaLabel: "కరణం",
    dashaLabel: "ప్రస్తుత దశా-భుక్తి",
    priestSealLine: "ప్రధాన దైవజ్ఞులు: శ్రీరామ్ పండిత్ • శ్రీ క్షేత్ర గోకర్ణ • ఫోన్: +91 9972339362",
    questionWord: "ప్రశ్న",
    openingBlessingLabel: "దైవజ్ఞుల ఆశీర్వచనం మరియు ప్రారంభ సందేశం",
    keyVerdictPill: "ముఖ్య నిర్ణయం",
    oracleAnswerHeading: "బగ్గోణ పంచాంగం దైవజ్ఞ వాణి",
    doshaBoxHeading: "॥ జాతక దోషం మరియు గోకర్ణ పరిహార వివరాలు ॥",
    doshaAffliction: "దోషం / బాధ",
    doshaCause: "గ్రహ కారణం",
    doshaImpact: "ప్రస్తుత ప్రభావం",
    doshaRemedy: "గోకర్ణ పరిహారం",
    verifiedFooter: "బగ్గోణ పంచాంగం ధృవీకరించబడిన సలహా • శ్రీరామ్ పండిత్ (+91 9972339362)",
    conclusionHeading: "॥ శుభ మంగళ ఆశీర్వాదం ॥",
    conclusionBody:
      "శ్రీ క్షేత్ర గోకర్ణ మహాగణపతి మరియు మహాబలేశ్వర స్వామివారి దివ్య అనుగ్రహం మీపై మరియు మీ కుటుంబంపై సదా ఉండుగాక. సహనం, ధర్మంతో ముందుకు సాగండి.",
    familyReferralHeading: "కుటుంబ సభ్యులు & ఆప్తుల కోసం ప్రత్యేక జ్యోతిష సంప్రదింపు",
    familyReferralBody:
      "శాస్త్రోక్త నియమం: ప్రతి వ్యక్తి జన్మ లగ్నం, నక్షత్రం మరియు దశలు భిన్నంగా ఉంటాయి. మీ జీవిత భాగస్వామి, పిల్లలు, తల్లిదండ్రులు లేదా స్నేహితుల కోసం 100% ఖచ్చితమైన ప్రత్యేక బగ్గోణ పంచాంగం సంప్రదింపు పొందడానికి ప్రధాన అర్చకులను సంప్రదించండి.",
    familyContactLine: "బగ్గోణ పంచాంగం • శ్రీరామ్ పండిత్ • కాల్ / వాట్సాప్: +91 9972339362",
    generatedOnLabel: "నిర్మిత తేదీ",
    questionsCountLabel: "సమాధానమిచ్చిన ప్రశ్నలు"
  },
  ta: {
    brandNative: "✦ பக்கவணா பஞ்சாங்கம் ✦",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "✦ ௐ ஸ்ரீ கணேசாய நமஹ • ஸ்ரீ க்ஷேத்ர கோகர்ண மகாபலேஸ்வரர் துணை ✦",
    runningFolio: "✦ பக்கவணா பஞ்சாங்கம் ✦  •  BAGGONA PANCHANGA  •  ஸ்ரீ க்ஷேத்ர கோகர்ணம்",
    reportTitle: "தனிப்பட்ட வேத ஜோதிட ஆலோசனை மற்றும் தசா வழிகாட்டல்",
    reportSubtitle: "நூற்றாண்டு வேத பஞ்சாங்க மரபின் துல்லிய ஜோதிட ஆய்வு & பரிகார சுருக்கம்",
    patrikaHeading: "ஜாதகர் பிறப்பு பஞ்சாங்க பத்திரிகை",
    nameLabel: "பக்தர் பெயர்",
    dobLabel: "பிறந்த தேதி",
    tobLabel: "பிறந்த நேரம்",
    placeLabel: "பிறந்த இடம்",
    vaaraLabel: "கிழமை (வாரம்)",
    horaLabel: "ஜென்ம ஹோரை",
    tithiLabel: "திதி",
    nakshatraLabel: "நட்சத்திரம்",
    rashiLabel: "சந்திர ராசி",
    lagnaLabel: "ஜென்ம லக்னம்",
    yogaLabel: "நித்ய யோகம்",
    karanaLabel: "கரணம்",
    dashaLabel: "நடப்பு தசா-புக்தி",
    priestSealLine: "தலைமை ஜோதிடர்: ஸ்ரீராம் பண்டிட் • ஸ்ரீ க்ஷேத்ர கோகர்ணம் • +91 9972339362",
    questionWord: "கேள்வி",
    openingBlessingLabel: "குருவின் ஆசி மற்றும் தொடக்க உரை",
    keyVerdictPill: "முக்கிய தீர்ப்பு",
    oracleAnswerHeading: "பக்கவணா பஞ்சாங்கம் ஜோதிட அருள்வாக்கு",
    doshaBoxHeading: "✦ ஜாதக தோஷம் மற்றும் கோகர்ண பரிகாரம் ✦",
    doshaAffliction: "தோஷம் / தடை",
    doshaCause: "கிரக காரணம்",
    doshaImpact: "தற்போதைய தாக்கம்",
    doshaRemedy: "கோகர்ண பரிகாரம்",
    verifiedFooter: "பக்கவணா பஞ்சாங்கம் அங்கீகரிக்கப்பட்ட ஆலோசனை • ஸ்ரீராம் பண்டிட் (+91 9972339362)",
    conclusionHeading: "✦ கோகர்ண ஈசனின் மங்கள ஆசிகள் ✦",
    conclusionBody:
      "ஸ்ரீ க்ஷேத்ர கோகர்ணம் மகா கணபதி மற்றும் மகாபலேஸ்வரரின் அருள் உங்கள் குடும்பத்திற்கு என்றென்றும் துணை நிற்கட்டும். நம்பிக்கையுடனும் தர்மத்துடனும் முன்னேறுங்கள்.",
    familyReferralHeading: "குடும்பத்தினர் மற்றும் நண்பர்களுக்கான தனிப்பட்ட ஆலோசனை",
    familyReferralBody:
      "சாஸ்திர விதி: ஒவ்வொருவரின் லக்னம், நட்சத்திரம் மற்றும் தசா காலம் வேறுபட்டது. உங்கள் வாழ்க்கைத் துணை, குழந்தைகள் அல்லது பெற்றோருக்கு 100% துல்லியமான பக்கவணா பஞ்சாங்க ஆலோசனை பெற தலைமை அர்ச்சகரைத் தொடர்பு கொள்ளவும்.",
    familyContactLine: "பக்கவணா பஞ்சாங்கம் • ஸ்ரீராம் பண்டிட் • அழைப்பு / வாட்ஸ்அப்: +91 9972339362",
    generatedOnLabel: "தயாரித்த தேதி",
    questionsCountLabel: "பதிலளிக்கப்பட்ட கேள்விகள்"
  },
  ml: {
    brandNative: "॥ ബഗ്ഗോണ പഞ്ചാംഗം ॥",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "॥ ഓം ശ്രീ ഗണേശായ നമഃ • ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാബലേശ്വര പ്രസന്ന ॥",
    runningFolio: "॥ ബഗ്ഗോണ പഞ്ചാംഗം ॥  •  BAGGONA PANCHANGA  •  ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
    reportTitle: "വ്യക്തിഗത വൈദിക ജ്യോതിഷ കൺസൾട്ടേഷൻ & ദശാ മാർഗ്ഗനിർദ്ദേശം",
    reportSubtitle: "നൂറ്റാണ്ടുകളുടെ വൈദിക പഞ്ചാംഗ പാരമ്പര്യത്തിലധിഷ്ഠിതമായ കൃത്യമായ ജ്യോതിഷ സംഹിത",
    patrikaHeading: "ജാതകന്റെ ജനന പഞ്ചാംഗ പത്രിക & ഗ്രഹനില",
    nameLabel: "ഭക്തന്റെ പേര്",
    dobLabel: "ജനന തീയതി",
    tobLabel: "ജനന സമയം",
    placeLabel: "ജനന സ്ഥലം",
    vaaraLabel: "ജന്മ വാരം",
    horaLabel: "ജന്മ ഹോര",
    tithiLabel: "തിഥി",
    nakshatraLabel: "നക്ഷത്രം",
    rashiLabel: "ചന്ദ്ര രാശി",
    lagnaLabel: "ജന്മ ലഗ്നം",
    yogaLabel: "നിത്യ യോഗം",
    karanaLabel: "കരണം",
    dashaLabel: "നിലവിലെ ദശാ-ഭുക്തി",
    priestSealLine: "മുഖ്യ ജ്യോതിഷി: ശ്രീറാം പണ്ഡിറ്റ് • ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം • +91 9972339362",
    questionWord: "ചോദ്യം",
    openingBlessingLabel: "ആചാര്യന്റെ അനുഗ്രഹവും പ്രാരംഭ സന്ദേശവും",
    keyVerdictPill: "പ്രധാന തീരുമാനം",
    oracleAnswerHeading: "ബഗ്ഗോണ പഞ്ചാംഗം ജ്യോതിഷ വചനം",
    doshaBoxHeading: "॥ ജാതക ദോഷവും ഗോകർണ്ണ പരിഹാരവും ॥",
    doshaAffliction: "ദോഷം / തടസ്സം",
    doshaCause: "ഗ്രഹ കാരണം",
    doshaImpact: "നിലവിലെ സ്വാധീനം",
    doshaRemedy: "ഗോകർണ്ണ പരിഹാരം",
    verifiedFooter: "ബഗ്ഗോണ പഞ്ചാംഗം സാക്ഷ്യപ്പെടുത്തിയ നിർദ്ദേശം • ശ്രീറാം പണ്ഡിറ്റ് (+91 9972339362)",
    conclusionHeading: "॥ മംഗളകരമായ ഗോകർണ്ണ അനുഗ്രഹം ॥",
    conclusionBody:
      "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണ മഹാഗണപതിയുടെയും മഹാബലേശ്വരന്റെയും അനുഗ്രഹം നിങ്ങളിലും കുടുംബത്തിലും എപ്പോഴും ഉണ്ടാകട്ടെ. സത്യസന്ധതയോടും ധൈര്യത്തോടും കൂടി മുന്നോട്ട് പോകുക.",
    familyReferralHeading: "കുടുംബാംഗങ്ങൾക്കും പ്രിയപ്പെട്ടവർക്കും പ്രത്യേക കൺസൾട്ടേഷൻ",
    familyReferralBody:
      "ശാസ്ത്രീയ നിയമം: ഓരോരുത്തരുടെയും ലഗ്നവും ദശയും വ്യത്യസ്തമാണ്. നിങ്ങളുടെ പങ്കാളിക്കും മക്കൾക്കും മാതാപിതാക്കൾക്കും വേണ്ടി 100% കൃത്യമായ ബഗ്ഗോണ പഞ്ചാംഗം കൺസൾട്ടേഷൻ ലഭിക്കാൻ മുഖ്യ പുരോഹിതനെ ബന്ധപ്പെടുക.",
    familyContactLine: "ബഗ്ഗോണ പഞ്ചാംഗം • ശ്രീറാം പണ്ഡിറ്റ് • കോൾ / വാട്സാപ്പ്: +91 9972339362",
    generatedOnLabel: "തയ്യാറാക്കിയ തീയതി",
    questionsCountLabel: "മറുപടി നൽകിയ ചോദ്യങ്ങൾ"
  },
  mr: {
    brandNative: "॥ बग्गोण पंचांग ॥",
    brandEnSub: "BAGGONA PANCHANGA ASTROLOGY • SRI KSHETRA GOKARNA",
    invocation: "॥ ॐ श्री गणेशाय नमः • श्री क्षेत्र गोकर्ण महाबळेश्वर प्रसन्न ॥",
    runningFolio: "॥ बग्गोण पंचांग ॥  •  BAGGONA PANCHANGA  •  श्री क्षेत्र गोकर्ण",
    reportTitle: "वैयक्तिक वैदिक ज्योतिष सल्लामसलत व दशा मार्गदर्शन पत्र",
    reportSubtitle: "शतायुषी वैदिक पंचांग परंपरेवर आधारित अचूक ज्योतिषीय विश्लेषण व परिहार संहिता",
    patrikaHeading: "जातकाची जन्म पंचांग पत्रिका व ग्रहस्थिती",
    nameLabel: "भक्ताचे नाव",
    dobLabel: "जन्म तारीख",
    tobLabel: "जन्म वेळ",
    placeLabel: "जन्म ठिकाण",
    vaaraLabel: "जन्म वार",
    horaLabel: "जन्म होरा",
    tithiLabel: "तिथी",
    nakshatraLabel: "नक्षत्र",
    rashiLabel: "चंद्र रास",
    lagnaLabel: "जन्म लग्न",
    yogaLabel: "नित्य योग",
    karanaLabel: "करण",
    dashaLabel: "सध्याची विंशोत्तरी दशा",
    priestSealLine: "मुख्य दैवज्ञ: श्रीराम पंडित • श्री क्षेत्र गोकर्ण • संपर्क: +91 9972339362",
    questionWord: "प्रश्न",
    openingBlessingLabel: "दैवज्ञांचा आशीर्वाद व प्रारंभिक संदेश",
    keyVerdictPill: "मुख्य निर्णय",
    oracleAnswerHeading: "बग्गोण पंचांग दैवज्ञ वाणी",
    doshaBoxHeading: "॥ पत्रिका दोष व श्री क्षेत्र गोकर्ण परिहार ॥",
    doshaAffliction: "दोष / अडथळा",
    doshaCause: "ग्रह संयोग",
    doshaImpact: "सध्याचा प्रभाव",
    doshaRemedy: "गोकर्ण परिहार संकल्प",
    verifiedFooter: "बग्गोण पंचांग प्रमाणित ज्योतिष सल्ला • श्रीराम पंडित (+91 9972339362)",
    conclusionHeading: "॥ शुभ मंगल आशीर्वाद ॥",
    conclusionBody:
      "श्री क्षेत्र गोकर्ण महागणपती आणि महाबळेश्वराची कृपा सदैव आपल्या व आपल्या कुटुंबावर राहो. धैर्य, सत्कर्म आणि श्रद्धेच्या मार्गाने वाटचाल करा; सर्व काही मंगलमय होईल.",
    familyReferralHeading: "कुटुंबातील सदस्यांसाठी स्वतंत्र सल्लामसलत लिंक",
    familyReferralBody:
      "शास्त्रोक्त नियम: प्रत्येक व्यक्तीची पत्रिका, लग्न आणि दशा-भुक्ती भिन्न असते. आपल्या जोडीदारासाठी, मुलांसाठी, आई-वडिलांसाठी किंवा मित्रांसाठी १००% अचूक बग्गोण पंचांग सल्लामसलत मिळवण्यासाठी मुख्य पुरोहितांना संपर्क साधा.",
    familyContactLine: "बग्गोण पंचांग • श्रीराम पंडित • कॉल / व्हॉट्सअॅप: +91 9972339362",
    generatedOnLabel: "तयार दिनांक",
    questionsCountLabel: "उत्तर दिलेले प्रश्न"
  }
};

function getFontFamily(lang: ConsultationLanguage): string {
  switch (lang) {
    case "kn":
      return "'Noto Serif Kannada', 'Noto Sans Kannada', serif";
    case "hi":
    case "mr":
      return "'Noto Sans Devanagari', 'Noto Serif', serif";
    case "te":
      return "'Noto Sans Telugu', serif";
    case "ta":
      return "'Noto Sans Tamil', serif";
    case "ml":
      return "'Noto Sans Malayalam', serif";
    default:
      return "'Outfit', 'Playfair Display', Georgia, serif";
  }
}

export const ConsultationSessionPdfTemplate = forwardRef<
  HTMLDivElement,
  ConsultationSessionPdfProps
>(({ session, panchangaProfile, messages }, ref) => {
  const lang = (session.language || "kn") as ConsultationLanguage;
  const copy = PDF_I18N[lang] || PDF_I18N.kn;
  const fontFamily = getFontFamily(lang);

  // Pair each user question with its astrologer answer (also keep standalone opening greeting if present)
  const qaBlocks: QaBlockItem[] = [];
  const seenDoshas = new Set<string>();
  let qCounter = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.sender === "astrologer") {
      const prev = i > 0 ? messages[i - 1] : undefined;
      const isReplyToUser = prev && prev.sender === "user";
      if (isReplyToUser) {
        qCounter += 1;
      }

      const doshaKey = msg.activeDoshaCard
        ? `${msg.activeDoshaCard.doshaId || msg.activeDoshaCard.doshaName}`
        : msg.doshaName || "";
      const showDoshaCard = Boolean(
        (msg.activeDoshaCard || msg.hasDosha) &&
          doshaKey &&
          !seenDoshas.has(doshaKey)
      );
      if (showDoshaCard && doshaKey) {
        seenDoshas.add(doshaKey);
      }

      qaBlocks.push({
        questionIndex: isReplyToUser ? qCounter : 0,
        questionMsg: isReplyToUser ? prev : undefined,
        answerMsg: msg,
        showDoshaCard
      });
    }
  }

  const todayDisplay = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const displayName = panchangaProfile?.devoteeName || session.name;
  const displayDob = panchangaProfile?.dobFormatted || session.dob;
  const displayTob = panchangaProfile?.tobFormatted || session.tob || "12:00";

  const patrikaItems = panchangaProfile
    ? [
        { label: copy.vaaraLabel, value: panchangaProfile.vaaraWithLord || panchangaProfile.vaara },
        { label: copy.horaLabel, value: panchangaProfile.janmaHora },
        { label: copy.tithiLabel, value: panchangaProfile.tithi },
        { label: copy.nakshatraLabel, value: panchangaProfile.nakshatra },
        { label: copy.rashiLabel, value: panchangaProfile.rashi },
        { label: copy.lagnaLabel, value: panchangaProfile.lagna },
        { label: copy.yogaLabel, value: panchangaProfile.yoga },
        { label: copy.karanaLabel, value: panchangaProfile.karana }
      ]
    : [];

  return (
    <div
      id="consultation-session-pdf-container"
      ref={ref}
      style={{
        width: "900px",
        backgroundColor: "#FFF7ED",
        color: "#271206",
        fontFamily,
        letterSpacing: "normal",
        boxSizing: "border-box"
      }}
    >
      {/* ========================================================================= */}
      {/* SECTION 1: ROYAL BAGGONA PANCHANGA MASTHEAD + BIRTH PANCHANGA PATRIKA     */}
      {/* ========================================================================= */}
      <div
        className="pdf-section"
        data-section="consultation-cover-patrika"
        style={{
          padding: "28px 44px 18px 44px",
          backgroundColor: "#FFF7ED",
          boxSizing: "border-box"
        }}
      >
        {/* Top Sacred Invocation Strip */}
        <div
          style={{
            textAlign: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#9A3412",
            borderBottom: "1px solid rgba(180, 83, 9, 0.25)",
            paddingBottom: "8px",
            marginBottom: "14px",
            letterSpacing: "normal"
          }}
        >
          {copy.invocation}
        </div>

        {/* Hero Baggona Panchanga Brand Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 55%, #FFEDD5 100%)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "18px 24px",
            textAlign: "center",
            marginBottom: "18px",
            position: "relative"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 16px",
              borderRadius: "9999px",
              backgroundColor: "#78350F",
              color: "#FEF3C7",
              fontSize: "12px",
              fontWeight: 800,
              marginBottom: "10px",
              letterSpacing: "normal"
            }}
          >
            <span>🕉️</span>
            <span>{copy.brandEnSub}</span>
          </div>

          <div
            style={{
              fontSize: "30px",
              fontWeight: 900,
              color: "#451A03",
              lineHeight: 1.25,
              marginBottom: "6px",
              letterSpacing: "normal"
            }}
          >
            {copy.brandNative}
          </div>

          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#78350F",
              margin: "0 0 4px 0",
              lineHeight: 1.35,
              letterSpacing: "normal"
            }}
          >
            {copy.reportTitle}
          </h1>

          <p
            style={{
              fontSize: "13.5px",
              color: "#92400E",
              margin: "0 0 10px 0",
              lineHeight: 1.45,
              letterSpacing: "normal"
            }}
          >
            {copy.reportSubtitle}
          </p>

          <div
            style={{
              borderTop: "1px dashed rgba(180, 83, 9, 0.35)",
              paddingTop: "8px",
              fontSize: "12.5px",
              fontWeight: 700,
              color: "#78350F",
              letterSpacing: "normal"
            }}
          >
            {copy.priestSealLine}
          </div>
        </div>

        {/* Clean Open Parchment Card: Devotee Identity & 6-Anga Birth Panchanga */}
        <div
          style={{
            backgroundColor: "#FFFDF9",
            border: "1.5px solid rgba(180, 83, 9, 0.35)",
            borderRadius: "12px",
            padding: "16px 20px",
            position: "relative"
          }}
        >
          {/* 4 Corner Parchment Ornaments */}
          <span style={{ position: "absolute", top: "6px", left: "10px", color: "#B45309", opacity: 0.45, fontSize: "12px" }}>❖</span>
          <span style={{ position: "absolute", top: "6px", right: "10px", color: "#B45309", opacity: 0.45, fontSize: "12px" }}>❖</span>
          <span style={{ position: "absolute", bottom: "6px", left: "10px", color: "#B45309", opacity: 0.45, fontSize: "12px" }}>❖</span>
          <span style={{ position: "absolute", bottom: "6px", right: "10px", color: "#B45309", opacity: 0.45, fontSize: "12px" }}>❖</span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(180, 83, 9, 0.22)",
              paddingBottom: "8px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#451A03", letterSpacing: "normal" }}>
              📜 {copy.patrikaHeading}
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>
              {copy.questionsCountLabel}: {qCounter} • {copy.generatedOnLabel}: {todayDisplay}
            </div>
          </div>

          {/* Natal Identity 4-Column CSS Grid (ZERO tables) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ backgroundColor: "#FEF3C7", borderRadius: "8px", padding: "8px 10px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>{copy.nameLabel}</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#451A03", marginTop: "2px", wordBreak: "break-word", letterSpacing: "normal" }}>{displayName}</div>
            </div>
            <div style={{ backgroundColor: "#FEF3C7", borderRadius: "8px", padding: "8px 10px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>{copy.dobLabel}</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#451A03", marginTop: "2px", letterSpacing: "normal" }}>{displayDob}</div>
            </div>
            <div style={{ backgroundColor: "#FEF3C7", borderRadius: "8px", padding: "8px 10px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>{copy.tobLabel}</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#451A03", marginTop: "2px", letterSpacing: "normal" }}>{displayTob}</div>
            </div>
            <div style={{ backgroundColor: "#FEF3C7", borderRadius: "8px", padding: "8px 10px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>{copy.placeLabel}</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#451A03", marginTop: "2px", wordBreak: "break-word", letterSpacing: "normal" }}>{session.place}</div>
            </div>
          </div>

          {/* 8 Sacred Panchanga Limbs CSS Grid */}
          {patrikaItems.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "8px",
                marginBottom: "10px"
              }}
            >
              {patrikaItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: "#FFFBEB",
                    border: "1px solid rgba(180, 83, 9, 0.22)",
                    borderRadius: "8px",
                    padding: "7px 10px"
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400E", letterSpacing: "normal" }}>{item.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#271206", marginTop: "2px", wordBreak: "break-word", letterSpacing: "normal" }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Running Vimshottari Dasha Banner */}
          {panchangaProfile?.runningDasha && (
            <div
              style={{
                background: "linear-gradient(to right, #FEF3C7, #FFEDD5, #FEF3C7)",
                border: "1px solid rgba(180, 83, 9, 0.35)",
                borderRadius: "8px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", letterSpacing: "normal" }}>
                🪐 {copy.dashaLabel}:
              </span>
              <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#451A03", letterSpacing: "normal" }}>
                {panchangaProfile.runningDasha}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2..N: CLEAN DEVOTEE Q&A BLOCKS (EACH WITH BAGGONA BRAND FOLIO)   */}
      {/* ========================================================================= */}
      {qaBlocks.map((block, idx) => {
        const paragraphs = block.answerMsg.text
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        return (
          <div
            key={block.answerMsg.id || idx}
            className="pdf-section"
            data-section={`consultation-qa-${idx + 1}`}
            style={{
              padding: "12px 44px 14px 44px",
              backgroundColor: "#FFF7ED",
              boxSizing: "border-box"
            }}
          >
            {/* Running Baggona Panchanga Folio Strip on every Q&A block */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(180, 83, 9, 0.25)",
                paddingBottom: "5px",
                marginBottom: "10px",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#92400E",
                letterSpacing: "normal"
              }}
            >
              <span>{copy.runningFolio}</span>
              <span>
                {block.questionIndex > 0
                  ? `${copy.questionWord} #${block.questionIndex}`
                  : copy.oracleAnswerHeading}
              </span>
            </div>

            {/* Devotee Question Strip (or Opening Blessing header for initial welcome) */}
            <div
              style={{
                background: "linear-gradient(to right, rgba(254, 243, 199, 0.95), rgba(255, 247, 237, 0.9))",
                border: "1px solid rgba(217, 119, 6, 0.45)",
                borderLeft: "5px solid #B45309",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "10px"
              }}
            >
              {block.questionMsg ? (
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#451A03", lineHeight: 1.5, letterSpacing: "normal" }}>
                  <span style={{ color: "#9A3412", marginRight: "6px" }}>
                    ❖ {copy.questionWord} #{block.questionIndex}:
                  </span>
                  {block.questionMsg.text}
                </div>
              ) : (
                <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#78350F", letterSpacing: "normal" }}>
                  🪔 {copy.openingBlessingLabel}
                </div>
              )}
            </div>

            {/* Master Astrologer Answer Card */}
            <div
              style={{
                backgroundColor: "#FFFDF9",
                border: "1.5px solid rgba(180, 83, 9, 0.28)",
                borderRadius: "12px",
                padding: "16px 20px",
                position: "relative"
              }}
            >
              <span style={{ position: "absolute", top: "6px", left: "10px", color: "#B45309", opacity: 0.4, fontSize: "11px" }}>❖</span>
              <span style={{ position: "absolute", top: "6px", right: "10px", color: "#B45309", opacity: 0.4, fontSize: "11px" }}>❖</span>
              <span style={{ position: "absolute", bottom: "6px", left: "10px", color: "#B45309", opacity: 0.4, fontSize: "11px" }}>❖</span>
              <span style={{ position: "absolute", bottom: "6px", right: "10px", color: "#B45309", opacity: 0.4, fontSize: "11px" }}>❖</span>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  borderBottom: "1px dashed rgba(180, 83, 9, 0.2)",
                  paddingBottom: "6px"
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", letterSpacing: "normal" }}>
                  ✨ {copy.oracleAnswerHeading}
                </span>
                {block.questionIndex > 0 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#78350F",
                      backgroundColor: "#FEF3C7",
                      border: "1px solid rgba(180, 83, 9, 0.3)",
                      borderRadius: "9999px",
                      padding: "2px 10px",
                      letterSpacing: "normal"
                    }}
                  >
                    {copy.keyVerdictPill}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      margin: 0,
                      whiteSpace: "pre-line",
                      fontSize: pIdx === 0 && block.questionIndex > 0 ? "15.5px" : "15px",
                      lineHeight: 1.72,
                      color: "#271206",
                      fontWeight: pIdx === 0 && block.questionIndex > 0 ? 600 : 400,
                      backgroundColor: pIdx === 0 && block.questionIndex > 0 ? "#FFFBEB" : "transparent",
                      borderLeft: pIdx === 0 && block.questionIndex > 0 ? "3px solid #D97706" : "none",
                      padding: pIdx === 0 && block.questionIndex > 0 ? "8px 12px" : "0",
                      borderRadius: pIdx === 0 && block.questionIndex > 0 ? "6px" : "0",
                      letterSpacing: "normal",
                      wordBreak: "break-word"
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Dosha & Parihara Block when applicable */}
              {block.showDoshaCard && (
                <div
                  style={{
                    marginTop: "12px",
                    backgroundColor: "#FEF3C7",
                    border: "1.5px solid #D97706",
                    borderRadius: "10px",
                    padding: "10px 14px"
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", letterSpacing: "normal" }}>
                    🪐 {copy.doshaBoxHeading}
                  </div>
                  {block.answerMsg.activeDoshaCard ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", lineHeight: 1.55, color: "#451A03", letterSpacing: "normal" }}>
                      <div><strong>{copy.doshaAffliction}:</strong> {block.answerMsg.activeDoshaCard.doshaName}</div>
                      <div><strong>{copy.doshaCause}:</strong> {block.answerMsg.activeDoshaCard.technicalWhy}</div>
                      <div><strong>{copy.doshaImpact}:</strong> {block.answerMsg.activeDoshaCard.currentLifeProblems}</div>
                      <div><strong>{copy.doshaRemedy}:</strong> {block.answerMsg.activeDoshaCard.recommendedPooja}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: "13px", lineHeight: 1.55, color: "#451A03", letterSpacing: "normal" }}>
                      <strong>{block.answerMsg.doshaName}:</strong> {block.answerMsg.doshaParihara || copy.verifiedFooter}
                    </div>
                  )}
                </div>
              )}

              {/* Subtle Verified Brand Stamp per answer */}
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "6px",
                  borderTop: "1px solid rgba(180, 83, 9, 0.16)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#92400E",
                  textAlign: "right",
                  letterSpacing: "normal"
                }}
              >
                {copy.verifiedFooter}
              </div>
            </div>
          </div>
        );
      })}

      {/* ========================================================================= */}
      {/* FINAL SECTION: SACRED CONCLUSION, FAMILY REFERRAL & BAGGONA PANCHANGA SEAL */}
      {/* ========================================================================= */}
      <div
        className="pdf-section"
        data-section="consultation-benediction-referral"
        style={{
          padding: "14px 44px 28px 44px",
          backgroundColor: "#FFF7ED",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 60%, #FFEDD5 100%)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "16px 22px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "17px", fontWeight: 900, color: "#78350F", marginBottom: "6px", letterSpacing: "normal" }}>
            🪔 {copy.conclusionHeading}
          </div>
          <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#271206", margin: "0 0 12px 0", letterSpacing: "normal" }}>
            {copy.conclusionBody}
          </p>

          <div
            style={{
              backgroundColor: "#FFFDF9",
              border: "1px dashed #B45309",
              borderRadius: "10px",
              padding: "12px 16px",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", letterSpacing: "normal" }}>
              🎁 {copy.familyReferralHeading}
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.55, color: "#451A03", margin: "0 0 6px 0", letterSpacing: "normal" }}>
              {copy.familyReferralBody}
            </p>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#9A3412", letterSpacing: "normal" }}>
              📞 {copy.familyContactLine}
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              fontSize: "13px",
              fontWeight: 900,
              color: "#78350F",
              letterSpacing: "normal"
            }}
          >
            {copy.brandNative} • {copy.priestSealLine}
          </div>
        </div>
      </div>
    </div>
  );
});

ConsultationSessionPdfTemplate.displayName = "ConsultationSessionPdfTemplate";
