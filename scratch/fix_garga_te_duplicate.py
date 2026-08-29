filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'garga: { kn: "ಗರ್ಗ", en: "Garga", hi: "गर्ग", te: "गर्ग", te: "గర్గ", ta: "கர்க" }',
    'garga: { kn: "ಗರ್ಗ", en: "Garga", hi: "गर्ग", te: "గర్గ", ta: "கர்க" }'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed duplicate te key in garga entry successfully!")
