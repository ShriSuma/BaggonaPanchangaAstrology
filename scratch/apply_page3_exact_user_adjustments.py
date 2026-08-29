import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Duration Box margin-top: "2px" -> "6px" (shifts duration box DOWN by ~4px)
content = re.sub(
    r'marginTop:\s*"2px",\s*\n\s*marginBottom:\s*"8px",\s*\n\s*background:\s*"linear-gradient\(180deg, #FFFDF7 0%, #FEF3C7 100%\)"',
    r'marginTop: "6px",\n                marginBottom: "6px",\n                background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)"',
    content
)

# 2. Update Duration Bar inner span padding and line-height
content = re.sub(
    r'padding:\s*"1px 10px 5px 10px",\s*\n\s*borderRadius:\s*"6px",\s*\n\s*display:\s*"flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.4"',
    r'padding: "2px 10px 3px 10px",\n                borderRadius: "6px",\n                display: "flex",\n                alignItems: "center",\n                lineHeight: "1.3"',
    content
)

# 3. Shift Top-Right Pill Badge text UPWARDS by 2px with translateY(-2px)
content = re.sub(
    r'padding:\s*"1px 12px 5px 12px",\s*\n\s*borderRadius:\s*"14px",\s*\n\s*fontWeight:\s*(\d+),\s*\n\s*display:\s*"inline-flex",\s*\n\s*alignItems:\s*"center",\s*\n\s*lineHeight:\s*"1\.4"',
    r'padding: "1px 12px 3px 12px",\n                  borderRadius: "14px",\n                  fontWeight: \1,\n                  display: "inline-flex",\n                  alignItems: "center",\n                  lineHeight: "1.25",\n                  transform: "translateY(-2px)"',
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied exact 2 micro-adjustments for Page 3 Dasha cards successfully!")
