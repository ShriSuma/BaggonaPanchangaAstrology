/**
 * Classical Vedic Muka Samudrika Shastra & Metoposcopy Knowledge Repository.
 * 
 * Sourced directly from:
 * 1. Brihat Samhita (Varahamihira, 6th Century CE) - Chapters 68 (Purusha Lakshana) & 70 (Kanya/Stri Lakshana)
 * 2. Garuda Purana - Samudrika Shastra Adhyaya (Bodily & Facial Measurements in Angulas)
 * 3. Bhavishya Purana - Muka, Danta, Karna & Tilaka Shastra
 * 4. Skanda Purana & Vishnudharmottara Purana (Iconometry & Nava-Tala Golden Ratio)
 */

export const VEDIC_ANGULA_PROPORTIONS = {
  totalFaceHeight: 12, // 12 Angulas = 1 Mukha (Standard Vedic Tala)
  upperZone: 4, // Hairline to Eyebrows (Lalata)
  middleZone: 4, // Eyebrows to Base of Nose (Nasika & Netra)
  lowerZone: 4, // Base of Nose to Bottom of Chin (Chibuka & Oshtha)
  eyeLength: 2, // 2 Angulas
  interEyebrowSpace: 2, // 2 Angulas separation for auspicious Dhanura Bhrulata
  philtrumWidth: 0.5, // 0.5 Angula (Half digit)
  earHeight: 4 // Matches Nose bridge height
};

export const VEDIC_PANCHA_MAHABHUTA_FACES = {
  agni: {
    nameKn: "ಅಗ್ನಿ ತತ್ತ್ವ ಮುಖ (Fire Archetype - Triangular / Angular)",
    nameEn: "Agni Face (Fire Archetype - Sharp & Dynamic)",
    traitsKn: "ತೀಕ್ಷ್ಣ ಕಣ್ಣುಗಳು, ಚೂಪಾದ ಗಡ್ಡ, ಅದ್ಭುತ ನಾಯಕತ್ವ, ಧೈರ್ಯ ಹಾಗೂ ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಸಾಮರ್ಥ್ಯ.",
    traitsEn: "Penetrating gaze, sharp chin, visionary leadership, courageous initiative and rapid execution.",
    name: {
      kn: "ಅಗ್ನಿ ತತ್ತ್ವ ಮುಖ (ತ್ರಿಕೋನಾಕಾರ)",
      en: "Agni Face (Fire Archetype - Triangular)",
      hi: "अग्नि तत्त्व मुख (त्रिकोणीय)",
      te: "అగ్ని తత్త్వ ముఖం (త్రికోణాకారం)",
      ta: "அக்னி தத்துவ முகம் (முக்கோணம்)"
    },
    traits: {
      kn: "ತೀಕ್ಷ್ಣ ಕಣ್ಣುಗಳು, ಚೂಪಾದ ಗಡ್ಡ, ಅದ್ಭುತ ನಾಯಕತ್ವ, ಧೈರ್ಯ ಹಾಗೂ ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಸಾಮರ್ಥ್ಯ.",
      en: "Penetrating gaze, sharp chin, visionary leadership, courageous initiative and rapid execution.",
      hi: "तीक्ष्ण दृष्टि, दृढ़ ठोड़ी, अदम्य नेतृत्व, साहस एवं त्वरित निर्णय शक्ति।",
      te: "తీక్షణ దృష్టి, దృఢమైన గడ్డం, నాయకత్వ పటిమ, ధైర్యం & త్వరిత నిర్ణయాలు.",
      ta: "தீர்க்கமான பார்வை, கூர்மையான தாடை, தலைமைப் பண்பு & விரைவான முடிவெடுக்கும் திறன்."
    }
  },
  prithvi: {
    nameKn: "ಪೃಥ್ವಿ ತತ್ತ್ವ ಮುಖ (Earth Archetype - Square / Solid Jaw)",
    nameEn: "Prithvi Face (Earth Archetype - Grounded & Resilient)",
    traitsKn: "ದೃಢ ದವಡೆ, ವಿಶಾಲ ಮುಖ, ಸಹನೆ, ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ ಯೋಗ ಹಾಗೂ ನಿಷ್ಠಾವಂತ ವ್ಯಕ್ತಿತ್ವ.",
    traitsEn: "Firm jawline, broad structure, great patience, land asset accumulation and dependable loyalty.",
    name: {
      kn: "ಪೃಥ್ವಿ ತತ್ತ್ವ ಮುಖ (ಚೌಕಾಕಾರ)",
      en: "Prithvi Face (Earth Archetype - Square Jaw)",
      hi: "पृथ्वी तत्त्व मुख (वर्गाकार)",
      te: "పృథ్వీ తత్త్వ ముఖం (చతురస్రాకారం)",
      ta: "பிருத்வி தத்துவ முகம் (சதுர வடிவம்)"
    },
    traits: {
      kn: "ದೃಢ ದವಡೆ, ವಿಶಾಲ ಮುಖ, ಸಹನೆ, ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ ಯೋಗ ಹಾಗೂ ನಿಷ್ಠಾವಂತ ವ್ಯಕ್ತಿತ್ವ.",
      en: "Firm jawline, broad structure, great patience, land asset accumulation and dependable loyalty.",
      hi: "सुदृढ़ जबड़ा, धैर्य, अचल संपत्ति निर्माण योग एवं निष्ठावान व्यक्तित्व।",
      te: "దృఢమైన దవడ, సహనం, స్థిరాస్తి అభివృద్ధి యోగం & స్థిరమైన మనస్తత్వం.",
      ta: "உறுதியான தாடை, பொறுமை, நில சொத்து யோகம் & விசுவாசமான ஆளுமை."
    }
  },
  jala: {
    nameKn: "ಜಲ ತತ್ತ್ವ ಮುಖ (Water Archetype - Round / Soft Oval)",
    nameEn: "Jala Face (Water Archetype - Empathetic & Fluid)",
    traitsKn: "ಸುಂದರ ನೇತ್ರಗಳು, ಮೃದುವಾದ ಕೆನ್ನೆಗಳು, ಕಲಾತ್ಮಕ ಆಸಕ್ತಿ, ಕರುಣೆ ಹಾಗೂ ಪ್ರೇಮಮಯ ಸ್ವಭಾವ.",
    traitsEn: "Lustrous eyes, gentle contours, deep artistic appreciation, empathy and romantic warmth.",
    name: {
      kn: "ಜಲ ತತ್ತ್ವ ಮುಖ (ವರ್ತುಲಾಕಾರ / ಕಮಲ)",
      en: "Jala Face (Water Archetype - Round / Oval)",
      hi: "जल तत्त्व मुख (गोलाकार व सौम्य)",
      te: "జల తత్త్వ ముఖం (గుండ్రటి సౌమ్యం)",
      ta: "ஜல தத்துவ முகம் (வட்ட வடிவம்)"
    },
    traits: {
      kn: "ಸುಂದರ ನೇತ್ರಗಳು, ಮೃದುವಾದ ಕೆನ್ನೆಗಳು, ಕಲಾತ್ಮಕ ಆಸಕ್ತಿ, ಕರುಣೆ ಹಾಗೂ ಪ್ರೇಮಮಯ ಸ್ವಭಾವ.",
      en: "Lustrous eyes, gentle contours, deep artistic appreciation, empathy and romantic warmth.",
      hi: "मनोहर नयन, कोमल कपोल, कलात्मक रुचि, दयालुता एवं स्नेहपूर्ण स्वभाव।",
      te: "సుందర నేత్రాలు, మృదువైన కపోలాలు, కళాభిరుచి, దయ & ప్రేమభావం.",
      ta: "அழகான கண்கள், மென்மையான கன்னங்கள், கலை ஆர்வம் & அன்பு நிறைந்த குணம்."
    }
  },
  vayu: {
    nameKn: "ವಾಯು ತತ್ತ್ವ ಮುಖ (Air Archetype - Oblong / Rectangular)",
    nameEn: "Vayu Face (Air Archetype - Analytical & Eloquent)",
    traitsKn: "ಉನ್ನತ ಲಲಾಟ, ಉದ್ದವಾದ ಮುಖ, ಗಣಿತ-ವಿಜ್ಞಾನ ತೀಕ್ಷ್ಣತೆ, ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ಬೌದ್ಧಿಕ ಅನ್ವೇಷಣೆ.",
    traitsEn: "High forehead, elongated structure, sharp analytical acumen, articulate speech and philosophical depth.",
    name: {
      kn: "ವಾಯು ತತ್ತ್ವ ಮುಖ (ಉದ್ದನೆಯ ಆಕಾರ)",
      en: "Vayu Face (Air Archetype - Oblong)",
      hi: "वायु तत्त्व मुख (दीर्घाकार व प्रज्ञावान)",
      te: "వాయు తత్త్వ ముఖం (పొడవైన విజ్ఞాన రూపం)",
      ta: "வாயு தத்துவ முகம் (நீள் சதுரம்)"
    },
    traits: {
      kn: "ಉನ್ನತ ಲಲಾಟ, ಉದ್ದವಾದ ಮುಖ, ಗಣಿತ-ವಿಜ್ಞಾನ ತೀಕ್ಷ್ಣತೆ, ವಾಕ್ಚಾತುರ್ಯ ಹಾಗೂ ಬೌದ್ಧಿಕ ಅನ್ವೇಷಣೆ.",
      en: "High forehead, elongated structure, sharp analytical acumen, articulate speech and philosophical depth.",
      hi: "उन्नत ललाट, सूक्ष्म विश्लेषणात्मक बुद्धि, वाकपटुता एवं दार्शनिक चिंतन।",
      te: "విశాల నుదురు, విశ్లేషణాత్మక బుద్ధి, వాక్చాతుర్యం & తాత్విక చింతన.",
      ta: "உயர்ந்த நெற்றி, கூர்மையான பகுத்தறிவு, நாவன்மை & தத்துவ சிந்தனை."
    }
  },
  akasha: {
    nameKn: "ಆಕಾಶ ತತ್ತ್ವ ಮುಖ (Ether Archetype - Translucent / Delicate)",
    nameEn: "Akasha Face (Ether Archetype - Spiritual & Intuitive)",
    traitsKn: "ತೇಜಸ್ವಿ ಕಾಂತಿ, ದೈವಿಕ ಮುಖವರ್ಚಸ್ಸು, ಅಂತಃಸ್ಫೂರ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ.",
    traitsEn: "Luminous aura, divine tranquility, sharp sixth sense intuition and spiritual wisdom.",
    name: {
      kn: "ಆಕಾಶ ತತ್ತ್ವ ಮುಖ (ತೇಜಸ್ವಿ ದೈವಿಕ)",
      en: "Akasha Face (Ether Archetype - Luminous)",
      hi: "आकाश तत्त्व मुख (तेजस्वी व दिव्य)",
      te: "ఆకాశ తత్త్వ ముఖం (దివ్య తేజోమయం)",
      ta: "ஆகாய தத்துவ முகம் (தெய்வீக தேஜஸ்)"
    },
    traits: {
      kn: "ತೇಜಸ್ವಿ ಕಾಂತಿ, ದೈವಿಕ ಮುಖವರ್ಚಸ್ಸು, ಅಂತಃಸ್ಫೂರ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಸಿದ್ಧಿ.",
      en: "Luminous aura, divine tranquility, sharp sixth sense intuition and spiritual wisdom.",
      hi: "दिव्य आभा, अंतःप्रेरणा, सात्विक शांति, सत्यनिष्ठा एवं आध्यात्मिक ज्ञान।",
      te: "దివ్య వర్చస్సు, అంతఃస్ఫూర్తి, సాత్విక శాంతి & ఆధ్యాత్మిక ఉన్నతి.",
      ta: "தெய்வீக ஒளி, உள்ளுணர்வு, சாத்வீக அமைதி & ஆன்மீக மேன்மை."
    }
  }
};

export const VEDIC_MAHAPURUSHA_FACIAL_ARCHETYPES = {
  hamsa: {
    nameKn: "ಹಂಸ ಮಹಾಪುರುಷ ಮುಖ (Guru - Jupiter Archetype)",
    nameEn: "Hamsa Mahapurusha (Jupiter Face)",
    rulerKn: "ಬೃಹಸ್ಪತಿ (ಗುರು)",
    rulerEn: "Jupiter (Guru)",
    featuresKn: "ವಿಶಾಲ ಲಲಾಟ, ಪದ್ಮಾಕಾರದ ನೇತ್ರಗಳು, ನೇರವಾದ ನಾಸಿಕ, ಗಂಭೀರ ಧ್ವನಿ ಹಾಗೂ ಶುದ್ಧ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು.",
    featuresEn: "Broad elevated forehead, lotus eyes, straight royal nose bridge, resonant voice and radiant Sattvic wisdom.",
    name: {
      kn: "ಹಂಸ ಮಹಾಪುರುಷ ಯೋಗ (ಗುರು ಮುಖ)",
      en: "Hamsa Mahapurusha (Jupiter Archetype)",
      hi: "हंस महापुरुष योग (गुरु मुख)",
      te: "హంస మహాపురుష యోగం (గురు ముఖం)",
      ta: "ஹம்ச மகாபுருஷ யோகம் (குரு முகம்)"
    },
    ruler: {
      kn: "ಗುರು (ಬೃಹಸ್ಪತಿ)",
      en: "Jupiter (Guru)",
      hi: "बृहस्पति (गुरु)",
      te: "బృహస్పతి (గురు)",
      ta: "குரு (வியாழன்)"
    },
    features: {
      kn: "ವಿಶಾಲ ಲಲಾಟ, ಪದ್ಮಾಕಾರದ ನೇತ್ರಗಳು, ನೇರವಾದ ನಾಸಿಕ, ಗಂಭೀರ ಧ್ವನಿ ಹಾಗೂ ಶುದ್ಧ ಸಾತ್ವಿಕ ತೇಜಸ್ಸು.",
      en: "Broad elevated forehead, lotus eyes, straight royal nose bridge, resonant voice and radiant Sattvic wisdom.",
      hi: "विशाल ललाट, पद्म नयन, सीधी शाही नासिका, गंभीर वाणी एवं सात्विक तेज।",
      te: "విశాల లలాటం, పద్మ నేత్రాలు, రాజస నాసిక, గంభీర స్వరం & సాత్విక వర్చస్సు.",
      ta: "அகன்ற நெற்றி, தாமரை கண்கள், நேர்த்தியான மூக்கு & சாத்வீக தேஜஸ்."
    }
  },
  ruchaka: {
    nameKn: "ರುಚಕ ಮಹಾಪುರುಷ ಮುಖ (Kuja - Mars Archetype)",
    nameEn: "Ruchaka Mahapurusha (Mars Face)",
    rulerKn: "ಮಂಗಳ (ಕುಜ)",
    rulerEn: "Mars (Mangala)",
    featuresKn: "ದೃಢ ಭ್ರೂಮಧ್ಯ, ಕೆಚ್ಚೆದೆಯ ಕಣ್ಣುಗಳು, ಬಲಯುತ ಚೌಕಾಕಾರದ ದವಡೆ ಹಾಗೂ ಅದಮ್ಯ ಶೌರ್ಯ.",
    featuresEn: "Prominent brow ridge, fearless piercing eyes, muscular square jaw and invincible determination.",
    name: {
      kn: "ರುಚಕ ಮಹಾಪುರುಷ ಯೋಗ (ಕುಜ ಮುಖ)",
      en: "Ruchaka Mahapurusha (Mars Archetype)",
      hi: "रुचक महापुरुष योग (मंगल मुख)",
      te: "రుచక మహాపురుష యోగం (కుజ ముఖం)",
      ta: "ருசக மகாபுருஷ யோகம் (செவ்வாய் முகம்)"
    },
    ruler: {
      kn: "ಮಂಗಳ (ಕುಜ)",
      en: "Mars (Mangala)",
      hi: "मंगल (कुज)",
      te: "కుజ (మంగళ)",
      ta: "செவ்வாய் (குஜன்)"
    },
    features: {
      kn: "ದೃಢ ಭ್ರೂಮಧ್ಯ, ಕೆಚ್ಚೆದೆಯ ಕಣ್ಣುಗಳು, ಬಲಯುತ ಚೌಕಾಕಾರದ ದವಡೆ ಹಾಗೂ ಅದಮ್ಯ ಶೌರ್ಯ.",
      en: "Prominent brow ridge, fearless piercing eyes, muscular square jaw and invincible determination.",
      hi: "दृढ़ भृकुटि, निर्भीक तीक्ष्ण नेत्र, बलिष्ठ चौकोर जबड़ा एवं अदम्य साहस।",
      te: "దృఢమైన కనుబొమ్మలు, నిర్భయ నేత్రాలు, బలమైన దవడ & అపార ధైర్యం.",
      ta: "உறுதியான புருவம், வீர பார்வை, வலிமையான தாடை & அஞ்சாத வீரம்."
    }
  },
  bhadra: {
    nameKn: "ಭದ್ರ ಮಹಾಪುರುಷ ಮುಖ (Budha - Mercury Archetype)",
    nameEn: "Bhadra Mahapurusha (Mercury Face)",
    rulerKn: "ಬುಧ",
    rulerEn: "Mercury (Budha)",
    featuresKn: "ನಿತ್ಯ ಯೌವನದ ಮುಖಕಾಂತಿ, ತೀಕ್ಷ್ಣ ನಾಸಿಕಾಗ್ರ, ಚಾಣಾಕ್ಷ ನೇತ್ರಗಳು ಹಾಗೂ ವಾಗ್ಮಿತ್ವ.",
    featuresEn: "Youthful vibrant complexion, sharp nose tip, sparkling analytical eyes and master diplomacy.",
    name: {
      kn: "ಭದ್ರ ಮಹಾಪುರುಷ ಯೋಗ (ಬುಧ ಮುಖ)",
      en: "Bhadra Mahapurusha (Mercury Archetype)",
      hi: "भद्र महापुरुष योग (बुध मुख)",
      te: "భద్ర మహాపురుష యోగం (బుధ ముఖం)",
      ta: "பத்ர மகாபுருஷ யோகம் (புதன் முகம்)"
    },
    ruler: {
      kn: "ಬುಧ",
      en: "Mercury (Budha)",
      hi: "बुध",
      te: "బుధ",
      ta: "புதன்"
    },
    features: {
      kn: "ನಿತ್ಯ ಯೌವನದ ಮುಖಕಾಂತಿ, ತೀಕ್ಷ್ಣ ನಾಸಿಕಾಗ್ರ, ಚಾಣಾಕ್ಷ ನೇತ್ರಗಳು ಹಾಗೂ ವಾಗ್ಮಿತ್ವ.",
      en: "Youthful vibrant complexion, sharp nose tip, sparkling analytical eyes and master diplomacy.",
      hi: "सदा युवा कांतिमय मुख, तीक्ष्ण नासिका, चतुर नेत्र एवं उत्कृष्ट वाक्पटुता।",
      te: "నిత్య యవ్వన కాంతి, చురుకైన నాసిక, తీక్షణమైన కళ్ళు & సంభాషణా చాతుర్యం.",
      ta: "இளமையான முகம், கூர்மையான மூக்கு நுனி, அறிவார்ந்த கண்கள் & சிறந்த நாவன்மை."
    }
  },
  malavya: {
    nameKn: "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಮುಖ (Shukra - Venus Archetype)",
    nameEn: "Malavya Mahapurusha (Venus Face)",
    rulerKn: "ಶುಕ್ರ",
    rulerEn: "Venus (Shukra)",
    featuresKn: "ಆಕರ್ಷಕ ಕಮಲ ನಯನಗಳು, ಗುಲಾಬಿ ಬಣ್ಣದ ಸುಂದರ ಓಷ್ಠ, ನಯವಾದ ಚರ್ಮ ಹಾಗೂ ವಾಹನ-ಭೋಗ ಯೋಗ.",
    featuresEn: "Enchanting almond eyes, rosy cupid-bow lips, flawless radiant skin and luxury prosperity.",
    name: {
      kn: "ಮಾಲವ್ಯ ಮಹಾಪುರುಷ ಯೋಗ (ಶುಕ್ರ ಮುಖ)",
      en: "Malavya Mahapurusha (Venus Archetype)",
      hi: "मालव्य महापुरुष योग (शुक्र मुख)",
      te: "మాలవ్య మహాపురుష యోగం (శుక్ర ముఖం)",
      ta: "மாலவ்ய மகாபுருஷ யோகம் (சுக்கிர முகம்)"
    },
    ruler: {
      kn: "ಶುಕ್ರ",
      en: "Venus (Shukra)",
      hi: "शुक्र",
      te: "శుక్ర",
      ta: "சுக்கிரன்"
    },
    features: {
      kn: "ಆಕರ್ಷಕ ಕಮಲ ನಯನಗಳು, ಗುಲಾಬಿ ಬಣ್ಣದ ಸುಂದರ ಓಷ್ಠ, ನಯವಾದ ಚರ್ಮ ಹಾಗೂ ವಾಹನ-ಭೋಗ ಯೋಗ.",
      en: "Enchanting almond eyes, rosy cupid-bow lips, flawless radiant skin and luxury prosperity.",
      hi: "मनमोहक नयन, सुंदर गुलाबी ओंठ, कोमल कांतिमय त्वचा एवं ऐश्वर्य-भोग योग।",
      te: "ఆకర్షణీయమైన కళ్ళు, గులాబీ రంగు పెదవులు, మృదువైన చర్మం & విలాస భోగాలు.",
      ta: "வசீகரமான கண்கள், அழகிய உதடுகள், மிருதுவான சருமம் & சுகபோக யோகம்."
    }
  },
  sasa: {
    nameKn: "ಶಶ ಮಹಾಪುರುಷ ಮುಖ (Shani - Saturn Archetype)",
    nameEn: "Sasa Mahapurusha (Saturn Face)",
    rulerKn: "ಶನೀಶ್ವರ",
    rulerEn: "Saturn (Shani)",
    featuresKn: "ಗಂಭೀರ ನೇತ್ರಗಳು, ದೃಢ ಮೂಳೆ ರಚನೆ, ಆಳವಾದ ಚಿಂತನೆ ಹಾಗೂ ಜನಸಾಮಾನ್ಯರ ಮೇಲೆ ಪ್ರಭುತ್ವ.",
    featuresEn: "Deep thoughtful eyes, strong skeletal structure, stoic perseverance and authority over masses.",
    name: {
      kn: "ಶಶ ಮಹಾಪುರುಷ ಯೋಗ (ಶನಿ ಮುಖ)",
      en: "Sasa Mahapurusha (Saturn Archetype)",
      hi: "शश महापुरुष योग (शनि मुख)",
      te: "శశ మహాపురుష యోగం (శని ముఖం)",
      ta: "சச மகாபுருஷ யோகம் (சனி முகம்)"
    },
    ruler: {
      kn: "ಶನೀಶ್ವರ (ಶನಿ)",
      en: "Saturn (Shani)",
      hi: "शनैश्चर (शनि)",
      te: "శనీశ్వరుడు (శని)",
      ta: "சனீஸ்வரன் (சனி)"
    },
    features: {
      kn: "ಗಂಭೀರ ನೇತ್ರಗಳು, ದೃಢ ಮೂಳೆ ರಚನೆ, ಆಳವಾದ ಚಿಂತನೆ ಹಾಗೂ ಜನಸಾಮಾನ್ಯರ ಮೇಲೆ ಪ್ರಭುತ್ವ.",
      en: "Deep thoughtful eyes, strong skeletal structure, stoic perseverance and authority over masses.",
      hi: "गंभीर दृष्टि, सुदृढ़ अस्थि संरचना, गहरा चिंतन एवं जनसमुदाय पर प्रभाव।",
      te: "గంభీరమైన కళ్ళు, బలమైన ముఖ నిర్మాణం, లోతైన ఆలోచన & ప్రజా నాయకత్వం.",
      ta: "கம்பீரமான கண்கள், உறுதியான முக அமைப்பு, ஆழமான சிந்தனை & மக்கள் செல்வாக்கு."
    }
  }
};

export const VEDIC_LALATA_PLANETARY_LINES = [
  {
    lineIndex: 1,
    planetKn: "ಶನಿ ರೇಖೆ (Saturn Line - ಕೇಶರೇಖೆಯ ಕೆಳಗೆ)",
    planetEn: "Saturn Line (Below Hairline)",
    meaningKn: "ಆಯುಷ್ಯ, ಶಿಸ್ತು, ಸಂಶೋಧನಾ ಶಕ್ತಿ ಹಾಗೂ ಏಕಾಂತ ತಪಸ್ಸು.",
    meaningEn: "Longevity, disciplined endurance, research depth and meditative stability.",
    planet: {
      kn: "ಶನಿ ರೇಖೆ (ಕೇಶರೇಖೆಯ ಕೆಳಗೆ)",
      en: "Saturn Line (Below Hairline)",
      hi: "शनि रेखा (केशरेखा के नीचे)",
      te: "శని రేఖ (కేశరేఖ కింద)",
      ta: "சனி ரேகை (முடி எல்லைக்கு கீழே)"
    },
    meaning: {
      kn: "ದೀರ್ಘಾಯುಷ್ಯ, ಶಿಸ್ತುಬದ್ಧ ಕಾರ್ಯ, ಸಂಶೋಧನಾ ಶಕ್ತಿ ಹಾಗೂ ಏಕಾಂತ ತಪಸ್ಸು.",
      en: "Longevity, disciplined endurance, research depth and meditative stability.",
      hi: "दीर्घायु, अनुशासन, शोध प्रवृत्ति एवं गहन ध्यान शक्ति।",
      te: "దీర్ఘాయుష్షు, క్రమశిక్షణ, పరిశోధనా శక్తి & ఏకాగ్రత.",
      ta: "நீண்ட ஆயுள், ஒழுக்கம், ஆராய்ச்சி திறன் & தியான மனநிலை."
    }
  },
  {
    lineIndex: 2,
    planetKn: "ಗುರು ರೇಖೆ (Jupiter Line - ೨ನೇ ರೇಖೆ)",
    planetEn: "Jupiter Line (2nd Horizontal Line)",
    meaningKn: "ಜ್ಞಾನಾರ್ಜನೆ, ಗುರು ಕೃಪೆ, ಧಾರ್ಮಿಕ ಆಸಕ್ತಿ ಹಾಗೂ ಸಮಾಜ ಗೌರವ.",
    meaningEn: "Spiritual wisdom, scholarly honor, ethical righteousness and divine protection.",
    planet: {
      kn: "ಗುರು ರೇಖೆ (೨ನೇ ರೇಖೆ)",
      en: "Jupiter Line (2nd Line)",
      hi: "गुरु रेखा (द्वितीय रेखा)",
      te: "గురు రేఖ (రెండవ రేఖ)",
      ta: "குரு ரேகை (இரண்டாவது ரேகை)"
    },
    meaning: {
      kn: "ಉನ್ನತ ಜ್ಞಾನಾರ್ಜನೆ, ಗುರು ಕೃಪೆ, ಧಾರ್ಮಿಕ ಆಸಕ್ತಿ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಪರಮ ಗೌರವ.",
      en: "Spiritual wisdom, scholarly honor, ethical righteousness and divine protection.",
      hi: "उच्च विद्या, गुरु कृपा, धार्मिक निष्ठा एवं समाज में आदर।",
      te: "ఉన్నత విద్య, గురు అనుగ్రహం, ధార్మిక నిష్ఠ & సమాజ గౌరవం.",
      ta: "உயரிய ஞானம், குரு அருள், ஆன்மீக பக்தி & சமூக மதிப்பு."
    }
  },
  {
    lineIndex: 3,
    planetKn: "ಮಂಗಳ ರೇಖೆ (Mars Line - ೩ನೇ ರೇಖೆ)",
    planetEn: "Mars Line (3rd Line)",
    meaningKn: "ಧೈರ್ಯ, ಸಾಹಸ, ಸೈನ್ಯ/ಆಡಳಿತ ನಾಯಕತ್ವ ಹಾಗೂ ಶತ್ರುಜಯ.",
    meaningEn: "Courage, valor, administrative leadership and victory over obstacles.",
    planet: {
      kn: "ಮಂಗಳ ರೇಖೆ (೩ನೇ ರೇಖೆ)",
      en: "Mars Line (3rd Line)",
      hi: "मंगल रेखा (तृतीय रेखा)",
      te: "కుజ రేఖ (మూడవ రేఖ)",
      ta: "செவ்வாய் ரேகை (மூன்றாவது ரேகை)"
    },
    meaning: {
      kn: "ಅಚಲ ಧೈರ್ಯ, ಸಾಹಸ, ಸೈನ್ಯ/ಆಡಳಿತ ನಾಯಕತ್ವ ಹಾಗೂ ಸರ್ವ ಶತ್ರುಜಯ.",
      en: "Courage, valor, administrative leadership and victory over obstacles.",
      hi: "शौर्य, साहस, प्रशासनिक नेतृत्व एवं समस्त शत्रुओं पर विजय।",
      te: "అచల ధైర్యం, సాహసం, పరిపాలనా దక్షత & శత్రు విజయం.",
      ta: "வீரம், துணிச்சல், நிர்வாகத் தலைமை & எதிரிகளை வெல்லும் திறன்."
    }
  },
  {
    lineIndex: 4,
    planetKn: "ರವಿ ರೇಖೆ (Sun Line - ಬಲ ಹುಬ್ಬಿನ ಮೇಲೆ)",
    planetEn: "Sun Line (Above Right Eyebrow)",
    meaningKn: "ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಕೀರ್ತಿ, ತೇಜಸ್ಸು, ನಾಯಕತ್ವ ಹಾಗೂ ಸರಕಾರಿ ಗೌರವ.",
    meaningEn: "Executive authority, governmental recognition, high vitality and fame.",
    planet: {
      kn: "ರವಿ ರೇಖೆ (ಬಲ ಹುಬ್ಬಿನ ಮೇಲೆ)",
      en: "Sun Line (Above Right Eyebrow)",
      hi: "सूर्य रेखा (दाहिनी भौंह के ऊपर)",
      te: "సూర్య రేఖ (కుడి కనుబొమ్మ పైన)",
      ta: "சூரிய ரேகை (வலது புருவத்திற்கு மேல்)"
    },
    meaning: {
      kn: "ರಾಜಕೀಯ/ಉದ್ಯೋಗ ಕೀರ್ತಿ, ತೇಜಸ್ಸು, ನಾಯಕತ್ವ ಹಾಗೂ ಸರಕಾರಿ ಸನ್ಮಾನ.",
      en: "Executive authority, governmental recognition, high vitality and fame.",
      hi: "राजकीय सम्मान, यश, उच्च पद, तेजस्विता एवं ख्याति।",
      te: "రాజకీయ/ఉద్యోగ కీర్తి, తేజస్సు, నాయకత్వం & ప్రభుత్వ గౌరవం.",
      ta: "அரசாங்க மரியாதை, புகழ், தலைமைப் பதவி & பிரகாசமான தேஜஸ்."
    }
  },
  {
    lineIndex: 5,
    planetKn: "ಚಂದ್ರ ರೇಖೆ (Moon Line - ಎಡ ಹುಬ್ಬಿನ ಮೇಲೆ)",
    planetEn: "Moon Line (Above Left Eyebrow)",
    meaningKn: "ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಕಲ್ಪನಾಶಕ್ತಿ, ಕಲೆ ಹಾಗೂ ಜಲ/ವಿದೇಶ ಪ್ರವಾಸ.",
    meaningEn: "Emotional balance, imaginative creativity, arts and travel success.",
    planet: {
      kn: "ಚಂದ್ರ ರೇಖೆ (ಎಡ ಹುಬ್ಬಿನ ಮೇಲೆ)",
      en: "Moon Line (Above Left Eyebrow)",
      hi: "चंद्र रेखा (बाईं भौंह के ऊपर)",
      te: "చంద్ర రేఖ (ఎడమ కనుబొమ్మ పైన)",
      ta: "சந்திர ரேகை (இடது புருவத்திற்கு மேல்)"
    },
    meaning: {
      kn: "ಭಾವನಾತ್ಮಕ ಸಮತೋಲನ, ಕಲ್ಪನಾಶಕ್ತಿ, ಕಲೆ ಹಾಗೂ ವಿದೇಶ ಪ್ರವಾಸ ಯೋಗ.",
      en: "Emotional balance, imaginative creativity, arts and travel success.",
      hi: "मानसिक शांति, रचनात्मक कल्पनाशक्ति, कला एवं विदेश यात्रा योग।",
      te: "మానసిక ప్రశాంతత, కళాభిరుచి, కల్పనాశక్తి & విదేశీ ప్రయాణం.",
      ta: "மன அமைதி, படைப்பாற்றல், கலை ஆர்வம் & வெளிநாட்டு பயணம்."
    }
  },
  {
    lineIndex: 6,
    planetKn: "ಶುಕ್ರ ರೇಖೆ (Venus Line - ಭ್ರೂಮಧ್ಯ / ಆಜ್ಞಾ)",
    planetEn: "Venus Line (Inter-Eyebrow Zone)",
    meaningKn: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಆಕರ್ಷಣೆ.",
    meaningEn: "Marital harmony, aesthetic charm, luxury vehicle fortune and charisma.",
    planet: {
      kn: "ಶುಕ್ರ ರೇಖೆ (ಭ್ರೂಮಧ್ಯ / ಆಜ್ಞಾ)",
      en: "Venus Line (Inter-Eyebrow Zone)",
      hi: "शुक्र रेखा (भृकुटि मध्य / आज्ञा चक्र)",
      te: "శుక్ర రేఖ (కనుబొమ్మల మధ్య / ఆజ్ఞా)",
      ta: "சுக்கிர ரேகை (புருவ மத்தி / ஆக்ஞா)"
    },
    meaning: {
      kn: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಆಕರ್ಷಣೆ.",
      en: "Marital harmony, aesthetic charm, luxury vehicle fortune and charisma.",
      hi: "वैवाहिक सुख, सौंदर्य प्रेम, वाहन सौभाग्य एवं चुंबकीय आकर्षण।",
      te: "దాంపత్య సుఖం, సౌందర్య దృష్టి, వాహన యోగం & ఆకర్షణ.",
      ta: "தாம்பத்ய மகிழ்ச்சி, வாகன யோகம் & வசீகர ஆளுமை."
    }
  },
  {
    lineIndex: 7,
    planetKn: "ಬುಧ ರೇಖೆ (Mercury Line - ನಾಸಿಕ ಮೂಖ)",
    planetEn: "Mercury Line (Root of Nose Bridge)",
    meaningKn: "ವಾಕ್ ಸಿದ್ಧಿ, ವಾಣಿಜ್ಯ ಬುದ್ಧಿ, ಗಣಿತ ತೀಕ್ಷ್ಣತೆ ಹಾಗೂ ಸಂವಹನ ಕಲೆ.",
    meaningEn: "Eloquence, commercial acumen, mathematical skill and persuasive speech.",
    planet: {
      kn: "ಬುಧ ರೇಖೆ (ನಾಸಿಕ ಮೂಲ)",
      en: "Mercury Line (Root of Nose Bridge)",
      hi: "बुध रेखा (नासिका मूल)",
      te: "బుధ రేఖ (నాసిక మూలం)",
      ta: "புதன் ரேகை (மூக்கின் அடிப்பகுதி)"
    },
    meaning: {
      kn: "ವಾಕ್ ಸಿದ್ಧಿ, ವಾಣಿಜ್ಯ ಬುದ್ಧಿ, ಗಣಿತ ತೀಕ್ಷ್ಣತೆ ಹಾಗೂ ಚತುರ ಸಂವಹನ ಕಲೆ.",
      en: "Eloquence, commercial acumen, mathematical skill and persuasive speech.",
      hi: "वाक् सिद्धि, व्यापारिक चातुर्य, गणितीय दक्षता एवं प्रभावी संवाद।",
      te: "వాక్ సిద్ధి, వ్యాపార దక్షత, గణిత నైపుణ్యం & ప్రభావవంతమైన మాట.",
      ta: "வாக்கு பலிதம், வியாபார சாமர்த்தியம் & இனிமையான உரையாடல்."
    }
  }
];

export const VEDIC_EYE_TYPES = {
  padma: {
    nameKn: "ಪದ್ಮ ನೇತ್ರ (Lotus Eyes - ಬೃಹತ್ ಸಂಹಿತಾ)",
    nameEn: "Padma Netra (Lotus Shaped)",
    meaningKn: "ಸಾತ್ವಿಕ ಗುಣ, ಕರುಣೆ, ಪವಿತ್ರ ಜೀವನ ಹಾಗೂ ಉನ್ನತ ಸಮಾಜ ಮನ್ನಣೆ.",
    meaningEn: "Sattvic nature, boundless compassion, purity and high spiritual esteem.",
    name: {
      kn: "ಪದ್ಮ ನೇತ್ರ (ಕಮಲ ನಯನ)",
      en: "Padma Netra (Lotus Eyes)",
      hi: "पद्म नेत्र (कमल नयन)",
      te: "పద్మ నేత్రాలు (కమల నయనాలు)",
      ta: "பத்ம நேத்ரம் (தாமரை கண்கள்)"
    },
    meaning: {
      kn: "ಸಾತ್ವಿಕ ಗುಣ, ಅಪಾರ ಕರುಣೆ, ಪವಿತ್ರ ಜೀವನ ಹಾಗೂ ಉನ್ನತ ಸಮಾಜ ಮನ್ನಣೆ.",
      en: "Sattvic nature, boundless compassion, purity and high spiritual esteem.",
      hi: "सात्विक स्वभाव, करुणा, निर्मल जीवन एवं समाज में सर्वोच्च सम्मान।",
      te: "సాత్విక గుణం, అపార దయ, పవిత్ర జీవనం & ఉన్నత గౌరవం.",
      ta: "சாத்வீக குணம், அளவற்ற கருணை & சமூகத்தில் உயர்ந்த நன்மதிப்பு."
    }
  },
  matsya: {
    nameKn: "ಮತ್ಸ್ಯ ನೇತ್ರ (Fish Shaped)",
    nameEn: "Matsya Netra (Fish Shaped Eyes)",
    meaningKn: "ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ, ತಕ್ಷಣದ ಧನಾಗಮನ, ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಹಾಗೂ ಸೌಭಾಗ್ಯ.",
    meaningEn: "Commercial sharpness, rapid wealth influx, agility and prosperity.",
    name: {
      kn: "ಮತ್ಸ್ಯ ನೇತ್ರ (ಮೀನಾಕಾರ)",
      en: "Matsya Netra (Fish Shaped)",
      hi: "मत्स्य नेत्र (मीनाकार)",
      te: "మత్స్య నేత్రాలు (చేపాకారం)",
      ta: "மச்ச நேத்ரம் (மீன் வடிவம்)"
    },
    meaning: {
      kn: "ವ್ಯಾಪಾರ ಚಾಕಚಕ್ಯತೆ, ತಕ್ಷಣದ ಧನಾಗಮನ, ಕ್ಷಿಪ್ರ ನಿರ್ಧಾರ ಹಾಗೂ ಸೌಭಾಗ್ಯ.",
      en: "Commercial sharpness, rapid wealth influx, agility and prosperity.",
      hi: "व्यापारिक चतुरता, आकस्मिक धनलाभ, त्वरित निर्णय एवं सौभाग्य।",
      te: "వ్యాపార దక్షత, ఆకస్మిక ధనలాభం, చురుకైన నిర్ణయాలు & అదృష్టం.",
      ta: "வியாபார சாதுரியம், திடீர் தன லாபம் & நல்வாய்ப்பு."
    }
  },
  mriga: {
    nameKn: "ಮೃಗ ನೇತ್ರ (Deer Eyes)",
    nameEn: "Mriga Netra (Deer Eyes)",
    meaningKn: "ಮುಗ್ಧತೆ, ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ, ಚುರುಕುತನ ಹಾಗೂ ಕಲಾ ಪ್ರೇಮ.",
    meaningEn: "Innocent beauty, high sensitivity, quick perceptiveness and artistic love.",
    name: {
      kn: "ಮೃಗ ನೇತ್ರ (ಜಿಂಕೆ ಕಣ್ಣು)",
      en: "Mriga Netra (Deer Eyes)",
      hi: "मृग नेत्र (मृगनयनी)",
      te: "మృగ నేత్రాలు (జింక కళ్ళు)",
      ta: "மிருக நேத்ரம் (மான் விழிகள்)"
    },
    meaning: {
      kn: "ಮುಗ್ಧತೆ, ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ, ಚುರುಕುತನ ಹಾಗೂ ಕಲಾ ಪ್ರೇಮ.",
      en: "Innocent beauty, high sensitivity, quick perceptiveness and artistic love.",
      hi: "मासूमियत, सूक्ष्म संवेदनशीलता, चंचलता एवं कलात्मक प्रेम।",
      te: "ముగ్ధత, సూక్ష్మ స్పందన, చురుకుదనం & కళా ప్రీతి.",
      ta: "அப்பாவித்தனம், நுண்ணிய உணர்வு, சுறுசுறுப்பு & கலை ஆர்வம்."
    }
  },
  gaja: {
    nameKn: "ಗಜ ನೇತ್ರ (Elephant / Deep Eyes)",
    nameEn: "Gaja Netra (Deep Set Eyes)",
    meaningKn: "ಅಗಾಧ ನೆನಪಿನ ಶಕ್ತಿ, ಸ್ಥಿರ ಮನಸ್ಸು, ತಾಳ್ಮೆ ಹಾಗೂ ಶಾಶ್ವತ ಕೀರ್ತಿ.",
    meaningEn: "Profound photographic memory, stable intellect, patience and enduring legacy.",
    name: {
      kn: "ಗಜ ನೇತ್ರ (ಆಳವಾದ ಗಂಭೀರ ನೇತ್ರ)",
      en: "Gaja Netra (Deep Set Eyes)",
      hi: "गज नेत्र (गंभीर व धैर्यवान)",
      te: "గజ నేత్రాలు (గంభీరమైన కళ్ళు)",
      ta: "கஜ நேத்ரம் (ஆழ்ந்த பார்வை)"
    },
    meaning: {
      kn: "ಅಗಾಧ ನೆನಪಿನ ಶಕ್ತಿ, ಸ್ಥಿರ ಮನಸ್ಸು, ತಾಳ್ಮೆ ಹಾಗೂ ಶಾಶ್ವತ ಕೀರ್ತಿ.",
      en: "Profound photographic memory, stable intellect, patience and enduring legacy.",
      hi: "अगाध स्मरण शक्ति, स्थिर बुद्धि, धैर्य एवं दीर्घकालिक ख्याति।",
      te: "అపార జ్ఞాపకశక్తి, స్థిరమైన బుద్ధి, సహనం & శాశ్వత కీర్తి.",
      ta: "அபார நினைவாற்றல், நிலைத்த மனம் & நீடித்த புகழ்."
    }
  }
};

export const VEDIC_SPECIAL_LAKSHANAS = {
  kambuGriva: {
    nameKn: "ಕಂಬು ಗ್ರೀವ (Conch-Neck Tri-Rekha)",
    nameEn: "Kambu Griva (3 Sacred Neck Lines)",
    meaningKn: "ಕಂಠದಲ್ಲಿ ಮೂರು ಸ್ಪಷ್ಟ ವೃತ್ತಾಕಾರದ ರೇಖೆಗಳು (ಕಂಬು ಗ್ರೀವ) ರಾಜಲಕ್ಷಣ, ಸಾರ್ವಭೌಮ ಅಧಿಕಾರ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯದ ಪರಮ ಸಂಕೇತ.",
    meaningEn: "Three graceful concentric neck lines signify royal authority, sovereign prestige, and longevity.",
    name: {
      kn: "ಕಂಬು ಗ್ರೀವ (ಶಂಖ ಕಂಠ)",
      en: "Kambu Griva (3 Sacred Neck Lines)",
      hi: "कम्बु ग्रीवा (शंख सदृश कंठ)",
      te: "కంబు గ్రీవ (శంఖ కంఠం)",
      ta: "கம்பு க்ரீவா (சங்கு கழுத்து)"
    },
    meaning: {
      kn: "ಕಂಠದಲ್ಲಿ ಮೂರು ಸ್ಪಷ್ಟ ರೇಖೆಗಳು ರಾಜಲಕ್ಷಣ, ಸಾರ್ವಭೌಮ ಅಧಿಕಾರ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯದ ಪರಮ ಸಂಕೇತ.",
      en: "Three graceful concentric neck lines signify royal authority, sovereign prestige, and longevity.",
      hi: "कंठ पर तीन स्पष्ट रेखाएं राजयोग, संप्रभु अधिकार एवं दीर्घायु का प्रतीक हैं।",
      te: "మెడపై మూడు స్పష్టమైన రేఖలు రాజలక్షణం, అధికార ప్రాప్తి & దీర్ఘాయుష్షు.",
      ta: "கழுத்தில் உள்ள மூன்று ரேகைகள் அரச யோகம் & நீண்ட ஆயுளின் அடையாளம்."
    }
  },
  brahmaRekha: {
    nameKn: "ಬ್ರಹ್ಮ ರೇಖೆ (Deep Symmetrical Philtrum)",
    nameEn: "Brahma Rekha (Sub-nasal Groove)",
    meaningKn: "ಮೂಗಿನ ಕೆಳಭಾಗದ ಆಳವಾದ ಬ್ರಹ್ಮ ರೇಖೆಯು ಅಗಾಧ ಪ್ರಾಣಶಕ್ತಿ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಉನ್ನತ ಸಂತಾನ ಯೋಗವನ್ನು ನೀಡುತ್ತದೆ.",
    meaningEn: "A well-defined, deep philtrum represents high vitality, reproductive strength, and lineage prosperity.",
    name: {
      kn: "ಬ್ರಹ್ಮ ರೇಖೆ (ನಾಸಿಕಾಧರ ರೇಖೆ)",
      en: "Brahma Rekha (Deep Philtrum)",
      hi: "ब्रह्म रेखा (गहरा फिलट्रम)",
      te: "బ్రహ్మ రేఖ (నాసికాధర గీత)",
      ta: "பிரம்மா ரேகை (ஆழ்ந்த உதட்டு பள்ளம்)"
    },
    meaning: {
      kn: "ಮೂಗಿನ ಕೆಳಭಾಗದ ಆಳವಾದ ಬ್ರಹ್ಮ ರೇಖೆಯು ಅಗಾಧ ಪ್ರಾಣಶಕ್ತಿ, ವಂಶಾಭಿವೃದ್ಧಿ ಹಾಗೂ ಉನ್ನತ ಸಂತಾನ ಯೋಗವನ್ನು ನೀಡುತ್ತದೆ.",
      en: "A well-defined, deep philtrum represents high vitality, reproductive strength, and lineage prosperity.",
      hi: "गहरी ब्रह्म रेखा उच्च प्राणशक्ति, वंश वृद्धि एवं श्रेष्ठ संतान योग प्रदान करती है।",
      te: "లోతైన బ్రహ్మ రేఖ అపార ప్రాణశక్తి, వంశాభివృద్ధి & సంతాన సౌభాగ్యాన్ని ఇస్తుంది.",
      ta: "ஆழமான பிரம்ம ரேகை அபார பிராண சக்தி, வம்ச விருத்தி & சந்தான யோகம் தரும்."
    }
  },
  dantaMukta: {
    nameKn: "ಮುಕ್ತಾ ದಂತ (Pearl-like Even Teeth)",
    nameEn: "Mukta Danta (Even Pearl Teeth)",
    meaningKn: "ಸಮವಾದ ಹಾಗೂ ಅಂತರವಿಲ್ಲದ ಹಲ್ಲುಗಳು ಸತ್ಯವಾಣಿ, ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ನಿರಂತರ ಧನಲಾಭವನ್ನು ನೀಡುತ್ತವೆ.",
    meaningEn: "Uniform, gap-free white teeth indicate truthful eloquence, digestive fire, and steady prosperity.",
    name: {
      kn: "ಮುಕ್ತಾ ದಂತ (ಮುತ್ತಿನಂಥ ಹಲ್ಲುಗಳು)",
      en: "Mukta Danta (Pearl Teeth)",
      hi: "मुक्ता दन्त (मोती समान दाँत)",
      te: "ముక్తా దంతాలు (ముత్యాల వంటి పళ్ళు)",
      ta: "முக்தா தந்தம் (முத்து பற்கள்)"
    },
    meaning: {
      kn: "ಸಮವಾದ ಹಾಗೂ ಅಂತರವಿಲ್ಲದ ಹಲ್ಲುಗಳು ಸತ್ಯವಾಣಿ, ವಾಕ್ ಸಿದ್ಧಿ ಹಾಗೂ ನಿರಂತರ ಧನಲಾಭವನ್ನು ನೀಡುತ್ತವೆ.",
      en: "Uniform, gap-free white teeth indicate truthful eloquence, digestive fire, and steady prosperity.",
      hi: "समान व छिद्ररहित दाँत सत्य वाणी, वाक् सिद्धि एवं निरंतर धनलाभ का संकेत हैं।",
      te: "సమంగా ఉన్న పళ్ళు సత్యవాక్కు, వాక్ సిద్ధి & స్థిర ధనలాభాన్ని కలిగిస్తాయి.",
      ta: "வரிசையான வெண் பற்கள் சத்திய வாக்கு, வாக்கு பலிதம் & தொடர் தன லாபம் தரும்."
    }
  }
};

export const VEDIC_12_FACIAL_MOLE_ZONES_L5 = [
  {
    id: "forehead-center",
    locationKn: "೧. ಹಣೆಯ ಮಧ್ಯಭಾಗ (ಆಜ್ಞಾ ಚಕ್ರ)",
    locationEn: "1. Forehead Center (Ajna Chakra)",
    meaningKn: "ಅದ್ಭುತ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ನಾಯಕತ್ವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.",
    meaningEn: "High spiritual intellect, executive leadership, and widespread honor.",
    location: {
      kn: "೧. ಹಣೆಯ ಮಧ್ಯಭಾಗ (ಆಜ್ಞಾ ಚಕ್ರ)",
      en: "1. Forehead Center (Ajna Chakra)",
      hi: "१. ललाट मध्य (आज्ञा चक्र)",
      te: "౧. నుదుటి మధ్యభాగం (ఆజ్ఞా చక్రం)",
      ta: "1. நெற்றி மத்தி (ஆக்ஞா சக்கரம்)"
    },
    meaning: {
      kn: "ಅದ್ಭುತ ಆಧ್ಯಾತ್ಮಿಕ ಜ್ಞಾನ, ನಾಯಕತ್ವ, ಧರ್ಮನಿಷ್ಠೆ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಗೌರವ.",
      en: "High spiritual intellect, executive leadership, and widespread honor.",
      hi: "अद्भुत आध्यात्मिक ज्ञान, दूरदर्शिता, धर्मनिष्ठा एवं समाज में सर्वोच्च आदर।",
      te: "అద్భుత ఆధ్యాత్మిక జ్ఞానం, నాయకత్వం, ధర్మనిష్ఠ & సమాజంలో ఉన్నత గౌరవం.",
      ta: "ஆன்மீக ஞானம், தலைமைப் பண்பு, தர்ம சிந்தனை & மக்கள் மத்தியில் உயரிய மரியாதை."
    }
  },
  {
    id: "right-forehead",
    locationKn: "೨. ಬಲ ಹಣೆ / ಶಂಖ ಪ್ರದೇಶ (Right Temple)",
    locationEn: "2. Right Forehead / Temple",
    meaningKn: "ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣದಲ್ಲಿ ಯಶಸ್ಸು, ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಕೀರ್ತಿ ಹಾಗೂ ಹಠಾತ್ ಭಾಗ್ಯೋದಯ.",
    meaningEn: "Travel success, governmental favor, and sudden career breakthroughs.",
    location: {
      kn: "೨. ಬಲ ಹಣೆ / ಶಂಖ ಪ್ರದೇಶ",
      en: "2. Right Forehead / Temple",
      hi: "२. दायां ललाट / शंख क्षेत्र",
      te: "౨. కుడి నుదురు / శంఖ ప్రదేశం",
      ta: "2. வலது நெற்றி / சங்கு பகுதி"
    },
    meaning: {
      kn: "ವಿದೇಶ/ದೂರ ಪ್ರಯಾಣದಲ್ಲಿ ಯಶಸ್ಸು, ಸರ್ಕಾರಿ ಉದ್ಯೋಗ ಕೀರ್ತಿ ಹಾಗೂ ಹಠಾತ್ ಭಾಗ್ಯೋದಯ.",
      en: "Travel success, governmental favor, and sudden career breakthroughs.",
      hi: "विदेश यात्रा में सफलता, राजकीय प्रतिष्ठा एवं आकस्मिक भाग्योदय।",
      te: "విదేశీ ప్రయాణ విజయం, ప్రభుత్వ ఉద్యోగ గౌరవం & ఆకస్మిక భాగ్యోదయం.",
      ta: "வெளிநாட்டுப் பயண வெற்றி, அரசாங்க மரியாதை & திடீர் பாக்கியோதயம்."
    }
  },
  {
    id: "left-forehead",
    locationKn: "೩. ಎಡ ಹಣೆ (Left Forehead)",
    locationEn: "3. Left Forehead",
    meaningKn: "ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಸಂಶೋಧನಾ ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಕಲಾತ್ಮಕ ಸಿದ್ಧಿ.",
    meaningEn: "Deep imaginative intuition, research prowess, and artistic talents.",
    location: {
      kn: "೩. ಎಡ ಹಣೆ",
      en: "3. Left Forehead",
      hi: "३. बायां ललाट",
      te: "౩. ఎడమ నుదురు",
      ta: "3. இடது நெற்றி"
    },
    meaning: {
      kn: "ತೀಕ್ಷ್ಣ ಕಲ್ಪನಾ ಶಕ್ತಿ, ಸಂಶೋಧನಾ ಪ್ರವೃತ್ತಿ ಹಾಗೂ ಕಲಾತ್ಮಕ ಸಿದ್ಧಿ.",
      en: "Deep imaginative intuition, research prowess, and artistic talents.",
      hi: "प्रखर कल्पनाशक्ति, शोध प्रवृत्ति एवं कलात्मक क्षेत्र में सिद्धि।",
      te: "తీక్షణ కల్పనాశక్తి, పరిశోధనా నైపుణ్యం & కళారంగంలో విజయం.",
      ta: "ஆழ்ந்த கற்பனைத் திறன், ஆராய்ச்சி ஆர்வம் & கலைத்திறமை."
    }
  },
  {
    id: "right-eyebrow",
    locationKn: "೪. ಬಲ ಹುಬ್ಬು (Right Eyebrow)",
    locationEn: "4. Right Eyebrow",
    meaningKn: "ಸಕಾಲದಲ್ಲಿ ಶುಭ ವಿವಾಹ ಯೋಗ, ಗುಣವಂತ ಸಂಗಾತಿ ಹಾಗೂ ದಾಂಪತ್ಯ ಸುಖ.",
    meaningEn: "Early auspicious marriage, loving partner, and domestic bliss.",
    location: {
      kn: "೪. ಬಲ ಹುಬ್ಬು",
      en: "4. Right Eyebrow",
      hi: "४. दाहिनी भौंह",
      te: "౪. కుడి కనుబొమ్మ",
      ta: "4. வலது புருவம்"
    },
    meaning: {
      kn: "ಸಕಾಲದಲ್ಲಿ ಶುಭ ವಿವಾಹ ಯೋಗ, ಗುಣವಂತ ಸಂಗಾತಿ ಹಾಗೂ ದಾಂಪತ್ಯ ಸುಖ.",
      en: "Early auspicious marriage, loving partner, and domestic bliss.",
      hi: "समय पर शुभ विवाह योग, सुयोग्य जीवनसाथी एवं दांपत्य सुख।",
      te: "సకాలంలో శుభ వివాహ యోగం, ఉత్తమ జీవిత భాగస్వామి & దాంపత్య సుఖం.",
      ta: "சரியான வயதில் திருமணம், அன்பான துணை & இல்லற இன்பம்."
    }
  },
  {
    id: "left-eyebrow",
    locationKn: "೫. ಎಡ ಹುಬ್ಬು (Left Eyebrow)",
    locationEn: "5. Left Eyebrow",
    meaningKn: "ವ್ಯವಹಾರದಲ್ಲಿ ಚಾಣಾಕ್ಷತೆ, ಹಣಕಾಸು ಉಳಿತಾಯ ಹಾಗೂ ಸ್ವಾಭಿಮಾನಿ ಜೀವನ.",
    meaningEn: "Financial prudence, clever bargaining, and independent spirit.",
    location: {
      kn: "೫. ಎಡ ಹುಬ್ಬು",
      en: "5. Left Eyebrow",
      hi: "५. बाईं भौंह",
      te: "౫. ఎడమ కనుబొమ్మ",
      ta: "5. இடது புருவம்"
    },
    meaning: {
      kn: "ವ್ಯವಹಾರದಲ್ಲಿ ಚಾಣಾಕ್ಷತೆ, ಹಣಕಾಸು ಉಳಿತಾಯ ಹಾಗೂ ಸ್ವಾಭಿಮಾನಿ ಜೀವನ.",
      en: "Financial prudence, clever bargaining, and independent spirit.",
      hi: "व्यापार में चतुरता, धन संचय की योग्यता एवं स्वाभिमानी जीवन।",
      te: "వ్యాపార చతురత, ఆర్థిక పొదుపు & స్వతంత్ర జీవనం.",
      ta: "வியாபார சாமர்த்தியம், சேமிப்பு பழக்கம் & சுயமரியாதை மிக்க வாழ்க்கை."
    }
  },
  {
    id: "right-cheek",
    locationKn: "೬. ಬಲ ಕೆನ್ನೆ (Right Cheek - Lakshmi Sthana)",
    locationEn: "6. Right Cheek (Lakshmi Spot)",
    meaningKn: "ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಧನ ಸಮೃದ್ಧಿ ಹಾಗೂ ಸುಖ ಭೋಗ.",
    meaningEn: "Blessing of Goddess Lakshmi, business profitability, and material wealth.",
    location: {
      kn: "೬. ಬಲ ಕೆನ್ನೆ (ಲಕ್ಷ್ಮೀ ಸ್ಥಾನ)",
      en: "6. Right Cheek (Lakshmi Spot)",
      hi: "६. दायां कपोल (लक्ष्मी स्थान)",
      te: "౬. కుడి చెంప (లక్ష్మీ స్థానం)",
      ta: "6. வலது கன்னம் (லட்சுமி ஸ்தானம்)"
    },
    meaning: {
      kn: "ಲಕ್ಷ್ಮೀ ಕಟಾಕ್ಷ, ವ್ಯಾಪಾರದಲ್ಲಿ ಲಾಭ, ಧನ ಸಮೃದ್ಧಿ ಹಾಗೂ ಸುಖ ಭೋಗ.",
      en: "Blessing of Goddess Lakshmi, business profitability, and material wealth.",
      hi: "महालक्ष्मी की कृपा, व्यापार में लाभ, धन-धान्य समृद्धि एवं भौतिक सुख।",
      te: "లక్ష్మీ కటాక్షం, వ్యాపార లాభాలు, ధన సమృద్ధి & సుఖ జీవనం.",
      ta: "மகாலட்சுமி கடாட்சம், தொழில் லாபம், தன தானிய வளம் & சுகபோக வாழ்வு."
    }
  },
  {
    id: "left-cheek",
    locationKn: "೭. ಎಡ ಕೆನ್ನೆ (Left Cheek)",
    locationEn: "7. Left Cheek",
    meaningKn: "ಗಂಭೀರ ಚಿಂತನೆ, ಸಾಹಿತ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ.",
    meaningEn: "Contemplative nature, literary affinity, and ancestor grace.",
    location: {
      kn: "೭. ಎಡ ಕೆನ್ನೆ",
      en: "7. Left Cheek",
      hi: "७. बायां कपोल",
      te: "౭. ఎడమ చెంప",
      ta: "7. இடது கன்னம்"
    },
    meaning: {
      kn: "ಗಂಭೀರ ಚಿಂತನೆ, ಸಾಹಿತ್ಯ ಪ್ರೇಮ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ.",
      en: "Contemplative nature, literary affinity, and ancestor grace.",
      hi: "गंभीर सोच, साहित्य व कला में रुचि एवं पूर्वजों का वरदान।",
      te: "గంభీరమైన ఆలోచన, సాహిత్య రంగంలో ఆసక్తి & పెద్దల ఆశీర్వాదం.",
      ta: "ஆழ்ந்த சிந்தனை, இலக்கிய ஆர்வம் & முன்னோர்களின் நல்லாசி."
    }
  },
  {
    id: "nose-bridge",
    locationKn: "೮. ನಾಸಿಕ ಸೇತುವೆ (Nose Bridge - Dhana Rekha)",
    locationEn: "8. Nose Bridge (Dhana Rekha)",
    meaningKn: "ನಿರಂತರ ಆದಾಯದ ಮೂಲ, ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಉನ್ನತ ಹುದ್ದೆ.",
    meaningEn: "Continuous income streams and career advancement through self-effort.",
    location: {
      kn: "೮. ನಾಸಿಕ ಸೇತುವೆ (ಧನ ರೇಖೆ)",
      en: "8. Nose Bridge (Dhana Rekha)",
      hi: "८. नासिका सेतु (धन रेखा)",
      te: "౮. నాసికా సేతువు (ధన రేఖ)",
      ta: "8. மூக்கு பாலம் (தன ரேகை)"
    },
    meaning: {
      kn: "ನಿರಂತರ ಆದಾಯದ ಮೂಲ, ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದ ಉನ್ನತ ಹುದ್ದೆ ಹಾಗೂ ಆರ್ಥಿಕ ಭದ್ರತೆ.",
      en: "Continuous income streams and career advancement through self-effort.",
      hi: "निरंतर आय के स्रोत, स्वावलंबन से उच्च पद एवं आर्थिक स्थिरता।",
      te: "నిరంతర ఆదాయం, స్వశక్తితో ఉన్నత పదవి & ఆర్థిక భద్రత.",
      ta: "தொடர்ச்சியான வருமானம், சுய உழைப்பால் உயர்வு & பொருளாதார பாதுகாப்பு."
    }
  },
  {
    id: "nose-tip",
    locationKn: "೯. ಮೂಗಿನ ತುದಿ (Nose Tip - Kuber Vault)",
    locationEn: "9. Nose Tip (Kuber Point)",
    meaningKn: "ಕುಬೇರ ಯೋಗ, ಹಠಾತ್ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ ಹಾಗೂ ಆಸ್ತಿ ಗಳಿಕೆ.",
    meaningEn: "Kuber wealth surge, gold jewelry accumulation, and solid liquidity.",
    location: {
      kn: "೯. ಮೂಗಿನ ತುದಿ (ಕುಬೇರ ಸ್ಥಾನ)",
      en: "9. Nose Tip (Kuber Vault)",
      hi: "९. नासिकाग्र (कुबेर स्थान)",
      te: "౯. నాసికాగ్రం (కుబేర స్థానం)",
      ta: "9. மூக்கு நுனி (குபேர ஸ்தானம்)"
    },
    meaning: {
      kn: "ಕುಬೇರ ಯೋಗ, ಹಠಾತ್ ಧನಾಗಮನ, ಚಿನ್ನಾಭರಣ ಸಂಗ್ರಹ ಹಾಗೂ ಆಸ್ತಿ ಗಳಿಕೆ.",
      en: "Kuber wealth surge, gold jewelry accumulation, and solid liquidity.",
      hi: "कुबेर योग, आकस्मिक धन संपदा, स्वर्णाभूषण संग्रह एवं स्थायी संपत्ति।",
      te: "కుబేర యోగం, ఆకస్మిక ధనాగమనం, బంగారు ఆభరణాలు & ఆస్తి పెరుగుదల.",
      ta: "குபேர யோகம், திடீர் பண வரவு, பொன் ஆபரண சேர்க்கை & சொத்து வளர்ச்சி."
    }
  },
  {
    id: "upper-lip",
    locationKn: "೧೦. ಮೇಲಿನ ತುಟಿ (Upper Lip - Vak Sthana)",
    locationEn: "10. Upper Lip (Vak Sthana)",
    meaningKn: "ಚಾಣಾಕ್ಷ ವಾಕ್ಚಾತುರ್ಯ, ಮಧುರ ಸಂಭಾಷಣೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅತಿ ಜನಪ್ರಿಯತೆ.",
    meaningEn: "Sweet speech, persuasive charisma, and widespread social popularity.",
    location: {
      kn: "೧೦. ಮೇಲಿನ ತುಟಿ (ವಾಕ್ ಸ್ಥಾನ)",
      en: "10. Upper Lip (Vak Sthana)",
      hi: "१०. ऊपरी ओष्ठ (वाक् स्थान)",
      te: "౧౦. పై పెదవి (వాక్ స్థానం)",
      ta: "10. மேல் உதடு (வாக்கு ஸ்தானம்)"
    },
    meaning: {
      kn: "ಚಾಣಾಕ್ಷ ವಾಕ್ಚಾತುರ್ಯ, ಮಧುರ ಸಂಭಾಷಣೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಅತಿ ಜನಪ್ರಿಯತೆ.",
      en: "Sweet speech, persuasive charisma, and widespread social popularity.",
      hi: "प्रभावशाली वाक्पटुता, मधुर संवाद एवं समाज में भारी लोकप्रियता।",
      te: "వాక్చాతుర్యం, మధుర సంభాషణ & సమాజంలో విశేష ప్రజాదరణ.",
      ta: "அற்புத நாவன்மை, இனிமையான பேச்சு & மக்களிடையே பெரும் செல்வாக்கு."
    }
  },
  {
    id: "lower-lip",
    locationKn: "೧೧. ಕೆಳಗಿನ ತುಟಿ (Lower Lip)",
    locationEn: "11. Lower Lip",
    meaningKn: "ಉತ್ತಮ ಭೋಜನ ಪ್ರಿಯತೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಪ್ರೇಮಮಯ ದಾಂಪತ್ಯ.",
    meaningEn: "Appreciation for culinary arts, vehicle comforts, and loving relationships.",
    location: {
      kn: "೧೧. ಕೆಳಗಿನ ತುಟಿ",
      en: "11. Lower Lip",
      hi: "११. निचला ओष्ठ",
      te: "౧౧. కింది పెదవి",
      ta: "11. கீழ் உதடு"
    },
    meaning: {
      kn: "ಉತ್ತಮ ಭೋಜನ ಪ್ರಿಯತೆ, ವಾಹನ ಸೌಭಾಗ್ಯ ಹಾಗೂ ಪ್ರೇಮಮಯ ದಾಂಪತ್ಯ.",
      en: "Appreciation for culinary arts, vehicle comforts, and loving relationships.",
      hi: "स्वादिष्ट भोजन प्रेमी, वाहन सुख एवं सुखी दांपत्य जीवन।",
      te: "మంచి భోజన ప్రియత్వం, వాహన సౌఖ్యం & ప్రేమభరిత దాంపత్యం.",
      ta: "அறுசுவை உணவுப் பிரியம், வாகன யோகம் & அன்பான தாம்பத்யம்."
    }
  },
  {
    id: "chin-center",
    locationKn: "೧೨. ಚಿಬುಕ / ಗದ್ದ (Chin Center - Bhoomi Sthana)",
    locationEn: "12. Chin Center (Bhoomi Sthana)",
    meaningKn: "ಸ್ವಂತ ಮನೆ, ಕೃಷಿ/ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ.",
    meaningEn: "Real estate ownership, ancestral property growth, and peaceful retirement.",
    location: {
      kn: "೧೨. ಚಿಬುಕ / ಗದ್ದ (ಭೂಮಿ ಸ್ಥಾನ)",
      en: "12. Chin Center (Bhoomi Sthana)",
      hi: "१२. चिबुक मध्य (भूमि स्थान)",
      te: "౧౨. గడ్డం మధ్యభాగం (భూమి స్థానం)",
      ta: "12. தாடை மத்தி (பூமி ஸ்தானம்)"
    },
    meaning: {
      kn: "ಸ್ವಂತ ಮನೆ, ಕೃಷಿ/ಸ್ಥಿರಾಸ್ತಿ ಖರೀದಿ, ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ ಹಾಗೂ ವಂಶಾಭಿವೃದ್ಧಿ.",
      en: "Real estate ownership, ancestral property growth, and peaceful retirement.",
      hi: "स्वयं का भवन, कृषि व अचल संपत्ति योग, सुखद वृद्धावस्था एवं वंश वृद्धि।",
      te: "సొంత ఇల్లు, వ్యవసాయ స్థిరాస్తుల కొనుగోలు, ప్రశాంత వృద్ధాప్యం & వంశాభివృద్ధి.",
      ta: "சொந்த வீடு, விவசாய பூமி யோகம், அமைதியான முதுமை & வம்ச விருத்தி."
    }
  }
];

export const VEDIC_7_FACIAL_FEATURES_CATALOG_L5 = [
  {
    featureKey: "forehead",
    name: {
      kn: "೧. ಲಲಾಟ (Forehead)",
      en: "1. Forehead (Lalata)",
      hi: "१. ललाट (माथा)",
      te: "౧. లలాటం (నుదురు)",
      ta: "1. நெற்றி (லலாடம்)"
    },
    planetaryRuler: {
      kn: "ಗುರು & ರವಿ (ಜ್ಞಾನ & ನಾಯಕತ್ವ)",
      en: "Jupiter & Sun (Wisdom & Leadership)",
      hi: "गुरु व सूर्य (ज्ञान व नेतृत्व)",
      te: "గురు & సూర్య (జ్ఞానం & నాయకత్వం)",
      ta: "குரு & சூரியன் (ஞானம் & தலைமை)"
    },
    observedStructure: {
      kn: "ವಿಶಾಲ ಹಾಗೂ ಉನ್ನತ ಲಲಾಟ (Broad & Elevated)",
      en: "Broad and elevated forehead",
      hi: "विशाल व उन्नत ललाट",
      te: "విశాలమైన ఉన్నత నుదురు",
      ta: "அகன்ற உயர்ந்த நெற்றி"
    },
    vedicIndication: {
      kn: "ಉನ್ನತ ಬುದ್ಧಿಶಕ್ತಿ, ಆಡಳಿತ ನಾಯಕತ್ವ ಹಾಗೂ ಸ್ವತಂತ್ರ ಚಿಂತನೆ.",
      en: "Executive intellect, strategic leadership and independent thought.",
      hi: "तीक्ष्ण बुद्धि, प्रशासनिक नेतृत्व एवं स्वतंत्र विचार शक्ति।",
      te: "ఉన్నత బుద్ధికుశలత, పరిపాలనా దక్షత & స్వతంత్ర ఆలోచన.",
      ta: "உயர்ந்த புத்தி கூர்மை, நிர்வாகத் தலைமை & சுதந்திர சிந்தனை."
    },
    score: 92
  },
  {
    featureKey: "eyes",
    name: {
      kn: "೨. ನೇತ್ರ (Eyes)",
      en: "2. Eyes (Netra)",
      hi: "२. नेत्र (आंखें)",
      te: "౨. నేత్రాలు (కళ్ళు)",
      ta: "2. கண்கள் (நேத்ரம்)"
    },
    planetaryRuler: {
      kn: "ರವಿ (ಬಲ) & ಚಂದ್ರ (ಎಡ)",
      en: "Sun (Right) & Moon (Left)",
      hi: "सूर्य (दायां) व चंद्र (बायां)",
      te: "సూర్య (కుడి) & చంద్ర (ఎడమ)",
      ta: "சூரியன் (வலது) & சந்திரன் (இடது)"
    },
    observedStructure: {
      kn: "ಪದ್ಮಾಕಾರದ ನೇತ್ರಗಳು (Lotus Shaped)",
      en: "Lotus/Almond shaped eyes",
      hi: "पद्माकार सुंदर नयन",
      te: "కమలాకార నేత్రాలు",
      ta: "தாமரை வடிவ கண்கள்"
    },
    vedicIndication: {
      kn: "ದೈವಿಕ ಅಂತಃಸ್ಫೂರ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಸೂಕ್ಷ್ಮ ಗ್ರಹಣ ಶಕ್ತಿ.",
      en: "Deep intuition, integrity, and perceptive foresight.",
      hi: "गहरी अंतर्दृष्टि, सत्यनिष्ठा एवं सूक्ष्म अवलोकन क्षमता।",
      te: "దైవిక అంతఃస్ఫూర్తి, సత్యనిష్ఠ & సూక్ష్మ గ్రహణ శక్తి.",
      ta: "தெய்வீக உள்ளுணர்வு, உண்மைத்தன்மை & நுண்ணிய பார்வை."
    },
    score: 88
  },
  {
    featureKey: "nose",
    name: {
      kn: "೩. ನಾಸಿಕ (Nose & Bridge)",
      en: "3. Nose & Wealth Bridge (Nasika)",
      hi: "३. नासिका (नाक)",
      te: "౩. నాసిక (ముక్కు)",
      ta: "3. மூக்கு (நாசிகா)"
    },
    planetaryRuler: {
      kn: "ಗುರು & ಬುಧ (ಕುಬೇರ ಸ್ಥಾನ)",
      en: "Jupiter & Mercury (Kuber Sthana)",
      hi: "गुरु व बुध (कुबेर स्थान)",
      te: "గురు & బుధ (కుబేర స్థానం)",
      ta: "குரு & புதன் (குபேர ஸ்தானம்)"
    },
    observedStructure: {
      kn: "ಉನ್ನತ ಧನ ರೇಖಾ ಸೇತುವೆ & ಮಾಂಸಲ ತುದಿ",
      en: "High bridge with well-rounded wealth tip",
      hi: "उन्नत धन सेतु एवं मांसल अग्रभाग",
      te: "ఉన్నత ధన రేఖా నాసిక & గుండ్రటి కొన",
      ta: "நேரான தன ரேகை பாலம் & குபேர மூக்கு நுனி"
    },
    vedicIndication: {
      kn: "ಸ್ಥಿರ ಧನ ವೃದ್ಧಿ, ಕುಬೇರ ಯೋಗ ಹಾಗೂ ಉತ್ತಮ ಆರ್ಥಿಕ ನಿರ್ವಹಣೆ.",
      en: "Continuous wealth accumulation, financial wisdom and prosperity.",
      hi: "निरंतर धन समृद्धि, कुबेर योग एवं उत्कृष्ट आर्थिक प्रबंधन।",
      te: "స్థిరమైన ధనవృద్ధి, కుబేర యోగం & సమర్థవంతమైన ఆర్థిక నిర్వహణ.",
      ta: "தொடர் தன வளர்ச்சி, குபேர யோகம் & சிறந்த பொருளாதார மேலாண்மை."
    },
    score: 90
  },
  {
    featureKey: "lips",
    name: {
      kn: "೪. ಓಷ್ಠ & ಮುಖ (Lips & Mouth)",
      en: "4. Lips & Expression (Oshtha)",
      hi: "४. ओष्ठ व मुख (होंठ)",
      te: "౪. ఓష్ఠం (పెదవులు)",
      ta: "4. உதடுகள் (ஓஷ்டம்)"
    },
    planetaryRuler: {
      kn: "ಶುಕ್ರ & ಬುಧ (ವಾಕ್ ಸಿದ್ಧಿ)",
      en: "Venus & Mercury (Vak Siddhi)",
      hi: "शुक्र व बुध (वाक् सिद्धि)",
      te: "శుక్ర & బుధ (వాక్ సిద్ధి)",
      ta: "சுக்கிரன் & புதன் (வாக்கு சித்தி)"
    },
    observedStructure: {
      kn: "ಸಮತೋಲಿತ ಹಾಗೂ ಆಕರ್ಷಕ ಓಷ್ಠ",
      en: "Harmonious and expressive lips",
      hi: "संतुलित एवं आकर्षक ओष्ठ",
      te: "సమతుల్యమైన అందమైన పెదవులు",
      ta: "சமச்சீரான கவர்ச்சிகரமான உதடுகள்"
    },
    vedicIndication: {
      kn: "ಚಾಣಾಕ್ಷ ವಾಕ್ಚಾತುರ್ಯ, ಸೌಹಾರ್ದಯುತ ಮಾತು ಹಾಗೂ ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ.",
      en: "Articulate eloquence, diplomatic charm and warm affection.",
      hi: "चतुर वाक्पटुता, मधुर वाणी एवं सम्मोहक व्यक्तित्व।",
      te: "చతుర సంభాషణ, మధురమైన మాట & ఆకర్షణీయమైన వ్యక్తిత్వం.",
      ta: "சாமர்த்தியமான பேச்சு, இனிமையான உரையாடல் & ஈர்க்கும் ஆளுமை."
    },
    score: 86
  },
  {
    featureKey: "chin",
    name: {
      kn: "೫. ಚಿಬುಕ & ಹನು (Chin & Jaw)",
      en: "5. Chin & Jawline (Chibuka)",
      hi: "५. चिबुक व हनु (ठोड़ी व जबड़ा)",
      te: "౫. చిబుకం (గడ్డం & దవడ)",
      ta: "5. தாடை (சிபுகம்)"
    },
    planetaryRuler: {
      kn: "ಶನಿ & ಮಂಗಳ (ಭೂಮಿ ಯೋಗ)",
      en: "Saturn & Mars (Bhoomi Yoga)",
      hi: "शनि व मंगल (भूमि योग)",
      te: "శని & కుజ (భూమి యోగం)",
      ta: "சனி & செவ்வாய் (பூமி யோகம்)"
    },
    observedStructure: {
      kn: "ದೃಢ ಹಾಗೂ ಬಲಯುತ ಚಿಬುಕ",
      en: "Firm, well-rounded and strong chin",
      hi: "सुदृढ़ एवं पुष्ट चिबुक",
      te: "దృఢమైన బలమైన గడ్డం",
      ta: "உறுதியான வலிமையான தாடை"
    },
    vedicIndication: {
      kn: "ಅಚಲ ಮನೋಬಲ, ಸ್ವಂತ ಆಸ್ತಿ ನಿರ್ಮಾಣ ಹಾಗೂ ಸುಖಕರ ವೃದ್ಧಾಪ್ಯ.",
      en: "Unshakeable willpower, real estate ownership and serene late life.",
      hi: "अटल संकल्प, अचल संपत्ति निर्माण एवं शांत सुखी वृद्धावस्था।",
      te: "అచంచల మనోధైర్యం, సొంత ఆస్తుల నిర్మాణం & ప్రశాంత వృద్ధాప్యం.",
      ta: "அசையாத மனோபலம், சொந்த நிலம் வீடு அமைதல் & அமைதியான முதுமை."
    },
    score: 91
  },
  {
    featureKey: "ears",
    name: {
      kn: "೬. ಕರ್ಣ (Ears & Lobes)",
      en: "6. Ears & Lobes (Karna)",
      hi: "६. कर्ण (कान व कर्णपालि)",
      te: "౬. కర్ణాలు (చెవులు & తమ్మెలు)",
      ta: "6. காதுகள் (கர்ணம்)"
    },
    planetaryRuler: {
      kn: "ಗುರು (ಆಯುಷ್ಯ ರಕ್ಷೆ)",
      en: "Jupiter (Longevity & Grace)",
      hi: "गुरु (दीर्घायु व कृपा)",
      te: "గురు (ఆయుష్షు & రక్షణ)",
      ta: "குரு (ஆயுள் & அருள்)"
    },
    observedStructure: {
      kn: "ದೀರ್ಘ ಹಾಗೂ ಸುಂದರ ಕರ್ಣ ಪಾಲಿಕೆಗಳು",
      en: "Long, auspicious and thick earlobes",
      hi: "दीर्घ व शुभ कर्णपालि",
      te: "పొడవైన శుభప్రదమైన చెవి తమ్మెలు",
      ta: "நீண்ட மங்களகரமான காது மடல்கள்"
    },
    vedicIndication: {
      kn: "ದೀರ್ಘಾಯುಷ್ಯ, ದೈವಿಕ ರಕ್ಷೆ ಹಾಗೂ ಹಿರಿಯರ ಆಶೀರ್ವಾದ.",
      en: "Longevity, spiritual protection and blessing of ancestors.",
      hi: "दीर्घायु, ईश्वरीय सुरक्षा एवं पितृ-आशीर्वाद।",
      te: "దీర్ఘాయుష్షు, దైవిక రక్షణ & పెద్దల ఆశీస్సులు.",
      ta: "நீண்ட ஆயுள், தெய்வீக பாதுகாப்பு & முன்னோர்களின் ஆசி."
    },
    score: 87
  },
  {
    featureKey: "cheeks",
    name: {
      kn: "೭. ಗಂಡಸ್ಥಳ & ತೇಜಸ್ಸು (Cheeks & Aura)",
      en: "7. Cheeks & Aura Radiance (Gandasthala)",
      hi: "७. कपोल व तेज (गाल व आभा)",
      te: "౭. గండస్థలం & వర్చస్సు (చెంపలు)",
      ta: "7. கன்னங்கள் & தேஜஸ் (கண்டஸ்தலம்)"
    },
    planetaryRuler: {
      kn: "ರವಿ & ಚಂದ್ರ (ತೇಜಸ್ಸು)",
      en: "Sun & Moon (Tejas & Ojas)",
      hi: "सूर्य व चंद्र (तेज व ओज)",
      te: "సూర్య & చంద్ర (వర్చస్సు)",
      ta: "சூரியன் & சந்திரன் (தேஜஸ் & ஓஜஸ்)"
    },
    observedStructure: {
      kn: "ಕಾಂತಿಯುತ ಗಂಡಸ್ಥಳ ಹಾಗೂ ತೇಜಸ್ಸು",
      en: "Radiant cheek contour with natural luster",
      hi: "कांतिमय कपोल एवं प्राकृतिक तेज",
      te: "కాంతివంతమైన చెంపలు & వర్చస్సు",
      ta: "ஒளிரும் கன்னங்கள் & இயற்கை தேஜஸ்"
    },
    vedicIndication: {
      kn: "ಸಮಾಜದಲ್ಲಿ ಉನ್ನತ ಗೌರವ, ಜನಪ್ರಿಯತೆ ಹಾಗೂ ಸಾತ್ವಿಕ ಪ್ರಭಾವ.",
      en: "High societal respect, magnetic goodwill and pure charisma.",
      hi: "समाज में मान-सम्मान, लोकप्रियता एवं सात्विक प्रभाव।",
      te: "సమాజంలో గౌరవం, ప్రజాదరణ & సాత్విక ప్రభావం.",
      ta: "சமூகத்தில் மரியாதை, புகழ் & சாத்வீக செல்வாக்கு."
    },
    score: 89
  }
];
