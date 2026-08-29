import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Define GOTRA_L5_MAP in RoyalBooklet8PageTemplate.tsx
gotra_l5_map_code = '''const GOTRA_L5_MAP: Record<string, Record<string, string>> = {
  vasistha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  vashistha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  vasishtha: { kn: "ವಸಿಷ್ಠ", en: "Vasistha", hi: "वसिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டா" },
  kashyapa: { kn: "ಕಶ್ಯಪ", en: "Kashyapa", hi: "कश्यप", te: "కశ్యప", ta: "கஸ்யப" },
  kasyapa: { kn: "ಕಶ್ಯಪ", en: "Kashyapa", hi: "कश्यप", te: "కశ్యప", ta: "கஸ்யப" },
  bharadwaja: { kn: "ಭಾರದ್ವಾಜ", en: "Bharadwaja", hi: "भारद्वाज", te: "భారద్వాజ", ta: "பாரத்வாஜ" },
  bharadwaj: { kn: "ಭಾರದ್ವಾಜ", en: "Bharadwaja", hi: "भारद्वाज", te: "భారద్వాజ", ta: "பாரத்வாஜ" },
  vishvamitra: { kn: "ವಿಶ್ವಾಮಿತ್ರ", en: "Vishvamitra", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்ர" },
  viswamitra: { kn: "ವಿಶ್ವಾಮಿತ್ರ", en: "Vishvamitra", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்ர" },
  gautama: { kn: "ಗೌತಮ", en: "Gautama", hi: "गौतम", te: "గౌతమ", ta: "கௌதம" },
  gautam: { kn: "ಗೌತಮ", en: "Gautama", hi: "गौतम", te: "గೌతమ", ta: "கௌதம" },
  jamadagni: { kn: "ಜಮದಗ್ನಿ", en: "Jamadagni", hi: "जमदग्नि", te: "జమదగ్ని", ta: "ஜமதக்னி" },
  atri: { kn: "ಅತ್ರಿ", en: "Atri", hi: "अत्रि", te: "అత్రి", ta: "அத்ரி" },
  agastya: { kn: "ಅಗಸ್ತ್ಯ", en: "Agastya", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்திய" },
  agasti: { kn: "ಅಗಸ್ತ್ಯ", en: "Agastya", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்திய" },
  harita: { kn: "ಹರೀತ", en: "Harita", hi: "हरीत", te: "హరీత", ta: "ஹரித" },
  srivatsa: { kn: "ಶ್ರೀವತ್ಸ", en: "Srivatsa", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச" },
  shandilya: { kn: "ಶಾಂಡಿಲ್ಯ", en: "Shandilya", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய" },
  kaundinya: { kn: "ಕೌಂಡಿನ್ಯ", en: "Kaundinya", hi: "कौंडिन्य", te: "కౌండిన్య", ta: "கௌண்டின்ய" },
  angirasa: { kn: "ಆಂಗೀರಸ", en: "Angirasa", hi: "आंगीरस", te: "ఆంగీరస", ta: "ஆங்கீரச" },
  bhargava: { kn: "ಭಾರ್ಗವ", en: "Bhargava", hi: "भार्गव", te: "భార్గవ", ta: "பார்கவ" },
  parashara: { kn: "ಪರಾಶರ", en: "Parashara", hi: "पराशर", te: "పరాశర", ta: "பராசர" },
  vatsa: { kn: "ವತ್ಸ", en: "Vatsa", hi: "वत्स", te: "వత్స", ta: "வத்ச" },
  garga: { kn: "ಗರ್ಗ", en: "Garga", hi: "गर्ग", te: "गर्ग", te: "గర్గ", ta: "கர்க" },
  upamanyu: { kn: "ಉಪಮನ್ಯು", en: "Upamanyu", hi: "उपमन्यु", te: "ఉపమన్యు", ta: "உபமன்யு" }
};

'''

if "const GOTRA_L5_MAP:" not in content:
    content = content.replace("const GOTRA_KN_MAP:", gotra_l5_map_code + "const GOTRA_KN_MAP:")

# 2. Update finalGotra resolution to use GOTRA_L5_MAP[code]
old_final_gotra = '''  const finalGotra = hasGotra 
    ? (isKn ? (GOTRA_KN_MAP[rawGotra] || rawGotra) : rawGotra)
    : "";'''

new_final_gotra = '''  const gotraKey = rawGotra.toLowerCase().replace(/[^a-z]/g, "");
  const localizedGotra = GOTRA_L5_MAP[gotraKey]?.[code] || GOTRA_L5_MAP[gotraKey]?.kn || GOTRA_KN_MAP[rawGotra] || rawGotra;
  const finalGotra = hasGotra ? localizedGotra : "";'''

content = content.replace(old_final_gotra, new_final_gotra)

# 3. Update Card 7 addresses in PAGE1_DICT from "ಕಾರ್ ರಸ್ತೆ" / "Car Street" to "ರಥಬೀದಿ" / "Rathabeedi"
content = content.replace(
    'valPob: "ಕಾರ್ ರಸ್ತೆ, ಗೋಕರ್ಣ, ಕುಮಟಾ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",',
    'valPob: "ರಥಬೀದಿ, ಗೋಕರ್ಣ, ಕುಮಟಾ, ಉತ್ತರ ಕನ್ನಡ, ಕರ್ನಾಟಕ",'
)
content = content.replace(
    'valPob: "Car Street, Gokarna, Kumta, Uttara Kannada, Karnataka",',
    'valPob: "Rathabeedi, Gokarna, Kumta, Uttara Kannada, Karnataka",'
)
content = content.replace(
    'valPob: "कार स्ट्रीट, गोकर्ण, कुमटा, उत्तर कन्नड़, कर्नाटक",',
    'valPob: "रथबीदि, गोकर्ण, कुमटा, उत्तर कन्नड़, कर्नाटक",'
)
content = content.replace(
    'valPob: "కార్ స్ట్రీట్, గోకర్ణ, కుమటా, ఉత్తర కన్నడ, కర్ణాటక",',
    'valPob: "రథబీది, గోకర్ణ, కుమటా, ఉత్తర కన్నడ, కర్ణాటక",'
)
content = content.replace(
    'valPob: "கார் தெரு, கோகர்ணா, குமடா, உத்தர கன்னடா, கர்நாடகா",',
    'valPob: "ரதபீதி, கோகர்ணா, குமடா, உத்தர கன்னடா, கர்நாடகா",'
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 1 Card 7 address to Rathabeedi and added 5-language Gotra localization successfully!")
