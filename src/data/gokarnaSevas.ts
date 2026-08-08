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
  | "tripindi"
  | "sarpasamskara"
  | "ganapatihoma"
  | "chandihoma"
  | "mrityunjaya"
  | "navagrahashanti"
  | "kujashanti"
  | "shanitilahoma"
  | "satyanarayana"
  | "ayushyahoma";

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
};
