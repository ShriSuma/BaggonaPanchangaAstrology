import React, { useState, useEffect, useMemo, useRef } from "react";
import QRCode from "qrcode";
import {
  generatePriestDayDossier,
  generatePriestICalendarString,
  type PriestDayDossier
} from "../core/PriestCalendarEngine";
import {
  isDateInParabhavaYear
} from "../core/ParabhavaBookEngine";
import {
  MULTI_DAY_FESTIVALS,
  MASTER_ANNUAL_FESTIVALS,
  searchBaggonaFestivals,
  getBaggonaFestivalForDate,
  getActiveMultiDayFestivalForDate,
  type MultiDayFestivalGroup,
  type MasterFestivalItem
} from "../core/BaggonaFestivalRegistry";
import { getSafeProductionOrigin } from "../features/seva/icsCalendarGenerator";
import { recordPriestCalendarAction } from "../features/seva/calendarVisitService";


function getRituKn(masaKn: string): string {
  if (!masaKn) return "ವಸಂತ (Vasanta)";
  if (masaKn.includes("ಚೈತ್ರ") || masaKn.includes("ವೈಶಾಖ")) return "ವಸಂತ (Vasanta)";
  if (masaKn.includes("ಜ್ಯೇಷ್ಠ") || masaKn.includes("ಆಷಾಢ")) return "ಗ್ರೀಷ್ಮ (Grishma)";
  if (masaKn.includes("ಶ್ರಾವಣ") || masaKn.includes("ಭಾದ್ರಪದ")) return "ವರ್ಷಾ (Varsha)";
  if (masaKn.includes("ಆಶ್ವಯುಜ") || masaKn.includes("ಕಾರ್ತಿಕ")) return "ಶರತ್ (Sharad)";
  if (masaKn.includes("ಮಾರ್ಗಶಿರ") || masaKn.includes("ಪುಷ್ಯ")) return "ಹೇಮಂತ (Hemanta)";
  return "ಶಿಶಿರ (Shishira)";
}

export const BaggonaCalendarPage: React.FC = () => {
  // Helper to read initial params from URL
  const getParam = (key: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const p = new URLSearchParams(window.location.search);
    return p.get(key) || fallback;
  };

  // Default to today if within Parabhava year (2026-03-19 to 2027-04-07), else default to today or Yugadi
  const getInitialDate = (): string => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (isDateInParabhavaYear(todayStr)) {
      return getParam("date", todayStr);
    }
    return getParam("date", "2026-03-19");
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate);
  const [pincode] = useState<string>(() => getParam("pincode", "581326"));
  const [locationName] = useState<string>(() => getParam("loc", "Gokarna"));
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [speechLang, setSpeechLang] = useState<"kn-IN" | "en-IN">("kn-IN");
  const [activeMultiGroup, setActiveMultiGroup] = useState<MultiDayFestivalGroup | null>(null);
  const [selectedDropdownFestival, setSelectedDropdownFestival] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showMonthView, setShowMonthView] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Synchronize URL query params
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("date", newDate);
      url.searchParams.set("pincode", pincode);
      url.searchParams.set("loc", locationName);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Stepper handlers: Previous Day & Next Day without missing any date
  const handlePreviousDay = () => {
    const cur = new Date(selectedDate);
    const prev = new Date(cur.getTime() - 86400000);
    const prevStr = prev.toISOString().slice(0, 10);
    handleDateChange(prevStr);
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    const next = new Date(cur.getTime() + 86400000);
    const nextStr = next.toISOString().slice(0, 10);
    handleDateChange(nextStr);
  };

  const handleJumpToToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    handleDateChange(todayStr);
  };

  // Generate dual-page daily Panchanga dossier for the selected date
  const dossier: PriestDayDossier = useMemo(() => {
    return generatePriestDayDossier(selectedDate, 14.5479, 74.3187, pincode);
  }, [selectedDate, pincode]);

  // Check if current date has a festival or belongs to an active multi-day festival
  const singleFestival = useMemo(() => {
    return getBaggonaFestivalForDate(selectedDate);
  }, [selectedDate]);

  const activeMultiDayInfo = useMemo(() => {
    return getActiveMultiDayFestivalForDate(selectedDate);
  }, [selectedDate]);

  // Auto-set or clear active multi-day group based on search or date
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchRes = searchBaggonaFestivals(searchQuery);
      if (searchRes.matchedMultiDayGroup) {
        setActiveMultiGroup(searchRes.matchedMultiDayGroup);
      }
    } else if (activeMultiDayInfo) {
      setActiveMultiGroup(activeMultiDayInfo.group);
    }
  }, [searchQuery, activeMultiDayInfo]);

  // Handle Festival Dropdown Selection
  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDropdownFestival(val);
    if (!val) return;

    // Check if selecting a multi-day festival group
    const multiGroup = MULTI_DAY_FESTIVALS.find((g) => g.id === val);
    if (multiGroup) {
      setActiveMultiGroup(multiGroup);
      handleDateChange(multiGroup.startDate);
      setSearchQuery("");
      return;
    }

    // Check individual festival
    const fest = MASTER_ANNUAL_FESTIVALS.find((f) => f.id === val || f.date === val);
    if (fest) {
      handleDateChange(fest.date);
      if (fest.multiDayGroupId) {
        const mg = MULTI_DAY_FESTIVALS.find((g) => g.id === fest.multiDayGroupId);
        if (mg) setActiveMultiGroup(mg);
      } else {
        setActiveMultiGroup(null);
      }
      setSearchQuery(fest.nameKn);
    }
  };

  // Bilingual Voice Search (Kannada & English)
  const handleStartVoiceSearch = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಶೋಧನೆ ಲಭ್ಯವಿಲ್ಲ (Speech recognition not supported in this browser).");
      return;
    }

    if (isListeningMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.lang = speechLang;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setIsListeningMic(true);

      rec.onstart = () => setIsListeningMic(true);
      rec.onend = () => setIsListeningMic(false);
      rec.onerror = () => setIsListeningMic(false);

      rec.onresult = (evt: any) => {
        const spoken = evt.results?.[0]?.[0]?.transcript || "";
        if (spoken.trim()) {
          const cleanSpoken = spoken.trim();
          setSearchQuery(cleanSpoken);
          executeFestivalSearch(cleanSpoken);
        }
        setIsListeningMic(false);
      };

      rec.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const executeFestivalSearch = (text: string) => {
    const res = searchBaggonaFestivals(text);
    if (res.matchedMultiDayGroup) {
      setActiveMultiGroup(res.matchedMultiDayGroup);
      handleDateChange(res.matchedMultiDayGroup.startDate);
    } else if (res.exactMatch) {
      handleDateChange(res.exactMatch.date);
      if (res.exactMatch?.multiDayGroupId) {
        const mg = MULTI_DAY_FESTIVALS.find((g) => g.id === res.exactMatch?.multiDayGroupId);
        if (mg) setActiveMultiGroup(mg);
      }
    }
  };

  // Generate QR code for mobile deep linking
  const origin = getSafeProductionOrigin();
  const shareableUrl = `${origin}/calendar?date=${selectedDate}&pincode=${pincode}&loc=${encodeURIComponent(locationName)}`;

  useEffect(() => {
    QRCode.toDataURL(shareableUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
      color: {
        dark: "#78350F",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(""));
  }, [shareableUrl]);

  // Copy shareable link
  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareableUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      }
    } catch {
      // fallback
    }
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const text = `🕉️ *ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಕ್ಯಾಲೆಂಡರ್ ದಿನ ಮಹಾದರ್ಶನ*\n\nದಿನಾಂಕ: *${selectedDate}* (${dossier.weekdayKn})\nತಿಥಿ: ${dossier.tithiKn} (ಅಂತ್ಯ: ${dossier.tithiEndTime})\nನಕ್ಷತ್ರ: ${dossier.nakshatraKn} (ಅಂತ್ಯ: ${dossier.nakshatraEndTime})\n${singleFestival ? `ಹಬ್ಬ: *${singleFestival.nameKn}*\n` : ""}\nಸಂಪೂರ್ಣ ಪಂಚಾಂಗ ಹಾಗೂ ಲೈವ್ ಗೋಚಾರ ವೀಕ್ಷಿಸಲು ಈ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ:\n👉 ${shareableUrl}\n\n॥ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ · ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ॥`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Download .ics Calendar
  const handleDownloadICS = () => {
    const icsContent = generatePriestICalendarString({
      startDateStr: selectedDate,
      daysCount: 90,
      pincode,
      locationName,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      webAppBaseUrl: origin
    });

    void recordPriestCalendarAction({
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      action: "download_ics",
      date: selectedDate,
      spanDays: 90,
      pincode,
      locationName
    });

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Baggona_Panchanga_Calendar_${selectedDate}_90Days.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 pb-20 selection:bg-amber-200">
      {/* 1. ROYAL GOLD BANNER & HEADER - COMPACT & ULTRA-PREMIUM ON MOBILE */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#FFFDF7]/95 via-amber-50/95 to-[#FEFCF4]/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm px-2.5 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto space-y-1.5">
          {/* Top Row: Title, Subtitle, and Primary Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl p-1 bg-amber-100 rounded-xl border border-amber-300 shadow-xs shrink-0">📅</span>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-lg font-black text-amber-950 tracking-tight truncate flex items-center gap-1">
                  <span>॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಕ್ಯಾಲೆಂಡರ್ ॥</span>
                </h1>
                <p className="text-[9.5px] sm:text-[11px] font-bold text-amber-900 truncate">
                  ಶ್ರೀ ಪರಾಭವ ಸಂವತ್ಸರ (೨೦೨೬–೨೦೨೭) • ಶಕ ೧೯೪೮
                </p>
              </div>
            </div>

            {/* Quick action buttons row */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Quick jump to today */}
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-black rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 shadow-xs active:scale-95 transition-all"
                title="ಇಂದಿನ ದಿನಾಂಕಕ್ಕೆ ಹೋಗಿ"
              >
                ಇಂದು
              </button>

              {/* Share to WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 shadow-xs active:scale-95 transition-all flex items-center gap-1"
                title="WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ"
              >
                <span>📲</span>
                <span className="hidden md:inline">WhatsApp</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`p-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-black border transition-all flex items-center gap-1 active:scale-95 ${
                  copySuccess
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                }`}
                title="ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ"
              >
                <span>{copySuccess ? "✅" : "📋"}</span>
                <span className="hidden md:inline">{copySuccess ? "ಕಾಪಿ ಆಗಿದೆ" : "ಲಿಂಕ್"}</span>
              </button>

              {/* QR Code trigger */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="p-1 sm:p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-bold transition-all"
                title="QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ"
              >
                <span>📱</span>
              </button>
            </div>
          </div>

          {/* Sub Row: Priest Contact Ribbon & ICS Download */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/80 text-xs">
            {/* Priest Contact adhering to baggona-calendar-guard */}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[9.5px] font-bold text-amber-800 shrink-0">ಸಂಪರ್ಕ:</span>
              <a
                href="tel:9972339362"
                className="text-[11px] sm:text-xs font-black text-amber-950 hover:underline truncate flex items-center gap-1"
              >
                <span>📞</span>
                <span className="truncate">ಶ್ರೀರಾಮ್ ಪಂಡಿತ್: 9972339362</span>
              </a>
            </div>

            {/* ICS Calendar Download */}
            <button
              type="button"
              onClick={handleDownloadICS}
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 border border-amber-600 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1 shrink-0"
              title="Download RFC 5545 .ics calendar"
            >
              <span>📥</span>
              <span className="hidden sm:inline">ಕ್ಯಾಲೆಂಡರ್</span>
              <span>(ICS)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-2.5 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-hidden">
        {/* 2. DEDICATED SEARCH & ALL-FESTIVALS DROPDOWN CONTROLS */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm space-y-2.5 sm:space-y-3 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Search Box with Kannada & English Voice Mic */}
            <div className="lg:col-span-6 flex items-center gap-1.5 sm:gap-2">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    executeFestivalSearch(e.target.value);
                  }}
                  placeholder="ಹಬ್ಬ / ಪೂಜೆ ಹುಡುಕಿ (ದಸರಾ, ದೀಪಾವಳಿ)..."
                  className="w-full pl-8 pr-7 py-2 text-xs font-bold border-2 border-amber-300 rounded-xl bg-[#FFFDF7] text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveMultiGroup(null);
                    }}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Speech Recognition Language Toggle */}
              <button
                type="button"
                onClick={() => setSpeechLang((prev) => (prev === "kn-IN" ? "en-IN" : "kn-IN"))}
                className="px-2 py-2 rounded-xl text-[10px] font-black border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 shrink-0"
                title={`ಧ್ವನಿ ಭಾಷೆ: ${speechLang === "kn-IN" ? "ಕನ್ನಡ (kn-IN)" : "English (en-IN)"}`}
              >
                {speechLang === "kn-IN" ? "ಕನ್ನಡ" : "ENG"}
              </button>

              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={handleStartVoiceSearch}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1 shrink-0 ${
                  isListeningMic
                    ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400 shadow-xs"
                }`}
                title="ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ (Speak into mic in Kannada or English)"
              >
                <span>{isListeningMic ? "🔴" : "🎙️"}</span>
                <span className="hidden sm:inline">{isListeningMic ? "ಆಲಿಸುತ್ತಿದೆ..." : "ಧ್ವನಿ"}</span>
              </button>
            </div>

            {/* Dropdown with ALL Festivals in Baggona Panchanga (Large and Small) */}
            <div className="lg:col-span-6 w-full min-w-0">
              <select
                value={selectedDropdownFestival}
                onChange={handleDropdownSelect}
                className="w-full px-2.5 sm:px-3 py-2 text-xs font-black border-2 border-amber-300 rounded-xl bg-[#FFFDF7] text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer truncate"
              >
                <option value="">🪔 ಸಮಸ್ತ ಬಗ್ಗೋಣ ಹಬ್ಬ-ಹರಿದಿನಗಳ ಪಟ್ಟಿ (ಆಯ್ಕೆ ಮಾಡಿ)</option>

                <optgroup label="✨ ಬಹುದಿನದ ಮಹಾಪರ್ವಗಳು (Multi-Day Festivals)">
                  {MULTI_DAY_FESTIVALS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.icon} {g.groupNameKn} ({g.startDate} to {g.endDate})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="🚩 ಪ್ರಮುಖ ವಾರ್ಷಿಕ ಹಬ್ಬಗಳು (Major Festivals)">
                  {MASTER_ANNUAL_FESTIVALS.filter((f) => f.category === "Major Festival").map((f) => (
                    <option key={f.id} value={f.date}>
                      {f.date} · {f.nameKn} ({f.masaKn} {f.tithiKn})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="🕉️ ಪವಿತ್ರ ೨೬ ಏಕಾದಶಿಗಳು (All Ekadashis)">
                  {MASTER_ANNUAL_FESTIVALS.filter((f) => f.category === "Ekadashi").map((f) => (
                    <option key={f.id} value={f.date}>
                      {f.date} · {f.nameKn} ({f.masaKn} {f.pakshaKn})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="🌸 ವ್ರತಗಳು & ಜಯಂತಿಗಳು (Vratas & Jayantis)">
                  {MASTER_ANNUAL_FESTIVALS.filter((f) => f.category === "Jayanti" || f.category === "Vrata & Upavasa").map((f) => (
                    <option key={f.id} value={f.date}>
                      {f.date} · {f.nameKn} ({f.masaKn} {f.tithiKn})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Quick Filter Festival Pills - Sleek horizontal swipeable strip on mobile */}
          <div className="pt-2 border-t border-amber-200">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
              <span className="text-[10px] font-black text-slate-500 shrink-0 pl-0.5">ತ್ವರಿತ:</span>
              {[
                { label: "ದಸರಾ (೧೦ ದಿನ)", action: () => executeFestivalSearch("dasara") },
                { label: "ದೀಪಾವಳಿ (೪ ದಿನ)", action: () => executeFestivalSearch("deepavali") },
                { label: "ಶ್ರೀರಾಮನವಮಿ (೯ ದಿನ)", action: () => executeFestivalSearch("rama navami") },
                { label: "ಗಣೇಶ ಚತುರ್ಥಿ (೩ ದಿನ)", action: () => executeFestivalSearch("ganesha") },
                { label: "ಯುಗಾದಿ", action: () => handleDateChange("2026-03-19") },
                { label: "ಅಕ್ಷಯ ತೃತೀಯ", action: () => handleDateChange("2026-04-19") },
                { label: "ವರಮಹಾಲಕ್ಷ್ಮಿ", action: () => handleDateChange("2026-08-21") },
                { label: "ಕೃಷ್ಣ ಜನ್ಮಾಷ್ಟಮಿ", action: () => handleDateChange("2026-09-04") },
                { label: "ಮಕರ ಸಂಕ್ರಾಂತಿ", action: () => handleDateChange("2027-01-14") },
                { label: "ಮಹಾಶಿವರಾತ್ರಿ", action: () => handleDateChange("2027-03-06") }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={p.action}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#FEFCF4] text-amber-950 border border-amber-300 hover:bg-amber-100 active:scale-95 transition-all shadow-2xs shrink-0 whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MULTI-DAY FESTIVAL SCHEDULE CARD (WHEN NAVARATRI, DEEPAVALI, RAMA NAVAMI, ETC. SELECTED) */}
        {activeMultiGroup && (
          <section className="bg-gradient-to-br from-amber-500/10 via-[#FFFDF7] to-amber-500/5 border-2 border-amber-400 rounded-2xl p-3 sm:p-4 shadow-md space-y-3 overflow-hidden">
            <div className="flex items-start sm:items-center justify-between gap-2 border-b-2 border-amber-300 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl sm:text-3xl p-1 sm:p-1.5 bg-amber-100 rounded-xl sm:rounded-2xl border border-amber-300 shrink-0">
                  {activeMultiGroup.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-lg font-black text-amber-950 truncate">
                    {activeMultiGroup.groupNameKn}
                  </h2>
                  <p className="text-[10px] sm:text-xs font-semibold text-amber-900 truncate">
                    {activeMultiGroup.totalDays} ದಿನಗಳ ಸಮಗ್ರ ವೇಳಾಪಟ್ಟಿ • {activeMultiGroup.startDate} ರಿಂದ {activeMultiGroup.endDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMultiGroup(null)}
                className="px-2.5 py-1 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shrink-0 shadow-2xs active:scale-95"
              >
                ✕ ಮುಚ್ಚಿ
              </button>
            </div>

            {/* Quick Day Selector Strip on mobile for instant 1-tap navigation across multi-day dates */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-black text-amber-900 shrink-0">ದಿನಗಳು:</span>
              {activeMultiGroup.days.map((d) => {
                const isCurrentActiveDay = selectedDate === d.date;
                return (
                  <button
                    key={d.dayNumber}
                    type="button"
                    onClick={() => handleDateChange(d.date)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all shrink-0 whitespace-nowrap ${
                      isCurrentActiveDay
                        ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                        : "bg-white hover:bg-amber-50 text-amber-950 border-amber-300"
                    }`}
                  >
                    ದಿನ {d.dayNumber} ({d.date.slice(5)})
                  </button>
                );
              })}
            </div>

            {/* Days Grid - All 10 days for Navaratri, all 4 days for Deepavali, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {activeMultiGroup.days.map((d) => {
                const isCurrentActiveDay = selectedDate === d.date;
                return (
                  <div
                    key={d.dayNumber}
                    onClick={() => handleDateChange(d.date)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 overflow-hidden ${
                      isCurrentActiveDay
                        ? "bg-amber-100/90 border-amber-600 shadow-md ring-2 ring-amber-400/50 scale-[1.005]"
                        : "bg-white hover:bg-amber-50/70 border-amber-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${d.colorBadge || "bg-amber-600 text-white"}`}>
                        ದಿನ {d.dayNumber} / {d.totalDays}
                      </span>
                      <span className="text-xs font-black text-amber-950 font-mono">
                        {d.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                        {d.titleKn}
                      </h4>
                      <p className="text-[10px] font-bold text-amber-900 mt-0.5">
                        {d.tithiKn} • {d.nakshatraKn}
                      </p>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200 p-1.5 rounded-lg text-[10px] font-semibold text-slate-700">
                      <span className="font-bold text-amber-950 block">ಪೂಜಾ ಮುಹೂರ್ತ:</span>
                      <span className="text-emerald-800 font-bold break-words">{d.pujaWindowKn}</span>
                    </div>

                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                      {d.significanceKn}
                    </p>

                    <div className="pt-1 border-t border-amber-100 flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${isCurrentActiveDay ? "text-amber-800" : "text-slate-500"}`}>
                        {isCurrentActiveDay ? "● ಪ್ರಸ್ತುತ ವೀಕ್ಷಣೆಯ ದಿನ" : "ಕ್ಲಿಕ್ ಮಾಡಿ → ಪಂಚಾಂಗ ದರ್ಶನ"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. DATE STEPPER & CALENDAR NAVIGATOR */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-2.5 sm:p-4 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
            {/* Quick Step Buttons - Equal 3-column grid on mobile so nothing wraps */}
            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center shrink-0">
              <button
                type="button"
                onClick={handlePreviousDay}
                className="px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black bg-[#FFFDF7] text-amber-950 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-2xs"
                title="ಹಿಂದಿನ ದಿನದ ಪಂಚಾಂಗ"
              >
                <span>◀</span>
                <span>ಹಿಂದಿನ</span>
              </button>

              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-black bg-amber-200 text-amber-950 border-2 border-amber-400 hover:bg-amber-300 active:scale-95 transition-all text-center shadow-2xs"
                title="ಇಂದಿನ ದಿನಾಂಕಕ್ಕೆ ಹೋಗಿ"
              >
                ಇಂದು
              </button>

              <button
                type="button"
                onClick={handleNextDay}
                className="px-2 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black bg-[#FFFDF7] text-amber-950 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-2xs"
                title="ಮುಂದಿನ ದಿನದ ಪಂಚಾಂಗ"
              >
                <span>ಮುಂದಿನ</span>
                <span>▶</span>
              </button>
            </div>

            {/* Direct Date Input & Month View Toggle */}
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <label className="text-[11px] sm:text-xs font-black text-amber-950 shrink-0">
                  📆 ದಿನಾಂಕ:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full min-w-0 px-2 sm:px-3 py-1.5 text-xs font-black border-2 border-amber-400 rounded-xl bg-[#FFFDF7] text-slate-900 focus:outline-none focus:border-amber-600 shadow-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowMonthView((prev) => !prev)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                  showMonthView
                    ? "bg-amber-600 text-white border-amber-700"
                    : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
                }`}
              >
                <span>{showMonthView ? "✕ ಮುಚ್ಚಿ" : "🗓️ ಮಾಸಿಕ"}</span>
              </button>
            </div>
          </div>

          {/* Optional Month View Grid */}
          {showMonthView && (
            <div className="mt-3 pt-3 border-t border-amber-200 overflow-hidden">
              <div className="text-[11px] sm:text-xs font-black text-amber-950 mb-2 truncate">
                {dossier.chandramanaMasaKn} ಮಾಸ ({dossier.pakshaKn} ಪಕ್ಷ) • ತ್ವರಿತ ಆಯ್ಕೆ:
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["ರವಿ", "ಸೋಮ", "ಮಂಗಳ", "ಬುಧ", "ಗುರು", "ಶುಕ್ರ", "ಶನಿ"].map((w) => (
                  <div key={w} className="font-bold text-amber-900 bg-amber-100/60 py-1 rounded text-[10px] sm:text-xs">
                    {w}
                  </div>
                ))}
                {/* 15 Days of current Paksha representation */}
                {Array.from({ length: 15 }, (_, i) => {
                  const dObj = new Date(selectedDate);
                  const firstOfMonth = new Date(dObj.getFullYear(), dObj.getMonth(), 1 + i);
                  const dStr = firstOfMonth.toISOString().slice(0, 10);
                  const isCur = dStr === selectedDate;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDateChange(dStr)}
                      className={`p-1 sm:p-1.5 rounded-lg border text-xs font-bold transition-all ${
                        isCur
                          ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                          : "bg-white hover:bg-amber-50 text-slate-800 border-amber-200"
                      }`}
                    >
                      <div>{firstOfMonth.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* 5. MATCHED FESTIVAL BANNER FOR CURRENT SELECTED DAY (IF ANY) */}
        {(singleFestival || dossier.matchedFestival) && (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-100 via-[#FFFDF7] to-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm space-y-2 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-amber-300 pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-2xl sm:text-3xl p-1 bg-white rounded-xl border border-amber-300 shadow-2xs shrink-0">🪔</span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black text-amber-950 flex flex-wrap items-center gap-1.5">
                    <span>{singleFestival?.nameKn || dossier.matchedFestival?.nameKn}</span>
                    <span className="text-[11px] font-bold text-amber-800">
                      ({singleFestival?.nameEn || dossier.matchedFestival?.nameEn})
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-bold text-amber-900 truncate">
                    {dossier.chandramanaMasaKn} {dossier.pakshaKn} {dossier.tithiKn} • {dossier.weekdayKn}ವಾರ
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-950 shrink-0 self-start sm:self-auto">
                {singleFestival?.categoryKn || dossier.matchedFestival?.category || "ವಿಶೇಷ ಹಬ್ಬ"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[9.5px] font-bold text-slate-500 block">ಪೂಜಾ ಮುಹೂರ್ತ ಕಾಲಾವಧಿ:</span>
                <span className="font-black text-emerald-800 text-xs mt-0.5 block break-words">
                  {singleFestival?.pujaWindowKn || dossier.matchedFestival?.pujaWindow || "ದಿನದ ಪ್ರಾತಃಕಾಲ & ಮಾಧ್ಯಾಹ್ನ ಕಾಲ"}
                </span>
              </div>
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[9.5px] font-bold text-slate-500 block">ತಿಥಿ ಅಂತ್ಯ & ಘಟಿ:</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block break-words">
                  {dossier.tithiKn} ({dossier.tithiGhati}) ಅಂತ್ಯ: {dossier.tithiEndTime}
                </span>
              </div>
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <span className="text-[9.5px] font-bold text-slate-500 block">ಶ್ರಾದ್ಧ ತಿಥಿ:</span>
                <span className="font-black text-purple-950 text-xs mt-0.5 block">
                  {dossier.shraddhaTithi}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-800 font-semibold leading-relaxed pt-1">
              <span className="font-bold text-amber-950">ಧಾರ್ಮಿಕ ವಿವರ: </span>
              {singleFestival?.descriptionKn || dossier.matchedFestival?.descriptionKn}
            </p>
          </div>
        )}

        {/* 6. PREVIOUS DAY PREPARATION ALERT BANNER (IF ACTIVE) */}
        {dossier.previousDayAlert && (
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-100 to-amber-50 border-2 border-amber-400 rounded-2xl shadow-xs flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <span className="text-xl sm:text-2xl shrink-0">🔔</span>
            <div className="flex-1 min-w-0">
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-amber-900 tracking-wider block truncate">
                ಮುಂಬರುವ ದಿನದ ಪೂರ್ವಭಾವಿ ಧಾರ್ಮಿಕ ಸೂಚನೆ (Preparation Alert)
              </span>
              <p className="text-[11px] sm:text-xs font-bold text-amber-950 whitespace-pre-line leading-relaxed break-words">
                {dossier.previousDayAlert}
              </p>
            </div>
          </div>
        )}

        {/* 7. FULL DUAL-PAGE BAGGONA PANCHANGA DETAILS FOR SELECTED DAY */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3 sm:space-y-4 overflow-hidden">
          {/* Header Strip with Date, Masa, Paksha, Samvatsara */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b-2 border-amber-200 pb-2.5">
            <div>
              <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                ದೈನಂದಿನ ಪಂಚಾಂಗ ದರ್ಶನ (Daily Panchanga Dossier)
              </span>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 mt-0.5 truncate">
                {dossier.dateStr} · {dossier.weekdayKn}ವಾರ ({dossier.weekday})
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-black text-amber-950 block truncate">
                {dossier.samvatsaraKn} ಸಂವತ್ಸರ • ಶಕ {dossier.shakaYear}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 block truncate">
                {dossier.chandramanaMasaKn} ಮಾಸ ({dossier.pakshaKn} ಪಕ್ಷ) • {dossier.sauramanaMasaKn} {dossier.sauramanaDina}ನೇ ದಿನ
              </span>
            </div>
          </div>

          {/* 5 Angas Sacred Grid - Balanced 2-column mobile cards */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-black text-amber-950 mb-2 flex items-center gap-1.5">
              <span>🪔</span>
              <span className="truncate">ಪಂಚಾಂಗದ ಪಂಚ ಅಂಗಗಳು (The 5 Sacred Angas with End Times & Ghati):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-2.5">
              {/* Tithi */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 sm:p-3 rounded-xl shadow-2xs overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">೧. ತಿಥಿ (Tithi)</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5 truncate">{dossier.tithiKn}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 block truncate">ಘಟಿ: {dossier.tithiGhati}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 block mt-1 break-words">
                  ಅಂತ್ಯ: {dossier.tithiEndTime}
                </span>
              </div>

              {/* Nakshatra */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 sm:p-3 rounded-xl shadow-2xs overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">೨. ನಕ್ಷತ್ರ (Nakshatra)</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5 truncate">{dossier.nakshatraKn}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 block truncate">ಘಟಿ: {dossier.nakshatraGhati}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 block mt-1 break-words">
                  ಅಂತ್ಯ: {dossier.nakshatraEndTime}
                </span>
              </div>

              {/* Yoga */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 sm:p-3 rounded-xl shadow-2xs overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">೩. ಯೋಗ (Yoga)</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5 truncate">{dossier.yogaKn}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 block truncate">ಘಟಿ: {dossier.yogaGhati}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 block mt-1 truncate">
                  {dossier.yoga}
                </span>
              </div>

              {/* Karana */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 sm:p-3 rounded-xl shadow-2xs overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">೪. ಕರಣ (Karana)</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5 truncate">{dossier.karanaKn}</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 block truncate">ಘಟಿ: {dossier.karanaGhati}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-600 block mt-1 truncate">
                  {dossier.karana}
                </span>
              </div>

              {/* Vara */}
              <div className="bg-amber-50/70 border border-amber-200 p-2.5 sm:p-3 rounded-xl shadow-2xs col-span-2 lg:col-span-1 overflow-hidden">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase block truncate">೫. ವಾರ (Weekday)</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5">{dossier.weekdayKn}ವಾರ</span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 block">{dossier.weekday}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-purple-900 block mt-1 truncate">
                  ಋತು: {getRituKn(dossier.chandramanaMasaKn)}
                </span>
              </div>
            </div>
          </div>

          {/* Sun Times & Auspicious Muhurthas */}
          <div className="border-t border-amber-200 pt-2.5 sm:pt-3">
            <h4 className="text-[11px] sm:text-xs font-black text-amber-950 mb-2 flex items-center gap-1.5">
              <span>☀️</span>
              <span className="truncate">ಸೂರ್ಯೋದಯ, ದಿನಮಾನ & ಮುಹೂರ್ತ ಕಾಲಾವಧಿಗಳು (Muhurtha Windows):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ಸೂರ್ಯೋದಯ:</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block truncate">{dossier.suryodaya}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ಸೂರ್ಯಾಸ್ತ:</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block truncate">{dossier.suryasta}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ದಿನಪ್ರಮಾಣ:</span>
                <span className="font-black text-slate-900 text-xs mt-0.5 block truncate">{dossier.dinapramana} ಘಟಿ</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ:</span>
                <span className="font-black text-indigo-900 text-xs mt-0.5 block truncate">{dossier.brahmaMuhurtha}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ಅಭಿಜಿನ್ ಮುಹೂರ್ತ:</span>
                <span className="font-black text-emerald-800 text-xs mt-0.5 block truncate">{dossier.abhijitMuhurtha}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-500 block truncate">ಪ್ರದೋಷ ಕಾಲ:</span>
                <span className="font-black text-purple-900 text-xs mt-0.5 block truncate">{dossier.sayankalaPradosha}</span>
              </div>
            </div>
          </div>

          {/* Inauspicious Kaala & Shradh Info */}
          <div className="border-t border-amber-200 pt-2.5 sm:pt-3">
            <h4 className="text-[11px] sm:text-xs font-black text-amber-950 mb-2 flex items-center gap-1.5">
              <span>⚠️</span>
              <span className="truncate">ರಾಹುಕಾಲ, ಯಮಗಂಡ, ವರ್ಜ್ಯ & ಶ್ರಾದ್ಧ ನಿರ್ಣಯ:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-red-50/70 border border-red-200 p-2 sm:p-2.5 rounded-xl overflow-hidden">
                <span className="text-[9.5px] font-bold text-red-800 uppercase block truncate">ರಾಹುಕಾಲ:</span>
                <span className="font-black text-red-950 text-xs mt-0.5 block truncate">{dossier.rahuKaala}</span>
              </div>
              <div className="bg-amber-50/80 border border-amber-200 p-2 sm:p-2.5 rounded-xl overflow-hidden">
                <span className="text-[9.5px] font-bold text-amber-900 uppercase block truncate">ಗುಳಿಕಕಾಲ:</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block truncate">{dossier.gulikaKaala}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-2 sm:p-2.5 rounded-xl overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-600 uppercase block truncate">ಯಮಗಂಡ:</span>
                <span className="font-black text-slate-900 text-xs mt-0.5 block truncate">{dossier.yamaganda}</span>
              </div>
              <div className="bg-amber-50/80 border border-amber-200 p-2 sm:p-2.5 rounded-xl overflow-hidden">
                <span className="text-[9.5px] font-bold text-slate-600 uppercase block truncate">ವರ್ಜ್ಯ (ವಿಷ ಘಟಿ):</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block truncate">{dossier.vishaGhati} ಘಟಿ</span>
              </div>
              <div className="bg-purple-50/80 border border-purple-200 p-2 sm:p-2.5 rounded-xl col-span-2 sm:col-span-1 overflow-hidden">
                <span className="text-[9.5px] font-bold text-purple-900 uppercase block truncate">ಶ್ರಾದ್ಧ ತಿಥಿ:</span>
                <span className="font-black text-purple-950 text-xs mt-0.5 block truncate">{dossier.shraddhaTithi}</span>
              </div>
            </div>
          </div>

          {/* 12 Dina Lagna Ending Times (Right Page of Book) */}
          <div className="border-t border-amber-200 pt-2.5 sm:pt-3">
            <h4 className="text-[11px] sm:text-xs font-black text-amber-950 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <span>⏱️</span>
                <span className="truncate">೧೨ ದಿವಾ ಲಗ್ನಗಳ ನಿತ್ಯ ಸಮಾಪ್ತಿ ಕಾಲ (12 Dina Lagnas):</span>
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 shrink-0">ಗೋಕರ್ಣ ಮಾನಕ</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 sm:gap-2 text-xs">
              {[
                { kn: "ಮೇಷ", en: "Mesha", time: dossier.lagnaEndingTimes.mesha },
                { kn: "ವೃಷಭ", en: "Vrishabha", time: dossier.lagnaEndingTimes.vrishabha },
                { kn: "ಮಿಥುನ", en: "Mithuna", time: dossier.lagnaEndingTimes.mithuna },
                { kn: "ಕರ್ಕಾಟಕ", en: "Karka", time: dossier.lagnaEndingTimes.karkataka },
                { kn: "ಸಿಂಹ", en: "Simha", time: dossier.lagnaEndingTimes.simha },
                { kn: "ಕನ್ಯಾ", en: "Kanya", time: dossier.lagnaEndingTimes.kanya },
                { kn: "ತುಲಾ", en: "Tula", time: dossier.lagnaEndingTimes.tula },
                { kn: "ವೃಶ್ಚಿಕ", en: "Vrischika", time: dossier.lagnaEndingTimes.vrischika },
                { kn: "ಧನುಸ್ಸು", en: "Dhanu", time: dossier.lagnaEndingTimes.dhanu },
                { kn: "ಮಕರ", en: "Makara", time: dossier.lagnaEndingTimes.makara },
                { kn: "ಕುಂಭ", en: "Kumbha", time: dossier.lagnaEndingTimes.kumbha },
                { kn: "ಮೀನ", en: "Meena", time: dossier.lagnaEndingTimes.meena }
              ].map((l) => (
                <div key={l.kn} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-700 block truncate">{l.kn} ({l.en})</span>
                  <span className="font-mono font-black text-slate-900 text-[11px] sm:text-xs mt-0.5 block truncate">{l.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. LIVE GOCHARA KUNDALI & NAVAGRAHA SPASHTA (RIGHT PAGE OF BOOK) */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3 sm:space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-lg sm:text-xl shrink-0">🌌</span>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-amber-950 truncate">
                  {dossier.dateStr} ರ ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಚಕ್ರ
                </h3>
                <p className="text-[9px] sm:text-[10px] font-semibold text-slate-600 truncate">
                  ಸೂರ್ಯೋದಯ ದೃಗ್ಗಣಿತ ಲಹಿರಿ ({dossier.grahaSpashta.ravi.rashiKn} ರವಿ)
                </p>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 shrink-0">
              ದೃಗ್ಗಣಿತ ಸ್ಪಷ್ಟ
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* South Indian 4x4 Vedic Gochara Grid - Fluid & Proportional for Mobile */}
            <div className="lg:col-span-5 flex justify-center w-full overflow-hidden">
              <div className="w-full max-w-[320px] aspect-square grid grid-cols-4 gap-1 bg-amber-900/10 p-1.5 rounded-2xl border-2 border-amber-300">
                {/* Top Row: Meena, Mesha, Vrishabha, Mithuna */}
                {[11, 0, 1, 2].map((rIdx) => {
                  const rName = ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"][rIdx];
                  const planets = dossier.gocharaHouseMap[rIdx] || [];
                  return (
                    <div key={rIdx} className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                      <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">{rName}</span>
                      <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                        {planets.map((p, pi) => (
                          <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Middle Row 1: Kumbha, Center, Kataka */}
                <div className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                  <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">ಕುಂಭ</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                    {(dossier.gocharaHouseMap[10] || []).map((p, pi) => (
                      <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 row-span-2 bg-gradient-to-br from-amber-50 via-[#FFFDF7] to-amber-100/70 border border-amber-400 rounded-lg p-1 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden">
                  <span className="text-base sm:text-xl mb-0.5">🕉️</span>
                  <span className="text-[9px] sm:text-[10px] font-black text-amber-950 block leading-tight">
                    ॥ ಬಗ್ಗೋಣ ಗೋಚಾರ ॥
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] font-bold text-amber-800 block mt-0.5">
                    {dossier.dateStr}
                  </span>
                </div>

                <div className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                  <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">ಕರ್ಕ</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                    {(dossier.gocharaHouseMap[3] || []).map((p, pi) => (
                      <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Middle Row 2: Makara, Center (row-span-2), Simha */}
                <div className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                  <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">ಮಕರ</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                    {(dossier.gocharaHouseMap[9] || []).map((p, pi) => (
                      <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                  <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">ಸಿಂಹ</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                    {(dossier.gocharaHouseMap[4] || []).map((p, pi) => (
                      <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Dhanu, Vrischika, Tula, Kanya */}
                {[8, 7, 6, 5].map((rIdx) => {
                  const rName = ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"][rIdx];
                  const planets = dossier.gocharaHouseMap[rIdx] || [];
                  return (
                    <div key={rIdx} className="bg-[#FFFDF7] border border-amber-300 rounded-lg p-1 min-h-[50px] sm:min-h-[58px] flex flex-col justify-between shadow-2xs overflow-hidden">
                      <span className="text-[8px] sm:text-[8.5px] font-black text-amber-800 border-b border-amber-200 pb-0.5 truncate">{rName}</span>
                      <div className="flex flex-wrap gap-0.5 mt-0.5 overflow-hidden">
                        {planets.map((p, pi) => (
                          <span key={pi} className="text-[8px] sm:text-[9px] font-black bg-amber-100 text-amber-950 px-0.5 sm:px-1 rounded border border-amber-300 leading-tight">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navagraha Spashta Positions Table */}
            <div className="lg:col-span-7 w-full overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1 sm:hidden">
                <span>ಗ್ರಹ ಸ್ಪಷ್ಟ ವಿವರ:</span>
                <span>👉 ಬಲಕ್ಕೆ ಸ್ಕ್ರೋಲ್ ಮಾಡಿ</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-amber-200 shadow-2xs">
                <table className="w-full min-w-[360px] border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-100/80 border-b-2 border-amber-300 text-amber-950 font-black text-[10px] sm:text-[11px]">
                      <th className="p-1.5 sm:p-2 text-left">ಗ್ರಹ (Planet)</th>
                      <th className="p-1.5 sm:p-2 text-left">ರಾಶಿ (Rashi)</th>
                      <th className="p-1.5 sm:p-2 text-left">ನಕ್ಷತ್ರ</th>
                      <th className="p-1.5 sm:p-2 text-center">ಪಾದ</th>
                      <th className="p-1.5 sm:p-2 text-center">ಸ್ಥಿತಿ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {dossier.gocharaPlacements.map((p) => (
                      <tr key={p.planet} className="hover:bg-amber-50/50">
                        <td className="p-1.5 sm:p-2 font-black text-slate-900 flex items-center gap-1">
                          <span className="text-amber-600 font-bold text-[8px]">●</span>
                          <span>{p.planetKn}</span>
                          <span className="text-[9px] text-slate-500 font-normal">({p.planet})</span>
                        </td>
                        <td className="p-1.5 sm:p-2 font-bold text-slate-800">{p.rashiKn}</td>
                        <td className="p-1.5 sm:p-2 font-bold text-slate-800 text-[11px]">{p.nakshatraKn}</td>
                        <td className="p-1.5 sm:p-2 text-center font-mono font-bold text-[11px]">{p.pada}</td>
                        <td className="p-1.5 sm:p-2 text-center">
                          {p.isRetrograde ? (
                            <span className="px-1 py-0.5 text-[8.5px] font-black rounded bg-red-100 text-red-800 border border-red-300">
                              ವಕ್ರಿ
                            </span>
                          ) : (
                            <span className="px-1 py-0.5 text-[8.5px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ಮಾರ್ಗಿ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl border-2 border-amber-400 space-y-3">
            <h3 className="font-black text-sm text-amber-950">
              📱 ಮೊಬೈಲ್‌ನಲ್ಲಿ ದಿನ ಪಂಚಾಂಗ ದರ್ಶನ
            </h3>
            <p className="text-xs text-slate-600">
              ದಿನಾಂಕ {selectedDate} ರ ಪಂಚಾಂಗವನ್ನು ಮೊಬೈಲ್‌ನಲ್ಲಿ ತೆರೆಯಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ:
            </p>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Baggona Panchanga Calendar QR Code" className="mx-auto rounded-xl border border-amber-300 p-1" />
            )}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 text-xs font-black rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400"
            >
              ಮುಚ್ಚಿ (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaggonaCalendarPage;
