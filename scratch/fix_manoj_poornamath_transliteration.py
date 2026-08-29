filepath = "src/utils/transliterator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add Manoj Poornamath dictionary entries
old_entry = '"manoj poornamatha": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Poornamatha" },'
new_entries = '''"manoj poornamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Poornamath" },
  "manoj purnamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனೋಜ್ பூரணமடா", en: "Manoj Purnamath" },
  "manoj poornamatha": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனೋஜ் பூரணಮடா", en: "Manoj Poornamatha" },
  "poornamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Poornamath" },
  "purnamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Purnamath" },'''

if old_entry in content:
    content = content.replace(old_entry, new_entries)
    print("Added Manoj Poornamath transliteration entries successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
