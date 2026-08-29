import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the low-res emoji divs with high-definition SVG gold medallions
old_sloka_row = '''            {/* Sloka Header Row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "8px"
            }}>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #78350F 0%, #D97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "16px",
                flexShrink: 0,
                boxShadow: "0 2px 5px rgba(120, 53, 15, 0.3)"
              }}>
                🔱
              </div>
              <div style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#92400E",
                lineHeight: "1.6",
                flex: 1
              }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>
              <div style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D97706 0%, #78350F 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FEF3C7",
                fontSize: "16px",
                flexShrink: 0,
                boxShadow: "0 2px 5px rgba(120, 53, 15, 0.3)"
              }}>
                🪔
              </div>
            </div>'''

new_sloka_row = '''            {/* Sloka Header Row - High Definition Vector Gold Emblems */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "8px"
            }}>
              {/* Left Emblem: Gokarna Atmalinga & Sacred Trishula Vector Crest */}
              <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>
                <defs>
                  <linearGradient id="goldBgGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="trishulGold" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#78350F" />
                    <stop offset="100%" stopColor="#451A03" />
                  </linearGradient>
                </defs>
                <circle cx="23" cy="23" r="21" fill="url(#goldBgGradLeft)" stroke="#B45309" strokeWidth="2" />
                <circle cx="23" cy="23" r="18" stroke="#92400E" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                <path d="M23 9 V37 M15 13 C15 22 23 25 23 25 C23 25 31 22 31 13 M15 13 L12 9 M31 13 L34 9 M23 9 L23 6 L21 9 H25 L23 6 Z" stroke="url(#trishulGold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="23" cy="24" r="2" fill="#78350F" />
              </svg>

              <div style={{
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#92400E",
                lineHeight: "1.6",
                flex: 1
              }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>

              {/* Right Emblem: Gokarna Sacred Jyoti Deepa Vector Crest */}
              <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, filter: "drop-shadow(0px 2px 4px rgba(120, 53, 15, 0.25))" }}>
                <defs>
                  <linearGradient id="goldBgGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="flameOrange" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                </defs>
                <circle cx="23" cy="23" r="21" fill="url(#goldBgGradRight)" stroke="#B45309" strokeWidth="2" />
                <circle cx="23" cy="23" r="18" stroke="#92400E" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                <path d="M12 28 C12 34 34 34 34 28 C34 25 12 25 12 28 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
                <path d="M23 9 C19 17 19 23 23 25 C27 23 27 17 23 9 Z" fill="url(#flameOrange)" stroke="#B45309" strokeWidth="1.2" />
                <circle cx="23" cy="20" r="2" fill="#FEF3C7" />
              </svg>
            </div>'''

if old_sloka_row in content:
    content = content.replace(old_sloka_row, new_sloka_row)
    print("Replaced low-res emoji icons with high-definition SVG gold emblems successfully!")
else:
    print("Could not find exact sloka row, applying regex replace...")
    content = re.sub(
        r'\{\/\* Sloka Header Row \*\}[\s\S]*?<\/div>\s*<\/div>',
        new_sloka_row,
        content
    )
    print("Replaced via regex!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
