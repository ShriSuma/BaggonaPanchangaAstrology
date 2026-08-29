import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Helper function to ensure toKnDigits is available
helper_kn = '''
const toKnDigits = (numOrStr: string | number): string => {
  const knDigits = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"];
  return numOrStr.toString().replace(/\\d/g, d => knDigits[parseInt(d, 10)]);
};
'''

if "const toKnDigits =" not in content:
    content = content.replace(
        "export const RoyalBooklet8PageTemplate: React.FC<RoyalBooklet8PageTemplateProps>",
        helper_kn + "\nexport const RoyalBooklet8PageTemplate: React.FC<RoyalBooklet8PageTemplateProps>"
    )

# Exact block match from line 700 to line 790
start_marker = '{/* Top Header Box with Gokarna Atmalinga Sacred Emblem */}'
end_marker = '{/* Full Page Width Chief Priest Ashirvachana & Sacred Guide Narrative - Larger Font */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    replacement = '''{/* Top Header Box with Gokarna Atmalinga Sacred Emblem - Clean Spacing & Zero Collision */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "12px 18px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)"
          }}>
            {/* Sloka Header Row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "6px"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
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
                fontSize: "12px",
                fontWeight: 700,
                color: "#92400E",
                letterSpacing: "0.2px",
                lineHeight: "1.4",
                flex: 1
              }}>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).sloka}
              </div>
              <div style={{
                width: "32px",
                height: "32px",
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

            {/* Title & Subtitle with Clean Line-Height */}
            <div style={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#78350F",
              lineHeight: "1.5",
              margin: "4px 0 2px 0",
              letterSpacing: "0.4px"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).title}
            </div>
            <div style={{
              fontSize: "12px",
              color: "#B45309",
              marginTop: "2px",
              fontWeight: 700,
              lineHeight: "1.4"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).subTitle}
            </div>
          </div>

          {/* Devotee Record Box - Creative Royal Card Layout */}
          <div style={{
            background: "linear-gradient(180deg, #FFFBEB 0%, #FFFDF7 100%)",
            border: "2px solid #D97706",
            borderRadius: "14px",
            padding: "14px 18px",
            boxShadow: "0 4px 10px rgba(180, 83, 9, 0.06)"
          }}>
            {/* Header Title */}
            <div style={{
              fontSize: "12.5px",
              fontWeight: 800,
              color: "#B45309",
              textAlign: "center",
              marginBottom: "8px",
              letterSpacing: "0.4px"
            }}>
              {(PAGE1_DICT[code] || PAGE1_DICT.en).metadataHeader}
            </div>

            {/* Creative Royal Name Plate */}
            <div style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FEF3C7 100%)",
              border: "1.5px solid #D97706",
              borderRadius: "10px",
              padding: "8px 16px",
              textAlign: "center",
              marginBottom: "12px",
              boxShadow: "0 2px 6px rgba(180, 83, 9, 0.1)"
            }}>
              <span style={{ fontSize: "16px", color: "#D97706", marginRight: "8px" }}>✨ 👑</span>
              <span style={{ fontSize: "22px", fontWeight: 900, color: "#78350F", letterSpacing: "0.3px" }}>
                {displayName}
              </span>
              <span style={{ fontSize: "16px", color: "#D97706", marginLeft: "8px" }}>👑 ✨</span>
            </div>

            {/* Creative 2-Column Attribute Cards Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 12px",
              fontSize: "12.5px",
              lineHeight: "1.4"
            }}>
              {/* Card 1: Janma Rashi */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>🌙</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblRashi}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>{rashiName}</span>
                </div>
              </div>

              {/* Card 2: Janma Nakshatra & Pada */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>⭐</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblNakshatra}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>
                    {nakName} ({isKn ? `${toKnDigits(pada)}ನೇ ಪಾದ` : `${pada} ${(PAGE1_DICT[code] || PAGE1_DICT.en).padaText}`})
                  </span>
                </div>
              </div>

              {/* Card 3: Janma Lagna */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>🌅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblLagna}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>
                    {birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName}
                  </span>
                </div>
              </div>

              {/* Card 4: Gotra */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>🔱</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblGotra}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>{finalGotra}</span>
                </div>
              </div>

              {/* Card 5: Date of Birth */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>📅</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblDob}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>
                    {isKn ? toKnDigits(dobStr) : dobStr}
                  </span>
                </div>
              </div>

              {/* Card 6: Time of Birth */}
              <div style={{
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "15px" }}>⏰</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblTob}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>
                    {isKn ? toKnDigits(formatTimeWithAmPm(tobStr, true)) : formatTimeWithAmPm(tobStr, false)}
                  </span>
                </div>
              </div>

              {/* Card 7: Place of Birth (Spans 2 Cols) */}
              <div style={{
                gridColumn: "span 2",
                background: "#FFFDF7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span style={{ fontSize: "15px" }}>📍</span>
                <div>
                  <strong style={{ color: "#B45309", fontSize: "11.5px", display: "block" }}>
                    {(PAGE1_DICT[code] || PAGE1_DICT.en).lblPob}:
                  </strong>
                  <span style={{ fontWeight: 800, color: "#78350F", fontSize: "13px" }}>{pobStr}</span>
                </div>
              </div>
            </div>
          </div>\n\n          '''
    content = content[:start_idx] + replacement + content[end_idx:]
    print("Page 1 top sections replaced via exact marker search!")
else:
    print(f"Indices not found: start={start_idx}, end={end_idx}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
