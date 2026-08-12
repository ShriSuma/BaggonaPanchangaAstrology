import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateSevaICalendarString
} from "../../features/seva/icsCalendarGenerator";
import { T, pick } from "../../features/seva/sevaLocale";

type Props = {
  days: RhythmDay[];
  personName: string;
  lang: string;
  isOpen: boolean;
  onClose: () => void;
};


export default function SevaCalendarSyncModal({
  days,
  personName,
  lang,
  isOpen,
  onClose
}: Props): JSX.Element | null {
  const [panditName, setPanditName] = useState("Chaitanya Pandit");
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const timeOptions = [
    { label: "05:00 AM", value: "05:00" },
    { label: "06:00 AM", value: "06:00" },
    { label: "07:00 AM", value: "07:00" },
    { label: "08:00 AM (Default)", value: "08:00" },
    { label: "09:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" }
  ];

  // Speech Recognition for Mic option
  const handleMicClick = () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Speech recognition is not supported in this browser. Please type the name manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      const speechLangMap: Record<string, string> = {
        kn: "kn-IN",
        te: "te-IN",
        ta: "ta-IN",
        hi: "hi-IN",
        en: "en-IN"
      };
      recognition.lang = speechLangMap[lang] || "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setPanditName(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Generate QR Code and .ics payload dynamically whenever options change
  useEffect(() => {
    if (!isOpen || days.length === 0) return;

    const targetUrl = generateGoogleCalendarUrl({
      day: days[0]!,
      lang,
      panditName,
      notificationTime
    });

    QRCode.toDataURL(targetUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: "#78350F", // Amber dark tone
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [days, lang, panditName, notificationTime, personName, isOpen]);

  if (!isOpen) return null;

  const selectedDay = days[0];

  const handleDownload = () => {
    const icsContent = generateSevaICalendarString({
      days,
      lang,
      panditName,
      notificationTime,
      personName
    });
    const filename = `Baggona_Panchanga_${personName ? personName.replace(/\s+/g, "_") : "Calendar"}_6Months.ics`;
    downloadIcsFile(filename, icsContent);
  };

  const handleGoogleCalendar = () => {
    if (!selectedDay) return;
    const url = generateGoogleCalendarUrl({
      day: selectedDay,
      lang,
      panditName,
      notificationTime
    });
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    const icsContent = generateSevaICalendarString({
      days,
      lang,
      panditName,
      notificationTime,
      personName
    });
    const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    navigator.clipboard.writeText(dataUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/90 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              {pick(T.syncCalendarTitle!, lang)}
            </h2>
            <p className="mt-1 text-xs text-amber-900/70">{pick(T.syncCalendarSub!, lang)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-amber-100 p-2 text-amber-800 transition hover:bg-amber-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Customization controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Pandit Name Input with Mic Button */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80">
                {pick(T.panditNameLabel!, lang)}
              </label>
              <div className="relative mt-1 flex items-center">
                <input
                  type="text"
                  value={panditName}
                  onChange={(e) => setPanditName(e.target.value)}
                  placeholder="e.g. Chaitanya Pandit"
                  className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 pr-10 text-sm font-medium text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  title={isListening ? pick(T.micListening!, lang) : pick(T.micSpeak!, lang)}
                  className={`absolute right-2 rounded-lg p-1.5 transition ${
                    isListening
                      ? "animate-pulse bg-red-500 text-white"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  🎙️
                </button>
              </div>
              {isListening && (
                <span className="mt-1 block text-[11px] font-semibold text-red-600">
                  {pick(T.micListening!, lang)}
                </span>
              )}
            </div>

            {/* Notification Time Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80">
                {pick(T.notificationTimeLabel!, lang)}
              </label>
              <select
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              >
                {timeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* QR Code & Scan Instructions */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white p-5 shadow-inner sm:flex-row sm:gap-6">
            <div className="flex shrink-0 flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Daily Panchanga Sync QR Code"
                  className="h-44 w-44 rounded-xl border border-amber-200 bg-white p-2 shadow-sm"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-amber-50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
                </div>
              )}
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                📲 {pick(T.scanQrTitle!, lang)}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-center sm:mt-0 sm:text-left">
              <h3 className="font-serif text-base font-bold text-amber-950">
                {pick(T.scanQrTitle!, lang)}
              </h3>
              <p className="text-xs leading-relaxed text-amber-900/80">
                {pick(T.scanQrDesc!, lang)}
              </p>

              <div className="pt-2">
                <div className="inline-block rounded-lg bg-amber-100/80 px-3 py-1.5 text-[11px] font-medium text-amber-900">
                  ❖ {personName ? `Prepared for ${personName}` : "Kundali Sync"} · {days.length} Days
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-3 text-xs font-bold text-amber-50 shadow-md transition hover:bg-amber-900"
            >
              🌐 {pick(T.addToGoogleCalendar!, lang)}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-amber-100 px-4 py-3 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
            >
              📅 {pick(T.downloadIcsFile!, lang)}
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs font-semibold text-amber-800 underline decoration-amber-400 underline-offset-4 transition hover:text-amber-950"
            >
              {copied ? "✓ Copied Calendar Data to Clipboard!" : "📋 Copy iCalendar Link Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
