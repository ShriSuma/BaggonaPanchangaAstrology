filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "identity?.latitude", "(identity as any)?.latitude"
)

content = content.replace(
    "identity?.longitude", "(identity as any)?.longitude"
)

content = content.replace(
    "toKnDigits(traditionalPanchanga.dashaYears)",
    "toKnDigits(traditionalPanchanga.dashaYears ?? 0)"
)

content = content.replace(
    "toKnDigits(traditionalPanchanga.dashaMonths)",
    "toKnDigits(traditionalPanchanga.dashaMonths ?? 0)"
)

content = content.replace(
    "toKnDigits(traditionalPanchanga.dashaDays)",
    "toKnDigits(traditionalPanchanga.dashaDays ?? 0)"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed traditionalPanchanga TS errors successfully!")
