import React from "react";
import type { MaranottaraResult, MasikaScheduleItem } from "../../features/maranottara/maranottaraEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type MaranottaraPdfTemplateProps = {
  result: MaranottaraResult;
  lang?: string;
};

const PDF_LABELS: Record<string, Record<string, string>> = {
  topBlessing: {
    kn: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
    en: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
    hi: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
    te: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
    ta: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்னம் ॥"
  },
  headerTitle: {
    kn: "॥ ಬಗ್ಗೋಣ ಮರಣೋತ್ತರ, ಶ್ರಾದ್ಧ ಮಾಸಿಕ & ಪಿತೃ ಸಂಸ್ಕಾರ ದೈವಿಕ ವರದಿ ॥",
    en: "Baggona Maranottara, Shraddha Masika & Pitru Samskara Sacred Report",
    hi: "॥ बग्गोण मरणोत्तर, मासिक श्राद्ध एवं पितृ संस्कार दिव्य पत्रिका ॥",
    te: "॥ బగ్గోణ మరణోత్తర, శ్రాద్ధ మాసిక & పితృ సంస్కార దివ్య నివేదిక ॥",
    ta: "॥ பக்கோண மரணோத்தர, சிரார்த்த மாசிக & பித்ரு சம்ஸ்கார அறிக்கை ॥"
  },
  headerSub: {
    kn: "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಧರ್ಮಶಾಸ್ತ್ರೋಕ್ತ ಸಿದ್ಧ ಶ್ರಾದ್ಧ ತಿಥಿ ಗಣನ ಪದ್ಧತಿ (ಅಪರಾಹ್ನ ಕಾಲ ನಿರ್ಣಯ)",
    en: "Authentic Vedic Shraddha Tithi & Demise Dosha Calculation from Gokarna Kshetra (Aparahna Kaala)",
    hi: "श्री गोकर्ण क्षेत्र धर्मशास्त्रोक्त शुद्ध श्राद्ध तिथि गणना (अपराह्न काल निर्णय)",
    te: "శ్రీ గోకర్ణ క్షేత్ర ధర్మశాస్త్రోక్త శ్రాద్ధ తిథి గణన (అపరాహ్న కాల నిర్ణయం)",
    ta: "ஸ்ரீ கோகர்ண தர்மசாஸ்திர சிரார்த்த திதி கணக்கீடு (அபராஹ்ண காலம்)"
  },
  demiseDate: { kn: "ಮರಣ ದಿನಾಂಕ:", en: "Demise Date:", hi: "मृत्यु तिथि:", te: "మరణించిన తేదీ:", ta: "மரண தேதி:" },
  demiseTime: { kn: "ಮರಣ ಸಮಯ:", en: "Demise Time:", hi: "मृत्यु समय:", te: "మరణించిన సమయం:", ta: "மரண நேரம்:" },
  location: { kn: "ಸ್ಥಳ:", en: "Location:", hi: "स्थान:", te: "స్థలం:", ta: "இடம்:" },
  demiseTithi: { kn: "ಮರಣ ತಿಥಿ:", en: "Demise Tithi:", hi: "मृत्यु तिथि:", te: "మరణ తిథి:", ta: "மரண திதி:" },
  demiseNakshatra: { kn: "ಮರಣ ನಕ್ಷತ್ರ:", en: "Demise Nakshatra:", hi: "मृत्यु नक्षत्र:", te: "మరణ నక్షత్రం:", ta: "மரண நட்சத்திரம்:" },
  paksha: { kn: "ಪಕ್ಷ:", en: "Paksha:", hi: "पक्ष:", te: "పక్షం:", ta: "பக்ஷம்:" },
  antyestiTitle: {
    kn: "🕯️ ೧ ರಿಂದ ೧೨ ದಿನಗಳ ಆಶೌಚ & ನಿತ್ಯ ಸಂಸ್ಕಾರ ವಿಧಿ (Antyesti Roadmap):",
    en: "🕯️ 1-12 Days Antyesti & Purification Roadmap:",
    hi: "🕯️ 1-12 दिवसीय अशौच एवं नित्य संस्कार विधि:",
    te: "🕯️ 1-12 రోజుల ఆశౌచ & నిత్య సంస్కార విధి:",
    ta: "🕯️ 1-12 நாட்கள் அந்தியேஷ்டி & ஆசௌச விதி:"
  },
  doshaTitle: {
    kn: "🔱 ಮರಣ ದೋಷ & ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಶಾಂತಿ ಪೂಜೆಗಳು:",
    en: "🔱 Demise Dosha & Gokarna Shanti Remedies:",
    hi: "🔱 मृत्यु दोष एवं गोकर्ण क्षेत्र शांति पूजा:",
    te: "🔱 మరణ దోష & గోకర్ణ క్షేత్ర శాంతి పూజలు:",
    ta: "🔱 மரண தோஷ & கோகர்ண சாந்தி பரிகாரங்கள்:"
  },
  masikaTitleY1: {
    kn: "📅 ಪ್ರಥಮ ವರ್ಷದ ಮಾಸಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ ದಿನಾಂಕಗಳು (Year 1: M1 - M12):",
    en: "📅 Year 1 Monthly Masika Schedule (Months 1 to 12):",
    hi: "📅 प्रथम वर्ष के मासिक श्राद्ध (मास 1 से 12):",
    te: "📅 మొదటి సంవత్సరం మాసిక శ్రాద్ధాలు (నెలలు 1 నుండి 12):",
    ta: "📅 முதலாம் ஆண்டு மாசிக சிரார்த்தங்கள் (மாதங்கள் 1 முதல் 12):"
  },
  masikaTitleExtended: {
    kn: "📅 ಮುಂದಿನ ವರ್ಷಗಳ ಮಾಸಿಕ & ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ಕೋಷ್ಟಕ (Extended Schedule):",
    en: "📅 Extended Monthly & Annual Varshika Shraddha Schedule:",
    hi: "📅 आगामी वर्षों का मासिक एवं वार्षिक श्राद्ध कैलेंडर:",
    te: "📅 తదుపరి సంవత్సరాల మాసిక & వార్షిక శ్రాద్ధ పట్టిక:",
    ta: "📅 அடுத்த ஆண்டுகளின் மாசிக & வருடாந்திர சிரார்த்த அட்டவணை:"
  },
  asthiTitle: {
    kn: "🌊 ಅಸ್ಥಿ ವಿಸರ್ಜನೆ & ಪವಿತ್ರ ತೀರ್ಥ ಕ್ಷೇತ್ರಗಳು:",
    en: "🌊 Asthi Visarjana & Sacred Tirthas:",
    hi: "🌊 अस्थि विसर्जन एवं तीर्थ क्षेत्र:",
    te: "🌊 అస్థి విసర్జన & తీర్థ క్షేత్రాలు:",
    ta: "🌊 அஸ்தி விசர்ஜனம் & புண்ணிய தீர்த்தங்கள்:"
  },
  garudaTitle: {
    kn: "📜 ಗರುಡ ಪುರಾಣ ಸಾರ & ಪಿತೃ ಮೋಕ್ಷ ತತ್ವ:",
    en: "📜 Garuda Purana Wisdom on Soul's Liberation:",
    hi: "📜 गरुड़ पुराण सार एवं पितृ मोक्ष तत्व:",
    te: "📜 గరుడ పురాణ సారం & పితృ మోక్ష తత్వం:",
    ta: "📜 கருட புராண சாரம் & பித்ரு மோக்ஷ தத்துவம்:"
  },
  priestLine: {
    kn: "🕉️ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು — ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮೊಬೈಲ್: +91 99723 39362",
    en: "🕉️ Gokarna Kshetra Chief Priest — Sri Shreeram Pandit · Mobile: +91 99723 39362",
    hi: "🕉️ गोकर्ण क्षेत्र मुख्य अर्चक — श्रीराम पंडित · मोबाइल: +91 99723 39362",
    te: "🕉️ గోకర్ణ క్షేత్ర ప్రధాన అర్చకులు — శ్రీరామ్ పండిట్ · మొబైల్: +91 99723 39362",
    ta: "🕉️ கோகர்ண தலைமை அர்ச்சகர் — ஸ்ரீராம் பண்டிட் · அலைபேசி: +91 99723 39362"
  },
  priestSub: {
    kn: "ನಾರಾಯಣಬಲಿ, ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ, ಅಸ್ಥಿ ವಿಸರ್ಜನೆ ಹಾಗೂ ಗೋತ್ರ ಸಂಕಲ್ಪ ಸೇವೆಗಳಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ",
    en: "Direct consultation for Narayanabali, Tripindi Shraddha, Asthi Visarjana & Gotra Sankalpa",
    hi: "नारायणबलि, त्रिपिंडी श्राद्ध, अस्थि विसर्जन एवं गोत्र संकल्प हेतु संपर्क करें",
    te: "నారాయణబలి, త్రిపిండి శ్రాద్ధం, అస్థి విసర్జన మరియు గోత్ర సంకల్ప సేవలకు నేరుగా సంప్రదించండి",
    ta: "நாராயணபலி, திரிபிண்டி சிரார்த்தம், அஸ்தி விசர்ஜனம் மற்றும் கோத்ர சங்கல்ப சேவைகளுக்கு"
  }
};

export const MaranottaraPdfTemplate: React.FC<MaranottaraPdfTemplateProps> = ({
  result,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const getLabel = (key: string): string => {
    return PDF_LABELS[key]?.[code] || PDF_LABELS[key]?.kn || "";
  };

  const renderMasikaCard = (item: MasikaScheduleItem) => (
    <div
      key={item.monthIndex}
      style={{
        background: item.isVarshikaShraddha ? "#FEF3C7" : "#FFFDF7",
        border: item.isVarshikaShraddha ? "1.5px solid #D97706" : "1px solid #FCD34D",
        borderRadius: "5px",
        padding: "4px 6px",
        fontSize: "8.5px"
      }}
    >
      <div style={{ fontWeight: 800, color: item.isVarshikaShraddha ? "#92400E" : "#78350F" }}>
        {item.masikaName[code] || item.masikaName.kn}
      </div>
      <div style={{ color: "#065F46", fontWeight: 800, fontSize: "9px" }}>
        📆 {item.formattedDateStr[code] || item.formattedDateStr.kn}
      </div>
      <div style={{ fontSize: "8px", color: "#92400E" }}>
        ({item.dayOfWeek[code] || item.dayOfWeek.kn}) · {item.aparahnaWindow || "ಅಪರಾಹ್ನ ಕಾಲ"}
      </div>
    </div>
  );

  const totalPages = result.yearsCount <= 1 ? 2 : result.yearsCount <= 3 ? 3 : 4;

  return (
    <div
      id="maranottara-pdf-container"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0",
        width: "794px",
        background: "#FFFFFF",
        color: "#451A03",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}
    >
      {/* PAGE 1: Deceased Details, 1-12 Day Antyesti Roadmap & Dosha Shanti */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "#FFFDF7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderBottom: "1px dashed #CBD5E1"
        }}
      >
        <div
          style={{
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "8px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
              {getLabel("topBlessing")}
            </div>
            <h1 style={{ fontSize: "16px", fontWeight: 900, color: "#78350F", margin: "4px 0 2px 0" }}>
              {getLabel("headerTitle")}
            </h1>
            <div style={{ fontSize: "9.5px", color: "#B45309", fontWeight: 600 }}>
              {getLabel("headerSub")}
            </div>
          </div>

          {/* Deceased Summary Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F", marginBottom: "4px" }}>
              👤 {result.personName}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "10px", color: "#92400E" }}>
              <div><strong>{getLabel("demiseDate")}</strong> <span style={{ fontWeight: 800, color: "#991B1B" }}>{result.demiseDate}</span></div>
              {result.demiseTime && <div><strong>{getLabel("demiseTime")}</strong> {result.demiseTime}</div>}
              <div><strong>{getLabel("location")}</strong> {result.location}</div>
              <div><strong>{getLabel("demiseTithi")}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseTithi[code] || result.demiseTithi.kn}</span></div>
              <div><strong>{getLabel("demiseNakshatra")}</strong> <span style={{ fontWeight: 800, color: "#065F46" }}>{result.demiseNakshatra[code] || result.demiseNakshatra.kn}</span></div>
              <div><strong>{getLabel("paksha")}</strong> <span style={{ fontWeight: 800, color: "#78350F" }}>{result.demisePaksha[code] || result.demisePaksha.kn}</span></div>
            </div>
          </div>

          {/* 1-12 Days Antyesti Roadmap Compact Grid */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px", flex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", borderBottom: "1px solid #FEF3C7", paddingBottom: "4px", marginBottom: "6px" }}>
              {getLabel("antyestiTitle")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {result.antyestiRoadmap.slice(0, 10).map((day) => (
                <div key={day.dayNumber} style={{ background: "#FFFDF7", border: "1px solid #FCD34D", borderRadius: "6px", padding: "4px 6px", fontSize: "9px" }}>
                  <div style={{ fontWeight: 800, color: "#92400E" }}>
                    D{day.dayNumber}: {day.dayTitle[code] || day.dayTitle.kn}
                  </div>
                  <div style={{ color: "#451A03", marginTop: "1px" }}>
                    {day.rituals[code] || day.rituals.kn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dosha & Shanti Poojas */}
          <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              {getLabel("doshaTitle")}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
              {sanitizeAIText(result.doshaAnalysis.doshaSummary[code] || result.doshaAnalysis.doshaSummary.kn)}
            </div>
          </div>

          {/* Footer Page 1 */}
          <div style={{ textAlign: "center", fontSize: "8.5px", color: "#92400E", marginTop: "6px" }}>
            {code === "kn" ? `ಪುಟ ೧ / ${totalPages} · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಸನ್ನಿಧಿ · ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362)` : `Page 1 / ${totalPages} · Sri Gokarna Mahabaleshwara Sanctum · Sri Shreeram Pandit (+91 99723 39362)`}
          </div>
        </div>
      </div>

      {/* PAGE 2: Monthly Masika Schedule (Months 1-12), Asthi Visarjana & Garuda Purana */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "#FFFDF7",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderBottom: totalPages > 2 ? "1px dashed #CBD5E1" : "none"
        }}
      >
        <div
          style={{
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Top Title */}
          <div style={{ textAlign: "center", borderBottom: "1.5px solid #F59E0B", paddingBottom: "6px", marginBottom: "8px" }}>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
              {getLabel("masikaTitleY1")}
            </div>
          </div>

          {/* Masika Schedule Grid (Months 1 to 12) */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px", marginBottom: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {result.masikaSchedule.slice(0, 12).map(renderMasikaCard)}
            </div>
          </div>

          {/* Asthi Visarjana Guide Card */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
              {getLabel("asthiTitle")}
            </div>
            <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
              {result.asthiGuide.optimalTiming[code] || result.asthiGuide.optimalTiming.kn}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "#78350F", marginTop: "3px" }}>
              {result.asthiGuide.mantra}
            </div>
          </div>

          {/* Garuda Purana Wisdom */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px 10px", marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
              {getLabel("garudaTitle")}
            </div>
            <div style={{ fontSize: "9.5px", color: "#451A03", lineHeight: "1.4" }}>
              {result.garudaWisdom.mokshaPhilosophy[code] || result.garudaWisdom.mokshaPhilosophy.kn}
            </div>
          </div>

          {/* Footer Card with Priest Shreeram Pandit Contact */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "8px 12px",
              textAlign: "center",
              color: "#FEF3C7"
            }}
          >
            <div style={{ fontSize: "10.5px", fontWeight: 800 }}>
              {getLabel("priestLine")}
            </div>
            <div style={{ fontSize: "9px", color: "#FDE68A", marginTop: "2px" }}>
              {getLabel("priestSub")}
            </div>
          </div>

          {/* Footer Page 2 */}
          <div style={{ textAlign: "center", fontSize: "8.5px", color: "#92400E", marginTop: "4px" }}>
            {code === "kn" ? `ಪುಟ ೨ / ${totalPages}` : `Page 2 / ${totalPages}`}
          </div>
        </div>
      </div>

      {/* PAGE 3: Extended Masika Schedule for Multi-Year Durations (Months 13 to 36) */}
      {result.yearsCount > 1 && (
        <div
          className="pdf-page-a4"
          style={{
            width: "794px",
            height: "1123px",
            maxHeight: "1123px",
            padding: "24px",
            boxSizing: "border-box",
            background: "#FFFDF7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderBottom: totalPages > 3 ? "1px dashed #CBD5E1" : "none"
          }}
        >
          <div
            style={{
              border: "3px solid #D97706",
              borderRadius: "12px",
              padding: "16px",
              boxSizing: "border-box",
              background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div style={{ textAlign: "center", borderBottom: "1.5px solid #F59E0B", paddingBottom: "6px", marginBottom: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
                {getLabel("masikaTitleExtended")} (Months 13 - {Math.min(36, result.masikaSchedule.length)})
              </div>
            </div>

            {/* Masika Schedule Grid (Months 13 to 36) */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px", marginBottom: "8px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {result.masikaSchedule.slice(12, 36).map(renderMasikaCard)}
              </div>
            </div>

            {/* Gokarna Narayanabali & Moksha Seva Info */}
            <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                🏛️ {result.gokarnaSevas.priestName} — {getLabel("priestSub")}
              </div>
              <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
                {result.gokarnaSevas.narayanabaliOverview[code] || result.gokarnaSevas.narayanabaliOverview.kn}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: "8.5px", color: "#92400E", marginTop: "4px" }}>
              {code === "kn" ? `ಪುಟ ೩ / ${totalPages} · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ` : `Page 3 / ${totalPages} · Sri Gokarna Mahabaleshwara Sanctum`}
            </div>
          </div>
        </div>
      )}

      {/* PAGE 4: Months 37 to 60 for 4 or 5-Year Durations */}
      {result.yearsCount >= 4 && (
        <div
          className="pdf-page-a4"
          style={{
            width: "794px",
            height: "1123px",
            maxHeight: "1123px",
            padding: "24px",
            boxSizing: "border-box",
            background: "#FFFDF7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              border: "3px solid #D97706",
              borderRadius: "12px",
              padding: "16px",
              boxSizing: "border-box",
              background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div style={{ textAlign: "center", borderBottom: "1.5px solid #F59E0B", paddingBottom: "6px", marginBottom: "8px" }}>
              <div style={{ fontSize: "13px", fontWeight: 900, color: "#78350F" }}>
                {getLabel("masikaTitleExtended")} (Months 37 - {result.masikaSchedule.length})
              </div>
            </div>

            {/* Masika Schedule Grid (Months 37 to 60) */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "8px", marginBottom: "8px", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {result.masikaSchedule.slice(36, 60).map(renderMasikaCard)}
              </div>
            </div>

            {/* Mahalaya & Annual Tarpana Rules */}
            <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                🪔 {result.mahalayaRules.mahalayaOverview[code] || result.mahalayaRules.mahalayaOverview.kn}
              </div>
              <div style={{ fontSize: "9.5px", color: "#92400E", lineHeight: "1.4" }}>
                {result.mahalayaRules.amavasyaTarpanaProcedure[code] || result.mahalayaRules.amavasyaTarpanaProcedure.kn}
              </div>
            </div>

            <div style={{ textAlign: "center", fontSize: "8.5px", color: "#92400E", marginTop: "4px" }}>
              {code === "kn" ? `ಪುಟ ೪ / ${totalPages} · ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ` : `Page 4 / ${totalPages} · Sri Gokarna Mahabaleshwara Sanctum`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
