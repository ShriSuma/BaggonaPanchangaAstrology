import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Card from "../components/ui/Card";
import DatePicker from "../components/DatePicker";
import BirthTimePicker from "../components/BirthTimePicker";
import LocationSelector, { type SelectedLocation } from "../components/LocationSelector";
import { useAppStore } from "../stores/appStore";
import { useKundliViewerStore } from "../stores/kundliViewerStore";
import {
  executePalmReading,
  askPalmReadingFollowUp,
  type HandSide,
  type PalmReadingResult
} from "../features/palmreading/palmReadingEngine";
import { PalmReadingPdfTemplate } from "../components/palmreading/PalmReadingPdfTemplate";
import { PalmScannerLoader } from "../components/palmreading/PalmScannerLoader";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { formatRashiAmsha } from "../core/localeNumbers";
import type { PlanetPosition } from "../core/AstroTypes";

type ChatMessage = {
  id: string;
  sender: "user" | "priest";
  text: string;
  result?: PalmReadingResult;
  timestamp: string;
};

export default function PalmReadingPage(): JSX.Element {
  const appLanguage = useAppStore((s) => s.language);
  const geminiApiKey = useAppStore((s) => s.geminiApiKey);
  const defaultLat = useAppStore((s) => s.defaultLat);
  const defaultLng = useAppStore((s) => s.defaultLng);
  const placeLabelStore = useAppStore((s) => s.placeLabel);
  const pincodeStore = useAppStore((s) => s.pincode);
  const ayanamsaModel = useAppStore((s) => s.ayanamsaModel);
  const session = useKundliViewerStore((s) => s.session);

  // Language selector state
  const [selectedLang, setSelectedLang] = useState<string>(appLanguage || "kn");
  const isKn = selectedLang === "kn";

  // Devotee Name & Details Inputs
  const [devoteeName, setDevoteeName] = useState<string>(session?.input?.name || "ಪ್ರಮೋದ್ ಕೊಡಗಿ");
  const [gotraInput, setGotraInput] = useState<string>(session?.input?.gothra || "");

  // Palm Upload Inputs
  const [handSide, setHandSide] = useState<HandSide>("right");
  const [imageDataUrl, setImageDataUrl] = useState<string>("");
  const [followUpInput, setFollowUpInput] = useState<string>("");

  // Kundli Generator Modal States
  const [showKundliModal, setShowKundliModal] = useState<boolean>(false);
  const [birthDatePicker, setBirthDatePicker] = useState<Date | null>(() => new Date(1992, 4, 15));
  const [birthTimeHm, setBirthTimeHm] = useState<string>("08:30");
  const [selectedLoc, setSelectedLoc] = useState<SelectedLocation>({
    stateCode: "KA",
    districtCode: "UK",
    villageName: placeLabelStore || "Gokarna",
    lat: defaultLat,
    lng: defaultLng,
    pincode: pincodeStore || "581326"
  });
  const [generatedKundliData, setGeneratedKundliData] = useState<PalmReadingResult["kundliData"] | undefined>(undefined);

  // General States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<PalmReadingResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle File Selection (Upload or Camera Capture)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಚಿತ್ರ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಿ." : "Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate Kundli from Date/Time inputs using Core Baggona Engine
  const handleGenerateKundliFromPalm = async () => {
    if (!birthDatePicker) {
      alert(isKn ? "ದಯವಿಟ್ಟು ಹುಟ್ಟಿದ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ." : "Please select birth date.");
      return;
    }

    try {
      const year = birthDatePicker.getFullYear();
      const month = String(birthDatePicker.getMonth() + 1).padStart(2, "0");
      const day = String(birthDatePicker.getDate()).padStart(2, "0");
      const birthDateYmd = `${year}-${month}-${day}`;
      const birthTimeFormatted = birthTimeHm.length === 5 ? `${birthTimeHm}:00` : birthTimeHm;

      const kundliOut = await calculateKundliWithPlaceSun({
        name: devoteeName || "Devotee",
        birthDate: birthDateYmd,
        birthTime: birthTimeFormatted,
        latitude: selectedLoc.lat,
        longitude: selectedLoc.lng,
        gothra: gotraInput,
        pincode: selectedLoc.pincode
      });

      const trad = calculateTraditionalBaggona(
        birthDateYmd,
        birthTimeFormatted,
        selectedLoc.lat,
        selectedLoc.lng,
        ayanamsaModel
      );

      const moonPosition = kundliOut.planets.find((p: PlanetPosition) => p.name === "Moon");

      const lagnaDeg = kundliOut.ascendant ?? 15;
      const lagnaRashiStr = kundliOut.lagnaRashi ? (isKn ? kundliOut.lagnaRashi.sanskrit : kundliOut.lagnaRashi.english) : "Mesha";
      const formattedLagna = `${lagnaRashiStr} (${formatRashiAmsha(lagnaDeg, selectedLang)})`;
      
      const maandiRashiStr = kundliOut.maandi ? (isKn ? kundliOut.maandi.rashi.sanskrit : kundliOut.maandi.rashi.english) : "Vrishchika";
      const maandiHouseStr = `${maandiRashiStr} (ಮಾಂದಿ)`;
      
      const dashaStr = trad?.dashaLord ? `${trad.dashaLord} ಮಹಾದಶಾ (${trad.dashaYears || 0} ವರ್ಷ)` : "ಗುರು ಮಹಾದಶಾ";

      const moonRashiStr = kundliOut.moonSign ? (isKn ? kundliOut.moonSign.sanskrit : kundliOut.moonSign.english) : "Simha";
      const moonNakStr = moonPosition?.nakshatra ? (isKn ? moonPosition.nakshatra.sanskrit : moonPosition.nakshatra.english) : "Magha";

      const kData: PalmReadingResult["kundliData"] = {
        lagna: formattedLagna,
        rashi: moonRashiStr,
        nakshatra: `${moonNakStr} (ಪಾದ ${kundliOut.moonPada || 1})`,
        maandi: maandiHouseStr,
        dasha: dashaStr,
        gotra: gotraInput,
        dob: birthDateYmd,
        tob: birthTimeFormatted
      };

      setGeneratedKundliData(kData);
      setShowKundliModal(false);
      alert(isKn ? "✨ ಜನನ ಕುಂಡಲಿ ೧೦೦% ನಿಖರವಾಗಿ ಸಿದ್ಧವಾಗಿದೆ! ಈಗ 'ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಪರಿಶೀಲಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ." : "✨ Janma Kundali generated with 100% accurate Lagna & Maandi! Now click Analyze Palm Reading.");
    } catch (err) {
      console.error("Kundli generation error:", err);
      alert(isKn ? "ಕುಂಡಲಿ ರಚನೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ." : "Error calculating Kundali.");
    }
  };

  // Submit Palm Image for Inspection
  const handleSubmitPalmReading = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageDataUrl) {
      alert(isKn ? "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಸ್ತದ ಫೋಟೋ ತೆಗಿಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ." : "Please capture or upload a palm photo.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await executePalmReading(
        imageDataUrl,
        handSide,
        devoteeName,
        selectedLang,
        geminiApiKey,
        generatedKundliData
      );

      setActiveResult(result);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: isKn
          ? `🖐️ ${handSide === "right" ? "ಬಲ ಹಸ್ತ" : "ಎಡ ಹಸ್ತ"} ಫೋಟೋ ಹಾಗೂ 🔮 ಕುಂಡಲಿ ಪರೀಕ್ಷಿಸಿ.`
          : `🖐️ Inspected ${handSide.toUpperCase()} Hand Palm & Kundali.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const priestMsg: ChatMessage = {
        id: `priest-${Date.now()}`,
        sender: "priest",
        text: result.aiPrediction,
        result,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, userMsg, priestMsg]);
    } catch (err) {
      console.error("Palm reading error:", err);
      alert(isKn ? "ಹಸ್ತ ರೇಖಾ ಪರಿಶೀಲನೆಯಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ." : "Error analyzing palm photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Follow-Up Question
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || !activeResult) return;

    const query = followUpInput.trim();
    setFollowUpInput("");

    const userMsg: ChatMessage = {
      id: `user-followup-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const answer = await askPalmReadingFollowUp(
        activeResult,
        query,
        selectedLang,
        geminiApiKey
      );

      const priestMsg: ChatMessage = {
        id: `priest-followup-${Date.now()}`,
        sender: "priest",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, priestMsg]);
    } catch (err) {
      console.error("Follow-up error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = async () => {
    const container = document.getElementById("palm-reading-pdf-container");
    if (!container) {
      alert("PDF container not found");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFDF7"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeName = (devoteeName || "Devotee").replace(/[^\\p{L}\\p{N}]+/gu, "_");
      pdf.save(`Baggona_Palm_Reading_${safeName}_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error generating PDF.");
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
    <div className="space-y-6 pb-12">
      {/* Title Header Card */}
      <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/60 to-orange-500/10 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold text-amber-950 sm:text-2xl">
              ✋ {isKn ? "ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ (Palm Reading - Vedic Hastarekha Engine)" : "Palm Reading - Vedic Hastarekha Engine"}
            </h1>
            <p className="mt-1 text-xs text-amber-900/80">
              {isKn
                ? "ನಿಮ್ಮ ಹಸ್ತದ ಫೋಟೋ ತೆಗಿಯಿರಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ - ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಸಾಮುದ್ರಿಕ ಗಣಿತದ ಮೂಲಕ ಪೂರ್ಣ ಹಸ್ತ ರೇಖಾ ಹಾಗೂ ಜನನ ಕುಂಡಲಿ ಫಲ ಪಡೆಯಿರಿ."
                : "Capture or upload a photo of your palm to receive an authentic Hastarekha Shastra analysis and Janma Kundali sync."}
            </p>
          </div>

          {activeResult && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
            >
              <span>📄</span>
              <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಹಸ್ತ ರೇಖಾ PDF ವರದಿ ಡೌನ್‌ಲೋಡ್" : "Download Palm PDF Report")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Devotee Name & Language Selector Panel */}
      <Card className="border border-amber-300/80 bg-white p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              👤 {isKn ? "ಭಕ್ತರ ಹೆಸರು (Devotee Name)" : "Devotee Name"}
            </label>
            <input
              type="text"
              value={devoteeName}
              onChange={(e) => setDevoteeName(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಪ್ರಮೋದ್ ಕೊಡಗಿ" : "e.g. Sri Pramod Kodagi"}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1.5">
              🪔 {isKn ? "ಗೋತ್ರ (Gotra - Optional)" : "Gotra (Optional)"}
            </label>
            <input
              type="text"
              value={gotraInput}
              onChange={(e) => setGotraInput(e.target.value)}
              placeholder={isKn ? "ಉದಾ: ಕಶ್ಯಪ / ವಸಿಷ್ಠ" : "e.g. Kashyapa / Vasishta"}
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3.5 py-2 text-sm font-bold text-amber-950 shadow-inner focus:border-amber-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-2">
            🌐 {isKn ? "ಸಂವಾದ & PDF ಭಾಷೆ (Select Language)" : "Select Language"}
          </label>
          <div className="flex flex-wrap gap-3">
            {languages.map((l) => (
              <label
                key={l.code}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                  selectedLang === l.code
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="palmLang"
                  value={l.code}
                  checked={selectedLang === l.code}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="accent-amber-700"
                />
                <span>{l.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Palm Upload, Camera & Kundli Generator Panel */}
      <Card className="border border-amber-300/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Hand Side Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-2">
              🤚 {isKn ? "ಪರಿಶೀಲಿಸುವ ಹಸ್ತ ಆಯ್ಕೆ ಮಾಡಿ (Select Hand)" : "Select Hand to Inspect"}
            </label>
            <div className="flex gap-3">
              <label
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer transition ${
                  handSide === "right"
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <input
                  type="radio"
                  name="handSide"
                  value="right"
                  checked={handSide === "right"}
                  onChange={() => setHandSide("right")}
                  className="accent-amber-700"
                />
                <span>{isKn ? "✋ ಬಲ ಹಸ್ತ (Right Hand - Active)" : "✋ Right Hand (Active)"}</span>
              </label>

              <label
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer transition ${
                  handSide === "left"
                    ? "border-amber-600 bg-amber-100 text-amber-950 shadow-sm"
                    : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                <input
                  type="radio"
                  name="handSide"
                  value="left"
                  checked={handSide === "left"}
                  onChange={() => setHandSide("left")}
                  className="accent-amber-700"
                />
                <span>{isKn ? "🤚 ಎಡ ಹಸ್ತ (Left Hand - Innate)" : "🤚 Left Hand (Innate)"}</span>
              </label>
            </div>
          </div>

          {/* Photo Capture / File Selection / Generate Kundli Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-amber-100 border border-amber-300 px-3.5 py-2.5 text-xs font-bold text-amber-950 hover:bg-amber-200 transition"
            >
              <span>📸</span>
              <span>{isKn ? "ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ತೆಗಿಯಿರಿ" : "Take Photo"}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              <span>📁</span>
              <span>{isKn ? "ಅಪ್‌ಲೋಡ್ ಮಾಡಿ" : "Upload"}</span>
            </button>

            {/* 🔮 Kundli Generator Button */}
            <button
              type="button"
              onClick={() => setShowKundliModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-orange-700 hover:to-amber-800 transition"
            >
              <span>🔮</span>
              <span>{isKn ? "ಕುಂಡಲಿ ರಚಿಸಿ (Generate Birth Kundali)" : "Generate Birth Kundali"}</span>
            </button>
          </div>
        </div>

        {/* Display Generated Kundli Badge if active */}
        {generatedKundliData && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950 font-bold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>
                {isKn
                  ? `ಜನನ ಕುಂಡಲಿ ಸಿದ್ಧವಾಗಿದೆ: ಲಗ್ನ: ${generatedKundliData.lagna} | ರಾಶಿ: ${generatedKundliData.rashi} | ನಕ್ಷತ್ರ: ${generatedKundliData.nakshatra} | ಮಾಂದಿ: ${generatedKundliData.maandi}`
                  : `Kundali Active: Lagna: ${generatedKundliData.lagna} | Rashi: ${generatedKundliData.rashi} | Nakshatra: ${generatedKundliData.nakshatra} | Maandi: ${generatedKundliData.maandi}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGeneratedKundliData(undefined)}
              className="text-[11px] text-rose-700 underline"
            >
              {isKn ? "ತೆರವುಗೊಳಿಸಿ" : "Clear Kundali"}
            </button>
          </div>
        )}

        {/* Live Image Preview & Submit Action */}
        {imageDataUrl && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-4 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={imageDataUrl}
              alt="Palm Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-amber-500 shadow-md"
            />
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5 justify-center sm:justify-start">
                <span>✨</span>
                <span>{isKn ? `ಆಯ್ಕೆಯಾದ ಹಸ್ತ ಫೋಟೋ ಸಿದ್ಧವಾಗಿದೆ (${handSide === "right" ? "ಬಲ ಹಸ್ತ" : "ಎಡ ಹಸ್ತ"})` : `Palm Photo Ready (${handSide.toUpperCase()} Hand)`}</span>
              </div>
              <p className="text-[11px] text-amber-900/80">
                {isKn
                  ? "ಈ ಹಸ್ತದ ಫೋಟೋವನ್ನು ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ ಪರಿಶೀಲಿಸಿ ಪೂರ್ಣ ವರದಿ ಪಡೆಯಲು ಕೆಳಗಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ."
                  : "Click below to analyze this palm image using authentic Vedic Samudrika Shastra rules."}
              </p>
              <button
                type="button"
                onClick={handleSubmitPalmReading}
                disabled={isProcessing}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-6 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🖐️</span>
                <span>{isProcessing ? (isKn ? "⌛ ಹಸ್ತ ರೇಖೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing Palm Lines...") : (isKn ? "ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಪರಿಶೀಲಿಸಿ" : "Analyze Palm Reading")}</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Kundli Generation Form Modal */}
      {showKundliModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-2 border-amber-400 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                <span>🔮</span>
                <span>{isKn ? "ಹಸ್ತ ಆಧರಿತ ಜನನ ಕುಂಡಲಿ ಗಣನೆ" : "Reconstruct Janma Kundali"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowKundliModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1">
                  📅 {isKn ? "ಹುಟ್ಟಿದ ದಿನಾಂಕ (Date of Birth):" : "Date of Birth:"}
                </label>
                <DatePicker selected={birthDatePicker} onChange={setBirthDatePicker} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1">
                  ⏰ {isKn ? "ಹುಟ್ಟಿದ ಸಮಯ (Time of Birth):" : "Time of Birth:"}
                </label>
                <BirthTimePicker value={birthTimeHm} onChange={setBirthTimeHm} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-1">
                  📍 {isKn ? "ಹುಟ್ಟಿದ ಸ್ಥಳ (Place of Birth):" : "Place of Birth:"}
                </label>
                <LocationSelector onChange={setSelectedLoc} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={() => setShowKundliModal(false)}
                className="rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50"
              >
                {isKn ? "ರದ್ದುಗೊಳಿಸಿ" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleGenerateKundliFromPalm}
                className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white shadow hover:bg-amber-900"
              >
                {isKn ? "ಕುಂಡಲಿ ಗಣಿಸಿ & ಸಂಯೋಜಿಸಿ" : "Calculate & Combine Kundali"}
              </button>
            </div>
          </Card>
        </div>
      )}

      
      {/* Animated Palm Scanner Loader during processing */}
      {isProcessing && (
        <div className="my-6 flex justify-center">
          <PalmScannerLoader isKn={isKn} />
        </div>
      )}

      {/* AI Generative Chatbox Timeline & Priest Reading View */}
      {messages.length > 0 && (
        <Card className="border border-amber-300/80 bg-gradient-to-b from-amber-50/30 to-white p-5 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
              <span>💬</span>
              <span>{isKn ? "ಗೋಕರ್ಣ ಹಸ್ತ ರೇಖಾ ಶಾಸ್ತ್ರ ಸಂವಾದ ಹಾಗೂ ಪರಿಹಾರ" : "Gokarna Palm Reading Guidance & Chat"}</span>
            </h3>
            {activeResult && (
              <div className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                {activeResult.handSideLabel[selectedLang] || activeResult.handSideLabel.en} · Score: {activeResult.overallScore}%
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 mb-1 px-1">
                  <span>{msg.sender === "user" ? `👤 ${devoteeName}` : "🕉️ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (Gokarna Priest)"}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl p-4 text-sm leading-relaxed max-w-[90%] shadow-sm ${
                    msg.sender === "user"
                      ? "bg-amber-800 text-amber-50 rounded-br-none"
                      : "bg-amber-50/90 border border-amber-300 text-amber-950 rounded-bl-none font-medium whitespace-pre-wrap"
                  }`}
                >
                  {msg.result?.kundliData && (
                    <div className="mb-3 rounded-xl border border-amber-300 bg-amber-100/80 p-2.5 text-xs text-amber-950 font-bold flex flex-wrap gap-3">
                      <div>🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"} {msg.result.kundliData.lagna}</div>
                      <div>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} {msg.result.kundliData.rashi}</div>
                      <div>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} {msg.result.kundliData.nakshatra}</div>
                      <div>🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"} {msg.result.kundliData.maandi}</div>
                    </div>
                  )}

                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Follow-up Question Input Bar */}
          <form onSubmit={handleSendFollowUp} className="flex gap-2 pt-2 border-t border-amber-200">
            <input
              type="text"
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              placeholder={isKn ? "ಹಸ್ತ ರೇಖೆಯ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ವಿವರಣೆ ಕೇಳಿ..." : "Ask follow-up clarification on this palm reading..."}
              className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-amber-950 shadow-sm focus:border-amber-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isProcessing || !followUpInput.trim()}
              className="rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-900 disabled:opacity-50"
            >
              {isKn ? "ಕೇಳಿ" : "Ask"}
            </button>
          </form>
        </Card>
      )}

      {/* Hidden Container for PDF Rendering */}
      {activeResult && (
        <div className="hidden">
          <PalmReadingPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} />
        </div>
      )}
    </div>
  );
}
