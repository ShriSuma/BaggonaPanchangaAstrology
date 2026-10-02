import React from "react";
import type { SpecialConsultationFullReport, SpecialConsultationLang } from "../../core/SpecialConsultationEngine";

export interface SpecialConsultationPdfTemplateProps {
  report: SpecialConsultationFullReport;
  lang: SpecialConsultationLang;
  selectedModules: {
    varshaphala: boolean;
    marriage: boolean;
    wealth: boolean;
    gemstone: boolean;
    health: boolean;
    qna: boolean;
  };
  priestName?: string;
  priestPhone?: string;
  qrDataUrl?: string;
}

export const SpecialConsultationPdfTemplate: React.FC<SpecialConsultationPdfTemplateProps> = ({
  report,
  lang,
  selectedModules,
  priestName = "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
  priestPhone = "+91 99723 39362",
  qrDataUrl
}) => {
  const isKn = lang === "kn";

  return (
    <div
      id="special-consultation-pdf-container"
      style={{
        width: "900px",
        display: "flex",
        flexDirection: "column",
        background: "#FFFDF9",
        color: "#23180D",
        fontFamily: "'Noto Serif Kannada', 'Tiro Devanagari Hindi', 'Tiro Telugu', 'Tiro Tamil', 'Noto Serif', serif, sans-serif"
      }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: HEADER + DEVOTEE & PANCHANGA + DIGNITY + 12-MONTH PREDICTIONS      */}
      {/* ========================================================================= */}
      {selectedModules.varshaphala && (
        <div
          className="pdf-page"
          style={{
            width: "900px",
            height: "1273px",
            minHeight: "1273px",
            maxHeight: "1273px",
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "32px 42px",
            background: "#FFFDF7",
            position: "relative",
            display: "block",
            pageBreakAfter: "always"
          }}
        >
          {/* Royal Outer Border Frame */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: "3px double #B45309",
              borderRadius: "16px",
              pointerEvents: "none"
            }}
          />

          {/* Header Banner */}
          <div style={{ textAlign: "center", marginBottom: "12px", borderBottom: "2px solid #F59E0B", paddingBottom: "10px" }}>
            <div style={{ fontSize: "14px", color: "#B45309", fontWeight: 700, letterSpacing: "1px" }}>
              {isKn ? "॥ ಶ್ರೀ ಶಾರದಾ ಪ್ರಸನ್ನ • ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ ॥" : "॥ SRI BAGGONA PANCHANGA ASTROLOGY COUNCIL ॥"}
            </div>
            <h1 style={{ fontSize: "22px", color: "#78350F", fontWeight: 800, margin: "4px 0 2px 0", lineHeight: 1.3 }}>
              {isKn ? "ವಿಶೇಷ ದೈವಿಕ ಸಮಾಲೋಚನೆ & ವಾರ್ಷಿಕ ಭವಿಷ್ಯ ಸಂಹಿತೆ" : "Special Divine Consultation & Annual Life Samhita"}
            </h1>
            <div style={{ fontSize: "12px", color: "#92400E", fontWeight: 600 }}>
              {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ • ಪ್ರಧಾನ ಅರ್ಚಕರು: " : "Gokarna Mahabaleshwara Kshetra • Chief Priest: "}
              {priestName} ({priestPhone})
            </div>
          </div>

          {/* Status Notice Banner (AI Verified or Fallback Notice) */}
          <div
            style={{
              background: report.aiNarration.isAiGenerated ? "#ECFDF5" : "#FFFBEB",
              border: `1.5px solid ${report.aiNarration.isAiGenerated ? "#10B981" : "#F59E0B"}`,
              borderRadius: "8px",
              padding: "7px 12px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: report.aiNarration.isAiGenerated ? "#065F46" : "#92400E"
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {report.aiNarration.isAiGenerated ? "✨ " : "⚠️ "}
              {isKn ? report.aiNarration.statusNoticeKn : report.aiNarration.statusNoticeEn}
            </span>
            <span style={{ fontSize: "10px", fontWeight: 600, color: report.aiNarration.isAiGenerated ? "#047857" : "#B45309" }}>
              {isKn ? "ಪರಾಶರೀ ಸಿದ್ಧಾಂತ ಪರಿಶೀಲಿತ" : "Parashari Shastric Verified"}
            </span>
          </div>

          {/* Devotee Natal & Complete Panchanga Information Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "10px",
              padding: "10px 16px",
              marginBottom: "12px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.08)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #D97706", paddingBottom: "6px", marginBottom: "6px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#92400E" }}>
                👤 {isKn ? "ಜಾತಕರ ಜನ್ಮ ವಿವರಗಳು" : "Devotee Natal Parameters"}: <span style={{ color: "#78350F" }}>{report.devoteeName}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 700 }}>
                {isKn ? "ಜನನ" : "DOB"}: {report.birthDate} ({report.birthTime})
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", fontSize: "12px", color: "#451A03" }}>
              <div><strong>{isKn ? "ಲಗ್ನ" : "Ascendant"}:</strong> {isKn ? report.lagnaNameKn : report.lagnaNameEn}</div>
              <div><strong>{isKn ? "ರಾಶಿ" : "Moon Sign"}:</strong> {isKn ? report.rashiNameKn : report.rashiNameEn}</div>
              <div><strong>{isKn ? "ನಕ್ಷತ್ರ" : "Nakshatra"}:</strong> {isKn ? report.nakshatraNameKn : report.nakshatraNameEn} ({isKn ? report.nakshatraLordKn : report.nakshatraLordEn})</div>
              <div><strong>{isKn ? "ದಶಾ ಪ್ರಭಾವ" : "Current Dasha"}:</strong> {isKn ? report.currentDashaKn : report.currentDashaEn}</div>
            </div>

            {/* Complete Panchanga Angas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", fontSize: "11px", color: "#78350F", marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #F59E0B" }}>
              <div><strong>{isKn ? "ಸಂವತ್ಸರ:" : "Samvat:"}</strong> {isKn ? report.panchanga.samvatsaraKn : report.panchanga.samvatsaraEn}</div>
              <div><strong>{isKn ? "ಮಾಸ-ಪಕ್ಷ:" : "Masa-Paksha:"}</strong> {isKn ? `${report.panchanga.masaKn} (${report.panchanga.pakshaKn})` : `${report.panchanga.masaEn} (${report.panchanga.pakshaEn})`}</div>
              <div><strong>{isKn ? "ತಿಥಿ-ವಾರ:" : "Tithi-Vara:"}</strong> {isKn ? `${report.panchanga.tithiKn}, ${report.panchanga.weekdayKn}` : `${report.panchanga.tithiEn}, ${report.panchanga.weekdayEn}`}</div>
              <div><strong>{isKn ? "ಯೋಗ-ಕರಣ:" : "Yoga-Karana:"}</strong> {isKn ? `${report.panchanga.yogaKn}, ${report.panchanga.karanaKn}` : `${report.panchanga.yogaEn}, ${report.panchanga.karanaEn}`}</div>
            </div>
          </div>

          {/* Planetary Dignity Strip */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #FDE68A",
              borderRadius: "8px",
              padding: "6px 12px",
              marginBottom: "12px",
              fontSize: "10.5px",
              color: "#78350F"
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: "4px", fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
              <span>🪐 {isKn ? "ನವಗ್ರಹ ಶಾಸ್ತ್ರೋಕ್ತ ಸ್ಥಾನ & ಉಚ್ಚ-ನೀಚ ಬಲ (Planetary Dignities):" : "Planetary Dignity & Strength Map:"}</span>
              <span style={{ fontSize: "10px", color: "#92400E" }}>{isKn ? "ಪರಾಶರ ಹೋರಾ ಶಾಸ್ತ್ರ" : "Brihat Parashara"}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {Object.values(report.planetaryDignities).slice(0, 7).map((d, i) => (
                <span
                  key={i}
                  style={{
                    background: d.dignity === "exalted" ? "#FEF3C7" : d.dignity === "debilitated" ? "#FEE2E2" : "#F3F4F6",
                    border: `1px solid ${d.dignity === "exalted" ? "#F59E0B" : d.dignity === "debilitated" ? "#EF4444" : "#D1D5DB"}`,
                    borderRadius: "4px",
                    padding: "2px 6px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: d.dignity === "debilitated" ? "#991B1B" : "#451A03"
                  }}
                >
                  <strong>{isKn ? d.nameKn : d.nameEn}:</strong> {isKn ? d.rashiKn : d.rashiEn} ({isKn ? d.dignityLabelKn : d.dignityLabelEn}{d.isCombust ? (isKn ? ", ಅಸ್ತ" : ", Combust") : ""})
                </span>
              ))}
            </div>
          </div>

          {/* AI Narrative Synthesis if present */}
          {report.aiNarration.varshaphalaNarrative && (
            <div
              style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #F59E0B",
                borderRadius: "8px",
                padding: "8px 12px",
                marginBottom: "12px",
                fontSize: "11px",
                lineHeight: 1.5,
                color: "#451A03"
              }}
            >
              <div style={{ fontWeight: 800, color: "#92400E", marginBottom: "3px", fontSize: "11.5px" }}>
                ✨ {isKn ? "ಪಂಡಿತರ ದೈವಿಕ ನಿರೂಪಣೆ & ಸಂದೇಶ" : "Priest Divine Astrological Guidance"}
              </div>
              <div style={{ whiteSpace: "pre-line" }}>
                {report.aiNarration.varshaphalaNarrative}
              </div>
            </div>
          )}

          {/* Module 1: 12-Month Month-by-Month Forecast */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
                🌟 {isKn ? "೧೨-ತಿಂಗಳ ಮಾಸಿಕ ಭವಿಷ್ಯ & ಕಾರ್ಯಸಿದ್ಧಿ ಪಥ" : "12-Month Predictive Timeline & Guidance"}
              </h2>
              <span style={{ fontSize: "11px", background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "8px", fontWeight: 700, border: "1px solid #F59E0B" }}>
                {report.twelveMonthForecast.yearRangeStr}
              </span>
            </div>

            <div style={{ fontSize: "11.5px", color: "#78350F", fontStyle: "italic", marginBottom: "10px" }}>
              {isKn ? report.twelveMonthForecast.yearlyThemeKn : report.twelveMonthForecast.yearlyThemeEn} • {isKn ? "ವರ್ಷಪತಿ: " : "Year Ruler: "} {isKn ? report.twelveMonthForecast.varshapathiPlanetKn : report.twelveMonthForecast.varshapathiPlanetEn} • {isKn ? "ಸಾಡೇಸಾತಿ: " : "Sade Sati: "} {isKn ? report.twelveMonthForecast.sadeSatiStatusKn : report.twelveMonthForecast.sadeSatiStatusEn}
            </div>

            {/* 12 Months Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
              {report.twelveMonthForecast.months.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid #FDE68A",
                    background: m.financialRating === "high" ? "#FEFCE8" : m.financialRating === "cautious" ? "#FFF7ED" : "#FFFFFF",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    borderLeft: `4px solid ${m.financialRating === "high" ? "#16A34A" : m.financialRating === "cautious" ? "#DC2626" : "#D97706"}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F" }}>
                      {idx + 1}. {isKn ? m.monthNameKn : m.monthNameEn} ({isKn ? m.solarMasaKn : m.solarMasaEn})
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: m.financialRating === "high" ? "#166534" : m.financialRating === "cautious" ? "#991B1B" : "#854D0E"
                      }}
                    >
                      {isKn ? m.financialRatingKn : m.financialRatingEn}
                    </span>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: 1.45, marginBottom: "3px" }}>
                    {isKn ? m.careerOutlookKn : m.careerOutlookEn}
                  </div>
                  <div style={{ fontSize: "10px", color: "#78350F", display: "flex", justifyContent: "space-between" }}>
                    <span><strong>{isKn ? "ಶುಭ ದಿನಗಳು" : "Auspicious"}:</strong> {m.auspiciousDates}</span>
                    <span><strong>{isKn ? "ಶಾಂತಿ" : "Remedy"}:</strong> {isKn ? m.monthlyRemedyKn : m.monthlyRemedyEn}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Page 1 Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              left: "44px",
              right: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #F59E0B",
              paddingTop: "8px",
              fontSize: "10.5px",
              color: "#92400E"
            }}
          >
            <div>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ಸಿದ್ಧಿ ॥</div>
            <div>{isKn ? "ಪುಟ ೧" : "Page 1"}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: MARRIAGE & RELATIONSHIP DESTINY + WEALTH-CAREER BLUEPRINT        */}
      {/* ========================================================================= */}
      {(selectedModules.marriage || selectedModules.wealth) && (
        <div
          className="pdf-page"
          style={{
            width: "900px",
            height: "1273px",
            minHeight: "1273px",
            maxHeight: "1273px",
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "32px 42px",
            background: "#FFFDF7",
            position: "relative",
            display: "block",
            pageBreakAfter: "always"
          }}
        >
          {/* Royal Outer Border Frame */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: "3px double #B45309",
              borderRadius: "16px",
              pointerEvents: "none"
            }}
          />

          {/* Mini Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#78350F" }}>
              ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಸಂಹಿತೆ • ವಿವಾಹ & ಧನಯೋಗ ನೀಲನಕ್ಷೆ ॥
            </span>
            <span style={{ fontSize: "11px", color: "#92400E", fontWeight: 700 }}>
              {report.devoteeName} ({report.birthDate})
            </span>
          </div>

          {/* Module 2: Marriage & Relationship Destiny */}
          {selectedModules.marriage && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "10px" }}>
                <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
                  {report.marriageDossier.isMinor
                    ? (isKn ? "👶 ಬಾಲ್ಯಾವಸ್ಥೆಯ ವಿದ್ಯಾಭ್ಯಾಸ, ಆರೋಗ್ಯ & ಭವಿಷ್ಯದ ಕಲ್ಯಾಣ" : "Childhood Learning, Health & Future Grace")
                    : report.marriageDossier.isMarried
                    ? (isKn ? "💍 ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಸಂಸಾರ ಸುಖ & ಸುಮಂಗಲೀ ಯೋಗ" : "Marital Bliss, Domestic Harmony & Spousal Longevity")
                    : (isKn ? "💍 ವಿವಾಹ ಯೋಗ, ಜೀವನ ಸಂಗಾತಿ & ದಾಂಪತ್ಯ ರಹಸ್ಯ" : "Marriage Destiny, Spouse Profile & Matrimonial Harmony")}
                </h2>
              </div>

              {/* AI Narrative if available */}
              {report.aiNarration.marriageNarrative && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #F59E0B",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "#451A03"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E", marginBottom: "2px", fontSize: "11.5px" }}>
                    ✨ {report.marriageDossier.isMinor
                        ? (isKn ? "ಪಂಡಿತರ AI ವಿದ್ಯಾಭ್ಯಾಸ & ಬಾಲ ಸಂಸ್ಕಾರ ನಿರೂಪಣೆ" : "Priest AI Childhood & Education Synthesis")
                        : report.marriageDossier.isMarried
                        ? (isKn ? "ಪಂಡಿತರ AI ದಾಂಪತ್ಯ ಸುಖ & ಸಾಮರಸ್ಯ ನಿರೂಪಣೆ" : "Priest AI Marital Harmony Synthesis")
                        : (isKn ? "ಪಂಡಿತರ AI ದೈವಿಕ ವಿವಾಹ ನಿರೂಪಣೆ" : "Priest AI Marriage Synthesis")}
                  </div>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {report.aiNarration.marriageNarrative}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "#FEFCE8",
                  border: "2px solid #F59E0B",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  marginBottom: "12px"
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#B45309", marginBottom: "4px" }}>
                  ✨ {isKn ? report.marriageDossier.verdictTitleKn : report.marriageDossier.verdictTitleEn}
                </div>
                <div style={{ fontSize: "12.5px", color: "#451A03", lineHeight: 1.55, marginBottom: "10px" }}>
                  <strong>
                    {report.marriageDossier.isMinor
                      ? (isKn ? "ಪ್ರಸ್ತುತ ಹಂತ & ಭವಿಷ್ಯದ ಕಾಲ" : "Current Life Phase & Timing Window")
                      : report.marriageDossier.isMarried
                      ? (isKn ? "ದಾಂಪತ್ಯ ಸ್ಥಿತಿ" : "Marital Status & Growth")
                      : (isKn ? "ಪ್ರಶಸ್ತ ವಿವಾಹ ಕಾಲ" : "Matrimonial Timing Window")}:
                  </strong>{" "}
                  {isKn ? report.marriageDossier.marriageWindowKn : report.marriageDossier.marriageWindowEn}
                </div>

                {/* Subcard (Minor Guidance / Married Harmony / Spouse Profile) */}
                <div style={{ background: "#FFFBEB", border: "1px dashed #D97706", borderRadius: "8px", padding: "10px 14px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>
                    {report.marriageDossier.isMinor
                      ? (isKn ? "👶 ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ, ಆಯುರಾರೋಗ್ಯ & ಸಂಸ್ಕಾರ ಮಾರ್ಗದರ್ಶನ" : "Childhood Education, Health & Moral Guidance")
                      : report.marriageDossier.isMarried
                      ? (isKn ? "🏡 ಸಂಸಾರ ಸಾಮರಸ್ಯ, ಪರಸ್ಪರ ಪ್ರೇಮ & ಕೌಟುಂಬಿಕ ಒಗ್ಗಟ್ಟು" : "Family Harmony, Spousal Alignment & Domestic Peace")
                      : (isKn ? "👰 ಭಾವಿ ಸಂಗಾತಿಯ ಗುಣಲಕ್ಷಣ & ಆಗಮನ ದಿಕ್ಕು" : "Spouse Temperament & Origin")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#451A03", lineHeight: 1.55 }}>
                    {report.marriageDossier.isMinor ? (
                      <>
                        <div><strong>{isKn ? "ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ:" : "Holistic Guidance:"}</strong> {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}</div>
                        <div><strong>{isKn ? "ವಿದ್ಯಾಭ್ಯಾಸ ಕ್ಷೇತ್ರ:" : "Academic Sphere:"}</strong> {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}</div>
                        <div><strong>{isKn ? "ಭವಿಷ್ಯದ ಸೂಚನೆ:" : "Future Indication:"}</strong> {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}</div>
                      </>
                    ) : report.marriageDossier.isMarried ? (
                      <>
                        <div><strong>{isKn ? "ದಾಂಪತ್ಯ ಗುಣ:" : "Marital Dynamics:"}</strong> {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}</div>
                        <div><strong>{isKn ? "ವೃತ್ತಿ & ಆರ್ಥಿಕತೆ:" : "Vocation & Stability:"}</strong> {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}</div>
                        <div><strong>{isKn ? "ಕೌಟುಂಬಿಕ ಹೊಂದಾಣಿಕೆ:" : "Family Alignment:"}</strong> {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}</div>
                      </>
                    ) : (
                      <>
                        <div><strong>{isKn ? "ಆಗಮನ ದಿಕ್ಕು:" : "Direction:"}</strong> {isKn ? report.marriageDossier.spouseProfile.directionKn : report.marriageDossier.spouseProfile.directionEn}</div>
                        <div><strong>{isKn ? "ವ್ಯಕ್ತಿತ್ವ:" : "Personality:"}</strong> {isKn ? report.marriageDossier.spouseProfile.natureKn : report.marriageDossier.spouseProfile.natureEn}</div>
                        <div><strong>{isKn ? "ವೃತ್ತಿ ಕ್ಷೇತ್ರ:" : "Vocation:"}</strong> {isKn ? report.marriageDossier.spouseProfile.professionDomainKn : report.marriageDossier.spouseProfile.professionDomainEn}</div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "12px", color: "#451A03", lineHeight: 1.55, marginBottom: "6px" }}>
                  <strong>{isKn ? "ಕುಜ ದೋಷ / ಗ್ರಹ ಸ್ಥಿತಿ" : "Mars & Planetary Analysis"}:</strong> {isKn ? report.marriageDossier.kujaDoshaStatusKn : report.marriageDossier.kujaDoshaStatusEn}
                </div>
                <div style={{ fontSize: "11.5px", color: "#78350F", background: "#FEF3C7", padding: "6px 10px", borderRadius: "6px", border: "1px solid #FDE68A" }}>
                  <strong>{isKn ? "ದೈವಿಕ ಪರಿಹಾರ" : "Remedy"}:</strong> {isKn ? report.marriageDossier.sacredRemedyKn : report.marriageDossier.sacredRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* Module 3: Wealth, Career & Debt Clearance */}
          {selectedModules.wealth && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "10px" }}>
                <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
                  💰 {isKn ? "ಧನ-ವೃತ್ತಿ ಯೋಗ & ಋಣಮುಕ್ತಿ ನೀಲನಕ್ಷೆ" : "Wealth, Career & Debt Clearance Blueprint"}
                </h2>
              </div>

              {/* AI Narrative if available */}
              {report.aiNarration.wealthNarrative && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                    border: "1.5px solid #10B981",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "#064E3B"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#065F46", marginBottom: "2px", fontSize: "11.5px" }}>
                    ✨ {isKn ? "ಪಂಡಿತರ AI ದೈವಿಕ ಧನ-ವೃತ್ತಿ ನಿರೂಪಣೆ" : "Priest AI Wealth & Career Synthesis"}
                  </div>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {report.aiNarration.wealthNarrative}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "#F0FDF4",
                  border: "2px solid #86EFAC",
                  borderRadius: "10px",
                  padding: "14px 18px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                    💼 {isKn ? report.wealthCareer.vocationTypeKn : report.wealthCareer.vocationTypeEn}
                  </span>
                  <span style={{ fontSize: "11px", background: "#DCFCE7", color: "#15803D", padding: "3px 8px", borderRadius: "8px", fontWeight: 800, border: "1px solid #86EFAC" }}>
                    {isKn ? "ಇಂದು ಲಗ್ನ ಸಂಪತ್ತು ಸೂಚ್ಯಂಕ" : "Indu Lagna Score"}: {report.wealthCareer.induLagnaProsperityScore}/100
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "#14532D", lineHeight: 1.55, marginBottom: "10px" }}>
                  {isKn ? report.wealthCareer.prosperityVerdictKn : report.wealthCareer.prosperityVerdictEn}
                </div>

                {/* Primary Wealth Yogas */}
                <div style={{ background: "#FFFFFF", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 14px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#166534", marginBottom: "4px" }}>
                    ✨ {isKn ? "ಜಾತಕದಲ್ಲಿನ ಪ್ರಧಾನ ಧನ-ಯೋಗಗಳು" : "Active Wealth Yogas"}:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11.5px", color: "#166534", lineHeight: 1.6 }}>
                    {(isKn ? report.wealthCareer.primaryWealthYogasKn : report.wealthCareer.primaryWealthYogasEn).map((y, i) => (
                      <li key={i}>{y}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ fontSize: "11.5px", color: "#14532D", marginBottom: "6px" }}>
                  <strong>{isKn ? "ಋಣಮುಕ್ತಿ ಕಾಲಮಿತಿ (Debt Clearance)" : "Debt Resolution Timeline"}:</strong> {isKn ? report.wealthCareer.debtClearanceTimelineKn : report.wealthCareer.debtClearanceTimelineEn}
                </div>
                <div style={{ fontSize: "11.5px", color: "#166534", background: "#DCFCE7", padding: "6px 10px", borderRadius: "6px", border: "1px solid #86EFAC" }}>
                  <strong>{isKn ? "ಧನ-ವೃದ್ಧಿ ಪರಿಹಾರ" : "Prosperity Seva"}:</strong> {isKn ? report.wealthCareer.wealthRemedyKn : report.wealthCareer.wealthRemedyEn}
                </div>
              </div>
            </div>
          )}

          {/* Page 2 Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              left: "44px",
              right: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #F59E0B",
              paddingTop: "8px",
              fontSize: "10.5px",
              color: "#92400E"
            }}
          >
            <div>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ವಿವಾಹ & ಧನ ಸಮೃದ್ಧಿ ರಕ್ಷಾ ಕವಚ ॥</div>
            <div>{isKn ? "ಪುಟ ೨" : "Page 2"}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: SACRED GEMSTONE, RUDRAKSHA & AYUR SANJEEVINI HEALTH             */}
      {/* ========================================================================= */}
      {(selectedModules.gemstone || selectedModules.health) && (
        <div
          className="pdf-page"
          style={{
            width: "900px",
            height: "1273px",
            minHeight: "1273px",
            maxHeight: "1273px",
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "32px 42px",
            background: "#FFFDF7",
            position: "relative",
            display: "block",
            pageBreakAfter: "always"
          }}
        >
          {/* Royal Outer Border Frame */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: "3px double #B45309",
              borderRadius: "16px",
              pointerEvents: "none"
            }}
          />

          {/* Mini Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#78350F" }}>
              ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಸಂಹಿತೆ • ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಆಯುರ್ವೇದ ॥
            </span>
            <span style={{ fontSize: "11px", color: "#92400E", fontWeight: 700 }}>
              {report.devoteeName} ({report.birthDate})
            </span>
          </div>

          {/* Module 4: Sacred Gemstone, Rudraksha & Yantra */}
          {selectedModules.gemstone && (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "10px" }}>
                <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
                  💎 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ & ಯಂತ್ರ ನಿರ್ದೇಶನ" : "Sacred Gemstone, Rudraksha & Yantra Prescription"}
                </h2>
              </div>

              {/* AI Narrative if available */}
              {report.aiNarration.gemstoneNarrative && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #F59E0B",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "#451A03"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#92400E", marginBottom: "2px", fontSize: "11.5px" }}>
                    ✨ {isKn ? "ಪಂಡಿತರ AI ರತ್ನ-ರುದ್ರಾಕ್ಷಿ ಶಾಸ್ತ್ರೋಕ್ತ ವಿವೇಚನೆ" : "Priest AI Gemstone & Rudraksha Synthesis"}
                  </div>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {report.aiNarration.gemstoneNarrative}
                  </div>
                </div>
              )}

              {/* 2 Gemstones Grid: Life Gem & Fortune Gem */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "10px" }}>
                {/* Life Gem */}
                <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#B45309" }}>
                      ⭐ {isKn ? report.gemstoneRudraksha.lifeGem.gemTypeKn : report.gemstoneRudraksha.lifeGem.gemTypeEn}
                    </span>
                    <span style={{ fontSize: "10px", background: "#FEF3C7", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, color: "#92400E" }}>
                      {isKn ? report.gemstoneRudraksha.lifeGem.planetaryDignityKn : report.gemstoneRudraksha.lifeGem.planetaryDignityEn}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                    {isKn ? report.gemstoneRudraksha.lifeGem.nameKn : report.gemstoneRudraksha.lifeGem.nameEn}
                  </div>
                  <div style={{ fontSize: "11px", color: "#451A03", lineHeight: 1.55 }}>
                    <div><strong>{isKn ? "ತೂಕ" : "Weight"}:</strong> {report.gemstoneRudraksha.lifeGem.recommendedWeight}</div>
                    <div><strong>{isKn ? "ಲೋಹ & ಬೆರಳು" : "Metal & Finger"}:</strong> {isKn ? `${report.gemstoneRudraksha.lifeGem.suitableMetalKn} (${report.gemstoneRudraksha.lifeGem.wearingFingerKn})` : `${report.gemstoneRudraksha.lifeGem.suitableMetalEn} (${report.gemstoneRudraksha.lifeGem.wearingFingerEn})`}</div>
                    <div><strong>{isKn ? "ವಾರ & ತಾರಾಬಲ" : "Day & Tara"}:</strong> {isKn ? `${report.gemstoneRudraksha.lifeGem.auspiciousDayKn}, ${report.gemstoneRudraksha.lifeGem.consecrationTaraKn}` : `${report.gemstoneRudraksha.lifeGem.auspiciousDayEn}, ${report.gemstoneRudraksha.lifeGem.consecrationTaraEn}`}</div>
                    <div style={{ marginTop: "3px", color: "#92400E", fontStyle: "italic", fontSize: "10.5px" }}><strong>{isKn ? "ಮಂತ್ರ" : "Mantra"}:</strong> {isKn ? report.gemstoneRudraksha.lifeGem.mantraKn : report.gemstoneRudraksha.lifeGem.mantraEn}</div>
                  </div>
                </div>

                {/* Fortune Gem */}
                <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#B45309" }}>
                      ✨ {isKn ? report.gemstoneRudraksha.fortuneGem.gemTypeKn : report.gemstoneRudraksha.fortuneGem.gemTypeEn}
                    </span>
                    <span style={{ fontSize: "10px", background: "#FEF3C7", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, color: "#92400E" }}>
                      {isKn ? report.gemstoneRudraksha.fortuneGem.planetaryDignityKn : report.gemstoneRudraksha.fortuneGem.planetaryDignityEn}
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
                    {isKn ? report.gemstoneRudraksha.fortuneGem.nameKn : report.gemstoneRudraksha.fortuneGem.nameEn}
                  </div>
                  <div style={{ fontSize: "11px", color: "#451A03", lineHeight: 1.55 }}>
                    <div><strong>{isKn ? "ತೂಕ" : "Weight"}:</strong> {report.gemstoneRudraksha.fortuneGem.recommendedWeight}</div>
                    <div><strong>{isKn ? "ಲೋಹ & ಬೆರಳು" : "Metal & Finger"}:</strong> {isKn ? `${report.gemstoneRudraksha.fortuneGem.suitableMetalKn} (${report.gemstoneRudraksha.fortuneGem.wearingFingerKn})` : `${report.gemstoneRudraksha.fortuneGem.suitableMetalEn} (${report.gemstoneRudraksha.fortuneGem.wearingFingerEn})`}</div>
                    <div><strong>{isKn ? "ವಾರ & ತಾರಾಬಲ" : "Day & Tara"}:</strong> {isKn ? `${report.gemstoneRudraksha.fortuneGem.auspiciousDayKn}, ${report.gemstoneRudraksha.fortuneGem.consecrationTaraKn}` : `${report.gemstoneRudraksha.fortuneGem.auspiciousDayEn}, ${report.gemstoneRudraksha.fortuneGem.consecrationTaraEn}`}</div>
                    <div style={{ marginTop: "3px", color: "#92400E", fontStyle: "italic", fontSize: "10.5px" }}><strong>{isKn ? "ಮಂತ್ರ" : "Mantra"}:</strong> {isKn ? report.gemstoneRudraksha.fortuneGem.mantraKn : report.gemstoneRudraksha.fortuneGem.mantraEn}</div>
                  </div>
                </div>
              </div>

              {/* Prohibited Gemstones Warning Card */}
              <div style={{ background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", fontSize: "11px", color: "#991B1B" }}>
                <strong>⚠️ {isKn ? "ವರ್ಜ್ಯ ರತ್ನ ಎಚ್ಚರಿಕೆ (Strictly Avoid)" : "Prohibited Gemstone Warning"}:</strong> {isKn ? report.gemstoneRudraksha.prohibitedGems.gemNamesKn : report.gemstoneRudraksha.prohibitedGems.gemNamesEn} - {isKn ? report.gemstoneRudraksha.prohibitedGems.reasonKn : report.gemstoneRudraksha.prohibitedGems.reasonEn}
              </div>

              {/* Rudraksha & Yantra Card */}
              <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: "8px", padding: "10px 14px", fontSize: "11.5px", color: "#4C1D95", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <strong>📿 {isKn ? "ಶಾಸ್ತ್ರೋಕ್ತ ರುದ್ರಾಕ್ಷಿ" : "Sacred Rudraksha"}:</strong> {isKn ? report.gemstoneRudraksha.prescribedRudraksha.mukhiKn : report.gemstoneRudraksha.prescribedRudraksha.mukhiEn} ({isKn ? report.gemstoneRudraksha.prescribedRudraksha.deityKn : report.gemstoneRudraksha.prescribedRudraksha.deityEn})
                  <div style={{ fontSize: "10.5px", color: "#6D28D9", marginTop: "2px" }}>{isKn ? report.gemstoneRudraksha.prescribedRudraksha.panchangaReasonKn : report.gemstoneRudraksha.prescribedRudraksha.panchangaReasonEn}</div>
                </div>
                <div>
                  <strong>🕉️ {isKn ? "ಪ್ರತಿಷ್ಠಾಪಿಸಬೇಕಾದ ಯಂತ್ರ" : "Consecrated Yantra"}:</strong> {isKn ? report.gemstoneRudraksha.prescribedYantra.nameKn : report.gemstoneRudraksha.prescribedYantra.nameEn}
                  <div style={{ fontSize: "10.5px", color: "#6D28D9", marginTop: "2px" }}>{isKn ? report.gemstoneRudraksha.prescribedYantra.installationPoojaKn : report.gemstoneRudraksha.prescribedYantra.installationPoojaEn}</div>
                </div>
              </div>
            </div>
          )}

          {/* Module 5: Ayur Sanjeevini Health Profile */}
          {selectedModules.health && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "10px" }}>
                <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
                  🌿 {isKn ? "ಆಯುರ್ ಸಂಜೀವಿನಿ ವೈದಿಕ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್" : "Ayur Sanjeevini Medical Astrology Profile"}
                </h2>
              </div>

              {/* AI Narrative if available */}
              {report.aiNarration.healthNarrative && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
                    border: "1.5px solid #10B981",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "10px",
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "#064E3B"
                  }}
                >
                  <div style={{ fontWeight: 800, color: "#065F46", marginBottom: "2px", fontSize: "11.5px" }}>
                    ✨ {isKn ? "ಪಂಡಿತರ AI ಆಯುರ್ ಸಂಜೀವಿನಿ ನಿರೂಪಣೆ" : "Priest AI Ayur Sanjeevini Synthesis"}
                  </div>
                  <div style={{ whiteSpace: "pre-line" }}>
                    {report.aiNarration.healthNarrative}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: "#F0FDF4",
                  border: "2px solid #86EFAC",
                  borderRadius: "10px",
                  padding: "12px 16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>
                    🏥 {isKn ? report.ayurHealth.prakritiConstitutionKn : report.ayurHealth.prakritiConstitutionEn}
                  </span>
                  <span style={{ fontSize: "10.5px", color: "#15803D", fontWeight: 700 }}>
                    {isKn ? "ಲಗ್ನ & ೬ನೇ ಭಾವದ ತ್ರಿಧಾತು ಸಿದ್ಧಾಂತ" : "Classical Tridosha Balance"}
                  </span>
                </div>

                <div style={{ fontSize: "11.5px", color: "#14532D", lineHeight: 1.5, marginBottom: "8px" }}>
                  <strong>{isKn ? "ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಂಗಗಳು" : "Vulnerable Physiological Zones"}:</strong>
                  <ul style={{ margin: "2px 0 0 0", paddingLeft: "16px" }}>
                    {(isKn ? report.ayurHealth.vulnerableOrgansKn : report.ayurHealth.vulnerableOrgansEn).map((org, i) => (
                      <li key={i}>{org}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", color: "#14532D", marginBottom: "8px" }}>
                  <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                    <strong>🥗 {isKn ? "ಆಹಾರ ಪಥ್ಯ" : "Dietary Advice"}:</strong> {isKn ? report.ayurHealth.seasonalDietAdviceKn : report.ayurHealth.seasonalDietAdviceEn}
                  </div>
                  <div style={{ background: "#FFFFFF", padding: "8px", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                    <strong>🧘 {isKn ? "ದಿನಚರ್ಯೆ" : "Lifestyle"}:</strong> {isKn ? report.ayurHealth.dailyLifestyleHabitKn : report.ayurHealth.dailyLifestyleHabitEn}
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "#166534", background: "#DCFCE7", padding: "6px 10px", borderRadius: "6px", border: "1px solid #86EFAC" }}>
                  <strong>{isKn ? "ಧನ್ವಂತರಿ ಮಂತ್ರ & ರಸಾಯನ" : "Healing Mantra & Rasayana"}:</strong> {isKn ? report.ayurHealth.healingMantraKn : report.ayurHealth.healingMantraEn} • {isKn ? report.ayurHealth.ayurvedicRasayanaKn : report.ayurHealth.ayurvedicRasayanaEn}
                </div>
              </div>
            </div>
          )}

          {/* Page 3 Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              left: "44px",
              right: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #F59E0B",
              paddingTop: "8px",
              fontSize: "10.5px",
              color: "#92400E"
            }}
          >
            <div>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ • ರತ್ನ ಕವಚ & ದೈವಿಕ ಸಂಜೀವಿನಿ ರಕ್ಷೆ ॥</div>
            <div>{isKn ? "ಪುಟ ೩" : "Page 3"}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: SPECIAL ASTROLOGICAL Q&A CONSULTATION + PRIEST ASHIRVADA & QR     */}
      {/* ========================================================================= */}
      {selectedModules.qna && (
        <div
          className="pdf-page"
          style={{
            width: "900px",
            height: "1273px",
            minHeight: "1273px",
            maxHeight: "1273px",
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "32px 42px",
            background: "#FFFDF7",
            position: "relative",
            display: "block",
            pageBreakAfter: "always"
          }}
        >
          {/* Royal Outer Border Frame */}
          <div
            style={{
              position: "absolute",
              inset: "16px",
              border: "3px double #B45309",
              borderRadius: "16px",
              pointerEvents: "none"
            }}
          />

          {/* Mini Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #F59E0B", paddingBottom: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#78350F" }}>
              ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಸಂಹಿತೆ • ವಿಶೇಷ ಪ್ರಶ್ನೋತ್ತರ ಸಮಾಲೋಚನೆ ॥
            </span>
            <span style={{ fontSize: "11px", color: "#92400E", fontWeight: 700 }}>
              {report.devoteeName} ({report.birthDate})
            </span>
          </div>

          <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "4px", marginBottom: "12px" }}>
            <h2 style={{ fontSize: "16px", color: "#78350F", fontWeight: 800, margin: 0 }}>
              🔮 {isKn ? "ವಿಶೇಷ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ & ವೈಯಕ್ತಿಕ ಮಾರ್ಗದರ್ಶನ" : "Special Astrological Consultation & Q&A Verdict"}
            </h2>
          </div>

          {/* Custom Question if present */}
          {report.customQnA && (
            <div
              style={{
                background: "#FEF3C7",
                border: "2px solid #D97706",
                borderRadius: "10px",
                padding: "14px 18px",
                marginBottom: "14px"
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>
                ❓ {isKn ? "ಜಾತಕರು ಕೇಳಿದ ವಿಶೇಷ ಪ್ರಶ್ನೆ" : "Devotee's Personal Query"}: &ldquo;{report.customQnA.question}&rdquo;
              </div>
              <div style={{ fontSize: "12px", color: "#451A03", lineHeight: 1.55, whiteSpace: "pre-line" }}>
                {report.customQnA.answer}
              </div>
            </div>
          )}

          {/* Top 3 Preset Q&As */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {report.presetQnAList.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#FFFBEB",
                  border: "1.5px solid #FDE68A",
                  borderRadius: "8px",
                  padding: "10px 14px"
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                  Q{idx + 1}: {isKn ? item.questionKn : item.questionEn}
                </div>
                <div style={{ fontSize: "11.5px", color: "#451A03", lineHeight: 1.55, marginBottom: "4px" }}>
                  {isKn ? item.answerKn : item.answerEn}
                </div>
                <div style={{ fontSize: "10.5px", color: "#92400E", background: "#FEF3C7", padding: "3px 8px", borderRadius: "6px", display: "inline-block" }}>
                  <strong>{isKn ? "ಶಾಂತಿ ಪರಿಹಾರ" : "Remedy"}:</strong> {isKn ? item.remedyKn : item.remedyEn}
                </div>
              </div>
            ))}
          </div>

          {/* Priest Signature Block + Verification QR Code */}
          <div
            style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
              border: "2px solid #F59E0B",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}
          >
            <div style={{ maxWidth: "600px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "3px" }}>
                ॥ ದೈವಿಕ ಆಶೀರ್ವಾದ & ಅಧಿಕೃತ ಮುದ್ರೆ ॥
              </div>
              <div style={{ fontSize: "11.5px", color: "#451A03", lineHeight: 1.5, marginBottom: "4px" }}>
                {isKn
                  ? "ಈ ಜನ್ಮ ಸಂಹಿತೆಯು ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಾಚೀನ ವೈದಿಕ ಪರಾಶರ ಗಣಿತದ ಅನುಸಾರ ಸಿದ್ಧಪಡಿಸಲಾಗಿದ್ದು, ಸರ್ವತೋಮುಖ ಕ್ಷೇಮ, ಧರ್ಮ ಮತ್ತು ಆಯುರಾರೋಗ್ಯ ಸಮೃದ್ಧಿಯನ್ನು ಹಾರೈಸುತ್ತೇವೆ."
                  : "This sacred life consultation is prepared adhering to classical Parashari Jyotisha. May Lord Mahabaleshwara shower peace and prosperity."}
              </div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400E" }}>
                {priestName} • {priestPhone}
              </div>
              <div style={{ fontSize: "10.5px", color: "#B45309" }}>
                ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ (581326)
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  color: report.aiNarration.isAiGenerated ? "#047857" : "#B45309",
                  background: report.aiNarration.isAiGenerated ? "#ECFDF5" : "#FFFBEB",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${report.aiNarration.isAiGenerated ? "#10B981" : "#F59E0B"}`,
                  display: "inline-block"
                }}
              >
                {report.aiNarration.isAiGenerated ? "✨ " : "⚠️ "}
                {isKn ? report.aiNarration.statusNoticeKn : report.aiNarration.statusNoticeEn}
              </div>
            </div>

            {/* QR Code Container */}
            <div style={{ textAlign: "center", marginLeft: "16px" }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Calendar QR"
                  style={{ width: "85px", height: "85px", border: "2px solid #D97706", borderRadius: "8px", background: "#FFF" }}
                />
              ) : (
                <div
                  style={{
                    width: "85px",
                    height: "85px",
                    border: "2px solid #D97706",
                    borderRadius: "8px",
                    background: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}
                >
                  🕉️
                </div>
              )}
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#78350F", marginTop: "3px" }}>
                {isKn ? "ಪಂಚಾಂಗ ಸಿಂಕ್ QR" : "Calendar Sync"}
              </div>
            </div>
          </div>

          {/* Page 4 Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              left: "44px",
              right: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #F59E0B",
              paddingTop: "8px",
              fontSize: "10.5px",
              color: "#92400E"
            }}
          >
            <div>॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಲಯ • ಸರ್ವೇ ಜನಾಃ ಸುಖಿನೋ ಭವಂತು ॥</div>
            <div>{isKn ? "ಪುಟ ೪" : "Page 4"}</div>
          </div>
        </div>
      )}
    </div>
  );
};
