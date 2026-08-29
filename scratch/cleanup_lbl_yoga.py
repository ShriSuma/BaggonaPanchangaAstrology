import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace PAGE1_DICT type interface
content = re.sub(
    r'lblGotra:\s*string;\s*\n\s*lblYoga:\s*string;',
    'lblGotra: string;\n  lblYoga: string;',
    content
)

# Fix dict entries
content = content.replace(
    'lblGotra: "ಗೋತ್ರ",\n    lblYoga: "ಜನ್ಮ ಯೋಗ",\n    lblYoga: "ಜನ್ಮ ಯೋಗ",',
    'lblGotra: "ಗೋತ್ರ",\n    lblYoga: "ಜನ್ಮ ಯೋಗ",'
)
content = content.replace(
    'lblGotra: "Gotra",\n    lblYoga: "Janma Yoga",\n    lblYoga: "Janma Yoga",',
    'lblGotra: "Gotra",\n    lblYoga: "Janma Yoga",'
)
content = content.replace(
    'lblGotra: "गोत्र",\n    lblYoga: "जन्म योग",\n    lblYoga: "जन्म योग",',
    'lblGotra: "गोत्र",\n    lblYoga: "जन्म योग",'
)
content = content.replace(
    'lblGotra: "గోత్రం",\n    lblYoga: "జన్మ యోగం",\n    lblYoga: "జన్మ యోగం",',
    'lblGotra: "గోత్రం",\n    lblYoga: "జన్మ యోగం",'
)
content = content.replace(
    'lblGotra: "கோத்திரம்",\n    lblYoga: "ஜென்ம யோகம்",\n    lblYoga: "ஜென்ம யோகம்",',
    'lblGotra: "கோத்திரம்",\n    lblYoga: "ஜென்ம யோகம்",'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Cleaned up lblYoga duplicates successfully!")
