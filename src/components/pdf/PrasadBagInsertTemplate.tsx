import React from "react";
import type { PrasadBagData } from "../../core/PremiumOfferingsEngine";
import type { KundliOutput } from "../../core/AstroTypes";
import { useTranslation } from "react-i18next";
import { localTranslations } from "../../utils/localTranslations";

interface Props {
  data: PrasadBagData;
  kundli: KundliOutput;
  personName: string;
  pdfLanguage?: string;
}

export const PrasadBagInsertTemplate: React.FC<Props> = ({
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
        width: "500px",
        height: "800px",
        backgroundColor: "#0f172a", // Dark slate background
        color: "#ffffff",
        fontFamily: "'Hind', sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        boxSizing: "border-box",
        border: "8px solid #d97706", // Amber border
      }}
    >
      {/* Background decorations */}
      <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,119,6,0.3) 0%, rgba(15,23,42,0) 70%)" }} />
      <div style={{ position: "absolute", bottom: "-50px", right: "-50px", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(15,23,42,0) 70%)" }} />

      <div style={{ zIndex: 10, textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", color: "#fcd34d", margin: 0, textTransform: "uppercase", letterSpacing: "2px" }}>
          {isKn ? "ದೈವಿಕ ಆಶೀರ್ವಾದ" : "Divine Blessings"}
        </h1>
        <p style={{ fontSize: "16px", color: "#cbd5e1", marginTop: "10px", fontStyle: "italic" }}>
          {isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ" : "Baggona Panchanga Astrology"}
        </p>
      </div>

      <div style={{ zIndex: 10, textAlign: "center", margin: "30px 0" }}>
        <div style={{ width: "100px", height: "100px", margin: "0 auto", border: "2px solid #fcd34d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "#fcd34d", marginBottom: "20px" }}>
          ॐ
        </div>
        <h2 style={{ fontSize: "24px", color: "#ffffff", margin: 0 }}>{personName}</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "15px", fontSize: "14px", color: "#cbd5e1" }}>
          <span><b>{isKn ? "ರಾಶಿ" : "Rashi"}:</b> {isKn ? getLabel(kundli.moonSign.sanskrit) : kundli.moonSign.sanskrit}</span>
          <span><b>{isKn ? "ಲಗ್ನ" : "Lagna"}:</b> {isKn ? getLabel(kundli.lagnaRashi.sanskrit) : kundli.lagnaRashi.sanskrit}</span>
        </div>
      </div>

      <div style={{ zIndex: 10, backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ fontSize: "16px", color: "#fcd34d", textAlign: "center", lineHeight: "1.6", margin: 0, fontWeight: "bold" }}>
          "{isKn ? data.cosmicSummaryKn : data.cosmicSummaryEn}"
        </p>
      </div>

      <div style={{ zIndex: 10, display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        <div style={{ textAlign: "center", flex: 1, padding: "10px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>{isKn ? "ಅದೃಷ್ಟ ಸಂಖ್ಯೆಗಳು" : "Lucky Numbers"}</div>
          <div style={{ fontSize: "20px", color: "#ffffff", marginTop: "5px", fontWeight: "bold" }}>{data.luckyNumbers}</div>
        </div>
        <div style={{ textAlign: "center", flex: 1, padding: "10px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", textTransform: "uppercase" }}>{isKn ? "ಅದೃಷ್ಟ ಬಣ್ಣ" : "Lucky Colors"}</div>
          <div style={{ fontSize: "16px", color: "#ffffff", marginTop: "5px", fontWeight: "bold" }}>{isKn ? data.luckyColorsKn : data.luckyColorsEn}</div>
        </div>
      </div>

      <div style={{ zIndex: 10, textAlign: "center", marginTop: "20px", padding: "20px", backgroundColor: "rgba(217, 119, 6, 0.1)", borderRadius: "12px", border: "1px dashed rgba(217,119,6,0.4)" }}>
        <div style={{ fontSize: "12px", color: "#fcd34d", textTransform: "uppercase", letterSpacing: "1px" }}>{isKn ? "ನಿಮ್ಮ ಶಕ್ತಿಶಾಲಿ ಮಂತ್ರ" : "Your Power Mantra"}</div>
        <div style={{ fontSize: "22px", color: "#ffffff", marginTop: "15px", fontWeight: "bold", lineHeight: "1.4" }}>
          {isKn ? data.mantraKn : data.mantraEn}
        </div>
      </div>

      <div style={{ zIndex: 10, textAlign: "center", fontSize: "12px", color: "#64748b", marginTop: "30px" }}>
        {isKn ? "ಇದನ್ನು ನಿಮ್ಮ ಬಳಿ ಇಟ್ಟುಕೊಳ್ಳಿ. ಒಳ್ಳೆಯದಾಗಲಿ." : "Keep this with you. May the stars guide you."}
      </div>
    </div>
  );
};
