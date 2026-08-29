filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add import for patrikaNavamshaFromDegree if missing
if "patrikaNavamshaFromDegree" not in content:
    content = content.replace(
        'import { transliterateName } from "../../../utils/transliterator";',
        'import { transliterateName } from "../../../utils/transliterator";\nimport { patrikaNavamshaFromDegree } from "../../../core/localeNumbers";'
    )

# Update renderSouthIndianGrid to calculate patrikaNavamshaFromDegree (1 to 12) for all planets and Lagna
old_grid_calc = '''  if (kundli && kundli.planets) {
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
  }'''

new_grid_calc = '''  if (kundli && kundli.planets) {
    for (const p of kundli.planets) {
      let rIdx = 0;
      let amshaka = patrikaNavamshaFromDegree(p.degree || 0);
      if (isD9) {
        const totalDeg = (p.rashi ? p.rashi.index * 30 : 0) + (p.degreeInRashi || p.degree || 0);
        rIdx = Math.floor(totalDeg / (30 / 9)) % 12;
      } else {
        rIdx = p.rashi ? p.rashi.index : 0;
      }
      const plName = (PLANET_SHORT_L5[p.name || p.planet] as any)?.[code] || p.name || p.planet;
      planetsByRashi[rIdx].push({ name: plName, amshaka });
    }
  }'''

content = content.replace(old_grid_calc, new_grid_calc)

# Update renderCell in renderSouthIndianGrid to display Lagna Amshaka and Planet Amshaka
old_cell_lagna_render = '''        {isLagnaCell && (
          <div style={{ color: "#B91C1C", fontWeight: 800, fontSize: "10px" }}>
            {isKn ? "ಲಗ್ನ" : "Lagna"}
          </div>
        )}
        {planetsHere.map((pl, idx) => (
          <div key={idx} style={{ color: "#1E3A8A", fontWeight: 800, fontSize: "9.5px", lineHeight: "1.2" }}>
            {pl.name} {!isD9 ? toKnDigits(pl.deg) : ""}
          </div>
        ))}'''

new_cell_lagna_render = '''        {isLagnaCell && (
          <div style={{ color: "#B91C1C", fontWeight: 800, fontSize: "10px" }}>
            {isKn ? `ಲಗ್ನ ${kundli?.ascendant !== undefined ? toKnDigits(patrikaNavamshaFromDegree(kundli.ascendant)) : ""}` : `Lagna ${kundli?.ascendant !== undefined ? patrikaNavamshaFromDegree(kundli.ascendant) : ""}`}
          </div>
        )}
        {planetsHere.map((pl, idx) => (
          <div key={idx} style={{ color: "#1E3A8A", fontWeight: 800, fontSize: "9.5px", lineHeight: "1.2" }}>
            {pl.name} {isKn ? toKnDigits(pl.amshaka) : pl.amshaka}
          </div>
        ))}'''

content = content.replace(old_cell_lagna_render, new_cell_lagna_render)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated renderSouthIndianGrid to use patrikaNavamshaFromDegree (1-12) for planets and Lagna successfully.")
