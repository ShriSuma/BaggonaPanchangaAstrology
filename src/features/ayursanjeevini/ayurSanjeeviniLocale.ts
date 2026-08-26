import type { SupportedLanguage } from "../../stores/appStore";

export interface AyurSanjeeviniDictionary {
  pageTitle: Record<SupportedLanguage, string>;
  pageSubtitle: Record<SupportedLanguage, string>;
  modeJanmaTitle: Record<SupportedLanguage, string>;
  modeJanmaDesc: Record<SupportedLanguage, string>;
  modeMrityuTitle: Record<SupportedLanguage, string>;
  modeMrityuDesc: Record<SupportedLanguage, string>;
  formHeader: Record<SupportedLanguage, string>;
  formName: Record<SupportedLanguage, string>;
  formDob: Record<SupportedLanguage, string>;
  formTob: Record<SupportedLanguage, string>;
  formPob: Record<SupportedLanguage, string>;
  formGotra: Record<SupportedLanguage, string>;
  formConcern: Record<SupportedLanguage, string>;
  submitBtn: Record<SupportedLanguage, string>;
  downloadPdfBtn: Record<SupportedLanguage, string>;
  tabs: {
    longevity: Record<SupportedLanguage, string>;
    maraka: Record<SupportedLanguage, string>;
    shield: Record<SupportedLanguage, string>;
    karmaVipaka: Record<SupportedLanguage, string>;
    mokshaGati: Record<SupportedLanguage, string>;
    pitru: Record<SupportedLanguage, string>;
    gokarna: Record<SupportedLanguage, string>;
  };
  longevityClasses: {
    balarishta: Record<SupportedLanguage, string>;
    alpayu: Record<SupportedLanguage, string>;
    madhyayu: Record<SupportedLanguage, string>;
    deerghayu: Record<SupportedLanguage, string>;
    divyayu: Record<SupportedLanguage, string>;
  };
  lokaRealms: {
    moksha: Record<SupportedLanguage, string>;
    deva: Record<SupportedLanguage, string>;
    pitru: Record<SupportedLanguage, string>;
    bhuvar: Record<SupportedLanguage, string>;
    martya: Record<SupportedLanguage, string>;
  };
}

export const T_AYUR_SANJEEVINI: AyurSanjeeviniDictionary = {
  pageTitle: {
    kn: "ಆಯುರ್-ಸಂಜೀವಿನಿ & ಕರ್ಮ ಮೋಕ್ಷ ಚಕ್ರ",
    en: "Ayur Sanjeevini & Karma Moksha Chakra",
    hi: "आयुर्-संजीवनी एवं कर्म मोक्ष चक्र",
    te: "ఆయుర్-సంజీవిని & కర్మ మోక్ష చక్రం",
    ta: "ஆயுர் சஞ்சீவினி & கர்ம மோக்ஷ சக்கரம்"
  },
  pageSubtitle: {
    kn: "ವೈದಿಕ ಜನ್ಮ ಆಯುರ್ದಾಯ, ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ರಕ್ಷಾ, ಗಂಡಾಂತ-ಮಾರಕ ಶಮನ & ಪಿತೃ ಸದ್ಗತಿ ಮೋಕ್ಷ ದರ್ಶನ",
    en: "Vedic Ayurdaya Longevity, Maha Mrityunjaya Sanjeevini Shield, Maraka Neutralization & Soul Moksha Realm",
    hi: "वैदिक आयुर्दाय दीर्घायु, महामृत्युंजय संजीवनी कवच, मारक निवारण एवं जीवात्मा मोक्ष गति निर्णय",
    te: "వైదిక ఆయుర్దాయ దీర్ఘాయుష్షు, మహామృత్యుంజయ సంజీవిని కవచం, మారక నివారణ & మోక్ష గతి దర్శనం",
    ta: "வேத ஆயுர்தாய நீண்ட ஆயுள், மகா மிருத்யுஞ்சய சஞ்சீவினி கவசம், மாரக பரிகாரம் & ஆன்ம மோக்ஷ கதி"
  },
  modeJanmaTitle: {
    kn: "🌱 ಜನ್ಮ & ಆಯುರ್ ಸಂಜೀವಿನಿ ರಕ್ಷಾ (Birth & Longevity)",
    en: "🌱 Birth & Longevity Sanjeevini Shield",
    hi: "🌱 जन्म एवं आयुर् संजीवनी रक्षा (जीवन व स्वास्थ्य)",
    te: "🌱 జన్మ & ఆయుర్ సంజీవిని రక్ష (జీవితం & ఆరోగ్యం)",
    ta: "🌱 பிறப்பு & ஆயுள் சஞ்சீவினி ரக்ஷை (வாழ்வு & நலம்)"
  },
  modeJanmaDesc: {
    kn: "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಆಯುರ್ದಾಯ ಗಣನೆ, ಗಂಡಾಂತ ಪರಿಶೀಲನೆ, ಮಾರಕ-ಬಾಧಕ ಶಮನ ಹಾಗೂ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಕವಚ.",
    en: "Ayurdaya longevity estimation, Gandanta diagnostics, Maraka/Badhaka mitigation, and Sanjeevini health shield.",
    hi: "जन्म कुंडली आधारित आयुर्दाय गणना, गंडात परीक्षण, मारक-बाधक शमन एवं संजीवनी रक्षा कवच।",
    te: "జన్మ కుండలి ఆధారిత ఆయుర్దాయ గణన, గండాంత విశ్లేషణ, మారక-బాధక శాంతి & సంజీవిని రక్షణ.",
    ta: "பிறப்பு ஜாதக ஆயுர்தாய கணக்கீடு, கண்டாந்த சோதனை, மாரக-பாதக சாந்தி மற்றும் சஞ்சீவினி கவசம்."
  },
  modeMrityuTitle: {
    kn: "🕊️ ಮೃತ್ಯು, ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ (Soul Transition & Moksha)",
    en: "🕊️ Soul Transition, Pitru Karma & Moksha Realm",
    hi: "🕊️ मृत्यु, सद्गति एवं पितृ मोक्ष (परलोक व शांति)",
    te: "🕊️ మృత్యువు, సద్గతి & పితృ మోక్షం (పరలోక శాంతి)",
    ta: "🕊️ மறைவு, சத்கதி & பித்ரு மோக்ஷம் (பரலோக சாந்தி)"
  },
  modeMrityuDesc: {
    kn: "ಜೀವಿಯ ಪ್ರಯಾಣದ ನಕ್ಷತ್ರ-ತಿಥಿ ದೋಷ ವಿಶ್ಲೇಷಣೆ, ಸದ್ಗತಿ ಲೋಕ ನಿರ್ಣಯ, ತ್ರಿಪಿಂಡಿ/ನಾರಾಯಣ ಬಲಿ ಮಾರ್ಗದರ್ಶಿ & ವಂಶ ರಕ್ಷಾ.",
    en: "Soul transition Nakshatra/Tithi analysis, Loka destination, Tripindi/Narayana Bali guidance, and ancestral blessings.",
    hi: "जीवात्मा महाप्रयाण नक्षत्र-तिथि दोष विश्लेषण, सद्गति लोक निर्णय, त्रिपिंडी/नारायण बलि मार्गदर्शिका।",
    te: "జీవాత్మ ప్రయాణ నక్షత్ర-తిథి దోష విశ్లేషణ, సద్గతి లోక నిర్ణయం, త్రిపిండి/నారాయణ బలి మార్గదర్శనం.",
    ta: "ஆன்ம மறைவு நட்சத்திர-திதி தோஷ ஆய்வு, சத்கதி லோக நிர்ணயம், திரிபிண்டி/நாராயண பலி வழிகாட்டல்."
  },
  formHeader: {
    kn: "ದೈವಿಕ ಸಂಜೀವಿನಿ ವಿವರಗಳ ನಮೂದು",
    en: "Enter Astrological Details for Sanjeevini Analysis",
    hi: "संजीवनी विश्लेषण हेतु आवश्यक ज्योतिषीय विवरण दर्ज करें",
    te: "సంజీవిని విశ్లేషణ కోసం జ్యోతిష్య వివరాలు నమోదు చేయండి",
    ta: "சஞ்சீவினி ஆய்விற்கான ஜோதிட விபரங்களை உள்ளிடவும்"
  },
  formName: {
    kn: "ವ್ಯಕ್ತಿಯ ಪೂರ್ಣ ಹೆಸರು",
    en: "Full Name of Person / Soul",
    hi: "व्यक्ति / पुण्यात्मा का पूरा नाम",
    te: "వ్యక్తి / పుణ్యాత్మ పూర్తి పేరు",
    ta: "நபரின் / புண்ணிய ஆன்மாவின் முழுப் பெயர்"
  },
  formDob: {
    kn: "ದಿನಾಂಕ (ಜನ್ಮ / ಮರಣ ದಿನಾಂಕ)",
    en: "Date (Birth Date / Demise Date)",
    hi: "दिनांक (जन्म तिथि / देहावसान तिथि)",
    te: "తేదీ (జన్మ తేదీ / పరమపదించిన తేదీ)",
    ta: "தேதி (பிறந்த தேதி / மறைந்த தேதி)"
  },
  formTob: {
    kn: "ಸಮಯ (ಖಚಿತತೆಗಾಗಿ)",
    en: "Time (Exact for Lagnabala)",
    hi: "समय (लग्न बल हेतु सटीक समय)",
    te: "సమయం (లగ్న బలం కొరకు ఖచ్చిత సమయం)",
    ta: "நேரம் (லக்ன பலத்திற்கு துல்லிய நேரம்)"
  },
  formPob: {
    kn: "ಸ್ಥಳ ಅಥವಾ ಪಿನ್‌ಕೋಡ್ (ಗೋಕರ್ಣ / ನಿಮ್ಮ ಊರು)",
    en: "Place or Pin Code (e.g. 581326 Gokarna)",
    hi: "स्थान अथवा पिनकोड (उदा. 581326 गोकर्ण)",
    te: "స్థలము లేదా పిన్‌కోడ్ (ఉదా. 581326 గోకర్ణ)",
    ta: "இடம் அல்லது பின்கோடு (எ.கா. 581326 கோகர்ணம்)"
  },
  formGotra: {
    kn: "ಗೋತ್ರ / ನಕ್ಷತ್ರ (ಲಭ್ಯವಿದ್ದರೆ)",
    en: "Gotra / Nakshatra (If available)",
    hi: "गोत्र / नक्षत्र (यदि उपलब्ध हो)",
    te: "గోత్రము / నక్షత్రం (అందుబాటులో ఉంటే)",
    ta: "கோத்ரம் / நட்சத்திரம் (தெரிந்தால்)"
  },
  formConcern: {
    kn: "ಆರೋಗ್ಯ, ಆಯುಷ್ಯ ಅಥವಾ ಪಿತೃ ಶಾಂತಿಗೆ ಸಂಬಂಧಿಸಿದ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ",
    en: "Specific Health, Longevity or Ancestral Peace Concern",
    hi: "स्वास्थ्य, दीर्घायु अथवा पितृ शांति संबंधी विशिष्ट प्रश्न",
    te: "ఆరోగ్యం, ఆయుష్షు లేదా పితృ శాంతికి సంబంధించిన ప్రశ్న",
    ta: "ஆரோக்கியம், ஆயுள் அல்லது பித்ரு சாந்தி குறித்த கேள்வி"
  },
  submitBtn: {
    kn: "✨ ದೈವಿಕ ಸಂಜೀವಿನಿ ಚಕ್ರ ಗಣನೆ ಮಾಡಿ",
    en: "✨ Compute Divine Sanjeevini Chakra",
    hi: "✨ दिव्य संजीवनी चक्र गणना करें",
    te: "✨ దివ్య సంజీవిని చక్ర గణన చేయండి",
    ta: "✨ தெய்வீக சஞ்சீவினி சக்கரத்தை கணக்கிடுங்கள்"
  },
  downloadPdfBtn: {
    kn: "📄 ಪೂರ್ಣ 3-ಪುಟಗಳ A4 ಸಂಜೀವಿನಿ ವರದಿ ಡೌನ್‌ಲೋಡ್ (PDF)",
    en: "📄 Download 3-Page Luxury A4 Sanjeevini Report (PDF)",
    hi: "📄 संपूर्ण 3-पृष्ठीय A4 संजीवनी रिपोर्ट डाउनलोड करें (PDF)",
    te: "📄 సంపూర్ణ 3-పేజీల A4 సంజీవిని నివేదిక డౌన్‌లోడ్ (PDF)",
    ta: "📄 முழு 3-பக்க A4 சஞ்சீவினி அறிக்கை பதிவிறக்குக (PDF)"
  },
  tabs: {
    longevity: {
      kn: "🌟 ಆಯುರ್ದಾಯ & ಪ್ರಾಣ ಶಕ್ತಿ",
      en: "🌟 Longevity & Vitality Matrix",
      hi: "🌟 आयुर्दाय एवं प्राण शक्ति",
      te: "🌟 ఆయుర్దాయం & ప్రాణ శక్తి",
      ta: "🌟 ஆயுர்தாயம் & பிராண சக்தி"
    },
    maraka: {
      kn: "⚔️ ಮಾರಕ & ಬಾಧಕ ಶಮನ",
      en: "⚔️ Maraka & Badhaka Diagnostics",
      hi: "⚔️ मारक एवं बाधक शमन",
      te: "⚔️ మారక & బాధక శమనం",
      ta: "⚔️ மாரக & பாதக சாந்தி"
    },
    shield: {
      kn: "🛡️ ಮಹಾಮೃತ್ಯುಂಜಯ ಕವಚ",
      en: "🛡️ Maha Mrityunjaya Shield",
      hi: "🛡️ महामृत्युंजय रक्षा कवच",
      te: "🛡️ మహామృత్యుంజయ కవచం",
      ta: "🛡️ மகா மிருத்யுஞ்சய கவசம்"
    },
    karmaVipaka: {
      kn: "🌌 ಕರ್ಮ ವಿಪಾಕ & ರೋಗ ನಿವಾರಣೆ",
      en: "🌌 Karma Vipaka Root Causes",
      hi: "🌌 कर्म विपाक एवं रोग कारण",
      te: "🌌 కర్మ విపాకం & వ్యాధి కారణం",
      ta: "🌌 கர்ம விபாகம் & நோய் காரணம்"
    },
    mokshaGati: {
      kn: "🕊️ ಸದ್ಗತಿ & ಮೋಕ್ಷ ಲೋಕ ನಿರ್ಣಯ",
      en: "🕊️ Soul Gati & Moksha Realm",
      hi: "🕊️ सद्गति एवं मोक्ष लोक निर्णय",
      te: "🕊️ సద్గతి & మోక్ష లోక నిర్ణయం",
      ta: "🕊️ சத்கதி & மோக்ஷ லோக நிர்ணயம்"
    },
    pitru: {
      kn: "🪔 ಪಿತೃ ಋಣ & ವಂಶ ಶಾಂತಿ",
      en: "🪔 Pitru Rina & Ancestral Peace",
      hi: "🪔 पितृ ऋण एवं वंश शांति",
      te: "🪔 పితృ రుణం & వంశ శాంతి",
      ta: "🪔 பித்ரு கடன் & வம்ச சாந்தி"
    },
    gokarna: {
      kn: "🕉️ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸಂಕಲ್ಪ",
      en: "🕉️ Gokarna Sanjeevini Sevas",
      hi: "🕉️ गोकर्ण क्षेत्र संकल्प व सेवा",
      te: "🕉️ గోకర్ణ క్షేత్ర సంకల్పం",
      ta: "🕉️ கோகர்ண க்ஷேத்ர சங்கல்பம்"
    }
  },
  longevityClasses: {
    balarishta: {
      kn: "ಬಾಲಾರಿಷ್ಟ ರಕ್ಷಾ (ವಿಶೇಷ ಸಂಜೀವಿನಿ ರಕ್ಷೆ ಅಗತ್ಯ)",
      en: "Balarishta Phase (Special Sanjeevini Protection Advised)",
      hi: "बालारिष्ट चरण (संजीवनी रक्षा आवश्यक)",
      te: "బాలారిష్ట దశ (ప్రత్యేక సంజీవిని రక్షణ అవసరం)",
      ta: "பாலாரிஷ்ட நிலை (சஞ்சீவினி ரக்ஷை தேவை)"
    },
    alpayu: {
      kn: "ಅಲ್ಪಾಯು ಪರಿವರ್ತನ ಯೋಗ (ಮೃತ್ಯುಂಜಯ ತಪಸ್ಸು ಅಗತ್ಯ)",
      en: "Alpayu Mitigation Phase (Mrityunjaya Japa Recommended)",
      hi: "अल्पायु शमन योग (मृत्युंजय तप आवश्यक)",
      te: "అల్పాయు శాంతి యోగం (మృత్యుంజయ జపం అవసరం)",
      ta: "அல்பாயுள் சாந்தி யோகம் (மிருத்யுஞ்சய ஜபம் தேவை)"
    },
    madhyayu: {
      kn: "ಮಧ್ಯಾಯುಷ್ಯ ಯೋಗ (ಪೂರ್ಣ ಆರೋಗ್ಯ ಸಂವರ್ಧನೆ)",
      en: "Madhyayu Span (Balanced Longevity with Health Care)",
      hi: "मध्यायु योग (संतुलित दीर्घायु व स्वास्थ्य संवर्धन)",
      te: "మధ్యాయుస్సు యోగం (ఆరోగ్య సంరక్షణతో దీర్ఘాయువు)",
      ta: "மத்தியாயுள் யோகம் (சீரான நல்வாழ்வு & ஆயுள்)"
    },
    deerghayu: {
      kn: "ದೀರ್ಘಾಯುಷ್ಯ ಮಹಾಯೋಗ (ಪೂರ್ಣ ಶತಾಭಿಷೇಕ ಯೋಗ)",
      en: "Deerghayu Maha Yoga (Full Blessed Longevity Span)",
      hi: "दीर्घायु महायोग (पूर्ण शतायुषी आशीर्वाद)",
      te: "దీర్ఘాయుష్షు మహాయోగం (సంపూర్ణ శతాభిషేక యోగం)",
      ta: "தீர்க்காயுள் மகாயோகம் (நிறைந்த ஆயுள் பாக்கியம்)"
    },
    divyayu: {
      kn: "ದಿವ್ಯಾಯುಷ್ಯ / ಋಷಿ ಯೋಗ (ದೈವಿಕ ಆಯುಷ್ಯ)",
      en: "Divyayu / Sage Longevity Yoga (Transcendent Vitality)",
      hi: "दिव्यायु / ऋषि योग (दिव्य आयु एवं तेज)",
      te: "దివ్యాయుస్సు / ఋషి యోగం (దివ్య ఆయుష్షు)",
      ta: "திவ்யாயுள் / ரிஷி யோகம் (தெய்வீக நீண்ட ஆயுள்)"
    }
  },
  lokaRealms: {
    moksha: {
      kn: "ಮೋಕ್ಷ ಪದವಿ / ಕೈವಲ್ಯ ಲೋಕ (ಪುನರಾವೃತ್ತಿರಹಿತ ಸದ್ಗತಿ)",
      en: "Moksha Realm / Kaivalya (Liberation from Rebirth Cycle)",
      hi: "मोक्ष पद / कैवल्य लोक (पुनर्जन्म से मुक्ति)",
      te: "మోక్ష పదం / కైవల్య లోకం (పునర్జన్మ రహిత సద్గతి)",
      ta: "மோக்ஷ பதம் / கைவல்ய லோகம் (மறுபிறப்பற்ற சத்கதி)"
    },
    deva: {
      kn: "ದೇವಲೋಕ / ಸ್ವರ್ಗ ಲೋಕ (ಪುಣ್ಯ ಭೋಗ ಸದ್ಗತಿ)",
      en: "Deva Loka / Celestial Realm of Elevated Merits",
      hi: "देवलोक / स्वर्ग लोक (उच्च पुण्य भोग)",
      te: "దేవలోకం / స్వర్గ లోకం (పుణ్య లోక నివాసం)",
      ta: "தேவலோகம் / சொர்க்க லோகம் (புண்ணிய லோக வாழ்வு)"
    },
    pitru: {
      kn: "ಪಿತೃ ಲೋಕ (ಪೂರ್ವಜರ ಜೊತೆ ಶಾಂತಿಯುತ ಸದ್ಗತಿ)",
      en: "Pitru Loka (Peaceful Realm of Ancestral Fathers)",
      hi: "पितृ लोक (पूर्वजों के साथ शांतिपूर्ण निवास)",
      te: "పితృ లోకం (పూర్వీకులతో శాంతియుత నివాసం)",
      ta: "பித்ரு லோகம் (முன்னோர்களுடன் அமைதியான வாழ்வு)"
    },
    bhuvar: {
      kn: "ಭುವರ್ಲೋಕ / ಅಂತರಿಕ್ಷ ಮಂಡಲ (ಪ್ರಾರ್ಥನೆ & ತರ್ಪಣ ಅಗತ್ಯ)",
      en: "Bhuvar Loka / Intermediate Plane (Tarpana Recommended)",
      hi: "भुवर्लोक / अंतरिक्ष मंडल (तर्पण एवं शांति कर्म आवश्यक)",
      te: "భువర్లోకం / అంతరిక్ష మండలం (తర్పణ ప్రార్థనలు అవసరం)",
      ta: "புவர்லோகம் / இடைநிலை மண்டலம் (தர்ப்பண பிரார்த்தனை தேவை)"
    },
    martya: {
      kn: "ಮರ್ತ್ಯಲೋಕ ಪುನರ್ಜನ್ಮ ಸಂಭವ (ಶೀಘ್ರ ಉತ್ತಮ ವಂಶ ಜನನ)",
      en: "Noble Earthly Rebirth in Virtuous Lineage",
      hi: "सत्कुलीन मर्त्यलोक पुनर्जन्म (पवित्र वंश में जन्म)",
      te: "ఉత్తమ వంశంలో పునర్జన్మ యోగం",
      ta: "உயர்ந்த குலத்தில் மறுபிறப்பு யோகம்"
    }
  }
};
