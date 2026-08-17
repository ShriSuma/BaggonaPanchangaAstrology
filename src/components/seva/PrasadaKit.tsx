import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { RhythmDay, RhythmResult } from "../../core/DailyRhythmEngine";
import type { SevaRecommendation } from "../../core/GokarnaSevaEngine";
import type { SevaId } from "../../data/gokarnaSevas";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateNative90DayQrCalendarPayload,
  generateSevaICalendarString,
  generateQrPayloadByTarget,
  type QrCalendarTarget
} from "../../features/seva/icsCalendarGenerator";
import { T, pick, type L5 } from "../../features/seva/sevaLocale";
import { todayYmd } from "../../features/seva/sevaPresentation";
import { generatePDFFromElement } from "../../utils/pdfGenerator";
import { SEVA_CATALOG } from "../../data/gokarnaSevas";
import { transliterateNameWithAI, fetchPoojaDetailsWithAI } from "../../features/seva/sevaGenAI";
import {
  SevaAnugrahaGuidancePrint,
  SevaRemediesAnnualPrint,
  SevaPoojaMahatmePrint,
  type PoojaMahatmeData,
  SevaCalendarPrint,
  SevaLetterPrint,
  SevaPrasadaCardPrint,
  SevaQRCodePrint
} from "./pdf/SevaPrintTemplates";

type Identity = {
  personName: string;
  gotra: string;
  rashiIndex: number;
  nakshatraIndex: number;
  placeLabel: string;
};

type Props = {
  rhythm: RhythmResult;
  recommendations: SevaRecommendation[];
  identity: Identity;
  lang: string;
};

/** What the person receives in the physical packet. */
const KIT_ITEMS: { icon: string; title: L5; body: L5 }[] = [
  {
    icon: "◈",
    title: {
      en: "Six-Month Calendar",
      kn: "ಆರು ತಿಂಗಳ ಕ್ಯಾಲೆಂಡರ್",
      te: "ఆరు నెలల క్యాలెండర్",
      ta: "ஆறு மாத நாட்காட்டி",
      hi: "छह महीने का कैलेंडर"
    },
    body: {
      en: "Two sheets to put on your wall. Every date is coloured for your own birth star.",
      kn: "ಗೋಡೆಗೆ ಹಚ್ಚಲು ಎರಡು ಹಾಳೆ. ಪ್ರತಿ ದಿನಾಂಕವೂ ನಿಮ್ಮ ಜನ್ಮ ನಕ್ಷತ್ರಕ್ಕೆ ತಕ್ಕಂತೆ ಬಣ್ಣ ಹೊಂದಿದೆ.",
      te: "గోడకు అతికించడానికి రెండు షీట్లు. ప్రతి తేదీ మీ జన్మ నక్షత్రాన్ని బట్టి రంగు వేయబడింది.",
      ta: "சுவரில் ஒட்ட இரண்டு தாள்கள். ஒவ்வொரு தேதியும் உங்கள் ஜன்ம நட்சத்திரத்திற்கேற்ப நிறமிடப்பட்டுள்ளது.",
      hi: "दीवार पर लगाने के लिए दो पत्रक। हर तारीख़ आपके जन्म नक्षत्र के अनुसार रंगी गई है।"
    }
  },
  {
    icon: "✉",
    title: {
      en: "Blessing Letter",
      kn: "ಆಶೀರ್ವಾದ ಪತ್ರ",
      te: "ఆశీర్వాద పత్రం",
      ta: "ஆசீர்வாதக் கடிதம்",
      hi: "आशीर्वाद पत्र"
    },
    body: {
      en: "A letter in your name recording the seva that was offered and how to read the calendar.",
      kn: "ಸಲ್ಲಿಸಿದ ಸೇವೆಯನ್ನು ಮತ್ತು ಕ್ಯಾಲೆಂಡರ್ ಓದುವ ವಿಧಾನವನ್ನು ದಾಖಲಿಸಿದ, ನಿಮ್ಮ ಹೆಸರಿನ ಪತ್ರ.",
      te: "సమర్పించిన సేవను, క్యాలెండర్ చదివే విధానాన్ని నమోదు చేసిన మీ పేరిట పత్రం.",
      ta: "சமர்ப்பிக்கப்பட்ட சேவையையும் நாட்காட்டியைப் படிக்கும் முறையையும் பதிவு செய்த, உங்கள் பெயரிலான கடிதம்.",
      hi: "अर्पित की गई सेवा और कैलेंडर पढ़ने की विधि दर्ज करता, आपके नाम का पत्र।"
    }
  },
  {
    icon: "✦",
    title: {
      en: "Prasada Card",
      kn: "ಪ್ರಸಾದ ಕಾರ್ಡ್",
      te: "ప్రసాద కార్డు",
      ta: "பிரசாத அட்டை",
      hi: "प्रसाद कार्ड"
    },
    body: {
      en: "A small card for your pooja shelf, with your number, colour, direction and mantra.",
      kn: "ನಿಮ್ಮ ಸಂಖ್ಯೆ, ಬಣ್ಣ, ದಿಕ್ಕು ಮತ್ತು ಮಂತ್ರವಿರುವ, ದೇವರ ಮನೆಗೆ ಇಡುವ ಚಿಕ್ಕ ಕಾರ್ಡ್.",
      te: "మీ సంఖ్య, రంగు, దిక్కు, మంత్రం ఉన్న, పూజ గదిలో ఉంచే చిన్న కార్డు.",
      ta: "உங்கள் எண், நிறம், திசை, மந்திரம் அடங்கிய, பூஜை அறையில் வைக்கும் சிறிய அட்டை.",
      hi: "आपका अंक, रंग, दिशा और मंत्र लिए, पूजा स्थान पर रखने योग्य छोटा कार्ड।"
    }
  }
];

const hiddenHost: React.CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  width: 900,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
  overflow: "hidden",
  height: 0
};

const formatSevaDocFileName = ({
  pandit,
  devotee,
  pooja,
  date,
  docType,
  lang,
  ext = "pdf"
}: {
  pandit?: string;
  devotee?: string;
  pooja?: string;
  date?: string;
  docType: string;
  lang?: string;
  ext?: string;
}): string => {
  const sanitize = (str?: string, fallback = ""): string => {
    if (!str) return fallback;
    const clean = str.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
    return clean || fallback;
  };

  const pName = sanitize(pandit, "Archaka");
  const dName = sanitize(devotee, "Bhakta");
  const sName = sanitize(pooja, "Seva");
  const dateStr = (date || new Date().toISOString().slice(0, 10)).replace(/[^\d-]/g, "");
  const langSuffix = lang ? `_${lang.toUpperCase()}` : "";

  return `${pName}_${dName}_${sName}_${dateStr}_${docType}${langSuffix}.${ext}`;
};

export default function PrasadaKit({
  rhythm,
  recommendations,
  identity,
  lang
}: Props): JSX.Element {
  const [platform, setPlatform] = useState<"android" | "apple">("android");
  const [qrTarget, setQrTarget] = useState<QrCalendarTarget>("google");
  const [pdfLang, setPdfLang] = useState<string>(lang || "kn");
  const [busy, setBusy] = useState<string | null>(null);
  const [sevaDate, setSevaDate] = useState(todayYmd());
  const [sevaId, setSevaId] = useState<SevaId | "">(recommendations[0]?.seva.id ?? "");
  const [panditName, setPanditName] = useState("Chaitanya Pandit");
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  // GenAI dynamic fetched data
  const [transliteratedDevoteeName, setTransliteratedDevoteeName] = useState<string>("");
  const [aiPoojaDetails, setAiPoojaDetails] = useState<{what: string, why: string, benefit: string} | null>(null);

  // Speech Recognition for Priest Name Mic Button
  const handleMicClick = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert("Speech recognition is not supported in this browser. Please type the priest name manually.");
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

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) setPanditName(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Generate QR Code data URL for print templates
  useEffect(() => {
    if (!rhythm?.days || rhythm.days.length === 0) return;
    const nativeIcsPayload = generateQrPayloadByTarget(qrTarget, {
      days: rhythm.days,
      lang: pdfLang,
      panditName,
      notificationTime,
      personName: identity?.personName,
      platform
    });

    QRCode.toDataURL(nativeIcsPayload, {
      margin: 2,
      width: 280,
      color: {
        dark: "#78350F",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating print QR code:", err));
  }, [rhythm, pdfLang, panditName, notificationTime, identity?.personName, platform, qrTarget]);

  const chosenSeva = useMemo(() => {
    // 1. Check if it's a recommendation
    const rec = recommendations?.find((r) => r?.seva?.id === sevaId);
    if (rec) return rec;
    
    // 2. Check if it's in the catalog (manually selected)
    if (sevaId && SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG]) {
      return { 
        seva: SEVA_CATALOG[sevaId as keyof typeof SEVA_CATALOG],
        score: 0,
        reasons: []
      };
    }
    
    // 3. Fallback
    return recommendations?.[0];
  }, [recommendations, sevaId]);

  const chosenPoojaName = useMemo(() => {
    if (chosenSeva?.seva?.name) {
      if (typeof chosenSeva.seva.name === "object") {
        return (chosenSeva.seva.name as any)[pdfLang] || chosenSeva.seva.name.en || chosenSeva.seva.name.kn || "Seva";
      }
    }
    return (chosenSeva as any)?.label || chosenSeva?.seva?.id || "Seva";
  }, [chosenSeva, pdfLang]);

  // Fetch AI details whenever a new Pooja is selected or the PDF language changes
  useEffect(() => {
    let cancelled = false;
    
    async function getAIData() {
      if (!chosenPoojaName) return;
      
      setBusy(pick(T.loading!, lang) || "Generating customized text with AI...");
      try {
        const details = await fetchPoojaDetailsWithAI(chosenPoojaName, pdfLang);
        if (!cancelled) setAiPoojaDetails(details);
      } catch (err) {
        console.error("Failed to fetch AI pooja details", err);
      } finally {
        if (!cancelled) setBusy(null);
      }
    }
    
    getAIData();
    return () => { cancelled = true; };
  }, [chosenPoojaName, pdfLang, lang]);

  // Fetch AI transliterated name
  useEffect(() => {
    let cancelled = false;
    if (!identity?.personName) return;
    
    async function getTransliteration() {
      try {
        const name = await transliterateNameWithAI(identity.personName, pdfLang);
        if (!cancelled) setTransliteratedDevoteeName(name);
      } catch (err) {
        console.error("Transliteration failed", err);
      }
    }
    getTransliteration();
    return () => { cancelled = true; };
  }, [identity?.personName, pdfLang]);


  const handleDownloadIcs = () => {
    if (!rhythm?.days || rhythm.days.length === 0) return;
    const csStr = generateSevaICalendarString({
      days: rhythm.days,
      lang: pdfLang,
      panditName,
      notificationTime,
      personName: identity.personName
    });
    const blob = new Blob([csStr], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = formatSevaDocFileName({
      pandit: panditName,
      devotee: identity.personName,
      pooja: chosenPoojaName,
      date: sevaDate,
      docType: "90Day-Calendar-Sync",
      lang: pdfLang,
      ext: "ics"
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const today: RhythmDay | undefined = rhythm?.days?.[0];

  const bestDays = useMemo(
    () => [...(rhythm?.days || [])].sort((a, b) => b.energyScore - a.energyScore).slice(0, 6).sort((a, b) => a.ymd.localeCompare(b.ymd)),
    [rhythm]
  );

  const moneyDays = useMemo(() => rhythm.days.filter((d) => d.isMoneyDay).slice(0, 6), [rhythm]);

  const download = async (elementId: string, fileName: string, tag: string): Promise<void> => {
    setBusy(tag);
    try {
      if (rhythm?.days?.length) {
        const qrPayload = generateQrPayloadByTarget(qrTarget, {
          days: rhythm.days,
          lang: pdfLang,
          panditName,
          notificationTime,
          personName: identity?.personName,
          platform
        });
        let currentQr = "";
        try {
          currentQr = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: "L",
            margin: 2,
            width: 280,
            color: {
              dark: "#78350F",
              light: "#FFFFFF"
            }
          });
        } catch (qrErr) {
          console.warn("High-density QR payload failed, generating fallback QR:", qrErr);
          const fallbackPayload = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Baggona 90-Day Panchanga Calendar")}&details=${encodeURIComponent("Baggona Panchanga Astrology - Gokarna Kshetra")}&recur=RRULE:FREQ=DAILY;COUNT=90&ctz=Asia/Kolkata`;
          currentQr = await QRCode.toDataURL(fallbackPayload, {
            errorCorrectionLevel: "L",
            margin: 2,
            width: 280,
            color: {
              dark: "#78350F",
              light: "#FFFFFF"
            }
          });
        }
        setQrDataUrl(currentQr);
        // Wait for React to re-render DOM with the updated QR image
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      await generatePDFFromElement(elementId, fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF generation encountered an error. Please try again.");
    } finally {
      setBusy(null);
    }
  };


  const Button = ({
    tag,
    label,
    onClick,
    tone
  }: {
    tag: string;
    label: string;
    onClick: () => void;
    tone: "primary" | "secondary";
  }): JSX.Element => (
    <button
      type="button"
      onClick={onClick}
      disabled={busy !== null}
      className={`w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${tone === "primary"
          ? "bg-amber-700 text-amber-50 hover:bg-amber-800"
          : "border border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
        }`}
    >
      {busy === tag ? pick(T.preparing!, lang) : label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-xl font-semibold text-amber-950">
          {pick(T.prasadaHeading!, lang)}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-amber-900/75">
          {pick(T.prasadaIntro!, lang)}
        </p>
      </div>

      {/* What is in the packet */}
      <div className="space-y-2.5">
        {KIT_ITEMS.map((item) => (
          <div
            key={item.icon}
            className="flex gap-3 rounded-xl border border-amber-200 bg-white/70 p-3.5"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-base text-amber-800"
              aria-hidden
            >
              {item.icon}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-amber-950">{pick(item.title, lang)}</div>
              <div className="mt-0.5 text-[13px] leading-snug text-amber-900/70">
                {pick(item.body, lang)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seva & Priest Record for the Letter and Print Cards */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800/70">
          {pick(T.sevaMarkDone!, lang)}
          <span className="ml-2 font-normal normal-case tracking-normal text-amber-700/60">
            ({pick(T.optional!, lang)})
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.sevaPerformed!, lang)}
            </span>
            <select
              value={sevaId}
              onChange={(e) => setSevaId(e.target.value as any)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            >
              {Object.values(SEVA_CATALOG).map((s) => (
                <option key={s.id} value={s.id}>
                  {pick(s.name, lang)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.sevaDate!, lang)}
            </span>
            <input
              type="date"
              value={sevaDate}
              onChange={(e) => setSevaDate(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-amber-200/60">
          <div>
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.panditNameLabel!, lang)}
            </span>
            <div className="relative flex items-center">
              <input
                type="text"
                value={panditName}
                onChange={(e) => setPanditName(e.target.value)}
                placeholder="e.g. Chaitanya Pandit"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 pr-9 text-sm text-amber-950"
              />
              <button
                type="button"
                onClick={handleMicClick}
                title={isListening ? pick(T.micListening!, lang) : pick(T.micSpeak!, lang)}
                className={`absolute right-1.5 rounded-md p-1 transition ${isListening
                    ? "animate-pulse bg-red-500 text-white"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
              >
                🎙️
              </button>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-medium text-amber-800/70">
              {pick(T.notificationTimeLabel!, lang)}
            </span>
            <select
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-950"
            >
              <option value="05:00">05:00 AM</option>
              <option value="06:00">06:00 AM</option>
              <option value="07:00">07:00 AM</option>
              <option value="08:00">08:00 AM (Default)</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
            </select>
          </div>
        </div>
      </div>

      {/* QR Code Calendar Destination Target Selector */}
      <div className="rounded-xl border border-amber-300 bg-amber-100/50 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
            📱 {pick({
              en: "QR Code Calendar Destination Target",
              kn: "QR ಕೋಡ್ ಕ್ಯಾಲೆಂಡರ್ ಸಿಂಕ್ ಗಮ್ಯಸ್ಥಾನ ಆಯ್ಕೆಮಾಡಿ",
              te: "QR కోడ్ క్యాలెండర్ సింక్ గమ్యాన్ని ఎంచుకోండి",
              ta: "QR குறியீடு காலண்டர் இலக்கை தேர்ந்தெடுக்கவும்",
              hi: "QR कोड कैलेंडर सिंक गंतव्य चुनें"
            }, pdfLang)}
          </span>
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
            {qrTarget === "google" ? "Google Calendar Intent" : qrTarget === "webcal" ? "Apple / Outlook Live" : "Baggona Sanctum PWA"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setQrTarget("google");
              setPlatform("android");
            }}
            className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border transition shadow-sm ${qrTarget === "google"
                ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300 scale-[1.02]"
                : "bg-white text-amber-950 border-amber-300 hover:bg-amber-50"
              }`}
          >
            <span className="text-sm font-bold flex items-center gap-1">
              🌟 Google Cal
            </span>
            <span className={`text-[10px] mt-0.5 ${qrTarget === "google" ? "text-amber-100" : "text-amber-700"}`}>
              {pick({
                en: "1-Click Intent (Android/PC)",
                kn: "1-ಕ್ಲಿಕ್ ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್",
                te: "1-క్లిక్ గూగుల్ క్యాలెండర్",
                ta: "1-கிளிக் கூகிள் காலண்டர்",
                hi: "1-क्लिक गूगल कैलेंडर"
              }, pdfLang)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQrTarget("webcal");
              setPlatform("apple");
            }}
            className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border transition shadow-sm ${qrTarget === "webcal"
                ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300 scale-[1.02]"
                : "bg-white text-amber-950 border-amber-300 hover:bg-amber-50"
              }`}
          >
            <span className="text-sm font-bold flex items-center gap-1">
              🍎 Apple & Outlook
            </span>
            <span className={`text-[10px] mt-0.5 ${qrTarget === "webcal" ? "text-amber-100" : "text-amber-700"}`}>
              {pick({
                en: "Native .ics / WebCal Feed",
                kn: "ಆಪಲ್ / ಔಟ್‌ಲುಕ್ .ics ಫೀಡ್",
                te: "ఆపిల్ / ఔట్లుక్ .ics ఫీడ్",
                ta: "ஆப்பிள் / அவுட்லுக் .ics ஃபீட்",
                hi: "ऐप्पल / आउटलुक .ics फीड"
              }, pdfLang)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setQrTarget("sanctum");
            }}
            className={`flex flex-col items-center justify-center text-center p-2.5 rounded-xl border transition shadow-sm ${qrTarget === "sanctum"
                ? "bg-amber-800 text-white border-2 border-amber-600 ring-2 ring-amber-300 scale-[1.02]"
                : "bg-white text-amber-950 border-amber-300 hover:bg-amber-50"
              }`}
          >
            <span className="text-sm font-bold flex items-center gap-1">
              🕉️ Baggona Sanctum
            </span>
            <span className={`text-[10px] mt-0.5 ${qrTarget === "sanctum" ? "text-amber-100" : "text-amber-700"}`}>
              {pick({
                en: "Encrypted PWA Deep Link",
                kn: "ನೇರ ದರ್ಶನ ವೆಬ್ ಆಪ್ ಲಿಂಕ್",
                te: "నేరుగా దర్శనం వెబ్ లింక్",
                ta: "நேரடி தரிசனம் வலை இணைப்பு",
                hi: "प्रत्यक्ष दर्शन वेब लिंक"
              }, pdfLang)}
            </span>
          </button>
        </div>
      </div>


      {/* Language Selector Radio Group for Seva PDFs & Calendar Exports */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-100/80 to-amber-50/90 p-4 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
            🌐 {pick({
              en: "Document & Calendar Export Language",
              kn: "ದಾಖಲೆ ಹಾಗೂ ಕ್ಯಾಲೆಂಡರ್ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
              te: "డాక్యుమెంట్ మరియు క్యాలెండర్ భాషను ఎంచుకోండి",
              ta: "ஆவணம் மற்றும் நாட்காட்டி மொழியைத் தேர்ந்தெடுக்கவும்",
              hi: "दस्तावेज़ एवं कैलेंडर निर्यात भाषा चुनें"
            }, pdfLang)}
          </span>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
            100% Native Script
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { code: "kn", name: "ಕನ್ನಡ" },
            { code: "hi", name: "हिंदी" },
            { code: "te", name: "తెలుగు" },
            { code: "ta", name: "தமிழ்" },
            { code: "en", name: "English" }
          ].map((item) => (
            <label
              key={item.code}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition ${pdfLang === item.code
                  ? "bg-amber-800 text-white border-amber-900 shadow-sm scale-105"
                  : "bg-white text-amber-950 border-amber-300 hover:bg-amber-100/60"
                }`}
            >
              <input
                type="radio"
                name="sevaPdfLang"
                value={item.code}
                checked={pdfLang === item.code}
                onChange={() => setPdfLang(item.code)}
                className="sr-only"
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Downloads */}
      <div className="space-y-2.5">
        <Button
          tag="calendar"
          tone="primary"
          label={pick(T.downloadCalendar!, pdfLang)}
          onClick={() =>
            void download(
              "seva-print-calendar",
              formatSevaDocFileName({
                pandit: panditName,
                devotee: identity.personName,
                pooja: chosenPoojaName,
                date: sevaDate,
                docType: "90Day-Calendar",
                lang: pdfLang,
                ext: "pdf"
              }),
              "calendar"
            )
          }
        />
        <Button
          tag="letter"
          tone="secondary"
          label={pick(T.downloadMessage!, pdfLang)}
          onClick={() =>
            void download(
              "seva-print-letter",
              formatSevaDocFileName({
                pandit: panditName,
                devotee: identity.personName,
                pooja: chosenPoojaName,
                date: sevaDate,
                docType: "Blessing-Letter",
                lang: pdfLang,
                ext: "pdf"
              }),
              "letter"
            )
          }
        />
        <Button
          tag="card"
          tone="secondary"
          label={pick(T.downloadPrasada!, pdfLang)}
          onClick={() =>
            void download(
              "seva-print-card",
              formatSevaDocFileName({
                pandit: panditName,
                devotee: identity.personName,
                pooja: chosenPoojaName,
                date: sevaDate,
                docType: "Prasada-Card",
                lang: pdfLang,
                ext: "pdf"
              }),
              "card"
            )
          }
        />

        {/* Calendar Sync Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              if (!rhythm?.days?.[0]) return;
              const gUrl = generateGoogleCalendarUrl({
                day: rhythm.days[0],
                lang: pdfLang,
                panditName,
                notificationTime
              });
              window.open(gUrl, "_blank");
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-sm transition"
          >
            <span>📅</span>
            <span>Google Calendar ({pdfLang.toUpperCase()})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-sm transition"
          >
            <span>📥</span>
            <span>Apple / Outlook iCal ({pdfLang.toUpperCase()})</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-amber-800/60">{pick(T.disclaimer!, lang)}</p>

      {/* Off-screen print sources */}
      <div id="seva-print-calendar" style={hiddenHost} aria-hidden>
        <SevaCalendarPrint 
          rhythm={rhythm} 
          lang={pdfLang} 
          identity={{
            ...identity,
            aiTransliteratedName: transliteratedDevoteeName,
            aiPoojaDetails: aiPoojaDetails || undefined,
            sevaId: sevaId
          } as any} 
        />
      </div>

      <div id="seva-print-letter" style={hiddenHost} aria-hidden>
        <SevaLetterPrint
          lang={pdfLang}
          identity={identity}
          primarySeva={chosenSeva}
          sevaDate={sevaDate}
          rhythm={rhythm}
          panditName={panditName}
          qrDataUrl={qrDataUrl}
        />
        <SevaQRCodePrint
          lang={pdfLang}
          identity={identity}
          qrDataUrl={qrDataUrl}
          target={qrTarget}
        />
        <SevaAnugrahaGuidancePrint
          lang={pdfLang}
          identity={identity}
          panditName={panditName}
          rhythm={rhythm}
        />
        <SevaRemediesAnnualPrint
          lang={pdfLang}
          identity={identity}
          panditName={panditName}
          rhythm={rhythm}
        />
        <SevaPoojaMahatmePrint
          lang={pdfLang}
          identity={identity}
          panditName={panditName}
          primarySeva={chosenSeva}
          mahatmeData={
            aiPoojaDetails
              ? {
                  whatIsPooja: aiPoojaDetails.what,
                  whyDoPooja: aiPoojaDetails.why,
                  benefitsPooja: aiPoojaDetails.benefit
                }
              : undefined
          }
        />
      </div>

      <div id="seva-print-card" style={hiddenHost} aria-hidden>
        <SevaPrasadaCardPrint
          lang={pdfLang}
          identity={identity}
          rhythm={rhythm}
          today={today}
          bestDays={bestDays}
          moneyDays={moneyDays}
          panditName={panditName}
          qrDataUrl={qrDataUrl}
        />
      </div>
    </div>
  );
}
