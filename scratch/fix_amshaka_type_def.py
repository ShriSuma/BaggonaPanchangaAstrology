filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'const planetsByRashi: Record<number, Array<{ name: string; deg: number }>> = {};',
    'const planetsByRashi: Record<number, Array<{ name: string; amshaka: number }>> = {};'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated planetsByRashi type definition to amshaka successfully.")
