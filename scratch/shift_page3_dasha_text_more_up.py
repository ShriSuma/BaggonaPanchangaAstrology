import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Top Right Badge Pill on Page 3: translateY(-2px) -> translateY(-5px), padding: "0px 10px 2px 10px"
content = re.sub(
    r'padding:\s*"1px 12px 3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.3",\s*\n\s*transform:\s*"translateY\(-2px\)"',
    r'padding: "0px 10px 2px 10px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.25",\n                  transform: "translateY(-5px)"',
    content
)

# 2. Update Dasha Header Title line: translateY(-1px) -> translateY(-4px)
content = re.sub(
    r'<span style=\{\{\s*display:\s*"inline-flex",\s*alignItems:\s*"center",\s*lineHeight:\s*"1\.35",\s*transform:\s*"translateY\(-1px\)"\s*\}\}>',
    r'<span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.25", transform: "translateY(-4px)" }}>',
    content
)

# 3. Update Duration Date Bar line: translateY(-1px) -> translateY(-4px), padding: "0px 8px 2px 8px", marginBottom: "4px"
content = re.sub(
    r'padding:\s*"2px 10px 4px 10px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.4",\s*\n\s*transform:\s*"translateY\(-1px\)"',
    r'padding: "0px 8px 2px 8px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.3",\n                transform: "translateY(-4px)"',
    content
)

# 4. Also shift grid details text up slightly translateY(-3px)
content = re.sub(
    r'gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"5px 16px",\s*fontSize:\s*"12px",\s*lineHeight:\s*"1\.5"',
    r'gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: "12px", lineHeight: "1.45", transform: "translateY(-3px)"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Page 3 Dasha text shifted UPWARDS by an extra 3-4px successfully!")
