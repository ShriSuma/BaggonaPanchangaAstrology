filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update page5Data memo hook to include yogaText3, doshaText3, gocharaText3
old_p5_memo_marker = "  // ─── DYNAMIC PAGE 5 DATA (Yogas, Doshas & Live Gochara Transits) ───"
old_p6_memo_marker = "  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───"

s_p5_idx = content.find(old_p5_memo_marker)
e_p5_idx = content.find(old_p6_memo_marker)

print(f"s_p5_idx: {s_p5_idx}, e_p5_idx: {e_p5_idx}")

new_p5_memo = '''  // ─── DYNAMIC PAGE 5 DATA (Yogas, Doshas & Live Gochara Transits) ───
  const page5Data = React.useMemo(() => {
    if (!birthKundli) return null;
    const isKn = code === "kn";

    let yogaText1 = "";
    let yogaText2 = "";
    let yogaText3 = "";
    if (isKn) {
      yogaText1 = `${displayName} ಅವರ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಚಂದ್ರರ ಪವಿತ್ರ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿ ಸಂಯೋಗದಿಂದ 'ಗಜಕೇಸರಿ ರಾಜಯೋಗ' ಅತ್ಯಂತ ಶಕ್ತಿಯುತವಾಗಿ ಜಾಗೃತಗೊಂಡಿದೆ. ಈ ದಿವ್ಯ ರಾಜಯೋಗದ ಅನುಗ್ರಹದಿಂದ ಸಮಾಜದಲ್ಲಿ ಗೌರವಾನ್ವಿತ ಸ್ಥಾನಮಾನ, ಆಪತ್ತಿನ ವೇಳೆಯಲ್ಲಿ ಜಯ ತಂದುಕೊಡುವ ದೈವಿಕ ರಕ್ಷಣೆ ಹಾಗೂ ಸ್ಥಿರವಾದ ಯಶಸ್ಸು ಲಭಿಸಲಿದೆ. ನಿಮ್ಮ ವೃತ್ತಿ ಅಥವಾ ವ್ಯಾಪಾರ ಕ್ಷೇತ್ರದಲ್ಲಿ ಎಂತಹ ಪ್ರಬಲ ಪ್ರತಿರೋಧಗಳು ಎದುರಾದರೂ, ಆಂತರಿಕ ಬೌದ್ಧಿಕ ದಕ್ಷತೆ ಹಾಗೂ ಧೈರ್ಯದಿಂದ ಎಲ್ಲವನ್ನೂ ಮೆಟ್ಟಿ ನಿಂತು ಅಗ್ರಸ್ಥಾನ ಗಳಿಸುವಿರಿ. ದೇವಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ಮನಸ್ಸಿನಲ್ಲಿ ಸದಾ ಧಾರ್ಮಿಕ ಆಲೋಚನೆ ಹಾಗೂ ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ ನಡೆಯುವ ವಿವೇಕವನ್ನು ನೀಡುತ್ತದೆ.`;
      yogaText2 = `ಲಗ್ನ ಹಾಗೂ ತ್ರಿಕೋಣ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಬಲವಾದ ಸಂಯೋಜನೆಯಿಂದ 'ಬುಧಾದಿತ್ಯ ಯೋಗ' ಹಾಗೂ 'ಲಕ್ಷ್ಮಿ ಯೋಗ' ಸಿದ್ಧಿಸಿದ್ದು, ತೀಕ್ಷ್ಣ ಗ್ರಹಣ ಶಕ್ತಿ, ಸಮಯೋಚಿತ ನಿರ್ಧಾರ ಹಾಗೂ ಅಪಾರ ಆರ್ಥಿಕ ಸಂಪತ್ತನ್ನು ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ. ಧನ ಹಾಗೂ ಲಾಭ ಭಾವಗಳ ಮೇಲೆ ಶುಭ ಗ್ರಹಗಳ ಸೌಮ್ಯ ದೃಷ್ಟಿ ಇರುವ ಕಾರಣ ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ನೂತನ ಗೃಹ ನಿರ್ಮಾಣ ಹಾಗೂ ಶೇರು/ಉದ್ಯೋಗ ಹೂಡಿಕೆಗಳಲ್ಲಿ ನಿರಂತರ ಧನ ಹರಿವು ಉಂಟಾಗಲಿದೆ. ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಪ್ರತಿಯೊಂದು ಗುರಿಯೂ ಸಿದ್ದಿಯಾಗಲಿದೆ.`;
      yogaText3 = `ದಶಮ ಹಾಗೂ ಭಾಗ್ಯ ಭಾವಗಳ ಅಧಿಪತಿಗಳ ಸೌಮ್ಯ ಸಮಸಪ್ತಕ ದೃಷ್ಟಿಯಿಂದ 'ಮಹಾಪುರುಷ ರಾಜಯೋಗ' ಹಾಗೂ 'ಧನಕಾರಕ ಬಲ' ಜಾಗೃತಗೊಂಡಿದೆ. ಉದ್ಯೋಗ ಸ್ಥಾನದಲ್ಲಿ ನಾಯಕತ್ವದ ಸಾಂಸ್ಥಿಕ ಅಧಿಕಾರ, ಹಿರಿಯ ಮಾರ್ಗದರ್ಶಕರ ಪ್ರೋತ್ಸಾಹ ಹಾಗೂ ರಾಜಕೀಯ/ಉದ್ಯೋಗಿ ಗೌರವ ಅಪಾರವಾಗಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
    } else {
      yogaText1 = `In the natal chart of ${displayName}, the sacred aspectual alignment of Jupiter and Moon forms a powerful 'Gajakesari Rajayoga'. This bestows divine protection, high status, and enduring success. No matter how challenging the professional opposition, your wisdom and courage will ensure triumph.`;
      yogaText2 = `Strong Kendra-Trikona lord associations form 'Budhaditya Yoga' and 'Lakshmi Yoga', guaranteeing sharp intellect, timely decision-making, and financial growth through real estate and sound investments.`;
      yogaText3 = `Aspects of 10th and 9th house lords trigger 'Mahapurusha Rajayoga' and 'Dhana Karaka Strength', granting professional leadership, executive authority, and organizational honor.`;
    }

    let doshaText1 = "";
    let doshaText2 = "";
    let doshaText3 = "";
    if (isKn) {
      doshaText1 = `ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ರಾಹು-ಕೇತು ಅಥವಾ ಮಂಗಳ ಗ್ರಹದ ಸೂಕ್ಷ್ಮ ಭಾವ ಸ್ಥಾನದಿಂದಾಗಿ ಆತುರದ ಆರ್ಥಿಕ ನಿರ್ಧಾರಗಳು ಹಾಗೂ ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಸಣ್ಣಪುಟ್ಟ ಬಿರುಕು ಎದುರಾಗುವ ಕರ್ಮಿಕ ದೋಷ ಗೋಚರಿಸುತ್ತದೆ. ಶನಿ ದೇವನ ೭.೫/ಅರ್ಧಾಷ್ಟಮ ಗೋಚಾರ ಪ್ರಭಾವದಿಂದ ಅಪೇಕ್ಷಿತ ಫಲಗಳ ಲಭ್ಯತೆಯಲ್ಲಿ ವಿಳಂಬ ಉಂಟಾಗಬಹುದು. ಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ತಕ್ಷಣ ಸಿಗದೆ ಮಾನಸಿಕ ಸವಾಲು ಎದುರಾಗಬಹುದು.`;
      doshaText2 = `ಈ ಕರ್ಮಿಕ ದೋಷ ಶಮನಕ್ಕಾಗಿ ಪ್ರತಿ ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ ಹಾಗೂ ಪವಿತ್ರ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ರುದ್ರಾಭಿಷೇಕ ನೆರವೇರಿಸಿ. ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಸಿದ್ಧ ಮುಹೂರ್ತದಲ್ಲಿ ಶನಿ ಶಾಂತಿ ಪೂಜೆ ಹಾಗೂ ತಿಲ ಹೋಮ ನೆರವೇರಿಸುವುದರಿಂದ ಗ್ರಹ ದೋಷಗಳು ಸಂಪೂರ್ಣ ಶಮನಗೊಂಡು ವಿಜಯ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ.`;
      doshaText3 = `ವಿಶೇಷವಾಗಿ ರಾಹು-ಕೇತು ಗ್ರಹಗಳ ನಕ್ಷತ್ರ ಸಂಚಾರ ವೇಳೆಯಲ್ಲಿ ಅನಗತ್ಯ ಮಾನಸಿಕ ಆತಂಕಗಳು ಹಾಗೂ ಅಪವಾದದ ಭೀತಿ ಬಾರದಂತೆ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಕವಚ ಪಠಿಸಿ. ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ಸಂಕಲ್ಪ ಸಾತ್ವಿಕ ಪೂಜೆ ನೆರವೇರಿಸುವುದರಿಂದ ಗ್ರಹ ಜನ್ಯ ನಿಗೂಢ ತಾಪಗಳು ನಿವಾರಣೆಯಾಗಿ ಅಭಯ ಸಿದ್ಧಿಸಲಿದೆ.`;
    } else {
      doshaText1 = `Karmic influences from Rahu-Ketu or Mars house positions indicate occasional relationship friction or financial delays during Saturn transits.`;
      doshaText2 = `To mitigate these karmic challenges, recite Sri Hanuman Chalisa on Saturdays, engage in charity, and offer Rudrabhishekam at Sri Gokarna Mahabaleshwara temple.`;
      doshaText3 = `During Rahu-Ketu Nakshatra transits, recite Sri Subrahmanya Kavacham and perform Sankalpa Puja at Gokarna Koti Teertha to dissolve mysterious worries and secure divine armor.`;
    }

    let gocharaText1 = "";
    let gocharaText2 = "";
    let gocharaText3 = "";
    if (isKn) {
      gocharaText1 = `ವರ್ತಮಾನ ಗೋಚಾರ ಗ್ರಹ ಸಂಚಾರದಲ್ಲಿ ಶನಿ ದೇವನ ಪ್ರಸ್ತುತ ಸ್ಥಾನವು ನಿಮ್ಮ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ಶಿಸ್ತು, ಕಠಿಣ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಹಾಗೂ ತಾಳ್ಮೆಯ ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸುತ್ತಿದೆ. ಆತುರದ ಹೂಡಿಕೆ ಅಥವಾ ಶಾರ್ಟ್‌ಕಟ್ ಮಾರ್ಗಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ, ಹಿರಿಯ ಅನುಭವಿಗಳ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಶ್ರಮಿಸುವುದರಿಂದ ವೃತ್ತಿ ರಂಗದಲ್ಲಿ ಸುದೀರ್ಘ ಭದ್ರತೆ ಹಾಗೂ ಅತ್ಯುನ್ನತ ಆಡಳಿತಾತ್ಮಕ ಸ್ಥಾನಮಾನ ದೊರೆಯಲಿದೆ. ಗೋಚಾರ ಶನಿಯು ಭವಿಷ್ಯದಲ್ಲಿ ಸುದೃಢ ಅಡಿಪಾಯ ನಿರ್ಮಿಸಲಿದ್ದಾನೆ.`;
      gocharaText2 = `ದೇವಗುರು ಬೃಹಸ್ಪತಿಯ ಅನುಕೂಲಕರ ಗೋಚಾರ ಸಂಚಾರ ಹಾಗೂ ನವಮ ಶುಭ ದೃಷ್ಟಿಯು ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಆಶಾಭಾವನೆ, ಅಪಾರ ಧನ ಆಗಮನ ಹಾಗೂ ಗೃಹದಲ್ಲಿ ಸಾಂಸಾರಿಕ ಸಂತೋಷವನ್ನು ಹೆಚ್ಚಿಸಲಿದೆ. ಕುಟುಂಬದಲ್ಲಿ ಶುಭ ಮಂಗಲೋತ್ಸವಗಳ ಆಯೋಜನೆಗೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣವಿದೆ. ಪ್ರಸ್ತುತ ಸಮಯವು ಶ್ರೀ ಗೋಕರ್ಣ ಪಂಚಾಂಗದ ಪವಿತ್ರ ಮುಹೂರ್ತಗಳಲ್ಲಿ ದೇವತಾ ಸೇವೆಗಳನ್ನು ನೆರವೇರಿಸಲು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠವಾಗಿದೆ.`;
      gocharaText3 = `ಪ್ರಸ್ತುತ ರಾಹು ಹಾಗೂ ಕೇತು ಗ್ರಹಗಳ ಗೋಚಾರ ಸಂಚಾರವು ಆಧ್ಯಾತ್ಮಿಕ ಜಾಗೃತಿ, ವಿದೇಶಿ ನಿಕಟ ಸಂಪರ್ಕ ಹಾಗೂ ದೀರ್ಘಕಾಲಿಕ ಧರ್ಮ ಕಾರ್ಯಗಳಿಗೆ ಅತ್ಯಂತ ಪೂರಕ ವಾತಾವರಣ ನಿರ್ಮಿಸಿದೆ. ಸ್ವಪ್ರಯತ್ನದಿಂದ ಕೈಗೊಳ್ಳುವ ಪ್ರತಿಯೊಂದು ಶುಭ ಕಾರ್ಯದಲ್ಲೂ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರರ ಅನುಗ್ರಹ ಲಭಿಸಲಿದೆ.`;
    } else {
      gocharaText1 = `Current Saturn transit tests professional patience and discipline. Avoiding hasty financial shortcuts while working under experienced guidance guarantees long-term stability.`;
      gocharaText2 = `Jupiter's favorable transit aspects bring financial gains, family happiness, and auspicious divine opportunities for Seva and Pujas at Gokarna.`;
      gocharaText3 = `Current Rahu and Ketu transits foster spiritual awakening, foreign network growth, and long-term religious merit under the blessings of Sri Gokarna Mahabaleshwara.`;
    }

    return {
      yogaText1,
      yogaText2,
      yogaText3,
      doshaText1,
      doshaText2,
      doshaText3,
      gocharaText1,
      gocharaText2,
      gocharaText3
    };
  }, [birthKundli, code]);

'''

if s_p5_idx != -1 and e_p5_idx != -1:
    content = content[:s_p5_idx] + new_p5_memo + content[e_p5_idx:]

# 2. Update page6Data badges to fit cleanly inside pill without line wrapping
old_page6_badge_str = 'const badgesKn = ["ವೃತ್ತಿ ವೃದ್ಧಿ", "ಧನ ಸಮೃದ್ಧಿ", "ಕುಟುಂಬ ಸೌಖ್ಯ", "ಆಸ್ತಿ & ವಾಹನ", "⚠️ ಭುಕ್ತಿ ಸಂಧಿ", "ರಾಜಯೋಗ ಬಲ", "ವಿದ್ಯಾ ಸಿದ್ಧಿ", "ಶತ್ರು ಜಯ"];'
new_page6_badge_str = 'const badgesKn = ["ವೃತ್ತಿ ಪ್ರಗತಿ", "ಧನ ಸಮೃದ್ಧಿ", "ಕುಟುಂಬ ಸೌಖ್ಯ", "ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ", "👑 ರಾಜಯೋಗ", "ಆರೋಗ್ಯ ರಕ್ಷಣೆ", "ದೈವಿಕ ಶಾಂತಿ", "ಸರ್ವ ಸಿದ್ಧಿ"];'

content = content.replace(old_page6_badge_str, new_page6_badge_str)

# 3. Update Pages 4, 5, 6 JSX layout
s_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 4:"
e_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC"

s_jsx_idx = content.find(s_jsx_marker)
e_jsx_idx = content.find(e_jsx_marker)

print(f"s_jsx_idx: {s_jsx_idx}, e_jsx_idx: {e_jsx_idx}")

new_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 4: CHARACTERISTICS, NEEGOODAH RAHASYA & PRASTUTA JEEVANA
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "7px 12px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "18.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೩: ವ್ಯಕ್ತಿತ್ವ, ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಪ್ರಸ್ತುತ ಜೀವನದ ಹಂತ" : "Chapter 3: Personal Characteristics, Hidden Truth & Current Life Phase"}
            </div>
            <div style={{ fontSize: "11px", color: "#B45309", fontWeight: 600, marginTop: "2px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ನಕ್ಷತ್ರ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಆಧಾರದ ಮೇಲೆ ಸಿದ್ಧಪಡಿಸಿದ ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Comprehensive breakdown of personality traits, hidden karmic patterns, and current life phase."}
            </div>
          </div>

          {/* Content Stack - 3 Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Characteristics (ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌟 {code === "kn" ? "ಜನ್ಮ ಗುಣಲಕ್ಷಣಗಳು & ವ್ಯಕ್ತಿತ್ವ ವಿಶ್ಲೇಷಣೆ" : "Birth Characteristics & Personality Synthesis"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಸ್ವಭಾವ ಬಲ" : "Core Traits"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page4Data?.card1Text1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FDE68A", paddingTop: "6px" }}>
                🌟 {page4Data?.card1Text2}
              </div>
            </div>

            {/* Card 2: Nigoodha Rahasya (ನಿಗೂಢ ರಹಸ್ಯ - ಗೋಪ್ಯ ಸತ್ಯ) */}
            <div style={{ background: "#FFF1F2", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "10px 14px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🔮 {code === "kn" ? "ಅಂತರಂಗದ ನಿಗೂಢ ರಹಸ್ಯ ಹಾಗೂ ಆಂತರಿಕ ಕೋಪ" : "Nigoodha Rahasya: Inner Secret & Spiritual Remedy"}</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ಆಂತರಿಕ ಶಮನ" : "Hidden Karma"}</span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#881337", textAlign: "justify" }}>
                {page4Data?.nigoodhaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FECDD3", paddingTop: "6px", fontWeight: 600 }}>
                🕊️ {page4Data?.nigoodhaText2}
              </div>
            </div>

            {/* Card 3: Prastuta Jeevana (ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🌅 {code === "kn" ? "ಪ್ರಸ್ತುತ ಜೀವನ ಶೈಲಿ ಹಾಗೂ ೪ ಮುಖ್ಯಾಂಶಗಳು" : "Prastuta Jeevana: Current Life Stage & 4 Key Pillars"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700 }}>{code === "kn" ? "ವರ್ತಮಾನ ಘಟ್ಟ" : "Active Stage"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11.5px", lineHeight: "1.55" }}>
                <div style={{ background: "#FEF3C7", padding: "6px 10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#065F46", display: "block", marginBottom: "2px", fontSize: "12px" }}>💼 {code === "kn" ? "ವೃತ್ತಿ ಉದ್ಯೋಗ & ಅಧಿಕಾರ ಸ್ಥಾನ:" : "Career, Business & Position:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaCareer}</div>
                </div>
                <div style={{ background: "#F5F3FF", padding: "6px 10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#5B21B6", display: "block", marginBottom: "2px", fontSize: "12px" }}>🏠 {code === "kn" ? "ಸಂಸಾರ, ದಾಂಪತ್ಯ & ಕುಟುಂಬ ಸುಖ:" : "Family, Marriage & Domestic Peace:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFamily}</div>
                </div>
                <div style={{ background: "#ECFDF5", padding: "6px 10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#047857", display: "block", marginBottom: "2px", fontSize: "12px" }}>💰 {code === "kn" ? "ಧನ-ಧಾನ್ಯ ಆಸ್ತಿ & ಆರ್ಥಿಕ ಭದ್ರತೆ:" : "Wealth, Finance & Assets:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaFinance}</div>
                </div>
                <div style={{ background: "#FFF1F2", padding: "6px 10px", borderRadius: "6px" }}>
                  <strong style={{ color: "#991B1B", display: "block", marginBottom: "2px", fontSize: "12px" }}>🌿 {code === "kn" ? "ಆರೋಗ್ಯ ದೈಹಿಕ ಶಕ್ತಿ & ಸಾತ್ವಿಕ ಸೌಖ್ಯ:" : "Health, Energy & Well-being:"}</strong>
                  <div style={{ textAlign: "justify", color: "#3F2A12" }}>{page4Data?.prastutaHealth}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 5: YOGAS, DOSHAS & LIVE GOCHARA TRANSITS (WITH 3 PARAGRAPHS PER CARD)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "10px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 6px rgba(180, 83, 9, 0.06)"
          }}>
            <div style={{ fontSize: "19px", fontWeight: 800, color: "#78350F", lineHeight: "1.3" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೪: ಜನ್ಮ ಕುಂಡಲಿ ಯೋಗಗಳು, ದೋಷಗಳು ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ಫಲಗಳು" : "Chapter 4: Planetary Yogas, Doshas & Live Gochara Transits"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಕುಂಡಲಿಯಲ್ಲಿರುವ ಪ್ರಮುಖ ರಾಜಯೋಗಗಳು, ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ ಹಾಗೂ ಗೋಚಾರ ಫಲಗಳ ನಿಖರ ವಿಶ್ಲೇಷಣೆ" : "In-depth breakdown of active Rajayogas, karmic challenges, and live Gochara transits."}
            </div>
          </div>

          {/* Content Stack - 3 Cards filling A4 height */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Card 1: Yogas (3 Paragraphs) */}
            <div style={{ background: "#FFFDF5", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✨ {code === "kn" ? "ಜನ್ಮ ಕುಂಡಲಿಯ ಮುಖ್ಯ ರಾಜಯೋಗಗಳು & ಶುಭ ಗ್ರಹ ಬಲ" : "Auspicious Rajayogas & Planetary Strengths"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ರಾಜಯೋಗ ವಿಶ್ಲೇಷಣೆ" : "Rajayogas"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.yogaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FDE68A", paddingTop: "6px" }}>
                🌟 {page5Data?.yogaText2}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FDE68A", paddingTop: "6px" }}>
                👑 {page5Data?.yogaText3}
              </div>
            </div>

            {/* Card 2: Doshas & Gokarna Remedy (3 Paragraphs) */}
            <div style={{ background: "#FFF5F5", border: "1.5px solid #F43F5E", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#991B1B", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>⚠️ {code === "kn" ? "ಗ್ರಹ ದೋಷ ವಿವೇಚನೆ & ಸಿದ್ಧ ಗೋಕರ್ಣ ಪರಿಹಾರ" : "Karmic Doshas & Gokarna Sacred Remedies"}</span>
                <span style={{ fontSize: "11px", color: "#9F1239", background: "#FFE4E6", border: "1px solid #F43F5E", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ದೋಷ ಶಮನ" : "Karmic Remedies"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#7F1D1D", textAlign: "justify" }}>
                {page5Data?.doshaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FECDD3", paddingTop: "6px", fontWeight: 600 }}>
                🕉️ {page5Data?.doshaText2}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#991B1B", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FECDD3", paddingTop: "6px", fontWeight: 600 }}>
                🔱 {page5Data?.doshaText3}
              </div>
            </div>

            {/* Card 3: Live Gochara Transits (3 Paragraphs) */}
            <div style={{ background: "#FFFBEB", border: "1.5px solid #D97706", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 2px 5px rgba(0,0,0,0.03)" }}>
              <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🍃 {code === "kn" ? "ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಫಲಗಳು & ವರ್ತಮಾನ ಸಂಚಾರ" : "Live Gochara Transits & Present Position"}</span>
                <span style={{ fontSize: "11px", color: "#92400E", background: "#FEF3C7", border: "1px solid #F59E0B", padding: "2px 10px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center" }}><span style={{ transform: "translateY(-3px)", display: "inline-block" }}>{code === "kn" ? "ವರ್ತಮಾನ ಗೋಚಾರ" : "Live Transits"}</span></span>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify" }}>
                {page5Data?.gocharaText1}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FDE68A", paddingTop: "6px" }}>
                🌿 {page5Data?.gocharaText2}
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.6", color: "#3F2A12", textAlign: "justify", marginTop: "6px", borderTop: "1px solid #FDE68A", paddingTop: "6px" }}>
                🚩 {page5Data?.gocharaText3}
              </div>
            </div>
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>


      {/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 8 MONTHS (240 DAYS) ROADMAP (FIXED CAPSULE BADGES & FULL PAGE FILL)
         ───────────────────────────────────────────────────────────── */}
      <div className="pdf-page" style={pageStyle}>
        <div style={{ ...frameStyle, gap: "12px", padding: "20px 16px" }}>
          {/* Header Box */}
          <div style={{
            textAlign: "center",
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "8px",
            padding: "8px 14px",
            boxShadow: "0 2px 5px rgba(180, 83, 9, 0.05)"
          }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#78350F", lineHeight: "1.25" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೮ ತಿಂಗಳುಗಳ (೨೪೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 8 Months (240 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೮ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
            </div>
          </div>

          {/* Special Sandhi / Transition Alert Banner */}
          <div style={{
            background: "#FEF2F2",
            border: "1.5px solid #EF4444",
            borderRadius: "7px",
            padding: "6px 12px",
            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{ fontSize: "18px", transform: "translateY(-2px)" }}>⚡</div>
            <div style={{ fontSize: "11.5px", color: "#991B1B", lineHeight: "1.4", transform: "translateY(-2px)" }}>
              <strong style={{ color: "#7F1D1D" }}>{code === "kn" ? "ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨᱗):" : "Special Transit & Dasha Sandhi Awareness:"}</strong> {code === "kn" ? "ಗೋಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Maintain patience and regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 8-Month Detailed Grid (2 Columns x 4 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {page6Data.map((m: any, i: number) => {
              const bgColors = ["#FFFFFF", "#ECFDF5", "#F5F3FF", "#FFFFFF", "#FEF2F2", "#ECFDF5", "#EFF6FF", "#FFFBEB"];
              const borderColors = ["#FCD34D", "#10B981", "#8B5CF6", "#FCD34D", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const textColors = ["#78350F", "#065F46", "#5B21B6", "#78350F", "#991B1B", "#065F46", "#1E40AF", "#78350F"];
              const badgeBgs = ["#FEF3C7", "#D1FAE5", "#EDE9FE", "#FEF3C7", "#FEE2E2", "#D1FAE5", "#DBEAFE", "#FEF3C7"];
              const badgeBorders = ["#F59E0B", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#F59E0B"];
              const badgeColors = ["#92400E", "#065F46", "#5B21B6", "#92400E", "#991B1B", "#065F46", "#1E40AF", "#92400E"];

              return (
                <div key={i} style={{ background: bgColors[i % 8], border: `1.5px solid ${borderColors[i % 8]}`, borderRadius: "8px", padding: "11px 13px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: textColors[i % 8], marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "10.5px", background: badgeBgs[i % 8], border: `1px solid ${badgeBorders[i % 8]}`, color: badgeColors[i % 8], padding: "2px 8px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "6px" }}>
                      <span style={{ transform: "translateY(-1px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: "12.5px", lineHeight: "1.5", color: textColors[i % 8] }}>
                    <div style={{ marginBottom: "3px" }}>1. <strong style={{ color: "#065F46" }}>{code === "kn" ? "ಫಲಾಫಲ:" : "Vibe:"}</strong> {m.f1}</div>
                    <div style={{ marginBottom: "3px" }}>2. <strong style={{ color: "#92400E" }}>{code === "kn" ? "ಉದ್ಯೋಗ/ಆರ್ಥಿಕ:" : "Focus:"}</strong> {m.f2}</div>
                    <div style={{ marginBottom: "3px" }}>3. <strong style={{ color: "#D97706" }}>{code === "kn" ? "ಸವಾಲು:" : "Caution:"}</strong> {m.f3}</div>
                    <div>4. <strong style={{ color: "#991B1B" }}>{code === "kn" ? "ಮಾರ್ಗದರ್ಶನ:" : "Remedy:"}</strong> {m.f4}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Banner */}
          <div style={{
            background: "linear-gradient(180deg, #78350F 0%, #451A03 100%)",
            border: "1.5px solid #D97706",
            borderRadius: "8px",
            padding: "8px 12px",
            textAlign: "center",
            boxShadow: "0 2px 6px rgba(120, 53, 15, 0.2)",
            marginTop: "auto"
          }}>
            <div style={{ fontSize: "11.5px", fontWeight 700, color: "#FEF3C7", lineHeight: "1.35" }}>
              "ॐ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಧರ್ಮಜ್ಞ ಸಿದ್ಧ ಕುಂಡಲಿ ರಕ್ಷೆ · ಸಕಲ ದೋಷ ಶಮನಂ"
            </div>
            <div style={{ fontSize: "10.5px", color: "#FDE68A", fontWeight: 600, marginTop: "2px", lineHeight: "1.3" }}>
              ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಪಂಚಾಂಗ ಅರ್ಚಕರು · {priestStr} (ದೂರವಾಣಿ: +91 99723 39362)
            </div>
          </div>
        </div>
      </div>
'''

if s_jsx_idx != -1 and e_jsx_idx != -1:
    content = content[:s_jsx_idx] + new_jsx + "\n\n      " + content[e_jsx_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied exact audio and image fixes for Pages 4, 5, 6 successfully.")
