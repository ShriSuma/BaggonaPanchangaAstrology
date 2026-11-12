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

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../../services/firebase";
import {
  getConsultationSession,
  createConsultationSession,
  encodeSecureConsultationToken,
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
  CONSULTATION_MODAL_I18N,
  CONSULTATION_CHAT_UI_I18N,
  getLocalizedQuickFaqChips,
  getInitialPriestGreeting
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
import { SacredKalaChakraClock, MiniSandGlassTimer } from "./SacredKalaChakraClock";
import {
  ContinuousSpeechEngine,
  LANGUAGE_SPEECH_LOCALES,
  sanitizeDuplicateSpeechWords,
  refineSpokenConsultationQuestion
} from "./consultationSpeechService";
import {
  synthesizeAndPlayClonedVoice,
  stopClonedAudio
} from "../audio/aiVoiceCloneEngine";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../auth/authStore";
import { useWalletStore } from "../wallet/walletStore";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";

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
  const activeKundliSession = useKundliViewerStore((s) => s.session);
  const [isLaunchingKundliLive, setIsLaunchingKundliLive] = useState(false);
  const [noTokenProvided, setNoTokenProvided] = useState(false);

  // Direct 1-Click Launch with Generated Kundli Session
  const handleLaunchKundliLiveSession = async () => {
    if (!activeKundliSession?.input) return;
    setIsLaunchingKundliLive(true);
    try {
      const inp = activeKundliSession.input;
      const devoteeName = inp.name || "Devotee";
      const s = await createConsultationSession({
        name: devoteeName,
        dob: activeKundliSession.birthDateYmd || inp.birthDate || "1995-05-15",
        tob: activeKundliSession.birthTimeHm || inp.birthTime || "10:30",
        place: activeKundliSession.homePlaceName || activeKundliSession.placeLabel || "Gokarna",
        lat: typeof inp.latitude === "number" && inp.latitude !== 0 ? inp.latitude : 14.5479,
        lng: typeof inp.longitude === "number" && inp.longitude !== 0 ? inp.longitude : 74.3188,
        timezone: 5.5,
        language: "kn"
      });
      const token = encodeSecureConsultationToken(s.id);
      window.location.replace(`/consultation?token=${encodeURIComponent(token)}`);
    } catch (err) {
      console.error("Failed to launch kundli live session:", err);
      handleGoToGenerator();
    } finally {
      setIsLaunchingKundliLive(false);
    }
  };

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
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const sessionRef = useRef<ConsultationSession | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      // Dynamically expand between 38px and 128px
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 38), 128)}px`;
    }
  }, []);

  const handleCopyMessage = useCallback((messageId: string, text: string) => {
    const copyToClipboard = async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Robust fallback for mobile devices & insecure contexts
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand("copy");
          textArea.remove();
        }
        setCopiedMessageId(messageId);
        setTimeout(() => {
          setCopiedMessageId((prev) => (prev === messageId ? null : prev));
        }, 2000);
      } catch (err) {
        console.error("Failed to copy consultation message:", err);
      }
    };
    void copyToClipboard();
  }, []);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechTimerText, setSpeechTimerText] = useState("00:00");
  const [isReviewingQuestion, setIsReviewingQuestion] = useState(false);
  const isReviewingRef = useRef(false);
  const speechEngineRef = useRef<ContinuousSpeechEngine | null>(null);

  // Dedicated Voice Recording Mode & Mobile Keyboard State
  const [isVoiceRecordMode, setIsVoiceRecordMode] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showTimerDetailsModal, setShowTimerDetailsModal] = useState(false);

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

  // Compute Devotee Age & Intelligent Age-Adaptive FAQ Chips
  const devoteeAgeYears = useMemo(() => {
    if (!session?.dob) return 30;
    try {
      const [y, m, d] = session.dob.split("-").map(Number);
      const birthDate = new Date(y, (m || 1) - 1, d || 1);
      const now = new Date();
      const diffMs = now.getTime() - birthDate.getTime();
      return Math.max(1, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
    } catch {
      return 30;
    }
  }, [session?.dob]);

  const isMinorChildDevotee = devoteeAgeYears < 18;

  const currentLang = session?.language || "kn";
  const rawFaqChips = useMemo(() => {
    return getLocalizedQuickFaqChips(currentLang, devoteeAgeYears);
  }, [currentLang, devoteeAgeYears]);

  // Dynamically filter out chips that have already been asked by the user in this session,
  // preventing repeated questions and dock clutter
  const askedQuestionsSet = useMemo(() => {
    return new Set(
      messages
        .filter((m) => m.sender === "user")
        .map((m) => m.text.trim().toLowerCase())
    );
  }, [messages]);

  const quickFaqChips = useMemo(() => {
    return rawFaqChips.filter((chip) => {
      const qLower = chip.question.trim().toLowerCase();
      for (const asked of askedQuestionsSet) {
        if (asked.includes(qLower) || qLower.includes(asked)) {
          return false;
        }
      }
      return true;
    });
  }, [rawFaqChips, askedQuestionsSet]);

  // Track first occurrence of each unique dosha so that duplicate dosha cards
  // are never stacked repeatedly across consecutive user questions
  const isDoshaCardFirstOccurrence = useMemo(() => {
    const seen = new Set<string>();
    const map: Record<string, boolean> = {};
    for (const m of messages) {
      if (m.activeDoshaCard?.doshaId) {
        if (!seen.has(m.activeDoshaCard.doshaId)) {
          seen.add(m.activeDoshaCard.doshaId);
          map[m.id] = true;
        } else {
          map[m.id] = false;
        }
      } else if (m.activeDoshaCard) {
        const nameKey = m.activeDoshaCard.doshaName || "general_dosha";
        if (!seen.has(nameKey)) {
          seen.add(nameKey);
          map[m.id] = true;
        } else {
          map[m.id] = false;
        }
      }
    }
    return map;
  }, [messages]);
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

      // Devotee Daily Darshana token detection: If someone opens /consultation with a Daily Darshana token, redirect immediately to /daily
      const hasDailyDarshanaToken = candidateTokens.some(
        (t) => t.startsWith("bgn_v1_") || t.startsWith("bgn_dob_") || t.startsWith("bgn_tk_")
      );
      if (hasDailyDarshanaToken) {
        if (typeof window !== "undefined") {
          window.location.replace(`/daily${window.location.search}`);
        }
        return;
      }

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
          setResolvedId(activeSessionId);
          setSession(data);
          sessionRef.current = data;
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
            // Clean initial landing: Do NOT show modal on initial load.
            // Devotee views their sacred Panchanga Patrika Card and clicks "Start Consultation".
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
              setRemainingSeconds(0);
              void expireConsultationSession(data.id);
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

  // Synchronize fresh database session across all devices/browsers
  const applyFreshSessionState = useCallback((fresh: ConsultationSession) => {
    setSession(fresh);
    sessionRef.current = fresh;
    setMessages((prev) => {
      if (fresh.messages && fresh.messages.length > prev.length) {
        return fresh.messages;
      }
      return prev;
    });
    if (fresh.userPhone) setContactPhone(fresh.userPhone);
    if (fresh.userEmail) setContactEmail(fresh.userEmail);

    if (fresh.status === "pending") {
      // CRITICAL FIX: Do NOT forcibly close showContactModal here!
      // The devotee may have clicked "Start Consultation" and is actively typing their phone number.
      setShowTimerModal(false);
      setRemainingSeconds((fresh.durationMinutes || 20) * 60);
    } else if (fresh.status === "active" && fresh.expiresAt) {
      setShowContactModal(false);
      setShowTimerModal(false);
      const left = Math.max(0, Math.floor((new Date(fresh.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left <= 0) {
        setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
        setRemainingSeconds(0);
        void expireConsultationSession(fresh.id);
      }
    } else if (fresh.status === "expired") {
      setShowContactModal(false);
      setShowTimerModal(false);
      setRemainingSeconds(0);
    }
  }, []);

  // 2. Active Real-Time Firestore Sync & Accurate Multi-Device Countdown Loop
  useEffect(() => {
    if (!resolvedId) return;

    let isSubscribed = true;
    let unsubscribeSnapshot: (() => void) | null = null;

    // Attach real-time Firestore listener for 0-second multi-device sync
    if (firestore) {
      try {
        const docRef = doc(firestore, "consultation_sessions", resolvedId);
        unsubscribeSnapshot = onSnapshot(
          docRef,
          (snap) => {
            if (!isSubscribed) return;
            if (snap.exists()) {
              const fresh = snap.data() as ConsultationSession;
              applyFreshSessionState(fresh);
            }
          },
          (err) => {
            console.warn("[ConsultationChatPage] onSnapshot notice:", err);
          }
        );
      } catch (err) {
        console.warn("[ConsultationChatPage] onSnapshot attach notice:", err);
      }
    }

    // 1-second local tick directly checking current session expiresAt
    const tickInterval = setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.status !== "active" || !current.expiresAt) return;

      const now = Date.now();
      const exp = new Date(current.expiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((exp - now) / 1000));

      setRemainingSeconds(diffSecs);

      // Show bonus banner if remaining <= 60s and bonus not yet claimed
      if (diffSecs > 0 && diffSecs <= 60 && !current.bonusMinuteClaimed) {
        setShowBonusBanner(true);
      } else {
        setShowBonusBanner(false);
      }

      if (diffSecs <= 0) {
        setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
        setRemainingSeconds(0);
        void expireConsultationSession(current.id);
      }
    }, 1000);

    // Periodic 3-second database sync to guarantee cross-browser parity if onSnapshot is unavailable
    const syncInterval = setInterval(async () => {
      try {
        const fresh = await getConsultationSession(resolvedId);
        if (fresh && isSubscribed) {
          applyFreshSessionState(fresh);
        }
      } catch {
        // Ignore background sync errors
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [resolvedId, applyFreshSessionState]);

  // 3. Initialize Welcome Message
  useEffect(() => {
    let isCancelled = false;

    async function initWelcome() {
      // ONLY initialize welcome when session is active and messages is empty
      if (session && session.status === "active" && messages.length === 0) {
        if (isCancelled) return;

        const welcomeText = getInitialPriestGreeting(session.language, session.name);
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

  // Handle Step 1: Submit Devotee Contact (Mobile number is mandatory; Email is optional)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setContactError(null);

    const phoneTrim = contactPhone.trim();
    const emailTrim = contactEmail.trim();

    // Mobile number is strictly mandatory
    if (!phoneTrim) {
      setContactError(currentI18n.phoneMandatoryError || currentI18n.phoneError);
      return;
    }

    // Validate 10-digit mobile number
    if (!isValidPhoneNumber(phoneTrim)) {
      setContactError(currentI18n.phoneError);
      return;
    }

    // Email is optional, but if entered it must be valid
    if (emailTrim && !isValidEmailAddress(emailTrim)) {
      setContactError(currentI18n.emailError);
      return;
    }

    setSavingContact(true);
    try {
      const updated = await updateDevoteeContact(session.id, {
        phone: phoneTrim,
        email: emailTrim || undefined
      });
      setContactPhone(phoneTrim);
      if (emailTrim) setContactEmail(emailTrim);
      setShowContactModal(false);

      // Start the 20-minute consultation timer immediately in Firestore
      const started = await startConsultationTimer(updated.id);
      setSession(started);
      sessionRef.current = started;
      setMessages(started.messages || []);
      const left = started.expiresAt
        ? Math.max(0, Math.floor((new Date(started.expiresAt).getTime() - Date.now()) / 1000))
        : 1200;
      setRemainingSeconds(left);
      setShowTimerModal(false);
    } catch (err: any) {
      setContactError("Failed to save contact: " + (err.message || String(err)));
    } finally {
      setSavingContact(false);
    }
  };

  // Handle Step 2: Start 20-Minute Timer
  const handleStartTimer = async () => {
    if (!session) return;
    const phoneTrim = (contactPhone || session.userPhone || "").trim();
    if (!phoneTrim || !isValidPhoneNumber(phoneTrim)) {
      setShowTimerModal(false);
      setShowContactModal(true);
      return;
    }
    setStartingTimer(true);
    try {
      const updated = await startConsultationTimer(session.id);
      setSession(updated);
      sessionRef.current = updated;
      setMessages(updated.messages || []);
      setShowTimerModal(false);
      const left = updated.expiresAt
        ? Math.max(0, Math.floor((new Date(updated.expiresAt).getTime() - Date.now()) / 1000))
        : 1200;
      setRemainingSeconds(left);
    } catch (err: any) {
      alert("Failed to start consultation timer: " + (err.message || String(err)));
    } finally {
      setStartingTimer(false);
    }
  };

  // Handle Sacred Landing Patrika Start Action
  const handleStartConsultationFromCard = async () => {
    if (!session || startingTimer) return;
    const phoneTrim = (contactPhone || session.userPhone || "").trim();
    const emailTrim = (contactEmail || session.userEmail || "").trim();

    const hasValidPhone = Boolean(phoneTrim && isValidPhoneNumber(phoneTrim));

    // Mobile number is strictly mandatory. If missing or invalid, prompt devotee via pop-up modal
    if (!hasValidPhone) {
      setContactError(null);
      setShowContactModal(true);
      return;
    }

    const hasValidEmail = Boolean(emailTrim && isValidEmailAddress(emailTrim));

    setStartingTimer(true);
    try {
      let currentSession = session;
      if (!session.hasProvidedContact || session.userPhone !== phoneTrim || (hasValidEmail && session.userEmail !== emailTrim)) {
        currentSession = await updateDevoteeContact(session.id, {
          phone: phoneTrim,
          email: hasValidEmail ? emailTrim : undefined
        });
      }
      const updated = await startConsultationTimer(currentSession.id);
      setSession(updated);
      sessionRef.current = updated;
      setMessages(updated.messages || []);
      const left = updated.expiresAt
        ? Math.max(0, Math.floor((new Date(updated.expiresAt).getTime() - Date.now()) / 1000))
        : 1200;
      setRemainingSeconds(left);
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

  // Fast 2-3s AI Question Review Trigger (Debounced with lock to prevent race duplicates)
  const triggerAiQuestionReview = async (questionText: string) => {
    if (!questionText || questionText.trim().length < 4 || !session || isReviewingRef.current) return;
    isReviewingRef.current = true;
    setIsReviewingQuestion(true);
    try {
      const refined = await refineSpokenConsultationQuestion({
        spokenQuestion: questionText,
        language: session.language
      });
      if (refined && refined.trim()) {
        const cleanRefined = sanitizeDuplicateSpeechWords(refined).trim();
        setInputText(cleanRefined);
        if (textareaRef.current) {
          setTimeout(adjustTextareaHeight, 50);
        }
      }
    } catch (e) {
      console.warn("[ConsultationChatPage] Question refinement notice:", e);
    } finally {
      isReviewingRef.current = false;
      setIsReviewingQuestion(false);
    }
  };

  // Handle Dedicated Voice Recording Studio Mode
  const handleStartVoiceRecording = () => {
    if (!session || session.status === "expired" || isReviewingQuestion) return;
    setIsVoiceRecordMode(true);
    setInputText("");

    if (!speechEngineRef.current) {
      speechEngineRef.current = new ContinuousSpeechEngine(session.language);
    } else {
      speechEngineRef.current.setLanguage(session.language);
    }

    // Stop any active audio narration / TTS immediately so speaker audio does not bleed into the mic
    stopClonedAudio();
    if (activeVoiceCancelRef.current) {
      activeVoiceCancelRef.current();
      activeVoiceCancelRef.current = null;
    }
    setSpeakingMessageId(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const started = speechEngineRef.current.start("", {
      onTranscriptUpdate: (fullText) => {
        setInputText(fullText);
      },
      onTimeTick: (_secs, formatted) => {
        setSpeechTimerText(formatted);
      },
      onError: (err) => {
        alert(err);
        setIsListening(false);
        setIsVoiceRecordMode(false);
      },
      onStateChange: (active) => {
        setIsListening(active);
      }
    });

    if (started) {
      setIsListening(true);
    }
  };

  const handleCancelVoiceRecording = () => {
    if (speechEngineRef.current) {
      speechEngineRef.current.stop();
    }
    setIsListening(false);
    setIsVoiceRecordMode(false);
    setInputText("");
  };

  const handleSendRecordedVoiceQuestion = async () => {
    if (isSubmittingRef.current || isGenerating) return;
    let rawText = "";
    if (speechEngineRef.current) {
      rawText = speechEngineRef.current.stop();
    }
    setIsListening(false);
    setIsVoiceRecordMode(false);

    const questionToProcess = sanitizeDuplicateSpeechWords(rawText || inputText).trim();
    setInputText("");
    if (!questionToProcess) return;

    // Trigger fast 1.5s AI Question Refinement
    setIsReviewingQuestion(true);
    let finalQuestion = questionToProcess;
    try {
      const refined = await refineSpokenConsultationQuestion({
        spokenQuestion: questionToProcess,
        language: session?.language || "kn"
      });
      if (refined && refined.trim()) {
        finalQuestion = sanitizeDuplicateSpeechWords(refined).trim();
      }
    } catch {
      finalQuestion = questionToProcess;
    } finally {
      setIsReviewingQuestion(false);
    }

    if (finalQuestion) {
      void handleSendMessage(finalQuestion);
    }
  };

  // Handle Speech Recognition (Continuous 3-4 minutes)
  const toggleSpeechRecognition = () => {
    if (!session || session.status === "expired" || isReviewingQuestion) return;

    if (isListening) {
      let rawText = "";
      if (speechEngineRef.current) {
        rawText = speechEngineRef.current.stop();
      }
      setIsListening(false);
      const clean = sanitizeDuplicateSpeechWords(rawText || inputText).trim();
      if (clean) {
        setInputText(clean);
        void triggerAiQuestionReview(clean);
      }
      return;
    }

    handleStartVoiceRecording();
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend?: string) => {
    if (isSubmittingRef.current || isGenerating) return;
    const rawQuestion = (textToSend || inputText).trim();
    const question = sanitizeDuplicateSpeechWords(rawQuestion).trim();
    if (!question || !session || session.status !== "active" || remainingSeconds <= 0) return;

    // Check expiry
    if (remainingSeconds <= 0) {
      setSession((prev) => (prev ? { ...prev, status: "expired" } : null));
      return;
    }

    isSubmittingRef.current = true;

    // Automatically stop any playing audio immediately so the new question proceeds with zero manual friction
    stopClonedAudio();
    if (activeVoiceCancelRef.current) {
      activeVoiceCancelRef.current();
      activeVoiceCancelRef.current = null;
    }
    setSpeakingMessageId(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceRecordMode(false);

    if (isListening && speechEngineRef.current) {
      speechEngineRef.current.stop();
      setIsListening(false);
    }

    setInputText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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
      // Calculate whether this is a subsequent follow-up question
      const previousUserMsgs = messages.filter((m) => m.sender === "user");
      const isSubsequentQuestion = previousUserMsgs.length > 0;
      const questionIndex = previousUserMsgs.length;

      // Preserve rich PRIOR conversation history across the 20-minute session
      // so previous rulings, gemstone advice, and prohibitions are never forgotten or contradicted.
      const chatTurns = messages.map((m) => {
        if (m.sender === "user") {
          return { role: "user" as const, text: m.text.trim() };
        }
        // Retain generous content up to 1500 characters so specific gemstone/remedy reasons remain intact
        const snippet = m.text.length > 1500 ? `${m.text.slice(0, 1500)}...` : m.text;
        return {
          role: "model" as const,
          text: snippet.trim()
        };
      });

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
        conversationHistory: chatTurns.slice(-20),
        apiKey: effectiveKey,
        isSubsequentQuestion,
        questionIndex
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
      const errText =
        currentLang === "en"
          ? `Namaste ${session.name}. We are analyzing your horoscope and planetary Dasha periods. Please ask your question again, or directly call our head priest at Gokarna: 9972339362.`
          : currentLang === "hi"
          ? `नमस्ते ${session.name} जी। आपकी जन्मकुंडली और वर्तमान दशा का विश्लेषण किया जा रहा है। कृपया अपना प्रश्न पुनः पूछें या सीधे श्री क्षेत्र गोकर्ण के मुख्य पुरोहित से संपर्क करें: 9972339362.`
          : currentLang === "te"
          ? `నమస్కారం ${session.name} గారు. మీ ಜಾತಕ లగ్నం మరియు దశా భుక్తుల పరిశీలన జరుగుతోంది. ದಯచేసి ಮళ్లీ ప్రశ్నించండి లేదా నేరుగా ಗೋಕರ್ಣ ಪಂಡಿతులను ಸಂಪ್ರದించండి: 9972339362.`
          : currentLang === "ta"
          ? `வணக்கம் ${session.name}. உங்கள் ஜாதக தசைகள் கணிக்கப்படுகின்றன. தயவுசெய்து மீண்டும் கேளுங்கள் அல்லது நேரடியாக கோகர்ணா பண்டிதரை தொடர்பு கொள்ளவும்: 9972339362.`
          : currentLang === "ml"
          ? `നമസ്കാരം ${session.name}. നിങ്ങളുടെ ജാതക ദശാ വിശകലനം നടക്കുന്നു. ദയവായി വീണ്ടും ചോദിക്കുക അല്ലെങ്കിൽ നേരിട്ട് ഗോകർണ പുരോഹിതനെ വിളിക്കുക: 9972339362.`
          : currentLang === "mr"
          ? `नमस्कार ${session.name} जी. आपल्या पत्रिकेचे विश्लेषण सुरू आहे. कृपया पुन्हा विचारा किंवा थेट गोकर्ण येथील पुरोहितांशी संपर्क साधा: 9972339362.`
          : `ನಮಸ್ಕಾರ ${session.name} ಅವರೇ. ನಿಮ್ಮ ಜಾತಕದ ಲಗ್ನ ಮತ್ತು ದಶಾ-ಭುಕ್ತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಶ್ನಿಸಿ ಅಥವಾ ನೇರವಾಗಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣದ ಪಂಡಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ: 9972339362.`;

      const fallbackMsg: ConsultationChatMessage = {
        id: `astro_err_${Date.now()}`,
        sender: "astrologer",
        text: errText,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      void addConsultationMessage(session.id, fallbackMsg);
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
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

  // Current Language Meta & Chat UI i18n
  const currentLangMeta =
    CONSULTATION_LANGUAGES.find((l) => l.code === currentLang) || CONSULTATION_LANGUAGES[0];
  const currentI18n = CONSULTATION_MODAL_I18N[currentLang] || CONSULTATION_MODAL_I18N.kn;
  const currentChatUi = CONSULTATION_CHAT_UI_I18N[currentLang] || CONSULTATION_CHAT_UI_I18N.kn;

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

            {/* Active Kundli 1-Click Launch Card (Restricted strictly to authenticated Super Admin to prevent data leakage) */}
            {noTokenProvided && isMasterOrSuperAdmin && activeKundliSession?.input && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl p-4 text-left space-y-2.5 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950 font-serif">
                    ಸಕ್ರಿಯ ಜನನ ಕುಂಡಲಿ ಲಭ್ಯವಿದೆ (Active Kundali Available)
                  </h3>
                </div>
                <p className="text-xs text-amber-900 leading-snug">
                  ಭಕ್ತರ ಹೆಸರು: <strong>{activeKundliSession.input.name || "Devotee"}</strong><br />
                  ಜನನ ವಿವರ: {activeKundliSession.birthDateYmd || activeKundliSession.input.birthDate} {activeKundliSession.birthTimeHm || activeKundliSession.input.birthTime} ({activeKundliSession.homePlaceName || activeKundliSession.placeLabel || "Gokarna"})
                </p>
                <button
                  type="button"
                  disabled={isLaunchingKundliLive}
                  onClick={handleLaunchKundliLiveSession}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {isLaunchingKundliLive ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...</span>
                    </>
                  ) : (
                    <>
                      <span>💬</span>
                      <span>ಈ ಜಾತಕದೊಂದಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ ಆರಂಭಿಸಿ (Start 20-Min Live Chat)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Super Admin Control Options */}
            {isMasterOrSuperAdmin && (
              <div className="bg-amber-50 border-2 border-amber-400/80 rounded-2xl p-3.5 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>👑</span> ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ (Super Admin Controls):
                  </span>
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
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#FAF6EE] text-stone-900 flex flex-col items-center justify-between font-sans selection:bg-amber-200 selection:text-amber-950 overflow-hidden">
      {/* -------------------------------------------------------------
          Header Bar: Unified Mobile-First Header with Compact Sandglass Timer
          ------------------------------------------------------------- */}
      <header className="w-full bg-[#FAF6EE] border-b-2 border-amber-300/80 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-3 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* LEFT: Branding & Emblem */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center font-serif text-sm sm:text-base font-bold shadow-xs border border-amber-300 shrink-0">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="font-serif font-black text-amber-950 text-xs sm:text-base leading-tight tracking-tight">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-sm border border-amber-300">
                  {currentChatUi.gokarnaTown || "ಗೋಕರ್ಣ"}
                </span>
              </div>
              <p className="hidden sm:block text-[10px] sm:text-[11px] text-amber-800 font-medium">
                {currentChatUi.headerSubtitle || "ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ದೈವಜ್ಞ ಮುಖಾಮುಖಿ ಸಮಾಲೋಚನೆ"}
              </p>
            </div>
          </div>

          {/* RIGHT: Compact Sandglass Clock & Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 20-Minute Timer Badge (Pending: 20:00, Active: countdown, Last 1 min: flashing red) */}
            {session.status === "pending" ? (
              <div
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-xl border border-amber-400/80 bg-[#2A1808] text-amber-100 text-xs font-mono font-bold select-none shadow-2xs"
                title="20 Minutes Allocated Consultation (೨೦ ನಿಮಿಷಗಳ ಸಮಾಲೋಚನೆ)"
              >
                <span className="text-xs sm:text-sm">⏱️</span>
                <span className="text-xs sm:text-sm tracking-tight text-amber-50 font-black">
                  20:00
                </span>
                <span className="hidden sm:inline text-[10px] text-amber-300/80 font-sans">
                  (20 min)
                </span>
              </div>
            ) : session.status === "active" && !isExpired ? (
              <div
                onClick={() => setShowTimerDetailsModal(true)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl border text-xs font-mono font-bold cursor-pointer active:scale-95 transition shadow-2xs select-none ${
                  remainingSeconds <= 60
                    ? "bg-red-950 text-red-100 border-2 border-red-500 animate-pulse shadow-lg shadow-red-900/60"
                    : remainingSeconds < 300
                    ? "bg-amber-950 text-amber-200 border-amber-500"
                    : "bg-[#2A1808] text-amber-100 border-amber-400"
                }`}
                title={remainingSeconds <= 60 ? "🚨 Last 1 Minute Alert! Tap for Kala Chakra Details" : "Tap to see Kala Chakra 4-Pada Timeline Details"}
              >
                {remainingSeconds <= 60 ? (
                  <span className="text-xs sm:text-sm animate-bounce">🚨</span>
                ) : (
                  <MiniSandGlassTimer
                    remainingSeconds={remainingSeconds}
                    totalDurationSeconds={totalDurationSeconds}
                    isUrgent={remainingSeconds < 120}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                )}
                <span className={`text-xs sm:text-sm tracking-tight font-black ${remainingSeconds <= 60 ? "text-red-100" : "text-amber-50"}`}>
                  {formatTimer(remainingSeconds)}
                </span>
                <span className={`text-[10px] font-sans font-bold ${remainingSeconds <= 60 ? "text-red-200" : "text-amber-300/80"}`}>
                  ({remainingSeconds}s)
                </span>
                <span className="text-[10px] text-amber-400 opacity-80">
                  ▾
                </span>
              </div>
            ) : (session.status === "expired" || isExpired) ? (
              <div
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl border text-xs font-mono font-bold bg-red-950 text-red-200 border-red-500 select-none shadow-xs"
                title="Consultation Session Expired (20 Minutes Completed)"
              >
                <span className="text-xs">⏱️</span>
                <span className="text-xs sm:text-sm tracking-tight text-red-100 font-black">
                  00:00 (Expired)
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowRatingModal(true)}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] sm:text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1 shadow-2xs transition"
              title={currentI18n.ratingModalTitle}
            >
              <span>⭐</span>
              <span className="hidden sm:inline">{currentI18n.ratingTriggerBtn}</span>
            </button>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] sm:text-xs px-2 py-1 rounded-lg font-bold">
              {currentLangMeta.nativeName}
            </span>
          </div>
        </div>

        {/* 5-Star Rating Success Toast */}
        {ratingToast && (
          <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 px-4 py-1.5 border-b border-amber-300 flex items-center justify-between text-xs font-serif font-bold shadow-md animate-fadeIn">
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
      </header>

      {/* -------------------------------------------------------------
          Devotee Profile & Sacred Panchanga Patrika Card Switch
          - When session is "pending": Render the sacred landing Panchanga Card (First Screen)
          - When session is "active" or "expired": Render collapsible banner + conversation thread
          ------------------------------------------------------------- */}
      {session.status === "pending" ? (
        <>
          <div className="w-full max-w-2xl px-3 py-4 flex-1 flex flex-col justify-start overflow-y-auto overscroll-contain pb-28">
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
                <p className="font-bold text-sm">{currentChatUi.patrikaLoading}</p>
              </div>
            )}
          </div>

          {/* Sticky Mobile Floating Action Bar: Always 100% visible on mobile without scrolling */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6EE]/95 border-t-2 border-amber-400 p-3 shadow-2xl backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => void handleStartConsultationFromCard()}
              disabled={startingTimer}
              className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-serif font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-xl border border-amber-300 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="text-lg">🪔</span>
              <span>{startingTimer ? (currentChatUi.startingSession || "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...") : (panchangaProfile?.labels?.startConsultationBtn || currentI18n.startTimerBtn || "ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ (Start 20-Min)")}</span>
              <span>➔</span>
            </button>
          </div>
        </>
      ) : (session.status === "expired" || isExpired) ? (
        <div className="w-full max-w-lg mx-auto flex-1 px-4 py-8 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-400 text-amber-950 flex items-center justify-center text-4xl shadow-lg">
            ⏳
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-black text-xl sm:text-2xl text-amber-950 tracking-tight">
              {currentI18n.sessionEndedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans max-w-md mx-auto">
              {currentI18n.sessionEndedMsg}
            </p>
          </div>
          <div className="w-full bg-white/90 border-2 border-amber-300 rounded-2xl p-4 shadow-xs text-xs text-amber-950 space-y-1.5 font-serif">
            <div className="font-bold text-sm text-amber-900">॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜ್ಯೋತಿಷ್ಯ ॥</div>
            <div className="text-stone-600">ಮುಖ್ಯ ದೈವಜ್ಞರು: {DEFAULT_PRIEST_CONTACT.name}</div>
            <div className="text-stone-500">{DEFAULT_PRIEST_CONTACT.gokarnaLocation}</div>
          </div>
          <div className="w-full space-y-3 pt-2">
            <a
              href={DEFAULT_PRIEST_CONTACT.callUri}
              className="w-full bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-serif font-black text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg border border-amber-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📞</span>
              <span>{currentI18n.callPriestBtn}</span>
            </a>
            <button
              type="button"
              onClick={handleGoHome}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition border border-stone-300 flex items-center justify-center gap-1.5"
            >
              <span>🏠</span> ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Go to Home)
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* -------------------------------------------------------------
          Main Chat Conversation Thread
          ------------------------------------------------------------- */}
      <main className="w-full max-w-2xl flex-1 px-3 py-2.5 overflow-y-auto space-y-3 overscroll-contain">
        {/* Top Collapsible Sacred Panchanga Patrika Banner (Scrolls naturally with chat messages) */}
        {panchangaProfile && (
          <div className="w-full pb-1">
            <DevoteePanchangaPatrikaCard
              profile={panchangaProfile}
              variant="banner"
            />
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const msgIndex = messages.findIndex((m) => m.id === msg.id);
          const hasPriorUserMsg = messages.slice(0, msgIndex).some((m) => m.sender === "user");
          const isWelcomeGreeting = !isUser && !hasPriorUserMsg;
          const paragraphs = msg.text.split("\n\n").filter((p) => p.trim().length > 0);
          const directAnswerPara = paragraphs[0] || "";
          const remainingParas = paragraphs.slice(1);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
            >
              {/* Sender Tag */}
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 mb-1 px-1">
                <span>{isUser ? currentChatUi.devoteeSenderTag : currentChatUi.astrologerSenderTag}</span>
                <span className="text-stone-400 font-normal">
                  • {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Message Bubble: User is right-aligned bubble, Astrologer is FULL WIDTH (w-full) Card */}
              <div
                className={`transition-all break-words ${
                  isUser
                    ? "max-w-[85%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white rounded-br-xs font-medium shadow-xs"
                    : "w-full max-w-full rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm bg-white border-2 border-amber-400 text-amber-950 font-serif shadow-md space-y-3"
                }`}
              >
                {/* Content: If User or Initial Welcome Greeting, show regular paragraphs.
                    For ongoing Astrologer guidance, showcase Audio Player + Upfront Direct Answer Highlight Card */}
                {isUser || isWelcomeGreeting ? (
                  <>
                    {paragraphs.map((para, idx) => (
                      <p key={idx} className="whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                    {isUser && (
                      <div className="pt-2 border-t border-amber-500/40 flex items-center justify-end gap-1.5 mt-2">
                        {/* Copy Question Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-800/60 hover:bg-amber-800 text-amber-100 font-sans font-medium text-[11px] transition active:scale-95 border border-amber-400/30"
                          title={currentChatUi.copyBtn}
                        >
                          <span>{copiedMessageId === msg.id ? currentChatUi.copiedToast : currentChatUi.copyBtn}</span>
                        </button>

                        {/* Audio Listen Button for User Question */}
                        <button
                          type="button"
                          onClick={() => handlePlayTTS(msg.id, msg.text)}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-sans font-semibold text-[11px] transition active:scale-95 ${
                            speakingMessageId === msg.id
                              ? "bg-red-500 text-white border border-red-300 shadow-2xs animate-pulse"
                              : "bg-amber-800/60 hover:bg-amber-800 text-amber-100 border border-amber-400/40"
                          }`}
                          title={speakingMessageId === msg.id ? currentChatUi.stopAudio : currentChatUi.listenAudio}
                        >
                          <span>{speakingMessageId === msg.id ? currentChatUi.stopAudio : currentChatUi.listenAudio}</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Prominent Upfront Full-Width Audio Player Bar for Astrologer Answer */}
                    <div className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/90 to-orange-50 border border-amber-300 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform ${
                          speakingMessageId === msg.id
                            ? "bg-red-600 text-white animate-pulse"
                            : "bg-amber-700 text-white shadow-2xs"
                        }`}>
                          {speakingMessageId === msg.id ? "🔊" : "🎙️"}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs text-amber-950 truncate font-sans">
                            {speakingMessageId === msg.id
                              ? (session.language === "en" ? "Listening to Sri Shreeram Pandit..." : "ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ಧ್ವನಿ ನುಡಿಯುತ್ತಿದೆ...")
                              : (session.language === "en" ? "Listen in Divine Priest Voice" : "ಶ್ರೀರಾಮ್ ಪಂಡಿತರ ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ")}
                          </p>
                          <p className="text-[10px] text-amber-800/80 truncate font-sans">
                            {speakingMessageId === msg.id
                              ? (session.language === "en" ? "Tap stop anytime" : "ನಿಲ್ಲಿಸಲು ಮತ್ತೆ ಕ್ಲಿಕ್ ಮಾಡಿ")
                              : (session.language === "en" ? "Pure Vedic Speech Synthesis" : "ದೈವಿಕ ಜಾತಕ ನಿರ್ಣಯ ಧ್ವನಿ ಶ್ರವಣ")}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg.id, msg.text)}
                        className={`px-3 py-1.5 rounded-xl font-sans font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 shadow-2xs ${
                          speakingMessageId === msg.id
                            ? "bg-red-600 hover:bg-red-700 text-white border border-red-400"
                            : "bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white border border-amber-600"
                        }`}
                      >
                        <span>{speakingMessageId === msg.id ? (session.language === "en" ? "⏸️ Stop" : "⏸️ ನಿಲ್ಲಿಸಿ") : (session.language === "en" ? "▶️ Listen" : "▶️ ಆಲಿಸಿ")}</span>
                      </button>
                    </div>

                    {/* Upfront Direct Answer Highlight Card (ChatGPT / Gemini Upfront Style) */}
                    {directAnswerPara && (
                      <div className="bg-gradient-to-br from-amber-50 via-amber-100/70 to-orange-50 border-2 border-amber-400 rounded-xl p-3 sm:p-3.5 shadow-xs text-amber-950 font-serif space-y-1.5">
                        <div className="flex items-center justify-between border-b border-amber-300/80 pb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">✨</span>
                            <span className="font-bold text-amber-900 text-xs sm:text-[13px] tracking-wide">
                              {currentChatUi.directAnswerBadge}
                            </span>
                          </div>
                          <span className="bg-amber-600/15 text-amber-900 border border-amber-400/80 text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full">
                            {currentChatUi.directAnswerTag}
                          </span>
                        </div>
                        <p className="font-medium text-xs sm:text-sm text-stone-900 leading-relaxed whitespace-pre-line">
                          {directAnswerPara}
                        </p>
                      </div>
                    )}

                    {/* Detailed Astrological Context & Shastra Guidance */}
                    {remainingParas.length > 0 && (
                      <div className="pt-1 space-y-2">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800/90 font-sans uppercase tracking-wider">
                          <span>{currentChatUi.explanationHeader}</span>
                        </div>
                        {remainingParas.map((para, pIdx) => (
                          <p key={pIdx} className="whitespace-pre-line text-xs sm:text-sm text-amber-950">
                            {para}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Dedicated Luxury Gold Dosha & Karma Insight Card (Deduplicated so never repeated) */}
                {!isUser && msg.activeDoshaCard && isDoshaCardFirstOccurrence[msg.id] && (
                  <div className="mt-3 mb-2 p-3.5 bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/90 border-2 border-amber-400/90 rounded-2xl shadow-md text-amber-950 font-serif space-y-2.5">
                    <div className="flex items-center justify-between border-b border-amber-300 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪐</span>
                        <span className="font-bold text-amber-950 text-xs md:text-sm tracking-wide">
                          {currentChatUi.doshaCardTitle}
                        </span>
                      </div>
                      <span className="bg-red-700 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                        {currentChatUi.specialPariharaBadge}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">{currentChatUi.doshaAfflictionLabel}</span>
                        <span className="text-red-900 font-bold text-[12px]">{msg.activeDoshaCard.doshaName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">{currentChatUi.planetaryCauseLabel}</span>
                        <span className="text-amber-900 leading-relaxed text-[11px]">{msg.activeDoshaCard.technicalWhy}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-800 font-bold whitespace-nowrap text-[11px]">{currentChatUi.currentImpactLabel}</span>
                        <span className="text-amber-950 leading-relaxed text-[11px]">{msg.activeDoshaCard.currentLifeProblems}</span>
                      </div>
                      <div className="flex items-start gap-2 bg-amber-100/80 p-2 rounded-xl border border-amber-300">
                        <span className="text-amber-900 font-bold whitespace-nowrap text-[11px]">{currentChatUi.remedySankalpaLabel}</span>
                        <span className="text-amber-950 font-medium leading-relaxed text-[11px]">{msg.activeDoshaCard.recommendedPooja}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-300 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-[10px] text-amber-900 font-sans">
                        <span>{currentChatUi.priestLabel}</span>
                        <span className="font-bold">{msg.activeDoshaCard.priestName || DEFAULT_PRIEST_CONTACT.name}</span>
                        <span className="block text-[9px] text-amber-800/80">{currentChatUi.gokarnaLocationLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${msg.activeDoshaCard.priestPhone || DEFAULT_PRIEST_CONTACT.phone}`}
                          className="bg-red-700 hover:bg-red-800 text-white font-sans text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1"
                        >
                          <span>{currentChatUi.directCallBtn}</span>
                          <span className="text-[10px] opacity-90">({msg.activeDoshaCard.priestPhone || DEFAULT_PRIEST_CONTACT.phone})</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Astrologer Dosha Chapter Badge (Fallback if no full card and first occurrence) */}
                {!isUser && !msg.activeDoshaCard && msg.hasDosha && isDoshaCardFirstOccurrence[msg.id] && (
                  <div className="mt-2 mb-1 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-400 rounded-xl flex items-center justify-between text-xs text-amber-950 font-serif shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <div>
                        <span className="font-bold text-amber-900 block text-[11px]">{currentChatUi.doshaBadgeFallback}</span>
                        <span className="text-[11px] text-amber-800">{msg.doshaName || currentChatUi.specialDoshaFallback}</span>
                      </div>
                    </div>
                    <a
                      href={DEFAULT_PRIEST_CONTACT.callUri}
                      className="bg-amber-700 hover:bg-amber-800 text-white font-sans text-[10px] font-bold px-2.5 py-1 rounded-md shadow-2xs transition whitespace-nowrap"
                    >
                      {currentChatUi.callRemedyBtn}
                    </a>
                  </div>
                )}

                {/* Astrologer Actions: Copy & Audio */}
                {!isUser && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                    <span className="text-amber-800/80 font-sans italic truncate max-w-[200px]">
                      {currentChatUi.astrologerFooterNote}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* One-Tap Copy Answer Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans font-bold text-xs transition active:scale-95 ${
                          copiedMessageId === msg.id
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-400 shadow-2xs"
                            : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
                        }`}
                        title={currentChatUi.copyBtn}
                      >
                        <span>{copiedMessageId === msg.id ? currentChatUi.copiedToast : currentChatUi.copyBtn}</span>
                      </button>

                      {/* TTS Audio Listen Button */}
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-sans font-bold text-xs transition active:scale-95 ${
                          speakingMessageId === msg.id
                            ? "bg-red-100 text-red-700 border border-red-300 shadow-2xs"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                        }`}
                      >
                        <span>{speakingMessageId === msg.id ? currentChatUi.stopAudio : currentChatUi.listenAudio}</span>
                      </button>
                    </div>
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
              {currentChatUi.typingAstrologer}
            </span>
            <div className="bg-white border-2 border-amber-300 rounded-2xl rounded-bl-xs p-3.5 text-xs text-amber-900 font-serif flex items-center gap-2 shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-sans ml-1 text-amber-800">
                {currentChatUi.synthesizingAnswer}
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
          {/* Quick Questions Age-Adaptive Luxury FAQ Dock (Collapsed when keyboard/input focused or voice mode active) */}
          {!isExpired && !isInputFocused && !isVoiceRecordMode && quickFaqChips.length > 0 && (
            <div className="pt-0.5 pb-1">
              <div className="flex items-center justify-between text-[11px] text-amber-900 font-serif mb-1 px-1">
                <span className="flex items-center gap-1 font-semibold">
                  <span>✨</span>
                  <span>{currentChatUi.faqDockHeader}</span>
                </span>
                <span className="text-[10px] text-amber-800/70 font-sans">
                  {isMinorChildDevotee ? currentChatUi.minorChildBadge : `👤 ${devoteeAgeYears} ${currentChatUi.yearsAgeBadge}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                {quickFaqChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => handleSendMessage(chip.question)}
                    className="whitespace-nowrap bg-white hover:bg-amber-100 active:scale-95 border border-amber-300 text-amber-950 px-3 py-1.5 rounded-full shadow-2xs font-medium transition flex items-center gap-1 disabled:opacity-50 min-h-[36px]"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Speaking Banner */}
          {isListening && !isVoiceRecordMode && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                {currentLangMeta.speakingIndicator}
              </span>
              <span className="font-mono font-bold text-red-950">⏱️ {speechTimerText}</span>
            </div>
          )}

          {/* Active AI Question Reviewing Banner (2-3 seconds) */}
          {isReviewingQuestion && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 text-amber-950 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between shadow-xs animate-pulse">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                <span>{currentLangMeta.aiReviewingIndicator || "✨ AI ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ... (೨-೩ ಸೆಕೆಂಡುಗಳು)"}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                ⏱️ ~2s
              </span>
            </div>
          )}

          {/* Sacred Royal Gold Completion Ribbon */}
          {isExpired ? (
            <div className="bg-gradient-to-b from-[#FFFDF0] to-[#FDF6E2] border-2 border-[#D4AF37] rounded-2xl p-4 text-center space-y-2.5 shadow-md">
              <p className="text-xs font-bold text-amber-950 flex items-center justify-center gap-1.5">
                <span>🪔</span>
                <span>{currentI18n.sessionEndedTitle}</span>
                <span>🕉️</span>
              </p>
              <p className="text-[11px] text-amber-900 leading-relaxed font-sans max-w-lg mx-auto">
                {currentI18n.sessionEndedMsg}
              </p>
              <a
                href={DEFAULT_PRIEST_CONTACT.callUri}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md transition"
              >
                <span>📞</span>
                <span>{currentI18n.callPriestBtn || "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರಿಗೆ ಕರೆ ಮಾಡಿ: 9972339362"}</span>
              </a>
            </div>
          ) : isVoiceRecordMode ? (
            /* Dedicated Voice Recording Studio: Hands-Free devotions for mobile */
            <div className="bg-gradient-to-b from-amber-50 to-amber-100/90 border-2 border-amber-400 rounded-2xl p-3 shadow-md space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Header with live timer & recording badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                  </span>
                  <span className="text-xs font-bold text-amber-950 font-serif">
                    {currentLang === "kn" ? "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಜಾರಿಯಲ್ಲಿದೆ..." : "Voice Recording Active..."}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full border border-red-300">
                  <span>⏱️</span>
                  <span>{speechTimerText}</span>
                </div>
              </div>

              {/* Real-time recognized voice text bubble */}
              <div className="bg-white border border-amber-300 rounded-xl p-2.5 min-h-[52px] max-h-28 overflow-y-auto text-xs text-stone-900 shadow-inner">
                {inputText.trim() ? (
                  <p className="font-serif leading-relaxed text-amber-950">
                    "{inputText}"
                  </p>
                ) : (
                  <p className="text-stone-400 italic font-sans flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>
                      {currentLang === "kn"
                        ? "ಸ್ಪಷ್ಟವಾಗಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ (೩-೪ ನಿಮಿಷ ಮಾತನಾಡಬಹುದು)..."
                        : "Speak your question clearly (continuous 3-4 minutes support)..."}
                    </span>
                  </p>
                )}
              </div>

              {/* Action Buttons: Cancel or Send Recorded Question */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleCancelVoiceRecording}
                  disabled={isReviewingQuestion}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-3 rounded-xl text-xs transition border border-stone-300 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <span>✕</span>
                  <span>{currentLang === "kn" ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleSendRecordedVoiceQuestion()}
                  disabled={isReviewingQuestion || isGenerating || !inputText.trim()}
                  className="flex-[2] bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
                >
                  {isReviewingQuestion ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{currentLang === "kn" ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Refining..."}</span>
                    </>
                  ) : (
                    <>
                      <span>➤</span>
                      <span>{currentLang === "kn" ? "ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ" : "Send Question"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              {/* Text Input Container with Auto-Expanding Textarea & Clear (✕) Button */}
              <div className="flex-1 bg-white border-2 border-amber-400 rounded-2xl p-2 shadow-inner focus-within:border-amber-600 transition flex items-end gap-1.5 sm:gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputText}
                  disabled={isReviewingQuestion}
                  onFocus={() => {
                    setIsInputFocused(true);
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }, 250);
                  }}
                  onBlur={() => {
                    setIsInputFocused(false);
                  }}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  placeholder={currentLangMeta.inputPlaceholder}
                  className="flex-1 bg-transparent text-sm text-stone-900 focus:outline-hidden resize-none overflow-y-auto max-h-32 min-h-[38px] py-1.5 font-sans leading-relaxed disabled:opacity-60"
                />

                {/* Clear Input Button (visible when text entered) */}
                {inputText.trim().length > 0 && (
                  <button
                    type="button"
                    disabled={isReviewingQuestion}
                    onClick={() => {
                      setInputText("");
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition active:scale-90 disabled:opacity-30"
                    title={currentChatUi.clearInputTooltip}
                    aria-label={currentChatUi.clearInputTooltip}
                  >
                    <span className="text-sm font-bold leading-none">✕</span>
                  </button>
                )}

                {/* Mic Button: Toggles dedicated Voice Recording Studio */}
                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
                  disabled={isReviewingQuestion || isGenerating}
                  className={`p-2 rounded-xl transition ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-md"
                      : "text-amber-700 hover:bg-amber-100 active:scale-90 disabled:opacity-40"
                  }`}
                  title={currentChatUi.micTooltip}
                >
                  <span className="text-lg">🎙️</span>
                </button>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isGenerating || isReviewingQuestion || !inputText.trim()}
                className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold p-3 rounded-2xl shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition min-w-[44px] flex items-center justify-center"
                title={isReviewingQuestion ? (currentLangMeta.aiReviewingIndicator || "AI ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ...") : currentChatUi.sendTooltip}
              >
                {isReviewingQuestion ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span className="text-base">➤</span>
                )}
              </button>
            </div>
          )}
        </div>
      </footer>
        </>
      )}

      {/* -------------------------------------------------------------
          STEP 1: Devotee Contact Collection Modal
          (Shown ONCE before starting timer; Mobile number is MANDATORY, Email is OPTIONAL)
          ------------------------------------------------------------- */}
      {showContactModal && session.status === "pending" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-[#FAF6EE] border-3 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Close / Dismiss 'X' Button */}
            <button
              type="button"
              onClick={() => {
                setContactError(null);
                setShowContactModal(false);
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-sm font-bold w-8 h-8 rounded-full bg-white/80 border border-amber-200 flex items-center justify-center transition active:scale-95"
              title="Close"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white text-2xl flex items-center justify-center shadow-md border-2 border-amber-200">
                📱
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-950 pt-1">
                {currentI18n.contactModalTitle}
              </h3>
              <p className="text-xs text-amber-800 font-medium leading-relaxed px-2">
                {currentI18n.contactModalSubtitle}
              </p>
            </div>

            {contactError && (
              <div className="bg-red-100 border border-red-300 text-red-800 text-xs p-2.5 rounded-xl font-medium">
                ⚠️ {contactError}
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-3.5 text-xs">
              <div>
                <label className="flex items-center justify-between font-bold text-amber-950 mb-1">
                  <span>📱 {currentI18n.phoneLabel}</span>
                  <span className="text-[10px] text-red-700 font-sans font-bold uppercase tracking-wider bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-sm">
                    {session.language === "en" ? "* Mandatory" : "* ಕಡ್ಡಾಯ (೧೦ ಅಂಕಿ)"}
                  </span>
                </label>
                <input
                  type="tel"
                  autoFocus
                  required
                  maxLength={14}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={currentI18n.phonePlaceholder || "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"}
                  className="w-full bg-white border-2 border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2.5 text-stone-900 font-sans text-sm focus:outline-hidden shadow-inner"
                />
              </div>

              <div>
                <label className="flex items-center justify-between font-bold text-amber-950 mb-1">
                  <span>✉️ {currentI18n.emailLabel}</span>
                  <span className="text-[10px] text-stone-600 font-sans font-medium bg-stone-100 border border-stone-300 px-1.5 py-0.5 rounded-sm">
                    {session.language === "en" ? "Optional" : "ಐಚ್ಛಿಕ"}
                  </span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder={currentI18n.emailPlaceholder || "devotee@example.com (ಐಚ್ಛಿಕ)"}
                  className="w-full bg-white border border-amber-300 focus:border-amber-600 rounded-xl px-3.5 py-2 text-stone-900 font-sans text-sm focus:outline-hidden"
                />
              </div>

              <p className="text-[11px] text-stone-500 italic leading-relaxed">
                {currentI18n.contactNote}
              </p>

              <button
                type="submit"
                disabled={savingContact}
                className="w-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-serif font-black py-3.5 px-4 rounded-xl shadow-lg border border-amber-300 text-sm sm:text-base transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingContact ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{currentChatUi.confirmingContact || "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ..."}</span>
                  </>
                ) : (
                  <>
                    <span>🪔</span>
                    <span>{currentI18n.submitContactBtn || "ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಿ (೨೦ ನಿಮಿಷ)"}</span>
                    <span>➔</span>
                  </>
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
                <span className="text-stone-500 font-medium">{currentChatUi.devoteeNameLabel}</span>
                <span className="font-bold text-amber-950">{session.name}</span>
              </div>
              <div className="flex justify-between border-b border-amber-100 pb-1">
                <span className="text-stone-500 font-medium">{currentChatUi.birthDetailsLabel}</span>
                <span className="font-bold text-amber-950">
                  {session.dob} at {session.tob} ({session.place})
                </span>
              </div>
              {(session.userPhone || session.userEmail) && (
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-stone-500 font-medium">{currentChatUi.contactSummaryLabel}</span>
                  <span className="font-bold text-amber-950">
                    {session.userPhone || session.userEmail}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">{currentChatUi.languageSummaryLabel}</span>
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
                    <span>{currentChatUi.startingSession}</span>
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
                {currentChatUi.reviewLaterBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          Sacred Kala Chakra 4-Pada Timeline Details Modal
          (Opens when tapping the top Sandglass countdown badge on mobile)
          ------------------------------------------------------------- */}
      {showTimerDetailsModal && session && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-lg w-full bg-[#FAF6EE] border-3 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-300 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  ⏳
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-serif text-amber-950">
                    {currentLang === "kn"
                      ? "॥ ಕಾಲಚಕ್ರ ೪ ಪಾದಗಳ ಕಾಲಾವಧಿ ವಿವರ ॥"
                      : "॥ Kala Chakra 4-Pada Breakdown ॥"}
                  </h3>
                  <p className="text-[10px] text-amber-800">
                    {currentLang === "kn"
                      ? "೨೦ ನಿಮಿಷಗಳ ನಿಖರ ದೈವಿಕ ಸಂವಾದ ಹಂತಗಳು"
                      : "20-Minute Divine Astrological Timetable"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTimerDetailsModal(false)}
                className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center transition active:scale-95"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

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
              variant="full"
            />

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTimerDetailsModal(false)}
                className="w-full bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm"
              >
                {currentLang === "kn" ? "ಸರಿ, ಮುಚ್ಚಿ (ಸಂವಾದಕ್ಕೆ ಹಿಂತಿರುಗಿ)" : "Close & Return to Chat"}
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
                {currentChatUi.ratingLevels[Math.max(0, Math.min(4, selectedStars - 1))]}
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
                    <span>{currentChatUi.submittingReview}</span>
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
    </div>
  );
};

export default ConsultationChatPage;
