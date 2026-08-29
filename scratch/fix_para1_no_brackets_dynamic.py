import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Update PAGE1_DICT interface for para1
content = content.replace(
    'para1: (rashi: string, nak: string, pada: number, lagna: string, dob?: string, tob?: string) => string;',
    'para1: (rashi: string, nak: string, pada: number, lagna: string, maha?: string, bhukti?: string) => string;'
)

# Replace kn salutation and para1
old_kn = '''    salutation: (name, pandit) => `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಿಂದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ${pandit} ಅವರು ಆತ್ಮೀಯ ಭಕ್ತರಾದ ${name} ಅವರಿಗೆ ಸಲ್ಲಿಸುವ ಪವಿತ್ರ ಶುಭಾಶೀರ್ವಾದಗಳು.`,
    para1: (rashi, nak, pada, lagna) => `ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಜನ್ಮ ಕುಂಡಲಿ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು (${lagna}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯು (${rashi}) ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರಾಮಾಣಿಕ ಸದಾಚಾರ, ಆಳವಾದ ದೈವಿಕ ಚಿಂತನೆ ಹಾಗೂ ಉನ್ನತ ಧರ್ಮ ಶ್ರದ್ಧೆಯನ್ನು ಕರುಣಿಸಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ (${nak}) ಗ್ರಹ ಪ್ರಭಾವವು ಸವಾಲುಗಳನ್ನು ಜಾಣ್ಮೆಯಿಂದ ಎದುರಿಸಿ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಯಶಸ್ಸು ಸಾಧಿಸುವ ಅಪೂರ್ವ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,'''

new_kn = '''    salutation: (name, pandit) => `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಪವಿತ್ರ ಸನ್ನಿಧಾನದಿಂದ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ${pandit} ಅವರು ಆತ್ಮೀಯ ಶ್ರೇಯೋಭಿಲಾಷಿಗಳಾದ ${name} ಅವರಿಗೆ ಸಲ್ಲಿಸುವ ಪವಿತ್ರ ಶುಭಾಶೀರ್ವಾದಗಳು.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜನ್ಮ ಕುಂಡಲಿಯಲ್ಲಿ ${maha} ದಶಾದಲ್ಲಿ ${bhukti} ಅಂತರ್ದಶೆಯು ಸಕ್ರಿಯವಾಗಿದ್ದು, ` : "";
      return `ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಜನ್ಮ ಕುಂಡಲಿ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${lagna} ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯು ${rashi} ಆಗಿದೆ. ${dashaText}ಗ್ರಹಗಳ ಶುಭ ಬಲವು ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರಾಮಾಣಿಕ ಸದಾಚಾರ ಹಾಗೂ ಆಳವಾದ ದೈವಿಕ ಶ್ರದ್ಧೆಯನ್ನು ಕರುಣಿಸಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ${nak} ಗ್ರಹ ಪ್ರಭಾವವು ಸವಾಲುಗಳನ್ನು ಜಾಣ್ಮೆಯಿಂದ ಎದುರಿಸಿ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಯಶಸ್ಸು ಸಾಧಿಸುವ ಅಪೂರ್ವ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`;
    },'''

# Replace en salutation and para1
old_en = '''    salutation: (name, pandit) => `From the holy sanctum of Sri Kshetra Gokarna Mahabaleshwara, Chief Priest ${pandit} conveys sacred blessings to Devotee ${name}.`,
    para1: (rashi, nak, pada, lagna) => `Based on authentic Gokarna natal planetary math, the cosmic alignment of your Lagna (${lagna}) and Moon Sign (${rashi}) endows you with sharp intellect, unshakeable integrity, intuitive wisdom, and noble ambition. The sacred resonance of your Birth Star (${nak}) reveals a resilient, highly respected personality capable of turning challenges into triumph through dedicated perseverance.`,'''

new_en = '''    salutation: (name, pandit) => `From the holy sanctum of Sri Kshetra Gokarna Mahabaleshwara, Chief Priest ${pandit} conveys sacred blessings to Esteemed Patron ${name}.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `Currently traversing the ${maha} Dasha and ${bhukti} Antardasha, ` : "";
      return `Based on authentic Gokarna natal planetary math, your Janma Lagna is ${lagna} and Moon Sign is ${rashi}. ${dashaText}the planetary alignment endows you with sharp intellect, unshakeable integrity, intuitive wisdom, and noble ambition. The sacred resonance of your Birth Star ${nak} reveals a resilient, highly respected personality capable of turning challenges into triumph through dedicated perseverance.`;
    },'''

# Replace hi salutation and para1
old_hi = '''    salutation: (name, pandit) => `श्री गोकर्ण महाबलेश्वर धाम से मुख्य अर्चक ${pandit} द्वारा प्रिय भक्त ${name} को पावन शुभाशीर्वाद।`,
    para1: (rashi, nak, pada, lagna) => `श्री गोकर्ण धाम की प्रामाणिक जन्म कुंडली गणना के अनुसार, आपके लग्न (${lagna}) एवं चंद्र राशि (${rashi}) का शुभ प्रभाव आपको तीक्ष्ण बुद्धि, निष्ठा, सात्विक विचार एवं समाज में उच्च सम्मान प्रदान करता है। आपके जन्म नक्षत्र (${nak}) की ऊर्जा आपके अनुशासित एवं तेजस्वी व्यक्तित्व को दर्शाती है।`,'''

new_hi = '''    salutation: (name, pandit) => `श्री गोकर्ण महाबलेश्वर धाम से मुख्य अर्चक ${pandit} द्वारा आदरणीय ${name} को पावन शुभाशीर्वाद।`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `वर्तमान में आपकी कुंडली में ${maha} महादशा एवं ${bhukti} अंतर्दशा प्रभावी है, ` : "";
      return `श्री गोकर्ण धाम की प्रामाणिक जन्म कुंडली गणना के अनुसार, आपका लग्न ${lagna} एवं चंद्र राशि ${rashi} है। ${dashaText}ग्रहों का शुभ प्रभाव आपको तीक्ष्ण बुद्धि, निष्ठा, सात्विक विचार एवं समाज में उच्च सम्मान प्रदान करता है। आपके जन्म नक्षत्र ${nak} की ऊर्जा आपके अनुशासित एवं तेजस्वी व्यक्तित्व को दर्शाती है।`;
    },'''

# Replace te salutation and para1
old_te = '''    salutation: (name, pandit) => `శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి ప్రధాన అర్చకులు ${pandit} గారు భక్తులు ${name} గారికి అందించే పవిత్ర ఆశీస్సులు.`,
    para1: (rashi, nak, pada, lagna) => `శ్రీ గోకర్ణ క్షేత్ర పవిత్ర జన్మ కుండలి గణన ప్రకారం, మీ లగ్నం (${lagna}) మరియు చంద్ర రాశి (${rashi}) గ్రహ బలం మీకు తీక్షణమైన బుద్ధికుశలత, సదాచారం మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తున్నాయి. మీ జన్మ నక్షత్రం (${nak}) మీ లయబద్ధమైన మరియు ధైర్యవంతమైన వ్యక్తిత్వాన్ని ప్రతిబింబిస్తుంది.`,'''

new_te = '''    salutation: (name, pandit) => `శ్రీ గోకర్ణ మహాబలేశ్వర క్షేత్రం నుండి ప్రధాన అర్చకులు ${pandit} గారు మాన్యశ్రీ ${name} గారికి అందించే పవిత్ర ఆశీస్సులు.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `ప్రస్తుతం మీ కుండలిలో ${maha} మహాతో పాటు ${bhukti} అంతర్దశ నడుస్తోంది, ` : "";
      return `శ్రీ గోకర్ణ క్షేత్ర పవిత్ర జన్మ కుండలి గణన ప్రకారం, మీ లగ్నం ${lagna} మరియు చంద్ర రాశి ${rashi}. ${dashaText}గ్రహ బలం మీకు తీక్షణమైన బుద్ధికుశలత, సదాచారం మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తున్నాయి. మీ జన్మ నక్షత్రం ${nak} మీ లయబద్ధమైన మరియు ధైర్యవంతమైన వ్యక్తిత్వాన్ని ప్రతిబింబిస్తుంది.`;
    },'''

# Replace ta salutation and para1
old_ta = '''    salutation: (name, pandit) => `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்திலிருந்து முதன்மை அர்ச்சகர் ${pandit} பக்தர் ${name} அவர்களுக்கு வழங்கும் புனித ஆசிகள்.`,
    para1: (rashi, nak, pada, lagna) => `ஸ்ரீ கோகர்ண ஆலய புனித ஜாதக கணிதத்தின்படி, உங்கள் லக்னம் (${lagna}) மற்றும் சந்திர ராசி (${rashi}) அமைப்பானது உங்களுக்கு கூர்மையான அறிவுத்திறன், நற்பண்புகள் மற்றும் உயர் கௌரவத்தை வழங்கி அருள்கிறது. உங்கள் நட்சத்திரம் (${nak}) உங்களின் துணிச்சலான ஆளுமையை வெளிப்படுத்துகிறது.`,'''

new_ta = '''    salutation: (name, pandit) => `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் ஆலயத்திலிருந்து முதன்மை அர்ச்சகர் ${pandit} மாண்புமிகு ${name} அவர்களுக்கு வழங்கும் புனித ஆசிகள்.`,
    para1: (rashi, nak, pada, lagna, maha, bhukti) => {
      const dashaText = (maha && bhukti) ? `தற்போது உங்களுக்கு ${maha} மகா திசையில் ${bhukti} புக்தி நடப்பில் உள்ளது, ` : "";
      return `ஸ்ரீ கோகர்ண ஆலய புனித ஜாதக கணிதத்தின்படி, உங்கள் லக்னம் ${lagna} மற்றும் சந்திர ராசி ${rashi} ஆகும். ${dashaText}இந்த கிரக அமைப்பு உங்களுக்கு கூர்மையான அறிவுத்திறன், நற்பண்புகள் மற்றும் உயர் கௌரவத்தை வழங்கி அருள்கிறது. உங்கள் நட்சத்திரம் ${nak} உங்களின் துணிச்சலான ஆளுமையை வெளிப்படுத்துகிறது.`;
    },'''

content = content.replace(old_kn, new_kn)
content = content.replace(old_en, new_en)
content = content.replace(old_hi, new_hi)
content = content.replace(old_te, new_te)
content = content.replace(old_ta, new_ta)

# Update callsite in JSX
old_callsite = '''              <div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName
                )}
              </div>'''

new_callsite = '''<div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName,
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[0].replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim() : "",
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[1]?.replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim() : ""
                )}
              </div>'''

if old_callsite in content:
    content = content.replace(old_callsite, new_callsite)
else:
    # regex replace callsite
    content = re.sub(
        r'\{\/\* \s*\(PAGE1_DICT\[code\][\s\S]*?para1\([\s\S]*?\)\s*\}',
        '''{(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName,
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[0].replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim() : "",
                  dynamicDashaCards[0]?.title ? dynamicDashaCards[0].title.split(" • ")[1]?.replace(/[^a-zA-Z0-9\\u0C80-\\u0CFF\\s]/g, "").trim() : ""
                )}''',
        content
    )

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Paragraph 1 updated without brackets & with dynamic Dasha-Bhukti resonance!")
