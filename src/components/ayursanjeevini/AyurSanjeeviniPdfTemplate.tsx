import React from "react";
import type { SupportedLanguage } from "../../stores/appStore";
import type { AyurSanjeeviniResult } from "../../features/ayursanjeevini/ayurSanjeeviniTypes";

interface Props {
  result: AyurSanjeeviniResult;
  lang: SupportedLanguage;
}

export const AyurSanjeeviniPdfTemplate: React.FC<Props> = ({ result, lang }) => {
  const isKn = lang === "kn";
  const isHi = lang === "hi";
  const isTe = lang === "te";
  const isTa = lang === "ta";

  const isJanma = result.mode === "janma";

  // Common Header component for printable pages
  const renderHeader = (pageNumber: number, totalPages: number) => (
    <div
      style={{
        borderBottom: "2px solid #b45309",
        paddingBottom: "8px",
        marginBottom: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#78350f" }}>
          {isKn
            ? "॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಜ್ಯೋತಿಷ್ಯ ಪೀಠ ॥"
            : isHi
            ? "॥ श्री क्षेत्र गोकर्ण महाबलेश्वर ज्योतिष पीठ ॥"
            : isTe
            ? "॥ శ్రీ క్షేత్ర గోకర్ణ మహాబలేశ్వర జ్యోతిష్య పీఠం ॥"
            : isTa
            ? "॥ ஸ்ரீ க்ஷேத்ர கோகர்ண மகாபலேஸ்வர ஜோதிட பீடம் ॥"
            : "॥ Sri Kshetra Gokarna Mahabaleshwara Astrology Sansthan ॥"}
        </div>
        <div style={{ fontSize: "11px", color: "#92400e", fontWeight: "600" }}>
          {isJanma
            ? isKn
              ? "ಆಯುರ್-ಸಂಜೀವಿನಿ ಮಹಾರಕ್ಷಾ ಪತ್ರಿಕೆ (Vedic Ayurdaya & Vitality Report)"
              : "Vedic Birth Ayurdaya & Sanjeevini Protection Report"
            : isKn
            ? "ಮರಣ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ಸಂಕಲ್ಪ ಪತ್ರಿಕೆ (Soul Transition & Moksha Report)"
            : "Vedic Soul Transition, Sadgati & Pitru Moksha Report"}
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: "10px", color: "#b45309", fontWeight: "bold" }}>
        <span>Page {pageNumber} of {totalPages}</span>
        <div style={{ fontSize: "9px", color: "#78350f" }}>{result.dobFormatted}</div>
      </div>
    </div>
  );

  // Common Footer component
  const renderFooter = () => (
    <div
      style={{
        borderTop: "1px dashed #d97706",
        paddingTop: "6px",
        marginTop: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "9px",
        color: "#92400e"
      }}
    >
      <div>
        <span>ಅರ್ಚಕರು: </span>
        <strong style={{ color: "#78350f" }}>ಶ್ರೀರಾಮ ಪಂಡಿತ್ (Shreeram Pandit)</strong>
        <span> | ಸಂಪರ್ಕ: +91 99723 39362</span>
      </div>
      <div style={{ fontStyle: "italic", color: "#b45309" }}>
        ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನ ॥
      </div>
    </div>
  );

  // If Mode is JANMA (Birth & Vital Longevity)
  if (isJanma) {
    return (
      <div
        id="ayur-sanjeevini-pdf-template"
        className="ayur-sanjeevini-pdf-template"
        style={{
          width: "794px",
          background: "#fffbeb",
          color: "#451a03",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
          boxSizing: "border-box"
        }}
      >
        {/* PAGE 1: Longevity & Vitality Matrix */}
        <div
          className="pdf-page-a4"
          style={{
            width: "794px",
            minHeight: "1123px",
            height: "1123px",
            padding: "24px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
            border: "6px solid #d97706",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pageBreakAfter: "always"
          }}
        >
          <div>
            {renderHeader(1, 3)}

            {/* Devotee Banner */}
            <div
              style={{
                background: "linear-gradient(90deg, #78350f 0%, #b45309 100%)",
                color: "#fef3c7",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  ಜಾತಕ ವಿವರ: {result.personName}
                </div>
                <div style={{ fontSize: "10px", opacity: 0.9 }}>
                  ಜನನ: {result.dobFormatted} | ಸಮಯ: {result.tobFormatted} | ಸ್ಥಳ: {result.pob}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "10px", fontWeight: "bold" }}>
                <div>ಗೋತ್ರ: {result.gotra}</div>
                <div>ರಾಶಿ: {result.rashi} | ನಕ್ಷತ್ರ: {result.nakshatra}</div>
              </div>
            </div>

            {/* Vitality Score & Longevity Class */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #d97706",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400e" }}>ಆಯುರ್ದಾಯ ವರ್ಗ</div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#78350f", marginTop: "2px" }}>
                  {result.longevity.estimatedAgeSpan}
                </div>
                <div style={{ fontSize: "9px", color: "#b45309", marginTop: "4px" }}>
                  {result.longevity.category.toUpperCase()} (Jaimini Method)
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #d97706",
                  borderRadius: "8px",
                  padding: "10px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#92400e" }}>ಪ್ರಾಣ ಶಕ್ತಿ ಸೂಚ್ಯಂಕ (Vitality Score)</div>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#15803d", marginTop: "2px" }}>
                  {result.longevity.vitalityScore} / 100
                </div>
                <div style={{ fontSize: "9px", color: "#166534" }}>ಉತ್ತಮ ದೈವಿಕ ರಕ್ಷಾ ಬಲ (Benefic Shield)</div>
              </div>
            </div>

            {/* Three Pairs Method */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
                🌟 ಜೈಮಿನಿ ತ್ರಿ-ಮಾನ ಆಯುರ್ದಾಯ ಪದ್ಧತಿ (Three Pairs Longevity Method):
              </div>
              <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
                <div>• <strong>ಲಗ್ನ & ೮ನೇ ಭಾವಾಧಿಪತಿ:</strong> {result.longevity.threePairsMethod.lagnaAndEighth}</div>
                <div>• <strong>ಚಂದ್ರ & ಶನಿ ಗ್ರಹ ಬಲ:</strong> {result.longevity.threePairsMethod.moonAndSaturn}</div>
                <div>• <strong>ಲಗ್ನ & ಹೋರಾ ಲಗ್ನ ದೃಷ್ಟಿ:</strong> {result.longevity.threePairsMethod.lagnaAndHoraLagna}</div>
              </div>
            </div>

            {/* AI Narrative Section */}
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                padding: "10px",
                fontSize: "10px",
                lineHeight: "1.5",
                color: "#78350f"
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>✨ ಆಯುರ್-ಸಂಜೀವಿನಿ ದೈವಿಕ ಸಂದೇಶ:</div>
              <p style={{ margin: 0 }}>{result.aiDivineNarrative || "ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ಲಗ್ನಾಧಿಪತಿ ಹಾಗೂ ಶನಿ ಬಲ ಉತ್ತಮವಾಗಿದ್ದು ದೀರ್ಘಾಯುಷ್ಯ ಯೋಗವಿದೆ."}</p>
            </div>
          </div>

          {renderFooter()}
        </div>

        {/* PAGE 2: Gandanta, Maraka Neutralization & Karma Vipaka */}
        <div
          className="pdf-page-a4"
          style={{
            width: "794px",
            minHeight: "1123px",
            height: "1123px",
            padding: "24px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
            border: "6px solid #d97706",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            pageBreakAfter: "always"
          }}
        >
          <div>
            {renderHeader(2, 3)}

            {/* Gandanta & Balarishta Shield */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
                ⚖️ ಗಂಡಾಂತ & ಬಾಲಾರಿಷ್ಟ ಶಮನ (Gandanta & Balarishta Diagnostics):
              </div>
              <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
                <div>• <strong>ಸ್ಥಿತಿ:</strong> {result.gandanta.description}</div>
                <div>• <strong>ಪರಿಹಾರ ಮಾರ್ಗ:</strong> {result.gandanta.remedyRequired}</div>
              </div>
            </div>

            {/* Maraka & Badhaka Analysis */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
                ⚔️ ಮಾರಕ & ಬಾಧಕ ಗ್ರಹ ನಿರ್ಣಯ (Maraka & Badhaka Mitigation):
              </div>
              <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
                <div>• <strong>ಮಾರಕ ಗ್ರಹಗಳು (Maraka Lords):</strong> {result.marakaBadhaka.marakaPlanets.join(", ")}</div>
                <div>• <strong>ಬಾಧಕ ಸ್ಥಾನ & ಅಧಿಪತಿ:</strong> {result.marakaBadhaka.badhadhipati} ({result.marakaBadhaka.badhakaHouse}ನೇ ಮನೆ)</div>
                <div>• <strong>ದಶಾ-ಭುಕ್ತಿ ಎಚ್ಚರಿಕೆ:</strong> {result.marakaBadhaka.chhidraDashaAlert}</div>
                <div>• <strong>ಶಾಂತಿ ಉಪಾಯ:</strong> {result.marakaBadhaka.mitigationSummary}</div>
              </div>
            </div>

            {/* Karma Vipaka Health Causes */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
                🌌 ಕರ್ಮ ವಿಪಾಕ & ಆರೋಗ್ಯ ಸಂವರ್ಧನೆ (Karma Vipaka Health Root Causes):
              </div>
              {result.karmaVipaka.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: idx < result.karmaVipaka.length - 1 ? "1px dashed #fcd34d" : "none",
                    paddingBottom: "6px",
                    marginBottom: "6px",
                    fontSize: "9.5px",
                    lineHeight: "1.4"
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#92400e" }}>{item.ailmentOrChallenge}</div>
                  <div>ಕರ್ಮ ಕಾರಣ: {item.karmicCause}</div>
                  <div>ಪ್ರಶಸ್ತ ದಾನ: <strong>{item.recommendedDaana}</strong></div>
                  <div>ಮಂತ್ರ: <span style={{ color: "#78350f", fontStyle: "italic" }}>{item.prescribedMantra}</span></div>
                </div>
              ))}
            </div>
          </div>

          {renderFooter()}
        </div>

        {/* PAGE 3: Sanjeevini Shield & Gokarna Sevas */}
        <div
          className="pdf-page-a4"
          style={{
            width: "794px",
            minHeight: "1123px",
            height: "1123px",
            padding: "24px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
            border: "6px solid #d97706",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            {renderHeader(3, 3)}

            {/* Maha Mrityunjaya Shield */}
            <div
              style={{
                background: "#78350f",
                color: "#fef3c7",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#fde68a" }}>
                🛡️ ಮಹಾಮೃತ್ಯುಂಜಯ ಮಹಾಸಂಜೀವಿನಿ ಕವಚ ಮಂತ್ರ:
              </div>
              <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "6px", lineHeight: "1.5" }}>
                {result.sanjeeviniShield.mrityunjayaMantra}
              </div>
              <div style={{ fontSize: "9.5px", marginTop: "6px", opacity: 0.9 }}>
                ದೈನಿಕ ಜಪ ಸಂಖ್ಯೆ: {result.sanjeeviniShield.recommendedJapaCount} | ರುದ್ರಾಕ್ಷಿ: {result.sanjeeviniShield.rudrakshaRecommendation}
              </div>
            </div>

            {/* Gokarna Kshetra Ayushya Sevas */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid #d97706",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
                🕉️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ನೆರವೇರಿಸಬೇಕಾದ ಆಯುಷ್ಯ ಸೇವೆಗಳು:
              </div>
              {result.gokarnaSankalpa.recommendedSevas.map((seva, idx) => (
                <div
                  key={idx}
                  style={{
                    borderBottom: idx < result.gokarnaSankalpa.recommendedSevas.length - 1 ? "1px dashed #fcd34d" : "none",
                    paddingBottom: "6px",
                    marginBottom: "6px",
                    fontSize: "9.5px",
                    lineHeight: "1.4"
                  }}
                >
                  <div style={{ fontWeight: "bold", color: "#b45309" }}>{idx + 1}. {seva.title}</div>
                  <div>ವಿವರ: {seva.description}</div>
                  <div>ಪ್ರಶಸ್ತ ತಿಥಿ: <strong>{seva.idealTithi}</strong> | ಫಲ: {seva.significance}</div>
                </div>
              ))}
            </div>

            {/* Priest Authorization Seal */}
            <div
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                border: "2px solid #b45309",
                borderRadius: "8px",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f" }}>
                  ಗೋಕರ್ಣ ಪ್ರಧಾನ ಅರ್ಚಕರ ದೃಢೀಕರಣ & ಸಂಕಲ್ಪ ಸೇವೆ:
                </div>
                <div style={{ fontSize: "10px", color: "#92400e", marginTop: "2px" }}>
                  ಅರ್ಚಕರು: <strong>{result.gokarnaSankalpa.priestName}</strong> | ಫೋನ್: <strong>{result.gokarnaSankalpa.priestPhone}</strong>
                </div>
                <div style={{ fontSize: "9px", color: "#78350f" }}>{result.gokarnaSankalpa.templeAddress}</div>
              </div>
              <div
                style={{
                  border: "2px dashed #b45309",
                  borderRadius: "50%",
                  width: "55px",
                  height: "55px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "8px",
                  fontWeight: "bold",
                  color: "#78350f",
                  textAlign: "center"
                }}
              >
                GOKARNA<br />SEAL
              </div>
            </div>
          </div>

          {renderFooter()}
        </div>
      </div>
    );
  }

  // If Mode is MARANA (Demise, Soul Transition & Moksha)
  return (
    <div
      id="ayur-sanjeevini-pdf-template"
      className="ayur-sanjeevini-pdf-template"
      style={{
        width: "794px",
        background: "#fffbeb",
        color: "#451a03",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        boxSizing: "border-box"
      }}
    >
      {/* PAGE 1: Soul Transition & Moksha Realm */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          minHeight: "1123px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
          border: "6px solid #d97706",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pageBreakAfter: "always"
        }}
      >
        <div>
          {renderHeader(1, 3)}

          {/* Departed Soul Banner */}
          <div
            style={{
              background: "linear-gradient(90deg, #451a03 0%, #78350f 100%)",
              color: "#fef3c7",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                ದಿವಂಗತ ಪುಣ್ಯಾತ್ಮ: {result.personName}
              </div>
              <div style={{ fontSize: "10px", opacity: 0.9 }}>
                ನಿರ್ಯಾಣ ದಿನಾಂಕ: {result.dobFormatted} | ಸಮಯ: {result.tobFormatted} | ಸ್ಥಳ: {result.pob}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px", fontWeight: "bold" }}>
              <div>ಗೋತ್ರ: {result.gotra}</div>
              <div>ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ: {result.nakshatra}</div>
            </div>
          </div>

          {/* Attained Soul Realm / Moksha Loka */}
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #b45309",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#92400e" }}>ಜೀವಾತ್ಮ ಸದ್ಗತಿ & ಲೋಕ ಪ್ರಾಪ್ತಿ (Soul Destination)</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#78350f", marginTop: "3px" }}>
              {result.mokshaGati.realmName}
            </div>
            <div style={{ fontSize: "9.5px", color: "#b45309", marginTop: "4px" }}>
              {result.mokshaGati.twelfthHouseInfluence}
            </div>
          </div>

          {/* Transition Astrological Factors */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #d97706",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
              🕊️ ಜೀವಾತ್ಮ ಮುಕ್ತಿ & ಸಂಚಿತ ಕರ್ಮ ಸ್ಥಿತಿ:
            </div>
            <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
              <div>• <strong>ಕಾರಕಾಂಶ ಕೇತು ಪ್ರಭಾವ:</strong> {result.mokshaGati.karakamsaKetuBala}</div>
              <div>• <strong>ಸಂಚಿತ ಕರ್ಮ ಶೇಷ:</strong> {result.mokshaGati.karmicDebtRemaining}</div>
              <div>• <strong>ಮೋಕ್ಷ ಪ್ರದಾಯಕ ಮಾರ್ಗ:</strong> {result.mokshaGati.pathwayToMoksha}</div>
            </div>
          </div>

          {/* AI Narrative Section */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "10px",
              fontSize: "10px",
              lineHeight: "1.5",
              color: "#78350f"
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>✨ ಸದ್ಗತಿ & ಪಿತೃ ಮೋಕ್ಷ ದೈವಿಕ ಸಂದೇಶ:</div>
            <p style={{ margin: 0 }}>{result.aiDivineNarrative || "ದಿವಂಗತ ಜೀವಾತ್ಮರಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪಿಂಡ ಪ್ರದಾನ ಹಾಗೂ ಗೋಕರ್ಣ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧದಿಂದ ಪರಮ ಮುಕ್ತಿ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ."}</p>
          </div>
        </div>

        {renderFooter()}
      </div>

      {/* PAGE 2: Transition Nakshatra, Panchaka & 16 Shradhas */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          minHeight: "1123px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
          border: "6px solid #d97706",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pageBreakAfter: "always"
        }}
      >
        <div>
          {renderHeader(2, 3)}

          {/* Transition Nakshatra & Panchaka Analysis */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #d97706",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
              🌌 ನಿರ್ಯಾಣ ನಕ್ಷತ್ರ & ಪಂಚಕ ವಿಶ್ಲೇಷಣೆ (Demise Nakshatra & Panchaka Analysis):
            </div>
            <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
              <div>• <strong>ಪಂಚಕ ವಿಧ:</strong> {result.transitionDosha.panchakaType}</div>
              <div>• <strong>ವಿವರಣೆ:</strong> {result.transitionDosha.doshaDescription}</div>
              <div>• <strong>ಶಾಂತಿ ಪರಿಹಾರ:</strong> {result.transitionDosha.prescribedParihara}</div>
              <div>• <strong>ಕುಟುಂಬ ರಕ್ಷಾ ಅವಧಿ:</strong> {result.transitionDosha.peacePeriodRecommendation}</div>
            </div>
          </div>

          {/* Tripindi & Narayana Bali Guidance */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #d97706",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
              🔱 ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ & ನಾರಾಯಣ ಬಲಿ ಮಾರ್ಗದರ್ಶಿ (Tripindi & Narayana Bali):
            </div>
            <div style={{ fontSize: "10px", color: "#451a03", lineHeight: "1.5" }}>
              <div>• <strong>ಪಿತೃ ಋಣ ಮಟ್ಟ:</strong> {result.pitruKarma.pitruRinaLevel.toUpperCase()}</div>
              <div>• <strong>ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ ಅಗತ್ಯತೆ:</strong> {result.pitruKarma.tripindiRequired ? "ಹೌದು - ತಕ್ಷಣ ಅಗತ್ಯವಿದೆ" : "ಸಾಮಾನ್ಯ ಶ್ರಾದ್ಧ ಸಾಕು"}</div>
              <div>• <strong>ನಾರಾಯಣ ಬಲಿ ಸೇವೆ:</strong> {result.pitruKarma.narayanaBaliRecommended ? "ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ" : "ಅಮಾವಾಸ್ಯೆ ತರ್ಪಣ ಸಾಕು"}</div>
              <div>• <strong>ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಸ್ಥಿತಿ:</strong> {result.pitruKarma.ancestralBlessingStatus}</div>
            </div>
          </div>

          {/* 16 Shradhas & Masika Timings */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #d97706",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
              🪔 ೧೬ ಶ್ರಾದ್ಧಗಳು & ಮಾಸಿಕ ತರ್ಪಣ ವೇಳಾಪಟ್ಟಿ (16 Shradha Schedule):
            </div>
            <div style={{ fontSize: "9.5px", color: "#451a03", lineHeight: "1.4" }}>
              <div>• <strong>೧ ರಿಂದ ೧೨ ದಿನಗಳು:</strong> ನಿತ್ಯ ತರ್ಪಣ, ದಶಗಾತ್ರ ಪಿಂಡ ಪ್ರದಾನ, ಏಕಾದಶಾಹ ಹಾಗೂ ಸಪಿಂಡೀಕರಣ ಶ್ರಾದ್ಧ.</div>
              <div>• <strong>ಮಾಸಿಕ ಶ್ರಾದ್ಧಗಳು:</strong> ಊನಮಾಸಿಕ, ದ್ವಿತೀಯಾದಿ ಮಾಸಿಕಗಳು (ಒಟ್ಟು ೧೬ ಮಾಸಿಕಗಳು) ಕಾಲಕ್ರಮದಲ್ಲಿ ಆಚರಣೆ.</div>
              <div>• <strong>ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ (ಆದ್ಯ ಶ್ರಾದ್ಧ):</strong> ಮರಣ ತಿಥಿಯಂದು ಪ್ರತಿ ವರ್ಷ ಬ್ರಾಹ್ಮಣ ಭೋಜನ ಹಾಗೂ ತರ್ಪಣ ಸೇವೆ.</div>
            </div>
          </div>
        </div>

        {renderFooter()}
      </div>

      {/* PAGE 3: Vamsha Shield & Gokarna Pitru Mukti Sevas */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          minHeight: "1123px",
          height: "1123px",
          padding: "24px",
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)",
          border: "6px solid #d97706",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {renderHeader(3, 3)}

          {/* Descendant Protection Shield */}
          <div
            style={{
              background: "#451a03",
              color: "#fef3c7",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#fde68a" }}>
              🛡️ ವಂಶ ರಕ್ಷಾ ಪಿತೃ ಗಾಯತ್ರಿ ಮಂತ್ರ:
            </div>
            <div style={{ fontSize: "12px", fontWeight: "bold", marginTop: "6px", lineHeight: "1.5" }}>
              {result.vamshaShield.vamshaProtectionMantra}
            </div>
            <div style={{ fontSize: "9.5px", marginTop: "6px", opacity: 0.9 }}>
              ಪ್ರತಿ ಅಮಾವಾಸ್ಯೆಯಂದು ೩ ಬಾರಿ ತರ್ಪಣ ನೀಡುವುದರಿಂದ ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಸಂತಾನ ಸೌಭಾಗ್ಯ ಪ್ರಾಪ್ತಿ.
            </div>
          </div>

          {/* Gokarna Kshetra Pitru Mukti Sevas */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #d97706",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "12px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f", marginBottom: "6px" }}>
              🕉️ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಕೋಟಿತೀರ್ಥದಲ್ಲಿ ನೆರವೇರಿಸಬೇಕಾದ ಪಿತೃ ಮುಕ್ತಿ ಸೇವೆಗಳು:
            </div>
            {result.gokarnaSankalpa.recommendedSevas.map((seva, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom: idx < result.gokarnaSankalpa.recommendedSevas.length - 1 ? "1px dashed #fcd34d" : "none",
                  paddingBottom: "6px",
                  marginBottom: "6px",
                  fontSize: "9.5px",
                  lineHeight: "1.4"
                }}
              >
                <div style={{ fontWeight: "bold", color: "#b45309" }}>{idx + 1}. {seva.title}</div>
                <div>ವಿವರ: {seva.description}</div>
                <div>ಪ್ರಶಸ್ತ ತಿಥಿ: <strong>{seva.idealTithi}</strong> | ಫಲ: {seva.significance}</div>
              </div>
            ))}
          </div>

          {/* Priest Authorization Seal */}
          <div
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "2px solid #b45309",
              borderRadius: "8px",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#78350f" }}>
                ಗೋಕರ್ಣ ಪಿತೃ ಮುಕ್ತಿ ಪ್ರಧಾನ ಅರ್ಚಕರ ದೃಢೀಕರಣ:
              </div>
              <div style={{ fontSize: "10px", color: "#92400e", marginTop: "2px" }}>
                ಅರ್ಚಕರು: <strong>{result.gokarnaSankalpa.priestName}</strong> | ಫೋನ್: <strong>{result.gokarnaSankalpa.priestPhone}</strong>
              </div>
              <div style={{ fontSize: "9px", color: "#78350f" }}>{result.gokarnaSankalpa.templeAddress}</div>
            </div>
            <div
              style={{
                border: "2px dashed #b45309",
                borderRadius: "50%",
                width: "55px",
                height: "55px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: "bold",
                color: "#78350f",
                textAlign: "center"
              }}
            >
              GOKARNA<br />PITRU
            </div>
          </div>
        </div>

        {renderFooter()}
      </div>
    </div>
  );
};
