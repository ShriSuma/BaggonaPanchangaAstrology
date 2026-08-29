filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '  const rashiRemedy = rashiRemedyMapL5[rashiIdx]?.[code] || rashiRemedyMapL5[rashiIdx]?.kn || rashiRemedyMapL5[5].kn;\n  const rashiRemedy = rashiRemedyMap[rashiIdx] || rashiRemedyMap[5];',
    '  const rashiRemedy = rashiRemedyMapL5[rashiIdx]?.[code] || rashiRemedyMapL5[rashiIdx]?.kn || rashiRemedyMapL5[5].kn;'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed duplicate rashiRemedy variable successfully!")
