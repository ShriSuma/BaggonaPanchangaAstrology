file_locale = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/features/seva/sevaLocale.ts"
with open(file_locale, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Telugu mantras that had Kannada 'ಮಃ' (\u0CAE\u0C83) instead of Telugu 'మః' (\u0C2E\u0C03) or 'మహ' (\u0C2E\u0C39)
content = content.replace("నಮಃ", "నమః").replace("నమః", "నమః") # replace mixed chars

# Specifically replace \u0C28\u0CAE\u0C83 with \u0C28\u0C2E\u0C03
content = content.replace("\u0C28\u0CAE\u0C83", "\u0C28\u0C2E\u0C03")
content = content.replace("\u0C28\u0CAE", "\u0C28\u0C2E")

# Also for Hasta (nakshatra 12):
# Let's ensure Hasta mantra in Kannada is cleanly: "॥ ॐ ಸವಿತ್ರೇ ನಮಃ ॥"
old_hasta = """  12: {
    name: { kn: "ಹಸ್ತ", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்", en: "Hasta" },
    deity: { kn: "ಸವಿತೃ ದೇವ (ಸೂರ್ಯ)", hi: "सविता देव (सूर्य)", te: "సవితృ దేవుడు (సూర్యుడు)", ta: "சவித்ரு தேவன் (சூரியன்)", en: "Savitur (Sun God)" },
    mantra: {
      kn: "॥ ॐ ಸವಿತ್ರೇ ನಮಃ ॥",
      hi: "॥ ॐ सवित्रे नमः ॥",
      te: "॥ ఓం సవిత్రే నమః ॥",
      ta: "॥ ஓம் சவித்ரே நமஹ ॥",
      en: "॥ Om Savitre Namah ॥"
    },"""

new_hasta = """  12: {
    name: { kn: "ಹಸ್ತ", hi: "हस्त", te: "హస్త", ta: "அஸ்தம்", en: "Hasta" },
    deity: { kn: "ಸವಿತೃ ದೇವ (ಸೂರ್ಯ)", hi: "सविता देव (सूर्य)", te: "సవితృ దేవుడు (సూర్యుడు)", ta: "சவித்ரு தேவன் (சூரியன்)", en: "Savitur (Sun God)" },
    mantra: {
      kn: "॥ ॐ ಸವಿತ್ರೇ ನಮಃ ॥",
      hi: "॥ ॐ सवित्रे नमः ॥",
      te: "॥ ఓం సవిత్రే నమః ॥",
      ta: "॥ ஓம் சவித்ரே நமஹ ॥",
      en: "॥ Om Savitre Namah ॥"
    },"""

content = content.replace(old_hasta, new_hasta)

with open(file_locale, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated sevaLocale.ts cleanly!")
