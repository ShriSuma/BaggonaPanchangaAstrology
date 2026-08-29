import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix ALL Page 3 badges to have exact original outer padding "3px 12px" with NO translateY on container,
# and wrap the text inside with <span style={{ transform: "translateY(-3px)", display: "inline-block" }}>text</span>

# Card 1 Badge
content = content.replace(
    'transform: "translateY(-4px)"\n                }}>⚖️ ಸ್ಥಿರ ಕರ್ಮ & ವೃತ್ತಿ ಭದ್ರತೆ</span>',
    'lineHeight: "1.2"\n                }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>⚖️ ಸ್ಥಿರ ಕರ್ಮ & ವೃತ್ತಿ ಭದ್ರತೆ</span></span>'
)

# Card 3 Badge (Shukra Antardasha - Golden Card)
content = content.replace(
    'transform: "translateY(-4px)"\n                }}>👑 ಭವ್ಯ ರಾಜಯೋಗ & ಐಶ್ವರ್ಯ</span>',
    'lineHeight: "1.2"\n                }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>👑 ಭವ್ಯ ರಾಜಯೋಗ & ಐಶ್ವರ್ಯ</span></span>'
)

# Card 4 Badge (Surya Antardasha)
content = content.replace(
    'transform: "translateY(-4px)"\n                }}>🚩 ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ ಜಯ</span>',
    'lineHeight: "1.2"\n                }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>🚩 ಸರ್ಕಾರಿ ಗೌರವ & ಅಧಿಕಾರ ಜಯ</span></span>'
)

# Card 5 Badge (Chandra Antardasha)
content = content.replace(
    'transform: "translateY(-4px)"\n                }}>🌊 ಮನಃಶಾಂತಿ & ವಿದೇಶ ಪ್ರಯಾಣ</span>',
    'lineHeight: "1.2"\n                }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>🌊 ಮನಃಶಾಂತಿ & ವಿದೇಶ ಪ್ರಯಾಣ</span></span>'
)


# 2. Replace Page 7 block completely
# Find start of Page 7 and start of Page 8
p7_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: EXACT MATCH TO PDF (45) PAGE 7\n         ───────────────────────────────────────────────────────────── */}'
if p7_marker not in content:
    p7_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC & QR REDIRECTION GUIDE\n         ───────────────────────────────────────────────────────────── */}'

p8_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8\n         ───────────────────────────────────────────────────────────── */}'

start_p7 = content.find(p7_marker)
start_p8 = content.find(p8_marker)

print(f"p7_marker pos: {start_p7}, p8_marker pos: {start_p8}")

if start_p7 != -1 and start_p8 != -1:
    new_p7_jsx = '''{/* ─────────────────────────────────────────────────────────────
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
              <div style={{ padding: "30px", color: "#B45309", fontSize: "13px", fontWeight: 700 }}>
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
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px" }}>
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
    content = content[:start_p7] + new_p7_jsx + content[start_p8:]
    print("Force replaced Page 7 JSX successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Finished script execution.")
