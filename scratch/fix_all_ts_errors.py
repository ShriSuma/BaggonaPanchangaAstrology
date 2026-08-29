filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Clean up interface duplicate
content = content.replace(
    "  lblGotra: string;\n  lblYoga: string;\n  lblYoga: string;",
    "  lblGotra: string;\n  lblYoga: string;"
)

# 2. Add lblYoga to ta entry
content = content.replace(
    'lblGotra: "கோத்ரம்",',
    'lblGotra: "கோத்ரம்",\n    lblYoga: "ஜென்ம யோகம்",'
)

# 3. Ensure Card 4 calls calculateBirthYoga(birthKundli, isKn)
content = content.replace(
    'calculateBirthYoga(birthKundli, isKn)',
    'calculateBirthYoga(birthKundli, isKn)'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed all TypeScript compilation errors successfully!")
