import re

file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Locate Block 3 and Block 4 in Page 8 and replace them with the enlarged, richer, beautiful non-white boxes
old_blocks_pattern = re.compile(
    r"\{\/\* Block 3: Gokarna Temple Sevas Directives.*?"
    r"\{\/\* Block 5: Altar Banner & Archaka Blessing Footer \*\/\}",
    re.DOTALL
)

new_blocks_code = """{/* Block 3: Gokarna Temple Sevas Directives (3 Enriched Golden Cards) */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "10px 14px",
                boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
              }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
                  🔱 ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಸನ್ನಿಧಾನದ ವಿಶೇಷ ಪರಿಹಾರ ಸೇವೆಗಳು:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    border: "1.5px solid #D97706",
                    borderRadius: "9px",
                    padding: "9px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(180, 83, 9, 0.08)"
                  }}>
                    <div style={{ color: "#78350F", fontWeight: 800, fontSize: "13px", marginBottom: "3px" }}>
                      🌿 ಮಹಾರುದ್ರಾಭಿಷೇಕ ಸೇವೆ
                    </div>
                    <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
                      ಆರೋಗ್ಯ ಸ್ಥಿರತೆ, ಆಯುಷ್ಯ ವೃದ್ಧಿ, ಉದ್ಯೋಗ ಸಿದ್ಧಿ ಹಾಗೂ ಕಾಯಾಲೇ ಶಮನಕ್ಕಾಗಿ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಪ್ರತ್ಯಕ್ಷ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ.
                    </div>
                  </div>

                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    border: "1.5px solid #D97706",
                    borderRadius: "9px",
                    padding: "9px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(180, 83, 9, 0.08)"
                  }}>
                    <div style={{ color: "#78350F", fontWeight: 800, fontSize: "13px", marginBottom: "3px" }}>
                      🔥 ನವಗ್ರಹ ಶಾಂತಿ ಮಹಾಹವನ
                    </div>
                    <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
                      ಪ್ರಸ್ತುತ ಜಾತಕ ಗ್ರಹ ದೋಷ, ಸಾಲ ನಿವಾರಣೆ, ಶತ್ರು ಬಾಧಾ ಮುಕ್ತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಕ್ಲೇಶ ನಿವಾರಣೆಗೆ ಗೋಕರ್ಣದಲ್ಲಿ ವಿಶೇಷ ಯಾಗ ಸೇವೆ.
                    </div>
                  </div>

                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                    border: "1.5px solid #D97706",
                    borderRadius: "9px",
                    padding: "9px 10px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(180, 83, 9, 0.08)"
                  }}>
                    <div style={{ color: "#78350F", fontWeight: 800, fontSize: "13px", marginBottom: "3px" }}>
                      🌺 ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜಾ ಸೇವೆ
                    </div>
                    <div style={{ color: "#451A03", fontSize: "10.5px", lineHeight: "1.4", fontWeight: 600 }}>
                      ಅಷ್ಟೈಶ್ವರ್ಯ ಸಿದ್ಧಿ, ದಾಂಪತ್ಯ ಸೌಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ನಿರಂತರ ಆರ್ಥಿಕ ಪ್ರಗತಿಗಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರದಿಂದ ವಿಶೇಷ ಧನಲಕ್ಷ್ಮಿ ಪೂಜೆ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 4: Daily Energy & Remedies Grid (Redesigned with Warm Hues & Detailed Guidance) */}
              <div style={{
                background: "linear-gradient(180deg, #FFFDF7 0%, #FFFBEB 100%)",
                border: "1.5px solid #D97706",
                borderRadius: "10px",
                padding: "10px 14px",
                boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
              }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px", borderBottom: "1px dashed #FCD34D", paddingBottom: "4px" }}>
                  🌿 ದೈನಂದಿನ ಸಾತ್ವಿಕ ರತ್ನ, ರುದ್ರಾಕ್ಷಿ ಹಾಗೂ ದಾನ ಮಾರ್ಗದರ್ಶನ:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                  {/* Card 1: Gemstone */}
                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    boxShadow: "0 1px 3px rgba(180, 83, 9, 0.05)"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                      💎 ಜಾತಕಾನುಕೂಲ ರತ್ನ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.gem}</span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                      ಬೆಳ್ಳಿ/ಚಿನ್ನದ ಉಂಗುರದಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಜಾತಕದಲ್ಲಿ ಗ್ರಹ ಬಲ ವೃದ್ಧಿ ಹಾಗೂ ಕಾರ್ಯ ಸಿದ್ಧಿ.
                    </div>
                  </div>

                  {/* Card 2: Rudraksha */}
                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    boxShadow: "0 1px 3px rgba(180, 83, 9, 0.05)"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                      📿 ಸಿದ್ಧ ರುದ್ರಾಕ್ಷಿ: <span style={{ color: "#B45309", fontSize: "12.5px" }}>{rashiRemedy.rudraksha}</span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                      ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಪೂಜಿಸಿ ಕೊರಳಿನಲ್ಲಿ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ಅಭಯ ರಕ್ಷೆ ಹಾಗೂ ಮನಃಶಾಂತಿ.
                    </div>
                  </div>

                  {/* Card 3: Color & Day */}
                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    boxShadow: "0 1px 3px rgba(180, 83, 9, 0.05)"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                      🎨 ಶುಭ ವರ್ಣ & ದಿನ: <span style={{ color: "#B45309", fontSize: "12px" }}>{rashiRemedy.color} ({rashiRemedy.day})</span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                      ಮುಖ್ಯ ಕೆಲಸಗಳಿಗೆ ಹೋಗುವಾಗ ಈ ಶುಭ ವರ್ಣ ವಸ್ತ್ರ ಧರಿಸುವುದು ಅತೀವ ಶ್ರೇಯಸ್ಕರ.
                    </div>
                  </div>

                  {/* Card 4: Sattvic Dana */}
                  <div style={{
                    background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    boxShadow: "0 1px 3px rgba(180, 83, 9, 0.05)"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: 800, color: "#78350F", marginBottom: "2px" }}>
                      🕊️ ಸಾತ್ವಿಕ ದಾನ: <span style={{ color: "#B45309", fontSize: "11.5px" }}>ಗೋಸೇವೆ & ಧಾನ್ಯ ದಾನ</span>
                    </div>
                    <div style={{ fontSize: "10.5px", color: "#451A03", lineHeight: "1.35", fontWeight: 600 }}>
                      {rashiRemedy.day} ದಂದು ಗೋಮಾತೆಗೆ ಹುಲ್ಲು ನೀಡುವುದು ಹಾಗೂ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ದೀಪಾರಾಧನೆ ಶ್ರೇಷ್ಠ.
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 5: Altar Banner & Archaka Blessing Footer */}"""

if old_blocks_pattern.search(content):
    content = old_blocks_pattern.sub(new_blocks_code, content)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Page 8 redesigned!")
else:
    print("ERROR: Pattern not found in file")
