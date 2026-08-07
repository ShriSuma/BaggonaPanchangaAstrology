import React from "react";
import type { SixMonthCalendarData } from "../../core/PremiumOfferingsEngine";
import type { KundliOutput } from "../../core/AstroTypes";
import { useTranslation } from "react-i18next";
import { localTranslations } from "../../utils/localTranslations";

interface Props {
  data: SixMonthCalendarData;
  kundli: KundliOutput;
  personName: string;
  pdfLanguage?: string;
}

export const Next6MonthsCalendarTemplate: React.FC<Props> = ({
  data,
  kundli,
  personName,
  pdfLanguage = "kn"
}) => {
  const { t } = useTranslation();
  const isKn = pdfLanguage === "kn";

  const getLabel = (key: string) => {
    const localVal = localTranslations[pdfLanguage]?.[key];
    if (localVal) return localVal;
    return t(key, { lng: pdfLanguage });
  };

  return (
    <div
      style={{
        width: "794px", // A4 width
        minHeight: "1123px", // A4 height
        backgroundColor: "#020617", // Very dark blue/black
        color: "#f8fafc",
        fontFamily: "'Hind', sans-serif",
        padding: "40px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Decorative stars/space background (simulated via CSS) */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: "2px", height: "2px", backgroundColor: "#fff", boxShadow: "0 0 10px 2px #fff", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: "20%", right: "15%", width: "3px", height: "3px", backgroundColor: "#fcd34d", boxShadow: "0 0 12px 3px #fcd34d", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: "60%", left: "10%", width: "2px", height: "2px", backgroundColor: "#fff", boxShadow: "0 0 10px 2px #fff", borderRadius: "50%" }} />
      <div style={{ position: "absolute", top: "80%", right: "20%", width: "3px", height: "3px", backgroundColor: "#e2e8f0", boxShadow: "0 0 10px 2px #e2e8f0", borderRadius: "50%" }} />

      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", color: "#fcd34d", margin: 0, textTransform: "uppercase", letterSpacing: "3px" }}>
          {isKn ? "ಮುಂದಿನ ೬ ತಿಂಗಳ ಜ್ಯೋತಿಷ್ಯ ಕ್ಯಾಲೆಂಡರ್" : "Astrological Calendar (Next 6 Months)"}
        </h1>
        <h2 style={{ fontSize: "20px", color: "#cbd5e1", marginTop: "10px", margin: 0 }}>
          {personName} - {isKn ? getLabel(kundli.moonSign.sanskrit) : kundli.moonSign.sanskrit} {isKn ? "ರಾಶಿ" : "Rashi"}
        </h2>
      </div>

      {/* Monthly Narratives (Cover Page style intro) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        {data.monthlyNarratives.map((m, idx) => (
          <div key={idx} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #fcd34d" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#fcd34d" }}>{m.month}</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", lineHeight: "1.5" }}>
              {isKn ? m.themeKn : m.themeEn}
            </p>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "5px" }}>
              <strong>{isKn ? "ಪ್ರಮುಖ ದಿನಾಂಕಗಳು" : "Key Dates"}:</strong> {isKn ? m.keyDatesKn : m.keyDatesEn}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              <strong>{isKn ? "ಪರಿಹಾರ/ಪೂಜೆ" : "Rituals"}:</strong> {isKn ? m.ritualsKn : m.ritualsEn}
            </div>
          </div>
        ))}
      </div>

      {/* Daily Calendar (Sample format, rendering only the first 30 days as an example to fit) */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ fontSize: "24px", color: "#fcd34d", borderBottom: "1px dashed rgba(255,255,255,0.2)", paddingBottom: "10px", marginBottom: "20px" }}>
          {isKn ? "ದೈನಂದಿನ ಗೋಚರ ವಿಶ್ಲೇಷಣೆ (ಮೊದಲ ೩೦ ದಿನಗಳು)" : "Daily Transit Analysis (First 30 Days)"}
        </h3>
        
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fcd34d", textAlign: "left" }}>
              <th style={{ padding: "10px", borderBottom: "2px solid #334155" }}>{isKn ? "ದಿನಾಂಕ" : "Date"}</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #334155", textAlign: "center" }}>{isKn ? "ಚಂದ್ರ" : "Moon"}</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #334155" }}>{isKn ? "ತಿಥಿ" : "Tithi"}</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #334155" }}>{isKn ? "ನಕ್ಷತ್ರ" : "Nakshatra"}</th>
              <th style={{ padding: "10px", borderBottom: "2px solid #334155" }}>{isKn ? "ಗೋಚರ ಚಂದ್ರ ರಾಶಿ" : "Transit Moon Sign"}</th>
            </tr>
          </thead>
          <tbody>
            {data.days.slice(0, 30).map((day, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <td style={{ padding: "8px 10px" }}>{day.date}</td>
                <td style={{ padding: "8px 10px", textAlign: "center", fontSize: "16px" }}>{day.moonSymbol}</td>
                <td style={{ padding: "8px 10px" }}>{isKn ? day.tithiKn : day.tithiEn}</td>
                <td style={{ padding: "8px 10px" }}>{isKn ? day.nakshatraKn : day.nakshatraEn}</td>
                <td style={{ padding: "8px 10px" }}>{isKn ? getLabel(day.moonSign) : day.moonSign}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b", marginTop: "20px", fontStyle: "italic" }}>
          {isKn ? "*ಸಂಪೂರ್ಣ ೧೮೦ ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಮುಂದಿನ ಪುಟಗಳಲ್ಲಿ ಮುಂದುವರೆಯುತ್ತದೆ." : "*The complete 180-day calendar continues on the next pages."}
        </div>
      </div>
    </div>
  );
};
