/**
 * Baggona Panchanga Daily Satkarma Practice Card (ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ)
 * 
 * Prominently featured on DailyDarshanaPage above main contents.
 * Provides:
 * 1. Simple, zero-cost, positive-vibe daily good deed matched to day's Vedic energy.
 * 2. 3-Button Interactive Check-in: Yes (ಹೌದು) | Still Not Yet (ಇನ್ನೂ ಇಲ್ಲ) | No (ಇಲ್ಲ).
 * 3. Dynamic real-time countdown for "Still Not Yet" with inspiring encouragement.
 * 4. Uplifting, guilt-free motivation for "No" encouraging fresh start tomorrow.
 * 5. Full 5-language localization (Kannada, Hindi, Telugu, Tamil, English).
 */

import React, { useState, useEffect, useMemo } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import type { RhythmDay } from "../../core/DailyRhythmEngine";

export interface DailySatkarmaPracticeCardProps {
  day: RhythmDay;
  lang: SevaLang;
  devoteeName?: string;
  panditName?: string;
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
      kn: "ಗುರು ಕೃಪೆ, ಸನ್ಮಾರ್ಗದ ದಾರಿದೀಪ ಹಾಗೂ ಆತ್ಮಗೌರವ ವೃದ್ಧಿಸುತ್ತದೆ.",
      hi: "गुरु कृपा, जीवन में सही दिशा और आत्मिक संतोष प्राप्त होता है।",
      te: "గురు కటాక్షం, జీవితంలో సన్మార్గం మరియు గౌరవం లభిస్తాయి.",
      ta: "குருவருள், நல்வழி மற்றும் மனத்தெளிவு கிட்டும்.",
      en: "Attracts divine blessings, wise direction in life, and deep inner fulfillment."
    }
  },
  // 5: Friday (Shukra / Joy & Evening Lamp)
  {
    icon: "🌸",
    title: {
      kn: "ದೀಪ ಬೆಳಗಿಸಿ & ನಗು ಮುಖದ ಆನಂದ ಹರಡಿ",
      hi: "संध्या दीप प्रज्वलन और मुस्कान बिखेरें",
      te: "దీపారాధన & ఆనందాన్ని పంచడం",
      ta: "தீபமேற்றுதல் & மகிழ்ச்சி பரப்புதல்",
      en: "Light an Evening Lamp & Spread Joy"
    },
    action: {
      kn: "ಸಂಜೆ ಮನೆಯಲ್ಲಿ ಒಂದು ಪುಟ್ಟ ದೀಪವನ್ನು ಪ್ರಾರ್ಥನೆಯೊಂದಿಗೆ ಬೆಳಗಿಸಿ; ಮನೆಯವರಲ್ಲಿ ಅಥವಾ ಸ್ನೇಹಿತರಲ್ಲಿ ನಗು ತರುವ ಮಾತಾಡಿ.",
      hi: "शाम को घर में श्रद्धा से एक दीपक जलाएं; परिवार या मित्रों के चेहरे पर मुस्कान लाने वाली बात करें।",
      te: "సాయంత్రం ఇంట్లో భక్తితో దీపం వెలిగించండి; కుటుంబ సభ్యులకు లేదా మిత్రులకు సంతోషాన్నిచ్చే మాట చెప్పండి.",
      ta: "மாலையில் வீட்டில் விளக்கேற்றி பிரார்த்தனை செய்யுங்கள்; குடும்பத்தினர் அல்லது நண்பர்களுக்கு மகிழ்ச்சி தரும் வார்த்தை பேசுங்கள்.",
      en: "Light a gentle evening lamp with prayer; say a warm, cheerful word that brings a genuine smile to someone's face."
    },
    benefit: {
      kn: "ಮನೆಯಲ್ಲಿ ಲಕ್ಷ್ಮೀ ಕೃಪೆ, ಸೌಭಾಗ್ಯ ಮತ್ತು ಆನಂದಮಯ ವಾತಾವರಣ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.",
      hi: "घर में सुख-समृद्धि, सकारात्मक ऊर्जा और सौहार्द का वास होता है।",
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
  panditName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
}) => {
  const ymd = day?.ymd || new Date().toISOString().split("T")[0];
  const storageKey = `baggona_satkarma_${ymd}`;

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

  // Local state for user check-in response
  const [status, setStatus] = useState<SatkarmaStatus>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(storageKey);
        if (saved === "yes" || saved === "not_yet" || saved === "no") return saved;
      }
    } catch {}
    return null;
  });

  // Calculate live hours and minutes left until midnight today
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number }>(() => calculateTimeLeftToday());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeftToday());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  function calculateTimeLeftToday(): { hours: number; minutes: number } {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const diffMs = Math.max(0, midnight.getTime() - now.getTime());
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  }

  const handleSelect = (choice: SatkarmaStatus) => {
    setStatus(choice);
    try {
      if (typeof window !== "undefined" && choice) {
        localStorage.setItem(storageKey, choice);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch {}
  };

  // Translated question texts
  const questionLabel = useMemo(() => {
    switch (lang) {
      case "hi": return "क्या आपने आज यह सरल सत्कर्म किया?";
      case "te": return "మీరు ఈ రోజు ఈ సత్కర్మను ఆచరించారా?";
      case "ta": return "இன்று நீங்கள் இந்த நற்செயலைச் செய்தீர்களா?";
      case "en": return "Have you practiced this simple good deed today?";
      default: return "ನೀವು ಇಂದು ಈ ಪುಟ್ಟ ಸತ್ಕರ್ಮವನ್ನು ಆಚರಿಸಿದಿರಾ?";
    }
  }, [lang]);

  const headerTitle = useMemo(() => {
    switch (lang) {
      case "hi": return "ಇಂದಿನ ಸತ್ಕರ್ಮ / आज का शुभ सत्कर्म अभ्यास";
      case "te": return "ಇಂದಿನ ಸತ್ಕರ್ಮ / నేటి సత్కర్మ సంకల్పం";
      case "ta": return "ಇಂದಿನ ಸತ್ಕರ್ಮ / இன்றைய நற்செயல் பயிற்சி";
      case "en": return "Daily Good Karma Practice (ಇಂದಿನ ಸತ್ಕರ್ಮ)";
      default: return "॥ ಇಂದಿನ ಸತ್ಕರ್ಮ ಆಚರಣೆ ॥ (Daily Good Deed)";
    }
  }, [lang]);

  const buttonLabels = useMemo(() => {
    return {
      yes: lang === "kn" ? "✨ ಹೌದು (Done)" : lang === "hi" ? "✨ हाँ (किया)" : lang === "te" ? "✨ చేశాను (Yes)" : lang === "ta" ? "✨ ஆம் (செய்தேன்)" : "✨ Yes (Done)",
      not_yet: lang === "kn" ? "⏳ ಇನ್ನೂ ಇಲ್ಲ (Still Not Yet)" : lang === "hi" ? "⏳ अभी नहीं (Not Yet)" : lang === "te" ? "⏳ ఇంకా లేదు (Not Yet)" : lang === "ta" ? "⏳ இன்னும் இல்லை (Not Yet)" : "⏳ Still Not Yet",
      no: lang === "kn" ? "🌿 ಇಂದು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (No)" : lang === "hi" ? "🌿 आज नहीं हो पाया (No)" : lang === "te" ? "🌿 ఈ రోజు కుదరలేదు (No)" : lang === "ta" ? "🌿 இன்று இயலவில்லை (No)" : "🌿 Not Today"
    };
  }, [lang]);

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
        border: "1px solid rgba(253, 230, 138, 0.25)",
        borderRadius: 14,
        padding: "12px 14px",
        marginBottom: 14
      }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", marginBottom: 6 }}>
          🌟 {satkarma.title[lang] || satkarma.title.kn}
        </div>
        <div style={{ fontSize: 13, color: "#FEF3C7", lineHeight: 1.5, marginBottom: 8 }}>
          {satkarma.action[lang] || satkarma.action.kn}
        </div>
        <div style={{ fontSize: 11, color: "#A7F3D0", fontStyle: "italic", display: "flex", alignItems: "center", gap: 5 }}>
          <span>💎 {lang === "kn" ? "ಫಲ:" : "Benefit:"}</span>
          <span>{satkarma.benefit[lang] || satkarma.benefit.kn}</span>
        </div>
      </div>

      {/* Interactive Check-in Area */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", marginBottom: 10, textAlign: "center" }}>
          ❓ {questionLabel}
        </div>

        {/* 3 Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          marginBottom: status ? 12 : 0
        }}>
          {/* Button 1: Yes */}
          <button
            onClick={() => handleSelect("yes")}
            style={{
              background: status === "yes"
                ? "linear-gradient(135deg, #10B981, #047857)"
                : "rgba(255, 255, 255, 0.08)",
              color: status === "yes" ? "#FFFFFF" : "#D1FAE5",
              border: status === "yes" ? "2px solid #6EE7B7" : "1px solid rgba(110, 231, 183, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: status === "yes" ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none",
              transition: "all 0.2s"
            }}
          >
            {buttonLabels.yes}
          </button>

          {/* Button 2: Still Not Yet */}
          <button
            onClick={() => handleSelect("not_yet")}
            style={{
              background: status === "not_yet"
                ? "linear-gradient(135deg, #D97706, #B45309)"
                : "rgba(255, 255, 255, 0.08)",
              color: status === "not_yet" ? "#FFFFFF" : "#FDE68A",
              border: status === "not_yet" ? "2px solid #FDE68A" : "1px solid rgba(253, 230, 138, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: status === "not_yet" ? "0 4px 14px rgba(217, 119, 6, 0.4)" : "none",
              transition: "all 0.2s"
            }}
          >
            {buttonLabels.not_yet}
          </button>

          {/* Button 3: No */}
          <button
            onClick={() => handleSelect("no")}
            style={{
              background: status === "no"
                ? "linear-gradient(135deg, #4F46E5, #3730A3)"
                : "rgba(255, 255, 255, 0.08)",
              color: status === "no" ? "#FFFFFF" : "#C7D2FE",
              border: status === "no" ? "2px solid #A5B4FC" : "1px solid rgba(165, 180, 252, 0.3)",
              padding: "10px 4px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              textAlign: "center",
              boxShadow: status === "no" ? "0 4px 14px rgba(79, 70, 229, 0.4)" : "none",
              transition: "all 0.2s"
            }}
          >
            {buttonLabels.no}
          </button>
        </div>

        {/* Dynamic Response Box */}
        {status === "yes" && (
          <div style={{
            background: "rgba(6, 78, 59, 0.85)",
            border: "1.5px solid #34D399",
            borderRadius: 12,
            padding: "12px 14px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>🌸 🪔 🌸</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#A7F3D0", marginBottom: 4 }}>
              {lang === "kn" ? "ಅದ್ಭುತ! ಸತ್ಕರ್ಮ ಸಂಪನ್ನಗೊಂಡಿದೆ" : "Wonderful! Good Deed Accomplished"}
            </div>
            <div style={{ fontSize: 12, color: "#ECFDF5", lineHeight: 1.4 }}>
              {lang === "kn"
                ? "ನಿಮ್ಮ ಈ ಸಣ್ಣ ಪುಣ್ಯಕರ್ಮ ನಿಮ್ಮ ಬದುಕಿಗೆ ಸಕಾರಾತ್ಮಕ ಶಕ್ತಿ, ನೆಮ್ಮದಿ ಮತ್ತು ಭಗವಂತನ ಕೃಪೆಯನ್ನು ತರಲಿ. ಸತ್ಕರ್ಮದ ಫಲ ನಿಮ್ಮೊಂದಿಗೆ ಸದಾ ಇರಲಿ!"
                : lang === "hi"
                ? "आपका यह सत्कर्म आपके जीवन में शांति, सकारात्मक ऊर्जा और ईश्वर का आशीर्वाद लाए!"
                : lang === "te"
                ? "మీ ఈ సత్కర్మ మీ జీవితంలో ప్రశాంతత, సానుకూల శక్తి మరియు దైవానుగ్రహాన్ని తెస్తుంది!"
                : lang === "ta"
                ? "உங்கள் இந்த நற்செயல் உங்கள் வாழ்வில் அமைதியையும் நேர்மறை ஆற்றலையும் சேர்க்கட்டும்!"
                : "Your simple good deed radiates peaceful energy and accumulates spiritual blessings for you and your family!"}
            </div>
            <button
              onClick={() => handleSelect(null)}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "none",
                color: "#6EE7B7",
                fontSize: 10,
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              {lang === "kn" ? "ಬದಲಾಯಿಸಿ (Undo)" : "Change response"}
            </button>
          </div>
        )}

        {status === "not_yet" && (
          <div style={{
            background: "rgba(120, 53, 15, 0.85)",
            border: "1.5px solid #FBBF24",
            borderRadius: 12,
            padding: "12px 14px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#FDE68A", marginBottom: 4 }}>
              ⏳ {lang === "kn"
                ? `ಇಂದಿನ ದಿನ ಮುಗಿಯಲು ಇನ್ನೂ ${timeLeft.hours} ಗಂಟೆ ${timeLeft.minutes} ನಿಮಿಷ ಬಾಕಿ ಇದೆ!`
                : `You still have ${timeLeft.hours}h ${timeLeft.minutes}m left today!`}
            </div>
            <div style={{ fontSize: 12, color: "#FEF3C7", lineHeight: 1.4 }}>
              {lang === "kn"
                ? "ಚಿಂತಿಸಬೇಡಿ! ದಿನ ಮುಗಿಯಲು ಇನ್ನೂ ಸಾಕಷ್ಟು ಸಮಯವಿದೆ. ನೀವು ಖಂಡಿತ ಇದನ್ನು ಮಾಡಬಲ್ಲಿರಿ, ನನಗೆ ನಿಮ್ಮ ಮೇಲೆ ನಂಬಿಕೆಯಿದೆ. ಈಗಲೇ 1 ನಿಮಿಷದಲ್ಲಿ ಈ ಪುಟ್ಟ ಕಾರ್ಯ ಮಾಡಿ ದಿನವನ್ನು ಸಾರ್ಥಕಗೊಳಿಸಿ! ✨"
                : lang === "hi"
                ? "चिंता न करें! दिन समाप्त होने में अभी पर्याप्त समय है। आप इसे अवश्य कर सकते हैं। बस 1 मिनट में यह सरल कार्य पूरा करें! ✨"
                : lang === "te"
                ? "చింతించకండి! ఇంకా సమయం ఉంది. మీరు ఖచ్చితంగా చేయగలరు. ఈ రోజే ఈ చిన్న మంచి పనిని పూర్తి చేయండి! ✨"
                : lang === "ta"
                ? "கவலைப்படாதீர்கள்! இன்னும் நேரம் உள்ளது. நீங்கள் இதை நிச்சயம் செய்வீர்கள். 1 நிமிடத்தில் செய்து முடியுங்கள்! ✨"
                : "No worries at all! There is plenty of time left today. I know you can do this, and I know you will. Take a quick moment to do this simple good deed! ✨"}
            </div>
            <button
              onClick={() => handleSelect(null)}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "none",
                color: "#FDE68A",
                fontSize: 10,
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              {lang === "kn" ? "ಬದಲಾಯಿಸಿ (Undo)" : "Change response"}
            </button>
          </div>
        )}

        {status === "no" && (
          <div style={{
            background: "rgba(49, 46, 129, 0.85)",
            border: "1.5px solid #A5B4FC",
            borderRadius: 12,
            padding: "12px 14px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#E0E7FF", marginBottom: 4 }}>
              🌿 {lang === "kn" ? "ಪರವಾಗಿಲ್ಲ! ನಾಳೆ ಹೊಸ ಆರಂಭ" : "That's completely fine! Tomorrow is a fresh start"}
            </div>
            <div style={{ fontSize: 12, color: "#C7D2FE", lineHeight: 1.4 }}>
              {lang === "kn"
                ? "ಇಂದು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ ಚಿಂತಿಸಬೇಡಿ. ನಾಳೆಯಿಂದ ಈ ಸತ್ಕರ್ಮವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ — ಇದು ಇತರರಿಗಷ್ಟೇ ಅಲ್ಲ, ನಿಮ್ಮ ಮನಸ್ಸಿಗೂ ಅಪಾರ ಆಂತರಿಕ ಶಾಂತಿ, ಶಕ್ತಿ ಮತ್ತು ಸಕಾರಾತ್ಮಕತೆಯನ್ನು ತರುತ್ತದೆ! 🌸"
                : lang === "hi"
                ? "आज संभव नहीं हुआ तो कोई बात नहीं। कल से प्रयास करें — यह आपके मन को भी असीम शांति और आत्मबल देगा! 🌸"
                : lang === "te"
                ? "ఈ రోజు కుదరకపోతే పర్వాలేదు. రేపటి నుండి ప్రయత్నించండి — ఇది మీ మనస్సుకు ఎంతో ప్రశాంతతను మరియు శక్తిని ఇస్తుంది! 🌸"
                : lang === "ta"
                ? "இன்று முடியாவிட்டால் பரவாயில்லை. நாளையிலிருந்து தொடங்குங்கள் — இது உங்கள் மனதுக்கும் அமைதியைத் தரும்! 🌸"
                : "Don't worry if it wasn't possible today. Tomorrow is a fresh opportunity. Practicing this brings immense inner peace and strength to you as well! 🌸"}
            </div>
            <button
              onClick={() => handleSelect(null)}
              style={{
                marginTop: 8,
                background: "transparent",
                border: "none",
                color: "#A5B4FC",
                fontSize: 10,
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              {lang === "kn" ? "ಬದಲಾಯಿಸಿ (Undo)" : "Change response"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
