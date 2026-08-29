# Step 1: Update src/data/gokarnaSevas.ts
file_path_sevas = "/Users/shreesuma/AntigravityProjects/BaggonaPanchangaAstrology/BaggonaPanchangaAstrology/src/data/gokarnaSevas.ts"

with open(file_path_sevas, "r", encoding="utf-8") as f:
    content_sevas = f.read()

# Expand SevaId union
old_seva_id = """export type SevaId =
  | "rudrabhisheka"
  | "pindapradana"
  | "narayanabali"
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma";"""

new_seva_id = """export type SevaId =
  | "rudrabhisheka"
  | "pindapradana"
  | "narayanabali"
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma"
  | "rahuketushanti"
  | "kalasarpashanti"
  | "sudarshanahoma"
  | "dhanvantarihoma"
  | "pitrudoshashanti"
  | "vastushanti"
  | "mahalakshmihoma"
  | "santangopalahoma"
  | "swayamvaraparvati"
  | "custom_pooja";"""

content_sevas = content_sevas.replace(old_seva_id, new_seva_id)

# Add new catalog entries before the end of SEVA_CATALOG
new_catalog_entries = """,
  rahuketushanti: {
    id: "rahuketushanti",
    icon: "☊",
    name: {
      en: "Rahu-Ketu Shanti Homa",
      kn: "ರಾಹು-ಕೇತು ಶಾಂತಿ ಹೋಮ",
      te: "రాహు-కేతు శాంతి హోమం",
      ta: "ராகு-கேது சாந்தி ஹோமம்",
      hi: "राहु-केतु शांति होम"
    },
    purpose: {
      en: "To pacify Rahu-Ketu afflictions, Sarpa Dosha, and karmic blocks.",
      kn: "ರಾಹು-ಕೇತು ಗ್ರಹಗಳ ಪೀಡೆ, ಸರ್ಪ ದೋಷ ಹಾಗೂ ನಿರಂತರ ಅಡೆತಡೆಗಳ ಶಾಂತಿಗಾಗಿ.",
      te: "రాహు-కేతు గ్రహ పీడలు, సర్ప దోషం మరియు అడ్డంకుల నివారణకు.",
      ta: "ராகு-கேது கிரக பீடை மற்றும் சர்ப்ப தோஷ சாந்திக்கு.",
      hi: "राहु-केतु ग्रह पीड़ा, सर्प दोष एवं रुकावटों की शांति हेतु।"
    },
    benefit: {
      en: "Eliminates unexpected obstacles and paves the path for steady growth.",
      kn: "ಆಕಸ್ಮಿಕ ಸಂಕಷ್ಟಗಳು ದೂರವಾಗಿ ಕೆಲಸ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿರಾತಂಕ ಮುನ್ನಡೆ ಲಭಿಸುತ್ತದೆ.",
      te: "ఆకస్మిక ఇబ్బందులు తొలగి పనులలో నిరాటంక పురోగతి లభిస్తుంది.",
      ta: "திடீர் தடைகள் விலகி காரியங்களில் முன்னேற்றம் கிட்டும்.",
      hi: "आकस्मिक बाधाएं दूर होती हैं और कार्यों में निर्बाध प्रगति होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Tuesday or Saturday, during Rahu Kaala.",
      kn: "ಮಂಗಳವಾರ ಅಥವಾ ಶನಿವಾರ, ರಾಹು ಕಾಲದಲ್ಲಿ.",
      te: "మంగళవారం లేదా శనివారం రాహు కాలంలో.",
      ta: "செவ்வாய் அல்லது சனிக்கிழமை ராகு காலத்தில்.",
      hi: "मंगलवार अथवा शनिवार को राहु काल में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  kalasarpashanti: {
    id: "kalasarpashanti",
    icon: "∿",
    name: {
      en: "Kala Sarpa Dosha Shanti",
      kn: "ಕಾಲಸರ್ಪ ದೋಷ ಶಾಂತಿ ಹೋಮ",
      te: "కాలసర్ప దోష శాంతి హోమం",
      ta: "காலசர்ப்ப தோஷ சாந்தி ஹோமம்",
      hi: "कालसर्प दोष शांति होम"
    },
    purpose: {
      en: "To eliminate full or partial Kala Sarpa Yoga afflictions in the horoscope.",
      kn: "ಜಾತಕದಲ್ಲಿನ ಸಂಪೂರ್ಣ ಕಾಲಸರ್ಪ ಯೋಗದ ದುಷ್ಪರಿಣಾಮಗಳ ಪರಿಹಾರಕ್ಕಾಗಿ.",
      te: "జాతకంలోని కాలసర్ప దోష దుష్ప్రభావాల నివారణ కోసం.",
      ta: "ஜாதக காலசர்ப்ப தோஷத்தை முழுமையாக நீக்க.",
      hi: "कुंडली में कालसर्प योग के दुष्प्रभावों के पूर्ण निवारण हेतु।"
    },
    benefit: {
      en: "Resolves chronic delays in career, marriage, and financial stability.",
      kn: "ವೃತ್ತಿ, ವಿವಾಹ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿರತೆಯಲ್ಲಿ ಉಂಟಾಗುವ ನಿರಂತರ ವಿಳಂಬ ಶಮನವಾಗುತ್ತದೆ.",
      te: "ఉద్యోగం, వివాహం మరియు ఆర్థిక స్థిరత్వంలో జాప్యాలు తొలగుతాయి.",
      ta: "தொழில், திருமணம் மற்றும் பொருளாதார தாமதங்கள் விலகும்.",
      hi: "करियर, विवाह एवं आर्थिक स्थिति में निरंतर होने वाले विलंब दूर होते हैं।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Naga Panchami, Amavasya, or on your Janma Nakshatra day.",
      kn: "ನಾಗ ಪಂಚಮಿ, ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ.",
      te: "నాగ పంచమి, అమావాస్య లేదా జన్మ నక్షత్రం రోజున.",
      ta: "நாக பஞ்சமி, அமாவாசை அல்லது ஜன்ம நட்சத்திர நாளில்.",
      hi: "नाग पंचमी, अमावस्या अथवा जन्म नक्षत्र के दिन।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  sudarshanahoma: {
    id: "sudarshanahoma",
    icon: "☸",
    name: {
      en: "Sri Sudarshana Narasimha Homa",
      kn: "ಶ್ರೀ ಸುದರ್ಶನ ನರಸಿಂಹ ಹೋಮ",
      te: "శ్రీ సుదర్శన నరసింహ హోమం",
      ta: "ஸ்ரீ சுதர்சன நரசிம்ம ஹோமம்",
      hi: "श्री सुदर्शन नृसिंह होम"
    },
    purpose: {
      en: "To destroy evil eye, hidden enmities, and negative psychic vibrations.",
      kn: "ಶತ್ರು ಬಾಧೆ, ದುಷ್ಟ ದೃಷ್ಟಿ ಹಾಗೂ ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗಳ ಭೇದನೆಗಾಗಿ.",
      te: "శత్రు బాధలు, దిష్టి దోషాలు మరియు ప్రతికూల శక్తుల నివారణకు.",
      ta: "சத்ரு பயம், கண் திருஷ்டி மற்றும் எதிர்மறை சக்திகளை அழிக்க.",
      hi: "शत्रु बाधा, कुदृष्टि तथा नकारात्मक ऊर्जा के विनाश हेतु।"
    },
    benefit: {
      en: "Bestows an invincible divine protective shield and victorious outcomes.",
      kn: "ಅದ್ಭುತ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ ಹಾಗೂ ಸಕಲ ಸಂಕಷ್ಟಗಳಿಂದ ಜಯ ಸಿಗುತ್ತದೆ.",
      te: "దివ్య రక్షణ కవచం లభించి సమస్త సంకటాలపై విజయం చేకూరుతుంది.",
      ta: "தெய்வீக பாதுகாப்பு கவசமும் சகல காரிய வெற்றியும் கிடைக்கும்.",
      hi: "दिव्य रक्षा कवच की प्राप्ति तथा सभी संकटों पर विजय मिलती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Wednesday, Saturday, or on Ekadashi.",
      kn: "ಬುಧವಾರ, ಶನಿವಾರ ಅಥವಾ ಏಕಾದಶಿಯ ದಿನ.",
      te: "బుధవారం, శనివారం లేదా ఏకాదశి రోజున.",
      ta: "புதன், சனிக்கிழமை அல்லது ஏகாதசி நாளில்.",
      hi: "बुधवार, शनिवार अथवा एकादशी के दिन।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  },

  dhanvantarihoma: {
    id: "dhanvantarihoma",
    icon: "🌿",
    name: {
      en: "Sri Dhanvantari Arogya Homa",
      kn: "ಶ್ರೀ ಧನ್ವಂತರಿ ಆರೋಗ್ಯ ಹೋಮ",
      te: "శ్రీ ధన్వంతరి ఆరోగ్య హోమం",
      ta: "ஸ்ரீ தன்வந்திரி ஆரோக்கிய ஹோமம்",
      hi: "श्री धन्वंतरि आरोग्य होम"
    },
    purpose: {
      en: "To heal chronic physical ailments and restore robust vitality.",
      kn: "ದೀರ್ಘಕಾಲಿಕ ರೋಗ ಮುಕ್ತಿ, ಶಾರೀರಿಕ ಬಲ ಹಾಗೂ ಅಮೃತ ಆರೋಗ್ಯ ಪ್ರಾಪ್ತಿಗಾಗಿ.",
      te: "దీర్ఘకాలిక రోగ విముక్తి, శారీరక బలం మరియు సంపూర్ణ ఆరోగ్యం కొరకు.",
      ta: "தீராத நோய் நீங்கி தேக ஆரோக்கியம் மற்றும் புத்துணர்ச்சி பெற.",
      hi: "दीर्घकालिक रोगों से मुक्ति, शारीरिक बल एवं उत्तम आरोग्य हेतु।"
    },
    benefit: {
      en: "Medicines and treatments work effectively, restoring complete health and vitality.",
      kn: "ಔಷಧೋಪಚಾರಗಳು ಶೀಘ್ರ ಫಲಕಾರಿಯಾಗಿ ರೋಗ ಮುಕ್ತ ದೀರ್ಘಾಯುಷ್ಯ ಲಭಿಸುತ್ತದೆ.",
      te: "ఔషధాలు శీఘ్రంగా పనిచేసి సంపూర్ణ ఆరోగ్యంతో కూడిన దీర్ఘాయువు లభిస్తుంది.",
      ta: "மருத்துவ சிகிச்சைகள் பலனளித்து பூரண நலமும் நீண்ட ஆயுளும் உண்டாகும்.",
      hi: "दवाइयां शीघ्र असर करती हैं और उत्तम स्वास्थ्य व दीर्घायु प्राप्त होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Trayodashi (Dhanvantari Jayanti) or on any Sunday morning.",
      kn: "ತ್ರಯೋದಶಿ ತಿಥಿ ಅಥವಾ ಭಾನುವಾರ ಬೆಳಿಗ್ಗೆ.",
      te: "త్రయోదశి తిథి లేదా ఆదివారం ఉదయం.",
      ta: "திரயோதசி திதி அல்லது ஞாயிறு காலையில்.",
      hi: "त्रयोदशी तिथि अथवा रविवार की सुबह।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  },

  pitrudoshashanti: {
    id: "pitrudoshashanti",
    icon: "☸",
    name: {
      en: "Pitru Dosha Shanti & Tila Tarpanam",
      kn: "ಪಿತೃ ದೋಷ ಶಾಂತಿ ಹಾಗೂ ತಿಲ ತರ್ಪಣ",
      te: "పితృ దోష శాంతి మరియు తిల తర్పణం",
      ta: "பித்ரு தோஷ சாந்தி & தில தர்பணம்",
      hi: "पितृ दोष शांति एवं तिल तर्पण"
    },
    purpose: {
      en: "Special Vedic Tarpanam and Shanti for ancestral debts and blessings.",
      kn: "ಪೂರ್ವಜರ ಶಾಪ ಹಾಗೂ ಪಿತೃ ದೋಷ ಶಮನಕ್ಕಾಗಿ ವಿಶೇಷ ವೈದಿಕ ತರ್ಪಣ ಪೂಜೆ.",
      te: "పూర్వీకుల ఋణం మరియు పితృ దోష నివారణకు విశేష వైదిక పూజ.",
      ta: "முன்னோர் சாபம் மற்றும் பித்ரு தோஷத்தை போக்கும் வைதீக பரிகாரம்.",
      hi: "पूर्वजों के ऋण एवं पितृ दोष शमन हेतु विशेष वैदिक शांति पूजा।"
    },
    benefit: {
      en: "Ensures healthy progeny, harmonious domestic life, and ancestral grace.",
      kn: "ಸಂತತಿ ಭಾಗ್ಯ, ಕೌಟುಂಬಿಕ ಸೌಹಾರ್ದ ಹಾಗೂ ಪಿತೃದೇವತೆಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ ಲಭಿಸುತ್ತದೆ.",
      te: "సంతాన సౌభాగ్యం, కుటుంబ సౌఖ్యం మరియు పితృదేవతల ఆశీస్సులు లభిస్తాయి.",
      ta: "சந்தான பாக்கியம், குடும்ப ஒற்றுமை மற்றும் பித்ருக்களின் ஆசி கிட்டும்.",
      hi: "संतान सुख, पारिवारिक सौहार्द तथा पितरों का दिव्य आशीर्वाद मिलता है।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, Pitru Paksha, or on Sankramana.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಮಹಾಲಯ ಪಿತೃ ಪಕ್ಷ ಅಥವಾ ಸಂಕ್ರಮಣದಂದು.",
      te: "అమావాస్య, పితృ పక్షం లేదా సంక్రమణం రోజున.",
      ta: "அமாவாசை, பித்ரு பட்சம் அல்லது சங்கிரமண நாளில்.",
      hi: "अमावस्या, पितृ पक्ष अथवा संक्रांति के दिन।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },

  vastushanti: {
    id: "vastushanti",
    icon: "🏛️",
    name: {
      en: "Vastu Shanti & Gruha Pravesha Homa",
      kn: "ಗೃಹ ಪ್ರವೇಶ ಹಾಗೂ ವಾಸ್ತು ಶಾಂತಿ ಹೋಮ",
      te: "గృహ ప్రవేశం మరియు వాస్తు శాంతి హోమం",
      ta: "கிரகப் பிரவேசம் & வாஸ்து சாந்தி ஹோமம்",
      hi: "गृह प्रवेश एवं वास्तु शांति होम"
    },
    purpose: {
      en: "To cleanse domestic Vastu imbalances and welcome auspicious deities.",
      kn: "ಮನೆಯ ವಾಸ್ತು ದೋಷಗಳ ನಿವಾರಣೆ ಹಾಗೂ ಗೃಹ ದೇವತಾ ಪ್ರಸನ್ನತೆಗಾಗಿ.",
      te: "గృహ వాస్తు దోషాల నివారణ మరియు గృహ దేవతల ప్రసన్నతకు.",
      ta: "வீட்டின் வாஸ்து தோஷங்களை நீக்கி கிரக தெய்வங்களின் அருள் பெற.",
      hi: "घर के वास्तु दोष निवारण एवं गृह देवताओं की प्रसन्नता हेतु।"
    },
    benefit: {
      en: "Infuses the dwelling with peaceful resonance, prosperity, and affection.",
      kn: "ಮನೆಯಲ್ಲಿ ನೆಮ್ಮದಿ, ಧನ ಸಮೃದ್ಧಿ ಹಾಗೂ ಕುಟುಂಬ ಸದಸ್ಯರಲ್ಲಿ ಪ್ರೀತಿ-ವಿಶ್ವಾಸ ನೆಲೆಸುತ್ತದೆ.",
      te: "ఇంట్లో ప్రశాంతత, ధన సమృద్ధి మరియు కుటుంబంలో ఆప్యాయతలు పెరుగుతాయి.",
      ta: "இல்லத்தில் அமைதி, தன லாபம் மற்றும் குடும்பத்தில் அன்பு பெருகும்.",
      hi: "घर में शांति, धन-समृद्धि तथा परिजनों में प्रेम व सद्भाव बढ़ता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On an auspicious Muhurtha during Shukla Paksha.",
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ.",
      te: "శుక్ల పక్ష శుభ ముహూర్తంలో.",
      ta: "சுக்ல பட்ச சுப முகூர்த்தத்தில்.",
      hi: "शुक्ल पक्ष के शुभ मुहूर्त में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  },

  mahalakshmihoma: {
    id: "mahalakshmihoma",
    icon: "🪔",
    name: {
      en: "Sri Mahalakshmi Wealth & Prosperity Homa",
      kn: "ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮೀ ಧನ ಸಮೃದ್ಧಿ ಹೋಮ",
      te: "శ్రీ మహాలక్ష్మీ ధన సమృద్ధి హోమం",
      ta: "ஸ்ரீ மகாலக்ஷ்மி தன சுபிட்ச ஹோமம்",
      hi: "श्री महालक्ष्मी धन समृद्धि होम"
    },
    purpose: {
      en: "To invoke Sri Sukta mantras for business abundance and Ashtalakshmi grace.",
      kn: "ವ್ಯಾಪಾರ-ಉದ್ಯೋಗದಲ್ಲಿ ಅಭಿವೃದ್ಧಿ ಹಾಗೂ ಅಷ್ಟಲಕ್ಷ್ಮೀ ಕೃಪಾ ಸಿದ್ಧಿಗಾಗಿ.",
      te: "వ్యాపార, ఉద్యోగాలలో ఉన్నతి మరియు అష్టలక్ష్మి కృపా కటాక్షం కోసం.",
      ta: "தொழில் மற்றும் வியாபாரத்தில் அபிவிருத்தி மற்றும் அஷ்டலக்ஷ்மி அருள் பெற.",
      hi: "व्यापार-व्यवसाय में उन्नति तथा अष्टलक्ष्मी कृपा प्राप्ति हेतु।"
    },
    benefit: {
      en: "Dissolves debt/losses and ensures consistent financial inflow and prosperity.",
      kn: "ಆರ್ಥಿಕ ನಷ್ಟಗಳು ನಿವಾರಣೆಯಾಗಿ ನಿರಂತರ ಧನಾಗಮನ ಹಾಗೂ ಐಶ್ವರ್ಯ ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
      te: "ఆర్థిక ఇబ్బందులు తొలగి నిరంతర ధనాగమనం మరియు ఐశ్వర్యవృద్ధి కలుగుతాయి.",
      ta: "பொருளாதார நஷ்டங்கள் நீங்கி தொடர் தன வரவும் செல்வச் செழிப்பும் பெருகும்.",
      hi: "आर्थिक संकट दूर होकर निरंतर धन आगमन और ऐश्वर्य की वृद्धि होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Friday, Purnima, or during Varalakshmi / Diwali Vratha.",
      kn: "ಶುಕ್ರವಾರ, ಹುಣ್ಣಿಮೆ ಅಥವಾ ವರಮಹಾಲಕ್ಷ್ಮೀ / ದೀಪಾವಳಿ ದಿನ.",
      te: "శుక్రవారం, పౌర్ణమి లేదా వరలక్ష్మీ వ్రతం నాడు.",
      ta: "வெள்ளிக்கிழமை, பௌர்ணமி அல்லது வரலக்ஷ்மி விரத நாளில்.",
      hi: "शुक्रवार, पूर्णिमा अथवा वरलक्ष्मी / दीपावली के दिन।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  },

  santangopalahoma: {
    id: "santangopalahoma",
    icon: "🪶",
    name: {
      en: "Sri Santana Gopala Child Blessing Homa",
      kn: "ಶ್ರೀ ಸಂತಾನ ಗೋಪಾಲ ಹೋಮ",
      te: "శ్రీ సంతాన గోపాల హోమం",
      ta: "ஸ்ரீ சந்தான கோபால ஹோமம்",
      hi: "श्री संतान गोपाल होम"
    },
    purpose: {
      en: "To dissolve impediments to childbirth and seek noble, healthy progeny.",
      kn: "ಸಂತಾನ ಭಾಗ್ಯದ ಅಡಚಣೆಗಳ ನಿವಾರಣೆ ಹಾಗೂ ಸತ್ಸಂತಾನ ಪ್ರಾಪ್ತಿಗಾಗಿ.",
      te: "సంతాన లేమి దోషాల నివారణ మరియు ఉత్తమ సంతాన ప్రాప్తి కొరకు.",
      ta: "சந்தான பாக்கிய தடைகளை நீக்கி நல்ல குழந்தைச்செல்வம் பெற.",
      hi: "संतान प्राप्ति में आने वाली बाधाओं के निवारण एवं उत्तम संतान प्राप्ति हेतु।"
    },
    benefit: {
      en: "Lord Krishna's grace blesses the family with healthy, radiant children.",
      kn: "ಶ್ರೀ ಕೃಷ್ಣನ ಅನುಗ್ರಹದಿಂದ ಸಕಾಲಕ್ಕೆ ಸಂತಾನ ಭಾಗ್ಯ ಪ್ರಾಪ್ತಿಯಾಗಿ ವಂಶೋದ್ಧಾರವಾಗುತ್ತದೆ.",
      te: "శ్రీకృష్ణుని అనుగ్రహంతో సకాలంలో సంతాన భాగ్యం కలిగి వంశం వర్ధిల్లుతుంది.",
      ta: "ஸ்ரீகிருஷ்ணரின் திருவருளால் நற்குழந்தைப் பேறு கிடைத்து வம்சம் தழைக்கும்.",
      hi: "भगवान श्रीकृष्ण की कृपा से शुभ संतान सुख प्राप्त होकर कुल की वृद्धि होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Ashtami, Rohini Nakshatra, or on Thursdays.",
      kn: "ಅಷ್ಟಮಿ, ರೋಹಿಣಿ ನಕ್ಷತ್ರ ಅಥವಾ ಗುರುವಾರದಂದು.",
      te: "అష్టమి, రోహిణి నక్షత్రం లేదా గురువారం రోజున.",
      ta: "அஷ்டமி, ரோகிணி நட்சத்திரம் அல்லது வியாழக்கிழமையில்.",
      hi: "अष्टमी, रोहिणी नक्षत्र अथवा गुरुवार को।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  },

  swayamvaraparvati: {
    id: "swayamvaraparvati",
    icon: "🌸",
    name: {
      en: "Sri Swayamvara Parvati Marriage Homa",
      kn: "ಶ್ರೀ ಸ್ವಯಂವರ ಪಾರ್ವತಿ ಹೋಮ",
      te: "శ్రీ స్వయంవర పార్వతీ హోమం",
      ta: "ஸ்ரீ சுயம்வர பார்வதி ஹோமம்",
      hi: "श्री स्वयंवर पार्वती होम"
    },
    purpose: {
      en: "To resolve marital delays, neutralize doshas, and attract a noble life partner.",
      kn: "ವಿವಾಹ ವಿಳಂಬ, ಕಂಕಣ ಭಾಗ್ಯದ ಅಡಚಣೆ ಹಾಗೂ ಉತ್ತಮ ಜೀವನ ಸಂಗಾತಿ ಪ್ರಾಪ್ತಿಗಾಗಿ.",
      te: "వివాహ జాప్యం, కంకణ భాగ్య దోషాల నివారణ మరియు ఉత్తమ భాగస్వామి కోసం.",
      ta: "திருமணத் தடை நீங்கி மனதிற்கு ஏற்ற நல்ல வாழ்க்கைத்துணை அமைய.",
      hi: "विवाह में होने वाले विलंब निवारण एवं योग्य जीवनसाथी की प्राप्ति हेतु।"
    },
    benefit: {
      en: "Removes match-finding hurdles and guarantees a harmonious, loving married life.",
      kn: "ಶೀಘ್ರ ವಿವಾಹ ಯೋಗ ಕೂಡಿಬಂದು ಅನ್ಯೋನ್ಯ ದಾಂಪತ್ಯ ಸುಖ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.",
      te: "శీఘ్ర వివాహ యోగం ఏర్పడి అన్యోన్య దాంపత్య సుఖం లభిస్తుంది.",
      ta: "விரைவில் திருமண யோகம் கைகூடி இல்லற வாழ்க்கை இனிதாக அமையும்.",
      hi: "शीघ्र विवाह के योग बनते हैं और सुखी दांपत्य जीवन की प्राप्ति होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Friday, Shukla Paksha Panchami, or during Navaratri.",
      kn: "ಶುಕ್ರವಾರ, ಶುಕ್ಲ ಪಕ್ಷದ ಪಂಚಮಿ ಅಥವಾ ನವರಾತ್ರಿಯಂದು.",
      te: "శుక్రవారం, శుక్ల పక్ష పంచమి లేదా నవరాత్రిలో.",
      ta: "வெள்ளிக்கிழமை, சுக்ல பஞ்சமி அல்லது நவராத்திரியில்.",
      hi: "शुक्रवार, शुक्ल पक्ष पंचमी अथवा नवरात्रि में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  }
};"""

content_sevas = content_sevas.rstrip()
if content_sevas.endswith("};"):
    content_sevas = content_sevas[:-2] + new_catalog_entries

with open(file_path_sevas, "w", encoding="utf-8") as f:
    f.write(content_sevas)

print("Updated gokarnaSevas.ts successfully!")
