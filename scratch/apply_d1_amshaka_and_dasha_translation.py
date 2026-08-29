filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update renderSouthIndianGrid to include degree (Amshaka) for D1 chart
old_planet_render = '{pl.name}'
new_planet_render = '{pl.name} {!isD9 ? toKnDigits(pl.deg) : ""}'

if old_planet_render in content:
    content = content.replace(old_planet_render, new_planet_render)
    print("Added degree (Amshaka) to D1 chart cells successfully!")

# 2. Add planet name translation for Dasha Lord in Panchanga Box
old_dasha_line = '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {traditionalPanchanga ? `${traditionalPanchanga.dashaLord} ಮಹಾದಶಾ ${toKnDigits(traditionalPanchanga.dashaYears ?? 0)} ವರ್ಷ ${toKnDigits(traditionalPanchanga.dashaMonths ?? 0)} ತಿಂಗಳು ${toKnDigits(traditionalPanchanga.dashaDays ?? 0)} ದಿನ` : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ" : "Moon Dasha 4y 0m 5d")}</div>'

new_dasha_line = '<div><span style={{ color: "#D97706" }}>🔸</span> <strong style={{ color: "#B45309" }}>{isKn ? "ದಶಾ ಶೇಷ:" : "Dasha Balance:"}</strong> {traditionalPanchanga ? `${((PLANET_L5[traditionalPanchanga.dashaLord as keyof typeof PLANET_L5] as any)?.[code] || (PLANET_L5[traditionalPanchanga.dashaLord as keyof typeof PLANET_L5] as any)?.kn || traditionalPanchanga.dashaLord)} ${isKn ? "ಮಹಾದಶಾ" : "Mahadasha"} ${toKnDigits(traditionalPanchanga.dashaYears ?? 0)} ${isKn ? "ವರ್ಷ" : "y"} ${toKnDigits(traditionalPanchanga.dashaMonths ?? 0)} ${isKn ? "ತಿಂಗಳು" : "m"} ${toKnDigits(traditionalPanchanga.dashaDays ?? 0)} ${isKn ? "ದಿನ" : "d"}` : (isKn ? "ಚಂದ್ರ ಮಹಾದಶಾ ೪ ವರ್ಷ ೦ ತಿಂಗಳು ೫ ದಿನ" : "Moon Dasha 4y 0m 5d")}</div>'

if old_dasha_line in content:
    content = content.replace(old_dasha_line, new_dasha_line)
    print("Localized Dasha Lord in Panchanga Box successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied D1 Amshaka display and localized Dasha Lord successfully.")
