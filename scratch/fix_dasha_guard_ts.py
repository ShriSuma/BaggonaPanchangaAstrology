filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_code = '(PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.[code] || PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.kn || PLANET_KN_MAP[traditionalPanchanga.dashaLord] || traditionalPanchanga.dashaLord)'
new_code = '(traditionalPanchanga.dashaLord ? (PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.[code] || PLANET_SHORT_L5[traditionalPanchanga.dashaLord]?.kn || PLANET_KN_MAP[traditionalPanchanga.dashaLord] || traditionalPanchanga.dashaLord) : (isKn ? "ಚಂದ್ರ" : "Moon"))'

content = content.replace(old_code, new_code)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed dasha lord guard TS error successfully!")
