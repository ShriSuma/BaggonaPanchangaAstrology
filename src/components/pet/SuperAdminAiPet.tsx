import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppStore, type SupportedLanguage, type AppPage } from "../../stores/appStore";
import { useAuthStore } from "../../features/auth/authStore";
import { useWalletStore } from "../../features/wallet/walletStore";
import { useKundliViewerStore } from "../../stores/kundliViewerStore";
import { petSpeechService } from "../../services/petSpeechService";
import {
  executeSuperAdminPetQuery,
  isSuperAdminAuthorized,
  detectQueryLanguage,
  type PetEmotion,
  type PetActionItem
} from "../../services/superAdminPetEngine";
import {
  superAdminWorkflowRunner,
  parseWorkflowInstruction,
  triggerBrowserDownload,
  type WorkflowState,
  type WorkflowParams
} from "../../services/superAdminWorkflowRunner";

export type PetType = "kamadhenu" | "nandi" | "shuka";

interface ChatMessage {
  id: string;
  sender: "user" | "pet";
  text: string;
  spokenText?: string;
  lang?: SupportedLanguage;
  actions?: PetActionItem[];
  timestamp: Date;
  emotion?: PetEmotion;
  workflowResult?: WorkflowState;
}

export function SuperAdminAiPet(): JSX.Element | null {
  const role = useAuthStore((s) => s.role);
  const currentUser = useAuthStore((s) => s.currentUser);
  const setPage = useAppStore((s) => s.setPage);
  const activePage = useAppStore((s) => s.currentPage);
  const currentLang = (useAppStore((s) => s.language) || "kn") as SupportedLanguage;
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

  // Navigation tab inside sanctuary drawer: "chat" vs "tasks"
  const [activeTab, setActiveTab] = useState<"chat" | "tasks">("chat");

  // Pre-Flight Confirmation State before launching background workflow
  const [pendingConfirmation, setPendingConfirmation] = useState<WorkflowParams | null>(null);
  const [confirmationLang, setConfirmationLang] = useState<SupportedLanguage>(() => currentLang);

  // Observable Background Workflow Runner State
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() =>
    superAdminWorkflowRunner.getState()
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Subscribe to background workflow runner
  useEffect(() => {
    const unsub = superAdminWorkflowRunner.subscribe((st) => {
      setWorkflowState(st);
    });
    return unsub;
  }, []);

  // Auto-dismiss on-screen toast notifications after 14 seconds
  useEffect(() => {
    if (workflowState.notifications.length === 0) return;
    const timer = setTimeout(() => {
      const first = workflowState.notifications[0];
      if (first) {
        superAdminWorkflowRunner.dismissNotification(first.id);
      }
    }, 14000);
    return () => clearTimeout(timer);
  }, [workflowState.notifications]);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      sender: "pet",
      text:
        currentLang === "kn"
          ? "ನಮಸ್ಕಾರ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ತಕ್ಷಣ ನಿಮ್ಮ ಪರವಾಗಿ ನಿರ್ವಹಿಸುತ್ತೇನೆ. ಯಾವುದೇ ವ್ಯಕ್ತಿಯ ಜಾತಕ ಗಣನೆ, ೫ ವರದಿಗಳ ಏಕಕಾಲೀನ ಡೌನ್‌ಲೋಡ್ (ಗರಿಷ್ಠ ೧೦ ಹಿನ್ನೆಲೆ ಕಾರ್ಯಗಳು), ಮಾರ್ಕೆಟಿಂಗ್ ಅಥವಾ ಸಿಸ್ಟಮ್ ತಪಾಸಣೆ - ಏನು ಬೇಕಾದರೂ ಆಜ್ಞಾಪಿಸಿ!"
          : currentLang === "hi"
          ? "नमस्ते सुपर एडमिन स्वामी! मैं आपकी सेवा में कामधेनु AI सहायक हूँ। किसी भी व्यक्ति की कुंडली, 5 रिपोर्ट डाउनलोड, मार्केटिंग या सिस्टम स्थिति के बारे में आदेश दें।"
          : currentLang === "te"
          ? "నమస్కారం సూపర్ అడ్మిన్ స్వామి! నేను మీ కామధేను AI అసిస్టెంట్. జాతక విశ్లేషణ, 5 రిపోర్టుల డౌన్‌లోడ్ లేదా మార్కెటింగ్ వ్యూహాలను ఆదేశించండి."
          : currentLang === "ta"
          ? "வணக்கம் சூப்பர் அட்மின் சுவாமி! நான் உங்கள் காமதேனு AI உதவியாளர். ஜாதக கணிப்பு, 5 அறிக்கைகள் பதிவிறக்கம் அல்லது அமைப்பின் நிலையை அறிய உத்தரவிடுங்கள்."
          : "Namaskara Super Admin! I am Kamadhenu, your divine AI companion. I have full autonomous execution access to generate Kundalis, batch download all 5 official reports in the background (up to 10 simultaneous instances), and manage marketing playbooks.",
      spokenText:
        currentLang === "kn"
          ? "ನಮಸ್ಕಾರ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಸ್ವಾಮಿ! ನಾನು ನಿಮ್ಮ ದೈವಿಕ ಕಾಮಧೇನು AI ಸಹಾಯಕ. ನೀವು ಏನು ಆಜ್ಞಾಪಿಸಿದರೂ ನಾನು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ತಕ್ಷಣ ನಿರ್ವಹಿಸುತ್ತೇನೆ."
          : "Namaskara Super Admin! I am Kamadhenu, your divine autonomous companion ready to serve your every command.",
      timestamp: new Date(),
      emotion: "peaceful",
      actions: [
        {
          id: "init_shriram_demo",
          label: {
            kn: "⚡ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (೫ ವರದಿಗಳ ಸ್ವಯಂಚಾಲಿತ ಡೌನ್‌ಲೋಡ್)",
            hi: "⚡ श्रीराम पंडित (5 रिपोर्ट स्वचालित डाउनलोड)",
            te: "⚡ శ్రీరామ్ పండిట్ (5 రిపోర్టుల డౌన్‌లోడ్)",
            ta: "⚡ ஸ்ரீராம் பண்டிதர் (5 அறிக்கைகள்)",
            en: "⚡ Shriram Pandit (Auto 5 Reports Download)"
          },
          icon: "⚡",
          actionType: "custom"
        },
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
    });
    return unsub;
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab, pendingConfirmation]);

  // Handle Voice Recognition (Microphone)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langLocales: Record<SupportedLanguage, string> = {
        kn: "kn-IN",
        hi: "hi-IN",
        te: "te-IN",
        ta: "ta-IN",
        en: "en-IN"
      };
      recognition.lang = langLocales[currentLang] || "kn-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed:", e);
      setIsListening(false);
    }
  };

  const handlePetChange = (type: PetType) => {
    setPetType(type);
    try {
      localStorage.setItem("baggona_pet_type", type);
    } catch {}
    setCurrentEmotion("excited");
    const switchSound =
      type === "kamadhenu"
        ? (currentLang === "kn" ? "ಕಾಮಧೇನು ದೈವಿಕ ಹಸು ಸಕ್ರಿಯವಾಗಿದೆ!" : "Kamadhenu activated!")
        : type === "nandi"
        ? (currentLang === "kn" ? "ನಂದಿ ಮಹಾರಾಜರ ರಕ್ಷಣೆ ಸಕ್ರಿಯವಾಗಿದೆ!" : "Nandi Bull activated!")
        : (currentLang === "kn" ? "ದೈವಿಕ ಶುಕ ಪಕ್ಷಿ ಸಕ್ರಿಯವಾಗಿದೆ!" : "Sacred Shuka activated!");
    if (!isMuted) {
      petSpeechService.speak(switchSound, currentLang);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    petSpeechService.setMuted(nextMuted);
  };

  // Stage confirmation before launching workflow
  const launchWorkflow = (params: WorkflowParams, commandLang?: SupportedLanguage) => {
    const lang = commandLang || currentLang;
    setConfirmationLang(lang);
    setPendingConfirmation(params);
    setActiveTab("chat");

    const nextSlot = superAdminWorkflowRunner.getNextAvailableSlotIndex();
    const knNum = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"][nextSlot] || String(nextSlot);
    
    const askConfirmText =
      lang === "kn"
        ? `📋 **ಸ್ವಾಮಿ, ೫ ಅಧಿಕೃತ ವರದಿಗಳ ಹಿನ್ನೆಲೆ ಡೌನ್‌ಲೋಡ್ ಪೂರ್ವ ಪರಿಶೀಲನೆ (ಕಾಮಧೇನು ${knNum})**\n\nಸ್ವಾಮಿ, ನಾನು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ:\n\n• **ಜಾತಕರ ಹೆಸರು:** ${params.name}\n• **ಜನನ ದಿನಾಂಕ & ಸಮಯ:** ${params.birthDate} | ${params.birthTime}\n• **ಸ್ಥಳ & ಪಿನ್‌ಕೋಡ್:** ${params.city} (PIN: ${params.pincode})\n• **ಅರ್ಚಕರು:** ${params.priestName}\n• **ಪೂಜೆ / ಸೇವೆ:** ${params.poojaName}\n\n📦 **ಡೌನ್‌ಲೋಡ್ ಆಗಲಿರುವ ೫ ಅಧಿಕೃತ ವರದಿಗಳು:**\n1. 📜 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ PDF** (ಲಗ್ನ, ನವಾಂಶ, ಗ್ರಹ ಸ್ಪಷ್ಟ & ಅಷ್ಟಕವರ್ಗ)\n2. 📖 **ಪ್ರೀಮಿಯಂ ದಿವ್ಯ ಭವಿಷ್ಯ V1 PDF** (೧೦-ಅಧ್ಯಾಯ ವಿಸ್ತೃತ ಜೀವನ ಭವಿಷ್ಯ ಮಹಾ ವರದಿ)\n3. 🪔 **ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ ವರದಿ PDF** (ಗೋಕರ್ಣ ಪರಿಹಾರ, ರತ್ನ & ಮಂತ್ರ ಶಾಸ್ತ್ರ)\n4. 🔮 **ಸಮಗ್ರ ದೋಷಗಳು & ಗಂಡಾಂತರ ಸ್ಕ್ಯಾನ್ PDF** (ಕಾಳಸರ್ಪ, ಮಾಂಗಲ್ಯ, ಪಿತೃ ದೋಷ)\n5. 🕉️ **ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ೫-ಪುಟಗಳ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರ PDF** (ಅರ್ಚಕ ${params.priestName} ಅವರ ಸಂಕಲ್ಪ, ಸ್ಕ್ಯಾನಬಲ್ QR ಕೋಡ್, ದೈವಿಕ ರಕ್ಷಣೆ, ಪೂಜಾ ಮಹಾತ್ಮೆ & ವಾರ್ಷಿಕ ಪರಿಹಾರಗಳು)\n\nಸ್ವಾಮಿ, ಈ ಎಲ್ಲಾ ವರದಿಗಳನ್ನು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸಲು ದೃಢೀಕರಿಸುವಿರಾ?`
        : `📋 **Swami, Pre-Download Verification & Confirmation (Kamadhenu ${nextSlot})**\n\nSwami, I have gathered and verified all details for autonomous generation:\n\n• **Devotee Name:** ${params.name}\n• **Birth Date & Time:** ${params.birthDate} at ${params.birthTime}\n• **Place & Pincode:** ${params.city} (PIN: ${params.pincode})\n• **Priest:** ${params.priestName}\n• **Pooja / Seva:** ${params.poojaName}\n\n📦 **5 Official Reports to be Generated & Downloaded:**\n1. 📜 **Baggona Panchanga Birth Kundli PDF** (Lagna, Navamsha, Graha Sphutas, Ashtakavarga)\n2. 📖 **Premium Divya Bhavishya V1 PDF** (10-Chapter Comprehensive Life Predictions)\n3. 🪔 **Daivika Astrological Parihara & Remedial Guidance PDF** (Gokarna Pariharas & Mantras)\n4. 🔮 **Comprehensive Doshas & Gandantara Scan PDF** (Kalasarpa, Manglik, Pitru Dosha)\n5. 🕉️ **Sri Kshetra Gokarna 5-Page Official Ashirvada Patra PDF** (Priest ${params.priestName} Blessings, Sankalpa, Scannable QR Code, Divine Raksha, Pooja Mahatme & Annual Remedies)\n\nSwami, please confirm to begin background generation!`;

    const askConfirmSpoken =
      lang === "kn"
        ? `ಸ್ವಾಮಿ, ${params.city} ಪಿನ್‌ಕೋಡ್ ${params.pincode} ಸ್ಥಳದಲ್ಲಿ ${params.birthDate} ${params.birthTime} ರಂದು ಜನಿಸಿದ ${params.name} ಅವರ ಜಾತಕ ಗಣನೆ, ಅರ್ಚಕ ${params.priestName} ಅವರ ನೇತೃತ್ವದ ${params.poojaName} ಸೇವೆ ಹಾಗೂ ಐದು ಪುಟಗಳ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದ ಪತ್ರ ಸಹಿತ ಒಟ್ಟು ಐದು ಅಧಿಕೃತ ವರದಿಗಳ ಹಿನ್ನೆಲೆ ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿ ಸ್ವಾಮಿ, ತಕ್ಷಣ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸುತ್ತೇನೆ!`
        : `Swami, I have verified all details for ${params.name}, born on ${params.birthDate} at ${params.birthTime} in ${params.city}, pincode ${params.pincode}. With Priest ${params.priestName} for ${params.poojaName}. I am ready to generate all five official reports including the complete five-page Gokarna Ashirvada Patra in the background. Please review and confirm, Swami!`;

    const petMsg: ChatMessage = {
      id: `pet-confirm-prompt-${Date.now()}`,
      sender: "pet",
      text: askConfirmText,
      spokenText: askConfirmSpoken,
      lang,
      timestamp: new Date(),
      emotion: "thinking"
    };

    setMessages((prev) => [...prev, petMsg]);
    setCurrentEmotion("thinking");
    if (!isMuted) petSpeechService.speak(askConfirmSpoken, lang);
  };

  // User confirmed: start in background and immediately close drawer!
  const handleConfirmAndStart = () => {
    if (!pendingConfirmation) return;
    const params = pendingConfirmation;
    const lang = confirmationLang || currentLang;
    try {
      const inst = superAdminWorkflowRunner.startInstance(params);
      setPendingConfirmation(null);

      const knNum = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"][inst.instanceIndex] || String(inst.instanceIndex);
      const startNotice =
        lang === "kn"
          ? `🚀 **${inst.instanceName} ಸಕ್ರಿಯವಾಗಿದೆ!**\n\nಸ್ವಾಮಿ, ${params.name} ಅವರ ಜನ್ಮ ಕುಂಡಲಿ ಹಾಗೂ ೫ ಅಧಿಕೃತ ವರದಿಗಳ (೫-ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ ಸಹಿತ) ಸ್ವಯಂಚಾಲಿತ ಗಣನೆ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ.\n\n📍 ಸ್ಥಳ: ${params.city} (${params.pincode})\n📅 ಜನನ: ${params.birthDate} ${params.birthTime}\n🕉️ ಅರ್ಚಕರು: ${params.priestName}\n🪔 ಪೂಜೆ: ${params.poojaName}\n\nನೀವು ಮುಕ್ತವಾಗಿ ಯಾವುದೇ ಪರದೆಗೆ ಹೋಗಬಹುದು ಅಥವಾ ಇತರ ಕೆಲಸಗಳನ್ನು ಮುಂದುವರಿಸಬಹುದು. ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡ ತಕ್ಷಣ ನೇರವಾಗಿ ನಿಮ್ಮ Downloads ಫೋಲ್ಡರ್‌ಗೆ ಇಳಿಯುತ್ತದೆ!`
          : `🚀 **${inst.instanceName} is Active!**\n\nSwami, autonomous background generation of 5 official reports (including the complete 5-page Ashirvada Patra) for ${params.name} has started.\n\n📍 Place: ${params.city} (${params.pincode})\n📅 Birth: ${params.birthDate} ${params.birthTime}\n🕉️ Priest: ${params.priestName}\n🪔 Pooja: ${params.poojaName}\n\nRunning peacefully in the background. You can navigate freely; reports will download directly to your Downloads folder!`;

      const startSpoken =
        lang === "kn"
          ? `ಧನ್ಯವಾದಗಳು ಸ್ವಾಮಿ! ಕಾಮಧೇನು ${knNum}: ${params.name} ಅವರ ಜಾತಕ ಹಾಗೂ ಐದು ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ ಸಹಿತ ಐದೂ ವರದಿಗಳ ಗಣನೆ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭವಾಗಿದೆ. ನೀವು ಮುಕ್ತವಾಗಿ ನಿಮ್ಮ ಕೆಲಸ ಮುಂದುವರಿಸಿ, ಮುಗಿದ ತಕ್ಷಣ ತಿಳಿಸುತ್ತೇನೆ!`
          : `Thank you Swami! Kamadhenu ${inst.instanceIndex}: Autonomous generation for ${params.name} has started in the background. You can navigate freely; I will notify you once all five reports are downloaded!`;

      const petMsg: ChatMessage = {
        id: `pet-wf-start-${Date.now()}`,
        sender: "pet",
        text: startNotice,
        spokenText: startSpoken,
        lang,
        timestamp: new Date(),
        emotion: "excited"
      };

      setMessages((prev) => [...prev, petMsg]);
      setCurrentEmotion("excited");

      if (!isMuted) {
        petSpeechService.speak(startSpoken, lang);
      }

      // 💥 USER SPECIFICATION: "Once I confirm, it will go off and everything it will handle background."
      setIsOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to start background instance");
    }
  };

  const handleCancelConfirmation = () => {
    const lang = confirmationLang || currentLang;
    setPendingConfirmation(null);
    const cancelMsg: ChatMessage = {
      id: `pet-cancel-${Date.now()}`,
      sender: "pet",
      text:
        lang === "kn"
          ? "ಆಜ್ಞೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ ಸ್ವಾಮಿ. ಬೇರೆ ಯಾವುದೇ ಸೇವೆಗೆ ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ."
          : "Command cancelled, Swami. Ready for your next instruction.",
      lang,
      timestamp: new Date(),
      emotion: "peaceful"
    };
    setMessages((prev) => [...prev, cancelMsg]);
  };

  const handleSend = async (overrideText?: string) => {
    const query = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!query || isProcessing) return;

    // Detect language of the query or explicit instruction (e.g. "in English", "in Kannada", Kannada script, etc.)
    const effectiveLang = detectQueryLanguage(query, currentLang);

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      lang: effectiveLang,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);
    setCurrentEmotion("thinking");

    // 1. CHECK FOR AUTONOMOUS WORKFLOW INSTRUCTION
    const wfCheck = parseWorkflowInstruction(query, effectiveLang);
    if (wfCheck.isWorkflow) {
      setIsProcessing(false);
      if (wfCheck.missingFields && wfCheck.missingFields.length > 0) {
        const text =
          wfCheck.questionPrompt ||
          (effectiveLang === "kn"
            ? "ಸ್ವಾಮಿ, ಜಾತಕರ ಜನನ ದಿನಾಂಕ ಅಥವಾ ಸಮಯ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಹೆಸರು, ದಿನಾಂಕ ಮತ್ತು ಸಮಯವನ್ನು ತಿಳಿಸಿ."
            : "Swami, please provide the devotee's Name, Date of Birth, and Time of Birth so I can generate all 5 reports.");
        const petMsg: ChatMessage = {
          id: `pet-wf-q-${Date.now()}`,
          sender: "pet",
          text,
          spokenText: text,
          lang: effectiveLang,
          timestamp: new Date(),
          emotion: "alert"
        };
        setMessages((prev) => [...prev, petMsg]);
        setCurrentEmotion("alert");
        if (!isMuted) petSpeechService.speak(text, effectiveLang);
        return;
      }

      if (wfCheck.params) {
        launchWorkflow(wfCheck.params, effectiveLang);
        return;
      }
    }

    // 2. STANDARD SUPER ADMIN PET QUERIES (Bhavishya predictions, All 32 Pages Navigation, Revenue, Marketing, Diagnostics)
    try {
      const resp = await executeSuperAdminPetQuery(query, {
        activePage,
        currentKundliSession,
        coinBalance: wallet?.coinBalance,
        currentUser,
        geminiApiKey,
        selectedLanguage: effectiveLang
      });

      const localizedText = resp.text[effectiveLang] || resp.text[currentLang] || resp.text.kn || resp.text.en;
      const localizedSpoken = resp.spokenText[effectiveLang] || resp.spokenText[currentLang] || resp.spokenText.kn || resp.spokenText.en;

      const petMsg: ChatMessage = {
        id: `pet-${Date.now()}`,
        sender: "pet",
        text: localizedText,
        spokenText: localizedSpoken,
        lang: effectiveLang,
        actions: resp.actions,
        timestamp: new Date(),
        emotion: resp.emotion
      };

      setMessages((prev) => [...prev, petMsg]);
      setCurrentEmotion(resp.emotion);

      if (!isMuted) {
        petSpeechService.speak(localizedSpoken, effectiveLang);
      }

      // Google Assistant-like Auto-Redirection throughout Panchanga:
      // If the query was an explicit command to navigate/redirect to a page and the engine returned a target page
      if (
        resp.category === "navigation" &&
        resp.actions.length === 1 &&
        resp.actions[0].targetPage &&
        (
          query.toLowerCase().includes("redirect") ||
          query.toLowerCase().includes("go to") ||
          query.toLowerCase().includes("take me") ||
          query.toLowerCase().includes("open") ||
          query.toLowerCase().includes("navigate") ||
          query.toLowerCase().includes("ತೆರೆ") ||
          query.toLowerCase().includes("ಹೋಗು") ||
          query.toLowerCase().includes("ಕರ್ಕೊಂಡು ಹೋಗು") ||
          query.toLowerCase().includes("ಕರೆದುಕೊಂಡು ಹೋಗು") ||
          query.toLowerCase().includes("खोलो") ||
          query.toLowerCase().includes("चलो")
        )
      ) {
        setPage(resp.actions[0].targetPage);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Pet execution error:", err);
      const fallbackMsg: ChatMessage = {
        id: `pet-err-${Date.now()}`,
        sender: "pet",
        text:
          effectiveLang === "kn"
            ? "ಕ್ಷಮಿಸಿ ಸ್ವಾಮಿ, ಗಣನೆಯಲ್ಲಿ ಸಣ್ಣ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಆಜ್ಞಾಪಿಸಿ."
            : "Apologies Swami, a brief calculation issue occurred. Please command me again.",
        lang: effectiveLang,
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
    if (action.id === "init_shriram_demo") {
      const demoCommand =
        currentLang === "kn"
          ? "ಹಾಯ್ ಕಾಮಧೇನು, ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಎಂಬ ವ್ಯಕ್ತಿಯಿದ್ದಾರೆ, ಅವರು 31 May 1993 ರಂದು ಬೆಳಿಗ್ಗೆ 9:20 AM ಕ್ಕೆ ಬೆಂಗಳೂರಿನಲ್ಲಿ ಜನಿಸಿದ್ದಾರೆ. ಬೆಂಗಳೂರು ಪಿನ್‌ಕೋಡ್ ಪಡೆದು ಜಾತಕ ಸಿದ್ಧಪಡಿಸು. ನಂತರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಕುಂಡಲಿ, ಪ್ರೀಮಿಯಂ PDF V1, ದೈವಿಕ ಪರಿಹಾರ, ದೋಷಗಳು ಮತ್ತು ಸೇವಾ ಪತ್ರ ಡೌನ್‌ಲೋಡ್ ಮಾಡು. ಅರ್ಚಕರ ಹೆಸರು ಚೈತನ್ಯ ಪಂಡಿತ್, ಪೂಜೆ ಮೋಕ್ಷ ನಾರಾಯಣ ಬಲಿ ಹಾಗೂ ತ್ರಿಪಿಂಡಿ."
          : "Hi Kamadhenu, there is a person Shriram Pandit, he born on 31 May 1993 at 9:20 AM in Bengaluru, so get the Bengaluru pin code, add it in, and generate a Kundali for this particular user. After generating it, download Baggona Panchanga Kundali, and also download Premium PDF V1, download Daivika Parihara, download Doshagalu, and also download Seva Patra. The priest name is Chaitanya Pandit, use that priest name, Pooja is Moksha Narayana Bali and Tripindi, and the place is Bangalore, take the Bangalore pincode, and download these reports, and once done let me know.";
      handleSend(demoCommand);
      return;
    }

    if (action.targetPage) {
      setPage(action.targetPage);
      setIsOpen(false);
      const confirmSpeech =
        currentLang === "kn"
          ? `${action.label.kn || action.label.en} ಪುಟಕ್ಕೆ ತೆರಳಲಾಗಿದೆ ಸ್ವಾಮಿ.`
          : `Navigating to ${action.label.en || action.label.kn}, Swami.`;
      if (!isMuted) {
        petSpeechService.speak(confirmSpeech, currentLang);
      }
      return;
    }

    if (action.actionType === "run_diagnostic") {
      handleSend("ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮಾಡು (Check System Health)");
      return;
    }

    const q = action.label[currentLang] || action.label.en || action.label.kn;
    handleSend(q);
  };

  const repeatSpeech = (text?: string, msgLang?: SupportedLanguage) => {
    if (!text) return;
    petSpeechService.speak(text, msgLang || currentLang);
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
      {/* 🌟 SCREEN-WIDE FLOATING ON-SCREEN TOAST NOTIFICATIONS (WORKS ACROSS ENTIRE APP) */}
      {workflowState.notifications.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
          aria-live="polite"
        >
          {workflowState.notifications.map((notif) => (
            <div
              key={notif.id}
              className="pointer-events-auto flex flex-col gap-2 rounded-2xl border-2 border-emerald-500 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md text-slate-900 animate-slide-up"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-black text-xs shrink-0">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-emerald-950">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {notif.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => superAdminWorkflowRunner.dismissNotification(notif.id)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 leading-none"
                  title="ಮುಚ್ಚು / Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-snug">{notif.message}</p>
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-100">
                {notif.zipBlob && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerBrowserDownload(
                        notif.zipBlob!,
                        notif.zipFileName || `Baggona_${notif.devoteeName}_Reports.zip`
                      );
                    }}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 shadow-xs transition-colors"
                  >
                    <span>📦</span>
                    <span>ZIP ಮರು-ಡೌನ್‌ಲೋಡ್</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("tasks");
                    setIsOpen(true);
                    superAdminWorkflowRunner.dismissNotification(notif.id);
                  }}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-2.5 py-1.5 transition-colors"
                >
                  <span>ವಿವರಗಳು (Tasks)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 DISCREET, SMALLER FLOATING PET COMPANION (Mobile & Desktop) */}
      <div
        className="fixed bottom-20 right-3.5 md:bottom-5 md:right-5 z-40 flex flex-col items-end select-none pointer-events-auto"
        aria-label="Super Admin AI Pet Companion"
      >
        <div className="relative group flex items-center gap-2">
          {/* Active Background Workflow Progress Pill */}
          {workflowState.activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("tasks");
                setIsOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-950/95 px-2.5 py-1 text-[11px] font-bold text-amber-300 shadow-xl backdrop-blur-md transition-all hover:bg-amber-900 active:scale-95"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>⚡ {workflowState.activeCount} ಚಾಲನೆಯಲ್ಲಿದೆ</span>
              <span className="hidden sm:inline text-[10px] text-amber-200/90 font-medium">
                (ಕ್ಲಿಕ್ ಮಾಡಿ ನೋಡಿ)
              </span>
            </button>
          )}

          {/* Sleek 44px Round Floating Avatar Button */}
          <div className="relative">
            {/* Animated Circular SVG Progress Ring when active */}
            {workflowState.activeCount > 0 && (
              <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
            )}

            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-amber-400/90 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-400 shadow-xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden ring-1 ring-amber-500/40"
              title="Super Admin AI Companion Pet (ಕಾಮಧೇನು) - Click to talk or command"
            >
              {/* Animated Pet SVG Illustration */}
              <PetIllustration type={petType} emotion={currentEmotion} isSpeaking={isSpeaking} />

              {/* Speaking Sound Waves Indicator */}
              {isSpeaking && (
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white font-bold animate-ping">
                  🔊
                </span>
              )}

              {/* Super Admin Crown Badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-950 border border-amber-300 text-[9px] shadow-sm">
                👑
              </span>

              {/* Active Jobs Counter Badge */}
              {workflowState.activeCount > 0 && (
                <span className="absolute -bottom-1 -left-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-600 border border-emerald-300 text-[9px] font-black text-white shadow-sm">
                  {workflowState.activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🏛️ SUPER ADMIN DIVINE PET SANCTUARY (DRAWER / BOTTOM SHEET / MODAL) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          {/* Main Pet Container */}
          <div className="relative flex flex-col h-[92vh] sm:h-[680px] w-full max-w-xl rounded-t-3xl sm:rounded-3xl border-2 border-amber-500/50 bg-[#FFFDF9] text-slate-900 shadow-2xl overflow-hidden animate-slide-up">
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
                    {workflowState.activeCount > 0
                      ? `⚡ ${workflowState.activeCount} ಕಾರ್ಯಗಳು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿವೆ (${workflowState.instances.length}/10)`
                      : isSpeaking
                      ? "🗣️ ಮಾತನಾಡುತ್ತಿದೆ (Speaking aloud...)"
                      : currentEmotion === "thinking"
                      ? "✨ ಜ್ಯೋತಿಷ ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..."
                      : "🙏 ನಿಮ್ಮ ಆಜ್ಞೆಗೆ ಸದಾ ಸಿದ್ಧ (At Your Command)"}
                  </p>
                </div>
              </div>

              {/* Header Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Voice Mute / Unmute Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className={`p-1.5 rounded-full text-xs transition-colors ${
                    isMuted
                      ? "bg-rose-900/40 text-rose-200 border border-rose-300"
                      : "bg-indigo-950/20 text-indigo-950 hover:bg-indigo-950/30"
                  }`}
                  title={isMuted ? "ಧ್ವನಿ ಆನ್ ಮಾಡಿ (Unmute)" : "ಧ್ವನಿ ಮ್ಯೂಟ್ ಮಾಡಿ (Mute)"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>

                {/* Close Drawer Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-indigo-950/20 p-1.5 text-indigo-950 hover:bg-indigo-950/30 transition-colors leading-none font-bold text-sm"
                  title="ಮುಚ್ಚು (Minimize to background)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs: Chat vs Task Manager Fleet */}
            <div className="flex items-center justify-between border-b border-amber-300 bg-amber-100/70 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "chat"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span>💬</span>
                  <span>{currentLang === "kn" ? "ಸಂಭಾಷಣೆ (Chat)" : "Chat"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "tasks"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span>⚡</span>
                  <span>{currentLang === "kn" ? "ಕಾರ್ಯ ನಿರ್ವಾಹಕ (Tasks)" : "Fleet Tasks"}</span>
                  {workflowState.activeCount > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-white animate-pulse">
                      {workflowState.activeCount}
                    </span>
                  )}
                  {workflowState.instances.length > 0 && workflowState.activeCount === 0 && (
                    <span className="rounded-full bg-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                      {workflowState.instances.length}/10
                    </span>
                  )}
                </button>
              </div>

              {/* Pet Companion Avatar Selector */}
              <div className="flex items-center gap-1">
                {(["kamadhenu", "nandi", "shuka"] as PetType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePetChange(type)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                      petType === type
                        ? "bg-amber-800 text-white shadow-xs"
                        : "bg-amber-200/60 text-amber-950 hover:bg-amber-200"
                    }`}
                  >
                    {type === "kamadhenu" ? "🐄" : type === "nandi" ? "🐂" : "🦜"}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: CHAT & VOICE INTERFACE */}
            {activeTab === "chat" && (
              <>
                {/* Quick Action Suggestion Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-amber-200/40 bg-white/80 px-3 py-2 text-xs scrollbar-none">
                  <button
                    type="button"
                    onClick={() =>
                      handleActionClick({
                        id: "init_shriram_demo",
                        label: {
                          kn: "⚡ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
                          hi: "⚡ श्रीराम पंडित",
                          te: "⚡ శ్రీరామ్ పండిట్",
                          ta: "⚡ ஸ்ரீராம் பண்டிதர்",
                          en: "⚡ Shriram Pandit"
                        },
                        icon: "⚡",
                        actionType: "custom"
                      })
                    }
                    className="flex items-center gap-1 rounded-xl border border-emerald-500 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-950 hover:bg-emerald-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                  >
                    <span>🚀</span>
                    <span>ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (೫ ವರದಿಗಳು)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ಹಣ ಗಳಿಸುವುದು ಹೇಗೆ? (How to earn money)")}
                    className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                  >
                    <span>💰</span>
                    <span>ಆದಾಯ ಯೋಜನೆ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು (Marketing strategy)")}
                    className="flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                  >
                    <span>📢</span>
                    <span>ಮಾರ್ಕೆಟಿಂಗ್</span>
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
                      <div className="flex items-start gap-2 max-w-[90%] sm:max-w-[85%]">
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

                          {/* WORKFLOW DOWNLOAD BUTTONS (If generated reports available) */}
                          {msg.workflowResult?.reports && msg.workflowResult.reports.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2">
                              <div className="text-[11px] font-bold text-emerald-950 flex items-center justify-between">
                                <span>📥 ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಸಿದ್ಧವಿರುವ ವರದಿಗಳು:</span>
                                <span className="text-[10px] text-emerald-700">
                                  {msg.workflowResult.reports.length} Reports
                                </span>
                              </div>

                              {/* Individual Download Chips */}
                              <div className="flex flex-wrap gap-1.5">
                                {msg.workflowResult.reports.map((rep) => (
                                  <button
                                    key={rep.id}
                                    type="button"
                                    onClick={() => {
                                      if (rep.blob) triggerBrowserDownload(rep.blob, rep.fileName);
                                    }}
                                    className="flex items-center gap-1 rounded-lg border border-emerald-400 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-950 hover:bg-emerald-100 transition-colors shadow-2xs"
                                  >
                                    <span>📄</span>
                                    <span className="truncate max-w-[150px]">{rep.title}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Unified ZIP Download Button */}
                              {msg.workflowResult.zipBlob && msg.workflowResult.zipFileName && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerBrowserDownload(
                                      msg.workflowResult!.zipBlob!,
                                      msg.workflowResult!.zipFileName!
                                    );
                                  }}
                                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 p-2 text-xs font-black text-white shadow-md transition-all active:scale-95"
                                >
                                  <span>📦</span>
                                  <span>ಎಲ್ಲಾ ೫ ವರದಿಗಳ ZIP ಬಂಡಲ್ ಡೌನ್‌ಲೋಡ್ (All 5 Reports .ZIP)</span>
                                </button>
                              )}
                            </div>
                          )}

                          {/* Repeat Voice Button for Pet Messages */}
                          {msg.sender === "pet" && (
                            <div className="mt-2.5 flex items-center justify-between border-t border-amber-100 pt-2 text-[11px] text-amber-900">
                              <button
                                type="button"
                                onClick={() => repeatSpeech(msg.spokenText || msg.text, msg.lang)}
                                className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 transition-colors"
                              >
                                <span>🔊</span>
                                <span>{msg.lang === "kn" ? "ಧ್ವನಿ ಕೇಳಿ (Speak again)" : "Speak again (🔊)"}</span>
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

                  {/* 📋 PRE-FLIGHT CONFIRMATION PREVIEW CARD */}
                  {pendingConfirmation && (
                    <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-50 via-white to-amber-100/60 p-4 shadow-xl text-slate-900 animate-slide-up">
                      <div className="flex items-center justify-between border-b border-amber-300 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📋</span>
                          <div>
                            <h4 className="font-serif font-black text-sm text-amber-950">
                              {confirmationLang === "kn" ? "ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ (Pre-Download Confirmation)" : "Pre-Download Confirmation Required"}
                            </h4>
                            <span className="text-[10px] text-amber-800 font-bold">
                              {confirmationLang === "kn"
                                ? `ನಿಯೋಜನೆ: ಕಾಮಧೇನು ${["೦","೧","೨","೩","೪","೫","೬","೭","೮","೯","೧೦"][superAdminWorkflowRunner.getNextAvailableSlotIndex()] || superAdminWorkflowRunner.getNextAvailableSlotIndex()} (ಸ್ಲಾಟ್)`
                                : `Slot: Kamadhenu ${superAdminWorkflowRunner.getNextAvailableSlotIndex()}`}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          5 Reports (Inc. 5-Page Ashirvada)
                        </span>
                      </div>

                      {/* Parsed Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white/90 p-2.5 rounded-xl border border-amber-200 mb-3 shadow-inner">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಜಾತಕರ ಹೆಸರು (Name):" : "Devotee Name:"}
                          </span>
                          <span className="font-black text-indigo-950 text-xs sm:text-sm">{pendingConfirmation.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಜನನ ವಿವರ (DOB & TOB):" : "Birth (DOB & TOB):"}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {pendingConfirmation.birthDate} | {pendingConfirmation.birthTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಸ್ಥಳ & ಪಿನ್‌ಕೋಡ್ (Place & PIN):" : "Place & PIN:"}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {pendingConfirmation.city} ({pendingConfirmation.pincode})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಅರ್ಚಕರು & ಪೂಜೆ (Priest & Pooja):" : "Priest & Pooja:"}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px] truncate block" title={`${pendingConfirmation.priestName} - ${pendingConfirmation.poojaName}`}>
                            {pendingConfirmation.priestName} ({pendingConfirmation.poojaName})
                          </span>
                        </div>
                      </div>

                      {/* 5 Official Reports Included */}
                      <div className="text-[11px] text-slate-700 bg-amber-100/50 p-2.5 rounded-xl mb-3 border border-amber-200/80">
                        <span className="font-bold text-amber-950 block mb-1">
                          {confirmationLang === "kn" ? "📦 ಮುದ್ರಿಸಲ್ಪಡುವ ೫ ಅಧಿಕೃತ ವರದಿಗಳು:" : "📦 5 Official Reports to be Generated & Downloaded:"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                          <span>📜 1. {confirmationLang === "kn" ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ" : "Baggona Panchanga Birth Kundli"}</span>
                          <span>📖 2. {confirmationLang === "kn" ? "ಪ್ರೀಮಿಯಂ ದಿವ್ಯ ಭವಿಷ್ಯ V1 (೧೦-ಅಧ್ಯಾಯ)" : "Premium Divya Bhavishya V1 (10-Chapter)"}</span>
                          <span>🪔 3. {confirmationLang === "kn" ? "ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ ವರದಿ" : "Daivika Parihara Remedial Guidance"}</span>
                          <span>🔮 4. {confirmationLang === "kn" ? "ಸಮಗ್ರ ದೋಷಗಳು & ಗಂಡಾಂತರ ಸ್ಕ್ಯಾನ್" : "Comprehensive Doshas & Gandantara Scan"}</span>
                          <span className="sm:col-span-2 font-bold text-amber-950">
                            🕉️ 5. {confirmationLang === "kn"
                              ? `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ೫-ಪುಟಗಳ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರ (${pendingConfirmation.priestName} ಅರ್ಚಕರ ಆಶೀರ್ವಾದ, ಸಂಕಲ್ಪ, QR ಕೋಡ್, ದೈವಿಕ ರಕ್ಷಣೆ & ವಾರ್ಷಿಕ ಪರಿಹಾರಗಳು)`
                              : `Sri Kshetra Gokarna 5-Page Official Ashirvada Patra (Priest ${pendingConfirmation.priestName} Blessings, Sankalpa, Scannable QR Code, Divine Raksha, Pooja Mahatme & Annual Remedies)`}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-amber-900 font-medium mb-3 italic">
                        💡 {confirmationLang === "kn"
                          ? "ಖಚಿತಪಡಿಸಿದ ತಕ್ಷಣ ಈ ವಿಂಡೋ ಮುಚ್ಚಲ್ಪಡುತ್ತದೆ ಮತ್ತು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಗಣನೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. ನೀವು ಮುಕ್ತವಾಗಿ ಪರದೆಯಲ್ಲಿ ಯಾವುದೇ ಕಾರ್ಯ ನಿರ್ವಹಿಸಬಹುದು."
                          : "Once confirmed, this window closes and everything runs in the background. You can freely use any screen."}
                      </p>

                      {/* Confirmation Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleConfirmAndStart}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs py-2.5 shadow-md transition-all active:scale-95"
                        >
                          <span>✅</span>
                          <span>{confirmationLang === "kn" ? "ಖಚಿತಪಡಿಸಿ & ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸಿ" : "Confirm & Start in Background"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelConfirmation}
                          className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 transition-all active:scale-95"
                        >
                          <span>❌ {confirmationLang === "kn" ? "ರದ್ದು" : "Cancel"}</span>
                        </button>
                      </div>
                    </div>
                  )}

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
                        currentLang === "kn"
                          ? "ಆಜ್ಞೆ ನೀಡಿ: ಉದಾ. 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ 31 May 1993, 9:20 AM ಬೆಂಗಳೂರು ಜಾತಕ ಸಿದ್ಧಪಡಿಸಿ ೫ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡು'..."
                          : "Command me: e.g. 'Generate Kundali for Shriram Pandit, born 31 May 1993, 9:20 AM Bengaluru and download 5 reports'..."
                      }
                      className="flex-1 rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden"
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
              </>
            )}

            {/* TAB 2: TASK MANAGER / FLEET MONITOR SCREEN (UP TO 10 INSTANCES) */}
            {activeTab === "tasks" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-white to-[#FFFBF0]">
                {/* Fleet Overview Bar */}
                <div className="flex items-center justify-between border-b border-amber-200/80 bg-amber-50/60 px-4 py-2 text-xs">
                  <div>
                    <h4 className="font-bold text-amber-950">
                      {currentLang === "kn" ? "ದೈವಿಕ ಕಾಮಧೇನು ಕಾರ್ಯ ಫ್ಲೀಟ್" : "Divine Kamadhenu Fleet"}
                    </h4>
                    <p className="text-[10px] text-amber-800">
                      {currentLang === "kn"
                        ? "ಏಕಕಾಲದಲ್ಲಿ ಗರಿಷ್ಠ ೧೦ ಹಿನ್ನೆಲೆ ಕಾರ್ಯಗಳು (Max 10 Simultaneous Background Instances)"
                        : "Up to 10 concurrent background instances"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                      ⚡ {workflowState.activeCount} ಚಾಲನೆ
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {workflowState.instances.length}/10 ಒಟ್ಟು
                    </span>
                  </div>
                </div>

                {/* Instance List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {workflowState.instances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500 space-y-3">
                      <span className="text-4xl">⚡</span>
                      <h4 className="font-bold text-slate-700 text-sm">ಯಾವುದೇ ಹಿನ್ನೆಲೆ ಕಾರ್ಯಗಳು ಚಾಲನೆಯಲ್ಲಿಲ್ಲ</h4>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        ಹೊಸ ಜಾತಕ ಮತ್ತು ೫ ವರದಿಗಳ ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು 'ಸಂಭಾಷಣೆ' (Chat) ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಆಜ್ಞೆ ನೀಡಿ (ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್...). ಗರಿಷ್ಠ ೧೦ ಕಾರ್ಯಗಳನ್ನು ಏಕಕಾಲದಲ್ಲಿ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಚಲಾಯಿಸಬಹುದು.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("chat");
                          handleActionClick({
                            id: "init_shriram_demo",
                            label: {
                              kn: "⚡ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
                              hi: "⚡ श्रीराम पंडित",
                              te: "⚡ శ్రీరామ్ పండిట్",
                              ta: "⚡ ஸ்ரீராம் பண்டிதர்",
                              en: "⚡ Shriram Pandit"
                            },
                            icon: "⚡",
                            actionType: "custom"
                          });
                        }}
                        className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 shadow-xs transition-colors"
                      >
                        🚀 ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ
                      </button>
                    </div>
                  ) : (
                    workflowState.instances.map((inst) => (
                      <div
                        key={inst.instanceId}
                        className="rounded-2xl border border-amber-300/80 bg-white p-3.5 shadow-sm space-y-2.5"
                      >
                        {/* Top Row: Name and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-indigo-950 px-2 py-0.5 text-[11px] font-black text-amber-300">
                              #{inst.instanceIndex}
                            </span>
                            <div>
                              <h4 className="font-serif font-bold text-sm text-slate-900">{inst.instanceName}</h4>
                              <p className="text-[10px] text-slate-500">
                                {inst.params.birthDate} {inst.params.birthTime} • {inst.params.city} ({inst.params.pincode})
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1 ${
                              inst.status === "running"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : inst.status === "completed"
                                ? "bg-teal-100 text-teal-800 border border-teal-300"
                                : inst.status === "cancelled"
                                ? "bg-slate-200 text-slate-700 border border-slate-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {inst.status === "running" && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                            )}
                            {inst.status === "running"
                              ? "ಚಾಲನೆಯಲ್ಲಿದೆ (Running)"
                              : inst.status === "completed"
                              ? "ಪೂರ್ಣಗೊಂಡಿದೆ (Completed)"
                              : inst.status === "cancelled"
                              ? "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Cancelled)"
                              : "ದೋಷ (Error)"}
                          </span>
                        </div>

                        {/* Progress Bar & Details */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 truncate max-w-[280px]">
                              {inst.stepTitle}
                            </span>
                            <span className="font-mono font-bold text-amber-800">{inst.progressPercent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <div
                              className={`h-full transition-all duration-300 ease-out ${
                                inst.status === "running"
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                  : inst.status === "completed"
                                  ? "bg-teal-600"
                                  : inst.status === "cancelled"
                                  ? "bg-slate-400"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${inst.progressPercent}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{inst.stepDetail}</p>
                        </div>

                        {/* Controls / Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          {/* If running -> Prominent KILL JOB Button */}
                          {inst.status === "running" && (
                            <button
                              type="button"
                              onClick={() => superAdminWorkflowRunner.killJob(inst.instanceId)}
                              className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-black text-xs px-3 py-1.5 transition-colors shadow-2xs active:scale-95"
                              title="ಈ ಕಾರ್ಯವನ್ನು ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ / Kill this job immediately"
                            >
                              <span>🛑</span>
                              <span>ಕಾರ್ಯ ನಿಲ್ಲಿಸಿ (Kill Job)</span>
                            </button>
                          )}

                          {/* If completed -> ZIP & Reports download */}
                          {inst.status === "completed" && (
                            <div className="flex flex-wrap items-center gap-1.5 w-full">
                              {inst.zipBlob && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerBrowserDownload(
                                      inst.zipBlob!,
                                      inst.zipFileName || `Baggona_${inst.params.name}_Reports.zip`
                                    );
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs py-1.5 shadow-xs transition-colors"
                                >
                                  <span>📦</span>
                                  <span>ZIP ಡೌನ್‌ಲೋಡ್ (All 5 Reports)</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => superAdminWorkflowRunner.clearJob(inst.instanceId)}
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 font-medium text-xs px-2.5 py-1.5 transition-colors"
                                title="ತೆರವುಗೊಳಿಸಿ / Clear"
                              >
                                🗑️
                              </button>
                            </div>
                          )}

                          {/* Individual report chips if completed */}
                          {inst.status === "completed" && inst.reports.length > 0 && (
                            <div className="flex flex-wrap gap-1 w-full pt-1">
                              {inst.reports.map((r) => (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => {
                                    if (r.blob) triggerBrowserDownload(r.blob, r.fileName);
                                  }}
                                  className="flex items-center gap-1 rounded-lg border border-teal-300 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-900 hover:bg-teal-100"
                                >
                                  <span>📄</span>
                                  <span className="truncate max-w-[120px]">{r.title}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* If cancelled or error */}
                          {(inst.status === "cancelled" || inst.status === "error") && (
                            <div className="flex items-center justify-between w-full">
                              <button
                                type="button"
                                onClick={() => {
                                  superAdminWorkflowRunner.clearJob(inst.instanceId);
                                  setPendingConfirmation(inst.params);
                                  setActiveTab("chat");
                                }}
                                className="flex items-center gap-1 rounded-xl border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1.5 transition-colors"
                              >
                                <span>🔄</span>
                                <span>ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => superAdminWorkflowRunner.clearJob(inst.instanceId)}
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 font-medium text-xs px-3 py-1.5 transition-colors"
                              >
                                🗑️ ತೆರವು (Clear)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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
        <circle cx="50" cy="50" r="46" fill="#FFF9EB" stroke="#D97706" strokeWidth="2.5" />
        <path d="M 28 35 Q 20 15 32 12 Q 35 25 36 34" fill="#92400E" />
        <path d="M 72 35 Q 80 15 68 12 Q 65 25 64 34" fill="#92400E" />
        <path d="M 45 18 A 6 6 0 0 0 55 18 A 4 4 0 0 1 45 18" fill="#F59E0B" />
        <ellipse cx="50" cy="56" rx="26" ry="24" fill="#FEF3C7" />
        <ellipse cx="50" cy="68" rx="16" ry="12" fill="#FDE68A" />
        <circle cx="44" cy="68" r="2.5" fill="#78350F" />
        <circle cx="56" cy="68" r="2.5" fill="#78350F" />
        <path
          d={isSpeaking ? "M 44 74 Q 50 80 56 74" : "M 46 73 Q 50 75 54 73"}
          stroke="#78350F"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="38" cy="48" r="3.5" fill="#1E293B" />
        <circle cx="62" cy="48" r="3.5" fill="#1E293B" />
        <path d="M 50 36 Q 47 43 50 45 Q 53 43 50 36" fill="#DC2626" />
      </svg>
    );
  }

  if (type === "shuka") {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#ECFDF5" stroke="#059669" strokeWidth="2.5" />
        <path d="M 46 22 Q 50 12 54 18 Q 50 25 46 22" fill="#10B981" />
        <path d="M 50 20 Q 56 10 60 16 Q 54 24 50 20" fill="#047857" />
        <circle cx="50" cy="52" r="25" fill="#34D399" />
        <circle cx="40" cy="68" r="2" fill="#F8FAFC" />
        <circle cx="46" cy="71" r="2.5" fill="#F8FAFC" />
        <circle cx="54" cy="71" r="2.5" fill="#F8FAFC" />
        <circle cx="60" cy="68" r="2" fill="#F8FAFC" />
        <circle cx="42" cy="44" r="4" fill="#FFFFFF" />
        <circle cx="43" cy="44" r="2.5" fill="#0F172A" />
        <circle cx="58" cy="44" r="4" fill="#FFFFFF" />
        <circle cx="57" cy="44" r="2.5" fill="#0F172A" />
        <path
          d={isSpeaking ? "M 46 50 Q 50 64 54 50" : "M 46 50 Q 50 60 54 50"}
          fill="#DC2626"
        />
      </svg>
    );
  }

  // Default: Kamadhenu Sacred Cow
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="46" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2.5" />
      <path d="M 30 38 Q 20 20 30 14 Q 35 25 36 34" fill="#B45309" />
      <path d="M 70 38 Q 80 20 70 14 Q 65 25 64 34" fill="#B45309" />
      <ellipse cx="24" cy="46" rx="8" ry="12" fill="#FDE68A" transform="rotate(-20 24 46)" />
      <ellipse cx="76" cy="46" rx="8" ry="12" fill="#FDE68A" transform="rotate(20 76 46)" />
      <ellipse cx="50" cy="54" rx="25" ry="22" fill="#FEF3C7" />
      <ellipse cx="50" cy="67" rx="15" ry="11" fill="#FDE68A" />
      <circle cx="45" cy="67" r="2" fill="#78350F" />
      <circle cx="55" cy="67" r="2" fill="#78350F" />
      <path
        d={isSpeaking ? "M 45 73 Q 50 78 55 73" : "M 46 72 Q 50 74 54 72"}
        stroke="#78350F"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="39" cy="48" r="3.5" fill="#0F172A" />
      <circle cx="61" cy="48" r="3.5" fill="#0F172A" />
      <circle cx="40" cy="47" r="1" fill="#FFFFFF" />
      <circle cx="62" cy="47" r="1" fill="#FFFFFF" />
      <path d="M 50 36 Q 47 43 50 45 Q 53 43 50 36" fill="#DC2626" />
      <path d="M 45 40 Q 50 38 55 40" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <path d="M 44 42 Q 50 40 56 42" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <circle cx="32" cy="58" r="2" fill="#F59E0B" />
      <circle cx="68" cy="58" r="2" fill="#F59E0B" />
    </svg>
  );
}
