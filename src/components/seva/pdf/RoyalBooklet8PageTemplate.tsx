import React from "react";
import { calculateKundli } from "../../../core/KundliEngine";
import { calculateTraditionalBaggona } from "../../../core/TraditionalBaggonaEngine";
import { generateBhuktiTimeline } from "../../../core/DashaBhuktiEngine";
import { NAKSHATRA_L5, RASHI_L5 } from "../../../features/seva/sevaLocale";
import { transliterateName } from "../../../utils/transliterator";
import { patrikaNavamshaFromDegree } from "../../../core/localeNumbers";

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

const GOTRA_L5_MAP: Record<string, Record<string, string>> = {
  vasistha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  vashistha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  vasishtha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  kashyapa: { kn: "ಕಶ್ಯಪ", en: "Kashyapa", hi: "कश्यप", te: "కశ్యప", ta: "கஸ்யப" },
  kasyapa: { kn: "ಕಶ್ಯಪ", en: "Kashyapa", hi: "कश्यप", te: "కశ్యప", ta: "கஸ்யப" },
  bharadwaja: { kn: "ಭಾರದ್ವಾಜ", en: "Bharadwaja", hi: "भारद्वाज", te: "భారద్వాజ", ta: "பாரத்வாஜ" },
  bharadwaj: { kn: "ಭಾರದ್ವಾಜ", en: "Bharadwaja", hi: "भारद्वाज", te: "భారద్వాజ", ta: "பாரத்வாஜ" },
  vishvamitra: { kn: "ವಿಶ್ವಾಮಿತ್ರ", en: "Vishvamitra", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்ர" },
  viswamitra: { kn: "ವಿಶ್ವಾಮಿತ್ರ", en: "Vishvamitra", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்ர" },
  gautama: { kn: "ಗೌತಮ", en: "Gautama", hi: "गौतम", te: "గౌతమ", ta: "கௌதம" },
  gautam: { kn: "ಗೌತಮ", en: "Gautama", hi: "गौतम", te: "గೌతమ", ta: "கௌதம" },
  jamadagni: { kn: "ಜಮದಗ್ನಿ", en: "Jamadagni", hi: "जमदग्नि", te: "జమదగ్ని", ta: "ஜமதக்னி" },
  atri: { kn: "ಅತ್ರಿ", en: "Atri", hi: "अत्रि", te: "అత్రి", ta: "அத்ரி" },
  agastya: { kn: "ಅಗಸ್ತ್ಯ", en: "Agastya", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்திய" },
  agasti: { kn: "ಅಗಸ್ತ್ಯ", en: "Agastya", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்திய" },
  harita: { kn: "ಹರೀತ", en: "Harita", hi: "हरीत", te: "హరీత", ta: "ஹரித" },
  srivatsa: { kn: "ಶ್ರೀವತ್ಸ", en: "Srivatsa", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச" },
  shandilya: { kn: "ಶಾಂಡಿಲ್ಯ", en: "Shandilya", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய" },
  kaundinya: { kn: "ಕೌಂಡಿನ್ಯ", en: "Kaundinya", hi: "कौंडिन्य", te: "కౌండిన్య", ta: "கௌண்டின்ய" },
  angirasa: { kn: "ಆಂಗೀರಸ", en: "Angirasa", hi: "आंगीरस", te: "ఆంగీరస", ta: "ஆங்கீரச" },
  bhargava: { kn: "ಭಾರ್ಗವ", en: "Bhargava", hi: "भार्गव", te: "భార్గవ", ta: "பார்கவ" },
  parashara: { kn: "ಪರಾಶರ", en: "Parashara", hi: "पराशर", te: "పరాశర", ta: "பராசர" },
  vatsa: { kn: "ವತ್ಸ", en: "Vatsa", hi: "वत्स", te: "వత్స", ta: "வத்ச" },
  garga: { kn: "ಗರ್ಗ", en: "Garga", hi: "गर्ग", te: "గర్గ", ta: "கர்க" },
  upamanyu: { kn: "ಉಪಮನ್ಯು", en: "Upamanyu", hi: "उपमन्यु", te: "ఉపమన్యు", ta: "உபமன்யு" }
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



const PAGE7_DICT: Record<string, {
  chapterTitle: string;
  subTitle: string;
  personalIntroHeader: string;
  personalIntroText: (name: string) => string;
  installHeader: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  qrCaption: string;
  urlRedirectHeader: string;
  urlRedirectText: (name: string) => string;
}> = {
  kn: {
    chapterTitle: "ಅಧ್ಯಾಯ ೬: ವೈಯಕ್ತಿಕ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ & ದೈವಿಕ ಸಿಂಕ್ ಮಾರ್ಗದರ್ಶಿ",
    subTitle: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಲಾಕ್ ಸ್ಕ್ರೀನ್‌ಗೆ ೯೦ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು",
    personalIntroHeader: "✨ ವೈಯಕ್ತಿಕ ಜಾತಕ ಆಧಾರಿತ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ವಿಶೇಷತೆ:",
    personalIntroText: (name) => `ಈ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ QR ಕೋಡ್ ಅನ್ನು ಕೇವಲ ${name} ಅವರಿಗಾಗಿಯೇ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜನ್ಮ ಜಾತಕ ಮತ್ತು ನವಗ್ರಹ ಗೋಚಾರ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿಯೊಂದು ದಿನಕ್ಕೂ (Each Day for Next 90 Days) ವೈಯಕ್ತಿಕವಾಗಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`,
    installHeader: "📲 ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:",
    step1: "ಹಂತ ೧: ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step2: "ಹಂತ ೨: ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ವೆಬ್‌ಸೈಟ್‌ಗೆ ರೀಡೈರೆಕ್ಟ್ ಆಗಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ .ics ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    step3: "ಹಂತ ೩: ಫೈಲ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆಯದಿದ್ದರೆ, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ.",
    step4: "ಹಂತ ೪: .ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ.",
    step5: "ಹಂತ ೫: 'Add All' / Save ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!",
    qrCaption: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡಿ",
    urlRedirectHeader: "🌐 ಕ್ಯಾಲೆಂಡರ್ ಈವೆಂಟ್ URL ಲಿಂಕ್ ರೀಡೈರೆಕ್ಷನ್ & ೪-ಟ್ಯಾಬ್ ದರ್ಶನ ಮಾರ್ಗದರ್ಶಿ:",
    urlRedirectText: (name) => `ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿರುವ ಪ್ರತಿಯೊಂದು ದಿನದ Event ಒಳಗಡೆ ಇರುವ URL ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡುವುದರಿಂದ, ನೀವು ನೇರವಾಗಿ ${name} ಅವರ ಅಫಿಷಿಯಲ್ ಪಂಚಾಂಗ ದರ್ಶನ ಪುಟಕ್ಕೆ ತಲುಪುತ್ತೀರಿ. ಅಲ್ಲಿ ೪ ಪ್ರತ್ಯೇಕ ಟ್ಯಾಬ್‌ಗಳ ಮುಖಾಂತರ (೧. ಇಂದಿನ ಪಂಚಾಂಗ ವಿವರಣೆ, ೨. ಜನ್ಮ ಜಾತಕ ಕುಂಡಲಿ, ೩. ನವಗ್ರಹ ಗೋಚಾರ ಫಲ ಹಾಗೂ ೪. ಮಹಾದಶಾ-ಅಂತರ್ದಶಾ ಫಲ) ನಿಮ್ಮ ಪೂರ್ಣ ಭವಿಷ್ಯವನ್ನು ವೀಕ್ಷಿಸಬಹುದು!`
  },
  en: {
    chapterTitle: "Chapter 6: Personal 90-Day Panchanga Calendar & Divine Sync Guide",
    subTitle: "Simple steps to sync 90-day personal astrological calendar to your mobile device",
    personalIntroHeader: "✨ Personal Horoscope-Based 90-Day Calendar Speciality:",
    personalIntroText: (name) => `This 90-Day Panchanga Calendar and QR Code have been crafted specifically for ${name}, calculated day-by-day based on your personal birth chart for the next 90 days.`,
    installHeader: "📲 5 Simple steps to install 90-Day Calendar to your mobile:",
    step1: "Step 1: Scan the QR code below using your smartphone camera.",
    step2: "Step 2: Redirect to Baggona Panchanga website and download your personal .ics calendar file.",
    step3: "Step 3: If the file does not automatically open, navigate to your mobile's Files / Downloads folder.",
    step4: "Step 4: Tap the .ics file and select 'Google Calendar' or 'Apple Calendar'.",
    step5: "Step 5: Tap 'Add All' / Save to sync all 90 days of personal astrological events to your calendar!",
    qrCaption: "Scan to sync 90-day personal Panchanga calendar",
    urlRedirectHeader: "🌐 Calendar Event URL Redirection & 4-Tab Guidance:",
    urlRedirectText: (name) => `Clicking the unique URL link inside each daily calendar event redirects straight to ${name}'s personal Darshana portal featuring 4 interactive tabs (1. Today's Panchanga & Details, 2. Birth Kundli, 3. Gochara Results & 4. Dasha-Bhukti Insights)!`
  },
  hi: {
    chapterTitle: "अध्याय 6: व्यक्तिगत 90-दिवसीय पंचांग कैलेंडर एवं दिव्य सिंक मार्गदर्शिका",
    subTitle: "अपने मोबाइल में 90-दिवसीय पंचांग कैलेंडर सिंक करने के सरल चरण",
    personalIntroHeader: "✨ व्यक्तिगत जन्म कुंडली आधारित 90-दिवसीय कैलेंडर विशेषता:",
    personalIntroText: (name) => `यह 90-दिवसीय पंचांग कैलेंडर एवं QR कोड विशेष रूप से ${name} के लिए, आपकी जन्म कुंडली एवं गोचर के आधार पर आगामी 90 दिनों के लिए प्रतिदिन व्यक्तिगत रूप से तैयार किया गया है।`,
    installHeader: "📲 मोबाइल में 90-दिवसीय पंचांग सिंक करने के 5 सरल चरण:",
    step1: "चरण 1: अपने मोबाइल कैमरे से नीचे दिए गए QR कोड को स्कैन करें।",
    step2: "चरण 2: भाग्गोण पंचांग वेबसाइट पर रीडायरेक्ट होकर अपनी व्यक्तिगत .ics कैलेंडर फ़ाइल डाउनलोड करें।",
    step3: "चरण 3: यदि फ़ाइल स्वचालित रूप से नहीं खुलती है, तो अपने मोबाइल के Files / Downloads फ़ोल्डर में जाएँ।",
    step4: "चरण 4: .ics फ़ाइल पर टैप करें और 'Google Calendar' या 'Apple Calendar' चुनें।",
    step5: "चरण 5: 'Add All' / Save पर क्लिक करके 90 दिनों के पंचांग को अपने कैलेंडर में सिंक करें!",
    qrCaption: "स्कैन करके 90-दिवसीय व्यक्तिगत पंचांग सिंक करें",
    urlRedirectHeader: "🌐 कैलेंडर इवेंट URL रीडायरेक्शन एवं 4-टैब निर्देश:",
    urlRedirectText: (name) => `प्रतिदिन के कैलेंडर इवेंट में दिए गए URL लिंक पर क्लिक करने से आप सीधे ${name} के 4-टैब दैनिक दर्शन पृष्ठ (1. आज का पंचांग, 2. जन्म कुंडली, 3. गोचर फल एवं 4. दशा-भुक्ति) पर पहुंच जाएंगे!`
  },
  te: {
    chapterTitle: "అధ్యాయం 6: వ్యక్తిగత 90-రోజుల పంచాంగ క్యాలెండర్ & దివ్య సింక్ మార్గదర్శి",
    subTitle: "మీ మొబైల్‌కి 90 రోజుల పంచాంగం సింక్ చేసుకునే సులువైన పద్ధతులు",
    personalIntroHeader: "✨ వ్యక్తిగత జాతక ఆధారిత 90-రోజుల క్యాలెండర్ ప్రత్యేకత:",
    personalIntroText: (name) => `ఈ 90-రోజుల పంచాంగ క్యాలెండర్ మరియు QR కోడ్ కేవలం ${name} గారి కోసమే, మీ వ్యక్తిగత జాతకం మరియు గోచార గణన ఆధారంగా రాబోయే 90 రోజులకు రోజువారీగా ప్రత్యేకంగా సిద్ధం చేయబడింది.`,
    installHeader: "📲 మొబైల్‌లో 90-రోజుల పంచాంగం ఇన్‌స్టాల్ చేసే 5 సులువైన పద్ధతులు:",
    step1: "దశ 1: క్రింది QR కోడ్‌ను మీ మొబైల్ కెమెరాతో స్కాన్ చేయండి.",
    step2: "దశ 2: భాగ్గోణ పంచాంగ వెబ్‌సైట్‌కి రీడైరెక్ట్ అయి మీ వ్యక్తిగత .ics క్యాలెండర్ ఫైల్ డౌన్‌లోడ్ చేయండి.",
    step3: "దశ 3: ఫైల్ స్వయంచాలకంగా తెరవకపోతే, మీ మొబైల్ Files / Downloads ఫోల్డర్‌కి వెళ్లండి.",
    step4: "దశ 4: .ics ఫైల్‌పై టాప్ చేసి 'Google Calendar' లేదా 'Apple Calendar' ఎంచుకోండి.",
    step5: "దశ 5: 'Add All' / Save క్లిక్ చేసి 90 రోజులు క్యాలెండర్‌కి సింక్ చేయండి!",
    qrCaption: "స్కాన్ చేసి 90-రోజుల వ్యక్తిగత పంచాంగం సింక్ చేయండి",
    urlRedirectHeader: "🌐 క్యాలెండర్ ఈవెంట్ URL రీడైరెక్షన్ వివరాలు:",
    urlRedirectText: (name) => `మీ క్యాలెండర్ ఈవెంట్‌లోని URL లింక్‌పై క్లిక్ చేయడం ద్వారా మీరు నేరుగా ${name} గారి 4 టాబ్‌లు (1. నేటి పంచాంగం, 2. జన్మ జాతకం, 3. గోచారం & 4. దశా-భుక్తి) ఉన్న పేజీకి రీడైరెక్ట్ అవుతారు!`
  },
  ta: {
    chapterTitle: "அத்தியாயம் 6: தனிப்பட்ட 90-நாள் பஞ்சாங்க காலண்டர் & புனித சிங்க் வழிகாட்டி",
    subTitle: "உங்கள் மொபைலில் 90-நாள் பஞ்சாங்கத்தை சிங்க் செய்வதற்கான எளிய முறைகள்",
    personalIntroHeader: "✨ தனிப்பட்ட ஜாதக அடிப்படையிலான 90-நாள் காலண்டர் சிறப்பு:",
    personalIntroText: (name) => `இந்த 90-நாள் பஞ்சாங்க காலண்டர் மற்றும் QR குறியீடு ${name} அவர்களுக்காகவே, உங்கள் ஜாதக கணிதத்தின் அடிப்படையில் அடுத்த 90 நாட்களுக்கு ஒவ்வொரு நாளுக்கும் தனித்தனியாக தயாரிக்கப்பட்டுள்ளது.`,
    installHeader: "📲 மொபைலில் 90-நாள் பஞ்சாங்கம் நிறுவும் 5 எளிய முறைகள்:",
    step1: "படி 1: கீழே உள்ள QR குறியீட்டை மொபைல் கேமராவால் ஸ்கேன் செய்யவும்.",
    step2: "படி 2: பாக்கோண பஞ்சாங்கம் தளத்திற்கு சென்று உங்கள் தனிப்பட்ட .ics காலண்டர் ஃபைலை பதிவிறக்கவும்.",
    step3: "படி 3: ஃபைல் தானாக திறக்கவில்லை என்றால், உங்கள் மொபைலின் Files / Downloads கோப்பிற்கு செல்லவும்.",
    step4: "படி 4: .ics ஃபைலை கிளிக் செய்து 'Google Calendar' அல்லது 'Apple Calendar' தேர்வு செய்யவும்.",
    step5: "படி 5: 'Add All' / Save கிளிக் செய்து 90-நாள் பஞ்சாங்கத்தை சிங்க் செய்யவும்!",
    qrCaption: "ஸ்கேன் செய்து 90-நாள் பஞ்சாங்கம் சிங்க் செய்யவும்",
    urlRedirectHeader: "🌐 காலண்டர் நிகழ்வு URL மறுவழிப்படுத்தும் வழிகாட்டி:",
    urlRedirectText: (name) => `ஒவ்வொரு நாள் காலண்டர் நிகழ்விலும் உள்ள URL லிங்கை கிளிக் செய்வதன் மூலம், ${name} அவர்களின் 4 தப்கள் (1. இன்றைய பஞ்சாங்கம், 2. ஜாதகம், 3. கோச்சாரம் & 4. தசா புக்தி) கொண்ட பக்கத்திற்கு நேரடியாக செல்லலாம்!`
  }
};


const PAGE8_DICT: Record<string, {
  slokaHeader: (name: string) => string;
  slokaMantra: string;
  slokaPhala: string;
}> = {
  kn: {
    slokaHeader: (name) => `🏺 ${name} ಅವರ ಜಾತಕ, ಗೋಚಾರ & ದಶಾಪರಿಹಾರ ಸಿದ್ಧ ರಕ್ಷಾ ಸ್ತೋತ್ರ:`,
    slokaMantra: '"ॐ ಶ್ರೀ ಮಹಾಗೌರೀ ಸಮೇತ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ । ನವಗ್ರಹ ದೋಷ ಶಮನಂ ಕುರು ಕುರು ಸ್ವಾಹಾ ॥"',
    slokaPhala: "(ದಿನನಿತ್ಯ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ೧೧ ಬಾರಿ ಜಪಿಸುವುದರಿಂದ ಜಾತಕ-ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ)"
  },
  en: {
    slokaHeader: (name) => `🏺 ${name}'s Personalized Chart & Gochara Divine Defense Sloka:`,
    slokaMantra: '"Om Shri Mahagauri Sameta Gokarna Mahabaleshvaraya Namah | Navagraha Dosha Shamanam Kuru Kuru Swaha ||"',
    slokaPhala: "(Reciting 11 times daily at home altar mitigates all horoscope and transit planetary afflictions, bringing deep peace of mind, family harmony, and divine progress)"
  },
  hi: {
    slokaHeader: (name) => `🏺 ${name} के लिए जन्म कुंडली एवं गोचर दोष निवारक सिद्ध रक्षा स्तोत्र:`,
    slokaMantra: '"ॐ श्री महागौरी समेत गोकर्ण महाबलेश्वरान नमः । नवग्रह दोष शमनं कुरु कुरु स्वाहा ॥"',
    slokaPhala: "(नित्य 11 बार जप करने से जन्म कुंडली एवं गोचर के सभी ग्रह दोषों का शमन होता है तथा मानसिक शांति एवं पारिवारिक सुख-समृद्धि की प्राप्ति होती है)"
  },
  te: {
    slokaHeader: (name) => `🏺 ${name} గారి జాతక, గోచార & దశాభుక్తి సిద్ధ రక్షా స్తోత్రం:`,
    slokaMantra: '"ఓం శ్రీ మహాగౌరీ సమేత గోకర్ణ మహాబలేశ్వరాయ నమః । నవగ్రహ దోష శమనం కురు ಕುರು స్వాహా ॥"',
    slokaPhala: "(నిత్యం 11 సార్లు జపించడం ద్వారా జాతక-గోచార గ్రహ దోషాలు నివారణ అయి, మానసిక ప్రశాంతత, కుటుంబ సౌఖ్యం లభిస్తాయి)"
  },
  ta: {
    slokaHeader: (name) => `🏺 ${name} அவர்களின் ஜாதக, கோச்சார & தசா புக்தி சாந்தி புனித ஸ்தோத்திரம்:`,
    slokaMantra: '"ஓம் ஸ்ரீ மகாகௌரி சமேத கோகர்ண மகாபலேஸ்வராய நமஃ । நவக்ரக தோஷ சமனம் குரு குரு ஸ்வாஹா ॥"',
    slokaPhala: "(தினமும் 11 முறை ஜபிப்பதால் ஜாதக-கோச்சார கிரக தோஷங்கள் நிவர்த்தியாகி, மன அமைதி மற்றும் குடும்ப மகிழ்ச்சி சித்திக்கும்)"
  }
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
  lblYoga: string;
  lblDob: string;
  lblTob: string;
  lblPob: string;
  valPob: string;
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
    lblYoga: "ಜನ್ಮ ಯೋಗ",
    lblDob: "ಜನನ ದಿನಾಂಕ",
    lblTob: "ಜನನ ಸಮಯ",
    lblPob: "ಜ್ಯೋತಿಷ್ಯ ಗ್ರಂಥ ಸಿದ್ಧ ಕ್ಷೇತ್ರ",
    valPob: "ರಥಬೀದಿ, ಗೋಕರ್ಣ, ಕುಮಟಾ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",
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
    lblYoga: "Janma Yoga",
    lblDob: "Date of Birth",
    lblTob: "Time of Birth",
    lblPob: "Astrology Book Sacred Place",
    valPob: "Rathabeedi, Gokarna, Kumta, Uttara Kannada, Karnataka",
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
    lblYoga: "जन्म योग",
    lblDob: "जन्म तिथि",
    lblTob: "जन्म समय",
    lblPob: "ज्योतिष ग्रंथ सिद्ध क्षेत्र",
    valPob: "रथबीदि, गोकर्ण, कुमटा, उत्तर कन्नड़, कर्नाटक",
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
    lblYoga: "జన్మ యోగం",
    lblDob: "జనన తేదీ",
    lblTob: "జనన సమయం",
    lblPob: "జ్యోతిష్య గ్రంథ సిద్ధ క్షేత్రం",
    valPob: "రథబీది, గోకర్ణ, కుమటా, ఉత్తర కన్నడ, కర్ణాటక",
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
    lblYoga: "ஜென்ம யோகம்",
    lblDob: "பிறந்த தேதி",
    lblTob: "பிறந்த நேரம்",
    lblPob: "ஜோதிட நூல் புனித க்ஷேத்ரம்",
    valPob: "ரதபீதி, கோகர்ணா, குமடா, உத்தர கன்னடா, கர்நாடகா",
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



const calculateBirthTithi = (kundli: any, isKn: boolean): string => {
  if (!kundli || !kundli.planets) return isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)";
  const sun = kundli.planets.find((p: any) => p.name === "Sun" || p.planet === "Sun")?.longitude ?? 0;
  const moon = kundli.planets.find((p: any) => p.name === "Moon" || p.planet === "Moon")?.longitude ?? 0;
  const diff = (moon - sun + 360) % 360;
  const tithiIdx = Math.floor(diff / 12) % 30;
  const isShukla = tithiIdx < 15;
  const tithiNum = (tithiIdx % 15);
  
  const TITHIS_KN = ["ಪ್ರಥಮಾ", "ದ್ವಿತೀಯಾ", "ತೃತೀಯಾ", "ಚತುರ್ಥಿ", "ಪಂಚಮೀ", "ಷಷ್ಠೀ", "ಸಪ್ತಮೀ", "ಅಷ್ಟಮೀ", "ನವಮೀ", "ದಶಮೀ", "ಏಕಾದಶೀ", "ದ್ವಾದಶೀ", "ತ್ರಯೋದಶೀ", "ಚತುರ್ದಶೀ", isShukla ? "ಪೂರ್ಣಿಮಾ" : "ಅಮಾವಾಸ್ಯಾ"];
  const TITHIS_EN = ["Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", isShukla ? "Purnima" : "Amavasya"];
  
  const tName = isKn ? TITHIS_KN[tithiNum] : TITHIS_EN[tithiNum];
  const pName = isKn ? (isShukla ? "ಶುಕ್ಲ ಪಕ್ಷ" : "ಕೃಷ್ಣ ಪಕ್ಷ") : (isShukla ? "Shukla Paksha" : "Krishna Paksha");
  
  return `${tName} (${pName})`;
};

const calculateBirthYoga = (kundli: any, isKn: boolean): string => {
  if (!kundli || !kundli.planets) return isKn ? "ಸಿದ್ಧ" : "Siddha";
  const sun = kundli.planets.find((p: any) => p.planet === "Sun")?.longitude ?? 0;
  const moon = kundli.planets.find((p: any) => p.planet === "Moon")?.longitude ?? 0;
  const sum = (sun + moon) % 360;
  const yogaIdx = Math.floor(sum / (360 / 27)) % 27;
  
  const YOGAS_KN = [
    "ವಿಷ್ಕಂಭ", "ಪ್ರೀತಿ", "ಆಯುಷ್ಮಾನ್", "ಸೌಭಾಗ್ಯ", "ಶೋಭನ", "ಅತಿಗಂಡ", "ಸುಕರ್ಮ", "ಧೃತಿ", "ಶೂಲ", "ಗಂಡ", 
    "ವೃದ್ಧಿ", "ಧ್ರುವ", "ವ್ಯಾಘಾತ", "ಹರ್ಷಣ", "ವಜ್ರ", "ಸಿದ್ಧಿ", "ವ್ಯತೀಪಾತ", "ವರಿಯಾನ್", "ಪರಿಘ", "ಶಿವ", 
    "ಸಿದ್ಧ", "ಸಾಧ್ಯ", "ಶುಭ", "ಶುಕ್ಲ", "ಬ್ರಹ್ಮ", "ಐಂದ್ರ", "ವೈಧೃತಿ"
  ];
  const YOGAS_EN = [
    "Vishkambha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Aindra", "Vaidriti"
  ];
  
  return isKn ? (YOGAS_KN[yogaIdx] || "ಸಿದ್ಧ") : (YOGAS_EN[yogaIdx] || "Siddha");
};

const toKnDigits = (numOrStr: string | number): string => {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return numOrStr.toString().replace(/\d/g, d => knDigits[parseInt(d, 10)]);
};


// Planet Short Name Map (L5)
const PLANET_SHORT_L5: Record<string, Record<string, string>> = {
  Sun: { kn: "ಸೂರ್ಯ", en: "Sun", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  Mars: { kn: "ಮಂಗಳ", en: "Mars", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
  Mercury: { kn: "ಬುಧ", en: "Merc", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  Jupiter: { kn: "ಗುರು", en: "Jup", hi: "गुरु", te: "గురుడు", ta: "குரு" },
  Venus: { kn: "ಶುಕ್ರ", en: "Ven", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  Saturn: { kn: "ಶನಿ", en: "Sat", hi: "शनि", te: "శని", ta: "சனி" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" },
  Maandi: { kn: "ಮಾಂದಿ", en: "Mandi", hi: "मांदि", te: "మాంది", ta: "மாந்தி" }
};

/** Dynamic South Indian Grid Generator for D1 and D9 */

const PLANET_REMEDY_MAP_L5: Record<string, Record<string, string>> = {
  Sun: { kn: "ರವಿವಾರ ಶ್ರೀ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಪಠಿಸಿ ಹಾಗೂ ಸೂರ್ಯದೇವನಿಗೆ ಅರ್ಘ್ಯ ನೀಡಿ.", en: "Recite Sri Aditya Hrudayam on Sundays and offer Arghya to Sun.", hi: "रविवार को श्री आदित्य हृदय स्तोत्र का पाठ करें और सूर्यदेव को अर्घ्य दें।", te: "ఆదివారం శ్రీ ఆదిత్య హృదయ స్తోత్రం పఠించండి.", ta: "ஞாயிற்றுக்கிழமைகளில் ஸ்ரீ ஆதித்ய ஹ்ருதயம் பாராயணம் செய்யவும்." },
  Moon: { kn: "ಸೋಮವಾರ ಶ್ರೀ ಶಿವಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ಬಡವರಿಗೆ ಶ್ವೇತ ವಸ್ತ್ರ ದಾನ ಮಾಡಿ.", en: "Perform Shiva Puja on Mondays and donate white clothes to needy.", hi: "सोमवार को श्री शिव पूजा करें और जरूरतमंदों को सफेद वस्त्र दान करें।", te: "సోమవారం శ్రీ శివ పూజ చేయండి.", ta: "திங்கள்கிழமைகளில் ஸ்ரீ சிவ பூஜை செய்யவும்." },
  Mars: { kn: "ಮಂಗಳವಾರ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ಹನುಮಾನ್ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ತೊಗರಿ ಬೇಳೆ ದಾನ ಮಾಡಿ.", en: "Worship Lord Subrahmanya or Hanuman on Tuesdays.", hi: "मंगलवार को श्री सुब्रह्मण्य या हनुमान पूजा करें।", te: "మంగళవారం శ్రీ సుబ్రహ్మణ్య స్వామి పూజ చేయండి.", ta: "செவ்வாய்க்கிழமைகளில் ஸ்ரீ சுப்ரமண்யர் பூஜை செய்யவும்." },
  Mercury: { kn: "ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ ಹಾಗೂ ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ.", en: "Recite Sri Vishnu Sahasranama on Wednesdays.", hi: "बुधवार को श्री विष्णु सहस्रनाम का पाठ करें।", te: "బుధవారం శ్రీ విష్ణు సహస్రనామ పారాయణం చేయండి.", ta: "புதன்கிழமைகளில் ஸ்ரீ விஷ்ணு சஹஸ்ரநாமம் பாராயணம் செய்யவும்." },
  Jupiter: { kn: "ಗುರುವಾರ ಶ್ರೀ ದತ್ತಾತ್ರೇಯ / ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ಕಡಲೆ ದಾನ ಮಾಡಿ.", en: "Worship Lord Dattatreya or Raghavendra Swamy on Thursdays.", hi: "गुरुवार को श्री दत्तात्रेय या राघवेंद्र स्वामी की पूजा करें।", te: "గురువారం శ్రీ దత్తాత్రేయ పూజ చేయండి.", ta: "வியாழக்கிழமைகளில் ஸ்ரீ ராகவேந்திரர் பூஜை செய்யவும்." },
  Venus: { kn: "ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ ಹಾಗೂ ದೇವಿಗೆ ಕಲ್ಕಂಡು ಅರ್ಪಿಸಿ.", en: "Perform Sri Mahalakshmi Puja on Fridays.", hi: "शुक्रवार को श्री महालक्ष्मी पूजा करें।", te: "శుక్రవారం శ్రీ महालक्ष्मी पूजा करें।", ta: "வெள்ளிக்கிழமைகளில் ஸ்ரீ மகாலட்சுமி பூஜை செய்யவும்." },
  Saturn: { kn: "ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ಎಳ್ಳಿನ ದಾನ ಮಾಡಿ.", en: "Recite Sri Hanuman Chalisa on Saturdays and donate sesame seeds.", hi: "शनिवार को श्री हनुमान चालीसा का पाठ करें।", te: "శనివారం శ్రీ హనుమాన్ చాలీసా పఠించండి.", ta: "சனிக்கிழமைகளில் ஸ்ரீ ஹனுமான் சாலீசா பாராயணம் செய்யவும்." },
  Rahu: { kn: "ಶನಿವಾರ/ಮಂಗಳವಾರ ಶ್ರೀ ದುರ್ಗಾ ಸಪ್ತಶತಿ ಪಠಿಸಿ ಹಾಗೂ ಕಪ್ಪು ಉದ್ದು ದಾನ ಮಾಡಿ.", en: "Recite Sri Durga Saptashati and donate black gram.", hi: "श्री दुर्गा सप्तशती का पाठ करें।", te: "శ్రీ దుర్గా సప్తశతి పారాయణం చేయండి.", ta: "ஸ்ரீ துர்க்கா சப்தசதி பாராயணம் செய்யவும்." },
  Ketu: { kn: "ಸಂಕಷ್ಟಹರ ಚತುರ್ಥಿಯಂದು ಶ್ರೀ ಗಣೇಶ ಸಂಕಟನಾಶನ ಸ್ತೋತ್ರ ಪಠಿಸಿ.", en: "Recite Sri Ganesha Sankata Nashana Stotra on Sankashti Chaturthi.", hi: "संकष्टी चतुर्थी को श्री गणेश संकटनाशन स्तोत्र का पाठ करें।", te: "శ్రీ గణేశ సంకటనాశన స్తోత్రం పఠించండి.", ta: "ஸ்ரீ கணேச சங்கடநாசன ஸ்தோத்திரம் பாராயணம் செய்யவும்." }
};

const renderSouthIndianGrid = (
  kundli: any,
  isD9: boolean,
  code: string,
  displayName: string,
  dobStr: string,
  tobStr: string
) => {
  const isKn = code === "kn";
  const lagnaIdx = isD9 
    ? (kundli?.navamshaLagnaIndex !== undefined ? kundli.navamshaLagnaIndex : (((kundli?.lagnaRashi?.index || 0) * 9) % 12))
    : (kundli?.lagnaRashi?.index ?? 0);

  const lagnaRashiName = (RASHI_L5[lagnaIdx] as any)?.[code] || (RASHI_L5[lagnaIdx] as any)?.kn || RASHI_KN_MAP[lagnaIdx] || "ಲಗ್ನ";

  // Planets by sign index (0 to 11)
  const planetsByRashi: Record<number, Array<{ name: string; amshaka: number }>> = {};
  for (let i = 0; i < 12; i++) planetsByRashi[i] = [];

  if (kundli && kundli.planets) {
    for (const p of kundli.planets) {
      let rIdx = 0;
      let amshaka = patrikaNavamshaFromDegree(p.degree || 0);
      if (isD9) {
        const totalDeg = (p.rashi ? p.rashi.index * 30 : 0) + (p.degreeInRashi || p.degree || 0);
        rIdx = Math.floor(totalDeg / (30 / 9)) % 12;
      } else {
        rIdx = p.rashi ? p.rashi.index : 0;
      }
      const plName = (PLANET_SHORT_L5[p.name || p.planet] as any)?.[code] || p.name || p.planet;
      planetsByRashi[rIdx].push({ name: plName, amshaka });
    }
  }

  // Cell Renderer for a specific Rashi Index
  const renderCell = (rIdx: number) => {
    const rName = (RASHI_L5[rIdx] as any)?.[code] || RASHI_KN_MAP[rIdx] || "";
    const isLagnaCell = rIdx === lagnaIdx;
    const planetsHere = planetsByRashi[rIdx] || [];

    return (
      <div style={{ border: "1px solid #B45309", padding: "2px 4px", fontSize: "10px", minHeight: "65px", boxSizing: "border-box" }}>
        <div style={{ color: "#78350F", fontWeight: 800, fontSize: "10.5px", borderBottom: "1px solid #FDE68A", paddingBottom: "1px", marginBottom: "2px" }}>
          {rName}
        </div>
        {isLagnaCell && (
          <div style={{ color: "#B91C1C", fontWeight: 800, fontSize: "10px" }}>
            {isKn ? `ಲಗ್ನ ${kundli?.ascendant !== undefined ? toKnDigits(patrikaNavamshaFromDegree(kundli.ascendant)) : ""}` : `Lagna ${kundli?.ascendant !== undefined ? patrikaNavamshaFromDegree(kundli.ascendant) : ""}`}
          </div>
        )}
        {planetsHere.map((pl, idx) => (
          <div key={idx} style={{ color: "#1E3A8A", fontWeight: 800, fontSize: "9.5px", lineHeight: "1.2" }}>
            {pl.name} {isKn ? toKnDigits(pl.amshaka) : pl.amshaka}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      width: "360px",
      height: "300px",
      margin: "0 auto",
      border: "2px solid #D97706",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      boxSizing: "border-box",
      background: "#FFFDF7"
    }}>
      {/* Row 1 (Top): Meena (11), Mesha (0), Vrishabha (1), Mithuna (2) */}
      {renderCell(11)}
      {renderCell(0)}
      {renderCell(1)}
      {renderCell(2)}

      {/* Row 2: Kumbha (10), Center Box, Karka (3) */}
      {renderCell(10)}
      <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px", textAlign: "center" }}>
        <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
        <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px" }}>
          {isKn ? `ಜನನ: ${toKnDigits(dobStr)} | ಸಮಯ:` : `DOB: ${dobStr} | Time:`}
        </div>
        <div style={{ fontSize: "10px", color: "#B45309" }}>
          {tobStr}
        </div>
        <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>
          {isKn ? `ಲಗ್ನ: ${lagnaRashiName}` : `Lagna: ${lagnaRashiName}`}
        </div>
      </div>
      {renderCell(3)}

      {/* Row 3: Makara (9), Simha (4) */}
      {renderCell(9)}
      {renderCell(4)}

      {/* Row 4 (Bottom): Dhanu (8), Vrishchika (7), Tula (6), Kanya (5) */}
      {renderCell(8)}
      {renderCell(7)}
      {renderCell(6)}
      {renderCell(5)}
    </div>
  );
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
  const gotraKey = rawGotra.toLowerCase().replace(/[^a-z]/g, "");
  const localizedGotra = GOTRA_L5_MAP[gotraKey]?.[code] || GOTRA_L5_MAP[gotraKey]?.kn || GOTRA_KN_MAP[rawGotra] || rawGotra;
  const finalGotra = hasGotra ? localizedGotra : "";

  // Calculate authentic birth Kundli
    const traditionalPanchanga = React.useMemo(() => {
    try {
      return calculateTraditionalBaggona(
        dobStr,
        tobStr,
        (identity as any)?.latitude || 14.544,
        (identity as any)?.longitude || 74.318
      );
    } catch {
      return null;
    }
  }, [dobStr, tobStr, (identity as any)?.latitude, (identity as any)?.longitude]);

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

    
  const dashaCardsData = React.useMemo(() => {
    if (!birthKundli) return [];
    const timeline = generateBhuktiTimeline(birthKundli, 100);
    if (!timeline || timeline.length === 0) return [];

    let bDate = new Date();
    if (dobStr && /^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
      bDate = new Date(dobStr + "T12:00:00");
    }

    const now = new Date();
    const currentAgeDecimal = Math.max(0, (now.getTime() - bDate.getTime()) / (365.25 * 86400000));

    let activeIdx = timeline.findIndex(b => currentAgeDecimal >= b.startAge && currentAgeDecimal < b.endAge);
    if (activeIdx < 0) activeIdx = 0;

    const selectedSpans = timeline.slice(activeIdx, activeIdx + 5);

    return selectedSpans.map((span, idx) => {
      const isCurrent = idx === 0;
      const mahaName = (PLANET_SHORT_L5[span.maha] as any)?.[code] || span.maha;
      const bhuktiName = (PLANET_SHORT_L5[span.bhukti] as any)?.[code] || span.bhukti;

      const startDate = new Date(bDate.getTime() + span.startAge * 365.25 * 86400000);
      const endDate = new Date(bDate.getTime() + span.endAge * 365.25 * 86400000);
      const startYmd = startDate.toISOString().split("T")[0];
      const endYmd = endDate.toISOString().split("T")[0];

      const startAgeInt = Math.floor(span.startAge);
      const endAgeInt = Math.ceil(span.endAge);

      const bhuktiPos = birthKundli.planets.find(p => p.name === span.bhukti);
      const house = bhuktiPos ? bhuktiPos.house : 1;
      const isGood = [1, 4, 5, 7, 9, 10, 11].includes(house);

      let badgeText = "";
      if (isCurrent) {
        badgeText = code === "kn" ? "📌 ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ" : (code === "hi" ? "📌 वर्तमान समय" : "📌 Current Active Period");
      } else if (isGood) {
        badgeText = code === "kn" ? "✨ ಶುಭ ಯೋಗ & ಧನ ವೃದ್ಧಿ" : (code === "hi" ? "✨ शुभ योग व धन वृद्धि" : "✨ Favorable Prosperity Period");
      } else {
        badgeText = code === "kn" ? "⚖️ ಪರಿಶ್ರಮ & ಸ್ಥಿರ ಕರ್ಮ" : (code === "hi" ? "⚖️ परिश्रम व धैर्य काल" : "⚖️ Patience & Discipline Period");
      }

      const careerText = isGood
        ? (code === "kn" ? `${bhuktiName} ದಶೆಯಲ್ಲಿ ಉದ್ಯೋಗ ಪ್ರಗತಿ, ಜವಾಬ್ದಾರಿ ಹೆಚ್ಚಳ ಹಾಗೂ ವೃತ್ತಿರಂಗದಲ್ಲಿ ಯಶಸ್ಸು.` : `Career advancement and positive achievements under ${bhuktiName} period.`)
        : (code === "kn" ? `${bhuktiName} ದಶೆಯಲ್ಲಿ ವೃತ್ತಿಯಲ್ಲಿ ತಾಳ್ಮೆ, ಕರ್ತವ್ಯ ನಿಷ್ಠೆ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಅನುಭವ ಸಿದ್ಧಿ.` : `Career stability requiring patience and focused dedication during ${bhuktiName} period.`);

      const financeText = isGood
        ? (code === "kn" ? `ಆದಾಯ ಮೂಲಗಳ ವೃದ್ಧಿ, ಆಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಅನುಕೂಲ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆ.` : `Financial growth, property investments, and monetary stability.`)
        : (code === "kn" ? `ಧನ ಶೇಖರಣೆಯಲ್ಲಿ ಜಾಗರೂಕತೆ, ನಿಯಂತ್ರಿತ ಖರ್ಚು ಹಾಗೂ ಭವಿಷ್ಯದ ಸುರಕ್ಷಿತ ಹೂಡಿಕೆ.` : `Disciplined savings, prudent expenditure, and secure long-term investments.`);

      const familyText = isGood
        ? (code === "kn" ? `ಗೃಹದಲ್ಲಿ ಸಂತೋಷ, ಹಿರಿಯರ ಆಶೀರ್ವಾದ ಹಾಗೂ ಸುಖಕರ ಕುಟುಂಬ ಜೀವನ.` : `Domestic peace, elders' blessings, and harmonious family environment.`)
        : (code === "kn" ? `ಕುಟುಂಬದಲ್ಲಿ ಪರಸ್ಪರ ಸಹನೆ, ಸೌಹಾರ್ದಯುತ ಮಾತುಕತೆ ಹಾಗೂ ಶಾಂತಿ ನಿರ್ವಹಣೆ.` : `Mutual understanding, patient communication, and peaceful domestic life.`);

      const remedyText = (PLANET_REMEDY_MAP_L5[span.bhukti] as any)?.[code] || PLANET_REMEDY_MAP_L5[span.bhukti]?.kn || "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ ಹಾಗೂ ಬಡವರಿಗೆ ದಾನ ಮಾಡಿ.";

      return {
        mahaName,
        bhuktiName,
        startYmd,
        endYmd,
        startAgeInt,
        endAgeInt,
        isCurrent,
        badgeText,
        careerText,
        financeText,
        familyText,
        remedyText
      };
    });
  }, [birthKundli, dobStr, code]);

  // ─── DYNAMIC PAGE 4 DATA (Natal Planets, Yogas & Doshas) ───
  const page4Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isEn = code === "en";
    const isHi = code === "hi";
    const isTe = code === "te";
    const isTa = code === "ta";

    const planets = birthKundli.planets || [];
    const sun = planets.find(p => p.name === "Sun");
    const jupiter = planets.find(p => p.name === "Jupiter");
    const saturn = planets.find(p => p.name === "Saturn");
    const mars = planets.find(p => p.name === "Mars");
    const venus = planets.find(p => p.name === "Venus");
    const mercury = planets.find(p => p.name === "Mercury");
    const moon = planets.find(p => p.name === "Moon");

    // Yogas detection
    const yogas: string[] = [];
    if (jupiter && moon && Math.abs((jupiter.house - moon.house + 12) % 12) % 3 === 0) {
      yogas.push(isKn ? "ಶ್ರೀ ಗಜಕೇಸರಿ ಯೋಗ (ಜ್ಞಾನ & ಕೀರ್ತಿ ವೃದ್ಧಿ)" : (isHi ? "गजकेसरी योग (ज्ञान व यश)" : "Gajakesari Yoga (Wisdom & Renown)"));
    }
    if (sun && mercury && sun.house === mercury.house) {
      yogas.push(isKn ? "ಶ್ರೀ ಬುಧಾದಿತ್ಯ ಯೋಗ (ತೀಕ್ಷ್ಣ ಬೌದ್ಧಿಕ ಚಾತುರ್ಯ)" : (isHi ? "बुधादित्य योग (तीक्ष्ण बुद्धि)" : "Budhaditya Yoga (Intellectual Brilliance)"));
    }
    if (jupiter && [1, 4, 7, 10].includes(jupiter.house)) {
      yogas.push(isKn ? "ಶ್ರೀ ಗುರು ಬಲ & ಕೇಂದ್ರ ರಾಜಯೋಗ" : (isHi ? "केन्द्र राजयोग व गुरु बल" : "Jupiter Kendra Raja Yoga"));
    }
    if (yogas.length === 0) {
      yogas.push(isKn ? "ಶ್ರೀ ಧನಕಾರಕ ಯೋಗ & ಶುಭ ಗ್ರಹ ದೃಷ್ಟಿ" : "Dhana Karaka Yoga & Auspicious Aspects");
    }

    // Doshas & Cautions
    const doshas: string[] = [];
    if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
      doshas.push(isKn ? "ಮಂಗಳ ಸ್ಥಾನ ಪ್ರಭಾವ (ದಾಂಪತ್ಯದಲ್ಲಿ ಸಹನೆ ಅಗತ್ಯ)" : "Mars House Influence (Requires patience in relationships)");
    }
    if (saturn && [6, 8, 12].includes(saturn.house)) {
      doshas.push(isKn ? "ಶನಿ ದೃಷ್ಟಿ ಶಮನ (ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಯಶಸ್ಸು)" : "Saturn Transit Balance (Success through disciplined effort)");
    }
    if (doshas.length === 0) {
      doshas.push(isKn ? "ಸಾಮಾನ್ಯ ಸಾತ್ವಿಕ ದೋಷ ಶಮನ (ದೈವಿಕ ಅನುಗ್ರಹ)" : "General Karmic Balance & Divine Protection");
    }

    return {
      card1Title: isKn ? "🌌 ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಬಲ & ಶುಭ ದೃಷ್ಟಿ" : (isHi ? "🌌 जन्म ग्रहों की स्थिति व शुभ दृष्टि" : "🌌 Natal Planetary Strengths & Aspects"),
      card1Text: isKn
        ? `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಪ್ರಮುಖ ನವಗ್ರಹಗಳ ಸ್ಥಿತಿಯು ಕರ್ಮ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಹಾಗೂ ಆಡಳಿತಾತ್ಮಕ ಜವಾಬ್ದಾರಿಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಗುರು ಹಾಗೂ ಶನಿ ದೇವ ಪ್ರಭಾವದಿಂದ ದೀರ್ಘಕಾಲಿಕ ಧನ ವೃದ್ಧಿ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸುಖಕರ ವಾತಾವರಣ ಸಿದ್ಧಿಸಲಿದೆ.`
        : `In your natal chart, the ascendant lord and key planetary alignments signify professional stability, organizational responsibility, and steady long-term financial growth.`,
      card2Title: isKn ? "✨ ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ಸಿದ್ಧಿಸಿರುವ ಪ್ರಮುಖ ಶುಭ ಯೋಗಗಳು" : (isHi ? "✨ आपकी कुंडली में सिद्ध शुभ योग" : "✨ Prominent Auspicious Yogas Active"),
      yogas,
      card3Title: isKn ? "🛡️ ಗ್ರಹ ದೋಷ ಶಮನ & ಪವಿತ್ರ ವೈದಿಕ ಪರಿಹಾರ" : (isHi ? "🛡️ ग्रह दोष शमन व पवित्र वैदिक उपाय" : "🛡️ Karmic Balances & Sacred Remedies"),
      doshas,
      remedy: isKn
        ? "ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ ಹಾಗೂ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ."
        : "Recite Sri Hanuman Chalisa on Saturdays and perform Rudrabhishekam at Sri Gokarna Mahabaleshwara temple."
    };
  }, [birthKundli, code]);


  // ─── DYNAMIC PAGE 5 DATA (Present Dasha-Bhukti & Gochara Transits) ───
  const page5Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";
    const isHi = code === "hi";

    const activeCard = dashaCardsData && dashaCardsData.length > 0 ? dashaCardsData[0] : null;
    const mahaName = activeCard ? activeCard.mahaName : (isKn ? "ಗುರು" : "Jupiter");
    const bhuktiName = activeCard ? activeCard.bhuktiName : (isKn ? "ಶನಿ" : "Saturn");

    return {
      card1Title: isKn ? `📌 ${mahaName} ಮಹಾದಶಾ ಫಲಗಳು (ಪ್ರಸ್ತುತ ಜೀವನ ಅಧ್ಯಾಯ)` : `📌 ${mahaName} Mahadasha Synthesis (Current Life Chapter)`,
      card1Text: isKn
        ? `${mahaName} ಮಹಾದಶೆಯ ಪ್ರಭಾವದಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ನೂತನ ಆಶಾಭಾವನೆ, ವೃತ್ತಿರಂಗದಲ್ಲಿ ಉನ್ನತ ಜವಾಬ್ದಾರಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಗೌರವ ಸಿದ್ಧಿಸಲಿದೆ. ದೀರ್ಘಕಾಲಿಕ ಯೋಚನೆಗಳಲ್ಲಿ ಯಶಸ್ಸು ದೊರೆಯಲಿದೆ.`
        : `Under the influence of ${mahaName} Mahadasha, your life enters a period of structural stability, professional leadership, and enhanced social respect.`,
      card2Title: isKn ? `📌 ${bhuktiName} ಅಂತರ್ದಶಾ ಫಲಗಳು (ವರ್ತಮಾನ ಸೂಕ್ಷ್ಮ ಸಂಚಾರ)` : `📌 ${bhuktiName} Antardasha Synthesis (Current Sub-period)`,
      card2Text: isKn
        ? `${bhuktiName} ಅಂತರ್ದಶೆಯು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ಧನ ರಕ್ಷಣೆಯನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಲು ಪೂರಕವಾಗಿದೆ. ತಾಳ್ಮೆಯ ನಿರ್ಧಾರಗಳಿಂದ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು ಸಾಧ್ಯ.`
        : `The ${bhuktiName} Antardasha brings analytical focus, disciplined work execution, and financial consolidation.`,
      card3Title: isKn ? "🍃 ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ" : "🍃 Live Gochara Transit Effects & Present Transits",
      gocharaText1: isKn
        ? "ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆಗಳನ್ನು ತ್ಯಜಿಸಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿಯಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ದೊರೆಯಲಿದೆ."
        : "Current Saturn transit emphasizes professional discipline and patient effort. Avoiding rushed investments ensures lasting career stability.",
      gocharaText2: isKn
        ? "ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರವು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಇದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಸಮಯ."
        : "Jupiter's favorable transit aspect promotes financial inflow, family harmony, and divine blessings across all endeavors."
    };
  }, [birthKundli, dashaCardsData, code]);


  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───
  const page6Data = React.useMemo(() => {
    if (!birthKundli) return [];
    const isKn = code === "kn";
    const isHi = code === "hi";

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const now = new Date();
    const curMonthIdx = now.getMonth();
    const curYear = now.getFullYear();

    const themesKn = [
      { badge: "💼 ವೃತ್ತಿ & ಅಧಿಕಾರ", f1: "ಉದ್ಯೋಗದಲ್ಲಿ ನೂತನ ಅವಕಾಶ ಹಾಗೂ ಅಧಿಕಾರ ವೃದ್ಧಿ.", f2: "ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭಕರ ಒಪ್ಪಂದ ಸಿದ್ಧಿ.", f3: "ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ತ್ಯಜಿಸಿ.", f4: "ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ." },
      { badge: "💰 ಧನ & ಆಸ್ತಿ ಸಮೃದ್ಧಿ", f1: "ಶೇರು ಹಾಗೂ ನೂತನ ಆಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಲಾಭ.", f2: "ಹಳೆಯ ಬಾಕಿ ಸಾಲಗಳು ಮುಕ್ತಾಯ.", f3: "ಖರ್ಚುಗಳನ್ನು ನಿಯಂತ್ರಣದಲ್ಲಿಡಿ.", f4: "ಶ್ರೀ ಲಕ್ಷ್ಮೀ ಪೂಜೆ ಮಾಡಿ." },
      { badge: "🏫 ಕುಟುಂಬ & ಸುಖ", f1: "ಗೃಹದಲ್ಲಿ ಶುಭ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಗ.", f2: "ದಾಂಪತ್ಯದಲ್ಲಿ ಪರಸ್ಪರ ಪ್ರೀತಿ ವೃದ್ಧಿ.", f3: "ಹಿರಿಯರ ಆರೋಗ್ಯ ಗಮನಿಸಿ.", f4: "ಶ್ರೀ ಶಿವಪೂಜೆ ನೆರವೇರಿಸಿ." },
      { badge: "🎓 ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ", f1: "ಪರೀಕ್ಷೆ ಹಾಗೂ ನೂತನ ಕಲಿಕೆಯಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಯಶಸ್ಸು.", f2: "ಬೌದ್ಧಿಕ ಕೌಶಲ್ಯಗಳಿಂದ ಗೌರವ.", f3: "ಏಕಾಗ್ರತೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ.", f4: "ಶ್ರೀ ಸರಸ್ವತಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ." },
      { badge: "👑 ರಾಜಯೋಗ & ಭಾಗ್ಯ", f1: "ಉನ್ನತ ಪ್ರಮೋಷನ್ ಹಾಗೂ ವಿದೇಶಿ ಪ್ರಯಾಣ ಯೋಗ.", f2: "ಸಾಮಾಜಿಕ ಸ್ಥಾನಮಾನ ವೃದ್ಧಿ.", f3: "ಅಹಂಕಾರ ದೂರವಿಡಿ.", f4: "ಶ್ರೀ ದತ್ತಾತ್ರೇಯ ಜಪ ಮಾಡಿ." },
      { badge: "🛡️ ಆರೋಗ್ಯ & ರಕ್ಷಣೆ", f1: "ಆರೋಗ್ಯ ಚೇತರಿಕೆ ಹಾಗೂ ಶತ್ರು ಜಯ ಸಿದ್ಧಿ.", f2: "ಮನಸ್ಸಿನಲ್ಲಿ ಶಾಂತಿ ಹಾಗೂ ಉತ್ಸಾಹ.", f3: "ಆಹಾರ ನಿಯಮ ಪಾಲಿಸಿ.", f4: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಪೂಜೆ ಮಾಡಿ." },
      { badge: "🕊️ ಶಾಂತಿ & ದೈವಿಕ ಅನುಗ್ರಹ", f1: "ದೇವತಾ ದರ್ಶನ ಹಾಗೂ ಪವಿತ್ರ ಯಾತ್ರಾ ಸಿದ್ಧಿ.", f2: "ಆಧ್ಯಾತ್ಮಿಕ ಚಿಂತನೆ ಹೆಚ್ಚಳ.", f3: "ಸಮಯ ವ್ಯರ್ಥ ಮಾಡದಿರಿ.", f4: "ಶ್ರೀ ಗಣೇಶ ಹೋಮ ಮಾಡಿ." },
      { badge: "🌟 ಸಮಗ್ರ ಸಿದ್ಧಿ & ಯಶಸ್ಸು", f1: "ವರ್ಷದ ಅತ್ಯಂತ ಶುಭ ಫಲಗಳ ಸಮೃದ್ಧಿ.", f2: "ಸಕಲ ಪ್ರಯತ್ನಗಳಲ್ಲೂ ವಿಜಯಪ್ರದ.", f3: "ಕೃತಜ್ಞತೆ ಸಲ್ಲಿಸಿ.", f4: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪೂಜೆ." }
    ];

    const themesEn = [
      { badge: "💼 Career & Leadership", f1: "New career opportunities and role advancement.", f2: "Profitable business terms.", f3: "Avoid hasty decisions.", f4: "Recite Sri Hanuman Chalisa." },
      { badge: "💰 Financial Growth", f1: "Profits from assets and prudent investments.", f2: "Resolution of pending dues.", f3: "Control unnecessary expenses.", f4: "Perform Sri Lakshmi Puja." },
      { badge: "🏫 Family & Harmony", f1: "Auspicious events and celebrations at home.", f2: "Marital peace and happiness.", f3: "Care for elders' health.", f4: "Perform Sri Shiva Puja." },
      { badge: "🎓 Wisdom & Knowledge", f1: "Academic success and exam accomplishments.", f2: "Intellectual recognition.", f3: "Maintain daily focus.", f4: "Pray to Goddess Saraswati." },
      { badge: "👑 Raja Yoga & Fortune", f1: "Promotions and favorable travel opportunities.", f2: "Enhanced social standing.", f3: "Stay humble and patient.", f4: "Recite Sri Dattatreya Mantra." },
      { badge: "🛡️ Health & Vitality", f1: "Health improvements and overcoming obstacles.", f2: "Mental peace and energy.", f3: "Follow healthy diet routines.", f4: "Worship Lord Subrahmanya." },
      { badge: "🕊️ Spiritual Blessings", f1: "Sacred pilgrimages and temple visits.", f2: "Spiritual clarity.", f3: "Utilize time productively.", f4: "Perform Sri Ganesha Puja." },
      { badge: "🌟 Total Fulfillment", f1: "Overall prosperity and task completion.", f2: "Success in key initiatives.", f3: "Maintain gratitude.", f4: "Worship Lord Mahabaleshwara." }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const mIdx = (curMonthIdx + i) % 12;
      const yr = curYear + Math.floor((curMonthIdx + i) / 12);
      const mName = isKn ? monthsKn[mIdx] : monthsEn[mIdx];
      const mTitle = isKn ? `${toKnDigits(i + 1)} ನೇ ತಿಂಗಳು (${mName} ${toKnDigits(yr)})` : `Month ${i + 1} (${mName} ${yr})`;
      const theme = isKn ? themesKn[i % 8] : themesEn[i % 8];

      return {
        mTitle,
        badge: theme.badge,
        f1: theme.f1,
        f2: theme.f2,
        f3: theme.f3,
        f4: theme.f4
      };
    });
  }, [birthKundli, code]);





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
    const rashiRemedyMapL5: Record<number, Record<string, { gem: string; rudraksha: string; color: string; day: string }>> = {
    0: {
      kn: { gem: "ಪವಳ (ರಕ್ತ ಹವಳ)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು", day: "ಮಂಗಳವಾರ" },
      en: { gem: "Red Coral", rudraksha: "3 Mukhi Rudraksha", color: "Red", day: "Tuesday" },
      hi: { gem: "मूंगा (रक्त मूंगा)", rudraksha: "3 मुखी रुद्राक्ष", color: "लाल", day: "मंगलवार" },
      te: { gem: "పగడము", rudraksha: "3 ముఖీ రుద్రాక్ష", color: "ఎరుపు", day: "మంగళవారం" },
      ta: { gem: "பவளம்", rudraksha: "3 முக ருத்ராட்சம்", color: "சிவப்பு", day: "செவ்வாய்" }
    },
    1: {
      kn: { gem: "ವಜ್ರ (ಝಿರ್ಕಾನ್)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ", day: "ಶುಕ್ರವಾರ" },
      en: { gem: "Diamond / Zircon", rudraksha: "6 Mukhi Rudraksha", color: "White", day: "Friday" },
      hi: { gem: "हीरा / जरकन", rudraksha: "6 मुखी रुद्राक्ष", color: "सफेद", day: "शुक्रवार" },
      te: { gem: "వజ్రము", rudraksha: "6 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "శుక్రవారం" },
      ta: { gem: "வைரம்", rudraksha: "6 முக ருத்ராட்சம்", color: "வெள்ளை", day: "வெள்ளி" }
    },
    2: {
      kn: { gem: "ಮರಕತ ಪಚ್ಚೆ", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು", day: "ಬುಧವಾರ" },
      en: { gem: "Emerald", rudraksha: "4 Mukhi Rudraksha", color: "Green", day: "Wednesday" },
      hi: { gem: "पन्ना", rudraksha: "4 मुखी रुद्राक्ष", color: "हरा", day: "बुधवार" },
      te: { gem: "పచ్చ", rudraksha: "4 ముఖీ రుద్రాక్ష", color: "పచ్చ", day: "బుధవారం" },
      ta: { gem: "மரகதம்", rudraksha: "4 முக ருத்ராட்சம்", color: "பச்சை", day: "புதன்" }
    },
    3: {
      kn: { gem: "ಶುದ್ಧ ಮುತ್ತು", rudraksha: "೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ / ಬೆಳ್ಳಿ", day: "ಸೋಮವಾರ" },
      en: { gem: "Pearl", rudraksha: "2 Mukhi Rudraksha", color: "White / Silver", day: "Monday" },
      hi: { gem: "मोती", rudraksha: "2 मुखी रुद्राक्ष", color: "सफेद / चांदी", day: "सोमवार" },
      te: { gem: "ముత్యము", rudraksha: "2 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "సోమవారం" },
      ta: { gem: "முத்து", rudraksha: "2 முக ருத்ராட்சம்", color: "வெள்ளை", day: "திங்கள்" }
    },
    4: {
      kn: { gem: "ಮಾಣಿಕ್ಯ (ಕೆಂಪು ಮಾಣಿಕ್ಯ)", rudraksha: "೧೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಿತ್ತಳೆ", day: "ಭಾನುವಾರ" },
      en: { gem: "Ruby", rudraksha: "12 Mukhi Rudraksha", color: "Orange / Red", day: "Sunday" },
      hi: { gem: "माणिक्य", rudraksha: "12 मुखी रुद्राक्ष", color: "नारंगी", day: "रविवार" },
      te: { gem: "మాణిక్యం", rudraksha: "12 ముఖీ రుద్రాక్ష", color: "నారెంజి", day: "ఆదివారం" },
      ta: { gem: "மாணிக்கம்", rudraksha: "12 முக ருத்ராட்சம்", color: "ஆரஞ்சு", day: "ஞாயிறு" }
    },
    5: {
      kn: { gem: "ಮರಕತ ಪಚ್ಚೆ", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು", day: "ಬುಧವಾರ" },
      en: { gem: "Emerald", rudraksha: "4 Mukhi Rudraksha", color: "Green", day: "Wednesday" },
      hi: { gem: "पन्ना", rudraksha: "4 मुखी रुद्राक्ष", color: "हरा", day: "बुधवार" },
      te: { gem: "పచ్చ", rudraksha: "4 ముఖీ రుద్రాక్ష", color: "పచ్చ", day: "బుధవారం" },
      ta: { gem: "மரகதம்", rudraksha: "4 முக ருத்ராட்சம்", color: "பச்சை", day: "புதன்" }
    },
    6: {
      kn: { gem: "ವಜ್ರ (ಝಿರ್ಕಾನ್)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ", day: "ಶುಕ್ರವಾರ" },
      en: { gem: "Diamond", rudraksha: "6 Mukhi Rudraksha", color: "White", day: "Friday" },
      hi: { gem: "हीरा", rudraksha: "6 मुखी रुद्राक्ष", color: "सफेद", day: "शुक्रवार" },
      te: { gem: "వజ్రము", rudraksha: "6 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "శుక్రవారం" },
      ta: { gem: "வைரம்", rudraksha: "6 முக ருத்ராட்சம்", color: "வெள்ளை", day: "வெள்ளி" }
    },
    7: {
      kn: { gem: "ಪವಳ (ರಕ್ತ ಹವಳ)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು", day: "ಮಂಗಳವಾರ" },
      en: { gem: "Red Coral", rudraksha: "3 Mukhi Rudraksha", color: "Red", day: "Tuesday" },
      hi: { gem: "मूंगा", rudraksha: "3 मुखी रुद्राक्ष", color: "लाल", day: "मंगलवार" },
      te: { gem: "పగడము", rudraksha: "3 ముఖీ రుద్రాక్ష", color: "ఎరుపు", day: "మంగళవారం" },
      ta: { gem: "பவளம்", rudraksha: "3 முக ருத்ராட்சம்", color: "சிவப்பு", day: "செவ்வாய்" }
    },
    8: {
      kn: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ", day: "ಗುರುವಾರ" },
      en: { gem: "Yellow Sapphire", rudraksha: "5 Mukhi Rudraksha", color: "Yellow", day: "Thursday" },
      hi: { gem: "पुखराज", rudraksha: "5 मुखी रुद्राक्ष", color: "पीला", day: "गुरुवार" },
      te: { gem: "పుష్యరాగం", rudraksha: "5 ముఖీ రుద్రాక్ష", color: "పసుపు", day: "గురువారం" },
      ta: { gem: "புஷ்பராகம்", rudraksha: "5 முக ருத்ராட்சம்", color: "மஞ்சள்", day: "வியாழன்" }
    },
    9: {
      kn: { gem: "ಇಂದ್ರ ನೀಲ", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಪ್ಪು / ನೀಲಿ", day: "ಶನಿವಾರ" },
      en: { gem: "Blue Sapphire", rudraksha: "7 Mukhi Rudraksha", color: "Black / Blue", day: "Saturday" },
      hi: { gem: "नीलम", rudraksha: "7 मुखी रुद्राक्ष", color: "काला / नीला", day: "शनिवार" },
      te: { gem: "నీలము", rudraksha: "7 ముఖీ రుద్రాక్ష", color: "నలుపు / నీలం", day: "శనివారం" },
      ta: { gem: "நீலம்", rudraksha: "7 முக ருத்ராட்சம்", color: "கருப்பு / நீலம்", day: "சனி" }
    },
    10: {
      kn: { gem: "ಇಂದ್ರ ನೀಲ", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ನೀಲಿ", day: "ಶನಿವಾರ" },
      en: { gem: "Blue Sapphire", rudraksha: "7 Mukhi Rudraksha", color: "Blue", day: "Saturday" },
      hi: { gem: "नीलम", rudraksha: "7 मुखी रुद्राक्ष", color: "नीला", day: "शनिवार" },
      te: { gem: "నీలము", rudraksha: "7 ముఖీ రుద్రాక్ష", color: "నీలం", day: "శనివారం" },
      ta: { gem: "நீலம்", rudraksha: "7 முக ருத்ராட்சம்", color: "நீலம்", day: "சனி" }
    },
    11: {
      kn: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ", day: "ಗುರುವಾರ" },
      en: { gem: "Yellow Sapphire", rudraksha: "5 Mukhi Rudraksha", color: "Yellow", day: "Thursday" },
      hi: { gem: "पुखराज", rudraksha: "5 मुखी रुद्राक्ष", color: "पीला", day: "गुरुवार" },
      te: { gem: "పుష్యరాగం", rudraksha: "5 ముఖీ రుద్రాక్ష", color: "పసుపు", day: "గురువారం" },
      ta: { gem: "புஷ்பராகம்", rudraksha: "5 முக ருத்ராட்சம்", color: "மஞ்சள்", day: "வியாழன்" }
    }
  };
  const rashiRemedy = rashiRemedyMapL5[rashiIdx]?.[code] || rashiRemedyMapL5[rashiIdx]?.kn || rashiRemedyMapL5[5].kn;

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
          
          {/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Compact Height & Crisp Typography */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "8px 16px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>
            {/* Sloka Header Row - High Definition Vector Gold Emblems */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "4px"
            }}>
              {/* Left Emblem: Gokarna Atmalinga & Sacred Trishula Vector Crest */}
              <svg width="34" height="34" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>
                <defs>
                  <linearGradient id="goldBgGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="trishulGold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#78350F" />
                    <stop offset="100%" stopColor="#451A03" />
                  </linearGradient>
                </defs>
                <circle cx="23" cy="23" r="21" fill="url(#goldBgGradLeft)" stroke="#B45309" strokeWidth="2" />
                <circle cx="23" cy="23" r="18" stroke="#92400E" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                <path d="M23 9 V37 M15 13 C15 22 23 25 23 25 C23 25 31 22 31 13 M15 13 L12 9 M31 13 L34 9 M23 9 L23 6 L21 9 H25 L23 6 Z" stroke="url(#trishulGold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="23" cy="24" r="2" fill="#78350F" />
              </svg>

              <div style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#92400E",
                lineHeight: "1.6",
                flex: 1
              }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>

              {/* Right Emblem: Gokarna Sacred Jyoti Deepa Vector Crest */}
              <svg width="34" height="34" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>
                <defs>
                  <linearGradient id="goldBgGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="flameOrange" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>
                <circle cx="23" cy="23" r="21" fill="url(#goldBgGradRight)" stroke="#B45309" strokeWidth="2" />
                <circle cx="23" cy="23" r="18" stroke="#92400E" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                <path d="M12 28 C12 34 34 34 34 28 C34 25 12 25 12 28 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
                <path d="M23 9 C19 17 19 23 23 25 C27 23 27 17 23 9 Z" fill="url(#flameOrange)" stroke="#B45309" strokeWidth="1.2" />
                <circle cx="23" cy="20" r="2" fill="#FEF3C7" />
              </svg>
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

              {/* Card 4: Gotra (if available) OR Birth Yoga fallback (if Gotra is missing) */}
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
                <span style={{ fontSize: "17px" }}>{hasGotra ? "🔱" : "✨"}</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {hasGotra 
                      ? (PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra 
                      : (PAGE1_DICT[code] || PAGE1_DICT.en).lblYoga}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {hasGotra ? finalGotra : calculateBirthYoga(birthKundli, isKn)}
                  </span>
                </div>
              </div>

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

              {/* Card 7: Astrology Book Sacred Place */}
              <div style={{
                gridColumn: "span 2",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>🛕</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).valPob}
                  </span>
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

          {/* Authentic Traditional Birth Panchanga Box */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              📜 {isKn ? "ಜನನ ಸಮಯದ ಶುಭ-ಪಂಚಾಂಗ ಗಣನೆಗಳು:" : "Birth Panchanga Calculations:"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: "12px", lineHeight: "1.55" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ತಿಥಿ & ಪಕ್ಷ:" : "Tithi & Paksha:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.tithiKn} (${traditionalPanchanga.pakshaKn} ಪಕ್ಷ)` : (isKn ? "ದ್ವಿತೀಯಾ (ಶುಕ್ಲ ಪಕ್ಷ)" : "Dwitiya (Shukla Paksha)")}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಕರಣ & ಯೋಗ:" : "Karana & Yoga:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.karanaKn} ಕರಣ · ${traditionalPanchanga.yogaKn} ಯೋಗ` : (isKn ? "ಬಾಲವ ಕರಣ · ಬ್ರಹ್ಮ ಯೋಗ" : "Balava Karana · Brahma Yoga")}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಘಟಿ / ವಿಘಟಿ:" : "Ghati / Vighati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.tithiGhati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.tithiVighati)} ವಿಘಟಿ` : "೪೨ ಘಟಿ ೪೮ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಿವಾ ಘಟಿ:" : "Diva Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.divaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.divaGhati.vighati)} ವಿಘಟಿ` : "೩೨ ಘಟಿ ೧೨ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಅಮೃತ ಘಟಿ:" : "Amrita Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.amrithaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.amrithaGhati.vighati)} ವಿಘಟಿ` : "೪೪ ಘಟಿ ೦೬ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ವಿಷ ಘಟಿ:" : "Visha Ghati:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.vishaGhati.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.vishaGhati.vighati)} ವಿಘಟಿ` : "೨೦ ಘಟಿ ೦೬ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ಸೂರ್ಯೋದಯಾದಿತ:" : "Suryodayadita:"}</strong> {traditionalPanchanga ? `${toKnDigits(traditionalPanchanga.suryodhayadgata.ghati)} ಘಟಿ ${toKnDigits(traditionalPanchanga.suryodhayadgata.vighati)} ವಿಘಟಿ` : "೩೨ ಘಟಿ ೫೫ ವಿಘಟಿ"}</div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {traditionalPanchanga ? `${(traditionalPanchanga.dashaLord ? (PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.[code] || PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.kn || PLANET_KN_MAP[traditionalPanchanga.dashaLord] || traditionalPanchanga.dashaLord) : (isKn ? "ಚಂದ್ರ" : "Moon"))} ${isKn ? "ಮಹಾದಶಾ" : "Mahadasha"} ${toKnDigits(traditionalPanchanga.dashaYears ?? 0)} ${isKn ? "ವರ್ಷ" : "y"} ${toKnDigits(traditionalPanchanga.dashaMonths ?? 0)} ${isKn ? "ತಿಂಗಳು" : "m"} ${toKnDigits(traditionalPanchanga.dashaDays ?? 0)} ${isKn ? "ದಿನ" : "d"}` : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ" : "Moon Dasha 4y 0m 5d")}</div>
            </div>
          </div>

          {/* Dynamic D1 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            {renderSouthIndianGrid(birthKundli, false, code, displayName, dobStr, tobStr)}
          </div>

          {/* D9 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #D97706",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
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

          {/* 5 Dynamic Dasha-Bhukti Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dashaCardsData.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: card.isCurrent ? "#FFFBEB" : "#FFFFFF",
                  border: card.isCurrent ? "2px solid #F59E0B" : "1.5px solid #FCD34D",
                  borderRadius: "8px",
                  padding: "10px 14px 12px 14px",
                  boxShadow: card.isCurrent ? "0 3px 8px rgba(245, 158, 11, 0.12)" : "0 2px 5px rgba(0, 0, 0, 0.03)"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: card.isCurrent ? 900 : 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.3" }}>
                    📌 {card.mahaName} {code === "kn" ? "ಮಹಾದಶಾ" : "Mahadasha"} • {card.bhuktiName} {code === "kn" ? "ಅಂತರ್ದಶಾ" : "Antardasha"} {card.isCurrent ? (code === "kn" ? "(ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)" : "(Current Period)") : ""}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "#92400E",
                    background: card.isCurrent ? "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)" : "#FEF3C7",
                    border: "1px solid #F59E0B",
                    padding: "3px 12px",
                    borderRadius: "14px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: "1.2"
                  }}>
                    <span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{card.badgeText}</span>
                  </span>
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
                  lineHeight: "1.3"
                }}>
                  <span style={{ transform: "translateY(-3px)", display: "inline-block" }}>
                    🗓️ {code === "kn" ? "ಅವಧಿ" : "Period"}: {code === "kn" ? toKnDigits(card.startYmd) : card.startYmd} {code === "kn" ? "ರಿಂದ" : "to"} {code === "kn" ? toKnDigits(card.endYmd) : card.endYmd} | ({code === "kn" ? "ವಯಸ್ಸು" : "Age"}: {code === "kn" ? toKnDigits(card.startAgeInt) : card.startAgeInt} - {code === "kn" ? toKnDigits(card.endAgeInt) : card.endAgeInt} {code === "kn" ? "ವರ್ಷ" : "Years"} {card.isCurrent ? (code === "kn" ? "- ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ" : "- Current Active") : ""})
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12.5px", lineHeight: "1.5" }}>
                  <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>{code === "kn" ? "ವೃತ್ತಿ & ಅಧಿಕಾರ:" : "Career & Position:"}</strong> {card.careerText}</div>
                  <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>{code === "kn" ? "ಧನ & ಆಸ್ತಿ:" : "Finance & Wealth:"}</strong> {card.financeText}</div>
                  <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>{code === "kn" ? "ಕುಟುಂಬ ಸುಖ:" : "Family & Peace:"}</strong> {card.familyText}</div>
                  <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Sacred Remedy:"}</strong> {card.remedyText}</div>
                </div>
              </div>
            ))}
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
          PAGE 4: 100% DYNAMIC NATAL PLANETS, YOGAS & DOSHAS ANALYSIS
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
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೩: ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹ ಸ್ಥಿತಿ, ಯೋಗಗಳು ಹಾಗೂ ದೋಷ ವಿಶ್ಲೇಷಣೆ" : "Chapter 3: Natal Planetary Positions, Yogas & Karmic Analysis"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜಾತಕದ ನವಗ್ರಹಗಳ ಸ್ಥಾನ ಬಲ, ಸಿದ್ಧಿಸಿರುವ ಶುಭ ಯೋಗಗಳು ಹಾಗೂ ದೋಷ ಶಮನ ಮಾರ್ಗದರ್ಶನ" : "Detailed breakdown of natal planets, active Yogas, and sacred Vedic remedies."}
            </div>
          </div>

          {/* 3 Main Analysis Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Natal Planets */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card1Title || "🌌 ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಬಲ"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಸ್ಥಾನ ಬಲ" : "Natal Strength"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page4Data?.card1Text}
              </div>
            </div>

            {/* Card 2: Auspicious Yogas */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card2Title || "✨ ಪ್ರಮುಖ ಶುಭ ಯೋಗಗಳು"}</span>
                <span style={{ fontSize: "11px", color: "#78350F", background: "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)", border: "1px solid #D97706", padding: "2px 10px", borderRadius: "12px", fontWeight: 800 }}>{code === "kn" ? "ರಾಜಯೋಗ ಸಿದ್ಧಿ" : "Auspicious Yogas"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {page4Data?.yogas.map((y, idx) => (
                  <div key={idx} style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", border: "1px solid #FCD34D", padding: "6px 12px", borderRadius: "6px" }}>
                    🌟 {y}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Karmic Doshas & Remedies */}
            <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card3Title || "🛡️ ಗ್ರಹ ದೋಷ ಶಮನ & ಪರಿಹಾರ"}</span>
                <span style={{ fontSize: "11px", color: "#991B1B", background: "#FEE2E2", border: "1px solid #F87171", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ದೋಷ ಶಾಂತಿ" : "Vedic Remedy"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                {page4Data?.doshas.map((d, idx) => (
                  <div key={idx} style={{ fontSize: "12px", color: "#7F1D1D", fontWeight: 600 }}>
                    • {d}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 700, background: "#FFFFFF", border: "1px solid #FCA5A5", padding: "6px 10px", borderRadius: "6px" }}>
                🕉️ {code === "kn" ? "ಸಿದ್ಧ ಪರಿಹಾರ:" : "Remedy:"} {page4Data?.remedy}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: 100% DYNAMIC PRESENT DASHA-BHUKTI & GOCHARA TRANSITS
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{ textAlign: "center", background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)", border: "2px solid #D97706", borderRadius: "8px", padding: "6px 12px", boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)" }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೪: ವರ್ತಮಾನ ದಶಾ-ಭುಕ್ತಿ ಫಲಗಳು ಹಾಗೂ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ" : "Chapter 4: Active Dasha-Bhukti & Planetary Transits"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ವರ್ತಮಾನ ದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿಯ ನಿಖರ ಫಲಗಳು ಹಾಗೂ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ" : "In-depth synthesis of current planetary chapters and live Gochara transits."}
            </div>
          </div>

          {/* 3 Main Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Mahadasha */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card1Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಮಹಾ ಅಧ್ಯಾಯ" : "Major Chapter"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.card1Text}
              </div>
            </div>

            {/* Card 2: Antardasha */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card2Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಅಂತರ್ದಶಾ ಅವಧಿ" : "Sub Period"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.card2Text}
              </div>
            </div>

            {/* Card 3: Gochara */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card3Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ವರ್ತಮಾನ ಗೋಚಾರ" : "Live Transits"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginBottom: "8px" }}>
                {page5Data?.gocharaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                {page5Data?.gocharaText2}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% DYNAMIC 8-MONTH PLANETARY ROADMAP (240 DAYS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "7px", padding: "16px" }}>
          {/* Header Box */}
          <div style={{ textAlign: "center", background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)", border: "2px solid #D97706", borderRadius: "8px", padding: "6px 12px", boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)" }}>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#78350F", lineHeight: "1.2" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
            </div>
          </div>

          {/* Transition Alert Banner */}
          <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "7px", padding: "5px 12px", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>⚠️</span>
            <div style={{ fontSize: "11px", color: "#991B1B", fontWeight: 700, lineHeight: "1.3" }}>
              {code === "kn" ? "ವಿಶೇಷ ಸೂಚನೆ: ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ಗ್ರಹ ಸಂಚಾರ ಬದಲಾವಣೆ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ತಾಳ್ಮೆ ಮತ್ತು ನಿರಂತರ ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Notice: Maintain patience and perform regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 8 Monthly Cards (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {page6Data.map((mCard, idx) => (
              <div key={idx} style={{ background: "#FFFDF7", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🗓️ {mCard.mTitle}</span>
                  <span style={{ fontSize: "10.5px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    {mCard.badge}
                  </span>
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", color: "#3F2A12" }}>
                  <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>{code === "kn" ? "ಫಲಾಫಲ:" : "Vibe:"}</strong> {mCard.f1}</div>
                  <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#047857" }}>{code === "kn" ? "ಸಾಧನೆ:" : "Focus:"}</strong> {mCard.f2}</div>
                  <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>{code === "kn" ? "ಸವಾಲು:" : "Caution:"}</strong> {mCard.f3}</div>
                  <div>4. <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ಮಾರ್ಗದರ್ಶನ:" : "Remedy:"}</strong> {mCard.f4}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "7px", padding: "6px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* {/* ─────────────────────────────────────────────────────────────
          PAGE 7: ROYAL 90-DAY CALENDAR SYNC & QR REDIRECTION GUIDE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "14px" }}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "11px 16px",
            borderRadius: "12px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "17px", fontWeight: 800, textTransform: "uppercase", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).chapterTitle}
            </div>
            <div style={{ fontSize: "11.5px", color: "#FDE68A", fontWeight: 600, marginTop: "3px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).subTitle}
            </div>
          </div>

          {/* Section 1: Personalized 90-Day Calendar Speciality Intro (Devotee Name Direct) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "11px 16px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroHeader}
            </div>
            <div style={{ fontSize: "12.5px", lineHeight: "1.65", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroText(displayName)}
            </div>
          </div>

          {/* Section 2: Step-by-Step Installation Instructions (Larger Font 13px) */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "12px 16px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).installHeader}
            </div>
            <div style={{ fontSize: "13px", lineHeight: "1.7", color: "#3F2A12", display: "flex", flexDirection: "column", gap: "5px" }}>
              <div>📲 {(PAGE7_DICT[code] || PAGE7_DICT.en).step1}</div>
              <div>🌐 {(PAGE7_DICT[code] || PAGE7_DICT.en).step2}</div>
              <div>📂 {(PAGE7_DICT[code] || PAGE7_DICT.en).step3}</div>
              <div>📅 {(PAGE7_DICT[code] || PAGE7_DICT.en).step4}</div>
              <div>🔔 {(PAGE7_DICT[code] || PAGE7_DICT.en).step5}</div>
            </div>
          </div>

          {/* Section 3: Royal Gold Scannable QR Code Box (CENTERED & ENLARGED 260px) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "16px 24px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            width: "fit-content"
          }}>
            {qrDataUrl ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <img 
                  src={qrDataUrl} 
                  alt="90-Day Calendar Sync QR Code" 
                  style={{ 
                    width: "260px", 
                    height: "260px", 
                    border: "2.5px solid #B45309", 
                    borderRadius: "12px", 
                    padding: "6px",
                    background: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(120, 53, 15, 0.15)"
                  }} 
                />
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginTop: "8px" }}>
                  {(PAGE7_DICT[code] || PAGE7_DICT.en).qrCaption}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px", color: "#B45309", fontSize: "13.5px", fontWeight: 700 }}>
                📲 ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
              </div>
            )}
          </div>

          {/* Section 4: Daily Calendar Event URL Redirection Guide (Explicit 4-Tab Guidance) */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)",
            border: "1.5px solid #B45309",
            borderRadius: "10px",
            padding: "11px 16px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectHeader}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectText(displayName)}
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
          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "11px 16px",
            borderRadius: "12px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, textTransform: "uppercase", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              ಅಧ್ಯಾಯ ೭: ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ ಸಿದ್ಧ ಉಪಾಯಗಳು
            </div>
            <div style={{ fontSize: "11.5px", opacity: 0.95, marginTop: "3px", fontWeight: 600, color: "#FFFDF7" }}>
              ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ ನಿತ್ಯ ಪಠಿಸುವ ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ, ನವಗ್ರಹ ದೇವತಾ ಪೂಜೆ & ದೈವಿಕ ಪರಿಹಾರ ಗ್ರಂಥ
            </div>
          </div>

          {/* Block 1: Devotee Kundli & Nakshatra Stotra (Gold & Amber Box) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "11px 14px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #FCD34D", paddingBottom: "6px", marginBottom: "7px" }}>
              <span style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F" }}>
                🏺 ಜನ್ಮ ಕುಂಡಲಿ & ನಕ್ಷತ್ರ ದೇವತಾ ಸಿದ್ಧ ಜಪ:
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "3px 10px", borderRadius: "6px", border: "1px solid #F59E0B" }}>
                ಜಾತಕ: {rashiName} · {nakName} {pada} ಚರಣ · {lagnaRashiName} ಲಗ್ನ
              </span>
            </div>
            <div style={{ fontSize: "12px", color: "#451A03", lineHeight: "1.6", fontWeight: 600, textAlign: "center" }}>
              <span style={{ color: "#78350F", fontWeight: 800, fontSize: "13px" }}>॥ ನವಗ್ರಹ & ನಕ್ಷತ್ರ ಪೀಡಾಪರಿಹಾರ ಸ್ತೋತ್ರ ॥</span><br/>
              <span style={{ fontStyle: "italic", color: "#92400E", fontWeight: 700, fontSize: "12.5px" }}>
                "ॐ ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ । ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
              </span><br/>
              <span style={{ color: "#B45309", fontSize: "11px" }}>(ದಿನನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ೨೧ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಗ್ರಹ ದೋಷ ಶಮನ ಹಾಗೂ ಅಭಯ ಪ್ರಾಪ್ತಿ)</span>
            </div>
          </div>

          {/* Block 2: 4 Altar Japa Mantras Grid */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "11px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "7px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
              🔱 ಸಿದ್ಧ ೧೦೮ ನಿತ್ಯ ಜಪ ಮಂತ್ರಗಳು (ಮನೆಯ ಪೂಜಾ ಮಂದಿರದ ಜಪ ಗ್ರಂಥ):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
              {/* Mantra 1: Shiva */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
                  🔱 ಶ್ರೀ ಮಹಾದೇವ (ಗೋಕರ್ಣ) ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400E", margin: "2px 0" }}>
                  "ॐ ನಮಃ ಶಿವಾಯ" <span style={{ fontSize: "10.5px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ಆತಂಕ, ರೋಗ ಭಯ ಹಾಗೂ ಜಾತಕ ದೋಷ ನಿವಾರಣೆ.
                </div>
              </div>

              {/* Mantra 2: Mahalakshmi */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
                  💰 ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಧನದಾ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0" }}>
                  "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ನಮಃ" <span style={{ fontSize: "10.5px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ದರಿದ್ರ ನಿವಾರಣೆ, ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಸಾಲ ಮುಕ್ತಿ.
                </div>
              </div>

              {/* Mantra 3: Ganapati */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
                  🐘 ಶ್ರೀ ಗಣಪತಿ ವಿಘ್ನಹರ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#92400E", margin: "2px 0" }}>
                  "ॐ ಗಂ ಗಣಪತಯೇ ನಮಃ" <span style={{ fontSize: "10.5px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ಕಾರ್ಯ ವಿಘ್ನ ಶಮನ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ.
                </div>
              </div>

              {/* Mantra 4: Surya Tejas */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F" }}>
                  ☀️ ಶ್ರೀ ಸೂರ್ಯ ತೇಜೋ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0" }}>
                  "ॐ ಘೃಣಿಃ ಸೂರ್ಯಾಯ ನಮಃ" <span style={{ fontSize: "10.5px", color: "#B45309" }}>(೨೧ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
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
            padding: "11px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "7px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
              🔱 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಪರಿಹಾರ ಸೇವೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "9px" }}>
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "9px 10px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12.5px", marginBottom: "3px" }}>
                  🌿 ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
                  ಆರೋಗ್ಯ ಸ್ಥಿರತೆ, ಆಯುಷ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಸಿದ್ಧಿ ಹಾಗೂ ಕಾಯಾಲೇ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪ್ರತ್ಯಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "9px 10px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12.5px", marginBottom: "3px" }}>
                  🔥 ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾಹವನ
                </div>
                <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
                  ಪ್ರಸ್ತುತ ಜಾತಕ ಗ್ರಹ ದೋಷ, ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧಾ ಮುಕ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕ್ಲೇಶ ನಿವಾರಣೆಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ವಿಶೇಷ ಯಾಗ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "9px 10px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12.5px", marginBottom: "3px" }}>
                  🌺 ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜಾ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
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
            padding: "11px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "7px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
              🌿 ದೈನಂದಿನ ಸಾತ್ವಿಕ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಹಾಗೂ ದಾನ ಮಾರ್ಗದರ್ಶನ:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
              {/* Card 1: Gemstone */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                  💎 ಜಾತಕಾನುಕೂಲ ರತ್ನ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.gem}</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಉಂಗುರದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಜಾತಕದಲ್ಲಿ ಗ್ರಹ ಬಲ ವೃದ್ಧಿ ಹಾಗೂ ಕಾರ್ಯ ಸಿದ್ಧಿ.
                </div>
              </div>

              {/* Card 2: Rudraksha */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                  📿 ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.rudraksha}</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ಕಂಠದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಮನೋಬಲ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಆತಂಕ ಶಮನ.
                </div>
              </div>

              {/* Card 3: Color */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                  🎨 ಶುಭ ವರ್ಣ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.color}</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ಮುಖ್ಯ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವಾಗ ಧರಿಸುವುದರಿಂದ ಸಾನುಕೂಲ ತರಂಗಗಳ ಆಕರ್ಷಣೆ.
                </div>
              </div>

              {/* Card 4: Charity */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 10px"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                  🎁 ಶ್ರೇಷ್ಠ ದಾನ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.day}</span>
                </div>
                <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                  ವಾರದ ಶುಭ ದಿನದಂದು ಸತ್ಪಾತ್ರರಿಗೆ ದಾನ ಮಾಡುವುದರಿಂದ ಗ್ರಹ ಪೀಡಾ ಶಮನ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 5: Devotee Authentic Birth Chart & Planetary Defense Siddha Sloka (Gold Parchment Card) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "10px",
            padding: "11px 16px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.08)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaHeader(displayName)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", fontStyle: "italic", margin: "4px 0", lineHeight: "1.5" }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaMantra}
            </div>
            <div style={{ fontSize: "11px", color: "#451A03", lineHeight: "1.45", fontWeight: 600 }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaPhala}
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
    </div>
  );
};
