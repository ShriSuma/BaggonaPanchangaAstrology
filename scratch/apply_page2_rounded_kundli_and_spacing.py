import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update D1 Chart container and spacing on Page 2
old_d1_block = '''          {/* D1 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>'''

new_d1_block = '''          {/* D1 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #D97706",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>'''

content = content.replace(old_d1_block, new_d1_block)

# 2. Update D9 Chart container and spacing on Page 2
old_d9_block = '''          {/* D9 Chart */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "4px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #78350F",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>'''

new_d9_block = '''          {/* D9 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #D97706",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>'''

content = content.replace(old_d9_block, new_d9_block)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 2 Kundli chart rounded corners (16px) and spacing successfully!")
