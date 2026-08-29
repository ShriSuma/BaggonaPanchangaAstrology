import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

helper_maps = '''
const SIGN_LORDS: Record<number, string> = {
  0: "Mars (ಮಂಗಳ)", 1: "Venus (ಶುಕ್ರ)", 2: "Mercury (ಬುಧ)", 3: "Moon (ಚಂದ್ರ)", 4: "Sun (ಸೂರ್ಯ)", 5: "Mercury (ಬುಧ)",
  6: "Venus (ಶುಕ್ರ)", 7: "Mars (ಮಂಗಳ)", 8: "Jupiter (ಗುರು)", 9: "Saturn (ಶನಿ)", 10: "Saturn (ಶನಿ)", 11: "Jupiter (ಗುರು)"
};

const PAGE1_LABELS: Record<string, {
  headerTitle: string;
  subTitle: string;
  devoteeMetadataHeader: string;
  labelRashi: string;
  labelNakshatra: string;
  labelLagna: string;
  labelGotra: string;
  labelDob: string;
  labelTob: string;
  labelPob: string;
  padaText: string;
  sec1Header: string;
  tithiVaraTitle: string;
  nakshatraPadaTitle: string;
  lordSovereigntyTitle: string;
  virtueScoreTitle: string;
  sec2Header: string;
  deityLabel: string;
  symbolLabel: string;
  mantraLabel: string;
  sec3Header: string;
  gemLabel: string;
  rudrakshaLabel: string;
  colorDayLabel: string;
  directionLabel: string;
  blessingHeader: string;
  blessingText: string;
  footerMotto: string;
  footerPriest: string;
}> = {
  kn: {
    headerTitle: "॥ ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    subTitle: "🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಪವಿತ್ರ ಅನುಗ್ರಹ ವೈಯಕ್ತಿಕ ಗ್ರಂಥ",
    devoteeMetadataHeader: "❖ ಆತ್ಮೀಯ ಭಕ್ತರ ಜನ್ಮ ದಾಖಲೆ ವಿವರಣೆ:",
    labelRashi: "ಜನ್ಮ ರಾಶಿ",
    labelNakshatra: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    labelLagna: "ಜನ್ಮ ಲಗ್ನ",
    labelGotra: "ಗೋತ್ರ",
    labelDob: "ಜನನ ದಿನಾಂಕ",
    labelTob: "ಜನನ ಸಮಯ",
    labelPob: "ಜನನ ಸ್ಥಳ",
    padaText: "ನೇ ಪಾದ",
    sec1Header: "🌟 ಜನ್ಮ ಪಂಚಾಂಗ ತತ್ವ ಹಾಗೂ ಗ್ರಹ ಸಾರ್ವಭೌಮತ್ವ ಮುಖ್ಯಾಂಶಗಳು:",
    tithiVaraTitle: "ಪಂಚಾಂಗ ತಿಥಿ & ವಾರ ತತ್ವ:",
    nakshatraPadaTitle: "ಜನ್ಮ ನಕ್ಷತ್ರ & ಭಾವ ದೃಷ್ಟಿ:",
    lordSovereigntyTitle: "ಲಗ್ನಾಧಿಪತಿ & ರಾಶ್ಯಾಧಿಪತಿ ಯೋಗ:",
    virtueScoreTitle: "ಸಾತ್ವಿಕ ಪಂಚಾಂಗ ಬಲ ಗ್ರೇಡ್:",
    sec2Header: "🪔 ಜನ್ಮ ನಕ್ಷತ್ರ ಅಧಿದೇವತಾ, ದೈವಿಕ ಸಂಕೇತ & ವೈಯಕ್ತಿಕ ಸಿದ್ಧ ಜಪ ಮಂತ್ರ:",
    deityLabel: "ನಕ್ಷತ್ರ ಅಧಿದೇವತೆ",
    symbolLabel: "ನಕ್ಷತ್ರ ಸಂಕೇತ & ವೃಕ್ಷ",
    mantraLabel: "ವೈಯಕ್ತಿಕ ಸಿದ್ಧ ಜಪ ಮಂತ್ರ",
    sec3Header: "👑 ಸಾತ್ವಿಕ ರಕ್ಷಾ ಸಿದ್ಧಿ: ರಾಜ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಅದೃಷ್ಟ ಮಂಗಳ ಸಾಧನೆ:",
    gemLabel: "ಅದೃಷ್ಟ ರಾಜ ರತ್ನ",
    rudrakshaLabel: "ದೈವಿಕ ರುದ್ರಾಕ್ಷಿ",
    colorDayLabel: "ಮಂಗಳ ಬಣ್ಣ & ವಾರ",
    directionLabel: "ಅದೃಷ್ಟ ದಿಕ್ ಸೂಚಿ",
    blessingHeader: "🌸 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಶ್ರೇಷ್ಠ ಆಶೀರ್ವಾದ ಪತ್ರ:",
    blessingText: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಲ್ಲಿ ಹಾಗೂ ಪ್ರಧಾನ ಅರ್ಚಕರ ಅಭಯ ಹಸ್ತದೊಂದಿಗೆ ಭಕ್ತರ ಶ್ರೇಯೋಭಿವೃದ್ಧಿಗಾಗಿ ಸಿದ್ಧ ಸಂಕಲ್ಪ ಪೂಜೆ, ನವಗ್ರಹ ಶಾಂತಿ ಹಾಗೂ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ ಸೇವೆಯನ್ನು ಶ್ರದ್ಧಾ ಭಕ್ತಿಯಿಂದ ನೆರವೇರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ನಕ್ಷತ್ರ ಅಧಿದೇವತೆ ಹಾಗೂ ಪಂಚಾಂಗ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಈ ಸಿದ್ಧ ವೈಯಕ್ತಿಕ ಗ್ರಂಥವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದ್ದು, ಇದರಲ್ಲಿ ಪ್ರತಿಪಾದಿಸಲಾದ ದೈನಂದಿನ ಸಂಧ್ಯಾ ಜಪ, ವೈಯಕ್ತಿಕ ಮಂತ್ರ ಪಠಣ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಪ್ರಸಾದ ಸೇವನೆಯಿಂದ ಸಕಲ ಗ್ರಹ ಪೀಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ದಿವ್ಯ ಯಶಸ್ಸು ಹಾಗೂ ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿದೆ.",
    footerMotto: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು · ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು"',
    footerPriest: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು"
  },
  en: {
    headerTitle: "|| Baggona Panchanga Astrology ||",
    subTitle: "🕉️ Sacred Personal Horoscope & Divine Grace Grantha from Gokarna Kshetra Chief Archaka",
    devoteeMetadataHeader: "❖ Devotee Sacred Birth Metadata:",
    labelRashi: "Moon Sign",
    labelNakshatra: "Birth Star",
    labelLagna: "Ascendant (Lagna)",
    labelGotra: "Gotra",
    labelDob: "Date of Birth",
    labelTob: "Time of Birth",
    labelPob: "Place of Birth",
    padaText: "Pada",
    sec1Header: "🌟 Panchanga Birth Pillars & Astronomical Sovereignty:",
    tithiVaraTitle: "Tithi & Day Lord Energy:",
    nakshatraPadaTitle: "Birth Star & Pada Placement:",
    lordSovereigntyTitle: "Lagna Lord & Rashi Lord Harmony:",
    virtueScoreTitle: "Panchanga Alignment Grade:",
    sec2Header: "🪔 Birth Star Presiding Deity, Sacred Symbol & Personal Siddha Mantra:",
    deityLabel: "Presiding Star Deity",
    symbolLabel: "Sacred Symbol & Tree",
    mantraLabel: "Personal Siddha Mantra",
    sec3Header: "👑 Sacred Protection: Gemstone, Rudraksha & Auspicious Alignment:",
    gemLabel: "Auspicious Gemstone",
    rudrakshaLabel: "Sacred Rudraksha",
    colorDayLabel: "Lucky Color & Day",
    directionLabel: "Lucky Direction",
    blessingHeader: "🌸 Divine Gokarna Mahabaleshwara Sacred Blessing Letter:",
    blessingText: "With divine grace at the sacred Gokarna Mahabaleshwara Kshetra and the blessings of the Chief Priest, sacred Sankalpa Puja, Navagraha Shanti, and Rudrabhishekam have been performed for the devotee's holistic prosperity. Based on your birth chart's Nakshatra Deity and Panchanga pillars, this personal treatise has been consecrated. Daily recitation of the prescribed Siddha Mantra and consuming Gokarna Prasada will dissolve all planetary afflictions, bestowing health, longevity, and divine success.",
    footerMotto: '"Om Gokarna Mahabaleshwara Prasada Siddhirastu · Sarve Janah Sukhino Bhavantu"',
    footerPriest: "Chief Archaka — Gokarna Kshetra"
  },
  hi: {
    headerTitle: "॥ बग्गोण पंचांग ज्योतिष ॥",
    subTitle: "🕉️ श्री गोकर्ण क्षेत्र मुख्य अर्चक का पावन व्यक्तिगत ग्रंथ",
    devoteeMetadataHeader: "❖ आत्मप्रिय भक्त का जन्म विवरण:",
    labelRashi: "जन्म राशि",
    labelNakshatra: "जन्म नक्षत्र",
    labelLagna: "जन्म लग्न",
    labelGotra: "गोत्र",
    labelDob: "जन्म तिथि",
    labelTob: "जन्म समय",
    labelPob: "जन्म स्थान",
    padaText: "चरण",
    sec1Header: "🌟 पंचांग जन्म तत्व एवं ग्रह संप्रभुता विशेषताएं:",
    tithiVaraTitle: "पंचांग तिथि एवं वार तत्व:",
    nakshatraPadaTitle: "जन्म नक्षत्र एवं पद स्थिति:",
    lordSovereigntyTitle: "लग्नेश एवं राशिश शुभ योग:",
    virtueScoreTitle: "सात्विक पंचांग बल ग्रेड:",
    sec2Header: "🪔 जन्म नक्षत्र अधिदेवता, पावन प्रतीक एवं व्यक्तिगत सिद्ध मंत्र:",
    deityLabel: "नक्षत्र अधिदेवता",
    symbolLabel: "नक्षत्र प्रतीक एवं वृक्ष",
    mantraLabel: "व्यक्तिगत सिद्ध जप मंत्र",
    sec3Header: "👑 सात्विक रक्षा सिद्धि: रत्न, रुद्राक्ष एवं भाग्यशाली साधन:",
    gemLabel: "भाग्यशाली रत्न",
    rudrakshaLabel: "पावन रुद्राक्ष",
    colorDayLabel: "शुभ रंग एवं वार",
    directionLabel: "भाग्यशाली दिशा",
    blessingHeader: "🌸 श्री गोकर्ण महाबलेश्वर क्षेत्र पावन आशीर्वाद पत्र:",
    blessingText: "श्री गोकर्ण महाबलेश्वर धाम में मुख्य अर्चक के आशीर्वाद से आपके कल्याण हेतु संकल्प पूजा एवं नवग्रह शांति संपन्न की गई है। आपके नक्षत्र अधिदेवता एवं पंचांग बल पर आधारित यह व्यक्तिगत ग्रंथ तैयार किया गया है। दैनिक मंत्र जप एवं प्रसाद सेवन से समस्त ग्रह दोष शांत होकर सुख, समृद्धि एवं आरोग्य की प्राप्ति होगी।",
    footerMotto: '"ॐ गोकर्ण महाबलेश्वर प्रसाद सिद्धिरस्तु · सर्वे जनाः सुखिनो भवन्तु"',
    footerPriest: "मुख्य अर्चक — गोकर्ण क्षेत्र"
  },
  te: {
    headerTitle: "|| బగ్గోణ పంచాంగ జ్యోతిష్యం ||",
    subTitle: "🕉️ శ్రీ గోకర్ణ క్షేత్ర ప్రధాన అర్చకుల పవిత్ర అనుగ్రహ వ్యక్తిగత గ్రంథం",
    devoteeMetadataHeader: "❖ ఆత్మీయ భక్తుల జన్మ వివరాలు:",
    labelRashi: "జన్మ రాశి",
    labelNakshatra: "జన్మ నక్షత్రం",
    labelLagna: "జన్మ లగ్నం",
    labelGotra: "గోత్రం",
    labelDob: "జనన తేదీ",
    labelTob: "జనన సమయం",
    labelPob: "జనన స్థలం",
    padaText: "వ పాదం",
    sec1Header: "🌟 పంచాంగ జన్మ తత్వాలు & గ్రహ ప్రాధాన్యతలు:",
    tithiVaraTitle: "తిథి & వార ప్రాముఖ్యత:",
    nakshatraPadaTitle: "జన్మ నక్షత్రం & పాద బలం:",
    lordSovereigntyTitle: "లగ్నాధిపతి & రాశ్యాధిపతి యోగం:",
    virtueScoreTitle: "సాత్విక పంచాంగ బల గ్రేడ్:",
    sec2Header: "🪔 జన్మ నక్షత్ర అధిదేవత, పవిత్ర సంకేతం & సిద్ధ జప మంత్రం:",
    deityLabel: "నక్షత్ర అధిదేవత",
    symbolLabel: "నక్షత్ర సంకేతం & వృక్షం",
    mantraLabel: "వైయక్తిక సిద్ధ జప మంత్రం",
    sec3Header: "👑 సాత్విక రక్షా సిద్ధి: రత్నం, రుద్రాక్ష & అదృష్ట మార్గం:",
    gemLabel: "అదృష్ట రత్నం",
    rudrakshaLabel: "పవిత్ర రుద్రాక్ష",
    colorDayLabel: "శుభ రంగు & వారం",
    directionLabel: "అదృష్ట దిశ",
    blessingHeader: "🌸 శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి పవిత్ర ఆశీర్వచనం:",
    blessingText: "శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్రంలో ప్రధాన అర్చకుల దివ్యానుగ్రహంతో మీ శ్రేయస్సు కొరకు సంకల్ప పూజలు నిర్వహింపబడినవి. మీ జన్మ నక్షత్ర అధిదేవత మరియు పంచాంగ బలం ఆధారంగా ఈ దివ్య గ్రంథం సిద్ధింపబడింది. నిత్య మంత్ర జపం మరియు క్షేత్ర ప్రసాద స్వీకరణ వల్ల సకల దోషాలు తొలగి ఆయురారోగ్యాలు, ఐశ్వర్యం లభించుగాక.",
    footerMotto: '"ఓం గోకర్ణ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు · సర్వే జనాః సుఖినో భవంతు"',
    footerPriest: "ప్రధాన అర్చకులు — గోకర్ణ క్షేత్రం"
  },
  ta: {
    headerTitle: "|| பக்கோண பஞ்சாங்கம் ஜோதிடம் ||",
    subTitle: "🕉️ ஸ்ரீ கோகர்ண க்ஷேத்திர முதன்மை அர்ச்சகரின் புனித ஆசி நூல்",
    devoteeMetadataHeader: "❖ அன்பான பக்தரின் ஜென்ம விவரங்கள்:",
    labelRashi: "ஜென்ம ராசி",
    labelNakshatra: "ஜென்ம நட்சத்திரம்",
    labelLagna: "ஜென்ம லக்னம்",
    labelGotra: "கோத்ரம்",
    labelDob: "பிறந்த தேதி",
    labelTob: "பிறந்த நேரம்",
    labelPob: "பிறந்த இடம்",
    padaText: "ஆம் பாதம்",
    sec1Header: "🌟 பஞ்சாங்க ஜென்ம தத்துவம் & கிரக சிறப்புகள்:",
    tithiVaraTitle: "திதி & வார மகிமை:",
    nakshatraPadaTitle: "ஜென்ம நட்சத்திரம் & பாதம்:",
    lordSovereigntyTitle: "லக்னாதிபதி & ராசியாதிபதி யோகம்:",
    virtueScoreTitle: "சாத்வீக பஞ்சாங்க பலன்:",
    sec2Header: "🪔 ஜென்ம நட்சத்திர அதிதேவதை, சின்னம் & தனிப்பட்ட மந்திரம்:",
    deityLabel: "நட்சத்திர அதிதேவதை",
    symbolLabel: "நட்சத்திர சின்னம் & விருட்சம்",
    mantraLabel: "தனிப்பட்ட சித்த ஜப மந்திரம்",
    sec3Header: "👑 சாத்வீக பாதுகாப்பு: ரத்தினம், ருத்ராட்சம் & அதிர்ஷ்ட வழிகாட்டல்:",
    gemLabel: "அதிர்ஷ்ட ரத்தினம்",
    rudrakshaLabel: "புனித ருத்ராட்சம்",
    colorDayLabel: "சுப நிறம் & வாரம்",
    directionLabel: "அதிர்ஷ்ட திசை",
    blessingHeader: "🌸 ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலய புனித ஆசி மடல்:",
    blessingText: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்தில் முதன்மை அர்ச்சகரின் ஆசியுடன் உங்களின் நல்வாழ்வுக்காக சங்கல்ப பூஜை மற்றும் நவக்கிரக சாந்தி செய்யப்பட்டுள்ளது. உங்களின் நட்சத்திர அதிதேவதை மற்றும் பஞ்சாங்க பலத்தின் அடிப்படையில் இந்த புனித ஆசி நூல் தயாரிக்கப்பட்டுள்ளது. தினமும் இந்த மந்திரத்தை ஜபித்து கோகர்ண பிரசாதம் உட்கொள்வதன் மூலம் சகல கிரக தோஷங்களும் நீங்கி ஆயுள், ஆரோக்கியம் மற்றும் அஷ்டைஸ்வர்யங்களும் சித்திக்கும்.",
    footerMotto: '"ஓம் கோகர்ண மகாபலேஸ்வர பிரசாத் சித்திரஸ்து · சர்வே ஜனா சுகினோ பவந்து"',
    footerPriest: "முதன்மை அர்ச்சகர் — கோகர்ண க்ஷேத்திரம்"
  }
};

const NAKSHATRA_DEITIES: Record<number, { deity: Record<string, string>; symbol: Record<string, string>; mantra: string }> = {
  0: { deity: { kn: "ಅಶ್ವಿನೀ ಕುಮಾರರು (ದೈವಿಕ ವೈದ್ಯರು)", en: "Ashwini Kumaras (Divine Physicians)", hi: "अश्विनी कुमार", te: "అశ్విని దేవతలు", ta: "அஸ்வினி தேவர்கள்" }, symbol: { kn: "ಕುದುರೆ ಮುಖ", en: "Horse Head", hi: "अश्व मुख", te: "గుర్రం ముఖం", ta: "குதிரை முகம்" }, mantra: "ॐ ಅಶ್ವಿನೀಕುಮಾರಾಭ್ಯಾಂ ನಮಃ" },
  1: { deity: { kn: "ಯಮ ಧರ್ಮರಾಜ", en: "Yama Dharmaraja", hi: "यम धर्मराज", te: "యమ ధర్మరాజు", ta: "எம தர்மராஜா" }, symbol: { kn: "ಯೋನಿ / ತೊಟ್ಟಿಲು", en: "Yoni / Cradle", hi: "योनि", te: "యోని", ta: "யோனி" }, mantra: "ॐ ಯಮಾಯ ನಮಃ" },
  2: { deity: { kn: "ಅಗ್ನಿ ದೇವ", en: "Agni Deva (Fire God)", hi: "अग्नि देव", te: "అగ్ని దేవుడు", ta: "அக்னி தேவன்" }, symbol: { kn: "ಜ್ವಾಲೆ / ಕತ್ತಿ", en: "Flame / Razor", hi: "अग्नि शिखा", te: "జ్వాల", ta: "தீச்சுடர்" }, mantra: "ॐ ಅಗ್ನಯೇ ನಮಃ" },
  3: { deity: { kn: "ಬ್ರಹ್ಮ ದೇವ (ಪ್ರಜಾಪತಿ)", en: "Brahma Prajapati", hi: "ब्रह्मा प्रजापति", te: "బ్రహ్మ దేవుడు", ta: "பிரம்ம தேவன்" }, symbol: { kn: "ರಥ / ಬಂಡಿ", en: "Chariot / Cart", hi: "रथ", te: "రథం", ta: "ரதம்" }, mantra: "ॐ ಪ್ರಜಾಪತಯೇ ನಮಃ" },
  4: { deity: { kn: "ಸೋಮ ದೇವ (ಚಂದ್ರ)", en: "Soma (Moon God)", hi: "सोम देव", te: "సోమ దేవుడు", ta: "சந்திர தேவன்" }, symbol: { kn: "ಜಿಂಕೆ ತಲೆ", en: "Deer Head", hi: "मृग शिर", te: "జింక తల", ta: "மான் தலை" }, mantra: "ॐ ಸೋಮಾಯ ನಮಃ" },
  5: { deity: { kn: "ರುದ್ರ ದೇವ (ಶಿವ)", en: "Rudra (Lord Shiva)", hi: "रुद्र देव", te: "రుద్రుడు", ta: "ருத்ர தேவன்" }, symbol: { kn: "ಕಣ್ಣೀರಿನ ಹನಿ / ಮಣಿ", en: "Teardrop / Jewel", hi: "अश्रु बिंदु", te: "అశ్రు బిందువు", ta: "துளி" }, mantra: "ॐ ನಮಃ ಶಿವಾಯ" },
  6: { deity: { kn: "ಅದಿತಿ ದೇವಿ (ದೇವಮಾತೆ)", en: "Aditi (Mother of Gods)", hi: "अदिति देवी", te: "అదితి దేవి", ta: "அதிதி தேவி" }, symbol: { kn: "ಬಿಲ್ಲು & ಬಾಣದ ಕೋಶ", en: "Bow & Quiver", hi: "धनुष-बाण", te: "బాణసంచి", ta: "வில்-அம்பு" }, mantra: "ॐ ಅದಿತ್ಯೈ ನಮಃ" },
  7: { deity: { kn: "ಬೃಹಸ್ಪತಿ (ಗುರು)", en: "Brihaspati (Guru)", hi: "बृहस्पति देव", te: "బృహస్పతి", ta: "பிருஹஸ்பதி" }, symbol: { kn: "ಕಮಲ / ಗೋವು", en: "Lotus / Cow", hi: "कमल", te: "పద్మం", ta: "தாமரை" }, mantra: "ॐ ಬೃಹಸ್ಪತಯೇ ನಮಃ" },
  8: { deity: { kn: "ನಾಗ ದೇವತೆಗಳು", en: "Nagas (Serpent Deities)", hi: "नाग देवता", te: "నాగ దేవతలు", ta: "நாக தேவதைகள்" }, symbol: { kn: "ಸುರುಳಿ ನಾಗ", en: "Coiled Serpent", hi: "सर्प", te: "పాము", ta: "பாம்பு" }, mantra: "ॐ ಸರ್ಪೇಭ್ಯೋ ನಮಃ" },
  9: { deity: { kn: "ಪಿತೃ ದೇವತೆಗಳು", en: "Pitrus (Ancestors)", hi: "पितृ देव", te: "పితృ దేవతలు", ta: "பித்ரு தேவர்கள்" }, symbol: { kn: "ರಾಜ ಸಿಂಹಾಸನ", en: "Royal Throne", hi: "राज सिंहासन", te: "రాజ సింహాసనం", ta: "அரியணை" }, mantra: "ॐ ಪಿತೃಭ್ಯೋ ನಮಃ" },
  10: { deity: { kn: "ಭಗ ದೇವ (ಸೂರ್ಯ ಸಂಭೂತ)", en: "Bhaga (Solar God)", hi: "भग देव", te: "భగ దేవుడు", ta: "பக தேவன்" }, symbol: { kn: "ಮಂಚದ ಮುಂಭಾಗ", en: "Front Legs of Couch", hi: "शय्या", te: "मंचं", ta: "கட்டில்" }, mantra: "ॐ ಭಗಾಯ ನಮಃ" },
  11: { deity: { kn: "ಅರ್ಯಮನ್ ದೇವ", en: "Aryaman (Patron God)", hi: "अर्यमा देव", te: "అర్యముడు", ta: "அர்யமா தேவன்" }, symbol: { kn: "ಮಂಚದ ಹಿಂಭಾಗ", en: "Back Legs of Couch", hi: "शय्या", te: "मंचं", ta: "கட்டில்" }, mantra: "ॐ ಅರ್ಯಮ್ಣೇ ನಮಃ" },
  12: { deity: { kn: "ಸವಿತೃ ದೇವ (ಸೂರ್ಯ)", en: "Savitur (Solar Creator)", hi: "सविता देव (सूर्य)", te: "సవితృ దేవుడు", ta: "சவித்ரு தேவன்" }, symbol: { kn: "ತೆರೆದ ಹಸ್ತ (ಆಶೀರ್ವಾದ)", en: "Open Hand (Blessing)", hi: "हस्त (खुला हाथ)", te: "చేయి", ta: "கை" }, mantra: "ॐ ಸವಿತ್ರೇ ನಮಃ" },
  13: { deity: { kn: "ತ್ವಷ್ಟಾ (ವಿಶ್ವಕರ್ಮ)", en: "Tvashtar (Divine Architect)", hi: "त्वष्टा (विश्वकर्मा)", te: "త్వష్ట", ta: "துவஷ்டா" }, symbol: { kn: "ಪ್ರಕಾಶಮಾನ ರತ್ನ", en: "Shining Pearl / Gem", hi: "मणि", te: "మణి", ta: "ரத்தினம்" }, mantra: "ॐ ತ್ವಷ್ಟ್ರೇ ನಮಃ" },
  14: { deity: { kn: "ವಾಯು ದೇವ", en: "Vayu Deva (Wind God)", hi: "वायु देव", te: "వాయు దేవుడు", ta: "வாயு தேவன்" }, symbol: { kn: "ಬಿಗಿದ ಹವಳ / ಹವಾ ಚಿಹ್ನೆ", en: "Coral / Plant Shoot", hi: "प्रवाल", te: "పగడపు చిగురు", ta: "பவளம்" }, mantra: "ॐ ವಾಯವೇ ನಮಃ" },
  15: { deity: { kn: "ಇಂದ್ರಾಗ್ನಿ (ಇಂದ್ರ & ಅಗ್ನಿ)", en: "Indragni (Indra & Agni)", hi: "इंद्राग्नि", te: "ఇంద్రాగ్నులు", ta: "இந்திராக்னி" }, symbol: { kn: "ತೋರಣ / ಕಮಾನು", en: "Triumphal Arch", hi: "तोरण", te: "తోరణం", ta: "தோரணம்" }, mantra: "ॐ ಇಂದ್ರಾಗ್ನಿಭ್ಯಾಂ ನಮಃ" },
  16: { deity: { kn: "ಮಿತ್ರ ದೇವ", en: "Mitra (God of Friendship)", hi: "मित्र देव", te: "మిత్ర దేవుడు", ta: "மித்ர தேவன்" }, symbol: { kn: "ಕಮಲದ ಹೂವು", en: "Lotus Flower", hi: "कमल पुष्प", te: "పద్మం", ta: "தாமரை" }, mantra: "ॐ ಮಿತ್ರಾಯ ನಮಃ" },
  17: { deity: { kn: "ಇಂದ್ರ ದೇವ (ದೇವಕುಲ ಅಧಿಪತಿ)", en: "Indra (King of Gods)", hi: "इंद्र देव", te: "ఇంద్రుడు", ta: "இந்திரன்" }, symbol: { kn: "ರಾಜ ಮುಕುಟ / ಕುಂಡಲ", en: "Circular Amulet / Crown", hi: "कुंडल / मुकुट", te: "కిరీటం", ta: "கிரீடம்" }, mantra: "ॐ ಇಂದ್ರಾಯ ನಮಃ" },
  18: { deity: { kn: "ನಿರೃತಿ ದೇವತೆ (ಮೂಲ ಶಕ್ತಿ)", en: "Nirriti (Root Goddess)", hi: "निरृति देवी", te: "నిరృతి దేవి", ta: "நிருருதி தேவி" }, symbol: { kn: "ಕಟ್ಟಿದ ಬೇರುಗಳು", en: "Tied Roots", hi: "मूल (जड़ें)", te: "వేళ్లు", ta: "வேர்" }, mantra: "ॐ ಮೂಲೇಶಾಯ ನಮಃ" },
  19: { deity: { kn: "ಅಪಸ್ (ಜಲ ದೇವತೆ)", en: "Apas (Water Goddess)", hi: "आपस (जल देवी)", te: "అపస్ (జల దేవి)", ta: "அபஸ் (ஜல தேவி)" }, symbol: { kn: "ಮೊರ / ಜಲ ಪಾತ್ರೆ", en: "Winnowing Basket", hi: "सूप", te: "చేట", ta: "முறம்" }, mantra: "ॐ ಅದ್ಭ್ಯೋ ನಮಃ" },
  20: { deity: { kn: "ವಿಶ್ವೇದೇವತೆಗಳು", en: "Vishwadevas (Universal Gods)", hi: "विश्वेदेवा", te: "విశ్వేదేవతలు", ta: "விஸ்வேதேவர்கள்" }, symbol: { kn: "ಆನೆ ದಂತ", en: "Elephant Tusk", hi: "गज दंत", te: "ఏనుగు దంతం", ta: "யானை தந்தம்" }, mantra: "ॐ ವಿಶ್ವೇದೇವೇಭ್ಯೋ ನಮಃ" },
  21: { deity: { kn: "ವಿಷ್ಣು ದೇವ (ಜಗತ್ ರಕ್ಷಕ)", en: "Lord Vishnu (Preserver)", hi: "भगवान विष्णु", te: "విష్ణు మూర్తి", ta: "மகா விஷ்ணு" }, symbol: { kn: "ಮೂರು ಹೆಜ್ಜೆ / ತ್ರಿವಿಕ್ರಮ", en: "Three Footprints", hi: "त्रिविक्रम पद", te: "మూడు అడుగులు", ta: "மூவடி" }, mantra: "ॐ ವಿಷ್ಣವೇ ನಮಃ" },
  22: { deity: { kn: "ಅಷ್ಟ ವಸುಗಳು", en: "Ashta Vasus (Eight Gods)", hi: "अष्ट वसु", te: "అష్ట వసువులు", ta: "அஷ்ட வసుக்கள்" }, symbol: { kn: "ಮೃದಂಗ / ಡಮರು", en: "Drum / Flute", hi: "डमरू / मृदंग", te: "మృదంగం", ta: "மிருதங்கம்" }, mantra: "ॐ ವಸುಭ್ಯೋ ನಮಃ" },
  23: { deity: { kn: "ವರುಣ ದೇವ (ಸಮುದ್ರಾಧಿಪತಿ)", en: "Varuna (Cosmic Ocean Lord)", hi: "वरुण देव", te: "వరుణ దేవుడు", ta: "வருண தேவன்" }, symbol: { kn: "ಶೂನ್ಯ ವೃತ್ತ / ಚಕ್ರ", en: "Empty Circle", hi: "शून्य वृत्त", te: "వృత్తం", ta: "வட்டம்" }, mantra: "ॐ ವರುಣಾಯ ನಮಃ" },
  24: { deity: { kn: "ಅಜೈಕಪಾದ (ರುದ್ರ ರೂಪ)", en: "Aja Ekapada (Form of Shiva)", hi: "अजैकपाद (रुद्र)", te: "అజైకపాదుడు", ta: "அஜைகபாதர்" }, symbol: { kn: "ಎರಡು ಮುಖದ ಮನುಷ್ಯ", en: "Two-Faced Man", hi: "द्विमुख", te: "ద్విముఖం", ta: "இருமுகம்" }, mantra: "ॐ ಅಜೈಕಪಾದಾಯ ನಮಃ" },
  25: { deity: { kn: "ಅಹಿರ್ಬುಧ್ನ್ಯ (ಅನಂತ ನಾಗ)", en: "Ahirbudhnya (Cosmic Snake)", hi: "अहिर्बुध्न्य", te: "అహిర్ಬುಧ್ನ್ಯుడు", ta: "அஹிர்புத்னியர்" }, symbol: { kn: "ನಾಗ ಕುಂಡಲ / ಜಲ ಶಯನ", en: "Snake in Water", hi: "शेषनाग", te: "శేషనాగు", ta: "சேஷநாகம்" }, mantra: "ॐ ಅಹಿರ್ಬುಧ್ನ್ಯಾಯ ನಮಃ" },
  26: { deity: { kn: "ಪೂಷನ್ ದೇವ (ಪೋಷಕ)", en: "Pushan (Nourisher God)", hi: "पूषा देव", te: "పూష దేవుడు", ta: "பூஷண் தேவன்" }, symbol: { kn: "ಮೀನು / ನೌಕೆ", en: "Fish / Drum", hi: "मत्स्य", te: "చేప", ta: "மீன்" }, mantra: "ॐ ಪೂಷ್ಣೇ ನಮಃ" }
};
'''

# Place helper_maps right after GOTRA_KN_MAP definition
content = content.replace("const GOTRA_KN_MAP: Record<string, string> = {", helper_maps + "\nconst GOTRA_KN_MAP: Record<string, string> = {")

# Page 1 JSX replacement snippet
old_page1_pattern = r'\{\/\* ──+[\s\S]*?PAGE 1: EXACT MATCH TO PDF \(45\) PAGE 1[\s\S]*?\{\/\* ──+[\s\S]*?PAGE 2:'

new_page1_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 1: ROYAL ASTROLOGICAL CORE PILLARS & DEITY ESSENCE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, padding: "12px 16px 16px 16px", gap: "8px" }}>
          {/* Top Sloka Banner Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "10px",
            padding: "6px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "1px", lineHeight: "1.35" }}>
              ❖ ॥ ಶ್ರೀ ವಿನಾಯಕೋ ವಿಘ್ನಹರೋ ಧನಾಧ್ಯಕ್ಷೋ ಧನಪ್ರದಃ ॥ ❖
            </div>
            <div style={{ fontSize: "21px", fontWeight: 800, color: "#78350F", lineHeight: "1.6", margin: "0" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).headerTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", marginTop: "1px", fontWeight: 600, lineHeight: "1.3" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).subTitle}
            </div>
          </div>

          {/* Devotee Record Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#B45309", textAlign: "center", marginBottom: "2px" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).devoteeMetadataHeader}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#78350F", textAlign: "center", marginBottom: "6px", borderBottom: "1.5px dashed #D97706", paddingBottom: "4px" }}>
              {displayName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: "11.5px", lineHeight: "1.45" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelRashi}:</strong> {isKn ? rashiName : (RASHI_L5[rashiIdx] as any)?.[code] || (RASHI_L5[rashiIdx] as any)?.en}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelNakshatra}:</strong> {nakName} ({pada} {(PAGE1_LABELS[code] || PAGE1_LABELS.en).padaText})</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelLagna}:</strong> {birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.en) : lagnaRashiName}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelGotra}:</strong> {finalGotra}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelDob}:</strong> {dobStr}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelTob}:</strong> {formatTimeWithAmPm(tobStr, isKn)}</div>
              <div style={{ gridColumn: "span 2" }}><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelPob}:</strong> {pobStr}</div>
            </div>
          </div>

          {/* NEW SECTION 1: Panchanga Birth Pillars (2x2 Grid) */}
          <div style={{
            background: "#FFFDF7",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "7px 10px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).sec1Header}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10px", lineHeight: "1.45" }}>
              <div style={{ background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#B45309", display: "block", marginBottom: "2px", fontSize: "10.5px" }}>
                  ☀️ {(PAGE1_LABELS[code] || PAGE1_LABELS.en).tithiVaraTitle}
                </strong>
                <div style={{ color: "#78350F" }}>
                  {isKn ? `ಶುಕ್ಲ/ಕೃಷ್ಣ ಪಕ್ಷ ತಿಥಿ ಬಲ & ನಿತ್ಯ ಪಂಚಾಂಗ ಗ್ರಹ ಅನುಗ್ರಹ.` : `Benefic Tithi and Solar Weekday Lord alignment.`}
                </div>
              </div>
              <div style={{ background: "#ECFDF5", border: "1px solid #10B981", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#047857", display: "block", marginBottom: "2px", fontSize: "10.5px" }}>
                  ⭐ {(PAGE1_LABELS[code] || PAGE1_LABELS.en).nakshatraPadaTitle}
                </strong>
                <div style={{ color: "#064E3B" }}>
                  {isKn ? `${nakName} ನಕ್ಷತ್ರ ${pada}ನೇ ಪಾದ — ನಭೋ ಮಂಡಲ ಶುಭ ದೃಷ್ಟಿ.` : `${nakName} Star Pada ${pada} celestial resonance.`}
                </div>
              </div>
              <div style={{ background: "#F5F3FF", border: "1px solid #8B5CF6", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px", fontSize: "10.5px" }}>
                  👑 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).lordSovereigntyTitle}
                </strong>
                <div style={{ color: "#4C1D95" }}>
                  {isKn ? `ಲಗ್ನೇಶ ಹಾಗೂ ರಾಶ್ಯಾಧಿಪತಿಯ ರಾಜಯೋಗ ಬಲದಿಂದ ಯಶಸ್ಸು.` : `High Lagna and Rashi Lord harmony for prosperity.`}
                </div>
              </div>
              <div style={{ background: "#FFF1F2", border: "1px solid #F43F5E", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px", fontSize: "10.5px" }}>
                  🏅 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).virtueScoreTitle}
                </strong>
                <div style={{ color: "#881337" }}>
                  {isKn ? `೯೫%+ ಉತ್ತಮೊತ್ತಮ ಸಾತ್ವಿಕ ಜನ್ಮ ಕುಂಡಲಿ ಸಿದ್ಧಿ.` : `95%+ High Auspicious Natal Alignment Score.`}
                </div>
              </div>
            </div>
          </div>

          {/* NEW SECTION 2: Birth Star Deity, Symbol & Sacred Siddha Mantra */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", borderBottom: "1px dashed #D97706", paddingBottom: "2px" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).sec2Header}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5px", lineHeight: "1.45" }}>
              <div>
                <strong style={{ color: "#B45309" }}>🪔 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).deityLabel}:</strong>{" "}
                <span style={{ color: "#78350F", fontWeight: 700 }}>{(NAKSHATRA_DEITIES[nakIdx] || NAKSHATRA_DEITIES[12]).deity[code] || (NAKSHATRA_DEITIES[nakIdx] || NAKSHATRA_DEITIES[12]).deity.en}</span>
              </div>
              <div>
                <strong style={{ color: "#B45309" }}>🌿 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).symbolLabel}:</strong>{" "}
                <span style={{ color: "#78350F", fontWeight: 700 }}>{(NAKSHATRA_DEITIES[nakIdx] || NAKSHATRA_DEITIES[12]).symbol[code] || (NAKSHATRA_DEITIES[nakIdx] || NAKSHATRA_DEITIES[12]).symbol.en}</span>
              </div>
            </div>
            <div style={{
              marginTop: "6px",
              background: "#78350F",
              color: "#FEF3C7",
              border: "1px solid #D97706",
              borderRadius: "6px",
              padding: "5px 10px",
              textAlign: "center",
              fontWeight: 800,
              fontSize: "11.5px"
            }}>
              📜 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).mantraLabel}: &nbsp;
              <span style={{ color: "#FDE68A", fontSize: "12.5px" }}>{(NAKSHATRA_DEITIES[nakIdx] || NAKSHATRA_DEITIES[12]).mantra}</span>
            </div>
          </div>

          {/* NEW SECTION 3: Sacred Gemstone, Rudraksha & Auspicious Alignment */}
          <div style={{
            background: "#FFFDF7",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "7px 10px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", borderBottom: "1px dashed #FCD34D", paddingBottom: "2px" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).sec3Header}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.2px", lineHeight: "1.4" }}>
              <div style={{ background: "#ECFDF5", border: "1px solid #10B981", borderRadius: "6px", padding: "5px 7px" }}>
                <strong style={{ color: "#047857" }}>💎 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).gemLabel}:</strong>{" "}
                <span style={{ color: "#064E3B", fontWeight: 700 }}>{rashiRemedy.gem}</span>
              </div>
              <div style={{ background: "#F5F3FF", border: "1px solid #8B5CF6", borderRadius: "6px", padding: "5px 7px" }}>
                <strong style={{ color: "#5B21B6" }}>📿 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).rudrakshaLabel}:</strong>{" "}
                <span style={{ color: "#4C1D95", fontWeight: 700 }}>{rashiRemedy.rudraksha}</span>
              </div>
              <div style={{ background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: "6px", padding: "5px 7px" }}>
                <strong style={{ color: "#B45309" }}>🎨 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).colorDayLabel}:</strong>{" "}
                <span style={{ color: "#78350F", fontWeight: 700 }}>{rashiRemedy.color} · {rashiRemedy.day}</span>
              </div>
              <div style={{ background: "#EFF6FF", border: "1px solid #3B82F6", borderRadius: "6px", padding: "5px 7px" }}>
                <strong style={{ color: "#1E40AF" }}>🧭 {(PAGE1_LABELS[code] || PAGE1_LABELS.en).directionLabel}:</strong>{" "}
                <span style={{ color: "#1E3A8A", fontWeight: 700 }}>{isKn ? "ಪೂರ್ವ / ಉತ್ತರ (East / North)" : "East / North"}</span>
              </div>
            </div>
          </div>

          {/* Gokarna Blessing Letter - Royal Golden Background */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "10px",
            padding: "7px 10px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px", borderBottom: "1px dashed #D97706", paddingBottom: "2px" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).blessingHeader}
            </div>
            <div style={{ fontSize: "9.8px", lineHeight: "1.42", color: "#451A03", textAlign: "justify" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).blessingText}
            </div>
          </div>

          {/* Footer Banner - Positioned cleanly 1-2 cm above bottom frame line */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "6px 8px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto",
            marginBottom: "4px"
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.3" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).footerMotto}
            </div>
            <div style={{ fontSize: "9px", color: "#FDE68A", fontWeight: 600, marginTop: "1px", lineHeight: "1.2" }}>
              {(PAGE1_LABELS[code] || PAGE1_LABELS.en).footerPriest} · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2:'''

match = re.search(r'\{\/\* ──+[\s\S]*?PAGE 1: EXACT MATCH TO PDF \(45\) PAGE 1[\s\S]*?\{\/\* ──+[\s\S]*?PAGE 2:', content)
if match:
    content = content.replace(match.group(0), new_page1_jsx)
    print("Page 1 JSX replaced successfully!")
else:
    print("Could not match Page 1 JSX pattern!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
