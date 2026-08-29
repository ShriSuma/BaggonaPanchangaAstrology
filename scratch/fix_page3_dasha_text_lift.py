import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update top-right pill badge styling on Page 3 cards
# Change padding: "3px 12px" to padding: "1px 12px 3px 12px", lineHeight: "1.1" to "1.3", add transform: "translateY(-2px)"
content = re.sub(
    r'padding:\s*"3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.1"',
    r'padding: "1px 12px 3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.3",\n                  transform: "translateY(-2px)"',
    content
)

# 2. Update Dasha Header Title line: lineHeight: "1.1" -> "1.35", add transform: "translateY(-1px)"
content = re.sub(
    r'<span style=\{\{\s*display:\s*"inline-flex",\s*alignItems:\s*"center",\s*lineHeight:\s*"1\.1"\s*\}\}>',
    r'<span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.35", transform: "translateY(-1px)" }}>',
    content
)

# 3. Update Duration Date Bar line: padding: "4px 10px", lineHeight: "1.35" -> padding: "2px 10px 4px 10px", lineHeight: "1.4", add transform: "translateY(-1px)"
content = re.sub(
    r'padding:\s*"4px 10px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.35"',
    r'padding: "2px 10px 4px 10px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.4",\n                transform: "translateY(-1px)"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Page 3 Dasha card text rows lifted UPWARDS successfully!")
