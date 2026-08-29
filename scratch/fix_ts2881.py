filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'const lagnaIdx = isD9 \n    ? (kundli?.navamshaLagnaIndex ?? ((kundli?.lagnaRashi?.index * 9) % 12) ?? 0)\n    : (kundli?.lagnaRashi?.index ?? 0);',
    'const lagnaIdx = isD9 \n    ? (kundli?.navamshaLagnaIndex !== undefined ? kundli.navamshaLagnaIndex : (((kundli?.lagnaRashi?.index || 0) * 9) % 12))\n    : (kundli?.lagnaRashi?.index ?? 0);'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS2881 expression successfully!")
