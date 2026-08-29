import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update top-right badge pill on Page 3: top: "-4px" -> top: "-10px"
content = re.sub(
    r'padding:\s*"3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.1",\s*\n\s*position:\s*"relative",\s*\n\s*top:\s*"-4px"',
    r'padding: "3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.1",\n                  position: "relative",\n                  top: "-10px"',
    content
)

# 2. Update Dasha Header Title line: top: "-4px" -> top: "-10px"
content = re.sub(
    r'<span style=\{\{\s*display:\s*"inline-flex",\s*alignItems:\s*"center",\s*lineHeight:\s*"1\.1",\s*position:\s*"relative",\s*top:\s*"-4px"\s*\}\}>',
    r'<span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1", position: "relative", top: "-10px" }}>',
    content
)

# 3. Update Duration Date Bar line: top: "-4px" -> top: "-10px"
content = re.sub(
    r'padding:\s*"4px 10px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.35",\s*\n\s*position:\s*"relative",\s*\n\s*top:\s*"-4px"',
    r'padding: "4px 10px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.35",\n                position: "relative",\n                top: "-10px"',
    content
)

# 4. Update Details Grid content: top: "-3px" -> top: "-8px"
content = re.sub(
    r'gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"5px 16px",\s*fontSize:\s*"12px",\s*lineHeight:\s*"1\.5",\s*position:\s*"relative",\s*top:\s*"-3px"',
    r'gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5", position: "relative", top: "-8px"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Shifted Page 3 Dasha text rows FURTHER UPWARDS by 10px successfully!")
