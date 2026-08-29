import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the hardcoded 5 Dasha cards block on Page 3 with dynamic dashaCardsData.map(...)
pattern = re.compile(
    r'\{\/\* 5 Dasha-Bhukti Cards.*?\n\s*<div style=\{\{ display: "flex", flexDirection: "column", gap: "10px" \}\}>.*?\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>',
    re.DOTALL
)

dynamic_jsx = '''{/* 5 Dynamic Dasha-Bhukti Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {dashaCardsData.map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: card.isCurrent ? "#FFFBEB" : "#FFFFFF",
                  border: card.isCurrent ? "2px solid #F59E0B" : "1.5px solid #FCD34D",
                  borderRadius: "8px",
                  padding: "10px 14px 12px 14px",
                  boxShadow: card.isCurrent ? "0 3px 8px rgba(245, 158, 11, 0.12)" : "0 2px 5px rgba(0, 0, 0, 0.03)"
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: card.isCurrent ? 900 : 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.3" }}>
                    📌 {card.mahaName} {code === "kn" ? "ಮಹಾದಶಾ" : "Mahadasha"} • {card.bhuktiName} {code === "kn" ? "ಅಂತರ್ದಶಾ" : "Antardasha"} {card.isCurrent ? (code === "kn" ? "(ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ)" : "(Current Period)") : ""}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    color: "#92400E",
                    background: card.isCurrent ? "linear-gradient(180deg, #FDE68A 0%, #F59E0B 100%)" : "#FEF3C7",
                    border: "1px solid #F59E0B",
                    padding: "3px 12px",
                    borderRadius: "14px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: "1.2"
                  }}>
                    <span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{card.badgeText}</span>
                  </span>
                </div>
                <div style={{
                  fontSize: "11.5px",
                  color: "#78350F",
                  fontWeight: 700,
                  marginTop: "2px",
                  marginBottom: "8px",
                  background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                  border: "1px solid #FCD34D",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  lineHeight: "1.3"
                }}>
                  <span style={{ transform: "translateY(-3px)", display: "inline-block" }}>
                    🗓️ {code === "kn" ? "ಅವಧಿ" : "Period"}: {code === "kn" ? toKnDigits(card.startYmd) : card.startYmd} {code === "kn" ? "ರಿಂದ" : "to"} {code === "kn" ? toKnDigits(card.endYmd) : card.endYmd} | ({code === "kn" ? "ವಯಸ್ಸು" : "Age"}: {code === "kn" ? toKnDigits(card.startAgeInt) : card.startAgeInt} - {code === "kn" ? toKnDigits(card.endAgeInt) : card.endAgeInt} {code === "kn" ? "ವರ್ಷ" : "Years"} {card.isCurrent ? (code === "kn" ? "- ಪ್ರಸ್ತುತ ನಡವಳಿಕೆ" : "- Current Active") : ""})
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12.5px", lineHeight: "1.5" }}>
                  <div><span style={{ color: "#D97706" }}>💼</span> <strong style={{ color: "#065F46" }}>{code === "kn" ? "ವೃತ್ತಿ & ಅಧಿಕಾರ:" : "Career & Position:"}</strong> {card.careerText}</div>
                  <div><span style={{ color: "#D97706" }}>💰</span> <strong style={{ color: "#047857" }}>{code === "kn" ? "ಧನ & ಆಸ್ತಿ:" : "Finance & Wealth:"}</strong> {card.financeText}</div>
                  <div><span style={{ color: "#D97706" }}>🏫</span> <strong style={{ color: "#5B21B6" }}>{code === "kn" ? "ಕುಟುಂಬ ಸುಖ:" : "Family & Peace:"}</strong> {card.familyText}</div>
                  <div><span style={{ color: "#D97706" }}>🕉️</span> <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ದೈವಿಕ ಪರಿಹಾರ:" : "Sacred Remedy:"}</strong> {card.remedyText}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>'''

match = pattern.search(content)
if match:
    content = content[:match.start()] + dynamic_jsx + content[match.end():]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced Page 3 JSX with dynamic dashaCardsData mapping successfully.")
else:
    print("Pattern match failed. Searching for anchor line...")
    # Alternative direct string replacement
    anchor_start = '{/* 5 Dasha-Bhukti Cards (Starting from 2026 Current/Future Age 33 to 53) */}'
    anchor_end = '<!-- end cards -->' # let's check
