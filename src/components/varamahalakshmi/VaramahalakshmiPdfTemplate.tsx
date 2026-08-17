import type { SupportedLanguage } from "../../stores/appStore";
import { pickL5 } from "../../features/varamahalakshmi/varamahalakshmiLocale";
import { DORA_GRANTHI_KNOTS } from "../../features/varamahalakshmi/varamahalakshmiLocale";
import type {
  PersonalizedVaramahalakshmiAnalysis,
  SthiraLagnaMuhurtha
} from "../../features/varamahalakshmi/varamahalakshmiTypes";

type Props = {
  analysis: PersonalizedVaramahalakshmiAnalysis;
  muhurthas: SthiraLagnaMuhurtha[];
  dateStr: string;
  lang: SupportedLanguage;
  qrCodeDataUrl?: string;
};

export default function VaramahalakshmiPdfTemplate({
  analysis,
  muhurthas,
  dateStr,
  lang,
  qrCodeDataUrl
}: Props): JSX.Element {
  const { ashtaLakshmi } = analysis;

  return (
    <div
      id="varamahalakshmi-pdf-root"
      style={{
        width: 900,
        backgroundColor: "#FFFDF7",
        color: "#3B1B06",
        fontFamily: "'Noto Sans', system-ui, sans-serif",
        lineHeight: 1.6
      }}
    >
      {/* ════════════════════════════ PAGE 1 ════════════════════════════ */}
      <div
        className="pdf-page"
        style={{
          width: 900,
          minHeight: 1240,
          padding: "36px 44px",
          boxSizing: "border-box",
          backgroundColor: "#FFFDF7",
          position: "relative"
        }}
      >
        {/* Ornate Gold Border Frame */}
        <div
          style={{
            border: "3px double #B45309",
            borderRadius: "16px",
            padding: "24px",
            background: "linear-gradient(180deg, rgba(254, 243, 199, 0.35) 0%, rgba(255, 255, 255, 0.8) 100%)"
          }}
        >
          {/* Top Temple Header Banner */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #D97706", paddingBottom: "14px" }}>
            <div style={{ fontSize: "24px", color: "#B45309", marginBottom: "4px" }}>❖ ॐ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮ್ಯೈ ನಮಃ ❖</div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "bold",
                color: "#78350F",
                margin: "4px 0",
                letterSpacing: "normal"
              }}
            >
              {lang === "kn"
                ? "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ ಸೌಭಾಗ್ಯ ಪತ್ರಿಕೆ"
                : lang === "te"
                ? "వరమహాలక్ష్మి వ్రత సౌభాగ్య పత్రిక"
                : lang === "ta"
                ? "வரமகாலட்சுமி விரத சௌபாக்கிய பத்ரிகா"
                : lang === "hi"
                ? "वरमहालक्ष्मी व्रत सौभाग्य पत्रिका"
                : "Varamahalakshmi Soubhagya Sacred Patrika"}
            </h1>
            <p style={{ fontSize: "13px", color: "#92400E", margin: 0, fontWeight: 500 }}>
              ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ • ಸಕಲ ಸೌಮಾಂಗಲ್ಯ & ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿ ಪತ್ರ
            </p>
          </div>

          {/* Devotee Info Box */}
          <div
            style={{
              marginTop: "16px",
              padding: "14px 18px",
              backgroundColor: "#FEF3C7",
              border: "1px solid #F59E0B",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#B45309", fontWeight: "bold" }}>
                വ്രತಕರ್ತೃ / Devotee
              </div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#78350F" }}>{analysis.personName}</div>
              <div style={{ fontSize: "12px", color: "#92400E" }}>
                ಗೋತ್ರ: <strong>{analysis.gotra}</strong>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#92400E" }}>
                ರಾಶಿ: <strong>{analysis.rashiName}</strong> | ನಕ್ಷತ್ರ: <strong>{analysis.nakshatraName}</strong>
              </div>
              <div style={{ fontSize: "12px", color: "#B45309", fontWeight: "bold", marginTop: "2px" }}>
                ದಿನಾಂಕ: {dateStr} (ಶ್ರಾವಣ ಶುಕ್ಲ ಶುಕ್ರವಾರ)
              </div>
            </div>
          </div>

          {/* Guardian Ashta Lakshmi Profile Section */}
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              backgroundColor: "#FFFBEB",
              border: "1.5px solid #D97706",
              borderRadius: "12px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "30px" }}>{ashtaLakshmi.icon}</span>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#B45309", textTransform: "uppercase" }}>
                  ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ರಕ್ಷಕ ದೇವತೆ / Guardian Deity
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#78350F", margin: 0 }}>
                  {pickL5(ashtaLakshmi.nameL5, lang)}
                </h2>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#451A03", margin: "6px 0", lineHeight: 1.6 }}>
              {pickL5(ashtaLakshmi.descriptionL5, lang)}
            </p>
            <p style={{ fontSize: "13px", color: "#78350F", fontWeight: 600, margin: "6px 0", lineHeight: 1.6 }}>
              ✦ <strong>ಅನುಗ್ರಹ ಫಲ:</strong> {pickL5(ashtaLakshmi.blessingL5, lang)}
            </p>

            <div
              style={{
                marginTop: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "10px",
                paddingTop: "10px",
                borderTop: "1px dashed #F59E0B"
              }}
            >
              <div style={{ background: "#FEF3C7", padding: "8px 10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400E" }}>👗 ಶುಭ ಸೀರೆ ಬಣ್ಣ</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350F", marginTop: "2px" }}>
                  {pickL5(ashtaLakshmi.recommendedSareeColorL5, lang)}
                </div>
              </div>
              <div style={{ background: "#FEF3C7", padding: "8px 10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400E" }}>🌺 ಪ್ರಿಯ ಪುಷ್ಪ</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350F", marginTop: "2px" }}>
                  {pickL5(ashtaLakshmi.recommendedFlowerL5, lang)}
                </div>
              </div>
              <div style={{ background: "#FEF3C7", padding: "8px 10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400E" }}>🍯 ವಿಶೇಷ ನೈವೇದ್ಯ</div>
                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#78350F", marginTop: "2px" }}>
                  {pickL5(ashtaLakshmi.specialNaivedyaL5, lang)}
                </div>
              </div>
            </div>

            {/* Sacred Shloka */}
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                background: "#78350F",
                color: "#FEF3C7",
                borderRadius: "8px",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#FDE68A", marginBottom: "4px" }}>
                ॥ ದೇವಿಯ ಸಿದ್ಧ ಸ್ತೋತ್ರಮ್ ॥
              </div>
              <div style={{ fontSize: "12px", fontStyle: "italic", lineHeight: 1.5 }}>
                {pickL5(ashtaLakshmi.stotraL5, lang)}
              </div>
            </div>
          </div>

          {/* Sthira Lagna Timings Table */}
          <div style={{ marginTop: "18px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#78350F", marginBottom: "8px" }}>
              ⏱️ ಸ್ಥಿರ ಲಗ್ನ ಪೂಜಾ ಶುಭ ಮುಹೂರ್ತಗಳು (Sthira Lagna Timings)
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#FEF3C7", color: "#78350F", borderBottom: "1.5px solid #D97706" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>ಲಗ್ನ / ಕಾಲ</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>ಸಮಯ</th>
                  <th style={{ padding: "6px 8px", textAlign: "left" }}>ಶ್ರೇಷ್ಠತೆ & ಪೂಜಾ ಫಲ</th>
                </tr>
              </thead>
              <tbody>
                {muhurthas.map((m, idx) => (
                  <tr
                    key={m.lagnaName}
                    style={{
                      borderBottom: "1px solid #FDE68A",
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FFFBEB"
                    }}
                  >
                    <td style={{ padding: "6px 8px", fontWeight: "bold", color: "#92400E" }}>
                      {pickL5(m.lagnaNameL5, lang)}
                    </td>
                    <td style={{ padding: "6px 8px", color: "#78350F", fontWeight: 600 }}>
                      {m.startTime} – {m.endTime}
                    </td>
                    <td style={{ padding: "6px 8px", color: "#451A03" }}>{pickL5(m.bestFor, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "11px",
              color: "#92400E",
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            ಪುಟ ೧ / ೨ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ಸೇವೆ • Baggona Panchanga Astrology
          </div>
        </div>
      </div>

      {/* ════════════════════════════ PAGE 2 ════════════════════════════ */}
      <div
        className="pdf-page"
        style={{
          width: 900,
          minHeight: 1240,
          padding: "36px 44px",
          boxSizing: "border-box",
          backgroundColor: "#FFFDF7",
          position: "relative"
        }}
      >
        {/* Ornate Gold Border Frame */}
        <div
          style={{
            border: "3px double #B45309",
            borderRadius: "16px",
            padding: "24px",
            background: "linear-gradient(180deg, rgba(254, 243, 199, 0.35) 0%, rgba(255, 255, 255, 0.8) 100%)"
          }}
        >
          {/* Section: Personalized Sankalpa */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#FFFBEB",
              border: "1.5px solid #D97706",
              borderRadius: "12px"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#B45309", textTransform: "uppercase" }}>
                ॥ ವೈಯಕ್ತಿಕ ಪೂಜಾ ಸಂಕಲ್ಪ ಮಂತ್ರ ॥
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#78350F", margin: "2px 0" }}>
                {analysis.personName} ಅವರ ಕುಟುಂಬದ ಮಹಾ ಸಂಕಲ್ಪ
              </h2>
            </div>
            <p
              style={{
                fontSize: "13px",
                lineHeight: 1.8,
                color: "#451A03",
                textAlign: "justify",
                margin: 0,
                backgroundColor: "#FEF3C7",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px dashed #D97706"
              }}
            >
              {pickL5(analysis.sankalpaTextL5, lang)}
            </p>
          </div>

          {/* Section: 9-Knot Doragranthi Table */}
          <div style={{ marginTop: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "bold", color: "#78350F", margin: 0 }}>
                🎗️ ದೋರಗ್ರಂಥಿ (೯ ಗಂಟು) ಪೂಜಾ ಮಂತ್ರಗಳು (9-Knot Sacred Thread)
              </h3>
              <span style={{ fontSize: "11px", color: "#B45309", fontWeight: 600 }}>
                ಪ್ರತಿ ಗಂಟಿಗೆ ಕುಂಕುಮ-ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ backgroundColor: "#FEF3C7", color: "#78350F", borderBottom: "1.5px solid #D97706" }}>
                  <th style={{ padding: "4px 6px", textAlign: "left", width: "18%" }}>ಗಂಟು / ದೇವತೆ</th>
                  <th style={{ padding: "4px 6px", textAlign: "left", width: "42%" }}>ಮಂತ್ರ</th>
                  <th style={{ padding: "4px 6px", textAlign: "left", width: "40%" }}>ಮಹತ್ವ & ಫಲ</th>
                </tr>
              </thead>
              <tbody>
                {DORA_GRANTHI_KNOTS.map((k, idx) => (
                  <tr
                    key={k.knotNumber}
                    style={{
                      borderBottom: "1px solid #FDE68A",
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FFFBEB"
                    }}
                  >
                    <td style={{ padding: "4px 6px", fontWeight: "bold", color: "#92400E" }}>
                      {pickL5(k.goddessNameL5, lang)}
                    </td>
                    <td style={{ padding: "4px 6px", fontStyle: "italic", color: "#78350F" }}>
                      {k.mantra}
                    </td>
                    <td style={{ padding: "4px 6px", color: "#451A03" }}>{pickL5(k.significanceL5, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom QR & Blessing Seal */}
          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              backgroundColor: "#FEF3C7",
              border: "1.5px solid #F59E0B",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#78350F" }}>
                ❖ ಸರ್ವಮಂಗಳ ಮಾಂಗಲ್ಯೇ ಶಿವೇ ಸರ್ವಾರ್ಥ ಸಾಧಿಕೇ | ಶರಣ್ಯೇ ತ್ರ್ಯಂಬಕೇ ಗೌರಿ ನಾರಾಯಣಿ ನಮೋಽಸ್ತು ತೇ ❖
              </div>
              <p style={{ fontSize: "11px", color: "#92400E", margin: "4px 0 0 0" }}>
                ಪ್ರತಿ ಶುಕ್ರವಾರ ಲಕ್ಷ್ಮಿ ಪೂಜಾ ನೆನಪೋಲೆಗಾಗಿ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಲು QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.
              </p>
            </div>
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Calendar QR"
                style={{ width: "70px", height: "70px", border: "2px solid #D97706", borderRadius: "8px", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  border: "1px dashed #D97706",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "#B45309",
                  textAlign: "center"
                }}
              >
                Pooja Sync
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
              fontSize: "11px",
              color: "#92400E",
              borderTop: "1px solid #D97706",
              paddingTop: "6px"
            }}
          >
            ಪುಟ ೨ / ೨ • ಸಕಲ ಸೌಭಾಗ್ಯಂ ಭವತು • Baggona Panchanga Astrology
          </div>
        </div>
      </div>
    </div>
  );
}
