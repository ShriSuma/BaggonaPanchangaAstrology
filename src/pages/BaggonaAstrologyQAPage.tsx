import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore, type SupportedLanguage } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import { useDevoteeHistoryStore } from "../stores/devoteeHistoryStore";
import {
  askBaggonaAstrology,
  type AstrologyQAResponse,
  type BirthDetailsInput
} from "../services/astrologyQAService";
import type { AskGeminiChatTurn } from "../core/GeminiEngine";

interface ChatTurnItem {
  id: string;
  sender: "user" | "astrologer";
  question?: string;
  response?: AstrologyQAResponse;
  rawText?: string;
  timestamp: string;
}

export default function BaggonaAstrologyQAPage(): JSX.Element {
  const { t } = useTranslation();
  const appLanguage = useAppStore((s) => s.language);
  const setAppLanguage = useAppStore((s) => s.setLanguage);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const defaultPlace = useAppStore((s) => s.placeLabel);

  const session = useKundliViewerStore((s) => s.session);
  const devoteeRecords = useDevoteeHistoryStore((s) => s.records);

  // Language state (default to Kannada per user requirement)
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(
    appLanguage || "kn"
  );

  // Question & consultation state
  const [inputText, setInputText] = useState("");
  const [chatItems, setChatItems] = useState<ChatTurnItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<string | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  // Optional birth details panel
  const [showBirthDetails, setShowBirthDetails] = useState(false);
  const [birthDetails, setBirthDetails] = useState<BirthDetailsInput>({
    name: session?.input.name || "",
    birthDate: session?.input.birthDate || "",
    birthTime: session?.input.birthTime || "",
    place: session?.input.name ? defaultPlace : "",
    latitude: defaultLat,
    longitude: defaultLng,
    gender: "Male"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-fill from active Kundali session if available
  useEffect(() => {
    if (session) {
      setBirthDetails((prev) => ({
        ...prev,
        name: prev.name || session.input.name,
        birthDate: prev.birthDate || session.input.birthDate,
        birthTime: prev.birthTime || session.input.birthTime,
        place: prev.place || defaultPlace,
        latitude: session.input.latitude || defaultLat,
        longitude: session.input.longitude || defaultLng
      }));
    }
  }, [session, defaultPlace, defaultLat, defaultLng]);

  // Scroll to bottom on new item
  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === "function") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatItems, isLoading]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Quick Preset Questions
  const PRESET_QUESTIONS: { labelKn: string; labelEn: string; promptKn: string; promptEn: string; icon: string }[] = [
    {
      icon: "🌟",
      labelKn: "ಮೂಲಾ ೧ನೇ ಪಾದ ಶಾಂತಿ",
      labelEn: "Mula 1st Pada Dosha",
      promptKn: "ನನ್ನ ಸ್ನೇಹಿತನ ಮಗ ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದದಲ್ಲಿ ಜನಿಸಿದ್ದಾನೆ, ಇದು ಅಪಾಯವೇ? ಯಾವ ಶಾಂತಿ ಮತ್ತು ಪೂಜೆ ಮಾಡಬೇಕು?",
      promptEn: "My friend's son is born in Mula Nakshatra 1st Pada. Is it dangerous? What Shanti and remedies are required?"
    },
    {
      icon: "🚗",
      labelKn: "ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ (ರೇವತಿ / ಮೀನ)",
      labelEn: "Vehicle Purchase Muhurtha",
      promptKn: "ನನ್ನ ಸ್ನೇಹಿತ ರೇವತಿ ನಕ್ಷತ್ರ ಮೀನ ರಾಶಿ, ವಾಹನ ಖರೀದಿಸಲು ಈ ತಿಂಗಳು ಅಥವಾ ಮುಂದಿನ ತಿಂಗಳು ಶುಭ ಮುಹೂರ್ತ ಯಾವುದು?",
      promptEn: "My friend is Revati Nakshatra, Meena Rashi. When can he buy a vehicle, and what is the best Muhurtha this month or next month?"
    },
    {
      icon: "💍",
      labelKn: "ವಿವಾಹ ಕಾಲ & ೭ನೇ ಭಾವ",
      labelEn: "Marriage & 7th House",
      promptKn: "ಮದುವೆ ಯಾವಾಗ ಆಗಬಹುದು? ಸಪ್ತಮ ಭಾವ, ಸಪ್ತಮಾಧಿಪತಿ ಮತ್ತು ಪ್ರಸ್ತುತ ದಶಾ-ಭುಕ್ತಿ ಪ್ರಕಾರ ನಿಖರ ವಿವರಣೆ ನೀಡಿ.",
      promptEn: "When will marriage happen? Please give 7th house, 7th lord, and running Dasha-Bhukti technical analysis."
    },
    {
      icon: "🏠",
      labelKn: "ಗೃಹಪ್ರವೇಶ ಶುಭ ಮುಹೂರ್ತ",
      labelEn: "Griha Pravesha Muhurtha",
      promptKn: "ಹೊಸ ಮನೆ ಗೃಹಪ್ರವೇಶಕ್ಕೆ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ಪ್ರಕಾರ ಉತ್ತಮ ತಿಥಿ, ವಾರ, ನಕ್ಷತ್ರ ಮತ್ತು ೪ನೇ ಭಾವ ಫಲವೇನು?",
      promptEn: "What are the best Tithi, Weekday, and Nakshatra for Griha Pravesha based on Baggona Panchanga?"
    },
    {
      icon: "🪐",
      labelKn: "ಸಾಡೇಸಾತಿ ಶನಿ ಪರಿಹಾರ",
      labelEn: "Sade Sati & Shani Parihara",
      promptKn: "ಮೀನ ಮತ್ತು ಕುಂಭ ರಾಶಿಗೆ ಸಾಡೇಸಾತಿ ಶನಿ ಪ್ರಭಾವ ಹೇಗಿದೆ? ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಿಯ ಪರಿಹಾರವೇನು?",
      promptEn: "What is the impact of Sade Sati Saturn transit on Meena Rashi, and what are the sacred remedies?"
    },
    {
      icon: "👶",
      labelKn: "ಆಶ್ಲೇಷಾ / ಜ್ಯೇಷ್ಠಾ ಶಾಂತಿ",
      labelEn: "Ashlesha / Jyeshtha Shanti",
      promptKn: "ಆಶ್ಲೇಷಾ ಅಥವಾ ಜ್ಯೇಷ್ಠಾ ನಕ್ಷತ್ರ ಜನನ ದೋಷಕ್ಕೆ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತದ ಪ್ರಕಾರ ಯಾವ ಶಾಂತಿ ಮಾಡಬೇಕು?",
      promptEn: "What is the classical Vedic Shanti ritual for Ashlesha or Jyeshtha Nakshatra birth?"
    }
  ];

  // Speech Recognition (Dictation)
  const toggleDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        activeLang === "kn"
          ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Speech Recognition) ಲಭ್ಯವಿಲ್ಲ."
          : "Speech Recognition is not supported in this browser."
      );
      return;
    }

    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activeLang === "kn" ? "kn-IN" : activeLang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsDictating(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsDictating(false);
      recognition.onend = () => setIsDictating(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsDictating(false);
    }
  };

  // Text to Speech playback
  const handlePlayAudio = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playingItemId === id) {
      window.speechSynthesis.cancel();
      setPlayingItemId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setPlayingItemId(id);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      activeLang === "kn"
        ? "kn-IN"
        : activeLang === "hi"
        ? "hi-IN"
        : activeLang === "te"
        ? "te-IN"
        : activeLang === "ta"
        ? "ta-IN"
        : "en-IN";
    utterance.rate = 0.92;

    utterance.onend = () => setPlayingItemId(null);
    utterance.onerror = () => setPlayingItemId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Question Submission
  const handleAskQuestion = async (promptOverride?: string) => {
    const questionText = (promptOverride !== undefined ? promptOverride : inputText).trim();
    if (!questionText || isLoading) return;

    // Reset voice synthesis if playing
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setPlayingItemId(null);
    }

    const userTurnId = `user_${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user question
    setChatItems((prev) => [
      ...prev,
      {
        id: userTurnId,
        sender: "user",
        rawText: questionText,
        timestamp: timestampStr
      }
    ]);

    setInputText("");
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory: AskGeminiChatTurn[] = chatItems
        .filter((item) => item.rawText || item.response)
        .map((item) => ({
          role: item.sender === "user" ? "user" : "model",
          text: item.rawText || item.response?.fullAnswer || ""
        }));

      const activeBirthDetails: BirthDetailsInput | undefined =
        showBirthDetails && (birthDetails.birthDate || birthDetails.name)
          ? birthDetails
          : undefined;

      const result = await askBaggonaAstrology({
        question: questionText,
        language: activeLang,
        birthDetails: activeBirthDetails,
        conversationHistory,
        geminiApiKey
      });

      const astrologerTurnId = `astro_${Date.now()}`;
      setChatItems((prev) => [
        ...prev,
        {
          id: astrologerTurnId,
          sender: "astrologer",
          question: questionText,
          response: result,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (err: any) {
      console.error("[BaggonaAstrologyQAPage] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-amber-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      
      {/* ── 1. Sacred Royal Hero Header ────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white shadow-2xl p-6 sm:p-8 mb-6">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🪔</span>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-200 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-400/30">
                ॥ ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಸಮಾಲೋಚನೆ & ಪ್ರಶ್ನೋತ್ತರ ॥
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm font-serif">
              {activeLang === "kn"
                ? "ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೋತ್ತರ ಮಹಾವೇದಿಕೆ"
                : activeLang === "hi"
                ? "बग्गोण ज्योतिष प्रश्नोत्तरी महामंच"
                : activeLang === "te"
                ? "బగ్గోణ జ్యోతిష్య ప్రశ్నోత్తర వేదిక"
                : activeLang === "ta"
                ? "பக்கோண ஜோதிட வினா-விடை அரங்கம்"
                : "Baggona Vedic Astrology Consultation & Q&A"}
            </h1>
            <p className="text-sm text-amber-100/90 mt-1.5 max-w-2xl leading-relaxed">
              {activeLang === "kn"
                ? "ಮೂಲಾ ನಕ್ಷತ್ರ ಗಂಡಾಂತ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಯೋಗ, ೭ನೇ ಭಾವ, ಉದ್ಯೋಗ ಅಥವಾ ಯಾವುದೇ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಕೇಳಿ. ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ ಅವರ ಮಾರ್ಗದರ್ಶನದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತದ ನಿಖರ ಉತ್ತರ ಪಡೆಯಿರಿ."
                : "Ask any Astrology question (Mula Nakshatra 1st Pada, Vehicle Purchase Muhurtha, Marriage 7th House, Career, Sade Sati) in Kannada or English. Receive authentic classical Vedic guidance backed by Baggona Panchanga."}
            </p>
          </div>

          {/* 5-Language Switcher */}
          <div className="flex items-center gap-1.5 bg-amber-950/60 p-1.5 rounded-2xl border border-amber-400/40 backdrop-blur-md self-start md:self-auto shadow-inner">
            {(
              [
                { code: "kn", label: "ಕನ್ನಡ" },
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी" },
                { code: "te", label: "తెలుగు" },
                { code: "ta", label: "தமிழ்" }
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setActiveLang(l.code);
                  setAppLanguage(l.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeLang === l.code
                    ? "bg-gradient-to-r from-amber-400 to-amber-300 text-amber-950 shadow-md scale-105"
                    : "text-amber-200 hover:text-white hover:bg-amber-800/40"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Optional Birth Details Collapsible Panel ────────── */}
      <div className="mb-6 rounded-2xl border border-amber-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md p-4 transition-all">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowBirthDetails(!showBirthDetails)}
            className="flex items-center gap-2.5 text-left text-sm font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 transition-colors"
          >
            <span className="text-lg">{showBirthDetails ? "📂" : "📁"}</span>
            <span>
              {activeLang === "kn"
                ? "ಆಪ್ಷನಲ್ ಜನ್ಮ ವಿವರಗಳು (ನಿಖರ ಕುಂಡಲಿ & ೭ನೇ/೪ನೇ ಭಾವ ವಿಶ್ಲೇಷಣೆಗಾಗಿ)"
                : "Optional Birth Details (For precise Kundali & 7th/4th House analysis)"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-normal">
              {showBirthDetails
                ? activeLang === "kn" ? "ಮುಚ್ಚಿ" : "Hide"
                : activeLang === "kn" ? "ತೆರೆಯಿರಿ" : "Expand"}
            </span>
          </button>

          {showBirthDetails && birthDetails.birthDate && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-300/50">
              ✓ {activeLang === "kn" ? "ಕುಂಡಲಿ ಜೋಡಿಸಲಾಗಿದೆ" : "Birth Chart Linked"}
            </span>
          )}
        </div>

        {showBirthDetails && (
          <div className="mt-4 pt-4 border-t border-amber-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in text-xs">
            {/* Quick Devotee Selector */}
            {devoteeRecords.length > 0 && (
              <div className="sm:col-span-2 md:col-span-4 mb-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {activeLang === "kn" ? "ನೋಂದಾಯಿತ ಭಕ್ತರನ್ನು ಆರಿಸಿ:" : "Select Saved Devotee Profile:"}
                </label>
                <select
                  value={birthDetails.name}
                  onChange={(e) => {
                    const found = devoteeRecords.find((d) => d.name === e.target.value);
                    if (found) {
                      setBirthDetails({
                        name: found.name,
                        birthDate: found.birthDate || "",
                        birthTime: found.birthTime || "",
                        place: found.city || defaultPlace,
                        latitude: found.latitude || defaultLat,
                        longitude: found.longitude || defaultLng,
                        gender: "Male"
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300/70 dark:border-slate-700 bg-amber-50/40 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">
                    {activeLang === "kn" ? "-- ಹೊಸ ವ್ಯಕ್ತಿಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ --" : "-- Enter custom details --"}
                  </option>
                  {devoteeRecords.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.birthDate || "No DOB"}) - {d.city || "Baggona"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹೆಸರು (Name)" : "Name"}
              </label>
              <input
                type="text"
                value={birthDetails.name || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, name: e.target.value })}
                placeholder="e.g. Suresh / ರಾಘವೇಂದ್ರ"
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (DOB)" : "Birth Date"}
              </label>
              <input
                type="date"
                value={birthDetails.birthDate || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ಸಮಯ (Time)" : "Birth Time"}
              </label>
              <input
                type="time"
                value={birthDetails.birthTime || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, birthTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activeLang === "kn" ? "ಹುಟ್ಟಿದ ಸ್ಥಳ (Place)" : "Birth Place"}
              </label>
              <input
                type="text"
                value={birthDetails.place || ""}
                onChange={(e) => setBirthDetails({ ...birthDetails, place: e.target.value })}
                placeholder="e.g. Baggona / Bangalore"
                className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Quick Suggestion Question Pills ─────────────────── */}
      <div className="mb-6">
        <p className="text-xs font-bold text-amber-900/80 dark:text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <span>💡</span>
          <span>{activeLang === "kn" ? "ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು:" : "Common Inquiries & Quick Prompts:"}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(activeLang === "kn" ? pq.promptKn : pq.promptEn)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/80 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-xs font-semibold transition-all shadow-xs hover:scale-102"
            >
              <span>{pq.icon}</span>
              <span>{activeLang === "kn" ? pq.labelKn : pq.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Chat & Consultation Stream ──────────────────────── */}
      <div className="space-y-6 mb-6">
        {chatItems.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-amber-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
            <span className="text-5xl block mb-3">🔮</span>
            <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200 font-serif">
              {activeLang === "kn"
                ? "ಯಾವುದೇ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ"
                : "Ask Any Vedic Astrology Question"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              {activeLang === "kn"
                ? "ಮೂಲಾ ನಕ್ಷತ್ರ ಶಾಂತಿ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಸಪ್ತಮ ಭಾವ, ಸಾಡೇಸಾತಿ ಶನಿ, ಅಥವಾ ಜನ್ಮ ದಿನಾಂಕದೊಂದಿಗೆ ಯಾವುದೇ ವಿಷಯವನ್ನು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಮೂಲಕ ಮಾತನಾಡಿ."
                : "Type your query below or tap the microphone to ask via voice in Kannada or English. You can include birth details or ask general knowledge questions."}
            </p>
          </div>
        ) : (
          chatItems.map((item) => (
            <div key={item.id} className="animate-fade-in">
              {/* User Question Bubble */}
              {item.sender === "user" ? (
                <div className="flex justify-end mb-4">
                  <div className="max-w-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl rounded-tr-xs px-5 py-3.5 shadow-md">
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {item.rawText}
                    </p>
                    <div className="text-[10px] text-amber-200/80 mt-1 text-right">
                      {item.timestamp}
                    </div>
                  </div>
                </div>
              ) : (
                /* Astrologer Response Card */
                <div className="flex justify-start mb-6">
                  <div className="w-full max-w-4xl rounded-3xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                    
                    {/* Header with Priest Attribution & Actions */}
                    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 px-6 py-4 border-b border-amber-200/80 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🕉️</span>
                        <div>
                          <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 font-serif">
                            {activeLang === "kn"
                              ? "ಬಗ್ಗೋಣ ಜ್ಯೋತಿಷ್ಯ ಶಾಸ್ತ್ರೀಯ ತೀರ್ಪು"
                              : "Baggona Vedic Astrological Verdict"}
                          </h4>
                          <p className="text-[11px] text-amber-800/80 dark:text-amber-400 font-medium">
                            {activeLang === "kn"
                              ? "ಮಾರ್ಗದರ್ಶನ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ)"
                              : "Guided by Priest Shreeram Pandit (Baggona Panchanga)"}
                          </p>
                        </div>
                      </div>

                      {/* Controls: Audio Listen, Copy, Timestamp */}
                      <div className="flex items-center gap-2">
                        {item.response && (
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(item.response!.spokenText, item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                              playingItemId === item.id
                                ? "bg-red-600 text-white animate-pulse"
                                : "bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-200"
                            }`}
                            title="ಧ್ವನಿ ಮೂಲಕ ಆಲಿಸಿ / Listen to response"
                          >
                            <span>{playingItemId === item.id ? "⏹️" : "🔊"}</span>
                            <span>
                              {playingItemId === item.id
                                ? activeLang === "kn" ? "ನಿಲ್ಲಿಸಿ" : "Stop"
                                : activeLang === "kn" ? "ಧ್ವನಿ ಆಲಿಸಿ" : "Listen"}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopy(item.response?.fullAnswer || "", item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          title="ಪ್ರತಿಯನ್ನು ನಕಲಿಸಿ / Copy"
                        >
                          <span>{copySuccessId === item.id ? "✓" : "📋"}</span>
                          <span>
                            {copySuccessId === item.id
                              ? activeLang === "kn" ? "ನಕಲಿಸಲಾಗಿದೆ" : "Copied"
                              : activeLang === "kn" ? "ಪ್ರತಿ" : "Copy"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Technical Kundali Badge if present */}
                    {item.response?.chartData && (
                      <div className="bg-amber-100/40 dark:bg-slate-800/50 px-6 py-2.5 border-b border-amber-200/50 dark:border-slate-800 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                        {item.response.chartData.technicalHighlights.map((th, thIdx) => (
                          <span
                            key={thIdx}
                            className="bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-amber-300/40"
                          >
                            {th}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Thematic Structured Cards */}
                    <div className="p-6 space-y-4">
                      {item.response?.sections.map((sec, sIdx) => (
                        <div
                          key={sIdx}
                          className="rounded-2xl border border-amber-200/80 dark:border-slate-800 bg-amber-50/30 dark:bg-slate-800/40 p-4 transition-all hover:border-amber-400"
                        >
                          <h5 className="text-sm font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-2 font-serif border-b border-amber-200/40 pb-1.5">
                            <span className="text-base">{sec.icon}</span>
                            <span>{sec.title}</span>
                          </h5>
                          <div className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                            {sec.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer attribution */}
                    <div className="bg-amber-50/60 dark:bg-slate-950/60 px-6 py-3 border-t border-amber-200/60 dark:border-slate-800 text-center text-[11px] text-amber-900/70 dark:text-amber-400/70 font-semibold font-serif">
                      ॥ ಶ್ರೀ ಕ್ಷೇತ್ರ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ದೈವಿಕ ಸೇವೆ • ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ • 9972339362 ॥
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="rounded-3xl border border-amber-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-center gap-3 shadow-lg">
              <svg className="animate-spin h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 font-serif">
                {activeLang === "kn"
                  ? "ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ಸಿದ್ಧಾಂತ ಹಾಗೂ ಗ್ರಹ ಗಣಿತದ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ..."
                  : "Consulting Baggona Panchanga Siddhanta & Vedic planetary positions..."}
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── 5. Sticky Bottom Question Input Bar ────────────────── */}
      <div className="sticky bottom-4 z-30 mx-auto max-w-4xl px-2">
        <div className="rounded-3xl border-2 border-amber-400 dark:border-amber-600/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-2.5 sm:p-3 flex items-end gap-2">
          
          {/* Microphone Dictation Button */}
          <button
            type="button"
            onClick={toggleDictation}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center shrink-0 ${
              isDictating
                ? "bg-red-600 text-white animate-bounce shadow-lg ring-4 ring-red-300"
                : "bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
            }`}
            title="ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ / Speak Question"
          >
            <span className="text-lg">{isDictating ? "🔴" : "🎙️"}</span>
          </button>

          {/* Textarea Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskQuestion();
              }
            }}
            placeholder={
              activeLang === "kn"
                ? "ನಿಮ್ಮ ಜ್ಯೋತಿಷ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ಮೂಲಾ ನಕ್ಷತ್ರ ೧ನೇ ಪಾದ ದೋಷ, ವಾಹನ ಖರೀದಿ ಮುಹೂರ್ತ, ವಿವಾಹ ಸಮಯ)..."
                : "Type your astrology question here (e.g. Mula Nakshatra 1st Pada, Vehicle purchase muhurtha, marriage 7th house)..."
            }
            rows={2}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 resize-none py-1.5 px-2 font-medium"
          />

          {/* Send Action Button */}
          <button
            type="button"
            disabled={!inputText.trim() || isLoading}
            onClick={() => handleAskQuestion()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>{isLoading ? "⏳" : "🔮"}</span>
            <span className="hidden sm:inline">
              {isLoading
                ? activeLang === "kn" ? "ಪರಿಶೀಲನೆ..." : "Analyzing..."
                : activeLang === "kn" ? "ಪ್ರಶ್ನೆ ಕೇಳಿ" : "Ask"}
            </span>
          </button>

          {/* Reset Conversation Button */}
          {chatItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(activeLang === "kn" ? "ಹೊಸ ಪ್ರಶ್ನೆ ಆರಂಭಿಸಬೇಕೇ?" : "Start new consultation?")) {
                  setChatItems([]);
                  setInputText("");
                }
              }}
              className="p-3 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="ಹೊಸ ಪ್ರಶ್ನೆ / New consultation"
            >
              <span className="text-sm">🔄</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
