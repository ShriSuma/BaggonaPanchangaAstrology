filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Page 4 header box title to shift main title UP and add space before line 2
old_header_box = '''          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>'''

new_header_box = '''          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "6px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "4px", lineHeight: "1.35", display: "block" }}>
              📜 ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯ ಸ್ವಭಾವ, ಆಂತರಿಕ ನಿಗೂಢ ರಹಸ್ಯ, ಉಗ್ರತೆ ಹಾಗೂ ಪ್ರಸ್ತುತ ೪ ಜೀವನ ಘಟ್ಟಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ
            </div>
          </div>'''

if old_header_box in content:
    content = content.replace(old_header_box, new_header_box)
    print("Replaced Page 4 header box with title UP and line spacing successfully!")
else:
    # Try searching by chapter title substring
    sub_old = '''<div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>'''
    sub_new = '''<div style={{ fontSize: "17.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.2", marginBottom: "6px", transform: "translateY(-2px)" }}>
              ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "4px", lineHeight: "1.35", display: "block" }}>'''
    content = content.replace(sub_old, sub_new)
    print("Replaced substring for Page 4 header box title!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Page 4 header title shift UP and line separation successfully.")
