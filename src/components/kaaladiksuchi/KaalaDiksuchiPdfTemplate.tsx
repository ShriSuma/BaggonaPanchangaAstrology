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
              {isKn ? "ದಿವ್ಯ ಕಾಲ ದಿಕ್ಸೂಚಿ — ಅಧಿಕೃತ ಜ್ಯೋತಿಷ್ಯ ರೇಖಾಚಿತ್ರ" : "Divya Kaala Diksuchi — Cosmic Life Blueprint"}
            </div>
            <div style={{ fontSize: "11px", color: "#FEF3C7", marginTop: "2px" }}>
              {isKn ? "ದಿಕ್ಸೂಚಿ, ಕಾಲ ಮುಹೂರ್ತ, ಗ್ರಹ ಮಂಡಲ, ಸಾಮುದ್ರಿಕ ಲಕ್ಷಣ & ಪರಿಹಾರ" : "Authentic Directional Compass, Kaala Timings, Planetary Matrix & Remedies"}
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
          <div style={{ marginTop: "18px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#92400E", borderBottom: "2px solid #F59E0B", paddingBottom: "4px", marginBottom: "8px" }}>
              {isKn ? "೧. ದಿವ್ಯ ಗ್ರಹ ಮಂಡಲ ಸ್ಥಿತಿ (ಮಧ್ಯಾಹ್ನ ಸೌರ ಬಿಂಬ ಗಣನೆ)" : "1. Planetary Cosmic Placements (Solar Epoch)"}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#FDE68A", color: "#78350F" }}>
                  <th style={{ padding: "5px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಗ್ರಹ" : "Planet"}</th>
                  <th style={{ padding: "5px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ರಾಶಿ" : "Rashi"}</th>
                  <th style={{ padding: "5px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಅಂಶ" : "Degree"}</th>
                  <th style={{ padding: "5px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಸ್ಥಾನ ಬಲ" : "Dignity"}</th>
                  <th style={{ padding: "5px 8px", border: "1px solid #FCD34D" }}>{isKn ? "ಕಾರಕತ್ವ" : "Significance"}</th>
                </tr>
              </thead>
              <tbody>
                {result.planets.map((p, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? "#FFFFFF" : "#FFFBEB" }}>
                    <td style={{ padding: "5px 8px", border: "1px solid #FDE68A", fontWeight: 700 }}>{p.name}</td>
                    <td style={{ padding: "5px 8px", border: "1px solid #FDE68A" }}>{p.rashi}</td>
                    <td style={{ padding: "5px 8px", border: "1px solid #FDE68A" }}>{p.degree.toFixed(2)}°</td>
                    <td style={{ padding: "5px 8px", border: "1px solid #FDE68A", color: p.dignity === "Exalted" ? "#059669" : p.dignity === "Own Sign" ? "#D97706" : "#4B5563", fontWeight: 600 }}>{p.dignity}</td>
                    <td style={{ padding: "5px 8px", border: "1px solid #FDE68A" }}>{p.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Elemental Composition Visualizer */}
          <div style={{ marginTop: "18px", background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E", marginBottom: "6px" }}>
              {isKn ? "ಪಂಚಮಹಾಭೂತ ತತ್ವ ವಿನ್ಯಾಸ (Elemental Blueprint)" : "Elemental Nature Composition"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", textAlign: "center", fontSize: "10.5px" }}>
              <div style={{ padding: "6px", background: "#FEF2F2", borderRadius: "6px", border: "1px solid #FECACA" }}>
                <div style={{ fontWeight: 700, color: "#DC2626" }}>🔥 {isKn ? "ಅಗ್ನಿ (Fire)" : "Fire"}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.fire}%</div>
              </div>
              <div style={{ padding: "6px", background: "#FEFCE8", borderRadius: "6px", border: "1px solid #FEF08A" }}>
                <div style={{ fontWeight: 700, color: "#CA8A04" }}>⛰️ {isKn ? "ಪೃಥ್ವಿ (Earth)" : "Earth"}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.earth}%</div>
              </div>
              <div style={{ padding: "6px", background: "#F0FDF4", borderRadius: "6px", border: "1px solid #BBF7D0" }}>
                <div style={{ fontWeight: 700, color: "#16A34A" }}>💨 {isKn ? "ವಾಯು (Air)" : "Air"}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.air}%</div>
              </div>
              <div style={{ padding: "6px", background: "#EFF6FF", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <div style={{ fontWeight: 700, color: "#2563EB" }}>🌊 {isKn ? "ಜಲ (Water)" : "Water"}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "2px" }}>{result.samudrika.elementalComposition.water}%</div>
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

      {/* ================= PAGE 2: DIKSUCHI COMPASS & TIMING MATRIX ================= */}
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
          <div style={{ borderBottom: "2px solid #D97706", paddingBottom: "6px", marginBottom: "14px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F" }}>
              {isKn ? "೨. ದಿವ್ಯ ದಿಕ್ಸೂಚಿ & ಕಾಲ ಮುಹೂರ್ತ ಮಾರ್ಗದರ್ಶಿ" : "2. Directional Compass & Timing Rhythm"}
            </div>
            <div style={{ fontSize: "11px", color: TEXT_MUTED }}>
              {isKn ? "ವೃತ್ತಿ, ಸಂಪತ್ತು, ಆರೋಗ್ಯ ದಿಕ್ಸೂಚಿ, ದಿಕ್ಶೂಲ ಹಾಗೂ ದಿನದ ಶುಭ ಕಾಲಾವಧಿ" : "Auspicious Directions, Daily Disha Shoola, Peak Prana Timing & Life Navigation"}
            </div>
          </div>

          {/* Directional Compass Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div style={{ background: PANEL_BG, border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
                💼 {isKn ? "ವೃತ್ತಿ & ಕಾರ್ಯ ದಿಕ್ಸೂಚಿ" : "Career Direction"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_DARK }}>
                {result.diksuchi.careerDirection.directionName}
              </div>
              <div style={{ fontSize: "10px", color: TEXT_MUTED, marginTop: "2px" }}>
                {result.diksuchi.careerDirection.practicalAdvice}
              </div>
            </div>

            <div style={{ background: PANEL_BG, border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
                💰 {isKn ? "ಧನಾಗಮನ & ಸಂಪತ್ತು ದಿಕ್ಸೂಚಿ" : "Wealth Direction"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_DARK }}>
                {result.diksuchi.wealthDirection.directionName}
              </div>
              <div style={{ fontSize: "10px", color: TEXT_MUTED, marginTop: "2px" }}>
                {result.diksuchi.wealthDirection.practicalAdvice}
              </div>
            </div>

            <div style={{ background: PANEL_BG, border: `1.5px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
                🧘 {isKn ? "ಆರೋಗ್ಯ & ಪ್ರಾಣಶಕ್ತಿ ದಿಕ್ಸೂಚಿ" : "Health Direction"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: TEXT_DARK }}>
                {result.diksuchi.healthMeditationDirection.directionName}
              </div>
              <div style={{ fontSize: "10px", color: TEXT_MUTED, marginTop: "2px" }}>
                {result.diksuchi.healthMeditationDirection.practicalAdvice}
              </div>
            </div>

            <div style={{ background: "#FFF1F2", border: `1.5px solid #FECDD3`, borderRadius: "8px", padding: "10px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#BE123C", marginBottom: "4px" }}>
                ⚠️ {isKn ? "ಇಂದಿನ ದಿನದ ದಿಕ್ಶೂಲ (ವರ್ಜ್ಯ)" : "Daily Disha Shoola"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#881337" }}>
                {result.diksuchi.dailyDishaShoola.afflictedDirection}
              </div>
              <div style={{ fontSize: "10px", color: "#9F1239", marginTop: "2px" }}>
                {result.diksuchi.dailyDishaShoola.classicalRemedy}
              </div>
            </div>
          </div>

          {/* Timing Rhythm Strip */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "6px" }}>
              ⏳ {isKn ? "ಇಂದಿನ ಕಾಲ ಮುಹೂರ್ತ ವಿನ್ಯಾಸ" : "Today's Cosmic Timing Window"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "10.5px" }}>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ:" : "Abhijit Muhurtha:"} </span>
                <strong>{result.diksuchi.timingRhythm.abhijitMuhurtha}</strong>
              </div>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ರಾಹು ಕಾಲ:" : "Rahu Kaala:"} </span>
                <strong>{result.diksuchi.timingRhythm.rahuKaal}</strong>
              </div>
              <div>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ಗುಳಿಕ ಕಾಲ:" : "Gulika Kaal:"} </span>
                <strong>{result.diksuchi.timingRhythm.gulikaKaal}</strong>
              </div>
              <div style={{ gridColumn: "1 / -1", marginTop: "2px" }}>
                <span style={{ color: TEXT_MUTED }}>{isKn ? "ದಿನದ ಶ್ರೇಷ್ಠ ಕಾರ್ಯ ಕಾಲ:" : "Peak Prana Window:"} </span>
                <strong style={{ color: "#B45309" }}>{result.diksuchi.timingRhythm.peakPranaWindow}</strong>
              </div>
            </div>
          </div>

          {/* Strategic Life Navigation */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
              🌟 {isKn ? "ವರ್ತಮಾನ ಜೀವನ ನಾಯಕತ್ವ ಸೂತ್ರ" : "Strategic Life Strategy"}
            </div>
            <p style={{ fontSize: "10.5px", lineHeight: 1.45, color: TEXT_DARK, margin: 0 }}>
              {result.modernWorld.careerAndTechStrategy}
            </p>
          </div>

          {/* Actionable Daily Habits */}
          <div style={{ background: PANEL_BG, border: `1px solid ${GOLD_BORDER}`, borderRadius: "8px", padding: "12px" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400E", marginBottom: "6px" }}>
              ⚡ {isKn ? "ದೈನಂದಿನ ಶಿಸ್ತು & ಯಶಸ್ಸಿನ ನಿಯಮಗಳು" : "Daily Micro-Habits"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10px", color: TEXT_DARK }}>
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
          <span>{isKn ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ — ದಿಕ್ಸೂಚಿ & ಕಾಲ ಮುಹೂರ್ತ" : "Baggona Panchanga Astrology — Diksuchi & Timings"}</span>
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
