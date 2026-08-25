import React from "react";
import type { PalmReadingResult } from "../../features/palmreading/palmReadingEngine";
import { sanitizeAIText } from "../../utils/textFormatter";

export type PalmReadingPdfTemplateProps = {
  result: PalmReadingResult;
  personName?: string;
  lang?: string;
  messages?: Array<{ sender: string; text: string; timestamp?: string }>;
};

export const PalmReadingPdfTemplate: React.FC<PalmReadingPdfTemplateProps> = ({
  result,
  personName = "ಶ್ರೀಯುತ ಭಕ್ತರು",
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2);

  const titles: Record<string, { top: string; main: string; page1Sub: string; page2Sub: string }> = {
    kn: {
      top: "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥",
      main: "॥ ಬಗ್ಗೋಣ ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ದೈವಿಕ ವರದಿ ॥",
      page1Sub: "ಭಾಗ ೧: ಹಸ್ತ ತತ್ತ್ವ, ಪಂಚ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ, ಸಪ್ತ ಗ್ರಹ ಪರ್ವತ & ಸಾಮುದ್ರಿಕ ಯೋಗಗಳು (ಬೃಹತ್ ಸಂಹಿತಾ)",
      page2Sub: "ಭಾಗ ೨: ವಯೋಮಾನ ಜೀವನ ಘಟನಾವಳಿ, ಸಮಗ್ರ ಭವಿಷ್ಯ ವಾಣಿ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸಿದ್ಧ ಪರಿಹಾರ"
    },
    en: {
      top: "॥ SRI GOKARNA MAHABALESHWARA SWAMY PRASANNA ॥",
      main: "Baggona Hastarekha Shastra Palmistry Report",
      page1Sub: "Page 1: Hand Chironomy, 5 Major Lines, 7 Mounts & Sacred Samudrika Yogas (Brihat Samhita)",
      page2Sub: "Page 2: Life Stage Chronological Milestones, Full Predictions & Sacred Temple Remedies"
    },
    hi: {
      top: "॥ श्री गोकर्ण महाबलेश्वर स्वामी प्रसन्न ॥",
      main: "॥ बग्गोण हस्तरेखा शास्त्र दैवीय रिपोर्ट ॥",
      page1Sub: "भाग १: हस्त तत्त्व, पंच मुख्य रेखाएं, नवग्रह पर्वत एवं शुभ योग (बृहत् संहिता)",
      page2Sub: "भाग २: कालक्रम जीवन चरण, विस्तृत फलादेश एवं गोकर्ण महाबलेश्वर सिद्ध उपाय"
    },
    te: {
      top: "॥ శ్రీ గోకర్ణ మహాబలేశ్వర స్వామి ప్రసన్న ॥",
      main: "॥ బగ్గోణ హస్త రేఖ శాస్త్ర దైవిక నివేదిక ॥",
      page1Sub: "భాగం 1: హస్త తత్త్వం, పంచ రేఖలు, గ్రహ పర్వతాలు & సాముద్రిక యోగాలు (బృహత్ సంహిత)",
      page2Sub: "భాగం 2: జీవిత దశల కాలక్రమం, సమగ్ర భవిష్యత్ వాణి & గోకర్ణ క్షేత్ర పరిహారాలు"
    },
    ta: {
      top: "॥ ஶ்ரீ கோகர்ண மகாபலேஸ்வரர் ஸ்வாமி பிரசன்ன ॥",
      main: "॥ பக்கோண ஹஸ்த ரேகை சாஸ்திர திவ்ய அறிக்கை ॥",
      page1Sub: "பகுதி 1: கை தத்துவம், பஞ்ச ரேகைகள், கிரக மேடுகள் & சாமுத்ரிகா யோகங்கள்",
      page2Sub: "பகுதி 2: வயதுக் காலக்கட்டங்கள், முழு பலன்கள் & கோகர்ண மகாபலேஸ்வரர் பரிகாரம்"
    }
  };

  const header = titles[code] || titles.en;

  const devLabels: Record<string, { title: string; devotee: string; hand: string; defaultDev: string }> = {
    kn: { title: "👤 ಭಕ್ತರ ವಿವರಗಳು", devotee: "ಭಕ್ತರು:", hand: "ಆಯ್ಕೆಮಾಡಿದ ಹಸ್ತ:", defaultDev: "ಶ್ರೀಯುತ ಭಕ್ತರು" },
    en: { title: "👤 Devotee Details", devotee: "Devotee:", hand: "Inspected Hand:", defaultDev: "Devotee" },
    hi: { title: "👤 भक्त विवरण", devotee: "भक्त:", hand: "परीक्षित हस्त:", defaultDev: "भक्त" },
    te: { title: "👤 భక్తుని వివరాలు", devotee: "భక్తులు:", hand: "పరిశీలించిన చేయి:", defaultDev: "భక్తులు" },
    ta: { title: "👤 பக்தர் விவரங்கள்", devotee: "பக்தர்:", hand: "ஆய்வு செய்த கை:", defaultDev: "பக்தர்" }
  };

  const dLabels = devLabels[code] || devLabels.en;
  const handSideStr = result.handSideLabel[code] || result.handSideLabel.en || result.handSideLabel.kn;
  const devoteeDisplayName = personName || dLabels.defaultDev;

  const footerTexts: Record<string, { top: string; priest: string }> = {
    kn: {
      top: '"ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಹಸ್ತ ರೇಖಾ ಪ್ರಕಾಶ · ಸಕಲ ದೋಷ ಶಮನಂ"',
      priest: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಮುಖ್ಯ ಅರ್ಚಕರು, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (ದೂರವಾಣಿ: +91 99723 39362)"
    },
    en: {
      top: '"Om Gokarna Mahabaleshwara Sacred Palmistry Blessing · All Peace & Victory"',
      priest: "Sri Shreeram Pandit · Chief Priest, Gokarna Kshetra (Phone: +91 99723 39362)"
    },
    hi: {
      top: '"ॐ गोकर्ण महाबलेश्वर संनिधि सिद्ध हस्तरेखा प्रकाश · सर्व दोष शमनम"',
      priest: "श्रीराम पंडित · मुख्य अर्चक, गोकर्ण क्षेत्र (दूरभाष: +91 99723 39362)"
    },
    te: {
      top: '"ఓం గోకర్ణ మహాబలేశ్వర సన్నిధి సిద్ధ హస్త రేఖా ప్రకాశం · సర్వ దోష శమనం"',
      priest: "శ్రీరామ్ పండిత్ · ముఖ్య అర్చకులు, గోకర్ణ క్షేత్రం (ఫోన్: +91 99723 39362)"
    },
    ta: {
      top: '"ஓம் கோகர்ண மகாபலேஸ்வரர் சன்னதி திவ்ய ஹஸ்த ரேகை ஒளி · சர்வ தோஷ சமனம்"',
      priest: "ஶ்ரீராம் பண்டிதர் · முதன்மை அர்ச்சகர், கோகர்ண க்ஷேத்திரம் (தொலைபேசி: +91 99723 39362)"
    }
  };

  const fTexts = footerTexts[code] || footerTexts.en;
  const cleanPrediction = sanitizeAIText(result.aiPrediction);
  const ms = result.lifeStageMilestones;

  return (
    <div
      id="palm-reading-pdf-container"
      style={{
        width: "794px",
        background: "#FFFDF7",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        color: "#451A03"
      }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: PALM ANATOMY, 5 MAJOR LINES, MOUNTS & SACRED YOGAS               */}
      {/* ========================================================================= */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          position: "relative",
          pageBreakAfter: "always",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "18px 20px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
              {header.top}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "4px 0" }}>
              {header.main}
            </h1>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700 }}>
              {header.page1Sub}
            </div>
          </div>

          {/* Devotee Info & Palm Photo Thumbnail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 170px", gap: "12px" }}>
            {/* Devotee Details Box */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", marginBottom: "3px" }}>
                {dLabels.title}
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                {devoteeDisplayName}
              </div>
              <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.5" }}>
                <div><strong>{dLabels.hand}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{handSideStr}</span></div>
                <div><strong>{code === "kn" ? "ಹಸ್ತ ತತ್ತ್ವ (Chironomy):" : "Hand Element:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>{result.chironomyHandType.element[code] || result.chironomyHandType.element.kn}</span></div>
                <div><strong>{code === "kn" ? "ಅಂಗುಷ್ಠ ಶಿವ ನೇತ್ರ (Yava):" : "Thumb Yava (Eye of Shiva):"}</strong> <span style={{ color: "#065F46", fontWeight: 800 }}>{result.thumbAnalysis.yavaSign[code] || result.thumbAnalysis.yavaSign.kn}</span></div>
                <div><strong>{code === "kn" ? "ಹಸ್ತ ರೇಖಾ ವಯಸ್ಸು:" : "Palm Chronological Age:"}</strong> <span style={{ color: "#78350F", fontWeight: 800 }}>~{ms?.estimatedAge || 28} {code === "kn" ? "ವರ್ಷಗಳು" : "Years"}</span> · <span style={{ color: "#B45309", fontWeight: 800 }}>Score: {result.overallScore}%</span></div>
              </div>
            </div>

            {/* Palm Photo Frame */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "6px", textAlign: "center" }}>
              {result.imageDataUrl ? (
                <img
                  src={result.imageDataUrl}
                  alt="Palm Image"
                  style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid #F59E0B" }}
                />
              ) : (
                <div style={{ height: "100px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#92400E" }}>
                  Palm Photo
                </div>
              )}
            </div>
          </div>

          {/* 5 Major Lines Detailed Matrix */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px 12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>✋ {code === "kn" ? "೧. ಪಂಚ ಪ್ರಧಾನ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Major Lines Micro-Topology):" : "1. Major Palm Lines Micro-Topology:"}</span>
              <span style={{ fontSize: "10px", background: "#FEF3C7", padding: "2px 6px", borderRadius: "4px", border: "1px solid #FDE68A" }}>Brihat Samhita</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#78350F" }}>
              <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong style={{ color: "#92400E" }}>{result.lifeLine.lineName[code] || result.lifeLine.lineName.kn}:</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>[{result.lifeLine.status[code] || result.lifeLine.status.kn}]</div>
                <div style={{ marginTop: "2px" }}>{result.lifeLine.indication[code] || result.lifeLine.indication.kn}</div>
              </div>
              <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong style={{ color: "#92400E" }}>{result.headLine.lineName[code] || result.headLine.lineName.kn}:</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>[{result.headLine.status[code] || result.headLine.status.kn}]</div>
                <div style={{ marginTop: "2px" }}>{result.headLine.indication[code] || result.headLine.indication.kn}</div>
              </div>
              <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong style={{ color: "#92400E" }}>{result.heartLine.lineName[code] || result.heartLine.lineName.kn}:</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>[{result.heartLine.status[code] || result.heartLine.status.kn}]</div>
                <div style={{ marginTop: "2px" }}>{result.heartLine.indication[code] || result.heartLine.indication.kn}</div>
              </div>
              <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <strong style={{ color: "#92400E" }}>{result.fateLine.lineName[code] || result.fateLine.lineName.kn}:</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>[{result.fateLine.status[code] || result.fateLine.status.kn}]</div>
                <div style={{ marginTop: "2px" }}>{result.fateLine.indication[code] || result.fateLine.indication.kn}</div>
              </div>
              <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A", gridColumn: "span 2" }}>
                <strong style={{ color: "#92400E" }}>{result.sunLine.lineName[code] || result.sunLine.lineName.kn}:</strong>
                <div style={{ color: "#065F46", fontWeight: 700 }}>[{result.sunLine.status[code] || result.sunLine.status.kn}]</div>
                <div style={{ marginTop: "2px" }}>{result.sunLine.indication[code] || result.sunLine.indication.kn}</div>
              </div>
            </div>
          </div>

          {/* Key Planetary Mounts & Auspicious Marks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Mounts */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px" }}>
                🪐 {code === "kn" ? "೨. ಸಪ್ತ ಗ್ರಹ ಪರ್ವತ ಶಕ್ತಿ:" : "2. Key Planetary Mounts:"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10.5px" }}>
                {result.mounts.slice(0, 3).map((m, idx) => (
                  <div key={idx} style={{ background: "#FFFBEB", padding: "4px 6px", borderRadius: "4px", border: "1px solid #FDE68A" }}>
                    <strong>{m.mountName[code] || m.mountName.kn}:</strong> <span style={{ color: "#065F46", fontWeight: 700 }}>[{m.strength[code] || m.strength.kn}]</span> - {m.indication[code] || m.indication.kn}
                  </div>
                ))}
              </div>
            </div>

            {/* Auspicious Marks */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px" }}>
                🌟 {code === "kn" ? "೩. ಅಪರೂಪದ ಶುಭ ಚಿಹ್ನೆಗಳು & ಯೋಗ:" : "3. Sacred Marks & Yogas:"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10.5px" }}>
                {result.specialMarks.slice(0, 3).map((sm, idx) => (
                  <div key={idx} style={{ background: "#FFFBEB", padding: "4px 6px", borderRadius: "4px", border: "1px solid #FDE68A" }}>
                    <strong style={{ color: "#92400E" }}>{sm.mark[code] || sm.mark.kn}:</strong> {sm.meaning[code] || sm.meaning.kn}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Natal Kundali Sync Badge if attached */}
          {result.kundliData && (
            <div style={{ background: "linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#78350F" }}>
              <strong style={{ color: "#B45309" }}>🔮 {code === "kn" ? "ಜನನ ಕುಂಡಲಿ ಸಮನ್ವಯ (Janma Kundali Sync):" : "Janma Kundali Sync:"}</strong>{" "}
              <span>{code === "kn" ? "ಲಗ್ನ:" : "Lagna:"} <b>{result.kundliData.lagna}</b> · {code === "kn" ? "ರಾಶಿ:" : "Rashi:"} <b>{result.kundliData.rashi}</b> · {code === "kn" ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} <b>{result.kundliData.nakshatra}</b> · {code === "kn" ? "ಮಾಂದಿ:" : "Maandi:"} <b>{result.kundliData.maandi}</b></span>
            </div>
          )}

          {/* Page 1 Footer */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "8px 12px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7" }}>
              {fTexts.top}
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 800 }}>
              {code === "kn" ? "ಪುಟ ೧ / ೨" : "Page 1 of 2"}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: LIFE MILESTONES, PREDICTIONS, REMEDIES & PRIEST BLESSING          */}
      {/* ========================================================================= */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          position: "relative",
          background: "#FFFDF7"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "3px solid #D97706",
            borderRadius: "12px",
            padding: "18px 20px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", letterSpacing: "1px" }}>
              {header.top}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#78350F", margin: "4px 0" }}>
              {result.verdictTitle[code] || result.verdictTitle.kn}
            </h1>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700 }}>
              {header.page2Sub}
            </div>
          </div>

          {/* 4 Life Stage Milestones */}
          {ms && (
            <div style={{ background: "#FFFFFF", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "10px 12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", alignItems: "center", justifyItems: "space-between" }}>
                <span>⏳ {code === "kn" ? "೪. ವಯೋಮಾನ ಆಧಾರಿತ ಜೀವನ ಘಟನಾವಳಿ (Life Milestones):" : "4. Age-Stratified Life Stage Milestones:"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#78350F" }}>
                <div style={{ background: "#F0F9FF", padding: "6px 8px", borderRadius: "6px", border: "1px solid #BAE6FD" }}>
                  <strong style={{ color: "#0369A1" }}>🎓 {code === "kn" ? "ವಿದ್ಯಾಭ್ಯಾಸ & ಜ್ಞಾನಾರ್ಜನೆ:" : "Education & Intellect:"}</strong>
                  <div style={{ fontWeight: 600 }}>{code === "kn" ? ms.education.recommendedFieldsKn : ms.education.recommendedFieldsEn}</div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FECDD3" }}>
                  <strong style={{ color: "#BE123C" }}>💍 {code === "kn" ? "ವಿವಾಹ & ದಾಂಪತ್ಯ ಯೋಗ:" : "Marriage Timing Window:"}</strong>
                  <div style={{ fontWeight: 600 }}>{code === "kn" ? ms.marriage.timingAgeWindowKn : ms.marriage.timingAgeWindowEn} ({code === "kn" ? ms.marriage.spouseTraitKn : ms.marriage.spouseTraitEn})</div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "6px 8px", borderRadius: "6px", border: "1px solid #A7F3D0" }}>
                  <strong style={{ color: "#047857" }}>👶 {code === "kn" ? "ಸಂತಾನ & ಕೌಟುಂಬಿಕ ಭಾಗ್ಯ:" : "Children & Family Blessing:"}</strong>
                  <div style={{ fontWeight: 600 }}>{code === "kn" ? ms.children.prospectsKn : ms.children.prospectsEn}</div>
                </div>
                <div style={{ background: "#FFFBEB", padding: "6px 8px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                  <strong style={{ color: "#B45309" }}>💰 {code === "kn" ? "ಸರ್ವೋಚ್ಚ ಧನ ಸಂಪಾದನೆ ಕಾಲ:" : "Peak Wealth Earning Ages:"}</strong>
                  <div style={{ fontWeight: 600 }}>{code === "kn" ? ms.careerWealth.peakWealthAgeKn : ms.careerWealth.peakWealthAgeEn}</div>
                </div>
              </div>
            </div>
          )}

          {/* Full Detailed Hastarekha Bhavishya Text */}
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #F59E0B",
              borderRadius: "10px",
              padding: "14px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 6px rgba(180,83,9,0.05)"
            }}
          >
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", borderBottom: "1.5px solid #FEF3C7", paddingBottom: "4px", marginBottom: "8px" }}>
                📜 {code === "kn" ? "೫. ಸಮಗ್ರ ಹಸ್ತ ರೇಖಾ ಭವಿಷ್ಯ ಫಲ (Comprehensive Hastarekha Prediction):" : "5. Comprehensive Hastarekha Prediction:"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#451A03",
                  lineHeight: "1.65",
                  whiteSpace: "pre-wrap"
                }}
              >
                {cleanPrediction}
              </div>
            </div>

            {/* Sacred Remedy Card */}
            <div style={{ marginTop: "10px", background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)", padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #FCD34D", fontSize: "11px", color: "#78350F" }}>
              <strong style={{ color: "#92400E" }}>🪔 {code === "kn" ? "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಪರಿಹಾರ & ಮಂತ್ರ:" : "6. Sacred Gokarna Kshetra Remedy & Mantra:"}</strong>{" "}
              <div style={{ fontWeight: 600, marginTop: "2px" }}>{result.remedyRecommendation[code] || result.remedyRecommendation.kn}</div>
            </div>
          </div>

          {/* Priest Signature & Contact Block */}
          <div
            style={{
              background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "8px",
              padding: "8px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FEF3C7" }}>
                {fTexts.priest}
              </div>
              <div style={{ fontSize: "10px", color: "#FDE68A", marginTop: "1px" }}>
                {code === "kn" ? "॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ ಆಶೀರ್ವಾದ ಸದಾ ಇರಲಿ ॥" : "॥ May Gokarna Mahabaleshwara Bestow Eternal Grace ॥"}
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "#FEF3C7", fontWeight: 800 }}>
              {code === "kn" ? "ಪುಟ ೨ / ೨" : "Page 2 of 2"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
