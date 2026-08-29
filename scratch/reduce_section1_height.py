import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Reduce padding on Section 1 container box
old_sec1_box = '''          {/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Crisp Typography & Zero Collisions */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>'''

new_sec1_box = '''          {/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Compact Height & Crisp Typography */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "8px 16px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>'''

# 2. Reduce SVG dimensions to 34x34px and reduce margins/gaps
old_sloka_row = '''            {/* Sloka Header Row - High Definition Vector Gold Emblems */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "8px"
            }}>
              {/* Left Emblem: Gokarna Atmalinga & Sacred Trishula Vector Crest */}
              <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>'''

new_sloka_row = '''            {/* Sloka Header Row - High Definition Vector Gold Emblems */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "4px"
            }}>
              {/* Left Emblem: Gokarna Atmalinga & Sacred Trishula Vector Crest */}
              <svg width="34" height="34" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>'''

old_right_svg = '''              {/* Right Emblem: Gokarna Sacred Jyoti Deepa Vector Crest */}
              <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>'''

new_right_svg = '''              {/* Right Emblem: Gokarna Sacred Jyoti Deepa Vector Crest */}
              <svg width="34" height="34" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>'''

content = content.replace(old_sec1_box, new_sec1_box)
content = content.replace(old_sloka_row, new_sloka_row)
content = content.replace(old_right_svg, new_right_svg)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Reduced Section 1 height successfully to match compact original proportions!")
