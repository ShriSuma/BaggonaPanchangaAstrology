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
  type PetActionItem,
  type ActiveProfileContext
} from "../../services/superAdminPetEngine";
import {
  superAdminWorkflowRunner,
  parseWorkflowInstruction,
  triggerBrowserDownload,
  isConfirmationAffirmative,
  isConfirmationCancellation,
  isConfirmationModification,
  modifyPendingWorkflow,
  type WorkflowState,
  type WorkflowParams
} from "../../services/superAdminWorkflowRunner";
import {
  harvestAmbientKundliContext,
  type AmbientKundliProfile
} from "../../services/ambientKundliHarvester";
import { parseWhatsAppKundliText, type ParsedWhatsAppKundli } from "../../services/whatsAppKundliParser";
import { useDevoteeHistoryStore, type DevoteeRecord } from "../../stores/devoteeHistoryStore";

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
  mode?: "text" | "voice";
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

  // Navigation tab inside sanctuary drawer: "chat" vs "voice" vs "history" vs "tasks"
  const [activeTab, setActiveTab] = useState<"chat" | "voice" | "history" | "tasks">("chat");

  // Interactive Live Voice Conversation Mode State (Hands-Free Duplex)
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [lastSpokenAnswer, setLastSpokenAnswer] = useState<string>("");
  const [isVoiceTranscriptExpanded, setIsVoiceTranscriptExpanded] = useState<boolean>(false);

  const isVoiceModeRef = useRef<boolean>(false);
  const isMicMutedRef = useRef<boolean>(false);
  const isAssistantSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const startListeningRef = useRef<() => void>(() => {});
  const safeStopListeningRef = useRef<() => void>(() => {});

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    isAssistantSpeakingRef.current = isAssistantSpeaking;
  }, [isAssistantSpeaking]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    const unsub = petSpeechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
      setIsAssistantSpeaking(speaking);
      isAssistantSpeakingRef.current = speaking;
    });
    return unsub;
  }, []);

  // Pre-Flight Confirmation State before launching background workflow
  const [pendingConfirmation, setPendingConfirmation] = useState<WorkflowParams | null>(null);
  const [confirmationLang, setConfirmationLang] = useState<SupportedLanguage>(() => currentLang);

  // Ambient Kundli Context Harvester (Reads the room across store, localStorage, and DOM)
  const ambientProfile = useMemo(() => {
    return harvestAmbientKundliContext(currentKundliSession);
  }, [currentKundliSession, activePage, isOpen]);

  // Devotee Profile Memory for continuous multi-turn live conversation & advisory
  const [activeProfile, setActiveProfile] = useState<ActiveProfileContext | null>(null);

  // Synchronize active profile from ambient context whenever available
  useEffect(() => {
    if (ambientProfile.hasData) {
      setActiveProfile({
        name: ambientProfile.name,
        birthDate: ambientProfile.birthDate,
        birthTime: ambientProfile.birthTime,
        city: ambientProfile.city,
        pincode: ambientProfile.pincode,
        kundli: ambientProfile.kundli,
        dasha: ambientProfile.dasha
      });
    }
  }, [ambientProfile]);

  // Observable Background Workflow Runner State
  const [workflowState, setWorkflowState] = useState<WorkflowState>(() =>
    superAdminWorkflowRunner.getState()
  );

  // Dedicated WhatsApp / Telegram Raw Text Box & Modal State
  const [whatsAppText, setWhatsAppText] = useState<string>("");
  const [parsedKundli, setParsedKundli] = useState<ParsedWhatsAppKundli | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  // Chat Tab Speech-to-Text Dictation State
  const [isDictatingText, setIsDictatingText] = useState<boolean>(false);
  const dictationRecognitionRef = useRef<any>(null);

  // Devotee Consultation History Store state
  const devoteeRecords = useDevoteeHistoryStore((s) => s.records);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  const filteredDevotees = useMemo(() => {
    if (!historySearchQuery.trim()) return devoteeRecords;
    const q = historySearchQuery.trim().toLowerCase();
    return devoteeRecords.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.pincode && r.pincode.includes(q))
    );
  }, [devoteeRecords, historySearchQuery]);

  // Background Task Resumption Memory: remembers which page the user was on before opening the pet drawer
  const initialPageRef = useRef<AppPage>(activePage);
  useEffect(() => {
    if (isOpen) {
      initialPageRef.current = activePage;
    }
  }, [isOpen, activePage]);

  const handleWhatsAppTextChange = (text: string) => {
    setWhatsAppText(text);
    const parsed = parseWhatsAppKundliText(text);
    setParsedKundli(parsed.hasData ? parsed : null);
    if (parsed.hasData) {
      setActiveProfile((prev) => ({
        name: parsed.name || prev?.name || "",
        birthDate: parsed.birthDate || prev?.birthDate || "",
        birthTime: parsed.birthTime || prev?.birthTime || "",
        city: parsed.city || prev?.city || "Bengaluru",
        pincode: parsed.pincode || prev?.pincode || "560001",
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        ...prev
      }));
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleWhatsAppTextChange(text);
        }
      }
    } catch (err) {
      console.warn("Clipboard access denied or unavailable:", err);
    }
  };

  const handleClearWhatsAppBox = () => {
    setWhatsAppText("");
    setParsedKundli(null);
  };

  // "Take Input" action: Parses text, persists devotee to History Store, assigns ID, updates activeProfile, and closes modal
  const handleTakeWhatsAppInput = () => {
    const rawTrim = whatsAppText.trim();
    if (!rawTrim) return;

    const parsed = parsedKundli?.hasData ? parsedKundli : parseWhatsAppKundliText(whatsAppText);
    const candidateName = parsed?.hasData && parsed.name ? parsed.name : "ಭಕ್ತರು (Devotee)";

    const record = useDevoteeHistoryStore.getState().upsertDevotee({
      name: candidateName,
      birthDate: parsed?.birthDate || "",
      birthTime: parsed?.birthTime || "",
      city: parsed?.city || "Bengaluru",
      pincode: parsed?.pincode || "560001",
      latitude: parsed?.latitude,
      longitude: parsed?.longitude,
      rawText: rawTrim,
      customQuestions: parsed?.customQuestions || []
    });

    setActiveProfile({
      devoteeId: record.id,
      name: record.name,
      birthDate: record.birthDate,
      birthTime: record.birthTime,
      city: record.city,
      pincode: record.pincode,
      rawText: record.rawText,
      customQuestions: record.customQuestions
    });

    useDevoteeHistoryStore.getState().setActiveDevoteeId(record.id);
    setIsWhatsAppModalOpen(false);

    const takeMsg: ChatMessage = {
      id: `take-${Date.now()}`,
      sender: "pet",
      text:
        currentLang === "kn"
          ? `📋 **${record.name} ಅವರ ವಿವರಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ!**\n\n• **ಭಕ್ತರ ಐಡಿ (Devotee ID):** \`${record.id}\`\n• **ಜನನ ವಿವರ:** ${record.birthDate || "ತಿಳಿಸಿಲ್ಲ"} | ${record.birthTime || "ತಿಳಿಸಿಲ್ಲ"}\n• **ಸ್ಥಳ:** ${record.city} (${record.pincode})\n${record.customQuestions && record.customQuestions.length > 0 ? `• **ಪ್ರಶ್ನೆಗಳು:** ${record.customQuestions.join(", ")}\n` : ""}\nಮುಂದಿನ ಸಂಭಾಷಣೆಗೆ ನೀವು ಈ ಭಕ್ತರ ಐಡಿಯನ್ನು ಬಳಸಬಹುದು. ಈಗ ನೀವು ನೇರವಾಗಿ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು ಅಥವಾ ೫ ಅಧಿಕೃತ ವರದಿಗಳನ್ನು ಆದೇಶಿಸಬಹುದು!`
          : `📋 **Devotee Details Accepted for ${record.name}!**\n\n• **Devotee ID:** \`${record.id}\`\n• **Birth Info:** ${record.birthDate || "Not provided"} at ${record.birthTime || "Not provided"}\n• **Place:** ${record.city} (${record.pincode})\n${record.customQuestions && record.customQuestions.length > 0 ? `• **Questions:** ${record.customQuestions.join(", ")}\n` : ""}\nTo continue in future, you can use this Devotee ID. You can now ask questions or command reports directly.`,
      spokenText: `${record.name} ಅವರ ವಿವರಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಭಕ್ತರ ಐಡಿ ${record.id}.`,
      lang: currentLang,
      timestamp: new Date(),
      emotion: "peaceful",
      mode: "text"
    };

    setMessages((prev) => [...prev, takeMsg]);
    useDevoteeHistoryStore.getState().appendSessionMessage({
      sender: "pet",
      text: takeMsg.text,
      spokenText: takeMsg.spokenText,
      mode: "text"
    });
  };

  // Chat Tab Speech-to-Text Dictation (Direct transcription into inputText, no mode switch, no audio auto-reply)
  const startChatDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        currentLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಪೀಚ್ ರೆಕಗ್ನಿಷನ್ ಲಭ್ಯವಿಲ್ಲ."
          : "Speech recognition not supported in your browser."
      );
      return;
    }

    try {
      safeStopDictation();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const langLocales: Record<SupportedLanguage, string> = {
        kn: "kn-IN",
        hi: "hi-IN",
        te: "te-IN",
        ta: "ta-IN",
        en: "en-IN"
      };
      recognition.lang = langLocales[currentLang] || "kn-IN";

      recognition.onstart = () => {
        setIsDictatingText(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        const trimmed = transcript.trim();
        if (trimmed) {
          setInputText(trimmed);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Chat dictation error:", err);
        setIsDictatingText(false);
      };

      recognition.onend = () => {
        setIsDictatingText(false);
      };

      dictationRecognitionRef.current = recognition;
      recognition.start();
      setIsDictatingText(true);
    } catch (err) {
      console.error("Chat dictation start failed:", err);
      setIsDictatingText(false);
    }
  };

  const safeStopDictation = () => {
    if (dictationRecognitionRef.current) {
      try {
        dictationRecognitionRef.current.onend = null;
        dictationRecognitionRef.current.onerror = null;
        dictationRecognitionRef.current.onresult = null;
        dictationRecognitionRef.current.stop();
      } catch {}
      dictationRecognitionRef.current = null;
    }
    setIsDictatingText(false);
  };

  const toggleChatDictation = () => {
    if (isDictatingText) {
      safeStopDictation();
    } else {
      startChatDictation();
    }
  };

  // Resume past devotee from History Table
  const handleResumeDevotee = (devotee: DevoteeRecord, targetTab: "chat" | "voice") => {
    setActiveProfile({
      devoteeId: devotee.id,
      name: devotee.name,
      birthDate: devotee.birthDate,
      birthTime: devotee.birthTime,
      city: devotee.city,
      pincode: devotee.pincode,
      rawText: devotee.rawText,
      customQuestions: devotee.customQuestions
    });

    useDevoteeHistoryStore.getState().setActiveDevoteeId(devotee.id);

    // If devotee has messages, restore them
    if (devotee.messages.length > 0) {
      const restored: ChatMessage[] = devotee.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        spokenText: m.spokenText || m.text,
        lang: currentLang,
        timestamp: new Date(m.timestamp),
        mode: m.mode || "text",
        emotion: m.sender === "pet" ? "peaceful" : undefined,
        workflowResult: m.workflowResult as any
      }));
      setMessages(restored);
      useDevoteeHistoryStore.getState().restoreSessionMessages(devotee.messages);
    }

    const resumeMsg: ChatMessage = {
      id: `resume-${Date.now()}`,
      sender: "pet",
      text:
        currentLang === "kn"
          ? `📜 **ಭಕ್ತರಾದ ${devotee.name} ಅವರ ಸಮಾಲೋಚನೆ ಪುನರಾರಂಭಗೊಂಡಿದೆ.**\n\n• **ಭಕ್ತರ ಐಡಿ (Devotee ID):** \`${devotee.id}\`\n• **ಜನನ ವಿವರ:** ${devotee.birthDate || "-"} ${devotee.birthTime || ""} (${devotee.city || ""})\n• **ಹಿಂದಿನ ಸಮಾಲೋಚನೆಗಳು:** ${devotee.consultationCount}\n• **ಡೌನ್‌ಲೋಡ್ ಆದ ವರದಿಗಳು:** ${devotee.reports.length}\n\nಸ್ವಾಮಿ, ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು ಅಥವಾ ವರದಿಗಳನ್ನು ಆದೇಶಿಸಬಹುದು!`
          : `📜 **Consultation resumed for ${devotee.name}.**\n\n• **Devotee ID:** \`${devotee.id}\`\n• **Birth Info:** ${devotee.birthDate || "-"} at ${devotee.birthTime || ""} (${devotee.city || ""})\n• **Past Sessions:** ${devotee.consultationCount}\n• **Reports Generated:** ${devotee.reports.length}\n\nSwami, you can ask any question or command report generation!`,
      spokenText: `${devotee.name} ಅವರ ಸಮಾಲೋಚನೆ ಪುನರಾರಂಭಗೊಂಡಿದೆ. ಆಜ್ಞೆ ನೀಡಿ ಸ್ವಾಮಿ.`,
      lang: currentLang,
      timestamp: new Date(),
      emotion: "peaceful",
      mode: "text"
    };

    setMessages((prev) => [...prev, resumeMsg]);
    useDevoteeHistoryStore.getState().appendSessionMessage({
      sender: "pet",
      text: resumeMsg.text,
      spokenText: resumeMsg.spokenText,
      mode: "text"
    });

    if (targetTab === "voice") {
      enterVoiceMode();
    } else {
      setActiveTab("chat");
    }
  };

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

  // Initial welcome message or restored active session messages (ChatGPT/Claude/Gemini Live parity)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const persisted = useDevoteeHistoryStore.getState().activeSessionMessages;
      if (persisted && persisted.length > 0) {
        return persisted.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          spokenText: m.spokenText || m.text,
          timestamp: new Date(m.timestamp),
          mode: m.mode || "text",
          workflowResult: m.workflowResult as any
        }));
      }
    } catch {}
    return [
      {
        id: "welcome-1",
        sender: "pet",
        mode: "text",
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
              te: "🔮 జాతక దోషాల ತನಿಖೀ",
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
    ];
  });

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

  // Safely stop recognition without triggering error callbacks
  const safeStopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    } catch {}
    setIsListening(false);
  };
  safeStopListeningRef.current = safeStopListening;

  // Start continuous, natural conversation microphone recognition
  const startListening = () => {
    // If muted, assistant is talking, or engine is computing, hold listening
    if (
      isMicMutedRef.current ||
      isAssistantSpeakingRef.current ||
      isProcessingRef.current
    ) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      // Disarm any stale instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

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
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const displayed = (finalTranscript || interimTranscript).trim();
        if (displayed) {
          setLiveTranscript(displayed);
        }

        if (finalTranscript.trim()) {
          const spoken = finalTranscript.trim();
          // Pause listening immediately so assistant's thinking & response isn't picked up
          safeStopListening();
          setInputText(spoken);
          handleSend(spoken);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err?.error || err);
        // Automatically re-arm if transient network or no-speech glitch in voice mode
        if (
          isVoiceModeRef.current &&
          !isAssistantSpeakingRef.current &&
          !isMicMutedRef.current &&
          !isProcessingRef.current
        ) {
          setTimeout(() => {
            startListeningRef.current?.();
          }, 450);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Seamless Hands-Free Loop: If browser silence timeout fires, automatically resume!
        if (
          isVoiceModeRef.current &&
          !isAssistantSpeakingRef.current &&
          !isMicMutedRef.current &&
          !isProcessingRef.current
        ) {
          setTimeout(() => {
            startListeningRef.current?.();
          }, 250);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.error("Speech recognition start failed:", e);
      setIsListening(false);
    }
  };
  startListeningRef.current = startListening;

  // Enter Full Interactive Live Voice Mode (Silent, attentive, no repetitive spoken greeting)
  const enterVoiceMode = () => {
    setIsVoiceMode(true);
    isVoiceModeRef.current = true;
    setIsMicMuted(false);
    isMicMutedRef.current = false;
    setActiveTab("voice");
    setIsOpen(true);

    const readyStatus =
      currentLang === "kn"
        ? "🎤 ಸಿದ್ಧವಾಗಿದೆ, ಆಜ್ಞೆ ನೀಡಿ..."
        : "🎤 Ready, listening for your command...";

    setLiveTranscript(readyStatus);

    // Start hands-free listening immediately without talking over the user
    setTimeout(() => {
      if (isVoiceModeRef.current && !isMicMutedRef.current) {
        startListeningRef.current?.();
      }
    }, 150);
  };

  // Exit Voice Mode back to text chat
  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    isVoiceModeRef.current = false;
    safeStopListening();
    petSpeechService.stop();
    setActiveTab("chat");
  };

  // Toggle user's microphone mute without losing permissions
  const toggleMicMute = () => {
    const nextMuted = !isMicMuted;
    setIsMicMuted(nextMuted);
    isMicMutedRef.current = nextMuted;
    if (nextMuted) {
      safeStopListening();
    } else {
      startListening();
    }
  };

  // Interrupt assistant speech immediately so user can talk
  const interruptAssistant = () => {
    petSpeechService.stop();
    setIsAssistantSpeaking(false);
    isAssistantSpeakingRef.current = false;
    if (isVoiceModeRef.current && !isMicMutedRef.current) {
      startListeningRef.current?.();
    }
  };

  // Mic button in chat input toggles Live Voice Mode
  const toggleListening = () => {
    if (isVoiceMode || activeTab === "voice") {
      exitVoiceMode();
    } else {
      enterVoiceMode();
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
  const launchWorkflow = (
    params: WorkflowParams,
    commandLang?: SupportedLanguage,
    changeNotice?: string
  ) => {
    const lang = commandLang || currentLang;
    setConfirmationLang(lang);
    setPendingConfirmation(params);
    setActiveTab("chat");

    // Maintain profile in memory for ongoing assistant discussions
    setActiveProfile((prev) => ({
      name: params.name,
      birthDate: params.birthDate,
      birthTime: params.birthTime,
      city: params.city,
      pincode: params.pincode,
      priestName: params.priestName,
      priestPhone: params.priestPhone,
      poojaName: params.poojaName,
      ...prev
    }));

    const nextSlot = superAdminWorkflowRunner.getNextAvailableSlotIndex();
    const knNum = ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯", "೧೦"][nextSlot] || String(nextSlot);
    
    const prefix = changeNotice
      ? (lang === "kn"
          ? `🔄 **ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ ಸ್ವಾಮಿ:**\n• ${changeNotice}\n\n`
          : `🔄 **Details have been updated, Swami:**\n• ${changeNotice}\n\n`)
      : "";

    const askConfirmText =
      prefix +
      (lang === "kn"
        ? `📋 **ಸ್ವಾಮಿ, ೫ ಅಧಿಕೃತ ವರದಿಗಳ ಹಿನ್ನೆಲೆ ಡೌನ್‌ಲೋಡ್ ಪೂರ್ವ ಪರಿಶೀಲನೆ (ಕಾಮಧೇನು ${knNum})**\n\nಸ್ವಾಮಿ, ನಾನು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ:\n\n• **ಜಾತಕರ ಹೆಸರು:** ${params.name}\n• **ಜನನ ದಿನಾಂಕ & ಸಮಯ:** ${params.birthDate} | ${params.birthTime}\n• **ಸ್ಥಳ & ಪಿನ್‌ಕೋಡ್:** ${params.city} (PIN: ${params.pincode})\n• **ಅರ್ಚಕರು:** ${params.priestName}\n• **ಅರ್ಚಕರ ಮೊಬೈಲ್:** ${params.priestPhone || "ಸ್ವಯಂಚಾಲಿತ ನಿಯೋಜನೆ"}\n• **ಪೂಜೆ / ಸೇವೆ:** ${params.poojaName}\n• **ಸೇವಾ QR ಕೋಡ್:** ${params.includeQrCode !== false ? "ಹೌದು (ಸೇವಾ & ಪ್ರಸಾದ ಆನ್‌ಲೈನ್ ಸಂಕಲ್ಪ)" : "ಇಲ್ಲ"}\n\n📦 **ಡೌನ್‌ಲೋಡ್ ಆಗಲಿರುವ ೫ ಅಧಿಕೃತ ವರದಿಗಳು:**\n1. 📜 **ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಜನ್ಮ ಕುಂಡಲಿ PDF** (ಲಗ್ನ, ನವಾಂಶ, ಗ್ರಹ ಸ್ಪಷ್ಟ & ಅಷ್ಟಕವರ್ಗ)\n2. 📖 **ಪ್ರೀಮಿಯಂ ದಿವ್ಯ ಭವಿಷ್ಯ V1 PDF** (೧೦-ಅಧ್ಯಾಯ ವಿಸ್ತೃತ ಜೀವನ ಭವಿಷ್ಯ ಮಹಾ ವರದಿ)\n3. 🪔 **ದೈವಿಕ ಜ್ಯೋತಿಷ್ಯ ಪರಿಹಾರ ವರದಿ PDF** (ಗೋಕರ್ಣ ಪರಿಹಾರ, ರತ್ನ & ಮಂತ್ರ ಶಾಸ್ತ್ರ)\n4. 🔮 **ಸಮಗ್ರ ದೋಷಗಳು & ಗಂಡಾಂತರ ಸ್ಕ್ಯಾನ್ PDF** (ಕಾಳಸರ್ಪ, ಮಾಂಗಲ್ಯ, ಪಿತೃ ದೋಷ)\n5. 🕉️ **ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ೫-ಪುಟಗಳ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರ PDF** (ಅರ್ಚಕ ${params.priestName} ಅವರ ಸಂಕಲ್ಪ, ಸ್ಕ್ಯಾನಬಲ್ QR ಕೋಡ್, ದೈವಿಕ ರಕ್ಷಣೆ, ಪೂಜಾ ಮಹಾತ್ಮೆ & ವಾರ್ಷಿಕ ಪರಿಹಾರಗಳು)\n\nಸ್ವಾಮಿ, ಈ ಎಲ್ಲಾ ವರದಿಗಳನ್ನು ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸಲು ದೃಢೀಕರಿಸುವಿರಾ? ಅಥವಾ ಏನಾದರೂ ಬದಲಾಯಿಸಬೇಕೇ?`
        : `📋 **Swami, Pre-Download Verification & Confirmation (Kamadhenu ${nextSlot})**\n\nSwami, I have gathered and verified all details for autonomous generation:\n\n• **Devotee Name:** ${params.name}\n• **Birth Date & Time:** ${params.birthDate} at ${params.birthTime}\n• **Place & Pincode:** ${params.city} (PIN: ${params.pincode})\n• **Priest:** ${params.priestName}\n• **Priest Mobile:** ${params.priestPhone || "Auto-assigned"}\n• **Pooja / Seva:** ${params.poojaName}\n• **Seva QR Code:** ${params.includeQrCode !== false ? "Yes (Live Seva & Prasada Sankalpa)" : "No"}\n\n📦 **5 Official Reports to be Generated & Downloaded:**\n1. 📜 **Baggona Panchanga Birth Kundli PDF** (Lagna, Navamsha, Graha Sphutas, Ashtakavarga)\n2. 📖 **Premium Divya Bhavishya V1 PDF** (10-Chapter Comprehensive Life Predictions)\n3. 🪔 **Daivika Astrological Parihara & Remedial Guidance PDF** (Gokarna Pariharas & Mantras)\n4. 🔮 **Comprehensive Doshas & Gandantara Scan PDF** (Kalasarpa, Manglik, Pitru Dosha)\n5. 🕉️ **Sri Kshetra Gokarna 5-Page Official Ashirvada Patra PDF** (Priest ${params.priestName} Blessings, Sankalpa, Scannable QR Code, Divine Raksha, Pooja Mahatme & Annual Remedies)\n\nSwami, please confirm to begin background generation, or let me know if you would like to change any detail!`);

    const askConfirmSpoken =
      (changeNotice
        ? (lang === "kn" ? "ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಲಾಗಿದೆ ಸ್ವಾಮಿ. " : "Details updated, Swami. ")
        : "") +
      (lang === "kn"
        ? `ಸ್ವಾಮಿ, ${params.city} ಪಿನ್‌ಕೋಡ್ ${params.pincode} ಸ್ಥಳದಲ್ಲಿ ${params.birthDate} ${params.birthTime} ರಂದು ಜನಿಸಿದ ${params.name} ಅವರ ಜಾತಕ ಗಣನೆ, ಅರ್ಚಕ ${params.priestName} ಅವರ ನೇತೃತ್ವದ ${params.poojaName} ಸೇವೆ${params.priestPhone ? ` ಹಾಗೂ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ${params.priestPhone}` : ""}, ಸೇವಾ ಪ್ರಸಾದ ಕ್ಯೂಆರ್ ಕೋಡ್ ಹಾಗೂ ಐದು ಪುಟಗಳ ಸಂಪೂರ್ಣ ಆಶೀರ್ವಾದ ಪತ್ರ ಸಹಿತ ಒಟ್ಟು ಐದು ಅಧಿಕೃತ ವರದಿಗಳ ಹಿನ್ನೆಲೆ ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿ ಸ್ವಾಮಿ, ತಕ್ಷಣ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಪ್ರಾರಂಭಿಸುತ್ತೇನೆ!`
        : `Swami, I have verified all details for ${params.name}, born on ${params.birthDate} at ${params.birthTime} in ${params.city}, pincode ${params.pincode}. With Priest ${params.priestName}${params.priestPhone ? `, contact ${params.priestPhone}` : ""}, for ${params.poojaName}, with Seva QR code. I am ready to generate all five official reports including the complete five-page Gokarna Ashirvada Patra in the background. Please review and confirm, Swami!`);

    const currentMode = (activeTab === "voice" || isVoiceModeRef.current) ? "voice" : "text";
    const petMsg: ChatMessage = {
      id: `pet-confirm-prompt-${Date.now()}`,
      sender: "pet",
      text: askConfirmText,
      spokenText: askConfirmSpoken,
      lang,
      timestamp: new Date(),
      emotion: "thinking",
      mode: currentMode
    };

    setMessages((prev) => [...prev, petMsg]);
    useDevoteeHistoryStore.getState().appendSessionMessage({
      sender: "pet",
      text: askConfirmText,
      spokenText: askConfirmSpoken,
      mode: currentMode
    });
    setCurrentEmotion("thinking");
    setLastSpokenAnswer(askConfirmSpoken);

    if (!isMuted) {
      setIsAssistantSpeaking(true);
      isAssistantSpeakingRef.current = true;
      safeStopListening();
      petSpeechService.speak(
        askConfirmSpoken,
        lang,
        () => {
          setIsAssistantSpeaking(false);
          isAssistantSpeakingRef.current = false;
          if (isVoiceModeRef.current && !isMicMutedRef.current) {
            startListeningRef.current?.();
          }
        },
        () => {
          setIsAssistantSpeaking(true);
          isAssistantSpeakingRef.current = true;
        }
      );
    } else {
      if (isVoiceModeRef.current && !isMicMutedRef.current) {
        startListeningRef.current?.();
      }
    }
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

      const currentMode = (activeTab === "voice" || isVoiceModeRef.current) ? "voice" : "text";
      const petMsg: ChatMessage = {
        id: `pet-wf-start-${Date.now()}`,
        sender: "pet",
        text: startNotice,
        spokenText: startSpoken,
        lang,
        timestamp: new Date(),
        emotion: "excited",
        mode: currentMode
      };

      setMessages((prev) => [...prev, petMsg]);
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "pet",
        text: startNotice,
        spokenText: startSpoken,
        mode: currentMode
      });
      setCurrentEmotion("excited");
      setLastSpokenAnswer(startSpoken);

      if (!isMuted) {
        setIsAssistantSpeaking(true);
        isAssistantSpeakingRef.current = true;
        safeStopListening();
        petSpeechService.speak(
          startSpoken,
          lang,
          () => {
            setIsAssistantSpeaking(false);
            isAssistantSpeakingRef.current = false;
            if (isVoiceModeRef.current && !isMicMutedRef.current) {
              startListeningRef.current?.();
            }
          },
          () => {
            setIsAssistantSpeaking(true);
            isAssistantSpeakingRef.current = true;
          }
        );
      } else {
        if (isVoiceModeRef.current && !isMicMutedRef.current) {
          startListeningRef.current?.();
        }
      }

      // 💥 USER SPECIFICATION: "if there are any action it can go to the background and I will resume back to what page I was in earlier before starting the conversation"
      if (params.targetRedirectPage) {
        setPage(params.targetRedirectPage);
      } else if (initialPageRef.current) {
        setPage(initialPageRef.current);
      }
      setIsOpen(false);
    } catch (err: any) {
      alert(err?.message || "Failed to start background instance");
    }
  };

  const handleCancelConfirmation = () => {
    const lang = confirmationLang || currentLang;
    setPendingConfirmation(null);
    const currentMode = (activeTab === "voice" || isVoiceModeRef.current) ? "voice" : "text";
    const cancelMsg: ChatMessage = {
      id: `pet-cancel-${Date.now()}`,
      sender: "pet",
      text:
        lang === "kn"
          ? "ಆಜ್ಞೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ ಸ್ವಾಮಿ. ಬೇರೆ ಯಾವುದೇ ಸೇವೆಗೆ ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ."
          : "Command cancelled, Swami. Ready for your next instruction.",
      spokenText:
        lang === "kn"
          ? "ಆಜ್ಞೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ ಸ್ವಾಮಿ. ಮುಂದಿನ ಆಜ್ಞೆಯನ್ನು ನೀಡಿ."
          : "Command cancelled, Swami. Awaiting your next command.",
      lang,
      timestamp: new Date(),
      emotion: "peaceful",
      mode: currentMode
    };
    setMessages((prev) => [...prev, cancelMsg]);
    useDevoteeHistoryStore.getState().appendSessionMessage({
      sender: "pet",
      text: cancelMsg.text,
      spokenText: cancelMsg.spokenText,
      mode: currentMode
    });
    setCurrentEmotion("peaceful");
    setLastSpokenAnswer(cancelMsg.spokenText!);

    if (!isMuted) {
      setIsAssistantSpeaking(true);
      isAssistantSpeakingRef.current = true;
      safeStopListening();
      petSpeechService.speak(
        cancelMsg.spokenText!,
        lang,
        () => {
          setIsAssistantSpeaking(false);
          isAssistantSpeakingRef.current = false;
          if (isVoiceModeRef.current && !isMicMutedRef.current) {
            startListeningRef.current?.();
          }
        },
        () => {
          setIsAssistantSpeaking(true);
          isAssistantSpeakingRef.current = true;
        }
      );
    } else {
      if (isVoiceModeRef.current && !isMicMutedRef.current) {
        startListeningRef.current?.();
      }
    }
  };

  const handleSend = async (overrideText?: string) => {
    const query = (overrideText !== undefined ? overrideText : inputText).trim();
    if (!query || isProcessing) return;

    // Detect language of the query or explicit instruction (e.g. "in English", "in Kannada", Kannada script, etc.)
    const effectiveLang = detectQueryLanguage(query, currentLang);

    const currentMode: "text" | "voice" = (activeTab === "voice" || isVoiceModeRef.current) ? "voice" : "text";

    // Append user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      lang: effectiveLang,
      timestamp: new Date(),
      mode: currentMode
    };
    setMessages((prev) => [...prev, userMsg]);
    useDevoteeHistoryStore.getState().appendSessionMessage({
      sender: "user",
      text: query,
      mode: currentMode
    });
    setInputText("");
    setLiveTranscript(query);
    setIsProcessing(true);
    isProcessingRef.current = true;
    safeStopListening();
    setCurrentEmotion("thinking");

    // 0. IF WAITING FOR CONFIRMATION OF A PENDING WORKFLOW:
    if (pendingConfirmation) {
      if (isConfirmationAffirmative(query)) {
        setIsProcessing(false);
        handleConfirmAndStart();
        return;
      }

      if (isConfirmationCancellation(query)) {
        setIsProcessing(false);
        handleCancelConfirmation();
        return;
      }

      // Check if user is modifying details (e.g. "change priest name to...", "mobile is...", "pooja is...", "city is...")
      const { updatedParams, changedFields } = modifyPendingWorkflow(pendingConfirmation, query, effectiveLang);
      if (changedFields.length > 0 || isConfirmationModification(query)) {
        setIsProcessing(false);
        setPendingConfirmation(updatedParams);
        const changeNotice = changedFields.join("\n• ");
        launchWorkflow(updatedParams, effectiveLang, changeNotice);
        return;
      }
    }

    // 0.5 DEVOTEE CONSULTATION HISTORY RECALL
    const historyStore = useDevoteeHistoryStore.getState();
    const isRecallQuery =
      /\b(history|ಇತಿಹಾಸ|ಹಿಂದಿನ|ಸಂಭಾಷಣೆ|bring\s*back|recall|load|ತನ್ನಿ|ತೋರಿಸು|restore|continue|ಮುಂದುವರಿಸಿ)\b/i.test(query) ||
      query.toUpperCase().includes("DEV-");

    if (isRecallQuery) {
      const candidateDevotee = historyStore.getDevoteeByIdOrName(query);
      if (candidateDevotee) {
        setIsProcessing(false);
        isProcessingRef.current = false;

        setActiveProfile({
          devoteeId: candidateDevotee.id,
          name: candidateDevotee.name,
          birthDate: candidateDevotee.birthDate,
          birthTime: candidateDevotee.birthTime,
          city: candidateDevotee.city,
          pincode: candidateDevotee.pincode,
          rawText: candidateDevotee.rawText,
          customQuestions: candidateDevotee.customQuestions
        });
        historyStore.setActiveDevoteeId(candidateDevotee.id);

        if (candidateDevotee.messages.length > 0) {
          const restored: ChatMessage[] = candidateDevotee.messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            spokenText: m.text,
            lang: effectiveLang,
            timestamp: new Date(m.timestamp),
            emotion: m.sender === "pet" ? "peaceful" : undefined,
            workflowResult: m.workflowResult as any
          }));
          setMessages(restored);
        }

        const recallText =
          effectiveLang === "kn"
            ? `📜 **ಭಕ್ತರಾದ ${candidateDevotee.name} (ಐಡಿ: \`${candidateDevotee.id}\`) ಅವರ ಹಿಂದಿನ ಸಮಾಲೋಚನೆ ಇತಿಹಾಸವನ್ನು ಮರಳಿ ಪಡೆಯಲಾಗಿದೆ!**\n\n• **ಜನನ ವಿವರ:** ${candidateDevotee.birthDate || "-"} ${candidateDevotee.birthTime || ""}\n• **ಸ್ಥಳ:** ${candidateDevotee.city || "-"} (${candidateDevotee.pincode || ""})\n• **ಸಮಾಲೋಚನೆಗಳು:** ${candidateDevotee.consultationCount} ಬಾರಿ\n• **ವರದಿಗಳು:** ${candidateDevotee.reports.length} ಅಧಿಕೃತ ವರದಿಗಳು\n\nಮುಂದಿನ ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು ಅಥವಾ ಹೊಸ ವರದಿಗಳನ್ನು ಆದೇಶಿಸಬಹುದು.\n\n💡 **ಭಕ್ತರ ಐಡಿ (Devotee ID):** \`${candidateDevotee.id}\` (ಮುಂದೆ ಮುಂದುವರಿಸಲು ಈ ID ಬಳಸಬಹುದು)`
            : `📜 **Consultation history restored for ${candidateDevotee.name} (ID: \`${candidateDevotee.id}\`)!**\n\n• **Birth Info:** ${candidateDevotee.birthDate || "-"} at ${candidateDevotee.birthTime || ""} (${candidateDevotee.city || ""})\n• **Past Sessions:** ${candidateDevotee.consultationCount} sessions\n• **Reports Generated:** ${candidateDevotee.reports.length} reports\n\nYou can ask any question or command report generation.\n\n💡 **Devotee ID:** \`${candidateDevotee.id}\` (Use this ID to continue in future)`;

        const recallSpoken =
          effectiveLang === "kn"
            ? `${candidateDevotee.name} ಅವರ ಹಿಂದಿನ ಸಮಾಲೋಚನೆ ಇತಿಹಾಸವನ್ನು ಮರಳಿ ತರಲಾಗಿದೆ. ಮುಂದಿನ ಆಜ್ಞೆ ನೀಡಿ ಸ್ವಾಮಿ. ಭಕ್ತರ ಐಡಿ ${candidateDevotee.id}.`
            : `Consultation history restored for ${candidateDevotee.name}. Please give your command, Swami. Devotee ID is ${candidateDevotee.id}.`;

        const petMsg: ChatMessage = {
          id: `pet-recall-${Date.now()}`,
          sender: "pet",
          text: recallText,
          spokenText: recallSpoken,
          lang: effectiveLang,
          timestamp: new Date(),
          emotion: "peaceful",
          mode: currentMode
        };

        setMessages((prev) => [...prev, petMsg]);
        useDevoteeHistoryStore.getState().appendSessionMessage({
          sender: "pet",
          text: recallText,
          spokenText: recallSpoken,
          mode: currentMode
        });
        setCurrentEmotion("peaceful");
        setLastSpokenAnswer(recallSpoken);

        historyStore.appendMessage(candidateDevotee.id, {
          sender: "user",
          text: query
        });
        historyStore.appendMessage(candidateDevotee.id, {
          sender: "pet",
          text: recallText
        });

        if (activeTab === "voice" && !isMuted) {
          setIsAssistantSpeaking(true);
          isAssistantSpeakingRef.current = true;
          safeStopListening();
          petSpeechService.speak(
            recallSpoken,
            effectiveLang,
            () => {
              setIsAssistantSpeaking(false);
              isAssistantSpeakingRef.current = false;
              if (isVoiceModeRef.current && !isMicMutedRef.current) {
                startListeningRef.current?.();
              }
            },
            () => {
              setIsAssistantSpeaking(true);
              isAssistantSpeakingRef.current = true;
            }
          );
        } else if (activeTab === "voice") {
          if (isVoiceModeRef.current && !isMicMutedRef.current) {
            startListeningRef.current?.();
          }
        }
        return;
      }
    }

    // 1. CHECK FOR AUTONOMOUS WORKFLOW INSTRUCTION
    // Fuse WhatsApp pasted input, activeProfile, and ambientProfile
    const parsedFromText = !parsedKundli?.hasData ? parseWhatsAppKundliText(whatsAppText || query) : null;
    const finalAmbient = (parsedKundli && parsedKundli.hasData)
      ? {
          hasData: true,
          name: parsedKundli.name,
          birthDate: parsedKundli.birthDate,
          birthTime: parsedKundli.birthTime,
          city: parsedKundli.city,
          pincode: parsedKundli.pincode,
          latitude: parsedKundli.latitude,
          longitude: parsedKundli.longitude,
          customQuestions: parsedKundli.customQuestions,
          pastedRawText: parsedKundli.rawText
        }
      : (parsedFromText && parsedFromText.hasData)
      ? {
          hasData: true,
          name: parsedFromText.name,
          birthDate: parsedFromText.birthDate,
          birthTime: parsedFromText.birthTime,
          city: parsedFromText.city,
          pincode: parsedFromText.pincode,
          latitude: parsedFromText.latitude,
          longitude: parsedFromText.longitude,
          customQuestions: parsedFromText.customQuestions,
          pastedRawText: parsedFromText.rawText
        }
      : (ambientProfile.hasData ? ambientProfile : null);

    const wfCheck = parseWorkflowInstruction(query, effectiveLang, finalAmbient);
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
          emotion: "alert",
          mode: currentMode
        };
        setMessages((prev) => [...prev, petMsg]);
        useDevoteeHistoryStore.getState().appendSessionMessage({
          sender: "pet",
          text,
          spokenText: text,
          mode: currentMode
        });
        setCurrentEmotion("alert");
        setLastSpokenAnswer(text);

        if (!isMuted) {
          setIsAssistantSpeaking(true);
          isAssistantSpeakingRef.current = true;
          safeStopListening();
          petSpeechService.speak(
            text,
            effectiveLang,
            () => {
              setIsAssistantSpeaking(false);
              isAssistantSpeakingRef.current = false;
              if (isVoiceModeRef.current && !isMicMutedRef.current) {
                startListeningRef.current?.();
              }
            },
            () => {
              setIsAssistantSpeaking(true);
              isAssistantSpeakingRef.current = true;
            }
          );
        } else {
          if (isVoiceModeRef.current && !isMicMutedRef.current) {
            startListeningRef.current?.();
          }
        }
        return;
      }

      if (wfCheck.params) {
        setActiveProfile((prev) => ({
          name: wfCheck.params!.name,
          birthDate: wfCheck.params!.birthDate,
          birthTime: wfCheck.params!.birthTime,
          city: wfCheck.params!.city,
          pincode: wfCheck.params!.pincode,
          priestName: wfCheck.params!.priestName,
          priestPhone: wfCheck.params!.priestPhone,
          poojaName: wfCheck.params!.poojaName,
          kundli: ambientProfile.kundli || prev?.kundli,
          dasha: ambientProfile.dasha || prev?.dasha,
          ...prev
        }));
        launchWorkflow(wfCheck.params, effectiveLang);
        return;
      }
    }

    // 2. STANDARD SUPER ADMIN PET QUERIES (Bhavishya predictions, All 32 Pages Navigation, Revenue, Marketing, Diagnostics)
    try {
      const effectiveProfile = activeProfile || (ambientProfile.hasData ? {
        name: ambientProfile.name,
        birthDate: ambientProfile.birthDate,
        birthTime: ambientProfile.birthTime,
        city: ambientProfile.city,
        pincode: ambientProfile.pincode,
        kundli: ambientProfile.kundli,
        dasha: ambientProfile.dasha
      } : undefined) || (currentKundliSession ? {
        name: currentKundliSession.input.name,
        birthDate: currentKundliSession.input.birthDate || currentKundliSession.birthDateYmd,
        birthTime: currentKundliSession.input.birthTime || currentKundliSession.birthTimeHm,
        city: currentKundliSession.homePlaceName || currentKundliSession.placeLabel || "Bengaluru",
        kundli: currentKundliSession.result
      } : undefined);

      // Build unified cross-modal conversation turns for seamless bi-directional memory
      const conversationTurns = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        spokenText: m.spokenText,
        mode: m.mode || "text",
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date(m.timestamp).toISOString()
      }));

      const resp = await executeSuperAdminPetQuery(query, {
        activePage,
        currentKundliSession,
        activeProfile: effectiveProfile,
        ambientProfile,
        coinBalance: wallet?.coinBalance,
        currentUser,
        geminiApiKey,
        selectedLanguage: effectiveLang,
        pendingConfirmation: pendingConfirmation || undefined,
        conversationHistory: conversationTurns
      });

      const localizedText = resp.text[effectiveLang] || resp.text[currentLang] || resp.text.kn || resp.text.en;
      const localizedSpoken = resp.spokenText[effectiveLang] || resp.spokenText[currentLang] || resp.spokenText.kn || resp.spokenText.en;

      // Devotee ID and session persistence:
      const activeDevoteeId = activeProfile?.devoteeId || useDevoteeHistoryStore.getState().activeDevoteeId;
      let finalDevoteeId = activeDevoteeId;

      // If there's an active profile or ambient profile without a devoteeId yet, upsert them now so an ID exists!
      if (!finalDevoteeId && (effectiveProfile?.name || ambientProfile?.name)) {
        const dName = effectiveProfile?.name || ambientProfile?.name || "ಭಕ್ತರು";
        const newRecord = useDevoteeHistoryStore.getState().upsertDevotee({
          name: dName,
          birthDate: effectiveProfile?.birthDate || ambientProfile?.birthDate || "",
          birthTime: effectiveProfile?.birthTime || ambientProfile?.birthTime || "",
          city: effectiveProfile?.city || ambientProfile?.city || "Bengaluru",
          pincode: effectiveProfile?.pincode || ambientProfile?.pincode || "560001",
          customQuestions: effectiveProfile?.customQuestions || ambientProfile?.customQuestions || []
        });
        finalDevoteeId = newRecord.id;
        setActiveProfile((prev) =>
          prev
            ? { ...prev, devoteeId: newRecord.id, name: dName }
            : {
                devoteeId: newRecord.id,
                name: dName,
                birthDate: effectiveProfile?.birthDate || ambientProfile?.birthDate || "",
                birthTime: effectiveProfile?.birthTime || ambientProfile?.birthTime || "",
                city: effectiveProfile?.city || ambientProfile?.city || "Bengaluru",
                pincode: effectiveProfile?.pincode || ambientProfile?.pincode || "560001"
              }
        );
      }

      // Append Devotee ID footer so the user can continue consultation in future
      const devoteeIdFooter = finalDevoteeId
        ? `\n\n💡 **${effectiveLang === "kn" ? "ಭಕ್ತರ ಐಡಿ (Devotee ID)" : "Devotee ID"}:** \`${finalDevoteeId}\` (${effectiveLang === "kn" ? "ಮುಂದಿನ ಸಮಾಲೋಚನೆಗೆ ಈ ID ಬಳಸಿ" : "Use this ID to continue in future"})`
        : "";

      const fullDisplayText = localizedText + devoteeIdFooter;
      const fullVoiceSpeech = localizedText || localizedSpoken;
      setLastSpokenAnswer(fullVoiceSpeech);

      const petMsg: ChatMessage = {
        id: `pet-${Date.now()}`,
        sender: "pet",
        text: fullDisplayText,
        spokenText: fullVoiceSpeech,
        lang: effectiveLang,
        actions: resp.actions,
        timestamp: new Date(),
        emotion: resp.emotion,
        mode: currentMode
      };

      setMessages((prev) => [...prev, petMsg]);
      setCurrentEmotion(resp.emotion);

      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "pet",
        text: fullDisplayText,
        spokenText: fullVoiceSpeech,
        mode: currentMode,
        actions: resp.actions
      });

      // Save to Devotee History Store
      if (finalDevoteeId) {
        useDevoteeHistoryStore.getState().appendMessage(finalDevoteeId, {
          sender: "user",
          text: query
        });
        useDevoteeHistoryStore.getState().appendMessage(finalDevoteeId, {
          sender: "pet",
          text: fullDisplayText
        });
      }

      // ONLY speak out loud if in VOICE tab! If in CHAT tab, it stays text-only on screen!
      if (activeTab === "voice" && !isMuted) {
        setIsAssistantSpeaking(true);
        isAssistantSpeakingRef.current = true;
        safeStopListening();

        petSpeechService.speak(
          fullVoiceSpeech,
          effectiveLang,
          () => {
            setIsAssistantSpeaking(false);
            isAssistantSpeakingRef.current = false;
            // In Live Voice Mode, automatically resume listening hands-free!
            if (isVoiceModeRef.current && !isMicMutedRef.current) {
              startListeningRef.current?.();
            }
          },
          () => {
            setIsAssistantSpeaking(true);
            isAssistantSpeakingRef.current = true;
          }
        );
      } else if (activeTab === "voice") {
        if (isVoiceModeRef.current && !isMicMutedRef.current) {
          startListeningRef.current?.();
        }
      }

      // Google Assistant-like Auto-Redirection throughout Panchanga:
      // If the query was an explicit command to navigate/redirect to a page and the engine returned a target page
      if (
        resp.category === "navigation" &&
        resp.actions.length >= 1 &&
        resp.actions[0].targetPage
      ) {
        const navAction = resp.actions[0];
        if (navAction.targetPage) {
          setPage(navAction.targetPage, false, navAction.payload);
          if (navAction.payload) {
            useAppStore.getState().setPageParams(navAction.payload);
          }
          setIsOpen(false);
        }
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
        emotion: "alert",
        mode: currentMode
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      useDevoteeHistoryStore.getState().appendSessionMessage({
        sender: "pet",
        text: fallbackMsg.text,
        spokenText: fallbackMsg.spokenText,
        mode: currentMode
      });
      setCurrentEmotion("alert");
    } finally {
      setIsProcessing(false);
      isProcessingRef.current = false;
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
      setPage(action.targetPage, false, action.payload);
      if (action.payload) {
        useAppStore.getState().setPageParams(action.payload);
      }
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

            {/* Navigation Tabs: Chat vs Live Voice vs Task Manager Fleet */}
            <div className="flex items-center justify-between border-b border-amber-300 bg-amber-100/70 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isVoiceMode) exitVoiceMode();
                    setActiveTab("chat");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "chat"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span>💬</span>
                  <span>{currentLang === "kn" ? "ಸಂಭಾಷಣೆ (Chat)" : "Chat"}</span>
                </button>

                {/* 🎙️ DEDICATED LIVE VOICE CONVERSATION TAB */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isVoiceMode) {
                      enterVoiceMode();
                    } else {
                      setActiveTab("voice");
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "voice"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span className="animate-pulse">🎙️</span>
                  <span>{currentLang === "kn" ? "ಲೈವ್ ವಾಯ್ಸ್ (Voice)" : "Live Voice"}</span>
                  {isVoiceMode && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>

                {/* 📜 DEVOTEE CONSULTATION HISTORY TAB */}
                <button
                  type="button"
                  onClick={() => {
                    if (isVoiceMode) exitVoiceMode();
                    setActiveTab("history");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "history"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span>📜</span>
                  <span>{currentLang === "kn" ? "ಇತಿಹಾಸ (History)" : "History"}</span>
                  {devoteeRecords.length > 0 && (
                    <span className="rounded-full bg-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                      {devoteeRecords.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isVoiceMode) exitVoiceMode();
                    setActiveTab("tasks");
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3 py-1 text-xs font-bold transition-all ${
                    activeTab === "tasks"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  <span>⚡</span>
                  <span>{currentLang === "kn" ? "ಕಾರ್ಯಗಳು (Tasks)" : "Fleet"}</span>
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

            {/* Ambient Kundli Context Banner - Reads the room when Kundli is generated */}
            {ambientProfile.hasData && (
              <div className="flex items-center justify-between border-b border-amber-300/80 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 px-3.5 py-1.5 text-xs text-amber-950 shadow-inner">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs">
                    🪐
                  </span>
                  <div className="min-w-0 truncate">
                    <span className="font-bold text-amber-900">
                      {currentLang === "kn" ? "ಸಕ್ರಿಯ ಜಾತಕ:" : currentLang === "hi" ? "सक्रिय कुंडली:" : currentLang === "te" ? "యాక్టివ్ జాతకం:" : currentLang === "ta" ? "செயலில் உள்ள ஜாதகம்:" : "Active Chart:"}
                    </span>{" "}
                    <span className="font-black text-amber-950 underline decoration-amber-400 decoration-2">
                      {ambientProfile.name}
                    </span>
                    <span className="ml-1 text-[11px] font-medium text-amber-800">
                      ({ambientProfile.birthDate} · {ambientProfile.birthTime} · {ambientProfile.city})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                    {currentLang === "kn" ? "ಸ್ಮಾರ್ಟ್ ಓದುವಿಕೆ" : "Room-Read Active"}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 1: CHAT & VOICE INTERFACE */}
            {activeTab === "chat" && (
              <>
                {/* SLIM DEVOTEE STATUS & ON-DEMAND WHATSAPP MODAL TRIGGER BAR */}
                <div className="flex items-center justify-between border-b border-amber-300/80 bg-gradient-to-r from-amber-50 via-amber-100/40 to-orange-50/70 px-3 py-1.5 shadow-2xs text-xs">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span className="text-amber-800 text-sm">👤</span>
                    <div className="truncate">
                      {activeProfile?.name ? (
                        <span className="font-bold text-amber-950">
                          {activeProfile.name}
                          {activeProfile.devoteeId && (
                            <span className="ml-1 font-mono text-[10px] text-amber-700 bg-amber-200/60 px-1 py-0.2 rounded">
                              {activeProfile.devoteeId}
                            </span>
                          )}
                          <span className="ml-1 text-[11px] text-amber-800 font-normal">
                            ({activeProfile.city || "Bengaluru"})
                          </span>
                        </span>
                      ) : ambientProfile.hasData ? (
                        <span className="font-bold text-amber-950">
                          {ambientProfile.name}
                          <span className="ml-1 text-[11px] text-amber-800 font-normal">
                            ({ambientProfile.city || "Bengaluru"})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {currentLang === "kn"
                            ? "ಯಾವುದೇ ಸಕ್ರಿಯ ಭಕ್ತರಿಲ್ಲ (WhatsApp ವಿವರ ಪೇಸ್ಟ್ ಮಾಡಲು ಪಕ್ಕದ ಬಟನ್ ಒತ್ತಿ)"
                            : "No active devotee selected (Click WhatsApp Details to paste)"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg border border-amber-500/70 bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95"
                      title="WhatsApp / Telegram ವಿವರಗಳನ್ನು ಪೇಸ್ಟ್ ಮಾಡಿ"
                    >
                      <span>📋</span>
                      <span>{currentLang === "kn" ? "WhatsApp ವಿವರಗಳು" : "WhatsApp Details"}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Action Suggestion Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto border-b border-amber-200/40 bg-white/80 px-3 py-2 text-xs scrollbar-none">
                  {ambientProfile.hasData && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSend(`${ambientProfile.name} ಅವರ ವಿವಾಹ ಯೋಗ ಮತ್ತು ದಾಂಪತ್ಯ ಜೀವನ ಹೇಗಿದೆ?`)}
                        className="flex items-center gap-1 rounded-xl border border-rose-400 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-950 hover:bg-rose-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                      >
                        <span>💍</span>
                        <span>{ambientProfile.name} - ವಿವಾಹ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${ambientProfile.name} ಅವರ ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಭವಿಷ್ಯ ತಿಳಿಸಿ`)}
                        className="flex items-center gap-1 rounded-xl border border-blue-400 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-950 hover:bg-blue-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                      >
                        <span>💼</span>
                        <span>{ambientProfile.name} - ವೃತ್ತಿ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend(`${ambientProfile.name} ಅವರ ೫ ಅಧಿಕೃತ ವರದಿಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡು`)}
                        className="flex items-center gap-1 rounded-xl border border-purple-400 bg-purple-50 px-2.5 py-1 text-xs font-black text-purple-950 hover:bg-purple-100 whitespace-nowrap shadow-xs transition-all active:scale-95"
                      >
                        <span>📑</span>
                        <span>{ambientProfile.name} - ೫ ವರದಿಗಳು</span>
                      </button>
                    </>
                  )}
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
                          {/* Mode Indicator Badge */}
                          {msg.mode === "voice" && (
                            <div className={`mb-1.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                              msg.sender === "user"
                                ? "bg-amber-800/80 text-amber-200 border border-amber-400/40"
                                : "bg-amber-100 text-amber-900 border border-amber-300/80"
                            }`}>
                              <span>🎙️</span>
                              <span>{currentLang === "kn" ? "ಧ್ವನಿ ಮೋಡ್ (Voice Mode)" : "Voice Mode Turn"}</span>
                            </div>
                          )}

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
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಅರ್ಚಕರ ಮೊಬೈಲ್ (Priest Mobile):" : "Priest Mobile:"}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {pendingConfirmation.priestPhone || (confirmationLang === "kn" ? "ಸ್ವಯಂಚಾಲಿತ ನಿಯೋಜನೆ" : "Auto-assigned")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {confirmationLang === "kn" ? "ಸೇವಾ QR ಕೋಡ್ (Seva QR):" : "Seva QR Code:"}
                          </span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {pendingConfirmation.includeQrCode !== false
                              ? (confirmationLang === "kn" ? "✅ ಸಕ್ರಿಯ (ಆನ್‌ಲೈನ್ ಸಂಕಲ್ಪ)" : "✅ Active (Live Sankalpa)")
                              : (confirmationLang === "kn" ? "❌ ಇಲ್ಲ" : "❌ No")}
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
                    {/* Speech Dictation to Textbox (No mode switch, direct speech typing) */}
                    <button
                      type="button"
                      onClick={toggleChatDictation}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                        isDictatingText
                          ? "border-rose-500 bg-rose-500 text-white animate-pulse shadow-md"
                          : "border-amber-400 bg-amber-100/80 text-amber-950 hover:bg-amber-200"
                      }`}
                      title={
                        isDictatingText
                          ? (currentLang === "kn" ? "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ (Stop Dictation)" : "Stop Dictation")
                          : (currentLang === "kn" ? "ಮಾತನಾಡಿ ಟೈಪ್ ಮಾಡಿ (Dictate to text box)" : "Dictate speech to text")
                      }
                    >
                      <span className="text-base">{isDictatingText ? "⏹️" : "🎤"}</span>
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

            {/* TAB 2: INTERACTIVE LIVE VOICE CONVERSATION SANCTUM */}
            {activeTab === "voice" && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#181109] via-[#24170C] to-[#0E0702] text-amber-50 p-4 sm:p-6 select-none animate-fade-in">
                {/* Voice Mode Header Bar */}
                <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  {/* Live Status Badge */}
                  <div className="flex items-center gap-2">
                    {isProcessing ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 px-3 py-1 text-xs font-bold text-amber-300 animate-pulse">
                        <span className="animate-spin text-sm">✨</span>
                        <span>{currentLang === "kn" ? "ಜ್ಯೋತಿಷ್ಯ ವಿಶ್ಲೇಷಣೆ..." : "Analyzing..."}</span>
                      </div>
                    ) : isAssistantSpeaking ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-400/25 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-200 shadow-md">
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:0ms] h-3" />
                          <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms] h-2" />
                          <span className="w-1 bg-amber-300 rounded-full animate-bounce [animation-delay:300ms] h-3.5" />
                        </span>
                        <span>{currentLang === "kn" ? "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ AI ಧ್ವನಿ (AI Studio Voice)" : "AI Studio Voice Speaking"}</span>
                      </div>
                    ) : isMicMuted ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-rose-950/60 border border-rose-500/60 px-3 py-1 text-xs font-bold text-rose-300">
                        <span>🔇</span>
                        <span>{currentLang === "kn" ? "ಮೈಕ್ ಮ್ಯೂಟ್ ಆಗಿದೆ" : "Mic Muted"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 px-3 py-1 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-950/40">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>{currentLang === "kn" ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ" : "Listening... Speak now"}</span>
                      </div>
                    )}
                  </div>

                  {/* Language Switcher Quick Pills */}
                  <div className="flex items-center gap-1 bg-black/40 border border-amber-500/30 rounded-full p-0.5">
                    {(["kn", "en", "hi", "te", "ta"] as SupportedLanguage[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLanguage(l)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase transition-all ${
                          currentLang === l
                            ? "bg-amber-500 text-slate-950 shadow-xs"
                            : "text-amber-200/70 hover:text-amber-100"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Sanctum Ambient Devotee Badge */}
                {ambientProfile.hasData && (
                  <div className="mt-2.5 flex items-center justify-between rounded-xl border border-amber-500/30 bg-black/50 px-3 py-1.5 text-xs text-amber-200 backdrop-blur-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-amber-400">🪐</span>
                      <span className="font-bold text-amber-300">
                        {currentLang === "kn" ? "ಸಕ್ರಿಯ ಜಾತಕ:" : currentLang === "hi" ? "सक्रिय कुंडली:" : currentLang === "te" ? "యాక్టివ్ జాతకం:" : currentLang === "ta" ? "செயலில் உள்ள ஜாதகம்:" : "Active Chart:"}
                      </span>
                      <span className="font-black text-amber-100">{ambientProfile.name}</span>
                      <span className="text-[11px] text-amber-400/80">
                        ({ambientProfile.birthDate} · {ambientProfile.birthTime} · {ambientProfile.city})
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      {currentLang === "kn" ? "ನೇರ ಜ್ಯೋತಿಷ್ಯ" : "Direct Shastra"}
                    </span>
                  </div>
                )}

                {/* Continuous Memory & Thread Sync Bar (ChatGPT / Claude / Gemini Live Parity) */}
                <div className="mt-2 rounded-xl border border-amber-500/30 bg-black/50 backdrop-blur-xs p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-amber-300 truncate text-[11px] sm:text-xs">
                        {currentLang === "kn" ? "🔗 ಸಂಭಾಷಣೆ ಸ್ಮರಣೆ ಸಕ್ರಿಯ" : "🔗 Unified Memory Sync Active"}
                      </span>
                      <span className="text-[10px] text-amber-200/70 font-mono">
                        ({messages.length} {currentLang === "kn" ? "ಸಂದೇಶಗಳು" : "turns"})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsVoiceTranscriptExpanded(!isVoiceTranscriptExpanded)}
                      className="text-[10px] font-bold text-amber-400 hover:text-amber-200 underline underline-offset-2 shrink-0 transition-colors"
                    >
                      {isVoiceTranscriptExpanded
                        ? (currentLang === "kn" ? "ಮರೆಮಾಡಿ ▲" : "Hide Thread ▲")
                        : (currentLang === "kn" ? "ಇತಿಹಾಸ ನೋಡಿ ▼" : "View Thread ▼")}
                    </button>
                  </div>

                  {/* Collapsible Shared Cross-Modal Thread */}
                  {isVoiceTranscriptExpanded && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {messages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-start gap-1.5 text-[11px] leading-tight ${
                            m.sender === "user" ? "text-amber-100" : "text-amber-300/90"
                          }`}
                        >
                          <span className="shrink-0 font-bold">
                            {m.sender === "user" ? (currentLang === "kn" ? "ನೀವು:" : "You:") : "AI:"}
                          </span>
                          <span className="shrink-0 rounded bg-white/10 px-1 text-[9px] text-amber-200 font-mono">
                            {m.mode === "voice" ? "🎙️" : "💬"}
                          </span>
                          <p className="line-clamp-2">{m.spokenText || m.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Center Sacred Animated Disc & Frequency Ripples */}
                <div className="relative flex flex-col items-center justify-center my-auto py-3">
                  {/* Dynamic Sound Wave Aura */}
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing Concentric Aura Rings */}
                    <div
                      className={`absolute h-44 w-44 sm:h-52 sm:w-52 rounded-full border-2 border-amber-400/20 transition-all duration-700 ${
                        isAssistantSpeaking
                          ? "scale-125 border-amber-400/40 animate-ping"
                          : isListening && !isMicMuted
                          ? "scale-110 border-emerald-400/30 animate-pulse"
                          : "scale-100"
                      }`}
                    />
                    <div
                      className={`absolute h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-700/10 blur-xl transition-all ${
                        isAssistantSpeaking ? "scale-125 opacity-100" : "scale-100 opacity-60"
                      }`}
                    />

                    {/* Central Mascot Disc */}
                    <div
                      className={`relative z-10 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 shadow-2xl p-2 transition-all ${
                        isAssistantSpeaking
                          ? "border-amber-400 bg-gradient-to-b from-amber-900 to-[#1F1206] shadow-amber-500/40 scale-105"
                          : isListening && !isMicMuted
                          ? "border-emerald-400 bg-gradient-to-b from-emerald-950 to-[#120B04] shadow-emerald-500/30"
                          : "border-amber-600/60 bg-[#1A1208] shadow-amber-950"
                      }`}
                    >
                      <PetIllustration type={petType} emotion={currentEmotion} isSpeaking={isSpeaking} />
                    </div>
                  </div>

                  {/* Voice Mode Title */}
                  <h3 className="mt-3 font-serif font-black text-sm sm:text-base text-amber-200 tracking-wide text-center">
                    {petTitles[petType][currentLang]}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-amber-300/80 text-center max-w-sm mt-0.5 font-medium px-2">
                    {isProcessing
                      ? (currentLang === "kn" ? "ಗಣನೆ ನಡೆಯುತ್ತಿದೆ..." : "Analyzing astrological shastras...")
                      : isAssistantSpeaking
                      ? (currentLang === "kn" ? "ತೃತೀಯ AI Studio ಧ್ವನಿಯಲ್ಲಿ ಸಂಪೂರ್ಣ ವಿವರಣೆ ನೀಡಲಾಗುತ್ತಿದೆ..." : "Explaining full details via AI Studio Voice...")
                      : isMicMuted
                      ? (currentLang === "kn" ? "ಮೈಕ್ ಮ್ಯೂಟ್ ಆಗಿದೆ. ಮಾತನಾಡಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ." : "Mic muted. Tap mic to unmute and speak.")
                      : (currentLang === "kn" ? "ಮೈಕ್ ಆನ್ ಆಗಿದೆ. ಜಾತಕ, ಭವಿಷ್ಯ, ಪಂಚಾಂಗದ ಕುರಿತು ನೇರವಾಗಿ ಮಾತನಾಡಿ." : "Mic is live. Speak naturally like a phone call.")}
                  </p>
                </div>

                {/* Live Transcript & Real-Time Answer Glass Card */}
                <div className="w-full rounded-2xl border border-amber-500/25 bg-black/40 backdrop-blur-md p-3 sm:p-4 max-h-40 overflow-y-auto space-y-2 scrollbar-thin">
                  {liveTranscript && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-amber-400 shrink-0">
                        {currentLang === "kn" ? "ನೀವು:" : "You:"}
                      </span>
                      <p className="text-xs text-amber-100 font-medium leading-relaxed italic">
                        "{liveTranscript}"
                      </p>
                    </div>
                  )}

                  {lastSpokenAnswer ? (
                    <div className="flex items-start gap-2 pt-1 border-t border-amber-500/15">
                      <span className="text-xs font-bold text-emerald-400 shrink-0">
                        {currentLang === "kn" ? "ಕಾಮಧೇನು:" : "Assistant:"}
                      </span>
                      <p className="text-xs text-amber-200/90 leading-relaxed max-h-24 overflow-y-auto">
                        {lastSpokenAnswer}
                      </p>
                    </div>
                  ) : messages.length > 1 ? (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-amber-300/70 border-t border-amber-500/15">
                      <span>💬</span>
                      <span>
                        {currentLang === "kn"
                          ? "ಪಠ್ಯ ಸಂಭಾಷಣೆಯ ವಿಷಯ ಸ್ಮರಣೆಯಲ್ಲಿದೆ. ನೇರವಾಗಿ ಮಾತನಾಡಿ ಮುಂದುವರಿಸಿ..."
                          : "Chat history in memory. Speak naturally to continue from where you left off in text..."}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-300/50 text-center italic">
                      {currentLang === "kn"
                        ? "ಉದಾಹರಣೆ: 'ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಜಾತಕ ತಯಾರಿಸಿ', 'ನನ್ನ ೧೦ನೇ ಮನೆ ವೃತ್ತಿಜೀವನ ಹೇಗಿದೆ?', 'ಸಂಖ್ಯಾಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ನನ್ನ ಅದೃಷ್ಟ ರತ್ನ ಯಾವುದು?'..."
                        : "e.g. 'Generate kundali for Shriram Pandit', 'How is my 10th house career?', 'What is my lucky gem according to Sankhya Shastra?'..."}
                    </p>
                  )}
                </div>

                {/* Interactive Voice Controls Dock */}
                <div className="flex items-center justify-between gap-3 pt-3">
                  {/* Return to Chat Mode */}
                  <button
                    type="button"
                    onClick={exitVoiceMode}
                    className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-amber-200 transition-colors"
                    title="ಪಠ್ಯ ಸಂಭಾಷಣೆಗೆ ಮರಳಿ (Back to Chat)"
                  >
                    <span>💬</span>
                    <span className="hidden sm:inline">{currentLang === "kn" ? "ಪಠ್ಯ ಚಾಟ್" : "Text Chat"}</span>
                  </button>

                  {/* Main Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleMicMute}
                    className={`relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 shadow-2xl transition-all transform active:scale-95 ${
                      !isMicMuted
                        ? "border-emerald-400 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-emerald-500/50"
                        : "border-rose-400 bg-gradient-to-b from-rose-700 to-rose-900 text-rose-100 shadow-rose-900/50"
                    }`}
                    title={!isMicMuted ? "ಮೈಕ್ ಮ್ಯೂಟ್ ಮಾಡಿ (Mute mic)" : "ಮೈಕ್ ಅನ್‌ಮ್ಯೂಟ್ ಮಾಡಿ (Unmute mic)"}
                  >
                    {!isMicMuted && (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
                    )}
                    <span className="text-2xl">{!isMicMuted ? "🎙️" : "🔇"}</span>
                  </button>

                  {/* Interrupt / Stop Speech Button */}
                  <button
                    type="button"
                    onClick={interruptAssistant}
                    disabled={!isAssistantSpeaking}
                    className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                      isAssistantSpeaking
                        ? "border-amber-400 bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 animate-pulse hover:bg-amber-400"
                        : "border-white/10 bg-white/5 text-amber-300/40 opacity-40 cursor-not-allowed"
                    }`}
                    title="ಮಾತನ್ನು ನಿಲ್ಲಿಸಿ (Interrupt / Stop Speech)"
                  >
                    <span>⏹️</span>
                    <span className="hidden sm:inline">{currentLang === "kn" ? "ನಿಲ್ಲಿಸಿ" : "Interrupt"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DEVOTEE CONSULTATION HISTORY LOG */}
            {activeTab === "history" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-amber-100/30 p-3 sm:p-4 animate-fade-in">
                {/* Header & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📜</span>
                      <h3 className="font-serif font-black text-sm text-amber-950">
                        {currentLang === "kn" ? "ಭಕ್ತರ ಸಮಾಲೋಚನೆಗಳ ಇತಿಹಾಸ" : "Devotee Consultation History"}
                      </h3>
                      <span className="rounded-full bg-amber-700 px-2 py-0.2 text-[10px] font-bold text-white">
                        {devoteeRecords.length} {currentLang === "kn" ? "ದಾಖಲೆಗಳು" : "Records"}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {currentLang === "kn"
                        ? "ಹಿಂದಿನ ಎಲ್ಲಾ ಭಕ್ತರ ವಿವರಗಳು, ಕುಂಡಲಿ, ಸಂದೇಶಗಳು ಹಾಗೂ ವರದಿಗಳ ಇತಿಹಾಸ. ಇಲ್ಲಿಂದ ನೇರವಾಗಿ ಚಾಟ್ ಅಥವಾ ವಾಯ್ಸ್ ಮುಂದುವರಿಸಿ!"
                        : "Past consultations, Kundlis, and generated reports. Resume seamlessly in Chat or Voice mode."}
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder={
                        currentLang === "kn" ? "ಹೆಸರು / ಐಡಿ / ಸ್ಥಳ ಹುಡುಕಿ..." : "Search by Name, ID, City..."
                      }
                      className="w-full sm:w-56 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-600 focus:outline-hidden"
                    />
                    {historySearchQuery && (
                      <button
                        type="button"
                        onClick={() => setHistorySearchQuery("")}
                        className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Devotees List / Table */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {filteredDevotees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                      <span className="text-3xl mb-2">📜</span>
                      <p className="text-xs font-medium">
                        {historySearchQuery
                          ? (currentLang === "kn" ? "ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ." : "No devotees match search.")
                          : (currentLang === "kn"
                              ? "ಇನ್ನೂ ಯಾವುದೇ ಭಕ್ತರ ವಿವರಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ. WhatsApp ಪೇಸ್ಟ್ ಮೂಲಕ ಅಥವಾ ಹೊಸ ಪ್ರಶ್ನೆ ಕೇಳಿ ದಾಖಲಿಸಿ."
                              : "No devotee consultation records yet.")}
                      </p>
                    </div>
                  ) : (
                    filteredDevotees.map((devotee) => (
                      <div
                        key={devotee.id}
                        className={`rounded-2xl border p-3 bg-white shadow-xs transition-all ${
                          activeProfile?.devoteeId === devotee.id
                            ? "border-amber-600 ring-2 ring-amber-400/40 bg-amber-50/30"
                            : "border-amber-200 hover:border-amber-400"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-900">{devotee.name}</h4>
                              <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md">
                                {devotee.id}
                              </span>
                              {activeProfile?.devoteeId === devotee.id && (
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-md">
                                  ✓ {currentLang === "kn" ? "ಸಕ್ರಿಯ" : "Active"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-600">
                              <span>📅 {devotee.birthDate || "-"} {devotee.birthTime ? `· ${devotee.birthTime}` : ""}</span>
                              <span>📍 {devotee.city} {devotee.pincode ? `(${devotee.pincode})` : ""}</span>
                              <span>💬 {devotee.consultationCount} {currentLang === "kn" ? "ಸಮಾಲೋಚನೆಗಳು" : "sessions"}</span>
                              {devotee.reports.length > 0 && (
                                <span className="font-semibold text-emerald-800">
                                  📦 {devotee.reports.length} {currentLang === "kn" ? "ವರದಿಗಳು" : "reports"}
                                </span>
                              )}
                            </div>

                            {devotee.customQuestions && devotee.customQuestions.length > 0 && (
                              <div className="mt-1.5 text-[11px] text-purple-900 bg-purple-50 border border-purple-200 rounded-lg px-2 py-1">
                                ❓ {devotee.customQuestions[0]}
                                {devotee.customQuestions.length > 1 && ` (+${devotee.customQuestions.length - 1} more)`}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleResumeDevotee(devotee, "chat")}
                              className="flex items-center gap-1 rounded-xl border border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all"
                              title="ಚಾಟ್‌ನಲ್ಲಿ ಮುಂದುವರಿಸಿ (Resume in Chat)"
                            >
                              <span>💬</span>
                              <span>{currentLang === "kn" ? "ಚಾಟ್" : "Chat"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResumeDevotee(devotee, "voice")}
                              className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-gradient-to-r from-emerald-600 to-emerald-700 px-2.5 py-1 text-xs font-bold text-white shadow-2xs hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all"
                              title="ಲೈವ್ ವಾಯ್ಸ್‌ನಲ್ಲಿ ಮುಂದುವರಿಸಿ (Resume in Voice)"
                            >
                              <span>🎙️</span>
                              <span>{currentLang === "kn" ? "ವಾಯ್ಸ್" : "Voice"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(currentLang === "kn" ? "ಈ ಭಕ್ತರ ದಾಖಲೆಯನ್ನು ಅಳಿಸಲು ಖಚಿತಪಡಿಸಿ?" : "Delete this devotee record?")) {
                                  useDevoteeHistoryStore.getState().deleteDevotee(devotee.id);
                                }
                              }}
                              className="rounded-xl border border-slate-200 p-1 text-xs text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                              title="ಅಳಿಸಿ (Delete)"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: TASK MANAGER / FLEET MONITOR SCREEN (UP TO 10 INSTANCES) */}
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

      {/* 📋 ON-DEMAND WHATSAPP / TELEGRAM DEVOTEE INPUT MODAL */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative flex flex-col w-full max-w-lg rounded-2xl border-2 border-amber-500 bg-[#FFFDF9] text-slate-900 shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-300 bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <div>
                  <h4 className="font-serif font-black text-sm sm:text-base tracking-wide">
                    {currentLang === "kn" ? "WhatsApp / Telegram ವಿವರಗಳ ಪೇಸ್ಟ್" : "Paste Devotee WhatsApp / Telegram Details"}
                  </h4>
                  <span className="text-[10px] text-amber-100 font-medium">
                    {currentLang === "kn" ? "ಹೆಸರು, ದಿನಾಂಕ, ಸಮಯ, ಸ್ಥಳ ಹಾಗೂ ಪ್ರಶ್ನೆಗಳು" : "Name, Date, Time, Place & Questions"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="rounded-full bg-white/20 p-1 text-white hover:bg-white/30 text-sm font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950">
                  {currentLang === "kn" ? "ಸಂದೇಶ ಪೇಸ್ಟ್ ಮಾಡಿ:" : "Paste raw devotee message:"}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex items-center gap-1 rounded-lg border border-amber-400 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-950 hover:bg-amber-50 shadow-2xs transition-all active:scale-95"
                  >
                    <span>📋</span>
                    <span>{currentLang === "kn" ? "ಕ್ಲಿಪ್‌ಬೋರ್ಡ್ ಪೇಸ್ಟ್" : "Paste Clipboard"}</span>
                  </button>
                  {whatsAppText && (
                    <button
                      type="button"
                      onClick={handleClearWhatsAppBox}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700 hover:bg-red-50 hover:text-red-700 transition-all"
                    >
                      {currentLang === "kn" ? "ತೆರವು" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={whatsAppText}
                onChange={(e) => handleWhatsAppTextChange(e.target.value)}
                rows={4}
                placeholder={
                  currentLang === "kn"
                    ? "WhatsApp ಅಥವಾ Telegram ನಿಂದ ಬಂದಿರುವ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಪೇಸ್ಟ್ ಮಾಡಿ...\nಉದಾಹರಣೆಗೆ:\nಹೆಸರು: ರಮೇಶ್ ಭಟ್\nದಿನಾಂಕ: 15/05/1990\nಸಮಯ: 10:30 AM\nಸ್ಥಳ: ಬೆಂಗಳೂರು\nಪ್ರಶ್ನೆ: ನನ್ನ ಉದ್ಯೋಗ ಮತ್ತು ವಿದೇಶ ಪ್ರಯಾಣ ಯೋಗ ಹೇಗಿದೆ?"
                    : "Paste raw message here...\nExample:\nName: Ramesh Bhat\nDOB: 15/05/1990\nTime: 10:30 AM\nPlace: Bengaluru\nQuestion: When will I get promotion?"
                }
                className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono leading-relaxed shadow-inner"
              />

              {/* Extracted Preview Chips */}
              {parsedKundli && parsedKundli.hasData && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-2.5 space-y-1.5 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1 text-[11px] font-black text-emerald-950">
                    <span className="flex items-center gap-1">
                      <span className="text-emerald-600">✓</span>
                      <span>{currentLang === "kn" ? "ಗುರುತಿಸಲಾದ ವಿವರಗಳು" : "Extracted Fields"}</span>
                    </span>
                    <span className="text-emerald-800 font-semibold">{parsedKundli.city} ({parsedKundli.pincode})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {parsedKundli.name && (
                      <span className="rounded-md border border-emerald-400 bg-white px-2 py-0.5 font-bold text-emerald-950">
                        👤 {parsedKundli.name}
                      </span>
                    )}
                    {parsedKundli.birthDate && (
                      <span className="rounded-md border border-emerald-400 bg-white px-2 py-0.5 font-bold text-emerald-950">
                        📅 {parsedKundli.birthDate}
                      </span>
                    )}
                    {parsedKundli.birthTime && (
                      <span className="rounded-md border border-emerald-400 bg-white px-2 py-0.5 font-bold text-emerald-950">
                        ⏰ {parsedKundli.birthTime}
                      </span>
                    )}
                    {parsedKundli.customQuestions.length > 0 && (
                      <span className="rounded-md border border-purple-400 bg-purple-50 px-2 py-0.5 font-bold text-purple-950">
                        ❓ {parsedKundli.customQuestions[0]}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Take Input Button */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  {currentLang === "kn" ? "ರದ್ದು" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleTakeWhatsAppInput}
                  disabled={!whatsAppText.trim()}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-600 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-4 py-2 text-xs font-black text-white shadow-md transition-all disabled:opacity-50 active:scale-95"
                >
                  <span>📥</span>
                  <span>{currentLang === "kn" ? "ವಿವರಗಳನ್ನು ಸ್ವೀಕರಿಸಿ (Take Input)" : "Accept Details (Take Input)"}</span>
                </button>
              </div>
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
