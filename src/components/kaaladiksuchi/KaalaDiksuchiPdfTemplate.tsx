import React from "react";
import type { KaalaDiksuchiResult } from "../../features/kaaladiksuchi/kaaladiksuchiTypes";
import type { PriestProfile } from "../../features/seva/sevaPriestDirectory";

export type KaalaDiksuchiPdfTemplateProps = {
  result: KaalaDiksuchiResult;
  lang?: string;
  priest?: PriestProfile;
};

const GOLD_GRAD = "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)";
const GOLD_LIGHT = "#FEF3C7";
const GOLD_BORDER = "#F59E0B";
const PANEL_BG = "#FFFBEB";
const TEXT_DARK = "#1E1B4B";
const TEXT_MUTED = "#475569";

export const KaalaDiksuchiPdfTemplate: React.FC<KaalaDiksuchiPdfTemplateProps> = ({
  result,
  lang = "kn",
  priest
}) => {
  const code = (lang || "kn").slice(0, 2);
  const isKn = code === "kn";
  const priestName = (priest?.name as Record<string, string>)?.[code] || priest?.name?.kn || "ಶ್ರೀ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್";
  const priestTitle = (priest?.title as Record<string, string>)?.[code] || priest?.title?.kn || "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರು";
  const priestPhone = "+91 99723 39362";

  return (
    <div
      id="kaala-diksuchi-pdf-container"
      style={{
        width: "794px",
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        background: "#FFFDF7",
        fontFamily: "'Noto Serif Kannada', 'Noto Sans Devanagari', 'Noto Sans Telugu', 'Noto Sans Tamil', 'Segoe UI', serif, sans-serif",
        color: TEXT_DARK,
        boxSizing: "border-box"
      }}
    >
      {/* ================= PAGE 1: COSMIC MATRIX & GRAHA KUNDLI ================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          boxSizing: "border-box",
          padding: "36px 40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFDF7",
          borderBottom: "2px dashed #D97706"
        }}
      >
        <div>
          {/* Header Banner */}
          <div
            style={{
              background: GOLD_GRAD,
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "center",
              color: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(180,83,9,0.15)",
              border: `2px solid ${GOLD_BORDER}`
            }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "normal", color: "#FDE68A", fontWeight: 700 }}>
              ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥
            </div>
            <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px", letterSpacing: "normal" }}>
              {isKn ? "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ — ಜನ್ಮ ಸಮಯ ರಹಿತ ಜ್ಯೋತಿಷ್ಯ ರೇಖಾಚಿತ್ರ" : "Divya Kaala Diksuchi — Cosmic Life Blueprint"}
            </div>
            <div style={{ fontSize: "11px", color: "#FEF3C7", marginTop: "2px" }}>
              {isKn ? "ಸೂರ್ಯ ಸಿದ್ಧಾಂತ, ಸಾಮುದ್ರಿಕ ಲಕ್ಷಣ, ಸಂಖ್ಯಾ ಶಾಸ್ತ್ರ & ಆಧುನಿಕ ಕಾಲಜ್ಞಾನ" : "Authentic Solar Epoch, Samudrika Signs, Numerology & Modern Life Strategy"}
            </div>
          </div>

          {/* Devotee Strip */}
          <div
            style={{
              marginTop: "16px",
              background: PANEL_BG,
              border: `1.5px solid ${GOLD_BORDER}`,
              borderRadius: "8px",
              padding: "12px 16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
              fontSize: "11.5px"
            }}
          >
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಜಾತಕರ ಹೆಸರು:" : "Name:"} </span>
              <strong>{result.input.personName}</strong>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಜನ್ಮ ದಿನಾಂಕ:" : "DOB:"} </span>
              <strong>{result.input.dob} ({result.birthDayOfWeek})</strong>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಸಂಖ್ಯಾ ತತ್ವ:" : "Numbers:"} </span>
              <strong>{result.rulingNumber} (ಮೂಲಾಂಕ) / {result.destinyNumber} (ಭಾಗ್ಯಾಂಕ)</strong>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಸೂರ್ಯ ರಾಶಿ:" : "Sun Sign:"} </span>
              <strong>{result.suryaRashi}</strong>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಚಂದ್ರ ರಾಶಿ ವಲಯ:" : "Moon Zone:"} </span>
              <strong>{result.chandraRashiEstimate}</strong>
            </div>
            <div>
              <span style={{ color: TEXT_MUTED }}>{isKn ? "ಸಾಮುದ್ರಿಕ ತತ್ವ:" : "Element:"} </span>
              <strong>{result.samudrika.dominantPlanet}</strong>
            </div>
          </div>

          {/* Planetary Matrix Table */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#92400E", borderBottom: "2px solid #F59E0B", paddingBottom: "4px", marginBottom: "10px" }}>
              {isKn ? "೧. ದಿವ್ಯ ಗ್ರಹ ಮಂಡಲ ಸ್ಥಿತಿ (ಮಧ್ಯಾಹ್ನ ಸೌರ ಬಿಂಬ ಗಣನೆ)" : "1. Planetary Cosmic Placements (Solar Epoch)"}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#FDE68A", color: "#78350F" }}>
                  <th style={{ padding: "6px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಗ್ರಹ" : "Planet"}</th>
                  <th style={{ padding: "6px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ರಾಶಿ" : "Rashi"}</th>
                  <th style={{ padding: "6px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಅಂಶ" : "Degree"}</th>
                  <th style={{ padding: "6px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಸ್ಥಾನ ಬಲ" : "Dignity"}</th>
                  <th style={{ padding: "6px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಕಾರಕತ್ವ" : "Significance"}</th>
                </tr>
              </thead>
              <tbody>
                {result.planets.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "#FFFFFF" : "#FFFBEB" }}>
                    <td style={{ padding: "6px 8px", border: "1px solid #FDE68A", fontWeight: 700 }}>{p.name}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #FDE68A" }}>{p.rashi}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #FDE68A" }}>{p.degree.toFixed(2)}°</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #FDE68A", color: p.dignity === "Exalted" ? "#059669" : p.dignity === "Own Sign" ? "#D97706" : "#4B5563", fontWeight: 600 }}>{p.dignity}</td>
                    <td style={{ padding: "6px 8px", border: "1px solid #FDE68A" }}>{p.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Elemental Composition Visualizer */}
          <div style={{ marginTop: "20px", background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400E", marginBottom: "8px" }}>
              {isKn ? "ಪಂಚಮಹಾಭೂತ ತತ್ವ ವಿನ್ಯಾಸ (Elemental Blueprint)" : "Elemental Nature Composition"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", textAlign: "center", fontSize: "11px" }}>
              <div style={{ padding: "8px", background: "#FEF2F2", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ fontWeight: 700, color: "#DC2626" }}>🔥 {isKn ? "ಅಗ್ನಿ (Fire)" : "Fire"}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.fire}%</div>
              </div>
              <div style={{ padding: "8px", background: "#FEFCE8", borderRadius: "6px", border: "1px solid #FEF08A" }}>
                <div style={{ fontWeight: 700, color: "#CA8A04" }}>⛰️ {isKn ? "ಪೃಥ್ವಿ (Earth)" : "Earth"}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.earth}%</div>
              </div>
              <div style={{ padding: "8px", background: "#F0FDF4", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ fontWeight: 700, color: "#16A34A" }}>💨 {isKn ? "ವಾಯು (Air)" : "Air"}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.air}%</div>
              </div>
              <div style={{ padding: "8px", background: "#EFF6FF", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ fontWeight: 700, color: "#2563EB" }}>🌊 {isKn ? "ಜಲ (Water)" : "Water"}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.water}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: "8px", fontSize: "9.5px", color: TEXT_MUTED }}>
          <span>{isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ — ಅಧಿಕೃತ ಕಾಲ ದಿಕ್ಸೂಚಿ" : "Baggona Panchanga Astrology — Certified Cosmic Blueprint"}</span>
          <span>{isKn ? "ಪುಟ ೧ / ೩" : "Page 1 of 3"}</span>
        </div>
      </div>

      {/* ================= PAGE 2: MODERN WORLD ALIGNMENT ================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          boxSizing: "border-box",
          padding: "36px 40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFDF7",
          borderBottom: "2px dashed #D97706"
        }}
      >
        <div>
          <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "6px", marginBottom: "16px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F" }}>
              {isKn ? "೨. ವರ್ತಮಾನ ಜಗತ್ತು & ಆಧುನಿಕ ಮಾನವ ಜೀವನ ದಿಕ್ಸೂಚಿ" : "2. Modern World & Human Evolution Guide"}
            </div>
            <div style={{ fontSize: "11px", color: TEXT_MUTED }}>
              {isKn ? "ವೇಗವಾಗಿ ಓಡುತ್ತಿರುವ ಇಂದಿನ ಜಗತ್ತಿನಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಯಶಸ್ಸಿನ ತಂತ್ರಜ್ಞಾನ" : "Navigating the High-Velocity Automated Era with Vedic Discernment"}
            </div>
          </div>

          {/* Resonance Badge */}
          <div style={{ background: GOLD_LIGHT, border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400E" }}>
                {isKn ? "ಆಧುನಿಕ ಜಗತ್ತಿನ ಹೊಂದಾಣಿಕೆ ಸಾಮರ್ಥ್ಯ (Resonance Quotient)" : "Modern World Resonance Quotient"}
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#B45309" }}>
                {result.modernWorld.userResonanceScore}%
              </div>
            </div>
            <p style={{ fontSize: "11.5px", marginTop: "6px", lineHeight: 1.5, color: TEXT_DARK }}>
              {result.modernWorld.userStandingInModernEra}
            </p>
          </div>

          {/* Current Global Macro Trend */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
              🌐 {isKn ? "ಪ್ರಸ್ತುತ ಜಾಗತಿಕ ಪ್ರವೃತ್ತಿ & ಕಾಲಮಾನ" : "Current Global Macro Climate"}
            </div>
            <p style={{ fontSize: "11px", lineHeight: 1.5, color: TEXT_DARK }}>
              {result.modernWorld.currentGlobalTrend}
            </p>
          </div>

          {/* Two-Column Vulnerabilities & Opportunities */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#BE123C", marginBottom: "6px" }}>
                ⚠️ {isKn ? "ಎಚ್ಚರಿಕೆ ವಹಿಸಬೇಕಾದ ಅಂಶಗಳು" : "Modern Vulnerabilities"}
              </div>
              <ul style={{ fontSize: "10.5px", paddingLeft: "16px", margin: 0, lineHeight: 1.5, color: "#881337" }}>
                {result.modernWorld.keyVulnerabilities.map((v, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{v}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#15803D", marginBottom: "6px" }}>
                🚀 {isKn ? "ಬೆಳವಣಿಗೆಯ ಮಹಾದ್ವಾರಗಳು" : "Growth Catalysts"}
              </div>
              <ul style={{ fontSize: "10.5px", paddingLeft: "16px", margin: 0, lineHeight: 1.5, color: "#14532D" }}>
                {result.modernWorld.growthOpportunities.map((o, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>{o}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                💼 {isKn ? "ವೃತ್ತಿ & ತಂತ್ರಜ್ಞಾನ ನಾಯಕತ್ವ" : "Career & Tech Synergy"}
              </div>
              <p style={{ fontSize: "10.5px", lineHeight: 1.45, color: TEXT_DARK, margin: 0 }}>
                {result.modernWorld.careerAndTechStrategy}
              </p>
            </div>
            <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px" }}>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                🧘 {isKn ? "ಡಿಜಿಟಲ್ ಸ್ವಾಸ್ಥ್ಯ & ಮಾನಸಿಕ ಶಾಂತಿ" : "Digital Wellness & Serenity"}
              </div>
              <p style={{ fontSize: "10.5px", lineHeight: 1.45, color: TEXT_DARK, margin: 0 }}>
                {result.modernWorld.digitalAndMentalWellness}
              </p>
            </div>
          </div>

          {/* Actionable Daily Habits */}
          <div style={{ background: PANEL_BG, border: `1px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "6px" }}>
              ⚡ {isKn ? "ಇಂದಿನಿಂದಲೇ ಅಳವಡಿಸಿಕೊಳ್ಳಬೇಕಾದ ದೈನಂದಿನ ಶಿಸ್ತು" : "Daily Micro-Habits for Peak Life Mastery"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5px", color: TEXT_DARK }}>
              {result.modernWorld.actionableHabitsForToday.map((h, idx) => (
                <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
                  <span style={{ color: "#D97706", fontWeight: 700 }}>✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: "8px", fontSize: "9.5px", color: TEXT_MUTED }}>
          <span>{isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ — ಆಧುನಿಕ ಜೀವನ ದಿಕ್ಸೂಚಿ" : "Baggona Panchanga Astrology — Modern World Life Guide"}</span>
          <span>{isKn ? "ಪುಟ ೨ / ೩" : "Page 2 of 3"}</span>
        </div>
      </div>

      {/* ================= PAGE 3: PRASHNA ORACLE & SANJEEVINI REMEDIES ================= */}
      <div
        className="pdf-page-a4"
        style={{
          width: "794px",
          height: "1123px",
          boxSizing: "border-box",
          padding: "36px 40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFFDF7"
        }}
      >
        <div>
          <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "6px", marginBottom: "16px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F" }}>
              {isKn ? "೩. ದಿವ್ಯ ಪ್ರಶ್ನ ಶಾಸ್ತ್ರ, ಪರಿಹಾರ ಹಾಗೂ ಗೋಕರ್ಣ ಆಶೀರ್ವಾದ" : "3. Horary Prashna Oracle, Daily Remedies & Blessings"}
            </div>
            <div style={{ fontSize: "11px", color: TEXT_MUTED }}>
              {isKn ? "ತ್ವರಿತ ಪ್ರಶ್ನೆ ಫಲಶ್ರುತಿ & ದೈನಂದಿನ ದೈವಿಕ ಸಂರಕ್ಷಣಾ ಕವಚ" : "Instant Cosmic Horary Oracle & Sacred Sanjeevini Prescription"}
            </div>
          </div>

          {/* Instant Prashna Box */}
          <div style={{ background: "#FFFFFF", border: `1.5px solid #F59E0B`, borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400E" }}>
                🔮 {isKn ? "ಕ್ಷಣಿಕ ಬ್ರಹ್ಮಾಂಡ ಪ್ರಶ್ನ ಲಗ್ನ ಫಲ" : "Instant Horary Cosmic Alignment"}
              </div>
              <span style={{ fontSize: "10.5px", background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                {result.prashnaOracle.prashnaLagna} Lagna · {result.prashnaOracle.prashnaNakshatra}
              </span>
            </div>
            <p style={{ fontSize: "11.5px", lineHeight: 1.5, color: TEXT_DARK, margin: "6px 0" }}>
              {result.prashnaOracle.directAnswer}
            </p>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>
              ⏳ {isKn ? "ಕಾಲಮಾನ ನಿರೀಕ್ಷೆ:" : "Timeline Estimate:"} {result.prashnaOracle.timelineEstimate}
            </div>
          </div>

          {/* Daily Sanjeevini Prescription */}
          <div style={{ background: PANEL_BG, border: "1px solid #FCD34D", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#78350F", marginBottom: "10px" }}>
              🪔 {isKn ? "ದೈನಂದಿನ ಸಂಜೀವಿನಿ ರಕ್ಷಾ ಸೂತ್ರಗಳು (Personalized Remedies)" : "Sacred Daily Prescription"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ದೈನಂದಿನ ಸ್ತೋತ್ರ:" : "Daily Stotra:"} </span>
                <strong>{result.remedies.dailyStotra}</strong>
              </div>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಶುಭ ದಿನಗಳು:" : "Lucky Days:"} </span>
                <strong>{result.remedies.luckyDays.join(", ")}</strong>
              </div>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಶುಭ ವರ್ಣಗಳು:" : "Lucky Colors:"} </span>
                <strong>{result.remedies.luckyColors.join(", ")}</strong>
              </div>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಶುಭ ಸಂಖ್ಯಾ ಬಲ:" : "Lucky Numbers:"} </span>
                <strong>{result.remedies.luckyNumbers.join(", ")}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ರತ್ನ / ರುದ್ರಾಕ್ಷಿ:" : "Gemstone / Rudraksha:"} </span>
                <strong>{result.remedies.gemstoneRecommendation}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪರಿಹಾರ:" : "Gokarna Kshetra Seva:"} </span>
                <strong>{result.remedies.sacredGokarnaRemedy}</strong>
              </div>
            </div>
          </div>

          {/* Priest Seal & Counseling Contact */}
          <div
            style={{
              background: "#FFFFFF",
              border: `2px solid ${GOLD_BORDER}`,
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#78350F" }}>
                🕉️ {priestName}
              </div>
              <div style={{ fontSize: "11px", color: TEXT_MUTED, marginTop: "2px" }}>
                {priestTitle}
              </div>
              <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 700, marginTop: "4px" }}>
                📞 {isKn ? "ನೇರ ಮುಹೂರ್ತ ಸಮಾಲೋಚನೆಗೆ ಕರೆ ಮಾಡಿ:" : "Direct Priest Consultation:"} {priestPhone}
              </div>
            </div>
            <div
              style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                border: "2px dashed #B45309",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#FEF3C7",
                textAlign: "center",
                padding: "4px"
              }}
            >
              <span style={{ fontSize: "20px" }}>🕉️</span>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#78350F", marginTop: "2px" }}>
                ಅಧಿಕೃತ ಮುದ್ರೆ
              </span>
            </div>
          </div>
        </div>

        {/* Page 3 Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: "8px", fontSize: "9.5px", color: TEXT_MUTED }}>
          <span>{isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿ — ಬಗ್ಗೋಣ ಪಂಚಾಂಗ" : "Sri Gokarna Kshetra — Baggona Panchanga"}</span>
          <span>{isKn ? "ಪುಟ ೩ / ೩" : "Page 3 of 3"}</span>
        </div>
      </div>
    </div>
  );
};
