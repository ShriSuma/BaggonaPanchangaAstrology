/**
 * Baggona Panchanga Astrology - Public Kundli & Live Analysis 5-Language Dictionary
 * Languages supported: Kannada (kn), English (en), Hindi (hi), Telugu (te), Tamil (ta)
 * 100% Dynamic - Zero Hardcoding - Exact Replica of Core Baggona Calculations
 */

export type PublicKundliLang = "kn" | "en" | "hi" | "te" | "ta";

export const PUBLIC_KUNDLI_LANGUAGES: { code: PublicKundliLang; label: string; nativeLabel: string }[] = [
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" }
];

export const T_PUBLIC_KUNDLI: Record<string, Record<PublicKundliLang, string>> = {
  // Sacred Invocations & Headings
  sacredInvocation: {
    kn: "॥ ಶ್ರೀ ಗುರುಭ್ಯೋ ನಮಃ ॥ ಶ್ರೀ ಮಹಾಗಣಪತಯೇ ನಮಃ ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ ॥",
    en: "॥ Shri Gurubhyo Namaha ॥ Shri Mahaganapataye Namaha ॥ Shri Gokarna Mahabaleshwaraya Namaha ॥",
    hi: "॥ श्री गुरुभ्यो नमः ॥ श्री महागणपतये नमः ॥ श्री गोकर्ण महाबलेश्वर नमः ॥",
    te: "॥ శ్రీ గురుభ్యో నమః ॥ శ్రీ మహాగణపతయే నమః ॥ శ్రీ గోకర్ణ మహాబలేశ్వరాయ నమః ॥",
    ta: "॥ ஸ்ரீ குருப்யோ நமஹ ॥ ஸ்ரீ மஹாகணபதயே நமஹ ॥ ஸ்ரீ கோகர்ண மஹாபலேஷ்வராய நமஹ ॥"
  },
  portalTitle: {
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ - ಗೋಕರ್ಣ",
    en: "Baggona Panchanga Astrology Office - Gokarna",
    hi: "बग्गोण पंचांग ज्योतिष कार्यालय - गोकर्ण",
    te: "బగ్గోణ పంచాంగ జ్యోతిష్య కార్యాలయము - గోకర్ణ",
    ta: "பக்கோண பஞ்சாங்க ஜோதிட அலுவலகம் - கோகர்ண"
  },
  portalSubtitle: {
    kn: "ವೈಯಕ್ತಿಕ ಜನನ ಕುಂಡಲಿ ರಚನೆ & ನೇರ ಜೀವನ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ",
    en: "Personal Birth Kundli Generation & Live Life Astrology Guidance",
    hi: "व्यक्तिगत जन्म कुंडली निर्माण एवं प्रत्यक्ष जीवन ज्योतिष मार्गदर्शन",
    te: "వ్యక్తిగత జనన కుండలి నిర్మాణం మరియు ప్రత్యక్ష జీవిత జ్యోతిష్య మార్గదర్శనం",
    ta: "தனிப்பட்ட பிறப்பு ஜாதக கணிப்பு மற்றும் நேரடி வாழ்க்கை ஜோதிட வழிகாட்டுதல்"
  },

  // Internet Online Guard
  offlineBannerTitle: {
    kn: "⚠️ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಗತ್ಯವಿದೆ (Internet Required)",
    en: "⚠️ Active Internet Connection Required",
    hi: "⚠️ सक्रिय इंटरनेट कनेक्शन आवश्यक है",
    te: "⚠️ ఇంటర్నెట్ కనెక్షన్ అవసరం",
    ta: "⚠️ இணைய இணைப்பு தேவைப்படுகிறது"
  },
  offlineBannerMsg: {
    kn: "ಸಾರ್ವಜನಿಕ ಭಕ್ತರ ನಿಖರ ಜನನ ಕುಂಡಲಿ ಮತ್ತು ದೈವಿಕ ನೇರ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಸಕ್ರಿಯ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅತ್ಯಗತ್ಯ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.",
    en: "An active internet connection is strictly required for accurate astronomical calculations, live AI synthesis, and divine astrology analysis.",
    hi: "सटीक खगोलीय गणना और प्रत्यक्ष ज्योतिष विश्लेषण के लिए सक्रिय इंटरनेट कनेक्शन अनिवार्य है। कृपया अपना कनेक्शन जांचें।",
    te: "ఖచ్చితమైన జ్యోతిష్య గణనలు మరియు ప్రత్యక్ష విశ్లేషణ కోసం ఇంటర్నెట్ కనెక్షన్ తప్పనిసరి. దయచేసి కనెక్షన్ తనిఖీ చేయండి.",
    ta: "துல்லியமான ஜோதிட கணக்கீடுகள் மற்றும் நேரடி பகுப்பாய்விற்கு இணைய இணைப்பு அவசியம். உங்கள் இணைப்பை சரிபார்க்கவும்."
  },

  // Step 1: Input Form
  formHeader: {
    kn: "ಜನ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ (Enter Birth Details)",
    en: "Enter Authentic Birth Details",
    hi: "जन्म विवरण दर्ज करें",
    te: "జన్మ వివరాలను నమోదు చేయండి",
    ta: "பிறப்பு விவரங்களை உள்ளிடவும்"
  },
  formDesc: {
    kn: "ನಿಮ್ಮ ಹೆಸರು, ಜನನ ದಿನಾಂಕ, ನಿಖರ ಸಮಯ ಮತ್ತು ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ ಅಧಿಕೃತ ಬಗ್ಗೋಣ ಲಗ್ನ ಕುಂಡಲಿ ರಚಿಸಿ.",
    en: "Enter your name, date of birth, exact time, and birthplace for authentic Baggona Lahiri Kundli.",
    hi: "सटीक बग्गोण लग्न कुंडली के लिए अपना नाम, जन्म तिथि, समय और स्थान दर्ज करें।",
    te: "ఖచ్చితమైన బగ్గోణ లగ్న కుండలి కోసం మీ పేరు, జన్మ తేది, సమయం మరియు స్థలాన్ని నమోదు చేయండి.",
    ta: "துல்லியமான பக்கோண லக்ன ஜாதகத்திற்கு உங்கள் பெயர், பிறந்த தேதி, நேரம் மற்றும் இடத்தை உள்ளிடவும்."
  },
  nameLabel: {
    kn: "ಭಕ್ತರ ಹೆಸರು (Devotee / Person Name)",
    en: "Devotee / Person Full Name",
    hi: "जातक / भक्त का नाम",
    te: "భక్తుని / జాతకుని పేరు",
    ta: "பக்தர் / ஜாதகர் பெயர்"
  },
  namePlaceholder: {
    kn: "ಉದಾ: ಶ್ರೀಧರ ಹೆಗಡೆ / Shreedhar Hegde",
    en: "e.g. Shreedhar Hegde",
    hi: "उदा: श्रीधर हेगड़े",
    te: "ఉదా: శ్రీధర్ హెగ్డే",
    ta: "எ.கா: ஸ்ரீதர் ஹெக்டே"
  },
  genderLabel: {
    kn: "ಲಿಂಗ (Gender)",
    en: "Gender",
    hi: "लिंग",
    te: "లింగము",
    ta: "பாலினம்"
  },
  genderMale: {
    kn: "ಪುರುಷ (Male)",
    en: "Male",
    hi: "पुरुष",
    te: "పురుషుడు",
    ta: "ஆண்"
  },
  genderFemale: {
    kn: "ಮಹಿಳೆ (Female)",
    en: "Female",
    hi: "महिला",
    te: "మహిళ",
    ta: "பெண்"
  },
  genderOther: {
    kn: "ಇತರ (Other)",
    en: "Other",
    hi: "अन्य",
    te: "ఇతర",
    ta: "மற்றவை"
  },
  dobLabel: {
    kn: "ಜನನ ದಿನಾಂಕ (Date of Birth)",
    en: "Date of Birth",
    hi: "जन्म तिथि",
    te: "పుట్టిన తేది",
    ta: "பிறந்த தேதி"
  },
  tobLabel: {
    kn: "ಜನನ ಸಮಯ (Exact Birth Time)",
    en: "Exact Birth Time",
    hi: "जन्म समय (सटीक)",
    te: "పుట్టిన సమయం",
    ta: "பிறந்த நேரம்"
  },
  pincodeLabel: {
    kn: "ಸ್ಥಳದ ಪಿನ್‌ಕೋಡ್ (6-Digit Pincode)",
    en: "Birthplace Pincode (6 digits)",
    hi: "जन्म स्थान पिनकोड (६ अंक)",
    te: "జన్మ స్థలం పిన్‌కోడ్ (6 అంకెలు)",
    ta: "பிறந்த இடம் அஞ்சல் குறியீடு (6 இலக்கங்கள்)"
  },
  pincodePlaceholder: {
    kn: "ಉದಾ: 581326 (Gokarna)",
    en: "e.g. 581326",
    hi: "उदा: 581326",
    te: "ఉదా: 581326",
    ta: "எ.கா: 581326"
  },
  placeNameLabel: {
    kn: "ಹುಟ್ಟಿದ ಊರು / ನಗರ (Town / City Name)",
    en: "Birth Town / Village / City",
    hi: "जन्म नगर / ग्राम",
    te: "జన్మ స్థలం / గ్రామం",
    ta: "பிறந்த ஊர் / நகரம்"
  },
  placeNamePlaceholder: {
    kn: "ಉದಾ: ಗೋಕರ್ಣ, ಕುಮಟಾ, ಬೆಂಗಳೂರು",
    en: "e.g. Gokarna, Kumta, Bengaluru",
    hi: "उदा: गोकर्ण, कुमटा, बेंगलुरु",
    te: "ఉదా: గోకర్ణ, కుమటా, బెంగళూరు",
    ta: "எ.கா: கோகர்ணா, குமட்டா, பெங்களூரு"
  },
  gotraLabel: {
    kn: "ಗೋತ್ರ (Gotra - ಐಚ್ಛಿಕ)",
    en: "Gothra (Optional)",
    hi: "गोत्र (वैकल्पिक)",
    te: "గోత్రము (ఐచ్ఛికము)",
    ta: "கோத்ரம் (விருப்பத்தேர்வு)"
  },
  gotraPlaceholder: {
    kn: "ಉದಾ: ಕಾಶ್ಯಪ, ಭಾರದ್ವಾಜ, ವಿಶ್ವಾಮಿತ್ರ...",
    en: "e.g. Kashyapa, Bharadwaja, Vishwamitra...",
    hi: "उदा: कश्यप, भारद्वाज, विश्वामित्र...",
    te: "ఉదా: కాశ్యప, భరద్వాజ, విశ్వామిత్ర...",
    ta: "எ.கா: காஷ்யப, பாரத்வாஜ, விஸ்வாமித்ர..."
  },
  generateBtn: {
    kn: "ಜನನ ಕುಂಡಲಿ ರಚಿಸಿ (Generate Kundali)",
    en: "Generate Authentic Janma Kundali",
    hi: "जन्म कुंडली बनाएं",
    te: "జనన కుండలి రూపొందించండి",
    ta: "ஜாதகத்தை உருவாக்குங்கள்"
  },
  generatingStatus: {
    kn: "ಬಗ್ಗೋಣ ಸಿದ್ಧಾಂತ ಲಗ್ನ ಮತ್ತು ಗ್ರಹ ಸ್ಥಾನಗಳನ್ನು ಗಣನೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    en: "Calculating authentic Baggona Lagna and planetary amshas...",
    hi: "बग्गोण सिद्धांत अनुसार लग्न और ग्रह स्थितियों की गणना हो रही है...",
    te: "బగ్గోణ సిద్ధాంతం ప్రకారం లగ్న మరియు గ్రహ స్థానాలు గణింపబడుతున్నాయి...",
    ta: "பக்கோண சித்தாந்தத்தின்படி லக்னம் மற்றும் கிரக நிலைகள் கணக்கிடப்படுகின்றன..."
  },

  // Step 2: Result Screen Badges
  chartHeading: {
    kn: "॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ ॥",
    en: "॥ Shri Baggona Panchanga Janma Kundali ॥",
    hi: "॥ श्री बग्गोण पंचांग जन्म कुंडली ॥",
    te: "॥ శ్రీ బగ్గోణ పంచాంగ జనన కుండలి ॥",
    ta: "॥ ஸ்ரீ பக்கோண பஞ்சாங்க பிறப்பு ஜாதகம் ॥"
  },
  lagnaBadge: {
    kn: "ಲಗ್ನ",
    en: "Lagna (Ascendant)",
    hi: "लग्न",
    te: "లగ్నం",
    ta: "லக்னம்"
  },
  rashiBadge: {
    kn: "ಚಂದ್ರ ರಾಶಿ",
    en: "Moon Sign (Rashi)",
    hi: "चन्द्र राशि",
    te: "చంద్ర రాశి",
    ta: "சந்திர ராசி"
  },
  nakshatraBadge: {
    kn: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    en: "Birth Nakshatra",
    hi: "जन्म नक्षत्र",
    te: "జన్మ నక్షత్రం",
    ta: "பிறந்த நட்சத்திரம்"
  },
  padaBadge: {
    kn: "ಪಾದ",
    en: "Pada",
    hi: "चरण",
    te: "పాదం",
    ta: "பாதம்"
  },
  dashaBadge: {
    kn: "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ & ಭುಕ್ತಿ",
    en: "Current Mahadasha & Bhukti",
    hi: "वर्तमान महादशा एवं भुक्ति",
    te: "ప్రస్తుత మహాదశ & భుక్తి",
    ta: "தற்போதைய மகாதிசை & புக்தி"
  },
  bhuktiBadge: {
    kn: "ಭುಕ್ತಿ",
    en: "Bhukti",
    hi: "भुक्ति",
    te: "భుక్తి",
    ta: "புக்தி"
  },
  doshaSectionTitle: {
    kn: "ಜನ್ಮ ಕುಂಡಲಿ ಕರ್ಮ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಗೋಕರ್ಣ ಪರಿಹಾರ",
    en: "Karmic Dosha Analysis & Sri Kshetra Gokarna Temple Parihara",
    hi: "जन्म कुंडली कर्म दोष विश्लेषण एवं गोकर्ण परिहार",
    te: "జన్మ కుండలి కర్మ దోష విశ్లేషణ & గోకర్ణ పరిహారం",
    ta: "பிறப்பு ஜாதக கர்ம தோஷ பகுப்பாய்வு & கோகர்ண பரிகாரம்"
  },
  doshaDetectedBadge: {
    kn: "ದೋಷ ಕಂಡುಬಂದಿದೆ",
    en: "Dosha Detected",
    hi: "दोष उपस्थित",
    te: "దోషం గుర్తించబడింది",
    ta: "தோஷம் உள்ளது"
  },
  doshaCleanBadge: {
    kn: "ದೋಷವಿಲ್ಲ (ಶುಭ)",
    en: "Clear (Auspicious)",
    hi: "दोष मुक्त (शुभ)",
    te: "దోషం లేదు (శుభం)",
    ta: "தோஷம் இல்லை (சுபம்)"
  },
  priorityLabel: {
    kn: "ಪ್ರಾಮುಖ್ಯತೆ",
    en: "Priority",
    hi: "प्राथमिकता",
    te: "ప్రాధాన్యత",
    ta: "முன்னுரிமை"
  },
  reasonLabel: {
    kn: "ಜ್ಯೋತಿಷ್ಯ ಕಾರಣ",
    en: "Astrological Reason",
    hi: "ज्योतिषीय कारण",
    te: "జ్యోతిష్య కారణం",
    ta: "ஜோதிட காரணம்"
  },
  pariharaLabel: {
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ",
    en: "Gokarna Temple Parihara",
    hi: "गोकर्ण क्षेत्र परिहार",
    te: "గోకర్ణ క్షేత్ర పరిహారం",
    ta: "கோகர்ண பரிகாரம்"
  },
  highPriorityText: {
    kn: "ಅತ್ಯಂತ ಅವಶ್ಯಕ (High Priority)",
    en: "High Priority (Urgent)",
    hi: "अति आवश्यक (उच्च प्राथमिकता)",
    te: "అత్యంత అవసరం (High Priority)",
    ta: "மிகவும் அவசியம் (High Priority)"
  },
  mediumPriorityText: {
    kn: "ಮಧ್ಯಮ (Medium Priority)",
    en: "Medium Priority",
    hi: "मध्यम प्राथमिकता",
    te: "మధ్యమ ప్రాధాన్యత",
    ta: "நடுத்தர முன்னுரிமை"
  },
  cleanPriorityText: {
    kn: "ಶುಭ (No Action Needed)",
    en: "Auspicious (No Action Needed)",
    hi: "शुभ (उपाय आवश्यक नहीं)",
    te: "శుభం (పరిహారం అవసరం లేదు)",
    ta: "சுபம் (பரிகாரம் தேவையில்லை)"
  },
  unlockPersonalityPromptTitle: {
    kn: "🔒 ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ ಅನ್‌ಲಾಕ್ ಮಾಡಿ",
    en: "🔒 Unlock Personality & Hidden Secrets",
    hi: "🔒 व्यक्तित्व एवं गूढ़ रहस्य अनलॉक करें",
    te: "🔒 వ్యక్తిత్వం & అంతరంగ రహస్యాలు అన్‌లాక్ చేయండి",
    ta: "🔒 ஆளுமை & மறைக்கப்பட்ட ரகசியங்களை திறக்கவும்"
  },
  unlockPersonalityPromptDesc: {
    kn: "ಈ ವಿಶೇಷ ವಿಭಾಗದಲ್ಲಿ ತಮ್ಮ ಸಹಜ ಸ್ವಭಾವ, ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯಗಳು, ಪ್ರಸ್ತುತ ಸಂದಿಗ್ಧತೆಗಳು ಹಾಗೂ ಮಾಂದಿ (ಗುಳಿಕ) ಪ್ರಭಾವದ ಮುಖಾಮುಖಿ ಜ್ಯೋತಿಷ್ಯ ಕಥನ ಮತ್ತು ಧ್ವನಿ ವಿವರಣೆ ಲಭ್ಯವಿದೆ.",
    en: "Unlock in-depth face-to-face personality reading, subconscious secrets, burning questions, and Maandi karmic shadow with voice narration.",
    hi: "गहन व्यक्तित्व विश्लेषण, अंतर्मन के गूढ़ रहस्य, वर्तमान जीवन मोड़ एवं मांदि कर्म प्रभाव का प्रत्यक्ष फलादेश अनलॉक करें।",
    te: "వ్యక్తిత్వ విశ్లేషణ, అంతరంగ రహస్యాలు, ప్రస్తుత సందిగ్ధతలు మరియు మాంది కర్మ ప్రభావాన్ని అన్‌లాక్ చేయండి.",
    ta: "ஆழ்ந்த ஆளுமை பகுப்பாய்வு, மறைக்கப்பட்ட ரகசியங்கள் மற்றும் மாந்தி கர்ம தாக்கத்தை திறக்கவும்."
  },
  unlockPersonalityConfirmBtn: {
    kn: "🪙 1,000 Coins ನೀಡಿ ಅನ್‌ಲಾಕ್ ಮಾಡಿ (Unlock Now)",
    en: "🪙 Unlock with 1,000 Coins (Unlock Now)",
    hi: "🪙 1,000 Coins देकर अनलॉक करें",
    te: "🪙 1,000 Coins చెల్లించి అన్‌లాక్ చేయండి",
    ta: "🪙 1,000 Coins செலுத்தி திறக்கவும்"
  },
  personalityUnlockedBadge: {
    kn: "🔓 ಅನ್‌ಲಾಕ್ ಆಗಿದೆ",
    en: "🔓 Unlocked",
    hi: "🔓 अनलॉक किया गया",
    te: "🔓 అన్‌లాక్ చేయబడింది",
    ta: "🔓 திறக்கப்பட்டது"
  },
  activeBhuktiBadge: {
    kn: "⭐ ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಭುಕ್ತಿ",
    en: "⭐ Currently Active Bhukti",
    hi: "⭐ वर्तमान सक्रिय भुक्ति",
    te: "⭐ ప్రస్తుతం నడుస్తున్న భుక్తి",
    ta: "⭐ தற்போது செயலில் உள்ள புக்தி"
  },
  clickToExpandBhuktis: {
    kn: "೯ ಭುಕ್ತಿಗಳು & ಫಲಗಳನ್ನು ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    en: "Click to expand 9 Bhuktis & 2-Line Predictions",
    hi: "9 भुक्ति एवं फल देखने हेतु क्लिक करें",
    te: "9 భుక్తులు మరియు ఫలితాలు చూడటానికి క్లిక్ చేయండి",
    ta: "9 புக்திகள் & பலன்களைக் காண கிளிக் செய்யவும்"
  },
  bhuktiClimateHeader: {
    kn: "ಜೀವನ ಸ್ಥಿತಿ & ಪ್ರಭಾವ:",
    en: "Life Climate & Influences:",
    hi: "जीवन स्थिति एवं प्रभाव:",
    te: "జీవిత స్థితి & ప్రభావం:",
    ta: "வாழ்க்கை நிலை & தாக்கம்:"
  },
  bhuktiIssueHeader: {
    kn: "ಸಂಭಾವ್ಯ ಸವಾಲು & ಎಚ್ಚರಿಕೆ:",
    en: "Potential Issues & Challenges:",
    hi: "संभावित चुनौतियां एवं सावधानी:",
    te: "సంభావ్య సవాళ్లు & హెచ్చరిక:",
    ta: "சாத்தியமான சவால்கள் & எச்சரிக்கை:"
  },
  activeSpanLabel: {
    kn: "ಸಕ್ರಿಯ ಕಾಲಾವಧಿ",
    en: "Active Period",
    hi: "सक्रिय समयावधि",
    te: "నడుస్తున్న సమయం",
    ta: "செயலில் உள்ள காலம்"
  },
  yearsLabel: {
    kn: "ವರ್ಷಗಳು",
    en: "Years",
    hi: "वर्ष",
    te: "సంవత్సరాలు",
    ta: "ஆண்டுகள்"
  },

  // 6 CORE TABS (Matching Full Kundli Application)
  tabPatrika: {
    kn: "ಜಾತಕ ಪತ್ರಿಕೆ & ಪಂಚಾಂಗ",
    en: "Sacred Patrika & Panchanga",
    hi: "जन्म पत्रिका एवं पंचांग",
    te: "జాతక పత్రిక & పంచాంగం",
    ta: "ஜாதக பத்திரிகை & பஞ்சாங்கம்"
  },
  tabPersonality: {
    kn: "ವ್ಯಕ್ತಿತ್ವ & ನಿಗೂಢ ರಹಸ್ಯ",
    en: "Personality & Hidden Psyche",
    hi: "व्यक्तित्व एवं गूढ़ रहस्य",
    te: "వ్యక్తిత్వం & అంతరంగ రహస్యాలు",
    ta: "ஆளுமை & மறைக்கப்பட்ட ரகசியங்கள்"
  },
  tabPlanets: {
    kn: "ಗ್ರಹ ಸ್ಥಿತಿ ಕೋಷ್ಟಕ",
    en: "Planetary Positions & Amshas",
    hi: "ग्रह स्थिति तालिका",
    te: "గ్రహ స్థితి పట్టిక",
    ta: "கிரக நிலை அட்டவணை"
  },
  tabDasha: {
    kn: "ದಶಾ & ಭುಕ್ತಿ ಕಾಲಚಕ್ರ",
    en: "Dasha & Bhukti Timeline",
    hi: "दशा एवं भुक्ति कालचक्र",
    te: "దశా ಮತ್ತು భుక్తి కాలచక్రం",
    ta: "திசா & புக்தி காலச்சக்கரம்"
  },
  tabAnalysis: {
    kn: "ನೇರ ಜೀವನ ವಿಶ್ಲೇಷಣೆ & ಪ್ರಶ್ನೋತ್ತರ",
    en: "Live Life Analysis & Q&A",
    hi: "प्रत्यक्ष जीवन विश्लेषण एवं प्रश्नोत्तरी",
    te: "ప్రత్యక్ష జీవిత విశ్లేషణ & ప్రశ్నోత్తరాలు",
    ta: "நேரடி வாழ்க்கை பகுப்பாய்வு & கேள்வி-பதில்"
  },
  tabRemedies: {
    kn: "ದೈವಿಕ ಪರಿಹಾರಗಳು & ಗೋಕರ್ಣ ಸೇವೆ",
    en: "Divine Remedies & Gokarna Seva",
    hi: "दिव्य परिहार एवं गोकर्ण सेवा",
    te: "దైవిక పరిహారాలు & గోకర్ణ సేవ",
    ta: "தெய்வீக பரிகாரங்கள் & கோகர்ண சேவை"
  },

  // Personality & Hidden Psyche Section Headers
  personalitySectionHeader: {
    kn: "ತಮ್ಮ ಬಗ್ಗೆ / ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ (Core Nature & Personality)",
    en: "About Yourself / Core Nature & Personality Demeanor",
    hi: "आपके बारे में / मूल स्वभाव एवं व्यक्तित्व विश्लेषण",
    te: "మీ గురించి / సహజ స్వభావం & వ్యక్తిత్వ విశ్లేషణ",
    ta: "உங்களைப் பற்றி / அடிப்படை குணம் & ஆளுமை பகுப்பாய்வு"
  },
  hiddenSecretsSectionHeader: {
    kn: "ನಿಗೂಢ ರಹಸ್ಯ & ಆಂತರ್ಯದ ಸೂಕ್ಷ್ಮತೆ (Hidden Secrets & Subconscious Psyche)",
    en: "Hidden Secrets, Subconscious Fears & Latent Mystical Traits",
    hi: "गूढ़ रहस्य, अंतर्मन का भय एवं रहस्यमयी गुण",
    te: "అంతరంగ రహస్యాలు, నిగూఢ భయాలు & ఆధ్యాత్మిక శక్తులు",
    ta: "மறைக்கப்பட்ட ரகசியங்கள், ஆழ்மன பயங்கள் & ஆன்மீக ஆற்றல்கள்"
  },
  whyAstrologySectionHeader: {
    kn: "ಪ್ರಸ್ತುತ ಜ್ಯೋತಿಷ್ಯದ ಮೊರೆ ಹೋಗಲು ಕಾರಣ & ನಿರೀಕ್ಷೆಗಳು (Why You Came to Astrology Right Now)",
    en: "Why You Came to Astrology Right Now & Current Life Turning Point",
    hi: "वर्तमान में ज्योतिष मार्गदर्शन की आवश्यकता एवं जीवन की वर्तमान स्थिति",
    te: "ప్రస్తుతం జ్యోతిష్య మార్గదర్శనం కోరడానికి గల కారణం & జీవిత మలుపు",
    ta: "தற்போது ஜோதிட வழிகாட்டலை நாடக் காரணம் & தற்போதைய எதிர்பார்ப்புகள்"
  },
  internalQuestionsSectionHeader: {
    kn: "ಮನದಾಳದಲ್ಲಿರುವ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು & ಸಂದಿಗ್ಧತೆಗಳು (Questions You Carry in Your Heart)",
    en: "The Burning Questions You Are Currently Carrying Inside Your Heart",
    hi: "आपके मन में चल रहे अंतर्निहित ज्वलंत प्रश्न एवं दुविधाएं",
    te: "మీ మనసులోని ప్రధాన అంతర్గత ప్రశ్నలు & సందిగ్ధతలు",
    ta: "உங்கள் மனதில் ஓடிக்கொண்டிருக்கும் முதன்மையான கேள்விகள் & குழப்பங்கள்"
  },
  maandiSectionHeader: {
    kn: "ಮಾಂದಿ (ಗುಳಿಕ) ನಿಗೂಢ ಪ್ರಭಾವ & ದೋಷ ನಿವಾರಣೆ (Maandi Karmic Shadow & Gokarna Parihara)",
    en: "Maandi (Gulika) Hidden Karmic Shadow & Ancestral Parihara",
    hi: "मांदि (गुलिक) का गूढ़ कर्म प्रभाव एवं पितृ दोष शांति परिहार",
    te: "మాంది (గుళిక) కర్మ ప్రభావం & గోకర్ణ క్షేత్ర పరిహారం",
    ta: "மாந்தி (குளிகன்) மறைமுக கர்ம தாக்கம் & கோகர்ண பரிகாரம்"
  },
  astrologerDirectNarration: {
    kn: "ಜ್ಯೋತಿಷಿಗಳ ಮುಖತಃ ಕಥನ (Chief Astrologer Direct Spoken Narration)",
    en: "Chief Astrologer Direct Spoken Narration (Face-to-Face Consultation)",
    hi: "प्रधान ज्योतिषी का प्रत्यक्ष मुखातिब कथन",
    te: "ప్రధాన జ్యోతిష్యుల ప్రత్యక్ష సంభాషణ వివరణ",
    ta: "தலைமை ஜோதிடரின் நேரடி வாய்மொழி விளக்கம்"
  },
  narrationPlayBtn: {
    kn: "ಧ್ವನಿ ಕಥನ ಕೇಳಿ (Play Audio Narration)",
    en: "Listen to Voice Narration (Play)",
    hi: "ध्वनि व्याख्या सुनें (Play)",
    te: "వాయిస్ వివరణ వినండి (Play)",
    ta: "குரல் விளக்கத்தைக் கேளுங்கள் (Play)"
  },
  narrationPauseBtn: {
    kn: "ವಿರಾಮ (Pause)",
    en: "Pause Audio",
    hi: "विराम (Pause)",
    te: "పాజ్ (Pause)",
    ta: "நிறுத்து (Pause)"
  },
  narrationStopBtn: {
    kn: "ನಿಲ್ಲಿಸಿ (Stop)",
    en: "Stop Audio",
    hi: "रोकें (Stop)",
    te: "ఆపు (Stop)",
    ta: "நிறுத்து (Stop)"
  },
  narrationPlayingBadge: {
    kn: "ಜ್ಯೋತಿಷಿ ಕಥನ ಪ್ರಸಾರವಾಗುತ್ತಿದೆ...",
    en: "Astrologer Voice Narration is Playing...",
    hi: "ज्योतिषी कथन प्रसारित हो रहा है...",
    te: "జ్యోతిష్యుల వివరణ వినిపిస్తోంది...",
    ta: "ஜோதிடர் குரல் விளக்கம் ஒலிக்கிறது..."
},
  patrikatitle: {
    kn: "ಸಾಂಪ್ರದಾಯಿಕ ದಕ್ಷಿಣ ಭಾರತೀಯ ಜಾತಕ ಪತ್ರಿಕೆ",
    en: "Traditional South Indian Janma Patrika",
    hi: "पारंपरिक दक्षिण भारतीय जन्म पत्रिका",
    te: "సాంప్రదాయ దక్షిణ భారత జాతక పత్రిక",
    ta: "பாரம்பரிய தென்னிந்திய ஜாதக பத்திரிகை"
  },
  // Download / Premium ₹350 Consultation & Direct Call to Astrologer
  premiumConsultationCardTitle: {
    kn: "🏛️ ಸಂಪೂರ್ಣ ರಾಜವೈಭವ ಜಾತಕ & ನೇರ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ (₹೩೫೦ ಮಾತ್ರ)",
    en: "🏛️ Complete Royal Horoscope & Direct Astrologer Consultation (Only ₹350)",
    hi: "🏛️ संपूर्ण राजवैभव जन्म कुंडली एवं प्रत्यक्ष ज्योतिषी परामर्श (मात्र ₹३५०)",
    te: "🏛️ సంపూర్ణ రాజవైభవ జాతకం & ప్రత్యక్ష జ్యోతిష్య సంప్రదింపులు (కేవలం ₹350)",
    ta: "🏛️ முழுமையான ராஜவைபவ ஜாதகம் & நேரடி ஜோதிட ஆலோசனை (ரூ.350 மட்டும்)"
  },
  premiumConsultationSubtitle: {
    kn: "ನಿಮ್ಮ ಜೀವನದ ಸಕಲ ಗ್ರಹ ಯೋಗಗಳು, ದೋಷಗಳು, ೧೨೦ ವರ್ಷಗಳ ದಶಾ ಭವಿಷ್ಯ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪ್ರಧಾನ ಅರ್ಚಕರೊಂದಿಗೆ ನೇರ ದೂರವಾಣಿ ಸಮಾಲೋಚನೆ ಪಡೆಯಿರಿ.",
    en: "Get your complete planetary yogas, doshas, 120-year dasha predictions, full printable PDF booklet, and direct phone consultation with the Chief Priest of Sri Kshetra Gokarna.",
    hi: "अपने जीवन के सभी ग्रह योग, दोष, 120 वर्षीय दशा भविष्य, संपूर्ण मुद्रण योग्य PDF पुस्तिका एवं श्री क्षेत्र गोकर्ण के प्रधान ज्योतिषी से सीधा फोन परामर्श प्राप्त करें।",
    te: "మీ జీవితంలోని సమస్త గ్రహ యోగాలు, దోషాలు, 120 సంవత్సరాల దశా భవిష్యత్తు, పూర్తి ముద్రణార్హ PDF మరియు శ్రీ క్షేత్ర గోకర్ణ ప్రధాన అర్చకులతో ప్రత్యక్ష ఫోన్ సంప్రదింపులు పొందండి.",
    ta: "உங்கள் வாழ்க்கையின் அனைத்து கிரக யோகங்கள், தோஷங்கள், 120 வருட திசா பலன்கள், முழு அச்சிடக்கூடிய PDF மற்றும் ஸ்ரீ க்ஷேத்ர கோகர்ண தலைமை அர்ச்சகருடன் நேரடி தொலைபேசி ஆலோசனையைப் பெறுங்கள்."
  },
  premiumFeature1: {
    kn: "📑 ಸಂಪೂರ್ಣ ೮-೧೦ ಪುಟಗಳ ಮುದ್ರಣೀಯ ರಾಜವೈಭವ ಜಾತಕ PDF ಪುಸ್ತಕ",
    en: "📑 Complete 8-10 Page Luxury Gold Printable Horoscope PDF Booklet",
    hi: "📑 संपूर्ण 8-10 पृष्ठों की मुद्रण योग्य राजवैभव स्वर्ण कुंडली PDF पुस्तिका",
    te: "📑 సంపూర్ణ 8-10 పేజీల ముద్రణార్హ రాజవైభవ గోల్డ్ జాతక PDF పుస్తకం",
    ta: "📑 முழுமையான 8-10 பக்க அச்சிடக்கூடிய ராஜவைபவ தங்க ஜாதக PDF புத்தகம்"
  },
  premiumFeature2: {
    kn: "🪐 ಸಕಲ ಗ್ರಹ ಯೋಗಗಳು & ದೋಷಗಳ ಆಳವಾದ ವಿಶ್ಲೇಷಣೆ (ಕಾಳಸರ್ಪ, ಮಾಂಗಲ್ಯ, ರಾಜಯೋಗ)",
    en: "🪐 In-Depth Auspicious Yogas & Doshas Analysis (Kala Sarpa, Manglik, Raj Yogas)",
    hi: "🪐 समस्त शुभ योग एवं दोषों का गहन विश्लेषण (कालसर्प, मांगलिक, राजयोग)",
    te: "🪐 సమస్త శుభ యోగాలు & దోషాల సమగ్ర విశ్లేషణ (కాలసర్ప, మాంగళ్య, రాజయోగాలు)",
    ta: "🪐 அனைத்து சுப யோகங்கள் & தோஷங்களின் ஆழமான பகுப்பாய்வு (காலசர்ப்பம், மாங்கல்யம், ராஜயோகம்)"
  },
  premiumFeature3: {
    kn: "⏳ ೧೨೦ ವರ್ಷಗಳ ಸೂಕ್ಷ್ಮ ದಶಾ-ಭುಕ್ತಿ-ಅಂತರ ಕಾಲಚಕ್ರ & ಮಹತ್ವದ ತಿರುವುಗಳು",
    en: "⏳ 120-Year Micro Dasha-Bhukti-Antardasha Timeline & Life Turning Points",
    hi: "⏳ 120 वर्षीय सूक्ष्म दशा-भुक्ति-अंतर कालचक्र एवं जीवन के महत्वपूर्ण मोड़",
    te: "⏳ 120 సంవత్సరాల సూక్ష్మ దశా-భక్తి-అంతర్ కాలచక్రం & కీలక మలుపులు",
    ta: "⏳ 120 வருட நுணுக்கமான திசா-புக்தி-அந்தர காலச்சக்கரம் & முக்கிய திருப்புமுனைகள்"
  },
  premiumFeature4: {
    kn: "🔮 ಪ್ರಸ್ತುತ ಜೀವನದ ಸಮಗ್ರ ಮುನ್ನೋಟ, ಅಂತರಂಗ ದರ್ಶನ & ಮಾಂದಿ ರಹಸ್ಯ",
    en: "🔮 Real-Time Current Life Inquest, Deep Psychological Psyche & Maandi Secret",
    hi: "🔮 वर्तमान जीवन का समग्र पूर्वावलोकन, अंतर्मन दर्शन एवं मांदि रहस्य",
    te: "🔮 ప్రస్తుత జీవిత సమగ్ర విశ్లేషణ, అంతరంగ దర్శనం & మాంది రహస్యం",
    ta: "🔮 தற்போதைய வாழ்க்கையின் விரிவான கண்ணோட்டம், ஆழ்மன தரிசனம் & மாந்தி ரகசியம்"
  },
  premiumFeature5: {
    kn: "🪔 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ವಿಶೇಷ ಸಂಕಲ್ಪ ಸೇವಾ ಆಶೀರ್ವಾದ",
    en: "🪔 Special Sankalpa & Temple Seva Blessings at Sri Kshetra Gokarna Mahabaleshwara",
    hi: "🪔 श्री क्षेत्र गोकर्ण महाबलेश्वर सानिध्य में विशेष संकल्प सेवा आशीर्वाद",
    te: "🪔 శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర సన్నిధిలో ప్రత్యేక సంకల్ప సేవా ఆశీస్సులు",
    ta: "🪔 ஸ்ரீ க்ஷேத்ர கோகர்ண மகாபலேஸ்வரர் சன்னதியில் சிறப்பு சங்கல்ப சேவை ஆசிகள்"
  },
  callAstrologerBtn: {
    kn: "📞 ಪ್ರಧಾನ ಜ್ಯೋತಿಷಿಗಳಿಗೆ ನೇರ ಕರೆ ಮಾಡಿ (Call: +91 99723 39362)",
    en: "📞 Call Chief Astrologer Directly (+91 99723 39362)",
    hi: "📞 प्रधान ज्योतिषी को सीधा कॉल करें (+91 99723 39362)",
    te: "📞 ప్రధాన జ్యోతిష్యునికి నేరుగా కాల్ చేయండి (+91 99723 39362)",
    ta: "📞 தலைமை ஜோதிடரை நேரடியாக அழைக்கவும் (+91 99723 39362)"
  },
  whatsappShareDetailsBtn: {
    kn: "📲 WhatsApp ಮೂಲಕ ಜಾತಕ ವಿವರ ಕಳುಹಿಸಿ (Chat on WhatsApp)",
    en: "📲 Share Kundali Details & Chat on WhatsApp",
    hi: "📲 WhatsApp पर कुंडली विवरण भेजें एवं चैट करें",
    te: "📲 WhatsApp ద్వారా జాతక వివరాలు పంపండి",
    ta: "📲 WhatsApp வழியாக ஜாதக விவரங்களை அனுப்பவும்"
  },
  sendEmailToAstrologerBtn: {
    kn: "📧 ಇಮೇಲ್ ಮೂಲಕ ವಿವರ ಕಳುಹಿಸಿ (spshripandit@gmail.com)",
    en: "📧 Send Details via Email (spshripandit@gmail.com)",
    hi: "📧 ईमेल द्वारा विवरण भेजें (spshripandit@gmail.com)",
    te: "📧 ఈమెయిల్ ద్వారా వివరాలు పంపండి (spshripandit@gmail.com)",
    ta: "📧 மின்னஞ்சல் வழியாக விவரங்களை அனுப்பவும் (spshripandit@gmail.com)"
  },
  emailSendingStatus: {
    kn: "ಇಮೇಲ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    en: "Sending email request to priest...",
    hi: "ईमेल भेजा जा रहा है...",
    te: "ఈమెయిల్ పంపబడుతోంది...",
    ta: "மின்னஞ்சல் அனுப்பப்படுகிறது..."
  },
  emailSentSuccess: {
    kn: "✅ ಇಮೇಲ್ ಯಶಸ್ವಿಯಾಗಿ ತಲುಪಿದೆ! ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರು ಶೀಘ್ರದಲ್ಲೇ ಸಂಪರ್ಕಿಸುವರು.",
    en: "✅ Email request sent successfully! Sri Shreeram Pandit will contact you shortly.",
    hi: "✅ ईमेल सफलतापूर्वक भेजा गया! श्री राम पंडित शीघ्र ही आपसे संपर्क करेंगे।",
    te: "✅ ఈమెయిల్ విజయవంతంగా పంపబడింది! శ్రీరామ్ పండిట్ త్వరలో సంప్రదిస్తారు.",
    ta: "✅ மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது! ஸ்ரீராம் பண்டிட் விரைவில் தொடர்புகொள்வார்."
  },
  priceTagOnly350: {
    kn: "₹೩೫೦ ಮಾತ್ರ (Only ₹350)",
    en: "Only ₹350 (3,500 Coins)",
    hi: "मात्र ₹३५०",
    te: "కేవలం ₹350",
    ta: "ரூ.350 மட்டும்"
  },
  panchangaDetailsTitle: {
    kn: "ಜನನ ಕಾಲದ ಪಂಚಾಂಗ ಅಂಗ ವಿವರಗಳು",
    en: "Birth Time Panchanga Anga Attributes",
    hi: "जन्म कालीन पंचांग विवरण",
    te: "జన్మ కాల పంచాంగ అంగ వివరాలు",
    ta: "பிறந்த நேர பஞ்சாங்க அங்க விவரங்கள்"
  },
  planetaryTableHeading: {
    kn: "ಗ್ರಹ ಸ್ಥಿತಿ & ಅಂಶ ಕೋಷ್ಟಕ (Planetary Placements)",
    en: "Planetary Positions & Astronomical Amshas",
    hi: "ग्रह स्थिति एवं अंश तालिका",
    te: "గ్రహ స్థితి మరియు అంశ పట్టిక",
    ta: "கிரக நிலை மற்றும் அம்ச அட்டவணை"
  },
  dashaTimelineHeading: {
    kn: "೧೨೦ ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ ಕಾಲಚಕ್ರ",
    en: "120-Year Vimshottari Dasha Timeline",
    hi: "120 वर्षीय विंशोत्तरी दशा कालचक्र",
    te: "120 సంవత్సరాల వింశోత్తరి దశా కాలచక్రం",
    ta: "120 வருட விம்சோத்தரி திசா காலச்சக்கரம்"
  },
  pariharaHeading: {
    kn: "ದೈವಿಕ ಪರಿಹಾರಗಳು & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸೇವೆಗಳು",
    en: "Divine Remedies & Gokarna Kshetra Sevas",
    hi: "दिव्य परिहार एवं गोकर्ण क्षेत्र सेवा",
    te: "దైవిక పరిహారాలు & గోకర్ణ క్షేత్ర సేవలు",
    ta: "தெய்வீக பரிகாரங்கள் & கோகர்ண க்ஷேத்ர சேவைகள்"
  },
  liveAnalysisHeading: {
    kn: "ಪ್ರಸ್ತುತ ಗ್ರಹ ಸ್ಥಿತಿ & ನೇರ ಜೀವನ ವಿಶ್ಲೇಷಣೆ",
    en: "Current Planetary Climate & Live Life Analysis",
    hi: "वर्तमान ग्रह स्थिति एवं प्रत्यक्ष जीवन विश्लेषण",
    te: "ప్రస్తుత గ్రహ స్థితి మరియు ప్రత్యక్ష జీవిత విశ్లేషణ",
    ta: "தற்போதைய கிரக நிலை மற்றும் நேரடி வாழ்க்கை பகுப்பாய்வு"
  },

  // Panchanga Labels
  samvatsaraLabel: {
    kn: "ಸಂವತ್ಸರ (Samvatsara)",
    en: "Samvatsara (Year)",
    hi: "संवत्सर",
    te: "సంవత్సరం",
    ta: "சம்வத்சரம்"
  },
  ayanaLabel: {
    kn: "ಅಯನ (Ayana)",
    en: "Ayana (Solstice)",
    hi: "अयन",
    te: "అయనం",
    ta: "அயனம்"
  },
  rituLabel: {
    kn: "ಋತು (Ritu)",
    en: "Ritu (Season)",
    hi: "ऋतु",
    te: "ఋతువు",
    ta: "ருது"
  },
  masaLabel: {
    kn: "ಮಾಸ (Masa)",
    en: "Masa (Month)",
    hi: "मास",
    te: "మాసం",
    ta: "மாதம்"
  },
  pakshaLabel: {
    kn: "ಪಕ್ಷ (Paksha)",
    en: "Paksha (Fortnight)",
    hi: "पक्ष",
    te: "పక్షం",
    ta: "பக்ஷம்"
  },
  tithiLabel: {
    kn: "ತಿಥಿ (Tithi)",
    en: "Tithi (Lunar Day)",
    hi: "तिथि",
    te: "తిథి",
    ta: "திதி"
  },
  varaLabel: {
    kn: "ವಾರ (Vara / Day)",
    en: "Vara (Weekday)",
    hi: "वार",
    te: "వారం",
    ta: "வாரம்"
  },
  nakshatraLabel: {
    kn: "ನಕ್ಷತ್ರ (Nakshatra)",
    en: "Nakshatra (Asterism)",
    hi: "नक्षत्र",
    te: "నక్షత్రం",
    ta: "நட்சத்திரம்"
  },
  yogaLabel: {
    kn: "ಯೋಗ (Yoga)",
    en: "Yoga",
    hi: "योग",
    te: "యోగం",
    ta: "யோகம்"
  },
  karanaLabel: {
    kn: "ಕರಣ (Karana)",
    en: "Karana",
    hi: "करण",
    te: "కరణం",
    ta: "கரணம்"
  },
  yoniLabel: {
    kn: "ಯೋನಿ (Yoni)",
    en: "Yoni",
    hi: "योनि",
    te: "యోని",
    ta: "யோனி"
  },
  ganaLabel: {
    kn: "ಗಣ (Gana)",
    en: "Gana",
    hi: "गण",
    te: "గణం",
    ta: "கணம்"
  },
  nadiLabel: {
    kn: "ನಾಡಿ (Nadi)",
    en: "Nadi",
    hi: "नाड़ी",
    te: "నాడి",
    ta: "நாடி"
  },
  sunriseLabel: {
    kn: "ಸೂರ್ಯೋದಯ (Sunrise)",
    en: "Sunrise",
    hi: "सूर्योदय",
    te: "సూర్యోదయం",
    ta: "சூரியோதயம்"
  },
  sunsetLabel: {
    kn: "ಸೂರ್ಯಾಸ್ತ (Sunset)",
    en: "Sunset",
    hi: "सूर्यास्त",
    te: "సూర్యాస్తమయం",
    ta: "சூரிய அஸ்தமனம்"
  },

  // Planetary Table Column Headers
  planetCol: {
    kn: "ಗ್ರಹ (Graha)",
    en: "Planet (Graha)",
    hi: "ग्रह",
    te: "గ్రహం",
    ta: "கிரகம்"
  },
  degreeCol: {
    kn: "ಅಂಶ (Degree)",
    en: "Degree (° ' \")",
    hi: "अंश",
    te: "డిగ్రీ",
    ta: "பாகை"
  },
  rashiCol: {
    kn: "ರಾಶಿ (Sign)",
    en: "Rashi (Sign)",
    hi: "राशि",
    te: "రాశి",
    ta: "ராசி"
  },
  houseCol: {
    kn: "ಭಾವ (House)",
    en: "Bhava (House)",
    hi: "भाव",
    te: "భావం",
    ta: "பாவம்"
  },
  nakshatraCol: {
    kn: "ನಕ್ಷತ್ರ (Nakshatra)",
    en: "Nakshatra",
    hi: "नक्षत्र",
    te: "నక్షత్రం",
    ta: "நட்சத்திரம்"
  },
  padaCol: {
    kn: "ಪಾದ (Pada)",
    en: "Pada",
    hi: "चरण",
    te: "పాదం",
    ta: "பாதம்"
  },
  lordCol: {
    kn: "ಅಧಿಪತಿ (Lord)",
    en: "Sign Lord",
    hi: "राशि स्वामी",
    te: "రాశ్యాధిపతి",
    ta: "ராசி அதிபதி"
  },
  dignityCol: {
    kn: "ಗ್ರಹ ಸ್ಥಿತಿ (Dignity)",
    en: "Dignity / Avastha",
    hi: "ग्रह स्थिति (अवस्था)",
    te: "గ్రహ స్థితి (అవస్థ)",
    ta: "கிரக நிலை (அவஸ்தை)"
  },
  statusCol: {
    kn: "ಚಲನೆ (Motion)",
    en: "Motion Status",
    hi: "गति स्थिति",
    te: "గతి స్థితి",
    ta: "இயக்க நிலை"
  },
  retrogradeLabel: {
    kn: "ವಕ್ರ (Retrograde)",
    en: "Retrograde (Vakra)",
    hi: "वक्री",
    te: "వక్రీ",
    ta: "வக்ரம்"
  },
  directLabel: {
    kn: "ಮಾರ್ಗಿ (Direct)",
    en: "Direct (Margi)",
    hi: "मार्गी",
    te: "మార్గి",
    ta: "மார்க்கி"
  },

  // Planetary Dignity Value Labels
  dignityExalted: {
    kn: "ಉಚ್ಚ (Exalted)",
    en: "Exalted",
    hi: "उच्च",
    te: "ఉచ్ఛ",
    ta: "உச்சம்"
  },
  dignityMoolatrikona: {
    kn: "ಮೂಲತ್ರಿಕೋಣ (Moolatrikona)",
    en: "Moolatrikona",
    hi: "मूलत्रिकोण",
    te: "మూలత్రికోణం",
    ta: "மூலத்திரிகோணம்"
  },
  dignityOwnSign: {
    kn: "ಸ್ವಕ್ಷೇತ್ರ (Own Sign)",
    en: "Own Sign",
    hi: "स्वक्षेत्र",
    te: "స్వక్షేత్రం",
    ta: "ஆட்சி"
  },
  dignityFriendly: {
    kn: "ಮಿತ್ರ (Friendly)",
    en: "Friendly",
    hi: "मित्र",
    te: "మిత్ర",
    ta: "நட்பு"
  },
  dignityNeutral: {
    kn: "ಸಮ (Neutral)",
    en: "Neutral",
    hi: "सम",
    te: "సమ",
    ta: "சமம்"
  },
  dignityEnemy: {
    kn: "ಶತ್ರು (Enemy)",
    en: "Enemy",
    hi: "शत्रु",
    te: "శత్రు",
    ta: "பகை"
  },
  dignityDebilitated: {
    kn: "ನೀಚ (Debilitated)",
    en: "Debilitated",
    hi: "नीच",
    te: "నీచ",
    ta: "நீசம்"
  },
  dignityAscendant: {
    kn: "ಲಗ್ನ (Ascendant)",
    en: "Ascendant",
    hi: "लग्न",
    te: "లగ్నం",
    ta: "லக்னம்"
  },
  dignityUpagraha: {
    kn: "ಉಪಗ್ರಹ (Upagraha)",
    en: "Upagraha",
    hi: "उपग्रह",
    te: "ఉపగ్రహం",
    ta: "உபகிரகம்"
  },

  // House Lords Summary
  houseLordsSummaryTitle: {
    kn: "ಭಾವಾಧಿಪತಿಗಳ ಸಂಕ್ಷಿಪ್ತ ವಿವರ (House Lords Summary)",
    en: "Key House Lords Summary",
    hi: "प्रमुख भावेशों का विवरण",
    te: "కీలక భావాధిపతుల వివరాలు",
    ta: "முக்கிய பாவ அதிபதிகள் விவரம்"
  },
  lord10Title: {
    kn: "೧೦ನೇ ಭಾವ (ವೃತ್ತಿ & ಉದ್ಯೋಗ)",
    en: "10th House (Career & Profession)",
    hi: "दशम भाव (आजीविका एवं कर्म)",
    te: "10వ భావం (వృత్తి & ఉద్యోగం)",
    ta: "10ஆம் பாவம் (தொழில் & ஜீவனம்)"
  },
  lord7Title: {
    kn: "೭ನೇ ಭಾವ (ವಿವಾಹ & ಕಳತ್ರ)",
    en: "7th House (Marriage & Partnership)",
    hi: "सप्तम भाव (विवाह एवं सहभागिता)",
    te: "7వ భావం (వివాహం & దాంపత్యం)",
    ta: "7ஆம் பாவம் (திருமணம் & கூட்டு)"
  },
  lord6Title: {
    kn: "೬ನೇ ಭಾವ (ಆರೋಗ್ಯ & ಶತ್ರು ನಿವಾರಣೆ)",
    en: "6th House (Health & Obstacles)",
    hi: "षष्ठ भाव (स्वास्थ्य एवं शत्रु शमन)",
    te: "6వ భావం (ఆరోగ్యం & శత్రు నివారణ)",
    ta: "6ஆம் பாவம் (ஆரோக்கியம் & தடைகள்)"
  },
  lord5Title: {
    kn: "೫ನೇ ಭಾವ (ಬುದ್ಧಿ & ಪೂರ್ವಪುಣ್ಯ)",
    en: "5th House (Intellect & Poorva Punya)",
    hi: "पंचम भाव (बुद्धि एवं पूर्वपुण्य)",
    te: "5వ భావం (బుద్ధి & పూర్వపుణ్యం)",
    ta: "5ஆம் பாவம் (புத்தி & பூர்வபுண்ணியம்)"
  },
  lagnaLordTitle: {
    kn: "ಲಗ್ನಾಧಿಪತಿ (ದೇಹ & ಆತ್ಮಬಲ)",
    en: "Lagna Lord (Vitality & Soul Power)",
    hi: "लग्नेश (शरीर एवं आत्मबल)",
    te: "లగ్నాధిపతి (శరీర & ఆత్మబలం)",
    ta: "லக்னாதிபதி (ஆரோக்கியம் & ஆத்மபலம்)"
  },

  // 120-Year Dasha Timeline Headers
  thDashaLord: {
    kn: "ಮಹಾದಶಾ ನಾಥ",
    en: "Mahadasha Lord",
    hi: "महादशा नाथ",
    te: "మహాదశా నాథుడు",
    ta: "மகாதிசா நாதர்"
  },
  thStartAge: {
    kn: "ಪ್ರಾರಂಭ ವಯಸ್ಸು",
    en: "Start Age",
    hi: "प्रारंभिक आयु",
    te: "ప్రారంభ వయస్సు",
    ta: "தொடக்க வயது"
  },
  thEndAge: {
    kn: "ಮುಕ್ತಾಯ ವಯಸ್ಸು",
    en: "End Age",
    hi: "समाप्ति आयु",
    te: "ముగింపు వయస్సు",
    ta: "முடிவு வயது"
  },
  thAgeRange: {
    kn: "ವಯಸ್ಸು (Age Range)",
    en: "Age Range",
    hi: "आयु सीमा",
    te: "వయస్సు పరిధి",
    ta: "வயது வரம்பு"
  },
  thDates: {
    kn: "ದಿನಾಂಕ ಕಾಲಾವಧಿ",
    en: "Calendar Dates",
    hi: "दिनांक अवधि",
    te: "తేదీల కాలం",
    ta: "தேதி கால அளவு"
  },
  thDuration: {
    kn: "ಅವಧಿ (ವರ್ಷಗಳು)",
    en: "Duration (Years)",
    hi: "अवधि (वर्ष)",
    te: "వ్యవధి (సంవత్సరాలు)",
    ta: "கால அளவு (ஆண்டுகள்)"
  },
  thActiveStatus: {
    kn: "ಸ್ಥಿತಿ",
    en: "Status",
    hi: "स्थिति",
    te: "స్థితి",
    ta: "நிலை"
  },
  activeDashaBadge: {
    kn: "ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ (Running Now)",
    en: "Currently Running",
    hi: "वर्तमान में सक्रिय",
    te: "ప్రస్తుతం నడుస్తోంది",
    ta: "தற்போது நடக்கிறது"
  },
  completedDashaBadge: {
    kn: "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)",
    en: "Completed",
    hi: "पूर्ण",
    te: "పూర్తయింది",
    ta: "முடிவடைந்தது"
  },
  upcomingDashaBadge: {
    kn: "ಮುಂಬರುವ ದಶಾ (Upcoming)",
    en: "Upcoming",
    hi: "आगामी",
    te: "రాబోయేది",
    ta: "வரவிருக்கும்"
  },

  // THE SINGLE ACTION BUTTON REQUIRED BY USER:
  singleActionBtnText: {
    kn: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಏನು ನಡೆಯುತ್ತಿದೆ? ನೇರ ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪ್ರಶ್ನೋತ್ತರ",
    en: "What is happening in your life right now? Live Astrology Analysis & Q&A",
    hi: "वर्तमान में आपके जीवन में क्या चल रहा है? प्रत्यक्ष ज्योतिष विश्लेषण एवं प्रश्नोत्तरी",
    te: "ప్రస్తుతం మీ జీవితంలో ఏమి జరుగుతోంది? ప్రత్యక్ష జ్యోతిష్య విశ్లేషణ మరియు ప్రశ్నోత్తరాలు",
    ta: "தற்போது உங்கள் வாழ்க்கையில் என்ன நடக்கிறது? நேரடி ஜோதிட பகுப்பாய்வு மற்றும் கேள்வி-பதில்"
  },

  // Download PDF
  downloadSectionTitle: {
    kn: "ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್ (Download Printable PDF)",
    en: "Download Janma Kundali Printable PDF",
    hi: "जन्म कुंडली PDF डाउनलोड करें",
    te: "జనన కుಂಡలి PDF డౌన్‌లోడ్ చేసుకోండి",
    ta: "ஜாதக PDF பதிவிறக்கம்"
  },
  selectPdfLang: {
    kn: "PDF ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    en: "Select PDF Language",
    hi: "PDF भाषा चुनें",
    te: "PDF భాషను ఎంచుకోండి",
    ta: "PDF மொழியைத் தேர்ந்தெடுக்கவும்"
  },
  downloadPdfBtn: {
    kn: "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನನ ಕುಂಡಲಿ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    en: "Download Baggona Janma Kundali PDF",
    hi: "बग्गोण जन्म कुंडली PDF डाउनलोड करें",
    te: "బగ్గోణ జనన కుండలి PDF డౌన్‌లోడ్ చేయండి",
    ta: "பக்கோண பிறப்பு ஜாதக PDF பதிவிறக்கு"
  },
  downloadingPdf: {
    kn: "PDF ತಯಾರಾಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",
    en: "Generating luxury printable PDF, please wait...",
    hi: "PDF तैयार हो रहा है, कृपया प्रतीक्षा करें...",
    te: "PDF రూపొందించబడుతోంది, దయచేసి వేచి ఉండండి...",
    ta: "PDF தயாராகிறது, தயவுசெய்து காத்திருக்கவும்..."
  },
  resetFormBtn: {
    kn: "ಬೇರೆ ಕುಂಡಲಿ ಪರಿಶೀಲಿಸಿ (New Kundali)",
    en: "Calculate Another Kundali",
    hi: "अन्य कुंडली गणना करें",
    te: "మరొక కుండలిని లెక్కించండి",
    ta: "மற்றொரு ஜாதகத்தை கணக்கிடுங்கள்"
  },

  // Step 3: Live Analysis & Q&A Drawer
  currentPhaseTitle: {
    kn: "ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ & ಗ್ರಹ ಪ್ರಭಾವ",
    en: "Current Life Phase & Planetary Impact",
    hi: "वर्तमान जीवन चरण और ग्रह प्रभाव",
    te: "ప్రస్తుత జీవిత దశ మరియు గ్రహ ప్రభావం",
    ta: "தற்போதைய வாழ்க்கை நிலை மற்றும் கிரக தாக்கம்"
  },
  subconsciousMindTitle: {
    kn: "ಮನಸ್ಸಿನ ಚಿಂತೆ & ಆಂತರಿಕ ಯೋಚನೆಗಳು",
    en: "Subconscious Concerns & Mind Vibrations",
    hi: "मन की चिंता एवं आंतरिक विचार",
    te: "మనస్సులోని ఆందోళన & అంతర్గత ఆలోచనలు",
    ta: "மன கவலை மற்றும் உள் எண்ணங்கள்"
  },
  careerFinanceTitle: {
    kn: "ಉದ್ಯೋಗ, ಧನಪ್ರಾಪ್ತಿ & ಕಾರ್ಯಸಾಧನೆ",
    en: "Career, Wealth & Key Milestones",
    hi: "आजीविका, धन लाभ एवं कार्य सिद्धि",
    te: "ఉద్యోగం, ధన లాభం & కార్య సిద్ధి",
    ta: "தொழில், தன லாபம் மற்றும் காரிய வெற்றி"
  },
  relationshipsHealthTitle: {
    kn: "ಕುಟುಂಬ, ಆರೋಗ್ಯ & ಸಂಬಂಧಗಳು",
    en: "Family, Health & Relationships",
    hi: "परिवार, स्वास्थ्य एवं संबंध",
    te: "కుటుంబం, ఆరోగ్యం & సంబంధాలు",
    ta: "குடும்பம், ஆரோக்கியம் மற்றும் உறவுகள்"
  },
  gokarnaRemedyTitle: {
    kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ದೈವಿಕ ಪರಿಹಾರ & ಸೇವೆ",
    en: "Gokarna Kshetra Divine Remedies & Seva",
    hi: "गोकर्ण क्षेत्र दिव्य परिहार एवं सेवा",
    te: "గోకర్ణ క్షేత్ర దైవిక పరిహారాలు & సేవ",
    ta: "கோகர்ண க்ஷேத்ர தெய்வீக பரிகாரம் & சேவை"
  },

  // Live Q&A Section
  askQuestionHeader: {
    kn: "ಜ್ಯೋತಿಷಿಗಳಿಗೆ ನೇರ ಪ್ರಶ್ನೆ ಕೇಳಿ (Ask Live Astrological Question)",
    en: "Ask Live Astrology Question to Baggona Engine",
    hi: "ज्योतिषी से प्रत्यक्ष प्रश्न पूछें",
    te: "జ్యోతిష్యులను ప్రత్యక్ష ప్రశ్న అడగండి",
    ta: "ஜோதிடரிடம் நேரடி கேள்வி கேட்கவும்"
  },
  questionPlaceholder: {
    kn: "ಉದಾ: ನನಗೆ ಈ ವರ್ಷ ಹೊಸ ಉದ್ಯೋಗ ಸಿಗುವುದೇ? ಮದುವೆ ಯೋಗ ಯಾವಾಗ? (ಧ್ವನಿ ಮೂಲಕವೂ ಕೇಳಬಹುದು)",
    en: "e.g. Will I get a job change this year? When is marriage indicated? (You can use voice mic)",
    hi: "उदा: क्या इस वर्ष नौकरी में बदलाव होगा? विवाह कब संभव है? (माइक से बोलें)",
    te: "ఉదా: ఈ సంవత్సరం నాకు ఉద్యోగం లభిస్తుందా? వివాహం ఎప్పుడు? (మైక్ ద్వారా మాట్లాడవచ్చు)",
    ta: "எ.கா: இந்த ஆண்டு புதிய வேலை கிடைக்குமா? திருமணம் எப்போது? (மைக் மூலம் பேசலாம்)"
  },
  askBtn: {
    kn: "ಪ್ರಶ್ನೋತ್ತರ ವಿಶ್ಲೇಷಿಸಿ (Get Astrological Answer)",
    en: "Get Divine Astrological Answer",
    hi: "ज्योतिष उत्तर प्राप्त करें",
    te: "జ్యోతిష్య సమాధానం పొందండి",
    ta: "ஜோதிட பதில் பெறவும்"
  },
  answeringLoader: {
    kn: "ನಿಮ್ಮ ಕುಂಡಲಿ ಲಗ್ನ, ದಶಾ ಮತ್ತು ಗೋಚಾರ ಗ್ರಹಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    en: "Analyzing your natal Lagna, Dasha lords, and Gochara transits...",
    hi: "आपकी कुंडली के लग्न, दशा और गोचर ग्रहों का विश्लेषण हो रहा है...",
    te: "మీ కుండలి లగ్నం, దశ మరియు గోచార గ్రహాలు విశ్లేషింపబడుతున్నాయి...",
    ta: "உங்கள் ஜாதக லக்னம், திசை மற்றும் கோச்சார கிரகங்கள் பகுப்பாய்வு செய்யப்படுகின்றன..."
  },
  voiceListening: {
    kn: "🎙️ ಆಲಿಸಲಾಗುತ್ತಿದೆ... ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ...",
    en: "🎙️ Listening... Please speak your question clearly...",
    hi: "🎙️ सुन रहे हैं... कृपया अपना प्रश्न स्पष्ट बोलें...",
    te: "🎙️ వింటున్నాము... దయచేసి మీ ప్రశ్నను స్పష్టంగా మాట్లాడండి...",
    ta: "🎙️ கேட்கிறது... உங்கள் கேள்வியை தெளிவாக பேசுங்கள்..."
  },
  sampleQuestionsLabel: {
    kn: "ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು (Quick Sample Questions):",
    en: "Quick Sample Questions:",
    hi: "सामान्य प्रश्न:",
    te: "సాధారణ ప్రశ్నలు:",
    ta: "பொதுவான கேள்விகள்:"
  },
  sampleQ1: {
    kn: "ನನ್ನ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಮುಂದಿನ ೧ ವರ್ಷದಲ್ಲಿ ಬಡ್ತಿ ಅಥವಾ ಬದಲಾವಣೆ ಸಾಧ್ಯವೇ?",
    en: "Is there a promotion or career advancement indicated in the next 1 year?",
    hi: "क्या अगले 1 वर्ष में पदोन्नति या करियर में उन्नति का योग है?",
    te: "రాబోయే 1 సంవత్సరంలో ఉద్యోగంలో పదోన్నతి లేదా మార్పు ఉంటుందా?",
    ta: "அடுத்த 1 வருடத்தில் வேலை மாற்றம் அல்லது பதவி உயர்வு ஏற்படுமா?"
  },
  sampleQ2: {
    kn: "ನನ್ನ ವಿವಾಹ ಮತ್ತು ಕೌಟುಂಬಿಕ ಜೀವನದ ಗ್ರಹ ಸ್ಥಿತಿ ಹೇಗಿದೆ?",
    en: "How are the planetary transits affecting my marriage and relationship harmony?",
    hi: "मेरे विवाह और पारिवारिक जीवन पर ग्रहों का क्या प्रभाव है?",
    te: "నా వివాహం మరియు కుటుంబ జీవితంపై గ్రహాల ప్రభావం ఎలా ఉంది?",
    ta: "எனது திருமணம் மற்றும் குடும்ப வாழ்க்கையில் கிரகங்களின் நிலை என்ன?"
  },
  sampleQ3: {
    kn: "ಆರ್ಥಿಕ ಅಭಿವೃದ್ಧಿಗೆ ಮತ್ತು ಋಣ ವಿಮೋಚನೆಗೆ ಸೂಕ್ತ ದೈವಿಕ ಪರಿಹಾರವೇನು?",
    en: "What is the recommended divine remedy for financial prosperity and peace of mind?",
    hi: "आर्थिक उन्नति और मानसिक शांति के लिए क्या उपाय करें?",
    te: "ఆర్థికాభివృద్ధికి మరియు శాంతికి తగిన దైవిక పరిహారం ఏమిటి?",
    ta: "பொருளாதார வளர்ச்சி மற்றும் மன அமைதிக்கான சிறந்த பரிகாரம் என்ன?"
  },

  // Remedies Tab Labels
  gemstoneLabel: {
    kn: "ಅದೃಷ್ಟ ರತ್ನ",
    en: "Benefic Gemstone",
    hi: "भाग्यशाली रत्न",
    te: "అదృష్ట రత్నం",
    ta: "அதிர்ஷ்ட ரத்தினம்"
  },
  gemstoneTitle: {
    kn: "ಅದೃಷ್ಟ ರತ್ನ (Benefic Gemstone)",
    en: "Benefic Astrological Gemstone",
    hi: "भाग्यशाली रत्न",
    te: "అదృష్ట రత్నం",
    ta: "அதிர்ஷ்ட ரத்தினம்"
  },
  rudrakshaLabel: {
    kn: "ಧರಿಸಬೇಕಾದ ರುದ್ರಾಕ್ಷಿ",
    en: "Sacred Rudraksha",
    hi: "धारण योग्य रुद्राक्ष",
    te: "ధరించవలసిన రుద్రాక్ష",
    ta: "அணிய வேண்டிய ருத்ராட்சம்"
  },
  rudrakshaTitle: {
    kn: "ಧರಿಸಬೇಕಾದ ರುದ್ರಾಕ್ಷಿ (Sacred Rudraksha)",
    en: "Sacred Rudraksha Mukhi",
    hi: "धारण योग्य रुद्राक्ष",
    te: "ధరించవలసిన రుద్రాక్ష",
    ta: "அணிய வேண்டிய ருத்ராட்சம்"
  },
  mantraLabel: {
    kn: "ನಿತ್ಯ ಜಪಿಸಬೇಕಾದ ಮಂತ್ರ",
    en: "Daily Japa Mantra",
    hi: "दैनिक जप मंत्र",
    te: "నిత్యం జపించవలసిన మంత్రం",
    ta: "தினசரி ஜபிக்க வேண்டிய மந்திரம்"
  },
  mantraTitle: {
    kn: "ನಿತ್ಯ ಜಪಿಸಬೇಕಾದ ಮಂತ್ರ (Daily Japa Mantra)",
    en: "Daily Japa Mantra",
    hi: "दैनिक जप मंत्र",
    te: "నిత్యం జపించవలసిన మంత్రం",
    ta: "தினசரி ஜபிக்க வேண்டிய மந்திரம்"
  },
  auspiciousDayLabel: {
    kn: "ಶುಭ ವಾರ",
    en: "Auspicious Day",
    hi: "शुभ वार",
    te: "శుభ వారం",
    ta: "சுப வாரம்"
  },
  fastingDayTitle: {
    kn: "ಶುಭ ವಾರ & ದೇವತಾ ಆರಾಧನೆ (Auspicious Day & Deity)",
    en: "Auspicious Day & Primary Deity",
    hi: "शुभ वार एवं आराध्य देव",
    te: "శుభ వారం & ఇష్ట దైవ ಆరాధన",
    ta: "சுப வாரம் மற்றும் இஷ்ட தெய்வ வழிபாடு"
  },
  deityLabel: {
    kn: "ಆರಾಧ್ಯ ದೇವತೆ",
    en: "Presiding Deity",
    hi: "आराध्य देव",
    te: "ఇష్ట దైవం",
    ta: "இஷ்ட தெய்வம்"
  },
  deityTitle: {
    kn: "ಆರಾಧ್ಯ ದೇವತೆ (Presiding Deity)",
    en: "Presiding Divine Deity",
    hi: "आराध्य देव",
    te: "ఇష్ట దైవ ఆరాధన",
    ta: "இஷ்ட தெய்வ வழிபாடு"
  },
  gokarnaSevaLabel: {
    kn: "ಗೋಕರ್ಣ ಸಂಕಲ್ಪ ಸೇವೆ",
    en: "Gokarna Sankalpa Seva",
    hi: "गोकर्ण संकल्प सेवा",
    te: "గోకర్ణ సంకల్ప సేవ",
    ta: "கோகர்ண சங்கல்ப சேவை"
  },
  gokarnaSevaHeader: {
    kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಸಂಕಲ್ಪ ಸೇವೆ",
    en: "Gokarna Mahabaleshwara Divine Sankalpa Seva",
    hi: "गोकर्ण महाबलेश्वर दिव्य संकल्प सेवा",
    te: "గోకర్ణ మహాబలేశ్వర దైవిక సంకల్ప సేవ",
    ta: "கோகர்ண மஹாபலேஷ்வரர் தெய்வீக சங்கல்ப சேவை"
  },

  // Priest Endorsement & Gokarna Contact
  priestTitle: {
    kn: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಧಾನ ಅರ್ಚಕರು",
    en: "Chief Priest, Sri Kshetra Gokarna Mahabaleshwara",
    hi: "प्रधान अर्चक, श्री क्षेत्र गोकर्ण महाबलेश्वर",
    te: "ప్రధాన అర్చకులు, శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర",
    ta: "தலைமை அர்ச்சகர், ஸ்ரீ க்ஷேத்ர கோகர்ண மஹாபலேஷ்வரர்"
  },
  priestName: {
    kn: "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Sri Shreeram Pandit)",
    en: "Sri Shreeram Pandit",
    hi: "श्री श्रीराम पंडित",
    te: "శ్రీ శ్రీరామ్ పండిత్",
    ta: "ஸ்ரீ ஸ்ரீராம் பண்டித்"
  },
  priestContact: {
    kn: "ನೇರ ಸಮಾಲೋಚನೆ & ಗೋಕರ್ಣ ಸೇವಾ ಸಂಕಲ್ಪ: +91 99723 39362",
    en: "Direct Consultation & Gokarna Seva Sankalpa: +91 99723 39362",
    hi: "प्रत्यक्ष परामर्श एवं गोकर्ण सेवा संकल्प: +91 99723 39362",
    te: "ప్రత్యక్ష సంప్రదింపులు & గోకర్ణ సేవా సంకల్పం: +91 99723 39362",
    ta: "நேரடி ஆலோசனை & கோகர்ண சேவை சங்கல்பம்: +91 99723 39362"
  },
  whatsappShareText: {
    kn: "ನಮಸ್ಕಾರ! ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯದ ವೈಯಕ್ತಿಕ ಜನನ ಕುಂಡಲಿ ಮತ್ತು ಪ್ರಸ್ತುತ ಜೀವನ ವಿಶ್ಲೇಷಣೆಯನ್ನು ವೀಕ್ಷಿಸಿ:",
    en: "Namaskara! View your authentic Baggona Panchanga Janma Kundali and Live Life Astrology guidance here:",
    hi: "नमस्कार! अपनी बग्गोण पंचांग जन्म कुंडली और प्रत्यक्ष जीवन ज्योतिष मार्गदर्शन यहाँ देखें:",
    te: "నమస్కారం! మీ బగ్గోణ పంచాంగ జనన కుಂಡలి మరియు ప్రత్యక్ష జీవిత విశ్లేషణను ఇక్కడ వీక్షించండి:",
    ta: "வணக்கம்! உங்கள் பக்கோண பஞ்சாங்க பிறப்பு ஜாதகம் மற்றும் நேரடி வாழ்க்கை ஜோதிட வழிகாட்டலை இங்கே காண்க:"
  }
};

/**
 * Retrieve localized text for Public Kundli feature with language fallback
 */
export function getPublicKundliText(key: string, lang: string = "kn"): string {
  const normLang = (["kn", "en", "hi", "te", "ta"].includes(lang) ? lang : "kn") as PublicKundliLang;
  const item = T_PUBLIC_KUNDLI[key];
  if (!item) return key;
  return item[normLang] || item.kn || item.en || key;
}
