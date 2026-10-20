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
  callUri: "tel:9972339362",
  whatsappUri: "https://wa.me/919972339362"
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

