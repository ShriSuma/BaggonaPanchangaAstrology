import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Revert top-right badge pill styling: remove position relative top: -10px, set padding: "1px 12px 5px 12px", lineHeight: "1.4"
content = re.sub(
    r'padding:\s*"3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.1",\s*\n\s*position:\s*"relative",\s*\n\s*top:\s*"-10px"',
    r'padding: "1px 12px 5px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.4"',
    content
)

# 2. Revert Dasha Header Title line: remove position relative top: -10px, set lineHeight: "1.3"
content = re.sub(
    r'<span style=\{\{\s*display:\s*"inline-flex",\s*alignItems:\s*"center",\s*lineHeight:\s*"1\.1",\s*position:\s*"relative",\s*top:\s*"-10px"\s*\}\}>',
    r'<span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.3" }}>',
    content
)

# 3. Revert Duration Date Bar line: remove position relative top: -10px, set padding: "1px 10px 5px 10px", lineHeight: "1.4"
content = re.sub(
    r'padding:\s*"4px 10px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.35",\s*\n\s*position:\s*"relative",\s*\n\s*top:\s*"-10px"',
    r'padding: "1px 10px 5px 10px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.4"',
    content
)

# 4. Revert Details Grid content: remove position relative top: -8px
content = re.sub(
    r'gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"5px 16px",\s*fontSize:\s*"12px",\s*lineHeight:\s*"1\.5",\s*position:\s*"relative",\s*top:\s*"-8px"',
    r'gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Reverted outer box positions to 100% original baseline and updated inner text padding successfully!")
