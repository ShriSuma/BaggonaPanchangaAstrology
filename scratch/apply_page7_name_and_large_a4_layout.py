import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace PAGE7_DICT with dynamic name functions and expanded text
new_dict_code = '''const PAGE7_DICT: Record<string, {
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
    personalIntroText: (name) => `ಈ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ QR ಕೋಡ್ ಅನ್ನು ಕೇವಲ ಭಕ್ತರಾದ ${name} ನಿಮಗಾಗಿಯೇ, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಜನ್ಮ ಜಾತಕ ಮತ್ತು ನವಗ್ರಹ ಗೋಚಾರ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ ಪ್ರತಿಯೊಂದು ದಿನಕ್ಕೂ (Each Day for Next 90 Days) ವೈಯಕ್ತಿಕವಾಗಿ ಪ್ರತ್ಯೇಕವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.`,
    installHeader: "📲 ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ೯೦-ದಿನಗಳ ಪಂಚಾಂಗ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ೫ ಸರಳ ಹಂತಗಳು:",
    step1: "ಹಂತ ೧: ಕೆಳಗಿನ QR ಕೋಡ್ ಅನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step2: "ಹಂತ ೨: ಭಾಗ್ಗೋಣ ಪಂಚಾಂಗ ವೆಬ್‌ಸೈಟ್‌ಗೆ ರೀಡೈರೆಕ್ಟ್ ಆಗಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ .ics ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    step3: "ಹಂತ ೩: ಫೈಲ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆಯದಿದ್ದರೆ, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ Files / Downloads ಫೋಲ್ಡರ್‌ಗೆ ಹೋಗಿ.",
    step4: "ಹಂತ ೪: .ics ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ 'Google Calendar' ಅಥವಾ 'Apple Calendar' ಆಯ್ಕೆಮಾಡಿ.",
    step5: "ಹಂತ ೫: 'Add All' / Save ಕ್ಲಿಕ್ ಮಾಡಿ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗವನ್ನು ನಿಮ್ಮ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ!",
    qrCaption: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡಿ",
    urlRedirectHeader: "🌐 ಕ್ಯಾಲೆಂಡರ್ ಈವೆಂಟ್ URL ಲಿಂಕ್ ರೀಡೈರೆಕ್ಷನ್ & ೪-ಟ್ಯಾಬ್ ದರ್ಶನ ಮಾರ್ಗದರ್ಶಿ:",
    urlRedirectText: (name) => `ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿರುವ ಪ್ರತಿಯೊಂದು ದಿನದ Event ಒಳಗಡೆ ಇರುವ URL ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡುವುದರಿಂದ, ನೀವು ನೇರವಾಗಿ ಭಕ್ತರಾದ ${name} ಅವರ ದರ್ಶನ ಪುಟಕ್ಕೆ ತಲುಪುತ್ತೀರಿ. ಅಲ್ಲಿ ೪ ಪ್ರತ್ಯೇಕ ಟ್ಯಾಬ್‌ಗಳ ಮುಖಾಂತರ (೧. ಜಾತಕ ಕುಂಡಲಿ, ೨. ದಿನನಿತ್ಯದ ಗೋಚಾರ ಫಲ, ೩. ಮಹಾದಶಾ-ಅಂತರ್ದಶಾ ಹಾಗೂ ೪. ದಿನದ ಪಂಚಾಂಗ ಮುಹೂರ್ತ) ನಿಮ್ಮ ಪೂರ್ಣ ಭವಿಷ್ಯವನ್ನು ವೀಕ್ಷಿಸಬಹುದು!`
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
    urlRedirectText: (name) => `Clicking the unique URL link inside each daily calendar event redirects straight to ${name}'s personal Darshana portal featuring 4 interactive tabs (Kundli, Gochara, Dasha-Bhukti & Daily Panchanga)!`
  },
  hi: {
    chapterTitle: "अध्याय 6: व्यक्तिगत 90-दिवसीय पंचांग कैलेंडर एवं दिव्य सिंक मार्गदर्शिका",
    subTitle: "अपने मोबाइल में 90-दिवसीय पंचांग कैलेंडर सिंक करने के सरल चरण",
    personalIntroHeader: "✨ व्यक्तिगत जन्म कुंडली आधारित 90-दिवसीय कैलेंडर विशेषता:",
    personalIntroText: (name) => `यह 90-दिवसीय पंचांग कैलेंडर एवं QR कोड विशेष रूप से भक्त ${name} के लिए, आपकी जन्म कुंडली एवं गोचर के आधार पर आगामी 90 दिनों के लिए प्रतिदिन व्यक्तिगत रूप से तैयार किया गया है।`,
    installHeader: "📲 मोबाइल में 90-दिवसीय पंचांग सिंक करने के 5 सरल चरण:",
    step1: "चरण 1: अपने मोबाइल कैमरे से नीचे दिए गए QR कोड को स्कैन करें।",
    step2: "चरण 2: भाग्गोण पंचांग वेबसाइट पर रीडायरेक्ट होकर अपनी व्यक्तिगत .ics कैलेंडर फ़ाइल डाउनलोड करें।",
    step3: "चरण 3: यदि फ़ाइल स्वचालित रूप से नहीं खुलती है, तो अपने मोबाइल के Files / Downloads फ़ोल्डर में जाएँ।",
    step4: "चरण 4: .ics फ़ाइल पर टैप करें और 'Google Calendar' या 'Apple Calendar' चुनें।",
    step5: "चरण 5: 'Add All' / Save पर क्लिक करके 90 दिनों के पंचांग को अपने कैलेंडर में सिंक करें!",
    qrCaption: "स्कैन करके 90-दिवसीय व्यक्तिगत पंचांग सिंक करें",
    urlRedirectHeader: "🌐 कैलेंडर इवेंट URL रीडायरेक्शन एवं 4-टैब निर्देश:",
    urlRedirectText: (name) => `प्रतिदिन के कैलेंडर इवेंट में दिए गए URL लिंक पर क्लिक करने से आप सीधे ${name} के 4-टैब दैनिक दर्शन पृष्ठ (कुंडली, गोचर, दशा-भुक्ति एवं पंचांग) पर पहुंच जाएंगे!`
  },
  te: {
    chapterTitle: "అధ్యాయం 6: వ్యక్తిగత 90-రోజుల పంచాంగ క్యాలెండర్ & దివ్య సింక్ మార్గదర్శి",
    subTitle: "మీ మొబైల్‌కి 90 రోజుల పంచాంగం సింక్ చేసుకునే సులువైన పద్ధతులు",
    personalIntroHeader: "✨ వ్యక్తిగత జాతక ఆధారిత 90-రోజుల క్యాలెండర్ ప్రత్యేకత:",
    personalIntroText: (name) => `ఈ 90-రోజుల పంచాంగ క్యాలెండర్ మరియు QR కోడ్ కేవలం భక్తులు ${name} కోసమే, మీ వ్యక్తిగత జాతకం మరియు గోచార గణన ఆధారంగా రాబోయే 90 రోజులకు రోజువారీగా ప్రత్యేకంగా సిద్ధం చేయబడింది.`,
    installHeader: "📲 మొబైల్‌లో 90-రోజుల పంచాంగం ఇన్‌స్టాల్ చేసే 5 సులువైన పద్ధతులు:",
    step1: "దశ 1: క్రింది QR కోడ్‌ను మీ మొబైల్ కెమెరాతో స్కాన్ చేయండి.",
    step2: "దశ 2: భాగ్గోణ పంచాంగ వెబ్‌సైట్‌కి రీಡೈರೆಕ್ಟ್ అయి మీ వ్యక్తిగత .ics క್ಯాలెండర్ ఫైల్ డౌన్‌లోడ్ చేయండి.",
    step3: "దశ 3: ఫైల్ స్వయంచాలకంగా తెరవకపోతే, మీ మొబైల్ Files / Downloads ఫోల్డర్‌కి వెళ్లండి.",
    step4: "దశ 4: .ics ఫైల్‌పై టాప్ చేసి 'Google Calendar' లేదా 'Apple Calendar' ఎంచుకోండి.",
    step5: "దశ 5: 'Add All' / Save క్లిక్ చేసి 90 రోజులు క్యాలెండర్‌కి సింక్ చేయండి!",
    qrCaption: "స్కాన్ చేసి 90-రోజుల వ్యక్తిగత పంచాంగం సింక్ చేయండి",
    urlRedirectHeader: "🌐 క్యాలెండర్ ఈవెంట్ URL రీడైరెక్షన్ వివరాలు:",
    urlRedirectText: (name) => `మీ క్యాలెండర్ ఈవెంట్‌లోని URL లింక్‌పై క్లిక్ చేయడం ద్వారా మీరు నేరుగా భక్తులు ${name} గారి 4 టాబ్‌లు (జాతకం, గోచారం, దశా-భుక్తి & పంచాంగం) ఉన్న పేజీకి రీడైరెక్ట్ అవుతారు!`
  },
  ta: {
    chapterTitle: "அத்தியாயம் 6: தனிப்பட்ட 90-நாள் பஞ்சாங்க காலண்டர் & புனித சிங்க் வழிகாட்டி",
    subTitle: "உங்கள் மொபைலில் 90-நாள் பஞ்சாங்கத்தை சிங்க் செய்வதற்கான எளிய முறைகள்",
    personalIntroHeader: "✨ தனிப்பட்ட ஜாதக அடிப்படையிலான 90-நாள் காலண்டர் சிறப்பு:",
    personalIntroText: (name) => `இந்த 90-நாள் பஞ்சாங்க காலண்டர் மற்றும் QR குறியீடு அன்பான பக்தர் ${name} அவர்களுக்காகவே, உங்கள் ஜாதக கணிதத்தின் அடிப்படையில் அடுத்த 90 நாட்களுக்கு ஒவ்வொரு நாளுக்கும் தனித்தனியாக தயாரிக்கப்பட்டுள்ளது.`,
    installHeader: "📲 மொபைலில் 90-நாள் பஞ்சாங்கம் நிறுவும் 5 எளிய முறைகள்:",
    step1: "படி 1: கீழே உள்ள QR குறியீட்டை மொபைல் கேமராவால் ஸ்கேன் செய்யவும்.",
    step2: "படி 2: பாக்கோண பஞ்சாங்கம் தளத்திற்கு சென்று உங்கள் தனிப்பட்ட .ics காலண்டர் ஃபைலை பதிவிறக்கவும்.",
    step3: "படி 3: ஃபைல் தானாக திறக்கவில்லை என்றால், உங்கள் மொபைலின் Files / Downloads கோப்பிற்கு செல்லவும்.",
    step4: "படி 4: .ics ஃபைலை கிளிக் செய்து 'Google Calendar' அல்லது 'Apple Calendar' தேர்வு செய்யவும்.",
    step5: "படி 5: 'Add All' / Save கிளிக் செய்து 90-நாள் பஞ்சாங்கத்தை சிங்க் செய்யவும்!",
    qrCaption: "ஸ்கேன் செய்து 90-நாள் பஞ்சாங்கம் சிங்க் செய்யவும்",
    urlRedirectHeader: "🌐 காலண்டர் நிகழ்வு URL மறுவழிப்படுத்தும் வழிகாட்டி:",
    urlRedirectText: (name) => `ஒவ்வொரு நாள் காலண்டர் நிகழ்விலும் உள்ள URL லிங்கை கிளிக் செய்வதன் மூலம், பக்தர் ${name} அவர்களின் 4 தப்கள் (ஜாதகம், கோச்சாரம், தசா புக்தி & பஞ்சாங்கம்) கொண்ட பக்கத்திற்கு நேரடியாக செல்லலாம்!`
  }
};'''

dict_start = content.find("const PAGE7_DICT:")
dict_end = content.find("const PAGE1_DICT:")
if dict_start != -1 and dict_end != -1:
    content = content[:dict_start] + new_dict_code + "\n\n" + content[dict_end:]

# 2. Replace Page 7 JSX to use large QR code (230px x 230px), enlarged fonts (13px & 13.5px), dynamic devotee name, and fill entire A4 height
p7_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC & QR REDIRECTION GUIDE\n         ───────────────────────────────────────────────────────────── */}'
p8_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8\n         ───────────────────────────────────────────────────────────── */}'

start_p7 = content.find(p7_marker)
start_p8 = content.find(p8_marker)

if start_p7 != -1 and start_p8 != -1:
    updated_p7_jsx = '''{/* ─────────────────────────────────────────────────────────────
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

          {/* Section 1: Personalized 90-Day Calendar Speciality Intro (With Devotee Name) */}
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

          {/* Section 2: Step-by-Step Installation Instructions (Larger Font 13px & 1.7 Line Height) */}
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

          {/* Section 3: Royal Gold Scannable QR Code Box (PERFECTLY CENTERED & ENLARGED 230px) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 22px",
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
                    width: "230px", 
                    height: "230px", 
                    border: "2.5px solid #B45309", 
                    borderRadius: "12px", 
                    padding: "6px",
                    background: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(120, 53, 15, 0.15)"
                  }} 
                />
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginTop: "8px" }}>
                  {(PAGE7_DICT[code] || PAGE7_DICT.en).qrCaption}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px", color: "#B45309", fontSize: "13.5px", fontWeight 700 }}>
                📲 ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
              </div>
            )}
          </div>

          {/* Section 4: Daily Calendar Event URL Redirection Guide (Detailed & Enlarged) */}
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
      </div>\n\n'''
    content = content[:start_p7] + updated_p7_jsx + content[start_p8:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 7 with dynamic devotee name, enlarged QR code (230px), increased font sizes, and full A4 vertical fill successfully!")
