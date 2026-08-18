import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateQrPayloadByTarget,
  generateSevaICalendarString,
  type QrCalendarTarget
} from "../../features/seva/icsCalendarGenerator";
import { encodeDevoteeToken } from "../../utils/tokenCipher";
import { T, pick } from "../../features/seva/sevaLocale";
import {
  getAllPriests,
  addCustomPriest,
  getPriestProfile,
  type PriestProfile
} from "../../features/seva/sevaPriestDirectory";
import { resolvePlaceFromPincode, getCoordinates } from "../../services/locationApi";

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
  const [target, setTarget] = useState<QrCalendarTarget>("google");
  const [platform, setPlatform] = useState<"android" | "apple">("android");
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>("chaitanya-pandit");
  const [customInputMode, setCustomInputMode] = useState<boolean>(false);
  const [newPriestName, setNewPriestName] = useState<string>("");

  const activePriest = useMemo(() => getPriestProfile(selectedPriestId), [selectedPriestId, priestsList]);
  const panditName = activePriest.name[lang as keyof typeof activePriest.name] || activePriest.name.en;

  const [pincodeInput, setPincodeInput] = useState<string>("581326");
  const [locationName, setLocationName] = useState<string>("Gokarna");
  const [lat, setLat] = useState<number>(14.54);
  const [lng, setLng] = useState<number>(74.31);
  const [isResolvingPin, setIsResolvingPin] = useState<boolean>(false);
  const [pinMessage, setPinMessage] = useState<string>("");

  const handlePinResolve = async (pinOrQuery: string) => {
    const clean = pinOrQuery.trim();
    if (!clean) return;
    setIsResolvingPin(true);
    setPinMessage("");

    try {
      if (/^[1-9]\d{5}$/.test(clean)) {
        const resolved = await resolvePlaceFromPincode(clean);
        if (resolved && Number.isFinite(resolved.lat) && Number.isFinite(resolved.lng)) {
          setLocationName(resolved.villageName || `PIN ${clean}`);
          setLat(resolved.lat);
          setLng(resolved.lng);
          setPinMessage(`✓ Verified: ${resolved.villageName || clean}`);
          setIsResolvingPin(false);
          return;
        }
      }
      const coords = await getCoordinates(clean);
      if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
        setLocationName(clean.split(",")[0]?.trim() || clean);
        setLat(coords.lat);
        setLng(coords.lng);
        setPinMessage(`✓ Verified: ${clean}`);
      } else {
        setPinMessage("⚠️ Using default Gokarna coordinates");
      }
    } catch (err) {
      console.error("PIN resolution error:", err);
      setPinMessage("⚠️ Using default Gokarna coordinates");
    } finally {
      setIsResolvingPin(false);
    }
  };

  const [notificationTime, setNotificationTime] = useState("08:00");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedData, setCopiedData] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const timeOptions = [
    { label: "05:00 AM", value: "05:00" },
    { label: "06:00 AM", value: "06:00" },
    { label: "07:00 AM", value: "07:00" },
    { label: "08:00 AM (Default)", value: "08:00" },
    { label: "09:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" }
  ];

  const origin =
    typeof window !== "undefined" &&
    window.location?.origin &&
    !window.location.origin.includes("localhost") &&
    !window.location.origin.includes("127.0.0.1")
      ? window.location.origin
      : "https://baggona.app";

  const devoteeToken = useMemo(() => {
    const selectedDay = days && days.length > 0 ? days[0] : null;
    return encodeDevoteeToken({
      n: personName || (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee"),
      nk: selectedDay?.moonNakshatraIndex,
      r: selectedDay?.moonRashiIndex,
      p: panditName,
      d: selectedDay?.ymd || new Date().toISOString().slice(0, 10),
      l: lang,
      tm: notificationTime,
      pl: platform,
      t: target,
      pc: pincodeInput,
      lt: lat,
      lg: lng,
      loc: locationName
    });
  }, [days, personName, lang, panditName, platform, target, notificationTime, pincodeInput, lat, lng, locationName]);

  const webSanctumUrl = `${origin}/daily?token=${devoteeToken}`;

  // Speech Recognition for Pandit Name (Voice Input)
  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "kn" ? "kn-IN" : "en-US";
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          const added = addCustomPriest(transcript);
          setPriestsList(getAllPriests());
          setSelectedPriestId(added.id);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Generate QR Code dynamically whenever target or options change
  useEffect(() => {
    if (!isOpen) return;

    try {
      const payload = generateQrPayloadByTarget(target, {
        days: days || [],
        lang,
        panditName,
        notificationTime,
        personName,
        platform,
        webAppBaseUrl: origin,
        pincode: pincodeInput,
        lat,
        lng,
        locationName
      });

      QRCode.toDataURL(payload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 280,
        color: {
          dark: "#78350F", // Amber dark tone
          light: "#FFFFFF"
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.error("Error generating QR code:", err);
          // Compact ASCII-only fallback to guarantee scannable QR
          const fallback = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga")}&recur=RRULE:FREQ=DAILY;COUNT=90&ctz=Asia/Kolkata`;
          QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 280 })
            .then((fallbackUrl) => setQrDataUrl(fallbackUrl));
        });
    } catch (e) {
      console.error("Error in QR payload generation:", e);
      const fallback = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga")}&ctz=Asia/Kolkata`;
      QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 280 })
        .then((fallbackUrl) => setQrDataUrl(fallbackUrl));
    }
  }, [days, lang, panditName, notificationTime, personName, platform, target, isOpen, webSanctumUrl, origin, pincodeInput, lat, lng, locationName]);

  if (!isOpen) return null;

  const selectedDay = days[0];

  const handleDownload = () => {
    const icsContent = generateSevaICalendarString({
      days,
      lang,
      panditName,
      notificationTime,
      personName,
      webAppBaseUrl: origin,
      pincode: pincodeInput,
      lat,
      lng,
      locationName
    });
    const safePujari = (panditName || "Archaka").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    const safeDevotee = (personName || "Bhakta").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    const safeDate = (selectedDay?.ymd || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");
    const filename = `${safePujari}_${safeDevotee}_90Day_Panchanga_${safeDate}_${lang.toUpperCase()}.ics`;
    downloadIcsFile(filename, icsContent);
  };

  const handleGoogleCalendar = () => {
    if (!selectedDay) return;
    const url = generateGoogleCalendarUrl({
      day: selectedDay,
      lang,
      panditName,
      notificationTime,
      personName,
      webAppBaseUrl: origin,
      pincode: pincodeInput,
      lat,
      lng,
      locationName
    });
    window.open(url, "_blank");
  };

  const handleCopyLinkData = () => {
    const icsContent = generateSevaICalendarString({
      days,
      lang,
      panditName,
      notificationTime,
      personName,
      pincode: pincodeInput,
      lat,
      lng,
      locationName
    });
    const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    navigator.clipboard.writeText(dataUri);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleCopyWebLink = () => {
    navigator.clipboard.writeText(webSanctumUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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

        <div className="mt-5 space-y-4">
          {/* Target & Platform Selector */}
          <div className="rounded-2xl border border-amber-300/80 bg-amber-100/40 p-3 shadow-inner">
            <label className="block text-center text-xs font-bold uppercase tracking-wider text-amber-950 mb-2">
              📱 {lang.startsWith("kn") ? "ಕ್ಯಾಲೆಂಡರ್ & ವೆಬ್ ಗಮ್ಯಸ್ಥಾನ ಆಯ್ಕೆಮಾಡಿ" : "Choose QR & Calendar Destination"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTarget("sanctum");
                  setPlatform("android");
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition shadow-sm ${
                  target === "sanctum"
                    ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300"
                    : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                <span>🌟</span>
                <span>{lang.startsWith("kn") ? "ವೆಬ್ ಸ್ಯಾಂಕ್ಟಮ್" : "Web Sanctum"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTarget("google");
                  setPlatform("android");
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition shadow-sm ${
                  target === "google"
                    ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300"
                    : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                <span>🤖</span>
                <span>Google Cal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTarget("webcal");
                  setPlatform("apple");
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition shadow-sm ${
                  target === "webcal"
                    ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300"
                    : "bg-white text-amber-900 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                <span>🍎</span>
                <span>Apple / iCal</span>
              </button>
            </div>
          </div>

          {/* Customization controls */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* PIN Code / Location Input Card */}
            <div className="sm:col-span-2 rounded-2xl border border-amber-300/80 bg-amber-100/50 p-3 shadow-inner">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1">
                📍 {lang.startsWith("kn") ? "ಪಿನ್ ಕೋಡ್ / ನಿಮ್ಮ ಸ್ಥಳ (PIN Code / Location)" : "Devotee PIN Code / Location"}
              </label>
              <p className="text-[11px] text-amber-900/80 mb-2">
                {lang.startsWith("kn")
                  ? "ನಿಮ್ಮ ಸ್ಥಳದ ಸೂರ್ಯೋದಯ, ಸೂರ್ಯಾಸ್ತ, ತಿಥಿ, ನಕ್ಷತ್ರ ಹಾಗೂ ರಾಹುಕಾಲ ಸರಿಯಾಗಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲು PIN Code ಅಥವಾ ನಗರದ ಹೆಸರು ನಮೂದಿಸಿ."
                  : "Enter your PIN code or city name to calculate location-accurate Tithi, Nakshatra, Sunrise, Sunset, and Rahu Kaala."}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  onBlur={() => handlePinResolve(pincodeInput)}
                  placeholder="e.g. 581326, 500001, Hyderabad, London..."
                  className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handlePinResolve(pincodeInput)}
                  disabled={isResolvingPin}
                  className="rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900 transition shadow-sm shrink-0"
                >
                  {isResolvingPin ? "⌛..." : (lang.startsWith("kn") ? "ಅನ್ವಯಿಸಿ" : "Apply")}
                </button>
              </div>
              {pinMessage && (
                <div className="mt-1.5 text-[11px] font-semibold text-amber-900 flex items-center justify-between">
                  <span>{pinMessage}</span>
                  <span className="text-[10px] text-amber-700/80 font-mono">
                    [{lat.toFixed(2)}°, {lng.toFixed(2)}°]
                  </span>
                </div>
              )}
            </div>

            {/* Pre-defined Priest Dropdown Selector & Dynamic Custom Addition */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-1">
                {lang.startsWith("kn") ? "ಅರ್ಚಕರ ಆಯ್ಕೆ (Priest Selection)" : "Select Priest / Archaka"}
              </label>
              {!customInputMode ? (
                <div className="flex gap-2">
                  <select
                    value={selectedPriestId}
                    onChange={(e) => {
                      if (e.target.value === "ADD_NEW") {
                        setCustomInputMode(true);
                      } else {
                        setSelectedPriestId(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                  >
                    {priestsList.map((p) => {
                      const name = p.name[lang as keyof typeof p.name] || p.name.en;
                      const title = p.title[lang as keyof typeof p.title] || p.title.en;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.sealSymbol} {name} ({title})
                        </option>
                      );
                    })}
                    <option value="ADD_NEW">➕ {lang.startsWith("kn") ? "ಹೊಸ ಅರ್ಚಕರನ್ನು ಸೇರಿಸಿ..." : "Add New Priest..."}</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleMicClick}
                    title={isListening ? pick(T.micListening!, lang) : pick(T.micSpeak!, lang)}
                    className={`rounded-xl p-2 transition ${
                      isListening
                        ? "animate-pulse bg-red-500 text-white"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPriestName}
                    onChange={(e) => setNewPriestName(e.target.value)}
                    placeholder={lang.startsWith("kn") ? "ಅರ್ಚಕರ ಹೆಸರು ಟೈಪ್ ಮಾಡಿ..." : "Enter Priest Name..."}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPriestName.trim()) {
                        const added = addCustomPriest(newPriestName.trim());
                        setPriestsList(getAllPriests());
                        setSelectedPriestId(added.id);
                        setNewPriestName("");
                        setCustomInputMode(false);
                      }
                    }}
                    className="rounded-xl bg-amber-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-sm"
                  >
                    {lang.startsWith("kn") ? "ಸೇರಿಸಿ" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomInputMode(false)}
                    className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Dynamic Priest Seal Badge & Shloka Card */}
              <div className="mt-2 rounded-xl border border-amber-300/80 bg-amber-100/60 p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl" style={{ color: activePriest.sealColor }}>{activePriest.sealSymbol}</span>
                  <div>
                    <div className="text-xs font-bold text-amber-950">
                      {activePriest.sealText[lang as keyof typeof activePriest.sealText] || activePriest.sealText.en}
                    </div>
                    <div className="text-[11px] font-medium text-amber-800/80">
                      {activePriest.title[lang as keyof typeof activePriest.title] || activePriest.title.en}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 border-t border-amber-200/80 pt-1 text-[11px] italic text-amber-900">
                  "{activePriest.shloka.sanskrit}"
                </div>
              </div>
            </div>

            {/* Notification Time Dropdown */}
            <div className="sm:col-span-2">
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-white p-4 shadow-inner sm:flex-row sm:gap-5">
            <div className="flex shrink-0 flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Daily Panchanga Sync QR Code"
                  className="h-40 w-40 rounded-xl border border-amber-200 bg-white p-1.5 shadow-sm"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-amber-50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
                </div>
              )}
              <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                📲 {target === "sanctum" ? "🌟 Scan to Open Web Sanctum" : target === "google" ? "🤖 Scan for Google Cal" : "🍎 Scan for Apple iCal"}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-center sm:mt-0 sm:text-left">
              <h3 className="font-serif text-sm font-bold text-amber-950">
                {pick(T.scanQrTitle!, lang)}
              </h3>
              <p className="text-xs leading-relaxed text-amber-900/80">
                {pick(T.scanQrDesc!, lang)}
              </p>

              <div className="pt-1">
                <div className="inline-block rounded-lg bg-amber-100/80 px-2.5 py-1 text-[11px] font-medium text-amber-900 border border-amber-300">
                  ❖ {personName ? `Prepared for ${personName}` : "Kundali Sync"}
                </div>
              </div>
            </div>
          </div>

          {/* Web Subscription Link Card */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-100/70 via-orange-50/80 to-amber-100/70 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
              <span>🌐 {lang.startsWith("kn") ? "ದೈನಿಕ ದರ್ಶನ ವೆಬ್ ಚಂದಾದಾರಿಕೆ ಲಿಂಕ್" : "Devotee Web Subscription Link"}:</span>
              <button
                type="button"
                onClick={handleCopyWebLink}
                className="text-[11px] font-bold text-amber-800 underline decoration-amber-500 hover:text-amber-950 transition"
              >
                {copiedLink ? "✓ Copied Link!" : "📋 Copy Link"}
              </button>
            </div>
            <div className="rounded-xl border border-amber-300 bg-white/90 p-2 text-[10px] font-mono text-amber-900 break-all select-all shadow-inner">
              {webSanctumUrl}
            </div>
            <div className="mt-2 flex gap-2">
              <a
                href={webSanctumUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-xl bg-amber-800 py-2 px-3 text-xs font-bold text-amber-50 shadow-sm transition hover:bg-amber-900"
              >
                🔗 {lang.startsWith("kn") ? "ವೆಬ್ ಸ್ಯಾಂಕ್ಟಮ್ ತೆರೆಯಿರಿ (Mobile Sanctum)" : "Open Devotee Web Sanctum"}
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGoogleCalendar}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:bg-amber-900"
            >
              🌐 {pick(T.addToGoogleCalendar!, lang)}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
            >
              📅 {pick(T.downloadIcsFile!, lang)}
            </button>
          </div>

          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={handleCopyLinkData}
              className="text-[11px] font-semibold text-amber-800 underline decoration-amber-400 underline-offset-4 transition hover:text-amber-950"
            >
              {copiedData ? "✓ Copied iCal Data to Clipboard!" : "📋 Copy Raw iCalendar Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

