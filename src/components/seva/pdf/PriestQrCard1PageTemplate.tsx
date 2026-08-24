import React from "react";

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
  priestTitle = "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು",
  durationDays,
  qrDataUrl,
  lang = "kn"
}) => {
  const isKn = lang === "kn";

  const durationLabel = isKn
    ? durationDays === 30
      ? "೧ ತಿಂಗಳು (೩೦ ದಿನಗಳು)"
      : durationDays === 90
      ? "೩ ತಿಂಗಳು (೯೦ ದಿನಗಳು)"
      : durationDays === 180
      ? "೬ ತಿಂಗಳು (೧೮೦ ದಿನಗಳು)"
      : "೧೨ ತಿಂಗಳು (೩೬೫ ದಿನಗಳು - ೧ ಪೂರ್ಣ ವರ್ಷ)"
    : `${durationDays} Days Calendar Subscription`;

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
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#78350F", margin: "6px 0 4px 0" }}>
            {isKn ? "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ · ಸಿದ್ಧ ಅರ್ಚಕ ಆಶೀರ್ವಾದ QR ಕೋಡ್ ಕಾರ್ಡ್ ॥" : "Baggona Panchanga · Priest Ashirvada QR Code Card"}
          </h1>
          <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 600 }}>
            {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಪವಿತ್ರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಭಕ್ತರಿಗೆ ವಿಶೇಷವಾಗಿ ಸಿದ್ಧಪಡಿಸಿದ ದೈನಿಕ ಪಂಚಾಂಗ" : "Sacred Daily Panchanga & Muhurtha Sync for Devotee"}
          </div>
        </div>

        {/* Info Grid (Devotee & Priest Context) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
          {/* Devotee Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(180,83,9,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              👤 {isKn ? "ಭಕ್ತರ ವಿವರಗಳು" : "Devotee Details"}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {personName || (isKn ? "ಶ್ರೀಯುತ ಭಕ್ತರು" : "Devotee")}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ರಾಶಿ:" : "Rashi:"}</strong> {rashiName || "—"}</div>
              <div><strong>{isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"}</strong> {nakshatraName || "—"}</div>
              {gotra && <div><strong>{isKn ? "ಗೋತ್ರ:" : "Gotra:"}</strong> {gotra}</div>}
              <div><strong>{isKn ? "ಆಯ್ಕೆಮಾಡಿದ ಅವಧಿ:" : "Duration:"}</strong> <span style={{ color: "#065F46", fontWeight: 700 }}>{durationLabel}</span></div>
            </div>
          </div>

          {/* Priest Info */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 4px rgba(180,83,9,0.06)" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              🔱 {isKn ? "ಅರ್ಚಕರ ವಿವರಗಳು" : "Priest Details"}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {priestName}
            </div>
            <div style={{ fontSize: "12px", color: "#92400E", lineHeight: "1.4" }}>
              <div><strong>{isKn ? "ಪದವಿ:" : "Title:"}</strong> {priestTitle}</div>
              <div><strong>{isKn ? "ದೂರವಾಣಿ:" : "Phone:"}</strong> <span style={{ color: "#78350F", fontWeight: 700 }}>{priestPhone}</span></div>
              <div><strong>{isKn ? "ಕ್ಷೇತ್ರ:" : "Temple:"}</strong> ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ</div>
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
            "ಶ್ರೀಯುತ <span style={{ color: "#92400E", fontWeight: 800 }}>{personName}</span> ಅವರಿಗೆ ವಿಶೇಷವಾಗಿ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ತಯಾರಿಸಲಾದ ದಿನನಿತ್ಯದ <span style={{ color: "#065F46", fontWeight: 800 }}>{durationDays}</span> ದಿನಗಳ ನಿಖರ ಪಂಚಾಂಗ ಹಾಗೂ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳ ದೈವಿಕ QR ಕೋಡ್. ಪ್ರತಿಯೊಂದು ದಿನದ ಪಂಚಾಂಗವು ನಿಮಗಾಗಿಯೇ ಪ್ರತ್ಯೇಕವಾಗಿ ಗಣನೆ ಮಾಡಲ್ಪಟ್ಟಿದೆ."
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
            📱 {isKn ? `ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ಈ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ${durationDays} ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಮಾಡಿ` : `Scan QR Code to Sync ${durationDays} Days Panchanga`}
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
            ✨ Google Calendar / Apple Calendar 1-Click Sync Enabled
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
            📲 {isKn ? "ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಮಾಡುವ ಸರಳ ಹಂತಗಳು:" : "Simple Mobile Sync Steps:"}
          </div>
          <div style={{ fontSize: "11.5px", color: "#92400E", lineHeight: "1.6" }}>
            <div><strong>೧.</strong> {isKn ? "ನಿಮ್ಮ iPhone ಅಥವಾ Android ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ತೆರೆದು ಮೇಲಿನ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ." : "Open your mobile camera and scan the QR code above."}</div>
            <div><strong>೨.</strong> {isKn ? "ಪರದೆಯ ಮೇಲೆ ಬರುವ 'Baggona Panchanga Sync / Calendar Download' ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ." : "Tap the 'Baggona Panchanga Sync / Calendar Download' link."}</div>
            <div><strong>೩.</strong> {isKn ? "ನಿಮ್ಮ Apple Calendar ಅಥವಾ Google Calendar ನಲ್ಲಿ 'Add All Events / Subscribe' ಆಯ್ಕೆ ಮಾಡಿ." : "Select 'Add All Events / Subscribe' in Apple Calendar or Google Calendar."}</div>
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
            {priestTitle} · {priestName} (ದೂರವಾಣಿ: {priestPhone})
          </div>
        </div>
      </div>
    </div>
  );
};
