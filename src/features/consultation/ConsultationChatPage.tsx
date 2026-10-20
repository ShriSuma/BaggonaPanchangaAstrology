/**
 * Baggona Panchanga - 20-Minute Timed Consultation Chat Page
 * Designed for mobile-first luxury experience:
 * - Pure cream background (#FAF6EE), golden borders (#D4AF37), zero black theme
 * - Header banner "॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥"
 * - Decodes tamper-proof encrypted token; rejects immediately if altered
 * - Step 1 Modal: Devotee Contact Details (Mobile Number OR Email required, strict regex validation, saved to DB, shown once only)
 * - Step 2 Modal: 20-Minute Timer Confirmation (all 7 languages supported)
 * - Top Animated Royal Clock-down Graphic (circular gauge + clock hands + pulsing MM:SS)
 * - Timer directly driven by Firestore database timestamp for multi-browser / multi-server consistency
 * - Final 60s / 10s Bonus +1 Minute extension grace banner
 * - Expired Screen: Direct Phone Call to Shreeram Pandit (9972339362) - strictly NO WhatsApp
 * - Uninterrupted 3-4 minute continuous voice input
 * - 2-3 paragraphs (5-6 lines each) of 100% accurate Vedic readings in 7 languages
 */

import React, { useState, useEffect, useRef } from "react";
import {
  getConsultationSession,
  startConsultationTimer,
  updateDevoteeContact,
  claimBonusMinute,
  addConsultationMessage,
  expireConsultationSession,
  decodeSecureConsultationToken,
  isValidPhoneNumber,
  isValidEmailAddress,
  recordConsultationQuestion,
  submitConsultationReview,
  hasUserReviewedOrDismissedSession,
  markSessionReviewDismissed
} from "./consultationDbService";
import type {
  ConsultationSession,
  ConsultationChatMessage,
  ConsultationQuestionRecord,
  ConsultationReview
} from "./consultationTypes";
import {
  CONSULTATION_LANGUAGES,
  DEFAULT_PRIEST_CONTACT,
  CONSULTATION_MODAL_I18N
} from "./consultationTypes";
import {
  generateConsultationAnswer,
  computeDevoteeKundli
} from "./consultationAIEngine";
import { presentConsultationReply } from "./consultationPresenterEngine";
import {
  computeDevoteePanchangaProfile,
  type DevoteePanchangaProfile
} from "./consultationPanchangaService";
import { DevoteePanchangaPatrikaCard } from "./DevoteePanchangaPatrikaCard";
import { SacredKalaChakraClock } from "./SacredKalaChakraClock";
import {
  ContinuousSpeechEngine,
  LANGUAGE_SPEECH_LOCALES
} from "./consultationSpeechService";
import {
  synthesizeAndPlayClonedVoice,
  stopClonedAudio
} from "../audio/aiVoiceCloneEngine";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../auth/authStore";
import { useWalletStore } from "../wallet/walletStore";
import CategorizedNavDrawer from "../../components/navigation/CategorizedNavDrawer";

interface Props {
  sessionId?: string;
}

export const ConsultationChatPage: React.FC<Props> = ({ sessionId }) => {
  const { currentUser, role, isAuthenticated } = useAuthStore();
  const isMasterOrSuperAdmin =
    isAuthenticated &&
    (role === "superadmin" ||
      currentUser?.toLowerCase() === "baggona" ||
      currentUser?.toLowerCase() === "shrisuma" ||
      currentUser === "$hriSuma" ||
      currentUser?.toLowerCase() === "superadmin");
  const wallet = useWalletStore((s) => s.wallet);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [noTokenProvided, setNoTokenProvided] = useState(false);

  // Navigation handlers
  const setPage = useAppStore((s) => s.setPage);
  const handleGoToKundli = () => {
    setPage("public_kundli");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };
  const handleGoToGenerator = () => {
    setPage("consultation_generator");
    if (typeof window !== "undefined") {
      window.location.href = "/consultation-generator";
    }
  };
  const handleGoToSuperAdmin = () => {
    setPage("superadmindashboard");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };
  const handleGoHome = () => {
    setPage("home");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);

  // Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1200); // 20 mins default
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);
  const [startingTimer, setStartingTimer] = useState<boolean>(false);
  const [panchangaProfile, setPanchangaProfile] = useState<DevoteePanchangaProfile | null>(null);

  // Contact Form State (Step 1)
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);

  // Bonus Minute State
  const [showBonusBanner, setShowBonusBanner] = useState<boolean>(false);
  const [claimingBonus, setClaimingBonus] = useState<boolean>(false);

  // Chat State
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ConsultationChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechTimerText, setSpeechTimerText] = useState("00:00");
  const speechEngineRef = useRef<ContinuousSpeechEngine | null>(null);

  // Text-To-Speech State
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const activeVoiceCancelRef = useRef<(() => void) | null>(null);

  // 5-Star Rating & Feedback State
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingToast, setRatingToast] = useState<boolean>(false);

  const geminiApiKey = useAppStore((state) => state.geminiApiKey);

  // 1. Decode Token and Load Session from Firestore
  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoadingSession(true);

      // Extract all candidate tokens from all possible parameters
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const hashQuery = typeof window !== "undefined" && window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
      const hashParams = new URLSearchParams(hashQuery);

      const candidateTokens = [
        sessionId,
        params.get("id"),
        hashParams.get("id"),
        params.get("session"),
        hashParams.get("session"),
        params.get("token"),
        hashParams.get("token"),
        typeof window !== "undefined" ? window.location.hash.replace(/^#\/?(consultation\/|chat-session\/)?/, "").split("?")[0] : ""
      ].filter((t): t is string => Boolean(t && typeof t === "string" && t.trim().length > 0));

      if (candidateTokens.length === 0) {
        if (!isMounted) return;
        setNoTokenProvided(true);
        setSessionError("ಯಾವುದೇ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಅಥವಾ ಟೋಕನ್ ಒದಗಿಸಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೂಪರ್ ಅಡ್ಮಿನ್ ನೀಡಿದ ಅಧಿಕೃತ ಲಿಂಕ್ ಬಳಸಿ. (No consultation token provided. Please use the link generated by Super Admin).");
        setLoadingSession(false);
        return;
      }

      let activeSessionId: string | null = null;

      // Pass 1: Try decoding encrypted secure tokens or raw tokens using decodeSecureConsultationToken
      for (const token of candidateTokens) {
        const decoded = decodeSecureConsultationToken(token);
        if (decoded.isValid && decoded.sessionId) {
          activeSessionId = decoded.sessionId;
          break;
        }
      }

      // Pass 2: If activeSessionId is still not found, check if any token matches raw bgn_ format
      // (Especially if opened with session=bgn_... or raw session ID)
      if (!activeSessionId) {
        for (const token of candidateTokens) {
          let clean = token.trim().toLowerCase().replace(/^(id|session|token)=/, "");
          try { clean = decodeURIComponent(clean); } catch {}
          if (/^bgn_[a-z0-9]{8,16}$/.test(clean)) {
            activeSessionId = clean;
            break;
          }
        }
      }

      // If all candidates failed:
      if (!activeSessionId) {
        if (!isMounted) return;
        setIsTampered(true);
        setSessionError("Security check failed: This consultation link has been altered, tampered with, or is invalid.");
        setLoadingSession(false);
        return;
      }

      try {
        let data: ConsultationSession | null = null;
        let attempts = 0;
        // Automatic resilient retry (up to 3 attempts with 600ms backoff) to account for Firestore network propagation
        while (attempts < 3 && !data && isMounted) {
          try {
            data = await getConsultationSession(activeSessionId);
          } catch (fetchErr) {
            console.warn(`[ConsultationChatPage] Attempt ${attempts + 1} fetch notice:`, fetchErr);
          }
          if (!data && attempts < 2 && isMounted) {
            await new Promise((res) => setTimeout(res, 600));
          }
          attempts++;
        }

        if (!isMounted) return;

        if (!data) {
          setSessionError("ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೂಪರ್ ಅಡ್ಮಿನ್ ನೀಡಿದ ಅಧಿಕೃತ ಲಿಂಕ್ ಬಳಸಿ ಅಥವಾ ಮರುಪ್ರಯತ್ನಿಸಿ. (Consultation session not found in database. Please verify your link or retry).");
          setSession(null);
        } else if (data.status === "deleted") {
          setSessionError("ಈ ಸಮಾಲೋಚನೆ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡು ಡೇಟಾಬೇಸ್‌ನಿಂದ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರವುಗೊಂಡಿದೆ. (This consultation link has expired and has been purged from database).");
          setSession(null);
        } else {
          setSession(data);
          setSessionError(null);
          setMessages(data.messages || []);
          if (data.userPhone) setContactPhone(data.userPhone);
          if (data.userEmail) setContactEmail(data.userEmail);

          // Compute authentic Vedic Birth & Panchanga Patrika coordinates
          try {
            const profile = await computeDevoteePanchangaProfile(data);
            if (isMounted) setPanchangaProfile(profile);
          } catch (pErr) {
            console.warn("[ConsultationChatPage] Panchanga profile notice:", pErr);
          }

          if (data.status === "pending") {
            setShowContactModal(false);
            setShowTimerModal(false);
            setRemainingSeconds((data.durationMinutes || 20) * 60);
          } else if (data.status === "active" && data.expiresAt) {
            setShowContactModal(false);
            setShowTimerModal(false);
            const left = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
            setRemainingSeconds(left);
            if (left <= 0) {
              setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
            }
          } else if (data.status === "expired") {
            setShowContactModal(false);
            setShowTimerModal(false);
            setRemainingSeconds(0);
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setSessionError("Failed to load consultation session: " + (err.message || String(err)));
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
      if (speechEngineRef.current) {
        speechEngineRef.current.stop();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [sessionId]);

  // 2. Active Countdown Timer & Multi-Browser Database Sync Loop
  useEffect(() => {
    if (!session || session.status !== "active" || !session.expiresAt) return;

    // 1-second local tick
    const tickInterval = setInterval(() => {
      const now = Date.now();
      const exp = new Date(session.expiresAt!).getTime();
      const diffSecs = Math.max(0, Math.floor((exp - now) / 1000));

      setRemainingSeconds(diffSecs);

      // Show bonus banner if remaining <= 60s and bonus not yet claimed
      if (diffSecs > 0 && diffSecs <= 60 && !session.bonusMinuteClaimed) {
        setShowBonusBanner(true);
      } else {
        setShowBonusBanner(false);
      }

      if (diffSecs <= 0) {
        clearInterval(tickInterval);
        setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
        void expireConsultationSession(session.id);
      }
    }, 1000);

    // Periodic 12-second database sync to guarantee multi-device & multi-browser parity
    const syncInterval = setInterval(async () => {
      try {
        const fresh = await getConsultationSession(session.id);
        if (fresh) {
          if (fresh.status !== session.status || fresh.expiresAt !== session.expiresAt) {
            setSession(fresh);
            if (fresh.expiresAt) {
              const freshDiff = Math.max(0, Math.floor((new Date(fresh.expiresAt).getTime() - Date.now()) / 1000));
              setRemainingSeconds(freshDiff);
            }
          }
        }
      } catch {
        // Ignore background sync errors
      }
    }, 12000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [session?.status, session?.expiresAt, session?.id, session?.bonusMinuteClaimed]);

  // 3. Initialize Welcome Message
  useEffect(() => {
    let isCancelled = false;

    async function initWelcome() {
      if (session && messages.length === 0) {
        const kundliData = await computeDevoteeKundli(session);
        if (isCancelled) return;

        let welcomeText = "";
        if (session.language === "en") {
          welcomeText = `Namaste ${session.name}! Welcome to your 20-minute private Vedic astrological consultation with Sri Baggona Panchanga, Gokarna.\n\nAccording to your birth chart, you are born in ${kundliData.lagnaName} Lagna and ${kundliData.moonRashi} Moon Sign with ${kundliData.nakshatra} Nakshatra (Pada ${kundliData.pada}). Currently, you are in ${kundliData.currentDashaText}.\n\nYou can ask any question regarding your current life situation, job, business, marriage, health, or remedial Shanti homas. Feel free to type or tap the microphone to speak.`;
        } else if (session.language === "hi") {
          welcomeText = `नमस्ते ${session.name} जी! श्री बग्गोण पंचांग, गोकर्ण में आपके 20 मिनट के वैदिक ज्योतिष परामर्श में स्वागत है।\n\nआपकी जन्म कुंडली के अनुसार आपका ${kundliData.lagnaName} लग्न और ${kundliData.moonRashi} चंद्र राशि है, साथ ही ${kundliData.nakshatra} नक्षत्र (चरण ${kundliData.pada}) है। वर्तमान में आपकी ${kundliData.currentDashaText} चल रही है।\n\nआप अपने भविष्य, करियर, विवाह, आर्थिक स्थिति या ग्रह शांति के बारे में कोई भी प्रश्न पूछ सकते हैं।`;
        } else if (session.language === "te") {
          welcomeText = `నమస్కారం ${session.name} గారు! శ్రీ బగ్గోణ పంచాంగం, గోకర్ణ 20 నిమిషాల వేద జ్యోతిష్య సంప్రదింపులకు స్వాగతం.\n\nమీ జన్మ కుండలి ప్రకారం మీరు ${kundliData.lagnaName} లగ్నం మరియు ${kundliData.moonRashi} చంద్ర రాశి, ${kundliData.nakshatra} నక్షత్రం (పాదం ${kundliData.pada})లో జన్మించారు. ప్రస్తుతం మీ జాతకంలో ${kundliData.currentDashaText} నడుస్తోంది.\n\nమీరు మీ భవిష్యత్తు, ఉద్యోగం, వివాహం లేదా పరిహారాల గురించి ఏవైనా ప్రశ్నలు అడగవచ్చు.`;
        } else if (session.language === "ta") {
          welcomeText = `வணக்கம் ${session.name}! ஸ்ரீ பக்கவணா பஞ்சாங்கம், கோகர்ணாவின் 20 நிமிட வேத ஜோதிட ஆலோசனைக்கு உங்களை வரவேற்கிறோம்.\n\nஉங்கள் ஜாதகப்படி நீங்கள் ${kundliData.lagnaName} லக்னம் மற்றும் ${kundliData.moonRashi} ராசி, ${kundliData.nakshatra} நட்சத்திரம் (பாதம் ${kundliData.pada})த்தில் பிறந்துள்ளீர்கள். தற்போது உங்கள் ஜாதகத்தில் ${kundliData.currentDashaText} நடப்பில் உள்ளது.\n\nஉங்கள் வேலை, திருமணம், குடும்பம் அல்லது பரிகாரங்கள் குறித்து எந்த கேள்வியையும் நீங்கள் கேட்கலாம்.`;
        } else if (session.language === "ml") {
          welcomeText = `നമസ്കാരം ${session.name}! ശ്രീ ബഗ്ഗോണ പഞ്ചാംഗം, ഗോകർണത്തിന്റെ 20 മിനിറ്റ് വേദ ജ്യോതിഷ കൺസൾട്ടേഷനിലേക്ക് സ്വാഗതം.\n\nനിങ്ങളുടെ ജാതകപ്രകാരം ${kundliData.lagnaName} ലഗ്നവും ${kundliData.moonRashi} രാശിയും ${kundliData.nakshatra} നക്ഷത്രവും (പാദം ${kundliData.pada}) ആണ്. ഇപ്പോൾ നിങ്ങളുടെ ജാതകത്തിൽ ${kundliData.currentDashaText} നടക്കുന്നു.\n\nനിങ്ങളുടെ കരിയർ, വിവാഹം, കുടുംബം അല്ലെങ്കിൽ പൂജാ പരിഹാരങ്ങൾ സംബന്ധിച്ച ഏത് ചോദ്യവും ചോദിക്കാം.`;
        } else if (session.language === "mr") {
          welcomeText = `नमस्कार ${session.name} जी! श्री बग्गोण पंचांग, गोकर्ण यांच्या 20 मिनिटांच्या वैदिक ज्योतिष सल्लामसलतीमध्ये आपले स्वागत आहे.\n\nआपल्या जन्मकुंडलीनुसार आपला जन्म ${kundliData.lagnaName} लग्न आणि ${kundliData.moonRashi} राशीमध्ये ${kundliData.nakshatra} नक्षत्रात (चरण ${kundliData.pada}) झाला आहे. सध्या आपल्या पत्रिकेत ${kundliData.currentDashaText} सुरू आहे.\n\nआपण आपल्या करिअर, विवाह, संपत्ती किंवा ग्रह शांती उपायांबद्दल कोणताही प्रश्न विचारू शकता.`;
        } else {
          // Kannada default
          welcomeText = `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ! ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆಗೆ ಆತ್ಮೀಯ ಸ್ವಾಗತ.\n\nನಿಮ್ಮ ಜನ್ಮಕುಂಡಲಿಯ ಶಾಸ್ತ್ರೋಕ್ತ ಲೆಕ್ಕಾಚಾರದ ಪ್ರಕಾರ ನೀವು ${kundliData.lagnaName} ಲಗ್ನ, ${kundliData.moonRashi} ರಾಶಿ ಹಾಗೂ ${kundliData.nakshatra} ನಕ್ಷತ್ರ (ಪಾದ ${kundliData.pada})ದಲ್ಲಿ ಜನ್ಮತಾಳಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಾತಕದಲ್ಲಿ ${kundliData.currentDashaText} ನಡೆಯುತ್ತಿದೆ.\n\nನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜೀವನ ಸ್ಥಿತಿ, ಉದ್ಯೋಗ, ವ್ಯಾಪಾರ, ವಿವಾಹ, ಕೌಟುಂಬಿಕ ಶಾಂತಿ ಹಾಗೂ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ದೈವಿಕ ಪರಿಹಾರಗಳ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಮುಕ್ತವಾಗಿ ಕೇಳಿ.`;
        }

        const welcomeMsg: ConsultationChatMessage = {
          id: "msg_welcome",
          sender: "astrologer",
          text: welcomeText,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMsg]);
        void addConsultationMessage(session.id, welcomeMsg);
      }
    }

    void initWelcome();

    return () => {
      isCancelled = true;
    };
  }, [session, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Handle Step 1: Submit Devotee Contact
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setContactError(null);

    const phoneTrim = contactPhone.trim();
    const emailTrim = contactEmail.trim();

    // At least one is mandatory
    if (!phoneTrim && !emailTrim) {
      setContactError(currentI18n.oneRequiredError);
      return;
    }

    // Validate phone if entered
    if (phoneTrim && !isValidPhoneNumber(phoneTrim)) {
      setContactError(currentI18n.phoneError);
      return;
    }

    // Validate email if entered
    if (emailTrim && !isValidEmailAddress(emailTrim)) {
      setContactError(currentI18n.emailError);
      return;
    }

    setSavingContact(true);
    try {
      const updated = await updateDevoteeContact(session.id, {
        phone: phoneTrim || undefined,
        email: emailTrim || undefined
      });
      setSession(updated);
      setShowContactModal(false);
      setShowTimerModal(true); // Proceed to Step 2
    } catch (err: any) {
      setContactError("Failed to save contact: " + (err.message || String(err)));
    } finally {
      setSavingContact(false);
    }
  };

  // Handle Step 2: Start 20-Minute Timer
  const handleStartTimer = async () => {
    if (!session) return;
    setStartingTimer(true);
    try {
      const updated = await startConsultationTimer(session.id);
      setSession(updated);
      setMessages(updated.messages || []);
      setShowTimerModal(false);
      setRemainingSeconds(1200);
    } catch (err: any) {
      alert("Failed to start consultation timer: " + (err.message || String(err)));
    } finally {
      setStartingTimer(false);
    }
  };

  // Handle Sacred Landing Patrika Start Action
  const handleStartConsultationFromCard = async () => {
    if (!session || startingTimer) return;
    const phoneTrim = contactPhone.trim();

    if (phoneTrim && !isValidPhoneNumber(phoneTrim)) {
      alert(currentI18n.phoneError);
      return;
    }

    setStartingTimer(true);
    try {
      let currentSession = session;
      if (phoneTrim && !session.hasProvidedContact) {
        currentSession = await updateDevoteeContact(session.id, {
          phone: phoneTrim,
          email: contactEmail.trim() || undefined
        });
      }
      const updated = await startConsultationTimer(currentSession.id);
      setSession(updated);
      setMessages(updated.messages || []);
      setRemainingSeconds(1200);
      setShowContactModal(false);
      setShowTimerModal(false);
    } catch (err: any) {
      alert("ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಲು ವಿಫಲವಾಗಿದೆ: " + (err.message || String(err)));
    } finally {
      setStartingTimer(false);
    }
  };

  // Handle Claiming Bonus +1 Minute
  const handleClaimBonusMinute = async () => {
    if (!session || claimingBonus) return;
    setClaimingBonus(true);
    try {
      const updated = await claimBonusMinute(session.id);
      setSession(updated);
      setShowBonusBanner(false);
      if (updated.expiresAt) {
        const left = Math.max(0, Math.floor((new Date(updated.expiresAt).getTime() - Date.now()) / 1000));
        setRemainingSeconds(left);
      }
    } catch (err: any) {
      alert("Could not claim bonus time: " + (err.message || String(err)));
    } finally {
      setClaimingBonus(false);
    }
  };

  // Handle Speech Recognition (Continuous 3-4 minutes)
  const toggleSpeechRecognition = () => {
    if (!session || session.status === "expired") return;

    if (isListening) {
      if (speechEngineRef.current) {
        const text = speechEngineRef.current.stop();
        if (text) setInputText(text);
      }
      setIsListening(false);
      return;
    }

    if (!speechEngineRef.current) {
      speechEngineRef.current = new ContinuousSpeechEngine(session.language);
    } else {
      speechEngineRef.current.setLanguage(session.language);
    }

    const started = speechEngineRef.current.start(inputText, {
      onTranscriptUpdate: (fullText) => {
        setInputText(fullText);
      },
      onTimeTick: (_secs, formatted) => {
        setSpeechTimerText(formatted);
      },
      onError: (err) => {
        alert(err);
        setIsListening(false);
      },
      onStateChange: (active) => {
        setIsListening(active);
      }
    });

    if (started) {
      setIsListening(true);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question || !session || isGenerating || session.status !== "active" || remainingSeconds <= 0) return;

    // Check expiry
    if (remainingSeconds <= 0) {
      setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
      return;
    }

    if (isListening && speechEngineRef.current) {
      speechEngineRef.current.stop();
      setIsListening(false);
    }

    setInputText("");

    const userMsg: ConsultationChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: question,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    void addConsultationMessage(session.id, userMsg);

    setIsGenerating(true);

    try {
      const chatTurns = newHistory.map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text
      }));

      const effectiveKey = (
        geminiApiKey ||
        (typeof import.meta !== "undefined"
          ? (import.meta as any).env?.VITE_GEMINI_API_KEY
          : "") ||
        ""
      ).trim();

      const reading = await presentConsultationReply({
        session,
        userQuestion: question,
        conversationHistory: chatTurns.slice(-6),
        apiKey: effectiveKey
      });

      const astrologerMsg: ConsultationChatMessage = {
        id: `astro_${Date.now()}`,
        sender: "astrologer",
        text: reading.fullText,
        timestamp: new Date().toISOString(),
        hasDosha: reading.hasDosha,
        doshaName: reading.doshaName,
        doshaParihara: reading.doshaParihara,
        activeDoshaCard: reading.activeDoshaCard,
        intent: reading.sensedContext?.categoryLabel
      };

      setMessages((prev) => [...prev, astrologerMsg]);
      void addConsultationMessage(session.id, astrologerMsg);

      // Record question in dedicated Firestore collection "consultation_questions"
      const questionRecord: ConsultationQuestionRecord = {
        id: `cq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId: session.id,
        userId: session.userPhone || session.userEmail || session.id,
        userName: session.name,
        userPhone: session.userPhone || "",
        userEmail: session.userEmail || "",
        question,
        category: reading.sensedContext?.category,
        answerSnippet:
          reading.fullText.slice(0, 300) + (reading.fullText.length > 300 ? "..." : ""),
        hasDosha: reading.hasDosha || false,
        doshaName: reading.doshaName || undefined,
        doshaParihara: reading.doshaParihara || undefined,
        language: session.language,
        timestamp: new Date().toISOString()
      };
      void recordConsultationQuestion(questionRecord);
    } catch (err: any) {
      const fallbackMsg: ConsultationChatMessage = {
        id: `astro_err_${Date.now()}`,
        sender: "astrologer",
        text: `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಶ್ನಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪಂಡಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ: 9972339362.`,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      void addConsultationMessage(session.id, fallbackMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      stopClonedAudio();
      if (activeVoiceCancelRef.current) {
        activeVoiceCancelRef.current();
        activeVoiceCancelRef.current = null;
      }
    };
  }, []);

  // Third-Party AI Real-Time Neural Voice Engine (voice_sriram_pandit with Male Web DSP Fallback)
  const handlePlayTTS = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopClonedAudio();
      if (activeVoiceCancelRef.current) {
        activeVoiceCancelRef.current();
        activeVoiceCancelRef.current = null;
      }
      setSpeakingMessageId(null);
      return;
    }

    stopClonedAudio();
    if (activeVoiceCancelRef.current) {
      activeVoiceCancelRef.current();
      activeVoiceCancelRef.current = null;
    }

    setSpeakingMessageId(msgId);
    const lang = (session?.language || "kn") as any;

    void synthesizeAndPlayClonedVoice(
      text,
      lang,
      "voice_sriram_pandit",
      () => {
        setSpeakingMessageId(null);
        activeVoiceCancelRef.current = null;
      },
      () => {
        setSpeakingMessageId(msgId);
      }
    ).then((cancelFn) => {
      activeVoiceCancelRef.current = cancelFn;
    }).catch((err) => {
      console.warn("[ConsultationChatPage] Neural TTS stream notice:", err);
      setSpeakingMessageId(null);
    });
  };

  // Auto-prompt rating modal once when session expires
  useEffect(() => {
    if (!session) return;
    if (session.status === "expired" || remainingSeconds <= 0) {
      if (!hasUserReviewedOrDismissedSession(session.id)) {
        const timer = setTimeout(() => {
          setShowRatingModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [session?.status, remainingSeconds, session?.id]);

  const handleSubmitRatingReview = async () => {
    if (!session || isSubmittingRating) return;
    setIsSubmittingRating(true);
    try {
      const review: ConsultationReview = {
        id: `cr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sessionId: session.id,
        userId: session.userPhone || session.userEmail || session.id,
        userName: session.name,
        userPhone: session.userPhone || "",
        userEmail: session.userEmail || "",
        rating: selectedStars,
        feedbackText: ratingComment.trim(),
        timestamp: new Date().toISOString()
      };
      await submitConsultationReview(review);
      setShowRatingModal(false);
      setRatingToast(true);
      setTimeout(() => setRatingToast(false), 5000);
    } catch (err) {
      console.warn("[ConsultationChatPage] Failed to save review:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDismissRatingReview = () => {
    if (session) {
      markSessionReviewDismissed(session.id);
    }
    setShowRatingModal(false);
  };

  // Format MM:SS
  const formatTimer = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Current Language Meta
  const currentLang = session?.language || "kn";
  const currentLangMeta =
    CONSULTATION_LANGUAGES.find((l) => l.code === currentLang) || CONSULTATION_LANGUAGES[0];
  const currentI18n = CONSULTATION_MODAL_I18N[currentLang] || CONSULTATION_MODAL_I18N.kn;

  const totalDurationSeconds = (session?.durationMinutes || 20) * 60;
  const timerPercentage = Math.min(100, Math.max(0, (remainingSeconds / totalDurationSeconds) * 100));
  const isExpired = session?.status === "expired" || remainingSeconds <= 0;

  // Clock SVG circumference (radius 40, circum = 2 * pi * 40 ≈ 251.32)
  const clockCircumference = 2 * Math.PI * 40;
  const clockDashOffset = clockCircumference - (timerPercentage / 100) * clockCircumference;

  // -------------------------------------------------------------
  // Tampered or Invalid Link Screen
  // -------------------------------------------------------------
  if (isTampered) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-amber-950 flex flex-col justify-between font-sans selection:bg-amber-200">
        {/* Super Admin Top Navigation Bar */}
        {isMasterOrSuperAdmin && (
          <header className="w-full bg-slate-950 border-b border-amber-500/30 px-3 py-2.5 flex items-center justify-between text-white shadow-md z-40 sticky top-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition focus:outline-hidden"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-serif font-bold text-sm sm:text-base text-amber-300">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleGoToKundli}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
              >
                <span>📊</span> <span className="hidden sm:inline">ಜಾತಕ</span> (Kundli)
              </button>
              <button
                type="button"
                onClick={handleGoToGenerator}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
              >
                <span>🔗</span> <span className="hidden sm:inline">ಲಿಂಕ್ ರಚನೆ</span> (Generator)
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg text-xs transition"
              >
                🏠 Home
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-2 border-red-400 rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 border border-red-300 text-red-700 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold font-serif text-red-900">
              {currentI18n.tamperedLinkTitle}
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              {currentI18n.tamperedLinkMsg}
            </p>

            {/* Super Admin Control Options */}
            {isMasterOrSuperAdmin && (
              <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-3.5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>👑</span> ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ (Super Admin Controls):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs"
                  >
                    <span>☰</span> ಮೆನು (Burger)
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoToGenerator}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>🔗</span> ಲಿಂಕ್ ಜನರೇಟರ್
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToKundli}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>📊</span> ಕುಂಡಲಿ ಪುಟ
                  </button>
                </div>
              </div>
            )}

            {/* General Navigation Buttons (Only visible to verified Super Admin, never end-users) */}
            {isMasterOrSuperAdmin && (
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoToKundli}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>📊</span> ಜಾತಕಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Kundali)
                </button>
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-stone-300 flex items-center justify-center gap-1.5"
                >
                  <span>🏠</span> ಮುಖಪುಟಕ್ಕೆ ತೆರಳಿ (Go to Home)
                </button>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900">
              <p className="font-bold">ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ</p>
              <p className="mt-1">ಪಂಡಿತರು: {DEFAULT_PRIEST_CONTACT.name}</p>
            </div>
            <a
              href={DEFAULT_PRIEST_CONTACT.callUri}
              className="block w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition"
            >
              📞 {currentI18n.callPriestBtn}
            </a>
          </div>
        </div>

        {/* Super Admin Burger Navigation Drawer */}
        {isMasterOrSuperAdmin && (
          <CategorizedNavDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            role={role}
            isMasterOrSuperAdmin={isMasterOrSuperAdmin}
            language="kn"
            currentUser={currentUser}
            priestName={wallet?.priestName || DEFAULT_PRIEST_CONTACT.name}
            hasPanchanga={true}
            hasSankhya={true}
            hasDiksuchi={true}
            hasPurvaJanma={true}
            hasPublicKundli={true}
          />
        )}
      </div>
    );
  }

  // Loading Screen
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-amber-950 flex flex-col justify-between font-sans">
        {isMasterOrSuperAdmin && (
          <header className="w-full bg-slate-950 border-b border-amber-500/30 px-3 py-2.5 flex items-center justify-between text-white shadow-md z-40 sticky top-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition focus:outline-hidden"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-serif font-bold text-sm sm:text-base text-amber-300">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGoToKundli}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition"
              >
                📊 Kundli
              </button>
            </div>
          </header>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-2xl border-4 border-amber-500 border-t-transparent animate-spin mb-4" />
          <h2 className="font-serif text-lg font-bold text-amber-900">
            ॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಗೋಕರ್ಣ ॥
          </h2>
          <p className="text-xs text-amber-700 mt-1">ದೈವಜ್ಞ ಸಮಾಲೋಚನೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</p>
        </div>
      </div>
    );
  }

  // Session Error or No Token Screen
  if (sessionError || !session || noTokenProvided) {
    return (
      <div className="min-h-screen bg-[#FAF6EE] text-amber-950 flex flex-col justify-between font-sans selection:bg-amber-200">
        {/* Super Admin Top Navigation Bar */}
        {isMasterOrSuperAdmin && (
          <header className="w-full bg-slate-950 border-b border-amber-500/30 px-3 py-2.5 flex items-center justify-between text-white shadow-md z-40 sticky top-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition focus:outline-hidden"
                aria-label="Open Navigation Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="font-serif font-bold text-sm sm:text-base text-amber-300">
                ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleGoToKundli}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
              >
                <span>📊</span> <span className="hidden sm:inline">ಜಾತಕ</span> (Kundli)
              </button>
              <button
                type="button"
                onClick={handleGoToGenerator}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1"
              >
                <span>🔗</span> <span className="hidden sm:inline">ಲಿಂಕ್ ರಚನೆ</span> (Generator)
              </button>
              <button
                type="button"
                onClick={handleGoHome}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg text-xs transition"
              >
                🏠 Home
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-2 border-amber-300 rounded-3xl p-6 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-3xl border border-amber-300">
              🕉️
            </div>
            <h2 className="text-xl font-bold font-serif text-amber-950">
              {noTokenProvided
                ? "॥ ಬಗ್ಗೋಣ ಸಮಾಲೋಚನೆ ಲಿಂಕ್ ಅಗತ್ಯವಿದೆ ॥"
                : isTampered
                ? currentI18n.tamperedLinkTitle
                : sessionError
                ? "ಸಮಾಲೋಚನೆ ಸ್ಥಿತಿ (Consultation Status)"
                : currentI18n.sessionEndedTitle}
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              {noTokenProvided
                ? "೨೦ ನಿಮಿಷಗಳ ಖಾಸಗಿ ಸಮಾಲೋಚನೆಗೆ ಪ್ರವೇಶಿಸಲು ಸೂಪರ್ ಅಡ್ಮಿನ್ ನೀಡಿದ ಅಧಿಕೃತ ಲಿಂಕ್ ಬಳಸಿ. ನೀವು ಸೂಪರ್ ಅಡ್ಮಿನ್ ಆಗಿದ್ದರೆ, ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಹೊಸ ಲಿಂಕ್ ರಚಿಸಬಹುದು."
                : sessionError || currentI18n.sessionEndedMsg}
            </p>

            {/* Super Admin Control Options */}
            {isMasterOrSuperAdmin && (
              <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-3.5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>👑</span> ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ (Super Admin Controls):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shadow-xs"
                  >
                    <span>☰</span> ಮೆನು (Burger)
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoToGenerator}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>🔗</span> ಲಿಂಕ್ ಜನರೇಟರ್
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToKundli}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>📊</span> ಕುಂಡಲಿ ಪುಟ
                  </button>
                </div>
              </div>
            )}

            {/* General Navigation Buttons (Only visible to verified Super Admin, never end-users) */}
            <div className="flex flex-col gap-2 pt-1">
              {!noTokenProvided && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs transition"
                >
                  🔄 ಮರುಪ್ರಯತ್ನಿಸಿ (Retry Loading)
                </button>
              )}
              {isMasterOrSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handleGoToKundli}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>📊</span> ಜಾತಕಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Kundali)
                  </button>
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-stone-300 flex items-center justify-center gap-1.5"
                  >
                    <span>🏠</span> ಮುಖಪುಟಕ್ಕೆ ತೆರಳಿ (Go to Home)
                  </button>
                </>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 mt-2">
              <p className="font-bold">ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ</p>
              <p className="mt-1">ಪಂಡಿತರು: {DEFAULT_PRIEST_CONTACT.name}</p>
            </div>
            <a
              href={DEFAULT_PRIEST_CONTACT.callUri}
              className="block w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition"
            >
              📞 {currentI18n.callPriestBtn}
            </a>
          </div>
        </div>

        {/* Super Admin Burger Navigation Drawer */}
        {isMasterOrSuperAdmin && (
          <CategorizedNavDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            role={role}
            isMasterOrSuperAdmin={isMasterOrSuperAdmin}
            language="kn"
            currentUser={currentUser}
            priestName={wallet?.priestName || DEFAULT_PRIEST_CONTACT.name}
            hasPanchanga={true}
            hasSankhya={true}
            hasDiksuchi={true}
            hasPurvaJanma={true}
            hasPublicKundli={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-stone-900 flex flex-col items-center justify-between font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* -------------------------------------------------------------
          Header Bar: Brand & Sacred Gokarna Emblem
          ------------------------------------------------------------- */}
      <header className="w-full bg-[#FAF6EE] border-b-2 border-amber-300/80 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMasterOrSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 -ml-1 text-amber-800 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors focus:outline-hidden"
                aria-label="Open Navigation Menu"
                title="Super Admin Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center font-serif text-lg font-bold shadow-md border border-amber-300">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-black text-amber-950 text-sm sm:text-base leading-tight tracking-tight">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-sm border border-amber-300">
                  ಗೋಕರ್ಣ
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-800 font-medium">
                ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isMasterOrSuperAdmin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGoToKundli}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg shadow-xs transition"
                  title="Back to Kundli"
                >
                  📊 <span className="hidden sm:inline">Kundli</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoToGenerator}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg shadow-xs transition"
                  title="Link Generator"
                >
                  🔗 <span className="hidden sm:inline">Generator</span>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowRatingModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition"
              title={currentI18n.ratingModalTitle}
            >
              <span>⭐</span>
              <span className="hidden sm:inline">{currentI18n.ratingTriggerBtn}</span>
            </button>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-2 py-1 rounded-lg font-bold">
              {currentLangMeta.nativeName}
            </span>
          </div>
        </div>

        {/* 5-Star Rating Success Toast */}
        {ratingToast && (
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 px-4 py-2 border-b border-amber-300 flex items-center justify-between text-xs font-serif font-bold shadow-md animate-fadeIn">
            <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🌟</span>
                <span>{currentI18n.ratingSubmittedToast}</span>
              </div>
              <button
                onClick={() => setRatingToast(false)}
                className="text-amber-200 hover:text-white text-sm font-bold px-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            Sacred Vedic Kala Chakra Ticking Timepiece & Progress Engine
            ------------------------------------------------------------- */}
        <SacredKalaChakraClock
          session={session}
          remainingSeconds={remainingSeconds}
          totalDurationSeconds={totalDurationSeconds}
          language={session.language}
          isExpired={isExpired}
          onStart={() => {
            void handleStartConsultationFromCard();
          }}
          startingTimer={startingTimer}
          onClaimBonus={handleClaimBonusMinute}
          claimingBonus={claimingBonus}
          showBonusBanner={showBonusBanner}
        />
      </header>

      {/* -------------------------------------------------------------
          Devotee Profile & Sacred Panchanga Patrika Card Switch
          - When session is "pending": Render the sacred landing Panchanga Card (First Screen)
          - When session is "active" or "expired": Render collapsible banner + conversation thread
          ------------------------------------------------------------- */}
      {session.status === "pending" ? (
        <div className="w-full max-w-2xl px-3 py-4 flex-1 flex flex-col justify-start">
          {panchangaProfile ? (
            <DevoteePanchangaPatrikaCard
              profile={panchangaProfile}
              variant="landing"
              onStartConsultation={() => void handleStartConsultationFromCard()}
              phoneInput={contactPhone}
              onPhoneInputChange={setContactPhone}
              isStarting={startingTimer}
            />
          ) : (
            <div className="bg-white/90 border border-amber-300 rounded-2xl p-6 text-center text-amber-950 font-serif shadow-md space-y-3">
              <span className="text-3xl animate-spin block">☸️</span>
              <p className="font-bold text-sm">ಪಂಚಾಂಗ ಹಾಗೂ ಜಾತಕ ವಿವರಗಳನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Top Collapsible Sacred Panchanga Patrika Banner */}
          {panchangaProfile && (
            <div className="w-full max-w-2xl px-3 pt-2">
              <DevoteePanchangaPatrikaCard
                profile={panchangaProfile}
                variant="banner"
              />
            </div>
          )}

      {/* -------------------------------------------------------------
          Main Chat Conversation Thread
          ------------------------------------------------------------- */}
      <main className="w-full max-w-2xl flex-1 px-3 py-3 overflow-y-auto space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
            >
              {/* Sender Tag */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 mb-1 px-1">
                <span>{isUser ? "ನೀವು (Devotee)" : "ದೈವಜ್ಞರು (Head Astrologer, Gokarna)"}</span>
                <span className="text-stone-400 font-normal">
                  • {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                  isUser
                    ? "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white rounded-br-xs font-medium"
                    : "bg-white border-2 border-amber-300/90 text-amber-950 rounded-bl-xs font-serif shadow-amber-950/5 space-y-2.5"
                }`}
              >
                {/* Format paragraphs */}
                {msg.text.split("\n\n").map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}

                {/* Dedicated Luxury Gold Dosha & Karma Insight Card */}
                {!isUser && msg.activeDoshaCard && (
                  <div className="mt-3 mb-2 p-3.5 bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/90 border-2 border-amber-400/90 rounded-2xl shadow-md text-amber-950 font-serif space-y-2.5">
                    <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪐</span>
                        <span className="font-bold text-amber-950 text-xs md:text-sm tracking-wide">
                          ॥ ಜಾತಕ ದೋಷ / ಕರ್ಮ ಸಂಬಂಧಿತ ಒಳನೋಟ ॥
                        </span>
                      </div>
                      <span className="bg-red-700 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                        ವಿಶೇಷ ಪರಿಹಾರ
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">⚡ ದೋಷ / ಬಾಧೆ:</span>
                        <span className="text-red-900 font-bold text-[12px]">{msg.activeDoshaCard.doshaName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">🪐 ಗ್ರಹ ಸಂಯೋಗ:</span>
                        <span className="text-amber-900 leading-relaxed text-[11px]">{msg.activeDoshaCard.technicalWhy}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">⚠️ ಪ್ರಸ್ತುತ ಪರಿಣಾಮ:</span>
                        <span className="text-amber-950 leading-relaxed text-[11px]">{msg.activeDoshaCard.currentLifeProblems}</span>
                      </div>
                      <div className="flex items-start gap-2 bg-amber-100/80 p-2 rounded-xl border border-amber-300">
                        <span className="text-amber-900 font-bold whitespace-nowrap text-[11px]">🛕 ಪರಿಹಾರ ಸಂಕಲ್ಪ:</span>
                        <span className="text-amber-950 font-medium leading-relaxed text-[11px]">{msg.activeDoshaCard.recommendedPooja}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-300 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[10px] text-amber-900 font-sans">
                        <span>ಆಚಾರ್ಯರು: </span>
                        <span className="font-bold">{msg.activeDoshaCard.priestName || DEFAULT_PRIEST_CONTACT.name}</span>
                        <span className="block text-[9px] text-amber-800/80">ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${msg.activeDoshaCard.priestPhone || DEFAULT_PRIEST_CONTACT.phone}`}
                          className="bg-red-700 hover:bg-red-800 text-white font-sans text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                        >
                          <span>📞 ನೇರ ಕರೆ</span>
                          <span className="text-[10px] opacity-90">({msg.activeDoshaCard.priestPhone || DEFAULT_PRIEST_CONTACT.phone})</span>
                        </a>
                        <a
                          href={DEFAULT_PRIEST_CONTACT.whatsappUri}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                          title="WhatsApp ನಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ"
                        >
                          <span>💬</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Astrologer Dosha Chapter Badge (Fallback if no full card) */}
                {!isUser && !msg.activeDoshaCard && msg.hasDosha && (
                  <div className="mt-2 mb-1 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-400 rounded-xl flex items-center justify-between text-xs text-amber-950 font-serif shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <div>
                        <span className="font-bold text-amber-900 block text-[11px]">ದೋಷ ಪರಿಹಾರ ಅಧ್ಯಾಯ (೪ನೇ ಪ್ಯಾರಾ):</span>
                        <span className="text-[11px] text-amber-800">{msg.doshaName || "ವಿಶೇಷ ಜಾತಕ ದೋಷ"}</span>
                      </div>
                    </div>
                    <a
                      href={DEFAULT_PRIEST_CONTACT.callUri}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs transition whitespace-nowrap"
                    >
                      📞 ಪರಿಹಾರ ಕರೆ
                    </a>
                  </div>
                )}

                {/* Astrologer TTS Audio Action */}
                {!isUser && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800/80 font-sans italic">
                      ಶ್ರೀ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞ ಉತ್ತರ
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlayTTS(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans font-bold transition ${
                        speakingMessageId === msg.id
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                      }`}
                    >
                      <span>{speakingMessageId === msg.id ? "⏹️ ನಿಲ್ಲಿಸಿ" : "🔊 ಆಲಿಸಿ"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing / Generating Indicator */}
        {isGenerating && (
          <div className="flex flex-col items-start w-full animate-pulse">
            <span className="text-[10px] font-bold text-amber-900 mb-1 px-1">
              ದೈವಜ್ಞರು (Astrologer, Gokarna)
            </span>
            <div className="bg-white border-2 border-amber-300 rounded-2xl rounded-bl-xs p-3.5 text-xs text-amber-900 font-serif flex items-center gap-2 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-sans ml-1 text-amber-800">
                ಜನ್ಮಕುಂಡಲಿ & ದಶಾ-ಗೋಚಾರ ಗಣಿತ ಸಂಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* -------------------------------------------------------------
          Footer Input Bar (ChatGPT / Claude Style)
          ------------------------------------------------------------- */}
      <footer className="w-full bg-[#FAF6EE] border-t-2 border-amber-300/80 sticky bottom-0 z-20 p-2 sm:p-3 shadow-lg">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Quick Questions Chips */}
          {!isExpired && messages.length <= 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    session.language === "en"
                      ? "How is my career growth and financial stability in the coming months?"
                      : "ನನ್ನ ವೃತ್ತಿಜೀವನದ ಮುಂಬರುವ ಬೆಳವಣಿಗೆ ಹಾಗೂ ಆರ್ಥಿಕ ಸ್ಥಿತಿ ಹೇಗಿದೆ?"
                  )
                }
                className="whitespace-nowrap bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-full shadow-2xs font-medium transition"
              >
                💼 ವೃತ್ತಿ & ಧನಾಗಮನ
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    session.language === "en"
                      ? "What does my chart indicate about marriage, family harmony, and relationships?"
                      : "ನನ್ನ ವಿವಾಹ ಹಾಗೂ ಕೌಟುಂಬಿಕ ಶಾಂತಿಯ ಬಗ್ಗೆ ಜಾತಕವೇನು ಹೇಳುತ್ತದೆ?"
                  )
                }
                className="whitespace-nowrap bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-full shadow-2xs font-medium transition"
              >
                💍 ವಿವಾಹ & ಸಂಬಂಧ
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    session.language === "en"
                      ? "Which sacred pooja or parihara at Gokarna is recommended for my current Dasha?"
                      : "ನನ್ನ ಪ್ರಸ್ತುತ ದಶಾ ಶಾಂತಿಗಾಗಿ ಗೋಕರ್ಣದ ಯಾವ ಪೂಜೆ ಅಥವಾ ಪರಿಹಾರ ಶ್ರೇಷ್ಠ?"
                  )
                }
                className="whitespace-nowrap bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-full shadow-2xs font-medium transition"
              >
                🕉️ ಗೋಕರ್ಣ ಪರಿಹಾರ
              </button>
            </div>
          )}

          {/* Active Speaking Banner */}
          {isListening && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                {currentLangMeta.speakingIndicator}
              </span>
              <span className="font-mono font-bold text-red-950">⏱️ {speechTimerText}</span>
            </div>
          )}

          {/* Locked Expired Ribbon or Active Input Bar */}
          {isExpired ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center space-y-2">
              <p className="text-xs font-bold text-red-900">
                ⌛ {currentI18n.sessionEndedTitle}
              </p>
              <p className="text-[11px] text-stone-700">
                {currentI18n.sessionEndedMsg}
              </p>
              <a
                href={DEFAULT_PRIEST_CONTACT.callUri}
                className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition"
              >
                📞 {currentI18n.callPriestBtn}
              </a>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              {/* Text Input Container */}
              <div className="flex-1 bg-white border-2 border-amber-400 rounded-2xl p-2 shadow-inner focus-within:border-amber-600 transition flex items-center gap-2">
                <textarea
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder={currentLangMeta.inputPlaceholder}
                  className="flex-1 bg-transparent text-sm text-stone-900 focus:outline-hidden resize-none max-h-28 font-sans"
                />

                {/* Mic Button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2 rounded-xl transition ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-md"
                      : "text-amber-700 hover:bg-amber-100 active:scale-90"
                  }`}
                  title="ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ (3-4 ನಿಮಿಷ ಮಾತನಾಡಬಹುದು)"
                >
                  <span className="text-lg">🎙️</span>
                </button>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isGenerating || !inputText.trim()}
                className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold p-3 rounded-2xl shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
                title="ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ"
              >
                <span className="text-base">➤</span>
              </button>
            </div>
          )}
        </div>
      </footer>
        </>
      )}

      {/* -------------------------------------------------------------
          STEP 1: Devotee Contact Collection Modal
          (Shown ONCE before starting timer; Mobile OR Email is required)
          ------------------------------------------------------------- */}
      {showContactModal && session.status === "pending" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF6EE] border-3 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white text-2xl flex items-center justify-center shadow-md border-2 border-amber-200">
                📱
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-950 pt-2">
                {currentI18n.contactModalTitle}
              </h3>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                {currentI18n.contactModalSubtitle}
              </p>
            </div>

            {contactError && (
              <div className="bg-red-100 border border-red-300 text-red-800 text-xs p-2.5 rounded-xl font-medium">
                ⚠️ {contactError}
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  {currentI18n.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={currentI18n.phonePlaceholder}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  {currentI18n.emailLabel}
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={currentI18n.emailPlaceholder}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <p className="text-[11px] text-stone-500 italic">
                {currentI18n.contactNote}
              </p>

              <button
                type="submit"
                disabled={savingContact}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition active:scale-98 flex items-center justify-center gap-2"
              >
                {savingContact ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <span>{currentI18n.submitContactBtn}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          STEP 2: 20-Minute Timer Confirmation Modal
          (Shown in selected language once contact details are provided)
          ------------------------------------------------------------- */}
      {showTimerModal && session.status === "pending" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF6EE] border-3 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white text-2xl flex items-center justify-center shadow-md border-2 border-amber-200">
                ⏳
              </div>
              <h3 className="text-xl font-bold font-serif text-amber-950 pt-2">
                {currentI18n.timerModalTitle}
              </h3>
              <p className="text-xs font-semibold text-amber-800">
                {session.durationMinutes} Minutes Accurate Consultation
              </p>
            </div>

            {/* Profile summary in modal */}
            <div className="bg-white border border-amber-300 rounded-2xl p-3.5 text-xs text-stone-800 space-y-1.5 shadow-2xs">
              <div className="flex justify-between border-b border-amber-100 pb-1">
                <span className="text-stone-500 font-medium">ಭಕ್ತರ ಹೆಸರು (Name):</span>
                <span className="font-bold text-amber-950">{session.name}</span>
              </div>
              <div className="flex justify-between border-b border-amber-100 pb-1">
                <span className="text-stone-500 font-medium">ಜನ್ಮ ವಿವರಗಳು:</span>
                <span className="font-bold text-amber-950">
                  {session.dob} at {session.tob} ({session.place})
                </span>
              </div>
              {(session.userPhone || session.userEmail) && (
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-stone-500 font-medium">ಸಂಪರ್ಕ:</span>
                  <span className="font-bold text-amber-950">
                    {session.userPhone || session.userEmail}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">ಭಾಷೆ (Language):</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-sm">
                  {currentLangMeta.nativeName} ({currentLangMeta.englishName})
                </span>
              </div>
            </div>

            {/* Strict Notice from Audio Instructions */}
            <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-900">
                ⚠️ {currentI18n.timerModalWarning}
              </p>
              <p className="text-stone-700">
                {currentI18n.timerModalStrictCondition}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleStartTimer}
                disabled={startingTimer}
                className="w-full bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition active:scale-98 flex items-center justify-center gap-2"
              >
                {startingTimer ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>{currentI18n.startTimerBtn}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowTimerModal(false)}
                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                ನಂತರ ಪ್ರಾರಂಭಿಸಿ (Review Later)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5-Star Rating & Feedback Modal (Shown once upon session expiry or user trigger)
          ------------------------------------------------------------- */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-[#FAF6EE] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl relative space-y-4 text-center">
            {/* Close / Dismiss 'X' button */}
            <button
              onClick={handleDismissRatingReview}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg font-bold w-8 h-8 rounded-full bg-white/80 border border-amber-200 flex items-center justify-center transition"
              title={currentI18n.skipRatingBtn}
            >
              ✕
            </button>

            {/* Emblem & Title */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-3xl shadow-md border border-amber-300">
              🌟
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-amber-950">
                {currentI18n.ratingModalTitle}
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed px-2">
                {currentI18n.ratingModalSubtitle}
              </p>
            </div>

            {/* Interactive 5 Golden Stars */}
            <div className="bg-white border border-amber-300/80 rounded-2xl p-4 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-amber-950 block">
                {currentI18n.ratingStarsLabel}
              </span>
              <div className="flex items-center justify-center gap-2 text-3xl select-none">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverStars || selectedStars) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverStars(star)}
                      onMouseLeave={() => setHoverStars(0)}
                      onClick={() => setSelectedStars(star)}
                      className="transition-transform active:scale-125 hover:scale-110 focus:outline-hidden"
                    >
                      <span
                        className={
                          isFilled
                            ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                            : "text-stone-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-amber-800 block">
                {selectedStars === 5
                  ? "⭐⭐⭐⭐⭐ ಅತ್ಯುತ್ತಮ (5/5 Excellent)"
                  : selectedStars === 4
                  ? "⭐⭐⭐⭐ ಬಹಳ ಒಳ್ಳೆಯದು (4/5 Very Good)"
                  : selectedStars === 3
                  ? "⭐⭐⭐ ತೃಪ್ತಿಕರ (3/5 Good)"
                  : selectedStars === 2
                  ? "⭐⭐ ಸುಧಾರಣೆ ಅಗತ್ಯ (2/5 Fair)"
                  : "⭐ ಅತೃಪ್ತಿ (1/5 Needs Attention)"}
              </span>
            </div>

            {/* Optional Comment Feedback */}
            <div className="text-left space-y-1">
              <label className="text-xs font-bold text-amber-950">
                {currentI18n.ratingCommentLabel}
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={currentI18n.ratingCommentPlaceholder}
                rows={3}
                className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-inner"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSubmitRatingReview}
                disabled={isSubmittingRating}
                className="w-full bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl shadow-md text-sm transition active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmittingRating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>{currentI18n.submitRatingBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismissRatingReview}
                className="w-full bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                {currentI18n.skipRatingBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Burger Navigation Drawer */}
      {isMasterOrSuperAdmin && (
        <CategorizedNavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          role={role}
          isMasterOrSuperAdmin={isMasterOrSuperAdmin}
          language="kn"
          currentUser={currentUser}
          priestName={wallet?.priestName || DEFAULT_PRIEST_CONTACT.name}
          hasPanchanga={true}
          hasSankhya={true}
          hasDiksuchi={true}
          hasPurvaJanma={true}
          hasPublicKundli={true}
        />
      )}
    </div>
  );
};

export default ConsultationChatPage;
