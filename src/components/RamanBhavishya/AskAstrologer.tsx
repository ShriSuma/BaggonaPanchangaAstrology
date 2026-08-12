import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { KundliViewerSession } from "../../stores/kundliViewerStore";
import { useAppStore } from "../../stores/appStore";
import { translateText } from "../../utils/translator";
import { findBhuktiAtAge } from "../../core/DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../../core/birthTime";
import { askGemini } from "../../core/GeminiEngine";

type Props = {
  session: KundliViewerSession;
};

type ChatMessage = {
  id: string;
  sender: "user" | "astrologer";
  text: string;
};

const CATEGORIES = [
  { id: "general", labelEn: "General Overview & Current Life", labelKn: "ಸಾಮಾನ್ಯ ಜೀವನ ಒಳನೋಟ" },
  { id: "marriage", labelEn: "Marriage & Relationships", labelKn: "ವಿವಾಹ ಮತ್ತು ವೈವಾಹಿಕ ಜೀವನ" },
  { id: "job", labelEn: "Job & Career Prospects", labelKn: "ಉದ್ಯೋಗ ಮತ್ತು ವೃತ್ತಿ ಭವಿಷ್ಯ" },
  { id: "education", labelEn: "Education & Studies", labelKn: "ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾಭ್ಯಾಸ" },
  { id: "children", labelEn: "Children & Progeny (Santana)", labelKn: "ಸಂತಾನ ಹಾಗೂ ಮಕ್ಕಳ ಯೋಗ" },
  { id: "family", labelEn: "Family & Home Comforts", labelKn: "ಕುಟುಂಬ ಮತ್ತು ಗೃಹ ಸೌಖ್ಯ" },
  { id: "wealth", labelEn: "Wealth & Financial Status", labelKn: "ಧನ ಸಂಪತ್ತು ಮತ್ತು ಆರ್ಥಿಕ ಸ್ಥಿತಿ" },
  { id: "travel", labelEn: "Foreign Travel & Relocation", labelKn: "ವಿದೇಶ ಪ್ರಯಾಣ ಹಾಗೂ ಸ್ಥಳಾಂತರ" },
  { id: "health", labelEn: "Health & Longevity", labelKn: "ಆರೋಗ್ಯ ಮತ್ತು ದೀರ್ಘಾಯುಷ್ಯ" },
];

export default function AskAstrologer({ session }: Props): JSX.Element {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [translatedCategories, setTranslatedCategories] = useState<{ id: string; label: string }[]>([]);

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
    utterance.rate = 0.9;
    
    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    async function initGreeting() {
      const baseGreeting = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವೈದಿಕ ಜ್ಯೋತಿಷಿ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಮೂಲಕ ಮಾತನಾಡಿ. ನಾನು ನಿಮ್ಮ ಚಾರ್ಟ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಸಂಪೂರ್ಣ 4-ಪ್ಯಾರಾಗ್ರಾಫ್ ವಿವರಣೆ ನೀಡುತ್ತೇನೆ.";
      const greetingText = await translateText(baseGreeting, language, "kn");

      setMessages([
        {
          id: "initial",
          sender: "astrologer",
          text: greetingText
        }
      ]);

      const translatedCats = await Promise.all(
        CATEGORIES.map(async (c) => ({
          id: c.id,
          label: await translateText(c.labelEn, language, "en")
        }))
      );
      setTranslatedCategories(translatedCats);
    }
    initGreeting();
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getTtsLang(language);

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCustomQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleGenerateAnswer = async (overrideCategory?: string, overrideText?: string) => {
    const catId = overrideCategory || selectedCategory;
    const userQueryText = (overrideText !== undefined ? overrideText : customQuestion).trim();

    const selectedCatObj = CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
    const categoryName = translatedCategories.find(c => c.id === catId)?.label || selectedCatObj.labelEn;

    const displayUserMsg = userQueryText
      ? `[${categoryName}] ${userQueryText}`
      : `${categoryName}`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: displayUserMsg
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setCustomQuestion("");

    const now = new Date();
    const ageYears = ageDecimalYearsAt(
      session.input.birthDate,
      session.input.birthTime,
      session.input.latitude,
      session.input.longitude,
      now
    );
    const currentBhuktiData = findBhuktiAtAge(session.result, ageYears);

    const moonPlanet = session.result.planets.find(p => p.name === 'Moon');
    const lagnaName = session.result.lagnaRashi?.english || 'Unknown';
    const moonSign = session.result.moonSign.english;
    const nakshatra = moonPlanet?.nakshatra.english || 'Unknown';
    const dashaText = currentBhuktiData ? `${currentBhuktiData.maha.planet} - ${currentBhuktiData.bhukti}` : 'Current Dasha';

    const planetPositions = session.result.planets.map(p => `${p.name} in House ${p.house} (${p.rashi.english})`).join(', ');

    const prompt = `You are an empathetic, highly learned master Vedic Astrologer giving a profound 4-PARAGRAPH response to the user's specific query.
OUTPUT LANGUAGE: ${language}.${language === 'kn' ? ' Write EXCLUSIVELY in pure Kannada script.' : language === 'te' ? ' Write EXCLUSIVELY in pure Telugu script.' : language === 'ta' ? ' Write EXCLUSIVELY in pure Tamil script.' : language === 'hi' ? ' Write EXCLUSIVELY in pure Hindi (Devanagari).' : ' Write in clear English.'}

USER DETAILS:
- Name: ${session.input.name}
- Age: ${ageYears.toFixed(1)} years
- Ascendant (Lagna): ${lagnaName}
- Moon Sign (Rashi): ${moonSign}
- Nakshatra: ${nakshatra}
- Current Running Dasha & Bhukti: ${dashaText}
- Planetary Placements: ${planetPositions}

USER QUERY TOPIC: ${selectedCatObj.labelEn}
SPECIFIC QUESTION / DETAIL: "${userQueryText || 'Detailed perspective on this topic'}"

STRICT 4-PARAGRAPH FORMAT (DO NOT USE MARKDOWN HEADINGS OR BULLET POINTS, RESPOND IN 4 COMPLETE PARAGRAPHS SEPARATED BY DOUBLE NEWLINES):

PARAGRAPH 1 (Kundali & House Placement Analysis):
Explain the natal planetary placements, houses, and lords relevant to ${selectedCatObj.labelEn} in their birth chart. Speak directly to ${session.input.name}.

PARAGRAPH 2 (Current Dasha-Bhukti & Gochara Transits):
Analyze how the current running ${dashaText} period combined with major current transits (Gochara - Saturn, Jupiter, Rahu/Ketu) influences this topic right now.

PARAGRAPH 3 (Specific Prediction, Timeline & Guidance):
Give clear, specific predictions, expected outcomes, favorable timing windows, and practical decision guidance regarding their query.

PARAGRAPH 4 (Remedial Guidance & Astrologer's Blessing):
Provide 2 practical, spiritual/remedial recommendations (Parihara/Mantra/Charity) and conclude with a warm, uplifting blessing.
`;

    try {
      const responseText = await askGemini(
        `Ask Astrologer: ${selectedCatObj.labelEn}`,
        prompt,
        geminiApiKey,
        language,
        { raw: true, temperature: 0.7 }
      );

      const astroMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "astrologer",
        text: responseText
      };

      setMessages((prev) => [...prev, astroMsg]);
    } catch (e: any) {
      const fallbackMsg = await translateText(
        "May the divine stars guide your path. Based on your birth chart, maintaining steady effort and spiritual mindfulness will bring success in this area.",
        language
      );
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "astrologer", text: fallbackMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] md:h-[750px] rounded-2xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden animate-fade-in relative">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold border border-white/30">
            🔮
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight font-sans">
              {t("Ask the Astrologer", "Ask the Astrologer")}
            </h3>
            <p className="text-xs text-amber-100 font-medium">
              {t("Vedic AI Kundali Analysis", "Vedic AI Kundali Analysis")}
            </p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="text-xs bg-white/20 hover:bg-white/30 text-white font-semibold px-3 py-1.5 rounded-full transition-colors border border-white/30"
          >
            {t("Clear Chat", "Clear Chat")}
          </button>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-amber-50/30 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap relative group font-sans ${
                msg.sender === "user"
                  ? "bg-amber-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-amber-950 dark:text-slate-100 rounded-bl-none shadow-md"
              }`}
            >
              {msg.text}
              
              {/* TTS Audio Player Button */}
              {msg.sender === "astrologer" && (
                <button 
                  onClick={() => playAudio(msg.text, msg.id)}
                  className={`absolute -bottom-3 -right-3 p-2 rounded-full shadow-md transition-all border ${
                    playingMsgId === msg.id 
                      ? "bg-amber-500 text-white border-amber-500 animate-pulse" 
                      : "bg-white text-slate-500 hover:text-amber-600 hover:border-amber-300 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                  } opacity-90 hover:opacity-100 focus:opacity-100`}
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
            <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-md flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 font-sans">
                {t("Consulting Kundali & Transits...", "Consulting Kundali & Transits...")}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Controls & Questionary Selector Area */}
      <div className="border-t-2 border-amber-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 flex flex-col gap-3 shadow-inner">
        
        {/* Category Dropdown Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider font-sans">
            {t("Select Topic / Category:", "Select Topic / Category:")}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isTyping}
            className="w-full bg-amber-50 dark:bg-slate-700 border-2 border-amber-300 dark:border-slate-600 text-amber-950 dark:text-amber-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all cursor-pointer font-sans"
          >
            {(translatedCategories.length > 0 ? translatedCategories : CATEGORIES.map(c => ({ id: c.id, label: c.labelEn }))).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Text Question & Microphone Voice Button Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTyping) {
                  handleGenerateAnswer();
                }
              }}
              placeholder={t("Type your specific question or use microphone...", "Type your specific question or use microphone...")}
              disabled={isTyping}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl pl-4 pr-10 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400 font-sans"
            />

            {/* Microphone Voice-to-Text Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isTyping}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-md"
                  : "text-slate-400 hover:text-amber-600 dark:hover:text-amber-300"
              }`}
              title={isListening ? "Listening... Click to stop" : "Click to speak via Microphone"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          {/* Submit / Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerateAnswer()}
            disabled={isTyping}
            className={`flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all border border-amber-400 shrink-0 ${
              isTyping ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"
            }`}
          >
            <span>✨</span>
            <span>{t("Generate", "Generate")}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
