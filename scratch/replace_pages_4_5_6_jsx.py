import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Page 4, Page 5, and Page 6 sections in RoyalBooklet8PageTemplate.tsx
pattern = re.compile(
    r'\{\/\* ─+\n\s*PAGE 4: EXACT MATCH TO PDF \(45\) PAGE 4.*?\n\s*\{\/\* ─+\n\s*PAGE 7: ROYAL 90-DAY CALENDAR SYNC',
    re.DOTALL
)

new_pages_4_5_6_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 4: 100% DYNAMIC NATAL PLANETS, YOGAS & DOSHAS ANALYSIS
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೩: ಜನ್ಮ ಕುಂಡಲಿ ಗ್ರಹ ಸ್ಥಿತಿ, ಯೋಗಗಳು ಹಾಗೂ ದೋಷ ವಿಶ್ಲೇಷಣೆ" : "Chapter 3: Natal Planetary Positions, Yogas & Karmic Analysis"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜಾತಕದ ನವಗ್ರಹಗಳ ಸ್ಥಾನ ಬಲ, ಸಿದ್ಧಿಸಿರುವ ಶುಭ ಯೋಗಗಳು ಹಾಗೂ ದೋಷ ಶಮನ ಮಾರ್ಗದರ್ಶನ" : "Detailed breakdown of natal planets, active Yogas, and sacred Vedic remedies."}
            </div>
          </div>

          {/* 3 Main Analysis Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Natal Planets */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card1Title || "🌌 ಜನ್ಮ ಗ್ರಹಗಳ ಸ್ಥಿತಿ ಬಲ"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಸ್ಥಾನ ಬಲ" : "Natal Strength"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page4Data?.card1Text}
              </div>
            </div>

            {/* Card 2: Auspicious Yogas */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card2Title || "✨ ಪ್ರಮುಖ ಶುಭ ಯೋಗಗಳು"}</span>
                <span style={{ fontSize: "11px", color: "#78350F", background: "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)", border: "1px solid #D97706", padding: "2px 10px", borderRadius: "12px", fontWeight: 800 }}>{code === "kn" ? "ರಾಜಯೋಗ ಸಿದ್ಧಿ" : "Auspicious Yogas"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {page4Data?.yogas.map((y, idx) => (
                  <div key={idx} style={{ fontSize: "12.5px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", border: "1px solid #FCD34D", padding: "6px 12px", borderRadius: "6px" }}>
                    🌟 {y}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Karmic Doshas & Remedies */}
            <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page4Data?.card3Title || "🛡️ ಗ್ರಹ ದೋಷ ಶಮನ & ಪರಿಹಾರ"}</span>
                <span style={{ fontSize: "11px", color: "#991B1B", background: "#FEE2E2", border: "1px solid #F87171", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ದೋಷ ಶಾಂತಿ" : "Vedic Remedy"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                {page4Data?.doshas.map((d, idx) => (
                  <div key={idx} style={{ fontSize: "12px", color: "#7F1D1D", fontWeight: 600 }}>
                    • {d}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: 700, background: "#FFFFFF", border: "1px solid #FCA5A5", padding: "6px 10px", borderRadius: "6px" }}>
                🕉️ {code === "kn" ? "ಸಿದ್ಧ ಪರಿಹಾರ:" : "Remedy:"} {page4Data?.remedy}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: 100% DYNAMIC PRESENT DASHA-BHUKTI & GOCHARA TRANSITS
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Header Box */}
          <div style={{ textAlign: "center", background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)", border: "2px solid #D97706", borderRadius: "8px", padding: "6px 12px", boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)" }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೪: ವರ್ತಮಾನ ದಶಾ-ಭುಕ್ತಿ ಫಲಗಳು ಹಾಗೂ ಗೋಚಾರ ವಿಶ್ಲೇಷಣೆ" : "Chapter 4: Active Dasha-Bhukti & Planetary Transits"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ವರ್ತಮಾನ ದಶಾ-ಅಂತರ್ದಶಾ ಅವಧಿಯ ನಿಖರ ಫಲಗಳು ಹಾಗೂ ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರ" : "In-depth synthesis of current planetary chapters and live Gochara transits."}
            </div>
          </div>

          {/* 3 Main Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Mahadasha */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card1Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಮಹಾ ಅಧ್ಯಾಯ" : "Major Chapter"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.card1Text}
              </div>
            </div>

            {/* Card 2: Antardasha */}
            <div style={{ background: "#FFFFFF", border: "1.5px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card2Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಅಂತರ್ದಶಾ ಅವಧಿ" : "Sub Period"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.card2Text}
              </div>
            </div>

            {/* Card 3: Gochara */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{page5Data?.card3Title}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ವರ್ತಮಾನ ಗೋಚಾರ" : "Live Transits"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginBottom: "8px" }}>
                {page5Data?.gocharaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                {page5Data?.gocharaText2}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "8px", padding: "8px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% DYNAMIC 8-MONTH PLANETARY ROADMAP (240 DAYS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "7px", padding: "16px" }}>
          {/* Header Box */}
          <div style={{ textAlign: "center", background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)", border: "2px solid #D97706", borderRadius: "8px", padding: "6px 12px", boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)" }}>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#78350F", lineHeight: "1.2" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
            </div>
          </div>

          {/* Transition Alert Banner */}
          <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "7px", padding: "5px 12px", boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>⚠️</span>
            <div style={{ fontSize: "11px", color: "#991B1B", fontWeight: 700, lineHeight: "1.3" }}>
              {code === "kn" ? "ವಿಶೇಷ ಸೂಚನೆ: ಮುಂಬರುವ ತಿಂಗಳುಗಳಲ್ಲಿ ಗ್ರಹ ಸಂಚಾರ ಬದಲಾವಣೆ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ತಾಳ್ಮೆ ಮತ್ತು ನಿರಂತರ ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Notice: Maintain patience and perform regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 8 Monthly Cards (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {page6Data.map((mCard, idx) => (
              <div key={idx} style={{ background: "#FFFDF7", border: "1.5px solid #FCD34D", borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🗓️ {mCard.mTitle}</span>
                  <span style={{ fontSize: "10.5px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    {mCard.badge}
                  </span>
                </div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", color: "#3F2A12" }}>
                  <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>{code === "kn" ? "ಫಲಾಫಲ:" : "Vibe:"}</strong> {mCard.f1}</div>
                  <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#047857" }}>{code === "kn" ? "ಸಾಧನೆ:" : "Focus:"}</strong> {mCard.f2}</div>
                  <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>{code === "kn" ? "ಸವಾಲು:" : "Caution:"}</strong> {mCard.f3}</div>
                  <div>4. <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ಮಾರ್ಗದರ್ಶನ:" : "Remedy:"}</strong> {mCard.f4}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Banner */}
          <div style={{ background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)", border: "1.5px solid #D97706", borderRadius: "7px", padding: "6px 12px", textAlign: "center", marginTop: "auto" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>\n\n\n      {/* {/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC'''

match = pattern.search(content)
if match:
    content = content[:match.start()] + new_pages_4_5_6_jsx + content[match.end():]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced Pages 4, 5, 6 JSX with dynamic data mapping successfully.")
else:
    print("Pattern match failed. Performing regex search...")
