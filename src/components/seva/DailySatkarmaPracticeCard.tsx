/**
 * Baggona Panchanga Daily Satkarma Practice Card (ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ)
 * 
 * Prominently featured on DailyDarshanaPage (strictly on Darshana & Pooja tabs).
 * Provides:
 * 1. Simple, zero-cost, positive-vibe daily good deed matched to day's Vedic energy.
 * 2. 3-Button Interactive Check-in:
 *    - ✨ Yes (ಹೌದು): +1 point to Punya Butte (ಪುಣ್ಯ ಬುಟ್ಟಿ) in DB. Dismisses for the rest of today.
 *    - ⏳ Still Not Yet (ಇನ್ನೂ ಇಲ್ಲ): Snoozes card for 3 hours (clock ticking in DB), reappears after 3h.
 *    - 🌿 No (ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ): +1 point to Karma Butte (ಕರ್ಮ ಬುಟ್ಟಿ) in DB. Dismisses for today.
 * 3. Saves Punya/Karma ledger records silently in DB without exposing raw tallies to UI yet.
 * 4. Full 5-language localization (Kannada, Hindi, Telugu, Tamil, English).
 */

import React, { useState, useEffect, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  shouldShowDailySatkarmaCard,
  recordSatkarmaAction,
  type SatkarmaActionType
} from "../../features/darshana/punyaKarmaService";

export interface DailySatkarmaPracticeCardProps {
  day: RhythmDay;
  lang: SevaLang;
  devoteeName?: string;
  panditName?: string;
  userId?: string;
  devoteeToken?: string;
}

export type SatkarmaStatus = "yes" | "not_yet" | "no" | null;

interface SatkarmaItem {
  icon: string;
  title: Record<SevaLang, string>;
  action: Record<SevaLang, string>;
  benefit: Record<SevaLang, string>;
}

// 7-day weekday satkarmas (Zero-cost, deeply uplifting, doable by anyone)
const WEEKDAY_SATKARMAS: SatkarmaItem[] = [
  // 0: Sunday (Surya / Light & Health)
  {
    icon: "☀️",
    title: {
      kn: "ಸೂರ್ಯ ವಂದನೆ & ಗಿಡಕ್ಕೆ ಜಲಾರ್ಪಣೆ",
      hi: "सूर्य नमस्कार और पौधों को जल",
      te: "సూర్య నమస్కారం & మొక్కలకు నీరు",
      ta: "சூரிய நமஸ்காரம் & செடிகளுக்கு நீர்",
      en: "Morning Gratitude & Water a Plant"
    },
    action: {
      kn: "ಮುಂಜಾನೆ ಪ್ರಕೃತಿಗೆ ನಮಸ್ಕರಿಸಿ, ಒಂದು ಗಿಡಕ್ಕೆ ಪ್ರೀತಿಯಿಂದ ನೀರು ಹಾಕಿ ಅಥವಾ ಮನೆಯ ಹಿರಿಯರಿಗೆ ಒಂದು ಪ್ರೀತಿಯ ಮಾತಾಡಿ.",
      hi: "सुबह प्रकृति का आभार व्यक्त करें, एक पौधे को जल दें या घर के बड़ों से दो मिनट प्रेमपूर्वक बात करें।",
      te: "ఉదయం ప్రకృతికి నమస్కరించి, ఒక మొక్కకు నీరు పోయండి లేదా ఇంట్లోని పెద్దలతో ఆప్యాయంగా మాట్లాడండి.",
      ta: "காலையில் இயற்கையை வணங்கி, ஒரு செடிக்கு நீர் ஊற்றுங்கள் அல்லது வீட்டில் உள்ள பெரியவர்களிடம் அன்பாகப் பேசுங்கள்.",
      en: "Greet the morning sun with gratitude, water a green plant, or share a warm encouraging word with an elder."
    },
    benefit: {
      kn: "ಆರೋಗ್ಯ, ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಕುಟುಂಬದಲ್ಲಿ ಸಕಾರಾತ್ಮಕ ಚೈತನ್ಯ ಹೆಚ್ಚುತ್ತದೆ.",
      hi: "स्वास्थ्य, आत्मविश्वास और परिवार में सकारात्मक ऊर्जा का संचार होता है।",
      te: "ఆరోగ్యం, ఆత్మవిశ్వాసం మరియు కుటుంబంలో సానుకూల శక్తి పెరుగుతుంది.",
      ta: "ஆரோக்கியம், தன்னம்பிக்கை மற்றும் குடும்பத்தில் நேர்மறை ஆற்றல் பெருகும்.",
      en: "Boosts vitality, inner confidence, and spreads radiant warmth around you."
    }
  },
  // 1: Monday (Soma / Peace & Kindness)
  {
    icon: "🕊️",
    title: {
      kn: "ಶಾಂತಿಯ ಮಾತು & ಮೂಕ ಜೀವಿಗಳಿಗೆ ಜಲದಾನ",
      hi: "शांत वाणी और पशु-पक्षियों को जल",
      te: "శాంతమైన మాట & పక్షులకు దాహార్తి తీర్చడం",
      ta: "சாந்தமான சொல் & பறவைகளுக்கு நீர்",
      en: "Kind Words & Fresh Water for Birds"
    },
    action: {
      kn: "ಇಂದು ಯಾರ ಮೇಲೂ ಕೋಪಗೊಳ್ಳದೆ ಶಾಂತವಾಗಿ ಮಾತನಾಡಿ; ಪಕ್ಷಿಗಳಿಗೆ ಅಥವಾ ಪ್ರಾಣಿಗಳಿಗೆ ಸ್ವಲ್ಪ ಕುಡಿಯುವ ನೀರು ಇಡಿ.",
      hi: "आज किसी पर क्रोध न करें, शांत भाव से बात करें; पक्षियों या जानवरों के लिए पीने का पानी रखें।",
      te: "ఈ రోజు ఎవరిపైనా కోపం చూపించకుండా ప్రశాంతంగా మాట్లాడండి; పక్షులకు లేదా జంతువులకు తాగేందుకు నీరు ఉంచండి.",
      ta: "இன்று யாரிடமும் கோபப்படாமல் அமைதியாகப் பேசுங்கள்; பறவைகள் அல்லது விலங்குகளுக்கு குடிநீர் வையுங்கள்.",
      en: "Practice calm patience without anger; keep a small bowl of fresh drinking water outside for birds or animals."
    },
    benefit: {
      kn: "ಮನಸ್ಸಿನ ಒತ್ತಡ ಶಮನವಾಗಿ, ಆಂತರಿಕ ಶಾಂತಿ ಹಾಗೂ ಚಂದ್ರನ ಅನುಗ್ರಹ ಲಭಿಸುತ್ತದೆ.",
      hi: "मानसिक तनाव दूर होकर असीम शांति और मानसिक स्पष्टता मिलती है।",
      te: "మానసిక ప్రశాంతత లభిస్తుంది, ఒత్తిడి దూరమవుతుంది.",
      ta: "மன அமைதி கூடும், மன அழுத்தம் நீங்கி சாந்தம் நிலவும்.",
      en: "Brings profound mental peace, melts daily anxiety, and cultivates gentleness."
    }
  },
  // 2: Tuesday (Mangala / Strength & Helping Hand)
  {
    icon: "🤝",
    title: {
      kn: "ಶ್ರಮಿಕರಿಗೆ ಪ್ರೋತ್ಸಾಹ & ಸಹಾಯ ಹಸ್ತ",
      hi: "सहायक जनों को सम्मान व छोटी सहायता",
      te: "శ్రామికులకు సహాయం & మంచి మాట",
      ta: "உழைப்பாளிகளுக்கு உதவி & நல்வார்த்தை",
      en: "Helping Hand & Encouraging Word"
    },
    action: {
      kn: "ದಾರಿಯಲ್ಲಿ ಶ್ರಮಪಡುವ ಕಾರ್ಮಿಕರಿಗೆ, ಡೆಲಿವರಿ ಮಾಡುವವರಿಗೆ ಅಥವಾ ಮನೆಯಲ್ಲಿ ಕೆಲಸ ಮಾಡುವವರಿಗೆ ಒಂದು ನಗುಮುಖದ ಧನ್ಯವಾದ ತಿಳಿಸಿ.",
      hi: "सफाईकर्मियों, डिलीवरी वालों या सहायकों को मुस्कान के साथ धन्यवाद कहें या कोई छोटी सहायता करें।",
      te: "కార్మికులకు లేదా శ్రమించేవారికి చిరునవ్వుతో ధన్యవాదాలు చెప్పండి లేదా చిన్న సహాయం చేయండి.",
      ta: "உழைக்கும் தொழிலாளர்கள் அல்லது உதவி புரிவோருக்கு புன்னகையுடன் நன்றி கூறி சிறிய உதவி செய்யுங்கள்.",
      en: "Offer a sincere smile of gratitude or a helpful hand to a hardworking worker, delivery person, or helper."
    },
    benefit: {
      kn: "ಋಣಾತ್ಮಕ ದೋಷಗಳು ಕರಗಿ, ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಧೈರ್ಯ ಮತ್ತು ಯಶಸ್ಸು ದೊರೆಯುತ್ತದೆ.",
      hi: "नकारात्मकता दूर होती है और कार्यक्षेत्र में साहस व सफलता मिलती है।",
      te: "ధైర్యం, ఉత్సాహం మరియు కార్యసిద్ధి చేకూరుతాయి.",
      ta: "தடைகள் நீங்கி, தைரியமும் காரிய வெற்றியும் உண்டாகும்.",
      en: "Dissolves obstacles, builds genuine goodwill, and ignites inner courage."
    }
  },
  // 3: Wednesday (Budha / Wisdom & Gratitude)
  {
    icon: "🌾",
    title: {
      kn: "ಪಕ್ಷಿಗಳಿಗೆ ಕಾಳು & ಕೃತಜ್ಞತಾ ಭಾವ",
      hi: "पक्षियों को दाना और धन्यवाद भाव",
      te: "పక్షులకు ఆహారం & కృతజ్ఞతా భావం",
      ta: "பறவைகளுக்கு தானியம் & நன்றி உணர்வு",
      en: "Feed Birds & Express Genuine Thanks"
    },
    action: {
      kn: "ಪಕ್ಷಿಗಳಿಗೆ ಒಂದು ಮುಷ್ಠಿ ಕಾಳು ಅಥವಾ ಅನ್ನದ ಅಗುಳುಗಳನ್ನು ಹಾಕಿ; ನಿಮಗೆ ಸಹಾಯ ಮಾಡಿದ ವ್ಯಕ್ತಿಗೆ ಹೃತ್ಪೂರ್ವಕ ಧನ್ಯವಾದ ಮೆಸೇಜ್ ಕಳುಹಿಸಿ.",
      hi: "पक्षियों को मुट्ठी भर दाना डालें; किसी ऐसे व्यक्ति को दिल से धन्यवाद कहें जिसने कभी आपकी मदद की हो।",
      te: "పక్షులకు గుప్పెడు ధాన్యాలు వేయండి; మీకు సహాయం చేసిన వారికి హృదయపూర్వక ధన్యవాదాలు తెలపండి.",
      ta: "பறவைகளுக்கு கைப்பிடி தானியம் இடுங்கள்; உங்களுக்கு உதவிய ஒருவருக்கு மனமார்ந்த நன்றி கூறுங்கள்.",
      en: "Offer a small fistful of grains to birds; send a heartfelt thank-you message to someone who has helped you."
    },
    benefit: {
      kn: "ಬುದ್ಧಿಶಕ್ತಿ, ಮಾತುಗಾರಿಕೆಯಲ್ಲಿ ಮಾಧುರ್ಯ ಮತ್ತು ಸಂಬಂಧಗಳಲ್ಲಿ ಸೌಹಾರ್ದತೆ ಬೆಳೆಯುತ್ತದೆ.",
      hi: "बुद्धि, वाणी में मिठास और रिश्तों में मधुरता बढ़ती है।",
      te: "జ్ఞానం, వాక్చాతుర్యం మరియు మంచి సంబంధాలు బలపడతాయి.",
      ta: "ஞானம், பேச்சுத் திறன் மற்றும் நல்லுறவு மேம்படும்.",
      en: "Enhances clarity of thought, graceful communication, and harmonious relationships."
    }
  },
  // 4: Thursday (Guru / Respect & Uplifting Knowledge)
  {
    icon: "🪔",
    title: {
      kn: "ಹಿರಿಯರಿಗೆ ನಮನ & ಜ್ಞಾನದ ಹಂಚಿಕೆ",
      hi: "गुरु-जनों का आदर और ज्ञान प्रसार",
      te: "పెద్దలకు నమస్కారం & జ్ఞాన దానం",
      ta: "பெரியோரை வணங்குதல் & நற்சிந்தனை பகிர்வு",
      en: "Respect Elders & Share Uplifting Wisdom"
    },
    action: {
      kn: "ಪೋಷಕರು ಅಥವಾ ಗುರುಗಳನ್ನು ಸ್ಮರಿಸಿ ನಮಸ್ಕರಿಸಿ; ಯಾರಿಗಾದರೂ ಒಂದು ಉಪಯುಕ್ತ, ಸಕಾರಾತ್ಮಕ ಮಾಹಿತಿಯನ್ನು ಪ್ರೀತಿಯಿಂದ ತಿಳಿಸಿ.",
      hi: "माता-पिता या गुरुजनों का स्मरण कर प्रणाम करें; किसी को कोई उपयोगी व प्रेरणादायी बात सिखाएं या बताएं।",
      te: "తల్లిదండ్రులను లేదా గురువులను స్మరించి నమస్కరించండి; ఎవరికైనా మంచి, ఉపయోగపడే విషయాన్ని పంచండి.",
      ta: "பெற்றோர் அல்லது ஆசிரியர்களை வணங்குங்கள்; ஒருவருக்கு பயனுள்ள, நல்ல தகவலை அன்போடு பகிர்ந்து கொள்ளுங்கள்.",
      en: "Bow in reverence to parents/mentors; share an uplifting, positive thought or helpful guidance with someone."
    },
    benefit: {
      kn: "ಗುರುಬಲ ವೃದ್ಧಿಯಾಗಿ, ಕುಟುಂಬದಲ್ಲಿ ಗೌರವ ಮತ್ತು ವಿದ್ಯೆ-ಉದ್ಯೋಗದಲ್ಲಿ ಸಿದ್ಧಿ ಲಭಿಸುತ್ತದೆ.",
      hi: "गुरु कृपा से समाज में मान-सम्मान और ज्ञान-विवेक की वृद्धि होती है।",
      te: "గురు కృప, గౌరవం మరియు విద్యా-వృత్తులలో విజయం కలుగుతాయి.",
      ta: "குருவருள் கூடும், அறிவு விருத்தியாகி சகல நன்மைகளும் சேரும்.",
      en: "Strengthens Jupiter's divine grace, bestows clarity, respect, and auspicious learning."
    }
  },
  // 5: Friday (Shukra / Harmony & Joyful Ambiance)
  {
    icon: "🌸",
    title: {
      kn: "ಮನೆ ಶೃಂಗಾರ & ನಗುಮುಖದ ಮಾತು",
      hi: "गृह शुद्धि और मधुर संभाषण",
      te: "గృహ శోభ & మధుర సంభాషణ",
      ta: "இல்ல தூய்மை & இன்சொல்",
      en: "Cleanse Sanctuary & Speak Joyfully"
    },
    action: {
      kn: "ದೇವರ ಮಂದಿರ ಅಥವಾ ಮನೆಯ ಮುಖ್ಯ ದ್ವಾರವನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ; ಕುಟುಂಬದವರೊಂದಿಗೆ ಸಂತೋಷದಿಂದ ನಗುಮುಖದ ಸಂಭಾಷಣೆ ನಡೆಸಿ.",
      hi: "पूजा स्थल या मुख्य द्वार को स्वच्छ करें; परिवार के साथ आनंदपूर्वक समय बिताएं।",
      te: "పూజా మందిరాన్ని లేదా ఇంటి గుమ్మాన్ని శుభ్రం చేయండి; కుటుంబ సభ్యులతో సంతోషంగా గడపండి.",
      ta: "பூஜை அறை அல்லது வீட்டின் வாசலை தூய்மைப்படுத்துங்கள்; குடும்பத்தோடு மகிழ்ச்சியாகப் பேசுங்கள்.",
      en: "Tidy up your prayer altar or home entrance; bring a joyful, appreciative atmosphere to your family."
    },
    benefit: {
      kn: "ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪೆ, ಸೌಭಾಗ್ಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಮೃದ್ಧಿ ಸದಾ ಮನೆಯಲ್ಲಿ ನೆಲೆಸುತ್ತದೆ.",
      hi: "महालक्ष्मी का वास होता है, सौभाग्य और सुख-समृद्धि में वृद्धि होती है।",
      te: "ఇంట్లో లక్ష్మీ కటాక్షం, ఆనందం మరియు శ్రేయస్సు కలుగుతాయి.",
      ta: "இல்லத்தில் லக்ஷ்மி கடாட்சம், மகிழ்ச்சி மற்றும் அமைதி நிறையும்.",
      en: "Invites auspicious prosperity, peace of mind, and harmonious joy into the home."
    }
  },
  // 6: Saturday (Shani / Compassion & Selfless Action)
  {
    icon: "🐾",
    title: {
      kn: "ಮೂಕ ಪ್ರಾಣಿಗೆ ಆಹಾರ & ನಿಸ್ವಾರ್ಥ ದಯೆ",
      hi: "मूक पशु को भोजन व निःस्वार्थ सेवा",
      te: "జీవకారుణ్యం & నిస్వార్థ సేవ",
      ta: "ஜீவகாருண்யம் & எளியோருக்கு உதவி",
      en: "Feed a Stray Animal & Practice Selfless Kindness"
    },
    action: {
      kn: "ಬೀದಿಯ ನಾಯಿ, ಹಸು ಅಥವಾ ಬೆಕ್ಕಿಗೆ ಒಂದು ಬಿಸ್ಕತ್ತು ಅಥವಾ ರೊಟ್ಟಿ ತಿನ್ನಿಸಿ; ಯಾರ ತಪ್ಪನ್ನೂ ಎಣಿಸದೆ ಕ್ಷಮಿಸಿ ಮುನ್ನಡೆಯಿರಿ.",
      hi: "किसी बेजुबान पशु (कुत्ते, गाय) को रोटी या बिस्कुट खिलाएं; किसी की पुरानी भूल को क्षमा कर मन को हल्का करें।",
      te: "వీధి జంతువులకు రొట్టె లేదా ఆహారం ఇవ్వండి; ఎవరి తప్పైనా క్షమించి ముందుకు సాగండి.",
      ta: "தெரு நாய் அல்லது பசுவிற்கு உணவு கொடுங்கள்; பிறர் தவறை மன்னித்து மனதை அமைதிப்படுத்துங்கள்.",
      en: "Feed a stray dog, cat, or cow a piece of bread/biscuit; forgive a past grievance and let go of resentment."
    },
    benefit: {
      kn: "ಕಷ್ಟಗಳು ಪರಿಹಾರವಾಗಿ, ಶನಿ ದೇವರ ಕೃಪೆ ಮತ್ತು ಅಚಲ ಮಾನಸಿಕ ಶಕ್ತಿ ಲಭಿಸುತ್ತದೆ.",
      hi: "कष्टों का निवारण होता है और मानसिक मजबूती व शनि कृपा मिलती है।",
      te: "శని దేవుని అనుగ్రహం, కష్టాల నివారణ మరియు మనోబలం లభిస్తాయి.",
      ta: "கஷ்டங்கள் நீங்கி, மன உறுதி மற்றும் நற்கர்ம பலன்கள் சேரும்.",
      en: "Dissolves karmic weight, protects against hardships, and grants steadfast inner resilience."
    }
  }
];

export const DailySatkarmaPracticeCard: React.FC<DailySatkarmaPracticeCardProps> = ({
  day,
  lang,
  devoteeName,
  panditName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  userId = "guest_devotee",
  devoteeToken
}) => {
  const ymd = day?.ymd || new Date().toISOString().split("T")[0];

  // Get current weekday (0-6)
  const dayOfWeek = useMemo(() => {
    try {
      const parts = ymd.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    } catch {
      return new Date().getDay();
    }
  }, [ymd]);

  const satkarma = WEEKDAY_SATKARMAS[dayOfWeek] || WEEKDAY_SATKARMAS[0];

  // Local state for user check-in response & DB visibility guard
  const [status, setStatus] = useState<SatkarmaStatus>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Check DB on load for today's dismissal / 3-hour snooze
  useEffect(() => {
    let isMounted = true;
    const checkVisibility = async () => {
      const canShow = await shouldShowDailySatkarmaCard(ymd, userId);
      if (isMounted) {
        setIsVisible(canShow);
      }
    };
    void checkVisibility();
    return () => {
      isMounted = false;
    };
  }, [ymd, userId]);

  const handleSelect = async (choice: SatkarmaStatus) => {
    if (!choice) return;
    setStatus(choice);

    const actionType: SatkarmaActionType =
      choice === "yes" ? "done" : choice === "not_yet" ? "maybe_later" : "no";

    const deedTitle = satkarma.title[lang] || satkarma.title.kn;

    // Record action silently into DB (Punya Butte +1 or Karma Butte +1 or 3-hour snooze)
    await recordSatkarmaAction(actionType, deedTitle, ymd, userId, devoteeToken);

    if (choice === "yes") {
      setFeedbackMessage(
        lang === "kn"
          ? "ಅದ್ಭುತ! ಇಂದಿನ ಪುಣ್ಯ ಕಾರ್ಯ ಸಂಪನ್ನಗೊಂಡಿದೆ. ನಿಮ್ಮ ಪುಣ್ಯ ಬುಟ್ಟಿ ಭರ್ತಿಯಾಗಿದೆ! 🌸"
          : "Wonderful! Good deed accomplished today. Punya recorded! 🌸"
      );
      // Dismiss for the rest of today after 2.5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 2500);
    } else if (choice === "not_yet") {
      setFeedbackMessage(
        lang === "kn"
          ? "ಸರಿ, ೩ ಗಂಟೆಗಳ ನಂತರ ಮತ್ತೆ ನೆನಪಿಸಲಾಗುವುದು (3 Hours Reminder set in DB) ⏳"
          : "Okay, we will remind you in 3 hours ⏳"
      );
      // Dismiss immediately / after short confirmation for 3 hours
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } else if (choice === "no") {
      setFeedbackMessage(
        lang === "kn"
          ? "ಚಿಂತಿಸಬೇಡಿ, ನಾಳೆಯಿಂದ ಈ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿ (Karma entry logged) 🌿"
          : "No worries, make a fresh start tomorrow 🌿"
      );
      // Dismiss for the rest of today after 2 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 2200);
    }
  };

  // If card is dismissed for the day or snoozed for 3h, render null
  if (!isVisible) {
    return null;
  }

  // Translated question texts
  const questionLabel = lang === "hi"
    ? "क्या आपने आज यह सरल सत्कर्म किया?"
    : lang === "te"
    ? "మీరు ఈ రోజు ఈ సత్కర్మను ఆచరించారా?"
    : lang === "ta"
    ? "இன்று நீங்கள் இந்த நற்செயலைச் செய்தீர்களா?"
    : lang === "en"
    ? "Have you practiced this simple good deed today?"
    : "ನೀವು ಇಂದು ಈ ಪುಟ್ಟ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿದಿರಾ?";

  const headerTitle = lang === "hi"
    ? "ಇಂದಿನ ಸತ್ಕರ್ಮ / आज का शुभ सत्कर्म अभ्यास"
    : lang === "te"
    ? "ಇಂದಿನ ಸತ್ಕರ್ಮ / నేటి సత్కర్మ సంకల్పం"
    : lang === "ta"
    ? "ಇಂದಿನ ಸತ್ಕರ್ಮ / இன்றைய நற்செயல் பயிற்சி"
    : lang === "en"
    ? "Daily Good Karma Practice (ಇಂದಿನ ಸತ್ಕರ್ಮ)"
    : "॥ ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ ॥ (DAILY GOOD DEED)";

  const buttonLabels = {
    yes: lang === "kn" ? "✨ ಹೌದು (Done)" : lang === "hi" ? "✨ हाँ (किया)" : lang === "te" ? "✨ చేశాను (Yes)" : lang === "ta" ? "✨ ஆம் (செய்தேன்)" : "✨ Yes (Done)",
    not_yet: lang === "kn" ? "⏳ ಇನ್ನೂ ಇಲ್ಲ (Still Not Yet)" : lang === "hi" ? "⏳ अभी नहीं (Not Yet)" : lang === "te" ? "⏳ ఇంకా లేదు (Not Yet)" : lang === "ta" ? "⏳ இன்னும் இல்லை (Not Yet)" : "⏳ Still Not Yet",
    no: lang === "kn" ? "🌿 ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (No)" : lang === "hi" ? "🌿 आज नहीं हो पाया (No)" : lang === "te" ? "🌿 ఈ రోజు కుదరలేదు (No)" : lang === "ta" ? "🌿 இன்று இயலவில்லை (No)" : "🌿 Not Today"
  };

  return (
    <div style={{
      background: status === "yes" 
        ? "linear-gradient(135deg, rgba(20, 83, 45, 0.95) 0%, rgba(6, 78, 59, 0.98) 100%)"
        : status === "not_yet"
        ? "linear-gradient(135deg, rgba(120, 53, 15, 0.95) 0%, rgba(69, 26, 3, 0.98) 100%)"
        : status === "no"
        ? "linear-gradient(135deg, rgba(55, 48, 163, 0.92) 0%, rgba(30, 27, 75, 0.96) 100%)"
        : "linear-gradient(135deg, rgba(69, 26, 3, 0.95) 0%, rgba(41, 14, 0, 0.98) 100%)",
      border: status === "yes" ? "2px solid #34D399" : status === "not_yet" ? "2px solid #FBBF24" : "2px solid #D4AF37",
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.55)",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Top Header Tag */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{satkarma.icon}</span>
          <span style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#FDE68A",
            textTransform: "uppercase",
            letterSpacing: 1
          }}>
            {headerTitle}
          </span>
        </div>
        <span style={{
          fontSize: 10,
          background: "rgba(212, 175, 55, 0.2)",
          color: "#FDE68A",
          border: "1px solid #D4AF37",
          padding: "2px 8px",
          borderRadius: 12,
          fontWeight: 800
        }}>
          {lang === "kn" ? "ಉಚಿತ & ಸರಳ" : "Zero-Cost Karma"}
        </span>
      </div>

      {/* Main Good Deed Description */}
      <div style={{
        background: "rgba(0, 0, 0, 0.35)",
        borderRadius: 14,
        padding: "12px 14px",
        border: "1px solid rgba(251, 191, 36, 0.3)",
        marginBottom: 12
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#FFFFFF", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span>⭐</span>
          <span>{satkarma.title[lang] || satkarma.title.kn}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "#FEF3C7", lineHeight: 1.55, marginBottom: 8 }}>
          {satkarma.action[lang] || satkarma.action.kn}
        </div>
        <div style={{ fontSize: 11.5, color: "#86EFAC", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6 }}>
          <span>💎 {lang === "kn" ? "ಫಲ:" : "Benefit:"}</span>
          <span>{satkarma.benefit[lang] || satkarma.benefit.kn}</span>
        </div>
      </div>

      {/* Confirmation / Feedback Message banner if clicked */}
      {feedbackMessage ? (
        <div style={{
          background: status === "yes" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)",
          border: status === "yes" ? "1px solid #34D399" : "1px solid #FDE68A",
          borderRadius: 12,
          padding: "10px 14px",
          textAlign: "center",
          color: "#FEF3C7",
          fontSize: 13,
          fontWeight: 800,
          animation: "pulse 1.5s infinite"
        }}>
          {feedbackMessage}
        </div>
      ) : (
        <>
          {/* Question Prompt */}
          <div style={{ textAlign: "center", marginBottom: 10, fontSize: 12.5, fontWeight: 800, color: "#FDE68A" }}>
            ❓ {questionLabel}
          </div>

          {/* 3-Button Interactive Check-in */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button
              type="button"
              onClick={() => handleSelect("yes")}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                border: "1.5px solid #34D399",
                borderRadius: 12,
                padding: "8px 4px",
                fontSize: 11.5,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
              }}
            >
              <span>{buttonLabels.yes}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelect("not_yet")}
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#1C0A00",
                border: "1.5px solid #FDE68A",
                borderRadius: 12,
                padding: "8px 4px",
                fontSize: 11.5,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
              }}
            >
              <span>{buttonLabels.not_yet}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelect("no")}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                color: "#FDE68A",
                border: "1px solid rgba(251, 191, 36, 0.4)",
                borderRadius: 12,
                padding: "8px 4px",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center"
              }}
            >
              <span>{buttonLabels.no}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
