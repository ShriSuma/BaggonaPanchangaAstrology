filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. In page6Data memo hook, change return Array.from({ length: 8 }) to length: 6 and update header/ordinals
content = content.replace("Array.from({ length: 8 }", "Array.from({ length: 6 }")

# Update header title for Page 6
content = content.replace(
    'ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್',
    'ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೬ ತಿಂಗಳುಗಳ (೧೮೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್'
)

content = content.replace(
    'Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap',
    'Chapter 5: Upcoming 6 Months (180 Days) Planetary Roadmap'
)

content = content.replace(
    'ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ',
    'ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೬ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ'
)

# 2. Update month card header in Page 6 JSX so title and badge have clean flex layout
old_card_header = '''                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: textColors[i % 8], marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "11px", background: badgeBgs[i % 8], border: `1px solid ${badgeBorders[i % 8]}`, color: badgeColors[i % 8], padding: "3px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", height: "22px", boxSizing: "border-box" }}>
                      <span style={{ transform: "translateY(-4px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>'''

new_card_header = '''                  <div style={{ fontSize: "13px", fontWeight: 800, color: textColors[i % 6], marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12.5px", fontWeight: 800 }}>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "10.5px", background: badgeBgs[i % 6], border: `1px solid ${badgeBorders[i % 6]}`, color: badgeColors[i % 6], padding: "2px 8px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <span style={{ transform: "translateY(-1px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>'''

content = content.replace(old_card_header, new_card_header)

# Also replace array modulo % 8 to % 6 in Page 6 JSX loop
old_page6_jsx_loop = '{page6Data.map((m: any, i: number) => {'
if old_page6_jsx_loop in content:
    # Replace background arrays % 8 to % 6 inside Page 6
    s_loop = content.find(old_page6_jsx_loop)
    e_loop = content.find('</div>\n          </div>\n\n          {/* Footer Banner */}', s_loop)
    loop_block = content[s_loop:e_loop]
    loop_block_updated = loop_block.replace('% 8', '% 6')
    content = content[:s_loop] + loop_block_updated + content[e_loop:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Precise conversion to 6 Months (180 Days) complete.")
