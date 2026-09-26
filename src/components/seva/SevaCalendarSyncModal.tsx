import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { RhythmDay } from "../../core/DailyRhythmEngine";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateQrPayloadByTarget,
  generateSevaICalendarString,
  getSafeProductionOrigin,
  validate90DayCalendarPayload,
  type QrCalendarTarget
} from "../../features/seva/icsCalendarGenerator";
import { generatePriestICalendarString } from "../../core/PriestCalendarEngine";
import { encodeDevoteeToken } from "../../utils/tokenCipher";
import { registerCalendarAtGeneration } from "../../features/seva/calendarVisitService";
import { getUniversalBirthDetails } from "../../utils/universalDevoteeKundli";
import { parseSpokenPhoneNumber } from "../../utils/speechRecognitionHelper";
import { T, pick } from "../../features/seva/sevaLocale";
import {
  getAllPriests,
  addCustomPriest,
  getPriestProfile,
  type PriestProfile
} from "../../features/seva/sevaPriestDirectory";
import { resolvePlaceFromPincode, getCoordinates } from "../../services/locationApi";
import { fetch90DayAiPanchanga, type DayPanchangaAiItem } from "../../features/seva/panchanga90DayAiEngine";
import { get90DaySpecialVratas, type SpecialVrataInfo } from "../../features/seva/specialVrataAlertEngine";
import { useAuthStore } from "../../features/auth/authStore";
import { recordPriestCalendarAction } from "../../features/seva/calendarVisitService";
import { getAllVoiceProfiles, type PriestVoiceProfile } from "../../features/audio/priestVoiceDatabase";
import { PriestVoiceUploadModal } from "../darshana/PriestVoiceUploadModal";
import { getLocalizedPanditName } from "../../features/seva/sevaPresentation";

type Props = {
  days: RhythmDay[];
  personName: string;
  dob?: string;
  tob?: string;
  nakshatraIndex?: number;
  rashiIndex?: number;
  lang: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function SevaCalendarSyncModal({
  days,
  personName,
  dob,
  tob,
  nakshatraIndex,
  rashiIndex,
  lang,
  isOpen,
  onClose
}: Props): JSX.Element | null {
  const currentUser = useAuthStore((state) => state.currentUser);
  const role = useAuthStore((state) => state.role);
  const isSuperAdmin = role === "superadmin" || currentUser === "$hriSuma" || currentUser === "superadmin";

  const [calendarMode, setCalendarMode] = useState<"devotee" | "priest">("devotee");
  const [includePriestCalendar, setIncludePriestCalendar] = useState<boolean>(false);
  const [calendarSpanDays, setCalendarSpanDays] = useState<number>(90);
  const [target, setTarget] = useState<QrCalendarTarget>("google");
  const [platform, setPlatform] = useState<"android" | "apple">("android");
  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");
  const [customInputMode, setCustomInputMode] = useState<boolean>(false);
  const [newPriestName, setNewPriestName] = useState<string>("");
  const [priestVoiceListening, setPriestVoiceListening] = useState<boolean>(false);

  const [voiceProfiles, setVoiceProfiles] = useState<PriestVoiceProfile[]>(() => getAllVoiceProfiles());
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("voice_sriram_pandit");
  const [isVoiceUploadModalOpen, setIsVoiceUploadModalOpen] = useState<boolean>(false);

  const defaultPriest = useMemo(() => getPriestProfile("shreeram-pandit"), []);
  const activePriest = useMemo(() => getPriestProfile(selectedPriestId), [selectedPriestId, priestsList]);
  const [overridePriestContact, setOverridePriestContact] = useState<boolean>(false);
  const [customPriestName, setCustomPriestName] = useState<string>("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
  const [customPriestPhone, setCustomPriestPhone] = useState<string>("9972339362");
  const [listeningPriestField, setListeningPriestField] = useState<string | null>(null);

  useEffect(() => {
    const locName = activePriest.name[lang as keyof typeof activePriest.name] || activePriest.name.en || activePriest.name.kn;
    setCustomPriestName(locName);
    const ph = activePriest.phone || "9972339362";
    setCustomPriestPhone(ph);
  }, [activePriest, lang]);

  const panditName = useMemo(() => {
    if (overridePriestContact && customPriestName.trim()) {
      return getLocalizedPanditName(customPriestName.trim(), lang);
    }
    return activePriest.name[lang as keyof typeof activePriest.name] || activePriest.name.en || getLocalizedPanditName(activePriest.name.kn, lang);
  }, [overridePriestContact, customPriestName, activePriest, lang]);

  const effectivePriestPhone = useMemo(() => {
    if (overridePriestContact && customPriestPhone.trim()) {
      return customPriestPhone.trim();
    }
    return activePriest.phone || "9972339362";
  }, [overridePriestContact, customPriestPhone, activePriest]);

  const handleSelectPriest = (priestId: string) => {
    if (priestId === "ADD_NEW") {
      setCustomInputMode(true);
      return;
    }
    setSelectedPriestId(priestId);
    const p = getPriestProfile(priestId);
    const locName = p.name[lang as keyof typeof p.name] || p.name.en || p.name.kn;
    setCustomPriestName(locName);
    const ph = p.phone || "9972339362";
    setCustomPriestPhone(ph);
  };

  const startPriestVoiceInput = (fieldKey: "name" | "phone", onResult: (val: string) => void) => {
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
      setListeningPriestField(fieldKey);
      rec.onresult = (evt: any) => {
        const transcript = evt.results[0]?.[0]?.transcript;
        if (transcript) onResult(transcript.trim());
        setListeningPriestField(null);
      };
      rec.onerror = () => setListeningPriestField(null);
      rec.onend = () => setListeningPriestField(null);
      rec.start();
    } catch (e) {
      console.warn("SpeechRec error:", e);
      setListeningPriestField(null);
    }
  };

  const [pincodeInput, setPincodeInput] = useState<string>("581326");
  const [locationName, setLocationName] = useState<string>("Gokarna");
  const [lat, setLat] = useState<number>(14.54);
  const [lng, setLng] = useState<number>(74.31);
  const [isResolvingPin, setIsResolvingPin] = useState<boolean>(false);
  const [pinMessage, setPinMessage] = useState<string>("");
  const [aiPanchangaMap, setAiPanchangaMap] = useState<Record<string, DayPanchangaAiItem>>({});
  const [isAiSyncing, setIsAiSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const startDateStr = days && days.length > 0 ? days[0].ymd : new Date().toISOString().slice(0, 10);
    setIsAiSyncing(true);
    fetch90DayAiPanchanga(pincodeInput, locationName, startDateStr, lang, lat, lng)
      .then((map) => {
        setAiPanchangaMap(map);
        setIsAiSyncing(false);
      })
      .catch((err) => {
        console.warn("AI 90-day sync error:", err);
        setIsAiSyncing(false);
      });
  }, [isOpen, pincodeInput, locationName, lang, lat, lng, days]);

  const specialVratas = useMemo(() => {
    const startDateStr = days && days.length > 0 ? days[0].ymd : new Date().toISOString().slice(0, 10);
    return get90DaySpecialVratas(startDateStr, lang);
  }, [days, lang]);

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

  const origin = getSafeProductionOrigin();

  const devoteeToken = useMemo(() => {
    const selectedDay = days && days.length > 0 ? days[0] : null;
    let sessionDob: string | undefined = undefined;
    let sessionTob: string | undefined = undefined;
    try {
      const rawSession = typeof window !== "undefined" ? localStorage.getItem("baggona_kundli_session") : null;
      if (rawSession) {
        const parsedSession = JSON.parse(rawSession);
        if (parsedSession?.birthDate && parsedSession?.birthTime) {
          sessionDob = parsedSession.birthDate;
          sessionTob = parsedSession.birthTime;
        }
      }
    } catch {
      // Ignore
    }
    const birthDetails = getUniversalBirthDetails({
      dob: sessionDob,
      tob: sessionTob,
      name: personName,
      nakshatraIndex: selectedDay?.moonNakshatraIndex,
      rashiIndex: selectedDay?.moonRashiIndex
    });
    return encodeDevoteeToken({
      n: personName || (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee"),
      nk: selectedDay?.moonNakshatraIndex,
      r: selectedDay?.moonRashiIndex,
      p: panditName,
      d: selectedDay?.ymd || new Date().toISOString().slice(0, 10),
      dy: calendarSpanDays,
      l: lang,
      tm: notificationTime,
      pl: platform,
      t: target,
      pc: pincodeInput,
      lt: lat,
      lg: lng,
      loc: locationName,
      dob: birthDetails.dob,
      tob: birthDetails.tob,
      voiceId: selectedVoiceId,
      ph: effectivePriestPhone,
      pp: overridePriestContact && effectivePriestPhone ? effectivePriestPhone : undefined,
      ocp: overridePriestContact ? 1 : undefined
    });
  }, [days, personName, lang, panditName, platform, target, notificationTime, pincodeInput, lat, lng, locationName, calendarSpanDays, selectedVoiceId, effectivePriestPhone, overridePriestContact]);

  const contactOverrideQuery = overridePriestContact && effectivePriestPhone ? `&overrideContact=true&priestPhone=${encodeURIComponent(effectivePriestPhone)}` : "";
  const webSanctumUrl = `${origin}/daily?token=${devoteeToken}&lang=${lang}&priestName=${encodeURIComponent(panditName)}${contactOverrideQuery}`;

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

  const activeDob = useMemo(() => {
    if (dob) return dob;
    try {
      const stored = localStorage.getItem("baggona_kundli_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.birthDate || parsed.birthDateYmd;
      }
    } catch (e) {}
    return undefined;
  }, [dob]);

  const activeTob = useMemo(() => {
    if (tob) return tob;
    try {
      const stored = localStorage.getItem("baggona_kundli_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.birthTime || parsed.birthTimeHm;
      }
    } catch (e) {}
    return undefined;
  }, [tob]);

  const activeNak = useMemo(() => {
    if (nakshatraIndex !== undefined) return nakshatraIndex;
    try {
      const stored = localStorage.getItem("baggona_kundli_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.nakshatraIndex !== undefined) return Number(parsed.nakshatraIndex);
      }
    } catch (e) {}
    return undefined;
  }, [nakshatraIndex]);

  const activeRashi = useMemo(() => {
    if (rashiIndex !== undefined) return rashiIndex;
    try {
      const stored = localStorage.getItem("baggona_kundli_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.rashiIndex !== undefined) return Number(parsed.rashiIndex);
      }
    } catch (e) {}
    return undefined;
  }, [rashiIndex]);

  // Generate QR Code dynamically whenever target or options change
  useEffect(() => {
    if (!isOpen) return;

    try {
      const payload = calendarMode === "priest"
        ? `${origin}/priest-panchanga?date=${days[0]?.ymd || "2026-03-19"}&pincode=${pincodeInput}`
        : generateQrPayloadByTarget(target, {
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
            locationName,
            dob: activeDob,
            tob: activeTob,
            birthNakshatraIndex: activeNak,
            birthRashiIndex: activeRashi,
            includePriestCalendar: includePriestCalendar || (calendarMode as string) === "priest",
            daysCount: calendarSpanDays,
            priestPhone: effectivePriestPhone,
            overrideCalendarPhone: overridePriestContact
          });

      if (devoteeToken) {
        void registerCalendarAtGeneration({
          userName: personName || (lang.startsWith("kn") ? "ಭಕ್ತರು" : "Devotee"),
          token: devoteeToken,
          startDate: days && days.length > 0 ? days[0].ymd : new Date().toISOString().slice(0, 10),
          durationDays: calendarSpanDays,
          priestName: panditName,
          priestPhone: effectivePriestPhone,
          nakshatraIndex: activeNak,
          rashiIndex: activeRashi,
          dob: activeDob,
          tob: activeTob,
          placeName: locationName,
          pincode: pincodeInput,
          source: "calendar_sync"
        });
      }

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
          const fallback = calendarMode === "priest"
            ? `${origin}/priest-panchanga?date=${days[0]?.ymd || "2026-03-19"}`
            : `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga")}&ctz=Asia/Kolkata`;
          QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 280 })
            .then((fallbackUrl) => setQrDataUrl(fallbackUrl));
        });
    } catch (e) {
      console.error("Error in QR payload generation:", e);
      const fallback = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga")}&ctz=Asia/Kolkata`;
      QRCode.toDataURL(fallback, { errorCorrectionLevel: "L", margin: 2, width: 280 })
        .then((fallbackUrl) => setQrDataUrl(fallbackUrl));
    }
  }, [days, lang, panditName, notificationTime, personName, platform, target, isOpen, webSanctumUrl, origin, pincodeInput, lat, lng, locationName, calendarMode, activeDob, activeTob, activeNak, activeRashi, effectivePriestPhone, overridePriestContact]);

  if (!isOpen) return null;

  const selectedDay = days[0];

  const handleDownload = () => {
    const icsContent = calendarMode === "priest"
      ? generatePriestICalendarString({
          startDateStr: selectedDay?.ymd || "2026-03-19",
          daysCount: calendarSpanDays,
          pincode: pincodeInput,
          lat,
          lng,
          locationName,
          priestName: panditName,
          webAppBaseUrl: origin
        })
      : generateSevaICalendarString({
          days: (days && days.length >= calendarSpanDays) ? days.slice(0, calendarSpanDays) : days,
          daysCount: calendarSpanDays,
          lang,
          panditName,
          notificationTime,
          personName,
          webAppBaseUrl: origin,
          pincode: pincodeInput,
          lat,
          lng,
          locationName,
          aiPanchangaMap,
          birthNakshatraIndex: activeNak,
          birthRashiIndex: activeRashi,
          dob: activeDob,
          tob: activeTob,
          includePriestCalendar: includePriestCalendar || (calendarMode as string) === "priest",
          priestPhone: effectivePriestPhone,
          overrideCalendarPhone: overridePriestContact
        });

    const safePujari = (panditName || "Sri_Chaitanya_Pandit").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    const safeDevotee = calendarMode === "priest" ? "Priest_Panchanga" : (personName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    const safeDate = (selectedDay?.ymd || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");
    const filename = `${safePujari}_${safeDevotee}_${safeDate}_${calendarSpanDays}Days.ics`;
    downloadIcsFile(filename, icsContent);

    if (calendarMode === "priest") {
      void recordPriestCalendarAction({
        priestName: panditName,
        action: "download_ics",
        date: selectedDay?.ymd || "2026-03-19",
        spanDays: calendarSpanDays,
        pincode: pincodeInput,
        locationName
      });
    }
  };

  const handleGoogleCalendar = () => {
    if (calendarMode === "priest") {
      void recordPriestCalendarAction({
        priestName: panditName,
        action: "web_visit",
        date: selectedDay?.ymd || "2026-03-19",
        spanDays: calendarSpanDays,
        pincode: pincodeInput,
        locationName
      });
      window.open(`${origin}/priest-panchanga?date=${selectedDay?.ymd || "2026-03-19"}&pincode=${pincodeInput}`, "_blank");
      return;
    }
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
      locationName,
      aiPanchangaMap,
      birthNakshatraIndex: activeNak,
      birthRashiIndex: activeRashi,
      dob: activeDob,
      tob: activeTob,
      includePriestCalendar: includePriestCalendar || (calendarMode as string) === "priest",
      priestPhone: effectivePriestPhone,
      overrideCalendarPhone: overridePriestContact
    });
    window.open(url, "_blank");
  };

  const handleCopyLinkData = () => {
    const icsContent = calendarMode === "priest"
      ? generatePriestICalendarString({
          startDateStr: selectedDay?.ymd || "2026-03-19",
          daysCount: calendarSpanDays,
          pincode: pincodeInput,
          lat,
          lng,
          locationName,
          priestName: panditName,
          webAppBaseUrl: origin
        })
      : generateSevaICalendarString({
          days: (days && days.length >= calendarSpanDays) ? days.slice(0, calendarSpanDays) : days,
          daysCount: calendarSpanDays,
          lang,
          panditName,
          notificationTime,
          personName,
          pincode: pincodeInput,
          lat,
          lng,
          locationName,
          aiPanchangaMap,
          birthNakshatraIndex: activeNak,
          birthRashiIndex: activeRashi,
          dob: activeDob,
          tob: activeTob,
          includePriestCalendar: includePriestCalendar || (calendarMode as string) === "priest",
          priestPhone: effectivePriestPhone,
          overrideCalendarPhone: overridePriestContact
        });
    const dataUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    navigator.clipboard.writeText(dataUri);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);

    if (calendarMode === "priest") {
      void recordPriestCalendarAction({
        priestName: panditName,
        action: "download_ics",
        date: selectedDay?.ymd || "2026-03-19",
        spanDays: calendarSpanDays,
        pincode: pincodeInput,
        locationName
      });
    }
  };

  const handleCopyWebLink = () => {
    const linkToCopy = calendarMode === "priest"
      ? `${origin}/priest-panchanga?date=${selectedDay?.ymd || "2026-03-19"}&pincode=${pincodeInput}`
      : webSanctumUrl;
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);

    if (calendarMode === "priest") {
      void recordPriestCalendarAction({
        priestName: panditName,
        action: "qr_scan",
        date: selectedDay?.ymd || "2026-03-19",
        spanDays: calendarSpanDays,
        pincode: pincodeInput,
        locationName
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
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
            className="flex items-center gap-1 rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-950 shadow transition hover:bg-amber-300"
            aria-label="Close modal"
          >
            ✕ {lang.startsWith("kn") ? "ಮುಚ್ಚಿ" : "Close"}
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Calendar Duration Span Selector (1M, 3M, 6M, 12M) */}
          <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950">
                📅 {lang.startsWith("kn") ? "ಕ್ಯಾಲೆಂಡರ್ ಅವಧಿ ಆಯ್ಕೆ (Duration):" : "Calendar Duration:"}
              </label>
              <span className="text-[11px] font-bold text-amber-800">
                {calendarSpanDays} {lang.startsWith("kn") ? "ದಿನಗಳು" : "Days"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { days: 30, label: "೧ ತಿಂಗಳು (30D)" },
                { days: 90, label: "೩ ತಿಂಗಳು (90D)" },
                { days: 180, label: "೬ ತಿಂಗಳು (180D)" },
                { days: 365, label: "೧ ವರ್ಷ (365D)" }
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => setCalendarSpanDays(item.days)}
                  className={`py-2 rounded-xl text-[11px] font-black border transition-all ${
                    calendarSpanDays === item.days
                      ? "bg-amber-700 text-white border-amber-800 shadow-xs"
                      : "bg-white text-amber-950 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priest Calendar Checkbox (Unchecked by default) */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl border-2 border-amber-400 bg-[#FFFDF7] cursor-pointer shadow-xs hover:bg-amber-50/90 transition">
            <input
              type="checkbox"
              checked={includePriestCalendar || calendarMode === "priest"}
              onChange={(e) => {
                setIncludePriestCalendar(e.target.checked);
                if (e.target.checked && isSuperAdmin) {
                  setCalendarMode("priest");
                } else if (!e.target.checked) {
                  setCalendarMode("devotee");
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-amber-400"
            />
            <div className="text-left flex-1">
              <span className="block text-xs font-black text-amber-950">
                👑 {lang.startsWith("kn") ? "ಪುರೋಹಿತರ ವಿಶೇಷ ಪಂಚಾಂಗ ಸೇರಿಸಿ (Include Priest Calendar & Detailed Muhurtha Timings)" : "Include Priest Calendar & Detailed Muhurtha Timings"}
              </span>
              <span className="block text-[11px] leading-snug text-amber-900/80 mt-0.5">
                {lang.startsWith("kn")
                  ? "೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯ ಸಮಯಗಳು, ತಿಥಿ-ನಕ್ಷತ್ರ ಅಂತ್ಯ ವಿವರ, ಶ್ರಾದ್ಧ ತಿಥಿ, ಎನರ್ಜಿ ಮೀಟರ್ ಮತ್ತು ಕರ್ಮಾನುಷ್ಠಾನ ಮುಹೂರ್ತಗಳನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಸೇರಿಸುತ್ತದೆ."
                  : "Includes 12 Dina Lagna ending times, Tithi/Nakshatra transition timings, Shraddha tithi, energy meter, and priest duty reminders."}
              </span>
            </div>
          </label>

          {/* Calendar Type Segmented Switch: ONLY FOR SUPERADMIN */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2 p-1.5 bg-amber-200/70 border-2 border-amber-400 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={() => setCalendarMode("devotee")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  calendarMode === "devotee"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "text-amber-950 hover:bg-amber-100"
                }`}
              >
                🕉️ {lang.startsWith("kn") ? "ಭಕ್ತರ ದೈನಂದಿನ ಲಯ ಕ್ಯಾಲೆಂಡರ್" : "Devotee Rhythm Calendar"}
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode("priest")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  calendarMode === "priest"
                    ? "bg-amber-800 text-white shadow-sm"
                    : "text-amber-950 hover:bg-amber-100"
                }`}
              >
                👑 {lang.startsWith("kn") ? "ಪುರೋಹಿತ ಪಂಚಾಂಗ ಮಹಾದರ್ಶನ" : "Priest Panchanga Calendar"}
              </button>
            </div>
          )}

          {/* If Priest Mode, Show Span Selector (30, 60, 90, 120, 180 Days) and Priest Selector with Voice Mic */}
          {isSuperAdmin && calendarMode === "priest" && (
            <div className="p-3.5 bg-[#FFFDF7] border-2 border-amber-400 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950">
                  ಪುರೋಹಿತ ಅವಧಿ ಆಯ್ಕೆ (Calendar Span):
                </span>
                <a
                  href={`/priest-panchanga?date=${selectedDay?.ymd || "2026-03-19"}&pincode=${pincodeInput}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-amber-800 underline hover:text-amber-950 flex items-center gap-1"
                >
                  <span>ಪುರೋಹಿತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ</span>
                  <span>↗</span>
                </a>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { days: 30, label: "೧ ತಿಂಗಳು (30D)" },
                  { days: 90, label: "೩ ತಿಂಗಳು (90D)" },
                  { days: 180, label: "೬ ತಿಂಗಳು (180D)" },
                  { days: 365, label: "೧ ವರ್ಷ (365D)" }
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setCalendarSpanDays(item.days)}
                    className={`py-2 rounded-xl text-[11px] font-black border transition-all ${
                      calendarSpanDays === item.days
                        ? "bg-amber-700 text-white border-amber-800 shadow-xs"
                        : "bg-white text-amber-950 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Priest Voice Profile Selector & Audio Database Trigger */}
              <div className="pt-2 border-t border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-amber-950 block">
                    🎙️ ಅರ್ಚಕರ ಧ್ವನಿ ಪ್ರೊಫೈಲ್ (Voice Profile for Devotee Audio):
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsVoiceUploadModalOpen(true)}
                    className="text-[10px] font-black text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                  >
                    <span>🎙️ ಧ್ವನಿ ಡೇಟಾಬೇಸ್ ವಾಲ್ಟ್</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-amber-400 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-amber-600 shadow-2xs"
                  >
                    {voiceProfiles.map((vp) => (
                      <option key={vp.id} value={vp.id}>
                        {vp.name} ({vp.titleKn || vp.titleEn})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsVoiceUploadModalOpen(true)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black shadow-xs whitespace-nowrap"
                    title="Upload or record custom priest voice"
                  >
                    + ಧ್ವನಿ ಅಪ್‌ಲೋಡ್
                  </button>
                </div>
              </div>

              {/* Priest Selection with Voice Mic 🎙️ */}
              <div className="pt-2 border-t border-amber-200 space-y-1.5">
                <label className="text-[11px] font-black text-amber-950 block">
                  ಮುಖ್ಯ ಅರ್ಚಕರು / ಪುರೋಹಿತರ ಆಯ್ಕೆ (Priest Selection):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPriestId}
                    onChange={(e) => setSelectedPriestId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-amber-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-amber-500 shadow-2xs"
                  >
                    {priestsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name[lang as keyof typeof p.name] || p.name.en} ({p.title[lang as keyof typeof p.title] || p.title.en})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SpeechRec) {
                        alert("Speech recognition not supported in this browser.");
                        return;
                      }
                      try {
                        const rec = new SpeechRec();
                        rec.lang = "kn-IN";
                        rec.interimResults = false;
                        setPriestVoiceListening(true);
                        rec.onstart = () => setPriestVoiceListening(true);
                        rec.onend = () => setPriestVoiceListening(false);
                        rec.onerror = () => setPriestVoiceListening(false);
                        rec.onresult = (e: any) => {
                          const text = e.results?.[0]?.[0]?.transcript || "";
                          if (text) {
                            const found = priestsList.find(
                              (p) =>
                                (p.name.kn && p.name.kn.includes(text)) ||
                                (p.name.en && p.name.en.toLowerCase().includes(text.toLowerCase()))
                            );
                            if (found) {
                              setSelectedPriestId(found.id);
                            }
                          }
                          setPriestVoiceListening(false);
                        };
                        rec.start();
                      } catch {
                        setPriestVoiceListening(false);
                      }
                    }}
                    title="ಧ್ವನಿ ಮೂಲಕ ಪುರೋಹಿತರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Voice Priest Search)"
                    className={`p-2 rounded-xl text-xs font-black border-2 transition-all shadow-xs ${
                      priestVoiceListening
                        ? "bg-red-500 text-white border-red-600 animate-pulse"
                        : "bg-white text-amber-950 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {priestVoiceListening ? "🔴" : "🎙️"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Priest Contact Phone Override */}
          <div className="rounded-xl border border-amber-300/80 bg-white/70 p-2.5 shadow-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overridePriestContact}
                onChange={(e) => setOverridePriestContact(e.target.checked)}
                className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-amber-950">
                {lang.startsWith("kn")
                  ? "ಪುರೋಹಿತರ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ (Override Priest Contact)"
                  : lang === "te"
                  ? "పురోహితుల సంప్రదింపు సంఖ్యను మార్చండి (Override Priest Contact)"
                  : lang === "hi"
                  ? "पुरोहित संपर्क नंबर बदलें (Override Priest Contact)"
                  : lang === "ta"
                  ? "புரோகிதர் தொடர்பு எண்ணை மாற்றவும் (Override Priest Contact)"
                  : "Override Priest Contact Number"}
              </span>
            </label>
            {overridePriestContact && (
              <div className="mt-2 pl-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-amber-900">📞 +91</span>
                  <input
                    type="tel"
                    value={customPriestPhone}
                    onChange={(e) => setCustomPriestPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                    placeholder="9972339362"
                    className="w-44 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-amber-950 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-amber-800/80">
                  {lang.startsWith("kn")
                    ? "ದೈನಂದಿನ ದರ್ಶನ ಪುಟ ಮತ್ತು ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಈ ಸಂಖ್ಯೆ ಕಾಣಿಸುತ್ತದೆ (Default: 9972339362)"
                    : lang === "te"
                    ? "రోజువారీ దర్శనం పేజీ మరియు క్యాలెండర్‌లో ఈ సంఖ్య కనిపిస్తుంది (Default: 9972339362)"
                    : "This phone number will appear on Daily Darshana page & Calendar (Default: 9972339362)"}
                </p>
              </div>
            )}
          </div>

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

          {/* Calendar Event Flair Illustration & Morning Reminder Preview Card */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/80 shadow-md">
            <img
              src="/baggona_panchanga_gold_banner.jpg"
              alt="Calendar Event Flair Banner"
              className="w-full h-28 object-cover brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/40 to-transparent p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-sm border border-amber-400/40">
                  🎨 Mobile Calendar Event Flair & Morning Reminder
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide drop-shadow-md">
                  [Shukla Triteeya] Shreeram Pandit - Baggona Panchanga
                </h4>
                <p className="text-[11px] font-semibold text-amber-200/90 flex items-center gap-1.5 mt-0.5">
                  <span>⏰ Morning Alarm ({notificationTime} AM)</span>
                  <span>•</span>
                  <span>🔔 Audible Ringtone Enabled</span>
                </p>
              </div>
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
              <div className="mt-2 rounded-xl bg-amber-200/50 border border-amber-300/80 p-2 text-[11px] font-bold text-amber-950 flex items-center justify-between shadow-inner">
                <span className="flex items-center gap-1.5">
                  <span>✨</span>
                  <span>
                    {isAiSyncing
                      ? (lang.startsWith("kn") ? "⌛ ಜೆಮಿನಿ AI 90-ದಿನಗಳ ಪಂಚಾಂಗ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ..." : "⌛ Gemini AI 90-Day Panchanga Syncing...")
                      : (lang.startsWith("kn") ? `✓ 90-ದಿನಗಳ AI ಪಂಚಾಂಗ ಸಿಂಕ್ ಸಕ್ರಿಯವಾಗಿದೆ (${pincodeInput})` : `✓ 90-Day AI Panchanga Location Synchronized (${pincodeInput})`)}
                  </span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-800 text-amber-50">
                  {lang.toUpperCase()}
                </span>
              </div>
            </div>

            {/* 90-Day Special Vrata & Festival Highlights (1-Day Eve Alert) */}
            {specialVratas.length > 0 && (
              <div className="sm:col-span-2 rounded-2xl border border-amber-400/80 bg-gradient-to-br from-amber-500/10 via-amber-900/5 to-amber-500/10 p-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-300/40 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-xs">
                    <span className="text-sm">🕉️</span>
                    <span>
                      {lang.startsWith("kn")
                        ? `90-ದಿನಗಳ ಪವಿತ್ರ ವ್ರತ & ಹಬ್ಬಗಳು (${specialVratas.length} ವ್ರತಗಳು)`
                        : `90-Day Sacred Vratas & Festivals (${specialVratas.length} Special Days)`}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-800 text-amber-50 shadow-xs">
                    1-DAY EVE ALERT
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {specialVratas.map((item) => (
                    <div
                      key={item.ymd}
                      className="min-w-[150px] flex-shrink-0 rounded-xl bg-white/90 border border-amber-300/80 p-2 text-left shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-800">
                        <span>{item.ymd}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-900">{item.category}</span>
                      </div>
                      <div className="text-[11px] font-extrabold text-amber-950 truncate mt-1" title={item.vrataName}>
                        {item.vrataName}
                      </div>
                      <div className="text-[9px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
                        <span>🔔</span>
                        <span>1-Day Prior Eve Alert</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pre-defined Priest Dropdown Selector & Dynamic Custom Addition */}
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80">
                  {lang.startsWith("kn") ? "ಅರ್ಚಕರ ಆಯ್ಕೆ & ನೇರ ಸಂಪರ್ಕ (Priest Selection & Direct Contact)" : "Select Priest & Contact"}
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="override-priest-contact-modal-toggle"
                    checked={overridePriestContact}
                    onChange={(e) => setOverridePriestContact(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${overridePriestContact ? "text-amber-800" : "text-amber-900/70"}`}>
                    {overridePriestContact
                      ? (lang.startsWith("kn") ? "ಓವರ್‌ರೈಡ್ ಸಕ್ರಿಯವಾಗಿದೆ (Active)" : "Override Active")
                      : (lang.startsWith("kn") ? "ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ (Override Contact)" : "Override Priest Details")}
                  </span>
                </label>
              </div>

              {!customInputMode ? (
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedPriestId}
                    onChange={(e) => handleSelectPriest(e.target.value)}
                    className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                  >
                    {priestsList.map((p) => {
                      const name = p.name[lang as keyof typeof p.name] || p.name.en;
                      const title = p.title[lang as keyof typeof p.title] || p.title.en;
                      return (
                        <option key={p.id} value={p.id}>
                          {p.sealSymbol} {name} ({title}) {p.id === "shreeram-pandit" ? "— [Default 9972339362]" : ""}
                        </option>
                      );
                    })}
                    <option value="ADD_NEW">➕ {lang.startsWith("kn") ? "ಹೊಸ ಅರ್ಚಕರನ್ನು ಸೇರಿಸಿ..." : "Add New Priest..."}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      startPriestVoiceInput("name", (val) => {
                        const found = priestsList.find(p => 
                          Object.values(p.name).some(n => n.toLowerCase().includes(val.toLowerCase())) ||
                          p.id.toLowerCase().includes(val.toLowerCase())
                        );
                        if (found) {
                          handleSelectPriest(found.id);
                        } else if (val.trim()) {
                          const added = addCustomPriest(val.trim());
                          setPriestsList(getAllPriests());
                          setSelectedPriestId(added.id);
                          setCustomPriestName(val.trim());
                          setOverridePriestContact(true);
                        }
                      });
                    }}
                    title={listeningPriestField === "name" ? pick(T.micListening!, lang) : "ಧ್ವನಿ ಮೂಲಕ ಅರ್ಚಕರನ್ನು ಹುಡುಕಿ (Voice Priest Search)"}
                    className={`rounded-xl p-2 transition shrink-0 ${
                      listeningPriestField === "name"
                        ? "animate-pulse bg-red-500 text-white border border-red-600"
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
                        setCustomPriestName(newPriestName.trim());
                        setOverridePriestContact(true);
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
              <div className="rounded-xl border border-amber-300/80 bg-amber-100/60 p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl" style={{ color: activePriest.sealColor }}>{activePriest.sealSymbol}</span>
                  <div>
                    <div className="text-xs font-bold text-amber-950">
                      {overridePriestContact && customPriestName.trim() ? customPriestName : (activePriest.sealText[lang as keyof typeof activePriest.sealText] || activePriest.sealText.en)}
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

              {/* Default Priest Summary or Editable Priest Card */}
              {!overridePriestContact ? (
                <div className="flex items-center justify-between rounded-xl bg-amber-50 p-2.5 border border-amber-300/80 text-xs">
                  <div>
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <span>{activePriest.sealSymbol}</span>
                      <span>{panditName}</span>
                    </div>
                    <div className="text-[11px] text-amber-800/80 mt-0.5">
                      {activePriest.title[lang as keyof typeof activePriest.title] || activePriest.title.en} | {lang.startsWith("kn") ? "ನೇರ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ:" : "Direct Phone:"} {effectivePriestPhone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      ✓ {selectedPriestId === "shreeram-pandit" ? (lang.startsWith("kn") ? "ಡಿಫಾಲ್ಟ್ ಅರ್ಚಕರು" : "Default Priest") : (lang.startsWith("kn") ? "ಆಯ್ಕೆಯಾದ ಅರ್ಚಕರು" : "Selected Priest")}
                    </span>
                    <label className="text-amber-800 hover:text-amber-950 cursor-pointer text-xs font-bold flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={overridePriestContact}
                        onChange={(e) => setOverridePriestContact(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-amber-700"
                      />
                      <span>{lang.startsWith("kn") ? "ಓವರ್‌ರೈಡ್" : "Override"}</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl bg-amber-50/90 p-3.5 border border-amber-300/90 shadow-sm">
                  <div className="flex items-center justify-between pb-1.5 border-b border-amber-200">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <span>✏️</span>
                      <span>{lang.startsWith("kn") ? "ಅರ್ಚಕರ ವಿವರಗಳನ್ನು ಸಂಪಾದಿಸಿ (Edit Priest Info)" : "Edit Priest Information"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPriestId("shreeram-pandit");
                        setCustomPriestName("ಶ್ರೀರಾಮ್ ಪಂಡಿತ್");
                        setCustomPriestPhone("9972339362");
                        setOverridePriestContact(false);
                      }}
                      className="text-[11px] text-amber-800 hover:text-amber-950 underline font-semibold"
                    >
                      {lang.startsWith("kn") ? "ಡಿಫಾಲ್ಟ್‌ಗೆ ಮರುಹೊಂದಿಸಿ (Reset to Default)" : "Reset to Default"}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Editable Priest Name with Mic Speech-to-Text */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        {lang.startsWith("kn") ? "ಅರ್ಚಕರ ಹೆಸರು (Priest Name) *" : "Priest Name *"}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={customPriestName}
                          onChange={(e) => setCustomPriestName(e.target.value)}
                          placeholder={lang.startsWith("kn") ? "ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "e.g. Shreeram Pandit"}
                          className="w-full rounded-lg border border-amber-300 bg-white pl-2.5 pr-8 py-2 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          title={lang.startsWith("kn") ? "ಅರ್ಚಕರ ಹೆಸರು ಹೇಳಿ (Speak Priest Name)" : "Speak Priest Name"}
                          onClick={() => startPriestVoiceInput("name", (val) => setCustomPriestName(val))}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs transition ${
                            listeningPriestField === "name" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:text-amber-900"
                          }`}
                        >
                          🎤
                        </button>
                      </div>
                    </div>

                    {/* Editable Priest Phone with Mic Speech-to-Text */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        {lang.startsWith("kn") ? "ನೇರ ಕರೆ ಸಂಖ್ಯೆ (Phone) *" : "Contact Phone *"}
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="tel"
                          value={customPriestPhone}
                          onChange={(e) => setCustomPriestPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                          placeholder="9972339362"
                          className="w-full rounded-lg border border-amber-300 bg-white pl-2.5 pr-8 py-2 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          title={lang.startsWith("kn") ? "ಫೋನ್ ಸಂಖ್ಯೆ ಹೇಳಿ (Speak Phone Number)" : "Speak Phone Number"}
                          onClick={() => startPriestVoiceInput("phone", (val) => {
                            const parsed = parseSpokenPhoneNumber(val);
                            setCustomPriestPhone(parsed || val.replace(/\D/g, "").slice(0, 10));
                          })}
                          className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-xs transition ${
                            listeningPriestField === "phone" ? "bg-red-500 text-white animate-pulse" : "text-amber-700 hover:text-amber-900"
                          }`}
                        >
                          🎤
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-amber-800/90 font-medium">
                    {lang.startsWith("kn")
                      ? "⚡ ಓವರ್‌ರೈಡ್ ಮಾಡಲಾದ ಹೆಸರು ಮತ್ತು ದೂರವಾಣಿ ಸಂಖ್ಯೆಯು ಸಿಂಕ್ ಆಗುವ ಕ್ಯಾಲೆಂಡರ್ ಹಾಗೂ ದೈನಂದಿನ ದರ್ಶನ ಪುಟದಲ್ಲಿ (9972339362 ಬದಲಿಗೆ) ಪ್ರತಿಫಲಿಸುತ್ತದೆ."
                      : "⚡ Overridden name & phone will appear on Synced Calendar events and Daily Darshana call button (instead of 9972339362)."}
                  </p>
                </div>
              )}
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

          {/* Delete All Events Series Tip */}
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/90 p-2.5 text-[11px] leading-relaxed text-amber-900 shadow-sm flex items-start gap-2">
            <span className="text-base shrink-0">💡</span>
            <div>
              <span className="font-bold text-amber-950">
                {lang.startsWith("kn") ? "ಕ್ಯಾಲೆಂಡರ್ 1-ಕ್ಲಿಕ್ ಅಳಿಸುವಿಕೆ ಸುಳಿವು:" : "1-Click Delete All Series Tip:"}
              </span>{" "}
              {lang.startsWith("kn")
                ? "ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್ ಅಥವಾ ಆಪಲ್ ಕ್ಯಾಲೆಂಡರ್‌ನಲ್ಲಿ ಯಾವುದೇ ದಿನಾಂಕದ ಈವೆಂಟ್ ಅನ್ನು ತೆರೆದು 'Delete all events in series' ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ 90 ದಿನಗಳನ್ನು 1 ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಅಳಿಸಬಹುದು."
                : "In Google Calendar or Apple Calendar, open any daily event and select 'Delete all events in series' to clean all 90 days with 1 click."}
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

          {/* Bottom Close Button */}
          <div className="pt-3 border-t border-amber-200/80 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-amber-400 bg-gradient-to-r from-amber-100 to-amber-200 px-6 py-2.5 text-xs font-bold text-amber-950 shadow hover:from-amber-200 hover:to-amber-300 transition"
            >
              ✕ {lang.startsWith("kn") ? "ಮುಚ್ಚಿ (ನಿರ್ಗಮಿಸಿ)" : "Close Modal"}
            </button>
          </div>
        </div>
      </div>

      {/* Priest Voice Upload & Database Manager Modal */}
      <PriestVoiceUploadModal
        isOpen={isVoiceUploadModalOpen}
        onClose={() => {
          setIsVoiceUploadModalOpen(false);
          setVoiceProfiles(getAllVoiceProfiles());
        }}
        lang={lang as any}
        initialVoiceId={selectedVoiceId}
        onSelectVoice={(vId) => setSelectedVoiceId(vId)}
      />
    </div>
  );
}

