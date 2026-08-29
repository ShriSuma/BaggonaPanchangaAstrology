import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Page 3 top-right capsule badge text lift to use inner span with translateY(-3px)
# Revert outer badge style to clean standard padding "3px 12px" without translateY on container
old_badge_pattern = r'''<span style=\{\{
\s*fontSize: "11px",
\s*color: "#92400E",
\s*background: "#FEF3C7",
\s*border: "1px solid #F59E0B",
\s*padding: "3px 12px",
\s*borderRadius: "14px",
\s*fontWeight: 700,
\s*display: "inline-flex",
\s*alignItems: "center",
\s*lineHeight: "1\.2",
\s*transform: "translateY\(-4px\)"
\s*\}\}>([^<]+)</span>'''

new_badge_replacement = r'''<span style={{
                  fontSize: "11px",
                  color: "#92400E",
                  background: "#FEF3C7",
                  border: "1px solid #F59E0B",
                  padding: "3px 12px",
                  borderRadius: "14px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  lineHeight: "1.2"
                }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>\1</span></span>'''

content = re.sub(old_badge_pattern, new_badge_replacement, content)

# 2. Replace Page 7 JSX accurately
old_page7_start = "      {/* ─────────────────────────────────────────────────────────────\n          PAGE 7: EXACT MATCH TO PDF (45) PAGE 7\n         ───────────────────────────────────────────────────────────── */}"
old_page8_start = "      {/* ─────────────────────────────────────────────────────────────\n          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8\n         ───────────────────────────────────────────────────────────── */}"

idx_page7 = content.find(old_page7_start)
idx_page8 = content.find(old_page8_start)

if idx_page7 != -1 and idx_page8 != -1:
    new_page7_block = '''      {/* ─────────────────────────────────────────────────────────────
          PAGE 7: ROYAL 90-DAY CALENDAR SYNC & QR REDIRECTION GUIDE
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px" }}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "10px 16px",
            borderRadius: "12px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "16.5px", fontWeight: 800, textTransform: "uppercase", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).chapterTitle}
            </div>
            <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 600, marginTop: "2px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).subTitle}
            </div>
          </div>

          {/* Section 1: Personalized 90-Day Calendar Speciality Intro */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroHeader}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).personalIntroText}
            </div>
          </div>

          {/* Section 2: Royal Gold Scannable QR Code Box */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 18px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            {qrDataUrl ? (
              <div>
                <img 
                  src={qrDataUrl} 
                  alt="90-Day Calendar Sync QR Code" 
                  style={{ 
                    width: "190px", 
                    height: "190px", 
                    border: "2.5px solid #B45309", 
                    borderRadius: "12px", 
                    padding: "6px",
                    background: "#FFFFFF",
                    boxShadow: "0 3px 10px rgba(120, 53, 15, 0.15)"
                  }} 
                />
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginTop: "8px" }}>
                  {(PAGE7_DICT[code] || PAGE7_DICT.en).qrCaption}
                </div>
              </div>
            ) : (
              <div style={{ padding: "30px", color: "#B45309", fontSize: "13px", fontWeight 700 }}>
                📲 ೯೦-ದಿನಗಳ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಸಿದ್ಧಗೊಳ್ಳುತ್ತಿದೆ...
              </div>
            )}
          </div>

          {/* Section 3: Line-by-Line Installation Instructions */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight 800, color: "#78350F", marginBottom: "6px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).installHeader}
            </div>
            <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div>📲 {(PAGE7_DICT[code] || PAGE7_DICT.en).step1}</div>
              <div>📅 {(PAGE7_DICT[code] || PAGE7_DICT.en).step2}</div>
              <div>🔔 {(PAGE7_DICT[code] || PAGE7_DICT.en).step3}</div>
            </div>
          </div>

          {/* Section 4: Daily Calendar Event URL Redirection Guide */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)",
            border: "1.5px solid #B45309",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectHeader}
            </div>
            <div style={{ fontSize: "11.5px", lineHeight: "1.6", color: "#451A03", textAlign: "justify", fontWeight: 600 }}>
              {(PAGE7_DICT[code] || PAGE7_DICT.en).urlRedirectText}
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
      </div>\n\n'''
    content = content[:idx_page7] + new_page7_block + content[idx_page8:]
    print("Replaced Page 7 using exact string indices successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Page 7 redesign and Page 3 badge text lift fix successfully!")
