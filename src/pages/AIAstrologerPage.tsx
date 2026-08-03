import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useAppStore } from "../stores/appStore";
import { askGemini } from "../core/GeminiEngine";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";

type ChatMessage = {
  id: string;
  sender: "user" | "astrologer";
  text: string;
};

export default function AIAstrologerPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const language = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const session = useKundliViewerStore((s) => s.session);
  const setSession = useKundliViewerStore((s) => s.setSession);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const nodeType = useAppStore((s) => s.nodeType);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [chartReady, setChartReady] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize AI Greeting
  useEffect(() => {
    if (session) {
      setChartReady(true);
      addAIBubble(t("ai.greeting_ready", "Hello! I am your AI Astrologer. I have your chart ready. What would you like to ask?"));
    } else {
      addAIBubble(t("ai.greeting_need_data", "Namaskara! I am your AI Astrologer. Please tell me your Date of Birth and Time (for example: 31 May 1993 11:30 AM)."));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addAIBubble = (text: string) => {
    const msgId = Date.now().toString();
    setMessages((prev) => [...prev, { id: msgId, sender: "astrologer", text }]);
    playAudio(text, msgId);
  };

  const getTtsLang = (langCode: string) => {
    switch (langCode) {
      case "kn": return "kn-IN";
      case "hi": return "hi-IN";
      case "te": return "te-IN";
      case "ta": return "ta-IN";
      case "ml": return "ml-IN";
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
    utterance.rate = 0.9;
    
    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
    }
  };

  useEffect(() => {
    return stopAudio;
  }, []);

  const handleSend = async (textOverride?: string) => {
    const rawText = textOverride || inputText;
    if (!rawText.trim()) return;

    // Constrain the prompt for Gemini
    const textToSend = `Please answer the following question in a conversational, spoken style (under 4 sentences): ${rawText}`;

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: rawText }]);
    setInputText("");
    setIsTyping(true);
    stopAudio();

    if (!chartReady) {
      // Try to parse DOB/Time
      const extracted = tryParseDate(textToSend);
      if (extracted.date && extracted.time) {
        try {
          // Generate dummy chart with default location since they only provided date/time
          // In a real scenario, we'd also ask for location, but we'll use default.
          const ymd = `${extracted.date.getFullYear()}-${(extracted.date.getMonth()+1).toString().padStart(2, '0')}-${extracted.date.getDate().toString().padStart(2, '0')}`;
          const inputPayload = {
            name: "User",
            birthDate: ymd,
            birthTime: extracted.time,
            latitude: useAppStore.getState().defaultLat,
            longitude: useAppStore.getState().defaultLng,
          };
          const output = await calculateKundliWithPlaceSun(inputPayload, { ayanamsaModel, nodeType });
          setSession({
            result: output,
            input: inputPayload,
            birthDateYmd: ymd,
            birthTimeHm: extracted.time,
            homePlaceName: useAppStore.getState().placeLabel,
            placeLabel: useAppStore.getState().placeLabel,
            dasha: [],
            dailyPrediction: ""
          });
          setChartReady(true);
          addAIBubble(t("ai.chart_success", "I have generated your Kundali! Now, what is your question?"));
        } catch (e) {
          addAIBubble(t("ai.chart_error", "I heard the date and time, but I couldn't generate the chart. Please try again."));
        }
      } else {
        addAIBubble(t("ai.need_clarification", "I couldn't quite catch the date and time. Could you please repeat it clearly?"));
      }
      setIsTyping(false);
      return;
    }

    // Chart is ready, ask Gemini
    const contextStr = session ? JSON.stringify({
      lagna: session.result.lagnaRashi?.english || "Unknown",
      moonSign: session.result.moonSign?.english || "Unknown",
      nakshatra: session.result.planets?.find(p => p.name === "Moon")?.nakshatra?.english || "Unknown",
      planets: (session.result.planets || []).map(p => `${p.name} in ${p.rashi?.english} (${p.house} house)`)
    }) : "";

    const response = await askGemini(textToSend, contextStr, geminiApiKey, i18n.language);
    addAIBubble(response);
    setIsTyping(false);
  };

  const tryParseDate = (text: string) => {
    const knMonths = ["ಜನವರಿ", "ಫೆಬ್ರವರಿ", "ಮಾರ್ಚ್", "ಏಪ್ರಿಲ್", "ಮೇ", "ಜೂನ್", "ಜುಲೈ", "ಆಗಸ್ಟ್", "ಸೆಪ್ಟೆಂಬರ್", "ಅಕ್ಟೋಬರ್", "ನವೆಂಬರ್", "ಡಿಸೆಂಬರ್"];
    const enMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "aug", "sep", "sept", "oct", "nov", "dec"];
    
    let realMonth = -1;
    for (let i = 0; i < knMonths.length; i++) {
      if (text.toLowerCase().includes(knMonths[i])) { realMonth = i; break; }
    }
    if (realMonth === -1) {
      for (let i = 0; i < enMonths.length; i++) {
        if (text.toLowerCase().includes(enMonths[i])) {
          realMonth = new Date(Date.parse(enMonths[i] +" 1, 2012")).getMonth();
          break;
        }
      }
    }

    let dateObj: Date | null = null;
    let timeStr = "";

    if (realMonth !== -1) {
      const yearMatch = text.match(/\b(19|20)\d{2}\b/);
      const dayMatch = text.match(/\b(1st|2nd|3rd|\d{1,2}(th)?)\b/);
      
      if (yearMatch && dayMatch) {
        const dayNum = parseInt(dayMatch[0].replace(/\D/g, ''), 10);
        const yearNum = parseInt(yearMatch[0], 10);
        if (dayNum >= 1 && dayNum <= 31) {
          dateObj = new Date(yearNum, realMonth, dayNum, 12, 0, 0, 0);
        }
      }
    }

    const pat1 = /(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)\s*(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?/i;
    const pat2 = /\b(\d{1,2})(?:\s*:?\s*|\s+)(\d{2})?\s*(ಬೆಳಿಗ್ಗೆ|ಮಧ್ಯಾಹ್ನ|ಸಂಜೆ|ರಾತ್ರಿ|am|pm)/i;
    const pat3 = /\b(\d{1,2}):(\d{2})\b/i;

    let match = text.match(pat1);
    let hr = 0, mn = 0, marker = "";
    if (match) {
        marker = match[1].toLowerCase();
        hr = parseInt(match[2], 10);
        mn = match[3] ? parseInt(match[3], 10) : 0;
    } else {
        match = text.match(pat2);
        if (match) {
            hr = parseInt(match[1], 10);
            mn = match[2] ? parseInt(match[2], 10) : 0;
            marker = match[3].toLowerCase();
        } else {
            match = text.match(pat3);
            if (match) {
                hr = parseInt(match[1], 10);
                mn = parseInt(match[2], 10);
            }
        }
    }

    if (match) {
      const isPM = marker === "pm" || marker === "ಮಧ್ಯಾಹ್ನ" || marker === "ಸಂಜೆ" || marker === "ರಾತ್ರಿ";
      const isAM = marker === "am" || marker === "ಬೆಳಿಗ್ಗೆ";
      
      if (isPM && hr < 12) hr += 12;
      if (isAM && hr === 12) hr = 0;
      
      timeStr = `${hr.toString().padStart(2, '0')}:${mn.toString().padStart(2, '0')}`;
    }

    return { date: dateObj, time: timeStr };
  };

  const startDictation = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language.startsWith('kn') ? 'kn-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsDictating(true);
    recognition.onend = () => setIsDictating(false);
    recognition.onerror = () => setIsDictating(false);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputText(text);
      handleSend(text);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[70vh] md:h-[80vh] rounded-2xl border border-indigo-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden animate-fade-in relative">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap relative group ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none"
              }`}
            >
              {msg.text}
              
              {/* Audio Button for Astrologer messages */}
              {msg.sender === "astrologer" && (
                <button 
                  onClick={() => playAudio(msg.text, msg.id)}
                  className={`absolute -bottom-3 -right-3 p-2 rounded-full shadow-md transition-all border ${
                    playingMsgId === msg.id 
                      ? "bg-indigo-500 text-white border-indigo-500 animate-pulse" 
                      : "bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
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
            <div className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-indigo-100 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 animate-slide-up">
        <form 
          className="flex gap-2"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <button
            type="button"
            onClick={startDictation}
            className={`p-3 rounded-full flex-shrink-0 transition-colors ${
              isDictating 
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-slate-700 dark:text-indigo-400 dark:hover:bg-slate-600"
            }`}
            title="Use Voice Dictation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder={isDictating ? t("ai.listening", "Listening...") : t("ai.placeholder", "Type your question here...")}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-5 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {t("ai.send", "Send")}
          </button>
        </form>
      </div>
    </div>
  );
}
