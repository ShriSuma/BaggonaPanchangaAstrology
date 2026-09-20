// Comprehensive 5-Language Transliteration Engine for Devotee Names

const NAME_DICTIONARY: Record<string, Record<string, string>> = {
  "vinayak": { kn: "ವಿನಾಯಕ್", hi: "विनायक", te: "వినాయక్", ta: "விநாயக", en: "Vinayak" },
  "vinayaka": { kn: "ವಿನಾಯಕ", hi: "विनायक", te: "వినాయక", ta: "விநாயக", en: "Vinayaka" },
  "vinayak shanti": { kn: "ವಿನಾಯಕ್ ಶಾಂತಿ", hi: "विनायक शांति", te: "వినాయక్ శాంతి", ta: "விநாயக சாந்தி", en: "Vinayak Shanthi" },
  "vinayaka shanti": { kn: "ವಿನಾಯಕ ಶಾಂತಿ", hi: "विनायक शांति", te: "వినాయక శాంతి", ta: "விநாயக சாந்தி", en: "Vinayaka Shanthi" },
  "haagoo": { kn: "ಹಾಗೂ", hi: "एवं", te: "మరియు", ta: "மற்றும்", en: "and" },
  "hagu": { kn: "ಹಾಗೂ", hi: "एवं", te: "మరియు", ta: "மற்றும்", en: "and" },
  "mattu": { kn: "ಮತ್ತು", hi: "तथा", te: "మరియు", ta: "மற்றும்", en: "and" },
  "and": { kn: "ಹಾಗೂ", hi: "एवं", te: "మరియు", ta: "மற்றும்", en: "and" },
  "&": { kn: "&", hi: "&", te: "&", ta: "&", en: "&" },
  "evam": { kn: "ಹಾಗೂ", hi: "एवं", te: "మరియు", ta: "மற்றும்", en: "and" },
  "tatha": { kn: "ಮತ್ತು", hi: "तथा", te: "మరియు", ta: "மற்றும்", en: "and" },
  "aur": { kn: "ಮತ್ತು", hi: "और", te: "మరియు", ta: "மற்றும்", en: "and" },
  "kirti": { kn: "ಕೀರ್ತಿ", hi: "कीर्ति", te: "కీర్తి", ta: "கீர்த்தி", en: "Kirti" },
  "keerthi": { kn: "ಕೀರ್ತಿ", hi: "कीರ್ತಿ", te: "కీర్తి", ta: "கீர்த்தி", en: "Keerthi" },
  "talpankar": { kn: "ತಲ್ಪಂಕರ್", hi: "तल्पंकर", te: "తల్పంకర్", ta: "தல்பங்கர்", en: "Talpankar" },
  "talpanakar": { kn: "ತಲ್ಪನಕರ್", hi: "तल्पनकर", te: "తల్పనకర్", ta: "தல்பனகர்", en: "Talpanakar" },
  "gowtam": { kn: "ಗೌತಮ್", hi: "गौतम", te: "గೌತಮ್", ta: "கௌதம்", en: "Gowtam" },
  "gautam": { kn: "ಗೌತಮ್", hi: "गौतम", te: "గౌతమ్", ta: "கௌதம்", en: "Gautam" },
  "roja": { kn: "ರೋಜಾ", hi: "रोजा", te: "రోజా", ta: "ரோஜா", en: "Roja" },
  "swayam naik": { kn: "ಸ್ವಯಂ ನಾಯಕ್", hi: "स्वयं नायक", te: "స్వయం నాయక్", ta: "ஸ்வயம் நாயக்", en: "Swayam Naik" },
  "swayam": { kn: "ಸ್ವಯಂ", hi: "स्वयं", te: "స్వయం", ta: "ஸ்வயம்", en: "Swayam" },
  "naik": { kn: "ನಾಯಕ್", hi: "नायक", te: "నాయక్", ta: "நாயக்", en: "Naik" },
  "nayak": { kn: "ನಾಯಕ್", hi: "नायक", te: "నాయక్", ta: "நாயக்", en: "Nayak" },
  "manoj poornamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Poornamath" },
  "manoj purnamath": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Purnamath" },
  "manoj poornamatha": { kn: "ಮನೋಜ್ ಪೂರ್ಣಮಠ", hi: "मनोज पूर्णमठ", te: "మనోజ్ పూర్ణమఠ", ta: "மனோஜ் பூரணமடா", en: "Manoj Poornamatha" },
  "poornamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Poornamath" },
  "purnamath": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Purnamath" },
  "manoj": { kn: "ಮನೋಜ್", hi: "मनोज", te: "మనోజ్", ta: "மனோஜ்", en: "Manoj" },
  "poornamatha": { kn: "ಪೂರ್ಣಮಠ", hi: "पूर्णमठ", te: "పూర్ణమఠ", ta: "பூரணமடா", en: "Poornamatha" },
  "dileep hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ஹிரேகங்கே", en: "Dileep Hiregange" },
  "dilip hiregange": { kn: "ದಿಲೀಪ್ ಹಿರೇಗಂಗೆ", hi: "दिलीप हिरेगंगे", te: "దిలీప్ హిరేగంగె", ta: "தில்லீப் ஹிரேகங்கே", en: "Dilip Hiregange" },
  "dileep": { kn: "ದಿಲೀಪ್", hi: "दिलीप", te: "దిలీప్", ta: "தில்லீப்", en: "Dileep" },
  "hiregange": { kn: "ಹಿರೇಗಂಗೆ", hi: "हिरेगंगे", te: "హిరేగంగె", ta: "ஹிரேகங்கே", en: "Hiregange" },
  "dilip pujari": { kn: "ದಿಲೀಪ್ ಪೂಜಾರಿ", hi: "दिलीप पुजारी", te: "దిలీప్ పూజారి", ta: "தில்லீப் பூஜாரி", en: "Dilip Pujari" },
  "dilip": { kn: "ದಿಲೀಪ್", hi: "दिलीप", te: "దిలీప్", ta: "தில்லீப்", en: "Dilip" },
  "pujari": { kn: "ಪೂಜಾರಿ", hi: "पुजारी", te: "పూజారి", ta: "பூஜாரி", en: "Pujari" },
  "pramod kudgi": { kn: "ಪ್ರಮೋದ್ ಕುಡ್ಗಿ", hi: "प्रमोद कुड्गी", te: "ప్రమోద్ ಕುಡ್ಗಿ", ta: "பிரமோத் குட்கி", en: "Pramod Kudgi" },
  "pramod kodgi": { kn: "ಪ್ರಮೋದ್ ಕೊಡ್ಗಿ", hi: "प्रमोद कोडगी", te: "ప్రమోద్ కొడ్గి", ta: "பிரமோத் கொட்கி", en: "Pramod Kodgi" },
  "pramod kodigi": { kn: "ಪ್ರಮೋದ್ ಕೊಡಿಗಿ", hi: "प्रमोद कोडिगी", te: "ప్రమోద్ ಕೊಡಿಗಿ", ta: "பிரமோத் கொடிகீ", en: "Pramod Kodigi" },
  "pramod": { kn: "ಪ್ರಮೋದ್", hi: "प्रमोद", te: "ప్రమోద్", ta: "பிரமோத்", en: "Pramod" },
  "kudgi": { kn: "ಕುಡ್ಗಿ", hi: "कुड्गी", te: "కుడ్గి", ta: "குட்கி", en: "Kudgi" },
  "shreeram pandit": { kn: "ಶ್ರೀರಾಮ ಪಂಡಿತ್", hi: "श्रीराम पंडित", te: "శ్రీరామ్ పండిట్", ta: "ஸ்ரீராம் பண்டிட்", en: "Shreeram Pandit" },
  "chaitanya pandit": { kn: "ಚೈತನ್ಯ ಪಂಡಿತ್", hi: "चैतन्य पंडित", te: "చైతన్య పండిట్", ta: "சைதன்ய பண்டிட்", en: "Chaitanya Pandit" },
  "shreeram": { kn: "ಶ್ರೀರಾಮ", hi: "श्रीराम", te: "శ్రీరామ్", ta: "ஸ்ரீராம்", en: "Shreeram" },
  "pandit": { kn: "ಪಂಡಿತ್", hi: "पंडित", te: "పండిట్", ta: "பண்டிட்", en: "Pandit" },
  "purohit": { kn: "ಪುರೋಹಿತ", hi: "पुरोहित", te: "పురోహితుడు", ta: "புரோகிதர்", en: "Purohit" },
  "archak": { kn: "ಅರ್ಚಕ", hi: "अर्चक", te: "అర్చకుడు", ta: "அர்ச்சகர்", en: "Archak" },
  "archaka": { kn: "ಅರ್ಚಕ", hi: "अर्चक", te: "అర్చకుడు", ta: "அர்ச்சகர்", en: "Archaka" },
  "shastri": { kn: "ಶಾಸ್ತ್ರಿ", hi: "शास्त्री", te: "శాస్త్రి", ta: "சாஸ்திரி", en: "Shastri" },
  "gokarna": { kn: "ಗೋಕರ್ಣ", hi: "गोकर्ण", te: "గోకర్ణ", ta: "கோகர்ணா", en: "Gokarna" },
  "narayana bali": { kn: "ನಾರಾಯಣ ಬಲಿ", hi: "नारायण बलि", te: "నారాయణ బలి", ta: "நாராயண பலி", en: "Narayana Bali" },
  "narayana": { kn: "ನಾರಾಯಣ", hi: "नारायण", te: "నారాయణ", ta: "நாராயண", en: "Narayana" },
  "bali": { kn: "ಬಲಿ", hi: "बलि", te: "బలి", ta: "பலி", en: "Bali" },
  "tripindi shradha": { kn: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", hi: "त्रिपिंडी श्राद्ध", te: "త్రిపిండి శ్రాద్ధము", ta: "திரிபிண்டி ஸ்ராத்தம்", en: "Tripindi Shradha" },
  "tripindi shraddha": { kn: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ", hi: "त्रिपिंडी श्राद्ध", te: "త్రిపిండి శ్రాద్ధము", ta: "திரிபிண்டி ஸ்ராத்தம்", en: "Tripindi Shraddha" },
  "tripindi": { kn: "ತ್ರಿಪಿಂಡಿ", hi: "त्रिपिंडी", te: "త్రిపిండి", ta: "திரிபிண்டி", en: "Tripindi" },
  "shradha": { kn: "ಶ್ರಾದ್ಧ", hi: "श्राद्ध", te: "శ్రాద్ధము", ta: "ஸ்ராத்தம்", en: "Shradha" },
  "shraddha": { kn: "ಶ್ರಾದ್ಧ", hi: "श्राद्ध", te: "శ్రాద్ధము", ta: "ஸ்ராத்தம்", en: "Shraddha" },
  "rudrabhisheka": { kn: "ರುದ್ರಾಭಿಷೇಕ", hi: "रुद्राभिषेक", te: "రుద్రాభిషేకము", ta: "ருத்ராபிஷேகம்", en: "Rudrabhisheka" },
  "rudrabhishek": { kn: "ರುದ್ರಾಭಿಷೇಕ", hi: "रुद्राभिषेक", te: "రుద్రాభిషేకము", ta: "ருத்ராபிஷேகம்", en: "Rudrabhishek" },
  "pooja": { kn: "ಪೂಜೆ", hi: "पूजा", te: "పూజ", ta: "பூஜை", en: "Pooja" },
  "puja": { kn: "ಪೂಜೆ", hi: "पूजा", te: "పూజ", ta: "பூஜை", en: "Puja" },
  "pooje": { kn: "ಪೂಜೆ", hi: "पूजा", te: "పూజ", ta: "பூஜை", en: "Pooja" },
  "homa": { kn: "ಹೋಮ", hi: "होम", te: "హోమం", ta: "ஹோமம்", en: "Homa" },
  "homam": { kn: "ಹೋಮ", hi: "होम", te: "హోమం", ta: "ஹோமம்", en: "Homam" },
  "havana": { kn: "ಹವನ", hi: "हवन", te: "హవనం", ta: "ஹவனம்", en: "Havana" },
  "havan": { kn: "ಹವನ", hi: "हवन", te: "ಹವనం", ta: "ஹவனம்", en: "Havan" },
  "shanti": { kn: "ಶಾಂತಿ", hi: "शांति", te: "శాంతి", ta: "சாந்தி", en: "Shanti" },
  "shanthi": { kn: "ಶಾಂತಿ", hi: "शांति", te: "శాంతి", ta: "சாந்தி", en: "Shanthi" },
  "vrata": { kn: "ವ್ರತ", hi: "व्रत", te: "వ్రతం", ta: "விரதம்", en: "Vrata" },
  "vratha": { kn: "ವ್ರತ", hi: "व्रत", te: "వ్రతం", ta: "விரதம்", en: "Vratha" },
  "vratham": { kn: "ವ್ರತ", hi: "व्रत", te: "వ్రతం", ta: "விரதம்", en: "Vratham" },
  "sankalpa": { kn: "ಸಂಕಲ್ಪ", hi: "संकल्प", te: "సంకల్పం", ta: "சங்கல்பம்", en: "Sankalpa" },
  "sankalpam": { kn: "ಸಂಕಲ್ಪ", hi: "संकल्प", te: "సంకల్పం", ta: "சங்கல்பம்", en: "Sankalpam" },
  "seva": { kn: "ಸೇವೆ", hi: "सेवा", te: "సేవ", ta: "சேவை", en: "Seva" },
  "seve": { kn: "ಸೇವೆ", hi: "सेवा", te: "సేవ", ta: "சேவை", en: "Seva" },
  "abhisheka": { kn: "ಅಭಿಷೇಕ", hi: "अभिषेक", te: "అభిషేకం", ta: "அபிஷேகம்", en: "Abhisheka" },
  "abhishekam": { kn: "ಅಭಿಷೇಕ", hi: "अभिषेक", te: "అభిషేకం", ta: "அபிஷேகம்", en: "Abhishekam" },
  "archana": { kn: "ಅರ್ಚನೆ", hi: "अर्चना", te: "అర్చన", ta: "அர்ச்சனை", en: "Archana" },
  "archane": { kn: "ಅರ್ಚನೆ", hi: "अर्चना", te: "అర్చన", ta: "அர்ச்சனை", en: "Archana" },
  "pretoddhara": { kn: "ಪ್ರೇತೋದ್ಧಾರ", hi: "प्रेतोद्धार", te: "ప్రేతోద్ధార", ta: "பிரேதோத்தார", en: "Pretoddhara" },
  "pretoddhara shanti": { kn: "ಪ್ರೇತೋದ್ಧಾರ ಶಾಂತಿ", hi: "प्रेतोद्धार शांति", te: "ప్రేతోద్ధార శాంతి", ta: "பிரேதோத்தார சாந்தி", en: "Pretoddhara Shanti" },
  "satyanarayana": { kn: "ಸತ್ಯನಾರಾಯಣ", hi: "सत्यनारायण", te: "సత్యనారాయణ", ta: "சத்தியநாராயண", en: "Satyanarayana" },
  "satyanarayana pooja": { kn: "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ", hi: "सत्यनारायण पूजा", te: "సత్యనారాయణ పూజ", ta: "சத்தியநாராயண பூஜை", en: "Satyanarayana Pooja" },
  "satyanarayana puja": { kn: "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ", hi: "सत्यनारायण पूजा", te: "సత్యనారాయణ పూజ", ta: "சத்தியநாராயண பூஜை", en: "Satyanarayana Puja" },
  "ganapati": { kn: "ಗಣಪತಿ", hi: "गणपति", te: "గణపతి", ta: "கணபதி", en: "Ganapati" },
  "ganapathi": { kn: "ಗಣಪತಿ", hi: "गणपति", te: "గణపతి", ta: "கணபதி", en: "Ganapathi" },
  "ganapati homa": { kn: "ಗಣಪತಿ ಹೋಮ", hi: "गणपति होम", te: "గణపతి హోమం", ta: "கணபதி ஹோமம்", en: "Ganapati Homa" },
  "ganapathi homa": { kn: "ಗಣಪತಿ ಹೋಮ", hi: "गणपति होम", te: "గణపతి హోమం", ta: "கணபதி ஹோமம்", en: "Ganapathi Homa" },
  "lakshmi": { kn: "ಲಕ್ಷ್ಮಿ", hi: "लक्ष्मी", te: "లక్ష్మి", ta: "லக்ஷ்மி", en: "Lakshmi" },
  "mahalakshmi": { kn: "ಮಹಾಲಕ್ಷ್ಮಿ", hi: "महालक्ष्मी", te: "మహాలక్ష్మి", ta: "மகாலக்ஷ்மி", en: "Mahalakshmi" },
  "mahalakshmi pooja": { kn: "ಮಹಾಲಕ್ಷ್ಮಿ ಪೂಜೆ", hi: "महालक्ष्मी पूजा", te: "మహాలక్ష్మి పూజ", ta: "மகாலக்ஷ்மி பூஜை", en: "Mahalakshmi Pooja" },
  "varamahalakshmi": { kn: "ವರಮಹಾಲಕ್ಷ್ಮಿ", hi: "वरमहालक्ष्मी", te: "వరమహాలక్ష్మి", ta: "வரமகாலக்ஷ்மி", en: "Varamahalakshmi" },
  "varamahalakshmi vrata": { kn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ", hi: "वरमहालक्ष्मी व्रत", te: "వరమహాలక్ష్మి వ్రతం", ta: "வரமகாலக்ஷ்மி விரதம்", en: "Varamahalakshmi Vrata" },
  "varamahalakshmi vratha": { kn: "ವರಮಹಾಲಕ್ಷ್ಮಿ ವ್ರತ", hi: "वरमहालक्ष्मी व्रत", te: "వరమహాలక్ష్మి వ్రతం", ta: "வரமகாலக்ஷ்மி விரதம்", en: "Varamahalakshmi Vratha" },
  "chandi": { kn: "ಚಂಡಿ", hi: "चंडी", te: "చండీ", ta: "சண்டி", en: "Chandi" },
  "chandika": { kn: "ಚಂಡಿಕಾ", hi: "चंडिका", te: "చండికా", ta: "சண்டிகா", en: "Chandika" },
  "chandi homa": { kn: "ಚಂಡಿ ಹೋಮ", hi: "चंडी होम", te: "చండీ హోమం", ta: "சண்டி ஹோமம்", en: "Chandi Homa" },
  "navagraha": { kn: "ನವಗ್ರಹ", hi: "नवग्रह", te: "నవగ్రహ", ta: "நவகிரக", en: "Navagraha" },
  "navagraha shanti": { kn: "ನವಗ್ರಹ ಶಾಂತಿ", hi: "नवग्रह शांति", te: "నవగ్రహ శాంతి", ta: "நவகிரக சாந்தி", en: "Navagraha Shanti" },
  "mrityunjaya": { kn: "ಮೃತ್ಯುಂಜಯ", hi: "मृत्युंजय", te: "మృత్యుంజయ", ta: "மிருத்யுஞ்ஜய", en: "Mrityunjaya" },
  "maha mrityunjaya": { kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ", hi: "महा मृत्युंजय", te: "మహా మృత్యుంజయ", ta: "மகா மிருத்யுஞ்ஜய", en: "Maha Mrityunjaya" },
  "mrityunjaya homa": { kn: "ಮೃತ್ಯುಂಜಯ ಹೋಮ", hi: "मृत्युंजय होम", te: "మృత్యుంజయ హోమం", ta: "மிருத்யுஞ்ஜய ஹோமம்", en: "Mrityunjaya Homa" },
  "kuja": { kn: "ಕುಜ", hi: "कुज", te: "కుజ", ta: "செவ்வாய்", en: "Kuja" },
  "kuja shanti": { kn: "ಕುಜ ಶಾಂತಿ", hi: "कुज शांति", te: "కుజ శాంతి", ta: "செவ்வாய் சாந்தி", en: "Kuja Shanti" },
  "rahu": { kn: "ರಾಹು", hi: "राहु", te: "రాహు", ta: "ராகு", en: "Rahu" },
  "ketu": { kn: "ಕೇತು", hi: "केतु", te: "కేతు", ta: "கேது", en: "Ketu" },
  "brihaspati": { kn: "ಬೃಹಸ್ಪತಿ", hi: "बृहस्पति", te: "బృహస్పతి", ta: "பிரகஸ்பதி", en: "Brihaspati" },
  "sudarshana": { kn: "ಸುದರ್ಶನ", hi: "सुदर्शन", te: "సుదర్శన", ta: "சுதர்சன", en: "Sudarshana" },
  "sudarshana homa": { kn: "ಸುದರ್ಶನ ಹೋಮ", hi: "सुदर्शन होम", te: "సుదర్శన హోమం", ta: "சுதர்சன ஹோமம்", en: "Sudarshana Homa" },
  "narasimha": { kn: "ನರಸಿಂಹ", hi: "नृसिंह", te: "నరసింహ", ta: "நரசிம்ம", en: "Narasimha" },
  "ayushya": { kn: "ಆಯುಷ್ಯ", hi: "आयुष्य", te: "ఆయుష్య", ta: "ஆயுஷ்ய", en: "Ayushya" },
  "ayushya homa": { kn: "ಆಯುಷ್ಯ ಹೋಮ", hi: "आयुष्य होम", te: "ఆయుష్య హోమం", ta: "ஆயுஷ்ய ஹோமம்", en: "Ayushya Homa" },
  "dhanvantari": { kn: "ಧನ್ವಂತರಿ", hi: "धन्वंतरि", te: "ధన్వంతరి", ta: "தன்வந்திரி", en: "Dhanvantari" },
  "dhanvantari homa": { kn: "ಧನ್ವಂತರಿ ಹೋಮ", hi: "धन्वंतरि होम", te: "ధన్వంతరి హోమం", ta: "தன்வந்திரி ஹோமம்", en: "Dhanvantari Homa" },
  "kalasarpa": { kn: "ಕಾಲಸರ್ಪ", hi: "कालसर्प", te: "కాలసర్ప", ta: "காலசர்ப்ப", en: "Kalasarpa" },
  "kalasarpa shanti": { kn: "ಕಾಲಸರ್ಪ ಶಾಂತಿ", hi: "कालसर्प शांति", te: "కాలసర్ప శాంతి", ta: "காலசர்ப்ப சாந்தி", en: "Kalasarpa Shanti" },
  "sarpa samskara": { kn: "ಸರ್ಪ ಸಂಸ್ಕಾರ", hi: "सर्प संस्कार", te: "సర్ప సంస్కారం", ta: "சர்ப்ப சம்ஸ்காரம்", en: "Sarpa Samskara" },
  "sarpasamskara": { kn: "ಸರ್ಪ ಸಂಸ್ಕಾರ", hi: "सर्प संस्कार", te: "సర్ప సంస్కారం", ta: "சர்ப்ப சம்ஸ்காரம்", en: "Sarpasamskara" },
  "vastu": { kn: "ವಾಸ್ತು", hi: "वास्तु", te: "వాస్తు", ta: "வாஸ்து", en: "Vastu" },
  "vastu shanti": { kn: "ವಾಸ್ತು ಶಾಂತಿ", hi: "वास्तु शांति", te: "వాస్తు శాంతి", ta: "வாஸ்து சாந்தி", en: "Vastu Shanti" },
  "vastu pooja": { kn: "ವಾಸ್ತು ಪೂಜೆ", hi: "वास्तु पूजा", te: "వాస్తు పూజ", ta: "வாஸ்து பூஜை", en: "Vastu Pooja" },
  "pinda pradana": { kn: "ಪಿಂಡ ಪ್ರದಾನ", hi: "पिंड प्रदान", te: "పిండ ప్రదానం", ta: "பிண்ட பிரதானம்", en: "Pinda Pradana" },
  "pinda": { kn: "ಪಿಂಡ", hi: "पिंड", te: "పిండ", ta: "பிண்ட", en: "Pinda" },
  "pradana": { kn: "ಪ್ರದಾನ", hi: "प्रदान", te: "ప్రదానం", ta: "பிரதானம்", en: "Pradana" },
  "tarpanam": { kn: "ತರ್ಪಣ", hi: "तर्पण", te: "తర్పణం", ta: "தர்பணம்", en: "Tarpanam" },
  "tarpana": { kn: "ತರ್ಪಣ", hi: "तर्पण", te: "తర్పణం", ta: "தர்பணம்", en: "Tarpana" },
  "swayamvara": { kn: "ಸ್ವಯಂವರ", hi: "स्वयंवर", te: "స్వయంవర", ta: "சுயம்வர", en: "Swayamvara" },
  "santana": { kn: "ಸಂತಾನ", hi: "संतान", te: "సంతాన", ta: "சந்தான", en: "Santana" },
  "santana gopala": { kn: "ಸಂತಾನ ಗೋಪಾಲ", hi: "संतान गोपाल", te: "సంతాన గోపాల", ta: "சந்தான கோபால", en: "Santana Gopala" },
  "tilahavana": { kn: "ತಿಲಹವನ", hi: "तिलहवन", te: "తిలహవనం", ta: "திலஹவனம்", en: "Tilahavana" },
  "ashlesha bali": { kn: "ಆಶ್ಲೇಷಾ ಬಲಿ", hi: "आश्लेषा बलि", te: "ఆశ్లేషా బలి", ta: "ஆயில்ய பலி", en: "Ashlesha Bali" },
  "shani shanti": { kn: "ಶನಿ ಶಾಂತಿ", hi: "शनि शांति", te: "శని శాంతి", ta: "சனி சாந்தி", en: "Shani Shanti" },
  "maha pooja": { kn: "ಮಹಾಪೂಜೆ", hi: "महापूजा", te: "ಮಹಾಪೂಜ", ta: "மகாபூஜை", en: "Maha Pooja" },
  "mahapooja": { kn: "ಮಹಾಪೂಜೆ", hi: "महापूजा", te: "ಮಹಾಪೂಜ", ta: "மகாபூஜை", en: "Mahapooja" },
  "vishesha": { kn: "ವಿಶೇಷ", hi: "विशेष", te: "విశేష", ta: "விசேஷ", en: "Vishesha" },
  "ishtartha": { kn: "ಇಷ್ಟಾರ್ಥ", hi: "इष्टार्थ", te: "ఇష్టార్థ", ta: "இஷ்டார்த்த", en: "Ishtartha" },
  "kavacha": { kn: "ಕವಚ", hi: "कवच", te: "కవచం", ta: "கவசம்", en: "Kavacha" },
  "anugraha": { kn: "ಅನುಗ್ರಹ", hi: "अनुग्रह", te: "అనుగ్రహం", ta: "அனுக்ரஹம்", en: "Anugraha" },
  "ashirvada": { kn: "ಆಶೀರ್ವಾದ", hi: "आशीर्वाद", te: "ఆశీర్వాదం", ta: "ஆசீர்வாதம்", en: "Ashirvada" },
  "devotee": { kn: "ಭಕ್ತರು", hi: "भक्त", te: "భక్తుడు", ta: "பக்தர்", en: "Devotee" },
  "kumar": { kn: "ಕುಮಾರ್", hi: "कुमार", te: "కుమార్", ta: "குமார்", en: "Kumar" },
  "sharma": { kn: "ಶರ್ಮಾ", hi: "शर्मा", te: "శర్మ", ta: "சர்மா", en: "Sharma" },
  "rao": { kn: "ರಾವ್", hi: "राव", te: "రావు", ta: "ராவ்", en: "Rao" },
  "bhat": { kn: "ಭಟ್", hi: "भट्ट", te: "భట్", ta: "பட்", en: "Bhat" },
  "bhatt": { kn: "ಭಟ್", hi: "भट्ट", te: "భట్", ta: "பட்", en: "Bhatt" },
  "hegde": { kn: "ಹೆಗ್ಡೆ", hi: "हेगड़े", te: "హెగ్డే", ta: "ஹெக்டே", en: "Hegde" },
  "gowda": { kn: "ಗೌಡ", hi: "गौड़ा", te: "గౌడ", ta: "கவுடா", en: "Gowda" },
  "naidu": { kn: "ನಾಯ್ಡು", hi: "नायडू", te: "నాయుడు", ta: "நாயுடு", en: "Naidu" },
  "reddy": { kn: "ರೆಡ್ಡಿ", hi: "रेड्डी", te: "రెడ్డి", ta: "ரெட்டி", en: "Reddy" },
  "patil": { kn: "ಪಾಟೀಲ್", hi: "पाटील", te: "పాటీల్", ta: "பாட்டீல்", en: "Patil" },
  "joshi": { kn: "ಜೋಶಿ", hi: "जोशी", te: "జోషి", ta: "ஜோஷி", en: "Joshi" },
  "kulkarni": { kn: "ಕುಲಕರ್ಣಿ", hi: "कुलकर्णी", te: "కులకర్ణి", ta: "குல்கர்னி", en: "Kulkarni" },
  "ramesh": { kn: "ರಮೇಶ್", hi: "रमेश", te: "రమేష్", ta: "ரமேஷ்", en: "Ramesh" },
  "suresh": { kn: "ಸುರೇಶ್", hi: "सुरेश", te: "సురేష్", ta: "சுரேஷ்", en: "Suresh" },
  "ganesh": { kn: "ಗಣೇಶ್", hi: "गणेश", te: "గణేష్", ta: "கணேஷ்", en: "Ganesh" },
  "mahesh": { kn: "ಮಹೇಶ್", hi: "महेश", te: "మహేష్", ta: "மகேஷ்", en: "Mahesh" },
  "dinesh": { kn: "ದಿನೇಶ್", hi: "दिनेश", te: "దినేష్", ta: "தமேஷ்", en: "Dinesh" },
  "rajesh": { kn: "ರಾಜೇಶ್", hi: "राजेश", te: "రాజేష్", ta: "ராஜேஷ்", en: "Rajesh" },
  "vijay": { kn: "ವಿಜಯ್", hi: "विजय", te: "విజయ్", ta: "விஜய்", en: "Vijay" },
  "ajay": { kn: "ಅಜಯ್", hi: "अजय", te: "అజయ్", ta: "அஜய்", en: "Ajay" },
  "sanjay": { kn: "ಸಂಜಯ್", hi: "संजय", te: "సంజయ్", ta: "சஞ்சய்", en: "Sanjay" },
  "anil": { kn: "ಅನಿಲ್", hi: "अनिल", te: "అనిల్", ta: "அனில்", en: "Anil" },
  "sunil": { kn: "ಸುನಿಲ್", hi: "सुनील", te: "సునీల్", ta: "சுனில்", en: "Sunil" },
  "praveen": { kn: "ಪ್ರವೀಣ್", hi: "प्रवीण", te: "ప్రవీణ్", ta: "பிரவீன்", en: "Praveen" },
  "naveen": { kn: "ನವೀನ್", hi: "नवीन", te: "నవీన్", ta: "நவீன்", en: "Naveen" },
  "karthik": { kn: "ಕಾರ್ತಿಕ್", hi: "कार्तिक", te: "కార్తీక్", ta: "கார்த்திக்", en: "Karthik" },
  "deepak": { kn: "ದೀಪಕ್", hi: "दीपक", te: "దీపక్", ta: "தீபக்", en: "Deepak" },
  "manjunath": { kn: "ಮಂಜುನಾಥ್", hi: "मंजूनाथ", te: "మంజునాథ్", ta: "மஞ்சுநாத்", en: "Manjunath" },
  "venkatesh": { kn: "ವೆಂಕಟೇಶ್", hi: "वेंकटेश", te: "వెంకటేష్", ta: "வெங்கடேஷ்", en: "Venkatesh" },
  "vasishtha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasishtha" },
  "vashishtha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashishtha" },
  "vashistha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashistha" },
  "vasistha": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasistha" },
  "vasishta": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vasishta" },
  "vashishta": { kn: "ವಸಿಷ್ಠ", hi: "वशिष्ठ", te: "వసిష్ఠ", ta: "வசிஷ்டர்", en: "Vashishta" },
  "kashyapa": { kn: "ಕಾಶ್ಯಪ", hi: "काश्यप", te: "కాశ్యప", ta: "காஸ்யப", en: "Kashyapa" },
  "kashyap": { kn: "ಕಾಶ್ಯಪ", hi: "काश्यप", te: "కాశ్యప", ta: "காஸ்யப", en: "Kashyap" },
  "bharadwaja": { kn: "ಭಾರದ್ವಾಜ", hi: "भरद्वाज", te: "భారద్వాజ", ta: "பரத்வாஜ", en: "Bharadwaja" },
  "bharadwaj": { kn: "ಭಾರದ್ವಾಜ", hi: "भरद्वाज", te: "భారద్వాజ", ta: "பரத்வாஜ", en: "Bharadwaj" },
  "gautama": { kn: "ಗೌತಮ", hi: "गौतम", te: "గౌతమ", ta: "கௌதம", en: "Gautama" },
  "vishwamitra": { kn: "ವಿಶ್ವಾಮಿತ್ರ", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்திரர்", en: "Vishwamitra" },
  "viswamitra": { kn: "ವಿಶ್ವಾಮಿತ್ರ", hi: "विश्वामित्र", te: "విశ్వామిత్ర", ta: "விஸ்வாமித்திரர்", en: "Viswamitra" },
  "jamadagni": { kn: "ಜಮದಗ್ನಿ", hi: "जमदग्नि", te: "జమదग्नि", ta: "ஜமதக்னி", en: "Jamadagni" },
  "atri": { kn: "ಅತ್ರಿ", hi: "अत्रि", te: "అత్రి", ta: "அத்ரி", en: "Atri" },
  "agastya": { kn: "ಅಗಸ್ತ್ಯ", hi: "अगस्त्य", te: "అగస్త్య", ta: "அகஸ்தியர்", en: "Agastya" },
  "harita": { kn: "ಹರೀತ", hi: "हरीत", te: "హరీత", ta: "ஹரித", en: "Harita" },
  "srivatsa": { kn: "ಶ್ರೀವತ್ಸ", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச", en: "Srivatsa" },
  "shrivatsa": { kn: "ಶ್ರೀವತ್ಸ", hi: "श्रीवत्स", te: "శ్రీవత్స", ta: "ஸ்ரீவத்ச", en: "Shrivatsa" },
  "shandilya": { kn: "ಶಾಂಡಿಲ್ಯ", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய", en: "Shandilya" },
  "sandilya": { kn: "ಶಾಂಡಿಲ್ಯ", hi: "शांडिल्य", te: "శాండిల్య", ta: "சாண்டில்ய", en: "Sandilya" }
};

/** Phonetic character map for unknown words */
const PHONETIC_CHAR_MAP: Record<string, { kn: string; hi: string; te: string; ta: string }> = {
  "aa": { kn: "ಆ", hi: "आ", te: "ఆ", ta: "ஆ" },
  "ai": { kn: "ಐ", hi: "ऐ", te: "ఐ", ta: "ஐ" },
  "au": { kn: "ಔ", hi: "औ", te: "ఔ", ta: "ஔ" },
  "kh": { kn: "ಖ್", hi: "ख्", te: "ఖ్", ta: "க்" },
  "gh": { kn: "ಘ್", hi: "घ्", te: "ఘ్", ta: "க்" },
  "ch": { kn: "ಚ್", hi: "च्", te: "చ్", ta: "ச்" },
  "jh": { kn: "ಝ್", hi: "झ्", te: "ఝ్", ta: "ஜ" },
  "th": { kn: "ಥ್", hi: "थ्", te: "థ్", ta: "த்" },
  "dh": { kn: "ಧ್", hi: "ध्", te: "ధ్", ta: "த்" },
  "ph": { kn: "ಫ್", hi: "फ्", te: "ఫ్", ta: "ப்" },
  "bh": { kn: "ಭ್", hi: "भ्", te: "భ్", ta: "ப" },
  "sh": { kn: "ಶ್", hi: "श्", te: "శ్", ta: "ஷ்" },
  "k": { kn: "ಕ್", hi: "क्", te: "క్", ta: "க்" },
  "g": { kn: "ಗ್", hi: "ग्", te: "గ్", ta: "க்" },
  "j": { kn: "ಜ್", hi: "ज्", te: "జ్", ta: "ஜ" },
  "t": { kn: "ಟ್", hi: "ट्", te: "ట్", ta: "ட்" },
  "d": { kn: "ಡ್", hi: "ड्", te: "డ్", ta: "ட்" },
  "n": { kn: "ನ್", hi: "न्", te: "న్", ta: "ன்" },
  "p": { kn: "ಪ್", hi: "प्", te: "ప్", ta: "ப்" },
  "b": { kn: "ಬ್", hi: "ब्", te: "బ్", ta: "ப்" },
  "m": { kn: "ಮ್", hi: "म्", te: "మ్", ta: "ம்" },
  "y": { kn: "ಯ್", hi: "य्", te: "య్", ta: "ய்" },
  "r": { kn: "ರ್", hi: "र्", te: "ర్", ta: "ர்" },
  "l": { kn: "ಲ್", hi: "ल्", te: "ల్", ta: "ல்" },
  "v": { kn: "ವ್", hi: "व्", te: "వ్", ta: "வ்" },
  "w": { kn: "ವ್", hi: "व्", te: "వ్", ta: "வ்" },
  "s": { kn: "ಸ್", hi: "स्", te: "స్", ta: "ஸ்" },
  "h": { kn: "ಹ್", hi: "ह्", te: "హ్", ta: "ஹ்" },
  "a": { kn: "ಅ", hi: "अ", te: "అ", ta: "அ" },
  "i": { kn: "ಇ", hi: "इ", te: "ఇ", ta: "இ" },
  "u": { kn: "ಉ", hi: "उ", te: "ఉ", ta: "உ" },
  "e": { kn: "ಎ", hi: "ए", te: "ఎ", ta: "எ" },
  "o": { kn: "ಒ", hi: "ओ", te: "ఒ", ta: "ஒ" }
};

/**
 * Phonetically transliterates a single unknown English word into an Indic script.
 */
function phoneticTransliterateWord(word: string, langCode: "kn" | "hi" | "te" | "ta"): string {
  if (!word) return word;
  
  // If the word contains non-English (Indic) characters, convert to Latin phonetic first
  let inputWord = word;
  if (detectScript(word) !== "en") {
    inputWord = transliterateIndicToLatin(word);
  }

  const lower = inputWord.toLowerCase();
  let result = "";
  let i = 0;

  while (i < lower.length) {
    // Try 2-char match first
    const two = lower.slice(i, i + 2);
    if (PHONETIC_CHAR_MAP[two]) {
      result += PHONETIC_CHAR_MAP[two][langCode];
      i += 2;
      continue;
    }
    // 1-char match
    const one = lower.slice(i, i + 1);
    if (PHONETIC_CHAR_MAP[one]) {
      result += PHONETIC_CHAR_MAP[one][langCode];
      i += 1;
      continue;
    }
    result += inputWord[i];
    i += 1;
  }
  return result;
}

/**
 * Detects the script of an input string (Kannada, Devanagari, Telugu, Tamil, or English).
 */
export function detectScript(text: string): "kn" | "hi" | "te" | "ta" | "en" {
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  return "en";
}

/** Indic (Kannada, Devanagari, Telugu, Tamil) to Latin/English phonetic transliteration */
export function transliterateIndicToLatin(text: string): string {
  if (!text) return "";

  // Common titles & prefixes
  let s = text
    .replace(/ಶ್ರೀರಾಮ್|ಶ್ರೀರಾಮ/g, "Shreeram ")
    .replace(/ಶ್ರೀ/g, "Shree ")
    .replace(/ಶ್ರೀಯುತ/g, "Shriyuta ")
    .replace(/ಪಂಡಿತ್|ಪಂಡಿತ/g, "Pandit ")
    .replace(/ಅರ್ಚಕ/g, "Archaka ")
    .replace(/ಶಾಸ್ತ್ರಿ/g, "Shastri ")
    .replace(/ಪೂಜಾರಿ/g, "Pujari ")
    .replace(/ಭಟ್|ಭಟ್ಟ/g, "Bhat ")
    .replace(/ಹೆಗ್ಡೆ/g, "Hegde ")
    .replace(/ಜೋಶಿ/g, "Joshi ")
    .replace(/ರಾವ್/g, "Rao ")
    .replace(/ಗೌಡ/g, "Gowda ")
    .replace(/ವಿನಾಯಕ್|ವಿನಾಯಕ/g, "Vinayaka ").replace(/ಹಾಗೂ|ಮತ್ತು/g, "and ").replace(/(^|[\s_.,-])(ನಾಯಕ್|ನಾಯ್ಕ)(?=[\s_.,-]|$)/g, "$1Nayak ")
    .replace(/ಕುಮಾರ್/g, "Kumar ")
    .replace(/ಶರ್ಮಾ/g, "Sharma ")
    .replace(/ಮಂಜುನಾಥ್/g, "Manjunath ")
    .replace(/ವೆಂಕಟೇಶ್/g, "Venkatesh ")
    .replace(/ಗಜಾನನ/g, "Gajanana ")
    .replace(/ಗೌತಮ್/g, "Gowtam ")
    .replace(/ಸತ್ಯನಾರಾಯಣ/g, "Satyanarayana ")
    .replace(/ವರಮಹಾಲಕ್ಷ್ಮಿ|ವರಮಹಾಲಕ್ಷ್ಮೀ/g, "Varamahalakshmi ")
    .replace(/ಮಹಾಲಕ್ಷ್ಮಿ|ಮಹಾಲಕ್ಷ್ಮೀ/g, "Mahalakshmi ")
    .replace(/ಲಕ್ಷ್ಮಿ|ಲಕ್ಷ್ಮೀ/g, "Lakshmi ")
    .replace(/ರುದ್ರಾಭಿಷೇಕ/g, "Rudrabhisheka ")
    .replace(/ಮೃತ್ಯುಂಜಯ/g, "Mrityunjaya ")
    .replace(/ಸುದರ್ಶನ/g, "Sudarshana ")
    .replace(/ನವಗ್ರಹ/g, "Navagraha ")
    .replace(/ಚಂಡಿಕಾ|ಚಂಡಿ/g, "Chandi ")
    .replace(/ಗಣಪತಿ/g, "Ganapati ")
    .replace(/ವಿನಾಯಕ/g, "Vinayaka ")
    .replace(/ಆಯುಷ್ಯ/g, "Ayushya ")
    .replace(/ಧನ್ವಂತರಿ/g, "Dhanvantari ")
    .replace(/ಕಾಲಸರ್ಪ/g, "Kalasarpa ")
    .replace(/ಸರ್ಪ ಸಂಸ್ಕಾರ|ಸರ್ಪಸಂಸ್ಕಾರ/g, "Sarpa Samskara ")
    .replace(/ವಾಸ್ತು/g, "Vastu ")
    .replace(/ತ್ರಿಪಿಂಡಿ/g, "Tripindi ")
    .replace(/ಪ್ರೇತೋದ್ಧಾರ/g, "Pretoddhara ")
    .replace(/ಪಿಂಡ ಪ್ರದಾನ/g, "Pinda Pradana ")
    .replace(/ಪೂಜೆ|ಪೂಜಾ/g, "Pooja ")
    .replace(/ಹೋಮ/g, "Homa ")
    .replace(/ಹವನ/g, "Havana ")
    .replace(/ಶಾಂತಿ/g, "Shanti ")
    .replace(/ವ್ರತ/g, "Vrata ")
    .replace(/ಸಂಕಲ್ಪ/g, "Sankalpa ")
    .replace(/ಸೇವೆ/g, "Seva ")
    .replace(/ಅಭಿಷೇಕ/g, "Abhisheka ")
    .replace(/ಅರ್ಚನೆ/g, "Archana ")
    .replace(/ಶ್ರಾದ್ಧ/g, "Shraddha ")
    .replace(/ತರ್ಪಣ/g, "Tarpana ")
    .replace(/ಮಹಾಪೂಜೆ/g, "Mahapooja ");

  // Comprehensive character mapping for Indic Unicode: Kannada, Tamil, Telugu, Devanagari
  const indicMap: Record<string, string> = {
    // Kannada Vowels
    "ಅ": "a", "ಆ": "aa", "ಇ": "i", "ಈ": "ee", "ಉ": "u", "ಊ": "oo", "ಋ": "ru",
    "ಎ": "e", "ಏ": "e", "ಐ": "ai", "ಒ": "o", "ಓ": "o", "ಔ": "au", "ಅಂ": "am", "ಅಃ": "ah",
    // Kannada Consonants
    "ಕ": "ka", "ಖ": "kha", "ಗ": "ga", "ಘ": "gha", "ಙ": "nga",
    "ಚ": "cha", "ಛ": "chha", "ಜ": "ja", "ಝ": "jha", "ಞ": "nya",
    "ಟ": "ta", "ಠ": "tha", "ಡ": "da", "ಢ": "dha", "ಣ": "na",
    "ತ": "ta", "ಥ": "tha", "ದ": "da", "ಧ": "dha", "ನ": "na",
    "ಪ": "pa", "ಫ": "pha", "ಬ": "ba", "ಭ": "bha", "ಮ": "ma",
    "ಯ": "ya", "ರ": "ra", "ಱ": "ra", "ಲ": "la", "ವ": "va",
    "ಶ": "sha", "ಷ": "sha", "ಸ": "sa", "ಹ": "ha", "ಳ": "la",
    // Kannada Matras
    "ಾ": "aa", "ಿ": "i", "ೀ": "ee", "ು": "u", "ೂ": "oo", "ೃ": "ru",
    "ೆ": "e", "ೇ": "e", "ೈ": "ai", "ೊ": "o", "ೋ": "o", "ೌ": "au",
    "ಂ": "m", "ಃ": "h",

    // Tamil Vowels (0x0B80 - 0x0BFF)
    "அ": "a", "ஆ": "aa", "இ": "i", "ஈ": "ee", "உ": "u", "ஊ": "oo",
    "எ": "e", "ஏ": "e", "ஐ": "ai", "ஒ": "o", "ஓ": "o", "ஔ": "au", "ஃ": "h",
    // Tamil Consonants
    "க": "ka", "ங": "nga", "ச": "cha", "ஞ": "nya", "ட": "ta", "ண": "na",
    "த": "ta", "ந": "na", "ன": "na", "ப": "pa", "ம": "ma", "ய": "ya",
    "ர": "ra", "ற": "ra", "ல": "la", "ள": "la", "ழ": "zha", "வ": "va",
    "ஷ": "sha", "ஸ": "sa", "ஹ": "ha", "ஜ": "ja",
    // Tamil Matras
    "ா": "aa", "ி": "i", "ீ": "ee", "ு": "u", "ூ": "oo",
    "ெ": "e", "ே": "e", "ை": "ai", "ொ": "o", "ோ": "o", "ௌ": "au",

    // Telugu Vowels (0x0C00 - 0x0C7F)
    "అ": "a", "ఆ": "aa", "ఇ": "i", "ఈ": "ee", "ఉ": "u", "ఊ": "oo", "ఋ": "ru",
    "ఎ": "e", "ఏ": "e", "ఐ": "ai", "ఒ": "o", "ఓ": "o", "ఔ": "au", "అం": "am", "అః": "ah",
    // Telugu Consonants
    "క": "ka", "ఖ": "kha", "గ": "ga", "ఘ": "gha", "ఙ": "nga",
    "చ": "cha", "ఛ": "chha", "జ": "ja", "ఝ": "jha", "ఞ": "nya",
    "ట": "ta", "ఠ": "tha", "డ": "da", "ఢ": "dha", "ణ": "na",
    "త": "ta", "థ": "tha", "ద": "da", "ధ": "dha", "న": "na",
    "ప": "pa", "ఫ": "pha", "బ": "ba", "భ": "bha", "మ": "ma",
    "య": "ya", "ర": "ra", "ఱ": "ra", "ల": "la", "వ": "va",
    "శ": "sha", "ష": "sha", "స": "sa", "హ": "ha", "ళ": "la",
    // Telugu Matras
    "ా": "aa", "ి": "i", "ీ": "ee", "ు": "u", "ూ": "oo", "ృ": "ru",
    "ె": "e", "ే": "e", "ై": "ai", "ొ": "o", "ో": "o", "ౌ": "au",
    "ం": "m", "ః": "h",

    // Devanagari Vowels (0x0900 - 0x097F)
    "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ऋ": "ru",
    "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "अं": "am", "अः": "ah", "ॐ": "Om",
    // Devanagari Consonants
    "क": "ka", "ख": "kha", "ग": "ga", "घ": "gha", "ङ": "nga",
    "च": "cha", "छ": "chha", "ज": "ja", "झ": "jha", "ञ": "nya",
    "ट": "ta", "ठ": "tha", "ड": "da", "ढ": "dha", "ण": "na",
    "त": "ta", "थ": "tha", "द": "da", "ध": "dha", "न": "na",
    "प": "pa", "फ": "pha", "ब": "ba", "भ": "bha", "म": "ma",
    "य": "ya", "र": "ra", "ल": "la", "व": "va",
    "श": "sha", "ष": "sha", "स": "sa", "ह": "ha", "ळ": "la",
    // Devanagari Matras
    "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ru",
    "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ं": "m", "ः": "h"
  };

  const viramas = new Set(["್", "்", "్", "्"]);
  const matras = new Set([
    "ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ",
    "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ",
    "ా", "ి", "ీ", "ు", "ూ", "ృ", "ె", "ే", "ై", "ొ", "ో", "ౌ",
    "ा", "ि", "ी", "ु", "ू", "ृ", "े", "ै", "ो", "ौ"
  ]);

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (viramas.has(ch)) {
      // Halant/Virama/Pulli removes the trailing 'a' of previous consonant
      if (out.endsWith("a")) {
        out = out.slice(0, -1);
      }
    } else if (matras.has(ch)) {
      if (out.endsWith("a")) {
        out = out.slice(0, -1);
      }
      out += indicMap[ch] || "";
    } else if (indicMap[ch] !== undefined) {
      out += indicMap[ch];
    } else {
      out += ch;
    }
  }

  return out.replace(/\s+/g, " ").trim();
}

/**
 * Transliterates English/Indic names into the requested target language (kn, hi, te, ta, en).
 */
// Brahmic Script Offsets
const SCRIPT_OFFSETS: Record<string, number> = {
  hi: 0x0900,
  te: 0x0c00,
  kn: 0x0c80
};

// Tamil consonant/vowel remapping table (offsets 0x00 to 0x7F)
const TAMIL_OFFSET_MAP: Record<number, number> = {
  0x02: 0x02, // anusvara
  0x05: 0x05, // a
  0x06: 0x06, // aa
  0x07: 0x07, // i
  0x08: 0x08, // ee
  0x09: 0x09, // u
  0x0a: 0x0a, // oo
  0x0e: 0x0e, // e
  0x0f: 0x0f, // ee
  0x10: 0x10, // ai
  0x12: 0x12, // o
  0x13: 0x13, // oo
  0x14: 0x14, // au
  0x15: 0x15, // ka
  0x16: 0x15, // kha -> ka
  0x17: 0x15, // ga -> ka
  0x18: 0x15, // gha -> ka
  0x19: 0x19, // nga
  0x1a: 0x1a, // cha
  0x1b: 0x1a, // chha -> cha
  0x1c: 0x1a, // ja -> cha
  0x1d: 0x1a, // jha -> cha
  0x1e: 0x1e, // nya
  0x1f: 0x1f, // tta
  0x20: 0x1f, // ttha -> tta
  0x21: 0x1f, // dda -> tta
  0x22: 0x1f, // ddha -> tta
  0x23: 0x23, // nna
  0x24: 0x24, // ta
  0x25: 0x24, // tha -> ta
  0x26: 0x24, // da -> ta
  0x27: 0x24, // dha -> ta
  0x28: 0x28, // na
  0x2a: 0x2a, // pa
  0x2b: 0x2a, // pha -> pa
  0x2c: 0x2a, // ba -> pa
  0x2d: 0x2a, // bha -> pa
  0x2e: 0x2e, // ma
  0x2f: 0x2f, // ya
  0x30: 0x30, // ra
  0x32: 0x32, // la
  0x33: 0x33, // lha
  0x35: 0x35, // va
  0x36: 0x37, // sha -> ssa (0x0BB7)
  0x37: 0x37, // ssa (0x0BB7)
  0x38: 0x38, // sa (0x0BB8)
  0x39: 0x39, // ha (0x0BB9)
  0x3e: 0x3e, // aa
  0x3f: 0x3f, // i
  0x40: 0x40, // ee
  0x41: 0x41, // u
  0x42: 0x42, // oo
  0x46: 0x46, // e
  0x47: 0x47, // ee
  0x48: 0x48, // ai
  0x4a: 0x4a, // o
  0x4b: 0x4b, // oo
  0x4c: 0x4c, // au
  0x4d: 0x4d  // virama
};

export function convertIndicScript(text: string, targetLang: "kn" | "hi" | "te" | "ta"): string {
  if (!text) return text;
  if (targetLang === "ta") {
    let res = "";
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      let srcBase = 0;
      if (code >= 0x0900 && code <= 0x097f) srcBase = 0x0900;
      else if (code >= 0x0c00 && code <= 0x0c7f) srcBase = 0x0c00;
      else if (code >= 0x0c80 && code <= 0x0cff) srcBase = 0x0c80;
      else if (code >= 0x0b80 && code <= 0x0bff) srcBase = 0x0b80;

      if (srcBase !== 0) {
        const offset = code - srcBase;
        const mapped = TAMIL_OFFSET_MAP[offset];
        if (mapped !== undefined) {
          res += String.fromCharCode(0x0b80 + mapped);
        }
      } else {
        res += text[i];
      }
    }
    return res;
  }

  const targetBase = SCRIPT_OFFSETS[targetLang];
  if (!targetBase) return text;

  let res = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    let srcBase = 0;
    if (code >= 0x0900 && code <= 0x097f) srcBase = 0x0900;
    else if (code >= 0x0b80 && code <= 0x0bff) srcBase = 0x0b80;
    else if (code >= 0x0c00 && code <= 0x0c7f) srcBase = 0x0c00;
    else if (code >= 0x0c80 && code <= 0x0cff) srcBase = 0x0c80;

    if (srcBase !== 0) {
      const offset = code - srcBase;
      res += String.fromCharCode(targetBase + offset);
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Transliterates English/Indic names into the requested target language (kn, hi, te, ta, en).
 */
export function transliterateName(inputName: string, targetLang: string): string {
  if (!inputName || !inputName.trim()) return inputName;
  const langCode = (targetLang ? targetLang.split("-")[0].toLowerCase() : "en") as "kn" | "hi" | "te" | "ta" | "en";
  const nameTrimmed = inputName.trim();
  const inputScript = detectScript(nameTrimmed);

  // If the input is already in the requested target script with no foreign Indic contamination
  if (inputScript === langCode) {
    if (langCode !== "kn" && /[\u0C80-\u0CFF]/.test(nameTrimmed)) {
      // Contains foreign Kannada letters - proceed to transliterate
    } else if (langCode === "en" && /[\u0900-\u0D7F]/.test(nameTrimmed)) {
      // Contains Indic letters - proceed to transliterate
    } else {
      return nameTrimmed;
    }
  }

  // 1. Direct whole-name dictionary lookup
  const lowerWhole = nameTrimmed.toLowerCase();
  if (NAME_DICTIONARY[lowerWhole] && NAME_DICTIONARY[lowerWhole][langCode]) {
    return NAME_DICTIONARY[lowerWhole][langCode];
  }
  for (const map of Object.values(NAME_DICTIONARY)) {
    for (const val of Object.values(map)) {
      if (val.toLowerCase() === lowerWhole) {
        return map[langCode] || val;
      }
    }
  }

  // 2. Multi-word phrase substitutions from dictionary (e.g. "vinayaka shanti", "kuja shanti", "narayana bali")
  let processed = nameTrimmed;

  if (langCode === "en") {
    // English output: convert words to English
    const words = processed.split(/\s+/);
    const translatedWords = words.map((word) => {
      const wLower = word.toLowerCase();
      if (NAME_DICTIONARY[wLower] && NAME_DICTIONARY[wLower].en) {
        return NAME_DICTIONARY[wLower].en;
      }
      for (const map of Object.values(NAME_DICTIONARY)) {
        for (const val of Object.values(map)) {
          if (val.toLowerCase() === wLower) {
            return map.en || val;
          }
        }
      }
      return transliterateIndicToLatin(word);
    });
    return translatedWords.join(" ").replace(/\s+/g, " ").trim();
  }

  // Indic target (kn, hi, te, ta):
  const words = processed.split(/\s+/);
  const translatedWords = words.map((word) => {
    const wLower = word.toLowerCase();
    // Dictionary word match
    if (NAME_DICTIONARY[wLower] && NAME_DICTIONARY[wLower][langCode]) {
      return NAME_DICTIONARY[wLower][langCode];
    }
    for (const map of Object.values(NAME_DICTIONARY)) {
      for (const val of Object.values(map)) {
        if (val.toLowerCase() === wLower) {
          return map[langCode] || val;
        }
      }
    }

    // If word contains Indic characters, use authentic Brahmic script conversion
    if (/[\u0900-\u0D7F]/.test(word)) {
      return convertIndicScript(word, langCode);
    }

    // Fallback phonetic transliteration for English word
    return phoneticTransliterateWord(word, langCode);
  });

  let result = translatedWords.join(" ").replace(/\s+/g, " ").trim();

  // Final Script Purity Guard:
  // If target is NOT kn, convert any remaining Kannada characters into target script
  if (langCode !== "kn" && /[\u0C80-\u0CFF]/.test(result)) {
    result = convertIndicScript(result, langCode);
  }
  return result;
}
