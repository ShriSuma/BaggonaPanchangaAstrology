/**
 * Baggona Panchanga - 20-Minute Timed Consultation Session Types
 * Supports 7 Languages: Kannada, English, Hindi, Telugu, Tamil, Malayalam, Marathi
 * Complete Vedic Precision Type Definitions, Devotee Question Logs, Reviews & Telemetry
 */

export type ConsultationLanguage = "kn" | "en" | "hi" | "te" | "ta" | "ml" | "mr";

export type ConsultationStatus = "pending" | "active" | "expired" | "deleted";

export interface ConsultationLanguageMeta {
  code: ConsultationLanguage;
  nativeName: string;
  englishName: string;
  speechLocale: string;
  sampleGreeting: string;
  inputPlaceholder: string;
  speakingIndicator: string;
}

export const CONSULTATION_LANGUAGES: ConsultationLanguageMeta[] = [
  {
    code: "kn",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
    speechLocale: "kn-IN",
    sampleGreeting: "ನಮಸ್ಕಾರ, ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ಸಮಾಲೋಚನೆಗೆ ಸ್ವಾಗತ.",
    inputPlaceholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ...",
    speakingIndicator: "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ... (ಮಾತನಾಡಿ)"
  },
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    speechLocale: "en-IN",
    sampleGreeting: "Namaste, Welcome to Baggona Panchanga Vedic Astrological Consultation.",
    inputPlaceholder: "Type your question here or speak via mic...",
    speakingIndicator: "Voice recording active... (Speak now)"
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    speechLocale: "hi-IN",
    sampleGreeting: "नमस्ते, श्री बग्गोण पंचांग वैदिक ज्योतिष परामर्श में आपका स्वागत है।",
    inputPlaceholder: "अपना प्रश्न यहाँ लिखें या बोलकर पूछें...",
    speakingIndicator: "ध्वनि रिकॉर्डिंग जारी है... (बोलिए)"
  },
  {
    code: "te",
    nativeName: "తెలుగు",
    englishName: "Telugu",
    speechLocale: "te-IN",
    sampleGreeting: "నమస్కారం, శ్రీ బగ్గోణ పంచాంగ జ్యోతిష్య సంప్రదింపులకు స్వాగతం.",
    inputPlaceholder: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...",
    speakingIndicator: "వాయిస్ రికార్డింగ్ నడుస్తోంది... (మాట్లాడండి)"
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    speechLocale: "ta-IN",
    sampleGreeting: "வணக்கம், ஸ்ரீ பக்கவணா பஞ்சாங்க ஜோதிட ஆலோசனையில் உங்களை வரவேற்கிறோம்.",
    inputPlaceholder: "உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும் அல்லது பேசவும்...",
    speakingIndicator: "குரல் பதிவு செயலில் உள்ளது... (பேசவும்)"
  },
  {
    code: "ml",
    nativeName: "മലയാളം",
    englishName: "Malayalam",
    speechLocale: "ml-IN",
    sampleGreeting: "നമസ്കാരം, ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷ കൺസൾട്ടേഷനിലേക്ക് സ്വാഗതം.",
    inputPlaceholder: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ സംസാരിക്കുക...",
    speakingIndicator: "വോയ്‌സ് റെക്കോർഡിംഗ് സജീവമാണ്... (സംസാരിക്കുക)"
  },
  {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    speechLocale: "mr-IN",
    sampleGreeting: "नमस्कार, श्री बग्गोण पंचांग वैदिक ज्योतिष सल्लामसलतीमध्ये आपले स्वागत आहे.",
    inputPlaceholder: "आपला प्रश्न येथे टाइप करा किंवा आवाजाने विचारा...",
    speakingIndicator: "व्हॉइस रेकॉर्डिंग चालू आहे... (बोला)"
  }
];

export interface ActiveDoshaCardData {
  doshaId: string;
  doshaName: string;
  technicalWhy: string;
  currentLifeProblems: string;
  recommendedPooja: string;
  priestName: string;
  priestPhone: string;
}

export interface ConsultationChatMessage {
  id: string;
  sender: "user" | "astrologer";
  text: string;
  timestamp: string; // ISO string
  spokenLang?: string;
  intent?: string;
  hasDosha?: boolean;
  doshaName?: string;
  doshaParihara?: string;
  activeDoshaCard?: ActiveDoshaCardData;
}

export interface ConsultationSession {
  id: string; // unique token e.g. "bgn_cst_abcdef123"
  name: string;
  dob: string; // "YYYY-MM-DD"
  tob: string; // "HH:mm"
  place: string;
  lat: number;
  lng: number;
  timezone: number;
  language: ConsultationLanguage;
  createdAt: string; // ISO string
  status: ConsultationStatus;
  startedAt?: string | null; // ISO string when user clicks Start
  expiresAt?: string | null; // startedAt + 20 minutes (or +21 minutes with bonus)
  deleteAt?: string | null; // startedAt + 40 minutes (20 min after expiry)
  userPhone?: string; // Captured before 20-min timer
  userEmail?: string; // Captured before 20-min timer
  hasProvidedContact?: boolean; // Flag to show contact modal only once
  bonusMinuteClaimed?: boolean; // Max 1 bonus minute allowed (21m total)
  messages: ConsultationChatMessage[];
  durationMinutes: number; // 20 (or 21)
  graceDeleteMinutes: number; // 20
  priestName: string; // "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್"
  priestPhone: string; // "9972339362"
  kundliSnapshot?: {
    lagnaRashi: string;
    moonRashi: string;
    nakshatra: string;
    pada: number;
    sunRashi: string;
    currentDasha?: string;
  };
}

export interface CreateConsultationInput {
  name: string;
  dob: string;
  tob: string;
  place: string;
  lat?: number;
  lng?: number;
  timezone?: number;
  language: ConsultationLanguage;
}

export const DEFAULT_PRIEST_CONTACT = {
  name: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Shreeram Pandit)",
  phone: "9972339362",
  gokarnaLocation: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ (Baggona Panchanga, Gokarna)",
  callUri: "tel:9972339362"
};

export interface ConsultationQuestionRecord {
  id: string; // e.g. "cq_172923..."
  sessionId: string;
  userId: string; // Devotee phone number or sessionId
  userName: string;
  userPhone: string;
  userEmail?: string;
  question: string;
  answerSnippet: string;
  category?: string;
  hasDosha: boolean;
  doshaName?: string;
  doshaParihara?: string;
  language: ConsultationLanguage;
  timestamp: string; // ISO string
}

export interface ConsultationReview {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  rating: number; // 1 to 5
  feedbackText: string;
  timestamp: string; // ISO string
}

export interface DevoteeQuestionGroup {
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  totalQuestions: number;
  lastActive: string;
  questions: ConsultationQuestionRecord[];
}

export interface ConsultationTelemetry {
  totalSessions: number;
  totalQuestions: number;
  totalUniqueUsers: number;
  averageRating: number;
  totalReviews: number;
  questionsByDevotee: DevoteeQuestionGroup[];
  allQuestions: ConsultationQuestionRecord[];
  allReviews: ConsultationReview[];
}

/**
 * Multilingual UI translations for Devotee Contact Modal, Timer, and 5-Star Rating & Feedback Modal
 */
export const CONSULTATION_MODAL_I18N: Record<
  ConsultationLanguage,
  {
    contactModalTitle: string;
    contactModalSubtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    contactNote: string;
    submitContactBtn: string;
    phoneError: string;
    emailError: string;
    oneRequiredError: string;
    timerModalTitle: string;
    timerModalWarning: string;
    timerModalStrictCondition: string;
    startTimerBtn: string;
    bonusBannerTitle: string;
    bonusBannerSubtitle: string;
    addBonusBtn: string;
    sessionEndedTitle: string;
    sessionEndedMsg: string;
    callPriestBtn: string;
    tamperedLinkTitle: string;
    tamperedLinkMsg: string;
    // 5-Star Rating & Review Modal
    ratingModalTitle: string;
    ratingModalSubtitle: string;
    ratingStarsLabel: string;
    ratingCommentLabel: string;
    ratingCommentPlaceholder: string;
    submitRatingBtn: string;
    skipRatingBtn: string;
    ratingSubmittedToast: string;
    ratingTriggerBtn: string;
  }
> = {
  kn: {
    contactModalTitle: "ಭಕ್ತರ ಸಂಪರ್ಕ ವಿವರಗಳು",
    contactModalSubtitle: "ಸಮಾಲೋಚನೆ ಆರಂಭಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ನಮೂದಿಸಿ (ಯಾವುದಾದರೂ ಒಂದು ಕಡ್ಡಾಯ).",
    phoneLabel: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    phonePlaceholder: "ಉದಾ: 9876543210",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    emailPlaceholder: "ಉದಾ: devotee@example.com",
    contactNote: "ಈ ವಿವರಗಳು ಕೇವಲ ಒಂದು ಬಾರಿ ಮಾತ್ರ ಕೇಳಲಾಗುವುದು ಮತ್ತು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹವಾಗುತ್ತದೆ.",
    submitContactBtn: "ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ ಮುಂದುವರಿಯಿರಿ",
    phoneError: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ೧೦-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    emailError: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.",
    oneRequiredError: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ವಿಳಾಸದಲ್ಲಿ ಕನಿಷ್ಠ ಒಂದನ್ನು ನಮೂದಿಸುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ.",
    timerModalTitle: "೨೦ ನಿಮಿಷಗಳ ನಿಖರ ಸಮಾಲೋಚನೆ",
    timerModalWarning: "ಮುಂದಿನ ೨೦ ನಿಮಿಷಗಳ ಕಾಲ ನೀವು ಸಂಪೂರ್ಣ ಮುಕ್ತರಾಗಿದ್ದರೆ ಮಾತ್ರ 'ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    timerModalStrictCondition: "ಒಮ್ಮೆ ಪ್ರಾರಂಭಿಸಿದ ನಂತರ, ಸಮಯವು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ನಿರಂತರವಾಗಿ ಚಲಿಸುತ್ತದೆ ಮತ್ತು ೨೦ ನಿಮಿಷಗಳ ನಂತರ ಈ ಲಿಂಕ್ ಶಾಶ್ವತವಾಗಿ ನಿಷ್ಕ್ರಿಯಗೊಳ್ಳುತ್ತದೆ. ಮರು-ಪ್ರವೇಶ ಸಾಧ್ಯವಿಲ್ಲ.",
    startTimerBtn: "ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ (೨೦ ನಿಮಿಷ)",
    bonusBannerTitle: "ಕೊನೆಯ ಕ್ಷಣದ ಬೋನಸ್ ಸಮಯ!",
    bonusBannerSubtitle: "ಸಮಾಲೋಚನೆ ಮುಕ್ತಾಯಗೊಳಿಸಲು ಹೆಚ್ಚುವರಿ +೧ ನಿಮಿಷ ಸೇರಿಸಬೇಕೆ?",
    addBonusBtn: "ಬೋನಸ್ +೧ ನಿಮಿಷ ಸೇರಿಸಿ",
    sessionEndedTitle: "ಸಮಾಲೋಚನಾ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ",
    sessionEndedMsg: "ನಿಮ್ಮ ೨೦ ನಿಮಿಷಗಳ ವೈದಿಕ ಸಮಾಲೋಚನಾ ಲಿಂಕ್ ಕಾಲಾವಧಿ ಮೀರಿದೆ. ಮುಂದಿನ ವಿವರಗಳಿಗೆ ದಯವಿಟ್ಟು ಪಂಡಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    callPriestBtn: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ (9972339362)",
    tamperedLinkTitle: "॥ ಅಮಾನ್ಯ ಅಥವಾ ಬದಲಾಯಿಸಲಾದ ಲಿಂಕ್ ॥",
    tamperedLinkMsg: "ಈ ಸಮಾಲೋಚನಾ ಲಿಂಕ್ ಅನ್ನು ಮಾರ್ಪಡಿಸಲಾಗಿದೆ ಅಥವಾ ಅಮಾನ್ಯವಾಗಿದೆ. ಭದ್ರತಾ ತಪಾಸಣೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪಂಡಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    ratingModalTitle: "ನಿಮ್ಮ ಸಮಾಲೋಚನೆಗೆ ರೇಟಿಂಗ್ ನೀಡಿ",
    ratingModalSubtitle: "ನಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಸೇವೆಯನ್ನು ಮತ್ತಷ್ಟು ಉತ್ತಮಗೊಳಿಸಲು ನಿಮ್ಮ ಅಮೂಲ್ಯವಾದ ಸ್ಟಾರ್ ರೇಟಿಂಗ್ ಮತ್ತು ಅಭಿಪ್ರಾಯವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
    ratingStarsLabel: "ಸ್ಟಾರ್ ರೇಟಿಂಗ್ ಆಯ್ಕೆಮಾಡಿ (೧ ರಿಂದ ೫)",
    ratingCommentLabel: "ನಿಮ್ಮ ಅನಿಸಿಕೆ / ಪ್ರತಿಕ್ರಿಯೆ (ಐಚ್ಛಿಕ)",
    ratingCommentPlaceholder: "ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ಅನುಭವವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...",
    submitRatingBtn: "ರೇಟಿಂಗ್ ಸಲ್ಲಿಸಿ",
    skipRatingBtn: "ನಂತರ / ಮುಚ್ಚಿ",
    ratingSubmittedToast: "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ರೇಟಿಂಗ್ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.",
    ratingTriggerBtn: "⭐ ರೇಟಿಂಗ್ & ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ"
  },
  en: {
    contactModalTitle: "Devotee Contact Details",
    contactModalSubtitle: "Please provide either your mobile number or email address before beginning the consultation (at least one is required).",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "e.g. 9876543210 or +91...",
    emailLabel: "Email Address",
    emailPlaceholder: "e.g. devotee@example.com",
    contactNote: "This will only be asked once and will be securely saved to your consultation record.",
    submitContactBtn: "Confirm & Proceed",
    phoneError: "Please enter a valid 10-digit mobile number.",
    emailError: "Please enter a valid email address.",
    oneRequiredError: "Please provide either a mobile number or an email address.",
    timerModalTitle: "20-Minute Vedic Astrological Consultation",
    timerModalWarning: "Please click 'Start Consultation' only if you are completely free for the next 20 minutes.",
    timerModalStrictCondition: "Once started, the countdown runs continuously in the background and this link will expire in exactly 20 minutes, after which it cannot be accessed again.",
    startTimerBtn: "Start Consultation (20 Min)",
    bonusBannerTitle: "Final Moment Bonus Time!",
    bonusBannerSubtitle: "Would you like to add a bonus +1 minute to conclude your consultation?",
    addBonusBtn: "Add Bonus +1 Minute",
    sessionEndedTitle: "Consultation Session Ended",
    sessionEndedMsg: "Your 20-minute consultation link has expired. For further astrological guidance, please contact our chief astrologer.",
    callPriestBtn: "Call Shreeram Pandit (9972339362)",
    tamperedLinkTitle: "Invalid or Tampered Link",
    tamperedLinkMsg: "This consultation link is corrupted or has been altered. Integrity verification failed. Please contact the priest.",
    ratingModalTitle: "Rate Your Astrological Consultation",
    ratingModalSubtitle: "Your valuable feedback helps us refine our divine Vedic astrological guidance.",
    ratingStarsLabel: "Select Star Rating (1 to 5)",
    ratingCommentLabel: "Your Feedback / Experience (Optional)",
    ratingCommentPlaceholder: "Write your honest feedback about this consultation...",
    submitRatingBtn: "Submit Review",
    skipRatingBtn: "Later / Dismiss",
    ratingSubmittedToast: "Thank you! Your rating and feedback have been securely recorded.",
    ratingTriggerBtn: "⭐ Rate Consultation"
  },
  hi: {
    contactModalTitle: "भक्त संपर्क विवरण",
    contactModalSubtitle: "परामर्श प्रारंभ करने से पूर्व कृपया अपना मोबाइल नंबर या ईमेल पता दर्ज करें (कोई एक अनिवार्य है)।",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "उदा: 9876543210",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "उदा: devotee@example.com",
    contactNote: "यह जानकारी केवल एक बार पूछी जाएगी और आपके रिकॉर्ड में सुरक्षित रूप से सहेजी जाएगी।",
    submitContactBtn: "विवरण सत्यापित करें एवं आगे बढ़ें",
    phoneError: "कृपया एक मान्य १०-अंकीय मोबाइल नंबर दर्ज करें।",
    emailError: "कृपया एक मान्य ईमेल पता दर्ज करें।",
    oneRequiredError: "मोबाइल नंबर अथवा ईमेल पते में से कम से कम एक प्रदान करना अनिवार्य है।",
    timerModalTitle: "२० मिनट का सटीक वैदिक परामर्श",
    timerModalWarning: "यदि आप अगले २० मिनट के लिए पूरी तरह से स्वतंत्र हैं, तभी 'परामर्श प्रारंभ करें' पर क्लिक करें।",
    timerModalStrictCondition: "एक बार शुरू होने के बाद, टाइमर पृष्ठभूमि में निरंतर चलता रहेगा और ठीक २० मिनट बाद यह लिंक स्थायी रूप से निष्क्रिय हो जाएगा।",
    startTimerBtn: "परामर्श प्रारंभ करें (२० मिनट)",
    bonusBannerTitle: "अंतिम क्षण बोनस समय!",
    bonusBannerSubtitle: "क्या आप परामर्श संपन्न करने के लिए अतिरिक्त +१ मिनट जोड़ना चाहते हैं?",
    addBonusBtn: "बोनस +१ मिनट जोड़ें",
    sessionEndedTitle: "परामर्श सत्र समाप्त",
    sessionEndedMsg: "आपका २० मिनट का वैदिक परामर्श लिंक समाप्त हो चुका है। आगे की जानकारी हेतु कृपया पंडित जी से संपर्क करें।",
    callPriestBtn: "श्रीराम पंडित जी को कॉल करें (9972339362)",
    tamperedLinkTitle: "अमान्य अथवा संशोधित लिंक",
    tamperedLinkMsg: "यह परामर्श लिंक संशोधित या अमान्य पाया गया है। सुरक्षा जांच विफल रही। कृपया पंडित जी से संपर्क करें।",
    ratingModalTitle: "अपने परामर्श को रेटिंग दें",
    ratingModalSubtitle: "आपकी अमूल्य प्रतिक्रिया हमारी वैदिक सेवा को और उत्कृष्ट बनाने में सहायता करेगी।",
    ratingStarsLabel: "स्टार रेटिंग चुनें (१ से ५)",
    ratingCommentLabel: "आपकी राय / अनुभव (वैकल्पिक)",
    ratingCommentPlaceholder: "परामर्श के बारे में अपनी प्रतिक्रिया यहाँ लिखें...",
    submitRatingBtn: "रेटिंग जमा करें",
    skipRatingBtn: "बाद में / बंद करें",
    ratingSubmittedToast: "धन्यवाद! आपकी रेटिंग एवं समीक्षा सफलतापूर्वक दर्ज कर ली गई है।",
    ratingTriggerBtn: "⭐ परामर्श रेटिंग दें"
  },
  te: {
    contactModalTitle: "భక్తుల సంప్రదింపు వివరాలు",
    contactModalSubtitle: "సంప్రదింపులు ప్రారంభించే ముందు దయచేసి మీ మొబైల్ నంబర్ లేదా ఇమెయిల్ చిరునామా నమోదు చేయండి (కనీసం ఒకటి తప్పనిసరి).",
    phoneLabel: "మొబైల్ నంబర్",
    phonePlaceholder: "ఉదా: 9876543210",
    emailLabel: "ఇమెయిల్ చిరునామా",
    emailPlaceholder: "ఉదా: devotee@example.com",
    contactNote: "ఈ వివరాలు ఒక్కసారి మాత్రమే అడగబడతాయి మరియు మీ రికార్డులో భద్రపరచబడతాయి.",
    submitContactBtn: "ధృవీకరించి ముందుకు సాగండి",
    phoneError: "దయచేసి సరైన 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.",
    emailError: "దయచేసి సరైన ఇమెయిల్ చిరునామాను నమోదు చేయండి.",
    oneRequiredError: "మొబైల్ నంబర్ లేదా ఇమెయిల్‌లలో కనీసం ఒకదాన్ని అందించడం తప్పనిసరి.",
    timerModalTitle: "20 నిమిషాల వేద జ్యోతిష్య సంప్రదింపులు",
    timerModalWarning: "వచ్చే 20 నిమిషాలు మీరు పూర్తిగా అందుబాటులో ఉంటే మాత్రమే 'సంప్రదింపులు ప్రారంభించండి' బటన్‌పై క్లిక్ చేయండి.",
    timerModalStrictCondition: "ఒక్కసారి ప్రారంభించిన తర్వాత, సమయం నిరంతరం నడుస్తూనే ఉంటుంది మరియు 20 నిమిషాల తర్వాత ఈ లింక్ పూర్తిగా నిష్క్రియం చేయబడుతుంది.",
    startTimerBtn: "సంప్రదింపులు ప్రారంభించండి (20 నిమిషాలు)",
    bonusBannerTitle: "చివరి క్షణాల బోనస్ సమయం!",
    bonusBannerSubtitle: "మీ సంప్రదింపులను ముగించడానికి అదనపు +1 నిమిషం జోడించాలనుకుంటున్నారా?",
    addBonusBtn: "బోనస్ +1 నిమిషం జోడించండి",
    sessionEndedTitle: "సంప్రదింపుల సమయం ముగిసింది",
    sessionEndedMsg: "మీ 20 నిమిషాల జ్యోతిష్య సంప్రదింపుల లింక్ గడువు ముగిసింది. దయచేసి ప్రధాన జ్యోతిష్యులను సంప్రదించండి.",
    callPriestBtn: "శ్రీరామ్ పండిట్‌గారికి కాల్ చేయండి (9972339362)",
    tamperedLinkTitle: "చెల్లని లేదా మార్చబడిన లింక్",
    tamperedLinkMsg: "ఈ సంప్రదింపుల లింక్ మార్చబడింది లేదా చెల్లదు. భద్రతా తనిఖీ విಫలమైంది. దయచేసి పండితులను సంప్రదించండి.",
    ratingModalTitle: "మీ సంప్రదింపు అనుభవానికి రేటింగ్ ఇవ్వండి",
    ratingModalSubtitle: "మీ అభిప్రాయం మా జ్యోతిష్య సేవలను మరింత మెరుగుపరచడానికి సహాయపడుతుంది.",
    ratingStarsLabel: "స్టార్ రేటింగ్ ఎంచుకోండి (1 నుండి 5)",
    ratingCommentLabel: "మీ అభిప్రాయం / అనుభవం (ఐచ్ఛికం)",
    ratingCommentPlaceholder: "సంప్రదింపు అనుభవాన్ని ఇక్కడ రాయండి...",
    submitRatingBtn: "రేటింగ్ సమర్పించండి",
    skipRatingBtn: "తరువాత / మూసివేయండి",
    ratingSubmittedToast: "ధన్యవాదాలు! మీ రేటింగ్ మరియు సమీక్ష విజయవంతంగా నమోదయ్యాయి.",
    ratingTriggerBtn: "⭐ రేటింగ్ ఇవ్వండి"
  },
  ta: {
    contactModalTitle: "பக்தர் தொடர்பு விவரங்கள்",
    contactModalSubtitle: "ஆலோசனையைத் தொடங்குவதற்கு முன் உங்கள் மொபைல் எண் அல்லது மின்னஞ்சல் முகவரியை உள்ளிடவும் (ஏதேனும் ஒன்று கட்டாயம்).",
    phoneLabel: "மொபைல் எண்",
    phonePlaceholder: "எ.கா: 9876543210",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "எ.கா: devotee@example.com",
    contactNote: "இந்த விவரங்கள் ஒரு முறை மட்டுமே கேட்கப்படும் மற்றும் பாதுகாப்பாக சேமிக்கப்படும்.",
    submitContactBtn: "உறுதிசெய்து தொடரவும்",
    phoneError: "சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    emailError: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    oneRequiredError: "மொபைல் எண் அல்லது மின்னஞ்சல் முகவரியில் ஏதேனும் ஒன்றை வழங்குவது கட்டாயமாகும்.",
    timerModalTitle: "20 நிமிட வேத ஜோதிட ஆலோசனை",
    timerModalWarning: "அடுத்த 20 நிமிடங்களுக்கு நீங்கள் முற்றிலும் ஓய்வாக இருந்தால் மட்டுமே 'ஆலோசனையைத் தொடங்கு' பொத்தானைக் கிளிக் செய்யவும்.",
    timerModalStrictCondition: "தொடங்கியவுடன், நேரம் பின்னணியில் தொடர்ந்து இயங்கும், சரியாக 20 நிமிடங்களுக்குப் பிறகு இந்த இணைப்பு நிரந்தரமாக முடக்கப்படும்.",
    startTimerBtn: "ஆலோசனையைத் தொடங்கு (20 நிமிடம்)",
    bonusBannerTitle: "இறுதி நிமிட போனஸ் நேரம்!",
    bonusBannerSubtitle: "உங்கள் ஆலோசனையை முடிக்க கூடுதல் +1 நிமிடம் சேர்க்க விரும்புகிறீர்களா?",
    addBonusBtn: "போனஸ் +1 நிமிடம் சேர்",
    sessionEndedTitle: "ஆலோசனை அமர்வு முடிந்தது",
    sessionEndedMsg: "உங்கள் 20 நிமிட ஜோதிட ஆலோசனை இணைப்பு காலாவதியாகிவிட்டது. தயவுசெய்து பண்டிதரைத் தொடர்பு கொள்ளவும்.",
    callPriestBtn: "ஸ்ரீராம் பண்டிதரை அழைக்கவும் (9972339362)",
    tamperedLinkTitle: "செல்லாத அல்லது மாற்றப்பட்ட இணைப்பு",
    tamperedLinkMsg: "இந்த ஆலோசனை இணைப்பு மாற்றப்பட்டுள்ளது அல்லது செல்லாது. பாதுகாப்பு சரிபார்ப்பு தோல்வியடைந்தது. பண்டிதரை அழைக்கவும்.",
    ratingModalTitle: "உங்கள் ஆலோசனைக்கு மதிப்பீடு அளிக்கவும்",
    ratingModalSubtitle: "உங்கள் கருத்துக்கள் எங்கள் ஜோதிட சேவையை மேலும் மேம்படுத்த உதவுகிறது.",
    ratingStarsLabel: "நட்சத்திர மதிப்பீட்டைத் தேர்ந்தெடுக்கவும் (1 முதல் 5)",
    ratingCommentLabel: "உங்கள் கருத்து / அனுபவம் (விருப்பத்திற்குரியது)",
    ratingCommentPlaceholder: "உங்கள் அனுபவத்தை இங்கே எழுதவும்...",
    submitRatingBtn: "மதிப்பீட்டைச் சமர்ப்பிக்கவும்",
    skipRatingBtn: "பிறகு / மூடு",
    ratingSubmittedToast: "நன்றி! உங்கள் மதிப்பீடு வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.",
    ratingTriggerBtn: "⭐ மதிப்பீடு அளிக்கவும்"
  },
  ml: {
    contactModalTitle: "ഭക്തരുടെ സമ്പർക്ക വിവരങ്ങൾ",
    contactModalSubtitle: "കൺസൾട്ടേഷൻ ആരംഭിക്കുന്നതിന് മുമ്പ് നിങ്ങളുടെ മൊബൈൽ നമ്പറോ ഇമെയിൽ വിലാസമോ നൽകുക (ഏതെങ്കിലും ഒന്ന് നിർബന്ധമാണ്).",
    phoneLabel: "മൊബൈൽ നമ്പർ",
    phonePlaceholder: "ഉദാ: 9876543210",
    emailLabel: "ഇമെയിൽ വിലാസം",
    emailPlaceholder: "ഉദാ: devotee@example.com",
    contactNote: "ഈ വിവരങ്ങൾ ഒരു തവണ മാത്രമേ ചോദിക്കൂ, നിങ്ങളുടെ റെക്കോർഡിൽ സുരക്ഷിതമായി സൂക്ഷിക്കും.",
    submitContactBtn: "സ്ഥിരീകരിച്ച് തുടരുക",
    phoneError: "സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.",
    emailError: "സാധുവായ ഇമെയിൽ വിലാസം നൽകുക.",
    oneRequiredError: "മൊബൈൽ നമ്പറോ ഇമെയിലോ നൽകേണ്ടത് നിർബന്ധമാണ്.",
    timerModalTitle: "20 മിനിറ്റ് കൃത്യമായ ജ്യോതിഷ കൺസൾട്ടേഷൻ",
    timerModalWarning: "അടുത്ത 20 മിനിറ്റ് നിങ്ങൾ പൂർണ്ണമായും ഒഴിവുള്ളവരാണെങ്കിൽ മാത്രം 'കൺസൾട്ടേഷൻ ആരംഭിക്കുക' ക്ലിക്ക് ചെയ്യുക.",
    timerModalStrictCondition: "ആരംഭിച്ചുകഴിഞ്ഞാൽ സമയം പശ്ചാത്തലത്തിൽ പ്രവർത്തിച്ചുകൊണ്ടിരിക്കും, കൃത്യം 20 മിനിറ്റിനുശേഷം ഈ ലിങ്ക് പൂർണ്ണമായും അസാധുവാകും.",
    startTimerBtn: "കൺസൾട്ടേഷൻ ആരംഭിക്കുക (20 മിനിറ്റ്)",
    bonusBannerTitle: "അവസാന നിമിഷ ബോണസ് സമയം!",
    bonusBannerSubtitle: "കൺസൾട്ടേഷൻ പൂർത്തിയാക്കാൻ അധികമായി +1 മിനിറ്റ് ചേർക്കണോ?",
    addBonusBtn: "ബോണസ് +1 മിനിറ്റ് ചേർക്കുക",
    sessionEndedTitle: "കൺസൾട്ടേഷൻ സമയം കഴിഞ്ഞു",
    sessionEndedMsg: "നിങ്ങളുടെ 20 മിനിറ്റ് ജ്യോതിഷ കൺസൾട്ടേഷൻ ലിങ്ക് കാലഹരണപ്പെട്ടു. തുടർവിവരങ്ങൾക്ക് പണ്ഡിറ്റുമായി ബന്ധപ്പെടുക.",
    callPriestBtn: "ശ്രീറാം പണ്ഡിറ്റിനെ വിളിക്കുക (9972339362)",
    tamperedLinkTitle: "അസാധുവായ അല്ലെങ്കിൽ മാറ്റംവരുത്തിയ ലിങ്ക്",
    tamperedLinkMsg: "ഈ ലിങ്കിൽ മാറ്റം വരുത്തിയതായി കണ്ടെത്തി. സുരക്ഷാ പരിശോധന പരാജയപ്പെട്ടു. ദയവായി പണ്ഡിറ്റുമായി ബന്ധപ്പെടുക.",
    ratingModalTitle: "നിങ്ങളുടെ കൺസൾട്ടേഷൻ അനുഭവം വിലയിരുത്തുക",
    ratingModalSubtitle: "നിങ്ങളുടെ അഭിപ്രായം ഞങ്ങളുടെ ജ്യോതിഷ സേവനം കൂടുതൽ മെച്ചപ്പെടുത്താൻ സഹായിക്കും.",
    ratingStarsLabel: "സ്റ്റാർ റേറ്റിംഗ് തിരഞ്ഞെടുക്കുക (1 മുതൽ 5 വരെ)",
    ratingCommentLabel: "നിങ്ങളുടെ അഭിപ്രായം (ഐച്ഛികം)",
    ratingCommentPlaceholder: "നിങ്ങളുടെ അനുഭവം ഇവിടെ രേഖപ്പെടുത്തുക...",
    submitRatingBtn: "റേറ്റിംഗ് സമർപ്പിക്കുക",
    skipRatingBtn: "പിന്നീട് / അടയ്ക്കുക",
    ratingSubmittedToast: "നന്ദി! നിങ്ങളുടെ റേറ്റിംഗ് വിജയകരമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്.",
    ratingTriggerBtn: "⭐ റേറ്റിംഗ് നൽകുക"
  },
  mr: {
    contactModalTitle: "भक्त संपर्क तपशील",
    contactModalSubtitle: "सल्लामसलत सुरू करण्यापूर्वी कृपया तुमचा मोबाईल नंबर किंवा ईमेल पत्ता प्रविष्ट करा (किमान एक आवश्यक आहे).",
    phoneLabel: "मोबाईल नंबर",
    phonePlaceholder: "उदा: 9876543210",
    emailLabel: "ईमेल पत्ता",
    emailPlaceholder: "उदा: devotee@example.com",
    contactNote: "हे तपशील फक्त एकदाच विचारले जातील आणि आपल्या प्रोफाईलमध्ये सुरक्षितपणे जतन केले जातील.",
    submitContactBtn: "तपशील पुष्टी करा आणि पुढे जा",
    phoneError: "कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.",
    emailError: "कृपया वैध ईमेल पत्ता प्रविष्ट करा.",
    oneRequiredError: "मोबाईल नंबर किंवा ईमेल पत्त्यापैकी किमान एक देणे अनिवार्य आहे.",
    timerModalTitle: "२० मिनिटांची अचूक वैदिक सल्लामसलत",
    timerModalWarning: "पुढील २० मिनिटे आपण पूर्णपणे मोकळे असाल तरच 'सल्लामसलत सुरू करा' बटणावर क्लिक करा.",
    timerModalStrictCondition: "एकदा सुरू झाल्यानंतर टाइमर पार्श्वभूमीत सतत चालू राहील आणि २० मिनिटांनंतर ही लिंक कायमची निष्क्रिय होईल. पुन्हा प्रवेश मिळणार नाही.",
    startTimerBtn: "सल्लामसलत सुरू करा (२० मिनिटे)",
    bonusBannerTitle: "शेवटच्या क्षणाची बोनस वेळ!",
    bonusBannerSubtitle: "सल्लामसलत पूर्ण करण्यासाठी अतिरिक्त +१ मिनिट जोडायचे आहे का?",
    addBonusBtn: "बोनस +१ मिनिट जोडा",
    sessionEndedTitle: "सल्लामसलत सत्र संपले",
    sessionEndedMsg: "आपली २० मिनिटांची सल्लामसलत लिंक कालबाह्य झाली आहे. पुढील माहितीसाठी कृपया मुख्य ज्योतिषींशी संपर्क साधा.",
    callPriestBtn: "श्रीराम पंडित यांना कॉल करा (9972339362)",
    tamperedLinkTitle: "अवैध किंवा बदललेली लिंक",
    tamperedLinkMsg: "ही सल्लामसलत लिंक बदललेली किंवा अवैध आढळली आहे. सुरक्षा तपासणी अयशस्वी झाली. कृपया पंडितांशी संपर्क साधा.",
    ratingModalTitle: "तुमच्या सल्लामसलतीला रेटिंग द्या",
    ratingModalSubtitle: "तुमचा अमूल्य अभिप्राय आमच्या वैदिक सेवेला अधिक उत्कृष्ट बनवण्यास मदत करेल.",
    ratingStarsLabel: "स्टार रेटिंग निवडा (१ ते ५)",
    ratingCommentLabel: "तुमचे मत / अभिप्राय (पर्यायी)",
    ratingCommentPlaceholder: "सल्लामसलतीबद्दल आपला अनुभव येथे लिहा...",
    submitRatingBtn: "रेटिंग सबमिट करा",
    skipRatingBtn: "नंतर / बंद करा",
    ratingSubmittedToast: "धन्यवाद! तुमचे रेटिंग आणि अभिप्राय यशस्वीरीत्या नोंदवले गेले आहेत.",
    ratingTriggerBtn: "⭐ रेटिंग द्या"
  }
};

/**
 * Personalized Priest Welcome Greeting on starting the 20-Minute Consultation.
 * Greets the devotee by their actual name in the selected session language,
 * identifies Chief Priest Shreeram Pandit from Gokarna, confirms thorough analysis
 * of their birth chart/Lagna/Rashi, and warmly invites their first question.
 */
export function getInitialPriestGreeting(lang: ConsultationLanguage, devoteeName: string): string {
  const name = devoteeName && devoteeName.trim() ? devoteeName.trim() : "ಭಕ್ತರೇ";
  switch (lang) {
    case "kn":
      return `ನಮಸ್ಕಾರ ${name} ಅವರೇ, ನಾನು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮುಖ್ಯ ದೈವಜ್ಞ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ, ರಾಶಿ ಹಾಗೂ ಜಾತಕವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿಶ್ಲೇಷಿಸಿದ್ದೇನೆ. ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ನಿಮ್ಮ ಜೀವನ, ವೃತ್ತಿ, ವಿವಾಹ, ಕೌಟುಂಬಿಕ ಅಥವಾ ಯಾವುದೇ ಗೊಂದಲಗಳಿದ್ದರೂ ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ; ನಾವಿಬ್ಬರೂ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸಮಾಲೋಚನೆ ನಡೆಸಿ ಪರಿಹಾರ ಕಂಡುಕೊಳ್ಳೋಣ. ನಿಮ್ಮ ಮೊದಲ ಪ್ರಶ್ನೆ ಏನು?`;
    case "en":
      return `Namaskara ${name} ji, I am Shreeram Pandit, Chief Astrologer of Shri Kshetra Gokarna. I have thoroughly analyzed your birth chart, Lagna, and planetary positions. In this 20-minute private consultation, please feel free to share any questions regarding your career, marriage, family, or life path. Together, let us consult Vedic scriptures for authentic guidance and remedies. What would you like to ask first?`;
    case "hi":
      return `नमस्कार ${name} जी, मैं श्री क्षेत्र गोकर्ण का मुख्य ज्योतिषी श्रीराम पंडित। मैंने आपकी जन्म कुंडली, लग्न एवं ग्रहों का संपूर्ण विश्लेषण कर लिया है। इस २० मिनट के निजी परामर्श में आपके जीवन, करियर, विवाह या परिवार से जुड़े जो भी प्रश्न हों, निस्संदेह पूछें; हम दोनों शास्त्रोक्त मार्गदर्शन एवं उपाय प्राप्त करेंगे। आपका पहला प्रश्न क्या है?`;
    case "te":
      return `నమస్కారం ${name} గారూ, నేను శ్రీ క్షేత్ర గోకర్ణ ముఖ్య దైవజ్ఞ శ్రీరామ్ పండిత్. మీ జన్మ లగ్నం, రాశి మరియు జాతకాన్ని సమగ్రంగా పరిశీలించాను. ఈ 20 నిమిషాల వ్యక్తిగత సంభాషణలో మీ కెరీర్, వివాహం, కుటుంబం లేదా ఇతర సందేహాల గురించి నిస్సందేహంగా అడగండి; శాస్త్రోక్తంగా విశ్లేషించి పరిహారాలు తెలుసుకుందాం. మీ మొదటి ప్రశ్న ఏమిటి?`;
    case "ta":
      return `வணக்கம் ${name} அவர்களே, நான் ஸ்ரீ க்ஷேத்ர கோகர்ணத்தின் தலைமை ஜோதிடர் ஸ்ரீராம் பண்டிட். உங்கள் பிறந்த ஜாதகம், லக்னம் மற்றும் கிரக அமைப்புகளை முழுமையாக ஆராய்ந்துள்ளேன். இந்த 20 நிமிட பிரத்யேக ஆலோசனையில் உங்கள் தொழில், திருமணம், குடும்பம் குறித்த எந்த கேள்விகளையும் வெளிப்படையாகக் கேளுங்கள்; சாஸ்திர ரீதியாக ஆராய்ந்து தீர்வு காண்போம். உங்கள் முதல் கேள்வி என்ன?`;
    case "ml":
      return `നമസ്കാരം ${name}, ഞാൻ ശ്രീ ക്ഷേത്ര ഗോകർണ്ണത്തിലെ പ്രധാന ജ്യോതിഷി ശ്രീറാം പണ്ഡിറ്റ്. അങ്ങയുടെ ജന്മ ലഗ്നവും ഗ്രഹനിലയും പൂർണ്ണമായി വിശകലനം ചെയ്തിട്ടുണ്ട്. ഈ 20 മിനിറ്റ് സ്വകാര്യ സംഭാഷണത്തിൽ താങ്കളുടെ ജോലി, വിവാഹം, കുടുംബം തുടങ്ങിയ ഏത് ചോദ്യങ്ങളും ചോദിക്കാം; ശാസ്ത്രീയമായി പരിഹാരം കണ്ടെത്താം. അങ്ങയുടെ ആദ്യത്തെ ചോദ്യം എന്താണ്?`;
    case "mr":
      return `नमस्कार ${name} जी, मी श्री क्षेत्र गोकर्ण येथील मुख्य ज्योतिषी श्रीराम पंडित. मी आपल्या जन्मपत्रिकेचे, लग्नाचे आणि ग्रहांचे सखोल विश्लेषण केले आहे. या २० मिनिटांच्या खाजगी संवादात आपल्या करिअर, विवाह, कुटुंब किंवा इतर कोणत्याही प्रश्नांवर मोकळेपणाने चर्चा करूया; शास्त्रोक्त मार्गदर्शन आणि उपाय शोधूया. आपला पहिला प्रश्न काय आहे?`;
    default:
      return `ನಮಸ್ಕಾರ ${name} ಅವರೇ, ನಾನು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಮುಖ್ಯ ದೈವಜ್ಞ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್. ನಿಮ್ಮ ಜನ್ಮ ಲಗ್ನ, ರಾಶಿ ಹಾಗೂ ಜಾತಕವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿಶ್ಲೇಷಿಸಿದ್ದೇನೆ. ಈ ೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ನಿಮ್ಮ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೂ ಮುಕ್ತವಾಗಿ ತಿಳಿಸಿ; ನಾವಿಬ್ಬರೂ ಶಾಸ್ತ್ರೋಕ್ತವಾಗಿ ಸಮಾಲೋಚನೆ ನಡೆಸೋಣ. ನಿಮ್ಮ ಮೊದಲ ಪ್ರಶ್ನೆ ಏನು?`;
}
}

/**
 * Multilingual UI translations for Consultation Chat Page elements
 * Eliminates all hardcoded strings and supports all 7 languages natively:
 * kn (Kannada), en (English), hi (Hindi), te (Telugu), ta (Tamil), ml (Malayalam), mr (Marathi)
 */
export interface ConsultationChatUiI18n {
  patrikaLoading: string;
  devoteeSenderTag: string;
  astrologerSenderTag: string;
  doshaCardTitle: string;
  specialPariharaBadge: string;
  doshaAfflictionLabel: string;
  planetaryCauseLabel: string;
  currentImpactLabel: string;
  remedySankalpaLabel: string;
  priestLabel: string;
  gokarnaLocationLabel: string;
  directCallBtn: string;
  doshaBadgeFallback: string;
  specialDoshaFallback: string;
  callRemedyBtn: string;
  astrologerFooterNote: string;
  stopAudio: string;
  listenAudio: string;
  typingAstrologer: string;
  synthesizingAnswer: string;
  faqDockHeader: string;
  minorChildBadge: string;
  yearsAgeBadge: string;
  micTooltip: string;
  sendTooltip: string;
  confirmingContact: string;
  startingSession: string;
  reviewLaterBtn: string;
  submittingReview: string;
  devoteeNameLabel: string;
  birthDetailsLabel: string;
  contactSummaryLabel: string;
  languageSummaryLabel: string;
  directAnswerBadge: string;
  directAnswerTag: string;
  explanationHeader: string;
  copyBtn: string;
  copiedToast: string;
  clearInputTooltip: string;
  ratingLevels: [string, string, string, string, string];
}

export const CONSULTATION_CHAT_UI_I18N: Record<ConsultationLanguage, ConsultationChatUiI18n> = {
  kn: {
    patrikaLoading: "ಪಂಚಾಂಗ ಹಾಗೂ ಜಾತಕ ವಿವರಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",
    devoteeSenderTag: "ನೀವು (ಭಕ್ತರು)",
    astrologerSenderTag: "ದೈವಜ್ಞರು (ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ, ಗೋಕರ್ಣ)",
    doshaCardTitle: "॥ ಜಾತಕ ದೋಷ / ಕರ್ಮ ಸಂಬಂಧಿತ ಒಳನೋಟ ॥",
    specialPariharaBadge: "ವಿಶೇಷ ಪರಿಹಾರ",
    doshaAfflictionLabel: "⚡ ದೋಷ / ಬಾಧೆ:",
    planetaryCauseLabel: "🪐 ಗ್ರಹ ಸಂಯೋಗ:",
    currentImpactLabel: "⚠️ ಪ್ರಸ್ತುತ ಪರಿಣಾಮ:",
    remedySankalpaLabel: "🛕 ಪರಿಹಾರ ಸಂಕಲ್ಪ:",
    priestLabel: "ಆಚಾರ್ಯರು: ",
    gokarnaLocationLabel: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ",
    directCallBtn: "📞 ನೇರ ಕರೆ",
    doshaBadgeFallback: "ದೋಷ ಪರಿಹಾರ ಅಧ್ಯಾಯ:",
    specialDoshaFallback: "ವಿಶೇಷ ಜಾತಕ ದೋಷ",
    callRemedyBtn: "📞 ಪರಿಹಾರ ಕರೆ",
    astrologerFooterNote: "ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞ ಉತ್ತರ",
    stopAudio: "⏹️ ನಿಲ್ಲಿಸಿ",
    listenAudio: "🔊 ಆಲಿಸಿ",
    typingAstrologer: "ದೈವಜ್ಞರು (ಮುಖ್ಯ ಜ್ಯೋತಿಷಿ, ಗೋಕರ್ಣ)",
    synthesizingAnswer: "ಜನ್ಮಕುಂಡಲಿ & ದಶಾ-ಗೋಚಾರ ಗಣಿತ ಸಂಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    faqDockHeader: "ಜನಪ್ರಿಯ ಪ್ರಶ್ನಾವಳಿ (೧-ಟ್ಯಾಪ್)",
    minorChildBadge: "👶 ಬಾಲಕ/ಬಾಲಕಿ (ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನ)",
    yearsAgeBadge: "ವರ್ಷ",
    micTooltip: "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (3-4 ನಿಮಿಷ ಮಾತನಾಡಬಹುದು)",
    sendTooltip: "ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ",
    confirmingContact: "ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    startingSession: "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
    reviewLaterBtn: "ನಂತರ ಪ್ರಾರಂಭಿಸಿ (ಮುಚ್ಚಿ)",
    submittingReview: "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    devoteeNameLabel: "ಭಕ್ತರ ಹೆಸರು (Name):",
    birthDetailsLabel: "ಜನ್ಮ ವಿವರಗಳು:",
    contactSummaryLabel: "ಸಂಪರ್ಕ:",
    languageSummaryLabel: "ಭಾಷೆ (Language):",
    directAnswerBadge: "✨ ನೇರ ಉತ್ತರ (ತೀರ್ಮಾನ)",
    directAnswerTag: "೮೦% ನೇರ ಉತ್ತರ",
    explanationHeader: "📖 ಜ್ಯೋತಿಷ್ಯ ಹಿನ್ನೆಲೆ ಹಾಗೂ ಮಾರ್ಗದರ್ಶನ",
    copyBtn: "📋 ನಕಲಿಸಿ",
    copiedToast: "✓ ನಕಲಿಸಲಾಗಿದೆ",
    clearInputTooltip: "ತೆರವುಗೊಳಿಸಿ",
    ratingLevels: [
      "⭐ ಅತೃಪ್ತಿ (1/5)",
      "⭐⭐ ಸುಧಾರಣೆ ಅಗತ್ಯ (2/5)",
      "⭐⭐⭐ ತೃಪ್ತಿಕರ (3/5)",
      "⭐⭐⭐⭐ ಬಹಳ ಒಳ್ಳೆಯದು (4/5)",
      "⭐⭐⭐⭐⭐ ಅತ್ಯುತ್ತಮ (5/5)"
    ]
  },
  en: {
    patrikaLoading: "Calculating sacred Panchanga and birth chart coordinates...",
    devoteeSenderTag: "You (Devotee)",
    astrologerSenderTag: "Chief Astrologer (Gokarna)",
    doshaCardTitle: "॥ Horoscope Dosha & Karmic Influence Insight ॥",
    specialPariharaBadge: "Sacred Parihara",
    doshaAfflictionLabel: "⚡ Identified Dosha:",
    planetaryCauseLabel: "🪐 Planetary Combination:",
    currentImpactLabel: "⚠️ Current Life Hardships:",
    remedySankalpaLabel: "🛕 Prescribed Remedy:",
    priestLabel: "Chief Priest: ",
    gokarnaLocationLabel: "Sri Kshetra Gokarna",
    directCallBtn: "📞 Direct Call",
    doshaBadgeFallback: "Dosha Parihara Chapter:",
    specialDoshaFallback: "Vedic Horoscope Dosha",
    callRemedyBtn: "📞 Call for Parihara",
    astrologerFooterNote: "Baggona Panchanga Astrological Oracle Guidance",
    stopAudio: "⏹️ Stop",
    listenAudio: "🔊 Listen",
    typingAstrologer: "Chief Astrologer (Gokarna)",
    synthesizingAnswer: "Synthesizing birth chart, Dasha & Gochara planetary transits...",
    faqDockHeader: "Frequently Asked Questions (1-Tap)",
    minorChildBadge: "👶 Minor Child (Parent Protocol)",
    yearsAgeBadge: "yrs",
    micTooltip: "Ask question by voice (speak continuously for 3-4 mins)",
    sendTooltip: "Send Question",
    confirmingContact: "Confirming...",
    startingSession: "Starting...",
    reviewLaterBtn: "Start Later (Review Later)",
    submittingReview: "Submitting...",
    devoteeNameLabel: "Devotee Name:",
    birthDetailsLabel: "Birth Details:",
    contactSummaryLabel: "Contact:",
    languageSummaryLabel: "Language:",
    directAnswerBadge: "✨ Direct Answer (Quick Takeaway)",
    directAnswerTag: "80% Direct Answer",
    explanationHeader: "📖 Planetary Analysis & Guidance",
    copyBtn: "📋 Copy",
    copiedToast: "✓ Copied",
    clearInputTooltip: "Clear input",
    ratingLevels: [
      "⭐ Needs Attention (1/5)",
      "⭐⭐ Fair (2/5)",
      "⭐⭐⭐ Good (3/5)",
      "⭐⭐⭐⭐ Very Good (4/5)",
      "⭐⭐⭐⭐⭐ Excellent (5/5)"
    ]
  },
  hi: {
    patrikaLoading: "पंचांग एवं जन्म कुंडली विवरणों की गणना की जा रही है...",
    devoteeSenderTag: "आप (भक्त)",
    astrologerSenderTag: "दैवज्ञ (मुख्य ज्योतिषी, गोकर्ण)",
    doshaCardTitle: "॥ जन्मकुंडली दोष एवं कर्म प्रभाव ॥",
    specialPariharaBadge: "विशेष परिहार",
    doshaAfflictionLabel: "⚡ दोष / बाधा:",
    planetaryCauseLabel: "🪐 ग्रह संयोग:",
    currentImpactLabel: "⚠️ वर्तमान प्रभाव:",
    remedySankalpaLabel: "🛕 परिहार संकल्प:",
    priestLabel: "आचार्य: ",
    gokarnaLocationLabel: "श्री क्षेत्र गोकर्ण",
    directCallBtn: "📞 सीधे कॉल करें",
    doshaBadgeFallback: "दोष परिहार अध्याय:",
    specialDoshaFallback: "विशेष जन्मकुंडली दोष",
    callRemedyBtn: "📞 परिहार कॉल",
    astrologerFooterNote: "श्री बग्गोण पंचांग दैवज्ञ उत्तर",
    stopAudio: "⏹️ रोकें",
    listenAudio: "🔊 सुनें",
    typingAstrologer: "दैवज्ञ (मुख्य ज्योतिषी, गोकर्ण)",
    synthesizingAnswer: "जन्मकुंडली, दशा एवं गोचर ग्रहों का विश्लेषण हो रहा है...",
    faqDockHeader: "लोकप्रिय प्रश्न (१-टैप)",
    minorChildBadge: "👶 बाल जातक (माता-पिता मार्गदर्शन)",
    yearsAgeBadge: "वर्ष",
    micTooltip: "आवाज से प्रश्न पूछें (3-4 मिनट निरंतर बोल सकते हैं)",
    sendTooltip: "प्रश्न भेजें",
    confirmingContact: "सत्यापित किया जा रहा है...",
    startingSession: "प्रारंभ हो रहा है...",
    reviewLaterBtn: "बाद में प्रारंभ करें",
    submittingReview: "जमा किया जा रहा है...",
    devoteeNameLabel: "भक्त का नाम:",
    birthDetailsLabel: "जन्म विवरण:",
    contactSummaryLabel: "संपर्क:",
    languageSummaryLabel: "भाषा:",
    directAnswerBadge: "✨ सीधा उत्तर (निष्कर्ष)",
    directAnswerTag: "८०% सीधा उत्तर",
    explanationHeader: "📖 ज्योतिषीय कारण एवं मार्गदर्शन",
    copyBtn: "📋 कॉपी करें",
    copiedToast: "✓ कॉपी हो गया",
    clearInputTooltip: "साफ़ करें",
    ratingLevels: [
      "⭐ असंतोषजनक (1/5)",
      "⭐⭐ सुधार आवश्यक (2/5)",
      "⭐⭐⭐ संतोषजनक (3/5)",
      "⭐⭐⭐⭐ बहुत अच्छा (4/5)",
      "⭐⭐⭐⭐⭐ उत्कृष्ट (5/5)"
    ]
  },
  te: {
    patrikaLoading: "పంచాంగం మరియు జాతక వివరాలు లెక్కించబడుతున్నాయి...",
    devoteeSenderTag: "మీరు (భక్తులు)",
    astrologerSenderTag: "దైవజ్ఞులు (ప్రధాన జ్యోతిష్యులు, గోకర్ణ)",
    doshaCardTitle: "॥ జాతక దోషం / కర్మ సంబంధిత సమాచారం ॥",
    specialPariharaBadge: "ప్రత్యేక పరిహారం",
    doshaAfflictionLabel: "⚡ దోషం / బాధ:",
    planetaryCauseLabel: "🪐 గ్రహ కలయిక:",
    currentImpactLabel: "⚠️ ప్రస్తుత ప్రభావం:",
    remedySankalpaLabel: "🛕 పరిహార సంకల్పం:",
    priestLabel: "ఆచార్యులు: ",
    gokarnaLocationLabel: "శ్రీ క్షేత్ర గోకర్ణ",
    directCallBtn: "📞 నేరుగా కాల్ చేయండి",
    doshaBadgeFallback: "దోష పరిహార అధ్యాయం:",
    specialDoshaFallback: "ప్రత్యేక జాతక దోషం",
    callRemedyBtn: "📞 పరిహార కాల్",
    astrologerFooterNote: "శ్రీ బగ్గోణ పంచాంగ దైవజ్ఞ సమాధానం",
    stopAudio: "⏹️ ఆపండి",
    listenAudio: "🔊 వినండి",
    typingAstrologer: "దైవజ్ఞులు (ప్రధాన జ్యోతిష్యులు, గోకర్ణ)",
    synthesizingAnswer: "జన్మకుండలి, దశా మరియు గోచార గ్రహాల విశ్లేషణ జరుగుతోంది...",
    faqDockHeader: "తరచుగా అడిగే ప్రశ్నలు (1-ట్యాప్)",
    minorChildBadge: "👶 బాల జాతకుడు (తల్లిదండ్రుల మార్గదర్శకత్వం)",
    yearsAgeBadge: "సంవత్సరాలు",
    micTooltip: "వాయిస్ ద్వారా ప్రశ్న అడగండి (3-4 నిమిషాలు మాట్లాడవచ్చు)",
    sendTooltip: "ప్రశ్న పంపండి",
    confirmingContact: "ధృవీకరిస్తోంది...",
    startingSession: "ప్రారంభమవుతోంది...",
    reviewLaterBtn: "తరువాత ప్రారంభించండి",
    submittingReview: "సమర్పిస్తోంది...",
    devoteeNameLabel: "భక్తుని పేరు:",
    birthDetailsLabel: "జన్మ వివరాలు:",
    contactSummaryLabel: "సంప్రదింపు:",
    languageSummaryLabel: "భాష:",
    directAnswerBadge: "✨ ప్రత్యక్ష సమాధానం (తీర్పు)",
    directAnswerTag: "80% ప్రత్యక్ష సమాధానం",
    explanationHeader: "📖 జ్యోతిష్య నేపథ్యం మరియు మార్గదర్శకత్వం",
    copyBtn: "📋 కాపీ చేయండి",
    copiedToast: "✓ కాపీ చేయబడింది",
    clearInputTooltip: "క్లియర్ చేయండి",
    ratingLevels: [
      "⭐ అసంతృప్తి (1/5)",
      "⭐⭐ మెరుగుదల అవసరం (2/5)",
      "⭐⭐⭐ సంతృప్తికరం (3/5)",
      "⭐⭐⭐⭐ చాలా బాగుంది (4/5)",
      "⭐⭐⭐⭐⭐ అద్భుతం (5/5)"
    ]
  },
  ta: {
    patrikaLoading: "பஞ்சாங்கம் மற்றும் ஜாதக விவரங்கள் கணக்கிடப்படுகின்றன...",
    devoteeSenderTag: "நீங்கள் (பக்தர்)",
    astrologerSenderTag: "ஜோதிடர் (தலைமை ஜோதிடர், கோகர்ணம்)",
    doshaCardTitle: "॥ ஜாதக தோஷம் / கர்ம தாக்கம் ॥",
    specialPariharaBadge: "சிறப்பு பரிகாரம்",
    doshaAfflictionLabel: "⚡ தோஷம் / பாதிப்பு:",
    planetaryCauseLabel: "🪐 கிரக சேர்க்கை:",
    currentImpactLabel: "⚠️ தற்போதைய தாக்கம்:",
    remedySankalpaLabel: "🛕 பரிகார சங்கல்பம்:",
    priestLabel: "ஆசாரியர்: ",
    gokarnaLocationLabel: "ஸ்ரீ க்ஷேத்ர கோகர்ணம்",
    directCallBtn: "📞 நேரடி அழைப்பு",
    doshaBadgeFallback: "தோஷ பரிகார அத்தியாயம்:",
    specialDoshaFallback: "சிறப்பு ஜாதக தோஷம்",
    callRemedyBtn: "📞 பரிகார அழைப்பு",
    astrologerFooterNote: "ஸ்ரீ பக்கவணா பஞ்சாங்க ஜோதிட பதில்",
    stopAudio: "⏹️ நிறுத்து",
    listenAudio: "🔊 கேளுங்கள்",
    typingAstrologer: "ஜோதிடர் (தலைமை ஜோதிடர், கோகர்ணம்)",
    synthesizingAnswer: "ஜாதகம், தசா மற்றும் கோச்சார கிரகங்களின் கணிப்பு நடைபெறுகிறது...",
    faqDockHeader: "அடிக்கடி கேட்கப்படும் கேள்விகள் (1-தட்டல்)",
    minorChildBadge: "👶 குழந்தை ஜாதகம் (பெற்றோர் வழிகாட்டல்)",
    yearsAgeBadge: "வயது",
    micTooltip: "குரல் மூலம் கேள்வி கேளுங்கள் (3-4 நிமிடங்கள் பேசலாம்)",
    sendTooltip: "கேள்வி அனுப்பவும்",
    confirmingContact: "உறுதிப்படுத்தப்படுகிறது...",
    startingSession: "தொடங்குகிறது...",
    reviewLaterBtn: "பிறகு தொடங்கவும்",
    submittingReview: "சமர்ப்பிக்கப்படுகிறது...",
    devoteeNameLabel: "பக்தர் பெயர்:",
    birthDetailsLabel: "பிறந்த விவரங்கள்:",
    contactSummaryLabel: "தொடர்பு:",
    languageSummaryLabel: "மொழி:",
    directAnswerBadge: "✨ நேரடி பதில் (முடிவு)",
    directAnswerTag: "80% நேரடி பதில்",
    explanationHeader: "📖 ஜோதிட விளக்கம் மற்றும் வழிகாட்டுதல்",
    copyBtn: "📋 நகலெடு",
    copiedToast: "✓ நகலெடுக்கப்பட்டது",
    clearInputTooltip: "அழி",
    ratingLevels: [
      "⭐ திருப்தியற்றது (1/5)",
      "⭐⭐ முன்னேற்றம் தேவை (2/5)",
      "⭐⭐⭐ திருப்திகரம் (3/5)",
      "⭐⭐⭐⭐ மிக நன்று (4/5)",
      "⭐⭐⭐⭐⭐ மிகச்சிறந்தது (5/5)"
    ]
  },
  ml: {
    patrikaLoading: "പഞ്ചാംഗവും ജാതക വിവരങ്ങളും കണക്കാക്കുന്നു...",
    devoteeSenderTag: "നിങ്ങൾ (ഭക്തൻ)",
    astrologerSenderTag: "ജ്യോതിഷി (പ്രധാന ജ്യോതിഷി, ഗോകർണ്ണം)",
    doshaCardTitle: "॥ ജാതക ദോഷം / കർമ്മ സ്വാധീനം ॥",
    specialPariharaBadge: "പ്രത്യേക പരിഹാരം",
    doshaAfflictionLabel: "⚡ ദോഷം / ബാധ:",
    planetaryCauseLabel: "🪐 ഗ്രഹ സംയോഗം:",
    currentImpactLabel: "⚠️ നിലവിലെ സ്വാധീനം:",
    remedySankalpaLabel: "🛕 പരിഹാര സങ്കല്പം:",
    priestLabel: "ആചാര്യൻ: ",
    gokarnaLocationLabel: "ശ്രീ ക്ഷേത്ര ഗോകർണ്ണം",
    directCallBtn: "📞 നേരിട്ട് വിളിക്കുക",
    doshaBadgeFallback: "ദോഷ പരിഹാര അധ്യായം:",
    specialDoshaFallback: "പ്രത്യേക ജാതക ദോഷം",
    callRemedyBtn: "📞 പരിഹാര കോൾ",
    astrologerFooterNote: "ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗ ജ്യോതിഷ മറുപടി",
    stopAudio: "⏹️ നിർത്തുക",
    listenAudio: "🔊 കേൾക്കുക",
    typingAstrologer: "ജ്യോതിഷി (പ്രധാന ജ്യോതിഷി, ഗോകർണ്ണം)",
    synthesizingAnswer: "ജാതകവും ദശാ-ഗോചാര ഗ്രഹനിലയും വിശകലനം ചെയ്യുന്നു...",
    faqDockHeader: "സാധാരണ ചോദ്യങ്ങൾ (1-ടാപ്പ്)",
    minorChildBadge: "👶 കുട്ടി ജാതകം (രക്ഷിതാക്കളുടെ മാർഗ്ഗനിർദ്ദേശം)",
    yearsAgeBadge: "വയസ്സ്",
    micTooltip: "ശബ്ദത്തിലൂടെ ചോദ്യം ചോദിക്കുക (3-4 മിനിറ്റ് സംസാരിക്കാം)",
    sendTooltip: "ചോദ്യം അയക്കുക",
    confirmingContact: "സ്ഥിരീകരിക്കുന്നു...",
    startingSession: "ആരംഭിക്കുന്നു...",
    reviewLaterBtn: "പിന്നീട് ആരംഭിക്കുക",
    submittingReview: "സമർപ്പിക്കുന്നു...",
    devoteeNameLabel: "ഭക്തന്റെ പേര്:",
    birthDetailsLabel: "ജനന വിവരങ്ങൾ:",
    contactSummaryLabel: "സമ്പർക്കം:",
    languageSummaryLabel: "ഭാഷ:",
    directAnswerBadge: "✨ നേരിട്ടുള്ള ഉത്തരം (തീരുമാനം)",
    directAnswerTag: "80% നേരിട്ടുള്ള ഉത്തരം",
    explanationHeader: "📖 ജ്യോതിഷ വിശദീകരണവും മാർഗ്ഗനിർദ്ദേശവും",
    copyBtn: "📋 പകർത്തുക",
    copiedToast: "✓ പകർത്തി",
    clearInputTooltip: "മായ്ക്കുക",
    ratingLevels: [
      "⭐ തൃപ്തികരമല്ല (1/5)",
      "⭐⭐ മെച്ചപ്പെടുത്തണം (2/5)",
      "⭐⭐⭐ തൃപ്തികരം (3/5)",
      "⭐⭐⭐⭐ വളരെ നല്ലത് (4/5)",
      "⭐⭐⭐⭐⭐ ഉത്തമം (5/5)"
    ]
  },
  mr: {
    patrikaLoading: "पंचांग आणि जन्मपत्रिका तपशीलांची गणना केली जात आहे...",
    devoteeSenderTag: "तुम्ही (भक्त)",
    astrologerSenderTag: "दैवज्ञ (मुख्य ज्योतिषी, गोकर्ण)",
    doshaCardTitle: "॥ जन्मपत्रिका दोष व कर्म प्रभाव ॥",
    specialPariharaBadge: "विशेष परिहार",
    doshaAfflictionLabel: "⚡ दोष / बाधा:",
    planetaryCauseLabel: "🪐 ग्रह संयोग:",
    currentImpactLabel: "⚠️ वर्तमान परिणाम:",
    remedySankalpaLabel: "🛕 परिहार संकल्प:",
    priestLabel: "आचार्य: ",
    gokarnaLocationLabel: "श्री क्षेत्र गोकर्ण",
    directCallBtn: "📞 थेट कॉल करा",
    doshaBadgeFallback: "दोष परिहार अध्याय:",
    specialDoshaFallback: "विशेष जन्मपत्रिका दोष",
    callRemedyBtn: "📞 परिहार कॉल",
    astrologerFooterNote: "श्री बग्गोण पंचांग दैवज्ञ उत्तर",
    stopAudio: "⏹️ थांबवा",
    listenAudio: "🔊 ऐका",
    typingAstrologer: "दैवज्ञ (मुख्य ज्योतिषी, गोकर्ण)",
    synthesizingAnswer: "जन्मपत्रिका, दशा व गोचर ग्रहांचे विश्लेषण सुरू आहे...",
    faqDockHeader: "वारंवार विचारले जाणारे प्रश्न (१-टॅप)",
    minorChildBadge: "👶 बाल जातक (पालक मार्गदर्शन)",
    yearsAgeBadge: "वर्षे",
    micTooltip: "आवाजाद्वारे प्रश्न विचारा (3-4 मिनिटे बोलू शकता)",
    sendTooltip: "प्रश्न पाठवा",
    confirmingContact: "पुष्टी केली जात आहे...",
    startingSession: "सुरू होत आहे...",
    reviewLaterBtn: "नंतर सुरू करा",
    submittingReview: "सबमिट करत आहे...",
    devoteeNameLabel: "भक्ताचे नाव:",
    birthDetailsLabel: "जन्म तपशील:",
    contactSummaryLabel: "संपर्क:",
    languageSummaryLabel: "भाषा:",
    directAnswerBadge: "✨ थेट उत्तर (निष्कर्ष)",
    directAnswerTag: "८०% थेट उत्तर",
    explanationHeader: "📖 ज्योतिषीय विश्लेषण आणि मार्गदर्शन",
    copyBtn: "📋 कॉपी करा",
    copiedToast: "✓ कॉपी झाले",
    clearInputTooltip: "साफ करा",
    ratingLevels: [
      "⭐ असमाधानकारक (1/5)",
      "⭐⭐ सुधारणा आवश्यक (2/5)",
      "⭐⭐⭐ समाधानकारक (3/5)",
      "⭐⭐⭐⭐ खूप छान (4/5)",
      "⭐⭐⭐⭐⭐ सर्वोत्कृष्ट (5/5)"
    ]
  }
};

export interface QuickFaqChip {
  label: string;
  question: string;
}

/**
 * Returns authentic, age-adaptive Quick Suggestion FAQ Chips
 * fully localized across all 7 supported languages without hardcoding
 */
function getAgeSpecificChips(
  lang: ConsultationLanguage,
  ageYears: number
): QuickFaqChip[] {
  const isMinor = ageYears < 18;

  if (isMinor) {
    switch (lang) {
      case "en":
        return [
          { label: "📚 Education & Focus", question: "How are my child's academic prospects, memory retention, and concentration?" },
          { label: "🛡️ Health & Protection", question: "What Vedic remedies protect the child's health and shield against evil eye?" },
          { label: "🌟 Talent & Future", question: "In which field will the child's natural talents and future shine best?" },
          { label: "🧘 Parenting Guidance", question: "How should parents nurture and handle the child's natural temperament?" }
        ];
      case "hi":
        return [
          { label: "📚 शिक्षा एवं एकाग्रता", question: "बच्चे की शिक्षा, स्मरण शक्ति और एकाग्रता बढ़ाने के लिए कुंडली अनुसार क्या करें?" },
          { label: "🛡️ बालारिष्ट एवं स्वास्थ्य", question: "बच्चे के स्वास्थ्य की रक्षा और नजर दोष निवारण हेतु क्या वैदिक उपाय हैं?" },
          { label: "🌟 प्रतिभा एवं भविष्य", question: "बच्चे की जन्मजात प्रतिभा किस क्षेत्र में सबसे अधिक चमकेगी?" },
          { label: "🧘 अभिभावक मार्गदर्शन", question: "माता-पिता को बच्चे के स्वभाव को सकारात्मक दिशा देने के लिए क्या करना चाहिए?" }
        ];
      case "te":
        return [
          { label: "📚 విద్యాభ్యాసం & ఏకాగ్రత", question: "పిల్లల విద్యాభ్యాసం, జ్ఞాపకశక్తి మరియు ఏకాగ్రత పెరగడానికి జాతకరీత్యా పరిహారాలేమిటి?" },
          { label: "🛡️ బాలారిష్ట & ఆరోగ్యం", question: "పిల్లల ఆరోగ్య రక్షణ మరియు దిష్టి దోష నివారణకు ఎలాంటి పూజలు చేయాలి?" },
          { label: "🌟 ప్రతిభ & భవిష్యత్తు", question: "పిల్లల సహజ ప్రతిభ ఏ రంగంలో అత్యున్నతంగా రాణిస్తుంది?" },
          { label: "🧘 తల్లిదండ్రుల మార్గదర్శకత్వం", question: "పిల్లల చంచల స్వభావాన్ని సరిదిద్దడానికి తల్లిదండ్రులు పాటించాల్సిన నియమాలేమిటి?" }
        ];
      case "ta":
        return [
          { label: "📚 கல்வி & கவனம்", question: "குழந்தையின் கல்வி, நினைவாற்றல் மற்றும் கவனத்தை அதிகரிக்க ஜாதகப்படி என்ன செய்ய வேண்டும்?" },
          { label: "🛡️ பாலாரிஷ்டம் & உடல்நலம்", question: "குழந்தையின் உடல்நலப் பாதுகாப்பு மற்றும் கண் திருஷ்டி நீங்க பரிகாரம் என்ன?" },
          { label: "🌟 திறமை & எதிர்காலம்", question: "குழந்தையின் இயற்கையான திறமை எந்த துறையில் சிறப்பாக மிளிரும்?" },
          { label: "🧘 பெற்றோர் வழிகாட்டல்", question: "குழந்தையின் பிடிவாத குணத்தை அன்புடன் நல்வழிப்படுத்த வழிகாட்டல் என்ன?" }
        ];
      case "ml":
        return [
          { label: "📚 വിദ്യാഭ്യാസം & ഏകാഗ്രത", question: "കുട്ടിയുടെ വിദ്യാഭ്യാസവും ഏകാഗ്രതയും വർദ്ധിപ്പിക്കാൻ ജാതകപ്രകാരം എന്ത് പരിഹാരമാണ് ചെയ്യേണ്ടത്?" },
          { label: "🛡️ ബാലാരിഷ്ടം & ആരോഗ്യം", question: "കുട്ടിയുടെ ആരോഗ്യ സംരക്ഷണത്തിനും കണ്ണേറ് ദോഷങ്ങൾക്കും ഉള്ള പരിഹാരം എന്താണ്?" },
          { label: "🌟 പ്രതിഭ & ഭാവി", question: "കുട്ടിയുടെ സ്വാഭാവിക കഴിവുകൾ ഏത് മേഖലയിലാണ് തിളങ്ങുക?" },
          { label: "🧘 രക്ഷാകർതൃ മാർഗ്ഗനിർദ്ദേശം", question: "കുട്ടിയുടെ വാശി മാറ്റി നല്ല ശീലങ്ങൾ വളർത്താൻ മാതാപിതാക്കൾ എന്താണ് ചെയ്യേണ്ടത്?" }
        ];
      case "mr":
        return [
          { label: "📚 शिक्षण व एकाग्रता", question: "मुलाचे शिक्षण, स्मरणशक्ती आणि एकाग्रता वाढवण्यासाठी कुंडलीनुसार काय उपाय करावेत?" },
          { label: "🛡️ बालारिष्ट व आरोग्य", question: "मुलाच्या आरोग्याचे रक्षण आणि दृष्ट दोष निवारणासाठी कोणते वैदिक उपाय आहेत?" },
          { label: "🌟 प्रतिभा व भविष्य", question: "मुलाची उपजत प्रतिभा कोणत्या क्षेत्रात सर्वात जास्त चमकेल?" },
          { label: "🧘 पालक मार्गदर्शन", question: "पालकांनी मुलाच्या हट्टी स्वभावाला प्रेमाने योग्य वळण कसे लावावे?" }
        ];
      case "kn":
      default:
        return [
          { label: "📚 ವಿದ್ಯಾಭ್ಯಾಸ & ಏಕಾಗ್ರತೆ", question: "ಮಗುವಿನ ವಿದ್ಯಾಭ್ಯಾಸ ಹಾಗೂ ಏಕಾಗ್ರತೆ ಹೆಚ್ಚಿಸಲು ಜಾತಕದ ಪ್ರಕಾರ ಏನು ಮಾಡಬೇಕು?" },
          { label: "🛡️ ಬಾಲಾರಿಷ್ಟ & ಆರೋಗ್ಯ", question: "ಮಗುವಿನ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಹಾಗೂ ದೃಷ್ಟಿ ದೋಷ ನಿವಾರಣೆಗೆ ಪರಿಹಾರವೇನು?" },
          { label: "🌟 ಪ್ರತಿಭೆ & ಉಜ್ವಲ ಭವಿಷ್ಯ", question: "ಮಗುವಿನ ಸಹಜ ಪ್ರತಿಭೆ ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ಅತ್ಯಂತ ಉಜ್ವಲವಾಗಿ ಬೆಳಗಲಿದೆ?" },
          { label: "🧘 ಪೋಷಕರ ಮಾರ್ಗದರ್ಶನ", question: "ಮಗುವಿನ ಹಠ ಹಾಗೂ ಚಂಚಲ ಸ್ವಭಾವವನ್ನು ಪ್ರೀತಿಯಿಂದ ಸರಿಪಡಿಸುವುದು ಹೇಗೆ?" }
        ];
    }
  }

  if (ageYears <= 28) {
    switch (lang) {
      case "en":
        return [
          { label: "💍 Marriage Timing", question: "When is my marriage indicated? Will it be a love marriage or arranged?" },
          { label: "💼 Career & Growth", question: "How is my career progression and financial stability in the coming months?" },
          { label: "⚡ Vitality & Confidence", question: "What Ayurvedic and Vedic guidance restores vitality, stamina, and inner confidence?" },
          { label: "🕉️ Gokarna Parihara", question: "Which sacred pooja or parihara at Gokarna is recommended for my current Dasha?" }
        ];
      case "hi":
        return [
          { label: "💍 विवाह योग एवं समय", question: "मेरा विवाह कब होगा? क्या यह प्रेम विवाह होगा या अरेंज्ड विवाह?" },
          { label: "💼 आजीविका एवं नौकरी", question: "आने वाले महीनों में मेरा करियर, नौकरी में तरक्की और आर्थिक स्थिति कैसी रहेगी?" },
          { label: "⚡ ऊर्जा एवं आत्मविश्वास", question: "शारीरिक स्फूर्ति, आंतरिक आत्मविश्वास और मानसिक शांति के लिए क्या वैदिक उपाय हैं?" },
          { label: "🕉️ गोकर्ण दोष परिहार", question: "वर्तमान दशा अनुसार श्री क्षेत्र गोकर्ण में कौन सी शांति पूजा कराना श्रेष्ठ है?" }
        ];
      case "te":
        return [
          { label: "💍 వివాహ సమయం & యోగం", question: "నా వివాహం ఎప్పుడు అవుతుంది? ప్రేమ వివాహమా లేక పెద్దలు కుదిర్చిన వివాహమా?" },
          { label: "💼 ఉద్యోగం & ఎదుగుదల", question: "వచ్చే నెలల్లో నా కెరీర్, ఉద్యోగ పురోగతి మరియు ఆర్థిక పరిస్థితి ఎలా ఉండబోతోంది?" },
          { label: "⚡ తేజస్సు & ఆత్మవిశ్వాసం", question: "శారీరక బలం, మానసిక ఉత్సాహం మరియు ఆత్మవిశ్వాసం పెంచుకోవడానికి పరిహారమేమిటి?" },
          { label: "🕉️ గోకర్ణ దోష పరిహారం", question: "ప్రస్తుత దశా ప్రకారం గోకర్ణంలో ఏ శాంతి పూజ చేయించడం మంచిది?" }
        ];
      case "ta":
        return [
          { label: "💍 திருமண காலம்", question: "எனக்கு திருமணம் எப்போது நடைபெறும்? காதல் திருமணமா அல்லது பெற்றோர் பார்த்த திருமணமா?" },
          { label: "💼 வேலை & தொழில்", question: "வரும் மாதங்களில் எனது வேலைவாய்ப்பு, தொழில் வளர்ச்சி மற்றும் நிதி நிலைமை எப்படி இருக்கும்?" },
          { label: "⚡ நல்வாழ்வு & தன்னம்பிக்கை", question: "உடல் நலம், தன்னம்பிக்கை மற்றும் மன அமைதியைப் பெற சாஸ்திர வழிகாட்டல் என்ன?" },
          { label: "🕉️ கோகர்ண தோஷ பரிகாரம்", question: "எனது தசா நிலைக்கு கோகர்ணத்தில் எந்த சாந்தி பூஜை செய்வது சிறந்தது?" }
        ];
      case "ml":
        return [
          { label: "💍 വിവാഹ സമയം", question: "എന്റെ വിവാഹം എപ്പോൾ നടക്കും? പ്രണയവിവാഹമാണോ അതോ വീട്ടുകാർ ഉറപ്പിക്കുന്നതാണോ?" },
          { label: "💼 ജോലിയും കരിയറും", question: "വരും മാസങ്ങളിൽ എന്റെ കരിയർ വളർച്ചയും സാമ്പത്തിക സ്ഥിതിയും എങ്ങനെയായിരിക്കും?" },
          { label: "⚡ ഉന്മേഷവും ആത്മവിശ്വാസവും", question: "ആരോഗ്യവും ആത്മവിശ്വാസവും വീണ്ടെടുക്കാൻ വേദ-ആയുർവേദ പരിഹാരം എന്താണ്?" },
          { label: "🕉️ ഗോകർണ്ണ ദോഷ പരിഹാരം", question: "നിലവിലെ ദശ പ്രകാരം ഗോകർണ്ണത്തിൽ ഏത് ശാന്തി പൂജയാണ് അനുയോജ്യം?" }
        ];
      case "mr":
        return [
          { label: "💍 विवाह योग व काळ", question: "माझा विवाह केव्हा होईल? प्रेमविवाह होईल की ठरवून केलेला विवाह?" },
          { label: "💼 करिअर व नोकरी", question: "पुढील काही महिन्यांत माझ्या नोकरीतील प्रगती आणि आर्थिक परिस्थिती कशी राहील?" },
          { label: "⚡ ऊर्जा व आत्मविश्वास", question: "शारीरिक स्वास्थ्य, आंतरिक आत्मविश्वास आणि मानसिक समाधानासाठी काय उपाय करावेत?" },
          { label: "🕉️ गोकर्ण दोष परिहार", question: "चालू दशा काळानुसार श्री क्षेत्र गोकर्ण येथे कोणती शांती पूजा करावी?" }
        ];
      case "kn":
      default:
        return [
          { label: "💍 ಕಂಕಣ ಭಾಗ್ಯ & ವಿವಾಹ", question: "ನನ್ನ ವಿವಾಹ ಕಾಲ ಯಾವಾಗ? ಲವ್ ಮ್ಯಾರೇಜ್ ಆಗುತ್ತದೆಯೇ ಅಥವಾ ಅರೇಂಜ್ಡ್?" },
          { label: "💼 ವೃತ್ತಿ & ಧನಾಗಮನ", question: "ನನ್ನ ವೃತ್ತಿಜೀವನದ ಮುಂಬರುವ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಹೇಗಿದೆ?" },
          { label: "⚡ ಲೈಂಗಿಕ ಸಾಮರ್ಥ್ಯ & ಅಂತರಂಗ", question: "ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ, ಲೈಂಗಿಕ ಚೈತನ್ಯ ಹಾಗೂ ರಹಸ್ಯ ಆತಂಕಗಳಿಗೆ ಆಯುರ್ವೇದ-ವೈದಿಕ ಪರಿಹಾರವೇನು?" },
          { label: "🕉️ ಗೋಕರ್ಣ ದೋಷ ಪರಿಹಾರ", question: "ನನ್ನ ಜಾತಕದಲ್ಲಿ ಯಾವುದಾದರೂ ದೋಷವಿದೆಯೇ? ಗೋಕರ್ಣದಲ್ಲಿ ಯಾವ ಶಾಂತಿ ಪೂಜೆ ಶ್ರೇಷ್ಠ?" }
        ];
    }
  }

  if (ageYears <= 48) {
    switch (lang) {
      case "en":
        return [
          { label: "👶 Progeny & Family", question: "When is progeny indicated in our marriage, and what is the Gokarna Santhana Gopala remedy?" },
          { label: "💼 Career Frustration Relief", question: "I feel persistent frustration, stagnation, and politics at work. When will this clear?" },
          { label: "💰 Debt Relief & Wealth", question: "How can I overcome financial burdens, debts, and attract lasting prosperity?" },
          { label: "🕊️ Marital Harmony", question: "How can we restore tranquility, mutual affection, and bedroom harmony in marriage?" }
        ];
      case "hi":
        return [
          { label: "👶 संतान प्राप्ति योग", question: "दाम्पत्य में संतान योग कब है और गोकर्ण संतान गोपाल पूजा का क्या महत्व है?" },
          { label: "💼 कार्यक्षेत्र तनाव मुक्ति", question: "नौकरी व व्यवसाय में लगातार अड़चनें और मानसिक तनाव आ रहा है, इससे कब मुक्ति मिलेगी?" },
          { label: "💰 ऋण मुक्ति एवं धन समृद्धि", question: "कर्ज व आर्थिक तंगी से बाहर निकलने के लिए कुंडली अनुसार क्या उपाय करना चाहिए?" },
          { label: "🕊️ दांपत्य सुख एवं शांति", question: "वैवाहिक जीवन में आपसी समझ, सौहार्द और शांति बनाए रखने के लिए क्या मार्गदर्शन है?" }
        ];
      case "te":
        return [
          { label: "👶 సంతాన ప్రాప్తి యోగం", question: "దాంపత్యంలో సంతాన భాగ్యం ఎప్పుడు కలుగుతుంది? గోకర్ణ సంతాన గోపాల పూజ గురించి చెప్పండి." },
          { label: "💼 ఉద్యోగ ఒత్తిడి నివారణ", question: "ఉద్యోగంలో నిరంతర చికాకులు, ఒత్తిడి ఎదురవుతున్నాయి. దీని నుండి ఎప్పుడు ఉపశమనం లభిస్తుంది?" },
          { label: "💰 రుణ విముక్తి & సంపద", question: "అప్పులు, ఆర్థిక నష్టాల నుండి బయటపడటానికి జాతకరీత్యా పరిహారమేమిటి?" },
          { label: "🕊️ దాంపత్య సౌఖ్యం", question: "దాంపత్య జీవితంలో శాంతి, అన్యోన్యతను కాపాడుకోవడానికి మార్గదర్శకత్వమేమిటి?" }
        ];
      case "ta":
        return [
          { label: "👶 குழந்தை பாக்கியம்", question: "தம்பதியினருக்கு குழந்தை பாக்கியம் எப்போது உண்டாகும்? கோகர்ண சந்தான கோபால பூஜை பற்றி கூறுங்கள்." },
          { label: "💼 வேலை மனஅழுத்தம் தீர்வு", question: "வேலையில் தொடர் தடைகளும் மன அழுத்தமும் உள்ளது, இதிலிருந்து எப்போது விடுதலை கிடைக்கும்?" },
          { label: "💰 கடன் நிவாரணம் & செல்வம்", question: "கடன் சுமை மற்றும் நிதி இழப்பிலிருந்து விடுபட ஜாதகப்படி என்ன பரிகாரம் செய்ய வேண்டும்?" },
          { label: "🕊️ குடும்ப அமைதி", question: "திருமண வாழ்க்கையில் அமைதி, பரஸ்பர அன்பு நிலைக்க வழிகாட்டல் என்ன?" }
        ];
      case "ml":
        return [
          { label: "👶 സന്താന ഭാഗ്യം", question: "വിവാഹജീവിതത്തിൽ സന്താനഭാഗ്യം എപ്പോഴാണ് ഉണ്ടാകുക? ഗോകർണ്ണ സന്താന ഗോപാല പൂജയെക്കുറിച്ച് പറയുക." },
          { label: "💼 ജോലി സമ്മർദ്ദത്തിൽ ആശ്വാസം", question: "ജോലിസ്ഥലത്ത് നിരന്തരമായ തടസ്സങ്ങളും മടുപ്പും അനുഭവപ്പെടുന്നു, ഇതിൽ നിന്ന് എപ്പോൾ മോചനം ലഭിക്കും?" },
          { label: "💰 കടബാധ്യത മുക്തി", question: "കടബാധ്യതയിൽ നിന്നും സാമ്പത്തിക ഞെരുക്കത്തിൽ നിന്നും കരകയറാൻ എന്ത് പരിഹാരമാണ് ചെയ്യേണ്ടത്?" },
          { label: "🕊️ ദാമ്പത്യ സൗഖ്യം", question: "ദാമ്പത്യത്തിൽ പരസ്പര സ്നേഹവും സമാധാനവും നിലനിർത്താൻ എന്ത് മാർഗ്ഗനിർദ്ദേശമാണുള്ളത്?" }
        ];
      case "mr":
        return [
          { label: "👶 संतान प्राप्ती योग", question: "वैवाहिक जीवनात संतान योग केव्हा आहे आणि गोकर्ण संतान गोपाल पूजेबद्दल माहिती द्या." },
          { label: "💼 नोकरीतील ताणतणाव मुक्ती", question: "कामात सतत अडथळे आणि नैराश्य येत आहे. यातून मुक्ती कधी मिळेल?" },
          { label: "💰 कर्जमुक्ती व धनलाभ", question: "कर्ज आणि आर्थिक अडचणींतून बाहेर पडण्यासाठी जन्मपत्रिकेनुसार काय उपाय आहेत?" },
          { label: "🕊️ वैवाहिक सुख व शांतता", question: "दांपत्य जीवनात सुसंवाद आणि शांतता राखण्यासाठी काय मार्गदर्शन कराल?" }
        ];
      case "kn":
      default:
        return [
          { label: "👶 ಸಂತಾನ ಭಾಗ್ಯ & ಪುತ್ರ ಪ್ರಾಪ್ತಿ", question: "ದಾಂಪತ್ಯದಲ್ಲಿ ಸಂತಾನ ಪ್ರಾಪ್ತಿ ಯಾವಾಗ? ಗೋಕರ್ಣದ ಸಂತಾನ ಗೋಪಾಲ ಪೂಜೆಯ ಬಗ್ಗೆ ತಿಳಿಸಿ." },
          { label: "💼 ಕೆಲಸದಲ್ಲಿ ಕಿರಿಕಿರಿ & ಮುಕ್ತಿ", question: "ಕೆಲಸದಲ್ಲಿ ನಿರಂತರ ಕಿರಿಕಿರಿ, ಬೇಸರ ಮತ್ತು ಹತಾಶೆ ಎದುರಾಗುತ್ತಿದೆ. ಇದರಿಂದ ಮುಕ್ತಿ ಯಾವಾಗ?" },
          { label: "💰 ಸಾಲ ಮುಕ್ತಿ & ಆರ್ಥಿಕ ನೆಮ್ಮದಿ", question: "ಸಾಲ ಮತ್ತು ಆರ್ಥಿಕ ನಷ್ಟದಿಂದ ಹೊರಬರಲು ಜಾತಕದ ಪ್ರಕಾರ ಏನು ಪರಿಹಾರ?" },
          { label: "🕊️ ದಾಂಪತ್ಯ ಶಾಂತಿ & ಶಯನ ಸುಖ", question: "ದಾಂಪತ್ಯದಲ್ಲಿ ಸಾಮರಸ್ಯ ಹಾಗೂ ಅಂತರಂಗದ ನೆಮ್ಮದಿ ಕಾಪಾಡಿಕೊಳ್ಳಲು ಮಾರ್ಗದರ್ಶನವೇನು?" }
        ];
    }
  }

  // Seniors (49+)
  switch (lang) {
    case "en":
      return [
        { label: "🏡 Children's Prosperity", question: "How is my children's future and prosperity, and how can family harmony be ensured?" },
        { label: "🌿 Health & Longevity", question: "What astrological remedies support good health, mental peace, and longevity?" },
        { label: "🕉️ Gokarna Mahabaleshwara", question: "Which sacred pooja or parihara at Sri Kshetra Gokarna will bestow divine grace?" },
        { label: "🕊️ Spiritual Path & Peace", question: "What spiritual practices and daily sadhana are most auspicious for this stage of life?" }
      ];
    case "hi":
      return [
        { label: "🏡 बच्चों का भविष्य", question: "मेरे बच्चों का भविष्य कैसा रहेगा और परिवार में सुख-शांति कैसे बनी रहे?" },
        { label: "🌿 स्वास्थ्य एवं दीर्घायु", question: "स्वास्थ्य, दीर्घायु और मानसिक शांति के लिए शास्त्रोक्त उपाय क्या हैं?" },
        { label: "🕉️ गोकर्ण महारुद्राभिषेक", question: "श्री क्षेत्र गोकर्ण में कौन सी पूजा या रुद्राभिषेक कराने से दिव्य कृपा प्राप्त होगी?" },
        { label: "🕊️ आध्यात्मिक शांति", question: "जीवन के इस पड़ाव पर मन की शांति के लिए कौन सी दैनिक साधना श्रेष्ठ है?" }
      ];
    case "te":
      return [
        { label: "🏡 పిల్లల భవిష్యత్తు", question: "నా పిల్లల భవిష్యత్తు మరియు కుటుంబంలో సుఖశాంతులు వెల్లివిరియడానికి ఏమి చేయాలి?" },
        { label: "🌿 ఆరోగ్యం & దీర్ఘాయుష్షు", question: "ఆరోగ్యం, దీర్ఘాయుష్షు మరియు మానసిక ప్రశాంతతకు వేద పరిహారాలేమిటి?" },
        { label: "🕉️ గోకర్ణ మహారుద్రాభిషేకం", question: "గోకర్ణ క్షేత్రంలో ఏ శాంతి పూజ లేదా రుద్రాభిషేకం చేయించడం శ్రేయస్కరం?" },
        { label: "🕊️ ఆధ్యాత్మిక ప్రశాంతత", question: "జీవితంలోని ఈ దశలో మనశ్శాంతికి ఏ ఆధ్యాత్మిక సాధన శ్రేష్టమైనది?" }
      ];
    case "ta":
      return [
        { label: "🏡 குழந்தைகளின் எதிர்காலம்", question: "என் குழந்தைகளின் எதிர்காலம் மற்றும் குடும்பத்தில் நிம்மதி நிலவ என்ன செய்ய வேண்டும்?" },
        { label: "🌿 உடல்நலம் & ஆயுள்", question: "உடல் நலம், நீண்ட ஆயுள் மற்றும் மன அமைதிக்கான சாஸ்திர பரிகாரங்கள் என்ன?" },
        { label: "🕉️ கோகர்ண ருத்ராபிஷேகம்", question: "ஸ்ரீ க்ஷேத்ர கோகர்ணத்தில் எந்த சாந்தி பூஜை அல்லது ருத்ராபிஷேகம் செய்வது உத்தமம்?" },
        { label: "🕊️ ஆன்மீக அமைதி", question: "வாழ்க்கையின் இந்த காலகட்டத்தில் மன அமைதிக்கு எந்த ஆன்மீக வழிபாடு சிறந்தது?" }
      ];
    case "ml":
      return [
        { label: "🏡 മക്കളുടെ ഭാവി", question: "മക്കളുടെ ഭാവിയും കുടുംബത്തിൽ സമാധാനവും ഉണ്ടാകാൻ എന്താണ് ചെയ്യേണ്ടത്?" },
        { label: "🌿 ആരോഗ്യവും ദീർഘായുസ്സും", question: "ആരോഗ്യത്തിനും ദീർഘായുസ്സിനും മനശ്ശാന്തിക്കും അനുയോജ്യമായ പരിഹാരം എന്താണ്?" },
        { label: "🕉️ ഗോകർണ്ണ മഹാരുദ്രാഭിഷേകം", question: "ഗോകർണ്ണ ക്ഷേത്രത്തിൽ ഏത് ശാന്തി പൂജയോ രുദ്രാഭിഷേകമോ ആണ് ദിവ്യകൃപ നൽകുക?" },
        { label: "🕊️ ആത്മീയ ശാന്തി", question: "ജീവിതത്തിന്റെ ഈ ഘട്ടത്തിൽ മനസ്സിന്റെ സമാധാനത്തിന് ഏത് ആത്മീയ സാധനയാണ് ഉത്തമം?" }
      ];
    case "mr":
      return [
        { label: "🏡 मुलांचे भविष्य", question: "माझ्या मुलांचे भविष्य आणि कुटुंबात सुख-शांती राहण्यासाठी काय करावे?" },
        { label: "🌿 आरोग्य व दीर्घायुष्य", question: "उत्तम आरोग्य, दीर्घायुष्य आणि मानसिक शांततेसाठी कोणते उपाय आहेत?" },
        { label: "🕉️ गोकर्ण महारुद्राभिषेक", question: "श्री क्षेत्र गोकर्ण येथे कोणती शांती पूजा किंवा रुद्राभिषेक करणे श्रेयस्कर ठरेल?" },
        { label: "🕊️ आध्यात्मिक शांतता", question: "आयुष्याच्या या टप्प्यावर मानसिक समाधानासाठी कोणती साधना करावी?" }
      ];
    case "kn":
    default:
      return [
        { label: "🏡 ಮಕ್ಕಳ ಭವಿಷ್ಯ & ಶಾಂತಿ", question: "ನನ್ನ ಮಕ್ಕಳ ಭವಿಷ್ಯ ಹಾಗೂ ಕುಟುಂಬದಲ್ಲಿ ಸುಖ-ಶಾಂತಿ ನೆಲೆಸಲು ಏನು ಮಾಡಬೇಕು?" },
        { label: "🌿 ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ವೃದ್ಧಿ", question: "ಆರೋಗ್ಯ, ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಮಾನಸಿಕ ನೆಮ್ಮದಿಗೆ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರವೇನು?" },
        { label: "🕉️ ಗೋಕರ್ಣ ಮಹಾರುದ್ರಾಭಿಷೇಕ", question: "ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದಲ್ಲಿ ಯಾವ ಶಾಂತಿ ಪೂಜೆ ಅಥವಾ ರುದ್ರಾಭಿಷೇಕ ಮಾಡಿಸುವುದು ಶ್ರೇಷ್ಠ?" },
        { label: "🕊️ ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗ & ಮುಕ್ತಿ", question: "ಜೀವನದ ಈ ಹಂತದಲ್ಲಿ ಮನಸ್ಸಿನ ನೆಮ್ಮದಿಗೆ ಯಾವ ದೈವಿಕ ಧ್ಯಾನ ಮತ್ತು ಸಾಧನೆ ಶ್ರೇಷ್ಠ?" }
      ];
  }
}

/**
 * Returns authentic, age-adaptive Quick Suggestion FAQ Chips
 * including Lucky Gemstone and Lucky Color/Number chips
 * fully localized across all 7 supported languages without English token leakage
 */
export function getLocalizedQuickFaqChips(
  lang: ConsultationLanguage,
  ageYears: number
): QuickFaqChip[] {
  const base = getAgeSpecificChips(lang, ageYears);

  const universalMap: Record<ConsultationLanguage, QuickFaqChip[]> = {
    en: [
      { label: "💎 Lucky Gemstone", question: "Which lucky gemstone is most auspicious for my birth chart and Lagna? What is the method of wearing?" },
      { label: "🎨 Lucky Color & Number", question: "What are the most auspicious colors and lucky numbers for my horoscope?" }
    ],
    hi: [
      { label: "💎 भाग्यशाली रत्न", question: "मेरी जन्म कुंडली के अनुसार कौन सा भाग्यशाली रत्न धारण करना श्रेष्ठ है? धारण करने की सही विधि क्या है?" },
      { label: "🎨 शुभ रंग एवं अंक", question: "मेरी कुंडली और लग्न के अनुसार मेरा शुभ रंग और भाग्यशाली अंक कौन सा है?" }
    ],
    te: [
      { label: "💎 అదృష్ట రత్నం", question: "నా జన్మ లగ్నానికి ఏ అదృష్ట రత్నం ధరించడం శ్రేయస్కరం? ధరించే పద్ధతి ఏమిటి?" },
      { label: "🎨 అదృష్ట రంగు & సంఖ్య", question: "నా జాతకానికి శుభం కలిగించే అదృష్ట రంగు మరియు అదృష్ట సంఖ్య ఏది?" }
    ],
    ta: [
      { label: "💎 அதிர்ஷ்ட ரத்தினம்", question: "என் லக்னத்திற்கு எந்த அதிர்ஷ்ட ரத்தினம் அணிய வேண்டும்? அணியும் சாஸ்திர முறை என்ன?" },
      { label: "🎨 அதிர்ஷ்ட நிறம் & எண்", question: "என் ஜாதகப்படி எனக்கு அதிர்ஷ்டம் தரும் நிறம் மற்றும் அதிர்ஷ்ட எண் எது?" }
    ],
    ml: [
      { label: "💎 ഭാഗ്യ രത്നം", question: "എന്റെ ജന്മ ലഗ്നത്തിന് ഏറ്റവും അനുയോജ്യമായ ഭാഗ്യരത്നം ഏതാണ്? ധരിക്കേണ്ട രീതി എങ്ങനെ?" },
      { label: "🎨 ഭാഗ്യ നിറവും സംഖ്യയും", question: "എന്റെ ജാതകപ്രകാരം എനിക്ക് ഭാഗ്യം നൽകുന്ന നിറവും ഭാഗ്യ സംഖ്യയും ഏതാണ്?" }
    ],
    mr: [
      { label: "💎 भाग्यवान रत्न", question: "माझ्या जन्म कुंडलीनुसार कोणते भाग्यवान रत्न परिधान करावे? रत्न घालण्याची शास्त्रोक्त पद्धत कोणती?" },
      { label: "🎨 शुभ रंग व अंक", question: "माझ्या पत्रिकेनुसार माझा शुभ रंग आणि भाग्यवान अंक कोणता आहे?" }
    ],
    kn: [
      { label: "💎 ಅದೃಷ್ಟ ರತ್ನ & ಧಾರಣೆ", question: "ನನ್ನ ಜನ್ಮ ಲಗ್ನಕ್ಕೆ ಯಾವ ಅದೃಷ್ಟ ರತ್ನ ಧರಿಸುವುದು ಶ್ರೇಷ್ಠ? ಧಾರಣೆಯ ನಿಯಮವೇನು?" },
      { label: "🎨 ಅದೃಷ್ಟ ಬಣ್ಣ & ಸಂಖ್ಯೆ", question: "ನನ್ನ ಜಾತಕಕ್ಕೆ ಶುಭ ತರುವ ಅದೃಷ್ಟ ಬಣ್ಣ ಮತ್ತು ಅದೃಷ್ಟ ಸಂಖ್ಯೆ ಯಾವುದು?" }
    ]
  };

  const universal = universalMap[lang] || universalMap.kn;
  return [...base, ...universal];
}

