file_priests = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/features/seva/sevaPriestDirectory.ts"
with open(file_priests, "r", encoding="utf-8") as f:
    content_priests = f.read()

combined_vidhis = """,
  narayanabali_tripindi: {
    sevaId: "narayanabali_tripindi",
    steps: {
      kn: [
        "1. ಪವಿತ್ರ ತೀರ್ಥ ಸ್ನಾನ & ನಾರಾಯಣ ಬಲಿ ಮಹಾ ಸಂಕಲ್ಪ",
        "2. ಬ್ರಹ್ಮ, ವಿಷ್ಣು, ರುದ್ರ, ಯಮ, ಪ್ರೇತ ಕಲಶ ಸ್ಥಾಪನೆ & ಆರಾಧನೆ",
        "3. ಸಾತ್ವಿಕ, ರಾಜಸಿಕ, ತಾಮಸಿಕ ಮೂರು ವಿಧದ ತ್ರಿಪಿಂಡಿ ಪ್ರದಾನ",
        "4. ನಾರಾಯಣ ಪ್ರಸನ್ನತಾ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ಗೋಪ್ರದಾನ, ಬ್ರಾಹ್ಮಣ ಭೋಜನ & ಪಿತೃ ಮುಕ್ತಿ ಆಶೀರ್ವಾದ"
      ],
      en: [
        "1. Sacred Tirtha bath & Narayana Bali Maha Sankalpa",
        "2. Brahma, Vishnu, Rudra, Yama, Preta Kalasha consecration",
        "3. Triple Pinda offerings for Satvika, Rajasika, Tamasika ancestors",
        "4. Narayana Prasannata Maha Poornahuti",
        "5. Go-Danam, Brahmana Bhojanam & Ancestral liberation blessing"
      ],
      hi: [
        "1. पावन तीर्थ स्नान एवं नारायण बलि महा संकल्प",
        "2. ब्रह्मा, विष्णु, रुद्र, यम, प्रेत कलश स्थापना एवं पूजन",
        "3. सात्विक, राजसिक व तामसिक त्रिपिंडी प्रदान",
        "4. नारायण प्रसन्नता महा पूर्णाहुति",
        "5. गोदान, ब्राह्मण भोजन एवं पितृ मुक्ति आशीर्वाद"
      ],
      te: [
        "1. పవిత్ర తీర్థ స్నానం మరియు నారాయణ బలి మహా సంకల్పం",
        "2. బ్రహ్మ, విష్ణు, రుద్ర, యమ, ప్రేత కలశ స్థాపన మరియు పూజ",
        "3. సాత్విక, రాజసిక, తామసిక త్రిపిండి ప్రదానం",
        "4. నారాయణ ప్రసన్నతా మహా పూర్ణాహుతి",
        "5. గోదానం, బ్రాహ్మణ భోజనం మరియు పితృ ముక్తి ఆశీస్సులు"
      ],
      ta: [
        "1. புனித தீர்த்த நீராடலும் நாராயண பலி மகா சங்கல்பமும்",
        "2. பிரம்மா, விஷ்ணு, ருத்ர, யம, பிரேத கலச ஸ்தாபன பூஜை",
        "3. சாத்விக, ராஜஸ, தாமஸ திரிபிண்டி சமர்ப்பணம்",
        "4. நாராயண பிரசன்னதா மகா பூர்ணாஹுதி",
        "5. கோதானம், அன்னதானம் மற்றும் பித்ரு முக்தி ஆசீர்வாதம்"
      ]
    },
    auspiciousTime: {
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಏಕಾದಶಿ ಬೆಳಗ್ಗೆ 9:00",
      en: "Amavasya or Ekadashi Morning 9:00 AM",
      hi: "अमावस्या अथवा एकादशी प्रातः 9:00 बजे",
      te: "అమావాస్య లేదా ఏకాదశి ఉదయం 9:00 గంటలకు",
      ta: "அமாவாசை அல்லது ஏகாதசி காலை 9:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಅಕ್ಕಿ ಹಿಟ್ಟು, ದರ್ಭೆ, ಜವೆಗೋಧಿ, ಪಂಚರತ್ನ",
      en: "Black sesame, Pure Ghee, Rice flour, Darbha, Barley, Pancharatna",
      hi: "काले तिल, शुद्ध घी, चावल का आटा, कुशा, जौ, पंचरत्न",
      te: "నల్ల నువ్వులు, స్వచ్ఛమైన నెయ్యి, బియ్యపు పిండి, దర్భలు, యవలు, పంచరత్నాలు",
      ta: "கருப்பு எள், நெய், அரிசி மாவு, தர்பை புல், பார்லி, பஞ்சரத்னம்"
    },
    fruit: {
      kn: "ತ್ರಿವಿಧ ಪಿತೃ ದೋಷ ಮುಕ್ತಿ, ವಂಶಾಭಿವೃದ್ಧಿ, ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ",
      en: "Relief from 3-generation Pitru Dosha, progeny blessing & family abundance",
      hi: "त्रिविध पितृ दोष मुक्ति, वंश वृद्धि, संतान सुख एवं पारिवारिक समृद्धि",
      te: "త్రివిధ పితృ దోష విముక్తి, వంశాభివృద్ధి, సంతాన సౌభాగ్యం మరియు సమృద్ధి",
      ta: "பித்ரு தோஷ நிவர்த்தி, வம்ச விருத்தி, சந்தான பாக்கியம் மற்றும் குடும்ப சுபிட்சம்"
    }
  },

  narayanabali_pretoddhara: {
    sevaId: "narayanabali_pretoddhara",
    steps: {
      kn: [
        "1. ಪ್ರೇತ ಮೋಕ್ಷ ಪ್ರಾಯಶ್ಚಿತ್ತ ಸಂಕಲ್ಪ & ನಾರಾಯಣ ಪೂಜೆ",
        "2. ಷೋಡಶ ಶ್ರಾದ್ಧ & ಅಪಮೃತ್ಯು ನಿವಾರಕ ಹೋಮ",
        "3. ವಿಷ್ಣು ಪಾದೋದಕ ತರ್ಪಣ & ಪ್ರೇತೋದ್ಧಾರ ಪಿಂಡ ಪ್ರದಾನ",
        "4. ಮುಕ್ತಿ ದಾಯಕ ಮಹಾ ಪೂರ್ಣಾಹುತಿ",
        "5. ತೀರ್ಥ ಪ್ರೋಕ್ಷಣೆ, ದೀಪ ದಾನ & ರಕ್ಷಾ ಕವಚ ಮಂತ್ರಾಕ್ಷತೆ"
      ],
      en: [
        "1. Preta Moksha expiation Sankalpa & Lord Narayana Puja",
        "2. Shodasha Shraddha & Apamrityu Nivaran Homa",
        "3. Vishnu Padodaka Tarpanam & Pretoddhara Pinda offerings",
        "4. Mukti Dayaka Maha Poornahuti",
        "5. Holy water sprinkling, Deepa Danam & Protective Mantrakshate"
      ],
      hi: [
        "1. प्रेत मोक्ष प्रायश्चित्त संकल्प एवं नारायण पूजन",
        "2. षोडश श्राद्ध एवं अपमृत्यु निवारक हवन",
        "3. विष्णु पादोदक तर्पण एवं प्रेतोद्धार पिंड दान",
        "4. मुक्तिदायक महा पूर्णाहुति",
        "5. तीर्थ मार्जन, दीप दान एवं रक्षा कवच मंत्राक्षत"
      ],
      te: [
        "1. ప్రేత మోక్ష ప్రాయశ్చిత్త సంకల్పం మరియు నారాయణ పూజ",
        "2. షోడశ శ్రాద్ధం మరియు అపమృత్యు నివారక హోమం",
        "3. విష్ణు పాదోదక తర్పణం మరియు ప్రేతోద్ధార పిండ ప్రదానం",
        "4. ముక్తిదాయక మహా పూర్ణాహుతి",
        "5. తీర్థ ప్రోక్షణ, దీప దానం మరియు రక్షా మంత్రాక్షతలు"
      ],
      ta: [
        "1. பிரேத மோட்ச சங்கல்பமும் நாராயண பூஜையும்",
        "2. சோடச சிரார்த்தமும் துர்மரண நிவாரண ஹோமமும்",
        "3. விஷ்ணு பாத தீர்த்த தர்பணமும் பிரேதோத்தார பிண்ட தானமும்",
        "4. முக்தி தாயக மகா பூர்ணாஹுதி",
        "5. புனித தீர்த்த தெளிப்பு, தீப தானம் மற்றும் ரக்ஷா மந்திராட்சதை"
      ]
    },
    auspiciousTime: {
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಪುಣ್ಯ ತಿಥಿ ಮಧ್ಯಾಹ್ನ 11:00",
      en: "Amavasya or Sacred Punya Tithi 11:00 AM",
      hi: "अमावस्या अथवा पुण्य तिथि दोपहर 11:00 बजे",
      te: "అమావాస్య లేదా పుణ్య తిథి ఉదయం 11:00 గంటలకు",
      ta: "அமாவாசை அல்லது புண்ணிய திதி நண்பகல் 11:00 மணிக்கு"
    },
    requiredItems: {
      kn: "ಕಪ್ಪು ಎಳ್ಳು, ತುಪ್ಪ, ಪಂಚಗವ್ಯ, ದರ್ಭೆ, ನಾರಾಯಣ ಪ್ರತಿಮೆ, ದೀಪ",
      en: "Black sesame, Ghee, Panchagavya, Darbha, Narayana idol, Deepa",
      hi: "काले तिल, घी, पंचगव्य, कुशा, नारायण प्रतिमा, दीप",
      te: "నల్ల నువ్వులు, నెయ్యి, పంచగవ్యాలు, దర్భలు, నారాయణ విగ్రహం, దీపం",
      ta: "கருப்பு எள், நெய், பஞ்சகவ்யம், தர்பை, நாராயணர் விக்கிரகம், தீபம்"
    },
    fruit: {
      kn: "ಪ್ರೇತತ್ವ ಮುಕ್ತಿ, ಆಕಸ್ಮಿಕ ಭಯ-ದುಃಸ್ವಪ್ನ ನಿವಾರಣೆ ಹಾಗೂ ವಂಶಕ್ಕೆ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಣೆ",
      en: "Moksha for departed souls, eradication of fear/nightmares & family protection",
      hi: "प्रेतत्व से मुक्ति, भय व बुरे स्वप्नों का निवारण तथा परिवार की दैवीय रक्षा",
      te: "ప్రేతత్వ విముక్తి, భయాల నివారణ మరియు కుటుంబానికి అఖండ దివ్య రక్షణ",
      ta: "பிரேத தோஷ நிவர்த்தி, பயமின்மை மற்றும் குடும்பத்திற்கு தெய்வீக பாதுகாப்பு"
    }
  }"""

# Insert right after narayanabali entry in HARDCODED_POOJA_VIDHI_TABLE
target_after_narayanabali_vidhi = """    fruit: {
      kn: "ಕುಟುಂಬದ ವಂಶಾವಳಿಯ ಅಶಾಂತಿ ಶಮನ, ಪಿತೃ ಮುಕ್ತಿ",
      en: "Settles ancestral unrest in the family line, brings peace",
      hi: "वंश में पितरों की अशांति शांत होती है, सद्गति मिलती है",
      te: "వంశంలో పితరుల అశాంతి శమిస్తుంది, శాంతి కలుగుతుంది",
      ta: "குடும்ப வம்சத்தில் முன்னோர்களின் அமைதியின்மை தணியும், அமைதி உண்டாகும்"
    }
  },"""

if "narayanabali_tripindi:" not in content_priests:
    content_priests = content_priests.replace(target_after_narayanabali_vidhi, target_after_narayanabali_vidhi + combined_vidhis, 1)

with open(file_priests, "w", encoding="utf-8") as f:
    f.write(content_priests)

print("Updated sevaPriestDirectory.ts with combined Narayana Bali vidhi details!")
