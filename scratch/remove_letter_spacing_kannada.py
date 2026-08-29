import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace letterSpacing on Page 1 elements
content = re.sub(r'letterSpacing:\s*"[^"]*",?\s*', '', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Removed letterSpacing from RoyalBooklet8PageTemplate.tsx successfully!")
