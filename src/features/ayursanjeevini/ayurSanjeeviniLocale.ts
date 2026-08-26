import type { SupportedLanguage } from "../../stores/appStore";

export interface AyurSanjeeviniDictionary {
  pageTitle: Record<SupportedLanguage, string>;
  pageSubtitle: Record<SupportedLanguage, string>;
  modeJananaTitle: Record<SupportedLanguage, string>;
  modeJananaDesc: Record<SupportedLanguage, string>;
  modeMaranaTitle: Record<SupportedLanguage, string>;
  modeMaranaDesc: Record<SupportedLanguage, string>;
  formHeaderJanana: Record<SupportedLanguage, string>;
  formHeaderMarana: Record<SupportedLanguage, string>;
  formNameJanana: Record<SupportedLanguage, string>;
  formNameMarana: Record<SupportedLanguage, string>;
  formDobJanana: Record<SupportedLanguage, string>;
  formDobMarana: Record<SupportedLanguage, string>;
  formTobJanana: Record<SupportedLanguage, string>;
  formTobMarana: Record<SupportedLanguage, string>;
  formPobJanana: Record<SupportedLanguage, string>;
  formPobMarana: Record<SupportedLanguage, string>;
  formGotra: Record<SupportedLanguage, string>;
  formConcernJanana: Record<SupportedLanguage, string>;
  formConcernMarana: Record<SupportedLanguage, string>;
  submitBtnJanana: Record<SupportedLanguage, string>;
  submitBtnMarana: Record<SupportedLanguage, string>;
  downloadPdfBtnJanana: Record<SupportedLanguage, string>;
  downloadPdfBtnMarana: Record<SupportedLanguage, string>;
  jananaTabs: {
    longevity: Record<SupportedLanguage, string>;
    gandanta: Record<SupportedLanguage, string>;
    maraka: Record<SupportedLanguage, string>;
    shield: Record<SupportedLanguage, string>;
    karmaVipaka: Record<SupportedLanguage, string>;
    gokarna: Record<SupportedLanguage, string>;
  };
  maranaTabs: {
    mokshaGati: Record<SupportedLanguage, string>;
    transitionDosha: Record<SupportedLanguage, string>;
    pitruRina: Record<SupportedLanguage, string>;
    tripindi: Record<SupportedLanguage, string>;
    vamshaShield: Record<SupportedLanguage, string>;
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
    kn: "ವೈದಿಕ ಜನನ ಆಯುರ್ದಾಯ & ಮಹಾಮೃತ್ಯುಂಜಯ ರಕ್ಷೆ — ಮರಣ ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ, ಸದ್ಗತಿ ಲೋಕ & ಪಿತೃ ಮೋಕ್ಷ ಸಂಕಲ್ಪ",
    en: "Vedic Birth Ayurdaya & Sanjeevini Protection — Demise Transition, Soul Moksha Realm & Pitru Guidance",
    hi: "वैदिक जन्म आयुर्दाय एवं संजीवनी रक्षा — देहावसान नक्षत्र, जीवात्मा सद्गति एवं पितृ मोक्ष संकल्प",
    te: "వైదిక జనన ఆయుర్దాయ & సంజీవిని రక్షణ — మరణ నక్షత్ర శాంతి, సద్గతి లోక నిర్ణయం & పితృ మోక్షం",
    ta: "வேத பிறப்பு ஆயுர்தாய & சஞ்சீவினி பாதுகாப்பு — மறைவு நட்சத்திர ஆய்வு, ஆன்ம சத்கதி & பித்ரு மோக்ஷம்"
  },
  modeJananaTitle: {
    kn: "🌱 ಜನನ & ಆಯುರ್ ಸಂಜೀವಿನಿ (Birth & Longevity)",
    en: "🌱 Birth & Longevity (Janana Portal)",
    hi: "🌱 जन्म एवं आयुर् संजीवनी (जीवन व स्वास्थ्य)",
    te: "🌱 జనన & ఆయుర్ సంజీవిని (జీవితం & ఆరోగ్యం)",
    ta: "🌱 பிறப்பு & ஆயுள் சஞ்சீவினி (வாழ்வு & நலம்)"
  },
  modeJananaDesc: {
    kn: "೧೦೦% ಜನನ ಆಧಾರಿತ ಆಯುರ್ದಾಯ ಗಣನೆ, ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್, ಗಂಡಾಂತ-ಬಾಲಾರಿಷ್ಟ ಪರಿಶೀಲನೆ, ಮಾರಕ ಶಮನ ಹಾಗೂ ಮೃತ್ಯುಂಜಯ ಕವಚ.",
    en: "100% Birth-exclusive Ayurdaya calculations, Vitality score, Gandanta/Balarishta diagnostics, and Maha Mrityunjaya Shield.",
    hi: "शत-प्रतिशत जन्म आधारित आयुर्दाय गणना, प्राणशक्ति स्कोर, गंडात परीक्षण, मारक शमन एवं महामृत्युंजय रक्षा कवच।",
    te: "శతశాతం జన్మ ఆధారిత ఆయుర్దాయ గణన, ప్రాణశక్తి స్కోరు, గండాంత పరీక్ష, మారక శాంతి & మహామృత్యుంజయ కవచం.",
    ta: "முழுக்க முழுக்க பிறப்பு அடிப்படையிலான ஆயுர்தாய கணக்கீடு, பிராண சக்தி, கண்டாந்த பரிகாரம் & மிருத்யுஞ்சய கவசம்."
  },
  modeMaranaTitle: {
    kn: "🕊️ ಮರಣ & ಸದ್ಗತಿ ಮೋಕ್ಷ (Demise & Soul Moksha)",
    en: "🕊️ Demise & Soul Moksha (Marana Portal)",
    hi: "🕊️ मरण एवं सद्गति मोक्ष (परलोक व पितृ शांति)",
    te: "🕊️ మరణం & సద్గతి మోక్షం (పరలోక శాంతి)",
    ta: "🕊️ மறைவு & சத்கதி மோக்ஷம் (பரலோக சாந்தி)"
  },
  modeMaranaDesc: {
    kn: "೧೦೦% ಮರಣ ಆಧಾರಿತ ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ-ಪಂಚಕ ವಿಶ್ಲೇಷಣೆ, ಸದ್ಗತಿ ಲೋಕ ನಿರ್ಣಯ, ತ್ರಿಪಿಂಡಿ/ನಾರಾಯಣ ಬಲಿ ಮಾರ್ಗದರ್ಶಿ & ವಂಶ ರಕ್ಷೆ.",
    en: "100% Demise-exclusive Transition Nakshatra & Panchaka analysis, Soul Loka destination, Tripindi/Narayana Bali guidance, and Descendant Shield.",
    hi: "शत-प्रतिशत देहावसान आधारित प्रयाण नक्षत्र-पंचक विश्लेषण, सद्गति लोक निर्णय, त्रिपिंडी/नारायण बलि व वंश रक्षा।",
    te: "శతశాతం మరణ ఆధారిత నిర్యాణ నక్షత్ర-పంచక విశ్లేషణ, సద్గతి లోక నిర్ణయం, త్రిపిండి/నారాయణ బలి & వంశ రక్షణ.",
    ta: "முழுக்க முழுக்க மறைவு அடிப்படையிலான பஞ்சக ஆய்வு, சத்கதி லோக நிர்ணயம், திரிபிண்டி/நாராயண பலி வழிகாட்டல்."
  },
  formHeaderJanana: {
    kn: "ಜನನ ಜಾತಕ & ಆಯುರ್ ಸಂಜೀವಿನಿ ವಿವರಗಳು",
    en: "Enter Birth Details for Ayur Sanjeevini Analysis",
    hi: "जन्म कुंडली एवं संजीवनी विवरण दर्ज करें",
    te: "జన్మ జాతక & సంజీవిని వివరాలు నమోదు చేయండి",
    ta: "பிறப்பு ஜாதக & சஞ்சீவினி விபரங்களை உள்ளிடவும்"
  },
  formHeaderMarana: {
    kn: "ಮರಣ ನಿರ್ಯಾಣ & ಸದ್ಗತಿ ಮೋಕ್ಷ ವಿವರಗಳು",
    en: "Enter Demise Details for Soul Moksha Analysis",
    hi: "देहावसान एवं सद्गति मोक्ष विवरण दर्ज करें",
    te: "మరణ నిర్యాణ & సద్గతి మోక్ష వివరాలు నమోదు చేయండి",
    ta: "மறைவு & சத்கதி மோக்ஷ விபரங்களை உள்ளிடவும்"
  },
  formNameJanana: {
    kn: "ವ್ಯಕ್ತಿಯ ಪೂರ್ಣ ಹೆಸರು",
    en: "Full Name of Person",
    hi: "व्यक्ति का पूरा नाम",
    te: "వ్యక్తి పూర్తి పేరు",
    ta: "நபரின் முழுப் பெயர்"
  },
  formNameMarana: {
    kn: "ದಿವಂಗತ ಪುಣ್ಯಾತ್ಮರ ಹೆಸರು",
    en: "Name of Departed Soul",
    hi: "दिवंगत पुण्यात्मा का नाम",
    te: "దివంగత పుణ్యాత్మ పేరు",
    ta: "மறைந்த புண்ணிய ஆன்மாவின் பெயர்"
  },
  formDobJanana: {
    kn: "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth)",
    en: "Date of Birth (DOB)",
    hi: "जन्म तिथि (Date of Birth)",
    te: "జన్మ తేదీ (Date of Birth)",
    ta: "பிறந்த தேதி (Date of Birth)"
  },
  formDobMarana: {
    kn: "ಮರಣ / ನಿರ್ಯಾಣ ದಿನಾಂಕ (Date of Demise)",
    en: "Date of Demise / Departure",
    hi: "देहावसान तिथि (Date of Demise)",
    te: "పరమపదించిన తేదీ (Date of Demise)",
    ta: "மறைந்த தேதி (Date of Demise)"
  },
  formTobJanana: {
    kn: "ಹುಟ್ಟಿದ ಸಮಯ (Time of Birth)",
    en: "Time of Birth (Exact for Lagna)",
    hi: "जन्म समय (Time of Birth)",
    te: "జన్మ సమయం (Time of Birth)",
    ta: "பிறந்த நேரம் (Time of Birth)"
  },
  formTobMarana: {
    kn: "ಮರಣ ಕಾಲದ ಸಮಯ (Time of Departure)",
    en: "Time of Departure (For Transition Lagnabala)",
    hi: "देहावसान समय (Time of Departure)",
    te: "నిర్యాణ సమయం (Time of Departure)",
    ta: "மறைந்த நேரம் (Time of Departure)"
  },
  formPobJanana: {
    kn: "ಹುಟ್ಟಿದ ಸ್ಥಳ ಅಥವಾ ಪಿನ್‌ಕೋಡ್",
    en: "Place of Birth or Pin Code",
    hi: "जन्म स्थान अथवा पिनकोड",
    te: "జన్మ స్థలము లేదా పిన్‌కోడ్",
    ta: "பிறந்த இடம் அல்லது பின்கோடு"
  },
  formPobMarana: {
    kn: "ಮರಣ ಹೊಂದಿದ ಸ್ಥಳ ಅಥವಾ ಪಿನ್‌ಕೋಡ್",
    en: "Place of Departure or Pin Code",
    hi: "देहावसान स्थान अथवा पिनकोड",
    te: "నిర్యాణ స్థలము లేదా పిన్‌కోడ్",
    ta: "மறைந்த இடம் அல்லது பின்கோடு"
  },
  formGotra: {
    kn: "ಗೋತ್ರ / ನಕ್ಷತ್ರ (ಲಭ್ಯವಿದ್ದರೆ)",
    en: "Gotra / Nakshatra (If available)",
    hi: "गोत्र / नक्षत्र (यदि उपलब्ध हो)",
    te: "గోత్రము / నక్షత్రం (అందుబాటులో ఉంటే)",
    ta: "கோத்ரம் / நட்சத்திரம் (தெரிந்தால்)"
  },
  formConcernJanana: {
    kn: "ಆರೋಗ್ಯ, ದೀರ್ಘಾಯುಷ್ಯ ಅಥವಾ ಯೋಗಕ್ಷೇಮದ ನಿರ್ದಿಷ್ಟ ಪ್ರಶ್ನೆ",
    en: "Specific Health, Longevity or Vitality Question",
    hi: "स्वास्थ्य, दीर्घायु अथवा आरोग्य संबंधी विशिष्ट प्रश्न",
    te: "ఆరోగ్యం, దీర్ఘాయుష్షు లేదా యోగక్షేమాల ప్రశ్న",
    ta: "ஆரோக்கியம், தீர்க்காயுள் குறித்த கேள்வி"
  },
  formConcernMarana: {
    kn: "ಪಿತೃ ಶಾಂತಿ, ಸದ್ಗತಿ, ಶ್ರಾದ್ಧ ಅಥವಾ ವಂಶ ರಕ್ಷಣೆಯ ಪ್ರಶ್ನೆ",
    en: "Specific Pitru Peace, Moksha, Shradha or Descendant Query",
    hi: "पितृ शांति, सद्गति, श्राद्ध अथवा वंश रक्षा संबंधी प्रश्न",
    te: "పితృ శాంతి, సద్గతి, శ్రాద్ధం లేదా వంశ రక్షణ ప్రశ్న",
    ta: "பித்ரு சாந்தி, சத்கதி, ஷ்ராத்தம் அல்லது வம்ச ரக்ஷை கேள்வி"
  },
  submitBtnJanana: {
    kn: "✨ ಜನನ ಆಯುರ್-ಸಂಜೀವಿನಿ ಚಕ್ರ ಗಣನೆ ಮಾಡಿ",
    en: "✨ Compute Birth Ayur Sanjeevini Chakra",
    hi: "✨ जन्म आयुर्-संजीवनी चक्र गणना करें",
    te: "✨ జన్మ ఆయుర్-సంజీవిని చక్ర గణన చేయండి",
    ta: "✨ பிறப்பு ஆயுர்-சஞ்சீவினி சக்கரத்தை கணக்கிடுங்கள்"
  },
  submitBtnMarana: {
    kn: "🕊️ ಮರಣ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ಚಕ್ರ ಗಣನೆ ಮಾಡಿ",
    en: "🕊️ Compute Soul Transition & Moksha Chakra",
    hi: "🕊️ मरण सद्गति एवं पितृ मोक्ष चक्र गणना करें",
    te: "🕊️ మరణ సద్గతి & పితృ మోక్ష చక్ర గణన చేయండి",
    ta: "🕊️ மறைவு சத்கதி & பித்ரு மோக்ஷ சக்கரத்தை கணக்கிடுங்கள்"
  },
  downloadPdfBtnJanana: {
    kn: "📄 ೩-ಪುಟಗಳ ಜನನ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಪತ್ರಿಕೆ ಡೌನ್‌ಲೋಡ್ (PDF)",
    en: "📄 Download 3-Page Janana Sanjeevini Report (PDF)",
    hi: "📄 3-पृष्ठीय जन्म संजीवनी रक्षा पत्रिका डाउनलोड करें (PDF)",
    te: "📄 3-పేజీల జన్మ సంజీవిని రక్షా పత్రిక డౌన్‌లోడ్ (PDF)",
    ta: "📄 3-பக்க பிறப்பு சஞ்சீவினி ரக்ஷா அறிக்கை பதிவிறக்குக (PDF)"
  },
  downloadPdfBtnMarana: {
    kn: "📄 ೩-ಪುಟಗಳ ಮರಣ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ಪತ್ರಿಕೆ ಡೌನ್‌ಲೋಡ್ (PDF)",
    en: "📄 Download 3-Page Soul Moksha Report (PDF)",
    hi: "📄 3-पृष्ठीय मरण सद्गति एवं पितृ मोक्ष पत्रिका डाउनलोड करें (PDF)",
    te: "📄 3-పేజీల మరణ సద్గతి & పితృ మోక్ష పత్రిక డౌన్‌లోడ్ (PDF)",
    ta: "📄 3-பக்க மறைவு சத்கதி & பித்ரு மோக்ஷ அறிக்கை பதிவிறக்குக (PDF)"
  },
  jananaTabs: {
    longevity: {
      kn: "🌟 ಆಯುರ್ದಾಯ & ಪ್ರಾಣ ಶಕ್ತಿ",
      en: "🌟 Longevity & Vitality Matrix",
      hi: "🌟 आयुर्दाय एवं प्राण शक्ति",
      te: "🌟 ఆయుర్దాయం & ప్రాణ శక్తి",
      ta: "🌟 ஆயுர்தாயம் & பிராண சக்தி"
    },
    gandanta: {
      kn: "⚖️ ಗಂಡಾಂತ & ಬಾಲಾರಿಷ್ಟ",
      en: "⚖️ Gandanta & Balarishta Shield",
      hi: "⚖️ गंडात एवं बालारिष्ट शमन",
      te: "⚖️ గండాంత & బాలారిష్ట రక్షణ",
      ta: "⚖️ கண்டாந்த & பாலாரிஷ்ட ரக்ஷை"
    },
    maraka: {
      kn: "⚔️ ಮಾರಕ-ಬಾಧಕ ಶಮನ",
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
      kn: "🌌 ಕರ್ಮ ವಿಪಾಕ & ಆರೋಗ್ಯ",
      en: "🌌 Karma Vipaka Health Causes",
      hi: "🌌 कर्म विपाक एवं आरोग्य कारण",
      te: "🌌 కర్మ విపాకం & ఆరోగ్య కారణం",
      ta: "🌌 கர்ம விபாகம் & நல்வாழ்வு"
    },
    gokarna: {
      kn: "🕉️ ಗೋಕರ್ಣ ಆಯುಷ್ಯ ಹೋಮ",
      en: "🕉️ Gokarna Ayushya Sevas",
      hi: "🕉️ गोकर्ण आयुष्य होम व सेवा",
      te: "🕉️ గోకర్ణ ఆయుష్య హోమం",
      ta: "🕉️ கோகர்ண ஆயுஷ்ய ஹோமம்"
    }
  },
  maranaTabs: {
    mokshaGati: {
      kn: "🕊️ ಸದ್ಗತಿ & ಮೋಕ್ಷ ಲೋಕ",
      en: "🕊️ Soul Destination & Moksha",
      hi: "🕊️ सद्गति एवं मोक्ष लोक निर्णय",
      te: "🕊️ సద్గతి & మోక్ష లోక నిర్ణయం",
      ta: "🕊️ சத்கதி & மோக்ஷ லோக நிர்ணயம்"
    },
    transitionDosha: {
      kn: "🌌 ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ & ಪಂಚಕ",
      en: "🌌 Demise Nakshatra & Panchaka",
      hi: "🌌 देहावसान नक्षत्र एवं पंचक शांति",
      te: "🌌 నిర్యాణ నక్షత్ర & పంచక శాంతి",
      ta: "🌌 மறைவு நட்சத்திரம் & பஞ்சக ஆய்வு"
    },
    pitruRina: {
      kn: "🪔 ಪಿತೃ ಋಣ & ೧೬ ಶ್ರಾದ್ಧ ವಿಧಿ",
      en: "🪔 Pitru Rina & 16 Shradhas",
      hi: "🪔 पितृ ऋण एवं १६ श्राद्ध विधि",
      te: "🪔 పితృ రుణం & 16 శ్రాద్ధ విధులు",
      ta: "🪔 பித்ரு கடன் & 16 ஷ்ராத்த விதி"
    },
    tripindi: {
      kn: "🔱 ತ್ರಿಪಿಂಡಿ & ನಾರಾಯಣ ಬಲಿ",
      en: "🔱 Tripindi & Narayana Bali",
      hi: "🔱 त्रिपिंडी श्राद्ध एवं नारायण बलि",
      te: "🔱 త్రిపిండి శ్రాద్ధం & నారాయణ బలి",
      ta: "🔱 திரிபிண்டி ஷ்ராத்தம் & நாராயண பலி"
    },
    vamshaShield: {
      kn: "🛡️ ವಂಶ ರಕ್ಷಾ & ಆಶೀರ್ವಾದ",
      en: "🛡️ Descendant Prosperity Shield",
      hi: "🛡️ वंश रक्षा एवं पितृ आशीर्वाद",
      te: "🛡️ వంశ రక్షణ & పితృ ఆశీస్సులు",
      ta: "🛡️ வம்ச ரக்ஷை & பித்ரு ஆசிகள்"
    },
    gokarna: {
      kn: "🕉️ ಗೋಕರ್ಣ ಪಿತೃ ಮುಕ್ತಿ ಸಂಕಲ್ಪ",
      en: "🕉️ Gokarna Pitru Mukti Sevas",
      hi: "🕉️ गोकर्ण पितृ मुक्ति संकल्प",
      te: "🕉️ గోకర్ణ పితృ ముక్తి సంకల్పం",
      ta: "🕉️ கோகர்ண பித்ரு முக்தி சங்கல்பம்"
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
