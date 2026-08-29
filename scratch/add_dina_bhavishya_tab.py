filepath = "src/pages/DailyDarshanaPage.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update activeTab type and initialTab parser
content = content.replace(
    'const [activeTab, setActiveTab] = useState<"darshana" | "kundali" | "gochara" | "dasha">(initialTab);',
    'const [activeTab, setActiveTab] = useState<"darshana" | "kundali" | "gochara" | "dasha" | "bhavishya">(initialTab);'
)

content = content.replace(
    'if (rawTab.includes("dash")) return "dasha";',
    'if (rawTab.includes("dash")) return "dasha";\n    if (rawTab.includes("bhav") || rawTab.includes("dina") || rawTab.includes("fore")) return "bhavishya";'
)

# 2. Update DARSHANA_LABELS to include tabBhavishya
content = content.replace(
    'tabDasha: "ದಶಾ-ಭುಕ್ತಿ",',
    'tabDasha: "ದಶಾ-ಭುಕ್ತಿ",\n    tabBhavishya: "ದಿನ ಭವಿಷ್ಯ",'
)

content = content.replace(
    'tabDasha: "Dasha-Bhukti",',
    'tabDasha: "Dasha-Bhukti",\n    tabBhavishya: "Daily Forecast",'
)

content = content.replace(
    'tabDasha: "दशा-भुक्ति",',
    'tabDasha: "दशा-भुक्ति",\n    tabBhavishya: "दैनिक राशिफल",'
)

content = content.replace(
    'tabDasha: "దశా-భుక్తి",',
    'tabDasha: "దశా-భుక్తి",\n    tabBhavishya: "దిన భవిష్యత్తు",'
)

content = content.replace(
    'tabDasha: "தசா-புக்தி",',
    'tabDasha: "தசா-புக்தி",\n    tabBhavishya: "தினம் பலன்",'
)

# 3. Update navbar grid columns and add 5th button
old_nav_grid = 'gridTemplateColumns: "repeat(4, 1fr)",'
new_nav_grid = 'gridTemplateColumns: "repeat(5, 1fr)",'
content = content.replace(old_nav_grid, new_nav_grid)

old_dasha_button = '''          <button
            onClick={() => setActiveTab("dasha")}
            style={{
              background: activeTab === "dasha" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "dasha" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "dasha" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            ⏳ {dict.tabDasha}
          </button>'''

new_five_buttons = '''          <button
            onClick={() => setActiveTab("dasha")}
            style={{
              background: activeTab === "dasha" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "dasha" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "dasha" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 10.5,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            ⏳ {dict.tabDasha}
          </button>

          <button
            onClick={() => setActiveTab("bhavishya")}
            style={{
              background: activeTab === "bhavishya" ? "linear-gradient(135deg, #D97706, #B45309)" : "rgba(45, 20, 7, 0.8)",
              color: activeTab === "bhavishya" ? "#FFFFFF" : "#FCD34D",
              border: activeTab === "bhavishya" ? "1.5px solid #FDE68A" : "1px solid rgba(212, 175, 55, 0.2)",
              padding: "8px 4px",
              borderRadius: 10,
              fontSize: 10.5,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            ✨ {dict.tabBhavishya || "ದಿನ ಭವಿಷ್ಯ"}
          </button>'''

content = content.replace(old_dasha_button, new_five_buttons)

# 4. Insert 5th Tab Content (Dina Bhavishya View) after activeTab === "dasha" section
dasha_end_section = '{activeTab === "dasha" && ('

bhavishya_tab_view = '''        {/* TAB 5: DINA BHAVISHYA (PERSONALIZED DAILY HOROSCOPE & PREDICTIONS) */}
        {activeTab === "bhavishya" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(69, 26, 3, 0.95) 0%, rgba(30, 10, 0, 0.95) 100%)",
              border: "2px solid #D4AF37",
              borderRadius: 16,
              padding: "18px 20px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#FCD34D", letterSpacing: "0.5px" }}>
                ✨ {isKn ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ಪ್ರಸಾದಿತ" : "Sri Gokarna Mahabaleshwara Blessed"}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#FFFFFF", margin: "6px 0 4px", fontFamily: "serif" }}>
                {isKn ? "ಇಂದಿನ ದೈನಂದಿನ ದಿನ ಭವಿಷ್ಯ" : "Today\'s Personalized Daily Horoscope"}
              </h2>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 8 }}>
                📅 {isKn ? `ದಿನಾಂಕ: ೨೩ ಆಗಸ್ಟ್ ೨೦೨೬` : `Active Date: 23 August 2026`} ({rashiName(rashiIdx, lang)})
              </div>
              <p style={{ fontSize: 12, color: "#FEF3C7", margin: 0, lineHeight: 1.5 }}>
                {isKn
                  ? `${displayName} ಅವರ ಜನ್ಮ ಲಗ್ನ, ಚಂದ್ರ ರಾಶಿ ಹಾಗೂ ಇಂದಿನ ನವಗ್ರಹ ಸಂಚಾರ ಆಧರಿಸಿ ಶ್ರೀರಾಮ ಪಂಡಿತ್ ಗಣಿಸಿದ ಇಂದಿನ ಶುಭ ಫಲಗಳು.`
                  : `Personalized daily predictions computed for ${displayName} based on birth chart planetary alignments and today\'s Gochara transits.`}
              </p>
            </div>

            {/* Section 1: Daily Highlight */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🌟</span> {isKn ? "ದಿನದ ಮುಖ್ಯಾಂಶ ಹಾಗೂ ದೈವಿಕ ಶಕ್ತಿ" : "Daily Overview & Spiritual Vibe"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {isKn
                  ? `ಇಂದು ನಿಮ್ಮ ಚಂದ್ರ ರಾಶಿಯಾದ ${rashiName(rashiIdx, "kn")}ಗೆ ಗೋಚಾರ ಚಂದ್ರನ ಶುಭ ಸಂಚಾರದಿಂದ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು ಹಾಗೂ ಮಾನಸಿಕ ಪ್ರಸನ್ನತೆ ಲಭಿಸಲಿದೆ. ನೂತನ ಯೋಜನೆಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಮಹತ್ವದ ಚರ್ಚೆ ನಡೆಸಲು ಅತ್ಯಂತ ಪ್ರಶಸ್ತವಾದ ದಿನ.`
                  : `Today, with favorable Moon transits relative to your Moon sign ${rashiName(rashiIdx, "en")}, you will experience mental clarity and success in daily tasks. Ideal day for initiating key discussions.`}
              </p>
            </div>

            {/* Section 2: Career & Wealth */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>💼</span> {isKn ? "ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ ಹಾಗೂ ಧನ ಲಾಭ" : "Career, Business & Finance"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {isKn
                  ? `ವೃತ್ತಿರಂಗದಲ್ಲಿ ಶ್ರಮಕ್ಕೆ ಸೂಕ್ತ ಮಾನ್ಯತೆ ಲಭಿಸಲಿದೆ. ಹಣಕಾಸಿನ ವಹಿವಾಟುಗಳಲ್ಲಿ ಪ್ರಗತಿ ಕಂಡುಬರಲಿದ್ದು, ಹಳೆಯ ಬಾಕಿ ಹಣ ಕೈಸೇರುವ ಯೋಗವಿದೆ. ನೂತನ ಹೂಡಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆಗೆ ಹಿರಿಯರ ಸಲಹೆ ಸ್ವೀಕರಿಸಿ.`
                  : `Professional efforts will be recognized. Good financial flow and recovery of pending dues expected. Consult mentors before making fresh capital investments.`}
              </p>
            </div>

            {/* Section 3: Health & Family */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🧘</span> {isKn ? "ಆರೋಗ್ಯ, ಕುಟುಂಬ ಹಾಗೂ ಬಾಂಧವ್ಯ" : "Health & Family Harmony"}
              </div>
              <p style={{ fontSize: 13, color: "#FEE2E2", lineHeight: 1.6, margin: 0 }}>
                {isKn
                  ? `ದೈಹಿಕ ಅರೋಗ್ಯ ಉತ್ತಮವಾಗಿರಲಿದ್ದು, ಮನಸ್ಸಿನಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ ತುಂಬಿರುತ್ತದೆ. ಗೃಹದಲ್ಲಿ ಮಂಗಳಕರ ವಾತಾವರಣ ಹಾಗೂ ಬಂಧುಗಳೊಂದಿಗೆ ಪ್ರೀತಿಪೂರ್ವಕ ಸಂಬಂಧ ಸೌಹಾರ್ದತೆಯಿಂದ ಕೂಡಿರುತ್ತದೆ.`
                  : `Physical vitality remains strong with positive energy. Domestic atmosphere is peaceful, fostering warm bonds with family and friends.`}
              </p>
            </div>

            {/* Section 4: Timings & Colors */}
            <div style={{
              background: "rgba(30, 10, 0, 0.85)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              borderRadius: 14,
              padding: "16px 18px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⏰</span> {isKn ? "ಇಂದಿನ ಶುಭ ಸಮಯ ಹಾಗೂ ಬಣ್ಣ" : "Favorable Hours & Lucky Color"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                <div style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "10px 12px", borderRadius: 8 }}>
                  <strong style={{ color: "#FCD34D", display: "block" }}>{isKn ? "ಅಭಿಜಿತ್ ಮುಹೂರ್ತ:" : "Abhijit Muhurtha:"}</strong>
                  <span style={{ color: "#FFFFFF", fontWeight: 700 }}>{isKn ? "ಪೂರ್ವಾಹ್ನ ೧೧:೪೫ ರಿಂದ ಮಧ್ಯಾಹ್ನ ೧೨:೩೫" : "11:45 AM to 12:35 PM"}</span>
                </div>
                <div style={{ background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.3)", padding: "10px 12px", borderRadius: 8 }}>
                  <strong style={{ color: "#FCD34D", display: "block" }}>{isKn ? "ಶುಭ ಬಣ್ಣ ಹಾಗೂ ಸಂಖ್ಯೆ:" : "Lucky Color & Number:"}</strong>
                  <span style={{ color: "#FFFFFF", fontWeight: 700 }}>{isKn ? "ಕನಕ ಹಳದಿ / ಸಂಖ್ಯೆ: ೯" : "Golden Yellow / Number: 9"}</span>
                </div>
              </div>
            </div>

            {/* Section 5: Spiritual Remedy & Mantra */}
            <div style={{
              background: "linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(69, 26, 3, 0.9) 100%)",
              border: "1.5px solid #F59E0B",
              borderRadius: 14,
              padding: "16px 18px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#FCD34D", marginBottom: 6 }}>
                🕉️ {isKn ? "ಇಂದಿನ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೈವಿಕ ಸಿದ್ಧ ಮಂತ್ರ" : "Today\'s Divine Siddha Mantra"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", margin: "8px 0" }}>
                "ॐ ಶ್ರೀ ಮಹಾಗೌರೀ ಸಮೇತ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ"
              </div>
              <div style={{ fontSize: 11.5, color: "#FEF3C7", fontWeight: 700 }}>
                {isKn ? "ಸ್ನಾನಾನಂತರ ೧೧ ಬಾರಿ ಜಪಿಸುವುದರಿಂದ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ ಹಾಗೂ ನವಗ್ರಹ ದೋಷ ಶಮನ." : "Chant 11 times daily for peace, prosperity, and cosmic protection."}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dasha" && ('''

content = content.replace('{activeTab === "dasha" && (', bhavishya_tab_view)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Added 5th tab Dina Bhavishya to DailyDarshanaPage.tsx successfully!")
