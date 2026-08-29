import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add PAGE8_DICT right after PAGE7_DICT
page8_dict_code = '''
const PAGE8_DICT: Record<string, {
  slokaHeader: (name: string) => string;
  slokaMantra: string;
  slokaPhala: string;
}> = {
  kn: {
    slokaHeader: (name) => `🏺 ${name} ಅವರ ಜಾತಕ, ಗೋಚಾರ & ದಶಾಪರಿಹಾರ ಸಿದ್ಧ ರಕ್ಷಾ ಸ್ತೋತ್ರ:`,
    slokaMantra: '"ॐ ಶ್ರೀ ಮಹಾಗೌರೀ ಸಮೇತ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರಾಯ ನಮಃ । ನವಗ್ರಹ ದೋಷ ಶಮನಂ ಕುರು ಕುರು ಸ್ವಾಹಾ ॥"',
    slokaPhala: "(ದಿನನಿತ್ಯ ಮನೆಯ ಪೂಜಾ ಮಂದಿರದಲ್ಲಿ ೧೧ ಬಾರಿ ಜಪಿಸುವುದರಿಂದ ಜಾತಕ-ಗೋಚಾರ ಗ್ರಹ ದೋಷ ಶಮನ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದತೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯ ಸಿದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ)"
  },
  en: {
    slokaHeader: (name) => `🏺 ${name}'s Personalized Chart & Gochara Divine Defense Sloka:`,
    slokaMantra: '"Om Shri Mahagauri Sameta Gokarna Mahabaleshvaraya Namah | Navagraha Dosha Shamanam Kuru Kuru Swaha ||"',
    slokaPhala: "(Reciting 11 times daily at home altar mitigates all horoscope and transit planetary afflictions, bringing deep peace of mind, family harmony, and divine progress)"
  },
  hi: {
    slokaHeader: (name) => `🏺 ${name} के लिए जन्म कुंडली एवं गोचर दोष निवारक सिद्ध रक्षा स्तोत्र:`,
    slokaMantra: '"ॐ श्री महागौरी समेत गोकर्ण महाबलेश्वरान नमः । नवग्रह दोष शमनं कुरु कुरु स्वाहा ॥"',
    slokaPhala: "(नित्य 11 बार जप करने से जन्म कुंडली एवं गोचर के सभी ग्रह दोषों का शमन होता है तथा मानसिक शांति एवं पारिवारिक सुख-समृद्धि की प्राप्ति होती है)"
  },
  te: {
    slokaHeader: (name) => `🏺 ${name} గారి జాతక, గోచార & దశాభుక్తి సిద్ధ రక్షా స్తోత్రం:`,
    slokaMantra: '"ఓం శ్రీ మహాగౌరీ సమేత గోకర్ణ మహాబలేశ్వరాయ నమః । నవగ్రహ దోష శమనం కురు ಕುರು స్వాహా ॥"',
    slokaPhala: "(నిత్యం 11 సార్లు జపించడం ద్వారా జాతక-గోచార గ్రహ దోషాలు నివారణ అయి, మానసిక ప్రశాంతత, కుటుంబ సౌఖ్యం లభిస్తాయి)"
  },
  ta: {
    slokaHeader: (name) => `🏺 ${name} அவர்களின் ஜாதக, கோச்சார & தசா புக்தி சாந்தி புனித ஸ்தோத்திரம்:`,
    slokaMantra: '"ஓம் ஸ்ரீ மகாகௌரி சமேத கோகர்ண மகாபலேஸ்வராய நமஃ । நவக்ரக தோஷ சமனம் குரு குரு ஸ்வாஹா ॥"',
    slokaPhala: "(தினமும் 11 முறை ஜபிப்பதால் ஜாதக-கோச்சார கிரக தோஷங்கள் நிவர்த்தியாகி, மன அமைதி மற்றும் குடும்ப மகிழ்ச்சி சித்திக்கும்)"
  }
};
'''

if "const PAGE8_DICT:" not in content:
    idx_p7_dict = content.find("const PAGE1_DICT:")
    if idx_p7_dict != -1:
        content = content[:idx_p7_dict] + page8_dict_code + "\n\n" + content[idx_p7_dict:]

# 2. Add Block 5 to Page 8 right before the Footer Banner
block5_jsx = '''          {/* Block 5: Devotee Authentic Birth Chart & Planetary Defense Siddha Sloka (Gold Parchment Card) */}
          <div style={{
            background: "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)",
            border: "2px solid #D97706",
            borderRadius: "10px",
            padding: "11px 16px",
            boxShadow: "0 3px 8px rgba(180, 83, 9, 0.08)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#78350F", marginBottom: "4px", borderBottom: "1px dashed #FCD34D", paddingBottom: "3px" }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaHeader(displayName)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", fontStyle: "italic", margin: "4px 0", lineHeight: "1.5" }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaMantra}
            </div>
            <div style={{ fontSize: "11px", color: "#451A03", lineHeight: "1.45", fontWeight: 600 }}>
              {(PAGE8_DICT[code] || PAGE8_DICT.en).slokaPhala}
            </div>
          </div>

          {/* Footer Banner */}'''

p8_marker_start = '{/* ─────────────────────────────────────────────────────────────\n          PAGE 8: EXACT MATCH TO PDF (45) PAGE 8\n         ───────────────────────────────────────────────────────────── */}'
idx_p8_start = content.find(p8_marker_start)

if idx_p8_start != -1:
    footer_banner_str = '''          {/* Footer Banner */}'''
    idx_footer = content.find(footer_banner_str, idx_p8_start)
    if idx_footer != -1:
        content = content[:idx_footer] + block5_jsx + content[idx_footer + len(footer_banner_str):]
        print("Added Block 5 Devotee Sloka Section to Page 8 successfully!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Page 8 devotee sloka section successfully.")
