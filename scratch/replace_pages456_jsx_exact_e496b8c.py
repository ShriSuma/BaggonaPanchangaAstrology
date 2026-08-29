filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 4:"
end_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC"

s_idx = content.find(start_marker)
e_idx = content.find(end_marker)

print(f"s_idx: {s_idx}, e_idx: {e_idx}")

new_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 4: CHARACTERISTICS, NEEGOODAH RAHASYA & PRASTUTA JEEVANA
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "18.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನದ ಹಂತ" : "Chapter 3: Personal Characteristics, Hidden Truth & Current Life Phase"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ನಕ್ಷತ್ರ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Comprehensive breakdown of personality traits, hidden karmic patterns, and current life phase."}
            </div>
          </div>

          {/* Content Stack - 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Characteristics (ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌟 {code === "kn" ? "ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು & ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Birth Characteristics & Personality Synthesis"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಸ್ವಭಾವ ಬಲ" : "Core Traits"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page4Data?.card1Text}
              </div>
            </div>

            {/* Card 2: Nigoodha Rahasya (ನಿಗೂಢ ರಹಸ್ಯ - ಗೋಪ್ಯ ಸತ್ಯ) */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "10px 14px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🔮 {code === "kn" ? "ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೋಪ" : "Nigoodha Rahasya: Inner Secret & Spiritual Remedy"}</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಆಂತರಿಕ ಶಮನ" : "Hidden Karma"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify" }}>
                {page4Data?.nigoodhaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FECDD3", paddingTop: "6px", fontWeight: 600 }}>
                🕊️ {page4Data?.nigoodhaText2}
              </div>
            </div>

            {/* Card 3: Prastuta Jeevana (ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌅 {code === "kn" ? "ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು" : "Prastuta Jeevana: Current Life Stage & 4 Key Pillars"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ವರ್ತಮಾನ ಘಟ್ಟ" : "Active Stage"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px", lineHeight: "1.5" }}>
                <div style={{ background: "#FEF3C7", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#065F46", display: "block", marginBottom: "2px" }}>💼 {code === "kn" ? "ವೃತ್ತಿ ಉದ್ಯೋಗ & ಅಧಿಕಾರ ಸ್ಥಾನ:" : "Career, Business & Position:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaCareer}</div>
                </div>
                <div style={{ background: "#F5F3FF", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px" }}>🏠 {code === "kn" ? "ಸಂಸಾರ, ದಾಂಪತ್ಯ & ಕುಟುಂಬ ಸುಖ:" : "Family, Marriage & Domestic Peace:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFamily}</div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#047857", display: "block", marginBottom: "2px" }}>💰 {code === "kn" ? "ಧನ-ಧಾನ್ಯ ಆಸ್ತಿ & ಆರ್ಥಿಕ ಭದ್ರತೆ:" : "Wealth, Finance & Assets:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFinance}</div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "6px 9px", borderRadius: "6px" }}>
                  <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px" }}>🌿 {code === "kn" ? "ಆರೋಗ್ಯ ದೈಹಿಕ ಶಕ್ತಿ & ಸಾತ್ವಿಕ ಸೌಖ್ಯ:" : "Health, Energy & Well-being:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaHealth}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: YOGAS, DOSHAS & LIVE GOCHARA TRANSITS
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು" : "Chapter 4: Planetary Yogas, Doshas & Live Gochara Transits"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ" : "In-depth breakdown of active Rajayogas, karmic challenges, and live Gochara transits."}
            </div>
          </div>

          {/* Content Stack - 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Card 1: Yogas (ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✨ {code === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ" : "Auspicious Rajayogas & Planetary Strengths"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ" : "Rajayogas"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.yogaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌟 {page5Data?.yogaText2}
              </div>
            </div>

            {/* Card 2: Doshas & Gokarna Remedy (ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ) */}
            <div style={{ background: "#FFF5F5", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚠️ {code === "kn" ? "ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ" : "Karmic Doshas & Gokarna Sacred Remedies"}</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ದೋಷ ಶಮನ" : "Karmic Remedies"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#7F1D1D", textAlign: "justify" }}>
                {page5Data?.doshaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#991B1B", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FECDD3", paddingTop: "8px", fontWeight: 600 }}>
                🕉️ {page5Data?.doshaText2}
              </div>
            </div>

            {/* Card 3: Live Gochara Transits (ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "12px 16px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🍃 {code === "kn" ? "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ" : "Live Gochara Transits & Present Position"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ವರ್ತಮಾನ ಗೋಚಾರ" : "Live Transits"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.gocharaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.65", color: "#3F2A12", textAlign: "justify", marginTop: "8px", borderTop: "1px solid #FDE68A", paddingTop: "8px" }}>
                🌿 {page5Data?.gocharaText2}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 8 MONTHS (240 DAYS) ROADMAP (2 COLUMNS x 4 ROWS)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "7px", padding: "16px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#78350F", lineHeight: "1.2" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
            </div>
          </div>

          {/* Special Sandhi / Transition Alert Banner */}
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #EF4444",
            borderRadius: "7px",
            padding: "5px 12px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ fontSize: "18px", transform: "translateY(-2px)" }}>⚡</div>
            <div style={{ fontSize: "11px", color: "#991B1B", lineHeight: "1.4", transform: "translateY(-2px)" }}>
              <strong style={{ color: "#7F1D1D" }}>{code === "kn" ? "ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨೭):" : "Special Transit & Dasha Sandhi Awareness:"}</strong> {code === "kn" ? "ಗೋಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Maintain patience and regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 8-Month Detailed Grid (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {page6Data.map((m: any, i: number) => {
              const bgColors = ["#FFFFFF", "#ECFDF5", "#F5F3FF", "#FFFFFF", "#FEF2F2", "#ECFDF5", "#EFF6FF", "#FFFBEB"];
              const borderColors = ["#FCD34D", "#10B981", "#8B5CF6", "#FCD34D", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const textColors = ["#78350F", "#065F46", "#5B21B6", "#78350F", "#991B1B", "#065F46", "#1E40AF", "#78350F"];
              const badgeBgs = ["#FEF3C7", "#D1FAE5", "#EDE9FE", "#FEF3C7", "#FEE2E2", "#D1FAE5", "#DBEAFE", "#FEF3C7"];
              const badgeBorders = ["#F59E0B", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const badgeColors = ["#92400E", "#065F46", "#5B21B6", "#92400E", "#991B1B", "#065F46", "#1E40AF", "#92400E"];

              return (
                <div key={i} style={{ background: bgColors[i % 8], border: `1.5px solid ${borderColors[i % 8]}`, borderRadius: "7px", padding: "8px 10px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 800, color: textColors[i % 8], marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "11px", background: badgeBgs[i % 8], border: `1px solid ${badgeBorders[i % 8]}`, color: badgeColors[i % 8], padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                      <span style={{ transform: "translateY(-4px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", lineHeight: "1.4", color: textColors[i % 8] }}>
                    <div style={{ marginBottom: "2px" }}>1. <strong style={{ color: "#065F46" }}>{code === "kn" ? "ಫಲಾಫಲ:" : "Vibe:"}</strong> {m.f1}</div>
                    <div style={{ marginBottom: "2px" }}>2. <strong style={{ color: "#92400E" }}>{code === "kn" ? "ಉದ್ಯೋಗ/ಆರ್ಥಿಕ:" : "Focus:"}</strong> {m.f2}</div>
                    <div style={{ marginBottom: "2px" }}>3. <strong style={{ color: "#D97706" }}>{code === "kn" ? "ಸವಾಲು:" : "Caution:"}</strong> {m.f3}</div>
                    <div>4. <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ಮಾರ್ಗದರ್ಶನ:" : "Remedy:"}</strong> {m.f4}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "7px",
            padding: "6px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.3" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.25" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>
'''

if s_idx != -1 and e_idx != -1:
    new_content = content[:s_idx] + new_jsx + "\n\n      " + content[e_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced Pages 4, 5, 6 with exact e496b8c layout and dynamic bindings successfully.")
