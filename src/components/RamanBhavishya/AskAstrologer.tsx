import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import predictiveRules from "../../data/predictive_rules.json";
import { AyurdayaEngine } from "../../core/AyurdayaEngine";
import { translateText } from "../../utils/translator";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { generateChatResponse } from "../../core/DynamicChatEngine";

type Props = {
  session: KundliViewerSession;
};

type ChatMessage = {
  id: string;
  sender: "user" | "astrologer";
  text: string;
};

const SUGGESTIONS = [
  { id: "lifespan", label: "What is my expected Lifespan?" },
  { id: "marriage", label: "What are my Marriage & Relationship prospects?" },
  { id: "children", label: "What does my chart say about Children?" },
  { id: "job", label: "How are my Job and Career prospects?" },
  { id: "newHome", label: "Is it a good time for a New Home / Property?" },
  { id: "family", label: "How is my Family life currently?" },
  { id: "father", label: "How is my Father's well-being?" },
  { id: "dasha", label: "What is the focus of my current Life Chapter?" },
];

export default function AskAstrologer({ session }: Props): JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [translatedSuggestions, setTranslatedSuggestions] = useState<{id: string, label: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTtsLang = (langCode: string) => {
    switch (langCode) {
      case "kn": return "kn-IN";
      case "hi": return "hi-IN";
      case "te": return "te-IN";
      case "ta": return "ta-IN";
      case "en": return "en-IN";
      default: return "en-US";
    }
  };

  const playAudio = (text: string, msgId: string) => {
    if (!window.speechSynthesis) return;

    if (playingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingMsgId(msgId);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getTtsLang(language);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    utterance.onend = () => {
      setPlayingMsgId(null);
    };
    
    utterance.onerror = () => {
      setPlayingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop audio if component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    async function initGreeting() {
      // Base greeting in native Kannada for highest quality translation source
      const baseGreeting = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಜ್ಯೋತಿಷಿ. ಟೈಪ್ ಮಾಡುವ ಬದಲು, ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಆಳವಾದ ಒಳನೋಟದ ವಿಷಯಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನಾನು ನಿಮ್ಮ ಚಾರ್ಟ್ ಅನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿಶ್ಲೇಷಿಸುತ್ತೇನೆ.";
      
      const greetingText = await translateText(baseGreeting, language, "kn");
      
      setMessages([
        {
          id: "initial",
          sender: "astrologer",
          text: greetingText
        }
      ]);

      const translatedSugs = await Promise.all(SUGGESTIONS.map(async (s) => ({
        id: s.id,
        label: await translateText(s.label, language, "en") // Suggestions are in English
      })));
      setTranslatedSuggestions(translatedSugs);
    }
    initGreeting();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSuggestionClick = async (suggestionId: string, suggestionLabel: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: suggestionLabel
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setShowSuggestions(false);

    const now = new Date();
    const ageYears = ageDecimalYearsAt(
      session.input.birthDate, session.input.birthTime, session.input.latitude, session.input.longitude, now
    );
    const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

    const baseResponse = generateChatResponse(session.result, currentBhuktiData || null, suggestionId);
    
    // Translate from native Kannada ("kn") to user's selected language
    const translatedResponse = await translateText(baseResponse, language, "kn");
    
    const astroMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "astrologer",
      text: translatedResponse
    };
    
    setMessages((prev) => [...prev, astroMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] rounded-2xl border border-amber-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden animate-fade-in relative">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        {!showSuggestions && messages.length > 0 && (
          <div className="flex justify-center mb-4 sticky top-0 z-10">
            <button 
              onClick={() => setShowSuggestions(true)}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-amber-200 dark:border-slate-600 shadow-sm text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t("Ask Another Question", "Ask Another Question")}
            </button>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap relative group ${
                msg.sender === "user"
                  ? "bg-amber-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none"
              }`}
            >
              {msg.text}
              
              {/* Audio Button for Astrologer messages */}
              {msg.sender === "astrologer" && (
                <button 
                  onClick={() => playAudio(msg.text, msg.id)}
                  className={`absolute -bottom-3 -right-3 p-2 rounded-full shadow-md transition-all border ${
                    playingMsgId === msg.id 
                      ? "bg-amber-500 text-white border-amber-500 animate-pulse" 
                      : "bg-white text-slate-500 hover:text-amber-600 hover:border-amber-300 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  } opacity-0 group-hover:opacity-100 focus:opacity-100`}
                  title={playingMsgId === msg.id ? "Stop reading" : "Listen to reading"}
                >
                  {playingMsgId === msg.id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-amber-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Options Area */}
      {showSuggestions && (
        <div className="border-t border-amber-100 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{t("Select a Deep Insight Query", "Select a Deep Insight Query")}</p>
            {messages.length > 0 && (
              <button onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pb-2">
            {translatedSuggestions.map((sug) => (
              <button
                key={sug.id}
                onClick={() => handleSuggestionClick(sug.id, sug.label)}
                disabled={isTyping}
                className="px-4 py-2 bg-orange-50 hover:bg-amber-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-amber-900 dark:text-amber-100 text-sm font-medium rounded-full transition-colors border border-amber-200 dark:border-slate-600 disabled:opacity-50 text-left"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
