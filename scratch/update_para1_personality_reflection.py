import re

filepath = "src/components/seva/pdf/RoyalBooklet8PageTemplate.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Update para1 in kn
old_kn_para1 = 'para1: (rashi, nak, pada, lagna, dob, tob) => `ನಿಮ್ಮ ಪವಿತ್ರ ಜನನ ದಿನಾಂಕ ${dob} ಹಾಗೂ ಸಮಯ ${tob} ರ ಆಧಾರದ ಮೇಲೆ, ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಅಥೆಂಟಿಕ್ ಪಂಚಾಂಗ ಗಣಿತದಿಂದ ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು ${lagna}, ಚಂದ್ರ ರಾಶಿಯು ${rashi} ಹಾಗೂ ಜನ್ಮ ನಕ್ಷತ್ರವು ${nak} (${pada}ನೇ ಪಾದ) ಎಂದು ನಿಖರವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯವು ಭಗವಂತನು ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ನೀಡಿದ ದೈವಿಕ ದಾರಿ ದೀಪವಾಗಿದೆ.`,';

new_kn_para1 = 'para1: (rashi, nak, pada, lagna) => `ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರದ ಸಿದ್ಧ ಜನ್ಮ ಕುಂಡಲಿ ಗಣಿತದ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನವು (${lagna}) ಹಾಗೂ ಚಂದ್ರ ರಾಶಿಯು (${rashi}) ನಿಮ್ಮ ಆತ್ಮಕ್ಕೆ ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾದ ಬುದ್ಧಿಶಕ್ತಿ, ಪ್ರಾಮಾಣಿಕ ಸದಾಚಾರ, ಆಳವಾದ ದೈವಿಕ ಚಿಂತನೆ ಹಾಗೂ ಉನ್ನತ ಧರ್ಮ ಶ್ರದ್ಧೆಯನ್ನು ಕರುಣಿಸಿದೆ. ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ (${nak}) ಗ್ರಹ ಪ್ರಭಾವವು ಸವಾಲುಗಳನ್ನು ಜಾಣ್ಮೆಯಿಂದ ಎದುರಿಸಿ ಸಮಾಜದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಗೌರವ ಹಾಗೂ ಸ್ವಂತ ಶ್ರಮದಿಂದ ಯಶಸ್ಸು ಸಾಧಿಸುವ ಅಪೂರ್ವ ವ್ಯಕ್ತಿತ್ವವನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.`,';

# Update para1 in en
old_en_para1 = 'para1: (rashi, nak, pada, lagna, dob, tob) => `Based on your exact birth time (${tob}) and date (${dob}), authentic planetary calculations at Gokarna establish your Janma Lagna as ${lagna}, Moon Sign as ${rashi}, and Birth Star as ${nak} (Pada ${pada}). Vedic Astrology is the divine lamp illuminating your soul\'s life purpose.`,';

new_en_para1 = 'para1: (rashi, nak, pada, lagna) => `Based on authentic Gokarna natal planetary math, the cosmic alignment of your Lagna (${lagna}) and Moon Sign (${rashi}) endows you with sharp intellect, unshakeable integrity, intuitive wisdom, and noble ambition. The sacred resonance of your Birth Star (${nak}) reveals a resilient, highly respected personality capable of turning challenges into triumph through dedicated perseverance.`,';

# Update para1 in hi
old_hi_para1 = 'para1: (rashi, nak, pada, lagna, dob, tob) => `आपकी जन्म तिथि ${dob} एवं समय ${tob} के अनुसार गोकर्ण पंचांग द्वारा आपका लग्न ${lagna}, चंद्र राशि ${rashi} तथा नक्षत्र ${nak} (${pada} चरण) निर्धारित किया गया है। वैदिक ज्योतिष ईश्वर का दिव्य प्रकाश है।`,';

new_hi_para1 = 'para1: (rashi, nak, pada, lagna) => `श्री गोकर्ण धाम की प्रामाणिक जन्म कुंडली गणना के अनुसार, आपके लग्न (${lagna}) एवं चंद्र राशि (${rashi}) का शुभ प्रभाव आपको तीक्ष्ण बुद्धि, निष्ठा, सात्विक विचार एवं समाज में उच्च सम्मान प्रदान करता है। आपके जन्म नक्षत्र (${nak}) की ऊर्जा आपके अनुशासित एवं तेजस्वी व्यक्तित्व को दर्शाती है।`,';

# Update para1 in te
old_te_para1 = 'para1: (rashi, nak, pada, lagna, dob, tob) => `మీ జనన తేదీ ${dob} మరియు సమయం ${tob} ఆధారంగా మీ లగ్నం ${lagna}, చంద్ర రాశి ${rashi} మరియు నక్షత్రం ${nak} (${pada}వ పాదం) గా గణించబడింది. జ్యోతిష్యం భగవంతుని దివ్య కాంతి.`,';

new_te_para1 = 'para1: (rashi, nak, pada, lagna) => `శ్రీ గోకర్ణ క్షేత్ర పవిత్ర జన్మ కుండలి గణన ప్రకారం, మీ లగ్నం (${lagna}) మరియు చంద్ర రాశి (${rashi}) గ్రహ బలం మీకు తీక్షణమైన బుద్ధికుశలత, సదాచారం మరియు సమాజంలో ఉన్నత గౌరవాన్ని ప్రసాదిస్తున్నాయి. మీ జన్మ నక్షత్రం (${nak}) మీ లయబద్ధమైన మరియు ధైర్యవంతమైన వ్యక్తిత్వాన్ని ప్రతిబింబిస్తుంది.`,';

# Update para1 in ta
old_ta_para1 = 'para1: (rashi, nak, pada, lagna, dob, tob) => `உங்கள் பிறந்த தேதி ${dob} மற்றும் நேரம் ${tob} அடிப்படையில் உங்கள் லக்னம் ${lagna}, சந்திர ராசி ${rashi} மற்றும் நட்சத்திரம் ${nak} (பாதம் ${pada}) எனக் கணிக்கப்பட்டுள்ளது. ஜோதிடம் இறைவனின் திவ்ய வழிகாட்டி.`,';

new_ta_para1 = 'para1: (rashi, nak, pada, lagna) => `ஸ்ரீ கோகர்ண ஆலய புனித ஜாதக கணிதத்தின்படி, உங்கள் லக்னம் (${lagna}) மற்றும் சந்திர ராசி (${rashi}) அமைப்பானது உங்களுக்கு கூர்மையான அறிவுத்திறன், நற்பண்புகள் மற்றும் உயர் கௌரவத்தை வழங்கி அருள்கிறது. உங்கள் நட்சத்திரம் (${nak}) உங்களின் துணிச்சலான ஆளுமையை வெளிப்படுத்துகிறது.`,';

content = content.replace(old_kn_para1, new_kn_para1)
content = content.replace(old_en_para1, new_en_para1)
content = content.replace(old_hi_para1, new_hi_para1)
content = content.replace(old_te_para1, new_te_para1)
content = content.replace(old_ta_para1, new_ta_para1)

# Now update the callsite in JSX where para1 is called
old_callsite = '''<div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName,
                  dobStr,
                  formatTimeWithAmPm(tobStr, isKn)
                )}
              </div>'''

new_callsite = '''<div>
                {(PAGE1_DICT[code] || PAGE1_DICT.en).para1(
                  rashiName,
                  nakName,
                  pada,
                  birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName
                )}
              </div>'''

if old_callsite in content:
    content = content.replace(old_callsite, new_callsite)
else:
    # regex fallback for callsite
    content = re.sub(
        r'\(\s*PAGE1_DICT\[code\]\s*\|\|\s*PAGE1_DICT\.en\s*\)\.para1\([\s\S]*?\)',
        '(PAGE1_DICT[code] || PAGE1_DICT.en).para1(rashiName, nakName, pada, birthKundli?.lagnaRashi ? ((RASHI_L5[birthKundli.lagnaRashi.index] as any)?.[code] || (RASHI_L5[birthKundli.lagnaRashi.index] as any)?.kn || lagnaRashiName) : lagnaRashiName)',
        content
    )

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Paragraph 1 personality reflection updated successfully!")
