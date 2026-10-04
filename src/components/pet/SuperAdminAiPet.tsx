import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppStore, type SupportedLanguage, type AppPage } from "../../stores/appStore";
import { useAuthStore } from "../../features/auth/authStore";
import { useWalletStore } from "../../features/wallet/walletStore";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { petSpeechService } from "../../services/petSpeechService";
import {
  executeSuperAdminPetQuery,
  isSuperAdminAuthorized,
  type PetEmotion,
  type PetActionItem
} from "../../services/superAdminPetEngine";

export type PetType = "kamadhenu" | "nandi" | "shuka";

interface ChatMessage {
  id: string;
  sender: "user" | "pet";
  text: string;
  spokenText?: string;
  actions?: PetActionItem[];
  timestamp: Date;
  emotion?: PetEmotion;
}

export function SuperAdminAiPet(): JSX.Element | null {
  const role = useAuthStore((s) => s.role);
  const currentUser = useAuthStore((s) => s.currentUser);
  const setPage = useAppStore((s) => s.setPage);
  const activePage = useAppStore((s) => s.currentPage);
  const currentLang = (useAppStore((s) => s.language) || "kn") as SupportedLanguage;
  const setLanguage = useAppStore((s) => s.setLanguage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const wallet = useWalletStore((s) => s.wallet);
  const currentKundliSession = useKundliViewerStore((s) => s.session);

  // STRICT SECURITY GUARD:
  // Render ONLY for Super Admin or Baggona Master profile
  const isAuthorized = useMemo(() => {
    return isSuperAdminAuthorized(role, currentUser);
  }, [role, currentUser]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [petType, setPetType] = useState<PetType>(() => {
    try {
      return (localStorage.getItem("baggona_pet_type") as PetType) || "kamadhenu";
    } catch {
      return "kamadhenu";
    }
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => petSpeechService.getIsMuted());
  const [isListening, setIsListening] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<PetEmotion>("peaceful");
  const [activeBubbleText, setActiveBubbleText] = useState<string>("");
  const [bubbleVisible, setBubbleVisible] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      sender: "pet",
      text:
        currentLang === "kn"
          ? "ನಮಸ್ಕಾರ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ವಹಿಸುತ್ತೇನೆ. ಹಣಗಳಿಸುವ ಯೋಜನೆಗಳು, ಮಾರ್ಕೆಟಿಂಗ್, ಜಾತಕ ದೋಷ ಸ್ಕ್ಯಾನ್ ಅಥವಾ ಸಿಸ್ಟಮ್ ತಪಾಸಣೆ - ಏನು ಬೇಕಾದರೂ ಕೇಳಿ!"
          : currentLang === "hi"
          ? "नमस्ते सुपर एडमिन स्वामी! मैं आपकी सेवा में कामधेनु AI सहायक हूँ। आय वृद्धि, मार्केटिंग, कुंडली दोष या सिस्टम स्थिति के बारे में पूछें।"
          : currentLang === "te"
          ? "నమస్కారం సూపర్ అడ్మిన్ స్వామి! నేను మీ కామధేను AI అసిస్టెంట్. మీ ఆజ్ఞ ప్రకారం అన్ని పనులను నిర్వహించడానికి సిద్ధంగా ఉన్నాను."
          : currentLang === "ta"
          ? "வணக்கம் சூப்பர் அட்மின் சுவாமி! நான் உங்கள் காமதேனு AI உதவியாளர். உங்கள் கட்டளைகளை உடனே நிறைவேற்ற தயாராக உள்ளேன்."
          : "Namaskara Super Admin! I am Kamadhenu, your divine AI companion. I have full super admin access to execute actions, analyze Janma Kundalis and Doshas, strategize revenue monetization, and guide marketing campaigns.",
      spokenText:
        currentLang === "kn"
          ? "ನಮಸ್ಕಾರ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ತಕ್ಷಣ ನಿರ್ವಹಿಸುತ್ತೇನೆ."
          : "Namaskara Super Admin! I am Kamadhenu, your divine companion ready to serve your every command.",
      timestamp: new Date(),
      emotion: "peaceful",
      actions: [
        {
          id: "init_earn",
          label: {
            kn: "💰 ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ?",
            hi: "💰 पैसे कैसे कमाएं?",
            te: "💰 ఆదాయం ఎలా?",
            ta: "💰 வருமானம் ஈட்டுவது எப்படி?",
            en: "💰 How to Earn Money?"
          },
          icon: "💰",
          actionType: "custom"
        },
        {
          id: "init_market",
          label: {
            kn: "📢 ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು",
            hi: "📢 मार्केटिंग रणनीति",
            te: "📢 మార్కెటింగ్ వ్యూహాలు",
            ta: "📢 சந்தைப்படுத்தல்",
            en: "📢 Marketing Strategies"
          },
          icon: "📢",
          actionType: "custom"
        },
        {
          id: "init_dosha",
          label: {
            kn: "🔮 ಜಾತಕ & ದೋಷ ಸ್ಕ್ಯಾನ್",
            hi: "🔮 कुंडली दोष स्कैन",
            te: "🔮 జాతక దోషాల తనిఖీ",
            ta: "🔮 தோஷ ஆய்வு",
            en: "🔮 Kundli & Dosha Scan"
          },
          icon: "🔮",
          targetPage: "doshas",
          actionType: "navigate"
        },
        {
          id: "init_health",
          label: {
            kn: "🩺 ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ",
            hi: "🩺 सिस्टम स्वास्थ्य जांच",
            te: "🩺 సిస్టమ్ హెల్త్ చెక్",
            ta: "🩺 சிஸ்டம் ஆய்வு",
            en: "🩺 System Diagnostics"
          },
          icon: "🩺",
          actionType: "run_diagnostic"
        }
      ]
    }
  ]);

  // Subscribe to speech synthesis state
  useEffect(() => {
    const unsub = petSpeechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setCurrentEmotion("speaking");
      }
    });
    return () => unsub();
  }, []);

  // Update bubble text on latest pet message
  useEffect(() => {
    const lastPetMsg = [...messages].reverse().find((m) => m.sender === "pet");
    if (lastPetMsg) {
      setActiveBubbleText(lastPetMsg.spokenText || lastPetMsg.text.slice(0, 100));
      setBubbleVisible(true);
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle Speech Recognition (Microphone input)
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        currentLang === "kn"
          ? "kn-IN"
          : currentLang === "hi"
          ? "hi-IN"
          : currentLang === "te"
          ? "te-IN"
          : currentLang === "ta"
          ? "ta-IN"
          : "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("SpeechRecognition start failed:", e);
      setIsListening(false);
    }
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    petSpeechService.setMuted(next);
  };

  const changePetType = (type: PetType) => {
    setPetType(type);
    try {
      localStorage.setItem("baggona_pet_type", type);
    } catch {}
  };

  const handleSend = async (queryToSend?: string) => {
    const textToQuery = (queryToSend || inputText).trim();
    if (!textToQuery || isProcessing) return;

    setInputText("");
    setCurrentEmotion("thinking");

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToQuery,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const resp = await executeSuperAdminPetQuery(textToQuery, {
        activePage,
        currentKundliSession,
        coinBalance: wallet?.coinBalance,
        currentUser,
        geminiApiKey,
        selectedLanguage: currentLang
      });

      const localizedText = resp.text[currentLang] || resp.text.kn || resp.text.en;
      const localizedSpoken = resp.spokenText[currentLang] || resp.spokenText.kn || resp.spokenText.en;

      const petMsg: ChatMessage = {
        id: `pet-${Date.now()}`,
        sender: "pet",
        text: localizedText,
        spokenText: localizedSpoken,
        actions: resp.actions,
        timestamp: new Date(),
        emotion: resp.emotion
      };

      setMessages((prev) => [...prev, petMsg]);
      setCurrentEmotion(resp.emotion);

      // Speak aloud to Super Admin!
      if (!isMuted) {
        petSpeechService.speak(localizedSpoken, currentLang);
      }
    } catch (err) {
      console.error("Pet execution error:", err);
      const fallbackMsg: ChatMessage = {
        id: `pet-err-${Date.now()}`,
        sender: "pet",
        text: "ಕ್ಷಮಿಸಿ ಸ್ವಾಮಿ, ಗಣನೆಯಲ್ಲಿ ಸಣ್ಣ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
        timestamp: new Date(),
        emotion: "alert"
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setCurrentEmotion("alert");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: PetActionItem) => {
    if (action.targetPage) {
      setPage(action.targetPage);
      setIsOpen(false);
      const confirmSpeech =
        currentLang === "kn"
          ? `${action.label.kn} ಪುಟಕ್ಕೆ ಜಂಪ್ ಮಾಡಲಾಗಿದೆ.`
          : `Navigating to ${action.label.en}.`;
      if (!isMuted) {
        petSpeechService.speak(confirmSpeech, currentLang);
      }
    } else if (action.actionType === "run_diagnostic") {
      handleSend("ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡು (Check System Health)");
    } else {
      const q = action.label[currentLang] || action.label.en;
      handleSend(q);
    }
  };

  const repeatSpeech = (text?: string) => {
    if (!text) return;
    petSpeechService.speak(text, currentLang);
  };

  // If unauthorized, do not render anything
  if (!isAuthorized) {
    return null;
  }

  // Pet Display Name & Title
  const petTitles: Record<PetType, Record<SupportedLanguage, string>> = {
    kamadhenu: {
      kn: "ಕಾಮಧೇನು (ದೈವಿಕ AI ಸಂಗಾತಿ)",
      hi: "कामधेनु (दिव्य AI साथी)",
      te: "కామధేను (దివ్య AI సహచరి)",
      ta: "காமதேனு (தெய்வீக AI தோழன்)",
      en: "Kamadhenu (Divine AI Pet)"
    },
    nandi: {
      kn: "ನಂದಿ (ಗೋಕರ್ಣ ದ್ವಾರಪಾಲಕ)",
      hi: "नंदी (गोकर्ण द्वारपाल)",
      te: "నంది (గోకర్ణ ద్వారపాలకుడు)",
      ta: "நந்தி (கோகர்ண வாயிற்காவலர்)",
      en: "Nandi (Gokarna Gatekeeper)"
    },
    shuka: {
      kn: "ದೈವಿಕ ಶುಕ (ಜ್ಞಾನ ಪಕ್ಷಿ)",
      hi: "दिव्य शुक (ज्ञान पक्षी)",
      te: "దివ్య శుకము (జ్ఞాన పక్షి)",
      ta: "தெய்வீக கிளி (ஞான பறவை)",
      en: "Sacred Shuka (Wisdom Parrot)"
    }
  };

  return (
    <>
      {/* 🌟 FLOATING PET COMPANION (Mobile & Desktop) */}
      <div
        className="fixed bottom-20 right-3.5 md:bottom-6 md:right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
        aria-label="Super Admin AI Pet Companion"
      >
        {/* Floating Speech Bubble (collapsible) */}
        {!isOpen && bubbleVisible && activeBubbleText && (
          <div className="relative mb-2 max-w-[220px] sm:max-w-[280px] rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-100 p-2.5 shadow-xl text-slate-800 animate-fade-in backdrop-blur-md">
            <div className="flex items-start justify-between gap-1.5">
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-900 tracking-wider">
                <span className="animate-spin text-xs">✨</span>
                <span>{petTitles[petType][currentLang]}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => repeatSpeech(activeBubbleText)}
                  className="p-0.5 text-amber-800 hover:text-amber-950 transition-colors"
                  title="ಧ್ವನಿ ಪುನರಾವರ್ತಿಸಿ / Repeat voice"
                >
                  🔊
                </button>
                <button
                  type="button"
                  onClick={() => setBubbleVisible(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none px-1"
                  title="ಮುಚ್ಚು / Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <p className="mt-1 line-clamp-3 text-xs font-medium leading-snug text-slate-900">
              {activeBubbleText}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 right-6 h-0 w-0 border-x-8 border-x-transparent border-t-8 border-t-amber-400" />
          </div>
        )}

        {/* Floating Pet Avatar Avatar Button */}
        <div className="relative group">
          {/* Pulsing Aura */}
          <div
            className={`absolute -inset-2 rounded-full transition-all duration-700 blur-md ${
              isSpeaking
                ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-90 animate-pulse"
                : "bg-gradient-to-r from-amber-400/40 via-yellow-400/30 to-amber-500/40 opacity-70 group-hover:opacity-100"
            }`}
          />

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 shadow-2xl transition-all transform hover:scale-110 active:scale-95 overflow-hidden ring-2 ring-amber-500/50"
            title="Super Admin AI Companion Pet (ಕಾಮಧೇನು)"
          >
            {/* Animated Pet SVG Illustration */}
            <PetIllustration type={petType} emotion={currentEmotion} isSpeaking={isSpeaking} />

            {/* Speaking Sound Waves Indicator */}
            {isSpeaking && (
              <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold animate-ping">
                🔊
              </span>
            )}

            {/* Super Admin Crown Badge */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-950 border border-amber-300 text-[10px] shadow-sm">
              👑
            </span>
          </button>
        </div>
      </div>

      {/* 🏛️ SUPER ADMIN DIVINE PET SANCTUARY (DRAWER / BOTTOM SHEET / MODAL) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          {/* Main Pet Container */}
          <div className="relative flex flex-col h-[90vh] sm:h-[650px] w-full max-w-xl rounded-t-3xl sm:rounded-3xl border-2 border-amber-500/50 bg-[#FFFDF9] text-slate-900 shadow-2xl overflow-hidden animate-slide-up">
            {/* Top Royal Banner */}
            <div className="flex items-center justify-between border-b-2 border-amber-500/30 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-4 py-3 text-slate-950 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 rounded-full border border-amber-300 bg-white/90 p-0.5 shadow-sm overflow-hidden flex items-center justify-center">
                  <PetIllustration type={petType} emotion={currentEmotion} isSpeaking={isSpeaking} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-sm sm:text-base font-black tracking-wide text-indigo-950">
                      {petTitles[petType][currentLang]}
                    </h3>
                    <span className="rounded-full bg-indigo-950 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-300">
                      SUPER ADMIN
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-950/80 font-medium">
                    {isSpeaking
                      ? "🗣️ ಮಾತನಾಡುತ್ತಿದೆ (Speaking aloud...)"
                      : currentEmotion === "thinking"
                      ? "✨ ಜ್ಯೋತಿಷ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..."
                      : "🙏 ನಿಮ್ಮ ಆಜ್ಞೆಗೆ ಸದಾ ಸಿದ್ಧ (At Your Command)"}
                  </p>
                </div>
              </div>

              {/* Top Controls: Mute, Pet Selector, Language, Close */}
              <div className="flex items-center gap-1.5">
                {/* Voice Mute Toggle */}
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className={`rounded-lg p-1.5 text-xs font-bold transition-all ${
                    isMuted
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  }`}
                  title={isMuted ? "ಧ್ವನಿ ಆನ್ ಮಾಡಿ / Unmute voice" : "ಮ್ಯೂಟ್ ಮಾಡಿ / Mute voice"}
                >
                  {isMuted ? "🔇 Muted" : "🔊 Live"}
                </button>

                {/* Pet Type Switcher */}
                <select
                  value={petType}
                  onChange={(e) => changePetType(e.target.value as PetType)}
                  className="rounded-lg border border-amber-400 bg-amber-50 px-1.5 py-1 text-[11px] font-bold text-amber-950 cursor-pointer shadow-xs"
                >
                  <option value="kamadhenu">🐄 ಕಾಮಧೇನು</option>
                  <option value="nandi">🐂 ನಂದಿ</option>
                  <option value="shuka">🦜 ಶುಕ</option>
                </select>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-indigo-950/10 hover:bg-indigo-950/20 p-1.5 text-indigo-950 transition-colors"
                  title="ಮುಚ್ಚು / Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Action Chips Bar (Single-Tap SuperAdmin Powers) */}
            <div className="flex overflow-x-auto border-b border-amber-200/80 bg-amber-100/50 p-2 gap-2 scrollbar-none">
              <button
                type="button"
                onClick={() => handleSend("ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ? (How to Earn Money)")}
                className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                <span>💰</span>
                <span>ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ?</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend("ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು (Marketing & Growth)")}
                className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                <span>📢</span>
                <span>ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರ</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend("ಜಾತಕ & ದೋಷ ಸ್ಕ್ಯಾನ್ ಮಾಡು (Scan Kundli/Dosha)")}
                className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                <span>🔮</span>
                <span>ದೋಷ ಸ್ಕ್ಯಾನ್</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend("ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡು (System Health Check)")}
                className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                <span>🩺</span>
                <span>ಸಿಸ್ಟಮ್ ಆರೋಗ್ಯ</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPage("superadmindashboard");
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 rounded-xl border border-indigo-300 bg-indigo-950 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-indigo-900 whitespace-nowrap shadow-xs transition-all active:scale-95"
              >
                <span>🛡️</span>
                <span>ಅಡ್ಮಿನ್ ಸೆಂಟರ್</span>
              </button>
            </div>

            {/* Chat Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFBF0]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-start gap-2 max-w-[88%] sm:max-w-[80%]">
                    {msg.sender === "pet" && (
                      <div className="h-8 w-8 rounded-full border border-amber-400 bg-amber-100 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                        <PetIllustration type={petType} emotion={msg.emotion || "peaceful"} isSpeaking={isSpeaking} />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-tr-none"
                          : "bg-white border border-amber-300/80 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {/* Markdown text representation */}
                      <div className="whitespace-pre-line font-sans font-normal">
                        {msg.text}
                      </div>

                      {/* Repeat Voice Button for Pet Messages */}
                      {msg.sender === "pet" && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-amber-100 pt-2 text-[11px] text-amber-900">
                          <button
                            type="button"
                            onClick={() => repeatSpeech(msg.spokenText || msg.text)}
                            className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 transition-colors"
                          >
                            <span>🔊</span>
                            <span>ಧ್ವನಿ ಕೇಳಿ (Speak again)</span>
                          </button>
                          <span className="text-[10px] text-slate-400">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons ("Do on behalf of me") */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 pt-1 border-t border-amber-200/60">
                          {msg.actions.map((act) => (
                            <button
                              key={act.id}
                              type="button"
                              onClick={() => handleActionClick(act)}
                              className="flex items-center gap-1.5 rounded-xl border border-amber-500/70 bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 px-3 py-1.5 text-xs font-black text-amber-950 shadow-xs transition-all active:scale-95"
                            >
                              <span>{act.icon}</span>
                              <span>{act.label[currentLang] || act.label.en}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-amber-800 font-bold animate-pulse pl-10">
                  <span>✨ ಕಾಮಧೇನು ಚಿಂತಿಸುತ್ತಿದೆ...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Touch Input Bar */}
            <div className="border-t border-amber-300 bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice Input Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                    isListening
                      ? "border-rose-500 bg-rose-500 text-white animate-pulse"
                      : "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                  title="ಧ್ವನಿ ಮೂಲಕ ಆಜ್ಞೆ ನೀಡಿ (Speak via mic)"
                >
                  <span className="text-base">{isListening ? "🔴" : "🎙️"}</span>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? "ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ (Listening...)"
                      : currentLang === "kn"
                      ? "ಕಾಮಧೇನುಗೆ ಆಜ್ಞೆ ನೀಡಿ... (ಹಣ, ಮಾರ್ಕೆಟಿಂಗ್, ದೋಷ)"
                      : "Ask Kamadhenu... (Revenue, marketing, doshas)"
                  }
                  className="flex-1 rounded-xl border-2 border-amber-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-inner focus:border-amber-500 focus:bg-white focus:outline-none"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  className="flex h-10 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black shadow-md transition-all disabled:opacity-50 active:scale-95"
                  title="ಕಳುಹಿಸಿ / Send"
                >
                  ➤
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
// ANIMATED PET SVG ILLUSTRATIONS (KAMADHENU, NANDI, SHUKA)
// =========================================================================
function PetIllustration({
  type,
  emotion,
  isSpeaking
}: {
  type: PetType;
  emotion: PetEmotion;
  isSpeaking: boolean;
}): JSX.Element {
  if (type === "nandi") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Nandi Sacred Bull */}
        <circle cx="50" cy="50" r="46" fill="#FFF9EB" stroke="#D97706" strokeWidth="2.5" />
        {/* Horns */}
        <path d="M 28 35 Q 20 15 32 12 Q 35 25 36 34" fill="#92400E" />
        <path d="M 72 35 Q 80 15 68 12 Q 65 25 64 34" fill="#92400E" />
        {/* Crescent Moon between horns */}
        <path d="M 45 18 A 6 6 0 0 0 55 18 A 4 4 0 0 1 45 18" fill="#F59E0B" />
        {/* Face */}
        <ellipse cx="50" cy="56" rx="26" ry="24" fill="#FEF3C7" />
        <ellipse cx="50" cy="68" rx="16" ry="12" fill="#FDE68A" />
        {/* Nostrils */}
        <circle cx="44" cy="68" r="2.5" fill="#78350F" />
        <circle cx="56" cy="68" r="2.5" fill="#78350F" />
        {/* Mouth (animated when speaking) */}
        <path
          d={isSpeaking ? "M 44 74 Q 50 80 56 74" : "M 46 73 Q 50 75 54 73"}
          stroke="#78350F"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Eyes (blinking) */}
        <circle cx="38" cy="48" r="3.5" fill="#1E293B" />
        <circle cx="62" cy="48" r="3.5" fill="#1E293B" />
        {/* Sacred Tilak / Third Eye */}
        <path d="M 50 36 Q 47 43 50 45 Q 53 43 50 36" fill="#DC2626" />
      </svg>
    );
  }

  if (type === "shuka") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Shuka Sacred Parrot */}
        <circle cx="50" cy="50" r="46" fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" />
        {/* Feather Crest */}
        <path d="M 46 22 Q 50 12 54 18 Q 50 25 46 22" fill="#10B981" />
        <path d="M 50 20 Q 56 10 60 16 Q 54 24 50 20" fill="#047857" />
        {/* Body & Head */}
        <circle cx="50" cy="52" r="25" fill="#34D399" />
        {/* Pearl Necklace */}
        <circle cx="40" cy="68" r="2" fill="#F8FAFC" />
        <circle cx="46" cy="71" r="2.5" fill="#F8FAFC" />
        <circle cx="54" cy="71" r="2.5" fill="#F8FAFC" />
        <circle cx="60" cy="68" r="2" fill="#F8FAFC" />
        {/* Eyes */}
        <circle cx="42" cy="44" r="4" fill="#FFFFFF" />
        <circle cx="43" cy="44" r="2.5" fill="#0F172A" />
        <circle cx="58" cy="44" r="4" fill="#FFFFFF" />
        <circle cx="57" cy="44" r="2.5" fill="#0F172A" />
        {/* Curved Golden/Red Beak (animated when speaking) */}
        <path
          d={isSpeaking ? "M 46 50 Q 50 64 54 50" : "M 46 50 Q 50 60 54 50"}
          fill="#DC2626"
        />
      </svg>
    );
  }

  // DEFAULT: KAMADHENU (ಕಾಮಧೇನು) - Sacred Golden Cow with Flower Garland & Tilak
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Divine Golden Halo */}
      <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="3 3" />

      {/* Golden Horns with Sacred Aura */}
      <path d="M 28 32 Q 18 14 30 10 Q 34 22 36 30" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
      <path d="M 72 32 Q 82 14 70 10 Q 66 22 64 30" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />

      {/* Gentle Ears */}
      <ellipse cx="22" cy="38" rx="8" ry="4" fill="#FEF3C7" transform="rotate(-20 22 38)" />
      <ellipse cx="78" cy="38" rx="8" ry="4" fill="#FEF3C7" transform="rotate(20 78 38)" />

      {/* Crown / Flower Wreath */}
      <circle cx="38" cy="26" r="3" fill="#EF4444" />
      <circle cx="46" cy="24" r="3.5" fill="#F59E0B" />
      <circle cx="54" cy="24" r="3.5" fill="#F59E0B" />
      <circle cx="62" cy="26" r="3" fill="#EF4444" />

      {/* Head & Snout */}
      <ellipse cx="50" cy="52" rx="25" ry="22" fill="#FEF3C7" />
      <ellipse cx="50" cy="65" rx="16" ry="11" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />

      {/* Divine Tilak (Kumkuma & Chandana) */}
      <path d="M 50 34 Q 47 42 50 44 Q 53 42 50 34" fill="#DC2626" />
      <circle cx="50" cy="46" r="1.5" fill="#F59E0B" />

      {/* Eyes (Gentle Vedic eyes) */}
      <ellipse cx="38" cy="46" rx="4" ry="3.5" fill="#0F172A" />
      <circle cx="37" cy="45" r="1.2" fill="#FFFFFF" />
      <ellipse cx="62" cy="46" rx="4" ry="3.5" fill="#0F172A" />
      <circle cx="61" cy="45" r="1.2" fill="#FFFFFF" />

      {/* Nostrils */}
      <circle cx="44" cy="65" r="2.2" fill="#78350F" />
      <circle cx="56" cy="65" r="2.2" fill="#78350F" />

      {/* Mouth (Opening and closing when speaking) */}
      <path
        d={isSpeaking ? "M 44 71 Q 50 78 56 71" : "M 45 70 Q 50 73 55 70"}
        stroke="#78350F"
        strokeWidth="2"
        fill={isSpeaking ? "#991B1B" : "none"}
        strokeLinecap="round"
      />

      {/* Golden Bell on Neck */}
      <path d="M 46 80 L 54 80 L 56 86 L 44 86 Z" fill="#D97706" />
      <circle cx="50" cy="87" r="2" fill="#78350F" />
    </svg>
  );
}
