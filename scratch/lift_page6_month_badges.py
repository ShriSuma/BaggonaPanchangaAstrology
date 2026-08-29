import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace transform: translateY(-1.5px) or translateY(-3px) on Page 6 month badges with translateY(-4px)
# Find Page 6 start marker
p6_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 6: 100% NEXT 8 MONTHS'
p7_marker = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 7:'

idx_p6 = content.find(p6_marker)
idx_p7 = content.find(p7_marker)

if idx_p6 != -1 and idx_p7 != -1:
    p6_content = content[idx_p6:idx_p7]
    p6_content_updated = p6_content.replace('translateY(-1.5px)', 'translateY(-4px)').replace('translateY(-3px)', 'translateY(-4px)')
    content = content[:idx_p6] + p6_content_updated + content[idx_p7:]
    print("Lifted Page 6 month badge text to translateY(-4px) successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Page 6 month badge inner text lift successfully.")
