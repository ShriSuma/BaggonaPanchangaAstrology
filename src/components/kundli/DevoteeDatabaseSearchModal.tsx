import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  fetchDevoteeDatabase,
  filterDevoteesCrossLanguage,
  type DevoteeProfile
} from "../../services/devoteeSearchService";
import {
  transliterateName,
  detectScript,
  convertTextIfLanguageDiffers
} from "../../utils/transliterator";
import { RASHI_L5, NAKSHATRA_L5, pick } from "../../features/seva/sevaLocale";

interface DevoteeDatabaseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (devotee: DevoteeProfile) => void;
}

export const DevoteeDatabaseSearchModal: React.FC<DevoteeDatabaseSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const { i18n } = useTranslation();
  const lang = i18n?.language || "kn";
  const isKn = lang.startsWith("kn");
  const isHi = lang.startsWith("hi");
  const isTe = lang.startsWith("te");
  const isTa = lang.startsWith("ta");

  const [devotees, setDevotees] = useState<DevoteeProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Lock body scroll while modal is open to keep view stable
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Fetch devotees whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setIsListening(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetchDevoteeDatabase()
      .then((data) => {
        if (isMounted) {
          setDevotees(data);
          setLoading(false);
          // Focus search input on open safely without jumping page scroll
          setTimeout(() => {
            searchInputRef.current?.focus({ preventScroll: true });
          }, 150);
        }
      })
      .catch((err) => {
        console.error("Failed to load devotees:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Filter devotees based on current query using cross-language matcher
  const filteredDevotees = useMemo(() => {
    return filterDevoteesCrossLanguage(devotees, searchQuery);
  }, [devotees, searchQuery]);

  // Voice speech recognition toggle
  const toggleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        isKn
          ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ ಬೆಂಬಲವಿಲ್ಲ (Speech recognition not supported in this browser)."
          : "Speech recognition not supported in this browser. Try Chrome or Safari."
      );
      setTimeout(() => setSpeechError(""), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isKn ? "kn-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError("");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceSearch] Error:", event?.error);
        setIsListening(false);
        if (event?.error === "no-speech") {
          setSpeechError(isKn ? "ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ" : "No speech detected");
        } else if (event?.error === "not-allowed") {
          setSpeechError(isKn ? "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿ" : "Microphone permission denied");
        }
        setTimeout(() => setSpeechError(""), 3000);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript || "";
        const cleanText = transcript.trim();
        if (cleanText) {
          setSearchQuery(cleanText);
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  const currentLang = (["kn", "hi", "te", "ta", "en"].find((l) => lang.startsWith(l)) || "kn") as "kn" | "hi" | "te" | "ta" | "en";

  const getLocalizedRashi = (rashi?: string, rashiSanskrit?: string): string => {
    if (!rashi) return "";
    const raw = (rashi || "").trim();
    const key = raw.toLowerCase().replace(/[^a-z]/g, "");
    const found = (RASHI_L5 as any)[key];
    if (found) return pick(found, currentLang);
    return convertTextIfLanguageDiffers(rashiSanskrit || raw, currentLang);
  };

  const getLocalizedNakshatra = (nakshatra?: string, nakshatraSanskrit?: string): string => {
    if (!nakshatra) return "";
    const raw = (nakshatra || "").trim();
    const key = raw.toLowerCase().replace(/[^a-z]/g, "");
    const found = (NAKSHATRA_L5 as any)[key];
    if (found) return pick(found, currentLang);
    return convertTextIfLanguageDiffers(nakshatraSanskrit || raw, currentLang);
  };

  const getLocalizedGothra = (gothra?: string): string => {
    if (!gothra) return "";
    return convertTextIfLanguageDiffers(gothra, currentLang);
  };

  const getLocalizedPlace = (place?: string): string => {
    if (!place) return "";
    return convertTextIfLanguageDiffers(place, currentLang);
  };

  const modalJsx = (
    <div
      className="fixed inset-0 z-[99999] flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg my-auto max-h-[88vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-amber-50">
        {/* Header */}
        <div className="p-2.5 sm:p-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-400/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm md:text-base font-black text-amber-200 tracking-wide leading-tight">
                  {currentLang === "kn" ? "ಭಕ್ತರ ಜಾತಕ ಡೇಟಾಬೇಸ್" :
                   currentLang === "hi" ? "भक्त जन्म कुण्डली डेटाबेस" :
                   currentLang === "te" ? "భక్తుల జాతక డేటాబేస్" :
                   currentLang === "ta" ? "பக்தர்கள் ஜாதக தரவுத்தளம்" :
                   "Devotee Kundali Database"}
                </h3>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  {currentLang === "kn" ? "ಪುರೋಹಿತರ ಆವೃತ್ತಿ" :
                   currentLang === "hi" ? "पुरोहित पोर्टल" :
                   currentLang === "te" ? "పురోహిత పోర్టల్" :
                   currentLang === "ta" ? "புரோகிதர் போர்டல்" :
                   "Priest Portal"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-100/70 truncate">
                {currentLang === "kn" ? "ಕನ್ನಡ / English ಹುಡುಕಾಟ ಹಾಗೂ ಮೈಕ್ ಧ್ವನಿ ಆಯ್ಕೆ" :
                 currentLang === "hi" ? "हिन्दी / English खोज एवं माइक वॉइस इनपुट" :
                 currentLang === "te" ? "తెలుగు / English శోధన & మైక్ వాయిస్ ఇన్‌పుట్" :
                 currentLang === "ta" ? "தமிழ் / English தேடல் மற்றும் மைக் குரல் உள்ளீடு" :
                 "Instant cross-language search & mic voice input"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 min-w-[32px] sm:min-w-[36px] rounded-full bg-slate-800/90 hover:bg-rose-900/70 border border-amber-400/30 text-amber-200 flex items-center justify-center text-sm sm:text-base font-bold active:scale-95 transition shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search Bar with Mic */}
        <div className="p-2.5 sm:p-3.5 bg-slate-900/80 border-b border-amber-400/20 space-y-2 shrink-0">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-amber-400/80 text-sm sm:text-base pointer-events-none">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentLang === "kn" ? "ಹೆಸರು ಟೈಪ್ ಮಾಡಿ / ಮೈಕ್ ಬಳಸಿ..." :
                currentLang === "hi" ? "नाम टाइप करें या माइक का उपयोग करें..." :
                currentLang === "te" ? "పేరు టైప్ చేయండి లేదా మైక్ ఉపయోగించండి..." :
                currentLang === "ta" ? "பெயரை தட்டச்சு செய்க அல்லது மைக்கை பயன்படுத்துக..." :
                "Type devotee name or use mic..."
              }
              className="w-full h-10 sm:h-12 pl-8 sm:pl-10 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl bg-slate-950/90 border border-amber-400/40 text-amber-100 placeholder-amber-200/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300 shadow-inner transition"
            />

            <div className="absolute right-1.5 sm:right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-200/70 hover:text-white flex items-center justify-center text-xs active:scale-95 transition"
                  title={currentLang === "kn" ? "ತೆರವುಗೊಳಿಸಿ" : "Clear"}
                >
                  ✕
                </button>
              )}

              {/* Mic Dictation Button */}
              <button
                type="button"
                onClick={toggleVoiceSearch}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-lg"
                    : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40 active:scale-95"
                }`}
                title={
                  currentLang === "kn" ? "ಮೈಕ್ ಮೂಲಕ ಹೆಸರು ಹೇಳಿ" :
                  currentLang === "hi" ? "माइक से नाम बोलें" :
                  currentLang === "te" ? "మైక్ ద్వారా పేరు చెప్పండి" :
                  currentLang === "ta" ? "மைக் மூலம் பெயர் கூறவும்" :
                  "Speak name using microphone"
                }
              >
                <span className="text-xs sm:text-sm">🎙️</span>
              </button>
            </div>
          </div>

          {/* Voice Listening Toast */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold animate-pulse shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>
                {currentLang === "kn" ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಹೆಸರನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ 🎙️" :
                 currentLang === "hi" ? "सुन रहा हूँ... नाम स्पष्ट बोलें 🎙️" :
                 currentLang === "te" ? "వింటోంది... పేరు స్పష్టంగా చెప్పండి 🎙️" :
                 currentLang === "ta" ? "கேட்கிறது... பெயரை தெளிவாகக் கூறவும் 🎙️" :
                 "Listening... Speak devotee name clearly 🎙️"}
              </span>
            </div>
          )}

          {speechError && (
            <p className="text-[11px] text-rose-300 text-center font-medium">{speechError}</p>
          )}

          {/* Status Counter */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-amber-200/70 px-1">
            <span>
              {currentLang === "kn" ? "ಲಭ್ಯವಿರುವ ಭಕ್ತರು: " :
               currentLang === "hi" ? "उपलब्ध भक्त: " :
               currentLang === "te" ? "అందుబాటులో ఉన్న భక్తులు: " :
               currentLang === "ta" ? "உள்ள பக்தர்கள்: " :
               "Devotees Available: "}
              <strong className="text-amber-300 font-bold">{filteredDevotees.length}</strong>
              {devotees.length > 0 && ` / ${devotees.length}`}
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              {currentLang === "kn" ? "ದ್ವಿಮುಖ ಕನ್ನಡ ⇄ En" : "Bi-directional ⇄ En"}
            </span>
          </div>
        </div>

        {/* Devotees List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3.5 space-y-2 touch-pan-y">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              <p className="text-xs text-amber-200/80 font-medium">
                {currentLang === "kn" ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." :
                 currentLang === "hi" ? "डेटाबेस से भक्तों का विवरण लोड हो रहा है..." :
                 currentLang === "te" ? "డేటాబేస్ నుండి భక్తుల వివరాలు లోడ్ అవుతున్నాయి..." :
                 currentLang === "ta" ? "தரவுத்தளத்திலிருந்து விவரங்கள் ஏற்றப்படுகின்றன..." :
                 "Loading devotees from database..."}
              </p>
            </div>
          ) : filteredDevotees.length === 0 ? (
            <div className="py-10 text-center p-4 rounded-2xl border border-amber-400/20 bg-slate-900/50">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-xs sm:text-sm font-bold text-amber-200">
                {searchQuery
                  ? currentLang === "kn"
                    ? `"${searchQuery}" ಹೆಸರಿನ ಭಕ್ತರು ಕಂಡುಬಂದಿಲ್ಲ`
                    : currentLang === "hi"
                    ? `"${searchQuery}" नाम के कोई भक्त नहीं मिले`
                    : currentLang === "te"
                    ? `"${searchQuery}" పేరుతో భక్తులు కనుగొనబడలేదు`
                    : currentLang === "ta"
                    ? `"${searchQuery}" பெயரில் பக்தர்கள் காணப்படவில்லை`
                    : `No devotees matching "${searchQuery}" found`
                  : currentLang === "kn"
                  ? "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಜಾತಕಗಳು ಉಳಿಸಲಾಗಿಲ್ಲ"
                  : currentLang === "hi"
                  ? "डेटाबेस में अभी तक कोई कुंडली सुरक्षित नहीं है"
                  : currentLang === "te"
                  ? "డేటాబేస్‌లో ఇంకా ఏ జాతకాలు భద్రపరచబడలేదు"
                  : currentLang === "ta"
                  ? "தரவுத்தளத்தில் இன்னும் ஜாதகங்கள் சேமிக்கப்படவில்லை"
                  : "No saved Kundlis found in database"}
              </p>
              <p className="text-[11px] text-amber-200/60 mt-1">
                {searchQuery
                  ? currentLang === "kn"
                    ? "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬೇರೆ ಅಕ್ಷರಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ."
                    : "Try typing different letters in native script or English."
                  : currentLang === "kn"
                  ? "ಕುಂಡಲಿ ರಚಿಸಿದ ನಂತರ ಅದು ಇಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಉಳಿಯುತ್ತದೆ."
                  : "Generated Kundlis will automatically be saved and appear here."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition active:scale-95"
                >
                  {currentLang === "kn" ? "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ" : "Clear Search"}
                </button>
              )}
            </div>
          ) : (
            filteredDevotees.map((devotee) => {
              const origName = devotee.name;
              const savedScript = detectScript(origName);
              const isSameLanguage = savedScript === currentLang;
              // If saved in the same language as viewing, show exactly as saved without converting!
              // Only convert if viewing in a different language.
              const primaryName = isSameLanguage
                ? origName
                : convertTextIfLanguageDiffers(origName, currentLang);
              const showSecondary = !isSameLanguage && primaryName !== origName;

              return (
                <div
                  key={devotee.id}
                  onClick={() => onSelect(devotee)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(devotee);
                    }
                  }}
                  className="group relative p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-amber-950/25 to-slate-900/95 border border-amber-400/30 hover:border-amber-400 active:border-amber-400 active:bg-amber-500/15 active:scale-[0.98] transition-all cursor-pointer shadow-xs hover:shadow-md select-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Devotee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-amber-100 group-hover:text-amber-300 transition leading-tight">
                          {primaryName}
                        </span>
                        {showSecondary && (
                          <span className="text-xs text-amber-300/70 font-semibold">
                            ({origName})
                          </span>
                        )}
                      </div>

                      {/* Birth Details */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-amber-200/80">
                        <span className="inline-flex items-center gap-1">
                          <span>📅</span>
                          <span>{devotee.birthDate}</span>
                        </span>
                        <span className="text-amber-400/30">•</span>
                        <span className="inline-flex items-center gap-1">
                          <span>⏰</span>
                          <span>{devotee.birthTime}</span>
                        </span>
                        <span className="text-amber-400/30">•</span>
                        <span className="inline-flex items-center gap-1 truncate max-w-[120px] sm:max-w-[190px]" title={devotee.placeName}>
                          <span>📍</span>
                          <span className="truncate">{getLocalizedPlace(devotee.placeName)}</span>
                        </span>
                      </div>

                      {/* Astrological Badges */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5">
                        {devotee.rashi && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-bold text-amber-300 whitespace-nowrap">
                            🪐 {getLocalizedRashi(devotee.rashi, devotee.rashiSanskrit)}
                          </span>
                        )}
                        {devotee.nakshatra && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/30 text-[10px] font-bold text-indigo-300 whitespace-nowrap">
                            ✨ {getLocalizedNakshatra(devotee.nakshatra, devotee.nakshatraSanskrit)}
                            {devotee.pada ? ` (${devotee.pada})` : ""}
                          </span>
                        )}
                        {devotee.gothra && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300 whitespace-nowrap">
                            🌿 {getLocalizedGothra(devotee.gothra)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Select Action Column */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 pl-1 gap-2">
                      <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-200/70 border border-amber-400/20">
                        {devotee.source === "cloud" ? "☁️ Cloud" : "💾 Local"}
                      </span>
                      <button
                        type="button"
                        tabIndex={-1}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] sm:text-xs shadow hover:brightness-110 active:scale-95 flex items-center gap-1 transition-all pointer-events-none"
                      >
                        <span>
                          {currentLang === "kn" ? "ಆಯ್ಕೆ" :
                           currentLang === "hi" ? "चयन" :
                           currentLang === "te" ? "ఎంపిక" :
                           currentLang === "ta" ? "தேர்வு" :
                           "Select"}
                        </span>
                        <span className="text-xs font-bold">➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 sm:p-3 bg-slate-950/95 border-t border-amber-400/20 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-amber-200/70 shrink-0">
          <span className="truncate">
            {currentLang === "kn" ? "💡 ಕಾರ್ಡ್ ಒತ್ತಿ ತಕ್ಷಣ ಭರ್ತಿ ಮಾಡಿ" :
             currentLang === "hi" ? "💡 कार्ड पर टैप करके विवरण भरें" :
             currentLang === "te" ? "💡 వివరాలను నింపడానికి కార్డుపై నొక్కండి" :
             currentLang === "ta" ? "💡 விவரங்களை நிரப்ப கார்டை தொடவும்" :
             "💡 Tap card to auto-fill all inputs"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition active:scale-95 shrink-0"
          >
            {currentLang === "kn" ? "ಮುಚ್ಚಿ (Close)" :
             currentLang === "hi" ? "बंद करें (Close)" :
             currentLang === "te" ? "మూసివేయి (Close)" :
             currentLang === "ta" ? "மூடுக (Close)" :
             "Close"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalJsx, document.body);
  }
  return modalJsx;
};
