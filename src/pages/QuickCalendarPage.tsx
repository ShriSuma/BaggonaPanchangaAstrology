import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { SEVA_CATALOG, type SevaId } from "../data/gokarnaSevas";
import { NAKSHATRA_L5, RASHI_L5, pick, type SevaLang } from "../features/seva/sevaLocale";
import { calculateDeterministicRhythmDay, generateSevaICalendarString, generateGoogleCalendarUrl, generateQrPayloadByTarget, type QrCalendarTarget, getSafeProductionOrigin } from "../features/seva/icsCalendarGenerator";
import { encodeDateOnlyDevoteeToken, encodeDevoteeToken } from "../utils/tokenCipher";
import { generatePDFFromElement } from "../utils/pdfGenerator";
import { resolvePlaceFromPincode } from "../services/locationApi";
import { getAllPriests, addCustomPriest, getPriestProfile, type PriestProfile } from "../features/seva/sevaPriestDirectory";
import {
  SevaLetterPrint,
  SevaQRCodePrint,
  SevaAnugrahaGuidancePrint,
  SevaRemediesAnnualPrint,
  SevaPoojaMahatmePrint
} from "../components/seva/pdf/SevaPrintTemplates";
import { getUniversalBirthDetails } from "../utils/universalDevoteeKundli";
import { calculateKundli } from "../core/KundliEngine";
import { transliterateName } from "../utils/transliterator";
import { formatPoojaName } from "../features/seva/formatPoojaName";
import type { RhythmDay, RhythmResult } from "../core/DailyRhythmEngine";

const RASHI_NAMES = RASHI_L5.map(r => r.kn || r.en);
const NAKSHATRA_NAMES = NAKSHATRA_L5.map(n => n.kn || n.en);

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 900,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
  display: "block"
};

const POPULAR_GOTRAS = [
  "ಕಾಶ್ಯಪ", "ವಿಶ್ವಾಮಿತ್ರ", "ಭಾರದ್ವಾಜ", "ವಸಿಷ್ಠ", "ಗೌತಮ", "ಅಂಗಿರಸ", "ಕೌಂಡಿನ್ಯ", "ಜಾಮದಗ್ನಿ", "ಶ್ರೀವತ್ಸ", "ಹರಿತ"
];

export default function QuickCalendarPage(): JSX.Element {
  const [lang, setLang] = useState<SevaLang>("kn");
  const [personName, setPersonName] = useState("ಭಕ್ತರು");
  const [gotra, setGotra] = useState("ಕಾಶ್ಯಪ");
  const [dob, setDob] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [tob, setTob] = useState(""); // OPTIONAL FIELD!
  const [useManualStar, setUseManualStar] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState<number>(0);
  const [selectedNakshatra, setSelectedNakshatra] = useState<number>(0);

  const [sevaId, setSevaId] = useState<string>("rudrabhisheka");
  const [customPoojaMode, setCustomPoojaMode] = useState(false);
  const [customPoojaName, setCustomPoojaName] = useState("");
  const [sevaDate, setSevaDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [pincode, setPincode] = useState("581326");
  const [locationName, setLocationName] = useState("Gokarna");
  const [lat, setLat] = useState(14.54);
  const [lng, setLng] = useState(74.31);
  const [isResolvingPin, setIsResolvingPin] = useState(false);

  // Priest & Overrides
  const [priestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState("shreeram-pandit");
  const [overridePriestContact, setOverridePriestContact] = useState(false);
  const [customPriestName, setCustomPriestName] = useState("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
  const [customPriestPhone, setCustomPriestPhone] = useState("9972339362");
  const [customWhatsappNumber, setCustomWhatsappNumber] = useState("9972339362");

  // Optional Parents' Shraddha Tithi
  const [shraddhaTithi, setShraddhaTithi] = useState("");

  const [qrTarget, setQrTarget] = useState<QrCalendarTarget>("google");
  const [platform, setPlatform] = useState<"android" | "apple">("android");
  const [notificationTime, setNotificationTime] = useState("08:00");

  const [busy, setBusy] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [isSuccessGenerated, setIsSuccessGenerated] = useState(false);

  const [isUnknownBirth, setIsUnknownBirth] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);

  const startVoiceInput = (fieldKey: string, onResult: (val: string) => void) => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ (Voice input not supported in this browser)");
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : lang === "ta" ? "ta-IN" : "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListeningField(fieldKey);
      rec.onresult = (evt: any) => {
        const transcript = evt.results[0]?.[0]?.transcript;
        if (transcript) onResult(transcript.trim());
        setListeningField(null);
      };
      rec.onerror = () => setListeningField(null);
      rec.onend = () => setListeningField(null);
      rec.start();
    } catch (e) {
      console.warn("SpeechRec error:", e);
      setListeningField(null);
    }
  };

  const devoteeTransliterations = useMemo(() => {
    if (!personName.trim()) return null;
    return {
      kn: transliterateName(personName, "kn"),
      hi: transliterateName(personName, "hi"),
      te: transliterateName(personName, "te"),
      ta: transliterateName(personName, "ta"),
      en: transliterateName(personName, "en")
    };
  }, [personName]);

  const activePriest = useMemo(() => getPriestProfile(selectedPriestId), [selectedPriestId]);
  const panditName = overridePriestContact && customPriestName.trim()
    ? customPriestName.trim()
    : (activePriest.name[lang as keyof typeof activePriest.name] || activePriest.name.en);
  const priestPhone = overridePriestContact && customPriestPhone.trim() ? customPriestPhone.trim() : "9972339362";
  const whatsappPhone = overridePriestContact && customWhatsappNumber.trim() ? customWhatsappNumber.trim() : "9972339362";

  const priestTransliterations = useMemo(() => {
    if (!panditName.trim()) return null;
    return {
      kn: transliterateName(panditName, "kn"),
      hi: transliterateName(panditName, "hi"),
      te: transliterateName(panditName, "te"),
      ta: transliterateName(panditName, "ta"),
      en: transliterateName(panditName, "en")
    };
  }, [panditName]);

  // Auto-resolve Rashi and Nakshatra from DOB at 12:00 PM if not manual and not unknown
  useEffect(() => {
    if (useManualStar || isUnknownBirth || !dob) return;
    try {
      const details = getUniversalBirthDetails({ dob, tob: tob || "12:00", name: personName });
      if (details.nakshatraIndex !== undefined) setSelectedNakshatra(details.nakshatraIndex);
      if (details.rashiIndex !== undefined) setSelectedRashi(details.rashiIndex);
    } catch {
      // Fallback
    }
  }, [dob, tob, personName, useManualStar, isUnknownBirth]);

  // Resolve pincode
  useEffect(() => {
    if (pincode.length !== 6) return;
    setIsResolvingPin(true);
    resolvePlaceFromPincode(pincode)
      .then((place) => {
        if (place) {
          setLocationName(place.villageName || place.districtCode || "Gokarna");
          setLat(place.lat);
          setLng(place.lng);
        }
      })
      .catch(() => {})
      .finally(() => setIsResolvingPin(false));
  }, [pincode]);

  // Deterministic 90-day rhythm calculation
  const rhythmResult = useMemo<RhythmResult>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const days: RhythmDay[] = Array.from({ length: 90 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000);
      const ymd = d.toISOString().slice(0, 10);
      return calculateDeterministicRhythmDay(ymd, selectedNakshatra, selectedRashi, todayStr);
    });

    const startYmd = todayStr;
    const endYmd = days[days.length - 1]?.ymd || todayStr;

    return {
      startYmd,
      endYmd,
      days,
      months: [],
      janmaNakshatraIndex: selectedNakshatra,
      janmaRashiIndex: selectedRashi,
      janmaRashiLord: "Moon",
      personalNumbers: [3, 7, 9],
      personalColour: "yellow",
      personalDirection: "east"
    };
  }, [selectedNakshatra, selectedRashi]);

  // Generate Token & QR Code whenever inputs change
  useEffect(() => {
    let isMounted = true;
    const effectiveDob = isUnknownBirth ? "" : dob;
    const effectiveTob = isUnknownBirth ? "" : tob;
    const isDateOnly = isUnknownBirth || !effectiveTob || effectiveTob.trim().length === 0;
    const payload = {
      n: personName.trim() || "ಭಕ್ತರು",
      nk: selectedNakshatra,
      r: selectedRashi,
      g: gotra,
      p: panditName,
      d: sevaDate,
      dob: effectiveDob || undefined,
      tob: effectiveTob || undefined,
      l: lang,
      tm: notificationTime,
      pc: pincode,
      lt: lat,
      lg: lng,
      loc: locationName,
      ph: priestPhone,
      ocp: overridePriestContact ? 1 : undefined,
      shraddhaTithi: shraddhaTithi || undefined,
      st: shraddhaTithi || undefined
    };

    const token = isDateOnly ? encodeDateOnlyDevoteeToken(payload) : encodeDevoteeToken(payload);
    setGeneratedToken(token);

    if (rhythmResult.days.length > 0) {
      const origin = getSafeProductionOrigin();
      const sanctumUrl = `${origin}/daily?token=${token}&date=${new Date().toISOString().slice(0, 10)}`;
      
      const qrPayload = qrTarget === "sanctum"
        ? sanctumUrl
        : generateQrPayloadByTarget(qrTarget, {
            days: rhythmResult.days,
            lang,
            panditName,
            notificationTime,
            personName,
            platform,
            pincode,
            lat,
            lng,
            locationName,
            dob: effectiveDob || undefined,
            tob: effectiveTob || undefined
          });

      QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "L",
        margin: 2,
        width: 280,
        color: { dark: "#78350F", light: "#FFFFFF" }
      }).then((url) => {
        if (isMounted && typeof window !== "undefined") setQrDataUrl(url);
      }).catch(console.warn);
    }

    return () => {
      isMounted = false;
    };
  }, [personName, selectedNakshatra, selectedRashi, gotra, panditName, sevaDate, dob, tob, isUnknownBirth, lang, notificationTime, pincode, lat, lng, locationName, priestPhone, overridePriestContact, shraddhaTithi, rhythmResult, qrTarget, platform]);

  const chosenPooja = useMemo(() => {
    if (customPoojaMode && customPoojaName.trim()) {
      const clean = customPoojaName.trim();
      return {
        id: "custom",
        name: {
          kn: transliterateName(clean, "kn"),
          hi: transliterateName(clean, "hi"),
          te: transliterateName(clean, "te"),
          ta: transliterateName(clean, "ta"),
          en: transliterateName(clean, "en")
        }
      };
    }
    return SEVA_CATALOG[sevaId as SevaId] || SEVA_CATALOG["rudrabhisheka"];
  }, [customPoojaMode, customPoojaName, sevaId]);

  const chosenPoojaName = useMemo(() => {
    if (customPoojaMode && customPoojaName.trim()) {
      return transliterateName(customPoojaName.trim(), lang);
    }
    if (chosenPooja) {
      return formatPoojaName(chosenPooja, lang);
    }
    return "ವಿಶೇಷ ಪೂಜಾ ಸಂಕಲ್ಪ";
  }, [chosenPooja, customPoojaMode, customPoojaName, lang]);

  // Identity object passed to 5-page PDF templates
  const identity = useMemo(() => ({
    personName: personName.trim() || "ಭಕ್ತರು",
    gotra: gotra.trim() || "ಕಾಶ್ಯಪ",
    rashiIndex: selectedRashi,
    nakshatraIndex: selectedNakshatra,
    placeLabel: locationName,
    dob: isUnknownBirth ? undefined : dob,
    tob: isUnknownBirth ? undefined : (tob || undefined)
  }), [personName, gotra, selectedRashi, selectedNakshatra, locationName, dob, tob, isUnknownBirth]);

  // 1. Download 5-Page Ashirvada Patra PDF
  const handleDownload5PagePdf = async () => {
    setBusy("5page-pdf");
    try {
      const pName = (panditName || "Sri_Pandit").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
      const dName = (personName.trim() || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
      const dateStr = sevaDate || new Date().toISOString().slice(0, 10);
      const fileName = `${pName}_${dName}_${dateStr}.pdf`;
      await generatePDFFromElement("quick-seva-5page-pdf", fileName);
      setIsSuccessGenerated(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  // 2. Download 90-Day Calendar (.ics)
  const handleDownloadIcs = () => {
    if (!rhythmResult?.days?.length) return;
    const icsStr = generateSevaICalendarString({
      days: rhythmResult.days,
      lang,
      panditName,
      priestName: panditName,
      priestPhone,
      overrideCalendarPhone: overridePriestContact,
      notificationTime,
      personName,
      pincode,
      lat,
      lng,
      locationName,
      birthNakshatraIndex: selectedNakshatra,
      birthRashiIndex: selectedRashi,
      dob,
      tob: tob || undefined
    });

    const blob = new Blob([icsStr], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${personName.replace(/\s+/g, "_")}_90Day_Baggona_Calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsSuccessGenerated(true);
  };

  // 3. Open Sanctum Live Darshana URL
  const handleOpenSanctum = () => {
    const origin = getSafeProductionOrigin();
    const url = `${origin}/daily?token=${generatedToken}&date=${new Date().toISOString().slice(0, 10)}`;
    window.open(url, "_blank");
  };

  // 4. WhatsApp Share
  const handleShareWhatsApp = () => {
    const origin = getSafeProductionOrigin();
    const url = `${origin}/daily?token=${generatedToken}&date=${new Date().toISOString().slice(0, 10)}`;
    const msg = `॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಅನುಗ್ರಹ ಪ್ರಸಾದಿತ ॥\n\nನಮಸ್ಕಾರ ${personName}, ನಿಮ್ಮ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ನಿತ್ಯ ದರ್ಶನ ಸಿದ್ಧವಾಗಿದೆ.\n\nನಿಮ್ಮ ದೈನಂದಿನ ದರ್ಶನ ಸಾಧನಾ ಸ್ಟ್ರೀಕ್ (🔥) ಹಾಗೂ ಇಂದಿನ ಅಭಿಜಿತ್ ಮುಹೂರ್ತ ತಿಳಿಯಲು ಇಲ್ಲಿ ಭೇಟಿ ನೀಡಿ:\n${url}\n\nಪ್ರಧಾನ ಅರ್ಚಕರು: ${panditName} (${priestPhone})`;
    const waUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone.replace(/\D/g, "")}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-amber-100 py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-5 shadow-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            ॥ ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಪ್ರಸನ್ನ ॥
          </span>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-amber-200">
            ಜನ್ಮ ದಿನಾಂಕ ಆಧಾರಿತ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ & ೫ ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-amber-300/80 max-w-2xl mx-auto">
            ಜನ್ಮ ಸಮಯ (Time of Birth) ಇಲ್ಲದಿದ್ದರೂ ಚಂದ್ರ ಕುಂಡಲಿ ಹಾಗೂ ಗೋಚಾರದ ಆಧಾರದ ಮೇಲೆ ೧೦೦% ನಿಖರ ೯೦-ದಿನಗಳ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ೫ ಪುಟಗಳ ಅಧಿಕೃತ ಆಶೀರ್ವಾದ ಪತ್ರವನ್ನು ತಕ್ಷಣವೇ ಪಡೆಯಿರಿ.
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/70 border border-emerald-500/50 px-3 py-1 text-xs text-emerald-300 font-medium">
              ✓ ಜನ್ಮ ಸಮಯ ಐಚ್ಛಿಕ (Optional)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/60 border border-amber-500/50 px-3 py-1 text-xs text-amber-200 font-medium">
              ✓ ೫ ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ PDF
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/60 border border-amber-500/50 px-3 py-1 text-xs text-amber-200 font-medium">
              ✓ ೯೦ ದಿನಗಳ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ (.ics)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/60 border border-amber-500/50 px-3 py-1 text-xs text-amber-200 font-medium">
              ✓ ಪಿತೃ ರಕ್ಷಾ ಕವಚ & ಶ್ರಾದ್ಧ ತಿಥಿ ಅಲರ್ಟ್
            </span>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-amber-300 border-b border-amber-500/20 pb-2 flex items-center gap-2">
            <span>👤</span>
            <span>ಭಕ್ತರ ವಿವರಗಳು (Devotee Details)</span>
          </h2>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name with Voice Dictation */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  ಭಕ್ತರ ಹೆಸರು (Devotee Name) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="ಉದಾ: ವಿಶ್ವನಾಥ ಭಟ್"
                    className="w-full rounded-xl border border-amber-400/40 bg-slate-950 pl-3 pr-10 py-2 text-sm text-amber-100 placeholder-amber-700 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    title="ಧ್ವನಿ ಮೂಲಕ ಹೆಸರು ಹೇಳಿ (Speak Name)"
                    onClick={() => startVoiceInput("devoteeName", (val) => setPersonName(val))}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-sm transition ${
                      listeningField === "devoteeName" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                    }`}
                  >
                    🎤
                  </button>
                </div>
                {personName.trim() && devoteeTransliterations && (
                  <div className="mt-1.5 rounded-lg bg-amber-950/40 border border-amber-500/20 p-2 text-[11px] text-amber-200/90 space-y-0.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">🌐 ೫ ಭಾಷಾ ರೂಪಗಳು (5-Language Preview):</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span><strong className="text-amber-400">KN:</strong> {devoteeTransliterations.kn}</span>
                      <span><strong className="text-amber-400">HI:</strong> {devoteeTransliterations.hi}</span>
                      <span><strong className="text-amber-400">TE:</strong> {devoteeTransliterations.te}</span>
                      <span><strong className="text-amber-400">TA:</strong> {devoteeTransliterations.ta}</span>
                      <span><strong className="text-amber-400">EN:</strong> {devoteeTransliterations.en}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gotra with Voice Dictation */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  ಗೋತ್ರ (Gotra)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    placeholder="ಉದಾ: ಕಾಶ್ಯಪ"
                    className="w-full rounded-xl border border-amber-400/40 bg-slate-950 pl-3 pr-10 py-2 text-sm text-amber-100 placeholder-amber-700 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    title="ಧ್ವನಿ ಮೂಲಕ ಗೋತ್ರ ಹೇಳಿ (Speak Gotra)"
                    onClick={() => startVoiceInput("gotra", (val) => setGotra(val))}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-sm transition ${
                      listeningField === "gotra" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                    }`}
                  >
                    🎤
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {POPULAR_GOTRAS.slice(0, 5).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGotra(g)}
                      className="rounded bg-amber-950/60 border border-amber-700/50 px-1.5 py-0.5 text-[10px] text-amber-300 hover:bg-amber-900"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Birth Details Header with Unknown DOB/TOB Toggle */}
            <div className="flex items-center justify-between border-t border-amber-500/20 pt-3">
              <span className="text-xs font-bold text-amber-300">
                📅 ಜನನ ವಿವರಗಳು (Birth Details)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-amber-300/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnknownBirth}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsUnknownBirth(checked);
                    if (checked) {
                      setDob("");
                      setTob("");
                      setUseManualStar(true);
                    }
                  }}
                  className="rounded border-amber-500 text-amber-600"
                />
                <span className="font-semibold text-amber-200">
                  ಜನ್ಮ ದಿನಾಂಕ/ಸಮಯ ತಿಳಿದಿಲ್ಲ (Unknown DOB/TOB)
                </span>
              </label>
            </div>

            {isUnknownBirth ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <span>✨</span>
                  <span>ರಾಶಿ & ನಕ್ಷತ್ರ ಆಧಾರಿತ ಕುಂಡಲಿ ಮತ್ತು ದಿನ ಫಲ (Moon Sign/Star Based)</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-200/80">
                  ಜನ್ಮ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ತಿಳಿದಿಲ್ಲದಿದ್ದರೂ ಭಕ್ತರ ಜನ್ಮ ನಕ್ಷತ್ರ ಅಥವಾ ರಾಶಿಯನ್ನು ಕೆಳಗೆ ನೇರವಾಗಿ ಆಯ್ಕೆಮಾಡಬಹುದು. ಬಗ್ಗೋಣ ಗಣಿತ ಎಂಜಿನ್ ಅಧಿಕೃತ ಗೋಚಾರ ಮತ್ತು ಚಂದ್ರ ಕುಂಡಲಿಯನ್ನು ನಿಖರವಾಗಿ ನಿರ್ಮಿಸುತ್ತದೆ.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    📅 ಜನ್ಮ ದಿನಾಂಕ (Date of Birth) *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Time of Birth - OPTIONAL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-amber-300">
                      ⏰ ಜನ್ಮ ಸಮಯ (Time of Birth)
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                      ಐಚ್ಛಿಕ / Optional
                    </span>
                  </div>
                  <input
                    type="time"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    placeholder="ಸಮಯ ಗೊತ್ತಿಲ್ಲದಿದ್ದರೆ ಖಾಲಿ ಬಿಡಿ"
                    className="w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-amber-400/70">
                    {tob ? "✓ ನಿಖರ ಜನನ ಲಗ್ನ ಹಾಗೂ ಕುಂಡಲಿ ಲೆಕ್ಕಾಚಾರವಾಗುತ್ತದೆ." : "ಸಮಯವಿಲ್ಲದಿದ್ದರೂ ಚಂದ್ರ ಕುಂಡಲಿ ಆಧಾರದ ಮೇಲೆ ೧೦೦% ನಿಖರ ಫಲ ಲಭ್ಯ."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Rashi & Nakshatra */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                ⭐ ಜನ್ಮ ರಾಶಿ ಹಾಗೂ ನಕ್ಷತ್ರ (Rashi & Nakshatra)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-amber-300/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useManualStar}
                  onChange={(e) => setUseManualStar(e.target.checked)}
                  className="rounded border-amber-500 text-amber-600"
                />
                <span>ಸ್ವತಃ ನಕ್ಷತ್ರ ಆಯ್ಕೆಮಾಡಿ (Manual Override)</span>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="block text-[11px] text-amber-400/80 mb-1">ಚಂದ್ರ ರಾಶಿ (Moon Sign):</span>
                <select
                  value={selectedRashi}
                  disabled={!useManualStar}
                  onChange={(e) => setSelectedRashi(Number(e.target.value))}
                  className="w-full rounded-lg border border-amber-500/40 bg-slate-950 px-3 py-2 text-sm text-amber-100 disabled:opacity-60"
                >
                  {RASHI_NAMES.map((r: string, i: number) => (
                    <option key={i} value={i}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] text-amber-400/80 mb-1">ಜನ್ಮ ನಕ್ಷತ್ರ (Birth Star):</span>
                <select
                  value={selectedNakshatra}
                  disabled={!useManualStar}
                  onChange={(e) => setSelectedNakshatra(Number(e.target.value))}
                  className="w-full rounded-lg border border-amber-500/40 bg-slate-950 px-3 py-2 text-sm text-amber-100 disabled:opacity-60"
                >
                  {NAKSHATRA_NAMES.map((n: string, i: number) => (
                    <option key={i} value={i}>{i + 1}. {n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pooja / Seva Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                🪔 ಸಲ್ಲಿಸಿದ ಸೇವೆ / ಪೂಜೆ (Seva Performed)
              </label>
              <select
                value={customPoojaMode ? "CUSTOM" : sevaId}
                onChange={(e) => {
                  if (e.target.value === "CUSTOM") {
                    setCustomPoojaMode(true);
                  } else {
                    setCustomPoojaMode(false);
                    setSevaId(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100"
              >
                {Object.values(SEVA_CATALOG).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {(s.name as any)[lang] || s.name.kn || s.name.en}
                  </option>
                ))}
                <option value="CUSTOM">➕ ಇತರ ವಿಶೇಷ ಪೂಜೆ (Custom Pooja)...</option>
              </select>
              {customPoojaMode && (
                <input
                  type="text"
                  value={customPoojaName}
                  onChange={(e) => setCustomPoojaName(e.target.value)}
                  placeholder="ಪೂಜೆಯ ಹೆಸರು ಬರೆಯಿರಿ..."
                  className="mt-2 w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100"
                />
              )}
              {/* 1-Tap Quick Seva Selector Pills */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSevaId("narayanabali");
                    setCustomPoojaMode(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                    sevaId === "narayanabali" && !customPoojaMode
                      ? "bg-amber-500 text-slate-950 border-amber-300 font-bold shadow"
                      : "bg-slate-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-950/40"
                  }`}
                >
                  🕉️ ನಾರಾಯಣ ಬಲಿ (Narayana Bali)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSevaId("narayanabali_tripindi");
                    setCustomPoojaMode(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                    sevaId === "narayanabali_tripindi" && !customPoojaMode
                      ? "bg-amber-500 text-slate-950 border-amber-300 font-bold shadow"
                      : "bg-slate-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-950/40"
                  }`}
                >
                  🌾 ತ್ರಿಪಿಂಡಿ & ನಾರಾಯಣ ಬಲಿ (Tripindi)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSevaId("rudrabhisheka");
                    setCustomPoojaMode(false);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                    sevaId === "rudrabhisheka" && !customPoojaMode
                      ? "bg-amber-500 text-slate-950 border-amber-300 font-bold shadow"
                      : "bg-slate-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-950/40"
                  }`}
                >
                  🪔 ರುದ್ರಾಭಿಷೇಕ (Rudrabhisheka)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                📅 ಸೇವಾ ದಿನಾಂಕ (Seva Date)
              </label>
              <input
                type="date"
                value={sevaDate}
                onChange={(e) => setSevaDate(e.target.value)}
                className="w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100"
              />
            </div>
          </div>

          {/* Location & Pincode */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                📍 ಸ್ಥಳದ ಪಿನ್‌ಕೋಡ್ (Pincode)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="581326"
                  className="w-full rounded-xl border border-amber-400/40 bg-slate-950 px-3 py-2 text-sm text-amber-100 font-semibold"
                />
                <span className="shrink-0 rounded-xl bg-amber-900/60 border border-amber-600/40 px-3 py-2 text-xs font-bold text-amber-200 flex items-center">
                  {isResolvingPin ? "ಶೋಧಿಸಲಾಗುತ್ತಿದೆ..." : locationName}
                </span>
              </div>
            </div>

            {/* Parents' Shraddha Tithi (Optional) with Voice Dictation */}
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1">
                🙏 ಪೋಷಕರ ವಾರ್ಷಿಕ ಶ್ರಾದ್ಧ ತಿಥಿ (Shraddha Tithi - ಐಚ್ಛಿಕ)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={shraddhaTithi}
                  onChange={(e) => setShraddhaTithi(e.target.value)}
                  placeholder="ಉದಾ: ಭಾದ್ರಪದ ಕೃಷ್ಣ ಅಷ್ಟಮೀ"
                  className="w-full rounded-xl border border-amber-400/40 bg-slate-950 pl-3 pr-10 py-2 text-sm text-amber-100 placeholder-amber-700"
                />
                <button
                  type="button"
                  title="ಧ್ವನಿ ಮೂಲಕ ತಿಥಿ ಹೇಳಿ (Speak Tithi)"
                  onClick={() => startVoiceInput("shraddhaTithi", (val) => setShraddhaTithi(val))}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-sm transition ${
                    listeningField === "shraddhaTithi" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                  }`}
                >
                  🎤
                </button>
              </div>
              <span className="text-[11px] text-amber-400/70">
                ದಾಖಲಿಸಿದರೆ ಪ್ರತಿ ವರ್ಷ ತಿಥಿಗೆ ೩ ದಿನ ಮುಂಚಿತವಾಗಿ ಕ್ಯಾಲೆಂಡರ್ ಅಲರ್ಟ್ ನೀಡಲಾಗುತ್ತದೆ.
              </span>
            </div>
          </div>

          {/* Priest Custom Override Section */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                🛕 ಅರ್ಚಕರ ವಿವರಗಳು & ವಾಟ್ಸಾಪ್ ಕಾಂಟ್ಯಾಕ್ಟ್ ಓವರ್‌ರೈಡ್
              </span>
              <label className="flex items-center gap-1.5 text-xs text-amber-300/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overridePriestContact}
                  onChange={(e) => setOverridePriestContact(e.target.checked)}
                  className="rounded border-amber-500 text-amber-600"
                />
                <span>ಕಸ್ಟಮ್ ಅರ್ಚಕರ ವಿವರಗಳು (Override Priest)</span>
              </label>
            </div>

            {!overridePriestContact ? (
              <div className="flex items-center justify-between rounded-lg bg-slate-950/60 p-3 border border-amber-500/20 text-xs">
                <div>
                  <div className="font-bold text-amber-200">
                    {activePriest.sealSymbol} {panditName}
                  </div>
                  <div className="text-amber-400/70">
                    ಪ್ರಧಾನ ಅರ್ಚಕರು - ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ | ಕರೆ: {priestPhone}
                  </div>
                </div>
                <span className="bg-amber-800/60 text-amber-200 px-2 py-1 rounded text-[11px] font-bold">
                  ಡಿಫಾಲ್ಟ್ ಅರ್ಚಕರು
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <span className="block text-[11px] text-amber-300 mb-1">ಅರ್ಚಕರ ಹೆಸರು:</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={customPriestName}
                        onChange={(e) => setCustomPriestName(e.target.value)}
                        className="w-full rounded-lg border border-amber-500/40 bg-slate-950 pl-2.5 pr-8 py-1.5 text-xs text-amber-100"
                      />
                      <button
                        type="button"
                        title="ಅರ್ಚಕರ ಹೆಸರು ಹೇಳಿ (Speak Priest Name)"
                        onClick={() => startVoiceInput("priestName", (val) => setCustomPriestName(val))}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-xs transition ${
                          listeningField === "priestName" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                        }`}
                      >
                        🎤
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] text-amber-300 mb-1">ನೇರ ಕರೆ ಸಂಖ್ಯೆ:</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={customPriestPhone}
                        onChange={(e) => setCustomPriestPhone(e.target.value)}
                        className="w-full rounded-lg border border-amber-500/40 bg-slate-950 pl-2.5 pr-8 py-1.5 text-xs text-amber-100"
                      />
                      <button
                        type="button"
                        title="ಕರೆ ಸಂಖ್ಯೆ ಹೇಳಿ (Speak Phone)"
                        onClick={() => startVoiceInput("priestPhone", (val) => setCustomPriestPhone(val.replace(/\D/g, "")))}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-xs transition ${
                          listeningField === "priestPhone" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                        }`}
                      >
                        🎤
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[11px] text-amber-300 mb-1">ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ:</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={customWhatsappNumber}
                        onChange={(e) => setCustomWhatsappNumber(e.target.value)}
                        className="w-full rounded-lg border border-amber-500/40 bg-slate-950 pl-2.5 pr-8 py-1.5 text-xs text-amber-100"
                      />
                      <button
                        type="button"
                        title="ವಾಟ್ಸಾಪ್ ಸಂಖ್ಯೆ ಹೇಳಿ (Speak WhatsApp)"
                        onClick={() => startVoiceInput("priestWhatsApp", (val) => setCustomWhatsappNumber(val.replace(/\D/g, "")))}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-xs transition ${
                          listeningField === "priestWhatsApp" ? "bg-red-500 text-white animate-pulse" : "text-amber-400 hover:text-amber-200"
                        }`}
                      >
                        🎤
                      </button>
                    </div>
                  </div>
                </div>
                {customPriestName.trim() && priestTransliterations && (
                  <div className="rounded bg-slate-950/60 p-1.5 border border-amber-500/20 text-[10px] text-amber-300/80 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span><strong>KN:</strong> {priestTransliterations.kn}</span>
                    <span><strong>HI:</strong> {priestTransliterations.hi}</span>
                    <span><strong>TE:</strong> {priestTransliterations.te}</span>
                    <span><strong>TA:</strong> {priestTransliterations.ta}</span>
                    <span><strong>EN:</strong> {priestTransliterations.en}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons Hub */}
          <div className="pt-2 border-t border-amber-500/30 space-y-3">
            {/* Language Selector for PDF & Calendar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <span>🌐</span>
                <span>ಭಾಷೆ / Language (PDF & Calendar):</span>
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[
                  { code: "kn", label: "ಕನ್ನಡ" },
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिन्दी" },
                  { code: "te", label: "తెలుగు" },
                  { code: "ta", label: "தமிழ்" }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLang(item.code as SevaLang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      lang === item.code
                        ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105"
                        : "bg-slate-900/80 text-amber-200 border-amber-500/30 hover:border-amber-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 text-center">
              ಸಿದ್ಧಪಡಿಸಿದ ಆಶೀರ್ವಾದ ದಾಖಲೆಗಳು & ಕ್ಯಾಲೆಂಡರ್ ಡೌನ್‌ಲೋಡ್
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* 1. Download 5-Page PDF */}
              <button
                type="button"
                disabled={busy !== null}
                onClick={handleDownload5PagePdf}
                className="w-full rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-3.5 text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>📜</span>
                <span>{busy === "5page-pdf" ? "PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "೫ ಪುಟಗಳ ಆಶೀರ್ವಾದ ಪತ್ರ PDF ಪಡೆಯಿರಿ"}</span>
              </button>

              {/* 2. Download 90-Day Calendar */}
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="w-full rounded-xl border-2 border-amber-500 bg-slate-950 p-3.5 text-amber-200 font-bold text-sm hover:bg-amber-950/40 transition flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>೯೦ ದಿನಗಳ ಮೊಬೈಲ್ ಕ್ಯಾಲೆಂಡರ್ (.ics) ಡೌನ್‌ಲೋಡ್</span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-1">
              {/* 3. Google Calendar Sync */}
              <button
                type="button"
                onClick={() => {
                  if (!rhythmResult?.days?.[0]) return;
                  const gUrl = generateGoogleCalendarUrl({
                    day: rhythmResult.days[0],
                    lang,
                    panditName,
                    notificationTime
                  });
                  window.open(gUrl, "_blank");
                }}
                className="rounded-xl border border-amber-600/40 bg-slate-900 px-3 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-950/60 transition flex items-center justify-center gap-1.5"
              >
                <span>📅</span>
                <span>ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್</span>
              </button>

              {/* 4. Open Live Sanctum URL */}
              <button
                type="button"
                onClick={handleOpenSanctum}
                className="rounded-xl border border-amber-600/40 bg-slate-900 px-3 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-950/60 transition flex items-center justify-center gap-1.5"
              >
                <span>🔥</span>
                <span>ನಿತ್ಯ ದರ್ಶನ ಲಿಂಕ್ ತೆರೆಯಿರಿ (Live URL)</span>
              </button>

              {/* 5. Share on WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-3 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition flex items-center justify-center gap-1.5"
              >
                <span>📲</span>
                <span>ವಾಟ್ಸಾಪ್ ಶೇರ್ ಮಾಡಿ</span>
              </button>
            </div>

            {isSuccessGenerated && (
              <div className="rounded-xl border border-emerald-500 bg-emerald-950/80 p-3 text-center text-xs text-emerald-200 font-semibold">
                ✓ ಆಶೀರ್ವಾದ ಪತ್ರ ಹಾಗೂ ಕ್ಯಾಲೆಂಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಸಿದ್ಧಗೊಂಡಿದೆ! ಭಕ್ತರು ತಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಇಂದೇ ಸಿಂಕ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
              </div>
            )}
          </div>
        </div>

        {/* QR Code Preview Card */}
        {qrDataUrl && (
          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                ಮೊಬೈಲ್ ಸ್ಕ್ಯಾನಿಂಗ್ QR ಕೋಡ್ (Mobile Scan Ready)
              </span>
              <h3 className="font-serif text-lg font-bold text-amber-200">
                ಭಕ್ತರ ಮೊಬೈಲ್‌ನಿಂದ ನೇರ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಸಿಂಕ್ ಮಾಡಿಕೊಳ್ಳಿ
              </h3>
              <p className="text-xs text-amber-300/70 max-w-md">
                ಈ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿದರೆ ೯೦ ದಿನಗಳ ಪಂಚಾಂಗ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ಲೈವ್ ನಿತ್ಯ ದರ್ಶನ ಲಿಂಕ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ.
              </p>
            </div>
            <div className="p-2 bg-white rounded-2xl border-2 border-amber-500 shadow-md shrink-0">
              <img src={qrDataUrl} alt="Quick Seva QR Code" className="w-36 h-36 object-contain" />
            </div>
          </div>
        )}

      </div>

      {/* Hidden Container for 5-Page PDF Generation (Strict vertical stack as mandated by baggona-seva-prasada-guard) */}
      <div id="quick-seva-5page-pdf" style={hiddenHost} aria-hidden>
        <SevaLetterPrint
          lang={lang}
          identity={identity}
          primarySeva={{ seva: chosenPooja, score: 0, reasons: [] } as any}
          sevaDate={sevaDate}
          rhythm={rhythmResult}
          panditName={panditName}
          qrDataUrl={qrDataUrl}
        />
        <SevaQRCodePrint
          lang={lang}
          identity={identity}
          qrDataUrl={qrDataUrl}
          target={qrTarget}
        />
        <SevaAnugrahaGuidancePrint
          lang={lang}
          identity={identity}
          panditName={panditName}
          rhythm={rhythmResult}
        />
        <SevaRemediesAnnualPrint
          lang={lang}
          identity={identity}
          panditName={panditName}
          rhythm={rhythmResult}
        />
        <SevaPoojaMahatmePrint
          lang={lang}
          identity={identity}
          panditName={panditName}
          primarySeva={{ seva: chosenPooja, score: 0, reasons: [] } as any}
        />
      </div>
    </div>
  );
}
