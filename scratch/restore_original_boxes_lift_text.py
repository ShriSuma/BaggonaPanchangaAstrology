import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Restore top-right badge pill styling: padding: "3px 12px", lineHeight: "1.1", position: "relative", top: "-4px"
content = re.sub(
    r'padding:\s*"0px 10px 2px 10px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.25",\s*\n\s*transform:\s*"translateY\(-5px\)"',
    r'padding: "3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.1",\n                  position: "relative",\n                  top: "-4px"',
    content
)

# 2. Restore Dasha Header Title line: lineHeight: "1.1", position: "relative", top: "-4px"
content = re.sub(
    r'<span style=\{\{\s*display:\s*"inline-flex",\s*alignItems:\s*"center",\s*lineHeight:\s*"1\.25",\s*transform:\s*"translateY\(-4px\)"\s*\}\}>',
    r'<span style={{ display: "inline-flex", alignItems: "center", lineHeight: "1.1", position: "relative", top: "-4px" }}>',
    content
)

# 3. Restore Duration Date Bar line: padding: "4px 10px", lineHeight: "1.35", position: "relative", top: "-4px"
content = re.sub(
    r'padding:\s*"0px 8px 2px 8px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.3",\s*\n\s*transform:\s*"translateY\(-4px\)"',
    r'padding: "4px 10px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.35",\n                position: "relative",\n                top: "-4px"',
    content
)

# 4. Restore Details Grid content: gap: "5px 16px", lineHeight: "1.5", position: "relative", top: "-3px"
content = re.sub(
    r'gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"4px 16px",\s*fontSize:\s*"12px",\s*lineHeight:\s*"1\.45",\s*transform:\s*"translateY\(-3px\)"',
    r'gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12px", lineHeight: "1.5", position: "relative", top: "-3px"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored original Dasha card box sizes & applied position: relative top: -4px to inner text rows successfully!")
