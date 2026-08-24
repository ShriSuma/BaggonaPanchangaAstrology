import React from "react";
import { transliterateName } from "../../../utils/transliterator";

export type PriestQrCard1PageTemplateProps = {
  personName: string;
  rashiName: string;
  nakshatraName: string;
  gotra?: string;
  priestName: string;
  priestPhone: string;
  priestTitle?: string;
  durationDays: number;
  qrDataUrl: string;
  lang?: string;
};

export const PriestQrCard1PageTemplate: React.FC<PriestQrCard1PageTemplateProps> = ({
  personName,
  rashiName,
  nakshatraName,
  gotra,
  priestName,
  priestPhone,
  priestTitle,
  durationDays,
  qrDataUrl,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const durationLabels: Record<string, string> = {
    kn: durationDays === 30 ? "೧ ತಿಂಗಳು (೩೦ ದಿನಗಳು)" : durationDays === 90 ? "೩ ತಿಂಗಳು (೯೦ ದಿನಗಳು)" : durationDays === 180 ? "೬ ತಿಂಗಳು (೧೮೦ ದಿನಗಳು)" : "೧೨ ತಿಂಗಳು (೩೬೫ ದಿನಗಳು - ೧ ಪೂರ್ಣ ವರ್ಷ)",
    en: `${durationDays} Days Calendar Subscription`,
    hi: durationDays === 30 ? "1 महीना (30 दिन)" : durationDays === 90 ? "3 महीने (90 दिन)" : durationDays === 180 ? "6 महीने (180 दिन)" : "12 महीने (365 दिन - 1 पूर्ण वर्ष)",
    te: durationDays === 30 ? "1 నెల (30 రోజులు)" : durationDays === 90 ? "3 నెలలు (90 రోజులు)" : durationDays === 180 ? "6 నెలలు (180 రోజులు)" : "12 నెలలు (365 రోజులు - 1 పూర్ణ సంవత్సరం)",
    ta: durationDays === 30 ? "1 மாதம் (30 நாட்கள்)" : durationDays === 90 ? "3 மாதங்கள் (90 நாட்கள்)" : durationDays === 180 ? "6 மாதங்கள் (180 நாட்கள்)" : "12 மாதங்கள் (365 நாட்கள் - 1 முழு வருடம்)"
  };

  const durationLabel = durationLabels[code] || durationLabels.en;

  const headerTitles: Record<string, { top: string; main: string; sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಸಿದ್ಧ ಅರ್ಚಕ ಆಶೀರ್ವಾದ QR ಕೋಡ್ ಕಾರ್ಡ್ ॥",
      sub: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪವಿತ್ರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಭಕ್ತರಿಗೆ ವಿಶೇಷವಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ದೈನಿಕ ಪಂಚಾಂಗ"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Panchanga · Priest Ashirvada QR Code Card",
      sub: "Sacred Daily Panchanga & Muhurtha Sync for Devotee"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण पंचांग · सिद्ध अर्चक आशीर्वाद QR कोड कार्ड ॥",
      sub: "श्री गोकर्ण क्षेत्र के पवित्र आशीर्वाद से निर्मित दैनिक पंचांग"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ పంచాంగం · సిద్ధ అర్చక ఆశీర్వాద QR కోడ్ కార్డ్ ॥",
      sub: "శ్రీ గోకర్ణ క్షేత్ర పవిత్ర ఆశీస్సులతో రూపకల్పన చేసిన దైనిక పంచాంగం"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண பஞ்சாங்கம் · அர்ச்சகர் ஆசீர்வாத QR கோட் கார்டு ॥",
      sub: "ஶ்ரீ கோகர்ண க்ஷேத்திரத்தின் புனித ஆசியுடன் தயாரிக்கப்பட்ட தினசரி பஞ்சாங்கம்"
    }
  };

  const headers = headerTitles[code] || headerTitles.en;

  const devoteeLabels: Record<string, { title: string; rashi: string; nakshatra: string; gotra: string; duration: string; defaultDevotee: string }> = {
    kn: { title: "👤 ಭಕ್ತರ ವಿವರಗಳು", rashi: "ರಾಶಿ:", nakshatra: "ನಕ್ಷತ್ರ:", gotra: "ಗೋತ್ರ:", duration: "ಆಯ್ಕೆಮಾಡಿದ ಅವಧಿ:", defaultDevotee: "ಶ್ರೀಯುತ ಭಕ್ತರು" },
    en: { title: "👤 Devotee Details", rashi: "Rashi:", nakshatra: "Nakshatra:", gotra: "Gotra:", duration: "Duration:", defaultDevotee: "Devotee" },
    hi: { title: "👤 भक्त विवरण", rashi: "राशि:", nakshatra: "नक्षत्र:", gotra: "गोत्र:", duration: "अवधि:", defaultDevotee: "भक्त" },
    te: { title: "👤 భక్తుని వివరాలు", rashi: "రాశి:", nakshatra: "నక్షత్రం:", gotra: "గోత్రం:", duration: "వ్యవధి:", defaultDevotee: "భక్తులు" },
    ta: { title: "👤 பக்தர் விவரங்கள்", rashi: "ராசி:", nakshatra: "நக்ஷத்திரம்:", gotra: "கோத்திரம்:", duration: "கால அளவு:", defaultDevotee: "பக்தர்" }
  };

  const devLabels = devoteeLabels[code] || devoteeLabels.en;

  const priestLabels: Record<string, { title: string; pos: string; phone: string; temple: string; defaultTitle: string }> = {
    kn: { title: "🔱 ಅರ್ಚಕರ ವಿವರಗಳು", pos: "ಪದವಿ:", phone: "ದೂರವಾಣಿ:", temple: "ಕ್ಷೇತ್ರ:", defaultTitle: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು" },
    en: { title: "🔱 Priest Details", pos: "Title:", phone: "Phone:", temple: "Temple:", defaultTitle: "Gokarna Chief Panchanga Priest" },
    hi: { title: "🔱 अर्चक विवरण", pos: "पदवि:", phone: "दूरभाष:", temple: "क्षेत्र:", defaultTitle: "गोकर्ण क्षेत्र प्रधान पंचांग अर्चक" },
    te: { title: "🔱 అర్చకుల వివరాలు", pos: "పదవి:", phone: "ఫోన్:", temple: "క్షేత్రం:", defaultTitle: "గోకర్ణ క్షేత్ర ప్రధాన పంచాంగ అర్చకులు" },
    ta: { title: "🔱 அர்ச்சகர் விவரங்கள்", pos: "பதவி:", phone: "தொலைபேசி:", temple: "க்ஷேத்திரம்:", defaultTitle: "கோகர்ண க்ஷேத்திர முதன்மை அர்ச்சகர்" }
  };

  const pLabels = priestLabels[code] || priestLabels.en;
  const activePriestTitle = priestTitle || pLabels.defaultTitle;
  const rawDevoteeName = personName || devLabels.defaultDevotee;
  const devoteeNameDisplay = transliterateName(rawDevoteeName, code);
  const gotraDisplay = gotra ? transliterateName(gotra, code) : "";

  // Custom Dedicated Message with Devotee Name TWICE!
  const getCustomMessage = () => {
    if (code === "kn") {
      return (
        <>
          "ಶ್ರೀಯುತ <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> ಅವರಿಗೆ ವಿಶೇಷವಾಗಿ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಯಾರಿಸಲಾದ ದಿನನಿತ್ಯದ <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> ದಿನಗಳ ನಿಖರ ಪಂಚಾಂಗ ಹಾಗೂ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳ ದೈವಿಕ QR ಕೋಡ್. ಪ್ರತಿಯೊಂದು ದಿನದ ಪಂಚಾಂಗವು <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> ನಿಮಗಾಗಿಯೇ ಪ್ರತ್ಯೇಕವಾಗಿ ಗಣನೆ ಮಾಡಲಾಗಿದೆ."
        </>
      );
    }
    if (code === "hi") {
      return (
        <>
          "श्री <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> जी के लिए विशेष रूप से श्री गोकर्ण क्षेत्र में तैयार किया गया दैनिक <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> दिनों का सटीक पंचांग एवं पवित्र मुहूर्त का दैवीय QR कोड। प्रत्येक दिन का पंचांग <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> जी आपके लिए ही पृथक रूप से गणना किया गया है।"
        </>
      );
    }
    if (code === "te") {
      return (
        <>
          "శ్రీయుత <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> గారి కొరకు ప్రత్యేకంగా శ్రీ గోకర్ణ క్షేత్రంలో తయారుచేసిన దైనిక <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> రోజుల ఖచ్చిత పంచాంగం మరియు పవిత్ర ముహూర్తాల దైవిక QR కోడ్. ప్రతి ఒక్క రోజు పంచాంగం <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> గారి కోసమే ప్రత్యేకంగా గణన చేయబడింది."
        </>
      );
    }
    if (code === "ta") {
      return (
        <>
          "திரு <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> அவர்களுக்காக பிரத்யேகமாக ஶ்ரீ கோகர்ண க்ஷேத்திரத்தில் தயாரிக்கப்பட்ட தினசரி <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> நாட்களின் துல்லிய பஞ்சாங்கம் மற்றும் புனித முகூர்த்தங்களின் திவ்ய QR குறியீடு. ஒவ்வொரு நாளின் பஞ்சாங்கமும் <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> உங்களுக்காகவே தனித்தனியாக கணக்கிடப்பட்டுள்ளது."
        </>
      );
    }
    return (
      <>
        "Specially calculated daily <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> days Panchanga and sacred Muhurthas QR code generated exclusively for Sri <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span> at Sri Gokarna Kshetra. Each day's Panchanga has been individually and meticulously computed for <span style={{ color: "#92400E", fontWeight: 800 }}>{devoteeNameDisplay}</span>."
      </>
    );
  };

  const scanText = code === "kn"
    ? `ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ಈ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ${durationDays} ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡಿ`
    : code === "hi"
    ? `अपने मोबाइल से इस QR कोड को स्कैन करके ${durationDays} दिनों का पंचांग सिंक करें`
    : code === "te"
    ? `మీ మొబైల్ ద్వారా ఈ QR కోడ్‌ను స్కాన్ చేసి ${durationDays} రోజుల పంచాంగం సింక్ చేయండి`
    : code === "ta"
    ? `உங்கள் மொபைல் மூலம் இந்த QR குறியீட்டை ஸ்கேன் செய்து ${durationDays} நாட்களின் பஞ்சாங்கம் சிங்க் செய்யவும்`
    : `Scan QR Code to Sync ${durationDays} Days Panchanga`;

  const instructionTitle = code === "kn" ? "ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು:"
    : code === "hi" ? "मोबाइल कैलेंडर सिंक करने के सरल चरण:"
    : code === "te" ? "మొబైల్ క్యాలెండర్ సింక్ చేయు సులభ దశలు:"
    : code === "ta" ? "மொபைல் கேலண்டர் சிங்க் செய்வதற்கான எளிய படிகள்:"
    : "Simple Mobile Calendar Sync Steps:";

  const step1 = code === "kn" ? "ನಿಮ್ಮ iPhone ಅಥವಾ Android ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ತೆರೆದು ಮೇಲಿನ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ."
    : code === "hi" ? "अपने iPhone या Android मोबाइल का कैमरा खोलकर ऊपर दिए गए QR कोड को स्कैन करें।"
    : code === "te" ? "మీ iPhone లేదా Android మొబైల్ కెమెరా తెరిచి పైన ఉన్న QR కోడ్‌ను స్కాన్ చేయండి."
    : code === "ta" ? "உங்கள் iPhone அல்லது Android மொபைல் கேமராவை திறந்து மேலே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்."
    : "Open your iPhone or Android camera and scan the QR code above.";

  const step2 = code === "kn" ? "ಪರದೆಯ ಮೇಲೆ ಬರುವ 'Baggona Panchanga Sync / Calendar Download' ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ."
    : code === "hi" ? "स्क्रीन पर आने वाले 'Baggona Panchanga Sync / Calendar Download' लिंक पर क्लिक करें।"
    : code === "te" ? "స్క్రీన్ పై వచ్చే 'Baggona Panchanga Sync / Calendar Download' లింక్ క్లిక్ చేయండి."
    : code === "ta" ? "திரையில் தோன்றும் 'Baggona Panchanga Sync / Calendar Download' லிங்கை கிளிக் செய்யவும்."
    : "Tap the 'Baggona Panchanga Sync / Calendar Download' link on your screen.";

  const step3 = code === "kn" ? "ನಿಮ್ಮ Apple Calendar ಅಥವಾ Google Calendar ನಲ್ಲಿ 'Add All Events / Subscribe' ಆಯ್ಕೆ ಮಾಡಿ."
    : code === "hi" ? "अपने Apple Calendar या Google Calendar में 'Add All Events / Subscribe' चुनें।"
    : code === "te" ? "మీ Apple Calendar లేదా Google Calendar లో 'Add All Events / Subscribe' ఎంచుకోండి."
    : code === "ta" ? "உங்கள் Apple Calendar அல்லது Google Calendar இல் 'Add All Events / Subscribe' தேர்ந்தெடுக்கவும்."
    : "Select 'Add All Events / Subscribe' in Apple Calendar or Google Calendar.";

  return (
    <div
      id="priest-qr-card-1page-container"
      style={{
        width: "794px",
        height: "1123px",
        padding: "24px",
        boxSizing: "border-box",
        background: "#FFFDF7",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#451A03",
        position: "relative"
      }}
    >
      {/* Outer Luxury Gold Border */}
      <div
        style={{
          width: "100%",
          height: "100%",
          border: "3px solid #D97706",
          borderRadius: "12px",
          padding: "20px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative"
        }}
      >
        {/* Top Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
            {headers.top}
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {headers.main}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {headers.sub}
          </div>
        </div>

        {/* Info Grid (Devotee & Priest Context) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(180,83,9,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              {devLabels.title}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {devoteeNameDisplay}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{devLabels.rashi}</strong> {rashiName || "—"}</div>
              <div><strong>{devLabels.nakshatra}</strong> {nakshatraName || "—"}</div>
              {gotraDisplay && <div><strong>{devLabels.gotra}</strong> {gotraDisplay}</div>}
              <div><strong>{devLabels.duration}</strong> <span style={{ color: "#065F46", fontWeight: 700 }}>{durationLabel}</span></div>
            </div>
          </div>

          {/* Priest Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(180,83,9,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              {pLabels.title}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {priestName}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{pLabels.pos}</strong> {activePriestTitle}</div>
              <div><strong>{pLabels.phone}</strong> <span style={{ color: "#78350F", fontWeight: 700 }}>{priestPhone}</span></div>
              <div><strong>{pLabels.temple}</strong> ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ</div>
            </div>
          </div>
        </div>

        {/* Dedicated Highlighted Ashirvada Message */}
        <div
          style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)",
            border: "2px solid #F59E0B",
            borderRadius: "10px",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(245, 158, 11, 0.15)",
            marginBottom: "16px"
          }}
        >
          <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#78350F", lineHeight: "1.6" }}>
            {getCustomMessage()}
          </div>
        </div>

        {/* Center QR Code Display */}
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "20px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(120, 53, 15, 0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", marginBottom: "10px" }}>
            📱 {scanText}
          </div>

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Priest Ashirvada QR Code"
              style={{ width: "230px", height: "230px", border: "2px solid #F59E0B", borderRadius: "10px", padding: "8px", background: "#FFFFFF" }}
            />
          ) : (
            <div style={{ width: "230px", height: "230px", border: "2px solid #F59E0B", borderRadius: "10px", background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400E", fontWeight: 700 }}>
              Generating QR Code...
            </div>
          )}

          <div style={{ fontSize: "11px", fontWeight: 700, color: "#B45309", marginTop: "10px" }}>
            ✨ Google Calendar / Apple Calendar 1-Click Sync Enabled ({code.toUpperCase()})
          </div>
        </div>

        {/* Mobile Installation Instructions */}
        <div
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #FCD34D",
            borderRadius: "10px",
            padding: "14px 18px",
            boxShadow: "0 1px 4px rgba(180,83,9,0.05)"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "8px", textTransform: "uppercase" }}>
            📲 {instructionTitle}
          </div>
          <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.6" }}>
            <div><strong>೧.</strong> {step1}</div>
            <div><strong>೨.</strong> {step2}</div>
            <div><strong>೩.</strong> {step3}</div>
          </div>
        </div>

        {/* Footer Banner */}
        <div
          style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "10px 14px",
            textAlign: "center",
            marginTop: "14px"
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#FEF3C7" }}>
            "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
          </div>
          <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
            {activePriestTitle} · {priestName} (ದೂರವಾಣಿ: {priestPhone})
          </div>
        </div>
      </div>
    </div>
  );
};
