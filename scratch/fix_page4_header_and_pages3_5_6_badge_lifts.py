import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Page 4 Header Box Overlap Fix: Increase marginTop & lineHeight of subtext
old_p4_header = '''          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೨: ವ್ಯಕ್ತಿತ್ವ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>'''

new_p4_header = '''          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.35", marginBottom: "4px" }}>
              ಅಧ್ಯಾಯ ೨: ವ್ಯಕ್ತಿತ್ವ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "4px", lineHeight: "1.4", display: "block" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>'''

if old_p4_header in content:
    content = content.replace(old_p4_header, new_p4_header)
    print("Fixed Page 4 header overlap successfully!")
else:
    # Pattern fallback
    content = re.sub(
        r'ಅಧ್ಯಾಯ ೨: ವ್ಯಕ್ತಿತ್ವ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ\s*</div>\s*<div style=\{\{\s*fontSize: "11px",\s*color: "#B45309",\s*fontWeight: 600,\s*marginTop: "2px"\s*\}\}>',
        'ಅಧ್ಯಾಯ ೨: ವ್ಯಕ್ತಿತ್ವ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ\n            </div>\n            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "4px", lineHeight: "1.4", display: "block" }}>',
        content
    )

# 2. Page 5 Badges (lines 1822, 1836, 1850) inner text lift
content = content.replace(
    '<span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ</span>',
    '<span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ</span></span>'
)
content = content.replace(
    '<span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #FB7185", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ಶಾಂತಿ & ಪೂಜಾ ವಿಧಿ</span>',
    '<span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #FB7185", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>ಶಾಂತಿ & ಪೂಜಾ ವಿಧಿ</span></span>'
)
content = content.replace(
    '<span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>ವರ್ತಮಾನ ಗೋಚಾರ</span>',
    '<span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>ವರ್ತಮಾನ ಗೋಚಾರ</span></span>'
)

# 3. Page 6 Badges (8 Month Badges) inner text lift with translateY(-3px)
# Wrap inner text of month badges with translateY(-3px) if not already wrapped
p6_month_badges = [
    "ಆರೋಗ್ಯ & ಆಸ್ತಿ",
    "ರಾಜಯೋಗ ಬಲ",
    "ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ",
    "ಶುಭ ಕಾರ್ಯಾಭ್ಯುದಯ",
    "⚡ ಧನ ನಷ್ಟ & ಜಾಗ್ರತೆ",
    "ರಾಜಯೋಗ ಬಲ",
    "ವಿದ್ಯಾ & ಬೌದ್ಧಿಕ",
    "⚡ ಶತ್ರು ಜಯ & ರಕ್ಷಣೆ"
]

for badge in p6_month_badges:
    old_span = f'<span style={{ transform: "translateY(-1.5px)", display: "inline-block" }}>{badge}</span>'
    new_span = f'<span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{badge}</span>'
    if old_span in content:
        content = content.replace(old_span, new_span)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Page 4 header overlap fix and Pages 3, 5, 6 badge inner text lifts successfully!")
