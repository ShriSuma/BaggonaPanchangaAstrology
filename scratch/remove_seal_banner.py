import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(
    r'\s*\{\/\* Ashirvachana Sacred Seal & Guarantee Emblem \*\/\}[\s\S]*?<\/div>\s*<\/div>',
    re.DOTALL
)

# Note: The outer div closes the Ashirvachana narrative block, so we should keep the outer div closure `</div>`
target_str = '''            {/* Ashirvachana Sacred Seal & Guarantee Emblem */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#78350F",
              color: "#FEF3C7",
              borderRadius: "10px",
              padding: "10px 16px",
              border: "1.5px solid #D97706",
              marginTop: "16px",
              boxShadow: "0 2px 6px rgba(120, 53, 15, 0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>💮</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FDE68A" }}>
                  {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಪೀಠದ ಅಭಯ ಮುದ್ರೆ" : "Sri Gokarna Kshetra Sacred Abhaya Mudra Seal"}
                </span>
              </div>
              <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7" }}>
                ✨ {isKn ? "೧೦೦% ಸತ್ಯ ವೈಯಕ್ತಿಕ ಕುಂಡಲಿ ಗಣಿತ" : "100% Authentic Personal Horoscope"}
              </div>
            </div>'''

if target_str in content:
    content = content.replace(target_str, "")
    print("Ashirvachana seal banner removed successfully!")
else:
    print("Could not find exact target string, searching with regex...")
    # fallback regex replace
    content = re.sub(r'\s*\{\/\* Ashirvachana Sacred Seal & Guarantee Emblem \*\/\}[\s\S]*?<\/div>\n', '\n', content)
    print("Replaced via regex!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
