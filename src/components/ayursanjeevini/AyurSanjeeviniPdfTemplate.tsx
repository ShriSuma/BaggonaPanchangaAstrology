import React from "react";
import type { SupportedLanguage } from "../../stores/appStore";
import type { AyurSanjeeviniResult } from "../../features/ayursanjeevini/ayurSanjeeviniTypes";
import { T_AYUR_SANJEEVINI } from "../../features/ayursanjeevini/ayurSanjeeviniLocale";

interface AyurSanjeeviniPdfTemplateProps {
  result: AyurSanjeeviniResult;
  lang: SupportedLanguage;
}

export const AyurSanjeeviniPdfTemplate: React.FC<AyurSanjeeviniPdfTemplateProps> = ({
  result,
  lang
}) => {
  const isKn = lang === "kn";
  const sanitize = (text?: string) => text?.replace(/\*\*/g, "").trim() || "";

  return (
    <div
      id="ayur-sanjeevini-pdf"
      style={{
        width: "794px",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "'Segoe UI', Roboto, 'Noto Sans Kannada', sans-serif"
      }}
    >
      {/* ================================= PAGE 1 ================================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "36px",
          boxSizing: "border-box",
          position: "relative",
          background: "#fffdfa",
          border: "8px double #b45309",
          pageBreakAfter: "always",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {/* Royal Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "2px solid #b45309",
              paddingBottom: "12px",
              marginBottom: "16px"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#92400e", letterSpacing: "1.5px" }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಸನ್ನಿಧಾನಂ ॥
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "900", color: "#78350f", margin: "4px 0" }}>
              {T_AYUR_SANJEEVINI.pageTitle[lang]}
            </h1>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#b45309" }}>
              {result.mode === "janma"
                ? "ದೈವಿಕ ಜನ್ಮ ಆಯುರ್ದಾಯ, ಗಂಡಾಂತ-ಮಾರಕ ಶಮನ ಹಾಗೂ ಸಂಜೀವಿನಿ ಮಹಾರಕ್ಷಾ ವರದಿ"
                : "ಜೀವಾತ್ಮ ಪ್ರಯಾಣ, ಸದ್ಗತಿ ಲೋಕ ನಿರ್ಣಯ ಹಾಗೂ ಪಿತೃ ಮೋಕ್ಷ ಸಂಕಲ್ಪ ವರದಿ"}
            </div>
          </div>

          {/* Devotee Info Box */}
          <div
            style={{
              background: "#fef3c7",
              border: "1.5px solid #d97706",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              fontSize: "11px"
            }}
          >
            <div>
              <strong>{isKn ? "ವ್ಯಕ್ತಿಯ ಹೆಸರು:" : "Name:"}</strong> {result.personName}
            </div>
            <div>
              <strong>{isKn ? "ದಿನಾಂಕ:" : "Date:"}</strong> {result.dobFormatted} ({result.tobFormatted})
            </div>
            <div>
              <strong>{isKn ? "ರಾಶಿ / ನಕ್ಷತ್ರ:" : "Rashi / Nakshatra:"}</strong> {result.rashi} / {result.nakshatra}
            </div>
            <div>
              <strong>{isKn ? "ಲಗ್ನ / ಗೋತ್ರ:" : "Lagna / Gotra:"}</strong> {result.lagnaRashi} / {result.gotra}
            </div>
          </div>

          {/* Section 1: Ayurdaya & Vitality Matrix */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "16px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🌟 ೧. ಆಯುರ್ದಾಯ ವರ್ಗೀಕರಣ & ಪ್ರಾಣ ಶಕ್ತಿ (Longevity & Vitality Matrix)
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ fontSize: "11px" }}>
                <strong>{isKn ? "ಆಯುರ್ದಾಯ ವರ್ಗ:" : "Longevity Class:"}</strong>{" "}
                <span style={{ color: "#b45309", fontWeight: "bold" }}>
                  {T_AYUR_SANJEEVINI.longevityClasses[result.longevity.category][lang]}
                </span>
                <br />
                <strong>{isKn ? "ಅಂದಾಜು ಆಯುಷ್ಯ ಶ್ರೇಣಿ:" : "Estimated Span:"}</strong> {result.longevity.estimatedAgeSpan}
              </div>
              <div
                style={{
                  background: "#b45309",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "12px",
                  textAlign: "center"
                }}
              >
                {isKn ? "ಪ್ರಾಣಶಕ್ತಿ ಸ್ಕೋರ್" : "Vitality Score"}
                <div style={{ fontSize: "16px" }}>{result.longevity.vitalityScore} / 100</div>
              </div>
            </div>
            <div style={{ fontSize: "10.5px", color: "#475569", lineHeight: "1.5" }}>
              • {result.longevity.threePairsMethod.lagnaAndEighth}
              <br />• {result.longevity.threePairsMethod.moonAndSaturn}
              <br />• {result.longevity.ayushkarakaStrength}
            </div>
          </div>

          {/* Section 2: Gandanta & Balarishta Diagnostics */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              ⚖️ ೨. ಗಂಡಾಂತ ಸಂಧಿ & ಬಾಲಾರಿಷ್ಟ ವಿಶ್ಲೇಷಣೆ (Gandanta Assessment)
            </h2>
            <div style={{ fontSize: "11px", lineHeight: "1.6" }}>
              <strong>{isKn ? "ಗಂಡಾಂತ ಸ್ಥಿತಿ:" : "Gandanta Status:"}</strong>{" "}
              <span style={{ color: result.gandanta.hasGandanta ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>
                {result.gandanta.description}
              </span>
              <br />
              <strong>{isKn ? "ಶಾಂತಿ ಪರಿಹಾರ:" : "Prescribed Remedy:"}</strong> {result.gandanta.remedyRequired}
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div style={{ borderTop: "1px solid #d97706", paddingTop: "8px", fontSize: "9.5px", color: "#78350f", textAlign: "center" }}>
          ॥ ಪುಟ ೧/೩ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನಂ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಸನ್ನಿಧಾನಂ ॥
        </div>
      </div>

      {/* ================================= PAGE 2 ================================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "36px",
          boxSizing: "border-box",
          position: "relative",
          background: "#fffdfa",
          border: "8px double #b45309",
          pageBreakAfter: "always",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {/* Header Mini */}
          <div style={{ borderBottom: "1.5px solid #b45309", paddingBottom: "8px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#92400e" }}>
              {T_AYUR_SANJEEVINI.pageTitle[lang]} - {result.personName}
            </span>
            <span style={{ fontSize: "10px", color: "#b45309", fontWeight: "bold" }}>ಪುಟ ೨/೩</span>
          </div>

          {/* Section 3: Maraka & Badhaka Neutralization */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              ⚔️ ೩. ಮಾರಕ & ಬಾಧಕ ಗ್ರಹ ನಿರ್ಣಯ (Maraka & Badhaka Mitigation)
            </h2>
            <div style={{ fontSize: "11px", lineHeight: "1.6" }}>
              <strong>{isKn ? "ಮಾರಕ ಭಾವಗಳು / ಗ್ರಹರು:" : "Maraka Houses/Lords:"}</strong>{" "}
              {result.marakaBadhaka.marakaHouses.join(", ")} ({result.marakaBadhaka.marakaPlanets.join(", ")})
              <br />
              <strong>{isKn ? "ಬಾಧಕ ಸ್ಥಾನ & ಅಧಿಪತಿ:" : "Badhaka House & Lord:"}</strong>{" "}
              {result.marakaBadhaka.badhakaHouse}ನೇ ಭಾವ ({result.marakaBadhaka.badhadhipati})
              <br />
              <strong>{isKn ? "ದಶಾ ಸಂಧಿಕಾಲ ಎಚ್ಚರಿಕೆ:" : "Chhidra Dasha Alert:"}</strong>{" "}
              {result.marakaBadhaka.chhidraDashaAlert}
              <br />
              <strong>{isKn ? "ಪರಿಹಾರ ನಿರ್ದೇಶನ:" : "Mitigation Summary:"}</strong>{" "}
              {result.marakaBadhaka.mitigationSummary}
            </div>
          </div>

          {/* Section 4: Karma Vipaka Root Causes */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🌌 ೪. ಕರ್ಮ ವಿಪಾಕ & ರೋಗ-ದೋಷ ಮೂಲ ಕಾರಣ (Karma Vipaka Root Causes)
            </h2>
            {result.karmaVipaka.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fefce8",
                  border: "1px solid #fde047",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  marginBottom: "8px",
                  fontSize: "10.5px"
                }}
              >
                <div style={{ fontWeight: "bold", color: "#854d0e" }}>
                  {idx + 1}. {item.ailmentOrChallenge} [{item.afflictedPlanet}]
                </div>
                <div style={{ color: "#334155" }}>
                  <strong>{isKn ? "ಕರ್ಮ ಕಾರಣ:" : "Cause:"}</strong> {item.karmicCause}
                </div>
                <div style={{ color: "#0f766e" }}>
                  <strong>{isKn ? "ಶಿಫಾರಸು ದಾನ & ಮಂತ್ರ:" : "Daana & Mantra:"}</strong> {item.recommendedDaana} | {item.prescribedMantra}
                </div>
              </div>
            ))}
          </div>

          {/* Section 5: Maha Mrityunjaya Sanjeevini Shield */}
          <div
            style={{
              background: "#fef3c7",
              border: "1.5px solid #d97706",
              borderRadius: "10px",
              padding: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🛡️ ೫. ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಜೀವಿನಿ ಮಹಾಕವಚ (Maha Mrityunjaya Shield)
            </h2>
            <div style={{ background: "#78350f", color: "#ffffff", padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px" }}>
                {result.sanjeeviniShield.mrityunjayaMantra}
              </div>
            </div>
            <div style={{ fontSize: "10.5px", lineHeight: "1.5", color: "#78350f" }}>
              • <strong>{isKn ? "ದೈನಂದಿನ ಜಪ ಸಂಖ್ಯೆ:" : "Daily Japa Count:"}</strong> {result.sanjeeviniShield.recommendedJapaCount} ಬಾರಿ
              <br />• <strong>{isKn ? "ರುದ್ರಾಕ್ಷಿ ಧಾರಣೆ:" : "Rudraksha:"}</strong> {result.sanjeeviniShield.rudrakshaRecommendation}
              <br />• <strong>{isKn ? "ಆಯುಷ್ಯ ಸೂಕ್ತ ಹೋಮ:" : "Ayushya Homa:"}</strong> {result.sanjeeviniShield.ayushyaSuktaHomaDetails}
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div style={{ borderTop: "1px solid #d97706", paddingTop: "8px", fontSize: "9.5px", color: "#78350f", textAlign: "center" }}>
          ॥ ಪುಟ ೨/೩ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನಂ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಸನ್ನಿಧಾನಂ ॥
        </div>
      </div>

      {/* ================================= PAGE 3 ================================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          maxHeight: "1123px",
          padding: "36px",
          boxSizing: "border-box",
          position: "relative",
          background: "#fffdfa",
          border: "8px double #b45309",
          pageBreakAfter: "avoid",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          {/* Header Mini */}
          <div style={{ borderBottom: "1.5px solid #b45309", paddingBottom: "8px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#92400e" }}>
              {T_AYUR_SANJEEVINI.pageTitle[lang]} - {result.personName}
            </span>
            <span style={{ fontSize: "10px", color: "#b45309", fontWeight: "bold" }}>ಪುಟ ೩/೩</span>
          </div>

          {/* Section 6: Soul Moksha Realm */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🕊️ ೬. ಸದ್ಗತಿ & ಮೋಕ್ಷ ಲೋಕ ನಿರ್ಣಯ (Soul Gati & Moksha Realm)
            </h2>
            <div style={{ fontSize: "11px", lineHeight: "1.6" }}>
              <strong>{isKn ? "ಸದ್ಗತಿ ಲೋಕ ಪ್ರಾಪ್ತಿ:" : "Attained Loka:"}</strong>{" "}
              <span style={{ color: "#047857", fontWeight: "bold" }}>
                {T_AYUR_SANJEEVINI.lokaRealms[result.mokshaGati.soulRealm][lang]}
              </span>
              <br />
              <strong>{isKn ? "೧೨ನೇ ಭಾವ & ಮುಕ್ತಿ ಪ್ರಭಾವ:" : "12th House Influence:"}</strong>{" "}
              {result.mokshaGati.twelfthHouseInfluence}
              <br />
              <strong>{isKn ? "ಮೋಕ್ಷ ಮಾರ್ಗ ಸಾಧನೆ:" : "Pathway to Moksha:"}</strong>{" "}
              {result.mokshaGati.pathwayToMoksha}
            </div>
          </div>

          {/* Section 7: Pitru Peace & Descendant Shield */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #f59e0b",
              borderRadius: "10px",
              padding: "14px",
              marginBottom: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🪔 ೭. ಪಿತೃ ಋಣ & ವಂಶ ಶಾಂತಿ ಪರಿಹಾರ (Pitru Rina & Ancestral Peace)
            </h2>
            <div style={{ fontSize: "10.5px", lineHeight: "1.5" }}>
              <strong>{isKn ? "ಪೂರ್ವಜರ ಆಶೀರ್ವಾದ ಸ್ಥಿತಿ:" : "Ancestral Blessing Status:"}</strong>{" "}
              {result.pitruKarma.ancestralBlessingStatus}
              <br />
              {result.pitruKarma.remedies.map((rem, i) => (
                <div key={i} style={{ color: "#334155" }}>
                  • {rem}
                </div>
              ))}
            </div>
          </div>

          {/* Section 8: Gokarna Temple Sevas & Priest Authorization */}
          <div
            style={{
              background: "#fef3c7",
              border: "2px solid #b45309",
              borderRadius: "10px",
              padding: "14px"
            }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: "800", color: "#92400e", margin: "0 0 8px 0" }}>
              🕉️ ೮. ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸಂಕಲ್ಪ & ಅರ್ಚಕರ ಸೇವಾ ವಿವರ (Gokarna Sevas)
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px", fontSize: "10.5px", marginBottom: "10px" }}>
              {result.gokarnaSankalpa.recommendedSevas.map((seva, sIdx) => (
                <div key={sIdx} style={{ background: "#ffffff", padding: "6px 10px", borderRadius: "6px", border: "1px solid #fde68a" }}>
                  <strong>{seva.title}</strong> - {seva.description} ({seva.significance})
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #b45309", paddingTop: "8px" }}>
              <div style={{ fontSize: "10.5px", color: "#78350f" }}>
                <strong>{isKn ? "ಪ್ರಾಮಾಣೀಕೃತ ಅರ್ಚಕರು:" : "Authorized Priest:"}</strong> {result.gokarnaSankalpa.priestName}
                <br />
                <strong>{isKn ? "ಸಂಪರ್ಕ ದೂರವಾಣಿ:" : "Priest Phone:"}</strong> {result.gokarnaSankalpa.priestPhone}
                <br />
                <strong>{isKn ? "ದೇವಸ್ಥಾನ ವಿಳಾಸ:" : "Address:"}</strong> {result.gokarnaSankalpa.templeAddress}
              </div>
              <div
                style={{
                  border: "2px solid #92400e",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  textAlign: "center",
                  background: "#ffffff"
                }}
              >
                <div style={{ fontSize: "14px" }}>🕉️</div>
                <div style={{ fontSize: "9px", fontWeight: "bold", color: "#92400e" }}>
                  {isKn ? "ಗೋಕರ್ಣ ಸನ್ನಿಧಿ ಮುದ್ರೆ" : "Gokarna Sacred Seal"}
                </div>
              </div>
            </div>
          </div>

          {/* AI Synthesis Box */}
          {result.aiDivineNarrative && (
            <div style={{ marginTop: "12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px", fontSize: "10px", color: "#334155", fontStyle: "italic" }}>
              {sanitize(result.aiDivineNarrative)}
            </div>
          )}
        </div>

        {/* Page 3 Footer */}
        <div style={{ borderTop: "1px solid #d97706", paddingTop: "8px", fontSize: "9.5px", color: "#78350f", textAlign: "center" }}>
          ॥ ಪುಟ ೩/೩ • ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದರ್ಶನಂ • ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಸನ್ನಿಧಾನಂ ॥
        </div>
      </div>
    </div>
  );
};
