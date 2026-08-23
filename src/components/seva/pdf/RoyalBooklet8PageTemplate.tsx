import React from "react";
import { calculateKundli } from "../../../core/KundliEngine";
import { generateBhuktiTimeline } from "../../../core/DashaBhuktiEngine";
import { NAKSHATRA_L5, RASHI_L5 } from "../../../features/seva/sevaLocale";
import { transliterateName } from "../../../utils/transliterator";

export interface DevoteeIdentityProps {
  personName?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  gotra?: string;
  rashiIndex?: number;
  nakshatraIndex?: number;
  aiTransliteratedName?: string;
}

export interface RoyalBooklet8PageTemplateProps {
  lang?: string;
  identity?: DevoteeIdentityProps;
  panditName?: string;
  rhythm?: any;
  qrDataUrl?: string;
}

const RASHI_KN_MAP: Record<number, string> = {
  0: "ಮೇಷ",
  1: "ವೃಷಭ",
  2: "ಮಿಥುನ",
  3: "ಕರ್ಕಾಟಕ",
  4: "ಸಿಂಹ",
  5: "ಕನ್ಯಾ",
  6: "ತುಲಾ",
  7: "ವೃಶ್ಚಿಕ",
  8: "ಧನುಸ್ಸು",
  9: "ಮಕರ",
  10: "ಕುಂಭ",
  11: "ಮೀನ"
};

const PLANET_KN_MAP: Record<string, string> = {
  Sun: "ಸೂರ್ಯ",
  Moon: "ಚಂದ್ರ",
  Mars: "ಮಂಗಳ",
  Mercury: "ಬುಧ",
  Jupiter: "ಗುರು",
  Venus: "ಶುಕ್ರ",
  Saturn: "ಶನಿ",
  Rahu: "ರಾಹು",
  Ketu: "ಕೇತು",
  Lagna: "ಲಗ್ನ",
  Maandi: "ಮಾಂದಿ"
};


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

const GOTRA_KN_MAP: Record<string, string> = {
  "Vasistha": "ವಸಿಷ್ಠ",
  "Vasisthha": "ವಸಿಷ್ಠ",
  "Kashyapa": "ಕಾಶ್ಯಪ",
  "Bharadwaja": "ಭಾರದ್ವಾಜ",
  "Viswamitra": "ವಿಶ್ವಾಮಿತ್ರ",
  "Gautama": "ಗೌತಮ",
  "Jamadagni": "ಜಮದಗ್ನಿ",
  "Atri": "ಅತ್ರಿ",
  "Agastya": "ಅಗಸ್ತ್ಯ",
  "Angirasa": "ಅಂಗೀರಸ",
  "Harita": "ಹರೀತ",
  "Kaundinya": "ಕೌಂಡಿನ್ಯ",
  "Shandilya": "ಶಾಂಡಿಲ್ಯ"
};

const formatTimeWithAmPm = (timeStr: string, isKn: boolean): string => {
  if (!timeStr) return isKn ? "09:25 AM (ಪೂರ್ವಾಹ್ನ)" : "09:25 AM";
  const cleanTime = timeStr.trim();
  if (cleanTime.toUpperCase().includes("AM") || cleanTime.toUpperCase().includes("PM")) {
    return cleanTime;
  }
  const parts = cleanTime.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, "0");
  if (isNaN(hours)) return timeStr;
  
  const isPm = hours >= 12;
  const period = isPm ? "PM" : "AM";
  const knPeriod = isPm ? "ಅಪರಾಹ್ನ" : "ಪೂರ್ವಾಹ್ನ";
  
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  const formattedHours = hours.toString().padStart(2, "0");
  return isKn 
    ? `${formattedHours}:${minutes} ${period} (${knPeriod})`
    : `${formattedHours}:${minutes} ${period}`;
};


const PAGE1_DICT: Record<string, {
  sloka: string;
  title: string;
  subTitle: string;
  metadataHeader: string;
  lblRashi: string;
  lblNakshatra: string;
  lblLagna: string;
  lblGotra: string;
  lblDob: string;
  lblTob: string;
  lblPob: string;
  padaText: string;
  blessingHeader: string;
  salutation: (name: string, pandit: string) => string;
  para1: (rashi: string, nak: string, pada: number, lagna: string, maha?: string, bhukti?: string) => string;
  para2: string;
  para3: (name: string, rashiLord?: string, lagnaLord?: string) => string;
  footerMotto: string;
  footerPriest: (pandit: string) => string;
}> = {
  kn: {
    sloka: "❖ ॥ ಶ್ರೀ ವಿನಾಯಕೋ ವಿಘ್ನಹರೋ ಧನಾಧ್ಯಕ್ಷೋ ಧನಪ್ರದಃ ॥ ❖",
    title: "॥ ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    subTitle: "🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ಪವಿತ್ರ ಅನುಗ್ರಹ ವೈಯಕ್ತಿಕ ಗ್ರಂಥ",
    metadataHeader: "❖ ಆತ್ಮೀಯ ಭಕ್ತರ ಜನ್ಮ ದಾಖಲೆ ವಿವರಣೆ:",
    lblRashi: "ಜನ್ಮ ರಾಶಿ",
    lblNakshatra: "ಜನ್ಮ ನಕ್ಷತ್ರ",
    lblLagna: "ಜನ್ಮ ಲಗ್ನ",
    lblGotra: "ಗೋತ್ರ",
    lblDob: "ಜನನ ದಿನಾಂಕ",
    lblTob: "ಜನನ ಸಮಯ",
    lblPob: "ಜನನ ಸ್ಥಳ",
    padaText: "ನೇ ಪಾದ",
    blessingHeader: "🌸 ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪ್ರಧಾನ ಅರ್ಚಕರ ಆಶೀರ್ವಚನ & ದೈವಿಕ ಸಂಕಲ್ಪ:",
    salutation: (name, pandit) => `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಿಂದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ${pandit} ಅವರು ಆತ್ಮೀಯ ಶ್ರೇಯೋಭಿಲಾಷಿಗಳಾದ ${name} ಅವರಿಗೆ ಸಲ್ಲಿಸುವ ಪವಿತ್ರ ಶುಭಾಶೀರ್ವಾದಗಳು.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${maha} ದಶಾದಲ್ಲಿ ${bhukti} ಅಂತರ್ದಶೆಯು ಸಕ್ರಿಯವಾಗಿದ್ದು, ` : "";
      return `ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಜನ್ಮ ಕುಂಡಲಿ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${lagna} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯು ${rashi} ಆಗಿದೆ. ${dashaText}ಗ್ರಹಗಳ ಶುಭ ಬಲವು ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರಾಮಾಣಿಕ ಸದಾಚಾರ ಹಾಗೂ ಆಳವಾದ ದೈವಿಕ ಶ್ರದ್ಧೆಯನ್ನು ಕರುಣಿಸಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ${nak} ಗ್ರಹ ಪ್ರಭಾವವು ಸವಾಲುಗಳನ್ನು ಜಾಣ್ಮೆಯಿಂದ ಎದುರಿಸಿ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಯಶಸ್ಸು ಸಾಧಿಸುವ ಅಪೂರ್ವ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`;
    },
    para2: "ಈ ೮ ಪುಟಗಳ ರಾಯಲ್ ವೈಯಕ್ತಿಕ ಗ್ರಂಥವನ್ನು ಕೇವಲ ನಿಮಗಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಮುಂದಿನ ಪುಟಗಳಲ್ಲಿ (ಪುಟ ೨-೮) ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಸ್ಥಾನಗಳು, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಫಲಗಳು, ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಕಾಲಮಾನ, ಸಂಧ್ಯಾ ಜಪ ವಿಧಿ ಹಾಗೂ ನಿಮ್ಮ ನಕ್ಷತ್ರದ ಸಿದ್ಧ ಮಂತ್ರಗಳನ್ನು ವಿವರಿಸಲಾಗಿದೆ.",
    para3: (name) => `${name} ಅವರ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಗ್ರಹ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಈ ಗ್ರಂಥವನ್ನು ಬರೆಯಲಾಗಿದ್ದು, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಅನುಗ್ರಹದಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸರ್ವ ಪೀಡೆಗಳು ನಿವಾರಣೆಯಾಗಿ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ಯಶಸ್ಸು ಹಾಗೂ ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿಯಾಗಲಿ.`,
    footerMotto: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು · ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು"',
    footerPriest: (pandit) => `ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · ${pandit} (ದೂರವಾಣಿ: +91 99723 39362)`
  },
  en: {
    sloka: "❖ || Sri Vinayako Vighnaharo Dhanadhyaksho Dhanapradah || ❖",
    title: "|| Baggona Panchanga Astrology ||",
    subTitle: "🕉️ Sacred Personal Horoscope & Divine Grace Grantha from Gokarna Kshetra Chief Archaka",
    metadataHeader: "❖ Devotee Sacred Birth Metadata:",
    lblRashi: "Moon Sign",
    lblNakshatra: "Birth Star",
    lblLagna: "Ascendant (Lagna)",
    lblGotra: "Gotra",
    lblDob: "Date of Birth",
    lblTob: "Time of Birth",
    lblPob: "Place of Birth",
    padaText: "Pada",
    blessingHeader: "🌸 Chief Priest Benediction & Sacred Introduction from Gokarna Kshetra:",
    salutation: (name, pandit) => `From the holy sanctum of Sri Kshetra Gokarna Mahabaleshwara, Chief Priest ${pandit} conveys sacred blessings to Esteemed Patron ${name}.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `Currently traversing the ${maha} Dasha and ${bhukti} Antardasha, ` : "";
      return `Based on authentic Gokarna natal planetary math, your Janma Lagna is ${lagna} and Moon Sign is ${rashi}. ${dashaText}the planetary alignment endows you with sharp intellect, unshakeable integrity, intuitive wisdom, and noble ambition. The sacred resonance of your Birth Star ${nak} reveals a resilient, highly respected personality capable of turning challenges into triumph through dedicated perseverance.`;
    },
    para2: "This 8-page personal treatise has been consecrated specifically for YOU. Pages 2 through 8 detail your exact Janma Kundali, planetary positions, Gochara transits, Vimshottari Dasha timeline, daily Sandhya Japa, and birth star Beeja Mantras.",
    para3: (name) => `Every astrological reflection in this treatise is 100% personalized for ${name}. May Lord Gokarna Mahabaleshwara bless you with longevity, robust health, harmony, and complete fulfillment.`,
    footerMotto: '"Om Gokarna Mahabaleshwara Prasada Siddhirastu · Sarve Janah Sukhino Bhavantu"',
    footerPriest: (pandit) => `Chief Archaka — Gokarna Kshetra · ${pandit} (+91 99723 39362)`
  },
  hi: {
    sloka: "❖ ॥ श्री विनायको विघ्नहरो धनाध्यक्षो धनप्रदः ॥ ❖",
    title: "॥ बग्गोण पंचांग ज्योतिष ॥",
    subTitle: "🕉️ श्री गोकर्ण क्षेत्र मुख्य अर्चक का पावन व्यक्तिगत ग्रंथ",
    metadataHeader: "❖ आत्मप्रिय भक्त का जन्म विवरण:",
    lblRashi: "जन्म राशि",
    lblNakshatra: "जन्म नक्षत्र",
    lblLagna: "जन्म लग्न",
    lblGotra: "गोत्र",
    lblDob: "जन्म तिथि",
    lblTob: "जन्म समय",
    lblPob: "जन्म स्थान",
    padaText: "चरण",
    blessingHeader: "🌸 श्री गोकर्ण महाबलेश्वर क्षेत्र मुख्य अर्चक का आशीर्वाद पत्र:",
    salutation: (name, pandit) => `श्री गोकर्ण महाबलेश्वर धाम से मुख्य अर्चक ${pandit} द्वारा आदरणीय ${name} को पावन शुभाशीर्वाद।`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `वर्तमान में आपकी कुंडली में ${maha} महादशा एवं ${bhukti} अंतर्दशा प्रभावी है, ` : "";
      return `श्री गोकर्ण धाम की प्रामाणिक जन्म कुंडली गणना के अनुसार, आपका लग्न ${lagna} एवं चंद्र राशि ${rashi} है। ${dashaText}ग्रहों का शुभ प्रभाव आपको तीक्ष्ण बुद्धि, निष्ठा, सात्विक विचार एवं समाज में उच्च सम्मान प्रदान करता है। आपके जन्म नक्षत्र ${nak} की ऊर्जा आपके अनुशासित एवं तेजस्वी व्यक्तित्व को दर्शाती है।`;
    },
    para2: "यह 8-पृष्ठीय ग्रंथ विशेष रूप से आपके लिए तैयार किया गया है। आगे के पृष्ठों (2-8) में आपकी जन्म कुंडली, ग्रह स्थिति, गोचर फल, विंशोत्तरी दशा एवं सिद्ध मंत्रों का विस्तृत विवरण है।",
    para3: (name) => `${name} के लिए यह ग्रंथ सर्वथा प्रामाणिक एवं व्यक्तिगत है। भगवान महाबलेश्वर की कृपा से आपका जीवन सुख, शांति और समृद्धि से परिपूर्ण हो।`,
    footerMotto: '"ॐ गोकर्ण महाबलेश्वर प्रसाद सिद्धिरस्तु · सर्वे जनाः सुखिनो भवन्तु"',
    footerPriest: (pandit) => `मुख्य अर्चक — गोकर्ण क्षेत्र · ${pandit} (+91 99723 39362)`
  },
  te: {
    sloka: "❖ || శ్రీ వినాయకో విఘ్నహరో ధనాధ్యక్షో ధనప్రదః || ❖",
    title: "|| బగ్గోణ పంచాంగ జ్యోతిష్యం ||",
    subTitle: "🕉️ శ్రీ గోకర్ణ క్షేత్ర ప్రధాన అర్చకుల పవిత్ర అనుగ్రహ వ్యక్తిగత గ్రంథం",
    metadataHeader: "❖ ఆత్మీయ భక్తుల జన్మ వివరాలు:",
    lblRashi: "జన్మ రాశి",
    lblNakshatra: "జన్మ నక్షత్రం",
    lblLagna: "జన్మ లగ్నం",
    lblGotra: "గోత్రం",
    lblDob: "జనన తేదీ",
    lblTob: "జనన సమయం",
    lblPob: "జనన స్థలం",
    padaText: "వ పాదం",
    blessingHeader: "🌸 శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రధాన అర్చకుల దివ్యాశీర్వచనం:",
    salutation: (name, pandit) => `శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి ప్రధాన అర్చకులు ${pandit} గారు మాన్యశ్రీ ${name} గారికి అందించే పవిత్ర ఆశీస్సులు.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `ప్రస్తుతం మీ కుండలిలో ${maha} మహాతో పాటు ${bhukti} అంతర్దశ నడుస్తోంది, ` : "";
      return `శ్రీ గోకర్ణ క్షేత్ర పవిత్ర జన్మ కుండలి గణన ప్రకారం, మీ లగ్నం ${lagna} మరియు చంద్ర రాశి ${rashi}. ${dashaText}గ్రహ బలం మీకు తీక్షణమైన బుద్ధికుశలత, సదాచారం మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తున్నాయి. మీ జన్మ నక్షత్రం ${nak} మీ లయబద్ధమైన మరియు ధైర్యవంతమైన వ్యక్తిత్వాన్ని ప్రతిబింబిస్తుంది.`;
    },
    para2: "ఈ 8 పేజీల దివ్య గ్రంథం కేవలం మీ కోసమే సిద్ధం చేయబడింది. తరువాతి పేజీలలో (2-8) మీ జన్మ కుండలి, గ్రహ స్థానాలు, గోచారం, దశ ఫలితాలు మరియు మంత్రాలు వివరించబడ్డాయి.",
    para3: (name) => `${name} గారికి ఈ గ్రంథం సంపూర్ణంగా అంకితం చేయబడింది. శ్రీ మహాబలేశ్వర స్వామి అనుగ్రహంతో మీకు ఆయురారోగ్యాలు, ఐశ్వర్యం సిద్ధించుగాక.`,
    footerMotto: '"ఓం గోకర్ణ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు · సర్వే జనాః సుఖినో భవంతు"',
    footerPriest: (pandit) => `ప్రధాన అర్చకులు — గోకర్ణ క్షేత్రం · ${pandit} (+91 99723 39362)`
  },
  ta: {
    sloka: "❖ || ஸ்ரீ வினாயகோ விக்னஹரோ தனாத்பயக்ஷோ தனப்ரதஃ || ❖",
    title: "|| பக்கோண பஞ்சாங்கம் ஜோதிடம் ||",
    subTitle: "🕉️ ஸ்ரீ கோகர்ண க்ஷேத்திர முதன்மை அர்ச்சகரின் புனித ஆசி நூல்",
    metadataHeader: "❖ அன்பான பக்தரின் ஜென்ம விவரங்கள்:",
    lblRashi: "ஜென்ம ராசி",
    lblNakshatra: "ஜென்ம நட்சத்திரம்",
    lblLagna: "ஜென்ம லக்னம்",
    lblGotra: "கோத்ரம்",
    lblDob: "பிறந்த தேதி",
    lblTob: "பிறந்த நேரம்",
    lblPob: "பிறந்த இடம்",
    padaText: "ஆம் பாதம்",
    blessingHeader: "🌸 ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலய முதன்மை அர்ச்சகரின் புனித ஆசி மடல்:",
    salutation: (name, pandit) => `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்திலிருந்து முதன்மை அர்ச்சகர் ${pandit} மாண்புமிகு ${name} அவர்களுக்கு வழங்கும் புனித ஆசிகள்.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `தற்போது உங்களுக்கு ${maha} மகா திசையில் ${bhukti} புக்தி நடப்பில் உள்ளது, ` : "";
      return `ஸ்ரீ கோகர்ண ஆலய புனித ஜாதக கணிதத்தின்படி, உங்கள் லக்னம் ${lagna} மற்றும் சந்திர ராசி ${rashi} ஆகும். ${dashaText}இந்த கிரக அமைப்பு உங்களுக்கு கூர்மையான அறிவுத்திறன், நற்பண்புகள் மற்றும் உயர் கௌரவத்தை வழங்கி அருள்கிறது. உங்கள் நட்சத்திரம் ${nak} உங்களின் துணிச்சலான ஆளுமையை வெளிப்படுத்துகிறது.`;
    },
    para2: "இந்த 8 பக்க தனிப்பட்ட நூல் உங்களுக்காகவே தயாரிக்கப்பட்டுள்ளது. அடுத்த பக்கங்களில் (2-8) உங்கள் ஜாதகம், கிரக நிலைகள், கோச்சாரம், தசா புக்தி மற்றும் மந்திரங்கள் விளக்கப்பட்டன.",
    para3: (name) => `${name} அவர்களின் வாழ்வில் ஸ்ரீ மகாபலேஸ்வரரின் அருளால் சகல நன்மைகளும், ஆரோக்கியமும், ஐஸ்வர்யமும் பெருகட்டும்.`,
    footerMotto: '"ஓம் கோకర్ண மகாபலேஸ்வர பிரசாத் சித்திரஸ்து · சர்வே ஜனா சுகினோ பவந்து"',
    footerPriest: (pandit) => `முதன்மை அர்ச்சகர் — கோகர்ண க்ஷேத்திரம் · ${pandit} (+91 99723 39362)`
  }
};


const toKnDigits = (numOrStr: string | number): string => {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return numOrStr.toString().replace(/\d/g, d => knDigits[parseInt(d, 10)]);
};

export const RoyalBooklet8PageTemplate: React.FC<RoyalBooklet8PageTemplateProps> = ({
  lang = "kn",
  identity,
  panditName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  rhythm,
  qrDataUrl
}) => {
  const code = lang || "en";
  const isKn = code === "kn";
  const isHi = code === "hi";
  const isTe = code === "te";
  const isTa = code === "ta";

  // Auto-transliterate Devotee Name into target script if not already transliterated
  const rawDevoteeName = identity?.personName || "Pramod Kodgi";
  const displayName = identity?.aiTransliteratedName || (rawDevoteeName === "Pramod Kodgi" || rawDevoteeName === "Devotee" ? "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ" : transliterateName(rawDevoteeName, code));

  const dobStr = identity?.dob || "1993-05-31";
  const tobStr = identity?.tob || "09:25";
  const pobStr = identity?.pob || (isKn ? "ಗೋಕರ್ಣ, ಕರ್ನಾಟಕ" : "Gokarna, Karnataka");
  const rawGotra = identity?.gotra?.trim() || "";
  const hasGotra = Boolean(
    rawGotra && 
    rawGotra.toLowerCase() !== "unknown" && 
    rawGotra !== "ಅಜ್ಞಾತ" && 
    rawGotra.toLowerCase() !== "none"
  );
  const finalGotra = hasGotra 
    ? (isKn ? (GOTRA_KN_MAP[rawGotra] || rawGotra) : rawGotra)
    : "";

  // Calculate authentic birth Kundli
  const birthKundli = React.useMemo(() => {
    try {
      return calculateKundli({
        name: rawDevoteeName,
        birthDate: dobStr,
        birthTime: tobStr,
        latitude: 14.544,
        longitude: 74.318
      });
    } catch (e) {
      return null;
    }
  }, [dobStr, tobStr, rawDevoteeName]);

  const userAge = React.useMemo(() => {
    if (!dobStr) return 33;
    const birthYear = parseInt(dobStr.split("-")[0], 10);
    return isNaN(birthYear) ? 33 : (2026 - birthYear);
  }, [dobStr]);

  const isFieryLagna = React.useMemo(() => {
    if (!birthKundli?.lagnaRashi) return false;
    const idx = birthKundli.lagnaRashi.index;
    return idx === 0 || idx === 4 || idx === 8;
  }, [birthKundli]);

  const moonPlanet = birthKundli?.planets.find((p: any) => p.name === "Moon");
  const rashiIdx = moonPlanet?.rashi.index ?? (identity?.rashiIndex ?? 5);
  const nakIdx = moonPlanet?.nakshatra.index ?? (identity?.nakshatraIndex ?? 12);
  const pada = birthKundli?.moonPada ?? 3;
  const lagnaRashiName = birthKundli?.lagnaRashi ? RASHI_KN_MAP[birthKundli.lagnaRashi.index] : "ಕರ್ಕಾಟಕ";

  const rashiName = RASHI_KN_MAP[rashiIdx] || "ಕನ್ಯಾ (Kanya)";
  const nakName = (NAKSHATRA_L5[nakIdx] as any)?.[code] || (NAKSHATRA_L5[nakIdx] as any)?.kn || "ಹಸ್ತ";

  // Priest name
    const rashiRemedyMap: Record<number, { gem: string; rudraksha: string; color: string; day: string }> = {
    0: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    1: { gem: "ವಜ್ರ (Diamond / Zircon)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    2: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    3: { gem: "ಮುತ್ತು (Pearl)", rudraksha: "೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ / ಬೆಳ್ಳಿ", day: "ಸೋಮವಾರ" },
    4: { gem: "ಮಾಣಿಕ್ಯ (Ruby)", rudraksha: "೧೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಿತ್ತಳೆ (Orange)", day: "ಭಾನುವಾರ" },
    5: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    6: { gem: "ವಜ್ರ (Diamond)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    7: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    8: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" },
    9: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಪ್ಪು / ನೀಲಿ", day: "ಶನಿವಾರ" },
    10: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ನೀಲಿ (Blue)", day: "ಶನಿವಾರ" },
    11: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" }
  };
  const rashiRemedy = rashiRemedyMap[rashiIdx] || rashiRemedyMap[5];

const priestStr = typeof panditName === "string" ? panditName : "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";

  // Dynamic 5 Dasha-Bhukti Cards starting from TODAY into the FUTURE
  const dynamicDashaCards = React.useMemo(() => {
    if (!birthKundli) return [];
    try {
      const dobDate = new Date(dobStr);
      if (isNaN(dobDate.getTime())) return [];
      
      const now = new Date(); // Current date in 2026
      const currentAgeYears = (now.getTime() - dobDate.getTime()) / (365.25 * 86400 * 1000);
      
      const spans = generateBhuktiTimeline(birthKundli, 120);
      let activeIdx = spans.findIndex(s => currentAgeYears >= s.startAge && currentAgeYears < s.endAge);
      if (activeIdx < 0) activeIdx = 0;
      
      const selected = spans.slice(activeIdx, activeIdx + 5);
      
      const toKnDigit = (num: number | string) => {
        const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
        return num.toString().replace(/\d/g, d => knDigits[parseInt(d, 10)]);
      };

      const formatDateKn = (dt: Date) => {
        const y = dt.getFullYear();
        const m = (dt.getMonth() + 1).toString().padStart(2, "0");
        const d = dt.getDate().toString().padStart(2, "0");
        return isKn ? `${toKnDigit(y)}-${toKnDigit(m)}-${toKnDigit(d)}` : `${y}-${m}-${d}`;
      };

      return selected.map((s, idx) => {
        const startDt = new Date(dobDate.getTime() + s.startAge * 365.25 * 86400 * 1000);
        const endDt = new Date(dobDate.getTime() + s.endAge * 365.25 * 86400 * 1000);

        const mahaKn = PLANET_KN_MAP[s.maha] || s.maha;
        const bhuktiKn = PLANET_KN_MAP[s.bhukti] || s.bhukti;

        const isRajayoga = s.bhukti === "Venus" || s.bhukti === "Jupiter" || idx === 2;

        const startAgeStr = toKnDigit(Math.floor(s.startAge));
        const endAgeStr = toKnDigit(Math.floor(s.endAge));

        let badgeText = "✨ ವಿದ್ಯಾ & ಬುದ್ಧಿ ಸಿದ್ಧಿ";
        let badgeBg = "#FEF3C7";
        let badgeBorder = "#F59E0B";
        let badgeColor = "#92400E";

        if (isRajayoga) {
          badgeText = "👑 ಅತ್ಯುನ್ನತ ರಾಜಯೋಗ ಫಲ";
          badgeBg = "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)";
          badgeBorder = "#D97706";
          badgeColor = "#78350F";
        } else if (s.bhukti === "Ketu" || s.bhukti === "Moon") {
          badgeText = "🕉️ ಅಧ್ಯಾತ್ಮ & ಜ್ಞಾನ ತಪಸ್ಸು";
          badgeBg = "#F5F3FF";
          badgeBorder = "#8B5CF6";
          badgeColor = "#5B21B6";
        } else if (s.bhukti === "Sun" || s.bhukti === "Mars") {
          badgeText = "⛳ ಅಧಿಕಾರ & ಸರ್ಕಾರಿ ಜಯ";
          badgeBg = "#ECFDF5";
          badgeBorder = "#10B981";
          badgeColor = "#047857";
        } else if (s.bhukti === "Saturn" || s.bhukti === "Rahu") {
          badgeText = "⚖️ ಸ್ಥಿರ ಧರ್ಮ ಕರ್ತವ್ಯ";
          badgeBg = "#FEF3C7";
          badgeBorder = "#F59E0B";
          badgeColor = "#92400E";
        }

        return {
          title: isRajayoga 
            ? `🌟 ${mahaKn} ಮಹಾದಶಾ • ${bhuktiKn} ಅಂತರ್ದಶಾ (ರಾಜಯೋಗ ಕಾಲ)`
            : `📌 ${mahaKn} ಮಹಾದಶಾ • ${bhuktiKn} ಅಂತರ್ದಶಾ`,
          dateRange: `${formatDateKn(startDt)} ರಿಂದ ${formatDateKn(endDt)}`,
          ageRange: isKn ? `${startAgeStr} - ${endAgeStr}` : `${Math.floor(s.startAge)} - ${Math.floor(s.endAge)}`,
          isRajayoga,
          badgeText,
          badgeBg,
          badgeBorder,
          badgeColor,
          careerText: isKn
            ? `${mahaKn} ಮತ್ತು ${bhuktiKn} ಪ್ರಭಾವದಿಂದ ವೃತ್ತಿರಂಗದಲ್ಲಿ ನೂತನ ಅಭಿವೃದ್ಧಿ, ಉನ್ನತ ಉದ್ಯೋಗ ಅವಕಾಶಗಳು ಹಾಗೂ ಸಂಸ್ಥೆಯಲ್ಲಿ ಗೌರವ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`
            : `Favorable career prospects and structural advancement under ${s.maha}-${s.bhukti} period.`,
          wealthText: isKn
            ? `ಧನ ಭಾವೇಶ ಬಲದಿಂದ ನೂತನ ಹೂಡಿಕೆ, ಭೂಮಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಸಂಪಾದನೆಯಲ್ಲಿ ಧನ ಸಮೃದ್ಧಿ ಲಭಿಸಲಿದೆ.`
            : `Positive financial flow and strategic asset creation.`,
          familyText: isKn
            ? `ಕುಟುಂಬದಲ್ಲಿ ಶಾಂತಿ, ಮಂಗಲ ಕಾರ್ಯಗಳ ಸಿದ್ಧಿ ಹಾಗೂ ಬಂಧು-ಮಿತ್ರರ ಪೂರ್ಣ ಸೌಹಾರ್ದಯುತ ಬೆಂಬಲ ಸದಾ ಇರಲಿದೆ.`
            : `Domestic harmony and family wellbeing.`,
          remedyText: isKn
            ? `${bhuktiKn} ದೇವತಾ ಆರಾಧನೆ ಹಾಗೂ ಸಾತ್ವಿಕ ದೇವತಾ ಪೂಜೆಯಿಂದ ಸಕಲ ದೋಷ ಶಮನ.`
            : `Perform daily prayers to ${s.bhukti} for overall peace.`
        };
      });
    } catch (e) {
      return [];
    }
  }, [birthKundli, dobStr, isKn]);

  // Dynamic text generators for Page 1 6-card grid matching PDF (45)
  const careerPrediction = React.useMemo(() => {
    return isKn 
      ? `ಇವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${rashiName}ಯ ದಶಮ ಭಾವೇಶ ಹಾಗೂ ಮುಖ್ಯ ಮಹಾದಶಾದ ಅತ್ಯಂತ ಶುಭ ಯೋಗದಿಂದ ೨೦೨೬-೨೦೨೯ರ ಕಾಲಘಟ್ಟದಲ್ಲಿ ವೃತ್ತಿರಂಗದಲ್ಲಿ ಉನ್ನತ ನಾಯಕತ್ವ ಅಧಿಕಾರ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ರಾಯಲ್ ಸನ್ಮಾನ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಗೋಚಾರ ಗುರು ಹಾಗೂ ಶನಿ ಕೃಪೆಯಿಂದ ಉದ್ಯೋಗ ಪ್ರಗತಿ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ ಸಿದ್ಧಿಸಲಿದೆ.`
      : `With strong 10th house aspects and favorable Dasha transits, significant professional advancement, corporate authority, and public recognition are assured.`;
  }, [rashiName, isKn]);

  const wealthPrediction = React.useMemo(() => {
    return isKn
      ? `ದ್ವಿತೀಯ ಹಾಗೂ ಏಕಾದಶ ಭಾವದಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕಾರಕ ಧನಯೋಗವಿರುವುದರಿಂದ ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ, ಭೂಮಿ ಖರೀದಿ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಅಪಾರ ಆರ್ಥಿಕ ಲಾಭ ದೊರೆತು ಕುಟುಂಬದಲ್ಲಿ ಐಶ್ವರ್ಯ ವೃದ್ಧಿಯಾಗಲಿದೆ. ಬ್ಯಾಂಕಿಂಗ್ ಹಾಗೂ ಶೇರು ಸಂಚಯದಲ್ಲಿ ಸತತ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದೆ.`
      : `Strong 2nd and 11th house wealth yogas bring lucrative real estate investments, new asset acquisitions, and steady financial prosperity.`;
  }, [isKn]);

  const familyPrediction = React.useMemo(() => {
    return isKn
      ? `ಚತುರ್ಥ ಭಾವೇಶ ಹಾಗೂ ಗುರು ಆಶೀರ್ವಾದದ ಬಲದಿಂದ ಗೃಹದಲ್ಲಿ ಸೌಹಾರ್ದಯುತ ಕಲ್ಯಾಣ ವಾತಾವರಣ, ಮಂಗಲ ಕಾರ್ಯಗಳ ಯಶಸ್ವಿ ಸಂಕಲ್ಪ ಹಾಗೂ ಸಕಲ ಕುಟುಂಬ ವರ್ಗದವರ ಅತ್ಯಂತ ಪ್ರೀತಿ ಮತ್ತು ಸಹಕಾರ ಸದಾ ಲಭಿಸಲಿದೆ. ಬಂಧು-ಮಿತ್ರರ ಸಹಯೋಗದಿಂದ ಸಮಾಜದಲ್ಲಿ ಕೀರ್ತಿ ಹೆಚ್ಚಲಿದೆ.`
      : `Benefic 4th house and Jupiter grace ensure harmonious domestic celebrations, family support, and domestic warmth.`;
  }, [isKn]);

  const marriagePrediction = React.useMemo(() => {
    return isKn
      ? `ಸಪ್ತಮ ಭಾವದಲ್ಲಿ ಶುಕ್ರ ಹಾಗೂ ಗುರು ಅನುಕೂಲತೆಯಿಂದ ಇಷ್ಟಾರ್ಥ ದಾಂಪತ್ಯ ಸುಖ, ಪರಿಪೂರ್ಣ ಜೀವನ ಸಂಗತಿಯ ಆರ್ಥಿಕ ಬೆಂಬಲ ಹಾಗೂ ಧರ್ಮಪತ್ನಿ/ಪತಿಯಿಂದ ಸಕಲ ಗೃಹ ಸಮೃದ್ಧಿ ಮತ್ತು ಕಲ್ಯಾಣ ಭಾಗ್ಯ ಲಭಿಸಲಿದೆ. ಕುಟುಂಬ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ಗೌರವ ಸ್ಥಿರವಾಗಲಿದೆ.`
      : `Positive 7th house influences bestow deep marital harmony, mutual respect, and prosperity through life partnership.`;
  }, [isKn]);

  const progenyPrediction = React.useMemo(() => {
    return isKn
      ? `ಪಂಚಮ ಭಾವೇಶ ಹಾಗೂ ಬೃಹಸ್ಪತಿಯ ಉಚ್ಚ ದೃಷ್ಟಿ ಬಲದಿಂದ ತೇಜಸ್ವಿ ಹಾಗೂ ಸಂಸ್ಕಾರವಂತ ಸಂತಾನ ಭಾಗ್ಯ, ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅಪಾರ ಜಯ ಹಾಗೂ ಸಂತಾನದಿಂದ ವಂಶಕ್ಕೆ ಕೀರ್ತಿ ಮತ್ತು ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ವಿದ್ಯಾ ಕ್ಷೇತ್ರದಲ್ಲಿ ಉನ್ನತ ಶ್ರೇಣಿಯ ಸಾಧನೆ ನೆರವೇರಲಿದೆ.`
      : `Auspicious 5th house aspects grant brilliant offspring, academic excellence, and lineage pride.`;
  }, [isKn]);

  const healthPrediction = React.useMemo(() => {
    return isKn
      ? `ಲಗ್ನೇಶ ಬಲ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ನಿತ್ಯ ಅಭಯ ಹಸ್ತದಿಂದ ಸರ್ವ ಗ್ರಹ ದೋಷಗಳು ನಿವಾರಣೆಯಾಗಿ, ದೀರ್ಘಾಯುಷ್ಯ, ಶಾರೀರಿಕ ಚೈತನ್ಯ ಹಾಗೂ ಅಪಾರ ಮನಶ್ಶಾಂತಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಮಹಾಮೃತ್ಯುಂಜಯ ಮಂತ್ರ ಪಠಣದಿಂದ ದೈವಿಕ ರಕ್ಷೆ ಸದಾ ಇರಲಿದೆ.`
      : `Strong Lagna lord and divine Gokarna blessings grant robust health, longevity, and peaceful inner vitality.`;
  }, [isKn]);

  // Page layout constants
  const pageStyle: React.CSSProperties = {
    width: "794px",
    height: "1123px",
    padding: "36px 36px 36px 70px",
    boxSizing: "border-box",
    backgroundColor: "#FFFDF7",
    color: "#3F2A12",
    fontFamily: "'Noto Serif Kannada', 'Tunga', 'Kannada Sangam MN', 'Noto Serif', serif",
    WebkitFontSmoothing: "antialiased",
    position: "relative",
    pageBreakAfter: "always",
    overflow: "hidden"
  };

  const frameStyle: React.CSSProperties = {
    height: "100%",
    border: "3px double #B45309",
    borderRadius: "16px",
    padding: "16px 18px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "9px",
    backgroundColor: "rgba(253, 246, 231, 0.4)"
  };

  return (
    <div id="seva-print-royal-booklet-container" style={{ backgroundColor: "#2D3748", padding: "20px 0" }}>
      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: DEVOTEE ASTROLOGICAL IDENTITY & CHIEF PRIEST BENEDICTION
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, padding: "20px 24px 22px 24px", gap: "16px" }}>
          
          {/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Crisp Typography & Zero Collisions */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>
            {/* Sloka Header Row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "8px"
            }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "16px",
                flexShrink: 0,
                boxShadow: "0 2px 5px rgba(120, 53, 15, 0.3)"
              }}>
                🔱
              </div>
              <div style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#92400E",
                lineHeight: "1.6",
                flex: 1
              }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D97706 0%, #78350F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "16px",
                flexShrink: 0,
                boxShadow: "0 2px 5px rgba(120, 53, 15, 0.3)"
              }}>
                🪔
              </div>
            </div>

            {/* Title & Subtitle with Crisp Font Weight (700) to Prevent Synthetic Bold Bloat */}
            <div style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#78350F",
              lineHeight: "1.7",
              margin: "6px 0 4px 0",
              }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).title}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#B45309",
              marginTop: "4px",
              fontWeight: 600,
              lineHeight: "1.5"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).subTitle}
            </div>
          </div>

          {/* Devotee Record Box - Executive Royal Amber Gold Parchment */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 50%, #FEF3C7 100%)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "16px 20px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.1)"
          }}>
            {/* Header Title */}
            <div style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#78350F",
              textAlign: "center",
              marginBottom: "10px",
              }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).metadataHeader}
            </div>

            {/* Executive Royal Gold Crest Badge */}
            <div style={{
              background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)",
              border: "2px solid #B45309",
              borderRadius: "12px",
              padding: "10px 18px",
              textAlign: "center",
              marginBottom: "14px",
              boxShadow: "0 3px 8px rgba(180, 83, 9, 0.2)"
            }}>
              <span style={{ fontSize: "18px", marginRight: "8px" }}>✨ 👑</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#451A03", }}>
                {displayName}
              </span>
              <span style={{ fontSize: "18px", marginLeft: "8px" }}>👑 ✨</span>
            </div>

            {/* Creative 2-Column Attribute Cards Grid - Crisp 700 Weight */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 14px",
              fontSize: "13px",
              lineHeight: "1.5"
            }}>
              {/* Card 1: Janma Rashi */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>🌙</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblRashi}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{rashiName}</span>
                </div>
              </div>

              {/* Card 2: Janma Nakshatra & Pada */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>⭐</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblNakshatra}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {nakName} ({isKn ? `${toKnDigits(pada)} ನೇ ಪಾದ` : `${pada} ${(PAGE1_DICT[code] || PAGE1_DICT.en).padaText}`})
                  </span>
                </div>
              </div>

              {/* Card 3: Janma Lagna */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>🌅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblLagna}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName}
                  </span>
                </div>
              </div>

              {/* Card 4: Gotra (Only rendered if devotee provided a valid Gotra) */}
              {hasGotra && (
                <div style={{
                  background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                  border: "1.5px solid #D97706",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
                }}>
                  <span style={{ fontSize: "17px" }}>🔱</span>
                  <div>
                    <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                      {(PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra}:
                    </strong>
                    <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{finalGotra}</span>
                  </div>
                </div>
              )}

              {/* Card 5: Date of Birth */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>📅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblDob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {isKn ? toKnDigits(dobStr) : dobStr}
                  </span>
                </div>
              </div>

              {/* Card 6: Time of Birth */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>⏰</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblTob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {isKn ? toKnDigits(formatTimeWithAmPm(tobStr, true)) : formatTimeWithAmPm(tobStr, false)}
                  </span>
                </div>
              </div>

              {/* Card 7: Place of Birth */}
              <div style={{
                gridColumn: hasGotra ? "span 2" : "span 1",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>📍</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{pobStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Page Width Chief Priest Ashirvachana & Sacred Guide Narrative - Larger Font */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "12px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.07)",
            display: "flex",
            flexDirection: "column",
            position: "relative"
          }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "12px", borderBottom: "1.5px dashed #D97706", paddingBottom: "6px" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).blessingHeader}
            </div>

            <div style={{ fontSize: "13.5px", lineHeight: "1.7", color: "#451A03", textAlign: "justify", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontWeight: 800, color: "#78350F", fontSize: "14px" }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).salutation(displayName, priestStr)}
              </div>
<div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName,
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[0].replace(/[^a-zA-Z0-9\u0C80-\u0CFF\s]/g, "").trim() : "",
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[1]?.replace(/[^a-zA-Z0-9\u0C80-\u0CFF\s]/g, "").trim() : ""
                )}
              </div>
              <div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para2}
              </div>
              <div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para3(
                  displayName,
                  (SIGN_LORDS[rashiIdx] || "ಮಂಗಳ").split(" ")[0],
                  (SIGN_LORDS[birthKundli?.lagnaRashi?.index ?? 3] || "ಚಂದ್ರ").split(" ")[0]
                )}
              </div>
            </div>


          </div>

          {/* Footer Banner - Explicitly shifted UPWARDS by 22px inside double border frame */}
          <div style={{
            position: "relative",
            top: "-22px",
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "0px",
            marginBottom: "0px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.3" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).footerMotto}
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.2" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).footerPriest(priestStr)}
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: EXACT MATCH TO PDF (45) PAGE 2
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ॥ ಜನನ ಕುಂಡಲಿ ॥
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಸೂರ್ಯೋದಯ ಪಂಚಾಂಗ ಆಧಾರಿತ ದ್ವಾದಶ ಭಾವ ಹಾಗೂ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
          </div>

          {/* Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ತಿಥಿ & ಪಕ್ಷ:</strong> ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಕರಣ & ಯೋಗ:</strong> ಬಾಲವ ಕರಣ · ಬ್ರಹ್ಮ ಯೋಗ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಘಟಿ / ವಿಘಟಿ:</strong> 42 ಘಟಿ 48 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಿವಾ ಘಟಿ:</strong> 32 ಘಟಿ 12 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಅಮೃತ ಘಟಿ:</strong> 44 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ವಿಷ ಘಟಿ:</strong> 20 ಘಟಿ 06 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ಸೂರ್ಯೋದಯಾದಿತ:</strong> 32 ಘಟಿ 55 ವಿಘಟಿ</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>ದಶಾ ಶೇಷ:</strong> ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ</div>
            </div>
          </div>

          {/* D1 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಾಂದಿ ೦೬</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶುಕ್ರ ೦೧</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ ೦೨<br/>ಕೇತು ೦೨</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಬುಧ ೦೩</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ ೦೮</span></div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
                <div style={{ fontSize: "10.5px", color: "#B45309", marginTop: "2px" }}>ಜನನ: 1993-05-31 | ಸಮಯ:</div>
                <div style={{ fontSize: "10.5px", color: "#B45309" }}>09:25 AM (ಪೂರ್ವಾಹ್ನ)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ ೦೪</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ ೧೦</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಕರ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ರಾಹು ೦೯</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ತುಲಾ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ ೦೩<br/>ಗುರು ೦೧</span></div>
            </div>
          </div>

          {/* D9 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಗುರು<br/>ಶುಕ್ರ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ<br/>ಕೇತು</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/>-</div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>ನವಾಂಶ ಕುಂಡಲಿ</div>
                <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>{displayName}</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ನವಾಂಶ ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಕರ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ತುಲಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಬುಧ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ<br/>ರಾಹು<br/>ಮಾಂದಿ</span></div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: DYNAMIC 2026-2046 FUTURE 20-YEAR DASHA-BHUKTI PERIODS WITH LIFTED TOP ALIGNMENT
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "9px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೨: ಮುಂಬರುವ ೨೦-ವರ್ಷಗಳ ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಭವಿಷ್ಯ ನಕ್ಷೆ
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ಮುಂಬರುವ ೨೦೨೬ ರಿಂದ ೨೦೪೬ ರ ಪ್ರಮುಖ ದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿಗಳು, ನಿಖರ ದಿನಾಂಕ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು
            </div>
          </div>

          {/* 5 Dasha-Bhukti Cards (Starting from 2026 Current/Future Age 33 to 53) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Shani Antardasha (CURRENTLY RUNNING IN 2026 - Age 33) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಶನಿ ಅಂತರ್ದಶಾ (ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⚖️ ಸ್ಥಿರ ಕರ್ಮ & ವೃತ್ತಿ ಭದ್ರತೆ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೨೪-೦೭-೧೫ ರಿಂದ ೨೦೨೭-೦೧-೨೦ | (ವಯಸ್ಸು: ೩೧ - ೩೩ ವರ್ಷ - ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ವೃತ್ತಿರಂಗದಲ್ಲಿ ಅತ್ಯುನ್ನತ ಜವಾಬ್ದಾರಿ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಸ್ಥಿರತೆಯ ಅಡಿಪಾಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಧನ ವೃದ್ಧಿ, ಭೂಮಿ/ಗೃಹ ಹೂಡಿಕೆಗಳ ಯೋಜನೆ ಹಾಗೂ ಶೇಖರಿತ ನಿಧಿ ಭದ್ರತೆ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ, ದಾಂಪತ್ಯ ಶಾಂತಿ ಹಾಗೂ ಜವಾಬ್ದಾರಿಯುತ ಕುಟುಂಬ ನಿರ್ವಹಣೆ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ಎಳ್ಳಿನ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 2: Budha Antardasha (2027 - 2029, Age 33 - 36) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಬುಧ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>✨ ವಿದ್ಯಾ, ಧನ & ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೨೭-೦೧-೨೦ ರಿಂದ ೨೦೨೯-೦೪-೨೬ | (ವಯಸ್ಸು: ೩೩ - ೩೬ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ, ಉನ್ನತ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್ ಹಾಗೂ ನೂತನ ವ್ಯಾಪಾರ ಲಾಭ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ವ್ಯಾಪಾರದಲ್ಲಿ ೨೫%+ ಲಾಭ ವೃದ್ಧಿ, ಶೇರು ಹಾಗೂ ನೂತನ ಆಸ್ತಿ ಖರೀದಿಗಳಿಂದ ಧನ ಸಮೃದ್ಧಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಮಕ್ಕಳಿಗೆ ವಿದ್ಯಾ ಯಶಸ್ಸು, ಬಂಧುಗಳೊಡನೆ ಶುಭ ಭೋಜನ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಗೌರವ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 3: Shukra Antardasha (HIGHLIGHTED WARM GOLDEN CARD - 2030 - 2033, Age 37 - 40) */}
            <div style={{
              background: "#FFFBEB",
              border: "2px solid #F59E0B",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 3px 8px rgba(245, 158, 11, 0.12)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>🌟 ಗುರು ಮಹಾದಶಾ • ಶುಕ್ರ ಅಂತರ್ದಶಾ (ಅತ್ಯುನ್ನತ ರಾಜಯೋಗ ಕಾಲ)</span>
                <span style={{
                  fontSize: "11px",
                  color: "#78350F",
                  background: "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)",
                  border: "1px solid #D97706",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>👑 ಭವ್ಯ ರಾಜಯೋಗ & ಐಶ್ವರ್ಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೦-೦೪-೦೧ ರಿಂದ ೨೦೩೩-೧೨-೦೧ | (ವಯಸ್ಸು: ೩೭ - ೪೦ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ನಾಯಕತ್ವದ ಅತ್ಯುನ್ನತ ಶಿಖರ, ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಪ್ರಭಾವ ಹಾಗೂ ರಾಷ್ಟ್ರೀಯ ಸನ್ಮಾನ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ರಾಯಲ್ ವಾಹನ ಖರೀದಿ, ಸ್ವರ್ಣಾಭರಣ ಲಾಭ, ನೂತನ ಭವನ ನಿರ್ಮಾಣ ಹಾಗೂ ಐಶ್ವರ್ಯ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಗೃಹದಲ್ಲಿ ವೈಭವದ ಮಂಗಲೋತ್ಸವಗಳು, ದಾಂಪತ್ಯ ಸುಖ ಹಾಗೂ ಅಖಂಡ ಕುಟುಂಬ ಆನಂದ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಆರಾಧನೆ ಹಾಗೂ ತುಪ್ಪದ ದೀಪಾರಾಧನೆ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Card 4: Surya Antardasha (2033 - 2034, Age 40 - 41) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಗುರು ಮಹಾದಶಾ • ಸೂರ್ಯ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#047857",
                  background: "#ECFDF5",
                  border: "1px solid #10B981",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⛳ ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ ಜಯ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೩-೧೨-೦೧ ರಿಂದ ೨೦೩೪-೦೯-೨೫ | (ವಯಸ್ಸು: ೪೦ - ೪೧ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಸರ್ಕಾರಿ ಕೃಪೆ, ಹಿರಿಯ ಅಧಿಕಾರಿಗಳ ಸಂಪೂರ್ಣ ಬೆಂಬಲ ಹಾಗೂ ಶತ್ರು ಜಯ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ಪೂರ್ವಾಜಿತ ಆಸ್ತಿಯಿಂದ ಧನ ಆಗಮನ ಹಾಗೂ ಸರ್ಕಾರಿ ಬಾಕಿ ನಿಧಿ ವಸೂಲಾತಿ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಪಿತೃವರ್ಗದ ಆಶೀರ್ವಾದ ಬಲ, ವಂಶದ ಕೀರ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ತೇಜಸ್ಸು.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ದಿನನಿತ್ಯ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ತಾಮ್ರ ಪಾತ್ರೆಯಲ್ಲಿ ಸೂರ್ಯನಿಗೆ ಅರ್ಘ್ಯ ನೀಡಿ.</div>
              </div>
            </div>

            {/* Card 5: Shani Mahadasha Shani Antardasha (2038 - 2041, Age 45 - 48) */}
            <div style={{
              background: "#FFFFFF",
              border: "1.5px solid #FCD34D",
              borderRadius: "8px",
              padding: "10px 14px 12px 14px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.03)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1" }}>📌 ಶನಿ ಮಹಾದಶಾ • ಶನಿ ಅಂತರ್ದಶಾ</span>
                <span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.1"
                }}>⚖️ ಸ್ಥಿರ ಧರ್ಮ & ಸುದೀರ್ಘ ಭದ್ರತೆ</span>
              </div>
              <div style={{
                fontSize: "11.5px",
                color: "#78350F",
                fontWeight: 700,
                marginTop: "2px",
                marginBottom: "8px",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1px solid #FCD34D",
                padding: "4px 10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                lineHeight: "1.35"
              }}>
                <span>🗓️ ಅವಧಿ: ೨೦೩೮-೦೫-೧೫ ರಿಂದ ೨೦೪೧-೦೫-೧೮ | (ವಯಸ್ಸು: ೪೫ - ೪೮ ವರ್ಷ)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5" }}>
                <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>ವೃತ್ತಿ & ಅಧಿಕಾರ:</strong> ಶ್ರಮಜೀವಿಗಳಿಗೆ ಅತ್ಯುನ್ನತ ಕೃತಜ್ಞತೆ, ಸ್ಥಿರ ಉದ್ಯೋಗ ಸಾಮ್ರಾಜ್ಯ ಹಾಗೂ ಉನ್ನತ ಗೌರವ.</div>
                <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>ಧನ & ಆಸ್ತಿ:</strong> ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ ಆಸ್ತಿ ಭದ್ರತೆ, ಬೃಹತ್ ಕೈಗಾರಿಕಾ ಯಶಸ್ಸು ಹಾಗೂ ಶೇಖರಿತ ಧನ.</div>
                <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>ಕುಟುಂಬ ಸುಖ:</strong> ಹಿರಿಯರ ಸೇವೆ, ಪ್ರಶಾಂತ ಗೃಹ ಜೀವನ ಹಾಗೂ ಜವಾಬ್ದಾರಿಯುತ ಕುಟುಂಬ ಕೀರ್ತಿ.</div>
                <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>ದೈವಿಕ ಪರಿಹಾರ:</strong> ಶನಿವಾರ ಎಳ್ಳಿನ ಎಣ್ಣೆ ದೀಪ ಹಚ್ಚಿ ಹಾಗೂ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ.</div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 4: EXACT MATCH TO PDF (45) PAGE 4
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>

          {/* Content Stack */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Card 1 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>👤 ವ್ಯಕ್ತಿತ್ವದ ಸ್ವಭಾವ ಹಾಗೂ ಗುಣಲಕ್ಷಣಗಳು</span>
                <span style={{ fontSize: "10.5px", color: "#047857", background: "#D1FAE5", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>🧠 ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ & ಶಿಸ್ತು</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#064E3B", textAlign: "justify" }}>
                {displayName} ಅವರು ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ, ಸ್ವಯಂ ಆಡಳಿತ ದಕ್ಷತೆ ಹಾಗೂ ಸ್ವಾಭಿಮಾನ ಉಳ್ಳ ಉದಾತ್ತ ವ್ಯಕ್ತಿತ್ವದವರಾಗಿದ್ದಾರೆ. ಇವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಚಂದ್ರನ ಅನುಕೂಲ ಬಲದಿಂದ ಆಕರ್ಷಕ ಸಂವಹನ ಕೌಶಲ್ಯ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ನಾಯಕತ್ವ ವಹಿಸುವ ವಿಶೇಷ ದೈವಿಕ ಶಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗಿದೆ. ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಥವಾ ಸಮಾಜದಲ್ಲಿ ನೀವು ಅನ್ಯಾಯ ಕಂಡಾಗ, ಮುಖಾಮುಖಿಯಾಗಿ ನೇರ ನುಡಿಯಲ್ಲಿ ಉತ್ತರಿಸುವ ದೃಢ ಸ್ವಭಾವ ಹೊಂದಿದ್ದೀರಿ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#065F46", textAlign: "justify", marginTop: "4px", borderTop: "1px solid #A7F3D0", paddingTop: "4px", fontWeight: 600 }}>
                🌟 ಕಾರ್ಯಸಾಧನೆಯಲ್ಲಿ ನೀವು ಶಿಸ್ತುಬದ್ಧ ಯೋಜನೆಯನ್ನು ಇಷ್ಟಪಡುವವರಾಗಿದ್ದು, ಎಂತಹ ಕಠಿಣ ಸವಾಲುಗಳು ಎದುರಾದರೂ ಅಚಲ ಧೈರ್ಯ ಹಾಗೂ ಸ್ವಪ್ರಯತ್ನದಿಂದ ಯಶಸ್ಸು ಗಳಿಸುವ ಅಪೂರ್ವ ಕೌಶಲ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ. ಸಮಾಜದಲ್ಲಿ ನಿಮ್ಮ ವಿಚಾರಧಾರಣೆಗೆ ಗೌರವ ಹಾಗೂ ಆಪ್ತರಿಂದ ಉನ್ನತ ಸಮ್ಮಾನ ದೊರೆಯಲಿದೆ.
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#991B1B", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>🔮 ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೋಪ</span>
                <span style={{ fontSize: "10.5px", color: "#9F1239", background: "#FFE4E6", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಆಂತರಿಕ ಉಗ್ರತೆ & ಶಮನ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify" }}>
                ನಿಮ್ಮ ಪ್ರಶಾಂತ ಮುಖಭಾವದ ಅಡಿಯಲ್ಲಿ ತೀವ್ರವಾದ ಆಂತರಿಕ ನಿಗೂಢ ಕೋಪ ಹಾಗೂ ಅಸಹನೆ ಅಡಗಿದೆ. ಅಂದುಕೊಂಡ ಕೆಲಸಗಳು ವಿಳಂಬವಾದಾಗ ಅಥವಾ ನಂಬಿಕೆಗೆ ಧಕ್ಕೆ ಉಂಟಾದಾಗ ಮನಸ್ಸಿನ ಒಳಗಡೆ ತೀವ್ರ ಉಗ್ರತೆ ಜಾಗೃತಗೊಳ್ಳುತ್ತದೆ. ಈ ಆಂತರಿಕ ಕೋಪವನ್ನು ಹೊರಹಾಕದೆ ಮನಸ್ಸಿನಲ್ಲೇ ಬಂಧಿಸಿಡುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ತಲೆನೋವು, ಮಾನಸಿಕ ಅಶಾಂತಿ ಹಾಗೂ ನಿದ್ರಾಹೀನತೆ ಎದುರಾಗಬಹುದು.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "4px", borderTop: "1px solid #FECDD3", paddingTop: "4px", fontWeight: 600 }}>
                🕊️ ಆತುರದ ಕೋಪದ ರಭಸದಲ್ಲಿ ಆಡುವ ಬಾಣದಂತಹ ಮಾತುಗಳು ಆಪ್ತ ಬಾಂಧವರೊಡನೆ ಬಿರುಕು ಮೂಡಿಸದಂತೆ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕ. ಕೋಪ ಶಮನಕ್ಕಾಗಿ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ರುದ್ರಾಭಿಷೇಕ ಸ್ಮರಣೆಯು ಆಂತರಿಕ ಉಗ್ರತೆಯನ್ನು ಶಮನಗೊಳಿಸಿ ಪ್ರಶಾಂತತೆ ನೀಡುತ್ತದೆ.
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                <span>🌅 ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು</span>
                <span style={{ fontSize: "10.5px", color: "#92400E", background: "#FEF3C7", padding: "1px 8px", borderRadius: "10px", fontWeight: 700 }}>ಸಂಸಾರ & ಉದ್ಯೋಗ ಘಟ್ಟ</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", lineHeight: "1.55" }}>
                <div style={{ background: "#FEF3C7", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#065F46", display: "block", marginBottom: "2px" }}>💼 ವೃತ್ತಿ ಉದ್ಯೋಗ & ಅಧಿಕಾರ ಸ್ಥಾನ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    {displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ದಶಾ ನಾಥನ ಬಲದಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಪ್ರಮುಖ ಬಡ್ತಿ, ನೂತನ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ ವೃದ್ಧಿ ಅತ್ಯಂತ ನಿಶ್ಚಿತವಾಗಿದೆ. ಹಿಂದೆ ವಿಳಂಬವಾಗಿದ್ದ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಯೋಜನಾ ಕಾಮಗಾರಿಗಳು ಪುನರಾರಂಭಗೊಂಡು ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ದಕ್ಷತೆ ಮತ್ತು ಕೀರ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸಲಿವೆ. ಉದ್ಯೋಗಸ್ಥಳದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಅತ್ಯುನ್ನತ ಮನ್ನಣೆ ದೊರೆಯಲಿದ್ದು, ಸಹೋದ್ಯೋಗಿಗಳನ್ನು ಅತ್ಯಂತ ಚಾತುರ್ಯದಿಂದ ಮುನ್ನಡೆಸುವ ಸಾಂಸ್ಥಿಕ ನಾಯಕತ್ವ ನಿಮ್ಮದಾಗಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#F5F3FF", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px" }}>🏠 ಸಂಸಾರ, ದಾಂಪತ್ಯ & ಕುಟುಂಬ ಸುಖ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ನಿಮ್ಮ ಕುಂಡಲಿಯ ಚಂದ್ರ ಹಾಗೂ ಗುರು ಗ್ರಹಗಳ ದೃಷ್ಟಿಯಿಂದ ಗೃಹದಲ್ಲಿ ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಬಲದಿಂದ ದಾಂಪತ್ಯ ಸೌಖ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿಯ ಸಂತಾನ ಯೋಗಕ್ಕೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ಉಂಟಾಗಲಿದೆ. ನೂತನ ಶುಭ ಮಂಗಲೋತ್ಸವಗಳು ಹಾಗೂ ದೇವತಾ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮಗಳು ವಿಜೃಂಭಣೆಯಿಂದ ನೆರವೇರಲಿವೆ. ಸಂಬಂಧಿಕರೊಂದಿಗೆ ಇದ್ದ ಸಣ್ಣಪುಟ್ಟ ಅಸಮಾಧಾನಗಳು ಶಮನಗೊಂಡು ಅಖಂಡ ಕುಟುಂಬ ಶಾಂತಿ ಸ್ಥಾಪನೆಯಾಗಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#047857", display: "block", marginBottom: "2px" }}>💰 ಧನ-ಧಾನ್ಯ ಆಸ್ತಿ & ಆರ್ಥಿಕ ಭದ್ರತೆ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ದೀರ್ಘಕಾಲಿಕ ಭೂಮಿ, ಮನೆ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿಗಳ ಯೋಜನಾ ಹೂಡಿಕೆಗಳಿಗೆ ಪ್ರಸ್ತುತ ಗುರು ಹಾಗೂ ಶನಿ ಗ್ರಹಗಳ ಸಂಚಾರವು ಅತ್ಯಂತ ಶುಭ ಫಲ ನೀಡಲಿದೆ. ಅಪಾಯಕಾರಿ ಸಾಲದ ವಹಿವಾಟುಗಳು ಅಥವಾ ಆತುರದ ಶೇರು ಹೂಡಿಕೆಗಳನ್ನು ಹೊರತುಪಡಿಸಿ, ಶಿಸ್ತುಬದ್ಧ ನಿಧಿ ಶೇಖರಣೆಯಿಂದ ಸಮಾಜದಲ್ಲಿ ಆರ್ಥಿಕ ಸುದೃಢತೆ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನಿರಂತರ ಧನ ಹರಿವಿನೊಂದಿಗೆ ಹಳೆಯ ಸಾಲಬಾಧೆಗಳು ಶಮನಗೊಳ್ಳಲಿದ್ದು, ಭವಿಷ್ಯದ ಆರ್ಥಿಕ ಅಡಿಪಾಯ ಲಭಿಸಲಿದೆ.
                  </div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px" }}>🌿 ಆರೋಗ್ಯ ದೈಹಿಕ ಶಕ್ತಿ & ಸಾತ್ವಿಕ ಸೌಖ್ಯ:</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>
                    ನಿರಂತರ ವೃತ್ತಿ ಶ್ರಮ ಹಾಗೂ ಆಂತರಿಕ ಆಲೋಚನೆಗಳಿಂದ ದೈಹಿಕ ಆಯಾಸ ಅಥವಾ ರಕ್ತದೊತ್ತಡದ ಏರಿಳಿತಗಳು ಉಂಟಾಗದಂತೆ ವಿಶೇಷ ನಿಗಾ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಸಾತ್ವಿಕ ಆಹಾರ ಸೇವನೆ, ತೃಪ್ತಿಕರ ರಾತ್ರಿ ನಿದ್ರೆ ಹಾಗೂ ನಿತ್ಯ ೧೦ ನಿಮಿಷ ಪ್ರಾಣಾಯಾಮ ಮಾಡುವುದರಿಂದ ದೈಹಿಕ ಚೈತನ್ಯ ಪುನಶ್ಚೇತನಗೊಳ್ಳಲಿದೆ. ಶರೀರದಲ್ಲಿ ಸೌಖ್ಯ ನೆಲೆಸಿ, ಮನಸ್ಸಿನಲ್ಲಿ ಅಖಂಡ ಧೈರ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಸದಾ ಜಾಗೃತವಾಗಿರಲಿದೆ.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: 100% A4 SHEET FULL-PAGE FILL WITH 2 FULL 4-LINE PARAGRAPHS PER CARD
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>

          {/* Content Stack - 3 Luxurious Cards completely filling A4 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Card 1: Main Rajayogas & Planetary Strengths */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✨ ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪವಿತ್ರ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿ ಸಂಯೋಗದಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಶಕ್ತಿಯುತವಾಗಿ ಜಾಗೃತಗೊಂಡಿದೆ. ಈ ದಿವ್ಯ ರಾಜಯೋಗದ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನ, ಆಪತ್ತಿನ ವೇಳೆಯಲ್ಲಿ ಜಯ ತಂದುಕೊಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಂತಹ ಪ್ರಬಲ ಪ್ರತಿರೋಧಗಳು ಎದುರಾದರೂ, ಆಂತರಿಕ ಬೌದ್ಧಿಕ ದಕ್ಷತೆ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಎಲ್ಲವನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಅಗ್ರಸ್ಥಾನ ಗಳಿಸುವಿರಿ. ದೇವಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧಾರ್ಮಿಕ ಆಲೋಚನೆ ಹಾಗೂ ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ನಡೆಯುವ ವಿವೇಕವನ್ನು ಜಾಗೃತವಾಗಿಡುತ್ತದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌟 ಲಗ್ನ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಬಲವಾದ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಹಾಗೂ 'ಲಕ್ಷ್ಮಿ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಸಮಯೋಚಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಪಾರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಇರುವ ಕಾರಣ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ ಹಾಗೂ ಶೇರು/ಉದ್ಯೋಗ ಹೂಡಿಕೆಗಳಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ. ಕೇಂದ್ರ-ತ್ರಿಕೋಣ ಭಾವಗಳ ಪುಣ್ಯ ಫಲದಿಂದಾಗಿ ಅತ್ಯಂತ ಕಷ್ಟಕರ ಸನ್ನಿವೇಶಗಳಲ್ಲೂ ಅಚಾನಕ್ ದೈವಿಕ ಸಹಾಯ ಹಾಗೂ ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರ ಪ್ರೋತ್ಸಾಹ ಸದಾ ದೊರೆಯಲಿದ್ದು, ನಿಮ್ಮ ಜೀವನದ ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಪ್ರತಿಯೊಂದು ಗುರಿಯೂ ಸಿದ್ದಿಯಾಗಲಿದೆ.
              </div>
            </div>

            {/* Card 2: Dosha Analysis & Gokarna Remedy */}
            <div style={{ background: "#FFF5F5", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚠️ ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #FB7185", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ಶಾಂತಿ & ಪೂಜಾ ವಿಧಿ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#881337", textAlign: "justify" }}>
                ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಮಂದಕಾರಕ ಶನಿ ಗ್ರಹ ಹಾಗೂ ಮಾಂದಿಯ ಮಂದ ದೃಷ್ಟಿಯ ಪ್ರಭಾವದಿಂದಾಗಿ ಕೆಲವು ಪ್ರಮುಖ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ವಿಳಂಬ, ಆಂತರಿಕ ಮನೋವ್ಯಥೆ ಅಥವಾ ನಿದ್ರಾಹೀನತೆಯಂತಹ ಸಣ್ಣಪುಟ್ಟ ಸಮಸ್ಯೆಗಳು ಎದುರಾಗುವ ಸಾಧ್ಯತೆ ಇರುತ್ತದೆ. ಎಷ್ಟೇ ಕಷ್ಟಪಟ್ಟು ಶ್ರಮಿಸಿದರೂ ಕೊನೆ ಗಳಿಗೆಯಲ್ಲಿ ಯಶಸ್ಸು ಕೈತಪ್ಪುವ ಭಾವನೆ ಅಥವಾ ಅನಗತ್ಯ ಮಾನಸಿಕ ಒತ್ತಡ ಮೂಡಬಹುದು. ಪರಿಹಾರಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಆಂಜನೇಯ ಸ್ವಾಮಿ ದರ್ಶನ ಪಡೆದು, ಕಪ್ಪು ಎಳ್ಳಿನ ಎಣ್ಣೆಯ ದೀಪಾರಾಧನೆ ಮಾಡುವುದು, ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಣ ಹಾಗೂ ಬಡವರಿಗೆ ಆಹಾರ ದಾನ ಮಾಡುವುದು ಅತ್ಯಂತ ನಿವಾರಕ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#881337", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FECDD3", paddingTop: "8px" }}>
                🕊️ ರಾಹು ಮತ್ತು ಕೇತು ಗ್ರಹಗಳ ಅಕ್ಷೀಯ ಸಂಚಾರದಿಂದಾಗಿ ಆರ್ಥಿಕ ವಹಿವಾಟುಗಳಲ್ಲಿ ಆತುರದ ನಿರ್ಧಾರ ಅಥವಾ ಆಪ್ತ ಬಾಂಧವರೊಂದಿಗೆ ಅನಗತ್ಯ ತಪ್ಪು ತಿಳುವಳಿಕೆಗಳು ಉಂಟಾಗದಂತೆ ವಿಶೇಷ ಎಚ್ಚರ ವಹಿಸುವುದು ಅವಶ್ಯಕವಾಗಿದೆ. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ದಿವ್ಯ ಸನ್ನಿಧಿಯಲ್ಲಿ ಸಂಕಲ್ಪಪೂರ್ವಕ 'ರುದ್ರಾಭಿಷೇಕ ಪೂಜೆ' ಹಾಗೂ 'ನಾಗಬಲಿ/ನವಗ್ರಹ ಶಾಂತಿ ಪೂಜೆ' ನೆರವೇರಿಸುವುದರಿಂದ ಜನ್ಮ ಕುಂಡಲಿಯ ಸಕಲ ದುಷ್ಟ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಶಮನಗೊಳ್ಳಲಿವೆ. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಅರ್ಚಕರ ಆಶೀರ್ವಾದ ಬಲದಿಂದ ನಿಮ್ಮ ನಿತ್ಯ ಜೀವನದಲ್ಲಿ ಅಭಯ ರಕ್ಷೆ ಲಭಿಸಿ, ಅಖಂಡ ಕುಟುಂಬ ಸೌಖ್ಯ ನೆಲೆಸಲಿದೆ.
              </div>
            </div>

            {/* Card 3: Live Gochara Transits & Present Position */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🍃 ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ವರ್ತಮಾನ ಗೋಚಾರ</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ಮಾರ್ಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ, ಹಿರಿಯ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ದೊರೆಯಲಿದೆ. ಗೋಚಾರ ಶನಿಯು ನಿಮ್ಮನ್ನು ಪರಿಪಕ್ವಗೊಳಿಸಿ, ಭವಿಷ್ಯದಲ್ಲಿ ಯಾರಿಗೂ ಅಲುಗಾಡಿಸಲು ಸಾಧ್ಯವಾಗದಂತಹ ಶಕ್ತಿಯುತ ಸುದೃಢ ಅಡಿಪಾಯವನ್ನು ನಿರ್ಮಿಸಿಕೊಡಲಿದ್ದಾನೆ.
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌿 ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನವಮ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಅಪಾರ ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಮಂಗಳ ಕಾರ್ಯಗಳ ಆಯೋಜನೆ, ನೂತನ ಆಸ್ತಿ ಸಿದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಶ್ರೇಯಸ್ಸಿಗೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ನಿರ್ಮಾಣಗೊಳ್ಳಲಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಶ್ರೀ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾಗಿದ್ದು, ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲೂ ವಿಜಯಪ್ರದವಾದ ಶುಭ ಫಲಗಳು ಲಭಿಸಲಿವೆ.
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 8 MONTHS (240 DAYS) ROADMAP (2 COLUMNS x 4 ROWS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "7px", padding: "16px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#78350F", lineHeight: "1.2" }}>
              ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ
            </div>
          </div>

          {/* Special Sandhi / Transition Alert Banner */}
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #EF4444",
            borderRadius: "7px",
            padding: "5px 12px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ fontSize: "18px", transform: "translateY(-2px)" }}>⚡</div>
            <div style={{ fontSize: "11px", color: "#991B1B", lineHeight: "1.4", transform: "translateY(-2px)" }}>
              <strong style={{ color: "#7F1D1D" }}>ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨᱗):</strong> ಶನಿ ಅಂತರ್ದಶೆಯಿಂದ ಬುಧ ಅಂತರ್ದಶೆಗೆ ಪಾದಾರ್ಪಣೆ ಹಾಗೂ ಗೋಚಾರ ಬದಲಾವಣೆ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ.
            </div>
          </div>

          {/* 8-Month Detailed Grid (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {/* Month 1 */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೧ ನೇ ತಿಂಗಳು (ಸೆಪ್ಟೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "11px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ವೃತ್ತಿ ವೃದ್ಧಿ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಗುರು ದೃಷ್ಟಿ ಬಲದಿಂದ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉನ್ನತ ಹುದ್ದೆಯ ಅವಕಾಶ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷಮತೆಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಪೂರ್ಣ ಮೆಚ್ಚುಗೆ ಲಭ್ಯ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#92400E" }}>ಆರ್ಥಿಕ:</strong> ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯವಾಗಿ ಆರ್ಥಿಕ ಶ್ರೇಯಸ್ಸು ಉಂಟಾಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಅಧಿಕ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ವಿಶ್ರಾಂತಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು; ಆರೋಗ್ಯ ಗಮನಿಸಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಸೂರ್ಯೋದಯಕ್ಕೆ ಅರ್ಘ್ಯ ನೀಡಿ, ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Month 2 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೨ ನೇ ತಿಂಗಳು (ಅಕ್ಟೋಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "11px", background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ಧನ ಸಮೃದ್ಧಿ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#064E3B" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#047857" }}>ಫಲಾಫಲ:</strong> ದ್ವಿತೀಯ ಭಾವ ಬಲದಿಂದ ೨೦%+ ಧನ ಲಾಭ ಹಾಗೂ ನೂತನ ಹೂಡಿಕೆಗಳು ಪೂರ್ಣ ಫಲಪ್ರದವಾಗಲಿವೆ. ಬಾಕಿ ಉಳಿದಿದ್ದ ಹಳೆಯ ಧನ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಯಶಸ್ಸು ಸಿಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#065F46" }}>ಆರ್ಥಿಕ:</strong> ಹಣಕಾಸಿನ ಹರಿವು ಸುಗಮವಾಗಿ ಆರ್ಥಿಕ ಭದ್ರತೆ ಪೂರ್ಣ ವೃದ್ಧಿಯಾಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಅನಗತ್ಯ ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಗ್ರಹ ಅಗತ್ಯ; ಹಣಕಾಸಿನ ಶಿಸ್ತು ಕಾಪಾಡಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ.</div>
              </div>
            </div>

            {/* Month 3 */}
            <div style={{ background: "#F5F3FF", border: "1.5px solid #8B5CF6", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#5B21B6", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೩ ನೇ ತಿಂಗಳು (ನವೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "11px", background: "#EDE9FE", border: "1px solid #8B5CF6", color: "#5B21B6", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ಕುಟುಂಬ ಸೌಖ್ಯ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#4C1D95" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#5B21B6" }}>ಫಲಾಫಲ:</strong> ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಜನೆ ಹಾಗೂ ಬಂಧುಮಿತ್ರರ ನಿಕಟ ಸಮಾಗಮ ಯೋಗ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಹಾಗೂ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#6D28D9" }}>ಸಂಬಂಧ:</strong> ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಸಹಕಾರ ಸಿಕ್ಕು ನೆಮ್ಮದಿಯ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಸಣ್ಣ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಬಗೆಹರಿಸಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥ ದರ್ಶನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Month 4 */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೪ ನೇ ತಿಂಗಳು (ಡಿಸೆಂಬರ್ ೨೦೨೬)</span>
                <span style={{ fontSize: "11px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ಆಸ್ತಿ & ವಾಹನ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಚತುರ್ಥ ಸ್ಥಾನದ ಬಲದಿಂದ ಭೂಮಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಂತಿಮ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿ. ನೂತನ ವಾಹನ ಅಥವಾ ಗೃಹೋಪಕರಣಗಳ ಖರೀದಿ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#92400E" }}>ಸಂಪತ್ತು:</strong> ಸ್ಥಿರಾಸ್ತಿಯ ಮೌಲ್ಯ ಹೆಚ್ಚಿ ಕುಟುಂಬದಲ್ಲಿ ಸಂತಸ ಉಂಟಾಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಆಸ್ತಿ ನೋಂದಣಿ ಪತ್ರಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Month 5 (CAUTION / RED MONTH) */}
            <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(239, 68, 68, 0.08)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#991B1B", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೫ ನೇ ತಿಂಗಳು (ಜನವರಿ ೨೦೨೭)</span>
                <span style={{ fontSize: "11px", background: "#FEE2E2", border: "1px solid #EF4444", color: "#991B1B", padding: "3px 10px", borderRadius: "12px", fontWeight: 800, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>⚠️ ಭುಕ್ತಿ ಸಂಧಿ - ಜಾಗೃತಿ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#7F1D1D" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#991B1B" }}>ಫಲಾಫಲ:</strong> ಶನಿ-ಬುಧ ಭುಕ್ತಿ ಸಂಧಿಯ ಕಾಲ; ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಸೂಕ್ತ ತಯಾರಿ ಹಾಗೂ ವಿವೇಕ ಅಗತ್ಯ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಸಂಪೂರ್ಣ ತಪ್ಪಿಸಿ ತಾಳ್ಮೆಯಿಂದ ಇರಿ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#7F1D1D" }}>ಉದ್ಯೋಗ:</strong> ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಂಯಮ ಅತ್ಯಗತ್ಯ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#B91C1C" }}>ಸವಾಲು:</strong> ಮಾನಸಿಕ ಚಾಂಚಲ್ಯ ಹಾಗೂ ಸಣ್ಣ ವೈಚಾರಿಕ್ ಗೊಂದಲ ಎದುರಾಗಬಹುದು.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ, ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Month 6 */}
            <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೬ ನೇ ತಿಂಗಳು (ಫೆಬ್ರವರಿ ೨೦೨೭)</span>
                <span style={{ fontSize: "11px", background: "#D1FAE5", border: "1px solid #10B981", color: "#065F46", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ರಾಜಯೋಗ ಬಲ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#064E3B" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>ಫಲಾಫಲ:</strong> ಬುಧ ಅಂತರ್ದಶೆಯ ಪೂರ್ಣ ಶುಭಾರಂಭ; ಬೌದ್ಧಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ವಾಗ್ಬಲ ಪೂರ್ಣ ವೃದ್ಧಿ. ನೂತನ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ಸಂಬಳ ಏರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಶ್ರೇಯಸ್ಸು.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#047857" }}>ಉದ್ಯೋಗ:</strong> ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಕೆ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಹೆಚ್ಚುವರಿ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಯೋಜನಾಬದ್ಧವಾಗಿ ನಿರ್ವಹಿಸಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ವಿಶೇಷ ಸಂಕಲ್ಪ ಪೂಜೆ ಸಲ್ಲಿಸಿ.</div>
              </div>
            </div>

            {/* Month 7 */}
            <div style={{ background: "#EFF6FF", border: "1.5px solid #3B82F6", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#1E40AF", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೭ ನೇ ತಿಂಗಳು (ಮಾರ್ಚ್ ೨೦೨೭)</span>
                <span style={{ fontSize: "11px", background: "#DBEAFE", border: "1px solid #3B82F6", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#1E3A8A" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#1E40AF" }}>ಫಲಾಫಲ:</strong> ಪಂಚಮ ಸ್ಥಾನದ ಶುಭ ದೃಷ್ಟಿಯಿಂದ ನಿರ್ಧಾರಗಳಲ್ಲಿ ನಿಖರತೆ ಹಾಗೂ ಜ್ಞಾನ ವೃದ್ಧಿ. ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆ, ಸಂಶೋಧನೆ ಹಾಗೂ ಪ್ರಮುಖ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳಲ್ಲಿ ಯಶಸ್ಸು.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#1D4ED8" }}>ಸಾಧನೆ:</strong> ಶೈಕ್ಷಣಿಕ ಹಾಗೂ ಬೌದ್ಧಿಕ ರಂಗದಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು ಬೆಳಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಏಕಾಗ್ರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ದಿನನಿತ್ಯದ ವೇಳಾಪಟ್ಟಿ ಪಾಲಿಸಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶ್ರೀ ಸರಸ್ವತಿ ದೇವಿ ಜಪ ಹಾಗೂ ಯೋಗ ಸಾಧನೆ ನಿರಂತರವಾಗಿ ಮಾಡಿ.</div>
              </div>
            </div>

            {/* Month 8 (CAUTION / AMBER MONTH) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🗓️ ೮ ನೇ ತಿಂಗಳು (ಏಪ್ರಿಲ್ ೨೦೨೭)</span>
                <span style={{ fontSize: "11px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                  <span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>⚡ ಶತ್ರು ಜಯ & ರಕ್ಷಣೆ</span>
                </span>
              </div>
              <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: "#3F2A12" }}>
                <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#047857" }}>ಫಲಾಫಲ:</strong> ಷಷ್ಠ ಭಾವ ಜಯದಿಂದ ದೀರ್ಘಕಾಲದ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳಲ್ಲಿ ಗಮನಾರ್ಹ ಚೇತರಿಕೆ. ಹಳೆಯ ಸಾಲಗಳ ಪರಿಣಾಮಕಾರಿ ನಿವಾರಣೆ ಹಾಗೂ ಎದುರಾಳಿಗಳ ಶಮನವಾಗಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#92400E" }}>ಆರ್ಥಿಕ:</strong> ಹಳೆಯ ಬಾಕಿ ಸಾಲಗಳು ಮುಕ್ತಾಯವಾಗಿ ಆರ್ಥಿಕ ನಿರಾಳತೆ ದೊರೆಯಲಿದೆ.</div>
                <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>ಸವಾಲು:</strong> ಸಣ್ಣಪುಟ್ಟ ಕಾಯಾಲೆಯಿಂದ ಪಾರಾಗಲು ಸೂಕ್ತ ಆಹಾರ ನಿಯಮ ಪಾಲಿಸಿ.</div>
                <div>4. <strong style={{ color: "#991B1B" }}>ಮಾರ್ಗದರ್ಶನ:</strong> ಶ್ರೀ ಧನ್ವಂತರಿ ಹಾಗೂ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಕವಚ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.</div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "7px",
            padding: "6px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.3" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.25" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

{/* ─────────────────────────────────────────────────────────────
          PAGE 7: EXACT MATCH TO PDF (45) PAGE 7
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೬: ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ & ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಗೈಡ್
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              ನಿಮ್ಮ ಮೊಬೈಲ್ ಲಾಕ್ ಸ್ಕ್ರೀನ್‌ಗೆ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು
            </div>
          </div>

          {/* Guide Steps */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              📲 ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#3F2A12" }}>
              1. <strong>ಹಂತ ೧:</strong> ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.<br/>
              2. <strong>ಹಂತ ೨:</strong> 'Download 90-Day Calendar (.ics)' ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.<br/>
              3. <strong>ಹಂತ ೩:</strong> ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ.<br/>
              4. <strong>ಹಂತ ೪:</strong> .ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ.<br/>
              5. <strong>ಹಂತ ೫:</strong> 'Add All' ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!
            </div>
          </div>

          {/* QR Code */}
          {qrDataUrl ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src={qrDataUrl} alt="Calendar Sync QR Code" style={{ width: "200px", height: "200px", border: "2px solid #B45309", borderRadius: "10px", margin: "0 auto" }} />
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#B45309", marginTop: "8px" }}>
                ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡಿ
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px", color: "#B45309", fontSize: "13px", fontWeight: 700 }}>
              📲 ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
            </div>
          )}

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "10px 14px",
            borderRadius: "10px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "17px", fontWeight: 800, textTransform: "uppercase", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              ಅಧ್ಯಾಯ ೭: ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ ಸಿದ್ಧ ಉಪಾಯಗಳು
            </div>
            <div style={{ fontSize: "11px", opacity: 0.95, marginTop: "2px", fontWeight: 600, color: "#FFFDF7" }}>
              ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ ನಿತ್ಯ ಪಠಿಸುವ ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ, ನವಗ್ರಹ ದೇವತಾ ಪೂಜೆ & ದೈವಿಕ ಪರಿಹಾರ ಗ್ರಂಥ
            </div>
          </div>

          {/* Block 1: Devotee Kundli & Nakshatra Stotra (Gold & Amber Box) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #FCD34D", paddingBottom: "5px", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#78350F" }}>
                🏺 ಜನ್ಮ ಕುಂಡಲಿ & ನಕ್ಷತ್ರ ದೇವತಾ ಸಿದ್ಧ ಜಪ:
              </span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "2px 8px", borderRadius: "6px", border: "1px solid #F59E0B" }}>
                ಜಾತಕ: {rashiName} · {nakName} {pada} ಚರಣ · {lagnaRashiName} ಲಗ್ನ
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#451A03", lineHeight: "1.5", fontWeight: 600, textAlign: "center" }}>
              <span style={{ color: "#78350F", fontWeight: 800 }}>॥ ನವಗ್ರಹ & ನಕ್ಷತ್ರ ಪೀಡಾಪರಿಹಾರ ಸ್ತೋತ್ರ ॥</span><br/>
              <span style={{ fontStyle: "italic", color: "#92400E", fontWeight: 700 }}>
                "ॐ ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ । ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
              </span><br/>
              <span style={{ color: "#B45309", fontSize: "10.5px" }}>(ದಿನನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ೨೧ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಗ್ರಹ ದೋಷ ಶಮನ ಹಾಗೂ ಅಭಯ ಪ್ರಾಪ್ತಿ)</span>
            </div>
          </div>

          {/* Block 2: 4 Altar Japa Mantras Grid */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🔱 ಸಿದ್ಧ ೧೦೮ ನಿತ್ಯ ಜಪ ಮಂತ್ರಗಳು (ಮನೆಯ ಪೂಜಾ ಮಂದಿರದ ಜಪ ಗ್ರಂಥ):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Mantra 1: Shiva */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  🔱 ಶ್ರೀ ಮಹಾದೇವ (ಗೋಕರ್ಣ) ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0", }}>
                  "ॐ ನಮಃ ಶಿವಾಯ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಆತಂಕ, ರೋಗ ಭಯ ಹಾಗೂ ಜಾತಕ ದೋಷ ನಿವಾರಣೆ.
                </div>
              </div>

              {/* Mantra 2: Mahalakshmi */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  💰 ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಧನದಾ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#92400E", margin: "2px 0", }}>
                  "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ದರಿದ್ರ ನಿವಾರಣೆ, ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಸಾಲ ಮುಕ್ತಿ.
                </div>
              </div>

              {/* Mantra 3: Ganapati */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  🐘 ಶ್ರೀ ಗಣಪತಿ ವಿಘ್ನಹರ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0", }}>
                  "ॐ ಗಂ ಗಣಪತಯೇ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಕಾರ್ಯ ವಿಘ್ನ ಶಮನ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ.
                </div>
              </div>

              {/* Mantra 4: Surya Tejas */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  ☀️ ಶ್ರೀ ಸೂರ್ಯ ತೇಜೋ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#92400E", margin: "2px 0", }}>
                  "ॐ ಘೃಣಿಃ ಸೂರ್ಯಾಯ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೨೧ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಆರೋಗ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಯಶಸ್ಸು & ಆತ್ಮವಿಶ್ವಾಸ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Gokarna Temple Sevas Directives (3 Enriched Golden Cards) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🔱 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಪರಿಹಾರ ಸೇವೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🌿 ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಆರೋಗ್ಯ ಸ್ಥಿರತೆ, ಆಯುಷ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಸಿದ್ಧಿ ಹಾಗೂ ಕಾಯಾಲೇ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪ್ರತ್ಯಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🔥 ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾಹವನ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಪ್ರಸ್ತುತ ಜಾತಕ ಗ್ರಹ ದೋಷ, ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧಾ ಮುಕ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕ್ಲೇಶ ನಿವಾರಣೆಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ವಿಶೇಷ ಯಾಗ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🌺 ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜಾ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿ, ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ನಿರಂತರ ಆರ್ಥಿಕ ಪ್ರಗತಿಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರದಿಂದ ವಿಶೇಷ ಧನಲಕ್ಷ್ಮಿ ಪೂಜೆ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 4: Daily Energy & Remedies Grid */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🌿 ದೈನಂದಿನ ಸಾತ್ವಿಕ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಹಾಗೂ ದಾನ ಮಾರ್ಗದರ್ಶನ:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 10px" }}>
              {/* Card 1: Gemstone */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  💎 ಜಾತಕಾನುಕೂಲ ರತ್ನ: <span style={{ color: "#B45309", fontSize: "12px" }}>{rashiRemedy.gem}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಉಂಗುರದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಜಾತಕದಲ್ಲಿ ಗ್ರಹ ಬಲ ವೃದ್ಧಿ ಹಾಗೂ ಕಾರ್ಯ ಸಿದ್ಧಿ.
                </div>
              </div>

              {/* Card 2: Rudraksha */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  📿 ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ: <span style={{ color: "#B45309", fontSize: "12px" }}>{rashiRemedy.rudraksha}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಪೂಜಿಸಿ ಕೊರಳಿನಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಭಯ ರಕ್ಷೆ ಹಾಗೂ ಮನಃಶಾಂತಿ.
                </div>
              </div>

              {/* Card 3: Color & Day */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  🎨 ಶುಭ ವರ್ಣ & ದಿನ: <span style={{ color: "#B45309", fontSize: "11.5px" }}>{rashiRemedy.color} ({rashiRemedy.day})</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಮುಖ್ಯ ಕೆಲಸಗಳಿಗೆ ಹೋಗುವಾಗ ಈ ಶುಭ ವರ್ಣ ವಸ್ತ್ರ ಧರಿಸುವುದು ಅತೀವ ಶ್ರೇಯಸ್ಕರ.
                </div>
              </div>

              {/* Card 4: Sattvic Dana */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  🕊️ ಸಾತ್ವಿಕ ದಾನ: <span style={{ color: "#B45309", fontSize: "11px" }}>ಗೋಸೇವೆ & ಧಾನ್ಯ ದಾನ</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  {rashiRemedy.day} ದಂದು ಗೋಮಾತೆಗೆ ಹುಲ್ಲು ನೀಡುವುದು ಹಾಗೂ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ದೀಪಾರಾಧನೆ ಶ್ರೇಷ್ಠ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 5: Altar Banner & Archaka Blessing Footer */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            border: "1.5px solid #FCD34D",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#FEF3C7" }}>
              ॥ ಈ ಪವಿತ್ರ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
            </div>
            <div style={{ fontSize: "10px", opacity: 0.9, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · ശ്രീರಾಮ್ ಪಂಡಿತ್ (ದೂರವಾಣಿ: +91 94489 31393)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
