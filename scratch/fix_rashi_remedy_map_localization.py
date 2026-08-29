filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace static rashiRemedyMap with clean 5-language localized remedy map
old_remedy_map = '''    const rashiRemedyMap: Record<number, { gem: string; rudraksha: string; color: string; day: string }> = {
    0: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    1: { gem: "ವಜ್ರ (Diamond / Zircon)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    2: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    3: { gem: "ಮುತ್ತು (Pearl)", rudraksha: "೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ / ಬೆಳ್ಳಿ", day: "ಸೋಮವಾರ" },
    4: { gem: "ಮಾಣಿಕ್ಯ (Ruby)", rudraksha: "೧೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಿತ್ತಳೆ (Orange)", day: "ಭಾನುವಾರ" },
    5: { gem: "ಪಚ್ಚೆ (Emerald)", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು (Green)", day: "ಬುಧವಾರ" },
    6: { gem: "ವಜ್ರ (Diamond)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ (White)", day: "ಶುಕ್ರವಾರ" },
    7: { gem: "ಪವಳ (Red Coral)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು (Red)", day: "ಮಂಗಳವಾರ" },
    8: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" },
    9: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಪ್ಪು / ನೀಲಿ", day: "ಶನಿವಾರ" },
    10: { gem: "ಇಂದ್ರ ನೀಲ (Blue Sapphire)", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ನೀಲಿ (Blue)", day: "ಶನಿವಾರ" },
    11: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ (Yellow Sapphire)", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ (Yellow)", day: "ಗುರುವಾರ" }
  };'''

new_remedy_map = '''    const rashiRemedyMapL5: Record<number, Record<string, { gem: string; rudraksha: string; color: string; day: string }>> = {
    0: {
      kn: { gem: "ಪವಳ (ರಕ್ತ ಹವಳ)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು", day: "ಮಂಗಳವಾರ" },
      en: { gem: "Red Coral", rudraksha: "3 Mukhi Rudraksha", color: "Red", day: "Tuesday" },
      hi: { gem: "मूंगा (रक्त मूंगा)", rudraksha: "3 मुखी रुद्राक्ष", color: "लाल", day: "मंगलवार" },
      te: { gem: "పగడము", rudraksha: "3 ముఖీ రుద్రాక్ష", color: "ఎరుపు", day: "మంగళవారం" },
      ta: { gem: "பவளம்", rudraksha: "3 முக ருத்ராட்சம்", color: "சிவப்பு", day: "செவ்வாய்" }
    },
    1: {
      kn: { gem: "ವಜ್ರ (ಝಿರ್ಕಾನ್)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ", day: "ಶುಕ್ರವಾರ" },
      en: { gem: "Diamond / Zircon", rudraksha: "6 Mukhi Rudraksha", color: "White", day: "Friday" },
      hi: { gem: "हीरा / जरकन", rudraksha: "6 मुखी रुद्राक्ष", color: "सफेद", day: "शुक्रवार" },
      te: { gem: "వజ్రము", rudraksha: "6 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "శుక్రవారం" },
      ta: { gem: "வைரம்", rudraksha: "6 முக ருத்ராட்சம்", color: "வெள்ளை", day: "வெள்ளி" }
    },
    2: {
      kn: { gem: "ಮರಕತ ಪಚ್ಚೆ", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು", day: "ಬುಧವಾರ" },
      en: { gem: "Emerald", rudraksha: "4 Mukhi Rudraksha", color: "Green", day: "Wednesday" },
      hi: { gem: "पन्ना", rudraksha: "4 मुखी रुद्राक्ष", color: "हरा", day: "बुधवार" },
      te: { gem: "పచ్చ", rudraksha: "4 ముఖీ రుద్రాక్ష", color: "పచ్చ", day: "బుధవారం" },
      ta: { gem: "மரகதம்", rudraksha: "4 முக ருத்ராட்சம்", color: "பச்சை", day: "புதன்" }
    },
    3: {
      kn: { gem: "ಶುದ್ಧ ಮುತ್ತು", rudraksha: "೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ / ಬೆಳ್ಳಿ", day: "ಸೋಮವಾರ" },
      en: { gem: "Pearl", rudraksha: "2 Mukhi Rudraksha", color: "White / Silver", day: "Monday" },
      hi: { gem: "मोती", rudraksha: "2 मुखी रुद्राक्ष", color: "सफेद / चांदी", day: "सोमवार" },
      te: { gem: "ముత్యము", rudraksha: "2 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "సోమవారం" },
      ta: { gem: "முத்து", rudraksha: "2 முக ருத்ராட்சம்", color: "வெள்ளை", day: "திங்கள்" }
    },
    4: {
      kn: { gem: "ಮಾಣಿಕ್ಯ (ಕೆಂಪು ಮಾಣಿಕ್ಯ)", rudraksha: "೧೨ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಿತ್ತಳೆ", day: "ಭಾನುವಾರ" },
      en: { gem: "Ruby", rudraksha: "12 Mukhi Rudraksha", color: "Orange / Red", day: "Sunday" },
      hi: { gem: "माणिक्य", rudraksha: "12 मुखी रुद्राक्ष", color: "नारंगी", day: "रविवार" },
      te: { gem: "మాణిక్యం", rudraksha: "12 ముఖీ రుద్రాక్ష", color: "నారెంజి", day: "ఆదివారం" },
      ta: { gem: "மாணிக்கம்", rudraksha: "12 முக ருத்ராட்சம்", color: "ஆரஞ்சு", day: "ஞாயிறு" }
    },
    5: {
      kn: { gem: "ಮರಕತ ಪಚ್ಚೆ", rudraksha: "೪ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಸಿರು", day: "ಬುಧವಾರ" },
      en: { gem: "Emerald", rudraksha: "4 Mukhi Rudraksha", color: "Green", day: "Wednesday" },
      hi: { gem: "पन्ना", rudraksha: "4 मुखी रुद्राक्ष", color: "हरा", day: "बुधवार" },
      te: { gem: "పచ్చ", rudraksha: "4 ముఖీ రుద్రాక్ష", color: "పచ్చ", day: "బుధవారం" },
      ta: { gem: "மரகதம்", rudraksha: "4 முக ருத்ராட்சம்", color: "பச்சை", day: "புதன்" }
    },
    6: {
      kn: { gem: "ವಜ್ರ (ಝಿರ್ಕಾನ್)", rudraksha: "೬ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಬಿಳಿ", day: "ಶುಕ್ರವಾರ" },
      en: { gem: "Diamond", rudraksha: "6 Mukhi Rudraksha", color: "White", day: "Friday" },
      hi: { gem: "हीरा", rudraksha: "6 मुखी रुद्राक्ष", color: "सफेद", day: "शुक्रवार" },
      te: { gem: "వజ్రము", rudraksha: "6 ముఖీ రుద్రాక్ష", color: "తెలుపు", day: "శుక్రవారం" },
      ta: { gem: "வைரம்", rudraksha: "6 முக ருத்ராட்சம்", color: "வெள்ளை", day: "வெள்ளி" }
    },
    7: {
      kn: { gem: "ಪವಳ (ರಕ್ತ ಹವಳ)", rudraksha: "೩ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕೆಂಪು", day: "ಮಂಗಳವಾರ" },
      en: { gem: "Red Coral", rudraksha: "3 Mukhi Rudraksha", color: "Red", day: "Tuesday" },
      hi: { gem: "मूंगा", rudraksha: "3 मुखी रुद्राक्ष", color: "लाल", day: "मंगलवार" },
      te: { gem: "పగడము", rudraksha: "3 ముఖీ రుద్రాక్ష", color: "ఎరుపు", day: "మంగళవారం" },
      ta: { gem: "பவளம்", rudraksha: "3 முக ருத்ராட்சம்", color: "சிவப்பு", day: "செவ்வாய்" }
    },
    8: {
      kn: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ", day: "ಗುರುವಾರ" },
      en: { gem: "Yellow Sapphire", rudraksha: "5 Mukhi Rudraksha", color: "Yellow", day: "Thursday" },
      hi: { gem: "पुखराज", rudraksha: "5 मुखी रुद्राक्ष", color: "पीला", day: "गुरुवार" },
      te: { gem: "పుష్యరాగం", rudraksha: "5 ముఖీ రుద్రాక్ష", color: "పసుపు", day: "గురువారం" },
      ta: { gem: "புஷ்பராகம்", rudraksha: "5 முக ருத்ராட்சம்", color: "மஞ்சள்", day: "வியாழன்" }
    },
    9: {
      kn: { gem: "ಇಂದ್ರ ನೀಲ", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಕಪ್ಪು / ನೀಲಿ", day: "ಶನಿವಾರ" },
      en: { gem: "Blue Sapphire", rudraksha: "7 Mukhi Rudraksha", color: "Black / Blue", day: "Saturday" },
      hi: { gem: "नीलम", rudraksha: "7 मुखी रुद्राक्ष", color: "काला / नीला", day: "शनिवार" },
      te: { gem: "నీలము", rudraksha: "7 ముఖీ రుద్రాక్ష", color: "నలుపు / నీలం", day: "శనివారం" },
      ta: { gem: "நீலம்", rudraksha: "7 முக ருத்ராட்சம்", color: "கருப்பு / நீலம்", day: "சனி" }
    },
    10: {
      kn: { gem: "ಇಂದ್ರ ನೀಲ", rudraksha: "೭ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ನೀಲಿ", day: "ಶನಿವಾರ" },
      en: { gem: "Blue Sapphire", rudraksha: "7 Mukhi Rudraksha", color: "Blue", day: "Saturday" },
      hi: { gem: "नीलम", rudraksha: "7 मुखी रुद्राक्ष", color: "नीला", day: "शनिवार" },
      te: { gem: "నీలము", rudraksha: "7 ముఖీ రుద్రాక్ష", color: "నీలం", day: "శనివారం" },
      ta: { gem: "நீலம்", rudraksha: "7 முக ருத்ராட்சம்", color: "நீலம்", day: "சனி" }
    },
    11: {
      kn: { gem: "ಕನಕ ಪುಷ್ಯರಾಗ", rudraksha: "೫ ಮುಖೀ ರುದ್ರಾಕ್ಷಿ", color: "ಹಳದಿ", day: "ಗುರುವಾರ" },
      en: { gem: "Yellow Sapphire", rudraksha: "5 Mukhi Rudraksha", color: "Yellow", day: "Thursday" },
      hi: { gem: "पुखराज", rudraksha: "5 मुखी रुद्राक्ष", color: "पीला", day: "गुरुवार" },
      te: { gem: "పుష్యరాగం", rudraksha: "5 ముఖీ రుద్రాక్ష", color: "పసుపు", day: "గురువారం" },
      ta: { gem: "புஷ்பராகம்", rudraksha: "5 முக ருத்ராட்சம்", color: "மஞ்சள்", day: "வியாழன்" }
    }
  };
  const rashiRemedy = rashiRemedyMapL5[rashiIdx]?.[code] || rashiRemedyMapL5[rashiIdx]?.kn || rashiRemedyMapL5[5].kn;'''

if old_remedy_map in content:
    content = content.replace(old_remedy_map, new_remedy_map)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 8 remedies localization to 5 languages cleanly without English brackets!")
