import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Helper function code to insert before export const RoyalBooklet8PageTemplate
dynamic_kundli_helpers = '''
// Planet Short Name Map (L5)
const PLANET_SHORT_L5: Record<string, Record<string, string>> = {
  Sun: { kn: "ಸೂರ್ಯ", en: "Sun", hi: "सूर्य", te: "సూర్యుడు", ta: "சூரியன்" },
  Moon: { kn: "ಚಂದ್ರ", en: "Moon", hi: "चंद्र", te: "చంద్రుడు", ta: "சந்திரன்" },
  Mars: { kn: "ಮಂಗಳ", en: "Mars", hi: "मंगल", te: "కుజుడు", ta: "செவ்வாய்" },
  Mercury: { kn: "ಬುಧ", en: "Merc", hi: "बुध", te: "బుధుడు", ta: "புதன்" },
  Jupiter: { kn: "ಗುರು", en: "Jup", hi: "गुरु", te: "గురుడు", ta: "குரு" },
  Venus: { kn: "ಶುಕ್ರ", en: "Ven", hi: "शुक्र", te: "శుక్రుడు", ta: "சுக்கிரன்" },
  Saturn: { kn: "ಶನಿ", en: "Sat", hi: "शनि", te: "శని", ta: "சனி" },
  Rahu: { kn: "ರಾಹು", en: "Rahu", hi: "राहु", te: "రాహువు", ta: "ராகு" },
  Ketu: { kn: "ಕೇತು", en: "Ketu", hi: "केतु", te: "కేతువు", ta: "கேது" },
  Maandi: { kn: "ಮಾಂದಿ", en: "Mandi", hi: "मांदि", te: "మాంది", ta: "மாந்தி" }
};

/** Dynamic South Indian Grid Generator for D1 and D9 */
const renderSouthIndianGrid = (
  kundli: any,
  isD9: boolean,
  code: string,
  displayName: string,
  dobStr: string,
  tobStr: string
) => {
  const isKn = code === "kn";
  const lagnaIdx = isD9 
    ? (kundli?.navamshaLagnaIndex ?? ((kundli?.lagnaRashi?.index * 9) % 12) ?? 0)
    : (kundli?.lagnaRashi?.index ?? 0);

  const lagnaRashiName = (RASHI_L5[lagnaIdx] as any)?.[code] || (RASHI_L5[lagnaIdx] as any)?.kn || RASHI_KN_MAP[lagnaIdx] || "ಲಗ್ನ";

  // Planets by sign index (0 to 11)
  const planetsByRashi: Record<number, Array<{ name: string; deg: number }>> = {};
  for (let i = 0; i < 12; i++) planetsByRashi[i] = [];

  if (kundli && kundli.planets) {
    for (const p of kundli.planets) {
      let rIdx = 0;
      let deg = Math.floor(p.degreeInRashi || p.degree || 1);
      if (isD9) {
        const totalDeg = (p.rashi ? p.rashi.index * 30 : 0) + (p.degreeInRashi || p.degree || 0);
        rIdx = Math.floor(totalDeg / (30 / 9)) % 12;
      } else {
        rIdx = p.rashi ? p.rashi.index : 0;
      }
      const plName = (PLANET_SHORT_L5[p.name || p.planet] as any)?.[code] || p.name || p.planet;
      planetsByRashi[rIdx].push({ name: plName, deg });
    }
  }

  // Cell Renderer for a specific Rashi Index
  const renderCell = (rIdx: number) => {
    const rName = (RASHI_L5[rIdx] as any)?.[code] || RASHI_KN_MAP[rIdx] || "";
    const isLagnaCell = rIdx === lagnaIdx;
    const planetsHere = planetsByRashi[rIdx] || [];

    return (
      <div style={{ border: "1px solid #B45309", padding: "2px 4px", fontSize: "10px", minHeight: "65px", boxSizing: "border-box" }}>
        <div style={{ color: "#78350F", fontWeight: 800, fontSize: "10.5px", borderBottom: "1px solid #FDE68A", paddingBottom: "1px", marginBottom: "2px" }}>
          {rName}
        </div>
        {isLagnaCell && (
          <div style={{ color: "#B91C1C", fontWeight: 800, fontSize: "10px" }}>
            {isKn ? "ಲಗ್ನ" : "Lagna"}
          </div>
        )}
        {planetsHere.map((pl, idx) => (
          <div key={idx} style={{ color: "#1E3A8A", fontWeight: 800, fontSize: "9.5px", lineHeight: "1.2" }}>
            {pl.name} {!isD9 ? toKnDigits(pl.deg) : ""}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      width: "360px",
      height: "300px",
      margin: "0 auto",
      border: "2px solid #D97706",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(4, 1fr)",
      boxSizing: "border-box",
      background: "#FFFDF7"
    }}>
      {/* Row 1 (Top): Meena (11), Mesha (0), Vrishabha (1), Mithuna (2) */}
      {renderCell(11)}
      {renderCell(0)}
      {renderCell(1)}
      {renderCell(2)}

      {/* Row 2: Kumbha (10), Center Box, Karka (3) */}
      {renderCell(10)}
      <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px", textAlign: "center" }}>
        <div style={{ fontSize: "13.5px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
        <div style={{ fontSize: "10px", color: "#B45309", marginTop: "2px" }}>
          {isKn ? `ಜನನ: ${toKnDigits(dobStr)} | ಸಮಯ:` : `DOB: ${dobStr} | Time:`}
        </div>
        <div style={{ fontSize: "10px", color: "#B45309" }}>
          {tobStr}
        </div>
        <div style={{ fontSize: "10.5px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>
          {isKn ? `ಲಗ್ನ: ${lagnaRashiName}` : `Lagna: ${lagnaRashiName}`}
        </div>
      </div>
      {renderCell(3)}

      {/* Row 3: Makara (9), Simha (4) */}
      {renderCell(9)}
      {renderCell(4)}

      {/* Row 4 (Bottom): Dhanu (8), Vrishchika (7), Tula (6), Kanya (5) */}
      {renderCell(8)}
      {renderCell(7)}
      {renderCell(6)}
      {renderCell(5)}
    </div>
  );
};
'''

if "renderSouthIndianGrid" not in content:
    content = content.replace("export const RoyalBooklet8PageTemplate", dynamic_kundli_helpers + "\nexport const RoyalBooklet8PageTemplate")

# Replace D1 Chart block on Page 2
old_d1_jsx = '''          {/* D1 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #D97706",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಾಂದಿ ೦೬</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶುಕ್ರ ೦೧</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ ೦೨<br/>ಕೇತು ೦೨</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಬುಧ ೦೩</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ ೦೮</span></div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>{displayName}</div>
                <div style={{ fontSize: "10.5px", color: "#B45309", marginTop: "2px" }}>ಜನನ: 1993-05-31 | ಸಮಯ:</div>
                <div style={{ fontSize: "10.5px", color: "#B45309" }}>09:25 AM (ಪೂರ್ವಾಹ್ನ)</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ ೦೪</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ ೧೦</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಕರ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ರಾಹು ೦೯</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ತುಲಾ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ ೦೩<br/>ಗುರು ೦೧</span></div>
            </div>
          </div>'''

new_d1_jsx = '''          {/* Dynamic D1 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              🌌 ದ್ವಾದಶ ಭಾವ ಕುಂಡಲಿ
            </div>
            {renderSouthIndianGrid(birthKundli, false, code, displayName, dobStr, tobStr)}
          </div>'''

content = content.replace(old_d1_jsx, new_d1_jsx)

# Replace D9 Chart block on Page 2
old_d9_jsx = '''          {/* D9 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "8px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            <div style={{
              width: "360px",
              height: "300px",
              margin: "0 auto",
              border: "2px solid #D97706",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(180, 83, 9, 0.08)",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(4, 1fr)",
              boxSizing: "border-box",
              background: "#FFFDF7"
            }}>
              {/* Row 1 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೀನ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮೇಷ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಗುರು<br/>ಶುಕ್ರ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ವೃಷಭ</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಮಿಥುನ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಚಂದ್ರ<br/>ಕೇತು</span></div>
              
              {/* Row 2 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕುಂಭ</span><br/>-</div>
              <div style={{ gridColumn: "span 2", gridRow: "span 2", border: "1.5px solid #78350F", background: "#FEF3C7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#78350F" }}>ನವಾಂಶ ಕುಂಡಲಿ</div>
                <div style={{ fontSize: "11px", color: "#B45309", marginTop: "2px" }}>{displayName}</div>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#B91C1C", marginTop: "2px" }}>ನವಾಂಶ ಲಗ್ನ: ಕರ್ಕಾಟಕ</div>
              </div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight: 800 }}>ಕರ್ಕಾ</span><br/><span style={{ color: "#B91C1C", fontWeight: 800 }}>ಲಗ್ನ</span></div>

              {/* Row 3 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ಮಕರ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಮಂಗಳ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ಸಿಂಹ</span><br/>-</div>

              {/* Row 4 */}
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ಧನು</span><br/>-</div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ವೃಶ್ಚಿಕ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಶನಿ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ತುಲಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight 800 }}>ಬುಧ</span></div>
              <div style={{ border: "1px solid #B45309", padding: "2px", fontSize: "10px" }}><span style={{ color: "#78350F", fontWeight 800 }}>ಕನ್ಯಾ</span><br/><span style={{ color: "#1E3A8A", fontWeight: 800 }}>ಸೂರ್ಯ<br/>ರಾಹು<br/>ಮಾಂದಿ</span></div>
            </div>
          </div>'''

new_d9_jsx = '''          {/* Dynamic D9 Chart */}
          <div style={{ textAlign: "center", marginTop: "12px", marginBottom: "12px" }}>
            <div style={{ fontSize: "13.5px", fontWeight 800, color: "#78350F", marginBottom: "8px" }}>
              ❇️ ನವಾಂಶ ಕುಂಡಲಿ
            </div>
            {renderSouthIndianGrid(birthKundli, true, code, displayName, dobStr, tobStr)}
          </div>'''

content = content.replace(old_d9_jsx, new_d9_jsx)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 2 Kundli grids to be 100% dynamic successfully!")
