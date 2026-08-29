import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace pageStyle font family definition
content = content.replace(
    'fontFamily: "\'Noto Serif\', \'Noto Serif Kannada\', serif",',
    'fontFamily: "\'Noto Serif Kannada\', \'Tunga\', \'Kannada Sangam MN\', \'Noto Serif\', serif",\n    WebkitFontSmoothing: "antialiased",'
)

# Replace the Page 1 Top 2 Sections with crisp font weights (700/600 instead of 900), clean line heights (1.7/1.8), and elegant spacing
start_marker = '{/* Top Header Box with Gokarna Atmalinga Sacred Emblem'
end_marker = '{/* Full Page Width Chief Priest Ashirvachana'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    replacement = '''{/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Crisp Typography & Zero Collisions */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 20px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>
            {/* Sloka Header Row */}
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
                letterSpacing: "0.2px",
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
            </div>

            {/* Title & Subtitle with Crisp Font Weight (700) to Prevent Synthetic Bold Bloat */}
            <div style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#78350F",
              lineHeight: "1.7",
              margin: "6px 0 4px 0",
              letterSpacing: "0.3px"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).title}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#B45309",
              marginTop: "4px",
              fontWeight: 600,
              lineHeight: "1.5"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).subTitle}
            </div>
          </div>

          {/* Devotee Record Box - Executive Royal Amber Gold Parchment */}
          <div style={{
            background: "linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 50%, #FEF3C7 100%)",
            border: "2px solid #B45309",
            borderRadius: "14px",
            padding: "16px 20px",
            boxShadow: "0 4px 12px rgba(180, 83, 9, 0.1)"
          }}>
            {/* Header Title */}
            <div style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#78350F",
              textAlign: "center",
              marginBottom: "10px",
              letterSpacing: "0.4px"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).metadataHeader}
            </div>

            {/* Executive Royal Gold Crest Badge */}
            <div style={{
              background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #FDE68A 100%)",
              border: "2px solid #B45309",
              borderRadius: "12px",
              padding: "10px 18px",
              textAlign: "center",
              marginBottom: "14px",
              boxShadow: "0 3px 8px rgba(180, 83, 9, 0.2)"
            }}>
              <span style={{ fontSize: "18px", marginRight: "8px" }}>✨ 👑</span>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#451A03", letterSpacing: "0.5px" }}>
                {displayName}
              </span>
              <span style={{ fontSize: "18px", marginLeft: "8px" }}>👑 ✨</span>
            </div>

            {/* Creative 2-Column Attribute Cards Grid - Crisp 700 Weight */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px 14px",
              fontSize: "13px",
              lineHeight: "1.5"
            }}>
              {/* Card 1: Janma Rashi */}
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
                <span style={{ fontSize: "17px" }}>🌙</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblRashi}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{rashiName}</span>
                </div>
              </div>

              {/* Card 2: Janma Nakshatra & Pada */}
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
                <span style={{ fontSize: "17px" }}>⭐</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblNakshatra}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {nakName} ({isKn ? `${toKnDigits(pada)} ನೇ ಪಾದ` : `${pada} ${(PAGE1_DICT[code] || PAGE1_DICT.en).padaText}`})
                  </span>
                </div>
              </div>

              {/* Card 3: Janma Lagna */}
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
                <span style={{ fontSize: "17px" }}>🌅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblLagna}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName}
                  </span>
                </div>
              </div>

              {/* Card 4: Gotra (Only rendered if devotee provided a valid Gotra) */}
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
              )}

              {/* Card 5: Date of Birth */}
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
                <span style={{ fontSize: "17px" }}>📅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblDob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {isKn ? toKnDigits(dobStr) : dobStr}
                  </span>
                </div>
              </div>

              {/* Card 6: Time of Birth */}
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
                <span style={{ fontSize: "17px" }}>⏰</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblTob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>
                    {isKn ? toKnDigits(formatTimeWithAmPm(tobStr, true)) : formatTimeWithAmPm(tobStr, false)}
                  </span>
                </div>
              </div>

              {/* Card 7: Place of Birth */}
              <div style={{
                gridColumn: hasGotra ? "span 2" : "span 1",
                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 5px rgba(180, 83, 9, 0.08)"
              }}>
                <span style={{ fontSize: "17px" }}>📍</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block", fontWeight: 700 }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 700, color: "#78350F", fontSize: "13.5px" }}>{pobStr}</span>
                </div>
              </div>
            </div>
          </div>\n\n          '''
    content = content[:start_idx] + replacement + content[end_idx:]
    print("Page 1 top sections updated with crisp 700 font weight & line-height 1.7!")
else:
    print(f"Indices not found: start={start_idx}, end={end_idx}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
