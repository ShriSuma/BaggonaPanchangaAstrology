import React from "react";
import type { KundliRemedyDiagnosis, SupportedLanguage } from "../../features/remedies/kundliRemedyEngine";

export type KundliRemedyPdfTemplateProps = {
  diagnosis: KundliRemedyDiagnosis;
  lang?: string;
};

export const KundliRemedyPdfTemplate: React.FC<KundliRemedyPdfTemplateProps> = ({
  diagnosis,
  lang = "kn"
}) => {
  const code = (lang || "kn").slice(0, 2) as SupportedLanguage;
  const isKn = code === "kn";

  const {
    devoteeName,
    birthDate,
    birthTime,
    gotra,
    lagnaName,
    rashiName,
    nakshatraName,
    primaryStruggle,
    afflictionFactors,
    psychologicalProfile,
    instantCalmingProtocol,
    dailyPacificationRoutine,
    personalizedStotras,
    dashaBhuktiAnalysis,
    gocharaTransitAnalysis,
    gokarnaTempleRemedies,
    chiefPriestBlessing
  } = diagnosis;

  const stotra = personalizedStotras[0] || personalizedStotras[1];

  const getShlokaByLang = (st: typeof stotra) => {
    if (!st) return "";
    if (code === "te") return st.shlokaTelugu;
    if (code === "ta") return st.shlokaTamil;
    if (code === "hi") return st.shlokaHindi;
    if (code === "en") return st.shlokaSanskrit;
    return st.shlokaKannada;
  };

  const getBeejaMantraByLang = (bm: typeof instantCalmingProtocol.emergencyBeejaMantra) => {
    if (code === "te") return bm.telugu;
    if (code === "ta") return bm.tamil;
    if (code === "hi") return bm.hindi;
    if (code === "en") return bm.sanskrit;
    return bm.kannada;
  };

  return (
    <div
      id="kundli-remedy-pdf-container"
      style={{
        width: "794px",
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF7",
        fontFamily: "'Noto Serif Kannada', 'Tiro Kannada', 'Kaveri', 'Segoe UI', serif, sans-serif",
        color: "#261605"
      }}
    >
      {/* ====================================================================== */}
      {/* PAGE 1: ASTROLOGICAL DIAGNOSIS & ANGER/STRESS PACIFICATION PROTOCOL    */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          pageBreakAfter: "always"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            border: "3px double #B45309",
            outline: "1px solid #F59E0B",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "8px 14px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
            </div>
            <div style={{ fontSize: "15px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {isKn
                ? "ಜನ್ಮ ಕುಂಡಲಿ ಆಧಾರಿತ ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ & ಮನಃಶಾಂತಿ ವರದಿ"
                : "Personalized Kundali Astrological Remedy & Pacification Report"}
            </div>
            <div style={{ fontSize: "9px", color: "#FEF08A", marginTop: "1px", fontStyle: "italic" }}>
              ॥ ಶಾಂತಾಕಾರಂ ಭುಜಗಶಯನಂ ಪದ್ಮನಾಭಂ ಸುರೇಶಂ । ಚಂದ್ರಶೇಖರಂ ಪ್ರಣಮಾಮಿ ಸರ್ವ ಶಾಂತಿ ಪ್ರದಾಯಕಮ್ ॥
            </div>
          </div>

          {/* Devotee Info Matrix */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
              gap: "6px",
              fontSize: "10.5px"
            }}
          >
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>👤 {isKn ? "ಜಾತಕರು:" : "Devotee:"}</span>{" "}
              <span style={{ color: "#451A03", fontWeight: 900 }}>{devoteeName}</span>
              {gotra && <span style={{ color: "#92400E", fontSize: "9.5px", display: "block" }}>({gotra} ಗೋತ್ರ)</span>}
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🏛️ {isKn ? "ಲಗ್ನ:" : "Lagna:"}</span>{" "}
              <span style={{ color: "#065F46", fontWeight: 900 }}>{lagnaName[code] || lagnaName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"}</span>{" "}
              <span style={{ color: "#92400E", fontWeight: 900 }}>{rashiName[code] || rashiName.kn}</span>
            </div>
            <div>
              <span style={{ color: "#78350F", fontWeight: 800 }}>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</span>{" "}
              <span style={{ color: "#1E3A8A", fontWeight: 900 }}>{nakshatraName[code] || nakshatraName.kn}</span>
            </div>
          </div>

          {/* Section 1: Astrological Diagnosis & Struggle Identification */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1px solid #FDE68A",
                paddingBottom: "4px",
                marginBottom: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>🔍 {isKn ? "೧. ಕುಂಡಲಿ ಗ್ರಹದೋಷ ವಿಶ್ಲೇಷಣೆ & ಮುಖ್ಯ ಸವಾಲು (Root Cause Analysis)" : "1. Kundali Root Cause & Struggle Diagnosis"}</span>
              <span
                style={{
                  background: primaryStruggle.intensity === "High" ? "#FEE2E2" : "#FEF3C7",
                  color: primaryStruggle.intensity === "High" ? "#991B1B" : "#92400E",
                  border: `1px solid ${primaryStruggle.intensity === "High" ? "#F87171" : "#FBBF24"}`,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "9px",
                  fontWeight: 800
                }}
              >
                {primaryStruggle.intensity} Intensity
              </span>
            </div>

            <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: 1.4, fontWeight: 700 }}>
              <span style={{ color: "#991B1B" }}>• {primaryStruggle.title[code] || primaryStruggle.title.kn}:</span>{" "}
              <span style={{ color: "#27272A", fontWeight: 500 }}>{primaryStruggle.description[code] || primaryStruggle.description.kn}</span>
            </div>

            {/* Affliction Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
              {afflictionFactors.slice(0, 2).map((af, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFBEB",
                    border: "1px solid #FCD34D",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    fontSize: "9.5px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E" }}>🔥 {af.title[code] || af.title.kn}</div>
                  <div style={{ color: "#451A03", marginTop: "2px", lineHeight: 1.3 }}>{af.reason[code] || af.reason.kn}</div>
                </div>
              ))}
            </div>

            {/* Psychological & Temperament Meters */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "6px",
                marginTop: "6px",
                paddingTop: "4px",
                borderTop: "1px dashed #E5E7EB",
                textAlign: "center",
                fontSize: "9px"
              }}
            >
              <div style={{ background: "#FEF2F2", padding: "4px", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ color: "#991B1B", fontWeight: 800 }}>{isKn ? "ಕ್ರೋಧ / ಪಿತ್ತ ಶಕ್ತಿ" : "Pitta / Anger"}</div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#B91C1C" }}>{psychologicalProfile.krodhaLevel}%</div>
              </div>
              <div style={{ background: "#F0FDF4", padding: "4px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ color: "#166534", fontWeight: 800 }}>{isKn ? "ಮನೋ ಶಾಂತಿ" : "Mental Stability"}</div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#15803D" }}>{psychologicalProfile.manasStability}%</div>
              </div>
              <div style={{ background: "#EFF6FF", padding: "4px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ color: "#1E40AF", fontWeight: 800 }}>{isKn ? "ತೇಜಸ್ಸು / ಪ್ರಾಣಬಲ" : "Vitality / Prana"}</div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#1D4ED8" }}>{psychologicalProfile.vitalityScore}%</div>
              </div>
              <div style={{ background: "#FAF5FF", padding: "4px", borderRadius: "6px", border: "1px solid #E9D5FF" }}>
                <div style={{ color: "#6B21A8", fontWeight: 800 }}>{isKn ? "ತಾಳ್ಮೆ / ಧೃತಿ" : "Patience Index"}</div>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#7E22CE" }}>{psychologicalProfile.patienceIndex}%</div>
              </div>
            </div>
          </div>

          {/* Section 2: 4-Step Instant Anger Calming Protocol */}
          <div
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border: "2px solid #D97706",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#92400E",
                borderBottom: "1.5px solid #F59E0B",
                paddingBottom: "3px",
                marginBottom: "6px"
              }}
            >
              {instantCalmingProtocol.title[code] || instantCalmingProtocol.title.kn}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {instantCalmingProtocol.steps.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #FCD34D",
                    borderRadius: "6px",
                    padding: "5px 8px",
                    fontSize: "9px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E", display: "flex", justifyContent: "space-between" }}>
                    <span>{st.icon} {st.name[code] || st.name.kn}</span>
                    <span style={{ color: "#D97706", fontWeight: 700 }}>{st.duration}</span>
                  </div>
                  <div style={{ color: "#1F2937", fontWeight: 600, marginTop: "2px", lineHeight: 1.3 }}>
                    {st.action[code] || st.action.kn}
                  </div>
                  <div style={{ color: "#4B5563", fontSize: "8.5px", marginTop: "1px", lineHeight: 1.25 }}>
                    {st.detail[code] || st.detail.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Beeja Japa Box */}
            <div
              style={{
                marginTop: "6px",
                background: "#451A03",
                borderRadius: "6px",
                padding: "6px 10px",
                color: "#FFFFFF",
                border: "1px solid #F59E0B",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "8.5px", fontWeight: 800, color: "#FDE68A", textTransform: "uppercase" }}>
                🕉️ {isKn ? "ಆಪತ್ಕಾಲೀನ ಶಾಂತಿ ಬೀಜ ಮಂತ್ರ (ಕೋಪ ಬಂದಾಗ ೧೧ ಬಾರಿ ಮನಸ್ಸಿನಲ್ಲೇ ಜಪಿಸಿ):" : "Emergency Mind Pacification Mantra (Chant 11 times in mind):"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 900, color: "#FEF08A", marginTop: "2px", letterSpacing: "0.5px" }}>
                {getBeejaMantraByLang(instantCalmingProtocol.emergencyBeejaMantra)}
              </div>
              <div style={{ fontSize: "8.5px", color: "#E5E7EB", marginTop: "1px", fontStyle: "italic" }}>
                "{instantCalmingProtocol.emergencyBeejaMantra.meaning[code] || instantCalmingProtocol.emergencyBeejaMantra.meaning.kn}"
              </div>
            </div>
          </div>

          {/* Section 3: Daily Morning & Evening Routine */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              borderRadius: "8px",
              padding: "7px 12px"
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1px solid #FDE68A",
                paddingBottom: "3px",
                marginBottom: "5px"
              }}
            >
              🗓️ {isKn ? "೩. ನಿತ್ಯ ಶಾಂತಿ ದಿನಚರಿ (Daily Morning & Evening Routine)" : "3. Daily Pacification & Equilibrium Routine"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", fontSize: "9px" }}>
              <div style={{ background: "#FEF3C7", padding: "5px 7px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🌅 {isKn ? "ಬೆಳಗ್ಗೆ (Morning)" : "Morning"}</div>
                <div style={{ fontWeight: 700, color: "#451A03", marginTop: "2px" }}>
                  {dailyPacificationRoutine.morning[0]?.title[code] || dailyPacificationRoutine.morning[0]?.title.kn}
                </div>
                <div style={{ color: "#6B7280", fontSize: "8.5px", marginTop: "1px", lineHeight: 1.25 }}>
                  {dailyPacificationRoutine.morning[0]?.desc[code] || dailyPacificationRoutine.morning[0]?.desc.kn}
                </div>
              </div>

              <div style={{ background: "#F3F4F6", padding: "5px 7px", borderRadius: "6px", border: "1px solid #E5E7EB" }}>
                <div style={{ fontWeight: 800, color: "#374151" }}>🥗 {isKn ? "ಮಧ್ಯಾಹ್ನ (Diet & Lifestyle)" : "Diet & Habits"}</div>
                <div style={{ fontWeight: 700, color: "#1F2937", marginTop: "2px" }}>
                  {dailyPacificationRoutine.afternoonLifestyle[0]?.title[code] || dailyPacificationRoutine.afternoonLifestyle[0]?.title.kn}
                </div>
                <div style={{ color: "#6B7280", fontSize: "8.5px", marginTop: "1px", lineHeight: 1.25 }}>
                  {dailyPacificationRoutine.afternoonLifestyle[0]?.desc[code] || dailyPacificationRoutine.afternoonLifestyle[0]?.desc.kn}
                </div>
              </div>

              <div style={{ background: "#EEF2FF", padding: "5px 7px", borderRadius: "6px", border: "1px solid #C7D2FE" }}>
                <div style={{ fontWeight: 800, color: "#3730A3" }}>🪔 {isKn ? "ಸಂಜೆ (Evening Deepa)" : "Evening Deepa"}</div>
                <div style={{ fontWeight: 700, color: "#1E1B4B", marginTop: "2px" }}>
                  {dailyPacificationRoutine.evening[0]?.title[code] || dailyPacificationRoutine.evening[0]?.title.kn}
                </div>
                <div style={{ color: "#6B7280", fontSize: "8.5px", marginTop: "1px", lineHeight: 1.25 }}>
                  {dailyPacificationRoutine.evening[0]?.desc[code] || dailyPacificationRoutine.evening[0]?.desc.kn}
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1.5px solid #F59E0B",
              paddingTop: "4px",
              fontSize: "9px",
              color: "#78350F",
              fontWeight: 700
            }}
          >
            <span>🕉️ {chiefPriestBlessing.templeSealText[code] || chiefPriestBlessing.templeSealText.kn}</span>
            <span>{isKn ? "ಪುಟ ೧ / ೨ (ಮುಂದುವರಿದಿದೆ...)" : "Page 1 of 2 (Continued...)"}</span>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* PAGE 2: GOCHARA / DASHA SHANTI, STOTRA, TEMPLE SEVA & PRIEST ASHIRVADA */}
      {/* ====================================================================== */}
      <div
        className="pdf-page"
        style={{
          width: "794px",
          height: "1123px",
          padding: "16px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "1091px",
            border: "3px double #B45309",
            outline: "1px solid #F59E0B",
            outlineOffset: "-6px",
            borderRadius: "14px",
            padding: "14px 16px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #FFFDF8 0%, #FEF9C3 35%, #FEF3C7 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              textAlign: "center",
              background: "linear-gradient(135deg, #451A03 0%, #78350F 50%, #451A03 100%)",
              borderRadius: "10px",
              padding: "7px 14px",
              color: "#FFFFFF",
              border: "2px solid #F59E0B",
              boxShadow: "0 3px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#FDE68A", letterSpacing: "1px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
            </div>
            <div style={{ fontSize: "14px", fontWeight: 900, color: "#FFFFFF", marginTop: "2px" }}>
              {isKn ? "ಗೋಚಾರ & ದಶಾ ಶಾಂತಿ, ನಿತ್ಯ ಸ್ತೋತ್ರ ಹಾಗೂ ದೈವಿಕ ಆಶೀರ್ವಾದ" : "Gochara & Dasha Shanti, Daily Stotra & Divine Blessing"}
            </div>
          </div>

          {/* Section 4: Gochara (Transit) & Running Dasha-Bhukti Analysis */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1px solid #FDE68A",
                paddingBottom: "3px",
                marginBottom: "6px",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>🪐 {isKn ? "೪. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ಶಾಂತಿ" : "4. Running Dasha-Bhukti & Planetary Transits (Gochara)"}</span>
              <span style={{ fontSize: "9.5px", color: "#92400E", fontWeight: 800 }}>
                {dashaBhuktiAnalysis.mahaDashaLabel[code] || dashaBhuktiAnalysis.mahaDashaLabel.kn} ಮಹಾದಶೆ / {dashaBhuktiAnalysis.bhuktiLabel[code] || dashaBhuktiAnalysis.bhuktiLabel.kn} ಭುಕ್ತಿ
              </span>
            </div>

            <div style={{ fontSize: "10px", color: "#374151", lineHeight: 1.35, fontWeight: 500 }}>
              {dashaBhuktiAnalysis.periodEffect[code] || dashaBhuktiAnalysis.periodEffect.kn}
            </div>

            {/* Gochara Transits Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
              {gocharaTransitAnalysis.transitHighlights.map((th, idx) => (
                <div
                  key={idx}
                  style={{
                    background: th.effect === "Challenging" ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${th.effect === "Challenging" ? "#FECACA" : "#BBF7D0"}`,
                    borderRadius: "6px",
                    padding: "5px 8px",
                    fontSize: "9px"
                  }}
                >
                  <div style={{ fontWeight: 800, color: th.effect === "Challenging" ? "#991B1B" : "#166534" }}>
                    {th.title[code] || th.title.kn}
                  </div>
                  <div style={{ color: "#374151", marginTop: "2px", lineHeight: 1.25 }}>
                    {th.description[code] || th.description.kn}
                  </div>
                  <div style={{ color: "#92400E", fontWeight: 700, marginTop: "2px" }}>
                    💡 {isKn ? "ಪರಿಹಾರ:" : "Remedy:"} {th.remedy[code] || th.remedy.kn}
                  </div>
                </div>
              ))}
            </div>

            {/* Sade Sati Status Alert */}
            <div
              style={{
                marginTop: "6px",
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "9.5px",
                color: "#78350F",
                fontWeight: 700
              }}
            >
              {gocharaTransitAnalysis.sadeSatiStatus[code] || gocharaTransitAnalysis.sadeSatiStatus.kn}
            </div>
          </div>

          {/* Section 5: Personalized Daily Stotra */}
          {stotra && (
            <div
              style={{
                background: "linear-gradient(135deg, #FFFDF8 0%, #FEF3C7 100%)",
                border: "2px solid #D97706",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.06)"
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  color: "#92400E",
                  borderBottom: "1.5px solid #F59E0B",
                  paddingBottom: "3px",
                  marginBottom: "5px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>📜 {isKn ? "೫. ಜಾತಕಕ್ಕೆ ವಿಶೇಷವಾಗಿ ನಿಗದಿಪಡಿಸಿದ ನಿತ್ಯ ಸ್ತೋತ್ರ" : "5. Recommended Daily Classical Stotra"}</span>
                <span style={{ fontSize: "9px", background: "#78350F", color: "#FFFFFF", padding: "1px 6px", borderRadius: "8px" }}>
                  {stotra.recitationCount}
                </span>
              </div>

              <div style={{ fontSize: "11px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                {stotra.title[code] || stotra.title.kn} ({isKn ? "ದೇವತೆ:" : "Deity:"} {stotra.dedicatedTo[code] || stotra.dedicatedTo.kn})
              </div>

              {/* Sacred Verse in Native Script */}
              <div
                style={{
                  background: "#451A03",
                  color: "#FEF08A",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "10px",
                  fontWeight: 800,
                  lineHeight: 1.45,
                  textAlign: "center",
                  whiteSpace: "pre-line",
                  border: "1px solid #F59E0B"
                }}
              >
                {getShlokaByLang(stotra)}
              </div>

              <div style={{ fontSize: "9px", color: "#374151", marginTop: "4px", lineHeight: 1.3 }}>
                <span style={{ fontWeight: 800, color: "#92400E" }}>✨ {isKn ? "ಫಲಶ್ರುತಿ & ನಿಯಮ:" : "Benefits & Rules:"}</span>{" "}
                {stotra.spiritualBenefits[code] || stotra.spiritualBenefits.kn} ·{" "}
                <span style={{ fontWeight: 700 }}>{isKn ? "ಸಮಯ:" : "Time:"}</span> {stotra.bestTimeToRecite[code] || stotra.bestTimeToRecite.kn} ·{" "}
                <span style={{ fontWeight: 700 }}>{isKn ? "ದಿಕ್ಕು:" : "Direction:"}</span> {stotra.facingDirection[code] || stotra.facingDirection.kn}
              </div>
            </div>
          )}

          {/* Section 6: Gokarna Temple Sevas & Sacred Items */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              borderRadius: "8px",
              padding: "8px 12px"
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 900,
                color: "#78350F",
                borderBottom: "1px solid #FDE68A",
                paddingBottom: "3px",
                marginBottom: "5px"
              }}
            >
              🪔 {isKn ? "೬. ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ದೈವಿಕ ಸೇವೆಗಳು & ಧರ್ಮೋಪಾಯ" : "6. Sacred Gokarna Mahabaleshwara Sevas & Remedy Items"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "9px" }}>
              <div style={{ background: "#FEF3C7", padding: "5px 8px", borderRadius: "6px", border: "1px solid #FCD34D" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>🕉️ {isKn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಸೇವೆ:" : "Prescribed Temple Seva:"}</div>
                <div style={{ fontWeight: 800, color: "#451A03", marginTop: "1px" }}>
                  {gokarnaTempleRemedies.prescribedSeva.name[code] || gokarnaTempleRemedies.prescribedSeva.name.kn}
                </div>
                <div style={{ color: "#374151", marginTop: "1px", fontSize: "8.5px", lineHeight: 1.25 }}>
                  {gokarnaTempleRemedies.prescribedSeva.significance[code] || gokarnaTempleRemedies.prescribedSeva.significance.kn}
                </div>
              </div>

              <div style={{ background: "#FFFBEB", padding: "5px 8px", borderRadius: "6px", border: "1px solid #FCD34D" }}>
                <div style={{ fontWeight: 800, color: "#92400E" }}>📿 {isKn ? "ರುದ್ರಾಕ್ಷಿ & ರತ್ನ ಧಾರಣೆ:" : "Rudraksha & Gemstone:"}</div>
                <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                  • ರುದ್ರಾಕ್ಷಿ: {gokarnaTempleRemedies.rudrakshaRecommendation.mukhi}
                </div>
                <div style={{ color: "#451A03", fontWeight: 700, marginTop: "1px" }}>
                  • ರತ್ನ: {gokarnaTempleRemedies.gemstoneRecommendation.stone[code] || gokarnaTempleRemedies.gemstoneRecommendation.stone.kn} ({gokarnaTempleRemedies.gemstoneRecommendation.metal[code] || gokarnaTempleRemedies.gemstoneRecommendation.metal.kn})
                </div>
                <div style={{ color: "#92400E", fontWeight: 700, marginTop: "1px" }}>
                  • ದಾನ: {gokarnaTempleRemedies.donationDaana.item[code] || gokarnaTempleRemedies.donationDaana.item.kn} ({gokarnaTempleRemedies.donationDaana.day[code] || gokarnaTempleRemedies.donationDaana.day.kn})
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Chief Priest Shreeram Pandit Blessing & Seal */}
          <div
            style={{
              background: "linear-gradient(135deg, #451A03 0%, #78350F 100%)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "#FFFFFF",
              border: "1.5px solid #F59E0B",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ maxWidth: "70%" }}>
              <div style={{ fontSize: "10.5px", fontWeight: 900, color: "#FDE68A" }}>
                🙏 {chiefPriestBlessing.priestName[code] || chiefPriestBlessing.priestName.kn}
              </div>
              <div style={{ fontSize: "8.5px", color: "#FEF08A" }}>
                {chiefPriestBlessing.priestTitle[code] || chiefPriestBlessing.priestTitle.kn} · {chiefPriestBlessing.phone}
              </div>
              <div style={{ fontSize: "9px", color: "#F3F4F6", marginTop: "2px", fontStyle: "italic", lineHeight: 1.3 }}>
                "{chiefPriestBlessing.ashirvadaMeaning[code] || chiefPriestBlessing.ashirvadaMeaning.kn}"
              </div>
            </div>

            {/* Official Temple Seal Stamp */}
            <div
              style={{
                border: "2px dashed #F59E0B",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(254, 243, 199, 0.1)",
                textAlign: "center",
                fontSize: "7px",
                fontWeight: 900,
                color: "#FDE68A",
                padding: "2px"
              }}
            >
              <span style={{ fontSize: "14px" }}>🕉️</span>
              <span>GOKARNA</span>
              <span>SEAL</span>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1.5px solid #F59E0B",
              paddingTop: "4px",
              fontSize: "9px",
              color: "#78350F",
              fontWeight: 700
            }}
          >
            <span>🕉️ {chiefPriestBlessing.templeSealText[code] || chiefPriestBlessing.templeSealText.kn}</span>
            <span>{isKn ? "ಪುಟ ೨ / ೨ (ಸಂಪೂರ್ಣ)" : "Page 2 of 2 (Complete)"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
