import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add lblYoga to PAGE1_DICT interface and dictionary entries
content = content.replace(
    'lblGotra: string;',
    'lblGotra: string;\n  lblYoga: string;'
)

content = content.replace(
    'lblGotra: "ಗೋತ್ರ",',
    'lblGotra: "ಗೋತ್ರ",\n    lblYoga: "ಜನ್ಮ ಯೋಗ",'
)
content = content.replace(
    'lblGotra: "Gotra",',
    'lblGotra: "Gotra",\n    lblYoga: "Janma Yoga",'
)
content = content.replace(
    'lblGotra: "गोत्र",',
    'lblGotra: "गोत्र",\n    lblYoga: "जन्म योग",'
)
content = content.replace(
    'lblGotra: "గోత్రం",',
    'lblGotra: "గోత్రం",\n    lblYoga: "జన్మ యోగం",'
)
content = content.replace(
    'lblGotra: "கோத்திரம்",',
    'lblGotra: "கோத்திரம்",\n    lblYoga: "ஜென்ம யோகம்",'
)

# 2. Update Card 4 in Page 1 to show Gotra if available, or Janma Yoga fallback if Gotra is missing
old_card4_block = '''              {/* Card 4: Gotra (Only rendered if devotee provided a valid Gotra) */}
              {hasGotra && (
                <div style={{
                  background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                  border: "1.5px solid #D97706",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
                }}>
                  <span style={{ fontSize: "17px" }}>🔱</span>
                  <div>
                    <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                      {(PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra}:
                    </strong>
                    <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{finalGotra}</span>
                  </div>
                </div>
              )}'''

new_card4_block = '''              {/* Card 4: Gotra (if available) OR Birth Yoga fallback (if Gotra is missing) */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>{hasGotra ? "🔱" : "✨"}</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {hasGotra 
                      ? (PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra 
                      : (PAGE1_DICT[code] || PAGE1_DICT.en).lblYoga}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {hasGotra ? finalGotra : (birthKundli?.yoga?.name || (isKn ? "ಸಿದ್ಧ" : "Siddha"))}
                  </span>
                </div>
              </div>'''

if old_card4_block in content:
    content = content.replace(old_card4_block, new_card4_block)
    print("Page 1 Card 4 updated with Gotra / Yoga fallback successfully!")

# Ensure Card 7 (Place of Birth) spans 2 columns permanently
content = content.replace(
    'gridColumn: hasGotra ? "span 2" : "span 1",',
    'gridColumn: "span 2",'
)

# 3. Update Page 3 Duration Box & Pill Badge styling
# Revert duration box margin to original: marginTop: "2px", marginBottom: "8px", padding: "4px 10px"
# Lift duration inner text UPWARDS: transform: "translateY(-3px)"
content = re.sub(
    r'marginTop:\s*"7px",\s*\n\s*marginBottom:\s*"6px",\s*\n\s*background:\s*"linear-gradient\(180deg, #FFFDF7 0%, #FEF3C7 100%\)",\s*\n\s*border:\s*"1px solid #FCD34D",\s*\n\s*padding:\s*"4px 10px"',
    r'marginTop: "2px",\n                marginBottom: "8px",\n                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",\n                border: "1px solid #FCD34D",\n                padding: "4px 10px"',
    content
)

# Lift duration bar inner span text UPWARDS by 3px with translateY(-3px)
content = re.sub(
    r'<span>(🗓️ ಅವಧಿ:[^<]+)</span>',
    r'<span style={{ transform: "translateY(-3px)", display: "inline-block" }}>\1</span>',
    content
)

# Lift top-right pill badge text UPWARDS by 3px with translateY(-3px)
content = re.sub(
    r'padding:\s*"3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.25",\s*\n\s*transform:\s*"translateY\(-3px\)"',
    r'padding: "3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.25",\n                  transform: "translateY(-3px)"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Yoga fallback for Page 1 and text lift for Page 3 successfully!")
