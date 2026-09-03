import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../ui/Card";
import { nakshatraName, rashiName } from "../../features/seva/sevaPresentation";
import {
  getAllPriests,
  addCustomPriest,
  getPriestProfile,
  type PriestProfile
} from "../../features/seva/sevaPriestDirectory";
import { encodeDevoteeToken } from "../../utils/tokenCipher";
import { getSafeProductionOrigin } from "../../features/seva/icsCalendarGenerator";
import { PriestQrCard1PageTemplate } from "./pdf/PriestQrCard1PageTemplate";

type PriestQrGeneratorTabProps = {
  identity: {
    personName: string;
    gotra?: string;
    rashiIndex?: number;
    nakshatraIndex?: number;
    placeLabel?: string;
    dob?: string;
    tob?: string;
  };
  lang: string;
};

export default function PriestQrGeneratorTab({
  identity,
  lang: initialLang
}: PriestQrGeneratorTabProps): JSX.Element {
  // Language selector state (defaults to app language or kn)
  const [selectedLang, setSelectedLang] = useState<string>(initialLang || "kn");
  const isKn = selectedLang === "kn";

  const [priestsList, setPriestsList] = useState<PriestProfile[]>(() => getAllPriests());
  const [selectedPriestId, setSelectedPriestId] = useState<string>("shreeram-pandit");
  const [durationDays, setDurationDays] = useState<number>(30); // Default 30 Days (1 Month)
  const [includePriestCalendar, setIncludePriestCalendar] = useState<boolean>(false);

  // Direct Editable Priest Name & Phone state
  const [customPriestName, setCustomPriestName] = useState<string>("");
  const [customPriestPhone, setCustomPriestPhone] = useState<string>("");
  const [overridePriestContact, setOverridePriestContact] = useState<boolean>(false);

  // Voice Input Speech Recognition state
  const [listeningField, setListeningField] = useState<"name" | "phone" | null>(null);

  // Custom Priest addition state
  const [customInputMode, setCustomInputMode] = useState<boolean>(false);
  const [newPriestName, setNewPriestName] = useState<string>("");
  const [newPriestPhone, setNewPriestPhone] = useState<string>("+91 99723 39362");

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const activePriest = useMemo(() => {
    return getPriestProfile(selectedPriestId);
  }, [selectedPriestId, priestsList]);

  const defaultPName = activePriest.name[selectedLang as keyof typeof activePriest.name] || activePriest.name.en || activePriest.name.kn;
  const pTitle = activePriest.title[selectedLang as keyof typeof activePriest.title] || activePriest.title.en || activePriest.title.kn;
  const defaultPhone = activePriest.phone || "+91 99723 39362";

  // Keep editable name & phone in sync when priest selection changes (unless user typed a custom one)
  useEffect(() => {
    setCustomPriestName(defaultPName);
    setCustomPriestPhone(defaultPhone);
  }, [selectedPriestId, selectedLang]);

  const resolvedPriestName = customPriestName.trim() || defaultPName;
  const resolvedPriestPhone = customPriestPhone.trim() || defaultPhone;

  const userRashiStr = identity.rashiIndex !== undefined ? rashiName(identity.rashiIndex, selectedLang) : "—";
  const userNakshatraStr = identity.nakshatraIndex !== undefined ? nakshatraName(identity.nakshatraIndex, selectedLang as any) : "—";

  // Speech Recognition (Voice Input) Handler
  const handleVoiceInput = (targetField: "name" | "phone") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(isKn ? "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ." : "Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCodeMap: Record<string, string> = {
        kn: "kn-IN",
        hi: "hi-IN",
        te: "te-IN",
        ta: "ta-IN",
        en: "en-IN"
      };
      recognition.lang = langCodeMap[selectedLang] || "kn-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListeningField(targetField);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          if (targetField === "name") {
            setCustomPriestName(transcript.trim());
          } else {
            // Clean spoken phone numbers
            const cleanedDigits = transcript
              .replace(/[^\d+]/g, "")
              .trim();
            if (cleanedDigits.length >= 5) {
              setCustomPriestPhone(cleanedDigits.startsWith("+") ? cleanedDigits : `+91 ${cleanedDigits}`);
            } else {
              setCustomPriestPhone(transcript.trim());
            }
          }
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setListeningField(null);
      };

      recognition.onend = () => setListeningField(null);

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failure:", err);
      setListeningField(null);
    }
  };

  // Generate dynamic QR code payload encoding duration, language, and priest details
  useEffect(() => {
    const origin = getSafeProductionOrigin();

    const token = encodeDevoteeToken({
      n: identity.personName || "Devotee",
      nk: identity.nakshatraIndex,
      r: identity.rashiIndex,
      g: identity.gotra,
      p: resolvedPriestName,
      d: new Date().toISOString().slice(0, 10),
      days: durationDays,
      l: selectedLang,
      dob: identity.dob,
      tob: identity.tob,
      phone: resolvedPriestPhone,
      overrideCalendarPhone: overridePriestContact,
      includePriestCalendar: includePriestCalendar
    });

    const payloadUrl = `${origin}/daily?token=${token}&action=ics`;

    QRCode.toDataURL(payloadUrl, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: {
        dark: "#78350F",
        light: "#FFFFFF"
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error("QR Generation error:", err);
      });
  }, [durationDays, resolvedPriestName, resolvedPriestPhone, overridePriestContact, identity, selectedLang, includePriestCalendar]);

  const handleAddPriest = () => {
    if (newPriestName.trim()) {
      const added = addCustomPriest(newPriestName.trim(), newPriestPhone.trim());
      setPriestsList(getAllPriests());
      setSelectedPriestId(added.id);
      setCustomPriestName(newPriestName.trim());
      setCustomPriestPhone(newPriestPhone.trim());
      setNewPriestName("");
      setCustomInputMode(false);
    }
  };

  const handleDownload1PagePdf = async () => {
    const container = document.getElementById("priest-qr-card-1page-container");
    if (!container) {
      alert("PDF container not found");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(container, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: "#FFFDF7",
        logging: false
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.88);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      const safeName = (identity.personName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      pdf.save(`Baggona_Priest_QR_Card_${safeName}_${durationDays}Days_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating 1-page A4 PDF card.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ta", label: "தமிழ் (Tamil)" }
  ];

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              📱 {isKn ? "ಪೂಜಾರಿ QR ಕೋಡ್ ಜನರೇಟರ್ & ೧-ಪುಟದ A4 ಕಾರ್ಡ್" : "Priest QR Code Generator & 1-Page A4 Card"}
            </h2>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ಅರ್ಚಕರ ಹೆಸರು, ದೂರವಾಣಿ ಸಂಖ್ಯೆ (ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಬಹುದು 🎙️) ಹಾಗೂ ೧ ರಿಂದ ೧೨ ತಿಂಗಳ ದಿನನಿತ್ಯದ ಸಿದ್ಧ ಪಂಚಾಂಗದ ಆಶೀರ್ವಾದ QR ಕೋಡ್ ಕಾರ್ಡ್ ಸಿದ್ಧಪಡಿಸಿ."
                : "Edit Priest Name, Phone Number (with Voice Mic 🎙️), Duration, and generate 1-Page A4 Printable PDF Card."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload1PagePdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
          >
            <span>📄</span>
            <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "೧-ಪುಟದ A4 PDF ಕಾರ್ಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : "Download 1-Page A4 PDF Card")}</span>
          </button>
        </div>
      </div>

      {/* Control Panel (Language, Priest & Duration Selectors) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Language Selector Dropdown */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🌐 {isKn ? "PDF & QR ಭಾಷೆ (Select Language)" : "PDF & QR Language"}
          </label>
          <div className="space-y-2">
            {languages.map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2.5 rounded-xl border p-2 text-xs font-bold cursor-pointer transition ${
                  selectedLang === l.code
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="qrLang"
                  value={l.code}
                  checked={selectedLang === l.code}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="accent-amber-700"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Priest Selector & Direct Editable Inputs with Mic Voice Support */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🔱 {isKn ? "ಅರ್ಚಕರ ವಿವರಗಳು & ಸಂಪಾದನೆ" : "Priest Selection & Live Edit"}
          </label>

          {!customInputMode ? (
            <div className="space-y-3">
              <select
                value={selectedPriestId}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW") {
                    setCustomInputMode(true);
                  } else {
                    setSelectedPriestId(e.target.value);
                  }
                }}
                className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
              >
                {priestsList.map((p) => {
                  const name = p.name[selectedLang as keyof typeof p.name] || p.name.en || p.name.kn;
                  const phone = p.phone || "+91 99723 39362";
                  return (
                    <option key={p.id} value={p.id}>
                      {p.sealSymbol} {name} ({phone})
                    </option>
                  );
                })}
                <option value="ADD_NEW">➕ {isKn ? "ಹೊಸ ಅರ್ಚಕರನ್ನು ಸೇರಿಸಿ..." : "Add New Priest..."}</option>
              </select>

              {/* Editable Priest Name with Voice Mic */}
              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center justify-between">
                  <span>{isKn ? "ಅರ್ಚಕರ ಹೆಸರು (ಸಂಪಾದಿಸಿ):" : "Priest Name (Editable):"}</span>
                  {listeningField === "name" && (
                    <span className="text-[10px] text-red-600 animate-pulse font-extrabold">🎙️ {isKn ? "ಆಲಿಸಲಾಗುತ್ತಿದೆ..." : "Listening..."}</span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customPriestName}
                    onChange={(e) => setCustomPriestName(e.target.value)}
                    placeholder={isKn ? "ಅರ್ಚಕರ ಹೆಸರು" : "Priest Name"}
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/30 pl-3 pr-10 py-1.5 text-xs font-bold text-amber-950 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ (Mic)" : "Speak Priest Name (Mic)"}
                    onClick={() => handleVoiceInput("name")}
                    className={`absolute right-1.5 p-1 rounded-md transition ${
                      listeningField === "name"
                        ? "bg-red-500 text-white animate-bounce"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* Editable Priest Phone with Voice Mic */}
              <div>
                <label className="block text-[11px] font-bold text-amber-950 mb-1 flex items-center justify-between">
                  <span>{isKn ? "ದೂರವಾಣಿ ಸಂಖ್ಯೆ (ಸಂಪಾದಿಸಿ):" : "Phone Number (Editable):"}</span>
                  {listeningField === "phone" && (
                    <span className="text-[10px] text-red-600 animate-pulse font-extrabold">🎙️ {isKn ? "ಸಂಖ್ಯೆ ಹೇಳಿ..." : "Speak Number..."}</span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customPriestPhone}
                    onChange={(e) => setCustomPriestPhone(e.target.value)}
                    placeholder="+91 99723 39362"
                    className="w-full rounded-lg border border-amber-300 bg-amber-50/30 pl-3 pr-10 py-1.5 text-xs font-bold text-amber-950 focus:border-amber-600 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    title={isKn ? "ಧ್ವನಿ ಮೂಲಕ ಸಂಖ್ಯೆ ಹೇಳಿ (Mic)" : "Speak Phone Number (Mic)"}
                    onClick={() => handleVoiceInput("phone")}
                    className={`absolute right-1.5 p-1 rounded-md transition ${
                      listeningField === "phone"
                        ? "bg-red-500 text-white animate-bounce"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                  >
                    🎙️
                  </button>
                </div>
              </div>

              {/* Checkbox to override calendar & web sanctum contact */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-2.5">
                <label className="flex items-start gap-2 cursor-pointer text-xs font-bold text-amber-950">
                  <input
                    type="checkbox"
                    checked={overridePriestContact}
                    onChange={(e) => setOverridePriestContact(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-700 accent-amber-700 focus:ring-amber-500"
                  />
                  <div>
                    <span>{isKn ? "ಕ್ಯಾಲೆಂಡರ್ & ದರ್ಶನ ಪುಟದಲ್ಲಿ ಈ ಅರ್ಚಕರ ಸಂಪರ್ಕ ತೋರಿಸಿ" : "Override Calendar & Darshana Contact with Priest Details"}</span>
                    <p className="text-[10px] font-normal text-amber-900/80 mt-0.5">
                      {isKn
                        ? "ಆಯ್ಕೆಮಾಡಿದರೆ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿದಾಗ ಕೆಳಭಾಗದಲ್ಲಿ ಈ ಅರ್ಚಕರ ಹೆಸರು ಮತ್ತು ದೂರವಾಣಿ ಸಂಖ್ಯೆ ಕಾಣಿಸುತ್ತದೆ. ಇಲ್ಲದಿದ್ದರೆ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (9972339362) ಇರುತ್ತದೆ."
                        : "When checked, the calendar notification & bottom contact section show this Priest Name & Number instead of default Shreeram Pandit (9972339362)."}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
              <h4 className="text-xs font-bold text-amber-950">➕ {isKn ? "ಹೊಸ ಅರ್ಚಕರ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ" : "Enter New Priest Details"}</h4>
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">{isKn ? "ಅರ್ಚಕರ ಹೆಸರು:" : "Priest Name:"}</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPriestName}
                    onChange={(e) => setNewPriestName(e.target.value)}
                    placeholder={isKn ? "ಉದಾ: ಶ್ರೀ ವೆಂಕಟೇಶ್ ಶರ್ಮಾ" : "e.g. Sri Venkatesh Sharma"}
                    className="w-full rounded-lg border border-amber-300 bg-white pl-3 pr-10 py-1.5 text-xs font-bold text-amber-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("name")}
                    className="absolute right-1.5 p-1 rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200"
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">{isKn ? "ದೂರವಾಣಿ ಸಂಖ್ಯೆ:" : "Phone Number:"}</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newPriestPhone}
                    onChange={(e) => setNewPriestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-amber-300 bg-white pl-3 pr-10 py-1.5 text-xs font-bold text-amber-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleVoiceInput("phone")}
                    className="absolute right-1.5 p-1 rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200"
                  >
                    🎙️
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddPriest}
                  className="flex-1 rounded-lg bg-amber-800 py-2 text-xs font-bold text-white hover:bg-amber-900"
                >
                  {isKn ? "ಉಳಿಸಿ & ಆಯ್ಕೆ ಮಾಡಿ" : "Save & Select"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomInputMode(false)}
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900"
                >
                  {isKn ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Duration Selector Dropdown */}
        <Card className="border border-amber-300/80 bg-white">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            📅 {isKn ? "ಪಂಚಾಂಗ ಅವಧಿ ಆಯ್ಕೆ (Duration)" : "Select Calendar Duration"}
          </label>

          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3.5 py-2.5 text-sm font-bold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
          >
            <option value={30}>🗓️ {isKn ? "೧ ತಿಂಗಳು (೩೦ ದಿನಗಳು)" : "1 Month (30 Days)"}</option>
            <option value={90}>🗓️ {isKn ? "೩ ತಿಂಗಳು (೯೦ ದಿನಗಳು)" : "3 Months (90 Days)"}</option>
            <option value={180}>🗓️ {isKn ? "೬ ತಿಂಗಳು (೧೮೦ ದಿನಗಳು)" : "6 Months (180 Days)"}</option>
            <option value={365}>🗓️ {isKn ? "೧೨ ತಿಂಗಳು (೩೬೫ ದಿನಗಳು - ೧ ಪೂರ್ಣ ವರ್ಷ)" : "12 Months (365 Days - 1 Full Year)"}</option>
          </select>

          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 text-xs text-emerald-950">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚡</span>
              <span>{isKn ? `${durationDays} ದಿನಗಳ ಪ್ರತ್ಯೇಕ ಗಣನೆ ಸಕ್ರಿಯವಾಗಿದೆ` : `${durationDays} Days Individual Computation Active`}</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-900/80">
              {isKn
                ? `ಪ್ರತಿಯೊಂದು ${durationDays} ದಿನಗಳ ಪಂಚಾಂಗವೂ ಪುನರಾವರ್ತನೆ ಇಲ್ಲದೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಗಣನೆ ಮಾಡಲ್ಪಡುತ್ತದೆ.`
                : `Each of the ${durationDays} days Panchanga is computed individually with zero repeated data.`}
            </p>
          </div>

          {/* Priest Calendar Checkbox (Unchecked by default) */}
          <label className="flex items-start gap-3 p-3.5 mt-3 rounded-2xl border-2 border-amber-400 bg-amber-50/80 cursor-pointer shadow-xs hover:bg-amber-100/80 transition">
            <input
              type="checkbox"
              checked={includePriestCalendar}
              onChange={(e) => setIncludePriestCalendar(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-amber-700 focus:ring-amber-500 border-amber-400"
            />
            <div className="text-left flex-1">
              <span className="block text-xs font-black text-amber-950">
                👑 {isKn ? "ಪುರೋಹಿತರ ವಿಶೇಷ ಪಂಚಾಂಗ ಸೇರಿಸಿ (Include Priest Calendar & Detailed Muhurtha Timings)" : "Include Priest Calendar & Detailed Muhurtha Timings"}
              </span>
              <span className="block text-[11px] leading-snug text-amber-900/80 mt-0.5">
                {isKn
                  ? `೧೨ ದಿನ ಲಗ್ನ ಅಂತ್ಯ ಸಮಯಗಳು, ತಿಥಿ-ನಕ್ಷತ್ರ ಅಂತ್ಯ ಕಾಲಾವಧಿ, ಶ್ರಾದ್ಧ ತಿಥಿ, ಎನರ್ಜಿ ಮೀಟರ್ ಮತ್ತು ಕರ್ಮಾನುಷ್ಠಾನ ಮುಹೂರ್ತಗಳನ್ನು ಈ QR ಕೋಡ್‌ನಲ್ಲಿ ಸೇರಿಸುತ್ತದೆ.`
                  : "Includes 12 Dina Lagna ending times, Tithi/Nakshatra transition timings, Shraddha tithi, energy meter, and priest duty reminders."}
              </span>
            </div>
          </label>
        </Card>
      </div>

      {/* Live Preview Container for 1-Page A4 Card */}
      <Card className="overflow-x-auto bg-slate-900/10 p-6 flex flex-col items-center">
        <div className="text-center mb-4">
          <span className="rounded-full bg-amber-800 px-3 py-1 text-xs font-bold text-amber-50 shadow-sm">
            👁️ {isKn ? `೧-ಪುಟದ A4 QR ಕೋಡ್ ಕಾರ್ಡ್ ಲೈವ್ ಮುನ್ನೋಟ (${selectedLang.toUpperCase()})` : `1-Page A4 QR Card Live Preview (${selectedLang.toUpperCase()})`}
          </span>
        </div>

        <div className="shadow-2xl rounded-lg overflow-hidden border border-amber-300 bg-white">
          <PriestQrCard1PageTemplate
            personName={identity.personName}
            rashiName={userRashiStr}
            nakshatraName={userNakshatraStr}
            gotra={identity.gotra}
            priestName={resolvedPriestName}
            priestPhone={resolvedPriestPhone}
            priestTitle={pTitle}
            durationDays={durationDays}
            qrDataUrl={qrDataUrl}
            lang={selectedLang}
          />
        </div>
      </Card>
    </div>
  );
}
