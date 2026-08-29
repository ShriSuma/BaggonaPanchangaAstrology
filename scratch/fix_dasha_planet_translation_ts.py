filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_dasha = '((PLANET_L5[traditionalPanchanga.dashaLord as keyof typeof PLANET_L5] as any)?.[code] || (PLANET_L5[traditionalPanchanga.dashaLord as keyof typeof PLANET_L5] as any)?.kn || traditionalPanchanga.dashaLord)'
new_dasha = '(PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.[code] || PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.kn || PLANET_KN_MAP[traditionalPanchanga.dashaLord] || traditionalPanchanga.dashaLord)'

content = content.replace(old_dasha, new_dasha)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed dasha lord planet translation using PLANET_SHORT_L5 successfully!")
