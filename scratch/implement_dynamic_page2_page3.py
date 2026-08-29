import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add generateBhuktiTimeline import if missing
if "generateBhuktiTimeline" not in content:
    content = content.replace(
        'import { patrikaNavamshaFromDegree } from "../../../core/localeNumbers";',
        'import { patrikaNavamshaFromDegree } from "../../../core/localeNumbers";\nimport { generateBhuktiTimeline } from "../../../core/DashaBhuktiEngine";'
    )

# 2. Update renderSouthIndianGrid to include Retrograde (ವ) and Maandi (ಮಾಂದಿ)
old_grid_func = '''  if (kundli && kundli.planets) {
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

new_grid_func = '''  if (kundli && kundli.planets) {
    for (const p of kundli.planets) {
      let rIdx = 0;
      let amshaka = patrikaNavamshaFromDegree(p.degree || 0);
      if (isD9) {
        const totalDeg = (p.rashi ? p.rashi.index * 30 : 0) + (p.degreeInRashi || p.degree || 0);
        rIdx = Math.floor(totalDeg / (30 / 9)) % 12;
      } else {
        rIdx = p.rashi ? p.rashi.index : 0;
      }
      const isRet = p.isRetrograde ? true : false;
      const retSuffix = isRet ? (isKn ? "(ವ)" : "(R)") : "";
      const baseName = (PLANET_SHORT_L5[p.name || p.planet] as any)?.[code] || p.name || p.planet;
      const plName = baseName + retSuffix;
      planetsByRashi[rIdx].push({ name: plName, amshaka });
    }
  }

  // Include Maandi if present
  if (kundli && kundli.maandi && kundli.maandi.degree !== undefined) {
    const maandiDeg = (kundli.maandi.degree % 360 + 360) % 360;
    let mIdx = 0;
    let mAmshaka = patrikaNavamshaFromDegree(maandiDeg);
    if (isD9) {
      mIdx = Math.floor(maandiDeg / (30 / 9)) % 12;
    } else {
      mIdx = Math.floor(maandiDeg / 30) % 12;
    }
    const maandiName = (PLANET_SHORT_L5["Maandi"] as any)?.[code] || (isKn ? "ಮಾಂದಿ" : "Maandi");
    planetsByRashi[mIdx].push({ name: maandiName, amshaka: mAmshaka });
  }'''

if old_grid_func in content:
    content = content.replace(old_grid_func, new_grid_func)

print("Updated renderSouthIndianGrid with retrograde and Maandi successfully.")
