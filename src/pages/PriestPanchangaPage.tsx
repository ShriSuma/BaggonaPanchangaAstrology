import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  generatePriestDayDossier,
  generatePriestICalendarString,
  type PriestDayDossier
} from "../core/PriestCalendarEngine";
import {
  PARABHAVA_ANNUAL_FESTIVALS,
  searchParabhavaFestivals,
  isDateInParabhavaYear
} from "../core/ParabhavaBookEngine";
import { recordPriestCalendarAction } from "../features/seva/calendarVisitService";
import { getSafeProductionOrigin } from "../features/seva/icsCalendarGenerator";

export const PriestPanchangaPage: React.FC = () => {
  // Read initial params from window.location.search
  const getParam = (key: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const p = new URLSearchParams(window.location.search);
    return p.get(key) || fallback;
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => getParam("date", "2026-03-19"));
  const [pincode, setPincode] = useState<string>(() => getParam("pincode", "581326"));
  const [locationName, setLocationName] = useState<string>(() => getParam("loc", "Gokarna"));
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarSpanDays, setCalendarSpanDays] = useState<number>(90);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Record web visit on load / date change
  useEffect(() => {
    void recordPriestCalendarAction({
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      action: "web_visit",
      date: selectedDate,
      pincode,
      locationName
    });
  }, [selectedDate, pincode, locationName]);

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

  const handlePreviousDay = () => {
    const cur = new Date(selectedDate);
    const prev = new Date(cur.getTime() - 86400000);
    const prevStr = prev.toISOString().slice(0, 10);
    if (isDateInParabhavaYear(prevStr)) {
      handleDateChange(prevStr);
    }
  };

  const handleNextDay = () => {
    const cur = new Date(selectedDate);
    const next = new Date(cur.getTime() + 86400000);
    const nextStr = next.toISOString().slice(0, 10);
    if (isDateInParabhavaYear(nextStr)) {
      handleDateChange(nextStr);
    }
  };

  // Generate complete Priest Dossier
  const dossier: PriestDayDossier = useMemo(() => {
    return generatePriestDayDossier(selectedDate, 14.5479, 74.3187, pincode);
  }, [selectedDate, pincode]);

  // Generate QR code data URL
  useEffect(() => {
    const origin = getSafeProductionOrigin();
    const qrUrl = `${origin}/priest-panchanga?date=${selectedDate}&pincode=${pincode}`;
    QRCode.toDataURL(qrUrl, {
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
  }, [selectedDate, pincode]);

  // Voice Search handler
  const handleStartVoiceSearch = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ (Speech recognition not supported in this browser).");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = "kn-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setIsListeningMic(true);

      rec.onstart = () => setIsListeningMic(true);
      rec.onend = () => setIsListeningMic(false);
      rec.onerror = () => setIsListeningMic(false);

      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript || "";
        if (text) {
          setSearchQuery(text);
          const matches = searchParabhavaFestivals(text);
          if (matches.length > 0) {
            handleDateChange(matches[0].date);
          }
        }
        setIsListeningMic(false);
      };

      rec.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  // Download Priest ICS
  const handleDownloadPriestICS = () => {
    const origin = getSafeProductionOrigin();
    const icsContent = generatePriestICalendarString({
      startDateStr: selectedDate,
      daysCount: calendarSpanDays,
      pincode,
      locationName,
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      webAppBaseUrl: origin
    });

    void recordPriestCalendarAction({
      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
      action: "download_ics",
      date: selectedDate,
      spanDays: calendarSpanDays,
      pincode,
      locationName
    });

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Baggona_Priest_Panchanga_${selectedDate}_${calendarSpanDays}Days.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 font-sans pb-16 selection:bg-amber-200">
      {/* 1. ROYAL PRIEST HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#FFFDF7] via-amber-50 to-[#FEFCF4] border-b-2 border-amber-300/80 shadow-xs px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-xs font-bold transition-all flex items-center gap-1">
              <span>🏠</span>
              <span className="hidden sm:inline">ಮುಖಪುಟ</span>
            </a>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🕉️</span>
                <h1 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                  ॥ ಬಗ್ಗೋಣ ಪಂಚಾಂಗ — ಪುರೋಹಿತ ಪಂಚಾಂಗ ಮಹಾದರ್ಶನ ॥
                </h1>
              </div>
              <p className="text-[11px] font-bold text-amber-900">
                ಪರಾಭವ ಸಂವತ್ಸರ (೨೦೨೬–೨೦೨೭) • ಶಕ ೧೯೪೮ • ೧೦೪ ಪುಟಗಳ ಅಧಿಕೃತ ಮುದ್ರಣ ಪ್ರಕಾಶನ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-xl text-right">
              <span className="text-[10px] font-bold text-amber-800 block">ಮುಖ್ಯ ಅರ್ಚಕರು</span>
              <a href="tel:9972339362" className="text-xs font-black text-amber-950 hover:underline flex items-center gap-1">
                <span>📞</span>
                <span>ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362)</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 border border-amber-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>📅</span>
              <span>ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್ (ICS)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* 2. INTERACTIVE DATE BAR & NAVIGATOR */}
        <section className="bg-white border-2 border-amber-300/80 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Quick Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePreviousDay}
                className="px-3 py-2 rounded-xl text-xs font-black bg-[#FFFDF7] text-amber-950 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all"
              >
                ◀ ಹಿಂದಿನ ದಿನ
              </button>
              <button
                type="button"
                onClick={() => handleDateChange("2026-03-19")}
                className="px-3 py-2 rounded-xl text-xs font-black bg-amber-200 text-amber-950 border-2 border-amber-400 hover:bg-amber-300 active:scale-95 transition-all"
              >
                ಯುಗಾದಿ
              </button>
              <button
                type="button"
                onClick={handleNextDay}
                className="px-3 py-2 rounded-xl text-xs font-black bg-[#FFFDF7] text-amber-950 border-2 border-amber-300 hover:bg-amber-100 active:scale-95 transition-all"
              >
                ಮುಂದಿನ ದಿನ ▶
              </button>
            </div>

            {/* Date Input Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-amber-950 shrink-0 flex items-center gap-1">
                <span>📆</span>
                <span>ದಿನಾಂಕ ಆಯ್ಕೆ:</span>
              </label>
              <input
                type="date"
                min="2026-03-19"
                max="2027-04-07"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-black border-2 border-amber-400 rounded-xl bg-[#FFFDF7] text-slate-900 focus:outline-none focus:border-amber-600 shadow-xs"
              />
            </div>

            {/* Search Box & Voice Input */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    const matches = searchParabhavaFestivals(e.target.value);
                    if (matches.length > 0) {
                      handleDateChange(matches[0].date);
                    }
                  }}
                  placeholder="ಹಬ್ಬ, ವ್ರತ ಅಥವಾ ತಿಥಿ ಹುಡುಕಿ..."
                  className="w-full pl-7 pr-7 py-1.5 text-xs border-2 border-amber-300 rounded-xl font-semibold bg-white text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleStartVoiceSearch}
                title="ಧ್ವನಿ ಮೂಲಕ ಹುಡುಕಿ (Speak into Mic)"
                className={`p-2 rounded-xl text-xs font-black border-2 transition-all shadow-xs ${
                  isListeningMic
                    ? "bg-red-500 text-white border-red-600 animate-pulse"
                    : "bg-[#FFFDF7] text-amber-950 border-amber-400 hover:bg-amber-100"
                }`}
              >
                {isListeningMic ? "🔴" : "🎙️"}
              </button>
            </div>
          </div>

          {/* Quick Festival Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200">
            <span className="text-[10px] font-black text-slate-500">ತ್ವರಿತ ಹಬ್ಬಗಳು:</span>
            {[
              { label: "ಯುಗಾದಿ (19 Mar)", date: "2026-03-19" },
              { label: "ಶ್ರೀರಾಮನವಮಿ (27 Mar)", date: "2026-03-27" },
              { label: "ಕಾಮದಾ ಏಕಾದಶಿ (29 Mar)", date: "2026-03-29" },
              { label: "ಹನುಮಜ್ಜಯಂತಿ (02 Apr)", date: "2026-04-02" },
              { label: "ಅಕ್ಷಯ ತೃತೀಯ (19 Apr)", date: "2026-04-19" },
              { label: "ವರಮಹಾಲಕ್ಷ್ಮೀ (21 Aug)", date: "2026-08-21" },
              { label: "ವರಸಿದ್ಧಿ ವಿನಾಯಕ (14 Sep)", date: "2026-09-14" },
              { label: "ದೀಪಾವಳಿ (09 Nov)", date: "2026-11-09" },
              { label: "ಮಕರ ಸಂಕ್ರಾಂತಿ (14 Jan)", date: "2027-01-14" },
              { label: "ಮಹಾಶಿವರಾತ್ರಿ (06 Mar)", date: "2027-03-06" }
            ].map((p) => (
              <button
                key={p.date}
                type="button"
                onClick={() => handleDateChange(p.date)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                  selectedDate === p.date
                    ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                    : "bg-[#FEFCF4] text-amber-950 border-amber-300 hover:bg-amber-100"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. PREVIOUS-DAY ALERT BANNER (IF ACTIVE) */}
        {dossier.previousDayAlert && (
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-100 to-amber-50 border-2 border-amber-400 rounded-2xl shadow-xs flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                ಮುಂಬರುವ ದಿನದ ಪೂರ್ವಭಾವಿ ಧಾರ್ಮಿಕ ಸೂಚನೆ (Tomorrow's Preparation Alert)
              </span>
              <p className="text-xs font-bold text-amber-950 whitespace-pre-line leading-relaxed">
                {dossier.previousDayAlert}
              </p>
            </div>
          </div>
        )}

        {/* 4. FESTIVAL BANNER (IF MATCHED) */}
        {dossier.matchedFestival && (
          <div className="p-4 bg-gradient-to-r from-amber-100 via-[#FFFDF7] to-amber-50 border-2 border-amber-400 rounded-2xl shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-300 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl p-1 bg-white rounded-xl border border-amber-300">🪔</span>
                <div>
                  <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                    <span>{dossier.matchedFestival.nameKn}</span>
                    <span className="text-xs font-bold text-amber-800">({dossier.matchedFestival.nameEn})</span>
                  </h2>
                  <p className="text-[10px] font-bold text-amber-900">
                    {dossier.matchedFestival.masaKn} {dossier.matchedFestival.pakshaKn} {dossier.matchedFestival.tithiKn} • {dossier.weekdayKn}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-amber-950 shrink-0">
                {dossier.matchedFestival.category}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-slate-500 block">ಪೂಜಾ ಮುಹೂರ್ತ ಕಾಲ:</span>
                <span className="font-black text-emerald-800 text-xs mt-0.5 block">
                  {dossier.matchedFestival.pujaWindow || "ದಿನದ ಪ್ರಾತಃಕಾಲ & ಮಾಧ್ಯಾಹ್ನ ಕಾಲ"}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-slate-500 block">ತಿಥಿ & ಮುಕ್ತಾಯ:</span>
                <span className="font-black text-amber-950 text-xs mt-0.5 block">
                  {dossier.tithiKn} ({dossier.tithiGhati}) ಅಂತ್ಯ: {dossier.tithiEndTime}
                </span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-slate-500 block">ಶ್ರಾದ್ಧ ತಿಥಿ:</span>
                <span className="font-black text-purple-950 text-xs mt-0.5 block">
                  {dossier.shraddhaTithi}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-800 font-semibold leading-relaxed pt-1">
              <span className="font-bold text-amber-950">ಧಾರ್ಮಿಕ ವಿವರ: </span>
              {dossier.matchedFestival.descriptionKn}
            </p>
          </div>
        )}

        {/* 5. LIVE GOCHARA KUNDALI (TRANSIT PLANETARY CHART) */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌌</span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-amber-950">
                  ಲೈವ್ ಗೋಚಾರ ಗ್ರಹ ಚಕ್ರ (Live Gochara Transit Kundali)
                </h3>
                <p className="text-[10px] font-semibold text-slate-600">
                  ದಿನಾಂಕ {dossier.dateStr} ರ ಸೂರ್ಯೋದಯ ಕಾಲದ ಗ್ರಹ ಸ್ಥಿತಿ (South Indian Vedic Chart)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
              ದೃಗ್ಗಣಿತ ಸ್ಪಷ್ಟ
            </span>
          </div>

          {/* South Indian 4x4 Chart Grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 max-w-xl mx-auto bg-amber-900/10 p-2 rounded-2xl border-2 border-amber-300">
            {/* Top Row: Meena, Mesha, Vrishabha, Mithuna */}
            {[11, 0, 1, 2].map((rIdx) => {
              const rName = ["ಮೇಷ", "ವೃಷಭ", "ಮಿಥುನ", "ಕರ್ಕ", "ಸಿಂಹ", "ಕನ್ಯಾ", "ತುಲಾ", "ವೃಶ್ಚಿಕ", "ಧನು", "ಮಕರ", "ಕುಂಭ", "ಮೀನ"][rIdx];
              const planets = dossier.gocharaHouseMap[rIdx] || [];
              return (
                <div key={rIdx} className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">{rName}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planets.map((p, pi) => (
                      <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Middle Row 1: Kumbha (Left), Hollow Center, Kataka (Right) */}
            <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">ಕುಂಭ</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(dossier.gocharaHouseMap[10] || []).map((p, pi) => (
                  <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Hollow Center Banner */}
            <div className="col-span-2 row-span-2 bg-gradient-to-br from-amber-50 via-[#FFFDF7] to-amber-100/70 border-2 border-amber-400 rounded-xl p-2 sm:p-3 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-xl sm:text-2xl mb-1">🕉️</span>
              <span className="text-[11px] sm:text-xs font-black text-amber-950 block">
                ॥ ಬಗ್ಗೋಣ ಗೋಚಾರ ಚಕ್ರ ॥
              </span>
              <span className="text-[9px] font-bold text-amber-800 block mt-0.5">
                {dossier.chandramanaMasaKn} {dossier.pakshaKn} • {dossier.tithiKn}
              </span>
              <span className="text-[9px] font-bold text-slate-600 block">
                {dossier.dateStr} ({dossier.weekdayKn})
              </span>
            </div>

            <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">ಕರ್ಕಾಟಕ</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(dossier.gocharaHouseMap[3] || []).map((p, pi) => (
                  <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle Row 2: Makara (Left), Simha (Right) */}
            <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">ಮಕರ</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(dossier.gocharaHouseMap[9] || []).map((p, pi) => (
                  <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">ಸಿಂಹ</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(dossier.gocharaHouseMap[4] || []).map((p, pi) => (
                  <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
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
                <div key={rIdx} className="bg-[#FFFDF7] border-2 border-amber-300/80 rounded-xl p-1.5 sm:p-2 min-h-[75px] sm:min-h-[90px] flex flex-col justify-between shadow-2xs">
                  <span className="text-[9px] font-black text-amber-800 border-b border-amber-200 pb-0.5">{rName}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {planets.map((p, pi) => (
                      <span key={pi} className="text-[10px] sm:text-xs font-black bg-amber-100 text-amber-950 px-1 rounded border border-amber-300">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. DUAL-PAGE BLUEPRINT PRINT-REPLICA CARDS (LEFT & RIGHT PAGE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT PAGE CARD */}
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
              <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                <span>📖</span>
                <span>ಎಡ ಪುಟ (Left Page — ಪಂಚಾಂಗ ಅಂಗಗಳು & ಶ್ರಾದ್ಧ)</span>
              </span>
              <span className="text-xs font-bold text-amber-800">
                {dossier.chandramanaMasaKn} {dossier.pakshaKn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ತಿಥಿ (Tithi):</span>
                <span className="font-black text-slate-900 text-xs">{dossier.tithiKn} ({dossier.tithiGhati})</span>
                <span className="text-[10px] text-amber-800 block">ಅಂತ್ಯ: {dossier.tithiEndTime}</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ನಕ್ಷತ್ರ (Nakshatra):</span>
                <span className="font-black text-slate-900 text-xs">{dossier.nakshatraKn} ({dossier.nakshatraGhati})</span>
                <span className="text-[10px] text-amber-800 block">ಅಂತ್ಯ: {dossier.nakshatraEndTime}</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ಯೋಗ (Yoga):</span>
                <span className="font-black text-slate-900 text-xs">{dossier.yogaKn} ({dossier.yogaGhati})</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ಕರಣ (Karana):</span>
                <span className="font-black text-slate-900 text-xs">{dossier.karanaKn} ({dossier.karanaGhati})</span>
              </div>

              <div className="p-2 bg-amber-50 rounded-xl border border-amber-300">
                <span className="text-amber-900 font-black block text-[10px]">ಶ್ರಾದ್ಧ ತಿಥಿ (Shraddha):</span>
                <span className="font-black text-amber-950 text-xs">{dossier.shraddhaTithi}</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ರವಿ ನಕ್ಷತ್ರ:</span>
                <span className="font-black text-slate-900 text-xs">{dossier.sunNakshatraKn}</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ದಿನಪ್ರಮಾಣ:</span>
                <span className="font-black text-slate-900 text-xs">{dossier.dinapramana}</span>
              </div>

              <div className="p-2 bg-[#FFFDF7] rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block text-[10px]">ವಿಷ / ಅಮೃತ ಘಟಿ:</span>
                <span className="font-black text-slate-900 text-xs">ವಿ: {dossier.vishaGhati} | ಅ: {dossier.amritaGhati}</span>
              </div>
            </div>

            {dossier.festivalsAndVratas.length > 0 && (
              <div className="pt-2 border-t border-amber-200">
                <span className="text-[11px] font-black text-amber-950 block mb-1">ಹಬ್ಬ-ಹರಿದಿನಗಳು & ವಿಶೇಷಗಳು:</span>
                <div className="flex flex-wrap gap-1.5">
                  {dossier.festivalsAndVratas.map((f, fi) => (
                    <span key={fi} className="text-xs font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PAGE CARD */}
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
              <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                <span>🏛️</span>
                <span>ಬಲ ಪುಟ (Right Page — ೧೨ ದಿನ ಲಗ್ನಗಳು & ಗ್ರಹ ಸ್ಪಷ್ಟ)</span>
              </span>
              <span className="text-xs font-bold text-amber-800">
                ಸೌರ {dossier.sauramanaMasaKn} (ದಿನ {dossier.sauramanaDina})
              </span>
            </div>

            {/* 12 Dina Lagna Ending Times Table */}
            <div>
              <span className="text-[11px] font-black text-amber-950 block mb-1">೧೨ ಲಗ್ನ ಸಮಾಪ್ತಿ ಕಾಲಗಳು (Lagna Ending Times):</span>
              <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಮೀ:</span> {dossier.lagnaEndingTimes.meena}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಮೇ:</span> {dossier.lagnaEndingTimes.mesha}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ವೃ:</span> {dossier.lagnaEndingTimes.vrishabha}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಮಿ:</span> {dossier.lagnaEndingTimes.mithuna}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಕ:</span> {dossier.lagnaEndingTimes.karkataka}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಸಿ:</span> {dossier.lagnaEndingTimes.simha}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಕನ್ಯಾ:</span> {dossier.lagnaEndingTimes.kanya}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ತು:</span> {dossier.lagnaEndingTimes.tula}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ವೃಶ್ಚ:</span> {dossier.lagnaEndingTimes.vrischika}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಧ:</span> {dossier.lagnaEndingTimes.dhanu}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಮ:</span> {dossier.lagnaEndingTimes.makara}</div>
                <div className="bg-[#FFFDF7] p-1 rounded border border-amber-200"><span className="font-bold text-amber-900">ಕುಂ:</span> {dossier.lagnaEndingTimes.kumbha}</div>
              </div>
            </div>

            {/* Navagraha Spashta Table */}
            <div className="pt-2 border-t border-amber-200">
              <span className="text-[11px] font-black text-amber-950 block mb-1">ನವಗ್ರಹ ಸ್ಪಷ್ಟ (Navagraha Spashta Degrees):</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="bg-amber-100/70 border-b border-amber-300 text-amber-950 font-black">
                      <th className="py-1 px-1.5">ಗ್ರಹ</th>
                      <th className="py-1 px-1.5">ರಾಶಿ</th>
                      <th className="py-1 px-1.5">ಭಾಗೆ/ಕಲೆ</th>
                      <th className="py-1 px-1.5">ನಕ್ಷತ್ರ / ಪಾದ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {dossier.gocharaPlacements.map((p, pi) => (
                      <tr key={pi} className="hover:bg-amber-50/50">
                        <td className="py-1 px-1.5 font-bold text-amber-950">{p.planetKn} {p.isRetrograde ? "(ವ)" : ""}</td>
                        <td className="py-1 px-1.5">{p.rashiKn}</td>
                        <td className="py-1 px-1.5 font-mono">{p.degreesFormatted}</td>
                        <td className="py-1 px-1.5">{p.nakshatraKn} {p.pada ? `(ಪಾದ ${p.pada})` : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 7. DAILY PRIEST DUTY & MUHURTHA TIMELINE */}
        <section className="bg-white border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <h3 className="text-xs sm:text-sm font-black text-amber-950">
                ದೈನಂದಿನ ಪುರೋಹಿತ ಕರ್ತವ್ಯ ಮುಹೂರ್ತಗಳು (Daily Priest Duty & Puja Windows — IST)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">ಸ್ಥಳ: {locationName} ({pincode})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 block">ಬ್ರಾಹ್ಮೀ ಮುಹೂರ್ತ:</span>
              <span className="font-black text-emerald-900 text-xs mt-0.5 block">{dossier.brahmaMuhurtha}</span>
            </div>
            <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 block">ಅಭಿಜಿತ್ ಮುಹೂರ್ತ:</span>
              <span className="font-black text-emerald-900 text-xs mt-0.5 block">{dossier.abhijitMuhurtha}</span>
            </div>
            <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 block">ಅಪರಾಹ್ನ ಶ್ರಾದ್ಧ ಕಾಲ:</span>
              <span className="font-black text-purple-900 text-xs mt-0.5 block">{dossier.madhyahnaShraddhaWindow}</span>
            </div>
            <div className="p-2.5 bg-[#FFFDF7] rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-500 block">ಸಾಯಂಕಾಲ ಪ್ರದೋಷ:</span>
              <span className="font-black text-blue-900 text-xs mt-0.5 block">{dossier.sayankalaPradosha}</span>
            </div>
            <div className="p-2.5 bg-red-50/50 rounded-xl border border-red-200">
              <span className="text-[10px] font-bold text-red-700 block">ರಾಹು ಕಾಲ:</span>
              <span className="font-black text-red-950 text-xs mt-0.5 block">{dossier.rahuKaala}</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 block">ಗುಳಿಕ ಕಾಲ:</span>
              <span className="font-black text-amber-950 text-xs mt-0.5 block">{dossier.gulikaKaala}</span>
            </div>
            <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-700 block">ಯಮಗಂಡ:</span>
              <span className="font-black text-purple-950 text-xs mt-0.5 block">{dossier.yamaganda}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">ನಿಶೀಥ ಕಾಲ (ರಾತ್ರಿ):</span>
              <span className="font-black text-slate-900 text-xs mt-0.5 block">{dossier.nishitaKaala}</span>
            </div>
          </div>
        </section>
      </main>

      {/* 8. 1-CLICK PRIEST CALENDAR EXPORT & QR MODAL */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowCalendarModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 font-black text-base"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="text-base font-black text-amber-950">
                  ಪುರೋಹಿತ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ರಫ್ತು (Priest Calendar Export)
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Google Calendar, Apple Calendar ಮತ್ತು Outlook ಗಾಗಿ ಅಧಿಕೃತ .ics ಫೈಲ್ & QR ಕೋಡ್
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ಕ್ಯಾಲೆಂಡರ್ ದಿನಗಳ ಸಂಖ್ಯೆ (Calendar Span):
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[30, 60, 90, 120, 180].map((span) => (
                    <button
                      key={span}
                      type="button"
                      onClick={() => setCalendarSpanDays(span)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        calendarSpanDays === span
                          ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                          : "bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {span} ದಿನಗಳು
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code Preview */}
              <div className="p-4 bg-[#FFFDF7] border-2 border-amber-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2.5 bg-white rounded-xl border border-amber-300 shadow-xs">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Priest Panchanga QR Code" className="w-32 h-32" />
                  ) : (
                    <div className="w-32 h-32 bg-amber-50 flex items-center justify-center text-xs text-amber-800">
                      QR Code Loading...
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold text-amber-900">
                  ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಲ್ಲಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನೇರವಾಗಿ ಪಂಚಾಂಗ ದರ್ಶನ ಪಡೆಯಿರಿ
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPriestICS}
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-slate-950 border border-amber-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>⬇️</span>
                  <span>{calendarSpanDays} ದಿನಗಳ .ICS ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const origin = getSafeProductionOrigin();
                    navigator.clipboard.writeText(`${origin}/priest-panchanga?date=${selectedDate}&pincode=${pincode}`);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                    void recordPriestCalendarAction({
                      priestName: "ಶ್ರೀರಾಮ್ ಪಂಡಿತ್",
                      action: "qr_scan",
                      date: selectedDate,
                      spanDays: calendarSpanDays,
                      pincode,
                      locationName
                    });
                  }}
                  className="px-4 py-3 rounded-2xl text-xs font-black bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 transition-all"
                >
                  {copySuccess ? "✓ ನಕಲಿಸಲಾಗಿದೆ" : "ಲಿಂಕ್ ಕಾಪಿ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
