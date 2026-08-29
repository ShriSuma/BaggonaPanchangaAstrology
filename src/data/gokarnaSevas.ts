/**
 * Catalog of sevas performed at Gokarna Kshetra.
 *
 * Names are Sanskrit terms written in each script; the surrounding
 * explanations are plain, everyday language so a first-time visitor can follow
 * them. Shlokas stay in Devanagari Sanskrit in all five languages.
 */

import {
  SHLOKA_GANAPATI,
  SHLOKA_NAVAGRAHA,
  SHLOKA_PITRU,
  SHLOKA_SHANTI,
  SHLOKA_SHIVA,
  type L5,
  type SevaShloka
} from "../features/seva/sevaLocale";

export type SevaId =
  | "rudrabhisheka"
  | "pindapradana"
  | "narayanabali"
  | "narayanabali_tripindi"
  | "narayanabali_pretoddhara"
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "rahubrihaspatishanti"
  | "kujashanti_rahubrihaspati_mrityunjaya"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma"
  | "rahuketushanti"
  | "kalasarpashanti"
  | "sudarshanahoma"
  | "vinayakashanti_sudarshana"
  | "dhanvantarihoma"
  | "pitrudoshashanti"
  | "vastushanti"
  | "mahalakshmihoma"
  | "santangopalahoma"
  | "swayamvaraparvati"
  | "custom_pooja";

export type SevaEntry = {
  id: SevaId;
  /** Single glyph used as a quiet visual marker. */
  icon: string;
  name: L5;
  /** What the seva is for, in one simple sentence. */
  purpose: L5;
  /** What the person can expect to feel afterwards. */
  benefit: L5;
  where: L5;
  when: L5;
  duration: L5;
  shloka: SevaShloka;
};

const GOKARNA_TEMPLE: L5 = {
  en: "Shri Mahabaleshwara Temple, Gokarna",
  kn: "ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ದೇವಸ್ಥಾನ, ಗೋಕರ್ಣ",
  te: "శ్రీ మహాబలేశ్వర దేవాలయం, గోకర్ణ",
  ta: "ஸ்ரீ மகாபலேஸ்வரர் கோயில், கோகர்ணம்",
  hi: "श्री महाबलेश्वर मंदिर, गोकर्ण"
};

const KOTI_TEERTHA: L5 = {
  en: "Koti Teertha, Gokarna",
  kn: "ಕೋಟಿ ತೀರ್ಥ, ಗೋಕರ್ಣ",
  te: "కోటి తీర్థం, గోకర్ణ",
  ta: "கோடி தீர்த்தம், கோகர்ணம்",
  hi: "कोटि तीर्थ, गोकर्ण"
};

const GOKARNA_SHORE: L5 = {
  en: "Gokarna sea shore, after the holy bath",
  kn: "ಗೋಕರ್ಣ ಸಮುದ್ರ ತೀರ, ಸ್ನಾನದ ನಂತರ",
  te: "గోకర్ణ సముద్ర తీరం, స్నానం తర్వాత",
  ta: "கோகர்ண கடற்கரை, புனித நீராடலுக்குப் பின்",
  hi: "गोकर्ण समुद्र तट, स्नान के बाद"
};

const HALF_DAY: L5 = {
  en: "About 2 to 3 hours",
  kn: "ಸುಮಾರು 2 ರಿಂದ 3 ಗಂಟೆ",
  te: "సుమారు 2 నుండి 3 గంటలు",
  ta: "சுமார் 2 முதல் 3 மணி நேரம்",
  hi: "लगभग 2 से 3 घंटे"
};

const FULL_DAY: L5 = {
  en: "About 5 to 6 hours",
  kn: "ಸುಮಾರು 5 ರಿಂದ 6 ಗಂಟೆ",
  te: "సుమారు 5 నుండి 6 గంటలు",
  ta: "சுமார் 5 முதல் 6 மணி நேரம்",
  hi: "लगभग 5 से 6 घंटे"
};

const SHORT: L5 = {
  en: "About 1 hour",
  kn: "ಸುಮಾರು 1 ಗಂಟೆ",
  te: "సుమారు 1 గంట",
  ta: "சுமார் 1 மணி நேரம்",
  hi: "लगभग 1 घंटा"
};

export const SEVA_CATALOG: Record<SevaId, SevaEntry> = {
  rudrabhisheka: {
    id: "rudrabhisheka",
    icon: "◈",
    name: {
      en: "Rudrabhisheka",
      kn: "ರುದ್ರಾಭಿಷೇಕ",
      te: "రుద్రాభిషేకం",
      ta: "ருத்ராபிஷேகம்",
      hi: "रुद्राभिषेक"
    },
    purpose: {
      en: "The main seva of Gokarna, offered directly to the Atmalinga of Shri Mahabaleshwara.",
      kn: "ಗೋಕರ್ಣದ ಪ್ರಧಾನ ಸೇವೆ, ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರನ ಆತ್ಮಲಿಂಗಕ್ಕೆ ನೇರವಾಗಿ ಸಲ್ಲಿಸಲಾಗುತ್ತದೆ.",
      te: "గోకర్ణ ప్రధాన సేవ, శ్రీ మహాబలేశ్వరుని ఆత్మలింగానికి నేరుగా సమర్పించబడుతుంది.",
      ta: "கோகர்ணத்தின் முதன்மைச் சேவை, ஸ்ரீ மகாபலேஸ்வரரின் ஆத்மலிங்கத்திற்கு நேரடியாகச் சமர்ப்பிக்கப்படுகிறது.",
      hi: "गोकर्ण की प्रमुख सेवा, जो श्री महाबलेश्वर के आत्मलिंग को सीधे अर्पित की जाती है।"
    },
    benefit: {
      en: "Steadies the mind, clears long-standing heaviness and strengthens the whole family.",
      kn: "ಮನಸ್ಸನ್ನು ಸ್ಥಿರಗೊಳಿಸುತ್ತದೆ, ಬಹುಕಾಲದ ಭಾರವನ್ನು ನಿವಾರಿಸುತ್ತದೆ, ಇಡೀ ಕುಟುಂಬಕ್ಕೆ ಬಲ ನೀಡುತ್ತದೆ.",
      te: "మనసును స్థిరపరుస్తుంది, చిరకాల భారాన్ని తొలగిస్తుంది, కుటుంబం మొత్తానికి బలాన్ని ఇస్తుంది.",
      ta: "மனதை நிலைப்படுத்தும், நீண்டகால கனத்தை நீக்கும், குடும்பம் முழுவதற்கும் வலிமை தரும்.",
      hi: "मन को स्थिर करता है, लंबे समय का बोझ हटाता है और पूरे परिवार को बल देता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "Any morning; especially strong on Monday and on Pradosha.",
      kn: "ಯಾವುದೇ ಬೆಳಿಗ್ಗೆ; ಸೋಮವಾರ ಮತ್ತು ಪ್ರದೋಷದಂದು ವಿಶೇಷ ಫಲ.",
      te: "ఏ ఉదయమైనా; సోమవారం, ప్రదోషం రోజున విశేష ఫలం.",
      ta: "எந்தக் காலையிலும்; திங்கள் மற்றும் பிரதோஷ நாளில் சிறப்பு பலன்.",
      hi: "किसी भी सुबह; सोमवार और प्रदोष के दिन विशेष फल।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHIVA
  },

  pindapradana: {
    id: "pindapradana",
    icon: "☸",
    name: {
      en: "Pinda Pradana",
      kn: "ಪಿಂಡ ಪ್ರದಾನ",
      te: "పిండ ప్రదానం",
      ta: "பிண்ட பிரதானம்",
      hi: "पिंड प्रदान"
    },
    purpose: {
      en: "Offering of pinda and water to departed parents and elders of the family.",
      kn: "ಅಗಲಿದ ತಂದೆ-ತಾಯಿ ಮತ್ತು ಹಿರಿಯರಿಗೆ ಪಿಂಡ ಮತ್ತು ಜಲ ಸಮರ್ಪಣೆ.",
      te: "దివంగత తల్లిదండ్రులకు, పెద్దలకు పిండం మరియు జల సమర్పణ.",
      ta: "மறைந்த பெற்றோர் மற்றும் மூத்தவர்களுக்கு பிண்டமும் நீரும் சமர்ப்பித்தல்.",
      hi: "दिवंगत माता-पिता और बुजुर्गों को पिंड तथा जल का अर्पण।"
    },
    benefit: {
      en: "Brings peace to the ancestors and lightens the sense of unfinished duty at home.",
      kn: "ಪಿತೃಗಳಿಗೆ ಶಾಂತಿ ದೊರೆಯುತ್ತದೆ, ಮನೆಯಲ್ಲಿ ಉಳಿದ ಕರ್ತವ್ಯದ ಭಾರ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
      te: "పితరులకు శాంతి కలుగుతుంది, ఇంట్లో మిగిలిన బాధ్యత భారం తగ్గుతుంది.",
      ta: "முன்னோர்களுக்கு அமைதி கிடைக்கும், வீட்டில் மீதமுள்ள கடமையின் சுமை குறையும்.",
      hi: "पितरों को शांति मिलती है और घर में बचे कर्तव्य का बोझ हल्का होता है।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, during Pitru Paksha, or on the death anniversary.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಪಿತೃ ಪಕ್ಷ ಅಥವಾ ತಿಥಿಯ ದಿನ.",
      te: "అమావాస్య, పితృ పక్షం లేదా తిథి రోజున.",
      ta: "அமாவாசை, பித்ரு பட்சம் அல்லது திதி நாளில்.",
      hi: "अमावस्या, पितृ पक्ष अथवा तिथि के दिन।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_PITRU
  },

  narayanabali: {
    id: "narayanabali",
    icon: "☘",
    name: {
      en: "Narayana Bali",
      kn: "ನಾರಾಯಣ ಬಲಿ",
      te: "నారాయణ బలి",
      ta: "நாராயண பலி",
      hi: "नारायण बलि"
    },
    purpose: {
      en: "Performed when a family member died young, suddenly, or without the proper rites.",
      kn: "ಕುಟುಂಬದ ಸದಸ್ಯರು ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲಿ, ಹಠಾತ್ತಾಗಿ ಅಥವಾ ಸರಿಯಾದ ಸಂಸ್ಕಾರವಿಲ್ಲದೆ ಮೃತರಾದಾಗ ಮಾಡಲಾಗುತ್ತದೆ.",
      te: "కుటుంబ సభ్యులు చిన్న వయసులో, హఠాత్తుగా లేదా సరైన సంస్కారం లేకుండా మరణించినప్పుడు చేస్తారు.",
      ta: "குடும்ப உறுப்பினர் இளவயதில், திடீரென அல்லது முறையான சடங்கின்றி இறந்தபோது செய்யப்படுகிறது.",
      hi: "जब परिवार के किसी सदस्य की कम आयु में, अचानक या बिना उचित संस्कार के मृत्यु हुई हो, तब किया जाता है।"
    },
    benefit: {
      en: "Settles the restlessness that such a loss leaves behind in the family line.",
      kn: "ಅಂತಹ ಸಾವು ಕುಟುಂಬದ ವಂಶದಲ್ಲಿ ಉಳಿಸಿದ ಅಶಾಂತಿಯನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
      te: "అటువంటి మరణం వంశంలో మిగిల్చిన అశాంతిని శమింపజేస్తుంది.",
      ta: "அத்தகைய இழப்பு வம்சத்தில் விட்டுச்சென்ற அமைதியின்மையைத் தணிக்கும்.",
      hi: "ऐसी मृत्यु से वंश में रह गई अशांति को शांत करता है।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On an Amavasya or Ekadashi morning, decided with the priest.",
      kn: "ಅಮಾವಾಸ್ಯೆ ಅಥವಾ ಏಕಾದಶಿಯ ಬೆಳಿಗ್ಗೆ, ಪುರೋಹಿತರೊಂದಿಗೆ ನಿರ್ಧರಿಸಿ.",
      te: "అమావాస్య లేదా ఏకాదశి ఉదయం, పురోహితునితో నిర్ణయించుకోండి.",
      ta: "அமாவாசை அல்லது ஏகாதசி காலையில், புரோகிதருடன் முடிவு செய்யவும்.",
      hi: "अमावस्या या एकादशी की सुबह, पुरोहित से तय करके।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },
  narayanabali_tripindi: {
    id: "narayanabali_tripindi",
    icon: "☘",
    name: {
      en: "Narayana Bali & Tripindi Shraddha",
      kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ",
      te: "నారాయణ బలి మరియు త్రిపిండి శ్రాద్ధం",
      ta: "நாராயண பலி & திரிபிண்டி சிரார்த்தம்",
      hi: "नारायण बलि एवं त्रिपिंडी श्राद्ध"
    },
    purpose: {
      en: "To resolve intense Pitru Dosha and fulfill unperformed Shraddha rites for three generations.",
      kn: "ಪಿತೃ ದೋಷ ನಿವಾರಣೆ, ಅಗಲಿದ ಹಿರಿಯರ ಮುಕ್ತಿ ಹಾಗೂ ಮೂರು ತಲೆಮಾರುಗಳ ಶ್ರಾದ್ಧ ಋಣ ಶಮನಕ್ಕಾಗಿ.",
      te: "పితృ దోష నివారణ, పూర్వీకుల సద్గతి మరియు మూడు తరాల శ్రాద్ధ ఋణ విముక్తి కొరకు.",
      ta: "பித்ரு தோஷ நிவர்த்தி, முன்னோர்களின் முக்தி மற்றும் 3 தலைமுறை சிராத்த கடன் நீங்க.",
      hi: "पितृ दोष निवारण, पूर्वजों की सद्गति एवं तीन पीढ़ियों के श्राद्ध ऋण शमन हेतु।"
    },
    benefit: {
      en: "Bestows ancestral blessings, eliminates marital/progeny obstacles, and brings abundance.",
      kn: "ಪಿತೃಗಳ ಪ್ರಸನ್ನ ಆಶೀರ್ವಾದ, ಸಂತಾನ ಮತ್ತು ವಿವಾಹ ಅಡೆತಡೆಗಳ ಶಮನ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸಮೃದ್ಧಿ.",
      te: "పితృదేవతల అనుగ్రహం, వివాహ-సంతాన అడ్డంకుల నివారణ మరియు కుటుంబ సౌభాగ్యం.",
      ta: "முன்னோர்களின் ஆசி, திருமணம் மற்றும் சந்தான தடைகள் நீங்கி குடும்ப சுபிட்சம் உண்டாகும்.",
      hi: "पितरों का दिव्य आशीर्वाद, विवाह व संतान बाधा निवारण तथा पारिवारिक समृद्धि।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, Pitru Paksha, or on Ekadashi.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಮಹಾಲಯ ಪಿತೃ ಪಕ್ಷ ಅಥವಾ ಏಕಾದಶಿಯಂದು.",
      te: "అమావాస్య, పితృ పక్షం లేదా ఏకాదశి రోజున.",
      ta: "அமாவாசை, பித்ரு பட்சம் அல்லது ஏகாதசி நாளில்.",
      hi: "अमावस्या, पितृ पक्ष अथवा एकादशी के दिन।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },

  narayanabali_pretoddhara: {
    id: "narayanabali_pretoddhara",
    icon: "☘",
    name: {
      en: "Narayana Bali & Pretoddhara Shanti",
      kn: "ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ಪ್ರೇತೋದ್ಧಾರ",
      te: "నారాయణ బలి మరియు ప్రేతోద్ధార శాంతి",
      ta: "நாராயண பலி & பிரேதோத்தார சாந்தி",
      hi: "नारायण बलि एवं प्रेतोद्धार शांति"
    },
    purpose: {
      en: "Special Vedic ritual performed for unnatural demise, distressed souls, and liberation from Preta badha.",
      kn: "ಅಕಾಲ ಮರಣ, ಅತೃಪ್ತ ಆತ್ಮಗಳ ಸದ್ಗತಿ ಹಾಗೂ ಪ್ರೇತ ಬಾಧಾ ನಿವಾರಣೆಗಾಗಿ ವಿಶೇಷ ಶಾಂತಿ ಕರ್ಮ.",
      te: "అకాల మరణం, అతృప్త ఆత్మల సద్గతి మరియు ప్రేత బాధల నివారణకు విశేష శాంతి పూజ.",
      ta: "துர்மரணம், அதிருப்தி ஆன்மாக்களின் முக்தி மற்றும் பிரேத தோஷ நிவர்த்திக்கான விசேஷ சாந்தி.",
      hi: "अकाल मृत्यु, अतृप्त आत्माओं की सद्गति एवं प्रेत बाधा निवारण हेतु विशेष वैदिक शांति।"
    },
    benefit: {
      en: "Eternal peace & Moksha for departed souls, relief from night terrors/fear, and family protection.",
      kn: "ಆತ್ಮಗಳಿಗೆ ಚಿರಶಾಂತಿ ಮತ್ತು ಮೋಕ್ಷ, ದುಃಸ್ವಪ್ನ-ಭಯ ನಿವಾರಣೆ ಹಾಗೂ ವಂಶ ರಕ್ಷಣೆ.",
      te: "ఆత్మలకు ప్రశాంతత మరియు మోక్షం, భయ విముక్తి మరియు వంశ రక్షణ కలుగుతాయి.",
      ta: "ஆன்மாக்களுக்கு மோட்சம், பயம் மற்றும் கெட்ட கனவுகள் நீங்கி வம்ச பாதுகாப்பு உண்டாகும்.",
      hi: "आत्माओं को शांति व मोक्ष, भय व बुरे स्वप्नों से मुक्ति तथा वंश की दैवीय सुरक्षा।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "On Amavasya, Eclipse day, or on auspicious Punya Tithis.",
      kn: "ಅಮಾವಾಸ್ಯೆ, ಗ್ರಹಣ ಕಾಲ ಅಥವಾ ವಿಶೇಷ ಪುಣ್ಯ ತಿಥಿಯಂದು.",
      te: "అమావాస్య, గ్రహణ కాలం లేదా విశేష పుణ్య తిథులలో.",
      ta: "அமாவாசை, கிரகண காலம் அல்லது புண்ணிய திதிகளில்.",
      hi: "अमावस्या, ग्रहण काल अथवा पावन पुण्य तिथियों में।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },

  tripindi: {
    id: "tripindi",
    icon: "⁂",
    name: {
      en: "Tripindi Shraddha",
      kn: "ತ್ರಿಪಿಂಡಿ ಶ್ರಾದ್ಧ",
      te: "త్రిపిండి శ్రాద్ధం",
      ta: "திரிபிண்டி சிராத்தம்",
      hi: "त्रिपिंडी श्राद्ध"
    },
    purpose: {
      en: "Done when shraddha has not been offered for three generations of ancestors.",
      kn: "ಮೂರು ತಲೆಮಾರುಗಳ ಪಿತೃಗಳಿಗೆ ಶ್ರಾದ್ಧ ನಡೆದಿಲ್ಲದಿದ್ದಾಗ ಮಾಡಲಾಗುತ್ತದೆ.",
      te: "మూడు తరాల పితరులకు శ్రాద్ధం జరగనప్పుడు చేస్తారు.",
      ta: "மூன்று தலைமுறை முன்னோர்களுக்கு சிராத்தம் நடக்காதபோது செய்யப்படுகிறது.",
      hi: "जब तीन पीढ़ियों के पितरों का श्राद्ध न हुआ हो, तब किया जाता है।"
    },
    benefit: {
      en: "Closes an old family debt and removes repeated blocks in marriage and children.",
      kn: "ಹಳೆಯ ಕುಟುಂಬದ ಋಣವನ್ನು ತೀರಿಸುತ್ತದೆ, ಮದುವೆ ಮತ್ತು ಸಂತಾನದಲ್ಲಿ ಪದೇ ಪದೇ ಬರುವ ಅಡೆತಡೆ ನಿವಾರಣೆಯಾಗುತ್ತದೆ.",
      te: "పాత కుటుంబ ఋణాన్ని తీరుస్తుంది, వివాహం, సంతానంలో పదే పదే వచ్చే అడ్డంకులు తొలగుతాయి.",
      ta: "பழைய குடும்பக் கடனை அடைக்கும், திருமணம் மற்றும் குழந்தைப்பேற்றில் மீண்டும் மீண்டும் வரும் தடைகள் நீங்கும்.",
      hi: "पुराने पारिवारिक ऋण को चुकाता है और विवाह तथा संतान में बार-बार आने वाली रुकावटें दूर करता है।"
    },
    where: KOTI_TEERTHA,
    when: {
      en: "During Pitru Paksha, or on a Krishna Paksha Panchami.",
      kn: "ಪಿತೃ ಪಕ್ಷದಲ್ಲಿ ಅಥವಾ ಕೃಷ್ಣ ಪಕ್ಷದ ಪಂಚಮಿಯಂದು.",
      te: "పితృ పక్షంలో లేదా కృష్ణ పక్ష పంచమి రోజున.",
      ta: "பித்ரு பட்சத்தில் அல்லது கிருஷ்ண பட்ச பஞ்சமியில்.",
      hi: "पितृ पक्ष में अथवा कृष्ण पक्ष की पंचमी को।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_PITRU
  },

  sarpasamskara: {
    id: "sarpasamskara",
    icon: "∿",
    name: {
      en: "Sarpa Samskara",
      kn: "ಸರ್ಪ ಸಂಸ್ಕಾರ",
      te: "సర్ప సంస్కారం",
      ta: "சர்ப்ப சம்ஸ்காரம்",
      hi: "सर्प संस्कार"
    },
    purpose: {
      en: "For the Rahu and Ketu axis in the chart, and for old harm caused to serpents.",
      kn: "ಜಾತಕದಲ್ಲಿನ ರಾಹು-ಕೇತು ಅಕ್ಷಕ್ಕೆ ಮತ್ತು ಹಿಂದೆ ಸರ್ಪಗಳಿಗೆ ಆದ ತೊಂದರೆಗೆ.",
      te: "జాతకంలోని రాహు-కేతు అక్షానికి మరియు గతంలో సర్పాలకు కలిగిన హానికి.",
      ta: "ஜாதகத்தில் உள்ள ராகு-கேது அச்சுக்கும், முன்பு பாம்புகளுக்கு ஏற்பட்ட தீங்குக்கும்.",
      hi: "कुंडली में राहु-केतु अक्ष के लिए और पूर्व में सर्पों को हुई हानि के लिए।"
    },
    benefit: {
      en: "Relief from repeated delays, skin trouble and difficulty in having children.",
      kn: "ಪದೇ ಪದೇ ಬರುವ ವಿಳಂಬ, ಚರ್ಮದ ತೊಂದರೆ ಮತ್ತು ಸಂತಾನ ಸಮಸ್ಯೆಯಿಂದ ಬಿಡುಗಡೆ.",
      te: "పదే పదే వచ్చే జాప్యాలు, చర్మ సమస్యలు, సంతాన సమస్యల నుండి ఉపశమనం.",
      ta: "மீண்டும் மீண்டும் வரும் தாமதம், தோல் பிரச்சினை, குழந்தைப்பேறு சிரமத்திலிருந்து நிவாரணம்.",
      hi: "बार-बार होने वाली देरी, त्वचा की परेशानी और संतान में कठिनाई से राहत।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Panchami tithi, or on a Tuesday during Rahu Kaala.",
      kn: "ಪಂಚಮಿ ತಿಥಿಯಂದು ಅಥವಾ ಮಂಗಳವಾರ ರಾಹು ಕಾಲದಲ್ಲಿ.",
      te: "పంచమి తిథి రోజున లేదా మంగళవారం రాహు కాలంలో.",
      ta: "பஞ்சமி திதியில் அல்லது செவ்வாய் ராகு காலத்தில்.",
      hi: "पंचमी तिथि को अथवा मंगलवार को राहु काल में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  ganapatihoma: {
    id: "ganapatihoma",
    icon: "❉",
    name: {
      en: "Ganapati Homa",
      kn: "ಗಣಪತಿ ಹೋಮ",
      te: "గణపతి హోమం",
      ta: "கணபதி ஹோமம்",
      hi: "गणपति होम"
    },
    purpose: {
      en: "The first seva before any new beginning, to clear the path ahead.",
      kn: "ಯಾವುದೇ ಹೊಸ ಆರಂಭಕ್ಕೂ ಮೊದಲು ಮಾಡುವ ಸೇವೆ, ಮುಂದಿನ ದಾರಿಯನ್ನು ಸುಗಮಗೊಳಿಸಲು.",
      te: "ఏ కొత్త ప్రారంభానికైనా ముందు చేసే సేవ, ముందున్న దారిని సుగమం చేయడానికి.",
      ta: "எந்தப் புதிய தொடக்கத்திற்கும் முன் செய்யும் சேவை, முன்னால் உள்ள பாதையைத் தெளிவாக்க.",
      hi: "किसी भी नई शुरुआत से पहले की जाने वाली सेवा, आगे का मार्ग साफ़ करने के लिए।"
    },
    benefit: {
      en: "Work that was stuck starts moving; travel and paperwork go smoothly.",
      kn: "ನಿಂತು ಹೋಗಿದ್ದ ಕೆಲಸ ಚಲಿಸತೊಡಗುತ್ತದೆ; ಪ್ರಯಾಣ ಮತ್ತು ದಾಖಲೆ ಕೆಲಸ ಸುಗಮವಾಗುತ್ತದೆ.",
      te: "ఆగిపోయిన పని కదలడం మొదలవుతుంది; ప్రయాణం, పత్రాల పని సాఫీగా జరుగుతుంది.",
      ta: "நின்றுபோன வேலை நகரத் தொடங்கும்; பயணமும் ஆவணப் பணியும் சுலபமாகும்.",
      hi: "रुका हुआ काम चलने लगता है; यात्रा और कागज़ी काम सरल हो जाते हैं।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "Any morning; especially on Chaturthi tithi.",
      kn: "ಯಾವುದೇ ಬೆಳಿಗ್ಗೆ; ವಿಶೇಷವಾಗಿ ಚೌತಿ ತಿಥಿಯಂದು.",
      te: "ఏ ఉదయమైనా; ముఖ్యంగా చవితి తిథి రోజున.",
      ta: "எந்தக் காலையிலும்; குறிப்பாக சதுர்த்தி திதியில்.",
      hi: "किसी भी सुबह; विशेषकर चतुर्थी तिथि को।"
    },
    duration: SHORT,
    shloka: SHLOKA_GANAPATI
  },

  chandihoma: {
    id: "chandihoma",
    icon: "✺",
    name: {
      en: "Chandi Homa",
      kn: "ಚಂಡಿ ಹೋಮ",
      te: "చండీ హోమం",
      ta: "சண்டி ஹோமம்",
      hi: "चंडी होम"
    },
    purpose: {
      en: "A strong seva to the Mother, taken up when opposition or fear surrounds the family.",
      kn: "ಕುಟುಂಬವನ್ನು ವಿರೋಧ ಅಥವಾ ಭಯ ಸುತ್ತುವರಿದಾಗ ತಾಯಿಗೆ ಸಲ್ಲಿಸುವ ಬಲವಾದ ಸೇವೆ.",
      te: "కుటుంబాన్ని వ్యతిరేకత లేదా భయం చుట్టుముట్టినప్పుడు అమ్మవారికి చేసే బలమైన సేవ.",
      ta: "குடும்பத்தை எதிர்ப்போ அச்சமோ சூழ்ந்தபோது அன்னைக்குச் செய்யும் வலிமையான சேவை.",
      hi: "जब परिवार पर विरोध या भय छाया हो, तब माँ को अर्पित की जाने वाली सशक्त सेवा।"
    },
    benefit: {
      en: "Courage returns, hidden opposition weakens, and the home feels protected.",
      kn: "ಧೈರ್ಯ ಮರಳುತ್ತದೆ, ಗುಪ್ತ ವಿರೋಧ ಕುಗ್ಗುತ್ತದೆ, ಮನೆಯಲ್ಲಿ ರಕ್ಷಣೆಯ ಭಾವ ಬರುತ್ತದೆ.",
      te: "ధైర్యం తిరిగి వస్తుంది, గుప్త వ్యతిరేకత బలహీనపడుతుంది, ఇంట్లో రక్షణ భావం కలుగుతుంది.",
      ta: "தைரியம் திரும்பும், மறைமுக எதிர்ப்பு வலுவிழக்கும், வீட்டில் பாதுகாப்பு உணர்வு ஏற்படும்.",
      hi: "साहस लौटता है, छिपा विरोध कमज़ोर होता है और घर सुरक्षित अनुभव होता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Ashtami or Navami tithi, or during Navaratri.",
      kn: "ಅಷ್ಟಮಿ ಅಥವಾ ನವಮಿ ತಿಥಿಯಂದು, ಅಥವಾ ನವರಾತ್ರಿಯಲ್ಲಿ.",
      te: "అష్టమి లేదా నవమి తిథి రోజున, లేదా నవరాత్రిలో.",
      ta: "அஷ்டமி அல்லது நவமி திதியில், அல்லது நவராத்திரியில்.",
      hi: "अष्टमी या नवमी तिथि को, अथवा नवरात्रि में।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_SHANTI
  },

  mrityunjaya: {
    id: "mrityunjaya",
    icon: "❋",
    name: {
      en: "Maha Mrityunjaya Homa",
      kn: "ಮಹಾ ಮೃತ್ಯುಂಜಯ ಹೋಮ",
      te: "మహా మృత్యుంజయ హోమం",
      ta: "மகா மிருத்யுஞ்ஜய ஹோமம்",
      hi: "महा मृत्युंजय होम"
    },
    purpose: {
      en: "For health, recovery from long illness, and safety during a difficult period.",
      kn: "ಆರೋಗ್ಯಕ್ಕಾಗಿ, ದೀರ್ಘ ಕಾಯಿಲೆಯಿಂದ ಚೇತರಿಕೆಗಾಗಿ ಮತ್ತು ಕಷ್ಟದ ಕಾಲದಲ್ಲಿ ರಕ್ಷಣೆಗಾಗಿ.",
      te: "ఆరోగ్యం కోసం, దీర్ఘ అనారోగ్యం నుండి కోలుకోవడం కోసం, కష్ట కాలంలో రక్షణ కోసం.",
      ta: "ஆரோக்கியத்திற்காக, நீண்ட நோயிலிருந்து மீள்வதற்காக, கடினமான காலத்தில் பாதுகாப்பிற்காக.",
      hi: "स्वास्थ्य के लिए, लंबी बीमारी से उबरने के लिए और कठिन समय में रक्षा के लिए।"
    },
    benefit: {
      en: "Strength returns to the body and the fear that comes with illness settles down.",
      kn: "ದೇಹಕ್ಕೆ ಬಲ ಮರಳುತ್ತದೆ, ಕಾಯಿಲೆಯೊಂದಿಗೆ ಬರುವ ಭಯ ಶಮನವಾಗುತ್ತದೆ.",
      te: "శరీరానికి బలం తిరిగి వస్తుంది, అనారోగ్యంతో వచ్చే భయం తగ్గుతుంది.",
      ta: "உடலுக்கு வலிமை திரும்பும், நோயுடன் வரும் அச்சம் தணியும்.",
      hi: "शरीर में शक्ति लौटती है और बीमारी के साथ आने वाला भय शांत होता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On a Monday, or on Trayodashi during Pradosha time.",
      kn: "ಸೋಮವಾರ ಅಥವಾ ತ್ರಯೋದಶಿಯ ಪ್ರದೋಷ ಕಾಲದಲ್ಲಿ.",
      te: "సోమవారం లేదా త్రయోదశి ప్రదోష కాలంలో.",
      ta: "திங்கள் அன்று அல்லது திரயோதசி பிரதோஷ நேரத்தில்.",
      hi: "सोमवार को अथवा त्रयोदशी के प्रदोष काल में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHIVA
  },

  navagrahashanti: {
    id: "navagrahashanti",
    icon: "✧",
    name: {
      en: "Navagraha Shanti Homa",
      kn: "ನವಗ್ರಹ ಶಾಂತಿ ಹೋಮ",
      te: "నవగ్రహ శాంతి హోమం",
      ta: "நவகிரக சாந்தி ஹோமம்",
      hi: "नवग्रह शांति होम"
    },
    purpose: {
      en: "Balances all nine grahas together when several of them sit weak in the chart.",
      kn: "ಜಾತಕದಲ್ಲಿ ಹಲವು ಗ್ರಹಗಳು ದುರ್ಬಲವಾಗಿದ್ದಾಗ ಒಂಬತ್ತೂ ಗ್ರಹಗಳನ್ನು ಒಟ್ಟಿಗೆ ಸಮತೋಲನಗೊಳಿಸುತ್ತದೆ.",
      te: "జాతకంలో పలు గ్రహాలు బలహీనంగా ఉన్నప్పుడు తొమ్మిది గ్రహాలను కలిపి సమతుల్యం చేస్తుంది.",
      ta: "ஜாதகத்தில் பல கிரகங்கள் பலவீனமாக இருக்கும்போது ஒன்பது கிரகங்களையும் சேர்த்து சமநிலைப்படுத்தும்.",
      hi: "जब कुंडली में कई ग्रह कमजोर हों, तब नौ ग्रहों को एक साथ संतुलित करता है।"
    },
    benefit: {
      en: "The ups and downs of daily life become gentler and easier to handle.",
      kn: "ದೈನಂದಿನ ಜೀವನದ ಏರಿಳಿತಗಳು ಮೃದುವಾಗಿ, ನಿಭಾಯಿಸಲು ಸುಲಭವಾಗುತ್ತವೆ.",
      te: "రోజువారీ జీవితంలోని హెచ్చుతగ్గులు తగ్గి, తట్టుకోవడం సులభమవుతుంది.",
      ta: "அன்றாட வாழ்வின் ஏற்றத்தாழ்வுகள் மென்மையாகி, சமாளிக்க எளிதாகும்.",
      hi: "रोज़मर्रा के जीवन के उतार-चढ़ाव हल्के और सँभालने में आसान हो जाते हैं।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On your own birth star day, once a year.",
      kn: "ವರ್ಷಕ್ಕೊಮ್ಮೆ, ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ.",
      te: "సంవత్సరానికి ఒకసారి, మీ జన్మ నక్షత్రం రోజున.",
      ta: "வருடத்திற்கு ஒருமுறை, உங்கள் ஜன்ம நட்சத்திர நாளில்.",
      hi: "वर्ष में एक बार, अपने जन्म नक्षत्र के दिन।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  kujashanti: {
    id: "kujashanti",
    icon: "◉",
    name: {
      en: "Kuja Shanti",
      kn: "ಕುಜ ಶಾಂತಿ",
      te: "కుజ శాంతి",
      ta: "செவ்வாய் சாந்தி",
      hi: "कुज शांति"
    },
    purpose: {
      en: "For delay or friction in marriage caused by the placement of Kuja.",
      kn: "ಕುಜನ ಸ್ಥಾನದಿಂದ ಉಂಟಾಗುವ ಮದುವೆಯ ವಿಳಂಬ ಅಥವಾ ಘರ್ಷಣೆಗಾಗಿ.",
      te: "కుజుని స్థానం వల్ల కలిగే వివాహ జాప్యం లేదా ఘర్షణ కోసం.",
      ta: "செவ்வாயின் அமைவால் ஏற்படும் திருமணத் தாமதம் அல்லது உரசலுக்காக.",
      hi: "कुज की स्थिति से होने वाली विवाह में देरी या मतभेद के लिए।"
    },
    benefit: {
      en: "Proposals begin to come through and the temper cools in existing relationships.",
      kn: "ಸಂಬಂಧಗಳ ಪ್ರಸ್ತಾಪ ಬರತೊಡಗುತ್ತವೆ, ಇರುವ ಸಂಬಂಧಗಳಲ್ಲಿ ಕೋಪ ತಣ್ಣಗಾಗುತ್ತದೆ.",
      te: "సంబంధాల ప్రస్తావనలు రావడం మొదలవుతుంది, ఉన్న సంబంధాలలో కోపం చల్లారుతుంది.",
      ta: "வரன்கள் வரத் தொடங்கும், உள்ள உறவுகளில் கோபம் தணியும்.",
      hi: "रिश्तों के प्रस्ताव आने लगते हैं और मौजूदा संबंधों में गुस्सा शांत होता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On a Tuesday during Shukla Paksha, or on Shashthi tithi.",
      kn: "ಶುಕ್ಲ ಪಕ್ಷದ ಮಂಗಳವಾರ ಅಥವಾ ಷಷ್ಠಿ ತಿಥಿಯಂದು.",
      te: "శుక్ల పక్ష మంగళవారం లేదా షష్ఠి తిథి రోజున.",
      ta: "சுக்ல பட்ச செவ்வாய் அல்லது சஷ்டி திதியில்.",
      hi: "शुक्ल पक्ष के मंगलवार को अथवा षष्ठी तिथि को।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  rahubrihaspatishanti: {
    id: "rahubrihaspatishanti",
    icon: "☊",
    name: {
      en: "Rahu-Brihaspati Shanti Homa",
      kn: "ರಾಹು-ಬೃಹಸ್ಪತಿ ಶಾಂತಿ ಹೋಮ",
      te: "రాహు-బృహస్పతి శాంతి హోమం",
      ta: "ராகு-பிரகஸ்பதி சாந்தி ஹோமம்",
      hi: "राहु-बृहस्पति शांति होम"
    },
    purpose: {
      en: "To resolve Guru-Chandal Yoga, mental restlessness, and impediments to spiritual and financial wisdom.",
      kn: "ಗುರು-ಚಾಂಡಾಲ ಯೋಗ ಶಮನ, ಮಾನಸಿಕ ಗೊಂದಲ ನಿವಾರಣೆ ಹಾಗೂ ಜ್ಞಾನ, ಧರ್ಮ ಮತ್ತು ಭಾಗ್ಯ ವೃದ್ಧಿಗಾಗಿ.",
      te: "గురు-చండాల దోష నివారణ, మానసిక గందరగోళ నివృత్తి మరియు ధర్మ, భాగ్య ప్రాప్తి కొరకు.",
      ta: "குரு-சண்டாள தோஷ நிவர்த்தி, மன அமைதியின்மை நீங்க மற்றும் ஞானம், தன பாக்கியம் பெற.",
      hi: "गुरु-चांडाल योग शमन, मानसिक भ्रम निवारण तथा ज्ञान, धर्म एवं भाग्य वृद्धि हेतु।"
    },
    benefit: {
      en: "Restores clarity of intellect, elevates career/education, and brings immense spiritual tranquility.",
      kn: "ಬುದ್ಧಿ ಸ್ಥೈರ್ಯ, ಉದ್ಯೋಗ-ವಿದ್ಯಾ ಪ್ರಗತಿ, ಗುರುವಿನ ಕೃಪಾಕಟಾಕ್ಷ ಹಾಗೂ ಆಧ್ಯಾತ್ಮಿಕ ಶಾಂತಿ ಲಭಿಸುತ್ತದೆ.",
      te: "బుద్ధి స్థిరత్వం, ఉద్యోగ-విద్యా ప్రగతి, గురు కటాక్షం మరియు ఆధ్యాత్మిక ప్రశాంతత చేకూరుతాయి.",
      ta: "புத்தி தெளிவு, உத்தியோக-கல்வி முன்னேற்றம், குருவருள் மற்றும் ஆத்ம சாந்தி கிட்டும்.",
      hi: "बुद्धि में स्पष्टता, करियर व विद्या में उन्नति, गुरु कृपा तथा आत्मिक शांति प्राप्त होती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Thursday or on your Janma Nakshatra day.",
      kn: "ಗುರುವಾರದಂದು ಅಥವಾ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ.",
      te: "గురువారం నాడు లేదా మీ జన్మ నక్షత్రం రోజున.",
      ta: "வியாழக்கிழமை அல்லது உங்கள் ஜன்ம நட்சத்திர நாளில்.",
      hi: "गुरुवार को अथवा जन्म नक्षत्र के दिन।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  kujashanti_rahubrihaspati_mrityunjaya: {
    id: "kujashanti_rahubrihaspati_mrityunjaya",
    icon: "🔱",
    name: {
      en: "Kuja Shanti, Rahu-Brihaspati Shanti & Maha Mrityunjaya Shanti",
      kn: "ಕುಜ ಶಾಂತಿ, ರಾಹು ಬೃಹಸ್ಪತಿ ಶಾಂತಿ ಹಾಗೂ ಮಹಾ ಮೃತ್ಯುಂಜಯ ಶಾಂತಿ",
      te: "కుజ శాంతి, రాహు బృహస్పతి శాంతి మరియు మహా మృత్యుంజయ శాంతి",
      ta: "செவ்வாய் சாந்தி, ராகு பிரகஸ்பதி சாந்தி & மகா மிருத்யுஞ்சய சாந்தி",
      hi: "कुज शांति, राहु बृहस्पति शांति एवं महा मृत्युंजय शांति"
    },
    purpose: {
      en: "Tri-fold Vedic remedy pacifying Kuja Dosha, Guru-Chandal Yoga, and health afflictions with supreme Shiva grace.",
      kn: "ಕುಜ ದೋಷ, ಗುರು-ಚಾಂಡಾಲ ಯೋಗ ಹಾಗೂ ಆಯುರಾರೋಗ್ಯದ ಮೇಲಿನ ಗ್ರಹದೋಷಗಳನ್ನು ಏಕಕಾಲದಲ್ಲಿ ಶಮನಗೊಳಿಸುವ ತ್ರಿವಿಧ ಮಹಾಶಾಂತಿ.",
      te: "కుజ దోషం, గురు-చండాల దోషం మరియు ఆయురారోగ్య దోషాలను ఒకేసారి నివారించే త్రివిధ మహాశాంతి.",
      ta: "செவ்வாய் தோஷம், குரு-சண்டாள தோஷம் மற்றும் ஆரோக்கிய கிரக பீடைகளை ஒருங்கே போக்கும் மகா சாந்தி.",
      hi: "कुज दोष, गुरु-चांडाल योग एवं स्वास्थ्य संबंधी ग्रह पीड़ाओं का एक साथ शमन करने वाली त्रिविध महाशांति।"
    },
    benefit: {
      en: "Fosters marital harmony, enhances wisdom & career stability, and bestows robust health, longevity and divine shield.",
      kn: "ದಾಂಪತ್ಯ ಸೌಖ್ಯ, ಬುದ್ಧಿ ವಿಕಾಸ, ಶಾರೀರಿಕ ಬಲ, ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಸರ್ವರೋಗ-ಸಂಕಷ್ಟಗಳಿಂದ ಅಭೇದ್ಯ ದೈವಿಕ ರಕ್ಷಣಾ ಕವಚ.",
      te: "దాంపత్య సౌఖ్యం, బుద్ధి వికాసం, ఆరోగ్య రక్షణ, దీర్ఘాయువు మరియు సమస్త ఆపదల నుండి దివ్య రక్షణ కవచం.",
      ta: "தாம்பத்திய சுகம், புத்தி விவேகம், பூரண ஆரோக்கியம், நீண்ட ஆயுள் மற்றும் தெய்வீக ரக்ஷா கவசம் உண்டாகும்.",
      hi: "दांपत्य सुख, बुद्धि का विकास, उत्तम स्वास्थ्य, दीर्घायु तथा समस्त संकटों से अभेद्य सुरक्षा कवच।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Tuesday, Thursday, or Pradosha morning.",
      kn: "ಮಂಗಳವಾರ, ಗುರುವಾರ ಅಥವಾ ಪ್ರದೋಷ ಕಾಲದ ಬೆಳಿಗ್ಗೆ.",
      te: "మంగళవారం, గురువారం లేదా ప్రదోష కాలంలో.",
      ta: "செவ்வாய், வியாழன் அல்லது பிரதோஷ காலையில்.",
      hi: "मंगलवार, गुरुवार अथवा प्रदोष काल में।"
    },
    duration: FULL_DAY,
    shloka: SHLOKA_SHIVA
  },

  shanitilahoma: {
    id: "shanitilahoma",
    icon: "◐",
    name: {
      en: "Shani Tila Homa",
      kn: "ಶನಿ ತಿಲ ಹೋಮ",
      te: "శని తిల హోమం",
      ta: "சனி தில ஹோமம்",
      hi: "शनि तिल होम"
    },
    purpose: {
      en: "For the Sade Sati period and for the slowness that Shani brings to work.",
      kn: "ಸಾಡೇ ಸಾತಿ ಕಾಲಕ್ಕೆ ಮತ್ತು ಶನಿಯಿಂದ ಕೆಲಸದಲ್ಲಿ ಬರುವ ನಿಧಾನಗತಿಗೆ.",
      te: "ఏలినాటి శని కాలానికి మరియు శని వల్ల పనిలో వచ్చే మందగతికి.",
      ta: "ஏழரைச் சனி காலத்திற்கும் சனியால் வேலையில் வரும் தாமதத்திற்கும்.",
      hi: "साढ़े साती की अवधि के लिए और शनि से काम में आने वाली धीमी गति के लिए।"
    },
    benefit: {
      en: "Pending matters start closing and the sense of being stuck slowly lifts.",
      kn: "ಬಾಕಿ ಇರುವ ವಿಷಯಗಳು ಮುಗಿಯತೊಡಗುತ್ತವೆ, ಸಿಲುಕಿಕೊಂಡ ಭಾವನೆ ನಿಧಾನವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.",
      te: "పెండింగ్ విషయాలు పరిష్కారం కావడం మొదలవుతుంది, ఇరుక్కుపోయిన భావన నెమ్మదిగా తగ్గుతుంది.",
      ta: "நிலுவையில் உள்ளவை முடியத் தொடங்கும், சிக்கிக்கொண்ட உணர்வு மெல்ல விலகும்.",
      hi: "रुके हुए काम पूरे होने लगते हैं और अटके होने का भाव धीरे-धीरे कम होता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On a Saturday evening, during the Shani hora.",
      kn: "ಶನಿವಾರ ಸಂಜೆ, ಶನಿ ಹೋರೆಯಲ್ಲಿ.",
      te: "శనివారం సాయంత్రం, శని హోరలో.",
      ta: "சனிக்கிழமை மாலை, சனி ஹோரையில்.",
      hi: "शनिवार की शाम, शनि होरा में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_NAVAGRAHA
  },

  satyanarayana: {
    id: "satyanarayana",
    icon: "❁",
    name: {
      en: "Satyanarayana Pooja",
      kn: "ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ",
      te: "సత్యనారాయణ పూజ",
      ta: "சத்தியநாராயண பூஜை",
      hi: "सत्यनारायण पूजा"
    },
    purpose: {
      en: "A pooja of thanks, offered when a wish has been fulfilled or a vow completed.",
      kn: "ಆಸೆ ಈಡೇರಿದಾಗ ಅಥವಾ ಹರಕೆ ಪೂರೈಸಿದಾಗ ಸಲ್ಲಿಸುವ ಕೃತಜ್ಞತೆಯ ಪೂಜೆ.",
      te: "కోరిక నెరవేరినప్పుడు లేదా మొక్కు తీరినప్పుడు చేసే కృతజ్ఞతా పూజ.",
      ta: "விருப்பம் நிறைவேறியபோது அல்லது நேர்த்திக்கடன் முடிந்தபோது செய்யும் நன்றிப் பூஜை.",
      hi: "इच्छा पूरी होने पर या मन्नत पूरी होने पर की जाने वाली कृतज्ञता की पूजा।"
    },
    benefit: {
      en: "Brings contentment at home and blesses new work started in the family.",
      kn: "ಮನೆಯಲ್ಲಿ ಸಮಾಧಾನ ತರುತ್ತದೆ, ಕುಟುಂಬದಲ್ಲಿ ಆರಂಭಿಸಿದ ಹೊಸ ಕೆಲಸಕ್ಕೆ ಶುಭ ನೀಡುತ್ತದೆ.",
      te: "ఇంట్లో సంతృప్తిని తెస్తుంది, కుటుంబంలో ప్రారంభించిన కొత్త పనికి శుభం కలిగిస్తుంది.",
      ta: "வீட்டில் மனநிறைவைத் தரும், குடும்பத்தில் தொடங்கிய புதிய வேலைக்கு நன்மை அளிக்கும்.",
      hi: "घर में संतोष लाती है और परिवार में शुरू हुए नए काम को शुभ बनाती है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Purnima, or on Ekadashi evening.",
      kn: "ಹುಣ್ಣಿಮೆಯಂದು ಅಥವಾ ಏಕಾದಶಿ ಸಂಜೆ.",
      te: "పౌర్ణమి రోజున లేదా ఏకాదశి సాయంత్రం.",
      ta: "பௌர்ணமியில் அல்லது ஏகாதசி மாலையில்.",
      hi: "पूर्णिमा को अथवा एकादशी की शाम को।"
    },
    duration: SHORT,
    shloka: SHLOKA_SHANTI
  },

  ayushyahoma: {
    id: "ayushyahoma",
    icon: "☘",
    name: {
      en: "Ayushya Homa",
      kn: "ಆಯುಷ್ಯ ಹೋಮ",
      te: "ఆయుష్య హోమం",
      ta: "ஆயுஷ்ய ஹோமம்",
      hi: "आयुष्य होम"
    },
    purpose: {
      en: "For long life and steady health, often done for children and elders.",
      kn: "ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಸ್ಥಿರ ಆರೋಗ್ಯಕ್ಕಾಗಿ, ಸಾಮಾನ್ಯವಾಗಿ ಮಕ್ಕಳಿಗೆ ಮತ್ತು ಹಿರಿಯರಿಗೆ ಮಾಡಲಾಗುತ್ತದೆ.",
      te: "దీర్ఘాయువు మరియు స్థిర ఆరోగ్యం కోసం, సాధారణంగా పిల్లలకు, పెద్దలకు చేస్తారు.",
      ta: "நீண்ட ஆயுளுக்கும் நிலையான ஆரோக்கியத்திற்கும், பொதுவாக குழந்தைகளுக்கும் மூத்தவர்களுக்கும் செய்யப்படுகிறது.",
      hi: "दीर्घायु और स्थिर स्वास्थ्य के लिए, प्रायः बच्चों और बुजुर्गों के लिए किया जाता है।"
    },
    benefit: {
      en: "Protects health through a weak planetary period and calms worry about the family.",
      kn: "ದುರ್ಬಲ ಗ್ರಹ ಕಾಲದಲ್ಲಿ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡುತ್ತದೆ, ಕುಟುಂಬದ ಬಗೆಗಿನ ಚಿಂತೆಯನ್ನು ಶಮನಗೊಳಿಸುತ್ತದೆ.",
      te: "బలహీన గ్రహ కాలంలో ఆరోగ్యాన్ని కాపాడుతుంది, కుటుంబం గురించిన ఆందోళనను తగ్గిస్తుంది.",
      ta: "பலவீனமான கிரக காலத்தில் ஆரோக்கியத்தைக் காக்கும், குடும்பம் குறித்த கவலையைத் தணிக்கும்.",
      hi: "कमजोर ग्रह काल में स्वास्थ्य की रक्षा करता है और परिवार की चिंता शांत करता है।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On your birth star day, in the morning.",
      kn: "ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರದ ದಿನ, ಬೆಳಿಗ್ಗೆ.",
      te: "మీ జన్మ నక్షత్రం రోజున, ఉదయం.",
      ta: "உங்கள் ஜன்ம நட்சத்திர நாளில், காலையில்.",
      hi: "अपने जन्म नक्षत्र के दिन, प्रातःकाल।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHIVA
  }
,
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

  vinayakashanti_sudarshana: {
    id: "vinayakashanti_sudarshana",
    icon: "🔥",
    name: {
      en: "Vinayaka Shanthi & Sudarshana Havana",
      kn: "ವಿನಾಯಕ ಶಾಂತಿ ಮತ್ತು ಸುದರ್ಶನ ಹವನ",
      te: "వినాయక శాంతి మరియు సుదర్శన హవనం",
      ta: "விநாயக சாந்தி மற்றும் சுதர்சன ஹவனம்",
      hi: "विनायक शांति एवं सुदर्शन हवन"
    },
    purpose: {
      en: "To eliminate all obstacles, dispel evil eye/enemy afflictions, and gain Sudarshana protection.",
      kn: "ಸಕಲ ವಿಘ್ನ ನಿವಾರಣೆ, ಶತ್ರು-ದೃಷ್ಟಿ ದೋಷ ಶಮನ ಹಾಗೂ ಮಹಾ ಸುದರ್ಶನ ಚಕ್ರದ ರಕ್ಷಣಾ ಕವಚ ಪ್ರಾಪ್ತಿಗಾಗಿ.",
      te: "సకల విఘ్నాల నివారణ, శత్రు-దిష్టి దోషాల శమనం మరియు మహా సుదర్శన రక్షణ కవచం కొరకు.",
      ta: "சகல தடைகள் நீங்க, சத்ரு-கண் திருஷ்டி தோஷங்கள் விலக மற்றும் சுதர்சன சக்கரத்தின் பாதுகாப்பு பெற.",
      hi: "समस्त विघ्न-बाधाओं के निवारण, शत्रु व कुदृष्टि दोष शमन तथा सुदर्शन चक्र के सुरक्षा कवच हेतु।"
    },
    benefit: {
      en: "Success in undertakings, liberation from adversities, business growth, and family protection.",
      kn: "ಕಾರ್ಯ ಸಿದ್ಧಿ, ಆಪತ್ತುಗಳಿಂದ ಮುಕ್ತಿ, ಸಕಲ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಜಯ, ಆರೋಗ್ಯ ವೃದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಅಭಯ.",
      te: "కార్య సిద్ధి, ఆపదల నుండి విముక్తి, వ్యాపార విజయం, ఆయురారోగ్యాలు మరియు కుటుంబ శాంతి.",
      ta: "காரிய சித்தி, ஆபத்துகளில் இருந்து விடுதலை, தொழில் வெற்றி, ஆரோக்கியம் மற்றும் குடும்ப சுபிட்சம்.",
      hi: "सर्व कार्य सिद्धि, संकटों से मुक्ति, व्यापार व आजीविका में विजय तथा पारिवारिक अभय।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On Sankashti, Shukla Chaturthi, Ekadashi, Wednesday, or on an auspicious Muhurtha.",
      kn: "ಸಂಕಷ್ಟಿ, ಶುಕ್ಲ ಚತುರ್ಥಿ, ಏಕಾದಶಿ, ಬುಧವಾರ ಅಥವಾ ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ.",
      te: "సంకష్ట చతుర్థి, శుక్ల చతుర్థి, ఏకాదశి, బుధవారం లేదా శుభ ముహూర్తంలో.",
      ta: "சங்கடஹர சதுர்த்தி, சுக்ல சதுர்த்தி, ஏகாதசி, புதன்கிழமை அல்லது சுப முகூர்த்தத்தில்.",
      hi: "संकष्टी, शुक्ल चतुर्थी, एकादशी, बुधवार अथवा किसी भी शुभ मुहूर्त में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_GANAPATI
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
,
  custom_pooja: {
    id: "custom_pooja",
    icon: "🪔",
    name: {
      en: "Custom Sacred Pooja / Homa",
      kn: "ವಿಶೇಷ ಪೂಜೆ / ಹೋಮ",
      te: "ప్రత్యేక పూజ / హోమం",
      ta: "சிறப்பு பூஜை / ஹோமம்",
      hi: "विशेष पूजा / होम"
    },
    purpose: {
      en: "Sacred ritual performed according to devotee's sankalpa.",
      kn: "ಭಕ್ತರ ಸಂಕಲ್ಪಾನುಸಾರ ನೆರವೇರಿಸಲಾದ ದೈವಿಕ ಸೇವೆ.",
      te: "భక్తుల సంకల్పం ప్రకారం నిర్వహించిన దివ్య సేవ.",
      ta: "பக்தரின் சங்கல்பத்தின்படி செய்யப்பட்ட புனித சேவை.",
      hi: "भक्त के संकल्प के अनुसार संपन्न पावन सेवा।"
    },
    benefit: {
      en: "Fulfillment of desires and family peace.",
      kn: "ಸಕಲ ಇಷ್ಟಾರ್ಥ ಸಿದ್ಧಿ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಸುಖ-ಶಾಂತಿ.",
      te: "సకల కోరికల ಈడేరిక ಮತ್ತು ಕುಟುಂಬ ಶಾಂತಿ.",
      ta: "சகல விருப்பங்களும் நிறைவேறி குடும்ப அமைதி பெருகும்.",
      hi: "सर्व मनोकामना पूर्ति एवं पारिवारिक शांति।"
    },
    where: GOKARNA_TEMPLE,
    when: {
      en: "On an auspicious Muhurtha.",
      kn: "ಶುಭ ಮುಹೂರ್ತದಲ್ಲಿ.",
      te: "శుభ ముహూర్తంలో.",
      ta: "சுப முகூர்த்தத்தில்.",
      hi: "शुभ मुहूर्त में।"
    },
    duration: HALF_DAY,
    shloka: SHLOKA_SHANTI
  }
};