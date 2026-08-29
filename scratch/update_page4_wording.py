file_path = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/SevaPrintTemplates.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Title of Page 4
old_title_dict = """  const TITLE_DICT: L5 = {
    kn: "✦ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಪತ್ರಿಕೆ ✦",
    hi: "✦ गोकर्ण क्षेत्र महापूजा उपचार एवं पारिवारिक रक्षा पत्र ✦",
    te: "✦ గోకర్ణ క్షేత్ర మహాపూజా నివారణ మరియు కుటుంబ రక్షా పత్రం ✦",
    ta: "✦ கோகர்ண க்ஷேத்திரம் மகாபூஜை பரிகாரம் மற்றும் குடும்ப ரக்ஷா அட்டை ✦",
    en: "✦ Gokarna Kshetra Sacred Remedial Puja & Family Protection Sheet ✦"
  };"""

new_title_dict = """  const TITLE_DICT: L5 = {
    kn: "✦ ಮಹಾಪೂಜಾ ಪರಿಹಾರ ಹಾಗೂ ಕೌಟುಂಬಿಕ ರಕ್ಷಾ ಪತ್ರಿಕೆ ✦",
    hi: "✦ महापूजा उपचार एवं पारिवारिक रक्षा पत्र ✦",
    te: "✦ మహాపూజా నివారణ మరియు కుటుంబ రక్షా పత్రం ✦",
    ta: "✦ மகாபூஜை பரிகாரம் மற்றும் குடும்ப ரக்ஷா அட்டை ✦",
    en: "✦ Sacred Remedial Puja & Family Protection Sheet ✦"
  };"""

content = content.replace(old_title_dict, new_title_dict)

# 2. Update CYCLE_LIST (items 2, 3, 4)
old_cycle_2 = """    {
      title: {
        kn: "🌊 ಆಷಾಢ - ಶ್ರಾವಣ: ರುದ್ರಾಭಿಷೇಕ ಶಾಂತಿ",
        hi: "🌊 आषाढ़ - श्रावण: रुद्राभिषेक शांति",
        te: "🌊 ఆషాఢ - శ్రావణ: రుద్రాభిషేకం",
        ta: "🌊 ஆடி - ஆவணி: ருத்ராபிஷேகம்",
        en: "🌊 Ashadha - Shravana: Rudrabhishekam & Serpent Remedies"
      },
      desc: {
        kn: "ಕುಜ ದೋಷ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ಸಂತಾನ ಅಡಚಣೆ ನಿವಾರಣೆಗೆ ಶ್ರಾವಣ ಸೋಮವಾರ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಪ್ರತಿಷ್ಠೆ ಸೇವೆ ಶ್ರೇಷ್ಠ.",
        hi: "कुज दोष, सर्प दोष तथा संतान बाधा निवारण हेतु श्रावण सोमवार को महाबलेश्वर आत्मलिंग पर रुद्राभिषेक एवं नाग शांति कराएं।",
        te: "కుజ దోషం, సర్ప దోషం నివారణకు శ్రావణ సోమవారం మహాబలేశ్వర ఆత్మలింగానికి రుద్రాభిషేకం మరియు నాగపూజ శ్రేష్ఠం.",
        ta: "செவ்வாய் தோஷம், நாக தோஷத்தை நீக்க ஆடி/ஆவணி சோமவார ஆத்மலிங்க ருத்ராபிஷேகம் சிறந்தது.",
        en: "Holy Shravana Mondays Rudrabhishekam on Gokarna Atmalinga effectively dissolves Kuja and Rahu-Ketu impediments."
      }
    },"""

new_cycle_2 = """    {
      title: {
        kn: "🌊 ಆಷಾಢ - ಶ್ರಾವಣ: ರುದ್ರಾಭಿಷೇಕ ಶಾಂತಿ",
        hi: "🌊 आषाढ़ - श्रावण: रुद्राभिषेक शांति",
        te: "🌊 ఆషాఢ - శ్రావణ: రుద్రాభిషేకం",
        ta: "🌊 ஆடி - ஆவணி: ருத்ராபிஷேகம்",
        en: "🌊 Ashadha - Shravana: Rudrabhishekam & Serpent Remedies"
      },
      desc: {
        kn: "ಕುಜ ದೋಷ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ಸಂತಾನ ಅಡಚಣೆ ನಿವಾರಣೆಗೆ ಶ್ರಾವಣ ಸೋಮವಾರ ಶಿವಲಿಂಗ / ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ನಾಗಪೂಜೆ ಮಾಡುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
        hi: "कुज दोष, सर्प दोष तथा संतान बाधा निवारण हेतु श्रावण सोमवार को शिवलिंग / आत्मलिंग पर रुद्राभिषेक एवं नाग पूजा करना सर्वश्रेष्ठ है।",
        te: "కుజ దోషం, సర్ప దోషం నివారణకు శ్రావణ సోమవారం శివలింగం / ఆత్మలింగానికి రుద్రాభిషేకం మరియు నాగపూజ చేయడం శ్రేష్ఠం.",
        ta: "செவ்வாய் தோஷம், நாக தோஷத்தை நீக்க ஆடி/ஆவணி சோமவார சிவலிங்க / ஆத்மலிங்க ருத்ராபிஷேகம் மற்றும் நாகபூஜை செய்வது சிறந்தது.",
        en: "Performing Rudrabhishekam on Shivlinga / Atmalinga and Naga Pooja on holy Shravana Mondays effectively dissolves Kuja and planetary impediments."
      }
    },"""

content = content.replace(old_cycle_2, new_cycle_2)

old_cycle_3 = """    {
      title: {
        kn: "🌾 ಭಾದ್ರಪದ - ಆಶ್ವಯುಜ: ಪಿತೃ ತರ್ಪಣ",
        hi: "🌾 भाद्रपद - आश्विन: पितृ तर्पण",
        te: "🌾 భాద్రపద - ఆశ్వయుజ: పితృ తర్పణం",
        ta: "🌾 புரட்டாசி - ஐப்பசி: பித்ரு தர்பணம்",
        en: "🌾 Bhadrapada - Ashvayuja: Pitru Tarpanam & Ancestral Grace"
      },
      desc: {
        kn: "ಪಿತೃ ದೋಷ ಶಾಂತಿಗೆ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆಯಂದು ಗೋಕರ್ಣ ರುದ್ರಪಾದ ತೀರ್ಥದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು ವಂಶ ವೃದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "पितृ दोष शांति हेतु महालया अमावस्या पर गोकर्ण रुद्रपाद तीर्थ में तर्पण एवं अन्नदान करने से वंश वृद्धि एवं सुख मिलता है।",
        te: "పితృ దోష శాంతికి మహాలయ అమావాస్య నాడు గోకర్ణ రుద్రపాద తీర్థంలో తర్పణం మరియు అన్నదానం చేయడం వలన వంశాభివృద్ధి లభిస్తుంది.",
        ta: "பித்ரு தோஷ சாந்திக்கு மகாளய அமாவாசையன்று கோகர்ண ருத்ரபாத தீர்த்தத்தில் தர்பணமும் அன்னதானமும் செய்வது வம்ச சுபிட்சம் தரும்.",
        en: "Performing Mahalaya Pitru Tarpanam and Shradha at Gokarna guarantees ancestral peace and prospers descendants."
      }
    },"""

new_cycle_3 = """    {
      title: {
        kn: "🌾 ಭಾದ್ರಪದ - ಆಶ್ವಯುಜ: ಪಿತೃ ತರ್ಪಣ",
        hi: "🌾 भाद्रपद - आश्विन: पितृ तर्पण",
        te: "🌾 భాద్రపద - ఆశ్వయుజ: పితృ తర్పణం",
        ta: "🌾 புரட்டாசி - ஐப்பசி: பித்ரு தர்பணம்",
        en: "🌾 Bhadrapada - Ashvayuja: Pitru Tarpanam & Ancestral Grace"
      },
      desc: {
        kn: "ಪಿತೃ ದೋಷ ಶಾಂತಿಗೆ ಮಹಾಲಯ ಅಮಾವಾಸ್ಯೆಯಂದು ಪವಿತ್ರ ತೀರ್ಥಕ್ಷೇತ್ರದಲ್ಲಿ ಅಥವಾ ಸ್ವಗೃಹದಲ್ಲಿ ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಅನ್ನದಾನ ಮಾಡುವುದು ವಂಶ ವೃದ್ಧಿ ನೀಡುತ್ತದೆ.",
        hi: "पितृ दोष शांति हेतु महालया अमावस्या पर पवित्र तीर्थ में अथवा अपने घर में तर्पण एवं अन्नदान करने से वंश वृद्धि एवं शांति मिलती है।",
        te: "పితృ దోష శాంతికి మహాలయ అమావాస్య నాడు పవిత్ర తీర్థంలో లేదా స్వగృహంలో తర్పణం మరియు అన్నదానం చేయడం వలన వంశాభివృద్ధి లభిస్తుంది.",
        ta: "பித்ரு தோஷ சாந்திக்கு மகாளய அமாவாசையன்று புண்ணிய தீர்த்தத்தில் அல்லது இல்லத்தில் தர்பணமும் அன்னதானமும் செய்வது வம்ச சுபிட்சம் தரும்.",
        en: "Performing Mahalaya Pitru Tarpanam and food charity at sacred pilgrimage tirthas or at home guarantees ancestral peace and prospers descendants."
      }
    },"""

content = content.replace(old_cycle_3, new_cycle_3)

old_cycle_4 = """    {
      title: {
        kn: "🪔 ಕಾರ್ತಿಕ - ಮಾಘ: ದೀಪೋತ್ಸವ ದರ್ಶನ",
        hi: "🪔 कार्तिक - माघ: दीपोत्सव दर्शन",
        te: "🪔 కార్తీక - మాఘ: దీపోత్సవం",
        ta: "🪔 கார்த்திகை - மாசி: தீபோற்சவம்",
        en: "🪔 Kartika - Magha: Festival of Lights & Atmalinga Grace"
      },
      desc: {
        kn: "ಕಾರ್ತಿಕ ಸೋಮವಾರ ದೀಪೋತ್ಸವ ಹಾಗೂ ಮಹಾ ಶಿವರಾತ್ರಿಯಂದು ಆತ್ಮಲಿಂಗ ಸ್ಪರ್ಶ ಪೂಜೆ ಮಾಡಿಸುವುದರಿಂದ ಸಮಸ್ತ ಪಾಪ ಕ್ಷಯವಾಗಿ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "कार्तिक सोमवार दीपदान तथा महाशिवरात्रि पर आत्मलिंग स्पर्श पूजन कराने से पाप नष्ट होकर अपार सुख और समृद्धि मिलती है।",
        te: "కార్తీక సోమవారం దీపారాధన మరియు మహా శివరాత్రి నాడు ఆత్మలింగ స్పర్శ పూజ చేయించడం వలన అష్టైశ్వర్యాలు సిద్ధిస్తాయి.",
        ta: "கார்த்திகை சோமவார தீப வழிபாடும் மகா சிவராத்திரி ஆத்மலிங்க தரிசனமும் அஷ்டலக்ஷ்மி கடாட்சம் தரும்.",
        en: "Lighting lamps during Kartika month and performing Atmalinga touch worship on Shivaratri invokes supreme fortune."
      }
    }"""

new_cycle_4 = """    {
      title: {
        kn: "🪔 ಕಾರ್ತಿಕ - ಮಾಘ: ದೀಪೋತ್ಸವ ದರ್ಶನ",
        hi: "🪔 कार्तिक - माघ: दीपोत्सव दर्शन",
        te: "🪔 కార్తీక - మాఘ: దీపోత్సవం",
        ta: "🪔 கார்த்திகை - மாசி: தீபோற்சவம்",
        en: "🪔 Kartika - Magha: Festival of Lights & Atmalinga Grace"
      },
      desc: {
        kn: "ಕಾರ್ತಿಕ ಸೋಮವಾರ ದೀಪೋತ್ಸವ ಹಾಗೂ ಮಹಾ ಶಿವರಾತ್ರಿಯಂದು ಶಿವಲಿಂಗ / ಆತ್ಮಲಿಂಗ ಪೂಜೆ ಹಾಗೂ ದೀಪಾರಾಧನೆ ಮಾಡುವುದರಿಂದ ಸಮಸ್ತ ಪಾಪ ಕ್ಷಯವಾಗಿ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
        hi: "कार्तिक सोमवार दीपदान तथा महाशिवरात्रि पर शिवलिंग / आत्मलिंग पूजन एवं दीपाराधन करने से पाप नष्ट होकर अपार सुख और समृद्धि मिलती है।",
        te: "కార్తీక సోమవారం దీపారాధన మరియు మహా శివరాత్రి నాడు శివలింగ / ఆత్మలింగ పూజ చేయడం వలన అష్టైశ్వర్యాలు సిద్ధిస్తాయి.",
        ta: "கார்த்திகை சோமவார தீப வழிபாடும் மகா சிவராத்திரி சிவலிங்க / ஆத்மலிங்க பூஜையும் அஷ்டலக்ஷ்மி கடாட்சம் தரும்.",
        en: "Lighting lamps during Kartika month and performing Shivlinga / Atmalinga worship on Maha Shivaratri invokes supreme fortune and peace."
      }
    }"""

content = content.replace(old_cycle_4, new_cycle_4)

# 3. Update VASTU_RULES (item 1 Simhadwara Kumkuma)
old_vastu_1 = """      desc: {
        kn: "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರದಲ್ಲಿ ಪ್ರತಿದಿನ ಗೋಕರ್ಣ ಪ್ರಸಾದದ ಅರಿಶಿನ-ಕುಂಕುಮ ಇಡುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಬಾಧೆ ಶಮನವಾಗುತ್ತದೆ.",
        hi: "घर के मुख्य द्वार पर प्रतिदिन गोकर्ण प्रसाद का हल्दी-कुमकुम लगाने से नकारात्मक ऊर्जा तथा कुदृष्टि दूर होती है।",
        te: "ఇంటి ముఖ్య ద్వారానికి ప్రతిరోజూ గోకర్ణ ప్రసాదం పసుపు-కుంకుమ అద్దడం వలన దిష్టి దోషాలు తొలగిపోతాయి.",
        ta: "வீட்டின் தலைவாசலில் தினமும் கோகர்ண பிரசாத மஞ்சள்-குங்குமம் வைப்பது கண் திருஷ்டியை விலக்கும்.",
        en: "Applying sacred Gokarna Kumkuma at the main entrance shields the home from negative energy and evil eye."
      }"""

new_vastu_1 = """      desc: {
        kn: "ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರದಲ್ಲಿ ಪ್ರತಿದಿನ ಪವಿತ್ರ ಅರಿಶಿನ-ಕುಂಕುಮ ಧಾರಣೆ ಮಾಡುವುದರಿಂದ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿ ಹಾಗೂ ದುಷ್ಟ ದೃಷ್ಟಿ ಬಾಧೆ ಶಮನವಾಗುತ್ತದೆ.",
        hi: "घर के मुख्य द्वार पर प्रतिदिन पवित्र हल्दी-कुमकुम लगाने से नकारात्मक ऊर्जा तथा कुदृष्टि दूर होती है।",
        te: "ఇంటి ముఖ్య ద్వారానికి ప్రతిరోజూ పవిత్ర పసుపు-కుంకుమ అద్దడం వలన దిష్టి దోషాలు తొలగిపోతాయి.",
        ta: "வீட்டின் தலைவாசலில் தினமும் புனித மஞ்சள்-குங்குமம் வைப்பது கண் திருஷ்டியை விலக்கும்.",
        en: "Applying auspicious Kumkuma and Turmeric at the main entrance shields the home from negative energy and evil eye."
      }"""

content = content.replace(old_vastu_1, new_vastu_1)

# 4. Update Section 3 (Pitru Tarpanam)
old_section_3_desc = """            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಗೋಕರ್ಣ ಕ್ಷೇತ್ರವು ಪರಮ ಪವಿತ್ರ ರುದ್ರಪಾದ ಕ್ಷೇತ್ರವಾಗಿದ್ದು, ಇಲ್ಲಿ ಪಿತೃ ಶ್ರಾದ್ಧ, ತರ್ಪಣ ಮಾಡುವುದರಿಂದ ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.", hi: "गोकर्ण क्षेत्र परम पवित्र रुद्रपाद तीर्थ है, यहाँ पितृ तर्पण कराने से सात पीढ़ियों के पितरों को सद्गति मिलती है तथा वंश समृद्धि प्राप्त होती है।", te: "గోకర్ణ క్షేత్రం పరమ పవిత్ర రుద్రపాద క్షేత్రం, ఇక్కడ పితృ తర్పణం చేయడం వలన ఏడు తరాల పితృదేవతలకు ముక్తి లభించి వంశాభివృద్ధి జరుగుతుంది.", ta: "கோகர்ண க்ஷேத்திரம் ருத்ரபாத தீர்த்தமாகும். இங்கு பித்ரு தர்பணம் செய்வது 7 தலைமுறை பித்ருக்களுக்கு முக்தியும் வம்ச சுபிட்சமும் தரும்.", en: "Gokarna is the highly sacred Rudrapada Kshetra. Performing ancestral rites here guarantees liberation to 7 generations and bestows family prosperity." }, lang)}
            </div>"""

new_section_3_desc = """            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಪರಮ ಪವಿತ್ರ ರುದ್ರಪಾದ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಅಥವಾ ಪುಣ್ಯ ತೀರ್ಥಗಳಲ್ಲಿ ಪಿತೃ ಶ್ರಾದ್ಧ, ತರ್ಪಣ ಹಾಗೂ ತಿಲ ತರ್ಪಣ ಮಾಡುವುದರಿಂದ ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿ ದೊರೆತು, ಸಂತತಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ ಲಭಿಸುತ್ತದೆ.", hi: "परम पवित्र रुद्रपाद तीर्थों में अथवा पुण्य नदियों के तट पर पितृ तर्पण करने से सात पीढ़ियों के पितरों को सद्गति मिलती है तथा वंश समृद्धि प्राप्त होती है।", te: "పరమ పవిత్ర రుద్రపాద క్షేత్రాలలో లేదా పుణ్య తీర్థాలలో పితృ తర్పణం చేయడం వలన ఏడు తరాల పితృదేవతలకు ముక్తి లభించి వంశాభివృద్ధి జరుగుతుంది.", ta: "புனித ருத்ரபாத தீர்த்தங்களில் அல்லது புண்ணிய நதிக்கரைகளில் பித்ரு தர்பணம் செய்வது 7 தலைமுறை பித்ருக்களுக்கு முக்தியும் வம்ச சுபிட்சமும் தரும்.", en: "Performing ancestral rites and Tarpanam at sacred Rudrapada tirthas or pilgrimage sites guarantees liberation to 7 generations and bestows family prosperity." }, lang)}
            </div>"""

content = content.replace(old_section_3_desc, new_section_3_desc)

# 5. Update Section 4 (Prasada Preservation Title and Body)
old_section_4 = """          {/* Section 4: Gokarna Prasada Preservation */}
          <div
            style={{
              marginTop: 10,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 9,
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
              ✦ {pick({ kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸಾದ ರಕ್ಷಣೆ ಹಾಗೂ ವಿನಿಯೋಗ", hi: "गोकर्ण महाबलेश्वर प्रसाद उपयोग एवं संरक्षण", te: "గోకర్ణ మహాబలేశ్వర ప్రసాదం వినియోగం మరియు సంరక్షణ", ta: "கோகர்ண மகாபலேஸ்வர பிரசாத உபயோகம் & பாதுகாப்பு", en: "Gokarna Mahabaleshwara Sacred Prasada Preservation" }, lang)} ✦
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಲಭಿಸಿದ ಪವಿತ್ರ ವಿಭೂತಿ, ಕುಂಕುಮ ಹಾಗೂ ನಾಣ್ಯ ಪ್ರಸಾದವನ್ನು ಮನೆಯ ದೇವರ ಮನೆಯಲ್ಲಿ ಅಥವಾ ತಿಜೋರಿಯಲ್ಲಿ ಸ್ಥಾಪಿಸಿ. ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ತೆರಳುವಾಗ ವಿಭೂತಿ ಧರಿಸುವುದು ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಜಯ ನೀಡುತ್ತದೆ.", hi: "प्राप्त पवित्र विभूति, कुमकुम तथा प्रसाद सिक्के को पूजा घर अथवा तिजोरी में रखें। शुभ कार्य हेतु निकलते समय विभूति धारण करने से सर्व कार्यों में विजय मिलती है।", te: "లభించిన విభూతి, కుంకుమ మరియు ప్రసాద నాణేన్ని పూజాగదిలో ఉంచండి. శుభ కార్యాలకు వెళ్ళేటప్పుడు విభూతి ధరించడం వలన విజయం లభిస్తుంది.", ta: "பெற்ற விபூதி, குங்குமம் மற்றும் பிரசாத நாணயத்தை பூஜை அறையில் வைக்கவும். சுப காரியங்களுக்குச் செல்லும்போது விபூதி அணிவது வெற்றி தரும்.", en: "Store sacred Gokarna Vibhuti, Kumkuma, and blessed Prasada coin in your altar. Applying Vibhuti before journeys ensures divine protection and success." }, lang)}
            </div>
          </div>"""

new_section_4 = """          {/* Section 4: Sacred Prasada Preservation */}
          <div
            style={{
              marginTop: 10,
              backgroundColor: "#FFFFFF",
              border: `1.5px solid ${GOLD_LIGHT}`,
              borderRadius: 9,
              padding: "10px 14px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 700, color: GOLD, marginBottom: 3 }}>
              ✦ {pick({ kn: "ಪವಿತ್ರ ಪ್ರಸಾದ ರಕ್ಷಣೆ ಹಾಗೂ ವಿನಿಯೋಗ ಮಾರ್ಗದರ್ಶಿ", hi: "पवित्र प्रसाद उपयोग एवं संरक्षण मार्गदर्शिका", te: "పవిత్ర ప్రసాదం వినియోగం మరియు సంరక్షణ మార్గదర్శి", ta: "புனித பிரசாத உபயோகம் & பாதுகாப்பு வழிகாட்டி", en: "Sacred Prasada Preservation & Usage Guidelines" }, lang)} ✦
            </div>
            <div style={{ fontSize: 11.5, color: INK_SOFT, lineHeight: 1.8, letterSpacing: "normal" }}>
              {pick({ kn: "ಪೂಜೆಯಿಂದ ಲಭಿಸಿದ ಪವಿತ್ರ ಪ್ರಸಾದವನ್ನು ಮನೆಯ ದೇವರ ಕೋಣೆಯಲ್ಲಿ ಅಥವಾ ತಿಜೋರಿಯಲ್ಲಿ ಭಕ್ತಿಯಿಂದ ಇರಿಸಿ. ಶುಭ ಕಾರ್ಯಗಳಿಗೆ ಹೊರಡುವಾಗ ಪ್ರಸಾದವನ್ನು ಧರಿಸಿ ಪ್ರಾರ್ಥಿಸುವುದು ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ವಿಜಯ ಹಾಗೂ ದಿವ್ಯ ರಕ್ಷಣೆಯನ್ನು ನೀಡುತ್ತದೆ.", hi: "पूजा से प्राप्त पवित्र प्रसाद को घर के पूजा स्थल अथवा तिजोरी में श्रद्धापूर्वक रखें। शुभ कार्यों हेतु निकलते समय प्रसाद ग्रहण कर प्रार्थना करने से सर्व कार्यों में सफलता एवं दैवीय सुरक्षा प्राप्त होती है।", te: "పూజ నుండి లభించిన పవిత్ర ప్రసాదాన్ని ఇంటి పూజాగదిలో లేదా బీరువాలో భక్తితో ఉంచండి. శుభ కార్యాలకు వెళ్ళేటప్పుడు ప్రసాదాన్ని స్వీకరించి ప్రార్థించడం వలన సమస్త కార్యాలలో విజయం మరియు రక్షణ లభిస్తాయి.", ta: "பூஜையிலிருந்து பெற்ற புனித பிரசாதத்தை பூஜை அறையிலோ அல்லது பணப்பெட்டியிலோ பக்தியுடன் வைக்கவும். சுப காரியங்களுக்குச் செல்லும்போது பிரசாதத்தை அணிந்து பிரார்த்திப்பது வெற்றி தரும்.", en: "Reverently place the sacred blessed Prasada in your home altar or treasury. Accepting the Prasada with prayer before embarking on important endeavors ensures success, prosperity, and divine protection." }, lang)}
            </div>
          </div>"""

content = content.replace(old_section_4, new_section_4)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Page 4 wording successfully!")
