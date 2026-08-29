file_templates = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/components/seva/pdf/SevaPrintTemplates.tsx"
with open(file_templates, "r", encoding="utf-8") as f:
    content = f.read()

old_pitru_block = """    if (isPitru) {
      return {
        whatIsPooja: pick({
          kn: "ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ನಾರಾಯಣ ಬಲಿ ಸೇವೆಯು ಅಗಲಿದ ಪೂರ್ವಜರಿಗೆ ಮುಕ್ತಿ ನೀಡಿ ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ ಪಡೆಯುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಸಂಸ್ಕಾರವಾಗಿದೆ.",
          hi: "पितृ तर्पण एवं नारायण बलि सेवा पूर्वजों को सद्गति प्रदान करने तथा पितरों का दिव्य आशीर्वाद पाने का श्रेष्ठ वैदिक संस्कार है।",
          te: "పితృ తర్పణం మరియు నారాయణ బలి సేవ పితృదేవతలకు సద్గతిని చేకూర్చి వారి ఆశీస్సులు పొందే ఉత్తమ వైదిక సంస్కారం.",
          ta: "பித்ரு தர்பணம் மற்றும் நாராயண பலி முன்னோர்களுக்கு முக்தி அளித்து அவர்களின் ஆசியை பெறும் வைதீக சடங்காகும்.",
          en: "Pitru Tarpanam & Narayana Bali is a sacred ancestral offering ensuring peace for departed souls and invoking lineage blessings."
        }, lang),
        whyDoPooja: pick({
          kn: "ಪಿತೃ ದೋಷ, ಸಂತಾನ ವಿಳಂಬ, ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಹಾಗೂ ಪೂರ್ವಜರ ಋಣದಿಂದ ಮುಕ್ತಿ ಹೊಂದಲು ಈ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "पितृ दोष, संतान बाधा, पारिवारिक अशांति तथा पूर्वजों के ऋणों से मुक्ति पाने हेतु यह सेवा की जाती है।",
          te: "పితృ దోషం, సంతాన లేమి, కుటుంబ అశాంతి మరియు పూర్వీకుల ఋణం తీర్చుకోవడానికి నిర్వహిస్తారు.",
          ta: "பித்ரு தோஷம், சந்தான தாமதம், குடும்ப அமைதியின்மை நீங்க இந்த பரிகார பூஜை செய்யப்படுகிறது.",
          en: "Essential for removing ancestral curses, resolving delays in progeny and marriage, and restoring family harmony."
        }, lang),
        benefitsPooja: pick({
          kn: "ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ವೃದ್ಧಿ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "सात पीढ़ियों के पितरों को मुक्ति मिलती है, वंश वृद्धि, पारिवारिक सुख और कार्यों में सफलता प्राप्त होती है।",
          te: "ఏడు తరాల పితృదేవతలకు ముక్తి కలిగి, వంశాభివృద్ధి, కుటుంబ ప్రశాంతత చేకూరుతాయి.",
          ta: "7 தலைமுறை முன்னோர்களுக்கு முக்தி கிட்டும், வம்ச சுபிட்சம் மற்றும் சகல காரிய சித்தி உண்டாகும்.",
          en: "Guarantees liberation for 7 generations of ancestors, prospers descendants, and opens stalled family avenues."
        }, lang)
      };
    }"""

new_narayana_blocks = """    const isNarayanaBaliTripindi = (sLower.includes("narayana") || sLower.includes("bali") || sevaTitle.includes("ನಾರಾಯಣ") || sevaTitle.includes("नारायण") || sevaTitle.includes("నారాయణ")) && (sLower.includes("tripindi") || sevaTitle.includes("ತ್ರಿಪಿಂಡಿ") || sevaTitle.includes("त्रिपिंडी") || sevaTitle.includes("త్రిపిండి"));
    const isNarayanaBaliPretoddhara = (sLower.includes("narayana") || sLower.includes("bali") || sevaTitle.includes("ನಾರಾಯಣ") || sevaTitle.includes("नारायण") || sevaTitle.includes("నారాయణ")) && (sLower.includes("pret") || sevaTitle.includes("ಪ್ರೇತ") || sevaTitle.includes("प्रेत") || sevaTitle.includes("ప్రేత"));
    const isNarayanaBaliStandalone = (sLower.includes("narayana") || sevaTitle.includes("ನಾರಾಯಣ") || sevaTitle.includes("नारायण") || sevaTitle.includes("నారాయణ")) && (sLower.includes("bali") || sevaTitle.includes("ಬಲಿ") || sevaTitle.includes("बलि") || sevaTitle.includes("బలి")) && !isNarayanaBaliTripindi && !isNarayanaBaliPretoddhara;

    if (isNarayanaBaliTripindi) {
      return {
        whatIsPooja: pick({
          kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧವು ಗೋಕರ್ಣದ ಪವಿತ್ರ ಕೋಟಿ ತೀರ್ಥದಲ್ಲಿ ನೆರವೇರಿಸಲಾಗುವ ಅತ್ಯುನ್ನತ ಪಿತೃ ಮುಕ್ತಿ ಮಹಾಯಾಗವಾಗಿದೆ. ಭಗವಾನ್ ಶ್ರೀಮನ್ನಾರಾಯಣನ ಸಾನ್ನಿಧ್ಯದಲ್ಲಿ ನಾರಾಯಣ ಬಲಿ ಸಂಕಲ್ಪ ನೆರವೇರಿಸಿ, ಸಾತ್ವಿಕ, ರಾಜಸಿಕ ಹಾಗೂ ತಾಮಸಿಕ ಮೂರು ವಿಧದ ಪೂರ್ವಜರಿಗೆ ತ್ರಿಪಿಂಡಿ ಪ್ರದಾನ ಮಾಡಿ ಪೂಜಿಸಲಾಗುತ್ತದೆ.",
          hi: "नारायण बलि एवं त्रिपिंडी श्राद्ध गोकर्ण के पवित्र कोटि तीर्थ पर संपन्न होने वाला सर्वोच्च पितृ मुक्ति महायज्ञ है। भगवान लक्ष्मीनारायण की सन्निधि में संकल्प कर सात्विक, राजसिक व तामसिक तीनों प्रकार के पूर्वजों को त्रिपिंडी प्रदान की जाती है।",
          te: "నారాయణ బలి మరియు త్రిపిండి శ్రాద్ధం గోకర్ణ పవిత్ర కోటి తీర్థంలో నిర్వహించే అత్యున్నత పితృ ముక్తి మహాయజ్ఞం. శ్రీమన్నారాయణుని సన్నిధిలో సాత్విక, రాజసిక, తామసిక మూడు తరాల పితరులకు పిండ ప్రదానం చేస్తారు.",
          ta: "நாராயண பலி மற்றும் திரிபிண்டி சிரார்த்தம் கோகர்ண கோடி தீர்த்தத்தில் செய்யப்படும் மிக உன்னதமான பித்ரு முக்தி யாகமாகும். சாத்விக, ராஜஸ, தாமஸ மூன்று வகை முன்னோர்களுக்கும் பிண்ட சமர்ப்பணம் செய்யப்படுகிறது.",
          en: "Narayana Bali & Tripindi Shraddha is an exalted Vedic ancestral liberation sacrifice performed at sacred Koti Teertha, Gokarna, offering Pinda libations to all three categories of departed souls under Lord Narayana's grace."
        }, lang),
        whyDoPooja: pick({
          kn: "ವಂಶದಲ್ಲಿ ಮೂರು ತಲೆಮಾರುಗಳಿಂದ ಶ್ರಾದ್ಧ ತರ್ಪಣಗಳು ನಡೆಯದಿದ್ದಾಗ, ತೀವ್ರ ಪಿತೃ ದೋಷ, ಸಂತಾನ ವಿಳಂಬ, ವಿವಾಹ ಅಡೆತಡೆ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಶಾಂತಿಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಿಸಲು ಈ ಮಹಾಸೇವೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "वंश में तीन पीढ़ियों से श्राद्ध न होने, गंभीर पितृ दोष, संतान प्राप्ति में विलंब, विवाह में रुकावट तथा पारिवारिक अशांति के स्थायी निवारण हेतु यह सेवा की जाती है।",
          te: "వంశంలో మూడు తరాలుగా శ్రాద్ధ తర్పణాలు జరగనప్పుడు, తీవ్ర పితృ దోషం, సంతాన లేమి, వివాహ జాప్యం మరియు కుటుంబ అశాంతి నివారణకు చేస్తారు.",
          ta: "வம்சத்தில் 3 தலைமுறையாக சிராத்தம் செய்யப்படாத தோஷம், பித்ரு சாபம், திருமண மற்றும் சந்தான தடைகளை நிரந்தரமாக போக்க செய்யப்படுகிறது.",
          en: "Performed to resolve three-generation ancestral debts, clear severe Pitru Dosha, eliminate chronic delays in marriage and progeny, and restore auspiciousness in the family."
        }, lang),
        benefitsPooja: pick({
          kn: "ಮೂರು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಪರಿಪೂರ್ಣ ಮುಕ್ತಿ ದೊರೆತು, ಪಿತೃದೇವತೆಗಳ ದಿವ್ಯ ಆಶೀರ್ವಾದ, ವಂಶಾಭಿವೃದ್ಧಿ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸಕಲ ಧನ-ಸಮೃದ್ಧಿ ನೆಲೆಸುತ್ತದೆ.",
          hi: "तीन पीढ़ियों के पितरों को परम सद्गति मिलती है, उनका दिव्य आशीर्वाद, वंश वृद्धि, संतान सुख तथा परिवार में अखंड सुख-समृद्धि की प्राप्ति होती है।",
          te: "మూడు తరాల పితృదేవతలకు మోక్షం లభించి, వారి దివ్య ఆశీస్సులు, వంశాభివృద్ధి, సంతాన సౌభాగ్యం మరియు ఐశ్వర్యవృద్ధి కలుగుతాయి.",
          ta: "முன்னோர்களுக்கு பூரண மோட்சம் கிடைத்து, அவர்களின் ஆசி, வம்ச விருத்தி, சந்தான பாக்கியம் மற்றும் சகல செல்வ வளங்களும் உண்டாகும்.",
          en: "Grants complete liberation to ancestors across 3 generations, bestows radiant progeny, ensures domestic harmony, and opens doors to enduring prosperity."
        }, lang)
      };
    }

    if (isNarayanaBaliPretoddhara) {
      return {
        whatIsPooja: pick({
          kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರ ಶ್ರಾದ್ಧವು ಅಕಾಲ ಮರಣ, ಅಪಮೃತ್ಯು ಅಥವಾ ಅತೃಪ್ತಿಯಿಂದ ಸಂಕಷ್ಟಕ್ಕೀಡಾದ ಆತ್ಮಗಳ ಮುಕ್ತಿಗಾಗಿ ಭಗವಾನ್ ವಿಷ್ಣುವಿನ ಮಂತ್ರಗಳಿಂದ ನೆರವೇರಿಸಲಾಗುವ ಶ್ರೇಷ್ಠ ಪ್ರಾಯಶ್ಚಿತ್ತ ವೈದಿಕ ಶಾಂತಿಯಾಗಿದೆ.",
          hi: "नारायण बलि एवं प्रेतोद्धार शांति अकाल मृत्यु, अपमृत्यु अथवा अतृप्त आत्माओं की सद्गति व मोक्ष हेतु भगवान श्रीहरि विष्णु के पावन मंत्रों द्वारा संपन्न विशेष वैदिक अनुष्ठान है।",
          te: "నారాయణ బలి మరియు ప్రేతోద్ధార శాంతి అకాల మరణం, అపమృత్యువు లేదా అతృప్త ఆత్మల మోక్షం కొరకు శ్రీ మహావిష్ణువు మంత్రాలతో నిర్వహించే శ్రేష్ఠమైన ప్రాయశ్చిత్త వైదిక పూజ.",
          ta: "நாராயண பலி மற்றும் பிரேதோத்தார சாந்தி துர்மரணம், விபத்து அல்லது அதிருப்தி அடைந்த ஆன்மாக்களுக்கு நற்கதி அளிக்க மகாவிஷ்ணுவின் அருளால் செய்யப்படும் புனித சாந்தியாகும்.",
          en: "Narayana Bali & Pretoddhara Shanti is an authentic Vedic propitiation ritual invoking Lord Vishnu's transcendental mercy for souls who met with untimely or distressed demise."
        }, lang),
        whyDoPooja: pick({
          kn: "ಅಕಾಲಿಕ ಸಾವು, ದುರ್ಮರಣ, ಪ್ರೇತ ಬಾಧೆ, ನಿರಂತರ ದುಃಸ್ವಪ್ನಗಳು, ಆಕಸ್ಮಿಕ ಸಂಕಷ್ಟಗಳು ಹಾಗೂ ಮನೆಯಲ್ಲಿ ಉಂಟಾಗುವ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಸಂಪೂರ್ಣ ಶಾಂತಿಗಾಗಿ ಈ ಪೂಜೆಯನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
          hi: "अकाल मृत्यु, प्रेत बाधा, बार-बार आने वाले बुरे स्वप्न, आकस्मिक संकट तथा घर में व्याप्त नकारात्मक शक्तियों के पूर्ण शमन हेतु यह पूजन किया जाता है।",
          te: "అకాల మరణాలు, ప్రేత బాధలు, దుఃస్వప్నాలు, ఆకస్మిక ఆపదలు మరియు ఇంట్లోని ప్రతికూల శక్తుల శాంతి కొరకు ఈ సేవ నిర్వహిస్తారు.",
          ta: "அகால மரணம், பிரேத தோஷம், பயங்கர கனவுகள், திடீர் விபத்துக்கள் மற்றும் இல்லத்தில் நிலவும் எதிர்மறை ஆற்றல்களை நீக்க செய்யப்படுகிறது.",
          en: "Crucial for liberating distressed departed souls from the intermediate astral plane, curing recurrent nightmares/fear, and dispelling negative household energies."
        }, lang),
        benefitsPooja: pick({
          kn: "ಅತೃಪ್ತ ಆತ್ಮಗಳಿಗೆ ಪ್ರೇತತ್ವದಿಂದ ಮುಕ್ತಿ ಹಾಗೂ ಮೋಕ್ಷ ಪ್ರಾಪ್ತಿಯಾಗಿ, ಕುಟುಂಬಕ್ಕೆ ಅಭಯ ರಕ್ಷಣಾ ಕವಚ, ಮಾನಸಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ವಂಶದ ಸಕಲ ಶುಭ-ಕಾರ್ಯಗಳಿಗೆ ಮುನ್ನಡೆ ಲಭಿಸುತ್ತದೆ.",
          hi: "अतृप्त आत्माओं को प्रेतत्व से मुक्ति व मोक्ष मिलता है, परिवार को दैवीय सुरक्षा कवच, मानसिक शांति तथा सभी शुभ कार्यों में सफलता प्राप्त होती है।",
          te: "అతృప్త ఆత్మలకు ప్రేతత్వ విముక్తి మరియు మోక్షం లభిస్తాయి, కుటుంబానికి దివ్య రక్షణ, మనశ్శాంతి మరియు శుభకార్యాలు నిరాటంకంగా జరుగుతాయి.",
          ta: "ஆன்மாக்களுக்கு பிரேதத் தன்மையிலிருந்து விடுதலை மற்றும் மோட்சம் கிட்டும், குடும்பத்திற்கு பாதுகாப்பு, மன அமைதி மற்றும் சுப காரிய வெற்றி உண்டாகும்.",
          en: "Frees departed souls into the spiritual realm of Sri Vaikuntha, provides an impenetrable protective shield to family members, and establishes deep tranquility."
        }, lang)
      };
    }

    if (isNarayanaBaliStandalone) {
      return {
        whatIsPooja: pick({
          kn: "ನಾರಾಯಣ ಬಲಿ ಸೇವೆಯು ಭಗವಾನ್ ಶ್ರೀಮನ್ನಾರಾಯಣನ ಅನಂತ ಕೃಪೆಯಿಂದ ಪಿತೃಗಳಿಗೆ ಸದ್ಗತಿ ಹಾಗೂ ವಿಷ್ಣುಲೋಕ ಪ್ರಾಪ್ತಿಯನ್ನು ಕರುಣಿಸುವ ಅತ್ಯಂತ ಶಕ್ತಿಶಾಲಿ ವೈದಿಕ ಪಿತೃ ಮುಕ್ತಿ ಯಜ್ಞವಾಗಿದೆ.",
          hi: "नारायण बलि सेवा भगवान लक्ष्मीनारायण की अनंत कृपा से पितरों को सद्गति एवं विष्णुलोक की प्राप्ति कराने वाला अत्यंत शक्तिशाली वैदिक मुक्ति यज्ञ है।",
          te: "నారాయణ బలి సేవ శ్రీమన్నారాయణుని అనంత కృపతో పితరులకు సద్గతిని, విష్ణులోక ప్రాప్తిని కలిగించే అత్యంత శక్తివంతమైన వైదిక యజ్ఞం.",
          ta: "நாராயண பலி சேவை மகாவிஷ்ணுவின் பேரருளால் முன்னோர்களுக்கு நற்கதியும் விஷ்ணுலோக பதவியும் அளிக்கும் மகா முக்தி யாகமாகும்.",
          en: "Narayana Bali is a supreme Vedic sacrifice performed under the divine grace of Lord Narayana to elevate ancestors into the eternal abode of Sri Maha Vishnu."
        }, lang),
        whyDoPooja: pick({
          kn: "ಪಿತೃ ದೋಷ, ಪೂರ್ವಜರ ಅತೃಪ್ತಿ, ಅಪಮೃತ್ಯು ದೋಷ ಹಾಗೂ ವಂಶದಲ್ಲಿ ಎದುರಾಗುವ ನಿರಂತರ ಆರ್ಥಿಕ-ಮಾನಸಿಕ ಸಂಕಷ್ಟಗಳ ಶಾಂತಿಗಾಗಿ ಈ ಪೂಜೆ ಮಾಡಲಾಗುತ್ತದೆ.",
          hi: "पितृ दोष, पूर्वजों की अतृप्ति, अपमृत्यु दोष तथा परिवार में आने वाली निरंतर आर्थिक व मानसिक बाधाओं की शांति हेतु किया जाता है।",
          te: "పితృ దోషం, పూర్వీకుల అసంతృప్తి, అపమృత్యు దోషం మరియు కుటుంబంలో నిరంతర ఆటంకాల నివారణకు చేస్తారు.",
          ta: "பித்ரு தோஷம், முன்னோர் அதிருப்தி, அபமிருத்யு தோஷம் மற்றும் குடும்ப கஷ்டங்களை தீர்க்க செய்யப்படுகிறது.",
          en: "Performed to dissolve severe Pitru Doshas, rectify improper obsequies, and clear deep-rooted karmic and financial obstructions."
        }, lang),
        benefitsPooja: pick({
          kn: "ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ಲಭಿಸಿ, ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದದಿಂದ ಸಂತಾನ ಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಏಳಿಗೆ ಹಾಗೂ ಸಕಲ ಕಾರ್ಯಗಳಲ್ಲಿ ಯಶಸ್ಸು ಸಿದ್ಧಿಸುತ್ತದೆ.",
          hi: "सात पीढ़ियों के पितरों को सद्गति मिलती है, उनके दिव्य आशीर्वाद से संतान सुख, पारिवारिक उन्नति तथा सर्व कार्यों में विजय प्राप्त होती है।",
          te: "ఏడు తరాల పితరులకు ముక్తి కలిగి, వారి దివ్య ఆశీస్సులతో సంతాన భాగ్యం, కుటుంబ పురోగతి మరియు సర్వకార్యసిద్ధి లభిస్తాయి.",
          ta: "7 தலைமுறை முன்னோர்களுக்கு முக்தி கிட்டும், அவர்களின் ஆசியால் சந்தான பாக்கியம், குடும்ப மேன்மை மற்றும் காரிய வெற்றி உண்டாகும்.",
          en: "Elevates seven generations of ancestors to spiritual liberation, bestowing progeny, domestic harmony, longevity, and overall fortune."
        }, lang)
      };
    }

    if (isPitru) {
      return {
        whatIsPooja: pick({
          kn: "ಪಿತೃ ತರ್ಪಣ ಹಾಗೂ ಶ್ರಾದ್ಧ ಸೇವೆಯು ಅಗಲಿದ ಪೂರ್ವಜರಿಗೆ ಮುಕ್ತಿ ನೀಡಿ ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ ಪಡೆಯುವ ಶ್ರೇಷ್ಠ ವೈದಿಕ ಸಂಸ್ಕಾರವಾಗಿದೆ.",
          hi: "पितृ तर्पण एवं श्राद्ध सेवा पूर्वजों को सद्गति प्रदान करने तथा पितरों का दिव्य आशीर्वाद पाने का श्रेष्ठ वैदिक संस्कार है।",
          te: "పితృ తర్పణం మరియు శ్రాద్ధ సేవ పితృదేవతలకు సద్గతిని చేకూర్చి వారి ఆశీస్సులు పొందే ఉత్తమ వైదిక సంస్కారం.",
          ta: "பித்ரு தர்பணம் மற்றும் சிரார்த்த சேவை முன்னோர்களுக்கு முக்தி அளித்து அவர்களின் ஆசியை பெறும் வைதீக சடங்காகும்.",
          en: "Pitru Tarpanam & Shraddha is a sacred ancestral offering ensuring peace for departed souls and invoking lineage blessings."
        }, lang),
        whyDoPooja: pick({
          kn: "ಪಿತೃ ದೋಷ, ಸಂತಾನ ವಿಳಂಬ, ಕೌಟುಂಬಿಕ ಅಶಾಂತಿ ಹಾಗೂ ಪೂರ್ವಜರ ಋಣದಿಂದ ಮುಕ್ತಿ ಹೊಂದಲು ಈ ಪೂಜೆಯನ್ನು ನೆರವೇರಿಸಲಾಗುತ್ತದೆ.",
          hi: "पितृ दोष, संतान बाधा, पारिवारिक अशांति तथा पूर्वजों के ऋणों से मुक्ति पाने हेतु यह सेवा की जाती है।",
          te: "పితృ దోషం, సంతాన లేమి, కుటుంబ అశాంతి మరియు పూర్వీకుల ఋణం తీర్చుకోవడానికి నిర్వహిస్తారు.",
          ta: "பித்ரு தோஷம், சந்தான தாமதம், குடும்ப அமைதியின்மை நீங்க இந்த பரிகார பூஜை செய்யப்படுகிறது.",
          en: "Essential for removing ancestral curses, resolving delays in progeny and marriage, and restoring family harmony."
        }, lang),
        benefitsPooja: pick({
          kn: "ಏಳು ತಲೆಮಾರಿನ ಪಿತೃಗಳಿಗೆ ಮುಕ್ತಿ ದೊರೆತು, ಸಂತತಿ ವೃದ್ಧಿ, ಕೌಟುಂಬಿಕ ನೆಮ್ಮದಿ ಹಾಗೂ ಸಮಸ್ತ ಕಾರ್ಯಗಳಲ್ಲಿ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
          hi: "सात पीढ़ियों के पितरों को मुक्ति मिलती है, वंश वृद्धि, पारिवारिक सुख और कार्यों में सफलता प्राप्त होती है।",
          te: "ఏడు తరాల పితృదేవతలకు ముక్తి కలిగి, వంశాభివృద్ధి, కుటుంబ ప్రశాంతత చేకూరుతాయి.",
          ta: "7 தலைமுறை முன்னோர்களுக்கு முக்தி கிட்டும், வம்ச சுபிட்சம் மற்றும் சகல காரிய சித்தி உண்டாகும்.",
          en: "Guarantees liberation for 7 generations of ancestors, prospers descendants, and opens stalled family avenues."
        }, lang)
      };
    }"""

content = content.replace(old_pitru_block, new_narayana_blocks)

with open(file_templates, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated SevaPrintTemplates.tsx with Narayana Bali combinations!")
