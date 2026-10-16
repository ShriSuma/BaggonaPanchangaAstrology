import React from "react";
import type { PackageLang } from "./packageDownloadLocale";

interface Props {
  id: string;
  devoteeName: string;
  birthDate: string;
  birthTime: string;
  rashiName: string;
  nakshatraName: string;
  priestName: string;
  priestPhone: string;
  poojaName: string;
  poojaPlace: string;
  qr30DataUrl: string;
  qr90DataUrl: string;
  qr120DataUrl: string;
  lang: PackageLang;
}

const UI_TITLES: Record<PackageLang, Record<string, string>> = {
  kn: {
    banner: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥",
    title: "೩೦, ೯೦ ಮತ್ತು ೧೨೦ ದಿನಗಳ ದೈನಂದಿನ ಪಂಚಾಂಗ & ಶುಭ ಮುಹೂರ್ತ ಕ್ಯೂಆರ್ ಕಾರ್ಡ್",
    subtitle: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ದೈನಂದಿನ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ ಹಾಗೂ ಶುಭ ಮುಹೂರ್ತಗಳನ್ನು ಸಿಂಕ್ ಮಾಡಲು ಈ ಕೆಳಗಿನ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    priestBoxTitle: "ಅಧಿಕೃತ ಪುರೋಹಿತರು & ಪೂಜಾ ವಿವರ",
    priestNameLabel: "ಮುಖ್ಯ ಅರ್ಚಕರು:",
    priestPhoneLabel: "ದೂರವಾಣಿ / ಮೊಬೈಲ್:",
    priestCallNotice: "ಕ್ಯಾಲೆಂಡರ್ ಬೇಕಿದ್ದಲ್ಲಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ: 9972339362",
    poojaLabel: "ಪೂಜಾ ಸಂಕಲ್ಪ:",
    placeLabel: "ಪೂಜೆ ನೆರವೇರಿದ ಪವಿತ್ರ ಕ್ಷೇತ್ರ:",
    qr30Title: "೧. ೩೦-ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್",
    qr30Desc: "ಮುಂದಿನ ೩೦ ದಿನಗಳ ನಿತ್ಯ ಪಂಚಾಂಗ, ಶುಭ ಮುಹೂರ್ತ & ಅಲರ್ಟ್",
    qr90Title: "೨. ೯೦-ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್",
    qr90Desc: "ಸಂಪೂರ್ಣ ೩-ತಿಂಗಳ ಮಹಾ ದೈವಿಕ ಪಂಚಾಂಗ & ದೇವತಾ ಆರಾಧನೆ",
    qr120Title: "೩. ೧೨೦-ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್",
    qr120Desc: "ದೀರ್ಘಾವಧಿ ೪-ತಿಂಗಳ ಸಾಧನಾ ಪಂಚಾಂಗ & ವಿಶೇಷ ವ್ರತಗಳು",
    instructionsHeading: "ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸುಲಭ ಹಂತಗಳು (Scanning Guide)",
    step1: "೧. ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ ಕ್ಯಾಮೆರಾ (Camera) ಅಥವಾ Google Lens ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ.",
    step2: "೨. ನಿಮ್ಮ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕಂತೆ ೩೦, ೯೦ ಅಥವಾ ೧೨೦ ದಿನಗಳ ಕ್ಯೂಆರ್ ಕೋಡ್ ಅನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.",
    step3: "೩. ಪರದೆಯ ಮೇಲೆ ಬರುವ ಲಿಂಕ್ ಒತ್ತಿ 'Add to Calendar' ಆಯ್ಕೆಮಾಡಿ.",
    step4: "೪. ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ ೭:೦೦ಕ್ಕೆ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ಶುಭ ಮುಹೂರ್ತ ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಲಭ್ಯ!",
    footer: "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ"
  },
  en: {
    banner: "॥ Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology ॥",
    title: "30, 90 & 120-Day Daily Panchanga & Auspicious Calendar QR Cards",
    subtitle: "Scan below QR codes to sync daily Tithi, Vara, Nakshatra, and Auspicious Muhurthas directly to Google Calendar.",
    priestBoxTitle: "Official Priest & Sacred Pooja Details",
    priestNameLabel: "Chief Priest:",
    priestPhoneLabel: "Phone Number:",
    priestCallNotice: "If you need a calendar, call Shreeram Pandit: 9972339362",
    poojaLabel: "Sacred Pooja:",
    placeLabel: "Venue / Holy Kshetra:",
    qr30Title: "1. 30-Day Daily Calendar",
    qr30Desc: "Next 30 days daily Panchanga, energy rhythms & alerts",
    qr90Title: "2. 90-Day Royal Calendar",
    qr90Desc: "Full 3-month comprehensive Vedic seva & worship rhythm",
    qr120Title: "3. 120-Day Extended Calendar",
    qr120Desc: "Extended 4-month spiritual sadhana & special vrata guidance",
    instructionsHeading: "Step-by-Step Mobile Sync Guide:",
    step1: "1. Open your smartphone Camera or Google Lens app.",
    step2: "2. Point the camera at your preferred QR code (30, 90, or 120 days).",
    step3: "3. Tap the displayed link and choose 'Add to Calendar'.",
    step4: "4. Receive personalized Vedic alerts at 07:00 AM every morning!",
    footer: "Sri Gokarna Mahabaleshwara Sannidhi · Baggona Panchanga Astrology"
  },
  hi: {
    banner: "॥ श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष ॥",
    title: "३०, ९० एवं १२० दिनों का दैनिक पंचांग एवं शुभ मुहूर्त क्यूआर कार्ड",
    subtitle: "दैनिक तिथि, वार, नक्षत्र एवं शुभ मुहूर्त को अपने गूगल कैलेंडर में सिंक करने हेतु नीचे दिए क्यूआर कोड स्कैन करें।",
    priestBoxTitle: "आधिकारिक पुरोहित एवं पूजा विवरण",
    priestNameLabel: "मुख्य पुरोहित:",
    priestPhoneLabel: "मोबाइल नंबर:",
    priestCallNotice: "कैलेंडर सहायता हेतु श्रीराम पंडित से संपर्क करें: 9972339362",
    poojaLabel: "पूजा संकल्प:",
    placeLabel: "पूजा स्थल / पावन क्षेत्र:",
    qr30Title: "१. ३०-दिनों का कैलेंडर",
    qr30Desc: "आगामी ३० दिनों का दैनिक पंचांग एवं मुहूर्त",
    qr90Title: "२. ९०-दिनों का कैलेंडर",
    qr90Desc: "संपूर्ण ३-माह का महा पंचांग एवं देव आराधना",
    qr120Title: "३. १२०-दिनों का कैलेंडर",
    qr120Desc: "दीर्घकालिक ४-माह की साधना एवं विशेष व्रत",
    instructionsHeading: "कैलेंडर सिंक करने के सरल चरण:",
    step1: "१. अपने स्मार्टफोन का कैमरा या Google Lens ऐप खोलें।",
    step2: "२. अपनी इच्छानुसार ३०, ९० अथवा १२० दिनों का क्यूआर कोड स्कैन करें।",
    step3: "३. दिखाई देने वाले लिंक पर टैप कर 'Add to Calendar' चुनें।",
    step4: "४. प्रतिदिन प्रातः ७:०० बजे शुभ मुहूर्त का नोटिफिकेशन पाएं!",
    footer: "श्री गोकर्ण महाबलेश्वर सन्निधान · बग्गोण पंचांग ज्योतिष"
  },
  te: {
    banner: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగ జ్యోతిష్యం ॥",
    title: "30, 90 మరియు 120 రోజుల దైనందిన పంచాంగం & శుభ ముహూర్త క్యూఆర్ కార్డ్",
    subtitle: "దైనందిన తిథి, వారం, నక్షత్రం మరియు ముహూర్తాలను మీ గూగుల్ క్యాలెండర్‌కు సింక్ చేయడానికి క్రింది క్యూఆర్ కోడ్ స్కాన్ చేయండి.",
    priestBoxTitle: "అధికారిక పురోహితులు & పూజా వివరాలు",
    priestNameLabel: "ప్రధాన అర్చకులు:",
    priestPhoneLabel: "ఫోన్ నంబర్:",
    priestCallNotice: "క్యాలెండర్ సహాయం కోసం శ్రీరామ్ పండితులను సంప్రదించండి: 9972339362",
    poojaLabel: "పూజా సంకల్పం:",
    placeLabel: "పూజ జరిగిన పవిత్ర క్షేత్రం:",
    qr30Title: "1. 30-రోజుల క్యాలెండర్",
    qr30Desc: "రాబోయే 30 రోజుల నిత్య పంచాంగం & అలర్ట్",
    qr90Title: "2. 90-రోజుల క్యాలెండర్",
    qr90Desc: "సంపూర్ణ 3-నెలల మహా పంచాంగం & దేవతారాధన",
    qr120Title: "3. 120-రోజుల క్యాలెండర్",
    qr120Desc: "దీర్ఘకాలిక 4-నెలల సాధనా పంచాంగం & వ్రతాలు",
    instructionsHeading: "క్యాలెండర్ సింక్ చేసుకునే సులభ విధానం:",
    step1: "1. మీ స్మార్ట్‌ఫోన్ కెమెరా లేదా Google Lens తెరవండి.",
    step2: "2. 30, 90 లేదా 120 రోజుల క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.",
    step3: "3. వచ్చే లింక్‌పై క్లిక్ చేసి 'Add to Calendar' ఎంచుకోండి.",
    step4: "4. ప్రతిరోజూ ఉదయం 7:00 గంటలకు శుభ ముహూర్త సమాచారం లభిస్తుంది!",
    footer: "శ్రీ గోకర్ణ మహాబలేశ్వర సన్నిధానం · బగ్గోణ పంచాంగం"
  },
  ta: {
    banner: "॥ ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்க ஜோதிடம் ॥",
    title: "30, 90 மற்றும் 120 நாட்கள் தினசரி பஞ்சாங்கம் & சுப முகூர்த்த கியூஆர் அட்டை",
    subtitle: "தினசரி திதி, வாரம், நட்சத்திரம் மற்றும் சுப முகூர்த்தங்களை கூகுள் காலண்டரில் இணைக்க கீழே உள்ள கியூஆர் குறியீட்டை ஸ்கேன் செய்யவும்.",
    priestBoxTitle: "அங்கீகரிக்கப்பட்ட அர்ச்சகர் & பூஜை விவரங்கள்",
    priestNameLabel: "தலைமை அர்ச்சகர்:",
    priestPhoneLabel: "அலைபேசி எண்:",
    priestCallNotice: "காலண்டர் உதவிக்கு ஸ்ரீராம் பண்டிதரை அழைக்கவும்: 9972339362",
    poojaLabel: "பூஜை சங்கல்பம்:",
    placeLabel: "பூஜை நடைபெற்ற திருத்தலம்:",
    qr30Title: "1. 30-நாட்கள் காலண்டர்",
    qr30Desc: "அடுத்த 30 நாட்களுக்கான பஞ்சாங்கம் & சுப நேரங்கள்",
    qr90Title: "2. 90-நாட்கள் காலண்டர்",
    qr90Desc: "முழு 3-மாத மகா பஞ்சாங்கம் & வழிபாட்டு முறைகள்",
    qr120Title: "3. 120-நாட்கள் காலண்டர்",
    qr120Desc: "நீண்ட கால 4-மாத சாதனா பஞ்சாங்கம் & விரதங்கள்",
    instructionsHeading: "காலண்டரை இணைக்கும் எளிய முறைகள்:",
    step1: "1. உங்கள் ஸ்மார்ட்போன் கேமரா அல்லது Google Lens பயன்பாட்டைத் திறக்கவும்.",
    step2: "2. 30, 90 அல்லது 120 நாட்கள் கியூஆர் குறியீட்டை ஸ்கேன் செய்யவும்.",
    step3: "3. திரையில் தோன்றும் இணைப்பைத் தட்டி 'Add to Calendar' என்பதைத் தேர்ந்தெடுக்கவும்.",
    step4: "4. தினமும் காலை 7:00 மணிக்கு உங்கள் போனில் சுப முகூர்த்த தகவல் வரும்!",
    footer: "ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் சந்நிதி · பக்கோண பஞ்சாங்கம்"
  }
};

export const MultiPeriodQrCardTemplate: React.FC<Props> = ({
  id,
  devoteeName,
  birthDate,
  birthTime,
  rashiName,
  nakshatraName,
  priestName,
  priestPhone,
  poojaName,
  poojaPlace,
  qr30DataUrl,
  qr90DataUrl,
  qr120DataUrl,
  lang
}) => {
  const dict = UI_TITLES[lang] || UI_TITLES.kn;

  return (
    <div id={id} className="pdf-container" style={{ width: 900, backgroundColor: "#FFFDF7", color: "#1E293B", fontFamily: "'Noto Sans Kannada', 'Noto Sans Devanagari', 'Inter', sans-serif" }}>
      <div className="pdf-page" style={{ width: 900, minHeight: 1250, padding: "32px 36px", boxSizing: "border-box" }}>
        {/* Sacred Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #D4AF37", paddingBottom: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", letterSpacing: 1.5, textTransform: "uppercase" }}>
            {dict.banner}
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: "#78350F", margin: "6px 0 4px" }}>
            {dict.title}
          </h1>
          <div style={{ fontSize: 11, color: "#64748B" }}>
            {dict.subtitle}
          </div>
        </div>

        {/* Devotee Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: 10, backgroundColor: "#FEF3C7", borderRadius: 8, border: "1px solid #FCD34D", marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜಾತಕರು:</span>{" "}
            <span style={{ fontSize: 12, fontWeight: 800, color: "#1E293B" }}>{devoteeName || "Devotee"}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜನನ ದಿನಾಂಕ:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 600 }}>{birthDate}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಚಂದ್ರ ರಾಶಿ:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{rashiName}</span>
          </div>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#92400E" }}>ಜನ್ಮ ನಕ್ಷತ್ರ:</span>{" "}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{nakshatraName}</span>
          </div>
        </div>

        {/* Priest & Pooja Details Box */}
        <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 14, backgroundColor: "#FFFBEB", marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FDE68A", paddingBottom: 6, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>🪔 {dict.priestBoxTitle}</span>
            <span style={{ fontSize: 11, color: "#B45309" }}>{dict.priestCallNotice}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11 }}>
            <div>
              <div style={{ color: "#64748B", fontWeight: 600 }}>{dict.priestNameLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E" }}>{priestName || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"}</div>
              <div style={{ color: "#475569", marginTop: 4 }}>
                <strong>{dict.priestPhoneLabel}</strong> <span style={{ fontFamily: "monospace", fontSize: 12, color: "#B45309" }}>{priestPhone || "9972339362"}</span>
              </div>
            </div>
            <div>
              <div style={{ color: "#64748B", fontWeight: 600 }}>{dict.poojaLabel}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{poojaName || "ಶ್ರೀ ಮಹಾಗಣಪತಿ ಹೋಮ & ನವಗ್ರಹ ಶಾಂತಿ"}</div>
              <div style={{ color: "#64748B", marginTop: 4 }}>
                <strong>{dict.placeLabel}</strong> {poojaPlace || "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ"}
              </div>
            </div>
          </div>
        </div>

        {/* 3 QR Codes Side-by-Side Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          {/* 30-Day Card */}
          <div style={{ border: "2px solid #10B981", borderRadius: 8, padding: 12, backgroundColor: "#FFFFFF", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ backgroundColor: "#D1FAE5", color: "#065F46", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, marginBottom: 8 }}>
              {dict.qr30Title}
            </span>
            <div style={{ width: 170, height: 170, border: "1px solid #E2E8F0", borderRadius: 6, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
              {qr30DataUrl ? (
                <img src={qr30DataUrl} alt="30-Day Calendar QR" style={{ width: 160, height: 160, display: "block" }} />
              ) : (
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Loading QR...</div>
              )}
            </div>
            <div style={{ fontSize: 10.5, color: "#475569", marginTop: 8, lineHeight: 1.4 }}>
              {dict.qr30Desc}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 10, fontWeight: 700, color: "#047857" }}>
              RRULE: 30 Days Count
            </div>
          </div>

          {/* 90-Day Card */}
          <div style={{ border: "2px solid #D4AF37", borderRadius: 8, padding: 12, backgroundColor: "#FFFDF0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 2px 4px rgba(212,175,55,0.15)" }}>
            <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, marginBottom: 8 }}>
              ⭐ {dict.qr90Title}
            </span>
            <div style={{ width: 170, height: 170, border: "1px solid #FCD34D", borderRadius: 6, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
              {qr90DataUrl ? (
                <img src={qr90DataUrl} alt="90-Day Calendar QR" style={{ width: 160, height: 160, display: "block" }} />
              ) : (
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Loading QR...</div>
              )}
            </div>
            <div style={{ fontSize: 10.5, color: "#78350F", marginTop: 8, lineHeight: 1.4, fontWeight: 600 }}>
              {dict.qr90Desc}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 10, fontWeight: 700, color: "#B45309" }}>
              RRULE: 90 Days Count
            </div>
          </div>

          {/* 120-Day Card */}
          <div style={{ border: "2px solid #6366F1", borderRadius: 8, padding: 12, backgroundColor: "#FFFFFF", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ backgroundColor: "#EEF2FF", color: "#3730A3", padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800, marginBottom: 8 }}>
              {dict.qr120Title}
            </span>
            <div style={{ width: 170, height: 170, border: "1px solid #E2E8F0", borderRadius: 6, padding: 4, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
              {qr120DataUrl ? (
                <img src={qr120DataUrl} alt="120-Day Calendar QR" style={{ width: 160, height: 160, display: "block" }} />
              ) : (
                <div style={{ fontSize: 10, color: "#94A3B8" }}>Loading QR...</div>
              )}
            </div>
            <div style={{ fontSize: 10.5, color: "#475569", marginTop: 8, lineHeight: 1.4 }}>
              {dict.qr120Desc}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 8, fontSize: 10, fontWeight: 700, color: "#4338CA" }}>
              RRULE: 120 Days Count
            </div>
          </div>
        </div>

        {/* Scanning Instructions */}
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, backgroundColor: "#F8FAFC", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
            📱 {dict.instructionsHeading}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 10.5, color: "#475569" }}>
            <div>
              <p style={{ margin: "2px 0" }}>{dict.step1}</p>
              <p style={{ margin: "2px 0" }}>{dict.step2}</p>
            </div>
            <div>
              <p style={{ margin: "2px 0" }}>{dict.step3}</p>
              <p style={{ margin: "2px 0" }}>{dict.step4}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", textAlign: "center", fontSize: 10, color: "#94A3B8" }}>
          {dict.footer}
        </div>
      </div>
    </div>
  );
};
