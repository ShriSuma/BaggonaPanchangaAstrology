import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

pages_found = []
for i in range(1, 9):
    marker = f"PAGE {i}:"
    pos = content.find(marker)
    pages_found.append((i, pos))

print("Audit of 8 Booklet Pages in RoyalBooklet8PageTemplate.tsx:")
print("-" * 60)

# Check dynamic props used
print("1. Devotee Identity Inputs:")
print("   - personName:", "identity?.personName" in content)
print("   - rashi:", "rashiName" in content)
print("   - nakshatra:", "nakName" in content)
print("   - pada:", "pada" in content)
print("   - lagna:", "lagnaRashiName" in content)
print("   - gotra:", "finalGotra" in content)
print("   - birthYoga:", "calculateBirthYoga" in content)
print("   - dob/tob:", "dobStr" in content and "tobStr" in content)
print("   - pob/astrologyPlace:", "valPob" in content)

print("\n2. Dynamic Engines Connected:")
print("   - calculateKundli (AstroEngine):", "calculateKundli" in content)
print("   - generateBhuktiTimeline (DashaBhuktiEngine):", "generateBhuktiTimeline" in content)
print("   - renderSouthIndianGrid (D1 & D9 South Indian Chart Engine):", "renderSouthIndianGrid" in content)
print("   - 5-Language Dictionary System (PAGE1_DICT, PAGE7_DICT, PAGE8_DICT, RASHI_L5, NAKSHATRA_L5, PLANET_L5):", "PAGE1_DICT" in content and "PAGE7_DICT" in content and "PAGE8_DICT" in content)
