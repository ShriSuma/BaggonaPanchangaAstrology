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

export const VEDIC_NISHKALANKA_TEJAS = {
  title: {
    kn: "ನಿಷ್ಕಳಂಕ ಮುಖ ಮಂಡಲ (Spotless Radiant Canvas)",
    en: "Nishkalanka Tejas (Blemish-Free Luminous Canvas)",
    hi: "निष्कलंक मुख मंडल (निर्मल तेजस्वी स्वरूप)",
    te: "నిష్కళంక ముఖ మండలం (నిర్మల వర్చస్సు)",
    ta: "நிஷ்களங்க முக மண்டலம் (களங்கமற்ற பிரகாசம்)"
  },
  significance: {
    kn: "ಮುಖದಲ್ಲಿ ಯಾವುದೇ ಅಶುಭ ಮಚ್ಚೆಗಳಿಲ್ಲದಿರುವುದು ಅತ್ಯುನ್ನತ ಸಾತ್ವಿಕ ತೇಜಸ್ಸಿನ ಸಂಕೇತ. ಬೃಹತ್ ಸಂಹಿತಾ ಹಾಗೂ ಭವಿಷ್ಯ ಪುರಾಣದ ಪ್ರಕಾರ ಇದು ಅಡೆತಡೆಗಳಿಲ್ಲದ ಪ್ರಾಣಶಕ್ತಿ ಪ್ರವಾಹ, ಶುದ್ಧ ನವಗ್ರಹ ಕಾಂತಿ ಹಾಗೂ ದೈವಿಕ ರಕ್ಷಣೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
    en: "The absence of dark blemish moles signifies a pure Sattvic aura. According to Brihat Samhita and Bhavishya Purana, an unblemished facial canvas indicates unhindered Pranic circulation, clean planetary radiation, and innate divine protection.",
    hi: "मुख पर किसी भी अशुभ तिल या दाग का न होना अत्यंत सात्विक तेज का द्योतक है। बृहत्संहिता के अनुसार यह अबाधित प्राणशक्ति प्रवाह, शुद्ध नवग्रह कांति एवं ईश्वरीय रक्षा का प्रतीक है।",
    te: "ముఖంపై ఎటువంటి మచ్చలు లేకపోవడం అత్యున్నత సాత్విక వర్చస్సుకు నిదర్శనం. బృహత్ సంహిత ప్రకారం ఇది నిరాటంక ప్రాణశక్తి ప్రవాహం, స్వచ్ఛమైన నవగ్రహ కాంతి & దైవిక రక్షణను తెలియజేస్తుంది.",
    ta: "முகத்தில் கரும்புள்ளிகள் அல்லது மச்சங்கள் இல்லாதிருப்பது தூய சாத்வீக தேஜஸின் அடையாளம். பிருஹத் சம்ஹிதையின்படி இது தடையற்ற பிராண சக்தி, தூய நவகிரக ஒளி மற்றும் இறை பாதுகாப்பைக் காட்டுகிறது."
  },
  spiritualBlessing: {
    kn: "ಶುದ್ಧ ಮುಖ ತೇಜಸ್ಸನ್ನು ವರ್ಧಿಸಲು ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ನಿತ್ಯ ಗಂಧ ಅಥವಾ ಕುಂಕುಮ ಧಾರಣೆ ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.",
    en: "To protect and enhance this clean Tejas, apply sacred sandalwood or kumkum at the Ajna chakra daily.",
    hi: "इस निर्मल तेज को बनाए रखने हेतु आज्ञा चक्र पर नित्य चंदन या कुंकुम धारण करना अत्यंत शुभ है।",
    te: "ఈ స్వచ్ఛమైన వర్చస్సును నిలబెట్టుకోవడానికి ఆజ్ఞా చక్రంలో రోజూ చందనం లేదా కుంకుమ ధరించడం శ్రేయస్కరం.",
    ta: "இந்த தூய தேஜஸை காக்க ஆக்ஞா சக்கரத்தில் தினமும் சந்தனம் அல்லது குங்குமம் அணிவது சிறந்தது."
  }
};

/** Canonical 4 Life Quadrants with pure localized titles and anatomical areas */
export const VEDIC_CHRONOLOGY_PHASES_L5 = [
  {
    phaseIndex: 0,
    phaseKey: "youth",
    title: {
      kn: "೧. ಯೌವನ & ವಿದ್ಯಾಭ್ಯಾಸ",
      en: "1. Youth & Foundation",
      hi: "१. यौवन एवं विद्याभ्यास",
      te: "౧. యవ్వనం & విద్యాభ్యాసం",
      ta: "1. இளமை & கல்விப் பருவம்"
    },
    defaultWindow: {
      kn: "೧ ರಿಂದ ೩೦ ವರ್ಷ",
      en: "1 to 30 Years",
      hi: "1 से 30 वर्ष",
      te: "1 నుండి 30 సంవత్సరాలు",
      ta: "1 முதல் 30 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ಲಲಾಟ & ಹಣೆಯ ರೇಖೆಗಳು (Forehead & Brow Ridge)",
      en: "Forehead & Brow Ridge",
      hi: "ललाट व भाल रेखाएं",
      te: "లలాటం & నుదుటి రేఖలు",
      ta: "நெற்றி & புருவ ரேகைகள்"
    }
  },
  {
    phaseIndex: 1,
    phaseKey: "career",
    title: {
      kn: "೨. ವೃತ್ತಿ ಉನ್ನತಿ & ವಿವಾಹ",
      en: "2. Career & Marriage",
      hi: "२. करियर उन्नति एवं विवाह",
      te: "౨. వృత్తి ఉన్నతి & వివాహం",
      ta: "2. தொழில் உயர்வு & திருமணம்"
    },
    defaultWindow: {
      kn: "೩೧ ರಿಂದ ೫೦ ವರ್ಷ",
      en: "31 to 50 Years",
      hi: "31 से 50 वर्ष",
      te: "31 నుండి 50 సంవత్సరాలు",
      ta: "31 முதல் 50 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ನೇತ್ರ, ನಾಸಿಕ & ಭ್ರೂಮಧ್ಯ (Eyes, Nose Bridge & Ajna)",
      en: "Eyes, Nose Bridge & Ajna Center",
      hi: "नेत्र, नासिका व आज्ञा चक्र",
      te: "నేత్రాలు, నాసిక & ఆజ్ఞా చక్రం",
      ta: "கண்கள், மூக்கு & ஆக்ஞா மத்தி"
    }
  },
  {
    phaseIndex: 2,
    phaseKey: "wealth",
    title: {
      kn: "೩. ಧನ ಸಮೃದ್ಧಿ & ಭಾಗ್ಯೋದಯ",
      en: "3. Peak Wealth & Assets",
      hi: "३. धन समृद्धि एवं भाग्योदय",
      te: "౩. ధన సమృద్ధి & భాగ్యోదయం",
      ta: "3. தன வளம் & பாக்கியோதயம்"
    },
    defaultWindow: {
      kn: "೫೧ ರಿಂದ ೭೦ ವರ್ಷ",
      en: "51 to 70 Years",
      hi: "51 से 70 वर्ष",
      te: "51 నుండి 70 సంవత్సరాలు",
      ta: "51 முதல் 70 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ನಾಸಿಕ ತುದಿ, ಗಂಡಸ್ಥಳ & ಓಷ್ಠ (Cheeks & Wealth Vault)",
      en: "Nose Tip, Cheeks & Mouth Contour",
      hi: "नासिका अग्र, कपोल व मुख",
      te: "నాసికాగ్రం, చెంపలు & ముఖ పరిధి",
      ta: "மூக்கு நுனி, கன்னங்கள் & உதடுகள்"
    }
  },
  {
    phaseIndex: 3,
    phaseKey: "legacy",
    title: {
      kn: "೪. ಕೀರ್ತಿ & ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ",
      en: "4. Legacy & Spiritual Peace",
      hi: "४. कीर्ति एवं आत्मिक शांति",
      te: "౪. కీర్తి & ప్రశాంతత",
      ta: "4. புகழ் & ஆத்ம சாந்தி"
    },
    defaultWindow: {
      kn: "೭೧ ರಿಂದ ೧೦೦ ವರ್ಷ",
      en: "71 to 100 Years",
      hi: "71 से 100 वर्ष",
      te: "71 నుండి 100 సంవత్సరాలు",
      ta: "71 முதல் 100 ஆண்டுகள்"
    },
    facialArea: {
      kn: "ಚಿಬುಕ, ಕರ್ಣ & ಮುಖ ಪರಿಧಿ (Chin & Ears)",
      en: "Chin, Jawline & Ears",
      hi: "चिबुक, जबड़ा व कर्ण",
      te: "చిబుకం, దవడ & కర్ణాలు",
      ta: "தாடை & காதுகள்"
    }
  }
];

/** Archetype-specific dynamic milestone predictions (5 archetypes x 4 phases = 20 distinct predictions) */
export const VEDIC_CHRONOLOGY_PREDICTIONS_BY_ARCHETYPE: Record<
  string,
  Record<number, Record<string, string>>
> = {
  hamsa: {
    0: {
      kn: "ಗುರು ಗ್ರಹದ ಅನುಗ್ರಹದಿಂದ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ, ಶಾಸ್ತ್ರ ಜ್ಞಾನ, ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಗೌರವ ಹಾಗೂ ನೈತಿಕ ಮಾರ್ಗದಲ್ಲಿ ವೃತ್ತಿ ಪ್ರವೇಶ.",
      en: "Jupiter's benevolence grants outstanding scholarly achievement, academic honors, moral integrity, and early intellectual distinction.",
      hi: "बृहस्पति की कृपा से उच्च विद्याभ्यास, शास्त्रीय ज्ञान, शैक्षणिक सम्मान एवं नैतिक मूल्यों से करियर का शुभारंभ।",
      te: "బృహస్పతి అనుగ్రహంతో ఉన్నత విద్య, విజ్ఞానం, విద్యా సంస్థలలో గౌరవం & ధర్మ మార్గంలో వృత్తి జీవితారంభం.",
      ta: "குருவருளால் உயர்கல்வி சாதனை, சாஸ்திர ஞானம், கல்விச் சிறப்பு மற்றும் நேர்மையான வழியில் தொழில் தொடக்கம்."
    },
    1: {
      kn: "ಸಮಾಜದಲ್ಲಿ ಗಣ್ಯ ಗೌರವ, ಮಾರ್ಗದರ್ಶಕ ಅಥವಾ ಆಡಳಿತಾತ್ಮಕ ಪದವಿ, ಸತ್ಕುಲದೊಂದಿಗೆ ವಿವಾಹ ಯೋಗ ಹಾಗೂ ದೂರ ಪ್ರಯಾಣಗಳಿಂದ ಕೀರ್ತಿ.",
      en: "Societal reverence, executive mentorship roles, auspicious marriage into an honorable family, and widespread renown through travel.",
      hi: "विशिष्ट सामाजिक प्रतिष्ठा, मार्गदर्शक या प्रशासनिक दायित्व, कुलीन परिवार में विवाह सुख एवं प्रतिष्ठा वृद्धि।",
      te: "సమాజంలో విశిష్ట గౌరవం, ఉన్నత సలహాదారు పదవి, సత్కులంలో వివాహం & దూర ప్రయాణాలతో విశేష ఖ్యాతి.",
      ta: "சமூகத்தில் தனி மதிப்பு, உயர் வழிகாட்டி பதவி, நற்குடும்பத்தில் திருமண யோகம் மற்றும் தூரப் பயணங்களால் பெருமை."
    },
    2: {
      kn: "ಬೃಹತ್ ಜ್ಞಾನ ಬಲದಿಂದ ಸ್ಥಿರಾಸ್ತಿ ನಿರ್ಮಾಣ, ಸಾರ್ವಜನಿಕ ಸಂಸ್ಥೆಗಳ ನೇತೃತ್ವ ಹಾಗೂ ಧಾರ್ಮಿಕ ಕಾರ್ಯಗಳಿಂದ ಕುಬೇರ ಸಂಪತ್ತು.",
      en: "Materialization of permanent real estate through wisdom, institutional leadership, and dharmic philanthropy creating stable wealth.",
      hi: "विशाल ज्ञान बल से अचल संपत्ति निर्माण, संस्थागत नेतृत्व एवं धर्म कार्यों द्वारा स्थायी कुबेर संपदा।",
      te: "విజ్ఞాన బలంతో స్థిరాస్తి నిర్మాణం, సంస్థాగత నాయకత్వం & ధార్మిక సేవల ద్వారా కుబేర భాగ్య సంపద.",
      ta: "ஞான பலத்தால் சொந்த நிலம், சொத்து சேர்க்கை, நிறுவன தலைமை மற்றும் அறப்பணிகளால் நீடித்த குபேர ஐஸ்வர்யம்."
    },
    3: {
      kn: "ಆಧ್ಯಾತ್ಮಿಕ ಪಕ್ವತೆ, ಪೂಜ್ಯ ಗುರುಸ್ಥಾನ, ಸತ್ಸಂತಾನದ ಅಭ್ಯುದಯ ಹಾಗೂ ದೈವಿಕ ತೃಪ್ತಿಯೊಂದಿಗೆ ಆರೋಗ್ಯಪೂರ್ಣ ದೀರ್ಘಾಯುಷ್ಯ.",
      en: "Venerated elder stature, spiritual mastery, immense contentment from accomplished children, and serene healthy longevity.",
      hi: "आध्यात्मिक परिपक्वता, पूज्य गुरुपद, सुसंतान की उन्नति एवं आत्मिक तृप्ति के साथ रोगमुक्त दीर्घायु।",
      te: "ఆధ్యాత్మిక పరిపూర్ణత, పూజనీయ గురుస్థానం, ఉత్తమ సంతాన ప్రగతి & ఆత్మానందంతో కూడిన దీర్ఘాయుష్షు.",
      ta: "ஆன்மீக முதிர்ச்சி, மதிப்புமிக்க குரு ஸ்தானம், நன்மக்களின் பெருமை மற்றும் மன அமைதியுடன் கூடிய நீண்ட ஆயுள்."
    }
  },
  ruchaka: {
    0: {
      kn: "ಕುಜ ಗ್ರಹದ ಸಾಹಸದಿಂದ ಕ್ರೀಡೆ, ತಾಂತ್ರಿಕ ವಿದ್ಯೆ, ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ದಿಗ್ವಿಜಯ ಹಾಗೂ ಸ್ವಂತ ಧೈರ್ಯದಿಂದ ಕಾರ್ಯಾರಂಭ.",
      en: "Martian courage fuels competitive victories, technical mastery, physical vitality, and self-made early accomplishments.",
      hi: "मंगल के पराक्रम से खेल, तकनीकी विद्या, प्रतियोगी परीक्षाओं में विजय एवं अदम्य साहस से करियर प्रारंभ।",
      te: "కుజ పరాక్రమంతో క్రీడలు, సాంకేతిక విద్య, పోటీ పరీక్షలలో విజయం & స్వశక్తితో సాహసోపేత ఆరంభం.",
      ta: "செவ்வாய் பலத்தால் விளையாட்டு, தொழில்நுட்பக் கல்வி, போட்டித் தேர்வுகளில் வெற்றி மற்றும் தன்னம்பிக்கையுடன் துவக்கம்."
    },
    1: {
      kn: "ರಕ್ಷಣಾ, ತಂತ್ರಜ್ಞಾನ ಅಥವಾ ಉದ್ಯಮ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅಧಿಕಾರ, ಸ್ಥಿರ ಭೂಮಿ ಖರೀದಿ, ದೃಢ ಸಂಗಾತಿಯೊಂದಿಗೆ ದಾಂಪತ್ಯ ಯೋಗ.",
      en: "Commanding authority in engineering, executive defense or business, significant land acquisition, and dynamic marital partnership.",
      hi: "प्रौद्योगिकी, उद्योग या साहसिक कार्यों में उच्च अधिकार, भूमि क्रय एवं तेजस्वी जीवनसाथी का संग।",
      te: "సాంకేతికత లేదా వ్యాపార రంగంలో విశేష అధికారం, భూమి కొనుగోలు & దృఢ సంకల్పంగల భాగస్వామితో వివాహం.",
      ta: "தொழில்நுட்பம், தொழில் அல்லது நிர்வாகத்தில் தலைமை அதிகாரம், பூமி சேர்க்கை மற்றும் ஆற்றல்மிகு துணை."
    },
    2: {
      kn: "ಬೃಹತ್ ಕೈಗಾರಿಕೆ ಅಥವಾ ಭೂ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಅಪಾರ ಲಾಭ, ಶತ್ರುಗಳ ಮೇಲೆ ಜಯ ಹಾಗೂ ಪ್ರಭಾವಶಾಲಿ ಸಾಮಾಜಿಕ ಶಕ್ತಿ.",
      en: "Peak wealth through enterprise and property ventures, complete triumph over competitive obstacles, and commanding social influence.",
      hi: "उद्योग या भू-संपदा में अपार धन लाभ, प्रतिस्पर्धियों पर विजय एवं शक्तिशाली सामाजिक प्रतिष्ठा।",
      te: "పరిశ్రమలు లేదా భూ సంబంధిత రంగాలలో విశేష లాభం, శత్రు జయం & తిరుగులేని సామాజిక ప్రభావం.",
      ta: "தொழில் மற்றும் ரியல் எஸ்டேட் வழிகளில் உச்சக்கட்ட தன லாபம், போட்டிகளில் வெற்றி மற்றும் வலிமையான சமூக மதிப்பு."
    },
    3: {
      kn: "ಧೀರ ನಾಯಕತ್ವದ ಕೀರ್ತಿ, ಕುಟುಂಬಕ್ಕೆ ಕವಚದಂತಹ ರಕ್ಷಣೆ, ನಿವೃತ್ತಿಯಲ್ಲೂ ದೈಹಿಕ ಚುರುಕುತನ ಹಾಗೂ ಯಶಸ್ವಿ ಜೀವನ ತೃಪ್ತಿ.",
      en: "Enduring heroic legacy, steadfast patriarch/matriarch protection of the lineage, lifelong vigor, and honorable peace.",
      hi: "साहसी नेतृत्व की कीर्ति, परिवार की सुदृढ़ सुरक्षा, निरंतर शारीरिक स्फूर्ति एवं जीवन की पूर्ण सार्थकता।",
      te: "సాహసోపేత నాయకత్వ కీర్తి, వంశానికి రక్షణగా నిలవడం, వయసు మళ్లినా శారీరక చురుకుదనం & ధన్య జీవనం.",
      ta: "துணிச்சலான தலைமைப் புகழ், குடும்பத்திற்கு அரணாக விளங்குதல், இறுதிவரை உடல் சுறுசுறுப்பு மற்றும் நிறைவான வாழ்வு."
    }
  },
  bhadra: {
    0: {
      kn: "ಬುಧ ಗ್ರಹದ ಕೃಪೆಯಿಂದ ಅದ್ಭುತ ವಾಕ್ಚಾತುರ್ಯ, ಗಣಿತ-ವಾಣಿಜ್ಯ ಪ್ರಾವೀಣ್ಯ, ಯುವ ವಯಸ್ಸಿನಲ್ಲೇ ನವೀನ ಆಲೋಚನೆಗಳಿಂದ ಸ್ವಾವಲಂಬನೆ.",
      en: "Mercurial eloquence brings analytical brilliance, commercial aptitude, rapid mathematical wit, and inventive enterprise.",
      hi: "बुध के प्रभाव से असाधारण वाकपटुता, गणित व वाणिज्य में निपुणता एवं अल्पायु में ही नवाचार से स्वावलंबन।",
      te: "బుధ గ్రహ కటాక్షంతో అద్భుత వాక్చాతుర్యం, గణిత-వాణిజ్య ప్రావీణ్యం & చిన్న వయసులోనే వినూత్న ఆలోచనలతో విజయం.",
      ta: "புதன் அருளால் சிறந்த நாவன்மை, கணித-வணிகத் தேர்ச்சி மற்றும் இளமையிலேயே புதிய சிந்தனைகளால் சுய முன்னேற்றம்."
    },
    1: {
      kn: "ಸಂವಹನ, ತಂತ್ರಜ್ಞಾನ, ಲೆಕ್ಕಪತ್ರ ಅಥವಾ ವಾಣಿಜ್ಯದಲ್ಲಿ ಶೀಘ್ರ ಬಡ್ತಿ, ವಿದೇಶ ಪ್ರಯಾಣ ಹಾಗೂ ಬುದ್ಧಿವಂತ ಸಂಗಾತಿಯೊಂದಿಗೆ ವಿವಾಹ.",
      en: "Rapid career ascent in commerce, analytics, communication or tech, international exposure, and an intellectually compatible union.",
      hi: "संचार, प्रौद्योगिकी, वित्त अथवा व्यापार में द्रुत पदोन्नति, विदेश यात्राएं एवं विदुषी जीवनसाथी का सानिध्य।",
      te: "సమాచార రంగం, వాణిజ్యం లేదా సాంకేతికతలో శీఘ్ర పదోన్నతి, విదేశీ ప్రయాణాలు & మేధావియైన భాగస్వామితో వివాహం.",
      ta: "தகவல் தொழில்நுட்பம், நிதி அல்லது வர்த்தகத்தில் விரைவான பதவி உயர்வு, வெளிநாட்டுப் பயணம் மற்றும் அறிவார்ந்த துணை."
    },
    2: {
      kn: "ಬಹುಮುಖ ವ್ಯಾಪಾರ ವಿಸ್ತರಣೆ, ಹೂಡಿಕೆಗಳಿಂದ ಅದ್ಭುತ ಆದಾಯ, ಲಿಖಿತ ಕೃತಿಗಳು ಅಥವಾ ಸಂಶೋಧನೆಯಿಂದ ಶಾಶ್ವತ ಧನ ಸಂಪತ್ತು.",
      en: "Diversified investments and commercial syndicates yielding compounding wealth, publishing/intellectual IP returns, and financial independence.",
      hi: "बहुमुखी व्यापार विस्तार, बौद्धिक निवेशों से प्रचंड लाभ एवं लेखन या शोध द्वारा स्थायी संपत्ति योग।",
      te: "బహుముఖ వ్యాపార విస్తరణ, తెలివైన పెట్టుబడులతో విశేష రాబడి & మేధో సంపత్తి ద్వారా శాశ్వత సంపద.",
      ta: "பல்வேறு தொழில் விரிவாக்கம், முதலீடுகளில் அபார லாபம் மற்றும் அறிவுசார் படைப்புகளால் நீடித்த செல்வ வளம்."
    },
    3: {
      kn: "ಸದಾ ತಾರುಣ್ಯಪೂರ್ಣ ಮನಸ್ಸು, ಮೊಮ್ಮಕ್ಕಳೊಂದಿಗೆ ಸಂತಸ, ಸಾಹಿತ್ಯ-ಶಾಸ್ತ್ರ ಚಿಂತನೆ ಹಾಗೂ ಆನಂದದಾಯಕ ದೀರ್ಘಾಯುಷ್ಯ.",
      en: "Evergreen mental youthfulness, joyous bonding with descendants, literary and philosophical contentment, and clear healthy longevity.",
      hi: "सदा युवा विचार, पौत्र-पौत्रियों के साथ मधुर समय, साहित्य व तत्व चिंतन तथा आनंदमयी दीर्घायु।",
      te: "సదా నవయవ్వన ఆలోచనలు, మనవలు-మనవరాండ్రతో ఆనందం, సాహిత్య-శాస్త్ర చింతన & ప్రశాంత దీర్ಘాయుష్షు.",
      ta: "எப்போதும் இளமையான உற்சாக மனம், பேரக்குழந்தைகளுடன் மகிழ்ச்சி, ஆன்மீக நூல் சிந்தனை மற்றும் நிறைவான நீண்ட வாழ்வு."
    }
  },
  malavya: {
    0: {
      kn: "ಶುಕ್ರ ಗ್ರಹದ ಅನುಗ್ರಹದಿಂದ ಕಲಾತ್ಮಕ ಸೌಂದರ್ಯ, ಸಾಹಿತ್ಯ-ಸಂಗೀತ ಪ್ರೀತಿ, ಆಕರ್ಷಕ ವ್ಯಕ್ತಿತ್ವ ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಜನಪ್ರಿಯತೆ.",
      en: "Venusian grace bestows artistic refinement, aesthetic sensibilities, magnetic personal charm, and early popularity.",
      hi: "शुक्र के वरदान से कलात्मक अभिरुचि, सौंदर्य-साहित्य प्रेम, आकर्षक व्यक्तित्व एवं जनप्रियता का उदय।",
      te: "శుక్ర అనుగ్రహంతో కళా నైపుణ్యం, సంగీత-సాహిత్య ప్రీతి, ఆకర్షణీయమైన వ్యక్తిత్వం & విశేష ప్రజాదరణ.",
      ta: "சுக்கிரன் அருளால் கலை நயம், இலக்கிய ஆர்வம், வசீகர ஆளுமை மற்றும் இளமையிலேயே சமூக செல்வாக்கு."
    },
    1: {
      kn: "ಅತ್ಯಂತ ಸುಂದರ ಗೃಹ ನಿರ್ಮಾಣ, ವಾಹನ ಸೌಖ್ಯ, ಪರಸ್ಪರ ಪ್ರೇಮಪೂರ್ಣ ದಾಂಪತ್ಯ ಜೀವನ ಹಾಗೂ ಸೌಂದರ್ಯ/ಆಡಳಿತ ಕ್ಷೇತ್ರದಲ್ಲಿ ಯಶಸ್ಸು.",
      en: "Luxurious architectural homes, premium conveyances, deeply loving marital harmony, and flourishing success in creative or luxury domains.",
      hi: "भव्य भवन निर्माण, उत्तम वाहन सुख, अत्यंत प्रेमपूर्ण वैवाहिक जीवन एवं कलात्मक या प्रशासनिक सफलता।",
      te: "సుందర గృహ నిర్మాణం, వాహన సౌఖ్యం, అన్యోన్య దాంపత్యం & కళాత్మక లేదా వ్యాపార రంగాలలో ఉన్నతి.",
      ta: "அழகிய சொந்த இல்லம், வாகன யோகம், பிரியமான இல்லற வாழ்க்கை மற்றும் கலை/நிர்வாகத் துறைகளில் சிறப்பு."
    },
    2: {
      kn: "ಸಕಲ ಭೋಗಭಾಗ್ಯಗಳು, ಚಿನ್ನ-ಬೆಳ್ಳಿ-ರತ್ನ ಸಂಗ್ರಹ, ಅತಿಥಿ ಸತ್ಕಾರದಿಂದ ಮನ್ನಣೆ ಹಾಗೂ ಕುಬೇರ ಲಕ್ಷ್ಮೀ ಕೃಪಾ ಕಟಾಕ್ಷ.",
      en: "Abundant prosperity, accumulation of precious assets and jewelry, gracious hospitality earning societal devotion, and steady Lakshmi Kataksha.",
      hi: "समस्त भौतिक सुख-सुविधाएं, स्वर्ण-रत्न संचय, आतिथ्य सत्कार से यश एवं साक्षात लक्ष्मी कृपा का अनुभव।",
      te: "సకల భోగభాగ్యాలు, స్వర్ణ-రత్న ఆభరణాల సంపద, అతిథి సత్కారాలతో విశేష గౌరవం & శ్రీ మహాలక్ష్మి అనుగ్రహం.",
      ta: "அனைத்து போக பாக்கியங்கள், தங்க-நகை சேர்க்கை, உபசரிப்பால் சமூகப் புகழ் மற்றும் நிலைத்த லட்சுமி கடாட்சம்."
    },
    3: {
      kn: "ಆನಂದಮಯ ನಿವೃತ್ತಿ, ಶಾಂತಿಯುತ ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ, ಸೌಮ್ಯ ತೇಜಸ್ಸಿನ ಮುಖಕಾಂತಿ ಹಾಗೂ ತೃಪ್ತಿದಾಯಕ ದೀರ್ಘಾಯುಷ್ಯ.",
      en: "Blissful family serenity, serene spiritual grace, unclouded luminous countenance, and peaceful, celebrated longevity.",
      hi: "परम शांतिपूर्ण पारिवारिक सुख, सौम्य कांति, आध्यात्मिक संतोष एवं गरिमामयी रोगमुक्त दीर्घायु।",
      te: "ప్రశాంత కుటుంబ సౌఖ్యం, సౌమ్య వర్చస్సు, దైవచింతన & ఆనందకరమైన పరిపూర్ణ దీర్ఘాయుష్షు.",
      ta: "அமைதியான குடும்ப மகிழ்ச்சி, சாத்வீக முக ஒளி, தெய்வ பக்தி மற்றும் நிறைவான நல்வாழ்வு நீண்ட ஆயுள்."
    }
  },
  sasa: {
    0: {
      kn: "ಶನಿ ಗ್ರಹದ ಪ್ರಭಾವದಿಂದ ಗಂಭೀರ ಸ್ವಭಾವ, ಪರಿಶ್ರಮದ ಪಾಠಗಳು, ತಾಳ್ಮೆಯಿಂದ ಕಷ್ಟಗಳನ್ನು ಮೆಟ್ಟಿ ನಿಲ್ಲುವ ಶಕ್ತಿ ಹಾಗೂ ಸ್ವಂತ ಬಲದಿಂದ ಏಳಿಗೆ.",
      en: "Saturnian discipline instills grounded resilience, relentless work ethic, unyielding patience, and self-forged tenacity.",
      hi: "शनि के प्रभाव से गंभीर स्वभाव, श्रम साधना, धैर्य से संकटों पर विजय एवं आत्मबल से आत्मनिर्भरता।",
      te: "శని ప్రభావంతో క్రమశిక్షణ, నిరంతర శ్రమ, అపార సహనంతో కష్టాలను జయించడం & స్వశక్తితో ప్రగతి.",
      ta: "சனி பகவான் ஆதிக்கத்தால் ஒழுக்கம், கடின உழைப்பு, விடாமுயற்சியால் சோதனைகளை வெல்லுதல் மற்றும் சுய உழைப்பில் உயர்வு."
    },
    1: {
      kn: "ಕಠಿಣ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಉನ್ನತ ನ್ಯಾಯ, ಆಡಳಿತ ಅಥವಾ ಕೈಗಾರಿಕಾ ಅಧಿಕಾರ ಪ್ರಾಪ್ತಿ, ಗಂಭೀರ ಹಾಗೂ ನಂಬಿಕಸ್ಥ ಸಂಗಾತಿಯ ಸಾಂಗತ್ಯ.",
      en: "Just reward for disciplined persistence via judicial, industrial or governance elevation, accompanied by a loyal, steadfast partner.",
      hi: "दीर्घ परिश्रम के उपरांत न्याय, प्रशासन या उद्योग में सर्वोच्च अधिकार एवं निष्ठावान जीवनसाथी का साथ।",
      te: "శ్రమకు తగిన న్యాయం, పరిపాలన లేదా పారిశ్రామిక అధికార ప్రాప్తి & నమ్మకమైన భాగస్వామి తోడ్పాటు.",
      ta: "விடாமுயற்சிக்கு ஏற்ப நீதி, நிர்வாகம் அல்லது தொழில்துறை அதிகாரம் மற்றும் உண்மையான வாழ்க்கைத்துணை."
    },
    2: {
      kn: "ದೊಡ್ಡ ಪ್ರಮಾಣದ ಭೂಮಿ, ಗಣಿ ಅಥವಾ ಸ್ಥಿರಾಸ್ತಿಗಳ ಒಡೆತನ, ಸಾರ್ವಜನಿಕ ಸೇವೆ, ಕಾರ್ಮಿಕರ ನೇತೃತ್ವ ಹಾಗೂ ಅಚಲ ಧನಭದ್ರತೆ.",
      en: "Vast real estate, foundational industries or civic governance, stewardship over large workforces, and unshakable financial security.",
      hi: "विशाल भू-संपत्ति या अचल संपदा पर आधिपत्य, लोकसेवा, जनसमूह का नेतृत्व एवं अटूट आर्थिक सुरक्षा।",
      te: "విస్తారమైన భూములు లేదా స్థిరాస్తుల యాజమాన్యం, ప్రజాసేవ, కార్మిక నాయకత్వం & తిరుగులేని ఆర్థిక భద్రత.",
      ta: "அளப்பரிய பூமி, சொத்துக்களின் உரிமை, மக்கள் சேவை, ஊழியர் தலைமை மற்றும் அசைக்க முடியாத நிதி பலம்."
    },
    3: {
      kn: "ಪರಮ ತ್ಯಾಗ ಮತ್ತು ತಪಸ್ಸಿನ ಫಲ, ಸಮಾಜಕ್ಕೆ ಶಾಶ್ವತ ಕೊಡುಗೆ, ಆಧ್ಯಾತ್ಮಿಕ ವೈರಾಗ್ಯ ಸಿದ್ಧಿ ಹಾಗೂ ದೀರ್ಘಾಯುಷ್ಯದ ಸಂಪೂರ್ಣ ಶಾಂತಿ.",
      en: "Ascetic wisdom, permanent philanthropic monuments to posterity, spiritual transcendence, and venerable, peaceful longevity.",
      hi: "परम तप व सेवा का फल, समाज को अमर योगदान, आध्यात्मिक वैराग्य एवं दीर्घायु की परम शांति।",
      te: "సేవా తత్పరతకు సత్ఫలితం, సమాజానికి శాశ్వత మేలు, ఆధ్యాత్మిక వైరాగ్యం & ప్రశాంత దీర్ఘాయుష్షు.",
      ta: "தியாக வாழ்வின் பலன், சமூகத்திற்கு நீடித்த பங்களிப்பு, ஆன்மீக பக்குவம் மற்றும் அமைதியான நீண்ட ஆயுள்."
    }
  }
};

/** Specialized 5-Language Remedies tailored to Dominant Archetype & Gokarna Mahabaleshwara Kshetra */
export const VEDIC_ARCHETYPE_REMEDIES_L5: Record<
  string,
  {
    deity: Record<string, string>;
    chant: string;
    sankalpa: Record<string, string>;
  }
> = {
  hamsa: {
    deity: {
      kn: "ಶ್ರೀ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ",
      en: "Sri Medha Dakshinamurthy & Gokarna Mahabaleshwara",
      hi: "श्री मेधा दक्षिणामूर्ति एवं गोकर्ण महाबलेश्वर",
      te: "శ్రీ మేధా దక్షిణామూర్తి & గోకర్ణ మహాబలేశ్వర",
      ta: "ஶ்ரீ மேதா தட்சிணாமூர்த்தி & கோகர்ண மகாபலேஸ்வரர்"
    },
    chant: "ॐ ನಮೋ ಭಗವತೇ ದಕ್ಷಿಣಾಮೂರ್ತಯೇ ಮಹ್ಯಂ ಮೇಧಾಂ ಪ್ರಜ್ಞಾಂ ಪ್ರಯಚ್ಛ ಸ್ವಾಹಾ",
    sankalpa: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯಲ್ಲಿ ಗುರು ಪ್ರೀತ್ಯರ್ಥವಾಗಿ ಮೇಧಾ ದಕ್ಷಿಣಾಮೂರ್ತಿ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ಶುದ್ಧ ಕೇಸರಿ ಗಂಧ ಧರಿಸಿ ಬೃಹಸ್ಪತಿ ಗಾಯತ್ರಿಯನ್ನು ಜಪಿಸಿ.",
      en: "Sponsor a sacred Medha Dakshinamurthy Sankalpa at Gokarna Mahabaleshwara temple, apply pure saffron-sandalwood at the Ajna chakra daily, and recite the Brihaspati Gayatri for intellectual mastery.",
      hi: "श्री गोकर्ण महाबलेश्वर सन्निधि में मेधा दक्षिणामूर्ति संकल्प पूजा कराएं, प्रतिदिन प्रातः आज्ञा चक्र पर शुद्ध केसर-चंदन लगाएं एवं बृहस्पति गायत्री का जप करें।",
      te: "గోకర్ణ మహాబలేశ్వర సన్నిధిలో మేధా దక్షిణామూర్తి సంకల్ప పూజ చేయించండి, ప్రతిరోజూ ఆజ్ఞా చక్రంలో కుంకుమపువ్వు కలిపిన చందనం ధరించి బృహస్పతి గాయత్రి జపించండి.",
      ta: "கோகர்ண மகாபலேஸ்வரர் சந்நிதியில் மேதா தட்சிணாமூர்த்தி சங்கல்ப பூஜை செய்து, தினமும் ஆக்ஞா சக்கரத்தில் குங்குமப்பூ சந்தனம் அணிந்து குரு காயத்ரி ஜபிக்கவும்."
    }
  },
  ruchaka: {
    deity: {
      kn: "ಶ್ರೀ ಸುಬ್ರಹ್ಮಣ್ಯ / ವೀರಭದ್ರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ",
      en: "Sri Subrahmanya / Veerabhadra & Gokarna Mahabaleshwara",
      hi: "श्री सुब्रह्मण्य / वीरभद्र एवं गोकर्ण महाबलेश्वर",
      te: "శ్రీ సుబ్రహ్మణ్య / వీరభద్ర & గోకర్ణ మహాబలేశ్వర",
      ta: "ஶ்ரீ சுப்பிரமணியர் / வீரபத்திரர் & கோகர்ண மகாபலேஸ்வரர்"
    },
    chant: "ॐ ಶರವಣಭವಾಯ ನಮಃ · ॐ ನಮೋ ಭಗವತೇ ರುದ್ರಾಯ",
    sankalpa: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಗೆ ಕುಜ ದೋಷ ಶಾಂತಿಗಾಗಿ ರುದ್ರಾಭಿಷೇಕ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸಿ, ಪ್ರತಿದಿನ ಪ್ರಾತಃಕಾಲ 'ಓಂ ಶರವಣಭವಾಯ ನಮಃ' ಜಪಿಸಿ ಹಾಗೂ ಭ್ರೂಮಧ್ಯದಲ್ಲಿ ಶುದ್ಧ ರಕ್ತಚಂದನ ಅಥವಾ ಕುಂಕುಮ ಧರಿಸಿ.",
      en: "Offer a Rudrabhisheka sankalpa at Gokarna Mahabaleshwara to channel Martian courage harmoniously, chant 'Om Sharavanabhavaya Namah' at sunrise, and wear sacred red sandalwood or kumkum.",
      hi: "गोकर्ण महाबलेश्वर को कुज शांति हेतु रुद्राभिषेक संकल्प अर्पित करें, प्रातः 'ॐ शरवणभवाय नमः' जपें एवं भाल पर शुद्ध रक्तचंदन अथवा कुंकुम धारण करें।",
      te: "గోకర్ణ మహాబలేశ్వరునికి కుజ శాంతి కోసం రుద్రాభిషేకం సమర్పించండి, ప్రాతఃకాలంలో 'ఓం శరవణభవాయ నమః' జపించి రక్తచందనం లేదా కుంకుమ ధరించండి.",
      ta: "கோகர்ண மகாபலேஸ்வரருக்கு செவ்வாய் தோஷ சாந்திக்காக ருத்ராபிஷேக சங்கல்பம் செய்து, தினமும் அதிகாலையில் 'ஓம் சரவணபவாய நம' ஜபித்து ரத்த சந்தனம் அணியவும்."
    }
  },
  bhadra: {
    deity: {
      kn: "ಶ್ರೀ ಮಹಾಗಣಪತಿ & ಶಾರದಾಂಬಾ (ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ)",
      en: "Sri Maha Ganapati & Sharadamba (Gokarna Kshetra)",
      hi: "श्री महागणपति एवं शारदांबा (गोकर्ण क्षेत्र)",
      te: "శ్రీ మహాగణపతి & శారదాంబ (గోకర్ణ క్షేత్రం)",
      ta: "ஶ்ரீ மகா கணபதி & சாரதாம்பாள் (கோகர்ண க்ஷேத்திரம்)"
    },
    chant: "ॐ ಐಂ ಗಂ ಗಣಪತಯೇ ವರವರದ ಸರ್ವಜನಂ ಮೇ ವಶಮಾನಯ ಸ್ವಾಹಾ",
    sankalpa: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಗಣಪತಿಗೆ ಅಥರ್ವಶೀರ್ಷ ಅಭಿಷೇಕ ಸಂಕಲ್ಪ ಸಲ್ಲಿಸಿ, ಪ್ರತಿ ಬುಧವಾರ ಪ್ರಾತಃಕಾಲ 'ಬುಧ ಗಾಯತ್ರೀ' ಮಂತ್ರವನ್ನು ೨೧ ಬಾರಿ ಜಪಿಸಿ ಹಾಗೂ ಶುದ್ಧ ತುಳಸಿ ದಳಗಳನ್ನು ಸೇವಿಸಿ.",
      en: "Perform an Atharvashirsha sankalpa at Gokarna Maha Ganapati, chant the Budha Gayatri 21 times every Wednesday, and consume sacred sanctified Tulasi leaves daily for clear analytical eloquence.",
      hi: "गोकर्ण महागणपति को अथर्वशीर्ष अभिषेक संकल्प समर्पित करें, प्रत्येक बुधवार 'बुध गायत्री' 21 बार जपें एवं पवित्र तुलसी दल ग्रहण करें।",
      te: "గోకర్ణ మహాగణపతికి అథర్వశీర్ష అభిషేక సంకల్పం చేయించండి, ప్రతి బుధవారం 'బుధ గాయత్రి' 21 సార్లు జపించి పవిత్ర తులసి తీర్థం స్వీకరించండి.",
      ta: "கோகர்ண மகா கணபதிக்கு அதர்வசீரிஷ அபிஷேக சங்கல்பம் செய்து, புதன்கிழமைகளில் 'புதன் காயத்ரி' 21 முறை ஜபித்து துளசி தீர்த்தம் பருகவும்."
    }
  },
  malavya: {
    deity: {
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ",
      en: "Sri Mahalakshmi & Gokarna Mahabaleshwara",
      hi: "श्री महालक्ष्मी एवं गोकर्ण महाबलेश्वर",
      te: "శ్రీ మహాలక్ష్మి & గోకర్ణ మహాబలేశ్వర",
      ta: "ஶ்ரீ மகாலட்சுமி & கோகர்ண மகாபலேஸ்வரர்"
    },
    chant: "ॐ ಶ್ರೀಂ ಹ್ರೀಂ ಕ್ಲೀಂ ಕಮಲವಾಸಿನಿ ಸ್ವಾಹಾ",
    sankalpa: {
      kn: "ಗೋಕರ್ಣ ಸನ್ನಿಧಿಯಲ್ಲಿ ಮಹಾಲಕ್ಷ್ಮೀ ಕುಂಕುಮಾರ್ಚನೆ ಸಂಕಲ್ಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ಶುಕ್ರವಾರ ಶ್ರೀ ಸೂಕ್ತ ಪಠಿಸಿ ಮತ್ತು ಆಜ್ಞಾ ಚಕ್ರದಲ್ಲಿ ಶುದ್ಧ ಶ್ರೀಗಂಧ ತಿಲಕ ಧರಿಸಿ ಸೌಮ್ಯ ತೇಜಸ್ಸನ್ನು ವರ್ಧಿಸಿಕೊಳ್ಳಿ.",
      en: "Sponsor a Sri Mahalakshmi Kumkumarchana at Gokarna Kshetra, recite Sri Suktam on Fridays, and wear pure white sandalwood paste to preserve magnetic auspicious grace.",
      hi: "गोकर्ण क्षेत्र में महालक्ष्मी कुंकुमार्चन संकल्प कराएं, शुक्रवार को श्री सूक्त पाठ करें एवं आज्ञा चक्र पर श्वेत चंदन धारण कर सौम्य तेज बढ़ाएं।",
      te: "గోకర్ణ క్షేత్రంలో మహాలక్ష్మి కుంకుమార్చన సంకల్పం చేయించండి, శుక్రవారాల్లో శ్రీ సూక్తం పఠించి ఆజ్ఞా చక్రంలో తెల్ల చందనం ధరించండి.",
      ta: "கோகர்ண சந்நிதியில் மகாலட்சுமி குங்குமார்ச்சனை சங்கல்பம் செய்து, வெள்ளிக்கிழமைகளில் ஸ்ரீ சூக்தம் பாராயணம் செய்து தூய வெண் சந்தனம் அணியவும்."
    }
  },
  sasa: {
    deity: {
      kn: "ಶ್ರೀ ಶನೈಶ್ಚರ & ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ (ಆತ್ಮಲಿಂಗ)",
      en: "Sri Shanaishchara & Gokarna Mahabaleshwara (Atmalinga)",
      hi: "श्री शनैश्चर एवं गोकर्ण महाबलेश्वर (आत्मलिंग)",
      te: "శ్రీ శనైశ్చర & గోకర్ణ మహాబలేశ్వర (ఆత్మలింగం)",
      ta: "ஶ்ரீ சனீஸ்வரர் & கோகர்ண மகாபலேஸ்வரர் (ஆத்மலிங்கம்)"
    },
    chant: "ॐ ಪ್ರಾಂ ಪ್ರೀಂ ಪ್ರೌಂ ಸಃ ಶನೈಶ್ಚರಾಯ ನಮಃ · ॐ ನಮಃ ಶಿವಾಯ",
    sankalpa: {
      kn: "ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಎಳ್ಳೆಣ್ಣೆ ದೀಪ ಸೇವೆ ಸಲ್ಲಿಸಿ, ನಿತ್ಯ ಸಾಯಂಕಾಲ 'ಓಂ ನಮಃ ಶಿವಾಯ' ಜಪಿಸಿ ಬಡವರಿಗೆ ಅಥವಾ ವೃದ್ಧರಿಗೆ ಅನ್ನದಾನ ಮಾಡಿ.",
      en: "Sponsor a sacred Rudrabhisheka to the Atmalinga at Gokarna Mahabaleshwara, light sesame oil lamps, chant 'Om Namah Shivaya' daily at dusk, and practice charitable food donation to honor Saturnian karma.",
      hi: "गोकर्ण महाबलेश्वर आत्मलिंग को रुद्राभिषेक एवं तिल तैल दीप अर्पित करें, नित्य सांध्यकाल 'ॐ नमः शिवाय' जपें तथा निर्धनों को अन्नदान करें।",
      te: "గోకర్ణ మహాబలేశ్వర ఆత్మలింగానికి రుద్రాభిషేకం & నువ్వుల నూనె దీపారాధన చేయించండి, రోజూ సాయంత్రం 'ఓం నమః శివాయ' జపించి అన్నదానం చేయండి.",
      ta: "கோகர்ண மகாபலேஸ்வரர் ஆத்மலிங்கத்திற்கு ருத்ராபிஷேகம் மற்றும் நல்லெண்ணெய் தீபம் ஏற்றி, மாலையில் 'ஓம் நம சிவாய' ஜபித்து அன்னதானம் செய்யவும்."
    }
  }
};

/** 4 Classical Philtrum (Brahma Rekha) Variations with 5-Language Depth & Vitality */
export const VEDIC_PHILTRUM_VARIATIONS_L5 = [
  {
    type: "deep_parallel",
    structure: {
      kn: "ಆಳವಾದ ಹಾಗೂ ಸಮಾಂತರವಾದ ಬ್ರಹ್ಮ ರೇಖೆ (Deep & Parallel)",
      en: "Deep, straight and symmetrical Brahma Rekha",
      hi: "गहरी एवं समानांतर ब्रह्म रेखा",
      te: "లోతైన & సమాంతర బ్రహ్మ రేఖ",
      ta: "ஆழமான மற்றும் நேரான பிரம்ம ரேகை"
    },
    indication: {
      kn: "ಅತ್ಯುತ್ತಮ ಪ್ರಾಣಶಕ್ತಿ, ಅಖಂಡ ಆಯುಷ್ಯ, ಸುದೃಢ ಸಂತಾನ ಭಾಗ್ಯ ಹಾಗೂ ಸಾತ್ವಿಕ ಚೈತನ್ಯ.",
      en: "Exceptional prana vitality, long life, auspicious progeny blessings, and pure vigor.",
      hi: "उत्कृष्ट प्राणशक्ति, अखंड दीर्घायु, शुभ संतान योग एवं सात्विक तेज।",
      te: "అత్యుత్తమ ప్రాణశక్తి, దీర్ఘాయుష్షు, శుభ సంతాన భాగ్యం & సాత్విక చైతన్యం.",
      ta: "சிறந்த பிராண சக்தி, நீண்ட ஆயுள், நன்மக்கட்பேறு மற்றும் சாத்வீக ஆற்றல்."
    }
  },
  {
    type: "flaring_kuber",
    structure: {
      kn: "ಕೆಳಭಾಗದಲ್ಲಿ ವಿಶಾಲವಾಗುವ ಕುಬೇರ ಬ್ರಹ್ಮ ರೇಖೆ (Flaring Base)",
      en: "Downward-flaring Brahma Rekha (Kuber Sthana)",
      hi: "नीचे की ओर विस्तृत कुबेर ब्रह्म रेखा",
      te: "క్రింది భాగంలో వెడల్పయిన కుబేర బ్రహ్మ రేఖ",
      ta: "கீழ்ப்பகுதியில் அகன்ற குபேர பிரம்ம ரேகை"
    },
    indication: {
      kn: "ಮಧ್ಯ ವಯಸ್ಸಿನ ನಂತರ ಅಪಾರ ಧನ ಸಂಗ್ರಹ, ಸ್ಥಿರಾಸ್ತಿ ವೃದ್ಧಿ ಹಾಗೂ ಉದಾರ ವ್ಯಕ್ತಿತ್ವ.",
      en: "Abundant wealth accumulation in mature years, real estate expansion, and generous philanthropy.",
      hi: "परिपक्व आयु में विपुल धन संग्रह, अचल संपत्ति वृद्धि एवं उदार व्यक्तित्व।",
      te: "మధ్య వయస్సు తర్వాత అపార ధన సంపాదన, స్థిరాస్తుల వృద్ధి & దానగుణం.",
      ta: "மத்திய வயதிற்குப் பின் அபார தன சேர்க்கை, சொத்து வளர்ச்சி மற்றும் தாராள குணம்."
    }
  },
  {
    type: "subtle_sattvic",
    structure: {
      kn: "ಸೌಮ್ಯ ಹಾಗೂ ನಯವಾದ ಬ್ರಹ್ಮ ರೇಖೆ (Subtle & Refined)",
      en: "Subtle, smooth and refined Brahma Rekha",
      hi: "सौम्य एवं सूक्ष्म ब्रह्म रेखा",
      te: "సౌమ్యమైన & మృదువైన బ్రహ్మ రేఖ",
      ta: "நுட்பமான மற்றும் மென்மையான பிரம்ம ரேகை"
    },
    indication: {
      kn: "ಶಾಂತಿಯುತ ಮಾನಸಿಕ ಸ್ಥಿತಿ, ಕಲಾತ್ಮಕ ಸೂಕ್ಷ್ಮತೆ, ಮಧುರ ಸಂಭಾಷಣೆ ಹಾಗೂ ದೈವಭಕ್ತಿ.",
      en: "Serene emotional disposition, artistic subtlety, sweet speech, and spiritual devotion.",
      hi: "शांत मनोवृत्ति, कलात्मक सूक्ष्मता, मधुर वाणी एवं ईश्वर भक्ति।",
      te: "ప్రశాంత మనస్తత్వం, కళాత్మక దృష్టి, మధుర సంభాషణ & దైవభక్తి.",
      ta: "அமைதியான மனநிலை, கலை உணர்வு, இனிமையான பேச்சு மற்றும் தெய்வ பக்தி."
    }
  },
  {
    type: "triangular_ojas",
    structure: {
      kn: "ತ್ರಿಕೋಣಾಕಾರದ ತೇಜಸ್ವಿ ಬ್ರಹ್ಮ ರೇಖೆ (Triangular Ojas)",
      en: "Well-contoured triangular Brahma Rekha",
      hi: "त्रिकोणीय तेजस्वी ब्रह्म रेखा",
      te: "త్రికోణాకార తేజోమయ బ్రహ్మ రేఖ",
      ta: "முக்கோண வடிவ தேஜஸ் பிரம்ம ரேகை"
    },
    indication: {
      kn: "ತೀವ್ರ ಇಚ್ಛಾಶಕ್ತಿ, ಕಾರ್ಯದಲ್ಲಿ ಮುನ್ನುಗ್ಗುವ ಛಲ, ನಾಯಕತ್ವ ಬಲ ಹಾಗೂ ರಕ್ಷಣಾತ್ಮಕ ಶಕ್ತಿ.",
      en: "Unyielding willpower, pioneering initiative, executive resolve, and natural leadership.",
      hi: "प्रबल इच्छाशक्ति, कार्य में अग्रणी रहने का संकल्प, नेतृत्व बल एवं रक्षात्मक सामर्थ्य।",
      te: "తీవ్ర సంకల్ప బలం, కార్యాచరణలో ముందంజ, నాయకత్వ దక్షత & సంరక్షక శక్తి.",
      ta: "உறுதியான மன உறுதி, காரிய வெற்றி, தலைமை ஆற்றல் மற்றும் காக்கும் குணம்."
    }
  }
];

/** 5 Forehead Metoposcopy Profiles ensuring rich, non-repetitive forehead line status */
export const VEDIC_FOREHEAD_METOPOSCOPY_PROFILES = [
  {
    id: "smooth_youth",
    title: {
      kn: "ತೇಜಸ್ವಿ ನಿರ್ಮಲ ಲಲಾಟ (Smooth Sattvic Forehead)",
      en: "Smooth Sattvic Forehead (Unobstructed Tejas)",
      hi: "तेजस्वी निर्मल ललाट (अबाधित सात्विक तेज)",
      te: "తేజోమయ నిర్మల లలాటం",
      ta: "தேஜஸ் களங்கமற்ற நெற்றி"
    },
    lines: [
      {
        planet: {
          kn: "ಆಜ್ಞಾ & ಬುಧ-ರವಿ ತೇಜಸ್ಸು",
          en: "Ajna & Mercury-Sun Radiance",
          hi: "आज्ञा व बुध-सूर्य तेज",
          te: "ఆజ్ఞా & బుధ-సూర్య వర్చస్సు",
          ta: "ஆக்ஞா & புதன்-சூரிய தேஜஸ்"
        },
        status: {
          kn: "ರೇಖಾರಹಿತ ನಯವಾದ ಹಣೆ (Unlined Smooth Luster)",
          en: "Unlined Smooth Luster",
          hi: "रेखाविहीन कोमल कांति",
          te: "రేఖారహిత మృదువైన కాంతి",
          ta: "ரேகைகளற்ற மிருதுவான ஒளி"
        },
        indication: {
          kn: "ತೀವ್ರ ಏಕಾಗ್ರತೆ, ಪ್ರಬಲ ಸ್ಮರಣಶಕ್ತಿ, ನವೀನ ಜ್ಞಾನಾರ್ಜನೆಗೆ ಅತ್ಯಂತ ಶುಭ ಹಾಗೂ ಸ್ವಚ್ಛ ಸಾತ್ವಿಕ ಮನೋಭಾವ.",
          en: "Laser concentration, acute memory retention, rapid mastery of new subjects, and undisturbed mental serenity.",
          hi: "तीव्र एकाग्रता, अद्भुत स्मरणशक्ति, विद्यार्जन में परम सफलता एवं शुद्ध सात्विक विचार।",
          te: "తీవ్ర ఏకాగ్రత, అద్భుత జ్ఞాపకశక్తి, విద్యార్జనలో విజయం & స్వచ్ఛమైన సాత్విక మనస్తత్వం.",
          ta: "தீவிர ஏகாகிரதை, சிறந்த நினைவாற்றல், புதிய அறிவை எளிதில் கற்கும் திறன் மற்றும் தூய அமைதி."
        }
      }
    ]
  },
  {
    id: "jupiter_sun_radiant",
    title: {
      kn: "ಗುರು-ರವಿ ರಾಜಯೋಗ ಲಲಾಟ (Leadership Lines)",
      en: "Jupiter-Sun Royal Forehead Lines",
      hi: "गुरु-सूर्य राजयोग ललाट रेखाएं",
      te: "గురు-సూర్య రాజయోగ లలాట రేఖలు",
      ta: "குரு-சூரிய ராஜயோக நெற்றி ரேகைகள்"
    },
    lines: [
      {
        planet: {
          kn: "ಗುರು ರೇಖಾ (Jupiter Line - Upper Lalata)",
          en: "Jupiter Line (Upper Lalata)",
          hi: "गुरु रेखा (उच्च ललाट)",
          te: "గురు రేఖ (ఎగువ నుదురు)",
          ta: "குரு ரேகை (மேல் நெற்றி)"
        },
        status: {
          kn: "ಸ್ಪಷ್ಟ ಹಾಗೂ ನಿರಂತರ ವಿಶಾಲ ರೇಖೆ",
          en: "Clear, unbroken and prominent line",
          hi: "स्पष्ट, अखंडित एवं विस्तृत रेखा",
          te: "స్పష్టమైన, అఖండమైన విశాల రేఖ",
          ta: "தெளிவான, தொடர்ச்சியான அகன்ற ரேகை"
        },
        indication: {
          kn: "ವ್ಯಾಪಕ ಜ್ಞಾನ, ಸಮಾಜದಲ್ಲಿ ಧರ್ಮಬೋಧನೆ, ಆಡಳಿತಾತ್ಮಕ ಮನ್ನಣೆ ಹಾಗೂ ಗೌರವಾನ್ವಿತ ನಾಯಕತ್ವ.",
          en: "Profound wisdom, moral guidance, administrative reverence, and dignified leadership.",
          hi: "विशाल ज्ञान, सामाजिक प्रतिष्ठा, प्रशासनिक मान्यता एवं गरिमामय नेतृत्व।",
          te: "విశాల విజ్ఞానం, సామాజిక గౌరవం, పరిపాలనా గుర్తింపు & హుందాతనంగల నాయకత్వం.",
          ta: "ஆழ்ந்த ஞானம், சமூக மரியாதை, நிர்வாகப் பாராட்டு மற்றும் கண்ணியமான தலைமை."
        }
      },
      {
        planet: {
          kn: "ರವಿ ರೇಖಾ (Sun Line - Brow Ridge)",
          en: "Sun Line (Brow Ridge)",
          hi: "सूर्य रेखा (भ्रूमध्य के ऊपर)",
          te: "సూర్య రేఖ (భ్రూమధ్యం పై)",
          ta: "சூரிய ரேகை (புருவ மத்தி மேல்)"
        },
        status: {
          kn: "ಉಜ್ವಲ ಹಾಗೂ ನೇರವಾದ ರೇಖೆ",
          en: "Luminous and straight line",
          hi: "उज्ज्वल एवं सीधी रेखा",
          te: "తేజోవంతమైన తిన్నని రేఖ",
          ta: "பிரகாசமான நேர்க்கோடு ரேகை"
        },
        indication: {
          kn: "ರಾಜಕೀಯ ಅಥವಾ ಉನ್ನತ ವೃತ್ತಿಪರ ಯಶಸ್ಸು, ತೇಜಸ್ವಿ ಕೀರ್ತಿ ಹಾಗೂ ಅಚಲ ಸ್ವಾಭಿಮಾನ.",
          en: "Executive or civic elevation, radiating prestige, and unwavering self-respect.",
          hi: "उच्च पदोन्नति, तेजस्वी कीर्ति एवं अटल स्वाभिमान।",
          te: "ఉన్నత వృత్తిపర విజయం, ప్రకాశవంతమైన ఖ్యాతి & ఆత్మగౌరవం.",
          ta: "உயர் தொழில் வெற்றி, பிரகாசமான புகழ் மற்றும் அசைக்க முடியாத சுயமரியாதை."
        }
      }
    ]
  },
  {
    id: "mars_courage",
    title: {
      kn: "ಕುಜ ಸಾಹಸ ಲಲಾಟ ರೇಖೆ (Courage & Enterprise)",
      en: "Mars Courage & Enterprise Lines",
      hi: "मंगल पराक्रम ललाट रेखाएं",
      te: "కుజ పరాక్రమ లలాట రేఖలు",
      ta: "செவ்வாய் தைரிய நெற்றி ரேகைகள்"
    },
    lines: [
      {
        planet: {
          kn: "ಕುಜ ರೇಖಾ (Mars Line - Mid Forehead)",
          en: "Mars Line (Mid Forehead)",
          hi: "मंगल रेखा (मध्य ललाट)",
          te: "కుజ రేఖ (మధ్య నుదురు)",
          ta: "செவ்வாய் ரேகை (நடு நெற்றி)"
        },
        status: {
          kn: "ದೃಢ ಹಾಗೂ ಆಳವಾದ ರೇಖೆ",
          en: "Firm and distinct deep line",
          hi: "दृढ़ एवं गहरी रेखा",
          te: "దృఢమైన లోతైన రేఖ",
          ta: "உறுதியான ஆழமான ரேகை"
        },
        indication: {
          kn: "ಅಪ್ರತಿಮ ಧೈರ್ಯ, ಸಂಕಷ್ಟಗಳನ್ನು ಸವಾಲಾಗಿ ಎದುರಿಸುವ ಶಕ್ತಿ ಹಾಗೂ ಸ್ವಂತ ಬಾಹುಬಲದಿಂದ ಗೆಲುವು.",
          en: "Formidable courage, resilience against all crises, and victory earned through individual strength.",
          hi: "अदम्य साहस, विपत्तियों से टकराने की शक्ति एवं बाहुबल से विजय।",
          te: "తిరుగులేని ధైర్యం, సవాళ్ళను ఎదుర్కొనే శక్తి & స్వశక్తితో విజయం.",
          ta: "அசாத்திய தைரியம், இன்னல்களை வெல்லும் ஆற்றல் மற்றும் சொந்த உழைப்பில் வெற்றி."
        }
      }
    ]
  },
  {
    id: "saturn_mercury_wisdom",
    title: {
      kn: "ಶನಿ-ಬುಧ ಧರ್ಮಜ್ಞ ಲಲಾಟ (Discernment & Endurance)",
      en: "Saturn-Mercury Discernment Lines",
      hi: "शनि-बुध विवेक ललाट रेखाएं",
      te: "శని-బుధ వివేక లలాట రేఖలు",
      ta: "சனி-புதன் விவேக நெற்றி ரேகைகள்"
    },
    lines: [
      {
        planet: {
          kn: "ಶನಿ ರೇಖಾ (Saturn Line - Highest Crown)",
          en: "Saturn Line (Highest Forehead)",
          hi: "शनि रेखा (शीर्ष ललाट)",
          te: "శని రేఖ (నుదుటి పైభాగం)",
          ta: "சனி ரேகை (உச்சி நெற்றி)"
        },
        status: {
          kn: "ಗಂಭೀರ ಹಾಗೂ ಅಖಂಡ ರೇಖೆ",
          en: "Profound, steady and unbroken line",
          hi: "गंभीर एवं अविच्छिन्न रेखा",
          te: "గంభీరమైన నిరంతర రేఖ",
          ta: "ஆழமான தொடர்ச்சியான ரேகை"
        },
        indication: {
          kn: "ದೀರ್ಘಾಯುಷ್ಯ, ಆಳವಾದ ತಾಳ್ಮೆ, ರಹಸ್ಯ ಶಾಸ್ತ್ರಗಳ ಅಧ್ಯಯನ ಹಾಗೂ ತಪಸ್ವಿ ಮನೋಭಾವ.",
          en: "Exceptional longevity, deep endurance, mastery of esoteric sciences, and contemplative discipline.",
          hi: "दीर्घायुष्य, असीम धैर्य, गूढ़ शास्त्रों का ज्ञान एवं तपस्वी वृत्ति।",
          te: "దీర్ఘాయుష్షు, అపార సహనం, గూఢ శాస్త్రాల పరిశోధన & తపస్వీ జీవనం.",
          ta: "நீண்ட ஆயுள், ஆழ்ந்த பொறுமை, மறைபொருள் ஞானம் மற்றும் தவ வாழ்க்கை."
        }
      },
      {
        planet: {
          kn: "ಬುಧ ರೇಖಾ (Mercury Line)",
          en: "Mercury Line",
          hi: "बुध रेखा",
          te: "బుధ రేఖ",
          ta: "புதன் ரேகை"
        },
        status: {
          kn: "ಸೂಕ್ಷ್ಮ ಹಾಗೂ ತೀಕ್ಷ್ಣ ರೇಖೆ",
          en: "Fine and sharp line",
          hi: "सूक्ष्म एवं तीक्ष्ण रेखा",
          te: "సూక్ష్మమైన చురుకైన రేఖ",
          ta: "நுட்பமான கூர்மையான ரேகை"
        },
        indication: {
          kn: "ವಾಣಿಜ್ಯ ಚಾಕಚಕ್ಯತೆ, ಲೆಕ್ಕಪತ್ರ ದಕ್ಷತೆ, ಗ್ರಂಥ ರಚನೆ ಹಾಗೂ ಚುರುಕಾದ ಬುದ್ಧಿಶಕ್ತಿ.",
          en: "Commercial brilliance, forensic analytical capability, literary skill, and sharp intellect.",
          hi: "वाणिज्यिक चातुर्य, वित्तीय दक्षता, ग्रंथ रचना एवं तीव्र प्रज्ञा।",
          te: "వ్యాపార దక్షత, విశ్లేషణాత్మక బుద్ధి, గ్రంథ రచన & చురుకైన ఆలోచన.",
          ta: "வணிகத் திறமை, கணக்கீட்டு ஆற்றல், நூல் இயற்றும் அறிவு மற்றும் கூரிய மதி."
        }
      }
    ]
  },
  {
    id: "venus_graceful",
    title: {
      kn: "ಶುಕ್ರ-ಚಂದ್ರ ಸೌಮ್ಯ ಕಾಂತಿ ರೇಖೆ (Grace & Elegance)",
      en: "Venus-Moon Graceful Contour",
      hi: "शुक्र-चंद्र सौम्य कांति रेखाएं",
      te: "శుక్ర-చంద్ర సౌమ్య కాంతి రేఖలు",
      ta: "சுக்கிரன்-சந்திரன் வசீகர நெற்றி ரேகைகள்"
    },
    lines: [
      {
        planet: {
          kn: "ಶುಕ್ರ ರೇಖಾ (Venus Line - Brow Arch)",
          en: "Venus Line (Above Brow Arch)",
          hi: "शुक्र रेखा (भौंहों के ऊपर)",
          te: "శుక్ర రేఖ (కనుబొమ్మల పైన)",
          ta: "சுக்கிர ரேகை (புருவ வளைவு மேல்)"
        },
        status: {
          kn: "ಚಂದ್ರನಂತೆ ಬಾಗಿದ ಸೌಮ್ಯ ರೇಖೆ",
          en: "Gracefully arched crescent line",
          hi: "चंद्राकार सौम्य वक्र रेखा",
          te: "చంద్రాకార సౌమ్య వంపు రేఖ",
          ta: "பிறைச்சந்திரன் போன்ற வளைந்த ரேகை"
        },
        indication: {
          kn: "ಕಲಾ ಪ್ರೇಮ, ಆಕರ್ಷಕ ಕಾಂತಿ, ಜನರ ಮನಸ್ಸು ಗೆಲ್ಲುವ ಮಾಧುರ್ಯ ಹಾಗೂ ಸುಖಮಯ ಜೀವನ.",
          en: "Artistic passion, charismatic aura, persuasive charm winning hearts, and domestic bliss.",
          hi: "कला प्रेम, चुंबकीय आभा, सबको मोहित करने वाली मधुरता एवं सुखमय जीवन।",
          te: "కళాభిరుచి, ఆకర్షణీయ వర్చస్సు, అందరినీ మెప్పించే మాధుర్యం & సుఖమయ దాంపత్యం.",
          ta: "கலை ஆர்வம், வசீகர ஒளி, அனைவரையும் கவரும் இனிமை மற்றும் மகிழ்ச்சியான வாழ்வு."
        }
      }
    ]
  }
];

