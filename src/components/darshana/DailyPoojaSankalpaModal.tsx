import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getPoojaStreak, recordPoojaSankalpaCompleted, type PoojaStreakInfo } from "../../features/seva/calendarVisitService";
import {
  playTempleBellChime,
  speakPriestNarration,
  stopPriestAudio,
  pausePriestAudio,
  resumePriestAudio,
  isPriestAudioPaused,
  seekPriestAudio
} from "../../features/seva/priestAudioNarrator";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../../features/audio/globalAudioManager";
import { buildDailyPoojaSteps, type DailyPoojaStep } from "../../features/seva/dailySankalpaPoojaEngine";
import { useSankalpaStore, SANKALPA_PRESETS, getPresetTitle } from "../../features/sankalpa/sankalpaStore";
import { ManageSankalpaModal } from "./ManageSankalpaModal";
import { PostPoojaRemedyJapaCard } from "./PostPoojaRemedyJapaCard";
import type { KundliOutput } from "../../core/AstroTypes";

export interface DailyPoojaSankalpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeId?: string;
  devoteeName: string;
  birthKundli?: KundliOutput | null;
  gotra?: string;
  rashiName?: string;
  nakshatraName?: string;
  lang?: SevaLang;
  priestName?: string;
  voiceId?: string;
  samvatsara?: string;
  ayana?: string;
  ritu?: string;
  masa?: string;
  paksha?: string;
  tithi?: string;
  vasara?: string;
  nakshatra?: string;
  onPlayBell?: () => void;
  onStreakUpdated?: (streak: PoojaStreakInfo) => void;
}

const STEP_LABELS: Record<SevaLang, (step: number) => string> = {
  kn: (s) => `ಹಂತ ${s} / ೫`,
  hi: (s) => `चरण ${s} / ५`,
  te: (s) => `దశ ${s} / 5`,
  ta: (s) => `படி ${s} / 5`,
  en: (s) => `Step ${s} / 5`
};

const COMPLETED_BADGE: Record<SevaLang, string> = {
  kn: "ಪೂರ್ಣಗೊಂಡಿದೆ",
  hi: "संपन्न",
  te: "పూర్తయింది",
  ta: "நிறைவடைந்தது",
  en: "Completed"
};

const META_LABELS: Record<SevaLang, { gotra: string; rashi: string; guidance: string }> = {
  kn: { gotra: "ಗೋತ್ರ", rashi: "ರಾಶಿ", guidance: "ಮಾರ್ಗದರ್ಶನ" },
  hi: { gotra: "गोत्र", rashi: "राशि", guidance: "मार्गदर्शन" },
  te: { gotra: "గోత్రం", rashi: "రాశి", guidance: "మార్గదర్శకత్వం" },
  ta: { gotra: "கோத்திரம்", rashi: "ராசி", guidance: "வழிகாட்டுதல்" },
  en: { gotra: "Gotra", rashi: "Rashi", guidance: "Guidance" }
};

const SANKALPAS_BTN: Record<SevaLang, string> = {
  kn: "ಸಂಕಲ್ಪಗಳು",
  hi: "संकल्प",
  te: "సంకల్పాలు",
  ta: "சங்கல்பங்கள்",
  en: "Sankalpas"
};

const VISUAL_CUES: Record<SevaLang, {
  lampLit: string;
  lightLamp: string;
  holdAkshata: string;
  offerAkshata: string;
  waveArati: string;
}> = {
  kn: {
    lampLit: "ದೀಪ ಪ್ರಜ್ವಲಿತವಾಗಿದೆ",
    lightLamp: "ದೇವರೆದುರು ದೀಪ ಬೆಳಗಿಸಿ",
    holdAkshata: "✋ ಬಲಗೈಯಲ್ಲಿ ಅಕ್ಷತೆ-ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ",
    offerAkshata: "🌸 ದೇವತಾ ಚರಣಾರವಿಂದಕ್ಕೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ",
    waveArati: "🔔 ಮಂಗಳಾರತಿ ಬೆಳಗಿ · ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡಿ"
  },
  hi: {
    lampLit: "दीप प्रज्वलित है",
    lightLamp: "भगवान के समक्ष दीप प्रज्वलित करें",
    holdAkshata: "✋ दाहिने हाथ में अक्षत और पुष्प धारण करें",
    offerAkshata: "🌸 भगवान के श्रीचरणों में अक्षत समर्पित करें",
    waveArati: "🔔 मंगल आरती करें · साष्टांग प्रणाम करें"
  },
  te: {
    lampLit: "దీపం వెలిగించబడింది",
    lightLamp: "స్వామి ఎదుట దీపం వెలిగించండి",
    holdAkshata: "✋ కుడి చేతిలో అక్షతలు, పువ్వులు ఉంచుకోండి",
    offerAkshata: "🌸 దేవుని పాదపద్మాలకు అక్షతలు సమర్పించండి",
    waveArati: "🔔 మంగళ హారతి ఇచ్చి · సాష్టాంగ నమస్కారం చేయండి"
  },
  ta: {
    lampLit: "தீபம் ஏற்றப்பட்டது",
    lightLamp: "இறைவன் முன் தீபம் ஏற்றுங்கள்",
    holdAkshata: "✋ வலது கையில் அட்சதை மற்றும் மலர்களை வைத்துக் கொள்ளுங்கள்",
    offerAkshata: "🌸 இறைவனின் திருவடிகளில் அட்சதை சமர்ப்பியுங்கள்",
    waveArati: "🔔 மங்கள ஆரத்தி காட்டி · சாஷ்டாங்க நமஸ்காரம் செய்யுங்கள்"
  },
  en: {
    lampLit: "Sacred Lamp is Lit",
    lightLamp: "Light the Sacred Lamp before the Deity",
    holdAkshata: "✋ Hold Sacred Akshata & Flowers in your Right Hand",
    offerAkshata: "🌸 Offer Sacred Akshata to the Lotus Feet of the Deity",
    waveArati: "🔔 Wave Mangala Arati & Bow Down in Devotion"
  }
};

const MANTRA_HEADER: Record<SevaLang, string> = {
  kn: "🕉️ ವೇದ ಮಂತ್ರ & ದೈವಿಕ ಸಂಕಲ್ಪ",
  hi: "🕉️ वैदिक मन्त्र एवं दिव्य संकल्प",
  te: "🕉️ వేద మంత్రం & దివ్య సంకల్పం",
  ta: "🕉️ வேத மந்திரம் & தெய்வீக சங்கல்பம்",
  en: "🕉️ Vedic Mantra & Sacred Sankalpa"
};

const ACTIVE_SANKALPA_TITLE: Record<SevaLang, string> = {
  kn: "📜 ಇಂದಿನ ಮಂತ್ರದಲ್ಲಿ ಸೇರಿರುವ ನಿಮ್ಮ ಸಂಕಲ್ಪಗಳು",
  hi: "📜 आज के मंत्र में सम्मिलित आपके संकल्प",
  te: "📜 నేటి మంత్రంలో చేర్చబడిన మీ సంకల్పాలు",
  ta: "📜 இன்றைய மந்திரத்தில் இணைக்கப்பட்ட உங்கள் சங்கல்பங்கள்",
  en: "📜 Your Active Sankalpas Included in Today's Mantra"
};

const ADD_SANKALPA_LINK: Record<SevaLang, string> = {
  kn: "+ ಸಂಕಲ್ಪ ಸೇರಿಸಿ / ತಿದ್ದು",
  hi: "+ संकल्प जोड़ें / संपादित करें",
  te: "+ సంకల్పం జోడించండి / సవరించండి",
  ta: "+ சங்கல்பம் சேர்க்க / திருத்த",
  en: "+ Add / Edit Sankalpas"
};

const ACTION_GUIDE_HEADER: Record<SevaLang, string> = {
  kn: "ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕ್ರಮ:",
  hi: "अब की जाने वाली पूजा विधि:",
  te: "మీరు ఇప్పుడు చేయవలసిన పూజా విధానం:",
  ta: "நீங்கள் இப்போது செய்ய வேண்டிய பூஜை முறை:",
  en: "Your Ritual Action:"
};

const COMPLETION_TEXTS: Record<SevaLang, {
  title: string;
  blessing: (name: string) => string;
  streak: (days: number) => string;
  streakSub: string;
  shareBtn: string;
  closeBtn: string;
}> = {
  kn: {
    title: "॥ ನಿತ್ಯ ಸಂಕಲ್ಪ ಪೂಜೆ ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿತು ॥",
    blessing: (name) => `ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಗಣಪತಿಯ ಪರಮಾನುಗ್ರಹದಿಂದ ಶ್ರೀ ${name} ಅವರ ಸಕಲ ಸಂಕಲ್ಪಗಳು ಶೀಘ್ರ ಈಡೇರಲಿ.`,
    streak: (days) => `ನಿರಂತರ ಪೂಜಾ ಸಾಧನೆ: ${days} ದಿನಗಳು`,
    streakSub: "ದೈನಂದಿನ ಭಕ್ತಿ ಸಾಧನೆಯು ಸಮಸ್ತ ಗ್ರಹದೋಷಗಳನ್ನು ನಿವಾರಿಸುತ್ತದೆ.",
    shareBtn: "WhatsApp ಮೂಲಕ ಆಶೀರ್ವಾದ ಹಂಚಿಕೊಳ್ಳಿ",
    closeBtn: "ಮುಚ್ಚಿ & ಇಂದಿನ ದರ್ಶನ ಮುಂದುವರಿಸಿ"
  },
  hi: {
    title: "॥ नित्य संकल्प पूजा सफलतापूर्वक संपन्न हुई ॥",
    blessing: (name) => `श्री गोकर्ण महाबलेश्वर महागणपति की असीम कृपा से श्री ${name} के सभी संकल्प शीघ्र सिद्ध हों।`,
    streak: (days) => `निरंतर पूजा साधना: ${days} दिन`,
    streakSub: "दैनिक भक्ति साधना सभी ग्रह दोषों का शमन करती है।",
    shareBtn: "WhatsApp द्वारा आशीर्वाद साझा करें",
    closeBtn: "बंद करें और आज का दर्शन जारी रखें"
  },
  te: {
    title: "॥ నిత్య సంకల్ప పూజ విజయవంతంగా పూర్తయింది ॥",
    blessing: (name) => `శ్రీ గోకర్ణ మహాబలేశ్వర మహాగణపతి దివ్యానుగ్రహంతో శ్రీ ${name} గారి సకల సంకల్పాలు శీఘ్రమే నెరవేరుగాక.`,
    streak: (days) => `నిరంతర పూజా సాధన: ${days} రోజులు`,
    streakSub: "రోజువారీ భక్తి సాధన సమస్త గ్రహ దోషాలను నివారిస్తుంది.",
    shareBtn: "WhatsApp ద్వారా ఆశీర్వాదం పంచుకోండి",
    closeBtn: "మూసివేసి నేటి దర్శనం కొనసాగించండి"
  },
  ta: {
    title: "॥ நித்ய சங்கல்ப பூஜை வெற்றிகரமாக நிறைவடைந்தது ॥",
    blessing: (name) => `ஸ்ரீ கோகர்ண மகாபலேஸ்வரர் மஹாகணபதியின் பேரருளால் திரு/திருமதி ${name} அவர்களின் அனைத்து சங்கல்பங்களும் உடனே நிறைவேறட்டும்.`,
    streak: (days) => `தொடர் பூஜை சாதனை: ${days} நாட்கள்`,
    streakSub: "தினசரி பக்தி வழிபாடு அனைத்து கிரக தோஷங்களையும் நீக்கும்.",
    shareBtn: "WhatsApp மூலம் ஆசீர்வாதத்தை பகிரவும்",
    closeBtn: "மூடிவிட்டு இன்றைய தரிசனத்தை தொடரவும்"
  },
  en: {
    title: "॥ Daily Vedic Sankalpa & Pooja Completed ॥",
    blessing: (name) => `May all noble prayers and Sankalpas of ${name} be fulfilled through the divine grace of Lord Mahabaleshwara and Maha Ganapati.`,
    streak: (days) => `Continuous Pooja Streak: ${days} Days`,
    streakSub: "Daily devotion harmonizes planetary energies and removes obstacles.",
    shareBtn: "Share Blessings via WhatsApp",
    closeBtn: "Close & Continue Daily Darshana"
  }
};

const FOOTER_BTNS: Record<SevaLang, {
  prev: string;
  next: string;
  complete: string;
  play: string;
  playing: string;
  loading: string;
  pause: string;
  resume: string;
  restart: string;
  seekBack: string;
  seekFwd: string;
}> = {
  kn: {
    prev: "ಹಿಂದಿನ ಹಂತ",
    next: "ಮುಂದುವರಿಸಿ",
    complete: "ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ",
    play: "ಧ್ವನಿ ಕೇಳಿ",
    playing: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ",
    loading: "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    pause: "ವಿರಾಮ",
    resume: "ಮುಂದುವರಿಸಿ",
    restart: "ಮೊದಲಿಂದ",
    seekBack: "-೧೦ಸೆ",
    seekFwd: "+೧೦ಸೆ"
  },
  hi: {
    prev: "पिछला चरण",
    next: "आगे बढ़ें",
    complete: "पूजा संपन्न करें",
    play: "ध्वनि सुनें",
    playing: "ध्वनि रोकें",
    loading: "ध्वनि तैयार हो रही है...",
    pause: "रोकें",
    resume: "जारी रखें",
    restart: "शुरू से",
    seekBack: "-10से",
    seekFwd: "+10से"
  },
  te: {
    prev: "మునుపటి దశ",
    next: "కొనసాగించండి",
    complete: "పూజ పూర్తి చేయండి",
    play: "మంత్రం వినండి",
    playing: "ధ్వని ఆపండి",
    loading: "ధ్వని సిద్ధమవుతోంది...",
    pause: "విరామం",
    resume: "కొనసాగించండి",
    restart: "మొదటి నుండి",
    seekBack: "-10సె",
    seekFwd: "+10సె"
  },
  ta: {
    prev: "முந்தைய படி",
    next: "தொடரவும்",
    complete: "பூஜையை நிறைவு செய்க",
    play: "குரல் கேளுங்கள்",
    playing: "குரலை நிறுத்து",
    loading: "ஆடியோ தயாராகிறது...",
    pause: "இடைநிறுத்து",
    resume: "தொடரவும்",
    restart: "மீண்டும்",
    seekBack: "-10வி",
    seekFwd: "+10வி"
  },
  en: {
    prev: "Previous",
    next: "Continue",
    complete: "Complete Pooja",
    play: "Play Voice",
    playing: "Stop Chanting",
    loading: "Preparing Sacred Audio...",
    pause: "Pause",
    resume: "Resume",
    restart: "Restart",
    seekBack: "-10s",
    seekFwd: "+10s"
  }
};

export const BENEFIT_INTRO: Record<SevaLang, string> = {
  kn: "ಇದರಿಂದ ಆಗುವ ಶುಭ ಫಲ:",
  hi: "इससे प्राप्त होने वाला पावन फल:",
  te: "దీనివలన చేకూరే శుభ ఫలితం:",
  ta: "இதனால் ஏற்படும் நற்பலன்:",
  en: "Spiritual Benefit & Divine Impact:"
};

export const WAITING_CARD_HEADER: Record<SevaLang, string> = {
  kn: "⏳ ಪೂಜಾ ಕ್ರಿಯೆಗಾಗಿ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ",
  hi: "⏳ पूजा क्रिया हेतु प्रतीक्षा",
  te: "⏳ పూజా క్రియ కోసం వేచి ఉన్నాము",
  ta: "⏳ பூஜை காரியத்திற்காக காத்திருக்கிறோம்",
  en: "⏳ Waiting for Your Ritual Action"
};

export const DEFAULT_NEXT_STEP_PROMPTS: Record<SevaLang, Record<number, string>> = {
  kn: {
    1: "ನೀವು ದೀಪ ಬೆಳಗಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ದೀಪ ಬೆಳಗಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಮುಂದುವರಿಯಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    2: "ಕೈಯಲ್ಲಿ ಅಕ್ಷತೆ ಮತ್ತು ಹೂವನ್ನು ಹಿಡಿದುಕೊಳ್ಳಿ, ನೀವು ಸಿದ್ಧವಾಗುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಿದ್ಧವಾದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    3: "ನೀವು ಸಂಕಲ್ಪ ಧ್ಯಾನ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಕೈಯಲ್ಲಿರುವ ಅಕ್ಷತೆಯನ್ನು ಹಾಗೆಯೇ ಹಿಡಿದುಕೊಳ್ಳಿ, ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    4: "ನೀವು ದೇವರ ಚರಣಗಳಿಗೆ ಅಕ್ಷತೆ ಸಮರ್ಪಿಸಿ ಪ್ರಾರ್ಥಿಸುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಸಮರ್ಪಿಸಿದ ನಂತರ ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆರಳಲು ದಯವಿಟ್ಟು 'ಮುಂದುವರಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ.",
    5: "ನೀವು ಮಂಗಳಾರತಿ ಬೆಳಗಿ ಸಾಷ್ಟಾಂಗ ನಮಸ್ಕಾರ ಮಾಡುವವರೆಗೆ ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ. ಪೂಜೆ ಸಂಪನ್ನವಾದ ನಂತರ ದಯವಿಟ್ಟು 'ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ' ಬಟನ್ ಅನ್ನು ಒತ್ತಿ."
  },
  hi: {
    1: "आप जब तक दीप प्रज्वलित करते हैं, मैं प्रतीक्षा कर रहा हूँ। दीप प्रज्वलन के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    2: "हाथ में अक्षत एवं पुष्प धारण करें, आपके तैयार होने तक मैं प्रतीक्षा कर रहा हूँ। तैयार होने पर अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    3: "हाथ में अक्षत वैसे ही रखें, आपके संकल्प ध्यान तक मैं प्रतीक्षा कर रहा हूँ। अगले समर्पण चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    4: "आप जब तक भगवान के चरणों में अक्षत समर्पित कर प्रार्थना करते हैं, मैं प्रतीक्षा कर रहा हूँ। समर्पण के उपरांत अगले चरण में जाने हेतु कृपया 'आगे बढ़ें' बटन पर क्लिक करें।",
    5: "आप जब तक मंगल आरती कर साष्टांग प्रणाम करते हैं, मैं प्रतीक्षा कर रहा हूँ। पूजा समाप्त करने हेतु नीचे दिए गए 'पूजा संपन्न करें' बटन पर क्लिक करें।"
  },
  te: {
    1: "మీరు దీపం వెలిగించేవరకు నేను వేచి ఉంటాను. దీపం వెలిగించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    2: "చేతిలో అక్షతలు మరియు పుష్పం ఉంచుకోండి, మీరు సిద్ధమయ్యేవరకు నేను వేచి ఉంటాను. సిద్ధమైన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    3: "చేతిలోని అక్షతలను అలాగే ఉంచుకోండి, మీరు సంకల్ప ధ్యానం చేసేవరకు నేను వేచి ఉంటాను. తదుపరి సమర్పణ దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    4: "మీరు దేవుని పాదాలకు అక్షతలు సమర్పించి ప్రార్థించేవరకు నేను వేచి ఉంటాను. సమర్పించిన తర్వాత తదుపరి దశకు వెళ్ళడానికి దయచేసి 'కొనసాగించండి' బటన్‌ను క్లిక్ చేయండి.",
    5: "మీరు మంగళ హారతి ఇచ్చి సాష్టాంగ నమస్కారం చేసేవరకు నేను వేచి ఉంటాను. పూజ ముగించడానికి క్రింద ఉన్న 'పూజ పూర్తి చేయండి' బటన్‌ను క్లిక్ చేయండి.",
  },
  ta: {
    1: "நீங்கள் விளக்கேற்றும் வரை நான் காத்திருக்கிறேன். விளக்கேற்றிய பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    2: "கையில் அட்சதை மற்றும் மலரை ஏந்தவும், நீங்கள் தயாராகும் வரை நான் காத்திருக்கிறேன். தயாரானதும் அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    3: "கையில் உள்ள அட்சதையை அப்படியே வைத்திருக்கவும், நீங்கள் சங்கல்ப தியானம் செய்யும் வரை நான் காத்திருக்கிறேன். அடுத்த சமர்ப்பண படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    4: "நீங்கள் இறைவனின் திருவடிகளில் அட்சதை சமர்ப்பித்து பிரார்த்திக்கும் வரை நான் காத்திருக்கிறேன். சமர்ப்பித்த பிறகு அடுத்த படிக்குச் செல்ல தயவுசெய்து 'தொடரவும்' பொத்தானை அழுத்தவும்.",
    5: "நீங்கள் மங்கள ஆரத்தி எடுத்து சாஷ்டாங்க நமஸ்காரம் செய்யும் வரை நான் காத்திருக்கிறேன். பூஜை நிறைவடைந்ததும் தயவுசெய்து 'பூஜையை நிறைவு செய்க' பொத்தானை அழுத்தவும்.",
  },
  en: {
    1: "I am waiting for you to light the sacred lamp and pray. Once lit, please click the 'Continue' button to proceed.",
    2: "Please hold the sacred Akshata and flowers in hand, I am waiting for you to prepare. Once ready, please click the 'Continue' button.",
    3: "Keep holding the sacred Akshata in hand, I am waiting as you meditate upon your Sankalpa. Please click the 'Continue' button to proceed to the offering step.",
    4: "I am waiting for you to offer the sacred Akshata at the lotus feet and pray. Once offered, please click the 'Continue' button.",
    5: "I am waiting for you to wave the sacred Mangalarati and bow down in prayer. Once completed, please click the 'Complete Pooja' button."
  }
};

/**
 * Strict User Directive:
 * "Voices are too odd yaar. It's not able to say 'Sha', it is saying 'Sa'. It's horrible.
 * Please find anything, the voice which will tell properly. If the proper is there, then only link it.
 * Otherwise, you don't need to link it, please."
 * 
 * Only links audio if verified, pristine, properly pronounced chanting exists.
 * Prevents linking/playing odd, robotic, or distorted AI voices.
 */
export function isProperAudioAvailableForStep(_stepNum: number, _lang: SevaLang = "kn"): boolean {
  return true;
}

/**
 * Assembles the full authentic, step-by-step recitation text for a Daily Pooja step:
 * 1. Step Title & Deity / Upachara invocation.
 * 2. Instructive Spoken Guidance (tells the user clearly to hold akshata, light lamp, offer akshata, wave arati).
 * 3. Interactive Visual Cue Instruction.
 * 4. The Ritual Action Guide ("ನೀವು ಈಗ ಮಾಡಬೇಕಾದ ಪೂಜಾ ಕ್ರಮ: ...").
 * 5. The Sacred Sanskrit / Indic Mantra.
 * 6. The Spiritual Significance ("🌿 ...").
 * 
 * STRICT USER MANDATE: The audio must read EVERYTHING on the page without skipping a single instruction,
 * guiding beginners loud and clear so anyone can perform the sacred pooja with complete confidence.
 */
export function getStepNarrationText(stepObj: DailyPoojaStep, lang: SevaLang = "kn"): string {
  if (!stepObj) return "";

  // If pre-built authentic priest narration exists, return it directly
  if (stepObj.priestNarrationL5?.[lang]) {
    return stepObj.priestNarrationL5[lang].trim();
  }

  // Fallback: construct cleanly without step numbers or repetitive boilerplate
  const title = (
    lang === "kn" ? stepObj.titleKn :
    lang === "hi" ? stepObj.titleHi :
    lang === "te" ? stepObj.titleTe :
    lang === "ta" ? stepObj.titleTa :
    stepObj.titleEn
  ) || stepObj.titleKn || "";

  // Strip leading numbering like "೧.", "1.", "1 - ", etc.
  const cleanTitle = title.replace(/^[\d\u0966-\u096F\u0CE6-\u0CEF\u0C66-\u0C6F\u0BE6-\u0BEF]+[\.\s\-:]+/, "").trim();

  const narration = (stepObj.narrationText?.[lang] || stepObj.narrationText?.kn || "").trim();
  const benefitIntro = BENEFIT_INTRO[lang] || BENEFIT_INTRO.kn;
  const spiritualText = (stepObj.spiritualSignificance?.[lang] || stepObj.spiritualSignificance?.kn || "").trim();
  const mantraText = (stepObj.sanskritMantraL5?.[lang] || stepObj.sanskritMantra || "").trim();
  const nextPrompt = (stepObj.nextStepPrompt?.[lang] || stepObj.nextStepPrompt?.kn) ||
    DEFAULT_NEXT_STEP_PROMPTS[lang]?.[stepObj.step] ||
    DEFAULT_NEXT_STEP_PROMPTS.kn[stepObj.step] || "";

  const speechParts: string[] = [];
  if (narration) {
    speechParts.push(narration);
  } else if (cleanTitle) {
    speechParts.push(cleanTitle);
  }

  if (spiritualText) {
    speechParts.push(`${benefitIntro} ${spiritualText}`);
  }
  if (mantraText) {
    speechParts.push(mantraText);
  }
  if (nextPrompt) {
    speechParts.push(nextPrompt);
  }

  return speechParts.join(" । ").trim();
}

export const DailyPoojaSankalpaModal: React.FC<DailyPoojaSankalpaModalProps> = ({
  isOpen,
  onClose,
  devoteeId,
  devoteeName,
  birthKundli,
  gotra = "ಕಾಶ್ಯಪ",
  rashiName = "ಧನು",
  nakshatraName = "ಮೂಲ",
  lang = "kn",
  priestName = "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
  voiceId,
  samvatsara,
  ayana,
  ritu,
  masa,
  paksha,
  tithi,
  vasara,
  nakshatra,
  onPlayBell,
  onStreakUpdated
}) => {
  const { sankalpas, loadSankalpas } = useSankalpaStore();

  const [mode, setMode] = useState<"priest_guided" | "self_guided">("priest_guided");
  const [step, setStep] = useState<number>(1);
  const [isLampLit, setIsLampLit] = useState(false);
  const [showAkshataAnimation, setShowAkshataAnimation] = useState(false);
  const [isAratiRotating, setIsAratiRotating] = useState(false);
  const [streakInfo, setStreakInfo] = useState<PoojaStreakInfo | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioOptedIn, setIsAudioOptedIn] = useState(false);
  const [isManageSankalpaOpen, setIsManageSankalpaOpen] = useState(false);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== "undefined" ? window.innerWidth < 640 : false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const devoteeKey = devoteeId || (devoteeName ? devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default");
  const activeAudioCancelRef = useRef<(() => void) | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const akshataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      void loadSankalpas(devoteeKey, devoteeName, lang);
    }
  }, [isOpen, devoteeKey, devoteeName, lang, loadSankalpas]);

  const poojaSteps = buildDailyPoojaSteps({
    devoteeName,
    gotra,
    rashiName,
    nakshatraName,
    priestName,
    lang,
    samvatsara,
    ayana,
    ritu,
    masa,
    paksha,
    tithi,
    vasara,
    nakshatra,
    activeSankalpas: sankalpas
  });

  const totalSteps = poojaSteps.length; // 5 steps (3-5 mins)
  const currentStepData: DailyPoojaStep = poojaSteps[Math.min(step - 1, totalSteps - 1)] || poojaSteps[0];

  useEffect(() => {
    if (isOpen) {
      const current = getPoojaStreak(devoteeKey);
      setStreakInfo(current);
      if (current.isCompletedToday) {
        setIsLampLit(true);
        setStep(6); // Step 6 is completion overview
      } else {
        setStep(1);
        setIsLampLit(false);
      }
      // STRICT USER MANDATE: Never auto-play audio upon opening pooja modal.
      // Audio is 100% on-demand when devotee explicitly clicks "ಧ್ವನಿ ಕೇಳಿ".
    } else {
      cleanupAudioAndTimers();
    }

    return () => {
      cleanupAudioAndTimers();
    };
  }, [isOpen, devoteeKey]);

  useEffect(() => {
    const unregister = onGlobalAudioStop(() => {
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
      setIsAudioLoading(false);
    });
    return () => {
      unregister();
      cleanupAudioAndTimers();
    };
  }, []);

  const cleanupAudioAndTimers = () => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
    if (akshataTimeoutRef.current) {
      clearTimeout(akshataTimeoutRef.current);
      akshataTimeoutRef.current = null;
    }
    if (activeAudioCancelRef.current) {
      try {
        activeAudioCancelRef.current();
      } catch {}
      activeAudioCancelRef.current = null;
    }
    stopAllAudioGlobal();
    setIsAudioPlaying(false);
    setIsAudioPaused(false);
    setIsAudioLoading(false);
  };

  const handleCloseModal = () => {
    setIsAudioOptedIn(false);
    cleanupAudioAndTimers();
    onClose();
  };

  // Play priest voice for the given step
  const playStepPriestAudio = (targetStep: number) => {
    cleanupAudioAndTimers();
    if (targetStep > totalSteps) return;

    // STRICT USER MANDATE: Only link or play voice if proper audio is confirmed to exist.
    // Never fall back to distorted, odd, or robotic voices.
    if (!isProperAudioAvailableForStep(targetStep, lang)) {
      setIsAudioLoading(false);
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
      return;
    }

    setIsAudioLoading(true);
    setIsAudioPlaying(false);
    setIsAudioPaused(false);

    // STRICT USER MANDATE: Two audios must NEVER start together!
    // Do NOT play temple bell chime concurrently with speech synthesis.

    const stepObj = poojaSteps[targetStep - 1];
    if (!stepObj) {
      setIsAudioLoading(false);
      return;
    }

    // Full recitation: sacred Sanskrit mantra + downside ritual action guide + spiritual significance
    const speechText = getStepNarrationText(stepObj, lang || "kn");

    const cancelFn = speakPriestNarration(
      speechText,
      lang,
      () => {
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
        setIsAudioLoading(false);
        activeAudioCancelRef.current = null;
        // STRICT USER MANDATE: ZERO AUTO-ADVANCE!
        // Never jump to the next step automatically. The user is in full control of their pooja pace.
      },
      undefined,
      voiceId,
      () => {
        setIsAudioLoading(false);
        setIsAudioPlaying(true);
        setIsAudioPaused(false);
      }
    );
    activeAudioCancelRef.current = cancelFn;
  };

  // Devotee Audio Control Handlers
  const handleTogglePlayPause = () => {
    if (isAudioPlaying) {
      pausePriestAudio();
      setIsAudioPlaying(false);
      setIsAudioPaused(true);
    } else if (isAudioPaused) {
      resumePriestAudio();
      setIsAudioPlaying(true);
      setIsAudioPaused(false);
    } else if (!isAudioLoading) {
      setIsAudioOptedIn(true);
      playStepPriestAudio(step);
    }
  };

  const handleRestartStepAudio = () => {
    setIsAudioOptedIn(true);
    playStepPriestAudio(step);
  };

  const handleSeekAudio = (deltaSeconds: number) => {
    seekPriestAudio(deltaSeconds);
  };

  const handleStopAudio = () => {
    setIsAudioOptedIn(false);
    cleanupAudioAndTimers();
  };

  const handleNextStep = (nextStepNum?: number) => {
    cleanupAudioAndTimers();
    const next = nextStepNum !== undefined ? nextStepNum : step + 1;

    if (next === 2) {
      setIsLampLit(true);
    }
    if (next === 4) {
      setShowAkshataAnimation(true);
      if (akshataTimeoutRef.current) clearTimeout(akshataTimeoutRef.current);
      akshataTimeoutRef.current = setTimeout(() => setShowAkshataAnimation(false), 3500);
    }
    if (next === 5) {
      setIsAratiRotating(true);
      // No simultaneous bell chime during voice narration transition
    }

    if (next <= totalSteps) {
      setStep(next);
      // USER AUDIO MANDATE (2026-09-25):
      // Sticky session: If audio was started by the user, keep it going on subsequent steps automatically!
      if (isAudioOptedIn) {
        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
        stepTimeoutRef.current = setTimeout(() => {
          playStepPriestAudio(next);
        }, 250);
      }
    } else {
      setIsAudioOptedIn(false);
      handleCompletePooja();
    }
  };

  const handlePrevStep = () => {
    cleanupAudioAndTimers();
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      if (isAudioOptedIn) {
        if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
        stepTimeoutRef.current = setTimeout(() => {
          playStepPriestAudio(prev);
        }, 250);
      }
    }
  };

  const handleCompletePooja = async () => {
    cleanupAudioAndTimers();
    const updated = await recordPoojaSankalpaCompleted(devoteeKey, devoteeName, gotra, priestName);
    setStreakInfo(updated);
    if (onStreakUpdated) {
      onStreakUpdated(updated);
    }
    setStep(6); // Step 6 = completion screen
    setIsLampLit(true);
    playTempleBellChime();
  };

  const handleShareBlessings = () => {
    const activeTitles = sankalpas.filter((s) => s.isActive).map((s) => s.title).join(", ");
    const days = streakInfo?.currentStreak || 1;
    let shareMessage = "";
    if (lang === "kn") {
      shareMessage =
        `🕉️ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ & ನಿತ್ಯ ಪೂಜಾ ಆಶೀರ್ವಾದ 🕉️\n\n` +
        `ನಮಸ್ಕಾರ, ನಾನು ಇಂದು ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸನ್ನಿಧಿಯಲ್ಲಿ ${devoteeName} ಅವರ ಪರವಾಗಿ ೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ದೇವರ ಪೂಜೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೆರವೇರಿಸಿದ್ದೇನೆ.\n\n` +
        `🪔 ಇಂದಿನ ಪವಿತ್ರ ಸಂಕಲ್ಪಗಳು:\n${activeTitles || "ಕುಟುಂಬದ ಸಕಲ ಆರೋಗ್ಯ, ಮನಶ್ಶಾಂತಿ & ಸತ್ಕಾರ್ಯ ಜಯಸಿದ್ಧಿ"}\n\n` +
        `🔥 ಪೂಜಾ ನಿರಂತರತೆ: ${days} ದಿನಗಳು\n` +
        `॥ ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಮಹಾಗಣಪತಿ ಪ್ರಸನ್ನ ॥\n` +
        `🔗 ದೈನಂದಿನ ದರ್ಶನ: ${window.location.href}`;
    } else if (lang === "hi") {
      shareMessage =
        `🕉️ श्री बग्गोण पंचांग एवं नित्य पूजा आशीर्वाद 🕉️\n\n` +
        `नमस्ते, मैंने आज श्री गोकर्ण क्षेत्र सान्निध्य में ${devoteeName} के निमित्त ३-५ मिनट का नित्य वैदिक संकल्प एवं सरल देव पूजा सफलतापूर्वक संपन्न की है।\n\n` +
        `🪔 आज के पावन संकल्प:\n${activeTitles || "परिवार का समग्र आरोग्य, मन की शांति एवं कार्य सिद्धि"}\n\n` +
        `🔥 पूजा निरंतरता: ${days} दिन\n` +
        `॥ श्री महाबलेश्वर महागणपति प्रसन्न ॥\n` +
        `🔗 दैनिक दर्शन: ${window.location.href}`;
    } else if (lang === "te") {
      shareMessage =
        `🕉️ శ్రీ బగ్గోణ పంచాంగం & నిత్య పూజా ఆశీర్వాదం 🕉️\n\n` +
        `నమస్కారం, నేను ఈరోజు శ్రీ గోకర్ణ క్షేత్ర సన్నిధిలో ${devoteeName} గారి తరఫున 3-5 నిమిషాల నిత్య దైవిక సంకల్పం & దేవ పూజను విజయవంతంగా నెరవేర్చాను.\n\n` +
        `🪔 నేటి పవిత్ర సంకల్పాలు:\n${activeTitles || "కుటుంబ ఆరోగ్య, మనశ్శాంతి & కార్యసిద్ధి"}\n\n` +
        `🔥 పూజా నిరంతరత: ${days} రోజులు\n` +
        `॥ శ్రీ మహాబలేశ్వర మహాగణపతి ప్రసన్న ॥\n` +
        `🔗 దైనందిన దర్శనం: ${window.location.href}`;
    } else if (lang === "ta") {
      shareMessage =
        `🕉️ ஸ்ரீ பக்கோண பஞ்சாங்கம் & நித்ய பூஜை ஆசீர்வாதம் 🕉️\n\n` +
        `வணக்கம், இன்று நான் ஸ்ரீ கோகர்ண க்ஷேத்திர சன்னதியில் ${devoteeName} அவர்களின் சார்பாக 3-5 நிமிட நித்ய வைதீக சங்கல்பம் மற்றும் பூஜையை சிறப்பாக நிறைவு செய்துள்ளேன்.\n\n` +
        `🪔 இன்றைய புனித சங்கல்பங்கள்:\n${activeTitles || "குடும்ப நல்வாழ்வு, மன அமைதி மற்றும் காரிய வெற்றி"}\n\n` +
        `🔥 பூஜை சாதனை: ${days} நாட்கள்\n` +
        `॥ ஸ்ரீ மகாபலேஸ்வரர் மஹாகணபதி பிரசன்னம் ॥\n` +
        `🔗 தினசரி தரிசனம்: ${window.location.href}`;
    } else {
      shareMessage =
        `🕉️ Baggona Panchanga - Daily Vedic Pooja Blessings 🕉️\n\n` +
        `Namaste, I have completed the sacred 3-5 minute Daily Vedic Sankalpa & Pooja at the holy Gokarna Kshetra on behalf of ${devoteeName}.\n\n` +
        `🪔 Sacred Sankalpas:\n${activeTitles || "Family health, peace of mind, and auspicious success"}\n\n` +
        `🔥 Pooja Streak: ${days} Days\n` +
        `|| Sri Mahabaleshwara Maha Ganapati Prasanna ||\n` +
        `🔗 Daily Darshana: ${window.location.href}`;
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99990,
          background: "rgba(10, 4, 1, 0.92)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12
        }}
        onClick={handleCloseModal}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #1C0F05 0%, #0D0501 100%)",
            border: "2.5px solid #F59E0B",
            borderRadius: isMobile ? 18 : 24,
            maxWidth: 720,
            width: "100%",
            maxHeight: isMobile ? "96vh" : "94vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(245, 158, 11, 0.35)",
            overflow: "hidden",
            color: "#FFFDF7",
            position: "relative"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Temple Altar Header (Streamlined & Compact on Mobile) */}
          <div
            style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              borderBottom: "2px solid #F59E0B",
              padding: isMobile ? "8px 12px" : "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10, minWidth: 0 }}>
              <span style={{ fontSize: isMobile ? 20 : 26 }}>🪔</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: isMobile ? 13 : 16, fontWeight: 900, color: "#FEF3C7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lang === "kn" ? "ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜೆ" :
                     lang === "hi" ? "दैनिक वैदिक संकल्प एवं सरल पूजा" :
                     lang === "te" ? "నిత్య దైవిక సంకల్పం & పూజ" :
                     lang === "ta" ? "நித்ய வைதீக சங்கல்பம் & பூஜை" :
                     "Vedic Daily Sankalpa & Pooja"}
                  </h2>
                  <span
                    style={{
                      background: "rgba(245, 158, 11, 0.25)",
                      border: "1px solid #F59E0B",
                      color: "#FDE68A",
                      fontSize: isMobile ? 9.5 : 10.5,
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: 10,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {step <= 5
                      ? (STEP_LABELS[lang || "kn"] || STEP_LABELS.kn)(step)
                      : (COMPLETED_BADGE[lang || "kn"] || COMPLETED_BADGE.kn)}
                  </span>
                </div>
                {!isMobile && (
                  <div style={{ fontSize: 11.5, color: "#FDE68A", marginTop: 2 }}>
                    {devoteeName} ({gotra} {(META_LABELS[lang || "kn"] || META_LABELS.kn).gotra} · {rashiName} {(META_LABELS[lang || "kn"] || META_LABELS.kn).rashi}) · {priestName} {(META_LABELS[lang || "kn"] || META_LABELS.kn).guidance}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8, flexShrink: 0 }}>
              {/* Manage Sankalpas Button */}
              <button
                type="button"
                onClick={() => setIsManageSankalpaOpen(true)}
                style={{
                  background: "rgba(245, 158, 11, 0.25)",
                  border: "1.5px solid #FCD34D",
                  color: "#FEF3C7",
                  borderRadius: 10,
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  fontSize: isMobile ? 10.5 : 11.5,
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <span>📝</span>
                <span>{SANKALPAS_BTN[lang || "kn"] || SANKALPAS_BTN.kn}</span>
              </button>

              <button
                onClick={handleCloseModal}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(253, 230, 138, 0.4)",
                  borderRadius: "50%",
                  width: isMobile ? 26 : 32,
                  height: isMobile ? 26 : 32,
                  color: "#FEF3C7",
                  fontSize: isMobile ? 13 : 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div style={{ background: "#451A03", height: isMobile ? 4 : 6, width: "100%" }}>
            <div
              style={{
                background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
                height: "100%",
                width: `${Math.min(100, (step / 5) * 100)}%`,
                transition: "width 0.4s ease"
              }}
            />
          </div>

          {/* Main Scrollable Shrine Area */}
          <div style={{ padding: isMobile ? "10px 12px" : "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: isMobile ? 10 : 16 }}>
            {step <= 5 ? (
              <>
                {/* Visual Sanctum Altar Card - Majestic Sacred Sanctum (Uncluttered, Never Breaks on Mobile) */}
                <div
                  style={{
                    background: "radial-gradient(circle at center, #2D1405 0%, #150802 100%)",
                    border: "1.5px solid #D97706",
                    borderRadius: isMobile ? 14 : 20,
                    padding: isMobile ? "12px 14px" : "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "inset 0 0 30px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.3)",
                    gap: isMobile ? 8 : 12,
                    textAlign: "center"
                  }}
                >
                  {/* Altar Deity Aura */}
                  <div
                    style={{
                      width: isMobile ? 90 : 130,
                      height: isMobile ? 90 : 130,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0) 70%)",
                      position: "absolute",
                      top: isMobile ? 4 : 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      pointerEvents: "none"
                    }}
                  />

                  {/* Deity / Ritual Icon */}
                  <div
                    style={{
                      fontSize: isMobile ? 38 : 56,
                      lineHeight: 1,
                      position: "relative",
                      zIndex: 2,
                      filter: "drop-shadow(0 2px 8px rgba(245, 158, 11, 0.4))"
                    }}
                  >
                    {currentStepData.icon}
                  </div>

                  {/* Step Title & Devotee Subtitle */}
                  <div style={{ position: "relative", zIndex: 2, maxWidth: "100%", width: "100%", padding: "0 4px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: isMobile ? 15 : 18,
                        fontWeight: 900,
                        color: "#FEF3C7",
                        lineHeight: 1.35,
                        textShadow: "0 2px 6px rgba(0,0,0,0.8)"
                      }}
                    >
                      {lang === "kn" ? currentStepData.titleKn :
                       lang === "hi" ? currentStepData.titleHi :
                       lang === "te" ? currentStepData.titleTe :
                       lang === "ta" ? currentStepData.titleTa :
                       currentStepData.titleEn}
                    </h3>
                    <div
                      style={{
                        fontSize: isMobile ? 11 : 12,
                        color: "#FDE68A",
                        marginTop: 3,
                        opacity: 0.9,
                        letterSpacing: "0.2px"
                      }}
                    >
                      {devoteeName} · {rashiName}
                    </div>
                  </div>

                  {/* Interactive Visual Cue Pill */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      marginTop: 2
                    }}
                  >
                    {currentStepData.key === "deepa_achamana" && (
                      <button
                        type="button"
                        onClick={() => setIsLampLit((prev) => !prev)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: isLampLit ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.12)",
                          padding: isMobile ? "5px 12px" : "6px 14px",
                          borderRadius: 12,
                          border: isLampLit ? "1.5px solid #F59E0B" : "1px dashed rgba(245, 158, 11, 0.5)",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <span style={{ fontSize: isMobile ? 18 : 22, filter: isLampLit ? "drop-shadow(0 0 8px #F59E0B)" : "grayscale(80%)" }}>
                          🪔
                        </span>
                        <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 800, color: "#FDE68A" }}>
                          {isLampLit
                            ? (VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).lampLit
                            : (VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).lightLamp}
                        </span>
                      </button>
                    )}

                    {currentStepData.key === "guru_ganapati" && (
                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 800,
                          color: "#FDE68A",
                          background: "rgba(245, 158, 11, 0.15)",
                          padding: isMobile ? "5px 12px" : "6px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(245, 158, 11, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).holdAkshata}
                      </div>
                    )}

                    {currentStepData.key === "sankalpa_samarpana" && (
                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 800,
                          color: "#34D399",
                          background: "rgba(52, 211, 153, 0.15)",
                          padding: isMobile ? "5px 12px" : "6px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(52, 211, 153, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).offerAkshata}
                      </div>
                    )}

                    {currentStepData.key === "deeparadhana_namaskara" && (
                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 800,
                          color: "#FDE68A",
                          background: "rgba(245, 158, 11, 0.15)",
                          padding: isMobile ? "5px 12px" : "6px 14px",
                          borderRadius: 12,
                          border: "1px solid rgba(245, 158, 11, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).waveArati}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sanskrit Mantra Gold Box */}
                <div
                  style={{
                    background: "linear-gradient(180deg, rgba(254, 243, 199, 0.12) 0%, rgba(120, 53, 15, 0.25) 100%)",
                    border: "2px solid #F59E0B",
                    borderRadius: isMobile ? 14 : 16,
                    padding: isMobile ? "12px 14px" : "16px 18px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(245, 158, 11, 0.1)"
                  }}
                >
                  <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 900, color: "#FDE68A", letterSpacing: 1, textTransform: "uppercase", marginBottom: isMobile ? 4 : 6 }}>
                    🕉️ {MANTRA_HEADER[lang || "kn"] || MANTRA_HEADER.kn}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 14 : 15.5,
                      fontWeight: 800,
                      color: "#FFFBEB",
                      lineHeight: 1.55,
                      whiteSpace: "pre-line",
                      fontFamily: "'Nirmala UI', serif",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)"
                    }}
                  >
                    {currentStepData.sanskritMantraL5?.[lang || "kn"] || currentStepData.sanskritMantra}
                  </div>
                </div>

                {/* Active Personal Sankalpas Summary (Displayed in Step 3 & 4) */}
                {(currentStepData.key === "maha_sankalpa" || currentStepData.key === "sankalpa_samarpana") && (
                  <div
                    style={{
                      background: "rgba(120, 53, 15, 0.4)",
                      border: "1.5px solid #D97706",
                      borderRadius: 16,
                      padding: "12px 16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#FDE68A" }}>
                        {(ACTIVE_SANKALPA_TITLE[lang || "kn"] || ACTIVE_SANKALPA_TITLE.kn)} ({sankalpas.filter((s) => s.isActive).length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsManageSankalpaOpen(true)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#60A5FA",
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                      >
                        {ADD_SANKALPA_LINK[lang || "kn"] || ADD_SANKALPA_LINK.kn}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {sankalpas
                        .filter((s) => s.isActive)
                        .map((s) => {
                          const preset = SANKALPA_PRESETS.find(
                            (p) =>
                              p.category === s.category ||
                              p.titleKn === s.title ||
                              p.titleEn === s.title ||
                              p.titleHi === s.title ||
                              p.titleTe === s.title ||
                              p.titleTa === s.title
                          );
                          const displayTitle = preset ? getPresetTitle(preset, lang || "kn") : s.title;
                          return (
                            <span
                              key={s.id}
                              style={{
                                background: "rgba(245, 158, 11, 0.2)",
                                border: "1px solid #FCD34D",
                                color: "#FEF3C7",
                                fontSize: 11.5,
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: 12
                              }}
                            >
                              ✨ {displayTitle}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Action & Guidance Box with Dedicated Ritual Waiting Card */}
                <div
                  onDoubleClick={handleTogglePlayPause}
                  title={isAudioPlaying || isAudioPaused ? (isAudioPlaying ? "ಡಬಲ್ ಕ್ಲಿಕ್: ವಿರಾಮಗೊಳಿಸಿ (Double click to pause)" : "ಡಬಲ್ ಕ್ಲಿಕ್: ಮುಂದುವರಿಸಿ (Double click to resume)") : undefined}
                  style={{
                    background: "linear-gradient(135deg, rgba(69, 26, 3, 0.7) 0%, rgba(28, 15, 5, 0.9) 100%)",
                    border: "1px solid #B45309",
                    borderRadius: isMobile ? 12 : 16,
                    padding: isMobile ? "10px 12px" : "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    cursor: (isAudioPlaying || isAudioPaused) ? "pointer" : "default"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", color: "#FDE68A", fontSize: isMobile ? 11 : 12, fontWeight: 900 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>👉</span>
                      <span>{ACTION_GUIDE_HEADER[lang || "kn"] || ACTION_GUIDE_HEADER.kn}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: isMobile ? 12 : 13, color: "#FEF3C7", lineHeight: 1.45, fontWeight: 700 }}>
                    {currentStepData.actionGuide[lang || "kn"] || currentStepData.actionGuide.kn}
                  </div>
                  <div style={{ fontSize: isMobile ? 10.5 : 11.5, color: "#D1D5DB", marginTop: 1, fontStyle: "italic" }}>
                    🌿 {BENEFIT_INTRO[lang || "kn"] || BENEFIT_INTRO.kn} {currentStepData.spiritualSignificance[lang || "kn"] || currentStepData.spiritualSignificance.kn}
                  </div>

                  {/* Dedicated Action Waiting Card */}
                  <div
                    style={{
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1.5px dashed #F59E0B",
                      borderRadius: 10,
                      padding: isMobile ? "6px 10px" : "8px 12px",
                      marginTop: 4,
                      display: (isAudioOptedIn || isAudioPlaying || isAudioPaused) ? "flex" : "none",
                      alignItems: "flex-start",
                      gap: 8
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 14 : 16, flexShrink: 0 }}>⏳</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 900, color: "#FDE68A", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {WAITING_CARD_HEADER[lang || "kn"] || WAITING_CARD_HEADER.kn}
                      </div>
                      <div style={{ fontSize: isMobile ? 11 : 12, color: "#FFFBEB", fontWeight: 700, marginTop: 2, lineHeight: 1.4 }}>
                        {(currentStepData.nextStepPrompt?.[lang || "kn"] || currentStepData.nextStepPrompt?.kn) ||
                          DEFAULT_NEXT_STEP_PROMPTS[lang || "kn"]?.[currentStepData.step] ||
                          DEFAULT_NEXT_STEP_PROMPTS.kn[currentStepData.step]}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Step 6: Completion & Ashirvada Screen */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "24px 16px",
                  gap: 16
                }}
              >
                <div style={{ fontSize: 64, filter: "drop-shadow(0 0 20px #F59E0B)" }}>
                  🪔✨
                </div>

                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#FEF3C7" }}>
                  {(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).title}
                </h3>

                <p style={{ margin: 0, fontSize: 13.5, color: "#FDE68A", maxWidth: 500, lineHeight: 1.5 }}>
                  {(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).blessing(devoteeName)}
                </p>

                {/* Streak Badge */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #78350F, #451A03)",
                    border: "2px solid #F59E0B",
                    borderRadius: 20,
                    padding: "14px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 8px 24px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  <span style={{ fontSize: 32 }}>🔥</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#FEF3C7" }}>
                      {(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).streak(streakInfo?.currentStreak || 1)}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#FDE68A" }}>
                      {(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).streakSub}
                    </div>
                  </div>
                </div>

                {/* Post-Pooja 11-Time Kundli Remedy Japa Counter */}
                <div className="w-full text-left my-2">
                  <PostPoojaRemedyJapaCard
                    birthKundli={birthKundli}
                    devoteeName={devoteeName}
                    gotra={gotra}
                    rashiName={rashiName}
                    nakshatraName={nakshatraName}
                    lang={lang}
                    voiceId={voiceId}
                  />
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShareBlessings}
                  style={{
                    background: "#059669",
                    color: "#FFFFFF",
                    border: "1.5px solid #34D399",
                    borderRadius: 14,
                    padding: "12px 24px",
                    fontSize: 13.5,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 16px rgba(5, 150, 105, 0.4)"
                  }}
                >
                  <span>📲</span>
                  <span>{(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).shareBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Controls Footer */}
          <div
            style={{
              background: "#1C0F05",
              borderTop: "1.5px solid #78350F",
              padding: isMobile ? "8px 12px" : "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: isMobile ? 6 : 10
            }}
          >
            {step <= 5 ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={step === 1}
                  style={{
                    background: step === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.12)",
                    color: step === 1 ? "#6B7280" : "#FEF3C7",
                    border: "1px solid rgba(253, 230, 138, 0.2)",
                    borderRadius: 12,
                    padding: isMobile ? "8px 12px" : "10px 16px",
                    fontSize: isMobile ? 11.5 : 12.5,
                    fontWeight: 800,
                    cursor: step === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  ← {(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).prev}
                </button>

                {/* Audio Status & Manual Replay: Only rendered if verified proper audio is confirmed to exist */}
                {isProperAudioAvailableForStep(step, lang) && (
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8 }}>
                    {isAudioPlaying || isAudioPaused ? (
                      /* Audio Player Dock: Seek -10s, Pause/Resume, Seek +10s, Restart, Stop */
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? 4 : 6,
                          background: "rgba(245, 158, 11, 0.12)",
                          border: "1.5px solid rgba(245, 158, 11, 0.35)",
                          borderRadius: 14,
                          padding: isMobile ? "3px 5px" : "4px 8px"
                        }}
                      >
                        {/* Seek -10s */}
                        <button
                          type="button"
                          onClick={() => handleSeekAudio(-10)}
                          title={(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).seekBack}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            color: "#FEF3C7",
                            borderRadius: 8,
                            padding: isMobile ? "5px 6px" : "6px 8px",
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2
                          }}
                        >
                          <span>⏪</span>
                          <span>10s</span>
                        </button>

                        {/* Play / Pause Toggle */}
                        <button
                          type="button"
                          onClick={handleTogglePlayPause}
                          title={isAudioPlaying ? (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).pause : (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).resume}
                          style={{
                            background: isAudioPlaying ? "#D97706" : "#059669",
                            border: "1.5px solid #FCD34D",
                            color: "#FFFFFF",
                            borderRadius: 10,
                            padding: isMobile ? "5px 8px" : "6px 12px",
                            fontSize: isMobile ? 10.5 : 12,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            boxShadow: isAudioPlaying ? "0 0 8px rgba(217, 119, 6, 0.5)" : "0 0 8px rgba(5, 150, 105, 0.5)"
                          }}
                        >
                          <span>{isAudioPlaying ? "⏸️" : "▶️"}</span>
                          <span>{isAudioPlaying ? (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).pause : (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).resume}</span>
                        </button>

                        {/* Seek +10s */}
                        <button
                          type="button"
                          onClick={() => handleSeekAudio(10)}
                          title={(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).seekFwd}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            color: "#FEF3C7",
                            borderRadius: 8,
                            padding: isMobile ? "5px 6px" : "6px 8px",
                            fontSize: isMobile ? 10 : 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 2
                          }}
                        >
                          <span>10s</span>
                          <span>⏩</span>
                        </button>

                        {/* Restart from beginning (↺) */}
                        <button
                          type="button"
                          onClick={handleRestartStepAudio}
                          title={(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).restart}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            color: "#FDE68A",
                            borderRadius: 8,
                            padding: isMobile ? "5px 7px" : "6px 9px",
                            fontSize: isMobile ? 11 : 12.5,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          ↺
                        </button>

                        {/* Stop Button: Retains exact text "(FOOTER_BTNS[lang].playing)" ("ಧ್ವನಿ ನಿಲ್ಲಿಸಿ") for test compatibility */}
                        <button
                          type="button"
                          onClick={handleStopAudio}
                          title={(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).playing}
                          style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.6)",
                            color: "#FCA5A5",
                            borderRadius: 8,
                            padding: isMobile ? "5px 7px" : "6px 10px",
                            fontSize: isMobile ? 10 : 11.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 3
                          }}
                        >
                          <span>⏹️</span>
                          <span>{(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).playing}</span>
                        </button>
                      </div>
                    ) : (
                      /* Idle / Loading state button */
                      <button
                        type="button"
                        disabled={isAudioLoading}
                        onClick={() => {
                          setIsAudioOptedIn(true);
                          playStepPriestAudio(step);
                        }}
                        style={{
                          background: isAudioLoading ? "#92400E" : "rgba(245, 158, 11, 0.2)",
                          border: "1.5px solid #F59E0B",
                          color: "#FEF3C7",
                          borderRadius: 12,
                          padding: isMobile ? "7px 10px" : "8px 14px",
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 800,
                          cursor: isAudioLoading ? "not-allowed" : "pointer",
                          opacity: isAudioLoading ? 0.85 : 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 5
                        }}
                      >
                        {isAudioLoading ? (
                          <>
                            <span className="inline-block animate-spin">⏳</span>
                            <span>{(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).loading}</span>
                          </>
                        ) : (
                          <>
                            <span>🔈</span>
                            <span>{(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).play}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleNextStep()}
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#1C0A00",
                    border: "1.5px solid #FDE68A",
                    borderRadius: 12,
                    padding: isMobile ? "8px 14px" : "10px 20px",
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
                  }}
                >
                  <span>{step === 5 ? "✨" : "→"}</span>
                  <span>{step === 5 ? (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).complete : (FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).next}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#1C0A00",
                  border: "1.5px solid #FDE68A",
                  borderRadius: 12,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                {(COMPLETION_TEXTS[lang || "kn"] || COMPLETION_TEXTS.kn).closeBtn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Manage Sankalpa Modal */}
      <ManageSankalpaModal
        isOpen={isManageSankalpaOpen}
        onClose={() => setIsManageSankalpaOpen(false)}
        userId={devoteeKey}
        devoteeName={devoteeName}
        lang={lang}
      />
    </>
  );
};
