import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchDevoteeDatabase,
  filterDevoteesCrossLanguage,
  type DevoteeProfile
} from "../../services/devoteeSearchService";
import { transliterateName } from "../../utils/transliterator";

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

  const [devotees, setDevotees] = useState<DevoteeProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
          // Focus search input on open
          setTimeout(() => {
            searchInputRef.current?.focus();
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-1.5 xs:p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md transition-all animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[92dvh] max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-amber-50">
        {/* Header */}
        <div className="p-2.5 sm:p-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-400/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              🏛️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm md:text-base font-black text-amber-200 tracking-wide leading-tight">
                  {isKn ? "ಭಕ್ತರ ಜಾತಕ ಡೇಟಾಬೇಸ್" : "Devotee Kundali Database"}
                </h3>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
                  {isKn ? "ಪುರೋಹಿತರ ಆವೃತ್ತಿ" : "Priest Portal"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-100/70 truncate">
                {isKn
                  ? "ಕನ್ನಡ / English ಹುಡುಕಾಟ ಹಾಗೂ ಮೈಕ್ ಧ್ವನಿ ಆಯ್ಕೆ"
                  : "Instant cross-language prefix search & mic voice input"}
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
                isKn
                  ? "ಹೆಸರು ಟೈಪ್ ಮಾಡಿ / ಮೈಕ್ ಬಳಸಿ..."
                  : "Type devotee name or use mic..."
              }
              className="w-full h-10 sm:h-12 pl-8 sm:pl-10 pr-20 sm:pr-24 rounded-xl sm:rounded-2xl bg-slate-950/90 border border-amber-400/40 text-amber-100 placeholder-amber-200/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-300 shadow-inner transition"
            />

            <div className="absolute right-1.5 sm:right-2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-200/70 hover:text-white flex items-center justify-center text-xs active:scale-95 transition"
                  title={isKn ? "ತೆರವುಗೊಳಿಸಿ" : "Clear"}
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
                title={isKn ? "ಮೈಕ್ ಮೂಲಕ ಹೆಸರು ಹೇಳಿ" : "Speak name using microphone"}
              >
                <span className="text-xs sm:text-sm">🎙️</span>
              </button>
            </div>
          </div>

          {/* Voice Listening Toast */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold animate-pulse shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{isKn ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಹೆಸರನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ 🎙️" : "Listening... Speak devotee name clearly 🎙️"}</span>
            </div>
          )}

          {speechError && (
            <p className="text-[11px] text-rose-300 text-center font-medium">{speechError}</p>
          )}

          {/* Status Counter */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-amber-200/70 px-1">
            <span>
              {isKn ? "ಲಭ್ಯವಿರುವ ಭಕ್ತರು: " : "Devotees Available: "}
              <strong className="text-amber-300 font-bold">{filteredDevotees.length}</strong>
              {devotees.length > 0 && ` / ${devotees.length}`}
            </span>
            <span className="text-[9px] sm:text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              {isKn ? "ದ್ವಿಮುಖ ಕನ್ನಡ ⇄ En" : "Bi-directional Kn ⇄ En"}
            </span>
          </div>
        </div>

        {/* Devotees List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3.5 space-y-2 touch-pan-y">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
              <p className="text-xs text-amber-200/80 font-medium">
                {isKn ? "ಡೇಟಾಬೇಸ್‌ನಿಂದ ಭಕ್ತರ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." : "Loading devotees from database..."}
              </p>
            </div>
          ) : filteredDevotees.length === 0 ? (
            <div className="py-10 text-center p-4 rounded-2xl border border-amber-400/20 bg-slate-900/50">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-xs sm:text-sm font-bold text-amber-200">
                {searchQuery
                  ? isKn
                    ? `"${searchQuery}" ಹೆಸರಿನ ಭಕ್ತರು ಕಂಡುಬಂದಿಲ್ಲ`
                    : `No devotees matching "${searchQuery}" found`
                  : isKn
                  ? "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಜಾತಕಗಳು ಉಳಿಸಲಾಗಿಲ್ಲ"
                  : "No saved Kundlis found in database"}
              </p>
              <p className="text-[11px] text-amber-200/60 mt-1">
                {searchQuery
                  ? isKn
                    ? "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬೇರೆ ಅಕ್ಷರಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಪ್ರಯತ್ನಿಸಿ."
                    : "Try typing different letters in Kannada or English."
                  : isKn
                  ? "ಕುಂಡಲಿ ರಚಿಸಿದ ನಂತರ ಅದು ಇಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಉಳಿಯುತ್ತದೆ."
                  : "Generated Kundlis will automatically be saved and appear here."}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition active:scale-95"
                >
                  {isKn ? "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ" : "Clear Search"}
                </button>
              )}
            </div>
          ) : (
            filteredDevotees.map((devotee) => {
              const origName = devotee.name;
              const knAlias = transliterateName(origName, "kn");
              const enAlias = transliterateName(origName, "en");
              const isOrigEnglish = /[a-zA-Z]/.test(origName);
              const secondaryName = isOrigEnglish ? knAlias : enAlias;

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
                          {origName}
                        </span>
                        {secondaryName && secondaryName !== origName && (
                          <span className="text-xs text-amber-300/70 font-semibold">
                            ({secondaryName})
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
                          <span className="truncate">{devotee.placeName}</span>
                        </span>
                      </div>

                      {/* Astrological Badges */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5">
                        {devotee.rashi && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 text-[10px] font-bold text-amber-300 whitespace-nowrap">
                            🪐 {isKn && devotee.rashiSanskrit ? devotee.rashiSanskrit : devotee.rashi}
                          </span>
                        )}
                        {devotee.nakshatra && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-400/30 text-[10px] font-bold text-indigo-300 whitespace-nowrap">
                            ✨ {isKn && devotee.nakshatraSanskrit ? devotee.nakshatraSanskrit : devotee.nakshatra}
                            {devotee.pada ? ` (${devotee.pada})` : ""}
                          </span>
                        )}
                        {devotee.gothra && (
                          <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300 whitespace-nowrap">
                            🌿 {devotee.gothra}
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
                        <span>{isKn ? "ಆಯ್ಕೆ" : "Select"}</span>
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
          <span className="truncate">💡 {isKn ? "ಕಾರ್ಡ್ ಒತ್ತಿ ತಕ್ಷಣ ಭರ್ತಿ ಮಾಡಿ" : "Tap card to auto-fill all inputs"}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition active:scale-95 shrink-0"
          >
            {isKn ? "ಮುಚ್ಚಿ (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};
