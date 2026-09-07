import React, { useState, useEffect, useRef } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import { getPoojaStreak, recordPoojaSankalpaCompleted, type PoojaStreakInfo } from "../../features/seva/calendarVisitService";
import { playTempleBellChime, speakPriestNarration, stopPriestAudio } from "../../features/seva/priestAudioNarrator";
import { prewarmIndicAudio } from "../../features/audio/aiVoiceCloneEngine";
import { stopAllAudioGlobal, onGlobalAudioStop } from "../../features/audio/globalAudioManager";
import { buildDailyPoojaSteps, type DailyPoojaStep } from "../../features/seva/dailySankalpaPoojaEngine";
import { useSankalpaStore } from "../../features/sankalpa/sankalpaStore";
import { ManageSankalpaModal } from "./ManageSankalpaModal";
import { PostPoojaRemedyJapaCard } from "./PostPoojaRemedyJapaCard";
import { VedicAudioLoaderModal } from "../ui/VedicAudioLoaderModal";
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
}> = {
  kn: {
    prev: "ಹಿಂದಿನ ಹಂತ",
    next: "ಮುಂದಿನ ಹಂತ",
    complete: "ಪೂಜೆ ಸಂಪೂರ್ಣಗೊಳಿಸಿ",
    play: "ಧ್ವನಿ ಕೇಳಿ",
    playing: "ಧ್ವನಿ ನಿಲ್ಲಿಸಿ...",
    loading: "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..."
  },
  hi: {
    prev: "पिछला चरण",
    next: "अगला चरण",
    complete: "पूजा संपन्न करें",
    play: "ध्वनि सुनें",
    playing: "ध्वनि रोकें...",
    loading: "ध्वनि तैयार हो रही है..."
  },
  te: {
    prev: "మునుపటి దశ",
    next: "తరువాతి దశ",
    complete: "పూజ పూర్తి చేయండి",
    play: "మంత్రం వినండి",
    playing: "ధ్వని ఆపండి...",
    loading: "ధ్వని సిద్ధమవుతోంది..."
  },
  ta: {
    prev: "முந்தைய படி",
    next: "அடுத்த படி",
    complete: "பூஜையை நிறைவு செய்க",
    play: "குரல் கேளுங்கள்",
    playing: "குரலை நிறுத்து...",
    loading: "ஆடியோ தயாராகிறது..."
  },
  en: {
    prev: "Previous",
    next: "Next Step",
    complete: "Complete Pooja",
    play: "Play Voice",
    playing: "Stop Chanting...",
    loading: "Preparing Sacred Audio..."
  }
};

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
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);
  const [isLampLit, setIsLampLit] = useState(false);
  const [showAkshataAnimation, setShowAkshataAnimation] = useState(false);
  const [isAratiRotating, setIsAratiRotating] = useState(false);
  const [streakInfo, setStreakInfo] = useState<PoojaStreakInfo | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isManageSankalpaOpen, setIsManageSankalpaOpen] = useState(false);

  const devoteeKey = devoteeId || (devoteeName ? devoteeName.toLowerCase().replace(/[^a-z0-9]/g, "_") : "devotee_default");
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeAudioCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      void loadSankalpas(devoteeKey, devoteeName);
    }
  }, [isOpen, devoteeKey, devoteeName, loadSankalpas]);

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
      if (mode === "priest_guided" && !current.isCompletedToday) {
        playStepPriestAudio(1);
      }
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
      setIsAudioLoading(false);
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    });
    return () => {
      unregister();
      cleanupAudioAndTimers();
    };
  }, []);

  const cleanupAudioAndTimers = () => {
    if (activeAudioCancelRef.current) {
      try {
        activeAudioCancelRef.current();
      } catch {}
      activeAudioCancelRef.current = null;
    }
    stopAllAudioGlobal();
    setIsAudioPlaying(false);
    setIsAudioLoading(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const handleCloseModal = () => {
    cleanupAudioAndTimers();
    onClose();
  };

  // Play priest voice for the given step
  const playStepPriestAudio = (targetStep: number) => {
    cleanupAudioAndTimers();
    if (targetStep > totalSteps) return;

    setIsAudioLoading(true);
    setIsAudioPlaying(false);

    // STRICT USER MANDATE: Two audios must NEVER start together!
    // Do NOT play temple bell chime concurrently with speech synthesis.

    const stepObj = poojaSteps[targetStep - 1];
    if (!stepObj) {
      setIsAudioLoading(false);
      return;
    }

    // Full text dynamic recitation: Localized Sanskrit Mantra + Narration + Action Guide
    const mantraText = stepObj.sanskritMantraL5?.[lang || "kn"] || stepObj.sanskritMantra;
    const stepNarration = stepObj.narrationText[lang || "kn"] || stepObj.narrationText.kn;
    const stepAction = stepObj.actionGuide[lang || "kn"] || stepObj.actionGuide.kn;

    const cleanMantra = (mantraText || "").trim();
    const cleanNarration = (stepNarration || "").trim();
    const cleanAction = (stepAction || "").trim();
    const speechText = `${cleanMantra}\n\n${cleanNarration}\n\n${cleanAction}`;

    const cancelFn = speakPriestNarration(
      speechText,
      lang,
      () => {
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
        activeAudioCancelRef.current = null;
        // Automatic continuous transition for 2 to 5 minutes hands-free sacred pooja
        if (isAutoPlay) {
          if (targetStep < totalSteps) {
            autoPlayTimerRef.current = setTimeout(() => {
              handleNextStep(targetStep + 1);
            }, 1200);
          } else if (targetStep === totalSteps) {
            autoPlayTimerRef.current = setTimeout(() => {
              handleCompletePooja();
            }, 1500);
          }
        }
      },
      undefined,
      voiceId,
      () => {
        setIsAudioLoading(false);
        setIsAudioPlaying(true);
      }
    );
    activeAudioCancelRef.current = cancelFn;
  };

  // Pre-warm all 5 Pooja Steps into device/server cache so 2-5 min continuous pooja is instantaneous
  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    const timer = setTimeout(() => {
      poojaSteps.forEach((s) => {
        const mantraText = s.sanskritMantraL5?.[lang || "kn"] || s.sanskritMantra;
        const stepNarration = s.narrationText[lang || "kn"] || s.narrationText.kn;
        const stepAction = s.actionGuide[lang || "kn"] || s.actionGuide.kn;
        const speechText = `${(mantraText || "").trim()}\n\n${(stepNarration || "").trim()}\n\n${(stepAction || "").trim()}`;
        void prewarmIndicAudio(speechText, lang || "kn");
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [isOpen, poojaSteps, lang]);

  const handleNextStep = (nextStepNum?: number) => {
    const next = nextStepNum !== undefined ? nextStepNum : step + 1;

    if (next === 2) {
      setIsLampLit(true);
    }
    if (next === 4) {
      setShowAkshataAnimation(true);
      setTimeout(() => setShowAkshataAnimation(false), 3500);
    }
    if (next === 5) {
      setIsAratiRotating(true);
      // No simultaneous bell chime during voice narration transition
    }

    if (next <= totalSteps) {
      setStep(next);
      if (mode === "priest_guided") {
        playStepPriestAudio(next);
      }
    } else {
      handleCompletePooja();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      const prev = step - 1;
      setStep(prev);
      if (mode === "priest_guided") {
        playStepPriestAudio(prev);
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
            borderRadius: 24,
            maxWidth: 720,
            width: "100%",
            maxHeight: "94vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(245, 158, 11, 0.35)",
            overflow: "hidden",
            color: "#FFFDF7",
            position: "relative"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Temple Altar Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
              borderBottom: "2px solid #F59E0B",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>🪔</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#FEF3C7" }}>
                    {lang === "kn" ? "೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ದೈವಿಕ ಸಂಕಲ್ಪ & ಸರಳ ಪೂಜೆ" :
                     lang === "hi" ? "३-५ मिनट दैनिक वैदिक संकल्प एवं सरल पूजा" :
                     lang === "te" ? "3-5 నిమిషాల నిత్య దైవిక సంకల్పం & పూజ" :
                     lang === "ta" ? "3-5 நிமிட நித்ய வைதீக சங்கல்பம் & பூஜை" :
                     "3-5 Min Vedic Daily Sankalpa & Pooja"}
                  </h2>
                  <span
                    style={{
                      background: "rgba(245, 158, 11, 0.2)",
                      border: "1px solid #F59E0B",
                      color: "#FDE68A",
                      fontSize: 10.5,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 12
                    }}
                  >
                    {step <= 5
                      ? (STEP_LABELS[lang || "kn"] || STEP_LABELS.kn)(step)
                      : (COMPLETED_BADGE[lang || "kn"] || COMPLETED_BADGE.kn)}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#FDE68A", marginTop: 2 }}>
                  {devoteeName} ({gotra} {(META_LABELS[lang || "kn"] || META_LABELS.kn).gotra} · {rashiName} {(META_LABELS[lang || "kn"] || META_LABELS.kn).rashi}) · {priestName} {(META_LABELS[lang || "kn"] || META_LABELS.kn).guidance}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Manage Sankalpas Button */}
              <button
                type="button"
                onClick={() => setIsManageSankalpaOpen(true)}
                style={{
                  background: "rgba(245, 158, 11, 0.25)",
                  border: "1.5px solid #FCD34D",
                  color: "#FEF3C7",
                  borderRadius: 12,
                  padding: "6px 12px",
                  fontSize: 11.5,
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
                  width: 32,
                  height: 32,
                  color: "#FEF3C7",
                  fontSize: 16,
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
          <div style={{ background: "#451A03", height: 6, width: "100%" }}>
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
          <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {step <= 5 ? (
              <>
                {/* Visual Sanctum Altar Card */}
                <div
                  style={{
                    background: "radial-gradient(circle at center, #2D1405 0%, #150802 100%)",
                    border: "2px solid #D97706",
                    borderRadius: 20,
                    padding: "18px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)"
                  }}
                >
                  {/* Altar Deity Aura */}
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0) 70%)",
                      position: "absolute",
                      top: 15,
                      pointerEvents: "none"
                    }}
                  />

                  {/* Icon & Animations */}
                  <div style={{ fontSize: 56, marginBottom: 8, position: "relative", zIndex: 2 }}>
                    {currentStepData.icon}
                  </div>

                  {/* Interactive Visual Cue */}
                  {currentStepData.key === "deepa_achamana" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 24, filter: isLampLit ? "drop-shadow(0 0 12px #F59E0B)" : "grayscale(80%)" }}>
                        🪔
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A" }}>
                        {isLampLit
                          ? (VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).lampLit
                          : (VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).lightLamp}
                      </span>
                    </div>
                  )}

                  {currentStepData.key === "guru_ganapati" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", marginTop: 4 }}>
                      {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).holdAkshata}
                    </div>
                  )}

                  {currentStepData.key === "sankalpa_samarpana" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#34D399", marginTop: 4 }}>
                      {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).offerAkshata}
                    </div>
                  )}

                  {currentStepData.key === "deeparadhana_namaskara" && (
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#FDE68A", marginTop: 4 }}>
                      {(VISUAL_CUES[lang || "kn"] || VISUAL_CUES.kn).waveArati}
                    </div>
                  )}

                  {/* Step Title */}
                  <h3 style={{ margin: "10px 0 0 0", fontSize: 18, fontWeight: 900, color: "#FEF3C7", textAlign: "center" }}>
                    {lang === "kn" ? currentStepData.titleKn :
                     lang === "hi" ? currentStepData.titleHi :
                     lang === "te" ? currentStepData.titleTe :
                     lang === "ta" ? currentStepData.titleTa :
                     currentStepData.titleEn}
                  </h3>
                </div>

                {/* Sanskrit Mantra Gold Box */}
                <div
                  style={{
                    background: "rgba(254, 243, 199, 0.08)",
                    border: "1.5px solid #F59E0B",
                    borderRadius: 16,
                    padding: "16px 18px",
                    textAlign: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#FDE68A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                    {MANTRA_HEADER[lang || "kn"] || MANTRA_HEADER.kn}
                  </div>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#FFFBEB",
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      fontFamily: "'Nirmala UI', sans-serif"
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
                        .map((s) => (
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
                            ✨ {s.title}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Action & Guidance Box */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(69, 26, 3, 0.6) 0%, rgba(28, 15, 5, 0.8) 100%)",
                    border: "1px solid #B45309",
                    borderRadius: 16,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#FDE68A", fontSize: 12, fontWeight: 900 }}>
                    <span>👉</span>
                    <span>{ACTION_GUIDE_HEADER[lang || "kn"] || ACTION_GUIDE_HEADER.kn}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#FEF3C7", lineHeight: 1.5, fontWeight: 600 }}>
                    {currentStepData.actionGuide[lang || "kn"] || currentStepData.actionGuide.kn}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#D1D5DB", marginTop: 4, fontStyle: "italic" }}>
                    🌿 {currentStepData.spiritualSignificance[lang || "kn"] || currentStepData.spiritualSignificance.kn}
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
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10
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
                    padding: "10px 16px",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: step === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  ← {(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).prev}
                </button>

                {/* Audio Status & Manual Replay */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (isAudioPlaying || isAudioLoading) {
                        cleanupAudioAndTimers();
                      } else {
                        playStepPriestAudio(step);
                      }
                    }}
                    style={{
                      background: isAudioPlaying
                        ? "#D97706"
                        : isAudioLoading
                        ? "#92400E"
                        : "rgba(245, 158, 11, 0.2)",
                      border: "1.5px solid #F59E0B",
                      color: "#FEF3C7",
                      borderRadius: 12,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    {isAudioPlaying ? (
                      <>
                        <span>🔊</span>
                        <span>{(FOOTER_BTNS[lang || "kn"] || FOOTER_BTNS.kn).playing}</span>
                      </>
                    ) : isAudioLoading ? (
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
                </div>

                <button
                  type="button"
                  onClick={() => handleNextStep()}
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #D97706)",
                    color: "#1C0A00",
                    border: "1.5px solid #FDE68A",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
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

      {/* Full Blocking Big Loader for Sarvam AI Voice */}
      <VedicAudioLoaderModal
        isOpen={isAudioLoading}
        onCancel={cleanupAudioAndTimers}
        titleKn={
          lang === "kn" ? "ಪೂಜಾ ಮಂತ್ರ & ಸಂಕಲ್ಪ ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." :
          lang === "hi" ? "पूजा मंत्र एवं संकल्प ध्वनि तैयार हो रही है..." :
          lang === "te" ? "పూజా మంత్రం & సంకల్ప ధ్వని సిద్ధమవుతోంది..." :
          lang === "ta" ? "பூஜை மந்திரம் & சங்கல்ப ஆடியோ தயாராகிறது..." :
          "Synthesizing Sacred Priest Voice..."
        }
        titleEn="Generating Sacred Priest Audio (Sarvam AI Neural TTS)..."
        subtitleKn={
          lang === "kn" ? "ವೇದ ಮಂತ್ರಗಳ ಉಚ್ಛಾರಣೆ & ಸಂಕಲ್ಪ ಧ್ವನಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ, ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ." :
          lang === "hi" ? "वैदिक मंत्रों का उच्चारण एवं संकल्प ध्वनि लोड हो रही है, कृपया प्रतीक्षा करें।" :
          lang === "te" ? "వేద మంత్రోచ్ఛారణ & సంకల్ప ధ్వని లోడ్ అవుతోంది, దయచేసి వేచి ఉండండి." :
          lang === "ta" ? "வேத மந்திர பாராயணம் மற்றும் சங்கல்ப குரல் தயாராகிறது, தயவுசெய்து காத்திருங்கள்." :
          "Loading sacred Vedic recitation & devotee sankalpa audio, please wait a moment."
        }
      />
    </>
  );
};
