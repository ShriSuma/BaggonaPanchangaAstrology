import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update top-right badge pill styling: padding: "3px 12px", translateY(-3px)
content = re.sub(
    r'padding:\s*"1px 12px 3px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.25",\s*\n\s*transform:\s*"translateY\(-2px\)"',
    r'padding: "3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.25",\n                  transform: "translateY(-3px)"',
    content
)

# 2. Update Duration Box margin-top: "7px" (shifts box down 4px), revert padding: "4px 10px"
content = re.sub(
    r'marginTop:\s*"6px",\s*\n\s*marginBottom:\s*"6px",\s*\n\s*background:\s*"linear-gradient\(180deg, #FFFDF7 0%, #FEF3C7 100%\)",\s*\n\s*border:\s*"1px solid #FCD34D",\s*\n\s*padding:\s*"2px 10px 3px 10px"',
    r'marginTop: "7px",\n                marginBottom: "6px",\n                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",\n                border: "1px solid #FCD34D",\n                padding: "4px 10px"',
    content
)

# 3. Slightly increase font size in grid content items from 12px to 12.5px
content = re.sub(
    r'gridTemplateColumns:\s*"1fr 1fr",\s*gap:\s*"5px 16px",\s*fontSize:\s*"12px",\s*lineHeight:\s*"1\.5"',
    r'gridTemplateColumns: "1fr 1fr", gap: "5px 16px", fontSize: "12.5px", lineHeight: "1.5"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied exact Page 3 duration box shift down 4px, badge text lift -3px, and 12.5px font size successfully!")
