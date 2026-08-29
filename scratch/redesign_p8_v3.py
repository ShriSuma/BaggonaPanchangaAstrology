import re

file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Locate Page 8 marker
p8_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8\n         ───────────────────────────────────────────────────────────── */}"

if p8_marker not in content:
    print("Error: Page 8 marker not found")
    exit(1)

parts = content.split(p8_marker)
page1_to_7 = parts[0]

new_page_8 = p8_marker + """
      <div className="pdf-page" style={pageStyle}>
        <div style={frameStyle}>
          {/* Top Royal Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "10px",
            padding: "7px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              ಅಧ್ಯಾಯ ೭: ಜನ್ಮ ಕುಂಡಲಿ, ದಶಾ-ಭುಕ್ತಿ & ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ ಸಿದ್ಧ ಉಪಾಯಗಳು
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಸ್ಥಾಪಿಸಿ ನಿತ್ಯ ಪಠಿಸುವ ಶಾಸ್ತ್ರೋಕ್ತ ಜಪ, ನವಗ್ರಹ ದೇವತಾ ಪೂಜೆ & ದೈವಿಕ ಪರಿಹಾರ ಗ್ರಂಥ
            </div>
          </div>

          {/* Section 1: Janana Kundali & Nakshatra Remedies */}
          <div style={{
            background: "#FFFBEB",
            border: "1.5px solid #D97706",
            borderRadius: "9px",
            padding: "8px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #D97706", paddingBottom: "3px" }}>
              <span>🏺 ೧. ಜನ್ಮ ಕುಂಡಲಿ & ನಕ್ಷತ್ರ ದೇವತಾ ಸಿದ್ಧ ಜಪ:</span>
              <span style={{ fontSize: "10.5px", color: "#B45309", fontWeight: 700 }}>
                {rashiName} · {nakName} ({pada} ನೇ ಪಾದ)
              </span>
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.45", color: "#3F2A12", textAlign: "justify" }}>
              <strong style={{ color: "#B45309" }}>ನಿತ್ಯ ನಕ್ಷತ್ರ ಸ್ತೋತ್ರ ಜಪ:</strong> "ॐ ಆದಿತ್ಯಾಯ ಚ ಸೋಮಾಯ ಮಂಗಳಾಯ ಬುಧಾಯ ಚ । ಗುರು ಶುಕ್ರ ಶನಿಭ್ಯಶ್ಚ ರಾಹವೇ ಕೇತವೇ ನಮಃ ॥" (ನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ೨೧ ಬಾರಿ ನಿಷ್ಠೆಯಿಂದ ಪಠಿಸಿ). ಜನ್ಮ ನಕ್ಷತ್ರ ಪ್ರಭು ಹಾಗೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಧ್ಯಾನ್ದಿಂದ ಜನ್ಮಾಂತರ ಪಾಪ ನಿವಾರಣೆಯಾಗಿ ಮಾನಸಿಕ ಶಾಂತಿ & ದೈವಿಕ ರಕ್ಷೆ ಲಭಿಸಲಿದೆ.
            </div>
          </div>

          {/* Section 2: Dasha-Bhukti Divine Remedy */}
          <div style={{
            background: "#ECFDF5",
            border: "1.5px solid #10B981",
            borderRadius: "9px",
            padding: "8px 12px",
            boxShadow: "0 2px 5px rgba(16, 185, 129, 0.04)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#065F46", marginBottom: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #10B981", paddingBottom: "3px" }}>
              <span>🔱 ೨. ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಗ್ರಹ ಶಮನ & ಸಿದ್ಧ ಪೂಜಾ ಉಪಾಯ:</span>
              <span style={{ fontSize: "10.5px", background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: "10px", fontWeight: 800 }}>
                {dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.replace(/^📌\s*/, "") : "ಪ್ರಸ್ತುತ ಮಹಾದಶಾ ಶಮನ"}
              </span>
            </div>
            <div style={{ fontSize: "11px", lineHeight: "1.45", color: "#064E3B", textAlign: "justify" }}>
              <strong style={{ color: "#047857" }}>ಶಾಸ್ತ್ರೋಕ್ತ ಸಿದ್ಧ ಪೂಜೆ:</strong> ಪ್ರಸ್ತುತ ದಶಾ ಕಾಲದಲ್ಲಿ ಗ್ರಹ ಬಾಧೆ ಶಮನಕ್ಕೆ ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮಹಾ ರುದ್ರಾಭಿಷೇಕ, ದಶಾಂಶ ನವಗ್ರಹ ಪೂಜೆ ಹಾಗೂ ಎಳ್ಳೆಣ್ಣೆ ದೀಪಾರಾಧನೆ ಪ್ರಶಸ್ತ. ಈ ಅನುಷ್ಠಾನದಿಂದ ಮಾನಸಿಕ ಆತಂಕಗಳು ನಿವಾರಣೆಯಾಗಿ, ಉದ್ಯೋಗ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸ್ಥಿರತೆ ಲಭಿಸಿ ಪ್ರಶಾಂತ ಮನಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.
            </div>
          </div>

          {/* Section 3: Gochara Transits & Mind-Calming Rituals */}
          <div style={{
            background: "#EFF6FF",
            border: "1.5px solid #3B82F6",
            borderRadius: "9px",
            padding: "8px 12px",
            boxShadow: "0 2px 5px rgba(59, 130, 246, 0.04)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#1E40AF", marginBottom: "4px", borderBottom: "1px dashed #3B82F6", paddingBottom: "3px" }}>
              🛡️ ೩. ಗೋಚಾರ ಗ್ರಹ ಬಲ & ದೈನಂದಿನ ದೈವಿಕ ನಿವಾರಣಾ ಸಾತ್ವಿಕ ನಿಯಮಗಳು:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5px", lineHeight: "1.4" }}>
              <div style={{ background: "#FFFFFF", padding: "5px 8px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <strong style={{ color: "#1E40AF", display: "block" }}>☀️ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯ ಅರ್ಘ್ಯ:</strong>
                ಸೂರ್ಯೋದಯಕ್ಕೆ ಶ್ರೀ ಸೂರ್ಯದೇವರಿಗೆ ನೀರು ಅರ್ಘ್ಯ ಕೊಟ್ಟು "ॐ ಸೂರ್ಯಾಯ ನಮಃ" ಜಪಿಸಿ.
              </div>
              <div style={{ background: "#FFFFFF", padding: "5px 8px", borderRadius: "6px", border: "1px solid #BFDBFE" }}>
                <strong style={{ color: "#1E40AF", display: "block" }}>🪔 ಗೋದೂಳಿ ಸಂಧ್ಯಾ ದೀಪ:</strong>
                ನಿತ್ಯ ಸಂಜೆ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ದೀಪ ಹಚ್ಚಿ ನವಗ್ರಹ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ.
              </div>
              <div style={{ background: "#FFFFFF", padding: "5px 8px", borderRadius: "6px", border: "1px solid #BFDBFE", gridColumn: "span 2" }}>
                <strong style={{ color: "#1E40AF", display: "inline" }}>🐄 ಪುಣ್ಯ ದಾನ & ಗೋಸೇವೆ: </strong>
                ಶನಿವಾರ ಗೋವುಗಳಿಗೆ ಹಸಿರು ಹುಲ್ಲು, ಬೆಲ್ಲ ನೀಡುವಿಕೆಯಿಂದ ಮತ್ತು ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡುವುದರಿಂದ ಸಕಲ ನವಗ್ರಹ ದೋಷ ಶಮನವಾಗಿ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.
              </div>
            </div>
          </div>

          {/* Section 4: 4 Core 108 Daily Japa Mantras Grid */}
          <div style={{
            background: "#FFFDF7",
            border: "1.5px solid #D97706",
            borderRadius: "9px",
            padding: "8px 12px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.04)"
          }}>
            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#78350F", marginBottom: "5px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px", textAlign: "center" }}>
              📿 ೪. ಮನೆಯ ಪೂಜಾ ಮಂದಿರದ ೪ ಸಿದ್ಧ ೧೦೮ ನಿತ್ಯ ಜಪ ಮಂತ್ರಗಳು (Daily Altar Mantras)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5px", lineHeight: "1.4" }}>
              {/* Mantra 1 */}
              <div style={{ background: "#FFFBEB", border: "1.5px solid #F59E0B", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#B45309", display: "block", fontSize: "11px" }}>🔱 ಶ್ರೀ ಮಹಾದೇವ (ಗೋಕರ್ಣ) ಮಂತ್ರ:</strong>
                <div style={{ color: "#78350F", fontWeight: 700, margin: "2px 0" }}>"ॐ ನಮಃ ಶಿವಾಯ" (೧೦೮ ಬಾರಿ)</div>
                <div style={{ color: "#92400E", fontSize: "10px" }}>ಫಲ: ಸಕಲ ಭಯ, ಮಾನಸಿಕ ಆತಂಕ & ದೋಷ ಶಮನ.</div>
              </div>
              {/* Mantra 2 */}
              <div style={{ background: "#ECFDF5", border: "1.5px solid #10B981", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#047857", display: "block", fontSize: "11px" }}>💰 ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಧನದಾ ಮಂತ್ರ:</strong>
                <div style={{ color: "#064E3B", fontWeight: 700, margin: "2px 0" }}>"ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಶ್ರೀಂ ಕಮಲೇ ಪ್ರಸೀದ ನಮಃ"</div>
                <div style={{ color: "#047857", fontSize: "10px" }}>ಫಲ: ಅಷ್ಟೈಶ್ವರ್ಯ, ಧನ ಸಮೃದ್ಧಿ & ಸ್ಥಿರಾಸ್ತಿ ಸಿದ್ಧಿ.</div>
              </div>
              {/* Mantra 3 */}
              <div style={{ background: "#F5F3FF", border: "1.5px solid #8B5CF6", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#5B21B6", display: "block", fontSize: "11px" }}>🐘 ಶ್ರೀ ಗಣಪತಿ ವಿಘ್ನಹರ ಮಂತ್ರ:</strong>
                <div style={{ color: "#4C1D95", fontWeight: 700, margin: "2px 0" }}>"ॐ ಗಂ ಗಣಪತಯೇ ನಮಃ" (೧೦೮ ಬಾರಿ)</div>
                <div style={{ color: "#5B21B6", fontSize: "10px" }}>ಫಲ: ಸರ್ವ ವಿಘ್ನ ನಿವಾರಣೆ, ಕಾರ್ಯ ಜಯ & ಯಶಸ್ಸು.</div>
              </div>
              {/* Mantra 4 */}
              <div style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: "7px", padding: "6px 8px" }}>
                <strong style={{ color: "#991B1B", display: "block", fontSize: "11px" }}>☀️ ಶ್ರೀ ಸೂರ್ಯ ತೇಜೋ ಮಂತ್ರ:</strong>
                <div style={{ color: "#7F1D1D", fontWeight: 700, margin: "2px 0" }}>"ॐ ಘೃಣಿಃ ಸೂರ್ಯಾಯ ಆದಿತ್ಯಾಯ ನಮಃ"</div>
                <div style={{ color: "#991B1B", fontSize: "10px" }}>ಫಲ: ಆಯುಷ್ಯ ಬಲ, ತೇಜಸ್ಸು & ನಿರೋಗಿ ಸೌಖ್ಯ.</div>
              </div>
            </div>
          </div>

          {/* Sacred Altar Shrine Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "7px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#FEF3C7", lineHeight: "1.3" }}>
              ॥ ಈ ಪವಿತ್ರ ಪುಟವನ್ನು ನಿಮ್ಮ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ಇರಿಸಿ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪಠಿಸಿ ಸಕಲ ಮಂಗಳಂ ಪ್ರಾಪ್ತಿ ॥
            </div>
            <div style={{ fontSize: "10px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.25" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(page1_to_7 + new_page_8)

print("Page 8 successfully redesigned!")
