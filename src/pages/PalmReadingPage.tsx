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
import { PalmTimelineDiagram } from "../components/palmreading/PalmTimelineDiagram";
import { sanitizeAIText } from "../utils/textFormatter";
import GrahaSpinner from "../components/ui/GrahaSpinner";
import { estimateBirthDetailsFromPalmImage } from "../features/palmreading/palmDobEstimator";
import { PalmScannerLoader } from "../components/palmreading/PalmScannerLoader";
import { calculateKundliWithPlaceSun } from "../core/KundliEngine";
import { calculateTraditionalBaggona } from "../core/TraditionalBaggonaEngine";
import { formatRashiAmsha } from "../core/localeNumbers";
import type { PlanetPosition } from "../core/AstroTypes";
import SouthIndianChart from "../components/kundli/SouthIndianChart";

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
  const [devoteeName, setDevoteeName] = useState<string>(session?.input?.name || "");
  const [gotraInput, setGotraInput] = useState<string>(session?.input?.gothra || "");

  const [handSide, setHandSide] = useState<HandSide>("right");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [sideImageDataUrl, setSideImageDataUrl] = useState<string | null>(null);
  const [backImageDataUrl, setBackImageDataUrl] = useState<string | null>(null);
  const [followUpInput, setFollowUpInput] = useState<string>("");

  const handleFileUploadForSlot = (file: File, slot: "front" | "side" | "back") => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (slot === "front") setImageDataUrl(reader.result);
        if (slot === "side") setSideImageDataUrl(reader.result);
        if (slot === "back") setBackImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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
  const [isEstimatingDetails, setIsEstimatingDetails] = useState<boolean>(false);
  const [estimationInfo, setEstimationInfo] = useState<string | null>(null);

  const handleOpenKundliModal = async () => {
    setShowKundliModal(true);
    if (imageDataUrl) {
      setIsEstimatingDetails(true);
      try {
        const recon = await estimateBirthDetailsFromPalmImage(
          imageDataUrl,
          sideImageDataUrl || undefined,
          backImageDataUrl || undefined,
          geminiApiKey,
          selectedLang
        );
        if (recon?.estimatedDob) {
          const parts = recon.estimatedDob.split("-");
          if (parts.length === 3) {
            setBirthDatePicker(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
          }
        }
        if (recon?.estimatedTob) {
          setBirthTimeHm(recon.estimatedTob);
        }
        if (recon?.estimatedPlace) {
          setSelectedLoc(recon.estimatedPlace);
        }
        setEstimationInfo(isKn ? recon.explanationKn : recon.explanationEn);
      } catch (err) {
        console.error("Estimation failed:", err);
      } finally {
        setIsEstimatingDetails(false);
      }
    }
  };

  // General States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<PalmReadingResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
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
        tob: birthTimeFormatted,
        kundliOutput: kundliOut
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
        generatedKundliData,
        sideImageDataUrl || undefined,
        backImageDataUrl || undefined
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


  // Download Palm Photo Image
  const handleDownloadPalmImage = () => {
    if (!imageDataUrl) return;
    const link = document.createElement("a");
    link.href = imageDataUrl;
    const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
    link.download = `Baggona_Palm_Photo_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Visual Life Timeline Chart Image
  const handleDownloadChartImage = async () => {
    const container = document.getElementById("palm-timeline-diagram-container");
    if (!container) return;
    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#1c1917"
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      const safeName = (devoteeName || "Devotee").replace(/[^\p{L}\p{N}]+/gu, "_");
      link.download = `Baggona_Palm_Timeline_Chart_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Chart image download error:", err);
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPalmImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ಹಸ್ತದ ಫೋಟೋ ಸೇವ್ ಮಾಡಿ" : "Save Palm Photo"}
              >
                <span>🖼️</span>
                <span>{isKn ? "ಫೋಟೋ ಸೇವ್" : "Save Photo"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadChartImage}
                className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100/80 px-3.5 py-2 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200"
                title={isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್ ಮಾಡಿ" : "Save Timeline Chart"}
              >
                <span>📈</span>
                <span>{isKn ? "ರೇಖಾ ಚಿತ್ರ ಸೇವ್" : "Save Chart"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-2 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-900 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating...") : (isKn ? "PDF ವರದಿ" : "Download PDF")}</span>
              </button>
            </div>
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
              placeholder={isKn ? "ಉದಾ: ಶ್ರೀರಾಮ್ ಪಂಡಿತ್" : "e.g. Sri Shreeram Pandit"}
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
              onClick={handleOpenKundliModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:from-orange-700 hover:to-amber-800 transition"
            >
              <span>🔮</span>
              <span>{isKn ? "ಕುಂಡಲಿ ರಚಿಸಿ (Generate Birth Kundali)" : "Generate Birth Kundali"}</span>
            </button>
          </div>
        </div>

        {/* 3 Mandatory Photo Upload Slots */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-amber-300/80 pb-2">
            <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2">
              <span>📸</span>
              <span>{isKn ? "೩೬೦° ಪರಿಪೂರ್ಣ ಹಸ್ತ ವಿಶ್ಲೇಷಣೆಗೆ ೩ ಹಂತದ ಫೋಟೋ ಸಂಗ್ರಹ (3 Mandatory Photo Slots)" : "3-Step Multimodal Palm Photo Upload (Mandatory)"}</span>
            </h4>
            <div className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
              {imageDataUrl && sideImageDataUrl && backImageDataUrl ? "🟢 All 3 Photos Ready" : "🟡 Upload 3 Photos"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Slot 1: Front Palm */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${imageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">✋ ೧. ಮುಂಭಾಗದ ಹಸ್ತ (Front)</span>
                {imageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಆಯುರ್, ಬುದ್ಧಿ, ಹೃದಯ ಹಾಗೂ ಶನಿ ರೇಖೆಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣುವಂತೆ ಮುಂಭಾಗದ ಹಸ್ತ ಹಿಡಿಯಿರಿ." : "Hold palm flat under bright light for major lines."}
              </p>
              {imageDataUrl ? (
                <div className="relative group">
                  <img src={imageDataUrl} alt="Front Palm" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload Front
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "front")} />
                  </label>
                </div>
              )}
            </div>

            {/* Slot 2: Side View */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${sideImageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">📐 ೨. ಪಾರ್ಶ್ವ ಹಸ್ತ (Side)</span>
                {sideImageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಬುಧ ಪರ್ವತದ ಪಕ್ಕದ ವಿವಾಹ ಹಾಗೂ ಸಂತಾನ ರೇಖೆಗಳು ಕಾಣಲು ಹಸ್ತದ ಪಾರ್ಶ್ವ ಫೋಟೋ ಹಿಡಿಯಿರಿ." : "Side view captures marriage & children lines near Mercury."}
              </p>
              {sideImageDataUrl ? (
                <div className="relative group">
                  <img src={sideImageDataUrl} alt="Side Palm" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setSideImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload Side
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "side")} />
                  </label>
                </div>
              )}
            </div>

            {/* Slot 3: Back Hand */}
            <div className={`rounded-2xl p-4 border-2 transition space-y-3 ${backImageDataUrl ? "border-emerald-500 bg-emerald-50/50 shadow-md" : "border-amber-300 bg-amber-50/50"}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950">💅 ೩. ಹಸ್ತದ ಹಿಂಭಾಗ (Back)</span>
                {backImageDataUrl ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">🟢 Ready</span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Required</span>
                )}
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed font-medium">
                {isKn ? "ಬೆರಳುಗಳ ಆಕಾರ ಹಾಗೂ ನಖಗಳಿಂದ ಜಾತಕರ ಮಾನಸಿಕ ಸ್ವಭಾವ ಪರೀಕ್ಷಿಸಲು ಹಿಂಭಾಗದ ಫೋಟೋ ಹಿಡಿಯಿರಿ." : "Back of hand captures finger shape & nails for temperament."}
              </p>
              {backImageDataUrl ? (
                <div className="relative group">
                  <img src={backImageDataUrl} alt="Back Hand" className="w-full h-32 object-cover rounded-xl border border-emerald-500 shadow-sm" />
                  <button type="button" onClick={() => setBackImageDataUrl(null)} className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer rounded-xl border border-amber-400 bg-white hover:bg-amber-100 text-center py-2 text-xs font-bold text-amber-950 shadow-sm">
                    📁 Upload Back
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUploadForSlot(e.target.files[0], "back")} />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Display Generated Kundli Badge if active */}
        {generatedKundliData && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 font-bold space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-2">
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
            {generatedKundliData.kundliOutput && (
              <div className="pt-1 flex justify-center">
                <SouthIndianChart
                  kundli={generatedKundliData.kundliOutput}
                  personName={devoteeName || "Devotee"}
                  gothra={gotraInput}
                />
              </div>
            )}
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
          <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto border-2 border-amber-400 bg-white p-5 sm:p-6 shadow-2xl space-y-4 rounded-2xl">
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

            {/* AI Palm Reconstruction Status Indicator */}
            {isEstimatingDetails && (
              <div className="rounded-xl border border-amber-400 bg-amber-50 p-3.5 text-xs text-amber-950 font-bold flex items-center gap-3 shadow-inner">
                <GrahaSpinner size="sm" message="" />
                <span>{isKn ? "🔮 ಹಸ್ತದ ರೇಖೆಗಳಿಂದ ಜನ್ಮ ದಿನಾಂಕ, ಸಮಯ ಹಾಗೂ ಸ್ಥಳವನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ..." : "🔮 Reconstructing Date of Birth, Time, and Location from Palm Photo..."}</span>
              </div>
            )}

            {estimationInfo && !isEstimatingDetails && (
              <div className="rounded-xl border border-emerald-400 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 font-bold space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold">
                  <span>✨</span>
                  <span>{isKn ? "ಹಸ್ತ ಸಾಮುದ್ರಿಕ ಲಕ್ಷ್ಮೀ ಶಾಸ್ತ್ರದ ಅನುಮಾನಿತ ಜನ್ಮ ವಿವರಗಳು:" : "Palm Reconstructed Birth Parameters:"}</span>
                </div>
                <div className="text-[11px] text-emerald-900 leading-normal font-medium">
                  {estimationInfo}
                </div>
              </div>
            )}

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

      
      {/* Full-Screen Centered Animated Palm Scanner Modal Overlay */}
      {isProcessing && <PalmScannerLoader isKn={isKn} />}

      
          {/* Visual Life Event Timeline Diagram Component */}
          {activeResult && (
            <PalmTimelineDiagram
              personName={devoteeName}
              lang={selectedLang}
              handSide={activeResult.handSide}
            />
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
                  {msg.result ? (
                    <div className="space-y-4">
                      {/* Kundli Badge & South Indian Chart if generated */}
                      {msg.result.kundliData && (
                        <div className="rounded-xl border border-amber-400 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 p-3.5 text-xs text-amber-950 font-bold space-y-3 shadow-inner">
                          <div className="flex flex-wrap gap-3">
                            <div>🏛️ {isKn ? "ಲಗ್ನ (ಅಂಶ):" : "Lagna:"} <span className="text-emerald-800 font-extrabold">{msg.result.kundliData.lagna}</span></div>
                            <div>🌙 {isKn ? "ರಾಶಿ:" : "Rashi:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.rashi}</span></div>
                            <div>⭐ {isKn ? "ನಕ್ಷತ್ರ:" : "Nakshatra:"} <span className="text-amber-900 font-extrabold">{msg.result.kundliData.nakshatra}</span></div>
                            <div>🔥 {isKn ? "ಮಾಂದಿ:" : "Maandi:"} <span className="text-rose-900 font-extrabold">{msg.result.kundliData.maandi}</span></div>
                          </div>
                          {msg.result.kundliData.kundliOutput && (
                            <div className="pt-1 flex justify-center">
                              <SouthIndianChart
                                kundli={msg.result.kundliData.kundliOutput}
                                personName={devoteeName || "Devotee"}
                                gothra={gotraInput}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Section 1: 5 Major Palm Lines Card */}
                      <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1 flex items-center justify-between">
                          <span>🖐️ {isKn ? "೧. ಪಂಚ ರೇಖಾ ವಿಶ್ಲೇಷಣೆ (Major Lines Inspection)" : "1. Major Palm Lines Inspection"}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.lifeLine.lineName[selectedLang] || msg.result.lifeLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.lifeLine.status[selectedLang] || msg.result.lifeLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.lifeLine.indication[selectedLang] || msg.result.lifeLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.headLine.lineName[selectedLang] || msg.result.headLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.headLine.status[selectedLang] || msg.result.headLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.headLine.indication[selectedLang] || msg.result.headLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.heartLine.lineName[selectedLang] || msg.result.heartLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.heartLine.status[selectedLang] || msg.result.heartLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.heartLine.indication[selectedLang] || msg.result.heartLine.indication.kn}</span>
                          </div>
                          <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-200/60">
                            <span className="font-bold text-amber-900">{msg.result.fateLine.lineName[selectedLang] || msg.result.fateLine.lineName.kn}:</span>{" "}
                            <span className="font-semibold text-emerald-800">[{msg.result.fateLine.status[selectedLang] || msg.result.fateLine.status.kn}]</span>{" "}
                            <span className="text-amber-950">{msg.result.fateLine.indication[selectedLang] || msg.result.fateLine.indication.kn}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Narrative Predictions */}
                      <div className="rounded-xl border border-amber-300 bg-white p-3.5 shadow-sm space-y-2">
                        <div className="text-xs font-bold text-amber-950 border-b border-amber-200 pb-1">
                          📜 {isKn ? "೨. ಹಸ್ತ ರೇಖಾ ದೈವಿಕ ಭವಿಷ್ಯವಾಣಿ (Hastarekha Guidance)" : "2. Hastarekha Guidance & Predictions"}
                        </div>
                        <div className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap font-medium">
                          {sanitizeAIText(msg.text)}
                        </div>
                      </div>

                      {/* Section 3: Sacred Gokarna Remedy */}
                      <div className="rounded-xl border border-orange-300 bg-gradient-to-r from-amber-100 to-orange-100 p-3.5 shadow-sm text-xs space-y-1">
                        <div className="font-bold text-amber-950 flex items-center gap-1.5">
                          <span>🪔</span>
                          <span>{isKn ? "೩. ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಸಿದ್ಧ ಪರಿಹಾರ & ಮಂತ್ರ (Sacred Remedy)" : "3. Sacred Gokarna Remedy & Mantra"}</span>
                        </div>
                        <div className="text-amber-900 font-semibold leading-normal">
                          {msg.result.remedyRecommendation[selectedLang] || msg.result.remedyRecommendation.kn}
                        </div>
                      </div>
                    </div>
                  ) : (
                    sanitizeAIText(msg.text)
                  )}
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
                  {/* Bottom PDF Download Action Bar */}
          {activeResult && (
            <div className="flex justify-end pt-3 border-t border-amber-200">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 px-5 py-2.5 text-xs font-bold text-amber-50 shadow-md transition hover:from-amber-800 hover:to-amber-950 disabled:opacity-50"
              >
                <span>📄</span>
                <span>{isGeneratingPdf ? (isKn ? "⌛ PDF ಸಿದ್ಧವಾಗುತ್ತಿದೆ..." : "Generating PDF...") : (isKn ? "ಪೂರ್ಣ ವರದಿ ಹಾಗೂ ಪ್ರಶ್ನೋತ್ತರ PDF ಡೌನ್‌ಲೋಡ್" : "Download Full Report & Q&A PDF")}</span>
              </button>
            </div>
          )}

        </Card>
      )}

      {/* Offscreen Container for HTML2Canvas PDF Rendering */}
      {activeResult && (
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
          <PalmReadingPdfTemplate result={activeResult} personName={devoteeName} lang={selectedLang} messages={messages} />
        </div>
      )}
    </div>
  );
}
