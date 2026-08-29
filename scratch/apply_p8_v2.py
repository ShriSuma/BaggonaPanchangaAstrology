import re

file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Check if rashiRemedyMap is added inside component
if "const rashiRemedyMap" not in content:
    target_pos = content.find("const priestStr = ")
    if target_pos != -1:
        remedy_code = """  const rashiRemedyMap: Record<number, { gem: string; rudraksha: string; color: string; day: string }> = {
    0: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    1: { gem: "ವಜ್ರ (Diamond / Zircon)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    2: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    3: { gem: "ಮುತ್ತು (Pearl)", rudraksha: "೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ / ಬೆಳ್ಳಿ", day: "ಸೋಮವಾರ" },
    4: { gem: "ಮಾಣಿಕ್ಯ (Ruby)", rudraksha: "೧೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಿತ್ತಳೆ (Orange)", day: "ಭಾನುವಾರ" },
    5: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    6: { gem: "ವಜ್ರ (Diamond)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    7: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    8: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" },
    9: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಪ್ಪು / ನೀಲಿ", day: "ಶನಿವಾರ" },
    10: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ನೀಲಿ (Blue)", day: "ಶನಿವಾರ" },
    11: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" }
  };
  const rashiRemedy = rashiRemedyMap[rashiIdx] || rashiRemedyMap[5];

"""
        content = content[:target_pos] + remedy_code + content[target_pos:]

p8_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 8:"

p8_index = content.find(p8_marker)

if p8_index != -1:
    content_before_p8 = content[:p8_index]
    
    new_page_8_v2 = p8_marker + """ EXACT MATCH TO PDF (45) PAGE 8
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Top Header Banner (Royal Golden Design) */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            padding: "10px 14px",
            borderRadius: "10px",
            textAlign: "center",
            border: "2px solid #FCD34D",
            boxShadow: "0 3px 8px rgba(120, 53, 15, 0.2)"
          }}>
            <div style={{ fontSize: "17px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", color: "#FEF3C7", textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}>
              ಅಧ್ಯಾಯ ೭: ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ ಸಿದ್ಧ ಉಪಾಯಗಳು
            </div>
            <div style={{ fontSize: "11px", opacity: 0.95, marginTop: "2px", fontWeight: 600, color: "#FFFDF7" }}>
              ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ ನಿತ್ಯ ಪಠಿಸುವ ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ, ನವಗ್ರಹ ದೇವತಾ ಪೂಜೆ & ದೈವಿಕ ಪರಿಹಾರ ಗ್ರಂಥ
            </div>
          </div>

          {/* Block 1: Devotee Kundli & Nakshatra Stotra (Gold & Amber Box) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #FCD34D", paddingBottom: "5px", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#78350F" }}>
                🏺 ಜನ್ಮ ಕುಂಡಲಿ & ನಕ್ಷತ್ರ ದೇವತಾ ಸಿದ್ಧ ಜಪ:
              </span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#92400E", background: "#FEF3C7", padding: "2px 8px", borderRadius: "6px", border: "1px solid #F59E0B" }}>
                ಜಾತಕ: {rashiName} · {nakName} {pada} ಚರಣ · {lagnaRashiName} ಲಗ್ನ
              </span>
            </div>
            <div style={{ fontSize: "11px", color: "#451A03", lineHeight: "1.5", fontWeight: 600, textAlign: "center" }}>
              <span style={{ color: "#78350F", fontWeight: 800 }}>॥ ನವಗ್ರಹ & ನಕ್ಷತ್ರ ಪೀಡಾಪರಿಹಾರ ಸ್ತೋತ್ರ ॥</span><br/>
              <span style={{ fontStyle: "italic", color: "#92400E", fontWeight: 700 }}>
                "ॐ ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ । ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥"
              </span><br/>
              <span style={{ color: "#B45309", fontSize: "10.5px" }}>(ದಿನನಿತ್ಯ ಬೆಳಿಗ್ಗೆ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ೨೧ ಬಾರಿ ಪಠಿಸುವುದರಿಂದ ಸಕಲ ಗ್ರಹ ದೋಷ ಶಮನ ಹಾಗೂ ಅಭಯ ಪ್ರಾಪ್ತಿ)</span>
            </div>
          </div>

          {/* Block 2: 4 Altar Japa Mantras Grid */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🔱 ಸಿದ್ಧ ೧೦೮ ನಿತ್ಯ ಜಪ ಮಂತ್ರಗಳು (ಮನೆಯ ಪೂಜಾ ಮಂದಿರದ ಜಪ ಗ್ರಂಥ):
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {/* Mantra 1: Shiva */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  🔱 ಶ್ರೀ ಮಹಾದೇವ (ಗೋಕರ್ಣ) ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0", letterSpacing: "0.3px" }}>
                  "ॐ ನಮಃ ಶಿವಾಯ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಆತಂಕ, ರೋಗ ಭಯ ಹಾಗೂ ಜಾತಕ ದೋಷ ನಿವಾರಣೆ.
                </div>
              </div>

              {/* Mantra 2: Mahalakshmi */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  💰 ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಧನದಾ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#92400E", margin: "2px 0", letterSpacing: "0.2px" }}>
                  "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ದರಿದ್ರ ನಿವಾರಣೆ, ಐಶ್ವರ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ಸಾಲ ಮುಕ್ತಿ.
                </div>
              </div>

              {/* Mantra 3: Ganapati */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  🐘 ಶ್ರೀ ಗಣಪತಿ ವಿಘ್ನಹರ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#92400E", margin: "2px 0", letterSpacing: "0.3px" }}>
                  "ॐ ಗಂ ಗಣಪತಯೇ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೧೦೮ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಕಾರ್ಯ ವಿಘ್ನ ಶಮನ ಹಾಗೂ ಶೈಕ್ಷಣಿಕ ಪ್ರಗತಿ.
                </div>
              </div>

              {/* Mantra 4: Surya Tejas */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F" }}>
                  ☀️ ಶ್ರೀ ಸೂರ್ಯ ತೇಜೋ ಮಂತ್ರ:
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#92400E", margin: "2px 0", letterSpacing: "0.2px" }}>
                  "ॐ ಘೃಣಿಃ ಸೂರ್ಯಾಯ ನಮಃ" <span style={{ fontSize: "10px", color: "#B45309" }}>(೨೧ ಬಾರಿ)</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಆರೋಗ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಯಶಸ್ಸು & ಆತ್ಮವಿಶ್ವಾಸ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 3: Gokarna Temple Sevas Directives (3 Enriched Golden Cards) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🔱 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಪರಿಹಾರ ಸೇವೆಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🌿 ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಆರೋಗ್ಯ ಸ್ಥಿರತೆ, ಆಯುಷ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಸಿದ್ಧಿ ಹಾಗೂ ಕಾಯಾಲೇ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪ್ರತ್ಯಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🔥 ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾಹವನ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಪ್ರಸ್ತುತ ಜಾತಕ ಗ್ರಹ ದೋಷ, ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧಾ ಮುಕ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕ್ಲೇಶ ನಿವಾರಣೆಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ವಿಶೇಷ ಯಾಗ ಸೇವೆ.
                </div>
              </div>

              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "8px",
                padding: "8px 9px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(180, 83, 9, 0.08)"
              }}>
                <div style={{ color: "#78350F", fontWeight: 800, fontSize: "12px", marginBottom: "2px" }}>
                  🌺 ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜಾ ಸೇವೆ
                </div>
                <div style={{ color: "#451A03", fontSize: "10px", lineHeight: "1.35", fontWeight: 600 }}>
                  ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿ, ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ನಿರಂತರ ಆರ್ಥಿಕ ಪ್ರಗತಿಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರದಿಂದ ವಿಶೇಷ ಧನಲಕ್ಷ್ಮಿ ಪೂಜೆ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 4: Daily Energy & Remedies Grid */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "10px",
            padding: "9px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350F", marginBottom: "6px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              🌿 ದೈನಂದಿನ ಸಾತ್ವಿಕ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಹಾಗೂ ದಾನ ಮಾರ್ಗದರ್ಶನ:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 10px" }}>
              {/* Card 1: Gemstone */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  💎 ಜಾತಕಾನುಕೂಲ ರತ್ನ: <span style={{ color: "#B45309", fontSize: "12px" }}>{rashiRemedy.gem}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಉಂಗುರದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಜಾತಕದಲ್ಲಿ ಗ್ರಹ ಬಲ ವೃದ್ಧಿ ಹಾಗೂ ಕಾರ್ಯ ಸಿದ್ಧಿ.
                </div>
              </div>

              {/* Card 2: Rudraksha */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  📿 ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ: <span style={{ color: "#B45309", fontSize: "12px" }}>{rashiRemedy.rudraksha}</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಪೂಜಿಸಿ ಕೊರಳಿನಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಭಯ ರಕ್ಷೆ ಹಾಗೂ ಮನಃಶಾಂತಿ.
                </div>
              </div>

              {/* Card 3: Color & Day */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  🎨 ಶುಭ ವರ್ಣ & ದಿನ: <span style={{ color: "#B45309", fontSize: "11.5px" }}>{rashiRemedy.color} ({rashiRemedy.day})</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  ಮುಖ್ಯ ಕೆಲಸಗಳಿಗೆ ಹೋಗುವಾಗ ಈ ಶುಭ ವರ್ಣ ವಸ್ತ್ರ ಧರಿಸುವುದು ಅತೀವ ಶ್ರೇಯಸ್ಕರ.
                </div>
              </div>

              {/* Card 4: Sattvic Dana */}
              <div style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "7px 9px"
              }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                  🕊️ ಸಾತ್ವಿಕ ದಾನ: <span style={{ color: "#B45309", fontSize: "11px" }}>ಗೋಸೇವೆ & ಧಾನ್ಯ ದಾನ</span>
                </div>
                <div style={{ fontSize: "10px", color: "#451A03", lineHeight: "1.3", fontWeight: 600 }}>
                  {rashiRemedy.day} ದಂದು ಗೋಮಾತೆಗೆ ಹುಲ್ಲು ನೀಡುವುದು ಹಾಗೂ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ದೀಪಾರಾಧನೆ ಶ್ರೇಷ್ಠ.
                </div>
              </div>
            </div>
          </div>

          {/* Block 5: Altar Banner & Archaka Blessing Footer */}
          <div style={{
            background: "linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)",
            color: "#FFFDF7",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            border: "1.5px solid #FCD34D",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.3px", color: "#FEF3C7" }}>
              ॥ ಈ ಪವಿತ್ರ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
            </div>
            <div style={{ fontSize: "10px", opacity: 0.9, marginTop: "2px" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · ശ്രീರಾಮ್ ಪಂಡಿತ್ (ದೂರವಾಣಿ: +91 94489 31393)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""
    
    full_new_content = content_before_p8 + new_page_8_v2
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_new_content)
    print("Page 8 successfully replaced with V2 layout and variables!")
else:
    print("ERROR: Page 8 marker not found!")
