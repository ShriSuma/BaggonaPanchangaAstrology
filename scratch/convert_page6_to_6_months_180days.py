filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update page6Data memo hook to produce 6 months (180 Days)
s_p6_marker = "  // ─── DYNAMIC PAGE 6 DATA (8-Month Roadmap - 240 Days) ───"
e_p6_marker = "  return ("

s_p6_idx = content.find(s_p6_marker)
e_p6_idx = content.find(e_p6_marker, s_p6_idx)

print(f"s_p6_idx: {s_p6_idx}, e_p6_idx: {e_p6_idx}")

new_p6_memo = '''  // ─── DYNAMIC PAGE 6 DATA (6-Month Roadmap - 180 Days) ───
  const page6Data = React.useMemo(() => {
    if (!birthKundli) return [];
    const isKn = code === "kn";

    const monthsKn = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const knOrdinals = [
      "ಒಂದನೇ ತಿಂಗಳು",
      "ಎರಡನೇ ತಿಂಗಳು",
      "ಮೂರನೇ ತಿಂಗಳು",
      "ನಾಲ್ಕನೇ ತಿಂಗಳು",
      "ಐದನೇ ತಿಂಗಳು",
      "ಆರನೇ ತಿಂಗಳು"
    ];

    const now = new Date();
    const curMonthIdx = now.getMonth();
    const curYear = now.getFullYear();

    const themesKn = [
      {
        badge: "💼 ವೃತ್ತಿ ಪ್ರಗತಿ",
        f1: "ದೇವಗುರು ಬೃಹಸ್ಪತಿ ಹಾಗೂ ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೂತನ ಉನ್ನತ ಹುದ್ದೆಯ ಅವಕಾಶ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ಸಂಸ್ಥೆಯಲ್ಲಿ ನಿಮ್ಮ ದಕ್ಷತೆಗೆ ಹಿರಿಯ ಅಧಿಕಾರಿಗಳಿಂದ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆತು ಗೌರವ ವೃದ್ಧಿಸಲಿದೆ.",
        f2: "ವೃತ್ತಿಪರ ನಾಯಕತ್ವಕ್ಕೆ ಪೂರ್ಣ ಬೆಂಬಲ ಲಭ್ಯವಾಗಿ ಆರ್ಥಿಕ ಶ್ರೇಯಸ್ಸು ಉಂಟಾಗಲಿದೆ.",
        f3: "ಅಧಿಕ ಕೆಲಸದ ಒತ್ತಡದಿಂದ ವಿಶ್ರಾಂತಿಯ ಕೊರತೆ ಎದುರಾಗಬಹುದು; ಆರೋಗ್ಯ ಗಮನಿಸಿ.",
        f4: "ಸೂರ್ಯೋದಯಕ್ಕೆ ಅರ್ಘ್ಯ ನೀಡಿ, ಶ್ರೀ ಸೂರ್ಯ ನಮಸ್ಕಾರ ಮಾಡಿ."
      },
      {
        badge: "💰 ಧನ ಸಮೃದ್ಧಿ",
        f1: "ದ್ವಿತೀಯ ಧನ ಭಾವ ಬಲದಿಂದ ೨೦%+ ಆರ್ಥಿಕ ಲಾಭ ಹಾಗೂ ನೂತನ ಹೂಡಿಕೆಗಳು ಪೂರ್ಣ ಫಲಪ್ರದವಾಗಲಿವೆ. ಬಾಕಿ ಉಳಿದಿದ್ದ ಹಳೆಯ ಧನ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಸಫಲತೆ ದೊರೆತು ಕುಟುಂಬದಲ್ಲಿ ನೆಮ್ಮದಿ ಮೂಡಲಿದೆ.",
        f2: "ಹಣಕಾಸಿನ ಹರಿವು ಸುಗಮವಾಗಿ ಆರ್ಥಿಕ ಭದ್ರತೆ ಪೂರ್ಣ ವೃದ್ಧಿಯಾಗಲಿದೆ.",
        f3: "ಅನಗತ್ಯ ಖರ್ಚುಗಳ ಮೇಲೆ ನಿಗ್ರಹ ಅಗತ್ಯ; ಹಣಕಾಸಿನ ಶಿಸ್ತು ಕಾಪಾಡಿ.",
        f4: "ಶುಕ್ರವಾರ ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ ಮಾಡಿ, ಕನಕಧಾರಾ ಸ್ತೋತ್ರ ಪಠಿಸಿ."
      },
      {
        badge: "🏠 ಕುಟುಂಬ ಸೌಖ್ಯ",
        f1: "ಗೃಹದಲ್ಲಿ ಮಂಗಳ ಕಾರ್ಯಗಳ ಶುಭ ಯೋಜನೆ ಹಾಗೂ ಬಂಧುಮಿತ್ರರ ನಿಕಟ ಸಮಾಗಮ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ. ದಾಂಪತ್ಯ ಜೀವನದಲ್ಲಿ ಪರಸ್ಪರ ನಂಬಿಕೆ ಹಾಗೂ ಅಖಂಡ ಸಾಂಸಾರಿಕ ಆನಂದ ನೆಲೆಸಲಿದೆ.",
        f2: "ಕುಟುಂಬದ ಎಲ್ಲಾ ಸದಸ್ಯರ ಸಹಕಾರ ಸಿಕ್ಕು ನೆಮ್ಮದಿಯ ವಾತಾವರಣ ಸೃಷ್ಟಿಯಾಗಲಿದೆ.",
        f3: "ಸಣ್ಣ ಭಿನ್ನಾಭಿಪ್ರಾಯಗಳನ್ನು ಪ್ರೀತಿ ಹಾಗೂ ತಾಳ್ಮೆಯಿಂದ ಬಗೆಹರಿಸಿ.",
        f4: "ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಕುಟುಂಬ ಸಮೇತ ತೀರ್ಥ ದರ್ಶನ ಮಾಡಿ."
      },
      {
        badge: "🎓 ಬೌದ್ಧಿಕ ಸಿದ್ಧಿ",
        f1: "ಚತುರ್ಥ ಸ್ಥಾನದ ಬಲದಿಂದ ಭೂಮಿ, ಗೃಹ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಂತಿಮ ಯಶಸ್ಸು ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ. ನೂತನ ವಾಹನ ಅಥವಾ ಮೌಲ್ಯಯುತ ಗೃಹೋಪಕರಣಗಳ ಖರೀದಿ ಯೋಗ ಸಿದ್ಧಿಸಲಿದೆ.",
        f2: "ಸ್ಥಿರಾಸ್ತಿಯ ಮೌಲ್ಯ ಹೆಚ್ಚಿ ಕುಟುಂಬದಲ್ಲಿ ಆನಂದ ಉಂಟಾಗಲಿದೆ.",
        f3: "ಆಸ್ತಿ ನೋಂದಣಿ ಪತ್ರಗಳನ್ನು ಕೂಲಂಕಷವಾಗಿ ಪರಿಶೀಲಿಸಿ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಿ.",
        f4: "ಶನಿವಾರ ಶ್ರೀ ಹನುಮಾನ್ ಚಾಲೀಸಾ ಪಠಿಸಿ, ಬಡವರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ."
      },
      {
        badge: "👑 ರಾಜಯೋಗ ಬಲ",
        f1: "ಶನಿ-ಬುಧ ಭುಕ್ತಿ ಸಂಧಿಯ ಕಾಲ; ಹೊಸ ಯೋಜನೆಗಳಿಗೆ ಸೂಕ್ತ ಪೂರ್ವ ತಯಾರಿ ಹಾಗೂ ವಿವೇಕ ಅಗತ್ಯ. ಆತುರದ ನಿರ್ಧಾರಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತಪ್ಪಿಸಿ ತಾಳ್ಮೆಯಿಂದ ಕರ್ತವ್ಯ ನಿರ್ವಹಿಸಿ.",
        f2: "ಉದ್ಯೋಗ ಕ್ಷೇತ್ರದಲ್ಲಿ ಸ್ಥಿರತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಸಂಯಮ ಅತ್ಯಗತ್ಯ.",
        f3: "ಮಾನಸಿಕ ಚಾಂಚಲ್ಯ ಹಾಗೂ ಸಣ್ಣ ವೈಚಾರಿಕ್ ಗೊಂದಲ ಎದುರಾಗಬಹುದು.",
        f4: "ಬುಧವಾರ ಶ್ರೀ ವಿಷ್ಣು ಸಹಸ್ರನಾಮ ಪಠಿಸಿ, ಹಸಿರು ಬೇಳೆ ದಾನ ಮಾಡಿ."
      },
      {
        badge: "🛡️ ಆರೋಗ್ಯ ರಕ್ಷಣೆ",
        f1: "ಬುಧ ಅಂತರ್ದಶೆಯ ಪೂರ್ಣ ಶುಭಾರಂಭದಿಂದ ಬೌದ್ಧಿಕ ತೇಜಸ್ಸು ಹಾಗೂ ವಾಗ್ಬಲ ವೃದ್ಧಿಯಾಗಲಿದೆ. ನೂತನ ಉದ್ಯೋಗ ಪ್ರಮೋಷನ್, ಸಂಬಳ ಏರಿಕೆ ಹಾಗೂ ವ್ಯಾಪಾರ ಶ್ರೇಯಸ್ಸು ದೊರೆಯಲಿದೆ.",
        f2: "ಕಾಯಕ ಕ್ಷೇತ್ರದಲ್ಲಿ ನಿಮ್ಮ ಕಾರ್ಯಕ್ಕೆ ಪೂರ್ಣ ಮಾನ್ಯತೆ ದೊರೆಯಲಿದೆ.",
        f3: "ಅತಿಯಾದ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಸಣ್ಣ ಸಣ್ಣ ತಪ್ಪುಗಳು ಸಂಭವಿಸದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.",
        f4: "ನಿತ್ಯ ಪ್ರಾಣಾಯಾಮ ಹಾಗೂ ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ ಸ್ವಾಮಿ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ."
      }
    ];

    const themesEn = [
      {
        badge: "💼 Career Advancement",
        f1: "Influenced by Jupiter and the Lagna Lord, new high-level professional opportunities open up. Executive leadership will recognize and honor your dedication.",
        f2: "Professional support enhances financial status and monetary stability.",
        f3: "High workload may cause fatigue; prioritize rest.",
        f4: "Offer Arghya to Sun God and perform Surya Namaskar."
      },
      {
        badge: "💰 Wealth Growth",
        f1: "Strong 2nd house alignment brings 20%+ financial growth and profitable investments. Pending dues will be successfully recovered.",
        f2: "Smooth cash flow consolidates overall economic security.",
        f3: "Control unnecessary expenditure; maintain financial discipline.",
        f4: "Perform Sri Lakshmi Puja on Fridays and recite Kanakadhara Stotram."
      },
      {
        badge: "🏠 Family Joy",
        f1: "Auspicious family functions and gatherings with relatives will take place. Domestic life will be filled with mutual trust and harmony.",
        f2: "Support from all family members creates a peaceful environment.",
        f3: "Resolve minor differences with patience and affection.",
        f4: "Pray to Kuladevata and visit sacred pilgrimage sites."
      },
      {
        badge: "🎓 Wisdom & Success",
        f1: "Fourth house strength favors real estate, land, and vehicle purchases. High-value domestic appliances or property deals will be finalized.",
        f2: "Property values increase, bringing joy to family.",
        f3: "Thoroughly inspect property registration documents.",
        f4: "Recite Sri Hanuman Chalisa on Saturdays and offer food to the needy."
      },
      {
        badge: "👑 Raja Yoga Power",
        f1: "Saturn-Mercury Bhukti Sandhi period requires careful planning for new initiatives. Avoid impulsive financial decisions.",
        f2: "Patience and restraint are essential for career stability.",
        f3: "Minor mental restlessness or dilemma may arise.",
        f4: "Recite Sri Vishnu Sahasranamam on Wednesdays."
      },
      {
        badge: "🛡️ Health & Protection",
        f1: "Onset of Mercury Antardasha enhances intellectual sharpness and communication skills. Promotions and business growth are highly indicated.",
        f2: "Your work receives full appreciation in your organization.",
        f3: "Avoid overconfidence to prevent minor errors.",
        f4: "Practice daily Pranayama and pray to Lord Subrahmanya."
      }
    ];

    return Array.from({ length: 6 }, (_, i) => {
      const mIdx = (curMonthIdx + i) % 12;
      const yr = curYear + Math.floor((curMonthIdx + i) / 12);
      const mName = isKn ? monthsKn[mIdx] : monthsEn[mIdx];
      const mTitle = isKn ? `${knOrdinals[i]} (${mName} ${toKnDigits(yr)})` : `Month ${i + 1} (${mName} ${yr})`;
      const theme = isKn ? themesKn[i % 6] : themesEn[i % 6];

      return {
        mTitle,
        badge: theme.badge,
        f1: theme.f1,
        f2: theme.f2,
        f3: theme.f3,
        f4: theme.f4
      };
    });
  }, [birthKundli, code]);

'''

if s_p6_idx != -1 and e_p6_idx != -1:
    content = content[:s_p6_idx] + new_p6_memo + content[e_p6_idx:]

# 2. Update Page 6 JSX layout for 6 months (2 columns x 3 rows) and clean title/badge layout
s_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 6:"
e_jsx_marker = "{/* ─────────────────────────────────────────────────────────────\n          PAGE 7: ROYAL 90-DAY CALENDAR SYNC"

s_jsx_idx = content.find(s_jsx_marker)
e_jsx_idx = content.find(e_jsx_marker)

print(f"s_jsx_idx: {s_jsx_idx}, e_jsx_idx: {e_jsx_idx}")

new_p6_jsx = '''{/* ─────────────────────────────────────────────────────────────
          PAGE 6: 100% NEXT 6 MONTHS (180 DAYS) ROADMAP (2 COLUMNS x 3 ROWS)
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
            <div style={{ fontSize: "18.5px", fontWeight: 800, color: "#78350F", lineHeight: "1.25" }}>
              {code === "kn" ? "ಅಧ್ಯಾಯ ೫: ಮುಂಬರುವ ೬ ತಿಂಗಳುಗಳ (೧೮೦ ದಿನಗಳು) ಸಮಗ್ರ ಜ್ಯೋತಿಷ್ಯ ಕಾರ್ಯಾಚರಣೆ ರೋಡ್‌ಮ್ಯಾಪ್" : "Chapter 5: Upcoming 6 Months (180 Days) Planetary Roadmap"}
            </div>
            <div style={{ fontSize: "11.5px", color: "#B45309", fontWeight: 600, marginTop: "3px" }}>
              📜 {code === "kn" ? "ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿ, ಪ್ರಸ್ತುತ ಗೋಚಾರ ಗ್ರಹ ಬಲ ಹಾಗೂ ದಶಾ-ಅಂತರ್ದಶಾ ಆಧಾರಿತ ಮುಂಬರುವ ೬ ತಿಂಗಳ ನಿಖರ ಜ್ಯೋತಿಷ್ಯ ಮಾರ್ಗದರ್ಶನ" : "Dynamic month-by-month planetary guidance tailored to your chart."}
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
              <strong style={{ color: "#7F1D1D" }}>{code === "kn" ? "ವಿಶೇಷ ಗೋಚಾರ & ದಶಾ ಸಂಧಿ ಜಾಗೃತಿ (೨೦೨೬-೨೦೨೭):" : "Special Transit & Dasha Sandhi Awareness:"}</strong> {code === "kn" ? "ಗೋಚಾರ ಹಾಗೂ ದಶಾ ಸಂಧಿ ಕಾಲದಲ್ಲಿ ಮುಖ್ಯ ಆರ್ಥಿಕ ಒಪ್ಪಂದಗಳಲ್ಲಿ ತಾಳ್ಮೆ ವಹಿಸಿ, ಪೂಜಾ ಆರಾಧನೆ ಕಾಯ್ದುಕೊಳ್ಳಿ." : "Maintain patience and regular prayers during planetary transit shifts."}
            </div>
          </div>

          {/* 6-Month Detailed Grid (2 Columns x 3 Rows) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {page6Data.map((m: any, i: number) => {
              const bgColors = ["#FFFFFF", "#ECFDF5", "#F5F3FF", "#FFFFFF", "#FEF2F2", "#ECFDF5"];
              const borderColors = ["#FCD34D", "#10B981", "#8B5CF6", "#FCD34D", "#EF4444", "#10B981"];
              const textColors = ["#78350F", "#065F46", "#5B21B6", "#78350F", "#991B1B", "#065F46"];
              const badgeBgs = ["#FEF3C7", "#D1FAE5", "#EDE9FE", "#FEF3C7", "#FEE2E2", "#D1FAE5"];
              const badgeBorders = ["#F59E0B", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];
              const badgeColors = ["#92400E", "#065F46", "#5B21B6", "#92400E", "#991B1B", "#065F46"];

              return (
                <div key={i} style={{ background: bgColors[i % 6], border: `1.5px solid ${borderColors[i % 6]}`, borderRadius: "8px", padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: textColors[i % 6], marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12.5px", fontWeight: 800 }}>🗓️ {m.mTitle}</span>
                    <span style={{ fontSize: "10.5px", background: badgeBgs[i % 6], border: `1px solid ${badgeBorders[i % 6]}`, color: badgeColors[i % 6], padding: "2px 8px", borderRadius: "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <span style={{ transform: "translateY(-1px)", display: "inline-block" }}>{m.badge}</span>
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", lineHeight: "1.5", color: textColors[i % 6] }}>
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
            <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#FEF3C7", lineHeight: "1.35" }}>
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
    content = content[:s_jsx_idx] + new_p6_jsx + "\n\n      " + content[e_jsx_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Converted Page 6 to 6 Months (180 Days) cleanly with non-overlapping header badges.")
