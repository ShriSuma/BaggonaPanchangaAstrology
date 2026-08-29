filepath = "src/utils/transliterator.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace any corrupted text if any
content = content.replace("தில்லீப்<ctrl42>ஹிரேகங்கே", "தில்லீப் ஹிரேகங்கே")

if '"dileep hiregange":' not in content:
    old_entry = '"dilip pujari": { kn: "ದಿಲೀಪ್ ಪೂಜಾರಿ", hi: "दिलीप पुजारी", te: "దిలీప్ పూజారి", ta: "தில்லீப் பூஜாரி", en: "Dilip Pujari" },'
    new_entries = '''"dileep hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ஹிரேகங்கே", en: "Dileep Hiregange" },
  "dilip hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ಹிரேகங்கே", en: "Dilip Hiregange" },
  "dileep": { kn: "ದಿಲೀಪ್", hi: "दिलीप", te: "దిలీప్", ta: "தில்லீಪ್", en: "Dileep" },
  "hiregange": { kn: "ಹಿರೇಗಂಗೆ", hi: "हिरेगंगे", te: "హిరేగంగె", ta: "ஹிரேகங்கே", en: "Hiregange" },
  "dilip pujari": { kn: "ದಿಲೀಪ್ ಪೂಜಾರಿ", hi: "दिलीप पुजारी", te: "దిలీಪ್ పూజారి", ta: "தில்லீப் பூஜாரி", en: "Dilip Pujari" },'''
    content = content.replace(old_entry, new_entries)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Cleaned Dileep Hiregange transliteration entries!")
