import re

file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/features/seva/sevaLocale.ts"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# Let's inspect NAKSHATRA_MANTRAS_L5 entries
match = re.search(r"export const NAKSHATRA_MANTRAS_L5.*?};\n\nexport const getNakshatraMantraInfo", text, re.DOTALL)
if match:
    block = match.group(0)
    for line in block.split("\n"):
        if "kn:" in line and "mantra" in line or "kn: \"॥" in line:
            print("KN:", line.strip())
            # print codepoints
            cps = [f"U+{ord(c):04X}({c})" for c in line.strip()]
            print("   ", " ".join(cps))
