import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Page 3 top-right pill badge text lift with transform: translateY(-4px)
content = re.sub(
    r'padding:\s*"3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.25",\s*\n\s*transform:\s*"translateY\(-3px\)"',
    r'padding: "3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.2",\n                  transform: "translateY(-4px)"',
    content
)

# 2. Add PAGE7_DICT before PAGE1_DICT or after PAGE1_DICT
page7_dict_str = '''
const PAGE7_DICT: Record<string, {
  chapterTitle: string;
  subTitle: string;
  personalIntroHeader: string;
  personalIntroText: string;
  installHeader: string;
  step1: string;
  step2: string;
  step3: string;
  qrCaption: string;
  urlRedirectHeader: string;
  urlRedirectText: string;
}> = {
  kn: {
    chapterTitle: "ಅಧ್ಯಾಯ ೬: ವೈಯಕ್ತಿಕ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ & ದೈವಿಕ ಸಿಂಕ್ ಮಾರ್ಗದರ್ಶಿ",
    subTitle: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಲಾಕ್ ಸ್ಕ್ರೀನ್‌ಗೆ ೯೦ ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು",
    personalIntroHeader: "✨ ವೈಯಕ್ತಿಕ ಜಾತಕ ಆಧಾರಿತ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ವಿಶೇಷತೆ:",
    personalIntroText: "ಈ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ QR ಕೋಡ್ ಅನ್ನು ಕೇವಲ ನಿಮಗಾಗಿ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜಾತಕ ಮತ್ತು ಗೋಚಾರ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿಯೊಂದು ದಿನಕ್ಕೂ (Each Day for Next 90 Days) ವೈಯಕ್ತಿಕವಾಗಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",
    installHeader: "📲 ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು:",
    step1: "ಹಂತ ೧: ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step2: "ಹಂತ ೨: 'Add 90-Day Calendar (.ics)' ಆಯ್ಕೆಮಾಡಿ 'Add All' ಕ್ಲಿಕ್ ಮಾಡಿ ಸಿಂಕ್ ಮಾಡಿ.",
    step3: "ಹಂತ ೩: ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಪ್ರತಿಯೊಂದು ದಿನದ ಶುಭ-ಅಶುಭ ಮುಹೂರ್ತ ಈವೆಂಟ್ ನೋಡಿ.",
    qrCaption: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡಿ",
    urlRedirectHeader: "🌐 ಕ್ಯಾಲೆಂಡರ್ ಈವೆಂಟ್ URL ಲಿಂಕ್ ರೀಡೈರೆಕ್ಷನ್ ಸೂಚನೆ:",
    urlRedirectText: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿರುವ ಪ್ರತಿಯೊಂದು ದಿನದ Event ಒಳಗಡೆ ಇರುವ URL ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡುವುದರಿಂದ, ನೀವು ನೇರವಾಗಿ ಇಂದಿನ ಜಾತಕ, ಗೋಚಾರ ಫಲ, ದಶಾ-ಭುಕ್ತಿ ಹಾಗೂ ೪ ಟ್ಯಾಬ್‌ಗಳುಳ್ಳ ಪವಿತ್ರ ದರ್ಶನ ಪುಟಕ್ಕೆ ರೀಡೈರೆಕ್ಟ್ ಆಗುತ್ತೀರಿ!"
  },
  en: {
    chapterTitle: "Chapter 6: Personal 90-Day Panchanga Calendar & Divine Sync Guide",
    subTitle: "Simple steps to sync 90-day personal astrological calendar to your mobile device",
    personalIntroHeader: "✨ Personal Horoscope-Based 90-Day Calendar Speciality:",
    personalIntroText: "This 90-Day Panchanga Calendar and QR Code have been crafted specifically for YOU, calculated day-by-day based on your personal birth chart for the next 90 days.",
    installHeader: "📲 Simple steps to install 90-Day Calendar to your mobile:",
    step1: "Step 1: Scan the QR code below using your smartphone camera.",
    step2: "Step 2: Tap 'Add 90-Day Calendar (.ics)' and select 'Add All' to sync.",
    step3: "Step 3: Open your mobile calendar to view daily personal muhurtha events.",
    qrCaption: "Scan to sync 90-day personal Panchanga calendar",
    urlRedirectHeader: "🌐 Calendar Event URL Redirection Guide:",
    urlRedirectText: "Clicking the unique URL link inside each daily calendar event redirects you straight to your daily Darshana page featuring 4 interactive tabs (Kundli, Gochara, Dasha-Bhukti & Daily Panchanga)!"
  },
  hi: {
    chapterTitle: "अध्याय 6: व्यक्तिगत 90-दिवसीय पंचांग कैलेंडर एवं दिव्य सिंक मार्गदर्शिका",
    subTitle: "अपने मोबाइल में 90-दिवसीय पंचांग कैलेंडर सिंक करने के सरल चरण",
    personalIntroHeader: "✨ व्यक्तिगत जन्म कुंडली आधारित 90-दिवसीय कैलेंडर विशेषता:",
    personalIntroText: "यह 90-दिवसीय पंचांग कैलेंडर एवं QR कोड विशेष रूप से आपके लिए, आपकी जन्म कुंडली एवं गोचर के आधार पर आगामी 90 दिनों के लिए प्रतिदिन व्यक्तिगत रूप से तैयार किया गया है।",
    installHeader: "📲 मोबाइल में 90-दिवसीय पंचांग सिंक करने के सरल चरण:",
    step1: "चरण 1: अपने मोबाइल कैमरे से नीचे दिए गए QR कोड को स्कैन करें।",
    step2: "चरण 2: 'Add 90-Day Calendar' पर टैप करके 'Add All' चुनें।",
    step3: "चरण 3: अपने मोबाइल कैलेंडर में प्रतिदिन के शुभ-अशुभ मुहूर्त देखें।",
    qrCaption: "स्कैन करके 90-दिवसीय व्यक्तिगत पंचांग सिंक करें",
    urlRedirectHeader: "🌐 कैलेंडर इवेंट URL रीडायरेक्शन निर्देश:",
    urlRedirectText: "प्रतिदिन के कैलेंडर इवेंट में दिए गए URL लिंक पर क्लिक करने से आप सीधे अपने 4-टैब दैनिक दर्शन पृष्ठ (कुंडली, गोचर, दशा-भुक्ति एवं पंचांग) पर पहुंच जाएंगे!"
  },
  te: {
    chapterTitle: "అధ్యాయం 6: వ్యక్తిగత 90-రోజుల పంచాంగ క్యాలెండర్ & దివ్య సింక్ మార్గదర్శి",
    subTitle: "మీ మొబైల్‌కి 90 రోజుల పంచాంగం సింక్ చేసుకునే సులువైన పద్ధతులు",
    personalIntroHeader: "✨ వ్యక్తిగత జాతక ఆధారిత 90-రోజుల క్యాలెండర్ ప్రత్యేకత:",
    personalIntroText: "ఈ 90-రోజుల పంచాంగ క్యాలెండర్ మరియు QR కోడ్ కేవలం మీ కోసమే, మీ వ్యక్తిగత జాతకం మరియు గోచార గణన ఆధారంగా రాబోయే 90 రోజులకు రోజువారీగా ప్రత్యేకంగా సిద్ధం చేయబడింది.",
    installHeader: "📲 మొబైల్‌లో 90-రోజుల పంచాంగం ఇన్‌స్టాల్ చేసే పద్ధతులు:",
    step1: "దశ 1: క్రింది QR కోడ్‌ను మీ మొబైల్ కెమెరాతో స్కాన్ చేయండి.",
    step2: "దశ 2: 'Add 90-Day Calendar' పై టాప్ చేసి 'Add All' క్లిక్ చేయండి.",
    step3: "దశ 3: మీ మొబైల్ క్యాలెండర్‌లో ప్రతి రోజు శుభ-అశుభ ముహూర్తాలు చూడండి.",
    qrCaption: "స్కాన్ చేసి 90-రోజుల వ్యక్తిగత పంచాంగం సింక్ చేయండి",
    urlRedirectHeader: "🌐 క్యాలెండర్ ఈవెంట్ URL రీడైరెక్షన్ వివరాలు:",
    urlRedirectText: "మీ క్యాలెండర్ ఈవెంట్‌లోని URL లింక్‌పై క్లిక్ చేయడం ద్వారా మీరు నేరుగా 4 టాబ్‌లు (జాతకం, గోచారం, దశా-భుక్తి & పంచాంగం) ఉన్న పేజీకి రీడైరెక్ట్ అవుతారు!"
  },
  ta: {
    chapterTitle: "அத்தியாயம் 6: தனிப்பட்ட 90-நாள் பஞ்சாங்க காலண்டர் & புனித சிங்க் வழிகாட்டி",
    subTitle: "உங்கள் மொபைலில் 90-நாள் பஞ்சாங்கத்தை சிங்க் செய்வதற்கான எளிய முறைகள்",
    personalIntroHeader: "✨ தனிப்பட்ட ஜாதக அடிப்படையிலான 90-நாள் காலண்டர் சிறப்பு:",
    personalIntroText: "இந்த 90-நாள் பஞ்சாங்க காலண்டர் மற்றும் QR குறியீடு உங்களுக்காகவே, உங்கள் ஜாதக கணிதத்தின் அடிப்படையில் அடுத்த 90 நாட்களுக்கு ஒவ்வொரு நாளுக்கும் தனித்தனியாக தயாரிக்கப்பட்டுள்ளது.",
    installHeader: "📲 மொபைலில் 90-நாள் பஞ்சாங்கம் நிறுவும் எளிய முறைகள்:",
    step1: "படி 1: கீழே உள்ள QR குறியீட்டை மொபைல் கேமராவால் ஸ்கேன் செய்யவும்.",
    step2: "படி 2: 'Add 90-Day Calendar' என்பதை கிளிக் செய்து 'Add All' தேர்வு செய்யவும்.",
    step3: "படி 3: உங்கள் மொபைல் காலண்டரில் தினசரி சுப முகூர்த்தங்களை பார்க்கவும்.",
    qrCaption: "ஸ்கேன் செய்து 90-நாள் பஞ்சாங்கம் சிங்க் செய்யவும்",
    urlRedirectHeader: "🌐 காலண்டர் நிகழ்வு URL மறுவழிப்படுத்தும் வழிகாட்டி:",
    urlRedirectText: "ஒவ்வொரு நாள் காலண்டர் நிகழ்விலும் உள்ள URL லிங்கை கிளிக் செய்வதன் மூலம், 4 தப்கள் (ஜாதகம், கோச்சாரம், தசா புக்தி & பஞ்சாங்கம்) கொண்ட பக்கத்திற்கு நேரடியாக செல்லலாம்!"
  }
};
'''

content = content.replace('const PAGE1_DICT:', page7_dict_str + '\nconst PAGE1_DICT:')

# 3. Redesign Page 7 JSX completely to match user's royal specifications
old_page7_jsx = '''      {/* ─────────────────────────────────────────────────────────────
          PAGE 7: EXACT MATCH TO PDF (45) PAGE 7
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
              ಅಧ್ಯಾಯ ೬: ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ & ದೈವಿಕ ಸಿಂಕ್ ಮಾರ್ಗದರ್ಶಿ
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
      </div>'''

new_page7_jsx = '''      {/* ─────────────────────────────────────────────────────────────
          PAGE 7: ROYAL 90-DAY CALENDAR SYNC & QR REDIRECTION GUIDE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "10px 16px",
            borderRadius: "12px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "16.5px", fontWeight: 800, textTransform: "uppercase", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).chapterTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).subTitle}
            </div>
          </div>

          {/* Section 1: Personalized 90-Day Calendar Speciality Intro */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroHeader}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroText}
            </div>
          </div>

          {/* Section 2: Royal Gold Scannable QR Code Box */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {qrDataUrl ? (
              <div>
                <img 
                  src={qrDataUrl} 
                  alt="90-Day Calendar Sync QR Code" 
                  style={{ 
                    width: "190px", 
                    height: "190px", 
                    border: "2.5px solid #B45309", 
                    borderRadius: "12px", 
                    padding: "6px",
                    background: "#FFFFFF",
                    boxShadow: "0 3px 10px rgba(120, 53, 15, 0.15)"
                  }} 
                />
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginTop: "8px" }}>
                  {(PAGE7_DICT[code] || PAGE7_DICT.en).qrCaption}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px", color: "#B45309", fontSize: "13px", fontWeight: 700 }}>
                📲 ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
              </div>
            )}
          </div>

          {/* Section 3: Line-by-Line Installation Instructions */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).installHeader}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div>📲 {(PAGE7_DICT[code] || PAGE7_DICT.en).step1}</div>
              <div>📅 {(PAGE7_DICT[code] || PAGE7_DICT.en).step2}</div>
              <div>🔔 {(PAGE7_DICT[code] || PAGE7_DICT.en).step3}</div>
            </div>
          </div>

          {/* Section 4: Daily Calendar Event URL Redirection Guide */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)",
            border: "1.5px solid #B45309",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectHeader}
            </div>
            <div style={{ fontSize: "11.5px", lineHeight: "1.6", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectText}
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
      </div>'''

content = content.replace(old_page7_jsx, new_page7_jsx)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Redesigned Page 7 with 90-Day Personalization, Scannable QR Code, Instructions & Redirection Guide successfully!")
