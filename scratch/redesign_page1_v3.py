import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Clean RASHI_KN_MAP to contain pure Kannada strings without English brackets
old_rashi_map = """const RASHI_KN_MAP: Record<number, string> = {
  0: "ಮೇಷ (Mesha)",
  1: "ವೃಷಭ (Vrishabha)",
  2: "ಮಿಥುನ (Mithuna)",
  3: "ಕರ್ಕಾಟಕ (Karka)",
  4: "ಸಿಂಹ (Simha)",
  5: "ಕನ್ಯಾ (Kanya)",
  6: "ತುಲಾ (Tula)",
  7: "ವೃಶ್ಚಿಕ (Vrischika)",
  8: "ಧನುಸ್ಸು (Dhanus)",
  9: "ಮಕರ (Makara)",
  10: "ಕುಂಭ (Kumbha)",
  11: "ಮೀನ (Meena)"
};"""

new_rashi_map = """const RASHI_KN_MAP: Record<number, string> = {
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
};"""

if old_rashi_map in content:
    content = content.replace(old_rashi_map, new_rashi_map)

# 2. Update PAGE1_DICT with enriched, 100% accurate personalized text, larger font references, and pure language formatting
old_dict = re.search(r'const PAGE1_DICT: Record<string, [\s\S]*?\} = \{[\s\S]*?\n\};', content)

new_dict = '''const PAGE1_DICT: Record<string, {
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
  para1: (rashi: string, nak: string, pada: number, lagna: string, dob: string, tob: string) => string;
  para2: string;
  para3: (name: string, rashiLord: string, lagnaLord: string) => string;
  footerMotto: string;
  footerPriest: (pandit: string) => string;
}> = {
  kn: {
    sloka: "❖ ॥ ॐ ನಮಃ ಪ್ರಣವಾರ್ಥಾಯ ಶುದ್ಧಜ್ಞಾನೈಕಮೂರ್ತಯೇ । ನಿರ್ಮಲಾಯ ಪ್ರಶಾಂತಾಯ ದಕ್ಷಿಣಾಮೂರ್ತಯೇ ನಮಃ ॥ ❖",
    title: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    subTitle: "🕉️ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರ ದೈವಿಕ ಅನುಗ್ರಹ ವೈಯಕ್ತಿಕ ಮಹಾ ಗ್ರಂಥ",
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
    salutation: (name, pandit) => `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಿಂದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ${pandit} ಅವರು ಆತ್ಮೀಯ ಭಕ್ತರಾದ ${name} ಅವರಿಗೆ ಸಲ್ಲಿಸುವ ಪವಿತ್ರ ಶುಭಾಶೀರ್ವಾದಗಳು.`,
    para1: (rashi, nak, pada, lagna, dob, tob) => `ನಿಮ್ಮ ಪವಿತ್ರ ಜನನ ದಿನಾಂಕ ${dob} ಹಾಗೂ ಸಮಯ ${tob} ರ ಆಧಾರದ ಮೇಲೆ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಅಥೆಂಟಿಕ್ ಪಂಚಾಂಗ ಗಣಿತದಿಂದ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${lagna}, ಚಂದ್ರ ರಾಶಿಯು ${rashi} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರವು ${nak} (${pada}ನೇ ಪಾದ) ಎಂದು ೧೦೦% ನಿಖರವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯವು ಭಗವಂತನು ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ನೀಡಿದ ದೈವಿಕ ದಾರಿ ದೀಪವಾಗಿದೆ.`,
    para2: "ಈ ೮ ಪುಟಗಳ ರಾಯಲ್ ವೈಯಕ್ತಿಕ ಗ್ರಂಥವನ್ನು ಕೇವಲ ನಿಮಗಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಮುಂದಿನ ಪುಟಗಳಲ್ಲಿ (ಪುಟ ೨ ರಿಂದ ೮) ನಿಮ್ಮ ೧೦೦% ಸತ್ಯವಾದ ಜನ್ಮ ಕುಂಡಲಿ, ನವಗ್ರಹ ಸ್ಪಷ್ಟ ಭಾವ ಸ್ಥಾನಗಳು, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಚಲನೆಗಳು, ವಿಂಶೋತ್ತರಿ ದಶಾ-ಭುಕ್ತಿ ಕಾಲಮಾನ, ನಿತ್ಯ ಸಂಧ್ಯಾ ಜಪ ವಿಧಿ ಹಾಗೂ ನಿಮ್ಮ ನಕ್ಷತ್ರದ ಸಿದ್ಧ ಮಂತ್ರಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿವರಿಸಲಾಗಿದೆ.",
    para3: (name, rashiLord, lagnaLord) => `${name} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿನ ರಾಶ್ಯಾಧಿಪತಿ (${rashiLord}) ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿ (${lagnaLord}) ಯ ಶುಭ ಬಲದ ಆಧಾರದ ಮೇಲೆ ಈ ಸಿದ್ಧ ಗ್ರಂಥವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದ್ದು, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಅಭಯ ಹಸ್ತದಿಂದ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಸರ್ವ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ ಆಯುಷ್ಯ, ಆರೋಗ್ಯ, ದಿವ್ಯ ಯಶಸ್ಸು ಹಾಗೂ ಅಷ್ಟೈಶ್ವರ್ಯಗಳು ಸಿದ್ಧಿಯಾಗಲಿ.`,
    footerMotto: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ಸಿದ್ಧಿರಸ್ತು · ಸಕಲ ಕಲ್ಯಾಣಮಸ್ತು · ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು"',
    footerPriest: (pandit) => `ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · ${pandit} (ದೂರವಾಣಿ: +91 99723 39362)`
  },
  en: {
    sloka: "❖ || Om Namah Pranavarthaya Shuddha Jnanaika Murtaye || ❖",
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
    salutation: (name, pandit) => `From the holy sanctum of Sri Kshetra Gokarna Mahabaleshwara, Chief Priest ${pandit} conveys sacred blessings to Devotee ${name}.`,
    para1: (rashi, nak, pada, lagna, dob, tob) => `Based on your exact birth time (${tob}) and date (${dob}), authentic planetary calculations at Gokarna establish your Janma Lagna as ${lagna}, Moon Sign as ${rashi}, and Birth Star as ${nak} (Pada ${pada}). Vedic Astrology is the divine lamp illuminating your soul's life purpose.`,
    para2: "This 8-page personal treatise has been consecrated specifically for YOU. Pages 2 through 8 detail your exact Janma Kundali, planetary positions, Gochara transits, Vimshottari Dasha timeline, daily Sandhya Japa, and birth star Beeja Mantras.",
    para3: (name, rashiLord, lagnaLord) => `Every astrological reflection in this treatise is 100% personalized for ${name} based on Rashi Lord (${rashiLord}) and Lagna Lord (${lagnaLord}) planetary harmony. May Lord Gokarna Mahabaleshwara bless you with longevity, robust health, and complete fulfillment.`,
    footerMotto: '"Om Gokarna Mahabaleshwara Prasada Siddhirastu · Sarve Janah Sukhino Bhavantu"',
    footerPriest: (pandit) => `Chief Archaka — Gokarna Kshetra · ${pandit} (+91 99723 39362)`
  },
  hi: {
    sloka: "❖ ॥ ॐ नमः प्रणवार्थाय शुद्धज्ञानैकमूर्तये ॥ ❖",
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
    salutation: (name, pandit) => `श्री गोकर्ण महाबलेश्वर धाम से मुख्य अर्चक ${pandit} द्वारा प्रिय भक्त ${name} को पावन शुभाशीर्वाद।`,
    para1: (rashi, nak, pada, lagna, dob, tob) => `आपकी जन्म तिथि ${dob} एवं समय ${tob} के अनुसार गोकर्ण पंचांग द्वारा आपका लग्न ${lagna}, चंद्र राशि ${rashi} तथा नक्षत्र ${nak} (${pada} चरण) निर्धारित किया गया है। वैदिक ज्योतिष ईश्वर का दिव्य प्रकाश है।`,
    para2: "यह 8-पृष्ठीय ग्रंथ विशेष रूप से आपके लिए तैयार किया गया है। आगे के पृष्ठों (2-8) में आपकी जन्म कुंडली, ग्रह स्थिति, गोचर फल, विंशोत्तरी दशा एवं सिद्ध मंत्रों का विस्तृत विवरण है।",
    para3: (name, rashiLord, lagnaLord) => `${name} के लिए यह ग्रंथ सर्वथा प्रामाणिक एवं व्यक्तिगत है। भगवान महाबलेश्वर की कृपा से आपका जीवन सुख, शांति और समृद्धि से परिपूर्ण हो।`,
    footerMotto: '"ॐ गोकर्ण महाबलेश्वर प्रसाद सिद्धिरस्तु · सर्वे जनाः सुखिनो भवन्तु"',
    footerPriest: (pandit) => `मुख्य अर्चक — गोकर्ण क्षेत्र · ${pandit} (+91 99723 39362)`
  },
  te: {
    sloka: "❖ || ఓం నమః ప్రణవార్థాయ శుద్ధజ్ఞానైకమూర్తయే || ❖",
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
    salutation: (name, pandit) => `శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి ప్రధాన అర్చకులు ${pandit} గారు భక్తులు ${name} గారికి అందించే పవిత్ర ఆశీస్సులు.`,
    para1: (rashi, nak, pada, lagna, dob, tob) => `మీ జనన తేదీ ${dob} మరియు సమయం ${tob} ఆధారంగా మీ లగ్నం ${lagna}, చంద్ర రాశి ${rashi} మరియు నక్షత్రం ${nak} (${pada}వ పాదం) గా గణించబడింది। జ్యోతిష్యం భగవంతుని దివ్య కాంతి.`,
    para2: "ఈ 8 పేజీల దివ్య గ్రంథం కేవలం మీ కోసమే సిద్ధం చేయబడింది. తరువాతి పేజీలలో (2-8) మీ జన్మ కుండలి, గ్రహ స్థానాలు, గోచారం, దశ ఫలితాలు మరియు మంత్రాలు వివరించబడ్డాయి.",
    para3: (name, rashiLord, lagnaLord) => `${name} గారికి ఈ గ్రంథం సంపూర్ణంగా అంకితం చేయబడింది. శ్రీ మహాబలేశ్వర స్వామి అనుగ్రహంతో మీకు ఆయురారోగ్యాలు, ఐశ్వర్యం సిద్ధించుగాక.`,
    footerMotto: '"ఓం గోకర్ణ మహాబలేశ్వర ప్రసాద సిద్ధిరస్తు · సర్వే జనాః సుఖినో భవంతు"',
    footerPriest: (pandit) => `ప్రధాన అర్చకులు — గోకర్ణ క్షేత్రం · ${pandit} (+91 99723 39362)`
  },
  ta: {
    sloka: "❖ || ஓம் நமஃ ப்ரணவார்த்தாய சுத்தஞானைகமூர்த்தயே || ❖",
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
    salutation: (name, pandit) => `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்திலிருந்து முதன்மை அர்ச்சகர் ${pandit} பக்தர் ${name} அவர்களுக்கு வழங்கும் புனித ஆசிகள்.`,
    para1: (rashi, nak, pada, lagna, dob, tob) => `உங்கள் பிறந்த தேதி ${dob} மற்றும் நேரம் ${tob} அடிப்படையில் உங்கள் லக்னம் ${lagna}, சந்திர ராசி ${rashi} மற்றும் நட்சத்திரம் ${nak} (பாதம் ${pada}) எனக் கணிக்கப்பட்டுள்ளது. ஜோதிடம் இறைவனின் திவ்ய வழிகாட்டி.`,
    para2: "இந்த 8 பக்க தனிப்பட்ட நூல் உங்களுக்காகவே தயாரிக்கப்பட்டுள்ளது. அடுத்த பக்கங்களில் (2-8) உங்கள் ஜாதகம், கிரக நிலைகள், கோச்சாரம், தசா புக்தி மற்றும் மந்திரங்கள் விளக்கப்பட்டன.",
    para3: (name, rashiLord, lagnaLord) => `${name} அவர்களின் வாழ்வில் ஸ்ரீ மகாபலேஸ்வரரின் அருளால் சகல நன்மைகளும், ஆரோக்கியமும், ஐஸ்வர்யமும் பெருகட்டும்.`,
    footerMotto: '"ஓம் கோకర్ண மகாபலேஸ்வர பிரசாத் சித்திரஸ்து · சர்வே ஜனா சுகினோ பவந்து"',
    footerPriest: (pandit) => `முதன்மை அர்ச்சகர் — கோகர்ண க்ஷேத்திரம் · ${pandit} (+91 99723 39362)`
  }
};'''

if old_dict:
    content = content.replace(old_dict.group(0), new_dict)

# 3. Replace Page 1 JSX with spacious layout, larger fonts, Atmalinga icon & Blessing Seal
old_p1_jsx = re.search(r'\{\/\* ──+[\s\S]*?PAGE 1: DEVOTEE ASTROLOGICAL IDENTITY & CHIEF PRIEST BENEDICTION[\s\S]*?\{\/\* ──+[\s\S]*?PAGE 2:', content)

new_p1_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 1: DEVOTEE ASTROLOGICAL IDENTITY & CHIEF PRIEST BENEDICTION
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, padding: "20px 24px 22px 24px", gap: "16px" }}>
          
          {/* Top Header Box with Gokarna Atmalinga Sacred Emblem */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
            position: "relative"
          }}>
            {/* Atmalinga Sacred Emblem Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "18px",
                boxShadow: "0 2px 6px rgba(120, 53, 15, 0.3)"
              }}>
                🔱
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#92400E", letterSpacing: "0.2px", lineHeight: "1.3" }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D97706 0%, #78350F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "18px",
                boxShadow: "0 2px 6px rgba(120, 53, 15, 0.3)"
              }}>
                🪔
              </div>
            </div>

            <div style={{ fontSize: "24px", fontWeight: 900, color: "#78350F", lineHeight: "1.4", margin: "4px 0 2px 0", letterSpacing: "0.5px" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).title}
            </div>
            <div style={{ fontSize: "12.5px", color: "#B45309", marginTop: "2px", fontWeight: 700, lineHeight: "1.3" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).subTitle}
            </div>
          </div>

          {/* Devotee Record Box - Generous Padding & Space Above Name */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#B45309", textAlign: "center", marginBottom: "6px", letterSpacing: "0.3px" }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).metadataHeader}
            </div>
            {/* Devotee Name - Clean Margins & Clear Separation from Line */}
            <div style={{
              fontSize: "24px",
              fontWeight: 900,
              color: "#78350F",
              textAlign: "center",
              margin: "6px 0 10px 0",
              borderBottom: "2px dashed #D97706",
              paddingBottom: "8px"
            }}>
              {displayName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", fontSize: "13.5px", lineHeight: "1.5" }}>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_DICT[code] || PAGE1_DICT.en).lblRashi}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{rashiName}</span></div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_DICT[code] || PAGE1_DICT.en).lblNakshatra}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{nakName} ({pada} {(PAGE1_DICT[code] || PAGE1_DICT.en).padaText})</span></div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_DICT[code] || PAGE1_DICT.en).lblLagna}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName}</span></div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{finalGotra}</span></div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelDob || (PAGE1_DICT[code] || PAGE1_DICT.en).lblDob}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{dobStr}</span></div>
              <div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_LABELS[code] || PAGE1_LABELS.en).labelTob || (PAGE1_DICT[code] || PAGE1_DICT.en).lblTob}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{formatTimeWithAmPm(tobStr, isKn)}</span></div>
              <div style={{ gridColumn: "span 2" }}><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:</strong> <span style={{ fontWeight: 700, color: "#78350F" }}>{pobStr}</span></div>
            </div>
          </div>

          {/* Full Page Width Chief Priest Ashirvachana & Sacred Guide Narrative - Larger Font */}
          <div style={{
            flex: 1,
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "18px 22px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.07)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
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
                  dobStr,
                  formatTimeWithAmPm(tobStr, isKn)
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

            {/* Ashirvachana Sacred Seal & Guarantee Emblem */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#78350F",
              color: "#FEF3C7",
              borderRadius: "10px",
              padding: "10px 16px",
              border: "1.5px solid #D97706",
              marginTop: "16px",
              boxShadow: "0 2px 6px rgba(120, 53, 15, 0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>💮</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A" }}>
                  {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಪೀಠದ ಅಭಯ ಮುದ್ರೆ" : "Sri Gokarna Kshetra Sacred Abhaya Mudra Seal"}
                </span>
              </div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
                ✨ {isKn ? "೧೦೦% ಸತ್ಯ ವೈಯಕ್ತಿಕ ಕುಂಡಲಿ ಗಣಿತ" : "100% Authentic Personal Horoscope"}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginBottom: "2px"
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
          PAGE 2:'''

if old_p1_jsx:
    content = content.replace(old_p1_jsx.group(0), new_p1_jsx)
    print("Page 1 V3 applied successfully!")
else:
    print("Failed to match Page 1 V3 JSX pattern!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
